// Фоны «ПОПАЛ»: все в координатах 1080×1920, градиенты + мягкий свет (без плоских кружков).
import React from 'react';
import { noise } from '../anim';

export const Glow: React.FC<{ x: number; y: number; r: number; c: string; o?: number; id: string }> = ({ x, y, r, c, o = 1, id }) => (<g opacity={o}>
  <defs><radialGradient id={id}><stop offset="0" stopColor={c} stopOpacity=".85" /><stop offset=".4" stopColor={c} stopOpacity=".35" /><stop offset="1" stopColor={c} stopOpacity="0" /></radialGradient></defs>
  <circle cx={x} cy={y} r={r} fill={`url(#${id})`} /></g>);
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
// мягкие частицы: разного размера и яркости, радиальный градиент (не плоские кружки)
export const Motes: React.FC<{ n: number; t: number; c: string; seed: number; area?: [number, number, number, number]; vy?: number; size?: number }> = ({ n, t, c, seed, area = [0, 0, 1080, 1920], vy = -20, size = 10 }) => (<g>
  <defs><radialGradient id={`mote${seed}`}><stop offset="0" stopColor={c} stopOpacity=".9" /><stop offset="1" stopColor={c} stopOpacity="0" /></radialGradient></defs>
  {Array.from({ length: n }, (_, i) => { const h = hash(i + seed * 13), h2 = hash(i * 7 + seed), r = size * (.5 + h2 * 1.6);
    const x = area[0] + h * area[2] + noise('m' + seed + i, t, .3) * 30, y = area[1] + ((hash(i * 3 + seed) * area[3] + vy * t * (.5 + h2)) % area[3] + area[3]) % area[3];
    return <circle key={i} cx={x} cy={y} r={r * 2} fill={`url(#mote${seed})`} opacity={.3 + .7 * hash(i * 11 + seed)} />; })}</g>);

// ───── Ночная улица мегаполиса ─────
export const Street: React.FC<{ t: number }> = ({ t }) => (<g>
  <defs><linearGradient id="stSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0b1430" /><stop offset=".55" stopColor="#2a2a5a" /><stop offset="1" stopColor="#4a3560" /></linearGradient>
    <linearGradient id="road" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a2c3e" /><stop offset="1" stopColor="#14151f" /></linearGradient></defs>
  <rect width={1080} height={1920} fill="url(#stSky)" />
  {/* дальние дома */}
  {[[-40, 520, 260, '#1c2245'], [200, 380, 220, '#20274d'], [400, 600, 200, '#1a2042'], [580, 300, 260, '#222a52'], [820, 480, 300, '#1c2245']].map(([x, y, w, c], i) => <g key={i}>
    <rect x={x as number} y={y as number} width={w as number} height={1400} fill={c as string} />
    {Array.from({ length: 40 }, (_, j) => { const cx = (x as number) + 22 + (j % 5) * ((w as number) - 40) / 5, cy = (y as number) + 40 + Math.floor(j / 5) * 80; const on = hash(j + i * 50) > .45;
      return on ? <rect key={j} x={cx} y={cy} width={22} height={34} fill={hash(j * 3 + i) > .5 ? '#ffd27a' : '#8fd0ff'} opacity={.55 + .3 * hash(j)} /> : null; })}</g>)}
  {/* неон */}
  <g transform="translate(110,860)"><rect x={-10} y={-10} width={300} height={110} rx={18} fill="#2a0f2a" /><text x={140} y={70} fontSize={72} fontWeight={900} textAnchor="middle" fill="#ff5ad9" fontFamily="Mont" style={{ filter: 'drop-shadow(0 0 18px #ff5ad9)' }}>24/7</text></g>
  <g transform="translate(700,760)"><rect x={-10} y={-10} width={330} height={100} rx={18} fill="#0f1f2a" /><text x={155} y={64} fontSize={62} fontWeight={900} textAnchor="middle" fill="#4ae0ff" fontFamily="Mont" opacity={.85 + .15 * Math.sin(t * 23)} style={{ filter: 'drop-shadow(0 0 16px #4ae0ff)' }}>NOODLES</text></g>
  <Glow x={260} y={900} r={300} c="#ff5ad9" o={.35} id="g1" /><Glow x={860} y={800} r={300} c="#4ae0ff" o={.3} id="g2" />
  {/* тротуар и дорога с зеброй */}
  <rect x={0} y={1180} width={1080} height={740} fill="url(#road)" />
  <rect x={0} y={1160} width={1080} height={30} fill="#3a3c52" />
  {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M${60 + i * 150},1260 L${150 + i * 150},1260 L${170 + i * 165},1900 L${40 + i * 165},1900 Z`} fill="#e8e8f0" opacity={.75} />)}
  {/* фонарь */}
  <rect x={948} y={600} width={14} height={580} fill="#14151f" /><path d="M955,600 Q955,560 900,560 L870,560" stroke="#14151f" strokeWidth={12} fill="none" /><rect x={840} y={556} width={60} height={20} rx={8} fill="#ffe6a0" />
  <Glow x={870} y={580} r={260} c="#ffd27a" o={.55} id="g3" />
</g>);

// ───── Белая пустота ─────
export const Void: React.FC<{ t: number }> = ({ t }) => (<g>
  <defs><radialGradient id="voidG" cx=".5" cy=".42"><stop offset="0" stopColor="#ffffff" /><stop offset=".6" stopColor="#eef0fa" /><stop offset="1" stopColor="#c9cce6" /></radialGradient></defs>
  <rect width={1080} height={1920} fill="url(#voidG)" />
  {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M540,820 L${540 + Math.cos(i / 14 * 6.283 + t * .05) * 1600},${820 + Math.sin(i / 14 * 6.283 + t * .05) * 1600}`} stroke="#ffffff" strokeWidth={60} opacity={.35} />)}
  <Motes n={26} t={t} c="#c8d4ff" seed={2} vy={-30} size={12} />
</g>);

// ───── Отдел перерождения: зал над облаками ─────
export const Hall: React.FC<{ t: number }> = ({ t }) => (<g>
  <defs><linearGradient id="hallG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#bfe6ff" /><stop offset=".6" stopColor="#eef7ff" /><stop offset="1" stopColor="#ffffff" /></linearGradient></defs>
  <rect width={1080} height={1920} fill="url(#hallG)" />
  {[-60, 300, 700, 1040].map((x, i) => <g key={i}><rect x={x - 40} y={300} width={80} height={1000} fill="#ffffff" /><rect x={x - 40} y={300} width={22} height={1000} fill="#dbe8f5" /><rect x={x - 60} y={280} width={120} height={40} fill="#f2f7fc" /></g>)}
  <rect x={180} y={360} width={720} height={150} rx={20} fill="#1d2a4a" /><text x={540} y={430} fontSize={52} fontWeight={900} textAnchor="middle" fill="#9fe3ff" fontFamily="Mont">ОТДЕЛ ПЕРЕРОЖДЕНИЯ</text>
  <text x={540} y={485} fontSize={34} fontWeight={700} textAnchor="middle" fill="#ffd23f" fontFamily="Mont">ОЧЕРЕДЬ · ОКНА 1–999</text>
  {/* облачный пол */}
  {Array.from({ length: 9 }, (_, i) => <ellipse key={i} cx={i * 140 - 40 + noise('cl' + i, t, .2) * 20} cy={1420 + (i % 2) * 40} rx={200} ry={90} fill="#ffffff" opacity={.95} />)}
  <rect x={0} y={1440} width={1080} height={480} fill="#ffffff" />
</g>);

// ───── Окно 3: стойка ─────
export const Counter: React.FC<{ t: number; flicker?: boolean }> = ({ t }) => (<g>
  <defs><linearGradient id="ctrW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d7ecff" /><stop offset="1" stopColor="#f6fbff" /></linearGradient></defs>
  <rect width={1080} height={1920} fill="url(#ctrW)" />
  <rect x={90} y={330} width={900} height={1000} rx={30} fill="#eaf4ff" stroke="#c7dcf0" strokeWidth={14} />
  <rect x={360} y={360} width={360} height={90} rx={16} fill="#1d2a4a" /><text x={540} y={423} fontSize={58} fontWeight={900} textAnchor="middle" fill="#ffd23f" fontFamily="Mont">ОКНО 3</text>
  <rect x={140} y={480} width={170} height={220} rx={10} fill="#ffffff" stroke="#d0dbe8" strokeWidth={4} />
  <text x={225} y={530} fontSize={22} fontWeight={800} textAnchor="middle" fill="#3a4a6a" fontFamily="Mont">ГРАФИК</text>
  <text x={225} y={570} fontSize={19} fontWeight={600} textAnchor="middle" fill="#5a6a8a" fontFamily="Mont">ПН–ВС</text><text x={225} y={600} fontSize={19} fontWeight={600} textAnchor="middle" fill="#5a6a8a" fontFamily="Mont">ВЕЧНОСТЬ</text>
  <text x={225} y={640} fontSize={19} fontWeight={600} textAnchor="middle" fill="#e5383b" fontFamily="Mont">ОБЕД 13–14</text>
  <Glow x={540} y={700} r={500} c="#fff6c8" o={.5} id="ctrg" />
</g>);
export const Desk: React.FC = () => (<g><rect x={0} y={1240} width={1080} height={680} fill="#c9d8ea" /><rect x={0} y={1230} width={1080} height={40} fill="#ffffff" />
  <rect x={0} y={1270} width={1080} height={16} fill="#a9bcd4" />
  <g transform="translate(820,1220)"><rect x={-40} y={-90} width={80} height={95} rx={12} fill="#ffffff" stroke="#d0d0d0" strokeWidth={4} /><path d="M40,-70 q30,0 30,25 q0,25 -30,25" stroke="#d0d0d0" strokeWidth={8} fill="none" />
    <text x={0} y={-40} fontSize={15} fontWeight={900} textAnchor="middle" fill="#ff5aa8" fontFamily="Mont">BEST</text><text x={0} y={-20} fontSize={15} fontWeight={900} textAnchor="middle" fill="#ff5aa8" fontFamily="Mont">GODDESS</text></g>
  <g transform="translate(200,1225)"><rect x={-70} y={-20} width={140} height={22} fill="#ffffff" transform="rotate(-6)" /><rect x={-66} y={-36} width={140} height={22} fill="#f4f4f4" transform="rotate(4)" /></g></g>);

// ───── Небо падения ─────
export const SkyFall: React.FC<{ t: number; speed?: number }> = ({ t, speed = 900 }) => (<g>
  <defs><linearGradient id="skyF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6b55c9" /><stop offset=".6" stopColor="#c58ad6" /><stop offset="1" stopColor="#ffc1b8" /></linearGradient></defs>
  <rect width={1080} height={1920} fill="url(#skyF)" />
  {Array.from({ length: 10 }, (_, i) => { const y = ((hash(i) * 2600 - t * speed * (.6 + hash(i * 3))) % 2600 + 2600) % 2600 - 340;
    return <g key={i} opacity={.85}><ellipse cx={hash(i * 5) * 1080} cy={y} rx={260 + hash(i * 7) * 160} ry={90} fill="#ffffff" /><ellipse cx={hash(i * 5) * 1080 + 120} cy={y - 40} rx={160} ry={80} fill="#ffffff" /></g>; })}
  {Array.from({ length: 22 }, (_, i) => { const x = hash(i * 9) * 1080, y = ((hash(i * 4) * 1920 - t * speed * 2.2) % 1920 + 1920) % 1920; return <rect key={'s' + i} x={x} y={y} width={4} height={160} fill="#fff" opacity={.35} />; })}
</g>);

// ───── Эльдория: высокая панорама 1080×3600 (смотреть через сдвиг по y) ─────
export const Eldoria: React.FC<{ t: number; lightning?: number }> = ({ t, lightning = 0 }) => (<g>
  <defs><linearGradient id="elSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5b46b8" /><stop offset=".35" stopColor="#a77ad8" /><stop offset=".6" stopColor="#f6b2c9" /><stop offset="1" stopColor="#ffd9b0" /></linearGradient>
    <linearGradient id="isl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6fbf7a" /><stop offset=".25" stopColor="#3f8a5a" /><stop offset=".3" stopColor="#8a6a50" /><stop offset="1" stopColor="#4a3440" /></linearGradient></defs>
  <rect width={1080} height={3600} fill="url(#elSky)" />
  {/* две луны днём */}
  <Glow x={290} y={420} r={260} c="#ffffff" o={.5} id="mg1" /><circle cx={290} cy={420} r={120} fill="#fff6ee" /><circle cx={250} cy={390} r={22} fill="#efe0e8" /><circle cx={320} cy={460} r={14} fill="#efe0e8" />
  <Glow x={820} y={260} r={150} c="#bfe8ff" o={.6} id="mg2" /><circle cx={820} cy={260} r={62} fill="#d9f2ff" /><circle cx={806} cy={250} r={10} fill="#c0e0f2" />
  {/* летающие острова с башнями и водопадами */}
  {[[230, 900, 1], [800, 1250, .8], [380, 1700, .6], [900, 760, .5]].map(([x, y, s], i) => <g key={i} transform={`translate(${x},${(y as number) + Math.sin(t * .8 + i) * 12}) scale(${s})`}>
    <path d="M-220,0 Q0,-40 220,0 L120,90 L40,260 L0,330 L-40,240 L-130,90 Z" fill="url(#isl)" />
    <rect x={-40} y={-210} width={80} height={210} fill="#efe6ff" /><path d="M-60,-210 L0,-300 L60,-210 Z" fill="#6b4ac9" /><rect x={-14} y={-160} width={28} height={40} rx={14} fill="#ffd27a" />
    <rect x={80} y={-120} width={50} height={120} fill="#e6dcff" /><path d="M66,-120 L105,-180 L144,-120 Z" fill="#6b4ac9" />
    <rect x={150} y={10} width={26} height={360} fill="#bfefff" opacity={.7} /><rect x={156} y={10} width={8} height={360} fill="#ffffff" opacity={.8} />
    <path d="M-200,-6 Q-150,-40 -110,-8 Q-60,-50 -20,-8" fill="#4f9e64" /></g>)}
  {/* дальние горы и замок Короля демонов */}
  <path d="M0,2200 L160,1980 L300,2120 L470,1900 L640,2100 L800,1950 L1080,2160 L1080,2400 L0,2400 Z" fill="#8c79c4" opacity={.8} />
  <g transform="translate(820,1960)"><Glow x={0} y={-80} r={260} c="#ff2a3a" o={.35 + lightning * .5} id="cg" />
    <path d="M-110,40 L-110,-120 L-80,-120 L-80,-200 L-60,-260 L-40,-200 L-40,-120 L-10,-120 L-10,-300 L10,-360 L30,-300 L30,-120 L60,-120 L60,-210 L80,-260 L100,-210 L100,40 Z" fill="#1a1024" />
    {[-64, 4, 74].map(x => <rect key={x} x={x - 6} y={-100} width={12} height={20} fill="#ff4a3a" />)}
    {lightning > 0 && <path d="M10,-360 L-30,-520 L10,-500 L-20,-700" stroke="#ff7a8a" strokeWidth={8} fill="none" opacity={lightning} />}</g>
  <path d="M0,2300 Q270,2200 540,2290 Q800,2370 1080,2260 L1080,2600 L0,2600 Z" fill="#6aa86e" />
  {/* грибы-гиганты и лес */}
  {[[120, 2560, 1.2], [960, 2620, 1], [700, 2500, .6]].map(([x, y, s], i) => <g key={i} transform={`translate(${x},${y}) scale(${s})`}><rect x={-26} y={-260} width={52} height={260} fill="#f4e6d0" /><path d="M-150,-250 Q0,-420 150,-250 Q0,-210 -150,-250 Z" fill={i % 2 ? '#e5383b' : '#ff7ad9'} />
    {[-80, 0, 70].map(cx => <ellipse key={cx} cx={cx} cy={-300} rx={16} ry={10} fill="#fff" opacity={.9} />)}</g>)}
  <rect x={0} y={2560} width={1080} height={1040} fill="#4f9e64" />
  {Array.from({ length: 14 }, (_, i) => <g key={i} transform={`translate(${i * 82 - 20},${2620 + (i % 3) * 30})`}><path d="M0,0 L60,-200 L120,0 Z" fill={i % 2 ? '#2f7a52' : '#3a8a5e'} /></g>)}
  {/* пруд внизу */}
  <ellipse cx={540} cy={3300} rx={460} ry={130} fill="#4fb3c9" /><ellipse cx={540} cy={3290} rx={380} ry={90} fill="#7fd6e6" opacity={.6} />
</g>);

// ───── Пруд в лесу Эльдории (средний план) ─────
export const Pond: React.FC<{ t: number; dark?: number }> = ({ t, dark = 0 }) => (<g>
  <defs><linearGradient id="pSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9c7ad8" /><stop offset=".55" stopColor="#f2b4c9" /><stop offset="1" stopColor="#ffd9b0" /></linearGradient>
    <linearGradient id="pWater" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6fd0e0" /><stop offset="1" stopColor="#2f8aa6" /></linearGradient></defs>
  <rect width={1080} height={1920} fill="url(#pSky)" />
  <circle cx={820} cy={330} r={70} fill="#fff6ee" opacity={.9} /><circle cx={300} cy={260} r={34} fill="#d9f2ff" opacity={.9} />
  <path d="M0,980 Q300,860 560,940 Q820,1010 1080,900 L1080,1200 L0,1200 Z" fill="#8fbf8a" />
  {[[90, 1000, 1.1], [980, 1040, 1.3], [760, 950, .7]].map(([x, y, s], i) => <g key={i} transform={`translate(${x},${y}) scale(${s})`}><rect x={-20} y={-220} width={40} height={220} fill="#f4e6d0" /><path d="M-130,-210 Q0,-360 130,-210 Q0,-180 -130,-210 Z" fill={i ? '#ff7ad9' : '#e5383b'} /></g>)}
  {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M${i * 120 - 40},1150 L${i * 120 + 20},${880 - (i % 3) * 60} L${i * 120 + 80},1150 Z`} fill={i % 2 ? '#2f7a52' : '#3f8a5e'} />)}
  <rect x={0} y={1120} width={1080} height={800} fill="#4f9e64" />
  <ellipse cx={540} cy={1430} rx={620} ry={230} fill="url(#pWater)" />
  {Array.from({ length: 5 }, (_, i) => <ellipse key={i} cx={540} cy={1430} rx={120 + ((t * 80 + i * 120) % 600)} ry={(40 + ((t * 80 + i * 120) % 600) * .35)} fill="none" stroke="#bff3ff" strokeWidth={4} opacity={.5 * (1 - ((t * 80 + i * 120) % 600) / 600)} />)}
  {Array.from({ length: 16 }, (_, i) => { const x = i * 72, h = 160 + hash(i) * 140, sw = Math.sin(t * 2 + i) * 6; return <path key={'r' + i} d={`M${x},1920 Q${x + sw},${1920 - h * .6} ${x + sw * 2},${1920 - h}`} stroke="#2f6a40" strokeWidth={14} fill="none" strokeLinecap="round" />; })}
  {dark > 0 && <rect width={1080} height={1920} fill="#1a0a20" opacity={dark} />}
</g>);

// ───── Тронный зал Короля демонов ─────
export const Throne: React.FC<{ t: number }> = ({ t }) => (<g>
  <defs><linearGradient id="thG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1a0a1e" /><stop offset=".7" stopColor="#3a1022" /><stop offset="1" stopColor="#7a1e1a" /></linearGradient></defs>
  <rect width={1080} height={1920} fill="url(#thG)" />
  {[60, 1020].map((x, i) => <g key={i}><rect x={x - 70} y={200} width={140} height={1500} fill="#2a1626" /><rect x={x - 70} y={200} width={30} height={1500} fill="#4a2232" />
    <Glow x={x} y={700} r={160} c="#ff6a1f" o={.6 + .2 * Math.sin(t * 9 + i)} id={`tor${i}`} /><path d={`M${x - 20},720 Q${x},${650 + Math.sin(t * 11 + i) * 10} ${x + 20},720 Z`} fill="#ffb34a" /></g>)}
  {/* трон */}
  <path d="M260,1500 L300,520 L380,620 L440,420 L540,560 L640,420 L700,620 L780,520 L820,1500 Z" fill="#120810" />
  <path d="M340,1500 L360,760 L540,700 L720,760 L740,1500 Z" fill="#2a1424" />
  {/* лава */}
  <rect x={0} y={1640} width={1080} height={280} fill="#ff5a1f" />
  {Array.from({ length: 8 }, (_, i) => <ellipse key={i} cx={(i * 150 + t * 40) % 1200 - 60} cy={1700 + (i % 2) * 60} rx={90} ry={20} fill="#ffd26a" opacity={.7} />)}
  <Glow x={540} y={1700} r={700} c="#ff4a1f" o={.55} id="lavaG" />
  <Motes n={24} t={t} c="#ffb04a" seed={7} area={[0, 900, 1080, 1000]} vy={-60} size={7} />
</g>);

// ───── Развилка на закате ─────
export const Crossroads: React.FC<{ t: number }> = ({ t }) => (<g>
  <defs><linearGradient id="crS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5a3a8a" /><stop offset=".5" stopColor="#ff8a6a" /><stop offset=".72" stopColor="#ffd08a" /><stop offset="1" stopColor="#ffd08a" /></linearGradient></defs>
  <rect width={1080} height={1920} fill="url(#crS)" />
  <Glow x={540} y={1100} r={520} c="#fff0b0" o={.7} id="sun" /><circle cx={540} cy={1100} r={130} fill="#fff1c0" />
  <circle cx={250} cy={420} r={50} fill="#fff6ee" opacity={.85} /><circle cx={860} cy={330} r={26} fill="#d9f2ff" opacity={.85} />
  <path d="M0,1150 Q300,1080 540,1130 Q780,1180 1080,1090 L1080,1920 L0,1920 Z" fill="#6a8a5a" />
  <path d="M0,1100 L120,1040 L260,1110 L0,1160 Z M1080,1080 L940,1020 L800,1100 L1080,1140 Z" fill="#4a5a6a" opacity={.7} />
  {/* дорога-развилка */}
  <path d="M470,1920 L520,1180 L560,1180 L610,1920 Z" fill="#c9a77a" />
  <path d="M500,1260 Q300,1200 0,1250 L0,1320 Q300,1260 500,1320 Z" fill="#c9a77a" /><path d="M580,1260 Q780,1200 1080,1240 L1080,1310 Q780,1260 580,1320 Z" fill="#c9a77a" />
  {Array.from({ length: 12 }, (_, i) => { const x = i * 95, h = 60 + hash(i) * 40; return <path key={i} d={`M${x},1920 Q${x + 6 + Math.sin(t * 2 + i) * 6},${1920 - h} ${x + 14},${1920 - h * 1.6}`} stroke="#3f6a3a" strokeWidth={10} fill="none" />; })}
</g>);
