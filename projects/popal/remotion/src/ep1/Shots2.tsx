// Планы серии 1 v4 (правки пользователя): квартира и донер, кола, курьер, очередь, автомат «ДАР» с инфографикой и «додепом»,
// гусь из пруда, земли демонов, Король-бык, развилка с чиби-Желе. Остальные планы — в Shots.tsx.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { SHOT, HIT_AT } from './timeline.mjs';
import { clamp, lerp, out, io, spr, win, shake, noise, handheld } from '../anim';
import { C, FONT } from '../theme';
import { Person, POSES, blendPose, Pan, Doner, Cola } from '../chars/Person';
import { Lumina, Goose, Slime, Succubus, KingBull, ChibiSlime } from '../chars/Cast';
import { Street, Hall, Counter, Desk, Pond, Throne, Glow, Apartment, Fridge, HellLand, Fork, Motes } from '../bg/Bg';
import { Frame, Cam, InfoStand, Tag, Onomato, Stamp, Flash } from '../ui/Ui';
import { mouth } from './Shots';

type P = { t: number; T: number };
const dur = (id: string) => SHOT[id].b - SHOT[id].a;
const html = (s: React.CSSProperties): React.CSSProperties => ({ position: 'absolute', fontFamily: FONT, ...s });
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const Speed: React.FC<{ t: number; o?: number }> = ({ t, o = .5 }) => <g>{Array.from({ length: 18 }, (_, i) => { const a = i / 18 * 6.283 + hash(i) * .3, r0 = 420 + hash(i * 3) * 200 + ((t * 900 + i * 90) % 300);
  return <path key={i} d={`M${540 + Math.cos(a) * r0},${960 + Math.sin(a) * r0} L${540 + Math.cos(a) * (r0 + 500)},${960 + Math.sin(a) * (r0 + 500)}`} stroke="#fff" strokeWidth={6 + hash(i) * 10} opacity={o} />; })}</g>;
const PhoneUI: React.FC<{ t: number; t0: number; x: number; y: number; lines: [string, string][] }> = ({ t, t0, x, y, lines }) => { const k = spr(t, t0, { damping: 12 }); if (t < t0) return null;
  return (<div style={html({ left: x, top: y, width: 420, transform: `scale(${k}) rotate(-3deg)`, transformOrigin: '0 100%', background: '#111', borderRadius: 46, padding: 18, boxShadow: '0 30px 60px rgba(0,0,0,.5)' })}>
    <div style={{ background: 'linear-gradient(180deg,#ff7a3a,#e5383b)', borderRadius: 32, padding: '26px 24px', color: '#fff' }}>
      <div style={{ fontSize: 28, fontWeight: 800, opacity: .9 }}>ДОСТАВКА ЕДЫ</div>
      <div style={{ fontSize: 120, lineHeight: 1.1, textAlign: 'center' }}>🌯</div>
      {lines.map(([a, b], i) => <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 34, fontWeight: 900, marginTop: 8, opacity: clamp((t - t0 - .3 - i * .35) / .2) }}><span>{a}</span><span style={{ color: '#ffe27a' }}>{b}</span></div>)}
    </div></div>); };

// ───────────────────────── 1. КВАРТИРА: голодный Макс заказывает донер ─────────────────────────
export const Room: React.FC<P> = ({ t, T }) => { const growl = t > 3.9 && t < 4.8, s = growl ? [Math.sin(t * 60) * 4, 0] : [0, 0], order = t > 5.0;
  return (<><Frame bg="#2a2a48"><Cam z={lerp(1.0, 1.1, io(win(t, 0, dur('room'))))} fy={1200} dx={s[0]}><Apartment t={T} />
    <Person x={540} y={1610} s={1.15} t={T} hold="phone" pose={{ armR: [.3, -2.0], armL: [-.2, 1.9], legL: [-1.4, 1.5], legR: [-1.3, 1.4], hip: 40 }} expr={growl ? 'pain' : order ? 'happy' : 'deadpan'} eye={[-.2, .6]} headTilt={-4} />
    <Glow x={600} y={1080} r={260} c="#4ad0ff" o={.35} id="phG" />
  </Cam></Frame>
    {growl && <Onomato t={t} t0={3.9} x={760} y={1080} text="УРРР…" col="#ffb04a" size={110} rot={8} dur={1.0} />}
    <PhoneUI t={t} t0={5.0} x={600} y={330} lines={[['ДОНЕР XXL', '✓'], ['ЗАКАЗ', 'ПРИНЯТ'], ['КУРЬЕР', '15 МИН']]} /></>); };

// ───────────────────────── 2. ХОЛОДИЛЬНИК: колы нет ─────────────────────────
export const FridgeShot: React.FC<P> = ({ t, T }) => { const open = t < 3.2 ? out(win(t, .1, .5)) : 1 - out(win(t, 3.2, 3.6));
  return (<Frame bg="#1c1a2c"><Cam z={lerp(1.0, 1.06, t / dur('fridge'))}><Fridge t={T} open={open} />
    <Person x={860} y={1880} s={1.35} t={T} pose={t < 3.6 ? { armL: [-1.2, -.6], armR: [.4, -1.7] } : POSES.heroic} hold={t > 3.6 ? null : null} expr={t < 3.6 ? 'deadpan' : 'determined'} mouth={mouth('max', T)} eye={t < 3.6 ? [-1, -.1] : [0, 0]} />
    <Glow x={700} y={1200} r={500} c="#e6f4ff" o={open * .35} id="frF" />
  </Cam></Frame>); };

// ───────────────────────── 3. УЛИЦА: Макс с колой, курьер с его донером ─────────────────────────
export const StreetHit: React.FC<P> = ({ t, T }) => { const d = HIT_AT, hl = win(t, d - 1.6, d) ** 2.2, turn = t > d - 1.0;
  return (<><Frame bg="#0b1430"><Cam z={lerp(1, 1.08, io(win(t, 0, d)))} fy={1300}><Street t={T} />
    <Glow x={lerp(820, 700, hl)} y={lerp(1080, 1150, hl)} r={lerp(70, 1100, hl)} c="#fff6d0" o={lerp(.5, 1, hl)} id="head2" />
    <circle cx={lerp(820, 700, hl)} cy={lerp(1080, 1150, hl)} r={lerp(12, 260, hl)} fill="#ffffff" opacity={clamp((t - (d - 1.7)) * 3)} />
    <Person x={lerp(380, 560, clamp(t / (d - 1)))} y={1760} s={1.2} t={T} hold="cola" pose={turn ? blendPose(POSES.stand, POSES.shrug, out(win(t, d - 1, d - .8))) : { armL: [-.2, .2], armR: [.5, -1.3] }}
      expr={turn ? 'happy' : 'neutral'} eye={turn ? [.8, -.1] : [.4, 0]} headTilt={turn ? 6 : 0} />
  </Cam><rect width={1080} height={1920} fill="#fffbe8" opacity={clamp((t - (d - .3)) / .3)} /></Frame>
    <div style={html({ left: 300, top: 600, transform: `scale(${spr(t, d - 1.3, { damping: 10 })})`, opacity: clamp(1.6 - hl * 2), background: '#fff', borderRadius: 26, padding: '12px 26px', fontSize: 36, fontWeight: 900, color: '#14121c', boxShadow: '0 10px 30px rgba(0,0,0,.4)' })}>🛵 ВАШ ДОНЕР РЯДОМ</div></>); };

// ───────────────────────── 4. СТОП-КАДР + НАЗВАНИЕ ─────────────────────────
export const FreezeTitle: React.FC<P> = ({ t, T }) => { const dd = Math.min(t, 1.35) * 18, grey = clamp((t - 1.3) / .2), s = shake(t, 1.35, 16, .35);
  return (<div style={{ position: 'absolute', inset: 0, transform: `translate(${s[0]}px,${s[1]}px)` }}>
    <Frame bg="#fff" style={{ filter: `saturate(${1 - grey * .8}) brightness(${1 - grey * .25})` }}><Cam z={1.08} rot={-4 + Math.min(t, 1.35) * 1.5}><Street t={T - t} />
      <rect width={1080} height={1920} fill="#fff6d0" opacity={.35} /><Speed t={Math.min(t, 1.35)} o={.6} />
      <Person x={560 + dd} y={1140} s={1.15} t={T} rot={-78} pose={POSES.fall} expr="shock" mouth={.5} noBlink shadow={false} />
      <g transform={`translate(${260 - dd * 1.5},${640 - dd}) rotate(${dd * 3})`}><Doner /></g>
      <g transform={`translate(${880 + dd},${600 - dd * .6}) rotate(${-30 + dd * 4})`}><Cola /></g>
      <g transform={`translate(${800 + dd * .5},${1500 + dd * .3}) rotate(${20 + dd})`}><rect x={-110} y={-90} width={220} height={180} rx={18} fill="#5a2fd4" /><path d="M0,-30 L8,-10 L30,-10 L12,4 L20,26 L0,12 L-20,26 L-12,4 L-30,-10 L-8,-10 Z" fill="#ffd23f" /></g>
      {[0, 1, 2, 3].map(i => <circle key={i} cx={760 + i * 40 + dd} cy={700 + i * 50 - dd * .4} r={14} fill="#5a1a14" opacity={.8} />)}
    </Cam></Frame>
    {grey > 0 && <AbsoluteFill style={{ background: `rgba(20,10,40,${grey * .35})` }} />}
    <Onomato t={t} t0={.05} x={540} y={560} text="БДЫЩ!" col={C.yellow} size={190} rot={-10} dur={1.25} /><Flash t={t} t0={0} dur={.3} />
    <Stamp t={t} t0={1.35} text="ПОПАЛ" sub="СЕРИЯ 1" col={C.yellow} y={760} size={250} /></div>); };

// ───────────────────────── 6. ОЧЕРЕДЬ НА ТОМ СВЕТЕ → «ИЗБРАННЫЙ — БЕЗ ОЧЕРЕДИ» ─────────────────────────
const Soul: React.FC<{ x: number; y: number; s: number; t: number; kind: number }> = ({ x, y, s, t, kind }) => (<g transform={`translate(${x},${y + Math.sin(t * 2 + x) * 8}) scale(${s})`} opacity={.85}>
  {kind === 0 && <><path d="M-80,0 C-90,-160 -60,-240 0,-240 C60,-240 90,-160 80,0 L50,-20 L20,0 L-10,-20 L-40,0 Z" fill="#fff" stroke="#d6dcf0" strokeWidth={4} /><ellipse cx={-26} cy={-170} rx={10} ry={16} fill="#3a3a5a" /><ellipse cx={26} cy={-170} rx={10} ry={16} fill="#3a3a5a" /></>}
  {kind === 1 && <><rect x={-70} y={-260} width={140} height={260} rx={30} fill="#aab4c6" /><rect x={-56} y={-380} width={112} height={130} rx={50} fill="#bcc6d8" /><rect x={-40} y={-330} width={80} height={14} fill="#3a4050" /></>}
  {kind === 2 && <><path d="M-70,0 L-50,-220 Q0,-250 50,-220 L70,0 Z" fill="#8a6aa8" /><circle cx={0} cy={-290} r={60} fill="#f6d2b8" /><path d="M-62,-300 Q0,-380 62,-300 Q40,-330 0,-332 Q-40,-330 -62,-300Z" fill="#e6e6ee" /><rect x={50} y={-110} width={70} height={90} rx={10} fill="#5ab04a" /></>}
  {kind === 3 && <><ellipse cx={0} cy={-50} rx={70} ry={50} fill="#fff" stroke="#d6dcf0" strokeWidth={4} /><circle cx={50} cy={-110} r={42} fill="#fff" stroke="#d6dcf0" strokeWidth={4} /><ellipse cx={0} cy={-200} rx={40} ry={10} fill="none" stroke="#ffe27a" strokeWidth={8} /></>}
</g>);
export const HallQueue: React.FC<P> = ({ t, T }) => { const tk = out(win(t, 1.0, 1.3)), board = out(win(t, 3.6, 3.9)), bl = Math.floor(t * 5) % 2 === 0, cheer = t > 4.8;
  return (<><Frame bg="#eef7ff"><Cam z={lerp(1.0, 1.08, io(win(t, 0, dur('hall'))))} dx={lerp(-20, 20, t / 6)}><Hall t={T} />
    {/* длинная очередь уходит вдаль */}
    {Array.from({ length: 9 }, (_, i) => <Soul key={i} x={120 + i * 60} y={1240 + i * 4} s={.42 - i * .015} t={T + i} kind={i % 4} />)}
    <Soul x={170} y={1520} s={.85} t={T} kind={0} /><Soul x={330} y={1540} s={.9} t={T} kind={1} /><Soul x={940} y={1530} s={.85} t={T} kind={2} />
    <Person x={680} y={1780} s={1.1} t={T} pose={cheer ? blendPose(POSES.stand, POSES.armsUp, spr(t, 4.8, { damping: 9 })) : { armL: [-1.2, -.3], armR: [.12, -.15] }} expr={cheer ? 'happy' : t > 1.1 ? 'deadpan' : 'neutral'} mouth={mouth('max', T)} eye={[-.6, .1]} />
  </Cam></Frame>
    {t > 1.0 && t < 3.7 && <div style={html({ left: 300, top: 560, width: 480, height: 300, transform: `rotate(-6deg) scale(${lerp(.3, 1, tk)})`, opacity: tk, background: '#fffdf2', borderRadius: 16, boxShadow: '0 20px 50px rgba(0,0,0,.35)', textAlign: 'center', padding: 24 })}>
      <div style={{ fontSize: 34, fontWeight: 800, color: '#556' }}>ВАШ НОМЕР</div><div style={{ fontSize: 170, fontWeight: 900, color: C.red, lineHeight: 1.05 }}>666</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: '#889' }}>ОЖИДАНИЕ: ~300 ЛЕТ</div></div>}
    {t > 3.6 && <div style={html({ left: 140, top: 480, width: 800, transform: `scale(${lerp(.6, 1, board)})`, opacity: board, background: '#111a2e', border: '14px solid #2a3a5a', borderRadius: 28, textAlign: 'center', padding: '20px 0' })}>
      <div style={{ fontSize: 46, fontWeight: 900, color: '#9fe3ff' }}>ВНЕ ОЧЕРЕДИ</div><div style={{ fontSize: 130, fontWeight: 900, color: bl ? '#ff4a4a' : '#ffd23f', lineHeight: 1.05 }}>666 → 3</div>
      <div style={{ display: 'inline-block', marginTop: 6, background: '#ffd23f', color: '#14121c', fontSize: 40, fontWeight: 900, padding: '4px 20px', borderRadius: 10 }}>★ ИЗБРАННЫЙ</div></div>}</>); };

// ───────────────────────── 11. АВТОМАТ «ДАР»: рычаг и барабаны ─────────────────────────
const REEL = ['⚔', '🔮', '🩸', '🍳'];
const SlotBody: React.FC<{ t: number; lever: number; lights: number }> = ({ t, lever, lights }) => (<g>
  <rect x={-300} y={-420} width={600} height={840} rx={50} fill="#c21d4a" /><rect x={-300} y={-420} width={600} height={840} rx={50} fill="none" stroke="#ffd23f" strokeWidth={14} />
  <rect x={-220} y={-520} width={440} height={130} rx={30} fill="#ffd23f" /><text x={0} y={-430} fontSize={84} fontWeight={900} textAnchor="middle" fill="#7a0f2a" fontFamily="Mont">ДАР</text>
  {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={-270 + i * 49} cy={-372} r={11} fill={(Math.floor(t * 10) + i) % 2 && lights ? '#fff6a0' : '#7a0f2a'} />)}
  <rect x={-240} y={-260} width={480} height={300} rx={20} fill="#1a1024" />
  <text x={0} y={200} fontSize={40} fontWeight={900} textAnchor="middle" fill="#ffd23f" fontFamily="Mont">1 ПРОКРУТКА</text>
  <g transform="translate(330,-120)"><rect x={-14} y={0} width={28} height={220} rx={14} fill="#888" transform={`rotate(${lever * 60} 0 200)`} /><circle cx={Math.sin(lever * 1.05) * 200} cy={200 - Math.cos(lever * 1.05) * 200} r={40} fill="#e5383b" /></g>
</g>);
const Reels: React.FC<{ t: number; T: number; stopAt: number[] }> = ({ t, T, stopAt }) => (<g>{[-150, 0, 150].map((x, i) => { const spinning = t < stopAt[i], off = spinning ? (t * 900 + i * 60) % 120 : 0;
  return (<g key={i}><clipPath id={`reelc${i}`}><rect x={x - 70} y={-250} width={140} height={280} /></clipPath><rect x={x - 70} y={-250} width={140} height={280} fill="#fffdf2" />
    <g clipPath={`url(#reelc${i})`}>{spinning ? [0, 1, 2, 3].map(j => <text key={j} x={x} y={-200 + j * 120 - off + 120} fontSize={90} textAnchor="middle">{REEL[(j + i + Math.floor(t * 8)) % 4]}</text>)
      : <g transform={`translate(${x},-110) scale(.42) translate(0,170)`}><Pan glow={1} t={T} /></g>}</g></g>); })}</g>);
export const SlotShot: React.FC<P> = ({ t, T }) => { const lv = out(win(t, 1.4, 1.6)) - out(win(t, 1.8, 2.2)), stop = [3.1, 3.25, 3.4], zoom = io(win(t, 2.0, 2.8)), won = t > 3.4;
  return (<><Frame bg="#2a1f45"><Cam z={lerp(1.0, 1.45, zoom)} fx={400} fy={860}><rect width={1080} height={1920} fill="#2a1f45" /><Glow x={400} y={900} r={700} c="#ff5aa8" o={.4} id="slg2" />
    <g transform="translate(400,950)"><SlotBody t={T} lever={lv} lights={won ? 1 : 0} /><Reels t={t} T={T} stopAt={stop} />
      {won && <rect x={-240} y={-260} width={480} height={300} rx={20} fill="none" stroke="#ffd23f" strokeWidth={10} opacity={.5 + .5 * Math.sin(t * 20)} />}</g>
    <Person x={870} y={1720} s={1.05} t={T} pose={{ armL: [-2.4 + lv * 1.0, .3], armR: [.12, -.15] }} expr={won ? 'shock' : t > 1.4 ? 'determined' : 'neutral'} eye={[-.7, -.3]} flip />
    {won && Array.from({ length: 22 }, (_, i) => { const k = t - 3.45, x = 400 + (hash(i) - .5) * 900 * k, y = 1200 - 900 * k * (.5 + hash(i * 3)) + 1200 * k * k; return <circle key={i} cx={x} cy={y} r={20} fill="#ffd23f" stroke="#b8860b" strokeWidth={5} />; })}
  </Cam></Frame></>); };

// ───────────────────────── 12. ИНФОГРАФИКА: ШАНСЫ АВТОМАТА ─────────────────────────
export const Odds: React.FC<P> = ({ t }) => { const rows: [string, string, number, string, number][] = [['⚔', 'Меч героя', 1, '#9fe3ff', .5], ['🔮', 'Посох архимага', 1, '#c9a2ff', 1.0], ['🩸', 'Кровь дракона', 1, '#ff8a8a', 1.5], ['🍳', 'Сковородка', 97, '#ffd23f', 3.0]];
  const art = (<g>{rows.map(([ic, nm, pc, col, t0], i) => { const k = out(win(t, t0, t0 + .6)), big = pc > 50, y = i * 92 + 10;
    return (<g key={i} opacity={clamp(k * 2)} transform={`translate(0,${y})`}><text x={0} y={52} fontSize={52}>{ic}</text><text x={74} y={46} fontSize={big ? 40 : 34} fontWeight={900} fill={big ? '#ffd23f' : '#fff'} fontFamily="Mont">{nm}</text>
      <rect x={410} y={16} width={360} height={40} rx={20} fill="rgba(255,255,255,.12)" /><rect x={410} y={16} width={Math.max(14, 360 * pc / 100 * k)} height={40} rx={20} fill={col} />
      <text x={860} y={50} fontSize={40} fontWeight={900} textAnchor="end" fill={col} fontFamily="Mont">{Math.round(pc * k)}%</text></g>); })}</g>);
  return <InfoStand t={t} num="АВТОМАТ «ДАР»" title="Шансы выпадения" art={art} col="#ffd23f" top={360}
    lines={[{ t: .6, icon: '🎰', text: 'Прокрутка — только одна' }, { t: 3.3, icon: '😐', text: 'Почти всегда — сковородка', col: '#ffd23f', big: true }]} />; };

// ───────────────────────── 13. ПРЕДМЕТ: СКОВОРОДА СУДЬБЫ ─────────────────────────
export const Item: React.FC<P> = ({ t, T }) => { const k = spr(t, .1, { damping: 10 });
  return (<><Frame bg="#1a1230"><rect width={1080} height={1920} fill="#1a1230" />
    {Array.from({ length: 16 }, (_, i) => <path key={i} d={`M540,820 L${540 + Math.cos(i / 16 * 6.283 + t * .4) * 1400},${820 + Math.sin(i / 16 * 6.283 + t * .4) * 1400}`} stroke="#ffd23f" strokeWidth={70} opacity={.08} />)}
    <Glow x={540} y={820} r={520} c="#ffd23f" o={.6} id="itG" />
    <g transform={`translate(540,${1000 + Math.sin(t * 2) * 16}) rotate(${Math.sin(t * 1.5) * 12}) scale(${2.2 * k})`}><Pan glow={1} t={T} /></g>
    <Motes n={24} t={T} c="#fff1a0" seed={51} area={[200, 300, 680, 1100]} vy={-60} size={8} /></Frame>
    <div style={html({ left: 110, top: 1440, width: 860, transform: `scale(${spr(t, .5, { damping: 12 })})`, background: 'rgba(20,18,28,.92)', border: '5px solid #ffd23f', borderRadius: 24, padding: '18px 30px', color: '#fff' })}>
      <div style={{ fontSize: 30, fontWeight: 800, color: '#ffd23f', letterSpacing: 3 }}>ПРЕДМЕТ · РЕДКОСТЬ: КУХОННАЯ</div>
      <div style={{ fontSize: 64, fontWeight: 900, lineHeight: 1.05 }}>СКОВОРОДА СУДЬБЫ</div>
      <div style={{ fontSize: 36, fontWeight: 800, marginTop: 6, color: '#9fe3ff' }}>Точность 100% · Урон: БОНК</div></div></>); };

// ───────────────────────── 14. «ДОДЕП!» ─────────────────────────
export const Dodep: React.FC<P> = ({ t, T }) => { const hh = handheld(T, 4), dd = t > 2.55;
  return (<><Frame bg="#2a1f45"><Cam z={lerp(1.0, 1.08, t / dur('dodep'))} dx={hh[0]} dy={hh[1]}><rect width={1080} height={1920} fill="#2a1f45" /><Glow x={200} y={900} r={600} c="#ff5aa8" o={.35} id="ddG" />
    <g transform="translate(150,1000) scale(.8)"><SlotBody t={T} lever={0} lights={0} /></g>
    <Person x={680} y={1900} s={1.45} t={T} hold="pan" panGlow={.4} pose={dd ? { armR: [.5, -2.3], armL: [-1.5, -.1] } : { armR: [.4, -2.2], armL: [-.6, 1.6] }} expr={dd ? 'determined' : 'deadpan'} mouth={mouth('max', T)} eye={dd ? [-.8, -.2] : [0, 0]} headTilt={dd ? -8 : 4} />
  </Cam></Frame>
    {dd && <Onomato t={t} t0={2.55} x={540} y={600} text="ДОДЕП!" col={C.yellow} size={170} rot={-6} dur={1.6} />}</>); };

// ───────────────────────── 15. «ПОШЁЛ НАХЕР» → портал ─────────────────────────
export const Nah: React.FC<P> = ({ t, T }) => {
  if (t < 1.1) return (<Frame bg="#d7ecff"><Cam z={lerp(1.15, 1.2, t)} fy={800}><Counter t={T} /><Lumina x={540} y={1430} s={1.75} t={T} mouth={mouth('lumina', T)} expr="deadpan" overGlasses={1} swipe={clamp((t - .75) / .3)} /></Cam></Frame>);
  const k = t - 1.1, fall = clamp((k - .25) / .9), pk = out(win(k, 0, .25));
  return (<Frame bg="#d7ecff"><Counter t={T} />
    <g transform="translate(540,1560)"><Glow x={0} y={0} r={520 * pk} c="#ffd23f" o={.9} id="portY2" /><ellipse cx={0} cy={0} rx={380 * pk} ry={110 * pk} fill="#4a2a9a" /><ellipse cx={0} cy={0} rx={300 * pk} ry={80 * pk} fill="#1a0a3a" /></g>
    <clipPath id="abovePortal2"><rect x={0} y={0} width={1080} height={1560} /><ellipse cx={540} cy={1560} rx={380} ry={110} /></clipPath>
    <g clipPath="url(#abovePortal2)"><Person x={540} y={1560 + fall * fall * 1300} s={1.3} t={T} hold="pan" pose={blendPose(POSES.stand, POSES.armsUp, out(win(k, 0, .2)))} expr="scared" mouth={.8} noBlink shadow={false} /></g></Frame>); };

// ───────────────────────── 18. ГУСЬ В ПРУДУ ЗВЕРЕЕТ ─────────────────────────
export const GooseUp: React.FC<P> = ({ t, T }) => { const evil = out(win(t, 1.2, 2.0)), rise = out(win(t, 2.4, 3.0)), s = shake(t, 3.0, 22, .5);
  return (<><Frame bg="#9c7ad8"><Cam z={lerp(1.0, 1.1, io(win(t, 0, dur('gooseUp'))))} dx={s[0]} dy={s[1] - 200} fy={1300}><Pond t={T} dark={evil * .35} />
    <Glow x={700} y={1350} r={420} c="#ff2a2a" o={evil * .45} id="gUpG" />
    <clipPath id="gooseWater"><rect x={0} y={0} width={1080} height={1440 + rise * 600} /></clipPath>
    <g clipPath="url(#gooseWater)"><Goose x={720} y={1480 + 120 * (1 - rise) - rise * 60} s={lerp(.9, 1.5, rise)} t={T} state={rise > .5 ? 'attack' : 'stand'} evil={evil} honk={t > 3.0 && t < 3.8 ? .9 : 0} flap={rise > 0 ? (1 - rise) * .9 + .2 : 0} flip /></g>
    {evil > .1 && Array.from({ length: 3 }, (_, i) => { const k = (t * 1.2 + i * .33) % 1; return <circle key={i} cx={780 + i * 30} cy={1200 - k * 220} r={20 + k * 30} fill="#e0d0d8" opacity={.5 * (1 - k) * evil} />; })}
    <clipPath id="maxWater2"><rect x={0} y={0} width={1080} height={1470} /></clipPath>
    <g clipPath="url(#maxWater2)"><Person x={300} y={1800} s={1.2} t={T} pose={rise > .3 ? POSES.shrug : { armL: [-.5, .5], armR: [.5, -.5] }} expr={evil > .3 ? 'scared' : 'deadpan'} eye={[.9, -.2]} sweat={evil} /></g>
    <Slime x={300} y={1800 - 1.2 * 600 - 40} s={.9} t={T} look={[.9, -.2]} />
  </Cam></Frame>{t > 3.0 && <Onomato t={t} t0={3.0} x={640} y={560} text="ГА-А-А!" col={C.red} size={160} rot={-6} dur={1.2} />}</>); };

// ───────────────────────── 20. БЕСТИАРИЙ: ВРАЖЕСКИЙ МОБ ─────────────────────────
export const Mob: React.FC<P> = ({ t, T }) => (<InfoStand t={t} num="ВРАЖЕСКИЙ МОБ" title="Адский гусь" col="#e5383b" top={360}
  art={<g><rect x={0} y={0} width={860} height={380} rx={20} fill="#2a1a2e" /><g transform="translate(240,350) scale(.9)"><Goose x={0} y={0} s={1} t={T} state="attack" honk={Math.max(0, Math.sin(t * 4)) * .6} flip /></g>
    <text x={500} y={80} fontSize={32} fontWeight={800} fill="#ff8a8a" fontFamily="Mont">РАЗВЕДЧИК</text><text x={500} y={122} fontSize={32} fontWeight={800} fill="#ff8a8a" fontFamily="Mont">КОРОЛЯ ДЕМОНОВ</text>
    <text x={500} y={200} fontSize={34} fontWeight={900} fill="#ffd23f" fontFamily="Mont">Угроза ★★☆</text><text x={500} y={262} fontSize={34} fontWeight={900} fill="#fff" fontFamily="Mont">Щипок: −1 ❤</text>
    <text x={500} y={324} fontSize={34} fontWeight={900} fill="#ff5a5a" fontFamily="Mont">У Макса: ❤ 1</text></g>}
  lines={[{ t: 1.2, icon: '👁', text: 'Шпионит для Короля демонов' }, { t: 3.4, icon: '☠', text: 'Один щипок — и Максу конец', col: '#ff8a8a', big: true }]} />);

// ───────────────────────── 24. ЗЕМЛИ ДЕМОНОВ ─────────────────────────
export const Hell: React.FC<P> = ({ t, T }) => (<Frame bg="#1a0408"><Cam z={lerp(1.0, 1.12, io(win(t, 0, dur('hell'))))} fy={1000}><HellLand t={T} lightning={t > 1.6 && t < 1.95 ? 1 : 0} /></Cam><Flash t={t} t0={1.6} dur={.2} col="#ff5a5a" /></Frame>);

// ───────────────────────── 25. ТРОН: Король-бык и суккуба ─────────────────────────
export const ThroneBull: React.FC<P> = ({ t, T }) => { const su = t > 2.55;
  return (<><Frame bg="#1a0a1e"><Cam z={su ? lerp(1.25, 1.3, t / 4.7) : lerp(1.0, 1.07, t / 2.6)} fx={su ? 260 : 540} fy={su ? 800 : 1000}><Throne t={T} />
    <KingBull x={600} y={1520} s={1.25} t={T} mouth={mouth('king', T)} />
    <g transform={`translate(${600 + 250 * 1.25},${1520 - 160 * 1.25}) scale(.2)`}><Goose x={0} y={120} s={1} t={T} state="ko" rot={90} /></g>
    <Succubus x={210} y={1330} s={.95} t={T} mouth={mouth('succ', T)} />
  </Cam></Frame>
    <Tag t={t} t0={.5} x={70} y={420} w={720} title="КОРОЛЬ ДЕМОНОВ" sub="АЗГАРОТ · ВЛАДЫКА ТЬМЫ" col={C.red} />
    {su && <Tag t={t} t0={2.65} x={70} y={560} w={560} title="ЛИЛИАНА" sub="ГЕНЕРАЛ · СУККУБА" col={C.pink} />}</>); };
export const EyesBull: React.FC<P> = ({ t, T }) => { const fl = t > 2.1 ? 1.6 : 1, s = shake(t, 2.1, 30, .8);
  return (<><Frame bg="#100408"><Cam z={lerp(1.0, 1.12, io(win(t, 0, 3.6)))} dx={s[0]} dy={s[1]}><rect width={1080} height={1920} fill="#1a0610" /><Glow x={540} y={900} r={700} c="#ff2a1a" o={.25} id="ebG" />
    <KingBull x={540} y={900 + 560 * 3.0} s={3.0} t={T} mouth={mouth('king', T)} glow={fl} orb={false} /></Cam></Frame><Flash t={t} t0={2.1} dur={.35} col="#ff2a2a" /></>); };

// ───────────────────────── 27. РАЗВИЛКА: чиби-Желе спрашивает зрителей ─────────────────────────
export const ForkChoice: React.FC<P> = ({ t, T }) => { const look = t < 2.6 ? -1 : t < 3.6 ? 1 : Math.sin(t * 3), point = clamp((t - 1.2) / .3), lab = (side: number, t0: number) => spr(t, t0, { damping: 10 });
  return (<><Frame bg="#ff9a7a"><Cam z={lerp(1.0, 1.05, t / 5.4)}><Fork t={T} />
    <Person x={230} y={1420} s={.62} t={T} pose={POSES.stand} hold="pan" expr="neutral" eye={[look * .8, -.4]} headTilt={look * 5} />
    <ChibiSlime x={610} y={1270} s={1.15} t={T} mouth={mouth('slime', T)} point={point} look={look} />
  </Cam></Frame>
    {[0, 1].map(side => <div key={side} style={html({ left: side ? 590 : 70, top: 620, width: 420, textAlign: 'center', transform: `scale(${lab(side, .3 + side * .3)})` })}>
      <div style={{ display: 'inline-block', background: side ? '#ff9a5a' : '#7dffb0', color: '#14121c', fontWeight: 900, fontSize: 30, padding: '6px 16px', borderRadius: 10 }}>{side ? 'ВАРИАНТ Б' : 'ВАРИАНТ А'}</div>
      <div style={{ fontWeight: 900, fontSize: 72, lineHeight: 1.0, color: '#fff', WebkitTextStroke: '12px #14121c', paintOrder: 'stroke fill', marginTop: 8, transform: `scale(${1 + (side ? (look > 0 ? .08 : 0) : (look < 0 ? .08 : 0))})` }}>{side ? 'ДРАКОН' : 'ЭЛЬФИЙКИ'}</div>
      <div style={{ fontWeight: 800, fontSize: 34, color: side ? '#ffb08a' : '#bfffd8', WebkitTextStroke: '6px #14121c', paintOrder: 'stroke fill', marginTop: 6 }}>{side ? 'логово дракона →' : '← лес эльфиек'}</div></div>)}
    {t > 4.4 && <div style={html({ left: 0, width: 1080, top: 400, textAlign: 'center', transform: `scale(${spr(t, 4.4, { damping: 10 })})` })}><span style={{ background: '#ffd23f', color: '#14121c', fontWeight: 900, fontSize: 44, padding: '8px 26px', borderRadius: 12 }}>СЕРИЯ 2 — ПО ВАШЕМУ ВЫБОРУ</span></div>}</>); };
