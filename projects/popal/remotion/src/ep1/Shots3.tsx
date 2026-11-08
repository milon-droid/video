// Планы серии 1 v5 (правки пользователя к v4): душа Макса над телом и плавный уход в свет, золотой талон избранного,
// простая инфографика системы, Король на троне, прогулка Макса с Желе, развилка (чиби поменьше), сплит-экран с эльфийкой и драконом.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { SHOT, VO_AT, WORD_AT } from './timeline.mjs';
import { clamp, lerp, out, io, spr, win, shake, noise } from '../anim';
import { C, FONT } from '../theme';
import { Person, POSES, blendPose, runPose } from '../chars/Person';
import { Slime, KingBull, ChibiSlime, Elf, DragonFront, Goose } from '../chars/Cast';
import { Street, Hall, Pond, Throne, Glow, Fork, Motes } from '../bg/Bg';
import { Frame, Cam, InfoStand, Choice } from '../ui/Ui';
import { mouth } from './Shots';

type P = { t: number; T: number };
const dur = (id: string) => SHOT[id].b - SHOT[id].a;
const html = (s: React.CSSProperties): React.CSSProperties => ({ position: 'absolute', fontFamily: FONT, whiteSpace: 'nowrap', ...s });

// ───────────── Душа Макса поднимается над телом → свет → тот свет ─────────────
export const Soul: React.FC<P> = ({ t, T }) => { const d = dur('soul'), up = io(win(t, 0, 2.2)), light = clamp((t - (d - 1.1)) / 1.1), s1 = VO_AT('s1') - SHOT.soul.a;
  return (<><Frame bg="#0b1430"><Cam z={lerp(1.0, 1.12, io(win(t, 0, d)))} fy={1300} dy={-120}><Street t={T} />
    <rect width={1080} height={1920} fill="#0b1430" opacity={.35} />
    {/* тело на асфальте */}
    <Person x={420} y={1700} s={1.0} t={T} rot={-88} pose={{ armL: [-.6, .3], armR: [1.9, -.4], legL: [-.2, .1], legR: [.25, -.2] }} expr="ko" noBlink shadow={false} />
    <g transform="translate(700,1730) rotate(30)"><path d="M-26,40 L-26,-30 Q-26,-56 -12,-70 L12,-70 Q26,-56 26,-30 L26,40 Z" fill="#5a1a14" /><rect x={-28} y={-6} width={56} height={30} fill="#e5383b" /></g>
    {/* душа: полупрозрачный Макс с хвостиком */}
    <g opacity={.72} style={{ filter: 'drop-shadow(0 0 30px #9fe3ff)' }}>
      <path d={`M540,${1620 - up * 300} C${560 + Math.sin(t * 3) * 30},${1700 - up * 200} ${500 + Math.sin(t * 2) * 40},${1760 - up * 100} 470,1700`} stroke="#bff3ff" strokeWidth={40} fill="none" strokeLinecap="round" opacity={.5} />
      <Person x={540} y={1620 - up * 300} s={1.05} t={T} pose={t > s1 ? blendPose({ ...POSES.stand, armL: [-.4, .3], armR: [.4, -.3] }, POSES.shrug, out(win(t, s1, s1 + .15))) : { armL: [-.4, .3], armR: [.4, -.3] }} expr={t > s1 ? 'shock' : 'sad'} mouth={mouth('max', T)} eye={[-.4, .9]} shadow={false} />
    </g>
    <Glow x={540} y={0} r={900} c="#ffffff" o={light} id="soulLight" />
    <path d={`M${540 - 160 * light},-100 L${540 + 160 * light},-100 L${540 + 320 * light},2000 L${540 - 320 * light},2000 Z`} fill="#fffbe8" opacity={light * .7} />
  </Cam><rect width={1080} height={1920} fill="#ffffff" opacity={clamp((t - (d - .5)) / .5)} /></Frame></>); };

// ───────────── Тот свет: очередь из душ, у Макса — золотой талон избранного ─────────────
const Soulie: React.FC<{ x: number; y: number; s: number; t: number; look: number }> = ({ x, y, s, t, look }) => (<g transform={`translate(${x},${y + Math.sin(t * 2 + x) * 8}) scale(${s})`} opacity={.8}>
  <path d="M-80,0 C-90,-160 -60,-240 0,-240 C60,-240 90,-160 80,0 L50,-20 L20,0 L-10,-20 L-40,0 Z" fill="#fff" stroke="#d6dcf0" strokeWidth={4} />
  <ellipse cx={-26 + look * 12} cy={-170} rx={10} ry={16} fill="#3a3a5a" /><ellipse cx={26 + look * 12} cy={-170} rx={10} ry={16} fill="#3a3a5a" /></g>);
export const HallGold: React.FC<P> = ({ t, T }) => { const g0 = WORD_AT('e1', 6) - SHOT.hall.a - .1, b0 = WORD_AT('e1', 7) - SHOT.hall.a + .6, tk = spr(t, g0, { damping: 11 }), board = out(win(t, b0, b0 + .3)), cheer = t > SHOT.hall.b - SHOT.hall.a - 1.2, fadeIn = clamp(1 - t / .5);
  return (<><Frame bg="#eef7ff"><Cam z={lerp(1.0, 1.08, io(win(t, 0, dur('hall'))))}><Hall t={T} />
    {Array.from({ length: 11 }, (_, i) => <Soulie key={i} x={100 + i * 50} y={1230 + i * 3} s={.36 - i * .012} t={T + i} look={t > g0 ? 1 : 0} />)}
    <Soulie x={170} y={1520} s={.85} t={T} look={t > g0 ? 1 : 0} /><Soulie x={330} y={1545} s={.9} t={T + 1} look={t > g0 ? 1 : 0} />
    <Person x={720} y={1780} s={1.1} t={T} pose={cheer ? blendPose(POSES.stand, POSES.armsUp, spr(t, SHOT.hall.b - SHOT.hall.a - 1.2, { damping: 9 })) : { armL: [-1.2, -.3], armR: [.12, -.15] }} expr={cheer ? 'happy' : t > g0 ? 'shock' : 'neutral'} mouth={mouth('max', T)} eye={[-.6, .1]} />
  </Cam><rect width={1080} height={1920} fill="#fff" opacity={fadeIn} /></Frame>
    {t > g0 && t < b0 + .1 && <div style={html({ left: 250, top: 560, width: 580, transform: `rotate(-5deg) scale(${tk})`, background: 'linear-gradient(135deg,#fff3b0,#ffc94d)', border: '6px solid #b8860b', borderRadius: 18, boxShadow: '0 0 60px #ffd23f', textAlign: 'center', padding: '22px 10px' })}>
      <div style={{ fontSize: 34, fontWeight: 900, color: '#7a5200' }}>ТАЛОН</div><div style={{ fontSize: 52, fontWeight: 900, color: '#5a3a00', lineHeight: 1.1 }}>★ ИЗБРАННЫЙ ★</div>
      <div style={{ fontSize: 30, fontWeight: 800, color: '#7a5200', marginTop: 6 }}>ОДИН НА ТЫСЯЧУ ЛЕТ</div></div>}
    {t > b0 && <div style={html({ left: 140, top: 500, width: 800, transform: `scale(${lerp(.6, 1, board)})`, opacity: board, background: '#111a2e', border: '14px solid #2a3a5a', borderRadius: 28, textAlign: 'center', padding: '22px 0' })}>
      <div style={{ fontSize: 46, fontWeight: 900, color: '#9fe3ff' }}>ВНЕ ОЧЕРЕДИ</div><div style={{ fontSize: 96, fontWeight: 900, color: '#ffd23f', lineHeight: 1.1 }}>★ → ОКНО 3</div></div>}</>); };

// ───────────── Простая инфографика «Система героя» ─────────────
export const Lore2Simple: React.FC<P> = ({ t }) => { const rows: [string, string, string, string, number][] = [['⚔', 'СИЛА', 'растёт с опытом', '#ff8a5a', .3], ['❤', 'ЗДОРОВЬЕ', 'растёт с опытом', '#ff4a6a', 1.0], ['✦', 'АУРА', 'за победы и эпик', '#ffc94d', 2.2]];
  const art = (<g>{rows.map(([ic, nm, txt, col, t0], i) => { const k = out(win(t, t0, t0 + .4));
    return (<g key={i} opacity={clamp(k * 2)} transform={`translate(${(1 - k) * -40},${i * 125})`}><rect x={0} y={0} width={860} height={105} rx={22} fill="rgba(255,255,255,.07)" stroke={col} strokeWidth={4} />
      <text x={40} y={72} fontSize={56}>{ic}</text><text x={120} y={70} fontSize={48} fontWeight={900} fill={col} fontFamily="Mont">{nm}</text><text x={830} y={68} fontSize={36} fontWeight={800} textAnchor="end" fill="#fff" fontFamily="Mont">{txt}</text></g>); })}</g>);
  return <InfoStand t={t} num="ЗАКОН №2" title="Система героя" art={art} col="#ffc94d" top={420} lines={[{ t: 3.2, icon: '✖', text: 'Позор — минус аура', col: '#ff5a5a', big: true }]} />; };

// ───────────── Король демонов сидит на троне ─────────────
const Silh: React.FC<{ x: number; y: number; s: number; kind: 'succ' | 'knight'; t: number }> = ({ x, y, s, kind, t }) => (<g transform={`translate(${x},${y}) scale(${s})`}>
  {kind === 'succ' ? <><path d="M-60,0 L-40,-300 Q0,-330 40,-300 L60,0 Z" fill="#12060e" /><circle cx={0} cy={-360} r={56} fill="#12060e" /><path d="M-30,-400 L-60,-470 L-10,-410 M30,-400 L60,-470 L10,-410" fill="#12060e" stroke="#12060e" strokeWidth={10} />
    <path d="M-40,-260 L-220,-420 L-170,-300 L-220,-260 Z M40,-260 L220,-420 L170,-300 L220,-260 Z" fill="#12060e" />{[-1, 1].map(sd => <ellipse key={sd} cx={sd * 20} cy={-362} rx={9} ry={5} fill="#ff3aa8" />)}</>
    : <><path d="M-90,0 L-80,-330 Q0,-360 80,-330 L90,0 Z" fill="#0c0a10" /><rect x={-50} y={-470} width={100} height={130} rx={30} fill="#0c0a10" /><rect x={-36} y={-420} width={72} height={10} fill="#5affd9" opacity={.8 + .2 * Math.sin(t * 5)} />
      <rect x={110} y={-520} width={18} height={520} fill="#0c0a10" /><path d="M119,-520 L90,-580 L148,-580 Z" fill="#0c0a10" /></>}</g>);
export const ThroneSeated: React.FC<P> = ({ t, T }) => { const bx = 540, by = 1360, s = 1.0;
  return (<Frame bg="#1a0a1e"><Cam z={lerp(1.0, 1.08, io(win(t, 0, dur('throne'))))} fy={1000}><Throne t={T} />
    <Silh x={130} y={1640} s={1.0} kind="succ" t={T} /><Silh x={950} y={1640} s={1.0} kind="knight" t={T} />
    {/* подлокотники трона */}
    {[-1, 1].map(sd => <g key={sd}><rect x={bx + sd * 300 - 80} y={by - 20} width={160} height={80} rx={18} fill="#2a1424" /><rect x={bx + sd * 300 - 70} y={by + 60} width={140} height={360} fill="#1a0c18" />
      <path d={`M${bx + sd * 300 - 80},${by - 20} L${bx + sd * 300 + 80},${by - 20}`} stroke="#5a2a3a" strokeWidth={10} /></g>)}
    {/* ноги сидя: кожаные бёдра вперёд, сапоги */}
    {[-1, 1].map(sd => <g key={'l' + sd}><path d={`M${bx + sd * 40},${by + 40} L${bx + sd * 230},${by + 40} L${bx + sd * 250},${by + 230} L${bx + sd * 60},${by + 240} Z`} fill="#1c1820" />
      <path d={`M${bx + sd * 80},${by + 230} L${bx + sd * 230},${by + 230} L${bx + sd * 220},${by + 470} L${bx + sd * 100},${by + 470} Z`} fill="#141118" />
      <path d={`M${bx + sd * 70},${by + 460} L${bx + sd * 250},${by + 460} L${bx + sd * 260},${by + 520} L${bx + sd * 60},${by + 520} Z`} fill="#0a080c" /></g>)}
    <KingBull x={bx} y={by + 30} s={s} t={T} mouth={mouth('king', T)} />
    <g transform={`translate(${bx + 250 * s},${by + 30 - 160 * s}) scale(.2)`}><Goose x={0} y={120} s={1} t={T} state="ko" rot={90} /></g>
  </Cam></Frame>); };

// ───────────── Прогулка: Макс и Желе идут по лесной тропе ─────────────
const walkPose = (ph: number) => { const r = runPose(ph); return { armL: [r.armL[0] * .5, -.3] as [number, number], armR: [r.armR[0] * .5, .3] as [number, number], legL: [r.legL[0] * .7, r.legL[1] * .55] as [number, number], legR: [r.legR[0] * .7, r.legR[1] * .55] as [number, number], lean: .03 }; };
export const Walk: React.FC<P> = ({ t, T }) => { const sp = 160, off = (t * sp * 2.2) % 2160, ph = t * sp / 120 * Math.PI;
  return (<Frame bg="#9c7ad8"><Cam z={1.04}><Pond t={T} />
    {[0, 1].map(k => <g key={k} transform={`translate(${-off + k * 2160},0)`}>{Array.from({ length: 9 }, (_, i) => <g key={i} transform={`translate(${i * 240 + 60},1480)`}><rect x={-30} y={-460} width={60} height={460} fill="#6a4a3a" /><circle cx={0} cy={-480} r={150} fill={i % 2 ? '#3f8a5e' : '#2f7a52'} /></g>)}</g>)}
    <rect x={0} y={1460} width={1080} height={460} fill="#5aa86a" /><rect x={0} y={1600} width={1080} height={120} fill="#c9a77a" />
    <Person x={470} y={1690 - Math.abs(Math.sin(ph)) * 10} s={1.05} t={T} pose={walkPose(ph)} hold="pan" expr="neutral" mouth={mouth('max', T)} eye={[.8, 0]} />
    <Slime x={720} y={1690 - Math.abs(Math.sin(t * 5)) * 70} s={1.05} t={T} mouth={mouth('slime', T)} squish={1 - Math.abs(Math.sin(t * 5))} look={[-.8, -.3]} />
    {Array.from({ length: 6 }, (_, i) => { const fx = ((1300 - t * sp * 4 + i * 400) % 2400 + 2400) % 2400 - 200; return <path key={i} d={`M${fx},1920 Q${fx - 20},1640 ${fx + 30},1480`} stroke="#1f4a2a" strokeWidth={40} fill="none" strokeLinecap="round" />; })}
  </Cam></Frame>); };

// ───────────── Развилка: Макс и Желе, чиби-Желе спрашивает зрителей ─────────────
export const ForkAsk: React.FC<P> = ({ t, T }) => { const look = t < 1.6 ? -1 : t < 2.6 ? 1 : Math.sin(t * 3), point = clamp((t - .6) / .3);
  return (<Frame bg="#ff9a7a"><Cam z={lerp(1.0, 1.05, t / dur('forkAsk'))}><Fork t={T} />
    <Person x={300} y={1520} s={.8} t={T} pose={POSES.stand} hold="pan" expr="neutral" eye={[look * .8, -.5]} headTilt={look * 5} />
    <ChibiSlime x={690} y={1160} s={.7} t={T} mouth={mouth('slime', T)} point={point} look={look} />
  </Cam></Frame>); };

// ───────────── Сплит-экран выбора: эльфийка или дракон ─────────────
const ElfSide: React.FC<{ t: number }> = ({ t }) => (<g><rect width={540} height={1920} fill="#14382a" /><Glow x={270} y={760} r={520} c="#7dffb0" o={.45} id="elfS" />
  {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M${i * 90 - 40},1920 L${i * 90 + 20},${420 + (i % 3) * 110} L${i * 90 + 80},1920 Z`} fill={i % 2 ? '#24583c' : '#1c4a32'} opacity={.9} />)}
  <Elf x={270} y={1180} s={.9} t={t} />
  <Motes n={26} t={t} c="#bfffd8" seed={61} area={[0, 300, 540, 1100]} vy={-30} size={8} /></g>);
const DragonSide: React.FC<{ t: number }> = ({ t }) => (<g><rect width={540} height={1920} fill="#2a1010" /><Glow x={270} y={760} r={520} c="#ff6a2a" o={.4} id="drS" />
  <path d="M-60,1920 L-60,560 Q270,260 600,560 L600,1920 Z" fill="#140606" />
  <DragonFront x={270} y={820} s={1.1} t={t} roar={Math.max(0, Math.sin(t * 2.2)) * .5} />
  <Motes n={20} t={t} c="#ffb04a" seed={63} area={[0, 500, 540, 900]} vy={-60} size={6} /></g>);
export const Split: React.FC<P> = ({ t, T }) => (<Choice t={t} left={{ title: 'ЭЛЬФИЙКИ', sub: 'ЛЕС ЭЛЬФИЕК', col: '#7dffb0', art: <ElfSide t={T} /> }} right={{ title: 'ДРАКОН', sub: 'ЛОГОВО ДРАКОНА', col: '#ff9a5a', art: <DragonSide t={T} /> }}
  center={<div style={html({ left: 0, width: 1080, top: 1480, textAlign: 'center', opacity: out(win(t, 1.2, 1.5)) })}><span style={{ background: '#ffd23f', color: '#14121c', fontWeight: 900, fontSize: 38, padding: '8px 24px', borderRadius: 12 }}>СЕРИЯ 2 — ПО ВАШЕМУ ВЫБОРУ</span></div>} />);
