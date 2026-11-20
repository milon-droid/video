// «Было / стало» главного героя: головы крупно + в полный рост
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Defs } from './kit/fx';
import { Figure, PK } from './chars/body';
import { Head } from './chars/head';
import { LK, CS } from './chars/cast';
import { FONT } from './kit/ui';
export const Compare: React.FC = () => { const t = useCurrentFrame() / 30;
  const pose = PK(t % 4, [[0, 'stand'], [1.2, 'stand'], [1.6, { armR: [40, -110], head: 8 }], [2.8, { armR: [40, -110], head: 8 }], [3.3, 'stand']]);
  const col = (x: number, old: boolean) => <g>
    <text x={x} y={90} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60} fill={old ? '#8a90a0' : '#ff9a4a'}>{old ? 'БЫЛО' : 'СТАЛО'}</text>
    <g transform={`translate(${x} 470) scale(2.4)`}><Head t={t} L={old ? LK.kirill : LK.kirill3} expr="calm" seed={3} turn={Math.sin(t * .8) * .4} lookX={Math.sin(t * .8) * .5} sway={old ? 0 : Math.cos(t * .8) * .6} /></g>
    <Figure x={x} y={1840} s={1.12} t={t} L={old ? LK.kirill : LK.kirill3} C={old ? CS.kirill : CS.jacket3} pose={pose} seed={3} idle={!old} turn={.2} />
  </g>;
  return <AbsoluteFill style={{ background: '#141a2c' }}><svg width={1080} height={1920}><Defs />
    <rect x={540} y={0} width={540} height={1920} fill="#1c2238" />{col(270, true)}{col(810, false)}</svg></AbsoluteFill>; };
