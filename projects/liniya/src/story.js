// ЛИНИЯ — сюжет по времени. story(t) рисует кадр через E.* и отдаёт камеру.
(() => {
const { clamp, lerp, k01, ease, COL, sampleD, fromStrokes, morph, textShape, draw, line, glow, cat, shift, at } = E;
const ARTS = {}; const S = d => ARTS[d] || (ARTS[d] = sampleD(d));
const FS = {}; const F = (key, fn) => FS[key] || (FS[key] = fn());
// кусочная камера: ключи [t, x, y, z, easing]
function camAt(t, keys) {
  if (t <= keys[0][0]) return { x: keys[0][1], y: keys[0][2], z: keys[0][3], r: 0 };
  for (let i = 1; i < keys.length; i++) { const [t1, x1, y1, z1, e] = keys[i], [t0, x0, y0, z0] = keys[i - 1];
    if (t <= t1) { const k = (e || ease.io)(k01(t, t0, t1)); return { x: lerp(x0, x1, k), y: lerp(y0, y1, k), z: z0 * Math.pow(z1 / z0, k), r: 0 }; } }
  const l = keys[keys.length - 1]; return { x: l[1], y: l[2], z: l[3], r: 0 };
}
const R = (i, s = 1) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };

// ================= ПЛАН А–Б: палата =================
const BASE = 400, X0 = 444, SPD = 80, AMP = 52, BW = 60;
const BEATS_NOW = [452, 520];          // удары текущей развёртки
const BEATS_OLD = [588];               // старая развёртка справа от головы
const JERK = .95, WRITE1 = 1.62;
const W1 = { x: 552, y: 368, s: 40 };
const wait = () => F('wait', () => shift(textShape('wait.', 'scripts', W1.s), W1.x, W1.y));
const headX = t => Math.min(562 + SPD * t, 562 + SPD * JERK);
function ecgY(x, beats) { for (const b of beats) if (x >= b && x <= b + BW) return BASE - AMP * ART.ecg((x - b) / BW); return BASE; }
function ecgPts(xa, xb, beats) { const p = []; for (let x = xa; x <= xb; x += 1.2) p.push(x, ecgY(x, beats)); p.push(xb, ecgY(xb, beats)); return p; }
// соединение: ровная линия дёргается вверх и пишет
const connector = () => F('conn', () => { const w = wait(); const x1 = w.x[0], y1 = w.y[0], hx = 562 + SPD * JERK;
  return sampleD(`M${hx},${BASE} C${hx + 30},${BASE} ${hx + 6},${BASE - 70} ${hx - 40},${BASE - 60} C${hx - 90},${BASE - 50} ${x1 - 20},${y1 + 26} ${x1},${y1}`, 1.6); });
const writeShape = () => F('w1', () => cat(connector(), wait()));
// выход героя из монитора к руке старика
const HAND = [394, 872];
const exitPath = () => F('exit', () => { const w = wait(), ex = w.x[w.n - 1], ey = w.y[w.n - 1];
  return sampleD(`M${ex},${ey} C${ex + 14},${ey + 30} ${ex - 30},${ey + 60} 560,452 C 548,470 540,474 532,490 C 500,560 420,640 404,760 C 398,810 404,850 ${HAND[0]},${HAND[1]}`, 2); });
const heroA = () => F('heroA', () => cat(wait(), exitPath()));
// спираль вокруг руки, потом надпись «one more thing.»
const T2 = { x: 432, y: 760, s: 30 };
const more = () => F('more', () => shift(textShape('one more thing.', 'scripts', T2.s), T2.x, T2.y));
const coil = () => F('coil', () => { const p = []; for (let i = 0; i <= 90; i++) { const a = i / 90 * Math.PI * 4.2, r = 6 + i * .12; p.push(HAND[0] + Math.cos(a) * r * 1.5, HAND[1] - 4 + Math.sin(a) * r * .7); }
  const m = more(); const end = [p[p.length - 2], p[p.length - 1]];
  const up = sampleD(`M${end[0]},${end[1]} C${end[0] - 30},${end[1] - 40} ${m.x[0] - 40},${m.y[0] + 50} ${m.x[0]},${m.y[0]}`, 2);
  return cat(fromStrokes([p], 2), up); });
const toEye = () => F('toEye', () => { const m = more(), ex = m.x[m.n - 1], ey = m.y[m.n - 1];
  return sampleD(`M${ex},${ey} C${ex + 30},${ey + 10} 560,790 583,812`, 2); });
const coilSp = () => F('coilSp', () => { const p = []; for (let i = 0; i <= 90; i++) { const a = i / 90 * Math.PI * 4.2, r = 6 + i * .12; p.push(HAND[0] + Math.cos(a) * r * 1.5, HAND[1] - 4 + Math.sin(a) * r * .7); } return fromStrokes([p], 2); });
const coilUp = () => F('coilUp', () => { const c = coilSp(), m = more(), e0 = [c.x[c.n - 1], c.y[c.n - 1]]; return sampleD(`M${e0[0]},${e0[1]} C${e0[0] - 30},${e0[1] - 40} ${m.x[0] - 40},${m.y[0] + 50} ${m.x[0]},${m.y[0]}`, 2); });
// последовательность частей: keep — остаётся, иначе виден только «змейкой» у головы. w — доля времени части; pr 0..1
function seq(parts, pr, o, SN = 80) {
  let acc = 0; const tw = parts.reduce((s, p) => s + (p.w || 1), 0);
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i], f0 = acc / tw, f1 = (acc + (p.w || 1)) / tw; acc += p.w || 1;
    if (pr <= f0) break;
    const lp = Math.min(1, (pr - f0) / (f1 - f0)), here = pr < f1 || i === parts.length - 1, al = (o.al == null ? 1 : o.al) * (p.al == null ? 1 : p.al);
    const sn = SN / Math.max(1, p.sh.len);
    if (p.keep) draw(p.sh, 0, lp, { ...o, al, head: here && lp < 1 ? o.head : 0 });
    else if (lp < 1 || (i + 1 < parts.length && (pr - f1) / ((parts[i + 1].w || 1) / tw) * parts[i + 1].sh.len < SN)) {
      const spill = lp >= 1 ? (pr - f1) / ((parts[i + 1].w || 1) / tw) * parts[i + 1].sh.len / p.sh.len : 0;
      draw(p.sh, Math.max(0, lp - sn + spill), lp, { ...o, al, head: here && lp < 1 ? o.head : 0 });
    }
  }
}

function rain(layer, x0, x1, y0, y1, n, t, col, al, speed = 900, len = 16, slant = .12) {
  for (let i = 0; i < n; i++) {
    const ph = (R(i, 1) + t * speed / (y1 - y0) * (.8 + R(i, 2) * .4)) % 1, x = x0 + R(i, 3) * (x1 - x0), y = y0 + ph * (y1 - y0);
    line([x, y, x - len * slant, y + len], { layer, col, al: al * (.5 + R(i, 4) * .5), w: 1.4, head: 0, fresh: 0, wob: 0, step: 4 });
  }
}
function room(t, rev, wifeK, wifeOpen, wifeDir) {
  const p = i => rev == null ? 1 : ease.o(k01(rev, i * .12, .8 + i * .12));
  draw(S(ART.window), 0, p(2), { layer: 'bg', col: COL.dim, al: .9, head: p(2) < 1 ? .5 : 0 });
  draw(S(ART.curtain), 0, p(3), { layer: 'bg', col: COL.dim, al: .7, head: 0 });
  draw(S(ART.floor), 0, p(4), { layer: 'bg', col: COL.dim, al: .5, head: 0 });
  // огни города и дождь за окном
  for (let i = 0; i < 9; i++) glow('bg', 80 + R(i, 7) * 220, 470 + R(i, 8) * 80, 10 + R(i, 9) * 14, i % 3 ? COL.a : COL.g, .12 * p(2));
  if (p(2) > .5) rain('bg', 70, 312, 178, 556, 46, t, COL.g, .35 * p(2), 700, 14, .1);
  draw(S(ART.monitor), 0, 1, { col: COL.g, al: .75, head: 0 });
  draw(S(ART.bed), 0, p(1), { col: COL.g, al: .7, head: p(1) < 1 ? .6 : 0 });
  draw(S(ART.pillow), 0, p(1), { col: COL.g, al: .65, head: 0 });
  draw(F('manHead', () => fromStrokes(ART.manHeadS(), 2)), 0, p(0), { col: COL.g, al: 1, head: 0 });
  draw(F('wire', () => sampleD('M500,846 C470,800 520,700 470,620 C430,560 470,500 470,474', 3)), 0, p(1), { layer: 'bg', col: COL.dim, al: .8, head: 0, fresh: 0 });
  draw(S(ART.manBody), 0, p(0), { col: COL.g, al: .95, head: 0 });
  draw(S(ART.manHand), 0, p(0), { col: COL.g, al: 1, head: 0 });
  // жена — дышит
  const br = Math.sin(t * 2.1) * .006;
  const body = wifeK > 0 ? morph(S(ART.wifeA), S(ART.wifeB), ease.io(wifeK), 900) : S(ART.wifeA);
  draw(body, 0, p(2), { col: COL.a, al: .95, head: 0, sy: 1 + br, y: -1104 * br });
  draw(S(ART.stool), 0, p(2), { col: COL.a, al: .6, head: 0 });
  const hx = lerp(316, 262, ease.io(wifeK)), hy = lerp(846, 808, ease.io(wifeK));
  draw(fromStrokes(ART.wifeHead(hx, hy - 1104 * br * 0, wifeDir, wifeOpen), 2), 0, p(2), { col: COL.a, al: 1, head: 0 });
}
function monitorTrace(t) {
  // ЭКГ: история слева от головы и старая развёртка справа (стирается щелью)
  const hx = headX(t);
  draw(fromStrokes([ecgPts(X0, Math.min(hx, 562 + SPD * JERK), BEATS_NOW)], 1.5), 0, 1, { col: COL.g, al: 1, head: t < JERK ? 1.2 : 0, fresh: 40 });
  if (hx + 16 < 656) draw(fromStrokes([ecgPts(hx + 16, 656, BEATS_OLD)], 1.5), 0, 1, { col: COL.g, al: .45, head: 0, fresh: 0 });
  // показания
  const hr = t < .2 ? '72' : t < JERK ? '0' : (t < WRITE1 ? (Math.floor(t * 20) % 2 ? '0' : '?') : '?');
  draw(textShape('HR', 'futural', 9, 'l'), 0, 1, { x: 450, y: 318, col: COL.g, al: .8, head: 0, fresh: 0, wob: 0 });
  draw(textShape(hr, 'futural', 18, 'l'), 0, 1, { x: 472, y: 322, col: COL.g, al: 1, head: 0, fresh: 0, wob: 0 });
  if (t > .3 && t < JERK + .25 && Math.floor(t * 4) % 2 === 0) draw(textShape('ASYSTOLE', 'futural', 9, 'r'), 0, 1, { x: 652, y: 318, col: COL.a, al: 1, head: 0, fresh: 0, wob: 0 });
}
function shotRoom(t) {
  const cam = camAt(t, [[0, 552, 378, 3.25], [1.6, 552, 378, 3.25], [3.0, 552, 376, 3.42, ease.o], [4.6, 372, 760, 1.15], [6.0, 384, 780, 1.22, ease.o],
    [7.9, 470, 790, 1.62], [9.2, 583, 818, 10, ease.i]]);
  E.setCam(cam);
  const rev = t < 3.0 ? -1 : (t - 3.0) / 1.2;
  if (t >= 3.0) room(t, rev, 0, 0, 1); else draw(S(ART.monitor), 0, 1, { col: COL.g, al: .75, head: 0 });
  // экран монитора
  for (let gx = 0; gx <= 8; gx++) for (let gy = 0; gy <= 6; gy++) glow('bg', 444 + gx * 26.5, 304 + gy * 25.5, 1.6, COL.g, .35);
  monitorTrace(t);
  if (t >= JERK) {
    const ws = writeShape(), cl = connector().len / ws.len;
    const pr = ease.io(k01(t, JERK, WRITE1)) * .999 + .001;
    if (t < 3.2) {
      // написание «wait.»
      const wig = t > WRITE1 ? Math.sin((t - WRITE1) * 9) * 2 * Math.max(0, 1 - (t - WRITE1)) : 0;
      draw(ws, 0, pr, { col: COL.g, al: 1, head: 1.3, fresh: 90, w: 2.2, hot: .2 });
    }
    if (t >= 3.2) {
      // герой вытягивает линию из монитора: хвост стирает «wait.»
      const h = heroA(), wl = wait().len / h.len, k = ease.io(k01(t, 3.2, 5.7));
      const b = wl + (1 - wl) * k, a = Math.max(0, b - (k < 1 ? .1 + .12 * Math.sin(k * Math.PI) : .05));
      if (b < .999 || t < 5.75) draw(h, k > .02 ? a : 0, b, { col: COL.g, al: 1, head: 1.2, fresh: 70, w: 2.2 });
      draw(fromStrokes([[X0, BASE, 562 + SPD * JERK, BASE]], 2), 0, 1, { col: COL.g, al: .5, head: 0, fresh: 0 });
    }
  }
  if (t >= 5.7) {
    const fa = 1 - k01(t, 8.6, 9.0);
    const pr = t < 6.4 ? .3 * ease.io(k01(t, 5.7, 6.4)) : t < 7.9 ? .3 + .55 * ease.io(k01(t, 6.4, 7.9)) : .85 + .15 * ease.io(k01(t, 7.9, 8.6));
    seq([{ sh: coilSp(), keep: 1, al: 1 - k01(t, 7.4, 8.2), w: .3 }, { sh: coilUp(), keep: 0, w: .12 }, { sh: more(), keep: 1, w: .43 }, { sh: toEye(), keep: 0, w: .15 }], pr,
      { col: COL.g, al: fa, head: 1.3, w: 2.1, fresh: 80 });
  }
  return { cam, bgBlur: t < 3 ? 1.2 : 2.2 };
}

// ================= сборка =================
window.SHOTS = [[0, 9.3, shotRoom]];
window.ST = { seq, camAt, rain, R, S, F, room, heroA, wait, HAND, BASE, X0, monitorTrace };
window.DURATION = 52;
window.story = t => { const SH = window.SHOTS; for (const [a, b, fn] of SH) if (t >= a && t < b) return fn(t - a, t); const l = SH[SH.length - 1]; return l[2](t - l[0], t); };
})();
