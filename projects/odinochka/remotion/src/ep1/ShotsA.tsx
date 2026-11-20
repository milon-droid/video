// A. Хук-флешфорвард: крыша высотки → армия теней → «Восстань» → «ГОД НАЗАД»
import React from 'react';
import { clamp, ease, noise, spr } from '../anim';
import { cam, Flash, Fog, h1, Lids, Motes, Smoke, SpeedLines, shakeXY } from '../kit/fx';
import { Title } from '../kit/ui';
import { Basil, KremlinTower, KremlinWall, MoscowCity, Ostankino, Panelka, Sky, starD, Vysotka } from '../bg/moscow';
import { Figure, POSES, blend } from '../chars/body';
import { Head } from '../chars/head';
import { ShadowSoldier } from '../chars/monsters';
import { CS, LK } from '../chars/cast';
import { Frame, SP } from './common';

// ночная панорама Москвы далеко внизу (река, Кремль, Сити, высотки)
const NightPanorama: React.FC<{ t: number; y?: number }> = ({ t, y = 0 }) => (
  <g transform={`translate(0 ${y})`}>
    <Sky top="#03050f" bot="#1e1a46" stars t={t} id="pano" />
    <MoscowCity x={820} y={1350} s={.42} t={t} />
    <Ostankino x={80} y={1360} s={.4} t={t} />
    <Vysotka x={260} y={1400} s={.32} seed={7} />
    <Vysotka x={620} y={1420} s={.26} seed={12} />
    <Fog t={t} y={1380} k={.4} color="#3a3a8a" />
    <Panelka x={-20} y={1560} w={260} floors={6} s={.6} seed={2} /><Panelka x={880} y={1560} w={260} floors={6} s={.6} seed={6} />
    {/* река с отражениями */}
    <rect y={1560} width={1080} height={200} fill="#0a0c22" />
    {Array.from({ length: 24 }).map((_, i) => <rect key={i} x={h1(i) * 1080} y={1575 + h1(i * 3) * 160} width={30 + h1(i * 5) * 80} height={3} fill={i % 3 ? '#ffcf7a' : '#ff3a4a'} opacity={.25 + .3 * Math.sin(t * 3 + i)} />)}
    <KremlinWall x={0} y={1760} w={1080} />
    <KremlinTower x={720} y={1800} s={.5} />
    <Basil x={300} y={1860} s={.55} />
    <rect y={1840} width={1080} height={200} fill="#0a0610" />
  </g>
);

export const S01: React.FC<SP> = ({ t }) => {
  const z = 1 + t * .035, coatPose = blend(POSES.stand, { ...POSES.stand, armL: [-14, 4], armR: [14, -4] }, 1);
  return <Frame t={t} grade="#3040a0" gradeK={.15}>
    <g transform={cam(z, 540, 1000, 0, -t * 10)}>
      <NightPanorama t={t} y={-330} />
      {/* шпиль высотки рядом */}
      <g transform="translate(160 0)"><path d="M-30 1500 L-12 300 L12 300 L30 1500Z" fill="#141a30" /><path d="M-6 300 L0 120 L6 300Z" fill="#a08a4a" />
        <g transform="translate(0 100)"><circle r={60} fill="#ff2030" opacity={.4} filter="url(#blur12)" /><path d={starD(40)} fill="#ff2a3a" stroke="#ffd36a" strokeWidth={4} /></g></g>
      {/* парапет крыши */}
      <rect x={-40} y={1560} width={1160} height={600} fill="#0c101a" /><rect x={-40} y={1560} width={1160} height={26} fill="#252c42" />
      {[0, 1, 2, 3, 4, 5].map(i => <rect key={i} x={i * 210 - 20} y={1510} width={60} height={60} fill="#121624" />)}
      <Motes t={t} x={540} y={1400} w={1000} h={1300} n={30} color="#6fd0ff" k={.8} speed={60} size={4} />
      <Figure x={700} y={1570} s={1.3} t={t} L={LK.kirill4} C={CS.shadow} pose={coatPose} expr="determined" glow={1} seed={3} turn={-.15} rim="#5fd2ff" />
      <ellipse cx={700} cy={800} rx={420} ry={700} fill="#4ab8ff" opacity={.08} filter="url(#blur30)" />
    </g>
  </Frame>;
};

export const S02: React.FC<SP> = ({ t }) => {
  const rows = [{ y: 1180, s: .32, n: 9 }, { y: 1330, s: .45, n: 7 }, { y: 1530, s: .66, n: 5 }, { y: 1820, s: .95, n: 4 }];
  const [sx, sy] = shakeXY(t, [[.4, 4, 3]]);
  return <Frame t={t} grade="#203070" gradeK={.2}>
    <g transform={cam(1.04 + t * .02, 540, 1100, sx, sy)}>
      <Sky top="#03050f" bot="#2a2050" stars t={t} id="s02" />
      {/* высотка далеко вверху — на шпиле крошечный силуэт */}
      <Vysotka x={540} y={1150} s={.75} seed={4} />
      <circle cx={540} cy={1150 - 1270 * .75 + 40} r={30} fill="#5fd2ff" opacity={.5 + .3 * Math.sin(t * 6)} filter="url(#blur12)" />
      <KremlinWall x={0} y={1120} w={1080} h={80} />
      <KremlinTower x={930} y={1170} s={.55} />
      <rect y={1170} width={1080} height={800} fill="#14101a" />
      {/* брусчатка */}
      {Array.from({ length: 14 }).map((_, i) => { const q = Math.pow(i / 14, 1.6); return <line key={i} x1={0} x2={1080} y1={1180 + q * 760} y2={1180 + q * 760} stroke="#0a080e" strokeWidth={2 + q * 4} />; })}
      {rows.map((r, ri) => Array.from({ length: r.n }).map((_, i) => { const x = (i + .5) / r.n * 1080 + (h1(ri * 9 + i) - .5) * 60, t0 = .2 + h1(ri * 5 + i * 3) * 1.6, rise = ease(t, t0, t0 + .9);
        return <g key={ri + '-' + i}>
          <Smoke t={t} t0={t0 - .2} x={x} y={r.y} n={6} r={110 * r.s * 2} spread={140 * r.s * 2} color="#05060c" life={2} rise={200 * r.s} k={.9} seed={ri * 20 + i} />
          <ShadowSoldier x={x} y={r.y} s={r.s} t={t} rise={rise} seed={ri * 20 + i} kind={(ri + i) % 4 === 0 ? 1 : 0} />
        </g>; }))}
      <Motes t={t} x={540} y={1900} w={1100} h={900} n={50} color="#5fc8ff" speed={160} />
    </g>
  </Frame>;
};

export const S03: React.FC<SP> = ({ t }) => {
  const roar = t > 1.15, z = 1 + t * .06 + (roar ? .08 * spr(t, 1.15) : 0); const [sx, sy] = shakeXY(t, [[1.15, 14, 1]]);
  const mouth = t > .5 && t < 1.1 ? .15 + .25 * Math.abs(Math.sin(t * 14)) : 0;
  return <Frame t={t} grade="#1a2a6a" gradeK={.2} over={<g>{roar && <SpeedLines t={t} cx={540} cy={820} n={80} inner={420} color="#bfeaff" k={.6} />}<Flash t={t} t0={1.15} color="#7fd8ff" max={.7} /></g>}>
    <rect width={1080} height={1920} fill="#05070f" />
    <ellipse cx={540} cy={900} rx={700} ry={900} fill="#1a3a8a" opacity={.5} filter="url(#blur30)" />
    <g transform={cam(z, 540, 860, sx, sy)}>
      <g transform="translate(540 660) scale(7.5)"><Head t={t} L={LK.kirill4} expr="determined" glow={1} mouth={mouth} seed={3} noBlink /></g>
    </g>
    <Motes t={t} x={540} y={1800} w={1100} h={1700} n={40} color="#7fe0ff" speed={200} size={6} />
  </Frame>;
};

export const S04: React.FC<SP> = ({ t }) => (
  <Frame t={t} vign={1}>
    <rect width={1080} height={1920} fill="#000" />
    <Title t={t} t0={.35} text="ГОД НАЗАД" size={110} color="#e8f0ff" />
    <Lids k={1 - ease(t, 0, .2)} />
  </Frame>
);
