// Планы серии 1 v3. Каждый план получает глобальное время t (с). Геометрия кухни общая: угол Алихана слева,
// стол с клеёнкой в центре (Бека), гладильная доска у окна справа (Диас) — утюг НЕ на обеденном столе.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { clamp, ease, handheld, io, lerp, mix, out, shake, shakeMany, spr, win } from '../anim';
import { C, FONT } from '../theme';
import { Character, Who, Arm } from '../char/Character';
import { Hand } from '../char/Hand';
import { DarkFilter, Doshirak, Glow, Iron, IroningBoard, KitchenBack, Kettle, Monitor, Mug, PhoneDevice, Router, Table } from '../bg/Kitchen';
import { Car, Cathedral, HotelTower, KokTobe, Mountains, NurlyTau, Person, Sky, StreetLamp, Tree, Zhk } from '../bg/City';
import { FacadeCorner, Fighter, Hallway } from '../bg/Exterior';
import { BlackoutMap, Footage, News, TvSet } from '../ui/Tv';
import { ChatList, PhoneBig, Spinner, AruzhanAvatar } from '../ui/Phone';
import { Cam, Frame, GlitchBars } from '../ui/Overlays';
import { anchorMouth, CITY, HOOK_K, KNOCK_AT, KNOCKS, MAP_OFF, mouthOf, OUT, REWIND } from './data';

type S = { t: number };
// локальные координаты руки персонажа: цель в кадре → в системе персонажа (основание шеи, масштаб)
const L = (cx: number, cy: number, s: number, wx: number, wy: number): [number, number] => [(wx - cx) / s, (wy - cy) / s];
const push = (t: number, a: number, b: number, z0 = 1, z1 = 1.08) => lerp(z0, z1, io(win(t, a, b)));
const Bang: React.FC<{ t: number; t0: number; x: number; y: number }> = ({ t, t0, x, y }) => { const k = spr(t, t0, { damping: 9 }); if (t < t0 || t > t0 + 1.4) return null;
  return <text x={x} y={y} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={130} fill="#FFD23F" stroke={C.ink} strokeWidth={18} paintOrder="stroke" transform={`translate(${x},${y}) scale(${k}) translate(${-x},${-y})`}>!</text>; };
const Beam: React.FC<{ x: number; y: number; tx: number; ty: number; w?: number; k?: number }> = ({ x, y, tx, ty, w = 330, k = 1 }) => { const a = Math.atan2(ty - y, tx - x), nx = -Math.sin(a), ny = Math.cos(a), id = `bm${Math.round(x)}${Math.round(tx)}`;
  return (<g style={{ mixBlendMode: 'screen' }} opacity={k}><defs><linearGradient id={id} gradientUnits="userSpaceOnUse" x1={x} y1={y} x2={tx} y2={ty}><stop offset="0" stopColor="#FFF6DE" stopOpacity={.55} /><stop offset="1" stopColor="#FFF6DE" stopOpacity={.08} /></linearGradient></defs>
    <path d={`M${x + nx * 8},${y + ny * 8} L${tx + nx * w},${ty + ny * w} L${tx - nx * w},${ty - ny * w} L${x - nx * 8},${y - ny * 8} Z`} fill={`url(#${id})`} style={{ filter: 'blur(6px)' }} /><Glow x={tx} y={ty} r={w * 1.2} col="#FFF6DE" a={.6} /><Glow x={x} y={y} r={50} col="#FFFFFF" a={.9} /></g>); };
const Blur: React.FC<{ px: number; children: React.ReactNode }> = ({ px, children }) => <g style={{ filter: `blur(${px}px)` }}>{children}</g>;

// ───── 1. Хук: 20:03, прихожая, удары в дверь; на «пять» перемотка → тёплый свет 19:58 ─────
export const Hook: React.FC<S> = ({ t }) => { const rw = win(t, REWIND[0], REWIND[1]), dark = 1 - io(rw), hit = HOOK_K.reduce((a, k) => { const u = t - k; if (u < 0 || u > .3) return a; const e = Math.exp(-u * 14); return { dx: a.dx + Math.sin(u * 80) * 18 * e, dy: a.dy + Math.cos(u * 60) * 6 * e, sc: a.sc * (1 + .022 * e) }; }, { dx: 0, dy: 0, sc: 1 });
  const [sx, sy] = shakeMany(t, HOOK_K.map(k => [k, 8, .3] as [number, number, number]));
  return (<AbsoluteFill><Frame><Cam z={push(t, 0, 3, 1, 1.06)} fx={570} fy={900} dx={sx} dy={sy}>
    <defs><DarkFilter id="hookDk" k={dark} /></defs><g filter="url(#hookDk)"><Hallway hit={t < REWIND[0] ? hit : undefined} /></g>
    {dark > .1 && <g opacity={dark}><Beam x={150} y={1560} tx={560 + Math.sin(t * 23) * 10 + sx} ty={850} k={1} /><g transform="translate(120,1640) rotate(-50)"><Hand side={1} skin="#9a7058" shade="#6a4a38" pose="grip" s={2.4} hold={<PhoneDevice x={0} y={0} s={1.2} back torch={1} />} /></g></g>}
    {t < REWIND[0] && HOOK_K.map(k => { const u = t - k; return u > 0 && u < .7 ? Array.from({ length: 6 }, (_, i) => <circle key={k + '' + i} cx={420 + i * 55 + u * (i - 3) * 40} cy={370 + u * u * 500} r={5 + i % 3} fill="#bdb3a0" opacity={(1 - u / .7) * .8 * dark} />) : null; })}
    {t > REWIND[1] && <rect x={-200} y={-200} width={1480} height={2400} fill="#FFB060" opacity={.08} />}
  </Cam></Frame>
    {rw > 0 && rw < 1 && <AbsoluteFill style={{ pointerEvents: 'none' }}>{Array.from({ length: 7 }, (_, i) => <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: ((i * 331 + t * 5000) % 1920), height: 10 + (i % 3) * 18, background: 'rgba(230,236,255,.3)', opacity: Math.sin(rw * Math.PI) }} />)}
      <div style={{ position: 'absolute', left: 320, top: 690, width: 380, height: 380, borderRadius: 190, background: 'rgba(11,16,32,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 190, color: C.text, opacity: Math.sin(rw * Math.PI) }}>◀◀</div></AbsoluteFill>}
    <GlitchBars t={t} k={t >= REWIND[0] && t < REWIND[0] + 4 / 30 ? 1 : 0} /></AbsoluteFill>); };
// ───── 2. Угол сталинки ─────
export const Facade: React.FC<S> = ({ t }) => (<Frame><Cam z={push(t, 3, 6, 1, 1.07)} fx={540} fy={500}><FacadeCorner t={t} /><rect x={-200} y={-200} width={1480} height={2400} fill="#FFB060" opacity={.06} /></Cam></Frame>);
// ───── кухня: общий план ─────
const POS = { beka: [440, 930, .9] as const, alik: [250, 880, .88] as const, dias: [930, 860, .92] as const };
type KOpts = { t: number; on?: number; swing?: number; pour?: number; jump?: number[]; duck?: number; expr?: Partial<Record<'beka' | 'alik' | 'dias', any>>; phones?: number; outfit?: Who; routerLost?: boolean; ironX?: number };
const KitchenWide: React.FC<KOpts> = ({ t, on = 1, swing = 0, pour = 0, jump = [0, 0, 0, 0], duck = 0, expr = {}, phones = 0, outfit = 'diasT', routerLost = false, ironX = 0 }) => {
  const [bx, by, bs] = POS.beka, [ax, ay, as] = POS.alik, [dx, dy, ds] = POS.dias, ph = (wx: number, wy: number) => <PhoneDevice x={0} y={0} s={1.1} screen={1} />;
  const boxes = [[330, 1112], [450, 1100], [570, 1112]];
  const kt = pour > 0 && pour < 1, ix = 900 + ironX;
  return (<g><KitchenBack t={t} on={on} swing={swing} routerLost={routerLost} pcOn={on} outside={on} />
    <Character who="alik" x={ax} y={ay} s={as} t={t} expr={expr.alik ?? 'focus'} look={[-1, .1]} turn={-.6} duck={duck} under={phones * .7} shade={on > 0 ? 0 : .7}
      armL={{ to: L(ax, ay, as, 170, 1030), pose: 'flat' }} armR={phones ? { to: L(ax, ay, as, 300, 1000), pose: 'grip', hold: <PhoneDevice x={0} y={0} s={1.1} screen={1} /> } : { to: L(ax, ay, as, 230, 1040), pose: 'flat' }} />
    <Character who="beka" x={bx} y={by} s={bs} t={t} expr={expr.beka ?? 'smile'} look={kt ? [.2, .9] : [.1, .3]} duck={duck} under={phones * .7} shade={on > 0 ? 0 : .7} part="body" />
    <IroningBoard x={880} y={1010} s={.82} />
    <Character who={outfit} x={dx} y={dy} s={ds} t={t} expr={expr.dias ?? 'neutral'} look={[-.3, .9]} duck={duck} under={phones * .7} shade={on > 0 ? 0 : .7} collarOpen
      armL={{ to: L(dx, dy, ds, 760, 1005), pose: 'flat' }} armR={phones ? { to: L(dx, dy, ds, 860, 960), pose: 'grip', hold: <PhoneDevice x={0} y={0} s={1.1} screen={1} /> } : { to: L(dx, dy, ds, ix, 985), pose: 'grip' }} />
    {!phones && <Iron x={ix + 10} y={990} s={.5} on={on} steam={on ? .6 : 0} t={t} />}
    <Table y={1040} x0={150} x1={760} drop={800} />
    {boxes.map(([x, y], i) => <Doshirak key={i} x={x} y={y - (jump[i] ?? 0)} s={.62} open={pour > (i + .5) / 3 || pour === 0} t={t} steam={on > 0 && (pour > (i + .7) / 3 || pour === 0) ? 1 : 0} fork={pour === 0 ? 1 : 0} />)}
    <Mug x={680} y={1106 - (jump[3] ?? 0)} s={.48} t={t} />
    <Character who="beka" x={bx} y={by} s={bs} t={t} part="arms" shade={on > 0 ? 0 : .7}
      armL={{ to: L(bx, by, bs, 360, 1080), pose: 'relax' }} armR={kt ? { to: L(bx, by, bs, lerp(330, 590, pour) + 60, 990), pose: 'grip', flip: 1, hold: <g><Kettle x={10} y={-10} s={.55} rot={-60} /></g> } : phones ? { to: L(bx, by, bs, 520, 1010), pose: 'grip', hold: <PhoneDevice x={0} y={0} s={1.1} screen={1} /> } : { to: L(bx, by, bs, 520, 1085), pose: 'relax' }} />
    {kt && <path d={`M${lerp(330, 590, pour) + 20},1010 Q${lerp(330, 590, pour) + 10},1040 ${boxes[Math.min(2, Math.floor(pour * 3))][0]},1052`} stroke="#DDEBFF" strokeWidth={6} fill="none" opacity={.85} />}
  </g>); };
export const KitchenPour: React.FC<S> = ({ t }) => (<Frame><Cam z={push(t, 6, 7.9, 1.0, 1.05)} fx={540} fy={1000} dy={-230}><KitchenWide t={t} pour={win(t, 6.15, 7.3)} expr={{ alik: 'focus', beka: 'smile', dias: 'neutral' }} ironX={Math.sin(t * 3) * 40} /></Cam></Frame>);
// ───── 4. Три панели-комикса: ЗУБРИТ / ЛИСТАЕТ / ГЛАДИТ ─────
const Panel: React.FC<{ x: number; t: number; t0: number; label: string; children: React.ReactNode }> = ({ x, t, t0, label, children }) => { const k = out(win(t, t0, t0 + .3));
  return (<g opacity={k} transform={`translate(0,${(1 - k) * 60})`}><clipPath id={`pn${x}`}><rect x={x} y={430} width={300} height={700} rx={14} /></clipPath><g clipPath={`url(#pn${x})`}><rect x={x} y={430} width={300} height={700} fill="#D9C29C" />{children}</g>
    <rect x={x} y={430} width={300} height={700} rx={14} fill="none" stroke={C.ink} strokeWidth={8} /><rect x={x + 14} y={444} width={label.length * 30 + 30} height={58} fill="#FFD23F" stroke={C.ink} strokeWidth={4} /><text x={x + 29} y={486} fontFamily={FONT} fontWeight={900} fontSize={40} fill={C.ink}>{label}</text></g>); };
export const Split: React.FC<S> = ({ t }) => { const sw = Math.sin(t * 3.2), f = (Math.sin(t * 2.6) + 1) / 2;
  return (<Frame bg="#F4F1EA"><Panel x={60} t={t} t0={7.9} label="ЗУБРИТ"><Monitor x={150} y={640} s={.72} t={t} /><Glow x={150} y={640} r={220} col="#7FB3FF" a={.4} />
    <Character who="alik" x={250} y={960} s={.82} t={t} expr="focus" look={[-1, -.2]} turn={-.6} armR={null} armL={{ to: L(250, 960, .82, lerp(150, 215, f), lerp(1080, 900, f)), pose: 'grip', hold: <rect x={-3} y={-60} width={6} height={60} fill="#C9CDD6" /> }} /></Panel>
    <Panel x={390} t={t} t0={8.0} label="ЛИСТАЕТ"><Character who="beka" x={540} y={950} s={.86} t={t} expr="smile" look={[0, 1]} under={.6} armL={null} armR={{ to: L(540, 950, .86, 560, 1020), pose: 'grip', hold: <PhoneDevice x={0} y={0} s={1.4} screen={1} /> }} /><rect x={540 + Math.sin(t * 8) * 4} y={980} width={6} height={24} fill="#fff" opacity={.8} /></Panel>
    <Panel x={720} t={t} t0={8.1} label="ГЛАДИТ"><Character who="diasT" x={880} y={900} s={.86} t={t} expr="neutral" look={[-.2, 1]} armL={null} armR={{ to: L(880, 900, .86, 840 + sw * 50, 1040), pose: 'grip' }} />
      <IroningBoard x={870} y={1080} s={.6} /><Iron x={850 + sw * 50} y={1062} s={.42} steam={1} t={t} /></Panel></Frame>); };
// ───── 5. Алихан за компьютером ─────
export const AlikPC: React.FC<S> = ({ t }) => { const f = ((t - 10.3) * .7) % 1, up = Math.sin(f * Math.PI) ** 2, m = mouthOf(t, 'a01');
  return (<Frame bg="#D9C29C"><Cam z={push(t, 10.3, 14, 1, 1.08)} fx={520} fy={900}>
    <rect x={-200} y={-200} width={1480} height={2400} fill="#D9C29C" /><Blur px={6}><Character who="beka" x={900} y={860} s={.78} t={t} expr="smile" look={[0, 1]} under={.6} armL={null} armR={{ to: L(900, 860, .78, 920, 960), pose: 'grip', hold: <PhoneDevice x={0} y={0} s={1.1} screen={1} /> }} /></Blur>
    <rect x={-100} y={1080} width={900} height={28} fill="#6B4A32" /><Monitor x={250} y={720} s={1.55} t={t} /><Glow x={250} y={700} r={560} col="#7FB3FF" a={.45} /><rect x={330} y={1060} width={260} height={24} rx={6} fill="#2a2c34" />
    <Character who="alik" x={700} y={1010} s={1.45} t={t} expr="grumpy" mouth={m > .05 ? m : up > .85 ? .3 : 0} look={[-1, -.1]} turn={-.7} under={.4}
      armR={{ to: L(700, 1010, 1.45, 470 + Math.sin(t * 20) * 6, 1068), pose: 'flat' }} armL={{ to: L(700, 1010, 1.45, lerp(520, 600, up), lerp(1150, 930, up)), pose: 'grip', hold: <g><rect x={-3} y={-74} width={6} height={74} fill="#C9CDD6" />{up > .4 && <path d="M0,-74 q-10,20 4,40 q-10,10 -4,26" stroke="#E9C46A" strokeWidth={4} fill="none" />}</g> }} />
    <Doshirak x={470} y={1150} s={.85} t={t} steam={1} /></Cam></Frame>); };
// ───── 6. Диас гладит, телефон вибрирует на подоконнике ─────
export const DiasIron: React.FC<S> = ({ t }) => { const sw = Math.sin((t - 14) * 3.4), buzz = t > 14.9 && t < 15.7 ? Math.sin(t * 90) * 5 : 0, turn = out(win(t, 15.1, 15.4));
  return (<Frame><Cam z={push(t, 14, 15.9, 1.05, 1.12)} fx={600} fy={900} dy={-80}><KitchenBack t={t} />
    <Character who="diasT" x={560} y={900} s={1.4} t={t} expr="smile" look={[lerp(-.2, .8, turn), lerp(.9, .3, turn)]} turn={lerp(0, .4, turn)} part="body" />
    <IroningBoard x={560} y={1150} s={1.25} /><PhoneDevice x={930 + buzz} y={1040} s={1.6} rot={80} screen={t > 14.9 ? 1 : 0} />
    <Character who="diasT" x={560} y={900} s={1.4} t={t} part="arms" armL={{ to: L(560, 900, 1.4, 330, 1140), pose: 'flat' }} armR={{ to: L(560, 900, 1.4, 520 + sw * 120, 1110), pose: 'grip' }} />
    <Iron x={530 + sw * 120} y={1118} s={.8} steam={1} t={t} /></Cam></Frame>); };
// ───── лицо Диаса с телефоном: экран отражается в очках ─────
const lensScreen = (fail = false) => (cx: number, cy: number, w: number, h: number) => (<g><rect x={cx - w * .32} y={cy - h * .22} width={w * .52} height={h * .74} fill="#7FB3FF" opacity={.6} /><rect x={cx - w * .24} y={cy - h * .05} width={w * .32} height={h * .1} fill="#fff" opacity={.65} /><rect x={cx - w * .24} y={cy + h * .14} width={w * .24} height={h * .1} fill={fail ? '#E5383B' : '#fff'} opacity={.8} /></g>);
export const DiasFace: React.FC<S & { outfit?: Who; expr?: any; look?: [number, number]; lit?: number; mouth?: number; collar?: boolean; ear?: number; closed?: boolean; fail?: boolean }> = ({ t, outfit = 'dias', expr = 'neutral', look = [0, .6], lit = 1, mouth = 0, collar, ear = 0, closed, fail }) => {
  const s = 2.5, cx = 540, cy = 1190, k = out(ear);
  return (<Frame><Cam z={push(t, 0, 1, 1, 1)}><Blur px={10}><Cam z={1.5} fx={540} fy={520}><KitchenBack t={t} /></Cam></Blur><rect x={-200} y={-200} width={1480} height={2400} fill="#0B1020" opacity={.2} />
    <Character who={outfit} x={cx} y={cy} s={s} t={t} expr={expr} look={look} mouth={mouth} under={lit * .8} lens={lensScreen(fail)} blinkOff={closed ? false : undefined} collarOpen={collar}
      armL={null} armR={ear > 0 ? { to: L(cx, cy, s, lerp(860, 700, k), lerp(1500, 1000, k)), pose: 'grip', flip: 1, hold: <PhoneDevice x={0} y={0} s={1.1} back /> } : collar ? { to: L(cx, cy, s, 560, 1240), pose: 'grip', flip: 1 } : null} />
    {lit > 0 && !ear && <Glow x={540} y={1560} r={520} col="#7FB3FF" a={.35 * lit} />}</Cam></Frame>); };
export const ChatIn: React.FC<S> = ({ t }) => (<AbsoluteFill><Frame bg="#C9AD80"><Blur px={12}><Cam z={1.8} fx={540} fy={520}><KitchenBack t={t} /></Cam></Blur><rect x={-10} y={-10} width={1100} height={1940} fill="#0B1020" opacity={.35} /></Frame>
  <PhoneBig t={t} time="19:59" header={{ name: 'Аружан', sub: 'в сети' }}><ChatList t={t} msgs={[{ text: 'Уже в такси', icon: 'taxi' }, { text: 'Буду у кафе через 15 мин', accent: true, k: out(win(t, 17.7, 17.95)) }]} /></PhoneBig></AbsoluteFill>);
export const ChatSend: React.FC<S> = ({ t }) => { const typed = 'Выхожу через 5 минут', n = Math.floor(clamp((t - 19.05) / .6) * typed.length), sent = t > 19.85;
  return (<AbsoluteFill><Frame bg="#C9AD80"><Blur px={12}><Cam z={1.8} fx={540} fy={520}><KitchenBack t={t} /></Cam></Blur><rect x={-10} y={-10} width={1100} height={1940} fill="#0B1020" opacity={.35} /></Frame>
    <PhoneBig t={t} time="20:00" header={{ name: 'Аружан', sub: 'в сети' }} thumbAt={[19.85]} thumbXY={[800, 1240]}><ChatList t={t} msgs={[{ text: 'Буду у кафе через 15 мин', accent: true }, ...(sent ? [{ text: typed, mine: true, icon: 'smile' as const, ticks: (t > 20.35 ? 2 : 1) as 1 | 2, k: out(win(t, 19.85, 20.05)) }] : [])]} input={sent ? '' : typed.slice(0, n) + (Math.floor(t * 4) % 2 ? '|' : '')} /></PhoneBig></AbsoluteFill>); };
// ───── 9. Предвестие: рябь, вилка, календарь, стекло ─────
export const Ripple: React.FC<S> = ({ t }) => { const k = win(t, 22, 25), j = Math.sin(t * 70) * 3 * k, wall = Math.sin(t * 50) * 4 * k;
  return (<Frame><Cam z={push(t, 22, 25, 1, 1.1)} fx={540} fy={900} dx={Math.sin(t * 60) * 3 * k}><rect x={-200} y={-200} width={1480} height={2400} fill="#E2C99C" />
    <g transform={`translate(${wall},0)`}><rect x={640} y={430} width={260} height={290} fill="#F4F1EA" /><rect x={640} y={430} width={260} height={76} fill="#C8372E" /><text x={770} y={484} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill="#fff">НОЯБРЬ</text>{Array.from({ length: 15 }, (_, i) => <rect key={i} x={656 + (i % 5) * 48} y={528 + Math.floor(i / 5) * 58} width={32} height={30} fill="rgba(30,30,40,.22)" />)}</g>
    <g transform={`translate(${wall * .5},0)`}><rect x={90} y={380} width={420} height={360} rx={6} fill="#1a2140" stroke="#F4F1EA" strokeWidth={14} /><line x1={300} y1={380} x2={300} y2={740} stroke="#F4F1EA" strokeWidth={8} />{[0, 1, 2].map(i => <path key={i} d={`M110,${430 + i * 100} q90,${Math.sin(t * 40 + i) * 8 * k} 180,0`} stroke="#9fb6ff" strokeWidth={2} fill="none" opacity={.4 * k} />)}</g>
    {Array.from({ length: 5 }, (_, i) => <path key={i} d={`M0,${800 + i * 20} ` + Array.from({ length: 28 }, (_, x) => `L${x * 40},${800 + i * 20 + Math.sin(t * 40 + i + x * .5) * 6 * k}`).join(' ')} stroke="#5A3C28" strokeWidth={2} fill="none" opacity={.18 * k} />)}
    <Table y={820} x0={-120} x1={1200} drop={1200} /><Doshirak x={720 + j} y={1010} s={1.9} t={t} fork={k * 1.5} steam={.6} /><Mug x={330} y={1020 + j * .5} s={1.9} t={t} ripple={.3 + .7 * k} jitter={j} />
    {k > .4 && Array.from({ length: 10 }, (_, i) => { const ph = (t * .8 + i / 10) % 1; return <circle key={i} cx={100 + i * 95} cy={ph * 900} r={2 + i % 3} fill="#d9cbb0" opacity={.6 * (k - .4)} />; })}</Cam></Frame>); };
// ───── 10. Истребитель над крышами ─────
export const Jet: React.FC<S> = ({ t }) => { const k = win(t, 25.1, 26.7), jx = lerp(-560, 1640, k), jy = lerp(1380, 120, k), [sx, sy] = shake(t, 25.85, 10, .6);
  const VP = [540, -2200]; const side = (xb0: number, xb1: number, ytop: number, col: string) => { const at = (xb: number, y: number) => xb + (VP[0] - xb) * (2020 - y) / (2020 - VP[1]);
    return (<g><path d={`M${xb0},2020 L${at(xb0, ytop)},${ytop} L${at(xb1, ytop)},${ytop} L${xb1},2020 Z`} fill={col} /><path d={`M${at(xb0, ytop) - 20},${ytop - 34} L${at(xb1, ytop) + 20},${ytop - 34} L${at(xb1, ytop)},${ytop} L${at(xb0, ytop)},${ytop} Z`} fill={mix(col, '#ffffff', .14)} />
      {Array.from({ length: 7 }, (_, r) => Array.from({ length: 3 }, (_, c) => { const y = 1850 - r * 190, x = lerp(xb0, xb1, (c + .5) / 3); if (y - 120 < ytop) return null; const px = at(x, y), on = Math.sin(r * 9 + c * 3 + xb0) > -.6;
        return <g key={r + '_' + c}><rect x={px - 34} y={y - 110} width={68} height={100} rx={4} fill={on ? '#F2B33D' : '#141a2c'} />{on && <><rect x={px - 34} y={y - 108} width={16} height={98} fill="#96402a" opacity={.5} /><Glow x={px} y={y - 60} r={90} col="#F2B33D" a={.3} /></>}</g>; }))}</g>); };
  return (<Frame><Cam z={push(t, 25, 27.4, 1, 1.05)} fx={540} fy={900} dx={sx} dy={sy}><Sky t={t} glow={1.2} />{side(-300, 380, 520, '#6E5946')}{side(720, 1380, 620, '#5A4838')}
    {Array.from({ length: 6 }, (_, i) => <line key={i} x1={jx - 330} y1={jy + (i - 3) * 50 + 180} x2={jx - 980} y2={jy + (i - 3) * 50 + 540} stroke="#DCE0FF" strokeWidth={3} opacity={.16 * Math.sin(k * Math.PI)} />)}
    <Fighter x={jx} y={jy} s={lerp(.95, 1.4, Math.sin(k * Math.PI))} rot={-29} t={t} /></Cam></Frame>); };
export const Chaos: React.FC<S> = ({ t }) => { const u = t - 27.4, [sx, sy] = shake(t, 27.4, 10, .7), jp = (i: number) => 70 * Math.max(0, Math.sin((u * 8 + i) * Math.PI)) * Math.exp(-u * 1.3);
  return (<Frame><Cam z={1.03} fx={540} fy={1000} dx={sx} dy={sy - 230}><KitchenWide t={t} swing={14 * Math.sin(u * 6) * Math.exp(-u * .7)} jump={[jp(0), jp(.4), jp(.8), jp(.2)]} duck={.6} expr={{ alik: 'shock', beka: 'shock', dias: 'shock' }} outfit="dias" />
    <Bang t={t} t0={27.5} x={160} y={620} /><Bang t={t} t0={27.62} x={960} y={600} /></Cam></Frame>); };
export const DiasFrozen: React.FC<S> = ({ t }) => (<Frame><Cam z={push(t, 29, 31, 1, 1.08)} fx={540} fy={820}><Blur px={5}><Cam z={1.35} fx={540} fy={560}><KitchenBack t={t} swing={8 * Math.sin(t * 5) * Math.exp(-(t - 29) * .8)} /></Cam></Blur>
  <Character who="dias" x={500} y={1140} s={1.9} t={t} expr="shock" mouth={Math.max(mouthOf(t, 'd01'), .1)} look={[-.2, -.8]} collarOpen armL={{ to: L(500, 1140, 1.9, 300, 1500), pose: 'relax' }}
    armR={{ to: L(500, 1140, 1.9, 860, 1150), pose: 'grip', flip: 1, hold: <g transform="rotate(-10)"><Iron x={40} y={-40} s={.9} steam={.7} t={t} /></g> }} /><Bang t={t} t0={29.15} x={200} y={620} /></Cam></Frame>);
export const BekaPhone: React.FC<S> = ({ t }) => { const up = out(win(t, 31.05, 31.4)), m = mouthOf(t, 'b01');
  return (<Frame><Cam z={push(t, 31, 33.2, 1, 1.08)} fx={540} fy={900}><Blur px={4}><Cam z={1.25} fx={100} fy={560}><KitchenBack t={t} routerLost={t > 32.8} /></Cam></Blur>
    {t > 32.8 && <g><Router x={180} y={630} s={1.3} t={t} lost /></g>}
    <Character who="beka" x={560} y={1160} s={1.7} t={t} expr="tense" mouth={m} look={[.4, .6]} under={up * .7} armL={{ to: L(560, 1160, 1.7, 360, 1500), pose: 'relax' }} armR={{ to: L(560, 1160, 1.7, lerp(700, 760, up), lerp(1500, 1140, up)), pose: 'grip', flip: 1, hold: <PhoneDevice x={0} y={0} s={1.5} screen={1} rot={-80} /> }} /></Cam></Frame>); };
export const Messenger: React.FC<S> = ({ t }) => (<AbsoluteFill><Frame bg="#C9AD80"><Blur px={12}><Cam z={1.8} fx={540} fy={520}><KitchenBack t={t} /></Cam></Blur><rect x={-10} y={-10} width={1100} height={1940} fill="#0B1020" opacity={.35} /></Frame>
  <PhoneBig t={t} time="20:01" lost={t > 33.6} header={{ name: 'АЛМАТЫ СЕЙЧАС', sub: 'Connecting…', avatar: 'news' }} thumbAt={[33.5, 34.2]} thumbXY={[540, 1000]}>
    <div style={{ padding: 30, display: 'flex', flexDirection: 'column', gap: 26 }}>{[0, 1, 2].map(i => <div key={i} style={{ height: 200, borderRadius: 24, background: '#1b2547', display: 'flex', gap: 22, padding: 22, opacity: .7 }}><div style={{ width: 156, borderRadius: 16, background: '#2b3a6a' }} /><div style={{ flex: 1 }}>{[0, 1, 2].map(j => <div key={j} style={{ height: 18, width: `${90 - j * 22}%`, background: 'rgba(244,241,234,.25)', borderRadius: 9, marginBottom: 22 }} />)}</div></div>)}</div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 250, padding: '50px 0', background: 'rgba(16,24,51,.88)', display: 'flex', justifyContent: 'center' }}><Spinner t={t} /></div></PhoneBig></AbsoluteFill>);
export const ChatFail: React.FC<S> = ({ t }) => (<AbsoluteFill><Frame bg="#C9AD80"><Blur px={12}><Cam z={1.8} fx={540} fy={520}><KitchenBack t={t} /></Cam></Blur><rect x={-10} y={-10} width={1100} height={1940} fill="#0B1020" opacity={.35} /></Frame>
  <PhoneBig t={t} time="20:01" lost header={{ name: 'Аружан', sub: 'Connecting…' }} thumbAt={[37.3]} thumbXY={[800, 1240]}><ChatList t={t} msgs={[{ text: 'Ты где? Ответь', mine: true, clock: true, k: out(win(t, 37.3, 37.5)) }]} failAt={38.4} /></PhoneBig></AbsoluteFill>);
export const CallScreen: React.FC<S> = ({ t }) => { const noNet = t > 41.1;
  return (<AbsoluteFill><Frame bg="#C9AD80"><Blur px={12}><Cam z={1.8} fx={540} fy={520}><KitchenBack t={t} /></Cam></Blur><rect x={-10} y={-10} width={1100} height={1940} fill="#0B1020" opacity={.35} /></Frame>
    <PhoneBig t={t} time="20:01" lost><div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 90, gap: 34, fontFamily: FONT }}><div style={{ borderRadius: '50%', boxShadow: noNet ? 'none' : `0 0 0 ${10 + (t * 30) % 30}px rgba(127,179,255,.25)` }}><AruzhanAvatar size={280} /></div>
      <div style={{ fontWeight: 900, fontSize: 70, color: C.text }}>Аружан</div><div style={{ fontWeight: 900, fontSize: 56, color: noNet ? C.danger : '#9DB8E8' }}>{noNet ? 'Нет сети' : 'Вызов' + '...'.slice(0, 1 + Math.floor(t * 3) % 3)}</div>
      <div style={{ marginTop: 120, width: 130, height: 130, borderRadius: 65, background: C.danger, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="70" height="40" viewBox="0 0 70 40"><path d="M5,28 Q35,0 65,28 L56,36 L46,26 L24,26 L14,36 Z" fill="#fff" /></svg></div></div></PhoneBig></AbsoluteFill>); };
// ───── ТВ на стене: Алихан с пульта ─────
const TVF = { x: 90, y: 520, w: 900, h: 506 };
const TvWall: React.FC<{ t: number; on?: number; remote?: number; children: React.ReactNode }> = ({ t, on = 1, remote = 0, children }) => (<g><rect x={-200} y={-200} width={1480} height={2400} fill="#D9C29C" /><rect x={40} y={TVF.y + TVF.h + 40} width={1000} height={26} fill="#8A6A4A" />
  <Router x={880} y={TVF.y - 70} s={.8} t={t} lost={t > 33.6} /><TvSet x={TVF.x} y={TVF.y} w={TVF.w} h={TVF.h} on={on} id="tvw">{children}</TvSet><rect x={-200} y={-200} width={1480} height={2400} fill="#0B1020" opacity={.08} />
  {remote > 0 && <Character who="alik" x={lerp(-60, 60, out(remote))} y={1520} s={1.5} t={t} turn={-.3} look={[.6, -.8]} expr="focus" part="arms" armL={null} armR={{ to: L(lerp(-60, 60, out(remote)), 1520, 1.5, 380, 1260), pose: 'grip', hold: <g transform="rotate(90)"><rect x={-14} y={-60} width={28} height={110} rx={10} fill="#1a1b22" /><circle cx={0} cy={-44} r={5} fill="#E5383B" /></g> }} />}</g>);
export const TvOn: React.FC<S> = ({ t }) => { const on = t > 44.25 ? out(win(t, 44.25, 44.4)) : 0;
  return (<Frame><Cam z={push(t, 44, 47, 1, 1.07)} fx={540} fy={780}><TvWall t={t} on={on} remote={win(t, 44, 44.2)}><News x={TVF.x} y={TVF.y} w={TVF.w} h={TVF.h} t={t} mouth={anchorMouth(t)} normal={t < 44.85} />{t > 44.85 && t < 44.95 && <rect x={TVF.x} y={TVF.y} width={TVF.w} height={TVF.h} fill="#fff" opacity={.6} />}</TvWall></Cam></Frame>); };
export const FootageShot: React.FC<S & { kind: 'europe' | 'russia' | 'japan'; t0: number }> = ({ t, kind, t0 }) => (<Frame><Cam z={push(t, t0, t0 + 1.7, 1.02, 1.1)} fx={540} fy={780} dx={handheld(t, 4, 'ft')[0]}><TvWall t={t}><Footage x={TVF.x} y={TVF.y} w={TVF.w} h={TVF.h} t={t} kind={kind} t0={t0} /></TvWall></Cam></Frame>);
const flashes = (t: number, list: number[]) => list.reduce((a, l) => Math.max(a, clamp(1 - Math.abs(t - l) / .1)), 0);
export const Map1: React.FC<S> = ({ t }) => (<Frame><Cam z={push(t, 52, 55.4, 1, 1.06)} fx={540} fy={780}><TvWall t={t}><BlackoutMap x={TVF.x} y={TVF.y} w={TVF.w} h={TVF.h} t={t} off={MAP_OFF} ticker lightning={flashes(t, [52.6, 53.7, 54.6])} /></TvWall></Cam></Frame>);
export const Map2: React.FC<S> = ({ t }) => (<Frame><Cam z={push(t, 59.3, 61.2, 1.02, 1.12)} fx={640} fy={860}><TvWall t={t}><BlackoutMap x={TVF.x} y={TVF.y} w={TVF.w} h={TVF.h} t={t} off={MAP_OFF} squeeze={out(win(t, 60, 61.2))} lightning={flashes(t, [60.4])} /></TvWall></Cam></Frame>);
export const Anchor: React.FC<S> = ({ t }) => (<Frame><Cam z={push(t, 57.2, 59.3, 1, 1.08)} fx={540} fy={780}><TvWall t={t}><News x={TVF.x} y={TVF.y} w={TVF.w} h={TVF.h} t={t} mouth={anchorMouth(t)} stumble={win(t, 57.8, 58.3) || (t > 58.3 ? 1 : 0)} /></TvWall></Cam></Frame>);
export const ReactTV: React.FC<S> = ({ t }) => { const turn = out(win(t, 55.9, 56.3)), fl = Math.sin(t * 9) > .6 ? 1 : .8;
  return (<Frame><Cam z={push(t, 55.4, 57.2, 1.02, 1.08)} fx={540} fy={900}><Blur px={6}><Cam z={1.4} fx={700} fy={500}><KitchenBack t={t} /></Cam></Blur><rect x={-200} y={-200} width={1480} height={2400} fill="#0B1020" opacity={.4} /><Glow x={540} y={700} r={900} col="#7FB3FF" a={.3 * fl} />
    <Character who="beka" x={320} y={1170} s={1.45} t={t} expr="fear" look={[.2, -.05]} under={.55} shade={.25} armL={null} armR={null} />
    <Character who="dias" x={770} y={1140} s={1.6} t={t} expr="fear" look={[lerp(-.3, 1, turn), lerp(0, -.2, turn)]} turn={lerp(-.1, .4, turn)} under={.55} shade={.25} collarOpen armL={null} armR={null} /></Cam></Frame>); };
export const TvCollapse: React.FC<S> = ({ t }) => { const sq = win(t, 61.3, 61.6), dot = win(t, 61.6, 61.85), fade = win(t, 61.85, 62.1), [hx, hy] = handheld(t, 4, 'tc');
  return (<Frame><Cam z={push(t, 61.2, 62.3, 1.04, 1.1)} fx={540} fy={780} dx={hx} dy={hy}><TvWall t={t}>{sq <= 0 ? <g><News x={TVF.x} y={TVF.y} w={TVF.w} h={TVF.h} t={61.15} mouth={0} stumble={1} />{Array.from({ length: 5 }, (_, i) => <rect key={i} x={TVF.x + (Math.sin(t * 40 + i) * 80)} y={TVF.y + ((i * 97 + t * 900) % TVF.h)} width={TVF.w} height={20 + i * 8} fill={i % 2 ? '#E5383B' : '#7FB3FF'} opacity={.35} />)}</g>
    : <g><rect x={TVF.x} y={TVF.y} width={TVF.w} height={TVF.h} fill="#05060a" /><rect x={TVF.x + TVF.w / 2 - lerp(TVF.w, 10, io(dot)) / 2} y={TVF.y + TVF.h / 2 - lerp(TVF.h, 6, io(sq)) / 2} width={lerp(TVF.w, 10, io(dot))} height={lerp(TVF.h, 6, io(sq))} fill="#EEF4FF" opacity={1 - fade} /><Glow x={TVF.x + TVF.w / 2} y={TVF.y + TVF.h / 2} r={140} col="#DDE8FF" a={.8 * (1 - fade)} /></g>}</TvWall></Cam></Frame>); };
// ───── 22. Свет гаснет в кухне ─────
export const KitchenOut: React.FC<S> = ({ t }) => { const u = t - OUT, flick = u < 0 ? (u > -.25 && Math.sin(t * 80) > 0 ? .5 : 1) : 0, ph = out(win(t, OUT + .5, OUT + 1.1));
  return (<Frame><Cam z={push(t, 62.3, 64.3, 1.0, 1.05)} fx={540} fy={1000} dy={-230}><g filter={u >= 0 ? 'url(#koDk)' : undefined}><defs><DarkFilter id="koDk" k={.92} /></defs><KitchenWide t={t} on={flick} expr={{ alik: 'shock', beka: 'fear', dias: 'fear' }} outfit="dias" phones={u > 0 ? ph : 0} /></g>
    {u >= 0 && [[300, 1000], [520, 1010], [860, 960]].map(([x, y], i) => <Glow key={i} x={x} y={y - 60} r={240 * ph} col="#7FB3FF" a={.55 * ph} />)}</Cam></Frame>); };
// ───── 23. Город гаснет ─────
const offTop = (t: number, t0: number, f: number, n: number, d = .7) => t < t0 + (f / n) * d ? 1 : 0;
export const CityA: React.FC<S> = ({ t }) => (<Frame><Cam z={push(t, 64.3, 65.3, 1, 1.07)} fx={540} fy={1300}><Sky t={t} glow={t < CITY.zhk ? 1 : .2} /><Mountains y={1000} amp={260} seed={33} moon={.5} />
  <Zhk x={-60} base={1720} w={300} floors={17} lit={f => offTop(t, CITY.zhk, f, 17)} col="#3E4560" seed={2} /><Zhk x={330} base={1780} w={280} floors={19} lit={f => offTop(t, CITY.zhk, f, 19)} col="#4A4E6A" seed={3} /><Zhk x={700} base={1720} w={300} floors={16} lit={f => offTop(t, CITY.zhk, f, 16)} col="#3A3F58" seed={4} />
  {Array.from({ length: 6 }, (_, i) => <Tree key={i} x={80 + i * 190} y={1800} s={1.2} dark={t > CITY.zhk ? 1 : 0} seed={i} />)}</Cam></Frame>);
export const CityB: React.FC<S> = ({ t }) => { const off = t > CITY.people, k = out(win(t, CITY.people + .2, CITY.people + .5)), tk = out(win(t, 66.05, 66.3));
  const P: [number, any, string, boolean][] = [[200, 'look', '#7A4A8A', false], [400, 'shrug', '#4A6A8A', false], [610, 'hug', '#8A5A3A', false], [690, 'look', '#3A7A6A', true], [880, 'shake', '#6A6A7A', false]];
  return (<Frame><Cam z={push(t, 65.3, 66.4, 1, 1.07)} fx={540} fy={1400}><rect x={-200} y={-200} width={1480} height={2400} fill={off ? '#0e1324' : '#262a40'} /><Zhk x={-60} base={1320} w={1240} floors={14} fh={60} lit={() => off ? 0 : 1} col="#3A3F58" seed={9} side={0} />
    <rect x={-100} y={1320} width={1280} height={700} fill={off ? '#141a2c' : '#3a3a52'} /><StreetLamp x={100} y={1500} h={520} on={off ? 0 : 1} />
    {P.map(([x, pose, col, child]) => <Person key={x} x={x} y={1690} s={2.0} t={t} pose={off ? (k > .5 ? pose : 'freeze') : pose === 'shake' ? 'phone' : 'walk'} col={col} dark={off ? .55 : 0} child={child} face seed={x} torch={off && (x === 400 || x === 880) ? tk : 0} />)}</Cam></Frame>); };
export const CityC: React.FC<S> = ({ t }) => (<Frame><Cam z={push(t, 66.4, 67.5, 1, 1.07)} fx={540} fy={1100}><Sky t={t} glow={t < CITY.nt ? 1 : .2} /><Mountains y={1080} amp={220} seed={12} moon={.5} />
  <NurlyTau x={320} base={1660} s={.95} lit={(id, f) => offTop(t, CITY.nt, f, 18, .8)} /><HotelTower x={800} base={1660} s={1.0} lit={f => offTop(t, CITY.nt + .1, f, 22, .8)} crown={t < CITY.nt + .85 ? 1 : 0} />
  <rect x={-100} y={1660} width={1280} height={400} fill="#141a2c" />{Array.from({ length: 7 }, (_, i) => <Tree key={i} x={40 + i * 170} y={1720} s={1} dark={t > CITY.nt ? 1 : 0} seed={i + 20} />)}</Cam></Frame>);
export const CityD: React.FC<S> = ({ t }) => { const k = t < CITY.cat ? 1 : (t < CITY.cat + .2 && Math.sin(t * 70) > 0 ? .5 : 0);
  return (<Frame><Cam z={push(t, 67.5, 68.5, 1, 1.07)} fx={540} fy={1100}><Sky t={t} glow={.3} /><Cathedral x={540} base={1580} s={1.12} k={k} />{[80, 240, 840, 1000].map(x => <Tree key={x} x={x} y={1660} s={1.6} dark={k ? 0 : 1} seed={x} />)}
    <rect x={-100} y={1620} width={1280} height={400} fill="#1a1f33" />{[190, 890].map(x => <StreetLamp key={x} x={x} y={1720} h={420} on={k} />)}</Cam></Frame>); };
export const CityE: React.FC<S> = ({ t }) => { const u = t - CITY.kt, red = u < 0 ? .6 + .4 * Math.sin(t * 4) : u < .45 ? (Math.sin(u * 40) > 0 ? 1 : 0) : 0;
  return (<Frame><Cam z={push(t, 68.5, 69.6, 1, 1.07)} fx={480} fy={900}><Sky t={t} glow={.15} /><KokTobe x={420} base={1720} s={1.2} red={red} lit={u < .2 ? 1 : 0} />{Array.from({ length: 8 }, (_, i) => <Tree key={i} x={i * 150} y={1800} s={1.1} dark={1} seed={i + 40} />)}</Cam></Frame>); };
export const CityF: React.FC<S> = ({ t }) => (<Frame><Cam z={push(t, 69.6, 71.2, 1, 1.06)} fx={540} fy={1100}><Sky t={t} glow={0} moon={[820, 420]} dark={.2} /><Mountains y={930} amp={330} seed={21} moon={1} />
  {[[20, 120, 240], [160, 90, 380], [270, 140, 200], [700, 120, 300], [830, 160, 220], [980, 120, 340]].map(([x, w, h], i) => <rect key={i} x={x} y={1000 - h} width={w} height={h} fill="#0c1122" />)}<rect x={-100} y={990} width={1280} height={1000} fill="#0a0f1e" />
  {[[540, 1000, -300, 1950], [540, 1000, 540, 1950], [540, 1000, 1400, 1950]].map(([x0, y0, x1, y1], ri) => <g key={ri}><line x1={x0} y1={y0} x2={x1} y2={y1} stroke="#1c2340" strokeWidth={34} />
    {[0, 1].map(i => { const u = ((t * .03 + i / 2 + ri * .17) % 1), uu = u * u, px = lerp(x0, x1, uu), py = lerp(y0, y1, uu), sz = 2 + uu * 9; return <g key={i}><circle cx={px - sz} cy={py} r={sz} fill="#FFFBEA" /><circle cx={px + sz} cy={py} r={sz} fill="#FFFBEA" /><Glow x={px} y={py} r={30 + uu * 80} col="#FFF6DA" a={.5} /></g>; })}</g>)}
  {Array.from({ length: 14 }, (_, i) => { const x = (i * 173) % 1080, y = 1100 + ((i * 211) % 700); return (t * 2 + i) % 3 > .4 ? <g key={i}><Glow x={x} y={y} r={28} col="#FFF8E1" a={.7} /><circle cx={x} cy={y} r={3} fill="#fff" /></g> : null; })}</Cam></Frame>);
// ───── 24–25. Диас у окна; вид на проспект ─────
export const DiasWindow: React.FC<S> = ({ t }) => { const pol = Math.sin(t * 7) > 0 ? '#3a6bff' : '#ff3a3a';
  return (<Frame bg="#04060c"><Cam z={push(t, 71.2, 73.4, 1, 1.08)} fx={450} fy={900}><rect x={140} y={300} width={800} height={900} fill="#0b1020" /><g><clipPath id="dwWin"><rect x={140} y={300} width={800} height={900} /></clipPath><g clipPath="url(#dwWin)"><Mountains y={820} amp={180} seed={5} moon={.8} layers={2} /><rect x={140} y={860} width={800} height={400} fill="#0a0e1a" />{[0, 1, 2].map(i => { const u = (t * .08 + i / 3) % 1; return <Glow key={i} x={lerp(200, 900, u)} y={1040 + i * 40} r={44} col="#FFF6DA" a={.6} />; })}<Glow x={780} y={1100} r={160} col={pol} a={.35} /></g></g>
    <rect x={140} y={300} width={800} height={900} fill="none" stroke="#1a1e2a" strokeWidth={22} /><line x1={540} y1={300} x2={540} y2={1200} stroke="#1a1e2a" strokeWidth={12} /><Glow x={700} y={760} r={160} col="#FFF6DE" a={.3} />
    <Character who="dias" x={360} y={1250} s={1.95} t={t} expr="worry" look={[.9, -.1]} turn={.35} under={.85} shade={.75} collarOpen lens={lensScreen(true)} armL={null} armR={{ to: L(360, 1250, 1.95, 520, 1300), pose: 'grip', flip: 1, hold: <PhoneDevice x={0} y={0} s={1.3} screen={1} rot={-80} /> }} /></Cam></Frame>); };
export const Avenue: React.FC<S> = ({ t }) => { const pol = Math.sin(t * 8) > 0;
  return (<Frame bg="#070a14"><Cam z={push(t, 73.4, 75.6, 1, 1.08)} fx={540} fy={1000}><path d="M300,300 L780,300 L1300,1920 L-220,1920 Z" fill="#10152a" /><line x1={540} y1={300} x2={540} y2={1920} stroke="#c8c8dc" strokeOpacity={.12} strokeWidth={6} strokeDasharray="40 50" />
    <rect x={-100} y={300} width={340} height={1700} fill="#0a0d1a" /><rect x={840} y={300} width={400} height={1700} fill="#0a0d1a" />
    {Array.from({ length: 9 }, (_, i) => <Person key={i} x={130 + (i % 2) * 60} y={620 + i * 130} s={.9} t={t} pose={i % 3 ? 'look' : 'freeze'} col="#1a1e2c" skin="#3a3438" hair="#141218" torch={i % 3 === 0 ? 1 : 0} seed={i} />)}
    {Array.from({ length: 6 }, (_, i) => <Person key={'r' + i} x={940 + (i % 2) * 50} y={700 + i * 170} s={.9} t={t} pose={i % 2 ? 'point' : 'look'} col="#1c1a26" skin="#3a3438" hair="#141218" torch={i === 2 ? 1 : 0} seed={i + 30} />)}
    <g transform="translate(700,420) scale(.45)"><Car x={0} y={0} col="#e8e8f0" beams={.6} /><rect x={-40} y={-20} width={80} height={26} rx={6} fill={pol ? '#3a6bff' : '#ff3a3a'} /><Glow x={0} y={-8} r={200} col={pol ? '#3a6bff' : '#ff3a3a'} a={.7} /></g>
    {[[-1, (t - 72.4) * .12, false], [1, (t - 73.3) * .15, true], [-1, .2 + (t - 73.4) * .05, false]].map(([lane, u, taxi], i) => { const uu = clamp(u as number), y = lerp(320, 1700, uu), sc = lerp(.35, 1.25, uu), x = lerp(540, (lane as number) > 0 ? 740 : 340, uu);
      return <Car key={i} x={x} y={y} s={sc} taxi={taxi as boolean} col="#262c40" />; })}</Cam></Frame>); };
// ───── 26–27. Тишина и шёпот: тревога, не улыбки ─────
export const DarkFaces: React.FC<S & { snap?: number }> = ({ t, snap = -1 }) => { const k = snap > 0 ? spr(t, snap, { damping: 14, stiffness: 200 }) : 0, torch = snap > 0 ? out(win(t, snap + .25, snap + .4)) : 0;
  const sweep = (t * .7) % 1, polCol = Math.floor(t * 2) % 2 ? '#3a6bff' : '#ff3a3a';
  return (<Frame bg="#03040a"><Cam z={snap > 0 ? push(t, 76.6, 77.9, 1.03, 1.08) : push(t, 75.6, 76.6, 1, 1.03)} fx={540} fy={1100} dx={shake(t, snap, 8, .3)[0]}>
    <rect x={lerp(-400, 1100, sweep)} y={-200} width={420} height={700} fill={polCol} opacity={.12} style={{ filter: 'blur(60px)' }} />
    {([['alik', 220, 1180, 1.22, -.2], ['beka', 540, 1240, 1.22, .1], ['dias', 860, 1170, 1.28, -.1]] as [Who, number, number, number, number][]).map(([who, x, y, s, lx]) =>
      <Character key={who} who={who} x={x} y={y} s={s} t={t} expr={k > .5 ? 'shock' : 'fear'} look={[lerp(lx, 1, k), lerp(.1, -.05, k)]} turn={lerp(0, .5, k)} tilt={k * 6} under={.65} shade={.8} collarOpen armL={null} armR={null} mouth={k * .2} />)}
    {torch > 0 && <Beam x={560} y={1320} tx={1180} ty={950} w={240} k={torch} />}</Cam></Frame>); };
// ───── 28. Дверь: частые удары ─────
export const Door: React.FC<S> = ({ t }) => { const hit = KNOCKS.reduce((a, k) => { const u = t - k; if (u < 0 || u > .3) return a; const e = Math.exp(-u * 14); return { dx: a.dx + Math.sin(u * 80) * 20 * e, dy: a.dy + Math.cos(u * 60) * 6 * e, sc: a.sc * (1 + .025 * e) }; }, { dx: 0, dy: 0, sc: 1 });
  const gk = out(win(t, 78.4, 78.8)), gx = lerp(380, 700, io(win(t, 78.6, 80.5))), feet = t > 78.6 ? [gx - 60 + Math.sin(t * 7) * 12, gx + 60] : [], [sx, sy] = shakeMany(t, KNOCKS.map(k => [k, 7, .25] as [number, number, number]));
  return (<Frame><Cam z={push(t, 77.9, 80.8, 1, 1.12)} fx={570} fy={1100} dx={sx} dy={sy}><defs><DarkFilter id="doorDk" k={.82} /></defs><g filter="url(#doorDk)"><Hallway hit={hit} gap={gk > 0 ? { x: gx, k: gk, feet } : null} /></g>
    <Beam x={150} y={1560} tx={560 + sx * 1.5} ty={860} k={1} /><g transform="translate(120,1640) rotate(-50)"><Hand side={1} skin="#9a7058" shade="#6a4a38" pose="grip" s={2.4} hold={<PhoneDevice x={0} y={0} s={1.2} back torch={1} />} /></g>
    {KNOCKS.map(k => { const u = t - k; return u > 0 && u < .7 ? Array.from({ length: 6 }, (_, i) => <circle key={k + '' + i} cx={420 + i * 55 + u * (i - 3) * 40} cy={370 + u * u * 500} r={4 + i % 3} fill="#bdb3a0" opacity={(1 - u / .7) * .7} />) : null; })}</Cam></Frame>); };
