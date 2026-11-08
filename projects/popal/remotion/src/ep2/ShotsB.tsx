// Планы серии 2, часть 2 (план → бой → награда → Король → суккуба → выбор).
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { SHOT, WORD_AT } from './timeline.mjs';
import { clamp, lerp, out, io, spr, win, shake, shakeMany } from '../anim';
import { C } from '../theme';
import { Person, POSES, blendPose } from '../chars/Person';
import { KingBull, Succubus, Slime, ChibiSlime } from '../chars/Cast';
import { Imp, ImpBoss, Cage } from '../chars/Cast2';
import { ElfForest, ImpCamp, Cauldron, ElfNight, Campfire } from '../bg/Bg2';
import { Throne, Glow, Motes } from '../bg/Bg';
import { Frame, Cam, Tag, Onomato, SysWindow, Choice } from '../ui/Ui';
import { Puffs, AuraFlame } from '../ep1/Shots';
import { Silh } from '../ep1/Shots3';
import { mouth, dur, html, FlyPan, CampScene, SIT, P } from './ShotsA';

const W = (id: string, i: number, shot: string) => WORD_AT(id, i) - SHOT[shot].a;
const AIM = (d: number) => ({ armR: [1.57, 0] as [number, number], armL: [lerp(1.2, 1.75, d), lerp(.5, 2.2, d)] as [number, number], legL: [-.2, .05] as [number, number], legR: [.2, -.05] as [number, number] });
const Bush: React.FC<{ y: number; t: number }> = ({ y, t }) => <g>{Array.from({ length: 9 }, (_, i) => <circle key={i} cx={i * 135 - 20} cy={y + (i % 2) * 40 + Math.sin(t * 1.5 + i) * 4} r={170} fill={i % 2 ? '#1e3a2a' : '#173022'} />)}<rect x={0} y={y + 80} width={1080} height={900} fill="#173022" /></g>;

// ───────────── 15. План в кустах ─────────────
export const Plan: React.FC<P> = ({ t, T }) => (<Frame bg="#120a24"><Cam z={lerp(1.0, 1.06, t / dur('plan'))} fy={900}>
  <g transform="translate(540,700) scale(.6) translate(-540,-1300)"><CampScene T={T} /></g>
  <rect width={1080} height={1920} fill="#0a0614" opacity={.25} />
  <Person x={360} y={1500} s={1.1} t={T} look="lira" bowBack expr={W('k3', 0, 'plan') < t ? 'smug' : 'determined'} mouth={mouth('lira', T)} eye={[.8, -.1]} />
  <Person x={740} y={1500} s={1.1} t={T} hold="pan" slap={1} expr={t > W('k2', 0, 'plan') - .1 ? 'shock' : 'neutral'} mouth={mouth('max', T)} eye={[-.8, -.1]} flip />
  <Bush y={1080} t={T} /><Glow x={540} y={700} r={500} c="#ff6a1a" o={.25} id="planG" />
</Cam></Frame>);

// ───────────── 16. Макс «отвлекает»: ветка, котёл, все бесы смотрят ─────────────
export const Oops: React.FC<P> = ({ t, T }) => { const snap = .2, splash = .85, k = clamp((t - .3) / (splash - .3)), s = shake(t, splash, 18, .4), turn = t > 1.2 ? 1 : 0;
  return (<><Frame bg="#120a24"><Cam z={lerp(1.0, 1.15, io(win(t, 1.2, dur('oops'))))} fy={1200} dy={-200 + s[1]} dx={s[0]}>
    <CampScene T={T} turn={turn} dance={t < splash} dent={t > splash ? clamp(1 - (t - splash) * 2) : 0}>
      {t < splash ? <Person x={lerp(1000, 640, k)} y={lerp(1560, 1380, k * k)} s={.62} t={T} rot={lerp(0, -95, k * k)} pose={t < snap ? POSES.stand : POSES.fall} expr="shock" flip />
        : <g><clipPath id="potC"><rect x={0} y={0} width={1080} height={1375} /></clipPath><g clipPath="url(#potC)"><Person x={556} y={1150} s={.62} t={T} rot={180} pose={{ armL: [-.3, .2], armR: [.3, -.2], legL: [-.5 + Math.sin(t * 18) * .3, .3], legR: [.5 - Math.sin(t * 18) * .3, -.3] }} expr="pain" shadow={false} /></g>
          <Cauldron x={545} y={1440} s={.7} t={T} dent={clamp(1 - (t - splash) * 2)} /></g>}
    </CampScene></Cam></Frame>
    <Onomato t={t} t0={snap} x={850} y={760} text="ХРУСТЬ" col="#d8c8a8" size={90} rot={8} dur={.6} />
    <Onomato t={t} t0={splash} x={380} y={700} text="БДЗЫНЬ!" col={C.yellow} size={140} rot={-8} /></>); };

// ───────────── 17. Спиной к спине ─────────────
export const Backs: React.FC<P> = ({ t, T }) => { const rot = lerp(-4, 4, io(win(t, 0, dur('backs'))));
  return (<Frame bg="#120a24"><Cam z={lerp(1.0, 1.12, io(win(t, 0, dur('backs'))))} rot={rot} fy={1100} dy={-120}><ImpCamp t={T} />
    {Array.from({ length: 8 }, (_, i) => { const a = i / 8 * Math.PI * 2 + t * .4, back = Math.sin(a) < 0; return back ? <Imp key={i} x={540 + Math.cos(a) * 470} y={1430 + Math.sin(a) * 90} s={.5} t={T + i} seed={i} state="attack" flip={Math.cos(a) > 0} /> : null; })}
    <Person x={440} y={1620} s={1.0} t={T} hold="pan" panGlow={.6} pose={POSES.heroic} expr="determined" flip slap={1} />
    <Person x={640} y={1620} s={.98} t={T} look="lira" hold="bow" draw={.9} pose={AIM(.9)} expr="determined" />
    {Array.from({ length: 8 }, (_, i) => { const a = i / 8 * Math.PI * 2 + t * .4, front = Math.sin(a) >= 0; return front ? <Imp key={'f' + i} x={540 + Math.cos(a) * 470} y={1530 + Math.sin(a) * 140} s={.62} t={T + i} seed={i} state="attack" flip={Math.cos(a) > 0} /> : null; })}
  </Cam></Frame>); };

// ───────────── 18. Бой: стрелы и бонки ─────────────
const BONKS = [.9, 1.6, 2.3, 3.0];
export const Fight: React.FC<P> = ({ t, T }) => { const s = shakeMany(t, BONKS.map(b => [b, 14, .25] as [number, number, number])), hitMax = [.55, 2.0];
  const last = BONKS.filter(b => t >= b - .25).pop() ?? -1, sw = last > 0 ? clamp((t - (last - .25)) / .25) : 0;
  const pose = last < 0 ? POSES.stand : blendPose(POSES.throwBack, POSES.throwFwd, out(sw));
  const shots = [.4, 1.25, 2.9], combo = BONKS.filter(b => t >= b).length;
  return (<><Frame bg="#120a24"><Cam z={1.05} dx={s[0]} dy={s[1] - 160} fy={1200}><ImpCamp t={T} />
    {BONKS.map((b, i) => { const k = t < b ? clamp((t - (b - .9)) / .9) : 1, fly = Math.max(0, t - b);
      return t < b - .9 ? null : <Imp key={i} x={t < b ? lerp(-120, 250, k) : 250 - fly * 900} y={t < b ? 1650 - Math.sin(k * Math.PI) * 120 : 1600 - fly * 1500 + fly * fly * 900} s={.62} t={T + i} seed={i} state={t < b ? 'attack' : 'ko'} rot={fly * 900} flip />; })}
    {shots.map((b, i) => { const fly = t - b; return fly < 0 ? null : <g key={'a' + i}>{fly < .3 && <path d={`M${700 + fly * 1500},${1290 - i * 10} l90,0`} stroke="#8a5a32" strokeWidth={8} />}
      {fly >= .3 && <Imp x={1000 - i * 40} y={1640} s={.55} t={T + 3 + i} seed={i + 1} state="ko" />}</g>; })}
    <Person x={420} y={1680} s={1.0} t={T} hold="pan" panGlow={.5} pose={pose} expr="determined" flip slap={1} />
    <Person x={720} y={1680} s={.98} t={T} look="lira" hold="bow" draw={shots.some(b => t > b - .4 && t < b) ? .9 : .2} pose={AIM(.8)} expr="determined" mouth={mouth('lira', T)} />
  </Cam></Frame>
    {BONKS.map((b, i) => <Onomato key={i} t={t} t0={b} x={i % 2 ? 300 : 200} y={i % 2 ? 640 : 820} text="БОНК!" col={C.yellow} size={120} rot={i % 2 ? 8 : -8} dur={.6} />)}
    {combo > 0 && <div style={html({ right: 70, top: 440, fontSize: 90, fontWeight: 900, color: C.yellow, WebkitTextStroke: '12px #14121c', paintOrder: 'stroke fill', transform: `scale(${lerp(1.4, 1, out(win(t, BONKS[combo - 1], BONKS[combo - 1] + .2)))}) rotate(6deg)` })}>КОМБО ×{combo}</div>}
    {hitMax.map((h, i) => t > h && t < h + .4 ? <div key={i} style={html({ left: 0, top: 0, width: 1080, height: 1920, boxShadow: 'inset 0 0 160px rgba(229,56,59,.7)' })} /> : null)}</>); };

// ───────────── 19. Главный бес ─────────────
export const Boss: React.FC<P> = ({ t, T }) => { const steps = [.3, 1.0], s = shakeMany(t, steps.map(b => [b, 16, .35] as [number, number, number])), walk = io(win(t, 0, 1.2));
  return (<><Frame bg="#120a24"><Cam z={lerp(1.1, 1.0, walk)} fy={1100} dy={-60 + s[1]} dx={s[0]}><ImpCamp t={T} />
    <ImpBoss x={540} y={lerp(1330, 1520, walk)} s={lerp(.85, 1.05, walk)} t={T} mouth={mouth('imp', T)} swing={Math.max(0, Math.sin(t * 2.4)) * .3} />
    <Puffs t={t} t0={.3} x={540} y={1520} n={8} col="#8a7a7a" spread={300} up={60} size={60} id="bossP1" />
    <Person x={160} y={1820} s={.9} t={T} hold="pan" expr="scared" sweat={1} eye={[.7, -.5]} slap={1} />
    <Person x={930} y={1820} s={.88} t={T} look="lira" hold="bow" draw={.3} pose={AIM(.3)} expr="determined" flip />
  </Cam></Frame><Tag t={t} t0={.5} x={70} y={430} title="ГЛАВНЫЙ БЕС" sub="ЖРЁТ ВСЁ, ЧТО БЛЕСТИТ" col={C.red} w={560} /></>); };

// ───────────── 20. Рикошет и КРИТ ─────────────
const PTS: [number, number][] = [[230, 1690], [330, 1180], [560, 1560], [770, 1150], [900, 1600], [540, 980]];
export const Rico: React.FC<P> = ({ t, T }) => { const rel = .4, times = [rel, .75, 1.0, 1.25, 1.5, 1.95], crit = 1.95, s = shake(t, crit, 30, .6);
  let px = PTS[0][0], py = PTS[0][1]; for (let i = 0; i < times.length - 1; i++) if (t >= times[i] && t < times[i + 1]) { const k = (t - times[i]) / (times[i + 1] - times[i]); px = lerp(PTS[i][0], PTS[i + 1][0], k); py = lerp(PTS[i][1], PTS[i + 1][1], k); }
  if (t >= crit) { const f = t - crit; px = 540 - f * 300; py = 980 - f * 700 + f * f * 1400; }
  const trail = PTS.slice(0, times.filter(x => t >= x).length).map(p => p.join(',')).join(' L');
  return (<><Frame bg="#120a24"><Cam z={t > crit ? lerp(1.0, 1.12, out(win(t, crit, crit + .4))) : 1.0} dx={s[0]} dy={s[1] - 100} fy={1100}><ImpCamp t={T} />
    <ImpBoss x={540} y={1500} s={.95} t={T} ko={out(win(t, crit + .1, crit + .8))} hit={t > crit ? (t - crit) / .3 : 0} />
    {[1, 2, 3, 4].map(i => <Imp key={i} x={PTS[i][0]} y={i % 2 ? 1450 : 1640} s={.5} t={T + i} seed={i} state={t > times[i] ? 'ko' : 'attack'} flip={i > 2} />)}
    {t > rel && <path d={`M${trail} L${px},${py}`} stroke="#ffd23f" strokeWidth={10} fill="none" opacity={.5} strokeDasharray="30 20" />}
    <Person x={180} y={1840} s={.95} t={T} hold={t < rel ? 'pan' : null} pose={t < rel ? blendPose(POSES.stand, POSES.throwBack, out(win(t, 0, rel))) : POSES.throwFwd} expr="determined" mouth={mouth('max', T)} slap={1} />
    {t >= rel && <FlyPan x={px} y={py} r={t * 1600} s={.55} />}
  </Cam></Frame>
    {times.slice(1, 5).map((b, i) => <Onomato key={i} t={t} t0={b} x={PTS[i + 1][0]} y={Math.min(PTS[i + 1][1] - 300, 1050)} text="БОНК" col="#ffe88a" size={70} rot={i % 2 ? 8 : -8} dur={.45} />)}
    <Onomato t={t} t0={crit} x={540} y={640} text="КРИТ!" col={C.red} size={190} rot={-6} dur={1.0} /></>); };

// ───────────── 21. Аура — тысяча, новый союзник ─────────────
export const LevelUp: React.FC<P> = ({ t, T }) => { const k = out(win(t, .3, 1.0));
  return (<><Frame bg="#2a1440"><Cam z={lerp(1.0, 1.1, io(win(t, 0, dur('levelup'))))} fy={1300}><ImpCamp t={T} dark={.1} />
    <ImpBoss x={980} y={1720} s={.6} t={T} ko={1} />
    <AuraFlame t={T} x={430} y={1800} k={k} />
    <Person x={430} y={1800} s={1.25} t={T} pose={blendPose(POSES.stand, POSES.heroic, spr(t, .2, { damping: 9 }))} hold="pan" panGlow={k} expr="cool" eye={[.2, -.2]} slap={1} />
    <Person x={760} y={1780} s={1.15} t={T} look="lira" bowBack expr="smug" pose={{ armL: [-.55, 1.6], armR: [.55, -1.6], legL: [-.08, .04], legR: [.08, -.04] }} eye={[-.8, -.2]} flip />
  </Cam></Frame><SysWindow t={t} t0={W('n1', 4, 'levelup') - .1} title="НОВЫЙ СОЮЗНИК" sub="ЛИРА · ЛУЧНИЦА" y={400} col="#7dffb0" /></>); };

// ───────────── 22. Сёстры свободны ─────────────
export const Freed: React.FC<P> = ({ t, T }) => { const hug = out(win(t, .3, .9)), kiss = [1.2, 1.6, 2.0].filter(k => t >= k).length;
  return (<Frame bg="#120a24"><Cam z={lerp(1.0, 1.12, io(win(t, 0, dur('freed'))))} fy={1000} dy={-120}><ImpCamp t={T} dark={.05} />
    <Cage x={130} y={1400} s={.7} t={T} open={1} /><Cage x={950} y={1400} s={.7} t={T} open={1} />
    <Person x={lerp(180, 330, hug)} y={1680} s={.95} t={T} look="elf2" expr="happy" mouth={mouth('elves', T)} pose={{ armL: [-.3, .2], armR: [2.0, -.6] }} blush={.8} />
    <Person x={lerp(900, 750, hug)} y={1680} s={.95} t={T} look="elf3" expr="happy" mouth={mouth('elves', T + .1)} pose={{ armL: [-2.0, .6], armR: [.3, -.2] }} blush={.8} flip />
    <Person x={540} y={1700} s={1.05} t={T} expr="happy" mouth={mouth('max', T)} blush={1} kisses={kiss} pose={POSES.shrug} />
    <Person x={lerp(400, 600, hug)} y={1760} s={.85} t={T} look="elf4" expr="happy" mouth={mouth('elves', T + .2)} pose={POSES.armsUp} blush={.8} />
    {[1.2, 1.6, 2.0].map((k, i) => t > k && t < k + 1.2 ? <path key={i} transform={`translate(${470 + i * 70},${700 - (t - k) * 200}) scale(${2 - (t - k)})`} d="M0,12 C-30,-10 -24,-34 0,-22 C24,-34 30,-10 0,12 Z" fill="#ff4a8a" opacity={1 - (t - k) / 1.2} /> : null)}
  </Cam></Frame>); };

// ───────────── 23. Лира оттаскивает Макса за ухо ─────────────
export const Jealous: React.FC<P> = ({ t, T }) => { const drag = io(win(t, .3, dur('jealous')));
  return (<Frame bg="#120a24"><Cam z={1.06} fy={1000} dy={-120}><ImpCamp t={T} dark={.05} />
    <Person x={260} y={1720} s={.85} t={T} look="elf2" expr="sad" pose={{ armL: [-.2, .2], armR: [2.4 + Math.sin(T * 7) * .3, -.3] }} />
    <Person x={lerp(560, 760, drag)} y={1700} s={1.05} t={T} expr="pain" kisses={3} pose={{ ...POSES.stand, lean: .32, armL: [-1.4, .4], armR: [1.2, .4] }} headTilt={14} sweat={.8} />
    <Person x={lerp(820, 1000, drag)} y={1690} s={1.05} t={T} look="lira" bowBack expr="determined" mouth={mouth('lira', T)} pose={{ ...POSES.stand, armR: [-2.0, -.6] }} flip />
  </Cam></Frame>); };

// ───────────── 24. Король демонов: «Лилиана — твой выход» ─────────────
export const ThroneEp2: React.FC<P> = ({ t, T }) => { const bx = 540, by = 1360;
  return (<Frame bg="#1a0a1e"><Cam z={lerp(1.0, 1.08, io(win(t, 0, dur('throne'))))} fy={1000}><Throne t={T} />
    <Silh x={130} y={1640} s={1.0} kind="succ" t={T} /><Silh x={950} y={1640} s={1.0} kind="knight" t={T} />
    {[-1, 1].map(sd => <g key={sd}><rect x={bx + sd * 300 - 80} y={by - 20} width={160} height={80} rx={18} fill="#2a1424" /><rect x={bx + sd * 300 - 70} y={by + 60} width={140} height={360} fill="#1a0c18" /></g>)}
    {[-1, 1].map(sd => <g key={'l' + sd}><path d={`M${bx + sd * 40},${by + 40} L${bx + sd * 230},${by + 40} L${bx + sd * 250},${by + 230} L${bx + sd * 60},${by + 240} Z`} fill="#1c1820" />
      <path d={`M${bx + sd * 80},${by + 230} L${bx + sd * 230},${by + 230} L${bx + sd * 220},${by + 470} L${bx + sd * 100},${by + 470} Z`} fill="#141118" /></g>)}
    <KingBull x={bx} y={by + 30} s={1.0} t={T} mouth={mouth('king', T)} />
    {/* в шаре — картинка боя: сковорода и поверженные бесы */}
    <g transform={`translate(${bx + 260},${by - 170})`}><circle r={70} fill="#2a0a3a" opacity={.8} /><g transform="scale(.18)"><FlyPan x={0} y={-60} r={T * 200} s={1.2} /><Imp x={0} y={260} s={1} t={T} state="ko" /></g><circle r={70} fill="none" stroke="#ff7ad9" strokeWidth={5} opacity={.6} /></g>
  </Cam></Frame>); };

// ───────────── 25. Костёр: появляется суккуба ─────────────
const PinkSmoke: React.FC<{ t: number; t0: number; x: number; y: number; k?: number }> = ({ t, t0, x, y, k = 1 }) => t < t0 ? null : (<g opacity={k}>
  <defs><radialGradient id="pink"><stop offset="0" stopColor="#ff9ae0" stopOpacity=".95" /><stop offset="1" stopColor="#ff4ab0" stopOpacity="0" /></radialGradient></defs>
  {Array.from({ length: 12 }, (_, i) => { const a = i / 12 * 6.28, q = out(clamp((t - t0) / .8)), r = 60 + q * 260 + Math.sin(t * 2 + i) * 20;
    return <circle key={i} cx={x + Math.cos(a) * r} cy={y + Math.sin(a) * r * .45 - q * 40} r={110 + q * 60} fill="url(#pink)" />; })}</g>);
export const Campfire2: React.FC<P> = ({ t, T }) => { const app = out(win(t, .5, 1.2));
  return (<Frame bg="#0e1636"><Cam z={lerp(1.0, 1.08, io(win(t, 0, dur('campfire'))))} fy={1200} dy={-120}><ElfNight t={T} pink={app} />
    <Campfire x={420} y={1640} s={.8} t={T} />
    <Person x={220} y={1720} s={.85} t={T} pose={POSES.lotus} hold="pan" expr={t > .6 ? 'shock' : 'neutral'} eye={[.9, -.3]} kisses={3} />
    <Slime x={290} y={1180} s={.45} t={T} look={[.9, -.2]} />
    <g opacity={app} transform={`translate(0,${(1 - app) * 80})`}><Succubus x={780} y={1500} s={.85} t={T} mouth={mouth('succ', T)} /></g>
    <PinkSmoke t={t} t0={.3} x={780} y={1500} k={clamp(1.6 - t * .3)} />
    <Motes n={20} t={T} c="#ff9ae0" seed={95} area={[500, 800, 580, 900]} vy={-40} size={7} />
  </Cam></Frame>); };

// ───────────── 26. «Цена — одна ночь» ─────────────
export const Offer: React.FC<P> = ({ t, T }) => (<Frame bg="#3a0a3a"><Cam z={lerp(1.0, 1.06, t / dur('offer'))} fy={900}>
  <rect width={1080} height={1920} fill="#2a0a2e" /><Glow x={540} y={760} r={760} c="#ff4ab0" o={.55} id="offG" />
  {Array.from({ length: 10 }, (_, i) => { const q = (t * .4 + i / 10) % 1; return <path key={i} transform={`translate(${100 + (i * 97) % 880},${1600 - q * 1300}) scale(${1 + (i % 3) * .5})`} d="M0,12 C-30,-10 -24,-34 0,-22 C24,-34 30,-10 0,12 Z" fill="#ff7ad9" opacity={.6 * (1 - q)} />; })}
  <Succubus x={540} y={1450} s={1.7} t={T} mouth={mouth('succ', T)} />
  <path d={`M760,1400 C900,1300 ${960 + Math.sin(t * 3) * 30},1150 ${900 + Math.sin(t * 3) * 40},1000`} stroke="#2a0f3a" strokeWidth={16} fill="none" strokeLinecap="round" />
  <path transform={`translate(${900 + Math.sin(t * 3) * 40},990) rotate(${Math.sin(t * 3) * 10}) scale(1.8)`} d="M0,12 C-30,-10 -24,-34 0,-22 C24,-34 30,-10 0,12 Z" fill="#ff3a9a" />
</Cam></Frame>);

// ───────────── 27. «Это ловушка?» — «Сто процентов» — «…Но какая» ─────────────
export const Trap: React.FC<P> = ({ t, T }) => { const q6 = t > W('q6', 0, 'trap') - .15;
  return (<Frame bg="#0e1636"><Cam z={lerp(1.0, 1.06, t / dur('trap'))} fy={900}><ElfNight t={T} pink={.5} /><Campfire x={200} y={1900} s={1.1} t={T} />
    <Person x={540} y={2350} s={2.1} t={T} expr={q6 ? 'smug' : 'scared'} sweat={q6 ? 0 : 1} blush={q6 ? 1 : 0} mouth={mouth('max', T)} kisses={3} eye={[.7, -.1]} />
    <Slime x={860} y={1180} s={.8} t={T} mouth={mouth('slime', T)} look={[-.8, .2]} />
  </Cam></Frame>); };

// ───────────── 28. Чиби-Желе спрашивает зрителей ─────────────
export const Ask: React.FC<P> = ({ t, T }) => { const look = t < 1.4 ? -1 : t < 2.4 ? 1 : Math.sin(t * 3), point = clamp((t - .5) / .3);
  return (<Frame bg="#0e1636"><Cam z={lerp(1.0, 1.05, t / dur('ask'))}><ElfNight t={T} pink={.4} /><Campfire x={540} y={1760} s={.7} t={T} />
    <g opacity={.9}><Succubus x={880} y={1650} s={.55} t={T} /></g>
    <Person x={190} y={1760} s={.75} t={T} pose={POSES.lotus} hold="pan" expr="neutral" kisses={3} eye={[look * .8, -.4]} />
    <ChibiSlime x={540} y={1140} s={.75} t={T} mouth={mouth('slime', T)} point={point} look={look} />
  </Cam></Frame>); };

// ───────────── 29. Сплит-экран: согласиться или отказать ─────────────
const YesSide: React.FC<{ t: number }> = ({ t }) => (<g><rect width={540} height={1920} fill="#3a0a3a" /><Glow x={270} y={760} r={560} c="#ff4ab0" o={.55} id="yesS" />
  <Succubus x={270} y={1120} s={1.05} t={t} /><Motes n={20} t={t} c="#ff9ae0" seed={97} area={[0, 300, 540, 900]} vy={-40} size={7} /></g>);
const NoSide: React.FC<{ t: number }> = ({ t }) => (<g><rect width={540} height={1920} fill="#123a2a" /><Glow x={270} y={760} r={560} c="#7dffb0" o={.45} id="noS" />
  <Person x={170} y={1060} s={.6} t={t} hold="pan" panGlow={.7} pose={POSES.heroic} expr="cool" />
  <Person x={390} y={1060} s={.58} t={t} look="lira" hold="bow" draw={.8} pose={{ armR: [1.57, 0], armL: [1.75, 2.2] }} expr="determined" flip />
  <Motes n={20} t={t} c="#bfffd8" seed={99} area={[0, 300, 540, 900]} vy={-30} size={7} /></g>);
export const Split: React.FC<P> = ({ t, T }) => (<Choice t={t} left={{ title: 'СОГЛАСИТЬСЯ', size: 52, sub: 'ОДНА НОЧЬ С СУККУБОЙ', col: '#ff9ae0', art: <YesSide t={T} /> }} right={{ title: 'ОТКАЗАТЬ', size: 52, sub: 'БОЙ СО СКОВОРОДОЙ', col: '#7dffb0', art: <NoSide t={T} /> }}
  center={<div style={html({ left: 0, width: 1080, top: 1480, textAlign: 'center', opacity: out(win(t, 1.2, 1.5)) })}><span style={{ background: '#ffd23f', color: '#14121c', fontWeight: 900, fontSize: 38, padding: '8px 24px', borderRadius: 12 }}>СЕРИЯ 3 — ПО ВАШЕМУ ВЫБОРУ</span></div>} />);
