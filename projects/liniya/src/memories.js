// ЛИНИЯ — воспоминания, окно, последний удар, рассвет
(() => {
const { clamp, lerp, k01, ease, COL, sampleD, fromStrokes, morph, textShape, draw, line, glow, cat, shift, at, mkShape } = E;
const { camAt, R, S, F, room, HAND, BASE, X0 } = ST;
const { crv, circ, person, bike, hand, house, tree, bench } = FIG;
const GY = 900, KID = [196, 232, 128], ID = { x: 360, y: 640, z: 1, r: 0 };
const C = { g: COL.g, a: COL.a, k: KID };
const toScr = (strokes, cam) => strokes.map(s => s.map((v, i) => i % 2 ? (v - cam.y) * cam.z + 640 : (v - cam.x) * cam.z + 360));
function year(txt, t0, u, cap, ct, x = 360, y = 290) { const k = k01(u, t0, t0 + .5); if (k <= 0) return; E.setCam(ID); draw(textShape(txt, 'futural', 30, 'c'), 0, ease.o(k), { x, y, col: COL.g, al: .8, head: k < 1 ? .8 : 0, wob: .3 });
  if (cap) { const c = k01(u, ct == null ? t0 + .5 : ct, (ct == null ? t0 + .5 : ct) + .9); if (c > 0) draw(textShape(cap, 'scripts', 40, 'c'), 0, ease.io(c), { x, y: y + 62, col: COL.a, al: .95, head: c < 1 ? 1 : 0, fresh: 60, wob: .4 }); } }
// SVG-путь → штрихи (для групп морфинга)
function svgStrokes(d, step = 2.5) { const q = sampleD(d, step), out = []; let cur = []; for (let i = 0; i < q.n; i++) { if (q.j[i] && cur.length) { out.push(cur); cur = []; } cur.push(q.x[i], q.y[i]); } if (cur.length) out.push(cur); return out; }
function rainX(t, n, al, excl, layer = 'bg', len = 18) {
  for (let i = 0; i < n; i++) { const ph = (R(i, 1) + t * (1.1 + R(i, 2) * .5)) % 1, x = -40 + R(i, 3) * 800, y = -40 + ph * (GY + 60);
    if (excl && excl(x, y)) continue; line([x, y, x - len * .15, y + len], { layer, col: COL.g, al: al * (.4 + R(i, 4) * .6), w: 1.3, head: 0, fresh: 0, wob: 0, step: 5 }); }
}
// ================= битвы-воспоминания: каждая отдаёт группы линий по цветам =================
const sc = u => u < 2.3 ? 240 * u : (() => { const d = Math.min(u - 2.3, 1.1); return 240 * 2.3 + 240 * (d - d * d / 2.2); })();
const BR = 40, BH = 230;
function bikeBeat(u) {
  const s = sc(u), bx = lerp(-160, 290, ease.o(k01(u, 0, 1.6))), dist = s + bx, wa = dist / BR, th = wa * .5;
  const b = bike(bx, GY, BR, th, wa);
  const boy = person(bx, GY, BH, 1, { hipAt: b.seat, feet: b.ped, hands: [b.bar, [b.bar[0] - 4, b.bar[1] + 2]], lean: .42, cap: true, smile: u > 3 });
  const gx = 1250 - s;
  const g0 = person(gx, GY, 215, -1, { fem: true });
  const hh = g0.head, HR = g0.HR;
  const girl = person(gx, GY, 215, -1, { fem: true, hands: [[hh[0] + 18, hh[1] - HR * 1.1], [hh[0] - 18, hh[1] - HR * 1.15]], hd: -.1 });
  const pole = [[gx + 80, GY, gx + 80, GY - 300], [gx + 50, GY - 300, gx + 110, GY - 300, gx + 110, GY - 352, gx + 50, GY - 352, gx + 50, GY - 300]];
  return { cam: { x: 400, y: 730, z: 1.42, r: 0 }, g: [...b.S, ...boy.S], a: girl.S, dim: pole, s, gx, b, boy, girl };
}
function umbBeat(u) {
  const B0 = bikeBeat(3.4), bx = 290, b = B0.b, gx = B0.gx;
  const k = ease.io(k01(u, .6, 1.4));
  const hipS = [bx + 80, GY - BH * .5], feetS = [[bx + 66, GY], [bx + 92, GY]];
  const hip = [lerp(b.seat[0], hipS[0], k), lerp(b.seat[1], hipS[1], k)];
  const feet = [0, 1].map(i => [lerp(b.ped[i][0], feetS[i][0], k), lerp(b.ped[i][1], feetS[i][1], k) - Math.sin(k * Math.PI) * 18 * (i ? 1 : 0)]);
  const op = ease.back(k01(u, 1.3, 1.9));
  const handU = [lerp(b.bar[0], gx - 120, ease.io(k01(u, .9, 1.5))), lerp(b.bar[1], GY - 175, ease.io(k01(u, .9, 1.5)))];
  const restL = [lerp(b.bar[0] - 4, hip[0] - 14, k), lerp(b.bar[1], hip[1] + 12, k)];
  const lean = lerp(.42, .04, k) + .06 * ease.io(k01(u, 2.4, 3.2));
  const boy = person(bx, GY, BH, 1, { hipAt: hip, feet, hands: [restL, handU], lean, cap: true, smile: u > 2.2, eye: (u > 2.8 && u < 2.95) ? 0 : 1 });
  // зонт: древко от кисти вверх к центру
  const top = [lerp(handU[0], (bx + gx) / 2 + 30, .9), GY - 400], wU = lerp(30, 340, op), hU = lerp(170, 80, op);
  const can = crv([top[0] - wU / 2, top[1] + hU, top[0] - wU * .32, top[1] + hU * .25, top[0], top[1], top[0] + wU * .32, top[1] + hU * .25, top[0] + wU / 2, top[1] + hU], 10);
  const scal = []; for (let i = 0; i <= 60; i++) { const f = i / 60, x = top[0] + wU / 2 - f * wU; scal.push(x, top[1] + hU - Math.abs(Math.sin(f * Math.PI * 4)) * 14 * op); }
  const umb = [can.concat(scal), [handU[0], handU[1], top[0], top[1], top[0], top[1] - 14], [handU[0], handU[1], handU[0] - 6, handU[1] + 12, handU[0] - 14, handU[1] + 10]];
  const hk = ease.io(k01(u, 1.9, 2.5));
  const g0 = person(gx, GY, 215, -1, { fem: true }), hh = g0.head, HR = g0.HR;
  const front = [[gx - 34, GY - 118], [gx - 30, GY - 112]];
  const hands = [[lerp(hh[0] + 18, front[0][0], hk), lerp(hh[1] - HR * 1.1, front[0][1], hk)], [lerp(hh[0] - 18, front[1][0], hk), lerp(hh[1] - HR * 1.15, front[1][1], hk)]];
  const girl = person(gx, GY, 215, -1, { fem: true, hands, hd: lerp(-.1, .12, hk), lean: .1 * ease.io(k01(u, 2.4, 3.2)), smile: u > 2.3, eye: (u > 3.05 && u < 3.2) ? 0 : 1 });
  const cam = camAt(u, [[0, 400, 730, 1.42], [.6, 400, 730, 1.42], [3.4, 452, 700, 1.78]]);
  const ud = k01(u, .95, 1.35);
  const umbV = ud <= 0 ? [] : ud >= 1 ? umb : [fromStrokes(umb, 2)].map(q => { const n = Math.max(2, Math.floor(q.n * ud)); const o = []; for (let i = 0; i < n; i++) o.push(q.x[i], q.y[i]); return o; });
  return { cam, g: [...b.S, ...boy.S, ...umbV], a: girl.S, dim: B0.dim, umbTop: top, wU, hU, op };
}
// руки (экранные координаты, камера ID)
function handsBeat(u) {
  const k = ease.io(k01(u, .7, 1.5));
  const his = hand(70, 800, 4.2, 1, -.18, 0);
  const her = hand(lerp(720, 650, k), lerp(560, 735, k), 3.9, -1, lerp(.5, .28, k), .25 * k);
  // кольцо: безымянный палец её руки, у основания
  const rot = lerp(.5, .28, k), s = 3.9, wx = lerp(720, 650, k), wy = lerp(560, 735, k);
  const lp = (uu, vv) => { const X = -uu, Y = vv, c = Math.cos(rot), n = Math.sin(rot); return [wx + (X * c - Y * n) * s, wy + (X * n + Y * c) * s]; };
  const rp = lp(58, 3.5);
  return { cam: ID, g: [his], a: [her], ring: rp, rot };
}
const H_HIS = 205, H_HER = 515;
function houseBeat(u) {
  const grow = ease.io(k01(u, .9, 2.0)), kh = lerp(150, 205, grow);
  const walk = ease.io(k01(u, 2.2, 3.4)), kx = 360 + 330 * walk;
  const ph = (kx - 360) / 26;
  const kidLeg = walk > 0 ? [[Math.sin(ph) * .45, Math.max(0, -Math.sin(ph)) * .6], [-Math.sin(ph) * .45, Math.max(0, Math.sin(ph)) * .6]] : [[0, 0], [0, 0]];
  const holding = u < 2.15;
  const kHand = [[kx - kh * .2, GY - kh * .5 + (kh > 150 ? 10 : -6)], [kx + kh * .2, GY - kh * .5 + (kh > 150 ? 10 : -6)]];
  const wave = Math.sin(u * 13) * .35;
  const kid = person(kx, GY, kh, 1, { kid: false, hands: holding ? kHand : null, armL: [.05, 0], armR: [Math.PI * .85 + wave, .3], legL: kidLeg[0], legR: kidLeg[1], smile: true, cap: false });
  const him = person(H_HIS, GY, 232, 1, { hands: [null, holding ? kHand[0] : null], armL: [.08, -.1], armR: holding ? [0, 0] : [Math.PI * .8 + wave * .8, .3], smile: true });
  const her = person(H_HER, GY, 216, -1, { fem: true, hands: [null, holding ? kHand[1] : null], armL: [.08, -.1], armR: holding ? [0, 0] : [Math.PI * .8 - wave * .8, .3], smile: true });
  const hs = house(360, GY, 1.45);
  const cam = camAt(u, [[0, 360, 740, 1.3], [.6, 360, 740, 1.3], [3.5, 380, 750, 1.38]]);
  const kS = kid.S.slice(); if (walk > 0) { const h0 = kid.hand[0]; kS.push([h0[0] - 22, h0[1] + 2, h0[0] + 22, h0[1] + 2, h0[0] + 22, h0[1] + 40, h0[0] - 22, h0[1] + 40, h0[0] - 22, h0[1] + 2], [h0[0] - 6, h0[1] + 2, h0[0] - 6, h0[1] - 4, h0[0] + 6, h0[1] - 4, h0[0] + 6, h0[1] + 2]); }
  return { cam, g: [...hs, ...him.S], a: her.S, k: kS, grow, walk };
}
function benchBeat(u) {
  const S = [], A = [];
  const B = bench(360, GY, 1.4);
  // спиной к нам: он слева, она справа, голова у него на плече
  const hx = 300, sy = GY - 64 * 1.4;
  S.push(crv([hx - 70, sy, hx - 66, sy - 70, hx - 50, sy - 128, hx - 20, sy - 150, hx + 22, sy - 150, hx + 52, sy - 128, hx + 64, sy - 66, hx + 66, sy], 8));
  S.push(circ(hx, sy - 190, 34, 38, 0, Math.PI * 2, 40));
  S.push(crv([hx - 26, sy - 214, hx - 6, sy - 224, hx + 16, sy - 220], 4));
  S.push(crv([hx + 40, sy - 135, hx + 90, sy - 150, hx + 140, sy - 135, hx + 158, sy - 110], 8)); // его рука у неё на плечах
  const tilt = ease.io(k01(u, 1.0, 2.0)), fx = 430, hxF = lerp(426, 392, tilt), hyF = lerp(sy - 176, sy - 164, tilt);
  A.push(crv([fx - 60, sy, fx - 58, sy - 60, fx - 46, sy - 112, fx - 18, sy - 132, fx + 20, sy - 132, fx + 46, sy - 112, fx + 58, sy - 60, fx + 60, sy], 8));
  A.push(circ(hxF, hyF, 31, 35, 0, Math.PI * 2, 40));
  A.push(circ(hxF + 4, hyF - 38, 14, 12, 0, Math.PI * 2, 18));
  const tr = tree(560, GY, 1.25, Math.sin(u * 1.3) * 4);
  const cam = camAt(u, [[0, 380, 760, 1.4], [.6, 380, 760, 1.4], [4.1, 380, 770, 1.55]]);
  return { cam, g: [...B, ...S], a: A, dim: tr };
}

// 1971: роды — та же палата, но тогда в койке она, а он на стуле (параллель)
function birthBeat(u) {
  const dim = [...svgStrokes(ART.window), ...svgStrokes(ART.bed), ...svgStrokes(ART.pillow), ...svgStrokes(ART.floor),
    ...svgStrokes('M540,120 L540,236 M500,276 L540,236 L580,276 Z')];
  const labor = k01(u, .6, 2.3) * (1 - k01(u, 2.3, 2.5)), born = ease.io(k01(u, 2.6, 3.4));
  const shake = labor * Math.sin(u * 31) * 3;
  const A = svgStrokes(ART.manBody).map(q => q.map((v, i) => i % 2 ? v : v));
  const hx = 588 + shake * .4 + 6 * labor, hy = 836 - 4 * labor;
  A.push(...ART.wifeHead(hx, hy, -1, born > .3 ? 1 : 0));
  if (born <= 0) A.push([hx - 34, hy + 10, hx - 40, hy + 14]); // стиснутые губы
  const lean = ease.io(k01(u, .7, 1.4)) * (1 - born * .6);
  const G = svgStrokes(ART.wifeB).map(q => q.map((v, i) => i % 2 ? v : v + lean * 10));
  const mh = [262 + lean * 26, 808 - lean * 6];
  G.push(circ(mh[0], mh[1], 24, 26, 0, Math.PI * 2, 40));
  G.push([mh[0] + 22, mh[1] - 6, mh[0] + 30, mh[1] + 4, mh[0] + 23, mh[1] + 8]);
  G.push(crv([mh[0] - 20, mh[1] - 12, mh[0] - 6, mh[1] - 28, mh[0] + 14, mh[1] - 24], 4));
  G.push(born > .5 ? crv([mh[0] + 6, mh[1] + 10, mh[0] + 12, mh[1] + 14, mh[0] + 18, mh[1] + 10], 3) : [mh[0] + 8, mh[1] + 12, mh[0] + 17, mh[1] + 12]);
  G.push(born > .5 ? crv([mh[0] + 5, mh[1] - 4, mh[0] + 10, mh[1] - 7, mh[0] + 15, mh[1] - 4], 3) : circ(mh[0] + 10, mh[1] - 4, 2, 2.4, 0, Math.PI * 2, 8));
  const K = [];
  if (born > 0) { const bx = 500, by = 842 - born * 6, sc2 = born;
    K.push(circ(bx, by, 30 * sc2, 15 * sc2, 0, Math.PI * 2, 40), circ(bx - 26 * sc2, by - 6, 11 * sc2, 11 * sc2, 0, Math.PI * 2, 24),
      [bx - 29 * sc2, by - 7, bx - 26 * sc2, by - 5, bx - 23 * sc2, by - 7], crv([bx - 10 * sc2, by - 10, bx + 4 * sc2, by - 4, bx + 20 * sc2, by - 9], 4)); }
  const cam = camAt(u, [[0, 372, 760, 1.15], [.6, 372, 760, 1.15], [2.3, 440, 830, 1.5], [5.0, 470, 836, 1.62]]);
  return { cam, dim, a: A, g: G, k: K, labor, born };
}
// 1978: отец учит сына кататься и отпускает (перекличка с его велосипедом 1961)
const ssc = u => u < 2.0 ? 200 * u : 400 + 200 * (Math.min(u - 2, 1) - Math.min(u - 2, 1) ** 2 / 2);
function sonBikeBeat(u) {
  const s = ssc(u), kxw = 200 * u, kx = 330 + (kxw - s);
  const wa = kxw / 28, b = bike(kx, GY, 28, wa * .5, wa);
  const wob = Math.sin(u * 7) * .12 * k01(u, 2.0, 2.4) * (1 - k01(u, 2.6, 3.4));
  const kid = person(kx, GY, 150, 1, { hipAt: b.seat, feet: b.ped, hands: [b.bar, [b.bar[0] - 3, b.bar[1] + 2]], lean: .3 + wob, cap: true, kid: true, smile: u > 2.6 });
  const run = 1 - k01(u, 2.0, 3.0), ph = s / 34, fx = 262;
  const legs = [[Math.sin(ph) * .7 * run, -Math.max(0, Math.sin(ph + 1.4)) * 1.1 * run], [-Math.sin(ph) * .7 * run, -Math.max(0, -Math.sin(ph + 1.4)) * 1.1 * run]];
  const hold = u < 2.05, cheer = ease.back(k01(u, 2.5, 3.0));
  const seatBack = [b.seat[0] - 14, b.seat[1] + 4];
  const dad = person(fx, GY, 232, 1, { legL: legs[0], legR: legs[1], hipY: Math.abs(Math.sin(ph)) * 8 * run, lean: .22 * run,
    hands: hold ? [null, seatBack] : null, armL: [lerp(-.4 * Math.sin(ph) * run, Math.PI * .85, cheer), .2], armR: [lerp(.1, Math.PI * .8, cheer), .25], smile: true, eye: 1 });
  return { cam: { x: 400, y: 740, z: 1.42, r: 0 }, g: dad.S, k: [...b.S, ...kid.S], s, kx };
}
// 2008: медленный танец на кухне под радио
function danceBeat(u) {
  const sw = Math.sin(u * 1.7) * 9, lx = 318 + sw, rx = 392 + sw;
  const him = person(lx, GY, 230, 1, { lean: .05, hands: [[355 + sw, GY - 178], [rx - 14, GY - 128]], eye: 0, smile: true, old: true });
  const her = person(rx, GY, 214, -1, { fem: true, lean: .07, hands: [[lx + 18, GY - 186], [356 + sw, GY - 176]], eye: 0, smile: true, hd: .12 });
  const dim = [[60, 300, 230, 300, 230, 520, 60, 520, 60, 300], [145, 300, 145, 520], [60, 410, 230, 410],
    [470, GY - 150, 680, GY - 150], [490, GY - 150, 490, GY], [660, GY - 150, 660, GY],
    [560, GY - 150, 560, GY - 200, 640, GY - 200, 640, GY - 150], circ(582, GY - 175, 12, 12, 0, Math.PI * 2, 20), [610, GY - 188, 630, GY - 188], [610, GY - 176, 630, GY - 176], [600, GY - 200, 620, GY - 228]];
  const cam = camAt(u, [[0, 400, 720, 1.45], [.6, 400, 720, 1.45], [4.2, 372, 735, 1.75]]);
  return { cam, g: him.S, a: her.S, dim };
}
const BEATS = [];
const OFF = ST.OFF, M0 = 10.0 + OFF;
{ let t0 = M0; for (const [d, fn, nm] of [[3.6, bikeBeat, 'bike'], [4.2, umbBeat, 'umb'], [3.6, handsBeat, 'hands'], [5.2, birthBeat, 'birth'], [4.4, sonBikeBeat, 'son'], [4.0, houseBeat, 'house'], [4.2, danceBeat, 'dance'], [4.8, benchBeat, 'bench']]) { BEATS.push([t0, d, fn, nm]); t0 += d; } }
const MEND = BEATS[BEATS.length - 1][0] + BEATS[BEATS.length - 1][1];
const TR = .6;
const ENDCACHE = {};
const scrGroups = (st) => ({ g: toScr(st.g || [], st.cam), a: toScr(st.a || [], st.cam), k: toScr(st.k || [], st.cam), dim: toScr(st.dim || [], st.cam) });
function endState(i) { if (!ENDCACHE[i]) { const [, d, fn] = BEATS[i]; ENDCACHE[i] = scrGroups(fn(d)); } return ENDCACHE[i]; }
const SHC = {};
function shp(key, strokes) { return fromStrokes(strokes, 2.5); }
function drawGroups(G, u, i, extraAl = 1) {
  E.setCam(ID);
  for (const key of ['dim', 'g', 'k', 'a']) {
    const st = G[key]; if (!st.length) continue;
    const col = key === 'dim' ? COL.dim : C[key], al = (key === 'dim' ? .8 : 1) * extraAl;
    draw(fromStrokes(st, 2.5), 0, 1, { col, al, head: 0, fresh: 0, w: key === 'dim' ? 2 : 2.4 });
  }
}
function shotMem(lt, t) {
  // переход: дуга закрытого глаза → дорога
  if (t < M0) {
    E.setCam(ID);
    const k = ease.io(k01(t, M0 - .7, M0));
    const A = F('eyeArc', () => sampleD('M270,540 Q340,590 410,550', 2)), Bq = F('road', () => sampleD(`M-20,${GY} L740,${GY}`, 2));
    draw(morph(A, Bq, k, 300), 0, 1, { col: COL.g, al: 1, head: 1.2, w: 2.4 + 2 * (1 - k) });
    return { cam: ID, flash: .1 * (1 - k) };
  }
  let i = BEATS.length - 1; for (let j = 0; j < BEATS.length; j++) if (t < BEATS[j][0] + BEATS[j][1]) { i = j; break; }
  const [t0, dur, fn, nm] = BEATS[i], u = t - t0;
  // мир за героями
  let st;
  if (i > 0 && u < TR) {
    // морфинг одной линией из прошлой сцены в новую
    const k = ease.io(u / TR), A = endState(i - 1), B = scrGroups(fn(TR));
    E.setCam(ID);
    for (const key of ['dim', 'g', 'k', 'a']) {
      const col = key === 'dim' ? COL.dim : C[key];
      const a = A[key], b = B[key];
      if (a.length && b.length) draw(morph(fromStrokes(a, 3), fromStrokes(b, 3), k, 1400), 0, 1, { col, al: key === 'dim' ? .8 : 1, head: 0, fresh: 0, w: 2.4 });
      else if (a.length) draw(fromStrokes(a, 3), k, 1, { col, al: 1 - k * .5, head: .8, fresh: 0 });
      else if (b.length) draw(fromStrokes(b, 3), 0, k, { col, al: 1, head: .8, fresh: 0 });
    }
    st = { cam: fn(TR).cam };
  } else {
    st = fn(u);
    const G = scrGroups(st);
    let al = 1;
    if (i === BEATS.length - 1 && u > dur - 1.0) {
      // всё сматывается обратно в одну линию
      const kk = ease.i(k01(u, dur - 1.0, dur - .1)); E.setCam(ID);
      for (const key of ['dim', 'g', 'k', 'a']) { if (!G[key].length) continue; draw(fromStrokes(G[key], 2.5), kk, 1, { col: key === 'dim' ? COL.dim : C[key], al: 1, head: kk > 0 && kk < 1 ? 1 : 0, fresh: 40 }); }
    } else if (i === 0 && u < 1.2) {
      // первая сцена рисуется по ходу
      const kk = ease.o(k01(u, 0, 1.0)); E.setCam(ID);
      for (const key of ['dim', 'g', 'a']) { if (!G[key].length) continue; draw(fromStrokes(G[key], 2.5), 0, key === 'g' ? kk : 1, { col: key === 'dim' ? COL.dim : C[key], al: 1, head: kk < 1 ? 1 : 0, fresh: 50 }); }
    } else drawGroups(G, u, i, al);
    if ((nm === 'bike' || nm === 'umb') && !(i === 0 && u < 1.2)) { // мокрый асфальт: отражение
      const gs = (GY - st.cam.y) * st.cam.z + 640; E.setCam(ID);
      for (const key of ['g', 'a']) { const m = G[key].map(q => q.map((v, j) => j % 2 ? 2 * gs - v + 6 : v)); if (m.length) draw(fromStrokes(m, 3), 0, 1, { layer: 'bg', col: C[key], al: .3 * (nm === 'bike' ? k01(u, 2.4, 3.4) : 1), head: 0, fresh: 0, wob: 3.5, ret: 0 }); }
    }
  }
  // окружение каждой сцены
  E.setCam(st.cam || ID);
  if (nm === 'bike') {
    const s = sc(u);
    draw(F('road', () => sampleD(`M-20,${GY} L740,${GY}`, 2)), 0, 1, { col: COL.g, al: .9, head: 0, fresh: 0 });
    for (let j = 0; j < 8; j++) { const x = ((j * 120 - s * 1.25) % 960 + 960) % 960 - 120; line([x, GY + 60, x + 54, GY + 60], { layer: 'fg', col: COL.g, al: .6, head: 0, fresh: 0, w: 3 }); }
    for (let j = 0; j < 6; j++) { const x = ((j * 300 - s * .45) % 1800 + 1800) % 1800 - 300; draw(fromStrokes(tree(x, GY - 40, .55 + R(j, 5) * .2, 0), 3), 0, 1, { layer: 'bg', col: COL.dim, al: .7, head: 0, fresh: 0 }); }
    const hill = []; for (let x = -60; x <= 780; x += 10) hill.push(x, GY - 150 - 40 * Math.sin((x + s * .15) * .006) - 20 * Math.sin((x + s * .15) * .017)); line(hill, { layer: 'bg', col: COL.dim, al: .45, head: 0, fresh: 0, step: 6 });
    year('1961', .4, u, 'the rain', 2.6);
    const rk = k01(u, 2.4, 3.2); if (rk > 0) { rainX(t, Math.round(70 * rk), .5); rainX(t * 1.3, Math.round(16 * rk), .5, null, 'fg', 30); }
  }
  if (nm === 'umb') {
    E.setCam(st.cam);
    draw(F('road', () => sampleD(`M-20,${GY} L740,${GY}`, 2)), 0, 1, { col: COL.g, al: .9, head: 0, fresh: 0 });
    const r = st.umbTop, ex = (x, y) => st.op > .6 && Math.abs(x - r[0]) < st.wU * .5 && y > r[1] + 20;
    rainX(t, 80, .5, ex); rainX(t * 1.3, 16, .5, null, 'fg', 30);
    // капли отскакивают от зонта
    if (st.op > .8) for (let j = 0; j < 6; j++) { const ph = (t * 3 + R(j, 9)) % 1, x = r[0] + (R(j, 8) - .5) * st.wU * .8, y = r[1] + 10 + Math.abs(x - r[0]) * .45;
      line([x, y, x + (R(j, 7) - .5) * 30 * ph, y - 20 * ph * (1 - ph) * 4], { col: COL.g, al: .6 * (1 - ph), w: 1.4, head: 0, fresh: 0 }); }
    if (u > 2.4) glow('mid', lerp(st.umbTop[0], 480, .5), GY - 300, 120, COL.a, .08 * k01(u, 2.4, 3.2));
  }
  if (nm === 'hands') {
    E.setCam(ID);
    const rk = ease.o(k01(u, 1.4, 2.0));
    if (rk > 0) { const st2 = handsBeat(u), rp = st2.ring;
      const ring = circ(rp[0], rp[1], 16, 7, -Math.PI / 2, Math.PI * 1.5, 40);
      const rr = []; for (let j = 0; j < ring.length; j += 2) { const dx = ring[j] - rp[0], dy = ring[j + 1] - rp[1], c = Math.cos(st2.rot + Math.PI / 2), n = Math.sin(st2.rot + Math.PI / 2); rr.push(rp[0] + dx * c - dy * n, rp[1] + dx * n + dy * c); }
      draw(fromStrokes([rr], 1.5), 0, rk, { col: COL.w, al: 1, head: rk < 1 ? 1.4 : 0, w: 3, hot: .4 });
      const sp = ease.o(k01(u, 1.9, 2.4)) * (1 - k01(u, 2.4, 2.9));
      if (sp > 0) { const L = 46 * sp, sx = rp[0] + 14, sy = rp[1] - 16; line([sx - L, sy, sx + L, sy], { col: COL.w, al: sp, head: 0, w: 2 }); line([sx, sy - L, sx, sy + L], { col: COL.w, al: sp, head: 0, w: 2 }); glow('mid', sx, sy, 50, COL.w, .3 * sp); }
    }
    year('1968', .9, u, 'yes.', 1.9);
  }
  if (nm === 'house') {
    E.setCam(st.cam);
    draw(F('road', () => sampleD(`M-20,${GY} L740,${GY}`, 2)), 0, 1, { col: COL.g, al: .7, head: 0, fresh: 0 });
    glow('mid', 360 + 62.5 * 1.45, GY - 100 * 1.45, 50, COL.a, .35); // свет в окне
    for (let j = 0; j < 3; j++) { const ph = (u * .35 + j / 3) % 1, x0 = 360 + 72 * 1.45, y0 = GY - 250 * 1.45 - ph * 140;
      const sm = []; for (let q = 0; q <= 16; q++) sm.push(x0 + Math.sin(q * .5 + u * 2 + j) * 10 * (1 + ph), y0 - q * 3); line(sm, { layer: 'bg', col: COL.dim, al: .7 * Math.sin(ph * Math.PI), head: 0, fresh: 0 }); }
    const yr = st.grow <= 0 ? '1980' : st.grow >= 1 ? '1990' : String(1980 + Math.round(st.grow * 10));
    year(yr, .8, u, 'goodbye, son', 2.3);
  }
  if (nm === 'bench') {
    E.setCam(st.cam);
    draw(F('road', () => sampleD(`M-20,${GY} L740,${GY}`, 2)), 0, 1 - ease.i(k01(u, 3.1, 4.0)), { col: COL.g, al: .7, head: 0, fresh: 0 });
    for (let j = 0; j < 9; j++) { const ph = (u * .22 + R(j, 3)) % 1, x = 470 + R(j, 4) * 200 + Math.sin(ph * 9 + j) * 30, y = GY - 300 + ph * 300;
      const lf = [x - 7, y, x, y - 4, x + 7, y, x, y + 4, x - 7, y]; const a = Math.sin(ph * Math.PI);
      draw(fromStrokes([lf.map((v, q) => q % 2 ? v : v)], 1.5), 0, 1, { col: COL.a, al: .8 * a * (1 - k01(u, 3.1, 3.8)), head: 0, fresh: 0, w: 1.6 }); }
    glow('bg', 360, GY - 260, 260, COL.a, .07);
    year('2019', .8, u, 'still you', 1.6);
  }
  if (nm === 'birth') {
    E.setCam(st.cam);
    glow('bg', 540, 290, 140, COL.a, .16); // лампа тех лет
    for (let j = 0; j < 7; j++) glow('bg', 80 + R(j, 7) * 220, 470 + R(j, 8) * 80, 10 + R(j, 9) * 14, COL.a, .1);
    if (st.labor > 0) { glow('mid', 392, 878, 50, COL.a, .45 * st.labor * (.6 + .4 * Math.sin(u * 9))); glow('mid', 392, 878, 18, COL.w, .4 * st.labor); }
    if (st.born > 0) glow('mid', 500, 838, 70, KID, .25 * st.born * (1 + .25 * Math.sin(u * 6.3)));
    year('1971', .8, u, 'our son', 3.2);
  }
  if (nm === 'son') {
    E.setCam(st.cam);
    draw(F('road', () => sampleD(`M-20,${GY} L740,${GY}`, 2)), 0, 1, { col: COL.g, al: .9, head: 0, fresh: 0 });
    for (let j = 0; j < 6; j++) { const x = ((j * 300 - st.s * .45) % 1800 + 1800) % 1800 - 300; draw(fromStrokes(tree(x, GY - 40, .55 + R(j, 5) * .2, 0), 3), 0, 1, { layer: 'bg', col: COL.dim, al: .7, head: 0, fresh: 0 }); }
    for (let j = 0; j < 8; j++) { const x = ((j * 120 - st.s * 1.25) % 960 + 960) % 960 - 120; line([x, GY + 60, x + 54, GY + 60], { layer: 'fg', col: COL.g, al: .5, head: 0, fresh: 0, w: 3 }); }
    glow('bg', 600, GY - 420, 220, COL.a, .08);
    year('1978', .8, u, 'let go', 2.1);
  }
  if (nm === 'dance') {
    E.setCam(st.cam);
    draw(F('road', () => sampleD(`M-20,${GY} L740,${GY}`, 2)), 0, 1, { col: COL.dim, al: .8, head: 0, fresh: 0 });
    glow('mid', 360, GY - 220, 180, COL.a, .09);
    for (let j = 0; j < 4; j++) { const ph = (u * .35 + j / 4) % 1, x = 600 - ph * 120 + Math.sin(ph * 8 + j) * 14, y = GY - 220 - ph * 260, a = Math.sin(ph * Math.PI);
      const nt = [...circ(x, y, 7, 5.5, 0, Math.PI * 2, 14), x + 7, y, x + 7, y - 30, x + 18, y - 24];
      draw(fromStrokes([nt], 1.5), 0, 1, { col: COL.a, al: .85 * a, head: 0, fresh: 0, w: 1.8 }); }
    year('2008', .8, u, 'our song', 1.6);
  }
  return { cam: st.cam || ID };
}
// ================= палата-2: окно, жена просыпается =================
const WT1 = { x: 190, y: 296, s: 40 }, WT2 = { x: 190, y: 372, s: 32 };
const t1 = () => F('t1', () => shift(textShape('thank you', 'scripts', WT1.s), WT1.x, WT1.y));
const t2 = () => F('t2', () => shift(textShape('for 55 years.', 'scripts', WT2.s), WT2.x, WT2.y));
const room2Parts = () => F('r2p', () => { const a = t1(), b = t2();
  const go = sampleD(`M583,812 C 600,700 520,560 420,470 C 330,390 ${a.x[0] + 40},${a.y[0] + 60} ${a.x[0]},${a.y[0]}`, 2);
  const mid = sampleD(`M${a.x[a.n - 1]},${a.y[a.n - 1]} C ${a.x[a.n - 1] + 20},${a.y[a.n - 1] + 30} ${b.x[0] - 30},${b.y[0] - 30} ${b.x[0]},${b.y[0]}`, 2);
  return [go, a, mid, b]; });
const toMon = () => F('toMon', () => { const b = t2(); return sampleD(`M${b.x[b.n - 1]},${b.y[b.n - 1]} C 360,330 400,250 470,250 C 520,250 430,400 ${X0},${BASE}`, 2); });
function shotRoom2(lt, t) {
  const cam = camAt(lt, [[0, 583, 818, 10], [1.0, 400, 720, 1.15, ease.o], [2.2, 210, 400, 1.8], [5.4, 214, 404, 1.9], [6.6, 300, 700, 1.22], [10.0, 330, 690, 1.26], [11.0, 552, 378, 3.25, ease.i]]);
  E.setCam(cam);
  const wo = ease.io(k01(lt, 5.7, 6.1)), wk = ease.io(k01(lt, 6.2, 7.6));
  const dir = lt < 8.8 ? -1 : 1;
  room(t, null, wk, wo, wk > .02 ? dir : 1);
  // монитор: ровная линия
  draw(fromStrokes([[X0, BASE, 656, BASE]], 2), 0, 1, { col: COL.g, al: .55, head: 0, fresh: 0 });
  // запотевшее стекло
  const fog = ease.o(k01(lt, 1.6, 2.6));
  for (let j = 0; j < 7; j++) glow('mid', 90 + R(j, 2) * 200, 220 + R(j, 3) * 300, 90, COL.w, .035 * fog);
  // герой пишет на стекле
  const pr = lt < 1.2 ? 0 : lt < 5.4 ? ease.io(k01(lt, 1.2, 5.4)) : 1;
  const read = 1 + .5 * Math.sin(Math.max(0, lt - 7.4) * 3) * k01(lt, 7.4, 7.8) * (1 - k01(lt, 9, 9.6));
  if (pr > 0) { const [go, a, mid, b] = room2Parts();
    ST.seq([{ sh: go, keep: 0, w: .22 }, { sh: a, keep: 1, w: .36 }, { sh: mid, keep: 0, w: .06 }, { sh: b, keep: 1, w: .36 }], pr, { col: COL.g, al: Math.min(1.2, read), head: 1.3, fresh: 80, w: 2.3, hot: .25 }); }
  // герой уходит в монитор
  if (lt > 8.0) { const k = ease.io(k01(lt, 8.0, 10.0)), tm = toMon(); draw(tm, Math.max(0, k - .25), k, { col: COL.g, al: 1, head: k < 1 ? 1.2 : 0, fresh: 60 }); }
  // касание рук
  const touch = k01(lt, 7.2, 7.8); if (touch > 0) { glow('mid', 392, 878, 46, COL.a, .35 * touch * (1 + .3 * Math.sin(lt * 4))); glow('mid', 392, 878, 18, COL.w, .3 * touch); }
  return { cam };
}
// ================= финал: последний удар-сердце → горизонт → рассвет =================
function shotEnd(v, t) {
  const cam = camAt(v, [[0, 552, 378, 3.25], [3.2, 552, 378, 3.32, ease.o], [5.8, 1300, 300, 1.0, ease.io], [13.4, 1330, 290, 1.04, ease.o]]);
  E.setCam(cam);
  const roomA = 1 - k01(v, 3.6, 5.0);
  if (roomA > 0) { E.setGA(roomA); room(t, null, 1, 1, 1); draw(S(ART.monitor), 0, 1, { col: COL.g, al: .75, head: 0 }); E.setGA(1); }
  // развёртка с последним ударом
  const hx = X0 + 75 * Math.min(v, 2.9), hY = BASE;
  const HB0 = 506, HBW = 70;
  const tr = [];
  for (let x = X0; x <= hx; x += 1.2) {
    let y = BASE;
    const u = (x - 466) / 30; if (u > 0 && u < 1) y -= 8 * Math.sin(u * Math.PI);        // P
    const w = (x - 612) / 34; if (w > 0 && w < 1) y -= 14 * Math.sin(w * Math.PI);       // T
    tr.push(x, y);
  }
  // сердце рисуется головой развёртки
  const hk = k01(hx, HB0, HB0 + HBW);
  const heartPts = F('heartPts', () => { const h = ART.heart(HB0 + HBW / 2, BASE - 52, 2.6); const o = [HB0, BASE]; return [HB0, BASE, ...h.slice(0), HB0 + HBW, BASE]; });
  let shape;
  const hs = fromStrokes([heartPts], 1.4);
  const left = tr.filter((v2, i) => i % 2 ? true : true);
  // ломаная: до сердца, сердце, после
  const pre = [], post = [];
  for (let i = 0; i < tr.length; i += 2) { if (tr[i] < HB0) pre.push(tr[i], tr[i + 1]); else if (tr[i] > HB0 + HBW) post.push(tr[i], tr[i + 1]); }
  const pulse = 1 + .6 * Math.exp(-(((v - 1.25) / .25) ** 2));
  if (pre.length > 2) draw(fromStrokes([pre], 1.4), 0, 1, { col: COL.g, al: 1, head: hk <= 0 ? 1.2 : 0, fresh: 50 });
  if (hk > 0) draw(hs, 0, Math.min(1, hk), { col: hk < 1 ? COL.g : COL.a, al: pulse, head: hk < 1 ? 1.4 : 0, fresh: 90, w: 2.6, hot: .15 });
  if (hk >= 1 && post.length > 2) draw(fromStrokes([[HB0 + HBW, BASE, ...post]], 1.4), 0, 1, { col: COL.g, al: 1, head: v < 2.9 ? 1.2 : 0, fresh: 50 });
  if (hk >= 1) glow('mid', HB0 + HBW / 2, BASE - 40, 60, COL.a, .25 * Math.exp(-(((v - 1.35) / .5) ** 2)));
  // старая развёртка справа
  if (hx + 14 < 656) draw(fromStrokes([[hx + 14, BASE, 656, BASE]], 2), 0, 1, { col: COL.g, al: .45, head: 0, fresh: 0 });
  // линия вырывается из монитора и становится горизонтом
  const ext = ease.io(k01(v, 3.0, 5.6));
  if (ext > 0) draw(fromStrokes([[656, BASE, 656 + 2600 * ext, BASE]], 3), 0, 1, { col: COL.g, al: 1, head: ext < 1 ? 1.3 : 0, fresh: 80, wob: .3 });
  if (ext > 0) draw(fromStrokes([[X0, BASE, 300 - 1200 * ext, BASE]], 3), 0, 1, { col: COL.g, al: ext, head: 0, fresh: 0, wob: .3 });
  // рассвет
  const sunK = ease.o(k01(v, 5.2, 12.5)), SX = 1330, sy = lerp(BASE + 60, BASE - 230, sunK), sr = 92;
  if (v > 5.0) {
    const dr = ease.io(k01(v, 5.2, 6.6));
    const sun = []; for (let i = 0; i <= 100; i++) { const a = Math.PI / 2 + i / 100 * Math.PI * 2; const y = sy + Math.sin(a) * sr; sun.push(SX + Math.cos(a) * sr, Math.min(y, BASE - 2)); }
    draw(fromStrokes([sun], 2), 0, dr, { col: COL.a, al: 1, head: dr < 1 ? 1.4 : 0, fresh: 80, w: 2.8, hot: .2 });
    glow('bg', SX, sy, 300, COL.a, .22 * dr);
    glow('mid', SX, sy, sr * 1.2, COL.a, .18 * dr);
    // лучи
    for (let j = 0; j < 12; j++) { const a = j / 12 * Math.PI * 2 + v * .08, r0 = sr + 22, r1 = sr + 44 + 10 * Math.sin(v * 2 + j);
      const x0 = SX + Math.cos(a) * r0, y0 = sy + Math.sin(a) * r0, x1 = SX + Math.cos(a) * r1, y1 = sy + Math.sin(a) * r1;
      if (Math.max(y0, y1) < BASE - 4) line([x0, y0, x1, y1], { col: COL.a, al: .7 * k01(v, 6.4, 7.4), head: 0, fresh: 0, w: 2 }); }
    // отражение
    for (let j = 0; j < 14; j++) { const y = BASE + 18 + j * 15, wd = (sr * 1.3 - j * 5) * (.8 + .2 * Math.sin(v * 3 + j * 1.7)) * dr, ox = Math.sin(v * 1.6 + j) * 8;
      if (wd > 4) line([SX - wd + ox, y, SX + wd + ox, y], { col: COL.a, al: (.75 - j * .045) * dr, head: 0, fresh: 0, w: 2.2, wob: .4 }); }
    // птицы
    for (let j = 0; j < 3; j++) { const k = k01(v, 7.2 + j * .5, 13.5), bx = lerp(1050 + j * 40, 1640, k), by = BASE - 300 + j * 26 + Math.sin(k * 8 + j) * 10, fl = Math.sin(v * 9 + j * 2) * 6;
      if (k > 0 && k < 1) line([bx - 14, by - 4 + fl, bx - 6, by - 1, bx, by + 3, bx + 6, by - 1, bx + 14, by - 4 + fl], { col: COL.g, al: .8, head: 0, fresh: 0, w: 1.8 }); }
  }
  // финальная надпись
  const wk = ease.io(k01(v, 8.4, 10.0));
  if (wk > 0) draw(F('say', () => shift(textShape('say it today.', 'scripts', 66), 1330, -50)), 0, wk, { col: COL.g, al: 1, head: wk < 1 ? 1.3 : 0, fresh: 90, w: 2.4, hot: .2 });
  return { cam, fade: k01(v, 12.6, 13.4) };
}
window.SHOTS.push([9.3 + OFF, MEND, shotMem], [MEND, MEND + 11, shotRoom2], [MEND + 11, MEND + 24.4, shotEnd]);
window.DURATION = MEND + 24.4;
window.TL = { OFF, M0, MEND, BEATS: BEATS.map(b => [b[3], b[0], b[1]]) };
})();
