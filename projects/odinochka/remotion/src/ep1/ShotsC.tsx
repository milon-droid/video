// C. Вторая дверь: вход во Врата → упырь и Жора → Лиза лечит → трещина → голосование → двери → храм
import React from 'react';
import { clamp, ease, noise, spr } from '../anim';
import { cam, DashLines, Flash, Fog, h1, isImpact, Motes, Rays, Smoke, SpeedLines, shakeXY } from '../kit/fx';
import { Gate } from '../bg/moscow';
import { Cave, MetroStation, Temple } from '../bg/places';
import { Figure, PK, POSES, walkPose } from '../chars/body';
import { Head } from '../chars/head';
import { Idol, Statue, Upyr } from '../chars/monsters';
import { CS, LK } from '../chars/cast';
import { Frame, SP, talk } from './common';
import { SHOTS } from './timeline';
const caps = (id: string) => SHOTS.find(s => s.id === id)?.caps;

// 14: камера влетает во Врата
export const S14: React.FC<SP> = ({ t }) => {
  const z = 1 + Math.pow(ease(t, .2, 2.3), 2.2) * 9;
  return <Frame t={t} grade="#2a3a6a" gradeK={.15} over={<g><SpeedLines t={t} cx={540} cy={760} n={70} inner={200 + (1 - ease(t, .3, 2)) * 400} color="#bfeaff" k={ease(t, .4, 1.2) * .7} /><Flash t={t} t0={2.2} dur={.4} color="#e8fbff" /></g>}>
    <g transform={cam(z, 540, 760)}><MetroStation t={t} /><Gate x={540} y={760} s={.9} t={t} /></g>
  </Frame>;
};

// 15: пещера — упырь сбивает Кирилла, Жора убивает упыря одним ударом
export const S15: React.FC<SP> = ({ t }) => {
  const c = caps('s15'); const swipe = .55, punch = 1.55;
  const kx = 520 - ease(t, swipe, swipe + .3) * 200;
  const kPose = t < swipe ? PK(t, [[0, 'stand'], [.3, 'guard']]) : t < swipe + .4 ? POSES.hit : PK(t - swipe - .4, [[0, 'hit'], [.5, 'fallen']], false);
  const zx = 1180 - ease(t, 1.0, punch) * 420;
  const zPose = t < punch - .15 ? walkPose((t - 1) * 600, true) : PK(t - punch + .15, [[0, { armR: [60, -100], fistR: true, lean: -8 }], [.15, { armR: [-95, -5], fistR: true, lean: 12, crouch: 30 }], [.9, { armR: [-60, -40], fistR: true }], [1.6, { armL: [-20, 60], armR: [20, -60], fistL: true, fistR: true }]]);
  const upDead = ease(t, punch, punch + .5), upX = 640 - upDead * 380;
  const [sx, sy] = shakeXY(t, [[swipe + .1, 14, .4], [punch, 28, .6]]);
  return <Frame t={t} impact={isImpact(t, punch)} grade="#203070" gradeK={.15} over={<Flash t={t} t0={punch} max={.5} color="#ffd8a0" />}>
    <g transform={cam(1.05, 540, 1000, sx, sy - 80)}>
      <Cave t={t} />
      <Fog t={t} y={1500} k={.3} color="#3a5aaa" />
      <Upyr x={upX} y={1560 + upDead * 40} s={.95} t={t} attack={t < swipe ? ease(t, .1, swipe) : 1 - ease(t, swipe, swipe + .5)} dead={upDead} flip seed={2} />
      <Figure x={kx} y={1600} s={.95} t={t} L={LK.kirillHurt} C={CS.kirillRaid} pose={kPose} expr={t < swipe ? 'scared' : 'pain'} seed={3} turn={.4} rot={t > swipe ? -10 * ease(t, swipe, swipe + .3) : 0} />
      {t > 1 && <Figure x={zx} y={1640} s={1.1} t={t} L={LK.zhora} C={CS.zhora} pose={zPose} expr={t < punch + .5 ? 'shout' : 'smirk'} seed={7} turn={-.4} lookX={-.6} mouth={talk(t, c, 'ЖОРА')} flip />}
      {t > punch - .05 && t < punch + .3 && <SpeedLines t={t} cx={640} cy={1100} n={50} inner={260} k={.7} />}
      <Smoke t={t} t0={punch} x={420} y={1500} n={10} r={110} spread={200} color="#8a90a8" life={1.8} k={.7} seed={6} />
    </g>
  </Frame>;
};

// 16: Лиза лечит руку Кирилла
export const S16: React.FC<SP> = ({ t }) => {
  const c = caps('s16');
  return <Frame t={t} grade="#203070" gradeK={.15}>
    <g transform={cam(1.25 + t * .03, 540, 900)}>
      <Cave t={t} />
      <Figure x={330} y={1560} s={1.05} t={t} L={LK.kirillHurt} C={CS.kirillRaid} pose={{ ...POSES.stand, crouch: 170, armR: [70, -20], armL: [-20, 10] }} expr="pain" seed={3} turn={.5} lookX={.6} />
      <Figure x={760} y={1600} s={1.05} t={t} L={LK.liza} C={CS.liza} pose={{ ...POSES.heal, crouch: 150, armL: [-70, -30] }} expr="sad" seed={4} turn={-.5} lookX={-.6} lookY={.4} mouth={talk(t, c, 'ЛИЗА')} />
      <circle cx={560} cy={1010} r={90 + Math.sin(t * 5) * 10} fill="#5affb0" opacity={.35} filter="url(#blur30)" />
      <Motes t={t} x={560} y={1080} w={200} h={300} n={24} color="#7affc0" speed={80} size={5} />
    </g>
  </Frame>;
};

// 17: трещина в стене, за ней тёплый свет свечей; лицо Кирилла в тёплом свете
export const S17: React.FC<SP> = ({ t }) => {
  const glow = .6 + .2 * noise('crk', t, 3);
  return <Frame t={t} grade="#203070" gradeK={.1}>
    <g transform={cam(1.0 + t * .05, 420, 800)}>
      <Cave t={t} warm={glow} />
      <path d="M420 300 L440 520 L400 700 L450 900 L410 1100 L440 1300" stroke="#ffcf7a" strokeWidth={14 + glow * 6} fill="none" filter="url(#glowBig)" />
      <path d="M420 300 L440 520 L400 700 L450 900 L410 1100 L440 1300" stroke="#fff4d0" strokeWidth={4} fill="none" />
      <Rays t={t} x0={430} y0={800} n={4} color="#ffc070" k={.3} spread={700} len={900} />
      <g transform="translate(760 820) scale(3)"><Head t={t} L={LK.kirillHurt} expr="scared" seed={3} turn={-.7} lookX={-1} /></g>
      <ellipse cx={720} cy={800} rx={200} ry={300} fill="#ffb060" opacity={.18 * glow} filter="url(#blur30)" style={{ mixBlendMode: 'screen' }} />
    </g>
  </Frame>;
};

// 18: голосование — Жора «Кто за?», руки вверх, Михалыч против, Кирилл тоже поднимает руку
export const S18: React.FC<SP> = ({ t }) => {
  const c = caps('s18');
  const ppl: [string, string, number, number, number][] = [['mikh', 'mikh', 150, .5, 99], ['r1', 'r1', 360, .3, .7], ['zhora', 'zhora', 560, -.1, .1], ['r2', 'r2', 760, -.3, .9], ['liza', 'liza', 950, -.5, 99]];
  return <Frame t={t} grade="#203070" gradeK={.15}>
    <g transform={cam(1.0 + t * .02, 540, 1000, 0, -60)}>
      <Cave t={t} warm={.4} />
      {ppl.map(([l, cs, x, turn, up], i) => <Figure key={l} x={x} y={1500 - (i % 2) * 30} s={.78} t={t} L={LK[l]} C={CS[cs]} pose={l === 'mikh' ? { ...POSES.stand, armL: [-40, 120], armR: [40, -120] } : t > up ? PK(t - up, [[0, 'stand'], [.25, 'raiseR']]) : POSES.stand} expr={l === 'zhora' ? 'shout' : l === 'mikh' ? 'angry' : 'calm'} seed={i + 20} turn={turn} mouth={talk(t, c, l === 'zhora' ? 'ЖОРА' : '#')} />)}
      <Figure x={300} y={1980} s={1.2} t={t} L={LK.kirillHurt} C={CS.kirillRaid} pose={t > 2.4 ? PK(t - 2.4, [[0, 'stand'], [.4, 'raiseR']], false) : POSES.stand} expr="determined" seed={3} turn={0} mouth={talk(t, c, 'КИРИЛЛ')} />
    </g>
  </Frame>;
};

// 19: каменные двери до потолка раскрываются — тёплый свет, пыль
export const S19: React.FC<SP> = ({ t }) => {
  const o = ease(t, .5, 3.2); const [sx, sy] = shakeXY(t, [[.5, 6, 2.8]]);
  return <Frame t={t} grade="#3a2a20" gradeK={.1}>
    <g transform={cam(1.0 + t * .03, 540, 1000, sx, sy)}>
      <Cave t={t} />
      <rect x={160} y={180} width={760} height={1360} fill="#ffcf7a" />
      <g opacity={o}><Temple t={t} lit={1} vp={900} /></g>
      <rect x={160} y={180} width={760} height={1360} fill="#ffcf7a" opacity={.5 * (1 - o * .6)} />
      <Rays t={t} x0={540} y0={600} n={6} color="#ffd890" k={.35 * o} spread={1000} len={1400} />
      <rect x={160 - o * 380} y={180} width={380} height={1360} fill="#4a4038" stroke="#1a1410" strokeWidth={8} />
      <rect x={540 + o * 380} y={180} width={380} height={1360} fill="#3e3630" stroke="#1a1410" strokeWidth={8} />
      {[0, 1].map(i => <g key={i}><path d={`M${(i ? 600 + o * 380 : 220 - o * 380)} 400 h260 M${(i ? 600 + o * 380 : 220 - o * 380)} 800 h260 M${(i ? 600 + o * 380 : 220 - o * 380)} 1200 h260`} stroke="#2a2420" strokeWidth={10} /></g>)}
      <rect x={0} y={0} width={160} height={1920} fill="#0a0e1c" /><rect x={920} y={0} width={160} height={1920} fill="#0a0e1c" /><rect x={0} y={0} width={1080} height={180} fill="#0a0e1c" />
      <Smoke t={t} t0={.5} x={540} y={1520} n={14} r={160} spread={420} color="#c8b8a0" life={2.6} rise={80} k={.6} seed={9} />
      {['mikh', 'zhora', 'liza', 'r1', 'r2', 'kirill'].map((k, i) => <Figure key={k} x={260 + i * 115} y={1760 + (i % 2) * 40} s={.62} t={t} L={LK[k]} C={CS[k === 'kirill' ? 'kirillRaid' : k]} pose={POSES.stand} seed={i + 30} rim="#ffcf7a" opacity={.97} />)}
      <rect y={1640} width={1080} height={300} fill="#000" opacity={.45} />
    </g>
  </Frame>;
};

// 20: храм — гусляры и звонари по кругу, Идол на троне; наезд на Идола
export const S20: React.FC<SP> = ({ t }) => {
  const z = 1 + ease(t, 0, 4) * .35;
  return <Frame t={t} grade="#3a2418" gradeK={.12}>
    <g transform={cam(z, 540, 700)}>
      <Temple t={t} lit={1} vp={900} />
      <Idol x={540} y={1060} s={.42} t={t} smile={.15} />
      {[[250, 1120, .42, 'gusli'], [830, 1120, .42, 'bell'], [120, 1300, .62, 'bell'], [960, 1300, .62, 'gusli'], [-20, 1560, .9, 'gusli'], [1100, 1560, .9, 'bell']].map(([x, y, s, k], i) => <Statue key={i} x={x as number} y={y as number} s={s as number} t={t} kind={k as any} />)}
      <Motes t={t} x={540} y={1500} w={1000} h={1000} n={30} color="#ffcf7a" speed={30} />
    </g>
  </Frame>;
};
