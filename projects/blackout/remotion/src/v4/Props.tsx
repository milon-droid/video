// Предметы сцены, которых нет на картинках пользователя (нарисованы в той же мягкой плоской манере).
import React from 'react';
// гладильная доска: верх на высоте top, центр cx, ширина w; на ней белая рубашка
export const Board: React.FC<{ cx: number; top: number; w: number; dark?: number; shirt?: boolean }> = ({ cx, top, w, dark = 0, shirt = true }) => {
  const h = w * .14, k = 1 - dark * .7;
  const c = (r: number, g: number, b: number) => `rgb(${r * k},${g * k},${b * (1 - dark * .5)})`;
  return (<g>
    <path d={`M${cx - w * .3},${top + h} L${cx + w * .22},${top + w * .62} M${cx + w * .3},${top + h} L${cx - w * .22},${top + w * .62}`} stroke={c(150, 156, 168)} strokeWidth={w * .018} strokeLinecap="round" />
    <path d={`M${cx - w * .5},${top + h * .5} Q${cx - w * .5},${top} ${cx - w * .38},${top} L${cx + w * .42},${top} Q${cx + w * .56},${top + h * .2} ${cx + w * .5},${top + h * .6} L${cx + w * .48},${top + h} L${cx - w * .48},${top + h} Z`} fill={c(86, 120, 168)} />
    <path d={`M${cx - w * .48},${top + h * .8} L${cx + w * .49},${top + h * .8} L${cx + w * .48},${top + h * 1.05} L${cx - w * .48},${top + h * 1.05} Z`} fill={c(58, 82, 120)} />
    {[...Array(9)].map((_, i) => <circle key={i} cx={cx - w * .4 + i * w * .1} cy={top + h * .45} r={w * .008} fill={c(220, 230, 245)} opacity={.5} />)}
    {shirt && <path d={`M${cx - w * .3},${top + h * .15} L${cx + w * .18},${top + h * .1} Q${cx + w * .26},${top + h * .3} ${cx + w * .2},${top + h * .75} L${cx - w * .32},${top + h * .8} Z`} fill={c(160, 196, 238)} />}
    {shirt && <path d={`M${cx - w * .05},${top + h * .12} L${cx - w * .07},${top + h * .78}`} stroke={c(120, 160, 210)} strokeWidth={w * .006} />}
  </g>);
};
