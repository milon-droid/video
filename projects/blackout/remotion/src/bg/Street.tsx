// Серия 2: метро, тоннель, лестничный пролёт, двор, улица, такси сбоку, самосвал, кабина, герои в полный рост.
// Плоские вырезанные формы без контура, тень-«срез» с одной стороны; свет после блэкаута — фары, фонарики, экраны.
import React from 'react';
import { clamp, lerp, mix, noise } from '../anim';
import { Glow } from './Kitchen';
import { C, FONT } from '../theme';

// ───── герой в полный рост (дальние и средние планы улицы): у каждого свой силуэт ─────
export type HeroId = 'dias' | 'beka' | 'alik' | 'alisher';
const HL: Record<HeroId, { top: string; sh: string; skin: string; hair: string; legs: string; hw: number }> = {
  dias: { top: '#2B3A55', sh: '#1B2640', skin: '#E3AC84', hair: '#1E1A20', legs: '#2a2f3c', hw: 30 },
  beka: { top: '#25357E', sh: '#18235A', skin: '#C98C62', hair: '#231C18', legs: '#1d2350', hw: 36 },
  alik: { top: '#A9402B', sh: '#76291B', skin: '#E8B992', hair: '#3A2316', legs: '#3a3a44', hw: 27 },
  alisher: { top: '#6B7A3E', sh: '#46522A', skin: '#D6A27C', hair: '#1B1716', legs: '#2c2c30', hw: 30 },
};
export type HeroPose = 'walk' | 'run' | 'stand' | 'look' | 'up' | 'freeze' | 'knock';
export const Hero: React.FC<{ id: HeroId; x: number; y: number; s?: number; t: number; pose?: HeroPose; phase?: number; dir?: number; dark?: number; torch?: number; turn?: number; lit?: number; litCol?: string }> = ({ id, x, y, s = 1, t, pose = 'stand', phase = 0, dir = 1, dark = 0, torch = 0, turn = 0, lit = 0, litCol = '#FFF6DE' }) => {
  const L = HL[id], run = pose === 'run', moving = pose === 'walk' || run, ph = phase, sw = moving ? Math.sin(ph) : 0, bob = moving ? Math.abs(Math.cos(ph)) * (run ? 10 : 5) : Math.sin(t * 1.7 + x) * 1.5;
  const k = (c: string) => mix(c, '#05070f', dark * .72), top = k(L.top), sh = k(L.sh), skin = k(L.skin), hair = k(L.hair), legs = k(L.legs);
  const lean = run ? 9 : pose === 'freeze' ? -4 : 0, look = pose === 'up' ? -30 : pose === 'look' ? -6 : 0, hw = L.hw;
  const legA = run ? 34 : 20, armA = run ? 40 : 22;
  const arm = (side: number) => { const a = pose === 'knock' && side > 0 ? -95 + Math.sin(t * 18) * 12 : pose === 'freeze' ? side * 30 : pose === 'up' && side > 0 && torch ? -150 : -side * sw * armA + (run ? -20 : 0); const r = (a * Math.PI) / 180, ex = side * (hw + 6) + Math.sin(r) * 70, ey = -250 + Math.cos(r) * 70, r2 = r + (run ? -.9 : -.25) * (pose === 'knock' && side > 0 ? -1.4 : 1), wx = ex + Math.sin(r2) * 64, wy = ey + Math.cos(r2) * 64;
    return <g key={side}><path d={`M${side * (hw - 2)},-262 L${ex},${ey} L${wx},${wy}`} stroke={side > 0 ? top : sh} strokeWidth={id === 'alisher' ? 30 : 24} fill="none" strokeLinecap="round" strokeLinejoin="round" /><circle cx={wx} cy={wy} r={11} fill={skin} />
      {side > 0 && torch > 0 && <g transform={`translate(${wx},${wy}) rotate(${a + 180})`}><rect x={-7} y={-16} width={14} height={24} rx={3} fill="#15171e" /><path d="M-5,-14 L-110,-520 L110,-520 L5,-14 Z" fill="#FFF8E1" opacity={.16 * torch} /><Glow x={0} y={-14} r={40} col="#FFFBEA" a={torch} /></g>}</g>; };
  const leg = (side: number) => { const a = side * sw * legA, r = (a * Math.PI) / 180, knee = [side * 12 + Math.sin(r) * 92, -150 + Math.cos(r) * 92 * .98], bend = moving && side * sw < 0 ? (run ? .9 : .4) : 0, fx = knee[0] + Math.sin(r - bend) * 92, fy = knee[1] + Math.cos(r - bend) * 92;
    return <g key={side}><path d={`M${side * 12},-150 L${knee[0]},${knee[1]} L${fx},${Math.min(0, fy)}`} stroke={side > 0 ? legs : mix(legs, '#000000', .25)} strokeWidth={30} fill="none" strokeLinecap="round" strokeLinejoin="round" /><ellipse cx={fx + 12 * dir} cy={Math.min(0, fy) + 4} rx={22} ry={10} fill={k('#15161c')} /></g>; };
  const head = (<g transform={`translate(${turn * 8},${-320}) rotate(${look})`}>
    <ellipse cx={0} cy={0} rx={30} ry={35} fill={skin} />
    {id === 'alisher' && <g><path d="M-33,-4 C-36,-46 -16,-56 0,-56 C16,-56 36,-46 33,-4 Z" fill={k('#7A1F2B')} /><rect x={-35} y={-14} width={70} height={14} rx={6} fill={k('#8E2734')} /></g>}
    {id === 'alik' && <g>{[-26, -14, 0, 14, 26, -20, 20, -30, 30].map((cx, i) => <circle key={i} cx={cx} cy={-24 - (i < 5 ? 10 : 0) + (i > 6 ? 14 : 0)} r={14} fill={hair} />)}</g>}
    {id === 'beka' && <path d="M-30,-6 C-31,-34 -18,-40 0,-40 C18,-40 31,-34 30,-6 C24,-22 -24,-22 -30,-6 Z" fill={hair} />}
    {id === 'dias' && <g><path d="M-31,-4 C-34,-34 -18,-48 0,-48 C20,-56 36,-40 32,-6 C26,-24 -20,-26 -31,-4 Z" fill={hair} /><path d="M-6,-46 C8,-60 34,-56 34,-36 C24,-46 10,-48 -6,-46 Z" fill={hair} /><g stroke={k('#2E211C')} strokeWidth={3.4} fill="rgba(180,205,255,.12)"><rect x={-24 + turn * 6} y={-6} width={20} height={14} rx={4} /><rect x={4 + turn * 6} y={-6} width={20} height={14} rx={4} /></g></g>}
    {lit > 0 && <ellipse cx={0} cy={4} rx={30} ry={35} fill={litCol} opacity={lit * .35} />}</g>);
  return (<g transform={`translate(${x},${y - bob}) scale(${s * dir},${s}) rotate(${lean})`}>
    <ellipse cx={0} cy={bob / s} rx={60} ry={12} fill="#000" opacity={.3} />
    {leg(-1)}{arm(-1)}
    {id === 'alisher' && <rect x={-hw - 20} y={-280} width={34} height={110} rx={12} fill={k('#3C362E')} />}
    <path d={`M${-hw},-282 Q${-hw - 6},-200 ${-hw + 2},-140 L${hw - 2},-140 Q${hw + 6},-200 ${hw},-282 Q0,-296 ${-hw},-282 Z`} fill={top} />
    <path d={`M${hw * .3},-286 Q${hw + 6},-200 ${hw - 2},-140 L${hw * .3},-140 Z`} fill={sh} opacity={.5} />
    {id === 'beka' && <path d={`M${-hw + 4},-270 L${-hw + 6},-142 M${hw - 4},-270 L${hw - 6},-142`} stroke={k('#ECEFF5')} strokeWidth={4} />}
    {id === 'alik' && <path d={`M${-hw},-240 L${hw},-240 M${-hw},-200 L${hw},-200 M0,-286 L0,-140`} stroke={k('#6E2318')} strokeWidth={5} opacity={.7} />}
    {id === 'alisher' && [-250, -215, -180].map(yy => <path key={yy} d={`M${-hw},${yy} Q0,${yy + 6} ${hw},${yy}`} stroke={sh} strokeWidth={3} fill="none" />)}
    {id === 'dias' && <path d="M-8,-286 L-4,-150 L4,-150 L8,-286 Z" fill={k('#DDE8F3')} />}
    <rect x={-9} y={-300} width={18} height={20} fill={skin} />
    {head}{leg(1)}{arm(1)}
  </g>); };

// ───── светофор (мёртвый: все секции чёрные) ─────
export const TrafficLight: React.FC<{ x: number; y: number; s?: number; h?: number; on?: string | null }> = ({ x, y, s = 1, h = 420, on = null }) => (<g transform={`translate(${x},${y}) scale(${s})`}>
  <rect x={-7} y={-h} width={14} height={h} fill="#1b1e28" /><rect x={-32} y={-h - 190} width={64} height={190} rx={14} fill="#11131a" />
  {['#E5383B', '#F2B33D', '#3DDC84'].map((c, i) => <g key={c}><circle cx={0} cy={-h - 160 + i * 60} r={22} fill={on === c ? c : '#05060a'} stroke="#262a36" strokeWidth={3} />{on === c && <Glow x={0} y={-h - 160 + i * 60} r={80} col={c} a={.8} />}<path d={`M-24,${-h - 178 + i * 60} L24,${-h - 178 + i * 60} L18,${-h - 186 + i * 60} L-18,${-h - 186 + i * 60} Z`} fill="#262a36" /></g>)}</g>);

// ───── машина сбоку (такси с шашечкой, легковые, грузовик-силуэт) ─────
export const CarSide: React.FC<{ x: number; y: number; s?: number; col?: string; taxi?: boolean; dir?: 1 | -1; head?: number; dip?: number; driver?: number; t?: number; dark?: number }> = ({ x, y, s = 1, col = '#30364a', taxi = false, dir = 1, head = 1, dip = 0, driver = 0, t = 0, dark = .4 }) => {
  const body = mix(taxi ? '#E8B830' : col, '#05070f', dark * .6), top = mix(body, '#ffffff', .08);
  return (<g transform={`translate(${x},${y}) scale(${s * dir},${s})`}>
    <ellipse cx={0} cy={6} rx={250} ry={18} fill="#000" opacity={.4} />
    <g transform={`rotate(${dip * 2.5},180,-40)`}>
      <path d="M-240,-30 L-238,-92 Q-230,-110 -200,-114 L-120,-120 L-70,-186 Q-60,-196 -40,-196 L90,-196 Q112,-196 126,-182 L178,-124 L224,-114 Q246,-108 248,-86 L250,-30 Z" fill={body} />
      <path d="M-60,-180 L-104,-124 L-6,-124 L-6,-180 Z M6,-180 L6,-124 L156,-124 L114,-176 Q104,-182 92,-182 Z" fill={mix('#141a26', '#7FB3FF', driver * .25)} />
      {driver > 0 && <g><ellipse cx={70} cy={-150} rx={20} ry={24} fill={mix('#B07A58', '#000', .3)} /><path d="M50,-158 C50,-180 90,-180 90,-158 Z" fill="#1a1416" /><path d={`M74,-140 l${10 + Math.sin(t * 20) * 3},0`} stroke="#3E161C" strokeWidth={5} strokeLinecap="round" /></g>}
      <path d="M-240,-62 L250,-62" stroke={mix(body, '#000000', .3)} strokeWidth={4} />
      {taxi && <g><rect x={-30} y={-222} width={70} height={26} rx={5} fill="#FFE070" />{[0, 1, 2, 3, 4].map(i => <rect key={i} x={-28 + i * 13} y={-220 + (i % 2) * 11} width={13} height={11} fill="#141414" />)}<Glow x={5} y={-210} r={70} col="#FFD23F" a={.55} />{[0, 1, 2, 3, 4, 5, 6, 7].map(i => <rect key={'c' + i} x={-150 + i * 34} y={-74 + (i % 2) * 10} width={17} height={10} fill="#141414" />)}</g>}
      <rect x={232} y={-100} width={20} height={22} rx={6} fill="#FFFBEA" />{head > 0 && <><path d="M248,-92 L900,-150 L900,40 L248,-74 Z" fill="#FFF6DA" opacity={.12 * head} style={{ filter: 'blur(6px)' }} /><Glow x={250} y={-88} r={90} col="#FFF6DA" a={.8 * head} /></>}
      <rect x={-246} y={-100} width={16} height={22} rx={4} fill="#E5383B" /><Glow x={-244} y={-90} r={50} col="#E5383B" a={.5} />
    </g>
    {[-150, 150].map(wx => <g key={wx}><circle cx={wx} cy={-28} r={40} fill="#0c0d12" /><circle cx={wx} cy={-28} r={18} fill="#3a3e4a" /></g>)}
  </g>); };

// ───── самосвал анфас (фары, решётка, кабина, кузов) ─────
export const Truck: React.FC<{ x: number; y: number; s?: number; t: number; head?: number; rot?: number; glare?: number }> = ({ x, y, s = 1, t, head = 1, rot = 0, glare = 0 }) => (<g transform={`translate(${x},${y}) scale(${s}) rotate(${rot})`}>
  <ellipse cx={0} cy={10} rx={330} ry={34} fill="#000" opacity={.5} />
  <rect x={-280} y={-620} width={560} height={200} rx={10} fill="#3E2E22" /><rect x={-280} y={-620} width={560} height={30} fill="#5a4432" />
  <path d="M-250,-430 L-230,-560 Q-226,-580 -200,-580 L200,-580 Q226,-580 230,-560 L250,-430 Z" fill="#B9442C" />
  <path d="M-206,-450 L-192,-548 L192,-548 L206,-450 Z" fill="#141a26" /><path d="M-180,-540 L-120,-540 L-170,-456 L-196,-456 Z" fill="#fff" opacity={.08} />
  <rect x={-270} y={-430} width={540} height={300} rx={18} fill="#A33A25" /><rect x={-150} y={-400} width={300} height={170} rx={10} fill="#1a1c22" />{[0, 1, 2, 3, 4].map(i => <rect key={i} x={-140} y={-392 + i * 32} width={280} height={14} rx={4} fill="#2c2f38" />)}
  <rect x={-300} y={-150} width={600} height={70} rx={12} fill="#2b2d34" /><rect x={-290} y={-146} width={580} height={14} fill="#4a4d58" />
  {[-1, 1].map(sd => <g key={sd}><rect x={sd * 210 - 46} y={-330} width={92} height={70} rx={14} fill="#FFFBEA" /><Glow x={sd * 210} y={-295} r={260 + glare * 600} col="#FFF6DA" a={.9 * head} /></g>)}
  {[-1, 1].map(sd => <g key={'w' + sd}><rect x={sd * 230 - 60} y={-80} width={120} height={80} rx={20} fill="#0c0d12" /></g>)}
  {[-1, 1].map(sd => <rect key={'m' + sd} x={sd * 300 - (sd > 0 ? 0 : 30)} y={-540} width={30} height={90} rx={6} fill="#2b2d34" />)}
  <rect x={-60} y={-610} width={120} height={22} rx={6} fill="#F2B33D" opacity={.85} />
</g>);

// ───── вагон метро сбоку: окна в тоннель, поручни, лампы под потолком ─────
export const MetroCar: React.FC<{ t: number; speed: number; lamps: number[]; jolt?: number }> = ({ t, speed, lamps, jolt = 0 }) => (<g>
  <rect x={-200} y={-200} width={1480} height={2400} fill="#C9C2B0" />
  <rect x={-200} y={300} width={1480} height={90} fill="#E9E4D6" />
  {lamps.map((on, i) => <g key={i}><rect x={-60 + i * 300} y={330} width={220} height={34} rx={14} fill={on > 0 ? '#FFFDF0' : '#5b5a52'} />{on > 0 && <Glow x={50 + i * 300} y={350} r={260} col="#FFF8DC" a={.55 * on} />}</g>)}
  <rect x={-200} y={420} width={1480} height={14} fill="#9a958a" /><rect x={-200} y={436} width={1480} height={8} fill="#7f7a70" />
  {[0, 1, 2].map(i => { const wx = -80 + i * 420; return <g key={i}><rect x={wx} y={500} width={330} height={300} rx={36} fill="#0A0C12" />
    <clipPath id={`mw${i}`}><rect x={wx} y={500} width={330} height={300} rx={36} /></clipPath><g clipPath={`url(#mw${i})`}>{Array.from({ length: 4 }, (_, j) => { const u = ((t * speed * 1.7 + j * .27 + i * .13) % 1); return <rect key={j} x={wx + 330 - u * 900} y={560 + j * 55} width={140 + j * 30} height={6} fill="#F2B33D" opacity={.6 * clamp(speed)} />; })}
      {Array.from({ length: 3 }, (_, j) => { const u = ((t * speed * .9 + j * .33) % 1); return <rect key={'c' + j} x={wx + 330 - u * 700} y={500} width={30} height={300} fill="#1c2030" />; })}</g>
    <rect x={wx} y={500} width={330} height={300} rx={36} fill="none" stroke="#8a8578" strokeWidth={14} /></g>; })}
  <rect x={-200} y={820} width={1480} height={180} fill="#B5AE9C" /><rect x={-200} y={1000} width={1480} height={110} rx={10} fill="#7A3B2E" /><rect x={-200} y={1000} width={1480} height={26} fill="#93493A" /><rect x={-200} y={1110} width={1480} height={900} fill="#4a4740" />
  <rect x={-200} y={470} width={1480} height={10} fill="#C9CCD3" transform={`translate(${jolt * 6},0)`} />
  {[100, 540, 980].map(px => <rect key={px} x={px - 8} y={440} width={16} height={1000} fill="#D7DAE0" />)}
</g>);

// ───── тоннель в одноточечной перспективе: кольца, кабели, рельсы, шпалы ─────
export const Tunnel: React.FC<{ t: number; walk: number; vp?: [number, number]; station?: number }> = ({ t, walk, vp = [540, 700], station = 1 }) => {
  const [vx, vy] = vp, ring = (d: number) => { const k = 1 / d; return { k, w: 1500 * k, h: 1500 * k, cy: vy + 480 * k }; };
  const rings = Array.from({ length: 14 }, (_, i) => 1 + i * .8 - (walk % .8)).filter(d => d > .7).sort((a, b) => b - a);
  return (<g>
    <rect x={-200} y={-200} width={1480} height={2400} fill="#07080c" />
    {station > 0 && <g><rect x={vx - 70} y={vy - 30} width={140} height={60} fill="#DDEBD8" opacity={.75 * station} /><Glow x={vx} y={vy} r={260} col="#CFF5DC" a={.55 * station} /><text x={vx} y={vy - 44} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={22} fill="#CFF5DC" opacity={.8 * station}>БАЙКОНУР</text></g>}
    {rings.map((d, i) => { const r = ring(d), sh = mix('#2a2c33', '#07080c', clamp((d - 1) / 9));
      return <g key={i}><path d={`M${vx - r.w / 2},${r.cy + r.h * .35} L${vx - r.w / 2},${r.cy - r.h * .2} Q${vx - r.w / 2},${r.cy - r.h * .62} ${vx},${r.cy - r.h * .64} Q${vx + r.w / 2},${r.cy - r.h * .62} ${vx + r.w / 2},${r.cy - r.h * .2} L${vx + r.w / 2},${r.cy + r.h * .35}`} stroke={sh} strokeWidth={Math.max(2, 34 * r.k)} fill="none" />
        <circle cx={vx - r.w / 2 + 26 * r.k} cy={r.cy - r.h * .05} r={7 * r.k + 1} fill="#E5383B" opacity={.8 * clamp(1.6 - d / 6)} /></g>; })}
    {[-1, 1].map(sd => <g key={sd}>{[0, 1, 2].map(c => <path key={c} d={`M${vx + sd * 750},${vy + 120 + c * 26} L${vx + sd * 6},${vy - 4 + c * 2}`} stroke="#15171c" strokeWidth={10 - c * 2} />)}</g>)}
    <path d={`M${vx - 4},${vy + 30} L${vx - 900},2000 L${vx + 900},2000 L${vx + 4},${vy + 30} Z`} fill="#121318" />
    {Array.from({ length: 16 }, (_, i) => 1 + i * .45 - (walk % .45)).filter(d => d > .7).map((d, i) => { const k = 1 / d, yy = vy + 30 + 1300 * k * .74; return <rect key={i} x={vx - 520 * k} y={yy} width={1040 * k} height={Math.max(2, 38 * k)} fill="#2b231c" opacity={clamp(1.4 - d / 7)} />; })}
    {[-1, 1].map(sd => <path key={sd} d={`M${vx + sd * 6},${vy + 30} L${vx + sd * 380},2000`} stroke="#8d929e" strokeWidth={14} opacity={.7} />)}
  </g>); };

// ───── лестничный пролёт сверху (головокружение) ─────
export const StairWell: React.FC<{ t: number; rot: number; z: number }> = ({ t, rot, z }) => (<g transform={`translate(540,880) rotate(${rot}) scale(${z})`}>
  <rect x={-1400} y={-1600} width={2800} height={3200} fill="#0c0d12" />
  {Array.from({ length: 9 }, (_, i) => { const k = Math.pow(.72, i), w = 1000 * k, h = 820 * k, c = mix('#6a6052', '#0c0d12', clamp(i / 6.5)), rail = mix('#5a3a28', '#0c0d12', clamp(i / 6));
    return <g key={i}><rect x={-w / 2} y={-h / 2} width={w} height={h} fill="none" stroke={c} strokeWidth={170 * k} />
      {Array.from({ length: 8 }, (_, j) => { const a = j / 8; return <line key={j} x1={-w / 2 + w * a} y1={-h / 2 - 85 * k} x2={-w / 2 + w * a} y2={-h / 2 + 85 * k} stroke={mix(c, '#000', .25)} strokeWidth={6 * k} />; })}
      <rect x={-w / 2 + 85 * k} y={-h / 2 + 85 * k} width={w - 170 * k} height={h - 170 * k} fill="none" stroke={rail} strokeWidth={16 * k} /></g>; })}
  <circle cx={0} cy={0} r={60} fill="#000" />
</g>);

// ───── фасад сталинки ночью (двор) ─────
export const YardBack: React.FC<{ t: number; shake?: number; candles?: number[] }> = ({ t, shake = 0, candles = [3, 8, 13] }) => (<g>
  <rect x={-200} y={-200} width={1480} height={2400} fill="#141a2e" />
  <rect x={-200} y={260} width={1480} height={1100} fill="#2a2a36" /><rect x={-200} y={240} width={1480} height={40} fill="#3a3a48" />
  {Array.from({ length: 15 }, (_, i) => { const c = i % 5, r = Math.floor(i / 5), wx = -60 + c * 250, wy = 330 + r * 290, cand = candles.includes(i);
    return <g key={i}><rect x={wx} y={wy} width={130} height={200} rx={6} fill={cand ? '#3b2a18' : '#0a0c14'} />{cand && <><Glow x={wx + 65} y={wy + 150} r={110} col="#F2B33D" a={.5 + .2 * Math.sin(t * 9 + i)} /><rect x={wx + 60} y={wy + 140} width={10} height={30} fill="#F4E6C8" /></>}
      <rect x={wx} y={wy} width={130} height={200} rx={6} fill="none" stroke="#3a3a48" strokeWidth={10} transform={`translate(${shake * Math.sin(t * 60 + i) * 2},0)`} /></g>; })}
  <rect x={380} y={1130} width={320} height={260} fill="#1a1a22" /><rect x={360} y={1110} width={360} height={30} fill="#3a3a48" />
</g>);

// ───── уличный фон: дома по сторонам проспекта, горы под луной ─────
export const StreetBack: React.FC<{ t: number; px?: number; hill?: number }> = ({ t, px = 0, hill = 0 }) => (<g>
  <defs><linearGradient id="stSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#141c38" /><stop offset=".7" stopColor="#22305a" /><stop offset="1" stopColor="#2a3460" /></linearGradient></defs>
  <rect x={-200} y={-200} width={1480} height={2400} fill="url(#stSky)" /><circle cx={820 - px * .1} cy={420} r={46} fill="#F4F1EA" opacity={.9} /><Glow x={820 - px * .1} y={420} r={200} col="#DCE4FF" a={.35} />
  <path d={`M-200,${760 - hill} L60,${560 - hill} L240,${680 - hill} L470,${470 - hill} L700,${640 - hill} L900,${520 - hill} L1280,${720 - hill} L1280,900 L-200,900 Z`} fill="#2c3766" transform={`translate(${-px * .2},0)`} />
  <path d={`M380,${560 - hill} L470,${470 - hill} L560,${552 - hill} L520,${540 - hill} L470,${500 - hill} L430,${545 - hill} Z M820,${580 - hill} L900,${520 - hill} L980,${575 - hill} Z`} fill="#E8EEFF" opacity={.6} transform={`translate(${-px * .2},0)`} />
  <g transform={`translate(${-px * .5},0)`}>{Array.from({ length: 9 }, (_, i) => { const bx = -300 + i * 300, bh = 420 + (i * 97 % 3) * 70; return <g key={i}><rect x={bx} y={1060 - bh} width={260} height={bh} fill={i % 2 ? '#1e2236' : '#23283e'} />
    {Array.from({ length: 12 }, (_, j) => <rect key={j} x={bx + 24 + (j % 3) * 80} y={1060 - bh + 40 + Math.floor(j / 3) * 100} width={46} height={66} fill={(i * 7 + j * 3) % 11 === 0 ? '#3b2a18' : '#0c0f1a'} />)}</g>; })}</g>
</g>);

// ───── звуковое слово (ономатопея) ─────
export const Onomato: React.FC<{ x: number; y: number; text: string; k: number; rot?: number; col?: string; size?: number }> = ({ x, y, text, k, rot = -8, col = '#FFD23F', size = 96 }) => k <= 0 ? null : (
  <text x={x} y={y} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size} fill={col} stroke={C.ink} strokeWidth={16} paintOrder="stroke" transform={`translate(${x},${y}) rotate(${rot}) scale(${lerp(1.6, 1, clamp(k * 3))}) translate(${-x},${-y})`} opacity={clamp(k * 4)}>{text}</text>);

// ───── циферблаты крупно ─────
export const MechWatch: React.FC<{ x: number; y: number; r: number; t: number; h: number; m: number; sec: number }> = ({ x, y, r, h, m, sec }) => { const ang = (v: number) => v * 6 - 90, hand = (a: number, l: number, w: number, col: string) => { const rr = (a * Math.PI) / 180; return <line x1={x} y1={y} x2={x + Math.cos(rr) * l} y2={y + Math.sin(rr) * l} stroke={col} strokeWidth={w} strokeLinecap="round" />; };
  return (<g><rect x={x - r * .55} y={y - r * 2.2} width={r * 1.1} height={r * 4.4} rx={18} fill="#6B3E22" /><circle cx={x} cy={y} r={r * 1.12} fill="#C9A45A" /><circle cx={x} cy={y} r={r} fill="#F2E8D2" />
    {Array.from({ length: 12 }, (_, i) => { const a = (i * 30 * Math.PI) / 180; return <line key={i} x1={x + Math.cos(a) * r * .82} y1={y + Math.sin(a) * r * .82} x2={x + Math.cos(a) * r * .94} y2={y + Math.sin(a) * r * .94} stroke="#2a2018" strokeWidth={i % 3 ? 4 : 9} />; })}
    {hand(((h % 12) + m / 60) * 30 - 90, r * .5, 12, '#1a1410')}{hand(ang(m), r * .74, 8, '#1a1410')}{hand(ang(sec), r * .86, 3.5, '#C8372E')}<circle cx={x} cy={y} r={10} fill="#1a1410" />
    <path d={`M${x - r * .7},${y - r * .5} Q${x - r * .2},${y - r * .95} ${x + r * .4},${y - r * .85}`} stroke="#fff" strokeWidth={10} opacity={.35} fill="none" strokeLinecap="round" /></g>); };
export const SmartWatch: React.FC<{ x: number; y: number; s?: number; t: number; pulse: number }> = ({ x, y, s = 1, t, pulse }) => (<g transform={`translate(${x},${y}) scale(${s})`}>
  <rect x={-60} y={-200} width={120} height={400} rx={30} fill="#111318" /><rect x={-110} y={-120} width={220} height={240} rx={48} fill="#1a1c22" /><rect x={-96} y={-106} width={192} height={212} rx={38} fill="#05060a" />
  <text x={0} y={-50} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={28} fill={C.danger}>НЕТ СЕТИ</text>
  <text x={0} y={40} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={76} fill={C.text}>{pulse}</text>
  <path d="M-34,64 c-14,-14 -34,4 -18,20 l18,18 l18,-18 c16,-16 -4,-34 -18,-20 Z" fill={C.danger} transform={`translate(0,0) scale(${1 + .12 * Math.max(0, Math.sin(t * pulse / 60 * Math.PI * 2))})`} transform-origin="0 82" />
  <Glow x={0} y={0} r={160} col="#7FB3FF" a={.25} /></g>);
export { noise };
