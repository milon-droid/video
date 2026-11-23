// Бумажные формы: рваный/резаный край, гладкие кривые, волны, облака, дождь-полоски, скалы, трава.
const P = (() => {
  const { hash, noise1 } = E;
  const TAU = Math.PI * 2;
  // путь по точкам с «ручным» дрожанием (ножницы) — детерминированно
  function poly(c, pts, jit = 0, seed = 1, close = true) {
    c.beginPath();
    pts.forEach(([x, y], i) => { const jx = jit ? (hash(seed + i * 3.1) - .5) * jit : 0, jy = jit ? (hash(seed + i * 7.7) - .5) * jit : 0; i ? c.lineTo(x + jx, y + jy) : c.moveTo(x + jx, y + jy); });
    if (close) c.closePath();
  }
  // гладкая замкнутая/открытая кривая Catmull-Rom
  function smooth(c, pts, close = true, begin = true) {
    if (begin) c.beginPath(); const n = pts.length; const g = i => close ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))];
    c.moveTo(...pts[0]);
    for (let i = 0; i < (close ? n : n - 1); i++) { const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
      c.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]); }
    if (close) c.closePath();
  }
  // заливка + тонкая светлая кромка (толщина бумаги)
  function fill(c, col, edge = .16, lw = 1.4) { c.fillStyle = col; c.fill(); if (edge) { c.strokeStyle = `rgba(255,255,255,${edge})`; c.lineWidth = lw; c.stroke(); } }
  // клякса-круг с волнистым краем
  function blob(c, x, y, r, seed = 1, wob = .12, n = 14, rx = 1) {
    const pts = []; for (let i = 0; i < n; i++) { const a = i / n * TAU, rr = r * (1 + (hash(seed + i) - .5) * wob * 2); pts.push([x + Math.cos(a) * rr * rx, y + Math.sin(a) * rr]); }
    smooth(c, pts);
  }
  // облако: силуэт из кругов (верх кочками, низ ровный)
  function cloud(c, x, y, w, h, seed = 1) {
    c.beginPath(); const n = 5 + Math.floor(hash(seed) * 3);
    for (let i = 0; i < n; i++) { const k = (i + .5) / n, rr = h * (.45 + .55 * Math.sin(k * Math.PI)) * (.75 + .5 * hash(seed + i * 5));
      c.moveTo(x - w / 2 + k * w + rr, y); c.arc(x - w / 2 + k * w, y, rr, 0, TAU); }
    c.rect(x - w / 2, y, w, h * .5);
  }
  // волна: верх — зубчатый/скруглённый гребень, снизу до bottom. ph — фаза, sc — «резные» кудри
  function wave(c, o) {
    const { y, amp = 20, len = 200, ph = 0, x0 = -400, x1 = 1120, bottom = 2400, curl = 0, seed = 1, step = 8 } = o;
    c.beginPath(); c.moveTo(x0, bottom);
    for (let x = x0; x <= x1; x += step) {
      const k = x / len * TAU + ph; let yy = y + Math.sin(k) * amp + Math.sin(k * 2.3 + seed) * amp * .35 + (noise1(x * .01 + seed * 10 + ph * .2) - .5) * amp * .8;
      if (curl) { const f = ((k / TAU) % 1 + 1) % 1; if (f > .62 && f < .8) yy -= Math.sin((f - .62) / .18 * Math.PI) * curl; }
      c.lineTo(x, yy);
    }
    c.lineTo(x1, bottom); c.closePath();
  }
  // пена: белые бумажные зубчики вдоль гребня
  function foam(c, o, col = 'rgba(235,245,255,.9)') {
    const { y, amp = 20, len = 200, ph = 0, x0 = -400, x1 = 1120, seed = 1 } = o; c.fillStyle = col;
    for (let x = x0; x <= x1; x += 26) { const k = x / len * TAU + ph; const f = ((k / TAU) % 1 + 1) % 1; if (f < .55 || f > .8) continue;
      const yy = y + Math.sin(k) * amp + Math.sin(k * 2.3 + seed) * amp * .35 + (noise1(x * .01 + seed * 10 + ph * .2) - .5) * amp * .8;
      c.beginPath(); c.ellipse(x, yy + 3, 9 + 6 * hash(x + seed), 5, 0, 0, TAU); c.fill(); }
  }
  // скала: зубчатый многоугольник
  function rock(c, x, y, w, h, seed = 1) {
    const pts = [[x - w / 2, y + 400]]; const n = 9;
    for (let i = 0; i <= n; i++) { const k = i / n; const peak = Math.sin(k * Math.PI) ** .7; pts.push([x - w / 2 + k * w + (hash(seed + i) - .5) * w * .08, y - h * peak * (.6 + .4 * hash(seed + i * 2))]); }
    pts.push([x + w / 2, y + 400]); poly(c, pts, 6, seed);
  }
  // дождь: косые бумажные полоски. dens — штук, spd — px/с, ang — наклон
  function rain(c, t, o = {}) {
    const { n = 90, spd = 1500, len = 70, ang = .25, w = 2.2, col = 'rgba(190,210,235,.55)', seed = 3, x0 = -200, x1 = 920, y0 = -200, y1 = 1500 } = o;
    c.fillStyle = col; const span = y1 - y0;
    for (let i = 0; i < n; i++) { const r1 = hash(seed + i), r2 = hash(seed + i * 1.7), sp = spd * (.8 + .4 * hash(i + seed * 3));
      const yy = y0 + ((r2 * span + t * sp) % span), xx = x0 + r1 * (x1 - x0) - (yy - y0) * ang;
      c.save(); c.translate(xx, yy); c.rotate(ang); c.fillRect(-w / 2, -len / 2, w, len); c.restore(); }
  }
  // трава: зубчатая кромка (ножницы)
  function grass(c, x0, x1, y, h, seed = 1, sway = 0) {
    c.beginPath(); c.moveTo(x0, y + 900);
    for (let x = x0, i = 0; x <= x1; x += 14, i++) { const hh = h * (.4 + .9 * hash(seed + i)); c.lineTo(x, y); c.lineTo(x + 7 + sway * hh / h, y - hh); }
    c.lineTo(x1, y); c.lineTo(x1, y + 900); c.closePath();
  }
  // вырез звезды/искры
  function spark(c, x, y, r, n = 4, rot = 0) { c.beginPath(); for (let i = 0; i < n * 2; i++) { const a = rot + i / (n * 2) * TAU, rr = i % 2 ? r * .28 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath(); }
  return { poly, smooth, fill, blob, cloud, wave, foam, rock, rain, grass, spark, TAU };
})();
