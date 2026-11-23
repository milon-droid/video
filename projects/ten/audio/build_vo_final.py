#!/usr/bin/env python3
"""Голос EN-финала: реплики ep1-en-final.json (время v5 → warp; реплики вставки — alt), обработка по ролям, без наложений → vo-final.wav"""
import json, os, subprocess, wave
from warp import warp, TOTAL
ROOT = os.path.dirname(os.path.abspath(__file__)); VO = os.path.join(ROOT, '..', 'vo')
FX = {'senya_en': "highpass=f=90,equalizer=f=3200:t=q:w=1:g=2,acompressor=threshold=-20dB:ratio=3:makeup=3",
      'shadow2_en': "highpass=f=100,equalizer=f=2800:t=q:w=1:g=2,acompressor=threshold=-20dB:ratio=3:makeup=3,aecho=0.5:0.3:18:0.12",
      'narrator_en': "highpass=f=60,equalizer=f=120:t=q:w=1:g=4,equalizer=f=3000:t=q:w=1:g=-2,acompressor=threshold=-22dB:ratio=4:makeup=4,aecho=0.6:0.5:60|110:0.18|0.1"}
cfg = json.load(open(os.path.join(VO, 'ep1-en-final.json')))
items = []
for l in cfg['lines']:
    f = os.path.join(VO, 'ep1en', l['id'] + '.wav')
    if not os.path.exists(f): print('нет', l['id']); continue
    t = warp(l['t'], l.get('alt'))
    with wave.open(f) as w: d = w.getnframes() / w.getframerate()
    items.append([t, d, f, l['role'], l['id']])
items.sort(); end = 0
for it in items:
    if it[0] < end + .12: print(f"  {it[4]}: {it[0]:.2f} → {end + .12:.2f}"); it[0] = end + .12
    end = it[0] + it[1]
ins, flt = [], []
for k, (t, d, f, role, lid) in enumerate(items):
    ins += ['-i', f]; ms = int(t * 1000); flt.append(f"[{k}:a]{FX[role]},aresample=48000,adelay={ms}|{ms},apad[a{k}]")
n = len(items); flt.append(''.join(f"[a{k}]" for k in range(n)) + f"amix=inputs={n}:normalize=0:duration=longest,atrim=0:{TOTAL},pan=stereo|c0=c0|c1=c0[out]")
subprocess.run(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', ';'.join(flt), '-map', '[out]', '-ar', '48000', os.path.join(ROOT, 'vo-final.wav')], check=True)
print('vo-final.wav', n)
