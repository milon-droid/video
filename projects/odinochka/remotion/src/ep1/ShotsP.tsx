// Поезд v5 (сценарий пользователя ep1-v5-poezd-scenariy.md): поезд — уже подземелье.
// Платформа → посадка → пассажиры не моргают → «Конечная» → головы по одному → двери не открываются → нападение → Кирилл вытаскивает Тимура →
// торможение, пассажиры замирают → двери: фигура в форме → в глубине платформы отец → «Папа?..» → «выйдет только один» → титр.
import React from 'react';
import { clamp, ease, noise, spr } from '../anim';
import { cam, Flash, Fog, h1, isImpact, Motes, Smoke, SpeedLines, shakeXY } from '../kit/fx';
import { FONT, Title } from '../kit/ui';
import { MetroStation, TrainInterior } from '../bg/places';
import { Figure, PK, Pose, POSES, walkPose } from '../chars/body';
import { Head } from '../chars/head';
import { Machinist } from '../chars/monsters';
import { CS, LK } from '../chars/cast';
import { Frame, SP, talk } from './common';
import { SHOTS } from './timeline';
const caps = (id: string) => SHOTS.find(s => s.id === id)?.caps;
const KL = LK.kWeakHurt, KC = CS.porterY;

// ---------- вагон: места пассажиров и охотников (одинаковы во всех планах) ----------
const VP = 820;
const SEATS = [0, 1, 2, 3].flatMap(i => [-1, 1].map(sd => ({ i, sd, k: Math.pow(.78, i), who: ['pA', 'pB', 'pC', 'pD', 'pE'][(i * 2 + (sd > 0 ? 1 : 0)) % 5] })));
// пассажир: сидит (крупно — за спинкой сиденья), смотрит через проход, не моргает. turnTo 0..1 — повернул голову к охотникам, stand 0..1 — встаёт, reach 0..1 — тянет руки
type PState = { turnTo?: number; stand?: number; reach?: number; freeze?: boolean };
const Pass: React.FC<{ t: number; s: typeof SEATS[0]; st?: PState; jolt?: number }> = ({ t, s, st = {}, jolt = 0 }) => {
  const { k, sd } = s, x = 540 + sd * (400 * k + 60), y = VP + 600 * k, sc = k * 1.15;
  const tt = st.turnTo || 0, up = st.stand || 0, re = st.reach || 0;
  const pose: Pose = { ...POSES.stand, crouch: 150 * (1 - up), lean: jolt * 4 + re * 14 * -sd, armL: [-20 - re * 70 * (sd > 0 ? 1 : .4), 60 - re * 50], armR: [20 + re * 70 * (sd < 0 ? 1 : .4), -60 + re * 50], head: 0 };
  return <g>
    <Figure x={x + re * -sd * 60 * k} y={y} s={sc} t={st.freeze ? 0 : t} L={LK[s.who]} C={CS[s.who]} pose={pose} seed={30 + s.i * 2 + (sd > 0 ? 1 : 0)} noBlink idle={false} breathe={!st.freeze}
      turn={-sd * .6 * (1 - tt)} lookX={-sd * .8 * (1 - tt)} lookY={tt * .15} expr={re > .3 ? 'angry' : 'calm'} mouth={re > .5 ? .5 : 0} />
    {up < .5 && <rect x={x - 130 * k} y={y - 210 * k} width={260 * k} height={220 * k} rx={14 * k} fill="#5a2a2a" stroke="#1a0c0c" strokeWidth={4 * k} opacity={1 - up * 2} />}
  </g>;
};
const Passengers: React.FC<{ t: number; st?: (s: typeof SEATS[0], idx: number) => PState; jolt?: number }> = ({ t, st = () => ({}), jolt = 0 }) =>
  <g>{SEATS.map((s, idx) => ({ s, idx })).sort((a, b) => b.s.i - a.s.i).map(({ s, idx }) => <Pass key={idx} t={t} s={s} st={st(s, idx)} jolt={jolt} />)}</g>;

// охотники у дверей на переднем плане: одни и те же места
const GROUP = { mikh: [770, 1880, 1.0], zhora: [930, 1930, 1.08], r1: [600, 1850, .9], r2: [470, 1840, .88], kirill: [320, 1920, 1.0], timur: [170, 1950, .92] } as Record<string, number[]>;
const Hunter: React.FC<{ t: number; who: string; pose?: Pose; dx?: number; dy?: number; expr?: any; lookX?: number; lookY?: number; turn?: number; mouth?: number; rim?: string; rot?: number }> = ({ t, who, pose = POSES.stand, dx = 0, dy = 0, ...p }) => {
  const [x, y, s] = GROUP[who]; const L = who === 'kirill' ? KL : LK[who], C = who === 'kirill' ? KC : CS[who];
  return <Figure x={x + dx} y={y + dy} s={s} t={t} L={L} C={C} pose={pose} seed={{ mikh: 6, zhora: 7, r1: 21, r2: 22, kirill: 3, timur: 41 }[who]} {...p} />;
};
// толчок вагона: короткий наклон корпуса (не раскачивание)
const joltAt = (t: number, list: number[]) => list.reduce((a, t0) => a + (t > t0 && t < t0 + .5 ? Math.sin((t - t0) / .5 * Math.PI) : 0), 0);
// окна вагона: что за ними (тьма тоннеля с бегущими огнями / платформа)
const Windows: React.FC<{ t: number; speed?: number; platform?: number }> = ({ t, speed = 1, platform = 0 }) => <g>
  {[0, 1, 2, 3].map(i => { const k = Math.pow(.78, i * 2), top = VP - 760 * k + 120 * k, h = 260 * k; return [-1, 1].map(sd => { const x = sd < 0 ? 540 - 590 * k + 20 * k : 540 + 590 * k - 180 * k;
    return <g key={i + '' + sd}><defs><clipPath id={`w${i}${sd}`}><rect x={x} y={top} width={160 * k} height={h} /></clipPath></defs>
      <g clipPath={`url(#w${i}${sd})`}><rect x={x} y={top} width={160 * k} height={h} fill={platform > 0 ? '#3a3020' : '#020306'} />
        {platform > 0 ? <rect x={x} y={top + h * .2} width={160 * k} height={h * .5} fill="#ffd890" opacity={.5 * platform} />
          : Array.from({ length: 3 }).map((_, j) => <rect key={j} x={x + ((t * 900 * speed * k + j * 120 * k) % (220 * k)) - 40 * k} y={top + h * .45} width={40 * k} height={6 * k} fill="#ffe8a0" opacity={.8 * Math.min(1, speed)} />)}</g></g>; }); })}
</g>;

// ---------- планы ----------
// p13: платформа — указатель «Вход в подземелье — следующая станция», поезд с открытыми дверями, посадка (Михалыч первым, Кирилл и Тимур последними)
export const P13: React.FC<SP> = ({ t }) => {
  const order = ['mikh', 'zhora', 'r1', 'r2'];
  return <Frame t={t} grade="#1a2a4a" gradeK={.15}>
    <g transform={cam(1.02 + t * .02, 540, 1000)}>
      <MetroStation t={t} />
      <rect x={60} y={760} width={960} height={420} rx={30} fill="#2a4a6a" stroke="#0a0c14" strokeWidth={8} />
      {[0, 1, 2].map(i => <g key={i}><rect x={120 + i * 320} y={800} width={180} height={140} fill="#ffe8b0" opacity={.55} />
        <rect x={130 + i * 320 + (i === 1 ? -50 : 0)} y={950} width={i === 1 ? 260 : 0} height={230} fill="#ffe8b0" opacity={.7} /></g>)}
      {/* указатель */}
      <g transform="translate(540 300)"><rect x={-420} y={-70} width={840} height={140} rx={10} fill="#0c2a6a" stroke="#e8e8e0" strokeWidth={6} />
        <text x={0} y={-8} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={44} fill="#fff">ВХОД В ПОДЗЕМЕЛЬЕ</text>
        <text x={0} y={46} textAnchor="middle" fontFamily={FONT} fontWeight={600} fontSize={36} fill="#9fd0ff">следующая станция →</text></g>
      {order.map((w, i) => { const t0 = .2 + i * .55, q = ease(t, t0, t0 + .9); return q < 1 && <Figure key={w} x={540 + (1 - q) * (i % 2 ? 260 : -260)} y={1180 + (1 - q) * 500} s={.6 + (1 - q) * .35} t={t} L={LK[w]} C={CS[w]} pose={walkPose(t * 120 + i * 60)} seed={50 + i} opacity={1 - Math.max(0, q - .8) * 5} />; })}
      <Figure x={330} y={1820} s={.95} t={t} L={LK.timur} C={CS.timur} pose={POSES.stand} expr="scared" seed={41} turn={.4} lookX={.6} />
      <Figure x={620} y={1840} s={1.0} t={t} L={KL} C={KC} pose={POSES.stand} expr="sad" seed={3} turn={-.2} lookY={-.3} />
    </g>
  </Frame>;
};

// p14: у дверей вагона — Тимур боится, Кирилл: «Держись за мной»
export const P14: React.FC<SP> = ({ t }) => {
  const c = caps('p14');
  return <Frame t={t} grade="#1a2a4a" gradeK={.15}>
    <g transform={cam(1.12 + t * .02, 540, 1000)}>
      <MetroStation t={t} />
      <rect x={-40} y={600} width={1160} height={900} fill="#2a4a6a" /><rect x={300} y={700} width={480} height={800} fill="#ffe8b0" opacity={.6} />
      <Figure x={360 + noise('tr', t, 8) * 3} y={1760} s={1.15} t={t} L={LK.timur} C={CS.timur} pose={{ ...POSES.stand, armL: [-20, 100], armR: [20, -100], crouch: 20 }} expr="scared" seed={41} turn={.4} lookX={.5} mouth={talk(t, c, 'ТИМУР')} sweat={1} />
      <Figure x={760} y={1780} s={1.2} t={t} L={KL} C={KC} pose={t > 1.8 ? PK(t - 1.8, [[0, 'stand'], [.4, { armL: [-82, 18] }]]) : POSES.stand} expr={t > 2 ? 'determined' : 'sad'} seed={3} turn={-.45} lookX={-.7} mouth={talk(t, c, 'КИРИЛЛ')} />
    </g>
  </Frame>;
};

// p15: изнутри — последними порог пересекают Кирилл и Тимур, двери закрываются
export const P15: React.FC<SP> = ({ t }) => {
  const step = ease(t, .1, 1.1), cl = ease(t, 1.6, 2.1), [sx, sy] = shakeXY(t, [[2.1, 12, .4]]);
  return <Frame t={t} grade="#2a2a3a" gradeK={.15}>
    <g transform={cam(1.0, 540, 960, sx, sy)}>
      <rect width={1080} height={1920} fill="#2a2c34" />
      <rect x={240} y={260} width={600} height={1400} fill="#3a5070" /><rect x={260} y={300} width={560} height={1360} fill="#ffe8b0" opacity={.35} />
      <Figure x={460} y={1500 + step * 380} s={.9 + step * .3} t={t} L={LK.timur} C={CS.timur} pose={walkPose(step * 300)} expr="scared" seed={41} />
      <Figure x={640} y={1470 + step * 400} s={.95 + step * .3} t={t} L={KL} C={KC} pose={walkPose(step * 300 + 90)} expr="sad" seed={3} />
      <rect x={240 - 300 + cl * 300} y={240} width={300} height={1440} fill="#8a909a" stroke="#2a2e38" strokeWidth={10} />
      <rect x={840 - cl * 300} y={240} width={300} height={1440} fill="#7a808a" stroke="#2a2e38" strokeWidth={10} />
      <rect x={0} y={0} width={240} height={1920} fill="#1c1e24" /><rect x={840} y={0} width={240} height={1920} fill="#1c1e24" />
    </g>
  </Frame>;
};

// p16: общий план — группа у дверей, пассажиры вдоль стен, свободный проход; Жора: «Отлично… прокатимся»
export const P16: React.FC<SP> = ({ t }) => {
  const c = caps('p16');
  return <Frame t={t} grade="#2a2a3a" gradeK={.15}>
    <g transform={cam(1.0 + t * .015, 540, 1100)}>
      <TrainInterior t={t} flicker={.15} vp={VP} /><Windows t={t} speed={0} platform={1} />
      <Passengers t={t} />
      {['timur', 'r2', 'r1', 'kirill', 'mikh', 'zhora'].map(w => <Hunter key={w} t={t} who={w} expr={w === 'zhora' ? 'smirk' : w === 'timur' ? 'scared' : 'calm'} mouth={w === 'zhora' ? talk(t, c, 'ЖОРА') : 0} turn={w === 'zhora' ? -.3 : 0} />)}
    </g>
  </Frame>;
};

// p17: пассажир крупно — не моргает; Кирилл замечает (он моргает и хмурится)
export const P17: React.FC<SP> = ({ t }) => {
  const cut = 1.7;
  if (t < cut) return <Frame t={t} grade="#2a2a3a" gradeK={.18}>
    <rect width={1080} height={1920} fill="#26282e" /><rect x={0} y={0} width={1080} height={700} fill="#020306" />
    <g transform={cam(1 + t * .05, 540, 700)}><g transform="translate(540 700) scale(5.6)"><Head t={0} L={LK.pA} expr="calm" noBlink seed={30} lookX={-.2} /></g></g>
  </Frame>;
  return <Frame t={t} grade="#2a2a3a" gradeK={.18}>
    <rect width={1080} height={1920} fill="#26282e" />
    <g transform={cam(1 + (t - cut) * .05, 540, 700)}><g transform="translate(540 700) scale(5.6)"><Head t={t} L={KL} expr={t > cut + .8 ? 'scared' : 'sad'} seed={3} lookX={.5} lid={t > cut + .3 && t < cut + .45 ? .05 : 1} /></g></g>
  </Frame>;
};

// p18: поезд тронулся — платформа уходит из окон; «Следующая станция — Конечная», на схеме гаснут станции
export const P18: React.FC<SP> = ({ t }) => {
  const sp = ease(t, 0, 1.5), j = joltAt(t, [.1]), plat = 1 - ease(t, 0, 1.2);
  const names = ['СЕВЕРНАЯ', 'ЛЕСНАЯ', 'ТИШИНА', 'НИЖНЯЯ', 'КОНЕЧНАЯ'];
  return <Frame t={t} grade="#2a2a3a" gradeK={.15}>
    <g transform={cam(1.0, 540, 1000, 0, j * 6)}>
      <TrainInterior t={t} flicker={.3} vp={VP} shake={sp * 1.5} /><Windows t={t} speed={sp} platform={plat} />
      <Passengers t={t} jolt={j} />
      {/* схема маршрута над дверью: станции гаснут по одной, остаётся «Конечная» */}
      <g transform="translate(540 200)"><rect x={-470} y={-60} width={940} height={150} fill="#f0eee8" stroke="#2a2a30" strokeWidth={6} />
        <line x1={-400} x2={400} y1={0} y2={0} stroke="#c81e2a" strokeWidth={10} />
        {names.map((n, i) => { const off = i < 4 && t > 1.2 + i * .45; return <g key={n} transform={`translate(${-400 + i * 200} 0)`} opacity={off ? .15 : 1}>
          <circle r={18} fill={i === 4 ? '#c81e2a' : '#fff'} stroke="#c81e2a" strokeWidth={6} /><text y={58} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={24} fill="#222">{n}</text></g>; })}</g>
      {['timur', 'r2', 'r1', 'kirill', 'mikh', 'zhora'].map(w => <Hunter key={w} t={t} who={w} pose={{ ...POSES.stand, lean: -j * 6 }} lookY={-.4} expr={w === 'timur' ? 'scared' : 'calm'} />)}
    </g>
  </Frame>;
};

// p19: первое движение — один пассажир поворачивает голову, затем второй, затем все разом; все смотрят на группу
export const P19: React.FC<SP> = ({ t }) => {
  const j = joltAt(t, [1.6]);
  const st = (s: typeof SEATS[0], idx: number) => ({ turnTo: idx === 2 ? ease(t, .3, .9) : idx === 5 ? ease(t, 1.1, 1.7) : ease(t, 2.3, 2.6) });
  return <Frame t={t} grade="#2a2228" gradeK={.15}>
    <g transform={cam(1.08 + ease(t, 2.3, 3.4) * .12, 540, 1000)}>
      <TrainInterior t={t} flicker={.35} vp={VP} shake={1.5} /><Windows t={t} />
      <Passengers t={t} st={st} jolt={j} />
      {['timur', 'r2', 'r1', 'kirill', 'mikh', 'zhora'].map(w => <Hunter key={w} t={t} who={w} pose={{ ...POSES.stand, lean: -j * 5 }} expr={t > 2.4 ? 'scared' : 'calm'} lookY={-.2} />)}
    </g>
  </Frame>;
};

// p20: Кирилл касается плеча Тимура
export const P20: React.FC<SP> = ({ t }) => (
  <Frame t={t} grade="#2a2228" gradeK={.15}>
    <g transform={cam(1.3, 300, 1100)}>
      <TrainInterior t={t} flicker={.3} vp={VP} shake={1} /><Windows t={t} />
      <Hunter t={t} who="timur" expr="scared" lookX={-.6} turn={-.2} />
      <Hunter t={t} who="kirill" pose={PK(t, [[0, 'stand'], [.5, { armL: [-75, 25] }]])} expr="determined" turn={-.4} lookX={-.5} />
    </g>
  </Frame>
);

// p21: Михалыч дёргает двери — не поддаются; ближайший пассажир хватает его за запястье (замах → захват → реакция → освобождение → толчок)
export const P21: React.FC<SP> = ({ t }) => {
  const wind = ease(t, .9, 1.2), grab = t > 1.2 && t < 2.3, free = ease(t, 2.3, 2.6), push = ease(t, 2.6, 2.9);
  const [sx, sy] = shakeXY(t, [[1.2, 10, .3], [2.6, 14, .4]]);
  const mPose = t < 1.2 ? PK(t, [[0, { armL: [-60, 40], armR: [-30, -20], lean: -6 }], [.4, { armL: [-60, 70], armR: [-40, -10], lean: -10 }], [.7, { armL: [-60, 40], armR: [-30, -20], lean: -6 }]]) : grab ? { ...POSES.hit, armR: [70, -10], lean: 8 } : PK(t - 2.3, [[0, { armR: [40, -60] }], [.3, { armR: [80, -20], lean: -10, fistR: true }]]);
  return <Frame t={t} impact={isImpact(t, 1.2, 2)} grade="#2a2228" gradeK={.15}>
    <g transform={cam(1.2, 760, 1150, sx, sy)}>
      <TrainInterior t={t} flicker={.35} vp={VP} shake={1.5} /><Windows t={t} />
      <rect x={880} y={700} width={200} height={1300} fill="#7a808a" stroke="#2a2e38" strokeWidth={8} />
      <Pass t={t} s={SEATS[1]} st={{ turnTo: 1, reach: grab ? 1 : wind * .7 * (1 - free), stand: grab ? .4 : 0 }} />
      <Hunter t={t} who="mikh" pose={mPose} expr={t < 1.2 ? 'determined' : grab ? 'pain' : 'angry'} dx={grab ? -20 : 0} />
      {grab && <circle cx={GROUP.mikh[0] + 120} cy={GROUP.mikh[1] - 560} r={30} fill="#d8d0c4" stroke="#0c0d18" strokeWidth={4} />}
    </g>
  </Frame>;
};

// p22: остальные пассажиры встают; группа готовится
export const P22: React.FC<SP> = ({ t }) => {
  const st = (s: typeof SEATS[0], idx: number) => ({ turnTo: 1, stand: ease(t, .2 + (idx % 4) * .3, .9 + (idx % 4) * .3) });
  return <Frame t={t} grade="#3a1a20" gradeK={.15}>
    <g transform={cam(1.05, 540, 1050)}>
      <TrainInterior t={t} flicker={.5} vp={VP} shake={2} /><Windows t={t} />
      <Passengers t={t} st={st} />
      {['timur', 'r2', 'r1', 'kirill', 'mikh', 'zhora'].map(w => <Hunter key={w} t={t} who={w} pose={w === 'timur' ? POSES.stand : POSES.guard} expr={w === 'zhora' ? 'angry' : 'scared'} />)}
    </g>
  </Frame>;
};

// p23: нападение у дверей — пассажиры наступают по проходу, Жора бьёт одного
export const P23: React.FC<SP> = ({ t }) => {
  const adv = ease(t, 0, 3.6), hit = 1.6, [sx, sy] = shakeXY(t, [[hit, 22, .5]]);
  return <Frame t={t} impact={isImpact(t, hit, 2)} grade="#3a1a20" gradeK={.15}>
    <g transform={cam(1.05, 540, 1050, sx + noise('h23', t, 2) * 6, sy)}>
      <TrainInterior t={t} flicker={.6} vp={VP} shake={2} /><Windows t={t} />
      {[0, 1, 2, 3].map(i => { const k = Math.pow(.8, 3 - i - adv * 1.4), y = VP + 600 * Math.min(1.3, k); const knocked = i === 3 && t > hit;
        return <Figure key={i} x={540 + (i % 2 ? 90 : -90) * k + (knocked ? 200 * ease(t, hit, hit + .3) : 0)} y={y} s={Math.min(1.3, k) * 1.05} t={t} L={LK[['pD', 'pB', 'pC', 'pA'][i]]} C={CS[['pD', 'pB', 'pC', 'pA'][i]]}
          pose={knocked ? POSES.hit : { ...walkPose(t * 140 + i * 80), armL: [-110, -20], armR: [110, 20] }} noBlink expr="angry" mouth={.4} seed={60 + i} rot={knocked ? 20 * ease(t, hit, hit + .3) : 0} />; })}
      <Hunter t={t} who="zhora" pose={t < hit - .2 ? POSES.guard : PK(t - hit + .2, [[0, { armR: [60, -100], fistR: true }], [.2, { armR: [-95, -5], fistR: true, lean: -12 }], [.8, 'guard']])} expr="shout" />
      {['timur', 'kirill', 'r2', 'r1', 'mikh'].map(w => <Hunter key={w} t={t} who={w} pose={w === 'timur' ? { ...POSES.stand, armL: [-30, 100], armR: [30, -100] } : POSES.guard} expr="scared" />)}
      {t > hit - .05 && t < hit + .25 && <SpeedLines t={t} cx={760} cy={1200} n={40} inner={260} k={.5} />}
    </g>
  </Frame>;
};

// p24: пассажир хватает Тимура и тянет к сиденьям; Кирилл держит его за толстовку и вытаскивает; отступают к группе
export const P24: React.FC<SP> = ({ t }) => {
  const grab = .7, pull = ease(t, grab, 1.6), save = ease(t, 2.0, 3.0), back = ease(t, 3.1, 3.8);
  const tx = 470 - pull * 220 + save * 260 + back * 40, kx = tx + 250 - save * 30;
  const [sx, sy] = shakeXY(t, [[grab, 14, .4], [2.9, 12, .4]]);
  const handX = tx + 75, handY = 1800 - 600; // спина толстовки Тимура — сюда тянется кисть Кирилла
  return <Frame t={t} impact={isImpact(t, grab, 2)} grade="#3a1a20" gradeK={.15}>
    <g transform={cam(1.25, 420, 1150, sx, sy)}>
      <TrainInterior t={t} flicker={.5} vp={VP} shake={2} /><Windows t={t} />
      <rect x={-40} y={1180} width={340} height={260} rx={20} fill="#5a2a2a" stroke="#1a0c0c" strokeWidth={5} />
      <Figure x={130} y={1640} s={1.0} t={t} L={LK.pE} C={CS.pE} pose={{ ...POSES.stand, crouch: 60, armR: [80 + pull * 20 - save * 40, -10], armL: [-20, 40], lean: 10 }} noBlink expr="angry" mouth={.4} seed={70} turn={.5} />
      <Figure x={tx} y={1800} s={1.05} t={t} L={LK.timur} C={CS.timur} pose={t < grab ? POSES.stand : { ...POSES.hit, armL: [-70, 20], armR: [60, -40], lean: -14 + save * 20 }} expr="scared" seed={41} turn={.3} rot={-pull * 8 + save * 8} />
      <Figure x={kx} y={1820} s={1.1} t={t} L={KL} C={KC} pose={t < 1.4 ? POSES.guard : { ...POSES.stand, armL: [-62 + save * 6, -18], fistL: true, lean: 10 - save * 18, crouch: 30 }} expr={t < 3 ? 'shout' : 'determined'} seed={3} turn={-.4} mouth={t > 1.5 && t < 2.6 ? .5 : 0} />
      {t > 1.4 && t < 3.2 && <g><rect x={handX - 20} y={handY - 14} width={40} height={30} rx={10} fill="#f5c518" stroke="#0c0d18" strokeWidth={3} />{/* складка ткани в кулаке */}<path d={`M${handX - 30} ${handY + 10} q30 20 60 0`} stroke="#24442e" strokeWidth={4} fill="none" /></g>}
    </g>
  </Frame>;
};

// p25: торможение — охотники теряют равновесие, пассажиры мгновенно замирают
export const P25: React.FC<SP> = ({ t }) => {
  const br = .4, lurch = Math.sin(clamp((t - br) / .8) * Math.PI) * (t > br ? 1 : 0), frozen = t > br + .1;
  const st = (s: typeof SEATS[0], idx: number) => ({ turnTo: 1, stand: idx % 3 === 0 ? 1 : .6, reach: idx % 2 ? .8 : .3, freeze: frozen });
  return <Frame t={t} grade="#2a2228" gradeK={.15}>
    <g transform={cam(1.05, 540, 1050, lurch * 20, 0)}>
      <TrainInterior t={t} flicker={.2} vp={VP} shake={frozen ? 0 : 2} /><Windows t={t} speed={1 - ease(t, br, br + 1.5)} />
      <Passengers t={t} st={st} />
      {['timur', 'r2', 'r1', 'kirill', 'mikh', 'zhora'].map((w, i) => <Hunter key={w} t={t} who={w} pose={{ ...POSES.guard, lean: lurch * (18 + i * 2), armL: [-50 - lurch * 40, 60], armR: [50 + lurch * 40, -60] }} dx={lurch * 30} expr="scared" />)}
    </g>
  </Frame>;
};

// p26: в окнах — свет платформы; все смотрят на двери
export const P26: React.FC<SP> = ({ t }) => {
  const st = () => ({ turnTo: 1, stand: .6, reach: .5, freeze: true });
  return <Frame t={t} grade="#2a2418" gradeK={.12}>
    <g transform={cam(1.05 + t * .03, 540, 1050)}>
      <TrainInterior t={t} flicker={.1} vp={VP} /><Windows t={t} platform={ease(t, .2, 1.2)} />
      <Passengers t={0} st={st} />
      {['timur', 'r2', 'r1', 'kirill', 'mikh', 'zhora'].map(w => <Hunter key={w} t={t} who={w} pose={POSES.guard} turn={-.6} lookX={-.9} expr="scared" />)}
    </g>
  </Frame>;
};

// p27: двери открываются (вид из вагона) — прямо перед выходом фигура в форме; «Конечная. Выход — один.»
export const P27: React.FC<SP> = ({ t }) => {
  const o = ease(t, .3, 1.0);
  return <Frame t={t} grade="#2a2418" gradeK={.12}>
    <g transform={cam(1.0 + t * .04, 540, 950)}>
      <rect width={1080} height={1920} fill="#1c1e24" />
      <rect x={240} y={260} width={600} height={1400} fill="#2a2418" />
      <rect x={240} y={1300} width={600} height={360} fill="#4a4034" />
      <Machinist x={540} y={1660} s={1.45} t={t} k={o} />
      <rect x={240 - o * 300} y={240} width={300} height={1440} fill="#8a909a" stroke="#2a2e38" strokeWidth={10} />
      <rect x={540 + o * 300} y={240} width={300} height={1440} fill="#7a808a" stroke="#2a2e38" strokeWidth={10} />
      <rect x={0} y={0} width={240} height={1920} fill="#1c1e24" /><rect x={840} y={0} width={240} height={1920} fill="#1c1e24" />
    </g>
  </Frame>;
};

// p28: взгляд Кирилла мимо фигуры — в глубине платформы стоят люди
export const P28: React.FC<SP> = ({ t }) => (
  <Frame t={t} grade="#2a2418" gradeK={.12}>
    <g transform={cam(1.0 + ease(t, .3, 3) * .35, 620, 900)}>
      <rect width={1080} height={1920} fill="#14120e" /><rect y={1100} width={1080} height={820} fill="#2a241c" />
      <ellipse cx={540} cy={700} rx={600} ry={400} fill="#ffe0a0" opacity={.12} filter="url(#blur30)" />
      {[[300, 1180, .42], [420, 1170, .4], [560, 1190, .44], [700, 1175, .41], [820, 1185, .43]].map(([x, y, s], i) => <Figure key={i} x={x} y={y} s={s} t={0} L={LK[i === 3 ? 'father' : ['pA', 'pB', 'pC', 'pD', 'pE'][i]]} C={CS[['pA', 'pB', 'pC', 'pD', 'pE'][i]]} pose={POSES.stand} noBlink idle={false} breathe={false} opacity={.9} />)}
      <g opacity={.9}><Machinist x={160} y={2100} s={1.6} t={t} k={.8} /></g>
    </g>
  </Frame>
);

// p29: отец — отдельный план по направлению взгляда Кирилла, смотрит прямо на него
export const P29: React.FC<SP> = ({ t }) => (
  <Frame t={t} grade="#2a2418" gradeK={.1}>
    <rect width={1080} height={1920} fill="#14120e" /><ellipse cx={540} cy={600} rx={520} ry={520} fill="#ffe0a0" opacity={.12} filter="url(#blur30)" />
    <g transform={cam(1 + t * .04, 540, 650)}><g transform="translate(540 640) scale(5.6)"><Head t={t} L={LK.father} expr="calm" seed={12} lookY={0} /></g></g>
  </Frame>
);

// p30: Кирилл опускает руку, которой держал Тимура; крупно: «Папа?..» — пауза на узнавание
export const P30: React.FC<SP> = ({ t }) => {
  const c = caps('p30'); const cut = 1.4;
  if (t < cut) return <Frame t={t} grade="#2a2418" gradeK={.12}>
    <g transform={cam(1.35, 300, 1100)}>
      <TrainInterior t={0} flicker={0} vp={VP} />
      <Hunter t={t} who="timur" expr="scared" turn={-.3} lookX={-.4} />
      <Hunter t={t} who="kirill" pose={PK(t, [[0, { armL: [-75, 25] }], [.9, 'stand']], false)} expr="scared" turn={-.5} lookX={-.9} />
    </g>
  </Frame>;
  return <Frame t={t} grade="#1a1a2a" gradeK={.12}>
    <rect width={1080} height={1920} fill="#0c0a0e" /><ellipse cx={540} cy={640} rx={560} ry={560} fill="#fff0c0" opacity={.1} filter="url(#blur30)" />
    <g transform={cam(1 + (t - cut) * .05, 540, 700)}><g transform="translate(540 600) scale(6.2)"><Head t={t} L={KL} expr="scared" seed={3} lookX={-.2} lookY={-.1} mouth={talk(t, c, 'КИРИЛЛ')} tears={ease(t, cut + 1.2, cut + 2.4) * .8} /></g></g>
  </Frame>;
};

// p31: «Я тогда ещё не знал: выйдет только один.» → затемнение → титр «ОДИНОЧКА»
export const P31: React.FC<SP> = ({ t, d }) => {
  const cut = d - 1.8;
  if (t < cut) return <Frame t={t} grade="#1a1a2a" gradeK={.12} over={<rect width={1080} height={1920} fill="#000" opacity={ease(t, cut - .6, cut)} />}>
    <rect width={1080} height={1920} fill="#0c0a0e" />
    <g transform={cam(1.1 + t * .03, 540, 900)}><Hunter t={t} who="kirill" expr="sad" dy={-120} rim="#fff0c0" /></g>
  </Frame>;
  return <Frame t={t} vign={1}>
    <rect width={1080} height={1920} fill="#000" />
    <text x={540} y={960} textAnchor="middle" fontFamily="CormSC, serif" fontWeight={700} fontSize={150} letterSpacing={10} fill="#f4fbff" opacity={ease(t, cut + .1, cut + .6)} filter="url(#glow)">ОДИНОЧКА</text>
    <text x={540} y={1060} textAnchor="middle" fontFamily="Oswald" fontWeight={300} fontSize={40} letterSpacing={16} fill="#9fdcff" opacity={ease(t, cut + .6, cut + 1)}>СЕРИЯ 2 — СКОРО</text>
  </Frame>;
};
