// Монтажный лист серии 2 «Выход — один»: id плана, длительность (с), реплики [id, от начала плана]. Текст — vo/ep2.json, длительности — public/vo2/durations.json.
import VO from '../../../vo/ep2.json';
import DUR from '../../public/vo2/durations.json';
import MOUTH from '../../public/vo2/mouth.json';
export type Cap = [string, string, number, number, string?];
export type Spec = { id: string; d: number; vo?: [string, number][]; caps?: Cap[] };
const WHO: Record<string, string> = { father: 'ОТЕЦ?', kirill: 'КИРИЛЛ', mikh: 'МИХАЛЫЧ', zhora: 'ЖОРА', timur: 'ТИМУР', announcer: 'ДИКТОР' };
const INNER = new Set(['w02', 'w06', 'w08', 'w10', 'w11', 'w14', 'w15', 'w16', 'w19', 'w22']);
export const V = 'КИРИЛЛ (про себя)';
const RAW: Spec[] = [
  { id: 'a1', d: 3.6, vo: [['w01', .3]] }, { id: 'a2', d: 3.0 },
  { id: 'b0', d: 4.0, vo: [['w02', .3]] }, { id: 'b1', d: 2.6, vo: [['w03', .6]] }, { id: 'b2', d: 3.4, vo: [['w04', .3]] }, { id: 'b3', d: 4.6, vo: [['w05', .2], ['w06', 1.8]] },
  { id: 'b4', d: 3.0, vo: [['w07', 1.0]] }, { id: 'b5', d: 3.8, vo: [['w08', .4]] }, { id: 'b6', d: 3.2, vo: [['w09', .3]] },
  { id: 'c1', d: 3.2, vo: [['w10', .3]] }, { id: 'c2', d: 2.4, vo: [['w11', .3]] }, { id: 'c3', d: 2.8, vo: [['w12', .9]] }, { id: 'c4', d: 2.4, vo: [['w13', .2]] },
  { id: 'c5', d: 5.0, vo: [['w14', .4]] }, { id: 'c6', d: 3.6, vo: [['w15', .4]] }, { id: 'c7', d: 3.4, vo: [['w16', .3]] }, { id: 'c8', d: 2.4, vo: [['w17', .9]] }, { id: 'c9', d: 4.4, vo: [['w18', .9], ['w19', 2.6]] },
  { id: 'd1', d: 4.0 }, { id: 'd2', d: 4.2, vo: [['w20', .4]] }, { id: 'd3', d: 3.0, vo: [['w21', .6]] }, { id: 'd4', d: 3.0 }, { id: 'd5', d: 5.0, vo: [['w22', .6]] },
  { id: 'd6', d: 3.2, vo: [['w23', .3]] }, { id: 'd7', d: 3.0 },
];
const lines: Record<string, { role: string; text: string }> = Object.fromEntries((VO as any).lines.map((l: any) => [l.id, l]));
const dur = DUR as Record<string, number>;
export const SHOTS: Spec[] = RAW.map(s => { let prev = -1; const caps: Cap[] = (s.vo || []).map(([id, at0]) => { const l = lines[id]; const at = Math.max(at0, prev + .25); prev = at + (dur[id] || 2); return [INNER.has(id) ? V : WHO[l.role], l.text, at, at + (dur[id] || 2), id] as Cap; });
  const need = Math.max(0, ...caps.map(c => c[3] + .35)); return { ...s, d: Math.max(s.d, need), caps }; });
export const starts = (() => { let a = 0; return SHOTS.map(s => { const r = a; a += s.d; return r; }); })();
export const TOTAL = SHOTS.reduce((a, s) => a + s.d, 0);
export const caps = (id: string) => SHOTS.find(s => s.id === id)?.caps;
// открытие рта по громкости реплики
export const talk = (t: number, c: Cap[] | undefined, who: string) => { if (!c) return 0;
  for (const [w, , a, b, id] of c) if (w.startsWith(who) && !w.includes('про себя') && t > a && t < b) { const m = id && (MOUTH as any)[id];
    if (m) { const v = m.v[Math.floor((t - a) * m.fps)] ?? 0; return Math.min(1, v * 1.2); }
    return t < b - .2 ? .35 + .45 * Math.abs(Math.sin(t * 17)) * (.6 + .4 * Math.sin(t * 5.3)) : 0; }
  return 0; };
