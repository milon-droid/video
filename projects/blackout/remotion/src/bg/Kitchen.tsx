// Кухня съёмной квартиры (SVG, плоские формы с мягким светом): стена, окно на проспект, люстра на три плафона,
// ТВ на кронштейне, полка с роутером, угол Алихана с ПК, обеденный стол с клеёнкой, гладильная доска Диаса у окна.
import React from 'react';
import { clamp, mix } from '../anim';

export const Glow: React.FC<{ x: number; y: number; r: number; col: string; a?: number }> = ({ x, y, r, col, a = 1 }) => { const id = `g${Math.round(x)}_${Math.round(y)}_${Math.round(r)}_${col.replace(/[^a-z0-9]/gi, '')}`;
  return (<g style={{ mixBlendMode: 'screen' }} opacity={a}><defs><radialGradient id={id}><stop offset="0" stopColor={col} stopOpacity={.9} /><stop offset=".45" stopColor={col} stopOpacity={.3} /><stop offset="1" stopColor={col} stopOpacity={0} /></radialGradient></defs><circle cx={x} cy={y} r={r} fill={`url(#${id})`} /></g>); };
export const DarkFilter: React.FC<{ id: string; k: number; blue?: number }> = ({ id, k, blue = .05 }) => (<filter id={id} colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values={`${1 - k * .86} 0 0 0 0  0 ${1 - k * .84} 0 0 0  0 0 ${1 - k * .7} 0 ${k * blue}  0 0 0 1 0`} /></filter>);

// ───── реквизит ─────
export const Doshirak: React.FC<{ x: number; y: number; s?: number; open?: boolean; fork?: number; t?: number; steam?: number }> = ({ x, y, s = 1, open = true, fork = 0, t = 0, steam = 0 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M-62,-58 L62,-58 L52,50 Q0,58 -52,50 Z" fill="#F6F2EA" /><path d="M14,-58 L62,-58 L52,50 Q30,55 20,54 Z" fill="#000" opacity={.08} />
    <path d="M-59,-24 L59,-24 L56,6 L-56,6 Z" fill="#D63A2E" /><path d="M-57,-14 L57,-14" stroke="#F2C14E" strokeWidth={3} /><circle cx={-18} cy={-9} r={9} fill="#F2C14E" />
    <ellipse cx={0} cy={-58} rx={62} ry={13} fill="#E6DCC4" />
    {open ? <><ellipse cx={0} cy={-57} rx={54} ry={9} fill="#E9C46A" />{[-34, -18, -2, 14, 30].map(dx => <path key={dx} d={`M${dx},-62 q6,4 -2,8 q-6,3 2,7`} stroke="#C99A3A" strokeWidth={2.4} fill="none" />)}<path d="M40,-66 L74,-92 L80,-82 L50,-60 Z" fill="#D9D2C2" /></>
      : <ellipse cx={0} cy={-60} rx={60} ry={11} fill="#E8E2D6" />}
    {fork > 0 && <g transform={`translate(14,-60) rotate(${28 + Math.sin(t * 55) * 6 * fork})`}><rect x={-3.5} y={-110} width={7} height={110} rx={3} fill="#C9CDD6" />{[-6, 0, 6].map(dx => <rect key={dx} x={dx - 1.5} y={-130} width={3} height={24} fill="#C9CDD6" />)}</g>}
    {steam > 0 && [0, 1, 2].map(i => { const ph = (t * .55 + i / 3) % 1; return <ellipse key={i} cx={Math.sin(t * 1.4 + i) * 14 * ph} cy={-80 - ph * 150} rx={18 + ph * 26} ry={14 + ph * 20} fill="#fff" opacity={.2 * steam * Math.sin(ph * Math.PI)} style={{ filter: 'blur(6px)' }} />; })}
  </g>);
export const Kettle: React.FC<{ x: number; y: number; s?: number; rot?: number }> = ({ x, y, s = 1, rot = 0 }) => (<g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
  <path d="M-58,60 L-46,-62 Q0,-82 46,-62 L58,60 Z" fill="#F4F1EA" /><path d="M10,-70 Q46,-62 46,-62 L58,60 L18,60 Z" fill="#000" opacity={.07} />
  <path d="M-48,-36 L-96,-64 L-92,-48 L-50,-12 Z" fill="#F4F1EA" /><rect x={40} y={-56} width={30} height={96} rx={13} fill="#2E5AA8" /><rect x={-60} y={52} width={120} height={14} rx={4} fill="#2E5AA8" /><rect x={-26} y={-82} width={52} height={12} rx={6} fill="#2E5AA8" /><circle cx={-28} cy={30} r={6} fill="#3DA5FF" /></g>);
export const Iron: React.FC<{ x: number; y: number; s?: number; rot?: number; on?: number; steam?: number; t?: number }> = ({ x, y, s = 1, rot = 0, on = 1, steam = 0, t = 0 }) => (<g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
  {steam > 0 && [0, 1, 2, 3].map(i => { const ph = (t * .9 + i / 4) % 1; return <ellipse key={i} cx={-50 + i * 34} cy={24 - ph * 110} rx={12 + ph * 30} ry={10 + ph * 22} fill="#fff" opacity={.25 * steam * Math.sin(ph * Math.PI)} style={{ filter: 'blur(5px)' }} />; })}
  <path d="M-92,30 Q-82,-30 30,-34 L92,30 Z" fill="#2E6FD6" /><path d="M-96,30 L96,30 L82,44 L-90,44 Z" fill="#C9CDD6" /><path d="M-50,-68 L42,-68 Q50,-68 46,-50 L36,-36 L-44,-36 Z" fill="#1E3F7A" />
  <path d="M10,-32 L30,-34 L92,30 L60,30 Z" fill="#000" opacity={.12} /><circle cx={-12} cy={-6} r={6} fill={on ? '#FF6B4A' : '#3a3a40'} />{on > 0 && <Glow x={-12} y={-6} r={26} col="#FF6B4A" a={.8} />}</g>);
export const Mug: React.FC<{ x: number; y: number; s?: number; t?: number; ripple?: number; jitter?: number }> = ({ x, y, s = 1, t = 0, ripple = 0, jitter = 0 }) => (<g transform={`translate(${x + jitter},${y}) scale(${s})`}>
  <path d="M-62,-56 L62,-56 L54,58 Q0,66 -54,58 Z" fill="#F4F1EA" /><path d="M62,-30 C96,-30 96,30 58,34" stroke="#F4F1EA" strokeWidth={14} fill="none" /><path d="M20,-56 L62,-56 L54,58 Q36,62 26,62 Z" fill="#000" opacity={.07} />
  <path d="M-50,-10 L50,-10" stroke="#2E5AA8" strokeWidth={6} /><ellipse cx={0} cy={-56} rx={62} ry={14} fill="#E2D8C4" /><ellipse cx={0} cy={-55} rx={53} ry={10} fill="#7A3E18" />
  {ripple > 0 && <g>{[0, 1, 2, 3].map(i => { const r = (t * 2.2 + i / 4) % 1; return <ellipse key={i} cx={0} cy={-55} rx={53 * r} ry={10 * r} fill="none" stroke="#FFE2B8" strokeWidth={2.2} opacity={.6 * ripple * (1 - r)} />; })}</g>}</g>);
export const PhoneDevice: React.FC<{ x: number; y: number; s?: number; rot?: number; screen?: number; back?: boolean; torch?: number }> = ({ x, y, s = 1, rot = 0, screen = 0, back = false, torch = 0 }) => (<g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
  <rect x={-17} y={-34} width={34} height={68} rx={7} fill="#16181f" />{!back ? <rect x={-14} y={-30} width={28} height={60} rx={5} fill={screen > 0 ? '#7FB3FF' : '#0a0c12'} opacity={screen > 0 ? .5 + .5 * screen : 1} /> : <><rect x={-12} y={-30} width={11} height={15} rx={3} fill="#2b2f3a" />{torch > 0 && <circle cx={-6.5} cy={-25} r={3.5} fill="#fffbe8" />}</>}
  {!back && screen > 0 && <Glow x={0} y={0} r={70} col="#7FB3FF" a={.6 * screen} />}</g>);
export const Router: React.FC<{ x: number; y: number; s?: number; t: number; lost: boolean }> = ({ x, y, s = 1, t, lost }) => (<g transform={`translate(${x},${y}) scale(${s})`}>
  <path d="M-48,-14 L-58,-74 M48,-14 L58,-74" stroke="#1D2028" strokeWidth={6} strokeLinecap="round" /><rect x={-72} y={-18} width={144} height={36} rx={10} fill="#1D2028" />
  {[0, 1, 2, 3].map(i => { const b = lost ? (Math.sin(t * 10) > 0 ? 1 : .15) : (Math.sin(t * 17 + i * 3) > -.6 ? 1 : .4); const red = lost && i < 2; return <g key={i}><circle cx={-42 + i * 28} cy={0} r={5} fill={red ? `rgba(229,56,59,${b})` : lost ? '#3a3a44' : `rgba(61,220,132,${b})`} />{red && b > .5 && <Glow x={-42 + i * 28} y={0} r={26} col="#E5383B" />}</g>; })}</g>);
export const Monitor: React.FC<{ x: number; y: number; s?: number; on?: number; t?: number }> = ({ x, y, s = 1, on = 1, t = 0 }) => (<g transform={`translate(${x},${y}) scale(${s})`}>
  <rect x={-150} y={-110} width={300} height={200} rx={10} fill="#1A1C22" /><rect x={-138} y={-98} width={276} height={176} rx={5} fill={on ? '#EEF3FF' : '#07080b'} />
  {on > 0 && <g><rect x={-122} y={-84} width={130} height={14} fill="#2E5AA8" />{Array.from({ length: 7 }, (_, i) => <rect key={i} x={-122} y={-58 + i * 18} width={220 - (i % 3) * 50} height={7} fill="rgba(30,40,70,.45)" />)}<rect x={-122} y={-58 + 4 * 18} width={90} height={7} fill="rgba(229,56,59,.7)" /><rect x={-122 + ((t * 40) % 200)} y={-58 + 6 * 18} width={3} height={12} fill="#2E5AA8" /></g>}
  <rect x={-18} y={90} width={36} height={44} fill="#1A1C22" /><rect x={-60} y={130} width={120} height={10} rx={4} fill="#1A1C22" /></g>);

const Lamp: React.FC<{ x: number; y: number; on: number; swing: number }> = ({ x, y, on, swing }) => (<g transform={`translate(${x},0) rotate(${swing})`}>
  <line x1={0} y1={-40} x2={0} y2={y - 28} stroke="#3A3030" strokeWidth={5} />{on > 0 && <Glow x={0} y={y + 40} r={620} col="#FFC878" a={.55 * on} />}
  <rect x={-96} y={y - 32} width={192} height={14} rx={7} fill="#B8893A" />{[-80, 0, 80].map(dx => <g key={dx}><path d={`M${dx - 34},${y + 42} L${dx - 18},${y - 20} L${dx + 18},${y - 20} L${dx + 34},${y + 42} Z`} fill={on > 0 ? mix('#8a8478', '#FFF0C8', on) : '#7a7468'} />{on > 0 && <Glow x={dx} y={y + 34} r={90} col="#FFE0A0" a={.8 * on} />}</g>)}</g>);
const CityOutside: React.FC<{ x: number; y: number; w: number; h: number; lit: number; t: number }> = ({ x, y, w, h, lit, t }) => { const r = (n: number) => { const s = Math.sin(n * 12.9898) * 43758.5453; return s - Math.floor(s); };
  return (<g><clipPath id={`co${x}${y}`}><rect x={x} y={y} width={w} height={h} /></clipPath><g clipPath={`url(#co${x}${y})`}>
    <rect x={x} y={y} width={w} height={h} fill="url(#skyWin)" /><defs><linearGradient id="skyWin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0E1530" /><stop offset="1" stopColor="#3A3050" /></linearGradient></defs>
    <path d={`M${x},${y + h * .42} L${x + w * .2},${y + h * .3} L${x + w * .35},${y + h * .38} L${x + w * .55},${y + h * .26} L${x + w * .75},${y + h * .36} L${x + w},${y + h * .3} L${x + w},${y + h} L${x},${y + h} Z`} fill="#1A2340" />
    {[0, 1, 2, 3].map(b => { const bx = x + b * w / 3.4 - 10, bw = w / 3.8, by = y + h * (.42 + r(b) * .14); return <g key={b}><rect x={bx} y={by} width={bw} height={h} fill={mix('#1a2140', '#2a2a48', r(b + 5))} />{Array.from({ length: 15 }, (_, i) => { const on = r(b * 31 + i) > .3 && lit > 0; return <rect key={i} x={bx + 8 + (i % 3) * bw / 3.2} y={by + 12 + Math.floor(i / 3) * 34} width={bw / 5} height={18} fill={on ? '#F2B33D' : '#141a2c'} opacity={on ? .9 * lit : 1} />; })}</g>; })}
    {lit > 0 && <Glow x={x + w / 2} y={y + h} r={w * .7} col="#F2B33D" a={.45 * lit} />}</g></g>); };

export type KitchenOpts = { t: number; on?: number; swing?: number; tvOn?: number; routerLost?: boolean; pcOn?: number; ironOn?: number; outside?: number };
export const KitchenBack: React.FC<KitchenOpts> = ({ t, on = 1, swing = 0, routerLost = false, pcOn = 1, outside = 1 }) => (<g>
  <defs><linearGradient id="wallG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#EAD8B6" /><stop offset="1" stopColor="#D2B98E" /></linearGradient>
    <pattern id="wallP" width="64" height="64" patternUnits="userSpaceOnUse"><rect width="64" height="64" fill="none" /><path d="M32,8 l6,10 l-6,10 l-6,-10 Z" fill="#B89A6A" opacity=".18" /><rect x="0" width="3" height="64" fill="#fff" opacity=".1" /></pattern></defs>
  <rect x={-200} y={-200} width={1480} height={1500} fill="url(#wallG)" /><rect x={-200} y={-200} width={1480} height={1500} fill="url(#wallP)" />
  <rect x={-200} y={1100} width={1480} height={20} fill="#B89A72" />
  {/* окно на проспект с занавесками */}
  <CityOutside x={560} y={370} w={330} h={480} lit={outside} t={t} /><rect x={552} y={362} width={346} height={496} rx={6} fill="none" stroke="#F4F1EA" strokeWidth={18} /><line x1={725} y1={362} x2={725} y2={858} stroke="#F4F1EA" strokeWidth={10} /><line x1={552} y1={510} x2={898} y2={510} stroke="#F4F1EA" strokeWidth={10} />
  <rect x={520} y={858} width={410} height={24} rx={4} fill="#F4F1EA" />
  {[[-1, 548], [1, 902]].map(([sd, cx]) => <path key={sd} d={`M${cx},330 C${cx + sd * 60},500 ${cx + sd * 30},700 ${cx + sd * 50},880 L${cx + sd * 120},880 C${cx + sd * 110},700 ${cx + sd * 130},500 ${cx + sd * 100},330 Z`} fill="#E28F4A" opacity={.95} />)}
  {[[-1, 548], [1, 902]].map(([sd, cx]) => <path key={'f' + sd} d={`M${cx + sd * 40},340 C${cx + sd * 60},560 ${cx + sd * 50},720 ${cx + sd * 70},880`} stroke="#B86A2E" strokeWidth={6} fill="none" opacity={.6} />)}
  <rect x={500} y={322} width={450} height={16} rx={8} fill="#7A5A3A" />
  {/* календарь */}
  <g transform="translate(400,430)"><rect width={130} height={150} fill="#F4F1EA" /><rect width={130} height={38} fill="#C8372E" />{Array.from({ length: 12 }, (_, i) => <rect key={i} x={12 + (i % 4) * 28} y={52 + Math.floor(i / 4) * 30} width={18} height={18} fill="rgba(30,30,40,.22)" />)}</g>
  {/* ТВ на кронштейне и полка с роутером над углом Алихана */}
  <rect x={170} y={460} width={14} height={60} fill="#2a2a30" /><rect x={40} y={330} width={290} height={170} rx={8} fill="#0d0e12" /><rect x={50} y={340} width={270} height={150} rx={4} fill="#06070a" />
  <rect x={30} y={600} width={330} height={16} rx={4} fill="#8A6A4A" /><Router x={110} y={582} s={.62} t={t} lost={routerLost} /><rect x={230} y={540} width={44} height={60} rx={6} fill="#5E8C5A" /><rect x={290} y={556} width={46} height={44} rx={4} fill="#C9A45A" />
  {/* угол Алихана: стол и ПК */}
  <rect x={-40} y={930} width={360} height={24} fill="#6B4A32" /><rect x={-30} y={954} width={18} height={400} fill="#5a3e2a" /><rect x={290} y={954} width={18} height={400} fill="#5a3e2a" />
  <Monitor x={120} y={810} s={.72} on={pcOn} t={t} />{pcOn > 0 && <Glow x={120} y={800} r={300} col="#7FB3FF" a={.5 * pcOn} />}<rect x={210} y={980} width={80} height={200} rx={8} fill="#2A2C34" /><circle cx={250} cy={1004} r={5} fill={pcOn ? '#3DDC84' : '#222'} />
  <Lamp x={430} y={210} on={on} swing={swing} />
</g>);
// стол с клеёнкой в красно-белую клетку (перспектива), y — верх столешницы
export const Table: React.FC<{ x0?: number; x1?: number; y: number; drop?: number }> = ({ x0 = 150, x1 = 760, y, drop = 700 }) => { const id = `oc${x0}${y}`; return (<g>
  <defs><pattern id={id} width="80" height="80" patternUnits="userSpaceOnUse"><rect width="80" height="80" fill="#F6EFE4" /><rect width="40" height="40" fill="#D8423A" opacity=".55" /><rect x="40" y="40" width="40" height="40" fill="#D8423A" opacity=".55" /><rect width="80" height="2" y="19" fill="#fff" opacity=".2" /></pattern>
    <pattern id={id + 'p'} width="80" height="40" patternUnits="userSpaceOnUse" patternTransform="scale(1,.45)"><rect width="80" height="40" fill="#F6EFE4" /><rect width="40" height="40" fill="#D8423A" opacity=".55" /></pattern></defs>
  <path d={`M${x0 + 60},${y} L${x1 - 60},${y} L${x1 + 30},${y + 150} L${x0 - 30},${y + 150} Z`} fill={`url(#${id}p)`} /><rect x={x0 - 30} y={y + 150} width={x1 - x0 + 60} height={drop} fill={`url(#${id})`} /><rect x={x0 - 30} y={y + 150} width={x1 - x0 + 60} height={14} fill="#000" opacity={.18} />
  <defs><linearGradient id={id + 'sh'} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1a0e14" stopOpacity=".25" /><stop offset=".5" stopColor="#1a0e14" stopOpacity=".6" /><stop offset="1" stopColor="#0b0710" stopOpacity=".85" /></linearGradient></defs><rect x={x0 - 30} y={y + 150} width={x1 - x0 + 60} height={drop} fill={`url(#${id}sh)`} /></g>); };
// гладильная доска с рубашкой
export const IroningBoard: React.FC<{ x: number; y: number; s?: number; shirt?: boolean }> = ({ x, y, s = 1, shirt = true }) => (<g transform={`translate(${x},${y}) scale(${s})`}>
  <path d="M-60,30 L120,330 M120,30 L-60,330" stroke="#8A8F99" strokeWidth={10} strokeLinecap="round" />
  <path d="M-260,0 Q-300,0 -300,20 Q-300,40 -260,40 L280,40 L300,20 L280,0 Z" fill="#7FA6C9" /><path d="M-260,0 L280,0" stroke="#5E86AA" strokeWidth={3} /><path d="M-280,40 L290,40" stroke="#4A6A88" strokeWidth={8} />
  {shirt && <g><path d="M-200,-6 L160,-10 L190,26 L-220,32 Z" fill="#DDE8F3" /><path d="M-60,-8 L0,22 L60,-10 L74,10 L0,38 L-74,12 Z" fill="#BCCADB" /><path d="M160,-10 L250,-4 L262,18 L190,26 Z" fill="#CFDCEA" /></g>}</g>);
export const lightK = (t: number, outAt: number) => t < outAt ? 1 : 0;
export { clamp };
