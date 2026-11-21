// Серия 2, планы c1–c9: шрам на фото → у «отца» шрама нет → «Ты не мой отец» → лицо плывёт → отражение в телефоне (нити света) →
// аварийный молоток, глаза закрыты → гул слева → удар, фонарь вдребезги → тьма, отряд приходит в себя.
import React from 'react';
import { clamp, ease, noise } from '../anim';
import { cam, Flash, h1, isImpact, Lids, shakeXY, SpeedLines } from '../kit/fx';
import { Figure, PK, POSES } from '../chars/body';
import { Head } from '../chars/head';
import { Machinist } from '../chars/monsters';
import { LK, CS } from '../chars/cast';
import { Frame, SP } from '../ep1/common';
import { KL } from '../ep1/ShotsF';
import { G, H } from './team';
import { caps, talk } from './timeline';
import { DarkCar, WARM } from './ShotsA';

const fatherFace = (t: number, p: any = {}) => <g transform="translate(0 20) scale(1.25)"><Head t={t} L={LK.father} expr="sad" seed={12} lookY={.3} noBlink {...p} /></g>;

// c1: вспышка-воспоминание — кухня, фото на холодильнике: отец и маленький Кирилл, шрам через бровь (камера наезжает на шрам)
export const C1: React.FC<SP> = ({ t }) => {
  const z = 1 + ease(t, .3, 2.6) * 1.3;
  return <Frame t={t} grade="#3a2a14" gradeK={.25} over={<g><Flash t={t} t0={0} dur={.3} color="#fff" max={.9} /><rect width={1080} height={1920} fill="#d8b070" opacity={.08} /></g>}>
    <g transform={cam(z, 470, 760 + ease(t, .3, 2.6) * -40, 0, -200)}>
      <rect width={1080} height={1920} fill="#6a6058" />
      <rect x={140} y={200} width={800} height={1720} rx={30} fill="#e8e4dc" stroke="#9a948a" strokeWidth={8} />
      <rect x={880} y={700} width={26} height={300} rx={10} fill="#b8b2a8" />
      {/* магнитики и рисунок */}
      <circle cx={320} cy={360} r={22} fill="#ff6a4a" /><rect x={620} y={1240} width={220} height={260} fill="#fffdf0" transform="rotate(6 730 1370)" /><circle cx={730} cy={1250} r={16} fill="#4a8aff" />
      {/* фото */}
      <g transform="rotate(-4 520 800)">
        <rect x={250} y={500} width={540} height={620} fill="#f8f4ea" stroke="#c8c0b0" strokeWidth={4} />
        <rect x={280} y={530} width={480} height={460} fill="#8ab0c8" />
        <rect x={280} y={850} width={480} height={140} fill="#5a7a5a" />
        <g transform="translate(450 820) scale(2.4)"><Head t={0} L={LK.father} expr="smirk" seed={12} noBlink />
          <path d="M-36 -34 L-22 10" stroke="#a04848" strokeWidth={3.2} strokeLinecap="round" /><path d="M-33 -22 l6 -2 M-29 -10 l6 -2" stroke="#a04848" strokeWidth={1.6} /></g>
        <g transform="translate(640 900) scale(1.5)"><Head t={0} L={{ ...LK.kWeak, tired: false, plaster: false }} expr="smirk" seed={3} noBlink /></g>
        <text x={520} y={1080} textAnchor="middle" fontFamily="Mont" fontWeight={600} fontSize={30} fill="#5a5048">Мы с папой · 2021</text>
      </g>
      <circle cx={520} cy={480} r={20} fill="#3a9a5a" />
    </g>
  </Frame>;
};

// c2: снова лицо под фонарём — гладкое, без шрама; кружок-«лупа» на месте шрама
export const C2: React.FC<SP> = ({ t }) => {
  const ring = ease(t, .4, .9);
  return <Frame t={t} grade="#1a1a2a" gradeK={.1}>
    <g transform={cam(2.2 + t * .1, 470, 590, 0, -150)}>
      <rect width={1080} height={1920} fill="#0a0b10" />
      <ellipse cx={540} cy={500} rx={600} ry={500} fill={WARM} opacity={.18} filter="url(#blur30)" />
      <Machinist x={540} y={2350} s={2.3} t={t} k={1} lift={1} face={fatherFace(t)} />
      {ring > 0 && <circle cx={540 - 36 * 1.25 * 2.3 * .9} cy={1100 - 600 * 2.3 + 25 * 2.3} r={70 + (1 - ring) * 60} fill="none" stroke="#ff4a4a" strokeWidth={6} opacity={ring} strokeDasharray="18 12" />}
    </g>
  </Frame>;
};

// c3: Кирилл крупно: прикусывает губу (капля крови), зажмуривается и отворачивается — «Ты не мой отец.»
export const C3: React.FC<SP> = ({ t }) => {
  const c = caps('c3'), turn = ease(t, .5, 1.0), [sx, sy] = shakeXY(t, [[.5, 10, .3]]);
  return <Frame t={t} grade="#2a2418" gradeK={.12}>
    <rect width={1080} height={1920} fill="#0c0a0e" />
    <ellipse cx={900} cy={500} rx={500} ry={600} fill={WARM} opacity={.2} filter="url(#blur30)" />
    <g transform={cam(1.02 + t * .05, 540, 700, sx, sy)}>
      <g transform="translate(540 680) scale(6)"><Head t={t} L={KL} expr={t > .9 ? 'angry' : 'pain'} seed={3} turn={-turn * .7} lookX={-turn} lid={t < .9 ? .3 : 1} noBlink mouth={talk(t, c, 'КИРИЛЛ')} sweat={1} />
        {t > .5 && <path d={`M4 ${44 + (t - .5) * 10} l0 ${Math.min(14, (t - .5) * 20)}`} stroke="#c0182a" strokeWidth={2.4} strokeLinecap="round" />}</g>
    </g>
  </Frame>;
};

// c4: лицо «отца» плывёт: глаза пустеют, рот растягивается, картинка рвётся полосами
export const C4: React.FC<SP> = ({ t }) => {
  const f = Math.floor(t * 30), w = ease(t, .1, 1.4), [sx, sy] = shakeXY(t, [[0, 6, 2.4]]);
  const face = <g transform="translate(0 20) scale(1.25)"><Head t={t} L={LK.father} expr="angry" seed={12} noBlink glow={w} mouth={.6 + w * .4} />
    <path d={`M${-20 - w * 20} 46 Q0 ${60 + w * 30} ${20 + w * 20} 46`} stroke="#140606" strokeWidth={4 + w * 6} fill="none" opacity={w} /></g>;
  return <Frame t={t} grade="#2a0a10" gradeK={.15 + w * .2} impact={f % 9 === 0 && t > .5}>
    <g transform={cam(1.3 + t * .15, 540, 880, sx, sy - 40)}>
      <rect width={1080} height={1920} fill="#0a0608" />
      <ellipse cx={540} cy={500} rx={600} ry={500} fill={WARM} opacity={.2 + .1 * noise('c4', t, 12)} filter="url(#blur30)" />
      <Machinist x={540} y={2350} s={2.3} t={t} k={1} lift={1} face={face} />
    </g>
    {/* срыв строк — полосы со сдвигом */}
    {Array.from({ length: 6 }).map((_, i) => { const y = (h1(i + f * .37) * 1920) | 0, hh = 20 + h1(i * 3 + f) * 60; return t > .4 && h1(i + f) > .5 ? <rect key={i} x={(h1(i * 7 + f) - .5) * 80} y={y} width={1080} height={hh} fill={i % 2 ? '#ff2a3a' : '#2a8aff'} opacity={.18} style={{ mixBlendMode: 'screen' }} /> : null; })}
  </Frame>;
};

// c5: Кирилл смотрит в тёмный экран телефона; в отражении правда: Машинист без лица, от глаз упавших к фонарю тянутся нити света
export const C5: React.FC<SP> = ({ t }) => {
  const up = ease(t, .1, .8), rev = ease(t, 1.2, 2.6);
  return <Frame t={t} grade="#1a1a2a" gradeK={.12}>
    <g transform={cam(1.0 + t * .03, 540, 960, 0, -100)}>
      <DarkCar t={t} k={.6} />
      <ellipse cx={540} cy={300} rx={600} ry={400} fill={WARM} opacity={.12} filter="url(#blur30)" />
      {/* Кирилл спиной к фонарю, телефон в руке на уровне глаз */}
      <Figure x={540} y={2050} s={1.5} t={t} L={KL} C={CS.porterY} pose={{ ...POSES.phone, armR: [22, -130] }} expr="determined" lookY={.6} lookX={.2} seed={3} />
      <g transform={`translate(${700} ${1260 - up * 380}) rotate(-6) scale(${.75})`}>
        <rect x={-240} y={-460} width={480} height={920} rx={56} fill="#0b0c10" stroke="#2a2e3a" strokeWidth={6} />
        <defs><clipPath id="c5scr"><rect x={-220} y={-440} width={440} height={880} rx={40} /></clipPath></defs>
        <g clipPath="url(#c5scr)">
          <rect x={-220} y={-440} width={440} height={880} fill="#05060a" />
          {/* отражение: зеркально, холодный тон */}
          <g opacity={.25 + rev * .75}>
            <rect x={-220} y={-440} width={440} height={880} fill="#0a1420" />
            <g transform="translate(0 420) scale(-.42 .42)">
              <Machinist x={0} y={0} s={1.6} t={t} k={1} />
            </g>
            {/* «лицо» в фонаре — пустой глаз-воронка вместо отца */}
            <g transform="translate(0 -60)"><circle r={60} fill="#fff6d8" opacity={.9} /><circle r={30} fill="#1a0a04" /><circle r={12 + 4 * Math.sin(t * 6)} fill="#ff3a20" /></g>
            {/* нити света от упавших к фонарю */}
            {[-170, -90, 30, 120, 190].map((x, i) => { const yb = 380 - (i % 2) * 40; return <g key={i}>
              <path d={`M${x} ${yb} Q${x * .5} ${120} 0 -60`} stroke="#ffe8a0" strokeWidth={4} fill="none" opacity={rev * (.6 + .4 * Math.sin(t * 8 + i))} filter="url(#glow)" strokeDasharray="14 10" strokeDashoffset={-t * 120} />
              <ellipse cx={x} cy={yb + 10} rx={34} ry={10} fill="#2a2a34" /></g>; })}
          </g>
          {/* блик стекла */}
          <path d="M-220 -200 L220 -440 L220 -380 L-220 -140Z" fill="#fff" opacity={.06} />
        </g>
      </g>
    </g>
  </Frame>;
};

// c6: красный аварийный молоток на стене вагона — Кирилл срывает его, затем закрывает глаза
const Hammer: React.FC<{ x: number; y: number; r?: number; s?: number }> = ({ x, y, r = 0, s = 1 }) => <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
  <rect x={-14} y={0} width={28} height={190} rx={8} fill="#d8202a" stroke="#0c0d18" strokeWidth={5} />
  <path d="M-70 -40 L60 -40 L76 -20 L60 0 L-70 0 L-84 -20Z" fill="#e02a30" stroke="#0c0d18" strokeWidth={5} /><path d="M60 -40 L96 -20 L60 0" fill="#c8ccd4" stroke="#0c0d18" strokeWidth={4} /><path d="M-70 -40 L-104 -20 L-70 0" fill="#c8ccd4" stroke="#0c0d18" strokeWidth={4} />
</g>;
export { Hammer };
export const C6: React.FC<SP> = ({ t }) => {
  const grab = ease(t, .7, 1.1), close = ease(t, 2.4, 3.2), [sx, sy] = shakeXY(t, [[1.0, 10, .3]]);
  if (t < 1.8) return <Frame t={t} grade="#1a1a2a" gradeK={.1} impact={isImpact(t, 1.0, 2)}>
    <g transform={cam(1.1 + t * .05, 540, 820, sx, sy)}>
      <rect width={1080} height={1920} fill="#3a3e48" /><rect x={0} y={1300} width={1080} height={620} fill="#5a2a2a" />
      <rect x={300} y={360} width={480} height={680} rx={14} fill="#e8e8e0" stroke="#2a2e38" strokeWidth={8} />
      <text x={540} y={450} textAnchor="middle" fontFamily="Mont" fontWeight={800} fontSize={40} fill="#c81e2a">МОЛОТОК ДЛЯ</text>
      <text x={540} y={500} textAnchor="middle" fontFamily="Mont" fontWeight={800} fontSize={40} fill="#c81e2a">РАЗБИВАНИЯ СТЕКЛА</text>
      <rect x={380} y={540} width={320} height={440} rx={10} fill="none" stroke="#c81e2a" strokeWidth={6} strokeDasharray="20 10" />
      <g transform={`translate(${grab * 220} ${grab * 380}) rotate(${grab * 60} 540 760)`}><Hammer x={540} y={700} r={0} s={1.3} /></g>
      {/* рука Кирилла входит в кадр */}
      <path d={`M${1100 - ease(t, .3, .8) * 450 + grab * 220} ${900 + grab * 380} L1200 1500`} stroke="#f5c518" strokeWidth={120} strokeLinecap="round" />
      <circle cx={1100 - ease(t, .3, .8) * 450 + grab * 220} cy={900 + grab * 380} r={58} fill="#ecd2c4" stroke="#0c0d18" strokeWidth={5} />
    </g>
  </Frame>;
  return <Frame t={t} grade="#1a1a2a" gradeK={.1} over={<Lids k={close * .92} />}>
    <g transform={cam(1.3 + t * .06, 540, 760, 0, -60)}>
      <DarkCar t={t} k={.5} />
      <ellipse cx={200} cy={400} rx={500} ry={500} fill={WARM} opacity={.18} filter="url(#blur30)" />
      <Figure x={540} y={2100} s={1.8} t={t} L={KL} C={CS.porterY} pose={{ ...POSES.guard, armR: [40, -120] }} expr="determined" seed={3} lid={1 - close} noBlink rim={WARM}
        prop={undefined} />
      <Hammer x={760} y={1080} r={-20} s={1.4} />
    </g>
  </Frame>;
};

// c7: темнота (глаза закрыты) — гул фонаря как кольца звука слева, всё ближе; силуэт Кирилла с молотком
export const C7: React.FC<SP> = ({ t }) => {
  const near = ease(t, .2, 3.0), cx = 140 + near * 200, cy = 760;
  return <Frame t={t} vign={1}>
    <rect width={1080} height={1920} fill="#020205" />
    {Array.from({ length: 6 }).map((_, i) => { const q = ((t * 1.3 + i / 6) % 1); return <ellipse key={i} cx={cx} cy={cy} rx={60 + q * 520} ry={60 + q * 520} fill="none" stroke={WARM} strokeWidth={6 * (1 - q)} opacity={(1 - q) * (.35 + near * .5)} filter="url(#glow)" />; })}
    <text x={cx} y={cy + 14} textAnchor="middle" fontFamily="Oswald" fontWeight={500} fontSize={44 + near * 30} letterSpacing={10} fill={WARM} opacity={.5 + .3 * Math.sin(t * 20)} filter="url(#glow)">ГУУУ</text>
    <g opacity={.85}><Figure x={700} y={1960} s={1.3} t={t} L={KL} C={{ ...CS.porterY, top: '#141418', topSh: '#0a0a0c', pants: '#0a0a0c', shoes: '#0a0a0c' }} pose={PK(t, [[0, 'guard'], [2.4, { ...POSES.guard, armR: [120, -60], lean: -6 }]], false)} expr="determined" turn={-.6} lid={0} noBlink seed={3} rim="#5a4a30" /></g>
  </Frame>;
};

// c8: удар — молоток в фонарь: стекло вдребезги, вспышка, вой; «Твоя конечная.»
export const C8: React.FC<SP> = ({ t }) => {
  const c = caps('c8'), hit = .45, sw = ease(t, 0, hit), q = clamp((t - hit) / 1.6), [sx, sy] = shakeXY(t, [[hit, 30, .6]]);
  return <Frame t={t} vign={1} impact={isImpact(t, hit, 3)} over={<Flash t={t} t0={hit} dur={.4} color="#fff" max={1} />}>
    <rect width={1080} height={1920} fill={t < hit ? '#100c06' : '#06060a'} />
    <g transform={cam(1.1, 540, 900, sx, sy)}>
      {t < hit ? <g><circle cx={540} cy={760} r={260} fill={WARM} opacity={.5} filter="url(#blur30)" /><g transform="translate(540 760) scale(2.6)"><rect x={-70} y={-80} width={140} height={150} rx={20} fill="#2a2a30" stroke="#0c0d18" strokeWidth={5} /><circle r={52} fill="#fff6d8" /></g>
        <SpeedLines t={t} cx={540} cy={760} k={.8} /></g>
        : <g>
          {Array.from({ length: 34 }).map((_, i) => { const a = h1(i * 3.1) * Math.PI * 2, sp = 200 + h1(i * 7.7) * 900, x = 540 + Math.cos(a) * sp * q, y = 760 + Math.sin(a) * sp * q + q * q * 500, r = 12 + h1(i * 5) * 40;
            return <polygon key={i} points={`${x},${y - r} ${x + r * .7},${y + r * .4} ${x - r * .5},${y + r * .6}`} fill={i % 3 ? '#fff6d8' : '#c8d0e0'} opacity={1 - q} transform={`rotate(${q * 500 * (h1(i) - .5)} ${x} ${y})`} />; })}
          <circle cx={540} cy={760} r={400 * (1 - q)} fill={WARM} opacity={(1 - q) * .6} filter="url(#blur30)" />
        </g>}
      <g transform={`rotate(${-60 + sw * 100} 980 1700)`}><Hammer x={980} y={1300} r={-90} s={2.2} /></g>
    </g>
    <text x={540} y={1180} textAnchor="middle" fontFamily="CormSC, serif" fontWeight={700} fontSize={64} fill="#fff" opacity={0} >.</text>
  </Frame>;
};

// c9: тьма; тусклый аварийный свет; отряд шевелится, кашляет; Михалыч поднимает голову
export const C9: React.FC<SP> = ({ t }) => {
  const c = caps('c9'), em = ease(t, .2, 1.2) * (.85 + .15 * noise('em', t, 6));
  return <Frame t={t} grade="#1a1018" gradeK={.15}>
    <g transform={cam(1.0 + t * .02, 540, 1050, 0, -140)}>
      <DarkCar t={t} k={.8} />
      <rect width={1080} height={1920} fill="#ff2a2a" opacity={.06 * em} />
      <ellipse cx={540} cy={420} rx={300} ry={60} fill="#ff4a3a" opacity={.25 * em} filter="url(#blur30)" />
      <g transform={`rotate(${82 - ease(t, 1.0, 2.0) * 30} ${G.timur[0]} ${G.timur[1]})`}><H t={t} w="timur" pose={POSES.fallen} expr="pain" lid={ease(t, 1.4, 2.0) * .6} noBlink /></g>
      <H t={t} w="mikh" pose={{ ...POSES.stand, crouch: 160 - ease(t, .6, 1.8) * 60, lean: -10, armL: [-40, 30], armR: [30, -20] }} expr="pain" lid={ease(t, .4, 1.0)} mouth={talk(t, c, 'МИХАЛЫЧ')} turn={-.4} lookX={-.6} />
      <H t={t} w="kirill" pose={{ ...POSES.stand, armR: [30, -30] }} expr="determined" turn={.3} />
      <Hammer x={G.kirill[0] + 110} y={G.kirill[1] - 380} r={-170} s={.8} />
      {Array.from({ length: 16 }).map((_, i) => <polygon key={i} points="0,-10 8,6 -6,8" transform={`translate(${200 + h1(i * 3) * 700} ${1500 + h1(i * 7) * 300}) rotate(${h1(i) * 360})`} fill="#c8d0e0" opacity={.6} />)}
    </g>
  </Frame>;
};
