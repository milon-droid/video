// C–E (v2). «Последний поезд»: мёртвая станция → Тимур → вагон с пассажирами → двери → отцепка → «бегом» → «шагом» → Машинист → титр
import React from 'react';
import { clamp, ease, noise, spr } from '../anim';
import { cam, Flash, Fog, h1, isImpact, Motes, Smoke, SpeedLines, shakeXY } from '../kit/fx';
import { Title } from '../kit/ui';
import { DeadPlatform, TrainInterior } from '../bg/places';
import { Figure, PK, POSES, walkPose } from '../chars/body';
import { Head } from '../chars/head';
import { Machinist, Passenger } from '../chars/monsters';
import { CS, LK } from '../chars/cast';
import { Frame, SP, talk } from './common';
import { SHOTS } from './timeline';
export { S14 } from './ShotsC';
const caps = (id: string) => SHOTS.find(s => s.id === id)?.caps;
const K = { L: LK.kWeakHurt, C: CS.porterY };

// пассажиры по обе стороны вагона (перспектива). look(i) — поворот головы, rise(i) — тянутся
const Rows: React.FC<{ t: number; look?: (i: number, side: number) => number; rise?: (i: number) => number; vp?: number }> = ({ t, look = () => 0, rise = () => 0, vp = 820 }) => {
  const out: React.ReactNode[] = [];
  for (let i = 5; i >= 0; i--) { const k = Math.pow(.78, i), y = vp + 640 * k;
    for (const sd of [-1, 1]) { const x = 540 + sd * (430 * k + 20); const j = i * 2 + (sd > 0 ? 1 : 0);
      out.push(<Passenger key={j} x={x} y={y} s={k * 1.25} t={t} look={look(j, sd)} rise={rise(j)} seed={j} coat={['#3a3a44', '#2e3440', '#443a3a', '#363a30'][j % 4]} />); } }
  return <g>{out}</g>;
};

export const S15: React.FC<SP> = ({ t }) => {
  const c = caps('s15'); const tr = ease(t, .4, 2.6), [sx, sy] = shakeXY(t, [[.6, 6, 2.2]]);
  return <Frame t={t} grade="#1a2a4a" gradeK={.2} over={<Flash t={t} t0={1.9} dur={.5} color="#fff4d0" max={.35} />}>
    <g transform={cam(1.05, 540, 1000, sx, sy - 60)}>
      <DeadPlatform t={t} train={tr} />
      <Fog t={t} y={1300} k={.35} color="#6a7a9a" />
      {['r1', 'zhora', 'timur'].map((k, i) => <Figure key={k} x={180 + i * 150} y={1560} s={.6} t={t} L={LK[k]} C={CS[k]} pose={POSES.stand} seed={40 + i} turn={.6} lookX={.8} rim="#fff4d0" />)}
      <Figure x={860} y={2100} s={1.5} t={t} L={LK.mikh} C={CS.mikh} pose={{ ...POSES.stand, armR: [30, -60], fistR: true }} expr="angry" seed={6} turn={-.5} lookX={-.8} mouth={talk(t, c, 'МИХАЛЫЧ')} rim="#fff4d0" />
    </g>
  </Frame>;
};

export const S16: React.FC<SP> = ({ t }) => {
  const c = caps('s16'); const tr = noise('tr', t, 9) * 4;
  return <Frame t={t} grade="#1a2a4a" gradeK={.2}>
    <g transform={cam(1.15 + t * .03, 540, 1000, 0, -40)}>
      <DeadPlatform t={t} train={1} />
      <rect width={1080} height={1920} fill="#05060c" opacity={.35} />
      <Figure x={370 + tr} y={1700} s={1.15} t={t} L={LK.timur} C={CS.timur} pose={{ ...POSES.stand, armL: [-20, 100], armR: [20, -100], crouch: 20 }} expr="scared" seed={41} turn={.4} lookX={.5} mouth={talk(t, c, 'ТИМУР')} sweat={1} />
      <Figure x={760} y={1720} s={1.2} t={t} L={K.L} C={K.C} pose={t > 1.6 ? PK(t - 1.6, [[0, 'stand'], [.4, { armL: [-82, 18] }]]) : POSES.stand} expr={t > 2 ? 'determined' : 'sad'} seed={3} turn={-.45} lookX={-.7} mouth={talk(t, c, 'КИРИЛЛ')} />
    </g>
  </Frame>;
};

export const S17: React.FC<SP> = ({ t }) => (
  <Frame t={t} grade="#2a2a3a" gradeK={.18}>
    <g transform={cam(1.0 + t * .04, 540, 900)}>
      <TrainInterior t={t} flicker={.4} />
      <Rows t={t} />
      {['mikh', 'r1', 'r2'].map((k, i) => <Figure key={k} x={300 + i * 240} y={1980 + (i % 2) * 40} s={.95} t={t} L={LK[k]} C={CS[k]} pose={walkPose(t * 60 + i * 50)} seed={50 + i} turn={i - 1} lookX={i - 1} expr="calm" />)}
    </g>
  </Frame>
);

export const S18: React.FC<SP> = ({ t }) => {
  const c = caps('s18'); const cl = ease(t, .1, .55), [sx, sy] = shakeXY(t, [[.55, 18, .5]]);
  return <Frame t={t} impact={isImpact(t, .55, 2)} grade="#2a2a3a" gradeK={.18}>
    <g transform={cam(1.0, 540, 960, sx, sy)}>
      <TrainInterior t={t} flicker={.3} shake={t > .7 ? 3 : 0} />
      <Rows t={t} />
      <Figure x={540} y={2050} s={1.4} t={t} L={LK.zhora} C={CS.zhora} pose={{ ...POSES.stand, armL: [-40, 120], armR: [40, -120] }} expr="smirk" seed={7} mouth={talk(t, c, 'ЖОРА')} />
      <rect x={-600 + cl * 600} y={0} width={560} height={1920} fill="#8a909a" stroke="#2a2e38" strokeWidth={10} /><rect x={-560 + cl * 600} y={300} width={300} height={500} fill="#05060a" />
      <rect x={1120 - cl * 600} y={0} width={560} height={1920} fill="#7a808a" stroke="#2a2e38" strokeWidth={10} /><rect x={1340 - cl * 600} y={300} width={300} height={500} fill="#05060a" />
      {cl >= 1 && <rect x={0} y={0} width={1080} height={1920} fill="#000" opacity={0} />}
    </g>
  </Frame>;
};

// 19: вид в торцевое окно — последний вагон с лязгом отцепляется и проваливается в пустоту
export const S19: React.FC<SP> = ({ t }) => {
  const br = .8, fall = ease(t, br, br + 2.2), [sx, sy] = shakeXY(t, [[br, 26, .7]]);
  return <Frame t={t} impact={isImpact(t, br, 2)} grade="#2a2a3a" gradeK={.15} over={<Flash t={t} t0={br} color="#ffd890" max={.4} />}>
    <g transform={cam(1.0, 540, 960, sx, sy)}>
      <rect width={1080} height={1920} fill="#1c1e24" />
      <defs><clipPath id="rw"><rect x={240} y={420} width={600} height={700} rx={30} /></clipPath></defs>
      <g clipPath="url(#rw)"><rect x={240} y={420} width={600} height={700} fill="#020306" />
        <g transform={`translate(540 ${820 + fall * 900}) rotate(${fall * 25}) scale(${1 - fall * .6})`}>
          <rect x={-260} y={-300} width={520} height={600} rx={30} fill="#2a4a6a" stroke="#0a0c14" strokeWidth={8} />
          <rect x={-180} y={-220} width={360} height={260} fill="#fff4d0" opacity={.5 * (1 - fall)} />
          {[-100, 0, 100].map((x, i) => <rect key={i} x={x - 30} y={-200} width={60} height={220} fill="#0a0e14" opacity={.6} />)}
        </g>
        <Motes t={t - br} x={540} y={1150} w={500} h={600} n={t > br ? 40 : 0} color="#ffcf6a" speed={500} size={4} />
      </g>
      <rect x={240} y={420} width={600} height={700} rx={30} fill="none" stroke="#4a4e58" strokeWidth={24} />
      <rect x={180} y={300} width={720} height={1500} fill="none" stroke="#3a3e48" strokeWidth={30} />
      <text x={540} y={1300} textAnchor="middle" fontFamily="Mont" fontWeight={800} fontSize={40} fill="#c8ccd4" opacity={.7}>НЕ ПРИСЛОНЯТЬСЯ</text>
    </g>
  </Frame>;
};

export const S20: React.FC<SP> = ({ t }) => (
  <Frame t={t} grade="#3a1a20" gradeK={.15}>
    <g transform={cam(1.05 + t * .02, 540, 950)}>
      <TrainInterior t={t} flicker={.7} shake={2} red={.6} />
      <Rows t={t} />
      <CarBoard t={t} n={7} y={420} />
      {['timur', 'zhora', 'mikh'].map((k, i) => <Figure key={k} x={260 + i * 280} y={1960} s={1.05} t={t} L={LK[k]} C={CS[k]} pose={POSES.stand} seed={60 + i} lookY={-.9} expr={k === 'zhora' ? 'angry' : 'scared'} turn={(i - 1) * .3} />)}
    </g>
  </Frame>
);

export const S21: React.FC<SP> = ({ t }) => {
  const c = caps('s21'); const z = ease(t, .4, 2.6);
  return <Frame t={t} grade="#3a1a20" gradeK={.15}>
    <g transform={cam(1.0, 540, 960, noise('h21', t, 3) * 12, 0)}>
      <TrainInterior t={t} flicker={.6} shake={4} red={.5} />
      <Rows t={t} />
      <Figure x={540} y={1500 + z * 600} s={.8 + z * .9} t={t} L={LK.zhora} C={CS.zhora} pose={t < .4 ? { ...POSES.raiseR, armR: [150, -10] } : walkPose(t * 700, true)} expr="shout" seed={7} mouth={talk(t, c, 'ЖОРА')} />
      <Figure x={380} y={1460 + z * 300} s={.7 + z * .4} t={t} L={LK.r1} C={CS.r1} pose={walkPose(t * 650 + 90, true)} expr="scared" seed={21} />
    </g>
  </Frame>;
};

export const S22: React.FC<SP> = ({ t }) => {
  const snap = .3, grab = 1.4, gone = t > grab + .25, [sx, sy] = shakeXY(t, [[grab, 24, .6]]);
  const lk = (j: number, sd: number) => -sd * ease(t, snap, snap + .12) * .9;
  return <Frame t={t} impact={isImpact(t, grab, 3)} grade="#3a1a20" gradeK={.18}>
    <g transform={cam(1.05, 540, 960, sx, sy)}>
      <TrainInterior t={t} flicker={.6} shake={3} red={.7} />
      <Rows t={t} look={lk} rise={(j) => j === 1 || j === 3 ? ease(t, grab - .3, grab) : 0} />
      {!gone && <Figure x={600 + ease(t, grab, grab + .25) * 300} y={1700} s={1.0} t={t} L={LK.r1} C={CS.r1} pose={t < grab ? walkPose(t * 650, true) : POSES.hit} expr="scared" seed={21} rot={t > grab ? 30 * ease(t, grab, grab + .25) : 0} />}
      {gone && <Smoke t={t} t0={grab + .2} x={820} y={1500} n={8} r={90} spread={120} color="#1a1a20" life={1.4} rise={40} k={.8} seed={22} />}
    </g>
  </Frame>;
};

export const S23: React.FC<SP> = ({ t }) => {
  const c = caps('s23');
  return <Frame t={t} grade="#3a1a20" gradeK={.15}>
    <g transform={cam(1.2 + t * .04, 540, 900)}>
      <TrainInterior t={t} flicker={.5} shake={2} red={.5} />
      <Figure x={540} y={2150} s={1.8} t={t} L={K.L} C={K.C} pose={PK(t, [[0, 'stand'], [.4, { armL: [-150, 20], armR: [60, -30] }]])} expr="scared" seed={3} mouth={talk(t, c, 'КИРИЛЛ')} sweat={1} rim="#ff4a5a" />
    </g>
  </Frame>;
};

// 24: идут шагом, головы пассажиров следят; сзади отрывается вагон у самой пятки
export const S24: React.FC<SP> = ({ t }) => {
  const br = 3.0, [sx, sy] = shakeXY(t, [[br, 22, .7]]);
  const lk = (j: number, sd: number) => -sd * (.4 + .5 * Math.sin(t * .8 + j * .3));
  return <Frame t={t} impact={isImpact(t, br, 2)} grade="#2a1a24" gradeK={.15} over={<Flash t={t} t0={br} color="#ffd890" max={.3} />}>
    <g transform={cam(1.0, 540, 960, sx, sy)}>
      <TrainInterior t={t} flicker={.4} shake={2} red={.3} />
      {t > br && <g><rect x={450} y={700} width={180} height={260} fill="#000" /><Motes t={t - br} x={540} y={960} w={200} h={300} n={30} color="#ffcf6a" speed={400} size={4} /></g>}
      <Rows t={t} look={lk} />
      <Figure x={420} y={1880} s={1.15} t={t} L={LK.timur} C={CS.timur} pose={walkPose(t * 70)} expr="scared" seed={41} turn={.5} lookX={.8} />
      <Figure x={660} y={1900} s={1.2} t={t} L={K.L} C={K.C} pose={{ ...walkPose(t * 70 + 95), armL: [-62, 22] }} expr="determined" seed={3} turn={-.3} lookX={-.4} sweat={1} />
    </g>
  </Frame>;
};

// 25: головной вагон — дверь кабины открывается: Машинист с фонарём вместо головы
export const S25: React.FC<SP> = ({ t }) => {
  const o = ease(t, .8, 1.8);
  return <Frame t={t} grade="#2a2418" gradeK={.12} over={<Flash t={t} t0={1.0} dur={.8} color="#fff4d0" max={.25} />}>
    <g transform={cam(1.0 + t * .05, 540, 900)}>
      <rect width={1080} height={1920} fill="#14161c" />
      <rect x={200} y={260} width={680} height={1400} fill="#05060a" />
      <g opacity={o}><Machinist x={540} y={1660} s={1.55} t={t} k={o} /></g>
      <rect x={200 - o * 300} y={260} width={340} height={1400} fill="#5a606a" stroke="#1a1c22" strokeWidth={10} />
      <rect x={540 + o * 300} y={260} width={340} height={1400} fill="#4e545e" stroke="#1a1c22" strokeWidth={10} />
      <text x={540 + o * 300 + 170} y={500} textAnchor="middle" fontFamily="Mont" fontWeight={800} fontSize={34} fill="#c81e2a">КАБИНА</text>
      <rect x={0} y={0} width={200} height={1920} fill="#1c1e24" /><rect x={880} y={0} width={200} height={1920} fill="#1c1e24" />
      {['mikh', 'zhora', 'timur', 'kWeak'].map((k, i) => <Figure key={k} x={180 + i * 240} y={2150} s={1.0} t={t} L={k === 'kWeak' ? K.L : LK[k]} C={k === 'kWeak' ? K.C : CS[k]} pose={POSES.stand} seed={70 + i} rim="#fff0c0" opacity={.96} />)}
    </g>
  </Frame>;
};

export const S26: React.FC<SP> = ({ t }) => {
  const c = caps('s26'); const pulse = talk(t, c, 'ДИКТОР') > 0 ? .75 + .25 * Math.abs(Math.sin(t * 17)) : 1;
  return <Frame t={t} grade="#2a2418" gradeK={.1}>
    <g transform={cam(1.25 + t * .05, 540, 700, 0, 60)}>
      <rect width={1080} height={1920} fill="#0a0b10" />
      <Machinist x={540} y={2300} s={2.6} t={t} k={pulse} turn={-ease(t, .2, 1) * .5} />
    </g>
  </Frame>;
};

export const S27: React.FC<SP> = ({ t }) => (
  <Frame t={t} grade="#2a2418" gradeK={.12}>
    <g transform={cam(1.05 + ease(t, .8, 3.2) * .35, 300, 900)}>
      <TrainInterior t={t} flicker={.2} />
      <rect width={1080} height={1920} fill="#05060a" opacity={.4} />
      <Figure x={300} y={1900} s={1.3} t={t} L={LK.zhora} C={CS.zhora} pose={POSES.stand} expr="angry" seed={7} turn={ease(t, .8, 1.3) * .6} lookX={ease(t, .8, 1.3)} rim="#fff0c0" />
      <Figure x={760} y={1940} s={1.2} t={t} L={LK.mikh} C={CS.mikh} pose={POSES.stand} expr="sad" seed={6} turn={-.3} lookY={.3} rim="#fff0c0" />
    </g>
  </Frame>
);

// табло вагонов: n — сколько вагонов осталось (горящих), мигает последний
const CarBoard: React.FC<{ t: number; n: number; total?: number; y?: number }> = ({ t, n, total = 8, y = 330 }) => (
  <g transform={`translate(540 ${y})`}>
    <rect x={-330} y={-60} width={660} height={120} rx={14} fill="#0a0c12" stroke="#4a4e58" strokeWidth={5} />
    {Array.from({ length: total }).map((_, i) => { const on = i < n, last = i === n - 1; return <rect key={i} x={-300 + i * 76} y={-30} width={62} height={60} rx={8}
      fill={on ? (last ? '#ff3a3a' : '#ffcf5a') : '#22252c'} opacity={on && last ? (Math.floor(t * 4) % 2 ? 1 : .3) : 1} />; })}
  </g>
);
export { CarBoard };

// 22b: наклейка на двери «ПО ВАГОНУ НЕ БЕГАТЬ» — Кирилл замечает правило
export const S22b: React.FC<SP> = ({ t }) => {
  const z = 1 + ease(t, .2, 2.4) * .5;
  return <Frame t={t} grade="#3a1a20" gradeK={.12}>
    <g transform={cam(z, 540, 760)}>
      <rect width={1080} height={1920} fill="#7a808a" />
      <rect x={160} y={200} width={760} height={1100} fill="#0a0c12" stroke="#4a4e58" strokeWidth={14} />
      <g transform={`translate(${noise('rf', t, .5) * 10 + 600} 820) scale(2.4)`} opacity={.35}><Head t={t} L={LK.kWeakHurt} expr="scared" seed={3} turn={-.3} lookX={-.5} /></g>
      {/* наклейка: бегущий человечек в красном перечёркнутом круге */}
      <g transform="translate(400 700)"><rect x={-150} y={-190} width={300} height={400} rx={18} fill="#f4f2ec" stroke="#c81e2a" strokeWidth={6} />
        <circle cx={0} cy={-50} r={110} fill="none" stroke="#c81e2a" strokeWidth={20} />
        <g fill="#111"><circle cx={10} cy={-115} r={16} /><path d="M0 -95 L-20 -40 L10 -10 L-10 30 M-20 -40 L-50 -60 M0 -80 L40 -60 M10 -10 L50 10" stroke="#111" strokeWidth={14} strokeLinecap="round" fill="none" /></g>
        <path d="M-78 28 L78 -128" stroke="#c81e2a" strokeWidth={20} />
        <text x={0} y={110} textAnchor="middle" fontFamily="Mont" fontWeight={900} fontSize={34} fill="#111">ПО ВАГОНУ</text>
        <text x={0} y={155} textAnchor="middle" fontFamily="Mont" fontWeight={900} fontSize={34} fill="#c81e2a">НЕ БЕГАТЬ</text></g>
      <text x={540} y={1240} textAnchor="middle" fontFamily="Mont" fontWeight={800} fontSize={40} fill="#c8ccd4" opacity={.7}>НЕ ПРИСЛОНЯТЬСЯ</text>
    </g>
  </Frame>;
};

// 28: Машинист поднимает фонарь — свет падает на Кирилла, остальные отступают
export const S28: React.FC<SP> = ({ t }) => {
  const beam = ease(t, .4, 1.4);
  return <Frame t={t} grade="#2a2418" gradeK={.12}>
    <g transform={cam(1.0 + t * .03, 540, 1000)}>
      <rect width={1080} height={1920} fill="#0c0d12" />
      <polygon points={`540,-50 ${380 - beam * 120},1960 ${700 + beam * 120},1960`} fill="#fff0c0" opacity={.22 * beam} filter="url(#blur12)" />
      {['mikh', 'zhora', 'timur'].map((k, i) => <Figure key={k} x={[170, 920, 330][i] + (i === 1 ? 1 : -1) * beam * 60} y={1880} s={1.0} t={t} L={LK[k]} C={CS[k]} pose={POSES.stand} seed={80 + i} expr="scared" turn={i === 1 ? -.5 : .5} lookX={i === 1 ? -.7 : .7} opacity={.85} />)}
      <Figure x={560} y={1960} s={1.3} t={t} L={K.L} C={K.C} pose={PK(t, [[0, 'stand'], [1.0, { armL: [-30, 120], armR: [30, -120] }]])} expr="scared" seed={3} lookY={-.7} rim="#fff0c0" sweat={1} />
      <ellipse cx={560} cy={900} rx={260 * beam} ry={500 * beam} fill="#fff0c0" opacity={.15} filter="url(#blur30)" />
    </g>
  </Frame>;
};

// 29: фонарь гаснет — под ним лицо пропавшего отца
export const S29: React.FC<SP> = ({ t }) => {
  const c = caps('s29'); const rv = ease(t, .3, 1.1);
  const face = <g transform="translate(0 20) scale(1.25)"><Head t={t} L={LK.father} expr="sad" seed={12} lookY={.3} mouth={talk(t, c, '???') * .35} /></g>;
  return <Frame t={t} grade="#1a1a2a" gradeK={.12} over={<Flash t={t} t0={.3} dur={.6} color="#fff6d8" max={.5} />}>
    <g transform={cam(1.25 + t * .06, 540, 760, 0, -160)}>
      <rect width={1080} height={1920} fill="#0a0b10" />
      <Machinist x={540} y={2300} s={2.6} t={t} k={1 - rv} reveal={rv} face={face} />
    </g>
  </Frame>;
};

// 30: крупно Кирилл: «Папа?..» → название
export const S30: React.FC<SP> = ({ t, d }) => {
  const c = caps('s30'); const cut = d - 1.6;
  if (t < cut) return <Frame t={t} grade="#1a1a2a" gradeK={.12}>
    <rect width={1080} height={1920} fill="#0c0a0e" /><ellipse cx={540} cy={640} rx={560} ry={560} fill="#fff0c0" opacity={.1} filter="url(#blur30)" />
    <g transform={cam(1 + t * .05, 540, 700)}><g transform="translate(540 600) scale(6.2)"><Head t={t} L={K.L} expr="scared" seed={3} lookY={-.4} mouth={talk(t, c, 'КИРИЛЛ')} tears={ease(t, 1.2, 2.4) * .8} /></g></g>
  </Frame>;
  return <Frame t={t} vign={1}>
    <rect width={1080} height={1920} fill="#000" />
    <Title t={t} t0={cut + .1} text="ОДИНОЧКА" size={130} color="#e8f4ff" />
    <Title t={t} t0={cut + .5} text="" sub="СЕРИЯ 2 — СКОРО" y={1010} size={10} />
  </Frame>;
};
