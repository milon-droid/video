// Перекладные персонажи из картинок пользователя (projects/ne-ochen/assets/chars, нарезка — projects/ne-ochen/cut.py).
// Внешность — пиксель в пиксель из PNG; двигаются части: голова, плечо, предплечье с кистью, бедро, голень со стопой.
// API совпадает с Baller/Sadie (поза в тех же углах: от вертикали вниз, плюс — к +x экрана), плюс:
//   walk — шаг/бег без скольжения (опорная стопа стоит на газоне, колено вперёд по ходу), face — мимика поверх картинки.
import React, { useContext, useEffect, useState } from 'react';
import { LAG, LifeCtx } from './life';
import { continueRender, delayRender, staticFile } from 'remotion';
import { clamp, noise } from '../anim';
import { POSES, Pose } from '../chars/Person';
import { Bouquet, Phone } from '../stars/Stars';
import DATA from './cutData.json';

type FaceD = { brows: { c: number[]; w: number }[]; eyes: { hull: number[][]; c: number[]; r: number; e: number[] }[]; mouth?: { c: number[]; hw: number; ry: number; line: number } };
type CD = { face?: FaceD; W: number; H: number; top: number; foot: number; cx: number; parts: Record<string, number[]>; piv: Record<string, number[]>; eyes: number[][]; skin: string; knee: string };
const D = DATA as unknown as Record<CutId, CD>;
export type CutId = 'vini-kit' | 'vini-home' | 'diom-kit' | 'diom-track' | 'sadie-vip' | 'sadie-jkt' | 'tom' | 'coach';
export const UNIT = .475; // пиксель картинки → единица сцены (рост ≈ 750 ед., как у Baller)
export const CUT_IDS = Object.keys(DATA) as CutId[];

// лицо (пиксели исходника): рот [x, y, полуширина], брови, глаза тренера (у него белки мелкие — вручную)
const FACE: Record<CutId, { m: [number, number, number]; br: [number, number][]; eyes?: number[][]; brow: string }> = {
  'vini-kit': { m: [475, 497, 80], br: [[395, 318], [560, 315]], brow: '#1c1210' },
  'vini-home': { m: [475, 497, 80], br: [[392, 320], [560, 315]], brow: '#1c1210' },
  'diom-kit': { m: [475, 415, 52], br: [[400, 275], [545, 270]], brow: '#120c0a' },
  'diom-track': { m: [473, 413, 52], br: [[400, 273], [545, 268]], brow: '#120c0a' },
  'sadie-vip': { m: [470, 505, 52], br: [[392, 325], [543, 322]], brow: '#9a4a2e' },
  'sadie-jkt': { m: [470, 505, 52], br: [[392, 325], [543, 322]], brow: '#9a4a2e' },
  'tom': { m: [470, 517, 54], br: [[385, 342], [550, 340]], brow: '#2a1a12' },
  'coach': { m: [462, 472, 56], br: [[400, 310], [530, 310]], eyes: [[396, 337, 34, 15], [530, 337, 34, 15]], brow: '#4a3a30' },
};

// ── предзагрузка всех частей: кадр не рендерится, пока картинки не декодированы
const ALL = [...CUT_IDS.flatMap(id => Object.keys(D[id].parts).map(k => staticFile(`ne-cut/${id}/${k}.png`))), staticFile('ne-cut/tom/gestR.png')];
// Все части держим в DOM с первого кадра (невидимо, 2×2 px): SVG <image> грузится асинхронно, и без этого
// первый кадр, где персонаж появляется впервые, мог выйти без него. Кадр ждёт onLoad всех картинок.
export const CutPreloader: React.FC = () => {
  const [h] = useState(() => delayRender('ne-cut images'));
  const left = React.useRef(ALL.length), done = React.useRef(false);
  const fin = () => { left.current -= 1; if (left.current <= 0 && !done.current) { done.current = true; continueRender(h); } };
  useEffect(() => { const tmo = setTimeout(() => { if (!done.current) { done.current = true; continueRender(h); } }, 25000); return () => clearTimeout(tmo); }, [h]);
  return <svg width={2} height={2} style={{ position: 'absolute', left: 0, top: 0, opacity: .004, pointerEvents: 'none' }}>
    {ALL.map(src => <image key={src} href={src} width={2} height={2} onLoad={fin} onError={fin} />)}</svg>;
};
export const useCutPreload = () => {};

// ── 2D-аффинные матрицы [a b c d e f] (как SVG matrix)
type M = [number, number, number, number, number, number];
const I: M = [1, 0, 0, 1, 0, 0];
const mul = (m: M, n: M): M => [m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1], m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3], m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5]];
const tr = (x: number, y: number): M => [1, 0, 0, 1, x, y];
// поворот в смысле поз Baller: Δ>0 переводит «вниз» к +x (визуально против часовой)
const rotB = (d: number, cx = 0, cy = 0): M => { const c = Math.cos(d), s = Math.sin(d); return mul(tr(cx, cy), mul([c, -s, s, c, 0, 0], tr(-cx, -cy))); };
const sc = (sx: number, sy: number, cx = 0, cy = 0): M => mul(tr(cx, cy), mul([sx, 0, 0, sy, 0, 0], tr(-cx, -cy)));
const ap = (m: M, p: number[]): [number, number] => [m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5]];
const ms = (m: M) => `matrix(${m.map(v => +v.toFixed(4)).join(' ')})`;
const ang = (a: number[], b: number[]) => Math.atan2(b[0] - a[0], b[1] - a[1]);
const dist = (a: number[], b: number[]) => Math.hypot(b[0] - a[0], b[1] - a[1]);

// ── походка (вид спереди, движение вбок): стопа в опоре стоит на месте, пока таз проходит над ней (без скольжения);
// в переносе колено поднимается к камере (бедро укорачивается по вертикали) и чуть уходит по ходу движения; стопы не перекрещиваются.
export type Walk = { d: number; dir?: 1 | -1; run?: boolean; stride?: number };
export const gait = (id: CutId, w: Walk) => {
  const P = D[id].piv, dir = w.dir ?? 1, run = !!w.run;
  const Lth = (dist(P.PL, P.KL) + dist(P.PR, P.KR)) / 2, Lsh = (dist(P.KL, P.AL) + dist(P.KR, P.AR)) / 2, L = Lth + Lsh;
  const half = Math.abs(P.PR[0] - P.PL[0]) / 2;                 // полуширина таза: вынос стопы меньше — стопы не сталкиваются
  const beta = run ? .4 : .6;                                   // доля опоры в цикле
  const a = half * (w.stride ?? (run ? .62 : .5));              // вынос стопы от бедра
  const cyc = 2 * a / beta;                                     // путь за цикл (два шага), px картинки
  const u = (w.d / UNIT) / cyc;
  const legs: Record<'L' | 'R', { x: number; lift: number; stance: boolean; ph: number }> = {} as any;
  (['L', 'R'] as const).forEach((side, i) => {
    const ph = ((u + (i ? .5 : 0)) % 1 + 1) % 1;
    if (ph < beta) { const k = ph / beta; legs[side] = { x: (a - 2 * a * k) * dir, lift: 0, stance: true, ph }; }
    else { const k = (ph - beta) / (1 - beta), e = k * k * (3 - 2 * k); legs[side] = { x: (-a + 2 * a * e) * dir, lift: Math.sin(Math.PI * k), stance: false, ph }; }
  });
  const s2 = Math.abs(Math.sin(u * Math.PI * 2));
  const bob = run ? -s2 * L * .05 : s2 * L * .02;              // бег: таз выше в полёте; шаг: ниже в двойной опоре
  const sw = Math.sin(u * Math.PI * 2);
  return {
    legs, L, Lth, Lsh, bob, run, dir, a, cyc, u,
    armL: [-.2 - sw * .22, run ? .5 + sw * .2 : .15] as [number, number],
    armR: [.2 - sw * .22, run ? -.5 + sw * .2 : -.15] as [number, number],
    lean: dir * (run ? .07 : .03),
  };
};
// положение стопы относительно x фигуры (ед. сцены): для мяча
export const footX = (id: CutId, w: Walk, side: 'L' | 'R', s = 1) => { const g = gait(id, w), f = g.legs[side];
  return { x: (f.x + D[id].piv['A' + side][0] - D[id].cx) * UNIT * s, lift: f.lift * g.L * .22 * UNIT * s, stance: f.stance, ph: f.ph }; };

// ведение мяча: касание ведущей (по ходу) стопой в момент её постановки → мяч катится вперёд, замедляясь, к следующему касанию.
// Возвращает смещение мяча от x фигуры (ед. сцены), поворот и признак касания (несколько кадров после постановки стопы).
export const dribble = (id: CutId, w: Walk, s: number, r: number, toe = 40) => {
  const g = gait(id, w), dir = g.dir, P = D[id].piv, lead = dir > 0 ? 'R' : 'L', offs = dir > 0 ? .5 : 0;
  const cycW = g.cyc * UNIT * s, n = Math.floor(g.u - offs), tau = g.u - offs - n;
  const land = (g.a * dir + P['A' + lead][0] - D[id].cx) * UNIT * s;
  const dx = (n + offs - g.u) * cycW * dir + land + dir * (toe * s + r) + dir * cycW * (1.6 * tau - .6 * tau * tau);
  return { dx, rot: (w.d * s) / r * 57.3 * dir, contact: tau < .12, cycW };
};

export type Face = 'o' | 'flat' | 'frown' | 'cry' | null;
export type CutProps = {
  id: CutId; x: number; y: number; s?: number; t: number; pose?: Partial<Pose>; flip?: boolean; rot?: number; shadow?: number;
  headTilt?: number; mouth?: number; hearts?: number; tears?: number; face?: Face; cry?: number; sit?: boolean; seat?: number;
  hold?: 'phone' | 'flowers' | null; walk?: Walk; lid?: number; blush?: number; opacity?: number; noBlink?: boolean;
  armRBack?: boolean; slump?: number; // правая рука (с предметом) за корпусом; плечи опущены (0…1)
  squash?: number; raw?: boolean;   // сжатие по вертикали (замах перед прыжком, приземление); raw — без сглаживания поз (точные броски)
  expr?: string; eye?: [number, number]; teeth?: boolean; oMouth?: boolean; emo?: Partial<Emo>; prev?: CutProps[];
  gest?: number; web?: number; webLen?: number; // Том: кисть «паутинный жест» (1 — пальцы сложены) и нить (0…1 — вытягивается)
};

const part = (id: CutId, k: string, m: M) => { const [x, y, w, h] = D[id].parts[k]; return <image key={k} href={staticFile(`ne-cut/${id}/${k}.png`)} x={x} y={y} width={w} height={h} transform={ms(m)} />; };

// ── мимика: брови (угол «внутренний край вверх», подъём), рот (улыбка −1…1, открытие, ширина, зубы), веки
export type Emo = { brow: number; by: number; bL: number; bR: number; smile: number; open: number; w: number; lidT: number; lidB: number; teeth: number };
const E0: Emo = { brow: NaN, by: 0, bL: 0, bR: 0, smile: 0, open: 0, w: 1, lidT: 0, lidB: 0, teeth: 0 };
const EXPR: Record<string, Partial<Emo>> = {
  neutral: {}, determined: {},
  happy: { brow: 4, by: 12, smile: 1, open: .42, lidB: .3, teeth: 1 },
  love: { brow: 8, by: 14, smile: 1, open: .3, lidB: .2, teeth: 1 },
  smug: { brow: 0, by: 2, bR: 16, smile: .8, lidT: .13 },
  cool: { brow: 0, smile: .5, lidT: .1 },
  sad: { brow: 20, by: 2, smile: -.9, lidT: .2 },
  shock: { brow: 8, by: 26, smile: -.15, open: .85, w: .62 },
  scared: { brow: 16, by: 22, smile: -.3, open: .8, w: .62 },
  pain: { brow: 18, smile: -.6, open: .4, lidT: .5 }, ko: { brow: 18, smile: -.6, open: .4, lidT: .8 },
  deadpan: { brow: 0, by: -6, smile: -.25, lidT: .24 },
  cry: { brow: 24, by: 2, smile: -1, open: .22, lidT: .25 },
};
const BROW0: Partial<Record<CutId, number>> = { 'vini-kit': -16, 'vini-home': -16 };   // брови на рисунке: у Вини — сдвинуты (сердитые)
const emoOf = (p: CutProps): Emo => {
  const name = p.face === 'cry' ? 'cry' : (p.hearts ?? 0) > .3 ? 'love' : p.oMouth || p.face === 'o' ? 'shock' : p.expr && EXPR[p.expr] ? p.expr : p.face === 'flat' ? 'deadpan' : p.face === 'frown' ? 'sad' : 'neutral';
  let e = { ...E0, ...EXPR[name], ...(p.emo || {}) } as Emo;
  if (name === 'cry') { const k = p.cry ?? 1, sd = { ...E0, ...EXPR.sad } as Emo; (Object.keys(e) as (keyof Emo)[]).forEach(q => { if (q !== 'brow') e[q] = sd[q] + (e[q] - sd[q]) * k; }); }
  if (p.teeth) { e.teeth = 1; e.open = Math.max(e.open, .4); e.smile = Math.max(e.smile, .8); }
  e.open = Math.min(1, e.open + clamp(p.mouth ?? 0) * .7);
  e.lidT = Math.max(e.lidT, p.lid ?? 0);
  e.brow = Number.isNaN(e.brow) ? 0 : e.brow - (BROW0[p.id] ?? 0);          // поворот от нарисованного положения
  return e;
};
const emoMix = (p: CutProps): Emo => { const a = emoOf(p), pv = (p.prev ?? []).map(emoOf); if (!pv.length) return a;
  const w = pv.length > 1 ? [.45, .3, .25] : [.6, .4], all = [a, ...pv], o = { ...a };
  (Object.keys(a) as (keyof Emo)[]).forEach(q => { o[q] = all.reduce((acc, e, i) => acc + e[q] * w[i], 0); }); return o; };
const poseOf = (p: CutProps) => { const g = p.walk ? gait(p.id, p.walk) : null;
  return { ...POSES.stand, ...(g ? { armL: g.armL, armR: g.armR, lean: g.lean } : {}), ...(p.pose || {}) } as Pose; };

// лицо из частей рисунка: белок по контуру, радужка-спрайт (взгляд), веки, брови-спрайты, рот — полосками (изгиб, открытие)
const faceNew = (id: CutId, d0: CD, em: Emo, look: number[], bc: number, fid: string) => { const FX = d0.face!, skin = d0.skin, out: React.ReactNode[] = [];
  FX.eyes.forEach((E, i) => { const [ex, ey, , ry] = E.e, ib = d0.parts['iris' + 'LR'[i]];
    const xs = E.hull.map(q => q[0]), ys = E.hull.map(q => q[1]), x0 = Math.min(...xs) - 14, x1 = Math.max(...xs) + 14, y0 = Math.min(...ys) - 14, y1 = Math.max(...ys) + 14, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    const ox = clamp(look[0], -1, 1) * Math.max((x1 - x0) / 2 - 14 - E.r, 9) * .9, oy = clamp(look[1], -1, 1) * Math.max((y1 - y0) / 2 - 14 - E.r, 7);
    const H = y1 - y0, lt = Math.max(bc, em.lidT), yl = y0 + 6 + (H - 12) * lt, yb = y1 - 10 - em.lidB * ry * .9;
    out.push(<g key={'e' + i}><clipPath id={`${fid}h${i}`}><polygon points={E.hull.map(q => q.join(',')).join(' ')} /></clipPath>
      <g clipPath={`url(#${fid}h${i})`}>
        <rect x={x0} y={y0} width={x1 - x0} height={H} fill="#fff" />
        <image href={staticFile(`ne-cut/${id}/iris${'LR'[i]}.png`)} x={ib[0] + ox} y={ib[1] + oy} width={ib[2]} height={ib[3]} />
        <rect x={x0} y={y0} width={x1 - x0} height={H * .3} fill="#000" opacity={.07} />
      </g>
      {/* веки — по контуру чуть шире белка, чтобы не оставалось светлой каймы */}
      <clipPath id={`${fid}w${i}`}><polygon points={E.hull.map(q => `${cx + (q[0] - cx) * 1.1},${cy + (q[1] - cy) * 1.14}`).join(' ')} /></clipPath>
      <g clipPath={`url(#${fid}w${i})`}>
        {lt > .02 && <><rect x={x0 - 10} y={y0 - 10} width={x1 - x0 + 20} height={yl - y0 + 10} fill={skin} />
          <path d={`M${x0 - 4},${yl - 3} Q${cx},${yl + 5} ${x1 + 4},${yl - 3}`} stroke="#140c0a" strokeWidth={8} fill="none" /></>}
        {em.lidB > .02 && <path d={`M${x0 - 10},${y1 + 10} L${x0 - 10},${yb + 6} Q${cx},${yb - 10} ${x1 + 10},${yb + 6} L${x1 + 10},${y1 + 10} Z`} fill={skin} />}
      </g></g>); });
  FX.brows.forEach((B, i) => { const k = 'brow' + 'LR'[i], up = em.by + (i ? em.bR : em.bL);
    out.push(<g key={k} transform={`translate(0,${-up}) rotate(${(i ? 1 : -1) * em.brow} ${B.c[0]} ${B.c[1]})`}>{part(id, k, I)}</g>); });
  const Mo = FX.mouth;
  if (Mo) { const mb = d0.parts.mouth, href = staticFile(`ne-cut/${id}/mouth.png`), s = em.smile, o = em.open, ws = em.w * (1 + .1 * Math.max(0, s));
    if (Math.abs(s) < .02 && o < .02 && Math.abs(ws - 1) < .01) out.push(part(id, 'mouth', I));
    else { const N = 16, sw = mb[2] / N, hw = mb[2] / 2, cx = Mo.c[0], A = Mo.ry * .55, R = Mo.ry * 1.15 * o, up = o * Mo.ry * .22;
      const dy = (u: number) => -s * A * (u * u - .3), dn = (u: number) => R * Math.max(0, 1 - (u / .9) ** 2);
      const X = (u: number) => cx + u * hw * ws, line = Mo.line;
      if (o > .03) { const us = Array.from({ length: 13 }, (_, j) => -.9 + j * .15);
        const topP = us.map(u => `${X(u)},${line + dy(u) - up - 1}`), botP = us.slice().reverse().map(u => `${X(u)},${line + dy(u) + dn(u) + 1}`);
        out.push(<polygon key="mi" points={[...topP, ...botP].join(' ')} fill="#3a1216" />);
        if (em.teeth > .3) out.push(<polygon key="mt" points={[...topP, ...us.slice().reverse().map(u => `${X(u)},${line + dy(u) - up + Math.min(dn(u) * .55, 15)}`)].join(' ')} fill="#fbfaf6" />);
        else out.push(<ellipse key="mg" cx={cx} cy={line + dy(0) + dn(0) * .8} rx={hw * ws * .45} ry={dn(0) * .3} fill="#b84a52" opacity={.8} />); }
      for (let half = 0; half < 2; half++) for (let i = 0; i < N; i++) { const x0 = mb[0] + i * sw, xc = x0 + sw / 2, u = (xc - cx) / hw;
        const k = -s * A * 2 * u / hw + (half ? -R * 2 * u / .81 / hw * (Math.abs(u) < .9 ? 1 : 0) : 0), d = dy(u) + (half ? dn(u) : -up);
        const ya = half ? line : mb[1], hh = half ? mb[1] + mb[3] - line : line - mb[1];
        out.push(<g key={'m' + half + i} transform={`matrix(${ws} ${k} 0 1 ${cx * (1 - ws)} ${d - k * xc})`}>
          <svg x={x0 - .5} y={ya} width={sw + 1} height={hh} viewBox={`${x0 - .5} ${ya} ${sw + 1} ${hh}`}><image href={href} x={mb[0]} y={mb[1]} width={mb[2]} height={mb[3]} /></svg></g>); } } }
  return out; };

// кинематика: матрицы частей в пикселях картинки + матрица корня (в координаты сцены)
export const kin = (p: CutProps) => {
  const id = p.id, d0 = D[id], P = d0.piv, F = FACE[id], s = (p.s ?? 1) * UNIT, t = p.t;
  const g = p.walk ? gait(id, p.walk) : null;
  const pose = poseOf(p);
  // инерция: позы 1/15 и 2/15 с назад → сглаживание рук, «хвост» предплечья и головы, растяжение по вертикали
  const pv = p.prev ?? [], p1 = pv[0], p2 = pv[1] ?? pv[0], S0 = p.s ?? 1;
  const dyn = { faL: 0, faR: 0, head: 0, lean: 0, st: 0 };
  if (p1 && !p.raw) { const q1 = poseOf(p1), q2 = poseOf(p2), same = !!p.sit === !!p1.sit;
    (['armL', 'armR'] as const).forEach(k => { const d = pose[k][0] - q1[k][0]; dyn[k === 'armL' ? 'faL' : 'faR'] = clamp(-d * 1.1, -.55, .55);
      if (!g && same) pose[k] = [pose[k][0] * .5 + q1[k][0] * .3 + q2[k][0] * .2, pose[k][1] * .5 + q1[k][1] * .3 + q2[k][1] * .2]; });
    if (!g && same && !p.sit) (['legL', 'legR'] as const).forEach(k => { pose[k] = [pose[k][0] * .6 + q1[k][0] * .4, pose[k][1] * .6 + q1[k][1] * .4]; });
    const fl = p.flip ? -1 : 1, vx = (p.x - p1.x) / LAG / S0 * fl, ax = (p.x - 2 * p1.x + p2.x) / (LAG * LAG) / S0 * fl, vy = (p.y - p1.y) / LAG / S0;
    dyn.head = clamp(vx * .012, -7, 7) + clamp(((p.headTilt ?? 0) - (p1.headTilt ?? 0)) * -.5, -5, 5);
    dyn.lean = clamp(ax * .00006, -.07, .07); dyn.st = clamp(Math.abs(vy) * .00008, 0, .07); }
  const idle = !g && !p.rot;
  const rest = {
    thL: ang(P.PL, P.KL), thR: ang(P.PR, P.KR), shL: ang(P.KL, P.AL), shR: ang(P.KR, P.AR),
    uaL: ang(P.SL, P.EL), uaR: ang(P.SR, P.ER), faL: ang(P.EL, P.WL), faR: ang(P.ER, P.WR),
  };
  const hipC: [number, number] = [(P.PL[0] + P.PR[0]) / 2, (P.PL[1] + P.PR[1]) / 2];
  const sitF = .45, legLen = (dist(P.PL, P.KL) + dist(P.PR, P.KR)) / 2;
  const sitDrop = p.sit ? -legLen * (1 - sitF) : 0;
  const drop = g ? -g.bob : 0;
  // корпус: дыхание, наклон вокруг таза
  const br = Math.sin(t * 2.3 + id.length) * 3.4;
  const lean = (pose.lean ?? 0) + dyn.lean + (idle ? noise(id + 'ln', t, .22) * .012 : 0);
  const body: M = mul(rotB(-lean, hipC[0], hipC[1]), tr(0, -(pose.hip ?? 0) / UNIT));
  const torsoM: M = mul(body, sc(1 + (p.slump ?? 0) * .02 - br * .001, 1 + br * .003 - (p.slump ?? 0) * .05, hipC[0], hipC[1]));
  const shUp = br * .6;
  const headM: M = mul(mul(torsoM, tr(0, shUp * .3 + (p.slump ?? 0) * 22)), (() => { const ht = (p.headTilt ?? 0) + noise(id + 'ht', t, .3) * 2.4 + dyn.head; return rotB(-ht * Math.PI / 180, P.head[0], P.head[1]); })());
  // руки
  const arm = (side: 'L' | 'R') => {
    const l0 = side === 'L' ? pose.armL : pose.armR, l: [number, number] = [l0[0] + noise(id + side + 'u', t, .45) * .035, l0[1] + noise(id + side + 'f', t, .6) * .05 + dyn['fa' + side as 'faL']];
    const u: M = mul(mul(torsoM, tr(0, shUp * .2)), rotB(l[0] - rest['ua' + side as 'uaL'], P['S' + side][0], P['S' + side][1]));
    const f: M = mul(u, rotB((l[0] + l[1]) - l[0] - (rest['fa' + side as 'faL'] - rest['ua' + side as 'uaL']), P['E' + side][0], P['E' + side][1]));
    return { u, f, abs: l[0] + l[1], hand: ap(f, [(P['W' + side][0] + P['H' + side][0]) / 2, (P['W' + side][1] * .4 + P['H' + side][1] * .6)]) };
  };
  const aL = arm('L'), aR = arm('R');
  // ноги: у сидящего бедро смотрит в камеру — укорочено по вертикали, голень висит от колена
  const leg = (side: 'L' | 'R') => {
    const l = side === 'L' ? pose.legL : pose.legR, Pp = P['P' + side], K = P['K' + side];
    let th: M, sh: M;
    if (g && !p.sit && !(p.pose && (p.pose.legL || p.pose.legR))) {
      // шаг: поворот к стопе + укорочение бедра/голени по вертикали (колено к камере), колено чуть по ходу движения
      const f = g.legs[side], A0 = P['A' + side], lift = f.lift * (g.run ? 1 : .7);
      const fy = 1 - lift * .42, fs = 1 - lift * .2, kdx = g.dir * lift * 26;
      const angT = Math.atan2(f.x * .55 + kdx, (K[1] - Pp[1])), angS = Math.atan2(f.x * .45 - kdx, (A0[1] - K[1]));
      th = mul(rotB(angT - rest['th' + side as 'thL'] * 0, Pp[0], Pp[1]), sc(1, fy, Pp[0], Pp[1]));
      const K2 = ap(th, K);
      sh = mul(tr(K2[0] - K[0], K2[1] - K[1]), mul(rotB(angS, K[0], K[1]), sc(1, fs, K[0], K[1])));
      return { th, sh };
    }
    if (p.sit) th = sc(1.06, sitF, Pp[0], Pp[1] - 30);
    else th = rotB(l[0] - rest['th' + side as 'thL'], Pp[0], Pp[1]);
    const K2 = ap(th, K);
    const shAng = p.sit ? (l[0] * .5) - rest['sh' + side as 'shL'] : (l[0] + l[1]) - rest['sh' + side as 'shL'];
    sh = mul(tr(K2[0] - K[0], K2[1] - K[1]), rotB(shAng, K[0], K[1]));
    return { th, sh };
  };
  const lL = leg('L'), lR = leg('R');
  const flip = p.flip ? -1 : 1;
  const root: M = mul(mul(mul(tr(p.x, p.y), rotB(-(p.rot ?? 0) * Math.PI / 180)), sc(flip * s * (1 - dyn.st * .6 + (p.squash ?? 0) * .5), s * (1 + dyn.st - (p.squash ?? 0)))), tr(-d0.cx, -d0.foot + drop - sitDrop));
  return { id, d0, P, F, s, t, g, pose, rest, hipC, sitF, sitDrop, drop, torsoM, headM, aL, aR, lL, lR, root };
};
// кисть в координатах сцены (для предметов: бросок телефона, букет)
export const cutHand = (p: CutProps, side: 'L' | 'R' = 'R') => { const k = kin(p); return ap(k.root, (side === 'L' ? k.aL : k.aR).hand); };

export const Cut: React.FC<CutProps> = (p0) => {
  const LF = useContext(LifeCtx); let p = p0;
  if (LF) { const n = LF.n[p0.id] = (LF.n[p0.id] ?? 0) + 1, key = p0.id + '#' + n;
    if (LF.mode === 'rec') { (LF.store[key] = LF.store[key] || [])[LF.k] = p0; return null; }
    const prev = (LF.store[key] || []).filter(Boolean); if (prev.length) p = { ...p0, prev }; }
  const { id, d0, P, F, s, t, g, rest, sitF, sitDrop, drop, torsoM, headM, aL, aR, lL, lR, root: rootM } = kin(p);
  const FX = d0.face, em = FX ? emoMix(p) : null;
  // взгляд: заданное направление + мелкие скачки зрачков (саккады)
  const look = (() => { const e = p.eye ?? [0, 0], q = t * .9 + id.length, n = Math.floor(q), f = clamp((q - n) / .08), h = (k: number) => { const v = Math.sin(k * 127.1 + 311.7) * 43758.5453; return (v - Math.floor(v)) - .5; };
    return [e[0] + (h(n - 1) + (h(n) - h(n - 1)) * f) * .22, e[1] + (h(n + 40) + (h(n + 41) - h(n + 40)) * f) * .12]; })();
  // моргание
  const bc = (() => { if (p.noBlink) return 0; const ph = (t * .31 + id.length * .17) % 1, ph2 = (t * .53 + .4) % 1; const k = Math.max(ph < .045 ? 1 - Math.abs(ph / .045 * 2 - 1) : 0, ph2 < .03 && Math.floor(t * .53) % 3 === 0 ? 1 - Math.abs(ph2 / .03 * 2 - 1) : 0); return k; })();
  const eyes = F.eyes ?? d0.eyes;
  const face = p.face ?? null, cry = p.face === 'cry' ? (p.cry ?? 1) : 0;
  const lidK = Math.max(bc, p.lid ?? 0, cry * .22);
  const skin = d0.skin, [mx, my, mw] = F.m;
  const fid = 'cf' + id.replace(/[^a-z]/g, '');
  const talk = clamp(p.mouth ?? 0);
  const flip = p.flip ? -1 : 1;
  const root = ms(rootM);
  const holdM = p.hold ? (() => { const h = aR.hand; return `translate(${h[0]},${h[1]}) rotate(${-aR.abs * 180 / Math.PI + 180}) scale(${(p.hold === 'flowers' ? (p.armRBack ? .58 : .78) : 1) / UNIT})`; })() : '';
  const torsoK = p.flip && d0.parts.torsoF ? 'torsoF' : 'torso';
  const patch = (cx: number, cy: number, rx: number, ry: number) => <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={skin} filter={`url(#${fid}b)`} />;
  return (<g transform={root} opacity={p.opacity ?? 1}>
    <defs><filter id={`${fid}b`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" /></filter>
      {eyes.map((e, i) => <clipPath key={i} id={`${fid}e${i}`}><ellipse cx={e[0]} cy={e[1]} rx={e[2] * 1.12} ry={e[3] * 1.25} /></clipPath>)}</defs>
    {!p.sit && (p.shadow ?? .28) > 0 && <ellipse cx={d0.cx} cy={d0.foot - 8 - drop} rx={250} ry={38} fill="#000" opacity={p.shadow ?? .28} />}
    {p.sit && <><ellipse cx={d0.cx} cy={d0.foot - 4 + sitDrop} rx={230} ry={30} fill="#000" opacity={.3} /></>}
    {/* дальняя рука (L) за корпусом, ноги за корпусом (сидя — бёдра перед корпусом) */}
    {part(id, 'faL', aL.f)}{part(id, 'uaL', aL.u)}
    {p.armRBack && <>{p.hold && <g transform={holdM}>{p.hold === 'phone' ? <g transform="translate(0,-36)"><Phone /></g> : <Bouquet t={t} />}</g>}{part(id, 'faR', aR.f)}{part(id, 'uaR', aR.u)}</>}
    {part(id, 'shL', lL.sh)}{part(id, 'shR', lR.sh)}
    {!p.sit && <>{part(id, 'thL', lL.th)}{part(id, 'thR', lR.th)}</>}
    {part(id, torsoK, torsoM)}
    {p.sit && <>{part(id, 'thL', lL.th)}{part(id, 'thR', lR.th)}
      {/* бедро уходит вглубь: тень у таза, светлое колено спереди; складка на сгибе */}
      {(['L', 'R'] as const).map(sd => { const kk = ap(sd === 'L' ? lL.th : lR.th, P['K' + sd]), pp = P['P' + sd];
        return <g key={sd}><ellipse cx={(kk[0] + pp[0]) / 2} cy={pp[1] + 6} rx={88} ry={34} fill="#000" opacity={.22} filter={`url(#${fid}b)`} />
          <path d={`M${kk[0] - 60},${kk[1] + 8} Q${kk[0]},${kk[1] + 30} ${kk[0] + 60},${kk[1] + 8}`} stroke="#000" strokeWidth={10} opacity={.22} fill="none" strokeLinecap="round" /></g>; })}</>}
    <g transform={ms(headM)}>
      {part(id, 'head', I)}
      {/* веки: моргание / полуприкрытые при плаче */}
      {FX && faceNew(id, d0, em!, look, bc, fid)}
      {!FX && lidK > .02 && eyes.map((e, i) => <g key={i} clipPath={`url(#${fid}e${i})`}>
        <rect x={e[0] - e[2] * 1.3} y={e[1] - e[3] * 1.4} width={e[2] * 2.6} height={e[3] * 2.8 * lidK} fill={skin} />
        <path d={`M${e[0] - e[2] * 1.1},${e[1] - e[3] * 1.4 + e[3] * 2.8 * lidK} Q${e[0]},${e[1] - e[3] * 1.4 + e[3] * 2.8 * lidK + 8} ${e[0] + e[2] * 1.1},${e[1] - e[3] * 1.4 + e[3] * 2.8 * lidK}`} stroke="#1a1010" strokeWidth={7} fill="none" /></g>)}
      {/* мимика поверх картинки: рот закрашивается цветом кожи, рисуется новый */}
      {!FX?.mouth && (face || talk > .05) && patch(mx, my + 2, mw * 1.25, face ? 44 : 32)}
      {!FX?.mouth && face === 'o' && <ellipse cx={mx} cy={my + 6} rx={mw * .32} ry={mw * .45} fill="#3a1418" />}
      {!FX?.mouth && face === 'flat' && <path d={`M${mx - mw * .55},${my + 6} Q${mx},${my + 2} ${mx + mw * .55},${my + 8}`} stroke="#3a1a18" strokeWidth={7} fill="none" strokeLinecap="round" />}
      {!FX?.mouth && face === 'frown' && <path d={`M${mx - mw * .6},${my + 14} Q${mx},${my - 8} ${mx + mw * .6},${my + 14}`} stroke="#3a1a18" strokeWidth={7} fill="none" strokeLinecap="round" />}
      {!FX?.mouth && face === 'cry' && (() => { const wob = Math.sin(t * 26) * 3 * cry; return <><path d={`M${mx - mw * .62},${my + 18} Q${mx - mw * .3},${my - 6 + wob} ${mx},${my - 4} Q${mx + mw * .3},${my - 6 - wob} ${mx + mw * .62},${my + 18}`} stroke="#3a1a18" strokeWidth={8} fill="none" strokeLinecap="round" />
        <path d={`M${mx - mw * .35},${my + 22 + wob} Q${mx},${my + 30 + wob * 1.5} ${mx + mw * .35},${my + 22 - wob}`} stroke="#5a2a28" strokeWidth={5} fill="none" strokeLinecap="round" opacity={.7 * cry} /></>; })()}
      {!FX?.mouth && !face && talk > .05 && <><ellipse cx={mx} cy={my + 8} rx={mw * (.45 + talk * .15)} ry={8 + talk * 26} fill="#3a1418" /><path d={`M${mx - mw * .38},${my + 2 - talk * 10} Q${mx},${my - 4 - talk * 10} ${mx + mw * .38},${my + 2 - talk * 10} L${mx + mw * .3},${my + 8 - talk * 8} Q${mx},${my + 4 - talk * 8} ${mx - mw * .3},${my + 8 - talk * 8} Z`} fill="#fbf8f2" /></>}
      {/* брови домиком (грусть/плач) */}
      {!FX && (face === 'cry' || face === 'frown') && F.br.map(([bx, by], i) => { const k = face === 'cry' ? cry : .6, sd = i ? 1 : -1;
        return <g key={i}>{patch(bx, by, 72, 24)}<path d={`M${bx + sd * 56},${by + 6} Q${bx},${by - 2 - 4 * k} ${bx - sd * 48},${by - 22 * k - 4}`} stroke={F.brow} strokeWidth={17} fill="none" strokeLinecap="round" /></g>; })}
      {/* слёзы: капли стекают по щекам до подбородка, обе стороны */}
      {(cry > 0 || (p.tears ?? 0) > 0) && eyes.map((e, i) => { const k = Math.max(cry, p.tears ?? 0), sd = i ? 1 : -1, x0 = e[0] + sd * e[2] * .3, y0 = e[1] + e[3] * .9;
        const len = 150 * clamp(k * 1.4);
        return <g key={i} opacity={clamp(k * 2)}>
          <path d={`M${x0 - 7},${y0} Q${x0 + sd * 6},${y0 + len * .5} ${x0 + sd * 10},${y0 + len} L${x0 + sd * 10 + 9},${y0 + len} Q${x0 + sd * 6 + 9},${y0 + len * .5} ${x0 + 7},${y0} Z`} fill="#bfefff" opacity={.85} />
          {[0, 1, 2].map(j => { const q = ((t * 1.1 + j / 3 + i * .17) % 1); const yy = y0 + q * (len + 40);
            return <path key={j} transform={`translate(${x0 + sd * (4 + q * 10)},${yy})`} d="M0,-14 Q9,2 0,10 Q-9,2 0,-14 Z" fill="#dff8ff" stroke="#7fd0f0" strokeWidth={2} opacity={1 - q * .4} />; })}
          <ellipse cx={e[0]} cy={e[1] + e[3] * .55} rx={e[2] * .8} ry={e[3] * .35} fill="#bfefff" opacity={.45 * k} /></g>; })}
      {(p.blush ?? 0) > 0 && eyes.map((e, i) => <ellipse key={'b' + i} cx={e[0] + (i ? 20 : -20)} cy={e[1] + e[3] + 50} rx={40} ry={18} fill="#ff6a7a" opacity={(p.blush ?? 0) * .35} filter={`url(#${fid}b)`} />)}
      {(p.hearts ?? 0) > 0 && eyes.map((e, i) => <path key={'h' + i} transform={`translate(${e[0]},${e[1]}) scale(${(p.hearts ?? 0) * 2 * (1 + .12 * Math.sin(t * 14))})`} d="M0,14 C-6,8 -30,-4 -30,-18 C-30,-32 -12,-36 0,-22 C12,-36 30,-32 30,-18 C30,-4 6,8 0,14 Z" fill="#ff3a6a" stroke="#fff" strokeWidth={3} />)}
    </g>
    {!p.armRBack && <>
    {(() => { const G = (d0 as any).gest; if (!G || !(p.gest ?? 0)) return part(id, 'faR', aR.f);
      // предплечье без кисти + кисть с картинки «паутинный жест»: указательный палец по оси руки
      const W0 = P.WR, cy = W0[1] - 6, gs = 1.7, rotG = 90 - Math.atan2(G.tip[1] - G.cuff[1], G.tip[0] - G.cuff[0]) * 180 / Math.PI;
      const dirA = rest.faR, dx = Math.sin(dirA), dy = Math.cos(dirA);
      const cuffAt = [W0[0] - dx * 6, cy - 4], tipLen = Math.hypot(G.tip[0] - G.cuff[0], G.tip[1] - G.cuff[1]) * gs;
      const tip = [cuffAt[0] + dx * tipLen, cuffAt[1] + dy * tipLen], wl = (p.webLen ?? 5200) * clamp(p.web ?? 0);
      const end = [tip[0] + dx * wl, tip[1] + dy * wl], sag = 60 * (1 - clamp((p.web ?? 0) * 1.4 - .3));
      return <g key="faRg" transform={ms(aR.f)}>
        <clipPath id={`${fid}fc`}><rect x={W0[0] - 200} y={W0[1] - 700} width={400} height={700 - 6} /></clipPath>
        <g clipPath={`url(#${fid}fc)`}>{part(id, 'faR', I)}</g>
        {wl > 2 && <g>
          <path d={`M${tip[0]},${tip[1]} Q${(tip[0] + end[0]) / 2 + sag},${(tip[1] + end[1]) / 2} ${end[0]},${end[1]}`} stroke="#bfe8ff" strokeWidth={30} opacity={.22} fill="none" strokeLinecap="round" />
          <path d={`M${tip[0]},${tip[1]} Q${(tip[0] + end[0]) / 2 + sag},${(tip[1] + end[1]) / 2} ${end[0]},${end[1]}`} stroke="#f4fbff" strokeWidth={8} fill="none" strokeLinecap="round" />
          {(p.web ?? 0) >= 1 && <g transform={`translate(${end[0]},${end[1]})`} stroke="#f4fbff" strokeWidth={6} fill="none" opacity={.95}>
            {Array.from({ length: 8 }, (_, i) => { const a = i * Math.PI / 4; return <path key={i} d={`M0,0 L${Math.cos(a) * 110},${Math.sin(a) * 110}`} />; })}
            <circle r={45} /><circle r={85} /></g>}</g>}
        <image href={staticFile('ne-cut/tom/gestR.png')} width={G.w} height={G.h} transform={`translate(${cuffAt[0]},${cuffAt[1]}) rotate(${rotG - dirA * 180 / Math.PI}) scale(${gs}) translate(${-G.cuff[0]},${-G.cuff[1]})`} />
      </g>; })()}
    {part(id, 'uaR', aR.u)}
    {p.hold && <g transform={holdM}>{p.hold === 'phone' ? <g transform="translate(0,-36)"><Phone /></g> : <Bouquet t={t} />}</g>}</>}
  </g>);
};

// сопоставление персонажей Baller/Sadie → картинки пользователя
export const cutIdOf = (p: any, kind: 'baller' | 'sadie'): CutId | null => {
  if (kind === 'sadie') return p.outfit === 'jacket' ? 'sadie-jkt' : 'sadie-vip';
  switch (p.who) {
    case 'vini': return p.outfit === 'home' ? 'vini-home' : 'vini-kit';
    case 'diom': return p.outfit === 'track' ? 'diom-track' : 'diom-kit';
    case 'tom': return 'tom';
    case 'coach': return 'coach';
    default: return null;
  }
};
const exprFace = (e?: string): Face => e === 'shock' || e === 'scared' || e === 'pain' || e === 'ko' ? 'o' : e === 'sad' ? 'frown' : e === 'deadpan' ? 'flat' : null;
export const renderCut = (p: any, kind: 'baller' | 'sadie') => {
  const id = cutIdOf(p, kind); if (!id) return null;
  return <Cut {...p} id={id} face={p.face ?? (p.oMouth ? 'o' : exprFace(p.expr))} />;
};
