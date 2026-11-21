// Тайминги вариантов «вместо Депо» (parts.json): как в ep2/timeline.ts — план не короче реплик.
import VO from '../../../vo/ep2.json';
import DUR from '../../public/vo2/durations.json';
import P from './parts.json';
import { Cap } from '../ep2/timeline';
const WHO: Record<string, string> = { father: 'ОТЕЦ?', kirill: 'КИРИЛЛ', mikh: 'МИХАЛЫЧ', zhora: 'ЖОРА', timur: 'ТИМУР', announcer: 'ДИКТОР', nastya: 'НАСТЯ', machinist: 'МАШИНИСТ' };
const INNER = new Set(['xa1', 'xa3', 'xb1', 'xc2', 'xc5', 'w38']);
const lines: Record<string, { role: string; text: string }> = Object.fromEntries((VO as any).lines.map((l: any) => [l.id, l]));
const dur = DUR as Record<string, number>;
export type VSpec = { id: string; d: number; caps: Cap[] };
export const build = (k: 'A' | 'B' | 'C') => { const raw = (P as any)[k] as { id: string; d: number; vo: [string, number][] }[]; let first = true;
  const shots: VSpec[] = raw.map(s => { let prev = -1; const caps: Cap[] = s.vo.map(([id, at0]) => { const l = lines[id]; const at = Math.max(at0, prev + .25); prev = at + (dur[id] || 2);
    const inner = INNER.has(id); const who = inner ? (first ? 'КИРИЛЛ (про себя)' : 'КИРИЛЛ (') : WHO[l.role]; if (inner) first = false; return [who, l.text, at, at + (dur[id] || 2), id] as Cap; });
    return { id: s.id, d: Math.max(s.d, ...caps.map(c => c[3] + .35)), caps }; });
  let a = 0; const starts = shots.map(s => { const r = a; a += s.d; return r; }); return { shots, starts, total: a, capsOf: (id: string) => shots.find(s => s.id === id)?.caps };
};
export const VA = build('A'), VB = build('B'), VC = build('C');
