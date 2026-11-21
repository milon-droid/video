// Три варианта вместо Депо. А — «пассажиры возвращаются в темноте»; Б — «безголовый Машинист идёт на звук»; В — «кабина машиниста: журнал, тормоз-ловушка, первое щупальце».
import React from 'react';
import { clamp, ease, noise } from '../anim';
import { cam, Flash, h1, isImpact, Lids, shakeXY, SpeedLines } from '../kit/fx';
import { Figure, PK, POSES } from '../chars/body';
import { Head, INK } from '../chars/head';
import { Machinist } from '../chars/monsters';
import { LK, CS } from '../chars/cast';
import { TrainInterior } from '../bg/places';
import { Frame, SP } from '../ep1/common';
import { Faceless, KL } from '../ep1/ShotsF';
import { G, H } from '../ep2/team';
import { talk } from '../ep2/timeline';
import { Spray, Splat } from '../ep2/ShotsC';
import { inHand, Tentacle } from '../ep2/ShotsE';
import { VA, VB, VC } from './vt';

const KC = CS.porterY;
const TEAM4 = ['r2', 'timur', 'kirill', 'mikh'];
const Car: React.FC<{ t: number; dark?: number; red?: number; fl?: number }> = ({ t, dark = 0, red = 0, fl = .3 }) => <g><TrainInterior t={t} flicker={fl} red={red} shake={2} /><rect width={1080} height={1920} fill="#020205" opacity={dark} /></g>;
const blinkOff = (t: number, rate = 2.2, duty = .35) => ((t * rate) % 1) < duty;
// значок-жетон на груди
const Badge: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => <g transform={`translate(${x} ${y}) scale(${s})`}><rect x={-30} y={-20} width={60} height={40} rx={6} fill="#c8b070" stroke="#5a4a20" strokeWidth={3} /><rect x={-22} y={-6} width={44} height={8} fill="#5a4a20" /></g>;

// ===== Вариант А =====
// va1: свет мигает; на пустых сиденьях вспышками проступают безликие пассажиры
export const VA1: React.FC<SP> = ({ t }) => { const off = t > .6 && blinkOff(t);
  return <Frame t={t} grade="#1a1a2a" gradeK={.12}><g transform={cam(1.0 + t * .02, 540, 1100, 0, -120)}>
    <Car t={t} dark={off ? .85 : .2} fl={1} />
    {off && [[150, 1300, .8], [930, 1320, .8], [300, 1180, .6], [800, 1190, .6]].map(([x, y, s], i) => <Faceless key={i} x={x} y={y} s={s} t={t} seed={i + 40} lift={.3} />)}
    {TEAM4.map(w => <H key={w} t={t} w={w} pose={POSES.tense} expr="scared" lookY={-.4} rim={off ? '#6a8ab0' : undefined} />)}
  </g></Frame>; };
// va2: каждое мигание — они ближе, уже стоят в проходе; Тимур: «Они… снова здесь.»
export const VA2: React.FC<SP> = ({ t }) => { const c = VA.capsOf('va2'), off = blinkOff(t, 2.6), step = Math.floor(t * 2.6);
  return <Frame t={t} grade="#1a1a2a" gradeK={.12}><g transform={cam(1.05, 540, 1100, 0, -120)}>
    <Car t={t} dark={off ? .9 : .25} fl={1} />
    {off && Array.from({ length: 5 }).map((_, i) => { const k = Math.min(1.25, .45 + step * .1 + (i % 2) * .05); return <Faceless key={i} x={540 + (i - 2) * 200 * k} y={1100 + k * 420} s={k} t={t} seed={i + 50} lift={1} lunge={.2 * step / 7} grin={step > 5 ? .5 : 0} />; })}
    <H t={t} w="timur" pose={POSES.tense} expr="scared" mouth={talk(t, c, 'ТИМУР')} tears={.5} />
    {['r2', 'kirill', 'mikh'].map(w => <H key={w} t={t} w={w} pose={POSES.guard} expr="scared" lookY={-.3} />)}
  </g></Frame>; };
// va3: в мигнувшем свете у ближнего безликого на груди — жетон охотника «А. ВОЛКОВ»; «Папин жетон…»
export const VA3: React.FC<SP> = ({ t }) => { const z = 1 + ease(t, .2, 2.4) * 1.4;
  return <Frame t={t} grade="#1a1a2a" gradeK={.15}><g transform={cam(z, 560, 1050)}>
    <rect width={1080} height={1920} fill="#08080c" />
    <Faceless x={540} y={1900} s={1.8} t={t} seed={7} lift={1} />
    <g transform="translate(600 1180) scale(1.6)"><rect x={-60} y={-36} width={120} height={72} rx={10} fill="#c8b070" stroke="#5a4a20" strokeWidth={4} />
      <text y={-6} textAnchor="middle" fontFamily="Oswald" fontWeight={500} fontSize={12} letterSpacing={2} fill="#3a2a10">АССОЦИАЦИЯ ОХОТНИКОВ</text>
      <text y={20} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={22} letterSpacing={2} fill="#2a1a08">А. ВОЛКОВ</text></g>
  </g><rect width={1080} height={1920} fill="#000" opacity={blinkOff(t, 1.6, .2) ? .6 : 0} /></Frame>; };
// va4: Кирилл понимает: в свете они замирают, в темноте двигаются; молния Лёхи держит их; «Свет! Держите свет!»
export const VA4: React.FC<SP> = ({ t }) => { const c = VA.capsOf('va4'), bolt = Math.floor(t * 8) % 3 !== 0;
  return <Frame t={t} grade="#1a1a2a" gradeK={.12}><g transform={cam(1.0, 540, 1100, 0, -120)}>
    <Car t={t} dark={.75} fl={1} />
    <ellipse cx={G.r2[0]} cy={1100} rx={500} ry={600} fill="#8fd8ff" opacity={bolt ? .25 : .1} filter="url(#blur30)" />
    {Array.from({ length: 5 }).map((_, i) => <Faceless key={i} x={540 + (i - 2) * 230} y={1520} s={1.0} t={0} seed={i + 60} lift={1} lunge={.3} />)}
    <H t={t} w="r2" pose={{ ...POSES.raiseL }} expr="angry" rim="#8fd8ff" />
    {bolt && <path d={`M${G.r2[0] - 60} 1050 l-30 -120 l40 -10 l-30 -140`} stroke="#bff0ff" strokeWidth={8} fill="none" filter="url(#glow)" />}
    <H t={t} w="kirill" pose={PK(t, [[0, 'tense'], [1.2, { armR: [120, -10], lean: 8 }]])} expr="shout" mouth={talk(t, c, 'КИРИЛЛ')} rim="#8fd8ff" />
    <H t={t} w="timur" pose={POSES.tense} expr="scared" rim="#8fd8ff" /><H t={t} w="mikh" pose={POSES.guard} expr="determined" rim="#8fd8ff" />
  </g></Frame>; };
// va5: Михалыч держит огонь в ладонях — единственный свет; остальные пятятся к двери в головной вагон; огонь слабеет; «Пока горю — идите. Берегите себя.»
export const VA5: React.FC<SP> = ({ t, d }) => { const c = VA.capsOf('va5'), fire = 1 - ease(t, d - 1.6, d - .1), back = ease(t, .3, d);
  return <Frame t={t} grade="#2a1408" gradeK={.1}><g transform={cam(1.0, 540, 1100, 0, -120)}>
    <Car t={t} dark={.8 - fire * .45} fl={0} />
    <ellipse cx={780} cy={1200} rx={560 * fire + 60} ry={700 * fire + 80} fill="#ff8a2a" opacity={.3} filter="url(#blur30)" />
    {Array.from({ length: 4 }).map((_, i) => <Faceless key={i} x={760 + (i - 1.5) * 200} y={1250 + (1 - fire) * 200} s={.75 + (1 - fire) * .3} t={0} seed={i + 70} lift={1} lunge={.4 + (1 - fire) * .4} />)}
    <H t={t} w="mikh" pose={{ ...POSES.hold, armL: [-40, 120], armR: [40, -120] }} expr="determined" mouth={talk(t, c, 'МИХАЛЫЧ')} turn={-.5} lookX={-.8} rim="#ff8a2a" />
    <g transform={`translate(${G.mikh[0]} ${G.mikh[1] - 560})`}>{Array.from({ length: 6 }).map((_, i) => <ellipse key={i} cx={Math.sin(t * 9 + i) * 8} cy={-i * 14 * fire} rx={34 * fire} ry={50 * fire} fill={i % 2 ? '#ffb040' : '#ff6a1a'} opacity={.85} filter="url(#glow)" />)}</g>
    <g transform={`translate(${-back * 260} 0)`}>{['r2', 'timur', 'kirill'].map(w => <H key={w} t={t} w={w} pose={POSES.tense} expr={w === 'kirill' ? 'cry' : 'scared'} lookX={.8} turn={.5} rim="#ff8a2a" />)}</g>
  </g></Frame>; };
// va6: огонь гаснет — темнота, руки безликих смыкаются на Михалыче; «Михалыч!»
export const VA6: React.FC<SP> = ({ t }) => { const c = VA.capsOf('va6'), grab = ease(t, .1, .8);
  return <Frame t={t} vign={1} over={<Splat t={t} t0={.6} seed={77} n={4} k={.7} />}>
    <rect width={1080} height={1920} fill="#020205" />
    <circle cx={780} cy={1200} r={80 * (1 - ease(t, 0, .4))} fill="#ff8a2a" opacity={.6} filter="url(#blur30)" />
    {Array.from({ length: 10 }).map((_, i) => { const a = i / 10 * Math.PI * 2, r = 420 - grab * 300; return <path key={i} d={`M${780 + Math.cos(a) * 700} ${1200 + Math.sin(a) * 700} L${780 + Math.cos(a) * r} ${1200 + Math.sin(a) * r}`} stroke="#c8c4bc" strokeWidth={14} strokeLinecap="round" opacity={.7} />; })}
    <g transform={`translate(300 ${700}) scale(4)`} opacity={ease(t, .7, 1.0)}><Head t={t} L={KL} expr="shout" seed={3} mouth={Math.max(.6, talk(t, c, 'КИРИЛЛ'))} tears={.8} /></g>
  </Frame>; };

// ===== Вариант Б =====
// vb1: безголовый Машинист поднимается с пола — из шеи искры; «Он встал. Без головы. И шёл на звук.»
export const VB1: React.FC<SP> = ({ t }) => { const up = ease(t, .2, 1.8);
  return <Frame t={t} grade="#1a1a2a" gradeK={.12}><g transform={cam(1.05, 540, 1150, 0, -120)}>
    <Car t={t} dark={.4} fl={.8} />
    {TEAM4.map(w => <H key={w} t={t} w={w} pose={POSES.tense} expr="scared" lookX={.4} lookY={.3} />)}
    <g transform={`rotate(${(1 - up) * 80} 560 1500)`}><Machinist x={560} y={1500} s={1.0} t={t} k={0} reveal={1} />
      {noise('sp', t, 9) > .3 && <circle cx={560 + (h1(Math.floor(t * 20)) - .5) * 40} cy={1500 - 560} r={10} fill="#ffd080" filter="url(#glow)" />}</g>
  </g></Frame>; };
// vb2: Михалыч шёпотом: «Тихо. Ни звука.» — все замерли; Машинист медленно поворачивается, «слушает»
export const VB2: React.FC<SP> = ({ t }) => { const c = VB.capsOf('vb2');
  return <Frame t={t} grade="#1a1a2a" gradeK={.15}><g transform={cam(1.1, 540, 1150, 0, -120)}>
    <Car t={t} dark={.5} fl={.4} />
    <g transform={`translate(640 1450) rotate(${Math.sin(t * 1.2) * 8}) translate(-640 -1450)`}><Machinist x={640} y={1450} s={.85} t={t} k={0} reveal={1} /></g>
    {Array.from({ length: 3 }).map((_, i) => { const q = ((t * .8 + i / 3) % 1); return <circle key={i} cx={640} cy={1450 - 520 * .85} r={40 + q * 260} fill="none" stroke="#9ab" strokeWidth={4} opacity={(1 - q) * .4} />; })}
    <H t={t} w="mikh" pose={{ ...POSES.stand, armR: [140, -150] }} expr="scared" mouth={talk(t, c, 'МИХАЛЫЧ') * .5} />
    {['r2', 'timur', 'kirill'].map(w => <H key={w} t={t} w={w} pose={POSES.stand} expr="scared" idle={false} breathe={false} />)}
  </g></Frame>; };
// vb3: Тимур всхлипывает — Машинист резко поворачивается к нему; на мундире блестит жетон «А. ВОЛКОВ»; «Папин жетон…»
export const VB3: React.FC<SP> = ({ t }) => { const turn = ease(t, .4, .7), z = t > 1.2 ? 1.8 : 1.1;
  return <Frame t={t} grade="#1a1a2a" gradeK={.15} impact={isImpact(t, .45, 2)}><g transform={cam(z, t > 1.2 ? 620 : 540, t > 1.2 ? 1080 : 1150, 0, -120)}>
    <Car t={t} dark={.5} fl={.4} />
    <g transform={`translate(${-turn * 60} 0)`}><Machinist x={600} y={1500} s={.95} t={t} k={0} reveal={1} />
      <g transform={`translate(${600 + 40} ${1500 - 400 * .95})`}><rect x={-34} y={-22} width={68} height={44} rx={6} fill="#c8b070" stroke="#5a4a20" strokeWidth={3} /><text y={6} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={13} fill="#2a1a08">А. ВОЛКОВ</text></g></g>
    <H t={t} w="timur" pose={{ ...POSES.stand, armL: [-150, 120], armR: [150, -120] }} expr="cry" tears={1} mouth={.2} />
    <H t={t} w="kirill" pose={POSES.tense} expr="scared" lookX={.4} />
  </g></Frame>; };
// vb4: Михалыч бьёт кулаком по поручню: «Эй! Сюда!» — Машинист бросается на него
export const VB4: React.FC<SP> = ({ t }) => { const c = VB.capsOf('vb4'), lunge = ease(t, 1.2, 1.7), [sx, sy] = shakeXY(t, [[.4, 14, .3], [1.7, 30, .4]]);
  return <Frame t={t} grade="#2a1418" gradeK={.12} impact={isImpact(t, 1.7, 2)}><g transform={cam(1.05, 640, 1150, sx, sy - 120)}>
    <Car t={t} dark={.45} fl={.4} />
    <rect x={G.mikh[0] + 120} y={300} width={24} height={1600} fill="#b8bec8" />
    <Machinist x={300 + lunge * 380} y={1500} s={.9} t={t} k={0} reveal={1} />
    <H t={t} w="mikh" pose={PK(t, [[0, 'stand'], [.3, { armR: [100, -60], lean: 6 }], [.5, { armR: [80, -20] }]])} expr="shout" mouth={talk(t, c, 'МИХАЛЫЧ')} turn={-.4} />
  </g></Frame>; };
// vb5: Машинист сжимает Михалыча; тот держит его и смотрит на ребят: «Берегите себя. Защитите друг друга.» — Кирилл утаскивает Тимура в соседний вагон; «Михалыч!»
export const VB5: React.FC<SP> = ({ t, d }) => { const c = VB.capsOf('vb5'), crush = ease(t, d - 1.4, d - .6), drag = ease(t, 1.0, d - .8);
  return <Frame t={t} grade="#2a0a10" gradeK={.12} impact={isImpact(t, d - .6, 2)} over={<Splat t={t} t0={d - .6} seed={81} n={4} k={.8} />}><g transform={cam(1.0, 540, 1150, 0, -120)}>
    <Car t={t} dark={.45} fl={.5} red={.8} />
    <Machinist x={720} y={1520} s={.95} t={t} k={0} reveal={1} />
    <H t={t} w="mikh" pose={{ ...POSES.hold, armL: [-60, 110], armR: [60, -110], crouch: crush * 120 }} expr="pain" mouth={talk(t, c, 'МИХАЛЫЧ')} turn={-.7} lookX={-.9} />
    {t > d - .6 && <Spray t={t} t0={d - .6} x={G.mikh[0]} y={G.mikh[1] - 600} seed={12} pow={600} n={40} />}
    <g transform={`translate(${-drag * 380} 0)`}><H t={t} w="kirill" pose={{ ...POSES.stand, armL: [-80, 60] }} expr="shout" mouth={talk(t, c, 'КИРИЛЛ')} turn={.6} lookX={.9} /><H t={t} w="timur" pose={POSES.hit} expr="cry" tears={1} /><H t={t} w="r2" pose={POSES.tense} expr="scared" /></g>
  </g></Frame>; };

// ===== Вариант В =====
// кабина: пульт, рычаги, лобовое стекло с тоннелем
const Cab: React.FC<{ t: number; speed?: number; crack?: number; red?: number }> = ({ t, speed = .5, crack = 0, red = 0 }) => <g>
  <rect width={1080} height={1920} fill="#1a1c22" />
  <path d="M120 260 L960 260 L1020 980 L60 980Z" fill="#05060a" stroke="#3a3e48" strokeWidth={16} />
  {Array.from({ length: 10 }).map((_, i) => { const q = ((t * (.6 + speed * 2) + i / 10) % 1), k = q * q; return <rect key={i} x={540 - 40 - k * 560} y={620 - 20 - k * 320} width={80 + k * 1120} height={40 + k * 640} fill="none" stroke="#3a3a44" strokeWidth={4 + k * 10} opacity={q} />; })}
  <circle cx={540} cy={620} r={30} fill={red ? '#ff3a2a' : '#fff4d0'} opacity={.6} filter="url(#glow)" />
  {red > 0 && <circle cx={540} cy={620} r={400} fill="#ff1a1a" opacity={red * .25} filter="url(#blur30)" />}
  {crack > 0 && <g stroke="#c8d0e0" strokeWidth={4} fill="none" opacity={.9}>{Array.from({ length: 10 }).map((_, i) => { const a = i / 10 * Math.PI * 2; return <path key={i} d={`M600 600 L${600 + Math.cos(a) * 200 * crack} ${600 + Math.sin(a) * 150 * crack} L${600 + Math.cos(a + .2) * 420 * crack} ${600 + Math.sin(a + .2) * 300 * crack}`} />; })}</g>}
  <path d="M0 980 L1080 980 L1080 1920 L0 1920Z" fill="#2a2e38" /><rect x={60} y={980} width={960} height={260} fill="#3a4050" stroke="#1a1c22" strokeWidth={8} />
  {[[200, 1060, '#3aff8a'], [300, 1060, '#ffd040'], [400, 1060, '#ff4a3a']].map(([x, y, c], i) => <circle key={i} cx={x as number} cy={y as number} r={18} fill={c as string} opacity={.5 + .5 * Math.sin(t * 4 + i)} />)}
  <rect x={560} y={1020} width={260} height={120} rx={8} fill="#0a1410" stroke="#5a6070" strokeWidth={5} /><text x={690} y={1100} textAnchor="middle" fontFamily="JBM, monospace" fontSize={60} fill="#3aff8a">{Math.round(40 + speed * 100)}</text>
</g>;
// vc1: отряд бежит по вагону к двери кабины; Михалыч вышибает её плечом: «В кабину! Остановим поезд!»
export const VC1: React.FC<SP> = ({ t }) => { const c = VC.capsOf('vc1'), hit = 1.6, [sx, sy] = shakeXY(t, [[hit, 24, .4]]);
  return <Frame t={t} grade="#1a1a2a" gradeK={.12} impact={isImpact(t, hit, 2)}><g transform={cam(1.0 + t * .05, 540, 1050, sx, sy - 100)}>
    <Car t={t} dark={.3} fl={.6} />
    <rect x={430} y={640} width={220} height={420} fill={t > hit ? '#05060a' : '#5a5e68'} stroke="#2a2e38" strokeWidth={10} /><text x={540} y={700} textAnchor="middle" fontFamily="Mont" fontWeight={800} fontSize={24} fill="#c81e2a">КАБИНА</text>
    <H t={t} w="mikh" pose={PK(t, [[0, 'stand'], [1.2, { armL: [-60, 90], lean: 20, crouch: 40 }], [hit, { armL: [-90, 60], lean: 26 }]])} expr="shout" mouth={talk(t, c, 'МИХАЛЫЧ')} turn={.2} />
    {['r2', 'timur', 'kirill'].map(w => <H key={w} t={t} w={w} pose={POSES.tense} expr="scared" lookY={-.3} />)}
  </g></Frame>; };
// vc2: в кабине — раскрытый журнал рейсов: столбик фамилий охотников, все зачёркнуты; последняя строка — «Волков А.»
export const VC2: React.FC<SP> = ({ t }) => { const z = 1 + ease(t, .3, 3.0) * .8, names = ['Сомов К.', 'Ильина Т.', 'Бекетов Р.', 'Зорин П.', 'Абаев Д.', 'Крылов Е.', 'Нуриев С.', 'Волков А.'];
  return <Frame t={t} grade="#2a2418" gradeK={.12}><g transform={cam(z, 540, 1000 + ease(t, .3, 3.0) * 260)}>
    <rect width={1080} height={1920} fill="#2a2e38" /><ellipse cx={540} cy={900} rx={500} ry={600} fill="#ffe8b0" opacity={.15} filter="url(#blur30)" />
    <g transform="rotate(-4 540 1000)"><rect x={180} y={400} width={720} height={1160} rx={14} fill="#e8dcc0" stroke="#8a7a5a" strokeWidth={8} />
      <text x={540} y={500} textAnchor="middle" fontFamily="Mont" fontWeight={800} fontSize={40} fill="#3a2a1a">ЖУРНАЛ РЕЙСОВ</text>
      <text x={540} y={550} textAnchor="middle" fontFamily="Mont" fontWeight={600} fontSize={26} fill="#5a4a3a">«Северная» — «Конечная»</text>
      {names.map((n, i) => { const y = 650 + i * 105, last = i === names.length - 1, k = ease(t, .4 + i * .2, .6 + i * .2); return <g key={n} opacity={k}>
        <text x={240} y={y} fontFamily="Mont" fontWeight={600} fontSize={22} fill="#5a4a3a">{['2021', '2022', '2022', '2023', '2024', '2024', '2025', '2026'][i]}</text>
        <text x={380} y={y} fontFamily="Mont" fontWeight={last ? 800 : 600} fontSize={44} fill={last ? '#1a0a0a' : '#3a2a1a'}>{n}</text>
        {!last && <line x1={370} x2={370 + n.length * 24 * ease(t, .6 + i * .2, .8 + i * .2)} y1={y - 14} y2={y - 14} stroke="#a80c18" strokeWidth={5} />}
        {last && <rect x={360} y={y - 50} width={330} height={66} fill="none" stroke="#ff4a3a" strokeWidth={4} strokeDasharray="14 8" opacity={ease(t, 2.6, 3.0)} />}</g>; })}
    </g>
  </g></Frame>; };
// vc3: Михалыч тянет рычаг тормоза на себя, рычаг рвётся из рук: «Держу тормоз!»
export const VC3: React.FC<SP> = ({ t }) => { const c = VC.capsOf('vc3'), pull = ease(t, .3, 1.0) - Math.max(0, Math.sin(t * 7)) * .15 * ease(t, 1.0, 1.4);
  return <Frame t={t} grade="#1a1a2a" gradeK={.1}><g transform={cam(1.05, 540, 1100)}>
    <Cab t={t} speed={.5} />
    <g transform={`rotate(${-30 + pull * 50} 420 1240)`}><rect x={408} y={980} width={24} height={260} fill="#8a8e98" stroke="#2a2e38" strokeWidth={4} /><circle cx={420} cy={980} r={30} fill="#c81e2a" stroke="#2a0a0a" strokeWidth={4} /></g>
    <Figure x={640} y={2100} s={1.4} t={t} L={LK.mikh} C={CS.mikh} pose={{ ...POSES.stand, armL: [-150, 30], armR: [-130, 20], lean: -16, crouch: 60 }} expr="shout" mouth={talk(t, c, 'МИХАЛЫЧ')} seed={6} turn={-.4} />
  </g></Frame>; };
// vc4: стрелка спидометра ползёт вверх, тоннель мелькает быстрее — поезд разгоняется; «Поезд не тормозил. Он разгонялся.»
export const VC4: React.FC<SP> = ({ t, d }) => { const sp = .5 + ease(t, .2, d) * .8, [sx, sy] = shakeXY(t, [[0, 6 + sp * 8, d]]);
  return <Frame t={t} grade="#1a1a2a" gradeK={.1}><g transform={cam(1.0, 540, 900, sx, sy)}><Cab t={t} speed={sp} red={ease(t, d - 1.2, d)} /></g><SpeedLines t={t} cx={540} cy={620} k={sp * .6} /></Frame>; };
// vc5: стекло лопается — красное щупальце врывается в кабину, обвивает Михалыча; он выталкивает Кирилла и Тимура за дверь: «Берегите себя. Защитите друг друга.»
export const VC5: React.FC<SP> = ({ t, d }) => { const c = VC.capsOf('vc5'), crack = ease(t, 0, .6), burst = .8, grab = ease(t, burst, burst + .4), push = ease(t, 2.0, 2.8), [sx, sy] = shakeXY(t, [[burst, 36, .6]]);
  return <Frame t={t} grade="#2a0a10" gradeK={.12} impact={isImpact(t, burst, 3)}><g transform={cam(1.0, 540, 1050, sx, sy)}>
    <Cab t={t} speed={1.2} crack={t < burst ? crack : 0} red={1} />
    {t > burst && <g>{Array.from({ length: 24 }).map((_, i) => { const q = clamp((t - burst) / 1), a = h1(i * 3) * Math.PI * 2, r = 100 + h1(i * 7) * 700; return <polygon key={i} points={`${600 + Math.cos(a) * r * q},${600 + Math.sin(a) * r * q} ${610 + Math.cos(a) * r * q},${616 + Math.sin(a) * r * q} ${592 + Math.cos(a) * r * q},${614 + Math.sin(a) * r * q}`} fill="#c8d0e0" opacity={1 - q} />; })}
      <Tentacle t={t} x0={600} y0={500} x1={640 - grab * 20} y1={1250 + grab * 200} w={100} seed={2} /></g>}
    <Figure x={640} y={2100} s={1.4} t={t} L={LK.mikh} C={CS.mikh} pose={{ ...POSES.stand, armL: [-60 + push * 40, 90], armR: [90 - push * 30, -20], lean: -10, crouch: 40 }} expr="pain" mouth={talk(t, c, 'МИХАЛЫЧ')} seed={6} turn={-.6} lookX={-.9} />
    {grab > 0 && [0, 1].map(i => <ellipse key={i} cx={640} cy={1500 + i * 70} rx={130} ry={30} fill="none" stroke="#5a0a12" strokeWidth={28 * grab} />)}
    <g transform={`translate(${-push * 300} 0)`}><Figure x={180} y={2060} s={1.2} t={t} L={KL} C={KC} pose={POSES.hit} expr="shout" seed={3} turn={.6} lookX={.9} /><Figure x={40} y={2000} s={1.0} t={t} L={LK.timur} C={CS.timur} pose={POSES.hit} expr="cry" seed={41} /></g>
  </g></Frame>; };
// vc6: снаружи кабины — дверь захлопывается, в окошке двери красный свет и силуэт; Кирилл бьёт в дверь: «Михалыч!»
export const VC6: React.FC<SP> = ({ t }) => { const c = VC.capsOf('vc6'), [sx, sy] = shakeXY(t, [[.1, 30, .4], [1.0, 14, .3]]);
  return <Frame t={t} grade="#2a0a10" gradeK={.12} impact={isImpact(t, .1, 2)}><g transform={cam(1.05, 540, 1000, sx, sy)}>
    <Car t={t} dark={.35} fl={.8} red={1} />
    <rect x={330} y={420} width={420} height={1100} fill="#5a5e68" stroke="#2a2e38" strokeWidth={12} /><rect x={420} y={520} width={240} height={300} rx={20} fill="#ff2a1a" opacity={.6 + .3 * Math.sin(t * 9)} />
    <ellipse cx={540} cy={700} rx={70} ry={120} fill="#1a0404" opacity={.8 * (1 - ease(t, .6, 1.6))} />
    <Figure x={540} y={2120} s={1.5} t={t} L={KL} C={KC} pose={PK(t, [[0, { armR: [150, -30], armL: [-150, 30] }], [.9, { armR: [170, -60], armL: [-150, 30] }], [1.1, { armR: [150, -30], armL: [-150, 30] }]])} expr="shout" mouth={talk(t, c, 'КИРИЛЛ')} seed={3} turn={.1} />
  </g></Frame>; };
