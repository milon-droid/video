#!/usr/bin/env python3
"""Серия 2: длительности реплик (из wav, с учётом ускорения ролей) и тексты → three/src/ep2-durs.json, ep2-text.json"""
import json, os, wave
R = os.path.dirname(os.path.abspath(__file__)); P = os.path.join(R, '..', '..')
cfg = json.load(open(os.path.join(P, 'vo', 'ep2-en.json')))
SPEED = {'narrator_en': 1.2}
d, tx = {}, {}
for l in cfg['lines']:
    f = os.path.join(P, 'vo', 'ep2en', l['id'] + '.wav'); tx[l['id']] = [l['role'], l['text']]
    if os.path.exists(f):
        with wave.open(f) as w: d[l['id']] = round(w.getnframes() / w.getframerate() / SPEED.get(l['role'], 1) / l.get('tempo', 1), 3)
    else: d[l['id']] = round(.35 + .33 * len(l['text'].split()), 3)
json.dump(d, open(os.path.join(P, 'three', 'src', 'ep2-durs.json'), 'w'), indent=0)
json.dump(tx, open(os.path.join(P, 'three', 'src', 'ep2-text.json'), 'w'), indent=0, ensure_ascii=False)
print(len(d), 'реплик,', sum(os.path.exists(os.path.join(P, 'vo', 'ep2en', k + '.wav')) for k in d), 'записано')
