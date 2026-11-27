// SNOW GLOBE — рисунок: расписная смола внутри шара (свет сверху-слева, лак-блики), лица и руки снаружи, титры.
(function () {
  const { clamp, lerp, ss, hash, noise1 } = E;
  const A = window.A = {};
  // ---------- «смола»: заливка формы с объёмом и лаковым бликом
  function resin(c, path, col, dark, o = {}) {
    const [x0, y0, x1, y1] = o.bb || [-.2, -.2, .2, .2];
    const g = c.createLinearGradient(x1, y0, x0, y1); // свет сверху-слева: y вверх в единицах шара
    g.addColorStop(0, dark); g.addColorStop(.55, col); g.addColorStop(1, o.lite || col);
    c.fillStyle = g; path(); c.fill();
    if (o.gloss !== 0) { // лак
      c.save(); path(); c.clip();
      const cx = lerp(x0, x1, .3), cy = lerp(y0, y1, .72), r = (x1 - x0) * .32;
      const hg = c.createRadialGradient(cx, cy, 0, cx, cy, r);
      hg.addColorStop(0, `rgba(255,255,255,${o.gloss ?? .38})`); hg.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = hg; c.fillRect(x0, y0, x1 - x0, y1 - y0); c.restore();
    }
  }
  A.resin = resin;
  const ell = (c, x, y, rx, ry, r = 0) => { c.beginPath(); c.ellipse(x, y, Math.abs(rx), Math.abs(ry), r, 0, 7); };
  const cap = (c, x0, y0, x1, y1, w) => { c.beginPath(); c.lineWidth = w; c.moveTo(x0, y0); c.lineTo(x1, y1); };

  // ---------- земля-сугроб для слоя (от y земли до низа)
  A.ground = function (c, li, tint = 1) {
    const z = E.LZ[li];
    c.beginPath(); c.moveTo(-1.1, -1.2);
    for (let x = -1.1; x <= 1.1; x += .02) c.lineTo(x, E.ground(x, z) + (li == 2 ? -.05 + .03 * Math.sin(x * 7) : li == 0 ? .04 : 0));
    c.lineTo(1.1, -1.2); c.closePath();
    const g = c.createLinearGradient(0, -.35, 0, -.9);
    g.addColorStop(0, `rgb(${248 * tint | 0},${250 * tint | 0},${255 * tint | 0})`); g.addColorStop(.35, `rgb(${214 * tint | 0},${226 * tint | 0},${242 * tint | 0})`); g.addColorStop(1, `rgb(${150 * tint | 0},${168 * tint | 0},${196 * tint | 0})`);
    c.fillStyle = g; c.fill();
    // искорки снега
    for (let i = 0; i < 60; i++) { const x = hash(i * 3 + li) * 2 - 1, y = E.ground(x, z) - hash(i * 7 + li) * .3; c.fillStyle = `rgba(255,255,255,${.4 + hash(i) * .5})`; c.fillRect(x, y, .004, .004); }
  };
  // ---------- ёлка
  A.tree = function (c, x, y, h, snow = 1) {
    c.fillStyle = '#4a2c1a'; c.fillRect(x - h * .04, y, h * .08, h * .14);
    for (let i = 0; i < 4; i++) {
      const k = i / 4, w = h * (.42 - k * .3), yb = y + h * (.1 + k * .22), yt = yb + h * .36;
      const p = () => { c.beginPath(); c.moveTo(x - w, yb); c.quadraticCurveTo(x, yb - h * .05, x + w, yb); c.lineTo(x, yt); c.closePath(); };
      resin(c, p, '#2f6b4a', '#14382a', { bb: [x - w, yb, x + w, yt], lite: '#4f8f63', gloss: .2 });
      c.fillStyle = 'rgba(250,252,255,.92)'; c.beginPath(); c.moveTo(x - w * .9, yb + h * .01); c.quadraticCurveTo(x - w * .3, yb + h * .07 * snow, x, yb + h * .05);
      c.quadraticCurveTo(x + w * .4, yb + h * .08 * snow, x + w * .9, yb + h * .01); c.quadraticCurveTo(x, yb - h * .03, x - w * .9, yb + h * .01); c.fill();
    }
    c.fillStyle = '#f2c14e'; ell(c, x, y + h * .98, h * .03, h * .03); c.fill();
  };
  // ---------- домик: light — свет в окне 0..1
  A.house = function (c, x, y, s, light, t) {
    const w = .34 * s, h = .22 * s;
    resin(c, () => { c.beginPath(); c.rect(x - w / 2, y, w, h); }, '#a5573a', '#5e2b1c', { bb: [x - w / 2, y, x + w / 2, y + h], lite: '#c67650' });
    // брёвна
    c.strokeStyle = 'rgba(60,25,15,.35)'; c.lineWidth = .004; for (let i = 1; i < 6; i++) { c.beginPath(); c.moveTo(x - w / 2, y + h * i / 6); c.lineTo(x + w / 2, y + h * i / 6); c.stroke(); }
    // труба
    resin(c, () => { c.beginPath(); c.rect(x + w * .18, y + h * 1.25, w * .12, h * .5); }, '#7b3a2a', '#40190f', { bb: [x + w * .18, y + h * 1.2, x + w * .3, y + h * 1.75] });
    // крыша со снежной шапкой
    const roof = () => { c.beginPath(); c.moveTo(x - w * .62, y + h * .95); c.lineTo(x, y + h * 1.75); c.lineTo(x + w * .62, y + h * .95); c.closePath(); };
    resin(c, roof, '#3e2a3a', '#1e1320', { bb: [x - w * .6, y + h, x + w * .6, y + h * 1.75] });
    c.fillStyle = '#f6f9ff'; c.beginPath(); c.moveTo(x - w * .68, y + h * .9); c.quadraticCurveTo(x - w * .3, y + h * 1.05, x, y + h * 1.8);
    c.quadraticCurveTo(x + w * .3, y + h * 1.08, x + w * .68, y + h * .9); c.quadraticCurveTo(x + w * .3, y + h * 1.2, x, y + h * 1.62); c.quadraticCurveTo(x - w * .3, y + h * 1.18, x - w * .68, y + h * .9); c.fill();
    c.fillStyle = '#f6f9ff'; ell(c, x + w * .24, y + h * 1.76, w * .09, h * .06); c.fill();
    // окно
    const wx = x - w * .22, wy = y + h * .35, ww = w * .2, wh = h * .36;
    const fl = light * (.85 + .15 * noise1(t * 3));
    c.fillStyle = `rgb(${lerp(40, 255, fl) | 0},${lerp(30, 190, fl) | 0},${lerp(40, 90, fl) | 0})`; c.fillRect(wx, wy, ww, wh);
    c.strokeStyle = '#3a1d12'; c.lineWidth = .006; c.strokeRect(wx, wy, ww, wh); c.beginPath(); c.moveTo(wx + ww / 2, wy); c.lineTo(wx + ww / 2, wy + wh); c.moveTo(wx, wy + wh / 2); c.lineTo(wx + ww, wy + wh / 2); c.stroke();
    if (fl > .05) { const g = c.createRadialGradient(wx + ww / 2, wy + wh / 2, 0, wx + ww / 2, wy + wh / 2, w * .6);
      g.addColorStop(0, `rgba(255,190,90,${.45 * fl})`); g.addColorStop(1, 'rgba(255,160,60,0)'); c.fillStyle = g; c.fillRect(wx - w, wy - w, w * 2, w * 2); }
    // дверь
    resin(c, () => { c.beginPath(); c.rect(x + w * .1, y, w * .17, h * .62); }, '#5a2e1c', '#2c140b', { bb: [x + w * .1, y, x + w * .27, y + h * .62] });
    c.fillStyle = '#f6f9ff'; ell(c, x, y + .004, w * .56, .014); c.fill();
  };
  // ---------- снеговик: size 0..1 (растёт с годами), fall — наклон (упал)
  A.snowman = function (c, x, y, s, o = {}) {
    if (s <= 0) return;
    c.save(); c.translate(x, y); c.rotate(o.tilt || 0);
    const r = [.075, .055, .04].map(v => v * s);
    let yy = r[0] * .9;
    const balls = [];
    for (let i = 0; i < 3; i++) { balls.push([0, yy, r[i]]); yy += r[i] * 1.55 + (r[i + 1] || 0) * .3; }
    for (const [bx, by, br] of balls) resin(c, () => ell(c, bx, by, br, br * .95), '#f4f7fc', '#b6c4da', { bb: [bx - br, by - br, bx + br, by + br], lite: '#ffffff', gloss: .5 });
    const [hx, hy, hr] = balls[2];
    c.fillStyle = '#1b1b22'; ell(c, hx - hr * .35, hy + hr * .2, hr * .1, hr * .12); c.fill(); ell(c, hx + hr * .3, hy + hr * .22, hr * .1, hr * .12); c.fill();
    c.fillStyle = '#e8772e'; c.beginPath(); c.moveTo(hx - hr * .05, hy + hr * .05); c.lineTo(hx + hr * .9, hy - hr * .05); c.lineTo(hx - hr * .05, hy - hr * .16); c.fill();
    for (let i = 0; i < 3; i++) { c.fillStyle = '#1b1b22'; ell(c, 0, balls[1][1] + balls[1][2] * (.5 - i * .45), r[1] * .07, r[1] * .07); c.fill(); }
    c.strokeStyle = '#5a3820'; c.lineWidth = .006 * s + .002; const by1 = balls[1][1];
    c.beginPath(); c.moveTo(-r[1] * .8, by1); c.lineTo(-r[1] * 2.1, by1 + r[1] * .9 * (o.wave || 1)); c.moveTo(r[1] * .8, by1); c.lineTo(r[1] * 2, by1 + r[1] * .6); c.stroke();
    if (s > .75) { // шарф у взрослого снеговика — подарок героя
      c.fillStyle = '#c8323a'; c.fillRect(-r[1] * .8, by1 + r[1] * .75, r[1] * 1.6, r[1] * .28); c.fillRect(r[1] * .3, by1 + r[1] * .2, r[1] * .25, r[1] * .6);
    }
    c.restore();
  };
  // ---------- человечек (расписная фигурка). p: x,y (ступни), s (масштаб), lean, fall (поворот вокруг ступней), aL, aR (рука, рад от вниз),
  // run (фаза бега), mouth 0..1 (открыт), smile -1..1, blink 0..1, look (-1..1), sit 0..1
  A.man = function (c, p) {
    const s = p.s || 1; c.save(); c.translate(p.x, p.y); c.rotate(p.fall || 0); c.scale(s * (p.flip ? -1 : 1), s * (1 - (p.sq || 0)));
    const lean = p.lean || 0, run = p.run, sit = p.sit || 0;
    // ноги
    const leg = (side, ph) => {
      const hipX = side * .018, hipY = .1 - sit * .04;
      let fx = side * .02, fy = 0;
      if (run !== undefined) { fx = Math.sin(run + ph) * .05; fy = Math.max(0, Math.cos(run + ph)) * .03; }
      if (sit) { fx = lerp(fx, .06, sit); fy = lerp(fy, .045, sit); }
      c.strokeStyle = '#2d3b4f'; cap(c, hipX, hipY, (hipX + fx) / 2 + sit * .03, (hipY + fy) / 2 + .01, .03); c.stroke(); c.lineTo(fx, fy + .012); c.stroke();
      resin(c, () => ell(c, fx + .01, fy + .008, .022, .013), '#3a2418', '#1a0d07', { bb: [fx - .012, fy, fx + .032, fy + .02], gloss: .3 });
    };
    leg(-1, 0); leg(1, Math.PI);
    c.save(); c.translate(0, .1 - sit * .04); c.rotate(-lean);
    // пальто
    const coat = () => { c.beginPath(); c.moveTo(-.04, 0); c.quadraticCurveTo(-.05, .07, -.032, .12); c.lineTo(.032, .12); c.quadraticCurveTo(.05, .07, .04, 0); c.closePath(); };
    resin(c, coat, '#2f6fb0', '#163b66', { bb: [-.05, 0, .05, .12], lite: '#4f92d4' });
    c.fillStyle = '#e9d9a6'; for (let i = 0; i < 3; i++) { ell(c, .004, .025 + i * .03, .004, .004); c.fill(); }
    // руки: угол от «вниз»
    const arm = (side, ang) => {
      const sx = side * .036, sy = .105, L = .07;
      const ex = sx + Math.sin(ang) * L * side, ey = sy - Math.cos(ang) * L;
      c.strokeStyle = '#2a64a2'; cap(c, sx, sy, ex, ey, .024); c.stroke();
      resin(c, () => ell(c, ex, ey, .016, .016), '#c8323a', '#7a1a20', { bb: [ex - .016, ey - .016, ex + .016, ey + .016] });
    };
    arm(-1, p.aL ?? .25); arm(1, p.aR ?? .25);
    // шарф
    c.fillStyle = '#c8323a'; c.beginPath(); c.ellipse(0, .122, .036, .014, 0, 0, 7); c.fill();
    const fl = Math.sin((p.t || 0) * 6) * .01 + (p.wind || 0);
    c.beginPath(); c.moveTo(.012, .12); c.quadraticCurveTo(.03 + fl, .09, .022 + fl * 2, .06); c.lineTo(.008 + fl * 2, .062); c.quadraticCurveTo(.015, .09, -.004, .118); c.fill();
    // голова
    c.save(); c.translate(0, .158); c.rotate((p.look || 0) * .25);
    resin(c, () => ell(c, 0, 0, .036, .038), '#f2c4a0', '#c98868', { bb: [-.036, -.038, .036, .038], lite: '#ffe0c4', gloss: .3 });
    c.fillStyle = 'rgba(230,110,110,.45)'; ell(c, -.02, -.01, .009, .006); c.fill(); ell(c, .02, -.01, .009, .006); c.fill();
    const lk = (p.look || 0) * .006, bl = 1 - (p.blink || 0) * .9;
    c.fillStyle = '#1a1420'; ell(c, -.012 + lk, .004, .0045, .0062 * bl); c.fill(); ell(c, .012 + lk, .004, .0045, .0062 * bl); c.fill();
    if (bl > .5) { c.fillStyle = '#fff'; ell(c, -.0105 + lk, .0065, .0015, .0015); c.fill(); ell(c, .0135 + lk, .0065, .0015, .0015); c.fill(); }
    // брови
    c.strokeStyle = '#6b3b22'; c.lineWidth = .0035; const br = p.brow || 0;
    c.beginPath(); c.moveTo(-.019, .016 + br * .004); c.lineTo(-.006, .018 - br * .003); c.moveTo(.006, .018 - br * .003); c.lineTo(.019, .016 + br * .004); c.stroke();
    // рот
    const m = p.mouth || 0, sm = p.smile ?? .6;
    if (m > .1) { c.fillStyle = '#5a1a22'; ell(c, 0, -.017, .009, .004 + m * .008); c.fill(); }
    else { c.strokeStyle = '#7a2a2a'; c.lineWidth = .003; c.beginPath(); c.moveTo(-.009, -.015 + sm * .002); c.quadraticCurveTo(0, -.015 - sm * .007, .009, -.015 + sm * .002); c.stroke(); }
    // шапка с помпоном
    resin(c, () => { c.beginPath(); c.moveTo(-.038, .012); c.quadraticCurveTo(-.03, .05, 0, .056); c.quadraticCurveTo(.03, .05, .038, .012); c.closePath(); }, '#c8323a', '#7a1a20', { bb: [-.04, .01, .04, .056] });
    c.fillStyle = '#eee4d4'; c.fillRect(-.039, .006, .078, .012);
    resin(c, () => ell(c, .004, .062, .013, .013), '#f6f0e6', '#c9bba6', { bb: [-.01, .05, .018, .075] });
    c.restore(); c.restore(); c.restore();
  };

  // ================= СНАРУЖИ (экранные px; фон OUT размыт оптикой) =================
  // лицо человека. o: age ('g6','g10','g14','w','b6'), x,y (центр), s (масштаб: 1 ≈ лицо 300px шириной), smile, mouth, blink, look[x,y], glow (телефон)
  A.face = function (c, o) {
    const s = o.s; c.save(); c.translate(o.x, o.y); c.scale(s, s); c.rotate(o.tilt || 0);
    const P = { g6: { hair: '#8a4a26', w: 150, h: 160, hat: '#c8323a', eye: 22 }, g10: { hair: '#8a4a26', w: 145, h: 168, hat: '#c8323a', eye: 20 },
      g14: { hair: '#7a3f20', w: 138, h: 178, hat: null, eye: 18, phones: 1 }, w: { hair: '#6e3a1e', w: 136, h: 182, hat: null, eye: 17, scarf: '#c8323a' },
      b6: { hair: '#9a5a2c', w: 150, h: 158, hat: '#2f6fb0', eye: 22 } }[o.age];
    const fw = P.w, fh = P.h;
    // волосы сзади
    c.fillStyle = P.hair;
    if (o.age == 'g6' || o.age == 'g10') { ell(c, -fw * 1.05, 40, 38, 70, .3); c.fill(); ell(c, fw * 1.05, 40, 38, 70, -.3); c.fill(); }
    if (o.age == 'g14') { c.beginPath(); c.moveTo(-fw * 1.1, -60); c.quadraticCurveTo(-fw * 1.3, 120, -fw * .9, 230); c.lineTo(fw * .9, 230); c.quadraticCurveTo(fw * 1.3, 120, fw * 1.1, -60); c.fill(); }
    if (o.age == 'w') { ell(c, 0, -fh * 1.05, 70, 55); c.fill(); }
    // шея/плечи
    const sh = o.age == 'w' ? '#3c4a5e' : o.age == 'g14' ? '#5a4b7a' : o.age == 'b6' ? '#d9a13a' : '#b8573e';
    c.fillStyle = sh; c.beginPath(); c.moveTo(-fw * 2.2, fh * 2.6); c.quadraticCurveTo(-fw * 1.6, fh * 1.05, 0, fh * 1.0); c.quadraticCurveTo(fw * 1.6, fh * 1.05, fw * 2.2, fh * 2.6); c.fill();
    if (P.scarf) { c.fillStyle = P.scarf; ell(c, 0, fh * 1.02, fw * .8, 34); c.fill(); }
    // лицо
    const sk = c.createRadialGradient(-fw * .3, -fh * .35, 10, 0, 0, fw * 1.25);
    sk.addColorStop(0, '#ffe0c8'); sk.addColorStop(.6, '#f0b896'); sk.addColorStop(1, '#c98466');
    c.fillStyle = sk; ell(c, 0, 0, fw, fh); c.fill();
    if (o.glow) { const g = c.createLinearGradient(0, fh, 0, -fh); g.addColorStop(0, `rgba(140,190,255,${.5 * o.glow})`); g.addColorStop(1, 'rgba(140,190,255,0)'); c.fillStyle = g; ell(c, 0, 0, fw, fh); c.fill(); }
    // веснушки (сквозная черта: девочка = женщина = сын)
    c.fillStyle = 'rgba(160,80,50,.45)'; for (let i = 0; i < 14; i++) { const sx = (i % 2 ? 1 : -1) * (35 + hash(i) * 45), sy = 15 + hash(i * 3) * 30; ell(c, sx, sy, 3.2, 3.2); c.fill(); }
    // щёки
    c.fillStyle = 'rgba(235,110,110,.3)'; ell(c, -fw * .55, fh * .25, 30, 20); c.fill(); ell(c, fw * .55, fh * .25, 30, 20); c.fill();
    // глаза
    const lx = (o.look ? o.look[0] : 0) * 8, ly = (o.look ? o.look[1] : 0) * 6, bl = 1 - (o.blink || 0), er = P.eye;
    for (const sx of [-1, 1]) {
      const ex = sx * fw * .38, ey = -fh * .08;
      c.fillStyle = '#fff'; ell(c, ex, ey, er * 1.25, er * 1.05 * bl + .5); c.fill();
      if (bl > .2) { c.save(); ell(c, ex, ey, er * 1.25, er * 1.05 * bl); c.clip();
        c.fillStyle = '#4a7a5a'; ell(c, ex + lx, ey + ly, er * .75, er * .75); c.fill(); c.fillStyle = '#141018'; ell(c, ex + lx, ey + ly, er * .38, er * .38); c.fill();
        c.fillStyle = '#fff'; ell(c, ex + lx - er * .25, ey + ly - er * .3, er * .2, er * .2); c.fill(); c.restore(); }
      c.strokeStyle = '#4a2a1a'; c.lineWidth = 4; c.beginPath(); c.ellipse(ex, ey, er * 1.25, er * 1.05 * bl + .5, 0, Math.PI * 1.05, Math.PI * 1.95); c.stroke();
      // бровь
      const bw = o.brow || 0; c.strokeStyle = P.hair; c.lineWidth = 7; c.beginPath(); c.moveTo(ex - sx * er * 1.2, ey - er * 1.9 + bw * 6 * sx * 0); c.quadraticCurveTo(ex, ey - er * 2.4 - bw * 8, ex + sx * er * 1.3, ey - er * 1.7 - bw * 4); c.stroke();
    }
    // нос
    c.strokeStyle = 'rgba(150,80,60,.6)'; c.lineWidth = 4; c.beginPath(); c.moveTo(-6, fh * .05); c.quadraticCurveTo(-12, fh * .2, 2, fh * .24); c.stroke();
    // рот
    const m = o.mouth || 0, sm = o.smile ?? .5;
    if (m > .08) { c.fillStyle = '#6a1e28'; c.beginPath(); c.moveTo(-30 - sm * 8, fh * .45); c.quadraticCurveTo(0, fh * .45 + 50 * m + sm * 10, 30 + sm * 8, fh * .45); c.quadraticCurveTo(0, fh * .45 + 8 - sm * 6, -30 - sm * 8, fh * .45); c.fill();
      c.fillStyle = '#fff'; c.fillRect(-18, fh * .45 + 2 - sm * 3, 36, 8 * Math.min(1, m * 2)); }
    else { c.strokeStyle = '#8a3a3a'; c.lineWidth = 6; c.beginPath(); c.moveTo(-28, fh * .45 - sm * 8); c.quadraticCurveTo(0, fh * .45 + sm * 22, 28, fh * .45 - sm * 8); c.stroke(); }
    // волосы спереди / шапка
    c.fillStyle = P.hair;
    c.beginPath(); c.moveTo(-fw * 1.02, -fh * .1); c.quadraticCurveTo(-fw * .9, -fh * 1.15, 0, -fh * 1.08); c.quadraticCurveTo(fw * .9, -fh * 1.15, fw * 1.02, -fh * .1);
    c.quadraticCurveTo(fw * .7, -fh * .75, fw * .1, -fh * .62); c.quadraticCurveTo(-fw * .5, -fh * .8, -fw * 1.02, -fh * .1); c.fill();
    if (P.hat) {
      const hg = c.createLinearGradient(0, -fh * 1.5, 0, -fh * .5); hg.addColorStop(0, P.hat); hg.addColorStop(1, '#5a1018');
      c.fillStyle = hg; c.beginPath(); c.moveTo(-fw * 1.08, -fh * .55); c.quadraticCurveTo(-fw, -fh * 1.55, 0, -fh * 1.55); c.quadraticCurveTo(fw, -fh * 1.55, fw * 1.08, -fh * .55); c.fill();
      c.fillStyle = '#efe6d8'; c.beginPath(); c.roundRect(-fw * 1.12, -fh * .72, fw * 2.24, fh * .26, 20); c.fill();
      c.fillStyle = '#f6f0e6'; ell(c, 0, -fh * 1.62, 38, 36); c.fill();
    }
    if (P.phones) { c.strokeStyle = '#222'; c.lineWidth = 16; c.beginPath(); c.arc(0, -fh * .2, fw * 1.12, Math.PI * 1.05, Math.PI * 1.95); c.stroke(); c.fillStyle = '#2a2a30'; ell(c, -fw * 1.05, -fh * .05, 26, 44); c.fill(); ell(c, fw * 1.05, -fh * .05, 26, 44); c.fill(); }
    c.restore();
  };
  // боке-гирлянда и комната
  A.room = function (c, kind, t, k = 1) {
    const g = c.createLinearGradient(0, -192, 0, 1472);
    const pal = { night: ['#2a1c22', '#4a2e26', '#1c1216'], teen: ['#1c1e2c', '#2c2a3a', '#121218'], attic: ['#0a0a10', '#14121a', '#060608'],
      kitchen: ['#e8d6bc', '#c9a888', '#7a5a44'], box: ['#3a2814', '#2a1c0e', '#140c06'], floor: ['#1a1410', '#3a2a1e', '#22160e'] }[kind];
    g.addColorStop(0, pal[0]); g.addColorStop(.6, pal[1]); g.addColorStop(1, pal[2]); c.fillStyle = g; c.fillRect(-108, -192, 936, 1664);
    if (kind == 'night' || kind == 'kitchen') { // окно со снегом
      const wx = kind == 'night' ? 470 : 80, wy = 80;
      c.fillStyle = kind == 'night' ? '#1d3352' : '#cfe3f5'; c.fillRect(wx, wy, 300, 420);
      c.strokeStyle = kind == 'night' ? '#120c0c' : '#f4ece0'; c.lineWidth = 18; c.strokeRect(wx, wy, 300, 420); c.beginPath(); c.moveTo(wx + 150, wy); c.lineTo(wx + 150, wy + 420); c.stroke();
      c.fillStyle = 'rgba(255,255,255,.8)'; for (let i = 0; i < 50; i++) { const x = wx + hash(i) * 300, y = wy + ((hash(i * 2) * 420 + t * (30 + hash(i * 5) * 30)) % 420); c.fillRect(x, y, 4, 4); }
    }
    if (kind == 'night' || kind == 'teen') { // гирлянда-боке
      const cols = ['#ffb347', '#ff5a5a', '#7ad0ff', '#ffe07a', '#9aff9a'];
      for (let i = 0; i < 34; i++) { const x = -60 + i * 30 + 40 * Math.sin(i), y = 120 + 90 * Math.sin(i * .6) + (i % 3) * 40;
        const a = (kind == 'teen' ? .35 : .8) * (.6 + .4 * Math.sin(t * 2 + i * 1.7)) * k;
        const gg = c.createRadialGradient(x, y, 0, x, y, 34); gg.addColorStop(0, cols[i % 5]); gg.addColorStop(1, 'rgba(0,0,0,0)');
        c.globalAlpha = a; c.fillStyle = gg; c.fillRect(x - 34, y - 34, 68, 68); }
      c.globalAlpha = 1;
      // ёлка-силуэт
      c.fillStyle = 'rgba(20,40,30,.85)'; c.beginPath(); c.moveTo(-40, 1300); c.lineTo(130, 560); c.lineTo(300, 1300); c.fill();
    }
    if (kind == 'attic' || kind == 'box') { c.strokeStyle = kind == 'attic' ? 'rgba(60,50,60,.6)' : 'rgba(90,60,30,.5)'; c.lineWidth = 30;
      for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(-108 + i * 260, -192); c.lineTo(-108 + i * 260 + 200, 1472); c.stroke(); } }
    if (kind == 'floor' || kind == 'attic') { // доски пола
      c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 4; for (let i = 0; i < 12; i++) { c.beginPath(); c.moveTo(-108, 800 + i * 60 + i * i * 4); c.lineTo(828, 780 + i * 60 + i * i * 4); c.stroke(); }
    }
    if (kind == 'kitchen') { c.fillStyle = 'rgba(255,240,210,.5)'; const gg = c.createRadialGradient(230, 280, 0, 230, 280, 500); gg.addColorStop(0, 'rgba(255,245,220,.8)'); gg.addColorStop(1, 'rgba(255,245,220,0)'); c.fillStyle = gg; c.fillRect(-108, -192, 936, 1664); }
  };

  // ================= ПЕРЕДНИЙ ПЛАН (экран) =================
  // подставка шара, табличка с надписью
  A.base = function (c, label) {
    const C = E.projG([0, -.8, .0]), B = E.projG([0, -1.25, 0]), s = C.s;
    const top = C.y, bot = B.y, wt = .64 * s, wb = .95 * s, cx = (C.x + B.x) / 2;
    const g = c.createLinearGradient(cx - wb, 0, cx + wb, 0); g.addColorStop(0, '#2a140a'); g.addColorStop(.3, '#7a4524'); g.addColorStop(.45, '#a86438'); g.addColorStop(1, '#1e0e06');
    c.fillStyle = g; c.beginPath(); c.moveTo(C.x - wt, top); c.bezierCurveTo(C.x - wt * .9, top + s * .25, B.x - wb, bot - s * .2, B.x - wb, bot);
    c.ellipse(B.x, bot, wb, s * .08, 0, Math.PI, 0, true); c.bezierCurveTo(B.x + wb, bot - s * .2, C.x + wt * .9, top + s * .25, C.x + wt, top);
    c.ellipse(C.x, top, wt, s * .06, 0, 0, Math.PI, false); c.fill();
    c.fillStyle = 'rgba(255,220,170,.15)'; c.fillRect(C.x - wt * .6, top + s * .02, wt * .2, (bot - top) * .8);
    if (label) { // латунная табличка
      const pw = s * .5, ph = s * .13, px = cx - pw / 2, py = top + (bot - top) * .45;
      const pg = c.createLinearGradient(px, py, px + pw, py + ph); pg.addColorStop(0, '#d8b46a'); pg.addColorStop(.5, '#f6e2a6'); pg.addColorStop(1, '#a8823e');
      c.fillStyle = pg; c.beginPath(); c.roundRect(px, py, pw, ph, ph * .2); c.fill();
      drawBoxText(c, label, px, py, pw, ph, { font: z => `900 ${z}px IB`, size: Math.round(ph * .55), min: 6, color: '#4a3010', pad: .1, lines: 1 });
    }
    return { cx, top, bot, s };
  };
  // руки в варежках/без: держат шар с боков. o.kind 'mit' | 'skin' | 'kid'
  A.hands = function (c, o) {
    const C = E.projG([0, 0, 0]), s = C.s;
    for (const sd of [-1, 1]) {
      const x = C.x + sd * s * (o.spread || 1.02), y = C.y + s * (o.dy ?? .35);
      c.save(); c.translate(x, y); c.scale(sd, 1); c.rotate(o.rot || 0);
      const col = o.kind == 'skin' ? ['#f0b896', '#b8765a'] : o.kind == 'kid' ? ['#f4c4a4', '#c4866a'] : ['#c8323a', '#6a121a'];
      const g = c.createLinearGradient(-s * .3, -s * .3, s * .2, s * .3); g.addColorStop(0, col[0]); g.addColorStop(1, col[1]);
      c.fillStyle = g; c.beginPath(); c.moveTo(s * .05, -s * .45); c.quadraticCurveTo(-s * .2, -s * .5, -s * .05, -s * .05); c.quadraticCurveTo(-s * .02, s * .2, s * .25, s * .4);
      c.lineTo(s * .55, s * .55); c.lineTo(s * .55, s * .05); c.quadraticCurveTo(s * .3, -s * .3, s * .05, -s * .45); c.fill();
      if (o.kind == 'mit') { c.strokeStyle = 'rgba(255,220,220,.25)'; c.lineWidth = 3; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(-s * .05, -s * .35 + i * s * .12); c.lineTo(s * .3, -s * .3 + i * s * .12); c.stroke(); } }
      else { c.strokeStyle = 'rgba(120,60,40,.35)'; c.lineWidth = 3; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-s * .06, -s * .2 + i * s * .12); c.quadraticCurveTo(s * .05, -s * .16 + i * s * .12, s * .15, -s * .2 + i * s * .12); c.stroke(); } }
      // манжета
      c.fillStyle = o.cuff || '#efe6d8'; c.beginPath(); c.moveTo(s * .3, s * .45); c.lineTo(s * .6, s * .62); c.lineTo(s * .7, s * .1); c.lineTo(s * .5, -s * .02); c.fill();
      c.restore();
    }
  };
  // трещина на стекле: от точки на сфере (в системе шара)
  A.crack = function (c, pG, k, t) {
    if (k <= 0) return; const C = E.projG(pG); const s = E.projG([0, 0, 0]).s;
    c.save(); c.strokeStyle = 'rgba(235,245,255,.9)'; c.lineWidth = 2.2; c.shadowColor = 'rgba(255,255,255,.6)'; c.shadowBlur = 4;
    for (let i = 0; i < 7; i++) { let x = C.x, y = C.y, a = i * .9 + .3; const L = s * (.12 + hash(i) * .3) * k;
      c.beginPath(); c.moveTo(x, y); for (let j = 0; j < 6; j++) { a += (hash(i * 10 + j) - .5) * .9; x += Math.cos(a) * L / 6; y += Math.sin(a) * L / 6; c.lineTo(x, y); } c.stroke(); }
    c.beginPath(); c.arc(C.x, C.y, s * .05 * k, 0, 7); c.stroke(); c.restore();
  };
  // титр в плашке (только через text-fit)
  A.cap = function (c, text, y, o = {}) {
    const a = o.a ?? 1; if (a <= 0) return; const size = o.size || 46, font = z => `900 ${z}px IB`;
    const maxW = o.maxW || 680; const bx = boxFor(c, text, { font, size, maxW, pad: .08, lineH: 1.12 });
    const w = Math.min(maxW, bx.w + 10), h = bx.h + 6, x = (E.W - w) / 2;
    c.save(); c.globalAlpha = a; c.translate(E.W / 2, y + h / 2); const sc = o.pop ?? 1; c.scale(sc, sc); c.translate(-E.W / 2, -(y + h / 2));
    if (o.plate !== false) { c.fillStyle = o.bg || 'rgba(12,16,28,.8)'; c.beginPath(); c.roundRect(x, y, w, h, 18); c.fill(); }
    drawBoxText(c, text, x, y, w, h, { font, size, min: 24, color: o.color || '#fff', pad: .08, lines: 3, lineH: 1.12 });
    c.restore();
  };
  A.tag = function (c, text, a = 1) { // дата в углу
    if (a <= 0) return; c.save(); c.globalAlpha = a; const font = z => `600 ${z}px IS`;
    const bx = boxFor(c, text, { font, size: 30, maxW: 400, pad: .1 }); const w = bx.w + 8, h = bx.h + 2;
    c.fillStyle = 'rgba(255,250,240,.9)'; c.beginPath(); c.roundRect(60, 150, w, h, 10); c.fill();
    drawBoxText(c, text, 60, 150, w, h, { font, size: 30, min: 16, color: '#3a2010', pad: .1, lines: 1 }); c.restore();
  };
})();
