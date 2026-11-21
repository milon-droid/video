// Серия 2, планы a1–b6: хук (глаз и голос «отца»), заставка, каждый видит под фонарём своё, отряд падает, свет крепнет.
import React from 'react';
import { clamp, ease, noise } from '../anim';
import { cam, Flash, h1, isImpact, Motes, shakeXY } from '../kit/fx';
import { Figure, PK, POSES } from '../chars/body';
import { Head } from '../chars/head';
import { Machinist } from '../chars/monsters';
import { LK, CS } from '../chars/cast';
import { Frame, SP } from '../ep1/common';
import { Intro } from '../ep1/Intro';
import { G, H, KL } from '../ep1/ShotsF';
import { caps, talk } from './timeline';

export const WARM = '#fff0c0';
// конус света фонаря сверху (x — куда падает), k — сила
export const Cone: React.FC<{ x?: number; y0?: number; k?: number; w?: number; x0?: number }> = ({ x = 540, y0 = -80, k = 1, w = 380, x0 = 540 }) => <g>
  <polygon points={`${x0},${y0} ${x - w},1980 ${x + w},1980`} fill={WARM} opacity={.2 * k} filter="url(#blur12)" />
  <polygon points={`${x0},${y0} ${x - w * .45},1980 ${x + w * .45},1980`} fill="#fff8e0" opacity={.12 * k} filter="url(#blur30)" />
</g>;
// фон вагона в темноте: пол, поручни, тусклые окна
export const DarkCar: React.FC<{ t: number; k?: number }> = ({ t, k = 1 }) => <g>
  <rect width={1080} height={1920} fill="#0b0c11" />
  <path d="M0 1920 L1080 1920 L640 1060 L440 1060Z" fill="#17140f" opacity={k} />
  {[0, 1, 2, 3].map(i => { const s = Math.pow(.72, i), x = 540 - 520 * s; return <g key={i} opacity={.7 * k}>
    <rect x={x} y={1060 - 760 * s} width={1040 * s} height={1700 * s} fill="none" stroke="#24262e" strokeWidth={12 * s} />
    <rect x={x + 30 * s} y={1060 - 560 * s} width={170 * s} height={260 * s} fill="#06070a" stroke="#2c2f38" strokeWidth={5 * s} />
    <rect x={x + 1040 * s - 200 * s} y={1060 - 560 * s} width={170 * s} height={260 * s} fill="#06070a" stroke="#2c2f38" strokeWidth={5 * s} /></g>; })}
  <line x1={0} y1={420} x2={1080} y2={420} stroke="#3a3c44" strokeWidth={10} opacity={.6 * k} />
  {[180, 420, 660, 900].map((x, i) => <path key={i} d={`M${x} 420 v40 a24 24 0 1 0 1 0`} stroke="#3a3c44" strokeWidth={6} fill="none" opacity={.6 * k} transform={`rotate(${noise('hh' + i, t, .6) * 6} ${x} 420)`} />)}
</g>;
// тёплый светящийся силуэт в лучах (видение): мягкий контур, без деталей — это обман
export const Vision: React.FC<{ t: number; x: number; y: number; s: number; L: any; C: any; k: number; seed: number; arms?: boolean }> = ({ t, x, y, s, L, C, k, seed, arms }) => <g opacity={k}>
  <ellipse cx={x} cy={y - 420 * s} rx={300 * s} ry={520 * s} fill={WARM} opacity={.35} filter="url(#blur30)" />
  <g filter="url(#blur4)"><Figure x={x} y={y} s={s} t={t} L={L} C={C} pose={arms ? { ...POSES.stand, armL: [-60, 40], armR: [60, -40] } : POSES.stand} expr="calm" seed={seed} rim={WARM} /></g>
  <ellipse cx={x} cy={y - 450 * s} rx={240 * s} ry={500 * s} fill={WARM} opacity={.3} filter="url(#blur30)" style={{ mixBlendMode: 'screen' }} />
</g>;

// a1: крупно глаз Кирилла — в зрачке отражается фонарь и силуэт; голос «отца»
export const A1: React.FC<SP> = ({ t }) => {
  const z = 1 + t * .05, dil = .6 + ease(t, .3, 2.5) * .4;
  return <Frame t={t} vign={1}>
    <rect width={1080} height={1920} fill="#0a0806" />
    <g transform={cam(z, 540, 820)}>
      <g transform="translate(540 1000) scale(15)"><Head t={t} L={KL} expr="scared" seed={3} noBlink lookY={-.3} /></g>
      {/* блик фонаря в зрачке (поверх головы, по месту правого глаза) */}
      {[-1, 1].map(sd => <g key={sd} transform={`translate(${540 + sd * 27 * 15} ${1000 + 7 * 15})`}>
        <circle r={60 * dil} fill={WARM} opacity={.75} filter="url(#glow)" /><rect x={-14} y={-50} width={28} height={70} rx={6} fill="#fff" opacity={.85} />
        <path d="M-10 70 Q0 30 10 70 L14 120 L-14 120Z" fill="#1a1410" opacity={.9} /></g>)}
    </g>
    <ellipse cx={540} cy={200} rx={700} ry={300} fill={WARM} opacity={.12 + .05 * noise('a1', t, 5)} filter="url(#blur30)" />
  </Frame>;
};
export const A2: React.FC<SP> = (p) => <Intro {...p} ep={2} name="ВЫХОД — ОДИН" />;

// b0: Кирилл в луче делает шаг к фонарю; вдали под фонарём — силуэт отца
export const B0: React.FC<SP> = ({ t }) => {
  const step = ease(t, .8, 2.6);
  return <Frame t={t} grade="#2a2418" gradeK={.12}>
    <g transform={cam(1.05 + t * .03, 540, 1100, 0, -160)}>
      <DarkCar t={t} />
      <Cone x={540} x0={540} y0={300} k={.9} w={420} />
      <Machinist x={540} y={1180} s={.55} t={t} k={1} />
      <Figure x={560} y={1980 - step * 60} s={1.25 - step * .08} t={t} L={KL} C={CS.porterY} pose={PK(t, [[0, 'stand'], [1.0, { armR: [30, -30], legR: [10, -20] }], [2.0, { armR: [50, -40], armL: [-20, 10] }]], false)} expr="sad" lookY={-.6} seed={3} rim={WARM} turn={.6} lid={.8} />
    </g>
  </Frame>;
};

// b1: Тимур — в луче тёплый силуэт женщины с раскрытыми руками; «Мама?..»
export const B1: React.FC<SP> = ({ t }) => {
  const c = caps('b1'), v = ease(t, .1, 1.0);
  return <Frame t={t} grade="#2a2418" gradeK={.1}>
    <g transform={cam(1.0 + t * .05, 540, 1000, 0, -200)}>
      <DarkCar t={t} />
      <Cone x={640} k={1} />
      <Vision t={t} x={720} y={1500} s={.85} L={LK.pE} C={CS.pE} k={v} seed={51} arms />
      <Figure x={330} y={1980} s={1.3} t={t} L={LK.timur} C={CS.timur} pose={PK(t, [[0, 'stand'], [1.2, { armR: [70, -20] }]], false)} expr="cry" tears={.8} lookX={.6} lookY={-.3} seed={41} mouth={talk(t, c, 'ТИМУР')} rim={WARM} turn={.5} />
    </g>
  </Frame>;
};

// b2: Михалыч — огонь в ладони гаснет, руки опускаются; в луче силуэт жены
export const B2: React.FC<SP> = ({ t }) => {
  const c = caps('b2'), fire = 1 - ease(t, .6, 2.0), drop = ease(t, 1.4, 2.6);
  return <Frame t={t} grade="#2a2418" gradeK={.1}>
    <g transform={cam(1.08, 540, 1000, 0, -180)}>
      <DarkCar t={t} />
      <Cone x={360} k={1} />
      <Vision t={t} x={300} y={1450} s={.8} L={LK.pB} C={CS.pB} k={ease(t, 0, .8)} seed={52} />
      <Figure x={700} y={1990} s={1.35} t={t} L={LK.mikh} C={CS.mikh} pose={PK(t, [[0, { armR: [60, -90], armL: [-20, 20] }], [1.4, { armR: [60, -90] }], [2.6, 'stand']], false)} expr="sad" lookX={-.7} lookY={-.2} seed={6} mouth={talk(t, c, 'МИХАЛЫЧ')} rim={WARM} turn={-.5} tears={.4} />
      {fire > 0 && <g transform={`translate(${880 - drop * 60} ${1250 + drop * 200})`} opacity={fire}>
        {Array.from({ length: 7 }).map((_, i) => <ellipse key={i} cx={Math.sin(t * 9 + i) * 10} cy={-20 - i * 12 * fire} rx={30 * fire - i * 3} ry={46 * fire} fill={i % 2 ? '#ffb040' : '#ff6a1a'} opacity={.8} filter="url(#glow)" />)}
        <circle r={24 * fire} fill="#fff4c0" filter="url(#glowBig)" /></g>}
      {fire < .3 && <g opacity={(.3 - fire) * 2}>{Array.from({ length: 5 }).map((_, i) => <circle key={i} cx={880 + Math.sin(t * 2 + i) * 30} cy={1200 - (t - 1.6) * 120 - i * 40} r={14 + i * 4} fill="#3a3a40" opacity={.4} filter="url(#blur4)" />)}</g>}
    </g>
  </Frame>;
};

// b3: Жора — в луче силуэт парня (брат); Жора расплывается в улыбке, тянет руки; голос: каждый видел потерянного
export const B3: React.FC<SP> = ({ t }) => {
  const c = caps('b3');
  return <Frame t={t} grade="#2a2418" gradeK={.1}>
    <g transform={cam(1.0 + t * .03, 540, 1000, 0, -170)}>
      <DarkCar t={t} />
      <Cone x={330} k={1.1} w={420} />
      <Vision t={t} x={300} y={1480} s={.85} L={LK.pD} C={CS.pD} k={ease(t, 0, .8)} seed={53} arms />
      <Figure x={720} y={2000} s={1.45} t={t} L={LK.zhora} C={CS.zhora} pose={PK(t, [[0, 'stand'], [1.0, { armL: [-60, 60], armR: [-30, 40], lean: -6 }], [2.6, { armL: [-80, 40], armR: [-50, 30], lean: -10 }]], false)} expr="smirk" tears={.5} lookX={-.8} lookY={-.2} turn={-.6} seed={7} mouth={talk(t, c, 'ЖОРА')} rim={WARM} />
    </g>
  </Frame>;
};

// b4: Тимур падает лицом вниз, за ним рейдовики — как домино; Кирилл кричит
export const B4: React.FC<SP> = ({ t }) => {
  const c = caps('b4'); const fall = (t0: number) => clamp((t - t0) / .45);
  const fx = (k: number) => k * k; const [sx, sy] = shakeXY(t, [[.75, 14, .3], [1.25, 10, .3], [1.6, 10, .3]]);
  return <Frame t={t} grade="#2a2418" gradeK={.12} impact={isImpact(t, .75, 2)}>
    <g transform={cam(1.0, 540, 1100, sx, sy - 120)}>
      <DarkCar t={t} />
      <Cone x={540} k={.9} w={520} />
      {[['r1', 1.2], ['r2', 1.55], ['timur', .3]].map(([w, t0]) => { const k = fx(fall(t0 as number)); const [x, y] = G[w as string];
        return <g key={w as string} transform={`rotate(${k * (w === 'r2' ? -80 : 82)} ${x} ${y})`}><H t={k > 0 ? t0 as number : t} w={w as string} pose={k > 0 ? POSES.fallen : POSES.stand} expr="calm" lid={k > 0 ? 0 : .5} noBlink rim={WARM} lookY={-.8} /></g>; })}
      <H t={t} w="kirill" pose={PK(t, [[0, 'stand'], [1.0, { armR: [80, -30], lean: 8 }]])} expr={t > 1.0 ? 'shout' : 'scared'} mouth={talk(t, c, 'КИРИЛЛ')} turn={-.5} lookX={-.8} sweat={1} />
    </g>
  </Frame>;
};

// b5: Михалыч оседает на колени, Жора валится; с каждым падением фонарь вспыхивает ярче
export const B5: React.FC<SP> = ({ t }) => {
  const kn = ease(t, .4, 1.4), zh = clamp((t - 1.4) / .5) ** 2, bright = .6 + ease(t, .5, .8) * .25 + ease(t, 1.6, 1.9) * .4;
  const [sx, sy] = shakeXY(t, [[1.9, 14, .35]]);
  return <Frame t={t} grade="#2a2418" gradeK={.08} impact={isImpact(t, 1.9, 2)} over={<g><Flash t={t} t0={.6} dur={.25} color={WARM} max={.35} /><Flash t={t} t0={1.9} dur={.3} color={WARM} max={.55} /></g>}>
    <g transform={cam(1.02 + t * .02, 540, 1050, sx, sy - 120)}>
      <DarkCar t={t} />
      <Machinist x={540} y={1150} s={.6} t={t} k={bright} />
      <Cone x={540} x0={540} y0={500} k={bright * 1.2} w={560} />
      <H t={t} w="mikh" pose={{ ...POSES.stand, crouch: kn * 160, lean: -kn * 10, armL: [-20, 10], armR: [20, -10] }} expr="calm" lid={.4 - kn * .4} noBlink rim={WARM} lookY={-.8} />
      <g transform={`rotate(${zh * 85} ${G.zhora[0]} ${G.zhora[1]})`}><H t={zh > 0 ? 1.4 : t} w="zhora" pose={zh > 0 ? POSES.fallen : POSES.bothUp} expr="smirk" lid={zh > 0 ? 0 : .6} noBlink rim={WARM} /></g>
    </g>
  </Frame>;
};

// b6: отец под фонарём крупно, ласково зовёт
export const B6: React.FC<SP> = ({ t }) => {
  const c = caps('b6');
  const face = <g transform="translate(0 20) scale(1.25)"><Head t={t} L={LK.father} expr="sad" seed={12} lookY={.3} noBlink mouth={talk(t, c, 'ОТЕЦ') * .4} /></g>;
  return <Frame t={t} grade="#1a1a2a" gradeK={.1}>
    <g transform={cam(1.25 + t * .05, 540, 900, 0, -60)}>
      <rect width={1080} height={1920} fill="#0a0b10" />
      <ellipse cx={540} cy={500} rx={600} ry={500} fill={WARM} opacity={.18} filter="url(#blur30)" />
      <Machinist x={540} y={2350} s={2.3} t={t} k={1} lift={1} face={face} />
      <Motes t={t} x={540} y={900} w={900} h={900} n={24} color={WARM} speed={30} k={.6} />
    </g>
  </Frame>;
};
