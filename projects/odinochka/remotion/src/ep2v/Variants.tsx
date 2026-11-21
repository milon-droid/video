// Композиции вариантов VarA / VarB / VarC: только отрезок «после фонаря → пропасть». Субтитры + счётчик выживших (4 → 3).
import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { Caption } from '../kit/ui';
import { ease } from '../anim';
import { MAP } from '../ep2/map';
import { SP } from '../ep1/common';
import * as S from './Shots';
import { VA, VB, VC } from './vt';
const M: Record<string, React.FC<SP>> = { ...MAP, ...Object.fromEntries(Object.entries(S).filter(([k]) => /^V[ABC]\d$/.test(k)).map(([k, v]) => [k.toLowerCase(), v as React.FC<SP>])) };
type B = ReturnType<typeof import('./vt').build>;
const Host: React.FC<{ id: string; d: number }> = ({ id, d }) => { const f = useCurrentFrame(); const C = M[id]; return C ? <C t={f / 30} d={d} /> : <AbsoluteFill style={{ background: '#111', color: '#fff', fontSize: 80 }}>{id}</AbsoluteFill>; };
const Seg: React.FC<{ v: B; death: string; label: string }> = ({ v, death, label }) => { const T = useCurrentFrame() / 30, i = v.shots.findIndex(s => s.id === death), td = v.starts[i] + v.shots[i].d - .9, n = T > td ? 3 : 4;
  return <AbsoluteFill style={{ background: '#000' }}>
    {v.shots.map((s, k) => <Sequence key={s.id + k} from={Math.round(v.starts[k] * 30)} durationInFrames={Math.round((v.starts[k] + s.d) * 30) - Math.round(v.starts[k] * 30)}><Host id={s.id} d={s.d} /></Sequence>)}
    <AbsoluteFill><svg width={1080} height={1920}><defs><filter id="glow"><feGaussianBlur stdDeviation="6" /></filter></defs>
      {v.shots.map((s, k) => s.caps.map(([who, text, a, b], j) => <Caption key={k + '-' + j} t={T} t0={v.starts[k] + a} t1={v.starts[k] + b} who={who === 'КИРИЛЛ (' ? undefined : who} text={text} color={who.startsWith('КИРИЛЛ (') ? '#9fdcff' : '#ffd76a'} italic={who.startsWith('КИРИЛЛ (')} />))}
      <g transform="translate(70 230)"><rect width={330} height={96} rx={8} fill="#06182e" opacity={.8} stroke={T > td && T < td + .8 ? '#ff4a5a' : '#5fd2ff'} strokeWidth={3} />
        <text x={22} y={40} fontFamily="Oswald" fontWeight={500} fontSize={26} letterSpacing={5} fill="#9fdcff">ВЫЖИВШИЕ</text><text x={22} y={80} fontFamily="Oswald" fontWeight={600} fontSize={34} letterSpacing={3} fill="#e8f8ff">ОТРЯД</text>
        <text x={300} y={80} textAnchor="end" fontFamily="Oswald" fontWeight={700} fontSize={72} fill={T > td && T < td + .8 ? '#ff4a5a' : '#5fd2ff'}>{n}</text></g>
      <g opacity={1 - ease(T, 1.6, 2.2)}><rect x={680} y={230} width={330} height={70} rx={8} fill="#000" opacity={.6} /><text x={845} y={278} textAnchor="middle" fontFamily="Oswald" fontWeight={600} fontSize={38} letterSpacing={6} fill="#ffd76a">{label}</text></g>
    </svg></AbsoluteFill>
  </AbsoluteFill>; };
export const VarA: React.FC = () => <Seg v={VA} death="va6" label="ВАРИАНТ А" />;
export const VarB: React.FC = () => <Seg v={VB} death="vb5" label="ВАРИАНТ Б" />;
export const VarC: React.FC = () => <Seg v={VC} death="vc6" label="ВАРИАНТ В" />;
export const VTOT = { A: VA.total, B: VB.total, C: VC.total };
