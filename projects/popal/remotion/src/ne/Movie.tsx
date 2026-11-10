// «Didn't Want To Anyway», сцена 1: фильм по телевизору и Вини на диване.
// В фильме — Том Холланд как актёр, в обычной одежде (бомбер, футболка, джинсы); костюм и атрибуты Человека-паука не рисуем.
// Сэди в фильме — образ с фото пользователя: прямая чёлка, оливковая кожанка; на стадионе — прежний образ (платье).
import React from 'react';
import { clamp, lerp, noise, spr } from '../anim';
import { Glow, Motes } from '../bg/Bg';
import { blendPose, Pose, POSES } from '../chars/Person';
import { Baller, Sadie, smooth } from '../stars/Stars';

type P2 = [number, number];
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const full = (p: Partial<Pose>): Pose => ({ ...POSES.stand, ...p } as Pose);

// ───── фильм: ночная крыша над городом ─────
const Rooftop: React.FC<{ t: number }> = ({ t }) => (<g>
  <defs><linearGradient id="mvSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0a0a24" /><stop offset=".6" stopColor="#2a1f5a" /><stop offset="1" stopColor="#7a3a6a" /></linearGradient></defs>
  <rect width={1080} height={1920} fill="url(#mvSky)" />
  <circle cx={820} cy={330} r={110} fill="#fff4dc" /><Glow x={820} y={330} r={380} c="#ffe8c0" o={.6} id="mvMoon" />
  {Array.from({ length: 16 }, (_, i) => { const w = 90 + hash(i) * 90, h = 380 + hash(i * 3) * 700, x = i * 72 - 40;
    return <g key={i}><rect x={x} y={1500 - h} width={w} height={h} fill={i % 2 ? '#1a1838' : '#221e46'} />
      {Array.from({ length: 30 }, (_, k) => hash(i * 50 + k) > .55 ? <rect key={k} x={x + 12 + (k % 3) * (w / 3.3)} y={1500 - h + 24 + Math.floor(k / 3) * 46} width={14} height={20} fill="#ffd27a" opacity={.55 + .4 * hash(k + i)} /> : null)}</g>; })}
  {/* крыша: парапет, бак, антенна */}
  <rect y={1460} width={1080} height={460} fill="#14121e" /><rect y={1440} width={1080} height={30} fill="#2a2638" />
  <g transform="translate(120,1440)"><rect x={-20} y={-300} width={12} height={300} fill="#1a1826" /><rect x={30} y={-300} width={12} height={300} fill="#1a1826" />
    <path d="M-50,-300 Q20,-360 90,-300 L90,-480 Q20,-520 -50,-480 Z" fill="#221e30" /><path d="M-50,-480 Q20,-420 90,-480" stroke="#3a3450" strokeWidth={6} fill="none" /></g>
  <path d="M980,1440 L980,1180 M940,1220 L1020,1220 M955,1260 L1005,1260" stroke="#2a2638" strokeWidth={8} /><circle cx={980} cy={1172} r={9} fill="#ff4a4a" opacity={.5 + .5 * Math.sin(t * 5)} />
  <Motes n={26} t={t} c="#c8b8ff" seed={41} vy={-60} size={6} />
</g>);
// ветер — штрихи
const Wind: React.FC<{ t: number; o?: number }> = ({ t, o = 1 }) => <g opacity={o}>{Array.from({ length: 14 }, (_, i) => { const y = 200 + hash(i) * 1500, x = ((hash(i * 3) * 1400 + t * 1600) % 1600) - 300;
  return <path key={i} d={`M${x},${y} l160,-18`} stroke="#fff" strokeWidth={3} opacity={.18} strokeLinecap="round" />; })}</g>;

// фильм на экране (кадр 1080×1920, время фильма tm): Том Холланд (актёр, в обычной одежде) подходит к Сэди и обнимает её
const SADIE_X = 650, TOM_X0 = -180, TOM_X1 = 420, STOP = 1.3;
const MovieScene: React.FC<{ tm: number }> = ({ tm }) => {
  const k = smooth(0, STOP, tm), tx = lerp(TOM_X0, TOM_X1, k), ph = (tx - TOM_X0) / 62, walking = tm < STOP;
  const hug = spr(tm, 1.7, { damping: 12, stiffness: 120 });
  const tPose: Partial<Pose> = walking ? { legL: [Math.sin(ph) * .45, Math.max(0, -Math.cos(ph)) * .5], legR: [-Math.sin(ph) * .45, -Math.max(0, Math.cos(ph)) * .5], armL: [-Math.sin(ph) * .35, .3], armR: [Math.sin(ph) * .35, -.3] }
    : blendPose(full({ armL: [-.15, .15], armR: [.3, -.3] }), full({ armL: [-.15, .15], armR: [1.35, .35] }), hug) as Pose;
  const sPose: Partial<Pose> = tm < 1.6 ? { armL: [-.2, .15], armR: [.4, -1.6], legR: [.12, -.1] } : { armL: [-.9, -1.2], armR: [.3, -.3], legR: [.16, -.14], lean: -.04 };
  return (<g>
    <Rooftop t={tm} />
    <Sadie x={SADIE_X} y={1480} s={.95} t={tm + 3} hair="fringe" outfit="jacket" pose={sPose} expr={tm < 1.6 ? 'neutral' : 'happy'} blush={tm > 1.6 ? .8 : .2} eye={[-.8, 0]} headTilt={tm > 1.6 ? -10 : 0} />
    <Baller who="tom" outfit="bomber" x={tx} y={1480 - (walking ? Math.abs(Math.sin(ph)) * 8 : 0)} s={.98} t={tm} pose={tPose} expr={tm > 1.6 ? 'happy' : 'cool'} eye={[.8, 0]} headTilt={tm > 1.6 ? 8 : 0} />
    {tm > 1.9 && [0, 1, 2].map(i => { const u = tm - 1.9 - i * .25; if (u < 0) return null; const y = 740 - u * 220, x = SADIE_X - 120 + i * 50 + Math.sin(u * 5 + i) * 20;
      return <path key={i} d={`M${x},${y} c-14,-20 -42,-6 0,24 c42,-30 14,-44 0,-24z`} fill="#ff6a8a" opacity={clamp(1 - u / 1.2)} />; })}
    <Wind t={tm} o={.5} />
  </g>); };

// ───── гостиная: экран телевизора, Вини со спины ─────
const TV = { x: 140, y: 520, w: 800, h: 1100 };  // экран (вертикальный кадр фильма)
export const ShotTv: React.FC<{ t: number; pull?: [number, number] }> = ({ t, pull = [2.4, 3.6] }) => {
  const k = smooth(pull[0], pull[1], t), sc = lerp(1080 / TV.w * 1.02, 1, k), cx = TV.x + TV.w / 2, cy = TV.y + TV.h / 2;
  const fl = .5 + .5 * noise('tvf', t, 3);
  return (<g transform={`translate(540,960) scale(${sc}) translate(${-cx},${-cy})`}>
    {/* комната */}
    <rect x={-400} y={-400} width={1900} height={2800} fill="#14121c" />
    <rect x={-400} y={1700} width={1900} height={700} fill="#1c1820" />
    <Glow x={cx} y={cy} r={900} c="#7a6aff" o={.35 + .15 * fl} id="tvGlowR" />
    <rect x={TV.x - 30} y={TV.y - 30} width={TV.w + 60} height={TV.h + 60} rx={24} fill="#050508" />
    <svg x={TV.x} y={TV.y} width={TV.w} height={TV.h} viewBox={`${(1080 - TV.w * 1080 / TV.w) / 2} 0 1080 ${1080 * TV.h / TV.w}`} preserveAspectRatio="xMidYMid slice">
      <g transform={`translate(0,${(1080 * TV.h / TV.w - 1920) / 2})`}><MovieScene tm={t} /></g>
    </svg>
    <rect x={TV.x} y={TV.y} width={TV.w} height={TV.h} fill="url(#tvGlare)" opacity={k * .5} />
    <defs><linearGradient id="tvGlare" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".18" /><stop offset=".4" stopColor="#fff" stopOpacity="0" /></linearGradient></defs>
    <rect x={cx - 120} y={TV.y + TV.h + 30} width={240} height={30} rx={8} fill="#0a0a10" />
    {/* Вини со спины: макушка с твистами, плечи худи, спинка дивана, ведро попкорна */}
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

// ───── Вини на диване спереди: свет от экрана, попкорн ─────
export const ShotCouch: React.FC<{ t: number; crush?: number }> = ({ t, crush = 1.0 }) => {
  const fl = .5 + .5 * noise('cf', t, 3), c = spr(t, crush, { damping: 8, stiffness: 220 });
  const pop = t > crush ? clamp((t - crush) / .9) : 0;
  return (<g>
    <rect width={1080} height={1920} fill="#17141f" />
    <rect x={120} y={260} width={240} height={340} rx={10} fill="#221d2c" /><rect x={140} y={280} width={200} height={300} fill="#2e3a5a" opacity={.7} />
    <Glow x={540} y={700} r={900} c="#6a7aff" o={.4 + .2 * fl} id="couchTv" />
    <rect x={60} y={1080} width={960} height={260} rx={70} fill="#4a3650" /><rect x={30} y={1260} width={1020} height={420} rx={60} fill="#3a2a40" />
    <Baller who="vini" outfit="home" sit x={540} y={1560} s={1.1} t={t} expr={t < crush ? 'shock' : 'determined'} mouth={t < crush ? .3 : 0}
      pose={{ armL: [-.15, .5 + c * .3], armR: [.15, -.5 - c * .3], legL: [-.15, 0], legR: [.15, 0] }} eye={[0, -.2]} />
    {/* ведро попкорна в руках, сминается */}
    <g transform={`translate(540,${1330}) scale(${1 + c * .12},${1 - c * .22})`}>
      <path d="M-80,-100 L80,-100 L62,90 L-62,90 Z" fill="#e5383b" />{[-48, 0, 48].map(x => <rect key={x} x={x - 12} y={-100} width={24} height={190} fill="#fff" opacity={.9} />)}
      {Array.from({ length: 10 }, (_, i) => <circle key={i} cx={-70 + i * 15} cy={-106 - (i % 3) * 12} r={17} fill="#fff4d0" />)}</g>
    {pop > 0 && Array.from({ length: 14 }, (_, i) => { const a = -Math.PI / 2 + (hash(i) - .5) * 2.4, v = 500 + hash(i * 2) * 400, x = 540 + Math.cos(a) * v * pop, y = 1220 + Math.sin(a) * v * pop + 900 * pop * pop;
      return <circle key={i} cx={x} cy={y} r={16} fill="#fff4d0" opacity={1 - pop * .6} />; })}
    <rect width={1080} height={1920} fill="#5a6aff" opacity={.06 + .05 * fl} />
  </g>); };
