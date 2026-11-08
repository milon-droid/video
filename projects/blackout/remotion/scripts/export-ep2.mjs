// Выгрузка серии 2: sfx-ep2.json (tools/sfx.py), out/ep2.srt, storyboard/ep2.json, vo/ep2-captions.json (для tools/words.py).
import fs from 'node:fs'; import path from 'node:path';
import { CAPS, CUES, DUR, SHOTS, SPEAKER, VO_AT, LINES, storyAt } from '../src/ep2/shared.mjs';
const P = path.resolve(import.meta.dirname, '../..');
fs.writeFileSync(path.join(P, 'sfx-ep2.json'), JSON.stringify(CUES));
fs.writeFileSync(path.join(P, 'vo', 'ep2-captions.json'), JSON.stringify(Object.entries(LINES).map(([id, [text]]) => ({ id, text: text.replace(/\*\*/g, '') })), null, 1));
const ts = s => { const ms = Math.round(s * 1000); return [Math.floor(ms / 3600000), Math.floor(ms / 60000) % 60, Math.floor(ms / 1000) % 60].map(v => String(v).padStart(2, '0')).join(':') + ',' + String(ms % 1000).padStart(3, '0'); };
fs.mkdirSync(path.join(P, 'out'), { recursive: true }); fs.writeFileSync(path.join(P, 'out', 'ep2.srt'), CAPS.map((c, i) => `${i + 1}\n${ts(c.a)} --> ${ts(c.b)}\n${c.words.map(w => w.text).join(' ')}\n`).join('\n'));
const scenes = SHOTS.map(([id, a, b, what]) => { const c = CAPS.filter(p => p.a >= a - .01 && p.a < b), vo = Object.entries(VO_AT).find(([, v]) => v >= a - .05 && v < b), h = storyAt(a + .01);
  return { id, start: a, end: +Math.min(b, DUR).toFixed(2), what, camera: { type: 'pushIn', from: 1.0, to: 1.08 }, vo: c.length ? { speaker: vo ? (SPEAKER[vo[0]] || 'narrator') : 'narrator', text: c.map(p => p.words.map(w => w.text).join(' ')).join(' '), accent: c.flatMap(p => p.words.filter(w => w.accent).map(w => w.text)) } : null,
    sfx: CUES.filter(s => s.t >= a && s.t < b && !String(s.path || '').includes('/vo/')).map(s => ({ id: s.id || (s.path ? String(s.path).split('/').pop() : s.type), at: +(s.t - a).toFixed(2) })), hud: id === 'e2s22' ? null : { time: h.time, signal: h.signal } }; });
fs.mkdirSync(path.join(P, 'storyboard'), { recursive: true }); fs.writeFileSync(path.join(P, 'storyboard', 'ep2.json'), JSON.stringify({ episode: 2, title: 'Хаос на улицах', duration: +DUR.toFixed(2), hud: { city: 'АЛМАТЫ', temp: '+6°', timeStart: '20:04', signal: 'lost' }, characters: ['dias', 'beka', 'alikhan', 'alisher'], scenes }, null, 2));
console.log('DUR', DUR.toFixed(2), 'cues', CUES.length, 'phrases', CAPS.length, 'scenes', scenes.length);
