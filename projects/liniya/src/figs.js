// ЛИНИЯ — процедурные фигуры одной линией: люди с суставами, велосипед, рука, дом, дерево, скамейка
window.FIG = (() => {
const { clamp, lerp } = E;
// Катмулл-Ром через точки [x,y,...] → гладкая ломаная
function crv(p, n = 8) {
  const o = []; const N = p.length / 2; if (N < 3) return p.slice();
  const P = i => { i = Math.max(0, Math.min(N - 1, i)); return [p[i * 2], p[i * 2 + 1]]; };
  for (let i = 0; i < N - 1; i++) { const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    for (let k = 0; k < n; k++) { const t = k / n, t2 = t * t, t3 = t2 * t;
      o.push(.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        .5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)); } }
  o.push(p[p.length - 2], p[p.length - 1]); return o;
}
const circ = (cx, cy, rx, ry = rx, a0 = 0, a1 = Math.PI * 2, n = 40) => { const o = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; o.push(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry); } return o; };
// двухзвенная ИК: от A к цели B, длины l1,l2, сгиб в сторону bend (+1/-1)
function ik(ax, ay, bx, by, l1, l2, bend) {
  let dx = bx - ax, dy = by - ay, d = Math.hypot(dx, dy); const dm = Math.min(d, l1 + l2 - .01); if (d > dm) { bx = ax + dx / d * dm; by = ay + dy / d * dm; d = dm; }
  const a = Math.atan2(by - ay, bx - ax), c = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1), th = a - bend * Math.acos(c);
  return [ax + Math.cos(th) * l1, ay + Math.sin(th) * l1, bx, by];
}
// ---- человек. x,y — точка между ступнями (земля), h — рост, dir 1 вправо/-1 влево
// P: lean, hd (наклон головы), legL/legR [бедро, колено] углы от вертикали вниз (+ вперёд), armL/armR [плечо, локоть],
//    hipY (подъём таза, для сидения), fem, old, cap, kid, feet (явные цели ступней), hands (явные цели кистей), eye (0 закрыт..1)
function person(x, y, h, dir, P = {}) {
  const S = [];
  const L1 = .25 * h, L2 = .25 * h, TOR = .31 * h, U1 = .17 * h, U2 = .16 * h, HR = (P.kid ? .1 : .075) * h;
  const fx = v => v * dir;
  const hip = P.hipAt ? P.hipAt.slice() : [x + fx(P.hipX || 0), y - (L1 + L2) * (P.hipK == null ? 1 : P.hipK) - (P.hipY || 0)];
  const lean = (P.lean || 0) + (P.old ? .18 : 0);
  const neck = [hip[0] + fx(Math.sin(lean) * TOR), hip[1] - Math.cos(lean) * TOR];
  const seg = (p, a, l) => [p[0] + fx(Math.sin(a) * l), p[1] + Math.cos(a) * l];
  const limb = (base, ang, l1, l2, tgt, bend) => {
    if (tgt) { const r = ik(base[0], base[1], tgt[0], tgt[1], l1, l2, bend * dir); return [base[0], base[1], r[0], r[1], r[2], r[3]]; }
    const k = seg(base, ang[0], l1), f = seg(k, ang[0] + ang[1], l2); return [base[0], base[1], k[0], k[1], f[0], f[1]];
  };
  // ноги
  const lL = limb(hip, P.legL || [0, 0], L1, L2, P.feet && P.feet[0], -1), lR = limb([hip[0] + fx(3), hip[1]], P.legR || [0, 0], L1, L2, P.feet && P.feet[1], -1);
  if (P.fem) { // платье: от талии к колену, ноги ниже колена
    const wy = hip[1] - .1 * h, kL = [lL[2], lL[3]], kR = [lR[2], lR[3]], hem = Math.max(kL[1], kR[1]) + .02 * h;
    const spread = .11 * h + Math.abs(kL[0] - kR[0]) * .4;
    const cx = (kL[0] + kR[0]) / 2;
    S.push(crv([neck[0] - fx(.065 * h), neck[1] + .035 * h, lerp(neck[0], hip[0], .5) - fx(.045 * h), lerp(neck[1], wy, .6), hip[0] - fx(.05 * h), wy, cx - spread * .8, lerp(wy, hem, .55), cx - spread, hem], 6).concat([cx + spread, hem], crv([cx + spread, hem, cx + spread * .8, lerp(wy, hem, .55), hip[0] + fx(.05 * h), wy, lerp(neck[0], hip[0], .5) + fx(.045 * h), lerp(neck[1], wy, .6), neck[0] + fx(.065 * h), neck[1] + .035 * h], 6), [neck[0] - fx(.065 * h), neck[1] + .035 * h]));
    S.push([lL[2], hem, lL[4], lL[5], lL[4] + fx(.05 * h), lL[5]]);
    S.push([lR[2], hem, lR[4], lR[5], lR[4] + fx(.05 * h), lR[5]]);
  } else {
    S.push(crv([lL[4] + fx(.055 * h), lL[5], lL[4], lL[5], lL[2], lL[3], hip[0], hip[1], lR[2], lR[3], lR[4], lR[5]], 6).concat([lR[4] + fx(.055 * h), lR[5]]));
    // корпус: пиджак контуром
    const bk = P.old ? .05 * h : 0, mid = [lerp(hip[0], neck[0], .5) - fx(bk), lerp(hip[1], neck[1], .5)];
    S.push(crv([hip[0] - fx(.05 * h), hip[1], mid[0] - fx(.06 * h), mid[1], neck[0] - fx(.055 * h), neck[1] + .02 * h, neck[0] + fx(.04 * h), neck[1] + .03 * h, mid[0] + fx(.055 * h), mid[1], hip[0] + fx(.05 * h), hip[1]], 6));
  }
  // руки
  const sh = [neck[0], neck[1] + .04 * h];
  const aL = limb(sh, P.armL || [.1, -.2], U1, U2, P.hands && P.hands[0], 1), aR = limb([sh[0] + fx(2), sh[1]], P.armR || [-.1, -.2], U1, U2, P.hands && P.hands[1], 1);
  S.push(crv([aL[4], aL[5], aL[2], aL[3], aL[0], aL[1]], 6));
  S.push(crv([aR[0], aR[1], aR[2], aR[3], aR[4], aR[5]], 6));
  // голова
  const ha = lean * .5 + (P.hd || 0), hc = [neck[0] + fx(Math.sin(ha) * HR * 1.15), neck[1] - Math.cos(ha) * HR * 1.15];
  const head = [];
  for (let i = 0; i <= 44; i++) { const a = -Math.PI / 2 + i / 44 * Math.PI * 2; let r = HR;
    const fa = Math.atan2(Math.sin(a), Math.cos(a) * dir); // угол в системе «лицом вправо»
    if (fa > -.25 && fa < .35) r += HR * .16 * Math.exp(-(((fa - .05) / .12) ** 2)); // нос
    head.push(hc[0] + Math.cos(a) * r * 1, hc[1] + Math.sin(a) * r * 1.08); }
  S.push(head);
  const e = P.eye == null ? 1 : P.eye, ex = hc[0] + fx(HR * .45), ey = hc[1] - HR * .12;
  S.push(e > .5 ? circ(ex, ey, HR * .07, HR * .09, 0, Math.PI * 2, 8) : [ex - HR * .14, ey, ex, ey + HR * .07, ex + HR * .14, ey]);
  if (P.smile) S.push(crv([hc[0] + fx(HR * .25), hc[1] + HR * .45, hc[0] + fx(HR * .45), hc[1] + HR * .52, hc[0] + fx(HR * .62), hc[1] + HR * .4], 4));
  if (P.fem) { S.push(circ(hc[0] - fx(HR * .85), hc[1] - HR * .7, HR * .42, HR * .38, 0, Math.PI * 2, 18));
    S.push(crv([hc[0] + fx(HR * .5), hc[1] - HR * .85, hc[0] - fx(HR * .3), hc[1] - HR * 1.0, hc[0] - fx(HR * .95), hc[1] - HR * .2, hc[0] - fx(HR * .75), hc[1] + HR * .5], 5)); }
  if (P.cap) S.push([hc[0] - fx(HR * 1.02), hc[1] - HR * .25, ...crv([hc[0] - fx(HR * .9), hc[1] - HR * .6, hc[0], hc[1] - HR * 1.12, hc[0] + fx(HR * .85), hc[1] - HR * .55], 5), hc[0] + fx(HR * 1.55), hc[1] - HR * .4]);
  if (P.old && !P.fem) S.push(crv([hc[0] - fx(HR * .2), hc[1] - HR * 1.04, hc[0] - fx(HR * .7), hc[1] - HR * .8, hc[0] - fx(HR * 1.0), hc[1] - HR * .1], 4));
  return { S, hand: [[aL[4], aL[5]], [aR[4], aR[5]]], head: hc, hip, neck, HR };
}
// ---- велосипед; x — каретка, y — земля, r — колесо, th — угол педалей
function bike(x, y, r, th, wa) {
  const S = [], hy = y - r, rh = [x - r * 1.5, hy], fh = [x + r * 1.6, hy], seat = [x - r * .35, y - r * 2.55], top = [x + r * 1.15, y - r * 2.6];
  for (const c of [rh, fh]) { S.push(circ(c[0], c[1], r, r, 0, Math.PI * 2, 48)); S.push(circ(c[0], c[1], r * .12, r * .12, 0, Math.PI * 2, 10));
    for (let k = 0; k < 6; k++) { const a = wa + k * Math.PI / 3; S.push([c[0] + Math.cos(a) * r * .12, c[1] + Math.sin(a) * r * .12, c[0] + Math.cos(a) * r * .96, c[1] + Math.sin(a) * r * .96]); } }
  S.push([rh[0], rh[1], seat[0], seat[1], x, hy, rh[0], rh[1]]);
  S.push([seat[0], seat[1], top[0], top[1], x, hy]);
  S.push([top[0], top[1], fh[0], fh[1]]);
  S.push([top[0], top[1], top[0] - r * .1, top[1] - r * .35, top[0] + r * .35, top[1] - r * .45]);
  S.push([seat[0] - r * .3, seat[1] - r * .08, seat[0] + r * .3, seat[1] - r * .08]);
  const p1 = [x + Math.cos(th) * r * .38, hy + Math.sin(th) * r * .38], p2 = [x - Math.cos(th) * r * .38, hy - Math.sin(th) * r * .38];
  S.push([p1[0], p1[1], p2[0], p2[1]]);
  return { S, seat: [seat[0], seat[1] - r * .1], bar: [top[0] + r * .3, top[1] - r * .45], ped: [p1, p2] };
}
// ---- рука контуром (смотрит вправо при dir=1). x,y — запястье; s — масштаб; open — пальцы 0 сжаты..1 раскрыты; up — поворот
function hand(x, y, s, dir, rot = 0, curl = 0) {
  const pts = []; const cs = Math.cos(rot), sn = Math.sin(rot);
  const P = (u, v) => { const X = u * dir, Y = v; pts.push(x + (X * cs - Y * sn) * s, y + (X * sn + Y * cs) * s); };
  // запястье снизу → ладонь → пальцы (мизинец…указательный) → большой → запястье сверху
  P(0, 14); P(22, 18); P(44, 16);
  const fingers = [[44, 12, 22, .28], [48, 4, 30, .1], [50, -5, 34, 0], [48, -14, 31, -.08]];
  for (const [bx, by, len, ang] of fingers) {
    const a = ang - curl * .9, L = len * (1 - curl * .45), w = 3.6;
    const tx = bx + Math.cos(a) * L, ty = by + Math.sin(a) * L, nx = -Math.sin(a) * w, ny = Math.cos(a) * w;
    P(bx + nx, by + ny); P(tx + nx, ty + ny);
    for (let k = 1; k < 6; k++) { const q = Math.PI / 2 - k / 6 * Math.PI; P(tx + Math.cos(a + q) * w * 1.0 - 0, ty + Math.sin(a + q) * w); }
    P(tx - nx, ty - ny); P(bx - nx + 1, by - ny);
  }
  P(40, -20); P(30, -22); P(36, -36); P(42, -44); P(38, -48); P(30, -40); P(18, -26); P(0, -16);
  return pts;
}
function house(x, y, s) {
  const p = (a) => a.map((v, i) => i % 2 ? y + v * s : x + v * s);
  return [p([-150, 0, -110, 0, -110, -150, 0, -240, 110, -150, 110, 0, -30, 0, -30, -80, 20, -80, 20, 0, 150, 0]),
    p([60, -192, 60, -240, 84, -240, 84, -172]),
    p([40, -120, 85, -120, 85, -80, 40, -80, 40, -120]), p([62.5, -120, 62.5, -80]), p([40, -100, 85, -100])];
}
function tree(x, y, s, sway = 0) {
  const t = (u, v) => [x + u * s + sway * (-v / 260) * s, y + v * s];
  const S = [];
  S.push([...t(-8, 0), ...t(-6, -90), ...t(-30, -150), ...t(-6, -96), ...t(-2, -130), ...t(4, -96), ...t(34, -160), ...t(8, -92), ...t(8, 0)]);
  const c = []; const cx = 0, cy = -190;
  for (let i = 0; i <= 120; i++) { const a = i / 120 * Math.PI * 2, r = 92 + 12 * Math.sin(a * 7) + 6 * Math.sin(a * 3); c.push(...t(cx + Math.cos(a) * r * 1.15, cy + Math.sin(a) * r * .85)); }
  S.push(c); return S;
}
function bench(x, y, s) {
  const p = a => a.map((v, i) => i % 2 ? y + v * s : x + v * s);
  return [p([-120, 0, -112, -46, 112, -46, 120, 0]), p([-130, -46, 130, -46]), p([-120, -54, 120, -54]), p([-112, -54, -112, -110, 112, -110, 112, -54]), p([-112, -84, 112, -84])];
}
return { crv, circ, ik, person, bike, hand, house, tree, bench };
})();
