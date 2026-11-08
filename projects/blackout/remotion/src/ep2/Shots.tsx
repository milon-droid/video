// Планы серии 2 «Хаос на улицах». Каждый план получает глобальное время t (с); границы — SH[id] из shared.mjs.
// Ключевое действие и лица — выше y 1100 (субтитры y 1150–1400), камера всегда движется.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { clamp, handheld, io, lerp, mix, out, shake, shakeMany, spr, win } from '../anim';
import { C, FONT } from '../theme';
import { Character, Who } from '../char/Character';
import { Hand } from '../char/Hand';
import { DarkFilter, Glow, KitchenBack, Mug, PhoneDevice } from '../bg/Kitchen';
import { Person } from '../bg/City';
import { Fighter, Hallway } from '../bg/Exterior';
import { CarSide, Hero, MechWatch, MetroCar, Onomato, SmartWatch, StairWell, StreetBack, TrafficLight, Truck, Tunnel, YardBack } from '../bg/Street';
import { ChatList, PhoneBig } from '../ui/Phone';
import { Cam, Frame, GlitchBars } from '../ui/Overlays';
import { mouthOf, SH, T, REWIND } from './data';

type S = { t: number };
const L = (cx: number, cy: number, s: number, wx: number, wy: number): [number, number] => [(wx - cx) / s, (wy - cy) / s];
const a0 = (id: string) => (SH as Record<string, number[]>)[id][0], b0 = (id: string) => (SH as Record<string, number[]>)[id][1];
const push = (t: number, id: string, z0 = 1, z1 = 1.08) => lerp(z0, z1, io(win(t, a0(id), b0(id))));
const Blur: React.FC<{ px: number; children: React.ReactNode }> = ({ px, children }) => <g style={{ filter: `blur(${px}px)` }}>{children}</g>;
const Beam: React.FC<{ x: number; y: number; tx: number; ty: number; w?: number; k?: number; col?: string }> = ({ x, y, tx, ty, w = 300, k = 1, col = '#FFF6DE' }) => { const a = Math.atan2(ty - y, tx - x), nx = -Math.sin(a), ny = Math.cos(a), id = `b2${Math.round(x)}${Math.round(tx)}${Math.round(ty)}`;
  return (<g style={{ mixBlendMode: 'screen' }} opacity={k}><defs><linearGradient id={id} gradientUnits="userSpaceOnUse" x1={x} y1={y} x2={tx} y2={ty}><stop offset="0" stopColor={col} stopOpacity={.5} /><stop offset="1" stopColor={col} stopOpacity={.06} /></linearGradient></defs>
    <path d={`M${x + nx * 8},${y + ny * 8} L${tx + nx * w},${ty + ny * w} L${tx - nx * w},${ty - ny * w} L${x - nx * 8},${y - ny * 8} Z`} fill={`url(#${id})`} style={{ filter: 'blur(6px)' }} /><Glow x={tx} y={ty} r={w * 1.1} col={col} a={.5} /><Glow x={x} y={y} r={46} col="#FFFFFF" a={.9} /></g>); };
// пар изо рта: мягкие клубы с градиентом
const Breath: React.FC<{ x: number; y: number; t: number; per?: number; dir?: number }> = ({ x, y, t, per = .9, dir = 1 }) => { const u = (t % per) / per;
  return <g opacity={Math.sin(u * Math.PI) * .55}>{[0, 1, 2].map(i => <Glow key={i} x={x + dir * (20 + u * 120 + i * 26)} y={y - u * 40 - i * 10} r={30 + u * 60 + i * 10} col="#E8EEF8" a={.6} />)}</g>; };
// пыль в луче: частицы медленно плывут
const Motes: React.FC<{ t: number; x: number; y: number; w: number; h: number; n?: number }> = ({ t, x, y, w, h, n = 22 }) => <g>{Array.from({ length: n }, (_, i) => { const px = x + ((i * 97.3 + t * (8 + i % 5)) % w), py = y + ((i * 61.7 + t * (5 + i % 3) * (i % 2 ? 1 : -1) + 999) % h); return <circle key={i} cx={px} cy={py} r={1.6 + (i % 3)} fill="#FFF6DE" opacity={.35 + .3 * Math.sin(t * 3 + i)} />; })}</g>;
// холодная «плёнка» воспоминания: рамка, зерно, тёмные углы, мерцание
const FilmLook: React.FC<{ t: number }> = ({ t }) => (<AbsoluteFill style={{ pointerEvents: 'none' }}>
  <AbsoluteFill style={{ background: 'rgba(40,90,140,.22)', mixBlendMode: 'color' }} /><AbsoluteFill style={{ background: `rgba(220,235,255,${.04 + .03 * Math.sin(t * 47)})` }} />
  <AbsoluteFill style={{ border: '26px solid rgba(230,238,250,.75)', borderRadius: 40, margin: 30, boxShadow: 'inset 0 0 160px rgba(0,0,0,.8)' }} />
  {[0, 1].map(i => <div key={i} style={{ position: 'absolute', top: 0, bottom: 0, width: 2, left: (Math.sin(t * 3 + i * 9) * .5 + .5) * 1080, background: 'rgba(240,245,255,.25)' }} />)}
  <div style={{ position: 'absolute', left: 80, top: 1500, fontFamily: FONT, fontWeight: 900, fontSize: 40, color: 'rgba(230,238,250,.85)', letterSpacing: 4 }}>◀ 20:01 · МЕТРО</div></AbsoluteFill>);

// ───── 1. Дверь распахивается: Алишер в пыли, пар, луч фонарика Беки ─────
export const DoorOpen: React.FC<S> = ({ t }) => { const k = spr(t, T.doorOpen, { damping: 16, stiffness: 140 }), dw = 570 * (1 - k * .82), [hx, hy, hr] = handheld(t, 5, 'd2');
  const pant = Math.sin(t * 9) * .5 + .5, m = Math.max(mouthOf(t, 'n01') * 0, pant * .25);
  return (<Frame bg="#040509"><Cam z={push(t, 'e2s01', 1.02, 1.1)} fx={570} fy={820} dx={hx} dy={hy} rot={hr}>
    <defs><DarkFilter id="d2dk" k={.8} /></defs><g filter="url(#d2dk)"><Hallway /></g>
    <rect x={285} y={360} width={570} height={1060} fill="#07080d" />
    <g opacity={.9}><rect x={600} y={420} width={30} height={1000} fill="#14161e" /><path d="M285,1000 L855,880" stroke="#1a1c26" strokeWidth={20} /></g>
    <clipPath id="d2door"><rect x={285} y={360} width={570} height={1060} /></clipPath>
    <g clipPath="url(#d2door)"><Character who="alisher" x={575} y={760} s={1.45} t={t} expr="fear" mouth={m} duck={pant * .35} look={[0, .1]} under={.0} shade={.15}
      armL={{ to: L(575, 760, 1.45, 330, 640), pose: 'flat' }} armR={{ to: L(575, 760, 1.45, 760, 1180), pose: 'relax' }} />
      {[[470, 700], [520, 610], [640, 820], [700, 640], [560, 980]].map(([dx, dy], i) => <circle key={i} cx={dx} cy={dy} r={10 + i % 3 * 5} fill="#9a9284" opacity={.45} />)}
      <Breath x={600} y={690} t={t} per={.85} /></g>
    <g transform={`translate(285,360) scale(${dw / 570},1)`}><rect x={0} y={0} width={570} height={1060} rx={14} fill="url(#quilt)" /><rect x={0} y={0} width={570} height={1060} rx={14} fill="#000" opacity={.55} /></g>
    <Beam x={170} y={1540} tx={600} ty={700} w={260} k={1} /><Motes t={t} x={360} y={500} w={460} h={520} />
    <g transform="translate(130,1630) rotate(-48)"><Hand side={1} skin="#9a7058" shade="#6a4a38" pose="grip" s={2.4} hold={<PhoneDevice x={0} y={0} s={1.2} back torch={1} />} /></g>
  </Cam></Frame>); };

// ───── 2. Кухня в темноте: Алишер жадно пьёт, трое светят телефонами ─────
const darkKitchen = (t: number, id: string) => (<><defs><DarkFilter id={id} k={.86} /></defs><g filter={`url(#${id})`}><KitchenBack t={t} on={0} pcOn={0} outside={0} /></g><rect x={-200} y={-200} width={1480} height={2400} fill="#04060e" opacity={.55} /></>);
export const KitchenGulp: React.FC<S> = ({ t }) => { const g = clamp((t - T.gulp) / .9), drinking = t >= T.gulp && t < T.gulp + 1.0, tip = drinking ? Math.sin(g * Math.PI) : 0, m = mouthOf(t, 'a01');
  return (<Frame bg="#03040a"><Cam z={push(t, 'e2s02', 1, 1.07)} fx={540} fy={860} dy={-160}>
    {darkKitchen(t, 'kgdk')}
    <Character who="beka" x={170} y={960} s={1.05} t={t} expr="worry" look={[.8, -.1]} turn={.4} under={.75} shade={.8} armL={null} armR={{ to: L(170, 960, 1.05, 300, 1060), pose: 'grip', hold: <PhoneDevice x={0} y={0} s={1.1} screen={1} /> }} />
    <Character who="dias" x={920} y={940} s={1.08} t={t} expr="worry" look={[-.8, -.1]} turn={-.4} under={.75} shade={.8} collarOpen armL={{ to: L(920, 940, 1.08, 790, 1050), pose: 'grip', hold: <PhoneDevice x={0} y={0} s={1.1} screen={1} /> }} armR={null} />
    <Character who="alik" x={760} y={1010} s={.86} t={t} expr="tense" look={[-.6, 0]} under={.6} shade={.82} armL={null} armR={null} />
    <Character who="alisher" x={510} y={900} s={1.3} t={t} expr={drinking ? 'neutral' : 'fear'} mouth={drinking ? 0 : m} tilt={-tip * 12} look={[0, drinking ? -.6 : .2]} under={.55} shade={.55}
      armL={{ to: L(510, 900, 1.3, 400, 1150), pose: 'relax' }} armR={drinking ? { to: L(510, 900, 1.3, 560, 800 - tip * 40), pose: 'grip', flip: 1, hold: <Mug x={0} y={0} s={.55} t={t} /> } : { to: L(510, 900, 1.3, 640, 1060), pose: 'grip', hold: <Mug x={0} y={0} s={.55} t={t} /> }} />
    <Beam x={300} y={1060} tx={560} ty={620} w={180} k={.45} /><Beam x={790} y={1050} tx={520} ty={640} w={160} k={.4} />
  </Cam></Frame>); };

// ───── 3. Воспоминание: вагон тормозит, люди валятся, лампы гаснут ─────
export const MetroFlash: React.FC<S> = ({ t }) => { const u = t - a0('e2s03'), brake = spr(t, T.brake, { damping: 7, stiffness: 90 }), speed = t < T.brake ? 1 : clamp(1 - (t - T.brake) / .7), lean = t < T.brake ? 0 : Math.sin(clamp((t - T.brake) / .9) * Math.PI) * (1 - clamp((t - T.brake - .9) / 1));
  const lamps = [0, 1, 2, 3, 4].map(i => t < T.lampsOff + i * .12 ? (t > T.lampsOff - .4 && Math.sin(t * 60 + i) > .3 ? .4 : 1) : 0), dark = lamps.every(l => l === 0), [sx, sy] = shake(t, T.brake + .1, 14, .7);
  const people = [[90, 1430, '#5A6A8A'], [290, 1460, '#8A5A4A'], [820, 1440, '#4A6A5A'], [1010, 1470, '#6A5A7A']] as [number, number, string][];
  return (<AbsoluteFill><Frame bg="#05060a"><Cam z={lerp(1.04, 1.12, io(win(u, 0, 3.4)))} fx={540} fy={820} dx={sx} dy={sy - 140}>
    <MetroCar t={t} speed={speed} lamps={lamps} jolt={lean} />
    {people.map(([x, y, col], i) => <g key={i} transform={`rotate(${lean * 16},${x},${y})`}><Person x={x} y={y} s={2.7} t={t} pose={lean > .3 ? 'freeze' : 'phone'} col={col} dark={dark ? .8 : 0} face seed={i} torch={dark && i % 2 ? 1 : 0} /></g>)}
    <g transform={`translate(${lean * 50},0) rotate(${lean * 12},560,1500)`}><Character who="alisher" x={560} y={860} s={1.6} t={t} expr={lean > .2 || dark ? 'shock' : 'neutral'} look={[.2, 0]} shade={dark ? .8 : 0} under={dark ? .5 : 0}
      armR={{ to: L(560, 860, 1.6, 650, 560), pose: "grip" }} armL={{ to: L(560, 860, 1.6, 400, 1160), pose: 'grip', hold: <PhoneDevice x={0} y={0} s={1.1} screen={dark ? 1 : 0} /> }} /></g>
    {dark && <rect x={-200} y={-200} width={1480} height={2400} fill="#020308" opacity={.55} />}
  </Cam></Frame><FilmLook t={t} /><GlitchBars t={t} k={t >= REWIND[0] && t < REWIND[0] + 4 / 30 ? 1 : 0} /></AbsoluteFill>); };

// ───── 4. Тоннель: цепочка людей по шпалам с фонариками, впереди «Байконур» ─────
export const TunnelWalk: React.FC<S> = ({ t }) => { const u = t - a0('e2s04'), walk = u * .55, [hx, hy] = handheld(t, 7, 'tn');
  const walkers = [1.6, 2.3, 3.1, 4.0, 5.2, 6.6].map((d, i) => { const k = 1 / d; return { x: 540 + (i % 2 ? -1 : 1) * 160 * k + Math.sin(t * 2 + i) * 6 * k, y: 730 + 1300 * k * .74, s: 2.6 * k, i }; });
  return (<AbsoluteFill><Frame bg="#030406"><Cam z={lerp(1.0, 1.08, io(win(u, 0, 3.6)))} fx={540} fy={800} dx={hx} dy={hy - 60}>
    <Tunnel t={t} walk={walk} vp={[540, 700]} station={.8 + .2 * Math.sin(t * 2)} />
    {walkers.reverse().map(w => <g key={w.i}><Person x={w.x} y={w.y} s={w.s} t={t + w.i * .3} pose="walk" col={['#3a4252', '#523a32', '#2e3a30', '#3e3448', '#4a4a3a', '#30384a'][w.i]} dark={.75} seed={w.i} dir={1} />
      <path d={`M${w.x + 18 * w.s},${w.y - 120 * w.s} L${540 - 60 * (1 - w.s / 3)},${700} L${540 + 60 * (1 - w.s / 3)},${700} Z`} fill="#FFF8E1" opacity={.07} /><Glow x={w.x + 18 * w.s} y={w.y - 120 * w.s} r={30 * w.s + 10} col="#FFFBEA" a={.9} /></g>)}
    <Hero id="alisher" x={420} y={1560} s={1.25} t={t} pose="walk" phase={u * 6.5} dark={.55} torch={1} dir={1} />
  </Cam></Frame><FilmLook t={t} /></AbsoluteFill>); };

// ───── 5. Кухня: Алишер садится, «Нет сети», Бека кладёт руку на плечо ─────
export const KitchenSit: React.FC<S> = ({ t }) => { const u = t - a0('e2s05'), sit = out(win(u, 0, .6)), hand = spr(t, a0('e2s05') + 1.5, { damping: 14 }), ay = lerp(880, 960, sit);
  return (<Frame bg="#03040a"><Cam z={push(t, 'e2s05', 1.02, 1.1)} fx={540} fy={860} dy={-150}>
    {darkKitchen(t, 'ksdk')}
    <Character who="dias" x={900} y={820} s={.82} t={t} expr="worry" look={[1, 0]} turn={.8} under={.35} shade={.85} collarOpen armL={null} armR={null} />
    <Character who="beka" x={720} y={900} s={1.18} t={t} expr="worry" look={[-.7, .4]} turn={-.4} under={.5} shade={.75} armR={null}
      armL={{ to: L(720, 900, 1.18, lerp(640, 560, hand), lerp(1060, 940, hand)), pose: hand > .5 ? 'flat' : 'relax' }} />
    <Character who="alisher" x={430} y={ay} s={1.3} t={t} expr="worry" look={[.1, .8]} tilt={-4} under={.8} shade={.55} duck={.4}
      armL={{ to: L(430, ay, 1.3, 470, 1130), pose: 'grip', hold: <PhoneDevice x={0} y={0} s={1.25} screen={1} /> }} armR={{ to: L(430, ay, 1.3, 520, 1150), pose: 'relax' }} />
    <g transform="translate(250,560)" opacity={out(win(u, .7, 1))}><rect x={0} y={0} width={280} height={96} rx={24} fill="rgba(11,16,32,.85)" /><text x={140} y={64} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill={C.danger}>НЕТ СЕТИ</text></g>
  </Cam></Frame>); };

// ───── 6. Диас у окна натягивает куртку и хватает ключи ─────
const lensCars = (t: number) => (cx: number, cy: number, w: number, h: number) => <g>{[0, 1].map(i => <circle key={i} cx={cx - w * .3 + ((t * .3 + i * .5) % 1) * w * .8} cy={cy + h * .2} r={3.4} fill="#FFF6DA" opacity={.9} />)}<rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} fill="#3a6bff" opacity={.12 * (Math.sin(t * 7) > 0 ? 1 : 0)} /></g>;
export const DiasJacket: React.FC<S> = ({ t }) => { const u = t - a0('e2s06'), pull = clamp(u / 1.1), up = Math.sin(pull * Math.PI), grab = out(win(t, T.keys - .3, T.keys)), pol = Math.sin(t * 7) > 0 ? '#3a6bff' : '#ff3a3a';
  const keys = <g><circle cx={0} cy={0} r={12} fill="none" stroke="#C9CDD6" strokeWidth={4} /><rect x={8} y={-4} width={40} height={9} rx={3} fill="#C9A45A" /><rect x={4} y={6} width={34} height={8} rx={3} fill="#AEB4BF" /></g>;
  return (<Frame bg="#04060c"><Cam z={push(t, 'e2s06', 1, 1.08)} fx={520} fy={860}>
    <rect x={120} y={260} width={840} height={880} fill="#0b1020" /><g><clipPath id="djw"><rect x={120} y={260} width={840} height={880} /></clipPath><g clipPath="url(#djw)"><StreetBack t={t} hill={-120} /><rect x={120} y={900} width={840} height={300} fill="#0a0e1a" />
      {[0, 1, 2, 3].map(i => { const q = (t * .07 + i / 4) % 1; return <Glow key={i} x={lerp(160, 940, q)} y={1000 + (i % 2) * 40} r={40} col="#FFF6DA" a={.7} />; })}<Glow x={760} y={1060} r={160} col={pol} a={.35} /></g></g>
    <rect x={120} y={260} width={840} height={880} fill="none" stroke="#1a1e2a" strokeWidth={22} /><line x1={540} y1={260} x2={540} y2={1140} stroke="#1a1e2a" strokeWidth={12} /><rect x={90} y={1130} width={900} height={40} fill="#22252e" />
    {grab < 1 && <g transform="translate(770,1120)">{keys}</g>}
    <Character who="diasJ" x={420} y={900} s={1.55} t={t} expr="tense" look={[.7, .2]} turn={.3} under={.5} shade={.6} collarOpen lens={lensCars(t)}
      armL={{ to: L(420, 900, 1.55, lerp(350, 290, up), lerp(1150, 860, up)), pose: 'grip' }}
      armR={grab > 0 ? { to: L(420, 900, 1.55, lerp(770, 600, grab * clamp((t - T.keys) / .4)), lerp(1120, 1080, grab)), pose: 'grip', hold: keys } : { to: L(420, 900, 1.55, lerp(520, 560, up), lerp(1150, 870, up)), pose: 'grip' }} />
  </Cam></Frame>); };

// ───── 7a. Телефон Диаса: «Не доставлено», батарея 31% ─────
export const ChatFail2: React.FC<S> = ({ t }) => (<AbsoluteFill><Frame bg="#05070e"><Blur px={14}><Cam z={1.5} fx={540} fy={700}><StreetBack t={t} /></Cam></Blur><rect x={-10} y={-10} width={1100} height={1940} fill="#0B1020" opacity={.5} /></Frame>
  <div style={{ scale: String(lerp(1.0, 1.05, io(win(t, a0('e2s07a'), b0('e2s07b'))))), position: 'absolute', inset: 0 }}><PhoneBig t={t} time="20:05" lost header={{ name: 'Аружан', sub: 'Connecting…' }} thumbAt={[a0('e2s07a') + .15]} thumbXY={[800, 1240]}>
    <ChatList t={t} msgs={[{ text: 'Выхожу через 5 минут', mine: true, ticks: 2 }, { text: 'Ты где? Ответь', mine: true, clock: true }]} failAt={T.fail} /></PhoneBig>
    <div style={{ position: 'absolute', left: 660, top: 470, fontFamily: FONT, fontWeight: 900, fontSize: 30, color: '#F2B33D' }}>31%</div></div></AbsoluteFill>);
// ───── 7b. Лицо Диаса: решился ─────
export const DiasDecide: React.FC<S> = ({ t }) => { const m = mouthOf(t, 'd01'), s = 2.4, cx = 540, cy = 1180;
  return (<Frame bg="#04060c"><Cam z={push(t, 'e2s07b', 1, 1.06)} fx={540} fy={760}><Blur px={10}><Cam z={1.4} fx={540} fy={600}><StreetBack t={t} hill={-200} /></Cam></Blur><rect x={-200} y={-200} width={1480} height={2400} fill="#04060c" opacity={.45} />
    <Glow x={820} y={520} r={420} col="#3a6bff" a={.25} />
    <Character who="diasJ" x={cx} y={cy} s={s} t={t} expr="tense" look={[-.15, -.05]} mouth={m} under={.55} shade={.45} collarOpen lens={lensCars(t)} armL={null} armR={null} /></Cam></Frame>); };

// ───── 8. Механические часы Алихана 20:05 крупно; Бека застёгивает олимпийку ─────
export const WatchClose: React.FC<S> = ({ t }) => { const u = t - a0('e2s08'), sec = 14 + Math.floor(u * 2) / 2 * 2, m = mouthOf(t, 'b01'), zip = out(win(u, 0, .6));
  return (<Frame bg="#05070e"><Cam z={push(t, 'e2s08', 1, 1.07)} fx={540} fy={760}>
    <Blur px={6}>{darkKitchen(t, 'wcdk')}</Blur><rect x={-200} y={-200} width={1480} height={2400} fill="#05070e" opacity={.35} />
    <Character who="beka" x={780} y={860} s={1.25} t={t} expr="tense" look={[-.6, .1]} turn={-.3} mouth={m} under={.6} shade={.55}
      armL={{ to: L(780, 860, 1.25, 780, lerp(1250, 900, zip)), pose: 'grip' }} armR={{ to: L(780, 860, 1.25, 820, lerp(1250, 1180, zip)), pose: 'grip', hold: <PhoneDevice x={0} y={0} s={1.1} screen={1} /> }} />
    <g transform="translate(330,700) rotate(-12)"><rect x={-140} y={-340} width={280} height={680} rx={60} fill="#E8B992" /><rect x={-150} y={200} width={300} height={300} fill="url(#plaid8)" /><defs><pattern id="plaid8" width="52" height="52" patternUnits="userSpaceOnUse"><rect width="52" height="52" fill="#A9402B" /><rect width="52" height="16" y="18" fill="#6E2318" opacity=".8" /><rect width="16" height="52" x="18" fill="#6E2318" opacity=".55" /></pattern></defs>
      <MechWatch x={0} y={0} r={120} t={t} h={8} m={5} sec={sec} /><Glow x={0} y={0} r={260} col="#7FB3FF" a={.18} /></g>
    <Beam x={1040} y={1300} tx={360} ty={700} w={160} k={.35} />
  </Cam></Frame>); };

// ───── 9. Лестница сверху вниз («головокружение»), четверо бегут вниз с фонариками ─────
export const Stairs: React.FC<S> = ({ t }) => { const u = t - a0('e2s09'), rot = u * 9, z = lerp(1, 1.35, io(win(u, 0, 3.2)));
  const runners = (['beka', 'dias', 'alik', 'alisher'] as const).map((id, i) => { const p = (u * .32 + i * .07) % 1, lvl = Math.pow(.72, 1 + p * 3), ang = p * Math.PI * 2 * 1.5 + i * .35; return { id, x: 540 + Math.cos(ang) * 420 * lvl, y: 880 + Math.sin(ang) * 340 * lvl, s: lvl * 1.1, ang }; });
  const col: Record<string, string> = { beka: '#25357E', dias: '#2B3A55', alik: '#A9402B', alisher: '#6B7A3E' }, head: Record<string, string> = { beka: '#231C18', dias: '#1E1A20', alik: '#3A2316', alisher: '#7A1F2B' };
  return (<Frame bg="#07080c"><Cam z={1} fx={540} fy={880}>
    <StairWell t={t} rot={rot} z={z} />
    <g transform={`translate(540,880) rotate(${rot}) scale(${z}) translate(-540,-880)`}>
      <g opacity={.9}><rect x={540 + 300} y={880 - 330} width={90} height={60} fill="#3b2a18" /><Glow x={540 + 345} y={880 - 300} r={120} col="#F2B33D" a={.55 + .2 * Math.sin(t * 11)} /></g>
      {runners.map(r => <g key={r.id} transform={`translate(${r.x},${r.y}) scale(${r.s}) rotate(${r.ang * 180 / Math.PI + 90})`}>
        <path d="M0,0 L-70,-330 L70,-330 Z" fill="#FFF8E1" opacity={.13} /><Glow x={0} y={-40} r={44} col="#FFFBEA" a={.85} />
        <ellipse cx={0} cy={0} rx={52} ry={34} fill={col[r.id]} /><circle cx={0} cy={0} r={24} fill={head[r.id]} />{r.id === 'alisher' && <rect x={-20} y={14} width={40} height={30} rx={8} fill="#3C362E" />}</g>)}
    </g></Cam></Frame>); };

// ───── 10. Двор: выходят из подъезда; нарастает гул — все поднимают головы ─────
export const Yard: React.FC<S> = ({ t }) => { const u = t - a0('e2s10'), rum = clamp((t - T.rumble) / 1.5), look = out(win(t, T.rumble + .6, T.rumble + 1.1)), [sx, sy] = [Math.sin(t * 61) * 4 * rum, Math.cos(t * 53) * 3 * rum];
  const hero = (id: 'beka' | 'dias' | 'alik' | 'alisher', x0: number, i: number) => { const walk = clamp(u / 1.6 - i * .1), x = x0 + walk * 160, moving = walk > 0 && walk < 1 && look < .5;
    return <Hero key={id} id={id} x={x} y={1190 + (i % 2) * 30} s={1.4} t={t} pose={look > .5 ? 'up' : moving ? 'walk' : 'stand'} phase={(u - i * .16) * 7} dark={.45} torch={id === 'beka' || id === 'dias' ? 1 : 0} />; };
  return (<Frame bg="#0b0f1c"><Cam z={push(t, 'e2s10', 1, 1.07)} fx={540} fy={800} dx={sx} dy={sy - 120}>
    <YardBack t={t} shake={rum} />
    <g transform={`translate(${900 + Math.sin(t * 8) * 6 * rum},1180)`}><path d="M-10,0 L-14,-560 L14,-560 L10,0 Z" fill="#1a1410" />{Array.from({ length: 30 }, (_, i) => <circle key={i} cx={Math.cos(i * 2.4) * (90 + i * 6)} cy={-560 + Math.sin(i * 1.7) * 140} r={36} fill={['#7a4a1e', '#5a3a18', '#8a5a22'][i % 3]} opacity={.9} />)}</g>
    {Array.from({ length: 10 }, (_, i) => { const q = ((t * .25 + i * .1) % 1); return <ellipse key={i} cx={700 + Math.sin(i * 3 + t * 2) * 160 + q * 200} cy={600 + q * 700} rx={14} ry={8} fill={['#C8742A', '#A0581E', '#E09A3A'][i % 3]} transform={`rotate(${t * 200 + i * 40},${700 + q * 200},${600 + q * 700})`} />; })}
    {hero('alisher', 170, 3)}{hero('alik', 300, 2)}{hero('dias', 440, 1)}{hero('beka', 580, 0)}
    {[175, 305, 445, 585].map((x, i) => <Breath key={i} x={x + clamp(u / 1.6) * 160} y={720} t={t + i * .3} per={1.1} />)}
  </Cam></Frame>); };

// ───── 11. Истребитель низко над проспектом: вспышка форсажа по толпе, люди пригибаются ─────
export const JetAvenue: React.FC<S> = ({ t }) => { const k = win(t, T.jet - .6, T.jet + 1.2), jx = lerp(-500, 1600, k), jy = lerp(900, 300, k), [sx, sy] = shake(t, T.jet + .35, 11, .8), flash = Math.sin(clamp(k) * Math.PI), duck = out(win(t, T.jet + .2, T.jet + .5));
  return (<Frame bg="#0b1020"><Cam z={push(t, 'e2s11', 1, 1.06)} fx={540} fy={800} dx={sx} dy={sy - 80}>
    <StreetBack t={t} />
    <rect x={-200} y={1060} width={1480} height={900} fill="#151a2a" /><rect x={-200} y={1060} width={1480} height={12} fill="#2a3048" />
    {Array.from({ length: 6 }, (_, i) => <line key={i} x1={jx - 300} y1={jy + (i - 3) * 40 + 120} x2={jx - 980} y2={jy + (i - 3) * 40 + 380} stroke="#DCE0FF" strokeWidth={3} opacity={.18 * flash} />)}
    <Fighter x={jx} y={jy} s={1.5} rot={-16} t={t} /><Glow x={jx - 180} y={jy + 50} r={260} col="#FF9A40" a={.5 * flash} />
    {Array.from({ length: 11 }, (_, i) => { const x = -40 + i * 110, y = 1140 + (i % 3) * 40; return <g key={i} transform={`translate(0,${duck * 40}) rotate(${-duck * 12 * (i % 2 ? 1 : .6)},${x},${y})`}><Person x={x} y={y} s={1.6} t={t} pose={duck > .3 ? 'freeze' : 'look'} col={['#3a4252', '#523a32', '#2e3a30', '#3e3448'][i % 4]} dark={.6 - flash * .4} seed={i} torch={i % 4 === 1 ? 1 : 0} /></g>; })}
    <rect x={-200} y={-200} width={1480} height={2400} fill="#FFB060" opacity={.12 * flash} />
  </Cam></Frame>); };

// ───── 12. Проспект: толпа с фонариками, мёртвые светофоры, поток фар; панорама вправо ─────
export const AvenuePan: React.FC<S> = ({ t }) => { const u = t - a0('e2s12'), px = io(win(u, 0, 3.8)) * 260;
  return (<Frame bg="#0b1020"><Cam z={1.04} fx={540} fy={800} dx={-px} dy={-100}>
    <StreetBack t={t} px={px} />
    <rect x={-200} y={1000} width={1900} height={160} fill="#151a2a" />
    {[[-1, .06], [1, -.05], [-1, .04], [1, -.06], [-1, .05]].map(([d, sp], i) => <CarSide key={i} x={((i * 380 + u * sp * 600 * 0 + 2000) % 1900) - 200 + u * (sp as number) * 120} y={1100 + (i % 2) * 34} s={.62} dir={d as 1 | -1} col={['#30364a', '#4a3030', '#2c3a44', '#3a3a3a', '#44403a'][i]} taxi={i === 3} t={t} />)}
    <rect x={-200} y={1150} width={1900} height={800} fill="#1a1f30" />
    <TrafficLight x={560} y={1200} s={1.05} h={480} /><TrafficLight x={1240} y={1180} s={.9} h={470} />
    {Array.from({ length: 16 }, (_, i) => { const x = -120 + i * 110, y = 1240 + (i % 3) * 36; return <Person key={i} x={x + Math.sin(t + i) * 8} y={y} s={1.45} t={t + i} pose={i % 4 === 0 ? 'phone' : i % 3 ? 'look' : 'walk'} col={['#3a4252', '#523a32', '#2e3a30', '#3e3448', '#4a4a3a'][i % 5]} dark={.55} seed={i} torch={i % 3 === 1 ? 1 : 0} dir={i % 2 ? 1 : -1} face />; })}
  </Cam></Frame>); };

// ───── 13. Перекрёсток: люди перебегают прямо перед бампером, водитель сигналит ─────
export const Crossing: React.FC<S> = ({ t }) => { const u = t - a0('e2s13'), stop = out(win(t, T.horn - .5, T.horn - .1)), dip = t > T.horn - .2 ? Math.sin(clamp((t - T.horn + .2) / .5) * Math.PI) : 0, beep = win(t, T.horn, T.horn + 1.1), [sx] = shake(t, T.horn - .15, 6, .4);
  return (<Frame bg="#0b1020"><Cam z={push(t, 'e2s13', 1.02, 1.1)} fx={600} fy={860} dx={sx} dy={-120}>
    <StreetBack t={t} px={80} />
    <rect x={-200} y={1000} width={1480} height={900} fill="#151a2a" />{Array.from({ length: 8 }, (_, i) => <rect key={i} x={-100 + i * 160} y={1150} width={90} height={26} fill="#C9CCD3" opacity={.35} />)}
    <TrafficLight x={140} y={1100} s={1.1} h={520} />
    <CarSide x={lerp(-80, 420, stop)} y={1130} s={1.15} dir={1} col="#3a4a6a" dip={dip} driver={1} t={t} dark={.3} />
    {[0, 1, 2].map(i => { const q = clamp((u - .3 - i * .45) / 1.4), x = lerp(1180, 520 - i * 40, q); return <Person key={i} x={x} y={1170 + i * 18} s={1.9} t={t} pose="run" col={['#5a3a32', '#2e3a50', '#4a4a3a'][i]} dark={.25} seed={i} dir={-1} face torch={i === 1 ? 1 : 0} />; })}
    <Onomato x={760} y={760} text="БИ-И-ИП!" k={beep} rot={-6} />
  </Cam></Frame>); };

// ───── 14a. Диас бросается к такси с шашечкой ─────
export const TaxiRun: React.FC<S> = ({ t }) => { const u = t - a0('e2s14a'), run = out(win(u, 0, .45)), knock = t > T.knockGlass && t < T.knockGlass + .5, m = mouthOf(t, 'd02');
  return (<Frame bg="#0b1020"><Cam z={push(t, 'e2s14a', 1, 1.08)} fx={620} fy={860} dy={-140}>
    <StreetBack t={t} px={200} /><rect x={-200} y={1000} width={1480} height={900} fill="#151a2a" />
    <CarSide x={720} y={1170} s={1.25} dir={1} taxi head={.8} driver={1} t={t} dark={.25} />
    <Hero id="dias" x={lerp(80, 390, run)} y={1200} s={1.3} t={t} pose={run < 1 ? 'run' : knock ? 'knock' : 'stand'} phase={u * 11} dark={.3} turn={.5} />
  </Cam></Frame>); };
// ───── 14b. В окне такси — незнакомый старик; плечи Диаса опускаются ─────
export const TaxiStranger: React.FC<S> = ({ t }) => { const u = t - a0('e2s14b'), drop = out(win(u, .9, 1.5)), turn = out(win(u, .1, .5));
  return (<Frame bg="#0b1020"><Cam z={push(t, 'e2s14b', 1, 1.07)} fx={540} fy={820}>
    <StreetBack t={t} px={300} />
    <Character who="diasJ" x={360} y={900 + drop * 40} s={1.3} t={t} expr={drop > .4 ? 'worry' : 'fear'} look={[.5, .1]} turn={.3} duck={drop * .8} tilt={-drop * 4} shade={.35} under={.3} underCol="#FFE9A8" collarOpen lens={lensCars(t)}
      armL={{ to: L(360, 900, 1.3, lerp(560, 400, drop), lerp(820, 1200, drop)), pose: 'flat' }} armR={{ to: L(360, 900, 1.3, lerp(600, 480, drop), lerp(900, 1220, drop)), pose: 'flat' }} />
    <rect x={-200} y={-200} width={1480} height={2400} fill="#141a26" opacity={.32} />
    {[0, 1].map(i => <path key={i} d={`M${100 + i * 220},260 L${380 + i * 220},260 L${120 + i * 220},1300 L${-160 + i * 220},1300 Z`} fill="#fff" opacity={.06} />)}
    <path d="M-200,-200 L1280,-200 L1280,2200 L-200,2200 Z M40,300 Q40,240 100,240 L700,240 Q790,240 830,330 L900,1240 L40,1240 Z" fill="#9a7a22" fillRule="evenodd" /><path d="M40,300 Q40,240 100,240 L700,240 Q790,240 830,330 L900,1240 L40,1240 Z" fill="none" stroke="#1a1c22" strokeWidth={26} />
    <Character who="oldman" x={900} y={980} s={1.55} t={t} expr="grumpy" look={[-1, 0]} turn={lerp(.2, -.7, turn)} under={.4} underCol="#FFE9A8" shade={.3} armL={null} armR={null} />
    <Glow x={980} y={1300} r={300} col="#FFE9A8" a={.3} />
  </Cam></Frame>); };

// ───── 15. Алихан догоняет: «До Арбата минут двадцать»; умные часы Беки ─────
export const WatchesStreet: React.FC<S> = ({ t }) => { const u = t - a0('e2s15'), m = mouthOf(t, 'k01'), wr = out(win(u, .9, 1.3));
  return (<Frame bg="#0b1020"><Cam z={push(t, 'e2s15', 1, 1.07)} fx={540} fy={820} dy={-80}>
    <Blur px={8}><StreetBack t={t} px={400} /></Blur><rect x={-200} y={-200} width={1480} height={2400} fill="#0b1020" opacity={.25} />
    <Character who="alik" x={330} y={880} s={1.3} t={t} expr="grumpy" look={[.4, 0]} turn={.3} mouth={m} under={.25} shade={.4} armL={null} armR={{ to: L(330, 880, 1.3, 120, 600), pose: 'point' }} />
    <Character who="beka" x={800} y={920} s={1.25} t={t} expr="worry" look={[-.3, .7]} turn={-.2} shade={.4} under={.3} watchLit={1} armR={null} armL={{ to: L(800, 920, 1.25, lerp(700, 640, wr), lerp(1200, 900, wr)), pose: 'relax' }} />
    <g opacity={wr} transform={`translate(${640},${760}) scale(${lerp(.4, 1, wr)})`}><SmartWatch x={0} y={0} s={.9} t={t} pulse={128} /></g>
  </Cam></Frame>); };

// ───── 16. Сверху удары и скрежет: все резко оборачиваются, стоп-кадр с наездом ─────
export const TurnFreeze: React.FC<S> = ({ t }) => { const tf = Math.min(t, T.freeze), turn = spr(tf, T.turn, { damping: 13, stiffness: 180 }), frozen = t >= T.freeze, z = frozen ? lerp(1.04, 1.16, io(win(t, T.freeze, b0('e2s16')))) : 1.04;
  const row: [Who, number, number, number][] = [['alisher', 170, 960, 1.0], ['alik', 400, 930, 1.05], ['diasJ', 640, 920, 1.1], ['beka', 890, 950, 1.1]];
  return (<AbsoluteFill><Frame bg="#0b1020" filter={frozen ? 'saturate(.35) contrast(1.15)' : undefined}><Cam z={z} fx={540} fy={820} dy={-100}>
    <StreetBack t={tf} px={500} />{[0, 1, 2].map(i => <Glow key={i} x={980 + i * 30} y={560 + i * 20} r={60} col="#FFF6DA" a={.6 + .3 * Math.sin(tf * 30 + i)} />)}<circle cx={1000} cy={600} r={8} fill="#FFD23F" opacity={tf > T.crash1 ? .9 : 0} />
    {row.map(([who, x, y, s]) => <Character key={who} who={who} x={x} y={y} s={s} t={tf} expr={turn > .4 ? 'shock' : 'worry'} look={[lerp(-.2, 1, turn), lerp(.2, -.4, turn)]} turn={lerp(-.1, .7, turn)} tilt={turn * 5} collarOpen shade={.4} under={.2} armL={null} armR={null} />)}
  </Cam></Frame>{frozen && <AbsoluteFill style={{ border: `${lerp(40, 14, win(t, T.freeze, T.freeze + .2))}px solid rgba(244,241,234,.85)`, opacity: 1 - .6 * win(t, T.freeze + .1, T.freeze + .4) }} />}</AbsoluteFill>); };

// ───── 17. Вниз по склону — самосвал: фары растут, искры о припаркованные машины, люди разбегаются ─────
export const TruckDown: React.FC<S> = ({ t }) => { const u = t - a0('e2s17'), p = io(clamp(u / 3.2)), vy = 420, sc = lerp(.16, 1.0, p * p), y = lerp(vy + 60, 1500, p * p), sway = Math.sin(u * 3.2) * 50 * p, [sx, sy] = shakeMany(t, [[T.sparks, 10, .4], [T.sparks + .7, 10, .4]]);
  const hitCar = (t0: number) => t > t0 ? Math.exp(-(t - t0) * 4) : 0;
  return (<Frame bg="#070a14"><Cam z={1.03} fx={540} fy={900} dx={sx} dy={sy}>
    <StreetBack t={t} hill={140} />
    <path d={`M500,${vy} L580,${vy} L1500,1950 L-420,1950 Z`} fill="#141826" /><path d={`M540,${vy} L540,1950`} stroke="#c8c8dc" strokeOpacity={.15} strokeWidth={8} strokeDasharray="50 60" />
    {[0, 1, 2].map(i => { const q = .3 + i * .22, cy = lerp(vy, 1700, q * q), cs = lerp(.16, 1.1, q * q), h = hitCar(T.sparks + i * .35); return <g key={i} transform={`translate(${Math.sin(t * 50) * 12 * h},0)`}><CarSide x={lerp(580, 1250, q * q)} y={cy} s={cs * .8} dir={-1} col={['#30364a', '#4a3030', '#3a3a3a'][i]} head={0} t={t} /></g>; })}
    <Truck x={540 + sway} y={y} s={sc} t={t} rot={Math.sin(u * 3.2) * 4} />
    {[T.sparks, T.sparks + .35, T.sparks + .7].map((t0, j) => { const q = t - t0; return q > 0 && q < .6 ? Array.from({ length: 14 }, (_, i) => { const a = -Math.PI / 2 + (i - 7) * .2, d = q * (300 + i * 20); return <circle key={j + '_' + i} cx={540 + sway + 240 * sc + Math.cos(a) * d} cy={y - 200 * sc + Math.sin(a) * d + q * q * 900} r={5} fill="#FFD23F" opacity={1 - q / .6} />; }) : null; })}
    {Array.from({ length: 6 }, (_, i) => { const q = clamp((u - .4 - i * .2) / 1.6); return <Person key={i} x={lerp(360 + (i % 2) * 360, i % 2 ? 1100 : -60, q)} y={1300 + (i % 3) * 60} s={1.5} t={t} pose="run" col={['#3a4252', '#523a32', '#2e3a30'][i % 3]} dark={.5} seed={i} dir={i % 2 ? 1 : -1} />; })}
  </Cam></Frame>); };

// ───── 18. Кабина: водитель жмёт тормоз — педаль в пол, приборка мигает ─────
export const Cab: React.FC<S> = ({ t }) => { const u = t - a0('e2s18'), press = out(win(t, T.pedal, T.pedal + .25)), sink = t > T.pedal + .3 ? out(win(t, T.pedal + .3, T.pedal + .8)) : 0, blink = Math.sin(t * 22) > 0, [hx, hy, hr] = handheld(t, 9, 'cab'), [sx, sy] = shake(t, T.pedal, 8, .5);
  return (<Frame bg="#05060a"><Cam z={push(t, 'e2s18', 1.02, 1.1)} fx={540} fy={760} dx={hx + sx} dy={hy + sy} rot={hr}>
    <rect x={-200} y={-200} width={1480} height={2400} fill="#0b0d14" />
    <path d="M40,300 L1040,300 L1000,820 L80,820 Z" fill="#101626" /><g><clipPath id="cabWs"><path d="M40,300 L1040,300 L1000,820 L80,820 Z" /></clipPath><g clipPath="url(#cabWs)"><path d="M520,520 L560,520 L1100,900 L-20,900 Z" fill="#1a1f30" />
      {[0, 1, 2, 3].map(i => <Hero key={i} id={(['alisher', 'alik', 'dias', 'beka'] as const)[i]} x={470 + i * 40} y={700} s={.3} t={t} pose="freeze" lit={1} />)}<Glow x={540} y={680} r={360} col="#FFF6DA" a={.25} /></g></g>
    <rect x={20} y={280} width={1040} height={40} fill="#1a1c24" /><rect x={-200} y={820} width={1480} height={1200} fill="#16181f" />
    <Character who="driver" x={540} y={760} s={1.35} t={t} expr="shock" mouth={.25 + .1 * Math.sin(t * 15)} look={[0, -.1]} tilt={Math.sin(t * 9) * 3} under={.4} underCol="#FFF6DA" shade={.3}
      armL={{ to: L(540, 760, 1.35, 330 + Math.sin(t * 13) * 30, 1010), pose: 'grip' }} armR={{ to: L(540, 760, 1.35, 750 + Math.sin(t * 13) * 30, 1010), pose: 'grip' }} />
    <g transform={`translate(540,1060) rotate(${Math.sin(t * 13) * 22})`}><circle r={250} fill="none" stroke="#202228" strokeWidth={44} /><rect x={-250} y={-14} width={500} height={28} fill="#202228" /><circle r={46} fill="#202228" /></g>
    <g transform="translate(0,0)">{[[200, '#E5383B'], [880, '#F2B33D']].map(([x, c], i) => <g key={i}><circle cx={x as number} cy={940} r={80} fill="#0a0b10" stroke="#2a2c34" strokeWidth={8} /><line x1={x as number} y1={940} x2={(x as number) + Math.cos(-2.6 + (blink ? .3 : 2.4)) * 66} y2={940 + Math.sin(-2.6 + (blink ? .3 : 2.4)) * 66} stroke="#F4F1EA" strokeWidth={6} /><circle cx={(x as number) + 40} cy={1000} r={12} fill={blink ? c as string : '#2a1010'} />{blink && <Glow x={(x as number) + 40} y={1000} r={50} col={c as string} a={.8} />}</g>)}</g>
    <g transform="translate(760,430)"><rect x={0} y={0} width={260} height={300} rx={26} fill="rgba(11,16,32,.9)" stroke="#E5383B" strokeWidth={5} /><rect x={30} y={250} width={200} height={14} fill="#3a3c44" />
      <g transform={`translate(130,${lerp(110, 150, press) + sink * 90}) rotate(${-20 + sink * 10})`}><rect x={-60} y={-16} width={120} height={32} rx={8} fill="#5a5c64" /><rect x={-14} y={-140} width={28} height={130} fill="#3a3c44" /></g>
      <path d={`M60,${lerp(20, 60, press) + sink * 90} L180,${lerp(60, 100, press) + sink * 90} L200,${lerp(110, 150, press) + sink * 90} L80,${lerp(90, 130, press) + sink * 90} Z`} fill="#2a2420" />
      {sink > .5 && <text x={130} y={50} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={C.danger}>ТОРМОЗ</text>}</g>
  </Cam></Frame>); };

// ───── 19. Четверо застыли посреди перекрёстка, фары в лоб, блик-полоса ─────
export const Headlights: React.FC<S> = ({ t }) => { const u = t - a0('e2s19'), k = io(clamp(u / 2.2)), [sx, sy] = [Math.sin(t * 50) * 6 * k, Math.cos(t * 41) * 5 * k];
  const row: [Who, number, number, number][] = [['alisher', 190, 900, 1.0], ['alik', 410, 880, 1.05], ['diasJ', 650, 870, 1.1], ['beka', 890, 900, 1.1]];
  return (<AbsoluteFill><Frame bg="#05070e"><Cam z={lerp(1.0, 1.12, k)} fx={540} fy={760} dx={sx} dy={sy - 60}>
    <rect x={-200} y={-200} width={1480} height={2400} fill="#0b1020" />
    {row.map(([who, x, y, s]) => <Character key={who} who={who} x={x} y={y} s={s} t={t} expr="fear" look={[0, 0]} collarOpen under={.6 + k * .4} underCol="#FFFFFF" shade={.25 - k * .2} armL={null} armR={null} blinkOff mouth={.15} />)}
    {[-1, 1].map(sd => <Glow key={sd} x={540 + sd * lerp(140, 260, k)} y={lerp(1060, 980, k)} r={lerp(120, 520, k)} col="#FFFFFF" a={.9} />)}
    <rect x={-200} y={lerp(1000, 960, k) - 6 - 20 * k} width={1480} height={12 + 40 * k} fill="#FFFFFF" opacity={.35 + .4 * k} style={{ filter: 'blur(10px)' }} />
  </Cam></Frame><AbsoluteFill style={{ background: '#fff', opacity: .1 + .5 * k * k }} /></AbsoluteFill>); };
// ───── 20–21. Белый кадр: фары, секунда тишины, шёпот ─────
export const White: React.FC<S> = ({ t }) => { const k = clamp((t - T.white) / .4);
  return (<AbsoluteFill style={{ background: '#fff' }}><svg viewBox="0 0 1080 1920" width="100%" height="100%">{[-1, 1].map(sd => <circle key={sd} cx={540 + sd * 280} cy={900} r={420} fill="#FFFDF2" opacity={1 - k} />)}</svg>
    <AbsoluteFill style={{ background: `rgba(${lerp(255, 225, clamp((t - T.white - 1.0) / 1.5))},${lerp(255, 228, clamp((t - T.white - 1.0) / 1.5))},${lerp(255, 236, clamp((t - T.white - 1.0) / 1.5))},1)`, opacity: .9 }} /></AbsoluteFill>); };
export { mix };
