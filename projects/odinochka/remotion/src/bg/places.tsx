// Места серии: подъезд, кухня, улица у метро (дождь), сталинская станция метро, пещера, храм-капище.
import React from 'react';
import { noise } from '../anim';
import { h1 } from '../kit/fx';
import { Panelka, Sky } from './moscow';

// подъезд панельки: низ стен крашен зелёным, верх побелка, железная дверь, почтовые ящики, лампочка
export const Stairwell: React.FC<{ t: number; graffiti?: number }> = ({ t, graffiti = 1 }) => {
  const fl = .85 + .15 * (noise('lamp', t, 6) > .6 ? 0 : 1);
  return <g>
    <rect width={1080} height={1920} fill="#b8b4a4" />
    <rect y={900} width={1080} height={1020} fill="#3a6a5a" /><rect y={896} width={1080} height={8} fill="#2a4a40" />
    {/* дверь */}
    <rect x={300} y={330} width={480} height={1200} fill="#5a4a46" stroke="#2a2220" strokeWidth={10} />
    <rect x={330} y={360} width={420} height={1140} fill="#6a5a54" />
    {[0, 1, 2].map(i => <rect key={i} x={360} y={400 + i * 360} width={360} height={320} fill="none" stroke="#4a3a36" strokeWidth={6} />)}
    <rect x={700} y={900} width={30} height={70} rx={6} fill="#c8b070" /><circle cx={540} cy={560} r={14} fill="#1a1a1a" />
    <text x={540} y={300} textAnchor="middle" fontFamily="Mont" fontWeight={800} fontSize={60} fill="#2a2a2a">47</text>
    {/* надпись краской */}
    <g opacity={graffiti} transform="rotate(-6 540 800)">
      <text x={540} y={760} textAnchor="middle" fontFamily="Mont" fontWeight={900} fontSize={104} fill="#c81e2a" stroke="#7a0a12" strokeWidth={3}>ВОЛКОВ,</text>
      <text x={540} y={900} textAnchor="middle" fontFamily="Mont" fontWeight={900} fontSize={86} fill="#c81e2a" stroke="#7a0a12" strokeWidth={3}>ВЕРНИ ДОЛГ</text>
      {[380, 520, 700].map((x, i) => <rect key={i} x={x} y={905} width={7} height={40 + h1(i) * 70} rx={3} fill="#c81e2a" />)}
    </g>
    {/* почтовые ящики, трубы */}
    <rect x={850} y={1000} width={200} height={240} fill="#5a6a7a" stroke="#2a3440" strokeWidth={5} />{[0, 1, 2].map(i => <rect key={i} x={862} y={1012 + i * 76} width={176} height={62} fill="#4a5a6a" />)}
    <rect x={40} y={0} width={34} height={1920} fill="#6a6a6a" /><rect x={110} y={0} width={20} height={1920} fill="#5a5a5a" />
    {/* лампочка */}
    <line x1={540} y1={0} x2={540} y2={120} stroke="#222" strokeWidth={4} /><circle cx={540} cy={140} r={24} fill="#fff4c0" opacity={fl} />
    <circle cx={540} cy={140} r={240} fill="#ffe8a0" opacity={.22 * fl} filter="url(#blur30)" />
    <rect y={1500} width={1080} height={420} fill="#4a4a48" /><rect y={1500} width={1080} height={10} fill="#2a2a28" />
    <rect width={1080} height={1920} fill="#0a1020" opacity={.35 * (1.2 - fl)} />
  </g>;
};

// ночная кухня: плитка, окно с панельками, стол, холодильник, лампа над столом
export const Kitchen: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <rect width={1080} height={1920} fill="#2a3448" />
    {Array.from({ length: 12 }).map((_, i) => Array.from({ length: 9 }).map((__, j) => <rect key={i + '-' + j} x={j * 124} y={760 + i * 60} width={120} height={56} fill={(i + j) % 2 ? '#4a5a6a' : '#506274'} opacity={.6} />))}
    {/* окно */}
    <rect x={560} y={240} width={440} height={520} fill="#0a1024" stroke="#d8d8d0" strokeWidth={18} />
    <svg x={569} y={249} width={422} height={502}><Sky top="#05081a" bot="#2a2a5a" id="kitsky" /><Panelka x={-30} y={520} w={220} floors={11} s={.9} seed={21} /><Panelka x={220} y={540} w={260} floors={13} s={.9} seed={33} /></svg>
    <rect x={772} y={240} width={14} height={520} fill="#d8d8d0" /><rect x={560} y={480} width={440} height={12} fill="#d8d8d0" />
    {/* холодильник */}
    <rect x={40} y={500} width={300} height={1000} rx={20} fill="#c8ccd4" stroke="#1a1a20" strokeWidth={6} /><rect x={300} y={600} width={12} height={160} rx={6} fill="#8a8a90" />
    <rect x={80} y={560} width={60} height={80} fill="#ff6a4a" transform="rotate(-6 110 600)" /><rect x={160} y={580} width={70} height={50} fill="#4ac8ff" transform="rotate(5 195 605)" />
    {/* стол */}
    <rect x={240} y={1360} width={800} height={30} fill="#7a5a3a" /><rect x={260} y={1390} width={760} height={20} fill="#5a3a24" />
    <rect x={300} y={1410} width={24} height={500} fill="#4a3020" /><rect x={960} y={1410} width={24} height={500} fill="#4a3020" />
    <rect x={0} y={1560} width={1080} height={360} fill="#3a2a2a" opacity={.6} />
    {/* лампа */}
    <line x1={640} y1={0} x2={640} y2={300} stroke="#111" strokeWidth={4} /><path d="M560 300 L720 300 L680 250 L600 250Z" fill="#c86a3a" />
    <ellipse cx={640} cy={1300} rx={520} ry={500} fill="#ffcf8a" opacity={.16} filter="url(#blur30)" />
  </g>
);

// улица у входа в метро, ночь, дождь: красная «М», мокрый асфальт с отражениями
export const MetroStreet: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <Sky top="#0a0c1c" bot="#2a2244" id="msky" />
    <Panelka x={-60} y={1100} w={420} floors={16} seed={5} c="#222a3e" />
    <Panelka x={700} y={1080} w={440} floors={15} seed={8} c="#262e44" />
    {/* павильон метро */}
    <rect x={250} y={700} width={580} height={520} fill="#c8c0b0" /><rect x={250} y={700} width={580} height={60} fill="#a8a090" />
    <rect x={330} y={820} width={420} height={400} fill="#ffe0a0" opacity={.85} />{[0, 1, 2, 3].map(i => <rect key={i} x={330 + i * 105} y={820} width={8} height={400} fill="#6a6050" />)}
    <g transform="translate(540 600)"><circle r={90} fill="#ff2030" opacity={.5} filter="url(#blur30)" /><text y={52} textAnchor="middle" fontFamily="Mont" fontWeight={900} fontSize={160} fill="#ff2a3a" stroke="#fff" strokeWidth={4}>М</text></g>
    <rect y={1220} width={1080} height={700} fill="#14141e" />
    {/* отражения в лужах */}
    <g opacity={.5} filter="url(#blur12)"><rect x={330} y={1240} width={420} height={300} fill="#ffe0a0" opacity={.5} /><ellipse cx={540} cy={1600} rx={80} ry={160} fill="#ff2030" opacity={.6} /></g>
    {Array.from({ length: 10 }).map((_, i) => <ellipse key={i} cx={h1(i) * 1080} cy={1300 + h1(i * 3) * 600} rx={30 + ((t * 60 + i * 20) % 50)} ry={6 + ((t * 12 + i * 4) % 10)} fill="none" stroke="#8aa0d8" strokeWidth={2} opacity={1 - ((t * 60 + i * 20) % 50) / 50} />)}
  </g>
);

// заброшенная сталинская станция: арки, колонны в мраморе, люстры, мозаика, рельсы, Врата над путями
export const MetroStation: React.FC<{ t: number; vp?: number }> = ({ t, vp = 760 }) => {
  const arches = []; for (let i = 0; i < 6; i++) { const k = Math.pow(.72, i), w = 1080 * k, x = 540 - w / 2, y = vp - 700 * k, h = 1300 * k;
    arches.push(<g key={i} opacity={1 - i * .1}>
      <path d={`M${x} ${y + h} V${y + 300 * k} Q${540} ${y - 260 * k} ${x + w} ${y + 300 * k} V${y + h}`} fill="none" stroke="#6a5a4a" strokeWidth={60 * k} />
      <rect x={x - 40 * k} y={y + 300 * k} width={90 * k} height={h - 300 * k} fill="#8a7a6a" /><rect x={x + w - 50 * k} y={y + 300 * k} width={90 * k} height={h - 300 * k} fill="#7a6a5a" />
      <g transform={`translate(540 ${y + 120 * k})`}><circle r={60 * k} fill="#ffd890" opacity={i < 3 ? .15 : .05} filter="url(#blur12)" />{[-1, 0, 1].map(j => <circle key={j} cx={j * 30 * k} cy={10 * k} r={8 * k} fill="#5a5040" />)}<path d={`M${-50 * k} 0 Q0 ${30 * k} ${50 * k} 0`} stroke="#8a7040" strokeWidth={6 * k} fill="none" /></g>
    </g>); }
  return <g>
    <rect width={1080} height={1920} fill="#1a1612" />
    <rect x={0} y={0} width={1080} height={vp} fill="#2a2420" />
    {/* мозаика на своде */}
    <g transform={`translate(540 ${vp - 560})`} opacity={.65}><rect x={-160} y={-90} width={320} height={180} fill="#8a6a2a" /><path d="M-120 60 L-40 -60 L40 40 L120 -40" stroke="#d8b860" strokeWidth={10} fill="none" /><circle cx={0} cy={-30} r={28} fill="#c84a3a" /></g>
    {arches.reverse()}
    {/* платформа и пути */}
    <path d={`M0 1920 L460 ${vp + 80} L620 ${vp + 80} L1080 1920Z`} fill="#0e0c0a" />
    <path d={`M0 1500 L460 ${vp + 80}`} stroke="#5a5450" strokeWidth={30} /><path d={`M1080 1500 L620 ${vp + 80}`} stroke="#5a5450" strokeWidth={30} />
    {[0, 1].map(i => <path key={i} d={`M${200 + i * 680} 1920 L${510 + i * 60} ${vp + 80}`} stroke="#6a5a50" strokeWidth={10} />)}
    {Array.from({ length: 10 }).map((_, i) => { const q = Math.pow(i / 10, 1.8), y = vp + 80 + q * 1100, w = 160 + q * 900; return <rect key={i} x={540 - w / 2} y={y} width={w} height={6 + q * 20} fill="#2a2420" />; })}
    {/* пыль в воздухе */}
    {Array.from({ length: 30 }).map((_, i) => <circle key={i} cx={(h1(i) * 1080 + t * 8 * (h1(i * 5) - .5)) % 1080} cy={(h1(i * 3) * 1500 + t * 6) % 1500} r={1.5 + h1(i * 7) * 2} fill="#ffe8c0" opacity={.35} />)}
  </g>;
};

// пещера подземелья: тёмный камень, синие кристаллы, туман
export const Cave: React.FC<{ t: number; warm?: number }> = ({ t, warm = 0 }) => (
  <g>
    <rect width={1080} height={1920} fill="#0a0e1c" />
    <ellipse cx={540} cy={820} rx={700} ry={900} fill="#1a2440" opacity={.8} filter="url(#blur30)" />
    {Array.from({ length: 14 }).map((_, i) => { const x = h1(i) * 1200 - 60, y = i < 7 ? -60 + h1(i * 3) * 200 : 1700 + h1(i * 3) * 300, s = 1.2 + h1(i * 5) * 1.5;
      return <path key={i} d={`M${x - 140 * s} ${y} L${x - 40 * s} ${y + (i < 7 ? 400 : -380) * s * .6} L${x + 60 * s} ${y + (i < 7 ? 260 : -260) * s * .6} L${x + 160 * s} ${y}Z`} fill={i % 2 ? '#141a30' : '#10162a'} stroke="#05070e" strokeWidth={4} />; })}
    {/* кристаллы */}
    {[[120, 1450, 1.2], [930, 1380, 1.4], [820, 520, .8], [200, 420, .9], [600, 1560, .7]].map(([x, y, s], i) => <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse rx={120} ry={120} fill="#3ab8ff" opacity={.25 + .1 * Math.sin(t * 2 + i)} filter="url(#blur30)" />
      {[-30, 0, 34].map((a, j) => <path key={j} d="M-16 0 L0 -130 L16 0Z" transform={`rotate(${a})`} fill={j === 1 ? '#8ae0ff' : '#3a9ad8'} stroke="#0a2a4a" strokeWidth={3} />)}
    </g>)}
    {warm > 0 && <ellipse cx={540} cy={800} rx={160} ry={300} fill="#ffb060" opacity={warm * .6} filter="url(#blur30)" />}
  </g>
);

// храм-капище: перспектива, колонны, свечи (lit 0..1), пол плитами. Идол и статуи — отдельно (monsters.tsx)
export const Temple: React.FC<{ t: number; lit?: number; red?: number; vp?: number }> = ({ t, lit = 1, red = 0, vp = 780 }) => {
  const cols = []; for (let i = 0; i < 6; i++) { const k = Math.pow(.7, i), off = 520 * k + 40, h = 1500 * k, y = vp + 520 * k, w = 90 * k;
    for (const sd of [-1, 1]) cols.push(<g key={i + '' + sd}>
      <rect x={540 + sd * off - w / 2} y={y - h} width={w} height={h} fill={sd < 0 ? '#3a3230' : '#2e2826'} stroke="#100c0a" strokeWidth={3} />
      <rect x={540 + sd * off - w * .7} y={y - 30 * k} width={w * 1.4} height={30 * k} fill="#4a4038" /><rect x={540 + sd * off - w * .7} y={y - h} width={w * 1.4} height={30 * k} fill="#4a4038" />
      {lit > 0 && <g transform={`translate(${540 + sd * (off - w)} ${y - 60 * k})`}>{[0, 1, 2].map(j => { const fx = j * 14 * k - 14 * k, fl = 1 + noise('c' + i + sd + j, t, 6) * .25;
        return <g key={j}><rect x={fx - 4 * k} y={-30 * k} width={8 * k} height={30 * k} fill="#e8d8b0" /><ellipse cx={fx} cy={-38 * k} rx={5 * k} ry={11 * k * fl} fill="#ffcf5a" opacity={lit} /></g>; })}
        <circle r={110 * k} fill="#ffa040" opacity={.22 * lit} filter="url(#blur30)" /></g>}
    </g>); }
  return <g>
    <rect width={1080} height={1920} fill="#120c0a" />
    <rect width={1080} height={vp + 200} fill="#1c1412" />
    {/* пол */}
    <path d={`M-200 1920 L460 ${vp + 150} L620 ${vp + 150} L1280 1920Z`} fill="#241c18" />
    {Array.from({ length: 12 }).map((_, i) => { const q = Math.pow(i / 12, 1.7), y = vp + 150 + q * 1200; return <line key={i} x1={-200} x2={1280} y1={y} y2={y} stroke="#100a08" strokeWidth={2 + q * 4} />; })}
    {Array.from({ length: 9 }).map((_, i) => <line key={'v' + i} x1={460 + i * 20} y1={vp + 150} x2={-500 + i * 222} y2={1920} stroke="#100a08" strokeWidth={3} />)}
    {cols.reverse()}
    <ellipse cx={540} cy={vp + 300} rx={700} ry={500} fill="#ff9a40" opacity={.12 * lit} filter="url(#blur30)" />
    {red > 0 && <rect width={1080} height={1920} fill="#ff1020" opacity={.18 * red} style={{ mixBlendMode: 'screen' }} />}
    <rect width={1080} height={1920} fill="#060818" opacity={.55 * (1 - lit)} />
  </g>;
};

// вагон метро изнутри (перспектива вдоль вагона): сиденья по бокам, поручни, тёмные окна, мерцающие лампы; far — дверь в следующий вагон
export const TrainInterior: React.FC<{ t: number; flicker?: number; vp?: number; shake?: number; red?: number }> = ({ t, flicker = .3, vp = 820, shake = 0, red = 0 }) => {
  const fl = noise('fl', t, 9) > .55 - flicker * .4 ? .35 : 1, sy = Math.sin(t * 23) * shake;
  const ribs = []; for (let i = 0; i < 9; i++) { const k = Math.pow(.78, i), w = 1180 * k, x = 540 - w / 2, top = vp - 760 * k, bot = vp + 900 * k;
    ribs.push(<g key={i}><rect x={x} y={top} width={w} height={bot - top} fill="none" stroke="#3a3e48" strokeWidth={10 * k} opacity={.8} />
      <rect x={x + 20 * k} y={top + 120 * k} width={160 * k} height={260 * k} fill="#05060a" stroke="#4a4e58" strokeWidth={6 * k} />
      <rect x={x + w - 180 * k} y={top + 120 * k} width={160 * k} height={260 * k} fill="#05060a" stroke="#4a4e58" strokeWidth={6 * k} />
      <rect x={540 - 6 * k} y={top} width={12 * k} height={bot - top} fill="#9aa0aa" opacity={i % 2 ? 0 : .9} />
      <rect x={x + 60 * k} y={top + 10 * k} width={w - 120 * k} height={14 * k} fill="#fff8e0" opacity={fl * .9} /></g>); }
  return <g transform={`translate(0 ${sy})`}>
    <rect width={1080} height={1920} fill="#1c1e24" />
    <path d={`M0 0 L1080 0 L${540 + 90} ${vp - 120} L${540 - 90} ${vp - 120}Z`} fill="#2a2c34" />
    <path d={`M0 1920 L1080 1920 L${540 + 90} ${vp + 140} L${540 - 90} ${vp + 140}Z`} fill="#24201e" />
    <path d={`M0 1150 L0 1500 L${540 - 90} ${vp + 120} L${540 - 90} ${vp + 40}Z`} fill="#5a2a2a" /><path d={`M1080 1150 L1080 1500 L${540 + 90} ${vp + 120} L${540 + 90} ${vp + 40}Z`} fill="#4a2424" />
    {ribs.reverse()}
    <rect x={540 - 90} y={vp - 120} width={180} height={260} fill="#0a0a10" stroke="#4a4e58" strokeWidth={4} />
    <rect x={540 - 60} y={vp - 90} width={120} height={110} fill="#05060a" />
    <rect x={120} y={120} width={840} height={40} fill="#e8e8e0" opacity={.9} /><text x={540} y={150} textAnchor="middle" fontFamily="Mont" fontWeight={800} fontSize={26} fill="#c81e2a" letterSpacing={4}>СЕВЕРНАЯ ● ● ● ● КОНЕЧНАЯ</text>
    <rect width={1080} height={1920} fill="#000" opacity={(1 - fl) * .5} />
    {red > 0 && <rect width={1080} height={1920} fill="#ff1020" opacity={red * .15} style={{ mixBlendMode: 'screen' }} />}
  </g>;
};

// мёртвая станция с поездом: train 0..1 — поезд выезжает из тоннеля (фара → вагоны)
export const DeadPlatform: React.FC<{ t: number; train?: number; doors?: number }> = ({ t, train = 0, doors = 0 }) => {
  const x = 1400 - train * 1500;
  return <g>
    <MetroStation t={t} />
    <rect width={1080} height={1920} fill="#0a0c14" opacity={.45} />
    {train > 0 && <g>
      <ellipse cx={x + 40} cy={1020} rx={260} ry={160} fill="#fff4d0" opacity={.4 * (1 - train * .6)} filter="url(#blur30)" />
      <rect x={x} y={760} width={1600} height={420} rx={30} fill="#2a4a6a" stroke="#0a0c14" strokeWidth={8} />
      <rect x={x} y={1080} width={1600} height={40} fill="#1a2a3a" />
      {Array.from({ length: 5 }).map((_, i) => <g key={i}><rect x={x + 120 + i * 300} y={820} width={170} height={150} fill="#0a0e14" stroke="#9aa0aa" strokeWidth={4} />
        <rect x={x + 60 + i * 300 - doors * 30} y={800} width={50} height={280} fill="#c8ccd4" opacity={.25} /></g>)}
      <circle cx={x + 30} cy={1020} r={26} fill="#fff8e0" />
      <text x={x + 300} y={1150} fontFamily="Mont" fontWeight={800} fontSize={30} fill="#c8ccd4">ЭКСПРЕСС · БЕЗ ОСТАНОВОК</text>
    </g>}
  </g>;
};
