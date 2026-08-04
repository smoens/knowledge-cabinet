/* Knowledge Cabinet — the clippings tray.
   Raw external articles, fetched and parsed on demand, read at the same
   reading width as any chapter. Nothing here is written into content.js —
   the tray lives only in this browser's IndexedDB until a clipping is
   promoted, at which point promotion just packages a handoff prompt for the
   chapter-authoring step; it never auto-writes a chapter.

   Parsing goes through Jina AI's free "Reader" proxy (https://r.jina.ai/),
   which fetches a URL server-side and returns clean markdown. It is
   CORS-enabled (reflects the calling origin), so this file calls it directly
   with plain fetch() — no server of our own to run, no build step, no
   dependency. Free tier is rate-limited to ~20 requests/minute per IP. */
(function () {
  'use strict';

  var DB_NAME = 'cabinet-clippings';
  var DB_VERSION = 1;
  var STORE = 'items';
  var READER = 'https://r.jina.ai/';

  /* ── IndexedDB, promise-wrapped ──────────────────────────────────────── */
  var dbPromise = null;
  function openDb() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve, reject) {
      if (!window.indexedDB) { reject(new Error('This browser has no local storage for clippings.')); return; }
      var req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = function () {
        var db = req.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' });
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error || new Error('Could not open the clippings store.')); };
    });
    return dbPromise;
  }
  function store(mode) {
    return openDb().then(function (db) { return db.transaction(STORE, mode).objectStore(STORE); });
  }
  function wrap(req) {
    return new Promise(function (resolve, reject) {
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error || new Error('Clippings store request failed.')); };
    });
  }
  function list() {
    return store('readonly').then(function (s) { return wrap(s.getAll()); })
      .then(function (items) { return items.sort(function (a, b) { return (b.addedAt || 0) - (a.addedAt || 0); }); });
  }
  function get(id) { return store('readonly').then(function (s) { return wrap(s.get(id)); }); }
  function put(item) { return store('readwrite').then(function (s) { return wrap(s.put(item)); }).then(function () { return item; }); }
  function remove(id) { return store('readwrite').then(function (s) { return wrap(s.delete(id)); }); }

  /* ── Small helpers ────────────────────────────────────────────────────── */
  function normalizeUrl(u) {
    u = String(u || '').trim();
    if (!u) return '';
    if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
    return u;
  }
  function hostOf(u) {
    try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return ''; }
  }
  function idFor(u) {
    var h = 0;
    for (var i = 0; i < u.length; i++) h = (h * 31 + u.charCodeAt(i)) | 0;
    return 'c' + Math.abs(h).toString(36) + Date.now().toString(36).slice(-4);
  }
  // Loose equality key for duplicate detection: ignore scheme, "www.", and
  // a trailing slash, since https://x.com/a and http://www.x.com/a/ are the
  // same article to a reader even though normalizeUrl() keeps them distinct.
  function dedupeKey(u) {
    try {
      var p = new URL(u);
      var host = p.hostname.replace(/^www\./i, '').toLowerCase();
      var path = p.pathname.replace(/\/+$/, '') || '/';
      return host + path + p.search;
    } catch (e) { return String(u || '').toLowerCase(); }
  }
  function findByUrl(url) {
    return list().then(function (items) {
      var key = dedupeKey(url);
      return items.filter(function (it) { return it.status !== 'promoted'; })
        .find(function (it) { return dedupeKey(it.url) === key; }) || null;
    });
  }

  /* ── Fetch + parse via the reader proxy ──────────────────────────────── */
  function fetchParsed(url) {
    return fetch(READER + url).then(function (res) {
      if (res.status === 429) throw new Error('The free reader is rate-limited to about 20 fetches a minute. Try again shortly.');
      if (!res.ok) throw new Error('Could not fetch that article (' + res.status + ').');
      return res.text();
    }).then(function (raw) { return parseReaderText(raw, url); });
  }
  var MAX_MARKDOWN_CHARS = 400000; // ~400KB of text is generous for any article; caps memory/IndexedDB pressure
  function parseReaderText(raw, url) {
    var title = '', published = '', body = raw;
    var mTitle = /^Title:\s*(.*)$/m.exec(raw); if (mTitle) title = mTitle[1].trim();
    var mPub = /^Published Time:\s*(.*)$/m.exec(raw); if (mPub) published = mPub[1].trim();
    var idx = raw.indexOf('Markdown Content:');
    if (idx >= 0) body = raw.slice(idx + 'Markdown Content:'.length).trim();
    if (!title) title = hostOf(url) || url;
    var excerpt = body.replace(/[#*`>_\[\]!]/g, '').replace(/\s+/g, ' ').trim().slice(0, 220);
    var words = body.split(/\s+/).filter(Boolean).length;
    if (body.length > MAX_MARKDOWN_CHARS) body = body.slice(0, MAX_MARKDOWN_CHARS) + '\n\n> *(clipped — the article ran longer than this tray keeps in full)*';
    return { title: title, published: published, markdown: body, excerpt: excerpt, words: words };
  }

  /* ── Public API ───────────────────────────────────────────────────────── */
  // A discard can land while a fetch is still in flight; without this guard
  // the fetch's eventual put() would resurrect the deleted record. Only
  // write the settled result back if the item is still there.
  function writeIfPresent(item) {
    return get(item.id).then(function (existing) { return existing ? put(item) : item; });
  }
  function add(rawUrl, note) {
    var url = normalizeUrl(rawUrl);
    if (!url) return Promise.reject(new Error('Paste an article URL first.'));
    return findByUrl(url).then(function (existing) {
      if (existing) {
        var dupErr = new Error('That article is already in the tray.');
        dupErr.duplicate = existing;
        throw dupErr;
      }
      var item = {
        id: idFor(url), url: url, host: hostOf(url), note: note || '',
        title: hostOf(url) || url, status: 'fetching', addedAt: Date.now(), readAt: null, error: ''
      };
      return put(item).then(function () {
        return fetchParsed(url).then(function (parsed) {
          item.title = parsed.title; item.published = parsed.published;
          item.markdown = parsed.markdown; item.excerpt = parsed.excerpt; item.words = parsed.words;
          item.status = 'unread';
          return writeIfPresent(item);
        }).catch(function (err) {
          // If we got this far because the *store* rejected (e.g. quota
          // exceeded) rather than the fetch, item.markdown may already be a
          // huge string — drop it so the small error record can actually be
          // written and the row doesn't get stuck in "fetching" forever.
          delete item.markdown;
          item.status = 'error'; item.error = err.message || String(err);
          return writeIfPresent(item).then(function () { throw err; });
        });
      });
    });
  }
  function retry(id) {
    return get(id).then(function (item) {
      if (!item) throw new Error('That clipping is gone.');
      item.status = 'fetching'; item.error = '';
      return put(item).then(function () {
        return fetchParsed(item.url).then(function (parsed) {
          item.title = parsed.title; item.published = parsed.published;
          item.markdown = parsed.markdown; item.excerpt = parsed.excerpt; item.words = parsed.words;
          item.status = 'unread';
          return writeIfPresent(item);
        }).catch(function (err) {
          delete item.markdown;
          item.status = 'error'; item.error = err.message || String(err);
          return writeIfPresent(item).then(function () { throw err; });
        });
      });
    });
  }
  function markRead(id, read) {
    return get(id).then(function (item) {
      if (!item) return null;
      item.status = read === false ? 'unread' : 'read';
      item.readAt = read === false ? null : Date.now();
      return put(item);
    });
  }
  function promote(id) {
    return get(id).then(function (item) {
      if (!item) return null;
      item.status = 'promoted'; item.promotedAt = Date.now();
      return put(item).then(function () { return item; });
    });
  }
  function handoff(item) {
    return [
      'Draft a Knowledge Cabinet chapter from this clipping using the chapter-authoring skill.',
      'Title: ' + item.title,
      'Source URL: ' + item.url,
      item.note ? 'My note: ' + item.note : '',
      '',
      'Write blocks at all four depths (spine/working/full/source), give every named idea a',
      'concepts[] entry with an inline [[id]] mention, bridge to existing concepts via seeAlso,',
      'include at least one prompt block, and cite this URL in sources[]. The wording should be',
      'the drawer\u2019s own, not a copy of the source text below.',
      '',
      '--- parsed article text (for reference only, do not quote at length) ---',
      item.markdown || ''
    ].filter(function (l) { return l !== undefined; }).join('\n');
  }

  /* ── Tiny markdown → HTML, just enough for reader-proxy output ───────── */
  // URLs (esp. Wikipedia's) often contain one nested "(paren)" pair, e.g.
  // .../wiki/Reading_(process) — a plain [^)]+ capture truncates at that
  // inner ")", so allow one level of balanced parens in the destination.
  var DEST = '\\(((?:[^()]|\\([^()]*\\))*)\\)';
  function link(text, dest) {
    // Markdown allows an optional "title" after the URL: [x](url "title").
    var m = /^(\S+)(?:\s+"([^"]*)")?$/.exec(String(dest).trim());
    var href = (m ? m[1] : dest).replace(/"/g, '%22');
    // Fetched markdown is untrusted: reject javascript:/data:/etc so a
    // crafted link can't execute on click. Only http(s)/mailto get an <a>.
    if (!/^(https?:|mailto:)/i.test(href)) return text;
    var title = m && m[2] ? ' title="' + m[2].replace(/"/g, '&quot;') + '"' : '';
    return '<a href="' + href + '"' + title + ' target="_blank" rel="noopener">' + text + '</a>';
  }
  function mdInline(s) {
    s = String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    s = s.replace(new RegExp('!\\[([^\\]]*)\\]' + DEST, 'g'), ''); // drop images, keep prose flowing
    s = s.replace(new RegExp('\\[\\[([^\\]]+)\\]\\]' + DEST, 'g'), function (all, text, dest) { return link('[' + text + ']', dest); }); // wiki-style [[1]](url) footnotes
    s = s.replace(new RegExp('\\[([^\\]]+)\\]' + DEST, 'g'), function (all, text, dest) { return link(text, dest); });
    s = s.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
    s = s.replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, '$1<i>$2</i>');
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
    return s;
  }
  function toHtml(markdown) {
    var lines = String(markdown || '').replace(/\r\n/g, '\n').split('\n');
    var html = '', para = [], inList = false;
    function flushPara() { if (para.length) { html += '<p class="blk">' + mdInline(para.join(' ')) + '</p>'; para = []; } }
    function closeList() { if (inList) { html += '</ul>'; inList = false; } }
    lines.forEach(function (line) {
      var t = line.trim();
      if (!t) { flushPara(); closeList(); return; }
      var h = /^(#{1,3})\s+(.*)$/.exec(t);
      if (h) { flushPara(); closeList(); var tag = h[1].length === 1 ? 'h2' : 'h3'; html += '<' + tag + ' class="blk">' + mdInline(h[2]) + '</' + tag + '>'; return; }
      if (/^>\s?/.test(t)) { flushPara(); closeList(); html += '<div class="aside blk">' + mdInline(t.replace(/^>\s?/, '')) + '</div>'; return; }
      var li = /^[-*]\s+(.*)$/.exec(t) || /^\d+\.\s+(.*)$/.exec(t);
      if (li) { flushPara(); if (!inList) { html += '<ul class="blk">'; inList = true; } html += '<li>' + mdInline(li[1]) + '</li>'; return; }
      para.push(t);
    });
    flushPara(); closeList();
    return html || '<p class="blk">(No readable text came back for this article.)</p>';
  }

  window.Clip = {
    list: list, get: get, add: add, remove: remove,
    retry: retry, markRead: markRead, promote: promote,
    handoff: handoff, render: toHtml, hostOf: hostOf
  };
})();
