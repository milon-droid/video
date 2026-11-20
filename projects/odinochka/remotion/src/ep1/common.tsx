// Общая обёртка плана: SVG 1080×1920, фильтры, камера, грейд, зерно, виньетка, импакт-кадры.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Defs, Grain, ImpactWrap, Vignette } from '../kit/fx';
import { noise } from '../anim';
export type SP = { t: number; d: number };
export const Frame: React.FC<{ t: number; children: React.ReactNode; over?: React.ReactNode; impact?: boolean; grade?: string; gradeK?: number; vign?: number; bg?: string }> = ({ t, children, over, impact = false, grade, gradeK = .25, vign = .9, bg = '#000' }) => (
  <AbsoluteFill style={{ background: bg }}>
    <ImpactWrap on={impact}>
      <svg width={1080} height={1920} style={{ position: 'absolute' }}>
        <Defs />
        <g transform={`translate(${noise('hhx', t, .35) * 5} ${noise('hhy', t, .3) * 5}) rotate(${noise('hhr', t, .2) * .25} 540 960)`}>{children}</g>
        {grade && <rect width={1080} height={1920} fill={grade} opacity={gradeK} style={{ mixBlendMode: 'multiply' }} />}
        <Vignette k={vign} />
        {over}
        <Grain t={t} />
      </svg>
    </ImpactWrap>
  </AbsoluteFill>
);
// говорит ли персонаж в момент t (по репликам плана) → открытие рта
import { Cap } from './timeline';
import MOUTH from '../../public/vo/mouth.json';
// рот по громкости реплики (tools/mouth.py), иначе — запасной вариант по синусу
export const talk = (t: number, caps: Cap[] | undefined, who: string) => { if (!caps) return 0;
  for (const [w, , a, b, id] of caps) if (w.startsWith(who) && !w.includes('про себя') && t > a && t < b) { const m = id && (MOUTH as any)[id];
    if (m) { const v = m.v[Math.floor((t - a) * m.fps)] ?? 0; return Math.min(1, v * 1.2); }
    return t < b - .2 ? .35 + .45 * Math.abs(Math.sin(t * 17)) * (.6 + .4 * Math.sin(t * 5.3)) : 0; }
  return 0; };
