// Кисть: ладонь, четыре пальца с фалангами, большой палец. Начало — запястье, кисть смотрит вдоль +x.
// pose: relax (пальцы слегка согнуты), grip (обхват предмета — предмет рисуется между ладонью и пальцами), point, open, flat.
import React from 'react';
export type HandPose = 'relax' | 'grip' | 'point' | 'open' | 'flat';
export const Hand: React.FC<{ side: number; skin: string; shade: string; pose?: HandPose; hold?: React.ReactNode; holdAng?: number; s?: number }> = ({ side, skin, shade, pose = 'relax', hold, holdAng = 0, s = 1 }) => {
  const fy = [-12.5, -4.2, 4.2, 12] , len = { relax: [22, 25, 23, 18], grip: [0, 0, 0, 0], point: [30, 0, 0, 0], open: [26, 29, 27, 21], flat: [25, 28, 26, 20] }[pose], spread = pose === 'open' ? [-14, -4, 5, 15] : [-3, -1, 1, 3], curl = pose === 'relax' ? 14 : 0;
  const palm = 'M0,-12 C9,-15 24,-16 33,-15 C37,-8 38,6 36,14 C26,16 10,16 0,12 Z';
  return (<g transform={`scale(${s},${s * side})`}>
    <path d={palm} fill={skin} />
    {hold && <g transform={`translate(30,0) rotate(${holdAng})`}>{hold}</g>}
    {pose === 'grip' || pose === 'point' ? (<g>
      <rect x={28} y={-15} width={16} height={pose === 'point' ? 23 : 31} rx={7} fill={skin} transform={pose === 'point' ? 'translate(0,8)' : undefined} />
      {(pose === 'point' ? [1, 2] : [0, 1, 2]).map(i => <path key={i} d={`M30,${-6 + i * 8} L42,${-6 + i * 8}`} stroke={shade} strokeWidth={1.6} opacity={.7} />)}
      {pose === 'point' && <rect x={32} y={-15} width={34} height={9} rx={4.5} fill={skin} />}
    </g>) : fy.map((y, i) => (<g key={i} transform={`translate(33,${y}) rotate(${spread[i] + curl})`}>
      <rect x={0} y={-4.3} width={len[i]} height={8.6} rx={4.3} fill={skin} /><path d={`M${len[i] * .5},-3 L${len[i] * .5},3`} stroke={shade} strokeWidth={1.2} opacity={.55} /></g>))}
    <g transform={`translate(11,-11) rotate(${pose === 'grip' ? -12 : pose === 'open' ? -70 : -48})`}><rect x={0} y={-4.6} width={pose === 'grip' ? 28 : 22} height={9.2} rx={4.6} fill={skin} /></g>
    <path d="M6,6 C14,9 24,9 32,6" stroke={shade} strokeWidth={1.5} fill="none" opacity={.55} />
  </g>);
};
