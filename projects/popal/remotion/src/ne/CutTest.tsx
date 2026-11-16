// Лист проверки перекладных персонажей: мимика на лицах из картинок, взгляд, шаг, посадка (Still NeCutTest).
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Cut, CutPreloader, CutId } from './Cut';
const EX = ['neutral', 'happy', 'smug', 'sad', 'shock', 'deadpan', 'cry', 'talk'];
const ROW: CutId[] = ['vini-kit', 'vini-home', 'sadie-vip', 'diom-track'];
export const NeCutTest: React.FC = () => (<AbsoluteFill style={{ background: '#7a9a7a' }}><svg viewBox="0 0 3200 2400" width="100%" height="100%">
  {ROW.map((id, r) => EX.map((e, i) => <Cut key={id + e} id={id} x={200 + i * 400} y={1000 + r * 560} s={1.9} t={1.37 + i * .9} noBlink
    expr={e === 'cry' || e === 'talk' ? undefined : e} face={e === 'cry' ? 'cry' : null} cry={1} mouth={e === 'talk' ? .8 : 0}
    eye={[[0, 0], [0, 0], [.9, 0], [-.3, .8], [0, -.4], [-.9, 0], [0, .5], [.5, 0]][i] as [number, number]} />))}
</svg><CutPreloader /></AbsoluteFill>);
