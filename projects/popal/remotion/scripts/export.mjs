// Выгрузка из модуля серии: ../sfx-ep1.json (для tools/sfx.py), ../out/ep1.srt, раскадровка ../storyboard-ep1.json
import fs from 'node:fs'; import path from 'node:path';
import { CAPS, CUES, DUR, SHOTS } from '../src/ep1/timeline.mjs';
const P = path.resolve(import.meta.dirname, '../..');
fs.writeFileSync(path.join(P, 'sfx-ep1.json'), JSON.stringify(CUES, null, 0));
const ts = s => { const ms = Math.round(s * 1000); return [Math.floor(ms / 3600000), Math.floor(ms / 60000) % 60, Math.floor(ms / 1000) % 60].map(v => String(v).padStart(2, '0')).join(':') + ',' + String(ms % 1000).padStart(3, '0'); };
fs.mkdirSync(path.join(P, 'out'), { recursive: true });
fs.writeFileSync(path.join(P, 'out', 'ep1.srt'), CAPS.map((c, i) => `${i + 1}\n${ts(c.a)} --> ${ts(c.b)}\n${c.words.map(w => w.text).join(' ')}\n`).join('\n'));
fs.writeFileSync(path.join(P, 'storyboard-ep1.json'), JSON.stringify({ duration: DUR, shots: SHOTS.map(s => ({ id: s.id, start: s.a, end: s.b })) }, null, 1));
console.log('DUR', DUR.toFixed(2), 'cues', CUES.length, 'caps', CAPS.length, 'shots', SHOTS.length);
