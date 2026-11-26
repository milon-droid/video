// world2.js — класс, улица под дождём, галерея, стол, окно с морозом, крыльцо, дети-массовка
(() => {
  const { W, H, pal, rgrad, grad, dabs, glow, cl, lerp } = E; const L = Wd.layer;

  Wd.classroom = (c, t) => {
    L(c, .5, x => x.drawImage(E.cache('class', W + 400, H + 300, (x, w, h) => {
      x.fillStyle = grad(x, 0, 0, 0, h, [[0, pal(48, 35, 70)], [1, pal(40, 30, 55)]]); x.fillRect(0, 0, w, h);
      dabs(x, { n: 900, w, h, len: 60, wid: 20, seed: 11, alpha: .45, angle: (px, py, r) => .3 + r() * .3, col: (px, py, r) => [44 + r() * 12, 30, 58 + r() * 18] });
      // доска
      x.fillStyle = pal(160, 30, 24); x.fillRect(140, 180, 760, 380); dabs(x, { n: 200, x0: 140, y0: 180, w: 760, h: 380, len: 50, wid: 16, seed: 4, alpha: .5, angle: () => .1, col: (px, py, r) => [160, 25, 20 + r() * 10] });
      x.strokeStyle = pal(30, 40, 30); x.lineWidth = 18; x.strokeRect(140, 180, 760, 380);
      x.strokeStyle = 'rgba(240,240,230,.7)'; x.lineWidth = 5; x.font = '700 60px Hand'; x.fillStyle = 'rgba(240,240,230,.75)'; x.fillText('Draw your family!', 230, 300);
      // окна
      for (let i = 0; i < 2; i++) { const wx = 20 + i * 900, wy = 200; x.fillStyle = pal(200, 60, 80); x.fillRect(wx, wy, 180, 500); glow(x, wx + 90, wy + 250, 380, 'rgba(255,250,220,.5)', 1); }
      x.fillStyle = pal(30, 30, 40); x.fillRect(0, h - 520, w, 520);
    }), -200, -150));
  };
  // ребёнок-одноклассник (малый масштаб)
  const KIDS = [{ hair: [40, 70, 55], skin: [25, 50, 70], cloth: [210, 50, 50], pig: 1 }, { hair: [20, 30, 14], skin: [24, 40, 50], cloth: [150, 40, 40] },
    { hair: [30, 60, 30], skin: [28, 60, 76], cloth: [280, 30, 50] }, { hair: [45, 80, 65], skin: [26, 55, 74], cloth: [195, 60, 45] }, { hair: [15, 40, 20], skin: [22, 45, 62], cloth: [350, 50, 50], pig: 1 }];
  Wd.kid = (x, i, px, py, s, t, f = {}) => { const k = KIDS[i % KIDS.length];
    return C.fig(x, Object.assign({ who: 'leo', age: 7, x: px, y: py, s, t: t + i, legs: false, cloth: k.cloth, pal: { hair: k.hair, skin: k.skin }, pig: k.pig, noFreckles: true,
      hands: [[-.5, 1.1], [.5, 1.1]], face: Object.assign({ blink: C.blink(t, 10 + i) }, f.face || {}) }, f)); };

  Wd.rainStreet = (c, t) => {
    L(c, .3, x => x.drawImage(E.cache('street', W + 400, H + 300, (x, w, h) => {
      x.fillStyle = grad(x, 0, 0, 0, h, [[0, pal(222, 35, 22)], [.5, pal(215, 30, 30)], [1, pal(220, 30, 14)]]); x.fillRect(0, 0, w, h);
      dabs(x, { n: 700, w, h: h * .55, len: 80, wid: 26, seed: 31, alpha: .5, angle: (px, py, r) => .2 + Math.sin(px * .01) * .3, col: (px, py, r) => [215 + r() * 15, 30, 22 + r() * 14] });
      // дома
      for (let i = 0; i < 7; i++) { const hx = i * 170 - 40, hw = 160, hh = 380 + E.hash(i, 3) * 260, hy = h * .62 - hh; x.fillStyle = pal(220 + E.hash(i) * 20, 22, 14 + E.hash(i, 2) * 8); x.fillRect(hx, hy, hw, hh);
        x.beginPath(); x.moveTo(hx - 10, hy); x.lineTo(hx + hw / 2, hy - 70); x.lineTo(hx + hw + 10, hy); x.fill();
        for (let r = 0; r < 4; r++) for (let q = 0; q < 2; q++) if (E.hash(i, r * 3 + q) > .4) { x.fillStyle = pal(42, 90, 62); x.fillRect(hx + 25 + q * 70, hy + 40 + r * 80, 36, 46); glow(x, hx + 43 + q * 70, hy + 63 + r * 80, 70, 'rgba(255,200,110,.35)', 1); } }
      // мокрая улица с отражениями
      x.fillStyle = grad(x, 0, h * .62, 0, h, [[0, pal(220, 25, 18)], [1, pal(222, 30, 10)]]); x.fillRect(0, h * .62, w, h * .38);
      dabs(x, { n: 500, y0: h * .62, h: h * .38, w, len: 90, wid: 8, seed: 33, alpha: .5, angle: () => 0, col: (px, py, r) => r() < .2 ? [42, 80, 40 + r() * 20] : [218, 25, 14 + r() * 10] });
      for (let i = 0; i < 5; i++) { const lx = 60 + i * 260; x.fillStyle = '#141820'; x.fillRect(lx, h * .2, 10, h * .43); glow(x, lx + 5, h * .2, 140, 'rgba(255,210,120,.6)', 1); x.fillStyle = pal(45, 100, 75); x.beginPath(); x.arc(lx + 5, h * .2, 14, 0, 6.283); x.fill();
        x.fillStyle = 'rgba(255,200,110,.25)'; x.fillRect(lx - 8, h * .66, 26, h * .3); }
    }), -200, -150));
  };
  Wd.rain = (x, t, a = 1, n = 160) => { x.save(); x.strokeStyle = `rgba(200,215,235,${.35 * a})`; x.lineWidth = 2; x.lineCap = 'round';
    for (let i = 0; i < n; i++) { const sp = 900 + E.hash(i, 1) * 500; const px = (E.hash(i) * (W + 300) - 150 + t * 120) % (W + 200) - 100, py = ((E.hash(i, 2) * H + t * sp) % (H + 200)) - 100;
      x.beginPath(); x.moveTo(px, py); x.lineTo(px - 8, py - 40); x.stroke(); } x.restore(); };

  Wd.gallery = (c, t) => {
    L(c, .5, x => x.drawImage(E.cache('gallery', W + 400, H + 300, (x, w, h) => {
      x.fillStyle = grad(x, 0, 0, 0, h, [[0, pal(40, 15, 80)], [.7, pal(38, 14, 70)], [1, pal(30, 20, 40)]]); x.fillRect(0, 0, w, h);
      dabs(x, { n: 700, w, h, len: 70, wid: 22, seed: 41, alpha: .4, angle: () => 1.4, col: (px, py, r) => [40 + r() * 10, 15, 70 + r() * 14] });
      const fr = [[60, 260, 200, 260, 200], [860, 300, 180, 230, 40]]; fr.forEach(([fx, fy, fw, fh, hu], i) => { x.fillStyle = pal(35, 50, 35); x.fillRect(fx - 14, fy - 14, fw + 28, fh + 28); x.fillStyle = pal(hu, 40, 50); x.fillRect(fx, fy, fw, fh);
        dabs(x, { n: 60, x0: fx, y0: fy, w: fw, h: fh, len: 30, wid: 10, seed: 50 + i, angle: () => .5, col: (px, py, r) => [hu + r() * 40, 40, 40 + r() * 20] }); glow(x, fx + fw / 2, fy - 40, 200, 'rgba(255,240,210,.4)', 1); });
      x.fillStyle = grad(x, 0, h - 400, 0, h, [[0, pal(30, 25, 45)], [1, pal(28, 25, 30)]]); x.fillRect(0, h - 400, w, 400);
    }), -200, -150));
  };
  // стол сверху (тёплая лампа)
  Wd.table = (c, t, o = {}) => { L(c, .7, x => x.drawImage(E.cache('table' + (o.night ? 'n' : ''), W + 300, H + 300, (x, w, h) => {
    x.fillStyle = o.night ? pal(28, 35, 14) : pal(30, 40, 28); x.fillRect(0, 0, w, h);
    dabs(x, { n: 900, w, h, len: 160, wid: 14, seed: 61, alpha: .55, angle: (px, py, r) => .05 + Math.sin(py * .02) * .03, col: (px, py, r) => [26 + r() * 8, 40, (o.night ? 10 : 22) + r() * 14] });
    for (let i = 0; i < 30; i++) { const c2 = [[200, 60, 45], [45, 85, 55], [355, 70, 40], [140, 45, 40]][i % 4]; x.fillStyle = pal(c2[0], c2[1], c2[2], .7); x.beginPath(); x.ellipse(E.hash(i, 1) * w, E.hash(i, 2) * h, 6 + E.hash(i, 3) * 14, 4 + E.hash(i, 4) * 8, E.hash(i) * 3, 0, 6.283); x.fill(); }
  }), -150, -150)); L(c, .7, x => glow(x, o.lx || 420, o.ly || 380, 700, 'rgba(255,200,120,.45)', 1)); };
  // тюбик краски лёжа: (cx,cy) центр, длина len, цвет col, ярлык lab (reveal 0..1)
  Wd.tube = (x, cx, cy, len, col, lab, rev = 1, o = {}) => { if (o.label !== false && rev <= 0 && o.old == null) o.old = ''; x.save(); x.translate(cx, cy); x.rotate(o.r || 0); const hh = len * .2;
    x.fillStyle = grad(x, 0, -hh, 0, hh, [[0, '#f2efe8'], [.4, '#d8d4cc'], [1, '#8e8a84']]); x.beginPath(); x.moveTo(-len / 2, -hh * .8); x.lineTo(len * .38, -hh); x.lineTo(len * .38, hh); x.lineTo(-len / 2, hh * .8); x.closePath(); x.fill();
    x.fillStyle = '#9a968e'; for (let i = 0; i < 4; i++) x.fillRect(-len / 2 + i * 6, -hh * .82, 3, hh * 1.64);
    x.fillStyle = grad(x, 0, -hh, 0, hh, [[0, '#555'], [1, '#222']]); x.fillRect(len * .38, -hh * .45, len * .12, hh * .9);
    // цветная полоса и ярлык
    x.fillStyle = col; x.fillRect(-len * .32, -hh * .92, len * .55, hh * 1.84); x.fillStyle = 'rgba(255,255,255,.25)'; x.fillRect(-len * .32, -hh * .8, len * .55, hh * .25);
    if (o.label !== false) { x.fillStyle = '#f4ecd8'; x.beginPath(); x.roundRect(-len * .27, -hh * .62, len * .45, hh * 1.24, 6); x.fill();
      if (o.old) { x.fillStyle = '#5a4a3a'; x.font = `700 ${hh * .5}px Fr`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(o.old, -len * .045, 0); }
      if (lab && rev > 0) { x.fillStyle = '#231a14'; let sz = hh * .9; x.font = `${sz}px Hand`; while (x.measureText(lab).width > len * .42 && sz > 8) { sz *= .92; x.font = `${sz}px Hand`; }
        x.textAlign = 'left'; x.textBaseline = 'middle'; const tw = x.measureText(lab).width; x.save(); x.beginPath(); x.rect(-len * .045 - tw / 2 - 2, -hh, (tw + 4) * rev, hh * 2); x.clip(); x.fillText(lab, -len * .045 - tw / 2, hh * .05); x.restore(); } }
    x.restore(); E.detail(cx, cy, len * .4, .7); };
  // тюбик стоя (колпачок вверх)
  Wd.tubeV = (x, cx, cy, h, col) => { x.save(); x.translate(cx, cy); const w = h * .26;
    x.fillStyle = grad(x, -w, 0, w, 0, [[0, '#8e8a84'], [.35, '#f2efe8'], [1, '#77736c']]); x.beginPath(); x.moveTo(-w * .5, -h * .38); x.lineTo(w * .5, -h * .38); x.lineTo(w * .62, h * .45); x.lineTo(-w * .62, h * .45); x.fill();
    x.fillStyle = '#8a867e'; x.fillRect(-w * .64, h * .44, w * 1.28, h * .06);
    x.fillStyle = col; x.beginPath(); x.moveTo(-w * .52, -h * .2); x.lineTo(w * .52, -h * .2); x.lineTo(w * .58, h * .3); x.lineTo(-w * .58, h * .3); x.fill();
    x.fillStyle = 'rgba(255,255,255,.22)'; x.fillRect(-w * .3, -h * .2, w * .14, h * .5);
    x.fillStyle = grad(x, -w * .3, 0, w * .3, 0, [[0, '#222'], [.4, '#555'], [1, '#1a1a1a']]); x.fillRect(-w * .26, -h * .55, w * .52, h * .18);
    x.restore(); E.detail(cx, cy, h * .5, .6); };
  // окно с морозом и рассветом
  Wd.frost = (c, t, o = {}) => { L(c, .6, x => x.drawImage(E.cache('frost', W + 300, H + 300, (x, w, h) => {
    x.fillStyle = grad(x, 0, 0, 0, h, [[0, pal(215, 50, 40)], [1, pal(205, 40, 60)]]); x.fillRect(0, 0, w, h);
    dabs(x, { n: 800, w, h, len: 50, wid: 16, seed: 71, alpha: .6, angle: (px, py, r) => r() * 6, col: (px, py, r) => [200 + r() * 20, 30 + r() * 20, 55 + r() * 30] });
    for (let i = 0; i < 40; i++) { x.strokeStyle = 'rgba(235,245,255,.5)'; x.lineWidth = 3; const fx = E.hash(i) * w, fy = E.hash(i, 2) * h; for (let b = 0; b < 6; b++) { const a = b * 1.047 + E.hash(i, 3); x.beginPath(); x.moveTo(fx, fy); x.lineTo(fx + Math.cos(a) * 40, fy + Math.sin(a) * 40); x.stroke(); } }
    x.strokeStyle = pal(25, 30, 20); x.lineWidth = 40; x.strokeRect(-10, -10, w + 20, h + 20); x.beginPath(); x.moveTo(w / 2, 0); x.lineTo(w / 2, h); x.stroke();
  }), -150, -150)); };
  // крыльцо с дверью
  Wd.porch = (c, t) => { L(c, .5, x => x.drawImage(E.cache('porch', W + 400, H + 300, (x, w, h) => {
    x.fillStyle = grad(x, 0, 0, 0, h, [[0, pal(210, 25, 40)], [1, pal(30, 20, 30)]]); x.fillRect(0, 0, w, h);
    dabs(x, { n: 700, w, h, len: 70, wid: 20, seed: 81, alpha: .45, angle: () => 1.5, col: (px, py, r) => [205 + r() * 20, 18, 34 + r() * 14] });
    x.fillStyle = pal(215, 40, 26); x.fillRect(240, 120, 440, 900); dabs(x, { n: 150, x0: 240, y0: 120, w: 440, h: 900, len: 120, wid: 18, seed: 82, alpha: .5, angle: () => 1.57, col: (px, py, r) => [215, 40, 22 + r() * 10] });
    x.strokeStyle = pal(30, 30, 18); x.lineWidth = 26; x.strokeRect(240, 120, 440, 900); x.fillStyle = pal(45, 70, 55); x.beginPath(); x.arc(620, 600, 16, 0, 6.283); x.fill();
    x.fillStyle = pal(30, 30, 24); x.fillRect(0, 1020, w, h - 1020); dabs(x, { n: 200, y0: 1020, h: h - 1020, w, len: 140, wid: 10, seed: 83, alpha: .5, angle: () => 0, col: (px, py, r) => [30, 30, 18 + r() * 12] });
    x.fillStyle = pal(100, 20, 30); x.fillRect(260, 1030, 400, 50);
  }), -200, -150)); };
  // посылка
  Wd.box = (x, cx, cy, s, open = 0, label = 'FOR LEO. 18.') => { x.save(); x.translate(cx, cy);
    x.fillStyle = grad(x, -s, -s * .6, s, s * .6, [[0, pal(32, 45, 58)], [1, pal(28, 45, 40)]]); x.fillRect(-s, -s * .55, s * 2, s * 1.1);
    x.fillStyle = pal(30, 40, 46); x.beginPath(); x.moveTo(-s, -s * .55); x.lineTo(-s * .8, -s * .75); x.lineTo(s * 1.2, -s * .75); x.lineTo(s, -s * .55); x.fill();
    x.fillStyle = pal(40, 30, 70, .8); x.fillRect(-s * .12, -s * .55, s * .24, s * 1.1);
    if (label) { x.save(); x.rotate(-.06); x.fillStyle = '#f2ead8'; x.fillRect(-s * .75, -s * .2, s * 1.05, s * .5); x.fillStyle = '#2a1e16'; x.font = `${s * .2}px Hand`; x.textAlign = 'left'; x.textBaseline = 'middle';
      x.fillText(label, -s * .7, s * .05); x.restore(); }
    x.restore(); E.detail(cx, cy, s * .9, .8); };
})();
(() => { const { pal, grad, rgrad, glow } = E;
  // кресло деда (красный бархат — у Лео бурое)
  Wd.armchair = (x, cx, by, s) => { x.save(); x.translate(cx, by); const r = '#9e1c22', d = '#5c0c12', l = '#c8343a';
    x.fillStyle = grad(x, -s, 0, s, 0, [[0, d], [.4, r], [1, d]]); x.beginPath(); x.roundRect(-s * .8, -s * 2.1, s * 1.6, s * 1.6, s * .35); x.fill();
    x.fillStyle = grad(x, 0, -s * .7, 0, 0, [[0, l], [1, d]]); x.beginPath(); x.roundRect(-s * .85, -s * .75, s * 1.7, s * .55, s * .15); x.fill();
    for (const sd of [-1, 1]) { x.fillStyle = grad(x, sd * s, 0, sd * s * .6, 0, [[0, d], [1, r]]); x.beginPath(); x.roundRect(sd > 0 ? s * .62 : -s * 1.08, -s * 1.15, s * .46, s * 1.05, s * .2); x.fill(); }
    x.fillStyle = '#2a1a12'; for (const sd of [-1, 1]) x.fillRect(sd * s * .8 - s * .06, -s * .2, s * .12, s * .2); x.restore(); };
  Wd.tulips = (x, cx, by, s) => { x.save(); x.translate(cx, by); x.strokeStyle = '#3f7a2a'; x.lineWidth = s * .05; x.lineCap = 'round';
    for (let i = 0; i < 5; i++) { const a = (i - 2) * .22; x.beginPath(); x.moveTo(0, -s * .4); x.quadraticCurveTo(Math.sin(a) * s * .3, -s * .9, Math.sin(a) * s * .55, -s * 1.3 - (i % 2) * s * .15); x.stroke(); }
    for (let i = 0; i < 5; i++) { const a = (i - 2) * .22; const hx = Math.sin(a) * s * .55, hy = -s * 1.3 - (i % 2) * s * .15; x.fillStyle = rgrad(x, hx - s * .05, hy - s * .05, 0, s * .2, [[0, '#ef4b45'], [1, '#a3121a']]);
      x.beginPath(); x.moveTo(hx - s * .12, hy - s * .1); x.lineTo(hx - s * .06, hy - s * .2); x.lineTo(hx, hy - s * .12); x.lineTo(hx + s * .06, hy - s * .2); x.lineTo(hx + s * .12, hy - s * .1); x.quadraticCurveTo(hx + s * .13, hy + s * .1, hx, hy + s * .1); x.quadraticCurveTo(hx - s * .13, hy + s * .1, hx - s * .12, hy - s * .1); x.fill(); }
    x.fillStyle = 'rgba(190,215,225,.55)'; x.beginPath(); x.moveTo(-s * .2, -s * .5); x.lineTo(s * .2, -s * .5); x.lineTo(s * .25, 0); x.lineTo(-s * .25, 0); x.fill(); x.restore(); E.shine(cx - s * .1, by - s * .3, s * .2, .8); };
  // холст обратной стороной
  Wd.canvasBack = (x, cx, by, w, h) => { x.save(); x.translate(cx, by); x.fillStyle = pal(36, 30, 62); x.fillRect(-w / 2, -h, w, h); x.strokeStyle = pal(30, 40, 38); x.lineWidth = 22; x.strokeRect(-w / 2 + 11, -h + 11, w - 22, h - 22);
    x.beginPath(); x.moveTo(-w / 2, -h / 2); x.lineTo(w / 2, -h / 2); x.moveTo(0, -h); x.lineTo(0, 0); x.lineWidth = 14; x.stroke(); x.strokeStyle = pal(28, 45, 26); x.lineWidth = 16; x.beginPath(); x.moveTo(-w * .3, h * .35); x.lineTo(0, -h - 60); x.lineTo(w * .3, h * .35); x.stroke(); x.restore(); };
  // окно с сезоном: season 'autumn'|'winter'|'spring'|'sunset'|'gray'
  Wd.seasonWindow = (x, wx, wy, ww, wh, season, t) => { x.save(); x.beginPath(); x.rect(wx, wy, ww, wh); x.clip();
    const S = { autumn: [[35, 60, 60], [20, 70, 45]], winter: [[210, 25, 80], [210, 20, 92]], spring: [[200, 55, 70], [330, 50, 82]], sunset: [[350, 70, 50], [25, 90, 60]], gray: [[210, 12, 62], [210, 10, 55]] }[season];
    x.fillStyle = grad(x, 0, wy, 0, wy + wh, [[0, pal(...S[0])], [1, pal(...S[1])]]); x.fillRect(wx, wy, ww, wh);
    if (season === 'sunset') { glow(x, wx + ww * .5, wy + wh * .65, ww * .7, 'rgba(255,170,80,.9)', 1, 'source-over'); x.fillStyle = '#ffd27a'; x.beginPath(); x.arc(wx + ww * .5, wy + wh * .66, ww * .12, 0, 6.283); x.fill(); x.fillStyle = '#3a1e2a'; x.fillRect(wx, wy + wh * .7, ww, wh * .3); }
    for (let i = 0; i < 40; i++) { const px = wx + (E.hash(i) * ww + t * 20 * (season === 'autumn' ? 1 : .3)) % ww, py = wy + (E.hash(i, 2) * wh + t * (season === 'winter' ? 60 : season === 'spring' ? 25 : 40)) % wh;
      if (season === 'autumn') { x.fillStyle = pal(20 + E.hash(i, 3) * 30, 80, 50); x.beginPath(); x.ellipse(px, py, 9, 5, t + i, 0, 6.283); x.fill(); }
      else if (season === 'winter') { x.fillStyle = 'rgba(255,255,255,.9)'; x.beginPath(); x.arc(px, py, 3 + E.hash(i, 4) * 3, 0, 6.283); x.fill(); }
      else if (season === 'spring') { x.fillStyle = pal(340, 70, 85); x.beginPath(); x.ellipse(px, py, 6, 4, t + i, 0, 6.283); x.fill(); } }
    x.restore(); x.strokeStyle = pal(25, 30, 20); x.lineWidth = 16; x.strokeRect(wx, wy, ww, wh); x.lineWidth = 9; x.beginPath(); x.moveTo(wx + ww / 2, wy); x.lineTo(wx + ww / 2, wy + wh); x.moveTo(wx, wy + wh * .45); x.lineTo(wx + ww, wy + wh * .45); x.stroke(); };
})();
