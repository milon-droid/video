// Планы серии 1. Каждый план получает t — секунды от начала плана, T — от начала серии.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import MOUTH from '../data/mouth.json';
import { VO, SHOT } from './timeline.mjs';
import { clamp, lerp, out, io, spr, win, shake, shakeMany, noise, handheld } from '../anim';
import { C, FONT } from '../theme';
import { Person, POSES, blendPose, runPose, Pan, Burger, Face } from '../chars/Person';
import { Lumina, King, Succubus, Goose, Slime } from '../chars/Cast';
import { Street, Void, Hall, Counter, Desk, SkyFall, Eldoria, Pond, Throne, Crossroads, Glow, Motes } from '../bg/Bg';
import { Frame, Cam, SysWindow, InfoStand, Tag, Onomato, Stamp, Flash, Choice, EndCard } from '../ui/Ui';

type P = { t: number; T: number };
const M = MOUTH as Record<string, number[]>;
// рот говорящего по голосу (огибающая tools/mouth.py)
export const mouth = (who: string, T: number) => { const v = (VO as any[]).find(q => q.who === who && T >= q.t && T < q.t + q.d); if (!v) return 0; const arr = M[v.id]; const i = Math.floor((T - v.t) * 30); return arr ? clamp((arr[i] ?? 0) * 1.1) : 0; };
const dur = (id: string) => SHOT[id].b - SHOT[id].a;
const html = (s: React.CSSProperties): React.CSSProperties => ({ position: 'absolute', fontFamily: FONT, ...s });
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
// мягкие брызги / пыль: клубы с радиальным градиентом
const Puffs: React.FC<{ t: number; t0: number; x: number; y: number; n?: number; col?: string; spread?: number; up?: number; size?: number; id: string }> = ({ t, t0, x, y, n = 8, col = '#ffffff', spread = 260, up = 160, size = 60, id }) => {
  const k = (t - t0) / 1.0; if (k < 0 || k > 1) return null;
  return (<g><defs><radialGradient id={id}><stop offset="0" stopColor={col} stopOpacity=".85" /><stop offset="1" stopColor={col} stopOpacity="0" /></radialGradient></defs>
    {Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI - Math.PI + (hash(i) - .5) * .4, r = out(k) * spread * (.6 + hash(i * 3) * .6);
      return <circle key={i} cx={x + Math.cos(a) * r} cy={y + Math.sin(a) * r * .6 - out(k) * up * hash(i * 5) + k * k * 120} r={size * (.5 + hash(i * 7)) * (1 + k)} fill={`url(#${id})`} opacity={1 - k} />; })}</g>); };
const Drops: React.FC<{ t: number; t0: number; x: number; y: number; n?: number }> = ({ t, t0, x, y, n = 16 }) => { const k = t - t0; if (k < 0 || k > 1.2) return null;
  return <g>{Array.from({ length: n }, (_, i) => { const vx = (hash(i) - .5) * 900, vy = -600 - hash(i * 3) * 700, px = x + vx * k, py = y + vy * k + 1400 * k * k; return <ellipse key={i} cx={px} cy={py} rx={10} ry={16} fill="#bff3ff" opacity={clamp(1.2 - k)} />; })}</g>; };
const Speed: React.FC<{ t: number; col?: string; n?: number; o?: number }> = ({ t, col = '#ffffff', n = 18, o = .5 }) => <g>{Array.from({ length: n }, (_, i) => { const a = i / n * 6.283 + hash(i) * .3, r0 = 420 + hash(i * 3) * 200 + ((t * 900 + i * 90) % 300);
  return <path key={i} d={`M${540 + Math.cos(a) * r0},${960 + Math.sin(a) * r0} L${540 + Math.cos(a) * (r0 + 500)},${960 + Math.sin(a) * (r0 + 500)}`} stroke={col} strokeWidth={6 + hash(i) * 10} opacity={o} />; })}</g>;
// пламя ауры за героем
const AuraFlame: React.FC<{ t: number; x: number; y: number; k: number; col?: string }> = ({ t, x, y, k, col = '#ffc94d' }) => k <= 0 ? null : (<g opacity={k}>
  <Glow x={x} y={y - 350} r={520 * k} c={col} o={.8} id="auraG" />
  {Array.from({ length: 9 }, (_, i) => { const ph = t * 3 + i * .7, h = (380 + Math.sin(ph * 2) * 60) * k, w = 90 + (i % 3) * 30, ox = (i - 4) * 55;
    return <path key={i} d={`M${x + ox - w / 2},${y - 100} Q${x + ox + Math.sin(ph) * 40},${y - 100 - h} ${x + ox + w / 2},${y - 100} Z`} fill={i % 2 ? '#ffe27a' : '#ffb020'} opacity={.55} />; })}
  <Motes n={20} t={t} c="#fff1a0" seed={31} area={[x - 300, y - 800, 600, 800]} vy={-180} size={8} /></g>);

// ───────────────────────── 1. ХУК ─────────────────────────
export const Hook: React.FC<P> = ({ t, T }) => { const z = lerp(1, 1.07, io(win(t, 0, 2.4))), hl = win(t, .1, 2.4) ** 2.2, turn = t > 1.25;
  return (<><Frame bg="#0b1430"><Cam z={z} fy={1300}><Street t={T} />
    <Glow x={lerp(820, 700, hl)} y={lerp(1080, 1150, hl)} r={lerp(90, 1100, hl)} c="#fff6d0" o={lerp(.7, 1, hl)} id="head" />
    <circle cx={lerp(820, 700, hl)} cy={lerp(1080, 1150, hl)} r={lerp(16, 260, hl)} fill="#ffffff" />
    <Person x={540} y={1760} s={1.25} t={T} hold="phone" pose={turn ? blendPose(POSES.phone, POSES.shrug, out(win(t, 1.25, 1.45))) : POSES.phone} expr={turn ? 'shock' : 'neutral'} eye={turn ? [.8, -.1] : [-.2, .6]} headTilt={turn ? 6 : -4} />
  </Cam>
    <rect width={1080} height={1920} fill="#fffbe8" opacity={clamp((t - 2.05) / .35)} />
  </Frame>
    <div style={html({ left: 300, top: 640, transform: `scale(${spr(t, .15, { damping: 10 })})`, opacity: clamp(1.6 - hl * 2), background: '#fff', borderRadius: 26, padding: '12px 26px', fontSize: 38, fontWeight: 900, color: '#14121c', boxShadow: '0 10px 30px rgba(0,0,0,.4)' })}>🛵 КУРЬЕР РЯДОМ</div></>); };

// ───────────────────────── 2. СТОП-КАДР В ВОЗДУХЕ ─────────────────────────
const FreezeArt: React.FC<{ t: number; T: number; grey?: number }> = ({ t, T, grey = 0 }) => { const d = t * 18;
  return (<Frame bg="#fff" style={{ filter: `saturate(${1 - grey * .8}) brightness(${1 - grey * .25})` }}><Cam z={1.08} rot={-4 + t * 1.5}><Street t={T - t} />
    <rect width={1080} height={1920} fill="#fff6d0" opacity={.35} />
    <Speed t={t} col="#fff" o={.6} />
    <Person x={560 + d} y={1140} s={1.15} t={T} rot={-78 + t * 3} pose={POSES.fall} expr="shock" mouth={.5} noBlink shadow={false} />
    <g transform={`translate(${260 - d * 1.5},${660 - d}) rotate(${t * 40})`}><Burger /></g>
    <g transform={`translate(${880 + d},${640 - d * .6}) rotate(${-30 + t * 60})`}><rect x={-34} y={-62} width={68} height={124} rx={12} fill="#111" /><rect x={-28} y={-54} width={56} height={108} rx={8} fill="#4ad0ff" /></g>
    <g transform={`translate(${800 + d * .5},${1500 + d * .3}) rotate(${20 + t * 10})`}><rect x={-110} y={-90} width={220} height={180} rx={18} fill="#5a2fd4" /><path d="M0,-30 L8,-10 L30,-10 L12,4 L20,26 L0,12 L-20,26 L-12,4 L-30,-10 L-8,-10 Z" fill="#ffd23f" /></g>
    {[0, 1, 2, 3, 4].map(i => <path key={i} transform={`translate(${200 + i * 160 - d},${400 + hash(i) * 300 - d * .5}) rotate(${t * 90 + i * 40})`} d="M-14,-8 L14,-8 L8,10 L-10,8 Z" fill="#a8e06a" />)}
  </Cam></Frame>); };
export const Freeze: React.FC<P> = ({ t, T }) => (<><FreezeArt t={t} T={T} /><Onomato t={t} t0={.05} x={540} y={560} text="БДЫЩ!" col={C.yellow} size={190} rot={-10} dur={1.4} /><Flash t={t} t0={0} dur={.3} /></>);
export const Title: React.FC<P> = ({ t, T }) => { const s = shake(t, .05, 16, .35);
  return (<div style={{ position: 'absolute', inset: 0, transform: `translate(${s[0]}px,${s[1]}px)` }}><FreezeArt t={dur('freeze')} T={T - t} grey={1} /><AbsoluteFill style={{ background: 'rgba(20,10,40,.35)' }} />
    <Stamp t={t} t0={0} text="ПОПАЛ" sub="СЕРИЯ 1" col={C.yellow} y={760} size={250} /></div>); };

// ───────────────────────── 3. КУРЬЕР НАД МАКСОМ ─────────────────────────
export const Courier: React.FC<P> = ({ t, T }) => { const m = mouth('courier', T), z = lerp(1, 1.06, io(win(t, 0, 3)));
  return (<Frame bg="#0b1430"><Cam z={z}><g transform="rotate(180 540 960)"><Street t={T} /></g><rect width={1080} height={1920} fill="#0b1430" opacity={.35} />
    <Glow x={540} y={500} r={600} c="#ffd27a" o={.35} id="cg1" />
    <Person x={520} y={2330} s={2.0} t={T} look="courier" hold="burger" pose={{ armR: [2.2, .5], armL: [-.4, .3], lean: .08 }} headTilt={12} />
    {/* огоньки голоса на шлеме */}
    {[0, 1, 2, 3, 4].map(i => <rect key={i} x={430 + i * 36} y={770 - m * 40 * (1 - Math.abs(i - 2) / 3)} width={22} height={10 + m * 80 * (1 - Math.abs(i - 2) / 3)} rx={6} fill="#9ee8ff" opacity={.9} transform="rotate(12 520 770)" />)}
  </Cam></Frame>); };

// ───────────────────────── 4. ВИЗОР: «ИЗБРАННЫЙ ДОСТАВЛЕН» → портал ─────────────────────────
export const Visor: React.FC<P> = ({ t, T }) => { const m = mouth('courier', T), wide = t > 2.55, k = out(win(t, 2.55, 3.0));
  if (!wide) return (<Frame bg="#100828"><Cam z={lerp(1, 1.12, io(win(t, 0, 2.55)))}>
    <rect width={1080} height={1920} fill="#1a0f3a" />
    <path d="M-100,500 C-100,150 300,0 540,0 C780,0 1180,150 1180,500 L1180,1700 L-100,1700 Z" fill="#5a2fd4" />
    <path d="M40,620 Q540,420 1040,620 L1000,1260 Q540,1420 80,1260 Z" fill="#06041a" />
    <clipPath id="visorC"><path d="M40,620 Q540,420 1040,620 L1000,1260 Q540,1420 80,1260 Z" /></clipPath>
    <g clipPath="url(#visorC)"><Glow x={420 + noise('neb', t, .3) * 40} y={900} r={420} c="#8a4dff" o={.7} id="neb1" /><Glow x={720} y={1080} r={300} c="#ff5ad9" o={.5} id="neb2" />
      {Array.from({ length: 70 }, (_, i) => <circle key={i} cx={60 + hash(i) * 960 + t * 30 * hash(i * 2)} cy={520 + hash(i * 3) * 820} r={1.5 + hash(i * 5) * 4} fill="#fff" opacity={.4 + .6 * Math.abs(Math.sin(t * 3 + i))} />)}
      {/* глаза существа за стеклом */}
      {[-1, 1].map(sd => <g key={sd}><ellipse cx={540 + sd * 170} cy={930} rx={70} ry={26 + m * 10} fill="#9ee8ff" opacity={.85 * clamp((t - .3) / .4)} /><ellipse cx={540 + sd * 170} cy={930} rx={120} ry={60} fill="#9ee8ff" opacity={.18} /></g>)}
      <path d="M140,640 Q400,560 700,600" stroke="#fff" strokeWidth={22} opacity={.18} fill="none" /></g>
    <path d="M40,620 Q540,420 1040,620" stroke="#7a55ff" strokeWidth={26} fill="none" />
    {/* браслет-дисплей */}
    <g transform={`translate(${lerp(1200, 560, out(win(t, .9, 1.3)))},1640) rotate(-6)`}><rect x={-330} y={-90} width={660} height={180} rx={30} fill="#26203d" /><rect x={-300} y={-66} width={600} height={132} rx={18} fill="#0a1a2a" />
      <text x={0} y={-12} fontSize={40} fontWeight={900} textAnchor="middle" fill="#9ee8ff" fontFamily="Mont">ИЗБРАННЫЙ №4096</text>
      <text x={0} y={42} fontSize={40} fontWeight={900} textAnchor="middle" fill={t > 2.0 ? '#2ecc71' : '#ffd23f'} fontFamily="Mont">{t > 2.0 ? '✓ ДОСТАВЛЕН' : 'ДОСТАВКА…'}</text></g>
  </Cam></Frame>);
  // общий план: курьер уезжает в портал на самокате
  const rideK = out(win(t, 3.1, 4.1)), sc = lerp(1, .15, rideK);
  return (<Frame bg="#0b1430"><Street t={T} />
    <g transform="translate(560,1250)"><Glow x={0} y={0} r={460 * k} c="#8a4dff" o={.9} id="portG" />
      {Array.from({ length: 6 }, (_, i) => <ellipse key={i} cx={0} cy={0} rx={(300 - i * 40) * k} ry={(420 - i * 56) * k} fill="none" stroke={i % 2 ? '#ff5ad9' : '#9ee8ff'} strokeWidth={10} transform={`rotate(${t * 120 * (i % 2 ? -1 : 1)})`} opacity={.85} />)}
      <ellipse cx={0} cy={0} rx={150 * k} ry={210 * k} fill="#10052a" /></g>
    <g transform={`translate(${lerp(820, 560, rideK)},${lerp(1700, 1330, rideK)}) scale(${sc})`}>
      <g><rect x={-170} y={-20} width={340} height={22} rx={10} fill="#222" /><circle cx={-150} cy={20} r={36} fill="#111" /><circle cx={150} cy={20} r={36} fill="#111" /><rect x={130} y={-300} width={18} height={290} fill="#333" /><rect x={100} y={-310} width={90} height={16} rx={8} fill="#333" /></g>
      <Person x={0} y={-10} s={.75} t={T} look="courier" pose={{ armR: [2.3, -.6], armL: [2.0, .2], legL: [-.3, .3], legR: [.1, -.1] }} shadow={false} />
      <g transform="translate(-40,-400)"><rect x={-90} y={-80} width={180} height={150} rx={16} fill="#5a2fd4" /><path d="M0,-30 L8,-10 L30,-10 L12,4 L20,26 L0,12 L-20,26 L-12,4 L-30,-10 L-8,-10 Z" fill="#ffd23f" /></g>
    </g><Flash t={t} t0={4.05} dur={.3} col="#c9a8ff" /></Frame>); };

// ───────────────────────── 5. POV: Макс на асфальте ─────────────────────────
export const Pov: React.FC<P> = ({ t, T }) => { const lid = out(win(t, .2, 1.15)) * .55;
  return (<><Frame bg="#0b1430" style={{ filter: `blur(${4 + t * 6}px)` }}><g transform="rotate(180 540 960) translate(0,-400)"><Street t={T} /></g><Glow x={540} y={900} r={500} c="#c9a8ff" o={.6} id="povG" /></Frame>
    <AbsoluteFill style={{ background: `linear-gradient(180deg, #000 ${lid * 48}%, rgba(0,0,0,0) ${lid * 48 + 12}%, rgba(0,0,0,0) ${100 - lid * 48 - 12}%, #000 ${100 - lid * 48}%)` }} /><Flash t={t} t0={.95} dur={.3} /></>); };

// ───────────────────────── 6. БЕЛАЯ ПУСТОТА ─────────────────────────
export const VoidShot: React.FC<P> = ({ t, T }) => { const halo = !(t > 1.4 && t < 1.55) && !(t > 2.6 && t < 2.7) && !(t > 1.75 && t < 1.82);
  return (<Frame bg="#fff"><Cam z={lerp(1.02, 1.12, io(win(t, 0, 4)))}><Void t={T} />
    <g transform={`translate(0,${Math.sin(t * 2) * 14})`}>
      <ellipse cx={540} cy={560} rx={150} ry={34} fill="none" stroke={halo ? '#ffe27a' : '#c9c9c9'} strokeWidth={20} opacity={halo ? 1 : .5} />
      {halo && <ellipse cx={540} cy={560} rx={190} ry={60} fill="#fff2a0" opacity={.35} />}
      <Person x={540} y={1260} s={1.3} t={T} pose={POSES.lotus} expr={t < .7 ? 'ko' : 'deadpan'} shadow={false} />
    </g></Cam></Frame>); };

// ───────────────────────── 7. ЗАЛ ОЧЕРЕДИ, ТАЛОН 666 ─────────────────────────
const Ghost: React.FC<{ x: number; y: number; s: number; t: number; kind: 'ghost' | 'knight' | 'granny' | 'cat' }> = ({ x, y, s, t, kind }) => (<g transform={`translate(${x},${y + Math.sin(t * 2 + x) * 8}) scale(${s})`} opacity={.85}>
  {kind === 'ghost' && <><path d="M-80,0 C-90,-160 -60,-240 0,-240 C60,-240 90,-160 80,0 L50,-20 L20,0 L-10,-20 L-40,0 Z" fill="#ffffff" stroke="#d6dcf0" strokeWidth={4} /><ellipse cx={-26} cy={-170} rx={10} ry={16} fill="#3a3a5a" /><ellipse cx={26} cy={-170} rx={10} ry={16} fill="#3a3a5a" /></>}
  {kind === 'knight' && <><rect x={-70} y={-260} width={140} height={260} rx={30} fill="#aab4c6" /><rect x={-56} y={-380} width={112} height={130} rx={50} fill="#bcc6d8" /><rect x={-40} y={-330} width={80} height={14} fill="#3a4050" /><path d="M0,-380 Q30,-440 60,-420" stroke="#e5383b" strokeWidth={14} fill="none" /></>}
  {kind === 'granny' && <><path d="M-70,0 L-50,-220 Q0,-250 50,-220 L70,0 Z" fill="#8a6aa8" /><circle cx={0} cy={-290} r={60} fill="#f6d2b8" /><path d="M-62,-300 Q0,-380 62,-300 Q40,-330 0,-332 Q-40,-330 -62,-300Z" fill="#e6e6ee" /><rect x={50} y={-110} width={70} height={90} rx={10} fill="#5ab04a" /><rect x={-130} y={-120} width={70} height={100} rx={10} fill="#ffd23f" /></>}
  {kind === 'cat' && <><ellipse cx={0} cy={-50} rx={70} ry={50} fill="#ffffff" stroke="#d6dcf0" strokeWidth={4} /><circle cx={50} cy={-110} r={42} fill="#ffffff" stroke="#d6dcf0" strokeWidth={4} /><path d="M20,-140 L28,-176 L48,-148 M60,-148 L80,-176 L84,-138" fill="#fff" stroke="#d6dcf0" strokeWidth={4} /><ellipse cx={0} cy={-200} rx={40} ry={10} fill="none" stroke="#ffe27a" strokeWidth={8} /></>}
</g>);
export const HallShot: React.FC<P> = ({ t, T }) => { const tk = out(win(t, 1.6, 1.9));
  return (<><Frame bg="#eef7ff"><Cam z={lerp(1.05, 1, out(win(t, 0, 2.9)))} dx={lerp(-30, 30, t / 2.9)}><Hall t={T} />
    <Ghost x={170} y={1500} s={.9} t={T} kind="ghost" /><Ghost x={330} y={1530} s={.95} t={T} kind="knight" /><Ghost x={950} y={1520} s={.9} t={T} kind="granny" /><Ghost x={810} y={1560} s={.9} t={T} kind="cat" />
    <g transform="translate(560,1180)"><rect x={-90} y={0} width={180} height={420} rx={20} fill="#2a3a5a" /><rect x={-70} y={30} width={140} height={110} rx={12} fill="#9fe3ff" /><text x={0} y={100} fontSize={34} fontWeight={900} textAnchor="middle" fill="#1d2a4a" fontFamily="Mont">ТАЛОН</text>
      <rect x={-50} y={180} width={100} height={14} rx={7} fill="#111" /></g>
    <Person x={720} y={1760} s={1.05} t={T} pose={{ armL: [-1.2, -.3], armR: [.12, -.15] }} expr={t > 1.7 ? 'shock' : 'neutral'} eye={[-.6, .1]} />
  </Cam></Frame>
    {t > 1.6 && <div style={html({ left: 300, top: 600, width: 480, height: 300, transform: `rotate(-6deg) scale(${lerp(.3, 1, tk)})`, opacity: tk, background: '#fffdf2', borderRadius: 16, boxShadow: '0 20px 50px rgba(0,0,0,.35)', textAlign: 'center', padding: 24 })}>
      <div style={{ fontSize: 34, fontWeight: 800, color: '#556' }}>ВАШ НОМЕР</div><div style={{ fontSize: 170, fontWeight: 900, color: C.red, lineHeight: 1.05 }}>666</div></div>}</>); };

// ───────────────────────── 8. ТАБЛО ОЧЕРЕДИ ─────────────────────────
export const Board: React.FC<P> = ({ t, T }) => { const bl = Math.floor(t * 6) % 2 === 0;
  return (<Frame bg="#cfe9ff"><Cam z={lerp(1.08, 1, out(win(t, 0, .4)))}><Hall t={T} />
    <rect x={120} y={380} width={840} height={520} rx={30} fill="#111a2e" stroke="#2a3a5a" strokeWidth={16} />
    <text x={540} y={520} fontSize={60} fontWeight={900} textAnchor="middle" fill="#9fe3ff" fontFamily="Mont">ВЫЗЫВАЕТСЯ</text>
    <text x={540} y={720} fontSize={180} fontWeight={900} textAnchor="middle" fill={bl ? '#ff4a4a' : '#ffd23f'} fontFamily="Mont">666 → 3</text>
    <text x={540} y={840} fontSize={50} fontWeight={800} textAnchor="middle" fill="#fff" fontFamily="Mont">ОКНО 3</text>
    <Person x={540} y={2080} s={1.2} t={T} pose={blendPose(POSES.stand, POSES.armsUp, spr(t, .4, { damping: 9 }))} expr="happy" mouth={mouth('max', T)} />
  </Cam></Frame>); };

// ───────────────────────── 9. ИНФО-СТЕНД: ЗАКОН №1 ─────────────────────────
export const Lore1: React.FC<P> = ({ t }) => { const n = Math.round(lerp(1, 4096, out(win(t, 1.2, 2.6))));
  const worlds = [[560, 90, '#ff7ad9', 'ЭЛЬДОРИЯ'], [700, 220, '#37c2d8', 'АКВА-9'], [560, 320, '#e5383b', 'ПЕКЛО'], [760, 60, '#2ecc71', 'ДРИАДА']];
  const art = (<g><circle cx={150} cy={190} r={110} fill="#2f7ae5" /><path d="M90,140 Q140,110 170,150 Q200,200 150,230 Q110,220 90,140Z M190,220 Q230,210 240,250 Q210,280 190,220Z" fill="#4fb36a" />
    <text x={150} y={350} fontSize={30} fontWeight={900} textAnchor="middle" fill="#9fe3ff" fontFamily="Mont">ЗЕМЛЯ</text>
    {worlds.map(([x, y, c, nm], i) => { const k = out(win(t, .6 + i * .25, .9 + i * .25)); return (<g key={i} opacity={k}>
      <path d={`M260,190 Q${(260 + (x as number)) / 2},${(y as number) - 60} ${(x as number) - 50},${y}`} stroke="#ffd23f" strokeWidth={6} strokeDasharray="14 10" fill="none" />
      <circle cx={x as number} cy={y as number} r={44 * k} fill={c as string} /><text x={x as number} y={(y as number) + 76} fontSize={22} fontWeight={900} textAnchor="middle" fill="#fff" fontFamily="Mont">{nm}</text></g>); })}
    <g transform="translate(150,40)"><rect x={-110} y={-30} width={220} height={56} rx={12} fill="#ffd23f" /><text x={0} y={10} fontSize={30} fontWeight={900} textAnchor="middle" fill="#14121c" fontFamily="Mont">{n.toLocaleString('ru-RU')}</text></g></g>);
  return <InfoStand t={t} num="ЗАКОН №1" title="Погибших избранных отправляют спасать другие миры" art={art} col="#37c2d8" top={380}
    lines={[{ t: 1.4, icon: '☠', text: 'Избранных уже 4 096' }, { t: 2.9, icon: '🌍', text: 'Каждому — мир, где нужен герой', col: '#ffd23f' }]} />; };

// ───────────────────────── 10. ОКНО 3: БОГИНЯ ─────────────────────────
const sw = (t: number, list: number[]) => { for (const a of list) if (t >= a && t < a + .45) return (t - a) / .45; return 0; };
export const WindowShot: React.FC<P> = ({ t, T }) => (<><Frame bg="#d7ecff"><Cam z={lerp(1, 1.08, io(win(t, 0, 4.9)))} fy={1100}><Counter t={T} />
  <Lumina x={540} y={1260} s={1.3} t={T} mouth={mouth('lumina', T)} swipe={sw(t, [1.6, 2.1, 2.6])} expr="bored" /><Desk /></Cam></Frame>
  <Tag t={t} t0={.4} x={70} y={1500} w={620} title="БОГИНЯ ЛЮМИНА" sub="ОТДЕЛ ПЕРЕРОЖДЕНИЯ · СМЕНА 12 000 ЛЕТ" col={C.pink} /></>);
export const CatsAsk: React.FC<P> = ({ t, T }) => (<Frame bg="#d7ecff"><Cam z={lerp(1.0, 1.05, t / 2.2)}><Counter t={T} />
  <rect x={0} y={0} width={110} height={1920} fill="#c7dcf0" /><rect x={970} y={0} width={110} height={1920} fill="#c7dcf0" />
  <Person x={540} y={2350} s={2.3} t={T} pose={{ armL: [-.6, 1.4], armR: [.6, -1.4] }} expr="happy" mouth={mouth('max', T)} blush={.8} eye={[0, -.3]} headTilt={-8} /></Cam></Frame>);
export const CatsNo: React.FC<P> = ({ t, T }) => (<><Frame bg="#d7ecff"><Cam z={lerp(1.1, 1.16, t / 2.6)} fy={700}><Counter t={T} />
  <Lumina x={540} y={1450} s={1.9} t={T} mouth={mouth('lumina', T)} expr="deadpan" overGlasses={1} look={[0, .4]} /></Cam></Frame>
  <Onomato t={t} t0={2.0} x={760} y={1560} text="БУМ-ТСС" col="#ffffff" size={90} rot={6} dur={.6} /></>);

// ───────────────────────── 11. СИСТЕМА ПОДКЛЮЧЕНА ─────────────────────────
export const SystemShot: React.FC<P> = ({ t, T }) => { const s = shake(t, .15, 12, .3), stamp = out(win(t, 0, .15));
  return (<><div style={{ position: 'absolute', inset: 0, transform: `translate(${s[0]}px,${s[1]}px)` }}><Frame bg="#d7ecff"><Cam z={lerp(1, 1.06, io(win(t, 0, 3.9)))}><Counter t={T} />
    <Glow x={540} y={900} r={700} c="#37c2d8" o={clamp((t - .35) / .4) * .6} id="sysG" />
    <Person x={540} y={2120} s={1.55} t={T} pose={blendPose(POSES.stand, POSES.shrug, out(win(t, .4, .7)))} expr={t > .4 ? 'shock' : 'neutral'} eye={[0, -.8]} />
    <g transform={`translate(540,${lerp(900, 1560, stamp)}) rotate(-8)`} opacity={t < .9 ? 1 : clamp(1 - (t - .9) / .3)}><rect x={-160} y={-60} width={320} height={120} rx={14} fill="none" stroke={C.red} strokeWidth={12} /><text x={0} y={24} fontSize={64} fontWeight={900} textAnchor="middle" fill={C.red} fontFamily="Mont">ОДОБРЕНО</text></g>
  </Cam></Frame></div><SysWindow t={t} t0={.4} title="ПОДКЛЮЧЕНА" sub="Игрок: МАКС · Класс: ПОПАДАНЕЦ" y={520} /></>); };
export const Monday: React.FC<P> = ({ t, T }) => (<Frame bg="#b9d4ef"><Cam z={lerp(1, 1.04, t / 1.5)}><rect width={1080} height={1920} fill="#b9d4ef" /><Glow x={540} y={800} r={700} c="#ffffff" o={.6} id="monG" />
  <g transform="translate(540,1050) scale(3.4)"><path d="M-100,-20 C-104,-100 -50,-128 0,-128 C50,-128 104,-100 100,-20 C98,40 70,84 24,98 Q0,104 -24,98 C-70,84 -98,40 -100,-20 Z" fill="#f6cfae" />
    <Face t={T} expr="deadpan" lid={.6} L={{ skin: '#f6cfae', skinSh: '#e3a989', hair: '#2f231f', iris: '#7a4a28' } as any} seed={77} sweat={.8} /></g>
  <g transform="translate(540,1050) scale(3.4)"><path d="M-104,10 C-118,-70 -80,-128 -20,-132 C40,-138 104,-108 108,-30 L112,8 C96,-30 86,-44 70,-52 L76,-18 C58,-44 40,-58 18,-62 L22,-30 C4,-52 -16,-58 -34,-56 L-30,-26 C-48,-46 -62,-50 -76,-44 L-80,-6 C-90,-20 -96,-10 -104,10 Z" fill="#2f231f" /></g>
</Cam></Frame>);

// ───────────────────────── 12. ИНФО-СТЕНД: ЗАКОН №2 (СИСТЕМА) ─────────────────────────
export const Lore2: React.FC<P> = ({ t, T }) => { const ins = t > 5.55 && t < 6.75;
  if (ins) return (<Frame bg="#d7ecff"><Cam z={lerp(1.15, 1.2, (t - 5.55) / 1.2)} fy={800}><Counter t={T} /><Lumina x={540} y={1400} s={1.7} t={T} mouth={mouth('lumina', T)} expr="point" /></Cam></Frame>);
  const bar = (x: number, k: number, col: string) => <g><rect x={x} y={0} width={500} height={34} rx={17} fill="rgba(255,255,255,.12)" /><rect x={x} y={0} width={500 * k} height={34} rx={17} fill={col} /></g>;
  const art = (<g>{[['⚔ СИЛА', '#ff8a5a', .2, .35], ['❤ ЗДОРОВЬЕ', '#ff4a6a', 1.05, .3], ['✦ АУРА', '#ffc94d', 2.4, .9]].map(([nm, col, t0, val], i) => { const k = out(win(t, t0 as number, (t0 as number) + .5));
    return (<g key={i} transform={`translate(0,${40 + i * 120})`} opacity={clamp(k * 2)}><text x={0} y={28} fontSize={40} fontWeight={900} fill={col as string} fontFamily="Mont">{nm}</text><g transform="translate(320,0)">{bar(0, k * (val as number), col as string)}</g>
      {i === 2 && <g opacity={out(win(t, 2.6, 3.2))}><text x={320} y={84} fontSize={28} fontWeight={800} fill="#ffe7a0" fontFamily="Mont">+ победы  + эпичные моменты</text></g>}</g>); })}</g>);
  return <InfoStand t={t} num="ЗАКОН №2" title="Система героя" art={art} col="#ffc94d" top={380}
    lines={[{ t: .3, icon: '⬆', text: 'Сила и здоровье — растут с опытом' }, { t: 2.5, icon: '✦', text: 'Аура — только за победы и эпик', col: '#ffc94d', big: true }, { t: 6.75, icon: '✖', text: 'Опозорился — МИНУС АУРА', col: '#ff5a5a', big: true }]} />; };

// ───────────────────────── 13. АВТОМАТ «ДАР» ─────────────────────────
const SlotBody: React.FC<{ t: number; lever: number; lights: number }> = ({ t, lever, lights }) => (<g>
  <rect x={-300} y={-420} width={600} height={840} rx={50} fill="#c21d4a" /><rect x={-300} y={-420} width={600} height={840} rx={50} fill="none" stroke="#ffd23f" strokeWidth={14} />
  <rect x={-220} y={-520} width={440} height={130} rx={30} fill="#ffd23f" /><text x={0} y={-430} fontSize={84} fontWeight={900} textAnchor="middle" fill="#7a0f2a" fontFamily="Mont">ДАР</text>
  {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={-270 + i * 49} cy={-372} r={11} fill={(Math.floor(t * 10) + i) % 2 && lights ? '#fff6a0' : '#7a0f2a'} />)}
  <rect x={-240} y={-260} width={480} height={300} rx={20} fill="#1a1024" />
  <g transform={`translate(330,-120)`}><rect x={-14} y={0} width={28} height={220} rx={14} fill="#888" transform={`rotate(${lever * 60} 0 200)`} /><circle cx={Math.sin(lever * 1.05) * 200} cy={200 - Math.cos(lever * 1.05) * 200} r={40} fill="#e5383b" /></g>
</g>);
const REEL = ['⚔', '🔮', '🩸', '🍳'];
export const Lever: React.FC<P> = ({ t, T }) => { const lv = out(win(t, .85, 1.05)) - out(win(t, 1.25, 1.6));
  return (<Frame bg="#3a2a5a"><Cam z={lerp(1, 1.05, t / 1.75)}><rect width={1080} height={1920} fill="#2a1f45" /><Glow x={400} y={900} r={700} c="#ff5aa8" o={.4} id="slg1" />
    <g transform="translate(400,950)"><SlotBody t={T} lever={lv} lights={1} /></g>
    <Person x={860} y={1900} s={1.2} t={T} pose={{ armL: [-2.4 + lv * 1.0, .3], armR: [.12, -.15] }} expr={t > .9 ? 'determined' : 'neutral'} eye={[-.7, -.3]} flip />
  </Cam></Frame>); };
export const Reels: React.FC<P> = ({ t, T }) => { const stopAt = [1.0, 1.1, 1.2], card = spr(t, 1.6, { damping: 12 });
  return (<><Frame bg="#2a1f45"><Cam z={lerp(1.25, 1.15, out(win(t, 0, 1.2)))} fy={900}><rect width={1080} height={1920} fill="#2a1f45" />
    <g transform="translate(540,960) scale(1.5)"><SlotBody t={T} lever={0} lights={t > 1.2 ? 1 : 0} />
      {[-150, 0, 150].map((x, i) => { const spinning = t < stopAt[i], off = spinning ? (t * 900 + i * 60) % 120 : 0;
        return (<g key={i}><clipPath id={`reel${i}`}><rect x={x - 70} y={-250} width={140} height={280} /></clipPath><rect x={x - 70} y={-250} width={140} height={280} fill="#fffdf2" />
          <g clipPath={`url(#reel${i})`}>{spinning ? [0, 1, 2, 3].map(j => <text key={j} x={x} y={-200 + j * 120 - off + 120} fontSize={90} textAnchor="middle">{REEL[(j + i + Math.floor(t * 8)) % 4]}</text>)
            : <g transform={`translate(${x},-110)`}><g transform="scale(.42) translate(0,170)"><Pan glow={1} t={T} /></g></g>}</g></g>); })}
      {t > 1.2 && <rect x={-240} y={-260} width={480} height={300} rx={20} fill="none" stroke="#ffd23f" strokeWidth={10} opacity={.5 + .5 * Math.sin(t * 20)} />}
    </g>
    {t > 1.25 && Array.from({ length: 22 }, (_, i) => { const k = t - 1.25, x = 540 + (hash(i) - .5) * 1000 * k, y = 1300 - 900 * k * (.5 + hash(i * 3)) + 1200 * k * k; return <circle key={i} cx={x} cy={y} r={20} fill="#ffd23f" stroke="#b8860b" strokeWidth={5} />; })}
  </Cam></Frame>
    {t > 1.6 && <div style={html({ left: 110, top: 1440, width: 860, transform: `scale(${card})`, background: 'rgba(20,18,28,.92)', border: '5px solid #ffd23f', borderRadius: 24, padding: '20px 30px', color: '#fff' })}>
      <div style={{ fontSize: 30, fontWeight: 800, color: '#ffd23f', letterSpacing: 3 }}>ПРЕДМЕТ · РЕДКОСТЬ: КУХОННАЯ</div>
      <div style={{ fontSize: 66, fontWeight: 900, lineHeight: 1.05 }}>СКОВОРОДА СУДЬБЫ</div>
      <div style={{ fontSize: 36, fontWeight: 800, marginTop: 8, color: '#9fe3ff' }}>Точность 100% · Урон: БОНК</div></div>}</>); };

// ───────────────────────── 14. «ВЫ ИЗДЕВАЕТЕСЬ?» ─────────────────────────
export const PanShot: React.FC<P> = ({ t, T }) => { const s = handheld(T, 5);
  return (<Frame bg="#d7ecff"><Cam z={lerp(1.0, 1.06, t / 1.8)} dx={s[0]} dy={s[1]}><Counter t={T} />
    <Person x={540} y={2380} s={2.2} t={T} hold="pan" panGlow={.6} pose={{ armR: [.6, -2.5], armL: [-.4, 1.6] }} expr={t < .3 ? 'deadpan' : 'determined'} mouth={mouth('max', T)} eye={[-.3, -.2]} headTilt={-6} /></Cam></Frame>); };

// ───────────────────────── 15. СВАЙП — ПОРТАЛ ─────────────────────────
export const Swipe: React.FC<P> = ({ t, T }) => {
  if (t < .75) return (<Frame bg="#d7ecff"><Cam z={1.2} fy={900}><Counter t={T} /><Lumina x={540} y={1450} s={1.6} t={T} mouth={mouth('lumina', T)} swipe={clamp((t - .3) / .4)} expr="smirk" /></Cam></Frame>);
  const k = t - .75, fall = clamp((k - .25) / .9), pk = out(win(k, 0, .25));
  return (<Frame bg="#d7ecff"><Counter t={T} />
    <g transform="translate(540,1560)"><Glow x={0} y={0} r={520 * pk} c="#ffd23f" o={.9} id="portY" /><ellipse cx={0} cy={0} rx={380 * pk} ry={110 * pk} fill="#4a2a9a" /><ellipse cx={0} cy={0} rx={300 * pk} ry={80 * pk} fill="#1a0a3a" />
      {Array.from({ length: 4 }, (_, i) => <ellipse key={i} cx={0} cy={0} rx={(380 - i * 40) * pk} ry={(110 - i * 12) * pk} fill="none" stroke="#ffe27a" strokeWidth={6} opacity={.7} transform={`rotate(${Math.sin(t * 9 + i) * 4})`} />)}</g>
    <clipPath id="abovePortal"><rect x={0} y={0} width={1080} height={1560} /><ellipse cx={540} cy={1560} rx={380} ry={110} /></clipPath>
    <g clipPath="url(#abovePortal)"><Person x={540} y={1560 + fall * fall * 1300} s={1.3} t={T} pose={blendPose(POSES.stand, POSES.armsUp, out(win(k, 0, .2)))} expr="scared" mouth={.8} noBlink shadow={false} /></g>
  </Frame>); };

// ───────────────────────── 16. ПАДЕНИЕ НАД ЭЛЬДОРИЕЙ ─────────────────────────
export const Fall: React.FC<P> = ({ t, T }) => { const d = dur('fall'), py = lerp(0, -1650, io(win(t, .2, d))), ltn = t > 2.4 && t < 2.7 ? 1 : 0;
  if (t < .45) return (<Frame bg="#6b55c9"><SkyFall t={T} /><Person x={540} y={1200} s={1.1} t={T} rot={Math.sin(t * 6) * 20} pose={POSES.fall} expr="scared" mouth={.8} shadow={false} /></Frame>);
  return (<Frame bg="#5b46b8"><g transform={`translate(0,${py})`}><Eldoria t={T} lightning={ltn} /></g>
    <Person x={540 + Math.sin(t * 3) * 40} y={560} s={.7} t={T} rot={Math.sin(t * 5) * 25 + 180} pose={POSES.fall} expr="scared" mouth={.7} shadow={false} />
    <Flash t={t} t0={2.4} dur={.25} col="#ff4a5a" /></Frame>); };

// ───────────────────────── 17. ПЛЮХ В ЛУЖУ ─────────────────────────
export const Splash: React.FC<P> = ({ t, T }) => { const s = shake(t, .12, 18, .4), drop = clamp(t / .12);
  return (<><Frame bg="#9c7ad8"><Cam z={1.05} dx={s[0]} dy={s[1] - 260}><Pond t={T} />
    <clipPath id="waterTop"><rect x={0} y={0} width={1080} height={1440} /></clipPath>
    {t < .12 ? <Person x={540} y={lerp(-200, 1440, drop)} s={1.0} t={T} rot={180} pose={POSES.fall} expr="scared" shadow={false} />
      : <g clipPath="url(#waterTop)"><g transform={`translate(540,${1440 - out(win(t, .12, .4)) * 250 + Math.sin(t * 8) * 6})`}>
        <Person x={0} y={0} s={1.0} t={T} rot={180} pose={{ legL: [-.35 + Math.sin(t * 14) * .3, .5], legR: [.35 - Math.sin(t * 14 + 1) * .3, -.5], armL: [-.1, .1], armR: [.1, -.1] }} expr="ko" shadow={false} /></g></g>}
    <Drops t={t} t0={.12} x={540} y={1430} n={22} /><Puffs t={t} t0={.12} x={540} y={1430} col="#e6fbff" n={9} spread={300} size={70} id="spl" />
  </Cam></Frame><Onomato t={t} t0={.12} x={540} y={760} text="ПЛЮХ!" col="#9fe3ff" size={170} rot={6} dur={1.2} /></>); };

// ───────────────────────── 18. СЛАЙМ НА ГОЛОВЕ ─────────────────────────
export const SlimeShot: React.FC<P> = ({ t, T }) => { const maxT = t > 2.2;
  return (<Frame bg="#9c7ad8"><Cam z={lerp(1.15, 1.22, t / 4.4)} fy={1000} dy={-330}><Pond t={T} />
    <clipPath id="waist"><rect x={0} y={0} width={1080} height={1470} /></clipPath>
    <g clipPath="url(#waist)"><Person x={540} y={1800} s={1.35} t={T} pose={{ armL: [-.7, .6], armR: [.7, -.6] }} expr={maxT ? 'deadpan' : 'shock'} mouth={mouth('max', T)} eye={[0, -1]} sweat={.5} /></g>
    <ellipse cx={540} cy={1470} rx={330} ry={46} fill="#bff3ff" opacity={.5} />
    <Slime x={540} y={1800 - 1.35 * 600 - 50} s={1.2} t={T} mouth={mouth('slime', T)} squish={t < .4 ? 1 - t / .4 : 0} look={[0, .8]} />
    {Array.from({ length: 4 }, (_, i) => <ellipse key={i} cx={430 + i * 70} cy={1000 + ((t * 300 + i * 90) % 400)} rx={7} ry={11} fill="#bff3ff" opacity={.8} />)}
  </Cam></Frame>); };

// ───────────────────────── 19. АДСКИЙ ГУСЬ ─────────────────────────
export const GooseShot: React.FC<P> = ({ t, T }) => { const land = .75, gy = t < land ? lerp(-700, 1700, (t / land) ** 2) : 1700, s = shake(t, land, 22, .45), dark = clamp(t / .7) * .45;
  return (<><Frame bg="#9c7ad8"><Cam z={1.05} dx={s[0]} dy={s[1]}><Pond t={T} dark={dark} />
    <Person x={230} y={1780} s={1.0} t={T} pose={t > land ? POSES.shrug : POSES.stand} expr={t > .3 ? 'scared' : 'neutral'} eye={[.9, -.5]} flip={false} sweat={t > land ? .8 : 0} />
    <Slime x={330} y={1780 - 560} s={.5} t={T} look={[.9, -.5]} />
    <Goose x={720} y={gy} s={1.45} t={T} state={t < land ? 'fly' : 'attack'} honk={t > .85 && t < 1.6 ? .9 : 0} flap={t > land ? Math.max(0, .8 - (t - land) * 2) : 0} flip />
    <Puffs t={t} t0={land} x={720} y={1720} col="#f2e6ff" n={10} spread={360} size={70} id="gdust" />
  </Cam></Frame>
    <Onomato t={t} t0={.88} x={640} y={620} text="ГА-А-А!" col={C.red} size={150} rot={-6} dur={1.3} />
    <Tag t={t} t0={1.15} x={70} y={420} w={720} title="АДСКИЙ ГУСЬ" sub="РАЗВЕДЧИК КОРОЛЯ ДЕМОНОВ" col={C.red} /></>); };

// ───────────────────────── 20. ИНФО-СТЕНД: ЗАКОН №3 ─────────────────────────
export const Lore3: React.FC<P> = ({ t, T }) => (<InfoStand t={t} num="ЗАКОН №3" title="Демоны чуют новых избранных" col="#e5383b" top={380}
  art={<g><rect x={0} y={0} width={860} height={380} rx={20} fill="#2a1a2e" /><g transform="translate(250,350) scale(.9)"><Goose x={0} y={0} s={1} t={T} state="stand" honk={Math.max(0, Math.sin(t * 4)) * .5} flip /></g>
    <text x={500} y={70} fontSize={30} fontWeight={800} fill="#ff8a8a" fontFamily="Mont">БЕСТИАРИЙ</text><text x={500} y={130} fontSize={46} fontWeight={900} fill="#fff" fontFamily="Mont">АДСКИЙ ГУСЬ</text>
    <text x={500} y={200} fontSize={32} fontWeight={800} fill="#ffd23f" fontFamily="Mont">Угроза ★★☆</text><text x={500} y={255} fontSize={32} fontWeight={800} fill="#fff" fontFamily="Mont">Щипок: −1 ❤</text>
    <text x={500} y={310} fontSize={32} fontWeight={800} fill="#9fe3ff" fontFamily="Mont">Нюх на новичков</text></g>}
  lines={[{ t: 1.2, icon: '👁', text: 'Разведчики Короля демонов' }, { t: 2.7, icon: '⚠', text: 'Новичок с аурой 0 — лёгкая добыча', col: '#ff8a8a' }]} />);

// ───────────────────────── 21. ПОГОНЯ ─────────────────────────
const Strip: React.FC<{ t: number; speed: number }> = ({ t, speed }) => { const off = (t * speed) % 2160;
  return (<g><Pond t={t} />
    {[0, 1].map(k => <g key={k} transform={`translate(${-off + k * 2160},0)`}>{Array.from({ length: 9 }, (_, i) => <g key={i} transform={`translate(${i * 240 + 60},1500)`}><rect x={-30} y={-500} width={60} height={500} fill="#6a4a3a" /><circle cx={0} cy={-520} r={150} fill={i % 2 ? '#3f8a5e' : '#2f7a52'} /></g>)}</g>)}
    <rect x={0} y={1480} width={1080} height={440} fill="#5aa86a" /></g>); };
export const Chase: React.FC<P> = ({ t, T }) => { const dist = t * 900, ph = dist / 230 * Math.PI, hit1 = .9, hit2 = 2.1, hitK = Math.max(clamp(1 - Math.abs(t - hit1) / .2), clamp(1 - Math.abs(t - hit2) / .2));
  const fg = (t * 2600) % 2400;
  return (<><Frame bg="#9c7ad8"><Cam z={1.05} rot={-3}><Strip t={T} speed={700} />
    <Person x={640} y={1760 - Math.abs(Math.sin(ph)) * 30 - hitK * 90} s={1.05} t={T} pose={runPose(ph)} expr={hitK > .1 ? 'pain' : 'scared'} mouth={.5} sweat={1} rot={hitK * -10} />
    <Goose x={240 + Math.sin(t * 6) * 20} y={1780} s={1.1} t={T} state="attack" neck={Math.max(clamp(1 - Math.abs(t - (hit1 - .1)) / .25), clamp(1 - Math.abs(t - (hit2 - .1)) / .25))} honk={.4 + .4 * Math.sin(t * 9)} flap={.5 + .5 * Math.sin(t * 14)} />
    {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${1200 - fg + i * 420},1920 Q${1180 - fg + i * 420},1500 ${1230 - fg + i * 420},1300`} stroke="#1f4a2a" strokeWidth={44} fill="none" strokeLinecap="round" />)}
  </Cam></Frame>
    <Onomato t={t} t0={hit1} x={640} y={1050} text="ЩИП!" col={C.red} size={120} rot={8} dur={.5} /><Onomato t={t} t0={hit2} x={700} y={1000} text="ЩИП!" col={C.red} size={120} rot={-8} dur={.5} /></>); };

// ───────────────────────── 22. ПРИЖАТ К ДЕРЕВУ ─────────────────────────
export const Corner: React.FC<P> = ({ t, T }) => { const up = out(win(t, .7, 1.0)), z = lerp(1.0, 1.12, io(win(t, 0, 2.1)));
  return (<Frame bg="#3a2a4a"><Cam z={z} fx={760} fy={1100} dy={-300}><Pond t={T} dark={.35} />
    <rect x={820} y={300} width={200} height={1500} fill="#5a3a2a" /><rect x={820} y={300} width={50} height={1500} fill="#6e4a36" />
    <Goose x={180} y={1800} s={1.5} t={T} state="attack" honk={.3} neck={.3} />
    <Person x={760} y={1800} s={1.2} t={T} hold="pan" panGlow={up} pose={blendPose(POSES.stand, POSES.throwBack, up)} expr={up > .5 ? 'determined' : 'scared'} mouth={mouth('max', T)} eye={[-.8, 0]} sweat={1 - up} />
    <Glow x={700} y={900} r={400} c="#ffd23f" o={up * .5} id="cornG" />
  </Cam></Frame>); };

// ───────────────────────── 23. БРОСОК: РИКОШЕТ — БОНК ─────────────────────────
export const Throw: React.FC<P> = ({ t, T }) => {
  const pts: [number, number, number][] = [[800, 900, 0], [120, 520, .55], [560, 1500, .95], [300, 1080, 1.4]];
  let px = 300, py = 1080; for (let i = 0; i < 3; i++) { const [x0, y0, t0] = pts[i], [x1, y1, t1] = pts[i + 1]; if (t >= t0 && t < t1) { const k = (t - t0) / (t1 - t0); px = lerp(x0, x1, k); py = lerp(y0, y1, k) - Math.sin(k * Math.PI) * 120; } }
  const flying = t < 1.4, after = t - 1.4, s = shakeMany(t, [[.55, 10, .2], [.95, 10, .2], [1.4, 30, .5]]);
  const gRot = after > 0 ? Math.min(90, after * 300) : 0, gy = after > 0 ? 1690 - Math.abs(Math.sin(after * 7)) * 120 * Math.exp(-after * 3) : 1800;
  return (<><Frame bg="#3a2a4a" style={{ filter: flying ? 'saturate(1.2)' : 'none' }}><Cam z={1.04} dx={s[0]} dy={s[1]}><Pond t={T} dark={.25} />
    <rect x={30} y={300} width={180} height={1400} fill="#5a3a2a" />
    <g transform="translate(560,1560)"><ellipse cx={0} cy={0} rx={130} ry={60} fill="#8a8a9a" /><ellipse cx={-20} cy={-20} rx={80} ry={30} fill="#aaaabb" /></g>
    {after < 0 ? <Goose x={330} y={1800} s={1.4} t={T} state="attack" honk={.4} /> : <Goose x={260} y={gy} s={1.4} t={T} state="ko" rot={gRot} />}
    {flying && Array.from({ length: 14 }, (_, i) => { const tt = t - i * .03; let qx = px, qy = py; for (let j = 0; j < 3; j++) { const [x0, y0, t0] = pts[j], [x1, y1, t1] = pts[j + 1]; if (tt >= t0 && tt < t1) { const k = (tt - t0) / (t1 - t0); qx = lerp(x0, x1, k); qy = lerp(y0, y1, k) - Math.sin(k * Math.PI) * 120; } }
      return <circle key={i} cx={qx} cy={qy} r={60 - i * 4} fill="#ffd23f" opacity={.5 - i * .035} />; })}
    {flying ? <g transform={`translate(${px},${py}) rotate(${t * 1400}) scale(.9) translate(0,120)`}><Pan glow={1} t={T} /></g>
      : <g transform={`translate(${300 + after * 500},${1000 - after * 900 + after * after * 1400}) rotate(${t * 900}) scale(.8) translate(0,120)`}><Pan glow={.6} t={T} /></g>}
    <Puffs t={t} t0={1.5} x={330} y={1790} col="#e8e0f0" n={9} spread={320} size={70} id="tdust" /><Puffs t={t} t0={.55} x={180} y={560} col="#ffe27a" n={6} spread={140} size={40} id="sp1" /><Puffs t={t} t0={.95} x={560} y={1480} col="#ffe27a" n={6} spread={140} size={40} id="sp2" />
  </Cam></Frame>
    {flying && <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 50%, rgba(40,20,60,.55) 100%)' }} />}
    <Onomato t={t} t0={.55} x={260} y={460} text="ДЗЫНЬ" col="#ffffff" size={80} rot={-12} dur={.4} /><Onomato t={t} t0={.95} x={700} y={1380} text="ДЗЫНЬ" col="#ffffff" size={80} rot={10} dur={.4} />
    <Onomato t={t} t0={1.4} x={420} y={760} text="БОНК!" col={C.yellow} size={220} rot={-8} dur={1.4} /><Stamp t={t} t0={1.5} text="КРИТ!" col={C.red} y={1420} size={150} rot={8} /><Flash t={t} t0={1.4} dur={.2} /></>); };

// ───────────────────────── 24. ПЕРВАЯ ПОБЕДА: ПЛАМЯ АУРЫ ─────────────────────────
export const LevelUp: React.FC<P> = ({ t, T }) => { const k = out(win(t, .3, 1.0));
  return (<><Frame bg="#3a2a4a"><Cam z={lerp(1.0, 1.1, io(win(t, 0, 3.1)))} fy={1300}><Pond t={T} dark={.2 - k * .2} />
    <Goose x={190} y={1740} s={.8} t={T} state="ko" rot={90} />
    <AuraFlame t={T} x={600} y={1820} k={k} />
    <Person x={600} y={1820} s={1.35} t={T} pose={blendPose(POSES.stand, POSES.heroic, spr(t, .2, { damping: 9 }))} hold="pan" panGlow={k} expr="cool" eye={[.2, -.2]} />
  </Cam></Frame><SysWindow t={t} t0={.35} title="ПЕРВАЯ ПОБЕДА" sub="+1 СИЛА · +120 АУРЫ" y={1420} col={C.gold} /></>); };

// ───────────────────────── 25. БУМЕРАНГ В ПАХ ─────────────────────────
export const Groin: React.FC<P> = ({ t, T }) => { const hit = .55, s = shake(t, hit, 26, .4), back = clamp(t / hit), aura = clamp(1 - (t - hit) / .3);
  return (<><Frame bg="#3a2a4a"><Cam z={lerp(1.0, 1.15, out(win(t, hit, hit + .2)))} fy={1300} dx={s[0]} dy={s[1]}><Pond t={T} />
    <AuraFlame t={T} x={560} y={1820} k={aura} />
    <Person x={560} y={1820} s={1.35} t={T} pose={t < hit ? POSES.heroic : POSES.cover} expr={t < hit ? 'cool' : 'pain'} mouth={mouth('max', T)} squash={t > hit ? .3 * Math.exp(-(t - hit) * 4) : 0} sweat={t > hit ? 1 : 0} />
    {t < hit + .1 && <g transform={`translate(${lerp(1300, 560, back)},${lerp(900, 1560, back)}) rotate(${t * 1500}) scale(.75) translate(0,120)`}><Pan glow={.5} t={T} /></g>}
    <Slime x={870} y={1830} s={.9} t={T} mouth={mouth('slime', T)} look={[-.8, -.2]} />
  </Cam></Frame>
    <Onomato t={t} t0={hit} x={560} y={1150} text="ДЗЫНЬ!" col="#ffffff" size={160} rot={-6} dur={.9} />
    {t > 1.65 && <div style={html({ left: 0, width: 1080, top: 640, textAlign: 'center', transform: `scale(${spr(t, 1.65, { damping: 8 })}) rotate(-4deg)`, fontSize: 140, fontWeight: 900, color: C.red, WebkitTextStroke: '16px #14121c', paintOrder: 'stroke fill' })}>−20 АУРЫ</div>}</>); };

// ───────────────────────── 26. СИГНАЛ ─────────────────────────
export const Signal: React.FC<P> = ({ t, T }) => { const up = io(win(t, .6, 2.2)), beam = out(win(t, .3, .7));
  return (<Frame bg="#5b46b8"><g transform={`translate(0,${lerp(-1720, -900, up)})`}><Eldoria t={T} lightning={t > 1.9 ? 1 : 0} />
    <g transform="translate(0,1720)"><Pond t={T} /><Goose x={540} y={1780} s={1.3} t={T} state="ko" rot={90} /></g></g>
    <g opacity={beam}><path d={`M540,${lerp(1500, 1300, up)} L${lerp(540, 820, up)},${-200}`} stroke="#ff2a3a" strokeWidth={60} opacity={.35} /><path d={`M540,${lerp(1500, 1300, up)} L${lerp(540, 820, up)},${-200}`} stroke="#ffd0d0" strokeWidth={14} /></g>
    <Glow x={540} y={lerp(1500, 1300, up)} r={200} c="#ff2a3a" o={beam} id="sigG" />
  </Frame>); };

// ───────────────────────── 27. ТРОННЫЙ ЗАЛ ─────────────────────────
const Silhouette: React.FC<{ x: number; y: number; s: number; kind: 'succ' | 'knight'; t: number }> = ({ x, y, s, kind, t }) => (<g transform={`translate(${x},${y}) scale(${s})`}>
  {kind === 'succ' ? <><path d="M-60,0 L-40,-300 Q0,-330 40,-300 L60,0 Z" fill="#12060e" /><circle cx={0} cy={-360} r={56} fill="#12060e" /><path d="M-30,-400 L-60,-470 L-10,-410 M30,-400 L60,-470 L10,-410" fill="#12060e" stroke="#12060e" strokeWidth={10} />
    <path d="M-40,-260 L-220,-420 L-170,-300 L-220,-260 Z M40,-260 L220,-420 L170,-300 L220,-260 Z" fill="#12060e" />{[-1, 1].map(sd => <ellipse key={sd} cx={sd * 20} cy={-362} rx={9} ry={5} fill="#ff3aa8" />)}</>
    : <><path d="M-90,0 L-80,-330 Q0,-360 80,-330 L90,0 Z" fill="#0c0a10" /><rect x={-50} y={-470} width={100} height={130} rx={30} fill="#0c0a10" /><rect x={-36} y={-420} width={72} height={10} fill="#5affd9" opacity={.8 + .2 * Math.sin(t * 5)} />
      <rect x={110} y={-520} width={18} height={520} fill="#0c0a10" /><path d="M119,-520 L90,-580 L148,-580 Z" fill="#0c0a10" /></>}</g>);
export const ThroneShot: React.FC<P> = ({ t, T }) => (<><Frame bg="#1a0a1e"><Cam z={lerp(1.0, 1.08, io(win(t, 0, 3.2)))} fy={1000}><Throne t={T} />
  <Silhouette x={150} y={1600} s={1.1} kind="succ" t={T} /><Silhouette x={930} y={1600} s={1.1} kind="knight" t={T} />
  <King x={540} y={1500} s={1.45} t={T} mouth={mouth('king', T)} />
  {/* в шаре — гусь в отключке */}
  <g transform={`translate(${540 + 150 * 1.45},${1500 - 120 * 1.45}) scale(.22)`}><Goose x={0} y={120} s={1} t={T} state="ko" rot={90} /></g>
</Cam></Frame><Tag t={t} t0={.5} x={70} y={420} w={700} title="КОРОЛЬ ДЕМОНОВ" sub="АЗГАРОТ · ВЛАДЫКА ТЬМЫ" col={C.red} /></>);
export const SuccShot: React.FC<P> = ({ t, T }) => (<><Frame bg="#1a0a1e"><Cam z={lerp(1.0, 1.06, t / 2.6)}><Throne t={T} /><rect width={1080} height={1920} fill="#2a0a2a" opacity={.5} />
  <Glow x={300} y={900} r={600} c="#ff3aa8" o={.5} id="succG" /><Succubus x={540} y={1700} s={2.1} t={T} mouth={mouth('succ', T)} /></Cam></Frame>
  <Tag t={t} t0={.3} x={70} y={420} w={600} title="ЛИЛИАНА" sub="ГЕНЕРАЛ · СУККУБА" col={C.pink} /></>);
export const Eyes: React.FC<P> = ({ t, T }) => { const fl = t > 2.0 ? 1.6 : 1, s = shake(t, 2.0, 30, .8);
  return (<><Frame bg="#100408"><Cam z={lerp(1.0, 1.12, io(win(t, 0, 4)))} dx={s[0]} dy={s[1]}><rect width={1080} height={1920} fill="#1a0610" />
    <King x={540} y={960 + 470 * 3.4} s={3.4} t={T} mouth={mouth('king', T)} glow={fl} orb={false} /></Cam></Frame>
    <Flash t={t} t0={2.0} dur={.35} col="#ff2a2a" /></>); };

// ───────────────────────── 28. РАЗВИЛКА ─────────────────────────
export const Signpost: React.FC<P> = ({ t, T }) => { const sign = spr(t, 1.3, { damping: 5, stiffness: 90 }), swing = Math.sin(t * 5) * 8 * Math.exp(-(t - 1.3) * 1.2);
  const board = (y: number, x: number, w: number, txt: string, dir: number, col: string) => <g transform={`translate(540,${y})`}><path d={dir > 0 ? `M${x},-50 L${x + w},-50 L${x + w + 50},0 L${x + w},50 L${x},50 Z` : `M${x},-50 L${x - w},-50 L${x - w - 50},0 L${x - w},50 L${x},50 Z`} fill={col} stroke="#5a3a20" strokeWidth={8} />
    <text x={dir > 0 ? x + w / 2 + 10 : x - w / 2 - 10} y={16} fontSize={44} fontWeight={900} textAnchor="middle" fill="#3a2410" fontFamily="Mont">{txt}</text></g>;
  return (<Frame bg="#ff8a6a"><Cam z={lerp(1.0, 1.06, t / 3.1)}><Crossroads t={T} />
    <rect x={524} y={380} width={32} height={1000} fill="#6a4a2a" />
    <g transform="translate(540,470)"><rect x={-170} y={-60} width={340} height={110} rx={10} fill="#e8c890" stroke="#5a3a20" strokeWidth={8} /><text x={0} y={16} fontSize={48} fontWeight={900} textAnchor="middle" fill="#3a2410" fontFamily="Mont">↑ ДОМОЙ</text>
      {t > 1.3 && <g transform={`translate(0,${-40 + (1 - sign) * -300}) rotate(${-10 + swing})`}><rect x={-210} y={-40} width={420} height={110} rx={8} fill="#e5383b" stroke="#fff" strokeWidth={6} /><text x={0} y={30} fontSize={40} fontWeight={900} textAnchor="middle" fill="#fff" fontFamily="Mont">ЗАКРЫТО НА РЕМОНТ</text></g>}</g>
    {board(660, -20, 380, 'ЛЕС ЭЛЬФИЕК', -1, '#bfe6a0')}{board(800, 20, 380, 'ДРАКОН', 1, '#f2b090')}
    <Person x={250} y={1560} s={1.0} t={T} pose={POSES.stand} expr="deadpan" mouth={mouth('max', T)} eye={[.6, -.8]} hold="pan" />
    <Slime x={130} y={1570} s={.55} t={T} look={[.6, -.8]} />
  </Cam></Frame>); };

// ───────────────────────── 29. КАРТОЧКА ВЫБОРА ─────────────────────────
const ElfArt: React.FC<{ t: number }> = ({ t }) => (<g><rect width={540} height={1920} fill="#1f4a3a" /><Glow x={270} y={800} r={500} c="#7dffb0" o={.5} id="elfG" />
  {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${i * 100 - 20},1920 L${i * 100 + 40},${600 + (i % 2) * 120} L${i * 100 + 100},1920 Z`} fill={i % 2 ? '#2f6a4a' : '#24583c'} />)}
  <g transform={`translate(270,1020)`}><path d="M-60,0 L-40,-300 Q0,-330 40,-300 L60,0 Z" fill="#0f2a1e" /><circle cx={0} cy={-360} r={56} fill="#0f2a1e" /><path d="M-50,-370 L-110,-410 L-46,-350 M50,-370 L110,-410 L46,-350" fill="#0f2a1e" stroke="#0f2a1e" strokeWidth={8} />
    <path d="M-90,-420 Q-150,-200 -90,20" stroke="#0f2a1e" strokeWidth={12} fill="none" /><path d="M-90,-420 L-90,20" stroke="#bfffd8" strokeWidth={3} /><path d="M-90,-200 L40,-200" stroke="#0f2a1e" strokeWidth={8} /></g>
  <Motes n={24} t={t} c="#bfffd8" seed={41} area={[0, 300, 540, 1200]} vy={-30} size={8} /></g>);
const DragonArt: React.FC<{ t: number }> = ({ t }) => (<g><rect width={540} height={1920} fill="#2a1414" /><Glow x={270} y={800} r={500} c="#ff6a2a" o={.45} id="drG" />
  <path d="M-40,1920 L-40,500 Q270,200 580,500 L580,1920 Z" fill="#140808" />
  {[-1, 1].map(sd => <g key={sd}><ellipse cx={270 + sd * 90} cy={760} rx={56} ry={24} fill="#ffd23f" opacity={.6 + .4 * Math.sin(t * 2)} /><ellipse cx={270 + sd * 90} cy={760} rx={10} ry={22} fill="#1a0a00" /></g>)}
  {Array.from({ length: 5 }, (_, i) => { const k = ((t * .5 + i * .2) % 1); return <circle key={i} cx={270 + Math.sin(i * 3 + t) * 60} cy={860 - k * 400} r={40 + k * 80} fill="#6a5a5a" opacity={.35 * (1 - k)} />; })}
  <Motes n={20} t={t} c="#ffb04a" seed={43} area={[0, 600, 540, 900]} vy={-60} size={6} /></g>);
export const ChoiceShot: React.FC<P> = ({ t, T }) => { const look = Math.sin(t * 2.4);
  return (<Choice t={t} left={{ title: 'ЭЛЬФИЙКИ', sub: 'ЛЕС ЭЛЬФИЕК', col: '#7dffb0', art: <ElfArt t={T} /> }} right={{ title: 'ДРАКОН', sub: 'ЛОГОВО ДРАКОНА', col: '#ff9a5a', art: <DragonArt t={T} /> }}
  />); };
export const End: React.FC<P> = ({ t }) => (<><EndCard t={t} />
  <div style={html({ left: 90, width: 900, top: 1100, display: 'flex', justifyContent: 'space-between', opacity: out(win(t, .9, 1.2)) })}>
    {[['⚔ СИЛА', '2', '#ff8a5a'], ['❤ ЗДОРОВЬЕ', '1', '#ff4a6a'], ['✦ АУРА', '100', '#ffc94d']].map(([a, b, c]) => <div key={a} style={{ width: 280, background: 'rgba(20,18,28,.85)', borderTop: `5px solid ${c}`, borderRadius: 18, padding: '10px 16px', color: '#fff' }}>
      <div style={{ fontSize: 26, fontWeight: 800, color: c }}>{a}</div><div style={{ fontSize: 60, fontWeight: 900 }}>{b}</div></div>)}</div></>);
