// Аниме-голова из частей: лицо, глаза (моргают, смотрят), брови, рот (говорит), волосы по стилю.
// Центр головы (0,0), ширина ~120, подбородок y≈78. turn −1…1 — поворот лица (черты смещаются).
import React from 'react';
import { blink, clamp, noise } from '../anim';

export const INK = '#0c0d18';
export type Expr = 'calm' | 'sad' | 'scared' | 'angry' | 'shout' | 'determined' | 'smirk' | 'pain' | 'cry';
export type HairStyle = 'kirill' | 'liza' | 'nastya' | 'zhora' | 'mikh' | 'slick' | 'buzz' | 'curly' | 'none';
export type Look = { skin: string; skinSh: string; hair: string; hairHi: string; iris: string; style: HairStyle; female?: boolean; beard?: string; scar?: boolean; bruise?: boolean; glasses?: boolean; age?: number };

const brows: Record<Expr, [number, number]> = { calm: [0, 0], sad: [-14, 4], scared: [-18, 8], angry: [18, -4], shout: [22, -6], determined: [12, -2], smirk: [6, 0], pain: [-10, 6], cry: [-16, 6] };

export const Head: React.FC<{ t: number; L: Look; expr?: Expr; mouth?: number; turn?: number; lookX?: number; lookY?: number; glow?: number; seed?: number; noBlink?: boolean; lid?: number; sweat?: number; tears?: number }> = ({ t, L, expr = 'calm', mouth = 0, turn = 0, lookX = 0, lookY = 0, glow = 0, seed = 1, noBlink, lid = 1, sweat = 0, tears = 0 }) => {
  const tx = turn * 16, b = (noBlink ? 1 : blink(t, seed)) * lid;
  const eyeY = 10, ex = 27, fem = !!L.female;
  const [bAng, bY] = brows[expr];
  const near = (side: number) => 1 - Math.max(0, side * turn) * .35; // дальний глаз уже
  const Eye = (side: number) => {
    const cx = side * ex + tx, w = (fem ? 17 : 16) * near(side), hgt = (fem ? 17 : 12.5);
    const irisX = cx + lookX * 6, irisY = eyeY + lookY * 4 + (expr === 'sad' ? 2 : 0);
    const open = clamp(b) * (expr === 'scared' ? 1.15 : expr === 'angry' || expr === 'determined' ? .78 : expr === 'smirk' ? .8 : 1);
    const id = `iris${seed}${side > 0 ? 'r' : 'l'}`;
    const irisC = glow > 0 ? '#7fe0ff' : L.iris;
    return <g key={side}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={INK} /><stop offset=".45" stopColor={irisC} /><stop offset="1" stopColor={glow > 0 ? '#e0fbff' : irisC} /></linearGradient>
        <clipPath id={id + 'c'}><ellipse cx={cx} cy={eyeY} rx={w} ry={hgt * open + .01} /></clipPath></defs>
      {/* белок */}
      <ellipse cx={cx} cy={eyeY} rx={w} ry={hgt * open + .01} fill="#fbf7f4" />
      <g clipPath={`url(#${id}c)`}>
        <ellipse cx={irisX} cy={irisY} rx={w * .62} ry={hgt * 1.05} fill={`url(#${id})`} />
        <ellipse cx={irisX} cy={irisY + 1} rx={w * .26} ry={hgt * .5} fill={glow > 0 ? '#ffffff' : INK} />
        <circle cx={irisX - w * .22} cy={irisY - hgt * .4} r={fem ? 4.2 : 3.2} fill="#fff" />
        <circle cx={irisX + w * .2} cy={irisY + hgt * .35} r={1.8} fill="#fff" opacity={.8} />
        <rect x={cx - w} y={eyeY - hgt - 2} width={w * 2} height={hgt * .5} fill={INK} opacity={.18} />
      </g>
      {glow > 0 && <ellipse cx={irisX} cy={irisY} rx={w * 1.4} ry={hgt * 1.3} fill="#5fd2ff" opacity={.45 * glow} filter="url(#blur4)" />}
      {/* верхнее веко-ресницы: толстая дуга с хвостиком наружу */}
      <path d={`M${cx - side * w * 1.05} ${eyeY - hgt * open * .55 + 1} Q${cx} ${eyeY - hgt * open * 1.25 - 2} ${cx + side * w * 1.12} ${eyeY - hgt * open * .7} l${side * (fem ? 7 : 4)} ${fem ? -5 : -2}`} stroke={INK} strokeWidth={fem ? 5.5 : 5} fill="none" strokeLinecap="round" />
      {open < .2 && <path d={`M${cx - w} ${eyeY} Q${cx} ${eyeY + 4} ${cx + w} ${eyeY}`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />}
      <path d={`M${cx - side * w * .7} ${eyeY + hgt * open * .9 + 2} Q${cx} ${eyeY + hgt * open + 4} ${cx + side * w * .9} ${eyeY + hgt * open * .7}`} stroke={INK} strokeWidth={1.8} fill="none" opacity={.6} />
      {/* бровь */}
      <path d={`M${cx - side * w * .9} ${eyeY - 22 + bY + side * 0} L${cx + side * w * 1.1} ${eyeY - 24 + bY}`} transform={`rotate(${side * -bAng * .6 + 0} ${cx} ${eyeY - 23})`} stroke={L.hair === '#e8e4dc' ? '#8a8378' : INK} strokeWidth={L.style === 'mikh' || L.style === 'zhora' ? 7 : 4.5} strokeLinecap="round" />
    </g>;
  };
  // рот
  const my = 52, mx = tx * .9;
  const m = clamp(mouth);
  const Mouth = () => {
    if (expr === 'shout' || m > .05) { const o = expr === 'shout' ? Math.max(.7, m) : m; const w = 9 + o * 7;
      return <g><path d={`M${mx - w} ${my - 2} Q${mx} ${my - 5} ${mx + w} ${my - 2} Q${mx + w * .6} ${my + o * 20} ${mx} ${my + o * 22} Q${mx - w * .6} ${my + o * 20} ${mx - w} ${my - 2}Z`} fill="#3a1318" stroke={INK} strokeWidth={2.5} />
        {o > .4 && <path d={`M${mx - w * .7} ${my} H${mx + w * .7}`} stroke="#fff" strokeWidth={3} />}
        <ellipse cx={mx} cy={my + o * 15} rx={w * .45} ry={o * 4} fill="#c4505a" /></g>; }
    if (expr === 'scared' || expr === 'pain') return <ellipse cx={mx} cy={my + 3} rx={6} ry={expr === 'scared' ? 9 : 5} fill="#3a1318" stroke={INK} strokeWidth={2.5} />;
    if (expr === 'angry' || expr === 'determined') return <path d={`M${mx - 12} ${my + 2} Q${mx} ${my - 2} ${mx + 12} ${my + 2}`} stroke={INK} strokeWidth={3.5} fill="none" strokeLinecap="round" />;
    if (expr === 'sad' || expr === 'cry') return <path d={`M${mx - 10} ${my + 4} Q${mx} ${my - 3} ${mx + 10} ${my + 4}`} stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />;
    if (expr === 'smirk') return <path d={`M${mx - 10} ${my + 1} Q${mx + 2} ${my + 5} ${mx + 13} ${my - 4}`} stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />;
    return <path d={`M${mx - 8} ${my + 1} Q${mx} ${my + 3} ${mx + 8} ${my + 1}`} stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />;
  };
  const chinX = tx * .8, wide = L.style === 'zhora' ? 1.12 : L.style === 'mikh' ? 1.06 : 1;
  const face = `M${-58 * wide} -30 C${-60 * wide} 10 ${-54 * wide} 34 ${-34 * wide + chinX * .3} 60 L${chinX - 8} ${fem ? 76 : 80} Q${chinX} ${fem ? 80 : 84} ${chinX + 8} ${fem ? 76 : 80} L${34 * wide + chinX * .3} 60 C${54 * wide} 34 ${60 * wide} 10 ${58 * wide} -30 Z`;
  return (
    <g>
      <HairBack L={L} t={t} turn={turn} />
      {/* уши */}
      <ellipse cx={-58 * wide + tx * .3} cy={14} rx={9} ry={15} fill={L.skin} stroke={INK} strokeWidth={3} />
      <ellipse cx={58 * wide + tx * .3} cy={14} rx={9} ry={15} fill={L.skin} stroke={INK} strokeWidth={3} />
      <circle cx={0} cy={-28} r={60 * wide} fill={L.skin} />
      <path d={face} fill={L.skin} />
      <path d={face.replace(/ Z$/, '')} fill="none" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
      {/* светотень: правая сторона в тени */}
      <path d={`M${50 * wide} -20 C${56 * wide} 10 ${50 * wide} 34 ${34 * wide + chinX * .3} 60 L${chinX + 8} 80 C${26 + tx} 62 ${42 * wide} 30 ${44 * wide} -20Z`} fill={L.skinSh} opacity={.5} />
      {L.age && L.age > 40 && <g stroke={INK} strokeWidth={1.6} opacity={.45} fill="none"><path d={`M${tx - 40} 34 q6 8 2 16`} /><path d={`M${tx + 40} 34 q-6 8 -2 16`} /><path d={`M${tx - 20} -18 h14 M${tx + 6} -18 h14`} /></g>}
      {L.beard && <path d={`M${-50 * wide} 20 C${-46} 60 ${-20 + chinX} 98 ${chinX} 100 C${20 + chinX} 98 ${46} 60 ${50 * wide} 20 C${30} 44 ${-30} 44 ${-50 * wide} 20Z`} fill={L.beard} stroke={INK} strokeWidth={2.5} />}
      {fem && <g opacity={.35}><ellipse cx={-30 + tx} cy={36} rx={12} ry={6} fill="#ff7a8a" /><ellipse cx={30 + tx} cy={36} rx={12} ry={6} fill="#ff7a8a" /></g>}
      {L.bruise && <ellipse cx={-34 + tx} cy={34} rx={13} ry={9} fill="#6a4a8a" opacity={.5} />}
      {L.scar && <path d={`M${22 + tx} -10 l14 26`} stroke="#b05a5a" strokeWidth={3} />}
      {Eye(-1)}{Eye(1)}
      {/* нос */}
      <path d={`M${tx * 1.1 + 2} 26 l${-3 - turn * 3} 10 l5 1`} stroke={INK} strokeWidth={2.5} fill="none" strokeLinecap="round" opacity={.8} />
      <Mouth />
      {L.glasses && <g stroke="#111" strokeWidth={4} fill="#0a0a12" opacity={.92}><rect x={-48 + tx} y={-2} width={40} height={24} rx={6} /><rect x={8 + tx} y={-2} width={40} height={24} rx={6} /><path d={`M${-8 + tx} 6 h16`} /></g>}
      {sweat > 0 && <path d={`M${50 + tx} -30 q8 14 0 20 q-8 -6 0 -20Z`} fill="#bfe6ff" stroke={INK} strokeWidth={2} opacity={sweat} transform={`translate(0 ${(t * 40) % 30 * sweat})`} />}
      {tears > 0 && <g opacity={tears}><path d={`M${-27 + tx} 24 q-3 18 0 30`} stroke="#bfe6ff" strokeWidth={4} fill="none" /><path d={`M${27 + tx} 24 q3 18 0 30`} stroke="#bfe6ff" strokeWidth={4} fill="none" /></g>}
      <HairFront L={L} t={t} turn={turn} />
    </g>
  );
};

// волосы: задняя масса (за лицом)
const HairBack: React.FC<{ L: Look; t: number; turn: number }> = ({ L, t, turn }) => {
  const sw = noise('hb', t, .6) * 3;
  if (L.style === 'liza') return <path d={`M-70 -40 C-84 30 -80 90 ${-66 + sw} 130 Q0 110 66 130 C80 90 84 30 70 -40 C40 -110 -40 -110 -70 -40Z`} fill={L.hair} stroke={INK} strokeWidth={3.5} />;
  if (L.style === 'nastya') return <g><path d={`M60 -60 C110 -40 ${120 + sw} 40 ${96 + sw * 2} 120 C84 60 76 0 50 -40Z`} fill={L.hair} stroke={INK} strokeWidth={3.5} /></g>;
  if (L.style === 'kirill') return <path d={`M-66 -20 L-80 30 L-60 10 L-70 60 L-46 30 L46 30 L70 60 L60 10 L80 30 L66 -20 C60 -90 -60 -90 -66 -20Z`} fill={L.hair} stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />;
  if (L.style === 'curly') return <circle cx={0} cy={-40} r={76} fill={L.hair} stroke={INK} strokeWidth={3.5} />;
  return null;
};

// волосы: чёлка и шапка (поверх лица)
const HairFront: React.FC<{ L: Look; t: number; turn: number }> = ({ L, t, turn }) => {
  const tx = turn * 10, sw = noise('hf', t, .8) * 2;
  const st = { fill: L.hair, stroke: INK, strokeWidth: 3.5, strokeLinejoin: 'round' as const };
  if (L.style === 'kirill') {
    // растрёпанная чёлка шипами + шапка
    const sp: [number, number, number][] = [[-56, -4, -10], [-38, 6, -4], [-20, 12, 4], [-2, 16, 8], [18, 8, 12], [36, 4, 16], [54, -2, 18]];
    const fr = sp.map(([x, y, a], i) => { const x0 = x - 16 + tx, x1 = x + 16 + tx, tipx = x + a * .6 + tx + sw, tipy = y;
      return <path key={i} d={`M${x0} -40 Q${(x0 + tipx) / 2 - 4} ${(y - 40) / 2} ${tipx} ${tipy} Q${(x1 + tipx) / 2 + 2} ${(y - 50) / 2} ${x1} -44Z`} {...st} />; });
    return <g><path d={`M-70 -6 L-78 -40 L-66 -52 L-74 -80 L-50 -84 L-48 -108 L-22 -100 L-8 -122 L10 -102 L34 -114 L40 -92 L66 -96 L62 -70 L82 -60 L68 -40 L72 -6 C56 -40 30 -56 0 -54 C-30 -56 -56 -40 -70 -6Z`} {...st} />
      {fr}<path d={`M-34 -70 Q-10 -84 14 -78`} stroke={L.hairHi} strokeWidth={4} fill="none" opacity={.6} /></g>;
  }
  if (L.style === 'liza') return <g><path d={`M-72 0 C-80 -80 -30 -110 0 -110 C40 -110 80 -80 72 0 C66 -30 56 -44 40 -48 L44 -8 L24 -44 L10 4 L0 -46 L-18 -2 L-26 -46 L-48 -6 L-44 -46 C-58 -40 -66 -26 -72 0Z`} {...st} transform={`translate(${tx} 0)`} /><path d="M-30 -90 Q0 -102 30 -90" stroke={L.hairHi} strokeWidth={5} fill="none" opacity={.7} /></g>;
  if (L.style === 'nastya') return <g><path d={`M-68 -2 C-78 -80 -30 -108 0 -108 C40 -108 78 -80 68 -2 C60 -36 40 -50 20 -50 L28 -14 L4 -48 L-12 -10 L-20 -48 L-46 -12 C-52 -30 -60 -16 -68 -2Z`} {...st} transform={`translate(${tx} 0)`} /><circle cx={70} cy={-50} r={10} fill="#ff4a6a" stroke={INK} strokeWidth={3} /></g>;
  if (L.style === 'zhora' || L.style === 'buzz') return <path d={`M-64 -14 C-70 -80 -36 -102 0 -102 C40 -102 70 -80 64 -14 C54 -48 30 -60 0 -60 C-30 -60 -54 -48 -64 -14Z`} {...st} opacity={L.style === 'zhora' ? .85 : 1} />;
  if (L.style === 'mikh') return <path d={`M-64 -10 C-70 -80 -36 -100 0 -100 C40 -100 70 -80 64 -10 C58 -44 40 -58 20 -56 L12 -40 L0 -58 C-26 -58 -52 -46 -64 -10Z`} {...st} />;
  if (L.style === 'slick') return <path d={`M-64 -10 C-72 -84 -30 -106 10 -104 C50 -100 72 -74 64 -10 C56 -50 40 -66 -10 -62 C-40 -58 -56 -40 -64 -10Z`} {...st} />;
  if (L.style === 'curly') return <g>{[-50, -25, 0, 25, 50].map((x, i) => <circle key={i} cx={x + tx} cy={-62 + Math.abs(x) * .3} r={22} {...st} />)}</g>;
  return null;
};
