// Персонаж «Блэкаута»: плоская вырезанная фигурка на SVG, но с реалистичными пропорциями (голова ≈ 1/5 корпуса),
// формой лица (скулы, челюсть), миндалевидными глазами с веками, одеждой с деталями и складками, руками с локтем (IK)
// и кистью с пальцами. Начало координат — основание шеи. Всё анимируется от t (дыхание, моргание, микродвижения).
import React, { useId } from 'react';
import { blink, clamp, lerp, mix, noise } from '../anim';
import { Hand, HandPose } from './Hand';

export type Who = 'dias' | 'diasT' | 'diasJ' | 'beka' | 'alik' | 'anchor' | 'alisher' | 'oldman' | 'driver';
type Look = { skin: string; skinSh: string; hair: string; style: 'styled' | 'buzz' | 'curly' | 'bun' | 'beanie'; outfit: 'shirt' | 'tee' | 'track' | 'flannel' | 'blazer' | 'puffer' | 'jacket'; top: string; topSh: string; sw: number; neck: number; head: number; glasses?: boolean; iris: string };
export const LOOKS: Record<Who, Look> = {
  dias: { skin: '#E3AC84', skinSh: '#C68863', hair: '#1E1A20', style: 'styled', outfit: 'shirt', top: '#DDE8F3', topSh: '#AFC1D6', sw: 116, neck: 26, head: 1, glasses: true, iris: '#3A2618' },
  diasT: { skin: '#E3AC84', skinSh: '#C68863', hair: '#1E1A20', style: 'styled', outfit: 'tee', top: '#F2EFE8', topSh: '#CBC4B6', sw: 116, neck: 26, head: 1, glasses: true, iris: '#3A2618' },
  beka: { skin: '#C98C62', skinSh: '#A86E48', hair: '#231C18', style: 'buzz', outfit: 'track', top: '#25357E', topSh: '#18235A', sw: 138, neck: 16, head: 1.03, iris: '#2A1A10' },
  alik: { skin: '#E8B992', skinSh: '#CC9670', hair: '#3A2316', style: 'curly', outfit: 'flannel', top: '#A9402B', topSh: '#76291B', sw: 102, neck: 36, head: .96, iris: '#4A3020' },
  diasJ: { skin: '#E3AC84', skinSh: '#C68863', hair: '#1E1A20', style: 'styled', outfit: 'jacket', top: '#2B3A55', topSh: '#1B2640', sw: 118, neck: 26, head: 1, glasses: true, iris: '#3A2414' },
  alisher: { skin: '#D6A27C', skinSh: '#B5825E', hair: '#1B1716', style: 'beanie', outfit: 'puffer', top: '#6B7A3E', topSh: '#46522A', sw: 112, neck: 34, head: .97, iris: '#2A1A10' },
  oldman: { skin: '#D9A882', skinSh: '#B4805E', hair: '#C9C6C0', style: 'buzz', outfit: 'blazer', top: '#5A4636', topSh: '#3E2F24', sw: 108, neck: 24, head: 1, iris: '#3A2A20' },
  driver: { skin: '#C4906A', skinSh: '#A0704C', hair: '#2a2420', style: 'buzz', outfit: 'track', top: '#4A5060', topSh: '#30343F', sw: 132, neck: 18, head: 1.05, iris: '#2A1A10' },
  anchor: { skin: '#E9BA95', skinSh: '#CF9A74', hair: '#17121A', style: 'bun', outfit: 'blazer', top: '#1E2A4C', topSh: '#121A33', sw: 98, neck: 30, head: .94, iris: '#2A1A10' },
};
export type Expr = 'neutral' | 'smile' | 'bigsmile' | 'worry' | 'fear' | 'shock' | 'focus' | 'grumpy' | 'whisper' | 'tense';
const EXPR: Record<Expr, { bi: number; bo: number; curve: number; open: number; wide: number }> = {
  neutral: { bi: 0, bo: 0, curve: .1, open: 0, wide: 1 }, smile: { bi: -.1, bo: .1, curve: .7, open: 0, wide: .95 }, bigsmile: { bi: .1, bo: .2, curve: .9, open: .35, wide: .9 },
  worry: { bi: .9, bo: -.3, curve: -.35, open: 0, wide: 1.05 }, fear: { bi: 1, bo: .2, curve: -.3, open: .3, wide: 1.32 }, shock: { bi: .8, bo: .8, curve: 0, open: .7, wide: 1.42 },
  focus: { bi: -.55, bo: .1, curve: -.1, open: 0, wide: .86 }, grumpy: { bi: -.85, bo: .2, curve: -.45, open: 0, wide: .9 }, whisper: { bi: .8, bo: -.2, curve: -.2, open: .15, wide: 1.0 }, tense: { bi: .5, bo: -.1, curve: -.4, open: 0, wide: 1.15 },
};
export type Arm = { to?: [number, number]; ang?: [number, number]; flip?: number; pose?: HandPose; hold?: React.ReactNode; holdAng?: number };
export type CharProps = { who: Who; x: number; y: number; s?: number; t: number; expr?: Expr; mouth?: number; look?: [number, number]; turn?: number; tilt?: number; armL?: Arm | null; armR?: Arm | null;
  shade?: number; under?: number; underCol?: string; lens?: (cx: number, cy: number, w: number, h: number) => React.ReactNode; collarOpen?: boolean; part?: 'all' | 'body' | 'arms'; flipX?: boolean; blinkOff?: boolean; duck?: number; watchLit?: number };

// обратная кинематика на 2 звена: углы от вертикали вниз
export function reach(sx: number, sy: number, tx: number, ty: number, l1: number, l2: number, flip = 1): [number, number] {
  const dx = tx - sx, dy = ty - sy, d = Math.min(Math.hypot(dx, dy), l1 + l2 - .01), c2 = clamp((d * d - l1 * l1 - l2 * l2) / (2 * l1 * l2), -1, 1), a2 = Math.acos(c2) * flip;
  const base = Math.atan2(-dx, dy), k = Math.atan2(l2 * Math.sin(a2), l1 + l2 * Math.cos(a2)); return [base - k, a2]; }
const pt = (x: number, y: number, a: number, l: number): [number, number] => [x - Math.sin(a) * l, y + Math.cos(a) * l];
const quad = (a: [number, number], b: [number, number], wa: number, wb: number) => { const d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, nx = -(b[1] - a[1]) / d, ny = (b[0] - a[0]) / d;
  return `M${a[0] + nx * wa / 2},${a[1] + ny * wa / 2} L${b[0] + nx * wb / 2},${b[1] + ny * wb / 2} L${b[0] - nx * wb / 2},${b[1] - ny * wb / 2} L${a[0] - nx * wa / 2},${a[1] - ny * wa / 2} Z`; };

export const Character: React.FC<CharProps> = (p) => {
  const L = LOOKS[p.who], uid = useId().replace(/:/g, ''), t = p.t, s = p.s ?? 1, e = EXPR[p.expr ?? 'neutral'];
  const seed = p.who + p.x.toFixed(0), br = Math.sin(t * 1.7 + p.x) * 2.2, sway = noise(seed + 's', t, .35) * 3, nod = noise(seed + 'n', t, .5) * 2;
  const turn = p.turn ?? noise(seed + 't', t, .25) * .12, tilt = (p.tilt ?? 0) + noise(seed + 'r', t, .3) * 1.5, duck = p.duck ?? 0;
  const lk = p.look ?? [noise(seed + 'lx', t, .4) * .3, noise(seed + 'ly', t, .4) * .15];
  const op = p.blinkOff ? 1 : blink(t, p.x * .01 + (p.who.length)), open = clamp(e.open + (p.mouth ?? 0)), wide = e.wide;
  const hcx = sway * .6 + duck * 4, hcy = -L.neck - 72 * L.head + nod + duck * 26 - br * .3;
  const sw = L.sw, sh: [number, number] = [-sw * .9, 28 + br * .2], shR: [number, number] = [sw * .9, 28 + br * .2];
  const l1 = 150, l2 = 140, flipF = p.flipX ? -1 : 1;
  const shadeId = `sh${uid}`, plaidId = `pl${uid}`, faceClip = `fc${uid}`;
  const dark = clamp(p.shade ?? 0);
  // ───── рука ─────
  const drawArm = (side: -1 | 1, a: Arm | null | undefined) => { if (a === null) return null; const S = side < 0 ? sh : shR;
    let ang: [number, number] = a?.ang ?? [side * -.12, side * .25]; if (a?.to) ang = reach(S[0], S[1], a.to[0], a.to[1], l1, l2, a.flip ?? -side);
    const E = pt(S[0], S[1], ang[0], l1), Wr = pt(E[0], E[1], ang[0] + ang[1], l2), fa = Math.atan2(Wr[1] - E[1], Wr[0] - E[0]);
    const lerpP = (A: [number, number], B: [number, number], k: number): [number, number] => [lerp(A[0], B[0], k), lerp(A[1], B[1], k)];
    const segs: React.ReactNode[] = []; const o = L.outfit;
    if (o === 'tee') { const sl = lerpP(S, E, .42); segs.push(<path key="u" d={quad(S, E, 36, 31)} fill={L.skin} />, <circle key="ue" cx={E[0]} cy={E[1]} r={15.5} fill={L.skin} />, <path key="f" d={quad(E, Wr, 31, 24)} fill={L.skin} />, <path key="s" d={quad(S, sl, 50, 46)} fill={L.top} />, <path key="sh" d={quad(lerpP(S, sl, .5), sl, 10, 8)} fill={L.topSh} opacity={.6} />); }
    else if (o === 'flannel') { const cuff = lerpP(E, Wr, .12); segs.push(<path key="u" d={quad(S, E, 42, 38)} fill={`url(#${plaidId})`} />, <circle key="ue" cx={E[0]} cy={E[1]} r={19} fill={`url(#${plaidId})`} />, <path key="f" d={quad(E, Wr, 30, 24)} fill={L.skin} />, <path key="c" d={quad(lerpP(E, Wr, -.06), cuff, 44, 42)} fill={L.topSh} />, <path key="c2" d={quad(lerpP(E, Wr, -.02), lerpP(E, Wr, .05), 44, 43)} fill={mix(L.top, '#ffffff', .15)} />); }
    else { const cuffA = lerpP(E, Wr, .86); segs.push(<path key="u" d={quad(S, E, 42, 37)} fill={L.top} />, <circle key="ue" cx={E[0]} cy={E[1]} r={18.5} fill={L.top} />, <path key="f" d={quad(E, Wr, 37, 30)} fill={L.top} />,
      <path key="fs" d={quad(E, Wr, 10, 8)} fill={L.topSh} opacity={.55} />, <path key="cf" d={quad(cuffA, Wr, 32, 31)} fill={o === 'track' ? '#151d4a' : o === 'blazer' ? '#F2EEE6' : mix(L.top, '#ffffff', .35)} />);
      if (o === 'track') segs.push(<path key="st" d={`M${S[0] + side * 12},${S[1]} L${E[0] + side * 14},${E[1]} L${Wr[0] + side * 11},${Wr[1]}`} stroke="#ECEFF5" strokeWidth={6} fill="none" strokeLinejoin="round" />); }
    const watch = (p.who === 'beka' && side < 0) || (p.who === 'alik' && side > 0) ? (p.who === 'beka' ? 'smart' : 'mech') : null;
    const wp = lerpP(E, Wr, .8);
    return (<g key={side}>{segs}{watch && <g transform={`translate(${wp[0]},${wp[1]}) rotate(${fa * 180 / Math.PI + 90})`}>
      {watch === 'smart' ? (<><rect x={-20} y={-7} width={40} height={14} rx={4} fill="#111318" /><rect x={-13} y={-13} width={26} height={26} rx={6} fill="#111318" /><rect x={-10} y={-10} width={20} height={20} rx={4} fill={(p.watchLit ?? 1) > 0 ? '#7FB3FF' : '#05060a'} opacity={(p.watchLit ?? 1) > 0 ? .9 : 1} /></>)
        : (<><rect x={-20} y={-6} width={40} height={12} rx={3} fill="#6B3E22" /><circle r={13} fill="#C9A45A" /><circle r={10.5} fill="#F2E8D2" /><path d="M0,0 L0,-8 M0,0 L-5,3" stroke="#222" strokeWidth={1.8} /></>)}</g>}
      <g transform={`translate(${Wr[0]},${Wr[1]}) rotate(${fa * 180 / Math.PI})`}><Hand side={side} skin={L.skin} shade={L.skinSh} pose={a?.pose ?? 'relax'} hold={a?.hold} holdAng={a?.holdAng} /></g></g>); };
  // ───── голова ─────
  const fx = turn * 10, ex = 23, eyeY = -4, ery = 7.5 * wide, ey = (side: number) => side * ex + fx;
  const faceD = 'M0,-72 C34,-72 56,-50 57,-14 C58,14 50,40 36,58 C26,70 14,76 0,76 C-14,76 -26,70 -36,58 C-50,40 -58,14 -57,-14 C-56,-50 -34,-72 0,-72 Z';
  const hair = (front: boolean) => { const h = L.hair;
    if (L.style === 'curly') { if (!front) return <g><ellipse cx={0} cy={-34} rx={80} ry={72} fill={h} />{[-70, -52, 52, 70].map((x, i) => <circle key={i} cx={x} cy={-6 + (i % 2) * 14} r={20} fill={h} />)}</g>;
      const bumps = Array.from({ length: 11 }, (_, i) => { const a = Math.PI * (1.08 + i * .084); return [Math.cos(a) * 62, -18 + Math.sin(a) * 66] as [number, number]; });
      return <g><path d={`M-62,-12 ${bumps.map(([x, y]) => `A22,22 0 0 1 ${x.toFixed(1)},${y.toFixed(1)}`).join(' ')} A22,22 0 0 1 62,-12 C58,-42 40,-50 22,-44 C8,-36 -8,-42 -24,-46 C-42,-48 -58,-36 -62,-12 Z`} fill={h} />
        {Array.from({ length: 16 }, (_, i) => { const a = Math.PI * (1.05 + (i % 8) * .12), r = 40 + Math.floor(i / 8) * 26, cx = Math.cos(a) * r, cy = -26 + Math.sin(a) * r * .95; return <path key={i} d={`M${cx - 7},${cy} a8,7 0 1 1 9,6`} stroke={mix(h, '#000000', .45)} strokeWidth={3.2} fill="none" strokeLinecap="round" />; })}
        <path d="M-12,-46 a9,9 0 1 0 10,10" stroke={h} strokeWidth={9} fill="none" strokeLinecap="round" /><path d="M14,-48 a8,8 0 1 1 -2,14" stroke={h} strokeWidth={8} fill="none" strokeLinecap="round" /></g>; }
    if (L.style === 'bun') { if (!front) return <circle cx={34} cy={-74} r={26} fill={h} />; return <g><path d="M-58,-6 C-62,-56 -32,-80 2,-80 C36,-80 60,-56 58,-10 C52,-40 38,-56 10,-58 C-6,-48 -30,-46 -58,-6 Z" fill={h} /><path d="M-30,-68 C-10,-74 20,-74 40,-62" stroke="rgba(255,255,255,.15)" strokeWidth={4} fill="none" /></g>; }
    if (L.style === 'buzz') { if (!front) return null; return <g><path d="M-57,-12 C-58,-54 -34,-77 0,-77 C34,-77 58,-54 57,-12 C52,-34 38,-48 0,-50 C-38,-48 -52,-34 -57,-12 Z" fill={h} opacity={.93} /><path d="M-52,-20 C-40,-44 40,-44 52,-20" stroke={mix(h, '#ffffff', .12)} strokeWidth={2} fill="none" opacity={.5} /></g>; }
    if (L.style === 'beanie') { if (!front) return null; return <g><path d="M-60,-6 C-60,-20 -56,-30 -52,-30 L52,-30 C56,-30 60,-20 60,-6 C54,-12 50,-14 46,-14 L-46,-14 C-50,-14 -54,-12 -60,-6 Z" fill={h} />
      <path d="M-62,-24 C-66,-70 -36,-98 0,-98 C36,-98 66,-70 62,-24 Z" fill="#7A1F2B" />{[-44, -26, -9, 9, 26, 44].map(x => <path key={x} d={`M${x * .9},-92 Q${x * 1.15},-60 ${x * 1.25},-28`} stroke="#5A1520" strokeWidth={3} fill="none" opacity={.7} />)}
      <rect x={-66} y={-42} width={132} height={26} rx={10} fill="#8E2734" />{[-50, -30, -10, 10, 30, 50].map(x => <line key={x} x1={x} y1={-40} x2={x} y2={-18} stroke="#6A1A24" strokeWidth={3} />)}<path d="M-50,-84 C-30,-96 20,-98 44,-84" stroke="rgba(255,255,255,.14)" strokeWidth={5} fill="none" strokeLinecap="round" /></g>; }
    if (!front) return null; // уложенные: кок набок
    return <g><path d="M-58,-10 C-63,-52 -40,-86 -6,-88 C22,-96 52,-86 60,-56 C63,-38 60,-22 57,-10 C54,-32 46,-46 32,-52 C14,-44 -14,-54 -36,-50 C-48,-46 -55,-30 -58,-10 Z" fill={h} />
      <path d="M-14,-84 C6,-110 52,-104 60,-72 C42,-86 18,-90 -14,-84 Z" fill={h} /><path d="M2,-92 C20,-100 44,-94 52,-80" stroke="rgba(255,255,255,.16)" strokeWidth={4} fill="none" strokeLinecap="round" /></g>; };
  const brow = (side: number) => { const cx = ey(side), by = eyeY - ery - 11 * (wide > 1.2 ? 1.25 : 1), inY = by - e.bi * 7 + (e.bi < 0 ? -e.bi * 5 : 0) * 0, outY = by - e.bo * 4 + 1;
    return <path key={side} d={`M${cx - side * 9},${inY + (e.bi < 0 ? -e.bi * 5 : 0)} Q${cx + side * 2},${by - 4 - Math.max(0, e.bi) * 3} ${cx + side * 14},${outY}`} stroke={L.hair} strokeWidth={5.5} strokeLinecap="round" fill="none" />; };
  const eye = (side: number) => { const cx = ey(side), id = `ec${uid}${side}`, ow = 12.5, oh = ery * op; const lidY = eyeY - ery + (1 - op) * ery * 2 + (wide < 1 ? (1 - wide) * ery * 2.2 : 0);
    const ix = cx + lk[0] * 5, iy = eyeY + lk[1] * 3.5;
    return <g key={side}><clipPath id={id}><ellipse cx={cx} cy={eyeY} rx={ow} ry={Math.max(.5, ery)} /></clipPath>
      <ellipse cx={cx} cy={eyeY} rx={ow} ry={Math.max(.5, ery)} fill="#F7F3EC" />
      <g clipPath={`url(#${id})`}><circle cx={ix} cy={iy} r={6.6} fill={L.iris} /><circle cx={ix} cy={iy} r={3.3} fill="#0d0a0c" /><circle cx={ix + 2} cy={iy - 2.2} r={1.7} fill="#fff" />
        <rect x={cx - ow - 2} y={eyeY - ery - 3} width={ow * 2 + 4} height={Math.max(0, lidY - (eyeY - ery) + 3)} fill={L.skin} /></g>
      <path d={`M${cx - ow - 1},${Math.min(eyeY, lidY + 1)} Q${cx},${lidY - 3 * op} ${cx + ow + 1},${Math.min(eyeY, lidY + 1)}`} stroke="#2a1a18" strokeWidth={2.6} fill="none" strokeLinecap="round" />
      <path d={`M${cx - ow + 2},${eyeY + ery + 2.5} Q${cx},${eyeY + ery + 4.5} ${cx + ow - 2},${eyeY + ery + 2.5}`} stroke={L.skinSh} strokeWidth={1.4} fill="none" opacity={.6} /></g>; };
  const scared = ['shock', 'fear', 'whisper', 'tense', 'worry'].includes(p.expr ?? '');
  const mouthEl = (() => { const mx = fx * .9, my = 42, w = 15; if (open > .06 && scared) { const rx = 8 + open * 4, ry = 4 + open * 15; return <g><ellipse cx={mx} cy={my + ry * .4} rx={rx} ry={ry} fill="#3E161C" /><ellipse cx={mx} cy={my + ry * 1.05} rx={rx * .6} ry={ry * .3} fill="#9A3E48" /><path d={`M${mx - rx - 4},${my - 2} Q${mx},${my - 6} ${mx + rx + 4},${my - 2}`} stroke="#6A2A2E" strokeWidth={2.4} fill="none" /></g>; }
    if (open > .06) { const h = 3 + open * 17; return <g><path d={`M${mx - w},${my} Q${mx},${my - 4 - e.curve * 4} ${mx + w},${my} Q${mx},${my + h * 1.6} ${mx - w},${my} Z`} fill="#4A1C22" />
      {open > .25 && <path d={`M${mx - w + 3},${my - 1} Q${mx},${my - 3} ${mx + w - 3},${my - 1} L${mx + w - 5},${my + 3} Q${mx},${my + 1} ${mx - w + 5},${my + 3} Z`} fill="#F4EFE6" />}<ellipse cx={mx} cy={my + h * .9} rx={w * .5} ry={h * .3} fill="#B9505A" /></g>; }
    const c = e.curve * 8; return <g><path d={`M${mx - w},${my - c * .4} Q${mx},${my + c} ${mx + w},${my - c * .4}`} stroke="#6A2A2E" strokeWidth={3.6} fill="none" strokeLinecap="round" /><path d={`M${mx - 7},${my + 7 + Math.max(0, c) * .4} Q${mx},${my + 10 + Math.max(0, c) * .4} ${mx + 7},${my + 7 + Math.max(0, c) * .4}`} stroke={L.skinSh} strokeWidth={2.4} fill="none" opacity={.5} strokeLinecap="round" /></g>; })();
  const head = (<g transform={`translate(${hcx},${hcy}) rotate(${tilt}) scale(${L.head})`}>
    {hair(false)}
    {[-1, 1].map(side => <g key={side}><ellipse cx={side * 56 - turn * 6} cy={4} rx={9} ry={15} fill={L.skin} /><ellipse cx={side * 57 - turn * 6} cy={5} rx={4} ry={8} fill={L.skinSh} opacity={.6} /></g>)}
    <path d={faceD} fill={L.skin} /><clipPath id={faceClip}><path d={faceD} /></clipPath>
    <g clipPath={`url(#${faceClip})`}><path d="M20,-80 C60,-60 64,20 30,82 L90,82 L90,-80 Z" fill={L.skinSh} opacity={.38} /><ellipse cx={0} cy={86} rx={50} ry={22} fill={L.skinSh} opacity={.35} /></g>
    {[-1, 1].map(side => <ellipse key={side} cx={side * 33 + fx} cy={22} rx={11} ry={7} fill="#E8735E" opacity={.16} />)}
    {[-1, 1].map(eye)}{[-1, 1].map(brow)}
    <path d={`M${fx * 1.4 - 1},${0} Q${fx * 1.4 + 8},${18} ${fx * 1.4 + 3},${22} Q${fx * 1.4 - 2},${24} ${fx * 1.4 - 7},${21}`} stroke={L.skinSh} strokeWidth={3} fill="none" strokeLinecap="round" />
    {mouthEl}{hair(true)}
    {L.glasses && <g>{[-1, 1].map(side => { const cx = ey(side), gw = 36, gh = 27; return <g key={side}><clipPath id={`gl${uid}${side}`}><rect x={cx - gw / 2} y={eyeY - gh / 2} width={gw} height={gh} rx={8} /></clipPath>
      <rect x={cx - gw / 2} y={eyeY - gh / 2} width={gw} height={gh} rx={8} fill="rgba(180,205,255,.08)" /><g clipPath={`url(#gl${uid}${side})`}>{p.lens?.(cx, eyeY, gw, gh)}<path d={`M${cx - gw * .45},${eyeY + gh / 2} L${cx - gw * .1},${eyeY - gh / 2} L${cx + gw * .05},${eyeY - gh / 2} L${cx - gw * .3},${eyeY + gh / 2} Z`} fill="rgba(255,255,255,.16)" /></g>
      <rect x={cx - gw / 2} y={eyeY - gh / 2} width={gw} height={gh} rx={8} fill="none" stroke="#2E211C" strokeWidth={3.4} /></g>; })}
      <path d={`M${ey(-1) + 18},${eyeY - 4} Q${fx},${eyeY - 9} ${ey(1) - 18},${eyeY - 4}`} stroke="#2E211C" strokeWidth={3.2} fill="none" /><path d={`M${ey(-1) - 18},${eyeY - 4} L-56,${eyeY - 8} M${ey(1) + 18},${eyeY - 4} L56,${eyeY - 8}`} stroke="#2E211C" strokeWidth={3} /></g>}
  </g>);
  // ───── корпус и одежда ─────
  const torsoD = `M${-sw * .38},-3 C${-sw * .72},0 ${-sw},8 ${-sw * 1.02},44 L${-sw * .97},460 L${sw * .97},460 L${sw * 1.02},44 C${sw},8 ${sw * .72},0 ${sw * .38},-3 Z`;
  const o = L.outfit, collarOpen = p.collarOpen;
  const body = (<g transform={`translate(${sway * .3},${br * .2}) scale(1,${1 + br * .002})`}>
    <defs><linearGradient id={shadeId} x1="0" x2="1"><stop offset="0" stopColor={mix(L.top, '#ffffff', .06)} /><stop offset=".6" stopColor={L.top} /><stop offset="1" stopColor={L.topSh} /></linearGradient>
      <pattern id={plaidId} width="52" height="52" patternUnits="userSpaceOnUse" patternTransform="rotate(4)"><rect width="52" height="52" fill="#A9402B" /><rect width="52" height="16" y="18" fill="#6E2318" opacity=".8" /><rect width="16" height="52" x="18" fill="#6E2318" opacity=".55" /><rect width="52" height="3" y="9" fill="#E3B25C" opacity=".7" /><rect width="3" height="52" x="9" fill="#E3B25C" opacity=".55" /><rect width="52" height="2" y="41" fill="#2A1A14" opacity=".5" /></pattern></defs>
    <rect x={-17} y={-L.neck - 8} width={34} height={L.neck + 16} rx={10} fill={L.skin} /><rect x={-17} y={-L.neck - 8} width={34} height={14} fill={L.skinSh} opacity={.5} />
    <path d={torsoD} fill={o === 'flannel' ? `url(#${plaidId})` : `url(#${shadeId})`} />
    <path d={`M${sw * .55},40 C${sw * .7},160 ${sw * .78},300 ${sw * .72},460 L${sw * .97},460 L${sw * 1.02},44 Z`} fill="rgba(20,10,30,.18)" />
    <path d={`M${-sw * .7},90 C${-sw * .4},120 ${-sw * .5},180 ${-sw * .62},210 M${sw * .45},110 C${sw * .3},150 ${sw * .38},210 ${sw * .5},240`} stroke="rgba(20,10,30,.16)" strokeWidth={4} fill="none" strokeLinecap="round" />
    {(o === 'shirt' || o === 'flannel') && <g>
      {collarOpen && <path d="M-16,-2 L0,52 L16,-2 Z" fill={L.skin} />}
      <path d="M-4,40 L-4,460 M4,40 L4,460" stroke="rgba(20,10,30,.18)" strokeWidth={2} />{[100, 190, 280, 370].map(y => <circle key={y} cx={0} cy={y} r={4.5} fill={o === 'flannel' ? '#F2E8D2' : '#9FB2C8'} />)}
      {[-1, 1].map(side => <path key={side} d={`M${side * 4},${collarOpen ? 52 : 26} L${side * 46},-10 L${side * 60},26 Z`} fill={o === 'flannel' ? '#8E3624' : mix(L.top, '#ffffff', .4)} stroke="rgba(20,10,30,.15)" strokeWidth={2} />)}
      {o === 'flannel' && <g><rect x={-sw * .62} y={110} width={46} height={52} rx={4} fill="#8E3624" opacity={.6} /><rect x={-sw * .62} y={110} width={46} height={14} rx={3} fill="#6E2318" /></g>}</g>}
    {o === 'puffer' && <g>{[70, 150, 230, 310, 390].map(y => <path key={y} d={`M${-sw * .99},${y} Q0,${y + 14} ${sw * .99},${y}`} stroke={L.topSh} strokeWidth={5} fill="none" opacity={.75} />)}
      <path d="M-44,-20 C-46,10 -40,30 -30,40 L30,40 C40,30 46,10 44,-20 C30,-6 -30,-6 -44,-20 Z" fill={mix(L.top, '#000000', .12)} /><path d="M0,10 L0,460" stroke="#2A2F1A" strokeWidth={5} /><rect x={-5} y={30} width={10} height={22} rx={3} fill="#C9CDD6" />
      <path d={`M${-sw * .62},-2 L${-sw * .48},460`} stroke="#2A2620" strokeWidth={22} /><path d={`M${-sw * .62},-2 L${-sw * .48},460`} stroke="#3C362E" strokeWidth={12} /></g>}
    {o === 'jacket' && <g><path d="M-30,-2 L-16,460 L16,460 L30,-2 Z" fill="#DDE8F3" /><path d="M-4,40 L-4,460" stroke="rgba(20,10,30,.18)" strokeWidth={2} />{[-1, 1].map(side => <path key={side} d={`M${side * 4},${collarOpen ? 52 : 26} L${side * 40},-8 L${side * 52},24 Z`} fill="#F2F6FA" stroke="rgba(20,10,30,.15)" strokeWidth={2} />)}
      {[-1, 1].map(side => <path key={'j' + side} d={`M${side * 30},-6 L${side * 20},460`} stroke={L.topSh} strokeWidth={8} />)}<path d="M-50,-14 C-30,6 30,6 50,-14" stroke={mix(L.top, '#000000', .3)} strokeWidth={12} fill="none" strokeLinecap="round" /><rect x={-sw * .97} y={430} width={sw * 1.94} height={30} fill={mix(L.top, '#000000', .3)} /></g>}
    {o === 'tee' && <path d="M-34,-4 C-24,22 24,22 34,-4" stroke={L.topSh} strokeWidth={9} fill="none" strokeLinecap="round" />}
    {o === 'track' && <g><rect x={-46} y={-14} width={92} height={26} rx={10} fill="#18235A" /><path d="M0,10 L0,460" stroke="#C9CDD6" strokeWidth={4} /><path d={`M${-sw * .98},60 L${-sw * .98},460 M${sw * .98},60 L${sw * .98},460`} stroke="#ECEFF5" strokeWidth={7} /></g>}
    {o === 'blazer' && <g><path d="M-30,-2 L0,120 L30,-2 Z" fill="#F2EEE6" />{[-1, 1].map(side => <path key={side} d={`M${side * 30},-2 L${side * 6},140 L${side * 62},80 L${side * 52},6 Z`} fill="#141B33" />)}</g>}
  </g>);
  const part = p.part ?? 'all', darkMatrix = `${1 - dark * .78} 0 0 0 0  0 ${1 - dark * .76} 0 0 0  0 0 ${1 - dark * .62} 0 ${dark * .03}  0 0 0 1 0`;
  return (<g transform={`translate(${p.x},${p.y}) scale(${s * flipF},${s})`}>
    <defs><filter id={`dk${uid}`} colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values={darkMatrix} /></filter>
      <radialGradient id={`ul${uid}`}><stop offset="0" stopColor={p.underCol ?? '#7FB3FF'} stopOpacity={.75} /><stop offset="1" stopColor={p.underCol ?? '#7FB3FF'} stopOpacity={0} /></radialGradient></defs>
    <g filter={dark > 0 ? `url(#dk${uid})` : undefined}>
      {part !== 'arms' && <>{body}{head}</>}
      {part !== 'body' && <>{drawArm(-1, p.armL)}{drawArm(1, p.armR)}</>}
    </g>
    {(p.under ?? 0) > 0 && part !== 'arms' && <ellipse cx={hcx} cy={hcy + 70} rx={120} ry={140} fill={`url(#ul${uid})`} opacity={p.under} style={{ mixBlendMode: 'screen' }} />}
  </g>);
};
