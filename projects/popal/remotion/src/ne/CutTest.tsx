// Лист проверки перекладных персонажей: позы, шаг, посадка, мимика (Still NeCutTest).
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Cut, CUT_IDS, CutPreloader, CutId } from './Cut';
export const NeCutTest: React.FC = () => {
  const F = ['o', 'cry', null, 'frown', 'cry', 'flat', 'o', null] as const;
  return (<AbsoluteFill style={{ background: '#7a9a7a' }}><svg viewBox="0 0 3200 2400" width="100%" height="100%">
    {Array.from({ length: 8 }, (_, i) => <Cut key={'w' + i} id={'vini-kit'} x={200 + i * 400} y={780} s={.95} t={1 + i} walk={{ d: i * 14, run: true }} />)}
    {Array.from({ length: 8 }, (_, i) => <Cut key={'v' + i} id={'diom-track' as CutId} x={200 + i * 400} y={1560} s={.95} t={1 + i} walk={{ d: i * 10, dir: -1 }} />)}
    {CUT_IDS.map((id, i) => <Cut key={id + 'p'} id={id} x={200 + i * 400} y={2360} s={.95} t={2 + i} flip={i === 0 || i === 2}
      sit={i === 5} face={F[i]} cry={.85} mouth={i === 7 ? .7 : 0}
      hold={i === 1 ? 'phone' : i === 4 ? 'flowers' : null} pose={i % 3 === 1 ? { armR: [2.4, .4], armL: [-1.2, -.8] } : undefined} />)}
  </svg><CutPreloader /></AbsoluteFill>); };
