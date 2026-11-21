// Серия 2 v6: середина без Депо. Поезд едет дальше (Михалыч возмущён) → пассажиры возвращаются в темноте → правило «двигаются только в темноте» →
// Михалыч держит огонь («Пока горю — идите. Остановите поезд») и гибнет → кабина: фонарь сам ползёт за ними → Лёха тянет тормоз, поезд разгоняется →
// стекло лопается, щупальце забирает Лёху → пропасть → в падающей кабине щупальце хватает Кирилла (бок), фонарь ползёт к щупальцу → «Забирай!»
import React from 'react';
import { clamp, ease, noise } from '../anim';
import { cam, Flash, h1, isImpact, shakeXY, SpeedLines } from '../kit/fx';
import { Figure, PK, POSES } from '../chars/body';
import { Head } from '../chars/head';
import { LK, CS } from '../chars/cast';
import { TrainInterior } from '../bg/places';
import { Frame, SP } from '../ep1/common';
import { Faceless, KL } from '../ep1/ShotsF';
import { G, H } from './team';
import { caps, talk } from './timeline';
import { Spray, Splat } from './ShotsC';
import { inHand, LanternHead, Tentacle } from './ShotsE';
import { Cab } from '../ep2v/Shots';

const KC = CS.porterY;
const Car: React.FC<{ t: number; dark?: number; red?: number; fl?: number; shake?: number }> = ({ t, dark = 0, red = 0, fl = .3, shake = 2 }) => <g><TrainInterior t={t} flicker={fl} red={red} shake={shake} /><rect width={1080} height={1920} fill="#020205" opacity={dark} /></g>;
const off = (t: number, rate = 2.4, duty = .4) => ((t * rate) % 1) < duty;

// f2 (v6): рывок — поезд снова едет; Михалыч в ярости тычет в табло «1 остановка»: «Какого?.. Была же одна остановка! Почему он едет?!»; к концу свет начинает мигать
export const F2: React.FC<SP> = ({ t, d }) => {
  const c = caps('f2'), [sx, sy] = shakeXY(t, [[.2, 30, .5], [.7, 8, 3]]), bl = t > d - .9 && off(t, 4);
  return <Frame t={t} grade="#1a1a2a" gradeK={.12} impact={isImpact(t, .2, 2)}>
    <g transform={cam(1.1, 540, 1100, sx, sy - 120)}>
      <Car t={t} dark={bl ? .8 : .25} fl={.6} shake={5} />
      <H t={t} w="mikh" pose={PK(t, [[0, { ...POSES.hit, lean: -14 }], [.8, { armR: [150, -10], lean: 6 }]])} expr="angry" mouth={talk(t, c, 'МИХАЛЫЧ')} turn={-.3} lookY={-.7} />
      <H t={t} w="kirill" pose={t < .4 ? { ...POSES.hit, lean: -10 } : POSES.tense} expr="scared" lookY={-.5} turn={.2} />
      <H t={t} w="timur" pose={POSES.hit} expr="scared" /><H t={t} w="r2" pose={POSES.tense} expr="scared" lookY={-.4} />
    </g>
    <g transform="translate(540 360)" opacity={ease(t, .6, .9)}><rect x={-420} y={-110} width={840} height={220} rx={14} fill="#e8e8e0" stroke="#2a2e38" strokeWidth={8} />
      <text y={-20} textAnchor="middle" fontFamily="Mont" fontWeight={800} fontSize={56} fill="#c81e2a" letterSpacing={6}>СЕВЕРНАЯ → КОНЕЧНАЯ</text>
      <text y={60} textAnchor="middle" fontFamily="Mont" fontWeight={700} fontSize={44} fill="#2a2e38">1 остановка · без пересадок</text>
      {t > 1.2 && <line x1={-300} x2={-300 + 600 * ease(t, 1.2, 1.6)} y1={45} y2={45} stroke="#c81e2a" strokeWidth={8} />}</g>
  </Frame>;
};

// h3: свет мигает — на пустых сиденьях вспышками проступают безликие пассажиры
export const H3: React.FC<SP> = ({ t }) => { const o = off(t);
  return <Frame t={t} grade="#1a1a2a" gradeK={.12}><g transform={cam(1.0 + t * .02, 540, 1100, 0, -120)}>
    <Car t={t} dark={o ? .82 : .2} fl={1} />
    {[[140, 1290, .8], [940, 1310, .8], [300, 1170, .62], [790, 1180, .62], [420, 1090, .5], [660, 1095, .5]].map(([x, y, s], i) => <g key={i} opacity={o ? 1 : .18}><Faceless x={x} y={y} s={s} t={t} seed={i + 40} lift={.3 + i * .1} /></g>)}
    {['r2', 'timur', 'kirill', 'mikh'].map(w => <H key={w} t={t} w={w} pose={POSES.tense} expr="scared" lookY={-.4} rim={o ? '#6a8ab0' : undefined} />)}
  </g></Frame>; };
// h4: с каждым миганием они ближе — уже в проходе; Тимур: «Они… снова здесь.»
export const H4: React.FC<SP> = ({ t }) => { const c = caps('h4'), o = off(t, 2.6), step = Math.floor(t * 2.6);
  return <Frame t={t} grade="#1a1a2a" gradeK={.12}><g transform={cam(1.05, 540, 1100, 0, -120)}>
    <Car t={t} dark={o ? .85 : .25} fl={1} />
    {Array.from({ length: 5 }).map((_, i) => { const k = Math.min(1.2, .45 + step * .1 + (i % 2) * .05); return <g key={i} opacity={o ? 1 : .35}><Faceless x={540 + (i - 2) * 200 * k} y={1100 + k * 400} s={k} t={t} seed={i + 50} lift={1} lunge={.25 * Math.min(1, step / 6)} grin={step > 5 ? .5 : 0} /></g>; })}
    <H t={t} w="timur" pose={POSES.tense} expr="scared" mouth={talk(t, c, 'ТИМУР')} tears={.5} rim="#6a8ab0" />
    {['r2', 'kirill', 'mikh'].map(w => <H key={w} t={t} w={w} pose={POSES.guard} expr="scared" lookY={-.3} rim="#6a8ab0" />)}
  </g></Frame>; };
// h5: Кирилл понимает правило — в свете они замирают; молния Лёхи держит их; «Они двигались только в темноте.» → «Свет! Держите свет!»
export const H5: React.FC<SP> = ({ t }) => { const c = caps('h5'), bolt = Math.floor(t * 8) % 3 !== 0;
  return <Frame t={t} grade="#1a1a2a" gradeK={.12}><g transform={cam(1.0, 540, 1100, 0, -120)}>
    <Car t={t} dark={.75} fl={1} />
    <ellipse cx={G.r2[0]} cy={1100} rx={520} ry={620} fill="#8fd8ff" opacity={bolt ? .28 : .12} filter="url(#blur30)" />
    {Array.from({ length: 5 }).map((_, i) => <Faceless key={i} x={540 + (i - 2) * 230} y={1520} s={1.0} t={0} seed={i + 60} lift={1} lunge={.35} />)}
    <H t={t} w="r2" pose={POSES.raiseL} expr="angry" rim="#8fd8ff" />
    {bolt && <path d={`M${G.r2[0] - 60} 1050 l-30 -120 l40 -10 l-30 -140`} stroke="#bff0ff" strokeWidth={8} fill="none" filter="url(#glow)" />}
    <H t={t} w="kirill" pose={PK(t, [[0, 'tense'], [1.6, { armR: [120, -10], lean: 8 }]])} expr={t > 1.6 ? 'shout' : 'determined'} mouth={talk(t, c, 'КИРИЛЛ')} rim="#8fd8ff" prop={inHand(POSES.tense, 0)} />
    <H t={t} w="timur" pose={POSES.tense} expr="scared" rim="#8fd8ff" /><H t={t} w="mikh" pose={POSES.guard} expr="determined" rim="#8fd8ff" />
  </g></Frame>; };
// h6: Михалыч — единственный свет: огонь в ладонях; остальные пятятся к двери кабины; огонь слабеет; «Пока горю — идите. Остановите поезд.»
export const H6: React.FC<SP> = ({ t, d }) => { const c = caps('h6'), fire = 1 - ease(t, d - 1.4, d - .1), back = ease(t, .3, d);
  return <Frame t={t} grade="#2a1408" gradeK={.1}><g transform={cam(1.0, 540, 1100, 0, -120)}>
    <Car t={t} dark={.8 - fire * .45} fl={0} />
    <ellipse cx={780} cy={1200} rx={560 * fire + 60} ry={700 * fire + 80} fill="#ff8a2a" opacity={.3} filter="url(#blur30)" />
    {Array.from({ length: 4 }).map((_, i) => <Faceless key={i} x={760 + (i - 1.5) * 200} y={1250 + (1 - fire) * 200} s={.75 + (1 - fire) * .3} t={0} seed={i + 70} lift={1} lunge={.4 + (1 - fire) * .4} />)}
    <H t={t} w="mikh" pose={{ ...POSES.hold, armL: [-40, 120], armR: [40, -120] }} expr="determined" mouth={talk(t, c, 'МИХАЛЫЧ')} turn={-.5} lookX={-.8} rim="#ff8a2a" />
    <g transform={`translate(${G.mikh[0]} ${G.mikh[1] - 560})`}>{Array.from({ length: 6 }).map((_, i) => <ellipse key={i} cx={Math.sin(t * 9 + i) * 8} cy={-i * 14 * fire} rx={34 * fire} ry={50 * fire} fill={i % 2 ? '#ffb040' : '#ff6a1a'} opacity={.85} filter="url(#glow)" />)}</g>
    <g transform={`translate(${-back * 260} 0)`}>{['r2', 'timur', 'kirill'].map(w => <H key={w} t={t} w={w} pose={POSES.tense} expr={w === 'kirill' ? 'cry' : 'scared'} lookX={.8} turn={.5} rim="#ff8a2a" />)}</g>
  </g></Frame>; };
// h7: огонь гаснет — темнота, руки безликих смыкаются там, где был Михалыч; крупно Кирилл: «Михалыч!»
export const H7: React.FC<SP> = ({ t }) => { const c = caps('h7'), grab = ease(t, .1, .8);
  return <Frame t={t} vign={1} over={<Splat t={t} t0={.6} seed={77} n={4} k={.7} />}>
    <rect width={1080} height={1920} fill="#020205" />
    <circle cx={780} cy={1200} r={90 * (1 - ease(t, 0, .4))} fill="#ff8a2a" opacity={.7} filter="url(#blur30)" />
    {Array.from({ length: 12 }).map((_, i) => { const a = i / 12 * Math.PI * 2, r = 460 - grab * 330; return <g key={i}><path d={`M${780 + Math.cos(a) * 760} ${1200 + Math.sin(a) * 760} L${780 + Math.cos(a) * r} ${1200 + Math.sin(a) * r}`} stroke="#c8c4bc" strokeWidth={16} strokeLinecap="round" opacity={.7} />
      {[-1, 0, 1].map(f => <path key={f} d={`M${780 + Math.cos(a) * r} ${1200 + Math.sin(a) * r} l${Math.cos(a + f * .4) * -30} ${Math.sin(a + f * .4) * -30}`} stroke="#c8c4bc" strokeWidth={6} strokeLinecap="round" />)}</g>; })}
    <g transform="translate(300 700) scale(4)" opacity={ease(t, .7, 1.0)}><Head t={t} L={KL} expr="shout" seed={3} mouth={Math.max(.6, talk(t, c, 'КИРИЛЛ'))} tears={.8} /></g>
  </Frame>; };
// h8: Кирилл, Тимур и Лёха вваливаются в кабину машиниста: «В кабину!»
export const H8: React.FC<SP> = ({ t }) => { const c = caps('h8'), hit = .5, [sx, sy] = shakeXY(t, [[hit, 24, .4]]), run = ease(t, 0, 1.6);
  return <Frame t={t} grade="#1a1a2a" gradeK={.12} impact={isImpact(t, hit, 2)}><g transform={cam(1.0 + t * .08, 540, 1000, sx, sy - 100)}>
    <Car t={t} dark={.55} fl={1} />
    <rect x={430} y={600} width={220} height={440} fill={t > hit ? '#3a0a08' : '#5a5e68'} stroke="#2a2e38" strokeWidth={10} /><text x={540} y={660} textAnchor="middle" fontFamily="Mont" fontWeight={800} fontSize={24} fill="#c81e2a">КАБИНА</text>
    {t > hit && <ellipse cx={540} cy={820} rx={120} ry={200} fill="#ff4a2a" opacity={.25} filter="url(#blur30)" />}
    <g transform={`translate(0 ${-run * 120}) scale(${1 - run * .1})`}>
      <H t={t} w="r2" pose={PK(t, [[0, 'stand'], [.3, { armL: [-80, 60], lean: 22 }]])} expr="angry" lookY={-.5} />
      <H t={t} w="kirill" pose={{ ...POSES.stand, armR: [140, -20], lean: 10 }} expr="shout" mouth={talk(t, c, 'КИРИЛЛ')} turn={.3} />
      <H t={t} w="timur" pose={POSES.hit} expr="scared" />
    </g>
  </g></Frame>; };
// h9: позади по полу вагона со скрежетом ползёт разбитый фонарь — сам — и вкатывается в кабину, пока закрывается дверь; «Фонарь… полз за нами.»
export const H9: React.FC<SP> = ({ t, d }) => { const crawl = ease(t, 0, d - .6, (k: number) => k), door = ease(t, d - 1.0, d - .2);
  return <Frame t={t} grade="#1a1018" gradeK={.12}><g transform={cam(1.25, 540, 1500, 0, -200)}>
    <Car t={t} dark={.6} fl={1} />
    <circle cx={200 + crawl * 640} cy={1580} r={220} fill="#ff8a4a" opacity={.25} filter="url(#blur30)" />
    <g transform={`rotate(${noise('lc', t, 6) * 10} ${200 + crawl * 640} 1580)`}><LanternHead t={t} x={200 + crawl * 640} y={1580} s={1.2} broken /></g>
    <path d={`M200 1640 L${200 + crawl * 640} 1640`} stroke="#3a3030" strokeWidth={6} strokeDasharray="12 10" opacity={.8} />
    <rect x={880} y={700} width={240} height={1100} fill="#3a0a08" stroke="#2a2e38" strokeWidth={10} />
    <rect x={880 - (1 - door) * 0} y={700} width={240 * door} height={1100} fill="#5a5e68" stroke="#2a2e38" strokeWidth={10} />
  </g></Frame>; };

// k2: в кабине Лёха тянет рычаг тормоза, рычаг рвётся из рук; за стеклом летит тоннель
export const K2: React.FC<SP> = ({ t }) => { const pull = ease(t, .3, 1.0) - Math.max(0, Math.sin(t * 7)) * .15 * ease(t, 1.0, 1.4);
  return <Frame t={t} grade="#1a1a2a" gradeK={.1}><g transform={cam(1.05, 540, 1100)}>
    <Cab t={t} speed={.5} />
    <g transform={`rotate(${-30 + pull * 50} 420 1240)`}><rect x={408} y={980} width={24} height={260} fill="#8a8e98" stroke="#2a2e38" strokeWidth={4} /><circle cx={420} cy={980} r={30} fill="#c81e2a" stroke="#2a0a0a" strokeWidth={4} /></g>
    <Figure x={640} y={2100} s={1.4} t={t} L={LK.r2} C={CS.r2} pose={{ ...POSES.stand, armL: [-150, 30], armR: [-130, 20], lean: -16, crouch: 60 }} expr="shout" mouth={.4} seed={22} turn={-.4} />
    <Figure x={100} y={2160} s={1.1} t={t} L={KL} C={KC} pose={POSES.tense} expr="scared" seed={3} turn={.5} lookX={.8} />
  </g></Frame>; };
// k3: спидометр ползёт вверх, тоннель мелькает быстрее — поезд разгоняется; «Поезд не тормозил. Он разгонялся.»
export const K3: React.FC<SP> = ({ t, d }) => { const sp = .5 + ease(t, .2, d) * .8, [sx, sy] = shakeXY(t, [[0, 6 + sp * 8, d]]);
  return <Frame t={t} grade="#1a1a2a" gradeK={.1}><g transform={cam(1.0, 540, 900, sx, sy)}><Cab t={t} speed={sp} red={ease(t, d - 1.2, d)} /></g><SpeedLines t={t} cx={540} cy={620} k={sp * .6} /></Frame>; };
// k4: лобовое стекло лопается — красное щупальце врывается и обвивает Лёху, выдёргивает его в проём
export const K4: React.FC<SP> = ({ t }) => { const crack = ease(t, 0, .6), burst = .7, grab = ease(t, burst, burst + .4), yank = clamp((t - 1.5) / .4) ** 2, [sx, sy] = shakeXY(t, [[burst, 36, .6], [1.5, 30, .4]]);
  return <Frame t={t} grade="#2a0a10" gradeK={.12} impact={isImpact(t, burst, 3)} over={<Splat t={t} t0={1.6} seed={88} n={4} k={.8} />}><g transform={cam(1.0, 540, 1050, sx, sy)}>
    <Cab t={t} speed={1.2} crack={t < burst ? crack : 0} red={1} />
    {t > burst && <g>{Array.from({ length: 24 }).map((_, i) => { const q = clamp((t - burst) / 1), a = h1(i * 3) * Math.PI * 2, r = 100 + h1(i * 7) * 700; return <polygon key={i} points={`${600 + Math.cos(a) * r * q},${600 + Math.sin(a) * r * q} ${610 + Math.cos(a) * r * q},${616 + Math.sin(a) * r * q} ${592 + Math.cos(a) * r * q},${614 + Math.sin(a) * r * q}`} fill="#c8d0e0" opacity={1 - q} />; })}
      <Tentacle t={t} x0={600} y0={500} x1={640 - grab * 20 - yank * 40} y1={1250 + grab * 200 - yank * 700} w={100} seed={2} /></g>}
    <g transform={`translate(${-yank * 40} ${-yank * 700}) rotate(${yank * 30} 640 2100)`}><Figure x={640} y={2100} s={1.4} t={t} L={LK.r2} C={CS.r2} pose={{ ...POSES.stand, armL: [-150 + grab * 60, 30], armR: [-130 + grab * 260, 20], lean: -10 }} expr={t > burst ? 'shout' : 'scared'} mouth={t > burst ? .9 : 0} seed={22} turn={-.3} />
      {grab > 0 && [0, 1].map(i => <ellipse key={i} cx={640} cy={1500 + i * 70} rx={130} ry={30} fill="none" stroke="#5a0a12" strokeWidth={28 * grab} />)}</g>
    {t > 1.5 && <Spray t={t} t0={1.5} x={640} y={1300} dir={-.2} seed={41} pow={700} n={40} />}
    <Figure x={120} y={2160} s={1.1} t={t} L={KL} C={KC} pose={t > burst ? POSES.hit : POSES.tense} expr={t > burst ? 'shout' : 'scared'} seed={3} turn={.5} lookX={.8} />
  </g></Frame>; };

// падающая кабина: наклон, красный свет из разбитого стекла
const Fall: React.FC<{ t: number; children: React.ReactNode; sx?: number; sy?: number }> = ({ t, children, sx = 0, sy = 0 }) => <g transform={`translate(540 960) rotate(-24) translate(-540 -960) translate(${sx} ${sy})`}>
  <g transform={cam(1.15, 540, 1050)}><Cab t={t} speed={1.4} red={1.4} /><rect width={1080} height={1920} fill="#2a0206" opacity={.3} />{children}</g></g>;
// k5: кабина падает; щупальце хватает Кирилла за ногу и тащит к проёму; Тимур держит его — «Кирилл! Держись!»; второе щупальце пробивает ему бок
export const K5: React.FC<SP> = ({ t, d }) => { const c = caps('k5'), drag = ease(t, .3, 1.6), pierce = d - 1.0, [sx, sy] = shakeXY(t, [[0, 8, d], [.3, 24, .4], [pierce, 34, .5]]);
  return <Frame t={t} grade="#3a0a10" gradeK={.15} impact={isImpact(t, .3, 2) || isImpact(t, pierce, 3)} over={<Splat t={t} t0={pierce} seed={51} n={4} k={.8} />}>
    <Fall t={t} sx={sx} sy={sy}>
      <Tentacle t={t} x0={600} y0={500} x1={560 + drag * 100} y1={1700 - drag * 200} w={80} seed={9} />
      <g transform={`rotate(${-70 + drag * 10} 560 1880)`}><Figure x={560 + drag * 100} y={1880 - drag * 200} s={1.0} t={t} L={{ ...KL, bruise: true }} C={KC} pose={{ ...POSES.stand, armL: [-170, 0], armR: [-160, 10], legL: [-10, 10], legR: [20, 30] }} expr="pain" seed={3} mouth={t > pierce ? .5 : .2} /></g>
      {t > pierce - .4 && <Tentacle t={t} x0={900} y0={450} x1={t < pierce ? 900 - ease(t, pierce - .4, pierce) * 260 : 640} y1={t < pierce ? 450 + ease(t, pierce - .4, pierce) * 1000 : 1450} w={56} seed={4} spike />}
      {t > pierce && <Spray t={t} t0={pierce} x={640} y={1500} dir={-.4} seed={61} pow={600} n={40} />}
      <Figure x={150} y={1700} s={.9} t={t} L={LK.timur} C={CS.timur} pose={{ ...POSES.stand, armR: [100, -20], armL: [-170, 0], crouch: 60, lean: 30 }} expr="shout" mouth={talk(t, c, 'ТИМУР')} seed={41} turn={.5} lookX={.9} />
    </Fall>
  </Frame>; };
// k6: Кирилл, истекая кровью, видит: разбитый фонарь сам ползёт по полу кабины к щупальцу — «Фонарь полз к нему сам. Оно искало не нас. Оно искало фонарь.»
export const K6: React.FC<SP> = ({ t, d }) => { const crawl = ease(t, .3, d - .3, (k: number) => k);
  return <Frame t={t} grade="#3a0a10" gradeK={.12}>
    <Fall t={t}>
      <Tentacle t={t} x0={600} y0={500} x1={760 - crawl * 60} y1={1300} w={70} seed={3} />
      <circle cx={360 + crawl * 360} cy={1560 - crawl * 160} r={220} fill="#ff8a4a" opacity={.25 + crawl * .2} filter="url(#blur30)" />
      <g transform={`rotate(${noise('lc', t, 6) * 8} ${360 + crawl * 360} ${1560 - crawl * 160})`}><LanternHead t={t} x={360 + crawl * 360} y={1560 - crawl * 160} s={1.1} broken /></g>
      <g transform="rotate(-80 260 1850)"><Figure x={260} y={1850} s={.9} t={t} L={{ ...KL, bruise: true }} C={KC} pose={{ ...POSES.stand, armR: [60, -40] }} expr="pain" lookX={.8} lookY={.2} seed={3} /></g>
      <rect x={210} y={1700} width={80} height={50} rx={14} fill="#a80c18" opacity={.9} />
    </Fall>
  </Frame>; };
// k7: Кирилл бросается на фонарь (дым от ладоней) и вышвыривает его в разбитое стекло: «Забирай!»; щупальце уходит за ним
export const K7: React.FC<SP> = ({ t }) => { const c = caps('k7'), thr = c?.[0] ? c[0][2] + .1 : 1.4, q = clamp((t - thr) / .5), [sx, sy] = shakeXY(t, [[thr, 20, .4]]);
  const pose = PK(t, [[0, { armL: [-60, 80], armR: [60, -80], crouch: 80, lean: 10 }], [thr - .3, { armR: [-40, -60], armL: [-80, 40], lean: -14 }], [thr, { armR: [150, -10], armL: [-40, 20], lean: 16 }]]);
  return <Frame t={t} grade="#3a0a10" gradeK={.12}>
    <Fall t={t} sx={sx} sy={sy}>
      <Figure x={540} y={2050} s={1.5} t={t} L={{ ...KL, bruise: true }} C={KC} pose={pose} expr={t < thr - .2 ? 'pain' : 'shout'} mouth={talk(t, c, 'КИРИЛЛ')} seed={3} turn={.2} />
      {t < thr + .05 && <LanternHead t={t} x={540 + (t > thr - .3 ? 160 : -60)} y={1300 - (t > thr - .3 ? 260 : 0)} s={.7} broken />}
      <rect x={500} y={1420} width={40} height={70} fill="#a80c18" />
      {t > thr && <LanternHead t={t} x={600 + (1 - q) * 100} y={600 + (1 - q) * 500} s={.8 * (1 - q * .6)} broken />}
      {t > thr && <Tentacle t={t} x0={600} y0={420} x1={600 + (1 - q) * 260} y1={420 + (1 - q) * 700} w={60} seed={7} />}
    </Fall>
  </Frame>; };
