// Город (SVG): небо с луной и тучами, хребет Алатау в три слоя со снегом по склонам, ЖК в объёме (фасад + торец + балконы),
// ориентиры по рефам (Кок-Тобе, «Нурлы Тау», гостиница с «короной», Вознесенский собор), деревья, фонари, прохожие, машины и такси.
import React from 'react';
import { clamp, lerp, mix } from '../anim';
import { Glow } from './Kitchen';

const rnd = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
// хребет: середина отрезка смещается случайно (фрактал)
const ridgePts = (seed: number, y: number, amp: number, n = 64) => { let pts = [[-100, y - amp * .4], [1180, y - amp * .5]]; let d = amp;
  for (let it = 0; it < 6; it++) { const np: number[][] = []; for (let i = 0; i < pts.length - 1; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1]; np.push(pts[i], [(x0 + x1) / 2, (y0 + y1) / 2 + (rnd(seed + it * 97 + i) - .5) * d]); } np.push(pts[pts.length - 1]); pts = np; d *= .55; }
  return pts.slice(0, n * 2); };
export const Sky: React.FC<{ glow?: number; moon?: [number, number] | null; storm?: number; t: number; dark?: number }> = ({ glow = 1, moon = null, storm = 0, t, dark = 0 }) => (<g>
  <defs><linearGradient id={`sky${Math.round(glow * 10)}${Math.round(dark * 10)}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={mix('#0B1020', '#05070f', dark)} /><stop offset=".55" stopColor={mix('#1E2850', '#10162c', dark)} /><stop offset="1" stopColor={mix(mix('#1A2340', '#7A5040', .6 * glow), '#0e1222', dark)} /></linearGradient></defs>
  <rect x={-200} y={-200} width={1480} height={2400} fill={`url(#sky${Math.round(glow * 10)}${Math.round(dark * 10)})`} />
  {moon && <><Glow x={moon[0]} y={moon[1]} r={260} col="#DDE4FF" a={.35} /><circle cx={moon[0]} cy={moon[1]} r={42} fill="#EEF1FA" /><circle cx={moon[0] + 12} cy={moon[1] - 8} r={9} fill="#D6DCEC" /></>}
  {Array.from({ length: 7 }, (_, i) => <ellipse key={i} cx={((i * 197 + t * 10) % 1500) - 200} cy={260 + (i % 4) * 120} rx={260 + (i % 3) * 70} ry={60 + (i % 2) * 30} fill={glow > .3 ? '#5a4658' : '#262c48'} opacity={.5} style={{ filter: 'blur(18px)' }} />)}
  {storm > 0 && <Glow x={760} y={380} r={620} col="#B9C6FF" a={.5 * storm} />}</g>);
export const Mountains: React.FC<{ y: number; amp?: number; seed?: number; moon?: number; layers?: number }> = ({ y, amp = 300, seed = 3, moon = .6, layers = 3 }) => (<g>
  {Array.from({ length: layers }, (_, L) => { const ly = y + L * 70, la = amp * (1 - L * .22), pts = ridgePts(seed + L * 11, ly, la), col = ['#33406a', '#24305a', '#182246'][L] || '#182246', id = `mt${seed}${L}`;
    const d = `M-100,${ly + 600} ` + pts.map(p => `L${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ') + ` L1180,${ly + 600} Z`;
    const snowLine = ly - la * .25; const snow = pts.map((p, i) => { const depth = Math.max(0, snowLine - p[1]) * (.55 + rnd(seed + i) * .5); return [p[0], p[1] + depth]; });
    const sd = `M${pts[0][0]},${pts[0][1]} ` + pts.map(p => `L${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ') + ' ' + [...snow].reverse().map(p => `L${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ') + ' Z';
    return (<g key={L}><defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={mix(col, '#ffffff', .08)} /><stop offset="1" stopColor={mix(col, '#0B1020', .5)} /></linearGradient></defs>
      <path d={d} fill={`url(#${id})`} /><path d={sd} fill={mix('#DDE4F4', col, L * .25)} opacity={.55 + moon * .35 - L * .1} />
      {pts.filter((_, i) => i % 3 === 0 && pts[i][1] < snowLine).map((p, i) => <path key={i} d={`M${p[0]},${p[1] + 4} q${(rnd(i + seed) - .5) * 20},${30} ${(rnd(i + 3) - .5) * 30},${60 + rnd(i) * 40}`} stroke={mix(col, '#000000', .25)} strokeWidth={4} fill="none" opacity={.5} />)}
      <path d={pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')} stroke="#E8EEFF" strokeWidth={2.5} fill="none" opacity={.25 * moon} />
      {L < layers - 1 && <rect x={-100} y={ly - 40} width={1280} height={300} fill="#2a3054" opacity={.18} style={{ filter: 'blur(30px)' }} />}</g>); })}</g>);
const winCol = (k: number, n: number) => k > 0 ? [ '#F2B33D', '#FFD27A', '#EDE6D6', '#9FC4FF' ][Math.floor(rnd(n) * 4)] : '#121829';
// ЖК: фасад + торец (перспектива), балконы; lit(этаж, колонка) → 0..1
export const Zhk: React.FC<{ x: number; base: number; w: number; floors: number; fh?: number; side?: number; col?: string; lit: (f: number, c: number) => number; seed?: number }> = ({ x, base, w, floors, fh = 38, side = 70, col = '#3E4560', lit, seed = 1 }) => {
  const h = floors * fh + 30, top = base - h, cols = Math.max(3, Math.floor(w / 36)), cw = (w - 20) / cols;
  return (<g><path d={`M${x + w},${top} L${x + w + side},${top - side * .35} L${x + w + side},${base - side * .1} L${x + w},${base} Z`} fill={mix(col, '#000000', .35)} />
    <rect x={x} y={top} width={w} height={h} fill={col} /><path d={`M${x},${top} L${x + side},${top - side * .35} L${x + w + side},${top - side * .35} L${x + w},${top} Z`} fill={mix(col, '#ffffff', .12)} />
    <rect x={x + w * .1} y={top - 30} width={36} height={30} fill={mix(col, '#000000', .2)} /><line x1={x + w * .7} y1={top} x2={x + w * .7} y2={top - 60} stroke="#222838" strokeWidth={3} />
    {Array.from({ length: floors }, (_, f) => (<g key={f}>{Array.from({ length: cols }, (_, c) => { const k = lit(f, c), cc = winCol(k, seed * 1000 + f * 37 + c);
      return <g key={c}><rect x={x + 10 + c * cw + 4} y={top + 22 + f * fh} width={cw - 8} height={fh * .55} fill={cc} opacity={k > 0 ? .55 + .45 * k : 1} />{k > 0 && rnd(seed + f * 7 + c) > .6 && <rect x={x + 10 + c * cw + 4} y={top + 22 + f * fh} width={(cw - 8) * .3} height={fh * .55} fill="#7a3a2a" opacity={.5} />}</g>; })}
      <rect x={x} y={top + 22 + f * fh + fh * .62} width={w} height={5} fill="#fff" opacity={.08} />
      {Array.from({ length: 3 }, (_, c) => { const k = lit(f, cols + c); return <path key={'s' + c} d={`M${x + w + 10 + c * side / 3.2},${top + 22 + f * fh - (10 + c * side / 3.2) * .35 + 8} l${side / 4.5},${-side / 4.5 * .35} l0,${fh * .5} l${-side / 4.5},${side / 4.5 * .35} Z`} fill={k > 0 ? '#E8A43A' : '#0e1322'} opacity={k > 0 ? .7 : 1} />; })}</g>))}
  </g>); };
// «Нурлы Тау»: ступенчатые стеклянные башни с пирамидальными верхами
export const NurlyTau: React.FC<{ x: number; base: number; s?: number; lit: (id: number, f: number, c: number) => number }> = ({ x, base, s = 1, lit }) => {
  const tower = (tx: number, tw: number, th: number, id: number) => (<g key={id}><rect x={tx} y={-th} width={tw} height={th} fill="#4A4862" /><rect x={tx + tw * .58} y={-th} width={tw * .42} height={th} fill="#36344a" />
    <path d={`M${tx - 8},${-th} L${tx + tw / 2},${-th - tw * .75} L${tx + tw + 8},${-th} Z`} fill="#5C5A76" /><path d={`M${tx + tw / 2},${-th - tw * .75} L${tx + tw + 8},${-th} L${tx + tw / 2},${-th} Z`} fill="#45435c" />
    <rect x={tx - 14} y={-th * .62} width={14} height={th * .62} fill="#3E3C54" /><rect x={tx + tw} y={-th * .5} width={14} height={th * .5} fill="#2c2a3e" />
    {Array.from({ length: Math.floor(th / 30) - 1 }, (_, f) => Array.from({ length: 4 }, (_, c) => { const k = lit(id, f, c); return <rect key={f + '_' + c} x={tx + 9 + c * (tw - 18) / 4} y={-th + 22 + f * 30} width={(tw - 18) / 4 - 6} height={17} fill={k > 0 ? '#FFD27A' : '#151a2c'} opacity={k > 0 ? .9 : 1} />; }))}</g>);
  return (<g transform={`translate(${x},${base}) scale(${s})`}>{tower(-180, 140, 600, 0)}{tower(60, 128, 500, 1)}{tower(-50, 96, 360, 2)}
    <rect x={-230} y={-150} width={480} height={150} fill="#3B394F" />{Array.from({ length: 10 }, (_, c) => <rect key={c} x={-216 + c * 46} y={-118} width={34} height={44} fill={lit(3, 0, c) > 0 ? '#FFD27A' : '#151a2c'} />)}</g>); };
// гостиница по рефу: высокая скруглённая башня с горизонтальными лентами окон и «короной»
export const HotelTower: React.FC<{ x: number; base: number; s?: number; lit: (f: number, c: number) => number; crown: number; red?: number }> = ({ x, base, s = 1, lit, crown, red = 1 }) => {
  const w = 230, h = 660; return (<g transform={`translate(${x},${base}) scale(${s})`}><defs><linearGradient id="hotelG" x1="0" x2="1"><stop offset="0" stopColor="#353149" /><stop offset=".45" stopColor="#5D5774" /><stop offset="1" stopColor="#29263b" /></linearGradient></defs>
    <rect x={-w / 2} y={-h} width={w} height={h} rx={34} fill="url(#hotelG)" />
    {Array.from({ length: 21 }, (_, f) => Array.from({ length: 10 }, (_, c) => { const k = lit(f, c), cx = -w / 2 + 12 + c * (w - 24) / 10; return <rect key={f + '_' + c} x={cx} y={-h + 52 + f * 28} width={(w - 24) / 10 - 4} height={14} fill={k > 0 ? (rnd(f * 10 + c) > .8 ? '#EDE6D6' : '#FFC860') : '#141826'} opacity={k > 0 ? .85 : 1} />; }))}
    <path d={`M${-w / 2 - 6},${-h + 14} ` + Array.from({ length: 13 }, (_, i) => `L${-w / 2 + i * w / 12},${-h - (i % 2 ? 50 : 12)}`).join(' ') + ` L${w / 2 + 6},${-h + 14} Z`} fill="#4E4866" />
    {crown > 0 && <><rect x={-w / 2} y={-h + 2} width={w} height={12} fill="#FFD27A" opacity={crown} /><Glow x={0} y={-h - 16} r={170} col="#FFC870" a={.5 * crown} /></>}
    {[-84, 0, 84].map(dx => <circle key={dx} cx={dx} cy={-h - 54} r={6} fill="#E5383B" opacity={red} />)}
    <rect x={-w * .95} y={-96} width={w * 1.9} height={96} fill="#33304a" />{Array.from({ length: 10 }, (_, c) => <rect key={c} x={-w * .9 + c * 42} y={-70} width={30} height={32} fill={lit(22, c) > 0 ? '#FFC860' : '#141826'} />)}</g>); };
// Вознесенский собор по рефу: колокольня с шатром, луковичные купола с узором, фронтон, подсветка
export const Cathedral: React.FC<{ x: number; base: number; s?: number; k: number }> = ({ x, base, s = 1, k }) => {
  const wall = mix('#4A3E5C', '#F0D08A', k), wall2 = mix('#3a3050', '#D9B470', k), gold = mix('#5A4E66', '#F6C94E', k), dome = mix('#463c58', '#86B0D2', k), win = k > 0 ? '#FFF0B8' : '#1a1630';
  const onion = (dx: number, y: number, r: number) => (<g key={dx}><rect x={dx - r * .78} y={y} width={r * 1.56} height={r * 1.1} fill={wall2} /><path d={`M${dx - r},${y} Q${dx - r * 1.15},${y - r * 1.3} ${dx},${y - r * 2} Q${dx + r * 1.15},${y - r * 1.3} ${dx + r},${y} Z`} fill={dome} />
    {[-2, -1, 0, 1, 2].map(i => <path key={i} d={`M${dx + i * r * .36},${y - 2} Q${dx + i * r * .22},${y - r * 1.2} ${dx},${y - r * 1.95}`} stroke={gold} strokeWidth={3.5} fill="none" />)}<rect x={dx - 2.5} y={y - r * 2.9} width={5} height={r * .95} fill={gold} /><rect x={dx - 11} y={y - r * 2.6} width={22} height={4} fill={gold} /></g>);
  return (<g transform={`translate(${x},${base}) scale(${s})`}>{k > 0 && <Glow x={0} y={-280} r={560} col="#FFC870" a={.45 * k} />}
    <rect x={-240} y={-270} width={480} height={270} fill={wall} /><rect x={-240} y={-270} width={480} height={18} fill={wall2} /><rect x={-64} y={-480} width={128} height={220} fill={wall} /><rect x={-40} y={-580} width={80} height={110} fill={wall2} />
    <path d={`M-46,-580 L0,-680 L46,-580 Z`} fill={gold} /><rect x={-3} y={-730} width={6} height={52} fill={gold} /><rect x={-17} y={-714} width={34} height={5} fill={gold} />
    {onion(-170, -370, 52)}{onion(170, -370, 52)}{onion(0, -480, 0.01)}
    <path d="M-120,-270 L0,-345 L120,-270 Z" fill={wall2} /><path d="M-90,-275 L0,-330 L90,-275 Z" fill={mix(wall2, '#000000', .1)} />
    {[0, 1, 2, 3, 4].map(i => <rect key={i} x={-180 + i * 82} y={-215} width={40} height={84} rx={20} fill={win} opacity={k > 0 ? .9 : 1} />)}<rect x={-34} y={-128} width={68} height={128} rx={34} fill={win} /><rect x={-22} y={-450} width={44} height={66} rx={22} fill={win} />
    {[-200, 200].map(dx => <rect key={dx} x={dx - 8} y={-270} width={16} height={270} fill={wall2} />)}</g>); };
// Кок-Тобе: холм, мачта в красно-белую полоску с площадками, огни; круглое здание на вершине
export const KokTobe: React.FC<{ x: number; base: number; s?: number; red: number; lit: number }> = ({ x, base, s = 1, red, lit }) => { const tx = 60, ty = -380;
  return (<g transform={`translate(${x},${base}) scale(${s})`}><path d="M-560,0 Q-150,-440 300,-340 Q540,-290 760,0 Z" fill="#17222a" /><path d="M-560,0 Q-150,-440 300,-340 Q540,-290 760,0" stroke="#2a3a40" strokeWidth={6} fill="none" />
    <path d={`M${tx - 30},${ty} L${tx - 9},${ty - 540} L${tx + 9},${ty - 540} L${tx + 30},${ty} Z`} fill="#C3C8D4" /><path d={`M${tx},${ty} L${tx + 9},${ty - 540} L${tx + 30},${ty} Z`} fill="#9AA0AE" />
    {Array.from({ length: 12 }, (_, i) => <line key={i} x1={tx - 26 + i * 1.6} y1={ty - i * 45} x2={tx + 26 - i * 1.6} y2={ty - (i + 1) * 45} stroke="#8A90A0" strokeWidth={2.5} />)}
    <rect x={tx - 62} y={ty - 590} width={124} height={46} rx={22} fill="#B6BCCA" /><rect x={tx - 46} y={ty - 632} width={92} height={42} rx={18} fill="#A6ACBA" />{lit > 0 && Array.from({ length: 5 }, (_, i) => <rect key={i} x={tx - 52 + i * 22} y={ty - 578} width={14} height={14} fill="#FFD27A" />)}
    {Array.from({ length: 7 }, (_, i) => <rect key={i} x={tx - 7} y={ty - 660 - i * 46} width={14} height={23} fill={i % 2 ? '#E9ECF2' : '#C8372E'} />)}<rect x={tx - 3} y={ty - 1000} width={6} height={340} fill="#C3C8D4" />
    {[ty - 1000, ty - 830, ty - 640, ty - 440].map(yy => <g key={yy} opacity={red}><circle cx={tx} cy={yy} r={10} fill="#E5383B" /><Glow x={tx} y={yy} r={70} col="#E5383B" /></g>)}
    <rect x={-190} y={-378} width={280} height={96} rx={40} fill="#3A3450" />{Array.from({ length: 6 }, (_, i) => <rect key={i} x={-168 + i * 42} y={-358} width={30} height={44} fill={lit > 0 ? '#FFD27A' : '#151a2c'} />)}</g>); };
export const Tree: React.FC<{ x: number; y: number; s?: number; dark?: number; seed?: number; autumn?: boolean }> = ({ x, y, s = 1, dark = 0, seed = 1, autumn = false }) => (<g transform={`translate(${x},${y}) scale(${s})`}>
  <path d="M-7,0 L-4,-120 L4,-120 L7,0 Z" fill={mix('#2B2016', '#05060c', dark * .6)} /><path d="M0,-90 L-30,-140 M0,-100 L26,-150" stroke={mix('#2B2016', '#05060c', dark * .6)} strokeWidth={5} />
  {Array.from({ length: 7 }, (_, i) => <ellipse key={i} cx={(rnd(seed + i) - .5) * 110} cy={-150 - rnd(seed * 3 + i) * 80} rx={40 + rnd(i + seed) * 22} ry={34 + rnd(i * 2 + seed) * 18} fill={mix(autumn ? ['#C9862E', '#B85A1E', '#D9A441'][i % 3] : ['#2e4a3a', '#3a5a44', '#254032'][i % 3], '#0b1020', dark * .75)} />)}</g>);
export const StreetLamp: React.FC<{ x: number; y: number; h: number; on: number; flip?: boolean }> = ({ x, y, h, on, flip }) => (<g transform={`translate(${x},${y}) scale(${flip ? -1 : 1},1)`}>
  <rect x={-6} y={-h} width={12} height={h} fill="#22262F" /><path d={`M0,${-h} q14,-50 70,-40`} stroke="#22262F" strokeWidth={9} fill="none" /><rect x={50} y={-h - 46} width={58} height={22} rx={8} fill="#22262F" />
  {on > 0 && <><rect x={56} y={-h - 26} width={46} height={7} fill="#FFE2A0" opacity={on} /><Glow x={79} y={-h - 18} r={240} col="#F2B33D" a={.55 * on} /><path d={`M58,${-h - 20} L100,${-h - 20} L240,0 L-90,0 Z`} fill="#F2B33D" opacity={.1 * on} /></>}</g>);
// прохожий: тело, ноги, руки, голова с волосами; позы на общих планах читаются силуэтом
export type PersonPose = 'walk' | 'phone' | 'freeze' | 'look' | 'shrug' | 'shake' | 'hug' | 'run' | 'point';
export const Person: React.FC<{ x: number; y: number; s?: number; t: number; pose?: PersonPose; col?: string; hair?: string; skin?: string; dark?: number; torch?: number; face?: boolean; child?: boolean; seed?: number; dir?: number }> = ({ x, y, s = 1, t, pose = 'walk', col = '#5A6A8A', hair = '#1c1820', skin = '#D9A07A', dark = 0, torch = 0, face = false, child = false, seed = 1, dir = 1 }) => {
  const sc = s * (child ? .62 : 1), ph = t * (pose === 'run' ? 11 : 6.5) + seed, wk = pose === 'walk' || pose === 'run' ? Math.sin(ph) : 0, up = pose === 'look' || pose === 'shrug';
  const cB = mix(col, '#0B1020', dark * .7), sk = mix(skin, '#0B1020', dark * .75), legC = mix('#272b3c', '#0B1020', dark * .5);
  const arms: Record<PersonPose, [[number, number], [number, number]]> = { walk: [[-24, -46 + wk * 22], [24, -46 - wk * 22]], run: [[-30, -70 + wk * 30], [30, -70 - wk * 30]], phone: [[-22, -46], [6, -128]], freeze: [[-26, -60], [26, -60]], look: [[-26, -66], [26, -66]], shrug: [[-66, -132], [66, -132]], shake: [[-22, -46], [34 + Math.sin(t * 30) * 12, -146]], hug: [[30, -104], [-8, -96]], point: [[-24, -50], [70, -150]] };
  const [a1, a2] = arms[pose];
  return (<g transform={`translate(${x},${y}) scale(${sc * dir},${sc})`}>
    <path d={`M-9,-74 L${-9 + wk * 22},0 M9,-74 L${9 - wk * 22},0`} stroke={legC} strokeWidth={17} strokeLinecap="round" />
    <path d="M-28,-164 Q-30,-120 -24,-70 L24,-70 Q30,-120 28,-164 Q0,-176 -28,-164 Z" fill={cB} />
    {[a1, a2].map(([ax, ay], i) => { const sx = i ? 24 : -24; return <g key={i}><path d={`M${sx},-156 Q${sx + ax * .25},${-156 + (ay + 156) * .6} ${ax},${ay}`} stroke={cB} strokeWidth={13} fill="none" strokeLinecap="round" /><circle cx={ax} cy={ay} r={7.5} fill={sk} /></g>; })}
    <ellipse cx={up ? 3 : 0} cy={-196 + (up ? -3 : 0)} rx={27} ry={31} fill={sk} /><path d={`M-28,-200 C-28,-232 28,-232 28,-200 C20,-214 -20,-214 -28,-200 Z`} fill={mix(hair, '#05060c', dark * .5)} />
    {face && <g transform={`translate(0,${up ? -8 : 0})`}>{[-10, 10].map(ex => <g key={ex}><ellipse cx={ex} cy={-196} rx={6} ry={7} fill="#F4F1EA" /><circle cx={ex} cy={-198} r={3.2} fill="#15121A" /></g>)}<path d="M-12,-210 l8,4 M12,-210 l-8,4" stroke={mix(hair, '#05060c', .3)} strokeWidth={3} strokeLinecap="round" /><ellipse cx={0} cy={-178} rx={5} ry={7} fill="#4a1c22" /></g>}
    {(pose === 'phone' || pose === 'shake' || torch > 0) && <g transform={`translate(${a2[0]},${a2[1]})`}><rect x={-7} y={-14} width={14} height={24} rx={3} fill="#16181f" />
      {torch > 0 ? <><path d="M-4,-10 L-80,-300 L80,-300 L4,-10 Z" fill="#FFF8E1" opacity={.18 * torch} /><Glow x={0} y={-12} r={34} col="#FFFBEA" a={torch} /></> : <rect x={-5} y={-12} width={10} height={18} fill="#9fc4ff" opacity={.9} />}</g>}
  </g>); };
// машина сверху в три четверти: кузов, стёкла, колёса, фары с конусами света; taxi — шашечки на крыше
export const Car: React.FC<{ x: number; y: number; s?: number; col?: string; taxi?: boolean; dir?: 1 | -1; beams?: number }> = ({ x, y, s = 1, col = '#2a3044', taxi = false, dir = 1, beams = 1 }) => (<g transform={`translate(${x},${y}) scale(${s}) rotate(${dir > 0 ? 0 : 180})`}>
  {beams > 0 && <path d="M-50,110 L-170,560 L170,560 L50,110 Z" fill="#FFF6DA" opacity={.14 * beams} style={{ filter: 'blur(8px)' }} />}
  <ellipse cx={0} cy={6} rx={84} ry={136} fill="#000" opacity={.35} style={{ filter: 'blur(6px)' }} />
  {[[-66, -70], [66, -70], [-66, 74], [66, 74]].map(([wx, wy], i) => <rect key={i} x={wx - 12} y={wy - 22} width={24} height={44} rx={8} fill="#0c0d12" />)}
  <path d="M-62,-118 Q-70,-60 -68,40 Q-66,104 -50,118 Q0,128 50,118 Q66,104 68,40 Q70,-60 62,-118 Q0,-132 -62,-118 Z" fill={taxi ? '#E8B830' : col} />
  <path d="M-52,-40 Q0,-56 52,-40 L46,40 Q0,50 -46,40 Z" fill={mix(taxi ? '#E8B830' : col, '#ffffff', .12)} /><path d="M-50,-44 Q0,-60 50,-44 L42,-80 Q0,-92 -42,-80 Z" fill="#141a26" /><path d="M-46,44 Q0,54 46,44 L40,76 Q0,84 -40,76 Z" fill="#141a26" />
  {taxi && <g><rect x={-28} y={-12} width={56} height={22} rx={5} fill="#FFE070" /><g>{[0, 1, 2, 3].map(i => <rect key={i} x={-26 + i * 13} y={-10 + (i % 2) * 9} width={13} height={9} fill="#141414" />)}</g><Glow x={0} y={0} r={60} col="#FFD23F" a={.6} /><path d="M-62,-10 L-66,30 M62,-10 L66,30" stroke="#141414" strokeWidth={6} strokeDasharray="8 6" /></g>}
  {[-40, 40].map(hx => <g key={hx}><ellipse cx={hx} cy={118} rx={13} ry={7} fill="#FFFBEA" /><Glow x={hx} y={124} r={70} col="#FFF6DA" a={.7 * beams} /></g>)}
  {[-44, 44].map(hx => <rect key={'r' + hx} x={hx - 12} y={-124} width={24} height={8} rx={3} fill="#E5383B" />)}</g>);
export { clamp, lerp };
