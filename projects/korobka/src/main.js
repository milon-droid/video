// Камера, титры, эффекты печати, кадр.
const DUR = 35 + 4 / 30;            // обрыв через 4 кадра после хлопка — петля в первый кадр
window.SCENE = { duration: DUR, fps: 30, width: CW, height: CH };
const V = (cx, cy, vw) => ({ cx, cy, vw });
const atLevel = (c, z) => V(PX + (c.cx - PX) * Math.pow(S, -z), PY + (c.cy - PY) * Math.pow(S, -z), c.vw * Math.pow(S, -z));
const F1 = V(BX + BW / 2, BY + BH / 2, BW), RM = V(600, 960, 940), CBg = V(570, 1010, 600);
function camLerp(a, b, u) {          // центр движется вместе с логарифмом зума — зум ровный
  const la = Math.log(a.vw), lb = Math.log(b.vw), vw = Math.exp(lerp(la, lb, u));
  const w = Math.abs(lb - la) > .05 ? (Math.log(vw) - la) / (lb - la) : u;
  return V(lerp(a.cx, b.cx, w), lerp(a.cy, b.cy, w), vw);
}
const SHOTS = [
  [0, 1.5, V(480, 1116.7, 240), V(480, 1116.7, 226), 'io'],
  [1.5, 3.3, V(480, 1116.7, 226), RM, 'out'],
  [3.3, 6.3, V(590, 1040, 620), V(575, 1060, 580), 'io'],
  [6.3, 7.4, V(575, 1060, 580), V(570, 1070, 566), 'io'],
  [7.4, 9.6, V(570, 1070, 566), atLevel(RM, 1), 'io'],
  [9.6, 11.0, atLevel(RM, 1), atLevel(V(640, 930, 860), 1), 'io'],
  [11.0, 13.7, V(690, 860, 430), V(690, 860, 390), 'io'],
  [13.7, 15.3, V(560, 1050, 520), V(506, 1052, 250), 'io'],
  [15.3, 16.3, V(690, 840, 420), V(690, 830, 400), 'io'],
  [16.3, 17.3, V(700, 520, 460), V(700, 540, 440), 'io'],
  [17.3, 19.4, V(540, 960, 1080), V(540, 960, 1060), 'io'],
  [19.4, 21.0, V(540, 960, 1060), CBg, 'io'],
  [21.0, 22.0, V(507, 1070, 300), V(507, 1066, 276), 'io'],
  [22.0, 24.0, V(690, 850, 380), V(690, 840, 300), 'in'],
  [24.0, 25.4, V(690, 840, 300), V(690, 790, 380), 'out'],
  [25.4, 26.5, V(690, 790, 380), atLevel(CBg, -1), 'io'],
  [26.5, 27.6, atLevel(CBg, -1), atLevel(V(570, 1010, 590), -1), 'io'],
];
function camera(t) {
  let c;
  if (t >= 27.6) {
    const u = clamp((t - 27.6) / 7.4), z = -1 - 9 * u * u, b = sstep(0, 1, u);
    const C0 = V(570, 1010, 590);
    c = atLevel(V(lerp(C0.cx, F1.cx, b), lerp(C0.cy, F1.cy, b), Math.exp(lerp(Math.log(C0.vw), Math.log(F1.vw), b))), z);
    c.ks = Math.floor(z + 1e-6);
    if (t > 35) { c = atLevel(F1, -10); c.ks = -10; }
  } else {
    const s = SHOTS.find(s => t >= s[0] && t < s[1]) || SHOTS[SHOTS.length - 1];
    c = camLerp(s[2], s[3], E[s[4]](clamp((t - s[0]) / (s[1] - s[0]))));
  }
  c.ks = c.ks ?? (t < 25.4 ? 0 : -1);
  const [x, y] = shake(t, [[.15, 12, .35], [.9, 8, .3], [6.82, 7, .4], [13.22, 9, .35], [16.2, 16, .7], [HIT_B, 16, .5], [35.0, 18, .5, 7], [-4 / 30, 18, .5, 7]]);
  return Object.assign(V(c.cx + x * c.vw / CW, c.cy + y * c.vw / CW, c.vw), { ks: c.ks });
}
FLAP_OVERRIDE = (k, t) => {
  if (k !== -10 || t < 27) return null;
  if (t < 34.75) return Math.PI * .98;
  const u = clamp((t - 34.75) / .25); return Math.PI * .98 * (1 - u * u);
};
const CUTS = SHOTS.map(s => s[0]).filter(x => x > 0 && ![1.5, 7.4, 9.6, 19.4, 25.4].includes(x));

function worldToScreen(cam, k, x, y) {
  const s = Math.pow(S, -k), x0 = PX + (x - PX) * s, y0 = PY + (y - PY) * s, a = CW / cam.vw;
  return [(x0 - cam.cx + cam.vw / 2) * a, (y0 - cam.cy + cam.vw * 8 / 9) * a];
}

// ---------- титры ----------
const CAPS = [
  [1.6, 4.2, ['Мне пришла посылка.', 'От меня.'], 0, 215],
  [7.45, 10.1, ['Внутри — моя комната.', 'И я.'], 0, 215],
  [13.7, 15.6, ['Он на 3 секунды', 'впереди.'], 0, 215],
  [19.7, 21.3, ['Будущее можно обмануть!'], 0, 215],
  [21.3, 23.4, ['Тогда почему', 'он смотрит вверх?'], 0, 215],
  [26.05, 28.0, ['Я тоже в коробке.'], 0, 830],
  [28.95, 31.8, ['А ты давно', 'смотрел вверх?'], 0, 830],
  [32.6, 34.7, ['Что бы ты успел', 'за 3 секунды?'], 1, 905],
];
function caption(ctx, t) {
  for (const [t0, t1, lines, kind, yc] of CAPS) {
    if (t < t0 || t > t1) continue;
    const u = clamp((t - t0) / .18), out = clamp((t1 - t) / .15);
    ctx.save();
    ctx.font = '900 46px Inter'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    const lh = 60, y0 = yc - (lines.length - 1) * lh / 2;
    lines.forEach((l, i) => {
      const li = clamp((t - t0 - i * .5) / .16); if (li <= 0) return;
      const w = ctx.measureText(l).width + 36, x = 360 - w / 2 - 20 + (i % 2 ? 26 : 0), y = y0 + i * lh;
      ctx.save(); ctx.translate(x, y); ctx.rotate((i % 2 ? 1.5 : -1.2) * Math.PI / 180);
      const sx = E.back(li) * out;
      ctx.scale(sx, 1);
      ctx.fillStyle = kind ? ink(.85, 0, .2) : ink(.45, .08, .75); ctx.fillRect(8, -lh / 2 + 4 + 6, w, lh - 6);
      ctx.fillStyle = kind ? ink(.9, 0, .05) : ink(0, 0, .92); ctx.fillRect(0, -lh / 2 + 4, w, lh - 6);
      ctx.fillStyle = kind ? ink(0, 0, 0) : ink(.3, 1, .9); ctx.fillText(l, 18, 2);
      ctx.restore();
    });
    ctx.restore();
  }
}
function bigWord(ctx, txt, x, y, t, t0, dur, size, rot = 0, col = ink(1, 0, 1)) {
  const u = t - t0; if (u < 0 || u > dur) return;
  const k = E.back(clamp(u / .14)) * (1 + .06 * u), al = clamp((dur - u) / .15);
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(k, k); ctx.globalAlpha = al;
  ctx.font = `900 ${size}px Inter`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round'; ctx.lineWidth = size * .2; ctx.strokeStyle = PAPER; ctx.strokeText(txt, 0, 0);
  ctx.lineWidth = size * .08; ctx.strokeStyle = OUT; ctx.strokeText(txt, 0, 0);
  ctx.fillStyle = col; ctx.fillText(txt, 0, 0);
  ctx.restore();
}
function overlays(ctx, t, cam) {
  // тревога — синяя краска по краям
  const dread = sstep(21.4, 24, t) * (1 - sstep(27.4, 28.4, t)) * .5;
  if (dread > 0) {
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(360, 560, 260, 360, 640, 860); g.addColorStop(0, ink(0, 0, 0)); g.addColorStop(1, ink(.15 * dread, dread, .1 * dread));
    ctx.fillStyle = g; ctx.fillRect(0, 0, CW, CH); ctx.globalCompositeOperation = 'source-over';
  }
  // звукоподражания
  let [x, y] = worldToScreen(cam, 1, 640, 700); bigWord(ctx, 'апчхи!', clamp(x, 160, 560), clamp(y, 200, 700), t, 10.2, .8, 64, -.12, ink(.9, 0, .8));
  bigWord(ctx, 'АПЧХИ!', 330, 330, t, 13.22, .9, 110, -.08, ink(1, 0, .9));
  bigWord(ctx, 'ФФФУХ!', 300, 300, t, 16.2, .8, 92, .1, ink(0, .9, .2));
  [x, y] = worldToScreen(cam, 0, 720, 1180); bigWord(ctx, 'БАМ!', clamp(x, 170, 520), clamp(y, 260, 700), t, HIT_B, .8, 140, -.1, ink(1, 0, 1));
  for (const [n, t0] of [['3', 21.9], ['2', 22.7], ['1', 23.5]]) bigWord(ctx, n, 470, 700, t, t0, .72, 220, (+n - 2) * .08, ink(1, 0, 1));
  // перемотка
  if (t > 28 && t < 34.9) {
    const al = sstep(28, 28.4, t) * (Math.floor(t * 4) % 2 ? 1 : .55);
    ctx.globalAlpha = al; ctx.fillStyle = ink(1, 0, .9);
    for (const o of [0, 38]) { ctx.beginPath(); ctx.moveTo(110 + o, 200); ctx.lineTo(70 + o, 225); ctx.lineTo(110 + o, 250); ctx.fill(); }
    ctx.font = '900 40px Inter'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('ПЕРЕМОТКА', 168, 226);
    ctx.globalAlpha = 1;
  }
}

// ---------- кадр ----------
let dens, dctx, ready = false;
async function setup() {
  dens = document.createElement('canvas'); dens.width = CW; dens.height = CH; dctx = dens.getContext('2d');
  Riso.init(document.getElementById('c'));
  await Promise.all(['900 40px Inter', '800 20px Inter', '700 20px Inter', 'italic 600 20px Inter'].map(f => document.fonts.load(f)));
  ready = true;
}
function levelView(cam, k) { const s = Math.pow(S, k), vh = cam.vw * CH / CW; return { k, cx: PX + (cam.cx - PX) * s, cy: PY + (cam.cy - PY) * s, vw: cam.vw * s, h: vh * s }; }
function findStart(cam) {
  const vh = cam.vw * CH / CW;
  for (let k = 3; k >= -25; k--) {
    const s = Math.pow(S, k), cx = PX + (cam.cx - PX) * s, cy = PY + (cam.cy - PY) * s, vw = cam.vw * s, h = vh * s;
    if (cx - vw / 2 >= -1 && cx + vw / 2 <= W + 1 && cy - h / 2 >= -1 && cy + h / 2 <= H + 1) return { k, cx, cy, vw, h };
  }
  const k = Math.floor(-Math.log(W / cam.vw) / Math.log(S)) - 1, s = Math.pow(S, k);
  return { k, cx: PX + (cam.cx - PX) * s, cy: PY + (cam.cy - PY) * s, vw: cam.vw * s, h: vh * s };
}
window.renderFrame = async t => {
  if (!ready) await setup();
  const cam = camera(t), st = levelView(cam, cam.ks), a = CW / st.vw;
  dctx.setTransform(1, 0, 0, 1, 0, 0); dctx.globalCompositeOperation = 'source-over'; dctx.globalAlpha = 1;
  dctx.fillStyle = PAPER; dctx.fillRect(0, 0, CW, CH);
  drawLevel(dctx, st.k, a, -(st.cx - st.vw / 2) * a, -(st.cy - st.h / 2) * a, t);
  dctx.setTransform(1, 0, 0, 1, 0, 0);
  overlays(dctx, t, cam); caption(dctx, t);
  let mis = 1;
  for (const c of CUTS) if (t >= c && t < c + .1) mis = 4;
  if (t > 17.5 && t < 17.85) mis = 9;
  if (t > 27.6 && t < 35) mis = Math.max(mis, 1 + 2.2 * sstep(27.6, 33, t));
  if (t > 35 && t < 35.15) mis = 10;
  if (t < .25 && t > .15) mis = 6;
  if (t < .1) mis = 10;
  Riso.print(dens, t, mis);
};
