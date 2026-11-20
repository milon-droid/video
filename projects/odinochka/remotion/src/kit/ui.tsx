// Интерфейс: окно Системы, подписи-субтитры, титры, лестница рангов, экран телефона.
import React from 'react';
import { clamp, ease, spr } from '../anim';

export const FONT = 'Mont, Inter, sans-serif';
export const MONO = 'JBM, monospace';
export const SYS = '#5fd2ff';

// печать текста по символам от t0 со скоростью cps
export const typed = (s: string, t: number, t0: number, cps = 28) => s.slice(0, Math.max(0, Math.floor((t - t0) * cps)));

// окно Системы: полупрозрачная синяя панель, уголки, свечение; появляется разворотом от центра
export const SysWin: React.FC<{ t: number; t0: number; x?: number; y?: number; w?: number; title?: string; lines: string[]; size?: number; color?: string; t1?: number; cps?: number; center?: boolean }> = ({ t, t0, x = 540, y = 700, w = 860, title, lines, size = 52, color = SYS, t1, cps = 30, center = true }) => {
  if (t < t0) return null;
  const open = spr(t, t0, { damping: 14, stiffness: 160 }), close = t1 !== undefined ? clamp(1 - (t - t1) / .25) : 1;
  const lh = size * 1.35, h = (title ? 90 : 30) + lines.length * lh + 40, sy = open * close;
  let acc = 0; const t2 = t0 + .25;
  return (
    <g transform={`translate(${x} ${y}) scale(${.6 + .4 * open} ${sy})`} opacity={close}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="#06182e" opacity={.72} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="none" stroke={color} strokeWidth={3} opacity={.9} filter="url(#glow)" />
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy2], i) => <path key={i} d={`M${sx * w / 2} ${sy2 * h / 2 - sy2 * 40} V${sy2 * h / 2} H${sx * w / 2 - sx * 40}`} transform={`translate(${sx * 8} ${sy2 * 8})`} stroke={color} strokeWidth={7} fill="none" filter="url(#glow)" />)}
      {title && <g><text x={0} y={-h / 2 + 62} textAnchor="middle" fill={color} fontFamily={FONT} fontWeight={800} fontSize={40} letterSpacing={6} filter="url(#glow)">{title}</text>
        <line x1={-w / 2 + 50} x2={w / 2 - 50} y1={-h / 2 + 88} y2={-h / 2 + 88} stroke={color} strokeWidth={2} opacity={.6} /></g>}
      {lines.map((l, i) => { const s = typed(l, t, t2 + acc / cps, cps); acc += l.length + 6;
        return <text key={i} x={center ? 0 : -w / 2 + 50} y={-h / 2 + (title ? 110 : 30) + lh * (i + .8)} textAnchor={center ? 'middle' : 'start'} fill="#e8f8ff" fontFamily={FONT} fontWeight={700} fontSize={size} filter="url(#glow)">{s}</text>; })}
    </g>
  );
};

// плашка-субтитр: кто говорит + текст. Зона y 1180–1420. Появление снизу, одна строка ≤ ~22 символа.
const wrap = (s: string, n: number) => { const ws = s.split(' '), out: string[] = []; let cur = '';
  for (const w of ws) { if ((cur + ' ' + w).trim().length > n && cur) { out.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); } if (cur) out.push(cur); return out; };
export const Caption: React.FC<{ t: number; t0: number; t1: number; who?: string; text: string; color?: string; y?: number; italic?: boolean }> = ({ t, t0, t1, who, text, color = '#ffd76a', y = 1290, italic }) => {
  if (t < t0 || t > t1) return null;
  const k = ease(t, t0, t0 + .22), o = Math.min(k, clamp((t1 - t) / .2)); const ls = wrap(text, 22); const fs = 62, lh = 76;
  const words = text.split(' ').length, shown = Math.ceil(words * clamp((t - t0) / Math.max(.4, Math.min(1.6, (t1 - t0) * .5))));
  let wi = 0;
  return (
    <g opacity={o} transform={`translate(0 ${(1 - k) * 30})`}>
      {who && <text x={540} y={y - 58} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} letterSpacing={5} fill={color} stroke="#000" strokeWidth={8} paintOrder="stroke">{who}</text>}
      {ls.map((l, i) => <text key={i} x={540} y={y + i * lh} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontStyle={italic ? 'italic' : undefined} fontSize={fs} fill="#fff" stroke="#000" strokeWidth={12} paintOrder="stroke" strokeLinejoin="round">
        {l.split(' ').map((w, j) => { const vis = wi++ < shown; return <tspan key={j} opacity={vis ? 1 : .0}>{w + ' '}</tspan>; })}
      </text>)}
    </g>
  );
};

// большой титр (ГОД НАЗАД / название серии)
export const Title: React.FC<{ t: number; t0: number; text: string; sub?: string; y?: number; size?: number; color?: string }> = ({ t, t0, text, sub, y = 900, size = 120, color = '#fff' }) => {
  if (t < t0) return null; const k = ease(t, t0, t0 + .5);
  return <g opacity={k}>
    <text x={540} y={y} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size} letterSpacing={12 + (1 - k) * 30} fill={color} filter="url(#glow)">{text}</text>
    {sub && <text x={540} y={y + size * .75} textAnchor="middle" fontFamily={FONT} fontWeight={600} fontSize={44} letterSpacing={8} fill="#9fb4d8">{sub}</text>}
  </g>;
};

// лестница рангов S…E, нижняя (E) мигает красным
export const RankLadder: React.FC<{ t: number; t0: number }> = ({ t, t0 }) => {
  const rs = [['S', '#ffcf4a'], ['A', '#ff7a4a'], ['B', '#c46bff'], ['C', '#4aa8ff'], ['D', '#4adf9a'], ['E', '#8a90a0']];
  return <g>{rs.map(([r, c], i) => { const k = spr(t, t0 + i * .12, { damping: 13 }); const isE = r === 'E'; const blink = isE && t > t0 + 1.1 ? (Math.floor(t * 4) % 2 ? 1 : .35) : 1;
    const w = 640 - i * 60, y = 260 + i * 125;
    return <g key={r} transform={`translate(${540 + (1 - k) * 400} ${y})`} opacity={k}>
      <rect x={-w / 2} y={-52} width={w} height={104} fill={isE ? '#3a0710' : '#0b1426'} opacity={.85} stroke={isE ? '#ff3b4f' : c} strokeWidth={3} />
      <text x={-w / 2 + 40} y={30} fontFamily={FONT} fontWeight={900} fontSize={80} fill={isE ? '#ff3b4f' : c} opacity={blink}>{r}</text>
      <text x={w / 2 - 30} y={20} textAnchor="end" fontFamily={FONT} fontWeight={700} fontSize={isE ? 40 : 32} fill={isE ? '#ffd0d5' : '#c8d4ea'} opacity={blink}>{isE ? 'КИРИЛЛ ВОЛКОВ' : ['ГЕРОИ', 'ЭЛИТА', 'ГИЛЬДИИ', 'ОПЫТНЫЕ', 'НОВИЧКИ'][i]}</text>
    </g>; })}</g>;
};

// экран телефона (рука держит снизу) — содержимое children в координатах экрана 0..440 × 0..880
export const Phone: React.FC<{ x: number; y: number; s?: number; rot?: number; children?: React.ReactNode }> = ({ x, y, s = 1, rot = 0, children }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-240} y={-460} width={480} height={920} rx={56} fill="#0b0c10" stroke="#2a2e3a" strokeWidth={6} />
    <rect x={-220} y={-440} width={440} height={880} rx={40} fill="#0f1830" />
    <g transform="translate(-220 -440)">{children}</g>
    <rect x={-60} y={-428} width={120} height={26} rx={13} fill="#000" />
  </g>
);
