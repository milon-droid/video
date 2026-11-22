// «ТЕНЬ УВОЛИЛАСЬ» — общий кит: герой, живая тень (на земле и на стене), глаза тени, кот, тексты, HUD заката.
import React from 'react';
import { blink, clamp, ease, lerp, noise, spr } from '../anim';
import { Figure, Pose, wristR } from '../chars/body';
import { Expr, Look } from '../chars/head';
import { Costume } from '../chars/body';
import { FONT } from '../kit/ui';

export const SK = '#f1d3c2', SKS = '#c8968a';
export const SENYA_L: Look = { skin: SK, skinSh: SKS, hair: '#2b2420', hairHi: '#6a5446', iris: '#4a3a2a', style: 'messy', tired: true };
export const SENYA_C: Costume = { top: '#8a8f9c', topSh: '#62666f', pants: '#2c3040', shoes: '#e8e8ee', hood: true, w: .95 };
export const SH = '#07080f'; // цвет тени

// фильтры серии: силуэт тени и обесцвечивание (sat — 0…1)
export const TenDefs: React.FC<{ sat?: number }> = ({ sat = 1 }) => (
  <defs>
    <filter id="silh" colorInterpolationFilters="sRGB" x="-20%" y="-20%" width="140%" height="140%"><feColorMatrix type="matrix" values="0 0 0 0 0.027  0 0 0 0 0.03  0 0 0 0 0.06  0 0 0 1 0" /><feGaussianBlur stdDeviation="1.6" /></filter>
    <filter id="silhSoft" colorInterpolationFilters="sRGB" x="-20%" y="-20%" width="140%" height="140%"><feColorMatrix type="matrix" values="0 0 0 0 0.02  0 0 0 0 0.02  0 0 0 0 0.05  0 0 0 1 0" /><feGaussianBlur stdDeviation="5" /></filter>
    <filter id="desat"><feColorMatrix type="saturate" values={String(sat)} /></filter>
    <filter id="eyeGlow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
    <filter id="soft8" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8" /></filter>
    <filter id="soft20" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="20" /></filter>
    <filter id="soft50" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="50" /></filter>
    <radialGradient id="glowW"><stop offset="0" stopColor="#fff" stopOpacity=".9" /><stop offset=".4" stopColor="#fff" stopOpacity=".3" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
  </defs>
);

// центр головы в координатах фигуры (с учётом наклона/приседа)
export const headAt = (pose: Pose) => { const hipY = -410 + pose.crouch, ty = -230 - pose.crouch * .1, r = (pose.lean || 0) * Math.PI / 180, hy = ty - 114;
  return [-Math.sin(r) * hy, hipY + Math.cos(r) * hy]; };

export type Mood = 'calm' | 'happy' | 'angry' | 'wide' | 'sly' | 'sad';
// глаза тени: белые щёлки со свечением, моргают, смотрят
export const Eyes: React.FC<{ t: number; x: number; y: number; s?: number; mood?: Mood; look?: number; open?: number; seed?: number }> = ({ t, x, y, s = 1, mood = 'calm', look = 0, open = 1, seed = 3 }) => {
  const b = blink(t, seed) * open; if (b < .02) return <g transform={`translate(${x} ${y}) scale(${s})`}>{[-1, 1].map(i => <path key={i} d={`M${i * 27 - 15 + look * 8} 12 h30`} stroke="#eef2ff" strokeWidth={4} strokeLinecap="round" />)}</g>;
  const eye = (side: number) => { const cx = side * 27 + look * 8, cy = 12;
    if (mood === 'happy') return <path d={`M${cx - 16} ${cy + 6} Q${cx} ${cy - 16 * b} ${cx + 16} ${cy + 6}`} stroke="#f4f6ff" strokeWidth={7} fill="none" strokeLinecap="round" />;
    const h = (mood === 'wide' ? 15 : mood === 'sly' ? 6 : 10) * b, w = mood === 'wide' ? 15 : 17;
    const tilt = mood === 'angry' ? side * -7 : mood === 'sad' ? side * 6 : mood === 'sly' ? side * -3 : 0;
    return <path d={`M${cx - w} ${cy + tilt * .5} Q${cx} ${cy - h * 1.6 + tilt} ${cx + w} ${cy - tilt * .5} Q${cx} ${cy + h * 1.2} ${cx - w} ${cy + tilt * .5}Z`} fill="#f4f6ff" />; };
  return <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#eyeGlow)">{eye(-1)}{eye(1)}</g>;
};

// Тень-фигура. c,d — матрица проекции: стоя на стене c=0,d=1; лёжа на земле c=-kx, d=-ky (длина и наклон тени).
export const Shade: React.FC<{ t: number; x: number; y: number; s?: number; pose: Pose; c?: number; d?: number; eyes?: number; mood?: Mood; look?: number; flip?: boolean; opacity?: number; soft?: boolean; seed?: number; stretch?: number }> = ({ t, x, y, s = 1, pose, c = 0, d = 1, eyes = 0, mood = 'calm', look = 0, flip, opacity = 1, soft, seed = 3, stretch = 1 }) => {
  const [hx, hy] = headAt(pose);
  return <g transform={`translate(${x} ${y}) matrix(${stretch} 0 ${c} ${d} 0 0)`} opacity={opacity}>
    <g filter={soft ? 'url(#silhSoft)' : 'url(#silh)'}><Figure x={0} y={0} s={s} t={t} L={SENYA_L} C={SENYA_C} pose={pose} flip={flip} seed={seed} noContact /></g>
    {eyes > 0 && <g transform={d < 0 ? 'scale(1 -1)' : undefined}><Eyes t={t} x={hx * s * (flip ? -1 : 1)} y={(d < 0 ? -1 : 1) * hy * s} s={s} mood={mood} look={look} open={eyes} seed={seed} /></g>}
  </g>;
};
// тень от фонаря/солнца на земле для фигуры в (x,y): lx — x источника, len — длина
export const castCK = (x: number, lx: number, len = .5, side = .9) => ({ c: -clamp((x - lx) / 600, -1.6, 1.6) * side * len * 2, d: -len });

// Сеня целиком: обесцвечивание и прозрачность (растворение)
export const Senya: React.FC<{ t: number; x: number; y: number; s?: number; pose: Pose; expr?: Expr; mouth?: number; lookX?: number; lookY?: number; turn?: number; fade?: number; sat?: number; flip?: boolean; rim?: string; tears?: number; sweat?: number; seed?: number; prop?: React.ReactNode; noBlink?: boolean; phone?: number }> = (p) => {
  const fade = p.fade || 0;
  const w = wristR(p.pose, SENYA_C.w); const ph = p.phone ? <g transform={`translate(${w[0]} ${w[1]}) rotate(${-w[2] + 180})`}><rect x={-30} y={-20} width={60} height={104} rx={10} fill="#14161e" stroke="#0c0d18" strokeWidth={4} /><rect x={-24} y={-12} width={48} height={86} rx={6} fill="#7ab8ff" opacity={p.phone} /></g> : null;
  return <g opacity={1 - fade * .72} filter={p.sat !== undefined && p.sat < 1 ? 'url(#desat)' : undefined}>
    <Figure x={p.x} y={p.y} s={p.s} t={p.t} L={SENYA_L} C={SENYA_C} pose={p.pose} expr={p.expr} mouth={p.mouth} lookX={p.lookX} lookY={p.lookY} turn={p.turn} flip={p.flip} rim={p.rim} tears={p.tears} sweat={p.sweat} seed={p.seed ?? 1} prop={<>{p.prop}{ph}</>} noContact noBlink={p.noBlink} />
  </g>;
};

// говорение ртом (без голоса — «немые» реплики): открытие по слогам
export const talk = (t: number, a: number, b: number) => t < a || t > b ? 0 : clamp(.5 + .5 * Math.sin((t - a) * 17) * Math.sin((t - a) * 5.3 + 1));

// Нарратор — крупный текст по словам (y≈1150–1400)
const wrap = (s: string, n: number) => { const out: string[] = []; let cur = ''; for (const w of s.split(' ')) { if ((cur + ' ' + w).trim().length > n && cur) { out.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); } if (cur) out.push(cur); return out; };
export const Narr: React.FC<{ t: number; t0: number; t1: number; text: string; y?: number; size?: number; color?: string; who?: string; n?: number; accent?: string[] }> = ({ t, t0, t1, text, y = 1260, size = 72, color = '#fff', who, n = 18, accent = [] }) => {
  if (t < t0 - .01 || t > t1) return null;
  const o = clamp((t1 - t) / .18); const ls = wrap(text, n); let wi = 0; const per = Math.min(.16, (t1 - t0) * .4 / text.split(' ').length);
  return <g opacity={o}>
    {who && <text x={540} y={y - size * .95} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} letterSpacing={6} fill="#ffcf6a" stroke="#000" strokeWidth={8} paintOrder="stroke">{who}</text>}
    {ls.map((l, i) => <text key={i} x={540} y={y + i * size * 1.18} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size} stroke="#000" strokeWidth={size * .2} paintOrder="stroke" strokeLinejoin="round">
      {l.split(' ').map((w, j) => { const k = ease(t, t0 + wi * per, t0 + wi * per + .22); wi++; const hot = accent.some(a => w.toLowerCase().startsWith(a));
        return <tspan key={j} fill={hot ? '#ffcf4a' : color} opacity={k} dy={0}>{w + ' '}</tspan>; })}
    </text>)}
  </g>;
};

// «Письмо тени»: чёрные буквы проступают по одной, с подтёками; на светлой стене
export const SootText: React.FC<{ t: number; t0: number; lines: string[]; x?: number; y?: number; size?: number; cps?: number; lh?: number; color?: string; glow?: boolean; rot?: number }> = ({ t, t0, lines, x = 540, y = 600, size = 96, cps = 22, lh = 1.08, color = SH, glow, rot = -3 }) => {
  let idx = 0;
  return <g transform={`rotate(${rot} ${x} ${y})`}>
    {lines.map((ln, i) => <text key={i} x={x} y={y + i * size * lh} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={size} letterSpacing={2} filter={glow ? 'url(#eyeGlowW)' : undefined}>
      {ln.split('').map((ch, j) => { const at = t0 + (idx++) / cps; const k = clamp((t - at) / .12); const jit = noise('st' + i + j, 1, 1) * 4;
        return <tspan key={j} fill={color} opacity={k} dy={0} style={{ fontSize: size * (1 + (1 - k) * .6) }} stroke={glow ? '#fff' : undefined} strokeWidth={glow ? 0 : 0}>{ch}</tspan>; })}
    </text>)}
  </g>;
};
// подтёки под строкой
export const Drips: React.FC<{ t: number; t0: number; x: number; y: number; w: number; n?: number; seed?: number }> = ({ t, t0, x, y, w, n = 6, seed = 1 }) => <g>
  {Array.from({ length: n }).map((_, i) => { const hh = (Math.sin(i * 91 + seed) * .5 + .5); const len = ease(t, t0 + hh * .5, t0 + 1.6 + hh) * (30 + hh * 70); const xx = x - w / 2 + (i + .5) / n * w + Math.sin(i * 13 + seed) * 20;
    return <g key={i}><path d={`M${xx} ${y} v${len}`} stroke={SH} strokeWidth={6 + hh * 4} strokeLinecap="round" /><circle cx={xx} cy={y + len} r={5 + hh * 3} fill={SH} /></g>; })}
</g>;

// Реплика тени — чёрные буквы на белом свечении (говорит не голосом)
export const ShadowSay: React.FC<{ t: number; t0: number; t1: number; lines: string[]; y?: number; size?: number }> = ({ t, t0, t1, lines, y = 520, size = 70 }) => {
  if (t < t0 || t > t1) return null; const o = clamp((t1 - t) / .2); let idx = 0;
  return <g opacity={o}>
    {lines.map((ln, i) => <text key={i} x={540} y={y + i * size * 1.15} textAnchor="middle" fontFamily="Oswald" fontWeight={700} fontSize={size} stroke="#fff6e4" strokeWidth={size * .22} paintOrder="stroke" strokeLinejoin="round" fill={SH}>
      {ln.split('').map((ch, j) => { const k = clamp((t - t0 - (idx++) / 30) / .1); return <tspan key={j} opacity={k}>{ch}</tspan>; })}
    </text>)}
  </g>;
};

// Штамп-удар
export const Stamp: React.FC<{ t: number; t0: number; text: string; x?: number; y?: number; size?: number; color?: string; rot?: number }> = ({ t, t0, text, x = 540, y = 900, size = 150, color = '#ff3b4a', rot = -8 }) => {
  if (t < t0) return null; const k = ease(t, t0, t0 + .22); const sc = lerp(2.6, 1, k);
  return <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${sc})`} opacity={clamp(k * 2)}>
    <rect x={-text.length * size * .34 - 30} y={-size * .82} width={text.length * size * .68 + 60} height={size * 1.12} rx={18} fill="none" stroke={color} strokeWidth={14} />
    <text x={0} y={0} textAnchor="middle" fontFamily="Russo" fontSize={size} fill={color} letterSpacing={6}>{text}</text>
  </g>;
};

// HUD «до заката» — одна функция на серию: сек до заката в момент T (глобальное время серии)
export const SUN_KEYS: [number, number][] = [[22.5, 9 * 3600 + 12 * 60], [42, 2 * 3600 + 40 * 60], [47, 22 * 60], [53, 95], [61.5, 3]];
export const sunLeft = (T: number) => { const K = SUN_KEYS; if (T <= K[0][0]) return K[0][1]; for (let i = 1; i < K.length; i++) if (T < K[i][0]) { const k = (T - K[i - 1][0]) / (K[i][0] - K[i - 1][0]); return K[i - 1][1] + (K[i][1] - K[i - 1][1]) * k; } return K[K.length - 1][1]; };
const hms = (s: number) => { s = Math.max(0, Math.floor(s)); return [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map(v => String(v).padStart(2, '0')).join(':'); };
export const SunHud: React.FC<{ t: number; T: number; t0?: number; y?: number; warn?: boolean }> = ({ t, T, t0 = 0, y = 380, warn }) => {
  const k = ease(t, t0, t0 + .35); if (k <= 0) return null; const left = sunLeft(T); const red = left < 3600 || warn; const pulse = red ? .5 + .5 * Math.sin(t * 10) : 0;
  return <g transform={`translate(540 ${y}) scale(${lerp(.6, 1, k)})`} opacity={k}>
    <rect x={-300} y={-62} width={600} height={112} rx={56} fill="#0a0b14" opacity={.78} stroke={red ? '#ff4a4a' : '#ffb84a'} strokeWidth={4 + pulse * 3} />
    {/* солнце садится за линию */}
    <g transform="translate(-232 -4)"><clipPath id="sunclip"><rect x={-40} y={-50} width={80} height={62} /></clipPath>
      <circle cx={0} cy={clamp(1 - left / 33000) * 30} r={24} fill={red ? '#ff5a3a' : '#ffb84a'} clipPath="url(#sunclip)" /><path d="M-36 12 H36" stroke="#fff" strokeWidth={4} /></g>
    <text x={-180} y={-14} fontFamily={FONT} fontWeight={800} fontSize={26} letterSpacing={4} fill="#d8dcf0">ДО ЗАКАТА</text>
    <text x={-182} y={34} fontFamily="JBM" fontWeight={800} fontSize={50} fill={red ? '#ff6a5a' : '#fff'}>{hms(left)}</text>
  </g>;
};

// Кот Пиксель (рыжий), сбоку, смотрит влево; hiss 0…1 — выгибает спину, шерсть дыбом, шипит
export const Cat: React.FC<{ t: number; x: number; y: number; s?: number; hiss?: number; look?: number }> = ({ t, x, y, s = 1, hiss = 0, look = 0 }) => {
  const arch = hiss * 60, tail = Math.sin(t * 2.4) * 14 * (1 - hiss) + hiss * -40, fur = hiss;
  const O = '#e8853a', D = '#b85a1e', INK = '#1a0f0a';
  const spikes = (cx: number, cy: number, r: number) => fur > .05 ? Array.from({ length: 14 }).map((_, i) => { const a = Math.PI * (1.05 + i / 13 * .9); return <path key={i} d={`M${cx + Math.cos(a) * r * .8} ${cy + Math.sin(a) * r * .8} L${cx + Math.cos(a + .08) * (r + 22 * fur)} ${cy + Math.sin(a + .08) * (r + 22 * fur)} L${cx + Math.cos(a + .2) * r * .85} ${cy + Math.sin(a + .2) * r * .85}Z`} fill={O} stroke={INK} strokeWidth={3} />; }) : null;
  const b = blink(t, 9);
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={20} cy={4} rx={150} ry={14} fill="#000" opacity={.0} />
    {/* хвост */}
    <path d={`M120 ${-60 - arch * .5} q60 ${-40 + tail} 40 ${-120 + tail}`} stroke={INK} strokeWidth={30} fill="none" strokeLinecap="round" />
    <path d={`M120 ${-60 - arch * .5} q60 ${-40 + tail} 40 ${-120 + tail}`} stroke={O} strokeWidth={22 + fur * 10} fill="none" strokeLinecap="round" />
    {/* лапы */}
    {[-70, -40, 70, 100].map((lx, i) => <rect key={i} x={lx} y={-60 - (i < 2 ? 0 : 0)} width={24} height={62} rx={12} fill={i % 2 ? D : O} stroke={INK} strokeWidth={3.5} transform={hiss ? `translate(0 ${-arch * .1})` : undefined} />)}
    {spikes(20, -80 - arch, 95)}
    {/* туловище: выгибается дугой */}
    <path d={`M-90 -70 Q20 ${-150 - arch * 1.4} 130 -70 Q120 -30 20 -36 Q-80 -30 -90 -70Z`} fill={O} stroke={INK} strokeWidth={4} />
    <path d={`M-20 ${-110 - arch} q14 30 0 50 M20 ${-118 - arch} q14 30 0 50 M60 ${-108 - arch} q14 30 0 46`} stroke={D} strokeWidth={8} fill="none" strokeLinecap="round" />
    {/* голова */}
    <g transform={`translate(-110 ${-110 - hiss * 10}) rotate(${hiss * -8})`}>
      <path d="M-40 -30 L-34 -82 L-6 -46Z" fill={O} stroke={INK} strokeWidth={4} transform={`rotate(${-hiss * 20} -20 -40)`} />
      <path d="M40 -30 L34 -82 L6 -46Z" fill={O} stroke={INK} strokeWidth={4} transform={`rotate(${hiss * 20} 20 -40)`} />
      <ellipse cx={0} cy={0} rx={62} ry={54} fill={O} stroke={INK} strokeWidth={4} />
      {[-22, 22].map((ex, i) => <g key={i}><ellipse cx={ex - 4 + look * 6} cy={-8} rx={13} ry={(hiss ? 15 : 12) * b} fill="#d8f060" stroke={INK} strokeWidth={3} /><ellipse cx={ex - 4 + look * 9} cy={-8} rx={hiss ? 2.5 : 4} ry={11 * b} fill={INK} /></g>)}
      <path d="M-6 12 L6 12 L0 19Z" fill="#e86a7a" />
      {hiss > .1 ? <g><path d={`M-24 26 Q0 ${26 + 30 * hiss} 24 26 Q0 ${32} -24 26Z`} fill="#5a1020" stroke={INK} strokeWidth={3} /><path d="M-16 27 l3 9 l3 -9 M10 27 l3 9 l3 -9" fill="#fff" /></g> : <path d="M-12 24 q6 6 12 0 q6 6 12 0" stroke={INK} strokeWidth={3} fill="none" />}
      {[-1, 1].map(sd => [0, 10].map(dy => <path key={sd + '' + dy} d={`M${sd * 30} ${18 + dy} l${sd * 46} ${-6 + dy * .6}`} stroke={INK} strokeWidth={2} />))}
    </g>
  </g>;
};

// большая кисть руки крупным планом (ладонь к зрителю); fade — растворение кончиков
export const BigHand: React.FC<{ t: number; x: number; y: number; s?: number; rot?: number; fade?: number; color?: string; sleeve?: string; shadow?: boolean }> = ({ t, x, y, s = 1, rot = 0, fade = 0, color = SK, sleeve = '#8a8f9c', shadow }) => {
  const f = (dx: number, len: number, ang: number, w = 34) => <g key={dx} transform={`translate(${dx} -120) rotate(${ang})`}><rect x={-w / 2} y={-len} width={w} height={len + 20} rx={w / 2} fill={shadow ? SH : color} stroke={shadow ? SH : '#2a1a14'} strokeWidth={5} />
    {!shadow && <path d={`M${-w / 2 + 6} ${-len * .45} h${w - 12}`} stroke="#b07a6a" strokeWidth={3} opacity={.6} />}</g>;
  const id = 'hm' + Math.round(x) + Math.round(y);
  return <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <defs><linearGradient id={id} x1="0" y1="1" x2="0" y2="0"><stop offset={clamp(.62 - fade * .5)} stopColor="#fff" stopOpacity="1" /><stop offset={clamp(.78 - fade * .5)} stopColor="#fff" stopOpacity={.12} /><stop offset="1" stopColor="#fff" stopOpacity=".06" /></linearGradient>
      <mask id={id + 'm'}><rect x={-300} y={-520} width={600} height={900} fill={fade > 0 ? `url(#${id})` : '#fff'} /></mask></defs>
    <g mask={`url(#${id}m)`}>
      {!shadow && <rect x={-110} y={60} width={220} height={320} fill={sleeve} stroke="#2a1a14" strokeWidth={5} />}
      {f(-75, 170, -8, 36)}{f(-25, 215, -2, 38)}{f(25, 225, 2, 38)}{f(72, 190, 8, 34)}
      <path d="M-110 -40 Q-170 -70 -190 -150 Q-200 -180 -170 -180 Q-140 -170 -120 -110 L-100 -80Z" fill={shadow ? SH : color} stroke={shadow ? SH : '#2a1a14'} strokeWidth={5} />
      <path d="M-110 -150 Q-120 40 -90 80 L90 80 Q120 40 110 -150Z" fill={shadow ? SH : color} stroke={shadow ? SH : '#2a1a14'} strokeWidth={5} />
      {!shadow && <path d="M-60 -40 q50 30 110 -10 M-40 10 q40 20 90 0" stroke="#b07a6a" strokeWidth={4} fill="none" opacity={.6} />}
    </g>
    {/* искры растворения */}
    {fade > 0 && Array.from({ length: 22 }).map((_, i) => { const ph = (t * .7 + i * .137) % 1; const xx = -90 + (i * 37 % 180) + Math.sin(t * 2 + i) * 20; return <rect key={i} x={xx} y={-330 - ph * 260 + fade * 60} width={10} height={10} fill="#d8e4ff" opacity={(1 - ph) * .8 * clamp(fade * 2)} transform={`rotate(45 ${xx} ${-330 - ph * 260})`} />; })}
  </g>;
};

export const Particles: React.FC<{ t: number; t0: number; x: number; y: number; n?: number; color?: string; sp?: number; size?: number; life?: number; g?: number }> = ({ t, t0, x, y, n = 14, color = SH, sp = 380, size = 9, life = .6, g = 600 }) => {
  const dt = t - t0; if (dt < 0 || dt > life) return null; const k = dt / life;
  return <g>{Array.from({ length: n }).map((_, i) => { const a = (i / n) * Math.PI * 2 + i, v = sp * (.5 + (i * 37 % 10) / 20); return <circle key={i} cx={x + Math.cos(a) * v * dt} cy={y + Math.sin(a) * v * dt * .6 + g * dt * dt} r={size * (1 - k)} fill={color} />; })}</g>;
};
export { spr };
