// Риг фигуры (анфас/3/4): торс, руки с локтями и кистями, ноги с коленями, одежда по костюму.
// Начало координат — между ступнями; s=1 ≈ рост 820 px. Углы в градусах: 0 — вниз, + — к правому краю кадра.
import React from 'react';
import { clamp, noise } from '../anim';
import { Expr, Head, INK, Look } from './head';

export type Pose = { armL: [number, number]; armR: [number, number]; legL: [number, number]; legR: [number, number]; lean: number; crouch: number; head: number; fistL?: boolean; fistR?: boolean };
export const POSES: Record<string, Pose> = {
  stand: { armL: [-8, 6], armR: [8, -6], legL: [-4, 2], legR: [4, -2], lean: 0, crouch: 0, head: 0 },
  tense: { armL: [-18, 40], armR: [18, -40], legL: [-10, 6], legR: [10, -6], lean: 0, crouch: 20, head: 0, fistL: true, fistR: true },
  guard: { armL: [-30, 110], armR: [30, -110], legL: [-14, 8], legR: [14, -8], lean: 0, crouch: 40, head: 6, fistL: true, fistR: true },
  shrug: { armL: [-30, 70], armR: [30, -70], legL: [-4, 2], legR: [4, -2], lean: 0, crouch: 0, head: -6 },
  pointR: { armL: [-8, 6], armR: [100, -6], legL: [-6, 2], legR: [6, -2], lean: 3, crouch: 0, head: 6 },
  raiseR: { armL: [-8, 6], armR: [168, -8], legL: [-4, 2], legR: [4, -2], lean: -2, crouch: 0, head: -4 },
  raiseL: { armL: [-168, 8], armR: [8, -6], legL: [-4, 2], legR: [4, -2], lean: 2, crouch: 0, head: 4 },
  bothUp: { armL: [-160, 20], armR: [160, -20], legL: [-8, 2], legR: [8, -2], lean: 0, crouch: 0, head: -8 },
  hit: { armL: [-50, 30], armR: [60, -20], legL: [-20, 14], legR: [16, -4], lean: -18, crouch: 30, head: -20 },
  fallen: { armL: [-80, 20], armR: [70, -30], legL: [-60, 30], legR: [40, -10], lean: -60, crouch: 200, head: -30 },
  hold: { armL: [-20, 90], armR: [20, -90], legL: [-4, 2], legR: [4, -2], lean: 0, crouch: 0, head: 10 },
  phone: { armL: [-8, 6], armR: [22, -130], legL: [-4, 2], legR: [4, -2], lean: 0, crouch: 0, head: 10 },
  bang: { armL: [-150, -30], armR: [150, 30], legL: [-14, 4], legR: [10, -4], lean: 6, crouch: 10, head: -6, fistL: true, fistR: true },
  heal: { armL: [-50, 40], armR: [50, -40], legL: [-6, 2], legR: [6, -2], lean: 4, crouch: 10, head: 14 },
};
export const blend = (a: Pose, b: Pose, k: number): Pose => { const L = (x: [number, number], y: [number, number]): [number, number] => [x[0] + (y[0] - x[0]) * k, x[1] + (y[1] - x[1]) * k];
  return { armL: L(a.armL, b.armL), armR: L(a.armR, b.armR), legL: L(a.legL, b.legL), legR: L(a.legR, b.legR), lean: a.lean + (b.lean - a.lean) * k, crouch: a.crouch + (b.crouch - a.crouch) * k, head: a.head + (b.head - a.head) * k, fistL: k < .5 ? a.fistL : b.fistL, fistR: k < .5 ? a.fistR : b.fistR }; };
const back = (k: number) => { const c = 1.6; return 1 + (c + 1) * (k - 1) ** 3 + c * (k - 1) ** 2; };
const io = (k: number) => k * k * (3 - 2 * k);
// позы по ключам: [время, поза|частичная]; snap=true — с перелётом (резкие жесты)
export const PK = (t: number, ks: [number, Partial<Pose> | string][], snap = true): Pose => {
  const f = (p: Partial<Pose> | string): Pose => typeof p === 'string' ? POSES[p] : { ...POSES.stand, ...p };
  if (t <= ks[0][0]) return f(ks[0][1]);
  for (let i = 1; i < ks.length; i++) if (t < ks[i][0]) { const k = (t - ks[i - 1][0]) / (ks[i][0] - ks[i - 1][0]); return blend(f(ks[i - 1][1]), f(ks[i][1]), snap ? back(k) : io(k)); }
  return f(ks[ks.length - 1][1]);
};
// шаг: фаза из пройденного пути (ноги не скользят). dist — путь в px (в масштабе фигуры)
export const walkPose = (dist: number, run = false): Pose => { const ph = dist / (run ? 260 : 190) * Math.PI; const a = Math.sin(ph) * (run ? 34 : 22);
  return { armL: [-a * .8 - 6, run ? 70 : 14], armR: [a * .8 + 6, run ? -70 : -14], legL: [a, Math.max(0, -Math.cos(ph)) * (run ? 60 : 30)], legR: [-a, Math.max(0, Math.cos(ph)) * (run ? 60 : 30)], lean: run ? 10 : 2, crouch: Math.abs(Math.cos(ph)) * (run ? 18 : 8), head: 0 }; };

export type Costume = { top: string; topSh: string; pants: string; shoes: string; coat?: boolean; hood?: boolean; box?: boolean; armor?: boolean; dress?: boolean; logo?: string; trim?: string; w?: number };

const dir = (a: number) => { const r = a * Math.PI / 180; return [Math.sin(r), Math.cos(r)]; };
const Limb: React.FC<{ a: number[]; b: number[]; w1: number; w2: number; fill: string; sh?: string }> = ({ a, b, w1, w2, fill, sh }) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, px = -dy / l, py = dx / l;
  const p = `M${a[0] + px * w1} ${a[1] + py * w1} L${b[0] + px * w2} ${b[1] + py * w2} A${w2} ${w2} 0 0 1 ${b[0] - px * w2} ${b[1] - py * w2} L${a[0] - px * w1} ${a[1] - py * w1} A${w1} ${w1} 0 0 1 ${a[0] + px * w1} ${a[1] + py * w1}Z`;
  const ps = sh ? `M${a[0] - px * w1 * .1} ${a[1] - py * w1 * .1} L${b[0] - px * w2 * .1} ${b[1] - py * w2 * .1} L${b[0] - px * w2} ${b[1] - py * w2} L${a[0] - px * w1} ${a[1] - py * w1}Z` : '';
  return <g><path d={p} fill={fill} stroke={INK} strokeWidth={4} strokeLinejoin="round" />{sh && <path d={ps} fill={sh} opacity={.6} />}</g>;
};
const Hand: React.FC<{ at: number[]; ang: number; skin: string; fist?: boolean; side: number; glove?: string }> = ({ at, ang, skin, fist, side, glove }) => (
  <g transform={`translate(${at[0]} ${at[1]}) rotate(${-ang})`}>
    {fist ? <rect x={-17} y={-6} width={34} height={34} rx={12} fill={glove || skin} stroke={INK} strokeWidth={3.5} />
      : <g><path d={`M-15 -4 C-18 20 -12 40 0 42 C12 40 18 20 15 -4Z`} fill={glove || skin} stroke={INK} strokeWidth={3.5} /><path d={`M${side * 14} 4 q${side * 12} 6 ${side * 8} 20`} stroke={INK} strokeWidth={3} fill={glove || skin} /></g>}
  </g>
);

export const Figure: React.FC<{ x: number; y: number; s?: number; t: number; L: Look; C: Costume; pose: Pose; expr?: Expr; mouth?: number; turn?: number; lookX?: number; lookY?: number; glow?: number; seed?: number; flip?: boolean; rot?: number; breathe?: boolean; prop?: React.ReactNode; rim?: string; sweat?: number; tears?: number; opacity?: number }> = (p) => {
  const { t, L, C, pose, s = 1, seed = 1 } = p; const W = C.w || 1;
  const br = p.breathe === false ? 0 : Math.sin(t * 2.2 + seed) * 3;
  const hipY = -410 + pose.crouch, shY = -640 + pose.crouch * .9 + br * .4;
  const lean = pose.lean + noise('ln' + seed, t, .4) * 1.2;
  // ноги
  // анфас: сгиб колена = укорочение (ракурс), голень возвращается под бедро
  const leg = (side: number, [h, k]: [number, number]) => { const hip = [side * 40 * W, hipY]; const c = clamp((392 - pose.crouch) / 410, .15, 1) * Math.cos(clamp(k, 0, 170) * Math.PI / 360);
    const d1 = dir(h), kn = [hip[0] + d1[0] * 210 * c, hip[1] + d1[1] * 210 * c]; const d2 = dir(h * .25 + side * k * .08), an = [kn[0] + d2[0] * 200 * c, kn[1] + d2[1] * 200 * c]; return { hip, kn, an }; };
  const lL = leg(-1, pose.legL), lR = leg(1, pose.legR);
  // руки (в системе торса)
  const sh = (side: number) => [side * 74 * W, shY - hipY];
  const arm = (side: number, [a, e]: [number, number]) => { const s0 = sh(side), d1 = dir(a), el = [s0[0] + d1[0] * 150, s0[1] + d1[1] * 150], d2 = dir(a + e), wr = [el[0] + d2[0] * 140, el[1] + d2[1] * 140]; return { s0, el, wr, ang: a + e }; };
  const aL = arm(-1, pose.armL), aR = arm(1, pose.armR);
  const skin = L.skin;
  const sleeve = C.top, sleeveSh = C.topSh;
  const coatSw = noise('coat' + seed, t, 1.4) * 10;
  // конечность — одна ломаная толстым штрихом (без швов на локтях/коленях): контур, заливка, тень сбоку
  const Seg = (pts: number[][], w: number, fill: string, shc: string) => { const d = 'M' + pts.map(q => q.join(' ')).join(' L');
    return <g><path d={d} stroke={INK} strokeWidth={w * 2 + 8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} stroke={fill} strokeWidth={w * 2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} stroke={shc} strokeWidth={w * .7} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={.55} transform={`translate(${w * .55} 0)`} /></g>; };
  const Arm = (A: ReturnType<typeof arm>, side: number, fist?: boolean) => <g>
    {Seg([A.s0, A.el, A.wr], 19 * W, sleeve, sleeveSh)}
    <Hand at={A.wr} ang={A.ang} skin={skin} fist={fist} side={side} glove={C.armor ? '#2a2d3a' : undefined} />
  </g>;
  const Leg = (G: ReturnType<typeof leg>) => <g>
    {Seg([G.hip, G.kn, G.an], 25 * W, C.pants, '#000')}
    <path d={`M${G.an[0] - 20} ${G.an[1] - 6} q0 -14 16 -14 q26 0 34 16 q4 10 -6 12 h-40 q-6 0 -4 -14Z`} transform={`translate(${G.an[0] < 0 ? -12 : 0} 0) ${G.an[0] < 0 ? `scale(-1 1) translate(${-2 * G.an[0]} 0)` : ''}`} fill={C.shoes} stroke={INK} strokeWidth={3.5} />
  </g>;
  const torso = `M${-74 * W} ${shY - hipY - 6} C${-80 * W} ${-120} ${-56 * W} ${-60} ${-56 * W} 0 L${56 * W} 0 C${56 * W} ${-60} ${80 * W} ${-120} ${74 * W} ${shY - hipY - 6} C${40 * W} ${shY - hipY - 22} ${-40 * W} ${shY - hipY - 22} ${-74 * W} ${shY - hipY - 6}Z`;
  const ty = shY - hipY;
  return (
    <g transform={`translate(${p.x} ${p.y}) scale(${(p.flip ? -1 : 1) * s} ${s}) rotate(${p.rot || 0})`} opacity={p.opacity ?? 1}>
      <ellipse cx={0} cy={4} rx={110 * W} ry={16} fill="#000" opacity={.35} />
      {C.box && <g transform={`translate(0 ${hipY}) rotate(${lean})`}><rect x={-90} y={ty - 20} width={180} height={230} rx={14} fill="#ffb020" stroke={INK} strokeWidth={4} /><text x={0} y={ty + 110} textAnchor="middle" fontFamily="Mont" fontWeight={900} fontSize={34} fill="#3a2200">ЕДА</text></g>}
      {C.coat && <g transform={`translate(0 ${hipY}) rotate(${lean})`}><path d={`M${-80 * W} ${ty} L${-110 * W - coatSw} 330 Q0 ${350 + coatSw} ${110 * W + coatSw} 330 L${80 * W} ${ty}Z`} fill="#0b0d16" stroke={INK} strokeWidth={4} />{p.rim && <path d={`M${-80 * W} ${ty} L${-110 * W - coatSw} 330`} stroke={p.rim} strokeWidth={5} filter="url(#glow)" />}</g>}
      {Leg(lL)}{Leg(lR)}
      <g transform={`translate(0 ${hipY}) rotate(${lean})`}>
        {C.hood && <path d={`M-60 ${ty - 10} Q0 ${ty + 40} 60 ${ty - 10} Q40 ${ty - 50} 0 ${ty - 50} Q-40 ${ty - 50} -60 ${ty - 10}Z`} fill={C.topSh} stroke={INK} strokeWidth={4} />}
        <path d={torso} fill={C.top} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        <path d={`M${20 * W} ${ty - 14} C${60 * W} ${-120} ${50 * W} ${-60} ${56 * W} 0 L${10} 0 Z`} fill={C.topSh} opacity={.7} />
        {!C.armor && !C.dress && <path d={`M0 ${ty - 4} V-4`} stroke={INK} strokeWidth={2.5} opacity={.7} />}
        {C.armor && <g><path d={`M${-60 * W} ${ty + 20} L0 ${ty + 110} L${60 * W} ${ty + 20}`} stroke={C.trim || '#8a96b8'} strokeWidth={6} fill="none" /><rect x={-56 * W} y={-30} width={112 * W} height={26} fill={C.trim || '#8a96b8'} stroke={INK} strokeWidth={3} /></g>}
        {C.logo && <text x={-30 * W} y={ty + 90} textAnchor="middle" fontFamily="Mont" fontWeight={900} fontSize={22} fill={C.trim || '#ff5a3a'}>{C.logo}</text>}
        {/* шея и голова */}
        <rect x={-17} y={ty - 54} width={34} height={44} fill={L.skinSh} stroke={INK} strokeWidth={3.5} />
        <g transform={`translate(0 ${ty - 100}) rotate(${pose.head + noise('hd' + seed, t, .5) * 2}) translate(0 -14)`}>
          <Head t={t} L={L} expr={p.expr} mouth={p.mouth} turn={p.turn} lookX={p.lookX} lookY={p.lookY} glow={p.glow} seed={seed} sweat={p.sweat} tears={p.tears} />
        </g>
        {p.prop}
        {Arm(aL, -1, pose.fistL)}{Arm(aR, 1, pose.fistR)}
        {p.rim && <path d={torso} fill="none" stroke={p.rim} strokeWidth={4} opacity={.7} filter="url(#glow)" transform="translate(-3 0)" />}
      </g>
    </g>
  );
};

// кисть правой руки в координатах фигуры (для предмета в руке)
export const wristR = (pose: Pose, W = 1) => { const hipY = -410 + pose.crouch, shY = -640 + pose.crouch * .9; const d1 = dir(pose.armR[0]), el = [74 * W + d1[0] * 150, shY - hipY + d1[1] * 150], d2 = dir(pose.armR[0] + pose.armR[1]); return [el[0] + d2[0] * 160, el[1] + d2[1] * 160, pose.armR[0] + pose.armR[1]]; };
export { clamp };
