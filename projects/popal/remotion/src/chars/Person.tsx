// Аниме-риг человека (Макс, курьер): начало координат — между ступнями на земле. Рост ≈ 3,6 головы.
// Конечности из двух звеньев с локтем/коленом, кисть с большим пальцем, лицо с белками, радужкой, бликами и веками,
// моргание, дыхание, рот по голосу. Углы — от вертикали вниз, плюс = в сторону +x экрана.
import React from 'react';
import { blink, clamp, lerp, noise } from '../anim';

export type Expr = 'neutral' | 'shock' | 'deadpan' | 'happy' | 'pain' | 'determined' | 'sad' | 'ko' | 'cool' | 'scared' | 'smug';
export type Limb = [number, number];
export type Pose = { armL: Limb; armR: Limb; legL: Limb; legR: Limb; lean?: number; hip?: number };
export type Look = 'max' | 'courier';
export type PersonProps = { x: number; y: number; s?: number; t: number; look?: Look; pose?: Partial<Pose>; expr?: Expr; mouth?: number; eye?: [number, number];
  headTilt?: number; rot?: number; hold?: 'pan' | 'phone' | 'burger' | 'cola' | 'doner' | null; panGlow?: number; squash?: number; lid?: number; noBlink?: boolean; sweat?: number; blush?: number; flip?: boolean; shadow?: boolean };

const pt = (x: number, y: number, a: number, l: number): [number, number] => [x + Math.sin(a) * l, y + Math.cos(a) * l];
// трапеция-звено с круглыми концами (рукав, штанина)
const seg = (a: [number, number], b: [number, number], wa: number, wb: number, fill: string, key: string) => {
  const d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, nx = -(b[1] - a[1]) / d, ny = (b[0] - a[0]) / d;
  return <g key={key}><path d={`M${a[0] + nx * wa / 2},${a[1] + ny * wa / 2} L${b[0] + nx * wb / 2},${b[1] + ny * wb / 2} L${b[0] - nx * wb / 2},${b[1] - ny * wb / 2} L${a[0] - nx * wa / 2},${a[1] - ny * wa / 2} Z`} fill={fill} />
    <circle cx={b[0]} cy={b[1]} r={wb / 2} fill={fill} /><circle cx={a[0]} cy={a[1]} r={wa / 2} fill={fill} /></g>; };

export const POSES: Record<string, Pose> = {
  stand: { armL: [-.12, .15], armR: [.12, -.15], legL: [-.06, .04], legR: [.06, -.04] },
  armsUp: { armL: [-2.6, .3], armR: [2.6, -.3], legL: [-.12, .04], legR: [.12, -.04] },
  shrug: { armL: [-1.1, 1.7], armR: [1.1, -1.7], legL: [-.06, .04], legR: [.06, -.04] },
  holdUp: { armL: [-.15, .2], armR: [.5, -2.2], legL: [-.08, .04], legR: [.08, -.04] }, // правая рука держит предмет у лица
  point: { armL: [-.1, .1], armR: [1.55, -.1], legL: [-.06, .04], legR: [.06, -.04] },
  throwBack: { armL: [-.9, .6], armR: [2.4, -1.2], legL: [-.35, .2], legR: [.25, -.1], lean: -.12 },
  throwFwd: { armL: [-.4, .3], armR: [1.2, .2], legL: [-.3, .1], legR: [.35, -.3], lean: .15 },
  heroic: { armL: [-.5, -1.3], armR: [2.9, -.2], legL: [-.28, .05], legR: [.22, -.05], lean: -.04 },
  cover: { armL: [.35, -2.0], armR: [-.35, 2.0], legL: [.18, -.5], legR: [-.18, .5], hip: 20 }, // руки и колени сведены (удар в пах)
  lotus: { armL: [-.5, 1.1], armR: [.5, -1.1], legL: [-1.45, 2.6], legR: [1.45, -2.6], hip: 0 },
  fall: { armL: [-2.3, .5], armR: [2.1, -.7], legL: [-.5, .9], legR: [.4, -.2] },
  lean: { armL: [-.1, .1], armR: [.6, -1.3], legL: [-.06, .04], legR: [.06, -.04], lean: .1 },
  phone: { armL: [-.15, .15], armR: [.3, -2.0], legL: [-.06, .04], legR: [.06, -.04] },
};
export const blendPose = (a: Pose, b: Pose, k: number): Pose => ({
  armL: [lerp(a.armL[0], b.armL[0], k), lerp(a.armL[1], b.armL[1], k)], armR: [lerp(a.armR[0], b.armR[0], k), lerp(a.armR[1], b.armR[1], k)],
  legL: [lerp(a.legL[0], b.legL[0], k), lerp(a.legL[1], b.legL[1], k)], legR: [lerp(a.legR[0], b.legR[0], k), lerp(a.legR[1], b.legR[1], k)],
  lean: lerp(a.lean ?? 0, b.lean ?? 0, k), hip: lerp(a.hip ?? 0, b.hip ?? 0, k) });
// бег: фаза из пройденного пути (ноги не скользят), руки в противофазе
export const runPose = (ph: number): Pose => { const s = Math.sin(ph), c = Math.cos(ph);
  return { armL: [-s * .9, -.9 - c * .2], armR: [s * .9, .9 + c * .2], legL: [s * .75, -Math.max(0, -c) * 1.3 - .15], legR: [-s * .75, Math.max(0, c) * 1.3 + .15], lean: .18 }; };

const LOOK = {
  max: { skin: '#f6cfae', skinSh: '#e3a989', top: '#76839a', topSh: '#5d697e', topHi: '#8f9bb1', pants: '#2d3d66', pantsSh: '#22305a', shoe: '#f2f2f2', shoeSole: '#d04646', hair: '#2f231f', hairHi: '#5a4237', iris: '#7a4a28' },
  courier: { skin: '#f0c4a0', skinSh: '#d9a07c', top: '#5a2fd4', topSh: '#43209f', topHi: '#7a55ff', pants: '#26203d', pantsSh: '#1b1630', shoe: '#ececec', shoeSole: '#7b4dff', hair: '#1a1a1a', hairHi: '#333', iris: '#2a1a10' },
};
const EX: Record<Expr, { bl: number; br: number; by: number; lid: number; mouth: number; curve: number; iris: number }> = {
  neutral: { bl: 0, br: 0, by: 0, lid: .12, mouth: 0, curve: .15, iris: 1 }, shock: { bl: .5, br: .5, by: -16, lid: 0, mouth: .7, curve: 0, iris: .62 },
  deadpan: { bl: -.1, br: -.1, by: 6, lid: .55, mouth: 0, curve: -.05, iris: 1 }, happy: { bl: .25, br: .25, by: -8, lid: .05, mouth: .45, curve: .9, iris: 1 },
  pain: { bl: .7, br: .7, by: 2, lid: 1, mouth: .5, curve: -.6, iris: 1 }, determined: { bl: -.6, br: -.6, by: 4, lid: .28, mouth: 0, curve: -.15, iris: .95 },
  sad: { bl: .8, br: .8, by: -4, lid: .3, mouth: 0, curve: -.5, iris: 1 }, ko: { bl: 0, br: 0, by: 0, lid: 0, mouth: .3, curve: -.3, iris: 1 },
  cool: { bl: -.3, br: .25, by: 0, lid: .35, mouth: 0, curve: .55, iris: 1 }, scared: { bl: .9, br: .9, by: -12, lid: 0, mouth: .55, curve: -.5, iris: .55 },
  smug: { bl: -.2, br: .3, by: 0, lid: .4, mouth: 0, curve: .7, iris: 1 },
};

// Лицо: центр головы (0,0), радиус ~100. Используется и для крупных планов.
export const Face: React.FC<{ t: number; expr: Expr; mouth?: number; eye?: [number, number]; lid?: number; noBlink?: boolean; L: typeof LOOK.max; seed?: number; sweat?: number; blush?: number }> = ({ t, expr, mouth = 0, eye, lid, noBlink, L, seed = 1, sweat = 0, blush = 0 }) => {
  const e = EX[expr], b = noBlink ? 1 : blink(t, seed); const lidK = clamp(Math.max(lid ?? e.lid, 1 - b));
  const ex = eye ?? [noise('ex' + seed, t, .35) * .25, noise('ey' + seed, t, .3) * .12];
  const op = clamp(e.mouth + mouth), curve = e.curve;
  const eyeG = (side: -1 | 1) => { const cx = side * 42, cy = 8, rx = 27, ry = 33, ir = 21 * e.iris;
    if (expr === 'ko') return <g key={side} stroke="#2a1a1a" strokeWidth={8} strokeLinecap="round"><path d={`M${cx - 16},${cy - 16} L${cx + 16},${cy + 16} M${cx + 16},${cy - 16} L${cx - 16},${cy + 16}`} /></g>;
    if (expr === 'pain') return <path key={side} d={`M${cx - 20 * side},${cy - 14} L${cx + 14 * side},${cy} L${cx - 20 * side},${cy + 14}`} stroke="#2a1a1a" strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    const ix = cx + ex[0] * 14, iy = cy + ex[1] * 12 + 3;
    return (<g key={side}>
      <clipPath id={`ec${seed}${side}`}><ellipse cx={cx} cy={cy} rx={rx} ry={ry} /></clipPath>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#ffffff" />
      <g clipPath={`url(#ec${seed}${side})`}>
        <ellipse cx={ix} cy={iy} rx={ir * .92} ry={ir * 1.15} fill={L.iris} /><ellipse cx={ix} cy={iy + ir * .35} rx={ir * .7} ry={ir * .55} fill="#ffffff" opacity={.18} />
        <ellipse cx={ix} cy={iy} rx={ir * .42} ry={ir * .55} fill="#1a0f0a" />
        <circle cx={ix - ir * .35} cy={iy - ir * .45} r={ir * .3} fill="#fff" /><circle cx={ix + ir * .35} cy={iy + ir * .4} r={ir * .13} fill="#fff" />
        <rect x={cx - rx - 2} y={cy - ry - 2} width={rx * 2 + 4} height={(ry * 2 + 4) * lidK} fill={L.skin} />
      </g>
      <path d={`M${cx - rx - 4},${cy - ry * (1 - 2 * lidK) + 2} Q${cx},${cy - ry * (1 - 2 * lidK) - 10 + lidK * 8} ${cx + rx + 4},${cy - ry * (1 - 2 * lidK) + 2}`} stroke="#2a1a1a" strokeWidth={7} fill="none" strokeLinecap="round" />
      {lidK < .9 && <path d={`M${cx - rx * .6},${cy + ry + 3} Q${cx},${cy + ry + 7} ${cx + rx * .6},${cy + ry + 3}`} stroke="#c58a6e" strokeWidth={3} fill="none" strokeLinecap="round" />}
    </g>); };
  const brow = (side: -1 | 1) => { const k = side < 0 ? e.bl : e.br, cx = side * 42, y = -40 + e.by;
    return <path key={'b' + side} d={`M${cx - 26 * side},${y + k * 10} Q${cx},${y - 12 - k * 4} ${cx + 26 * side},${y - k * 12}`} stroke={L.hair} strokeWidth={10} fill="none" strokeLinecap="round" />; };
  const my = 62, mw = 22 + op * 6;
  return (<g>
    {[-1, 1].map(s => eyeG(s as -1 | 1))}{brow(-1)}{brow(1)}
    <path d="M-3,32 Q2,40 -5,44" stroke={L.skinSh} strokeWidth={4} fill="none" strokeLinecap="round" />
    {blush > 0 && <g opacity={blush * .6}><ellipse cx={-62} cy={42} rx={18} ry={9} fill="#ff7a8a" /><ellipse cx={62} cy={42} rx={18} ry={9} fill="#ff7a8a" /></g>}
    {op > .06 ? <g><path d={`M${-mw},${my - 2} Q0,${my - 6 - curve * 8} ${mw},${my - 2} Q${mw * .8},${my + op * 34} 0,${my + op * 38} Q${-mw * .8},${my + op * 34} ${-mw},${my - 2} Z`} fill="#5a1d24" />
      <ellipse cx={0} cy={my + op * 26} rx={mw * .5} ry={op * 9} fill="#e4707a" /></g>
      : <path d={`M${-18},${my} Q0,${my + curve * 16} 18,${my - curve * 2}`} stroke="#5a2a2a" strokeWidth={5} fill="none" strokeLinecap="round" />}
    {sweat > 0 && <path d={`M95,-30 q10,22 0,30 q-10,-8 0,-30z`} fill="#9fe3ff" opacity={sweat} />}
  </g>); };

const Hair: React.FC<{ L: typeof LOOK.max; t: number }> = ({ L, t }) => { const w = noise('hair', t, .8) * 3;
  return (<g>
    <path d={`M-104,10 C-118,-70 -80,-128 -20,-132 C40,-138 104,-108 108,-30 L112,8 C96,-30 86,-44 70,-52 L76,-18 C58,-44 40,-58 18,-62 L22,-30 C4,-52 -16,-58 -34,-56 L-30,-26 C-48,-46 -62,-50 -76,-44 L-80,-6 C-90,-20 -96,-10 -104,10 Z`} fill={L.hair} />
    <path d={`M-40,-128 L-62,-${168 + w} L-10,-134 L10,-${172 - w} L36,-132 L78,-${150 + w} L70,-110 Z`} fill={L.hair} />
    <path d="M-30,-118 C0,-126 40,-120 70,-96" stroke={L.hairHi} strokeWidth={9} fill="none" strokeLinecap="round" opacity={.8} />
  </g>); };

export const Pan: React.FC<{ glow?: number; t?: number }> = ({ glow = 0, t = 0 }) => (<g>
  {glow > 0 && <ellipse cx={0} cy={-150} rx={150} ry={150} fill="url(#panGlow)" opacity={glow} />}
  <defs><radialGradient id="panGlow"><stop offset="0" stopColor="#ffe27a" stopOpacity=".9" /><stop offset="1" stopColor="#ffb020" stopOpacity="0" /></radialGradient></defs>
  <rect x={-12} y={-90} width={24} height={110} rx={10} fill="#4a2f22" /><rect x={-8} y={-84} width={6} height={96} rx={3} fill="#6e4a36" />
  <ellipse cx={0} cy={-170} rx={92} ry={88} fill="#2a2c33" /><ellipse cx={0} cy={-172} rx={76} ry={72} fill="#3b3e48" />
  <ellipse cx={-22} cy={-196} rx={30} ry={18} fill="#ffffff" opacity={.18} transform="rotate(-30 -22 -196)" />
  {glow > 0 && <ellipse cx={0} cy={-170} rx={92} ry={88} fill="none" stroke="#ffd23f" strokeWidth={6} opacity={glow * (.7 + .3 * Math.sin(t * 9))} />}
</g>);
export const PhoneProp: React.FC<{ lit?: number }> = ({ lit = 1 }) => (<g><rect x={-30} y={-58} width={60} height={112} rx={10} fill="#111" /><rect x={-25} y={-50} width={50} height={94} rx={6} fill={lit ? '#4ad0ff' : '#111'} opacity={.9} /></g>);
export const Burger: React.FC = () => (<g><path d="M-50,0 Q-50,-44 0,-46 Q50,-44 50,0 Z" fill="#e0a050" /><rect x={-54} y={0} width={108} height={12} rx={6} fill="#5ab04a" /><rect x={-52} y={10} width={104} height={16} rx={8} fill="#6b3b22" /><path d="M-50,26 L50,26 Q48,44 0,46 Q-48,44 -50,26 Z" fill="#d99848" />
  {[-25, 0, 22].map(x => <ellipse key={x} cx={x} cy={-30} rx={4} ry={2.5} fill="#fff3c8" />)}</g>);

export const Cola: React.FC = () => (<g><path d="M-26,70 L-26,-30 Q-26,-56 -12,-70 L-12,-92 L12,-92 L12,-70 Q26,-56 26,-30 L26,70 Q26,80 16,80 L-16,80 Q-26,80 -26,70 Z" fill="#5a1a14" opacity={.92} />
  <rect x={-28} y={-6} width={56} height={46} fill="#e5383b" /><text x={0} y={24} fontSize={17} fontWeight={900} textAnchor="middle" fill="#fff" fontFamily="Mont">КОЛА</text>
  <rect x={-14} y={-104} width={28} height={14} rx={4} fill="#e5383b" /><path d="M-16,-40 L-16,60" stroke="#fff" strokeWidth={5} opacity={.3} /></g>);
export const Doner: React.FC = () => (<g><path d="M-46,-60 Q0,-100 46,-60 L30,80 Q0,96 -30,80 Z" fill="#e8c890" />
  <path d="M-40,-62 Q-20,-84 0,-70 Q20,-88 40,-62 L36,-40 Q0,-56 -36,-40 Z" fill="#8a4a2a" />{[-24, 0, 22].map(x => <ellipse key={x} cx={x} cy={-70} rx={10} ry={6} fill="#5ab04a" />)}
  <ellipse cx={-10} cy={-58} rx={8} ry={5} fill="#e5383b" />
  <path d="M-38,0 L38,0 L30,80 Q0,96 -30,80 Z" fill="#ffffff" /><path d="M-36,18 L36,18 M-34,40 L34,40 M-32,62 L32,62" stroke="#e5383b" strokeWidth={8} /></g>);
const Hand: React.FC<{ x: number; y: number; a: number; skin: string; sh: string; fist?: boolean }> = ({ x, y, a, skin, sh, fist }) => (
  <g transform={`translate(${x},${y}) rotate(${-a * 180 / Math.PI})`}>
    <ellipse cx={0} cy={12} rx={20} ry={22} fill={skin} />
    {!fist && <path d="M-16,22 Q-14,40 -8,40 Q-4,40 -4,26 M0,26 Q0,44 6,44 Q11,44 10,26 M10,24 Q14,38 18,36 Q22,34 18,20" fill={skin} stroke={sh} strokeWidth={2} />}
    <ellipse cx={19} cy={4} rx={8} ry={14} fill={skin} transform="rotate(-30 19 4)" />
    <path d="M-12,18 Q0,26 12,18" stroke={sh} strokeWidth={2.5} fill="none" />
  </g>);

export const Person: React.FC<PersonProps> = (p) => {
  const L = LOOK[p.look ?? 'max'], s = p.s ?? 1, t = p.t;
  const base = POSES.stand, P: Pose = { ...base, ...(p.pose || {}) } as Pose;
  const br = Math.sin(t * 2.2 + p.x * .01) * 3, sq = p.squash ?? 0;
  const hipY = -268 + (P.hip ?? 0), shY = -482 + br, lean = P.lean ?? 0;
  const thigh = 136, shin = 132, up = 116, fore = 108;
  const leg = (side: -1 | 1, l: Limb) => { const hp: [number, number] = [side * 34, hipY], kn = pt(hp[0], hp[1], l[0], thigh), an = pt(kn[0], kn[1], l[0] + l[1], shin);
    const fa = l[0] + l[1];
    return (<g key={'l' + side}>{seg(hp, kn, 66, 54, L.pants, 'th')}{seg(kn, an, 54, 46, L.pants, 'sh')}
      <g transform={`translate(${an[0]},${an[1]}) rotate(${-fa * 180 / Math.PI})`}><path d={`M-26,-8 L${side * 52},-6 Q${side * 62},14 ${side * 46},22 L-28,22 Q-34,6 -26,-8 Z`} fill={L.shoe} /><rect x={side > 0 ? -28 : -48 + 2} y={16} width={74} height={9} rx={4} fill={L.shoeSole} /></g></g>); };
  const arm = (side: -1 | 1, l: Limb, front: boolean) => { const sp: [number, number] = [side * 74, shY + 14], el = pt(sp[0], sp[1], l[0], up), wr = pt(el[0], el[1], l[0] + l[1], fore);
    const fa = l[0] + l[1]; const holdIt = front && p.hold;
    return (<g key={'a' + side}>{seg(sp, el, 54, 46, L.top, 'u')}{seg(el, wr, 46, 40, L.top, 'f')}
      <path d={`M${el[0]},${el[1]} L${wr[0]},${wr[1]}`} stroke={L.topSh} strokeWidth={8} opacity={.35} />
      {holdIt && <g transform={`translate(${wr[0] + Math.sin(fa) * 26},${wr[1] + Math.cos(fa) * 26}) rotate(${-fa * 180 / Math.PI + 180})`}>
        {p.hold === 'pan' ? <Pan glow={p.panGlow} t={t} /> : p.hold === 'phone' ? <g transform="translate(0,-40)"><PhoneProp /></g> : p.hold === 'cola' ? <g transform="translate(0,-50)"><Cola /></g> : p.hold === 'doner' ? <g transform="translate(0,-60)"><Doner /></g> : <g transform="translate(0,-40)"><Burger /></g>}</g>}
      <Hand x={wr[0]} y={wr[1]} a={fa} skin={L.skin} sh={L.skinSh} fist={!!holdIt} /></g>); };
  const headY = shY - 128, ht = (p.headTilt ?? 0) + noise('ht' + p.x, t, .3) * 2.5;
  const isCourier = p.look === 'courier';
  return (<g transform={`translate(${p.x},${p.y}) rotate(${p.rot ?? 0}) scale(${(p.flip ? -1 : 1) * s * (1 + sq * .12)},${s * (1 - sq * .15)})`}>
    {p.shadow !== false && <ellipse cx={0} cy={6} rx={130} ry={20} fill="#000" opacity={.22} />}
    <g transform={`rotate(${lean * 57} 0 ${hipY})`}>
      {leg(-1, P.legL)}{leg(1, P.legR)}
      {arm(-1, P.armL, false)}
      {/* торс-худи */}
      <path d={`M-84,${shY + 4} Q0,${shY - 24} 84,${shY + 4} L96,${hipY + 10} Q0,${hipY + 30} -96,${hipY + 10} Z`} fill={L.top} />
      <path d={`M40,${shY} Q70,${shY + 60} 86,${hipY + 8} L96,${hipY + 10} L84,${shY + 4} Z`} fill={L.topSh} opacity={.7} />
      <path d={`M-96,${hipY - 14} Q0,${hipY + 6} 96,${hipY - 14} L96,${hipY + 10} Q0,${hipY + 30} -96,${hipY + 10} Z`} fill={L.topSh} />
      {!isCourier ? <><path d={`M-50,${hipY - 70} L50,${hipY - 70} L60,${hipY - 22} L-60,${hipY - 22} Z`} fill={L.topSh} opacity={.7} />
        <path d={`M-14,${shY + 6} L-20,${shY + 90} M14,${shY + 6} L20,${shY + 90}`} stroke="#e8e8e8" strokeWidth={6} strokeLinecap="round" /></>
        : <g transform={`translate(0,${shY + 90})`}><path d="M0,-26 L8,-8 L28,-8 L12,4 L18,24 L0,12 L-18,24 L-12,4 L-28,-8 L-8,-8 Z" fill="#ffd23f" /></g>}
      {/* шея, капюшон */}
      <rect x={-22} y={headY + 70} width={44} height={60} fill={L.skinSh} />
      {!isCourier && <path d={`M-78,${shY + 8} Q-70,${shY - 40} 0,${shY - 30} Q70,${shY - 40} 78,${shY + 8} Q40,${shY - 6} 0,${shY - 2} Q-40,${shY - 6} -78,${shY + 8} Z`} fill={L.topHi} />}
      <g transform={`translate(0,${headY}) rotate(${ht})`}>
        {!isCourier ? <>
          <path d="M-100,-20 C-104,-100 -50,-128 0,-128 C50,-128 104,-100 100,-20 C98,40 70,84 24,98 Q0,104 -24,98 C-70,84 -98,40 -100,-20 Z" fill={L.skin} />
          <ellipse cx={-100} cy={10} rx={14} ry={22} fill={L.skin} /><ellipse cx={100} cy={10} rx={14} ry={22} fill={L.skin} />
          <path d="M-70,58 C-56,86 -30,98 0,100 C30,98 56,86 70,58" stroke="#8a6a5a" strokeWidth={10} fill="none" opacity={.13} strokeDasharray="2 7" strokeLinecap="round" />
          <Face t={t} expr={p.expr ?? 'neutral'} mouth={p.mouth} eye={p.eye} lid={p.lid} noBlink={p.noBlink} L={L} seed={Math.round(p.x)} sweat={p.sweat} blush={p.blush} />
          <Hair L={L} t={t} />
        </> : <>
          <path d="M-112,10 C-118,-96 -60,-140 0,-140 C60,-140 118,-96 112,10 C110,60 80,96 0,100 C-80,96 -110,60 -112,10 Z" fill="#5a2fd4" />
          <path d="M-98,-30 Q0,-60 98,-30 L92,52 Q0,80 -92,52 Z" fill="#0b0820" />
          <path d="M-60,-40 Q-10,-50 30,-44" stroke="#fff" strokeWidth={8} opacity={.35} fill="none" strokeLinecap="round" />
          <path d="M-112,-6 Q0,-24 112,-6" stroke="#7a55ff" strokeWidth={10} fill="none" />
        </>}
      </g>
      {arm(1, P.armR, true)}
    </g></g>); };
