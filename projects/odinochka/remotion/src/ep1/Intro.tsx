// Заставка серии в духе Solo Leveling: тьма → синяя вспышка → «лезвие» разрезает кадр и открывает название, осколки, искры, номер серии.
import React from 'react';
import { clamp, ease, noise, spr } from '../anim';
import { Flash, h1, Motes, shakeXY } from '../kit/fx';
import { Frame, SP } from './common';

export const Intro: React.FC<SP & { ep?: number; name?: string }> = ({ t, d, ep = 1, name = 'ПОСЛЕДНИЙ ПОЕЗД' }) => {
  const cut = .55, rev = ease(t, cut, cut + .35), [sx, sy] = shakeXY(t, [[cut, 18, .5]]);
  const out = clamp((d - t) / .35), cy = 900;
  const shards = Array.from({ length: 26 }).map((_, i) => { const a = h1(i * 3.1) * Math.PI * 2, sp = 300 + h1(i * 7.7) * 900, q = clamp((t - cut) / 1.4);
    const x = 540 + Math.cos(a) * sp * q, y = cy + Math.sin(a) * sp * q * .7 + q * q * 300, r = 10 + h1(i * 5) * 34;
    return <polygon key={i} points={`${x},${y - r} ${x + r * .7},${y + r * .4} ${x - r * .5},${y + r * .6}`} fill="#cfefff" opacity={(1 - q) * .8} transform={`rotate(${q * 400 * (h1(i) - .5)} ${x} ${y})`} />; });
  const T = (dx: number, col: string, op: number) => <text x={540 + dx} y={cy + 60} textAnchor="middle" fontFamily="CormSC, serif" fontWeight={700} fontSize={138} letterSpacing={4} fill={col} opacity={op}>ОДИНОЧКА</text>;
  return <Frame t={t} vign={1} over={<g><Flash t={t} t0={cut} dur={.4} color="#bfe8ff" max={.9} /><rect width={1080} height={1920} fill="#000" opacity={1 - out} /></g>}>
    <rect width={1080} height={1920} fill="#02040c" />
    <g transform={`translate(${sx} ${sy})`}>
      <ellipse cx={540} cy={cy} rx={900 * rev} ry={420 * rev} fill="#1a4aaa" opacity={.45} filter="url(#blur30)" />
      {/* уголки окна Системы раскрываются */}
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b], i) => { const k = spr(t, cut + .1 + i * .04, { damping: 14 }); const X = 540 + a * 430 * k, Y = cy + b * 230 * k;
        return <path key={i} d={`M${X} ${Y - b * 60} V${Y} H${X - a * 60}`} stroke="#5fd2ff" strokeWidth={6} fill="none" filter="url(#glow)" opacity={k} />; })}
      {/* название: проявляется за «лезвием», синий и красный сдвиг по краям, белое ядро */}
      <defs><clipPath id="introClip"><rect x={0} y={cy - 200} width={1080 * rev} height={400} /></clipPath></defs>
      <g clipPath="url(#introClip)">
        <g filter="url(#glowBig)">{T(0, '#5fd2ff', .55)}</g>
        {T(-4 - noise('ia', t, 8) * 3, '#3a8cff', .6)}{T(4 + noise('ib', t, 8) * 3, '#ff3a6a', .25)}{T(0, '#f4fbff', 1)}
      </g>
      {/* лезвие-полоса света */}
      {t > cut - .05 && t < cut + .5 && <g><rect x={1080 * rev - 30} y={cy - 220} width={60} height={440} fill="#e8fbff" filter="url(#glowBig)" /><rect x={-50} y={cy - 4} width={1180} height={8} fill="#e8fbff" opacity={1 - rev} filter="url(#glow)" /></g>}
      {shards}
      <line x1={540 - 360 * ease(t, cut + .5, cut + 1)} x2={540 + 360 * ease(t, cut + .5, cut + 1)} y1={cy + 120} y2={cy + 120} stroke="#5fd2ff" strokeWidth={3} filter="url(#glow)" />
      <g opacity={ease(t, cut + .7, cut + 1.1)}>
        <text x={540} y={cy + 200} textAnchor="middle" fontFamily="Oswald" fontWeight={300} fontSize={46} letterSpacing={22} fill="#9fdcff">{`СЕРИЯ ${ep}`}</text>
        <text x={540} y={cy + 268} textAnchor="middle" fontFamily="Oswald" fontWeight={500} fontSize={54} letterSpacing={10} fill="#e8f4ff">{name}</text>
      </g>
      <Motes t={t} x={540} y={1700} w={1100} h={1500} n={50} color="#7fe0ff" speed={180} k={rev} />
    </g>
  </Frame>;
};
