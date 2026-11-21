// Серия 2 v2: разбивание фонаря по шагам (k1, c6, c7b, c7c, c8, c8b), засада в Депо и гибель Михалыча (g7, g8), голова-фонарь в вагоне (i1),
// пропасть заново (h2), щупальца, Лёха (i2), разгадка — «оно зовёт своё» (i3–i5), Тимур (i6), окно Системы (i7), больница (j1–j3).
import React from 'react';
import { clamp, ease, noise, spr } from '../anim';
import { cam, Flash, h1, isImpact, Lids, Motes, shakeXY, Smoke, SpeedLines } from '../kit/fx';
import { SysWin } from '../kit/ui';
import { Figure, PK, POSES, walkPose, wristR } from '../chars/body';
import { Head, INK } from '../chars/head';
import { Machinist } from '../chars/monsters';
import { LK, CS } from '../chars/cast';
import { Gate, Vysotka } from '../bg/moscow';
import { MetroStation, TrainInterior } from '../bg/places';
import { Frame, SP } from '../ep1/common';
import { Faceless, KL } from '../ep1/ShotsF';
import { G, H } from './team';
import { caps, talk } from './timeline';
import { Cone, DarkCar, WARM } from './ShotsA';
import { Hammer } from './ShotsB';
import { Pool, Spray, Splat } from './ShotsC';
import { Walker } from './ShotsD';

const KC = CS.porterY;
// молоток в правой кисти (в координатах фигуры)
const inHand = (pose: any, r = 0, s = 1) => { const w = wristR(pose, KC.w || 1); return <g transform={`translate(${w[0]} ${w[1]}) rotate(${180 - w[2] + r * .2})`}><Hammer x={0} y={-150 * .55 * s} s={.55 * s} /></g>; };
export { inHand };
// плашка имени над персонажем
export const Tag: React.FC<{ t: number; t0: number; x: number; y: number; name: string; sub?: string }> = ({ t, t0, x, y, name, sub }) => {
  const k = spr(t, t0, { damping: 14 }); if (k <= 0) return null;
  return <g transform={`translate(${x} ${y}) scale(${k})`} opacity={clamp(k)}>
    <rect x={-150} y={-40} width={300} height={sub ? 96 : 66} rx={10} fill="#06182e" opacity={.85} stroke="#5fd2ff" strokeWidth={3} />
    <text y={8} textAnchor="middle" fontFamily="Oswald" fontWeight={600} fontSize={44} letterSpacing={6} fill="#e8f8ff">{name}</text>
    {sub && <text y={46} textAnchor="middle" fontFamily="Oswald" fontWeight={400} fontSize={28} letterSpacing={4} fill="#9fdcff">{sub}</text>}
  </g>;
};
// голова-фонарь (разбитая или целая): crack 0..1 — трещины, broken — без стекла, мерцает
export const LanternHead: React.FC<{ t: number; x: number; y: number; s: number; k?: number; crack?: number; broken?: boolean; face?: number }> = ({ t, x, y, s, k = 1, crack = 0, broken, face = 0 }) => {
  const fl = broken ? (noise('lh', t, 14) > .2 ? .55 : .1) : k;
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r={190} fill={broken ? '#ff6a3a' : WARM} opacity={.3 * fl} filter="url(#blur30)" />
    <rect x={-70} y={-80} width={140} height={150} rx={20} fill="#2a2a30" stroke={INK} strokeWidth={5} />
    <rect x={-80} y={-100} width={160} height={24} rx={6} fill="#1a1a20" /><rect x={-50} y={-120} width={100} height={22} fill="#1a1a20" /><circle cx={0} cy={-108} r={10} fill="#c8a85a" />
    {!broken && <circle r={52} fill="#fff6d8" opacity={k} />}
    {!broken && face > 0 && <g opacity={face}><defs><clipPath id="lhFace"><rect x={-62} y={-72} width={124} height={134} rx={16} /></clipPath></defs>
      <g clipPath="url(#lhFace)"><rect x={-62} y={-72} width={124} height={134} fill="#fff4d8" /><g transform="translate(0 4) scale(1.05)"><Head t={t} L={LK.father} expr="sad" seed={12} lookY={.2} noBlink /></g>
        <rect x={-62} y={-72} width={124} height={134} fill="#fff0c0" opacity={.35} /></g></g>}
    {crack > 0 && <g stroke="#2a2018" strokeWidth={3} fill="none">{Array.from({ length: 9 }).map((_, i) => { const a = i / 9 * Math.PI * 2 + .3, L = 52 * crack;
      return <path key={i} d={`M8 -6 L${8 + Math.cos(a) * L * .5 + (h1(i) - .5) * 10} ${-6 + Math.sin(a) * L * .5} L${8 + Math.cos(a + .2) * L} ${-6 + Math.sin(a + .2) * L}`} />; })}</g>}
    {broken && <g><circle r={52} fill="#140c08" /><path d="M-40 -20 L-10 -50 L10 -10 L40 -40 L30 20 L-20 30Z" fill="none" stroke="#c8d0e0" strokeWidth={4} />
      {Array.from({ length: 5 }).map((_, i) => <path key={i} d={`M${-20 + i * 10} 0 q${(h1(i) - .5) * 30} ${-20 - noise('fil' + i, t, 3) * 20} ${(h1(i * 3) - .5) * 40} -40`} stroke="#ffb060" strokeWidth={3} fill="none" opacity={fl} filter="url(#glow)" />)}
      {noise('sp', t, 9) > .5 && <circle cx={(h1(Math.floor(t * 20)) - .5) * 60} cy={-10} r={6} fill="#fff4c0" filter="url(#glow)" />}</g>}
  </g>;
};

// k1: объяснение — от глаз упавших к фонарю тянутся нити света; Кирилл понимает
export const K1: React.FC<SP> = ({ t }) => {
  const thr = ease(t, .2, 1.2);
  return <Frame t={t} grade="#2a2418" gradeK={.1}>
    <g transform={cam(1.05 + t * .04, 540, 1000, 0, -140)}>
      <DarkCar t={t} />
      <Machinist x={540} y={1120} s={.55} t={t} k={1.2} />
      <Cone x={540} x0={540} y0={480} k={1.2} w={480} />
      {[[300, 1650, 21, 'r1'], [760, 1700, 7, 'zhora']].map(([x, y, sd, w], i) => <g key={i}>
        <g transform={`rotate(${i ? -84 : 84} ${x} ${y})`}><Figure x={x as number} y={y as number} s={.85} t={0} L={{ ...LK[w as string], skin: '#d8d4d0', skinSh: '#a8a4a0' }} C={CS[w as string]} pose={POSES.fallen} expr="calm" lid={1} noBlink seed={sd as number} lookY={-1} /></g>
        <Pool x={(x as number) + (i ? -120 : 120)} y={(y as number) + 10} k={1} w={200} />
        <path d={`M${(x as number) + (i ? -560 : 560) * .85} ${(y as number) - 60} Q${540 + (i ? 120 : -120)} 1100 540 ${1120 - 600 * .55}`} stroke="#ffe8a0" strokeWidth={6} fill="none" opacity={thr * (.6 + .4 * Math.sin(t * 8 + i))} filter="url(#glow)" strokeDasharray="20 12" strokeDashoffset={t * 140} />
      </g>)}
      <g transform="translate(-150 0)"><Figure x={300} y={2120} s={1.55} t={t} L={KL} C={KC} pose={POSES.tense} expr="determined" turn={.5} lookX={.7} lookY={-.3} seed={3} rim={WARM} /></g>
    </g>
  </Frame>;
};

// c6 (v2): Кирилл срывает красный молоток со стены — молоток у него в руке; затем закрывает глаза
export const C6: React.FC<SP> = ({ t }) => {
  const rip = .6, close = ease(t, 2.2, 3.0), [sx, sy] = shakeXY(t, [[rip, 14, .3]]);
  const pose = PK(t, [[0, { armR: [120, -30], lean: 8 }], [rip, { armR: [150, -60], lean: 4 }], [1.2, { armR: [40, -120], armL: [-20, 40] }]]);
  return <Frame t={t} grade="#1a1a2a" gradeK={.1} impact={isImpact(t, rip, 2)} over={<Lids k={close * .9} />}>
    <g transform={cam(1.25 + t * .05, 560, 900, sx, sy)}>
      <DarkCar t={t} k={.7} />
      <ellipse cx={120} cy={500} rx={500} ry={500} fill={WARM} opacity={.2} filter="url(#blur30)" />
      <rect x={760} y={520} width={260} height={360} rx={10} fill="#e8e8e0" stroke="#2a2e38" strokeWidth={6} />
      <text x={890} y={566} textAnchor="middle" fontFamily="Mont" fontWeight={800} fontSize={22} fill="#c81e2a">МОЛОТОК</text><text x={890} y={596} textAnchor="middle" fontFamily="Mont" fontWeight={700} fontSize={17} fill="#c81e2a">ДЛЯ СТЕКЛА</text>
      <rect x={800} y={620} width={180} height={230} rx={6} fill="none" stroke="#c81e2a" strokeWidth={4} strokeDasharray="12 8" />
      {t < rip && <Hammer x={890} y={720} s={.8} />}
      <Figure x={560} y={2060} s={1.7} t={t} L={KL} C={KC} pose={pose} expr="determined" lookX={t < 1 ? .8 : 0} lookY={t < 1 ? -.3 : 0} seed={3} rim={WARM} lid={1 - close} noBlink={close > 0} prop={t >= rip ? inHand(pose, -20) : undefined} />
    </g>
  </Frame>;
};

// c7b: снаружи — Кирилл идёт к Машинисту с закрытыми глазами; фонарь разгорается, в стекле мелькает лицо отца — «Смотри на меня!»
export const C7b: React.FC<SP> = ({ t }) => {
  const dist = ease(t, 0, 3.2, (k: number) => k) * 260, fl = 1 + ease(t, 1.0, 2.0) * .6 + noise('c7', t, 10) * .2;
  const pose = { ...walkPose(dist), armR: [30, -110] as [number, number] };
  return <Frame t={t} grade="#2a2418" gradeK={.1}>
    <g transform={cam(1.0 + t * .04, 540, 1000, 0, -120)}>
      <DarkCar t={t} />
      <Cone x={540} x0={540} y0={520} k={fl} w={560} />
      <Machinist x={620} y={1260} s={.75} t={t} k={fl} />
      <g transform={`translate(${620 + 0} ${1260 - 600 * .75})`}><LanternHead t={t} x={0} y={0} s={.75} k={fl} /></g>
      <Figure x={330 + dist * .4} y={2000 - dist * .6} s={1.45 - dist * .0015} t={t} L={KL} C={KC} pose={pose} expr="pain" lid={0} noBlink turn={.5} seed={3} sweat={1} rim={WARM} prop={inHand(pose, -10)} />
    </g>
  </Frame>;
};

// c7c: ракурс снизу — замах двумя руками над головой; «Твоя конечная.»
export const C7c: React.FC<SP> = ({ t }) => {
  const c = caps('c7c'), up = ease(t, .1, .9);
  const pose = { ...POSES.bothUp, armL: [-150 + (1 - up) * 120, 30] as [number, number], armR: [150 - (1 - up) * 120, -30] as [number, number], lean: -6 * up };
  return <Frame t={t} grade="#2a2418" gradeK={.1}>
    <g transform={`translate(0 0)`}>
      <rect width={1080} height={1920} fill="#0c0a08" />
      <ellipse cx={760} cy={200} rx={500} ry={400} fill={WARM} opacity={.35} filter="url(#blur30)" />
      <LanternHead t={t} x={780} y={260} s={1.6} k={1.3} />
      <g transform={`translate(540 2200) scale(1.15 1.3) translate(-540 -2200)`}>
        <Figure x={480} y={2250} s={1.9} t={t} L={KL} C={KC} pose={pose} expr="angry" lid={0} noBlink mouth={talk(t, c, 'КИРИЛЛ')} turn={.3} seed={3} rim={WARM} prop={inHand(pose, -60 * up, 1.2)} />
      </g>
    </g>
    <SpeedLines t={t} cx={780} cy={260} k={up * .5} />
  </Frame>;
};

// c8 (v2): удар крупно — молоток входит в стекло, стоп-кадр: трещины разбегаются → стекло вдребезги, свет гаснет
export const C8: React.FC<SP> = ({ t }) => {
  const hit = .35, freeze = .3, sw = ease(t, 0, hit), crack = ease(t, hit, hit + freeze * .8), boom = hit + freeze, q = clamp((t - boom) / 1.4);
  const [sx, sy] = shakeXY(t, [[hit, 20, .2], [boom, 40, .7]]);
  return <Frame t={t} vign={1} impact={isImpact(t, boom, 3)} over={<g><Flash t={t} t0={hit} dur={.12} color="#fff" max={.6} /><Flash t={t} t0={boom} dur={.45} color="#fff8e0" max={1} /></g>}>
    <rect width={1080} height={1920} fill={t < boom ? '#120e08' : '#040306'} />
    <g transform={cam(t < boom ? 1 + sw * .1 : 1.1, 540, 900, sx, sy)}>
      {t < boom && <LanternHead t={t} x={540} y={900} s={4} k={1.4} crack={crack} />}
      {t >= boom && <g>
        <LanternHead t={t} x={540} y={900} s={4} broken />
        {Array.from({ length: 40 }).map((_, i) => { const a = h1(i * 3.1) * Math.PI * 2, sp = 300 + h1(i * 7.7) * 1100, x = 540 + Math.cos(a) * sp * q, y = 900 + Math.sin(a) * sp * q + q * q * 600, r = 14 + h1(i * 5) * 50;
          return <polygon key={i} points={`${x},${y - r} ${x + r * .7},${y + r * .4} ${x - r * .5},${y + r * .6}`} fill={i % 3 ? '#fff6d8' : '#c8d0e0'} opacity={(1 - q) * .95} transform={`rotate(${q * 600 * (h1(i) - .5)} ${x} ${y})`} />; })}
        <circle cx={540} cy={900} r={700 * (1 - q)} fill={WARM} opacity={(1 - q) * .5} filter="url(#blur30)" />
      </g>}
      <g transform={`translate(${-400 + sw * 560} ${1700 - sw * 680}) rotate(${-70 + sw * 50})`}><Hammer x={0} y={0} s={3} /></g>
    </g>
    {t > hit && t < boom && <SpeedLines t={t} cx={540} cy={900} k={1} />}
  </Frame>;
};

// c8b: общий — безголовый Машинист шатается, искрит, падает на колени и лицом вперёд; свет гаснет совсем
export const C8b: React.FC<SP> = ({ t }) => {
  const kn = ease(t, .6, 1.3), fall = clamp((t - 1.4) / .4) ** 2, [sx, sy] = shakeXY(t, [[1.8, 24, .5]]);
  return <Frame t={t} grade="#1a1018" gradeK={.12} impact={isImpact(t, 1.8, 2)}>
    <g transform={cam(1.0, 540, 1100, sx, sy - 120)}>
      <DarkCar t={t} k={.5} />
      <g transform={`rotate(${fall * 70} 540 1500) translate(0 ${kn * 120})`}>
        <Machinist x={540} y={1500} s={.85} t={t} k={0} />
        <LanternHead t={t} x={540} y={1500 - 600 * .85} s={.85} broken />
      </g>
      <Smoke t={t} t0={0} x={540} y={1000} n={6} r={60} spread={120} color="#3a3640" life={2} rise={200} k={.6} seed={7} />
      <g transform="translate(-140 0)"><Figure x={300} y={2080} s={1.5} t={t} L={KL} C={KC} pose={{ ...POSES.tense, armR: [40, -100] }} expr="determined" lid={ease(t, 2.0, 2.4)} noBlink turn={.5} seed={3} prop={inHand({ ...POSES.tense, armR: [40, -100] }, 30)} /></g>
    </g>
  </Frame>;
};

// Депо: фон станции (из ShotsD нет экспорта Depot — повторяем коротко тёмные своды)
export const DepotBg: React.FC<{ t: number }> = ({ t }) => <g>
  <rect width={1080} height={1920} fill="#0c0808" />
  {[0, 1, 2, 3].map(i => { const s = Math.pow(.75, i); return <path key={i} d={`M${540 - 620 * s} ${1100 + 700 * s} L${540 - 620 * s} ${1100 - 500 * s} Q540 ${1100 - 1000 * s} ${540 + 620 * s} ${1100 - 500 * s} L${540 + 620 * s} ${1100 + 700 * s}`} fill="none" stroke="#2a1c1c" strokeWidth={30 * s} />; })}
  <path d="M0 1920 L1080 1920 L600 1100 L480 1100Z" fill="#160e0c" />
  <circle cx={540} cy={420} r={300} fill="#ff1a1a" opacity={.12 + .05 * Math.sin(t * 4)} filter="url(#blur30)" />
</g>;
// g7: засада — сзади из обоих тоннелей лезет толпа безликих и красные глаза, впереди Обходчик; путь один — обратно в вагон
export const G7: React.FC<SP> = ({ t }) => {
  const adv = ease(t, 0, 4, (k: number) => k), pan = ease(t, 0, 3.5);
  return <Frame t={t} grade="#2a0a0a" gradeK={.12}>
    <g transform={cam(1.05, 540 - 200 + pan * 400, 1050, 0, -120)}>
      <DepotBg t={t} />
      {Array.from({ length: 40 }).map((_, i) => { const x = h1(i * 3) * 1600 - 260, y = 700 + h1(i * 7) * 300; return <g key={'e' + i} opacity={.5 + .5 * Math.sin(t * 3 + i)}><circle cx={x - 10} cy={y} r={5} fill="#ff2030" filter="url(#glow)" /><circle cx={x + 10} cy={y} r={5} fill="#ff2030" filter="url(#glow)" /></g>; })}
      {Array.from({ length: 12 }).map((_, i) => { const sd = i % 2 ? 1 : -1, row = Math.floor(i / 2), k = .45 + row * .07 + adv * .12; return <Faceless key={i} x={540 + sd * (380 + row * 40) + (h1(i) - .5) * 80} y={1250 + row * 60 + adv * 120} s={k} t={t} seed={i + 30} lunge={.5 + .3 * Math.sin(t * 2 + i)} eyes={1} grin={.6} />; })}
      <Walker x={1350 - adv * 250} y={1500} s={.7} t={t} open={.5} step={adv * 4} />
      {/* открытые двери вагона — единственный путь */}
      <g transform="translate(-250 0)"><rect x={60} y={900} width={260} height={700} fill="#fff4d8" opacity={.7} filter="url(#blur12)" /><rect x={40} y={880} width={300} height={740} fill="none" stroke="#8a909a" strokeWidth={16} />
        <text x={190} y={860} textAnchor="middle" fontFamily="Oswald" fontWeight={600} fontSize={46} fill="#e8f8ff" letterSpacing={6}>ВАГОН</text></g>
      <g transform="translate(540 2080) scale(.8) translate(-540 -1920)">
        <H t={t} w="mikh" pose={POSES.guard} expr="angry" turn={-.3} />
        <H t={t} w="r2" pose={POSES.guard} expr="scared" turn={.4} />
        <H t={t} w="kirill" pose={{ ...POSES.tense, armR: [40, -100] }} expr="scared" turn={-.5} lookX={-.8} prop={inHand({ ...POSES.tense, armR: [40, -100] }, 20)} />
        <H t={t} w="timur" pose={POSES.tense} expr="scared" />
      </g>
    </g>
  </Frame>;
};

const FireWall: React.FC<{ t: number; k: number }> = ({ t, k }) => { if (k <= 0) return null;
  const fl = Array.from({ length: 22 }).map((_, i) => { const x = 380 + i * 24.8, hh = 300 + noise('fw' + i, t, 4) * 120; return <ellipse key={i} cx={x} cy={1650 - hh * .5} rx={34} ry={hh * .5} fill={i % 3 ? '#ff7a1a' : '#ffd060'} opacity={.7} filter="url(#glow)" />; });
  return <g opacity={k}>{fl}<rect x={340} y={1300} width={600} height={400} fill="#ff6a1a" opacity={.25} filter="url(#blur30)" /></g>; };
// g8: Михалыч остаётся в дверях: стена огня держит Обходчика, оборачивается — «Кирюха… береги пацана»; молот пробивает огонь — кровь; Кирилл: «Михалыч!»
export const G8: React.FC<SP> = ({ t, d }) => {
  const c = caps('g8'), hit = d - 1.6, sw = ease(t, hit - .5, hit), fall = clamp((t - hit - .1) / .5) ** 2, [sx, sy] = shakeXY(t, [[hit, 40, .6]]);
  const fire = t < hit + .2 ? 1 : 1 - ease(t, hit + .2, hit + .8);
  if (t > hit + .9) return <Frame t={t} grade="#2a0a10" gradeK={.15} impact={isImpact(t, hit + .9, 2)}>
    <rect width={1080} height={1920} fill="#100608" />
    <g transform={cam(1.0 + (t - hit) * .05, 540, 700)}><g transform="translate(540 700) scale(6)"><Head t={t} L={KL} expr="shout" seed={3} mouth={Math.max(.7, talk(t, c, 'КИРИЛЛ'))} tears={.8} /></g></g>
    <Splat t={t} t0={hit + .9} seed={33} n={3} k={.7} />
  </Frame>;
  return <Frame t={t} grade="#2a0a0a" gradeK={.1} impact={isImpact(t, hit, 3)} over={<Splat t={t} t0={hit + .05} seed={31} n={6} />}>
    <g transform={cam(1.08, 540, 1050, sx, sy - 120)}>
      <DepotBg t={t} />
      <Walker x={760} y={1450} s={.85} t={t} open={.8} swing={sw} crouch={.3} />
      <FireWall t={t} k={fire} />
      <g transform={`rotate(${fall * 80} ${G.mikh[0] - 300} ${G.mikh[1]})`}><H t={fall > 0 ? hit : t} w="mikh" dx={-300} pose={fall > 0 ? POSES.fallen : PK(t, [[0, { ...POSES.bang }], [1.5, { armR: [150, -20], armL: [-60, 40], lean: 6 }]])} expr={t < hit ? 'sad' : 'pain'} mouth={talk(t, c, 'МИХАЛЫЧ')} turn={t > .8 && t < hit - .3 ? -.7 : .2} lookX={t > .8 && t < hit - .3 ? -.9 : .5} rim="#ff8a2a" /></g>
      <Spray t={t} t0={hit} x={G.mikh[0] - 300} y={1150} dir={-.3} seed={12} pow={900} n={60} />
      <rect x={0} y={0} width={200} height={1920} fill="#2a2c34" /><rect x={200} y={300} width={40} height={1500} fill="#8a909a" />
    </g>
  </Frame>;
};

// i1: снова в вагоне — на полу разбитая голова-фонарь, всё ещё мерцает и подёргивается; Тимур: «Он… ещё светится.»
export const I1: React.FC<SP> = ({ t }) => {
  const c = caps('i1'), tw = noise('tw', t, 6) * 6;
  return <Frame t={t} grade="#1a1018" gradeK={.12}>
    <g transform={cam(1.15 + t * .04, 540, 1300, 0, -200)}>
      <TrainInterior t={t} flicker={.9} shake={3} red={.6} />
      <rect width={1080} height={1920} fill="#05050a" opacity={.4} />
      <g transform={`rotate(${tw} 560 1560)`}><LanternHead t={t} x={560} y={1560} s={1.6} broken /></g>
      <H t={t} w="timur" dx={250} pose={{ ...POSES.stand, crouch: 120, armL: [-40, 120], armR: [40, -120] }} expr="scared" mouth={talk(t, c, 'ТИМУР')} lookY={.7} lookX={.6} tears={.6} />
      <H t={t} w="kirill" pose={{ ...POSES.tense, armR: [40, -100] }} expr="sad" lookY={.7} turn={.3} prop={inHand({ ...POSES.tense, armR: [40, -100] }, 20)} />
      <H t={t} w="r2" pose={POSES.stand} expr="scared" lookY={.6} />
    </g>
  </Frame>;
};

// ---------- пропасть заново ----------
// бездна: слои скал по краям (параллакс), туман, красное сердце-воронка внизу с глазом, щупальца
export const Vortex: React.FC<{ t: number; x: number; y: number; s: number; eye?: number }> = ({ t, x, y, s, eye = 1 }) => <g transform={`translate(${x} ${y}) scale(${s} ${s * .5})`}>
  <circle r={620} fill="#5a0610" opacity={.5} filter="url(#blur30)" />
  {Array.from({ length: 7 }).map((_, j) => <g key={j} transform={`rotate(${t * (20 + j * 6) * (j % 2 ? 1 : -1)})`}>{Array.from({ length: 6 }).map((_, i) => { const r0 = 80 + j * 75;
    return <path key={i} d={`M${r0} 0 A${r0} ${r0} 0 0 1 ${r0 * Math.cos(1)} ${r0 * Math.sin(1)}`} transform={`rotate(${i * 60})`} stroke={j % 2 ? '#ff3a2a' : '#a80c18'} strokeWidth={22 - j * 2} fill="none" opacity={.8 - j * .08} filter={j < 2 ? 'url(#glow)' : undefined} />; })}</g>)}
  <ellipse rx={190} ry={110 * eye + 2} fill="#1a0204" stroke="#ff4a2a" strokeWidth={10} filter="url(#glow)" />
  {eye > .2 && <g><circle cx={noise('vx', t, .5) * 40} r={80 * eye} fill="#d81a10" /><circle cx={noise('vx', t, .5) * 40} r={60 * eye} fill="#fff0c0" opacity={.5} filter="url(#glow)" /><ellipse cx={noise('vx', t, .5) * 40} rx={14} ry={70 * eye} fill="#050000" /><circle cx={noise('vx', t, .5) * 40} r={10 * eye} fill="#fff6d8" filter="url(#glow)" /></g>}
</g>;
export const Tentacle: React.FC<{ t: number; x0: number; y0: number; x1: number; y1: number; w?: number; seed?: number; spike?: boolean }> = ({ t, x0, y0, x1, y1, w = 60, seed = 1, spike }) => {
  const mx = (x0 + x1) / 2 + Math.sin(t * 2 + seed) * 120, my = (y0 + y1) / 2 + Math.cos(t * 1.7 + seed) * 80;
  const P = (u: number) => [(1 - u) ** 2 * x0 + 2 * (1 - u) * u * mx + u * u * x1, (1 - u) ** 2 * y0 + 2 * (1 - u) * u * my + u * u * y1];
  const N = 18, pts = Array.from({ length: N + 1 }).map((_, i) => P(i / N));
  const side = (sg: number) => pts.map((p, i) => { const q = pts[Math.min(N, i + 1)], o = pts[Math.max(0, i - 1)], dx = q[0] - o[0], dy = q[1] - o[1], L = Math.hypot(dx, dy) || 1, ww = w * .5 * (1 - i / N * .85);
    return `${p[0] - dy / L * ww * sg} ${p[1] + dx / L * ww * sg}`; });
  const body = 'M' + side(1).join(' L') + ' L' + side(-1).reverse().join(' L') + 'Z';
  const tip = pts[N], pre = pts[N - 1], ta = Math.atan2(tip[1] - pre[1], tip[0] - pre[0]);
  return <g><path d={body} fill="#5a0a12" stroke="#1a0204" strokeWidth={4} />
    <path d={'M' + side(.35).join(' L')} stroke="#9a2a30" strokeWidth={w * .18} fill="none" strokeLinecap="round" opacity={.7} />
    {pts.slice(2, N - 1).map((p, i) => { const q = pts[i + 3], dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy) || 1, ww = w * .5 * (1 - (i + 2) / N * .85);
      return <ellipse key={i} cx={p[0] + dy / L * ww * .75} cy={p[1] - dx / L * ww * .75} rx={ww * .32} ry={ww * .24} fill="#e8b0a8" stroke="#6a1a20" strokeWidth={2} />; })}
    {spike && <path d={`M${tip[0]} ${tip[1]} l${Math.cos(ta - .3) * -20} ${Math.sin(ta - .3) * -20} L${tip[0] + Math.cos(ta) * 60} ${tip[1] + Math.sin(ta) * 60} L${tip[0] + Math.cos(ta + .3) * -20} ${tip[1] + Math.sin(ta + .3) * -20}Z`} fill="#e8e0d0" stroke="#1a0204" strokeWidth={3} />}
  </g>;
};
const Cliffs: React.FC<{ t: number; par: number }> = ({ t, par }) => <g>
  {[0, 1, 2].map(l => { const k = 1 - l * .3, off = par * (1 + l) * 200; return <g key={l} opacity={1 - l * .25}>
    <path d={`M0 ${-200 + off} L${220 * k} ${-200 + off} L${180 * k} ${500 + off} L${260 * k} ${900 + off} L${170 * k} ${1500 + off} L${240 * k} ${2400 + off} L0 ${2400 + off}Z`} fill={['#120c10', '#1a1218', '#241820'][l]} />
    <path d={`M1080 ${-200 + off} L${1080 - 240 * k} ${-200 + off} L${1080 - 170 * k} ${600 + off} L${1080 - 260 * k} ${1100 + off} L${1080 - 190 * k} ${1700 + off} L${1080 - 230 * k} ${2400 + off} L1080 ${2400 + off}Z`} fill={['#120c10', '#1a1218', '#241820'][l]} /></g>; })}
</g>;
// вагон сбоку в 3/4: корпус, окна со светом, сцепка; rot — наклон
const Car: React.FC<{ x: number; y: number; s: number; rot: number; head?: boolean }> = ({ x, y, s, rot, head }) => <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
  <rect x={-230} y={-100} width={460} height={200} rx={24} fill="#2e5a80" stroke="#0a0c14" strokeWidth={8} />
  <rect x={-230} y={-100} width={460} height={40} rx={20} fill="#3e6a90" />
  {[0, 1, 2, 3].map(j => <rect key={j} x={-200 + j * 104} y={-56} width={80} height={70} rx={6} fill="#fff0c0" opacity={.75} />)}
  <rect x={-230} y={60} width={460} height={24} fill="#1a2a3a" /><rect x={-230} y={10} width={460} height={10} fill="#c81e2a" opacity={.8} />
  {[-150, 150].map(w => <circle key={w} cx={w} cy={104} r={26} fill="#1a1a20" stroke="#4a4a54" strokeWidth={6} />)}
  {head && <g><path d="M230 -100 Q290 -60 290 0 Q290 60 230 100Z" fill="#2e5a80" stroke="#0a0c14" strokeWidth={8} /><circle cx={272} cy={30} r={18} fill="#fff8e0" /><ellipse cx={420} cy={40} rx={180} ry={50} fill="#fff4d0" opacity={.3} filter="url(#blur12)" /></g>}
</g>;
// h2 (v2): поезд вылетает из тоннеля — рельсы обрываются, искры; нос клюёт вниз, вагоны идут дугой; камера опускается — внизу сердце, глаз открывается, тянутся щупальца
export const H2: React.FC<SP> = ({ t }) => {
  const q = ease(t, .1, 4.6, (k: number) => k), tilt = ease(t, 1.6, 4.2), camY = tilt * 700;
  const path = (u: number) => { const s = clamp(u); return [180 + s * 900, 900 + Math.max(0, s - .3) ** 2 * 2200]; };
  const ang = (u: number) => { const a = path(u), b = path(u + .02); return Math.atan2(b[1] - a[1], b[0] - a[0]) * 57; };
  return <Frame t={t} vign={.8} grade="#2a0a10" gradeK={.08}>
    <g transform={`translate(0 ${-camY})`}>
      <rect y={-200} width={1080} height={3200} fill="#05030a" />
      <rect y={1500} width={1080} height={1500} fill="#2a0408" opacity={.6} filter="url(#blur30)" />
      <Vortex t={t} x={540} y={2350} s={1.5} eye={ease(t, 2.6, 3.6)} />
      {[0, 1, 2, 3].map(i => <Tentacle key={i} t={t} x0={360 + i * 120} y0={2300} x1={300 + i * 160 + Math.sin(t + i) * 60} y1={2300 - ease(t, 2.8 + i * .15, 4.2) * (700 + i * 90)} w={70 - i * 8} seed={i} />)}
      <Motes t={t} x={540} y={2400} w={1080} h={1600} n={60} color="#ff8a6a" speed={-160} />
      <Cliffs t={t} par={tilt * .2} />
      {/* тоннель и обрыв рельсов */}
      <path d="M0 560 L240 560 L240 1000 L0 1000Z" fill="#0a0808" /><ellipse cx={240} cy={800} rx={60} ry={190} fill="#000" />
      <path d="M240 960 L420 960" stroke="#7a6a60" strokeWidth={12} /><path d="M420 960 q30 10 50 60 M410 960 q20 30 10 90" stroke="#7a6a60" strokeWidth={9} fill="none" />
      {q > .1 && q < .45 && Array.from({ length: 14 }).map((_, i) => { const a = -.6 - h1(i + Math.floor(t * 20)) * 1.4, r = 40 + h1(i * 3 + Math.floor(t * 20)) * 140; return <line key={i} x1={420} y1={960} x2={420 + Math.cos(a) * r} y2={960 + Math.sin(a) * r} stroke="#ffd080" strokeWidth={4} filter="url(#glow)" />; })}
      {[3, 2, 1, 0].map(i => { const u = q * 1.15 - i * .3; if (u < 0) return null; const [x, y] = path(u); return <Car key={i} x={x} y={y} s={.6} rot={ang(u)} head={i === 0} />; })}
    </g>
  </Frame>;
};

// i2: внутри падающего вагона — всё наклонено, в окнах красное; щупальце пробивает окно и утаскивает Лёху
export const I2: React.FC<SP> = ({ t }) => {
  const smash = .8, grab = ease(t, 1.0, 1.4), yank = clamp((t - 1.5) / .4) ** 2, [sx, sy] = shakeXY(t, [[0, 10, 3], [smash, 36, .5], [1.5, 30, .4]]);
  return <Frame t={t} grade="#3a0a10" gradeK={.15} impact={isImpact(t, smash, 3)} over={<Flash t={t} t0={smash} dur={.2} color="#ff4a3a" max={.5} />}>
    <g transform={`translate(540 960) rotate(${-28 + noise('ir', t, 1) * 4}) translate(-540 -960) translate(${sx} ${sy})`}>
      <g transform={cam(1.15, 540, 1050)}>
        <TrainInterior t={t} flicker={1} red={2} shake={4} />
        <rect width={1080} height={1920} fill="#2a0206" opacity={.35} />
        {t > smash && <g>{Array.from({ length: 20 }).map((_, i) => { const q = clamp((t - smash) / 1.2), a = h1(i * 3) * Math.PI * 2, r = 100 + h1(i * 7) * 600; const x = 900 + Math.cos(a) * r * q, y = 700 + Math.sin(a) * r * q; return <polygon key={i} points={`${x},${y - 14} ${x + 10},${y + 6} ${x - 8},${y + 8}`} fill="#c8d0e0" opacity={1 - q} />; })}
          <Tentacle t={t} x0={1200} y0={600} x1={900 - grab * 300 + yank * 600} y1={700 + grab * 400 - yank * 300} w={90} seed={3} /></g>}
        <g transform={`translate(${yank * 700} ${-yank * 400}) rotate(${yank * 60} 600 1500)`}><H t={t} w="r2" dx={0} pose={t < 1.0 ? { ...POSES.stand, armL: [-160, 10] } : { ...POSES.hit, armL: [-120, 40], armR: [-140, 30] }} expr={t < 1.0 ? 'scared' : 'shout'} mouth={t > 1.0 ? .9 : 0} /></g>
        {t > 1.4 && <Spray t={t} t0={1.4} x={700} y={1100} dir={-.6} seed={44} pow={700} />}
        <H t={t} w="kirill" pose={{ ...POSES.stand, armR: [165, -5], armL: [-60, 90] }} expr={t > 1.2 ? 'shout' : 'scared'} turn={.4} lookX={.8} />
        <H t={t} w="timur" dx={150} pose={{ ...POSES.stand, crouch: 60, armR: [160, -10] }} expr="cry" />
      </g>
    </g>
  </Frame>;
};

// i3: щупальца тянутся сквозь окна не к людям — к голове-фонарю на полу; она разгорается; Кирилл понимает
export const I3: React.FC<SP> = ({ t }) => {
  const glow = .4 + ease(t, .3, 2.5) * .6, reach = ease(t, .2, 3.0);
  return <Frame t={t} grade="#3a0a10" gradeK={.12}>
    <g transform={`translate(540 960) rotate(-20) translate(-540 -960)`}>
      <g transform={cam(1.2 + t * .05, 560, 1450, 0, -200)}>
        <TrainInterior t={t} flicker={1} red={2} shake={3} />
        <rect width={1080} height={1920} fill="#2a0206" opacity={.35} />
        <circle cx={560} cy={1560} r={260} fill="#ff8a4a" opacity={.35 * glow} filter="url(#blur30)" />
        <LanternHead t={t} x={560} y={1560} s={1.5} broken />
        {[[1150, 700, 1], [-80, 800, 2], [1150, 1200, 3]].map(([x0, y0, sd], i) => <Tentacle key={i} t={t} x0={x0} y0={y0} x1={x0 + (560 - x0) * reach * .85} y1={y0 + (1520 - y0) * reach * .85} w={60} seed={sd} />)}
        <H t={t} w="kirill" pose={{ ...POSES.stand, armR: [165, -5] }} expr="determined" lookY={.8} lookX={.4} turn={.3} />
      </g>
    </g>
  </Frame>;
};

// i4: Кирилл хватает голову-фонарь (дым от ладоней), щупальце пробивает ему бок — кровь; он вышвыривает фонарь в разбитое окно: «Забирай!»
export const I4: React.FC<SP> = ({ t }) => {
  const c = caps('i4'), pierce = 1.0, thr = 2.0, q = clamp((t - thr) / .5), [sx, sy] = shakeXY(t, [[pierce, 30, .5], [thr, 20, .4]]);
  const pose = PK(t, [[0, { armL: [-60, 80], armR: [60, -80], crouch: 60, lean: 10 }], [pierce, { ...POSES.hit, armL: [-60, 80], armR: [60, -80] }], [thr - .3, { armR: [-40, -60], armL: [-80, 40], lean: -14 }], [thr, { armR: [150, -10], armL: [-40, 20], lean: 16 }]]);
  const w = wristR(pose, KC.w || 1);
  return <Frame t={t} grade="#3a0a10" gradeK={.12} impact={isImpact(t, pierce, 3)} over={<Splat t={t} t0={pierce + .05} seed={51} n={4} k={.8} />}>
    <g transform={cam(1.1, 540, 1150, sx, sy - 120)}>
      <TrainInterior t={t} flicker={1} red={2} shake={3} />
      <rect width={1080} height={1920} fill="#2a0206" opacity={.35} />
      <Tentacle t={t} x0={-100} y0={1500} x1={t < pierce ? -100 + ease(t, .5, pierce) * 560 : 480} y1={t < pierce ? 1500 - ease(t, .5, pierce) * 60 : 1440} w={60} seed={7} spike />
      {t > pierce && <Spray t={t} t0={pierce} x={520} y={1440} dir={.4} seed={61} pow={600} />}
      <Figure x={540} y={2050} s={1.55} t={t} L={{ ...KL, bruise: true }} C={KC} pose={pose} expr={t < pierce ? 'determined' : t < thr - .2 ? 'pain' : 'shout'} mouth={talk(t, c, 'КИРИЛЛ')} seed={3} turn={.2}
        prop={t < thr + .05 ? <g transform={`translate(${w[0]} ${w[1]})`}><LanternHead t={t} x={0} y={-20} s={.6} broken /><Smoke t={t} t0={0} x={0} y={-40} n={5} r={30} spread={50} color="#5a5458" life={1.2} rise={160} k={.6} seed={9} /></g> : undefined} />
      {t > thr && <LanternHead t={t} x={540 + q * 700} y={1000 - q * 500} s={.9 * (1 - q * .6)} broken />}
      {t > pierce && <rect x={510} y={1420} width={30} height={60} fill="#a80c18" />}
    </g>
  </Frame>;
};

// i5: снаружи — фонарь падает в глаз; щупальца бросают поезд и ныряют за ним; воронка сжимается, красное → синяя вспышка: Врата выбрасывают вагон
export const I5: React.FC<SP> = ({ t }) => {
  const fall = ease(t, 0, 1.2, (k: number) => k * k), close = ease(t, 1.4, 2.4), flash = 2.4;
  return <Frame t={t} vign={.9} over={<Flash t={t} t0={flash} dur={.6} color="#bfe8ff" max={1} />}>
    <rect width={1080} height={1920} fill="#05030a" />
    {t < flash ? <g>
      <Vortex t={t * (1 + close * 3)} x={540} y={1500} s={1.3 * (1 - close * .7)} eye={1 - close} />
      {[0, 1, 2, 3].map(i => <Tentacle key={i} t={t} x0={420 + i * 80} y0={1500} x1={300 + i * 160} y1={1500 - (900 - i * 80) * (1 - ease(t, .8, 1.6))} w={60} seed={i} />)}
      <LanternHead t={t} x={560} y={500 + fall * 1000} s={.5 * (1 - fall * .5)} broken />
      <Car x={760} y={500 - ease(t, 1.0, 2.4) * 300} s={.5} rot={30 - close * 40} />
      <Cliffs t={t} par={0} />
    </g> : <g>
      <Gate x={540} y={760} s={1.6} t={t} />
      <Car x={540} y={760 + (t - flash) * 600} s={.5 + (t - flash) * .3} rot={-20 + (t - flash) * 60} />
      <Motes t={t} x={540} y={1200} w={1080} h={1400} n={50} color="#7fe0ff" speed={300} />
    </g>}
  </Frame>;
};

// i6: станция «Северная» — Кирилл лежит в обломках, бок в крови; Тимур трясёт его: «Кирилл! Не умирай!»; в глазах темнеет
export const I6: React.FC<SP> = ({ t }) => {
  const c = caps('i6'), dark = ease(t, 2.0, 3.4);
  return <Frame t={t} grade="#1a1a2a" gradeK={.15} over={<Lids k={dark * .85} />}>
    <g transform={cam(1.05 + t * .03, 540, 1100)}>
      <MetroStation t={t} />
      <rect width={1080} height={1920} fill="#05060c" opacity={.5} />
      <Pool x={460} y={1580} k={.4 + ease(t, 0, 3) * .4} w={300} />
      <g transform="rotate(-90 860 1560)"><Figure x={860} y={1560} s={.85} t={t} L={{ ...KL, bruise: true, skin: '#e0ccc4' }} C={KC} pose={POSES.fallen} expr="pain" lid={.4 - dark * .4} noBlink seed={3} /></g>
      <Figure x={760} y={1700} s={1.0} t={t} L={LK.timur} C={CS.timur} pose={{ ...POSES.stand, crouch: 200, armL: [-60, 100], armR: [-30, 80], lean: -20 }} expr="cry" tears={1} mouth={talk(t, c, 'ТИМУР')} turn={-.6} lookX={-.8} lookY={.5} seed={41} />
      {Array.from({ length: 10 }).map((_, i) => <rect key={i} x={300 + h1(i) * 500} y={1580 + h1(i * 3) * 120} width={30 + h1(i * 5) * 40} height={20} fill="#3a3a44" transform={`rotate(${h1(i * 7) * 90} ${300 + h1(i) * 500} 1600)`} />)}
    </g>
  </Frame>;
};

// i7: темнота; синее окно — «Скрытое условие выполнено. Вы выбраны Игроком. Принять?» → «Да…» → ДА вспыхивает
export const I7: React.FC<SP> = ({ t, d }) => {
  const c = caps('i7'), yes = c?.[0] ? c[0][2] + .3 : 2.6, flash = yes + .2;
  return <Frame t={t} vign={1} over={<Flash t={t} t0={flash} dur={.5} color="#9fe0ff" max={.7} />}>
    <rect width={1080} height={1920} fill="#010208" />
    <ellipse cx={540} cy={820} rx={600} ry={400} fill="#1a4aaa" opacity={.25 + ease(t, flash, flash + .3) * .3} filter="url(#blur30)" />
    <SysWin t={t} t0={.3} y={760} w={880} title="СКРЫТОЕ УСЛОВИЕ ВЫПОЛНЕНО" lines={['Вы выбраны Игроком.', 'Принять?']} size={56} />
    <g opacity={ease(t, 1.4, 1.7)}>
      {[['ДА', 360, t > yes], ['НЕТ', 720, false]].map(([s, x, on]) => <g key={s as string} transform={`translate(${x} 1000) scale(${on ? 1 + spr(t, yes, { damping: 10 }) * .12 : 1})`}>
        <rect x={-140} y={-56} width={280} height={112} rx={10} fill={on ? '#5fd2ff' : '#06182e'} opacity={.9} stroke="#5fd2ff" strokeWidth={4} filter="url(#glow)" />
        <text y={20} textAnchor="middle" fontFamily="Mont" fontWeight={800} fontSize={56} fill={on ? '#06182e' : '#e8f8ff'}>{s as string}</text></g>)}
    </g>
    {t > flash + .3 && <SysWin t={t} t0={flash + .3} y={1300} w={760} lines={['Контракт принят.']} size={50} />}
  </Frame>;
};

// j1: больница — белая палата, кардиомонитор, за окном ночная Москва; Настя спит у кровати; Кирилл открывает глаза, приподнимает повязку — раны нет
export const J1: React.FC<SP> = ({ t }) => {
  const open = ease(t, .8, 1.6), lift = ease(t, 2.6, 3.6), beep = (t * 1.1) % 1;
  return <Frame t={t} grade="#1a2a3a" gradeK={.08}>
    <g transform={cam(1.0 + t * .02, 540, 1000, 0, -120)}>
      <rect width={1080} height={1920} fill="#cfd6de" /><rect y={1300} width={1080} height={620} fill="#9aa4ae" />
      <rect x={620} y={260} width={380} height={520} fill="#0a1428" stroke="#e8eef4" strokeWidth={16} />
      <g transform="translate(620 260)"><Vysotka x={200} y={520} s={.5} lit={.8} star /><circle cx={300} cy={80} r={20} fill="#e8f0ff" /></g>
      {/* монитор */}
      <rect x={80} y={420} width={260} height={180} rx={10} fill="#0a1410" stroke="#3a4448" strokeWidth={8} />
      <path d={`M100 520 ${Array.from({ length: 20 }).map((_, i) => { const x = 100 + i * 11, u = ((i / 20) - beep + 1) % 1; return `L${x} ${520 - (u < .06 ? 60 : u < .1 ? -30 : 0)}`; }).join(' ')}`} stroke="#3aff8a" strokeWidth={4} fill="none" filter="url(#glow)" />
      {/* кровать */}
      <rect x={120} y={1200} width={860} height={140} rx={20} fill="#e8eef4" stroke="#8a949e" strokeWidth={6} /><rect x={120} y={1340} width={860} height={40} fill="#6a747e" />
      <g transform="translate(300 1120) rotate(-90)"><Head t={t} L={{ ...LK.kWeak, plaster: false, tired: false }} expr="calm" seed={3} lid={open} noBlink={open < 1} /></g>
      <path d="M380 1130 Q640 1080 960 1150 L960 1220 L380 1220Z" fill="#f4f8fc" stroke="#a8b2bc" strokeWidth={4} />
      {/* повязка приподнимается — под ней чистая кожа */}
      <g transform={`translate(560 ${1150 - lift * 40})`}><rect x={-60} y={-30} width={120} height={50} rx={8} fill="#f8f0e8" stroke="#c8b8a8" strokeWidth={3} opacity={1 - lift * .3} /></g>
      {lift > .3 && <rect x={500} y={1130} width={120} height={40} rx={10} fill="#f0d4c4" opacity={lift} />}
      {/* Настя спит на краю кровати */}
      <Figure x={820} y={1700} s={.9} t={t} L={LK.nastya} C={CS.nastya} pose={{ ...POSES.stand, crouch: 220, lean: -40, armL: [-150, 60], armR: [-120, 50] }} expr="calm" lid={0} noBlink seed={9} turn={-.5} />
    </g>
  </Frame>;
};

// j2: крупно лицо Кирилла в синем отсвете; над кроватью — окно Игрока
export const J2: React.FC<SP> = ({ t }) => (
  <Frame t={t} grade="#0a1a3a" gradeK={.15}>
    <rect width={1080} height={1920} fill="#0c1424" />
    <g transform={cam(1.0 + t * .04, 540, 1300)}><g transform="translate(540 1400) scale(5)"><Head t={t} L={{ ...LK.kWeak, plaster: false, tired: false }} expr="scared" seed={3} lookY={-.8} glow={ease(t, 1.2, 2.2) * .6} /></g></g>
    <ellipse cx={540} cy={600} rx={600} ry={400} fill="#1a6aff" opacity={.25} filter="url(#blur30)" />
    <SysWin t={t} t0={.4} y={560} w={880} title="ИГРОК" lines={['Кирилл Волков', 'Уровень 1', 'Ежедневное задание: получено']} size={54} />
  </Frame>
);

// j3: финальная плашка
export const J3: React.FC<SP> = ({ t }) => (
  <Frame t={t} vign={1}>
    <rect width={1080} height={1920} fill="#02030a" />
    <ellipse cx={540} cy={900} rx={800} ry={600} fill="#1a3a8a" opacity={.3} filter="url(#blur30)" />
    <g opacity={ease(t, .2, .7)}>
      <text x={540} y={900} textAnchor="middle" fontFamily="CormSC, serif" fontWeight={700} fontSize={140} letterSpacing={4} fill="#f4fbff" filter="url(#glow)">ОДИНОЧКА</text>
      <line x1={200} x2={880} y1={950} y2={950} stroke="#5fd2ff" strokeWidth={3} filter="url(#glow)" />
      <text x={540} y={1020} textAnchor="middle" fontFamily="Oswald" fontWeight={300} fontSize={42} letterSpacing={16} fill="#9fdcff">СЕРИЯ 3 — СКОРО</text>
      <text x={540} y={1120} textAnchor="middle" fontFamily="Mont" fontWeight={700} fontSize={40} fill="#e8f8ff">Что даст ему Система? Пиши в комментах</text>
    </g>
  </Frame>
);
