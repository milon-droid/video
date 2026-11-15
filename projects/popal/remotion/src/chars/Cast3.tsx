// Серия 3: Рыцарь смерти, ворота замка Короля (высокая декорация 1080×3200), яичница, карта.
import React from 'react';
import { clamp, lerp } from '../anim';
import { Glow, Motes } from '../bg/Bg';

const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const TEAL = '#5affd9';
// кисть рыцаря в его координатах при вытянутой руке (reach 0…1) — чтобы «посадить» в неё пленника
export const knightHand = (reach: number): [number, number] => [lerp(-215, -520, reach), lerp(-430, -700, reach)];
// ───── Рыцарь смерти: рост ≈ 1000 при s=1, начало координат — между ступнями; смотрит влево ─────
export const DeathKnight: React.FC<{ x: number; y: number; s?: number; t: number; reach?: number; step?: number; glow?: number; sword?: boolean }> = ({ x, y, s = 1, t, reach = 0, step = 0, glow = 1, sword = true }) => {
  const br = Math.sin(t * 1.4) * 5, fl = .75 + .25 * Math.sin(t * 6), [hx, hy] = knightHand(reach), el: [number, number] = [lerp(-250, -330, reach), lerp(-600, -720, reach)];
  const cape = (i: number) => Math.sin(t * 1.8 + i) * 14;
  return (<g transform={`translate(${x},${y}) scale(${s})`}>
    <ellipse cx={0} cy={6} rx={300} ry={34} fill="#000" opacity={.45} />
    {/* плащ: рваный низ, колышется */}
    <path d={`M-190,-800 L190,-800 L${290 + cape(0)},-60 L${220 + cape(1)},-130 L${160 + cape(2)},-30 L${90 + cape(3)},-120 L${20 + cape(4)},-20 L${-60 + cape(5)},-120 L${-140 + cape(6)},-30 L${-220 + cape(7)},-130 L${-290 + cape(8)},-60 Z`} fill="#2a0a2e" />
    <path d={`M-150,-780 L150,-780 L${200 + cape(1)},-160 L${-200 + cape(6)},-160 Z`} fill="#3d1040" opacity={.7} />
    {/* меч за спиной: рукоять над плечом */}
    {sword && <g transform="rotate(24 120 -700)"><rect x={104} y={-1120} width={34} height={760} fill="#8a90a8" /><rect x={117} y={-1120} width={8} height={760} fill="#c8d0e8" /><rect x={50} y={-380} width={142} height={30} rx={10} fill="#3a3448" /><rect x={106} y={-350} width={30} height={120} rx={8} fill="#1c1a26" /><circle cx={121} cy={-220} r={22} fill={TEAL} opacity={fl} /></g>}
    {/* ноги */}
    {[-1, 1].map(sd => { const lift = sd === -1 ? step : 0; return (<g key={sd} transform={`translate(${sd * 92},${-lift * 40})`}>
      <path d="M-62,-400 L62,-400 L52,-150 L-52,-150 Z" fill="#1c1a26" /><path d="M-56,-170 L56,-170 L64,-20 L-64,-20 Z" fill="#262336" /><ellipse cx={0} cy={-168} rx={62} ry={34} fill="#34304a" />
      <path d="M-74,-30 L74,-30 L96,0 L-96,0 Z" fill="#14121c" /><path d="M-40,-380 L-28,-190" stroke="#4a4466" strokeWidth={10} strokeLinecap="round" /></g>); })}
    <g transform={`translate(0,${br})`}>
      {/* торс */}
      <path d="M-200,-800 L200,-800 L150,-390 L-150,-390 Z" fill="#1c1a26" /><path d="M-170,-780 L-60,-780 L-90,-420 L-130,-420 Z" fill="#34304a" opacity={.8} />
      <path d="M-160,-430 L160,-430 L176,-370 L-176,-370 Z" fill="#3a3448" /><rect x={-34} y={-440} width={68} height={76} rx={10} fill="#14121c" /><circle cx={0} cy={-402} r={18} fill={TEAL} opacity={fl * glow} />
      {/* череп быка на груди */}
      <g transform="translate(0,-640)"><path d="M-40,-20 C-90,-36 -118,-80 -118,-116 C-96,-78 -70,-58 -34,-50 Z M40,-20 C90,-36 118,-80 118,-116 C96,-78 70,-58 34,-50 Z" fill="#cfc4a8" /><path d="M-36,-58 Q0,-72 36,-58 L28,30 Q0,52 -28,30 Z" fill="#cfc4a8" /><ellipse cx={-14} cy={-20} rx={9} ry={12} fill="#14121c" /><ellipse cx={14} cy={-20} rx={9} ry={12} fill="#14121c" /></g>
      {/* дальняя рука (левая для зрителя — правая сторона кадра) */}
      <path d="M190,-770 L262,-760 L250,-470 L196,-470 Z" fill="#262336" /><circle cx={224} cy={-450} r={44} fill="#14121c" />
      {/* наплечники с шипами */}
      {[-1, 1].map(sd => <g key={sd} transform={`translate(${sd * 210},-800) scale(${sd},1)`}><path d="M-110,10 Q-20,-110 110,-30 L96,60 Q0,20 -100,70 Z" fill="#34304a" /><path d="M-90,30 Q-10,-70 96,-14" stroke="#5a5478" strokeWidth={10} fill="none" />
        <path d="M-20,-62 L4,-150 L30,-58 Z M50,-44 L92,-118 L98,-30 Z" fill="#14121c" /></g>)}
      {/* ближняя рука: плечо → локоть → кисть-латная рукавица */}
      <path d={`M-200,-770 L${el[0]},${el[1]}`} stroke="#262336" strokeWidth={96} strokeLinecap="round" /><path d={`M${el[0]},${el[1]} L${hx},${hy}`} stroke="#1c1a26" strokeWidth={84} strokeLinecap="round" />
      <circle cx={el[0]} cy={el[1]} r={52} fill="#34304a" />
      <g transform={`translate(${hx},${hy})`}><circle r={58} fill="#14121c" /><path d="M-52,-20 L-84,-34 M-56,4 L-92,2 M-50,28 L-82,40" stroke="#14121c" strokeWidth={22} strokeLinecap="round" /><circle r={58} fill="none" stroke={TEAL} strokeWidth={5} opacity={.5 * glow} /></g>
      {/* шлем: рога, прорезь */}
      <g transform="translate(0,-880)"><path d="M-70,-60 C-170,-80 -210,-190 -180,-270 C-160,-180 -120,-130 -52,-110 Z M70,-60 C170,-80 210,-190 180,-270 C160,-180 120,-130 52,-110 Z" fill="#14121c" />
        <path d="M-92,60 L-96,-70 Q0,-170 96,-70 L92,60 Q0,110 -92,60 Z" fill="#262336" /><path d="M-80,-60 Q-30,-130 20,-140 L0,40 L-84,50 Z" fill="#3a3650" opacity={.8} /><path d="M0,-150 L18,-40 L0,90 L-18,-40 Z" fill="#14121c" />
        <path d="M-78,-34 L-14,-14 L-14,6 L-78,-8 Z M78,-34 L14,-14 L14,6 L78,-8 Z" fill={TEAL} opacity={fl * glow} /><Glow x={0} y={-14} r={150} c={TEAL} o={.35 * glow} id={`dk${Math.round(x)}`} /></g>
    </g>
  </g>); };

// ───── Ворота замка Короля: высокая декорация 1080×3200 (смотреть через сдвиг по y); open 0…1 — створки расходятся ─────
export const GateWorld: React.FC<{ t: number; open?: number; dawn?: number }> = ({ t, open = 0, dawn = 1 }) => { const gx = 540, top = 1560, bot = 2960, hw = 330, o = clamp(open);
  return (<g>
    <defs><linearGradient id="gwS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1a0408" /><stop offset=".35" stopColor="#6a0e14" /><stop offset=".7" stopColor="#c8381a" /><stop offset="1" stopColor="#ff8a3a" /></linearGradient>
      <linearGradient id="gwW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1c0a10" /><stop offset="1" stopColor="#3a1418" /></linearGradient>
      <linearGradient id="gwL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ff3a2a" /><stop offset="1" stopColor="#ffd26a" /></linearGradient></defs>
    <rect width={1080} height={3300} fill="url(#gwS)" />
    <circle cx={800} cy={300} r={120} fill="#ff5a3a" opacity={.9} /><Glow x={800} y={300} r={380} c="#ff3a1a" o={.5} id="gwMoon" />
    {[0, 1, 2, 3, 4].map(i => <ellipse key={i} cx={(i * 290 + t * 14) % 1400 - 160} cy={160 + i * 130} rx={220} ry={34} fill="#2a060a" opacity={.55} />)}
    {/* башни */}
    {[[60, 620, 190], [300, 420, 170], [780, 420, 170], [1020, 620, 190]].map(([x, y, w], i) => <g key={i}><rect x={x - w / 2} y={y} width={w} height={1200} fill="#12060a" /><path d={`M${x - w / 2 - 20},${y} L${x},${y - 260} L${x + w / 2 + 20},${y} Z`} fill="#0a0306" />
      <rect x={x - 18} y={y + 120} width={36} height={70} rx={18} fill="#ff7a2a" opacity={.7 + .3 * Math.sin(t * 3 + i)} /><rect x={x - 18} y={y + 420} width={36} height={70} rx={18} fill="#ff7a2a" opacity={.5 + .3 * Math.sin(t * 2 + i * 2)} /></g>)}
    {/* стена с зубцами */}
    <rect x={-20} y={1240} width={1120} height={1760} fill="url(#gwW)" />{Array.from({ length: 10 }, (_, i) => <rect key={i} x={i * 116 - 20} y={1170} width={70} height={80} fill="#1c0a10" />)}
    {Array.from({ length: 26 }, (_, i) => <rect key={i} x={(i * 173) % 1040} y={1300 + ((i * 97) % 1560)} width={120} height={44} rx={6} fill="#000" opacity={.16} />)}
    {/* череп быка над воротами */}
    <g transform={`translate(${gx},1180) scale(2.7)`}><Glow x={0} y={-30} r={170} c="#ff2a2a" o={.5} id="gwSk" /><path d="M-60,-30 C-130,-50 -170,-110 -170,-160 C-140,-110 -100,-80 -50,-70 Z M60,-30 C130,-50 170,-110 170,-160 C140,-110 100,-80 50,-70 Z" fill="#e8dcc0" />
      <path d="M-50,-80 Q0,-100 50,-80 L40,40 Q0,70 -40,40 Z" fill="#e8dcc0" /><path d="M-50,-80 Q-20,-92 0,-92 L0,58 Q-22,56 -40,40 Z" fill="#fff" opacity={.2} /><ellipse cx={-20} cy={-30} rx={12} ry={16} fill="#ff3a1a" opacity={.7 + .3 * Math.sin(t * 4)} /><ellipse cx={20} cy={-30} rx={12} ry={16} fill="#ff3a1a" opacity={.7 + .3 * Math.sin(t * 4)} /></g>
    {/* арка и проём */}
    <path d={`M${gx - hw - 60},${bot} L${gx - hw - 60},${top + 300} Q${gx},${top - 220} ${gx + hw + 60},${top + 300} L${gx + hw + 60},${bot} Z`} fill="#0a0306" />
    <clipPath id="gwC"><path d={`M${gx - hw},${bot} L${gx - hw},${top + 310} Q${gx},${top - 150} ${gx + hw},${top + 310} L${gx + hw},${bot} Z`} /></clipPath>
    <g clipPath="url(#gwC)"><rect x={gx - hw} y={top - 200} width={hw * 2} height={bot - top + 200} fill="url(#gwL)" opacity={.25 + o * .75} /><rect x={gx - hw} y={top - 200} width={hw * 2} height={bot - top + 200} fill="#14060a" opacity={.55} />
      {o > 0 && <><Glow x={gx} y={bot - 500} r={700} c="#ff5a2a" o={o * .8} id="gwIn" /><path d={`M${gx - hw * o},${bot} L${gx - 40},${top} L${gx + 40},${top} L${gx + hw * o},${bot} Z`} fill="#ffb04a" opacity={.25 * o} /></>}
      {[-1, 1].map(sd => <g key={sd} transform={`translate(${gx + sd * hw * o * .92},0)`}>
        <g transform={`translate(${sd < 0 ? -hw : 0},0)`}><rect x={0} y={top - 200} width={hw} height={bot - top + 200} fill="#2a1416" /><rect x={sd < 0 ? hw - 14 : 0} y={top - 200} width={14} height={bot - top + 200} fill="#14060a" />{[0, 1, 2, 3, 4].map(i => <rect key={i} x={10} y={top + 120 + i * 260} width={hw - 20} height={26} fill="#5a4a3a" />)}{Array.from({ length: 12 }, (_, i) => <circle key={i} cx={40 + (i % 3) * 120} cy={top + 240 + Math.floor(i / 3) * 300} r={16} fill="#8a7a5a" />)}
          <circle cx={sd < 0 ? hw - 50 : 50} cy={bot - 620} r={46} fill="none" stroke="#c9a040" strokeWidth={14} /></g></g>)}</g>
    {/* факелы у ворот */}
    {[-1, 1].map(sd => <g key={sd} transform={`translate(${gx + sd * 470},${bot - 520})`}><rect x={-12} y={0} width={24} height={150} fill="#3a2a22" /><path d={`M-34,6 Q${Math.sin(t * 9 + sd) * 12},${-130 - Math.sin(t * 7) * 20} 34,6 Z`} fill="#ff8a2a" /><path d={`M-18,6 Q${Math.sin(t * 11 + sd) * 8},-70 18,6 Z`} fill="#ffe27a" /><Glow x={0} y={-40} r={260} c="#ff7a2a" o={.55} id={`gwT${sd}`} /></g>)}
    {/* земля, трещины с лавой */}
    <path d={`M-20,${bot} L1100,${bot} L1100,3320 L-20,3320 Z`} fill="#1a0a0c" /><path d={`M${gx - hw},${bot} L${gx + hw},${bot} L${gx + hw + 160},3320 L${gx - hw - 160},3320 Z`} fill="#2a1416" />
    <path d={`M60,${bot + 90} l110,40 l80,-30 l120,60 M820,${bot + 60} l90,50 l100,-20`} stroke="#ff6a1a" strokeWidth={10} fill="none" opacity={.6 + .3 * Math.sin(t * 3)} />
    <Motes n={34} t={t} c="#ffb04a" seed={41} area={[0, 1500, 1080, 1700]} vy={-70} size={7} />
    {dawn > 0 && <rect width={1080} height={3300} fill="#ff9a5a" opacity={.06 * dawn} />}
  </g>); };

// ───── яичница (желток с бликом) — рисуется поверх сковороды или тарелки ─────
export const FriedEgg: React.FC<{ x: number; y: number; s?: number; k?: number; t?: number }> = ({ x, y, s = 1, k = 1, t = 0 }) => k <= 0 ? null : (<g transform={`translate(${x},${y}) scale(${s * k})`}>
  <path d={`M-70,-10 C-80,-60 -20,-74 14,-56 C60,-76 96,-30 78,10 C96,50 40,76 0,58 C-50,78 -94,40 -70,-10 Z`} fill="#fffaf0" /><path d="M-50,-6 C-56,-40 -14,-52 10,-40" stroke="#fff" strokeWidth={8} fill="none" opacity={.8} />
  <circle cx={4} cy={2 + Math.sin(t * 9) * 1.5} r={30} fill="#ffb020" /><circle cx={-6} cy={-8} r={9} fill="#ffe9a0" /></g>);
export const Steam: React.FC<{ x: number; y: number; t: number; n?: number; k?: number; id: string }> = ({ x, y, t, n = 5, k = 1, id }) => (<g opacity={k}><defs><radialGradient id={id}><stop offset="0" stopColor="#fff" stopOpacity=".7" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient></defs>
  {Array.from({ length: n }, (_, i) => { const q = (t * .5 + i / n) % 1; return <circle key={i} cx={x + Math.sin(t * 2 + i * 1.7) * 40 + (hash(i) - .5) * 120} cy={y - q * 340} r={40 + q * 70} fill={`url(#${id})`} opacity={1 - q} />; })}</g>);

// ───── карта «короткий путь»: пергамент 760×520, начало — центр ─────
export const MapCard: React.FC<{ x: number; y: number; s?: number; t: number; k?: number; rot?: number }> = ({ x, y, s = 1, t, k = 1, rot = -4 }) => k <= 0 ? null : (<g transform={`translate(${x},${y}) rotate(${rot}) scale(${s * k})`}>
  <rect x={-384} y={-254} width={768} height={520} rx={18} fill="#000" opacity={.35} /><rect x={-380} y={-260} width={760} height={520} rx={18} fill="#ecd9a8" /><rect x={-380} y={-260} width={760} height={520} rx={18} fill="none" stroke="#8a6a3a" strokeWidth={10} />
  <rect x={-380} y={-260} width={36} height={520} rx={18} fill="#c9a86a" /><rect x={344} y={-260} width={36} height={520} rx={18} fill="#c9a86a" />
  {/* лес эльфиек → болото → замок */}
  {[-290, -240, -200].map((tx, i) => <path key={i} d={`M${tx},150 l26,-70 l26,70 Z`} fill="#2f7a52" />)}<text x={-250} y={205} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={30} fill="#3a2a18">ВЫ ТУТ</text>
  <path d="M-200,110 C-120,40 -80,120 -10,60 C60,0 80,-60 170,-90" stroke="#b02a28" strokeWidth={10} fill="none" strokeDasharray="22 16" strokeDashoffset={-t * 60} strokeLinecap="round" />
  <g transform="translate(220,-110)"><path d="M-70,60 L-70,-40 L-46,-40 L-46,-90 L-22,-40 L22,-40 L46,-90 L46,-40 L70,-40 L70,60 Z" fill="#2a0a10" /><circle cx={-16} cy={0} r={9} fill="#ff3a1a" /><circle cx={16} cy={0} r={9} fill="#ff3a1a" /><path d="M-40,-60 l-30,-30 M40,-60 l30,-30" stroke="#2a0a10" strokeWidth={12} strokeLinecap="round" /></g>
  <text x={220} y={-10} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={30} fill="#3a2a18">ЗАМОК</text>
  <text x={0} y={-190} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={52} fill="#b02a28">КОРОТКИЙ ПУТЬ</text>
  <text x={-40} y={150} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={26} fill="#6a4a2a" transform="rotate(-8 -40 150)">(не через бывших)</text>
</g>);
