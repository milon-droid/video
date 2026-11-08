// Данные серии 2 для TSX: тайминг из shared.mjs + рот по голосу (tools/mouth.py → ep2-mouth.json)
import MOUTH from '../data/ep2-mouth.json';
export * from './shared.mjs';
import { VO_AT } from './shared.mjs';
const M = MOUTH as Record<string, { fps: number; v: number[] }>;
const AT = VO_AT as Record<string, number>;
// без огибающей (до синтеза) — рот «говорит» синусом на время реплики, чтобы превью было живым
import DUR from '../data/ep2-durations.json';
const D = DUR as Record<string, number>;
export const mouthOf = (t: number, id: string) => { const t0 = AT[id]; if (t0 === undefined || t < t0) return 0; const env = M[id];
  if (!env) return t < t0 + (D[id] ?? 2) ? .25 + .25 * Math.sin((t - t0) * 22) : 0;
  const i = Math.floor((t - t0) * env.fps); return i >= 0 && i < env.v.length ? Math.min(1, env.v[i]) : 0; };
