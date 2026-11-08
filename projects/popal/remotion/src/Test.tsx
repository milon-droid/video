import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Elf, Dragon, KingBull, ChibiSlime } from './chars/Cast';
export const Test: React.FC = () => (<AbsoluteFill style={{ background: '#2a2a3a' }}><svg viewBox="0 0 1080 1920" width="100%" height="100%">
  <rect x={0} y={0} width={540} height={960} fill="#14382a" /><Elf x={270} y={900} s={.8} t={1} />
  <rect x={540} y={0} width={540} height={960} fill="#2a1010" /><Dragon x={740} y={700} s={.75} t={1} roar={.5} />
  <KingBull x={540} y={1700} s={.6} t={1} />
  <ChibiSlime x={900} y={1850} s={.5} t={1} />
</svg></AbsoluteFill>);
