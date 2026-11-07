// Угол сталинки снизу вверх (таблички — на глухом простенке угла, не на окнах), истребитель, прихожая с дерматиновой дверью.
import React from 'react';
import { mix } from '../anim';
import { Glow } from './Kitchen';
import { Tree, StreetLamp } from './City';
const rnd = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

export const FacadeCorner: React.FC<{ t: number }> = ({ t }) => {
  // две стены сходятся на углу x=540; окна начинаются в 190 px от угла — простенок угла глухой, на нём таблички
  const wall = (side: -1 | 1, col: string) => { const sh = side < 0 ? .2 : -.2; return (<g transform={`matrix(1,${sh},0,1,540,0)`}>
    <rect x={side < 0 ? -760 : 0} y={150} width={760} height={1900} fill={col} /><rect x={side < 0 ? -760 : 0} y={1260} width={760} height={700} fill={mix(col, '#000000', .1)} />
    {Array.from({ length: 12 }, (_, i) => <rect key={i} x={side < 0 ? -760 : 0} y={1280 + i * 54} width={760} height={3} fill="#000" opacity={.18} />)}
    <rect x={side < 0 ? -760 : 0} y={110} width={760} height={60} fill="#A28A6C" /><rect x={side < 0 ? -760 : 0} y={160} width={760} height={14} fill="#5E4C3A" />{Array.from({ length: 20 }, (_, i) => <rect key={i} x={(side < 0 ? -760 : 0) + i * 40} y={170} width={20} height={20} fill="#8E775E" />)}
    {Array.from({ length: 5 }, (_, f) => Array.from({ length: 3 }, (_, c) => { const wx = side < 0 ? -320 - c * 150 - 90 : 320 + c * 150, wy = 250 + f * 200; const on = rnd(f * 9 + c + (side < 0 ? 3 : 40)) > .2, arch = f === 3;
      return <g key={f + '_' + c}><rect x={wx - 12} y={wy - 12} width={104} height={150} rx={arch ? 52 : 5} fill="#4C3C2E" /><rect x={wx} y={wy} width={80} height={126} rx={arch ? 40 : 3} fill={on ? (rnd(f + c * 3) > .7 ? '#FFD27A' : '#F2B33D') : '#141a2c'} />
        {on && <><rect x={wx} y={wy + 4} width={18} height={122} fill="#96402a" opacity={.45} /><rect x={wx + 62} y={wy + 4} width={18} height={122} fill="#96402a" opacity={.45} /></>}<line x1={wx + 40} y1={wy} x2={wx + 40} y2={wy + 126} stroke="#2a2018" strokeWidth={5} opacity={.6} /><rect x={wx - 14} y={wy + 130} width={108} height={10} fill="#B8A487" /></g>; }))}
    <rect x={side < 0 ? -305 : 0} y={150} width={305} height={1110} fill={mix(col, '#ffffff', .04)} /></g>); };
  const plate = (cx: number, cy: number, w: number, h: number, sh: number, small: string, big: string, fs: number) => (<g transform={`translate(${cx},${cy}) matrix(1,${sh},0,1,0,0)`}>
    <rect x={-w / 2 + 6} y={-h / 2 + 8} width={w} height={h} rx={10} fill="#000" opacity={.35} /><rect x={-w / 2} y={-h / 2} width={w} height={h} rx={10} fill="#1F4E8C" /><rect x={-w / 2 + 9} y={-h / 2 + 9} width={w - 18} height={h - 18} rx={6} fill="none" stroke="#F4F1EA" strokeWidth={5} />
    <text x={0} y={-h / 2 + 46} textAnchor="middle" fontFamily="Mont" fontWeight={800} fontSize={28} fill="#F4F1EA">{small}</text><text x={0} y={h / 2 - 30} textAnchor="middle" fontFamily="Mont" fontWeight={900} fontSize={fs} fill="#F4F1EA">{big}</text></g>);
  return (<g><rect x={-200} y={-200} width={1480} height={2400} fill="#141c36" /><rect x={-200} y={-200} width={1480} height={600} fill="#0B1020" />
    {wall(-1, '#7E654D')}{wall(1, '#5E4A38')}<rect x={533} y={0} width={14} height={1920} fill="#3A3F4A" />
    {Array.from({ length: 6 }, (_, i) => <Glow key={i} x={i % 2 ? 260 : 820} y={320 + i * 170} r={140} col="#F2B33D" a={.25} />)}
    {plate(388, 780, 250, 190, .2, 'ПРОСПЕКТ', 'АБАЯ', 60)}{plate(694, 780, 290, 190, -.2, 'УЛИЦА', 'БАЙТУРСЫНОВА', 31)}
    <rect x={-100} y={1560} width={1280} height={400} fill="#1e212a" /><rect x={-100} y={1560} width={1280} height={20} fill="#2c303a" />
    <StreetLamp x={900} y={1580} h={560} on={1} /><Tree x={70} y={1600} s={2.2} seed={7} autumn />
    {Array.from({ length: 9 }, (_, i) => { const ph = (t * (.25 + rnd(i) * .2) + rnd(i + 9)) % 1, lx = rnd(i * 3) * 1080 + Math.sin(t * 1.7 + i) * 50, ly = 300 + ph * 1500; return <path key={i} d="M0,-20 Q16,-6 0,22 Q-16,-6 0,-20 Z" transform={`translate(${lx},${ly}) rotate(${Math.sin(t * 2.4 + i) * 80}) scale(${1.2 + rnd(i + 2)})`} fill={['#E8A42A', '#D9782A', '#F2C14E'][i % 3]} />; })}
  </g>); };
// истребитель снизу: острый нос, наплывы, трапециевидное крыло, два киля в ракурсе, два сопла с форсажем
export const Fighter: React.FC<{ x: number; y: number; s: number; rot: number; t: number; burn?: number }> = ({ x, y, s, rot, t, burn = 1 }) => (<g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
  {burn > 0 && [-22, 22].map(sy => <g key={sy}><Glow x={-290} y={sy} r={130} col="#FFA050" a={.85 * burn} /><path d={`M-262,${sy - 12} L${-262 - 100 - Math.sin(t * 40) * 16},${sy} L-262,${sy + 12} Z`} fill="#FFE2A8" opacity={.95 * burn} /></g>)}
  {[0, 1, 2, 3, 4].map(i => <ellipse key={i} cx={-330 - i * 90} cy={0} rx={40 + i * 26} ry={14 + i * 10} fill="#8a8aa0" opacity={.12 - i * .02} style={{ filter: 'blur(8px)' }} />)}
  <path d="M330,0 L200,-22 Q120,-40 60,-70 L10,-232 L-70,-242 L-120,-80 L-170,-78 L-250,-170 L-290,-170 L-262,-36 L-262,36 L-290,170 L-250,170 L-170,78 L-120,80 L-70,242 L10,232 L60,70 Q120,40 200,22 Z" fill="#0E1222" />
  <path d="M330,0 L200,22 Q120,40 60,70 L10,232 L-70,242 L-120,80 L-262,36 L-262,0 Z" fill="#090c18" opacity={.6} />
  {[-1, 1].map(sd => <path key={sd} d={`M-150,${sd * 30} L-252,${sd * 96} L-274,${sd * 96} L-232,${sd * 28} Z`} fill="#171c32" />)}
  <path d="M330,0 L200,-22 Q120,-40 60,-70 L10,-232 L-70,-242" stroke="#F2B33D" strokeOpacity={.35} strokeWidth={4} fill="none" />
  {[-22, 22].map(sy => <rect key={sy} x={-270} y={sy - 13} width={26} height={26} rx={6} fill="#1b2036" />)}</g>);
// прихожая: дверь в дерматине с пуговицами, глазок, ручка, цепочка; куртки на крючках; щель под дверью
export const Hallway: React.FC<{ hit?: { dx: number; dy: number; sc: number }; gap?: { x: number; k: number; feet: number[] } | null }> = ({ hit = { dx: 0, dy: 0, sc: 1 }, gap = null }) => (<g>
  <defs><linearGradient id="hallW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#D9C29C" /><stop offset="1" stopColor="#B89C74" /></linearGradient><pattern id="quilt" width="114" height="102" patternUnits="userSpaceOnUse"><rect width="114" height="102" fill="#4A2C26" /><path d="M57,0 L114,51 L57,102 L0,51 Z" fill="none" stroke="#2E1A16" strokeWidth={4} /><circle cx={57} cy={0} r={6} fill="#C9A45A" /><circle cx={0} cy={51} r={6} fill="#C9A45A" /><circle cx={114} cy={51} r={6} fill="#C9A45A" /><circle cx={57} cy={102} r={6} fill="#C9A45A" /></pattern></defs>
  <rect x={-200} y={-200} width={1480} height={2400} fill="url(#hallW)" /><rect x={250} y={330} width={640} height={1110} fill="#6B5040" />
  <g transform={`translate(${570 + hit.dx},${885 + hit.dy}) scale(${hit.sc}) translate(-570,-885)`}><rect x={285} y={360} width={570} height={1060} rx={14} fill="url(#quilt)" /><rect x={285} y={360} width={570} height={1060} rx={14} fill="url(#doorShade)" />
    <defs><linearGradient id="doorShade" x1="0" x2="1"><stop offset="0" stopColor="#fff" stopOpacity=".06" /><stop offset="1" stopColor="#000" stopOpacity=".25" /></linearGradient></defs>
    <circle cx={570} cy={640} r={15} fill="#C9A45A" /><circle cx={570} cy={640} r={7} fill="#0c0c10" /><rect x={770} y={900} width={28} height={80} rx={8} fill="#C9A45A" /><rect x={700} y={926} width={98} height={24} rx={12} fill="#C9A45A" /><path d="M800,860 Q760,930 820,980" stroke="#8A8F99" strokeWidth={6} fill="none" /></g>
  {[[120, '#26357F'], [190, '#3E3A36']].map(([hx, col]) => <g key={hx as number}><rect x={(hx as number) - 4} y={560} width={8} height={30} fill="#8A8F99" /><path d={`M${(hx as number) - 50},590 L${(hx as number) + 50},590 L${(hx as number) + 70},980 L${(hx as number) - 70},980 Z`} fill={col as string} /></g>)}
  <rect x={960} y={800} width={50} height={80} rx={8} fill="#E8E4DC" /><rect x={285} y={1420} width={570} height={20} fill="#05060a" />
  {gap && <g><defs><linearGradient id="gapG" x1="0" x2="1"><stop offset={Math.max(0, (gap.x - 240 - 285) / 570)} stopColor="#FFFAE6" stopOpacity={0} /><stop offset={(gap.x - 285) / 570} stopColor="#FFFAE6" stopOpacity={gap.k} /><stop offset={Math.min(1, (gap.x + 240 - 285) / 570)} stopColor="#FFFAE6" stopOpacity={0} /></linearGradient></defs>
    <rect x={285} y={1420} width={570} height={20} fill="url(#gapG)" />{gap.feet.map((fx, i) => <rect key={i} x={fx - 36} y={1420} width={72} height={20} fill="#05060a" />)}<Glow x={gap.x} y={1450} r={220} col="#FFFAE6" a={.3 * gap.k} /></g>}
  <rect x={-200} y={1440} width={1480} height={600} fill="#5A4436" /><rect x={330} y={1480} width={480} height={80} rx={10} fill="#7A5A44" /></g>);
