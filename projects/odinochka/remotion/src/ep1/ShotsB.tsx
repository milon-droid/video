// B. Не хотел: Врата над Москвой → ранги → курьер → коллекторы → кухня → звонок → Настя → станция метро
import React from 'react';
import { clamp, ease, noise, spr } from '../anim';
import { cam, Flash, Fog, h1, isImpact, Motes, Rain, Smoke, SpeedLines, shakeXY } from '../kit/fx';
import { Phone, RankLadder, FONT } from '../kit/ui';
import { Gate, KremlinTower, KremlinWall, MoscowCity, Panelka, Sky, Vysotka } from '../bg/moscow';
import { Kitchen, MetroStation, MetroStreet, Stairwell } from '../bg/places';
import { Figure, PK, POSES, walkPose } from '../chars/body';
import { Head } from '../chars/head';
import { CS, LK } from '../chars/cast';
import { Frame, SP, talk } from './common';
import { SHOTS } from './timeline';
const caps = (id: string) => SHOTS.find(s => s.id === id)?.caps;

// 05: днём над Москва-Сити — Врата, билборд героя ранга S; камера опускается от Врат к городу
export const S05: React.FC<SP> = ({ t }) => {
  const dy = -ease(t, 0, 4) * 260;
  return <Frame t={t} grade="#6a7ab0" gradeK={.12}>
    <g transform={cam(1.0, 540, 960, 0, 230 + dy)}>
      <Sky top="#3a5a9a" bot="#d8c8c0" id="s05" />
      <Gate x={600} y={330} s={1.25} t={t} rot={-8} />
      <Smoke t={t} x={600} y={500} n={8} r={160} spread={300} color="#9ab8e8" life={4} rise={-40} k={.4} seed={3} />
      <MoscowCity x={720} y={1350} s={.62} t={t} night={false} />
      <Vysotka x={180} y={1380} s={.55} c="#8a8ca0" cs="#6a6c84" lit={.05} seed={2} />
      <Fog t={t} y={1320} k={.4} color="#e0d8e8" />
      <Panelka x={-30} y={1700} w={420} floors={8} c="#b8b0a8" lit={.05} seed={4} />
      {/* билборд героя ранга S на панельке */}
      <g transform="translate(560 840)"><rect x={0} y={0} width={500} height={300} fill="#101830" stroke="#d8c060" strokeWidth={8} />
        <g transform="translate(100 190) scale(1.15)"><Head t={t} L={LK.r2} expr="smirk" seed={9} /></g>
        <text x={330} y={100} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={110} fill="#ffcf4a">S</text>
        <text x={330} y={170} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill="#fff">ГЕРОЙ МОСКВЫ</text>
        <text x={330} y={215} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={24} fill="#9fb4d8">ГИЛЬДИЯ «КАБАЛА»</text></g>
      <Panelka x={560} y={1760} w={540} floors={6} c="#a8a098" lit={.05} seed={7} />
      <rect y={1760} width={1080} height={300} fill="#5a5258" />
    </g>
  </Frame>;
};

// 06: лестница рангов
export const S06: React.FC<SP> = ({ t }) => (
  <Frame t={t}>
    <rect width={1080} height={1920} fill="#060a18" />
    <Motes t={t} x={540} y={1900} w={1100} h={1900} n={40} color="#3a6aaa" speed={40} k={.6} />
    <g transform={cam(1 + t * .02, 540, 600, 0, -360)}><RankLadder t={t} t0={.1} /></g>
    {t > 1.2 && <g transform={`translate(150 ${896}) scale(${.8 * spr(t, 1.2)})`}><circle r={74} fill="#3a0710" stroke="#ff3b4f" strokeWidth={4} /><g transform="translate(0 12) scale(.8)"><Head t={t} L={LK.kWeak} expr="sad" seed={3} /></g></g>}
  </Frame>
);

// 07: дождь у метро, Кирилл-курьер идёт с коробом
export const S07: React.FC<SP> = ({ t }) => {
  const x = 140 + t * 105, dist = t * 105 / .95;
  return <Frame t={t} grade="#2a3a7a" gradeK={.2}>
    <g transform={cam(1.08, 540, 1000, -t * 20, -60)}>
      <MetroStreet t={t} />
      <Figure x={x} y={1560} s={.95} t={t} L={LK.kWeak} C={CS.courierY} pose={walkPose(dist)} expr="sad" seed={3} turn={.35} lookX={.4} />
      <Rain t={t} k={.6} />
    </g>
  </Frame>;
};

// 08: дверной глазок — Настя смотрит через линзу: коллекторы «Кабалы» искажены «рыбьим глазом»
export const S08: React.FC<SP> = ({ t }) => {
  const c = caps('s08'); const R = 470, cy = 860, br = Math.sin(t * 2) * 4;
  const wob = noise('pp', t, .6) * 6;
  return <Frame t={t} vign={1}>
    <rect width={1080} height={1920} fill="#050506" />
    <defs><clipPath id="peep"><circle cx={540} cy={cy} r={R} /></clipPath>
      <radialGradient id="lensV"><stop offset=".55" stopColor="#000" stopOpacity="0" /><stop offset=".92" stopColor="#000" stopOpacity=".75" /><stop offset="1" stopColor="#000" stopOpacity="1" /></radialGradient></defs>
    <g clipPath="url(#peep)">
      {/* рыбий глаз: сцена сжата к краям — масштаб и выпуклость */}
      <g transform={`translate(540 ${cy}) scale(.8) translate(-540 -900) translate(${wob} 0)`}>
        <Stairwell t={t} graffiti={0} />
        <Figure x={280} y={2060} s={1.7} t={t} L={LK.coll2} C={CS.kabala} pose={POSES.tense} expr="smirk" seed={8} turn={.3} lookX={.3} />
        <Figure x={760} y={2150} s={2.1} t={t} L={LK.coll1} C={CS.kabala} pose={PK(t, [[0, 'stand'], [.6, { armR: [30, -100] }], [3.6, { armR: [30, -100] }], [4.2, 'stand']])} flip expr="angry" seed={9} turn={-.2} lookX={-.2} lookY={-.2} mouth={talk(t, c, 'КОЛЛЕКТОР')} />
      </g>
      <circle cx={540} cy={cy} r={R} fill="url(#lensV)" />
      <ellipse cx={430} cy={cy - 230} rx={130} ry={60} fill="#fff" opacity={.08} transform={`rotate(-30 430 ${cy - 230})`} />
    </g>
    <circle cx={540} cy={cy} r={R + 4} fill="none" stroke="#2a2420" strokeWidth={14} />
    <circle cx={540} cy={cy} r={R + 40} fill="none" stroke="#141010" strokeWidth={50} />
    {/* дыхание Насти — запотевание линзы */}
    <ellipse cx={540} cy={cy + 300} rx={300} ry={110} fill="#cfd8e8" opacity={.06 + .05 * Math.max(0, Math.sin(t * 2.2))} filter="url(#blur30)" />
  </Frame>;
};

// 09: дверь снаружи — надпись баллончиком «ДОЛГ. ПЯТНИЦА.» и знак цепи; Кирилл встаёт между — щелчок — в стену
const Spray: React.FC<{ t: number }> = ({ t }) => {
  // буквы баллончиком: мягкий край (размытие), напыл точками, подтёки
  const dots = []; for (let i = 0; i < 120; i++) dots.push(<circle key={i} cx={330 + h1(i * 2.1) * 420} cy={640 + h1(i * 3.3) * 360} r={1 + h1(i * 5.7) * 2.5} fill="#d01828" opacity={.5} />);
  return <g transform="translate(0 -170) rotate(-4 540 800)">
    <g filter="url(#blur4)" opacity={.9}><text x={540} y={760} textAnchor="middle" fontFamily="Mont" fontWeight={900} fontSize={150} fill="#c4141f" letterSpacing={6}>ДОЛГ.</text></g>
    <text x={540} y={760} textAnchor="middle" fontFamily="Mont" fontWeight={900} fontSize={146} fill="#e01e2c" letterSpacing={6} opacity={.85}>ДОЛГ.</text>
    <g filter="url(#blur4)" opacity={.85}><text x={540} y={930} textAnchor="middle" fontFamily="Mont" fontWeight={800} fontSize={96} fill="#c4141f" letterSpacing={4}>ПЯТНИЦА</text></g>
    <text x={540} y={930} textAnchor="middle" fontFamily="Mont" fontWeight={800} fontSize={94} fill="#e01e2c" letterSpacing={4} opacity={.85}>ПЯТНИЦА</text>
    {[[380, 770, 90], [470, 772, 140], [610, 768, 70], [700, 770, 110], [420, 940, 60], [640, 942, 95]].map(([x, y, l], i) => <path key={i} d={`M${x} ${y} v${l * Math.min(1, .7 + t * .08)}`} stroke="#c4141f" strokeWidth={6} strokeLinecap="round" opacity={.85} />)}
    {dots}
    {/* знак «Кабалы»: звено цепи */}
    <g transform="translate(540 1060)" opacity={.9}><rect x={-70} y={-26} width={90} height={52} rx={26} fill="none" stroke="#e01e2c" strokeWidth={12} /><rect x={-20} y={-26} width={90} height={52} rx={26} fill="none" stroke="#e01e2c" strokeWidth={12} /></g>
  </g>;
};
export const S09: React.FC<SP> = ({ t }) => {
  const c = caps('s09'); const hit = 1.2, imp = isImpact(t, hit);
  const fly = ease(t, hit, hit + .35), x = 640 - fly * 360, slide = ease(t, hit + .35, hit + 1.1);
  const pose = t < hit ? PK(t, [[0, 'stand'], [.5, { ...POSES.guard, crouch: 20 }]]) : t < hit + .35 ? POSES.hit : PK(t - hit - .35, [[0, 'hit'], [.6, 'fallen']], false);
  const [sx, sy] = shakeXY(t, [[hit, 22, .5], [hit + .35, 30, .6]]);
  return <Frame t={t} impact={imp} grade="#4a3a3a" gradeK={.12} over={<Flash t={t} t0={hit + .35} max={.5} />}>
    <g transform={cam(1.08 + t * .01, 540, 1000, sx, sy - 40)}>
      <Stairwell t={t} graffiti={0} />
      <Spray t={t} />
      <Figure x={x + (t < hit ? -80 * (1 - ease(t, 0, .5)) : 0)} y={1700 - slide * 80} s={1.12} t={t} L={LK.kWeakHurt} C={CS.hoodieY} pose={pose} expr={t < hit ? 'scared' : 'pain'} seed={3} rot={t > hit ? -fly * 8 : 0} turn={.3} sweat={t < hit ? 1 : 0} />
      <Smoke t={t} t0={hit + .35} x={240} y={1250} n={10} r={120} spread={160} color="#d8d0c0" life={1.6} rise={60} k={.7} seed={4} />
      <Figure x={950} y={1880} s={1.35} t={t} L={LK.coll1} C={CS.kabala} pose={PK(t, [[0, 'stand'], [.9, { armR: [-60, -60] }], [hit, { armR: [-120, -10] }], [1.9, 'stand']])} flip expr="smirk" seed={9} turn={-.4} mouth={talk(t, c, 'КОЛЛЕКТОР')} />
      {t > hit - .05 && t < hit + .25 && <SpeedLines t={t} cx={700} cy={1100} n={50} inner={300} color="#fff" k={.6} />}
    </g>
  </Frame>;
};

// 10: ночная кухня, синяк, телефон: баланс и долг
export const S10: React.FC<SP> = ({ t }) => {
  const ph = ease(t, 1.0, 1.5);
  return <Frame t={t} grade="#1a2a5a" gradeK={.2}>
    <g transform={cam(1 + t * .02, 540, 1000)}>
      <Kitchen t={t} />
      <Figure x={560} y={1760} s={1.05} t={t} L={LK.kWeakHurt} C={CS.hoodieY} pose={{ ...POSES.phone, crouch: 160 }} expr="sad" seed={3} lookY={.6} />
      <rect x={240} y={1360} width={800} height={30} fill="#7a5a3a" /><rect x={240} y={1390} width={800} height={600} fill="#3a2418" />
      <rect x={0} y={0} width={1080} height={1920} fill="#000" opacity={ph * .6} />
    </g>
    {ph > 0 && <g transform={`translate(0 ${(1 - ph) * 500})`} opacity={ph}><Phone x={540} y={760} s={1.1}>
      <text x={220} y={110} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={30} fill="#9fb4d8">МОЙ БАНК</text>
      <text x={40} y={230} fontFamily={FONT} fontWeight={600} fontSize={30} fill="#9fb4d8">Баланс</text>
      <text x={40} y={300} fontFamily={FONT} fontWeight={900} fontSize={64} fill="#fff">42 300 ₽</text>
      <rect x={30} y={360} width={380} height={2} fill="#2a3a5a" />
      <text x={40} y={440} fontFamily={FONT} fontWeight={600} fontSize={30} fill="#ff8a9a">Долг «Кабала»</text>
      <text x={40} y={520} fontFamily={FONT} fontWeight={900} fontSize={64} fill="#ff3b4f">1 840 000 ₽</text>
      <rect x={40} y={580} width={360} height={20} rx={10} fill="#2a1018" /><rect x={40} y={580} width={360 * .023} height={20} rx={10} fill="#ff3b4f" />
      <text x={40} y={650} fontFamily={FONT} fontWeight={700} fontSize={28} fill="#ff8a9a">Срок: пятница</text>
    </Phone></g>}
  </Frame>;
};

// 11: звонок Михалыча (видеозвонок)
export const S11: React.FC<SP> = ({ t }) => {
  const c = caps('s11'); const acc = t > .45; const vib = !acc ? Math.sin(t * 60) * 6 : 0;
  return <Frame t={t} grade="#1a2a5a" gradeK={.15}>
    <g transform={cam(1.0, 540, 960)}><Kitchen t={t} /><rect width={1080} height={1920} fill="#000" opacity={.65} /></g>
    <Phone x={540 + vib} y={760} s={1.15} rot={vib * .3}>
      {!acc ? <g><text x={220} y={300} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={56} fill="#fff">Михалыч</text><text x={220} y={360} textAnchor="middle" fontFamily={FONT} fontSize={30} fill="#9fb4d8">входящий видеозвонок</text>
        <circle cx={120} cy={720} r={50} fill="#ff3b4f" /><circle cx={320} cy={720} r={50 + Math.sin(t * 10) * 5} fill="#3adf7a" /></g>
        : <g><rect width={440} height={880} fill="#2a3420" /><ellipse cx={220} cy={500} rx={260} ry={300} fill="#4a5a3a" opacity={.6} />
          <g transform="translate(220 420) scale(2.1)"><Head t={t} L={LK.mikh} expr="calm" mouth={talk(t, c, 'МИХАЛЫЧ')} seed={6} turn={-.1} /></g>
          <rect x={0} y={600} width={440} height={280} fill="#4a5a3a" /><path d="M60 880 Q220 600 380 880Z" fill="#3a4a2a" />
          <rect x={300} y={30} width={110} height={160} rx={14} fill="#26345a" stroke="#fff" strokeWidth={3} /></g>}
    </Phone>
  </Frame>;
};

// 12: Настя в дверях кухни; Кирилл на переднем плане
export const S12: React.FC<SP> = ({ t }) => {
  const c = caps('s12');
  return <Frame t={t} grade="#1a2a5a" gradeK={.2}>
    <g transform={cam(1.08 + t * .02, 400, 1000)}>
      <Kitchen t={t} />
      <rect x={60} y={420} width={300} height={1200} fill="#1a1410" /><rect x={60} y={420} width={300} height={1200} fill="#ffcf8a" opacity={.12} />
      <Figure x={210} y={1600} s={.95} t={t} L={LK.nastya} C={CS.nastya} pose={POSES.hold} expr="cry" seed={5} turn={.4} lookX={.7} mouth={talk(t, c, 'НАСТЯ')} tears={1} />
      <Figure x={800} y={2050} s={1.45} t={t} L={LK.kWeakHurt} C={CS.hoodieY} pose={PK(t, [[0, 'stand'], [.3, { armR: [20, -40], fistR: true }]])} expr="determined" seed={3} turn={-.55} lookX={-.8} mouth={talk(t, c, 'КИРИЛЛ')} />
    </g>
  </Frame>;
};

// 13: заброшенная станция «Северная», Врата над путями, отряд идёт к ним
export const S13: React.FC<SP> = ({ t }) => {
  const team = ['mikh', 'zhora', 'timur', 'r1', 'r2', 'kWeak'];
  return <Frame t={t} grade="#2a3a6a" gradeK={.15}>
    <g transform={cam(1.0 + t * .05, 540, 1000, 0, -120)}>
      <MetroStation t={t} />
      <Gate x={540} y={760} s={.9} t={t} />
      <ellipse cx={540} cy={1000} rx={500} ry={600} fill="#4ac8ff" opacity={.12} filter="url(#blur30)" />
      <text x={540} y={210} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={56} fill="#c8b080" opacity={.8} letterSpacing={10}>СЕВЕРНАЯ</text>
      {team.map((k, i) => { const x = 300 + i * 95 + (i % 2) * 20, y = 1330 + (i % 3) * 60 - t * 40, s = .42 - (i % 3) * .03;
        return <Figure key={k} x={x} y={y} s={s} t={t} L={LK[k]} C={CS[k === 'kWeak' ? 'porterY' : k]} pose={walkPose(t * 80 + i * 60)} seed={i + 10} opacity={.95} rim="#7fd8ff" />; })}
      <Motes t={t} x={540} y={1300} w={700} h={900} n={30} color="#7fd8ff" speed={40} />
    </g>
  </Frame>;
};
