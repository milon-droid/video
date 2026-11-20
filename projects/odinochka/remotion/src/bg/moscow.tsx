// Узнаваемая Москва кодом: сталинская высотка, кремлёвская башня и стена, Василий Блаженный, Москва-Сити, Останкино, панельки, Врата.
import React from 'react';
import { noise } from '../anim';
import { h1 } from '../kit/fx';

const W = (x: number, y: number, w: number, h: number, cols: number, rows: number, seed: number, lit: number, warm = '#ffd38a', off = '#1a2236', cw = .55, ch = .5) => {
  const r = []; const dx = w / cols, dy = h / rows;
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) { const on = h1(seed + i * 13.1 + j * 7.7) < lit;
    r.push(<rect key={i + '_' + j} x={x + i * dx + dx * (1 - cw) / 2} y={y + j * dy + dy * (1 - ch) / 2} width={dx * cw} height={dy * ch} fill={on ? warm : off} opacity={on ? .55 + h1(seed * 3 + i + j) * .45 : .8} />); }
  return r;
};

// сталинская высотка (МГУ/Котельническая): ступенчатые ярусы, крылья, шпиль со звездой
export const Vysotka: React.FC<{ x: number; y: number; s?: number; c?: string; cs?: string; lit?: number; seed?: number; star?: boolean; glow?: number }> = ({ x, y, s = 1, c = '#2a3350', cs = '#1a2038', lit = .35, seed = 1, star = true, glow = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {/* крылья */}
    <rect x={-300} y={-260} width={160} height={260} fill={cs} /><rect x={140} y={-260} width={160} height={260} fill={cs} />
    <rect x={-290} y={-290} width={140} height={30} fill={c} /><rect x={150} y={-290} width={140} height={30} fill={c} />
    {W(-290, -250, 140, 240, 6, 9, seed, lit * .8)}{W(150, -250, 140, 240, 6, 9, seed + 5, lit * .8)}
    {/* корпус ярусами */}
    <rect x={-140} y={-520} width={280} height={520} fill={c} />{W(-130, -500, 260, 490, 10, 18, seed + 9, lit)}
    <rect x={-150} y={-540} width={300} height={24} fill={cs} />
    <rect x={-100} y={-700} width={200} height={170} fill={c} />{W(-92, -690, 184, 150, 7, 6, seed + 11, lit)}
    <rect x={-110} y={-716} width={220} height={20} fill={cs} />
    <rect x={-66} y={-830} width={132} height={120} fill={c} />{W(-60, -820, 120, 100, 5, 4, seed + 13, lit)}
    {/* башенки по углам ярусов */}
    {[-130, 130].map((xx, i) => <g key={i}><rect x={xx - 14} y={-580} width={28} height={50} fill={cs} /><path d={`M${xx - 14} -580 L${xx} -620 L${xx + 14} -580Z`} fill={cs} /></g>)}
    <rect x={-74} y={-846} width={148} height={18} fill={cs} />
    {/* барабан и шпиль */}
    <rect x={-40} y={-920} width={80} height={76} fill={c} /><rect x={-48} y={-930} width={96} height={14} fill={cs} />
    <path d={`M-40 -930 L-12 -1080 L12 -1080 L40 -930Z`} fill={cs} />
    <path d={`M-10 -1080 L0 -1260 L10 -1080Z`} fill="#c8a85a" />
    {star && <g transform="translate(0 -1270)"><circle r={36} fill="#ff2a3a" opacity={.35 * glow} filter="url(#blur12)" /><path d={starD(22)} fill="#ff3a4a" stroke="#ffd36a" strokeWidth={3} /></g>}
  </g>
);
export const starD = (R: number) => { let d = ''; for (let i = 0; i < 10; i++) { const r = i % 2 ? R * .42 : R, a = -Math.PI / 2 + i * Math.PI / 5; d += (i ? 'L' : 'M') + (Math.cos(a) * r).toFixed(1) + ' ' + (Math.sin(a) * r).toFixed(1); } return d + 'Z'; };

// кремлёвская башня (Спасская): кирпичный низ, белые ярусы, шатёр, рубиновая звезда, часы
export const KremlinTower: React.FC<{ x: number; y: number; s?: number; night?: boolean; clock?: boolean }> = ({ x, y, s = 1, night = true, clock = true }) => {
  const br = night ? '#6a1e22' : '#b0383a', brs = night ? '#4a1216' : '#8a2a2c', wt = night ? '#8a8aa0' : '#e8e0d0', roof = night ? '#1e3a34' : '#3a7a5a';
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-80} y={-300} width={160} height={300} fill={br} /><rect x={20} y={-300} width={60} height={300} fill={brs} />
    <path d="M-30 0 V-90 Q0 -130 30 -90 V0Z" fill="#0a0a10" />
    <rect x={-88} y={-320} width={176} height={20} fill={wt} />
    <rect x={-66} y={-440} width={132} height={120} fill={br} /><rect x={10} y={-440} width={56} height={120} fill={brs} />
    {clock && <g transform="translate(0 -380)"><circle r={42} fill="#0d1a2a" stroke="#d8b860" strokeWidth={6} /><path d="M0 0 V-30 M0 0 L20 10" stroke="#d8b860" strokeWidth={5} /></g>}
    <rect x={-74} y={-456} width={148} height={16} fill={wt} />
    <rect x={-48} y={-540} width={96} height={84} fill={wt} opacity={.9} />{[-30, 0, 30].map((xx, i) => <path key={i} d={`M${xx - 9} -470 V-510 Q${xx} -524 ${xx + 9} -510 V-470Z`} fill="#0a0a14" />)}
    <path d="M-54 -540 L0 -760 L54 -540Z" fill={roof} /><path d="M0 -760 L54 -540 L20 -540Z" fill="#000" opacity={.25} />
    <rect x={-3} y={-800} width={6} height={44} fill="#c8a85a" />
    <g transform="translate(0 -820)"><circle r={40} fill="#ff2030" opacity={.45} filter="url(#blur12)" /><path d={starD(26)} fill="#ff2a3a" stroke="#ffd36a" strokeWidth={3} /></g>
  </g>;
};
// кремлёвская стена с зубцами «ласточкин хвост»
export const KremlinWall: React.FC<{ x: number; y: number; w: number; h?: number; night?: boolean }> = ({ x, y, w, h = 120, night = true }) => {
  const br = night ? '#5a1a1e' : '#a8363a'; const z = []; for (let xx = 0; xx < w; xx += 36) z.push(<path key={xx} d={`M${xx + 4} 0 V-30 L${xx + 12} -22 L${xx + 20} -30 V0Z`} fill={br} />);
  return <g transform={`translate(${x} ${y})`}><rect x={0} y={0} width={w} height={h} fill={br} /><rect x={0} y={0} width={w} height={10} fill="#000" opacity={.2} />{z}</g>;
};
// собор Василия Блаженного (упрощённо): луковичные главы разной высоты, полосатые
export const Basil: React.FC<{ x: number; y: number; s?: number; night?: boolean }> = ({ x, y, s = 1, night = true }) => {
  const k = night ? .55 : 1; const cols = ['#d84a3a', '#3a9a6a', '#e8b84a', '#3a6ad8', '#d84a8a'];
  const dome = (cx: number, by: number, r: number, c: string, i: number) => <g key={i}>
    <rect x={cx - r * .55} y={by} width={r * 1.1} height={-by} fill={night ? '#6a3a3a' : '#c8786a'} />
    <path d={`M${cx - r * .55} ${by} C${cx - r * 1.2} ${by - r * .6} ${cx - r * .5} ${by - r * 1.4} ${cx} ${by - r * 2} C${cx + r * .5} ${by - r * 1.4} ${cx + r * 1.2} ${by - r * .6} ${cx + r * .55} ${by}Z`} fill={c} opacity={k + .2} />
    {[-.4, 0, .4].map((q, j) => <path key={j} d={`M${cx + q * r} ${by} Q${cx + q * r * 1.4} ${by - r} ${cx} ${by - r * 2}`} stroke="#fff" strokeWidth={4} opacity={.35 * k} fill="none" />)}
    <rect x={cx - 2} y={by - r * 2 - 30} width={4} height={30} fill="#d8b860" />
  </g>;
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-200} y={-120} width={400} height={120} fill={night ? '#5a2a2a' : '#b8604a'} />
    {dome(-150, -160, 42, cols[0], 0)}{dome(150, -160, 42, cols[1], 1)}{dome(-80, -230, 50, cols[2], 2)}{dome(80, -230, 50, cols[3], 3)}
    <rect x={-34} y={-480} width={68} height={360} fill={night ? '#7a4a3a' : '#d8907a'} /><path d="M-40 -480 L0 -620 L40 -480Z" fill={night ? '#2a4a3a' : '#4a8a5a'} />
    {dome(0, -300, 56, cols[4], 4)}
  </g>;
};
// Москва-Сити: стеклянные башни, одна закручена («Эволюция»), одна со шпилем («Федерация»)
export const MoscowCity: React.FC<{ x: number; y: number; s?: number; t: number; night?: boolean }> = ({ x, y, s = 1, t, night = true }) => {
  const gl = night ? '#1a3a6a' : '#7aa8d8', gs = night ? '#0e2244' : '#4a78a8';
  const tw: [number, number, number, number][] = [[-260, 90, 620, 1], [-150, 110, 900, 2], [-20, 120, 1100, 3], [120, 100, 820, 4], [230, 90, 700, 5]];
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    {tw.map(([xx, w, h, i]) => <g key={i}>
      {i === 3 ? <path d={`M${xx} 0 L${xx + 6} ${-h} L${xx + w / 2} ${-h - 120} L${xx + w - 6} ${-h} L${xx + w} 0Z`} fill={gl} /> : <rect x={xx} y={-h} width={w} height={h} fill={i % 2 ? gl : gs} />}
      {i === 2 && Array.from({ length: 14 }).map((_, j) => <path key={j} d={`M${xx} ${-j * 64} q${w / 2} -30 ${w} 0`} stroke="#9fd8ff" strokeWidth={3} fill="none" opacity={night ? .35 : .5} />)}
      {Array.from({ length: Math.floor(h / 26) }).map((_, j) => <rect key={'f' + j} x={xx + 4} y={-h + 20 + j * 26} width={w - 8} height={4} fill={night ? '#6fb8ff' : '#e0f0ff'} opacity={h1(i * 40 + j) < .45 ? (night ? .5 : .3) : .08} />)}
      <rect x={xx + w * .6} y={-h} width={w * .4} height={h} fill="#000" opacity={.22} />
    </g>)}
    {night && [-150, -20, 120].map((xx, i) => <circle key={i} cx={xx + 50} cy={-[900, 1220, 820][i] - 8} r={6} fill="#ff3040" opacity={.5 + .5 * Math.sin(t * 3 + i)} />)}
  </g>;
};
// Останкинская башня
export const Ostankino: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-60 0 L-10 -500 L-8 -900 L8 -900 L10 -500 L60 0Z" fill="#3a4258" />
    <rect x={-24} y={-760} width={48} height={50} fill="#4a5470" /><rect x={-20} y={-772} width={40} height={10} fill="#ffd38a" opacity={.7} />
    <rect x={-4} y={-1200} width={8} height={300} fill="#c0c4d0" />
    {[-1200, -1050, -930].map((yy, i) => <circle key={i} cx={0} cy={yy} r={7} fill="#ff3040" opacity={.4 + .6 * (Math.sin(t * 2.5 + i * 2) > 0 ? 1 : .2)} />)}
  </g>
);
// панелька (9–17 этажей): сетка окон, тёплые и тёмные
export const Panelka: React.FC<{ x: number; y: number; w?: number; floors?: number; s?: number; c?: string; lit?: number; seed?: number; balc?: boolean }> = ({ x, y, w = 360, floors = 12, s = 1, c = '#2c3448', lit = .3, seed = 3, balc = true }) => {
  const fh = 46, h = floors * fh;
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={0} y={-h} width={w} height={h} fill={c} />
    {Array.from({ length: floors }).map((_, j) => <rect key={j} x={0} y={-h + j * fh} width={w} height={2} fill="#000" opacity={.25} />)}
    {W(8, -h + 6, w - 16, h - 12, Math.round(w / 44), floors, seed, lit, '#ffcf7a', '#141a2a', .5, .55)}
    {balc && Array.from({ length: floors }).map((_, j) => <rect key={'b' + j} x={w * .3} y={-h + j * fh + 30} width={w * .16} height={14} fill="#1a2030" />)}
    <rect x={w * .7} y={-h} width={w * .3} height={h} fill="#000" opacity={.18} />
  </g>;
};
// Врата — светящаяся рваная трещина в воздухе с вихрем внутри
export const Gate: React.FC<{ x: number; y: number; s?: number; t: number; color?: string; open?: number; rot?: number }> = ({ x, y, s = 1, t, color = '#4ac8ff', open = 1, rot = 0 }) => {
  const pts: string[] = []; const N = 26;
  for (let i = 0; i <= N; i++) { const a = i / N * Math.PI * 2, r = (1 + (h1(i * 3.3) - .5) * .5 + noise('g' + i, t, .8) * .08); pts.push(`${Math.cos(a) * 120 * r * open},${Math.sin(a) * 260 * r * open}`); }
  const swirl = Array.from({ length: 6 }).map((_, i) => <ellipse key={i} cx={0} cy={0} rx={100 * open * (1 - i * .14)} ry={230 * open * (1 - i * .14)} fill="none" stroke={i % 2 ? '#e8fbff' : color} strokeWidth={6} strokeDasharray="40 30" transform={`rotate(${t * (40 + i * 25) * (i % 2 ? -1 : 1)})`} opacity={.5} />);
  return <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <ellipse rx={260 * open} ry={420 * open} fill={color} opacity={.25} filter="url(#blur30)" />
    <polygon points={pts.join(' ')} fill="#06122a" stroke={color} strokeWidth={10} filter="url(#glow)" />
    <g clipPath="none">{swirl}</g>
    <ellipse rx={40 * open} ry={110 * open} fill="#e8fbff" opacity={.7} filter="url(#blur12)" />
  </g>;
};
// небо: градиент + звёзды/облака
export const Sky: React.FC<{ top: string; bot: string; t?: number; stars?: boolean; id?: string }> = ({ top, bot, t = 0, stars, id = 'sky' }) => (
  <g><defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top} /><stop offset="1" stopColor={bot} /></linearGradient></defs>
    <rect x={-400} y={-400} width={1880} height={2720} fill={`url(#${id})`} />
    {stars && Array.from({ length: 70 }).map((_, i) => <circle key={i} cx={h1(i) * 1080} cy={h1(i * 3) * 900} r={1 + h1(i * 7) * 1.6} fill="#fff" opacity={.3 + .5 * Math.abs(Math.sin(t + i))} />)}
  </g>
);
