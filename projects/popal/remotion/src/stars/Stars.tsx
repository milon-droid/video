// Звёзды в стиле «ПОПАЛ» (аниме-риг, рост ≈ 3,6 головы): Сэди Синк и Винисиус Жуниор, образ 2026.
// Начало координат — между ступнями. Углы конечностей — от вертикали вниз, плюс = в сторону +x экрана (как в Person.tsx).
// Сэди 2026: рыжие волны до плеч, лёгкая шторка-чёлка с пробором по центру, веснушки, чёрное платье-комбинация.
// Вини 2026 (после ЧМ-2026): первая борода, чёткий подбородок, короткие твисты с фейдом, белая форма №7, яркие бутсы.
import React from 'react';
import { clamp, lerp, noise } from '../anim';
import { Expr, Face, Limb, Pose, POSES } from '../chars/Person';

type P2 = [number, number];
const pt = (x: number, y: number, a: number, l: number): P2 => [x + Math.sin(a) * l, y + Math.cos(a) * l];
const seg = (a: P2, b: P2, wa: number, wb: number, fill: string, key: string) => {
  const d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, nx = -(b[1] - a[1]) / d, ny = (b[0] - a[0]) / d;
  return <g key={key}><path d={`M${a[0] + nx * wa / 2},${a[1] + ny * wa / 2} L${b[0] + nx * wb / 2},${b[1] + ny * wb / 2} L${b[0] - nx * wb / 2},${b[1] - ny * wb / 2} L${a[0] - nx * wa / 2},${a[1] - ny * wa / 2} Z`} fill={fill} />
    <circle cx={b[0]} cy={b[1]} r={wb / 2} fill={fill} /><circle cx={a[0]} cy={a[1]} r={wa / 2} fill={fill} /></g>; };
const lp = (a: P2, b: P2, k: number): P2 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];

export const THIGH = 136, SHIN = 132, UP = 116, FORE = 108;
const HIP_Y = -268, SH_Y = -482;
// точки ноги в координатах фигуры (для мяча у стопы/колена)
export const legPts = (side: -1 | 1, l: Limb) => { const hp: P2 = [side * 34, HIP_Y], kn = pt(hp[0], hp[1], l[0], THIGH), an = pt(kn[0], kn[1], l[0] + l[1], SHIN); return { hp, kn, an }; };

const Hand: React.FC<{ x: number; y: number; a: number; skin: string; sh: string; open?: boolean; nails?: string }> = ({ x, y, a, skin, sh, open = true, nails }) => (
  <g transform={`translate(${x},${y}) rotate(${-a * 180 / Math.PI})`}>
    <ellipse cx={0} cy={12} rx={19} ry={21} fill={skin} />
    {open && <path d="M-16,22 Q-14,40 -8,40 Q-4,40 -4,26 M0,26 Q0,44 6,44 Q11,44 10,26 M10,24 Q14,38 18,36 Q22,34 18,20" fill={skin} stroke={sh} strokeWidth={2} />}
    {open && nails && [[-8, 38], [6, 42], [17, 34]].map(([nx, ny], i) => <ellipse key={i} cx={nx} cy={ny} rx={3.5} ry={3} fill={nails} />)}
    <ellipse cx={19} cy={4} rx={8} ry={14} fill={skin} transform="rotate(-30 19 4)" />
    <path d="M-12,18 Q0,26 12,18" stroke={sh} strokeWidth={2.5} fill="none" />
  </g>);

type StarProps = { x: number; y: number; s?: number; t: number; pose?: Partial<Pose>; expr?: Expr; mouth?: number; eye?: [number, number]; headTilt?: number; lid?: number; flip?: boolean; teeth?: boolean; shadow?: number };
const blendIn = (p?: Partial<Pose>): Pose => ({ ...POSES.stand, ...(p || {}) } as Pose);

// ═════════ Винисиус Жуниор ═════════
const VJ = { skin: '#6e4632', skinSh: '#53321f', skinHi: '#8a5a40', hair: '#151011', hairHi: '#4a3226', iris: '#2a1810',
  kit: '#f6f6f3', kitSh: '#d3d6de', gold: '#d2a640', navy: '#1d2a5c', boot: '#ff5a2a', bootSole: '#ffe14a' };
export const Vini: React.FC<StarProps> = (p) => {
  const L = VJ, s = p.s ?? 1, t = p.t, P = blendIn(p.pose);
  const br = Math.sin(t * 2.4 + 1) * 3, hipY = HIP_Y + (P.hip ?? 0), shY = SH_Y + br, lean = P.lean ?? 0;
  const FL = { skin: L.skin, skinSh: L.skinSh, hair: L.hair, iris: L.iris } as any;
  const leg = (side: -1 | 1, l: Limb) => { const { hp, kn, an } = legPts(side, l), hpp: P2 = [hp[0], hipY], fa = l[0] + l[1];
    const sockTop = lp(kn, an, .3);
    return (<g key={'l' + side}>{seg(hpp, kn, 62, 50, L.skin, 'th')}{seg(kn, an, 50, 42, L.skin, 'sh')}
      {seg(hpp, lp(hpp, kn, .55), 92, 80, L.kit, 'shorts')}{seg(lp(hpp, kn, .4), lp(hpp, kn, .55), 82, 80, L.kitSh, 'shH')}
      {seg(sockTop, an, 54, 46, L.kit, 'sock')}
      <g transform={`translate(${an[0]},${an[1]}) rotate(${-fa * 180 / Math.PI})`}>
        <path d={`M-26,-10 L${side * 54},-6 Q${side * 66},14 ${side * 48},22 L-28,22 Q-34,6 -26,-10 Z`} fill={L.boot} />
        <path d={`M${side * 6},-6 L${side * 40},4`} stroke="#fff" strokeWidth={6} strokeLinecap="round" opacity={.9} />
        <rect x={side > 0 ? -30 : -46} y={17} width={76} height={9} rx={4} fill={L.bootSole} />
        {[-14, 8, 30].map(c => <rect key={c} x={side * c - 4} y={25} width={8} height={7} rx={2} fill={L.bootSole} />)}</g></g>); };
  const arm = (side: -1 | 1, l: Limb) => { const sp: P2 = [side * 76, shY + 16], el = pt(sp[0], sp[1], l[0], UP), wr = pt(el[0], el[1], l[0] + l[1], FORE), fa = l[0] + l[1], sl = lp(sp, el, .55);
    return (<g key={'a' + side}>{seg(sp, el, 46, 40, L.skin, 'u')}{seg(el, wr, 40, 34, L.skin, 'f')}
      {seg(sp, sl, 60, 56, L.kit, 'sl')}
      <Hand x={wr[0]} y={wr[1]} a={fa} skin={L.skin} sh={L.skinSh} /></g>); };
  const headY = shY - 128, ht = (p.headTilt ?? 0) + noise('vht', t, .3) * 2.5;
  return (<g transform={`translate(${p.x},${p.y}) scale(${(p.flip ? -1 : 1) * s},${s})`}>
    <ellipse cx={0} cy={6} rx={130} ry={20} fill="#000" opacity={p.shadow ?? .28} />
    <g transform={`rotate(${lean * 57} 0 ${hipY})`}>
      {leg(-1, P.legL)}{leg(1, P.legR)}
      {arm(-1, P.armL)}
      {/* майка */}
      <path d={`M-86,${shY + 4} Q0,${shY - 24} 86,${shY + 4} L94,${hipY + 4} Q0,${hipY + 22} -94,${hipY + 4} Z`} fill={L.kit} />
      <path d={`M42,${shY} Q72,${shY + 60} 86,${hipY + 2} L94,${hipY + 4} L86,${shY + 4} Z`} fill={L.kitSh} />
      <path d={`M-92,${hipY - 40} L-94,${hipY + 4} M92,${hipY - 40} L94,${hipY + 4}`} stroke={L.navy} strokeWidth={8} />
      <path d={`M-90,${hipY - 6} Q0,${hipY + 14} 90,${hipY - 6}`} stroke={L.kitSh} strokeWidth={6} fill="none" />
      {/* V-ворот: тёмно-синий с золотом */}
      <path d={`M-34,${shY - 8} L0,${shY + 44} L34,${shY - 8}`} fill={L.skinSh} />
      <path d={`M-38,${shY - 10} L0,${shY + 46} L38,${shY - 10}`} stroke={L.navy} strokeWidth={11} fill="none" strokeLinejoin="round" />
      <path d={`M-38,${shY - 10} L0,${shY + 46} L38,${shY - 10}`} stroke={L.gold} strokeWidth={3} fill="none" strokeLinejoin="round" />
      {/* номер 7 на груди */}
      <text x={-44} y={shY + 104} fontSize={56} fontWeight={900} fill={L.navy} textAnchor="middle" fontFamily="Mont">7</text>
      <path d={`M30,${shY + 64} l12,-6 l12,6 l0,14 q-12,12 -24,0 z`} fill={L.gold} opacity={.9} />
      {/* шея, голова */}
      <rect x={-22} y={headY + 70} width={44} height={58} fill={L.skinSh} />
      <g transform={`translate(0,${headY}) rotate(${ht})`}>
        <ellipse cx={-100} cy={8} rx={14} ry={22} fill={L.skin} /><ellipse cx={100} cy={8} rx={14} ry={22} fill={L.skin} />
        {/* чёткий подбородок 2026 */}
        <path d="M-100,-20 C-104,-100 -50,-128 0,-128 C50,-128 104,-100 100,-20 C100,34 84,72 46,94 L22,106 Q0,112 -22,106 L-46,94 C-84,72 -100,34 -100,-20 Z" fill={L.skin} />
        <path d="M-80,-60 Q-90,-20 -84,30" stroke={L.skinHi} strokeWidth={10} fill="none" opacity={.35} strokeLinecap="round" />
        {/* борода: впервые в карьере (2026) */}
        <path d="M-99,-2 C-98,46 -80,80 -46,96 L-22,108 Q0,114 22,108 L46,96 C80,80 98,46 99,-2 L88,2 C84,34 66,52 38,50 Q0,40 -38,50 C-66,52 -84,34 -88,2 Z" fill={L.hair} opacity={.88} />
        <path d="M-32,48 Q0,36 32,48" stroke={L.hair} strokeWidth={9} fill="none" strokeLinecap="round" />
        <Face t={t} expr={p.expr ?? 'neutral'} mouth={p.mouth} eye={p.eye} lid={p.lid} L={FL} seed={7} />
        {p.teeth && <path d="M-20,59 Q0,54 20,59 Q0,70 -20,59 Z" fill="#fbf8f2" />}
        {/* твисты сверху, фейд по бокам */}
        <path d="M-100,-10 C-104,-60 -96,-92 -80,-104 L-82,-40 Z M100,-10 C104,-60 96,-92 80,-104 L82,-40 Z" fill={L.hair} opacity={.45} />
        <path d="M-90,-58 C-96,-112 -50,-140 0,-140 C50,-140 96,-112 90,-58 C76,-84 46,-92 0,-92 C-46,-92 -76,-84 -90,-58 Z" fill={L.hair} />
        {Array.from({ length: 15 }, (_, i) => { const a = -Math.PI + .28 + i * (Math.PI - .56) / 14, r = 104 + (i % 2) * 8, cx = Math.cos(a) * r * .9, cy = -62 + Math.sin(a) * r * .72 + noise('tw' + i, t, .6) * 1.5;
          return <g key={i}><circle cx={cx} cy={cy} r={15} fill={L.hair} /><circle cx={cx - 4} cy={cy - 5} r={5} fill={L.hairHi} opacity={.8} /></g>; })}
      </g>
      {arm(1, P.armR)}
    </g></g>); };

// ═════════ Сэди Синк ═════════
const SS = { skin: '#f8ddc9', skinSh: '#e6b49a', hair: '#b8442a', hairSh: '#8a2e1c', hairHi: '#f08a5a', iris: '#5d8fae', brow: '#9a4a2e',
  dress: '#16141c', dressHi: '#3a3546', dressSh: '#0a090e', gold: '#e8c46a', lips: '#c4485a', nails: '#b8304a' };
export const Sadie: React.FC<StarProps> = (p) => {
  const L = SS, s = p.s ?? 1, t = p.t, P = blendIn(p.pose);
  const br = Math.sin(t * 2.1) * 2.6, hipY = HIP_Y + (P.hip ?? 0), shY = SH_Y + 8 + br, lean = P.lean ?? 0;
  const FL = { skin: L.skin, skinSh: L.skinSh, hair: L.hair, iris: L.iris, fem: true, brow: L.brow } as any;
  const w = noise('ssh', t, .7) * 8, w2 = noise('ssh2', t, .55) * 6;
  const leg = (side: -1 | 1, l: Limb) => { const { hp, kn, an } = legPts(side, l), hpp: P2 = [side * 28, hipY], fa = l[0] + l[1];
    return (<g key={'l' + side}>{seg(hpp, kn, 54, 40, L.skin, 'th')}{seg(kn, an, 40, 30, L.skin, 'sh')}
      <path d={`M${kn[0] - 6},${kn[1] + 10} L${an[0] - 4},${an[1] - 10}`} stroke={L.skinSh} strokeWidth={5} opacity={.4} strokeLinecap="round" />
      <g transform={`translate(${an[0]},${an[1]}) rotate(${-fa * 180 / Math.PI})`}>
        <path d={`M-18,-12 L${side * 46},8 Q${side * 56},16 ${side * 40},20 L-16,14 Q-24,0 -18,-12 Z`} fill="#0e0c12" />
        <path d={`M-14,-6 L${side * 30},6`} stroke={L.skin} strokeWidth={6} strokeLinecap="round" />
        <path d={`M${side > 0 ? -18 : 10},12 L${side > 0 ? -16 : 12},30 L${side > 0 ? -8 : 4},30 L${side > 0 ? -6 : 0},14 Z`} fill="#0e0c12" /></g></g>); };
  const arm = (side: -1 | 1, l: Limb) => { const sp: P2 = [side * 64, shY + 18], el = pt(sp[0], sp[1], l[0], UP), wr = pt(el[0], el[1], l[0] + l[1], FORE), fa = l[0] + l[1];
    return (<g key={'a' + side}>{seg(sp, el, 40, 32, L.skin, 'u')}{seg(el, wr, 32, 26, L.skin, 'f')}
      {side > 0 && <circle cx={lp(el, wr, .82)[0]} cy={lp(el, wr, .82)[1]} r={15} fill="none" stroke={L.gold} strokeWidth={5} />}
      <Hand x={wr[0]} y={wr[1]} a={fa} skin={L.skin} sh={L.skinSh} nails={L.nails} /></g>); };
  const headY = shY - 132, ht = (p.headTilt ?? 0) + noise('sht', t, .3) * 2.5;
  // волосы сзади: волны до плеч, качаются
  const back = `M-104,${headY - 30} C-130,${headY + 60} ${-138 + w},${shY - 10} ${-126 + w},${shY + 50} q${18},${22} ${36},${6} q${16},${24} ${40},${8} L${70 + w2},${shY + 66} q${22},${20} ${40},${-4} q${18},${14} ${22},${-24} C${140 + w2},${shY - 20} 130,${headY + 60} 104,${headY - 30} Z`;
  return (<g transform={`translate(${p.x},${p.y}) scale(${(p.flip ? -1 : 1) * s},${s})`}>
    <ellipse cx={0} cy={6} rx={110} ry={18} fill="#000" opacity={p.shadow ?? .28} />
    <g transform={`rotate(${lean * 57} 0 ${hipY})`}>
      <path d={back} fill={L.hairSh} />
      {leg(-1, P.legL)}{leg(1, P.legR)}
      {arm(-1, P.armL)}
      {/* открытые плечи, ключицы */}
      <path d={`M-70,${shY + 10} Q0,${shY - 18} 70,${shY + 10} L64,${shY + 60} L-64,${shY + 60} Z`} fill={L.skin} />
      <path d={`M-46,${shY + 22} Q-22,${shY + 30} -8,${shY + 26} M46,${shY + 22} Q22,${shY + 30} 8,${shY + 26}`} stroke={L.skinSh} strokeWidth={4} fill="none" strokeLinecap="round" />
      {/* колье */}
      <path d={`M-30,${shY + 4} Q0,${shY + 44} 30,${shY + 4}`} stroke={L.gold} strokeWidth={3} fill="none" /><circle cx={0} cy={shY + 30} r={6} fill={L.gold} />
      {/* платье-комбинация: лиф, талия, юбка до колен */}
      <path d={`M-60,${shY + 50} Q-30,${shY + 40} 0,${shY + 58} Q30,${shY + 40} 60,${shY + 50} Q66,${hipY - 120} 50,${hipY - 70} Q86,${hipY - 20} ${96 + w2 * .6},${hipY + 140} Q0,${hipY + 156} ${-96 + w * .4},${hipY + 140} Q-86,${hipY - 20} -50,${hipY - 70} Q-66,${hipY - 120} -60,${shY + 50} Z`} fill={L.dress} />
      <path d={`M24,${shY + 54} Q56,${shY + 110} 48,${hipY - 70} Q80,${hipY - 20} ${90 + w2 * .6},${hipY + 138} L${96 + w2 * .6},${hipY + 140} Q86,${hipY - 20} 50,${hipY - 70} Q66,${hipY - 120} 60,${shY + 50} Z`} fill={L.dressSh} />
      <path d={`M-30,${hipY - 40} Q-40,${hipY + 40} -46,${hipY + 140} M18,${hipY - 30} Q24,${hipY + 50} 30,${hipY + 146}`} stroke={L.dressHi} strokeWidth={6} fill="none" opacity={.7} strokeLinecap="round" />
      <path d={`M-56,${shY + 52} Q-30,${shY + 42} 0,${shY + 60} Q30,${shY + 42} 56,${shY + 52}`} stroke={L.dressHi} strokeWidth={5} fill="none" />
      <path d={`M-46,${shY + 50} L-50,${shY + 8} M46,${shY + 50} L50,${shY + 8}`} stroke={L.dress} strokeWidth={4} />
      {/* шея, голова */}
      <rect x={-18} y={headY + 72} width={36} height={60} fill={L.skinSh} />
      <g transform={`translate(0,${headY}) rotate(${ht})`}>
        <ellipse cx={-94} cy={10} rx={12} ry={20} fill={L.skin} /><ellipse cx={94} cy={10} rx={12} ry={20} fill={L.skin} />
        <circle cx={-94} cy={36} r={7} fill={L.gold} /><circle cx={94} cy={36} r={7} fill={L.gold} />
        <path d="M-94,-20 C-98,-100 -50,-128 0,-128 C50,-128 98,-100 94,-20 C92,34 64,78 22,94 Q0,100 -22,94 C-64,78 -92,34 -94,-20 Z" fill={L.skin} />
        <Face t={t} expr={p.expr ?? 'neutral'} mouth={p.mouth} eye={p.eye} lid={p.lid} L={FL} seed={11} blush={.45} />
        {/* веснушки */}
        {[[-62, 30], [-50, 40], [-70, 44], [-40, 30], [-56, 52], [62, 30], [50, 40], [70, 44], [40, 30], [56, 52], [-10, 30], [8, 28], [-2, 38]].map(([fx, fy], i) =>
          <circle key={i} cx={fx} cy={fy} r={i > 9 ? 2.6 : 3.4} fill="#c7764e" opacity={.65} />)}
        <path d="M-92,-64 C-94,-120 -50,-136 0,-136 C50,-136 94,-120 92,-64 Q0,-112 -92,-64 Z" fill={L.hair} />
        {/* волосы спереди: пробор по центру, шторка-чёлка, пряди вдоль лица */}
        <path d={`M2,-132 C-60,-136 -108,-96 -104,-20 C-106,40 ${-112 + w * .4},90 ${-100 + w * .5},130 L-80,120 C-90,60 -88,10 -78,-30 C-66,-60 -40,-68 -22,-60 C-30,-84 -14,-110 2,-132 Z`} fill={L.hair} />
        <path d={`M-2,-132 C60,-136 108,-96 104,-20 C106,40 ${112 + w2 * .4},90 ${100 + w2 * .5},130 L80,120 C90,60 88,10 78,-30 C66,-60 40,-68 22,-60 C30,-84 14,-110 -2,-132 Z`} fill={L.hair} />
        <path d="M-4,-128 C-30,-118 -70,-100 -84,-56 M4,-128 C30,-118 70,-100 84,-56" stroke={L.hairHi} strokeWidth={8} fill="none" opacity={.6} strokeLinecap="round" />
        <path d={`M-92,0 C-96,40 ${-96 + w * .4},80 ${-90 + w * .5},116 M92,0 C96,40 ${96 + w2 * .4},80 ${90 + w2 * .5},116`} stroke={L.hairSh} strokeWidth={6} fill="none" opacity={.6} strokeLinecap="round" />
        <path d="M0,-132 L0,-112" stroke={L.skinSh} strokeWidth={3} opacity={.6} />
      </g>
      {arm(1, P.armR)}
    </g></g>); };

// ═════════ мяч ═════════
export const Ball: React.FC<{ x: number; y: number; r?: number; rot?: number; blur?: number }> = ({ x, y, r = 34, rot = 0, blur = 0 }) => (
  <g transform={`translate(${x},${y}) rotate(${rot})`}>
    <defs><radialGradient id="ballSh" cx=".35" cy=".3" r=".8"><stop offset="0" stopColor="#ffffff" /><stop offset=".6" stopColor="#e9ecf2" /><stop offset="1" stopColor="#9aa2b4" /></radialGradient>
      <clipPath id="ballClip"><circle r={r} /></clipPath></defs>
    {blur > 0 && <ellipse cx={-r * blur} cy={0} rx={r * (1 + blur)} ry={r * .9} fill="#fff" opacity={.25} />}
    <circle r={r} fill="url(#ballSh)" />
    <g clipPath="url(#ballClip)" fill="#1d2233">
      {[[0, 0, .42], [r * .95, -r * .3, .34], [-r * .9, -r * .35, .34], [r * .55, r * .85, .34], [-r * .55, r * .85, .34], [0, -r * 1.05, .34]].map(([cx, cy, k], i) =>
        <path key={i} d={Array.from({ length: 5 }, (_, j) => { const a = -Math.PI / 2 + j * 2 * Math.PI / 5; return `${j ? 'L' : 'M'}${cx + Math.cos(a) * r * k},${cy + Math.sin(a) * r * k}`; }).join(' ') + 'Z'} />)}
    </g>
    <circle r={r} fill="none" stroke="#1d2233" strokeWidth={r * .05} opacity={.5} />
  </g>);

export const smooth = (a: number, b: number, t: number) => { const k = clamp((t - a) / (b - a)); return k * k * (3 - 2 * k); };
