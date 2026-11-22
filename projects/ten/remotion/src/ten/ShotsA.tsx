// Планы 1–6: хук (тень отлипает), тень встаёт на стену, кухня, письмо, петля «дом-работа», P.S. и рука.
import React from 'react';
import { clamp, ease, lerp, shakeMany, spr } from '../anim';
import { PK, POSES, walkPose, blend, Pose } from '../chars/body';
import { Defs, Grain, Vignette, cam, Flash, SpeedLines } from '../kit/fx';
import { FONT } from '../kit/ui';
import { NightStreet, Kitchen, Hall } from './bg';
import { BigHand, Cat, Drips, Narr, Particles, Senya, Shade, SH, SootText, Stamp, SunHud, TenDefs, castCK, Eyes } from './kit';

export type ShotP = { t: number; d: number; T0: number };
export const Frame: React.FC<{ t: number; sat?: number; children: React.ReactNode; vign?: number; grain?: number }> = ({ t, sat, children, vign = .55, grain = .05 }) =>
  <svg width={1080} height={1920} viewBox="0 0 1080 1920"><Defs /><TenDefs sat={sat} />{children}<Vignette k={vign} /><Grain t={t} k={grain} /></svg>;

// шаг + телефон в правой руке
const walkPhone = (dist: number, run = false): Pose => { const w = walkPose(dist, run); return { ...w, armR: POSES.phone.armR, head: 12 }; };
const PhoneProp: React.FC<{ pose: Pose; glow?: number }> = ({ pose, glow = 1 }) => { // экран телефона в правой кисти (в системе торса — грубо)
  return null;
};
void PhoneProp;

// 1. ХУК: ночь, фонарь; тень отлипает от пяток
export const S1: React.FC<ShotP> = ({ t }) => {
  const LX = 210, GY = 1240, FY = 1520, S = .74, TP = .5, SNAP = 1.05;
  const hx = (tt: number) => 330 + tt * 230;
  const x = hx(t), dist = (x - 330) / S;
  const pose = walkPhone(dist);
  const px = hx(Math.min(t, TP)), pPose = walkPhone((px - 330) / S);
  const ck = castCK(px, LX, .62);
  const snapK = t < SNAP ? 0 : 1; const recoil = t > SNAP ? Math.exp(-(t - SNAP) * 6) * Math.sin((t - SNAP) * 30) : 0;
  const zoom = 1 + ease(t, SNAP, SNAP + .18) * .22 - ease(t, 2.2, 3.0) * .1;
  const [sx, sy] = shakeMany(t, [[SNAP, 10, .35]]);
  // «жвачка» от пяток героя к пяткам тени
  const band = t > TP && t < SNAP ? clamp((t - TP) / (SNAP - TP)) : 0;
  const fx = t < TP ? x : px;
  return <Frame t={t}>
    <g transform={cam(zoom, lerp(560, px + 120, ease(t, SNAP, SNAP + .2)), lerp(1250, 1500, ease(t, SNAP, SNAP + .2)), sx, sy)}>
      <NightStreet t={t} lampX={LX} groundY={GY} />
      {/* тень на асфальте */}
      <Shade t={t} x={fx} y={FY} s={S} pose={t < TP ? pose : pPose} c={ck.c * (1 + recoil * .15)} d={ck.d * (1 - recoil * .12)} eyes={ease(t, 1.7, 1.9)} mood={t > 2.4 ? 'happy' : 'sly'} look={1} opacity={.92} />
      {band > 0 && <path d={`M${px} ${FY + 4} Q${(px + x) / 2} ${FY + 18 + band * 10} ${x} ${FY + 2}`} stroke={SH} strokeWidth={lerp(26, 3, band)} fill="none" strokeLinecap="round" opacity={.9} />}
      <Particles t={t} t0={SNAP} x={(px + hx(SNAP)) / 2} y={FY} n={16} color={SH} sp={300} size={10} />
      <Senya t={t} x={x} y={FY} s={S} pose={pose} turn={.55} lookY={.7} lookX={.3} expr="calm" phone={1} />
      {/* свет экрана на лице */}
      <circle cx={x + 30} cy={FY - 620 * S} r={70} fill="#9fd0ff" opacity={.25} filter="url(#soft20)" />
    </g>
    <Narr t={t} t0={.12} t1={3.2} text="В 23:47 от меня ушла тень." y={290} size={84} n={16} accent={['тень']} />
  </Frame>;
};

// 2. Тень поднимается на стену, просыпается, потягивается и уходит
export const S2: React.FC<ShotP> = ({ t }) => {
  const GY = 1240, S = 1.05; const rise = ease(t, .35, 1.25);
  const d = lerp(-.55, 1, rise), c = lerp(.42, 0, rise);
  const walkT = Math.max(0, t - 2.9), x = 560 - walkT * 330;
  const pose = t < 2.9 ? PK(t, [[1.3, 'stand'], [1.9, 'stand'], [2.15, 'bothUp'], [2.6, 'bothUp'], [2.85, 'stand']]) : walkPose(walkT * 330 / S);
  return <Frame t={t}>
    <g transform={cam(1.08 - ease(t, 0, 4) * .06, 540, 1000)}>
      <NightStreet t={t} lampX={-200} groundY={GY} />
      <Shade t={t} x={x} y={GY} s={S} pose={pose} c={c} d={d} eyes={ease(t, 1.35, 1.55)} mood={t < 2.0 ? 'calm' : t < 2.9 ? 'happy' : 'sly'} look={t < 1.9 ? lerp(0, 1, ease(t, 1.5, 1.8)) : -1} stretch={1 + (t > 2.15 && t < 2.6 ? .05 : 0)} />
    </g>
    <Narr t={t} t0={2.4} t1={4.0} text="Я заметил только утром." y={1480} size={74} />
  </Frame>;
};

// 3. Кухня: у кота и чайника есть тень, у Сени — нет. Кот шипит.
export const S3: React.FC<ShotP> = ({ t }) => {
  const hiss = ease(t, 1.15, 1.35) * (1 - ease(t, 4.6, 5));
  const push = ease(t, 2.85, 3.1, (k: number) => k);
  const z = lerp(1, 1.85, push), fx = lerp(540, 470, push), fy = lerp(1000, 1015, push);
  const [sx, sy] = shakeMany(t, [[1.2, 6, .4], [2.9, 10, .3]]);
  const look = t > 1.6;
  const tick = (x: number, y: number, t0: number, ok: boolean) => { const k = spr(t, t0); if (k <= 0) return null;
    return <g transform={`translate(${x} ${y}) scale(${k})`}><circle r={44} fill={ok ? '#3ac06a' : '#ff4a4a'} stroke="#fff" strokeWidth={6} />
      <path d={ok ? 'M-20 0 l14 16 l26 -30' : 'M-16 -16 l32 32 M16 -16 l-32 32'} stroke="#fff" strokeWidth={10} fill="none" strokeLinecap="round" /></g>; };
  return <Frame t={t}>
    <g transform={cam(z, fx, fy, sx, sy)}>
      <Kitchen t={t} />
      {/* солнечное пятно под Сеней — и в нём нет тени */}
      <ellipse cx={500} cy={1650} rx={260} ry={60} fill="#fff4c8" opacity={.45} />
      {/* тень кота вправо */}
      <g transform="translate(860 1660) matrix(1 0 -.9 -.32 0 0)" opacity={.45} filter="url(#silhSoft)"><Cat t={t} x={0} y={0} s={.75} hiss={hiss} /></g>
      <Cat t={t} x={860} y={1660} s={.75} hiss={hiss} look={-1} />
      <Senya t={t} x={480} y={1650} s={1.02} pose={PK(t, [[0, 'phone'], [1.5, 'phone'], [1.8, { ...POSES.phone, head: 18, armL: [-30, 40] }], [3.0, { armL: [-25, 155], armR: [25, -155], head: 16 } as Pose]])}
        expr={t < 1.25 ? 'calm' : t < 2.0 ? 'scared' : 'scared'} lookX={t < 1.25 ? 0 : t < 1.6 ? .8 : 0} lookY={look ? .9 : .4} mouth={t > 3 ? .5 : 0} sweat={t > 3 ? 1 : 0} phone={t < 3 ? 1 : 0} />
      {tick(1000, 1560, .55, true)}{tick(860, 800, 1.0, true)}{tick(330, 1700, 2.95, false)}
    </g>
    <Narr t={t} t0={.25} t1={2.75} text="У кота есть. У чайника есть." y={1290} size={74} n={14} accent={['кота', 'чайника']} />
    <Narr t={t} t0={2.95} t1={5.2} text="У меня — нет." y={1290} size={104} accent={['нет']} />
  </Frame>;
};

// 4. Письмо на стене: УВОЛЬНЯЮСЬ
export const S4: React.FC<ShotP> = ({ t }) => {
  const z = 1 + ease(t, 0, 6, (k: number) => k) * .08;
  return <Frame t={t}>
    <g transform={cam(z, 500, 900)}>
      <Hall t={t} />
      <SootText t={t} t0={.25} lines={['УВОЛЬНЯЮСЬ.']} x={500} y={470} size={118} cps={18} rot={-4} />
      <Drips t={t} t0={.9} x={500} y={490} w={600} n={7} />
      <SootText t={t} t0={1.2} lines={['26 ЛЕТ ХОЖУ', 'ЗА ТОБОЙ,', 'А ТЫ НИКУДА', 'НЕ ХОДИШЬ.']} x={480} y={690} size={88} cps={20} rot={-2} />
      {/* подпись: отпечаток ладони тени */}
      <g opacity={ease(t, 3.8, 4.0)} transform="translate(640 1110) rotate(-10) scale(.42)"><BigHand t={t} x={0} y={0} shadow /></g>
      <SootText t={t} t0={4.1} lines={['— ТЕНЬ']} x={380} y={1120} size={70} cps={10} rot={-6} />
      <Senya t={t} x={860} y={1960} s={.95} pose={PK(t, [[0, { armL: [-12, 30], armR: [12, -30], head: -10 } as Pose], [1.4, { armL: [-12, 30], armR: [12, -30], head: -10 } as Pose], [2.2, { armL: [-25, 155], armR: [25, -155], head: -14 } as Pose]])}
        expr={t < 2.5 ? 'scared' : 'sad'} lookX={-.9} lookY={-.7} turn={-.5} mouth={t > 4.2 ? .4 : .15} />
    </g>
  </Frame>;
};

// 5. Инфографика: дом → работа → дом, 9 490 раз. Штамп «СКУКА».
export const S5: React.FC<ShotP> = ({ t }) => {
  const sp = t < 2.5 ? Math.pow(t / 2.5, 2.2) * 2.5 : 2.5 + (t - 2.5) * .05; const laps = sp * 7; const cnt = Math.round(clamp(t / 2.5) ** 2.2 * 9490);
  const a = laps * Math.PI * 2, px = 540 + Math.cos(a) * 330, py = 1000 + Math.sin(a) * 200;
  const Icon = ({ x, y, kind, k }: { x: number; y: number; kind: 'home' | 'work'; k: number }) => <g transform={`translate(${x} ${y}) scale(${k})`}>
    <circle r={110} fill="#1a2040" stroke="#5a6aa8" strokeWidth={6} />
    {kind === 'home' ? <g><path d="M-55 0 L0 -50 L55 0 V50 H-55Z" fill="#ffcf6a" stroke="#0a0b14" strokeWidth={6} /><rect x={-14} y={14} width={28} height={36} fill="#0a0b14" /></g>
      : <g><rect x={-45} y={-60} width={90} height={110} fill="#8ac0ff" stroke="#0a0b14" strokeWidth={6} />{[0, 1, 2].map(r => [0, 1].map(c => <rect key={r + '' + c} x={-30 + c * 36} y={-46 + r * 32} width={24} height={20} fill="#0a0b14" />))}</g>}
  </g>;
  return <Frame t={t} vign={.7}>
    <rect width={1080} height={1920} fill="#0c1024" />
    {Array.from({ length: 12 }).map((_, i) => <path key={i} d={`M${i * 100} 0 V1920`} stroke="#1a2244" strokeWidth={2} />)}
    {Array.from({ length: 20 }).map((_, i) => <path key={i} d={`M0 ${i * 100} H1080`} stroke="#1a2244" strokeWidth={2} />)}
    <text x={540} y={520} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={84} fill="#fff" opacity={ease(t, 0, .3)}>ДОМ → РАБОТА → ДОМ</text>
    <ellipse cx={540} cy={1000} rx={330} ry={200} fill="none" stroke="#ffcf6a" strokeWidth={10} strokeDasharray="26 22" strokeDashoffset={-t * 300} opacity={.85} />
    <Icon x={210} y={1000} kind="home" k={spr(t, .05)} /><Icon x={870} y={1000} kind="work" k={spr(t, .2)} />
    {/* Сеня-точка бежит по кругу */}
    {Array.from({ length: 6 }).map((_, i) => { const aa = a - i * .12; return <circle key={i} cx={540 + Math.cos(aa) * 330} cy={1000 + Math.sin(aa) * 200} r={26 - i * 3} fill="#9fb4ff" opacity={1 - i * .16} />; })}
    <circle cx={px} cy={py} r={30} fill="#fff" stroke="#0a0b14" strokeWidth={5} />
    <text x={540} y={1380} textAnchor="middle" fontFamily="JBM" fontWeight={800} fontSize={150} fill="#fff">{cnt.toLocaleString('ru-RU').replace(/ |,/g, ' ')}</text>
    <text x={540} y={1460} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={54} fill="#9fb4ff" letterSpacing={8}>РАЗ ПОДРЯД</text>
    <Stamp t={t} t0={2.65} text="СКУКА" x={540} y={1010} size={170} />
    <Flash t={t} t0={2.65} dur={.2} max={.4} />
  </Frame>;
};

// 6. P.S. мелкими буквами → рука просвечивает → таймер заката
export const S6: React.FC<ShotP> = ({ t, T0 }) => {
  if (t < 2.3) {
    const z = lerp(1.1, 1.22, ease(t, 0, 2.3)), fy = lerp(1000, 1300, ease(t, 0, .6));
    return <Frame t={t}>
      <g transform={cam(z, 520, fy)}>
        <Hall t={t} />
        <SootText t={t} t0={-5} lines={['— ТЕНЬ']} x={380} y={1120} size={70} cps={10} rot={-6} />
        <SootText t={t} t0={.2} lines={['P.S. БЕЗ ТЕНИ ТЫ', 'ПРОДЕРЖИШЬСЯ ДО ЗАКАТА.', 'ПОТОМ СТАНЕШЬ КАК Я.']} x={520} y={1230} size={46} cps={26} rot={-3} />
        <g transform="translate(800 1420) scale(.5)" opacity={ease(t, 1.7, 1.9)}><circle r={60} fill={SH} /><Eyes t={t} x={0} y={-22} mood="sly" /></g>
      </g>
    </Frame>;
  }
  const tt = t - 2.3; const fade = ease(tt, .2, 2.2) * .55;
  return <Frame t={t} vign={.75}>
    <rect width={1080} height={1920} fill="#efe6d6" /><rect width={1080} height={1920} fill="#2a2030" opacity={.45} />
    <BigHand t={t} x={540 + Math.sin(t * 3) * 6} y={1300} s={1.75} rot={-6} fade={fade} />
    <SunHud t={tt} T={T0 + t} t0={.5} y={380} />
    <Narr t={t} t0={2.5} t1={5.0} text="Пальцы уже просвечивают." y={1560} size={70} accent={['просвечивают']} />
  </Frame>;
};
export { blend, SpeedLines, Flash };
