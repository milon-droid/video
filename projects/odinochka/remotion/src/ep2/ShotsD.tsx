// Серия 2, планы g1–g6, h1–h3: станция «Депо» — Обходчик (огромный, магия не берёт), бегство в вагон, лапа в дверях;
// поезд разгоняется и вылетает над пропастью без рельсов, внизу портал → падение, «Серия 3».
import React from 'react';
import { clamp, ease, noise } from '../anim';
import { cam, Flash, h1, isImpact, Motes, shakeXY, SpeedLines } from '../kit/fx';
import { Figure, PK, POSES, walkPose } from '../chars/body';
import { INK } from '../chars/head';
import { LK, CS } from '../chars/cast';
import { Gate } from '../bg/moscow';
import { TrainInterior } from '../bg/places';
import { Frame, SP } from '../ep1/common';
import { Boom, KL, Shock } from '../ep1/ShotsF';
import { H } from './team';
import { caps, talk } from './timeline';
import { Spray, Splat } from './ShotsC';
import { Tag } from './ShotsE';

// Обходчик: тощий великан, рваный оранжевый жилет путейца, длинные руки, в правой — молот; голова-череп с вертикальной пастью.
// open 0..1 — пасть раскрывается; swing 0..1 — замах молотом сверху вниз; crouch — присел на лапы
export const Walker: React.FC<{ x: number; y: number; s?: number; t: number; open?: number; swing?: number; crouch?: number; hurt?: number; step?: number }> = ({ x, y, s = 1, t, open = 0, swing = 0, crouch = 0, hurt = 0, step }) => {
  const br = Math.sin(t * 3) * 6, hy = -980 + crouch * 200 + br, sw = -150 + swing * 230;
  const hx = Math.sin(sw * Math.PI / 180) * 520, hyy = hy + 140 - Math.cos(sw * Math.PI / 180) * 520;
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* ноги-ходули */}
    {[-1, 1].map(sd => { const ph = step === undefined ? 0 : Math.sin(step * Math.PI + (sd > 0 ? Math.PI : 0)), lift = step === undefined ? 0 : Math.max(0, ph) * 70, fx = sd * 130 + ph * 90;
      const hip = [sd * 60, hy + 380], foot = [fx, -lift], kx = (hip[0] + foot[0]) / 2 + sd * (150 + crouch * 90), ky = (hip[1] + foot[1]) / 2 - crouch * 40;
      return <g key={sd}><path d={`M${hip[0]} ${hip[1]} L${kx} ${ky} L${foot[0]} ${foot[1]}`} stroke="#2a2420" strokeWidth={50} fill="none" strokeLinejoin="round" strokeLinecap="round" />
        <path d={`M${hip[0]} ${hip[1]} L${kx} ${ky}`} stroke="#3a3028" strokeWidth={22} fill="none" strokeLinecap="round" opacity={.6} />
        <circle cx={kx} cy={ky} r={30} fill="#d8d0c0" stroke={INK} strokeWidth={5} />
        <path d={`M${foot[0] - 40} ${foot[1]} l100 0 l10 -20`} stroke="#1a1410" strokeWidth={26} strokeLinecap="round" fill="none" /></g>; })}
    {/* торс + жилет */}
    <path d={`M-120 ${hy + 120} Q-150 ${hy + 300} -90 ${hy + 420} L90 ${hy + 420} Q150 ${hy + 300} 120 ${hy + 120}Z`} fill="#3a302a" stroke={INK} strokeWidth={6} />
    <path d={`M-110 ${hy + 140} L-80 ${hy + 410} L-20 ${hy + 400} L-30 ${hy + 160}Z M110 ${hy + 140} L80 ${hy + 410} L20 ${hy + 400} L30 ${hy + 160}Z`} fill="#e86a1a" stroke={INK} strokeWidth={5} />
    <path d={`M-100 ${hy + 280} L-40 ${hy + 280} M100 ${hy + 280} L40 ${hy + 280}`} stroke="#e8e8d0" strokeWidth={14} />
    {/* рёбра сквозь дыры */}
    {[0, 1, 2].map(i => <path key={i} d={`M-26 ${hy + 200 + i * 50} Q0 ${hy + 212 + i * 50} 26 ${hy + 200 + i * 50}`} stroke="#c8c0b0" strokeWidth={8} fill="none" />)}
    {/* левая рука — длинная, когти до земли */}
    <path d={`M-120 ${hy + 140} Q-300 ${hy + 420} -260 ${-120 + crouch * 80}`} stroke="#2a2420" strokeWidth={34} fill="none" strokeLinecap="round" />
    {[-30, 0, 30].map((f, i) => <path key={i} d={`M-260 ${-120 + crouch * 80} l${f} 90`} stroke="#d8d0c0" strokeWidth={10} strokeLinecap="round" />)}
    {/* правая рука с молотом */}
    <path d={`M120 ${hy + 140} Q${hx * .5 + 200} ${hyy * .5 + hy * .5} ${hx} ${hyy}`} stroke="#2a2420" strokeWidth={34} fill="none" strokeLinecap="round" />
    <g transform={`translate(${hx} ${hyy}) rotate(${sw})`}><rect x={-12} y={-300} width={24} height={320} fill="#4a3a2a" stroke={INK} strokeWidth={4} /><rect x={-90} y={-360} width={180} height={80} rx={8} fill="#5a5e68" stroke={INK} strokeWidth={6} /><rect x={-90} y={-330} width={180} height={12} fill="#a80c18" opacity={.7} /></g>
    {/* голова-череп, вытянутая, с вертикальной пастью */}
    <g transform={`translate(0 ${hy}) rotate(${noise('wk', t, .8) * 8})`}>
      <path d="M-70 40 C-90 -60 -60 -170 0 -180 C60 -170 90 -60 70 40 C50 110 -50 110 -70 40Z" fill="#d8d0c0" stroke={INK} strokeWidth={6} />
      {[-1, 1].map(sd => <g key={sd}><ellipse cx={sd * 34} cy={-70} rx={20} ry={26} fill="#0a0404" /><circle cx={sd * 34} cy={-66} r={6} fill="#ff2030" filter="url(#glow)" /></g>)}
      <path d={`M0 -40 C${-24 - open * 50} 0 ${-24 - open * 50} 60 0 ${100 + open * 30} C${24 + open * 50} 60 ${24 + open * 50} 0 0 -40Z`} fill="#1a0406" stroke={INK} strokeWidth={4} />
      {open > .1 && Array.from({ length: 8 }).map((_, i) => { const sd = i % 2 ? 1 : -1, yy = -20 + Math.floor(i / 2) * 30; return <path key={i} d={`M${sd * (14 + open * 40)} ${yy} l${-sd * 22 * open} 8 l${sd * 22 * open} 8Z`} fill="#e8e0d0" />; })}
      {hurt > 0 && <path d="M-50 -120 L-10 -60 L-40 -20" stroke="#a80c18" strokeWidth={6} fill="none" />}
    </g>
  </g>;
};
// станция «Депо»: тёмные своды, красная лампа, висящие крюки, рельсы
const Depot: React.FC<{ t: number; k?: number }> = ({ t, k = 1 }) => <g>
  <rect width={1080} height={1920} fill="#0c0808" />
  {[0, 1, 2, 3, 4].map(i => { const s = Math.pow(.75, i); return <path key={i} d={`M${540 - 620 * s} ${1100 + 700 * s} L${540 - 620 * s} ${1100 - 500 * s} Q540 ${1100 - 1000 * s} ${540 + 620 * s} ${1100 - 500 * s} L${540 + 620 * s} ${1100 + 700 * s}`} fill="none" stroke="#2a1c1c" strokeWidth={30 * s} />; })}
  <path d="M0 1920 L1080 1920 L600 1100 L480 1100Z" fill="#160e0c" />
  {[-1, 1].map(sd => <line key={sd} x1={540 + sd * 30} y1={1100} x2={540 + sd * 400} y2={1920} stroke="#6a5a50" strokeWidth={10} />)}
  {Array.from({ length: 8 }).map((_, i) => { const q = i / 8, y = 1100 + q * q * 820; return <line key={i} x1={540 - 40 - q * 400} y1={y} x2={540 + 40 + q * 400} y2={y} stroke="#3a2a22" strokeWidth={6 + q * 14} />; })}
  {[180, 360, 720, 900].map((x, i) => <g key={i} transform={`rotate(${noise('hk' + i, t, .5) * 5} ${x} 0)`}><line x1={x} y1={0} x2={x} y2={420 + i * 40} stroke="#4a3a34" strokeWidth={5} /><path d={`M${x} ${420 + i * 40} q0 40 -26 40`} stroke="#6a5a50" strokeWidth={8} fill="none" /></g>)}
  <circle cx={540} cy={420} r={22} fill="#ff2a2a" opacity={k * (.6 + .4 * Math.sin(t * 4))} /><circle cx={540} cy={420} r={300} fill="#ff1a1a" opacity={k * .12} filter="url(#blur30)" />
  <rect x={340} y={560} width={400} height={100} fill="#1a1414" stroke="#3a2a2a" strokeWidth={6} /><text x={540} y={630} textAnchor="middle" fontFamily="Mont" fontWeight={800} fontSize={60} letterSpacing={14} fill="#8a7a6a">ДЕПО</text>
</g>;

// g1: двери открываются на тёмную станцию; издалека — стук металла по рельсам; Тимур: «Что это… стучит?»
export const G1: React.FC<SP> = ({ t }) => {
  const c = caps('g1'), tap = [.6, 1.2, 1.8, 2.3, 2.7, 3.0].some(x => t > x && t < x + .08);
  return <Frame t={t} grade="#2a1010" gradeK={.12}>
    <g transform={cam(1.0 + t * .04, 540, 1100, tap ? 4 : 0, -140)}>
      <Depot t={t} />
      <rect x={-ease(t, 0, .6) * 300} y={0} width={300} height={1920} fill="#5a5e68" opacity={.9} /><rect x={780 + ease(t, 0, .6) * 300} y={0} width={300} height={1920} fill="#4a4e58" opacity={.9} />
      <H t={t} w="timur" dx={300} pose={POSES.tense} expr="scared" mouth={talk(t, c, 'ТИМУР')} turn={.4} lookX={.5} sweat={1} />
      <H t={t} w="mikh" dx={-120} pose={POSES.guard} expr="angry" turn={-.2} />
      <H t={t} w="r2" dx={-80} pose={POSES.guard} expr="scared" turn={.3} />
    </g>
    <Tag t={t} t0={.8} x={380} y={1000} name="ЛЁХА" sub="ранг D · молния" />
    {tap && <circle cx={540} cy={1100} r={180} fill="none" stroke="#ff4a3a" strokeWidth={4} opacity={.4} />}
  </Frame>;
};

// g2: скример — Обходчик падает с потолка прямо перед отрядом, пасть раскрывается
export const G2: React.FC<SP> = ({ t }) => {
  const drop = clamp((t - .3) / .25) ** 2, land = .55, open = ease(t, .9, 1.4), [sx, sy] = shakeXY(t, [[land, 40, .7], [1.4, 14, .8]]);
  return <Frame t={t} grade="#2a0a0a" gradeK={.12} impact={isImpact(t, land, 3)} over={<Flash t={t} t0={land} dur={.25} color="#ff6a5a" max={.5} />}>
    <g transform={cam(1.0 + open * .35, 540, 760, sx, sy)}>
      <Depot t={t} />
      <Walker x={540} y={1700 - (1 - drop) * 1600} s={1.15} t={t} open={open} crouch={t > land ? .6 - ease(t, land, 1.2) * .6 : 0} />
      {t > land && <Shock t={t} t0={land} x={540} y={1700} c="#a08070" r={700} />}
    </g>
    {t > 1.0 && <SpeedLines t={t} cx={540} cy={700} k={.6} color="#ffdcd0" />}
  </Frame>;
};

// g6: крупно пасть Обходчика — рёв (рывки зума)
export const G6: React.FC<SP> = ({ t }) => {
  const f = Math.floor(t * 30), z = 2.2 + (f % 6 < 3 ? 0 : .25) + t * .3, [sx, sy] = shakeXY(t, [[0, 18, 2]]);
  return <Frame t={t} grade="#2a0a0a" gradeK={.15} vign={1}>
    <g transform={cam(z, 540, 820, sx, sy)}><Depot t={t} /><Walker x={540} y={1700} s={1.15} t={t} open={1} /></g>
    <SpeedLines t={t} cx={540} cy={900} k={.8} color="#ffdcd0" />
  </Frame>;
};

// g3: «К бою!» — огненный шар Михалыча и молния Лёхи бьют в Обходчика — он только встряхивается; Кирилл: «Не берёт!»
export const G3: React.FC<SP> = ({ t }) => {
  const c = caps('g3'), fb = .7, bolt = 1.6, [sx, sy] = shakeXY(t, [[fb + .4, 20, .4], [bolt + .1, 16, .4]]);
  const fq = clamp((t - fb) / .4), bx = 760 + (540 - 760) * fq, by = 1500 + (900 - 1500) * fq;
  const boltOn = t > bolt && t < bolt + .4, fr = Math.floor(t * 30);
  return <Frame t={t} grade="#1a0a10" gradeK={.1} impact={isImpact(t, fb + .4, 2) || isImpact(t, bolt, 2)} over={<g><Flash t={t} t0={fb + .4} dur={.3} color="#ffb060" max={.5} /><Flash t={t} t0={bolt} dur={.25} color="#bfe8ff" max={.6} /></g>}>
    <g transform={cam(1.0, 540, 1000, sx, sy - 100)}>
      <Depot t={t} />
      <Walker x={540} y={1500} s={.85} t={t} open={.4 + (t > 2.4 ? .5 : 0)} hurt={t > fb + .4 ? 1 : 0} />
      {t > fb && fq < 1 && <g><circle cx={bx} cy={by} r={70} fill="#ff8a2a" filter="url(#glowBig)" /><circle cx={bx} cy={by} r={36} fill="#fff4c0" /></g>}
      <Boom t={t} t0={fb + .4} x={540} y={900} r={320} />
      {boltOn && <g><path d={`M260 1500 L${380 + (h1(fr) - .5) * 60} 1260 L${430 + (h1(fr + 1) - .5) * 60} 1100 L540 860`} stroke="#8fd8ff" strokeWidth={18} fill="none" filter="url(#glowBig)" /><path d={`M260 1500 L${380 + (h1(fr) - .5) * 60} 1260 L${430 + (h1(fr + 1) - .5) * 60} 1100 L540 860`} stroke="#fff" strokeWidth={6} fill="none" /></g>}
      <g transform="translate(540 2080) scale(.8) translate(-540 -1920)">
        <H t={t} w="mikh" pose={PK(t, [[0, 'guard'], [.5, { armR: [150, -20], lean: 8, crouch: 30 }], [1.2, 'guard']])} expr="shout" mouth={talk(t, c, 'МИХАЛЫЧ')} rim="#ff8a2a" />
        <H t={t} w="r2" pose={PK(t, [[0, 'guard'], [1.4, { armL: [-150, 20], lean: -6 }], [2.2, 'guard']])} expr="angry" rim="#8fd8ff" />
        <H t={t} w="kirill" pose={POSES.tense} expr={t > 2.6 ? 'shout' : 'scared'} mouth={talk(t, c, 'КИРИЛЛ')} turn={.3} sweat={1} />
      </g>
    </g>
  </Frame>;
};

// g4: удар молота — Михалыча задевает (кровь из плеча), Кирилл выдёргивает Тимура из-под удара; «Все в вагон!»
export const G4: React.FC<SP> = ({ t }) => {
  const c = caps('g4'), hit = .7, sw = ease(t, .1, hit), [sx, sy] = shakeXY(t, [[hit, 40, .6]]);
  return <Frame t={t} grade="#2a0a0a" gradeK={.12} impact={isImpact(t, hit, 3)} over={<Splat t={t} t0={hit + .05} seed={21} n={4} k={.8} />}>
    <g transform={cam(1.05, 540, 1050, sx, sy - 100)}>
      <Depot t={t} />
      <Walker x={620} y={1450} s={.85} t={t} open={.7} swing={sw} crouch={.3} />
      {t > hit && <Shock t={t} t0={hit} x={560} y={1700} c="#a08070" r={520} />}
      <Spray t={t} t0={hit} x={760} y={1300} dir={.5} seed={5} pow={700} />
      <g transform="translate(540 2080) scale(.8) translate(-540 -1920)">
        <H t={t} w="mikh" pose={t < hit ? POSES.guard : { ...POSES.hit, armR: [150, -10] }} expr={t < hit ? 'angry' : 'shout'} mouth={talk(t, c, 'МИХАЛЫЧ')} rim="#ff4a3a" />
        <H t={t} w="timur" dx={300 - ease(t, .4, .9) * 180} pose={t < .5 ? POSES.tense : POSES.hit} expr="scared" />
        <H t={t} w="kirill" dx={80} pose={PK(t, [[0, 'tense'], [.4, { armR: [100, -20], lean: 16 }], [.9, { armR: [60, -90], lean: -10 }]])} expr="shout" turn={.4} />
      </g>
    </g>
  </Frame>;
};

// g5: отряд влетает в вагон, двери закрываются — лапа Обходчика в щели: двери отсекают когти (кровь), поезд рвёт с места; морда в окне — и исчезает
export const G5: React.FC<SP> = ({ t }) => {
  const shut = ease(t, .1, .5), cut = 1.3, [sx, sy] = shakeXY(t, [[.5, 20, .3], [cut, 36, .5], [2.0, 10, 2]]);
  const face = t > 2.4 && t < 3.4;
  return <Frame t={t} grade="#1a0a10" gradeK={.1} impact={isImpact(t, cut, 3) || isImpact(t, 2.4, 2)} over={<Flash t={t} t0={cut} dur={.2} color="#ff4a3a" max={.4} />}>
    <g transform={cam(1.1, 540, 900, sx, sy)}>
      <rect width={1080} height={1920} fill="#2a2c34" />
      <rect x={140} y={300} width={800} height={1400} fill="#0c0808" />
      {/* окно двери: темнота станции / морда */}
      {face && <g transform={`translate(${540 - (t - 2.4) * 900} 760) scale(1.7)`}><path d="M-70 40 C-90 -60 -60 -170 0 -180 C60 -170 90 -60 70 40 C50 110 -50 110 -70 40Z" fill="#d8d0c0" stroke={INK} strokeWidth={6} />
        {[-1, 1].map(sd => <circle key={sd} cx={sd * 34} cy={-66} r={10} fill="#ff2030" filter="url(#glow)" />)}<path d="M0 -40 C-70 0 -70 60 0 130 C70 60 70 0 0 -40Z" fill="#1a0406" /></g>}
      {t > cut && <Spray t={t} t0={cut} x={540} y={1100} dir={0} seed={8} pow={600} />}
      {/* лапа в щели */}
      {t < cut + .1 && <g transform={`translate(540 1100) rotate(${t > .6 ? noise('cl', t, 6) * 10 : 0})`}>{[-50, 0, 50].map((f, i) => <path key={i} d={`M-200 ${f} L60 ${f * 1.3} l40 ${16 - i * 10}`} stroke={i === 1 ? '#2a2420' : '#d8d0c0'} strokeWidth={i === 1 ? 50 : 16} strokeLinecap="round" fill="none" />)}</g>}
      {t > cut && [-50, 0, 50].map((f, i) => <path key={i} d={`M${560 + i * 30} ${1080 + f + (t - cut) * 1200 * (1 + i * .2)} l40 16`} stroke="#d8d0c0" strokeWidth={16} strokeLinecap="round" />)}
      <rect x={140 - (1 - shut) * 300} y={260} width={400 - (t < cut ? 26 : 0)} height={1480} fill="#8a909a" stroke="#2a2e38" strokeWidth={10} />
      <rect x={540 + (t < cut ? 26 : 0) + (1 - shut) * 300} y={260} width={400} height={1480} fill="#7a808a" stroke="#2a2e38" strokeWidth={10} />
      {[340, 740].map((x, i) => <rect key={i} x={x - 110 - (i ? -1 : 1) * (1 - shut) * 300} y={520} width={220} height={480} rx={20} fill="#0c0808" stroke="#2a2e38" strokeWidth={8} opacity={.9} />)}
      {face && <g transform={`translate(${340 - (t - 2.4) * 600} 760) scale(1.1)`}><path d="M-70 40 C-90 -60 -60 -170 0 -180 C60 -170 90 -60 70 40 C50 110 -50 110 -70 40Z" fill="#d8d0c0" stroke={INK} strokeWidth={6} />
        {[-1, 1].map(sd => <circle key={sd} cx={sd * 34} cy={-66} r={10} fill="#ff2030" filter="url(#glow)" />)}<path d="M0 -40 C-70 0 -70 60 0 130 C70 60 70 0 0 -40Z" fill="#1a0406" /></g>}
      {t > cut && <rect x={520} y={1060} width={40} height={140} fill="#8a0a14" opacity={.85} />}
    </g>
  </Frame>;
};

// h1: поезд несётся всё быстрее, лампы мелькают; диктор сбоит «Следующая станция — Конечная»; Кирилл про себя
export const H1: React.FC<SP> = ({ t }) => {
  const [sx, sy] = shakeXY(t, [[0, 8, 5]]);
  return <Frame t={t} grade="#1a1a2a" gradeK={.12}>
    <g transform={cam(1.05 + t * .03, 540, 1050, sx, sy - 120)}>
      <TrainInterior t={t} flicker={1} shake={6} />
      <rect width={1080} height={1920} fill="#05050a" opacity={.35} />
      <H t={t} w="timur" dx={150} pose={{ ...POSES.stand, crouch: 60, armR: [150, -10] }} expr="scared" />
      <H t={t} w="r2" pose={{ ...POSES.stand, armL: [-160, 10] }} expr="scared" />
      <H t={t} w="kirill" pose={{ ...POSES.stand, armR: [165, -5] }} expr="determined" lookX={.5} />
    </g>
    <SpeedLines t={t} cx={540} cy={820} k={.35 + t * .1} />
  </Frame>;
};

// h2: снаружи — поезд вылетает из тоннеля над бездной: рельсы обрываются, внизу огромный синий портал
const TrainSide: React.FC<{ x: number; y: number; s: number; rot: number }> = ({ x, y, s, rot }) => <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
  {[0, 1, 2].map(i => <g key={i} transform={`translate(${-i * 420} ${i * i * 14})`}><rect x={-200} y={-90} width={400} height={180} rx={20} fill="#2a4a6a" stroke="#0a0c14" strokeWidth={8} />
    {[0, 1, 2].map(j => <rect key={j} x={-170 + j * 120} y={-60} width={90} height={70} fill="#fff0c0" opacity={.7} />)}<rect x={-200} y={50} width={400} height={20} fill="#1a2a3a" /></g>)}
  <circle cx={190} cy={20} r={20} fill="#fff8e0" /><ellipse cx={330} cy={20} rx={200} ry={60} fill="#fff4d0" opacity={.35} filter="url(#blur12)" />
</g>;
// глаз хозяина подземелья в красном портале: open 0..1
const HeartEye: React.FC<{ t: number; x: number; y: number; s: number; open: number }> = ({ t, x, y, s, open }) => <g transform={`translate(${x} ${y}) scale(${s})`}>
  <ellipse rx={260} ry={150 * open + 2} fill="#1a0204" stroke="#ff3a2a" strokeWidth={8} filter="url(#glow)" />
  {open > .2 && <g><circle cx={noise('ey', t, .6) * 60} r={110 * open} fill="#c81a10" /><ellipse cx={noise('ey', t, .6) * 60} rx={18} ry={95 * open} fill="#050000" /><circle cx={noise('ey', t, .6) * 60 - 40} cy={-40} r={14} fill="#ffd0c0" opacity={.8} /></g>}
  {Array.from({ length: 10 }).map((_, i) => { const a = i / 10 * Math.PI * 2; return <path key={i} d={`M${Math.cos(a) * 280} ${Math.sin(a) * 170} q${Math.cos(a + .6) * 60} ${Math.sin(a + .6) * 60} ${Math.cos(a) * 120} ${Math.sin(a) * 90}`} stroke="#8a0a10" strokeWidth={8} fill="none" opacity={open} />; })}
</g>;
export const H2: React.FC<SP> = ({ t }) => {
  const out = ease(t, .2, 2.4, (k: number) => k), fall = Math.max(0, t - 2.4);
  return <Frame t={t} vign={.8}>
    <rect width={1080} height={1920} fill="#03040a" />
    <ellipse cx={540} cy={1700} rx={900} ry={500} fill="#aa1a1a" opacity={.35} filter="url(#blur30)" />
    <g transform={`translate(540 1650) scale(1 .45)`}><Gate x={0} y={0} s={2.6} t={t} color="#ff3a2a" /></g>
    <HeartEye t={t} x={540} y={1650} s={.9} open={ease(t, 2.2, 3.4)} />
    <Motes t={t} x={540} y={1800} w={1080} h={1600} n={50} color="#ff8a6a" speed={200} />
    {/* скальный обрыв и тоннель слева */}
    <path d="M0 0 L300 0 L340 900 L280 1100 L320 1920 L0 1920Z" fill="#0c0c12" /><ellipse cx={300} cy={760} rx={70} ry={150} fill="#000" />
    <path d="M300 860 L620 860" stroke="#6a5a50" strokeWidth={10} /><path d="M620 860 l30 40 M600 860 l20 60" stroke="#6a5a50" strokeWidth={8} />
    <TrainSide x={220 + out * 700 + fall * 80} y={800 + fall * fall * 600} s={.8} rot={fall * 25} />
  </Frame>;
};

// h3: поезд проваливается в портал; синяя вспышка → «СЕРИЯ 3 — СКОРО»
export const H3: React.FC<SP> = ({ t, d }) => {
  const sink = ease(t, 0, 1.4, (k: number) => k * k);
  return <Frame t={t} vign={1} over={<Flash t={t} t0={1.3} dur={.5} color="#ff6a5a" max={.9} />}>
    <rect width={1080} height={1920} fill="#0a0203" />
    <Gate x={540} y={960} s={1.6 + sink * .6} t={t} color="#ff3a2a" />
    <HeartEye t={t} x={540} y={960} s={1.2 + sink * .8} open={1} />
    {t < 1.4 && <TrainSide x={540} y={500 + sink * 460} s={.9 - sink * .8} rot={70} />}
    <g opacity={ease(t, 1.7, 2.2)}>
      <rect x={0} y={1280} width={1080} height={420} fill="#02030a" opacity={.6} filter="url(#blur30)" />
      <text x={540} y={1430} textAnchor="middle" fontFamily="CormSC, serif" fontWeight={700} fontSize={140} letterSpacing={4} fill="#f4fbff" filter="url(#glow)">ОДИНОЧКА</text>
      <line x1={200} x2={880} y1={1480} y2={1480} stroke="#5fd2ff" strokeWidth={3} filter="url(#glow)" />
      <text x={540} y={1550} textAnchor="middle" fontFamily="Oswald" fontWeight={300} fontSize={42} letterSpacing={16} fill="#9fdcff">СЕРИЯ 3 — СКОРО</text>
      <text x={540} y={1640} textAnchor="middle" fontFamily="Mont" fontWeight={700} fontSize={40} fill="#e8f8ff">Как Кирилл спасёт отряд? Пиши в комментах</text>
    </g>
  </Frame>;
};
