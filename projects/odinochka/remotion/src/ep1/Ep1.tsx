// Серия 1: планы по монтажному листу + субтитры поверх.
import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame } from 'remotion';
import { SHOTS, starts } from './timeline';
import { Caption } from '../kit/ui';
import { MAP } from './map';
const Placeholder: React.FC<{ id: string }> = ({ id }) => <AbsoluteFill style={{ background: '#111', color: '#fff', fontSize: 80, justifyContent: 'center', alignItems: 'center', fontFamily: 'Mont' }}>{id}</AbsoluteFill>;
const ShotHost: React.FC<{ i: number }> = ({ i }) => { const f = useCurrentFrame(); const S = MAP[SHOTS[i].id]; const t = f / 30;
  return S ? <S t={t} d={SHOTS[i].d} /> : <Placeholder id={SHOTS[i].id} />; };
const Caps: React.FC = () => { const T = useCurrentFrame() / 30;
  return <AbsoluteFill><svg width={1080} height={1920}><defs><filter id="glow"><feGaussianBlur stdDeviation="6" /></filter></defs>
    {SHOTS.map((s, i) => (s.caps || []).map(([who, text, a, b], j) => <Caption key={i + '-' + j} t={T} t0={starts[i] + a} t1={starts[i] + b} who={who} text={text} color={who.startsWith('КИРИЛЛ (') ? '#9fdcff' : '#ffd76a'} italic={who.startsWith('КИРИЛЛ (')} />))}
  </svg></AbsoluteFill>; };
export const Ep1: React.FC = () => <AbsoluteFill style={{ background: '#000' }}>
  {SHOTS.map((s, i) => <Sequence key={s.id} from={Math.round(starts[i] * 30)} durationInFrames={Math.round((starts[i] + s.d) * 30) - Math.round(starts[i] * 30)}><ShotHost i={i} /></Sequence>)}
  <Caps />
</AbsoluteFill>;
