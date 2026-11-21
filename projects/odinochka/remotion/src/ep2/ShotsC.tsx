// Серия 2, планы a0, e1–e4, f1–f2: свет фонаря убивает тех, кто идёт к нему (кровь), Кирилл останавливает Тимура; после фонаря — двое погибших, поезд едет дальше.
import React from 'react';
import { clamp, ease, noise } from '../anim';
import { cam, Flash, h1, isImpact, shakeXY } from '../kit/fx';
import { Figure, PK, POSES, walkPose } from '../chars/body';
import { Machinist } from '../chars/monsters';
import { LK, CS } from '../chars/cast';
import { Frame, SP } from '../ep1/common';
import { G, H, KL } from '../ep1/ShotsF';
import { TrainInterior } from '../bg/places';
import { caps, talk } from './timeline';
import { Cone, DarkCar, WARM } from './ShotsA';
import { Tag } from './ShotsE';

// брызги крови из точки: капли летят по дуге и падают
export const Spray: React.FC<{ t: number; t0: number; x: number; y: number; n?: number; dir?: number; spread?: number; pow?: number; seed?: number }> = ({ t, t0, x, y, n = 46, dir = 0, spread = 1.4, pow = 900, seed = 1 }) => {
  const q = t - t0; if (q < 0 || q > 1.6) return null;
  return <g>{Array.from({ length: n }).map((_, i) => { const a = dir - Math.PI / 2 + (h1(i * 3.1 + seed) - .5) * spread * 2, v = pow * (.3 + h1(i * 7.7 + seed) * .8);
    const px = x + Math.cos(a) * v * q, py = y + Math.sin(a) * v * q + 1400 * q * q, r = (4 + h1(i * 5 + seed) * 14) * (1 - q * .3);
    return <ellipse key={i} cx={px} cy={py} rx={r} ry={r * 1.4} fill={i % 4 ? '#a80c18' : '#e01a28'} opacity={clamp(1.6 - q)} transform={`rotate(${a * 57} ${px} ${py})`} />; })}</g>;
};
// кляксы крови на «стекле камеры» (держатся и медленно стекают)
export const Splat: React.FC<{ t: number; t0: number; n?: number; seed?: number; k?: number }> = ({ t, t0, n = 9, seed = 1, k = 1 }) => {
  if (t < t0) return null; const q = t - t0, grow = ease(t, t0, t0 + .12);
  return <g opacity={k}>{Array.from({ length: n }).map((_, i) => { const x = h1(i * 3 + seed) * 1080, y = h1(i * 7 + seed) * 1500 + 100, r = (40 + h1(i * 11 + seed) * 120) * grow, drip = q * 60 * h1(i + seed);
    return <g key={i}><ellipse cx={x} cy={y} rx={r} ry={r * .85} fill="#8a0a14" opacity={.85} />
      {[0, 1, 2].map(j => <circle key={j} cx={x + (h1(i * 13 + j) - .5) * r * 2.4} cy={y + (h1(i * 17 + j) - .5) * r * 2} r={r * .18} fill="#8a0a14" opacity={.8} />)}
      <rect x={x - r * .12} y={y} width={r * .24} height={r * .6 + drip} rx={r * .12} fill="#7a0810" opacity={.85} /></g>; })}</g>;
};
// лужа крови под телом
export const Pool: React.FC<{ x: number; y: number; k: number; w?: number }> = ({ x, y, k, w = 260 }) => k <= 0 ? null : <ellipse cx={x} cy={y} rx={w * k} ry={w * .28 * k} fill="#5a0610" opacity={.9} />;

// куски (тёмно-красные ошмётки) разлетаются по дуге и падают с отскоком
const Chunks: React.FC<{ t: number; t0: number; x: number; y: number; s: number; seed: number }> = ({ t, t0, x, y, s, seed }) => { const q = t - t0; if (q < 0) return null;
  return <g>{Array.from({ length: 12 }).map((_, i) => { const a = -Math.PI / 2 + (h1(i * 5 + seed) - .5) * 2.6, v = 700 * s * (.5 + h1(i * 9 + seed)), fl = y + 520 * s + h1(i) * 60;
    let px = x + Math.cos(a) * v * Math.min(q, 1.2), py = y + Math.sin(a) * v * q + 1600 * q * q; if (py > fl) py = fl; const r = (10 + h1(i * 3 + seed) * 22) * s;
    return <path key={i} d={`M${px - r} ${py} q${r * .4} ${-r} ${r} ${-r * .6} q${r * .8} ${r * .2} ${r * .3} ${r * 1.2}Z`} fill={i % 3 ? '#6a0a12' : '#3a0408'} stroke="#1a0204" strokeWidth={2} />; })}</g>; };
// смерть в свете: фигуру приподнимает, свет прожигает её до белого, вспышка + кровь, тело падает бледным
const Taken: React.FC<{ t: number; t0: number; x: number; y: number; s: number; L: any; C: any; seed: number; flip?: boolean }> = ({ t, t0, x, y, s, L, C, seed }) => {
  const lift = ease(t, t0, t0 + .6), burn = ease(t, t0 + .2, t0 + .7), fq = clamp((t - t0 - .75) / .35), fall = fq < 1 ? fq * fq : 1 + Math.sin((t - t0 - 1.1) * 18) * Math.exp(-(t - t0 - 1.1) * 7) * .08, dead = t > t0 + .75;
  const jerk = !dead && t > t0 + .15 ? Math.sin(t * 60) * 10 * burn : 0;
  return <g>
    <Pool x={x + 160 * s} y={y + 10} k={ease(t, t0 + 1.1, t0 + 2.4)} w={260 * s} />
    <g transform={dead ? `rotate(${fall * 86} ${x} ${y})` : `translate(${jerk} ${-lift * 90 * s}) rotate(${jerk * .4} ${x} ${y})`}>
      <Figure x={x} y={y} s={s} t={dead ? t0 : t} L={dead ? { ...L, skin: '#d8d4d0', skinSh: '#a8a4a0' } : L} C={C} pose={dead ? POSES.fallen : { ...POSES.bothUp, armL: [-120, 30], armR: [120, -30], head: -20 }}
        expr={dead ? 'pain' : 'shout'} lid={dead ? 0 : 1} noBlink seed={seed} rim={WARM} lookY={-1} mouth={dead ? 0 : .8} />
      {!dead && <ellipse cx={x} cy={y - 420 * s} rx={260 * s} ry={480 * s} fill="#fffbe8" opacity={burn * .85} filter="url(#blur30)" />}
    </g>
    <Spray t={t} t0={t0 + .7} x={x} y={y - 560 * s} seed={seed} pow={1100 * s} />
    <Chunks t={t} t0={t0 + .72} x={x} y={y - 500 * s} s={s} seed={seed} />
  </g>;
};

// a0 (хук): Жора в луче раскинул руки — вспышка, кровь заливает «камеру»
export const A0: React.FC<SP> = ({ t }) => {
  const hit = 1.2, [sx, sy] = shakeXY(t, [[hit, 26, .6]]);
  return <Frame t={t} grade="#2a2418" gradeK={.1} impact={isImpact(t, hit, 3)} over={<g><Flash t={t} t0={hit} dur={.35} color="#fff" max={1} /><Splat t={t} t0={hit + .05} seed={4} /></g>}>
    <g transform={cam(1.05 + t * .08, 540, 1000, sx, sy - 160)}>
      <DarkCar t={t} />
      <Cone x={540} k={1.2 + ease(t, .6, 1.2) * .8} w={430} />
      <Taken t={t} t0={hit - .7} x={540} y={1960} s={1.35} L={LK.zhora} C={CS.zhora} seed={7} />
    </g>
  </Frame>;
};

// e1: Жора и Серёга идут на свет (шаг по пройденному пути), Михалыч держит Тимура; Кирилл кричит «Жора, стой!»
export const E1: React.FC<SP> = ({ t }) => {
  const c = caps('e1'), dz = ease(t, 0, 3.2, (k: number) => k) * 220, ds = ease(t, .4, 3.2, (k: number) => k) * 180;
  return <Frame t={t} grade="#2a2418" gradeK={.1}>
    <g transform={cam(1.0, 540, 1100, 0, -140)}>
      <DarkCar t={t} />
      <Machinist x={540} y={1120} s={.55} t={t} k={1} />
      <Cone x={540} x0={540} y0={480} k={1.1} w={420} />
      <Figure x={620} y={1640 - dz * .5} s={.95 - dz * .0008} t={t} L={LK.zhora} C={CS.zhora} pose={walkPose(dz)} expr="smirk" lookY={-.6} seed={7} rim={WARM} turn={0} />
      <Figure x={420} y={1680 - ds * .5} s={.9 - ds * .0008} t={t} L={LK.r1} C={CS.r1} pose={walkPose(ds)} expr="calm" lookY={-.6} lid={.5} noBlink seed={21} rim={WARM} />
      <H t={t} w="mikh" dx={40} pose={{ ...POSES.hold, armL: [-40, 100], armR: [-60, 60] }} expr="pain" turn={-.4} />
      <H t={t} w="timur" dx={420} pose={{ ...POSES.stand, armR: [120, -10], lean: 10 }} expr="cry" lookY={-.6} />
      <H t={t} w="kirill" pose={PK(t, [[0, 'stand'], [1.3, { armR: [110, -10], lean: 8 }]])} expr={t > 1.3 ? 'shout' : 'scared'} mouth={talk(t, c, 'КИРИЛЛ')} lookX={.5} />
    </g>
    <Tag t={t} t0={.2} x={420} y={760} name="ЖОРА" /><Tag t={t} t0={.5} x={300} y={1000} name="СЕРЁГА" />
  </Frame>;
};

// e2: крупно — Жора в луче: свет его поднимает и прожигает, кровь (скример)
export const E2: React.FC<SP> = ({ t }) => {
  const t0 = .5, [sx, sy] = shakeXY(t, [[t0 + .7, 30, .6]]);
  return <Frame t={t} grade="#2a1010" gradeK={.1} impact={isImpact(t, t0 + .7, 3)} over={<g><Flash t={t} t0={t0 + .68} dur={.3} color="#fff" max={1} /><Splat t={t} t0={t0 + .75} seed={9} n={6} /></g>}>
    <g transform={cam(1.25, 540, 1250, sx, sy - 140)}>
      <DarkCar t={t} />
      <Cone x={540} k={1.4} w={400} />
      <Taken t={t} t0={t0} x={540} y={1960} s={1.5} L={LK.zhora} C={CS.zhora} seed={7} />
    </g>
  </Frame>;
};

// e3: Серёгу забирает так же — брызги долетают до Кирилла (передний план, кровь на щеке)
export const E3: React.FC<SP> = ({ t }) => {
  const t0 = .2, [sx, sy] = shakeXY(t, [[t0 + .7, 20, .5]]);
  return <Frame t={t} grade="#2a1418" gradeK={.12} impact={isImpact(t, t0 + .7, 2)} over={<Flash t={t} t0={t0 + .68} dur={.25} color={WARM} max={.7} />}>
    <g transform={cam(1.05, 540, 1100, sx, sy - 120)}>
      <DarkCar t={t} />
      <Cone x={700} k={1.2} w={380} />
      <Taken t={t} t0={t0} x={720} y={1500} s={.95} L={LK.r1} C={CS.r1} seed={21} />
      <g transform="translate(-120 0)"><Figure x={300} y={2100} s={1.5} t={t} L={KL} C={CS.porterY} pose={PK(t, [[0, 'stand'], [.95, { ...POSES.hit, lean: -6 }], [1.6, 'tense']])} expr={t > .9 ? 'scared' : 'calm'} turn={.6} lookX={.8} seed={3} sweat={1} /></g>
      {t > t0 + .85 && <g opacity={ease(t, t0 + .85, t0 + 1.0)}>{[0, 1, 2, 3].map(i => <circle key={i} cx={240 + i * 18} cy={1020 + (i % 2) * 20} r={8 - i} fill="#a80c18" />)}</g>}
    </g>
  </Frame>;
};

// e4: Тимур рвётся к свету — Кирилл ловит его за капюшон и разворачивает; «Не смотрите на свет! Закройте глаза!»
export const E4: React.FC<SP> = ({ t }) => {
  const c = caps('e4'), run = ease(t, 0, .7) * 160, yank = spr2(t, .7);
  return <Frame t={t} grade="#2a2418" gradeK={.1} impact={isImpact(t, .7, 2)}>
    <g transform={cam(1.15, 540, 1150, 0, -160)}>
      <DarkCar t={t} />
      <Cone x={900} k={1.2} w={360} />
      <Figure x={620 + run - yank * 140} y={1980} s={1.3} t={t} L={LK.timur} C={CS.timur} pose={t < .7 ? walkPose(run * 2, true) : { ...POSES.hit, lean: -20 * (1 - yank * .5) }} expr="cry" lookX={.8} lookY={-.4} seed={41} turn={.6} rim={WARM} tears={.8} />
      <Figure x={330} y={2000} s={1.4} t={t} L={KL} C={CS.porterY} pose={PK(t, [[0, { armR: [100, -20], lean: 14 }], [.7, { armR: [70, -60], lean: -8 }], [1.4, { armR: [130, -10], armL: [-30, 60] }]])} expr="shout" mouth={talk(t, c, 'КИРИЛЛ')} turn={.4} seed={3} sweat={1} />
    </g>
  </Frame>;
};
const spr2 = (t: number, t0: number) => t < t0 ? 0 : 1 - Math.exp(-(t - t0) * 9) * Math.cos((t - t0) * 14);

// f1: после фонаря — красный аварийный свет, двое накрыты куртками, лужи; Михалыч: «Жора… и Серёга.» «Сказали — одна остановка. Всё, выходим.»
export const F1: React.FC<SP> = ({ t }) => {
  const c = caps('f1'), em = .85 + .15 * noise('em', t, 5);
  return <Frame t={t} grade="#2a0a10" gradeK={.18}>
    <g transform={cam(1.0 + t * .02, 540, 1100, 0, -140)}>
      <TrainInterior t={t} flicker={.1} red={1.6} />
      <rect width={1080} height={1920} fill="#14040a" opacity={.45} />
      {[[300, 1580], [640, 1500]].map(([x, y], i) => <g key={i}><Pool x={x + 40} y={y + 10} k={1} w={180} />
        <path d={`M${x - 150} ${y} Q${x - 120} ${y - 70} ${x} ${y - 80} Q${x + 130} ${y - 70} ${x + 160} ${y}Z`} fill={i ? '#3a4a5a' : '#5a2a2a'} stroke="#0c0d18" strokeWidth={5} />
        <path d={`M${x + 120} ${y - 10} l60 10`} stroke="#d8d4d0" strokeWidth={22} strokeLinecap="round" /></g>)}
      <H t={t} w="mikh" pose={{ ...POSES.stand, crouch: 30, armL: [-20, 40], armR: [20, -40] }} expr="sad" mouth={talk(t, c, 'МИХАЛЫЧ')} turn={-.3} lookY={.5} />
      <H t={t} w="timur" dx={150} pose={{ ...POSES.stand, crouch: 120, armL: [-40, 120], armR: [40, -120] }} expr="cry" tears={1} lookY={.6} />
      <H t={t} w="r2" pose={{ ...POSES.stand, armL: [-20, 60] }} expr="sad" lookY={.5} />
      <H t={t} w="kirill" pose={{ ...POSES.stand, armR: [20, -10] }} expr="sad" lookY={.4} />
      <rect width={1080} height={1920} fill="#ff1a2a" opacity={.05 * em} />
    </g>
  </Frame>;
};

// f2: рывок — поезд снова трогается; диктор: «Следующая станция — Депо»; Михалыч: «Какое ещё депо?..»
export const F2: React.FC<SP> = ({ t }) => {
  const c = caps('f2'), [sx, sy] = shakeXY(t, [[.3, 30, .5], [.9, 10, 3]]);
  return <Frame t={t} grade="#1a1a2a" gradeK={.12} impact={isImpact(t, .3, 2)}>
    <g transform={cam(1.12, 540, 1100, sx, sy - 120)}>
      <TrainInterior t={t} flicker={.6} shake={t > .3 ? 5 : 0} />
      <rect width={1080} height={1920} fill="#0a0a14" opacity={.3} />
      <H t={t} w="mikh" pose={t < .5 ? { ...POSES.hit, lean: -14 } : { ...POSES.stand, armR: [140, -10] }} expr={t > 2.6 ? 'angry' : 'scared'} mouth={talk(t, c, 'МИХАЛЫЧ')} turn={-.3} lookY={-.7} />
      <H t={t} w="kirill" pose={t < .5 ? { ...POSES.hit, lean: -10 } : POSES.tense} expr="scared" lookY={-.7} turn={.2} />
      <H t={t} w="timur" dx={150} pose={POSES.hit} expr="scared" lookY={-.6} />
      {/* табло над дверью: «ДЕПО» мигает красным */}
      <g transform="translate(540 260)" opacity={ease(t, .8, 1.1)}><rect x={-260} y={-60} width={520} height={120} rx={10} fill="#0a0a0c" stroke="#3a3a44" strokeWidth={6} />
        <text y={26} textAnchor="middle" fontFamily="Mont" fontWeight={800} fontSize={72} fill="#ff2a3a" letterSpacing={12} opacity={Math.floor(t * 3) % 2 ? 1 : .55} filter="url(#glow)">ДЕПО</text></g>
    </g>
  </Frame>;
};
