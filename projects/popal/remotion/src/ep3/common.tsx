// Общее для планов серии 3: рот (озвучки нет — «говорит», пока идёт реплика), тайминг, сердечки.
import React from 'react';
import { VO, SHOT, WORD_AT } from './timeline.mjs';
import { lerp } from '../anim';
export type P = { t: number; T: number };
export const mouth = (who: string, T: number) => { const v = (VO as any[]).find(q => q.who === who && T >= q.t && T < q.t + q.d - .35); return v ? .12 + Math.abs(Math.sin((T - v.t) * 11)) * .55 : 0; };
export const dur = (id: string) => SHOT[id].b - SHOT[id].a;
export const W = (id: string, i: number, shot: string) => WORD_AT(id, i) - SHOT[shot].a;
export const V = (id: string, shot: string) => W(id, 0, shot);
export const HEART = 'M0,12 C-30,-10 -24,-34 0,-22 C24,-34 30,-10 0,12 Z';
export const Heart: React.FC<{ x: number; y: number; s?: number; o?: number; c?: string; rot?: number }> = ({ x, y, s = 1, o = 1, c = '#ff4a8a', rot = 0 }) => <path transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`} d={HEART} fill={c} opacity={o} />;
export const AIM = (d: number) => ({ armR: [1.57, 0] as [number, number], armL: [lerp(1.2, 1.75, d), lerp(.5, 2.2, d)] as [number, number], legL: [-.2, .05] as [number, number], legR: [.2, -.05] as [number, number] });
