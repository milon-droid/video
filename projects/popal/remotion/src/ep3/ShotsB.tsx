// Планы серии 3, часть 2 (пощада → яичница → карта → новый уровень → плащ).
import React from 'react';
import { clamp, lerp, out, io, spr, win, shake } from '../anim';
import { Person, POSES, blendPose } from '../chars/Person';
import { Slime } from '../chars/Cast';
import { Liliana } from '../chars/Cast2';
import { FriedEgg, Steam, MapCard } from '../chars/Cast3';
import { ElfNight, Campfire } from '../bg/Bg2';
import { Glow, Motes } from '../bg/Bg';
import { Frame, Cam, Tag, SysWindow } from '../ui/Ui';
import { Puffs, AuraFlame } from '../ep1/Shots';
import { FlyPan } from '../ep2/ShotsA';
import { P, mouth, dur, V, W, Heart, AIM } from './common';

const Log: React.FC<{ x: number; y: number; w: number }> = ({ x, y, w }) => <g><rect x={x} y={y} width={w} height={120} rx={60} fill="#5a3a2a" /><rect x={x + 30} y={y + 14} width={w - 90} height={22} rx={11} fill="#7a5238" opacity={.7} /><ellipse cx={x + w - 60} cy={y + 60} rx={44} ry={58} fill="#c9a06a" /><ellipse cx={x + w - 60} cy={y + 60} rx={22} ry={30} fill="none" stroke="#8a6a3a" strokeWidth={5} /></g>;

// ───────────── 9. «Добить?» — «Стой. Она просто на работе» ─────────────
export const Mercy: React.FC<P> = ({ t, T }) => { const stop = spr(t, V('g2', 'mercy') - .1, { damping: 11 }), d = lerp(.85, .1, stop);
  return (<Frame bg="#0e1636"><Cam z={lerp(1.0, 1.1, io(win(t, 0, dur('mercy'))))} fx={560} fy={1150} dy={-120}><ElfNight t={T} pink={.15} />
    <Liliana x={830} y={1800} s={.92} t={T} sad={1} dizzy={clamp(1.5 - t * 1.5)} mouth={.15} still /><Log x={610} y={1570} w={460} />
    <Person x={270} y={1700} s={1.0} t={T} look="lira" hold="bow" draw={d} pose={blendPose(AIM(.85) as any, { ...AIM(.1), armR: [1.1, 0] } as any, stop)} expr={stop > .5 ? 'deadpan' : 'determined'} mouth={mouth('lira', T)} eye={[.9, stop > .5 ? -.2 : .2]} />
    <Person x={520} y={1740} s={.95} t={T} hold="pan" pose={blendPose(POSES.stand, { ...POSES.stand, armL: [-1.25, -.3] } as any, stop)} expr="neutral" mouth={mouth('max', T)} kisses={3} eye={[stop > .5 && t < 2.4 ? -.8 : .8, 0]} />
    <Campfire x={60} y={1680} s={.7} t={T} />
  </Cam></Frame>); };

// ───────────── 10. «Триста лет. Без выходных» — «У нас это называлось „мы — семья“» ─────────────
export const Overtime: React.FC<P> = ({ t, T }) => { const cut = V('g4', 'overtime') - .15;
  if (t < cut) return (<><Frame bg="#0e1636"><Cam z={lerp(1.0, 1.07, t / cut)} fy={800}><ElfNight t={T} pink={.1} /><Glow x={300} y={1300} r={700} c="#ff8a3a" o={.35} id="otG" />
    <Liliana x={560} y={2420} s={2.45} t={T} mouth={mouth('succ', T)} sad={1} still /></Cam></Frame>
    <Tag t={t} t0={.9} x={90} y={930} title="ГРАФИК: 24/7" sub="стаж 300 лет · отпуск: 0 дней" col="#ff7ad9" w={640} /></>);
  const q = t - cut, g = spr(q, .9, { damping: 8 });
  return (<Frame bg="#0e1636"><Cam z={lerp(1.0, 1.07, q / 3)} fy={900}><ElfNight t={T} pink={.1} /><Glow x={900} y={1400} r={700} c="#ff8a3a" o={.35} id="otG2" />
    <Person x={540} y={2020} s={1.8} t={T} hold="pan" pose={blendPose(POSES.stand, { ...POSES.stand, armL: [-1.0, 2.0] } as any, g)} expr={g > .5 ? 'smug' : 'sad'} mouth={mouth('max', T)} kisses={3} eye={[.6, -.1]} /></Cam></Frame>); };

// ───────────── 11. Деталь: Сковорода Судьбы жарит яичницу ─────────────
export const Egg: React.FC<P> = ({ t, T }) => { const drop = clamp(t / .28), k = spr(t, .28, { damping: 8 });
  return (<><Frame bg="#1a0e14"><Cam z={lerp(1.0, 1.1, io(win(t, 0, dur('egg'))))} fy={900} rot={Math.sin(T * 1.3) * 1.2}><rect x={-200} y={-200} width={1500} height={2400} fill="#1a0e14" /><Glow x={540} y={1500} r={900} c="#ff7a2a" o={.6} id="egG" />
    <Campfire x={540} y={2050} s={2.2} t={T} />
    <FlyPan x={540} y={930} r={0} s={3.1} glow={.6 + .4 * out(win(t, 1.9, 2.3))} />
    {drop < 1 && <ellipse cx={540} cy={lerp(200, 900, drop * drop)} rx={56} ry={72} fill="#fff4e0" />}
    <FriedEgg x={540} y={920} s={3.0} k={k} t={T} /><Steam x={540} y={760} t={T} k={clamp((t - .4) * 2)} id="egS" />
    {t > 1.9 && [0, 1, 2, 3].map(i => { const q = (t - 1.9 - i * .12) / .6; return q > 0 && q < 1 ? <path key={i} transform={`translate(${300 + i * 160},${640 + (i % 2) * 380}) scale(${2.5 * Math.sin(q * Math.PI)})`} d="M0,-16 L4,-4 L16,0 L4,4 L0,16 L-4,4 L-16,0 L-4,-4 Z" fill="#fff6c0" /> : null; })}
  </Cam></Frame><SysWindow t={t} t0={1.9} title="ДОСТИЖЕНИЕ: ПОВАР" sub="СКОВОРОДА ИСПОЛЬЗОВАНА ПО НАЗНАЧЕНИЮ" y={330} col="#ffd23f" /></>); };

// ───────────── 12. «Мне никто… не готовил» ─────────────
export const Tears: React.FC<P> = ({ t, T }) => { const cry = out(win(t, .6, 1.2)), pl: [number, number] = [195, 1085];
  return (<Frame bg="#0e1636"><Cam z={lerp(1.0, 1.1, io(win(t, 0, dur('tears'))))} fx={500} fy={800}><ElfNight t={T} pink={.1} /><Glow x={300} y={1300} r={760} c="#ff8a3a" o={.4} id="trG" />
    <Liliana x={600} y={2200} s={2.2} t={T} mouth={mouth('succ', T)} sad={1} tears={cry} blush={cry * .9} still />
    <g transform={`translate(${pl[0]},${pl[1] + Math.sin(T * 2) * 4})`}><ellipse cx={0} cy={0} rx={170} ry={42} fill="#e8e0d0" /><ellipse cx={0} cy={-6} rx={130} ry={30} fill="#fff" /><FriedEgg x={0} y={-16} s={1.5} t={T} /><Steam x={0} y={-60} t={T} n={4} k={.8} id="trS" /></g>
  </Cam></Frame>); };

// ───────────── 13. Карта «короткий путь»; «не тормози, он годный» — «Он не мой!» ─────────────
export const MapShot: React.FC<P> = ({ t, T }) => { const b = V('i2', 'map') - .15, c = V('i3', 'map') - .12;
  if (t < b) { const give = io(win(t, .2, .9)), mk = spr(t, .5, { damping: 11 });
    return (<Frame bg="#0e1636"><Cam z={lerp(1.0, 1.06, t / b)} fy={1100} dy={-120}><ElfNight t={T} pink={.1} /><Campfire x={540} y={1660} s={.7} t={T} />
      <Person x={60} y={1660} s={.8} t={T} look="lira" bowBack expr="deadpan" eye={[.9, -.2]} pose={{ armL: [-.55, 1.6], armR: [.55, -1.6] } as any} />
      <Person x={290} y={1700} s={.9} t={T} hold={null} pose={POSES.point} expr="happy" kisses={3} eye={[.8, -.6]} /><g transform="translate(250,1420) rotate(20) scale(.5)"><FlyPan x={0} y={0} r={0} s={1} glow={.4} /></g>
      <Liliana x={790} y={1700} s={.92} t={T} mouth={mouth('succ', T)} still />
      <g transform={`translate(${lerp(621, 566, give)},${lerp(1225, 1280, give) - Math.sin(give * Math.PI) * 60}) rotate(${lerp(-10, 12, give)})`}><rect x={-46} y={-16} width={92} height={32} rx={14} fill="#ecd9a8" stroke="#8a6a3a" strokeWidth={5} /></g>
      <MapCard x={540} y={720} s={.92} t={T} k={mk} />
    </Cam></Frame>); }
  if (t < c) { const q = t - b, W2 = W('i2', 5, 'map'), wow = spr(t, W2, { damping: 9 });
    return (<Frame bg="#0e1636"><Cam z={lerp(1.0, 1.08, q / (c - b))} fy={950}><ElfNight t={T} pink={.2} /><Glow x={540} y={1500} r={700} c="#ff8a3a" o={.3} id="mpG" />
      <Liliana x={850} y={2330} s={1.9} t={T} mouth={mouth('succ', T)} rot={-7} blush={.3} still />
      <Person x={300} y={2120} s={1.75} t={T} look="lira" bowBack expr={wow > .5 ? 'shock' : 'deadpan'} blush={wow} eye={[wow > .5 ? 0 : .9, 0]} />
      {wow > .2 && <Heart x={540} y={640 - (t - W2) * 60} s={2.4 * wow} o={clamp(2 - (t - W2))} />}
    </Cam></Frame>); }
  const q = t - c, s = shake(q, 0, 12, .3);
  return (<Frame bg="#0e1636"><Cam z={lerp(1.12, 1.04, out(win(q, 0, .4)))} fy={900} rot={-4} dx={s[0]} dy={s[1]}><ElfNight t={T} pink={.3} /><Glow x={540} y={900} r={700} c="#ff9ad0" o={.35} id="mpL" />
    <Person x={540} y={2080} s={2.0} t={T} look="lira" bowBack expr="shock" blush={1} mouth={mouth('lira', T)} eye={[Math.sin(t * 9) * .4, .1]} />
    <Puffs t={q} t0={.05} x={290} y={760} n={5} spread={130} up={180} size={36} id="mpp1" /><Puffs t={q} t0={.05} x={790} y={760} n={5} spread={130} up={180} size={36} id="mpp2" /></Cam></Frame>); };

// ───────────── 14. Новый уровень: 12 · 8 · 3 550 ─────────────
export const LevelUp: React.FC<P> = ({ t, T }) => { const k = out(win(t, .3, 1.0)), fly = io(win(t, .2, 3.4));
  return (<><Frame bg="#2a1440"><Cam z={lerp(1.0, 1.1, io(win(t, 0, dur('levelup'))))} fy={1300}><ElfNight t={T} pink={0} /><rect width={1080} height={1920} fill="#ffb86a" opacity={.12} />
    <g opacity={.9}><Liliana x={lerp(880, 1010, fly)} y={lerp(900, 520, fly)} s={lerp(.42, .26, fly)} t={T} blush={.6} /></g>
    <AuraFlame t={T} x={430} y={1800} k={k} />
    <Person x={430} y={1800} s={1.25} t={T} pose={blendPose(POSES.stand, POSES.heroic, spr(t, .2, { damping: 9 }))} hold="pan" panGlow={k} expr="cool" eye={[.2, -.2]} kisses={3} />
    <Person x={780} y={1780} s={1.15} t={T} look="lira" bowBack expr="smug" pose={{ armL: [-.55, 1.6], armR: [.55, -1.6], legL: [-.08, .04], legR: [.08, -.04] }} eye={[-.8, -.2]} flip />
    <Slime x={150} y={1800} s={.6} t={T} look={[.7, -.5]} squish={Math.abs(Math.sin(T * 6)) * .2} />
  </Cam></Frame><SysWindow t={t} t0={1.5} title="ДИПЛОМАТИЯ ЯИЧНИЦЕЙ" sub="НОВЫЙ НАВЫК · ВРАГ УШЁЛ СЫТЫМ" y={400} col="#ffd23f" /></>); };

// ───────────── 15. «За мной!» → застрял в плаще Лиры → «Вылезай. Из. Моего. Плаща» ─────────────
const CLOAK = '#2f7a52';
export const Cloak: React.FC<P> = ({ t, T }) => { const c = V('k3', 'cloak') - .15, trip = 1.75;
  if (t < c) { const walk = io(win(t, 1.0, trip)), st = out(win(t, trip, trip + .25)), mx = lerp(260, 400, walk), wig = t > trip ? Math.sin(t * 16) * clamp(1.4 - (t - trip) * .12) : 0, s = shake(t, trip + .15, 14, .35);
    const hx = mx + 202 * st, hy = 1730 - 590 + 36 * st;
    return (<><Frame bg="#2a1440"><Cam z={lerp(1.0, 1.22, io(win(t, trip - .1, trip + .6)))} fx={620} fy={1250} dy={-130 + s[1]} dx={s[0]} rot={5 * st}><ElfNight t={T} pink={0} /><rect width={1080} height={1920} fill="#ffb86a" opacity={.12} />
      <Slime x={150} y={1740} s={.5} t={T} look={[.8, -.3]} />
      <Person x={760} y={1730} s={1.0} t={T} look="lira" bowBack expr={st > .5 ? 'deadpan' : 'neutral'} eye={[st > .5 ? -.7 : -.3, .3]} flip />
      <Person x={mx} y={1730} s={1.0} t={T} rot={20 * st} hold="pan" pose={st > 0 ? { armL: [-1.2 + wig * .5, .6], armR: [1.9 - wig * .5, -.8], legL: [-.3 + wig * .15, .2], legR: [.35 - wig * .15, -.3] } as any : blendPose(POSES.heroic, POSES.point, walk)} expr="cool" mouth={mouth('max', T)} kisses={3} eye={[.8, -.2]} />
      {/* плащ Лиры: от её плеч — мешком на голову Макса */}
      {st > 0 && <g opacity={clamp(st * 3)}><path d={`M${hx + 60},${hy - 150} L740,1235 L800,1330 L${hx + 120},${hy + 150} Z`} fill={CLOAK} />
        <ellipse cx={hx + wig * 8} cy={hy + 10} rx={165} ry={175 + wig * 8} fill={CLOAK} /><path d={`M${hx - 130 + wig * 10},${hy + 150} Q${hx},${hy + 215} ${hx + 140},${hy + 140}`} stroke="#c9a040" strokeWidth={11} fill="none" strokeLinecap="round" />
        <path d={`M${hx - 70},${hy - 110} q40,90 0,210 M${hx + 40},${hy - 130} q50,110 20,240`} stroke="#22593c" strokeWidth={9} fill="none" strokeLinecap="round" />
        <text x={hx + 20} y={hy - 210} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={90} fill="#fff" stroke="#14121c" strokeWidth={14} paintOrder="stroke" opacity={clamp((t - trip - .4) * 3)}>?!</text></g>}
    </Cam></Frame><Tag t={t} t0={3.5} x={90} y={380} title="−50 АУРЫ" sub="ПРИЧИНА: ПЛАЩ" col="#ff4a6a" w={460} /></>); }
  const q = t - c, wig = Math.sin(t * 15);
  return (<Frame bg="#2a1440"><Cam z={lerp(1.0, 1.07, q / 2.6)} fy={900} rot={-3}><ElfNight t={T} pink={0} /><rect width={1080} height={1920} fill="#ffb86a" opacity={.12} />
    <Person x={610} y={2080} s={2.0} t={T} look="lira" bowBack expr="deadpan" mouth={mouth('lira', T)} eye={[-.8, .5]} />
    <g transform={`translate(${110 + wig * 10},${1230 + Math.abs(wig) * 8}) scale(.8)`}><g transform="translate(120,150) rotate(70) scale(.9)"><FlyPan x={0} y={0} r={0} s={1} glow={.4} /></g>
      <path d="M-260,360 Q-300,-40 -120,-170 Q40,-250 170,-140 Q300,-30 420,-260 L520,-200 Q380,80 300,360 Z" fill={CLOAK} /><path d="M-150,-60 q50,120 10,300 M20,-120 q60,160 30,380" stroke="#22593c" strokeWidth={12} fill="none" strokeLinecap="round" /><path d="M-260,360 L300,360" stroke="#c9a040" strokeWidth={14} strokeLinecap="round" /></g>
  </Cam></Frame>); };
