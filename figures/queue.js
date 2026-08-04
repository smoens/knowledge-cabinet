/* Figure renderer. Loaded only when its chapter is opened. */
(function (F) {
  var LB = window.LB = window.LB || {};
  var el = F.el, h = F.h, fmt = F.fmt, secs = F.secs, nice = F.nice, control = F.control, readout = F.readout;
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
}(window.CabinetFigure));
