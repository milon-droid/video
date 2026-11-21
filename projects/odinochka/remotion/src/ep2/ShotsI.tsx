// Серия 2 v5: страшнее хук; плашки имён не на лицах; скример в фонаре при подходе; Депо со смыслом (снаряжение прошлых рейдов, папин жетон,
// «сюда попадали сошедшие с поезда»); Михалыча бьют по ноге — он не добежит; щупальца забирают тела → Лёху → Кирилла (ранение) → фонарь сам ползёт к щупальцу;
// вагон из Врат — огромный; больница: среда.
import React from 'react';
import { clamp, ease, noise, spr } from '../anim';
import { cam, Flash, h1, isImpact, Lids, shakeXY, SpeedLines } from '../kit/fx';
import { Figure, PK, POSES } from '../chars/body';
import { Head, INK } from '../chars/head';
import { Machinist } from '../chars/monsters';
import { LK, CS } from '../chars/cast';
import { Gate } from '../bg/moscow';
import { MetroStation, TrainInterior } from '../bg/places';
import { Frame, SP } from '../ep1/common';
import { KL } from '../ep1/ShotsF';
import { G, H, NAMES } from './team';
import { caps, talk } from './timeline';
import { Cone, DarkCar, WARM } from './ShotsA';
import { Pool, Spray, Splat } from './ShotsC';
import { Walker } from './ShotsD';
import { DepotBg, inHand, LanternHead, Tag, Tentacle } from './ShotsE';
import { BigCar } from './ShotsG';

const KC = CS.porterY;
const TEAM6 = ['r1', 'zhora', 'r2', 'timur', 'kirill', 'mikh'];

// a0 (v5): Жора-силуэт против света; свет рвёт его — много крови, кровь стекает по «камере», в темноте — лица-тени кричат
export const A0: React.FC<SP> = ({ t }) => {
  const hit = 1.25, jerk = t > .4 && t < hit ? Math.sin(t * 70) * 10 * ease(t, .4, hit) : 0, [sx, sy] = shakeXY(t, [[hit, 34, .8]]);
  const faces = ease(t, hit + .2, hit + .8);
  return <Frame t={t} vign={1} impact={isImpact(t, hit, 4)} over={<g><Flash t={t} t0={hit} dur={.35} color="#fff" max={1} /><Splat t={t} t0={hit} seed={4} n={14} /><Splat t={t} t0={hit + .25} seed={9} n={8} />
    {t > hit + .3 && <rect width={1080} height={1920} fill="#5a0008" opacity={.25 + .1 * Math.sin(t * 9)} style={{ mixBlendMode: 'multiply' }} />}</g>}>
    <rect width={1080} height={1920} fill="#0a0806" />
    <g transform={cam(1.05 + t * .07, 540, 900, sx, sy)}>
      <circle cx={540} cy={760} r={260 + ease(t, .4, hit) * 300} fill={WARM} opacity={t < hit + .1 ? .9 : .35} filter="url(#blur30)" /><circle cx={540} cy={760} r={120} fill={t < hit + .1 ? '#fffbe8' : '#ff8a6a'} />
      {/* кричащие тени-лица в темноте вокруг (жертвы фонаря) */}
      {faces > 0 && Array.from({ length: 8 }).map((_, i) => { const a = i / 8 * Math.PI * 2, r = 470 + Math.sin(t * 3 + i) * 20, x = 540 + Math.cos(a) * r, y = 900 + Math.sin(a) * r * 1.2;
        return <g key={i} transform={`translate(${x} ${y}) scale(${(.8 + h1(i) * .5) * faces})`} opacity={.55 * faces}><ellipse rx={60} ry={80} fill="#1a0a0a" /><ellipse cx={-20} cy={-14} rx={12} ry={16} fill="#000" /><ellipse cx={20} cy={-14} rx={12} ry={16} fill="#000" />
          <ellipse cy={34} rx={18} ry={30 + Math.sin(t * 12 + i) * 6} fill="#000" /></g>; })}
      <defs><filter id="silh5"><feColorMatrix type="matrix" values="0 0 0 0 .04  0 0 0 0 .03  0 0 0 0 .02  0 0 0 1 0" /></filter></defs>
      {t < hit + .05 && <g filter="url(#silh5)" transform={`translate(${jerk} ${-ease(t, .4, hit) * 80})`}><Figure x={540} y={1700} s={1.3} t={t} L={LK.zhora} C={CS.zhora} pose={{ ...POSES.bothUp, armL: [-120, 30], armR: [120, -30] }} expr="shout" seed={7} /></g>}
      <Spray t={t} t0={hit} x={540} y={1100} seed={7} pow={1400} n={110} spread={1.6} />
      <Spray t={t} t0={hit + .08} x={540} y={1250} seed={17} pow={900} n={60} />
      {t > hit && <ellipse cx={540} cy={1720} rx={300 * ease(t, hit + .3, hit + 1.5)} ry={70 * ease(t, hit + .3, hit + 1.5)} fill="#5a0610" />}
    </g>
  </Frame>;
};

// a4 (v5): отряд из шести; плашки — над головами заднего ряда и под ногами переднего, с выносками, лица открыты
export const A4: React.FC<SP> = ({ t }) => (
  <Frame t={t} grade="#2a2418" gradeK={.1}>
    <g transform={cam(1.0 + t * .02, 540, 1150, 0, -150)}>
      <DarkCar t={t} />
      <Cone x={540} x0={540} y0={300} k={1.2} w={620} />
      {TEAM6.map(w => <H key={w} t={t} w={w} pose={POSES.stand} expr={w === 'timur' ? 'scared' : 'calm'} lookY={-.4 - ease(t, 1.5, 2.6) * .5} rim={WARM} />)}
    </g>
    {TEAM6.map((w, i) => { const [x, y, s] = G[w], back = i < 3, sx = x, head = y - 150 - 820 * s, tagY = back ? head - 120 : y - 150 - 90, k = ease(t, .2 + i * .18, .5 + i * .18);
      return <g key={w}><line x1={sx} x2={sx} y1={back ? tagY + 30 : tagY - 40} y2={back ? head - 10 : y - 150 - 300} stroke="#5fd2ff" strokeWidth={3} opacity={k * .8} /><Tag t={t} t0={.2 + i * .18} x={Math.min(900, Math.max(180, sx))} y={tagY} name={NAMES[w]} /></g>; })}
  </Frame>
);

// c7b (v5): Кирилл идёт вслепую; фонарь разгорается; на подходе — скример: вспышка искажённого лица в свете (4 кадра) и снова фонарь
export const C7b: React.FC<SP> = ({ t, d }) => {
  const dist = ease(t, 0, d, (k: number) => k) * 260, fl = 1 + ease(t, 1.0, 2.0) * .6 + noise('c7', t, 10) * .2, scr = t > d - 1.0 && t < d - .82;
  const sw = Math.sin(dist / 40) * 14; const pose: any = { ...POSES.stand, armR: [30, -110], legL: [-10 + sw, 4], legR: [10 - sw, -4] };
  if (scr) { const j = (h1(Math.floor(t * 30)) - .5) * 30; return <Frame t={t} vign={1}>
    <rect width={1080} height={1920} fill="#1a0404" /><circle cx={540} cy={860} r={700} fill="#ffd8a0" opacity={.35} filter="url(#blur30)" />
    <g transform={`translate(${540 + j} 880) scale(2.2)`}>
      <path d="M-200 -260 C-240 -40 -210 160 -120 280 C-60 360 60 360 120 280 C210 160 240 -40 200 -260 C110 -360 -110 -360 -200 -260Z" fill="#c8b8a0" stroke="#1a0604" strokeWidth={8} />
      <path d="M-200 -260 C-120 -320 120 -320 200 -260 L180 -150 C80 -200 -80 -200 -180 -150Z" fill="#8a7a64" opacity={.6} />
      {[-1, 1].map(sd => <g key={sd}><path d={`M${sd * 30} -110 C${sd * 60} -170 ${sd * 160} -170 ${sd * 170} -90 C${sd * 150} -30 ${sd * 60} -30 ${sd * 30} -70Z`} fill="#050000" />
        <circle cx={sd * 100} cy={-92} r={16} fill="#ff1a10" filter="url(#glow)" /><circle cx={sd * 100} cy={-92} r={6} fill="#fff" /></g>)}
      <path d="M-120 40 Q0 0 120 40 Q100 260 0 290 Q-100 260 -120 40Z" fill="#0a0000" stroke="#1a0604" strokeWidth={6} />
      {Array.from({ length: 9 }).map((_, i) => { const u = i / 8 - .5, x = u * 210; return <g key={i}><path d={`M${x - 11} ${44 + Math.abs(u) * 20} L${x + 11} ${44 + Math.abs(u) * 20} L${x} ${100 - Math.abs(u) * 30}Z`} fill="#e8dcc8" />
        <path d={`M${x - 10} ${262 - Math.abs(u) * 50} L${x + 10} ${262 - Math.abs(u) * 50} L${x} ${206 - Math.abs(u) * 30}Z`} fill="#d8ccb8" /></g>; })}
      <path d="M-150 -220 L-90 -150 L-120 -60 M140 40 L100 120 L150 200 M-20 -300 L10 -220" stroke="#3a0a04" strokeWidth={5} fill="none" />
      <path d="M-40 -20 L-20 20 L0 -10 L20 20 L40 -20" stroke="#3a1a10" strokeWidth={6} fill="none" />
    </g>
    <rect width={1080} height={1920} fill="#ff1a0a" opacity={.2} style={{ mixBlendMode: 'multiply' }} />
  </Frame>; }
  return <Frame t={t} grade="#2a2418" gradeK={.1}>
    <g transform={cam(1.0 + t * .05, 540, 1000, 0, -120)}>
      <DarkCar t={t} />
      <Cone x={620} x0={620} y0={520} k={fl} w={560} />
      <Machinist x={620} y={1260} s={.75} t={t} k={fl} />
      <Figure x={330 + dist * .4} y={2000 - dist * .6} s={1.45 - dist * .0015} t={t} L={KL} C={KC} pose={pose} expr="pain" lid={0} noBlink turn={.5} seed={3} sweat={1} rim={WARM} prop={inHand(pose, 0)} />
    </g>
  </Frame>;
};

// ---------- Депо ----------
// g1 (v5): двери открываются на станцию «Депо» — Михалыч: «Двери открылись. Может, тут выход.»; отряд выходит на платформу
export const G1: React.FC<SP> = ({ t }) => { const c = caps('g1');
  return <Frame t={t} grade="#2a1010" gradeK={.12}>
    <g transform={cam(1.0 + t * .04, 540, 1100, 0, -140)}>
      <DepotBg t={t} />
      <rect x={-ease(t, 0, .6) * 300} y={0} width={300} height={1920} fill="#5a5e68" opacity={.9} /><rect x={780 + ease(t, 0, .6) * 300} y={0} width={300} height={1920} fill="#4a4e58" opacity={.9} />
      <g transform="translate(540 2080) scale(.85) translate(-540 -1920)">
        {['r2', 'timur', 'kirill', 'mikh'].map(w => <H key={w} t={t} w={w} pose={w === 'mikh' ? { ...POSES.stand, armR: [120, -20] } : POSES.tense} expr={w === 'mikh' ? 'determined' : 'scared'} mouth={w === 'mikh' ? talk(t, c, 'МИХАЛЫЧ') : 0} lookY={-.5} />)}
      </g>
    </g>
  </Frame>; };
// g1b: на платформе — горы снаряжения прошлых рейдов (каски, рюкзаки, жетоны); Кирилл поднимает жетон «А. ВОЛКОВ»; вдали — стук по рельсам
const Gear: React.FC<{ t: number }> = ({ t }) => <g>{Array.from({ length: 34 }).map((_, i) => { const x = 80 + h1(i * 3) * 920, y = 1380 + h1(i * 7) * 340, k = i % 3;
  return k === 0 ? <path key={i} d={`M${x - 40} ${y} Q${x} ${y - 50} ${x + 40} ${y}Z`} fill={['#5a6a3a', '#6a5a2a', '#4a4a50'][i % 3]} stroke={INK} strokeWidth={3} />
    : k === 1 ? <rect key={i} x={x - 34} y={y - 44} width={68} height={56} rx={14} fill={['#3a4a5a', '#5a3a2a', '#2a3a2a'][i % 3]} stroke={INK} strokeWidth={3} />
    : <rect key={i} x={x - 12} y={y - 8} width={24} height={16} rx={3} fill="#c8b070" stroke="#5a4a20" strokeWidth={2} transform={`rotate(${h1(i) * 60 - 30} ${x} ${y})`} />; })}</g>;
export const G1b: React.FC<SP> = ({ t, d }) => {
  const c = caps('g1b'), pick = c?.[1] ? c[1][2] - .8 : 2.0, up = ease(t, pick, pick + .7);
  const close = up > .5;
  return <Frame t={t} grade="#2a1010" gradeK={.12}>
    {!close ? <g transform={cam(1.05 + t * .03, 540, 1300, 0, -160)}>
      <DepotBg t={t} />
      <Gear t={t} />
      <rect x={140} y={1180} width={800} height={60} fill="#1a1414" opacity={.6} />
      <Figure x={540} y={1980} s={1.2} t={t} L={KL} C={KC} pose={PK(t, [[0, 'stand'], [pick, { crouch: 160, armR: [40, -40], lean: 10 }]], false)} expr="scared" lookY={.8} seed={3} rim="#ff6a5a" />
      <H t={t} w="timur" pose={POSES.tense} expr="scared" lookY={.6} />
    </g> : <g>
      <rect width={1080} height={1920} fill="#140a0a" /><ellipse cx={540} cy={900} rx={600} ry={500} fill="#ff4a3a" opacity={.12} filter="url(#blur30)" />
      <g transform={`translate(540 ${900 - (up - .5) * 40}) rotate(${-6 + Math.sin(t * 2) * 2}) scale(${1.6 + (up - .5) * .4})`}>
        <path d="M-20 -230 Q0 -300 20 -230" stroke="#8a8a90" strokeWidth={8} fill="none" />
        <rect x={-180} y={-230} width={360} height={240} rx={26} fill="#c8b070" stroke="#5a4a20" strokeWidth={8} />
        <rect x={-150} y={-200} width={300} height={180} rx={14} fill="none" stroke="#8a7a40" strokeWidth={4} />
        <text y={-140} textAnchor="middle" fontFamily="Oswald" fontWeight={500} fontSize={30} letterSpacing={4} fill="#3a2a10">АССОЦИАЦИЯ ОХОТНИКОВ</text>
        <text y={-70} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={64} letterSpacing={6} fill="#2a1a08">А. ВОЛКОВ</text>
        <text y={-30} textAnchor="middle" fontFamily="Oswald" fontWeight={500} fontSize={30} letterSpacing={4} fill="#3a2a10">РАНГ B · № 0417</text>
        <path d="M-160 -10 L160 -220" stroke="#5a1010" strokeWidth={6} opacity={.5} />
      </g>
    </g>}
  </Frame>;
};

// g4 (v5): молот бьёт по ногам — Михалыча задевает по ноге (кровь, падает на колено); Кирилл выдёргивает Тимура; «Все в вагон!»
export const G4: React.FC<SP> = ({ t }) => {
  const c = caps('g4'), hit = .7, sw = ease(t, .1, hit), [sx, sy] = shakeXY(t, [[hit, 40, .6]]);
  return <Frame t={t} grade="#2a0a0a" gradeK={.12} impact={isImpact(t, hit, 3)}>
    <g transform={cam(1.05, 540, 1100, sx, sy - 100)}>
      <DepotBg t={t} />
      <Walker x={680} y={1450} s={.8} t={t} open={.7} swing={sw} crouch={.3} />
      <g transform="translate(540 2080) scale(.8) translate(-540 -1920)">
        <H t={t} w="mikh" pose={t < hit ? POSES.guard : { ...POSES.hit, crouch: 120, legR: [40, -110], armR: [150, -10] }} expr={t < hit ? 'angry' : 'pain'} mouth={talk(t, c, 'МИХАЛЫЧ')} rim="#ff4a3a" />
        {t > hit && <g><rect x={G.mikh[0] + 30} y={G.mikh[1] - 250} width={50} height={120} fill="#a80c18" opacity={.85} /><Spray t={t} t0={hit} x={G.mikh[0] + 50} y={G.mikh[1] - 200} dir={.6} seed={5} pow={600} n={30} /></g>}
        <H t={t} w="timur" pose={t < .5 ? POSES.tense : POSES.hit} expr="scared" />
        <H t={t} w="r2" pose={POSES.guard} expr="angry" />
        <H t={t} w="kirill" pose={PK(t, [[0, 'tense'], [.4, { armL: [-100, 20], lean: -16 }], [.9, { armL: [-60, 90], lean: 10 }]])} expr="shout" turn={-.4} />
      </g>
    </g>
  </Frame>;
};

// g8 (v5): Михалыч на одном колене в проёме, нога в крови — не добежит; держит дверь руками, огонь; оборачивается: «Я не добегу. Берегите себя. Защитите друг друга.»
export const G8: React.FC<SP> = ({ t, d }) => {
  const c = caps('g8'), hit = d - 1.4, sw = ease(t, hit - .5, hit), fall = clamp((t - hit - .1) / .45) ** 2, trem = t < hit ? Math.sin(t * 40) * 4 : 0, [sx, sy] = shakeXY(t, [[hit, 40, .6]]);
  const reach = ease(t, c?.[1] ? c[1][2] - .4 : hit - .8, c?.[1] ? c[1][2] : hit), close = ease(t, hit + .3, hit + 1.0), turnB = t > .6 && t < hit - .3;
  return <Frame t={t} grade="#2a0a0a" gradeK={.1} impact={isImpact(t, hit, 3)}>
    <g transform={cam(1.0, 540, 1000, sx, sy)}>
      <DepotBg t={t} />
      <Walker x={600} y={1350} s={.7} t={t} open={.8} swing={sw} crouch={.3} />
      {t < hit + .6 && <g opacity={t < hit + .1 ? 1 : 1 - ease(t, hit + .1, hit + .6)}>{Array.from({ length: 16 }).map((_, i) => { const x = 300 + i * 32, hh = 260 + noise('fw' + i, t, 4) * 100; return <ellipse key={i} cx={x} cy={1500 - hh * .5} rx={30} ry={hh * .5} fill={i % 3 ? '#ff7a1a' : '#ffd060'} opacity={.7} filter="url(#glow)" />; })}</g>}
      <g transform={`translate(${trem} 0) rotate(${fall * 70} 540 1900)`}>
        <Figure x={540} y={1900} s={1.15} t={fall > 0 ? hit : t} L={LK.mikh} C={CS.mikh} pose={fall > 0 ? POSES.fallen : { ...POSES.stand, armL: [-110, -20], armR: [110, 20], legL: [-22, 30], legR: [50, -120], crouch: 140, lean: 4 }}
          expr={t < hit ? 'sad' : 'pain'} mouth={talk(t, c, 'МИХАЛЫЧ')} turn={turnB ? -.8 : 0} lookX={turnB ? -.9 : 0} seed={6} rim="#ff8a2a" />
        <rect x={590} y={1700} width={50} height={130} fill="#a80c18" opacity={.85} />
      </g>
      {t > hit && <Spray t={t} t0={hit} x={560} y={1150} dir={.2} seed={12} pow={700} n={40} />}
      <rect x={0} y={0} width={180 + close * 360} height={1920} fill="#5a5e68" stroke="#2a2e38" strokeWidth={10} /><rect x={900 - close * 360} y={0} width={180 + close * 360} height={1920} fill="#4a4e58" stroke="#2a2e38" strokeWidth={10} />
      <path d={`M-60 ${1700 - reach * 60} L${120 + reach * 260} ${1380 - reach * 40}`} stroke="#f5c518" strokeWidth={110} strokeLinecap="round" />
      <circle cx={120 + reach * 260} cy={1380 - reach * 40} r={52} fill="#ecd2c4" stroke={INK} strokeWidth={5} />
    </g>
  </Frame>;
};

// ---------- пропасть: щупальца ищут фонарь ----------
const Pole: React.FC<{ x: number }> = ({ x }) => <g><rect x={x - 14} y={300} width={28} height={1600} rx={12} fill="#b8bec8" stroke="#2a2e38" strokeWidth={4} /><rect x={x - 4} y={300} width={6} height={1600} fill="#fff" opacity={.4} /></g>;
const Tilt: React.FC<{ t: number; children: React.ReactNode; sx?: number; sy?: number }> = ({ t, children, sx = 0, sy = 0 }) => <g transform={`translate(540 960) rotate(-22) translate(-540 -960) translate(${sx} ${sy})`}>
  <g transform={cam(1.1, 540, 1050)}><TrainInterior t={t} flicker={1} red={2} shake={4} /><rect width={1080} height={1920} fill="#2a0206" opacity={.35} />{children}</g></g>;
// i2a: щупальца врываются в окна и утаскивают накрытые тела Жоры и Серёги; живые жмутся к поручням
export const I2a: React.FC<SP> = ({ t }) => {
  const g1 = clamp((t - .9) / .6) ** 2, g2 = clamp((t - 1.8) / .6) ** 2, [sx, sy] = shakeXY(t, [[0, 8, 3.4], [.5, 30, .4]]);
  return <Frame t={t} grade="#3a0a10" gradeK={.15} impact={isImpact(t, .5, 2)}>
    <Tilt t={t} sx={sx} sy={sy}>
      <Pole x={300} /><Pole x={780} />
      {[[420, 1560, g1, '#5a2a2a', 1300, 900], [700, 1640, g2, '#3a4a5a', 1300, 1200]].map(([x, y, g, col, tx, ty], i) => <g key={i}>
        {t > .5 + i * .9 && <Tentacle t={t} x0={tx as number} y0={ty as number} x1={(x as number) + (g as number) * 700} y1={(y as number) - 40 - (g as number) * 500} w={80} seed={i + 5} />}
        <g transform={`translate(${(g as number) * 700} ${-(g as number) * 500}) rotate(${(g as number) * 50} ${x} ${y})`}><path d={`M${(x as number) - 150} ${y} Q${(x as number) - 120} ${(y as number) - 70} ${x} ${(y as number) - 80} Q${(x as number) + 130} ${(y as number) - 70} ${(x as number) + 160} ${y}Z`} fill={col as string} stroke={INK} strokeWidth={5} /></g>
        {(g as number) > 0 && <path d={`M${x} ${y} l${(g as number) * 500} ${-(g as number) * 380}`} stroke="#6a0a12" strokeWidth={18} strokeLinecap="round" opacity={.8} />}</g>)}
      <Figure x={330} y={1720} s={1.0} t={t} L={KL} C={KC} pose={{ ...POSES.stand, armL: [-170, 0], armR: [-150, 10], legL: [-20, 20], legR: [26, -10], lean: 12 }} expr="scared" turn={.5} lookX={.9} seed={3} rim="#ff6a5a" />
      <Figure x={790} y={1700} s={.95} t={t} L={LK.r2} C={CS.r2} pose={{ ...POSES.stand, armL: [-170, 10], armR: [150, -10], legL: [-30, 20], legR: [20, -10], lean: 10 }} expr="scared" seed={22} rim="#ff6a5a" />
      <Figure x={120} y={1820} s={.85} t={t} L={LK.timur} C={CS.timur} pose={{ ...POSES.stand, armR: [170, -10], armL: [150, -20], crouch: 40, lean: 16 }} expr="cry" seed={41} rim="#ff6a5a" />
    </Tilt>
  </Frame>;
};
// i3b (v5): щупальце хватает Кирилла за ногу и тащит; Тимур держит его — «Кирилл! Держись!»; второе щупальце пробивает ему бок (кровь)
export const I3b: React.FC<SP> = ({ t, d }) => {
  const c = caps('i3b'), drag = ease(t, .3, 1.6), pierce = d - 1.0, [sx, sy] = shakeXY(t, [[.3, 24, .4], [pierce, 34, .5]]);
  return <Frame t={t} grade="#3a0a10" gradeK={.15} impact={isImpact(t, .3, 2) || isImpact(t, pierce, 3)} over={<Splat t={t} t0={pierce} seed={51} n={4} k={.8} />}>
    <Tilt t={t} sx={sx} sy={sy}>
      <Pole x={260} />
      <Tentacle t={t} x0={1300} y0={1300} x1={560 + drag * 160} y1={1880} w={80} seed={9} />
      {[0, 1].map(i => <ellipse key={i} cx={560 + drag * 160} cy={1850 - i * 40} rx={60} ry={18} fill="none" stroke="#5a0a12" strokeWidth={20} />)}
      <g transform={`rotate(${-70 + drag * 10} 560 1880)`}><Figure x={560 + drag * 160} y={1880} s={1.0} t={t} L={{ ...KL, bruise: true }} C={KC} pose={{ ...POSES.stand, armL: [-170, 0], armR: [-160, 10], legL: [-10, 10], legR: [20, 30] }} expr="pain" seed={3} mouth={t > pierce ? .5 : .2} /></g>
      {t > pierce - .4 && <Tentacle t={t} x0={1300} y0={600} x1={t < pierce ? 1300 - ease(t, pierce - .4, pierce) * 640 : 660} y1={t < pierce ? 600 + ease(t, pierce - .4, pierce) * 900 : 1500} w={56} seed={4} spike />}
      {t > pierce && <Spray t={t} t0={pierce} x={640} y={1520} dir={-.4} seed={61} pow={600} n={40} />}
      <Figure x={140} y={1500} s={.9} t={t} L={LK.timur} C={CS.timur} pose={{ ...POSES.stand, armR: [100, -20], armL: [-170, 0], crouch: 60, lean: 30 }} expr="shout" mouth={talk(t, c, 'ТИМУР')} seed={41} turn={.5} lookX={.9} />
      <path transform={`translate(140 ${1500 - 820 * .9 + 40}) scale(.9)`} d="M-18 -60 l20 6 M-4 -54 q4 30 -2 50" stroke="#a80c18" strokeWidth={5} fill="none" />
    </Tilt>
  </Frame>;
};
// i3 (v5): Кирилл, истекая кровью, видит: разбитый фонарь сам ползёт по полу к щупальцу — оно ищет его
export const I3: React.FC<SP> = ({ t, d }) => {
  const crawl = ease(t, .3, d - .3, (k: number) => k), glow = .4 + crawl * .6;
  return <Frame t={t} grade="#3a0a10" gradeK={.12}>
    <Tilt t={t}>
      <Tentacle t={t} x0={1250} y0={900} x1={900 - crawl * 120} y1={1450} w={70} seed={3} />
      <circle cx={420 + crawl * 400} cy={1560 - crawl * 90} r={220} fill="#ff8a4a" opacity={.3 * glow} filter="url(#blur30)" />
      <g transform={`rotate(${noise('lc', t, 6) * 8} ${420 + crawl * 400} ${1560 - crawl * 90})`}><LanternHead t={t} x={420 + crawl * 400} y={1560 - crawl * 90} s={1.1} broken /></g>
      <path d={`M${420} 1600 L${420 + crawl * 400} ${1600 - crawl * 90}`} stroke="#3a3030" strokeWidth={6} strokeDasharray="12 10" opacity={crawl} />
      <g transform="rotate(-80 300 1800)"><Figure x={300} y={1800} s={.9} t={t} L={{ ...KL, bruise: true }} C={KC} pose={{ ...POSES.stand, armR: [60, -40] }} expr="pain" lookX={.8} lookY={.2} seed={3} /></g>
      <rect x={250} y={1660} width={80} height={50} rx={14} fill="#a80c18" opacity={.9} />
    </Tilt>
  </Frame>;
};
// i4 (v5): Кирилл бросается на фонарь (ожог, дым от ладоней) и вышвыривает его в окно: «Забирай!»; щупальца отпускают
export const I4: React.FC<SP> = ({ t }) => {
  const c = caps('i4'), thr = c?.[0] ? c[0][2] + .1 : 1.6, q = clamp((t - thr) / .5), [sx, sy] = shakeXY(t, [[thr, 20, .4]]);
  const pose = PK(t, [[0, { armL: [-60, 80], armR: [60, -80], crouch: 80, lean: 10 }], [thr - .3, { armR: [-40, -60], armL: [-80, 40], lean: -14 }], [thr, { armR: [150, -10], armL: [-40, 20], lean: 16 }]]);
  return <Frame t={t} grade="#3a0a10" gradeK={.12}>
    <Tilt t={t} sx={sx} sy={sy}>
      <Figure x={540} y={2050} s={1.55} t={t} L={{ ...KL, bruise: true }} C={KC} pose={pose} expr={t < thr - .2 ? 'pain' : 'shout'} mouth={talk(t, c, 'КИРИЛЛ')} seed={3} turn={.2}
        prop={t < thr + .05 ? <g transform="translate(0 0)"><LanternHead t={t} x={0} y={-500} s={.6} broken /></g> : undefined} />
      <rect x={500} y={1420} width={40} height={70} fill="#a80c18" />
      {t > thr && <LanternHead t={t} x={540 + q * 700} y={1000 - q * 500} s={.9 * (1 - q * .6)} broken />}
      {t > thr && <Tentacle t={t} x0={1300} y0={800} x1={1300 - (1 - q) * 500} y1={800 + (1 - q) * 400} w={60} seed={7} />}
    </Tilt>
  </Frame>;
};

// i5b (v5): над путями «Северной» раскрываются Врата — огромный вагон (во весь кадр) вываливается и врезается в платформу
export const I5b: React.FC<SP> = ({ t }) => {
  const open = ease(t, 0, .5), fall = clamp((t - .4) / .6), hit = 1.0, [sx, sy] = shakeXY(t, [[hit, 50, .9]]);
  return <Frame t={t} grade="#1a1a2a" gradeK={.1} impact={isImpact(t, hit, 3)} over={<Flash t={t} t0={hit} dur={.25} color="#fff" max={.5} />}>
    <g transform={cam(1.0, 540, 1000, sx, sy)}>
      <MetroStation t={t} />
      <rect width={1080} height={1920} fill="#05060c" opacity={.35} />
      <Gate x={540} y={520} s={1.9 * open * (t > 2.2 ? 1 - ease(t, 2.2, 2.8) : 1)} t={t} />
      {t > .4 && <g transform={`translate(560 ${Math.min(300 + fall * fall * 1100, 1300)}) rotate(${t < hit ? -40 + fall * 30 : -10})`}><BigCar x={0} y={0} s={2.3} rot={0} dmg={1} /></g>}
      {t > hit && Array.from({ length: 20 }).map((_, i) => { const q = clamp((t - hit) / 1.2), a = -Math.PI * (h1(i) * .9 + .05), r = 300 + h1(i * 3) * 600; return <rect key={i} x={540 + Math.cos(a) * r * q} y={1500 + Math.sin(a) * r * q + 700 * q * q} width={30} height={20} fill="#6a6a74" opacity={1 - q} />; })}
      {t > hit && <ellipse cx={540} cy={1600} rx={700 * ease(t, hit, hit + 1.2)} ry={240 * ease(t, hit, hit + 1.2)} fill="#5a5a64" opacity={.6 * (1 - ease(t, hit + 1, 3))} filter="url(#blur30)" />}
    </g>
  </Frame>;
};

// j0: титр поверх больничного потолка — «СРЕДА · 07:40», монитор пищит
export const J0: React.FC<SP> = ({ t }) => (
  <Frame t={t} grade="#2a3040" gradeK={.05} vign={.5}>
    <rect width={1080} height={1920} fill="#dfe6e8" /><rect x={340} y={300} width={400} height={50} rx={12} fill="#f4f8f8" stroke="#a8b4b2" strokeWidth={4} />
    <ellipse cx={540} cy={340} rx={420} ry={90} fill="#fffbe8" opacity={.4} filter="url(#blur30)" />
    {[0, 1, 2, 3].map(i => <line key={i} x1={0} y1={600 + i * 300} x2={1080} y2={600 + i * 300} stroke="#c8d0d2" strokeWidth={4} />)}
    <g opacity={ease(t, .2, .7) * (1 - ease(t, 2.2, 2.6))}>
      <text x={540} y={960} textAnchor="middle" fontFamily="Oswald" fontWeight={600} fontSize={110} letterSpacing={16} fill="#2a3440">СРЕДА</text>
      <text x={540} y={1050} textAnchor="middle" fontFamily="Oswald" fontWeight={400} fontSize={52} letterSpacing={10} fill="#5a6a7a">07:40 · БОЛЬНИЦА № 67</text>
    </g>
  </Frame>
);
