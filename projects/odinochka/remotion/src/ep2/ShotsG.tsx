// Серия 2 v3: правки по разборам. Видения — субъективные (лицо → что видит в мягкой рамке), на общем плане — только слепящий свет;
// разные смерти; «Лёха, молнией!»; табло «одна остановка»; тишина после Михалыча; фонарь сам ползёт назад (подготовка разгадки);
// поезд — крупные сцепленные вагоны с кувырком; Врата над «Северной»; Кирилл крупно; окно со ставкой; больница с Настей.
import React from 'react';
import { clamp, ease, noise, spr } from '../anim';
import { cam, Flash, h1, isImpact, Lids, Motes, shakeXY, Smoke, SpeedLines } from '../kit/fx';
import { SysWin } from '../kit/ui';
import { Figure, PK, POSES } from '../chars/body';
import { Head } from '../chars/head';
import { Machinist } from '../chars/monsters';
import { LK, CS } from '../chars/cast';
import { Gate, Vysotka } from '../bg/moscow';
import { MetroStation, TrainInterior } from '../bg/places';
import { Frame, SP } from '../ep1/common';
import { KL } from '../ep1/ShotsF';
import { G, H } from './team';
import { caps, talk } from './timeline';
import { Cone, DarkCar, WARM } from './ShotsA';
import { Pool, Spray, Splat } from './ShotsC';
import { Walker } from './ShotsD';
import { inHand, Tag, Tentacle } from './ShotsE';

const KC = CS.porterY;
// мягкая рамка «взгляд героя»: тёплый ореол, размытые края, виньетка
const PovFrame: React.FC<{ children: React.ReactNode; k?: number }> = ({ children, k = 1 }) => <g>
  {children}
  <rect width={1080} height={1920} fill={WARM} opacity={.12 * k} style={{ mixBlendMode: 'screen' }} />
  <defs><radialGradient id="povV" cx=".5" cy=".45" r=".6"><stop offset=".55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#1a1208" stopOpacity=".95" /></radialGradient></defs>
  <rect width={1080} height={1920} fill="url(#povV)" opacity={k} />
</g>;
// видение близкого в луче: фигура в тёплом свете, мягкая, из глаз смотрящего
const VisionPov: React.FC<{ t: number; L: any; C: any; seed: number; arms?: boolean; mouth?: number }> = ({ t, L, C, seed, arms, mouth = 0 }) => <PovFrame>
  <rect width={1080} height={1920} fill="#1a140c" />
  <ellipse cx={540} cy={700} rx={700} ry={900} fill={WARM} opacity={.35} filter="url(#blur30)" />
  <g filter="url(#blur4)"><Figure x={540} y={2050 - Math.sin(t * .8) * 10} s={1.7} t={t} L={L} C={C} pose={arms ? { ...POSES.stand, armL: [-70 - Math.sin(t * 1.5) * 8, 40], armR: [70 + Math.sin(t * 1.5) * 8, -40] } : POSES.stand} expr="calm" seed={seed} rim={WARM} lookY={.2} mouth={mouth} /></g>
  <Motes t={t} x={540} y={1200} w={900} h={1200} n={30} color={WARM} speed={20} k={.7} />
</PovFrame>;
// лицо смотрящего крупно в свете (остекленевший взгляд)
const FaceLit: React.FC<{ t: number; L: any; seed: number; expr: any; mouth?: number; tears?: number; turn?: number }> = ({ t, L, seed, expr, mouth = 0, tears = 0, turn = 0 }) => <g>
  <rect width={1080} height={1920} fill="#0e0b08" />
  <ellipse cx={540} cy={300} rx={700} ry={500} fill={WARM} opacity={.3} filter="url(#blur30)" />
  <g transform={`translate(540 ${820 + noise('fl' + seed, t, .5) * 6}) scale(6)`}><Head t={t} L={L} expr={expr} seed={seed} lookY={-.5} noBlink mouth={mouth} tears={tears} turn={turn} lid={.85} /></g>
</g>;
const split = (t: number, d: number, k = .45) => t < d * k;

// a0 (хук): силуэт Жоры против слепящего света — раскинул руки, свет вспыхивает, тело рвёт, брызги на «камеру»
export const A0: React.FC<SP> = ({ t }) => {
  const hit = 1.25, jerk = t > .4 && t < hit ? Math.sin(t * 70) * 8 * ease(t, .4, hit) : 0, [sx, sy] = shakeXY(t, [[hit, 30, .7]]);
  return <Frame t={t} vign={1} impact={isImpact(t, hit, 3)} over={<g><Flash t={t} t0={hit} dur={.35} color="#fff" max={1} /><Splat t={t} t0={hit + .05} seed={4} /></g>}>
    <rect width={1080} height={1920} fill="#0a0806" />
    <g transform={cam(1.05 + t * .06, 540, 900, sx, sy)}>
      <circle cx={540} cy={760} r={260 + ease(t, .4, hit) * 260} fill={WARM} opacity={.9} filter="url(#blur30)" /><circle cx={540} cy={760} r={120} fill="#fffbe8" />
      <defs><filter id="silh"><feColorMatrix type="matrix" values="0 0 0 0 .04  0 0 0 0 .03  0 0 0 0 .02  0 0 0 1 0" /></filter></defs>
      {t < hit + .05 && <g filter="url(#silh)" transform={`translate(${jerk} ${-ease(t, .4, hit) * 80})`}><Figure x={540} y={1700} s={1.3} t={t} L={{ ...LK.zhora, skin: '#0a0806', skinSh: '#0a0806', hair: '#0a0806', hairHi: '#0a0806' }} C={{ ...CS.zhora, top: '#0a0806', topSh: '#0a0806', pants: '#0a0806', shoes: '#0a0806', trim: '#0a0806' }} pose={{ ...POSES.bothUp, armL: [-120, 30], armR: [120, -30] }} expr="shout" seed={7} rim={WARM} /></g>}
      <Spray t={t} t0={hit} x={540} y={1100} seed={7} pow={1300} n={70} />
    </g>
  </Frame>;
};

// b1: Тимур крупно → его глазами: мама в луче → «Мама?..»
export const B1: React.FC<SP> = ({ t, d }) => { const c = caps('b1');
  return <Frame t={t} grade="#2a2418" gradeK={.08}>{split(t, d, .4) ? <FaceLit t={t} L={LK.timur} seed={41} expr="sad" tears={.6} /> : <g transform={cam(1 + (t - d * .4) * .05, 540, 900)}><VisionPov t={t} L={LK.pE} C={CS.pE} seed={51} arms /></g>}
    {!split(t, d, .4) && t > d - .9 && <g opacity={ease(t, d - .9, d - .5)}><g transform="translate(220 1640) scale(2.6)"><Head t={t} L={LK.timur} expr="cry" seed={41} mouth={talk(t, c, 'ТИМУР')} tears={.8} turn={.4} /></g></g>}
  </Frame>; };
// b2: Михалыч крупно → его глазами: жена → «Галя?.. Ты же… умерла.»
export const B2: React.FC<SP> = ({ t, d }) => { const c = caps('b2');
  return <Frame t={t} grade="#2a2418" gradeK={.08}>{split(t, d, .35) ? <FaceLit t={t} L={LK.mikh} seed={6} expr="sad" mouth={talk(t, c, 'МИХАЛЫЧ')} tears={.4} /> : <g><VisionPov t={t} L={LK.pB} C={CS.pB} seed={52} />
    <g transform="translate(860 1700) scale(2.6)"><Head t={t} L={LK.mikh} expr="sad" seed={6} mouth={talk(t, c, 'МИХАЛЫЧ')} tears={.5} turn={-.5} /></g></g>}</Frame>; };
// b3: Жора крупно → брат → «Братуха?.. Живой!»; затем общий план: в луче — только свет, люди стоят, задрав головы (голос: каждый видел того, кого потерял)
export const B3: React.FC<SP> = ({ t, d }) => { const c = caps('b3'), w = t > d * .5;
  return <Frame t={t} grade="#2a2418" gradeK={.08}>
    {t < d * .2 ? <FaceLit t={t} L={LK.zhora} seed={7} expr="smirk" mouth={talk(t, c, 'ЖОРА')} tears={.4} /> : !w ? <g><VisionPov t={t} L={LK.pD} C={CS.pD} seed={53} arms /><g transform="translate(860 1700) scale(2.6)"><Head t={t} L={LK.zhora} expr="smirk" seed={7} mouth={talk(t, c, 'ЖОРА')} turn={-.5} /></g></g>
      : <g transform={cam(1.0 + (t - d * .5) * .03, 540, 1050, 0, -140)}><DarkCar t={t} /><Cone x={540} x0={540} y0={480} k={1.3} w={560} /><Machinist x={540} y={1120} s={.55} t={t} k={1.4} />
        {['zhora', 'r1', 'mikh', 'timur'].map(k => <H key={k} t={t} w={k} pose={POSES.stand} expr="calm" lookY={-.9} lid={.6} noBlink rim={WARM} turn={k === 'mikh' ? -.2 : .2} />)}
        <H t={t} w="kirill" pose={POSES.tense} expr="scared" lookX={.6} turn={.4} sweat={1} /></g>}
  </Frame>; };
// b6: отец — из глаз Кирилла, в ореоле, без тела монстра
export const B6: React.FC<SP> = ({ t }) => { const c = caps('b6');
  return <Frame t={t} grade="#1a1a2a" gradeK={.08}><PovFrame>
    <rect width={1080} height={1920} fill="#100c08" /><ellipse cx={540} cy={800} rx={620} ry={760} fill={WARM} opacity={.4} filter="url(#blur30)" />
    <g transform={cam(1 + t * .04, 540, 860)}><g transform={`translate(540 ${880 + Math.sin(t) * 6}) scale(6.4)`}><Head t={t} L={LK.father} expr="sad" seed={12} lookY={.3} noBlink mouth={talk(t, c, 'ОТЕЦ') * .45} /></g></g>
    <Motes t={t} x={540} y={900} w={900} h={1200} n={30} color={WARM} speed={20} k={.7} />
  </PovFrame></Frame>; };
// b6w: снаружи — фигура под фонарём целиком залита слепящим светом, лица не видно; Кирилл тянется к ней
export const B6w: React.FC<SP> = ({ t }) => <Frame t={t} grade="#2a2418" gradeK={.08}>
  <g transform={cam(1.0 + t * .05, 540, 1050, 0, -140)}>
    <DarkCar t={t} />
    <Machinist x={600} y={1250} s={.75} t={t} k={1.5} />
    <ellipse cx={600} cy={800} rx={360} ry={520} fill="#fffbe8" opacity={.85} filter="url(#blur30)" />
    <Cone x={600} x0={600} y0={700} k={1.4} w={520} />
    <g transform="translate(-140 0)"><Figure x={300} y={2060} s={1.45} t={t} L={KL} C={KC} pose={PK(t, [[0, 'stand'], [1.0, { armR: [110, -10], lean: 8 }]], false)} expr="sad" lookY={-.5} turn={.5} seed={3} rim={WARM} lid={.7} noBlink tears={.5} /></g>
  </g>
</Frame>;

// e3 (v3): Серёгу тянет в свет — он падает на колени, свет вспыхивает, кровь из носа и глаз, ничком
export const E3: React.FC<SP> = ({ t }) => {
  const pull = ease(t, 0, .7), kn = ease(t, .5, .9), hit = 1.0, fall = clamp((t - hit - .2) / .35) ** 2, [sx, sy] = shakeXY(t, [[hit, 22, .5], [hit + .55, 14, .3]]);
  const x = 700 - pull * 80, y = 1500;
  return <Frame t={t} grade="#2a1418" gradeK={.12} impact={isImpact(t, hit, 2)} over={<Flash t={t} t0={hit} dur={.25} color={WARM} max={.7} />}>
    <g transform={cam(1.08, 600, 1150, sx, sy - 120)}>
      <DarkCar t={t} />
      <Cone x={700} k={1.3} w={380} />
      <Pool x={x - 140} y={y + 10} k={ease(t, hit + .5, hit + 2)} w={220} />
      <g transform={`rotate(${-fall * 84} ${x} ${y})`}><Figure x={x} y={y} s={.95} t={t > hit ? hit : t} L={t > hit ? { ...LK.r1, skin: '#d8d4d0', skinSh: '#a8a4a0' } : LK.r1} C={CS.r1}
        pose={{ ...POSES.stand, crouch: kn * 200, lean: -kn * 14, armL: [-30 - kn * 40, 20], armR: [30 + kn * 40, -20], head: -20 }} expr={t > hit ? 'pain' : 'scared'} lookY={-1} lid={t > hit ? .2 : 1} noBlink seed={21} rim={WARM} /></g>
      <Spray t={t} t0={hit} x={x} y={y - 560 * .95 + kn * 190} seed={21} pow={600} n={34} />
      <g transform="translate(-140 0)"><Figure x={300} y={2100} s={1.5} t={t} L={KL} C={KC} pose={PK(t, [[0, 'stand'], [hit, { ...POSES.hit, lean: -6 }], [hit + .6, 'tense']])} expr={t > hit ? 'scared' : 'calm'} turn={.6} lookX={.8} seed={3} sweat={1} /></g>
      {t > hit + .1 && <g opacity={ease(t, hit + .1, hit + .3)}>{[0, 1, 2, 3].map(i => <circle key={i} cx={100 + i * 18} cy={1030 + (i % 2) * 20} r={8 - i} fill="#a80c18" />)}</g>}
    </g>
  </Frame>;
};

// f1 (v3): Михалыч показывает на табло над дверью: «СЕВЕРНАЯ → КОНЕЧНАЯ · 1 остановка» — правило дало подземелье
export const F1: React.FC<SP> = ({ t }) => {
  const c = caps('f1'), board = c?.[1] ? ease(t, c[1][2] - .2, c[1][2] + .2) : 0, em = .85 + .15 * noise('em', t, 5);
  return <Frame t={t} grade="#2a0a10" gradeK={.18}>
    <g transform={cam(1.0 + t * .02, 540, 1100, 0, -140)}>
      <TrainInterior t={t} flicker={.1} red={1.6} />
      <rect width={1080} height={1920} fill="#14040a" opacity={.45} />
      {[[300, 1580], [640, 1500]].map(([x, y], i) => <g key={i}><Pool x={x + 40} y={y + 10} k={1} w={180} />
        <path d={`M${x - 150} ${y} Q${x - 120} ${y - 70} ${x} ${y - 80} Q${x + 130} ${y - 70} ${x + 160} ${y}Z`} fill={i ? '#3a4a5a' : '#5a2a2a'} stroke="#0c0d18" strokeWidth={5} /></g>)}
      <H t={t} w="mikh" pose={board > 0 ? { ...POSES.stand, armR: [150, -10] } : { ...POSES.stand, crouch: 30, armL: [-20, 40], armR: [20, -40] }} expr={board > 0 ? 'scared' : 'pain'} mouth={talk(t, c, 'МИХАЛЫЧ')} turn={-.3} lookY={board > 0 ? -.8 : .5} />
      <H t={t} w="timur" dx={150} pose={{ ...POSES.stand, crouch: 120, armL: [-40, 120], armR: [40, -120] }} expr="cry" tears={1} lookY={.6} />
      <H t={t} w="r2" pose={{ ...POSES.stand, armL: [-20, 60] }} expr="sad" lookY={.5} />
      <H t={t} w="kirill" pose={{ ...POSES.stand, armR: [20, -10] }} expr="sad" lookY={.4} prop={inHand({ ...POSES.stand, armR: [20, -10] }, 0)} />
      <rect width={1080} height={1920} fill="#ff1a2a" opacity={.05 * em} />
    </g>
    {false && <g transform={`translate(540 360) scale(${.8 + board * .2})`} opacity={board}>
      <rect x={-420} y={-110} width={840} height={220} rx={14} fill="#e8e8e0" stroke="#2a2e38" strokeWidth={8} />
      <text y={-20} textAnchor="middle" fontFamily="Mont" fontWeight={800} fontSize={56} fill="#c81e2a" letterSpacing={6}>СЕВЕРНАЯ → КОНЕЧНАЯ</text>
      <text y={60} textAnchor="middle" fontFamily="Mont" fontWeight={700} fontSize={44} fill="#2a2e38">1 остановка · без пересадок</text>
    </g>}
  </Frame>;
};

// g3 (v3): «К бою!» — огонь Михалыча → «Лёха, молнией!» → молния Лёхи; Обходчик лишь встряхивается; «Не берёт!»
export const G3: React.FC<SP> = ({ t }) => {
  const c = caps('g3'), fb = .7, bolt = c?.[1] ? c[1][3] + .05 : 2.0, [sx, sy] = shakeXY(t, [[fb + .4, 20, .4], [bolt + .1, 16, .4]]);
  const fq = clamp((t - fb) / .4), bx = 760 + (540 - 760) * fq, by = 1500 + (900 - 1500) * fq, boltOn = t > bolt && t < bolt + .4, fr = Math.floor(t * 30);
  const lit = t > fb + .3 && t < fb + .8 ? '#ff8a2a' : boltOn ? '#8fd8ff' : undefined;
  return <Frame t={t} grade="#1a0a10" gradeK={.1} impact={isImpact(t, fb + .4, 2) || isImpact(t, bolt, 2)} over={<g><Flash t={t} t0={fb + .4} dur={.3} color="#ffb060" max={.4} /><Flash t={t} t0={bolt} dur={.25} color="#bfe8ff" max={.5} /></g>}>
    <g transform={cam(1.0, 540, 1000, sx, sy - 100)}>
      <rect width={1080} height={1920} fill="#0c0808" />
      {[0, 1, 2, 3].map(i => { const s = Math.pow(.75, i); return <path key={i} d={`M${540 - 620 * s} ${1100 + 700 * s} L${540 - 620 * s} ${1100 - 500 * s} Q540 ${1100 - 1000 * s} ${540 + 620 * s} ${1100 - 500 * s} L${540 + 620 * s} ${1100 + 700 * s}`} fill="none" stroke={lit || '#2a1c1c'} strokeWidth={30 * s} opacity={lit ? .6 : 1} />; })}
      <path d="M0 1920 L1080 1920 L600 1100 L480 1100Z" fill="#160e0c" />
      <Walker x={540} y={1500} s={.85} t={t} open={.4 + (t > bolt + .4 ? .5 : 0)} hurt={t > fb + .4 ? 1 : 0} />
      {t > fb && fq < 1 && <g><circle cx={bx} cy={by} r={70} fill="#ff8a2a" filter="url(#glowBig)" /><circle cx={bx} cy={by} r={36} fill="#fff4c0" /></g>}
      {t > fb + .4 && t < fb + 1.0 && <g opacity={1 - (t - fb - .4) / .6}><circle cx={540} cy={900} r={320 * (t - fb)} fill="#ff8a2a" filter="url(#blur30)" /><circle cx={540} cy={900} r={140} fill="#fff4d0" opacity={.7} /></g>}
      {boltOn && <g><path d={`M260 1500 L${380 + (h1(fr) - .5) * 60} 1260 L${430 + (h1(fr + 1) - .5) * 60} 1100 L540 860`} stroke="#8fd8ff" strokeWidth={18} fill="none" filter="url(#glowBig)" /><path d={`M260 1500 L${380 + (h1(fr) - .5) * 60} 1260 L${430 + (h1(fr + 1) - .5) * 60} 1100 L540 860`} stroke="#fff" strokeWidth={6} fill="none" /></g>}
      <g transform="translate(540 2080) scale(.8) translate(-540 -1920)">
        <H t={t} w="mikh" pose={PK(t, [[0, 'guard'], [.5, { armR: [150, -20], lean: 8, crouch: 30 }], [1.2, { armL: [-100, 20], armR: [30, -110] }]])} expr="shout" mouth={talk(t, c, 'МИХАЛЫЧ')} rim={lit || '#ff8a2a'} lookY={-.7} />
        <H t={t} w="r2" pose={PK(t, [[0, 'guard'], [bolt - .3, { armL: [-150, 20], lean: -6 }], [bolt + .6, 'guard']])} expr="angry" rim={lit || '#8fd8ff'} lookY={-.7} />
        <H t={t} w="kirill" pose={POSES.tense} expr={t > bolt + .6 ? 'shout' : 'scared'} mouth={talk(t, c, 'КИРИЛЛ')} turn={.3} sweat={1} lookY={-.7} rim={lit} prop={inHand(POSES.tense, 0)} />
      </g>
    </g>
  </Frame>;
};

// g9: тишина — в вагоне Кирилл прижался лбом к стеклу двери; за стеклом темнота станции; Тимур тихо: «Михалыч…»
export const G9: React.FC<SP> = ({ t }) => { const c = caps('g9');
  return <Frame t={t} grade="#1a1018" gradeK={.15}>
    <g transform={cam(1.0 + t * .03, 540, 900)}>
      <rect width={1080} height={1920} fill="#2a2c34" /><rect x={240} y={420} width={600} height={760} rx={40} fill="#0a0606" stroke="#4a4e58" strokeWidth={14} />
      <ellipse cx={540} cy={800} rx={300} ry={200} fill="#ff4a2a" opacity={.12 + .08 * noise('gf', t, 3)} filter="url(#blur30)" />
      <g transform="translate(560 920) scale(5.2)"><Head t={t} L={KL} expr="cry" seed={3} lookY={.4} turn={.1} tears={1} lid={.4} noBlink /></g>
      <rect x={240} y={420} width={600} height={760} rx={40} fill="#9ab" opacity={.08} />
      <g transform="translate(180 1640) scale(2.8)"><Head t={t} L={LK.timur} expr="cry" seed={41} mouth={talk(t, c, 'ТИМУР')} tears={1} turn={.5} lookY={.4} /></g>
    </g>
  </Frame>; };

// i1 (v3): разбитая голова-фонарь сама ползёт по полу назад, к хвосту поезда — «будто его кто-то звал»
export const I1: React.FC<SP> = ({ t }) => {
  const c = caps('i1'), crawl = ease(t, 1.6, 5.2, (k: number) => k), tw = noise('tw', t, 6) * 6;
  return <Frame t={t} grade="#1a1018" gradeK={.12}>
    <g transform={cam(1.15 + t * .03, 540, 1300, 0, -200)}>
      <TrainInterior t={t} flicker={.9} shake={3} red={.6} />
      <rect width={1080} height={1920} fill="#05050a" opacity={.4} />
      <g transform={`translate(${-crawl * 380} ${crawl * 220}) rotate(${tw + crawl * -30} 560 1560)`}>
        <g transform="translate(560 1560) scale(1.6)"><circle r={190} fill="#ff6a3a" opacity={.25 + .2 * crawl} filter="url(#blur30)" /><rect x={-70} y={-80} width={140} height={150} rx={20} fill="#2a2a30" stroke="#0c0d18" strokeWidth={5} /><circle r={52} fill="#140c08" /><circle cx={(h1(Math.floor(t * 12)) - .5) * 30} r={10} fill="#ffb060" filter="url(#glow)" /></g>
        <path d={`M${560 + 200} 1600 l${60 + crawl * 200} 20`} stroke="#3a3030" strokeWidth={6} strokeDasharray="10 10" opacity={crawl} />
      </g>
      <H t={t} w="timur" dx={250} pose={{ ...POSES.stand, crouch: 120, armL: [-40, 120], armR: [40, -120] }} expr="scared" mouth={talk(t, c, 'ТИМУР')} lookY={.7} lookX={-.6} tears={.6} />
      <H t={t} w="kirill" pose={{ ...POSES.tense, armR: [40, -100] }} expr={crawl > .1 ? 'scared' : 'sad'} lookY={.7} lookX={-.5} turn={-.3} prop={inHand({ ...POSES.tense, armR: [40, -100] }, 0)} />
      <H t={t} w="r2" pose={POSES.tense} expr="scared" lookY={.6} lookX={-.5} />
    </g>
  </Frame>;
};

// ---------- поезд падает (v3): крупные сцепленные вагоны, кувырок, обломки ----------
export const BigCar: React.FC<{ x: number; y: number; s: number; rot: number; head?: boolean; dmg?: number }> = ({ x, y, s, rot, head, dmg = 0 }) => <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
  <rect x={-260} y={-110} width={520} height={220} rx={26} fill="#2e5a80" stroke="#0a0c14" strokeWidth={9} />
  <rect x={-260} y={-110} width={520} height={46} rx={22} fill="#4a7aa4" /><rect x={-260} y={8} width={520} height={12} fill="#c81e2a" />
  {[0, 1, 2, 3].map(j => <rect key={j} x={-226 + j * 116} y={-62} width={92} height={74} rx={8} fill={j === 1 && dmg > 0 ? '#0a0606' : '#fff0c0'} opacity={.8} />)}
  {[-170, 170].map(w => <g key={w}><circle cx={w} cy={116} r={30} fill="#1a1a20" stroke="#5a5a64" strokeWidth={7} /><circle cx={w} cy={116} r={8} fill="#8a8a94" /></g>)}
  <rect x={-280} y={30} width={24} height={30} fill="#3a3a44" /><rect x={256} y={30} width={24} height={30} fill="#3a3a44" />
  {dmg > 0 && <path d="M-120 -110 L-80 -60 L-130 -20 L-90 30" stroke="#0a0c14" strokeWidth={6} fill="none" />}
  {head && <g><path d="M260 -110 Q330 -70 330 0 Q330 70 260 110Z" fill="#2e5a80" stroke="#0a0c14" strokeWidth={9} /><circle cx={308} cy={34} r={20} fill="#fff8e0" /><ellipse cx={480} cy={40} rx={220} ry={60} fill="#fff4d0" opacity={.3} filter="url(#blur12)" /></g>}
</g>;
export const H2: React.FC<SP> = ({ t }) => {
  const q = ease(t, 0, 4.6, (k: number) => k), tilt = ease(t, 1.4, 4.4), camY = tilt * 820;
  const path = (u: number) => { const s = Math.max(0, u); return [60 + s * 1500, 900 + Math.max(0, s - .25) ** 2 * 2600]; };
  const ang = (u: number) => { const a = path(u), b = path(u + .02); return Math.atan2(b[1] - a[1], b[0] - a[0]) * 57; };
  const cars = [0, 1, 2].map(i => { const u = q * 1.1 - i * .52; return { u, p: path(u), a: ang(u) + Math.max(0, u - .4) * (i % 2 ? -40 : 60) }; });
  return <Frame t={t} vign={.8} grade="#2a0a10" gradeK={.08}>
    <g transform={`translate(0 ${-camY})`}>
      <rect y={-200} width={1080} height={3400} fill="#05030a" />
      <rect y={1600} width={1080} height={1600} fill="#2a0408" opacity={.6} filter="url(#blur30)" />
      <g transform="translate(540 2500) scale(1.6 .8)"><circle r={600} fill="#5a0610" opacity={.5} filter="url(#blur30)" />
        {Array.from({ length: 6 }).map((_, j) => <circle key={j} r={100 + j * 90} fill="none" stroke={j % 2 ? '#ff3a2a' : '#a80c18'} strokeWidth={22 - j * 2} strokeDasharray={`${200 + j * 40} 80`} transform={`rotate(${t * (30 + j * 8) * (j % 2 ? 1 : -1)})`} opacity={.8 - j * .08} />)}
        <ellipse rx={200} ry={120 * ease(t, 2.4, 3.4) + 2} fill="#1a0204" stroke="#ff4a2a" strokeWidth={10} />
        {t > 2.6 && <g><circle r={80} fill="#d81a10" /><circle r={56} fill="#fff0c0" opacity={.5} filter="url(#glow)" /><ellipse rx={14} ry={70} fill="#050000" /></g>}</g>
      {[0, 1, 2, 3].map(i => <Tentacle key={i} t={t} x0={300 + i * 160} y0={2450} x1={260 + i * 190 + Math.sin(t + i) * 60} y1={2450 - ease(t, 2.6 + i * .15, 4.4) * (800 + i * 90)} w={80 - i * 8} seed={i} />)}
      <Motes t={t} x={540} y={2400} w={1080} h={1800} n={60} color="#ff8a6a" speed={-200} />
      {[0, 1, 2].map(l => { const off = tilt * (1 + l) * 120; return <g key={l} opacity={1 - l * .25}><path d={`M0 ${-200 + off} L${200 - l * 40} ${-200 + off} L${160 - l * 30} ${700 + off} L${230 - l * 40} ${1300 + off} L${150 - l * 30} ${2000 + off} L${210 - l * 40} ${3200 + off} L0 ${3200 + off}Z`} fill={['#120c10', '#1a1218', '#241820'][l]} />
        <path d={`M1080 ${-200 + off} L${880 + l * 40} ${-200 + off} L${930 + l * 30} ${800 + off} L${860 + l * 40} ${1500 + off} L${920 + l * 30} ${2200 + off} L${870 + l * 40} ${3200 + off} L1080 ${3200 + off}Z`} fill={['#120c10', '#1a1218', '#241820'][l]} /></g>; })}
      <path d="M0 700 L200 700 L200 1060 L0 1060Z" fill="#0a0808" /><ellipse cx={200} cy={880} rx={60} ry={190} fill="#000" />
      <path d="M200 1030 L380 1030" stroke="#7a6a60" strokeWidth={12} /><path d="M380 1030 q30 10 50 70 M370 1030 q20 30 10 100" stroke="#7a6a60" strokeWidth={9} fill="none" />
      {q > .05 && q < .4 && Array.from({ length: 16 }).map((_, i) => { const a = -.6 - h1(i + Math.floor(t * 20)) * 1.4, r = 40 + h1(i * 3 + Math.floor(t * 20)) * 160; return <line key={i} x1={380} y1={1030} x2={380 + Math.cos(a) * r} y2={1030 + Math.sin(a) * r} stroke="#ffd080" strokeWidth={4} filter="url(#glow)" />; })}
      {/* сцепки */}
      {[0, 1].map(i => cars[i + 1].u > 0 && <line key={'c' + i} x1={cars[i].p[0] - Math.cos(cars[i].a / 57) * 275} y1={cars[i].p[1] - Math.sin(cars[i].a / 57) * 275} x2={cars[i + 1].p[0] + Math.cos(cars[i + 1].a / 57) * 275} y2={cars[i + 1].p[1] + Math.sin(cars[i + 1].a / 57) * 275} stroke="#3a3a44" strokeWidth={14} />)}
      {[2, 1, 0].map(i => cars[i].u > 0 && <BigCar key={i} x={cars[i].p[0]} y={cars[i].p[1]} s={1.05} rot={cars[i].a} head={i === 0} dmg={i === 1 ? 1 : 0} />)}
      {/* обломки */}
      {q > .35 && Array.from({ length: 14 }).map((_, i) => { const c0 = cars[i % 3].p, k = (t * .9 + h1(i)) % 1; return <rect key={'d' + i} x={c0[0] + (h1(i * 3) - .5) * 300} y={c0[1] + k * 500} width={14 + h1(i) * 20} height={10} fill="#4a5a6a" transform={`rotate(${t * 300 * (h1(i * 7) - .5)} ${c0[0]} ${c0[1] + k * 500})`} opacity={1 - k} />; })}
    </g>
  </Frame>;
};

// i5b: станция «Северная» — над путями раскрываются синие Врата, вагон вываливается и врезается в платформу; пыль
export const I5b: React.FC<SP> = ({ t }) => {
  const open = ease(t, 0, .5), fall = clamp((t - .5) / .55), hit = 1.05, [sx, sy] = shakeXY(t, [[hit, 40, .8]]);
  const y = 520 + fall * fall * 900;
  return <Frame t={t} grade="#1a1a2a" gradeK={.1} impact={isImpact(t, hit, 3)} over={<Flash t={t} t0={hit} dur={.2} color="#fff" max={.4} />}>
    <g transform={cam(1.0, 540, 1000, sx, sy)}>
      <MetroStation t={t} />
      <rect width={1080} height={1920} fill="#05060c" opacity={.35} />
      <Gate x={540} y={600} s={1.1 * open * (t > 2.4 ? 1 - ease(t, 2.4, 3.0) : 1)} t={t} />
      {t > .5 && <g transform={`translate(540 ${Math.min(y, 1420)}) rotate(${t < hit ? -30 + fall * 20 : -8})`}><BigCar x={0} y={0} s={.8} rot={0} dmg={1} /></g>}
      {t > hit && <Smoke t={t} t0={hit} x={540} y={1500} n={14} r={160} spread={520} color="#5a5a64" life={2.2} rise={180} k={.8} seed={21} />}
      {t > hit && Array.from({ length: 16 }).map((_, i) => { const q = clamp((t - hit) / .9), a = -Math.PI * (h1(i) * .9 + .05), r = 200 + h1(i * 3) * 400; return <rect key={i} x={540 + Math.cos(a) * r * q} y={1480 + Math.sin(a) * r * q + 600 * q * q} width={20} height={14} fill="#6a6a74" opacity={1 - q} />; })}
    </g>
  </Frame>;
};

// i6 (v3): Кирилл крупно лежит на плитке, щекой в крови; руки Тимура трясут за плечи; «Кирилл! Не умирай!» → «Я умирал. Я это чувствовал.»; темнеет
export const I6: React.FC<SP> = ({ t, d }) => {
  const c = caps('i6'), dark = ease(t, d - 1.6, d - .2), shake = t < 2.0 ? Math.sin(t * 22) * 10 : 0;
  return <Frame t={t} grade="#1a1a2a" gradeK={.15} over={<g><Lids k={dark * .9} /><rect width={1080} height={1920} fill="#000" opacity={ease(t, 2.2, d) * .3} filter="url(#blur30)" /></g>}>
    <rect width={1080} height={1920} fill="#2a2c34" />
    {Array.from({ length: 6 }).map((_, i) => <line key={i} x1={0} y1={300 + i * 300} x2={1080} y2={260 + i * 300} stroke="#1a1c22" strokeWidth={6} />)}
    <g transform={cam(1.0 + t * .03, 540, 900, shake, 0)}>
      <Pool x={460} y={1180} k={.6 + ease(t, 0, d) * .4} w={420} />
      <g transform="translate(520 860) rotate(-90) scale(6)"><Head t={t} L={{ ...KL, bruise: true, skin: '#e0ccc4' }} expr="pain" seed={3} lid={Math.max(0, .5 - dark * .5)} noBlink mouth={0} /></g>
      <path d="M380 1180 q40 -30 80 -10" stroke="#a80c18" strokeWidth={8} fill="none" />
      {[[860, 760], [880, 1120]].map(([x, y], i) => <g key={i}><path d={`M1180 ${y + 80} L${x + 40} ${y}`} stroke="#3a6a4a" strokeWidth={70} strokeLinecap="round" /><circle cx={x} cy={y} r={50} fill="#e8c4a8" stroke="#0c0d18" strokeWidth={5} /></g>)}
    </g>
    <g opacity={1 - dark} transform="translate(860 300) scale(2.4)"><Head t={t} L={LK.timur} expr="cry" seed={41} mouth={talk(t, c, 'ТИМУР')} tears={1} lookY={.8} lookX={-.4} /></g>
  </Frame>;
};

// i7 (v3): окно со ставкой — «Скрытое условие выполнено · Вы выбраны Игроком · Принять? · Отказ — вы умрёте здесь» + таймер; «Да…» → «Контракт принят»
export const I7: React.FC<SP> = ({ t }) => {
  const c = caps('i7'), yes = c?.[0] ? c[0][2] + .3 : 2.6, flash = yes + .2, left = Math.max(0, 10 - Math.floor(Math.max(0, t - 1.2) * 2.2));
  return <Frame t={t} vign={1} over={<Flash t={t} t0={flash} dur={.5} color="#9fe0ff" max={.5} />}>
    <rect width={1080} height={1920} fill="#010208" />
    <ellipse cx={540} cy={820} rx={600} ry={420} fill="#1a4aaa" opacity={.25 + ease(t, flash, flash + .3) * .3} filter="url(#blur30)" />
    <SysWin t={t} t0={.3} y={720} w={900} title="СКРЫТОЕ УСЛОВИЕ ВЫПОЛНЕНО" lines={['Вы выбраны Игроком.', 'Принять?']} size={56} />
    <g opacity={ease(t, 1.1, 1.4) * (t > flash ? 0 : 1)}><text x={540} y={930} textAnchor="middle" fontFamily="Mont" fontWeight={800} fontSize={40} fill="#ff6a7a" filter="url(#glow)">Отказ — вы умрёте здесь</text>
      <text x={540} y={1010} textAnchor="middle" fontFamily="JBM, monospace" fontWeight={700} fontSize={56} fill="#e8f8ff">{`00:${String(left).padStart(2, '0')}`}</text></g>
    <g opacity={ease(t, 1.4, 1.7)}>
      {[['ДА', 360, t > yes], ['НЕТ', 720, false]].map(([s, x, on]) => <g key={s as string} transform={`translate(${x} 1130) scale(${on ? 1 + spr(t, yes, { damping: 10 }) * .12 : 1})`}>
        <rect x={-140} y={-56} width={280} height={112} rx={10} fill={on ? '#5fd2ff' : '#06182e'} opacity={.9} stroke="#5fd2ff" strokeWidth={4} filter="url(#glow)" />
        <text y={20} textAnchor="middle" fontFamily="Mont" fontWeight={800} fontSize={56} fill={on ? '#06182e' : '#e8f8ff'}>{s as string}</text></g>)}
    </g>
    {t > flash + .3 && <SysWin t={t} t0={flash + .3} y={1500} w={760} lines={['Контракт принят.']} size={50} />}
  </Frame>;
};

// j1 (v3): больница — Кирилл полусидя на поднятой кровати, приподнимает футболку: бок цел; Настя спала у кровати — просыпается: «Кирилл?.. Ты очнулся!»
export const J1: React.FC<SP> = ({ t }) => {
  const c = caps('j1'), wake = c?.[1] ? ease(t, c[1][2] - .6, c[1][2]) : 0, lift = ease(t, 1.6, 2.6), beep = (t * 1.1) % 1;
  const kp = { ...POSES.stand, crouch: 0, armL: [-20, 40] as [number, number], armR: lift > 0 ? [60, -110] as [number, number] : [30, -40] as [number, number] };
  return <Frame t={t} grade="#1a2a3a" gradeK={.06}>
    <g transform={cam(1.05 + t * .015, 540, 1000, 0, -100)}>
      <rect width={1080} height={1920} fill="#cfd6de" /><rect y={1360} width={1080} height={560} fill="#9aa4ae" />
      <rect x={640} y={240} width={360} height={500} fill="#0a1428" stroke="#e8eef4" strokeWidth={16} />
      <g transform="translate(640 240)"><Vysotka x={180} y={500} s={.45} lit={.8} star /><circle cx={290} cy={80} r={18} fill="#e8f0ff" /></g>
      <rect x={70} y={380} width={250} height={170} rx={10} fill="#0a1410" stroke="#3a4448" strokeWidth={8} />
      <path d={`M90 470 ${Array.from({ length: 20 }).map((_, i) => { const x = 90 + i * 11, u = ((i / 20) - beep + 1) % 1; return `L${x} ${470 - (u < .06 ? 55 : u < .1 ? -28 : 0)}`; }).join(' ')}`} stroke="#3aff8a" strokeWidth={4} fill="none" filter="url(#glow)" />
      {/* кровать с поднятой спинкой */}
      <path d="M200 780 L330 780 L420 1180 L300 1180Z" fill="#e8eef4" stroke="#8a949e" strokeWidth={6} />
      <Figure x={430} y={1660} s={.95} t={t} L={{ ...LK.kirill4, bruise: false }} C={{ ...CS.hoodieWeak, top: '#dde6ee', topSh: '#b8c4ce', hood: false }} pose={kp} expr={wake > .5 ? 'calm' : 'scared'} lookX={wake > .3 ? .7 : 0} lookY={lift > 0 && lift < 1 ? .8 : 0} seed={3} turn={wake > .3 ? .5 : 0} />
      <rect x={240} y={1180} width={760} height={150} rx={20} fill="#e8eef4" stroke="#8a949e" strokeWidth={6} /><rect x={240} y={1330} width={760} height={380} fill="#8a949e" stroke="#5a646e" strokeWidth={6} />
      <path d="M300 1190 Q620 1120 990 1190 L990 1250 L300 1250Z" fill="#f4f8fc" stroke="#a8b2bc" strokeWidth={4} />
      {lift > .5 && <g opacity={ease(t, 2.2, 2.6)}><rect x={400} y={1150} width={80} height={46} rx={10} fill="#f0d4c4" /><text x={440} y={1130} textAnchor="middle" fontFamily="Mont" fontWeight={800} fontSize={30} fill="#2a8a4a">ни шрама</text></g>}
      <rect x={760} y={1420} width={200} height={30} rx={8} fill="#6a5a4a" /><rect x={930} y={1180} width={28} height={260} fill="#6a5a4a" /><rect x={770} y={1450} width={20} height={250} fill="#4a3a2a" /><rect x={930} y={1450} width={20} height={250} fill="#4a3a2a" />
      <Figure x={850} y={1700} s={.92} t={t} L={LK.nastya} C={CS.nastya} pose={{ ...POSES.stand, crouch: 280, lean: -34 + wake * 30, legL: [-60, 110], legR: [-40, 100], armL: [-150 + wake * 100, 60], armR: [-120 + wake * 90, 50] }} expr={wake > .5 ? 'cry' : 'calm'} lid={wake} noBlink={wake < .5} tears={wake} mouth={talk(t, c, 'НАСТЯ')} seed={9} turn={-.5} lookX={-.8} />
    </g>
  </Frame>;
};
