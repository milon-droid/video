import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Person } from './chars/Person';
import { Lumina, King, Succubus, Goose, Slime } from './chars/Cast';
export const Test: React.FC = () => (<AbsoluteFill style={{ background: '#cfc7e8' }}><svg viewBox="0 0 1080 1920" width="100%" height="100%">
  <Lumina x={280} y={620} s={.8} t={1} mouth={.4} swipe={.4} />
  <rect x={0} y={1180} width={1080} height={740} fill="#3a2440" />
  <King x={800} y={760} s={.7} t={1} mouth={.3} />
  <Succubus x={260} y={1400} s={.7} t={1} />
  <Goose x={720} y={1880} s={.75} t={1} honk={.6} flap={.3} />
  <Slime x={260} y={1880} s={1.2} t={1} mouth={.4} />
  <Person x={480} y={1880} s={.5} t={1} expr="happy" />
</svg></AbsoluteFill>);
