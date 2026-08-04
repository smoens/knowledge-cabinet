/* Figure renderer. Loaded only when its chapter is opened. */
(function (F) {
  var LB = window.LB = window.LB || {};
  var el = F.el, h = F.h, fmt = F.fmt, secs = F.secs, nice = F.nice, control = F.control, readout = F.readout;
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
}(window.CabinetFigure));
