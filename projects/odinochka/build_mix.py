# Сведение серии 1 v2: голос (vo/ep1/*.wav по timeline) + шумы (sfx.py) + музыка CC0 (OpenGameArt) → remotion/public/ep1-mix.wav
# Тайминги планов считаются так же, как в remotion/src/ep1/timeline.ts (план ≥ реплик + 0,3 с).
import json, re, subprocess, os
R = 'remotion/src/ep1/timeline.ts'; src = open(R).read()
dur = json.load(open('remotion/public/vo/durations.json'))
raw = re.findall(r"\{ id: '([sp]\w+)', d: ([\d.]+)((?:, vo: \[(?:\['v\w+', [\d.]+\],? ?)*\])?) \}", src)
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
 'p13': [(0, L('bsb-bsb-3032', .6))] + [(.2 + i * .45, S('step', .25, pitch=.8)) for i in range(8)],
 'p14': [(0, L('bsb-bsb-3032', .4, offset=5))],
 'p15': [(.1, S('step', .4)), (.45, S('step', .4)), (.8, L('bsb-bsb-2153', .8)), (1.6, S('hiss', .3, dur=.5)), (2.1, L('impact-deep-hard', .7))],
 'p16': [(0, S('hum', .2, dur=3.4))],
 'p17': [(0, S('hum', .15, dur=3.4)), (.3, S('tone', .12, dur=1.4, freq=180))],
 'p18': [(0, L('bsb-bsb-3039', .9)), (.1, S('thud', .4))],
 'p19': [(0, L('bsb-bsb-3040', .7)), (.3, S('crackle', .2, dur=.3)), (1.1, S('crackle', .2, dur=.3)), (2.3, L('whoosh-fast-soft', .5)), (2.3, S('tone', .2, dur=1.2, freq=140))],
 'p20': [(0, L('bsb-bsb-3040', .6, offset=4))],
 'p21': [(0, L('bsb-bsb-3040', .6, offset=7)), (.1, L('mechanical-latch-heavy', .7)), (.5, L('mechanical-latch-heavy', .7)), (1.2, L('impact-heavy-firm', .8)), (2.3, L('whoosh-fast-medium', .5)), (2.65, L('impact-heavy-hard', .8))],
 'p22': [(0, L('bsb-bsb-3040', .6, offset=11)), (.2, S('debris', .3, dur=1.6)), (.4, L('bass-rumble-medium', .5))],
 'p23': [(0, L('bsb-bsb-3040', .6, offset=14))] + [(.2 + i * .4, S('step', .45)) for i in range(8)] + [(1.45, L('whoosh-fast-medium', .6)), (1.6, L('cinematic-drum-big', .9)), (1.62, L('impact-heavy-hard', .9))],
 'p24': [(0, L('bsb-bsb-3040', .6, offset=18)), (.7, L('impact-heavy-firm', .8)), (.75, S('brush', .5, dur=.9)), (2.0, S('brush', .5, dur=1.0)), (2.9, L('impact-deep-soft', .6))],
 'p25': [(.3, L('bsb-bsb-3043', 1.0, offset=8)), (.4, S('skid', .6, dur=1.2)), (.55, L('cinematic-slam-big', .6))],
 'p26': [(0, S('drone', .3, dur=2.4)), (.2, L('bsb-heartbeat-slow', .6))],
 'p27': [(.2, L('bsb-bsb-2153', .7)), (.3, S('hiss', .4, dur=.8)), (.5, L('cinematic-drum-massive', .6))],
 'p28': [(0, S('drone', .3, dur=3.2))],
 'p29': [(0, S('tone', .15, dur=3.0, freq=110))],
 'p30': [(0, L('bsb-heartbeat-slow', .7))],
 'p31': [(0, S('wind', .2, dur=4.8))],
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
s30 = [x for x in shots if x[0] == 'p31'][0]; cues.append({'type': 'lib', 'id': 'cinematic-slam-massive', 'gain': 1.0, 't': round(s30[1] + s30[2] - 1.8, 3)})
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
b05, b14, b20, b25, END = st['s05'], st['p15'], st['p19'], st['p27'], TOTAL
M = [  # файл, с какой секунды трека, начало в ролике, длина, громкость, fade in, fade out (музыка CC0: music-credits.json, get-music.sh)
 ('epic-orch-bertsz.mp3', 27, 0, st['s04i'] + .6, .8, .2, .12),
 ('epic-loop-fusionwolf.mp3', 0, st['s04i'] + .5, st['s04'] - st['s04i'] - .4, .7, .05, .4),
 ('piano-darknight-szegvari.mp3', 0, b05 - .3, b14 - b05 + .6, .7, 1.2, 1.5),
 ('horror-drone-magmi.mp3', 0, b14 + 1.8, b20 - b14 - 1.4, .22, 2, 1.2),
 ('horror-intense-magmi.mp3', 60, b20 - .3, b25 - b20 + .8, .4, 1.0, 1.0),
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
