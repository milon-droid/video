// Данные серии для TSX: тайминг из shared.mjs + рот по голосу (tools/mouth.py)
import MOUTH from '../data/mouth.json';
export * from './shared.mjs';
import { VO_AT, VO_CUT } from './shared.mjs';
const M = MOUTH as Record<string, { fps: number; v: number[] }>;
export const mouthOf = (t: number, id: keyof typeof VO_AT) => { const env = M[id], t0 = VO_AT[id]; if (!env || t < t0 || t > t0 + ((VO_CUT as Record<string, number>)[id] ?? 99)) return 0; const i = Math.floor((t - t0) * env.fps); return i >= 0 && i < env.v.length ? Math.min(1, env.v[i]) : 0; };
export const anchorMouth = (t: number) => Math.max(mouthOf(t, 'an1'), mouthOf(t, 'an2'), mouthOf(t, 'an3'), mouthOf(t, 'an4'));
