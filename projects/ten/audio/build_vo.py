#!/usr/bin/env python3
"""Дорожка голоса серии 1: реплики из vo/ep1 (+ одобренные из vo/probe2) по таймкодам, обработка по ролям → vo.wav (48 кГц, моно→стерео)."""
import json, subprocess, os, sys
ROOT = os.path.dirname(os.path.abspath(__file__)); VO = os.path.join(ROOT, '..', 'vo')
SENYA = "asetrate=24000*1.07,aresample=24000,atempo=0.98,highpass=f=100,equalizer=f=3000:t=q:w=1:g=2,acompressor=threshold=-20dB:ratio=3:makeup=3"
TEN = "asetrate=24000*0.9,aresample=24000,atempo=1.08,highpass=f=90,equalizer=f=160:t=q:w=1:g=3,equalizer=f=2400:t=q:w=1:g=3,acompressor=threshold=-24dB:ratio=5:makeup=5,aecho=0.6:0.4:24|48:0.22|0.12"
cfg = json.load(open(os.path.join(VO, 'ep1.json')))
items = [("probe2/q1.wav", "senya", .12, 1.0), ("probe2/q2.wav", "senya", 12.65, 1.15), ("probe2/q3_c1.wav", "ten", 33.45, 1.0), ("probe2/q4_c1.wav", "ten", 39.85, 1.0)]
PICK = json.load(open(os.path.join(VO, 'ep1-pick.json'))) if os.path.exists(os.path.join(VO, 'ep1-pick.json')) else {}
items += [(f"ep1/{PICK.get(l['id'], l['id'])}.wav", l['role'], l['t'], 1.0) for l in cfg['lines']]
TRIM = PICK.get('_trim', {})  # id -> секунда, с которой начинать (отрезать слово-разгон «Так.»)
ins, flt = [], []
for i, (f, role, t, tempo) in enumerate(items):
    p = os.path.join(VO, f)
    if not os.path.exists(p): print('нет', f); continue
    lid = os.path.basename(f).split('_')[0].replace('.wav', ''); ss = TRIM.get(lid)
    ins += (['-ss', str(ss)] if ss else []) + ['-i', p]; k = sum(1 for x in ins if x == '-i') - 1
    fx = (SENYA if role == 'senya' else TEN) + (f",atempo={tempo}" if tempo != 1 else '')
    flt.append(f"[{k}:a]{fx},aresample=48000,adelay={int(t * 1000)}|{int(t * 1000)},apad[a{k}]")
n = sum(1 for x in ins if x == '-i')
flt.append(''.join(f"[a{k}]" for k in range(n)) + f"amix=inputs={n}:normalize=0:duration=longest,atrim=0:75.8,pan=stereo|c0=c0|c1=c0[out]")
subprocess.run(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', ';'.join(flt), '-map', '[out]', '-ar', '48000', os.path.join(ROOT, 'vo.wav')], check=True)
print('vo.wav', n, 'реплик')
