// Остальные персонажи «ПОПАЛ»: богиня Люмина, Король демонов, суккуба Лилиана, адский гусь, слайм Желе.
import React from 'react';
import { blink, clamp, lerp, noise } from '../anim';

const mouthPath = (op: number, w = 20, curve = .3, y = 0) => op > .06
  ? <g><path d={`M${-w},${y} Q0,${y - 4 - curve * 6} ${w},${y} Q${w * .8},${y + op * 30} 0,${y + op * 33} Q${-w * .8},${y + op * 30} ${-w},${y} Z`} fill="#5a1d24" /><ellipse cx={0} cy={y + op * 23} rx={w * .5} ry={op * 8} fill="#e4707a" /></g>
  : <path d={`M${-w * .8},${y} Q0,${y + curve * 14} ${w * .8},${y - curve * 2}`} stroke="#8a2a3a" strokeWidth={5} fill="none" strokeLinecap="round" />;

// ───── Богиня Люмина: поясной план за стойкой, начало координат — уровень стойки по центру ─────
export const Lumina: React.FC<{ x: number; y: number; s?: number; t: number; mouth?: number; expr?: 'bored' | 'deadpan' | 'smirk' | 'point'; swipe?: number; look?: [number, number]; overGlasses?: number }> = ({ x, y, s = 1, t, mouth = 0, expr = 'bored', swipe = 0, look, overGlasses = 0 }) => {
  const b = blink(t, 5), lid = clamp(Math.max(expr === 'bored' || expr === 'deadpan' ? .45 : expr === 'smirk' ? .3 : .1, 1 - b));
  const br = Math.sin(t * 1.9) * 3, hy = -360 + br + overGlasses * 10, lk = look ?? [noise('lx', t, .3) * .3, .1];
  const eye = (side: -1 | 1) => { const cx = side * 40, cy = 0, ix = cx + lk[0] * 10, iy = cy + 4 + lk[1] * 8;
    return (<g key={side}><clipPath id={`le${side}`}><path d={`M${cx - 28},${cy} Q${cx},${cy - 30} ${cx + 28},${cy} Q${cx},${cy + 26} ${cx - 28},${cy} Z`} /></clipPath>
      <path d={`M${cx - 28},${cy} Q${cx},${cy - 30} ${cx + 28},${cy} Q${cx},${cy + 26} ${cx - 28},${cy} Z`} fill="#fff" />
      <g clipPath={`url(#le${side})`}><ellipse cx={ix} cy={iy} rx={15} ry={19} fill="#8b5cf6" /><ellipse cx={ix} cy={iy} rx={7} ry={9} fill="#2a1450" /><circle cx={ix - 5} cy={iy - 7} r={5} fill="#fff" />
        <rect x={cx - 30} y={cy - 30} width={60} height={56 * lid} fill="#f8d9c4" /></g>
      <path d={`M${cx - 32},${cy + 2 - 0} Q${cx},${cy - 28 + lid * 26} ${cx + 32},${cy - 2}`} stroke="#3a2040" strokeWidth={6} fill="none" strokeLinecap="round" />
      <path d={`M${cx + side * 26},${cy - 6} l${side * 12},-10 M${cx + side * 18},${cy - 12} l${side * 8},-12`} stroke="#3a2040" strokeWidth={4} strokeLinecap="round" />
      <path d={`M${cx - 26},${cy - 44 + (expr === 'smirk' && side > 0 ? -8 : 0)} Q${cx},${cy - 54} ${cx + 26},${cy - 44 + (expr === 'deadpan' ? 4 : 0)}`} stroke="#c9b6e8" strokeWidth={6} fill="none" strokeLinecap="round" /></g>); };
  const sw = Math.sin(swipe * Math.PI);
  return (<g transform={`translate(${x},${y}) scale(${s})`}>
    {/* нимб-кольцевая лампа */}
    <circle cx={0} cy={hy - 40} r={190} fill="url(#halo)" opacity={.9} />
    <circle cx={0} cy={hy - 40} r={150} fill="none" stroke="#fff6cf" strokeWidth={22} opacity={.95 + .05 * Math.sin(t * 20)} />
    <circle cx={0} cy={hy - 40} r={150} fill="none" stroke="#ffe27a" strokeWidth={6} />
    <defs><radialGradient id="halo"><stop offset=".6" stopColor="#fff7d6" stopOpacity="0" /><stop offset=".78" stopColor="#fff2b0" stopOpacity=".7" /><stop offset="1" stopColor="#ffe27a" stopOpacity="0" /></radialGradient>
      <linearGradient id="lhair" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fbf4ff" /><stop offset="1" stopColor="#d6c3f2" /></linearGradient></defs>
    {/* крылья */}
    {[-1, 1].map(sd => <g key={sd} transform={`translate(${sd * 120},${-200}) rotate(${sd * (8 + Math.sin(t * 1.3) * 3)}) scale(${sd},1)`}>
      <path d="M0,0 C80,-120 220,-200 300,-160 C260,-120 250,-90 280,-60 C220,-50 210,-20 240,10 C170,20 150,40 160,70 C90,60 40,40 0,0 Z" fill="#ffffff" />
      <path d="M40,-20 C110,-90 200,-140 270,-150 M60,10 C130,-30 190,-50 240,-50 M70,40 C120,20 150,20 170,40" stroke="#dcd3ef" strokeWidth={5} fill="none" /></g>)}
    {/* волосы сзади */}
    <path d={`M-120,${hy - 20} C-150,${hy + 120} -150,-120 -170,-40 L170,-40 C150,-120 150,${hy + 120} 120,${hy - 20} Z`} fill="url(#lhair)" />
    {/* тело: белый жакет с золотом */}
    <path d="M-150,0 L-130,-190 Q-60,-232 0,-226 Q60,-232 130,-190 L150,0 Z" fill="#fbfaff" />
    <path d="M0,-226 L-40,-150 L0,-60 L40,-150 Z" fill="#e9c66a" /><path d="M0,-226 L-22,-160 L0,-80 L22,-160 Z" fill="#f8d9c4" />
    <path d="M-130,-190 Q-150,-90 -150,0" stroke="#e9c66a" strokeWidth={8} fill="none" /><path d="M130,-190 Q150,-90 150,0" stroke="#e9c66a" strokeWidth={8} fill="none" />
    <rect x={56} y={-160} width={64} height={26} rx={6} fill="#e9c66a" /><text x={88} y={-141} fontSize={15} fontWeight={900} textAnchor="middle" fill="#5a3a10" fontFamily="Mont">ЛЮМИНА</text>
    {/* шея и голова */}
    <rect x={-20} y={hy + 70} width={40} height={80} fill="#eec3a8" />
    <g transform={`translate(0,${hy})`}>
      <path d="M-92,-10 C-96,-90 -46,-118 0,-118 C46,-118 96,-90 92,-10 C90,44 62,80 20,90 Q0,94 -20,90 C-62,80 -90,44 -92,-10 Z" fill="#f8d9c4" />
      {eye(-1)}{eye(1)}
      {/* очки на кончике носа */}
      <g transform={`translate(0,${18 + overGlasses * 14})`} stroke="#c89a2e" strokeWidth={4} fill="#ffffff" fillOpacity={.12}><circle cx={-40} cy={0} r={26} /><circle cx={40} cy={0} r={26} /><path d="M-14,0 Q0,-8 14,0" fill="none" /></g>
      <path d="M-2,30 Q3,38 -4,42" stroke="#d9a58a" strokeWidth={4} fill="none" strokeLinecap="round" />
      <g transform="translate(0,60)">{mouthPath(mouth, 18, expr === 'smirk' ? .8 : -.1)}{mouth < .06 && <path d="M-14,0 Q0,6 14,-1" stroke="#e0507a" strokeWidth={7} fill="none" strokeLinecap="round" opacity={.8} />}</g>
      <g opacity={.5}><ellipse cx={-62} cy={38} rx={16} ry={8} fill="#ff8aa6" /><ellipse cx={62} cy={38} rx={16} ry={8} fill="#ff8aa6" /></g>
      {/* чёлка и пучок */}
      <path d="M-100,0 C-110,-90 -60,-136 0,-134 C60,-136 110,-90 100,0 C92,-40 80,-60 60,-70 C50,-40 30,-50 10,-76 C-6,-46 -30,-50 -46,-74 C-60,-50 -84,-40 -100,0 Z" fill="url(#lhair)" />
      <circle cx={0} cy={-140} r={40} fill="#efe4fb" /><path d="M-30,-150 Q0,-170 30,-150" stroke="#fff" strokeWidth={6} fill="none" opacity={.8} />
    </g>
    {/* руки: левая держит планшет, правая свайпает */}
    <g transform={`translate(${-60 + sw * 0},-40)`}><rect x={-120} y={-150} width={170} height={120} rx={14} fill="#1b1730" transform="rotate(-12 -35 -90)" />
      <rect x={-110} y={-142} width={150} height={104} rx={10} fill="#5ad2ff" opacity={.85} transform="rotate(-12 -35 -90)" />
      <g transform="rotate(-12 -35 -90)"><circle cx={-35 + Math.sin(swipe * 6.28) * 0} cy={-100} r={26} fill="#f6f2ff" /><rect x={-62} y={-66} width={54} height={8} rx={4} fill="#fff" opacity={.7} />
        <g transform={`translate(${-35 + swipe * 120 - 60},-100)`} opacity={clamp(1 - Math.abs(swipe - .5) * 2.2)}><circle r={22} fill="#ffd23f" /></g></g></g>
    <path d="M-150,-10 Q-120,-80 -60,-60" stroke="#fbfaff" strokeWidth={46} strokeLinecap="round" fill="none" />
    <g transform={`translate(${60 + sw * 80 + (expr === 'point' ? 40 : 0)},${-80 - sw * 30 - (expr === 'point' ? 80 : 0)})`}>
      <path d={`M80,60 Q60,20 0,0`} stroke="#fbfaff" strokeWidth={44} strokeLinecap="round" fill="none" />
      <ellipse cx={-6} cy={-4} rx={20} ry={16} fill="#f8d9c4" /><path d="M-20,-10 L-46,-26" stroke="#f8d9c4" strokeWidth={12} strokeLinecap="round" /><path d="M-46,-26 l-6,-4" stroke="#ff5aa8" strokeWidth={8} strokeLinecap="round" /></g>
  </g>); };

// ───── Король демонов Азгарот: по пояс, начало координат — пояс по центру ─────
export const King: React.FC<{ x: number; y: number; s?: number; t: number; mouth?: number; glow?: number; orb?: boolean }> = ({ x, y, s = 1, t, mouth = 0, glow = 1, orb = true }) => {
  const br = Math.sin(t * 1.2) * 4, hy = -470 + br, fl = .8 + .2 * Math.sin(t * 13) * Math.sin(t * 7);
  return (<g transform={`translate(${x},${y}) scale(${s})`}>
    <defs><radialGradient id="kEye"><stop offset="0" stopColor="#fff2c0" /><stop offset=".35" stopColor="#ff8a2a" /><stop offset="1" stopColor="#ff2a00" stopOpacity="0" /></radialGradient>
      <linearGradient id="cape" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5a0f1e" /><stop offset="1" stopColor="#1a0610" /></linearGradient></defs>
    <path d="M-330,60 L-260,-330 Q0,-400 260,-330 L330,60 Z" fill="url(#cape)" />
    {/* доспех */}
    <path d="M-210,40 L-190,-300 Q0,-350 190,-300 L210,40 Z" fill="#241a2e" />
    <path d="M-60,-300 L0,-120 L60,-300 Z" fill="#3a2a46" /><circle cx={0} cy={-200} r={30} fill="#ff4a1f" opacity={fl} /><circle cx={0} cy={-200} r={14} fill="#ffe0a0" />
    {[-1, 1].map(sd => <g key={sd} transform={`translate(${sd * 200},-300)`}><path d={`M${-sd * 80},40 Q0,-60 ${sd * 90},10 L${sd * 70},70 Z`} fill="#3a2a46" />
      <path d={`M${sd * 20},-30 L${sd * 60},-110 L${sd * 50},-20 Z M${sd * 60},-10 L${sd * 120},-70 L${sd * 90},10 Z`} fill="#1a1222" /></g>)}
    {/* голова */}
    <g transform={`translate(0,${hy})`}>
      {[-1, 1].map(sd => <path key={sd} d={`M${sd * 60},-70 C${sd * 130},-110 ${sd * 160},-200 ${sd * 120},-280 C${sd * 150},-200 ${sd * 110},-140 ${sd * 70},-110 Z`} fill="#2a1c22" stroke="#5a3a3a" strokeWidth={4} />)}
      <path d="M-50,-110 L-30,-170 L-10,-120 L0,-190 L10,-120 L30,-170 L50,-110 Z" fill="#b8902a" />
      <path d="M-90,-40 C-96,-110 -50,-130 0,-130 C50,-130 96,-110 90,-40 C86,30 50,80 0,90 C-50,80 -86,30 -90,-40 Z" fill="#2b1a26" />
      <path d="M-70,-10 Q0,-40 70,-10 L60,10 Q0,-14 -60,10 Z" fill="#160c14" />
      {[-1, 1].map(sd => <g key={sd}><circle cx={sd * 36} cy={-4} r={34 * glow} fill="url(#kEye)" opacity={fl} /><path d={`M${sd * 18},-8 L${sd * 54},-2 L${sd * 20},4 Z`} fill="#ffe8a0" /></g>)}
      <g transform="translate(0,46)"><path d={`M-34,0 Q0,${10 + mouth * 30} 34,0`} stroke="#0a0408" strokeWidth={6} fill={mouth > .1 ? '#3a0a10' : 'none'} />
        <path d="M-22,2 l6,14 l6,-12 M10,2 l6,13 l6,-13" fill="#f2e6d0" /></g>
    </g>
    {/* рука с шаром */}
    {orb && <g transform="translate(150,-60)"><circle cx={0} cy={-60} r={95} fill="#8a5cff" opacity={.25} /><circle cx={0} cy={-60} r={78} fill="#2a1450" opacity={.85} /><circle cx={0} cy={-60} r={78} fill="none" stroke="#b9a2ff" strokeWidth={5} />
      <ellipse cx={-26} cy={-92} rx={22} ry={12} fill="#fff" opacity={.35} transform="rotate(-30 -26 -92)" />
      <path d="M-70,10 Q0,40 70,10 L60,40 Q0,60 -60,40 Z" fill="#241a2e" />{[-40, -14, 12, 38].map(cx => <path key={cx} d={`M${cx},14 L${cx + 6},-24 L${cx + 14},16`} fill="#1a1222" />)}</g>}
  </g>); };

// ───── Суккуба Лилиана: крупный поясной план ─────
export const Succubus: React.FC<{ x: number; y: number; s?: number; t: number; mouth?: number }> = ({ x, y, s = 1, t, mouth = 0 }) => {
  const b = blink(t, 9), lid = clamp(Math.max(.42, 1 - b)), hy = -330 + Math.sin(t * 1.6) * 4;
  return (<g transform={`translate(${x},${y}) scale(${s})`}>
    {[-1, 1].map(sd => <path key={sd} transform={`translate(${sd * 90},-200) scale(${sd},1) rotate(${-10 + Math.sin(t * 2) * 4})`} d="M0,0 L260,-220 L230,-120 L300,-110 L220,-30 L270,10 L150,30 Z" fill="#3a1440" stroke="#8a2a8a" strokeWidth={5} />)}
    <path d={`M-140,${hy - 30} C-200,${hy + 200} -170,-80 -200,0 L200,0 C170,-80 200,${hy + 200} 140,${hy - 30} Z`} fill="#2a0f3a" />
    <path d="M-140,0 L-120,-190 Q0,-230 120,-190 L140,0 Z" fill="#1c0c24" /><path d="M-60,-200 Q0,-150 60,-200 L40,-120 Q0,-100 -40,-120 Z" fill="#f0c2b0" />
    <rect x={-18} y={hy + 70} width={36} height={70} fill="#e8b4a4" />
    <g transform={`translate(0,${hy})`}>
      {[-1, 1].map(sd => <path key={sd} d={`M${sd * 50},-90 C${sd * 80},-150 ${sd * 120},-160 ${sd * 140},-200 C${sd * 130},-140 ${sd * 100},-110 ${sd * 70},-80 Z`} fill="#1a0a1a" />)}
      <path d="M-86,-10 C-90,-90 -44,-114 0,-114 C44,-114 90,-90 86,-10 C84,40 56,76 18,86 Q0,90 -18,86 C-56,76 -84,40 -86,-10 Z" fill="#f0c2b0" />
      {[-1, 1].map(sd => { const cx = sd * 38; return (<g key={sd}><path d={`M${cx - 26},0 Q${cx},-26 ${cx + 26},0 Q${cx},20 ${cx - 26},0 Z`} fill="#fff" />
        <ellipse cx={cx + 3} cy={2} rx={11} ry={14} fill="#ff3aa8" /><ellipse cx={cx + 3} cy={2} rx={4} ry={9} fill="#2a0010" /><rect x={cx - 28} y={-28} width={56} height={48 * lid} fill="#f0c2b0" />
        <path d={`M${cx - 30},0 Q${cx},${-26 + lid * 26} ${cx + 30},-4 l${sd * 12},-8`} stroke="#1a0a1a" strokeWidth={6} fill="none" strokeLinecap="round" /></g>); })}
      <g transform="translate(0,56)">{mouthPath(mouth, 16, .9)}{mouth < .06 && <path d="M-16,0 Q0,10 16,-2" stroke="#c0105a" strokeWidth={8} fill="none" strokeLinecap="round" />}</g>
      <path d="M-96,10 C-106,-90 -56,-130 0,-128 C56,-130 106,-90 96,10 C90,-50 60,-70 30,-74 C10,-50 -20,-50 -40,-76 C-70,-60 -90,-30 -96,10 Z" fill="#2a0f3a" />
    </g>
  </g>); };

// ───── Адский гусь: начало координат — между лапами ─────
export const Goose: React.FC<{ x: number; y: number; s?: number; t: number; state?: 'stand' | 'attack' | 'ko' | 'fly'; flap?: number; neck?: number; honk?: number; flip?: boolean; rot?: number }> = ({ x, y, s = 1, t, state = 'stand', flap = 0, neck = 0, honk = 0, flip, rot = 0 }) => {
  const ko = state === 'ko', b = blink(t, 3), wing = state === 'fly' ? Math.sin(t * 18) * .8 : flap;
  const nx = 60 + neck * 70, ny = -330 + neck * 90, smoke = (t * 2) % 1;
  return (<g transform={`translate(${x},${y}) rotate(${rot}) scale(${(flip ? -1 : 1) * s},${s})`}>
    <ellipse cx={0} cy={6} rx={170} ry={22} fill="#000" opacity={.2} />
    {!ko && [-1, 1].map(sd => <g key={sd}><path d={`M${sd * 30},-90 L${sd * 34},-6`} stroke="#ff8a1f" strokeWidth={16} strokeLinecap="round" /><path d={`M${sd * 34 - 30},0 L${sd * 34 + 34},0 L${sd * 34},-14 Z`} fill="#ff8a1f" /></g>)}
    {/* тело */}
    <path d="M-170,-150 C-190,-260 -40,-280 60,-240 C150,-200 150,-90 90,-70 C20,-50 -110,-50 -150,-90 Q-200,-110 -170,-150 Z" fill="#fbfbfb" />
    <path d="M-150,-90 C-110,-50 20,-50 90,-70 C110,-76 126,-90 134,-110 C100,-80 -20,-70 -150,-100 Z" fill="#d9dde6" />
    {/* крыло */}
    <g transform={`translate(-20,-190) rotate(${-wing * 50})`}><path d="M0,0 C-90,-30 -170,10 -190,60 C-140,40 -110,60 -60,50 C-20,44 10,30 0,0 Z" fill="#e8ebf2" /><path d="M-60,20 L-150,50 M-40,32 L-110,56" stroke="#c7ccd8" strokeWidth={5} /></g>
    {/* шея и голова */}
    <path d={`M40,-220 C70,-270 ${nx - 30},${ny + 60} ${nx},${ny + 20}`} stroke="#fbfbfb" strokeWidth={70} fill="none" strokeLinecap="round" />
    <g transform={`translate(${nx},${ny})`}>
      <ellipse cx={0} cy={0} rx={62} ry={56} fill="#fbfbfb" />
      {[-1, 1].map(sd => <path key={sd} d={`M${sd * 20},-44 Q${sd * 34},-90 ${sd * 10 + 30},-96 Q${sd * 22},-70 ${sd * 6 + 10},-48 Z`} fill="#c21d2a" />)}
      {/* клюв */}
      <path d={`M40,-10 L${120 + honk * 10},${-4 - honk * 18} L44,${12} Z`} fill="#ff8a1f" /><path d={`M42,12 L${116},${14 + honk * 34} L40,24 Z`} fill="#e66a10" />
      {honk > .1 && <path d={`M48,10 L108,${10 + honk * 20} L48,20 Z`} fill="#6a1010" />}
      <circle cx={46} cy={-2} r={5} fill="#7a3a10" />
      {/* глаз */}
      {ko ? <path d="M0,-30 L24,-6 M24,-30 L0,-6" stroke="#2a1a1a" strokeWidth={7} strokeLinecap="round" />
        : <g><circle cx={14} cy={-18} r={17} fill="#ffeaea" /><circle cx={18} cy={-18} r={10 * b} fill="#e5383b" /><circle cx={20} cy={-20} r={3.5 * b} fill="#fff" />
          <path d="M-8,-42 L36,-28" stroke="#2a1a1a" strokeWidth={9} strokeLinecap="round" /></g>}
      {!ko && <g opacity={1 - smoke}><circle cx={128 + smoke * 40} cy={-30 - smoke * 50} r={10 + smoke * 18} fill="#9a9aa8" opacity={.5} /></g>}
      {ko && [0, 1, 2].map(i => { const a = t * 4 + i * 2.1; return <path key={i} transform={`translate(${Math.cos(a) * 60},${-90 + Math.sin(a) * 16})`} d="M0,-14 L4,-4 L14,-4 L6,3 L9,13 L0,7 L-9,13 L-6,3 L-14,-4 L-4,-4 Z" fill="#ffd23f" />; })}
    </g>
    {/* ошейник-шип */}
    <path d={`M${nx - 70},${ny + 74} Q${nx - 30},${ny + 96} ${nx + 6},${ny + 70}`} stroke="#2a1a22" strokeWidth={16} fill="none" />
  </g>); };

// ───── Слайм Желе ─────
export const Slime: React.FC<{ x: number; y: number; s?: number; t: number; mouth?: number; squish?: number; look?: [number, number] }> = ({ x, y, s = 1, t, mouth = 0, squish = 0, look }) => {
  const wob = Math.sin(t * 5) * .04 + squish * .25, b = blink(t, 11), lk = look ?? [noise('sl', t, .5) * .4, .1];
  return (<g transform={`translate(${x},${y}) scale(${s * (1 + wob)},${s * (1 - wob)})`}>
    <defs><radialGradient id="slg" cx=".4" cy=".35"><stop offset="0" stopColor="#b8ffe0" /><stop offset=".6" stopColor="#42d6a4" /><stop offset="1" stopColor="#1f9e7a" /></radialGradient></defs>
    <path d="M-80,0 C-90,-50 -60,-110 0,-112 C60,-110 90,-50 80,0 Q0,12 -80,0 Z" fill="url(#slg)" opacity={.95} />
    <ellipse cx={-30} cy={-80} rx={22} ry={12} fill="#fff" opacity={.6} transform="rotate(-25 -30 -80)" />
    {[-1, 1].map(sd => <g key={sd}><ellipse cx={sd * 26 + lk[0] * 6} cy={-52} rx={10} ry={14 * b} fill="#10302a" /><circle cx={sd * 26 + lk[0] * 6 - 3} cy={-57} r={3.5 * b} fill="#fff" /></g>)}
    <g transform="translate(0,-26)">{mouth > .06 ? <ellipse cx={0} cy={4} rx={12} ry={4 + mouth * 12} fill="#0f4a3a" /> : <path d="M-10,0 Q0,8 10,0" stroke="#0f4a3a" strokeWidth={4} fill="none" strokeLinecap="round" />}</g>
  </g>); };
