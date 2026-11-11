// «Блэкаут» с.1 v4 — планы из картинок пользователя (правки pravki-ep1-v3.md). t — абсолютное время серии, с.
// Фоны — без перерисовки, движение: камера, свет, массовка/машины отдельными слоями, герои — перекладка (Rig.tsx).
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { clamp, ease, io, lerp, noise, out, shakeMany, win } from '../anim';
import { C, FONT, MONO } from '../theme';
import { AruzhanAvatar, ChatList, PhoneBig, Spinner } from '../ui/Phone';
import { GlitchBars } from '../ui/Overlays';
import { HOOK_K, KNOCKS, KNOCK_AT, OUT, REWIND, VO_AT, mouthOf } from '../ep1/data';
import { BG, Cam, Car, Cars, Civ, GlowDefs, K, Leaves, Piece, Smoke, bg, fadeK, flick, handCam } from './Common';
import { Fig, FigProps, handAt } from './Rig';
import { Board } from './Props';

type S = { t: number };
const Frame: React.FC<{ children: React.ReactNode; bgc?: string }> = ({ children, bgc = '#0B1020' }) =>
  <AbsoluteFill style={{ background: bgc }}><svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}><GlowDefs />{children}</svg></AbsoluteFill>;
const push = (t: number, a: number, b: number, z0: number, z1: number) => lerp(z0, z1, io(win(t, a, b)));
const sp = (x: number, y: number): [number, number] => [x * K, y * K]; // пиксели фона → кадр

// ───────── комната: где стоят герои (общий план, координаты кадра) ─────────
const ROOM = {
  alik: { x: 430, y: 953, s: .324 },   // сидит у стола под телевизором, смотрит на монитор (влево)
  beka: { x: 585, y: 1300, s: .47 },   // за обеденным столом
  dias: { x: 905, y: 1105, s: .445 },  // у окна, гладильная доска
};
const TVR = { x: 36, y: 114, w: 290, h: 176 }; // экран телевизора на стене (кадр)
const lampGlow = (t: number, k = 1) => <g opacity={k}><ellipse cx={sp(415, 40)[0]} cy={sp(415, 40)[1] + 40} rx={420} ry={260} fill="url(#warmGlow)" opacity={.55 * flick(t, 'lamp', .06)} /></g>;
// гладит: утюг идёт вперёд-назад по доске, вторая рука придерживает ткань
const ironArms = (t: number, on = 1) => { const st = Math.sin(t * 5.2) * on; return { L: { u: 6, f: 26 + st * 2, ff: .74 }, R: { u: 10 + st * 6, f: 22 - st * 10, ff: .74, fu: .92 } }; };
const DiasIron: React.FC<{ t: number; on?: number; dark?: number; p?: Partial<FigProps> }> = ({ t, on = 1, dark = 0, p = {} }) => {
  const fp: FigProps = { id: 'dias', ...ROOM.dias, t, ...ironArms(t, on), holdR: 'iron', dark, ...p } as FigProps;
  const h = handAt(fp, 'R');
  return <g><Fig {...fp} holdR={null} R={undefined} L={undefined} opacity={0} /><Board cx={ROOM.dias.x - 40} top={h[1] + 54} w={430} dark={dark} /><Fig {...fp} /></g>;
};
const phoneArms = (t: number) => ({ L: { u: 12, f: 118, ff: .62 }, R: { u: 12, f: 118 + Math.sin(t * 2) * 2, ff: .62 }, phoneMid: true, thumb: (t * 1.3) % 1 });
const Room: React.FC<{ t: number; dark?: number; children?: React.ReactNode; front?: React.ReactNode; tv?: React.ReactNode }> = ({ t, dark = 0, children, front, tv }) => (<g>
  <BG n="room-lit-v3.jpg" /><BG n="room-blackout-v3.jpg" o={dark} />
  {tv && <g>{tv}</g>}
  {dark < 1 && lampGlow(t, 1 - dark)}
  {children}
  <Piece id={dark >= .5 ? 'table_dark' : 'table_lit'} />
  {front}
</g>);

// ───────── 1. Хук: 20:03, дверь в луче фонарика, удары; на «пять» — перемотка ─────────
export const Hook: React.FC<S> = ({ t }) => {
  if (t >= REWIND[1]) return <Facade t={t} />;
  const [sx, sy] = shakeMany(t, HOOK_K.map(k => [k, 9, .22] as [number, number, number])), rw = win(t, REWIND[0], REWIND[1]);
  const hh = handCam(t, 3);
  return (<Frame><Cam z={push(t, 0, 1.6, 1.0, 1.06) * (1 + rw * .06)} fx={620} fy={900} dx={sx + hh.dx} dy={sy + hh.dy} r={hh.r}>
    <BG n="door-flashlight.jpg" filter={rw > 0 ? `saturate(${1 - rw * .6}) contrast(${1 + rw * .3})` : undefined} />
    {/* луч дрожит вместе с рукой: пятно на двери чуть пульсирует */}
    <ellipse cx={sp(560, 800)[0]} cy={sp(560, 800)[1]} rx={210} ry={240} fill="url(#headGlow)" opacity={.18 * flick(t, 'beam', .4)} />
  </Cam>{rw > 0 && <g opacity={rw}><rect width={1080} height={1920} fill="#FFB04A" opacity={rw * .25} /></g>}</Frame>);
};
export const RewindFx: React.FC<S> = ({ t }) => { const k = t > REWIND[0] && t < REWIND[1] ? Math.sin(win(t, REWIND[0], REWIND[1]) * Math.PI) : 0; return <GlitchBars t={t} k={k} />; };

// ───────── 2. Сталинка на Абая — Байтурсынова: таблички крупно → весь дом от крыши до тротуара ─────────
const PLATES = [{ x: 686, y: 898, w: 71, h: 31, r: -2, txt: ['проспект', 'Абая'] }, { x: 781, y: 898, w: 83, h: 31, r: 1, txt: ['улица', 'Байтурсынова'] }];
export const Facade: React.FC<S> = ({ t }) => {
  const k = io(win(t, 3.5, 5.3)), z = lerp(2.5, 1.0, k), fx = lerp(sp(775, 914)[0], 540, k), fy = lerp(sp(775, 914)[1] + 40, 960, k);
  const label = 1 - win(t, 1.9, 2.0) * 0 - win(t, 2.6, 2.8);
  return (<Frame><Cam z={z * (1 + (t - 1.9) * .004)} fx={fx} fy={fy}>
    <BG n="historic-street.jpg" />
    {/* свет в окнах чуть дышит (люди дома), фонарь у входа */}
    <ellipse cx={sp(636, 1000)[0]} cy={sp(636, 1000)[1]} rx={60} ry={50} fill="url(#warmGlow)" opacity={.6 * flick(t, 'door', .2)} />
    {PLATES.map((p, i) => { const [x, y] = sp(p.x, p.y), w = p.w * K, h = p.h * K;
      return <g key={i} transform={`rotate(${p.r},${x + w / 2},${y + h / 2})`}><text x={x + w / 2} y={y + h * .42} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={h * .3} fill="#fff">{p.txt[0]}</text>
        <text x={x + w / 2} y={y + h * .8} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={h * (p.txt[1].length > 8 ? .3 : .36)} fill="#fff">{p.txt[1]}</text></g>; })}
    <Leaves t={t} n={7} seed={2} />
  </Cam>
    {/* «За пять минут до этого» — 0,7 с после перемотки */}
    {t < 2.85 && <g opacity={clamp(win(t, 1.9, 2.05)) * label}><rect x={190} y={760} width={700} height={120} rx={22} fill="#0B1020" opacity={.72} />
      <text x={540} y={838} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={50} fill="#F4F1EA">За пять минут до этого</text></g>}
  </Frame>);
};

// ───────── 3. Общий план комнаты: ужин, каждый занят своим ─────────
export const RoomWide: React.FC<S> = ({ t }) => (<Frame><Cam z={push(t, 6, 8, 1.0, 1.05)} fx={540} fy={900}>
  <Room t={t}>
    <Fig id="alikP" {...ROOM.alik} t={t} sit={1} R={{ u: 72 + Math.sin(t * 3) * 2, f: 18 }} head={10} />
    <DiasIron t={t} p={{ smile: .4 }} />
    <Fig id="beka" {...ROOM.beka} t={t} {...phoneArms(t)} head={-3} />
  </Room></Cam></Frame>);

// ───────── 4. Три панели: ЗУБРИТ / ЛИСТАЕТ / ГЛАДИТ ─────────
const Panel: React.FC<{ i: number; t: number; t0: number; label: string; children: React.ReactNode; vb: string }> = ({ i, t, t0, label, children, vb }) => { const k = out(win(t, t0, t0 + .35));
  return (<g transform={`translate(0,${(1 - k) * (i % 2 ? -1 : 1) * 1920})`}><svg x={i * 360 + 4} y={0} width={352} height={1920} viewBox={vb} preserveAspectRatio="xMidYMid slice">{children}</svg>
    <rect x={i * 360 + 34} y={300} width={292} height={84} rx={14} fill="#0B1020" opacity={.82} /><text x={i * 360 + 180} y={358} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill="#F4F1EA">{label}</text></g>); };
export const Split: React.FC<S> = ({ t }) => (<Frame bgc="#0B1020">
  <Panel i={0} t={t} t0={7.9} label="ЗУБРИТ" vb="250 900 420 2240"><BG n="study-cozy-room.jpg" /><StudyAlik t={t} /></Panel>
  <Panel i={1} t={t} t0={8.15} label="ЛИСТАЕТ" vb="440 480 290 1540"><Room t={t}><Fig id="beka" {...ROOM.beka} t={t} {...phoneArms(t)} head={-4} /></Room></Panel>
  <Panel i={2} t={t} t0={8.4} label="ГЛАДИТ" vb="760 400 290 1540"><Room t={t}><DiasIron t={t} p={{ smile: .3 }} /></Room></Panel>
</Frame>);

// ───────── 5. Алихан учится: рабочий уголок, пишет в тетради, смотрит на монитор ─────────
const STUDY = { x: 545, y: 1556, s: .532 };
const StudyAlik: React.FC<{ t: number }> = ({ t }) => { const w = Math.sin(t * 9) * 3;
  return <Fig id="alikP" {...STUDY} t={t} sit={1} R={{ u: 84 + w * .5, f: 14 + w }} head={t % 4 < 2 ? 14 : 6} mouth={mouthOf(t, 'a01') * .9} />; };
export const Study: React.FC<S> = ({ t }) => (<Frame><Cam z={push(t, 10.3, 14, 1.12, 1.22)} fx={500} fy={1180}>
  <BG n="study-cozy-room.jpg" />
  <ellipse cx={sp(390, 720)[0]} cy={sp(390, 720)[1]} rx={260} ry={200} fill="url(#warmGlow)" opacity={.5 * flick(t, 'deskl', .05)} />
  <StudyAlik t={t} />
</Cam></Frame>);

// ───────── 6–8. Диас гладит; телефон на подоконнике; переписка ─────────
const SillPhone: React.FC<{ t: number; buzz: number }> = ({ t, buzz }) => { const [x, y] = sp(700, 568), j = buzz > 0 ? Math.sin(t * 90) * 3 : 0;
  return <g transform={`translate(${x + j},${y})`}><rect x={-34} y={-10} width={68} height={14} rx={5} fill="#15171d" />{buzz > 0 && <><rect x={-28} y={-8} width={56} height={9} rx={3} fill="#b8d2ff" opacity={.9} />
    {[1, -1].map(s => <path key={s} d={`M${s * 46},-8 q${s * 8},4 0,10 M${s * 56},-12 q${s * 10},6 0,16`} stroke="#fff" strokeWidth={3} fill="none" opacity={.7} />)}</>}</g>; };
export const IronShot: React.FC<S> = ({ t }) => (<Frame><Cam z={push(t, 14, 16, 1.85, 1.95)} fx={850} fy={820}>
  <Room t={t}><DiasIron t={t} p={{ smile: t > 14.9 ? .6 : .2, look: t > 15 ? -.8 : 0, head: t > 15 ? -5 : 0 }} /></Room>
  <SillPhone t={t} buzz={t > 14.6 ? 1 : 0} />
</Cam></Frame>);
const DiasClose: React.FC<{ t: number; p: Partial<FigProps>; z?: number; dark?: number; ear?: boolean }> = ({ t, p, z = 3.1, dark = 0, ear }) => (<Frame>
  <Cam z={z} fx={ROOM.dias.x} fy={ear ? 640 : 610} dx={noise('dc', t, .4) * 6}>
    <Room t={t} dark={dark}><Fig id="dias" {...ROOM.dias} t={t} dark={dark} {...(ear ? { R: { u: -35, f: 189, fu: .55, ff: 1 }, holdR: 'phoneEar' as const } : { ...phoneArms(t) })} {...p} /></Room>
  </Cam></Frame>);
export const DiasFaceSmile: React.FC<S> = ({ t }) => <DiasClose t={t} p={{ smile: .7, look: 0, head: 2 }} />;
export const DiasFaceTyping: React.FC<S> = ({ t }) => <DiasClose t={t} p={{ worry: clamp((t - 35) / .6), head: -2 }} />;
export const DiasEar: React.FC<S> = ({ t }) => <DiasClose t={t} z={2.5} ear p={{ worry: 1, lid: t > 42.6 && t < 43.4 ? 1 : 0, mouth: mouthOf(t, 'd02') * .6, head: 3 }} />;
export const IronAgain: React.FC<S> = ({ t }) => (<Frame><Cam z={2.2} fx={860} fy={760}><Room t={t}><DiasIron t={t} p={{ smile: .6 }} /></Room></Cam></Frame>);

const PhoneBack: React.FC<{ t: number; dark?: number }> = ({ t, dark = 0 }) => (<AbsoluteFill><svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: 'absolute', inset: 0, filter: 'blur(14px)' }}>
  <Cam z={2} fx={760} fy={700}><BG n="room-lit-v3.jpg" /><BG n="room-blackout-v3.jpg" o={dark} /></Cam></svg><AbsoluteFill style={{ background: '#0B1020', opacity: .38 }} /></AbsoluteFill>);
const hh = (t: number) => ({ transform: `translate(${noise('ph', t, .5) * 8}px,${noise('pv', t, .45) * 8}px) rotate(${noise('pr', t, .3) * .6}deg)` });
export const ChatIn: React.FC<S> = ({ t }) => (<AbsoluteFill><PhoneBack t={t} /><AbsoluteFill style={hh(t)}><PhoneBig noHand t={t} time="19:59" header={{ name: 'Аружан', sub: 'в сети' }}><ChatList t={t} msgs={[{ text: 'Уже в такси', icon: 'taxi' }, { text: 'Буду у кафе через 15 мин', accent: true, k: out(win(t, 17.7, 17.95)) }]} /></PhoneBig></AbsoluteFill></AbsoluteFill>);
export const ChatSend: React.FC<S> = ({ t }) => { const typed = 'Выхожу через 5 минут', n = Math.floor(clamp((t - 19.05) / .6) * typed.length), sent = t > 19.85;
  return (<AbsoluteFill><PhoneBack t={t} /><AbsoluteFill style={hh(t)}><PhoneBig noHand t={t} time="20:00" header={{ name: 'Аружан', sub: 'в сети' }}><ChatList t={t} msgs={[{ text: 'Буду у кафе через 15 мин', accent: true }, ...(sent ? [{ text: typed, mine: true, ticks: (t > 20.35 ? 2 : 1) as 1 | 2, k: out(win(t, 19.85, 20.05)) }] : [])]} input={sent ? '' : typed.slice(0, n) + (Math.floor(t * 4) % 2 ? '|' : '')} /></PhoneBig></AbsoluteFill></AbsoluteFill>); };
// паблик: одна строка «Подключение…» и один индикатор, содержимое крупно
export const Feed: React.FC<S> = ({ t }) => (<AbsoluteFill><PhoneBack t={t} /><AbsoluteFill style={hh(t)}><PhoneBig noHand t={t} time="20:01" lost={t > 33.6} header={{ name: 'АЛМАТЫ СЕЙЧАС', sub: 'новости города', avatar: 'news' }}>
  <div style={{ padding: 30, display: 'flex', flexDirection: 'column', gap: 26, opacity: .55 }}>{[0, 1].map(i => <div key={i} style={{ height: 300, borderRadius: 24, background: '#1b2547' }} />)}</div>
  <div style={{ position: 'absolute', left: 0, right: 0, top: 260, padding: '60px 0', background: 'rgba(16,24,51,.92)', display: 'flex', justifyContent: 'center' }}><Spinner t={t} label="Подключение" /></div></PhoneBig></AbsoluteFill></AbsoluteFill>);
export const ChatFail: React.FC<S> = ({ t }) => (<AbsoluteFill><PhoneBack t={t} /><AbsoluteFill style={hh(t)}><PhoneBig noHand t={t} time="20:01" lost header={{ name: 'Аружан', sub: 'была недавно' }}><ChatList t={t} msgs={[{ text: 'Буду у кафе через 15 мин', accent: true }, { text: 'Выхожу через 5 минут', mine: true, ticks: 2 }, { text: 'Ты где? Ответь', mine: true, clock: true, k: out(win(t, 37.3, 37.5)) }]} failAt={38.4} /></PhoneBig></AbsoluteFill></AbsoluteFill>);
export const CallFail: React.FC<S> = ({ t }) => { const noNet = t > 41.1;
  return (<AbsoluteFill><PhoneBack t={t} /><AbsoluteFill style={hh(t)}><PhoneBig noHand t={t} time="20:01" lost><div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 90, gap: 34, fontFamily: FONT }}>
    <div style={{ borderRadius: '50%', boxShadow: noNet ? 'none' : `0 0 0 ${10 + (t * 30) % 30}px rgba(127,179,255,.25)` }}><AruzhanAvatar size={280} /></div>
    <div style={{ fontWeight: 900, fontSize: 70, color: C.text }}>Аружан</div><div style={{ fontWeight: 900, fontSize: 56, color: noNet ? C.danger : '#9DB8E8' }}>{noNet ? 'Вызов не удался' : 'Вызов' + '...'.slice(0, 1 + Math.floor(t * 3) % 3)}</div>
    <div style={{ fontWeight: 700, fontSize: 40, color: C.dim }}>{noNet ? 'Нет сети' : ''}</div></div></PhoneBig></AbsoluteFill></AbsoluteFill>); };

// ───────── 9. Дрожь: стол крупно — слабая вибрация, затем толчок; предметы на местах ─────────
export const Tremor: React.FC<S> = ({ t }) => { const weak = win(t, 22.2, 23.0) * (t < 23.7 ? 1 : 0), strong = t >= 23.7 ? Math.max(0, 1 - (t - 23.7) / 1.3) : 0;
  const a = weak * 1.6 + strong * 9, dx = Math.sin(t * 73) * a, dy = Math.cos(t * 59) * a * .5;
  const [cx, cy] = sp(445, 905);
  return (<Frame><Cam z={push(t, 22, 25, 2.25, 2.4)} fx={cx} fy={cy} dx={dx * 2.3} dy={dy * 2.3}><Room t={t} />
    {/* рябь в стаканах лапши и кружках — без изменения размера посуды */}
    {[[178, 868, 28], [262, 862, 30], [356, 862, 30], [448, 864, 30], [545, 864, 30], [625, 866, 26]].map(([x, y, r], i) => { const [X, Y] = sp(x, y);
      return <ellipse key={i} cx={X} cy={Y} rx={r * K * (.5 + .5 * ((t * 3 + i * .3) % 1))} ry={r * K * .25 * (.5 + .5 * ((t * 3 + i * .3) % 1))} fill="none" stroke="#fff" strokeWidth={2} opacity={(weak + strong) * .5 * (1 - (t * 3 + i * .3) % 1)} />; })}
  </Cam></Frame>); };

// ───────── 10. Истребитель над городом — один пролёт, крылья не деформируются ─────────
export const Jet: React.FC<S> = ({ t }) => { const k = win(t, 25.15, 26.55), x = lerp(-380, 1460, k), y = lerp(930, 120, k) + Math.sin(k * 3) * 20;
  const [sx, sy] = shakeMany(t, [[25.75, 14, .9]]);
  return (<Frame><Cam z={push(t, 25, 27.4, 1.06, 1.12)} fx={540} fy={900} dx={sx} dy={sy}><BG n="city-lit.jpg" />
    {k > 0 && k < 1 && <g transform={`translate(${x},${y})`}>
      {/* след и форсаж — отдельными эффектами */}
      <path d="M-170,130 L-560,360" stroke="#ffd59a" strokeWidth={10} opacity={.25} strokeLinecap="round" />
      <path d="M-150,118 L-360,240" stroke="#fff3d6" strokeWidth={5} opacity={.5} strokeLinecap="round" />
      <circle cx={-150} cy={118} r={26} fill="#ffb347" opacity={.7 * flick(t, 'ab', .4)} />
      <image href={bg('fighter-jet.png')} x={-230} y={-153} width={460} height={307} />
    </g>}
  </Cam>{k > .25 && k < .55 && <rect width={1080} height={1920} fill="#fff" opacity={.06} />}</Frame>); };

// ───────── 11. Комната после пролёта: все замерли, смотрят к окну ─────────
export const RoomShock: React.FC<S> = ({ t }) => { const [sx, sy] = shakeMany(t, [[27.4, 12, 1.1]]), r = win(t, 27.55, 27.9);
  return (<Frame><Cam z={1.08} fx={540} fy={900} dx={sx} dy={sy}><Room t={t}>
    <Fig id="alikP" {...ROOM.alik} t={t} sit={1} R={{ u: lerp(72, 30, r), f: lerp(18, 40, r) }} head={lerp(10, -10, r)} />
    <DiasIron t={t} on={1 - r} p={{ brows: r, o: r * .6, head: -6 * r, look: -r }} />
    <Fig id="beka" {...ROOM.beka} t={t} {...phoneArms(t)} thumb={0} head={lerp(-3, 6, r)} look={r} brows={r * .8} />
  </Room></Cam></Frame>); };

// ───────── 12. Диас застыл: утюг остаётся на доске, голова к шуму ─────────
export const DiasFrozen: React.FC<S> = ({ t }) => { const r = win(t, 29.0, 29.25), m = mouthOf(t, 'd01');
  return (<Frame><Cam z={push(t, 29, 31, 2.3, 2.45)} fx={880} fy={690}><Room t={t}><DiasIron t={t} on={0} p={{ brows: r, head: -7 * r, look: -r, mouth: m, o: m > .05 ? 0 : r * .35 }} /></Room></Cam></Frame>); };

// ───────── 13. Бека проверяет паблики, роутер мигает красным ─────────
export const BekaCheck: React.FC<S> = ({ t }) => { const [rx, ry] = sp(196, 318), red = Math.floor(t * 4) % 2;
  return (<Frame><Cam z={push(t, 31, 33.2, 1.75, 1.85)} fx={440} fy={700}><Room t={t}>
    <Fig id="beka" {...ROOM.beka} t={t} {...phoneArms(t)} worry={.6} head={-2} mouth={mouthOf(t, 'b01')} />
  </Room>{t > 31.9 && <circle cx={rx} cy={ry} r={6} fill="#ff3030" opacity={red} />}{t > 31.9 && <circle cx={rx} cy={ry} r={24} fill="#ff3030" opacity={red * .25} />}</Cam></Frame>); };

// ───────── 17. ТВ: трое смотрят на экран, Алихан включает пультом ─────────
const tvOn = 44.45;
const ScreenIn: React.FC<{ t: number; kind: 'anchor' | 'off' | 'black' }> = ({ t, kind }) => kind === 'off' ? null : (<g>
  <clipPath id="tvclip"><rect x={TVR.x} y={TVR.y} width={TVR.w} height={TVR.h} /></clipPath>
  <g clipPath="url(#tvclip)">{kind === 'anchor' ? <><image href={bg('tv-anchor.jpg')} x={TVR.x} y={TVR.y} width={TVR.w} height={TVR.h} preserveAspectRatio="xMidYMid slice" opacity={fadeK(t, tvOn, .15)} />
    <rect x={TVR.x} y={TVR.y + TVR.h * .78} width={TVR.w} height={TVR.h * .14} fill={C.danger} opacity={fadeK(t, tvOn + .2)} /></> : <rect x={TVR.x} y={TVR.y} width={TVR.w} height={TVR.h} fill="#05070c" />}</g>
  {kind === 'anchor' && <rect x={TVR.x - 80} y={TVR.y - 60} width={TVR.w + 160} height={TVR.h + 400} fill="url(#phoneGlow)" opacity={.5 * fadeK(t, tvOn)} />}
</g>);
const Watchers: React.FC<{ t: number; remote?: number; dark?: number; worry?: number }> = ({ t, remote = 0, dark = 0, worry = 0 }) => (<>
  <Fig id="alikP" {...ROOM.alik} t={t} sit={1} R={remote > 0 ? { u: lerp(60, 118, remote), f: lerp(20, -8, remote) } : { u: 40, f: 30 }} holdR={remote > 0 ? 'remote' : null} head={-14} dark={dark} />
  <Fig id="diasP" {...ROOM.dias} t={t} head={-10 - worry * 3} dark={dark} />
  <Fig id="bekaP" {...ROOM.beka} t={t} head={-12} dark={dark} />
</>);
export const TvOn: React.FC<S> = ({ t }) => { const rm = ease(t, 44.05, 44.35) * (1 - ease(t, 45.3, 45.7));
  return (<Frame><Cam z={push(t, 44, 46, 1.12, 1.35)} fx={380} fy={700}><Room t={t} tv={<ScreenIn t={t} kind={t > tvOn ? 'anchor' : 'off'} />}><Watchers t={t} remote={rm} /></Room></Cam></Frame>); };
export const Watch: React.FC<S> = ({ t }) => (<Frame><Cam z={push(t, 57.2, 58.1, 1.3, 1.38)} fx={560} fy={760}><Room t={t} tv={<ScreenIn t={t} kind="anchor" />}><Watchers t={t} worry={1} /></Room>
  <rect x={0} y={0} width={1080} height={1920} fill="#2a3a7a" opacity={.12 + .05 * Math.sin(t * 7)} style={{ mixBlendMode: 'multiply' }} /></Cam></Frame>);
// 21. экран просто гаснет до чёрного (современный ТВ, без точки кинескопа)
export const TvOff: React.FC<S> = ({ t }) => (<Frame><Cam z={1.3} fx={560} fy={760}><Room t={t} tv={<ScreenIn t={t} kind={t > 61.55 ? 'black' : 'anchor'} />}><Watchers t={t} worry={1} /></Room></Cam></Frame>);

// ───────── ТВ крупно: эфир на весь экран телевизора ─────────
const SCR = { y: 190, h: 1340 }; // экран ТВ по высоте кадра (по ширине выходит за край)
const Broadcast: React.FC<{ t: number; children: React.ReactNode; region?: string; witness?: boolean; bar?: boolean; regionAt?: number }> = ({ t, children, region, witness, bar = true, regionAt = 0 }) => (<Frame bgc="#0a0c12">
  <rect x={0} y={0} width={1080} height={1920} fill="#1d1a22" />
  <rect x={-20} y={SCR.y - 22} width={1120} height={SCR.h + 44} fill="#06070a" />
  <svg x={0} y={SCR.y} width={1080} height={SCR.h} viewBox={`0 0 1080 ${SCR.h}`} overflow="hidden">{children}
    {bar && <g><rect x={0} y={SCR.h - 150} width={1080} height={86} fill={C.danger} /><text x={40} y={SCR.h - 92} fontFamily={FONT} fontWeight={900} fontSize={48} fill="#fff">ЭКСТРЕННЫЙ ВЫПУСК</text>
      <rect x={830} y={SCR.h - 140} width={200} height={66} rx={8} fill="#fff" /><text x={930} y={SCR.h - 94} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={40} fill={C.danger}>{Math.floor(t * 1.5) % 2 ? '● LIVE' : '  LIVE'}</text></g>}
    {region && <g opacity={fadeK(t, regionAt, .15)}><rect x={176} y={40} width={region.length * 40 + 60} height={92} rx={10} fill="#0B1020" opacity={.85} /><text x={206} y={104} fontFamily={FONT} fontWeight={900} fontSize={58} fill="#F4F1EA">{region}</text></g>}
    {witness && <g><rect x={176} y={146} width={330} height={52} rx={8} fill={C.danger} opacity={.9} /><text x={194} y={183} fontFamily={FONT} fontWeight={800} fontSize={32} fill="#fff">ВИДЕО ОЧЕВИДЦЕВ</text></g>}
  </svg>
  {/* блик стекла */}
  <path d={`M0,${SCR.y} L420,${SCR.y} L0,${SCR.y + 520} Z`} fill="#fff" opacity={.03} />
</Frame>);
// 16:9 картинка на весь экран: фокус fx (пиксели исходника по ширине) — в центре кадра
const Wide: React.FC<{ n: string; w: number; h: number; fx: number; z?: number; dx?: number; dy?: number }> = ({ n, w, h, fx, z = 1, dx = 0, dy = 0 }) => { const s = SCR.h / h * z;
  return <image href={bg(n)} x={540 - fx * s + dx} y={(SCR.h - h * s) / 2 + dy} width={w * s} height={h * s} />; };
// ведущая: рот по голосу, взгляд вниз на листок при сбое
const ANCH = { m: [832, 282, 22], skin: '#e5a77e' };
const anchorMouth = (t: number) => Math.max(mouthOf(t, 'an1'), mouthOf(t, 'an2'), mouthOf(t, 'an3'), mouthOf(t, 'an4'));
const Anchor: React.FC<{ t: number; t0: number; stumble?: boolean }> = ({ t, t0, stumble }) => { const z = 1 + (t - t0) * .025, s = SCR.h / 941 * z, fx = 836;
  const X = (x: number) => 540 + (x - fx) * s, Y = (y: number) => (SCR.h - 941 * s) / 2 + y * s, m = anchorMouth(t), nod = stumble && t < 58.7 ? Math.sin(win(t, 57.9, 58.6) * Math.PI) * 6 : 0;
  return (<g transform={`translate(0,${nod})`}><Wide n="tv-anchor.jpg" w={1672} h={941} fx={fx} z={z} />
    <defs><filter id="anb"><feGaussianBlur stdDeviation="4" /></filter></defs>
    {m > .03 && <><ellipse cx={X(ANCH.m[0])} cy={Y(ANCH.m[1]) + 2} rx={ANCH.m[2] * s * 1.25} ry={ANCH.m[2] * s * .55} fill={ANCH.skin} filter="url(#anb)" />
      <ellipse cx={X(ANCH.m[0])} cy={Y(ANCH.m[1]) + 3} rx={ANCH.m[2] * s * .62} ry={Math.max(3, ANCH.m[2] * s * .42 * m)} fill="#5a2020" stroke="#b0575a" strokeWidth={4} /></>}
  </g>); };
export const AnchorShot: React.FC<S> = ({ t }) => <Broadcast t={t}><Anchor t={t} t0={45.9} /></Broadcast>;
export const AnchorStumble: React.FC<S> = ({ t }) => <Broadcast t={t}><Anchor t={t} t0={57.9} stumble /></Broadcast>;
// видео очевидцев: вертикальное видео внутри экрана, по бокам спокойные тёмные поля; ручная камера
const Footage: React.FC<{ t: number; n: string; region: string; t0: number; cars?: Car[] }> = ({ t, n, region, t0, cars }) => { const fh = SCR.h, fw = fh * 941 / 1672, x0 = 540 - fw / 2, c = handCam(t, 9), z = 1.04 + (t - t0) * .03;
  return (<Broadcast t={t} region={region} witness regionAt={t0}>
    <rect x={0} y={0} width={1080} height={SCR.h} fill="#101522" />
    {[0, 1].map(i => <rect key={i} x={i ? x0 + fw : 0} y={0} width={x0} height={SCR.h} fill="url(#sideG)" />)}
    <defs><linearGradient id="sideG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1a2238" /><stop offset="1" stopColor="#0c101c" /></linearGradient><clipPath id="fclip"><rect x={x0} y={0} width={fw} height={fh} /></clipPath></defs>
    <g clipPath="url(#fclip)"><g transform={`translate(${540 + c.dx},${fh / 2 + c.dy}) rotate(${c.r}) scale(${z}) translate(${-540},${-fh / 2})`}>
      <image href={bg(n)} x={x0} y={0} width={fw} height={fh} />
      {cars && <svg x={x0} y={0} width={fw} height={fh} viewBox="0 0 1080 1920" preserveAspectRatio="none"><Cars t={t} cars={cars} /></svg>}
      {/* локальный свет телефонов свидетелей мерцает */}
      <rect x={x0} y={0} width={fw} height={fh} fill="#000" opacity={.06 * (1 - flick(t, n, .9))} />
    </g></g>
  </Broadcast>); };
export const FootRussia: React.FC<S> = ({ t }) => <Footage t={t} n="tv-russia.jpg" region="РОССИЯ" t0={48.35} cars={[{ a: [380, 905], b: [1180, 840], t0: 48.2, dur: 2.2, s: .55 }]} />;
export const FootEurope: React.FC<S> = ({ t }) => <Footage t={t} n="tv-eastern-europe.jpg" region="ВОСТОЧНАЯ ЕВРОПА" t0={49.7} cars={[{ a: [1200, 1290], b: [520, 1190], t0: 49.3, dur: 2.6, s: .7 }]} />;
export const FootJapan: React.FC<S> = ({ t }) => <Footage t={t} n="tv-japan.jpg" region="ЯПОНИЯ" t0={50.9} cars={[{ a: [860, 640], b: [520, 760], t0: 50.4, dur: 3.2, s: .45 }]} />;

// карта: реальная география, подсветка регионов по порядку реплик; камера плавно ведёт к нужному месту
const MAPS = 1.25 * 1340 / 1350; // масштаб карты 1920×1080 под высоту экрана
const Pulse: React.FC<{ x: number; y: number; t: number; t0: number; r?: number; col?: string }> = ({ x, y, t, t0, r = 120, col = C.danger }) => { if (t < t0) return null; const k = ((t - t0) * 1.4) % 1, a = fadeK(t, t0, .2);
  return <g opacity={a}><circle cx={x} cy={y} r={r * .55} fill={col} opacity={.32} /><circle cx={x} cy={y} r={r * (.4 + k * .9)} fill="none" stroke={col} strokeWidth={6} opacity={1 - k} /></g>; };
const MapView: React.FC<{ t: number; keys: [number, number][]; children?: React.ReactNode }> = ({ t, keys, children }) => {
  let fx = keys[0][1]; for (let i = 1; i < keys.length; i++) fx = lerp(fx, keys[i][1], io(win(t, keys[i][0], keys[i][0] + .5)));
  const s = SCR.h / 1080 * 1.0, x0 = 540 - fx * s;
  return (<Broadcast t={t} bar={false}><g transform={`translate(${x0},${(SCR.h - 1080 * s) / 2}) scale(${s})`}><image href={bg('eurasia-map.png')} x={0} y={0} width={1920} height={1080} />{children}</g></Broadcast>); };
export const Map1: React.FC<S> = ({ t }) => (<MapView t={t} keys={[[52.9, 420], [53.6, 380], [54.3, 1000]]}>
  <Pulse x={330} y={520} t={t} t0={53.25} r={150} /><Pulse x={1000} y={330} t={t} t0={54.4} r={200} /><Pulse x={1620} y={690} t={t} t0={54.7} r={110} />
</MapView>);
export const MapKz: React.FC<S> = ({ t }) => (<MapView t={t} keys={[[59.3, 860], [60.5, 1000]]}>
  <Pulse x={830} y={570} t={t} t0={59.65} r={150} />
  {t > 60.55 && <g><Pulse x={1040} y={640} t={t} t0={60.55} r={70} col="#FFD23F" /><rect x={1070} y={596} width={220} height={66} rx={10} fill="#0B1020" opacity={.85 * fadeK(t, 60.6)} /><text x={1090} y={642} fontFamily={FONT} fontWeight={900} fontSize={40} fill="#FFD23F" opacity={fadeK(t, 60.6)}>АЛМАТЫ</text></g>}
</MapView>);
// подстанция: молния → вспышка → тот же ракурс после удара, дым
export const Substation: React.FC<S> = ({ t }) => { const hit = t > 55.0, fl = hit && t < 55.7 ? (Math.floor((t - 55) * 22) % 3 !== 1 ? 1 : 0) : 0, after = t > 55.9;
  return (<Broadcast t={t} region="ПОДСТАНЦИИ" regionAt={55.05} witness={false}>
    <Wide n="tv-substation-aftermath.jpg" w={1672} h={941} fx={560} z={1 + (t - 54.9) * .02} />
    {!after && <g opacity={hit ? fl : 0}><Wide n="tv-substation-strike.jpg" w={1672} h={941} fx={560} z={1 + (t - 54.9) * .02} /></g>}
    {after && <Smoke t={t} x={540 - 95} y={SCR.h * .44} s={1.3} />}
    {t > 55.0 && t < 55.12 && <rect x={0} y={0} width={1080} height={SCR.h} fill="#eef3ff" opacity={.85} />}
  </Broadcast>); };

// ───────── 22. 20:03 — в комнате гаснет всё сетевое, свет только от телефонов в руках ─────────
export const RoomOut: React.FC<S> = ({ t }) => { const d = t >= OUT ? 1 : 0, ph = clamp((t - OUT - .45) / .25);
  return (<Frame><Cam z={1.12} fx={560} fy={860}><Room t={t} dark={d} tv={<ScreenIn t={t} kind="black" />}>
    <Fig id="alikP" {...ROOM.alik} t={t} sit={1} R={{ u: 40, f: 30 }} head={-14 + d * 10} dark={d} />
    <Fig id="dias" {...ROOM.dias} t={t} {...phoneArms(t)} screen={ph} dark={d} worry={1} look={d ? .6 : 0} />
    <Fig id="beka" {...ROOM.beka} t={t} {...phoneArms(t)} screen={ph} dark={d} brows={d} head={d * 4} />
  </Room></Cam></Frame>); };

// ───────── 23. Город гаснет: пары «свет / блэкаут» одной геометрии, люди — отдельными слоями ─────────
const Pair: React.FC<{ t: number; lit: string; dark: string; at: number; z0: number; z1: number; t0: number; t1: number; fx?: number; fy?: number; children?: (d: number) => React.ReactNode; cars?: Car[] }> = ({ t, lit, dark, at, z0, z1, t0, t1, fx = 540, fy = 960, children, cars }) => {
  const d = t >= at ? 1 : 0;
  return (<Frame><Cam z={push(t, t0, t1, z0, z1)} fx={fx} fy={fy}><BG n={lit} /><BG n={dark} o={d} />{cars && <Cars t={t} cars={cars} />}{children && children(d)}</Cam></Frame>); };
const CITY_CARS: Car[] = [{ a: [-80, 1720], b: [1160, 1745], t0: 63, dur: 4.5, s: .55 }, { a: [1160, 1795], b: [-80, 1770], t0: 62, dur: 5.2, s: .6 }, { a: [-80, 1720], b: [1160, 1745], t0: 65.4, dur: 4.5, s: .55, taxi: true }];
export const CityA: React.FC<S> = ({ t }) => <Pair t={t} lit="city-lit.jpg" dark="city-blackout.jpg" at={64.5} z0={1.0} z1={1.04} t0={64.3} t1={65.3} cars={CITY_CARS} />;
export const Hotel: React.FC<S> = ({ t }) => <Pair t={t} lit="hotel-kazakhstan-lit.jpg" dark="hotel-kazakhstan-blackout.jpg" at={65.45} z0={1.0} z1={1.05} t0={65.3} t1={66.3}>{d => <>
  <Civ id="c2" x={300} y={1800} h={430} t={t} dark={d} look={d} />
  <Civ id="c4" x={760} y={1830} h={420} t={t} dark={d} look={d * .3} phone={[1405, 335]} /></>}</Pair>;
export const Cathedral: React.FC<S> = ({ t }) => <Pair t={t} lit="ascension-cathedral-lit.jpg" dark="ascension-cathedral-blackout.jpg" at={66.45} z0={1.04} z1={1.0} t0={66.3} t1={67.3}>{d => <>
  <Civ id="c3" x={760} y={1760} h={360} t={t} dark={d} look={d} /></>}</Pair>;
export const Arbat: React.FC<S> = ({ t }) => <Pair t={t} lit="arbat-lit.jpg" dark="arbat-blackout.jpg" at={67.45} z0={1.0} z1={1.06} t0={67.3} t1={68.3} fy={1100}>{d => <>
  <Civ id="c1" x={420} y={1720} h={380} t={t} dark={d} look={d} /></>}</Pair>;
// канатная дорога: кабинки едут → свет гаснет, кабинки замедляются и встают (резерв не запускается) → реакция пассажиров
export const Cable: React.FC<S> = ({ t }) => { const off = 68.75, react = 69.35, d = t >= off ? 1 : 0;
  const v = t < off ? 1 : Math.max(0, 1 - (t - off) / .35); const pos = t < off ? (t - 68.3) * 22 : (off - 68.3) * 22 + 22 * .35 / 2 * (1 - (1 - Math.min(1, (t - off) / .35)) ** 2);
  const sway = t > off ? Math.sin((t - off) * 9) * Math.max(0, 1 - (t - off) / 1.2) * 1.4 : 0;
  return (<Frame><Cam z={1.05 + (t - 68.3) * .02} fx={540} fy={760} dx={-pos * .7} dy={-pos * .45} r={sway * .2}>
    <BG n="koktobe-cableway-lit-v2.jpg" /><BG n="koktobe-cableway-blackout-v2.jpg" o={d} /><BG n="koktobe-cableway-reaction-v2.jpg" o={t >= react ? 1 : 0} />
  </Cam>{v > 0 && t < off && <rect width={1080} height={1920} fill="#000" opacity={0} />}</Frame>); };
export const CityDark: React.FC<S> = ({ t }) => (<Frame><Cam z={push(t, 69.9, 71.2, 1.0, 1.06)} fx={540} fy={1100}><BG n="city-blackout.jpg" /><Cars t={t} cars={CITY_CARS} /></Cam></Frame>);

// ───────── 24. Диас у тёмного окна, телефон в руке ─────────
export const DiasWindow: React.FC<S> = ({ t }) => (<Frame><Cam z={push(t, 71.2, 73.4, 2.0, 2.15)} fx={790} fy={720}><Room t={t} dark={1}>
  <Fig id="dias" {...ROOM.dias} t={t} {...phoneArms(t)} dark={1} worry={1} look={-1} head={-6} />
</Room></Cam></Frame>);
// 25. вид вниз на проспект: фары, такси с Аружан — одна машина, своя полоса
export const Avenue: React.FC<S> = ({ t }) => (<Frame><Cam z={push(t, 73.4, 75.6, 1.9, 2.0)} fx={540} fy={1640}><BG n="city-blackout.jpg" />
  <Cars t={t} cars={[{ a: [-80, 1722], b: [1160, 1742], t0: 72.9, dur: 4.2, s: .55, taxi: true }, { a: [1160, 1792], b: [-80, 1772], t0: 72.1, dur: 3.9, s: .6 }, { a: [-80, 1722], b: [1160, 1742], t0: 70.5, dur: 4.2, s: .55 }]} />
</Cam></Frame>);
// 26–27. трое в темноте; на «застучал» — все к двери (справа за кадром)
export const DarkTrio: React.FC<S> = ({ t }) => { const turn = t >= KNOCK_AT + .06, tk = clamp((t - KNOCK_AT - .02) / .12);
  const sq = (k: number) => turn ? clamp(.35 + k * .65) : 1;
  const [sx] = shakeMany(t, KNOCKS.slice(0, 3).map(k => [k, 6, .2] as [number, number, number]));
  const siren = (Math.sin(t * 9) > 0 ? '#ff3b4a' : '#3b6bff');
  return (<Frame><Cam z={1.15} fx={560} fy={860} dx={sx}><Room t={t} dark={1} tv={<ScreenIn t={t} kind="black" />}>
    {!turn ? <>
      <Fig id="alikP" {...ROOM.alik} t={t} sit={1} R={{ u: 40, f: 30 }} head={-4} dark={1} />
      <Fig id="dias" {...ROOM.dias} t={t} {...phoneArms(t)} dark={1} worry={1} />
      <Fig id="beka" {...ROOM.beka} t={t} {...phoneArms(t)} dark={1} worry={.7} look={.5} /></> : <>
      <g transform={`translate(${ROOM.alik.x},0) scale(${sq(tk)},1) translate(${-ROOM.alik.x},0)`}><Fig id="alikP" {...ROOM.alik} flip t={t} sit={1} R={{ u: 40, f: 30 }} head={-2} dark={1} /></g>
      <g transform={`translate(${ROOM.dias.x},0) scale(${sq(tk)},1) translate(${-ROOM.dias.x},0)`}><Fig id="diasP" {...ROOM.dias} flip t={t} dark={1} head={2} /></g>
      <g transform={`translate(${ROOM.beka.x},0) scale(${sq(tk)},1) translate(${-ROOM.beka.x},0)`}><Fig id="bekaP" {...ROOM.beka} flip t={t} dark={1} head={2} /></g></>}
  </Room>
    {/* отсветы мигалок с улицы на потолке */}
    <ellipse cx={720} cy={140} rx={420} ry={110} fill={siren} opacity={.07} />
  </Cam></Frame>); };
// 28. дверь в луче фонарика, частые удары; дверь закрыта, пришедшего не видно
export const Door: React.FC<S> = ({ t }) => { const [sx, sy] = shakeMany(t, KNOCKS.map(k => [k, 10, .2] as [number, number, number])), c = handCam(t, 4);
  return (<Frame><Cam z={push(t, 77.9, 80.8, 1.05, 1.16)} fx={620} fy={900} dx={sx + c.dx} dy={sy + c.dy} r={c.r}><BG n="door-flashlight.jpg" />
    <ellipse cx={sp(560, 800)[0]} cy={sp(560, 800)[1]} rx={210} ry={240} fill="url(#headGlow)" opacity={.16 * flick(t, 'beam2', .45)} /></Cam></Frame>); };
