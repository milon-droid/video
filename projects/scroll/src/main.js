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
    ctx.globalAlpha = .8 * sstep(DEAD[0] + 1.0, DEAD[0] + 2.0, t); faceRef(ctx, t); ctx.globalAlpha = 1;
    ctx.fillStyle = ink(0, .2, 0, .5); ctx.beginPath(); ctx.moveTo(0, 300); ctx.lineTo(1080, 0); ctx.lineTo(1080, 200); ctx.lineTo(0, 500); ctx.fill();   // блик
    return;
  }
  let f = feedAt(t); if (f.off) f = lastClip(t);
  if (t > 39.6 && t < 40.6) f = { k: 'A', lt: 40.6 - DUR, sw: 0 };   // экран проснулся: ролик на паузе
  if (f.k !== 'A') f.lt = Math.max(0, f.lt); if (f.k2 && f.k2 !== 'A') f.lt2 = Math.max(0, f.lt2);
  if (f.sw > 0) { ctx.save(); ctx.translate(0, -1920 * E.io(f.sw)); CLIPS[f.k2](ctx, f.lt2); ctx.restore(); ctx.save(); ctx.translate(0, 1920 * (1 - E.io(f.sw))); CLIPS[f.k](ctx, f.lt); ctx.restore(); }
  else CLIPS[f.k](ctx, f.lt);
  // строка состояния: батарея
  const lp = t > 40.6, bat = lp ? 100 : Math.max(1, Math.round(100 - ra * 99)), low = bat < 5;   // на стыке петли — как в начале
  ctx.font = '800 34px Inter'; ctx.textAlign = 'left'; ctx.fillStyle = PAPER; ctx.fillText(t < 26 || lp ? '23:59' : '04:12', 40, 50);
  rr(ctx, 900, 22, 110, 44, 8); stroke(ctx, 4, PAPER); ctx.fillStyle = low ? NEON : PAPER; ctx.fillRect(906, 28, 98 * bat / 100 + 2, 32);
  if (low && Math.floor(t * 4) % 2) { ctx.font = '900 40px Inter'; ctx.fillStyle = NEON; ctx.textAlign = 'right'; ctx.fillText('1%', 885, 58); }
  // уведомления
  for (const [a, b, who, msg] of NOTES) { if (t < a || t > b) continue;
    const u = sstep(a, a + .15, t), out = sstep(b - .18, b, t), y = lerp(-240, 90, u) - out * 400;
    rr(ctx, 40, y, 1000, 200, 36); fill(ctx, PAPER); stroke(ctx, 6); ctx.beginPath(); ctx.arc(130, y + 100, 56, 0, 7); fill(ctx, NEON_B);
    ctx.textAlign = 'left'; ctx.fillStyle = OUT; ctx.font = '900 46px Inter'; ctx.fillText(who, 210, y + 80); ctx.font = '700 42px Inter'; ctx.fillText(msg, 210, y + 145); }
  if (t > 39.0 && t < 40.8) { const u = sstep(39.0, 39.2, t); const y = lerp(-240, 90, u); rr(ctx, 40, y, 1000, 200, 36); fill(ctx, NEON); stroke(ctx, 6);
    ctx.textAlign = 'center'; ctx.fillStyle = PAPER; ctx.font = '900 64px Inter'; ctx.fillText('NEW FOR YOU ▶', 540, y + 122); }
}
function faceRef(ctx, t) {                 // отражение: старое лицо, медленный наезд, глаза расширяются от ужаса
  const u = clamp((t - 31.4) / 3), shock = sstep(32.6, 32.9, t);
  ctx.save(); ctx.translate(540, 960); ctx.scale(1 + u * .25, 1 + u * .25); ctx.translate(-540, -960);
  const P = { x: 540, y: 2780, R: 300, kind: 'old', age: 80, outfit: 'tee', hair: 'grey', hairCol: PAPER, browCol: PAPER, t, seed: 3, look: [0, 0], wide: shock, O: shock, brow: shock, furrow: -shock, eye: 1 - .3 * (1 - shock), tremble: shock };
  P.headDX = Math.sin(t * 40) * .02 * shock; drawPerson(ctx, P);
  const G = personGeom(P); for (let i = 0; i < 9; i++) { ctx.beginPath(); const y = G.hc[1] - 260 + i * 40; ctx.moveTo(G.hc[0] - 200 + hash(i) * 60, y); ctx.lineTo(G.hc[0] - 120 + hash(i + 2) * 40, y + 6); stroke(ctx, 6, ink(.45, .3, .5)); }   // морщины
  ctx.restore();
  // трещина по стеклу в момент шока
  if (shock > .5) { ctx.beginPath(); ctx.moveTo(760, 380); for (let i = 1; i < 7; i++) ctx.lineTo(760 + Math.cos(i * 2.2) * i * 60, 380 + i * 120 + Math.sin(i * 3) * 40); stroke(ctx, 7, PAPER); ctx.beginPath(); ctx.moveTo(760, 380); ctx.lineTo(1000, 520); ctx.moveTo(760, 380); ctx.lineTo(640, 200); stroke(ctx, 5, PAPER); }
}
function counter(ctx, t) {
  const s = screenTime(t), big = t > 26, al = sstep(.8, 1.1, t) * (1 - sstep(35.3, 35.6, t));   // на стыке петли счётчика нет
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
    const lower = sstep(34.6, 35.6, t) * (1 - sstep(39.4, 40.3, t)) * 520;          // опустил телефон и поднял снова
    ctx.setTransform(a, 0, 0, a, -(cam.cx - cam.vw / 2) * a, -(cam.cy - cam.vw * 8 / 9) * a);
    const hs = z < .9 ? 1 : 0; ctx.translate(Math.sin(t * 1.3) * 6 * hs, Math.sin(t * 1.7) * 5 * hs);   // ручная камера
    if (z < .995) roomPOV(ctx, t, ra);
    ctx.save(); ctx.translate(0, lower);
    phone(ctx, t, ra, () => { ctx.save(); ctx.translate(R0.x, R0.y); ctx.scale(R0.w / 1080, R0.w / 1080); screenContent(ctx, t, ra); ctx.restore(); }, z);
    ctx.restore();
    if (z < .995) dread(ctx, ra, t);
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  { const z = face ? 1 : zoomAt(t); if (z < .6) for (const [a, b, who, msg] of NOTES) { if (t < a || t > b) continue;   // уведомление крупно поверх кадра
      const u = sstep(a, a + .18, t), out = sstep(b - .22, b, t), warn = msg.startsWith('⚠');
      ctx.save(); ctx.translate(360 + out * 520, 420); ctx.scale(E.back(u), E.back(u));
      rr(ctx, -330, -105, 660, 220, 34); fill(ctx, warn ? NEON : PAPER); stroke(ctx, 6); ctx.beginPath(); ctx.arc(-245, 0, 52, 0, 7); fill(ctx, warn ? PAPER : NEON_B); stroke(ctx, 5);
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = warn ? PAPER : OUT; ctx.font = '900 44px Inter'; ctx.fillText(who, -170, -50);
      ctx.font = '700 36px Inter'; const words = msg.split(' '); let line = '', ly = 4; for (const w of words) { if (ctx.measureText(line + w).width > 470) { ctx.fillText(line, -170, ly); ly += 42; line = ''; } line += w + ' '; } ctx.fillText(line, -170, ly);
      ctx.restore(); } }
  lesson(ctx, t);
  if (!(t > DEAD[0] + .2 && t < DEAD[1])) counter(ctx, t);
  let mis = 1; const f = feedAt(t); if (f.sw > 0 && f.sw < .3) mis = 1.8; if (face && t - face[0] < .08) mis = 6;
  Riso.print(dens, t, mis);
};

function lesson(ctx, t) {                    // урок в конце (поверх тёмной комнаты)
  const L = [[35.6, '47 YEARS. GONE.', 72, NEON], [36.6, 'ONE SWIPE', 84, PAPER], [37.1, 'AT A TIME.', 84, PAPER], [37.9, 'PUT IT DOWN.', 78, NEON_Y], [38.4, 'LOOK UP.', 110, NEON_Y]];
  if (t < 35.4 || t > 39.4) return;
  const out = 1 - sstep(39.0, 39.4, t);
  ctx.save(); ctx.globalAlpha = .55 * sstep(35.4, 35.8, t) * out; ctx.fillStyle = OUT; ctx.fillRect(0, 0, CW, CH); ctx.restore();
  L.forEach(([t0, txt, size, col], i) => { if (t < t0) return; const u = E.back(clamp((t - t0) / .2));
    ctx.save(); ctx.globalAlpha = out; ctx.translate(360, 300 + i * 150 + (i > 2 ? 40 : 0)); ctx.scale(u, u); ctx.font = `900 ${size}px Inter`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round'; ctx.lineWidth = size * .18; ctx.strokeStyle = OUT; ctx.strokeText(txt, 0, 0); ctx.fillStyle = col; ctx.fillText(txt, 0, 0); ctx.restore(); });
}
