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
      <g transform="translate(560 1010)"><rect x={0} y={0} width={500} height={300} fill="#101830" stroke="#d8c060" strokeWidth={8} />
        <g transform="translate(110 250) scale(1.5)"><Head t={t} L={LK.r2} expr="smirk" seed={9} /></g>
        <text x={330} y={100} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={110} fill="#ffcf4a">S</text>
        <text x={330} y={170} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill="#fff">ГЕРОЙ МОСКВЫ</text>
        <text x={330} y={215} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={24} fill="#9fb4d8">ГИЛЬДИЯ «СВАРОГ»</text></g>
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
    <g transform={cam(1 + t * .02, 540, 600)}><RankLadder t={t} t0={.1} /></g>
    {t > 1.2 && <g transform={`translate(150 ${885}) scale(${.8 * spr(t, 1.2)})`}><circle r={74} fill="#3a0710" stroke="#ff3b4f" strokeWidth={4} /><g transform="translate(0 12) scale(.8)"><Head t={t} L={LK.kirill} expr="sad" seed={3} /></g></g>}
  </Frame>
);

// 07: дождь у метро, Кирилл-курьер идёт с коробом
export const S07: React.FC<SP> = ({ t }) => {
  const x = 140 + t * 105, dist = t * 105 / .95;
  return <Frame t={t} grade="#2a3a7a" gradeK={.2}>
    <g transform={cam(1.08, 540, 1000, -t * 20, -60)}>
      <MetroStreet t={t} />
      <Figure x={x} y={1560} s={.95} t={t} L={LK.kirill} C={CS.courier} pose={walkPose(dist)} expr="sad" seed={3} turn={.35} lookX={.4} />
      <Rain t={t} k={.6} />
    </g>
  </Frame>;
};

// 08: подъезд — коллекторы, Настя в щели двери
export const S08: React.FC<SP> = ({ t }) => {
  const c = caps('s08');
  return <Frame t={t} grade="#4a5a3a" gradeK={.12}>
    <g transform={cam(1.0 + t * .025, 540, 900)}>
      <Stairwell t={t} />
      {/* щель двери и Настя */}
      <rect x={710} y={360} width={70} height={1140} fill="#05060a" />
      <g transform="translate(745 560) scale(.9)"><Head t={t} L={LK.nastya} expr="scared" seed={5} turn={-.6} lookX={-.6} tears={.6} /></g>
      <rect x={690} y={330} width={20} height={1200} fill="#5a4a46" />
      <Figure x={130} y={1900} s={1.15} t={t} L={LK.coll2} C={CS.coll} pose={POSES.tense} expr="smirk" seed={8} turn={.4} lookX={.5} />
      <Figure x={930} y={1960} s={1.2} t={t} L={LK.coll1} C={CS.coll} pose={PK(t, [[0, 'stand'], [.6, 'pointR'], [3.6, 'pointR'], [4.2, 'stand']])} flip expr="angry" seed={9} turn={-.3} mouth={talk(t, c, 'КОЛЛЕКТОР')} />
    </g>
  </Frame>;
};

// 09: Кирилл встаёт между — щелчок — летит в стену
export const S09: React.FC<SP> = ({ t }) => {
  const c = caps('s09'); const hit = .95, imp = isImpact(t, hit);
  const fly = ease(t, hit, hit + .35), x = 640 - fly * 360, slide = ease(t, hit + .35, hit + 1.1);
  const pose = t < hit ? PK(t, [[0, 'stand'], [.4, 'guard']]) : t < hit + .35 ? POSES.hit : PK(t - hit - .35, [[0, 'hit'], [.6, 'fallen']], false);
  const [sx, sy] = shakeXY(t, [[hit, 22, .5], [hit + .35, 30, .6]]);
  return <Frame t={t} impact={imp} grade="#4a5a3a" gradeK={.12} over={<Flash t={t} t0={hit + .35} max={.5} />}>
    <g transform={cam(1.1, 540, 1000, sx, sy - 40)}>
      <Stairwell t={t} graffiti={.9} />
      <Figure x={x + (t < hit ? -60 * (1 - ease(t, 0, .4)) : 0)} y={1700 - slide * 80} s={1.15} t={t} L={LK.kirillHurt} C={CS.kirill} pose={pose} expr={t < hit ? 'determined' : 'pain'} seed={3} rot={t > hit ? -fly * 8 : 0} turn={.3} />
      <Smoke t={t} t0={hit + .35} x={240} y={1250} n={10} r={120} spread={160} color="#d8d0c0" life={1.6} rise={60} k={.7} seed={4} />
      <Figure x={940} y={1860} s={1.35} t={t} L={LK.coll1} C={CS.coll} pose={PK(t, [[0, 'stand'], [.7, { armR: [-60, -60] }], [hit, { armR: [-120, -10] }], [1.6, 'stand']])} flip expr="smirk" seed={9} turn={-.4} mouth={talk(t, c, 'КОЛЛЕКТОР')} />
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
      <Figure x={560} y={1760} s={1.05} t={t} L={LK.kirillHurt} C={CS.kirill} pose={{ ...POSES.phone, crouch: 160 }} expr="sad" seed={3} lookY={.6} />
      <rect x={240} y={1360} width={800} height={30} fill="#7a5a3a" /><rect x={240} y={1390} width={800} height={600} fill="#3a2418" />
      <rect x={0} y={0} width={1080} height={1920} fill="#000" opacity={ph * .6} />
    </g>
    {ph > 0 && <g transform={`translate(0 ${(1 - ph) * 500})`} opacity={ph}><Phone x={540} y={760} s={1.1}>
      <text x={220} y={110} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={30} fill="#9fb4d8">МОЙ БАНК</text>
      <text x={40} y={230} fontFamily={FONT} fontWeight={600} fontSize={30} fill="#9fb4d8">Баланс</text>
      <text x={40} y={300} fontFamily={FONT} fontWeight={900} fontSize={64} fill="#fff">42 300 ₽</text>
      <rect x={30} y={360} width={380} height={2} fill="#2a3a5a" />
      <text x={40} y={440} fontFamily={FONT} fontWeight={600} fontSize={30} fill="#ff8a9a">Долг «Сварог»</text>
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
      <Figure x={800} y={2050} s={1.45} t={t} L={LK.kirillHurt} C={CS.kirill} pose={PK(t, [[0, 'stand'], [.3, { armR: [20, -40], fistR: true }]])} expr="determined" seed={3} turn={-.55} lookX={-.8} mouth={talk(t, c, 'КИРИЛЛ')} />
    </g>
  </Frame>;
};

// 13: заброшенная станция «Северная», Врата над путями, отряд идёт к ним
export const S13: React.FC<SP> = ({ t }) => {
  const team = ['mikh', 'zhora', 'liza', 'r1', 'r2', 'kirill'];
  return <Frame t={t} grade="#2a3a6a" gradeK={.15}>
    <g transform={cam(1.0 + t * .05, 540, 1000, 0, -120)}>
      <MetroStation t={t} />
      <Gate x={540} y={760} s={.9} t={t} />
      <ellipse cx={540} cy={1000} rx={500} ry={600} fill="#4ac8ff" opacity={.12} filter="url(#blur30)" />
      <text x={540} y={210} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={56} fill="#c8b080" opacity={.8} letterSpacing={10}>СЕВЕРНАЯ</text>
      {team.map((k, i) => { const x = 300 + i * 95 + (i % 2) * 20, y = 1330 + (i % 3) * 60 - t * 40, s = .42 - (i % 3) * .03;
        return <Figure key={k} x={x} y={y} s={s} t={t} L={LK[k]} C={CS[k === 'kirill' ? 'kirillRaid' : k]} pose={walkPose(t * 80 + i * 60)} seed={i + 10} opacity={.95} rim="#7fd8ff" />; })}
      <Motes t={t} x={540} y={1300} w={700} h={900} n={30} color="#7fd8ff" speed={40} />
    </g>
  </Frame>;
};
