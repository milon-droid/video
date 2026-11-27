// Серия 2: монтаж и реплики — общий модуль для картинки (ep2.js) и звука (audio/ep2/*.py через node).
// Реплика: [id, план, время в плане]. Реальные длительности — ep2-durs.json (из wav); наложения раздвигаются.
// часть: main (основная, без клиффхэнгера) или вариант концовки A/B/C (window.EP2_PART)
const PARTS = {
  main: [['H', 4.4], ['FB', 4.0], ['S2', 5.2], ['S2B', 6.6], ['CAT', 4.3], ['S4', 4.6], ['SS', 5.6], ['S1', 5.6], ['S5', 4.4], ['S6', 4.8], ['S7', 5.4], ['S8', 4.2], ['S9', 5.5], ['S10', 6.0], ['S10B', 9.4], ['S11', 10.5], ['S12', 7.0]],
  A: [['XA', 8.0], ['CA', 3.6]], B: [['XB', 8.0], ['CB', 3.6]], C: [['XC', 8.0], ['CC', 3.6]],
};
const PART = (typeof window !== 'undefined' && window.EP2_PART) || (typeof process !== 'undefined' && process.env.EP2_PART) || 'main';
export const SHOTS = PARTS[PART];
export const CUES = [
  ['h1', 'H', .4],
  ['fb1', 'FB', .3], ['fb2', 'FB', 1.9],
  ['b12', 'S2', 1.0], ['b11', 'S2', 3.0],
  ['b13', 'S2B', .2], ['b16', 'S2B', 2.4], ['b15', 'S2B', 4.2],
  ['ct2', 'CAT', 2.6],
  ['d5', 'S4', .4],
  ['s5', 'SS', .8], ['s6', 'SS', 3.6], ['s8', 'SS', 4.5],
  ['s4', 'S1', .4], ['p3', 'S1', 2.0], ['p2', 'S1', 3.5],
  ['e1', 'S5', .8], ['e5', 'S5', 2.6],
  ['f1', 'S6', 1.2], ['f2', 'S6', 3.2],
  ['g1', 'S7', .3], ['g2', 'S7', 1.6], ['g3', 'S7', 3.3],
  ['i1', 'S9', .2], ['i2', 'S9', 1.7], ['i3', 'S9', 4.1],
  ['j3', 'S10', .3], ['j4', 'S10', 1.1], ['j5', 'S10', 2.0], ['j6', 'S10', 3.8],
  ['k7', 'S10B', 6.9],
  ['k6', 'S11', 2.2], ['k8', 'S11', 5.6],
  ['l3', 'S12', .6], ['l2', 'S12', 4.2],
  ['x1', 'XA', 1.2], ['x2', 'XA', 4.6], ['x3', 'XA', 6.4],
  ['y1', 'XB', .8], ['y2', 'XB', 4.0], ['y3', 'XB', 6.2],
  ['z1', 'XC', 1.0], ['z2', 'XC', 3.4], ['z3', 'XC', 6.2],
];
// монтаж под реальные длительности: реплики не накладываются (зазор .12 с), план удлиняется,
// если последняя реплика не успевает закончиться за TAIL с до склейки
const TAIL = { S1: .2, H: .5, SS: .5, S9: 1.7, S10: .4, S10B: 2.0, S11: 1.2, S12: 1.0, S4: .5 };
export function build(durs) { const AT = {}, starts = {}, shots = []; let acc = 0, end = 0;
  for (const [id, base] of SHOTS) { starts[id] = acc; let last = 0;
    for (const [cid, sh, t] of CUES) if (sh === id && SHOTS.some(x => x[0] === sh)) { const t0 = Math.max(acc + t, end + .06); AT[cid] = t0; end = t0 + (durs[cid] ?? 1.2); last = end; }
    const d = Math.max(base, last ? last - acc + (TAIL[id] ?? .45) : 0); shots.push([id, +d.toFixed(3)]); acc += d; }
  return { AT, starts, TOTAL: acc, shots }; }
