/* Knowledge Cabinet — the explorables that sit in vitrines on the reading table.
   No dependencies. Every figure redraws from a small honest model whose
   constants are printed next to the result. */
(function () {
  var LB = window.LB || (window.LB = {});
  var SVGNS = 'http://www.w3.org/2000/svg';

  function el(tag, attrs, kids) {
    var n = document.createElementNS(SVGNS, tag);
    for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    (kids || []).forEach(function (c) { n.appendChild(c); });
    return n;
  }
  function h(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function fmt(n) {
    if (n >= 1e9) return (n / 1e9).toFixed(n < 1e10 ? 1 : 0) + ' bn';
    if (n >= 1e6) return (n / 1e6).toFixed(n < 1e7 ? 1 : 0) + ' m';
    if (n >= 1e3) return Math.round(n / 1e3) + ' k';
    return String(Math.round(n));
  }
  function secs(s) {
    if (s >= 1) return s.toFixed(s < 10 ? 2 : 1) + ' s';
    if (s >= 0.001) return (s * 1000).toFixed(s < 0.01 ? 1 : 0) + ' ms';
    return (s * 1e6).toFixed(0) + ' µs';
  }
  function nice(x) {
    if (x <= 1) return 1;
    var e = Math.pow(10, Math.floor(Math.log10(x)));
    var m = x / e;
    return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * e;
  }

  function control(mount, label, min, max, val, step, render, format) {
    var row = h('div', 'fig-ctl');
    var lab = h('label', null, label);
    var id = 'c' + Math.random().toString(36).slice(2, 8);
    lab.setAttribute('for', id);
    var input = document.createElement('input');
    input.type = 'range'; input.min = min; input.max = max; input.step = step;
    input.value = val; input.id = id;
    var out = h('span', 'fig-val');
    function sync() { out.textContent = format(+input.value); render(+input.value); }
    input.addEventListener('input', sync);
    row.appendChild(lab); row.appendChild(input); row.appendChild(out);
    mount.appendChild(row);
    return { input: input, sync: sync };
  }

  function readout(mount, defs) {
    var row = h('div', 'fig-readout');
    var cells = {};
    defs.forEach(function (d) {
      var c = h('div');
      var b = h('b'); var s = h('span', null, d.label);
      c.appendChild(b); c.appendChild(s); row.appendChild(c);
      cells[d.key] = b;
    });
    mount.appendChild(row);
    return cells;
  }

  /* ── 1. Boundary crossings: row-at-a-time versus columnar batches ────── */
  LB.transfer = function (mount) {
    var MODEL = { convNs: 55, callNs: 380, batchUs: 45, copyNs: 0.9, batch: 65536 };
    var svg = el('svg', { viewBox: '0 0 720 232', role: 'img', 'aria-label': 'Boundary crossings for row-at-a-time versus columnar transfer' });
    var body = el('g');
    svg.appendChild(body);

    var rowsIdx = 4, cols = 6;
    var SCALE = [1e4, 5e4, 1e5, 5e5, 1e6, 5e6, 1e7];

    function draw() {
      while (body.firstChild) body.removeChild(body.firstChild);
      var rows = SCALE[rowsIdx];
      var rowCross = rows * cols;
      var batches = Math.ceil(rows / MODEL.batch);
      var colCross = batches * cols;
      var unit = nice(rowCross / 108);
      var rowMarks = Math.min(108, Math.round(rowCross / unit));
      var colMarks = Math.round(colCross / unit);

      var rowT = rows * (cols * MODEL.convNs + MODEL.callNs) * 1e-9;
      var colT = batches * MODEL.batchUs * 1e-6 + rows * cols * MODEL.copyNs * 1e-9;

      var PER = 36, GAPX = 19, GAPY = 20;

      function lane(y, title, marks, real, tint, hollow) {
        body.appendChild(el('text', { x: 0, y: y, fill: '#6f6555', 'font-family': 'Azeret Mono, monospace', 'font-size': 10.5, 'letter-spacing': 1.6 }, [document.createTextNode(title)]));
        var top = y + 14;
        var g = el('g', { transform: 'translate(0,' + top + ')' });
        for (var i = 0; i < marks; i++) {
          var mx = (i % PER) * GAPX, my = Math.floor(i / PER) * GAPY;
          g.appendChild(el('line', {
            x1: mx, y1: my, x2: mx + 4, y2: my + 13,
            stroke: tint, 'stroke-width': 2.4, 'stroke-linecap': 'round', opacity: 0.9
          }));
        }
        if (marks === 0) {
          g.appendChild(el('circle', { cx: 3, cy: 7, r: 5, fill: 'none', stroke: tint, 'stroke-width': 1.4, 'stroke-dasharray': '2 2.5' }));
        }
        body.appendChild(g);
        var lines = Math.max(1, Math.ceil(marks / PER));
        var bottom = top + (lines - 1) * GAPY + 13;
        body.appendChild(el('text', {
          x: 0, y: bottom + 19, fill: '#2b2317', 'font-family': 'Azeret Mono, monospace', 'font-size': 12.5, 'font-weight': 500
        }, [document.createTextNode(fmt(real) + ' crossings' + (marks >= 108 ? '  · marks capped' : marks === 0 ? '  · under one mark' : ''))]));
        return bottom + 40;
      }

      var y = 12;
      y = lane(y, 'ROW AT A TIME', rowMarks, rowCross, '#c8402f', false);
      y = lane(y, 'COLUMNAR BATCHES', colMarks, colCross, '#2e8f74', colMarks === 0);

      body.appendChild(el('text', {
        x: 0, y: y - 6, fill: '#6f6555', 'font-family': 'Azeret Mono, monospace', 'font-size': 9.5, 'letter-spacing': 1.2
      }, [document.createTextNode('EACH MARK ≈ ' + fmt(unit) + ' CROSSINGS · ' + fmt(batches) + ' BATCHES OF ' + fmt(MODEL.batch))]));

      svg.setAttribute('viewBox', '0 0 700 ' + Math.round(y + 6));

      out.rows.textContent = fmt(rows);
      out.ratio.textContent = (rowT / colT).toFixed(0) + '×';
      out.rowT.textContent = secs(rowT);
      out.colT.textContent = secs(colT);
    }

    var ctlWrap = h('div');
    mount.appendChild(ctlWrap);
    mount.appendChild(svg);
    var out = readout(mount, [
      { key: 'rows', label: 'rows' }, { key: 'rowT', label: 'row-at-a-time' },
      { key: 'colT', label: 'columnar' }, { key: 'ratio', label: 'faster' }
    ]);
    var note = h('p', null, 'Model: ' + MODEL.convNs + ' ns per value converted, ' + MODEL.callNs + ' ns per row across the driver, ' + MODEL.batchUs + ' µs per batch, ' + MODEL.copyNs + ' ns per value copied in bulk. Synthetic constants, chosen to be conservative.');
    note.style.cssText = 'margin:.8rem 0 0;font:400 .72rem/1.5 var(--mono);color:var(--ink-3);letter-spacing:.01em';
    mount.appendChild(note);

    var c1 = control(ctlWrap, 'Rows', 0, SCALE.length - 1, rowsIdx, 1, function (v) { rowsIdx = v; draw(); }, function (v) { return fmt(SCALE[v]) + ' rows'; });
    var c2 = control(ctlWrap, 'Columns', 2, 24, cols, 1, function (v) { cols = v; draw(); }, function (v) { return v + ' columns'; });
    c1.sync(); c2.sync();
  };

  /* ── 2. Utilization and the wall ────────────────────────────────────── */
  LB.queue = function (mount) {
    var W = 720, H = 250, PAD = { l: 46, r: 16, t: 14, b: 34 };
    var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Queueing delay against utilization' });
    var rho = 0.72, MAXW = 12;

    function x(r) { return PAD.l + r * (W - PAD.l - PAD.r); }
    function y(w) { return H - PAD.b - Math.min(w, MAXW) / MAXW * (H - PAD.t - PAD.b); }

    var layer = el('g'); svg.appendChild(layer);

    function draw() {
      while (layer.firstChild) layer.removeChild(layer.firstChild);

      layer.appendChild(el('rect', { x: x(0), y: PAD.t, width: x(0.7) - x(0), height: H - PAD.t - PAD.b, fill: '#2e8f74', opacity: .08 }));
      layer.appendChild(el('rect', { x: x(0.85), y: PAD.t, width: x(1) - x(0.85), height: H - PAD.t - PAD.b, fill: '#c8402f', opacity: .1 }));

      [0, 3, 6, 9, 12].forEach(function (w) {
        layer.appendChild(el('line', { x1: PAD.l, y1: y(w), x2: W - PAD.r, y2: y(w), stroke: '#c9b99d', 'stroke-width': 1, 'stroke-dasharray': w ? '2 4' : null }));
        layer.appendChild(el('text', { x: PAD.l - 8, y: y(w) + 4, 'text-anchor': 'end', fill: '#6f6555', 'font-family': 'Azeret Mono, monospace', 'font-size': 10 }, [document.createTextNode(w + '×')]));
      });
      [0, .25, .5, .75, 1].forEach(function (r) {
        layer.appendChild(el('text', { x: x(r), y: H - 12, 'text-anchor': 'middle', fill: '#6f6555', 'font-family': 'Azeret Mono, monospace', 'font-size': 10 }, [document.createTextNode(Math.round(r * 100) + '%')]));
      });

      var d = '', i;
      for (i = 0; i <= 200; i++) {
        var r = i / 200 * 0.985;
        var w = r / (1 - r);
        d += (i ? 'L' : 'M') + x(r).toFixed(1) + ' ' + y(w).toFixed(1);
      }
      layer.appendChild(el('path', { d: d, fill: 'none', stroke: '#8f2a1d', 'stroke-width': 2.4, 'stroke-linecap': 'round' }));

      var wNow = rho / (1 - rho);
      layer.appendChild(el('line', { x1: x(rho), y1: PAD.t, x2: x(rho), y2: H - PAD.b, stroke: '#c9962f', 'stroke-width': 1.5 }));
      layer.appendChild(el('circle', { cx: x(rho), cy: y(wNow), r: 6, fill: '#c9962f', stroke: '#5d4413', 'stroke-width': 1.5 }));

      var q = Math.min(22, Math.round(wNow));
      var qg = el('g', { transform: 'translate(' + (x(rho) + 12) + ',' + (PAD.t + 12) + ')' });
      for (i = 0; i < q; i++) {
        qg.appendChild(el('rect', { x: (i % 11) * 9, y: Math.floor(i / 11) * 9, width: 6, height: 6, rx: 1, fill: '#8455c9', opacity: .8 }));
      }
      if (x(rho) + 120 > W) qg.setAttribute('transform', 'translate(' + (x(rho) - 118) + ',' + (PAD.t + 12) + ')');
      layer.appendChild(qg);

      out.rho.textContent = Math.round(rho * 100) + '%';
      out.wait.textContent = wNow.toFixed(wNow < 10 ? 1 : 0) + '×';
      out.ms.textContent = (wNow * 10).toFixed(wNow < 10 ? 1 : 0) + ' ms';
      out.spare.textContent = Math.round((1 - rho) * 100) + '%';
    }

    var ctlWrap = h('div'); mount.appendChild(ctlWrap); mount.appendChild(svg);
    var out = readout(mount, [
      { key: 'rho', label: 'utilization' }, { key: 'spare', label: 'slack left' },
      { key: 'wait', label: 'wait, in service times' }, { key: 'ms', label: 'at 10 ms service' }
    ]);
    var note = h('p', null, 'M/M/1: wait = ρ/(1−ρ) service times. Real arrivals are burstier than Poisson, so treat this as the optimistic bound.');
    note.style.cssText = 'margin:.8rem 0 0;font:400 .72rem/1.5 var(--mono);color:var(--ink-3)';
    mount.appendChild(note);
    var c = control(ctlWrap, 'Utilization', 5, 98, 72, 1, function (v) { rho = v / 100; draw(); }, function (v) { return v + '% busy'; });
    c.sync();
  };

  /* ── 3. Retention against a review schedule ─────────────────────────── */
  LB.retention = function (mount) {
    var W = 720, H = 240, PAD = { l: 44, r: 14, t: 14, b: 34 }, DAYS = 90;
    var AT  = [0, 1, 4, 12, 33, 74];
    var TAU = [2.2, 6, 16, 42, 110, 260];
    var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Retention over ninety days against number of reviews' });
    var reviews = 3;
    var layer = el('g'); svg.appendChild(layer);

    function x(d) { return PAD.l + d / DAYS * (W - PAD.l - PAD.r); }
    function y(r) { return H - PAD.b - r * (H - PAD.t - PAD.b); }
    function retention(t, n) {
      var last = 0, tau = TAU[0];
      for (var i = 1; i <= n; i++) { if (AT[i] <= t) { last = AT[i]; tau = TAU[i]; } }
      return Math.exp(-(t - last) / tau);
    }

    function draw() {
      while (layer.firstChild) layer.removeChild(layer.firstChild);
      [0, .25, .5, .75, 1].forEach(function (r) {
        layer.appendChild(el('line', { x1: PAD.l, y1: y(r), x2: W - PAD.r, y2: y(r), stroke: '#c9b99d', 'stroke-width': 1, 'stroke-dasharray': r ? '2 4' : null }));
        layer.appendChild(el('text', { x: PAD.l - 8, y: y(r) + 4, 'text-anchor': 'end', fill: '#6f6555', 'font-family': 'Azeret Mono, monospace', 'font-size': 10 }, [document.createTextNode(Math.round(r * 100) + '%')]));
      });
      [0, 30, 60, 90].forEach(function (d) {
        layer.appendChild(el('text', { x: x(d), y: H - 12, 'text-anchor': 'middle', fill: '#6f6555', 'font-family': 'Azeret Mono, monospace', 'font-size': 10 }, [document.createTextNode('day ' + d)]));
      });

      var d = '', area = '', i, t, r;
      for (i = 0; i <= 540; i++) {
        t = i / 540 * DAYS; r = retention(t, reviews);
        d += (i ? 'L' : 'M') + x(t).toFixed(1) + ' ' + y(r).toFixed(1);
      }
      area = d + 'L' + x(DAYS) + ' ' + y(0) + 'L' + x(0) + ' ' + y(0) + 'Z';
      layer.appendChild(el('path', { d: area, fill: '#3f74c8', opacity: .13 }));
      layer.appendChild(el('path', { d: d, fill: 'none', stroke: '#2b4f8c', 'stroke-width': 2.4, 'stroke-linejoin': 'round' }));

      for (i = 1; i <= reviews; i++) {
        layer.appendChild(el('line', { x1: x(AT[i]), y1: y(0), x2: x(AT[i]), y2: y(1), stroke: '#c9962f', 'stroke-width': 1.4 }));
        layer.appendChild(el('circle', { cx: x(AT[i]), cy: y(1), r: 4, fill: '#c9962f', stroke: '#5d4413', 'stroke-width': 1.2 }));
      }

      var end = retention(DAYS, reviews);
      out.floor.textContent = Math.round(end * 100) + '%';
      out.n.textContent = reviews;
      out.cost.textContent = (reviews * 0.5).toFixed(1) + ' min';
      out.next.textContent = reviews < 5 ? 'day ' + AT[reviews + 1] : '—';
    }

    var ctlWrap = h('div'); mount.appendChild(ctlWrap); mount.appendChild(svg);
    var out = readout(mount, [
      { key: 'n', label: 'reviews' }, { key: 'cost', label: 'total time spent' },
      { key: 'floor', label: 'retention at day 90' }, { key: 'next', label: 'next review due' }
    ]);
    var note = h('p', null, 'Exponential decay with stability rising 2.2 → 6 → 16 → 42 → 110 → 260 days per successful retrieval, reviewed on days 1, 4, 12, 33, 74. Illustrative, in the shape the literature reports.');
    note.style.cssText = 'margin:.8rem 0 0;font:400 .72rem/1.5 var(--mono);color:var(--ink-3)';
    mount.appendChild(note);
    var c = control(ctlWrap, 'Reviews', 0, 5, 3, 1, function (v) { reviews = v; draw(); }, function (v) { return v === 0 ? 'no reviews' : v + (v === 1 ? ' review' : ' reviews'); });
    c.sync();
  };

  /* ── 4. Capacity: bursting, smoothing, and the throttling stages ─────── */
  LB.smoothing = function (mount) {
    /* Published constants, not invented: a timepoint is 30 s, a day holds 2,880
       of them, background work smooths across all of them, and the throttling
       stages fire at 10 min, 60 min and 24 h of borrowed future capacity. */
    var TP_SEC = 30, TP_DAY = 2880;
    var STAGES = [
      { at: 10,   label: 'Interactive delay', note: '20 s delay' },
      { at: 60,   label: 'Interactive reject', note: 'interactive refused' },
      { at: 1440, label: 'Background reject', note: 'everything refused' }
    ];
    var SKUS = [2, 4, 8, 16, 32, 64];

    var skuIdx = 2, basePct = 62, burstCuh = 90;

    var svg = el('svg', { viewBox: '0 0 720 300', role: 'img', 'aria-label': 'Smoothed capacity demand across a day, and the borrowed capacity that follows' });
    var body = el('g');
    svg.appendChild(body);

    function draw() {
      while (body.firstChild) body.removeChild(body.firstChild);

      var cuPerSec = SKUS[skuIdx];
      var capTP = cuPerSec * TP_SEC;          /* CU-seconds available per timepoint */
      var capDay = capTP * TP_DAY;
      var burstCU = burstCuh * 3600;          /* CU-hours the job consumed, in CU-seconds */
      var base = basePct / 100;
      var add = burstCU / TP_DAY / capTP;     /* smoothed burst, as a fraction of a timepoint */
      var demand = base + add;
      var over = Math.max(0, demand - 1);
      var borrowed = over * (TP_DAY * TP_SEC / 60); /* minutes of future capacity owed by day's end */

      var stage = null;
      for (var s = STAGES.length - 1; s >= 0; s--) if (borrowed >= STAGES[s].at) { stage = STAGES[s]; break; }

      var L = 54, R = 700, T = 16, MID = 138, B = 264;
      var x = function (f) { return L + f * (R - L); };
      var yTop = function (v) { return MID - Math.min(v, 1.75) / 1.75 * (MID - T); };

      /* ── upper panel: demand per timepoint against the sustained rate ── */
      body.appendChild(el('rect', { x: L, y: yTop(1), width: R - L, height: yTop(0) - yTop(1), fill: '#1d6151', opacity: .07 }));
      body.appendChild(el('rect', { x: L, y: T, width: R - L, height: yTop(1) - T, fill: '#8f2a1d', opacity: .05 }));

      /* the raw burst, before smoothing: one violent timepoint */
      var spikeX = x(0.22);
      body.appendChild(el('line', { x1: spikeX, y1: yTop(0), x2: spikeX, y2: T + 2, stroke: '#8f2a1d', 'stroke-width': 2, 'stroke-dasharray': '3 3', opacity: .5 }));
      body.appendChild(el('text', { x: spikeX + 6, y: T + 12, fill: '#8f2a1d', 'font-size': 10, 'font-family': 'ui-monospace, monospace', opacity: .7 }, [document.createTextNode('burst, unsmoothed')]));

      /* baseline demand, then the smoothed burst stacked on top of it */
      body.appendChild(el('rect', { x: L, y: yTop(base), width: R - L, height: yTop(0) - yTop(base), fill: '#5d4413', opacity: .22 }));
      body.appendChild(el('rect', { x: L, y: yTop(demand), width: R - L, height: yTop(base) - yTop(demand), fill: '#c8402f', opacity: .5 }));
      body.appendChild(el('line', { x1: L, y1: yTop(demand), x2: R, y2: yTop(demand), stroke: '#8f2a1d', 'stroke-width': 2 }));

      /* the sustained rate */
      body.appendChild(el('line', { x1: L, y1: yTop(1), x2: R, y2: yTop(1), stroke: '#3c2c18', 'stroke-width': 1.6, 'stroke-dasharray': '6 4' }));
      body.appendChild(el('text', { x: L - 8, y: yTop(1) + 4, fill: '#3c2c18', 'font-size': 10, 'text-anchor': 'end', 'font-family': 'ui-monospace, monospace' }, [document.createTextNode('F' + cuPerSec)]));
      body.appendChild(el('text', { x: L - 8, y: yTop(0) + 4, fill: '#7a6a52', 'font-size': 10, 'text-anchor': 'end', 'font-family': 'ui-monospace, monospace' }, [document.createTextNode('0')]));

      /* ── lower panel: borrowed capacity accumulating across the day ──── */
      var lg = function (m) { return Math.log10(Math.max(m, 1) + 1); };
      var TOPM = lg(2880);
      var yBot = function (m) { return B - lg(m) / TOPM * (B - (MID + 26)); };

      STAGES.forEach(function (st) {
        body.appendChild(el('line', { x1: L, y1: yBot(st.at), x2: R, y2: yBot(st.at), stroke: '#8a6a2a', 'stroke-width': 1, 'stroke-dasharray': '2 4', opacity: borrowed >= st.at ? 1 : .45 }));
      });

      var d = '', i, f;
      for (i = 0; i <= 96; i++) {
        f = i / 96;
        d += (i ? 'L' : 'M') + x(f).toFixed(1) + ' ' + yBot(borrowed * f).toFixed(1);
      }
      body.appendChild(el('path', { d: d + 'L' + x(1) + ' ' + B + 'L' + L + ' ' + B + 'Z', fill: '#8f2a1d', opacity: .12 }));
      body.appendChild(el('path', { d: d, fill: 'none', stroke: '#8f2a1d', 'stroke-width': 2.4, 'stroke-linejoin': 'round' }));

      STAGES.forEach(function (st) {
        var hit = borrowed >= st.at;
        body.appendChild(el('text', { x: R, y: yBot(st.at) - 5, fill: hit ? '#8f2a1d' : '#7a6a52', 'font-size': 9.5, 'font-weight': hit ? 600 : 400, 'text-anchor': 'end', 'font-family': 'ui-monospace, monospace', 'paint-order': 'stroke', stroke: '#f6efe1', 'stroke-width': 3.5, 'stroke-linejoin': 'round' }, [document.createTextNode(st.label.toLowerCase())]));
      });

      body.appendChild(el('line', { x1: L, y1: B, x2: R, y2: B, stroke: '#c9bda6', 'stroke-width': 1 }));
      ['00:00', '06:00', '12:00', '18:00', '24:00'].forEach(function (t, k) {
        body.appendChild(el('text', { x: x(k / 4), y: B + 15, fill: '#7a6a52', 'font-size': 9.5, 'text-anchor': k === 0 ? 'start' : k === 4 ? 'end' : 'middle', 'font-family': 'ui-monospace, monospace' }, [document.createTextNode(t)]));
      });
      body.appendChild(el('text', { x: L - 8, y: yBot(0) + 4, fill: '#7a6a52', 'font-size': 10, 'text-anchor': 'end', 'font-family': 'ui-monospace, monospace' }, [document.createTextNode('0 min')]));

      out.load.textContent = Math.round(demand * 100) + '%';
      out.share.textContent = Math.round(burstCU / capDay * 100) + '%';
      out.owed.textContent = borrowed < 1 ? 'none' : borrowed >= 1440 ? '> 24 h' : borrowed >= 60 ? (borrowed / 60).toFixed(1) + ' h' : Math.round(borrowed) + ' min';
      out.stage.textContent = stage ? stage.note : 'nothing yet';
    }

    var ctlWrap = h('div'); mount.appendChild(ctlWrap); mount.appendChild(svg);
    var out = readout(mount, [
      { key: 'load', label: 'smoothed demand vs rate' }, { key: 'share', label: 'burst as share of the day' },
      { key: 'owed', label: 'borrowed by 24:00' }, { key: 'stage', label: 'what a user sees' }
    ]);
    var note = h('p', null, 'Background work smooths across 2,880 timepoints of 30 s. Borrowed capacity is the overdraw carried forward; the stages fire at 10 min, 60 min and 24 h. Lower panel is log-scaled.');
    note.style.cssText = 'margin:.8rem 0 0;font:400 .72rem/1.5 var(--mono);color:var(--ink-3)';
    mount.appendChild(note);

    var c1 = control(ctlWrap, 'Capacity', 0, SKUS.length - 1, skuIdx, 1, function (v) { skuIdx = v; draw(); }, function (v) { return 'F' + SKUS[v] + ' · ' + SKUS[v] + ' CU/s'; });
    var c2 = control(ctlWrap, 'Baseline load', 20, 98, basePct, 1, function (v) { basePct = v; draw(); }, function (v) { return v + '% of the rate'; });
    var c3 = control(ctlWrap, 'Background burst', 0, 400, burstCuh, 5, function (v) { burstCuh = v; draw(); }, function (v) { return v + ' CU-hours'; });
    c1.sync(); c2.sync(); c3.sync();
  };
})();
