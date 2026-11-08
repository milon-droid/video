// Персонажи серии 2: бесы, главный бес, сеть-ловушка, клетка. Начало координат — между ступнями на земле.
import React from 'react';
import { blink, clamp, noise } from '../anim';

const IMP_COL = [['#e0403a', '#b02a28', '#ff7a5a'], ['#d8503a', '#a8342a', '#ff8a6a'], ['#c83a52', '#962a3e', '#ff7a8a'], ['#e85a2a', '#b23e1a', '#ff9a5a']];
export type ImpState = 'stand' | 'dance' | 'attack' | 'ko' | 'turn' | 'run';
// ───── Бес: большая голова, рожки, глаза-фонари с щелевыми зрачками, ухмылка с клыками, крылышки, хвост-стрелка, вилы ─────
export const Imp: React.FC<{ x: number; y: number; s?: number; t: number; state?: ImpState; flip?: boolean; seed?: number; mouth?: number; rot?: number; hit?: number; look?: number }> = ({ x, y, s = 1, t, state = 'stand', flip, seed = 0, mouth = 0, rot = 0, hit = 0, look = 0 }) => {
  const [c, cs, ch] = IMP_COL[seed % 4], ph = t * 7 + seed * 1.7, b = blink(t, 40 + seed);
  const bob = state === 'dance' ? Math.abs(Math.sin(ph)) * 34 : state === 'run' ? Math.abs(Math.sin(ph * 1.4)) * 20 : Math.sin(t * 2.4 + seed) * 4;
  const arm = state === 'dance' ? Math.sin(ph) : 0, thrust = state === 'attack' ? clamp(Math.sin(t * 9 + seed) * 1.4) : 0;
  const ko = state === 'ko', glowEye = state === 'turn' ? 1 : 0, sq = hit > 0 ? Math.sin(hit * Math.PI) * .25 : 0;
  const wing = Math.sin(t * 14 + seed) * 10;
  const legs = (<g>{[-1, 1].map(sd => { const k = state === 'run' ? Math.sin(ph * 1.4 + (sd > 0 ? Math.PI : 0)) * 22 : state === 'dance' ? Math.sin(ph + (sd > 0 ? Math.PI : 0)) * 10 : 0;
    return <g key={sd}><path d={`M${sd * 26},-96 Q${sd * 48 + k},-50 ${sd * 22 + k},-10`} stroke={cs} strokeWidth={26} fill="none" strokeLinecap="round" /><path d={`M${sd * 22 + k - 18},-4 L${sd * 22 + k + 18},-4 L${sd * 22 + k + 10},6 L${sd * 22 + k - 10},6 Z`} fill="#2a1414" /></g>; })}</g>);
  const eyes = ko ? <g stroke="#2a0a0a" strokeWidth={7} fill="none" strokeLinecap="round">{[-1, 1].map(sd => <path key={sd} d={`M${sd * 38 - 14},-326 q14,-14 28,0 q-14,14 -20,4`} />)}</g>
    : [-1, 1].map(sd => <g key={sd}><ellipse cx={sd * 38} cy={-326} rx={30} ry={28 * b} fill={glowEye ? '#fff6a0' : '#ffe14a'} />{glowEye > 0 && <ellipse cx={sd * 38} cy={-326} rx={46} ry={40} fill="#ffe14a" opacity={.25} />}
      <ellipse cx={sd * 38 + look * 10} cy={-324} rx={6} ry={20 * b} fill="#1a0606" /><circle cx={sd * 38 - 9} cy={-336} r={6 * b} fill="#fff" />
      <path d={`M${sd * 12},-362 L${sd * 64},-346`} stroke="#4a0a0a" strokeWidth={9} strokeLinecap="round" /></g>);
  return (<g transform={`translate(${x},${y}) rotate(${rot}) scale(${(flip ? -1 : 1) * s * (1 + sq)},${s * (1 - sq)})`}>
    {!ko && <ellipse cx={0} cy={4} rx={80} ry={14} fill="#000" opacity={.25} />}
    <g transform={ko ? 'translate(0,-40) rotate(-90)' : `translate(0,${-bob})`}>
      {/* хвост */}
      <path d={`M-30,-120 C-120,-110 ${-150 + Math.sin(t * 4 + seed) * 16},-200 ${-110 + Math.sin(t * 4 + seed) * 20},-250`} stroke={cs} strokeWidth={12} fill="none" strokeLinecap="round" />
      <path d={`M${-110 + Math.sin(t * 4 + seed) * 20},-250 l-22,-6 l18,-30 l20,24 Z`} fill={cs} />
      {/* крылышки */}
      {[-1, 1].map(sd => <path key={sd} d={`M${sd * 40},-210 L${sd * 140},${-290 - wing} L${sd * 120},${-230 - wing * .5} L${sd * 150},${-220} L${sd * 110},-190 L${sd * 120},-170 Z`} fill="#5a1418" opacity={.9} />)}
      {legs}
      {/* тело-груша */}
      <path d="M-58,-90 C-74,-160 -50,-232 0,-236 C50,-232 74,-160 58,-90 Q0,-70 -58,-90 Z" fill={c} /><path d="M-30,-110 C-40,-150 -26,-196 0,-200 C26,-196 40,-150 30,-110 Q0,-100 -30,-110 Z" fill={ch} opacity={.45} />
      {/* руки и вилы */}
      <path d={`M-50,-200 Q-96,${-170 - arm * 60} -100,${-130 - arm * 120}`} stroke={c} strokeWidth={22} fill="none" strokeLinecap="round" />
      <g transform={`translate(${56 + thrust * 50},${-190 - arm * 50}) rotate(${state === 'attack' ? 70 : 12 + arm * 20})`}>
        <rect x={-6} y={-200} width={12} height={320} rx={5} fill="#5a3a24" /><path d="M-40,-200 L-40,-250 M0,-200 L0,-270 M40,-200 L40,-250 M-44,-200 L44,-200" stroke="#9aa0aa" strokeWidth={10} strokeLinecap="round" fill="none" />
        <circle cx={0} cy={0} r={16} fill={c} /></g>
      <path d={`M50,-200 Q70,-196 ${56 + thrust * 50},${-190 - arm * 50}`} stroke={c} strokeWidth={22} fill="none" strokeLinecap="round" />
      {/* голова */}
      <g transform={`rotate(${noise('ih' + seed, t, .6) * 6})`}>
        {[-1, 1].map(sd => <path key={sd} d={`M${sd * 50},-380 C${sd * 70},-430 ${sd * 96},-450 ${sd * 110},-470 C${sd * 104},-430 ${sd * 90},-400 ${sd * 78},-372 Z`} fill="#f2e6c8" />)}
        {[-1, 1].map(sd => <path key={'e' + sd} d={`M${sd * 86},-320 L${sd * 150},-360 L${sd * 92},-284 Z`} fill={c} />)}
        <ellipse cx={0} cy={-312} rx={96} ry={86} fill={c} /><ellipse cx={-30} cy={-360} rx={30} ry={14} fill="#fff" opacity={.18} transform="rotate(-20 -30 -360)" />
        {eyes}
        <ellipse cx={0} cy={-298} rx={12} ry={8} fill={cs} />
        {/* рот: ухмылка с клыками или открытый (голос/крик) */}
        {mouth > .06 || state === 'attack' || state === 'turn'
          ? <g><path d={`M-50,-272 Q0,${-262 + (mouth + .4) * 60} 50,-272 Q0,-282 -50,-272 Z`} fill="#3a0606" /><path d="M-36,-272 l8,16 l8,-16 M20,-272 l8,16 l8,-16" fill="#fff" /></g>
          : <g><path d="M-54,-276 Q0,-236 54,-276" stroke="#3a0606" strokeWidth={7} fill="none" strokeLinecap="round" /><path d="M-34,-266 l6,14 l7,-12 M22,-264 l7,12 l6,-14" fill="#fff" /></g>}
      </g>
      {ko && [0, 1, 2].map(i => { const a = t * 5 + i * 2.1; return <path key={i} transform={`translate(${Math.cos(a) * 80},${-460 + Math.sin(a) * 20})`} d="M0,-14 L4,-4 L14,-4 L6,3 L9,14 L0,7 L-9,14 L-6,3 L-14,-4 L-4,-4 Z" fill="#ffd23f" />; })}
    </g></g>); };

// ───── Главный бес: толстый, корона из рогов, ожерелье из черепков, дубина с шипами ─────
export const ImpBoss: React.FC<{ x: number; y: number; s?: number; t: number; mouth?: number; swing?: number; ko?: number; hit?: number }> = ({ x, y, s = 1, t, mouth = 0, swing = 0, ko = 0, hit = 0 }) => {
  const b = blink(t, 77), br = Math.sin(t * 2) * 6, sq = hit > 0 ? Math.sin(clamp(hit) * Math.PI) * .2 : 0;
  return (<g transform={`translate(${x},${y}) rotate(${ko * -78}) scale(${s * (1 + sq)},${s * (1 - sq)})`}>
    <ellipse cx={0} cy={6} rx={200} ry={28} fill="#000" opacity={.3 * (1 - ko)} />
    {[-1, 1].map(sd => <g key={sd}><path d={`M${sd * 60},-150 Q${sd * 90},-80 ${sd * 64},-12`} stroke="#8a1c1c" strokeWidth={56} fill="none" strokeLinecap="round" /><ellipse cx={sd * 70} cy={0} rx={50} ry={16} fill="#2a1010" /></g>)}
    <path d="M-150,-120 C-200,-260 -150,-440 0,-450 C150,-440 200,-260 150,-120 Q0,-80 -150,-120 Z" fill="#b8282a" />
    <path d="M-100,-150 C-130,-250 -90,-360 0,-366 C90,-360 130,-250 100,-150 Q0,-130 -100,-150 Z" fill="#e85a4a" opacity={.6} />
    <ellipse cx={0} cy={-230} rx={10} ry={12} fill="#7a1414" />
    {/* набедренная повязка */}
    <path d="M-140,-140 Q0,-110 140,-140 L120,-80 Q0,-60 -120,-80 Z" fill="#5a3a24" />
    {/* ожерелье */}
    <path d="M-110,-400 Q0,-330 110,-400" stroke="#3a2a1a" strokeWidth={5} fill="none" />{[-80, -40, 0, 40, 80].map((cx, i) => <g key={i} transform={`translate(${cx},${-372 + Math.abs(cx) * -.4 + 18})`}><circle r={16} fill="#f2e6c8" /><circle cx={-5} cy={-2} r={4} fill="#2a1414" /><circle cx={5} cy={-2} r={4} fill="#2a1414" /></g>)}
    {/* левая рука и дубина */}
    <path d="M-140,-380 Q-230,-300 -210,-200" stroke="#b8282a" strokeWidth={50} fill="none" strokeLinecap="round" />
    <g transform={`translate(160,-360) rotate(${-30 + swing * 130})`}>
      <path d="M-18,0 L-34,-300 Q0,-340 34,-300 L18,0 Z" fill="#7a5032" />{[-1, 1].map(sd => [0, 1, 2].map(i => <path key={sd + '' + i} d={`M${sd * 28},${-120 - i * 70} l${sd * 26},-10 l${-sd * 22},-16 Z`} fill="#c8c8c8" />))}
      <circle cx={0} cy={0} r={34} fill="#b8282a" /></g>
    <path d="M130,-400 Q170,-390 160,-360" stroke="#b8282a" strokeWidth={50} fill="none" strokeLinecap="round" />
    {/* голова */}
    <g transform={`translate(0,${-500 + br})`}>
      {[-1, 1].map(sd => <path key={sd} d={`M${sd * 60},-80 C${sd * 100},-170 ${sd * 150},-190 ${sd * 190},-210 C${sd * 170},-150 ${sd * 130},-100 ${sd * 110},-50 Z`} fill="#f2e6c8" />)}
      {[-50, -18, 18, 50].map((cx, i) => <path key={i} d={`M${cx - 14},-96 L${cx},${-150 - (i % 3 ? 10 : 0)} L${cx + 14},-96 Z`} fill="#ffd23f" />)}
      <path d="M-90,-100 L90,-100 L84,-80 L-84,-80 Z" fill="#ffd23f" />
      <ellipse cx={0} cy={0} rx={130} ry={110} fill="#b8282a" />
      {[-1, 1].map(sd => <path key={'ea' + sd} d={`M${sd * 120},-10 L${sd * 200},-60 L${sd * 126},40 Z`} fill="#b8282a" />)}
      {ko > .5 ? <g stroke="#2a0a0a" strokeWidth={9} strokeLinecap="round">{[-1, 1].map(sd => <path key={sd} d={`M${sd * 50 - 18},-28 l36,36 M${sd * 50 + 18},-28 l-36,36`} />)}</g>
        : [-1, 1].map(sd => <g key={sd}><ellipse cx={sd * 50} cy={-12} rx={30} ry={24 * b} fill="#ffe14a" /><ellipse cx={sd * 50} cy={-10} rx={6} ry={18 * b} fill="#1a0606" /><path d={`M${sd * 14},-48 L${sd * 86},-30`} stroke="#4a0a0a" strokeWidth={14} strokeLinecap="round" /></g>)}
      <ellipse cx={0} cy={26} rx={22} ry={14} fill="#7a1414" />
      <path d={`M-70,56 Q0,${56 + (mouth + .25) * 90} 70,56 Q0,46 -70,56 Z`} fill="#3a0606" />
      {[-48, -16, 16, 48].map((cx, i) => <path key={i} d={`M${cx - 10},56 l10,${i % 3 ? 14 : 24} l10,${i % 3 ? -14 : -24}`} fill="#fff" />)}
      <path d="M-56,60 l14,-40 l12,40 M30,60 l12,-40 l14,40" fill="#fff" />
    </g>
  </g>); };

// ───── Сеть-ловушка: верёвка с ветки, сетка мешком, красные руны (x,y — верх мешка) ─────
export const NetTrap: React.FC<{ x: number; y: number; t: number; w?: number; h?: number; cut?: number; front?: boolean }> = ({ x, y, t, w = 330, h = 760, cut = 0, front }) => {
  const sw = Math.sin(t * 1.6) * 3;
  const rope = <path d={`M${x},-200 L${x},${y + 20}`} stroke="#8a6a3a" strokeWidth={14} strokeDasharray={cut > 0 ? `${(y + 220) * (1 - cut * .4)} 4000` : undefined} />;
  if (!front) return rope;
  const bag = `M${x - 20},${y} C${x - w},${y + h * .2} ${x - w * 1.05},${y + h * .8} ${x},${y + h} C${x + w * 1.05},${y + h * .8} ${x + w},${y + h * .2} ${x + 20},${y} Z`, id = `net${Math.round(x)}`;
  const mesh = [<clipPath key="c" id={id}><path d={bag} /></clipPath>, <g key="g" clipPath={`url(#${id})`}>{Array.from({ length: 24 }, (_, i) => { const o = (i - 12) * 84; return <g key={i}><path d={`M${x + o - h},${y} L${x + o + h},${y + h * 2}`} stroke="#6a4a22" strokeWidth={5} opacity={.85} /><path d={`M${x + o + h},${y} L${x + o - h},${y + h * 2}`} stroke="#6a4a22" strokeWidth={5} opacity={.85} /></g>; })}</g>,
    <path key="o" d={bag} fill="none" stroke="#5a3a1a" strokeWidth={9} />];
  return (<g transform={`rotate(${sw} ${x} ${y})`}>{mesh}
    {[[-.4, .3], [.35, .45], [-.2, .7], [.3, .8]].map(([u, v], i) => <text key={i} x={x + u * w} y={y + v * h} fontSize={44} fontWeight={900} fill="#ff3a3a" opacity={.6 + .4 * Math.sin(t * 5 + i)} textAnchor="middle" style={{ filter: 'drop-shadow(0 0 8px #ff2a2a)' }}>{'ᛉᛟᚦᛗ'[i]}</text>)}</g>); };

// ───── Клетка: прутья поверх содержимого ─────
export const Cage: React.FC<{ x: number; y: number; s?: number; t: number; open?: number; children?: React.ReactNode }> = ({ x, y, s = 1, t, open = 0, children }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x={-180} y={-560} width={360} height={560} fill="#1a1010" opacity={.35} />
    {children}
    <rect x={-200} y={-40} width={400} height={40} rx={8} fill="#6a4a2a" /><rect x={-200} y={-590} width={400} height={40} rx={8} fill="#6a4a2a" />
    {Array.from({ length: 7 }, (_, i) => { const bx = -170 + i * 56.6, gone = open > 0 && i >= 2 && i <= 4; return gone ? null : <rect key={i} x={bx - 8} y={-560} width={16} height={530} rx={6} fill="#8a6a3a" />; })}
    {open > 0 && <g transform={`translate(-60,-40) rotate(${-open * 100})`}>{[0, 1, 2].map(i => <rect key={i} x={i * 56.6 - 8 - 4} y={-520} width={16} height={520} rx={6} fill="#8a6a3a" />)}</g>}
    <rect x={-20} y={-330} width={40} height={50} rx={6} fill="#9aa0aa" opacity={open > 0 ? 0 : 1} />
  </g>);
