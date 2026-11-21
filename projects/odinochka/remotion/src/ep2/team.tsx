// Расстановка отряда в серии 2: два ряда со сдвигом — видны все шестеро (сзади: Серёга, Жора, Лёха; спереди: Тимур, Кирилл, Михалыч).
import React from 'react';
import { Figure, Pose, POSES } from '../chars/body';
import { CS, LK } from '../chars/cast';
import { KL } from '../ep1/ShotsF';
export const G: Record<string, number[]> = { r1: [300, 1790, .82], zhora: [620, 1800, .9], r2: [930, 1790, .82], timur: [160, 1960, .9], kirill: [470, 1965, 1.0], mikh: [800, 1955, 1.02] };
export const NAMES: Record<string, string> = { r1: 'СЕРЁГА', zhora: 'ЖОРА', r2: 'ЛЁХА', timur: 'ТИМУР', kirill: 'КИРИЛЛ', mikh: 'МИХАЛЫЧ' };
export const H: React.FC<{ t: number; w: string; pose?: Pose; dx?: number; [k: string]: any }> = ({ t, w, pose = POSES.stand, dx = 0, ...p }) => {
  const [x, y, s] = G[w]; return <Figure x={x} y={y} s={s} t={t} L={w === 'kirill' ? KL : LK[w]} C={w === 'kirill' ? CS.porterY : CS[w]} pose={pose} seed={{ mikh: 6, zhora: 7, r1: 21, r2: 22, kirill: 3, timur: 41 }[w]} rim={p.rim || '#5a6a8a'} {...p} />;
};
