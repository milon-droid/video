// «Didn't Want To Anyway», сцены 1c–3f: телефон, скамейка, рукопожатие, пробежка, VIP-ложа, промах, трибуны.
// Все кадры 1080×1920, время t от начала плана. Эмблем клубов нет; номер у Диоманде не ставим (не проверен).
import React from 'react';
import { clamp, lerp, noise, shake, spr } from '../anim';
import { Glow } from '../bg/Bg';
import { blendPose, Pose, POSES, runPose } from '../chars/Person';
import { Cam } from '../ui/Ui';
import { Stadium } from '../stars/Clip';
import { Ball, Baller, Bouquet, legPts, Sadie, smooth } from '../stars/Stars';

const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const full = (p: Partial<Pose>): Pose => ({ ...POSES.stand, ...p } as Pose);
const wave = (t: number, base: number, amp = .25, f = 11) => base + Math.sin(t * f) * amp;
export type ShotP = { t: number; m?: number };   // m — открытие рта по голосу

// ───── 1c: Вини достаёт телефон (диван, средний план) ─────
export const ShotGrab: React.FC<ShotP> = ({ t, m = 0 }) => {
  const k = spr(t, .25, { damping: 12, stiffness: 140 }), fl = .5 + .5 * noise('gf', t, 3);
  return (<Cam z={1.55} fy={1050} dy={-80}>
    <rect width={1080} height={1920} fill="#1c1828" />
    <rect x={720} y={300} width={300} height={520} rx={8} fill="#0e0c16" /><rect x={734} y={314} width={272} height={492} fill="#1a2a5a" />
    <Glow x={540} y={700} r={900} c="#6a7aff" o={.35 + .2 * fl} id="grabTv" />
    <rect x={60} y={1080} width={960} height={260} rx={70} fill="#4a3650" /><rect x={30} y={1260} width={1020} height={420} rx={60} fill="#3a2a40" />
    <Baller who="vini" outfit="home" sit x={540} y={1560} s={1.1} t={t + 9} expr="smug" mouth={m} hold="phone" headTilt={-6}
      pose={blendPose(full({ armL: [-.15, .5], armR: [.15, -.5] }), full({ armL: [-.15, .5], armR: [.25, -2.15] }), k)} eye={[.3, .1]} />
  </Cam>); };

// ───── 1d: экран мессенджера (без логотипа) — рисуется в HTML поверх, см. Phone UI в Ne.tsx ─────

// ───── 1e: лицо Вини крупно, отбрасывает телефон ─────
export const ShotToss: React.FC<ShotP & { toss: number }> = ({ t, m = 0, toss }) => {
  const k = spr(t, toss, { damping: 10, stiffness: 200 }), fly = t > toss ? t - toss : 0;
  return (<Cam z={2.1} fy={900} dy={-120}>
    <rect width={1080} height={1920} fill="#1c1828" />
    <Glow x={540} y={700} r={900} c="#6a7aff" o={.4} id="tossTv" />
    <rect x={60} y={1080} width={960} height={260} rx={70} fill="#4a3650" />
    <Baller who="vini" outfit="home" sit x={540} y={1560} s={1.1} t={t + 12} expr="deadpan" mouth={m} hold={t < toss ? 'phone' : null} headTilt={4}
      pose={blendPose(full({ armL: [-.15, .5], armR: [.25, -2.15] }), full({ armL: [-.15, .5], armR: [2.2, -.3] }), k)} eye={[-.1, 0]} />
    {fly > 0 && <g transform={`translate(${760 + fly * 1500},${700 - fly * 900 + fly * fly * 1400}) rotate(${fly * 900})`}><rect x={-28} y={-54} width={56} height={104} rx={10} fill="#111" /><rect x={-23} y={-47} width={46} height={88} rx={6} fill="#5ad0ff" /></g>}
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
const Boards: React.FC<{ y: number; t: number }> = ({ y, t }) => (<g>{Array.from({ length: 4 }, (_, i) => <g key={i}><rect x={-40 + i * 300} y={y} width={292} height={70} fill="#0c1430" />
  <text x={106 + i * 300} y={y + 48} fontSize={36} fontWeight={900} fill={['#5af0ff', '#ffd23f', '#ff5a7a', '#7dffb0'][(i + Math.floor(t * 1.5)) % 4]} textAnchor="middle" fontFamily="Mont" letterSpacing={4}>{['FOOTBALL', 'GOAL!', 'MATCHDAY', 'ON AIR'][i]}</text></g>)}</g>);

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
    const x = lerp(260, 820, smooth(0, BENCH_CUT, t)) + Math.sin(t * 7) * 30, ph = t * 10, trip = spr(t, 1.0, { damping: 10, stiffness: 120 });
    return (<Cam z={1.05 + .04 * t} fy={1150} dy={-40}>
      <Stadium t={t + 1} flash={.4 + .3 * Math.sin(t * 7)} />
      <FieldExtras t={t} skip={[2, 3, 5]} dy={-30} />
      <Baller who="opp" outfit="opp" x={600} y={1520 - trip * 10} s={.8} t={t} rot={trip * -80} pose={t < 1 ? runPose(t * 9) : full({ armL: [-2.4, .3], armR: [2.4, -.3], legL: [-.3, .4], legR: [.3, -.4] })} expr={t < 1 ? 'determined' : 'ko'} />
      <Glow x={x} y={1100} r={320} c="#fff2c0" o={.45} id="diomSpot" />
      <Baller who="diom" x={x} y={1560} s={.85} t={t + 3} pose={runPose(ph)} expr="happy" teeth />
      <Ball x={x + 90 + Math.sin(ph) * 10} y={1552 - Math.abs(Math.sin(ph)) * 20} r={28} rot={t * 900} />
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
  const pat = Math.max(0, Math.sin(t * 9)) * .12, walk = clamp(t / .5), dX = lerp(300, 360, walk);
  return (<Cam z={1.08 + .04 * t} fy={1150} dy={-40}>
    <Stadium t={t + 4} />
    <FieldExtras t={t + 6} dy={-20} />
    {/* бровка: белая линия у ног, техзона */}
    <path d="M-40,1610 L1120,1610" stroke="#f4f8f4" strokeWidth={10} />
    <rect x={-40} y={1640} width={1160} height={300} fill="#1e5a32" />
    <Boards y={1700} t={t} />
    {/* резервный судья с электронным табло замены */}
    <Baller who="coach" outfit="coat" x={960} y={1630} s={.9} t={t + 2} expr="neutral" pose={{ armL: [-2.6, .2], armR: [2.6, -.2] }} eye={[-.5, -.4]} />
    <g transform="translate(960,1020)"><rect x={-110} y={-70} width={220} height={140} rx={12} fill="#111" stroke="#333" strokeWidth={6} />
      <text x={-50} y={22} fontSize={78} fontWeight={900} fill="#2aff6a" textAnchor="middle" fontFamily="JBM">7</text><path d="M-8,10 L10,-20 L28,10 Z" fill="#2aff6a" />
      <path d="M48,-20 L66,10 L84,-20 Z" fill="#ff3a3a" transform="translate(0,20)" /><rect x={40} y={-48} width={52} height={10} fill="#ff3a3a" opacity={.4} /></g>
    <Baller who="diom" x={dX} y={1600} s={1.05} t={t + 1} expr="happy" teeth pose={walk < 1 ? runPose(t * 8) : { armR: [1.25, .35], armL: [-.2, .2] }} eye={[.8, 0]} headTilt={5} />
    <Baller who="vini" x={720} y={1600} s={1.05} t={t + 5} expr="smug" mouth={m} pose={{ armL: [-1.45 - pat * (t > .5 ? 1 : 0), .3], armR: [.2, -.2] }} eye={[-.8, 0]} headTilt={-4} />
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
  const ph = t * 9.5, vx = lerp(220, 470, k), P = runPose(ph), ballX = vx + 110 + Math.sin(ph) * 12, ballY = 1640 - Math.abs(Math.sin(ph)) * 24;
  const recv = clamp(t / .3), b = t < .3 ? [lerp(-60, ballX, recv), lerp(1500, ballY, recv)] : [ballX, ballY];
  return (<Cam z={1.0} fy={1200} dy={-40}>
    <GoalEnd t={t + 6} base={base} H={H} cx={cx} />
    <GoalFront cx={cx} base={base} H={H}><Baller who="opp2" outfit="gk" x={cx + Math.sin(t * 4) * 20} y={base - 4} s={ks} t={t} pose={{ armL: [-.9, .3], armR: [.9, -.3], legL: [-.3, .2], legR: [.3, -.2] }} expr="determined" shadow={.2} /></GoalFront>
    <Baller who="opp" outfit="opp" x={880} y={base + 120} s={.3} t={t + 2} pose={runPose(ph + 1)} flip />
    <Baller who="mate2" outfit="kit" x={150} y={base + 160} s={.32} t={t + 4} pose={runPose(ph + 2)} />
    <Baller who="opp" outfit="opp" x={vx - 220} y={1600} s={.85} t={t + 2} expr="determined" pose={runPose(ph + 1.5)} eye={[.8, .2]} />
    <Baller who="vini" x={vx} y={1660} s={.95} t={t + 7} expr="determined" pose={P} eye={[.6, -.3]} />
    <Ball x={b[0]} y={b[1]} r={32} rot={t * 800} />
  </Cam>); };

// ───── 3b: VIP-ложа — за стеклом только Сэди, машет (взгляд в сторону скамейки) ─────
export const VipBox: React.FC<{ t: number; look?: [number, number] }> = ({ t, look = [-.8, .4] }) => (<g>
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
    <Baller who="vini" x={540} y={1600} s={1.0} t={t + 9} expr="happy" teeth={t > .35} mouth={m} hearts={h} headTilt={-8} eye={[-.6, -.6]} pose={{ armL: [-.3, .3], armR: [.3, -.3] }} />
    {t > .4 && [0, 1, 2, 3].map(i => { const u = t - .4 - i * .3; if (u < 0) return null; const x = 440 + i * 70 + Math.sin(u * 5 + i) * 20, y = 760 - u * 260;
      return <path key={i} transform={`translate(${x},${y}) scale(.9)`} d="M0,14 C-6,8 -30,-4 -30,-18 C-30,-32 -12,-36 0,-22 C12,-36 30,-32 30,-18 C30,-4 6,8 0,14 Z" fill="#ff5a8a" opacity={clamp(1 - u)} />; })}
  </Cam>); };

// ───── 3d: у пустых ворот (вратарь лежит у штанги после падения) засмотрелся на ложу — соперник подкатом отбирает мяч ─────
export const STEAL_AT = .85;
export const ShotSteal: React.FC<ShotP> = ({ t }) => {
  const H = 700, base = 1330, cx = -100, ks = H / 1.6 / KEEPER_H;
  const vx = 560, vy = 1640, s = .85, ballFoot: [number, number] = [vx + 80 * s, vy - 34 * s];
  const slide = smooth(STEAL_AT - .35, STEAL_AT, t), ox = lerp(1250, 700, slide) - (t > STEAL_AT ? (t - STEAL_AT) * 520 : 0);
  const got = t > STEAL_AT, bx = got ? ox - 70 : ballFoot[0], by = got ? vy - 30 : ballFoot[1];
  const oPose = t < STEAL_AT ? full({ legL: [-1.35, .1], legR: [-.5, .9], armL: [-1.8, .4], armR: [1.2, .3], lean: -.5 }) : runPose((t - STEAL_AT) * 10);
  const h = spr(t, .2, { damping: 8, stiffness: 200 }), sh = shake(t, STEAL_AT, 8, .3);
  return (<Cam z={1.0} fy={1250} dx={sh[0]} dy={sh[1] - 40}>
    <GoalEnd t={t + 10} base={base} H={H} cx={cx} />
    <GoalFront cx={cx} base={base} H={H}>
      <Baller who="opp2" outfit="gk" x={900} y={base - 30} s={ks} t={t} rot={-88} expr="ko" pose={{ armL: [-2.4, .3], armR: [2.6, -.2], legL: [-.2, .2], legR: [.3, -.1] }} shadow={0} />
    </GoalFront>
    {[0, 1, 2].map(i => { const a = t * 4 + i * 2.1; return <path key={i} d={`M${560 + Math.cos(a) * 60},${base - 120 + Math.sin(a) * 20} l0,-18 l5,13 l13,5 l-13,5 z`} fill="#ffe27a" />; })}
    <Baller who="vini" x={vx} y={vy} s={s} t={t + 11} expr="happy" teeth hearts={h * .8} headTilt={-16} eye={[-.7, -.9]} pose={{ armL: [-.3, .3], armR: [wave(t, 2.4, .25), .4] }} />
    {t > STEAL_AT - .4 && <Baller who="opp" outfit="opp" x={ox} y={vy + (t < STEAL_AT ? 30 : 0)} s={s} t={t + 3} expr="determined" pose={oPose} flip eye={[-.8, .3]} />}
    {t > STEAL_AT - .35 && t < STEAL_AT && <path d={`M${ox + 60},${vy + 10} l260,0 M${ox + 80},${vy - 30} l200,0`} stroke="#c8e8c8" strokeWidth={8} opacity={.6} strokeLinecap="round" />}
    <Ball x={bx} y={by} r={32 * s} rot={got ? -t * 900 : t * 60} />
    {got && t < STEAL_AT + .25 && <circle cx={ballFoot[0]} cy={ballFoot[1]} r={30 + (t - STEAL_AT) * 500} fill="none" stroke="#fff" strokeWidth={10} opacity={1 - (t - STEAL_AT) / .25} />}
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
        const shakeF = Math.sin(t * 22 + n) * 14 * up, kind = n % 3;  // 0 — два кулака, 1 — палец-указка, 2 — кулак и рупор-ладонь
        const shout = .55 + .45 * Math.abs(Math.sin(t * 10 + n));
        return (<g key={i} transform={`translate(${cx},${cy}) scale(${sc})`}>
          <path d="M-70,90 Q-74,-10 -40,-30 L40,-30 Q74,-10 70,90 Z" fill={shirts[n % 5]} />
          {[-1, 1].map(sd => { const raise = kind === 1 && sd < 0 ? 0 : up, hx = sd * (60 + 30 * raise) + (kind === 1 && sd > 0 ? 50 : 0), hy = lerp(40, -170, raise) + (raise ? shakeF * (sd > 0 ? 1 : -1) : 0);
            return <g key={sd}><path d={`M${sd * 52},-10 Q${sd * 90},${(hy - 10) / 2} ${hx},${hy}`} stroke={sk} strokeWidth={22} fill="none" strokeLinecap="round" />
              {kind === 1 && sd > 0 ? <g><circle cx={hx} cy={hy} r={16} fill={sk} /><path d={`M${hx},${hy} l40,-26`} stroke={sk} strokeWidth={10} strokeLinecap="round" /></g> : <circle cx={hx} cy={hy} r={19} fill={sk} />}</g>; })}
          <circle cx={0} cy={-100} r={50} fill={sk} />
          <ellipse cx={-17} cy={-104} rx={8} ry={7} fill="#fff" /><ellipse cx={17} cy={-104} rx={8} ry={7} fill="#fff" /><circle cx={-15} cy={-103} r={4} fill="#1a0f0a" /><circle cx={15} cy={-103} r={4} fill="#1a0f0a" />
          <path d="M-32,-126 L-6,-114 M32,-126 L6,-114" stroke="#2a1a1a" strokeWidth={6} strokeLinecap="round" />
          <path d={`M-16,${-82} L16,${-82} L12,${-82 + 22 * shout} L-12,${-82 + 22 * shout} Z`} fill="#5a1d24" /><rect x={-13} y={-82} width={26} height={5} fill="#fff" />
          {n % 4 === 0 && <path d="M60,-120 l14,-6 M62,-104 l16,0 M60,-88 l14,6" stroke="#ff6a6a" strokeWidth={4} strokeLinecap="round" opacity={up} />}
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
  const P = hair ? full({ armL: [-2.3, -1.3 + Math.sin(t * 12) * .25], armR: [-.35, -.3] }) : blendPose(full({ armL: [-.2, .2], armR: [-.35, -.3] }), full({ armL: [-.2, .2], armR: [.9, -1.6] }), k);
  return (<Cam z={1.25} fy={1100} dy={-40}>
    <Corridor t={t} />
    <Baller who="vini" x={540} y={1640} s={1.05} t={t + 14} expr={hair ? 'cool' : 'smug'} teeth={!hair} hold={t > swap ? 'flowers' : null} pose={P} eye={[.3, 0]} headTilt={hair ? -6 : 0} />
    {t > swap && t < swap + .5 && [0, 1, 2, 3, 4].map(i => { const a = i * 1.26, r = 60 + (t - swap) * 400; return <path key={i} d={`M${700 + Math.cos(a) * r},${1050 + Math.sin(a) * r} l0,-24 l6,18 l18,6 l-18,6 z`} fill="#ffe27a" opacity={1 - (t - swap) / .5} />; })}
  </Cam>); };

// ───── 4b: дверь VIP открывается ─────
export const ShotDoor: React.FC<ShotP> = ({ t }) => {
  const k = smooth(.2, .8, t);
  return (<Cam z={1.15} fy={1000}>
    <rect width={1080} height={1920} fill="#3a2e2a" />
    <rect x={240} y={300} width={600} height={1300} fill="#fff1d8" /><Glow x={540} y={900} r={700} c="#ffe0b0" o={k} id="doorLight" />
    <g transform={`translate(240,0) scale(${1 - k * .85},1)`}><rect x={0} y={300} width={600} height={1300} fill="#5a3422" />
      <rect x={60} y={380} width={480} height={500} rx={10} fill="none" stroke="#4a2a1a" strokeWidth={14} /><rect x={60} y={960} width={480} height={560} rx={10} fill="none" stroke="#4a2a1a" strokeWidth={14} />
      <rect x={200} y={220 + 200} width={200} height={70} rx={10} fill="#c8a24a" /><text x={300} y={470} fontSize={44} fontWeight={900} fill="#3a2414" textAnchor="middle" fontFamily="Mont">VIP</text>
      <circle cx={530} cy={960} r={22} fill="#e8c46a" /></g>
    <rect x={220} y={280} width={640} height={1340} fill="none" stroke="#2a1e18" strokeWidth={40} />
  </Cam>); };
