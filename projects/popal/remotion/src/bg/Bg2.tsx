// Фоны серии 2: светящийся лес эльфиек (день), лагерь бесов (ночь, костёр, котёл, клетки), деревня эльфиек у костра (ночь).
import React from 'react';
import { noise } from '../anim';
import { Glow, Motes } from './Bg';

const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

// дерево-великан: ствол с корнями, крона пятнами, фонарики-светлячки на ветках
const BigTree: React.FC<{ x: number; y: number; s: number; t: number; i: number; night?: boolean }> = ({ x, y, s, t, i, night }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M-70,0 C-60,-300 -90,-700 -40,-1100 L40,-1100 C90,-700 60,-300 70,0 L130,30 L-130,30 Z" fill={night ? '#2a1e2e' : '#6a4a3a'} />
    <path d="M10,-200 C20,-500 0,-800 30,-1100 L40,-1100 C70,-700 50,-400 70,0 Z" fill={night ? '#1e1424' : '#5a3a2e'} opacity={.8} />
    {[[-180, -1150, 260], [160, -1200, 240], [0, -1360, 280], [-90, -950, 180], [120, -980, 170]].map(([cx, cy, r], k) =>
      <circle key={k} cx={cx} cy={cy} r={r} fill={night ? (k % 2 ? '#1e3a3a' : '#16302e') : (k % 2 ? '#3f9a6a' : '#2f7a52')} />)}
    {[[-150, -900], [140, -860], [-40, -1060], [60, -760]].map(([lx, ly], k) => { const fl = .7 + .3 * Math.sin(t * 3 + k + i);
      return <g key={'l' + k}><path d={`M${lx},${ly - 60} L${lx},${ly - 14}`} stroke="#3a2a1a" strokeWidth={3} /><Glow x={lx} y={ly} r={70} c={night ? '#ffc96a' : '#9fffe0'} o={fl} id={`lan${i}${k}${night ? 'n' : 'd'}`} />
        <ellipse cx={lx} cy={ly} rx={14} ry={18} fill={night ? '#ffe2a0' : '#e8fff6'} /></g>; })}
  </g>);

// ───── Светящийся лес эльфиек (день): сиреневое небо сквозь кроны, лучи, грибы, светлячки ─────
export const ElfForest: React.FC<{ t: number; dim?: number }> = ({ t, dim = 0 }) => (<g>
  <defs><linearGradient id="efS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7a5ad0" /><stop offset=".45" stopColor="#b8a0e8" /><stop offset=".7" stopColor="#c8f0d8" /><stop offset="1" stopColor="#8ad8a8" /></linearGradient>
    <linearGradient id="efRay" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fffbe0" stopOpacity=".55" /><stop offset="1" stopColor="#fffbe0" stopOpacity="0" /></linearGradient></defs>
  <rect width={1080} height={1920} fill="url(#efS)" />
  {/* дальний ряд деревьев */}
  {Array.from({ length: 6 }, (_, i) => <g key={i} transform={`translate(${i * 200 - 40},1180)`}><rect x={-22} y={-520} width={44} height={520} fill="#7a8aa8" opacity={.6} /><circle cx={0} cy={-560} r={150} fill="#8aa8b8" opacity={.55} /></g>)}
  {/* лучи сквозь кроны */}
  {[[200, .9], [520, .7], [820, 1]].map(([x, o], i) => <path key={i} d={`M${x - 40},0 L${x + 40},0 L${x + 260},1500 L${x - 60},1500 Z`} fill="url(#efRay)" opacity={(o as number) * (.6 + .4 * Math.sin(t * .8 + i))} />)}
  <BigTree x={110} y={1260} s={.95} t={t} i={0} /><BigTree x={980} y={1300} s={1.05} t={t} i={1} />
  <path d="M0,1180 Q300,1120 560,1170 Q820,1220 1080,1150 L1080,1920 L0,1920 Z" fill="#5aae72" />
  <path d="M0,1300 Q540,1250 1080,1310 L1080,2700 L0,2700 Z" fill="#4a9a62" />
  {/* светящиеся грибы */}
  {[[250, 1300, .55, '#7dffd0'], [820, 1330, .45, '#c8a0ff'], [640, 1250, .3, '#7dffd0']].map(([x, y, s, c], i) => <g key={i} transform={`translate(${x},${y}) scale(${s})`}>
    <Glow x={0} y={-260} r={260} c={c as string} o={.5 + .2 * Math.sin(t * 2 + i)} id={`efm${i}`} />
    <rect x={-26} y={-250} width={52} height={250} fill="#f4ecdc" /><path d="M-150,-240 Q0,-420 150,-240 Q0,-200 -150,-240 Z" fill={c as string} />
    {[-70, 10, 80].map(cx => <ellipse key={cx} cx={cx} cy={-290} rx={14} ry={9} fill="#fff" opacity={.85} />)}</g>)}
  {Array.from({ length: 14 }, (_, i) => { const x = i * 80 + 10, h = 70 + hash(i) * 60; return <path key={i} d={`M${x},1920 Q${x + 6 + Math.sin(t * 2 + i) * 6},${1920 - h} ${x + 14},${1920 - h * 1.6}`} stroke="#2f7a4a" strokeWidth={12} fill="none" strokeLinecap="round" />; })}
  <Motes n={30} t={t} c="#d8fff0" seed={71} area={[0, 300, 1080, 1300]} vy={-25} size={8} />
  {dim > 0 && <rect width={1080} height={1920} fill="#10142a" opacity={dim} />}
</g>);

// ───── Котёл на огне ─────
export const Cauldron: React.FC<{ x: number; y: number; s?: number; t: number; dent?: number }> = ({ x, y, s = 1, t, dent = 0 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <Glow x={0} y={-40} r={300} c="#ff8a2a" o={.6 + .2 * Math.sin(t * 9)} id={`cf${x}`} />
    {[-1, 0, 1].map(k => <path key={k} d={`M${k * 60 - 40},0 Q${k * 60 + noise('fl' + k, t, 3) * 20},${-170 - Math.abs(Math.sin(t * 8 + k)) * 60} ${k * 60 + 40},0 Z`} fill={k ? '#ff7a1a' : '#ffc94a'} />)}
    <path d="M-200,-120 Q-210,60 0,70 Q210,60 200,-120 Z" fill="#2a2a32" transform={dent > 0 ? `rotate(${dent * 8})` : undefined} />
    <ellipse cx={0} cy={-120} rx={210} ry={44} fill="#3a3a44" /><ellipse cx={0} cy={-116} rx={180} ry={30} fill="#5aff6a" />
    {[0, 1, 2, 3].map(i => { const k = (t * .8 + i * .25) % 1; return <circle key={i} cx={-100 + i * 66} cy={-120 - k * 160} r={14 + k * 30} fill="#9aff8a" opacity={.5 * (1 - k)} />; })}
  </g>);

// ───── Лагерь бесов (ночь): тёмный лес, луны, шатёр главного беса, тотемы-черепа, отсветы костра ─────
export const ImpCamp: React.FC<{ t: number; dark?: number }> = ({ t, dark = 0 }) => (<g>
  <defs><linearGradient id="icS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#120a24" /><stop offset=".55" stopColor="#2a1440" /><stop offset="1" stopColor="#4a1a2a" /></linearGradient></defs>
  <rect width={1080} height={1920} fill="url(#icS)" />
  {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={hash(i) * 1080} cy={hash(i * 3) * 700} r={1.5 + hash(i * 5) * 2.5} fill="#fff" opacity={.4 + .5 * Math.abs(Math.sin(t * 2 + i))} />)}
  <circle cx={820} cy={300} r={80} fill="#ffe8f0" /><Glow x={820} y={300} r={260} c="#ffc8e0" o={.4} id="icm1" /><circle cx={260} cy={420} r={36} fill="#c8e8ff" opacity={.9} />
  {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${i * 150 - 60},1250 L${i * 150 + 10},${620 + (i % 3) * 110} L${i * 150 + 80},1250 Z`} fill={i % 2 ? '#1a1030' : '#140c26'} />)}
  {/* шатёр главного беса */}
  <g transform="translate(540,1250)"><path d="M-260,0 L0,-420 L260,0 Z" fill="#5a1a22" /><path d="M-60,0 L0,-300 L60,0 Z" fill="#1a0608" /><path d="M0,-420 L0,-520 L70,-490 L0,-460" fill="#e5383b" stroke="#3a1a1a" strokeWidth={4} />
    <g transform="translate(0,-330)"><circle r={34} fill="#f2e6c8" /><circle cx={-12} cy={-4} r={8} fill="#2a1414" /><circle cx={12} cy={-4} r={8} fill="#2a1414" /></g></g>
  <path d="M0,1230 Q540,1190 1080,1240 L1080,2700 L0,2700 Z" fill="#2a1a24" />
  <Glow x={540} y={1500} r={760} c="#ff6a1a" o={.42 + .08 * Math.sin(t * 9)} id="icFire" />
  {/* тотемы */}
  {[90, 990].map((x, i) => <g key={i} transform={`translate(${x},1330)`}><rect x={-14} y={-300} width={28} height={300} fill="#4a3020" /><g transform="translate(0,-320)"><circle r={42} fill="#f2e6c8" /><circle cx={-14} cy={-6} r={10} fill="#ff3a1a" opacity={.6 + .4 * Math.sin(t * 6 + i)} /><circle cx={14} cy={-6} r={10} fill="#ff3a1a" opacity={.6 + .4 * Math.sin(t * 6 + i)} /></g></g>)}
  <Motes n={22} t={t} c="#ffb04a" seed={81} area={[0, 900, 1080, 900]} vy={-70} size={6} />
  {dark > 0 && <rect width={1080} height={1920} fill="#05030a" opacity={dark} />}
</g>);

// ───── Деревня эльфиек ночью: домики на деревьях с тёплыми окнами, звёзды, костёр ─────
export const ElfNight: React.FC<{ t: number; pink?: number }> = ({ t, pink = 0 }) => (<g>
  <defs><linearGradient id="enS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0e1636" /><stop offset=".6" stopColor="#24305a" /><stop offset="1" stopColor="#3a3a5a" /></linearGradient></defs>
  <rect width={1080} height={1920} fill="url(#enS)" />
  {Array.from({ length: 50 }, (_, i) => <circle key={i} cx={hash(i + 9) * 1080} cy={hash(i * 3 + 9) * 800} r={1.5 + hash(i * 5) * 2.5} fill="#fff" opacity={.4 + .5 * Math.abs(Math.sin(t * 1.6 + i))} />)}
  <circle cx={260} cy={330} r={90} fill="#fff6ee" /><Glow x={260} y={330} r={300} c="#d8e8ff" o={.35} id="enm1" /><circle cx={830} cy={250} r={40} fill="#d9f2ff" />
  <BigTree x={120} y={1300} s={1} t={t} i={5} night /><BigTree x={960} y={1320} s={1.1} t={t} i={6} night />
  {[[120, 820], [960, 760]].map(([x, y], i) => <g key={i} transform={`translate(${x},${y})`}><path d="M-110,0 L110,0 L90,-150 L-90,-150 Z" fill="#5a3a2a" /><path d="M-130,-150 L0,-260 L130,-150 Z" fill="#3a5a4a" />
    <rect x={-30} y={-110} width={60} height={70} rx={30} fill="#ffcf6a" opacity={.85 + .15 * Math.sin(t * 4 + i)} /><Glow x={0} y={-80} r={150} c="#ffb04a" o={.5} id={`enw${i}`} /></g>)}
  <path d="M0,1250 Q540,1200 1080,1260 L1080,2700 L0,2700 Z" fill="#1e2a3a" />
  {pink > 0 && <><rect width={1080} height={1920} fill="#ff4ab0" opacity={pink * .18} /><Glow x={760} y={1100} r={700} c="#ff6ad0" o={pink * .6} id="enPink" /></>}
</g>);

// ───── Костёр ─────
export const Campfire: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <Glow x={0} y={-80} r={520} c="#ff8a2a" o={.55 + .15 * Math.sin(t * 11)} id={`cmp${x}`} />
    {[-1, 1].map(sd => <rect key={sd} x={-120} y={-20} width={240} height={34} rx={16} fill="#5a3a24" transform={`rotate(${sd * 18})`} />)}
    {[-1, 0, 1].map(k => <path key={k} d={`M${k * 50 - 50},0 Q${k * 46 + noise('cf' + k, t, 3) * 26},${-200 - Math.abs(Math.sin(t * 7 + k * 2)) * 80} ${k * 50 + 50},0 Z`} fill={k ? '#ff7a1a' : '#ffd04a'} />)}
    <path d="M-30,0 Q0,-110 30,0 Z" fill="#fff2b0" />
    <Motes n={12} t={t} c="#ffc04a" seed={91} area={[-150, -500, 300, 480]} vy={-90} size={5} />
  </g>);
