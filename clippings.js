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
  function escHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function mdInline(s) {
    s = escHtml(s);
    // Pull inline code out first (as opaque placeholders) so link/emphasis
    // rules below never see inside a `code span` — otherwise `a[i] *n*`
    // would come out of the code span with a stray <i> baked into it.
    var codeSpans = [];
    s = s.replace(/`([^`]+)`/g, function (all, code) {
      codeSpans.push(code);
      return '\u0000' + (codeSpans.length - 1) + '\u0000';
    });
    s = s.replace(new RegExp('!\\[([^\\]]*)\\]' + DEST, 'g'), ''); // drop images, keep prose flowing
    s = s.replace(new RegExp('\\[\\[([^\\]]+)\\]\\]' + DEST, 'g'), function (all, text, dest) { return link('[' + text + ']', dest); }); // wiki-style [[1]](url) footnotes
    s = s.replace(new RegExp('\\[([^\\]]+)\\]' + DEST, 'g'), function (all, text, dest) { return link(text, dest); });
    s = s.replace(/~~([^~]+)~~/g, '<s>$1</s>');
    s = s.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
    s = s.replace(/__([^_]+)__/g, '<b>$1</b>');
    s = s.replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, '$1<i>$2</i>');
    // Underscore italics, CommonMark-style: only at a word boundary, so
    // "snake_case_name" is left alone but "_word_" still italicizes.
    s = s.replace(/(^|[^\w_])_([^\s_][^_]*?)_(?![\w_])/g, '$1<i>$2</i>');
    s = s.replace(/\u0000(\d+)\u0000/g, function (all, idx) { return '<code>' + codeSpans[+idx] + '</code>'; });
    return s;
  }
  // A GFM table row: "| a | b |" or "a | b" (leading/trailing pipes optional).
  // Cells can't themselves contain "|" here since the reader proxy never
  // escapes them — good enough for the tables articles actually ship.
  function splitTableRow(line) {
    var t = line.trim().replace(/^\|/, '').replace(/\|\s*$/, '');
    return t.split('|').map(function (c) { return c.trim(); });
  }
  var TABLE_SEP = /^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?$/;
  // The Jina reader proxy scrapes the *rendered* page, not the article's raw
  // markdown source. When a host (e.g. GitHub) renders a ```mermaid fence
  // client-side into an SVG before Jina sees it, the fence markers are gone
  // by the time we get the text — only the bare diagram source remains,
  // unindented header and all, butted straight up against the next prose
  // line with no blank line between them. Recognize the handful of mermaid
  // diagram-type declarations (as a whole line, not a word inside a
  // sentence) so that content still becomes a real diagram instead of
  // getting run into the following paragraph.
  var MERMAID_HEAD = /^(?:(?:flowchart|graph)\s+(?:TB|TD|BT|RL|LR)|sequenceDiagram|classDiagram(?:-v2)?|stateDiagram(?:-v2)?|erDiagram|journey|gantt|pie(?:\s+showData)?(?:\s+title\s+.+)?|gitGraph(?:\s*:.*)?|mindmap|timeline|quadrantChart|sankey-beta|block-beta|requirementDiagram|C4(?:Context|Container|Component|Dynamic|Deployment)|xychart-beta)$/;
  var MERMAID_BODY_HINT = /(-->|->>|-\.->|==>|--[ox]>?|:::|^end$|^subgraph\b|^participant\b|^class\b|^state\b|^note\b)/i;
  function toHtml(markdown) {
    var lines = String(markdown || '').replace(/\r\n/g, '\n').split('\n');
    var html = '', para = [], inList = false;
    function flushPara() { if (para.length) { html += '<p class="blk">' + mdInline(para.join(' ')) + '</p>'; para = []; } }
    function closeList() { if (inList) { html += '</ul>'; inList = false; } }
    var i = 0;
    while (i < lines.length) {
      var t = lines[i].trim();

      // Fenced code block: ```lang ... ``` — kept verbatim, never run through
      // mdInline, so pipes/asterisks/backticks inside code print as typed.
      // A ```mermaid fence renders as a live diagram (see renderMermaid()).
      var fence = /^```\s*([\w-]*)\s*$/.exec(t);
      if (fence) {
        flushPara(); closeList();
        var lang = fence[1].toLowerCase();
        var code = [];
        i++;
        while (i < lines.length && lines[i].trim() !== '```') { code.push(lines[i]); i++; }
        i++; // skip the closing fence (or run off the end if it was never closed)
        var raw = code.join('\n');
        html += lang === 'mermaid'
          ? '<pre class="mermaid blk">' + escHtml(raw) + '</pre>'
          : '<pre class="blk"><code>' + escHtml(raw) + '</code></pre>';
        continue;
      }

      // Fence-less mermaid: a line that's a whole-line diagram-type
      // declaration (see MERMAID_HEAD above), with its own line already
      // unindented same as here. Swallow indented / arrow-syntax lines that
      // follow as the diagram body, stopping at the first line that looks
      // like ordinary unindented prose.
      if (MERMAID_HEAD.test(t)) {
        flushPara(); closeList();
        var diagram = [t];
        i++;
        while (i < lines.length) {
          var rawLine = lines[i];
          var bodyT = rawLine.trim();
          if (!bodyT) break;
          if (!/^\s/.test(rawLine) && !MERMAID_BODY_HINT.test(bodyT)) break;
          diagram.push(bodyT);
          i++;
        }
        html += '<pre class="mermaid blk">' + escHtml(diagram.join('\n')) + '</pre>';
        continue;
      }

      // GFM table: a row containing "|", followed by a "|---|---|" rule.
      if (t.indexOf('|') >= 0 && i + 1 < lines.length && TABLE_SEP.test(lines[i + 1].trim())) {
        flushPara(); closeList();
        var head = splitTableRow(t);
        i += 2;
        var rows = [];
        while (i < lines.length && lines[i].trim() && lines[i].indexOf('|') >= 0) { rows.push(splitTableRow(lines[i])); i++; }
        html += '<table class="blk"><thead><tr>' +
          head.map(function (c) { return '<th>' + mdInline(c) + '</th>'; }).join('') + '</tr></thead>';
        if (rows.length) {
          html += '<tbody>' + rows.map(function (r) {
            return '<tr>' + r.map(function (c) { return '<td>' + mdInline(c) + '</td>'; }).join('') + '</tr>';
          }).join('') + '</tbody>';
        }
        html += '</table>';
        continue;
      }

      if (!t) { flushPara(); closeList(); i++; continue; }
      // Thematic break: 3+ of the same rule character, spaces allowed
      // between them ("---", "***", "___", "- - -"), and nothing else.
      if (/^(-{3,}|\*{3,}|_{3,})$/.test(t.replace(/\s+/g, '')) && /^[-*_\s]+$/.test(t)) { flushPara(); closeList(); html += '<hr class="blk">'; i++; continue; }
      var h = /^(#{1,6})\s+(.*)$/.exec(t);
      if (h) { flushPara(); closeList(); var tag = h[1].length === 1 ? 'h2' : 'h3'; html += '<' + tag + ' class="blk">' + mdInline(h[2]) + '</' + tag + '>'; i++; continue; }
      if (/^>\s?/.test(t)) { flushPara(); closeList(); html += '<div class="aside blk">' + mdInline(t.replace(/^>\s?/, '')) + '</div>'; i++; continue; }
      var li = /^[-*]\s+(.*)$/.exec(t) || /^\d+\.\s+(.*)$/.exec(t);
      if (li) {
        flushPara(); if (!inList) { html += '<ul class="blk">'; inList = true; }
        var task = /^\[([ xX])\]\s+(.*)$/.exec(li[1]);
        html += task
          ? '<li class="task"><input type="checkbox" disabled' + (task[1] !== ' ' ? ' checked' : '') + '>' + mdInline(task[2]) + '</li>'
          : '<li>' + mdInline(li[1]) + '</li>';
        i++; continue;
      }
      para.push(t);
      i++;
    }
    flushPara(); closeList();
    return html || '<p class="blk">(No readable text came back for this article.)</p>';
  }

  /* ── Mermaid diagrams, loaded on demand ──────────────────────────────── *
   * Clippings come from arbitrary external articles, so a ```mermaid``` fence
   * is rendered above as escaped source in a <pre class="mermaid">. Turning
   * that into an actual diagram needs the mermaid library, which this file
   * (already the internet-facing half of the app) loads lazily from a CDN —
   * only when a clipping actually contains one, never as a page dependency. */
  var MERMAID_SRC = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
  var mermaidReady = null;
  function ensureMermaid() {
    if (mermaidReady) return mermaidReady;
    mermaidReady = new Promise(function (resolve, reject) {
      if (window.mermaid) { resolve(window.mermaid); return; }
      var s = document.createElement('script');
      s.src = MERMAID_SRC;
      s.onload = function () {
        if (!window.mermaid) { reject(new Error('Mermaid loaded but did not attach itself.')); return; }
        // strict: diagram text is untrusted external content, not our own prose.
        window.mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: 'neutral' });
        resolve(window.mermaid);
      };
      s.onerror = function () { reject(new Error('Could not load the diagram renderer (offline?).')); };
      document.head.appendChild(s);
    });
    return mermaidReady;
  }
  function renderMermaid(container) {
    var nodes = container && container.querySelectorAll ? Array.prototype.slice.call(container.querySelectorAll('pre.mermaid')) : [];
    if (!nodes.length) return Promise.resolve();
    return ensureMermaid().then(function (mermaid) {
      return mermaid.run({ nodes: nodes });
    }).catch(function (err) {
      // Leave the raw diagram source visible (already legible in the <pre>)
      // and note why it isn't a picture, rather than failing the whole page.
      nodes.forEach(function (n) {
        if (!n.querySelector('.mermaid-note')) {
          var note = document.createElement('div');
          note.className = 'mermaid-note';
          note.textContent = err.message || 'Could not render this diagram.';
          n.appendChild(note);
        }
      });
    });
  }

  window.Clip = {
    list: list, get: get, add: add, remove: remove,
    retry: retry, markRead: markRead, promote: promote,
    handoff: handoff, render: toHtml, hostOf: hostOf,
    renderMermaid: renderMermaid
  };
})();
