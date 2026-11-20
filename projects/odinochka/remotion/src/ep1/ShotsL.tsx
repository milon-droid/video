// Лор после «открылись Врата»: трещина в небе → за Вратами подземелья → прорыв в город → проснулись охотники
import React from 'react';
import { clamp, ease, noise, spr } from '../anim';
import { cam, Flash, Fog, h1, Motes, Smoke, shakeXY } from '../kit/fx';
import { FONT } from '../kit/ui';
import { Gate, KremlinTower, KremlinWall, MoscowCity, Panelka, Sky, Vysotka } from '../bg/moscow';
import { Cave } from '../bg/places';
import { Figure, POSES, walkPose } from '../chars/body';
import { Upyr } from '../chars/monsters';
import { LK, CS } from '../chars/cast';
import { Frame, SP } from './common';

// подпись-плашка в стиле окна Системы
const Tag: React.FC<{ t: number; t0: number; text: string; y?: number; c?: string }> = ({ t, t0, text, y = 300, c = '#5fd2ff' }) => {
  const k = spr(t, t0, { damping: 14 }); if (t < t0) return null;
  return <g transform={`translate(540 ${y}) scale(${.7 + .3 * k} ${k})`} opacity={k}>
    <rect x={-300} y={-55} width={600} height={110} fill="#06182e" opacity={.75} stroke={c} strokeWidth={4} />
    <text y={18} textAnchor="middle" fontFamily="Oswald" fontWeight={600} fontSize={56} letterSpacing={12} fill="#e8f8ff" filter="url(#glow)">{text}</text>
  </g>;
};

// l1: небо над Москвой трескается, Врата открываются по всему городу
export const L1: React.FC<SP> = ({ t }) => {
  const crack = ease(t, .1, 1.4), [sx, sy] = shakeXY(t, [[.2, 6, 2.5]]);
  const gates: [number, number, number, number][] = [[620, 430, 1.0, .6], [220, 620, .45, 1.3], [880, 720, .4, 1.7], [400, 860, .3, 2.1]];
  return <Frame t={t} grade="#203060" gradeK={.15}>
    <g transform={cam(1.05 + t * .03, 540, 800, sx, sy)}>
      <Sky top="#0a1030" bot="#3a2a5a" id="l1" stars t={t} />
      {/* трещины по небу */}
      {Array.from({ length: 9 }).map((_, i) => { const a = (i / 9) * Math.PI * 2, L = 900 * crack * (.6 + h1(i) * .5); let d = 'M620 430'; let x = 620, y = 430;
        for (let k = 1; k <= 6; k++) { x += Math.cos(a + (h1(i * 7 + k) - .5)) * L / 6; y += Math.sin(a + (h1(i * 3 + k) - .5)) * L / 6 * .6; d += ` L${x.toFixed(0)} ${y.toFixed(0)}`; }
        return <path key={i} d={d} stroke="#8fe0ff" strokeWidth={5} fill="none" filter="url(#glow)" opacity={.9} />; })}
      {gates.map(([x, y, s, t0], i) => <g key={i} opacity={ease(t, t0, t0 + .4)}><Gate x={x} y={y} s={s * ease(t, t0, t0 + .6)} t={t} rot={-10 + i * 7} /></g>)}
      <MoscowCity x={780} y={1450} s={.5} t={t} />
      <Vysotka x={260} y={1480} s={.42} seed={3} />
      <Fog t={t} y={1440} k={.35} color="#3a3a8a" />
      <KremlinWall x={0} y={1600} w={1080} /><KremlinTower x={760} y={1640} s={.5} />
      <rect y={1640} width={1080} height={400} fill="#0a0610" />
    </g>
    <Flash t={t} t0={.6} color="#bfe8ff" max={.4} />
  </Frame>;
};

// l2: камера ныряет во Врата — подземелье, сотни горящих глаз, вдали огромный силуэт
export const L2: React.FC<SP> = ({ t }) => {
  const dive = ease(t, 0, .8);
  if (t < .8) return <Frame t={t} grade="#203060" gradeK={.15}><g transform={cam(1 + dive * 6, 540, 900)}><Sky top="#0a1030" bot="#3a2a5a" id="l2s" /><Gate x={540} y={900} s={1.4} t={t} /></g><Flash t={t} t0={.65} dur={.3} color="#e8fbff" /></Frame>;
  const tt = t - .8;
  return <Frame t={t} grade="#101830" gradeK={.15}>
    <g transform={cam(1.0 + tt * .05, 540, 900)}>
      <Cave t={t} />
      <rect width={1080} height={1920} fill="#000" opacity={.55} />
      {/* исполинский силуэт босса в глубине */}
      <g opacity={ease(tt, .6, 1.6)}><path d="M300 1300 C280 900 380 640 540 620 C700 640 800 900 780 1300Z" fill="#05060c" /><path d="M420 700 L380 520 L470 640Z M660 700 L700 520 L610 640Z" fill="#05060c" />
        <ellipse cx={490} cy={760} rx={22} ry={10} fill="#ff2a3a" filter="url(#glow)" /><ellipse cx={590} cy={760} rx={22} ry={10} fill="#ff2a3a" filter="url(#glow)" /></g>
      {/* глаза во тьме */}
      {Array.from({ length: 40 }).map((_, i) => { const x = h1(i) * 1080, y = 900 + h1(i * 3) * 800, s = .5 + h1(i * 7) * 1.2, on = ease(tt, h1(i * 5) * 1.2, h1(i * 5) * 1.2 + .2), bl = Math.floor(t * 2 + i) % 7 === 0 ? .1 : 1;
        return <g key={i} opacity={on * bl}><ellipse cx={x - 12 * s} cy={y} rx={7 * s} ry={4 * s} fill="#ffcf3a" filter="url(#glow)" /><ellipse cx={x + 12 * s} cy={y} rx={7 * s} ry={4 * s} fill="#ffcf3a" filter="url(#glow)" /></g>; })}
      <Upyr x={220} y={1800} s={.9} t={t} seed={1} /><Upyr x={880} y={1830} s={1.0} t={t} flip seed={2} attack={.3 + .3 * Math.sin(t * 3)} />
    </g>
    <Tag t={t} t0={1.2} text="ПОДЗЕМЕЛЬЕ" y={330} />
  </Frame>;
};

// l3: прорыв — твари выходят из Врат на улицу, люди бегут, мигалки
export const L3: React.FC<SP> = ({ t }) => {
  const [sx, sy] = shakeXY(t, [[.3, 10, .6], [1.6, 12, .6]]); const siren = Math.floor(t * 4) % 2;
  return <Frame t={t} grade="#3a1a20" gradeK={.15}>
    <g transform={cam(1.05 + t * .02, 540, 1100, sx, sy)}>
      <Sky top="#1a0a14" bot="#5a2020" id="l3" />
      <Panelka x={-60} y={1250} w={360} floors={14} seed={11} /><Panelka x={790} y={1250} w={380} floors={15} seed={12} />
      <Vysotka x={560} y={1150} s={.45} seed={5} lit={.1} />
      <Gate x={540} y={1000} s={.75} t={t} color="#ff4a4a" />
      <rect y={1250} width={1080} height={700} fill="#1a1418" />
      <ellipse cx={540} cy={1250} rx={600} ry={200} fill="#ff5a2a" opacity={.25} filter="url(#blur30)" />
      {/* перевёрнутая машина и огонь */}
      <g transform="translate(820 1500) rotate(160)"><rect x={-120} y={-40} width={240} height={80} rx={20} fill="#3a4a6a" stroke="#0c0d18" strokeWidth={5} /><circle cx={-70} cy={45} r={26} fill="#111" /><circle cx={70} cy={45} r={26} fill="#111" /></g>
      <Smoke t={t} t0={-1} x={820} y={1460} n={10} r={120} spread={120} color="#2a1a1a" life={2.4} rise={300} k={.7} seed={4} />
      <ellipse cx={820} cy={1440} rx={70} ry={90} fill="#ffb040" opacity={.7} filter="url(#blur12)" />
      {[0, 1, 2, 3].map(i => { const q = ease(t, .2 + i * .35, 2.6 + i * .35); return <Upyr key={i} x={540 + (i - 1.5) * 160 * q} y={1100 + q * 650} s={.35 + q * .75} t={t} seed={i + 3} attack={.4} flip={i % 2 === 0} />; })}
      {[0, 1, 2].map(i => <Figure key={i} x={140 + i * 60 - t * 120} y={1880 - i * 30} s={.55} t={t} L={LK[['r1', 'r2', 'pB'][i]]} C={CS[['pA', 'pD', 'pE'][i]]} pose={walkPose(t * 600 + i * 90, true)} seed={80 + i} expr="scared" turn={-.6} opacity={.85} />)}
      <rect width={1080} height={1920} fill={siren ? '#ff2030' : '#2040ff'} opacity={.08} style={{ mixBlendMode: 'screen' }} />
    </g>
    <Tag t={t} t0={1.0} text="ПРОРЫВ" y={330} c="#ff4a5a" />
  </Frame>;
};

// l4: проснулись охотники — у людей загораются глаза, в руке вспыхивает синее пламя
export const L4: React.FC<SP> = ({ t }) => {
  const ign = ease(t, .8, 1.4);
  return <Frame t={t} grade="#102040" gradeK={.15}>
    <rect width={1080} height={1920} fill="#05070f" />
    <ellipse cx={540} cy={1000} rx={700} ry={900} fill="#1a3a8a" opacity={.4 * ign} filter="url(#blur30)" />
    <g transform={cam(1.0 + t * .04, 540, 1100)}>
      {['r2', 'mikh', 'zhora'].map((k, i) => <Figure key={k} x={[260, 540, 820][i]} y={1800} s={[.9, 1.05, .95][i]} t={t} L={LK[k]} C={CS[['pD', 'pA', 'pC'][i]]} pose={i === 1 ? { ...POSES.stand, armR: [120 * ign, -30 * ign] } : POSES.stand} seed={90 + i} glow={ease(t, .3 + i * .25, .6 + i * .25)} expr="determined" rim="#5fd2ff" />)}
      <circle cx={540 + 150} cy={1800 - 640 * 1.05 - 40} r={60 * ign} fill="#5fd2ff" filter="url(#glowBig)" opacity={ign} />
      <Motes t={t} x={540} y={1900} w={1100} h={1400} n={50} color="#7fe0ff" speed={140} k={ign} />
    </g>
    <Tag t={t} t0={1.0} text="ОХОТНИКИ" y={330} />
  </Frame>;
};
