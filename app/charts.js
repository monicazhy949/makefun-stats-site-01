// Hand-drawn SVG charts for Japan in Numbers. No chart library: every
// chart below is built from the data files with plain string templates.
(function (global) {
  'use strict';

  function esc(value) {
    return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function niceTicks(min, max, count) {
    var span = max - min || 1;
    var step = Math.pow(10, Math.floor(Math.log10(span / count)));
    var norm = span / count / step;
    if (norm >= 5) step *= 5; else if (norm >= 2) step *= 2;
    var start = Math.ceil(min / step) * step;
    var ticks = [];
    for (var v = start; v <= max + step * 0.001; v += step) ticks.push(Math.round(v * 100) / 100);
    return ticks;
  }

  // Line chart: points is [{year, value}], label formats the y axis.
  function lineChart(points, opts) {
    var o = opts || {};
    var w = o.width || 760, h = o.height || 320, padL = 62, padR = 30, padT = 14, padB = 34;
    var values = points.map(function (p) { return p.value; });
    var min = Math.min.apply(null, values), max = Math.max.apply(null, values);
    var pad = (max - min) * 0.12 || 1;
    min -= pad; max += pad;
    var ticks = niceTicks(min, max, 4);
    var x = function (i) { return padL + (i * (w - padL - padR)) / Math.max(points.length - 1, 1); };
    var y = function (v) { return padT + (1 - (v - min) / (max - min)) * (h - padT - padB); };
    var out = ['<svg viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="' + esc(o.label || 'Line chart') + '">'];
    ticks.forEach(function (t) {
      out.push('<line x1="' + padL + '" y1="' + y(t).toFixed(1) + '" x2="' + (w - padR) + '" y2="' + y(t).toFixed(1) + '" stroke="#e3ded2" stroke-width="1"/>');
      out.push('<text x="' + (padL - 8) + '" y="' + (y(t) + 4).toFixed(1) + '" text-anchor="end" font-size="12" fill="#5a6373">' + esc(o.format ? o.format(t) : t) + '</text>');
    });
    var path = points.map(function (p, i) { return (i === 0 ? 'M' : 'L') + x(i).toFixed(1) + ',' + y(p.value).toFixed(1); }).join(' ');
    out.push('<path d="' + path + '" fill="none" stroke="' + (o.color || '#bc002d') + '" stroke-width="2.5" stroke-linejoin="round"/>');
    points.forEach(function (p, i) {
      out.push('<circle cx="' + x(i).toFixed(1) + '" cy="' + y(p.value).toFixed(1) + '" r="4" fill="' + (o.color || '#bc002d') + '"/>');
      // Anchor the first label to the left and the last to the right so no
      // value label is clipped by the chart edge or the y-axis labels.
      var anchor = i === 0 ? 'start' : (i === points.length - 1 ? 'end' : 'middle');
      var lx = i === 0 ? x(i) + 7 : (i === points.length - 1 ? x(i) - 7 : x(i));
      out.push('<text x="' + lx.toFixed(1) + '" y="' + (y(p.value) - 10).toFixed(1) + '" text-anchor="' + anchor + '" font-size="12" font-weight="700" fill="#14213d">' + esc(o.valueLabel ? o.valueLabel(p.value) : p.value) + '</text>');
      out.push('<text x="' + x(i).toFixed(1) + '" y="' + (h - 10) + '" text-anchor="middle" font-size="12" fill="#5a6373">' + p.year + '</text>');
    });
    out.push('</svg>');
    return out.join('');
  }

  // Vertical bar chart: points is [{year, value}].
  function barChart(points, opts) {
    var o = opts || {};
    var w = o.width || 760, h = o.height || 300, padL = 58, padR = 16, padT = 26, padB = 34;
    var values = points.map(function (p) { return p.value; });
    var min = Math.min(0, Math.min.apply(null, values)), max = Math.max.apply(null, values);
    var pad = (max - min) * 0.1 || 1;
    max += pad; min -= pad * 0.2;
    var ticks = niceTicks(min, max, 4);
    var slot = (w - padL - padR) / points.length;
    var bw = Math.min(64, slot * 0.6);
    var y = function (v) { return padT + (1 - (v - min) / (max - min)) * (h - padT - padB); };
    var zeroY = y(0);
    var out = ['<svg viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="' + esc(o.label || 'Bar chart') + '">'];
    ticks.forEach(function (t) {
      out.push('<line x1="' + padL + '" y1="' + y(t).toFixed(1) + '" x2="' + (w - padR) + '" y2="' + y(t).toFixed(1) + '" stroke="#e3ded2" stroke-width="1"/>');
      out.push('<text x="' + (padL - 8) + '" y="' + (y(t) + 4).toFixed(1) + '" text-anchor="end" font-size="12" fill="#5a6373">' + esc(o.format ? o.format(t) : t) + '</text>');
    });
    points.forEach(function (p, i) {
      var bx = padL + i * slot + (slot - bw) / 2;
      var top = Math.min(y(p.value), zeroY), height = Math.abs(y(p.value) - zeroY);
      out.push('<rect x="' + bx.toFixed(1) + '" y="' + top.toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + Math.max(height, 1).toFixed(1) + '" rx="3" fill="' + (p.color || o.color || '#1e325e') + '"/>');
      out.push('<text x="' + (bx + bw / 2).toFixed(1) + '" y="' + (top - 6).toFixed(1) + '" text-anchor="middle" font-size="12" font-weight="700" fill="#14213d">' + esc(o.valueLabel ? o.valueLabel(p.value) : p.value) + '</text>');
      out.push('<text x="' + (bx + bw / 2).toFixed(1) + '" y="' + (h - 10) + '" text-anchor="middle" font-size="12" fill="#5a6373">' + p.year + '</text>');
    });
    out.push('<line x1="' + padL + '" y1="' + zeroY.toFixed(1) + '" x2="' + (w - padR) + '" y2="' + zeroY.toFixed(1) + '" stroke="#14213d" stroke-width="1"/>');
    out.push('</svg>');
    return out.join('');
  }

  // Donut chart: slices is [{label, value, color}].
  function donutChart(slices, opts) {
    var o = opts || {};
    var size = o.size || 300, r = size / 2 - 14, cx = size / 2, cy = size / 2;
    var total = slices.reduce(function (s, d) { return s + d.value; }, 0);
    var start = -Math.PI / 2, out = ['<svg viewBox="0 0 ' + size + ' ' + size + '" role="img" aria-label="' + esc(o.label || 'Donut chart') + '">'];
    slices.forEach(function (d) {
      var frac = d.value / total, end = start + frac * Math.PI * 2;
      var large = frac > 0.5 ? 1 : 0;
      var x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start);
      var x2 = cx + r * Math.cos(end), y2 = cy + r * Math.sin(end);
      out.push('<path d="M' + cx + ',' + cy + ' L' + x1.toFixed(1) + ',' + y1.toFixed(1) + ' A' + r + ',' + r + ' 0 ' + large + ' 1 ' + x2.toFixed(1) + ',' + y2.toFixed(1) + ' Z" fill="' + d.color + '"/>');
      start = end;
    });
    out.push('<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.58).toFixed(1) + '" fill="#ffffff"/>');
    out.push('<text x="' + cx + '" y="' + (cy - 2) + '" text-anchor="middle" font-size="15" font-weight="700" fill="#14213d">' + esc(o.center || '') + '</text>');
    out.push('<text x="' + cx + '" y="' + (cy + 18) + '" text-anchor="middle" font-size="12" fill="#5a6373">' + esc(o.centerSub || '') + '</text>');
    out.push('</svg>');
    return out.join('');
  }

  global.JinCharts = { lineChart: lineChart, barChart: barChart, donutChart: donutChart, esc: esc };
})(typeof window !== 'undefined' ? window : this);
