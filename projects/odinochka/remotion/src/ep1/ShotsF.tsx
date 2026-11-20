// Подземелье v6: вагон с «людьми» → безликие → бой (магия и оружие, легко) → «Изи» → торможение → Машинист → свет фонаря усыпляет отряд →
// Кирилл видит в фонаре отца, отец говорит → веки тяжелеют → титр. Лор (не объяснять): Фонарь — монстр, каждый видит желанного, долгий взгляд — потеря сознания.
import React from 'react';
import { clamp, ease, noise, spr } from '../anim';
import { cam, DashLines, Flash, h1, isImpact, Lids, Motes, Smoke, SpeedLines, shakeXY } from '../kit/fx';
import { TrainInterior } from '../bg/places';
import { SysWin } from '../kit/ui';
import { Figure, PK, Pose, POSES, walkPose } from '../chars/body';
import { Head } from '../chars/head';
import { Machinist, Passenger, ShadowSoldier } from '../chars/monsters';
import { Gate } from '../bg/moscow';
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


// стоящий безликий: высокий силуэт в пальто, длинные руки, бледная голова без лица. lift 0..1 — поднимает голову, lunge 0..1 — тянет руки вперёд
const Faceless: React.FC<{ x: number; y: number; s: number; t: number; seed: number; lift?: number; lunge?: number; dissolve?: number; grin?: number; eyes?: number }> = ({ x, y, s, t, seed, lift = 1, lunge = 0, dissolve = 0, grin = 0, eyes = 0 }) => {
  if (dissolve >= 1) return null; const sw = noise('fl' + seed, t, .5) * 3, coat = ['#2a2a32', '#30282a', '#262c30', '#2c2a24'][seed % 4];
  return <g transform={`translate(${x} ${y}) scale(${s})`} opacity={1 - dissolve}>
    <path d={`M-70 0 L-62 -420 C-66 -500 -40 -540 0 -548 C40 -540 66 -500 62 -420 L70 0Z`} fill={coat} stroke="#0c0d18" strokeWidth={5} />
    {[-1, 1].map(sd => <path key={sd} d={`M${sd * 56} -500 Q${sd * (90 + lunge * 40)} ${-330 - lunge * 160} ${sd * (60 + lunge * 20)} ${-170 - lunge * 330 + sw}`} stroke={coat} strokeWidth={30} fill="none" strokeLinecap="round" />)}
    {[-1, 1].map(sd => <g key={'h' + sd} transform={`translate(${sd * (60 + lunge * 20)} ${-170 - lunge * 330 + sw})`}>{[-14, 0, 14].map((f, i) => <path key={i} d={`M${f} 0 l${f * .4} ${34 + lunge * 10}`} stroke="#c8c4bc" strokeWidth={7} strokeLinecap="round" />)}</g>)}
    <g transform={`translate(${sw} ${-600 + (1 - lift) * 40}) rotate(${(1 - lift) * 40 + noise('fh' + seed, t, .7) * 6})`}>
      <ellipse rx={46} ry={58} fill="#cfcac0" stroke="#0c0d18" strokeWidth={5} /><ellipse cx={0} cy={6} rx={30} ry={40} fill="#b4b0a6" opacity={.55} />
      {eyes > 0 && [-17, 17].map((ex, i) => <g key={i}><path d={`M${ex - 12} -12 Q${ex} ${-20 - eyes * 4} ${ex + 12} -12 Q${ex} -8 ${ex - 12} -12Z`} fill="#0a0404" /><ellipse cx={ex} cy={-13} rx={4 * eyes} ry={3 * eyes} fill="#ff2030" filter="url(#glow)" /></g>)}
      {grin > 0 && <g><path d={`M${-34 * grin - 4} 16 Q0 ${20 + 34 * grin} ${34 * grin + 4} 16 Q0 ${24 + 18 * grin} ${-34 * grin - 4} 16Z`} fill="#140606" stroke="#0c0d18" strokeWidth={2} />
        {Array.from({ length: 9 }).map((_, i) => { const u = i / 8 - .5, xx = u * 62 * grin, yy = 18 + (1 - 4 * u * u) * 14 * grin; return <path key={i} d={`M${xx - 3} ${yy - 2} l3 ${5 * grin} l3 ${-5 * grin}`} fill="#e8e0d0" />; })}</g>}
    </g>
  </g>;
};
// толпа безликих в проходе: n рядов в глубину, плотная; adv — насколько продвинулись к отряду
const Crowd: React.FC<{ t: number; adv?: number; lift?: (i: number) => number; lunge?: number; dis?: (i: number) => number; n?: number }> = ({ t, adv = 0, lift = () => 1, lunge = 0, dis = () => 0, n = 22 }) => {
  const out: React.ReactNode[] = [];
  for (let i = n - 1; i >= 0; i--) { const row = Math.floor(i / 3), col = i % 3, k = Math.pow(.8, row - adv * 1.5), kk = Math.min(1.5, k);
    out.push(<Faceless key={i} x={540 + (col - 1) * 230 * kk + (h1(i * 3) - .5) * 60 * kk} y={VP + 640 * kk} s={kk * 1.1} t={t} seed={i} lift={lift(i)} lunge={lunge} dissolve={dis(i)} />); }
  return <g>{out}</g>;
};
// темнота с «дырками» света: лучи фонаря и пятна (огонь, вспышки)
type Hole = { beam?: [number, number, number, number, number]; spot?: [number, number, number] };
const Dark: React.FC<{ id: string; k?: number; holes?: Hole[] }> = ({ id, k = .93, holes = [] }) => <g>
  <defs><mask id={id}><rect width={1080} height={1920} fill="#fff" />
    {holes.map((h, i) => h.beam ? <polygon key={i} points={`${h.beam[0]},${h.beam[1]} ${h.beam[2] - h.beam[4]},${h.beam[3]} ${h.beam[2] + h.beam[4]},${h.beam[3]}`} fill="#000" filter="url(#blur30)" />
      : h.spot ? <circle key={i} cx={h.spot[0]} cy={h.spot[1]} r={h.spot[2]} fill="#000" filter="url(#blur30)" /> : null)}</mask></defs>
  <rect width={1080} height={1920} fill="#020205" opacity={k} mask={`url(#${id})`} />
</g>;

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


// ударная волна — расходящиеся кольца
const Shock: React.FC<{ t: number; t0: number; x: number; y: number; c?: string; r?: number }> = ({ t, t0, x, y, c = '#ffd890', r = 600 }) => {
  const q = clamp((t - t0) / .45); if (t < t0 || q >= 1) return null;
  return <g opacity={1 - q}>{[0, .15].map((d, i) => <ellipse key={i} cx={x} cy={y} rx={r * Math.max(0, q - d)} ry={r * .45 * Math.max(0, q - d)} fill="none" stroke={i ? '#fff' : c} strokeWidth={30 * (1 - q)} filter="url(#glow)" />)}</g>;
};
// пепел: частицы летят вверх и в стороны из точки (безликий рассыпается)
const Ash: React.FC<{ t: number; t0: number; x: number; y: number; n?: number; spread?: number; c?: string }> = ({ t, t0, x, y, n = 40, spread = 260, c = '#1a1a22' }) => {
  const q = clamp((t - t0) / 1.4); if (t < t0 || q >= 1) return null;
  return <g>{Array.from({ length: n }).map((_, i) => { const a = h1(i * 3.3) * Math.PI * 2, sp = spread * (.3 + h1(i * 7.1)), px = x + Math.cos(a) * sp * q + Math.sin(t * 3 + i) * 10, py = y + Math.sin(a) * sp * q * .6 - q * 260 * h1(i * 5);
    const ember = i % 5 === 0; return <rect key={i} x={px} y={py} width={(ember ? 6 : 10) * (1 - q * .6)} height={(ember ? 6 : 10) * (1 - q * .6)} fill={ember ? '#ffb040' : c} opacity={(1 - q) * (ember ? 1 : .9)} transform={`rotate(${q * 300 * (h1(i) - .5)} ${px} ${py})`} filter={ember ? 'url(#glow)' : undefined} />; })}</g>;
};
// языки пламени вокруг точки (спираль), k — сила
const FireSpiral: React.FC<{ t: number; x: number; y: number; k: number; r?: number }> = ({ t, x, y, k, r = 160 }) => <g opacity={k}>
  <circle cx={x} cy={y} r={r * .9 * k} fill="#ff7a1a" opacity={.35} filter="url(#blur30)" />
  {Array.from({ length: 18 }).map((_, i) => { const a = t * 7 + i * .35, rr = r * (.2 + (i / 18) * .9) * k, px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr * .8;
    return <ellipse key={i} cx={px} cy={py} rx={14 + i} ry={26 + i * 1.4} fill={i % 3 ? '#ffb040' : '#fff0a0'} transform={`rotate(${a * 57 + 90} ${px} ${py})`} opacity={.8} filter="url(#glow)" />; })}
  <circle cx={x} cy={y} r={40 * k} fill="#fff6d0" filter="url(#glowBig)" />
</g>;

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


// f18b: тоннель — свет мигает и гаснет; в темноте шорох, Тимур: «Что со светом?..»
export const F18b: React.FC<SP> = ({ t }) => {
  const c = caps('f18b'); const off = t > 1.3 ? 1 : (Math.floor(t * 12) % 3 === 0 && t > .5 ? .8 : 0);
  return <Frame t={t} grade="#1a1a2a" gradeK={.15}>
    <g transform={cam(1.05, 540, 1050)}>
      <TrainInterior t={t} flicker={.8} vp={VP} shake={2} />
      <Rows t={t} st={(j) => ({ bow: t > 1.6 ? .6 : 1 })} />
      {TEAM.map(w => <H key={w} t={t} w={w} expr="scared" lookY={-.5} mouth={w === 'timur' ? talk(t, c, 'ТИМУР') : 0} rim={off ? '#ff2a3a' : undefined} />)}
      <Dark id="d18b" k={.95 * off} holes={[{ spot: [540, 120, 120] }]} />
      {off > .9 && <rect x={480} y={90} width={120} height={50} fill="#ff2a3a" opacity={.25 + .1 * Math.sin(t * 8)} filter="url(#blur12)" />}
    </g>
  </Frame>;
};

// f18c: щелчок — фонарь на автомате бойца; луч скользит по проходу и выхватывает толпу безликих вплотную, их много
export const F18c: React.FC<SP> = ({ t }) => {
  const on = t > .4, sweep = ease(t, .5, 2.6), bx = 120 + sweep * 760, [sx, sy] = shakeXY(t, [[2.0, 10, .5]]);
  const lift = (i: number) => ease(t, .9 + (i % 7) * .18, 1.4 + (i % 7) * .18);
  return <Frame t={t} grade="#1a1a2a" gradeK={.1}>
    <g transform={cam(1.05 + ease(t, 2, 3.4) * .08, 540, 1050, sx, sy)}>
      <TrainInterior t={0} flicker={0} vp={VP} />
      <Crowd t={t} adv={.6} lift={lift} n={24} />
      <Dark id="d18c" k={.97} holes={on ? [{ beam: [880, 1900, bx, 700, 280] }] : []} />
      {on && <circle cx={880} cy={1880} r={50} fill="#fff8e0" filter="url(#glowBig)" />}
    </g>
  </Frame>;
};


// секундная отсылка: каменное лицо с жуткой улыбкой (своя прорисовка, синий свет, красные зрачки, штриховка, трещины)
const BossGrin: React.FC<{ t: number; k: number }> = ({ t, k }) => {
  const sh = Math.sin(t * 50) * 4 * k;
  return <g opacity={k} transform={`translate(${540 + sh} 900) scale(${1 + (1 - k) * .1})`}>
    <defs><radialGradient id="bgFace" cx=".5" cy=".4" r=".7"><stop offset="0" stopColor="#4fa8e8" /><stop offset="1" stopColor="#0e2a5a" /></radialGradient></defs>
    <rect x={-540} y={-900} width={1080} height={1920} fill="#061430" />
    {/* каменный капюшон */}
    <path d="M-520 -900 L-420 -300 L-470 400 L-300 1000 L300 1000 L470 400 L420 -300 L520 -900Z" fill="#1a3a6a" stroke="#05101e" strokeWidth={10} />
    <path d="M-120 -900 L0 -560 L120 -900Z" fill="#2a5088" stroke="#05101e" strokeWidth={8} />
    {/* лицо */}
    <path d="M-330 -420 C-360 -120 -330 160 -240 330 C-150 470 150 470 240 330 C330 160 360 -120 330 -420 C200 -560 -200 -560 -330 -420Z" fill="url(#bgFace)" stroke="#05101e" strokeWidth={10} />
    {/* глазницы со штриховкой */}
    {[-1, 1].map(sd => <g key={sd}><path d={`M${sd * 60} -250 C${sd * 120} -300 ${sd * 260} -290 ${sd * 290} -200 C${sd * 250} -140 ${sd * 110} -140 ${sd * 60} -190Z`} fill="#071226" />
      {Array.from({ length: 10 }).map((_, i) => <line key={i} x1={sd * (70 + i * 22)} y1={-290} x2={sd * (75 + i * 22)} y2={-210} stroke="#05101e" strokeWidth={4} />)}
      <circle cx={sd * 175} cy={-205} r={30} fill="#ff1030" filter="url(#glowBig)" /><circle cx={sd * 175} cy={-205} r={10} fill="#fff" /></g>)}
    {/* нос-щели и морщины */}
    <path d="M-30 -160 L-50 -20 L-20 0 M30 -160 L50 -20 L20 0" stroke="#05101e" strokeWidth={8} fill="none" />
    {[-1, 1].map(sd => <path key={'w' + sd} d={`M${sd * 120} -80 Q${sd * 200} 20 ${sd * 230} 120`} stroke="#05101e" strokeWidth={6} fill="none" />)}
    {/* улыбка */}
    <path d="M-280 60 Q0 120 280 60 Q240 300 0 330 Q-240 300 -280 60Z" fill="#05060c" stroke="#05101e" strokeWidth={8} />
    {Array.from({ length: 12 }).map((_, i) => { const u = i / 11 - .5, x = u * 470, top = 92 + Math.abs(u) * 30, w = 40; return <g key={i}>
      <path d={`M${x - w / 2} ${top} L${x + w / 2} ${top} L${x + w * .4} ${top + 70 - Math.abs(u) * 40} L${x - w * .4} ${top + 70 - Math.abs(u) * 40}Z`} fill="#e4ecf8" stroke="#05101e" strokeWidth={3} />
      <path d={`M${x - w / 2} ${260 - Math.abs(u) * 60} L${x + w / 2} ${260 - Math.abs(u) * 60} L${x + w * .4} ${200 - Math.abs(u) * 40} L${x - w * .4} ${200 - Math.abs(u) * 40}Z`} fill="#d4dcea" stroke="#05101e" strokeWidth={3} /></g>; })}
    {/* штриховка под подбородком и трещины */}
    {Array.from({ length: 16 }).map((_, i) => <line key={'h' + i} x1={-200 + i * 26} y1={430} x2={-180 + i * 26} y2={560} stroke="#05101e" strokeWidth={5} />)}
    <path d="M-330 -380 L-250 -300 L-280 -200 M300 -60 L250 40 L290 120" stroke="#05101e" strokeWidth={5} fill="none" />
  </g>;
};

// f19: один пассажир поднимает голову — лица нет; затем второй; затем все
export const F19: React.FC<SP> = ({ t }) => {
  // резкие рывки зума на лицо (без плавности), с тряской; улыбка растягивается
  const steps = [0, 1.0, 1.5, 1.95, 2.35], zs = [1.0, 1.35, 1.8, 2.4, 3.1], k = steps.filter(x => t >= x).length - 1;
  const z = zs[k] + (t - steps[k]) * .05, [sx, sy] = shakeXY(t, steps.slice(1).map(x => [x, 22, .25] as [number, number, number]));
  const grin = ease(t, .55, 1.3);
  return <Frame t={t} grade="#1a1a2a" gradeK={.1} impact={steps.slice(1).some(x => isImpact(t, x, 1))}>
    <g transform={cam(z, 540, 700, sx, sy)}>
      <rect width={1080} height={1920} fill="#0a0b10" />
      <g transform={`translate(${t > 1.2 ? Math.sin(t * 45) * 3 : 0} 0)`}><Faceless x={540} y={2900} s={3.4} t={t} seed={5} lift={1} grin={grin} eyes={0} /></g>
      <Dark id="d19" k={.9} holes={[{ beam: [700, 1950, 540, 500, 420] }]} />
    </g>
  </Frame>;
};

// f20: в темноте Михалыч: «К бою!» — огонь в его руке освещает толпу, она уже рядом
export const F20: React.FC<SP> = ({ t }) => {
  const c = caps('f20'); const on = ease(t, .3, .7), fx = G.mikh[0] + 150, fy = G.mikh[1] - 640;
  return <Frame t={t} grade="#2a1a20" gradeK={.12}>
    <g transform={cam(1.1, 600, 1150)}>
      <TrainInterior t={0} flicker={0} vp={VP} />
      <Crowd t={t} adv={.9 + t * .05} lunge={.4} n={24} />
      <Low><H t={t} w="r1" pose={{ ...POSES.hold, armR: [60, -90] }} expr="determined" /><Rifle x={G.r1[0] + 40} y={G.r1[1] - 470} ang={-15} />
        <H t={t} w="mikh" pose={PK(t, [[0, 'stand'], [.25, { armR: [120, -40], armL: [-40, 60] }]])} expr="shout" mouth={talk(t, c, 'МИХАЛЫЧ')} />
        <H t={t} w="zhora" pose={POSES.guard} expr="angry" /><H t={t} w="kirill" pose={{ ...POSES.guard, armL: [-80, 30] }} expr="scared" /><H t={t} w="timur" expr="scared" pose={{ ...POSES.stand, crouch: 60 }} />
        <H t={t} w="r2" pose={POSES.guard} expr="scared" /></Low>
      <Dark id="d20" k={.9} holes={[{ spot: [540 + (fx - 540) * .8, 2080 - (1920 - fy) * .8, 380 * on + 60] }, { beam: [760, 1700, 520, 700, 200] }]} />
      <circle cx={540 + (fx - 540) * .8} cy={2080 - (1920 - fy) * .8} r={46 * on} fill="#ffb040" filter="url(#glowBig)" opacity={on} />
    </g>
  </Frame>;
};

// f21: бой А — огненный шар, взрыв освещает толпу; очередь из автомата вспышками; безликие рассыпаются, но лезут новые
export const F21: React.FC<SP> = ({ t }) => {
  const fb = .3, hit = .75, [sx, sy] = shakeXY(t, [[hit, 26, .6], [1.8, 12, .3], [2.4, 12, .3]]);
  const boomL = clamp(1 - Math.abs(t - hit - .15) / .5), muzzle = t > 1.5 && t < 2.9 && Math.floor(t * 30) % 2 === 0;
  const dis = (i: number) => i < 6 ? ease(t, hit, hit + .6) : i < 9 ? ease(t, 2.0, 2.6) : 0;
  return <Frame t={t} impact={isImpact(t, hit, 2)} grade="#2a1a20" gradeK={.1}>
    <g transform={cam(1.05, 540, 1050, sx, sy)}>
      <TrainInterior t={0} flicker={0} vp={VP} />
      <Crowd t={t} adv={1.0 + t * .08} lunge={.7} dis={dis} n={27} />
      <Smoke t={t} t0={hit} x={540} y={1300} n={12} r={130} spread={300} color="#0a0a10" life={1.6} rise={140} k={.9} seed={7} />
      <Smoke t={t} t0={2.0} x={700} y={1200} n={8} r={90} spread={180} color="#0a0a10" life={1.4} rise={120} k={.9} seed={8} />
      <Low>{TEAM.map(w => <H key={w} t={t} w={w} pose={w === 'mikh' ? { ...POSES.stand, armR: [120, -20] } : w === 'r1' ? { ...POSES.hold, armR: [60, -90] } : w === 'timur' ? { ...POSES.stand, crouch: 60 } : POSES.guard} expr={w === 'timur' || w === 'kirill' ? 'scared' : 'shout'} rim="#ffb060" />)}
        <Rifle x={G.r1[0] + 40} y={G.r1[1] - 470} ang={-15} /></Low>
      <Dark id="d21" k={.92} holes={[...(boomL > 0 ? [{ spot: [540, 1300, 700 * boomL] } as Hole] : []), ...(muzzle ? [{ spot: [740, 1560, 420] } as Hole] : []), { spot: [540, 1300, t > fb && t < hit ? 260 : 0] }]} />
      <Fireball t={t} t0={fb} x0={700} y0={1450} x1={540} y1={1300} /><Boom t={t} t0={hit} x={540} y={1300} /><Shock t={t} t0={hit} x={540} y={1300} c="#ffb060" />
      <Ash t={t} t0={hit} x={540} y={1250} n={50} spread={380} /><Ash t={t} t0={2.0} x={700} y={1150} n={30} spread={240} />
      <Tracers t={t} t0={1.5} t1={2.9} x0={740} y0={1560} x1={700} y1={1150} />
    </g>
  </Frame>;
};


// f20b: крупно Михалыч — в ладони закручивается огненная спираль, глаза загораются
export const F20b: React.FC<SP> = ({ t }) => {
  const k = ease(t, .1, .9);
  return <Frame t={t} grade="#3a1a10" gradeK={.1} over={<SpeedLines t={t} cx={700} cy={900} n={60} inner={380} color="#ffb060" k={.35 * k} />}>
    <rect width={1080} height={1920} fill="#0a0604" />
    <g transform={cam(1.1 + t * .08, 540, 900, noise('m20', t, 3) * 6, 0)}>
      <Figure x={420} y={2300} s={2.2} t={t} L={LK.mikh} C={CS.mikh} pose={{ ...POSES.stand, armR: [125, -40] }} expr="shout" seed={6} glow={0} rim="#ffb060" />
      <FireSpiral t={t} x={760} y={760} k={k} r={220} />
      <Motes t={t} x={760} y={900} w={500} h={700} n={40} color="#ffb040" speed={260} k={k} />
    </g>
  </Frame>;
};

// f21b: крупно Жора — замедление, рывок, кулак в огненной ауре → кадр-вспышка, ударная волна, безликий рассыпается пеплом
export const F21b: React.FC<SP> = ({ t }) => {
  const hit = 1.05, dash = t < hit ? Math.pow(ease(t, .2, hit), 3) : 1, [sx, sy] = shakeXY(t, [[hit, 34, .6]]);
  return <Frame t={t} impact={isImpact(t, hit, 3)} grade="#2a1408" gradeK={.1} over={<g>{t < hit && t > .3 && <DashLines t={t} k={.6} color="#ffd8a0" />}<Flash t={t} t0={hit} color="#ffe0b0" max={.7} /></g>}>
    <rect width={1080} height={1920} fill="#08060a" />
    <g transform={cam(1.25, 540, 1000, sx, sy)}>
      {t < hit + .1 && <Faceless x={820} y={2000} s={1.6} t={t} seed={12} grin={.6} lunge={.5} />}
      <Ash t={t} t0={hit} x={820} y={1200} n={60} spread={420} />
      <Shock t={t} t0={hit} x={760} y={1150} />
      <g transform={`translate(${-260 + dash * 420} 0)`}>
        <Figure x={360} y={2000} s={1.7} t={t} L={LK.zhora} C={CS.zhora} pose={t < hit ? { ...POSES.guard, armR: [70, -110], fistR: true, lean: 8 + dash * 10 } : { ...POSES.stand, armR: [-95, -5], fistR: true, lean: -16 }} expr="shout" seed={7} rim="#ff8a3a" />
      </g>
    </g>
  </Frame>;
};

// f22: бой Б — цепная молния, кулак Жоры в огне; Тимура хватают — Кирилл вырывает его
export const F22: React.FC<SP> = ({ t }) => {
  const bolt = .4, punch = 1.6, [sx, sy] = shakeXY(t, [[bolt, 14, .4], [punch, 24, .5]]);
  const flashB = clamp(1 - Math.abs(t - bolt - .1) / .35), flashP = clamp(1 - Math.abs(t - punch) / .4);
  const dis = (i: number) => i < 9 ? 1 : i < 13 ? ease(t, bolt + .1, bolt + .6) : i < 16 ? ease(t, punch, punch + .6) : 0;
  return <Frame t={t} impact={isImpact(t, punch, 2)} grade="#1a2030" gradeK={.1}>
    <g transform={cam(1.05, 540, 1050, sx, sy)}>
      <TrainInterior t={0} flicker={0} vp={VP} />
      <Crowd t={t} adv={1.25} lunge={.9} dis={dis} n={24} />
      <Smoke t={t} t0={bolt + .1} x={420} y={1300} n={10} r={110} spread={240} color="#0a0a10" life={1.5} rise={130} k={.9} seed={9} />
      <Smoke t={t} t0={punch} x={720} y={1340} n={10} r={110} spread={200} color="#0a0a10" life={1.5} rise={130} k={.9} seed={10} />
      <Low><H t={t} w="r2" pose={{ ...POSES.raiseR, armR: [150, -10] }} expr="shout" rim="#8fd8ff" />
        <H t={t} w="zhora" dx={-ease(t, 1.1, punch) * 180} pose={t < punch - .2 ? POSES.guard : PK(t - punch + .2, [[0, { armR: [60, -100], fistR: true }], [.2, { armR: [-95, -5], fistR: true, lean: -14 }], [.9, 'guard']])} expr="shout" rim="#ff8a3a" />
        <H t={t} w="timur" dx={t > .9 && t < 1.9 ? -60 : 0} pose={t > .9 && t < 1.9 ? { ...POSES.hit, armL: [-70, 20] } : { ...POSES.stand, crouch: 60 }} expr="scared" />
        <H t={t} w="kirill" pose={t > 1.0 && t < 2.0 ? { ...POSES.stand, armL: [-70, -15], fistL: true, lean: 12 } : POSES.guard} expr="shout" mouth={t > 1.1 && t < 1.7 ? .5 : 0} />
        {['mikh', 'r1'].map(w => <H key={w} t={t} w={w} pose={POSES.guard} expr="shout" />)}</Low>
      {t > .9 && t < 1.9 && <Faceless x={60} y={2050} s={1.2} t={t} seed={30} lunge={1} />}
      <Dark id="d22" k={.92} holes={[{ spot: [500, 1250, 800 * flashB] }, { spot: [650, 1300, 500 * flashP] }, { beam: [760, 1800, 400, 900, 180] }]} />
      <Bolt t={t} t0={bolt} pts={[[480, 1400], [430, 1300], [300, 1230], [700, 1260], [820, 1200]]} /><Bolt t={t} t0={bolt + .08} pts={[[430, 1300], [520, 1100], [620, 1080]]} /><Bolt t={t} t0={bolt + .12} pts={[[300, 1230], [220, 1050], [160, 980]]} />
      <Ash t={t} t0={bolt + .1} x={400} y={1250} n={40} spread={320} c="#1a2030" /><Ash t={t} t0={punch} x={680} y={1300} n={40} spread={300} />
      {t > punch - .25 && t < punch + .3 && <circle cx={650} cy={1300} r={70} fill="#ff7a2a" filter="url(#glowBig)" />}
      {t > punch - .05 && t < punch + .25 && <SpeedLines t={t} cx={650} cy={1300} n={40} inner={240} k={.5} />}
    </g>
  </Frame>;
};

// f23: свет мигает и возвращается — проход пуст, оседает чёрный дым; тишина
export const F23: React.FC<SP> = ({ t }) => {
  const lit = t > .9 ? 1 : (Math.floor(t * 14) % 3 === 0 ? 1 : 0);
  return <Frame t={t} grade="#2a2a3a" gradeK={.15}>
    <g transform={cam(1.0 + t * .03, 540, 1050)}>
      <TrainInterior t={t} flicker={.1} vp={VP} shake={1.2} />
      <Crowd t={t} adv={1.2} dis={(i) => i < 21 ? 1 : ease(t, .2 + (i - 21) * .2, .7 + (i - 21) * .2)} n={24} />
      <Smoke t={t} t0={0} x={540} y={1100} n={14} r={140} spread={380} color="#0a0a10" life={2.6} rise={160} k={.7} seed={11} />
      <Low>{TEAM.map(w => <H key={w} t={t} w={w} pose={POSES.stand} expr={w === 'timur' ? 'scared' : 'calm'} />)}</Low>
      <Dark id="d23" k={.9 * (1 - lit)} />
    </g>
  </Frame>;
};

// f24: Жора: «Изи. И это всё?» — смеётся; Михалыч опускает руку, но хмурится
export const F24: React.FC<SP> = ({ t }) => {
  const c = caps('f24');
  return <Frame t={t} grade="#2a2a3a" gradeK={.15}>
    <g transform={cam(1.25, 820, 1150)}>
      <TrainInterior t={t} flicker={.15} vp={VP} shake={1.5} />
      <H t={t} w="mikh" pose={PK(t, [[0, { armR: [100, -20] }], [1.0, 'stand']], false)} expr="angry" turn={-.3} lookX={.4} />
      <H t={t} w="zhora" pose={{ ...POSES.stand, armR: [150, -30], armL: [-20, 40] }} expr="smirk" mouth={talk(t, c, 'ЖОРА')} turn={-.3} />
    </g>
  </Frame>;
};

// f24b: Жора ещё смеётся — свет снова мигает; из темноты в конце вагона тот же смех, в окне торцевой двери — улыбка
export const F24b: React.FC<SP> = ({ t }) => {
  // свет мерцает — и поезд резко встаёт (следующий план)
  const off = (Math.floor(t * 11) % 3 === 0) || (t > .6 && t < .9) ? 1 : 0;
  return <Frame t={t} grade="#1a1a2a" gradeK={.15}>
    <g transform={cam(1.05, 540, 1000)}>
      <TrainInterior t={t} flicker={.3} vp={VP} shake={1.5} />
      <Low>{TEAM.map(w => <H key={w} t={t} w={w} pose={POSES.stand} expr={t > .3 ? 'scared' : w === 'zhora' ? 'smirk' : 'calm'} lookY={-.4} />)}</Low>
      <Dark id="d24b" k={.9 * off} holes={[{ spot: [540, 120, 110] }]} />
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
  // Машинист поднимает руки и снимает фонарь-голову, как шлем; под ним — лицо отца; отец говорит
  const c = caps('f28'); const lift = ease(t, .2, 1.3);
  const face = <g transform="translate(0 20) scale(1.25)"><Head t={t} L={LK.father} expr="sad" seed={12} lookY={.3} noBlink mouth={talk(t, c, '???') * .35} /></g>;
  return <Frame t={t} grade="#1a1a2a" gradeK={.12}>
    <g transform={cam(1.15 + t * .04, 540, 900, 0, -40)}>
      <rect width={1080} height={1920} fill="#0a0b10" />
      <Machinist x={540} y={2350} s={2.3} t={t} k={1} lift={lift} face={face} />
    </g>
  </Frame>;
};

// f28b: Кирилл: «Папа?..» — свет фонаря мерцает; на 3 кадра — оскал вместо лица отца (подсознательная вспышка)
export const F28b: React.FC<SP> = ({ t }) => {
  const c = caps('f28b'); const flick = .75 + .25 * noise('fk', t, 9);
  return <Frame t={t} grade="#2a2418" gradeK={.12}>
    <rect width={1080} height={1920} fill="#0c0a0e" /><ellipse cx={540} cy={640} rx={560} ry={560} fill="#fff0c0" opacity={.18 * flick} filter="url(#blur30)" />
    <g transform={cam(1.05 + t * .12, 540, 650)}><g transform="translate(540 600) scale(6.2)"><Head t={t} L={KL} expr="scared" seed={3} lookY={-.2} mouth={talk(t, c, 'КИРИЛЛ')} noBlink tears={.6} /></g></g>
  </Frame>;
};

// f28c: отец «сбоит» — лицо дёргается, мелькает синий оскал; к концу — синий целиком (дальше e0 продолжает с этого кадра)
export const F28c: React.FC<SP> = ({ t, d }) => {
  const f = Math.floor(t * 30), glitch = t > .3 && (f % 5 === 0 || f % 7 === 0), full = t > d - .45;
  const face = <g transform="translate(0 20) scale(1.25)"><Head t={t} L={LK.father} expr="smirk" seed={12} lookY={.3} noBlink /></g>;
  const [sx, sy] = shakeXY(t, [[.3, 8, d]]);
  if (full || glitch) return <Frame t={t} vign={1} impact={glitch && f % 2 === 0}><g transform={`translate(${sx} ${sy}) translate(540 1060) scale(.85) translate(-540 -1060)`}><BossGrin t={t} k={1} /></g></Frame>;
  return <Frame t={t} grade="#1a1a2a" gradeK={.12}>
    <g transform={cam(1.25 + t * .1, 540, 900, sx + (glitch ? 20 : 0), sy - 40)}>
      <rect width={1080} height={1920} fill="#0a0b10" />
      <Machinist x={540} y={2350} s={2.3} t={t} k={1} lift={1} face={face} />
    </g>
  </Frame>;
};

// e0: синий скример → камера влетает в пасть → пасть раскрывается синим порталом (переход в концовку)
export const E0: React.FC<SP> = ({ t, d }) => {
  const dive = Math.pow(ease(t, .5, 1.6), 2), portal = ease(t, 1.3, d - .2);
  const [sx, sy] = shakeXY(t, [[0, 10, .6]]);
  return <Frame t={t} vign={1} over={<g><Flash t={t} t0={1.45} dur={.35} color="#bfe8ff" max={.8} /><g opacity={ease(t, 1.7, 2.1) * (1 - ease(t, d - .25, d))}><text x={540} y={1560} textAnchor="middle" fontFamily="Oswald" fontWeight={500} fontSize={72} letterSpacing={18} fill="#e8f8ff" filter="url(#glow)">ГОД СПУСТЯ</text></g></g>}>
    <rect width={1080} height={1920} fill="#02030a" />
    {t < 1.55 && <g transform={`translate(${sx} ${sy}) translate(540 1060) scale(${.85 + dive * 6}) translate(-540 -1060)`}><BossGrin t={t} k={1} /></g>}
    {portal > 0 && <g><Gate x={540} y={900} s={.4 + portal * 1.6} t={t} /><Motes t={t} x={540} y={1300} w={900} h={1100} n={40} color="#7fe0ff" speed={260} k={portal} /></g>}
  </Frame>;
};

// ---------- концовка: карточка → Врата → будущий Кирилл → отряд из лайков и комментариев → «ОДИНОЧКА» ----------
const Card: React.FC<{ t: number }> = ({ t }) => <g>
  <rect x={-300} y={-440} width={600} height={880} rx={24} fill="#0a1426" stroke="#5fd2ff" strokeWidth={8} filter="url(#glow)" />
  <rect x={-270} y={-410} width={540} height={560} rx={12} fill="#141c30" />
  <g transform="translate(0 -110) scale(3)"><Head t={t} L={LK.kWeakHurt} expr="sad" seed={3} lookY={.2} /></g>
  <text y={250} textAnchor="middle" fontFamily="CormSC, serif" fontWeight={700} fontSize={110} fill="#ff4a5a" filter="url(#glow)">РАНГ E</text>
  <text y={330} textAnchor="middle" fontFamily="Oswald" fontWeight={400} fontSize={44} letterSpacing={4} fill="#c8d8f0">Самый слабый охотник</text>
  <path d="M-250 380 H250" stroke="#5fd2ff" strokeWidth={3} opacity={.6} />
</g>;
export const E1: React.FC<SP> = ({ t, d }) => {
  const suck = ease(t, d - 1.0, d - .1), g = ease(t, d - 1.4, d - .9);
  return <Frame t={t} vign={1}>
    <rect width={1080} height={1920} fill="#02040c" />
    {g > 0 && <Gate x={540} y={900} s={1.2 * g} t={t} />}
    <g transform={`translate(540 ${900 + (1 - spr(t, 0, { damping: 14 })) * 300}) rotate(${suck * 540}) scale(${(1 - suck) * (.9 + Math.sin(t * 2) * .01)})`} opacity={1 - suck * .3}><Card t={t} /></g>
    <Motes t={t} x={540} y={1700} w={1100} h={1500} n={30} color="#5fd2ff" speed={120} />
  </Frame>;
};
export const E2: React.FC<SP> = ({ t }) => {
  const walk = ease(t, .2, 2.0);
  return <Frame t={t} vign={1}>
    <rect width={1080} height={1920} fill="#02030a" />
    <Gate x={540} y={1050} s={2.0 - walk * .4} t={t} />
    <Smoke t={t} t0={-1} x={540} y={1750} n={12} r={180} spread={420} color="#05060c" life={3} rise={120} k={.9} seed={41} />
    <Figure x={540} y={1500 + walk * 380} s={.7 + walk * .6} t={t} L={LK.kirill4} C={CS.shadow} pose={walkPose(walk * 260)} expr="determined" glow={1} seed={3} rim="#5fd2ff" opacity={.2 + walk * .8} />
  </Frame>;
};
export const E3: React.FC<SP> = ({ t }) => {
  const c = caps('e3');
  const items = Array.from({ length: 26 }).map((_, i) => ({ x: 120 + h1(i * 3.1) * 840, y: 520 + h1(i * 7.7) * 600, t0: .2 + i * .1, heart: i % 2 === 0, txt: ['Жду 2 серию!', 'Это Фонарь!', 'Вступаю', 'Отец жив?', 'Кирилл топ', 'Отряд готов', 'Фонарь врёт', 'В отряд!'][i % 8] }));
  return <Frame t={t} vign={1}>
    <rect width={1080} height={1920} fill="#02030a" />
    <ellipse cx={540} cy={1000} rx={700} ry={900} fill="#1a3a8a" opacity={.3} filter="url(#blur30)" />
    {/* отряд встаёт за спиной: каждый лайк/коммент → силуэт бойца */}
    {items.map((it, i) => { const born = ease(t, it.t0 + .4, it.t0 + .9), row = i % 4, x = 100 + (i * 157) % 880, y = 1180 + row * 80, s = .4 + row * .09;
      const fl = clamp(1 - Math.abs(t - it.t0 - .45) / .15); return <g key={'s' + i}><g opacity={born}><ShadowSoldier x={x} y={y} s={s} t={t} rise={born} seed={i} kind={i % 4 === 0 ? 1 : 0} /></g>{fl > 0 && <circle cx={x} cy={y - 300 * s} r={70 * fl} fill="#7fe0ff" opacity={fl} filter="url(#glowBig)" />}</g>; })}
    <Figure x={540} y={1960} s={1.35} t={t} L={LK.kirill4} C={CS.shadow} pose={POSES.stand} expr="determined" glow={1} seed={3} rim="#5fd2ff" mouth={talk(t, c, 'КИРИЛЛ')} />
    {/* понятный посыл: лайк/коммент = боец + счётчик отряда */}
    <g opacity={ease(t, .2, .5)}>
      <rect x={90} y={150} width={900} height={190} rx={14} fill="#06182e" opacity={.85} stroke="#5fd2ff" strokeWidth={4} filter="url(#glow)" />
      <path transform="translate(170 205) scale(.9)" d="M0 22 C-56 -26 -36 -70 0 -44 C36 -70 56 -26 0 22Z" fill="#ff3a5a" />
      <text x={240} y={222} fontFamily="Oswald" fontWeight={600} fontSize={52} fill="#e8f8ff" letterSpacing={2}>ЛАЙК = НОВЫЙ БОЕЦ</text>
      <rect x={130} y={262} width={80} height={52} rx={12} fill="#0a1830" stroke="#5fd2ff" strokeWidth={4} />
      <text x={240} y={308} fontFamily="Oswald" fontWeight={600} fontSize={52} fill="#e8f8ff" letterSpacing={2}>КОММЕНТ = НОВЫЙ БОЕЦ</text>
    </g>
    <g opacity={ease(t, .4, .7)}><text x={540} y={430} textAnchor="middle" fontFamily="Oswald" fontWeight={500} fontSize={46} letterSpacing={8} fill="#9fdcff">{`ОТРЯД: ${Math.floor(Math.pow(clamp((t - .3) / 3.6), 2.2) * 9999)}`}</text></g>
    {items.map((it, i) => { const k = spr(t, it.t0, { damping: 12 }), gone = ease(t, it.t0 + .4, it.t0 + .7); if (t < it.t0 || gone >= 1) return null;
      const x = it.x + ((100 + (i * 157) % 880) - it.x) * gone, y = it.y + ((1180 + (i % 4) * 80 - 400) - it.y) * gone;
      return <g key={i} transform={`translate(${x} ${y}) scale(${k * (1 - gone * .6)})`} opacity={1 - gone}>
        {it.heart ? <path d="M0 22 C-56 -26 -36 -70 0 -44 C36 -70 56 -26 0 22Z" fill="#ff3a5a" filter="url(#glow)" />
          : <g><rect x={-130} y={-44} width={260} height={74} rx={18} fill="#0a1830" stroke="#5fd2ff" strokeWidth={4} /><text y={6} textAnchor="middle" fontFamily="Mont" fontWeight={700} fontSize={30} fill="#e8f8ff">{it.txt}</text></g>}
      </g>; })}
  </Frame>;
};
export const E4: React.FC<SP> = ({ t }) => {
  const pull = ease(t, 0, 2.0, (k: number) => 1 - Math.pow(1 - k, 3)), z = 1.6 - pull * .9;
  return <Frame t={t} vign={1}>
    <rect width={1080} height={1920} fill="#02030a" />
    <ellipse cx={540} cy={900} rx={900} ry={700} fill="#1a3a8a" opacity={.35} filter="url(#blur30)" />
    <g transform={cam(z, 540, 1500)}>
      {Array.from({ length: 6 }).map((_, row) => Array.from({ length: 9 + row * 2 }).map((_, i) => { const n = 9 + row * 2, k = Math.pow(.8, row); const x = 540 + (i - (n - 1) / 2) * 120 * k * 1.1; const y = 1500 - row * 80;
        return <ShadowSoldier key={row + '-' + i} x={x} y={y} s={.5 * k} t={t} rise={1} seed={row * 20 + i} kind={(row + i) % 5 === 0 ? 1 : 0} />; })).reverse()}
      <Figure x={540} y={1700} s={.75} t={t} L={LK.kirill4} C={CS.shadow} pose={POSES.stand} expr="determined" glow={1} seed={3} rim="#5fd2ff" />
    </g>
    <g opacity={ease(t, 1.0, 1.6)}>
      <rect x={0} y={1280} width={1080} height={420} fill="#02030a" opacity={.6} filter="url(#blur30)" />
      <text x={540} y={1430} textAnchor="middle" fontFamily="CormSC, serif" fontWeight={700} fontSize={140} letterSpacing={4} fill="#f4fbff" filter="url(#glow)">ОДИНОЧКА</text>
      <line x1={200} x2={880} y1={1480} y2={1480} stroke="#5fd2ff" strokeWidth={3} filter="url(#glow)" />
      <text x={540} y={1550} textAnchor="middle" fontFamily="Oswald" fontWeight={300} fontSize={42} letterSpacing={16} fill="#9fdcff">СЕРИЯ 2 — СКОРО</text>
    </g>
  </Frame>;
};
