// D–E. Храм: правило → двери захлопнулись → гусляр поворачивает голову → глаза Идола → луч → паника → поклон → второе правило → титр
import React from 'react';
import { clamp, ease, noise, spr } from '../anim';
import { cam, Flash, Fog, h1, isImpact, Lids, Motes, Rays, Smoke, SpeedLines, shakeXY } from '../kit/fx';
import { FONT, Title } from '../kit/ui';
import { Temple } from '../bg/places';
import { Figure, PK, POSES, walkPose } from '../chars/body';
import { Head } from '../chars/head';
import { BowFigure, Idol, Statue } from '../chars/monsters';
import { CS, LK } from '../chars/cast';
import { Frame, SP, talk } from './common';
import { SHOTS } from './timeline';
const caps = (id: string) => SHOTS.find(s => s.id === id)?.caps;

// каменная плита с правилом старинной вязью (буквы загораются по одной)
const Plate: React.FC<{ t: number; t0: number; l1: string; l2: string; color?: string; dark?: boolean }> = ({ t, t0, l1, l2, color = '#ffcf5a', dark }) => {
  const n1 = Math.floor(clamp((t - t0) * 18, 0, l1.length)), n2 = Math.floor(clamp((t - t0 - l1.length / 18) * 14, 0, l2.length));
  return <g>
    <rect x={90} y={360} width={900} height={760} fill={dark ? '#1a1820' : '#4a4038'} stroke="#100c0a" strokeWidth={10} />
    <rect x={120} y={390} width={840} height={700} fill="none" stroke={dark ? '#2a2830' : '#5a5048'} strokeWidth={6} />
    {Array.from({ length: 12 }).map((_, i) => <path key={i} d={`M${120 + h1(i) * 800} ${400 + h1(i * 3) * 680} l${20 + h1(i * 5) * 40} ${10 + h1(i * 7) * 30}`} stroke="#100c0a" strokeWidth={3} opacity={.6} />)}
    <text x={540} y={640} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={62} letterSpacing={6} fill={color} filter="url(#glowBig)">{l1.slice(0, n1)}</text>
    <text x={540} y={860} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={100} letterSpacing={4} fill={color} filter="url(#glowBig)">{l2.slice(0, n2)}</text>
    {[[540, 470], [540, 990]].map(([x, y], i) => <path key={i} d={`M${x - 200} ${y} h150 l50 -20 l50 20 h150`} stroke={color} strokeWidth={5} fill="none" opacity={clamp((t - t0) * 2)} filter="url(#glow)" />)}
  </g>;
};

export const S21: React.FC<SP> = ({ t }) => (
  <Frame t={t} grade="#3a2418" gradeK={.1}>
    <g transform={cam(1.0 + t * .04, 540, 740, 0, -120)}>
      <rect width={1080} height={1920} fill="#1c1412" />
      <Plate t={t} t0={.3} l1="ПРАВИЛО ПЕРВОЕ" l2="ПОКЛОНИСЬ" />
      <ellipse cx={180} cy={1300} rx={260} ry={300} fill="#ffa040" opacity={.25} filter="url(#blur30)" />
      <Motes t={t} x={540} y={1400} w={1000} h={1000} n={20} color="#ffcf7a" speed={30} />
    </g>
  </Frame>
);

export const S22: React.FC<SP> = ({ t }) => {
  const c = caps('s22');
  return <Frame t={t} grade="#3a2418" gradeK={.12}>
    <g transform={cam(1.0 + t * .03, 540, 900)}>
      <Temple t={t} lit={1} vp={700} />
      <Figure x={540} y={2200} s={1.9} t={t} L={LK.mikh} C={CS.mikh} pose={{ ...POSES.stand, armL: [-40, 120], armR: [40, -120] }} expr="angry" seed={6} turn={-.3} lookX={-.4} lookY={-.4} mouth={talk(t, c, 'МИХАЛЫЧ')} rim="#ffb060" />
    </g>
  </Frame>;
};

// 23: двери захлопываются, свечи гаснут
export const S23: React.FC<SP> = ({ t }) => {
  const slam = .55, cl = ease(t, 0, slam), lit = 1 - ease(t, slam + .05, slam + .25); const [sx, sy] = shakeXY(t, [[slam, 30, .8]]);
  return <Frame t={t} impact={isImpact(t, slam, 2)} grade="#2a2030" gradeK={.15}>
    <g transform={cam(1.0, 540, 960, sx, sy)}>
      <Temple t={t} lit={lit} vp={800} />
      <rect x={140 - 600 * (1 - cl)} y={200} width={400} height={1500} fill="#4a4038" stroke="#100c0a" strokeWidth={10} />
      <rect x={540 + 600 * (1 - cl)} y={200} width={400} height={1500} fill="#3e3630" stroke="#100c0a" strokeWidth={10} />
      <rect width={1080} height={1920} fill="#05060e" opacity={(1 - lit) * .5} />
      <Smoke t={t} t0={slam} x={540} y={1650} n={14} r={160} spread={500} color="#6a6070" life={2} rise={60} k={.7} seed={13} />
    </g>
  </Frame>;
};

// 24: Жора ломится в дверь — темно, синий и алый свет
export const S24: React.FC<SP> = ({ t }) => {
  const c = caps('s24'); const ph = (t * 3.2) % 1, hitK = ph < .3 ? 1 : 0; const [sx, sy] = shakeXY(t, [[.3, 8, .2], [.62, 8, .2], [.93, 8, .2], [1.25, 8, .2], [1.56, 8, .2], [1.87, 8, .2]]);
  return <Frame t={t} grade="#1a1830" gradeK={.2}>
    <g transform={cam(1.0, 540, 960, sx, sy)}>
      <rect width={1080} height={1920} fill="#0a0a14" />
      <rect x={60} y={100} width={960} height={1700} fill="#24202a" stroke="#0a080e" strokeWidth={10} /><rect x={536} y={100} width={8} height={1700} fill="#0a080e" />
      <Figure x={540} y={2050} s={1.7} t={t} L={LK.zhora} C={CS.zhora} pose={hitK ? POSES.bang : { ...POSES.bang, armL: [-130, -20], armR: [130, 20] }} expr="shout" seed={7} turn={.1} lookY={-.4} mouth={talk(t, c, 'ЖОРА')} rim="#ff4a5a" sweat={1} />
      <rect width={1080} height={1920} fill="#2a40a0" opacity={.15} style={{ mixBlendMode: 'screen' }} />
    </g>
  </Frame>;
};

// 25: каменный гусляр поворачивает голову
export const S25: React.FC<SP> = ({ t }) => {
  const turn = -ease(t, .5, 1.8), [sx, sy] = shakeXY(t, [[.5, 3, 1.3]]);
  return <Frame t={t} grade="#1a1830" gradeK={.2}>
    <g transform={cam(1.0 + t * .04, 540, 900, sx, sy)}>
      <Temple t={t} lit={0} vp={700} />
      <Statue x={540} y={1900} s={3.4} t={t} kind="gusli" headTurn={turn} glow={ease(t, 1.6, 2.2) * .7} />
      <Smoke t={t} t0={.6} x={540} y={680} n={6} r={60} spread={120} color="#8a8090" life={1.4} rise={-80} k={.6} seed={21} />
    </g>
  </Frame>;
};

// 26: глаза Идола вспыхивают алым
export const S26: React.FC<SP> = ({ t }) => {
  const e = ease(t, .7, 1.2), z = 1.6 + t * .15;
  return <Frame t={t} grade="#1a1020" gradeK={.15} over={<Flash t={t} t0={.95} color="#ff2030" max={.4} />}>
    <g transform={cam(z, 540, 420, 0, -100)}>
      <Temple t={t} lit={0} red={e} vp={1000} />
      <Idol x={540} y={1900} s={1.0} t={t} eyes={e} smile={.4} lit={0} />
    </g>
  </Frame>;
};

// 27: луч — импакт — на полу только тень рейдовика
export const S27: React.FC<SP> = ({ t }) => {
  const b = 1.0, beam = clamp((t - b) / .08) * clamp((b + .45 - t) / .1), gone = t > b + .1; const [sx, sy] = shakeXY(t, [[b, 30, .7]]);
  return <Frame t={t} impact={isImpact(t, b + .05)} grade="#2a1020" gradeK={.15} over={<Flash t={t} t0={b} color="#ff6070" max={.7} />}>
    <g transform={cam(1.0, 540, 1000, sx, sy - 60)}>
      <Temple t={t} lit={0} red={.8} vp={600} />
      {!gone && <Figure x={540} y={1560} s={1.0} t={t} L={LK.r1} C={CS.r1} pose={PK(t, [[0, 'stand'], [.6, 'tense']])} expr="scared" seed={21} lookY={-.8} rim="#ff4a5a" />}
      {gone && <g><ellipse cx={540} cy={1560} rx={160} ry={34} fill="#000" opacity={.9} /><path d="M450 1560 Q540 1300 630 1560" fill="#000" opacity={.75 * (1 - ease(t, b + .3, 2.8)) + .25} filter="url(#blur12)" /></g>}
      {beam > 0 && <g><polygon points={`470,-100 610,-100 600,1580 480,1580`} fill="#ff2030" opacity={beam} filter="url(#glowBig)" /><polygon points={`515,-100 565,-100 560,1580 520,1580`} fill="#fff" opacity={beam} /></g>}
      <Smoke t={t} t0={b + .1} x={540} y={1540} n={12} r={110} spread={220} color="#40303a" life={2} rise={200} k={.8} seed={27} />
    </g>
  </Frame>;
};

// 28: паника — бегут, Лиза кричит, ручная камера
export const S28: React.FC<SP> = ({ t }) => {
  const hx = noise('pan', t, 2) * 16, hy = noise('pany', t, 2) * 16;
  return <Frame t={t} grade="#2a1020" gradeK={.18}>
    <g transform={cam(1.05, 540, 1000, hx, hy - 60)}>
      <Temple t={t} lit={0} red={.6} vp={700} />
      <Figure x={300 - t * 120} y={1400} s={.7} t={t} L={LK.r2} C={CS.r2} pose={walkPose(t * 500, true)} expr="scared" seed={22} turn={-.6} />
      <Figure x={800 + t * 140} y={1430} s={.72} t={t} L={LK.zhora} C={CS.zhora} pose={walkPose(t * 520 + 100, true)} expr="shout" seed={7} turn={.6} />
      <Figure x={560} y={1980} s={1.5} t={t} L={LK.liza} C={CS.liza} pose={{ ...POSES.stand, armL: [-150, -40], armR: [150, 40] }} expr="shout" seed={4} lookY={-.6} rim="#ff4a5a" tears={.6} />
    </g>
  </Frame>;
};

// 29: Кирилл замечает — статуи склонили головы к Идолу
export const S29: React.FC<SP> = ({ t }) => {
  const pan = ease(t, 1.0, 2.2);
  return <Frame t={t} grade="#2a1020" gradeK={.15}>
    <g transform={cam(1.0, 540, 960, -pan * 0, 0)}>
      <Temple t={t} lit={0} red={.5} vp={700} />
      <g opacity={pan}>{[[180, 1250, .9], [540, 1150, .7], [900, 1250, .9]].map(([x, y, s], i) => <Statue key={i} x={x} y={y} s={s} t={t} kind={i % 2 ? 'bell' : 'gusli'} bow={1} headTurn={i === 0 ? .6 : i === 2 ? -.6 : 0} glow={.5} />)}</g>
      <g transform={`translate(${280 - pan * 160} ${1050 + pan * 80}) scale(${4.2 - pan * 1.6})`} opacity={1 - pan * .3}><Head t={t} L={LK.kirillHurt} expr="scared" seed={3} turn={.5} lookX={.8} sweat={1} /></g>
    </g>
  </Frame>;
};

// 30: «Все на колени!» → падает лбом в пол (силуэт сбоку)
export const S30: React.FC<SP> = ({ t }) => {
  const c = caps('s30'); const cut = 1.5;
  if (t < cut) return <Frame t={t} grade="#2a1020" gradeK={.15}>
    <g transform={cam(1.05 + t * .05, 540, 900)}><Temple t={t} lit={0} red={.6} vp={700} />
      <Figure x={540} y={2150} s={1.8} t={t} L={LK.kirillHurt} C={CS.kirillRaid} pose={{ ...POSES.stand, armL: [-110, 30], armR: [110, -30] }} expr="shout" seed={3} mouth={talk(t, c, 'КИРИЛЛ')} rim="#ff4a5a" /></g>
  </Frame>;
  const b = ease(t, cut + .1, cut + .7); const [sx, sy] = shakeXY(t, [[cut + .7, 18, .4]]);
  return <Frame t={t} grade="#2a1020" gradeK={.1}>
    <g transform={cam(1.0, 540, 1000, sx, sy - 100)}>
      <rect width={1080} height={1920} fill="#1a0a10" /><rect y={1400} width={1080} height={520} fill="#100608" />
      <ellipse cx={540} cy={700} rx={600} ry={500} fill="#ff2030" opacity={.25} filter="url(#blur30)" />
      <BowFigure x={560} y={1400} s={1.5} bow={b} rim="#5fd2ff" />
      <Smoke t={t} t0={cut + .7} x={300} y={1390} n={8} r={80} spread={200} color="#4a3038" life={1.4} rise={40} k={.6} seed={30} />
    </g>
  </Frame>;
};

// 31: все валятся на пол, лучи проходят над спинами
export const S31: React.FC<SP> = ({ t }) => {
  const ppl = [[150, .2, 'r2'], [420, .45, 'liza'], [690, .1, 'kirill'], [960, 1.5, 'zhora']] as const;
  const beams = [1.2, 1.9, 2.6];
  return <Frame t={t} grade="#2a1020" gradeK={.1}>
    <g transform={cam(1.0, 540, 1000, 0, -120)}>
      <rect width={1080} height={1920} fill="#14080c" /><rect y={1400} width={1080} height={520} fill="#0c0406" />
      {ppl.map(([x, d, k], i) => <BowFigure key={k} x={x} y={1400} s={.8} bow={ease(t, d, d + .45)} rim={k === 'kirill' ? '#5fd2ff' : '#ff3a4a'} />)}
      {beams.map((b0, i) => { const k = clamp((t - b0) / .1) * clamp((b0 + .35 - t) / .1); return k > 0 ? <g key={i} opacity={k}><rect x={-100} y={1150 - i * 30} width={1300} height={40} fill="#ff2030" filter="url(#glowBig)" /><rect x={-100} y={1162 - i * 30} width={1300} height={14} fill="#fff" /></g> : null; })}
    </g>
  </Frame>;
};

// 32: Идол медленно поворачивает голову к Кириллу, улыбка шире
export const S32: React.FC<SP> = ({ t }) => {
  const turn = -ease(t, .3, 2.6) * .8, sm = .4 + ease(t, 1.2, 3) * .6, pulse = 1 + Math.max(0, Math.sin(t * 6)) * .012;
  return <Frame t={t} grade="#1a1020" gradeK={.15}>
    <g transform={cam((1.25 + t * .06) * pulse, 540, 700, 0, -40)}>
      <Temple t={t} lit={0} red={.7} vp={1100} />
      <Idol x={540} y={2200} s={1.05} t={t} eyes={.9} smile={sm} turn={turn} lit={0} />
    </g>
  </Frame>;
};

export const S33: React.FC<SP> = ({ t }) => (
  <Frame t={t} grade="#1a1020" gradeK={.1} over={<Flash t={t} t0={.3} color="#ff4050" max={.35} />}>
    <g transform={cam(1.0 + t * .05, 540, 740, 0, -120)}>
      <rect width={1080} height={1920} fill="#100608" />
      <Plate t={t} t0={.3} l1="ПРАВИЛО ВТОРОЕ" l2="ВОССЛАВЬ" color="#ff4a5a" dark />
    </g>
  </Frame>
);

// 34: крупно Кирилл, капля пота → чёрный, название
export const S34: React.FC<SP> = ({ t }) => {
  const cut = 3.0;
  if (t < cut) return <Frame t={t} grade="#2a1020" gradeK={.12}>
    <rect width={1080} height={1920} fill="#14080c" /><ellipse cx={540} cy={700} rx={600} ry={600} fill="#ff2030" opacity={.2} filter="url(#blur30)" />
    <g transform={cam(1 + t * .05, 540, 700)}><g transform="translate(540 560) scale(6.5)"><Head t={t} L={LK.kirillHurt} expr="scared" seed={3} turn={-.2} lookX={-.3} lookY={-.5} sweat={1} /></g></g>
  </Frame>;
  return <Frame t={t} vign={1}>
    <rect width={1080} height={1920} fill="#000" />
    <Title t={t} t0={cut + .1} text="ОДИНОЧКА" size={130} color="#e8f4ff" />
    <Title t={t} t0={cut + .5} text="" sub="СЕРИЯ 2 — СКОРО" y={1010} size={10} />
  </Frame>;
};
