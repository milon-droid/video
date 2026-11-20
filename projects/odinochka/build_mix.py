# Сведение серии 1 v2: голос (vo/ep1/*.wav по timeline) + шумы (sfx.py) + музыка CC0 (OpenGameArt) → remotion/public/ep1-mix.wav
# Тайминги планов считаются так же, как в remotion/src/ep1/timeline.ts (план ≥ реплик + 0,3 с).
import json, re, subprocess, os
R = 'remotion/src/ep1/timeline.ts'; src = open(R).read()
dur = json.load(open('remotion/public/vo/durations.json'))
raw = re.findall(r"\{ id: '([spf]\w+)', d: ([\d.]+)((?:, vo: \[(?:\['v\w+', [\d.]+\],? ?)*\])?) \}", src)
shots = []; a = 0
for sid, d, vo in raw:
    vos0 = re.findall(r"\['(v\w+)', ([\d.]+)\]", vo or ''); vos = []; prev = -1
    for v, at in vos0:  # как в timeline.ts: реплики в плане не накладываются
        at = max(float(at), prev + .25); prev = at + dur.get(v, 2); vos.append((v, at))
    need = max([float(at) + dur.get(v, 2) + .3 for v, at in vos] + [0])
    dd = max(float(d), need); shots.append((sid, a, dd, vos)); a += dd
TOTAL = a; st = {s: b for s, b, _, _ in shots}
print('план', len(shots), 'всего', round(TOTAL, 2))
L = lambda id, g=.8, **k: dict(type='lib', id=id, gain=g, **k)
S = lambda ty, g=.6, **k: dict(type=ty, gain=g, **k)
C = {
 's01': [(0, S('wind', .5, dur=3.4)), (0, S('drone', .3, dur=3.4))],
 's02': [(.2, L('bass-rumble-long', .8)), (.3, L('whoosh-medium-hard', .5)), (.9, L('whoosh-medium-hard', .45, rate=.8)), (1.5, L('whoosh-medium-hard', .5, rate=.9)), (1.0, S('roar', .3, dur=2.2))],
 's03': [(.45, L('whoosh-fast-soft', .4)), (1.15, L('cinematic-drum-massive', 1.0)), (1.15, S('roar', .5, dur=1.0))],
 's04': [(0, L('cinematic-slam-massive', .9))],
 's05': [(0, S('wind', .3, dur=4)), (0, S('hum', .25, dur=4)), (.5, S('siren', .1, dur=3))],
 's06': [(.1 + i * .12, L('click-tap-firm', .4)) for i in range(6)] + [(1.15, S('lowbat', .35))],
 's07': [(0, S('hiss', .35, dur=4))] + [(.2 + i * .5, S('step', .4)) for i in range(8)],
 's08': [(0, S('hum', .15, dur=4.6)), (.2, S('breath_in', .2))],
 's09': [(0, S('hiss', .12, dur=.8)), (.4, S('step', .5)), (.7, S('step', .5)), (1.1, L('whoosh-fast-medium', .6)), (1.2, L('impact-heavy-hard', 1.0)), (1.55, L('impact-deep-hard', 1.0)), (1.6, S('debris', .5, dur=.8)), (1.75, S('brush', .4, dur=.7))],
 's10': [(0, S('hum', .18, dur=4)), (1.0, L('click-tap-medium', .5)), (1.6, L('notification-failure-fall', .45))],
 's11': [(0, L('phone-vibrate-table', .7)), (.45, L('click-tap-firm', .6))],
 's12': [],
 's04i': [(.3, L('whoosh-medium-hard', .6, rate=.8)), (.55, L('cinematic-drum-massive', 1.0)), (.55, L('impact-deep-hard', .6)), (.6, S('charge', .3, dur=1.0)), (1.3, L('whoosh-fast-soft', .4))],
 's13': [(0, L('bsb-bsb-3032', .5)), (0, S('hum', .3, dur=3.6))] + [(.2 + i * .45, S('step', .22, pitch=.8)) for i in range(7)],
 's14': [(.2, S('charge', .6, dur=2.0)), (.3, L('whoosh-medium-hard', .6, rate=.7)), (2.2, L('cinematic-drum-big', .8))],
 's15': [(.2, L('bsb-bsb-3039', 1.0)), (.4, L('bass-rumble-long', .6)), (1.8, S('horn', .35, dur=1.0, pitch=.7))],
 's16': [(0, L('bsb-bsb-3032', .3, offset=5))],
 'f17': [(0, L('bsb-bsb-3040', .5)), (.8, L('bsb-bsb-2153', .8))],
 'f18': [(.4, L('impact-deep-hard', .8)), (.5, S('thud', .5)), (.6, L('bsb-bsb-3039', .7, offset=6))],
 'f18b': [(0, L('bsb-bsb-3040', .6, offset=6)), (.2, L('fs-train-squeal', .6)), (.5, L('fs-fluorescent-flicker', .8)), (1.25, L('fs-bass-power-down', .9)), (1.4, L('fs-whispers-4voices', .45)), (1.5, L('bsb-heartbeat-slow', .7)), (2.2, L('fs-shuffling-crowd', .5))],
 'f18c': [(0, L('fs-whispers-4voices', .5, offset=3)), (0, L('fs-shuffling-crowd', .55, offset=4)), (.4, L('click-tap-firm', .9)), (.42, L('mechanical-latch-heavy', .5)), (1.3, L('fs-horror-sting', 1.0)), (1.35, L('fs-stinger-metal', .7)), (1.5, L('bsb-heartbeat-fast', .7)), (2.0, L('fs-whispers-creepy', .6))],
 'f19': [(0, L('fs-gasp', .9)), (.1, L('fs-piano-shock', .8)), (.3, L('bsb-breathing-man-slow', .6)), (.5, L('fs-whispers-deafening', .4, offset=8))],
 'f20': [(0, L('fs-shuffling-crowd2', .6)), (.25, S('charge', .5, dur=.6)), (.3, S('crackle', .45, dur=1.6)), (.35, L('fs-stinger-3', .7))],
 'f21': [(0, L('fs-shuffling-crowd2', .5, offset=3)), (.3, L('whoosh-medium-hard', .7)), (.75, L('cinematic-drum-big', 1.0)), (.75, L('impact-heavy-hard', .8)), (.8, S('crackle', .5, dur=1.0))] + [(1.5 + i * .1, S('click', .4, pitch=.6)) for i in range(14)] + [(2.0, S('puff', .4)), (2.5, S('puff', .4)), (2.6, L('fs-whispers-creepy', .4))],
 'f22': [(0, L('fs-shuffling-crowd', .5, offset=8)), (.4, S('zap', .8, dur=.4)), (.45, L('cinematic-thunder-massive', .5)), (.9, L('fs-gasp', .6)), (1.0, S('brush', .5, dur=.8)), (1.4, L('whoosh-fast-medium', .6)), (1.6, L('impact-heavy-hard', 1.0)), (1.62, L('cinematic-drum-big', .7)), (1.7, S('puff', .4)), (2.2, L('fs-stinger-4', .5))],
 'f23': [(0, L('fs-fluorescent-flicker', .6, offset=1)), (.2, S('puff', .3)), (.5, S('puff', .3)), (.6, S('tone', .12, dur=2.0, freq=4000))],
 'f24': [(0, L('bsb-bsb-3040', .5, offset=22))],
 'f25': [(.2, L('bsb-bsb-3043', 1.0, offset=8)), (.3, S('skid', .6, dur=1.2)), (.5, L('cinematic-slam-big', .5))],
 'f26': [(.2, L('bsb-bsb-2153', .7)), (.3, S('hiss', .4, dur=.8)), (.5, L('cinematic-drum-massive', .6))],
 'f27': [(0, S('drone', .35, dur=3.2)), (.2, S('tone', .2, dur=3.0, freq=220)), (.2, L('bsb-heartbeat-slow', .5))],
 'f28': [(.2, S('powerdown', .4)), (.2, L('whoosh-fast-soft', .4))],
 'f29': [(0, L('bsb-heartbeat-slow', .7)), (2.0, S('tone', .2, dur=1.4, freq=110))],
}
cues = []
sd = {x[0]: x[2] for x in shots}
for sid, cs in C.items():
    for t, c in cs:
        if c.get('gain', 1) <= 0: continue
        c = {**c, 't': round(st[sid] + t, 3)}
        if c.get('id') in ('bsb-bsb-3040', 'bsb-bsb-3032', 'bsb-bsb-3039', 'bsb-bsb-3043') and 'dur' not in c: c['dur'] = round(sd[sid] - t + .15, 2)  # атмосфера — ровно на план
        cues.append(c)
# финальный удар на титр
s30 = [x for x in shots if x[0] == 'f29'][0]; cues.append({'type': 'lib', 'id': 'cinematic-slam-massive', 'gain': 1.0, 't': round(s30[1] + s30[2] - 1.8, 3)})
json.dump(sorted(cues, key=lambda c: c['t']), open('sfx-ep1.json', 'w'), ensure_ascii=False)
A = 'remotion/public/audio'; os.makedirs(A, exist_ok=True)
subprocess.run(['python3', '../../tools/sfx.py', 'sfx-ep1.json', '-o', f'{A}/sfx.wav', '--duration', str(TOTAL)], check=True)
# голос: дорожка из реплик на своих местах (диктор — с эхом станции)
vo_in, vo_f = [], []
for sid, b, dd, vos in shots:
    for v, at in vos:
        f = f'vo/ep1/{v}.wav'
        if not os.path.exists(f): continue
        i = len(vo_in) // 2; vo_in += ['-i', f]; ms = int((b + float(at)) * 1000)
        role = [l['role'] for l in json.load(open('vo/ep1.json'))['lines'] if l['id'] == v][0]
        fx = {'announcer': ',aecho=0.8:0.6:120|260:0.35|0.2,highpass=f=250,lowpass=f=6000',
              'collector': ',asetrate=48000*0.88,aresample=48000,atempo=1.136,lowshelf=f=160:g=4,acrusher=bits=12:mix=0.15',
              'father': ',highpass=f=120,aecho=0.6:0.5:60:0.2'}.get(role, '')
        fx += ',highpass=f=80,acompressor=threshold=0.08:ratio=3:attack=5:release=120:makeup=2,equalizer=f=3000:t=q:w=1:g=3'
        vo_f.append(f'[{i}]aresample=48000,aformat=channel_layouts=mono{fx},adelay={ms}|{ms}[v{i}]')
n = len(vo_f)
fc = ';'.join(vo_f) + ';' + ''.join(f'[v{i}]' for i in range(n)) + f'amix=inputs={n}:normalize=0,apad=whole_dur={TOTAL}[vo]'
subprocess.run(['ffmpeg', '-v', 'error', '-y', *vo_in, '-filter_complex', fc, '-map', '[vo]', '-ac', '2', '-ar', '48000', f'{A}/vo.wav'], check=True)
# музыка по сценам: хук — эпик, дом — пианино, поезд — тёмный эмбиент + нарастание, финал — трагический эпик
lib = f'{A}/lib'
b05, b14, b20, b25, END = st['s05'], st['s14'], st['f19'], st['f28'], TOTAL
M = [  # файл, с какой секунды трека, начало в ролике, длина, громкость, fade in, fade out (музыка CC0: music-credits.json, get-music.sh)
 ('epic-orch-bertsz.mp3', 27, 0, st['s04i'] + .6, .8, .2, .12),
 ('epic-loop-fusionwolf.mp3', 0, st['s04i'] + .5, st['s04'] - st['s04i'] - .4, .7, .05, .4),
 ('piano-darknight-szegvari.mp3', 0, b05 - .3, b14 - b05 + .6, .7, 1.2, 1.5),
 ('horror-drone-magmi.mp3', 0, b14 + 1.8, st['f18b'] + 1.3 - b14 - 1.8, .2, 2, .08),   # обрыв музыки, когда гаснет свет
 ('horror-intense-magmi.mp3', 60, st['f20'], st['f23'] - st['f20'] + .3, .45, .05, .3),
 ('horror-intense-magmi.mp3', 0, st['f25'], b25 - st['f25'] + .5, .3, .8, .8),
 ('strings-choir-slow-szegvari.mp3', 6, b25, END - b25, .6, 1.5, 2.0),
]
ins, fs = [], []
for i, (f, off, at, ln, g, fi, fo) in enumerate(M):
    ins += ['-ss', str(off), '-t', str(ln), '-i', f'{lib}/{f}']; ms = int(at * 1000)
    fs.append(f'[{i}]aresample=48000,aformat=channel_layouts=stereo,volume={g},afade=t=in:d={fi},afade=t=out:st={max(0, ln - fo)}:d={fo},adelay={ms}|{ms}[m{i}]')
fc = ';'.join(fs) + ';' + ''.join(f'[m{i}]' for i in range(len(M))) + f'amix=inputs={len(M)}:normalize=0,apad=whole_dur={TOTAL}[mu]'
subprocess.run(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', fc, '-map', '[mu]', '-ar', '48000', f'{A}/music.wav'], check=True)
# сведение: музыка приглушается под голос (sidechain), голос громче фона
fc = ('[2]asplit=3[vo1][vo2][vo3];[0]volume=0.35,equalizer=f=2500:t=q:w=1.2:g=-4[mu];[mu][vo1]sidechaincompress=threshold=0.02:ratio=10:attack=15:release=500[mud];'
      '[1]volume=0.8[sf0];[sf0][vo3]sidechaincompress=threshold=0.03:ratio=4:attack=10:release=300[sf];'
      f'[vo2]volume=2.2[vv];[mud][sf][vv]amix=inputs=3:normalize=0,alimiter=limit=0.95,atrim=0:{TOTAL}[out]')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{A}/music.wav', '-i', f'{A}/sfx.wav', '-i', f'{A}/vo.wav', '-filter_complex', fc, '-map', '[out]', '-ar', '48000', 'remotion/public/ep1-mix.wav'], check=True)
print('микс готов', round(TOTAL, 2), 'с')
