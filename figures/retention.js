/* Figure renderer. Loaded only when its chapter is opened. */
(function (F) {
  var LB = window.LB = window.LB || {};
  var el = F.el, h = F.h, fmt = F.fmt, secs = F.secs, nice = F.nice, control = F.control, readout = F.readout;
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
}(window.CabinetFigure));
