// DECEMBER — рисунок в духе открытки середины века: плоские геометрические формы, без обводки, огни — в слой света.
(function () {
  const { clamp, lerp, ss, hash, noise1, eo, back } = E;
  const A = window.A = {};
  const K = A.K = { navy: '#1d2a4a', night: '#131a30', dusk: '#3a3f6b', burg: '#7a1f2b', red: '#c0383f', hunter: '#284636', green: '#3f6b4f',
    gold: '#e6b450', cream: '#f3ead8', snow: '#f7f2e8', shade: '#c4cede', skin: '#f2c6a2', skin2: '#c98a64', brown: '#6b4430', wood: '#9a6238',
    pink: '#e8a08e', teal: '#4f8a8b', mustard: '#d69a3a', plum: '#5a3050', sky1: '#e9a27a', sky2: '#c4677a' };
  const R = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const poly = (c, pts, col) => { c.fillStyle = col; c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.closePath(); c.fill(); };
  const circ = (c, x, y, r, col) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, Math.max(.1, r), 0, 7); c.fill(); };
  const ell = (c, x, y, rx, ry, col, rot = 0) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), rot, 0, 7); c.fill(); };
  Object.assign(A, { R, poly, circ, ell });
  // свечение в слой света
  A.glow = function (L, x, y, r, col, a = 1) {
    if (a <= 0) return; const g = L.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); L.globalAlpha = a; L.fillStyle = g; L.fillRect(x - r, y - r, r * 2, r * 2); L.globalAlpha = 1;
  };
  A.bulb = function (c, L, x, y, col, on = 1, r = 5) {
    circ(c, x, y, r, on > .1 ? col : '#3a3a44'); if (on > .1) { circ(L, x, y, r * .9, col); A.glow(L, x, y, r * 3.5, col, .45 * on); }
  };
  const BULBS = ['#ffd36b', '#ff6b5a', '#7ed2ff', '#9cf28a', '#ffb0e0'];
  // гирлянда по линии (провисы), on — 0..1 волна включения слева направо
  A.string = function (c, L, x0, y0, x1, y1, n, on = 1, sag = 14, t = 0, cols = BULBS) {
    c.strokeStyle = '#2a2a2a'; c.lineWidth = 2; c.beginPath();
    for (let i = 0; i <= 40; i++) { const k = i / 40, x = lerp(x0, x1, k), y = lerp(y0, y1, k) + Math.sin(k * Math.PI * n / 2 % Math.PI) * 0 + sag * Math.sin(k * n * Math.PI) ** 2; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
    for (let i = 0; i < n; i++) { const k = (i + .5) / n, x = lerp(x0, x1, k), y = lerp(y0, y1, k) + sag * Math.sin(k * n * Math.PI) ** 2 + 4;
      const o = clamp(on * (n + 3) - i) * (.8 + .2 * Math.sin(t * 3 + i * 1.7)); A.bulb(c, L, x, y, cols[i % cols.length], o, 4.5); }
  };
  // небо полосами (как трафарет)
  A.sky = function (c, cols, y0 = -400, y1 = 1700) {
    const n = cols.length; for (let i = 0; i < n; i++) R(c, -600, lerp(y0, y1, i / n), 1920, (y1 - y0) / n + 2, cols[i]);
  };
  A.stars = function (c, L, n, y0, y1, t, seed = 1) {
    for (let i = 0; i < n; i++) { const x = -300 + hash(i * 3.1 + seed) * 1320, y = lerp(y0, y1, hash(i * 7.3 + seed)), s = 2 + hash(i * 2.2) * 4, tw = .6 + .4 * Math.sin(t * 2 + i);
      A.star4(c, x, y, s * tw, K.cream); if (L) A.glow(L, x, y, s * 3, '#fff3c0', .25 * tw); }
  };
  A.star4 = function (c, x, y, s, col) { poly(c, [x, y - s * 2, x + s * .45, y - s * .45, x + s * 2, y, x + s * .45, y + s * .45, x, y + s * 2, x - s * .45, y + s * .45, x - s * 2, y, x - s * .45, y - s * .45], col); };
  A.star5 = function (c, x, y, r, col, rot = 0) { const p = []; for (let i = 0; i < 10; i++) { const a = rot - Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; p.push(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } poly(c, p, col); };
  // сугроб/земля
  A.ground = function (c, y, col = K.snow, amp = 14, seed = 0) {
    c.fillStyle = col; c.beginPath(); c.moveTo(-600, 2000); for (let x = -600; x <= 1400; x += 40) c.lineTo(x, y + Math.sin(x * .01 + seed) * amp + Math.sin(x * .023 + seed * 2) * amp * .5); c.lineTo(1400, 2000); c.fill();
  };
  // снег: слой, плотность, скорость; d — размер
  A.snow = function (c, t, n, sz = 3, sp = 60, seed = 0, col = '#fffaf0', area = [-200, -200, 1120, 1480]) {
    c.fillStyle = col; const [x0, y0, x1, y1] = area, hgt = y1 - y0;
    for (let i = 0; i < n; i++) { const x = x0 + hash(i * 1.7 + seed) * (x1 - x0) + Math.sin(t * .8 + i) * 18, y = y0 + ((hash(i * 3.3 + seed) * hgt + t * sp * (.6 + hash(i) * .8)) % hgt);
      const s = sz * (.6 + hash(i * 5.1) * .8); c.beginPath(); c.arc(x, y, s, 0, 7); c.fill(); }
  };
  // ---------- дом (фасад). o: wall, roof, win (окна вкл 0..1), lights (гирлянда по крыше 0..1), wreath, door
  A.house = function (c, L, x, y, w, h, o = {}, t = 0) {
    const wall = o.wall || K.burg, roof = o.roof || K.navy, rh = h * .55;
    R(c, x, y - h, w, h, wall);
    poly(c, [x - w * .08, y - h, x + w / 2, y - h - rh, x + w * 1.08, y - h], roof);
    // снег на крыше
    c.fillStyle = K.snow; c.beginPath(); c.moveTo(x - w * .1, y - h + 4); c.lineTo(x + w / 2, y - h - rh - 6); c.lineTo(x + w * 1.1, y - h + 4); c.lineTo(x + w * 1.0, y - h + 10);
    for (let i = 0; i <= 8; i++) c.lineTo(x + w * (1 - i / 8), y - h + 10 + (i % 2) * 8); c.lineTo(x + w * .5, y - h - rh + 14); c.closePath(); c.fill();
    R(c, x + w * .66, y - h - rh * .75, w * .1, rh * .45, K.brown); R(c, x + w * .64, y - h - rh * .78, w * .14, 8, K.snow);
    // окна
    const wn = o.win ?? 1, wc = `rgb(${lerp(60, 255, wn) | 0},${lerp(56, 196, wn) | 0},${lerp(80, 110, wn) | 0})`;
    const ww = w * .2, wh = h * .28;
    for (const [fx, fy] of [[.12, .25], [.68, .25], [.12, .62]]) { R(c, x + w * fx, y - h + h * fy, ww, wh, wc); R(c, x + w * fx + ww / 2 - 1.5, y - h + h * fy, 3, wh, wall); R(c, x + w * fx, y - h + h * fy + wh / 2 - 1.5, ww, 3, wall);
      R(c, x + w * fx - 3, y - h + h * fy + wh, ww + 6, 6, K.snow); if (wn > .05) A.glow(L, x + w * fx + ww / 2, y - h + h * fy + wh / 2, ww * 1.6, 'rgba(255,190,90,.9)', wn * .7); }
    // дверь
    R(c, x + w * .52, y - h * .48, w * .22, h * .48, o.door || K.hunter); circ(c, x + w * .7, y - h * .25, 2.5, K.gold);
    if (o.wreath) { const k = clamp(o.wreath), cx = x + w * .63, cy = y - h * .36;
      c.strokeStyle = K.green; c.lineWidth = w * .045 * k; c.beginPath(); c.arc(cx, cy, w * .06 * k + .1, 0, 7); c.stroke();
      poly(c, [cx, cy + w * .05 * k, cx - w * .04 * k, cy + w * .1 * k, cx + w * .04 * k, cy + w * .1 * k], K.red); for (let i = 0; i < 5; i++) circ(c, cx + Math.cos(i * 1.3) * w * .06 * k, cy + Math.sin(i * 1.3) * w * .06 * k, 2 * k, K.red); }
    if (o.lights !== undefined) { const n = 9; A.string(c, L, x - w * .08, y - h, x + w / 2, y - h - rh, n, clamp(o.lights * 2), 6, t); A.string(c, L, x + w / 2, y - h - rh, x + w * 1.08, y - h, n, clamp(o.lights * 2 - 1), 6, t); }
  };
  // ---------- ёлка (стилизованная, ярусы-треугольники). o.lights, o.orn (0..1 сколько игрушек), o.star (0..1)
  A.tree = function (c, L, x, y, h, o = {}, t = 0) {
    const col = o.col || K.green, dk = o.dk || K.hunter;
    R(c, x - h * .04, y - h * .1, h * .08, h * .1, K.brown);
    for (let i = 0; i < 4; i++) { const k = i / 4, w = h * (.38 - k * .26), yb = y - h * (.08 + k * .22), yt = yb - h * .34;
      poly(c, [x - w, yb, x + w, yb, x, yt], i % 2 ? col : dk);
      if (o.snow) { c.fillStyle = K.snow; c.beginPath(); c.moveTo(x - w, yb); c.quadraticCurveTo(x - w * .5, yb - h * .03, x, yb - h * .015); c.quadraticCurveTo(x + w * .5, yb - h * .035, x + w, yb); c.lineTo(x + w * .8, yb - h * .03); c.lineTo(x - w * .8, yb - h * .03); c.fill(); } }
    if (o.orn) { const n = 14; for (let i = 0; i < n; i++) { if (hash(i * 9.1) > o.orn) continue; const k = hash(i * 4.4), yy = y - h * (.12 + k * .7), wd = h * (.36 - k * .3) * .8, xx = x + (hash(i * 2.7) * 2 - 1) * wd;
      circ(c, xx, yy, h * .022, [K.red, K.gold, K.cream, K.teal][i % 4]); circ(c, xx - h * .007, yy - h * .007, h * .006, 'rgba(255,255,255,.7)'); } }
    if (o.lights) { for (let i = 0; i < 18; i++) { const k = (i + .5) / 18, yy = y - h * (.12 + k * .7), wd = h * (.36 - k * .3) * .85, xx = x + Math.sin(i * 2.4) * wd;
      A.bulb(c, L, xx, yy, BULBS[i % 5], clamp(o.lights * 19 - i) * (.75 + .25 * Math.sin(t * 4 + i)), h * .012); } }
    if (o.star) { const s = clamp(o.star); A.star5(c, x, y - h * .96, h * .07 * back(s), K.gold, Math.sin(t * 2) * .1); A.glow(L, x, y - h * .96, h * .12, 'rgba(255,215,120,.9)', s * .45); }
  };
  // ---------- человек (mid-century: трапеция-пальто, круглая голова, точки-глаза). o: coat, hat, scarf, aL, aR (рад от вниз), walk (фаза), flip, kid, smile, eyes 'dot'|'closed'
  A.person = function (c, x, y, s, o = {}) {
    s *= 1.4; c.save(); c.translate(x, y); c.scale(s * (o.flip ? -1 : 1), s); c.rotate(o.tilt || 0);
    const coat = o.coat || K.red, legC = o.legs || K.night, bob = o.walk !== undefined ? Math.abs(Math.sin(o.walk)) * 3 : 0;
    c.translate(0, -bob);
    // ноги
    const lp = o.walk !== undefined ? Math.sin(o.walk) * 12 : 0;
    c.strokeStyle = legC; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(-7, -40); c.lineTo(-7 + lp, 0); c.moveTo(7, -40); c.lineTo(7 - lp, 0); c.stroke();
    ell(c, -7 + lp + 3, 1, 8, 4, '#222'); ell(c, 7 - lp + 3, 1, 8, 4, '#222');
    // руки (за пальто)
    const arm = (sd, a) => { const sx = sd * 16, sy = -88; const ex = sx + Math.sin(a) * 34 * sd, ey = sy + Math.cos(a) * 34;
      c.strokeStyle = coat; c.lineWidth = 9; c.beginPath(); c.moveTo(sx, sy); c.lineTo(ex, ey); c.stroke(); circ(c, ex, ey, 5.5, o.mitt || K.cream); return [ex, ey]; };
    const hl = arm(-1, o.aL ?? .2), hr = arm(1, o.aR ?? .2);
    // пальто — трапеция
    poly(c, [-15, -98, 15, -98, 24, -36, -24, -36], coat);
    R(c, -24, -40, 48, 5, o.trim || 'rgba(0,0,0,.18)');
    // шарф
    if (o.scarf !== null) { R(c, -14, -102, 28, 8, o.scarf || K.cream); poly(c, [6, -96, 13, -96, 16, -74, 9, -74], o.scarf || K.cream); }
    // голова
    circ(c, 0, -116, 17, o.skin || K.skin);
    circ(c, -9, -110, 3.5, 'rgba(230,110,100,.45)'); circ(c, 9, -110, 3.5, 'rgba(230,110,100,.45)');
    const lk = o.look || 0;
    if (o.eyes === 'closed') { c.strokeStyle = '#222'; c.lineWidth = 2; c.beginPath(); c.arc(-6 + lk, -117, 3, Math.PI * .1, Math.PI * .9); c.moveTo(9 + lk, -117); c.arc(6 + lk, -117, 3, Math.PI * .1, Math.PI * .9); c.stroke(); }
    else { const bl = o.blink ? .2 : 1; ell(c, -6 + lk, -118, 2.2, 2.6 * bl, '#222'); ell(c, 6 + lk, -118, 2.2, 2.6 * bl, '#222'); }
    c.strokeStyle = '#7a2a2a'; c.lineWidth = 2; c.beginPath();
    if ((o.mouth || 0) > .2) { c.fillStyle = '#6a1e28'; c.ellipse(lk, -107, 4, 3 + o.mouth * 3, 0, 0, 7); c.fill(); } else { c.arc(lk, -110, 5, Math.PI * .2, Math.PI * .8); c.stroke(); }
    // шапка / волосы
    if (o.hat === 'beanie' || o.hat === undefined) { c.fillStyle = o.hatC || K.cream; c.beginPath(); c.arc(0, -120, 18, Math.PI, 0); c.fill(); R(c, -18, -124, 36, 7, o.hatT || K.red); circ(c, 0, -139, 6, o.hatT || K.red); }
    else if (o.hat === 'party') { poly(c, [-12, -128, 12, -128, 2, -162], o.hatC || K.gold); circ(c, 2, -163, 4, K.red); for (let i = 0; i < 3; i++) circ(c, -6 + i * 5, -134 - i * 8, 2, K.red); }
    else if (o.hat === 'hair') { c.fillStyle = o.hatC || K.brown; c.beginPath(); c.arc(0, -120, 18, Math.PI * 1.05, Math.PI * 1.95); c.fill(); if (o.long) { R(c, -19, -122, 7, 26, o.hatC || K.brown); R(c, 12, -122, 7, 26, o.hatC || K.brown); } }
    else if (o.hat === 'santa') { poly(c, [-17, -124, 17, -124, 24, -150], K.red); R(c, -19, -128, 38, 8, K.snow); circ(c, 25, -150, 5, K.snow); }
    c.restore();
    return { hl: [x + hl[0] * s * (o.flip ? -1 : 1), y + hl[1] * s], hr: [x + hr[0] * s * (o.flip ? -1 : 1), y + hr[1] * s] };
  };
  // ---------- машина (ретро-универсал) с ёлкой на крыше
  A.car = function (c, L, x, y, s, col = K.teal, tree = 0, t = 0, lights = 0) {
    c.save(); c.translate(x, y); c.scale(s, s);
    if (tree > 0) { c.save(); c.translate(-10, -78 - (1 - tree) * 60); c.rotate(-Math.PI / 2); A.tree(c, L, 0, 70, 150, { col: K.green, dk: K.hunter }); c.restore(); c.strokeStyle = '#8a6a40'; c.lineWidth = 2; if (tree > .95) { c.beginPath(); c.moveTo(-40, -55); c.lineTo(-30, -82); c.moveTo(30, -55); c.lineTo(20, -82); c.stroke(); } }
    c.fillStyle = col; c.beginPath(); c.roundRect(-90, -50, 180, 34, 10); c.fill();
    c.beginPath(); c.moveTo(-60, -50); c.lineTo(-40, -76); c.lineTo(40, -76); c.lineTo(62, -50); c.fill();
    R(c, -50, -72, 38, 20, '#cfe0ea'); R(c, -6, -72, 40, 20, '#cfe0ea');
    R(c, -90, -28, 180, 5, K.cream);
    for (const wx of [-52, 52]) { circ(c, wx, -14, 15, '#1b1b22'); circ(c, wx, -14, 6, '#bbb'); }
    circ(c, 86, -38, 5, '#ffe9a0'); if (lights) A.glow(L, x + 86 * s, y - 38 * s, 60 * s, 'rgba(255,230,160,.9)', lights);
    c.restore();
  };
  // ---------- пар
  A.steam = function (c, x, y, t, n = 3, sc = 1, col = 'rgba(255,250,240,.55)') {
    for (let i = 0; i < n; i++) { const ph = (t * .7 + i / n) % 1; const xx = x + Math.sin(ph * 6 + i) * 8 * sc, yy = y - ph * 60 * sc;
      c.globalAlpha = (1 - ph) * .9; ell(c, xx, yy, (6 + ph * 12) * sc, (8 + ph * 14) * sc, col); } c.globalAlpha = 1;
  };
  // ---------- подарок
  A.gift = function (c, x, y, w, h, col, rib = K.gold, open = 0) {
    R(c, x, y - h, w, h, col); R(c, x + w / 2 - w * .07, y - h, w * .14, h, rib);
    const ly = y - h - open * 40; c.save(); c.translate(x + w / 2, ly); c.rotate(-open * .6); R(c, -w * .55, -h * .18, w * 1.1, h * .18, col); R(c, -w * .07, -h * .18, w * .14, h * .18, rib);
    ell(c, -w * .15, -h * .26, w * .14, h * .1, rib, .5); ell(c, w * .15, -h * .26, w * .14, h * .1, rib, -.5); c.restore();
  };
  // ---------- салют: частицы шара; разрыв в t0, f — цвет
  A.firework = function (c, L, x, y, t0, t, col, r = 160, n = 36, seed = 0) {
    const u = t - t0; if (u < -0.6 || u > 2.2) return;
    if (u < 0) { const k = (u + .6) / .6; circ(L, x, y + (1 - k) * 600, 3, '#fff2c0'); A.glow(L, x, y + (1 - k) * 600, 20, 'rgba(255,230,160,.8)', .8); return; }
    const k = eo(u / 1.1), fade = clamp(1 - (u - .6) / 1.6);
    for (let i = 0; i < n; i++) { const a = i / n * 6.283 + seed, rr = r * k * (.85 + hash(i + seed) * .3), px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr + u * u * 30;
      circ(L, px, py, 3.2 * fade, col); A.glow(L, px, py, 14, col, .35 * fade); }
    A.glow(L, x, y, r * 1.2, col, .25 * clamp(1 - u * 2));
  };
})();
