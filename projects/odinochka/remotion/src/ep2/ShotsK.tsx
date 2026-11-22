// Серия 2 v7: безликие неуязвимы — их кормит фонарь (оранжевые жилы к фонарю); Михалыч хватает фонарь и сжигает руку; молния Лёхи иссякает;
// Михалыч с обожжённой рукой держит огонь; фонарь сам ползёт ВПЕРЁД к кабине («его звали»); Лёха у тормоза (нормальная поза), его голос;
// в лобовом — красное снизу заранее; стекло режет Тимура; «Лёха!»; Кирилл через боль, сжигая руку, выкидывает фонарь.
import React from 'react';
import { clamp, ease, noise } from '../anim';
import { cam, Flash, h1, isImpact, shakeXY, Smoke, SpeedLines } from '../kit/fx';
import { Figure, PK, POSES } from '../chars/body';
import { Head, INK } from '../chars/head';
import { LK, CS } from '../chars/cast';
import { TrainInterior } from '../bg/places';
import { Frame, SP } from '../ep1/common';
import { Faceless, KL } from '../ep1/ShotsF';
import { G, H } from './team';
import { caps, talk } from './timeline';
import { Pool, Spray, Splat } from './ShotsC';
import { inHand, LanternHead, Tentacle } from './ShotsE';
import { Cab } from '../ep2v/Shots';

const KC = CS.porterY;
const Car: React.FC<{ t: number; dark?: number; red?: number; fl?: number; shake?: number }> = ({ t, dark = 0, red = 0, fl = .3, shake = 2 }) => <g><TrainInterior t={t} flicker={fl} red={red} shake={shake} /><rect width={1080} height={1920} fill="#020205" opacity={dark} /></g>;
const LX = 540, LY = 1700; // где лежит разбитый фонарь в вагоне
// оранжевые жилы от безликих к фонарю (пульсируют)
const Veins: React.FC<{ t: number; from: [number, number][]; to?: [number, number]; k?: number }> = ({ t, from, to = [LX, LY], k = 1 }) => <g opacity={k}>
  {from.map(([x, y], i) => { const mx = (x + to[0]) / 2 + Math.sin(i * 2.3) * 120, my = (y + to[1]) / 2 + 80, d = `M${x} ${y} Q${mx} ${my} ${to[0]} ${to[1]}`;
    return <g key={i}><path d={d} stroke="#ff7a2a" strokeWidth={9} fill="none" opacity={.35} filter="url(#glow)" /><path d={d} stroke="#ffc070" strokeWidth={3} fill="none" strokeDasharray="18 22" strokeDashoffset={-t * 160 - i * 30} /></g>; })}
  <circle cx={to[0]} cy={to[1]} r={160 + Math.sin(t * 6) * 20} fill="#ff8a3a" opacity={.25} filter="url(#blur30)" />
</g>;
const FL: [number, number][] = [[200, 1200], [420, 1150], [660, 1150], [880, 1200], [300, 1050], [780, 1050]];

// h4b: молния Лёхи и огонь Михалыча бьют в безликих — те не рассыпаются, только вспыхивают оранжевым изнутри; «Раньше они рассыпались от одного удара. Теперь — нет.»
export const H4b: React.FC<SP> = ({ t }) => { const fb = .4, bolt = 1.2, glowA = (t > fb + .35 && t < fb + 1) || (t > bolt && t < bolt + .6), fr = Math.floor(t * 30), [sx, sy] = shakeXY(t, [[fb + .35, 18, .4], [bolt, 16, .4]]);
  const fq = clamp((t - fb) / .35);
  return <Frame t={t} grade="#1a1018" gradeK={.12} impact={isImpact(t, fb + .35, 2) || isImpact(t, bolt, 2)} over={<g><Flash t={t} t0={fb + .35} dur={.25} color="#ffb060" max={.4} /><Flash t={t} t0={bolt} dur={.2} color="#bfe8ff" max={.4} /></g>}>
    <g transform={cam(1.05, 540, 1100, sx, sy - 120)}>
      <Car t={t} dark={.55} fl={.6} />
      {Array.from({ length: 4 }).map((_, i) => { const x = 270 + i * 180; return <g key={i}><Faceless x={x} y={1500} s={.95} t={t} seed={i + 80} lift={1} lunge={.3} />{glowA && <ellipse cx={x} cy={1500 - 420} rx={90} ry={260} fill="#ff7a2a" opacity={.35} filter="url(#blur12)" />}</g>; })}
      {t > fb && fq < 1 && <g><circle cx={900 - fq * 360} cy={1500 - fq * 380} r={60} fill="#ff8a2a" filter="url(#glowBig)" /><circle cx={900 - fq * 360} cy={1500 - fq * 380} r={30} fill="#fff4c0" /></g>}
      {t > bolt && t < bolt + .35 && <g><path d={`M160 1500 L${300 + (h1(fr) - .5) * 60} 1250 L${360 + (h1(fr + 1) - .5) * 60} 1150 L450 1100`} stroke="#8fd8ff" strokeWidth={16} fill="none" filter="url(#glowBig)" /><path d={`M160 1500 L${300 + (h1(fr) - .5) * 60} 1250 L${360 + (h1(fr + 1) - .5) * 60} 1150 L450 1100`} stroke="#fff" strokeWidth={5} fill="none" /></g>}
      <g transform="translate(540 2080) scale(.8) translate(-540 -1920)">
        <H t={t} w="mikh" pose={PK(t, [[0, 'guard'], [fb - .2, { armR: [150, -20], lean: 8 }], [fb + .6, 'guard']])} expr="angry" rim="#ff8a2a" lookY={-.5} />
        <H t={t} w="r2" pose={PK(t, [[0, 'guard'], [bolt - .2, { armL: [-150, 20], lean: -6 }], [bolt + .6, 'guard']])} expr="angry" rim="#8fd8ff" lookY={-.5} />
        <H t={t} w="kirill" pose={{ ...POSES.tense, armR: [40, -100] }} expr="scared" prop={inHand({ ...POSES.tense, armR: [40, -100] }, 0)} />
        <H t={t} w="timur" pose={POSES.tense} expr="scared" />
      </g>
    </g>
  </Frame>; };
// h4c: Кирилл видит — от каждого безликого к разбитому фонарю на полу тянутся оранжевые жилы; фонарь разгорается; «Их кормил фонарь.»
export const H4c: React.FC<SP> = ({ t }) => { const k = ease(t, .2, 1.0), z = 1 + ease(t, .8, 2.4) * .35;
  return <Frame t={t} grade="#1a1018" gradeK={.12}><g transform={cam(z, 540, 1500, 0, -260)}>
    <Car t={t} dark={.72} fl={.2} />
    {FL.map(([x, y], i) => <Faceless key={i} x={x} y={y + 300} s={.8} t={t} seed={i + 90} lift={1} />)}
    <Veins t={t} from={FL.map(([x, y]) => [x, y - 60] as [number, number])} k={k} />
    <g transform={`rotate(${noise('lv', t, 5) * 6} ${LX} ${LY})`}><LanternHead t={t} x={LX} y={LY} s={1.1} broken /></g>
  </g></Frame>; };
// h4d: Михалыч бросается к фонарю — хватает, чтобы вышвырнуть в окно; ладонь шипит, дымится, чернеет; роняет: «Он жжёт! Не удержать!»
export const H4d: React.FC<SP> = ({ t }) => { const c = caps('h4d'), grab = .7, drop = 1.7, burn = ease(t, grab, drop), hold = t > grab && t < drop, [sx, sy] = shakeXY(t, [[grab, 14, .3], [drop, 20, .4]]);
  return <Frame t={t} grade="#2a1408" gradeK={.1} impact={isImpact(t, grab, 2)}><g transform={cam(1.5, 560, 1250, sx, sy)}>
    <Car t={t} dark={.6} fl={.2} />
    <circle cx={560} cy={1450} r={300} fill="#ff8a3a" opacity={.3} filter="url(#blur30)" />
    <Figure x={500} y={2000} s={1.15} t={t} L={LK.mikh} C={CS.mikh} pose={PK(t, [[0, { crouch: 120, lean: 14, armR: [60, -40] }], [grab, { crouch: 160, lean: 20, armR: [20, -20] }], [drop, { crouch: 100, lean: -10, armR: [120, -120] }]])} expr={hold ? 'pain' : t > drop ? 'shout' : 'determined'} mouth={talk(t, c, 'МИХАЛЫЧ')} seed={6} turn={.3} rim="#ff8a3a" />
    {/* ладонь и фонарь */}
    <g transform={`translate(${hold ? 640 : 640} ${hold ? 1380 - burn * 40 : 1560})`}>
      <g transform={`rotate(${t > drop ? (t - drop) * 200 : 0})`}><LanternHead t={t} x={0} y={t > drop ? (t - drop) * 400 : 0} s={.55} broken /></g>
      {t > grab && <g><ellipse cx={-30} cy={-50} rx={42} ry={30} fill={`rgb(${236 - burn * 170},${210 - burn * 190},${196 - burn * 180})`} stroke={INK} strokeWidth={4} />
        <Smoke t={t} t0={grab} x={-30} y={-80} n={7} r={40} spread={60} color="#6a6468" life={1.2} rise={240} k={.8} seed={11} />
        {burn > .2 && Array.from({ length: 6 }).map((_, i) => <circle key={i} cx={-30 + (h1(i + Math.floor(t * 15)) - .5) * 60} cy={-70 - (t * 300 + i * 40) % 120} r={4} fill="#ffb060" filter="url(#glow)" />)}</g>}
    </g>
  </g></Frame>; };
// h5b: молния Лёхи сыплет искрами и гаснет — «Всё… пусто. Больше не могу.»; безликие делают шаг
export const H5b: React.FC<SP> = ({ t }) => { const c = caps('h5b'), spark = 1 - ease(t, .3, 1.6), fr = Math.floor(t * 30);
  return <Frame t={t} grade="#1a1a2a" gradeK={.12}><g transform={cam(1.25, G.r2[0] - 100, 1250, 0, -120)}>
    <Car t={t} dark={.82 - spark * .3} fl={0} />
    <ellipse cx={G.r2[0]} cy={1150} rx={400 * spark + 40} ry={500 * spark + 60} fill="#8fd8ff" opacity={.25} filter="url(#blur30)" />
    {spark > .05 && h1(fr) < spark && <path d={`M${G.r2[0] - 70} 1060 l${(h1(fr) - .5) * 60} -60 l${(h1(fr + 1) - .5) * 60} -50`} stroke="#bff0ff" strokeWidth={5} fill="none" filter="url(#glow)" />}
    {Array.from({ length: 3 }).map((_, i) => <Faceless key={i} x={300 + i * 200 - ease(t, 1.4, 2.0) * 60} y={1560} s={1.0} t={0} seed={i + 64} lift={1} lunge={.4 + ease(t, 1.4, 2.0) * .3} />)}
    <H t={t} w="r2" pose={{ ...POSES.stand, armL: [-60 - spark * 90, 40], crouch: 40 * (1 - spark) }} expr="pain" mouth={talk(t, c, 'ЛЁХА')} rim="#8fd8ff" sweat={1} />
  </g></Frame>; };
// h6 (v7): Михалыч прижимает обожжённую руку, огонь — в другой ладони; он единственный свет; ребята пятятся к кабине; «Пока держу огонь — идите. Остановите поезд.»
export const H6: React.FC<SP> = ({ t, d }) => { const c = caps('h6'), fire = 1 - ease(t, d - 1.4, d - .1), back = ease(t, .3, d);
  return <Frame t={t} grade="#2a1408" gradeK={.1}><g transform={cam(1.0, 540, 1100, 0, -120)}>
    <Car t={t} dark={.8 - fire * .45} fl={0} />
    <ellipse cx={780} cy={1200} rx={560 * fire + 60} ry={700 * fire + 80} fill="#ff8a2a" opacity={.3} filter="url(#blur30)" />
    {Array.from({ length: 4 }).map((_, i) => <Faceless key={i} x={760 + (i - 1.5) * 200 + Math.sin(t * 3 + i) * 6} y={1250 + (1 - fire) * 200} s={.75 + (1 - fire) * .3} t={0} seed={i + 70} lift={1} lunge={.4 + (1 - fire) * .4} />)}
    <H t={t} w="mikh" pose={{ ...POSES.stand, armL: [-30, 130], armR: [60, -140] }} expr="determined" mouth={talk(t, c, 'МИХАЛЫЧ')} turn={-.5} lookX={-.8} rim="#ff8a2a" />
    <ellipse cx={G.mikh[0] - 40} cy={G.mikh[1] - 560} rx={34} ry={26} fill="#3a2018" stroke={INK} strokeWidth={4} />
    <g transform={`translate(${G.mikh[0] + 60} ${G.mikh[1] - 590})`}>{Array.from({ length: 6 }).map((_, i) => <ellipse key={i} cx={Math.sin(t * 9 + i) * 8} cy={-i * 14 * fire} rx={34 * fire} ry={50 * fire} fill={i % 2 ? '#ffb040' : '#ff6a1a'} opacity={.85} filter="url(#glow)" />)}</g>
    <g transform={`translate(${-back * 260} 0)`}>{['r2', 'timur', 'kirill'].map(w => <H key={w} t={t} w={w} pose={POSES.tense} expr={w === 'kirill' ? 'cry' : 'scared'} lookX={.8} turn={.5} rim="#ff8a2a" />)}</g>
  </g></Frame>; };
// h9 (v7): разбитый фонарь сам ползёт по полу ВПЕРЁД — мимо ребят, к двери кабины, будто его зовут; «Фонарь полз вперёд. К кабине. Будто его звали.»
export const H9: React.FC<SP> = ({ t, d }) => { const crawl = ease(t, 0, d - .3, (k: number) => k);
  return <Frame t={t} grade="#2a0a0a" gradeK={.1}><g transform={cam(1.15, 540, 1350, 0, -180)}>
    <Car t={t} dark={.35} fl={.7} red={1.4} />
    <rect x={430} y={620} width={220} height={440} fill="#2a0806" stroke="#5a5e68" strokeWidth={10} /><ellipse cx={540} cy={840} rx={150} ry={240} fill="#ff2a1a" opacity={.25 + .1 * Math.sin(t * 5)} filter="url(#blur30)" />
    <text x={540} y={600} textAnchor="middle" fontFamily="Mont" fontWeight={800} fontSize={26} fill="#ff6a5a">КАБИНА</text>
    <circle cx={540} cy={1800 - crawl * 760} r={200 * (1 - crawl * .5)} fill="#ff8a4a" opacity={.35} filter="url(#blur30)" />
    <g transform={`rotate(${noise('lc', t, 6) * 10} 540 ${1800 - crawl * 760})`}><LanternHead t={t} x={540} y={1800 - crawl * 760} s={1.3 - crawl * .7} broken /></g>
    <path d={`M540 1860 L540 ${1860 - crawl * 760}`} stroke="#3a3030" strokeWidth={8} strokeDasharray="14 12" opacity={.7} />
    {[['timur', -280], ['kirill', 300]].map(([w, dx]) => <g key={w as string} transform={`translate(${dx} 0)`}><H t={t} w={w as string} pose={POSES.tense} expr="scared" lookY={.7} turn={dx as number < 0 ? .4 : -.4} lookX={dx as number < 0 ? .7 : -.7} rim="#ff6a5a" /></g>)}
  </g></Frame>; };
// k2 (v7): Лёха всем весом тянет рычаг тормоза на себя, ноги упёрты; рычаг рвётся; «Не тормозит!»
export const K2: React.FC<SP> = ({ t }) => { const c = caps('k2'), pull = ease(t, .3, 1.0) - Math.max(0, Math.sin(t * 7)) * .15 * ease(t, 1.0, 1.4);
  return <Frame t={t} grade="#1a1a2a" gradeK={.1}><g transform={cam(1.05, 540, 1100)}>
    <Cab t={t} speed={.5 + ease(t, 1.0, 2.4) * .3} />
    <g transform={`rotate(${-30 + pull * 50} 420 1240)`}><rect x={408} y={980} width={24} height={260} fill="#8a8e98" stroke="#2a2e38" strokeWidth={4} /><circle cx={420} cy={980} r={30} fill="#c81e2a" stroke="#2a0a0a" strokeWidth={4} /></g>
    <Figure x={680} y={2120} s={1.35} t={t} L={LK.r2} C={CS.r2} pose={{ ...POSES.stand, armL: [-75 + pull * 15, 40], armR: [-60 + pull * 15, 30], legL: [-24, 30], legR: [30, -10], lean: -18 - pull * 6, crouch: 70 }} expr="shout" mouth={talk(t, c, 'ЛЁХА')} seed={22} turn={-.5} lookX={-.8} sweat={1} />
    <Figure x={110} y={2160} s={1.1} t={t} L={KL} C={KC} pose={POSES.tense} expr="scared" seed={3} turn={.5} lookX={.8} />
  </g></Frame>; };
// k3 (v7): разгон — в лобовом стекле снизу, под рельсами, разгорается красное и мелькает тень щупальца; «Поезд не тормозил. Он разгонялся.»
export const K3: React.FC<SP> = ({ t, d }) => { const sp = .5 + ease(t, .2, d) * .8, [sx, sy] = shakeXY(t, [[0, 6 + sp * 8, d]]), sh = ease(t, d - 1.4, d - .4);
  return <Frame t={t} grade="#1a1a2a" gradeK={.1}><g transform={cam(1.0, 540, 900, sx, sy)}>
    <Cab t={t} speed={sp} red={ease(t, .8, d)} />
    {sh > 0 && <path d={`M${200 + sh * 300} 980 Q${400 + sh * 200} ${700 - sh * 200} ${600} ${560 + Math.sin(t * 9) * 30}`} stroke="#3a0408" strokeWidth={46} fill="none" strokeLinecap="round" opacity={.8 * sh} />}
  </g><SpeedLines t={t} cx={540} cy={620} k={sp * .6} /></Frame>; };
// k4 (v7): стекло лопается — осколок режет Тимуру лоб; щупальце обвивает Лёху и выдёргивает; «Лёха!» — и тишина на полсекунды
export const K4: React.FC<SP> = ({ t }) => { const c = caps('k4'), crack = ease(t, 0, .6), burst = .7, grab = ease(t, burst, burst + .4), yank = clamp((t - 1.5) / .4) ** 2, [sx, sy] = shakeXY(t, [[burst, 36, .6], [1.5, 30, .4]]);
  return <Frame t={t} grade="#2a0a10" gradeK={.12} impact={isImpact(t, burst, 3)} over={<Splat t={t} t0={1.6} seed={88} n={3} k={.7} />}><g transform={cam(1.0, 540, 1050, sx, sy)}>
    <Cab t={t} speed={1.2} crack={t < burst ? crack : 0} red={1} />
    {t > burst && <g>{Array.from({ length: 24 }).map((_, i) => { const q = clamp((t - burst) / 1), a = h1(i * 3) * Math.PI * 2, r = 100 + h1(i * 7) * 700; return <polygon key={i} points={`${600 + Math.cos(a) * r * q},${600 + Math.sin(a) * r * q} ${610 + Math.cos(a) * r * q},${616 + Math.sin(a) * r * q} ${592 + Math.cos(a) * r * q},${614 + Math.sin(a) * r * q}`} fill="#c8d0e0" opacity={1 - q} />; })}
      <Tentacle t={t} x0={600} y0={500} x1={680 - yank * 40} y1={1250 + grab * 200 - yank * 700} w={100} seed={2} /></g>}
    <g transform={`translate(${-yank * 40} ${-yank * 700}) rotate(${yank * 30} 680 2120)`}><Figure x={680} y={2120} s={1.35} t={t} L={LK.r2} C={CS.r2} pose={{ ...POSES.stand, armL: [-75 + grab * 20, 40], armR: [-60 + grab * 200, 30], lean: -14 }} expr={t > burst ? 'shout' : 'scared'} mouth={t > burst ? .9 : 0} seed={22} turn={-.3} />
      {grab > 0 && [0, 1].map(i => <ellipse key={i} cx={680} cy={1520 + i * 70} rx={125} ry={30} fill="none" stroke="#5a0a12" strokeWidth={28 * grab} />)}</g>
    {t > 1.5 && <Spray t={t} t0={1.5} x={680} y={1300} dir={-.2} seed={41} pow={700} n={40} />}
    <Figure x={110} y={2160} s={1.1} t={t} L={KL} C={KC} pose={t > burst ? POSES.hit : POSES.tense} expr={t > 1.8 ? 'shout' : 'scared'} mouth={talk(t, c, 'КИРИЛЛ')} seed={3} turn={.5} lookX={.8} />
    <g transform="translate(-150 120)"><Figure x={330} y={2100} s={1.0} t={t} L={LK.timur} C={CS.timur} pose={t > burst ? { ...POSES.hit, armL: [-150, 120] } : POSES.tense} expr="cry" seed={41} turn={.4} />
      {t > burst + .05 && <path transform={`translate(330 ${2100 - 820 + 40})`} d="M-18 -60 l20 6 M-4 -54 q4 30 -2 50" stroke="#a80c18" strokeWidth={5} fill="none" strokeLinecap="round" />}</g>
  </g></Frame>; };

const Fall: React.FC<{ t: number; children: React.ReactNode; sx?: number; sy?: number }> = ({ t, children, sx = 0, sy = 0 }) => <g transform={`translate(540 960) rotate(-20) translate(-540 -960) translate(${sx} ${sy})`}>
  <g transform={cam(1.1, 540, 1050)}><Cab t={t} speed={1.4} red={1.4} /><rect width={1080} height={1920} fill="#2a0206" opacity={.3} />{children}</g></g>;
const TimurCut: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => <path transform={`translate(${x} ${y}) scale(${s})`} d="M-18 -60 l20 6 M-4 -54 q4 30 -2 50" stroke="#a80c18" strokeWidth={5} fill="none" strokeLinecap="round" />;
// k5 (v7): кабина падает; щупальце хватает Кирилла за ногу; Тимур (лоб в крови) держит его — «Кирилл! Держись!»; остриё пробивает бок; Кирилл в кадре целиком
export const K5: React.FC<SP> = ({ t, d }) => { const c = caps('k5'), drag = ease(t, .3, 1.6), pierce = d - 1.0, [sx, sy] = shakeXY(t, [[0, 8, d], [.3, 24, .4], [pierce, 34, .5]]);
  return <Frame t={t} grade="#3a0a10" gradeK={.15} impact={isImpact(t, .3, 2) || isImpact(t, pierce, 3)} over={<Splat t={t} t0={pierce} seed={51} n={3} k={.7} />}>
    <Fall t={t} sx={sx} sy={sy}>
      <Tentacle t={t} x0={640} y0={480} x1={700 + drag * 60} y1={1200} w={80} seed={9} />
      <g transform={`rotate(${-80 + drag * 15} ${700 + drag * 60} 1200)`}><Figure x={700 + drag * 60} y={1200} s={.95} t={t} L={{ ...KL, bruise: true }} C={KC} pose={{ ...POSES.stand, armL: [-170, 0], armR: [-160, 10], legL: [-10, 10], legR: [20, 30] }} expr="pain" seed={3} mouth={t > pierce ? .5 : .2} /></g>
      {t > pierce - .4 && <Tentacle t={t} x0={900} y0={450} x1={t < pierce ? 900 - ease(t, pierce - .4, pierce) * 360 : 540} y1={t < pierce ? 450 + ease(t, pierce - .4, pierce) * 820 : 1270} w={56} seed={4} spike />}
      {t > pierce && <Spray t={t} t0={pierce} x={540} y={1300} dir={-.4} seed={61} pow={600} n={40} />}
      <Figure x={200} y={1750} s={.9} t={t} L={LK.timur} C={CS.timur} pose={{ ...POSES.stand, armR: [100, -20], armL: [80, -10], crouch: 60, lean: 30 }} expr="shout" mouth={talk(t, c, 'ТИМУР')} seed={41} turn={.5} lookX={.9} />
      <TimurCut x={200} y={1750 - 820 * .9 + 100} s={.9} />
    </Fall>
  </Frame>; };
// k6 (v7): фонарь сам ползёт по полу кабины к щупальцу; Кирилл, истекая кровью, видит; «Фонарь сам полз к щупальцу. Оно искало не нас. Оно искало фонарь.»
export const K6: React.FC<SP> = ({ t, d }) => { const crawl = ease(t, .3, d - .3, (k: number) => k);
  return <Frame t={t} grade="#3a0a10" gradeK={.12}>
    <Fall t={t}>
      <Tentacle t={t} x0={600} y0={480} x1={720 - crawl * 40} y1={1150} w={70} seed={3} />
      <circle cx={360 + crawl * 330} cy={1450 - crawl * 260} r={220} fill="#ff8a4a" opacity={.25 + crawl * .2} filter="url(#blur30)" />
      <g transform={`rotate(${noise('lc', t, 6) * 8} ${360 + crawl * 330} ${1450 - crawl * 260})`}><LanternHead t={t} x={360 + crawl * 330} y={1450 - crawl * 260} s={1.0} broken /></g>
      <g transform="translate(260 1600) scale(3.2)"><Head t={t} L={{ ...KL, bruise: true }} expr="pain" seed={3} lookX={.9} lookY={-.4} turn={.4} /></g>
    </Fall>
  </Frame>; };
// k7 (v7): Кирилл хватает фонарь — ладонь шипит, чернеет, дым; кричит от боли и вышвыривает фонарь в разбитое стекло: «Забирай!»
export const K7: React.FC<SP> = ({ t }) => { const c = caps('k7'), thr = c?.[0] ? c[0][2] + .1 : 2.0, grab = .4, burn = ease(t, grab, thr), q = clamp((t - thr) / .5), [sx, sy] = shakeXY(t, [[grab, 14, .3], [thr, 24, .4]]);
  const pose = PK(t, [[0, { armL: [-60, 80], armR: [60, -80], crouch: 80, lean: 10 }], [thr - .4, { armR: [-40, -60], armL: [-80, 40], lean: -14 }], [thr, { armR: [150, -10], armL: [-40, 20], lean: 16 }]]);
  const hand = t < thr - .4 ? [700, 1300] : t < thr ? [700 - ease(t, thr - .4, thr) * 300, 1300 + ease(t, thr - .4, thr) * 60] : [760, 980];
  return <Frame t={t} grade="#3a0a10" gradeK={.12} impact={isImpact(t, thr, 2)}>
    <Fall t={t} sx={sx} sy={sy}>
      <Figure x={540} y={2050} s={1.5} t={t} L={{ ...KL, bruise: true }} C={KC} pose={pose} expr={t < thr ? 'pain' : 'shout'} mouth={talk(t, c, 'КИРИЛЛ')} seed={3} turn={.2} tears={burn} sweat={1} />
      {t < thr + .05 && <g transform={`translate(${hand[0]} ${hand[1]})`}><LanternHead t={t} x={0} y={0} s={.6} broken />
        <ellipse cx={-10} cy={-40} rx={40} ry={28} fill={`rgb(${236 - burn * 170},${210 - burn * 190},${196 - burn * 180})`} stroke={INK} strokeWidth={4} />
        <Smoke t={t} t0={grab} x={-10} y={-70} n={8} r={40} spread={70} color="#6a6468" life={1.2} rise={260} k={.85} seed={13} />
        {burn > .2 && Array.from({ length: 6 }).map((_, i) => <circle key={i} cx={(h1(i + Math.floor(t * 15)) - .5) * 70} cy={-60 - (t * 300 + i * 40) % 130} r={4} fill="#ffb060" filter="url(#glow)" />)}</g>}
      <rect x={500} y={1420} width={40} height={70} fill="#a80c18" />
      {t > thr && <g><LanternHead t={t} x={600 + (1 - q) * 160} y={600 + (1 - q) * 380} s={.8 * (1 - q * .6)} broken /><path d={`M${760} 980 Q700 800 ${600 + (1 - q) * 160} ${600 + (1 - q) * 380}`} stroke="#fff" strokeWidth={10} opacity={.5 * (1 - q)} fill="none" /></g>}
      {t > thr && <Tentacle t={t} x0={600} y0={420} x1={600 + (1 - q) * 260} y1={420 + (1 - q) * 600} w={60} seed={7} />}
    </Fall>
  </Frame>; };
