// Серия 2 v4: вход Машиниста в вагон, отряд из шести с плашками, правило «кто смотрит на свет» с доказательством, все зажмуриваются,
// Михалыч держит проём, хваты в падающем вагоне, срыв Лёхи, щупальце хватает Кирилла, видимая цепочка «фонарь → сердце → разлом», Тимур ранен.
import React from 'react';
import { clamp, ease, noise, spr } from '../anim';
import { cam, Flash, h1, isImpact, Lids, Motes, shakeXY, SpeedLines } from '../kit/fx';
import { Figure, PK, POSES } from '../chars/body';
import { Head, INK } from '../chars/head';
import { Machinist } from '../chars/monsters';
import { LK, CS } from '../chars/cast';
import { Gate } from '../bg/moscow';
import { TrainInterior } from '../bg/places';
import { Frame, SP } from '../ep1/common';
import { KL } from '../ep1/ShotsF';
import { G, H, NAMES } from './team';
import { caps, talk } from './timeline';
import { Cone, DarkCar, WARM } from './ShotsA';
import { Pool, Spray } from './ShotsC';
import { Walker } from './ShotsD';
import { DepotBg, inHand, LanternHead, Tag, Tentacle, Vortex } from './ShotsE';
import { BigCar } from './ShotsG';

const KC = CS.porterY;
const TEAM6 = ['r1', 'zhora', 'r2', 'timur', 'kirill', 'mikh'];
// Тимур после стекла: рассечённый лоб
const TimurCut: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => <path transform={`translate(${x} ${y}) scale(${s})`} d="M-18 -60 l20 6 M-4 -54 q4 30 -2 50" stroke="#a80c18" strokeWidth={5} fill="none" strokeLinecap="round" />;

// a3: поезд стоит, двери открываются — в проёме Машинист: «Конечная. Выход — один»; он шагает внутрь, свет заливает вагон
export const A3: React.FC<SP> = ({ t }) => {
  const c = caps('a3'), op = ease(t, .2, .9), step = ease(t, 2.6, 3.8), [sx, sy] = shakeXY(t, [[3.0, 10, .3]]);
  return <Frame t={t} grade="#2a2418" gradeK={.1}>
    <g transform={cam(1.0 + step * .25, 540, 1000, sx, sy - 80)}>
      <rect width={1080} height={1920} fill="#1c1e24" />
      <rect x={240} y={260} width={600} height={1400} fill="#0e0c0a" />
      <ellipse cx={540} cy={700} rx={400 + step * 300} ry={600} fill={WARM} opacity={.2 + step * .3} filter="url(#blur30)" />
      <Machinist x={540} y={1660 + step * 160} s={1.2 + step * .35} t={t} k={1 + step * .5} />
      <rect x={240 - op * 300} y={240} width={300} height={1440} fill="#8a909a" stroke="#2a2e38" strokeWidth={10} />
      <rect x={540 + op * 300} y={240} width={300} height={1440} fill="#7a808a" stroke="#2a2e38" strokeWidth={10} />
      <rect x={0} y={0} width={240} height={1920} fill="#1c1e24" /><rect x={840} y={0} width={240} height={1920} fill="#1c1e24" />
      {/* спины отряда на переднем плане */}
      {[150, 420, 700, 930].map((x, i) => <ellipse key={i} cx={x} cy={1900} rx={150} ry={260} fill="#0a0b10" />)}
    </g>
    <Flash t={t} t0={3.0} dur={.4} color={WARM} max={.4} />
  </Frame>;
};

// a4: отряд из шести под светом — у каждого плашка с именем (сзади: Серёга, Жора, Лёха; спереди: Тимур, Кирилл, Михалыч); взгляды тянутся вверх
export const A4: React.FC<SP> = ({ t }) => (
  <Frame t={t} grade="#2a2418" gradeK={.1}>
    <g transform={cam(1.0 + t * .02, 540, 1150, 0, -150)}>
      <DarkCar t={t} />
      <Cone x={540} x0={540} y0={300} k={1.2} w={620} />
      {TEAM6.map((w, i) => <H key={w} t={t} w={w} pose={POSES.stand} expr={w === 'timur' ? 'scared' : 'calm'} lookY={-.4 - ease(t, 1.5, 2.6) * .5} rim={WARM} />)}
    </g>
    {TEAM6.map((w, i) => { const [x] = G[w], back = i < 3; return <g key={w}><line x1={x} x2={x} y1={back ? 900 : 1380} y2={back ? 960 : 1300} stroke="#5fd2ff" strokeWidth={3} opacity={ease(t, .2 + i * .18, .5 + i * .18)} /><Tag t={t} t0={.2 + i * .18} x={Math.min(920, Math.max(160, x))} y={back ? 860 : 1430} name={NAMES[w]} /></g>; })}
  </Frame>
);

// e3 (v4): Серёга поднимает взгляд к свету — гибнет; Кирилл отводит глаза — жив (доказательство правила)
export const E3: React.FC<SP> = ({ t }) => {
  const look = ease(t, .1, .6), kn = ease(t, .6, 1.0), hit = 1.05, fall = clamp((t - hit - .2) / .35) ** 2, [sx, sy] = shakeXY(t, [[hit, 22, .5]]);
  const away = ease(t, 1.2, 1.6), x = 720, y = 1520;
  return <Frame t={t} grade="#2a1418" gradeK={.12} impact={isImpact(t, hit, 2)} over={<Flash t={t} t0={hit} dur={.25} color={WARM} max={.6} />}>
    <g transform={cam(1.08, 600, 1150, sx, sy - 120)}>
      <DarkCar t={t} />
      <Cone x={720} k={1.3} w={380} />
      <Pool x={x - 140} y={y + 10} k={ease(t, hit + .5, hit + 2)} w={200} />
      <g transform={`rotate(${-fall * 84} ${x} ${y})`}><Figure x={x} y={y} s={.95} t={t > hit ? hit : t} L={t > hit ? { ...LK.r1, skin: '#d8d4d0', skinSh: '#a8a4a0' } : LK.r1} C={CS.r1}
        pose={{ ...POSES.stand, crouch: kn * 200, lean: -kn * 14, armL: [-30 - kn * 40, 20], armR: [30 + kn * 40, -20], head: -10 - look * 20 }} expr={t > hit ? 'pain' : 'scared'} lookY={-1} lid={t > hit ? .2 : 1} noBlink seed={21} rim={WARM} glow={look * (t < hit ? 1 : 0)} /></g>
      {/* луч от глаз к свету — «смотрит» */}
      {t < hit && <line x1={x} y1={y - 830} x2={720} y2={0} stroke="#ffe8a0" strokeWidth={6} opacity={look * .8} strokeDasharray="16 10" filter="url(#glow)" />}
      <Spray t={t} t0={hit} x={x} y={y - 560 * .95 + kn * 190} seed={21} pow={500} n={26} dir={.3} />
      <g transform="translate(-140 0)"><Figure x={300} y={2100} s={1.5} t={t} L={KL} C={KC} pose={PK(t, [[0, 'stand'], [hit, { ...POSES.hit, lean: -6 }], [hit + .6, { ...POSES.tense, armL: [-100, 120] }]])} expr={t > hit ? 'scared' : 'calm'}
        turn={.6 - away * 1.2} lookX={.8 - away * 1.6} lid={1 - away * .8} noBlink={away > 0} seed={3} sweat={1} /></g>
    </g>
    <Tag t={t} t0={.1} x={720} y={760} name="СЕРЁГА" />
  </Frame>;
};

// e5: «Закройте глаза!» — Тимур, Михалыч, Лёха зажмуриваются и закрывают лица руками; сверху давит свет
export const E5: React.FC<SP> = ({ t }) => {
  const sh = (i: number) => ease(t, .2 + i * .25, .5 + i * .25);
  return <Frame t={t} grade="#2a2418" gradeK={.1}>
    <g transform={cam(1.0, 540, 1150, 0, -150)}>
      <DarkCar t={t} />
      <Cone x={540} x0={540} y0={300} k={1.4} w={640} />
      {['r2', 'timur', 'mikh'].map((w, i) => { const k = sh(i); return <H key={w} t={t} w={w} pose={{ ...POSES.stand, armL: [-20 - k * 130, 20 + k * 120], armR: [20 + k * 130, -20 - k * 120], head: k * 14, crouch: k * 30 }} expr="pain" lid={1 - k} noBlink rim={WARM} />; })}
      <H t={t} w="kirill" pose={{ ...POSES.tense, armL: [-120, 120] }} expr="determined" lid={0} noBlink rim={WARM} turn={-.3} />
    </g>
  </Frame>;
};

// g8 (v4): вид из вагона — Михалыч в проёме, руками упёрся в раму, ноги согнуты, дрожит; огонь держит Обходчика; рука Кирилла тянется к нему; молот; двери
export const G8: React.FC<SP> = ({ t, d }) => {
  const c = caps('g8'), hit = d - 1.4, sw = ease(t, hit - .5, hit), fall = clamp((t - hit - .1) / .45) ** 2, trem = t < hit ? Math.sin(t * 40) * 4 : 0, [sx, sy] = shakeXY(t, [[hit, 40, .6]]);
  const reach = ease(t, c?.[1] ? c[1][2] - .4 : hit - .8, c?.[1] ? c[1][2] : hit), close = ease(t, hit + .3, hit + 1.0), turnB = t > .8 && t < hit - .3;
  return <Frame t={t} grade="#2a0a0a" gradeK={.1} impact={isImpact(t, hit, 3)}>
    <g transform={cam(1.0, 540, 1000, sx, sy)}>
      <DepotBg t={t} />
      <Walker x={600} y={1350} s={.7} t={t} open={.8} swing={sw} crouch={.3} />
      {t < hit + .6 && <g opacity={t < hit + .1 ? 1 : 1 - ease(t, hit + .1, hit + .6)}>{Array.from({ length: 16 }).map((_, i) => { const x = 300 + i * 32, hh = 260 + noise('fw' + i, t, 4) * 100; return <ellipse key={i} cx={x} cy={1500 - hh * .5} rx={30} ry={hh * .5} fill={i % 3 ? '#ff7a1a' : '#ffd060'} opacity={.7} filter="url(#glow)" />; })}</g>}
      {/* Михалыч спиной к нам в проёме: руки на раме, ноги согнуты */}
      <g transform={`translate(${trem} 0) rotate(${fall * 70} 540 1900)`}>
        <Figure x={540} y={1900} s={1.15} t={fall > 0 ? hit : t} L={LK.mikh} C={CS.mikh} pose={fall > 0 ? POSES.fallen : { ...POSES.stand, armL: [-110, -20], armR: [110, 20], legL: [-22, 30], legR: [22, -30], crouch: 70, lean: 4 }}
          expr={t < hit ? 'sad' : 'pain'} mouth={talk(t, c, 'МИХАЛЫЧ')} turn={turnB ? -.8 : 0} lookX={turnB ? -.9 : 0} seed={6} rim="#ff8a2a" />
      </g>
      {t > hit && <Spray t={t} t0={hit} x={560} y={1150} dir={.2} seed={12} pow={700} n={40} />}
      {/* рама дверей вагона и створки */}
      <rect x={0} y={0} width={180 + close * 360} height={1920} fill="#5a5e68" stroke="#2a2e38" strokeWidth={10} /><rect x={900 - close * 360} y={0} width={180 + close * 360} height={1920} fill="#4a4e58" stroke="#2a2e38" strokeWidth={10} />
      {/* рука Кирилла тянется к нему */}
      <path d={`M-60 ${1700 - reach * 60} L${120 + reach * 260} ${1380 - reach * 40}`} stroke="#f5c518" strokeWidth={110} strokeLinecap="round" />
      <circle cx={120 + reach * 260} cy={1380 - reach * 40} r={52} fill="#ecd2c4" stroke={INK} strokeWidth={5} />
    </g>
  </Frame>;
};

// поручень наклонного вагона
const Pole: React.FC<{ x: number; y0?: number; y1?: number }> = ({ x, y0 = 300, y1 = 1900 }) => <g><rect x={x - 14} y={y0} width={28} height={y1 - y0} rx={12} fill="#b8bec8" stroke="#2a2e38" strokeWidth={4} /><rect x={x - 4} y={y0} width={6} height={y1 - y0} fill="#fff" opacity={.4} /></g>;
const Hand: React.FC<{ x: number; y: number; c?: string }> = ({ x, y, c = '#ecd2c4' }) => <g><ellipse cx={x} cy={y} rx={34} ry={28} fill={c} stroke={INK} strokeWidth={5} />{[-12, 0, 12].map((d, i) => <path key={i} d={`M${x + d} ${y - 20} v40`} stroke={INK} strokeWidth={2} opacity={.5} />)}</g>;
// i2 (v4): вагон падает и накренён; все держатся за поручни; щупальце бьёт стекло (осколок режет Тимуру лоб), обвивает Лёху; хват слабеет → Кирилл тянет руку → срыв
export const I2: React.FC<SP> = ({ t }) => {
  const smash = .6, grab = ease(t, .9, 1.3), slip = ease(t, 2.0, 2.6), gone = clamp((t - 2.6) / .4) ** 2, [sx, sy] = shakeXY(t, [[0, 10, 4], [smash, 36, .5], [2.6, 30, .4]]);
  const lx = 760 + gone * 600, ly = 1300 - gone * 500;
  return <Frame t={t} grade="#3a0a10" gradeK={.15} impact={isImpact(t, smash, 3)} over={<Flash t={t} t0={smash} dur={.2} color="#ff4a3a" max={.4} />}>
    <g transform={`translate(540 960) rotate(-24) translate(-540 -960) translate(${sx} ${sy})`}>
      <g transform={cam(1.1, 540, 1050)}>
        <TrainInterior t={t} flicker={1} red={2} shake={4} />
        <rect width={1080} height={1920} fill="#2a0206" opacity={.35} />
        <Pole x={300} /><Pole x={760} />
        {t > smash && <Tentacle t={t} x0={1300} y0={500} x1={lx + 60 + (1 - grab) * 300} y1={ly - 300} w={90} seed={3} />}
        {/* Лёха: держится за поручень, щупальце обвивает, пальцы разжимаются */}
        <g transform={`translate(${gone * 600} ${-gone * 500}) rotate(${gone * 60} 760 1700)`}>
          <Figure x={760} y={1700} s={.95} t={t} L={LK.r2} C={CS.r2} pose={{ ...POSES.stand, armL: [-170 + slip * 40, 10], armR: [150 + slip * 20, -10], legL: [-30, 20], legR: [20, -10], lean: 10 + slip * 20 }} expr={t > 1.2 ? 'shout' : 'scared'} mouth={t > 1.2 ? .4 : 0} seed={22} rim="#ff6a5a" />
          {grab > 0 && [0, 1, 2].map(i => <ellipse key={i} cx={760} cy={1380 + i * 60} rx={110} ry={26} fill="none" stroke="#5a0a12" strokeWidth={26 * grab} />)}
        </g>
        {slip < .9 && <Hand x={760 - slip * 40} y={600 + slip * 120} />}
        {/* Кирилл держится левой, правую тянет к Лёхе */}
        <Figure x={330} y={1720} s={1.0} t={t} L={KL} C={KC} pose={{ ...POSES.stand, armL: [-170, 0], armR: t > 1.6 ? [110 + Math.sin(t * 9) * 4, -10] : [40, -40], legL: [-20, 20], legR: [26, -10], lean: 12 }} expr={t > 2.6 ? 'shout' : 'scared'} turn={.5} lookX={.9} seed={3} rim="#ff6a5a" />
        <Hand x={300} y={700} />
        {/* Тимур у заднего поручня, лоб рассечён осколком */}
        <Figure x={120} y={1820} s={.85} t={t} L={LK.timur} C={CS.timur} pose={{ ...POSES.stand, armR: [170, -10], armL: [150, -20], crouch: 40, lean: 16 }} expr="cry" seed={41} rim="#ff6a5a" />
        {t > smash + .1 && <TimurCut x={120} y={1820 - 820 * .85 + 40} s={.85} />}
        {t > smash && Array.from({ length: 18 }).map((_, i) => { const q = clamp((t - smash) / 1.0), a = h1(i * 3) * Math.PI * 2, r = 100 + h1(i * 7) * 600; const x = 980 + Math.cos(a) * r * q, y = 700 + Math.sin(a) * r * q; return <polygon key={i} points={`${x},${y - 14} ${x + 10},${y + 6} ${x - 8},${y + 8}`} fill="#c8d0e0" opacity={1 - q} />; })}
      </g>
    </g>
  </Frame>;
};

// i3b: щупальце обвивает ногу Кирилла и тащит к разбитому окну; он держится за поручень, Тимур хватает его за куртку: «Кирилл! Держись!»
export const I3b: React.FC<SP> = ({ t }) => {
  const c = caps('i3b'), drag = ease(t, .3, 1.6) * (1 - ease(t, 2.6, 3.4) * .3), [sx, sy] = shakeXY(t, [[.3, 24, .4]]);
  return <Frame t={t} grade="#3a0a10" gradeK={.15} impact={isImpact(t, .3, 2)}>
    <g transform={`translate(540 960) rotate(-20) translate(-540 -960) translate(${sx} ${sy})`}>
      <g transform={cam(1.15, 540, 1150)}>
        <TrainInterior t={t} flicker={1} red={2} shake={4} />
        <rect width={1080} height={1920} fill="#2a0206" opacity={.35} />
        <Pole x={260} />
        <Tentacle t={t} x0={1300} y0={1300} x1={560 + drag * 160} y1={1880} w={80} seed={9} />
        {[0, 1].map(i => <ellipse key={i} cx={560 + drag * 160} cy={1850 - i * 40} rx={60} ry={18} fill="none" stroke="#5a0a12" strokeWidth={20} />)}
        <g transform={`rotate(${-70 + drag * 10} 560 ${1880})`}><Figure x={560 + drag * 160} y={1880} s={1.0} t={t} L={{ ...KL, bruise: true }} C={KC} pose={{ ...POSES.stand, armL: [-170, 0], armR: [-160, 10], legL: [-10, 10], legR: [20, 30], lean: 0 }} expr="pain" seed={3} mouth={.3} /></g>
        <Hand x={260} y={1140} />
        <Figure x={140} y={1500} s={.9} t={t} L={LK.timur} C={CS.timur} pose={{ ...POSES.stand, armR: [100 + drag * 10, -20], armL: [-170, 0], crouch: 60, lean: 30 }} expr="shout" mouth={talk(t, c, 'ТИМУР')} seed={41} turn={.5} lookX={.9} />
        <TimurCut x={140} y={1500 - 820 * .9 + 40} s={.9} />
      </g>
    </g>
  </Frame>;
};

// i5 (v4): цепочка выхода видна: фонарь падает в глаз → глаз вспыхивает тёплым → воронка корчится и синеет → над вагоном раскрывается синий разлом → вагон втягивает вверх
export const I5: React.FC<SP> = ({ t, d }) => {
  const fall = ease(t, 0, 1.0, (k: number) => k * k), touch = 1.0, blue = ease(t, 1.4, 2.2), rift = ease(t, 2.0, 2.8), pull = ease(t, 2.6, d, (k: number) => k * k);
  return <Frame t={t} vign={.9} over={<g><Flash t={t} t0={touch} dur={.4} color={WARM} max={.7} /><Flash t={t} t0={2.0} dur={.4} color="#bfe8ff" max={.5} /></g>}>
    <rect width={1080} height={1920} fill="#05030a" />
    <g opacity={1 - blue}><Vortex t={t * (1 + blue * 4)} x={540} y={1500} s={1.3} eye={t < touch ? 1 : 1 - ease(t, touch, touch + .6)} /></g>
    <g opacity={blue}><g transform="translate(540 1500) scale(1.3 .65)">{Array.from({ length: 5 }).map((_, j) => <circle key={j} r={100 + j * 100} fill="none" stroke={j % 2 ? '#5fd2ff' : '#2a8aff'} strokeWidth={20} strokeDasharray="200 80" transform={`rotate(${t * 60 * (j % 2 ? 1 : -1)})`} opacity={.7} />)}</g></g>
    {[0, 1, 2, 3].map(i => <Tentacle key={i} t={t} x0={420 + i * 80} y0={1500} x1={300 + i * 160} y1={1500 - (900 - i * 80) * (1 - ease(t, .6, 1.4))} w={60} seed={i} />)}
    {t < touch + .1 && <LanternHead t={t} x={560} y={500 + fall * 1000} s={.5 * (1 - fall * .4)} broken />}
    {t > touch && t < touch + .6 && <circle cx={540} cy={1500} r={200 + (t - touch) * 600} fill="none" stroke={WARM} strokeWidth={20} opacity={1 - (t - touch) / .6} filter="url(#glow)" />}
    {rift > 0 && <Gate x={540} y={420} s={1.2 * rift} t={t} />}
    <g transform={`translate(0 ${-pull * 520})`}><BigCar x={700} y={980} s={.55} rot={30 - pull * 50} dmg={1} /></g>
    {rift > 0 && <Motes t={t} x={540} y={800} w={1000} h={900} n={30} color="#7fe0ff" speed={-300} k={rift} />}
  </Frame>;
};

// i6 (v4): Кирилл лежит в разбитом вагоне (поезд выбросило на «Северную»); Тимур на коленях (лоб в крови) зажимает ему рану ладонями: «Кирилл! Не умирай!» → «Я умирал. Я это чувствовал.»
export const I6: React.FC<SP> = ({ t, d }) => {
  const c = caps('i6'), dark = ease(t, d - 1.6, d - .2), press = Math.sin(t * 6) * 6;
  return <Frame t={t} grade="#1a1a2a" gradeK={.15} over={<Lids k={dark * .9} />}>
    <g transform="translate(540 960) rotate(-6) scale(1.2) translate(-540 -960)"><TrainInterior t={t} flicker={.7} red={1.2} /></g>
    <rect width={1080} height={1920} fill="#0a0408" opacity={.45} />
    <g transform={cam(1.0 + t * .02, 540, 1000)}>
      <Pool x={560} y={1380} k={.6 + ease(t, 0, d) * .4} w={380} />
      {/* Кирилл лежит на спине (вид сбоку) */}
      <g transform="rotate(-90 1000 1420)"><Figure x={1000} y={1420} s={.95} t={t} L={{ ...KL, bruise: true, skin: '#e0ccc4' }} C={KC} pose={{ ...POSES.stand, armL: [-20, 10], armR: [30, -10] }} expr="pain" lid={Math.max(0, .5 - dark * .5)} noBlink seed={3} breathe={false} /></g>
      <rect x={560} y={1330} width={120} height={70} rx={20} fill="#a80c18" opacity={.85} />
      {/* Тимур на коленях, руки на ране */}
      <Figure x={560} y={1360} s={.95} t={t} L={LK.timur} C={CS.timur} pose={{ ...POSES.stand, crouch: 250, lean: 30, armL: [-20, 60 + press], armR: [10, -50 - press], legL: [-50, 120], legR: [40, -100] }} expr="cry" tears={1} mouth={talk(t, c, 'ТИМУР')} seed={41} lookY={.8} turn={-.2} />
      <TimurCut x={560} y={1360 - 820 * .95 + 250 + 40} s={.95} />
    </g>
  </Frame>;
};

// j1b: Кирилл смотрит в окно больницы; поверх — четыре плашки погибших гаснут одна за другой: «Из шестерых нас осталось двое.»
export const J1b: React.FC<SP> = ({ t }) => (
  <Frame t={t} grade="#1a2a3a" gradeK={.1}>
    <rect width={1080} height={1920} fill="#cfd6de" />
    <g transform={cam(1.0 + t * .03, 540, 900)}><g transform="translate(540 1050) scale(5.4)"><Head t={t} L={{ ...LK.kWeak, plaster: false, tired: false }} expr="sad" seed={3} lookX={.5} lookY={-.1} tears={ease(t, 2.0, 3.5)} /></g></g>
    {['МИХАЛЫЧ', 'ЛЁХА', 'ЖОРА', 'СЕРЁГА'].map((n, i) => { const k = ease(t, .5 + i * .45, .8 + i * .45), off = ease(t, 3.2 + i * .25, 3.6 + i * .25); return <g key={n} opacity={k * (1 - off * .7)} transform={`translate(${200 + (i % 2) * 680} ${300 + Math.floor(i / 2) * 140})`}>
      <rect x={-150} y={-44} width={300} height={70} rx={10} fill="#06182e" opacity={.8} stroke="#8a9ab0" strokeWidth={3} /><text y={4} textAnchor="middle" fontFamily="Oswald" fontWeight={600} fontSize={42} letterSpacing={6} fill="#e8f0f8">{n}</text>
      {off > 0 && <line x1={-130} x2={-130 + 260 * off} y1={-6} y2={-6} stroke="#ff4a5a" strokeWidth={5} />}</g>; })}
  </Frame>
);

// ---------- больница (v5): вид от изножья кровати; Кирилл лежит на подушке; интерьер палаты; окно — рассвет, берёза, снег ----------
const HospitalRoom: React.FC<{ t: number; beep: number }> = ({ t, beep }) => <g>
  {/* стены, пол, плинтус */}
  <rect width={1080} height={1920} fill="#c9d6d4" /><rect y={0} width={1080} height={120} fill="#e6eceb" />
  <rect y={1240} width={1080} height={680} fill="#8e9c9a" /><rect y={1232} width={1080} height={14} fill="#6e7c7a" />
  {Array.from({ length: 7 }).map((_, i) => <line key={i} x1={i * 180} y1={1246} x2={i * 180 - 200} y2={1920} stroke="#7e8c8a" strokeWidth={3} />)}
  <rect x={0} y={760} width={1080} height={8} fill="#b4c2c0" />
  {/* потолочная лампа */}
  <rect x={340} y={40} width={400} height={36} rx={10} fill="#f4f8f8" stroke="#a8b4b2" strokeWidth={4} /><ellipse cx={540} cy={90} rx={360} ry={60} fill="#fffbe8" opacity={.25} filter="url(#blur30)" />
  {/* окно: рама с переплётом, подоконник, батарея; за стеклом рассвет, ветки берёзы, снег */}
  <g transform="translate(700 220)">
    <defs><clipPath id="hwin"><rect x={0} y={0} width={320} height={460} /></clipPath><linearGradient id="dawn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4a6aa8" /><stop offset=".55" stopColor="#e8a8a0" /><stop offset="1" stopColor="#ffd8a0" /></linearGradient></defs>
    <g clipPath="url(#hwin)">
      <rect width={320} height={460} fill="url(#dawn)" />
      <circle cx={90} cy={420} r={46} fill="#fff0c8" opacity={.9} /><circle cx={90} cy={420} r={110} fill="#ffe0b0" opacity={.35} filter="url(#blur30)" />
      <path d="M0 440 Q80 420 160 436 T320 430 L320 460 L0 460Z" fill="#f4f0f4" opacity={.8} />
      <path d="M250 460 C246 360 262 260 250 0" stroke="#f0eee8" strokeWidth={22} fill="none" />{[60, 140, 220, 320, 400].map((y, i) => <rect key={i} x={240} y={y} width={18} height={5} fill="#2a2a2a" />)}
      {[[250, 120, -1], [252, 230, -1], [250, 330, 1], [254, 60, 1]].map(([x, y, sd], i) => <path key={i} d={`M${x} ${y} q${sd * 60} ${10} ${sd * 120} ${50 + Math.sin(t * .8 + i) * 4}`} stroke="#5a4a40" strokeWidth={4} fill="none" />)}
      {Array.from({ length: 26 }).map((_, i) => { const y = ((t * 40 + h1(i) * 460) % 480) - 10, x = (h1(i * 3) * 320 + Math.sin(t + i) * 12); return <circle key={i} cx={x} cy={y} r={2 + h1(i * 7) * 2.5} fill="#fff" opacity={.85} />; })}
    </g>
    <rect x={-14} y={-14} width={348} height={488} fill="none" stroke="#f4f6f6" strokeWidth={22} /><rect x={154} y={0} width={12} height={460} fill="#f4f6f6" /><rect x={0} y={200} width={320} height={12} fill="#f4f6f6" />
    <rect x={-30} y={474} width={380} height={26} rx={4} fill="#eef2f2" stroke="#b8c4c2" strokeWidth={3} />
    {/* жалюзи приподняты */}
    <rect x={-10} y={-10} width={340} height={70} fill="#e8ecea" opacity={.9} />{[0, 1, 2, 3].map(i => <line key={i} x1={-10} x2={330} y1={0 + i * 16} y2={0 + i * 16} stroke="#c0c8c6" strokeWidth={3} />)}
    <rect x={0} y={530} width={320} height={130} rx={10} fill="#e8ecea" stroke="#b0bcba" strokeWidth={4} />{Array.from({ length: 9 }).map((_, i) => <rect key={i} x={20 + i * 33} y={545} width={16} height={100} rx={6} fill="#d8dedc" />)}
  </g>
  {/* дверь со стеклом и шторка на карнизе */}
  <rect x={40} y={340} width={210} height={900} fill="#d8ccb8" stroke="#a89c88" strokeWidth={6} /><rect x={80} y={400} width={130} height={220} fill="#bfd0dc" stroke="#a89c88" strokeWidth={5} /><circle cx={225} cy={820} r={14} fill="#9a9a9a" />
  <line x1={20} x2={600} y1={150} y2={150} stroke="#b0b8b8" strokeWidth={8} />
  <path d="M480 150 Q470 600 500 1180 L600 1180 Q570 600 590 150Z" fill="#9ec0c8" opacity={.9} />{[500, 530, 560].map((x, i) => <path key={i} d={`M${x} 160 Q${x - 10} 600 ${x + 10} 1170`} stroke="#86aab4" strokeWidth={4} fill="none" />)}
  {/* панель над кроватью: розетки, кислород, лампа */}
  <rect x={300} y={560} width={480} height={70} rx={8} fill="#eef2f2" stroke="#a8b4b2" strokeWidth={4} />{[340, 400, 460].map((x, i) => <rect key={i} x={x} y={578} width={36} height={36} rx={6} fill="#fff" stroke="#9aa4a2" strokeWidth={3} />)}
  <circle cx={560} cy={596} r={14} fill="#3a8a5a" /><circle cx={620} cy={596} r={14} fill="#3a5a9a" /><rect x={680} y={584} width={70} height={24} rx={6} fill="#fffbe8" />
  {/* монитор на кронштейне */}
  <line x1={860} y1={630} x2={860} y2={760} stroke="#8a9492" strokeWidth={10} />
  <rect x={760} y={760} width={220} height={150} rx={10} fill="#0a1410" stroke="#3a4448" strokeWidth={8} />
  <path d={`M778 840 ${Array.from({ length: 17 }).map((_, i) => { const x = 778 + i * 11, u = ((i / 17) - beep + 1) % 1; return `L${x} ${840 - (u < .07 ? 46 : u < .12 ? -24 : 0)}`; }).join(' ')}`} stroke="#3aff8a" strokeWidth={4} fill="none" filter="url(#glow)" />
  <text x={960} y={790} textAnchor="end" fontFamily="JBM, monospace" fontSize={22} fill="#3aff8a">72</text>
  {/* капельница */}
  <line x1={200} y1={420} x2={200} y2={1330} stroke="#9aa4a2" strokeWidth={8} /><line x1={160} y1={430} x2={240} y2={430} stroke="#9aa4a2" strokeWidth={6} />
  <path d="M180 440 h44 v100 q-22 24 -44 0Z" fill="#e8f4f8" stroke="#8ab0c0" strokeWidth={3} opacity={.9} /><rect x={184} y={480} width={36} height={56} fill="#cfe8f0" opacity={.8} />
  <path d="M202 560 C260 800 520 1000 670 1220" stroke="#c0d8e0" strokeWidth={4} fill="none" />
  {[0, 1].map(i => <circle key={i} cx={202} cy={548 + ((t * 60 + i * 10) % 14)} r={2.5} fill="#8ab0c0" />)}
  {/* тумбочка: стакан воды, мандарины */}
  <rect x={800} y={1080} width={220} height={260} rx={8} fill="#e8e0d0" stroke="#b0a890" strokeWidth={5} /><line x1={800} y1={1160} x2={1020} y2={1160} stroke="#b0a890" strokeWidth={4} />
  <rect x={830} y={1020} width={40} height={62} rx={4} fill="#d8eef4" opacity={.8} stroke="#9ab8c4" strokeWidth={3} />
  {[[920, 1064], [956, 1068], [938, 1048]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={18} fill="#ff9a2a" stroke="#c8701a" strokeWidth={3} />)}
</g>;
// j1 (v5): Кирилл лежит (вид от изножья): открывает глаза, проводит рукой по боку — раны нет; Настя спит, уронив голову на край кровати, — просыпается: «Кирилл?.. Ты очнулся!»
export const J1: React.FC<SP> = ({ t }) => {
  const c = caps('j1'), open = ease(t, .8, 1.8), wake = c?.[1] ? ease(t, c[1][2] - .7, c[1][2]) : 0, feel = ease(t, 2.0, 2.8) * (1 - ease(t, 3.3, 3.8)), beep = (t * 1.1) % 1;
  return <Frame t={t} grade="#2a3040" gradeK={.05}>
    <g transform={cam(1.0 + t * .015, 540, 1000, 0, 0)}>
      <HospitalRoom t={t} beep={beep} />
      <g opacity={ease(t, .1, .5) * (1 - ease(t, 1.9, 2.4))}><rect x={240} y={330} width={600} height={170} rx={16} fill="#1a2430" opacity={.75} />
        <text x={540} y={420} textAnchor="middle" fontFamily="Oswald" fontWeight={600} fontSize={84} letterSpacing={14} fill="#f4f8fa">СРЕДА</text>
        <text x={540} y={475} textAnchor="middle" fontFamily="Oswald" fontWeight={400} fontSize={36} letterSpacing={8} fill="#b8c8d8">07:40 · ТРИ ДНЯ СПУСТЯ</text></g>
      {/* кровать в перспективе: изголовье, матрас, одеяло */}
      <rect x={300} y={640} width={480} height={200} rx={20} fill="#9aa8b4" stroke="#5a6874" strokeWidth={6} />
      <path d="M300 820 L780 820 L960 1560 L120 1560Z" fill="#f4f6f8" stroke="#9aa4ae" strokeWidth={6} />
      <path d="M120 1560 L960 1560 L960 1640 L120 1640Z" fill="#7a8894" />{[160, 920].map(x => <rect key={x} x={x - 10} y={1640} width={20} height={100} fill="#5a6874" />)}
      {/* подушка */}
      <path d="M410 840 Q540 812 670 840 Q686 920 670 950 Q540 972 410 950 Q396 912 410 840Z" fill="#ffffff" stroke="#b8c2cc" strokeWidth={5} />
      <path d="M424 942 Q540 962 656 942" stroke="#d8e0e8" strokeWidth={7} fill="none" />
      {/* Кирилл: голова на подушке, плечи в голубой пижаме */}
      <path d="M450 985 Q540 950 630 985 L650 1060 L430 1060Z" fill="#7ea6c8" stroke="#3a5a7a" strokeWidth={4} />
      <path d="M522 970 L540 994 L558 970" stroke="#3a5a7a" strokeWidth={3} fill="none" />
      <g transform={`translate(540 ${905 + Math.sin(t * 1.8) * 1.5}) scale(1.0)`}><Head t={t} L={{ ...LK.kWeak, plaster: false, tired: false }} expr={wake > .5 ? 'sad' : open > .5 ? 'scared' : 'calm'} seed={3} lid={open} noBlink={open < 1} lookX={wake > .3 ? -.7 : 0} lookY={feel > .3 ? .8 : 0} tears={wake * .5} /></g>
      {/* одеяло — тёмно-бирюзовое, складки, дыхание */}
      <path d={`M330 ${1040 + Math.sin(t * 1.8) * 4} Q540 ${1010 + Math.sin(t * 1.8) * 6} 750 ${1040 + Math.sin(t * 1.8) * 4} L930 1540 L150 1540Z`} fill="#3a7a86" stroke="#1e4a54" strokeWidth={6} />
      <path d="M330 1040 Q540 1010 750 1040 L760 1080 Q540 1050 320 1080Z" fill="#f4f6f8" stroke="#9aa4ae" strokeWidth={4} />
      {[[400, 1200, 300, 1500], [560, 1180, 560, 1520], [700, 1200, 800, 1500]].map(([a, b, c2, d2], i) => <path key={i} d={`M${a} ${b} Q${(a + c2) / 2 + 30} ${(b + d2) / 2} ${c2} ${d2}`} stroke="#2a6470" strokeWidth={6} fill="none" opacity={.7} />)}
      {/* правая рука: поверх одеяла (с катетером), затем — к боку */}
      <path d={`M640 1000 Q${720 - feel * 40} ${1130 - feel * 30} ${690 - feel * 90} ${1230 - feel * 110}`} stroke="#7ea6c8" strokeWidth={34} strokeLinecap="round" fill="none" />
      <circle cx={690 - feel * 90} cy={1230 - feel * 110} r={20} fill="#f0d4c4" stroke={INK} strokeWidth={3} /><rect x={672 - feel * 90} y={1212 - feel * 110} width={20} height={10} fill="#fff" opacity={.9} />
      {feel > .3 && <rect x={570} y={1100} width={60} height={24} rx={8} fill="#f0d4c4" stroke="#c8a090" strokeWidth={3} opacity={(feel - .3) * 1.4} />}
      {/* Настя — целая фигура на стуле слева: сидит прямо, дремлет, голова опущена → поднимает голову, рука ко рту */}
      <rect x={60} y={1340} width={230} height={26} rx={6} fill="#6a5a4a" /><rect x={60} y={1020} width={24} height={340} fill="#6a5a4a" /><rect x={70} y={1366} width={18} height={220} fill="#4a3a2a" /><rect x={270} y={1366} width={18} height={220} fill="#4a3a2a" />
      <Figure x={175} y={1600} s={.9} t={t} L={LK.nastya} C={CS.nastya} pose={{ ...POSES.stand, crouch: 230, legL: [-14, 96], legR: [14, -96], lean: 0, head: 18 * (1 - wake),
        armL: [-10, 70], armR: wake > .4 ? [30, -150] : [10, -70] }} expr={wake > .5 ? 'cry' : 'calm'} lid={wake} noBlink={wake < .5} tears={wake} mouth={talk(t, c, 'НАСТЯ')} lookX={.6} turn={.35} seed={9} />
    </g>
  </Frame>;
};
