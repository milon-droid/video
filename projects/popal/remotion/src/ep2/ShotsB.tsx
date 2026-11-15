// Планы серии 2, часть 2 (план → бой → награда → Король → суккуба → выбор).
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { SHOT, WORD_AT } from './timeline.mjs';
import { clamp, lerp, out, io, spr, win, shake, shakeMany } from '../anim';
import { C } from '../theme';
import { Person, POSES, blendPose, Pan } from '../chars/Person';
import { KingBull, Slime, ChibiSlime } from '../chars/Cast';
import { Imp, ImpBoss, Cage, Pic, Liliana } from '../chars/Cast2';
import { ElfForest, ImpCamp, Cauldron, ElfNight, Campfire } from '../bg/Bg2';
import { Throne, Glow, Motes } from '../bg/Bg';
import { Frame, Cam, Tag, Onomato, SysWindow, Choice } from '../ui/Ui';
import { Puffs, AuraFlame } from '../ep1/Shots';
import { Silh } from '../ep1/Shots3';
import { mouth, dur, html, FlyPan, CampScene, SIT, P } from './ShotsA';
const bell = (t: number, c: number, w: number) => Math.exp(-(((t - c) / w) ** 2));

const W = (id: string, i: number, shot: string) => WORD_AT(id, i) - SHOT[shot].a;
const AIM = (d: number) => ({ armR: [1.57, 0] as [number, number], armL: [lerp(1.2, 1.75, d), lerp(.5, 2.2, d)] as [number, number], legL: [-.2, .05] as [number, number], legR: [.2, -.05] as [number, number] });
const Bush: React.FC<{ y: number; t: number }> = ({ y, t }) => <g>{Array.from({ length: 9 }, (_, i) => <circle key={i} cx={i * 135 - 20} cy={y + (i % 2) * 40 + Math.sin(t * 1.5 + i) * 4} r={170} fill={i % 2 ? '#1e3a2a' : '#173022'} />)}<rect x={0} y={y + 80} width={1080} height={900} fill="#173022" /></g>;

// ───────────── 15. План в кустах ─────────────
export const Plan: React.FC<P> = ({ t, T }) => (<Frame bg="#120a24"><Cam z={lerp(1.0, 1.06, t / dur('plan'))} fy={900}>
  <g transform="translate(540,700) scale(.6) translate(-540,-1300)"><CampScene T={T} /></g>
  <rect width={1080} height={1920} fill="#0a0614" opacity={.25} />
  <Person x={360} y={1500} s={1.1} t={T} look="lira" bowBack expr={W('k3', 0, 'plan') < t ? 'smug' : 'determined'} mouth={mouth('lira', T)} eye={[.8, -.1]} />
  <Person x={740} y={1500} s={1.1} t={T} hold="pan" slap={1} expr={t > W('k2', 0, 'plan') - .1 ? 'shock' : 'neutral'} mouth={mouth('max', T)} eye={[-.8, -.1]} />
  <Bush y={1080} t={T} /><Glow x={540} y={700} r={500} c="#ff6a1a" o={.25} id="planG" />
</Cam></Frame>);

// ───────────── 16. Макс «отвлекает»: ветка, котёл, все бесы смотрят ─────────────
const STUMBLE = { armL: [-1.7, -.4], armR: [1.9, .6], legL: [.55, -1.2], legR: [-.35, -.5], lean: -.2 } as any;
export const Oops: React.FC<P> = ({ t, T }) => { const snap = .2, splash = .85, up = 2.75, k = clamp((t - .3) / (splash - .3)), s = shake(t, splash, 18, .4), turn = t > 1.2 ? 1 : 0, j = clamp((t - up) / .5);
  /* ветка под ногой → колени подгибаются → кувырок в котёл → выскакивает со сковородой */
  return (<><Frame bg="#120a24"><Cam z={lerp(1.0, 1.15, io(win(t, 1.2, dur('oops'))))} fy={1200} dy={-200 + s[1]} dx={s[0]}>
    <CampScene T={T} turn={turn} dance={t < splash} dent={t > splash ? clamp(1 - (t - splash) * 2) : 0}>
      {t < snap ? <path d="M960,1568 L1050,1556" stroke="#8a6a3a" strokeWidth={10} strokeLinecap="round" /> : <g opacity={clamp(1.4 - (t - snap))}><path d={`M${960 - (t - snap) * 60},${1568 - Math.sin((t - snap) * 6) * 30} l40,-8`} stroke="#8a6a3a" strokeWidth={10} strokeLinecap="round" /><path d={`M${1010 + (t - snap) * 70},${1560 - Math.sin((t - snap) * 6) * 40} l40,4`} stroke="#8a6a3a" strokeWidth={10} strokeLinecap="round" /></g>}
      {t < splash ? <Person x={lerp(1000, 640, k)} y={lerp(1560, 1380, k * k) - Math.sin(k * Math.PI) * 60} s={.62} t={T} rot={lerp(0, -150, k * k)} hold="pan" pose={t < snap ? POSES.stand : blendPose(STUMBLE, POSES.fall, k)} expr="shock" mouth={.7} />
        : t < up ? <g><clipPath id="potC"><rect x={0} y={0} width={1080} height={1375} /></clipPath><g clipPath="url(#potC)"><Person x={556} y={1150} s={.62} t={T} rot={180} pose={{ armL: [-.3, .2], armR: [.3, -.2], legL: [-.5 + Math.sin(t * 18) * .3, .3], legR: [.5 - Math.sin(t * 18) * .3, -.3] }} expr="pain" shadow={false} />
            <g transform={`translate(${640 + Math.sin(t * 9) * 8},1400) rotate(${20 + Math.sin(t * 7) * 10}) scale(.6)`}><Pan /></g></g>
          <Cauldron x={545} y={1440} s={.7} t={T} dent={clamp(1 - (t - splash) * 2)} /></g>
        : <g><Cauldron x={545} y={1440} s={.7} t={T} dent={0} />
          <Person x={lerp(556, 770, j)} y={lerp(1330, 1560, j * j) - Math.sin(j * Math.PI) * 230} s={.62} t={T} rot={(1 - j) * -30} hold="pan" panGlow={j} pose={j < 1 ? POSES.fall : POSES.heroic} expr={j < 1 ? 'shock' : 'determined'} mouth={j < 1 ? .6 : 0} />
          <Puffs t={t} t0={up} x={556} y={1320} n={8} col="#9dff8a" spread={200} up={160} size={44} id="potOut" /></g>}
    </CampScene></Cam></Frame>
    <Onomato t={t} t0={snap} x={850} y={760} text="ХРУСТЬ" col="#d8c8a8" size={90} rot={8} dur={.6} />
    <Onomato t={t} t0={splash} x={380} y={700} text="БДЗЫНЬ!" col={C.yellow} size={140} rot={-8} /></>); };

// ───────────── 17. Спиной к спине ─────────────
export const Backs: React.FC<P> = ({ t, T }) => { const rot = lerp(-4, 4, io(win(t, 0, dur('backs')))), pop = spr(t, 0, { damping: 11 });
  /* рисунок r05: Макс закрывает левый сектор сковородой, Лира целится вправо, спины соприкасаются */
  return (<Frame bg="#120a24"><Cam z={lerp(1.0, 1.12, io(win(t, 0, dur('backs'))))} rot={rot} fy={1100} dy={-120}><ImpCamp t={T} />
    {Array.from({ length: 8 }, (_, i) => { const a = i / 8 * Math.PI * 2 + t * .4, back = Math.sin(a) < 0; return back ? <Imp key={i} x={540 + Math.cos(a) * 500} y={1430 + Math.sin(a) * 90} s={.5} t={T + i} seed={i} state="attack" flip={Math.cos(a) > 0} /> : null; })}
    <ellipse cx={540} cy={1645} rx={330} ry={26} fill="#000" opacity={.3} /><Glow x={170} y={1180} r={170} c="#ffd23f" o={.35 + .15 * Math.sin(T * 5)} id="bkPan" />
    <Pic id="r05" x={540} y={1650 + Math.sin(T * 2.2) * 3} s={.7} ax={720} ay={999} sx={lerp(.9, 1, pop)} sy={lerp(1.1, 1, pop) + Math.sin(T * 2.2) * .006} />
    {Array.from({ length: 8 }, (_, i) => { const a = i / 8 * Math.PI * 2 + t * .4, front = Math.sin(a) >= 0; return front ? <Imp key={'f' + i} x={540 + Math.cos(a) * 500} y={1600 + Math.sin(a) * 150} s={.62} t={T + i} seed={i} state="attack" flip={Math.cos(a) > 0} /> : null; })}
  </Cam></Frame>); };

// ───────────── 18. Бой: выстрел Лиры (натяжение → отпускание → полёт → попадание), два бонка Макса, стрела прикрывает спину ─────────────
const WINDB = { armL: [-1.25, -.2], armR: [1.9, 1.0], legL: [-.38, .22], legR: [.3, -.12], lean: -.14 } as any, HIGH = { armL: [.35, .5], armR: [4.75, .25], legL: [-.42, .1], legR: [.42, -.5], lean: .2 } as any, LOW = { armL: [.5, .6], armR: [5.35, .15], legL: [-.5, .25], legR: [.5, -.75], lean: .34 } as any;
export const Fight: React.FC<P> = ({ t, T }) => { const SH = .6, AH = .85, CUT = 1.3, B1 = 1.95, B2 = 2.75, AR = 3.36;
  if (t < CUT) { const pan = io(win(t, SH, AH + .05)) * 560, ak = clamp((t - SH) / (AH - SH)), ax = lerp(888, 1470, ak), hitK = t - AH, rec = t >= SH ? Math.exp(-(t - SH) * 9) * 14 : 0;
    return (<><Frame bg="#120a24"><Cam z={1.0} dx={-pan} dy={-160} fy={1200}><ImpCamp t={T} /><g transform="translate(2160,0) scale(-1,1)"><ImpCamp t={T} /></g>
      <ellipse cx={500} cy={1645} rx={330} ry={24} fill="#000" opacity={.3} />
      {t < SH ? <Pic id="r05" x={199} y={1640} s={.62} ax={316} ay={999} /> : <Pic id="r06" x={199 - rec} y={1640} s={.734} ax={286} ay={850} />}
      {hitK < 0 ? <Imp x={lerp(1750, 1540, clamp(t / AH))} y={1500 - Math.sin(clamp(t / AH) * Math.PI * .8) * 260} s={.7} t={T} seed={2} state="attack" flip />
        : <Imp x={1540 + hitK * 700} y={1330 - hitK * 500 + hitK * hitK * 1900} s={.7} t={T} seed={2} state="ko" rot={hitK * 700} flip />}
      {t >= SH && t < AH && <g><path d={`M${ax - 150},1299 L${ax},1299`} stroke="#8a5a32" strokeWidth={9} strokeLinecap="round" /><path d={`M${ax},1299 l-26,-13 l0,26 Z`} fill="#c8c8d0" /><path d={`M${ax - 150},1299 l-22,-12 M${ax - 150},1299 l-22,12`} stroke="#7dffb0" strokeWidth={7} strokeLinecap="round" /><path d={`M${ax - 420},1299 L${ax - 170},1299`} stroke="#fff" strokeWidth={5} opacity={.4} /></g>}
      <Puffs t={t} t0={AH} x={1520} y={1300} n={6} col="#ffe27a" spread={140} up={40} size={40} id="arrP" />
    </Cam></Frame>
      <Onomato t={t} t0={SH} x={420} y={760} text="ВЖУХ!" col="#7dffb0" size={110} rot={-6} dur={.3} /><Onomato t={t} t0={AH} x={620} y={820} text="ТЮК!" col={C.yellow} size={150} rot={8} dur={.45} /></>); }
  const u = t - CUT, s = shakeMany(t, [[B1, 14, .25], [B2, 14, .25], [AR, 8, .2]]), combo = [B1, B2].filter(b => t >= b).length;
  const pose = t < B1 - .2 ? blendPose(POSES.stand, WINDB, out(win(u, 0, .3))) : t < B1 + .25 ? blendPose(WINDB, HIGH, io(win(t, B1 - .2, B1))) : t < B2 - .2 ? blendPose(HIGH, WINDB, io(win(t, B1 + .25, B2 - .25))) : t < B2 + .3 ? blendPose(WINDB, LOW, io(win(t, B2 - .2, B2))) : blendPose(LOW, POSES.stand, io(win(t, B2 + .3, B2 + .6)));
  const i1 = clamp((t - (B1 - .75)) / .75), f1 = Math.max(0, t - B1), i2 = clamp((t - (B2 - .7)) / .7), f2 = Math.max(0, t - B2), i3 = clamp((t - (AR - .7)) / .7), f3 = Math.max(0, t - AR), ak = clamp((t - (AR - .16)) / .16);
  return (<><Frame bg="#120a24"><Cam z={1.0} dx={s[0]} dy={s[1] - 160} fy={1200}><ImpCamp t={T} />
    {t > B1 - .75 && <Imp x={t < B1 ? lerp(-140, 300, i1) : 300 - f1 * 900} y={t < B1 ? 1640 - Math.sin(i1 * Math.PI * .75) * 330 : 1407 - f1 * 1300 + f1 * f1 * 1200} s={.62} t={T} seed={0} state={t < B1 ? 'attack' : 'ko'} rot={f1 * 900} />}
    {t > B2 - .7 && <Imp x={t < B2 ? lerp(-140, 370, i2) : 370 - f2 * 1100} y={t < B2 ? 1690 - Math.abs(Math.sin(i2 * 9)) * 24 : 1690 - f2 * 500 + f2 * f2 * 1500} s={.62} t={T + 1} seed={1} state={t < B2 ? 'attack' : 'ko'} rot={f2 * -800} />}
    <Person x={640} y={1680} s={1.0} t={T} hold="pan" panGlow={.5} pose={pose} expr="determined" slap={1} eye={t > AR - .3 ? [.6, -.8] : [-.9, t > B2 - .5 ? .5 : -.2]} headTilt={t > AR - .3 ? 8 : -4} />
    {t > AR - .7 && <Imp x={t < AR ? lerp(1120, 800, i3) : 800 + f3 * 900} y={t < AR ? lerp(700, 1040, i3 * i3) : 1040 - f3 * 700 + f3 * f3 * 1800} s={.62} t={T + 2} seed={3} state={t < AR ? 'attack' : 'ko'} rot={f3 * 800} flip />}
    {t > AR - .16 && t < AR + .25 && <g transform={`translate(${t < AR ? lerp(1180, 850, ak) : 850 + f3 * 900},${t < AR ? lerp(1120, 1010, ak) : 1010 - f3 * 700 + f3 * f3 * 1800}) rotate(-162)`}><path d="M-150,0 L0,0" stroke="#8a5a32" strokeWidth={9} strokeLinecap="round" /><path d="M0,0 l-26,-13 l0,26 Z" fill="#c8c8d0" /><path d="M-150,0 l-22,-12 M-150,0 l-22,12" stroke="#7dffb0" strokeWidth={7} strokeLinecap="round" /></g>}
    <Puffs t={t} t0={B1} x={300} y={1230} n={6} col="#ffe27a" spread={150} up={40} size={44} id="bk1" /><Puffs t={t} t0={B2} x={370} y={1450} n={6} col="#ffe27a" spread={150} up={40} size={44} id="bk2" />
  </Cam></Frame>
    <Onomato t={t} t0={B1} x={330} y={860} text="БОНК!" col={C.yellow} size={130} rot={-8} dur={.6} /><Onomato t={t} t0={B2} x={380} y={1040} text="БОНК!" col={C.yellow} size={130} rot={8} dur={.6} />
    <Onomato t={t} t0={AR} x={640} y={640} text="ПРИКРЫЛА!" col="#7dffb0" size={100} rot={-5} dur={.6} />
    {combo > 0 && t < AR && <div style={html({ right: 70, top: 440, fontSize: 90, fontWeight: 900, color: C.yellow, WebkitTextStroke: '12px #14121c', paintOrder: 'stroke fill', transform: `scale(${lerp(1.4, 1, out(win(t, [B1, B2][combo - 1], [B1, B2][combo - 1] + .2)))}) rotate(6deg)` })}>КОМБО ×{combo}</div>}</>); };

// ───────────── 19. Главный бес ─────────────
export const Boss: React.FC<P> = ({ t, T }) => { const steps = [.3, 1.0], s = shakeMany(t, steps.map(b => [b, 16, .35] as [number, number, number])), walk = io(win(t, 0, 1.2));
  return (<><Frame bg="#120a24"><Cam z={lerp(1.1, 1.0, walk)} fy={1100} dy={-60 + s[1]} dx={s[0]}><ImpCamp t={T} />
    <ImpBoss x={540} y={lerp(1330, 1520, walk)} s={lerp(.85, 1.05, walk)} t={T} mouth={mouth('imp', T)} swing={Math.max(0, Math.sin(t * 2.4)) * .3} />
    <Puffs t={t} t0={.3} x={540} y={1520} n={8} col="#8a7a7a" spread={300} up={60} size={60} id="bossP1" />
    <Person x={160} y={1820} s={.9} t={T} hold="pan" expr={t > .45 ? 'scared' : 'determined'} sweat={t > .45 ? 1 : 0} eye={[lerp(-.8, .7, io(win(t, .3, .55))), lerp(0, -.6, io(win(t, .3, .55)))]} headTilt={lerp(-5, 8, io(win(t, .3, .55)))} slap={1} />
    <Person x={930} y={1820} s={.88} t={T} look="lira" hold="bow" draw={lerp(.1, .5, io(win(t, .6, 1.2)))} pose={AIM(.3)} expr={t > .55 ? 'shock' : 'determined'} eye={[lerp(-.8, .7, io(win(t, .4, .65))), lerp(0, -.6, io(win(t, .4, .65)))]} flip />
  </Cam></Frame><Tag t={t} t0={.5} x={70} y={430} title="ГЛАВНЫЙ БЕС" sub="ЖРЁТ ВСЁ, ЧТО БЛЕСТИТ" col={C.red} w={560} /></>); };

// ───────────── 20. Рикошет и КРИТ ─────────────
// бросок от кисти → два беса → бес пытается проглотить («Подавись!») → БОНК изнутри, КРИТ → сковорода вылетает и возвращается в руку
const PTS: [number, number][] = [[300, 1470], [430, 1330], [800, 1330], [540, 1085]];
export const Rico: React.FC<P> = ({ t, T }) => { const rel = .4, times = [rel, .7, 1.0, 1.35], gulp = 1.35, in1 = 1.75, crit = 2.0, outT = 2.4, back = 3.05, s = shakeMany(t, [[in1, 12, .2], [crit, 30, .6]]);
  let px = PTS[0][0], py = PTS[0][1]; for (let i = 0; i < 3; i++) if (t >= times[i] && t < times[i + 1]) { const k = (t - times[i]) / (times[i + 1] - times[i]); px = lerp(PTS[i][0], PTS[i + 1][0], k); py = lerp(PTS[i][1], PTS[i + 1][1], k) - Math.sin(k * Math.PI) * 70; }
  const rk = clamp((t - outT) / (back - outT)), rx = lerp(540, 300, rk), ry = lerp(1085, 1440, rk) - Math.sin(rk * Math.PI) * 420;
  const inside = t >= gulp && t < outT, caught = t >= back, open = t < gulp ? out(win(t, .75, 1.2)) * 1.5 : t < outT ? 0 : clamp(1.5 - (t - outT) * 2), belly = Math.max(bell(t, in1, .09), bell(t, crit, .1));
  const trail = PTS.slice(0, times.filter(x => t >= x).length).map(q => q.join(',')).join(' L');
  return (<><Frame bg="#120a24"><Cam z={t > crit ? lerp(1.0, 1.1, out(win(t, crit, crit + .4))) : 1.0} dx={s[0]} dy={s[1] - 100} fy={1100}><ImpCamp t={T} />
    <ImpBoss x={540} y={1500} s={.95} t={T} mouth={open} ko={out(win(t, outT + .1, outT + .8))} hit={t > crit ? (t - crit) / .3 : t > gulp ? (t - gulp) / .35 : 0} />
    {inside && <g opacity={t < crit + .3 ? 1 : .5}><ellipse cx={540 + Math.sin(t * 50) * 6 * belly} cy={1230} rx={90 + belly * 70} ry={80 + belly * 60} fill="#ffd23f" opacity={.25 + belly * .5} /><g transform={`translate(${540 + Math.sin(t * 40) * 10},1240) rotate(${t * 900}) scale(.42) translate(0,120)`} opacity={.55 + belly * .45}><Pan glow={1} t={T} /></g></g>}
    {[1, 2].map(i => <Imp key={i} x={PTS[i][0]} y={1560} s={.5} t={T + i} seed={i} state={t > times[i] ? 'ko' : 'attack'} rot={t > times[i] ? Math.min(90, (t - times[i]) * 400) : 0} flip={i > 1} />)}
    {t > rel && t < gulp && <path d={`M${trail} L${px},${py}`} stroke="#ffd23f" strokeWidth={10} fill="none" opacity={.5} strokeDasharray="30 20" />}
    <Person x={180} y={1840} s={.95} t={T} hold={t < rel || caught ? 'pan' : null} panGlow={caught ? 1 : 0} pose={t < rel ? blendPose(POSES.stand, { ...POSES.throwBack, armR: [1.9, 1.0] }, out(win(t, 0, rel - .1))) : t < outT ? blendPose({ ...POSES.throwBack, armR: [1.9, 1.0] }, POSES.throwFwd, out(win(t, rel - .05, rel + .15))) : blendPose(POSES.throwFwd, POSES.heroic, io(win(t, outT, back)))} expr={caught ? 'cool' : 'determined'} mouth={mouth('max', T)} eye={[.7, -.5]} slap={1} />
    {t >= rel && t < gulp && <FlyPan x={px} y={py} r={t * 1600} s={.55} />}
    {t >= outT && !caught && <FlyPan x={rx} y={ry} r={t * 1300} s={.55} />}
    <Puffs t={t} t0={times[1]} x={PTS[1][0]} y={PTS[1][1]} n={5} col="#ffe27a" spread={110} up={30} size={36} id="rc1" /><Puffs t={t} t0={times[2]} x={PTS[2][0]} y={PTS[2][1]} n={5} col="#ffe27a" spread={110} up={30} size={36} id="rc2" />
  </Cam></Frame>
    <Onomato t={t} t0={times[1]} x={430} y={1000} text="БОНК" col="#ffe88a" size={80} rot={-8} dur={.4} /><Onomato t={t} t0={times[2]} x={800} y={1000} text="БОНК" col="#ffe88a" size={80} rot={8} dur={.4} />
    <Onomato t={t} t0={gulp} x={540} y={640} text="ГЛОТЬ!" col="#ffffff" size={150} rot={-5} dur={.5} /><Onomato t={t} t0={in1} x={760} y={1060} text="БОНК?!" col="#ffe88a" size={100} rot={8} dur={.3} />
    <Onomato t={t} t0={crit} x={540} y={640} text="КРИТ ИЗНУТРИ!" col={C.red} size={100} rot={-6} dur={1.0} /></>); };

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
    <Cage x={130} y={1400} s={.7} t={T} open={out(win(t, 0, .35))} /><Cage x={950} y={1400} s={.7} t={T} open={out(win(t, 0, .35))} />
    {[0, 1, 2, 3, 4].map(i => { const q = clamp((t - .2 - i * .25) / 2.6), sd = i % 2 ? 1 : -1; return q > 0 && q < 1 ? <Person key={i} x={540 + sd * (240 + q * 420)} y={1330 - q * 40} s={.36} t={T + i} look={(['elf3', 'elf4', 'elf2'] as const)[i % 3]} pose={{ armL: [-2.4, .3], armR: [2.4, -.3], legL: [Math.sin(T * 14 + i) * .6, -.4], legR: [-Math.sin(T * 14 + i) * .6, -.4] }} expr="happy" shadow={false} flip={sd < 0} /> : null; })}
    <Person x={lerp(140, 330, hug)} y={lerp(1420, 1680, hug)} s={.95} t={T} look="elf2" expr="happy" mouth={mouth('elves', T)} pose={{ armL: [-.3, .2], armR: [2.0, -.6] }} blush={.8} />
    <Person x={lerp(940, 750, hug)} y={lerp(1420, 1680, hug)} s={.95} t={T} look="elf3" expr="happy" mouth={mouth('elves', T + .1)} pose={{ armL: [-2.0, .6], armR: [.3, -.2] }} blush={.8} flip />
    <Person x={540} y={1700} s={1.05} t={T} hold="pan" expr="happy" mouth={mouth('max', T)} blush={1} kisses={kiss} pose={{ ...POSES.shrug, armR: [.9, 1.2] }} />
    <Person x={lerp(400, 600, hug)} y={1760} s={.85} t={T} look="elf4" expr="happy" mouth={mouth('elves', T + .2)} pose={POSES.armsUp} blush={.8} />
    {[1.2, 1.6, 2.0].map((k, i) => t > k && t < k + 1.2 ? <path key={i} transform={`translate(${470 + i * 70},${700 - (t - k) * 200}) scale(${2 - (t - k)})`} d="M0,12 C-30,-10 -24,-34 0,-22 C24,-34 30,-10 0,12 Z" fill="#ff4a8a" opacity={1 - (t - k) / 1.2} /> : null)}
  </Cam></Frame>); };

// ───────────── 23. Лира оттаскивает Макса за ухо ─────────────
export const Jealous: React.FC<P> = ({ t, T }) => { const drag = io(win(t, .45, dur('jealous'))), grab = out(win(t, .1, .4)), mx = lerp(620, 480, drag);
  /* Лира слева: её кисть обхватывает предплечье Макса (левая для зрителя рука), рывок и шаг Макса следом; сковорода — в другой руке */
  return (<Frame bg="#120a24"><Cam z={1.06} fy={1000} dy={-120}><ImpCamp t={T} dark={.05} />
    <Person x={900} y={1720} s={.85} t={T} look="elf2" expr="sad" pose={{ armL: [-2.4 + Math.sin(T * 7) * .3, .3], armR: [.2, -.2] }} flip />
    <Person x={mx} y={1700 - Math.abs(Math.sin(drag * Math.PI * 2)) * 14} s={1.05} t={T} hold="pan" expr="pain" kisses={3} pose={{ ...POSES.stand, lean: -.26 * grab, armL: [lerp(-.12, -1.5, grab), .1], armR: [.5, .9], legL: [-.3 - Math.sin(drag * Math.PI * 2) * .3, .2], legR: [.25 + Math.sin(drag * Math.PI * 2) * .3, -.3] }} headTilt={-12 * grab} sweat={.8} eye={[-.6, 0]} />
    <Person x={mx - 440} y={1690} s={1.05} t={T} look="lira" bowBack expr="determined" mouth={mouth('lira', T)} pose={{ ...POSES.stand, lean: -.1, armR: [lerp(.12, 1.25, grab), lerp(-.15, .3, grab)] }} eye={[.8, 0]} />
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
export const Campfire2: React.FC<P> = ({ t, T }) => { const app = out(win(t, .5, 1.2)), alert = io(win(t, .9, 1.4));
  return (<Frame bg="#0e1636"><Cam z={lerp(1.0, 1.08, io(win(t, 0, dur('campfire'))))} fy={1200} dy={-120}><ElfNight t={T} pink={app} />
    {/* Лира рядом: при появлении суккубы перестаёт улыбаться и берётся за лук */}
    <Person x={95} y={1650} s={.82} t={T} look="lira" hold="bow" draw={alert * .45} pose={blendPose({ ...POSES.stand, armR: [.3, -.4] } as any, { ...POSES.stand, armR: [1.45, 0], armL: [1.2, .9] } as any, alert)} expr={alert > .5 ? 'determined' : 'neutral'} eye={[.9, -.1]} />
    <Campfire x={450} y={1640} s={.8} t={T} />
    <Person x={260} y={1720} s={.85} t={T} pose={POSES.lotus} hold="pan" expr={t > .6 ? 'shock' : 'neutral'} eye={[.9, -.3]} kisses={3} />
    <Slime x={330} y={1180} s={.45} t={T} look={[.9, -.2]} />
    <g opacity={app} transform={`translate(0,${(1 - app) * 60})`}><Liliana x={800} y={1700} s={.92} t={T} mouth={mouth('succ', T)} /></g>
    {/* дым отдельным слоем: сначала скрывает низ фигуры, потом рассеивается */}
    <PinkSmoke t={t} t0={.3} x={800} y={1560} k={clamp(1.9 - t * .75)} />
    <Motes n={20} t={T} c="#ff9ae0" seed={95} area={[500, 800, 580, 900]} vy={-40} size={7} />
  </Cam></Frame>); };

// ───────────── 26. «Цена — одна ночь» ─────────────
export const Offer: React.FC<P> = ({ t, T }) => (<Frame bg="#3a0a3a"><Cam z={lerp(1.0, 1.06, t / dur('offer'))} fy={900}>
  <rect x={-200} y={-200} width={1500} height={2400} fill="#2a0a2e" /><Glow x={540} y={760} r={760} c="#ff4ab0" o={.55} id="offG" />
  {Array.from({ length: 10 }, (_, i) => { const q = (t * .4 + i / 10) % 1; return <path key={i} transform={`translate(${100 + (i * 97) % 880},${1600 - q * 1300}) scale(${1 + (i % 3) * .5})`} d="M0,12 C-30,-10 -24,-34 0,-22 C24,-34 30,-10 0,12 Z" fill="#ff7ad9" opacity={.6 * (1 - q)} />; })}
  <Liliana x={560} y={2420} s={2.45} t={T} mouth={mouth('succ', T)} />
</Cam></Frame>);

// ───────────── 27. «Это ловушка?» — «Сто процентов» — «…Но какая» ─────────────
export const Trap: React.FC<P> = ({ t, T }) => { const q6 = t > W('q6', 0, 'trap') - .15;
  return (<Frame bg="#0e1636"><Cam z={lerp(1.0, 1.06, t / dur('trap'))} fy={900}><ElfNight t={T} pink={.5} /><Campfire x={200} y={1900} s={1.1} t={T} />
    <Person x={540} y={2350} s={2.1} t={T} expr={q6 ? 'smug' : 'scared'} sweat={q6 ? 0 : 1} blush={q6 ? 1 : 0} mouth={mouth('max', T)} kisses={3} eye={[.7, -.1]} />
    {(() => { const h = io(win(t, .05, .45)); /* Желе отлипает от головы Макса и повисает сбоку */
      return <Slime x={lerp(560, 860, h)} y={lerp(900, 1180, h) - Math.sin(h * Math.PI) * 120} s={.95} t={T} mouth={mouth('slime', T)} look={[-.8, .2]} squish={h < 1 ? .3 : 0} />; })()}
  </Cam></Frame>); };

// ───────────── 28. Чиби-Желе спрашивает зрителей ─────────────
export const Ask: React.FC<P> = ({ t, T }) => { const look = t < 1.4 ? -1 : t < 2.4 ? 1 : Math.sin(t * 3), point = clamp((t - .7) / .3), hop = io(win(t, .05, .55));
  return (<Frame bg="#0e1636"><Cam z={lerp(1.0, 1.05, t / dur('ask'))}><ElfNight t={T} pink={.4} /><Campfire x={540} y={1760} s={.7} t={T} />
    <Liliana x={900} y={1760} s={.72} t={T} />
    <Person x={60} y={1700} s={.72} t={T} look="lira" hold="bow" draw={.4} pose={{ ...POSES.stand, armR: [1.45, 0], armL: [1.2, .9] }} expr="determined" eye={[.9, 0]} />
    <Person x={220} y={1760} s={.75} t={T} pose={POSES.lotus} hold="pan" expr="neutral" kisses={3} eye={[look * .8, -.4]} />
    <ChibiSlime x={lerp(290, 540, hop)} y={lerp(1420, 1140, hop) - Math.sin(hop * Math.PI) * 160} s={lerp(.22, .75, hop)} t={T} mouth={mouth('slime', T)} point={point} look={look} />
  </Cam></Frame>); };

// ───────────── 29. Сплит-экран: согласиться или отказать ─────────────
const YesSide: React.FC<{ t: number }> = ({ t }) => (<g><rect width={540} height={1920} fill="#3a0a3a" /><Glow x={270} y={760} r={560} c="#ff4ab0" o={.55} id="yesS" />
  <Liliana x={270} y={1100} s={.95} t={t} /><Motes n={20} t={t} c="#ff9ae0" seed={97} area={[0, 300, 540, 900]} vy={-40} size={7} /></g>);
const NoSide: React.FC<{ t: number }> = ({ t }) => (<g><rect width={540} height={1920} fill="#123a2a" /><Glow x={270} y={760} r={560} c="#7dffb0" o={.45} id="noS" />
  <ellipse cx={270} cy={1065} rx={200} ry={16} fill="#000" opacity={.3} /><Pic id="r05" x={270} y={1070 + Math.sin(t * 2) * 3} s={.36} ax={720} ay={999} />
  <Motes n={20} t={t} c="#bfffd8" seed={99} area={[0, 300, 540, 900]} vy={-30} size={7} /></g>);
export const Split: React.FC<P> = ({ t, T }) => (<Choice t={t} left={{ title: 'СОГЛАСИТЬСЯ', size: 52, sub: 'ПОЙТИ С ЛИЛИАНОЙ', col: '#ff9ae0', art: <YesSide t={T} /> }} right={{ title: 'ОТКАЗАТЬ', size: 52, sub: 'ОСТАТЬСЯ С ЛИРОЙ', col: '#7dffb0', art: <NoSide t={T} /> }}
  center={<div style={html({ left: 0, width: 1080, top: 1330, textAlign: 'center', opacity: out(win(t, 1.2, 1.4)) })}>
    <div style={{ transform: `scale(${spr(t, 1.2, { damping: 10 })})`, fontWeight: 900, fontSize: 70, lineHeight: 1.08, color: '#ffd23f', WebkitTextStroke: '13px #14121c', paintOrder: 'stroke fill' }}>ПИШИТЕ В КОММЕНТАХ:<br /><span style={{ color: '#ff9ae0' }}>А</span><span style={{ color: '#fff' }}> или </span><span style={{ color: '#7dffb0' }}>Б</span><span style={{ color: '#fff' }}>?</span></div>
    <div style={{ marginTop: 26, opacity: out(win(t, 2.2, 2.5)) }}><span style={{ background: '#ffd23f', color: '#14121c', fontWeight: 900, fontSize: 40, padding: '8px 24px', borderRadius: 12 }}>СЕРИЯ 3 — ПО ВАШЕМУ ВЫБОРУ</span></div></div>} />);
