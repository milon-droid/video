// Серия 1 «Заявление»: планы по монтажному листу. Ten720 — та же серия, вписанная в 720×1280.
import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { SHOTS, starts } from './timeline';
import * as A from './ShotsA';
import * as B from './ShotsB';
import * as C from './ShotsC';
const MAP: Record<string, React.FC<A.ShotP>> = { ...A, ...B, ...C } as never;
const Host: React.FC<{ i: number }> = ({ i }) => { const f = useCurrentFrame(); const S = MAP[SHOTS[i].id];
  return S ? <S t={f / 30} d={SHOTS[i].d} T0={starts[i]} /> : <AbsoluteFill style={{ background: '#222', color: '#fff', fontSize: 90 }}>{SHOTS[i].id}</AbsoluteFill>; };
export const Ten1: React.FC<{ audio?: boolean }> = ({ audio }) => <AbsoluteFill style={{ background: '#000' }}>
  {SHOTS.map((s, i) => <Sequence key={s.id} from={Math.round(starts[i] * 30)} durationInFrames={Math.round((starts[i] + s.d) * 30) - Math.round(starts[i] * 30)}><Host i={i} /></Sequence>)}
  {audio && <Audio src={staticFile('audio/mix.wav')} />}
</AbsoluteFill>;
export const Ten720: React.FC = () => <AbsoluteFill style={{ background: '#000' }}>
  <div style={{ width: 1080, height: 1920, transform: 'scale(0.6666667)', transformOrigin: '0 0' }}><Ten1 audio /></div>
</AbsoluteFill>;
