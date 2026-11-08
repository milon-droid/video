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
export const Goose: React.FC<{ x: number; y: number; s?: number; t: number; state?: 'stand' | 'attack' | 'ko' | 'fly'; flap?: number; neck?: number; honk?: number; flip?: boolean; rot?: number; evil?: number }> = ({ x, y, s = 1, t, state = 'stand', flap = 0, neck = 0, honk = 0, flip, rot = 0, evil = 1 }) => {
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
      {evil > 0 && <g transform={`translate(0,-44) scale(${evil}) translate(0,44)`}>{[-1, 1].map(sd => <path key={sd} d={`M${sd * 20},-44 Q${sd * 34},-90 ${sd * 10 + 30},-96 Q${sd * 22},-70 ${sd * 6 + 10},-48 Z`} fill="#c21d2a" />)}</g>}
      {/* клюв */}
      <path d={`M40,-10 L${120 + honk * 10},${-4 - honk * 18} L44,${12} Z`} fill="#ff8a1f" /><path d={`M42,12 L${116},${14 + honk * 34} L40,24 Z`} fill="#e66a10" />
      {honk > .1 && <path d={`M48,10 L108,${10 + honk * 20} L48,20 Z`} fill="#6a1010" />}
      <circle cx={46} cy={-2} r={5} fill="#7a3a10" />
      {/* глаз */}
      {ko ? <path d="M0,-30 L24,-6 M24,-30 L0,-6" stroke="#2a1a1a" strokeWidth={7} strokeLinecap="round" />
        : <g><circle cx={14} cy={-18} r={17} fill="#ffeaea" /><circle cx={18} cy={-18} r={10 * b} fill={evil > .5 ? "#e5383b" : "#1a1a1a"} /><circle cx={20} cy={-20} r={3.5 * b} fill="#fff" />
          <path d="M-8,-42 L36,-28" stroke="#2a1a1a" strokeWidth={9} strokeLinecap="round" opacity={evil} /></g>}
      {!ko && evil > .5 && <g opacity={1 - smoke}><circle cx={128 + smoke * 40} cy={-30 - smoke * 50} r={10 + smoke * 18} fill="#9a9aa8" opacity={.5} /></g>}
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

// ───── Король демонов v2 (правка пользователя): голова быка, гачи-наряд (кожаная портупея с кольцом, ошейник с шипами,
// напульсники, кожаные штаны), огромный мускулистый торс. Начало координат — пояс по центру. ─────
export const KingBull: React.FC<{ x: number; y: number; s?: number; t: number; mouth?: number; glow?: number; orb?: boolean; steam?: boolean }> = ({ x, y, s = 1, t, mouth = 0, glow = 1, orb = true, steam = true }) => {
  const br = Math.sin(t * 1.3) * 5, hy = -560 + br, fl = .82 + .18 * Math.sin(t * 13) * Math.sin(t * 7), sk = '#8a2230', skSh = '#5e141f', skHi = '#a8343f';
  const puff = (sd: number) => { const k = (t * .9 + (sd > 0 ? .5 : 0)) % 1; return <circle cx={sd * (40 + k * 70)} cy={60 + k * 60} r={14 + k * 40} fill="#d8c8d0" opacity={.45 * (1 - k)} />; };
  return (<g transform={`translate(${x},${y}) scale(${s})`}>
    <defs><radialGradient id="kbEye"><stop offset="0" stopColor="#fff3c0" /><stop offset=".35" stopColor="#ff7a1a" /><stop offset="1" stopColor="#ff2a00" stopOpacity="0" /></radialGradient>
      <linearGradient id="kbCape" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4a0812" /><stop offset="1" stopColor="#14030a" /></linearGradient>
      <linearGradient id="kbLeather" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#0c0a0e" /><stop offset=".45" stopColor="#2c2630" /><stop offset="1" stopColor="#0c0a0e" /></linearGradient></defs>
    <path d="M-380,80 L-300,-420 Q0,-500 300,-420 L380,80 Z" fill="url(#kbCape)" />
    {/* руки: бицепсы, напульсники с шипами */}
    {[-1, 1].map(sd => <g key={sd}>
      <path d={`M${sd * 230},-400 C${sd * 330},-380 ${sd * 350},-250 ${sd * 320},-140 C${sd * 300},-60 ${sd * 250},-20 ${sd * 220},20 L${sd * 160},-10 C${sd * 200},-90 ${sd * 210},-200 ${sd * 190},-330 Z`} fill={sk} />
      <path d={`M${sd * 300},-330 C${sd * 330},-280 ${sd * 330},-220 ${sd * 310},-180`} stroke={skHi} strokeWidth={14} fill="none" opacity={.6} strokeLinecap="round" />
      <g transform={`translate(${sd * 220},0) rotate(${sd * 20})`}><rect x={-60} y={-40} width={120} height={56} rx={14} fill="#111015" />{[-36, -12, 12, 36].map(cx => <path key={cx} d={`M${cx - 9},-40 L${cx},-66 L${cx + 9},-40 Z`} fill="#c8c8d0" />)}</g></g>)}
    {/* торс: грудь, пресс */}
    <path d="M-240,40 L-250,-420 Q0,-470 250,-420 L240,40 Z" fill={sk} />
    <path d="M-230,-420 Q-120,-300 -10,-330 L-10,-250 Q-130,-220 -230,-280 Z" fill={skSh} opacity={.55} /><path d="M230,-420 Q120,-300 10,-330 L10,-250 Q130,-220 230,-280 Z" fill={skSh} opacity={.55} />
    <path d="M-200,-300 Q-110,-250 -14,-270 M200,-300 Q110,-250 14,-270" stroke={skSh} strokeWidth={10} fill="none" strokeLinecap="round" />
    {[0, 1, 2].map(r => [-1, 1].map(sd => <rect key={`${r}${sd}`} x={sd > 0 ? 14 : -94} y={-210 + r * 70} width={80} height={58} rx={22} fill={skHi} opacity={.45} />))}
    <path d="M0,-260 L0,20" stroke={skSh} strokeWidth={8} opacity={.6} />
    {/* гачи-портупея: ремни крест-накрест к кольцу, ремень под грудью */}
    <path d="M-200,-430 L-20,-250 M200,-430 L20,-250" stroke="#141118" strokeWidth={34} strokeLinecap="round" />
    <path d="M-200,-430 L-20,-250 M200,-430 L20,-250" stroke="#3a3440" strokeWidth={8} opacity={.7} />
    <path d="M-245,-230 Q0,-200 245,-230" stroke="#141118" strokeWidth={30} fill="none" />
    <circle cx={0} cy={-240} r={40} fill="none" stroke="#d8d8e0" strokeWidth={14} /><circle cx={-8} cy={-252} r={8} fill="#fff" opacity={.8} />
    {[-150, -75, 75, 150].map(cx => <circle key={cx} cx={cx} cy={-222} r={8} fill="#c8c8d0" />)}
    {/* кожаные штаны и пряжка-череп */}
    <path d="M-250,20 L250,20 L270,120 L-270,120 Z" fill="url(#kbLeather)" /><rect x={-260} y={0} width={520} height={44} rx={8} fill="#1a161c" />
    <g transform="translate(0,22)"><rect x={-46} y={-30} width={92} height={60} rx={10} fill="#b8902a" /><circle cx={0} cy={-2} r={18} fill="#2a1a10" /><path d="M-8,10 L8,10" stroke="#2a1a10" strokeWidth={5} /></g>
    {/* ошейник с шипами */}
    <rect x={-120} y={-470} width={240} height={50} rx={18} fill="#141118" />{[-90, -45, 0, 45, 90].map(cx => <path key={cx} d={`M${cx - 12},-470 L${cx},-510 L${cx + 12},-470 Z`} fill="#d0d0d8" />)}
    {/* голова быка */}
    <g transform={`translate(0,${hy})`}>
      {[-1, 1].map(sd => <g key={sd}><path d={`M${sd * 90},-90 C${sd * 200},-110 ${sd * 300},-170 ${sd * 320},-300 C${sd * 330},-230 ${sd * 260},-130 ${sd * 120},-40 Z`} fill="#e8dcc0" />
        <path d={`M${sd * 290},-230 C${sd * 310},-260 ${sd * 320},-280 ${sd * 320},-300 C${sd * 300},-260 ${sd * 280},-240 ${sd * 260},-220 Z`} fill="#2a2420" />
        <ellipse cx={sd * 150} cy={-40} rx={60} ry={26} fill={skSh} transform={`rotate(${sd * -25} ${sd * 150} -40)`} /></g>)}
      <path d="M-120,-60 C-140,-170 -60,-200 0,-200 C60,-200 140,-170 120,-60 C110,0 90,40 80,80 L-80,80 C-90,40 -110,0 -120,-60 Z" fill="#3a1418" />
      <path d="M-40,-200 L-24,-250 L-8,-205 L0,-262 L8,-205 L24,-250 L40,-200 Z" fill="#1a1418" stroke="#b8902a" strokeWidth={5} />
      {/* надбровье и глаза */}
      <path d="M-110,-80 Q-55,-110 -10,-70 M110,-80 Q55,-110 10,-70" stroke="#1a0608" strokeWidth={22} fill="none" strokeLinecap="round" />
      {[-1, 1].map(sd => <g key={sd}><circle cx={sd * 55} cy={-60} r={50 * glow} fill="url(#kbEye)" opacity={fl} /><path d={`M${sd * 30},-64 L${sd * 82},-58 L${sd * 34},-50 Z`} fill="#fff0b0" /></g>)}
      {/* морда, ноздри, кольцо */}
      <path d="M-90,40 C-100,120 -60,170 0,172 C60,170 100,120 90,40 Z" fill="#5a2026" />
      {[-1, 1].map(sd => <ellipse key={sd} cx={sd * 40} cy={110} rx={18} ry={24} fill="#1a0608" />)}
      <circle cx={0} cy={150} r={32} fill="none" stroke="#e0b030" strokeWidth={10} />
      <path d={`M-50,${150 + mouth * 10} Q0,${168 + mouth * 40} 50,${150 + mouth * 10}`} stroke="#1a0608" strokeWidth={7} fill={mouth > .1 ? '#2a0408' : 'none'} />
      {steam && <g>{puff(-1)}{puff(1)}</g>}
    </g>
    {orb && <g transform="translate(250,-100)"><circle cx={0} cy={-60} r={95} fill="#ff3a3a" opacity={.2} /><circle cx={0} cy={-60} r={78} fill="#2a0a14" opacity={.9} /><circle cx={0} cy={-60} r={78} fill="none" stroke="#ff8a8a" strokeWidth={5} />
      <ellipse cx={-26} cy={-92} rx={22} ry={12} fill="#fff" opacity={.3} transform="rotate(-30 -26 -92)" /></g>}
  </g>); };

// ───── Чиби-Желе: огромные глаза с бликами, румянец, ручки-отростки (финальный вопрос зрителям) ─────
export const ChibiSlime: React.FC<{ x: number; y: number; s?: number; t: number; mouth?: number; point?: number; look?: number }> = ({ x, y, s = 1, t, mouth = 0, point = 0, look = 0 }) => {
  const hop = Math.abs(Math.sin(t * 3.2)), sq = 1 - hop, b = blink(t, 17);
  return (<g transform={`translate(${x},${y - hop * 60}) scale(${s * (1 + sq * .08)},${s * (1 - sq * .08)})`}>
    <defs><radialGradient id="cslg" cx=".4" cy=".3"><stop offset="0" stopColor="#d8fff0" /><stop offset=".55" stopColor="#52e0b0" /><stop offset="1" stopColor="#1f9e7a" /></radialGradient></defs>
    <ellipse cx={0} cy={hop * 60 + 4} rx={150 * (1 - hop * .3)} ry={22} fill="#000" opacity={.2} />
    {/* ручки */}
    <path d={`M-120,-90 Q-200,${-90 - point * 120 * (look < 0 ? 1 : .2)} -230,${-60 - point * 160 * (look < 0 ? 1 : .2)}`} stroke="#3ec99a" strokeWidth={34} fill="none" strokeLinecap="round" />
    <path d={`M120,-90 Q200,${-90 - point * 120 * (look > 0 ? 1 : .2)} 230,${-60 - point * 160 * (look > 0 ? 1 : .2)}`} stroke="#3ec99a" strokeWidth={34} fill="none" strokeLinecap="round" />
    <path d="M-170,0 C-190,-110 -120,-250 0,-252 C120,-250 190,-110 170,0 Q0,22 -170,0 Z" fill="url(#cslg)" />
    <ellipse cx={-70} cy={-190} rx={44} ry={22} fill="#fff" opacity={.65} transform="rotate(-25 -70 -190)" />
    {[-1, 1].map(sd => <g key={sd} transform={`translate(${sd * 62 + look * 14},-118)`}>
      <ellipse cx={0} cy={0} rx={40} ry={52 * b} fill="#0f3a30" /><ellipse cx={0} cy={10 * b} rx={30} ry={30 * b} fill="#1f6a58" />
      <circle cx={-12} cy={-20 * b} r={15 * b} fill="#fff" /><circle cx={14} cy={18 * b} r={7 * b} fill="#fff" /></g>)}
    <ellipse cx={-110} cy={-70} rx={26} ry={13} fill="#ff8aa6" opacity={.6} /><ellipse cx={110} cy={-70} rx={26} ry={13} fill="#ff8aa6" opacity={.6} />
    <g transform="translate(0,-62)">{mouth > .06 ? <path d={`M-22,0 Q0,${8 + mouth * 40} 22,0 Z`} fill="#0f4a3a" /> : <path d="M-16,0 Q0,12 16,0" stroke="#0f4a3a" strokeWidth={6} fill="none" strokeLinecap="round" />}</g>
  </g>); };

// ───── Эльфийка-лучница (сплит-экран выбора): поясной план, начало — пояс по центру ─────
export const Elf: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => {
  const b = blink(t, 21), lid = clamp(Math.max(.15, 1 - b)), hy = -360 + Math.sin(t * 1.7) * 4, wind = Math.sin(t * 1.3) * 6;
  const eye = (sd: number) => { const cx = sd * 38; return (<g key={sd}><clipPath id={`elfE${sd}`}><path d={`M${cx - 28},2 Q${cx},-30 ${cx + 28},2 Q${cx},26 ${cx - 28},2 Z`} /></clipPath>
    <path d={`M${cx - 28},2 Q${cx},-30 ${cx + 28},2 Q${cx},26 ${cx - 28},2 Z`} fill="#fff" />
    <g clipPath={`url(#elfE${sd})`}><ellipse cx={cx + 2} cy={4} rx={15} ry={20} fill="#2fb36a" /><ellipse cx={cx + 2} cy={4} rx={7} ry={10} fill="#0f3a20" /><circle cx={cx - 4} cy={-4} r={5} fill="#fff" />
      <rect x={cx - 30} y={-30} width={60} height={56 * lid} fill="#f6d8c2" /></g>
    <path d={`M${cx - 32},2 Q${cx},${-30 + lid * 28} ${cx + 32},-2 l${sd * 10},-8`} stroke="#3a2a10" strokeWidth={6} fill="none" strokeLinecap="round" />
    <path d={`M${cx - 24},-44 Q${cx},-52 ${cx + 24},-46`} stroke="#c9a040" strokeWidth={6} fill="none" strokeLinecap="round" /></g>); };
  return (<g transform={`translate(${x},${y}) scale(${s})`}>
    {/* волосы сзади и коса */}
    <path d={`M-120,${hy - 10} C-170,${hy + 160} -150,-140 -${130 + wind},-20 L${130 - wind},-20 C150,-140 170,${hy + 160} 120,${hy - 10} Z`} fill="#f2d27a" />
    {/* лук за спиной */}
    <path d="M150,-520 Q260,-260 150,0" stroke="#7a4a2a" strokeWidth={14} fill="none" /><path d="M150,-520 L150,0" stroke="#e8e0c8" strokeWidth={3} />
    {/* плащ и туника */}
    <path d="M-170,40 L-140,-200 Q0,-240 140,-200 L170,40 Z" fill="#2f7a52" /><path d="M-90,40 L-80,-210 Q0,-230 80,-210 L90,40 Z" fill="#e8f0d8" />
    <path d="M-80,-210 L0,-120 L80,-210" fill="none" stroke="#c9a040" strokeWidth={8} /><path d="M-130,-60 L130,-60" stroke="#7a4a2a" strokeWidth={16} />
    <path d="M-150,-190 Q-110,-260 -40,-232 L-60,-180 Z M150,-190 Q110,-260 40,-232 L60,-180 Z" fill="#24603f" />
    <rect x={-18} y={hy + 70} width={36} height={70} fill="#ecc6ae" />
    <g transform={`translate(0,${hy})`}>
      {/* острые уши */}
      {[-1, 1].map(sd => <path key={sd} d={`M${sd * 84},-6 L${sd * 160},-70 L${sd * 92},26 Z`} fill="#f6d8c2" stroke="#e0b8a0" strokeWidth={3} />)}
      <path d="M-88,-10 C-92,-90 -46,-116 0,-116 C46,-116 92,-90 88,-10 C86,42 58,78 18,88 Q0,92 -18,88 C-58,78 -86,42 -88,-10 Z" fill="#f6d8c2" />
      {eye(-1)}{eye(1)}
      <path d="M-2,32 Q3,40 -4,44" stroke="#d9a58a" strokeWidth={4} fill="none" strokeLinecap="round" />
      <path d="M-16,60 Q0,70 16,58" stroke="#c0405a" strokeWidth={6} fill="none" strokeLinecap="round" />
      <g opacity={.5}><ellipse cx={-58} cy={38} rx={15} ry={8} fill="#ff8aa6" /><ellipse cx={58} cy={38} rx={15} ry={8} fill="#ff8aa6" /></g>
      {/* чёлка и обруч */}
      <path d="M-98,0 C-108,-92 -58,-136 0,-134 C58,-136 108,-92 98,0 C90,-40 74,-62 50,-70 C38,-44 18,-50 0,-76 C-18,-50 -38,-44 -50,-70 C-74,-62 -90,-40 -98,0 Z" fill="#f2d27a" />
      <path d="M-86,-60 Q0,-100 86,-60" stroke="#c9a040" strokeWidth={8} fill="none" /><path d="M0,-92 L10,-74 L0,-60 L-10,-74 Z" fill="#7dffb0" />
      <path d={`M80,-20 C120,80 110,200 ${130 + wind},300`} stroke="#f2d27a" strokeWidth={34} fill="none" strokeLinecap="round" />
    </g>
  </g>); };

// ───── Дракон: голова и шея из пещеры, рога, гребень, светящиеся глаза, дым ─────
export const Dragon: React.FC<{ x: number; y: number; s?: number; t: number; roar?: number }> = ({ x, y, s = 1, t, roar = 0 }) => {
  const b = blink(t, 23), bob = Math.sin(t * 1.2) * 10, sm = (t * .6) % 1;
  return (<g transform={`translate(${x},${y + bob}) scale(${s})`}>
    <defs><radialGradient id="drEye"><stop offset="0" stopColor="#fff6b0" /><stop offset=".4" stopColor="#ffb020" /><stop offset="1" stopColor="#ff6a00" stopOpacity="0" /></radialGradient>
      <linearGradient id="drSk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c8302a" /><stop offset="1" stopColor="#6a1414" /></linearGradient></defs>
    {/* крыло-силуэт */}
    <path d="M60,40 L320,-300 L300,-150 L380,-170 L300,-40 L360,-20 L200,60 Z" fill="#4a0e10" opacity={.85} />
    {/* шея */}
    <path d="M-60,400 C-80,200 -40,40 20,-40 L120,-10 C80,80 70,220 90,400 Z" fill="url(#drSk)" />
    {[0, 1, 2, 3, 4].map(i => <path key={i} d={`M${-50 + i * 6},${330 - i * 80} l-40,-20 l30,-30 Z`} fill="#ffb020" opacity={.9} />)}
    {/* голова */}
    <g transform={`rotate(${-6 + roar * -8})`}>
      {[-1, 1].map(sd => <path key={sd} d={`M${sd * 50 + 30},-150 C${sd * 110 + 30},-230 ${sd * 120 + 30},-300 ${sd * 90 + 30},-360 C${sd * 150 + 30},-290 ${sd * 150 + 30},-200 ${sd * 90 + 30},-130 Z`} fill="#3a2a20" />)}
      <path d="M-90,-120 C-110,-200 -20,-230 40,-220 C120,-210 170,-170 230,-120 L250,-60 C200,-40 120,-30 40,-30 C-30,-30 -80,-60 -90,-120 Z" fill="url(#drSk)" />
      {/* челюсть */}
      <path d={`M-70,-60 C-20,${-20 + roar * 60} 120,${-10 + roar * 70} 240,${-50 + roar * 40} L230,${-20 + roar * 60} C120,${30 + roar * 80} 0,${30 + roar * 60} -60,-20 Z`} fill="#8a1c18" />
      {roar > .1 && <path d={`M-40,-50 C40,${-20 + roar * 50} 140,${-20 + roar * 50} 220,-50 Z`} fill="#3a0606" />}
      {[30, 70, 110, 150, 190].map(xx => <path key={xx} d={`M${xx},-48 l8,22 l8,-22 Z`} fill="#f2ead0" />)}
      <ellipse cx={230} cy={-110} rx={10} ry={6} fill="#2a0808" />
      {/* глаз */}
      <circle cx={70} cy={-150} r={40} fill="url(#drEye)" /><ellipse cx={70} cy={-150} rx={24} ry={18 * b} fill="#ffd23f" /><ellipse cx={70} cy={-150} rx={6} ry={16 * b} fill="#1a0800" />
      <path d="M30,-180 L120,-170" stroke="#3a0808" strokeWidth={12} strokeLinecap="round" />
      {/* дым из ноздрей */}
      <circle cx={260 + sm * 60} cy={-120 - sm * 80} r={18 + sm * 40} fill="#8a7a7a" opacity={.45 * (1 - sm)} />
    </g>
  </g>); };

// ───── Дракон анфас (сплит-экран выбора): голова из пещеры, рога, светящиеся глаза, ноздри с дымом, клыки, лапа на камне ─────
export const DragonFront: React.FC<{ x: number; y: number; s?: number; t: number; roar?: number }> = ({ x, y, s = 1, t, roar = 0 }) => {
  const b = blink(t, 29), bob = Math.sin(t * 1.1) * 8, sm = (t * .7) % 1, j = roar * 40;
  return (<g transform={`translate(${x},${y + bob}) scale(${s})`}>
    <defs><radialGradient id="dfEye"><stop offset="0" stopColor="#fff6b0" /><stop offset=".45" stopColor="#ffb020" /><stop offset="1" stopColor="#ff5a00" stopOpacity="0" /></radialGradient>
      <linearGradient id="dfSk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d23a2a" /><stop offset="1" stopColor="#7a1612" /></linearGradient></defs>
    {/* шея уходит в темноту */}
    <path d="M-120,420 C-110,250 -90,150 -70,60 L70,60 C90,150 110,250 120,420 Z" fill="#6a1410" />
    {[0, 1, 2].map(i => <path key={i} d={`M-24,${330 - i * 90} L0,${290 - i * 90} L24,${330 - i * 90} Z`} fill="#ffb020" opacity={.85} />)}
    {/* рога */}
    {[-1, 1].map(sd => <path key={sd} d={`M${sd * 70},-150 C${sd * 150},-200 ${sd * 200},-300 ${sd * 170},-400 C${sd * 230},-300 ${sd * 210},-180 ${sd * 110},-110 Z`} fill="#e8d8b8" stroke="#8a7050" strokeWidth={4} />)}
    {/* гребни-уши */}
    {[-1, 1].map(sd => <path key={'f' + sd} d={`M${sd * 110},-80 L${sd * 230},-120 L${sd * 190},-60 L${sd * 250},-30 L${sd * 120},-20 Z`} fill="#9a2018" />)}
    {/* голова */}
    <path d="M-130,-60 C-140,-170 -60,-210 0,-210 C60,-210 140,-170 130,-60 C125,10 90,60 60,90 L-60,90 C-90,60 -125,10 -130,-60 Z" fill="url(#dfSk)" />
    <path d="M-100,-150 Q0,-190 100,-150" stroke="#ffb020" strokeWidth={6} fill="none" opacity={.6} />
    {/* надбровья и глаза */}
    {[-1, 1].map(sd => <g key={'e' + sd}><circle cx={sd * 58} cy={-90} r={42} fill="url(#dfEye)" /><ellipse cx={sd * 58} cy={-90} rx={26} ry={20 * b} fill="#ffd23f" /><ellipse cx={sd * 58} cy={-90} rx={7} ry={18 * b} fill="#1a0800" />
      <path d={`M${sd * 20},-118 L${sd * 100},-104`} stroke="#3a0808" strokeWidth={14} strokeLinecap="round" /></g>)}
    {/* морда и пасть */}
    <path d={`M-75,30 C-80,${110 + j} -40,${150 + j} 0,${152 + j} C40,${150 + j} 80,${110 + j} 75,30 Z`} fill="#8a1c18" />
    <path d="M-80,20 C-60,70 60,70 80,20 C60,-10 -60,-10 -80,20 Z" fill="#b8302a" />
    {[-1, 1].map(sd => <ellipse key={'n' + sd} cx={sd * 26} cy={10} rx={9} ry={6} fill="#2a0606" />)}
    {[-48, -24, 0, 24, 48].map(xx => <path key={xx} d={`M${xx - 7},48 l7,${18 + Math.abs(xx) * .1} l7,${-18 - Math.abs(xx) * .1} Z`} fill="#f2ead0" />)}
    {roar > .1 && <path d={`M-50,60 C-30,${90 + j} 30,${90 + j} 50,60 Z`} fill="#3a0606" />}
    {/* дым из ноздрей */}
    {[-1, 1].map(sd => <circle key={'s' + sd} cx={sd * (26 + sm * 50)} cy={-10 - sm * 90} r={12 + sm * 34} fill="#8a7a7a" opacity={.45 * (1 - sm)} />)}
  </g>); };
