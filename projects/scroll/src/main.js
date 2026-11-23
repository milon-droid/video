window.SCENE = { duration: DUR, fps: 30, width: CW * RES, height: CH * RES };
const V = (cx, cy, vw) => ({ cx, cy, vw });
const mixC = (a, b, u) => V(lerp(a.cx, b.cx, u), lerp(a.cy, b.cy, u), Math.exp(lerp(Math.log(a.vw), Math.log(b.vw), u)));
const FULL = V(540, 960, 1080), SCR = V(R0.x + R0.w / 2, R0.y + R0.h / 2, R0.w);
function lastClip(t) {                 // пока камера снаружи — на экране доигрывает последний ролик
  let best = null; for (const [t0, ...cl] of FEEDS) { let tt = t0; for (const [k, d] of cl) { if (tt <= t) best = { k, lt: t - tt, sw: 0 }; tt += d; } } return best || { k: 'A', lt: t, sw: 0 };
}
function screenContent(ctx, t, ra) {
  const dead = t > DEAD[0] && t < DEAD[1];
  if (dead) {                                                     // чёрное стекло: отражение старого лица
    ctx.fillStyle = ink(.75, 1, .7); ctx.fillRect(0, 0, 1080, 1920);
    ctx.globalAlpha = .5 * sstep(DEAD[0] + .4, DEAD[0] + 1.2, t); faceRef(ctx, t); ctx.globalAlpha = 1;
    ctx.fillStyle = ink(0, .2, 0, .5); ctx.beginPath(); ctx.moveTo(0, 300); ctx.lineTo(1080, 0); ctx.lineTo(1080, 200); ctx.lineTo(0, 500); ctx.fill();   // блик
    return;
  }
  let f = feedAt(t); if (f.off) f = lastClip(t);
  if (t > 36.0 && t < 37.0) f = { k: 'A', lt: 37.0 - DUR, sw: 0 };   // экран проснулся: ролик на паузе
  if (f.k !== 'A') f.lt = Math.max(0, f.lt); if (f.k2 && f.k2 !== 'A') f.lt2 = Math.max(0, f.lt2);
  if (f.sw > 0) { ctx.save(); ctx.translate(0, -1920 * E.io(f.sw)); CLIPS[f.k2](ctx, f.lt2); ctx.restore(); ctx.save(); ctx.translate(0, 1920 * (1 - E.io(f.sw))); CLIPS[f.k](ctx, f.lt); ctx.restore(); }
  else CLIPS[f.k](ctx, f.lt);
  // строка состояния: батарея
  const bat = Math.max(1, Math.round(100 - ra * 99)), low = bat < 5;
  ctx.font = '800 34px Inter'; ctx.textAlign = 'left'; ctx.fillStyle = PAPER; ctx.fillText(t < 26 ? '23:59' : '04:12', 40, 50);
  rr(ctx, 900, 22, 110, 44, 8); stroke(ctx, 4, PAPER); ctx.fillStyle = low ? NEON : PAPER; ctx.fillRect(906, 28, 98 * bat / 100 + 2, 32);
  if (low && Math.floor(t * 4) % 2) { ctx.font = '900 40px Inter'; ctx.fillStyle = NEON; ctx.textAlign = 'right'; ctx.fillText('1%', 885, 58); }
  // уведомления
  for (const [a, b, who, msg] of NOTES) { if (t < a || t > b) continue;
    const u = sstep(a, a + .15, t), out = sstep(b - .18, b, t), y = lerp(-240, 90, u) - out * 400;
    rr(ctx, 40, y, 1000, 200, 36); fill(ctx, PAPER); stroke(ctx, 6); ctx.beginPath(); ctx.arc(130, y + 100, 56, 0, 7); fill(ctx, NEON_B);
    ctx.textAlign = 'left'; ctx.fillStyle = OUT; ctx.font = '900 46px Inter'; ctx.fillText(who, 210, y + 80); ctx.font = '700 42px Inter'; ctx.fillText(msg, 210, y + 145); }
  if (t > 35.8 && t < 37.2) { const u = sstep(35.8, 36.0, t); const y = lerp(-240, 90, u); rr(ctx, 40, y, 1000, 200, 36); fill(ctx, NEON); stroke(ctx, 6);
    ctx.textAlign = 'center'; ctx.fillStyle = PAPER; ctx.font = '900 64px Inter'; ctx.fillText('NEW FOR YOU ▶', 540, y + 122); }
}
function faceRef(ctx, t) {
  const P = { x: 540, y: 2400, R: 260, kind: 'old', age: 75, outfit: 'tee', hair: 'grey', hairCol: PAPER, browCol: PAPER, glasses: false, t, seed: 3, look: [0, 0], wide: 1, O: sstep(DEAD[0] + 1.0, DEAD[0] + 1.6, t), brow: 1 };
  drawPerson(ctx, P);
}
function counter(ctx, t) {
  const s = screenTime(t), big = t > 26, al = sstep(.8, 1.1, t) * (1 - sstep(37.0, 37.4, t));   // на стыке петли счётчика нет
  if (al <= 0) return;
  ctx.save(); ctx.globalAlpha = al; ctx.translate(360, 230); ctx.rotate(-.03); ctx.font = `900 ${big ? 52 : 40}px Inter`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const txt = 'SCREEN TIME: ' + s, w = ctx.measureText(txt).width + 40; ctx.fillStyle = PAPER; rr(ctx, -w / 2, -36, w, 72, 10); ctx.fill(); stroke(ctx, 5, NEON);
  ctx.fillStyle = NEON; ctx.fillText(txt, 0, 3); ctx.restore();
}
let dens, dctx, ready = false;
async function setup() {
  dens = document.createElement('canvas'); dens.width = CW * RES; dens.height = CH * RES; dctx = dens.getContext('2d');
  if (RES !== 1) { const st = dctx.setTransform.bind(dctx), gt = dctx.getTransform.bind(dctx), R = RES;
    dctx.setTransform = (a, b, c, d, e, f) => st(a * R, b * R, c * R, d * R, e * R, f * R);
    dctx.getTransform = () => { const m = gt(); return new DOMMatrix([m.a / R, m.b / R, m.c / R, m.d / R, m.e / R, m.f / R]); };
    const cv = document.getElementById('c'); cv.width = CW * R; cv.height = CH * R; }
  Riso.init(document.getElementById('c'));
  await Promise.all(['900 40px Inter', '700 20px Inter', '800 20px Inter'].map(f => document.fonts.load(f)));
  ready = true;
}
window.renderFrame = async t => {
  if (!ready) await setup();
  CUR_T = t;
  const ctx = dctx, ra = raAt(t), face = FACE.find(f => t >= f[0] && t < f[1]);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = PAPER; ctx.fillRect(0, 0, CW, CH);
  if (face) { const a = CW / 1080; ctx.setTransform(a, 0, 0, a, 0, 0); faceShot(ctx, face[2], t); }
  else {
    const z = zoomAt(t), cam = mixC(FULL, SCR, z), a = CW / cam.vw;
    const lower = sstep(33.4, 34.6, t) * (1 - sstep(36.2, 37.0, t)) * 420;          // опустил телефон и поднял снова
    ctx.setTransform(a, 0, 0, a, -(cam.cx - cam.vw / 2) * a, -(cam.cy - cam.vw * 8 / 9) * a);
    if (z < .995) roomPOV(ctx, t, ra);
    ctx.save(); ctx.translate(0, lower);
    phone(ctx, t, ra, () => { ctx.save(); ctx.translate(R0.x, R0.y); ctx.scale(R0.w / 1080, R0.w / 1080); screenContent(ctx, t, ra); ctx.restore(); }, z);
    ctx.restore();
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  // спираль начинает съедать всё (стробоскоп ленты)
  if (t > 21.8 && t < 25.6) { const k = sstep(21.8, 25.4, t) * .45; ctx.save(); ctx.globalAlpha = k; ctx.translate(360, 640); ctx.rotate(t * 4); ctx.beginPath(); for (let an = 0; an < 30; an += .06) ctx.lineTo(Math.cos(an) * an * 14, Math.sin(an) * an * 14); stroke(ctx, 26, NEON); ctx.restore(); }
  { const z = face ? 1 : zoomAt(t); if (z < .6) for (const [a, b, who, msg] of NOTES) { if (t < a || t > b) continue;   // уведомление крупно над телефоном
      const u = sstep(a, a + .15, t), out = sstep(b - .18, b, t); ctx.save(); ctx.globalAlpha = 1 - out; ctx.translate(360, 430 - out * 60); ctx.scale(E.back(u), E.back(u));
      rr(ctx, -300, -60, 600, 120, 24); fill(ctx, PAPER); stroke(ctx, 5); ctx.beginPath(); ctx.arc(-240, 0, 36, 0, 7); fill(ctx, NEON_B);
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = OUT; ctx.font = '900 32px Inter'; ctx.fillText(who, -185, -20); ctx.font = '700 30px Inter'; ctx.fillText(msg, -185, 22); ctx.restore(); } }
  if (!(t > DEAD[0] + .2 && t < DEAD[1] - .6)) counter(ctx, t); else { ctx.save(); ctx.globalAlpha = 1; counter(ctx, 31); ctx.restore(); }
  let mis = 1; const f = feedAt(t); if (f.sw > 0 && f.sw < .5) mis = 3; if (t > 21.8 && t < 25.6) mis = Math.max(mis, 2.5); if (face && t - face[0] < .08) mis = 6;
  Riso.print(dens, t, mis);
};
