import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Defs, Fog } from './kit/fx';
import { Basil, Gate, KremlinTower, KremlinWall, MoscowCity, Ostankino, Panelka, Sky, Vysotka } from './bg/moscow';
export const TestCity: React.FC<{ night?: boolean }> = ({ night = true }) => { const t = useCurrentFrame() / 30;
  return <AbsoluteFill><svg width={1080} height={1920}><Defs />
    <Sky top={night ? '#050816' : '#5a7ab0'} bot={night ? '#2a2050' : '#c8b8b0'} stars={night} t={t} />
    {!night && <Gate x={600} y={500} s={1.1} t={t} />}
    <MoscowCity x={700} y={1250} s={.55} t={t} night={night} />
    <Ostankino x={120} y={1250} s={.6} t={t} />
    <Vysotka x={300} y={1300} s={.6} seed={4} />
    <Fog t={t} y={1250} k={.35} color={night ? '#3a3a7a' : '#d8d0e0'} />
    <Panelka x={-40} y={1500} w={300} floors={9} />
    <Panelka x={820} y={1500} w={300} floors={10} seed={9} />
    <KremlinWall x={0} y={1560} w={1080} night={night} />
    <KremlinTower x={760} y={1600} s={.85} night={night} />
    <Basil x={300} y={1700} s={.9} night={night} />
    <rect y={1700} width={1080} height={220} fill={night ? '#140a12' : '#6a4a4a'} />
  </svg></AbsoluteFill>; };
