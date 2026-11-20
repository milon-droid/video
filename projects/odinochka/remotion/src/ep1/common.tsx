// Общая обёртка плана: SVG 1080×1920, фильтры, камера, грейд, зерно, виньетка, импакт-кадры.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Defs, Grain, ImpactWrap, Vignette } from '../kit/fx';
export type SP = { t: number; d: number };
export const Frame: React.FC<{ t: number; children: React.ReactNode; over?: React.ReactNode; impact?: boolean; grade?: string; gradeK?: number; vign?: number; bg?: string }> = ({ t, children, over, impact = false, grade, gradeK = .25, vign = .9, bg = '#000' }) => (
  <AbsoluteFill style={{ background: bg }}>
    <ImpactWrap on={impact}>
      <svg width={1080} height={1920} style={{ position: 'absolute' }}>
        <Defs />
        {children}
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
export const talk = (t: number, caps: Cap[] | undefined, who: string) => { if (!caps) return 0; for (const [w, , a, b] of caps) if (w.startsWith(who) && t > a && t < b - .2) return .35 + .45 * Math.abs(Math.sin(t * 17)) * (.6 + .4 * Math.sin(t * 5.3)); return 0; };
