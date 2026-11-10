// «Didn't Want To Anyway» (projects/ne-ochen): лист персонажей на согласование
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Baller, Sadie } from '../stars/Stars';
export const NeSheet: React.FC = () => (<AbsoluteFill style={{ background: '#2a3050' }}><svg viewBox="0 0 2160 1920" width="100%" height="100%">
  <rect width={2160} height={1920} fill="#2a3050" /><rect y={1300} width={2160} height={620} fill="#20253c" />
  <Baller who="diom" x={300} y={1500} s={1.05} t={1} expr="happy" teeth />
  <Baller who="diom" outfit="track" x={760} y={1500} s={1.05} t={2} expr="happy" pose={{ armL: [-.7, 1.32], armR: [.5, -.4] }} />
  <Baller who="vini" outfit="home" x={1220} y={1500} s={1.05} t={3} expr="smug" hold="phone" pose={{ armR: [.3, -2.0] }} />
  <Baller who="vini" x={1680} y={1500} s={1.05} t={4} expr="happy" teeth hold="flowers" pose={{ armR: [.9, -1.6] }} />
  <Sadie x={2000} y={1500} s={.8} t={5} expr="happy" />
</svg></AbsoluteFill>);
