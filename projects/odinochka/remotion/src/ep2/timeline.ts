// Монтажный лист серии 2 «Выход — один»: id плана, длительность (с), реплики [id, от начала плана]. Текст — vo/ep2.json, длительности — public/vo2/durations.json.
import VO from '../../../vo/ep2.json';
import DUR from '../../public/vo2/durations.json';
import MOUTH from '../../public/vo2/mouth.json';
export type Cap = [string, string, number, number, string?];
export type Spec = { id: string; d: number; vo?: [string, number][]; caps?: Cap[] };
const WHO: Record<string, string> = { father: 'ОТЕЦ?', kirill: 'КИРИЛЛ', mikh: 'МИХАЛЫЧ', zhora: 'ЖОРА', timur: 'ТИМУР', announcer: 'ДИКТОР', nastya: 'НАСТЯ', machinist: 'МАШИНИСТ' };
const INNER = new Set(['w62', 'w64', 'w58', 'w53', 'w56', 'w02b', 'w06b', 'w26', 'w37', 'w38', 'w39', 'w42', 'w46', 'w50', 'w51', 'w02', 'w06', 'w08', 'w10', 'w11', 'w14', 'w15', 'w16', 'w19', 'w22']);
export const V = 'КИРИЛЛ (про себя)';
const RAW: Spec[] = [
  { id: 'a0', d: 2.8 }, { id: 'a2', d: 2.2 }, { id: 'a3', d: 3.4, vo: [['w60', .5]] }, { id: 'a4', d: 2.6 },
  { id: 'b0', d: 4.0, vo: [['w02b', .3]] }, { id: 'b1', d: 2.6, vo: [['w03', 1.8]] }, { id: 'b2', d: 2.8, vo: [['w04', .3]] }, { id: 'b3', d: 4.6, vo: [['w05b', .2], ['w06b', 0]] }, { id: 'b6', d: 2.8, vo: [['w01', .1]] },
  { id: 'e1', d: 2.6, vo: [['w25', 1.2]] }, { id: 'e2', d: 2.4 }, { id: 'e3', d: 2.4 }, { id: 'k1', d: 3.0, vo: [['w39', .3]] }, { id: 'e4', d: 2.6, vo: [['w27', .3]] }, { id: 'e5', d: 2.2 },
  { id: 'c6', d: 2.8, vo: [['w15', .2]] }, { id: 'c7', d: 2.2, vo: [['w16', .1]] }, { id: 'c7b', d: 2.6 }, { id: 'c7c', d: 1.8, vo: [['w17', .4]] }, { id: 'c8', d: 2.0 }, { id: 'c8b', d: 2.0 },
  { id: 'f1', d: 4.6, vo: [['w28', .4], ['w29', 0]] }, { id: 'f2', d: 3.6, vo: [['w30', .5], ['w31', 0]] },
  { id: 'g1', d: 2.6, vo: [['w61', .3]] }, { id: 'g1b', d: 4.8, vo: [['w62', .2], ['w63', 0], ['w32', 0]] }, { id: 'g2', d: 1.8 }, { id: 'g3', d: 3.9, vo: [['w33', .2], ['w54', .9], ['w34', 2.8]] },
  { id: 'g7', d: 3.2, vo: [['w64', .3]] }, { id: 'g4', d: 2.5, vo: [['w35', 1.2]] }, { id: 'g8', d: 5.2, vo: [['w43', .3], ['w44', 0]] }, { id: 'g5', d: 2.2 }, { id: 'g9', d: 2.2, vo: [['w52', .7]] },
  { id: 'i1', d: 2.6, vo: [['w45', .4]] }, { id: 'h2', d: 4.2, vo: [['w38', .3]] },
  { id: 'i2a', d: 2.4 }, { id: 'i2', d: 2.6 }, { id: 'i3b', d: 3.2, vo: [['w59', .6]] }, { id: 'i3', d: 3.2, vo: [['w46', .1]] }, { id: 'i4', d: 2.4, vo: [['w47', 1.2]] }, { id: 'i5', d: 2.3 }, { id: 'i5b', d: 2.2 },
  { id: 'i6', d: 5.2, vo: [['w48', .2], ['w56', 0]] }, { id: 'i7', d: 3.4, vo: [['w49', 2.0]] }, { id: 'j1', d: 6.0, vo: [['w50', .4], ['w57', 0]] }, { id: 'j1b', d: 4.0, vo: [['w58', .2]] }, { id: 'j2', d: 2.6, vo: [['w51', .3]] }, { id: 'j3', d: 2.0 },
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
