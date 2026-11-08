import React from 'react';
import { AbsoluteFill } from 'remotion';
import { DragonFront } from './chars/Cast';
export const Test: React.FC = () => (<AbsoluteFill style={{ background: '#2a1010' }}><svg viewBox="0 0 1080 1920" width="100%" height="100%">
  <rect x={0} y={0} width={540} height={1920} fill="#2a1010" /><path d="M-60,1920 L-60,560 Q270,260 600,560 L600,1920 Z" fill="#140606" /><DragonFront x={290} y={830} s={1.0} t={1} roar={.4} />
</svg></AbsoluteFill>);
