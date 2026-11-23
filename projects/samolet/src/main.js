// Камера, кадр, титры, печать.
window.SCENE = { duration: REAL_DUR, fps: 30, width: CW, height: CH };
var CUR_T = 0;
const V = (cx, cy, vw) => ({ cx, cy, vw });
const mixC = (a, b, u) => V(lerp(a.cx, b.cx, u), lerp(a.cy, b.cy, u), Math.exp(lerp(Math.log(a.vw), Math.log(b.vw), u)));
const C0 = V(720, 1020, 1200), C1 = V(600, 1235, 600), C2 = V(700, 1080, 1050);
const B0 = V(BENCH_X + 100, 1250, 1060), B1 = V(BENCH_X + 95, 1300, 700), B2 = V(BENCH_X - 120, 1180, 1100);
function follow(t) {
  const p = planeAt(t); if (!p.fly) return null;
  const fwd = p.dir > 0;
  return V(p.x + (fwd ? 170 : -220), clamp(1080 + (p.y - 950) * .4, 980, 1200), fwd ? 1060 : 1500);
}
function camera(t) {
  const s = sOf(t);
  let c;
  if (s < .75 && (t < 5 || t >= DUR - LOOP)) c = C0;
  else if (t < 4.6) c = mixC(C0, mixC(C1, V(590, 1235, 560), sstep(1.2, 4.6, s)), sstep(.75, 1.2, s));
  else if (t < 5.7) c = mixC(V(590, 1235, 560), C2, sstep(4.6, 5.2, t));
  else if (t < 30.0) c = mixC(C2, follow(t), sstep(5.7, 6.9, t));
  else if (t < 31.5) c = mixC(follow(Math.min(t, 30.99)) || B0, B0, sstep(30.0, 30.9, t));
  else if (t < 35.0) c = mixC(B0, B1, sstep(31.5, 31.9, t));
  else if (t < 37.8) c = mixC(CLOSE, B1, sstep(35.8, 36.4, t));
  else if (t < 38.8) c = mixC(B1, B2, sstep(37.8, 38.3, t));
  else if (t < DUR - LOOP) { c = mixC(B2, follow(t), sstep(38.8, 39.6, t)); c = mixC(c, C0, sstep(43.6, 44.5, t)); }
  const [x, y] = shake(t, [[5.62, 5, .3], [38.75, 5, .3]]);
  return V(c.cx + x * c.vw / CW, c.cy + y * c.vw / CW, c.vw);
}
// титры (английский)
const CAPS = [
  [1.35, 3.2, ['“No… better”?', 'What?']],
  [3.7, 5.85, ['Are we rich?', 'Are we famous?']],
  [5.95, 7.4, ['Hello, future me!']],
  [31.2, 35.0, ['“Hello, future me.', 'Are we rich? Are we famous?”']],
  [35.0, 36.3, ['Better…']],
  [37.3, 40.0, ['It goes fast.', 'Have fun.']],
];
const HCAPS = [[HK, .6, 1.6, ['From… me?!']], [HO, .05, 2.35, ['Rich? Famous?']], [HO, 2.4, 3.0, ['No.']]];
// вспышки-воспоминания в паузе старика: u-начало, квартал, p, камера
const CARD = V(30000, 1250, 900);
const FLASH = [['date', 19], [1, 22, .55, V(3700, 760, 900)], ['home', 25], [2, 28, .72, V(5300, 1230, 900)], [3, 34, .6, V(6850, 1060, 800)], ['dance', 40], [4, 45, .62, V(8380, 1330, 1000)], ['grand', 70]]
  .map((f, i) => [3.0 + i * .33, ...f]);
function caption(ctx, t, h) {
  const list = h ? HCAPS.filter(c => c[0] === h.i).map(c => [c[1], c[2], c[3], h.i === HK ? 240 : 905]) : CAPS, tt = h ? h.u : t;
  for (const [t0, t1, lines, yc = 905] of list) {
    t = tt; if (t < t0 || t > t1) continue;
    const out = clamp((t1 - t) / .2);
    ctx.save(); ctx.font = '900 46px Inter';
    const fs = Math.min(46, 46 * 600 / Math.max(...lines.map(l => ctx.measureText(l).width)));
    ctx.font = `900 ${fs}px Inter`; ctx.textBaseline = 'middle';
    const lh = fs * 1.3, y0 = yc - (lines.length - 1) * lh / 2;
    lines.forEach((l, i) => {
      const li = clamp((t - t0 - i * .35) / .16); if (li <= 0) return;
      const w = ctx.measureText(l).width + 36, x = 360 - w / 2 - 14 + (i % 2 ? 24 : 0), y = y0 + i * lh;
      ctx.save(); ctx.translate(x, y); ctx.rotate((i % 2 ? 1.4 : -1.1) * Math.PI / 180); ctx.scale(E.back(li) * out, 1);
      ctx.fillStyle = ink(.45, .08, .75); ctx.fillRect(8, -lh / 2 + 10, w, lh - 6);
      ctx.fillStyle = ink(0, 0, .92); ctx.fillRect(0, -lh / 2 + 4, w, lh - 6);
      ctx.fillStyle = ink(.3, 1, .9); ctx.fillText(l, 18, 2); ctx.restore();
    });
    ctx.restore();
  }
}
function toScreen(cam, x, y) { const a = CW / cam.vw; return [(x - cam.cx + cam.vw / 2) * a, (y - cam.cy + cam.vw * 8 / 9) * a]; }
function overlays(ctx, t, cam) {
  // возраст квартала
  for (const b of BLOCKS) {
    const c = b.x0 + b.w / 2, d = Math.abs(cam.cx - c) / (cam.vw * .45);
    if (d < 1) { const a = 1 - sstep(.6, 1, d); ctx.globalAlpha = a; stampS(ctx, 'AGE ' + b.age, 360, 250, -.06, ink(1, .05, .95), 64 * (1 + .15 * (1 - a))); ctx.globalAlpha = 1; }
  }
  if (Math.abs(cam.cx - BENCH_X) < 900 && t > 29) { const a = 1 - sstep(.5, 1, Math.abs(cam.cx - BENCH_X) / 900); ctx.globalAlpha = a * (t < 31.5 ? 1 : 1 - sstep(31.5, 31.9, t)); stampS(ctx, 'AGE 80', 360, 250, -.06, ink(1, .05, .95), 64); ctx.globalAlpha = 1; }
  if (t < 1.0 && t > -1) { const a = sstep(0, .1, t + .0) * 0 + 1; }
  // ярлык-хук у летящего самолётика: «от тебя, 80 лет»
  const s = sOf(t), p = planeAt(t);
  if (p.fly && s < .45 && (t < 5 || t >= DUR - LOOP)) {
    const [x, y] = toScreen(cam, p.x, p.y), a = clamp((.45 - s) / .25);
    ctx.globalAlpha = a; stampS(ctx, 'FROM: YOU, AGE 80', clamp(x, 200, 520), y - 90, -.08, ink(1, .05, .95), 34); ctx.globalAlpha = 1;
  }
  // перемотка жизни назад
  if (t > 39.5 && t < 43.8) {
    ctx.globalAlpha = sstep(39.5, 39.8, t) * (1 - sstep(43.5, 43.8, t)) * (Math.floor(t * 4) % 2 ? 1 : .55); ctx.fillStyle = ink(1, 0, .9);
    for (const o of [0, 38]) { ctx.beginPath(); ctx.moveTo(110 + o, 380); ctx.lineTo(70 + o, 405); ctx.lineTo(110 + o, 430); ctx.fill(); }
    ctx.font = '900 40px Inter'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('REWIND', 168, 406); ctx.globalAlpha = 1;
  }
}
function stampS(ctx, txt, x, y, r, col, size) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(r); ctx.font = `900 ${size}px Inter`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width + size * .6, h = size * 1.3;
  ctx.fillStyle = PAPER; rr(ctx, -w / 2, -h / 2, w, h, size * .15); ctx.fill();
  stroke(ctx, size * .1, col); ctx.fillStyle = col; ctx.fillText(txt, 0, size * .05); ctx.restore();
}

let dens, dctx, ready = false;
async function setup() {
  dens = document.createElement('canvas'); dens.width = CW; dens.height = CH; dctx = dens.getContext('2d');
  Riso.init(document.getElementById('c'));
  await Promise.all(['900 40px Inter', '700 20px Inter'].map(f => document.fonts.load(f)));
  ready = true;
}
const CLOSE = V(BENCH_X + 130, 1260, 600), HEARTCAM = V(HEART_X, 1080, 1180);
function holdCam(h, t) {
  if (h.i === HP) return C0;
  if (h.i === HK) return mixC(camera(3.2), V(600, 1170, 520), sstep(0, .4, h.u) * (1 - sstep(1.25, 1.6, h.u)));
  if (h.i === HH) return mixC(camera(HEART_T), HEARTCAM, sstep(0, .5, h.u) * (1 - sstep(2.1, 2.6, h.u)));
  return h.u < 5.65 ? mixC(B1, V(BENCH_X + 120, 1250, 620), sstep(1.6, 2.3, h.u)) : CLOSE;
}
window.renderFrame = async T => {
  if (!ready) await setup();
  CUR_T = T;
  const [t, h] = warpT(T);
  const fl = h && h.i === HO ? FLASH.find(f => h.u >= f[0] && h.u < f[0] + .33) : null;
  const cam = fl ? (typeof fl[1] === 'string' ? CARD : fl[4]) : h ? holdCam(h, t) : camera(t), a = CW / cam.vw, ctx = dctx;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = PAPER; ctx.fillRect(0, 0, CW, CH);
  ctx.setTransform(a, 0, 0, a, -(cam.cx - cam.vw / 2) * a, -(cam.cy - cam.vw * 8 / 9) * a);
  background(ctx, cam, t);
  const L = cam.cx - cam.vw, R = cam.cx + cam.vw;
  if (L < 1400) school(ctx, t, h && h.i === HK ? kidHold(h.u) : h && h.i === HP ? kidLoop(h.u) : kidPose(t));
  BLOCKS.forEach((b, bi) => { if (b.x0 + b.w > L && b.x0 < R) { const p = planeAt(t); const px = p.fly ? p.x : (t < 20 ? 0 : 99999); b.draw(ctx, b.x0, fl && fl[1] === bi ? fl[3] : h && h.i === HH && bi === 2 ? lerp(.42, .78, h.u / HEART_LEN) : clamp((px - b.x0) / b.w), t); } });
  if (fl && typeof fl[1] === 'string') card(ctx, fl[1], T);
  ground(ctx, cam);
  let OG = null; if (R > 10600 && R < 20000) OG = bench(ctx, t, h && h.i === HO ? oldHold(h.u) : oldPose(t), null);
  let sh = sheetAt(t);
  if (h && h.i === HK && sh) { const k = sstep(0, .3, h.u) * (1 - sstep(1.3, 1.6, h.u)); sh.cx = lerp(sh.cx, 545, k); sh.cy = lerp(sh.cy, 1370, k); }   // опускает лист — видно лицо
  if (h && h.i === HO) { sh = sheetAt(34.99); const k = sstep(5.45, 5.65, h.u); sh.cx = lerp(BENCH_X, BENCH_X - 60, k); sh.cy = lerp(1330, 1455, k); sh.w = lerp(300, 240, k); }
  if (sh) {
    if (sh.fold > .97 && !sh.onDesk) {}
    else sheet(ctx, sh.cx, sh.cy, sh.w, sh.side, sh.flip, sh.fold, sh.reveal);
    if (sh.pen) { const O = oldPose(t); pen(ctx, O.hB[0], O.hB[1]); }
    if (sh.onDesk) plane(ctx, sh.cx, sh.cy - 10, 150, 0, 0, -1);
  }
  // самолётик в руке перед броском
  const s = sOf(t);
  if (s >= 5.0 && s < 5.62 && t < 6) { const K = kidPose(t), h = K.hB; plane(ctx, h[0] + 10, h[1] - 30, 150, -.3, 0, 1); }
  if (t >= 38.2 && t < 38.8) { const O = oldPose(t), h = O.hA; plane(ctx, h[0] - 10, h[1] - 25, 140, .2, 0, -1); }
  if (t >= 31.0 && t < 31.5) plane(ctx, BENCH_X, 1320, 140, 0, 0, 1);
  const p = h && (h.i === HP || h.i === HH) ? { fly: false } : planeAt(t);
  if (h && h.i === HP) { const q = loopPlane(h.u), q2 = loopPlane(h.u - .03); plane(ctx, q.x, q.y, 150, Math.atan2(q.y - q2.y, Math.abs(q.x - q2.x) + 1) * .8 * (q.x < q2.x ? -1 : 1), q.a, q.x < q2.x ? -1 : 1); }
  if (h && h.i === HH) heartFlight(ctx, h.u);
  if (p.fly) {
    const pts = []; for (let i = 1; i < 14; i++) { const q = planeAt(t - i * .035); if (q.fly) pts.push([q.x - 60 * q.dir, q.y + 6]); }
    wake(ctx, pts); plane(ctx, p.x, p.y, 140, p.ang, p.bank, p.dir);
  }
  foreground(ctx, cam);
  particles(ctx, cam, t);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (fl) {                                   // рамка «фотографии» вокруг воспоминания
    const m = 46, age = fl[2];
    ctx.save(); ctx.translate(360, 640); ctx.rotate((fl[1] % 2 ? 1 : -1) * .02); ctx.translate(-360, -640);
    ctx.fillStyle = PAPER; ctx.fillRect(-100, -100, CW + 200, m + 100); ctx.fillRect(-100, CH - m * 3.2, CW + 200, m * 3.2 + 100); ctx.fillRect(-100, -100, m + 100, CH + 200); ctx.fillRect(CW - m, -100, m + 100, CH + 200);
    ctx.strokeStyle = OUT; ctx.lineWidth = 4; ctx.strokeRect(m, m, CW - 2 * m, CH - m * 4.2);
    ctx.font = '900 40px Inter'; ctx.textAlign = 'center'; ctx.fillStyle = ink(.15, 1, .1); ctx.fillText('AGE ' + age, 360, CH - m * 1.9);
    ctx.restore();
  }
  if (!fl && !h) overlays(ctx, t, cam); caption(ctx, t, h);
  let mis = 1;
  if (fl && h.u - fl[0] < .07) mis = 6;
  if (t > 39.5 && t < 43.8) mis = 1 + 2 * Math.sin(Math.PI * (t - 39.5) / 4.3);
  Riso.print(dens, T, mis);
};

function heartFlight(ctx, u) {            // самолётик рисует сердце над молодыми, след остаётся
  const v = clamp(u / (HEART_LEN - .5)), fade = 1 - sstep(HEART_LEN - .35, HEART_LEN, u);
  ctx.beginPath(); for (let i = 0; i <= 80; i++) { const w = v * i / 80, q = HEART(w); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }
  ctx.globalAlpha = fade; ctx.setLineDash([26, 18]); stroke(ctx, 12, ink(1, 0, .45)); ctx.setLineDash([]); ctx.globalAlpha = 1;
  if (v >= 1) {                            // конфетти, когда сердце замкнулось
    const k = (u - (HEART_LEN - .5)) / .5;
    for (let i = 0; i < 40; i++) { const a = hash(i) * 6.28, r = 60 + k * (200 + hash(i + 3) * 260), x = HEART_X + Math.cos(a) * r, y = 900 + Math.sin(a) * r * .7 + k * k * 160;
      ctx.save(); ctx.translate(x, y); ctx.rotate(i + k * 8); ctx.fillStyle = [ink(1, 0, .3), ink(0, .8, .1), ink(0, 0, 1), PAPER][i % 4]; ctx.fillRect(-10, -6, 20, 12); ctx.restore(); }
  }
  const q = HEART(v), q2 = HEART(Math.max(0, v - .01)), dir = q[0] >= q2[0] ? 1 : -1;
  plane(ctx, q[0], q[1], 140, Math.atan2(q[1] - q2[1], Math.abs(q[0] - q2[0]) + .5) * .9 * dir, u * 3, dir);
}
// карточки моментов, которых не было в полёте
function card(ctx, kind, T) {
  const X = CARD.cx, G = GY, bg = { date: ink(.2, 0, .45), home: ink(.05, .35, .2), dance: ink(.35, .1, .1), grand: ink(.15, .45, .1) }[kind];
  ctx.fillStyle = bg; ctx.fillRect(X - 600, 300, 1200, 1800);
  ctx.fillStyle = ink(.35, .2, .55); ctx.fillRect(X - 600, G, 1200, 500);
  if (kind === 'date') {                  // 19: молочный коктейль на двоих
    rr(ctx, X - 260, G - 260, 520, 40, 8); fill(ctx, PAPER); stroke(ctx, 6);
    drawPerson(ctx, { x: X - 170, y: G + 40, R: 70, kind: 'man', age: 19, sit: 1, outfit: 'tee', hair: 'mop', t: T, seed: 21, smile: 1, eye: .3, happyEyes: true, face: .5, look: [1, 0], hA: [X - 120, G - 250], hB: [X - 60, G - 250] });
    drawPerson(ctx, { x: X + 170, y: G + 40, R: 68, kind: 'woman', age: 19, sit: 1, outfit: 'dress', hair: 'bun', t: T, seed: 22, smile: 1, eye: .3, happyEyes: true, face: -.5, look: [-1, 0], hA: [X + 60, G - 250], hB: [X + 120, G - 250] });
    rr(ctx, X - 45, G - 420, 90, 160, 14); fill(ctx, ink(.6, 0, .15)); stroke(ctx, 6);
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(X + s * 15, G - 420); ctx.lineTo(X + s * 70, G - 520); stroke(ctx, 8, ink(0, .8, .1)); }
    heart(ctx, X, G - 640, 40);
  } else if (kind === 'home') {           // 25: первый дом, коробки, ключ
    ctx.beginPath(); ctx.moveTo(X - 420, G - 700); ctx.lineTo(X, G - 1000); ctx.lineTo(X + 420, G - 700); ctx.lineTo(X + 420, G); ctx.lineTo(X - 420, G); ctx.closePath(); fill(ctx, ink(.5, .1, .4)); stroke(ctx, 7);
    rr(ctx, X - 90, G - 330, 180, 330, 8); fill(ctx, ink(.6, .5, .3)); stroke(ctx, 6);
    drawPerson(ctx, { x: X - 230, y: G, R: 58, kind: 'man', age: 25, outfit: 'tee', hair: 'mop', t: T, seed: 23, smile: 1, open: .4, hA: [X - 300, G - 200], hB: [X - 160, G - 200] });
    rr(ctx, X - 320, G - 270, 180, 130, 6); fill(ctx, ink(.4, .15, .7)); stroke(ctx, 6);
    drawPerson(ctx, { x: X + 230, y: G, R: 56, kind: 'woman', age: 24, outfit: 'shirt', hair: 'bun', t: T, seed: 24, smile: 1, open: .5, hB: [X + 330, G - 470], hA: [X + 170, G - 260] });
    ctx.save(); ctx.translate(X + 340, G - 500); ctx.rotate(.4); ctx.beginPath(); ctx.arc(0, 0, 20, 0, 7); ctx.moveTo(20, 0); ctx.lineTo(70, 0); stroke(ctx, 9, ink(0, 0, 1)); ctx.restore();
  } else if (kind === 'dance') {          // 40: танцуют на кухне
    rr(ctx, X - 560, G - 500, 1120, 80, 6); fill(ctx, ink(.1, .1, .6)); stroke(ctx, 6);
    for (let i = 0; i < 4; i++) { rr(ctx, X - 520 + i * 280, G - 420, 220, 420, 6); fill(ctx, ink(.25, .05, .5)); stroke(ctx, 5); }
    const sw = Math.sin(T * 6) * 20;
    drawPerson(ctx, { x: X - 110 + sw, y: G, R: 60, kind: 'man', age: 40, outfit: 'sweater', hair: 'short', t: T, seed: 25, smile: 1, open: .4, eye: .3, happyEyes: true, face: .5, hA: [X - 200, G - 520], hB: [X - 20, G - 330] });
    drawPerson(ctx, { x: X + 110 + sw, y: G, R: 58, kind: 'woman', age: 39, outfit: 'dress', hair: 'bun', t: T, seed: 26, smile: 1, open: .5, eye: .3, happyEyes: true, face: -.5, tilt: -.15, hA: [X + 10, G - 330], hB: [X + 220, G - 520] });
    for (let i = 0; i < 3; i++) { const nx = X - 300 + i * 300, ny = G - 760 - (i % 2) * 60; ctx.beginPath(); ctx.ellipse(nx, ny, 22, 16, -.4, 0, 7); fill(ctx, ink(1, .1, .9)); ctx.beginPath(); ctx.moveTo(nx + 19, ny); ctx.lineTo(nx + 19, ny - 70); stroke(ctx, 7, ink(1, .1, .9)); }
  } else {                                // 70: внучка на коленях, книжка
    rr(ctx, X - 330, G - 520, 660, 520, 60); fill(ctx, ink(.6, .1, .2)); stroke(ctx, 7);
    drawPerson(ctx, { x: X + 60, y: G + 20, R: 76, kind: 'old', age: 70, sit: 1, outfit: 'cardigan', pants: ink(.3, .6, .4), hair: 'grey', glasses: true, t: T, seed: 27, smile: 1, look: [-.6, .7], face: -.3, hA: [X - 130, G - 120], hB: [X + 40, G - 120] });
    drawPerson(ctx, { x: X - 90, y: G - 70, R: 46, kind: 'girl', age: 4, sit: 1, outfit: 'stripes', hair: 'pig', t: T, seed: 28, smile: 1, open: .5, look: [.2, .8] });
    ctx.save(); ctx.translate(X - 50, G - 105); rr(ctx, -110, -50, 220, 90, 8); fill(ctx, ink(0, .8, .1)); stroke(ctx, 6); ctx.beginPath(); ctx.moveTo(0, -70); ctx.lineTo(0, 50); stroke(ctx, 5); ctx.restore();
  }
}
