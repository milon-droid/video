// «Didn't Want To Anyway», сцена 1: фильм по телевизору и Вини на диване.
// В фильме — Том Холланд как актёр, в обычной одежде (бомбер, футболка, джинсы); костюм и атрибуты Человека-паука не рисуем.
// Телевизор широкий 16:9: фильм нарисован в кадре 1920×1080; на крупном плане экран заполняет высоту кадра.
// Сэди в фильме — образ с фото пользователя: прямая чёлка, оливковая кожанка; на стадионе — прежний образ (платье).
import React from 'react';
import { clamp, lerp, noise, spr } from '../anim';
import { Glow, Motes } from '../bg/Bg';
import { blendPose, Pose, POSES } from '../chars/Person';
import { Baller, Sadie, smooth } from '../stars/Stars';

type P2 = [number, number];
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const full = (p: Partial<Pose>): Pose => ({ ...POSES.stand, ...p } as Pose);

// ───── фильм (кадр 1920×1080): ночная крыша над городом ─────
const Rooftop: React.FC<{ t: number }> = ({ t }) => (<g>
  <defs><linearGradient id="mvSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0a0a24" /><stop offset=".6" stopColor="#2a1f5a" /><stop offset="1" stopColor="#7a3a6a" /></linearGradient></defs>
  <rect width={1920} height={1080} fill="url(#mvSky)" />
  <circle cx={1180} cy={170} r={70} fill="#fff4dc" /><Glow x={1180} y={170} r={260} c="#ffe8c0" o={.6} id="mvMoon" />
  {Array.from({ length: 30 }, (_, i) => { const w = 60 + hash(i) * 60, h = 200 + hash(i * 3) * 420, x = i * 66 - 30;
    return <g key={i}><rect x={x} y={830 - h} width={w} height={h} fill={i % 2 ? '#1a1838' : '#221e46'} />
      {Array.from({ length: 24 }, (_, k) => hash(i * 50 + k) > .55 ? <rect key={k} x={x + 8 + (k % 3) * (w / 3.3)} y={830 - h + 16 + Math.floor(k / 3) * 30} width={9} height={13} fill="#ffd27a" opacity={.55 + .4 * hash(k + i)} /> : null)}</g>; })}
  <rect y={820} width={1920} height={260} fill="#14121e" /><rect y={806} width={1920} height={20} fill="#2a2638" />
  <g transform="translate(560,806) scale(.6)"><rect x={-20} y={-300} width={12} height={300} fill="#1a1826" /><rect x={30} y={-300} width={12} height={300} fill="#1a1826" />
    <path d="M-50,-300 Q20,-360 90,-300 L90,-480 Q20,-520 -50,-480 Z" fill="#221e30" /><path d="M-50,-480 Q20,-420 90,-480" stroke="#3a3450" strokeWidth={6} fill="none" /></g>
  <path d="M1360,806 L1360,640 M1334,664 L1386,664 M1344,690 L1376,690" stroke="#2a2638" strokeWidth={6} /><circle cx={1360} cy={634} r={6} fill="#ff4a4a" opacity={.5 + .5 * Math.sin(t * 5)} />
  <Motes n={30} t={t} c="#c8b8ff" seed={41} vy={-40} size={4} area={[0, 0, 1920, 1080]} />
</g>);
const Wind: React.FC<{ t: number; o?: number }> = ({ t, o = 1 }) => <g opacity={o}>{Array.from({ length: 14 }, (_, i) => { const y = 100 + hash(i) * 900, x = ((hash(i * 3) * 2400 + t * 1600) % 2400) - 300;
  return <path key={i} d={`M${x},${y} l110,-12`} stroke="#fff" strokeWidth={2.5} opacity={.18} strokeLinecap="round" />; })}</g>;

// Том Холланд (актёр, в обычной одежде) подходит к Сэди и обнимает её; на крупном плане видно x≈660…1260
const MS = .5, FLOOR = 900, SADIE_X = 1050, TOM_X0 = 520, TOM_X1 = 860, STOP = 1.3;
const MovieScene: React.FC<{ tm: number }> = ({ tm }) => {
  const k = smooth(0, STOP, tm), tx = lerp(TOM_X0, TOM_X1, k), ph = (tx - TOM_X0) / 32, walking = tm < STOP;
  const hug = spr(tm, 1.7, { damping: 12, stiffness: 120 });
  const tPose: Partial<Pose> = walking ? { legL: [Math.sin(ph) * .45, Math.max(0, -Math.cos(ph)) * .5], legR: [-Math.sin(ph) * .45, -Math.max(0, Math.cos(ph)) * .5], armL: [-Math.sin(ph) * .35, .3], armR: [Math.sin(ph) * .35, -.3] }
    : blendPose(full({ armL: [-.15, .15], armR: [.3, -.3] }), full({ armL: [-.15, .15], armR: [1.35, .35] }), hug) as Pose;
  const sPose: Partial<Pose> = tm < 1.6 ? { armL: [-.2, .15], armR: [.4, -1.6], legR: [.12, -.1] } : { armL: [-.9, -1.2], armR: [.3, -.3], legR: [.16, -.14], lean: -.04 };
  return (<g>
    <Rooftop t={tm} />
    <Sadie x={SADIE_X} y={FLOOR} s={MS * .95} t={tm + 3} hair="fringe" outfit="jacket" pose={sPose} expr={tm < 1.6 ? 'neutral' : 'happy'} blush={tm > 1.6 ? .8 : .2} eye={[-.8, 0]} headTilt={tm > 1.6 ? -10 : 0} />
    <Baller who="tom" outfit="bomber" x={tx} y={FLOOR - (walking ? Math.abs(Math.sin(ph)) * 4 : 0)} s={MS} t={tm} pose={tPose} expr={tm > 1.6 ? 'happy' : 'cool'} eye={[.8, 0]} headTilt={tm > 1.6 ? 8 : 0} />
    {tm > 1.9 && [0, 1, 2].map(i => { const u = tm - 1.9 - i * .25; if (u < 0) return null; const y = 540 - u * 120, x = SADIE_X - 70 + i * 28 + Math.sin(u * 5 + i) * 10;
      return <path key={i} d={`M${x},${y} c-7,-10 -21,-3 0,12 c21,-15 7,-22 0,-12z`} fill="#ff6a8a" opacity={clamp(1 - u / 1.2)} />; })}
    <Wind t={tm} o={.5} />
  </g>); };

// ───── комната Вини: общие предметы ─────
const Trophy: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (<g transform={`translate(${x},${y}) scale(${s})`}>
  <path d="M-30,-90 L30,-90 Q30,-40 0,-30 Q-30,-40 -30,-90 Z" fill="#e8c050" /><path d="M-30,-82 q-22,4 -18,24 q4,14 22,12 M30,-82 q22,4 18,24 q-4,14 -22,12" stroke="#e8c050" strokeWidth={6} fill="none" />
  <rect x={-6} y={-32} width={12} height={20} fill="#c89a30" /><rect x={-22} y={-14} width={44} height={14} rx={3} fill="#5a3a22" /><path d="M-18,-84 L-12,-46" stroke="#fff6c0" strokeWidth={5} opacity={.6} /></g>);
const FramedKit: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (<g transform={`translate(${x},${y}) scale(${s})`}>
  <rect x={-130} y={-150} width={260} height={300} rx={8} fill="#0e0c14" /><rect x={-118} y={-138} width={236} height={276} fill="#22202e" />
  <path d="M-90,-90 L-40,-110 Q0,-90 40,-110 L90,-90 L104,-30 L66,-20 L64,110 L-64,110 L-66,-20 L-104,-30 Z" fill="#f6f6f3" />
  <path d="M-24,-104 L0,-72 L24,-104" stroke="#1d2a5c" strokeWidth={8} fill="none" /><text x={0} y={60} fontSize={110} fontWeight={900} fill="#1d2a5c" textAnchor="middle" fontFamily="Mont">7</text>
  <text x={0} y={-30} fontSize={26} fontWeight={900} fill="#1d2a5c" textAnchor="middle" fontFamily="Mont">VINI JR.</text></g>);
const Plant: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => (<g transform={`translate(${x},${y}) scale(${s})`}>
  {[-.9, -.5, -.15, .2, .55, .9].map((a, i) => <path key={i} d={`M0,-60 Q${Math.sin(a) * 90},${-150 - i % 2 * 40} ${Math.sin(a) * 150 + noise('pl' + i, t, .4) * 6},${-200 - (i % 3) * 50}`} stroke="#3a8a5a" strokeWidth={22} fill="none" strokeLinecap="round" />)}
  <path d="M-50,-70 L50,-70 L40,0 L-40,0 Z" fill="#c8b8a0" /></g>);

// ───── широкий ТВ на стене, Вини со спины ─────
const TV = { x: 60, y: 600, w: 960, h: 540 };
export const ShotTv: React.FC<{ t: number; pull?: [number, number] }> = ({ t, pull = [2.4, 3.6] }) => {
  const k = smooth(pull[0], pull[1], t), sc = lerp(1920 / TV.h, 1, k), cx = TV.x + TV.w / 2, cy = TV.y + TV.h / 2;
  const fl = .5 + .5 * noise('tvf', t, 3);
  return (<g transform={`translate(540,960) scale(${sc}) translate(${-cx},${-cy})`}>
    <defs><linearGradient id="roomWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1a1626" /><stop offset="1" stopColor="#2a2236" /></linearGradient>
      <linearGradient id="roomFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a2a22" /><stop offset="1" stopColor="#221812" /></linearGradient></defs>
    <rect x={-200} y={-200} width={1480} height={1560} fill="url(#roomWall)" />
    <rect x={-200} y={1320} width={1480} height={800} fill="url(#roomFloor)" />
    {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${-200 + i * 180},1320 L${-600 + i * 280},2100`} stroke="#2a1e18" strokeWidth={4} />)}
    <ellipse cx={540} cy={1640} rx={620} ry={150} fill="#4a3a5a" opacity={.6} />
    {/* неоновая подпись и подсветка за ТВ */}
    <Glow x={cx} y={cy} r={760} c="#8a5aff" o={.45 + .15 * fl} id="tvLed" />
    <text x={790} y={360} fontSize={92} fontWeight={900} fill="none" stroke="#5af0ff" strokeWidth={6} textAnchor="middle" fontFamily="Mont" opacity={.9}>VJ7</text>
    <Glow x={790} y={330} r={200} c="#5af0ff" o={.35} id="neon" />
    <FramedKit x={250} y={330} s={.82} />
    {/* полка с кубками слева, торшер */}
    <rect x={-120} y={760} width={140} height={14} fill="#4a3424" /><Trophy x={-50} y={760} s={.9} />
    <rect x={-120} y={980} width={140} height={14} fill="#4a3424" /><Trophy x={-80} y={980} s={.7} /><Trophy x={-20} y={980} s={.6} />
    {/* экран */}
    <rect x={TV.x - 16} y={TV.y - 16} width={TV.w + 32} height={TV.h + 32} rx={14} fill="#050508" />
    <svg x={TV.x} y={TV.y} width={TV.w} height={TV.h} viewBox="0 0 1920 1080"><MovieScene tm={t} /></svg>
    <rect x={TV.x} y={TV.y} width={TV.w} height={TV.h} fill="url(#tvGlare)" opacity={k * .6} />
    <defs><linearGradient id="tvGlare" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".16" /><stop offset=".35" stopColor="#fff" stopOpacity="0" /></linearGradient></defs>
    {/* тумба: приставка, саундбар, мяч */}
    <rect x={120} y={1200} width={840} height={120} rx={10} fill="#2a1e1a" /><rect x={120} y={1200} width={840} height={14} fill="#3a2a22" />
    <rect x={380} y={1170} width={320} height={26} rx={10} fill="#0e0e14" /><rect x={180} y={1230} width={140} height={60} rx={6} fill="#f2f2f2" /><circle cx={300} cy={1260} r={5} fill="#5af0ff" />
    <Plant x={1010} y={1320} s={1.1} t={t} />
    <g transform="translate(110,1400)"><circle r={46} fill="#f4f4f4" /><circle r={14} fill="#1d2233" /><circle cx={30} cy={-24} r={9} fill="#1d2233" /><circle cx={-28} cy={-26} r={9} fill="#1d2233" /><circle cx={-30} cy={26} r={9} fill="#1d2233" /><circle cx={30} cy={26} r={9} fill="#1d2233" /></g>
    {/* Вини со спины: макушка с твистами, плечи худи, спинка дивана, попкорн */}
    <g opacity={k}>
      <rect x={-200} y={1680} width={1500} height={500} rx={60} fill="#3a2a40" /><rect x={-200} y={1680} width={1500} height={40} rx={20} fill="#4a3650" />
      <path d={`M230,2200 Q240,1690 540,1660 Q840,1690 850,2200 Z`} fill="#3a3f58" />
      <path d={`M400,1700 Q540,1640 680,1700 L660,1760 Q540,1720 420,1760 Z`} fill="#4a5070" />
      <ellipse cx={540} cy={1520} rx={120} ry={130} fill="#151011" />
      {Array.from({ length: 14 }, (_, i) => { const a = -Math.PI + i * Math.PI / 13; return <circle key={i} cx={540 + Math.cos(a) * 112} cy={1500 + Math.sin(a) * 118} r={18} fill="#151011" />; })}
      <ellipse cx={418} cy={1540} rx={16} ry={26} fill="#53321f" /><ellipse cx={662} cy={1540} rx={16} ry={26} fill="#53321f" />
      <g transform="translate(860,1760)"><path d="M-70,-90 L70,-90 L54,90 L-54,90 Z" fill="#e5383b" />{[-40, 0, 40].map(x => <rect key={x} x={x - 10} y={-90} width={20} height={180} fill="#fff" opacity={.9} />)}
        {Array.from({ length: 9 }, (_, i) => <circle key={i} cx={-60 + i * 15} cy={-96 - (i % 3) * 12} r={16} fill="#fff4d0" />)}</g>
    </g>
  </g>); };

// ───── Вини на диване спереди: стена с формой в рамке, кубки, окно на ночной город, торшер ─────
export const ShotCouch: React.FC<{ t: number; crush?: number }> = ({ t, crush = 1.0 }) => {
  const fl = .5 + .5 * noise('cf', t, 3), c = spr(t, crush, { damping: 8, stiffness: 220 });
  const pop = t > crush ? clamp((t - crush) / .9) : 0;
  return (<g>
    <defs><linearGradient id="cWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1c1828" /><stop offset="1" stopColor="#2c2438" /></linearGradient></defs>
    <rect width={1080} height={1920} fill="url(#cWall)" />
    <rect y={1560} width={1080} height={360} fill="#2a1e18" /><ellipse cx={540} cy={1720} rx={560} ry={120} fill="#4a3a5a" opacity={.6} />
    {/* окно: ночной город */}
    <rect x={720} y={300} width={300} height={520} rx={8} fill="#0e0c16" /><rect x={734} y={314} width={272} height={492} fill="#1a2a5a" />
    {Array.from({ length: 7 }, (_, i) => <rect key={i} x={734 + i * 40} y={600 - hash(i) * 220} width={34} height={220 + hash(i) * 220} fill="#141c3a" />)}
    {Array.from({ length: 30 }, (_, i) => <rect key={'w' + i} x={740 + hash(i * 3) * 260} y={420 + hash(i * 5) * 360} width={6} height={8} fill="#ffd27a" opacity={.7} />)}
    <path d="M870,314 L870,806 M734,560 L1006,560" stroke="#0e0c16" strokeWidth={10} />
    <FramedKit x={400} y={480} s={.9} />
    {/* полка с кубками */}
    <rect x={40} y={880} width={260} height={14} fill="#4a3424" /><Trophy x={90} y={880} s={.8} /><Trophy x={170} y={880} s={1} /><Trophy x={250} y={880} s={.7} />
    {/* торшер */}
    <path d="M110,1560 L110,1060" stroke="#2a2430" strokeWidth={10} /><path d="M50,1060 L170,1060 L140,970 L80,970 Z" fill="#f4d8a0" /><Glow x={110} y={1040} r={300} c="#ffc070" o={.55} id="lamp" />
    <Plant x={980} y={1560} s={1.1} t={t} />
    <Glow x={540} y={700} r={900} c="#6a7aff" o={.35 + .2 * fl} id="couchTv" />
    <rect x={60} y={1080} width={960} height={260} rx={70} fill="#4a3650" /><rect x={30} y={1260} width={1020} height={420} rx={60} fill="#3a2a40" />
    <rect x={90} y={1140} width={180} height={150} rx={30} fill="#e8c050" opacity={.85} /><rect x={810} y={1140} width={180} height={150} rx={30} fill="#5af0ff" opacity={.6} />
    <Baller who="vini" outfit="home" sit x={540} y={1560} s={1.1} t={t} expr={t < crush ? 'shock' : 'determined'} mouth={t < crush ? .3 : 0}
      pose={{ armL: [-.15, .5 + c * .3], armR: [.15, -.5 - c * .3], legL: [-.15, 0], legR: [.15, 0] }} eye={[0, -.2]} />
    <g transform={`translate(540,${1330}) scale(${1 + c * .12},${1 - c * .22})`}>
      <path d="M-80,-100 L80,-100 L62,90 L-62,90 Z" fill="#e5383b" />{[-48, 0, 48].map(x => <rect key={x} x={x - 12} y={-100} width={24} height={190} fill="#fff" opacity={.9} />)}
      {Array.from({ length: 10 }, (_, i) => <circle key={i} cx={-70 + i * 15} cy={-106 - (i % 3) * 12} r={17} fill="#fff4d0" />)}</g>
    {pop > 0 && Array.from({ length: 14 }, (_, i) => { const a = -Math.PI / 2 + (hash(i) - .5) * 2.4, v = 500 + hash(i * 2) * 400, x = 540 + Math.cos(a) * v * pop, y = 1220 + Math.sin(a) * v * pop + 900 * pop * pop;
      return <circle key={i} cx={x} cy={y} r={16} fill="#fff4d0" opacity={1 - pop * .6} />; })}
    <rect width={1080} height={1920} fill="#5a6aff" opacity={.06 + .05 * fl} />
  </g>); };
