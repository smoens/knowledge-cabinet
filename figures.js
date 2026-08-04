/* Shared helpers for lazily loaded explorables. */
(function () {
  var F = window.CabinetFigure = window.CabinetFigure || {};
  window.LB = window.LB || {};
  var SVGNS = 'http://www.w3.org/2000/svg';
  F.el = function (tag, attrs, kids) {
    var n = document.createElementNS(SVGNS, tag);
    for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    (kids || []).forEach(function (c) { n.appendChild(c); });
    return n;
  };
  F.h = function (tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };
  F.fmt = function (n) {
    if (n >= 1e9) return (n / 1e9).toFixed(n < 1e10 ? 1 : 0) + ' bn';
    if (n >= 1e6) return (n / 1e6).toFixed(n < 1e7 ? 1 : 0) + ' m';
    if (n >= 1e3) return Math.round(n / 1e3) + ' k';
    return String(Math.round(n));
  };
  F.secs = function (s) {
    if (s >= 1) return s.toFixed(s < 10 ? 2 : 1) + ' s';
    if (s >= 0.001) return (s * 1000).toFixed(s < 0.01 ? 1 : 0) + ' ms';
    return (s * 1e6).toFixed(0) + ' µs';
  };
  F.nice = function (x) {
    if (x <= 1) return 1;
    var e = Math.pow(10, Math.floor(Math.log10(x)));
    var m = x / e;
    return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * e;
  };
  F.control = function (mount, label, min, max, val, step, render, format) {
    var row = F.h('div', 'fig-ctl');
    var lab = F.h('label', null, label);
    var id = 'c' + Math.random().toString(36).slice(2, 8);
    lab.setAttribute('for', id);
    var input = document.createElement('input');
    input.type = 'range'; input.min = min; input.max = max; input.step = step;
    input.value = val; input.id = id;
    var out = F.h('span', 'fig-val');
    function sync() { out.textContent = format(+input.value); render(+input.value); }
    input.addEventListener('input', sync);
    row.appendChild(lab); row.appendChild(input); row.appendChild(out);
    mount.appendChild(row);
    return { input: input, sync: sync };
  };
  F.readout = function (mount, defs) {
    var row = F.h('div', 'fig-readout');
    var cells = {};
    defs.forEach(function (d) {
      var c = F.h('div');
      var b = F.h('b'); var s = F.h('span', null, d.label);
      c.appendChild(b); c.appendChild(s); row.appendChild(c);
      cells[d.key] = b;
    });
    mount.appendChild(row);
    return cells;
  };
}());
