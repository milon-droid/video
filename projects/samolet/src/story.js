// Сюжет во времени ролика t. Петля: последние 1.5 с — это «до начала» сцены в классе (s = t − DUR).
const DUR = 46, LOOP = 1.5;
// паузы сюжета (время сюжета стоит, идут отдельные сценки): мальчик понимает «это от меня», старик отвечает «No… Better.»
const HOLDS = [[3.2, 1.6], [35.0, 4.8]], REAL_DUR = DUR + HOLDS.reduce((a, h) => a + h[1], 0);
function warpT(T) {
  let off = 0;
  for (let i = 0; i < HOLDS.length; i++) {
    const [s, len] = HOLDS[i];
    if (T < s + off) return [T - off, null];
    if (T < s + off + len) return [s, { i, u: T - s - off }];
    off += len;
  }
  return [T - off, null];
}
const sOf = t => t >= DUR - LOOP ? t - DUR : t;
function herm(keys, t) {                 // [[t, x, v], ...] — кубический Эрмит по времени с заданной скоростью
  if (t <= keys[0][0]) return keys[0][1] + keys[0][2] * (t - keys[0][0]);
  for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) {
    const [t0, x0, v0] = keys[i - 1], [t1, x1, v1] = keys[i], h = t1 - t0, u = (t - t0) / h;
    const h00 = 2 * u ** 3 - 3 * u ** 2 + 1, h10 = u ** 3 - 2 * u ** 2 + u, h01 = -2 * u ** 3 + 3 * u ** 2, h11 = u ** 3 - u ** 2;
    return h00 * x0 + h10 * h * v0 + h01 * x1 + h11 * h * v1;
  }
  const k = keys[keys.length - 1]; return k[1] + k[2] * (t - k[0]);
}
const FX = [[5.62, 790, 1200], [6.8, 1650, 450], [29.8, 11000, 400], [31.0, 11560, 0]];
const FY = [[5.62, 1120, -500], [6.8, 820, 0], [12.0, 900, 0], [15.8, 1060, 0], [18.5, 820, 0], [21.5, 880, 0], [23.8, 1280, 0], [26.0, 1000, -40], [28.5, 880, 0], [31.0, 1330, 0]];
const RX = [[38.8, 11380, -900], [39.8, 10400, -2400], [43.5, 2500, -2000], [44.5, 1700, -540]];
const RY = [[38.8, 1230, -600], [39.8, 850, 0], [44.5, 900, 0]];
const AX = [[-1.5, 1700, -540], [.45, 640, -60]], AY = [[-1.5, 900, 0], [-.3, 1000, 120], [.45, 1385, 0]];
function planePos(t) {
  const s = sOf(t);
  if (s < .45 && (t < 5 || t >= DUR - LOOP)) return { x: herm(AX, s), y: herm(AY, s), dir: -1, fly: true };
  if (t >= 5.62 && t < 31.0) return { x: herm(FX, t), y: herm(FY, t), dir: 1, fly: true };
  if (t >= 38.8 && t < DUR - LOOP) return { x: herm(RX, t), y: herm(RY, t), dir: -1, fly: true };
  return { fly: false };
}
function planeAt(t) {
  const p = planePos(t); if (!p.fly) return p;
  const q = planePos(t - .02); const vx = (p.x - q.x) / .02, vy = (p.y - q.y) / .02;
  p.vx = vx; p.vy = vy; p.ang = clamp(Math.atan2(vy, Math.abs(vx) + 1) * .8, -.7, .7) * p.dir; p.bank = Math.sin(t * 2.3) * .6;
  return p;
}
// у кого лист: who, cx, cy, w, side, flip, fold, reveal
function sheetAt(t) {
  const s = sOf(t);
  if (s >= .45 && s < 5.0) {
    const fold = s < .75 ? 1 : s < 1.15 ? 1 - sstep(.75, 1.15, s) : s > 4.6 ? sstep(4.6, 5.0, s) : 0;
    const flip = s < 3.2 ? 1 : s < 3.5 ? lerp(1, -1, sstep(3.2, 3.5, s)) : -1;
    const side = flip > 0 ? 'A' : 'B', reveal = side === 'B' ? (s > 4.6 ? 99 : Math.floor(clamp((s - 3.55) / 1.0) * NB)) : 99;
    const cx = s < .75 ? 640 : lerp(640, 600, sstep(.75, 1.15, s)), cy = s < .75 ? 1385 : lerp(1385, 1345, sstep(.75, 1.15, s));
    return { cx, cy, w: 330, side, flip: Math.abs(flip) < .02 ? .02 : flip, fold, reveal, onDesk: s < .75 };
  }
  if (t >= 31.0 && t < 38.2) {
    const fold = t < 31.5 ? 1 : t < 31.9 ? 1 - sstep(31.5, 31.9, t) : t > 37.8 ? sstep(37.8, 38.2, t) : 0;
    const flip = t < 36.3 ? -1 : t < 36.6 ? lerp(-1, 1, sstep(36.3, 36.6, t)) : 1;
    const reveal = flip < 0 ? 99 : t < 36.6 ? 0 : t > 37.75 ? 99 : Math.floor(clamp((t - 36.6) / 1.1) * NA);
    const lap = sstep(34.95, 35.05, t) * (1 - sstep(36.1, 36.4, t));
    return { cx: lerp(BENCH_X, BENCH_X - 60, lap), cy: lerp(1330, 1455, lap), w: lerp(300, 240, lap), side: flip < 0 ? 'B' : 'A', flip: Math.abs(flip) < .02 ? .02 : flip, fold, reveal, pen: t > 36.55 && t < 37.8 };
  }
  return null;
}
const talk = (t, a, b) => t > a && t < b ? .2 + .3 * Math.abs(Math.sin(t * 17)) * Math.abs(Math.sin(t * 5.3)) : 0;
function kidPose(t) {
  let s = sOf(t); if (s > 7.5) s = -2;
  const K = { x: 600, y: 1650, R: 105, kind: 'boy', age: 10, sit: 1, outfit: 'stripes', hair: 'mop', t, seed: 0, look: [.2, .3], smile: 0 };
  if (s < .45) {                                                   // скучает, подперев щёку → видит самолётик
    const see = sstep(-.9, -.4, s);
    Object.assign(K, { hA: [585, 1300], hB: [740, 1385], tilt: -.12 * (1 - see), eye: lerp(.55, 1, see), look: [lerp(-.2, .9, see), lerp(.4, -.1, see)], wide: see * sstep(-.2, .3, s), O: sstep(0, .3, s), brow: see });
  } else if (s < .75) Object.assign(K, { wide: 1, O: 1, brow: 1, look: [.3, .7], hA: [520, 1300], hB: [700, 1300] });
  else if (s < 3.5) Object.assign(K, { hA: [435, 1345], hB: [765, 1345], look: [0, .75], furrow: sstep(1.5, 1.9, s), open: talk(s, 1.35, 3.6), tilt: s > 1.9 ? .12 : 0, brow: s > 2.9 ? .4 : 0 });
  else if (s < 4.6) { const u = clamp((s - 3.55) / 1.0), ln = Math.min(3, Math.floor(u * 4)), fr = (u * 4) % 1;
    Object.assign(K, { hA: [440, 1345], hB: [470 + fr * 260, 1295 + ln * 38], look: [lerp(-.4, .6, fr), .8], open: Math.max(.12, talk(s, 3.7, 5.9)), smile: .5, brow: .5 }); }
  else if (s < 5.0) Object.assign(K, { hA: [575, 1345], hB: [625, 1345], look: [0, .7], smile: .5 });
  else if (s < 5.35) Object.assign(K, { hA: [520, 1380], hB: [lerp(625, 790, sstep(5.0, 5.35, s)), lerp(1345, 1030, sstep(5.0, 5.35, s))], look: [.9, -.2], smile: .8, brow: .5 });
  else Object.assign(K, { hA: [520, 1380], hB: s < 5.65 ? [lerp(790, 900, sstep(5.35, 5.6, s)), lerp(1030, 1170, sstep(5.35, 5.6, s))] : [880, 1090 + Math.sin(s * 14) * 30],
    look: [1, -.3], smile: 1, open: Math.max(talk(s, 5.95, 7.5) * 1.6, .25), brow: .8, face: .3 });
  return K;
}
function oldPose(t) {
  const O = { x: BENCH_X, y: 1630, R: 95, kind: 'old', age: 80, sit: 1, outfit: 'cardigan', pants: ink(.3, .6, .4), hair: 'white', glasses: true, t, seed: 3,
    hA: [BENCH_X - 95, 1500], hB: [BENCH_X + 95, 1500], look: [-.5, .3], smile: .2 };
  if (t > 30.2 && t < 31.0) { const u = sstep(30.2, 30.9, t); Object.assign(O, { look: [lerp(-1, 0, u), lerp(-.3, .3, u)], wide: .5, brow: .7, hA: [lerp(BENCH_X - 95, BENCH_X - 60, u), lerp(1500, 1330, u)], hB: [lerp(BENCH_X + 95, BENCH_X + 60, u), lerp(1500, 1330, u)] }); }
  else if (t >= 31.0 && t < 37.8) {
    const unf = sstep(31.5, 31.9, t), toWife = sstep(34.5, 34.8, t) * (1 - sstep(35.9, 36.2, t));
    Object.assign(O, { hA: [BENCH_X - lerp(40, 150, unf), 1330], hB: [BENCH_X + lerp(40, 150, unf), 1330], look: [lerp(0, .9, toWife), lerp(.6, .1, toWife)], face: .45 * toWife,
      smile: sstep(32.6, 34.0, t) * .9 + .1, open: talk(t, 31.25, 35.0), bob: t > 34.0 && t < 34.6 ? -Math.abs(Math.sin(t * 16)) * 8 : 0, brow: .3 * toWife, eye: 1 - .25 * toWife, tilt: .06 * toWife });
    if (t >= 35.0 && t < 36.1) { O.hA = [BENCH_X - 170, 1455]; O.hB = [BENCH_X + 160, 1440]; O.open = talk(t, 35.0, 35.5) * .6; O.smile = 1; O.eye = .6; O.happyEyes = true; }   // держит её руку: «Better.»
    if (t >= 36.1 && t < 36.4) O.hB = [lerp(BENCH_X + 150, BENCH_X + 150, 0), 1330];
    if (t >= 36.55 && t < 37.8) {                                                   // пишет «NO. BETTER. IT GOES FAST…»
      const u = clamp((t - 36.6) / 1.1), ln = Math.min(3, Math.floor(u * 4)), fr = (u * 4) % 1;
      Object.assign(O, { hA: [BENCH_X - 150, 1330], hB: [BENCH_X - 110 + fr * 220, 1285 + ln * 30], look: [lerp(-.4, .5, fr), .7], smile: .8, brow: .3, eye: .8, face: 0 });
    }
    if (t > 37.2) O.open = talk(t, 37.3, 39.9);
  } else if (t >= 37.8 && t < 38.8) {
    const w = sstep(38.2, 38.5, t), th = sstep(38.5, 38.75, t);
    Object.assign(O, { hA: th > 0 ? [lerp(BENCH_X - 170, BENCH_X - 230, th), lerp(1170, 1230, th)] : [lerp(BENCH_X - 20, BENCH_X - 170, w), lerp(1330, 1170, w)],
      hB: [BENCH_X + 20, 1330], look: [-1, -.2], smile: .7, open: talk(t, 37.3, 39.9), brow: .5 });
  } else if (t >= 38.8) Object.assign(O, { hA: [BENCH_X - 200, 1120 + Math.sin(t * 9) * 25], look: [-1, -.3], smile: 1, brow: .4 });
  return O;
}

function wifePose(t) {                     // жена рядом на скамейке: слушает, кладёт голову ему на плечо
  const lean = sstep(34.6, 35.0, t);
  return { x: BENCH_X + 250, y: 1630, R: 86, kind: 'woman', age: 78, sit: 1, outfit: 'sweater', pants: ink(.45, .85, .35), hair: 'greybun', t, seed: 12,
    look: [-.8, .3], smile: .6 + .4 * sstep(33.0, 34.0, t), headDX: -.45 * lean, tilt: -.28 * lean, eye: 1 - .9 * lean * (1 - sstep(37.6, 38.0, t)), happyEyes: true,
    hA: lean > .5 ? [BENCH_X + 168, 1442] : [BENCH_X + 120, 1400], hB: [BENCH_X + 330, 1500] };
}

// ---------- сценки в паузах ----------
function kidHold(u) {                      // смотрит на подпись-рисунок, трогает свой вихор → «From… me?!»
  const K = kidPose(3.19);
  const sig = sstep(0, .3, u), touch = sstep(.3, .55, u) * (1 - sstep(1.25, 1.5, u)), wow = sstep(.7, .9, u);
  Object.assign(K, { look: [lerp(0, .7, sig) * (1 - touch * .6), lerp(.65, .2, sig) - touch * .9], furrow: (1 - wow) * .6,
    hA: touch > 0 ? [lerp(435, 590, touch), lerp(1345, 1040, touch)] : K.hA, wide: wow, O: wow > .5 && u < 1.3 ? 1 : 0, brow: wow, smile: sstep(1.25, 1.5, u), tilt: 0 });
  return K;
}
function oldHold(u) {                      // «Rich? Famous?» — смешок, качает головой — «No.» — вспышки — берёт её руку — «Better.»
  const O = oldPose(34.99);
  Object.assign(O, { look: u < 2.1 ? [0, .6] : [.9, .1], face: u < 2.1 ? 0 : .45, smile: 1, tilt: u < 2.3 ? Math.sin(u * 7) * .06 : .06,
    open: Math.max(talk(u, .05, 2.25), talk(u, 2.4, 2.85) * .7), bob: u > 1.5 && u < 2.1 ? -Math.abs(Math.sin(u * 16)) * 7 : 0, eye: u > 2.3 ? .7 : 1, happyEyes: true });
  if (u > 4.3) { const k = sstep(4.3, 4.5, u); O.hA = [lerp(BENCH_X - 150, BENCH_X - 170, k), lerp(1330, 1455, k)]; O.hB = [lerp(BENCH_X + 150, BENCH_X + 160, k), lerp(1330, 1440, k)]; O.eye = .6; }
  return O;
}
