// Планы 7–10: видео в трендах → рывок; погоня (автобус), танцы теней, фонтан.
import React from 'react';
import { clamp, ease, lerp, shakeMany, spr } from '../anim';
import { Figure, PK, POSES, walkPose, Pose } from '../chars/body';
import { LK, CS } from '../chars/cast';
import { cam, SpeedLines, DashLines } from '../kit/fx';
import { FONT, Phone } from '../kit/ui';
import { DayStreet, Roof } from './bg';
import { Narr, Particles, Senya, Shade, SH, SunHud } from './kit';
import { Frame, ShotP } from './ShotsA';

const dance = (t: number, ph = 0): Pose => { const k = ((t + ph) * 1.6) % 4; const P: Pose[] = [
  { ...POSES.raiseR, crouch: 20, legL: [-18, 10], legR: [10, 0] }, { ...POSES.bothUp, crouch: 0, legL: [-6, 0], legR: [20, 30] },
  { ...POSES.raiseL, crouch: 30, legL: [-24, 30], legR: [16, 0], lean: -6 }, { ...POSES.pointR, crouch: 10, lean: 8, legL: [-10, 0], legR: [26, 10] }];
  return PK(k % 1, [[0, P[Math.floor(k) % 4]], [.45, P[(Math.floor(k) + 1) % 4]]]); };

// 7. Видео в трендах → лицо → рывок
export const S7: React.FC<ShotP> = ({ t }) => {
  if (t < 2.7) {
    const views = (1.2 + t * .9).toFixed(1).replace('.', ',');
    return <Frame t={t} vign={.6}>
      <rect width={1080} height={1920} fill="#3a3040" />
      <circle cx={540} cy={900} r={700} fill="#7ab8ff" opacity={.12} filter="url(#soft50)" />
      <Phone x={540 + Math.sin(t * 2) * 6} y={1080} s={1.32 + t * .03} rot={-2}>
        <svg x={0} y={0} width={440} height={880} viewBox="0 0 1080 2160" preserveAspectRatio="xMidYMid slice">
          <g transform="translate(0 120)"><Roof t={t} sun={-.2} /></g>
          <Shade t={t} x={540} y={1400} s={.9} pose={dance(t)} eyes={1} mood="happy" />
          <rect width={1080} height={2160} fill="#000" opacity={.08} />
        </svg>
        <rect x={20} y={56} width={186} height={44} rx={22} fill="#ff2a5a" /><text x={113} y={86} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={22} fill="#fff">В ТРЕНДАХ</text>
        <text x={24} y={760} fontFamily={FONT} fontWeight={800} fontSize={25} fill="#fff" stroke="#000" strokeWidth={4} paintOrder="stroke">тень танцует сама по себе</text>
        <text x={24} y={796} fontFamily={FONT} fontWeight={600} fontSize={21} fill="#fff" stroke="#000" strokeWidth={4} paintOrder="stroke">крыша ТЦ «Ласточка» · {views} млн</text>
        <g transform={`translate(400 520) scale(${1 + spr(t, 1.3) * .3 - spr(t, 1.6) * .3})`}><path d="M0 12 C-30 -14 -22 -34 0 -20 C22 -34 30 -14 0 12Z" fill="#ff2a5a" stroke="#fff" strokeWidth={3} /></g>
      </Phone>
      <Narr t={t} t0={.3} t1={2.7} text="Через час её нашёл интернет." y={280} size={66} n={20} accent={['интернет']} />
    </Frame>;
  }
  const tt = t - 2.7; const run = ease(tt, .9, 1.4);
  return <Frame t={t} sat={.85}>
    <g transform={cam(lerp(2.0, 2.1, ease(tt, 0, 1)), 540 + run * 200, 980, -run * 600, 0)}>
      <DayStreet t={t} />
      <Senya t={t} x={540} y={1700} s={1} pose={PK(tt, [[0, 'phone'], [.5, 'phone'], [.85, { ...POSES.tense, head: -4 }], [1.3, walkPose(60, true)]])} expr="determined" lookX={.6} turn={.3} phone={tt < .7 ? 1 : 0} fade={.12} sat={.85} />
    </g>
    {tt > .9 && <SpeedLines t={t} cx={540} cy={900} k={clamp((tt - .9) * 3)} />}
    <Narr t={t} t0={2.85} t1={4.8} text="Нашёл." y={1300} size={110} who="СЕНЯ" />
  </Frame>;
};

// автобус (бок), едет вправо
const Bus: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => <g transform={`translate(${x} ${y})`}>
  <rect x={-330} y={-330} width={660} height={300} rx={34} fill="#f0a020" stroke="#2a1a0a" strokeWidth={6} />
  <rect x={-330} y={-120} width={660} height={40} fill="#d07a10" />
  {[0, 1, 2, 3, 4].map(i => <rect key={i} x={-300 + i * 120} y={-300} width={100} height={110} rx={10} fill="#bfe4ff" stroke="#2a1a0a" strokeWidth={4} />)}
  {[-200, 200].map((wx, i) => <g key={i} transform={`translate(${wx} -30) rotate(${t * 720})`}><circle r={56} fill="#1a1a1e" /><circle r={24} fill="#8a8a90" /><rect x={-4} y={-22} width={8} height={44} fill="#3a3a40" /></g>)}
  <text x={0} y={-140} textAnchor="middle" fontFamily="Russo" fontSize={40} fill="#2a1a0a">№ 47</text>
</g>;

// 8. Погоня: тень катается на тени автобуса, Сеня перепрыгивает ограждение
export const S8: React.FC<ShotP> = ({ t, T0 }) => {
  const camX = t * 260; const busX = 300 + t * 420; const hx = 180 + t * 300; const jump = t > 3.2 && t < 3.85 ? Math.sin((t - 3.2) / .65 * Math.PI) * 170 : 0;
  const [sx, sy] = shakeMany(t, [[3.85, 7, .3]]);
  const hp = t > 3.2 && t < 3.85 ? { ...walkPose(0, true), legL: [-40, 90] as [number, number], legR: [40, 90] as [number, number], armL: [-130, 20] as [number, number], armR: [130, -20] as [number, number], crouch: 40 } : walkPose(hx / .8, true);
  return <Frame t={t} sat={.8}>
    <g transform={cam(1.16, 540, 1000, sx, sy, -6)}>
      <g transform={`translate(${-camX} 0)`}>
        <g transform={`translate(${camX} 0)`}><DayStreet t={t} x={camX} /></g>
        {/* тень автобуса на дороге (солнце справа сверху → тень влево-вниз) */}
        <path d={`M${busX - 330} 1330 L${busX + 330} 1330 L${busX + 120} 1640 L${busX - 540} 1640Z`} fill={SH} opacity={.55} />
        {/* тень Сени катается на тени автобуса */}
        <Shade t={t} x={busX - 160} y={1440} s={.62} pose={{ ...POSES.bothUp, armL: [-100, 10], armR: [100, -10], legL: [-24, 10], legR: [24, -10], crouch: 30, lean: -8, head: 0 } as Pose} c={-.45} d={-.42} eyes={1} mood="happy" look={-1} />
        <Bus x={busX} y={1330} t={t} />
        {/* ограждение */}
        <g transform="translate(1300 1760)"><rect x={-160} y={-120} width={320} height={22} fill="#d8d8e0" stroke="#3a3a44" strokeWidth={4} /><rect x={-150} y={-120} width={16} height={120} fill="#3a3a44" /><rect x={134} y={-120} width={16} height={120} fill="#3a3a44" /></g>
        <Senya t={t} x={hx} y={1780 - jump} s={.8} pose={hp} expr="determined" mouth={.4} turn={.4} fade={.18} sat={.8} />
        <Particles t={t} t0={3.85} x={180 + 3.85 * 300} y={1780} n={10} color="#c8c0b8" sp={240} size={12} />
      </g>
    </g>
    <DashLines t={t} ang={-6} k={.35} />
    <Narr t={t} t0={.3} t1={4.9} text="Она каталась на чужих автобусах…" y={430} size={70} n={18} accent={['автобусах']} />
  </Frame>;
};

// фон площади (день, без дороги)
const Plaza: React.FC<{ t: number }> = ({ t }) => <g>
  <DayStreet t={t} sky="#8ad0ff" sky2="#ffd8a8" />
  <rect x={-50} y={1060} width={1180} height={860} fill="#d8b890" />
  {Array.from({ length: 12 }).map((_, i) => <path key={i} d={`M${i * 110 - 100} 1060 L${i * 200 - 600} 1920`} stroke="#b8946a" strokeWidth={3} />)}
  {[1200, 1400, 1650].map((y, i) => <path key={i} d={`M-50 ${y} H1130`} stroke="#b8946a" strokeWidth={3} />)}
</g>;

// 9. Танцы: тени уличных танцоров + тень Сени без хозяина; Сеня врывается в круг
export const S9: React.FC<ShotP> = ({ t }) => {
  const enter = ease(t, 1.2, 2.2); const sx0 = lerp(-150, 300, enter);
  const sPose = t < 2.2 ? walkPose(sx0 / .8, true) : t < 2.6 ? POSES.stand : dance(t, .3);
  const dancers = [{ x: 620, L: LK.pE, C: CS.nastya, ph: 0 }, { x: 860, L: LK.timur, C: CS.timur, ph: .2 }, { x: 980, L: LK.pD, C: CS.jacket2, ph: .5 }];
  const crowd = Array.from({ length: 7 }).map((_, i) => ({ x: 60 + i * 160, s: .42 }));
  return <Frame t={t} sat={.75}>
    <g transform={cam(1 + ease(t, 0, 5) * .06, 560, 1100)}>
      <Plaza t={t} />
      {/* зрители сзади, хлопают */}
      {crowd.map((c, i) => <Figure key={i} x={c.x} y={1150} s={c.s} t={t} L={[LK.pA, LK.pB, LK.pC, LK.liza, LK.pE, LK.coll1, LK.timur][i]} C={[CS.pA, CS.pB, CS.pC, CS.liza, CS.pE, CS.r2, CS.timur][i]} pose={Math.floor(t * 4 + i) % 2 ? { ...POSES.stand, armL: [-30, 120], armR: [30, -120] } : { ...POSES.stand, armL: [-20, 140], armR: [20, -140] }} expr="smirk" mouth={.3} seed={i + 5} />)}
      {/* тени танцоров на земле (солнце сзади → тени к зрителю) */}
      {dancers.map((d, i) => <Shade key={i} t={t} x={d.x} y={1560} s={.7} pose={dance(t, d.ph)} c={-.18} d={-.5} opacity={.6} soft />)}
      {/* тень Сени — без хозяина, танцует лучше всех */}
      <Shade t={t} x={420} y={1560} s={.7} pose={dance(t * 1.15, .7)} c={-.18} d={-.5} eyes={1} mood="happy" opacity={.92} />
      {dancers.map((d, i) => <Figure key={i} x={d.x} y={1560} s={.7} t={t} L={d.L} C={d.C} pose={dance(t, d.ph)} expr="smirk" mouth={.2} seed={i + 2} noContact />)}
      <Senya t={t} x={sx0} y={1600} s={.72} pose={sPose} expr={t < 2.6 ? 'determined' : 'smirk'} mouth={t > 2.6 ? .5 : .3} fade={.25} sat={.75} />
    </g>
    <Narr t={t} t0={.3} t1={4.9} text="…танцевала с чужими тенями…" y={420} size={70} n={18} accent={['тенями']} />
  </Frame>;
};

// 10. Фонтан: Сеня бежит прямо через струи, смеётся; руки уже прозрачные
export const S10: React.FC<ShotP> = ({ t, T0 }) => {
  const hx0 = -120 + t * 290; const S = .85;
  const jets = [300, 540, 780];
  return <Frame t={t} sat={.6}>
    <g transform={cam(1.05, 540 + t * 20, 1080)}>
      <Plaza t={t} />
      {/* чаша фонтана */}
      <ellipse cx={540} cy={1520} rx={520} ry={120} fill="#7aa8c8" stroke="#a8a0a0" strokeWidth={20} />
      <ellipse cx={540} cy={1520} rx={480} ry={96} fill="#9ad0ef" />
      {jets.map((jx, i) => <g key={i}>
        {Array.from({ length: 4 }).map((_, k) => <path key={k} d={`M${jx} 1510 Q${jx + (k - 1.5) * 60} ${960 + Math.sin(t * 6 + k + i) * 20} ${jx + (k - 1.5) * 130} 1500`} stroke="#e8f8ff" strokeWidth={10} fill="none" opacity={.75} />)}
        {Array.from({ length: 10 }).map((_, k) => { const ph = (t * 1.4 + k / 10 + i * .3) % 1; return <circle key={k} cx={jx + (k - 5) * 22 * ph} cy={1000 + ph * 500 - Math.sin(ph * Math.PI) * 120} r={6} fill="#fff" opacity={.7 * (1 - ph)} />; })}
      </g>)}
      {/* тень Сени убегает вперёд */}
      <Shade t={t} x={hx0 + 520} y={1660} s={.55} pose={walkPose((hx0 + 520) / .62, true)} c={-.2} d={-.42} eyes={1} mood="happy" look={1} opacity={.9} />
      <Senya t={t} x={hx0} y={1640} s={S} pose={walkPose(hx0 / S, true)} expr="smirk" mouth={.85} turn={.3} fade={.32} sat={.6} />
      <Particles t={t} t0={1.4} x={300} y={1500} n={18} color="#e8f8ff" sp={420} size={11} life={.8} />
      <Particles t={t} t0={2.2} x={540} y={1500} n={18} color="#e8f8ff" sp={420} size={11} life={.8} />
      <Particles t={t} t0={3.0} x={780} y={1500} n={18} color="#e8f8ff" sp={420} size={11} life={.8} />
    </g>
    <SunHud t={t} T={T0 + t} t0={0} y={300} />
    <Narr t={t} t0={.4} t1={4.9} text="…а я впервые за год бежал." y={460} size={70} n={18} accent={['бежал']} />
  </Frame>;
};
export { lerp, spr };
