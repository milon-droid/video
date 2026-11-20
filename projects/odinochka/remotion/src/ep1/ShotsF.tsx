// Подземелье v6: вагон с «людьми» → безликие → бой (магия и оружие, легко) → «Изи» → торможение → Машинист → свет фонаря усыпляет отряд →
// Кирилл видит в фонаре отца, отец говорит → веки тяжелеют → титр. Лор (не объяснять): Фонарь — монстр, каждый видит желанного, долгий взгляд — потеря сознания.
import React from 'react';
import { clamp, ease, noise, spr } from '../anim';
import { cam, Flash, h1, isImpact, Lids, Motes, Smoke, SpeedLines, shakeXY } from '../kit/fx';
import { TrainInterior } from '../bg/places';
import { Figure, PK, Pose, POSES } from '../chars/body';
import { Head } from '../chars/head';
import { Machinist, Passenger } from '../chars/monsters';
import { CS, LK } from '../chars/cast';
import { Frame, SP, talk } from './common';
import { SHOTS } from './timeline';
const caps = (id: string) => SHOTS.find(s => s.id === id)?.caps;
const KL = LK.kWeakHurt, KC = CS.porterY, VP = 820;

// ряды пассажиров вдоль стен (места постоянные). st(j) → {bow, look, rise, dissolve}
type PS = { bow?: number; look?: number; rise?: number; dissolve?: number };
const HAIR = ['#2a2420', '#5a4a3a', '#8a8a8a', '#1a1818', '#6a3a2a'];
const Rows: React.FC<{ t: number; st?: (j: number, sd: number) => PS; big?: number }> = ({ t, st = () => ({ bow: 1 }), big = 1 }) => {
  const out: React.ReactNode[] = [];
  for (let i = 4; i >= 0; i--) { const k = Math.pow(.78, i), y = VP + 640 * k;
    for (const sd of [-1, 1]) { const j = i * 2 + (sd > 0 ? 1 : 0), p = st(j, sd);
      out.push(<Passenger key={j} x={540 + sd * (430 * k * big + 20)} y={VP + 640 * k * big} s={k * 1.25 * big} t={t} seed={j} coat={['#3a3a44', '#2e3440', '#443a3a', '#363a30'][j % 4]} hair={HAIR[j % 5]}
        bow={p.bow ?? 0} look={p.look ?? 0} rise={p.rise ?? 0} dissolve={p.dissolve ?? 0} rock={p.rise ? 0 : 1} />); } }
  return <g>{out}</g>;
};
// отряд у дверей (передний план, одни и те же места)
const G: Record<string, number[]> = { mikh: [780, 1900, 1.02], zhora: [950, 1940, 1.1], r1: [610, 1870, .9], r2: [460, 1860, .88], kirill: [300, 1930, 1.0], timur: [150, 1960, .92] };
const H: React.FC<{ t: number; w: string; pose?: Pose; dx?: number; [k: string]: any }> = ({ t, w, pose = POSES.stand, dx = 0, ...p }) => {
  const [x, y, s] = G[w]; return <Figure x={x + dx} y={y} s={s} t={t} L={w === 'kirill' ? KL : LK[w]} C={w === 'kirill' ? KC : CS[w]} pose={pose} seed={{ mikh: 6, zhora: 7, r1: 21, r2: 22, kirill: 3, timur: 41 }[w]} {...p} />;
};
const TEAM = ['timur', 'r2', 'r1', 'kirill', 'mikh', 'zhora'];
// в бою отряд меньше и ниже — чтобы были видны безликие и эффекты сил
const Low: React.FC<{ children: React.ReactNode }> = ({ children }) => <g transform="translate(540 2080) scale(.8) translate(-540 -1920)">{children}</g>;

// эффекты сил: огненный шар, молния, трассеры, аура кулаков
const Fireball: React.FC<{ t: number; t0: number; x0: number; y0: number; x1: number; y1: number }> = ({ t, t0, x0, y0, x1, y1 }) => {
  const q = clamp((t - t0) / .45); if (t < t0 || q >= 1) return null; const x = x0 + (x1 - x0) * q, y = y0 + (y1 - y0) * q;
  return <g><line x1={x0 + (x1 - x0) * Math.max(0, q - .35)} y1={y0 + (y1 - y0) * Math.max(0, q - .35)} x2={x} y2={y} stroke="#ff9a2a" strokeWidth={30} strokeLinecap="round" opacity={.6} filter="url(#blur12)" />
    <circle cx={x} cy={y} r={48} fill="#ffcf5a" filter="url(#glowBig)" /><circle cx={x} cy={y} r={26} fill="#fff6d0" /></g>;
};
const Boom: React.FC<{ t: number; t0: number; x: number; y: number; c?: string; r?: number }> = ({ t, t0, x, y, c = '#ff8a2a', r = 220 }) => {
  const q = clamp((t - t0) / .5); if (t < t0 || q >= 1) return null;
  return <g opacity={1 - q}><circle cx={x} cy={y} r={r * (.3 + q)} fill={c} filter="url(#blur30)" /><circle cx={x} cy={y} r={r * .5 * (.3 + q)} fill="#fff4d0" opacity={.8} /></g>;
};
const Bolt: React.FC<{ t: number; t0: number; pts: number[][]; c?: string }> = ({ t, t0, pts, c = '#8fd8ff' }) => {
  if (t < t0 || t > t0 + .35) return null; const f = Math.floor(t * 30);
  const d = 'M' + pts.map((p, i) => `${p[0] + (i && i < pts.length - 1 ? (h1(i + f) - .5) * 60 : 0)} ${p[1] + (i && i < pts.length - 1 ? (h1(i * 3 + f) - .5) * 40 : 0)}`).join(' L');
  return <g><path d={d} stroke={c} strokeWidth={16} fill="none" filter="url(#glowBig)" /><path d={d} stroke="#fff" strokeWidth={5} fill="none" /></g>;
};
const Tracers: React.FC<{ t: number; t0: number; t1: number; x0: number; y0: number; x1: number; y1: number }> = ({ t, t0, t1, x0, y0, x1, y1 }) => {
  if (t < t0 || t > t1) return null; const f = Math.floor(t * 30); const on = f % 2 === 0;
  return <g>{on && <g><circle cx={x0} cy={y0} r={34} fill="#9fe8ff" filter="url(#glowBig)" /><path d={`M${x0 - 40} ${y0} L${x0 + 40} ${y0} M${x0} ${y0 - 40} L${x0} ${y0 + 40}`} stroke="#fff" strokeWidth={6} /></g>}
    {[0, 1].map(i => { const q = ((t * 6 + i * .5) % 1); return <line key={i} x1={x0 + (x1 - x0) * q} y1={y0 + (y1 - y0) * q} x2={x0 + (x1 - x0) * (q + .12)} y2={y0 + (y1 - y0) * (q + .12)} stroke="#bff0ff" strokeWidth={8} filter="url(#glow)" />; })}</g>;
};
const Rifle: React.FC<{ x: number; y: number; ang?: number }> = ({ x, y, ang = -10 }) => <g transform={`translate(${x} ${y}) rotate(${ang})`}>
  <rect x={-40} y={-14} width={220} height={28} rx={6} fill="#1a1c22" stroke="#0c0d18" strokeWidth={4} /><rect x={20} y={10} width={30} height={60} fill="#1a1c22" /><rect x={170} y={-6} width={60} height={12} fill="#2a2c34" />
  {[0, 1, 2].map(i => <rect key={i} x={40 + i * 40} y={-6} width={20} height={12} fill="#5fd2ff" opacity={.7} />)}</g>;

// f17: вагон — «обычные люди»: дремлют, опустив головы, газеты; диктор «Осторожно, двери закрываются»
export const F17: React.FC<SP> = ({ t }) => (
  <Frame t={t} grade="#2a2a3a" gradeK={.15}>
    <g transform={cam(1.0 + t * .02, 540, 1050)}>
      <TrainInterior t={t} flicker={.15} vp={VP} />
      <Rows t={t} st={() => ({ bow: 1 })} />
      {TEAM.map(w => <H key={w} t={t} w={w} expr={w === 'timur' ? 'scared' : 'calm'} />)}
    </g>
  </Frame>
);

// f18: двери захлопываются, поезд трогается; Жора: «Отлично… прокатимся»
export const F18: React.FC<SP> = ({ t }) => {
  const c = caps('f18'); const cl = ease(t, .1, .5), [sx, sy] = shakeXY(t, [[.5, 16, .4]]);
  return <Frame t={t} impact={isImpact(t, .5, 2)} grade="#2a2a3a" gradeK={.15}>
    <g transform={cam(1.15, 760, 1150, sx, sy)}>
      <TrainInterior t={t} flicker={.2} vp={VP} shake={t > .7 ? 2 : 0} />
      <Rows t={t} st={() => ({ bow: 1 })} />
      <H t={t} w="zhora" pose={{ ...POSES.stand, armL: [-40, 120], armR: [40, -120] }} expr="smirk" mouth={talk(t, c, 'ЖОРА')} turn={-.2} />
      <H t={t} w="mikh" expr="calm" />
      <rect x={1080 - cl * 260} y={300} width={300} height={1700} fill="#7a808a" stroke="#2a2e38" strokeWidth={10} />
    </g>
  </Frame>;
};

// f19: один пассажир поднимает голову — лица нет; затем второй; затем все
export const F19: React.FC<SP> = ({ t }) => {
  const cut = 1.9;
  if (t < cut) return <Frame t={t} grade="#2a2228" gradeK={.18}>
    <g transform={cam(1 + t * .04, 540, 900)}>
      <TrainInterior t={t} flicker={.4} vp={VP} shake={1.5} />
      <rect width={1080} height={1920} fill="#05060a" opacity={.35} />
      <Passenger x={540} y={2350} s={3.6} t={t} seed={4} coat="#2e3440" hair="#5a4a3a" bow={1 - ease(t, .5, 1.5)} look={0} rock={.4} />
    </g>
  </Frame>;
  const st = (j: number) => { const t0 = cut + (j % 4) * .12; return { bow: 1 - ease(t, t0, t0 + .45), look: ease(t, t0 + .3, t0 + .6) * (j % 2 ? -.3 : .3) }; };
  return <Frame t={t} grade="#2a2228" gradeK={.18}>
    <g transform={cam(1.0 + ease(t, cut, cut + 1.5) * .1, 540, 1000)}>
      <TrainInterior t={t} flicker={.4} vp={VP} shake={2} />
      <Rows t={t} st={st} big={1.55} />
    </g>
  </Frame>;
};

// f20: Михалыч: «К бою!» — отряд принимает стойки, загораются силы
export const F20: React.FC<SP> = ({ t }) => {
  const c = caps('f20'); const on = ease(t, .4, .8);
  return <Frame t={t} grade="#2a1a20" gradeK={.15}>
    <g transform={cam(1.2, 600, 1100)}>
      <TrainInterior t={t} flicker={.5} vp={VP} shake={2} red={.3} />
      <Rows t={t} st={() => ({ rise: .3 })} big={1.2} />
      <Low>
      <H t={t} w="r1" pose={{ ...POSES.hold, armR: [60, -90] }} expr="determined" />
      <Rifle x={G.r1[0] + 40} y={G.r1[1] - 470} ang={-15} />
      <H t={t} w="mikh" pose={PK(t, [[0, 'stand'], [.3, { armR: [130, -30], armL: [-40, 60] }]])} expr="shout" mouth={talk(t, c, 'МИХАЛЫЧ')} />
      <circle cx={G.mikh[0] + 230} cy={G.mikh[1] - 820} r={50 * on} fill="#ffb040" filter="url(#glowBig)" opacity={on} />
      <H t={t} w="zhora" pose={POSES.guard} expr="angry" />
      {[[-1], [1]].map(([sd], i) => <circle key={i} cx={G.zhora[0] + sd * 70} cy={G.zhora[1] - 600} r={40} fill="#ff6a2a" opacity={.5 * on} filter="url(#blur12)" />)}
      </Low>
    </g>
  </Frame>;
};

// f21: бой А — огненный шар Михалыча, очередь из автомата; безликие рассыпаются дымом
export const F21: React.FC<SP> = ({ t }) => {
  const fb = .4, hit = .85, [sx, sy] = shakeXY(t, [[hit, 26, .6], [1.8, 12, .3], [2.3, 12, .3]]);
  const st = (j: number) => ({ rise: .9, dissolve: j === 2 || j === 3 ? ease(t, hit, hit + .6) : j === 4 ? ease(t, 2.0, 2.5) : j === 5 ? ease(t, 2.5, 3.0) : 0 });
  return <Frame t={t} impact={isImpact(t, hit, 2)} grade="#2a1a20" gradeK={.12} over={<Flash t={t} t0={hit} color="#ffb060" max={.5} />}>
    <g transform={cam(1.05, 540, 1050, sx, sy)}>
      <TrainInterior t={t} flicker={.6} vp={VP} shake={3} red={.3} />
      <Rows t={t} st={st} big={1.2} />
      <Smoke t={t} t0={hit} x={540} y={1250} n={12} r={130} spread={260} color="#0a0a10" life={1.6} rise={140} k={.9} seed={7} />
      <Smoke t={t} t0={2.0} x={760} y={1150} n={8} r={90} spread={160} color="#0a0a10" life={1.4} rise={120} k={.9} seed={8} />
      <Fireball t={t} t0={fb} x0={G.mikh[0] + 120} y0={G.mikh[1] - 800} x1={540} y1={1250} /><Boom t={t} t0={hit} x={540} y={1250} />
      <Tracers t={t} t0={1.6} t1={2.9} x0={G.r1[0] + 260} y0={G.r1[1] - 520} x1={780} y1={1150} />
      <Low>
      {TEAM.map(w => <H key={w} t={t} w={w} pose={w === 'mikh' ? { ...POSES.stand, armR: [120, -20] } : w === 'r1' ? { ...POSES.hold, armR: [60, -90] } : w === 'timur' || w === 'kirill' ? POSES.stand : POSES.guard} expr={w === 'timur' ? 'scared' : 'determined'} rim="#ffb060" />)}
      <Rifle x={G.r1[0] + 40} y={G.r1[1] - 470} ang={-15} />
      </Low>
    </g>
  </Frame>;
};

// f22: бой Б — цепная молния, светящийся кулак Жоры; Кирилл прикрывает Тимура за сумками
export const F22: React.FC<SP> = ({ t }) => {
  const bolt = .5, punch = 1.7, [sx, sy] = shakeXY(t, [[bolt, 14, .4], [punch, 24, .5]]);
  const st = (j: number) => ({ rise: .9, dissolve: j === 0 || j === 1 ? ease(t, bolt + .1, bolt + .7) : j === 6 || j === 7 ? ease(t, punch, punch + .6) : j < 6 ? 1 : 0 });
  return <Frame t={t} impact={isImpact(t, punch, 2)} grade="#1a2030" gradeK={.12} over={<Flash t={t} t0={bolt} color="#bfe8ff" max={.45} />}>
    <g transform={cam(1.05, 540, 1050, sx, sy)}>
      <TrainInterior t={t} flicker={.6} vp={VP} shake={3} />
      <Rows t={t} st={st} big={1.2} />
      <Bolt t={t} t0={bolt} pts={[[G.r2[0] + 80, G.r2[1] - 820], [430, 1300], [300, 1230], [700, 1260], [820, 1200]]} />
      <Smoke t={t} t0={bolt + .1} x={350} y={1250} n={10} r={110} spread={220} color="#0a0a10" life={1.5} rise={130} k={.9} seed={9} />
      <Smoke t={t} t0={punch} x={720} y={1300} n={10} r={110} spread={200} color="#0a0a10" life={1.5} rise={130} k={.9} seed={10} />
      <Low>
      <H t={t} w="r2" pose={{ ...POSES.raiseR, armR: [150, -10] }} expr="determined" rim="#8fd8ff" />
      <H t={t} w="zhora" dx={-ease(t, 1.2, punch) * 180} pose={t < punch - .2 ? POSES.guard : PK(t - punch + .2, [[0, { armR: [60, -100], fistR: true }], [.2, { armR: [-95, -5], fistR: true, lean: -14 }], [.9, 'guard']])} expr="shout" rim="#ff8a3a" />
      {t > punch - .25 && t < punch + .3 && <circle cx={G.zhora[0] - 300} cy={G.zhora[1] - 620} r={70} fill="#ff7a2a" filter="url(#glowBig)" />}
      <H t={t} w="kirill" pose={{ ...POSES.guard, armL: [-80, 30] }} expr="scared" dx={-40} />
      <H t={t} w="timur" pose={{ ...POSES.stand, crouch: 80, armL: [-40, 120], armR: [40, -120] }} expr="scared" />
      {['mikh', 'r1'].map(w => <H key={w} t={t} w={w} pose={POSES.guard} expr="determined" />)}
      {t > punch - .05 && t < punch + .25 && <SpeedLines t={t} cx={650} cy={1250} n={40} inner={240} k={.5} />}
      </Low>
    </g>
  </Frame>;
};

// f23: последние безликие рассыпаются; дым оседает, тишина
export const F23: React.FC<SP> = ({ t }) => (
  <Frame t={t} grade="#2a2a3a" gradeK={.15}>
    <g transform={cam(1.0 + t * .03, 540, 1050)}>
      <TrainInterior t={t} flicker={.2} vp={VP} shake={1.5} />
      <Rows t={t} st={(j) => ({ rise: .9, dissolve: j >= 8 ? ease(t, .3 + (j - 8) * .3, .9 + (j - 8) * .3) : 1 })} big={1.2} />
      <Smoke t={t} t0={.3} x={540} y={1050} n={14} r={140} spread={380} color="#0a0a10" life={2.6} rise={160} k={.7} seed={11} />
      <Low>
      {TEAM.map(w => <H key={w} t={t} w={w} pose={POSES.stand} expr="calm" />)}
      </Low>
    </g>
  </Frame>
);

// f24: Жора: «Изи. И это всё?» — смеётся; Михалыч опускает руку, но хмурится
export const F24: React.FC<SP> = ({ t }) => {
  const c = caps('f24');
  return <Frame t={t} grade="#2a2a3a" gradeK={.15}>
    <g transform={cam(1.25, 820, 1150)}>
      <TrainInterior t={t} flicker={.15} vp={VP} shake={1.5} />
      <H t={t} w="mikh" pose={PK(t, [[0, { armR: [100, -20] }], [1.0, 'stand']], false)} expr="angry" turn={-.3} lookX={.4} />
      <H t={t} w="zhora" pose={{ ...POSES.stand, armL: [-150, 30], armR: [40, -110] }} expr="smirk" mouth={talk(t, c, 'ЖОРА')} turn={-.3} />
    </g>
  </Frame>;
};

// f25: торможение — отряд теряет равновесие, свет мигает; в окнах платформа
export const F25: React.FC<SP> = ({ t }) => {
  const br = .3, lurch = Math.sin(clamp((t - br) / .8) * Math.PI) * (t > br ? 1 : 0);
  return <Frame t={t} grade="#2a2418" gradeK={.12}>
    <g transform={cam(1.05, 540, 1050, lurch * 20, 0)}>
      <TrainInterior t={t} flicker={.6} vp={VP} shake={t < br + .8 ? 3 : 0} />
      {TEAM.map((w, i) => <H key={w} t={t} w={w} pose={{ ...POSES.stand, lean: lurch * (18 + i * 2), armL: [-50 - lurch * 40, 60], armR: [50 + lurch * 40, -60] }} dx={lurch * 30} expr="scared" />)}
    </g>
  </Frame>;
};

// f26: двери открываются — Машинист с фонарём; «Конечная. Выход — один.»
export const F26: React.FC<SP> = ({ t }) => {
  const o = ease(t, .3, 1.0);
  return <Frame t={t} grade="#2a2418" gradeK={.12}>
    <g transform={cam(1.0 + t * .04, 540, 950)}>
      <rect width={1080} height={1920} fill="#1c1e24" />
      <rect x={240} y={260} width={600} height={1400} fill="#14120e" /><rect x={240} y={1300} width={600} height={360} fill="#2a241c" />
      <Machinist x={540} y={1660} s={1.45} t={t} k={o} />
      <rect x={240 - o * 300} y={240} width={300} height={1440} fill="#8a909a" stroke="#2a2e38" strokeWidth={10} />
      <rect x={540 + o * 300} y={240} width={300} height={1440} fill="#7a808a" stroke="#2a2e38" strokeWidth={10} />
      <rect x={0} y={0} width={240} height={1920} fill="#1c1e24" /><rect x={840} y={0} width={240} height={1920} fill="#1c1e24" />
    </g>
  </Frame>;
};

// f27: свет фонаря проходит по отряду — каждый замирает, взгляд стекленеет (без объяснений)
export const F27: React.FC<SP> = ({ t }) => {
  const sweep = ease(t, .2, 2.6), bx = 1100 - sweep * 900;
  const caught = (x: number) => bx < x + 80;
  return <Frame t={t} grade="#2a2418" gradeK={.12}>
    <g transform={cam(1.05, 540, 1050)}>
      <rect width={1080} height={1920} fill="#0c0d12" />
      <polygon points={`540,-80 ${bx - 220},1980 ${bx + 220},1980`} fill="#fff0c0" opacity={.22} filter="url(#blur12)" />
      {['zhora', 'mikh', 'r1', 'r2', 'timur'].map(w => { const c = caught(G[w][0]); return <H key={w} t={c ? 0 : t} w={w} pose={POSES.stand} expr={c ? (w === 'zhora' ? 'smirk' : 'calm') : 'scared'} lookY={c ? -.8 : 0} idle={!c} noBlink={c} lid={c ? .55 : 1} rim={c ? '#fff0c0' : undefined} />; })}
      <H t={t} w="kirill" pose={POSES.stand} expr="scared" lookX={.6} turn={.3} sweat={1} />
    </g>
  </Frame>;
};

// f28: свет на Кирилле — в фонаре лицо отца; отец говорит
export const F28: React.FC<SP> = ({ t }) => {
  const c = caps('f28'); const rv = ease(t, .2, 1.0);
  const face = <g transform="translate(0 20) scale(1.25)"><Head t={t} L={LK.father} expr="sad" seed={12} lookY={.3} mouth={talk(t, c, '???') * .35} /></g>;
  return <Frame t={t} grade="#1a1a2a" gradeK={.12} over={<Flash t={t} t0={.2} dur={.6} color="#fff6d8" max={.4} />}>
    <g transform={cam(1.25 + t * .05, 540, 760, 0, -160)}>
      <rect width={1080} height={1920} fill="#0a0b10" />
      <Machinist x={540} y={2300} s={2.6} t={t} k={1 - rv * .7} reveal={rv} face={face} />
    </g>
  </Frame>;
};

// f29: Кирилл не может отвести взгляд — веки тяжелеют, кадр гаснет → титр
export const F29: React.FC<SP> = ({ t, d }) => {
  const cut = d - 1.8, lid = 1 - ease(t, .8, cut) * .85;
  if (t < cut) return <Frame t={t} grade="#2a2418" gradeK={.12} over={<Lids k={ease(t, cut - .7, cut)} />}>
    <rect width={1080} height={1920} fill="#0c0a0e" /><ellipse cx={540} cy={640} rx={560} ry={560} fill="#fff0c0" opacity={.16} filter="url(#blur30)" />
    <g transform={cam(1 + t * .05, 540, 700)}><g transform="translate(540 600) scale(6.2)"><Head t={t} L={KL} expr="sad" seed={3} lookY={-.2} noBlink lid={lid} tears={ease(t, .4, 1.6) * .8} /></g></g>
  </Frame>;
  return <Frame t={t} vign={1}>
    <rect width={1080} height={1920} fill="#000" />
    <text x={540} y={960} textAnchor="middle" fontFamily="CormSC, serif" fontWeight={700} fontSize={138} letterSpacing={4} fill="#f4fbff" opacity={ease(t, cut + .1, cut + .6)} filter="url(#glow)">ОДИНОЧКА</text>
    <text x={540} y={1060} textAnchor="middle" fontFamily="Oswald" fontWeight={300} fontSize={40} letterSpacing={16} fill="#9fdcff" opacity={ease(t, cut + .6, cut + 1)}>СЕРИЯ 2 — СКОРО</text>
  </Frame>;
};
