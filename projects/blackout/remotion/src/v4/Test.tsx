import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Fig, FigProps, handAt } from './Rig';
import { Board } from './Props';
const V: Partial<FigProps>[] = [
  { id: 'beka', L: { u: 8, f: 132, ff: .55 }, R: { u: 8, f: 132, ff: .55 }, phoneMid: true, thumb: .5 },
  { id: 'beka', L: { u: 12, f: 118, ff: .62 }, R: { u: 12, f: 118, ff: .62 }, phoneMid: true },
  { id: 'dias', L: { u: 6, f: 24, ff: .75 }, R: { u: 10, f: 20, ff: .75, fu: .92 }, holdR: 'iron' },
  { id: 'dias', L: { u: 8, f: 34, ff: .7 }, R: { u: 12, f: 30, ff: .7, fu: .9 }, holdR: 'iron' },
  { id: 'dias', R: { u: -35, f: 189, fu: .55, ff: 1 }, holdR: 'phoneEar', worry: 1 },
  { id: 'beka', L: { u: 8, f: 132, ff: .55 }, R: { u: 8, f: 132, ff: .55 }, phoneMid: true, dark: 1, worry: 1 },
];
export const V4Test: React.FC = () => { const t = 1.3;
  return (<AbsoluteFill style={{ background: '#8a9a8a' }}><svg viewBox="0 0 1080 1920" width="100%" height="100%">
    {V.map((v, i) => { const fp = { x: 270, y: 1180, s: .75, t, ...v } as FigProps; const h = v.holdR === 'iron' ? handAt(fp, 'R') : null;
      return <g key={i}><rect x={(i % 2) * 540} y={Math.floor(i / 2) * 640} width={540} height={640} fill={i % 3 ? '#8a9a8a' : '#6a7a8a'} />
      <svg x={(i % 2) * 540} y={Math.floor(i / 2) * 640} width={540} height={640} viewBox="0 0 540 640"><Fig {...fp} />{h && <Board cx={270} top={h[1] + 60} w={560} />}{h && <Fig {...fp} L={undefined} R={undefined} opacity={0} />}</svg></g>; })}
  </svg></AbsoluteFill>); };
