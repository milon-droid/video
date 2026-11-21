// Серия 2: планы по монтажному листу + субтитры.
import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { SHOTS, starts } from './timeline';
import { Caption } from '../kit/ui';
import { ease, spr } from '../anim';
import { MAP } from './map';
const Ph: React.FC<{ id: string }> = ({ id }) => <AbsoluteFill style={{ background: '#111', color: '#fff', fontSize: 80, justifyContent: 'center', alignItems: 'center' }}>{id}</AbsoluteFill>;
const Host: React.FC<{ i: number }> = ({ i }) => { const f = useCurrentFrame(); const S = MAP[SHOTS[i].id]; return S ? <S t={f / 30} d={SHOTS[i].d} /> : <Ph id={SHOTS[i].id} />; };
const FIRST = (() => { for (const s of SHOTS) for (const c of s.caps || []) if (c[0].startsWith('КИРИЛЛ (')) return c[4]; return ''; })();
const Caps: React.FC = () => { const T = useCurrentFrame() / 30;
  return <AbsoluteFill><svg width={1080} height={1920}><defs><filter id="glow"><feGaussianBlur stdDeviation="6" /></filter></defs>
    {SHOTS.map((s, i) => (s.caps || []).map(([who, text, a, b, id], j) => <Caption key={i + '-' + j} t={T} t0={starts[i] + a} t1={starts[i] + b} who={who.startsWith('КИРИЛЛ (') && id !== FIRST ? undefined : who} text={text} color={who.startsWith('КИРИЛЛ (') ? '#9fdcff' : '#ffd76a'} italic={who.startsWith('КИРИЛЛ (')} />))}
  </svg></AbsoluteFill>; };
// счётчик выживших (как интерфейс Системы): 6 → 4 (фонарь) → 3 (Михалыч) → 2 (Лёха) → 1 (Кирилл теряет сознание) → 2 (принял контракт) → исчезает
const S0 = (id: string) => { const i = SHOTS.findIndex(s => s.id === id); return { a: starts[i], d: SHOTS[i].d, c: SHOTS[i].caps }; };
const EV = (() => { const g8 = S0('g8'), i6 = S0('i6'), i7 = S0('i7'); const yes = i7.c?.[0] ? i7.c[0][2] + .3 : 2.6;
  return { show: S0('a4').a + 1.2, ev: [[S0('e2').a + 1.2, 5], [S0('e3').a + 1.05, 4], [g8.a + g8.d - 1.4, 3], [S0('i2').a + 2.6, 2], [i6.a + i6.d - 1.0, 1], [i7.a + yes + .5, 2]] as [number, number][], hide: i7.a + i7.d - .1 }; })();
const Counter: React.FC = () => { const T = useCurrentFrame() / 30; if (T < EV.show || T > EV.hide + .6) return null;
  let n = 6, last = -9; for (const [t0, v] of EV.ev) if (T >= t0) { n = v; last = t0; }
  const k = ease(T, EV.show, EV.show + .4) * (1 - ease(T, EV.hide, EV.hide + .6)), hit = spr(T, last, { damping: 9 }), fresh = T - last < .8, up = n === 2 && last === EV.ev[5][0];
  const col = fresh ? (up ? '#7fe0ff' : '#ff4a5a') : n <= 1 ? '#ff4a5a' : '#5fd2ff', blink = n === 1 && Math.floor(T * 3) % 2 === 0;
  return <AbsoluteFill><svg width={1080} height={1920}><defs><filter id="cglow"><feGaussianBlur stdDeviation="5" /></filter></defs>
    <g transform={`translate(70 230) scale(${1 + (fresh ? (1 - hit) * .25 : 0)})`} opacity={k * (blink ? .55 : 1)}>
      <rect x={0} y={0} width={330} height={96} rx={8} fill="#06182e" opacity={.8} stroke={col} strokeWidth={3} />
      <rect x={0} y={0} width={330} height={96} rx={8} fill="none" stroke={col} strokeWidth={6} opacity={.5} filter="url(#cglow)" />
      <text x={22} y={40} fontFamily="Oswald" fontWeight={500} fontSize={26} letterSpacing={5} fill="#9fdcff">ВЫЖИВШИЕ</text>
      <text x={22} y={80} fontFamily="Oswald" fontWeight={600} fontSize={34} letterSpacing={3} fill="#e8f8ff">ОТРЯД</text>
      <text x={300} y={80} textAnchor="end" fontFamily="Oswald" fontWeight={700} fontSize={72} fill={col} filter={fresh ? 'url(#cglow)' : undefined}>{n}</text>
      <text x={300} y={80} textAnchor="end" fontFamily="Oswald" fontWeight={700} fontSize={72} fill={col}>{n}</text>
    </g></svg></AbsoluteFill>; };
export const Ep2: React.FC = () => <AbsoluteFill style={{ background: '#000' }}>
  {SHOTS.map((s, i) => <Sequence key={s.id} from={Math.round(starts[i] * 30)} durationInFrames={Math.round((starts[i] + s.d) * 30) - Math.round(starts[i] * 30)}><Host i={i} /></Sequence>)}
  <Counter />
  <Caps />
</AbsoluteFill>;
