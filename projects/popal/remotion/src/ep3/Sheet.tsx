import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Person, POSES } from '../chars/Person';
import { Liliana } from '../chars/Cast2';
import { DeathKnight, GateWorld, FriedEgg, MapCard } from '../chars/Cast3';
export const Sheet3: React.FC = () => (<AbsoluteFill style={{ background: '#888' }}><svg viewBox="0 0 2160 3300" width="2160" height="3300">
  <GateWorld t={1} open={.5} />
  <Person x={300} y={2960} s={.5} t={1} hold="pan" /><Person x={420} y={2960} s={.5} t={1} look="lira" bowBack />
  <g transform="translate(1080,0)"><rect width={1080} height={3300} fill="#24305a" />
    <DeathKnight x={620} y={1500} s={1} t={1} reach={1} /><Person x={200} y={1500} s={1} t={1} hold="pan" pose={POSES.point} /><circle cx={200} cy={1500 - 590} r={8} fill="red" />
    <Liliana x={300} y={3000} s={1.6} t={1} angry={1} tears={1} blush={1} mouth={.6} /><Liliana x={800} y={3000} s={1.2} t={1} sad={1} dizzy={1} />
    <FriedEgg x={860} y={1800} s={2} /><MapCard x={540} y={2000} s={.8} t={1} /></g>
</svg></AbsoluteFill>);
