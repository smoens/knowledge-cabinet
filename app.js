/* Knowledge Cabinet — the cabinet's working parts.
   Classic script, no build step, no dependencies. State in localStorage. */
(function () {
  'use strict';

  var BOOK = window.BOOK;
  var KEY = 'livingbook.v1';
  var TODAY = new Date().toISOString().slice(0, 10);
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var EXTENT = [
    null,
    { name: 'Spine', note: 'The claim and nothing else.' },
    { name: 'Working', note: 'Enough to use it tomorrow.' },
    { name: 'Full', note: 'Mechanism, figures, prompts.' },
    { name: 'Source', note: 'Caveats, code, provenance.' }
  ];

  /* ── State ──────────────────────────────────────────────────────────── */
  var S = load();

  function blank() {
    return {
      extent: 3, lamp: 0, focus: [], enc: 'size', sort: 'mag', kind: 'all', key: true,
      read: {}, met: {}, cards: {}, days: {}, log: [], provisional: {}, lastOpen: null
    };
  }
  function load() {
    try {
      var raw = JSON.parse(localStorage.getItem(KEY));
      if (!raw || typeof raw !== 'object') return blank();
      var d = blank();
      for (var k in d) if (raw[k] !== undefined) d[k] = raw[k];
      return d;
    } catch (e) { return blank(); }
  }
  var saveTimer = null;
  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {}
    }, 220);
  }
  function logEvent(kind, label, meta) {
    S.log.unshift({ t: Date.now(), kind: kind, label: label, meta: meta || '' });
    if (S.log.length > 60) S.log.length = 60;
  }

  /* ── Index ──────────────────────────────────────────────────────────── */
  var C = {}, A = {}, CH = {};
  BOOK.concepts.forEach(function (c) { C[c.id] = c; });
  BOOK.areas.forEach(function (a) { A[a.id] = a; });
  BOOK.chapters.forEach(function (c) { CH[c.id] = c; });

  var REF = /\[\[([a-z0-9-]+)(?:\|([^\]]+))?\]\]/g;
  var mentions = {};   // conceptId -> [chapterId]
  var chapterOf = {};  // chapterId -> [conceptId]
  var freq = {};

  BOOK.chapters.forEach(function (ch) {
    var seen = {};
    function scan(text) {
      var m;
      REF.lastIndex = 0;
      while ((m = REF.exec(text))) {
        var id = m[1];
        if (!C[id]) continue;
        freq[id] = (freq[id] || 0) + 1;
        if (!seen[id]) { seen[id] = 1; (mentions[id] = mentions[id] || []).push(ch.id); }
      }
    }
    scan(ch.summary || '');
    ch.blocks.forEach(function (b) {
      scan((b.x || '') + ' ' + (b.items || []).join(' ') + ' ' + (b.q || '') + ' ' + (b.a || ''));
      if (b.concept && C[b.concept]) {
        freq[b.concept] = (freq[b.concept] || 0) + 1;
        if (!seen[b.concept]) { seen[b.concept] = 1; (mentions[b.concept] = mentions[b.concept] || []).push(ch.id); }
      }
    });
    chapterOf[ch.id] = Object.keys(seen);
  });

  var degree = {};
  BOOK.concepts.forEach(function (c) {
    degree[c.id] = degree[c.id] || 0;
    (c.seeAlso || []).forEach(function (o) {
      if (!C[o]) return;
      degree[c.id]++; degree[o] = (degree[o] || 0) + 1;
    });
  });

  var maxF = 1, maxD = 1;
  BOOK.concepts.forEach(function (c) {
    maxF = Math.max(maxF, freq[c.id] || 0);
    maxD = Math.max(maxD, degree[c.id] || 0);
  });
  function magnitude(id) {
    var f = (freq[id] || 0) / maxF, d = (degree[id] || 0) / maxD;
    var reach = ((mentions[id] || []).length) / Math.max(1, BOOK.chapters.length);
    return Math.min(1, 0.46 * f + 0.34 * d + 0.20 * reach);
  }
  var MAG = {};
  BOOK.concepts.forEach(function (c) { MAG[c.id] = magnitude(c.id); });
  function tier(id) { var m = MAG[id]; return m >= 0.62 ? 4 : m >= 0.38 ? 3 : m >= 0.18 ? 2 : 1; }
  var INK = {
    tech:  { g: '#c8402f', t: '#8f2a1d' },
    comm:  { g: '#d98a1f', t: '#8a5507' },
    learn: { g: '#2e8f74', t: '#1d6151' },
    mem:   { g: '#3f74c8', t: '#2b4f8c' },
    think: { g: '#8455c9', t: '#5b3691' }
  };
  function ink(areaId, text) { var e = INK[areaId] || { g: '#c9962f', t: '#8a6a2a' }; return text ? e.t : e.g; }

  var WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
  function spell(n) { var w = WORDS[n] || String(n); return w.charAt(0).toUpperCase() + w.slice(1); }
  function lede() {
    return spell(BOOK.chapters.length) + ' drawers so far, ' +
      BOOK.concepts.length + ' catalogued specimens, and no first page. ' +
      'Pull whatever is standing open, set how much of it you want, and drill any name you do not fully own yet.';
  }

  /* ── Small helpers ──────────────────────────────────────────────────── */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function icon(id, cls) { return '<svg class="' + (cls || 'ic') + '" aria-hidden="true"><use href="#' + id + '"></use></svg>'; }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : (many || one + 's')); }
  function ago(iso) {
    var d = Math.round((Date.now() - new Date(iso + 'T00:00:00').getTime()) / 864e5);
    if (d <= 0) return 'today';
    if (d === 1) return 'yesterday';
    if (d < 30) return d + ' days ago';
    if (d < 60) return 'last month';
    return Math.round(d / 30) + ' months ago';
  }
  function toast(msg) {
    var t = $('#toast');
    t.innerHTML = icon('i-check') + '<span>' + esc(msg) + '</span>';
    t.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.hidden = true; }, 2400);
  }

  /* Turn [[concept]] markup into buttons whose weight encodes importance. */
  function rich(s) {
    var outHtml = '', last = 0, m;
    REF.lastIndex = 0;
    var src = String(s);
    while ((m = REF.exec(src))) {
      outHtml += esc(src.slice(last, m.index));
      var id = m[1], label = m[2] || (C[id] ? C[id].term : id);
      if (C[id]) {
        outHtml += '<button class="term w' + tier(id) + '" data-c="' + id + '" style="--t:' +
          ink(C[id].area, true) + '" title="' + esc(C[id].short) + '">' + esc(label) + '</button>';
      } else { outHtml += esc(label); }
      last = m.index + m[0].length;
    }
    return outHtml + esc(src.slice(last));
  }

  /* ── Reading progress ───────────────────────────────────────────────── */
  function progress(chId) {
    var ch = CH[chId], r = S.read[chId];
    if (!ch || !r) return 0;
    var total = ch.blocks.filter(function (b) { return b.d <= 3; }).length || 1;
    return Math.min(1, Object.keys(r.blocks || {}).length / total);
  }
  function touch(chId) {
    var r = S.read[chId] || (S.read[chId] = { blocks: {}, seconds: 0, opens: 0 });
    r.opens++; r.lastAt = Date.now(); return r;
  }
  function markBlock(chId, i) {
    var r = S.read[chId] || (S.read[chId] = { blocks: {}, seconds: 0, opens: 0 });
    if (!r.blocks[i]) { r.blocks[i] = 1; save(); }
  }
  function meet(id) {
    var m = S.met[id] || (S.met[id] = { n: 0 });
    m.n++; m.at = Date.now(); save();
  }

  /* ── Spaced repetition (SM-2, trimmed) ──────────────────────────────── */
  function cardKey(kind, ref) { return kind + ':' + ref; }
  function ensureCard(kind, ref, q, a, src) {
    var k = cardKey(kind, ref);
    if (S.cards[k]) return S.cards[k];
    S.cards[k] = { k: k, kind: kind, ref: ref, q: q, a: a, src: src || '', ease: 2.4, ivl: 0, reps: 0, lapses: 0, due: Date.now() };
    save(); return S.cards[k];
  }
  function dueCards() {
    var now = Date.now();
    return Object.keys(S.cards).map(function (k) { return S.cards[k]; })
      .filter(function (c) { return c.due <= now; })
      .sort(function (a, b) { return a.due - b.due; });
  }
  function grade(card, g) {
    if (g === 0) { card.lapses++; card.reps = 0; card.ivl = 0; card.ease = Math.max(1.3, card.ease - 0.2); card.due = Date.now() + 6e5; }
    else {
      if (g === 1) card.ease = Math.max(1.3, card.ease - 0.15);
      if (g === 3) card.ease = Math.min(2.9, card.ease + 0.13);
      card.reps++;
      if (card.reps === 1) card.ivl = g === 3 ? 3 : 1;
      else if (card.reps === 2) card.ivl = g === 1 ? 2 : g === 3 ? 8 : 4;
      else card.ivl = Math.round(card.ivl * card.ease * (g === 1 ? 0.62 : g === 3 ? 1.32 : 1));
      card.ivl = Math.max(1, card.ivl);
      card.due = Date.now() + card.ivl * 864e5;
    }
    card.last = Date.now();
    save();
  }

  /* ── Time on the table ──────────────────────────────────────────────── */
  var clock = null, clockCh = null;
  function startClock(chId) {
    stopClock(); clockCh = chId;
    clock = setInterval(function () {
      if (document.hidden) return;
      var r = S.read[clockCh]; if (!r) return;
      r.seconds = (r.seconds || 0) + 5;
      S.days[TODAY] = (S.days[TODAY] || 0) + 5;
      save();
    }, 5000);
  }
  function stopClock() { if (clock) clearInterval(clock); clock = null; }

  /* ── Routing ────────────────────────────────────────────────────────── */
  var VIEWS = { 'case': renderCase, table: renderTable, catalogue: renderCatalogue, rounds: renderRounds, register: renderRegister };
  var current = 'case';

  function go(view, arg, silent) {
    current = view;
    $$('.view').forEach(function (v) { v.hidden = v.dataset.view !== view; });
    $$('.plate').forEach(function (p) {
      p.setAttribute('aria-current', p.dataset.view === view || (view === 'table' && p.dataset.view === 'case') ? 'true' : 'false');
    });
    if (view !== 'table') stopClock();
    VIEWS[view](arg);
    if (!silent) location.hash = view === 'table' ? '#read/' + arg : '#' + view;
    window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' });
    $('#stage').focus({ preventScroll: true });
  }
  function fromHash(silent) {
    var h = location.hash.replace(/^#/, '');
    if (h.indexOf('read/') === 0) {
      var id = h.slice(5);
      if (CH[id]) return go('table', id, silent);
    }
    go(VIEWS[h] ? h : 'case', null, silent);
  }

  /* ── View: the cabinet ──────────────────────────────────────────────── */
  function stateLabel(st) {
    return { 'new': 'new', evolving: 'revised', retiring: 'retiring', live: 'in place' }[st] || st;
  }

  function renderCase() {
    var due = dueCards().length;
    var newest = BOOK.chapters.slice().sort(function (a, b) { return (b.added || '').localeCompare(a.added || ''); })[0];
    var last = S.lastOpen && CH[S.lastOpen] ? CH[S.lastOpen] : null;
    var lastPct = last ? Math.round(progress(last.id) * 100) : 0;

    var focus = S.focus.length ? S.focus : BOOK.areas.map(function (a) { return a.id; });
    var shown = BOOK.chapters.filter(function (c) { return focus.indexOf(c.area) >= 0; });

    var cols = [[], [], []], i;
    var order = shown.slice().sort(function (a, b) {
      var w = { 'new': 0, evolving: 1, live: 2, retiring: 3 };
      if (w[a.state] !== w[b.state]) return w[a.state] - w[b.state];
      return (b.revised || b.added).localeCompare(a.revised || a.added);
    });
    order.forEach(function (ch, n) { cols[n % 3].push(ch); });

    var html = '' +
      '<div class="room-head">' +
        '<h1 class="room-title">A collection that keeps <em>moving</em></h1>' +
        '<p class="room-lede">' + esc(BOOK.meta.lede || lede()) + '</p>' +
      '</div>' +
      '<div class="vitrine">' +
        '<button class="bay" data-goto="rounds">' +
          '<span class="bay-label"><span class="eng">Condition checks due</span></span>' +
          '<span class="bay-due">' + due + '</span>' +
          '<span class="bay-note">' + (due ? 'Recall them now and they cost half a minute each.' : 'Nothing waiting. Read something and it will fill up on its own.') + '</span>' +
          '<span class="bay-act">' + (due ? 'Open the rounds' : 'See the schedule') + ' ' + icon('i-back', 'ic') + '</span>' +
        '</button>' +
        '<button class="bay" data-open="' + newest.id + '">' +
          '<span class="bay-label"><span class="eng">Latest accession</span><span class="drawer-state st-' + newest.state + '">' + stateLabel(newest.state) + '</span></span>' +
          '<span class="bay-big">' + esc(newest.title) + '</span>' +
          '<span class="bay-note">Accessioned ' + ago(newest.added) + ' · ' + A[newest.area].name + '</span>' +
          '<span class="bay-act">Pull this drawer ' + icon('i-back', 'ic') + '</span>' +
        '</button>' +
        (last
          ? '<button class="bay" data-open="' + last.id + '">' +
              '<span class="bay-label"><span class="eng">Where you stopped</span></span>' +
              '<span class="bay-big">' + esc(last.title) + '</span>' +
              '<span class="bay-note">' + lastPct + '% of the working extent behind you.</span>' +
              '<span class="bay-act">Put it back on the table ' + icon('i-back', 'ic') + '</span>' +
            '</button>'
          : '<button class="bay" data-random="1">' +
              '<span class="bay-label"><span class="eng">Nothing on the table yet</span></span>' +
              '<span class="bay-big">Start anywhere</span>' +
              '<span class="bay-note">The collection has no first page. That is the point.</span>' +
              '<span class="bay-act">Open a drawer at random ' + icon('i-die', 'ic') + '</span>' +
            '</button>') +
      '</div>' +
      '<div class="wall-head">' +
        '<span class="eng">' + plural(shown.length, 'drawer') + ' · ' + BOOK.concepts.length + ' catalogued specimens</span>' +
        areaChipsHTML() +
      '</div>' +
      '<details class="key"' + (S.key === false ? '' : ' open') + '>' +
        '<summary>' + icon('i-tag', 'ic') + 'What the drawers are telling you</summary>' +
        '<div class="key-grid">' +
          '<span><i class="k-depth"></i>Drawer depth is reading length — deeper drawer, longer chapter.</span>' +
          '<span><i class="k-baize"></i>A green baize seam down the left means the drawer stands ajar: new, or revised since you last looked.</span>' +
          '<span><i class="k-read"></i>The brass line along the bottom is how far through it you already are.</span>' +
          '<span><i class="k-strike"></i>A struck-through title is retiring — superseded, kept only until you have read its replacement.</span>' +
          '<span><i class="k-plate"></i>The engraved plate is the growth area. The code beside it is its accession number.</span>' +
        '</div>' +
      '</details>' +
      '<div class="wall">' + cols.map(function (col) {
        return '<div class="stack">' + col.map(drawerHTML).join('') + '</div>';
      }).join('') + '</div>';

    var v = $('#view-case');
    v.innerHTML = html;

    $$('.bay', v).forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.dataset.goto) go(b.dataset.goto);
        else if (b.dataset.open) go('table', b.dataset.open);
        else openRandom();
      });
    });
    wireAreaChips(v, renderCase);
    var keyEl = $('details.key', v);
    if (keyEl) keyEl.addEventListener('toggle', function () { S.key = keyEl.open; save(); });
    $$('.drawer', v).forEach(function (d) {
      d.addEventListener('click', function () { go('table', d.dataset.ch); });
    });
    $('#dueBadge').textContent = due || '';
    $('#dueBadge').hidden = !due;
    $('#railSub').textContent = BOOK.chapters.length + ' drawers · ' + due + ' due';
  }

  /* ── Growth-area focus: one click solos an area, a second clears it ──── */
  function areaChipsHTML() {
    var all = S.focus.length === 0;
    return '<div class="filters" role="group" aria-label="Focus on a growth area">' +
      '<button class="chip chip-all" data-area="" aria-pressed="' + all + '">All areas</button>' +
      BOOK.areas.map(function (a) {
        var on = all || S.focus.indexOf(a.id) >= 0;
        return '<button class="chip" data-area="' + a.id + '" aria-pressed="' + (all ? 'false' : String(on)) + '" ' +
          'title="Click to see only ' + esc(a.name) + '. Shift-click to add it alongside the others." ' +
          'style="color:' + ink(a.id) + '"><span class="dot"></span>' + esc(a.name) + '</button>';
      }).join('') +
      '<span class="filter-hint">Click to focus one · shift-click to combine</span>' +
      '</div>';
  }

  function wireAreaChips(root, rerender) {
    $$('.chip', root).forEach(function (c) {
      c.addEventListener('click', function (e) {
        var id = c.dataset.area;
        if (!id) S.focus = [];
        else if (e.shiftKey || e.metaKey || e.ctrlKey) {
          var i = S.focus.indexOf(id);
          if (S.focus.length === 0) S.focus = [id];
          else if (i >= 0) S.focus.splice(i, 1);
          else S.focus.push(id);
        } else {
          S.focus = (S.focus.length === 1 && S.focus[0] === id) ? [] : [id];
        }
        if (S.focus.length === BOOK.areas.length) S.focus = [];
        save(); rerender();
      });
    });
  }

  function drawerHTML(ch) {
    var depth = ch.minutes >= 11 ? 'deep' : ch.minutes <= 6 ? 'shallow' : '';
    var ajar = (ch.state === 'new' || ch.state === 'evolving') ? ' open-ajar' : '';
    var p = progress(ch.id);
    var meta = [
      '<span class="acc">' + esc(ch.id.toUpperCase().slice(0, 3)) + '·' + String(BOOK.chapters.indexOf(ch) + 1).padStart(3, '0') + '</span>',
      '<span class="drawer-state st-' + ch.state + '">' + stateLabel(ch.state) + '</span>',
      '<span>' + ch.minutes + ' min</span>',
      '<span>' + ago(ch.revised || ch.added) + '</span>'
    ].join('');
    return '<button class="drawer ' + depth + ajar + (ch.state === 'retiring' ? ' retiring' : '') + '" data-ch="' + ch.id + '">' +
      '<span class="drawer-in">' +
        '<svg class="spec" viewBox="0 0 48 48" fill="none" stroke="' + ink(ch.area) + '" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#sp-' + ch.area + '"></use></svg>' +
        '<span class="drawer-body">' +
          '<span class="drawer-title">' + esc(ch.title) + '</span>' +
          '<span class="drawer-meta">' + meta + '</span>' +
        '</span>' +
        '<span class="pull"></span>' +
      '</span>' +
      '<span class="drawer-read" style="--read-frac:' + p.toFixed(3) + '"></span>' +
    '</button>';
  }

  function openRandom() {
    var focus = S.focus.length ? S.focus : BOOK.areas.map(function (a) { return a.id; });
    var pool = BOOK.chapters.filter(function (c) { return focus.indexOf(c.area) >= 0 && c.state !== 'retiring'; });
    var weighted = [];
    pool.forEach(function (c) { var w = 1 + Math.round((1 - progress(c.id)) * 4); for (var i = 0; i < w; i++) weighted.push(c); });
    var pick = weighted[Math.floor(Math.random() * weighted.length)] || BOOK.chapters[0];
    toast('Pulled at random: ' + pick.title);
    go('table', pick.id);
  }

  /* ── View: the reading table ────────────────────────────────────────── */
  var io = null;

  function renderTable(chId) {
    var ch = CH[chId];
    if (!ch) return go('case');
    S.lastOpen = chId; touch(chId); save();
    startClock(chId);

    var v = $('#view-table');
    var r = S.read[chId];
    v.innerHTML =
      '<div class="table-wrap">' +
        '<button class="table-back">' + icon('i-back') + 'Back to the cabinet</button>' +
        '<div class="table">' +
          '<aside class="labelcard">' + labelHTML(ch, r) + '</aside>' +
          '<article class="reading" id="reading"></article>' +
        '</div>' +
      '</div>';

    $('.table-back', v).addEventListener('click', function () { go('case'); });
    wireExtent(ch);
    paint(ch);
  }

  function labelHTML(ch, r) {
    var mins = Math.round((r.seconds || 0) / 60);
    var rows = [
      ['Accessioned', ago(ch.added)],
      ['Last revised', ago(ch.revised || ch.added)],
      ['State', stateLabel(ch.state)],
      ['Est. reading', ch.minutes + ' min'],
      ['Your time', mins ? mins + ' min' : 'under a minute'],
      ['Times opened', String(r.opens || 1)]
    ];
    if (ch.supersededBy && CH[ch.supersededBy]) rows.push(['Superseded by', CH[ch.supersededBy].title]);
    return '<div class="lc-top">' +
        '<svg class="spec" viewBox="0 0 48 48" fill="none" stroke="' + ink(ch.area, true) + '" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#sp-' + ch.area + '"></use></svg>' +
        '<div><span class="lc-area" style="color:' + ink(ch.area, true) + '">' + esc(A[ch.area].name) + '</span>' +
        '<p class="lc-title">' + esc(ch.title) + '</p></div>' +
      '</div>' +
      '<div class="lc-rows">' + rows.map(function (p) {
        return '<div><span>' + esc(p[0]) + '</span><b>' + esc(p[1]) + '</b></div>';
      }).join('') + '</div>' +
      '<div class="extent">' +
        '<span class="eng">Extent</span>' +
        '<input class="dial" type="range" min="1" max="4" step="1" value="' + S.extent + '" aria-label="Reading extent, 1 spine to 4 source">' +
        '<div class="detents">' + [1, 2, 3, 4].map(function (d) {
          return '<button class="detent" data-d="' + d + '" aria-current="' + (S.extent === d) + '">' +
            '<b>' + EXTENT[d].name + '</b><span>' + EXTENT[d].note + '</span></button>';
        }).join('') + '</div>' +
      '</div>';
  }

  function wireExtent(ch) {
    var dial = $('.dial');
    function set(d) {
      S.extent = d; save();
      dial.value = d;
      $$('.detent').forEach(function (b) { b.setAttribute('aria-current', String(+b.dataset.d === d)); });
      paint(ch);
    }
    dial.addEventListener('input', function () { set(+dial.value); });
    $$('.detent').forEach(function (b) { b.addEventListener('click', function () { set(+b.dataset.d); }); });
  }

  function paint(ch) {
    var host = $('#reading');
    var dial = S.extent;
    var visible = ch.blocks.map(function (b, i) { return { b: b, i: i }; }).filter(function (o) { return o.b.d <= dial; });

    var html = '<h1>' + esc(ch.title) + '</h1><p class="summary">' + rich(ch.summary) + '</p>';
    visible.forEach(function (o) { html += blockHTML(o.b, o.i, ch); });

    var xs = (chapterOf[ch.id] || []).slice().sort(function (a, b) { return MAG[b] - MAG[a]; }).slice(0, 10);
    if (xs.length) {
      html += '<section class="xrefs"><h3>Specimens named in this drawer</h3><div class="slips">' +
        xs.map(function (id) {
          var c = C[id];
          return '<button class="xslip" data-c="' + id + '" style="--xc:' + ink(c.area, true) + '">' +
            esc(c.term) + '<small>' + esc(c.kind) + ' · ' + plural((mentions[id] || []).length, 'drawer') + '</small></button>';
        }).join('') + '</div></section>';
    }

    if (ch.sources && ch.sources.length) {
      html += '<section class="prov"><h3>Where this came from</h3><ol class="prov-list">' +
        ch.sources.map(function (s) {
          var host2 = '';
          if (s.url) { try { host2 = new URL(s.url).hostname.replace(/^www\./, ''); } catch (err) { host2 = ''; } }
          return '<li>' +
            (s.url
              ? '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.label) + '</a>'
              : '<span class="prov-cite">' + esc(s.label) + '</span>') +
            (s.note ? '<span class="prov-note">' + esc(s.note) + '</span>' : '') +
            (host2 ? '<span class="prov-host">' + esc(host2) + '</span>' : '') + '</li>';
        }).join('') + '</ol>' +
        '<p class="prov-foot">Read ' + ago(ch.revised || ch.added) + '. Everything above is written from these; the wording is the drawer\u2019s own.</p>' +
      '</section>';
    }

    var others = BOOK.chapters.filter(function (o) { return o.id !== ch.id && o.area === ch.area && o.state !== 'retiring'; });
    var next = others[Math.floor(Math.random() * others.length)];
    html += '<div class="table-foot">' +
      '<div class="btn-row">' +
        '<button class="btn brass" data-act="file-chapter">' + icon('i-pin') + ' File this for the rounds</button>' +
        '<button class="btn" data-act="random">' + icon('i-die') + ' Somewhere else</button>' +
      '</div>' +
      (next ? '<button class="btn" data-open="' + next.id + '">Next in ' + esc(A[ch.area].name) + ': ' + esc(next.title) + '</button>' : '') +
    '</div>';

    host.innerHTML = html;
    if (!REDUCED) $$('.blk', host).forEach(function (el, i) { el.style.animationDelay = Math.min(i * 22, 260) + 'ms'; });

    // Figures
    $$('[data-fig]', host).forEach(function (m) {
      var fn = window.LB[m.dataset.fig];
      if (fn) fn(m); else m.textContent = 'Figure unavailable.';
    });

    // Prompts
    $$('.prompt', host).forEach(function (p) {
      var reveal = $('[data-act="reveal"]', p);
      if (reveal) reveal.addEventListener('click', function () {
        var a = document.createElement('p');
        a.className = 'a'; a.innerHTML = rich(p.dataset.a);
        reveal.parentNode.parentNode.insertBefore(a, reveal.parentNode);
        reveal.parentNode.innerHTML = '<button class="btn brass" data-act="file">' + icon('i-pin') + ' Keep asking me this</button>';
        $('[data-act="file"]', p).addEventListener('click', function () { filePrompt(p, ch); });
      });
    });

    host.addEventListener('click', onReadingClick);
    observe(ch);
  }

  function filePrompt(p, ch) {
    ensureCard('prompt', ch.id + '#' + p.dataset.k, p.dataset.q, p.dataset.a, ch.title);
    logEvent('file', p.dataset.q.slice(0, 70), ch.title);
    save(); toast('Filed. It comes back tomorrow.');
    $('#dueBadge').textContent = dueCards().length || '';
    $('#dueBadge').hidden = !dueCards().length;
  }

  function onReadingClick(e) {
    var t = e.target.closest('[data-c],[data-act],[data-open]');
    if (!t) return;
    if (t.dataset.c) return openSlip(t.dataset.c);
    if (t.dataset.open) return go('table', t.dataset.open);
    var act = t.dataset.act;
    if (act === 'random') openRandom();
    if (act === 'file-chapter') {
      var ch = CH[S.lastOpen];
      ensureCard('chapter', ch.id, 'In your own words: what does “' + ch.title + '” claim?', ch.summary.replace(REF, '$2$1'), ch.title);
      logEvent('file', ch.title, 'whole drawer');
      save(); toast('Filed the whole drawer.');
    }
  }

  function blockHTML(b, i, ch) {
    var k = 'b' + i;
    switch (b.t) {
      case 'h': return '<h2 class="blk" data-k="' + k + '">' + rich(b.x) + '</h2>';
      case 'p': return '<p class="blk" data-k="' + k + '">' + rich(b.x) + '</p>';
      case 'list': return '<ul class="blk" data-k="' + k + '">' + b.items.map(function (it) { return '<li>' + rich(it) + '</li>'; }).join('') + '</ul>';
      case 'aside': return '<div class="aside blk" data-k="' + k + '">' + rich(b.x) + '</div>';
      case 'code': return '<pre class="blk" data-k="' + k + '"><code>' + code(b.x) + '</code></pre>';
      case 'figure':
        return '<figure class="figure blk" data-k="' + k + '"><div class="figure-glass" data-fig="' + b.fig + '"></div>' +
          '<figcaption>' + rich(b.caption || '') + '</figcaption></figure>';
      case 'prompt':
        return '<div class="prompt blk" data-k="' + k + '" data-q="' + esc(b.q) + '" data-a="' + esc(b.a) + '">' +
          '<span class="eng">Condition check</span>' +
          '<p class="q">' + rich(b.q) + '</p>' +
          '<div class="prompt-acts"><button class="btn" data-act="reveal">Show what you should have said</button></div>' +
        '</div>';
      default: return '';
    }
  }
  function code(s) {
    return esc(s).split('\n').map(function (l) {
      return l.replace(/(#.*|--.*)$/, '<span class="cmt">$1</span>');
    }).join('\n');
  }

  function observe(ch) {
    if (io) io.disconnect();
    if (!('IntersectionObserver' in window)) return;
    var timers = {};
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var k = en.target.dataset.k;
        if (en.isIntersecting) {
          timers[k] = setTimeout(function () {
            markBlock(ch.id, k);
            var idx = ch.blocks.findIndex ? ch.blocks.findIndex(function (b, i) { return 'b' + i === k; }) : -1;
            var b = idx >= 0 ? ch.blocks[idx] : null;
            if (b && b.concept) meet(b.concept);
          }, 1100);
        } else { clearTimeout(timers[k]); }
      });
    }, { threshold: 0.45 });
    $$('.blk').forEach(function (el) { io.observe(el); });
  }

  /* ── View: catalogue ────────────────────────────────────────────────── */
  var ENC_NOTE = {
    size: 'Footprint. The heaviest specimens take more of the table — the fastest way to see what this collection is actually about.',
    lamp: 'Warmth. Heavy specimens sit under the lamp on bright paper; light ones recede into the dark. Nothing is hidden, only lit differently.',
    engrave: 'Cut. Weight is pressed into the lettering itself — wider, heavier, more deeply engraved. The list stays a list; only the type carries it.',
    thread: 'Thread. Weight leaves the type entirely and becomes position and connection: a ring grouped by growth area, with a thread for every link between two specimens.'
  };
  var SORT_NOTE = {
    mag: 'heaviest first — frequency, how many drawers name it, and how much else hangs off it',
    az: 'alphabetically, when you know the name and just want to find it',
    area: 'grouped by growth area, heaviest first inside each group',
    kind: 'fundamental patterns separated from concepts, so you can see the transferable layer on its own'
  };
  var KINDS = [['all', 'Everything'], ['pattern', 'Fundamental patterns'], ['concept', 'Concepts']];

  function renderCatalogue() {
    var v = $('#view-catalogue');
    var encs = [['size', 'Size'], ['lamp', 'Lamplight'], ['engrave', 'Engraving'], ['thread', 'Threads']];
    var sorts = [['mag', 'Weight'], ['az', 'A–Z'], ['area', 'Growth area'], ['kind', 'Kind']];
    if (!S.kind) S.kind = 'all';

    v.innerHTML =
      '<div class="room-head">' +
        '<h1 class="room-title">The <em>catalogue</em></h1>' +
        '<p class="room-lede">Every specimen the drawers refer to. Weight is frequency, how many drawers name it, and how many other specimens hang off it — shown four ways, because there is no one right way to make importance visible.</p>' +
      '</div>' +
      '<div class="cat-controls">' +
        '<div class="ctl-group"><span class="eng">Show weight as</span><div class="seg" data-seg="enc">' +
          encs.map(function (e) { return '<button data-v="' + e[0] + '" aria-pressed="' + (S.enc === e[0]) + '">' + e[1] + '</button>'; }).join('') +
        '</div></div>' +
        '<div class="ctl-group"><span class="eng">Order by</span><div class="seg" data-seg="sort">' +
          sorts.map(function (e) { return '<button data-v="' + e[0] + '" aria-pressed="' + (S.sort === e[0]) + '">' + e[1] + '</button>'; }).join('') +
        '</div></div>' +
        '<div class="ctl-group"><span class="eng">Show only</span><div class="seg" data-seg="kind">' +
          KINDS.map(function (e) { return '<button data-v="' + e[0] + '" aria-pressed="' + (S.kind === e[0]) + '">' + e[1] + '</button>'; }).join('') +
        '</div></div>' +
      '</div>' +
      '<div class="cat-filters">' + areaChipsHTML() + '</div>' +
      '<p class="cat-note" id="catNote"></p>' +
      '<div id="catBody"></div>';

    $$('.seg', v).forEach(function (seg) {
      seg.addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return;
        S[seg.dataset.seg] = b.dataset.v; save();
        $$('button', seg).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        catBody();
      });
    });
    wireAreaChips(v, renderCatalogue);
    catBody();
  }

  function catBody() {
    var host = $('#catBody');
    var note = $('#catNote');
    var list = BOOK.concepts.slice();
    var provisional = Object.keys(S.provisional).map(function (k) { return S.provisional[k]; });
    list = list.concat(provisional);

    var total = list.length;
    if (S.focus.length) list = list.filter(function (c) { return S.focus.indexOf(c.area) >= 0; });
    if (S.kind && S.kind !== 'all') list = list.filter(function (c) { return (c.kind || 'concept') === S.kind; });

    if (note) {
      var scope = (S.focus.length || (S.kind && S.kind !== 'all'))
        ? 'Showing ' + list.length + ' of ' + total + '. '
        : 'All ' + total + '. ';
      note.textContent = scope + ENC_NOTE[S.enc] + ' Ordered ' + SORT_NOTE[S.sort] + '.';
    }

    if (!list.length) {
      host.innerHTML = '<p class="empty">Nothing matches that combination. Widen the growth area, or show everything.</p>';
      return;
    }

    if (S.sort === 'az') list.sort(function (a, b) { return a.term.localeCompare(b.term); });
    else if (S.sort === 'area') list.sort(function (a, b) { return a.area === b.area ? MAG_of(b) - MAG_of(a) : a.area.localeCompare(b.area); });
    else if (S.sort === 'kind') list.sort(function (a, b) { return a.kind === b.kind ? MAG_of(b) - MAG_of(a) : a.kind.localeCompare(b.kind); });
    else list.sort(function (a, b) { return MAG_of(b) - MAG_of(a); });

    if (S.enc === 'thread') { host.innerHTML = threadHTML(list); wireThread(host); return; }

    var maxMag = 0; list.forEach(function (c) { maxMag = Math.max(maxMag, MAG_of(c)); });
    host.innerHTML = '<div class="cards enc-' + S.enc + '">' + list.map(function (c) {
      var m = MAG_of(c), rel = maxMag ? m / maxMag : 0;
      var seen = S.met[c.id] ? 1 : 0;
      var nDrawers = (mentions[c.id] || []).length;
      var note2 = nDrawers
        ? plural(nDrawers, 'drawer') + ' · ' + plural(freq[c.id] || 0, 'mention')
        : 'held by its links only';
      return '<button class="card" data-c="' + c.id + '" data-tier="' + tier(c.id) + '" data-warm="' + (rel > 0.72 ? 1 : 0) + '" style="--t:' + ink(c.area, true) +
        ';--mag:' + rel.toFixed(3) + ';--warm:' + rel.toFixed(3) + '">' +
        '<span class="card-kind">' + esc(c.kind === 'pattern' ? 'Fundamental pattern' : c.provisional ? 'Provisional' : 'Concept') + '</span>' +
        '<span class="card-term">' + esc(c.term) + '</span>' +
        '<span class="card-short">' + esc(c.short) + '</span>' +
        '<span class="card-mag">' + note2 + (seen ? ' · met' : '') + '</span>' +
      '</button>';
    }).join('') + '</div>';
    $$('.card', host).forEach(function (b) { b.addEventListener('click', function () { openSlip(b.dataset.c); }); });
  }
  function MAG_of(c) { return MAG[c.id] !== undefined ? MAG[c.id] : 0.08; }

  function threadHTML(list) {
    var SZ = 1000, cx = SZ / 2, cy = SZ / 2, R = 282;
    var groups = BOOK.areas.map(function (a) {
      return {
        id: a.id, name: a.name,
        items: list.filter(function (c) { return c.area === a.id; })
          .sort(function (x, y) { return MAG_of(y) - MAG_of(x); })
      };
    }).filter(function (g) { return g.items.length; });

    var n = groups.reduce(function (s, g) { return s + g.items.length; }, 0);
    var gapDeg = 7;
    var span = (360 - gapDeg * groups.length) / Math.max(1, n);
    var deg = -90 + gapDeg / 2;
    var pos = {};
    groups.forEach(function (g) {
      g.s = deg;
      g.items.forEach(function (c) {
        pos[c.id] = { deg: deg + span / 2, m: MAG_of(c), c: c, area: g.id };
        deg += span;
      });
      g.e = deg;
      deg += gapDeg;
    });
    function pt(d, r) { var a = d * Math.PI / 180; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; }

    var arcs = groups.map(function (g) {
      var r = R - 20;
      var a = pt(g.s + 1.5, r), b = pt(g.e - 1.5, r);
      return '<path d="M' + a[0].toFixed(1) + ' ' + a[1].toFixed(1) + 'A' + r + ' ' + r + ' 0 0 1 ' + b[0].toFixed(1) + ' ' + b[1].toFixed(1) +
        '" fill="none" stroke="' + ink(g.id) + '" stroke-width="3" opacity=".7" stroke-linecap="round"/>';
    }).join('');

    var lines = '';
    BOOK.concepts.forEach(function (c) {
      (c.seeAlso || []).forEach(function (o) {
        if (!pos[c.id] || !pos[o]) return;
        var p = pt(pos[c.id].deg, R - 4), q = pt(pos[o].deg, R - 4);
        var k = 0.24;
        lines += '<path class="thread-line" fill="none" stroke-width="' + (0.8 + Math.min(pos[c.id].m, pos[o].m) * 2.6).toFixed(2) +
          '" d="M' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) +
          'Q' + (cx + ((p[0] + q[0]) / 2 - cx) * k).toFixed(1) + ' ' + (cy + ((p[1] + q[1]) / 2 - cy) * k).toFixed(1) +
          ' ' + q[0].toFixed(1) + ' ' + q[1].toFixed(1) + '"/>';
      });
    });

    var nodes = Object.keys(pos).map(function (id) {
      var p = pos[id], r = 3.2 + p.m * 11;
      var flip = p.deg > 90 || p.deg < -90;
      var fs = (9.6 + p.m * 6.4).toFixed(1);
      return '<g class="thread-node" data-c="' + id + '" transform="rotate(' + p.deg.toFixed(2) + ' ' + cx + ' ' + cy + ')">' +
        '<circle cx="' + (cx + R) + '" cy="' + cy + '" r="' + r.toFixed(1) + '" fill="' + ink(p.area) + '" fill-opacity="' + (0.3 + p.m * 0.65).toFixed(2) + '" stroke="' + ink(p.area) + '" stroke-width="1.2"/>' +
        '<g transform="translate(' + (cx + R) + ' ' + cy + ')' + (flip ? ' rotate(180)' : '') + '">' +
          '<text x="' + (flip ? -(r + 7) : (r + 7)) + '" y="0" dy=".33em" text-anchor="' + (flip ? 'end' : 'start') + '" ' +
          'style="font-size:' + fs + 'px;opacity:' + (0.5 + p.m * 0.5).toFixed(2) + '">' + esc(p.c.term) + '</text>' +
        '</g>' +
      '</g>';
    }).join('');

    return '<div class="thread-wrap">' +
      '<div class="thread-key">' + groups.map(function (g) {
        return '<span style="color:' + ink(g.id) + '"><i></i>' + esc(g.name) + '</span>';
      }).join('') + '</div>' +
      '<svg viewBox="0 0 ' + SZ + ' ' + SZ + '" role="img" ' +
      'aria-label="Ring of catalogued specimens grouped by growth area, threaded by the links between them">' +
      arcs + lines + nodes + '</svg></div>';
  }
  function wireThread(host) {
    $$('.thread-node', host).forEach(function (g) {
      g.addEventListener('click', function () { openSlip(g.dataset.c); });
    });
  }

  /* ── View: rounds ───────────────────────────────────────────────────── */
  var revealed = false;
  function renderRounds() {
    var v = $('#view-rounds');
    var q = dueCards();
    if (!q.length) {
      var total = Object.keys(S.cards).length;
      var next = Object.keys(S.cards).map(function (k) { return S.cards[k].due; }).sort(function (a, b) { return a - b; })[0];
      v.innerHTML = '<div class="room-head"><h1 class="room-title">Rounds</h1>' +
        '<p class="room-lede">Condition checks are the same loop as reading, not a second app. Anything you keep comes back on a widening schedule.</p></div>' +
        '<div class="empty">' +
          '<svg class="spec" viewBox="0 0 48 48" fill="none" stroke="#c9962f" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#sp-mem"></use></svg>' +
          '<h3>' + (total ? 'Nothing due right now' : 'Nothing filed yet') + '</h3>' +
          '<p>' + (total
            ? plural(total, 'card') + ' on the schedule. The next one is due ' + relFuture(next) + '.'
            : 'Read a drawer and keep a condition check, or highlight any phrase and file it. Cards appear here on their own.') + '</p>' +
          '<button class="btn brass" data-act="random">' + icon('i-die') + ' Open a drawer at random</button>' +
        '</div>';
      var b = $('[data-act="random"]', v); if (b) b.addEventListener('click', openRandom);
      return;
    }
    var card = q[0];
    revealed = false;
    v.innerHTML = '<div class="room-head"><h1 class="room-title">Rounds</h1>' +
      '<p class="room-lede">' + plural(q.length, 'check') + ' due. Answer out loud first — the recall is the point, not the reading.</p></div>' +
      '<div class="rounds-wrap"><div class="round-card">' +
        '<span class="eng">' + (card.kind === 'chapter' ? 'Whole drawer' : card.kind === 'concept' ? 'Catalogue specimen' : 'Condition check') + '</span>' +
        '<p class="round-q">' + rich(card.q) + '</p>' +
        '<div id="roundBody"></div>' +
        '<p class="round-src">' + esc(card.src || '') + ' · seen ' + plural(card.reps, 'time') + ' · ease ' + card.ease.toFixed(2) + '</p>' +
      '</div></div>';
    var body = $('#roundBody');
    body.innerHTML = '<div class="prompt-acts"><button class="btn brass" id="showBtn">Show the answer</button></div>';
    $('#showBtn').addEventListener('click', function () {
      revealed = true;
      body.innerHTML = '<p class="a">' + rich(card.a) + '</p>' +
        '<div class="grade">' + [
          [0, 'Forgot', 'again'], [1, 'Hard', 'shorter'], [2, 'Good', 'as planned'], [3, 'Easy', 'push it out']
        ].map(function (g) {
          return '<button class="btn" data-g="' + g[0] + '">' + g[1] + '<small>' + g[2] + '</small></button>';
        }).join('') + '</div>';
      $$('[data-g]', body).forEach(function (b) {
        b.addEventListener('click', function () {
          grade(card, +b.dataset.g);
          logEvent('round', card.q.slice(0, 70), ['forgot', 'hard', 'good', 'easy'][+b.dataset.g]);
          S.days[TODAY] = (S.days[TODAY] || 0) + 20; save();
          var left = dueCards().length;
          $('#dueBadge').textContent = left || ''; $('#dueBadge').hidden = !left;
          renderRounds();
        });
      });
    });
  }
  function relFuture(ts) {
    if (!ts) return 'soon';
    var d = Math.round((ts - Date.now()) / 864e5);
    if (d <= 0) return 'today';
    if (d === 1) return 'tomorrow';
    return 'in ' + d + ' days';
  }

  /* ── View: register ─────────────────────────────────────────────────── */
  function renderRegister() {
    var v = $('#view-register');
    var secs = 0, blocks = 0, opened = 0;
    Object.keys(S.read).forEach(function (k) {
      var r = S.read[k]; secs += r.seconds || 0; blocks += Object.keys(r.blocks || {}).length; opened++;
    });
    var met = Object.keys(S.met).length;
    var filed = Object.keys(S.cards).length;
    var mature = Object.keys(S.cards).filter(function (k) { return S.cards[k].ivl >= 8; }).length;

    var perArea = {};
    BOOK.areas.forEach(function (a) { perArea[a.id] = { secs: 0, blocks: 0 }; });
    Object.keys(S.read).forEach(function (k) {
      var ch = CH[k]; if (!ch) return;
      perArea[ch.area].secs += S.read[k].seconds || 0;
      perArea[ch.area].blocks += Object.keys(S.read[k].blocks || {}).length;
    });
    var maxSecs = 1;
    BOOK.areas.forEach(function (a) { maxSecs = Math.max(maxSecs, perArea[a.id].secs); });

    var days = [];
    for (var i = 55; i >= 0; i--) {
      var d = new Date(Date.now() - i * 864e5).toISOString().slice(0, 10);
      days.push({ d: d, s: S.days[d] || 0 });
    }
    var maxDay = Math.max(600, Math.max.apply(null, days.map(function (x) { return x.s; })));

    v.innerHTML =
      '<div class="room-head"><h1 class="room-title">The <em>register</em></h1>' +
        '<p class="room-lede">What the collection knows about how you use it. Nothing leaves this device — it is a local record, kept so the bars can tell you which growth area you have quietly stopped visiting.</p></div>' +
      '<div class="ledger">' +
        '<div class="tallies">' + [
          [fmtMin(secs), 'time at the table'],
          [String(blocks), 'passages read'],
          [String(opened) + '/' + BOOK.chapters.length, 'drawers opened'],
          [String(met), 'specimens met'],
          [String(filed), 'checks filed'],
          [String(mature), 'holding past a week']
        ].map(function (t) { return '<div class="tally"><b>' + t[0] + '</b><span>' + t[1] + '</span></div>'; }).join('') + '</div>' +

        '<span class="eng" style="display:block;margin-bottom:.8rem">Attention by growth area</span>' +
        '<div class="bars">' + BOOK.areas.map(function (a) {
          var p = perArea[a.id];
          return '<div class="bar-row">' +
            '<span class="bar-name"><svg class="ic" style="color:' + ink(a.id) + '" aria-hidden="true"><use href="#sp-' + a.id + '"></use></svg>' + esc(a.name) + '</span>' +
            '<span class="bar-track"><span class="bar-fill" style="--frac:' + (p.secs / maxSecs).toFixed(3) + ';background:linear-gradient(90deg,' + ink(a.id) + ',' + ink(a.id) + 'cc)"></span></span>' +
            '<span class="bar-num">' + fmtMin(p.secs) + '</span>' +
          '</div>';
        }).join('') + '</div>' +

        '<span class="eng" style="display:block;margin-bottom:.8rem">Last eight weeks</span>' +
        '<div class="days">' + days.map(function (x) {
          var o = x.s ? (0.16 + (x.s / maxDay) * 0.84) : 0;
          return '<span class="day" title="' + x.d + ' · ' + fmtMin(x.s) + '"' +
            (o ? ' style="background:rgba(237,194,100,' + o.toFixed(2) + ')"' : '') + '></span>';
        }).join('') + '</div>' +

        '<span class="eng" style="display:block;margin-bottom:.6rem">Recent movements</span>' +
        '<div class="log">' + (S.log.length ? S.log.slice(0, 14).map(function (e) {
          return '<div class="log-row"><time>' + new Date(e.t).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) + '</time>' +
            '<b>' + esc(e.label) + '</b><em style="color:' + (e.kind === 'round' ? '#7fc9a4' : '#c9962f') + '">' + esc(e.kind) + (e.meta ? ' · ' + esc(e.meta) : '') + '</em></div>';
        }).join('') : '<div class="log-row"><time>—</time><b>Nothing recorded yet</b><em>idle</em></div>') + '</div>' +

        '<div class="btn-row" style="margin-top:2rem"><button class="btn" id="wipe">Clear this device\u2019s record</button></div>' +
      '</div>';

    $('#wipe').addEventListener('click', function () {
      if (!confirm('Clear reading history, filed checks and metrics on this device?')) return;
      S = blank(); localStorage.removeItem(KEY); toast('Register cleared.'); renderRegister(); renderCase();
    });
  }
  function fmtMin(s) {
    if (!s) return '0m';
    if (s < 3600) return Math.max(1, Math.round(s / 60)) + 'm';
    return (s / 3600).toFixed(1) + 'h';
  }

  /* ── The catalogue slip ─────────────────────────────────────────────── */
  var slipC = null, slipOpener = null;

  function wireSlip() {
    var slip = $('#slip'), veil = $('#slipVeil');
    veil.addEventListener('click', closeSlip);
    slip.addEventListener('click', function (e) {
      var t = e.target.closest('.slip-close,[data-c],[data-open],[data-act]');
      if (!t || !slipC) return;
      if (t.classList.contains('slip-close')) return closeSlip();
      if (t.dataset.c) return openSlip(t.dataset.c);
      if (t.dataset.open) { closeSlip(); return go('table', t.dataset.open); }
      if (t.dataset.act === 'file-concept') {
        var c = slipC;
        if (c.provisional) S.provisional[c.id] = c;
        ensureCard('concept', c.id, 'What is the fundamental underneath “' + c.term + '”?', c.fundamental, c.term);
        logEvent('file', c.term, 'catalogue');
        save(); toast('Filed “' + c.term + '”.');
        var n = dueCards().length; $('#dueBadge').textContent = n || ''; $('#dueBadge').hidden = !n;
      }
    });
    slip.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = $$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', slip)
        .filter(function (el) { return el.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  function openSlip(id, provisionalText) {
    var c = C[id] || S.provisional[id];
    var slip = $('#slip'), veil = $('#slipVeil');

    if (!c && provisionalText) {
      c = {
        id: id, term: provisionalText, kind: 'concept', area: 'think', provisional: true,
        short: 'Not catalogued yet. You marked it while reading.',
        fundamental: 'Unknown. This is the honest state: a phrase you noticed, held until it earns an entry.',
        mechanism: 'File it for the rounds and it will come back; write the entry when you can say it without looking.',
        seeAlso: []
      };
    }
    if (!c) return;
    meet(c.id);

    var where = (mentions[c.id] || []).map(function (chId) { return CH[chId]; }).filter(Boolean);
    var back = BOOK.concepts.filter(function (o) { return (o.seeAlso || []).indexOf(c.id) >= 0; });
    var links = (c.seeAlso || []).map(function (o) { return C[o]; }).filter(Boolean)
      .concat(back.filter(function (o) { return (c.seeAlso || []).indexOf(o.id) < 0; }));

    slip.innerHTML = '<div class="slip-in">' +
      '<div class="slip-top"><span class="eng">Catalogue entry</span>' +
        '<button class="slip-close" aria-label="Close">' + icon('i-close') + '</button></div>' +
      '<div class="slip-card" style="--t:' + ink(c.area, true) + '">' +
        '<svg class="spec" viewBox="0 0 48 48" fill="none" stroke="' + ink(c.area, true) + '" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#sp-' + c.area + '"></use></svg>' +
        '<span class="slip-kind">' + esc(c.provisional ? 'Provisional · uncatalogued' : c.kind === 'pattern' ? 'Fundamental pattern' : 'Concept') + ' · ' + esc(A[c.area].name) + '</span>' +
        '<h2>' + esc(c.term) + '</h2>' +
        '<p class="slip-short">' + esc(c.short) + '</p>' +

        '<div class="slip-sec principal"><span class="eng">The fundamental underneath</span><p>' + rich(c.fundamental) + '</p></div>' +
        '<div class="slip-sec"><span class="eng">How it actually works</span><p>' + rich(c.mechanism) + '</p></div>' +

        (where.length ? '<div class="slip-sec"><span class="eng">Named in ' + plural(where.length, 'drawer') + '</span>' +
          '<div class="slip-links">' + where.map(function (ch) {
            return '<button class="mini" data-open="' + ch.id + '">' + esc(ch.title) + '</button>';
          }).join('') + '</div></div>' : '') +

        (links.length ? '<div class="slip-sec"><span class="eng">Filed beside</span>' +
          '<div class="slip-links">' + links.map(function (o) {
            return '<button class="mini" data-c="' + o.id + '" style="color:' + ink(o.area, true) + '">' + esc(o.term) + '</button>';
          }).join('') + '</div></div>' : '') +

        (c.sources && c.sources.length ? '<div class="slip-sec slip-src"><span class="eng">Go deeper</span>' +
          c.sources.map(function (s) {
            return '<div><a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.label || s.title) + '</a></div>';
          }).join('') + '</div>' : '') +

        '<div class="slip-acts">' +
          '<button class="btn brass" data-act="file-concept">' + icon('i-pin') + ' Add to rounds</button>' +
          (where.length ? '<button class="btn" data-open="' + where[0].id + '">Read where it appears</button>' : '') +
        '</div>' +
      '</div>' +
    '</div>';

    if (slip.hidden) slipOpener = document.activeElement;
    slipC = c;
    slip.hidden = false; veil.hidden = false;
    document.addEventListener('keydown', escClose);
    $('.slip-close', slip).focus();
  }
  function closeSlip() {
    $('#slip').hidden = true; $('#slipVeil').hidden = true;
    document.removeEventListener('keydown', escClose);
    slipC = null;
    if (slipOpener && document.contains(slipOpener) && slipOpener.offsetParent !== null) slipOpener.focus();
    slipOpener = null;
  }
  function escClose(e) { if (e.key === 'Escape') closeSlip(); }

  /* ── The loupe: drill down from any selection ───────────────────────── */
  var loupe = $('#loupe'), lastSel = '';
  function hideLoupe() { loupe.hidden = true; }

  document.addEventListener('mouseup', placeLoupe);
  document.addEventListener('touchend', function () { setTimeout(placeLoupe, 10); });
  document.addEventListener('scroll', hideLoupe, true);

  function placeLoupe(e) {
    if (e && e.target && e.target.closest && e.target.closest('.loupe')) return;
    var sel = window.getSelection();
    if (!sel || sel.isCollapsed) return hideLoupe();
    var text = sel.toString().trim().replace(/\s+/g, ' ');
    if (text.length < 2 || text.length > 90) return hideLoupe();
    var node = sel.anchorNode;
    if (!node || !(node.parentElement && node.parentElement.closest('.reading, .round-card, .slip-card'))) return hideLoupe();
    lastSel = text;
    var rect = sel.getRangeAt(0).getBoundingClientRect();
    loupe.hidden = false;
    var lw = loupe.offsetWidth || 240;
    var x = Math.min(Math.max(8, rect.left + rect.width / 2 - lw / 2), window.innerWidth - lw - 8);
    loupe.style.left = (x + window.scrollX) + 'px';
    loupe.style.top = (rect.top + window.scrollY - loupe.offsetHeight - 9) + 'px';
  }

  function matchConcept(text) {
    var t = text.toLowerCase().replace(/[.,;:—–()"']/g, '').trim();
    var best = null, bestScore = 0;
    BOOK.concepts.forEach(function (c) {
      var term = c.term.toLowerCase();
      var score = 0;
      if (term === t) score = 100;
      else if (t.indexOf(term) >= 0) score = 60 + term.length;
      else if (term.indexOf(t) >= 0 && t.length >= 4) score = 40 + t.length;
      if (score > bestScore) { bestScore = score; best = c; }
    });
    return bestScore >= 40 ? best : null;
  }

  loupe.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var text = lastSel;
    hideLoupe();
    window.getSelection().removeAllRanges();
    if (b.dataset.act === 'drill') {
      var hit = matchConcept(text);
      if (hit) return openSlip(hit.id);
      var pid = 'prov-' + text.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
      return openSlip(pid, text);
    }
    var ch = CH[S.lastOpen];
    var key = 'sel-' + text.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
    ensureCard('prompt', key, 'You marked this while reading — what does it mean, and why did it matter?',
      '“' + text + '”' + (ch ? ' — from ' + ch.title + '.' : ''), ch ? ch.title : 'a selection');
    logEvent('file', text.slice(0, 70), 'highlighted');
    save(); toast('Filed your highlight.');
    var n = dueCards().length; $('#dueBadge').textContent = n || ''; $('#dueBadge').hidden = !n;
  });

  /* ── Rail ───────────────────────────────────────────────────────────── */
  $$('.plate').forEach(function (p) { p.addEventListener('click', function () { go(p.dataset.view); }); });
  $('#randomBtn').addEventListener('click', openRandom);
  var lampBtn = $('#lampBtn');
  function applyLamp() {
    document.documentElement.style.setProperty('--lamp', S.lamp ? '1' : '0');
    document.body.classList.toggle('lamp-up', !!S.lamp);
    lampBtn.setAttribute('aria-pressed', String(!!S.lamp));
    var lbl = $('#lampLabel');
    if (lbl) lbl.textContent = S.lamp ? 'Lamp down' : 'Lamp up';
    lampBtn.title = S.lamp
      ? 'Lower the lamp: dims the room back to its resting warmth'
      : 'Raise the lamp: brightens the room and lifts cabinet text for longer sessions';
  }
  lampBtn.addEventListener('click', function () {
    S.lamp = S.lamp ? 0 : 1; save(); applyLamp();
    toast(S.lamp ? 'Lamp up. The cabinet reads brighter.' : 'Lamp down.');
  });

  document.addEventListener('keydown', function (e) {
    if (e.target.matches('input, textarea')) return;
    if (e.key === 'r' && !e.metaKey && !e.ctrlKey) openRandom();
    if (e.key >= '1' && e.key <= '4' && current === 'table') {
      var d = $('.detent[data-d="' + e.key + '"]'); if (d) d.click();
    }
  });

  window.addEventListener('hashchange', function () { fromHash(true); });
  window.addEventListener('beforeunload', function () {
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (err) {}
  });

  applyLamp();
  wireSlip();
  fromHash(true);
})();
