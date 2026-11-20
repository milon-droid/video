// Аниме-голова из частей: лицо, глаза (моргают, смотрят), брови, рот (говорит), волосы по стилю.
// Центр головы (0,0), ширина ~120, подбородок y≈78. turn −1…1 — поворот лица (черты смещаются).
import React from 'react';
import { blink, clamp, noise } from '../anim';

export const INK = '#0c0d18';
export type Expr = 'calm' | 'sad' | 'scared' | 'angry' | 'shout' | 'determined' | 'smirk' | 'pain' | 'cry';
export type HairStyle = 'cool' | 'rus' | 'kirill' | 'liza' | 'nastya' | 'zhora' | 'mikh' | 'slick' | 'buzz' | 'curly' | 'none';
export type Look = { skin: string; skinSh: string; hair: string; hairHi: string; iris: string; style: HairStyle; female?: boolean; beard?: string; scar?: boolean; bruise?: boolean; glasses?: boolean; age?: number; plaster?: boolean; sharp?: boolean; under?: string };

const mixC = (a: string, b: string, k: number) => { const p = (x: string) => [1, 3, 5].map(i => parseInt(x.slice(i, i + 2), 16)); const A = p(a), B = p(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join(''); };
// прядь: квадратичная кривая p0→c→p1, ширина w у корня сужается к кончику
export const taperQ = (x0: number, y0: number, cx: number, cy: number, x1: number, y1: number, w: number) => {
  const N = 14, L: string[] = [], R: string[] = [];
  for (let i = 0; i <= N; i++) { const u = i / N, a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, c = u * u;
    const x = a * x0 + b * cx + c * x1, y = a * y0 + b * cy + c * y1;
    const dx = 2 * (1 - u) * (cx - x0) + 2 * u * (x1 - cx), dy = 2 * (1 - u) * (cy - y0) + 2 * u * (y1 - cy), l = Math.hypot(dx, dy) || 1;
    const ww = w / 2 * Math.pow(1 - u, .75); L.push(`${(x - dy / l * ww).toFixed(1)} ${(y + dx / l * ww).toFixed(1)}`); R.push(`${(x + dy / l * ww).toFixed(1)} ${(y - dx / l * ww).toFixed(1)}`); }
  return 'M' + L.join(' L') + ' L' + R.reverse().join(' L') + 'Z';
};
const brows: Record<Expr, [number, number]> = { calm: [0, 0], sad: [-14, 4], scared: [-18, 8], angry: [18, -4], shout: [22, -6], determined: [12, -2], smirk: [6, 0], pain: [-10, 6], cry: [-16, 6] };

export const Head: React.FC<{ t: number; L: Look; expr?: Expr; mouth?: number; turn?: number; lookX?: number; lookY?: number; glow?: number; seed?: number; noBlink?: boolean; lid?: number; sweat?: number; tears?: number; sway?: number }> = ({ t, L, expr = 'calm', mouth = 0, turn = 0, lookX = 0, lookY = 0, glow = 0, seed = 1, noBlink, lid = 1, sweat = 0, tears = 0, sway = 0 }) => {
  const tx = turn * 16, b = (noBlink ? 1 : blink(t, seed)) * lid;
  const eyeY = 10, ex = 27, fem = !!L.female;
  const [bAng, bY] = brows[expr];
  const near = (side: number) => 1 - Math.max(0, side * turn) * .35; // дальний глаз уже
  const Eye = (side: number) => {
    const sharp = !!L.sharp; const cx = side * ex + tx, w = (fem ? 17 : sharp ? 17 : 16) * near(side), hgt = (fem ? 17 : sharp ? 9.5 : 12.5);
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
        <ellipse cx={irisX} cy={irisY} rx={w * (sharp ? .5 : .62)} ry={hgt * (sharp ? 1.35 : 1.05)} fill={`url(#${id})`} />
        <ellipse cx={irisX} cy={irisY + 1} rx={w * .26} ry={hgt * .5} fill={glow > 0 ? '#ffffff' : INK} />
        <circle cx={irisX - w * .22} cy={irisY - hgt * .4} r={fem ? 4.2 : 3.2} fill="#fff" />
        <circle cx={irisX + w * .2} cy={irisY + hgt * .35} r={1.8} fill="#fff" opacity={.8} />
        <rect x={cx - w} y={eyeY - hgt - 2} width={w * 2} height={hgt * .5} fill={INK} opacity={.18} />
      </g>
      {glow > 0 && <ellipse cx={irisX} cy={irisY} rx={w * 1.4} ry={hgt * 1.3} fill="#5fd2ff" opacity={.45 * glow} filter="url(#blur4)" />}
      <ellipse cx={irisX} cy={irisY} rx={w * .62} ry={hgt * 1.05} fill="none" stroke={INK} strokeWidth={1.6} opacity={.5} clipPath={`url(#${id}c)`} />
      {/* складка века */}
      <path d={`M${cx - side * w * .6} ${eyeY - hgt * 1.25 - 4} Q${cx + side * w * .2} ${eyeY - hgt * 1.55 - 5} ${cx + side * w * 1.05} ${eyeY - hgt * 1.0 - 4}`} stroke={INK} strokeWidth={1.6} fill="none" opacity={.45 * clamp(b)} />
      {/* верхнее веко-ресницы: толстая дуга с хвостиком наружу */}
      {sharp ? <path d={`M${cx - side * w * 1.0} ${eyeY - hgt * open * .9 + 3} L${cx + side * w * .2} ${eyeY - hgt * open * 1.25 - 1} L${cx + side * w * 1.2} ${eyeY - hgt * open * .9 - 2}`} stroke={INK} strokeWidth={6.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        : <path d={`M${cx - side * w * 1.05} ${eyeY - hgt * open * .55 + 1} Q${cx} ${eyeY - hgt * open * 1.25 - 2} ${cx + side * w * 1.12} ${eyeY - hgt * open * .7} l${side * (fem ? 7 : 4)} ${fem ? -5 : -2}`} stroke={INK} strokeWidth={fem ? 5.5 : 5} fill="none" strokeLinecap="round" />}
      {open < .2 && <path d={`M${cx - w} ${eyeY} Q${cx} ${eyeY + 4} ${cx + w} ${eyeY}`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />}
      <path d={`M${cx - side * w * .7} ${eyeY + hgt * open * .9 + 2} Q${cx} ${eyeY + hgt * open + 4} ${cx + side * w * .9} ${eyeY + hgt * open * .7}`} stroke={INK} strokeWidth={1.8} fill="none" opacity={.6} />
      {/* бровь */}
      <path d={`M${cx - side * w * .9} ${eyeY - (L.sharp ? 16 : 22) + bY + (L.sharp ? 3 : 0)} L${cx + side * w * 1.1} ${eyeY - (L.sharp ? 20 : 24) + bY}`} transform={`rotate(${side * -bAng * .6 + 0} ${cx} ${eyeY - 23})`} stroke={L.hair === '#e8e4dc' ? '#8a8378' : INK} strokeWidth={L.style === 'mikh' || L.style === 'zhora' ? 7 : L.sharp ? 6.5 : 4.5} strokeLinecap="round" />
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
  const face = L.sharp ? `M${-58} -30 C${-60} 4 ${-56} 30 ${-48 + chinX * .2} 50 L${chinX - 10} 84 L${chinX + 10} 84 L${48 + chinX * .2} 50 C${56} 30 ${60} 4 ${58} -30 Z` : `M${-58 * wide} -30 C${-60 * wide} 10 ${-54 * wide} 34 ${-34 * wide + chinX * .3} 60 L${chinX - 8} ${fem ? 76 : 80} Q${chinX} ${fem ? 80 : 84} ${chinX + 8} ${fem ? 76 : 80} L${34 * wide + chinX * .3} 60 C${54 * wide} 34 ${60 * wide} 10 ${58 * wide} -30 Z`;
  return (
    <g>
      <HairBack L={L} t={t} turn={turn} sway={sway} />
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
      {['rus', 'cool', 'liza', 'nastya', 'kirill'].includes(L.style) && <path d={`M-56 -26 Q0 ${-4} 56 -26 L56 -12 Q0 ${8} -56 -12Z`} fill={L.skinSh} opacity={.35} />}
      {Eye(-1)}{Eye(1)}
      {L.plaster && <g transform={`translate(${tx * 1.1 + 4} 28) rotate(-12)`}><rect x={-16} y={-6} width={32} height={12} rx={4} fill="#f0d8b8" stroke={INK} strokeWidth={2} /><path d="M-6 -6 v12 M6 -6 v12" stroke="#c8a888" strokeWidth={1.5} /></g>}
      {/* нос */}
      <path d={`M${tx * 1.1 + 2} 22 l${-4 - turn * 3} 14 l6 1Z`} fill={L.skinSh} opacity={.55} /><path d={`M${tx * 1.1 + 2} 26 l${-3 - turn * 3} 10 l5 1`} stroke={INK} strokeWidth={2.5} fill="none" strokeLinecap="round" opacity={.8} />
      <Mouth />
      {L.glasses && <g stroke="#111" strokeWidth={4} fill="#0a0a12" opacity={.92}><rect x={-48 + tx} y={-2} width={40} height={24} rx={6} /><rect x={8 + tx} y={-2} width={40} height={24} rx={6} /><path d={`M${-8 + tx} 6 h16`} /></g>}
      {sweat > 0 && <path d={`M${50 + tx} -30 q8 14 0 20 q-8 -6 0 -20Z`} fill="#bfe6ff" stroke={INK} strokeWidth={2} opacity={sweat} transform={`translate(0 ${(t * 40) % 30 * sweat})`} />}
      {tears > 0 && <g opacity={tears}><path d={`M${-27 + tx} 24 q-3 18 0 30`} stroke="#bfe6ff" strokeWidth={4} fill="none" /><path d={`M${27 + tx} 24 q3 18 0 30`} stroke="#bfe6ff" strokeWidth={4} fill="none" /></g>}
      <defs><clipPath id={`fc${seed}`}><path d={face} /><circle cx={0} cy={-28} r={60 * wide} /></clipPath></defs>
      <HairFront L={L} t={t} turn={turn} sway={sway} clip={`fc${seed}`} />
    </g>
  );
};

// волосы: задняя масса (за лицом)
const HairBack: React.FC<{ L: Look; t: number; turn: number; sway?: number }> = ({ L, t, turn, sway = 0 }) => {
  const sw = noise('hb', t, .6) * 3 + sway * 8;
  if (L.style === 'cool') return <path d={`M-66 -20 C-72 0 -68 14 -60 20 L60 20 C68 14 72 0 66 -20 C60 -90 -60 -90 -66 -20Z`} fill={L.under || '#26262e'} stroke={INK} strokeWidth={3.5} />;
  if (L.style === 'rus') return <path d={`M-70 -14 C-76 8 -72 22 ${-64 + sw * .3} 30 L${64 + sw * .3} 30 C72 22 76 8 70 -14 C60 -90 -60 -90 -70 -14Z`} fill={L.hair} stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />;
  if (L.style === 'liza') return <path d={`M-70 -40 C-84 30 -80 90 ${-66 + sw} 130 Q0 110 66 130 C80 90 84 30 70 -40 C40 -110 -40 -110 -70 -40Z`} fill={L.hair} stroke={INK} strokeWidth={3.5} />;
  if (L.style === 'nastya') return <g><path d={`M60 -60 C110 -40 ${120 + sw} 40 ${96 + sw * 2} 120 C84 60 76 0 50 -40Z`} fill={L.hair} stroke={INK} strokeWidth={3.5} /></g>;
  if (L.style === 'kirill') return <path d={`M-66 -20 L-80 30 L-60 10 L-70 60 L-46 30 L46 30 L70 60 L60 10 L80 30 L66 -20 C60 -90 -60 -90 -66 -20Z`} fill={L.hair} stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />;
  if (L.style === 'curly') return <circle cx={0} cy={-40} r={76} fill={L.hair} stroke={INK} strokeWidth={3.5} />;
  return null;
};

// волосы: чёлка и шапка (поверх лица)
const HairFront: React.FC<{ L: Look; t: number; turn: number; sway?: number; clip?: string }> = ({ L, t, turn, sway = 0, clip }) => {
  const tx = turn * 10, sw = noise('hf', t, .8) * 2 + sway * 10;
  const st = { fill: L.hair, stroke: INK, strokeWidth: 3.5, strokeLinejoin: 'round' as const };
  if (L.style === 'cool') {
    // пепельные волосы: короткий выбритый бок справа (андеркат), верх длинный, зачёсан справа налево с объёмом вверх,
    // острые длинные пряди, одна прядь падает между глаз. Кончики качаются (sway).
    const sh = (k: number) => sw * k, U = L.under || '#26262e';
    // [корень x,y, контрольная x,y, кончик x,y, ширина у корня, вес качания]
    const cl: number[][] = [
      [44, -96, 0, -150, -64, -124, 30, .5], [40, -88, -30, -140, -86, -84, 34, .7], [36, -80, -40, -110, -84, -40, 34, .9],
      [30, -74, -30, -80, -70, -4, 30, 1], [24, -70, -10, -60, -40, 10, 26, 1], [-56, -50, -76, -30, -72, 6, 22, .8], [16, -70, 4, -40, -4, 16, 14, 1.2], [44, -76, 52, -60, 30, -16, 22, .6]];
    const strandD = ([rx, ry, cx2, cy2, px, py, w, k]: number[]) => taperQ(rx + tx, ry, cx2 + tx + sh(k) * .4, cy2, px + tx + sh(k), py, w * 1.7);
    const base = `M-72 0 C-86 -60 -60 -106 -16 -114 C16 -120 44 -108 50 -84 C30 -70 0 -58 -30 -44 C-50 -34 -64 -20 -72 0Z`;
    const shapes = [base, ...cl.map(strandD)];
    const gid = 'hg' + (clip || '');
    // приём аниме: жирный контур только по силуэту (все формы толстым штрихом снизу), внутри — тонкие линии прядей;
    // тень от чёлки на лбу (те же формы, сдвиг вниз, в цвет тени кожи, только по лицу); волосы темнее у корней
    return <g>
      <defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={mixC(L.hair, '#1a1c28', .45)} /><stop offset=".45" stopColor={L.hair} /><stop offset="1" stopColor={mixC(L.hair, '#ffffff', .25)} /></linearGradient></defs>
      <g clipPath={clip ? `url(#${clip})` : undefined}>{shapes.slice(1).map((d, i) => <path key={'sh' + i} d={d} transform="translate(3 9)" fill={L.skinSh} opacity={.55} />)}</g>
      <path d={`M40 -88 C64 -80 72 -50 68 -6 C64 -20 60 -36 52 -48 Z`} fill={U} stroke={INK} strokeWidth={3} />
      <path d="M54 -60 L66 -20" stroke="#000" strokeWidth={1.5} opacity={.35} />
      {shapes.map((d, i) => <path key={'o' + i} d={d} fill={INK} stroke={INK} strokeWidth={7} strokeLinejoin="round" />)}
      {shapes.map((d, i) => <path key={'f' + i} d={d} fill={`url(#${gid})`} stroke={mixC(L.hair, '#000000', .55)} strokeWidth={1.6} strokeLinejoin="round" />)}
      {[[-46, -96, -12, -112], [-60, -60, -40, -82], [4, -110, 30, -104]].map(([a, b, c, d], i) => <path key={i} d={`M${a + tx} ${b} Q${(a + c) / 2 + tx} ${Math.min(b, d) - 8} ${c + tx} ${d}`} stroke={L.hairHi} strokeWidth={4.5} strokeLinecap="round" fill="none" opacity={.8} />)}
    </g>;
  }
  if (L.style === 'rus') {
    // короткая мужская стрижка, русые: объём на макушке, косой пробор справа, пряди разной длины влево; кончики качаются (sway)
    const sh = (k: number) => sw * k;
    const cl: [number, number, number, number, number, number][] = [ // корень x,y → кончик x,y, ширина, «вес» качания
      [46, -70, 54, -16, 20, .3], [28, -80, 24, -2, 26, .6], [10, -86, -6, 8, 30, .9], [-10, -86, -28, 2, 30, 1], [-28, -80, -50, -8, 26, .9], [-46, -70, -68, -18, 22, .7]];
    const clump = ([rx, ry, px0, py, w, k]: number[], i: number) => { const px = px0 + tx + sh(k), r0 = rx - w / 2 + tx, r1 = rx + w / 2 + tx;
      const bulge = (px - rx - tx) * .35;
      return <path key={i} d={`M${r0} ${ry} C${r0 + bulge - 6} ${ry + 26} ${px + 6} ${py - 30} ${px} ${py} C${px + 12} ${py - 24} ${r1 + bulge + 4} ${ry + 30} ${r1} ${ry - 4}Z`} {...st} />; };
    return <g>
      <path d={`M-70 -6 C-82 -52 -62 -94 -30 -106 C-8 -118 22 -118 42 -106 C68 -92 84 -58 72 -6 C66 -32 50 -52 20 -58 C-14 -64 -54 -48 -70 -6Z`} {...st} />
      <path d={`M-68 -34 C-72 -14 ${-68 + sh(.4)} 4 ${-64 + sh(.4)} 14 C-62 0 -60 -14 -58 -30Z`} {...st} />
      <path d={`M68 -34 C72 -14 ${68 + sh(.4)} 2 ${64 + sh(.4)} 12 C62 0 60 -14 58 -30Z`} {...st} />
      {cl.map(clump)}
      <path d={`M${12 + tx} -110 C${4 + tx} -124 ${-10 + tx + sh(1.2)} -132 ${-20 + tx + sh(1.4)} -128`} stroke={INK} strokeWidth={9} strokeLinecap="round" fill="none" /><path d={`M${12 + tx} -110 C${4 + tx} -124 ${-10 + tx + sh(1.2)} -132 ${-20 + tx + sh(1.4)} -128`} stroke={L.hair} strokeWidth={4} strokeLinecap="round" fill="none" />
      {[[-46, -84, -24, -98], [-14, -104, 10, -106], [22, -102, 44, -90]].map(([a, b, c, d], i) => <path key={i} d={`M${a} ${b} Q${(a + c) / 2} ${Math.min(b, d) - 6} ${c} ${d}`} stroke={L.hairHi} strokeWidth={5} strokeLinecap="round" fill="none" opacity={.8} />)}
      {cl.slice(1, 5).map(([rx, ry, px0, py], i) => <path key={'s' + i} d={`M${rx + tx - 2} ${ry + 14} Q${(rx + px0) / 2 + tx} ${(ry + py) / 2} ${px0 + tx + sh(.8) + 4} ${py - 14}`} stroke="#000" strokeWidth={2} opacity={.25} fill="none" />)}
    </g>;
  }
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
