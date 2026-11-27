#!/usr/bin/env python3
"""Голос серии 2: реплики vo/ep2en/*.wav в моменты из ep2-lines.js (EP2_PART), обработка по ролям → vo2[-P].wav"""
import json, os, subprocess, sys
R0 = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, R0)
from timing import load
PART = os.environ.get('EP2_PART', 'main'); TM = load(); AT = TM['at']
VO = os.path.join(R0, '..', '..', 'vo'); cfg = json.load(open(os.path.join(VO, 'ep2-en.json'))); role = {l['id']: l['role'] for l in cfg['lines']}
FX = {'senya_en': "highpass=f=90,equalizer=f=3200:t=q:w=1:g=2,acompressor=threshold=-20dB:ratio=3:makeup=3",
      'mia_en': "highpass=f=110,equalizer=f=3500:t=q:w=1:g=2,acompressor=threshold=-20dB:ratio=3:makeup=3",
      'shadow2_en': "highpass=f=100,equalizer=f=2800:t=q:w=1:g=4,acompressor=threshold=-22dB:ratio=4:makeup=5,volume=6dB,alimiter=limit=0.95",
      'mshadow_en': "highpass=f=120,equalizer=f=3000:t=q:w=1:g=3,acompressor=threshold=-22dB:ratio=4:makeup=5,volume=5dB,alimiter=limit=0.95",
      'dude_en': "highpass=f=60,equalizer=f=150:t=q:w=1:g=3,acompressor=threshold=-20dB:ratio=3:makeup=3",
      'dad_en': "highpass=f=50,equalizer=f=120:t=q:w=1:g=5,acompressor=threshold=-22dB:ratio=4:makeup=4,aecho=0.6:0.4:40:0.12",
      'narrator_en': "highpass=f=60,equalizer=f=120:t=q:w=1:g=4,equalizer=f=3000:t=q:w=1:g=-2,acompressor=threshold=-22dB:ratio=4:makeup=4,aecho=0.6:0.5:60|110:0.18|0.1,atempo=1.2"}
ins, flt = [], []
for lid, t in sorted(AT.items(), key=lambda x: x[1]):
    f = os.path.join(VO, 'ep2en', lid + '.wav')
    if not os.path.exists(f): print('нет', lid); continue
    k = len(ins) // 2; ins += ['-i', f]; ms = int(t * 1000)
    flt.append(f"[{k}:a]{FX[role[lid]]},aresample=48000,adelay={ms}|{ms},apad[a{k}]")
n = len(flt); out = os.path.join(R0, 'vo2.wav' if PART == 'main' else f'vo2-{PART}.wav')
flt.append(''.join(f"[a{k}]" for k in range(n)) + f"amix=inputs={n}:normalize=0:duration=longest,atrim=0:{TM['total']},pan=stereo|c0=c0|c1=c0[out]")
subprocess.run(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', ';'.join(flt), '-map', '[out]', '-ar', '48000', out], check=True)
print(os.path.basename(out), n, 'реплик')
