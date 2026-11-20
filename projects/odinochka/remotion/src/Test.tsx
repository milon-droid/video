import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Defs } from './kit/fx';
import { Figure, POSES } from './chars/body';
import { Head } from './chars/head';
import { LK, CS } from './chars/cast';
export const Test: React.FC = () => { const t = useCurrentFrame() / 30;
  const row: [string, string, string, keyof typeof POSES][] = [['kirill', 'kirill', 'calm', 'stand'], ['nastya', 'nastya', 'sad', 'hold'], ['liza', 'liza', 'scared', 'heal'], ['mikh', 'mikh', 'determined', 'shrug'], ['zhora', 'zhora', 'smirk', 'tense'], ['coll1', 'coll', 'angry', 'pointR']];
  return <AbsoluteFill style={{ background: '#1a2238' }}><svg width={1080} height={1920}><Defs />
    {row.map(([l, c, e, p], i) => <Figure key={i} x={180 + (i % 3) * 360} y={i < 3 ? 900 : 1880} s={.95} t={t} L={LK[l]} C={CS[c]} pose={POSES[p]} expr={e as any} seed={i + 1} />)}
  </svg></AbsoluteFill>; };
export const TestHeads: React.FC = () => { const t = useCurrentFrame() / 30; const ks = ['kirill', 'nastya', 'liza', 'mikh', 'zhora', 'coll1'];
  const ex = ['calm', 'scared', 'angry', 'shout', 'sad', 'determined'];
  return <AbsoluteFill style={{ background: '#1a2238' }}><svg width={1080} height={1920}><Defs />
    {ks.map((k, i) => <g key={k} transform={`translate(${200 + (i % 2) * 600} ${300 + Math.floor(i / 2) * 600}) scale(2.4)`}><Head t={t} L={LK[k]} expr={ex[i] as any} seed={i} turn={i % 2 ? -.4 : .3} glow={k === 'kirill' ? 0 : 0} /></g>)}
  </svg></AbsoluteFill>; };
