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
  { id: 's11', d: 4.0, vo: [['v11', .5]] }, { id: 's12', d: 3.8, vo: [['v12a', .2], ['v12b', 1.3]] }, { id: 'p13', d: 4.0, vo: [['v13', .4]] }, { id: 'p14', d: 4.0, vo: [['v16a', .3], ['v16b', 2.0]] },
  { id: 'p15', d: 3.4, vo: [['v17', .8]] }, { id: 'p16', d: 3.4, vo: [['v18', .5]] }, { id: 'p17', d: 3.4 }, { id: 'p18', d: 4.0, vo: [['v17b', 1.0]] },
  { id: 'p19', d: 3.6 }, { id: 'p20', d: 2.2 }, { id: 'p21', d: 3.4 }, { id: 'p22', d: 2.6 }, { id: 'p23', d: 3.8 }, { id: 'p24', d: 4.2 },
  { id: 'p25', d: 2.8 }, { id: 'p26', d: 2.4 }, { id: 'p27', d: 3.6, vo: [['v26', 1.1]] }, { id: 'p28', d: 3.2 }, { id: 'p29', d: 3.0 },
  { id: 'p30', d: 4.6, vo: [['v29', 1.9]] }, { id: 'p31', d: 4.8, vo: [['v28', .3]] },
];
const lines: Record<string, { role: string; text: string }> = Object.fromEntries((VO as any).lines.map((l: any) => [l.id, l]));
const dur = DUR as Record<string, number>;
// план не короче реплик + 0,3 с
export const SHOTS: Spec[] = RAW.map(s => { let prev = -1; const caps: Cap[] = (s.vo || []).map(([id, at0]) => { const l = lines[id]; const at = Math.max(at0, prev + .25); prev = at + (dur[id] || 2); return [INNER.has(id) ? V : WHO[l.role], l.text, at, at + (dur[id] || 2), id] as Cap; });
  const need = Math.max(0, ...caps.map(c => c[3] + .3)); return { ...s, d: Math.max(s.d, need), caps }; });
export const starts = (() => { let a = 0; return SHOTS.map(s => { const r = a; a += s.d; return r; }); })();
export const TOTAL = SHOTS.reduce((a, s) => a + s.d, 0);
