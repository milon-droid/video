// Камера, кадр, титры, печать.
window.SCENE = { duration: DUR, fps: 30, width: CW, height: CH };
const V = (cx, cy, vw) => ({ cx, cy, vw });
const mixC = (a, b, u) => V(lerp(a.cx, b.cx, u), lerp(a.cy, b.cy, u), Math.exp(lerp(Math.log(a.vw), Math.log(b.vw), u)));
const C0 = V(720, 1020, 1200), C1 = V(600, 1235, 600), C2 = V(700, 1080, 1050);
const B0 = V(BENCH_X, 1250, 1000), B1 = V(BENCH_X, 1310, 560), B2 = V(BENCH_X - 120, 1180, 1100);
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
  else if (t < 35.3) c = mixC(B0, B1, sstep(31.5, 31.9, t));
  else if (t < 36.3) c = mixC(B1, B2, sstep(35.3, 35.8, t));
  else if (t < DUR - LOOP) { c = mixC(B2, follow(t), sstep(36.3, 37.1, t)); c = mixC(c, C0, sstep(41.1, 42.0, t)); }
  const [x, y] = shake(t, [[5.62, 5, .3], [36.25, 5, .3]]);
  return V(c.cx + x * c.vw / CW, c.cy + y * c.vw / CW, c.vw);
}
// титры (английский)
const CAPS = [
  [1.35, 3.6, ['“It goes fast.', 'Have fun”?']],
  [5.25, 6.6, ['Hello, future me!']],
  [31.95, 33.0, ['“Hello, future me.”']],
  [33.0, 34.4, ['Ha! Hi, kid.']],
  [34.45, 37.2, ['It goes fast.', 'Have fun.']],
];
function caption(ctx, t) {
  for (const [t0, t1, lines] of CAPS) {
    if (t < t0 || t > t1) continue;
    const out = clamp((t1 - t) / .2);
    ctx.save(); ctx.font = '900 46px Inter';
    const fs = Math.min(46, 46 * 600 / Math.max(...lines.map(l => ctx.measureText(l).width)));
    ctx.font = `900 ${fs}px Inter`; ctx.textBaseline = 'middle';
    const lh = fs * 1.3, y0 = 905 - (lines.length - 1) * lh / 2;
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
  if (t > 37.0 && t < 41.3) {
    ctx.globalAlpha = sstep(37, 37.3, t) * (1 - sstep(41, 41.3, t)) * (Math.floor(t * 4) % 2 ? 1 : .55); ctx.fillStyle = ink(1, 0, .9);
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
window.renderFrame = async t => {
  if (!ready) await setup();
  const cam = camera(t), a = CW / cam.vw, ctx = dctx;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = PAPER; ctx.fillRect(0, 0, CW, CH);
  ctx.setTransform(a, 0, 0, a, -(cam.cx - cam.vw / 2) * a, -(cam.cy - cam.vw * 8 / 9) * a);
  background(ctx, cam, t);
  const L = cam.cx - cam.vw, R = cam.cx + cam.vw;
  if (L < 1400) school(ctx, t, kidPose(t));
  for (const b of BLOCKS) if (b.x0 + b.w > L && b.x0 < R) { const p = planeAt(t); const px = p.fly ? p.x : (t < 20 ? 0 : 99999); b.draw(ctx, b.x0, clamp((px - b.x0) / b.w), t); }
  ground(ctx, cam);
  let OG = null; if (R > 10600) OG = bench(ctx, t, oldPose(t));
  const sh = sheetAt(t);
  if (sh) {
    if (sh.fold > .97 && !sh.onDesk) {}
    else sheet(ctx, sh.cx, sh.cy, sh.w, sh.side, sh.flip, sh.fold, sh.reveal);
    if (sh.onDesk) plane(ctx, sh.cx, sh.cy - 10, 150, 0, 0, -1);
  }
  // самолётик в руке перед броском
  const s = sOf(t);
  if (s >= 5.0 && s < 5.62 && t < 6) { const K = kidPose(t), h = K.hB; plane(ctx, h[0] + 10, h[1] - 30, 150, -.3, 0, 1); }
  if (t >= 35.7 && t < 36.3) { const O = oldPose(t), h = O.hA; plane(ctx, h[0] - 10, h[1] - 25, 140, .2, 0, -1); }
  if (t >= 31.0 && t < 31.5) plane(ctx, BENCH_X, 1320, 140, 0, 0, 1);
  const p = planeAt(t);
  if (p.fly) {
    const pts = []; for (let i = 1; i < 14; i++) { const q = planeAt(t - i * .035); if (q.fly) pts.push([q.x - 60 * q.dir, q.y + 6]); }
    wake(ctx, pts); plane(ctx, p.x, p.y, 140, p.ang, p.bank, p.dir);
  }
  foreground(ctx, cam);
  particles(ctx, cam, t);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  overlays(ctx, t, cam); caption(ctx, t);
  let mis = 1;
  if (t > 37 && t < 41.3) mis = 1 + 2 * Math.sin(Math.PI * (t - 37) / 4.3);
  Riso.print(dens, t, mis);
};
