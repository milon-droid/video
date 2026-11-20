// Твари и статуи: упырь, каменный гусляр/звонарь, Идол, солдат-тень, силуэт «в поклоне» (вид сбоку).
import React from 'react';
import { noise } from '../anim';
import { INK } from './head';

// упырь: серый, сутулый, длинные руки с когтями, светящиеся глаза, пасть. attack 0..1 — замах лапой
export const Upyr: React.FC<{ x: number; y: number; s?: number; t: number; attack?: number; dead?: number; flip?: boolean; seed?: number }> = ({ x, y, s = 1, t, attack = 0, dead = 0, flip, seed = 1 }) => {
  const br = Math.sin(t * 3 + seed) * 4, sk = '#7a8478', sh = '#4a5448';
  const armA = -30 - attack * 120;
  return <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s}) rotate(${dead * -80})`} opacity={1 - dead * .3}>
    <ellipse cx={0} cy={4} rx={120} ry={16} fill="#000" opacity={.35} />
    <path d="M-50 0 L-60 -180 L-30 -200 L-20 -60 L-6 0Z" fill={sh} stroke={INK} strokeWidth={4} /><path d="M50 0 L60 -180 L30 -200 L20 -60 L6 0Z" fill={sk} stroke={INK} strokeWidth={4} />
    <path d={`M-70 -190 C-90 -320 -40 ${-420 + br} 30 ${-430 + br} C90 -420 110 -320 80 -190Z`} fill={sk} stroke={INK} strokeWidth={4} />
    {[0, 1, 2].map(i => <path key={i} d={`M-30 ${-300 + i * 34} q40 10 80 0`} stroke={sh} strokeWidth={5} fill="none" />)}
    <g transform={`translate(60 ${-400 + br}) rotate(${armA})`}><path d="M-14 0 L-10 220 L10 220 L14 0Z" fill={sk} stroke={INK} strokeWidth={4} />{[-10, 0, 10].map((c, i) => <path key={i} d={`M${c} 218 l${c * .6} 50 l6 -48`} fill="#e8e0c8" stroke={INK} strokeWidth={2} />)}</g>
    <g transform={`translate(-60 ${-400 + br}) rotate(${20 + Math.sin(t * 2) * 6})`}><path d="M-14 0 L-10 220 L10 220 L14 0Z" fill={sh} stroke={INK} strokeWidth={4} /></g>
    {/* голова */}
    <g transform={`translate(40 ${-450 + br}) rotate(${10 + noise('up' + seed, t, 2) * 8})`}>
      <path d="M-60 0 C-66 -70 -20 -100 20 -96 C60 -90 76 -50 64 10 C50 50 -40 60 -60 0Z" fill={sk} stroke={INK} strokeWidth={4} />
      <path d="M-40 10 L50 10 L30 50 L-20 50Z" fill="#2a0a0a" stroke={INK} strokeWidth={3} />
      {[-30, -14, 2, 18, 34].map((xx, i) => <path key={i} d={`M${xx} 10 l6 14 l6 -14`} fill="#e8e0c8" />)}
      {[-22, 26].map((xx, i) => <g key={i}><ellipse cx={xx} cy={-30} rx={13} ry={9} fill="#ffcf3a" filter="url(#glow)" /><ellipse cx={xx} cy={-30} rx={3} ry={8} fill="#000" /></g>)}
    </g>
  </g>;
};

// каменный музыкант: гусляр (на коленях гусли) или звонарь (с колоколом). headTurn — поворот головы (−1..1), bow 0..1 — наклон головы, glow — глаза
export const Statue: React.FC<{ x: number; y: number; s?: number; t: number; kind?: 'gusli' | 'bell'; headTurn?: number; bow?: number; glow?: number; dark?: number }> = ({ x, y, s = 1, t, kind = 'gusli', headTurn = 0, bow = 0, glow = 0, dark = 0 }) => {
  const st = '#7a7068', ss = '#4a423c';
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-120} y={-80} width={240} height={80} fill={ss} stroke={INK} strokeWidth={4} />
    <path d="M-100 -80 C-110 -200 -80 -330 0 -340 C80 -330 110 -200 100 -80Z" fill={st} stroke={INK} strokeWidth={4} />
    <path d="M30 -330 C80 -300 104 -200 100 -80 L40 -80Z" fill={ss} opacity={.6} />
    {kind === 'gusli' ? <g><path d="M-110 -150 L110 -190 L100 -120 L-100 -100Z" fill="#6a5a48" stroke={INK} strokeWidth={4} />{[0, 1, 2, 3, 4].map(i => <line key={i} x1={-90} y1={-112 - i * 8} x2={96} y2={-140 - i * 9} stroke="#2a2420" strokeWidth={2} />)}</g>
      : <g><path d="M-30 -260 Q-36 -180 -70 -150 L70 -150 Q36 -180 30 -260Z" fill="#6a6058" stroke={INK} strokeWidth={4} /><circle cx={0} cy={-140} r={10} fill={ss} /></g>}
    <g transform={`translate(0 -360) rotate(${bow * 40}) translate(${headTurn * 20} 0)`}>
      <path d="M-50 0 C-56 -70 -20 -96 0 -96 C30 -96 56 -70 50 0 C40 40 -40 40 -50 0Z" fill={st} stroke={INK} strokeWidth={4} />
      <path d="M-56 -60 Q0 -110 56 -60 L50 -40 Q0 -76 -50 -40Z" fill={ss} stroke={INK} strokeWidth={3} />
      {[-20, 20].map((xx, i) => <g key={i}><ellipse cx={xx + headTurn * 14} cy={-20} rx={10} ry={5} fill={glow > 0 ? '#ff2a3a' : '#2a2420'} filter={glow > 0 ? 'url(#glow)' : undefined} opacity={glow > 0 ? glow : 1} /></g>)}
      <path d={`M${-12 + headTurn * 14} 14 Q${headTurn * 14} 20 ${12 + headTurn * 14} 14`} stroke="#2a2420" strokeWidth={4} fill="none" />
    </g>
    {dark > 0 && <rect x={-130} y={-480} width={260} height={480} fill="#000" opacity={dark} />}
  </g>;
};

// Идол: гигантская сидячая статуя (начало — центр основания трона). smile 0..1 шире, eyes 0..1 алое свечение, turn — поворот головы
export const Idol: React.FC<{ x: number; y: number; s?: number; t: number; smile?: number; eyes?: number; turn?: number; lit?: number; crack?: number }> = ({ x, y, s = 1, t, smile = 0, eyes = 0, turn = 0, lit = 1 }) => {
  const st = lit > .5 ? '#8a7e70' : '#4a4a5a', ss = lit > .5 ? '#5a5048' : '#2a2a38', tx = turn * 40;
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* трон */}
    <rect x={-420} y={-700} width={840} height={700} fill={ss} stroke={INK} strokeWidth={6} />
    <rect x={-460} y={-760} width={920} height={70} fill={st} stroke={INK} strokeWidth={6} />
    {/* колени и руки */}
    <path d="M-340 -300 C-360 -520 -200 -600 -60 -560 L-60 -300Z" fill={st} stroke={INK} strokeWidth={6} /><path d="M340 -300 C360 -520 200 -600 60 -560 L60 -300Z" fill={ss} stroke={INK} strokeWidth={6} />
    <rect x={-300} y={-300} width={600} height={300} fill={st} stroke={INK} strokeWidth={6} />
    {/* торс */}
    <path d="M-280 -560 C-300 -900 -200 -1180 0 -1200 C200 -1180 300 -900 280 -560Z" fill={st} stroke={INK} strokeWidth={6} />
    <path d="M60 -1190 C200 -1150 290 -900 280 -560 L80 -560Z" fill={ss} opacity={.6} />
    <path d="M-330 -620 C-380 -800 -300 -1000 -240 -1060 L-200 -980 C-250 -880 -280 -760 -250 -620Z" fill={st} stroke={INK} strokeWidth={6} />
    <path d="M330 -620 C380 -800 300 -1000 240 -1060 L200 -980 C250 -880 280 -760 250 -620Z" fill={ss} stroke={INK} strokeWidth={6} />
    {/* голова */}
    <g transform={`translate(0 -1340) rotate(${turn * 12})`}>
      <path d="M-170 40 C-190 -140 -110 -230 0 -232 C110 -230 190 -140 170 40 C150 150 60 200 0 200 C-60 200 -150 150 -170 40Z" fill={st} stroke={INK} strokeWidth={6} />
      <path d="M-200 -110 L-150 -250 L-60 -200 L0 -290 L60 -200 L150 -250 L200 -110 L140 -150 L0 -130 L-140 -150Z" fill={ss} stroke={INK} strokeWidth={6} />
      {/* глаза-провалы */}
      {[-70, 70].map((ex, i) => <g key={i}><ellipse cx={ex + tx} cy={-30} rx={40} ry={22} fill="#0a0808" />
        {eyes > 0 && <g><ellipse cx={ex + tx} cy={-30} rx={30} ry={14} fill="#ff2030" opacity={eyes} /><ellipse cx={ex + tx} cy={-30} rx={90} ry={60} fill="#ff1020" opacity={eyes * .55} filter="url(#blur30)" /><ellipse cx={ex + tx} cy={-30} rx={10} ry={6} fill="#fff" opacity={eyes} /></g>}</g>)}
      <path d={`M${tx - 10} 0 L${tx - 24} 60 L${tx + 16} 62`} stroke={INK} strokeWidth={5} fill="none" />
      {/* улыбка */}
      <path d={`M${-80 - smile * 40 + tx} 100 Q${tx} ${150 + smile * 40} ${80 + smile * 40 + tx} 100`} stroke={INK} strokeWidth={8} fill={smile > .3 ? '#1a0a0a' : 'none'} />
      {smile > .3 && <path d={`M${-70 - smile * 30 + tx} 108 Q${tx} ${130 + smile * 20} ${70 + smile * 30 + tx} 108`} stroke="#d8d0c0" strokeWidth={6} fill="none" />}
    </g>
  </g>;
};

// солдат-тень: силуэт в шлеме, синие глаза, клубы чёрного дыма снизу. rise 0..1 — поднимается из земли
export const ShadowSoldier: React.FC<{ x: number; y: number; s?: number; t: number; rise?: number; seed?: number; kind?: number }> = ({ x, y, s = 1, t, rise = 1, seed = 1, kind = 0 }) => {
  const sw = noise('ss' + seed, t, .8) * 6, h = 760 * rise;
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <defs><clipPath id={'sc' + seed}><rect x={-300} y={-900} width={600} height={900} /></clipPath></defs>
    <g clipPath={`url(#sc${seed})`}><g transform={`translate(0 ${760 - h})`}>
      <path d={`M-90 0 L-110 -320 C-130 -460 -100 -560 0 -580 C100 -560 130 -460 110 -320 L90 0Z`} fill="#05060c" />
      <path d={`M-150 -500 L-90 -560 L-60 -400Z`} fill="#05060c" /><path d={`M150 -500 L90 -560 L60 -400Z`} fill="#05060c" />
      {kind === 1 && <path d={`M120 -540 L${140 + sw} -900 L${150 + sw} -900 L132 -540Z`} fill="#0a0c18" stroke="#4ac8ff" strokeWidth={2} opacity={.8} />}
      <path d="M-60 -580 C-70 -680 -30 -720 0 -720 C30 -720 70 -680 60 -580 L40 -560 L-40 -560Z" fill="#05060c" />
      {kind !== 1 && <path d="M0 -720 L-8 -790 L8 -790Z" fill="#05060c" />}
      {[-20, 20].map((ex, i) => <ellipse key={i} cx={ex} cy={-640} rx={12} ry={5} fill="#7fe8ff" filter="url(#glow)" />)}
      <path d={`M-110 -320 C-130 -460 -100 -560 0 -580`} stroke="#4a8aff" strokeWidth={3} fill="none" opacity={.6} filter="url(#glow)" />
    </g></g>
    <ellipse cx={0} cy={-10} rx={200} ry={50} fill="#05060c" opacity={.85} filter="url(#blur12)" />
  </g>;
};

// силуэт человека на коленях в поклоне (вид сбоку): bow 0 — стоит на коленях прямо, 1 — лбом в пол
export const BowFigure: React.FC<{ x: number; y: number; s?: number; bow: number; flip?: boolean; color?: string; rim?: string }> = ({ x, y, s = 1, bow, flip, color = '#0c0a12', rim = '#ff3a4a' }) => {
  const a = bow * 78 * Math.PI / 180, hip = [-80, -110], L = 230;
  const sh = [hip[0] + Math.sin(a) * L, hip[1] - Math.cos(a) * L], hd = [sh[0] + Math.sin(a + .15) * 85, sh[1] - Math.cos(a + .15) * 85];
  const hand = [sh[0] + 90 + bow * 120, Math.min(-14, sh[1] + 150 + bow * 40)];
  const ln = (p: number[], q: number[], w: number, c = color) => <path d={`M${p[0]} ${p[1]} L${q[0]} ${q[1]}`} stroke={c} strokeWidth={w} strokeLinecap="round" />;
  return <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s})`}>
    <ellipse cx={0} cy={4} rx={220} ry={18} fill="#000" opacity={.5} />
    {ln([-150, -22], [70, -30], 56)}{ln(hip, [70, -40], 74)}
    {ln(hip, sh, 110)}{ln(sh, hand, 40)}
    <circle cx={hd[0]} cy={hd[1]} r={58} fill={color} />
    <path d={`M${hip[0] - 40 * Math.cos(a)} ${hip[1] - 40 * Math.sin(a) - 10} L${sh[0] - 50 * Math.cos(a)} ${sh[1] - 50 * Math.sin(a)}`} stroke={rim} strokeWidth={5} opacity={.85} filter="url(#glow)" strokeLinecap="round" />
    <path d={`M${hd[0] - 50} ${hd[1] - 25} A58 58 0 0 1 ${hd[0] + 45} ${hd[1] - 38}`} stroke={rim} strokeWidth={5} fill="none" opacity={.85} filter="url(#glow)" />
  </g>;
};

// безликий пассажир: сидит, голова-овал без лица; look −1..1 — поворот головы к бегущему, rise 0..1 — тянется вперёд, руки длиннеют
export const Passenger: React.FC<{ x: number; y: number; s?: number; t: number; look?: number; rise?: number; seed?: number; coat?: string }> = ({ x, y, s = 1, t, look = 0, rise = 0, seed = 1, coat = '#3a3a44' }) => {
  const br = Math.sin(t * 1.3 + seed) * 1.5, lean = rise * 30;
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-60 0 L-50 -110 L50 -110 L60 0Z" fill="#141418" />
    <g transform={`rotate(${lean} 0 -110)`}>
      <path d={`M-62 -110 C-70 -200 -50 -260 0 -268 C50 -260 70 -200 62 -110Z`} fill={coat} stroke={INK} strokeWidth={4} />
      <path d={`M-50 -230 L${-70 - rise * 60} ${-140 + rise * 80} L${-56 - rise * 70} ${-120 + rise * 100}`} stroke={coat} strokeWidth={26} strokeLinecap="round" fill="none" />
      <path d={`M50 -230 L${70 + rise * 60} ${-140 + rise * 80} L${56 + rise * 70} ${-120 + rise * 100}`} stroke={coat} strokeWidth={26} strokeLinecap="round" fill="none" />
      <g transform={`translate(${look * 10} ${-310 + br}) rotate(${look * 35})`}>
        <ellipse rx={38} ry={48} fill="#c8c4bc" stroke={INK} strokeWidth={4} />
        <ellipse cx={look * 12} cy={4} rx={26} ry={34} fill="#b0aca4" opacity={.6} />
        {rise > .3 && <ellipse cx={look * 14} cy={12} rx={8 * rise} ry={14 * rise} fill="#1a0a0a" />}
      </g>
    </g>
  </g>;
};

// Машинист: высокий, в старой форме метрополитена, вместо головы — фонарь (свет k)
export const Machinist: React.FC<{ x: number; y: number; s?: number; t: number; k?: number; turn?: number }> = ({ x, y, s = 1, t, k = 1, turn = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-90 0 L-80 -520 L80 -520 L90 0Z" fill="#1a2030" stroke={INK} strokeWidth={5} />
    <path d="M-80 -520 L-120 -300 L-100 -100" stroke="#1a2030" strokeWidth={46} strokeLinecap="round" fill="none" />
    <path d="M80 -520 L120 -300 L100 -100" stroke="#1a2030" strokeWidth={46} strokeLinecap="round" fill="none" />
    {[-460, -400, -340, -280].map((yy, i) => <circle key={i} cx={0} cy={yy} r={7} fill="#c8a85a" />)}
    <rect x={-60} y={-500} width={40} height={10} fill="#c8a85a" /><path d="M-80 -520 L0 -470 L80 -520" stroke="#2a3248" strokeWidth={8} fill="none" />
    <g transform={`translate(${turn * 20} -600)`}>
      <rect x={-70} y={-80} width={140} height={150} rx={20} fill="#2a2a30" stroke={INK} strokeWidth={5} />
      <circle cx={0} cy={0} r={52} fill="#fff6d8" opacity={k} />
      <circle cx={0} cy={0} r={170} fill="#fff0c0" opacity={.35 * k} filter="url(#blur30)" />
      <rect x={-80} y={-100} width={160} height={24} rx={6} fill="#1a1a20" /><rect x={-50} y={-120} width={100} height={22} fill="#1a1a20" />
      <circle cx={0} cy={-108} r={10} fill="#c8a85a" />
    </g>
  </g>
);
