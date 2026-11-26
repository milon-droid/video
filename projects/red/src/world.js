// world.js — места: мастерская, класс, улица под дождём, галерея, окно по сезонам, крыльцо; картины-в-картине
const Wd = (() => {
  const { W, H, pal, rgrad, grad, dabs, glow, cl, lerp } = E;
  // слой с параллаксом: depth 0 — бесконечность, 1 — плоскость камеры
  const layer = (c, d, fn) => { E.cam({ x: W / 2 + ((c.x || W / 2) - W / 2) * d, y: H / 2 + ((c.y || H / 2) - H / 2) * d, z: 1 + ((c.z || 1) - 1) * d, r: (c.r || 0) * d }); fn(E.ctx()); };

  // ---------- мастерская ----------
  function studioWall(mood) {
    return E.cache('studio-' + mood, W + 400, H + 300, (x, w, h) => {
      const night = mood === 'night', dust = mood === 'dust';
      x.fillStyle = grad(x, 0, 0, 0, h, [[0, night ? pal(222, 30, 13) : pal(205, 22, 26)], [.6, night ? pal(218, 26, 18) : pal(200, 20, 34)], [1, night ? pal(220, 22, 10) : pal(210, 22, 20)]]); x.fillRect(0, 0, w, h);
      dabs(x, { n: 1400, w, h, len: 70, wid: 24, seed: 3, alpha: .5, angle: (px, py, r) => -.6 + Math.sin(py * .01) * .5 + r() * .4,
        col: (px, py, r) => night ? [215 + r() * 20, 26, 10 + r() * 10] : r() < .25 ? [35 + r() * 10, 30, 30 + r() * 12] : [195 + r() * 25, 18 + r() * 12, 22 + r() * 16 + (1 - py / h) * 6] });
      // окно слева
      const wx = 70, wy = 230, ww = 300, wh = 470;
      x.fillStyle = night ? pal(225, 40, 18) : dust ? pal(42, 50, 70) : pal(205, 45, 62); x.fillRect(wx, wy, ww, wh);
      dabs(x, { n: 220, x0: wx, y0: wy, w: ww, h: wh, len: 40, wid: 14, seed: 9, alpha: .7, angle: () => -.3,
        col: (px, py, r) => night ? [225, 40, 14 + r() * 14] : dust ? [40 + r() * 10, 60, 72 + r() * 12] : [200 + r() * 15, 45, 58 + r() * 18 + (py - wy) / wh * -10] });
      if (night) for (let i = 0; i < 18; i++) { x.fillStyle = 'rgba(255,240,200,.8)'; x.beginPath(); x.arc(wx + E.hash(i) * ww, wy + E.hash(i, 2) * wh * .6, 1.5 + E.hash(i, 3) * 2, 0, 6.283); x.fill(); }
      if (!night) { x.fillStyle = 'rgba(255,240,200,.18)'; x.beginPath(); x.moveTo(wx, wy); x.lineTo(wx + ww, wy); x.lineTo(wx + ww + 420, h); x.lineTo(wx + 120, h); x.fill(); }
      x.strokeStyle = pal(25, 30, 20); x.lineWidth = 16; x.strokeRect(wx, wy, ww, wh); x.lineWidth = 9; x.beginPath(); x.moveTo(wx + ww / 2, wy); x.lineTo(wx + ww / 2, wy + wh); x.moveTo(wx, wy + wh * .45); x.lineTo(wx + ww, wy + wh * .45); x.stroke();
      x.fillStyle = pal(25, 30, 24); x.fillRect(wx - 20, wy + wh, ww + 40, 22);
      // полки с банками кистей
      for (let k = 0; k < 2; k++) { const sy = 330 + k * 200; x.fillStyle = pal(25, 35, 22); x.fillRect(560, sy, 420, 16);
        for (let i = 0; i < 7; i++) { const jx = 580 + i * 56, jc = [[200, 30, 60], [40, 60, 60], [20, 40, 45], [190, 20, 70]][i % 4];
          x.fillStyle = pal(jc[0], jc[1], jc[2], .85); x.beginPath(); x.roundRect(jx, sy - 60, 38, 60, 6); x.fill();
          x.strokeStyle = pal(30, 40, 30); x.lineWidth = 4; for (let b = 0; b < 4; b++) { x.beginPath(); x.moveTo(jx + 8 + b * 7, sy - 55); x.lineTo(jx + 2 + b * 10, sy - 110 - E.hash(i, b) * 30); x.stroke(); } } }
      // холсты у стены
      for (let i = 0; i < 4; i++) { const cx = 520 + i * 120, cw = 150 + E.hash(i, 7) * 60, ch = 220 + E.hash(i, 8) * 90; x.save(); x.translate(cx, h - 40); x.rotate(-.06 + i * .03);
        x.fillStyle = pal(32, 30, 55 - i * 5); x.fillRect(-cw / 2, -ch, cw, ch); x.strokeStyle = pal(28, 30, 28); x.lineWidth = 10; x.strokeRect(-cw / 2, -ch, cw, ch); x.restore(); }
      // пол
      x.fillStyle = grad(x, 0, h - 260, 0, h, [[0, night ? pal(25, 25, 12) : pal(25, 40, 24)], [1, night ? pal(25, 25, 8) : pal(22, 38, 16)]]); x.fillRect(0, h - 250, w, 250);
      dabs(x, { n: 300, y0: h - 250, h: 250, w, len: 120, wid: 10, seed: 5, alpha: .5, angle: () => 0, col: (px, py, r) => [25, 38, (night ? 8 : 18) + r() * 10] });
    });
  }
  function studio(c, t, o = {}) { const mood = o.mood || 'day'; const night = mood === 'night';
    layer(c, .6, x => { x.drawImage(studioWall(mood), -200, -150); });
    // лампа
    if (o.lamp !== false) layer(c, .8, x => { const lx = o.lampX || 470, ly = o.lampY || 160; x.strokeStyle = '#1b1410'; x.lineWidth = 3; x.beginPath(); x.moveTo(lx, -200); x.lineTo(lx, ly); x.stroke();
      x.fillStyle = grad(x, lx - 70, ly, lx + 70, ly + 60, [[0, pal(40, 55, 30)], [1, pal(38, 50, 16)]]); x.beginPath(); x.moveTo(lx - 22, ly); x.lineTo(lx + 22, ly); x.lineTo(lx + 75, ly + 70); x.lineTo(lx - 75, ly + 70); x.fill();
      const fl = 1 + Math.sin(t * 23) * .01 + E.noise(t * 3) * .02; glow(x, lx, ly + 90, 520 * fl, 'rgba(255,190,110,.55)', night ? 1 : .7); glow(x, lx, ly + 75, 90, 'rgba(255,245,210,1)', 1);
      x.fillStyle = '#fff6dc'; x.beginPath(); x.ellipse(lx, ly + 70, 60, 10, 0, 0, 6.283); x.fill(); E.shine(lx, ly + 70, 60); });
    if (o.dust) layer(c, .9, x => { for (let i = 0; i < 70; i++) { const px = (E.hash(i) * W + t * 6 * (E.hash(i, 2) - .3)) % W, py = (E.hash(i, 3) * H * .8 + t * 4 + Math.sin(t + i) * 10) % H;
      x.fillStyle = `rgba(255,235,190,${.25 + E.hash(i, 4) * .4})`; x.beginPath(); x.arc(px, py, 1.5 + E.hash(i, 5) * 2.5, 0, 6.283); x.fill(); } });
  }
  // мольберт с холстом; fn рисует картину в (0,0,w,h)
  function easel(x, cx, by, w, h, fn, o = {}) { x.save(); x.translate(cx, by);
    x.strokeStyle = pal(28, 45, 26); x.lineCap = 'round'; x.lineWidth = 16; x.beginPath(); x.moveTo(-w * .4, 0); x.lineTo(0, -h - 160); x.lineTo(w * .4, 0); x.moveTo(0, -h - 160); x.lineTo(0, 40); x.stroke();
    x.fillStyle = pal(28, 45, 22); x.fillRect(-w * .55, -h * .18, w * 1.1, 16);
    x.save(); x.translate(-w / 2, -h * .18 - h); x.fillStyle = '#efe7d6'; x.fillRect(0, 0, w, h); if (fn) { x.save(); x.beginPath(); x.rect(0, 0, w, h); x.clip(); fn(x, w, h); x.restore(); }
    x.strokeStyle = 'rgba(60,40,25,.6)'; x.lineWidth = 5; x.strokeRect(0, 0, w, h); x.restore();
    if (o.cloth) { x.save(); x.translate(-w / 2, -h * .18 - h); const k = o.cloth; x.fillStyle = grad(x, 0, 0, w, h, [[0, pal(40, 25, 78)], [1, pal(38, 22, 60)]]);
      x.beginPath(); x.moveTo(-20, -15); x.lineTo(w + 20, -15); x.lineTo(w + 30, (h + 40) * k); for (let i = 6; i >= 0; i--) x.quadraticCurveTo(w * (i + .5) / 6, (h + 40) * k + 25, w * i / 6 - (i ? 0 : 20), (h + 40) * k); x.fill();
      x.strokeStyle = pal(36, 20, 52); x.lineWidth = 4; for (let i = 1; i < 6; i++) { x.beginPath(); x.moveTo(w * i / 6, 0); x.quadraticCurveTo(w * i / 6 + 10, (h + 40) * k * .5, w * i / 6 - 5, (h + 40) * k); x.stroke(); } x.restore(); }
    x.restore(); }

  // ---------- картины-в-картине ----------
  function sunsetPic(x, w, h, o = {}) { x.fillStyle = grad(x, 0, 0, 0, h, [[0, pal(265, 40, 35)], [.35, pal(345, 70, 55)], [.6, pal(20, 90, 60)], [.62, pal(30, 80, 45)], [1, pal(220, 50, 22)]]); x.fillRect(0, 0, w, h);
    dabs(x, { n: 120, w, h, len: w * .15, wid: w * .03, seed: 21, alpha: .7, angle: () => .1, col: (px, py, r) => py < h * .6 ? [lerp(270, 380, py / h / .6) % 360, 70, 50 + r() * 15] : [215, 50, 20 + r() * 10] });
    glow(x, w * .5, h * .6, w * .25, 'rgba(255,200,90,.9)', 1); x.fillStyle = pal(40, 100, 75); x.beginPath(); x.arc(w * .5, h * .6, w * .09, Math.PI, 0); x.fill(); }
  function momPic(x, w, h, green) { x.fillStyle = pal(45, 60, 82); x.fillRect(0, 0, w, h); x.lineCap = 'round';
    x.fillStyle = green ? pal(105, 45, 52) : pal(25, 60, 72); x.beginPath(); x.ellipse(w * .5, h * .42, w * .26, h * .25, 0, 0, 6.283); x.fill();
    x.fillStyle = pal(30, 50, 30); x.beginPath(); x.ellipse(w * .5, h * .25, w * .3, h * .14, 0, Math.PI, 0); x.fill();
    x.fillStyle = '#222'; x.beginPath(); x.arc(w * .42, h * .4, w * .03, 0, 6.283); x.arc(w * .58, h * .4, w * .03, 0, 6.283); x.fill();
    x.strokeStyle = green ? pal(110, 50, 32) : pal(355, 70, 45); x.lineWidth = w * .03; x.beginPath(); x.arc(w * .5, h * .5, w * .08, .3, 2.8); x.stroke();
    x.fillStyle = pal(200, 60, 55); x.fillRect(w * .25, h * .68, w * .5, h * .32);
    x.fillStyle = pal(48, 95, 60); x.beginPath(); x.arc(w * .85, h * .13, w * .1, 0, 6.283); x.fill(); }
  return { layer, studio, studioWall, easel, sunsetPic, momPic };
})();
