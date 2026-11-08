import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Character } from './char/Character';
import './fonts';
export const CharTest: React.FC = () => { const t = useCurrentFrame() / 30;
  return (<AbsoluteFill style={{ background: 'linear-gradient(#E9D6B2,#C9AD80)' }}><svg viewBox="0 0 1080 1920" width="100%" height="100%">
    <Character who="alik" x={230} y={700} s={1.05} t={t} expr="focus" armR={{ to: [180, 1050], pose: 'grip' }} armL={{ to: [-120, 900], pose: 'relax' }} />
    <Character who="beka" x={560} y={760} s={1.05} t={t} expr="smile" armR={{ to: [-60, 330], pose: 'grip', hold: <rect x={-6} y={-38} width={14} height={76} rx={4} fill="#16181f" /> }} />
    <Character who="dias" x={880} y={720} s={1.05} t={t} expr="worry" collarOpen armR={{ to: [40, 300], pose: 'point' }} />
    <Character who="alisher" x={300} y={1450} s={1.1} t={t} expr="fear" mouth={.3} armL={{ to: [120, 250], pose: 'open' }} />
    <Character who="diasJ" x={780} y={1450} s={1.1} t={t} expr="worry" collarOpen />
  </svg></AbsoluteFill>); };
