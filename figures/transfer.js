/* Figure renderer. Loaded only when its chapter is opened. */
(function (F) {
  var LB = window.LB = window.LB || {};
  var el = F.el, h = F.h, fmt = F.fmt, secs = F.secs, nice = F.nice, control = F.control, readout = F.readout;
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
}(window.CabinetFigure));
