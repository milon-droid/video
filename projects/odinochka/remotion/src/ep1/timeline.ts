// Монтажный лист серии 1 (v2 «Последний поезд»): id плана, длительность (с), реплики голосом vo: [id реплики, от начала плана].
// Текст и длительность реплик — из vo/ep1.json и public/vo/durations.json (озвучка Qwen3).
import VO from '../../../vo/ep1.json';
import DUR from '../../public/vo/durations.json';
export type Cap = [string, string, number, number, string?];
export type Spec = { id: string; d: number; vo?: [string, number][]; caps?: Cap[] };
const WHO: Record<string, string> = { father: '???', kirill: 'КИРИЛЛ', collector: 'КОЛЛЕКТОР «КАБАЛЫ»', mikh: 'МИХАЛЫЧ', nastya: 'НАСТЯ', zhora: 'ЖОРА', timur: 'ТИМУР', announcer: 'ДИКТОР' };
const INNER = new Set(['v02', 'v05', 'v06a', 'v06b', 'v07', 'v10', 'v13', 'v28']);
export const V = 'КИРИЛЛ (про себя)';
const RAW: Spec[] = [
  { id: 's01', d: 3.2 }, { id: 's02', d: 3.4, vo: [['v02', .3]] }, { id: 's03', d: 2.2, vo: [['v03', .5]] }, { id: 's04i', d: 3.6 }, { id: 's04', d: 1.6 },
  { id: 's05', d: 4.0, vo: [['v05', .3]] }, { id: 's06', d: 4.4, vo: [['v06a', .2], ['v06b', 2.5]] }, { id: 's07', d: 3.8, vo: [['v07', .3]] },
  { id: 's08', d: 4.6, vo: [['v08', .4]] }, { id: 's09', d: 4.6, vo: [['v09', 2.0]] }, { id: 's10', d: 4.0, vo: [['v10', 1.0]] },
  { id: 's11', d: 4.0, vo: [['v11', .5]] }, { id: 's12', d: 3.8, vo: [['v12a', .2], ['v12b', 1.3]] }, { id: 's13', d: 3.6, vo: [['v13', .3]] }, { id: 's14', d: 2.6 }, { id: 's15', d: 4.4, vo: [['v15', 2.2]] }, { id: 's16', d: 4.0, vo: [['v16a', .3], ['v16b', 2.1]] },
  { id: 'f17', d: 3.6, vo: [['v17', 1.0]] }, { id: 'f18', d: 3.2, vo: [['v18', .9]] }, { id: 'f19', d: 3.6 }, { id: 'f20', d: 2.4, vo: [['v20m', .4]] },
  { id: 'f21', d: 3.4 }, { id: 'f22', d: 3.0 }, { id: 'f23', d: 2.6 }, { id: 'f24', d: 3.0, vo: [['v24z', .4]] }, { id: 'f25', d: 2.6 },
  { id: 'f26', d: 3.8, vo: [['v26', 1.1]] }, { id: 'f27', d: 3.2 }, { id: 'f28', d: 4.0, vo: [['v28f', 1.2]] }, { id: 'f29', d: 5.0 },
];
const lines: Record<string, { role: string; text: string }> = Object.fromEntries((VO as any).lines.map((l: any) => [l.id, l]));
const dur = DUR as Record<string, number>;
// план не короче реплик + 0,3 с
export const SHOTS: Spec[] = RAW.map(s => { let prev = -1; const caps: Cap[] = (s.vo || []).map(([id, at0]) => { const l = lines[id]; const at = Math.max(at0, prev + .25); prev = at + (dur[id] || 2); return [INNER.has(id) ? V : WHO[l.role], l.text, at, at + (dur[id] || 2), id] as Cap; });
  const need = Math.max(0, ...caps.map(c => c[3] + .3)); return { ...s, d: Math.max(s.d, need), caps }; });
export const starts = (() => { let a = 0; return SHOTS.map(s => { const r = a; a += s.d; return r; }); })();
export const TOTAL = SHOTS.reduce((a, s) => a + s.d, 0);
