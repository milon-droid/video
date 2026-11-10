// «Didn't Want To Anyway», сцены 1c–3f: телефон, скамейка, рукопожатие, пробежка, VIP-ложа, промах, трибуны.
// Все кадры 1080×1920, время t от начала плана. Эмблем клубов нет; номер у Диоманде не ставим (не проверен).
import React from 'react';
import { clamp, lerp, noise, shake, spr } from '../anim';
import { Glow } from '../bg/Bg';
import { blendPose, Pose, POSES, runPose } from '../chars/Person';
import { Cam } from '../ui/Ui';
import { Stadium } from '../stars/Clip';
import { T } from './i18n';
import { Ball, Baller, Bouquet, legPts, Sadie, smooth, THIGH, SHIN } from '../stars/Stars';
import { Cut, cutHand, dribble, footX, gait } from './Cut';

const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const full = (p: Partial<Pose>): Pose => ({ ...POSES.stand, ...p } as Pose);
// мяч на газоне: контактная тень (сжимается при подскоке), вращение по пройденному пути, блик не крутится
export const BallG: React.FC<{ x: number; g: number; r: number; rot?: number; h?: number }> = ({ x, g, r, rot = 0, h = 0 }) => (<g>
  <ellipse cx={x + r * .15} cy={g} rx={r * 1.05 / (1 + h / (r * 3))} ry={r * .26 / (1 + h / (r * 3))} fill="#000" opacity={.38 / (1 + h / (r * 2))} />
  <Ball x={x} y={g - r - h} r={r} rot={rot} />
  <circle cx={x - r * .35} cy={g - r - h - r * .35} r={r * .28} fill="#fff" opacity={.35} />
  <path d={`M${x - r * .7},${g - h - r * .35} A${r},${r} 0 0 0 ${x + r * .7},${g - h - r * .35}`} stroke="#000" strokeWidth={r * .12} opacity={.12} fill="none" /></g>);
// шаг/бег нарисованных кодом игроков (соперники, массовка): опорная стопа неподвижна, колено вперёд по ходу, таз пружинит.
// d — пройденный путь в единицах фигуры (мир / s), dir — направление в координатах фигуры. Возвращает позу и сдвиг фигуры вниз.
export const bGait = (d: number, dir: 1 | -1 = 1, run = true) => {
  const L = THIGH + SHIN, a = run ? 74 : 56, beta = run ? .4 : .6, cyc = 2 * a / beta, u = d / cyc, crouch = run ? .9 : .96, hipH = L * crouch;
  const s2 = Math.abs(Math.sin(u * Math.PI * 2)), bob = run ? -s2 * 14 : s2 * 6;
  const leg = (i: number): [number, number] => { const ph = ((u + i * .5) % 1 + 1) % 1; let x: number, lift = 0;
    if (ph < beta) x = a - 2 * a * ph / beta; else { const k = (ph - beta) / (1 - beta), e = k * k * (3 - 2 * k); x = -a + 2 * a * e; lift = Math.sin(Math.PI * k) * L * (run ? .28 : .14); }
    const tx = x * dir, ty = hipH - lift + bob, D0 = Math.min(Math.hypot(tx, ty), L - .5), al = Math.atan2(tx, ty);
    const ga = Math.acos(clamp((THIGH * THIGH + D0 * D0 - SHIN * SHIN) / (2 * THIGH * D0), -1, 1)), de = Math.acos(clamp((SHIN * SHIN + D0 * D0 - THIGH * THIGH) / (2 * SHIN * D0), -1, 1));
    const th = al + dir * ga, sh = al - dir * de; return [th, sh - th]; };
  const sw = Math.sin(u * Math.PI * 2) * (run ? .7 : .35);
  return { pose: full({ legL: leg(0), legR: leg(1), armL: [-sw * dir - .1, run ? .9 * dir : .2], armR: [sw * dir + .1, run ? .9 * dir : -.2], lean: dir * (run ? .1 : .04) }), dy: L - hipH - bob };
};
const wave = (t: number, base: number, amp = .25, f = 11) => base + Math.sin(t * f) * amp;
export type ShotP = { t: number; m?: number };   // m — открытие рта по голосу

// ───── 1c: Вини достаёт телефон (диван, средний план, герой крупнее, текст — сверху) ─────
export const ShotGrab: React.FC<ShotP> = ({ t, m = 0 }) => {
  const k = spr(t, .25, { damping: 12, stiffness: 140 }), fl = .5 + .5 * noise('gf', t, 3);
  return (<Cam z={1.85} fy={1250} dy={-330}>
    <rect width={1080} height={1920} fill="#1c1828" />
    <rect x={720} y={300} width={300} height={520} rx={8} fill="#0e0c16" /><rect x={734} y={314} width={272} height={492} fill="#1a2a5a" />
    <Glow x={540} y={800} r={900} c="#6a7aff" o={.35 + .2 * fl} id="grabTv" />
    <rect x={60} y={1080} width={960} height={400} rx={70} fill="#4a3650" /><rect x={30} y={1430} width={1020} height={120} rx={40} fill="#4a3858" /><rect x={50} y={1530} width={980} height={180} rx={30} fill="#33243a" />
    <Baller who="vini" outfit="home" sit x={540} y={1730} s={1.1} t={t + 9} expr="smug" mouth={m} hold="phone" headTilt={-6}
      pose={blendPose(full({ armL: [-.15, .5], armR: [.15, -.5] }), full({ armL: [-.15, .5], armR: [.25, -2.15] }), k)} eye={[.3, .1]} />
  </Cam>); };

// ───── 1e: лицо Вини крупно: отвечает «Whatever» и бросает телефон (телефон в руке до броска) ─────
export const ShotToss: React.FC<ShotP & { toss: number }> = ({ t, m = 0, toss }) => {
  const k = spr(t, toss, { damping: 10, stiffness: 200 }), rel = toss + .16, fly = t > rel ? t - rel : 0;
  return (<Cam z={2.1} fy={1160} dy={-340}>
    <rect width={1080} height={1920} fill="#1c1828" />
    <Glow x={540} y={800} r={900} c="#6a7aff" o={.4} id="tossTv" />
    <rect x={60} y={1080} width={960} height={400} rx={70} fill="#4a3650" /><rect x={30} y={1430} width={1020} height={120} rx={40} fill="#4a3858" />
    <Baller who="vini" outfit="home" sit x={540} y={1730} s={1.1} t={t + 12} expr="deadpan" mouth={m} hold={t < rel ? 'phone' : null} headTilt={4}
      pose={blendPose(full({ armL: [-.15, .5], armR: [.25, -2.15] }), full({ armL: [-.15, .5], armR: [2.2, -.3] }), k)} eye={[-.1, 0]} />
    {fly > 0 && (() => { const pz = (tt: number) => blendPose(full({ armL: [-.15, .5], armR: [.25, -2.15] }), full({ armL: [-.15, .5], armR: [2.2, -.3] }), spr(tt, toss, { damping: 10, stiffness: 200 }));
      const h0 = cutHand({ id: 'vini-home', x: 540, y: 1730, s: 1.1, t: rel + 12, sit: true, pose: pz(rel) }, 'R');   // вылетает из кисти в момент броска
      return <g transform={`translate(${h0[0] + fly * 1500},${h0[1] - fly * 1100 + fly * fly * 1600}) rotate(${fly * 900})`}><rect x={-28} y={-54} width={56} height={104} rx={10} fill="#111" /><rect x={-23} y={-47} width={46} height={88} rx={6} fill="#5ad0ff" /></g>; })()}
  </Cam>); };

// ───── массовка: игроки на дальнем плане поля ─────
type Extra = { who: any; outfit: any; x: number; y: number; s: number; sp: number; ph: number };
const EXTRAS: Extra[] = [
  { who: 'opp', outfit: 'opp', x: 140, y: 1290, s: .32, sp: 60, ph: 0 }, { who: 'mate', outfit: 'kit', x: 300, y: 1260, s: .28, sp: -40, ph: 1 },
  { who: 'opp2', outfit: 'opp', x: 620, y: 1250, s: .27, sp: 50, ph: 2 }, { who: 'mate2', outfit: 'kit', x: 820, y: 1300, s: .33, sp: -70, ph: 3 },
  { who: 'opp', outfit: 'opp', x: 980, y: 1270, s: .3, sp: 40, ph: 4 }, { who: 'mate3', outfit: 'kit', x: 470, y: 1320, s: .35, sp: 55, ph: 5 }];
export const FieldExtras: React.FC<{ t: number; skip?: number[]; dy?: number }> = ({ t, skip = [], dy = 0 }) => (<g>{EXTRAS.map((e, i) => { if (skip.includes(i)) return null;
  const x = e.x + Math.sin(t * .8 + e.ph) * Math.abs(e.sp), ph = (t * Math.abs(e.sp) * 2) / 40 + e.ph;
  return <Baller key={i} who={e.who} outfit={e.outfit} x={x} y={e.y + dy} s={e.s} t={t + i} pose={runPose(ph)} flip={Math.cos(t * .8 + e.ph) * e.sp < 0} shadow={.2} eye={[e.sp > 0 ? .6 : -.6, 0]} />; })}</g>);
// рекламные щиты у бровки
const Boards: React.FC<{ y: number; t: number }> = ({ y, t }) => (<g>{Array.from({ length: 4 }, (_, i) => <g key={i}><rect x={-40 + i * 300} y={y} width={301} height={70} fill="#0c1430" />
  <text x={106 + i * 300} y={y + 48} fontSize={36} fontWeight={900} fill={['#5af0ff', '#ffd23f', '#ff5a7a', '#7dffb0'][(i + Math.floor(t * 1.5)) % 4]} textAnchor="middle" fontFamily="Mont" letterSpacing={4}>{[T('b1'), T('b2'), T('b3'), T('b4')][i]}</text></g>)}</g>);

// ───── скамейка запасных, снятая С ПОЛЯ: трибуны позади, навес из оргстекла, сиденья, техзона перед ней ─────
const Crowd: React.FC<{ t: number; y0: number; y1: number; seed?: number }> = ({ t, y0, y1, seed = 0 }) => (<g>
  <rect x={-40} y={y0} width={1160} height={y1 - y0} fill="#0d1430" />
  {Array.from({ length: 220 }, (_, i) => { const x = hash(i + seed) * 1120 - 20, y = y0 + 20 + hash(i * 3.1 + seed) * (y1 - y0 - 30), c = ['#3a4a8a', '#5a3a6a', '#2a4a6a', '#e8e8f0', '#d2a640'][i % 5];
    const tw = hash(i * 9 + Math.floor(t * 6)) > .985;
    return <g key={i}><circle cx={x} cy={y} r={9 + hash(i * 7) * 5} fill={c} opacity={.6} />{tw && <circle cx={x} cy={y - 6} r={5} fill="#fff" />}</g>; })}
</g>);
export const DugoutFront: React.FC<{ t: number }> = ({ t }) => (<g>
  <defs><linearGradient id="dgSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#040817" /><stop offset="1" stopColor="#14275a" /></linearGradient></defs>
  <rect width={1080} height={1920} fill="url(#dgSky)" />
  <Crowd t={t} y0={300} y1={1000} seed={7} />
  <Glow x={540} y={260} r={700} c="#cfe8ff" o={.35} id="dgFl" />
  {/* рекламные щиты у бровки за скамейкой */}
  <Boards y={1000} t={t} />
  {/* навес: задняя стенка, оргстекло, каркас */}
  <rect x={-40} y={1070} width={1160} height={520} fill="#121a34" />
  <path d="M-40,1000 Q540,900 1120,1000 L1120,1080 Q540,980 -40,1080 Z" fill="#c8e4ff" opacity={.28} />
  <path d="M-40,1000 Q540,900 1120,1000" stroke="#8aa0c0" strokeWidth={10} fill="none" />
  {[60, 1020].map(x => <path key={x} d={`M${x},${x < 540 ? 990 : 990} L${x},1600`} stroke="#8aa0c0" strokeWidth={14} />)}
  <path d="M-40,1080 L60,1080 L60,1600 L-40,1600 Z M1020,1080 L1120,1080 L1120,1600 L1020,1600 Z" fill="#c8e4ff" opacity={.18} />
  {Array.from({ length: 6 }, (_, i) => <g key={i} transform={`translate(${130 + i * 165},1560)`}><path d="M-68,-150 Q-72,-30 -58,0 L58,0 Q72,-30 68,-150 Q0,-168 -68,-150 Z" fill="#1d3a8a" /><rect x={-64} y={-10} width={128} height={40} rx={10} fill="#16306e" /></g>)}
  {/* газон техзоны и её разметка */}
  <rect y={1590} width={1080} height={330} fill="#24703e" /><path d="M-40,1600 L1120,1600" stroke="#0e3a1c" strokeWidth={6} />
  <path d="M40,1880 L40,1680 L1040,1680 L1040,1880" stroke="#f4f8f4" strokeWidth={6} fill="none" strokeDasharray="30 20" opacity={.8} />
</g>);
export const SitPose = { armL: [-.15, .6] as [number, number], armR: [.15, -.6] as [number, number], legL: [-.15, 0] as [number, number], legR: [.15, 0] as [number, number] };
const BenchMates: React.FC<{ t: number; xs: number[] }> = ({ t, xs }) => (<g>{xs.map((x, i) => <Baller key={i} who={(['mate', 'mate2', 'mate3'] as const)[i % 3]} outfit="kit" sit x={x} y={1600} s={.85} t={t + i * 2}
  expr={(['neutral', 'deadpan', 'neutral'] as const)[i % 3]} pose={SitPose} eye={[.2, .2]} />)}</g>);

// ───── 2a-0: сначала поле — Диоманде блистает (обводит соперника); затем скамейка — грустный Вини ─────
export const BENCH_CUT = 2.4;
export const ShotBenchSad: React.FC<ShotP> = ({ t }) => {
  if (t < BENCH_CUT) {
    // Диоманде ведёт мяч: касание ведущей стопой → мяч катится → шаг; соперник выбегает навстречу и падает после финта
    const S = .85, x0 = 200, x = x0 + 235 * t, w = { d: (x - x0) / S, run: true, dir: 1 as const }, dr = dribble('diom-kit', w, S, 39);
    const trip = spr(t, 1.05, { damping: 10, stiffness: 120 }), ox = 940 - 230 * Math.min(t, 1.0), og = bGait((940 - ox) / .8, -1, true);
    return (<Cam z={1.05 + .04 * t} fy={1150} dy={-40}>
      <Stadium t={t + 1} flash={.4 + .3 * Math.sin(t * 7)} />
      <FieldExtras t={t} skip={[2, 3, 5]} dy={-30} />
      <Baller who="opp" outfit="opp" x={ox} y={1520 + (t < 1.05 ? og.dy * .8 : -trip * 10)} s={.8} t={t} rot={trip * -80} pose={t < 1.05 ? og.pose : full({ armL: [-2.4, .3], armR: [2.4, -.3], legL: [-.3, .4], legR: [.3, -.4] })} expr={t < 1.05 ? 'determined' : 'ko'} />
      <Glow x={x} y={1100} r={320} c="#fff2c0" o={.45} id="diomSpot" />
      <Cut id="diom-kit" x={x} y={1560} s={S} t={t + 3} walk={w} />
      <BallG x={x + dr.dx} g={1576} r={39} rot={dr.rot} />
      {[0, 1, 2, 3].map(i => { const u = (t * 1.4 + i * .25) % 1; return <path key={i} d={`M${x + Math.cos(i * 1.7) * 140 * u},${1000 - u * 160} l0,-30 l8,22 l22,8 l-22,8 z`} fill="#ffe27a" opacity={1 - u} />; })}
    </Cam>); }
  const u = t - BENCH_CUT;
  return (<Cam z={1.0 + .03 * u} fy={1200} dy={-40}>
    <DugoutFront t={t} />
    <BenchMates t={t} xs={[130, 660, 825]} />
    <Baller who="vini" sit x={395} y={1600} s={.9} t={t + 5} expr="sad" lid={.4} headTilt={10} eye={[.2, .5]} pose={{ ...SitPose, armR: [.55, -2.75] }} />
  </Cam>); };

// ───── 2a: тренер в техзоне зовёт, Вини вскакивает со скамейки ─────
export const ShotBench: React.FC<ShotP & { up: number }> = ({ t, m = 0, up }) => {
  const sit = t < up, j = spr(t, up, { damping: 9, stiffness: 180 }), hop = t > up ? Math.sin(clamp((t - up) / .35) * Math.PI) * 60 : 0;
  return (<Cam z={1.03 + .03 * t} fy={1250} dy={-60}>
    <DugoutFront t={t + 3} />
    <BenchMates t={t} xs={[130, 660]} />
    <Baller who="vini" sit={sit} x={395} y={sit ? 1600 : 1640 - hop} s={sit ? .9 : .95} t={t + 3} expr={sit ? 'sad' : 'happy'} teeth={!sit} mouth={m}
      pose={sit ? SitPose : blendPose(full({ armL: [-.3, .3], armR: [.3, -.3] }), full({ armL: [-2.5, .3], armR: [2.5, -.3], legL: [-.2, .1], legR: [.2, -.1] }), j) as Pose} eye={[.7, -.1]} />
    <Baller who="coach" outfit="coat" x={860} y={1800} s={1.05} t={t} expr="determined" mouth={t > .2 && t < .9 ? .3 + .2 * Math.sin(t * 20) : 0}
      pose={{ armL: [-.2, .2], armR: [wave(t, 2.2, .5, 9), -1.2] }} eye={[-.8, -.3]} headTilt={-6} />
  </Cam>); };

// ───── 2b: замена у бровки: Диоманде уходит с поля, рукопожатие и хлопок по плечу; резервный судья с табло ─────
export const ShotHandshake: React.FC<ShotP & { faded?: boolean }> = ({ t, m = 0 }) => {
  // 1) Диоманде уходит с поля за линию → 2) короткий хлопок по плечу → 3) Вини выходит на поле, Диоманде идёт к скамейке
  const dPos = (tt: number) => { const o = smooth(0, .6, tt); return [lerp(380, 400, o) - Math.max(0, tt - 1.5) * 260, lerp(1480, 1700, o), lerp(.88, 1.05, o)]; };
  const vPos = (tt: number) => { const e = smooth(1.5, 2.6, tt); return [lerp(700, 1010, e), lerp(1700, 1590, e), lerp(1.05, .98, e)]; };
  // пройденный путь (для шага без скольжения) — сумма приращений позиции, в единицах фигуры
  const path = (f: (tt: number) => number[], t0: number, t1: number) => { let d = 0, p0 = f(t0); for (let k = 1; k <= 24; k++) { const p1 = f(t0 + (t1 - t0) * k / 24); d += Math.hypot(p1[0] - p0[0], (p1[1] - p0[1]) * .5) / p1[2]; p0 = p1; } return d; };
  const [dX, dY, dS] = dPos(t), [vX, vY, vS] = vPos(t);
  const patOn = t > .65 && t < 1.15, pat = patOn ? Math.max(0, Math.sin((t - .65) * 18)) * .12 : 0, reach = smooth(.6, .7, t) * (1 - smooth(1.1, 1.25, t));
  const dWalk = t < .6 ? { d: path(dPos, 0, t), run: true, dir: 1 as const } : t > 1.5 ? { d: path(dPos, 1.5, t), dir: -1 as const } : undefined;
  const vWalk = t > 1.5 ? { d: path(vPos, 1.5, t), run: true, dir: 1 as const } : undefined;
  const vPose = t > 1.5 ? undefined : blendPose(full({ armL: [-.2, .2], armR: [.2, -.2] }), full({ armL: [-1.75 - pat, .45], armR: [.2, -.2] }), reach);
  return (<Cam z={1.06 + .03 * t} fy={1180} dy={-40}>
    <Stadium t={t + 4} />
    <FieldExtras t={t + 6} dy={-20} />
    {/* бровка: белая линия, за ней — зона у скамейки */}
    <path d="M-40,1610 L1120,1610" stroke="#f4f8f4" strokeWidth={10} />
    <rect x={-40} y={1620} width={1160} height={320} fill="#1e5a32" />
    <Boards y={1790} t={t} />
    {/* резервный судья с табло: зелёная 7 — выходит Вини, красная 25 — уходит Диоманде */}
    <Baller who="mate" outfit="ref" x={960} y={1700} s={.9} t={t + 2} expr="neutral" pose={{ armL: [-2.6, .2], armR: [2.6, -.2] }} eye={[-.5, -.4]} />
    <g transform="translate(830,880)"><rect x={-150} y={-70} width={300} height={140} rx={12} fill="#111" stroke="#333" strokeWidth={6} />
      <path d="M-128,12 L-110,-18 L-92,12 Z" fill="#2aff6a" /><text x={-50} y={26} fontSize={78} fontWeight={900} fill="#2aff6a" textAnchor="middle" fontFamily="JBM">7</text>
      <path d="M8,-18 L26,12 L44,-18 Z" fill="#ff3a3a" /><text x={98} y={26} fontSize={78} fontWeight={900} fill="#ff3a3a" textAnchor="middle" fontFamily="JBM">25</text></g>
    {(() => { const V = <Cut key="v" id="vini-kit" x={vX} y={vY} s={vS} t={t + 5} mouth={m} pose={vPose} walk={vWalk} headTilt={-4} />;
      const Dm = <Cut key="d" id="diom-kit" x={dX} y={dY} s={dS} t={t + 1} pose={dWalk ? undefined : { armR: [.25, -.2], armL: [-.2, .2] }} walk={dWalk} headTilt={5} />;
      return vY < dY ? <>{V}{Dm}</> : <>{Dm}{V}</>; })()}
  </Cam>); };

// ───── ворота анфас: ширина = 3 × высоты (7,32 × 2,44 м), сетка, разметка на газоне; base — линия ворот ─────
const GoalFront: React.FC<{ cx: number; base: number; H: number; children?: React.ReactNode }> = ({ cx, base, H, children }) => {
  const W = 3 * H, L = cx - W / 2, R = cx + W / 2, top = base - H, pw = Math.max(8, H * .045), bL = L + W * .06, bR = R - W * .06, bB = base - H * .2, bT = top + H * .1;
  return (<g>
    {/* сетка: задняя стенка и боковины */}
    <path d={`M${bL},${bB} L${bL},${bT} L${bR},${bT} L${bR},${bB} Z`} fill="#dfe8f0" opacity={.08} />
    {Array.from({ length: 30 }, (_, i) => { const x = lerp(bL, bR, i / 29); return <path key={i} d={`M${x},${bT} L${x},${bB}`} stroke="#fff" strokeWidth={2} opacity={.35} />; })}
    {Array.from({ length: 9 }, (_, i) => { const y = lerp(bT, bB, i / 8); return <path key={'h' + i} d={`M${bL},${y} L${bR},${y}`} stroke="#fff" strokeWidth={2} opacity={.3} />; })}
    <path d={`M${L},${top} L${bL},${bT} M${R},${top} L${bR},${bT} M${L},${base} L${bL},${bB} M${R},${base} L${bR},${bB} M${bL},${bT} L${bL},${bB} M${bR},${bT} L${bR},${bB}`} stroke="#e8eef4" strokeWidth={4} opacity={.7} />
    {children}
    {/* штанги и перекладина */}
    <path d={`M${L},${base} L${L},${top} L${R},${top} L${R},${base}`} stroke="#f4f6fa" strokeWidth={pw} fill="none" strokeLinejoin="round" />
    <path d={`M${L - pw * .2},${base} L${L - pw * .2},${top}`} stroke="#c8ccd6" strokeWidth={pw * .3} />
  </g>); };
// поле у ворот: трибуна за воротами, щиты, линия ворот, вратарская и штрафная площади в перспективе
const GoalEnd: React.FC<{ t: number; base: number; H: number; cx: number }> = ({ t, base, H, cx }) => { const W = 3 * H;
  return (<g>
    <defs><linearGradient id="geSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#040817" /><stop offset="1" stopColor="#14275a" /></linearGradient>
      <linearGradient id="gePitch" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2f8a4a" /><stop offset="1" stopColor="#14502a" /></linearGradient></defs>
    <rect width={1080} height={1920} fill="url(#geSky)" />
    <Crowd t={t} y0={base - H * 1.7} y1={base - H * .38} seed={3} />
    <Glow x={180} y={base - H * 1.9} r={500} c="#cfe8ff" o={.6} id="geF1" /><Glow x={900} y={base - H * 1.9} r={500} c="#cfe8ff" o={.6} id="geF2" />
    <rect x={-40} y={base - H * .38} width={1160} height={H * .38 + 4} fill="#2f8a4a" />
    <Boards y={base - H * .62} t={t} />
    <rect y={base} width={1080} height={1920 - base} fill="url(#gePitch)" />
    {Array.from({ length: 6 }, (_, i) => i % 2 ? <rect key={i} y={base + (i * i) * 18 + i * 40} width={1080} height={(2 * i + 1) * 18 + 40} fill="#fff" opacity={.05} /> : null)}
    <path d={`M-40,${base} L1120,${base}`} stroke="#f4f8f4" strokeWidth={7} />
    <path d={`M${cx - W / 2 - H * .8},${base} L${cx - W / 2 - H * 1.3},${base + H * .55} L${cx + W / 2 + H * 1.3},${base + H * .55} L${cx + W / 2 + H * .8},${base}`} stroke="#f4f8f4" strokeWidth={6} fill="none" />
    <path d={`M${cx - W / 2 - H * 2.4},${base} L${cx - W / 2 - H * 4},${base + H * 1.6} L${cx + W / 2 + H * 4},${base + H * 1.6} L${cx + W / 2 + H * 2.4},${base}`} stroke="#f4f8f4" strokeWidth={7} fill="none" />
  </g>); };
const KEEPER_H = 740;   // рост фигуры при s=1 — для масштаба: ворота ≈ 1,6 × рост вратаря

// ───── 3a: Вини получает пас и мчится к воротам; вратарь стоит в воротах ─────
export const ShotRun: React.FC<ShotP> = ({ t }) => {
  const k = smooth(0, 1.5, t), H = lerp(250, 330, k), base = lerp(1120, 1160, k), cx = lerp(640, 600, k), ks = H / 1.6 / KEEPER_H;
  const vx = 220 + 175 * t, w = { d: (vx - 220) / .95, run: true, dir: 1 as const }, dr = dribble('vini-kit', w, .95, 45);
  const recv = clamp(t / .3), bx = t < .3 ? lerp(-60, vx + dr.dx, recv * recv) : vx + dr.dx, bh = t < .3 ? Math.sin(recv * Math.PI) * 60 : 0;
  const og = bGait((vx - 220) / .85 + 40, 1, true), e1 = bGait(t * 140 / .3, 1, true), e2 = bGait(t * 120 / .32, 1, true);
  return (<Cam z={1.0} fy={1200} dy={-40}>
    <GoalEnd t={t + 6} base={base} H={H} cx={cx} />
    <GoalFront cx={cx} base={base} H={H}><Baller who="opp2" outfit="gk" x={cx + Math.sin(t * 4) * 20} y={base - 4} s={ks} t={t} pose={{ armL: [-.9, .3], armR: [.9, -.3], legL: [-.3, .2], legR: [.3, -.2] }} expr="determined" shadow={.2} /></GoalFront>
    <Baller who="opp" outfit="opp" x={880 - t * 140} y={base + 120 + e1.dy * .3} s={.3} t={t + 2} pose={e1.pose} flip />
    <Baller who="mate2" outfit="kit" x={150 + t * 120} y={base + 160 + e2.dy * .32} s={.32} t={t + 4} pose={e2.pose} />
    <Baller who="opp" outfit="opp" x={vx - 220} y={1600 + og.dy * .85} s={.85} t={t + 2} expr="determined" pose={og.pose} eye={[.8, .2]} />
    <Cut id="vini-kit" x={vx} y={1660} s={.95} t={t + 7} walk={w} />
    <BallG x={bx} g={1672} r={45} rot={dr.rot} h={bh} />
  </Cam>); };

// ───── 3b: VIP-ложа — за стеклом только Сэди, машет (взгляд в сторону скамейки) ─────
export const VipBox: React.FC<{ t: number; look?: [number, number] }> = ({ t, look = [-.6, .9] }) => (<g>
  <rect width={1080} height={1920} fill="#0c1022" />
  <path d="M-40,1160 Q540,1080 1120,1160 L1120,1920 L-40,1920 Z" fill="#141c3a" />
  {Array.from({ length: 160 }, (_, i) => { const x = hash(i) * 1120 - 20, y = 1200 + hash(i * 3) * 700; return <circle key={i} cx={x} cy={y} r={10 + hash(i * 5) * 5} fill={['#3a4a8a', '#5a3a6a', '#e8e8f0', '#2a4a6a'][i % 4]} opacity={.5} />; })}
  <rect x={0} y={300} width={1080} height={760} fill="#1a1e30" />
  {[0, 1].map(i => <rect key={i} x={i ? 860 : 0} y={330} width={220} height={700} fill="#22283e" />)}
  <rect x={170} y={380} width={740} height={600} rx={10} fill="#3a2a2a" />
  <Glow x={540} y={640} r={520} c="#ffc890" o={.75} id="vipWarm" />
  <g clipPath="url(#vipClip)"><defs><clipPath id="vipClip"><rect x={180} y={390} width={720} height={580} /></clipPath></defs>
    <rect x={180} y={820} width={720} height={160} fill="#6a3a2a" />
    <Sadie x={560} y={1330} s={.95} t={t + 2} expr="happy" eye={look} headTilt={-6} pose={{ armR: [wave(t, 2.5, .2), .45], armL: [-.15, .1] }} />
  </g>
  <rect x={180} y={880} width={720} height={100} fill="#1a1e30" opacity={.85} /><rect x={170} y={870} width={740} height={16} fill="#c8c0b0" />
  <path d="M220,400 L380,400 L240,960 L180,960 Z" fill="#fff" opacity={.08} /><path d="M620,400 L700,400 L560,960 L480,960 Z" fill="#fff" opacity={.06} />
  <rect x={170} y={380} width={740} height={600} rx={10} fill="none" stroke="#0a0c16" strokeWidth={14} />
  <text x={540} y={1035} fontSize={44} fontWeight={900} fill="#e8c46a" textAnchor="middle" fontFamily="Mont" letterSpacing={8}>VIP</text>
</g>);
export const ShotBox: React.FC<ShotP> = ({ t }) => <Cam z={1.45 + .1 * smooth(0, 1.6, t)} fy={720} dy={180}><VipBox t={t} /></Cam>;

// ───── 3c: Вини крупно, глаза-сердечки ─────
export const ShotHearts: React.FC<ShotP> = ({ t, m = 0 }) => {
  const h = spr(t, .35, { damping: 7, stiffness: 220 });
  return (<Cam z={2.2} fy={880} dy={-80}>
    <Stadium t={t + 8} />
    <Glow x={540} y={760} r={500} c="#ff7aa0" o={.35 * h} id="heartGlow" />
    <Baller who="vini" x={540} y={1600} s={1.0} t={t + 9} expr="happy" teeth={t > .35} mouth={m} hearts={h} headTilt={-14} eye={[-.6, -.9]} pose={{ armL: [-.3, .3], armR: [.3, -.3] }} />
    {t > .4 && [0, 1, 2, 3].map(i => { const u = t - .4 - i * .3; if (u < 0) return null; const x = 440 + i * 70 + Math.sin(u * 5 + i) * 20, y = 760 - u * 260;
      return <path key={i} transform={`translate(${x},${y}) scale(.9)`} d="M0,14 C-6,8 -30,-4 -30,-18 C-30,-32 -12,-36 0,-22 C12,-36 30,-32 30,-18 C30,-4 6,8 0,14 Z" fill="#ff5a8a" opacity={clamp(1 - u)} />; })}
  </Cam>); };

// ───── 3d: вратарь стоит в воротах; Вини ведёт мяч, замечает Сэди, останавливается и машет ложе (удара нет) —
// защитник выбегает спереди, одно касание бутсой перед Вини → мяч и защитник уходят вправо в одном направлении ─────
export const STEAL_AT = .85;
export const ShotSteal: React.FC<ShotP> = ({ t }) => {
  const H = 700, base = 1330, cx = -100, ks = H / 1.6 / KEEPER_H, s = .85, vy = 1640, R = 45 * s;
  // ведение до остановки (шаг, влево к воротам), затем мяч докатывается и замирает
  const tS = .4, vxAt = (tt: number) => 760 - 300 * (Math.min(tt, tS) - Math.min(tt, tS) ** 2 / (2 * tS * 1.25));
  const vx = vxAt(t), w = { d: (760 - vx) / s, dir: -1 as const }, dr = (tt: number) => dribble('vini-kit', { d: (760 - vxAt(tt)) / s, dir: -1 }, s, R);
  const bStop = vxAt(tS) + dr(tS).dx - 30, roll = (tt: number) => tt < tS ? vxAt(tt) + dr(tt).dx : bStop + 30 * (1 - Math.max(0, 1 - (tt - tS) / .15) ** 2);
  const hit = STEAL_AT, bu = Math.max(0, t - hit - .04), bx = t < hit + .04 ? roll(Math.min(t, tS + .15)) : roll(tS + .15) + bu * 950 - bu * bu * 120;
  const brot = t < hit ? dr(Math.min(t, tS)).rot : dr(tS).rot - bu * 950 / R * 57.3;
  // защитник: выбегает слева спереди → тычок правой ногой (касание) → бежит вправо за мячом
  const dy0 = vy + 110, run1 = (tt: number) => -220 + (bStop - 135 + 220) * smooth(.15, hit, tt);
  const ox = t < hit ? run1(t) : t < hit + .14 ? bStop - 135 : bStop - 135 + (t - hit - .14) * 820;
  const og = t < hit ? bGait((run1(t) + 220) / .9, 1, true) : bGait((t - hit) * 820 / .9 + 200, 1, true);
  const poke = t >= hit - .08 && t < hit + .14, pokeK = smooth(hit - .08, hit, t);
  const oPose = poke ? full({ legL: [-.15, .1], legR: [lerp(.2, 1.15, pokeK), -.25], armL: [-1.2, .4], armR: [.9, -.3], lean: .12 }) : og.pose;
  const h = spr(t, .3, { damping: 8, stiffness: 200 }), sh = shake(t, hit, 6, .25);
  // вратарь стоит в воротах, следит за мячом, переносит вес
  const kx = 620 + Math.sin(t * 3) * 14, kLean = Math.sin(t * 3) * .05;
  return (<Cam z={1.0} fy={1250} dx={sh[0]} dy={sh[1] - 40}>
    <GoalEnd t={t + 10} base={base} H={H} cx={cx} />
    <GoalFront cx={cx} base={base} H={H}>
      <Baller who="opp2" outfit="gk" x={kx} y={base - 6} s={ks} t={t} expr="determined" eye={[clamp((bx - kx) / 500, -1, 1), .4]} shadow={.25}
        pose={{ armL: [-.75, .35], armR: [.75, -.35], legL: [-.26 + kLean, .2], legR: [.26 + kLean, -.2], lean: kLean }} />
    </GoalFront>
    <Cut id="vini-kit" x={vx} y={vy} s={s} t={t + 11} walk={t < tS ? w : undefined} hearts={h * .8} headTilt={-12 * smooth(.3, .6, t)}
      pose={t < tS ? undefined : { armL: [-.15, .15], armR: [wave(t, 2.4, .25) * smooth(.45, .7, t) + .12 * (1 - smooth(.45, .7, t)), .4 * smooth(.45, .7, t)] }} />
    <BallG x={bx} g={vy + 34} r={R} rot={brot} />
    {t > .1 && <Baller who="opp" outfit="opp" x={ox} y={dy0 + (poke ? 10 : og.dy * .9)} s={.9} t={t + 3} expr={t < hit + .1 ? 'determined' : 'happy'} teeth={t > hit + .1} pose={oPose} eye={[.8, .3]} />}
    {t > hit && t < hit + .25 && <circle cx={bStop} cy={vy + 34 - R} r={R + (t - hit) * 420} fill="none" stroke="#fff" strokeWidth={8} opacity={1 - (t - hit) / .25} />}
  </Cam>); };

// ───── 3e: трибуны ругают Вини: злые лица, кричат, грозят кулаками, «БУ» ─────
export const ShotFans: React.FC<ShotP> = ({ t }) => {
  const sh = shake(t, .05, 8, .5), up = spr(t, .06, { damping: 9, stiffness: 200 });
  const skins = ['#f1c7a6', '#c88a62', '#6e4632', '#e2b08c', '#8a5a40'], shirts = ['#f6f6f3', '#1d2a5c', '#f6f6f3', '#d2a640', '#f6f6f3'];
  return (<Cam z={1.06} fy={960} dx={sh[0]} dy={sh[1]}>
    <rect width={1080} height={1920} fill="#0d1430" />
    {[0, 1, 2, 3].map(row => <g key={row}>
      <rect x={-40} y={520 + row * 360} width={1160} height={60} fill="#1d2a55" />
      {Array.from({ length: 5 }, (_, i) => { const n = row * 5 + i, cx = 110 + i * 215 + (row % 2) * 100 - 50, cy = 470 + row * 360, sk = skins[n % 5], sc = .9 + row * .12;
        // 4 разные реакции, начало у каждого своё: 0 — руки на голове, 1 — грозит кулаком, 2 — ладонь на лице, 3 — тычет пальцем
        const kind = (n * 7 + row) % 4, u = spr(t, .04 + hash(n) * .35, { damping: 10, stiffness: 180 }), shk = Math.sin(t * 22 + n) * 14 * u;
        const shout = .55 + .45 * Math.abs(Math.sin(t * 10 + n));
        const tgt = (sd: number): [number, number] => kind === 0 ? [sd * 46, -150] : kind === 1 ? (sd > 0 ? [92, -200 + shk] : [-60, 50]) : kind === 2 ? (sd > 0 ? [8, -96] : [-58, 50]) : (sd > 0 ? [120, -70] : [-40, 40]);
        const arms = [-1, 1].map(sd => { const [tx, ty] = tgt(sd), hx = lerp(sd * 60, tx, u), hy = lerp(50, ty, u);
          return <g key={sd}><path d={`M${sd * 52},-10 Q${sd * 86},${(hy - 10) / 2} ${hx},${hy}`} stroke={sk} strokeWidth={22} fill="none" strokeLinecap="round" />
            {kind === 3 && sd > 0 ? <g><circle cx={hx} cy={hy} r={16} fill={sk} /><path d={`M${hx},${hy} l44,10`} stroke={sk} strokeWidth={10} strokeLinecap="round" /></g> : <circle cx={hx} cy={hy} r={19} fill={sk} />}</g>; });
        return (<g key={i} transform={`translate(${cx},${cy + (kind === 0 ? 6 * u : 0)}) scale(${sc})`}>
          <path d="M-70,90 Q-74,-10 -40,-30 L40,-30 Q74,-10 70,90 Z" fill={shirts[n % 5]} />
          {kind !== 2 && arms}
          <circle cx={0} cy={-100} r={50} fill={sk} />
          <ellipse cx={-17} cy={-104} rx={8} ry={7} fill="#fff" /><ellipse cx={17} cy={-104} rx={8} ry={7} fill="#fff" /><circle cx={-15} cy={-103} r={4} fill="#1a0f0a" /><circle cx={15} cy={-103} r={4} fill="#1a0f0a" />
          <path d="M-32,-126 L-6,-114 M32,-126 L6,-114" stroke="#2a1a1a" strokeWidth={6} strokeLinecap="round" />
          <path d={`M-16,${-82} L16,${-82} L12,${-82 + 22 * shout} L-12,${-82 + 22 * shout} Z`} fill="#5a1d24" /><rect x={-13} y={-82} width={26} height={5} fill="#fff" />
          {kind === 2 && arms}
          {kind === 1 && <path d="M60,-120 l14,-6 M62,-104 l16,0 M60,-88 l14,6" stroke="#ff6a6a" strokeWidth={4} strokeLinecap="round" opacity={u} />}
        </g>); })}
    </g>)}
    {t > .15 && <g transform={`translate(${200 + (t - .15) * 700},${400 + (t - .15) * 300}) rotate(${(t - .15) * 600})`}><path d="M-20,-30 L20,-30 L14,30 L-14,30 Z" fill="#fff" /><rect x={-20} y={-34} width={40} height={8} fill="#e5383b" /></g>}
    <Glow x={540} y={200} r={700} c="#ff8a8a" o={.25} id="fanLight" />
  </Cam>); };

// ───── 3f: Вини улыбается и машет ложе (без мяча, соперник убегает на дальнем плане) ─────
export const ShotWave: React.FC<ShotP> = ({ t, m = 0 }) => (<Cam z={1.6} fy={1050} dy={-60}>
  <Stadium t={t + 12} />
  <FieldExtras t={t + 12} />
  <Baller who="opp" outfit="opp" x={900 - t * 200} y={1330} s={.4} t={t} pose={runPose(t * 10)} flip />
  <Ball x={860 - t * 200} y={1325} r={14} rot={-t * 800} />
  <Baller who="vini" x={540} y={1620} s={1.0} t={t + 13} expr="smug" mouth={m} teeth={m < .1} headTilt={-8} eye={[-.6, -.7]} pose={{ armR: [wave(t, 2.5, .25), .4], armL: [-.2, .2] }} />
</Cam>);

// ───── 4a: коридор VIP: поправляет причёску, букет из-за спины ─────
const Corridor: React.FC<{ t: number }> = ({ t }) => (<g>
  <defs><linearGradient id="corW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a2e2a" /><stop offset="1" stopColor="#5a463a" /></linearGradient></defs>
  <rect width={1080} height={1920} fill="url(#corW)" />
  {Array.from({ length: 6 }, (_, i) => <rect key={i} x={i * 190 - 40} y={500} width={150} height={900} rx={6} fill="#4a3a32" opacity={.6} />)}
  {[200, 540, 880].map((x, i) => <g key={i}><rect x={x - 50} y={200} width={100} height={20} rx={8} fill="#fff4d8" /><Glow x={x} y={240} r={300} c="#ffd8a0" o={.45} id={'cl' + i} /></g>)}
  <rect y={1460} width={1080} height={460} fill="#2a1a1a" /><path d="M340,1460 L740,1460 L980,1920 L100,1920 Z" fill="#7a1a2a" />
  <path d="M340,1460 L740,1460" stroke="#c8a24a" strokeWidth={6} />
</g>);
export const ShotCorridor: React.FC<ShotP & { swap: number }> = ({ t, swap }) => {
  const k = spr(t, swap, { damping: 9, stiffness: 160 }), hair = t < swap - .1;
  // букет заранее за спиной (рука за корпусом) → рука выводит его вперёд, к груди
  const behind: [number, number] = [.3, -2.7], front: [number, number] = [.35, -2.3], ar: [number, number] = t < swap ? behind : [lerp(behind[0], front[0], k), lerp(behind[1], front[1], k)];
  const P = full({ armL: hair ? [-2.3, -1.3 + Math.sin(t * 12) * .25] : [-.2, .2], armR: ar });
  return (<Cam z={1.25} fy={1100} dy={-40}>
    <Corridor t={t} />
    <Cut id="vini-kit" x={540} y={1640} s={1.05} t={t + 14} hold="flowers" armRBack={t < swap + .12} pose={P} headTilt={hair ? -6 : 0} />
    {t > swap && t < swap + .5 && [0, 1, 2, 3, 4].map(i => { const a = i * 1.26, r = 60 + (t - swap) * 400; return <path key={i} d={`M${700 + Math.cos(a) * r},${1050 + Math.sin(a) * r} l0,-24 l6,18 l18,6 l-18,6 z`} fill="#ffe27a" opacity={1 - (t - swap) / .5} />; })}
  </Cam>); };

// ───── 4b: дверь VIP открывается ─────
export const ShotDoor: React.FC<ShotP> = ({ t }) => {
  // крупно: кисть Вини (тёмное предплечье, рукав за кадром) ложится на ручку → поворот ручки вниз → дверь открывается
  const grab = smooth(0, .22, t), turn = smooth(.24, .4, t) * (1 - smooth(.62, .8, t) * .6), k = smooth(.42, 1.0, t);
  const SK = '#7a4a32', SKD = '#5a3422', SKH = '#93603f';
  const doorW = 1 - k * .85, hx = 240 + 500 * doorW, hy = 960;
  return (<Cam z={1.15} fy={1000}>
    <rect width={1080} height={1920} fill="#3a2e2a" />
    <rect x={240} y={300} width={600} height={1300} fill="#fff1d8" /><Glow x={540} y={900} r={700} c="#ffe0b0" o={k} id="doorLight" />
    <g transform={`translate(240,0) scale(${doorW},1)`}><rect x={0} y={300} width={600} height={1300} fill="#5a3422" />
      <rect x={60} y={380} width={480} height={500} rx={10} fill="none" stroke="#4a2a1a" strokeWidth={14} /><rect x={60} y={960} width={480} height={560} rx={10} fill="none" stroke="#4a2a1a" strokeWidth={14} />
      <rect x={200} y={420} width={200} height={70} rx={10} fill="#c8a24a" /><text x={300} y={470} fontSize={44} fontWeight={900} fill="#3a2414" textAnchor="middle" fontFamily="Mont">VIP</text></g>
    <rect x={220} y={280} width={640} height={1340} fill="none" stroke="#2a1e18" strokeWidth={40} />
    {/* ручка-рычаг на розетке: поворачивается вниз; кисть Вини обхватывает рычаг (пальцы спереди поверх, тыльная сторона сверху) */}
    {(() => { const lw = 150 * Math.max(.3, doorW), th = -turn * 32, tr = th * Math.PI / 180;
      const G = [hx - lw * .55 * Math.cos(tr), hy - lw * .55 * Math.sin(tr)];
      const off = (1 - grab) * 900, gx = G[0] + off * .55, gy = G[1] + off;
      return <g>
        <g transform={`translate(${hx},${hy})`}><ellipse cx={0} cy={0} rx={30 * Math.max(.3, doorW)} ry={46} fill="#b8902e" />
          <g transform={`rotate(${th})`}><rect x={-lw} y={-13} width={lw} height={26} rx={13} fill="#e8c46a" /><rect x={-lw} y={-13} width={lw} height={8} rx={4} fill="#fff4c8" opacity={.6} /></g>
          <circle r={16} fill="#f4d47a" /></g>
        {/* предплечье: от кисти вниз-вправо за край кадра; рукав футболки — за кадром */}
        <path d={`M${gx - 6},${gy - 44} L${gx + 82},${gy + 34} L${gx + 82 + 600},${gy + 34 + 960} L${gx - 6 - 60 + 560},${gy - 44 + 1040} Z`} fill={SK} />
        <path d={`M${gx + 82},${gy + 34} L${gx + 682},${gy + 994}`} stroke={SKD} strokeWidth={8} opacity={.7} />
        <path d={`M${gx + 20},${gy - 24} L${gx + 540},${gy + 990}`} stroke={SKH} strokeWidth={18} opacity={.35} strokeLinecap="round" />
        <g transform={`translate(${gx},${gy}) rotate(${th})`}>
          <ellipse cx={14} cy={-30} rx={56} ry={36} fill={SK} stroke={SKD} strokeWidth={5} />
          <path d="M40,8 q26,10 30,-12" fill="none" stroke={SKD} strokeWidth={5} />
          {[0, 1, 2, 3].map(i => <rect key={i} x={-40 + i * 21} y={-34} width={20} height={58} rx={10} fill={SK} stroke={SKD} strokeWidth={4} />)}
          {[0, 1, 2, 3].map(i => <path key={'k' + i} d={`M${-36 + i * 21},${-22} q6,-6 12,0`} stroke={SKH} strokeWidth={4} fill="none" opacity={.6} />)}</g></g>; })()}
  </Cam>); };
