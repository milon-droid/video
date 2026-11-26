// Окружение: пол, стол, окно, дверь, пляж, машина, дом… Всё — песком, в мировых координатах.
(function () {
  const { lerp, clamp, hash, noise1, ss } = E;
  const W = E.W;
  // полоса толстого песка внизу экрана (зона текста) — экранные координаты
  E.band = function (c, y0 = 975, a = 1) {
    c.save(); c.setTransform(E.RS, 0, 0, E.RS, 0, 0);
    const g = c.createLinearGradient(0, y0 - 60, 0, y0 + 50);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, `rgba(255,255,255,${a})`);
    c.fillStyle = g; c.fillRect(-10, y0 - 60, W + 20, 400);
    // волнистая кромка, как от ладони
    c.fillStyle = `rgba(255,255,255,${a * .6})`; c.beginPath(); c.moveTo(-10, y0 + 20);
    for (let x = -10; x <= W + 10; x += 20) c.lineTo(x, y0 - 8 + noise1(x * .013 + 4) * 16);
    c.lineTo(W + 10, 1400); c.lineTo(-10, 1400); c.fill();
    c.restore(); E.reset(c);
  };
  // пол / земля от линии y вниз
  E.floor = function (c, y, a = .55, x0 = -400, x1 = 1200) {
    E.sand(c, a); c.fillRect(x0, y, x1 - x0, 1600);
    E.sand(c, Math.min(1, a + .3)); c.fillRect(x0, y - 2, x1 - x0, 5);
    E.reset(c);
  };
  E.rect = (c, x, y, w, h, a = 1) => { E.sand(c, a); c.fillRect(x, y, w, h); E.reset(c); };
  // стол с ножками
  E.desk = function (c, x, y, w, a = 1) {
    E.sand(c, a); c.fillRect(x, y, w, 14); c.fillRect(x + 10, y + 14, 10, 160); c.fillRect(x + w - 20, y + 14, 10, 160);
    c.fillRect(x + w * .55, y + 14, w * .45 - 20, 46); E.carve(c, .7); c.fillRect(x + w * .62, y + 34, w * .25, 3); E.reset(c);
  };
  // ноутбук: экран к герою (f — куда смотрит экран), свечение — процарапанный световой конус
  E.laptop = function (c, x, y, f = -1, glow = 1, t = 0) {
    E.sand(c, 1); c.fillRect(x - 46, y - 6, 92, 7);
    c.save(); c.translate(x - f * 44, y - 4); c.rotate(f * .26);
    c.fillRect(-4, -70, 8, 70); c.restore();
    if (glow > 0) {   // свет экрана на лице героя
      const gx = x - f * 70, gy = y - 52, fl = .85 + .15 * Math.sin(t * 9) * Math.sin(t * 3.1);
      E.clear(c, gx, gy, 62, .55 * glow * fl, 1.2);
    }
    E.reset(c);
  };
  E.chair = function (c, x, y, f = 1, a = 1) {   // x — спинка, y — сиденье
    E.sand(c, a); c.fillRect(x - 6, y - 120, 12, 130); c.fillRect(x - 6, y - 4, f * 80, 12);
    c.fillRect(x + f * 40 - 5, y + 8, 10, 70); E.reset(c);
  };
  E.lamp = function (c, x, y, on = 1) {   // настольная лампа
    E.sand(c, 1); c.fillRect(x - 22, y - 6, 44, 6); c.lineWidth = 6; E.path(c, [[x, y - 6], [x - 18, y - 70], [x + 10, y - 104]]); c.stroke();
    c.beginPath(); c.moveTo(x - 6, y - 118); c.lineTo(x + 40, y - 96); c.lineTo(x + 20, y - 82); c.closePath(); c.fill();
    if (on) E.clear(c, x + 36, y - 40, 60, .4 * on, 1.3);
    E.reset(c);
  };
  // рамка окна, внутри — свет; rain — дождь тонкими штрихами песка
  E.window = function (c, x, y, w, h, o = {}) {
    E.sand(c, 1); const fr = o.fr || 18;
    c.fillRect(x - fr, y - fr, w + fr * 2, fr); c.fillRect(x - fr, y + h, w + fr * 2, fr * 1.6);
    c.fillRect(x - fr, y, fr, h); c.fillRect(x + w, y, fr, h); c.fillRect(x + w / 2 - fr * .3, y, fr * .6, h); c.fillRect(x, y + h * .45, w, fr * .6);
    if (o.rain) {
      c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); E.sand(c, .55); c.lineWidth = 1.6;
      for (let i = 0; i < 70; i++) { const rx = x + hash(i * 3.3) * w, sp = 900 + hash(i) * 500, ry = y + ((hash(i * 7.1) * 2000 + o.t * sp) % (h + 120)) - 60;
        c.beginPath(); c.moveTo(rx, ry); c.lineTo(rx - 5, ry + 26); c.stroke(); }
      // капли на стекле, стекают
      for (let i = 0; i < 18; i++) { const rx = x + hash(i * 9.9) * w, ry = y + ((hash(i * 2.2) * h + o.t * (14 + hash(i) * 30)) % h);
        E.sand(c, .7); c.beginPath(); c.arc(rx, ry, 2.5 + hash(i * 4) * 2, 0, 7); c.fill(); E.sand(c, .25); c.fillRect(rx - 1, ry - 30, 2, 30); }
      c.restore();
    }
    if (o.snow || o.leaves) {
      c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); E.sand(c, .8);
      for (let i = 0; i < 26; i++) { const rx = x + ((hash(i * 3.3) * w + Math.sin(o.t * 1.3 + i) * 20) % w), ry = y + ((hash(i * 7.1) * h + o.t * (60 + hash(i) * 60)) % h);
        if (o.leaves) { c.save(); c.translate(rx, ry); c.rotate(o.t * 2 + i); c.beginPath(); c.ellipse(0, 0, 6, 3, 0, 0, 7); c.fill(); c.restore(); }
        else { c.beginPath(); c.arc(rx, ry, 2.5, 0, 7); c.fill(); } }
      c.restore();
    }
    E.reset(c);
  };
  E.frame = function (c, x, y, w, h) {   // картинка на стене: домик и солнце (детский рисунок)
    E.sand(c, 1); c.lineWidth = 6; c.strokeRect(x, y, w, h);
    c.lineWidth = 3; E.path(c, [[x + w * .2, y + h * .85], [x + w * .2, y + h * .5], [x + w * .45, y + h * .28], [x + w * .7, y + h * .5], [x + w * .7, y + h * .85]]); c.stroke();
    c.beginPath(); c.arc(x + w * .82, y + h * .22, 7, 0, 7); c.stroke(); E.reset(c);
  };
  // дверь: открытость 0 — закрыта (полотно во весь проём), 1 — открыта (полотно ребром)
  E.door = function (c, x, y, w, h, open, inner = 1) {
    E.sand(c, 1); c.fillRect(x - 16, y - 16, w + 32, 16); c.fillRect(x - 16, y, 16, h); c.fillRect(x + w, y, 16, h);
    if (inner) E.clear(c, x + w / 2, y + h * .55, w * .9, .0, 1);
    const pw = w * (1 - clamp(open));
    c.fillRect(x, y, Math.max(6, pw), h);
    if (pw > 30) { E.carve(c, .8); c.lineWidth = 3; c.strokeRect(x + pw * .15, y + h * .08, pw * .7, h * .35); c.strokeRect(x + pw * .15, y + h * .52, pw * .7, h * .38);
      c.beginPath(); c.arc(x + pw * .86, y + h * .5, 5, 0, 7); c.fill(); }
    E.reset(c);
  };
  E.phone = function (c, x, y, ang = 0) {   // телефон в кисти + свечение
    c.save(); c.translate(x, y); c.rotate(ang); E.sand(c, 1); c.fillRect(-5, -16, 10, 28); c.restore(); E.reset(c);
  };
  // волны: полоса моря с пеной
  E.sea = function (c, y0, y1, t, a = .42) {
    E.sand(c, a); c.fillRect(-400, y0, 1600, y1 - y0);
    c.lineWidth = 3;
    for (let i = 0; i < 7; i++) {
      const yy = y0 + (i + .5) / 7 * (y1 - y0), ph = t * (.6 + i * .08) + i;
      const pts = []; for (let x = -300; x <= 1000; x += 24) pts.push([x, yy + Math.sin(x * .02 + ph) * 3 + noise1(x * .01 + i * 9) * 4]);
      E.groove(c, pts, 1.8 + i * .25, .55, 0);
    }
    E.reset(c);
  };
  E.sun = function (c, x, y, r) { E.clear(c, x, y, r * 1.9, .6); E.carve(c, 1); c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); E.reset(c); };
  E.gull = function (c, x, y, s, t) { const fl = Math.sin(t * 7) * .5; E.sand(c, .9); c.lineWidth = 2.6 * s;
    E.path(c, [[x - 16 * s, y - (6 + fl * 6) * s], [x - 6 * s, y - 2 * s], [x, y + 2 * s], [x + 6 * s, y - 2 * s], [x + 16 * s, y - (6 + fl * 6) * s]]); c.stroke(); E.reset(c); };
  // песочный замок; g — насколько построен (0..1), wash — смыт (0..1)
  E.castle = function (c, x, y, s, g, wash = 0, flag = 0) {
    if (g <= 0) return; c.save(); c.translate(x, y); c.scale(s, s);
    const k = clamp(g), a = 1 - wash * .85;
    E.sand(c, a);
    const sink = wash * 40;
    const tow = (cx, w, h, at) => { const hh = h * ss(at, at + .3, k) - sink; if (hh <= 0) return; c.fillRect(cx - w / 2, -hh, w, hh + 2);
      for (let i = 0; i < 3; i++) c.fillRect(cx - w / 2 + i * w / 2.5, -hh - 7, w / 5, 8); };
    tow(0, 52, 70, 0); tow(-46, 34, 52, .25); tow(46, 34, 56, .45); tow(0, 30, 108, .65);
    c.beginPath(); c.ellipse(0, 4, 90 + wash * 50, 10 + wash * 6, 0, 0, 7); c.fill();
    if (k > .3 && wash < .3) { E.carve(c, .85); c.beginPath(); c.arc(0, -10, 9, Math.PI, 0); c.lineTo(9, 0); c.lineTo(-9, 0); c.fill();
      for (const wx of [-46, 46]) if (k > .6) { c.fillRect(wx - 3, -36, 6, 9); } }
    if (flag > 0) { E.sand(c, 1); c.lineWidth = 2.5; c.beginPath(); c.moveTo(0, -115); c.lineTo(0, -115 - 34 * flag); c.stroke();
      c.beginPath(); c.moveTo(0, -115 - 34 * flag); c.lineTo(22 * flag, -108 - 30 * flag + Math.sin(flag * 9) * 2); c.lineTo(0, -100 - 26 * flag); c.fill(); }
    if (wash > 0) E.grains(c, 0, -20, 120, 40, 60, 5, a * .8, 2.2);
    c.restore(); E.reset(c);
  };
  E.umbrella = function (c, x, y, a = 1) { E.sand(c, a); c.lineWidth = 6; E.path(c, [[x, y], [x + 14, y - 250]]); c.stroke();
    c.beginPath(); c.moveTo(x - 110, y - 210); c.quadraticCurveTo(x + 14, y - 330, x + 140, y - 236); c.lineTo(x + 108, y - 222); c.lineTo(x + 76, y - 230); c.lineTo(x + 44, y - 224); c.lineTo(x + 14, y - 232);
    c.lineTo(x - 18, y - 220); c.lineTo(x - 50, y - 222); c.lineTo(x - 80, y - 212); c.closePath(); c.fill(); E.reset(c); };
  E.lounger = function (c, x, y, a = 1) { E.sand(c, a); c.lineWidth = 8; E.path(c, [[x - 90, y - 70], [x - 40, y - 26], [x + 110, y - 26]]); c.stroke();
    c.lineWidth = 6; E.path(c, [[x - 30, y - 26], [x - 40, y]]); c.stroke(); E.path(c, [[x + 100, y - 26], [x + 108, y]]); c.stroke(); E.reset(c); };
  E.car = function (c, x, y, s, a = 1, t = 0) {   // машина в профиль, едет вправо
    c.save(); c.translate(x, y); c.scale(s, s); E.sand(c, a);
    c.beginPath(); c.moveTo(-120, -20); c.lineTo(-118, -52); c.lineTo(-70, -58); c.lineTo(-40, -96); c.lineTo(46, -96); c.lineTo(84, -58); c.lineTo(122, -50); c.lineTo(124, -20); c.closePath(); c.fill();
    E.carve(c, .9); c.beginPath(); c.moveTo(-32, -88); c.lineTo(0, -88); c.lineTo(0, -60); c.lineTo(-58, -60); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(8, -88); c.lineTo(40, -88); c.lineTo(70, -60); c.lineTo(8, -60); c.closePath(); c.fill();
    E.sand(c, a); for (const wx of [-72, 76]) { c.beginPath(); c.arc(wx, -16, 22, 0, 7); c.fill(); E.carve(c, .9); c.lineWidth = 3;
      c.beginPath(); c.arc(wx, -16, 9, t * 9, t * 9 + 4.5); c.stroke(); E.sand(c, a); }
    c.restore(); E.reset(c);
  };
  E.suitcase = function (c, x, y, s = 1, ang = 0) { c.save(); c.translate(x, y); c.rotate(ang); c.scale(s, s); E.sand(c, 1);
    c.fillRect(-22, 0, 44, 58); c.lineWidth = 4; c.strokeRect(-9, -10, 18, 10); E.carve(c, .7); c.fillRect(-22, 24, 44, 3); c.restore(); E.reset(c); };
  E.house = function (c, x, y, a = 1) {   // дом слева, y — земля
    E.sand(c, a); c.fillRect(x, y - 300, 240, 300); c.beginPath(); c.moveTo(x - 30, y - 296); c.lineTo(x + 120, y - 420); c.lineTo(x + 270, y - 296); c.fill();
    E.carve(c, .85); c.fillRect(x + 40, y - 240, 60, 70); c.fillRect(x + 140, y - 240, 60, 70); c.fillRect(x + 150, y - 130, 56, 130);
    E.sand(c, a); c.fillRect(x + 68, y - 240, 5, 70); c.fillRect(x + 40, y - 207, 60, 5); E.reset(c);
  };
  E.fence = function (c, x0, x1, y, a = 1) { E.sand(c, a); for (let x = x0; x < x1; x += 26) { c.fillRect(x, y - 70, 12, 70); c.beginPath(); c.moveTo(x, y - 70); c.lineTo(x + 6, y - 80); c.lineTo(x + 12, y - 70); c.fill(); }
    c.fillRect(x0, y - 52, x1 - x0, 6); c.fillRect(x0, y - 24, x1 - x0, 6); E.reset(c); };
  E.tree = function (c, x, y, s, t, a = 1) { c.save(); c.translate(x, y); c.scale(s, s); E.sand(c, a); c.lineWidth = 16; E.path(c, [[0, 0], [4, -140], [-30, -200]]); c.stroke(); c.lineWidth = 9; E.path(c, [[4, -140], [40, -210]]); c.stroke();
    for (let i = 0; i < 9; i++) { const bx = -60 + hash(i) * 120 + Math.sin(t + i) * 3, by = -230 + hash(i * 3) * 80; E.blob(c, bx, by, 46 + hash(i * 5) * 20, a * .95); }
    c.restore(); E.reset(c); };
  // гигантские песочные часы вокруг пляжа (финальный отъезд)
  E.giantGlass = function (c, cx, cy, h, level, t, streamTo, a = 1) {
    const w = h * .36;
    const glass = (nb) => { if (!nb) c.beginPath(); c.moveTo(cx - w * .5, cy - h / 2); c.bezierCurveTo(cx - w * .5, cy - h * .12, cx - w * .05, cy - h * .08, cx - w * .05, cy);
      c.bezierCurveTo(cx - w * .05, cy + h * .08, cx - w * .5, cy + h * .12, cx - w * .5, cy + h / 2); c.lineTo(cx + w * .5, cy + h / 2); c.bezierCurveTo(cx + w * .5, cy + h * .12, cx + w * .05, cy + h * .08, cx + w * .05, cy);
      c.bezierCurveTo(cx + w * .05, cy - h * .08, cx + w * .5, cy - h * .12, cx + w * .5, cy - h / 2); c.closePath(); };
    // снаружи стекла — толстый песок (стол художника), внутри — свет
    c.save(); E.sand(c, a); c.beginPath(); c.rect(cx - 4000, cy - 4000, 8000, 8000); glass(true); c.fill('evenodd'); c.restore();
    E.sand(c, a); c.fillRect(cx - w * .72, cy - h / 2 - h * .05, w * 1.44, h * .05); c.fillRect(cx - w * .72, cy + h / 2, w * 1.44, h * .05);
    E.carve(c, .9 * a); c.lineWidth = h * .006; glass(); c.stroke();
    for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(cx + sx * w * .62, cy - h / 2); c.lineTo(cx + sx * w * .62, cy + h / 2); c.lineWidth = h * .012; c.stroke(); }
    E.sand(c, a);
    c.save(); glass(); c.clip();
    if (level > 0) { const top = cy - h * .1 * level; c.beginPath(); c.moveTo(cx - w, cy - h * .02 - h * .02); c.lineTo(cx - w, top);
      c.quadraticCurveTo(cx, top + h * .1 * level, cx + w, top); c.lineTo(cx + w, cy); c.lineTo(cx - w, cy); c.closePath(); c.fill(); }
    if (streamTo) E.stream(c, cx, cy - 4, streamTo, Math.max(3, h * .004), t, a, 9);
    c.restore(); E.reset(c);
    return glass;
  };
})();
