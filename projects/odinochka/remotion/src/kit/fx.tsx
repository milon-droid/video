// Эффекты аниме-экшена: зерно, виньетка, линии скорости, вспышка, импакт-инверсия, лучи, дым, дождь, искры.
import React from 'react';
import { clamp, noise, win } from '../anim';

export const h1 = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

// общие фильтры и градиенты — класть один раз в <defs> каждого кадра
export const Defs: React.FC = () => (
  <defs>
    <filter id="blur4" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" /></filter>
    <filter id="blur12" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="12" /></filter>
    <filter id="blur30" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="30" /></filter>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
    <filter id="glowBig" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="16" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
    <radialGradient id="puff"><stop offset="0" stopColor="#fff" stopOpacity=".9" /><stop offset=".5" stopColor="#fff" stopOpacity=".35" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
    <radialGradient id="puffDark"><stop offset="0" stopColor="#05060c" stopOpacity=".95" /><stop offset=".55" stopColor="#0a0c18" stopOpacity=".6" /><stop offset="1" stopColor="#0a0c18" stopOpacity="0" /></radialGradient>
    <radialGradient id="vign" cx=".5" cy=".45" r=".75"><stop offset=".55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".85" /></radialGradient>
    <linearGradient id="ray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".55" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
  </defs>
);

export const Vignette: React.FC<{ k?: number }> = ({ k = 1 }) => <rect width={1080} height={1920} fill="url(#vign)" opacity={k} />;

// плёночное зерно: мелкие точки, меняются каждый кадр
export const Grain: React.FC<{ t: number; k?: number }> = ({ t, k = .07 }) => {
  const f = Math.floor(t * 30); const pts = [];
  for (let i = 0; i < 260; i++) { const a = h1(i * 3.1 + f * 17.7), b = h1(i * 7.3 + f * 3.9); pts.push(<rect key={i} x={a * 1080} y={b * 1920} width={2.5} height={2.5} fill={i % 2 ? '#fff' : '#000'} />); }
  return <g opacity={k}>{pts}</g>;
};

// радиальные линии скорости к центру (cx, cy)
export const SpeedLines: React.FC<{ t: number; cx?: number; cy?: number; n?: number; inner?: number; color?: string; k?: number }> = ({ t, cx = 540, cy = 900, n = 70, inner = 260, color = '#fff', k = 1 }) => {
  const f = Math.floor(t * 30 / 2); const ls = [];
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + h1(i + f * 13) * .08, r0 = inner + h1(i * 9 + f) * 260, w = 2 + h1(i * 5 + f * 3) * 9;
    const x0 = cx + Math.cos(a) * r0, y0 = cy + Math.sin(a) * r0, x1 = cx + Math.cos(a) * 2200, y1 = cy + Math.sin(a) * 2200, px = -Math.sin(a) * w, py = Math.cos(a) * w;
    ls.push(<polygon key={i} points={`${x0},${y0} ${x1 + px},${y1 + py} ${x1 - px},${y1 - py}`} fill={color} opacity={.35 + h1(i * 2 + f) * .5} />); }
  return <g opacity={k}>{ls}</g>;
};

// горизонтальные/наклонные линии движения (рывок)
export const DashLines: React.FC<{ t: number; ang?: number; k?: number; color?: string }> = ({ t, ang = 0, k = 1, color = '#fff' }) => {
  const f = Math.floor(t * 30); const ls = [];
  for (let i = 0; i < 40; i++) { const y = h1(i * 4.7) * 2200 - 140, x = ((h1(i * 2.3) * 3000 + f * 160) % 3000) - 900, L = 200 + h1(i) * 700;
    ls.push(<rect key={i} x={x} y={y} width={L} height={2 + h1(i * 8) * 6} fill={color} opacity={.25 + h1(i * 3) * .5} />); }
  return <g opacity={k} transform={`rotate(${ang} 540 960)`}>{ls}</g>;
};

export const Flash: React.FC<{ t: number; t0: number; dur?: number; color?: string; max?: number }> = ({ t, t0, dur = .35, color = '#fff', max = 1 }) => {
  if (t < t0 || t > t0 + dur) return null; const k = 1 - (t - t0) / dur;
  return <rect width={1080} height={1920} fill={color} opacity={max * k * k} />;
};

// импакт-кадр: инверсия + контраст на n кадров. Оборачивает содержимое.
export const isImpact = (t: number, t0: number, frames = 3) => t >= t0 && t < t0 + frames / 30;
export const ImpactWrap: React.FC<{ on: boolean; children: React.ReactNode }> = ({ on, children }) => (
  <div style={{ position: 'absolute', inset: 0, filter: on ? 'invert(1) grayscale(1) contrast(3.2)' : undefined }}>{children}</div>
);

// «моргание» — чёрные веки сверху и снизу (0 открыто, 1 закрыто)
export const Lids: React.FC<{ k: number }> = ({ k }) => { if (k <= 0) return null; const h = 960 * clamp(k);
  return <g><rect width={1080} height={h} fill="#000" /><rect y={1920 - h} width={1080} height={h} fill="#000" /></g>; };

// объёмные лучи сверху (x0 — центр источника)
export const Rays: React.FC<{ t: number; x0?: number; y0?: number; n?: number; color?: string; k?: number; spread?: number; len?: number }> = ({ t, x0 = 540, y0 = -100, n = 6, color = '#9fd8ff', k = .35, spread = 900, len = 2200 }) => {
  const id = 'ray' + color.replace('#', ''); const rs = [];
  for (let i = 0; i < n; i++) { const xx = x0 + (i / Math.max(1, n - 1) - .5) * spread + noise('ray' + i, t, .2) * 40, w = 50 + h1(i * 3) * 110, o = .4 + .6 * (.5 + .5 * noise('ro' + i, t, .4));
    rs.push(<polygon key={i} points={`${x0 + (xx - x0) * .2 - w * .2},${y0} ${x0 + (xx - x0) * .2 + w * .2},${y0} ${xx + w},${y0 + len} ${xx - w},${y0 + len}`} fill={`url(#${id})`} opacity={o} />); }
  return <g opacity={k} style={{ mixBlendMode: 'screen' }}><defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={color} stopOpacity=".7" /><stop offset="1" stopColor={color} stopOpacity="0" /></linearGradient></defs><g filter="url(#blur12)">{rs}</g></g>;
};

// мягкие клубы дыма/пыли (не плоские кружки: свой радиальный градиент + рост + дрейф)
export const Smoke: React.FC<{ t: number; t0?: number; x: number; y: number; n?: number; r?: number; spread?: number; color?: string; life?: number; rise?: number; k?: number; seed?: number }> = ({ t, t0 = -10, x, y, n = 10, r = 120, spread = 220, color = '#9aa3b8', life = 2.5, rise = 120, k = .8, seed = 1 }) => {
  if (t < t0) return null; const ps = []; const tt = t - t0; const id = 'sm' + seed + color.replace('#', '');
  for (let i = 0; i < n; i++) { const d = h1(i + seed * 31) * life * .5, q = clamp((tt - d) / life); if (q <= 0 || q >= 1) continue;
    const a = h1(i * 7 + seed) * Math.PI * 2, rr = spread * (.3 + .7 * h1(i * 5 + seed)) * Math.sqrt(q);
    const cx = x + Math.cos(a) * rr + noise('sm' + i + seed, t, .3) * 30, cy = y + Math.sin(a) * rr * .45 - rise * q, R = r * (.5 + q) * (.7 + .6 * h1(i * 11 + seed));
    const o = (q < .15 ? q / .15 : 1 - (q - .15) / .85) * k;
    ps.push(<circle key={i} cx={cx} cy={cy} r={R} fill={`url(#${id})`} opacity={o} />); }
  return <g><defs><radialGradient id={id}><stop offset="0" stopColor={color} stopOpacity=".85" /><stop offset=".55" stopColor={color} stopOpacity=".35" /><stop offset="1" stopColor={color} stopOpacity="0" /></radialGradient></defs>{ps}</g>;
};

// постоянный низкий туман (слой глубины)
export const Fog: React.FC<{ t: number; y: number; color?: string; k?: number; h?: number }> = ({ t, y, color = '#8fa6d8', k = .25, h = 260 }) => {
  const ps = []; for (let i = 0; i < 9; i++) { const x = ((i * 170 + t * (12 + i * 3)) % 1500) - 200; ps.push(<ellipse key={i} cx={x} cy={y + Math.sin(i * 2.1) * h * .3} rx={260 + h1(i) * 200} ry={h * (.4 + h1(i * 3) * .4)} fill={color} />); }
  return <g opacity={k} filter="url(#blur30)">{ps}</g>;
};

export const Rain: React.FC<{ t: number; k?: number; ang?: number; n?: number; color?: string }> = ({ t, k = .5, ang = 12, n = 140, color = '#b8c8ff' }) => {
  const ls = []; for (let i = 0; i < n; i++) { const sp = 2400 + h1(i * 3) * 1200, L = 40 + h1(i * 7) * 70, x = h1(i * 1.7) * 1300 - 110, y = ((h1(i * 2.9) * 2200 + t * sp) % 2200) - 140;
    ls.push(<line key={i} x1={x} y1={y} x2={x - Math.tan(ang * Math.PI / 180) * L} y2={y + L} stroke={color} strokeWidth={1.5 + h1(i) * 1.5} opacity={.3 + h1(i * 5) * .5} />); }
  return <g opacity={k}>{ls}</g>;
};

// искры/частицы (летят вверх) — энергия, угольки
export const Motes: React.FC<{ t: number; x: number; y: number; w?: number; h?: number; n?: number; color?: string; k?: number; speed?: number; size?: number }> = ({ t, x, y, w = 600, h = 900, n = 40, color = '#7fd0ff', k = 1, speed = 120, size = 5 }) => {
  const ps = []; for (let i = 0; i < n; i++) { const yy = y - ((h1(i * 3.3) * h + t * speed * (.5 + h1(i))) % h), xx = x + (h1(i * 1.9) - .5) * w + Math.sin(t * 2 + i) * 14, o = Math.sin(clamp((y - yy) / h) * Math.PI);
    ps.push(<circle key={i} cx={xx} cy={yy} r={size * (.4 + h1(i * 7))} fill={color} opacity={o} />); }
  return <g opacity={k} filter="url(#glow)">{ps}</g>;
};

// тряска камеры от времени t: список [t0, amp, dur]
export const shakeXY = (t: number, list: [number, number, number][]) => list.reduce((a, [t0, amp, d]) => { if (t < t0 || t > t0 + d) return a; const q = 1 - (t - t0) / d; return [a[0] + Math.sin((t - t0) * 87) * amp * q, a[1] + Math.cos((t - t0) * 61) * amp * q]; }, [0, 0]);

// камера: масштаб вокруг точки (fx, fy), сдвиг (dx, dy), поворот rot
export const cam = (z: number, fx = 540, fy = 960, dx = 0, dy = 0, rot = 0) => `translate(${540 + dx} ${960 + dy}) rotate(${rot}) scale(${z}) translate(${-fx} ${-fy})`;

export { win };
