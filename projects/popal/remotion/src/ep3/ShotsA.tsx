// Планы серии 3, часть 1 (костёр: отказ → чары → железная воля → бой).
import React from 'react';
import { clamp, lerp, out, io, spr, win, shake } from '../anim';
import { Person, POSES, blendPose } from '../chars/Person';
import { Slime } from '../chars/Cast';
import { Liliana } from '../chars/Cast2';
import { ElfNight, Campfire } from '../bg/Bg2';
import { Glow, Motes } from '../bg/Bg';
import { Frame, Cam, Tag, Onomato, Stamp, SysWindow } from '../ui/Ui';
import { Puffs, Speed } from '../ep1/Shots';
import { html, FlyPan } from '../ep2/ShotsA';
import { P, mouth, dur, V, Heart, AIM } from './common';

// ───────────── 1. Хук: «Нет. Я остаюсь с Лирой» ─────────────
export const Hook: React.FC<P> = ({ t, T }) => { const no = V('a2', 'hook'), up = spr(t, no - .1, { damping: 9 }), z = t < no ? lerp(1.0, 1.06, t / no) : lerp(1.28, 1.36, win(t, no, dur('hook')));
  return (<><Frame bg="#0e1636"><Cam z={z} fx={t < no ? 540 : 300} fy={1150} dy={-120}><ElfNight t={T} pink={.5 * (1 - up * .6)} />
    <Person x={95} y={1650} s={.82} t={T} look="lira" hold="bow" draw={.4 * (1 - up)} pose={blendPose(AIM(.4) as any, { ...POSES.stand, armR: [.3, -.4] } as any, up)} expr={up > .5 ? 'shock' : 'determined'} blush={up} eye={[.9, -.1]} />
    <Campfire x={520} y={1640} s={.8} t={T} /><Slime x={640} y={1650} s={.42} t={T} look={[up > .5 ? -.8 : .8, -.3]} />
    <Person x={310} y={1700} s={.9} t={T} pose={blendPose(POSES.stand, { ...POSES.stand, armL: [-1.5, .1] } as any, up)} hold="pan" expr={up > .5 ? 'determined' : 'scared'} sweat={1 - up} mouth={mouth('max', T)} kisses={3} eye={[up > .5 ? .8 : .9, -.2]} />
    <Liliana x={830} y={1700} s={.92} t={T} mouth={up > .5 ? .7 : 0} sad={up * .6} />
    <Motes n={20} t={T} c="#ff9ae0" seed={95} area={[500, 800, 580, 900]} vy={-40} size={7} />
  </Cam></Frame>
    {t < no && <div style={html({ left: 96, top: 380, rotate: '-4deg', scale: String(spr(t, .05, { damping: 10 })), background: '#ffd23f', padding: '10px 30px', fontWeight: 900, fontSize: 46, color: '#14121c', boxShadow: '0 8px 20px rgba(0,0,0,.45)' })}>СЕРИЯ 3</div>}
    <Stamp t={t} t0={no + .5} text="ОТКАЗ!" col="#ff4a6a" y={410} size={170} /></>); };

// ───────────── 2. Лира краснеет / Лилиане отказали впервые за 300 лет ─────────────
export const Refuse: React.FC<P> = ({ t, T }) => { const cut = V('b2', 'refuse') - .15;
  if (t < cut) return (<Frame bg="#0e1636"><Cam z={lerp(1.0, 1.08, t / cut)} fy={900}><ElfNight t={T} pink={.2} /><Glow x={540} y={900} r={700} c="#ff9ad0" o={.3} id="rfG" />
    <Person x={540} y={2080} s={2.0} t={T} look="lira" bowBack expr="shock" blush={1} mouth={mouth('lira', T)} eye={[Math.sin(t * 9) * .5, .1]} />
    <Puffs t={t} t0={.15} x={300} y={760} n={5} spread={120} up={160} size={34} id="rfp1" /><Puffs t={t} t0={.15} x={780} y={760} n={5} spread={120} up={160} size={34} id="rfp2" />
  </Cam></Frame>);
  const q = t - cut, s = shake(q, 0, 14, .4);
  return (<><Frame bg="#3a0a3a"><Cam z={lerp(1.08, 1.0, out(win(q, 0, .5)))} fy={800} dx={s[0]} dy={s[1]}><rect x={-200} y={-200} width={1500} height={2400} fill="#2a0a2e" /><Glow x={540} y={760} r={760} c="#ff4ab0" o={.45} id="rfL" />
    <Liliana x={560} y={2420} s={2.45} t={T} mouth={Math.max(.5, mouth('succ', T))} sad={.8} still />
    {/* «трещины» — мир суккубы дал сбой */}
    <g stroke="#fff" strokeWidth={5} fill="none" opacity={.5 * clamp(1.4 - q * .4)}><path d="M0,300 L190,420 L150,560 L330,640" /><path d="M1080,520 L900,600 L940,760 L790,820" /><path d="M700,0 L640,170 L760,260" /></g>
  </Cam></Frame><Tag t={q} t0={.35} x={90} y={930} title="ОТКАЗОВ ЗА 300 ЛЕТ" sub="0  →  1" col="#ff4a6a" w={640} /></>); };

// ───────────── 3. Чары соблазна ─────────────
export const Charm: React.FC<P> = ({ t, T }) => { const rise = io(win(t, .2, 1.2)), ly = lerp(1700, 1560, rise), palm: [number, number] = [661, ly - 461], head: [number, number] = [310, 1160];
  return (<><Frame bg="#0e1636"><Cam z={lerp(1.0, 1.1, io(win(t, 0, dur('charm'))))} fx={620} fy={1150} dy={-120}><ElfNight t={T} pink={.4 + rise * .6} />
    <Person x={95} y={1650} s={.82} t={T} look="lira" hold="bow" draw={.5} pose={AIM(.5) as any} expr="determined" eye={[.9, -.2]} />
    <Campfire x={520} y={1640} s={.8} t={T} /><Slime x={640} y={1650} s={.42} t={T} look={[.6, -.6]} />
    <Person x={310} y={1700} s={.9} t={T} hold="pan" expr="scared" sweat={1} kisses={3} eye={[.9, -.3]} pose={{ ...POSES.stand, armL: [-.6, 1.4], lean: -.06 } as any} />
    {/* магический круг и сама Лилиана */}
    <g transform={`translate(830,${ly - 460})`} opacity={rise}><circle r={330} fill="none" stroke="#ff7ad9" strokeWidth={8} strokeDasharray="40 22" transform={`rotate(${T * 40})`} /><circle r={270} fill="none" stroke="#ffd6f4" strokeWidth={4} strokeDasharray="12 18" transform={`rotate(${-T * 60})`} /></g>
    <Liliana x={830} y={ly} s={.92} t={T} mouth={mouth('succ', T)} angry={rise * .7} />
    <Glow x={palm[0]} y={palm[1]} r={160 * rise} c="#ff7ad9" o={.9} id="chP" />
    {[0, 1, 2, 3, 4, 5].map(i => { const t0 = 1.2 + i * .2, k = clamp((t - t0) / .7); if (k <= 0 || k >= 1) return null; const toSlime = i === 2, tx = toSlime ? 640 : head[0] + 40, ty = toSlime ? 1560 : head[1];
      return <Heart key={i} x={lerp(palm[0], tx, k)} y={lerp(palm[1], ty, k) - Math.sin(k * Math.PI) * (toSlime ? 220 : 90 + i * 20)} s={2.2 + Math.sin(k * 9) * .3} rot={Math.sin(k * 7 + i) * 20} />; })}
  </Cam></Frame><Tag t={t} t0={.9} x={90} y={380} title="ЧАРЫ СОБЛАЗНА" sub="ещё никто не устоял" col="#ff7ad9" w={600} /></>); };

// ───────────── 4. Железная воля: сердечки отскакивают ─────────────
export const Iron: React.FC<P> = ({ t, T }) => { const hits = [.1, .35, .6], fx = 600, fy = 800;
  return (<><Frame bg="#0e1636"><Cam z={lerp(1.0, 1.07, io(win(t, 0, dur('iron'))))} fy={900}><ElfNight t={T} pink={.45} /><Glow x={540} y={900} r={640} c="#5ac8ff" o={.3 * out(win(t, 1.0, 1.5))} id="irG" />
    <Person x={520} y={2050} s={1.9} t={T} hold="pan" expr="deadpan" mouth={0} kisses={3} eye={[.5, 0]} noBlink={t < .9} />
    {hits.map((h, i) => { const k = (t - h + .22) / .22, b = (t - h) / .7; if (k < 0 || b > 1) return null;
      return k < 1 ? <Heart key={i} x={lerp(1150, fx, k)} y={lerp(700 + i * 60, fy, k)} s={3.4} /> : <g key={i}><Heart x={fx + b * (260 + i * 60)} y={fy - Math.sin(b * Math.PI) * 300 + b * 380} s={3.4 * (1 - b * .4)} rot={b * 300} c="#8a8a9a" o={1 - b} />
        <path d={`M${fx - 30},${fy - 40} l-40,-50 M${fx + 10},${fy - 60} l0,-64 M${fx + 50},${fy - 40} l40,-50`} stroke="#fff" strokeWidth={9} strokeLinecap="round" opacity={clamp(1 - b * 4)} /></g>; })}
  </Cam></Frame>
    {hits.map((h, i) => <Onomato key={i} t={t} t0={h} x={760 + i * 60} y={600 + i * 90} text="ДЗЫНЬ" size={84} rot={-10 + i * 9} dur={.5} col="#bfe9ff" />)}
    <SysWindow t={t} t0={1.0} title="НАВЫК: ЖЕЛЕЗНАЯ ВОЛЯ" sub="ДЕВСТВЕННИК, 27 УР. · ИММУНИТЕТ К СОБЛАЗНУ" y={390} /></>); };

// ───────────── 5. Желе влюбился в сковороду ─────────────
export const SlimeLove: React.FC<P> = ({ t, T }) => { const h = io(win(t, .05, .5)), off = V('d3', 'slimeLove') + .75, f = clamp((t - off) / .45), wob = t > off - .35 && t < off + .2 ? Math.sin(t * 40) * 14 : 0;
  const hx = 698, hy = 1214, px = hx + 150, sx = f > 0 ? lerp(px, 960, f) : lerp(640, px, h), sy = f > 0 ? lerp(hy - 30, 1700, f * f) : lerp(1650, hy - 30, h) - Math.sin(h * Math.PI) * 260;
  return (<Frame bg="#0e1636"><Cam z={lerp(1.12, 1.22, io(win(t, 0, dur('slimeLove'))))} fx={640} fy={1150} dy={-110}><ElfNight t={T} pink={.3} /><Campfire x={130} y={1700} s={.8} t={T} />
    <Person x={330} y={1760} s={1.2} t={T} pose={POSES.point} hold={null} expr="deadpan" mouth={mouth('max', T)} kisses={3} eye={[.9, .1]} />
    <g transform={`rotate(${wob} ${hx} ${hy})`}><FlyPan x={px} y={hy} r={90} s={.9} /></g>
    <Glow x={sx} y={sy - 60} r={220} c="#ff7ad9" o={.5 * h * (1 - f)} id="slG" />
    <Slime x={sx} y={sy} s={.62} t={T} mouth={mouth('slime', T)} look={[0, .6]} squish={h < 1 || f > 0 ? .3 : .1 + Math.sin(T * 5) * .08} />
    {f <= 0 && h >= 1 && [0, 1, 2, 3, 4].map(i => { const q = (t * .6 + i / 5) % 1; return <Heart key={i} x={sx + Math.sin(i * 2.3 + t * 2) * 110} y={sy - 120 - q * 300} s={1.4 + q} o={1 - q} />; })}
    <Puffs t={t} t0={off + .45} x={960} y={1700} n={5} spread={140} up={60} size={30} id="slP" />
  </Cam></Frame>); };

// ───────────── 6. «Ты что, из камня?!» — «Из отдела продаж» ─────────────
export const Stone: React.FC<P> = ({ t, T }) => { const cut = V('e2', 'stone') - .15;
  if (t < cut) { const rise = out(win(t, 0, .8)), fl = Math.max(0, Math.sin(t * 13)) > .93 ? 1 : 0;
    return (<Frame bg="#2a0a2e"><Cam z={lerp(1.0, 1.1, t / cut)} fy={800} rot={Math.sin(t * 2) * 1.5}><rect x={-200} y={-200} width={1500} height={2400} fill={fl ? '#5a1a4a' : '#2a0a2e'} /><Glow x={540} y={800} r={820} c="#ff2a6a" o={.55} id="stG" />
      <Speed t={T} col="#ff7ad9" o={.35} />
      <Liliana x={560} y={lerp(2600, 2330, rise)} s={2.2} t={T} mouth={Math.max(.35, mouth('succ', T))} angry={1} />
      <Motes n={24} t={T} c="#ff9ae0" seed={61} area={[0, 200, 1080, 1500]} vy={-160} size={9} /></Cam></Frame>); }
  const q = t - cut;
  return (<Frame bg="#0e1636"><Cam z={lerp(1.0, 1.06, q / 1.6)} fy={900}><ElfNight t={T} pink={.5} /><Campfire x={950} y={1880} s={1.1} t={T} />
    <Person x={540} y={2000} s={1.75} t={T} hold="pan" pose={blendPose(POSES.stand, POSES.shrug, spr(q, .05, { damping: 9 }))} expr="smug" mouth={mouth('max', T)} kisses={3} eye={[.5, -.4]} /></Cam></Frame>); };

// ───────────── 7. Выстрел Лиры: стрела прибивает крыло к дереву ─────────────
const Trunk: React.FC<{ x: number }> = ({ x }) => <g><rect x={x} y={-200} width={220} height={2300} fill="#2a2030" /><rect x={x} y={-200} width={60} height={2300} fill="#3a2c40" />{[300, 760, 1240].map(y => <ellipse key={y} cx={x + 120} cy={y} rx={30} ry={46} fill="#1c1420" />)}</g>;
const ArrowFly: React.FC<{ x: number; y: number; rot: number }> = ({ x, y, rot }) => <g transform={`translate(${x},${y}) rotate(${rot})`}><path d="M-150,0 L10,0" stroke="#8a5a32" strokeWidth={8} /><path d="M0,-13 L40,0 L0,13 Z" fill="#c8d0d8" /><path d="M-150,0 l-18,-16 M-150,0 l-18,16 M-136,0 l-18,-16 M-136,0 l-18,16" stroke="#7dffb0" strokeWidth={7} /></g>;
export const Arrow: React.FC<P> = ({ t, T }) => { const rel = 1.25, hit = 1.62, d = t < rel ? io(win(t, .2, 1.05)) : 0, k = clamp((t - rel) / (hit - rel)), pan = io(win(t, rel - .05, hit + .05)), s = shake(t, hit, 16, .35);
  const a: [number, number] = [640, 1200], b: [number, number] = [1800, 905], rot = Math.atan2(b[1] - a[1], b[0] - a[0]) * 57.3;
  return (<><Frame bg="#0e1636"><Cam dx={-940 * pan + s[0]} dy={-120 + s[1]} z={1.04} fy={1150}><ElfNight t={T} pink={.5} /><g transform="translate(1080,0)"><ElfNight t={T} pink={.7} /></g>
    <Campfire x={860} y={1640} s={.8} t={T} />
    <Person x={260} y={1700} s={1.1} t={T} look="lira" hold="bow" draw={d} noArrow={t >= rel} pose={AIM(d) as any} expr="determined" mouth={mouth('lira', T)} eye={[.9, -.2]} />
    <Trunk x={1810} />
    <g transform={`translate(${t > hit ? Math.sin((t - hit) * 30) * 10 * clamp(1 - (t - hit) * 2) : 0},0)`}><Liliana x={1500} y={1560} s={.92} t={T} mouth={t > hit ? .8 : .2} angry={t > hit ? 0 : 1} sad={t > hit ? 1 : 0} still={t > hit} /></g>
    {t >= rel && <ArrowFly x={lerp(a[0], b[0], k)} y={lerp(a[1], b[1], k)} rot={rot + (k >= 1 ? Math.sin((t - hit) * 50) * 6 * clamp(1 - (t - hit) * 3) : 0)} />}
    {k > 0 && k < 1 && <path d={`M${lerp(a[0], b[0], k) - 420},${lerp(a[1], b[1], k) + 100} L${lerp(a[0], b[0], k) - 150},${lerp(a[1], b[1], k) + 36}`} stroke="#bfffd8" strokeWidth={10} opacity={.5} strokeLinecap="round" />}
  </Cam></Frame><Onomato t={t} t0={hit} x={560} y={560} text="ТЮК!" size={150} col="#7dffb0" /></>); };

// ───────────── 8. БОНК по рогам; сковорода возвращается в руку ─────────────
export const Bonk: React.FC<P> = ({ t, T }) => { const thr = .3, hit = .95, back = 1.9, fall = io(win(t, 1.5, 1.95)), s = shake(t, hit, 22, .45), s2 = shake(t, 1.95, 10, .3);
  const hand: [number, number] = [537, 1295], horn: [number, number] = [685, 800];
  const k1 = clamp((t - thr) / (hit - thr)), k2 = clamp((t - hit) / (back - hit));
  const px = t < hit ? lerp(430, horn[0], k1) : lerp(horn[0], hand[0] + 120, k2), py = t < hit ? lerp(1180, horn[1], k1) - Math.sin(k1 * Math.PI) * 120 : lerp(horn[1], hand[1], k2) - Math.sin(k2 * Math.PI) * 420;
  const pose = t < thr ? blendPose(POSES.stand, POSES.throwBack, out(win(t, 0, .22))) : t < back - .25 ? blendPose(POSES.throwBack, POSES.throwFwd, out(win(t, thr - .05, thr + .15))) : blendPose(POSES.throwFwd, POSES.point, out(win(t, back - .25, back)));
  return (<><Frame bg="#0e1636"><Cam dx={s[0] + s2[0]} dy={-120 + s[1] + s2[1]} z={lerp(1.0, 1.08, io(win(t, 0, dur('bonk'))))} fy={1150}><ElfNight t={T} pink={.6 * (1 - fall)} /><Trunk x={960} />
    <Campfire x={60} y={1660} s={.7} t={T} />
    <Person x={230} y={1750} s={1.0} t={T} pose={pose} hold={t < thr || t >= back ? 'pan' : null} expr={t < hit ? 'determined' : 'cool'} kisses={3} eye={[.9, -.5]} />
    {t < 1.5 && <ArrowFly x={965} y={905} rot={-13} />}
    <Liliana x={665} y={lerp(1560, 1700, fall)} s={.92} t={T} mouth={t > hit ? .6 : .2} sad={t > hit ? 1 : .6} dizzy={t > hit ? 1 : 0} rot={t > hit ? Math.sin((t - hit) * 6) * 5 * clamp(1.6 - (t - hit)) : 0} still />
    {t >= thr && t < back && <FlyPan x={px} y={py} r={T * 900} s={.8} />}
    {t >= hit && t < hit + .5 && <g transform={`translate(${horn[0]},${horn[1]})`} opacity={clamp(1 - (t - hit) * 2)}>{Array.from({ length: 10 }, (_, i) => <path key={i} d={`M${Math.cos(i * .63) * 70},${Math.sin(i * .63) * 70} L${Math.cos(i * .63) * (130 + (t - hit) * 300)},${Math.sin(i * .63) * (130 + (t - hit) * 300)}`} stroke="#ffd23f" strokeWidth={12} strokeLinecap="round" />)}</g>}
    <Puffs t={t} t0={1.95} x={665} y={1700} n={8} col="#d8c8e8" spread={240} up={90} size={44} id="bkP" />
  </Cam></Frame><Onomato t={t} t0={hit} x={520} y={600} text="БОНК!" size={190} /></>); };
