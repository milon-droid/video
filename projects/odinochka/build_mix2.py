# Сведение серии 2: голос (vo/ep2/*.wav по timeline) + звуки (sfx.py) + музыка → remotion/public/ep2-mix.wav
import json, re, subprocess, os
R = 'remotion/src/ep2/timeline.ts'; src = open(R).read()
dur = json.load(open('remotion/public/vo2/durations.json'))
raw = re.findall(r"\{ id: '(\w+)', d: ([\d.]+)((?:, vo: \[(?:\['w\w+', [\d.]+\],? ?)*\])?) \}", src)
shots = []; a = 0
for sid, d, vo in raw:
    vos0 = re.findall(r"\['(w\w+)', ([\d.]+)\]", vo or ''); vos = []; prev = -1
    for v, at in vos0:
        at = max(float(at), prev + .25); prev = at + dur.get(v, 2); vos.append((v, at))
    need = max([float(at) + dur.get(v, 2) + .35 for v, at in vos] + [0])
    dd = max(float(d), need); shots.append((sid, a, dd, vos)); a += dd
TOTAL = a; st = {s: b for s, b, _, _ in shots}
print('план', len(shots), 'всего', round(TOTAL, 2))
L = lambda id, g=.8, **k: dict(type='lib', id=id, gain=g, **k)
S = lambda ty, g=.6, **k: dict(type=ty, gain=g, **k)
GORE = lambda n=1: L(f'oc-GORESqsh_BloodSquishSlimy_OS_0{n}', .9)
BONE = lambda n=1: L(f'oc-GOREBone_BonesBreaking_OS_0{n}', .8)
F = lambda n, g=.9, **k: L('fs-' + n, g, **k)
C = {
 'a0': [(0, F('drone-space', .7, dur=3.0)), (0, S('hum', .45, dur=1.3)), (.1, L('oc-VOXWhsp_WhispersCreepyReverb_OS_01', .7)), (.3, F('laugh', .5)), (.5, L('oc-VOXWhsp_WhispersCreepy_OS_01', .6)), (.8, F('laugh-2', .45, rate=.8)), (1.1, F('trailer-sub', 1.0)), (1.18, F('flesh-carcass', 1.0)), (1.2, F('flesh-rip', 1.0)), (1.2, F('gore-splat', 1.0)), (1.22, BONE(1)), (1.25, BONE(2)), (1.25, L('oc-CREAHmn_GiantDeathScream_OS_01', .7)), (1.4, L('oc-VOXFem_Female01DeathScream_OS_01', .45)), (1.5, L('oc-CREAHmn_OgreDeathScream_OS_01', .45, rate=.8)), (1.6, L('oc-CREAHmn_TrollDeathScream_OS_01', .4, rate=1.2)), (1.7, GORE(3)), (1.9, F('bodyfall-1', .8)), (2.0, F('growl-hybrid', .5, rate=.7))],
 'a2': [(.3, L('whoosh-medium-hard', .6, rate=.8)), (.55, L('cinematic-drum-massive', 1.0)), (.55, L('impact-deep-hard', .6)), (.6, S('charge', .3, dur=1.0))],
 'b0': [(0, S('hum', .35, dur=4.2)), (0, F('drone-archi', .4, dur=4.2)), (1.0, S('step', .4)), (1.9, S('step', .4))],
 'b1': [(0, S('hum', .3, dur=2.6)), (0, L('oc-VOXWhsp_WhispersCreepy_OS_01', .3))],
 'b2': [(0, S('crackle', .5, dur=1.8)), (1.6, S('hiss', .3, dur=1.0)), (0, S('hum', .3, dur=3.4))],
 'b3': [(0, S('hum', .3, dur=4.4)), (.3, L('oc-VOXWhsp_WhispersCreepyReverb_OS_01', .25))],
 'b6': [(0, S('hum', .4, dur=3.2)), (0, L('bsb-heartbeat-slow', .6)), (1.5, F('laugh-2', .2))],
 'a3': [(0, S('rattle', .3, dur=1.0)), (.2, L('oc-TRNDoor_TrainDoorsOpen_OS_01', .8)), (.4, S('hum', .7, dur=3.8)), (.6, L('bsb-heartbeat-slow', .6)), (2.6, S('step', .7, pitch=.7)), (3.0, S('step', .8, pitch=.7)), (3.0, L('impact-deep-hard', .5))],
 'a4': [(0, S('hum', .7, dur=3.4)), (0, L('bsb-heartbeat-slow', .6)), (.5, L('oc-VOXWhsp_WhispersCreepyReverb_OS_01', .35))] + [(.2 + i * .18, L('click-tap-firm', .25)) for i in range(6)],
 'e5': [(0, S('hum', 1.0, dur=2.4)), (.2, S('breath_in', .5)), (.5, S('breath_in', .4, pitch=1.2)), (.8, S('breath_in', .45, pitch=.8)), (0, L('bsb-heartbeat-fast', .8))],
 'i3b': [(2.6, F('flesh-rip', 1.0)), (2.6, F('gore-splat', .9)), (2.6, L('impact-heavy-hard', .9)), (.3, F('flesh-rip', .7)), (.3, L('impact-heavy-hard', .8)), (.4, S('skid', .5)), (0, S('wind', .5, dur=3.6)), (1.0, S('breath_in', .6)), (2.0, GORE(1))],
 'j1b': [(0, F('monitor', .35)), (0, S('chord', .25, notes=[45, 52, 57], dur=4.8))],
 'g1b': [(0, F('drone-archi', .5, dur=5.2)), (.3, S('step', .4)), (1.0, L('click-tap-medium', .3)), (2.0, L('foley-glass-touch', .0)), (2.0, S('tinkle', .3, dur=.6)), (2.2, L('bsb-heartbeat-slow', .6))] + [(3.0 + i * .5, L('oc-METLImpt_HammerAnvil_OS_01', .3 + i * .1)) for i in range(5)],
 'i2a': [(0, S('wind', .5, dur=3.0)), (0, S('rattle', .6, dur=3.0)), (.5, F('glass-axe', .9)), (.9, GORE(1)), (1.0, S('skid', .6)), (1.8, GORE(2)), (1.9, S('skid', .6)), (1.2, L('oc-VOXWhsp_WhispersCreepyReverb_OS_01', .4))],
 'j0': [(0, F('monitor', .6)), (.2, S('hum', .12, dur=2.4))],
 'b6w': [(0, S('hum', .9, dur=2.4)), (0, S('chord', .3, notes=[50, 53, 57], dur=2.4)), (.3, F('laugh-2', .25))],
 'g9': [(0, S('drone', .2, dur=3.6)), (.2, L('bsb-heartbeat-slow', .5))],
 'i5b': [(0, S('charge', .6, dur=.6)), (.5, L('whoosh-medium-hard', .9, rate=.6)), (1.05, F('trailer-sub', 1.0)), (1.05, L('cinematic-metal-massive', 1.0)), (1.05, S('debris', .9, dur=1.5)), (1.1, L('impact-deep-hard', 1.0)), (1.8, S('hiss', .3, dur=1.2))],
 'e1': [(0, S('hum', .45, dur=3.2)), (0, L('bsb-heartbeat-fast', .7))] + [(.3 + i * .45, S('step', .45)) for i in range(6)],
 'e2': [(0, S('hum', .5, dur=1.2)), (.5, S('charge', .5, dur=.7)), (1.1, F('trailer-sub', 1.0)), (1.18, F('flesh-rip', 1.0)), (1.2, F('gore-splat', 1.0)), (1.2, BONE(2)), (1.2, L('oc-CREAHmn_GiantDeathScream_OS_01', .6, rate=1.3)), (1.55, F('bodyfall-2', 1.0)), (1.6, GORE(2))],
 'e3': [(.2, S('charge', .5, dur=.6)), (.88, F('flesh-carcass', .9)), (.9, F('gore-splat', .9)), (.9, BONE(3)), (1.25, F('bodyfall-1', .9)), (1.0, S('breath_in', .6))],
 'k1': [(0, S('hum', .5, dur=3.4)), (.2, S('chord', .25, notes=[45, 48, 52], dur=3.0)), (.4, L('oc-VOXWhsp_WhispersCreepyReverb_OS_01', .3))],
 'e4': [(.1, S('step', .5)), (.35, S('step', .5)), (.7, L('whoosh-fast-hard', .7)), (.72, L('oc-FGHTImpt_PunchRegular_OS_01', .5))],
 'c6': [(.3, L('fs-run', 0)), (.6, L('oc-METLHndl_ElectricBoxOpen_OS_01', .7)), (.6, L('whoosh-fast-medium', .6)), (.62, L('cinematic-metal-big', .5)), (2.2, S('breath_in', .5))],
 'c7': [(0, S('hum', .8, dur=2.8, pan=-.8)), (0, L('bsb-heartbeat-fast', .9)), (.4, L('oc-VOXWhsp_WhispersCreepyReverb_OS_01', .5))],
 'c7b': [(0, S('hum', .9, dur=3.2, pan=-.4)), (0, L('bsb-heartbeat-fast', .8))] + [(.3 + i * .55, S('step', .5)) for i in range(5)] + [(1.0, F('laugh', .3))],
 'c7c': [(0, L('whoosh-medium-hard', .7, rate=.7)), (.1, S('breath_in', .6)), (0, S('hum', 1.0, dur=2.2)), (1.6, S('charge', .6, dur=.6))],
 'c8': [(0, S('hum', 1.0, dur=.62)), (0, L('whoosh-fast-hard', 1.0)), (.35, L('cinematic-metal-big', .9)), (.35, S('glitch', .3)), (.65, F('glass-axe', 1.0)), (.65, F('glass-slow', .8)), (.65, L('cinematic-drum-massive', 1.0)), (.7, F('growl-hybrid', .7)), (.9, F('glass-fall', .7))],
 'c8b': [(0, S('zap', .5, dur=.8)), (.6, F('bodyfall-2', .6)), (1.8, F('bodyfall-1', 1.0)), (1.8, L('impact-deep-hard', .8)), (2.0, S('powerdown', .5))],
 'f1': [(0, S('hum50', .2, dur=5.4)), (0, L('bsb-heartbeat-slow', .4))],
 'f2': [(.3, L('impact-deep-hard', .9)), (.3, S('rattle', .5, dur=1.5)), (.5, L('oc-TRNSbwy_SubwayPassbyEnter_OS_01', .7)), (.9, S('beep', .2))],
 'g1': [(0, L('oc-TRNDoor_TrainDoorsOpen_OS_01', .7)), (0, F('drone-space', .5, dur=3.4))] + [(x, L('oc-METLImpt_HammerAnvil_OS_01', .35 + i * .08)) for i, x in enumerate([.6, 1.2, 1.8, 2.3, 2.7, 3.0])],
 'g2': [(.3, L('whoosh-medium-hard', .8, rate=.6)), (.55, F('trailer-sub', 1.0)), (.55, L('impact-deep-hard', 1.0)), (.6, S('debris', .6, dur=1.0)), (.9, F('growl-deep', 1.0)), (1.0, F('growl-1', .7))],
 'g6': [(0, F('growl-hybrid', 1.0)), (0, F('growl-deep', .8, rate=.8)), (0, L('cinematic-metal-massive', .5))],
 'g3': [(.5, S('charge', .4, dur=.4)), (.7, L('whoosh-fast-hard', .8)), (.7, S('crackle', .7, dur=1.0)), (1.1, L('impact-heavy-hard', 1.0)), (1.1, S('boom', .7)), (1.6, S('zap', .9, dur=.5)), (1.62, L('cinematic-drum-big', .7)), (2.4, F('growl-1', .9))],
 'g7': [(0, F('drone-archi', .6, dur=4.4)), (.2, L('oc-VOXWhsp_WhispersCreepyReverb_OS_01', .6)), (.5, F('laugh', .4)), (1.4, F('growl-deep', .5)), (2.2, F('laugh-2', .4))] + [(.3 + i * .4, S('step', .3, pitch=.7)) for i in range(10)],
 'g4': [(.1, L('whoosh-medium-hard', .9, rate=.6)), (.7, L('cinematic-metal-massive', 1.0)), (.7, S('debris', .7, dur=1.0)), (.72, GORE(4)), (.9, F('growl-1', .7))],
 'g8': [(0, S('crackle', .9, dur=3.6)), (0, S('roar', .4, dur=3.6, pitch=.6)), (2.6, L('whoosh-medium-hard', 1.0, rate=.6)), (3.1, F('trailer-sub', 1.0)), (3.1, L('cinematic-metal-massive', 1.0)), (3.12, F('flesh-rip', 1.0)), (3.12, F('gore-splat', 1.0)), (3.15, BONE(2)), (3.5, F('bodyfall-2', .9))],
 'g5': [(.1, L('oc-TRNDoor_TrainDoorsClose_OS_01', .9)), (1.3, L('cinematic-metal-big', .9)), (1.3, F('flesh-carcass', .9)), (1.3, BONE(1)), (1.35, F('growl-hybrid', 1.0)), (1.6, L('oc-TRNSbwy_SubwayPassbyEnter_OS_01', .7)), (2.4, L('cinematic-drum-massive', .9)), (2.4, F('growl-deep', .8))],
 'i1': [(0, S('rattle', .3, dur=3.2)), (0, S('zap', .3, dur=.4)), (1.2, S('zap', .35, dur=.3)), (2.2, S('zap', .3, dur=.5)), (0, L('bsb-heartbeat-slow', .5))],
 'h1': [(0, S('rattle', .5, dur=4.6)), (0, S('engine', .4, dur=4.6)), (.4, S('glitch', .4))],
 'h2': [(0, S('wind', .7, dur=4.8)), (0, L('bass-rumble-long', .8)), (.4, S('skid', .6)), (.5, L('oc-TRNElec_TrainPassby_OS_01', .7)), (2.6, F('growl-deep', .7, rate=.6)), (2.8, F('trailer-sub', .8))],
 'i2': [(0, S('wind', .5, dur=2.8)), (0, S('rattle', .6, dur=2.8)), (.8, F('glass-axe', 1.0)), (.8, L('cinematic-drum-big', .8)), (1.0, F('flesh-rip', .7)), (1.1, L('oc-CREAHmn_GiantDeathScream_OS_01', .5, rate=1.4)), (1.4, F('gore-splat', .9))],
 'i3': [(0, S('skid', .3)), (.5, S('skid', .3)), (1.2, S('skid', .3)), (0, S('wind', .4, dur=3.6)), (0, S('hum', .6, dur=3.6)), (.5, GORE(3)), (1.5, GORE(4)), (0, L('bsb-heartbeat-fast', .6))],
 'i4': [(.2, S('hiss', .7, dur=1.4)), (1.3, L('whoosh-medium-hard', 1.0)), (1.6, F('growl-deep', .7))],
 'i5': [(0, S('wind', .6, dur=2.4)), (.3, F('growl-hybrid', 1.0, rate=.7)), (1.2, F('growl-deep', 1.0, rate=.6)), (2.4, L('cinematic-drum-massive', 1.0)), (2.4, S('charge', .6, dur=1.0)), (2.5, S('tinkle', .4, dur=1.2))],
 'i6': [(4.6, S('powerdown', .5)), (4.6, L('click-tap-firm', .5)), (0, S('debris', .4, dur=1.0)), (0, L('bsb-heartbeat-slow', .9)), (2.0, S('drone', .3, dur=1.6))],
 'i7': [(.3, L('click-tap-firm', .5)), (.3, S('chord', .3, notes=[57, 61, 64], dur=3.5)), (2.4, L('cinematic-drum-big', .7)), (2.4, S('charge', .5, dur=1.0))],
 'j1': [(0, F('monitor', .7)), (0, S('hum', .15, dur=4.6))],
 'j2': [(.4, S('charge', .5, dur=1.0)), (.4, L('click-tap-firm', .5)), (0, F('monitor', .4))],
 'j3': [(.2, L('cinematic-drum-massive', .9))],
}
cues = []
sd = {x[0]: x[2] for x in shots}
for sid, cs in C.items():
    if sid not in st: continue
    for t, c in cs:
        if c.get('gain', 1) <= 0: continue
        c = {**c, 't': round(st[sid] + t, 3)}
        if c.get('id') in ('bsb-bsb-3040', 'bsb-bsb-3032', 'bsb-bsb-3039', 'bsb-bsb-3043') and 'dur' not in c: c['dur'] = round(sd[sid] - t + .15, 2)  # атмосфера — ровно на план
        cues.append(c)
# финальный удар на титр
pass
json.dump(sorted(cues, key=lambda c: c['t']), open('sfx-ep2.json', 'w'), ensure_ascii=False)
A = 'remotion/public/audio'; os.makedirs(A, exist_ok=True)
# пространство: метро — длинное эхо, вагон — короткое тесное, остальное — сухо
STATION = {'g1', 'g2', 'g6', 'g3', 'g7', 'g4', 'g8', 'i5b', 'i6'}
def zone_at(tt):
    for sid, b, dd, _ in shots:
        if b <= tt < b + dd: return 'station' if sid in STATION else 'train' if sid[0] in 'abecfhik' and sid not in ('a2', 'h2', 'i5', 'i7') else 'dry'
    return 'dry'
REV = {'station': 'aecho=0.8:0.75:140|310|520:0.42|0.28|0.16', 'train': 'aecho=0.7:0.6:18|37:0.32|0.2,lowpass=f=9500', 'dry': 'anull'}
VOREV = {'station': ',aecho=0.8:0.6:140|300:0.28|0.16', 'train': ',aecho=0.7:0.5:20|40:0.22|0.13', 'dry': ''}
stems = []
for z in REV:
    zc = [c for c in cues if zone_at(c['t']) == z]
    json.dump(zc, open(f'/tmp/claude-0/ep2sfx-{z}.json', 'w'))
    subprocess.run(['python3', '../../tools/sfx.py', f'/tmp/claude-0/ep2sfx-{z}.json', '-o', f'/tmp/claude-0/ep2sfx-{z}.wav', '--duration', str(TOTAL)], check=True, capture_output=True)
    stems.append(z)
subprocess.run(['ffmpeg', '-v', 'error', '-y', *sum([['-i', f'/tmp/claude-0/ep2sfx-{z}.wav'] for z in stems], []), '-filter_complex',
    ';'.join(f'[{i}]{REV[z]}[z{i}]' for i, z in enumerate(stems)) + ';' + ''.join(f'[z{i}]' for i in range(len(stems))) + f'amix=inputs={len(stems)}:normalize=0', f'{A}/sfx2.wav'], check=True)
# голос: дорожка из реплик на своих местах (диктор — с эхом станции)
vo_in, vo_f = [], []
for sid, b, dd, vos in shots:
    for v, at in vos:
        f = f'vo/ep2/{v}.wav'
        if not os.path.exists(f): continue
        i = len(vo_in) // 2; vo_in += ['-i', f]; ms = int((b + float(at)) * 1000)
        role = [l['role'] for l in json.load(open('vo/ep2.json'))['lines'] if l['id'] == v][0]
        fx = {'announcer': ',aecho=0.8:0.6:120|260:0.35|0.2,highpass=f=250,lowpass=f=6000',
              'collector': ',asetrate=48000*0.88,aresample=48000,atempo=1.136,lowshelf=f=160:g=4,acrusher=bits=12:mix=0.15',
              'father': ',highpass=f=120,aecho=0.6:0.5:60:0.2,asetrate=48000*0.97,aresample=48000'}.get(role, '')
        fx += VOREV[zone_at(b + float(at) + .1)]
        if role == 'kirill':  # ровный тембр: подтянуть высокие под средний центроид Кирилла
            import numpy as np
            xx = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True).stdout, np.float32)
            S_ = np.abs(np.fft.rfft(xx * np.hanning(len(xx)))); fr = np.fft.rfftfreq(len(xx), 1 / 16000); cen = (S_ * fr).sum() / S_.sum()
            g = max(-4, min(6, (2300 - cen) / 120)); fx += f',highshelf=f=2200:g={g:.1f}'
        fx += ',highpass=f=80,acompressor=threshold=0.08:ratio=3:attack=5:release=120:makeup=2,equalizer=f=3000:t=q:w=1:g=3'
        vo_f.append(f'[{i}]aresample=48000,aformat=channel_layouts=mono{fx},adelay={ms}|{ms}[v{i}]')
n = len(vo_f)
fc = ';'.join(vo_f) + ';' + ''.join(f'[v{i}]' for i in range(n)) + f'amix=inputs={n}:normalize=0,apad=whole_dur={TOTAL}[vo]'
subprocess.run(['ffmpeg', '-v', 'error', '-y', *vo_in, '-filter_complex', fc, '-map', '[vo]', '-ac', '2', '-ar', '48000', f'{A}/vo2.wav'], check=True)
# музыка по сценам: хук — эпик, дом — пианино, поезд — тёмный эмбиент + нарастание, финал — трагический эпик
lib = f'{A}/lib'
END = TOTAL
M = [  # файл, с какой секунды трека, начало в ролике, длина, громкость, fade in, fade out
 ('horror-intense-magmi.mp3', 0, 0, st['a2'] + .4, .8, .05, .3),
 ('epic-loop-fusionwolf.mp3', 0, st['a2'] + .5, st['b0'] - st['a2'] - .4, .7, .05, .4),
 ('strings-choir-sad-szegvari.mp3', 4, st['b0'], st['b6'] - st['b0'], .65, 1.0, .6),
 ('strings-choir-slow-szegvari.mp3', 0, st['b6'], st['e1'] - st['b6'], .35, .4, .4),
 ('horror-intense-magmi.mp3', 10, st['e1'], st['c6'] - st['e1'] + .3, .6, .3, .4),
 ('ambient-horror-track-01.ogg', 0, st['c6'], st['c8'] - st['c6'] + .4, .7, .5, .1),
 ('epic-orch-bertsz.mp3', 30, st['c8'] + .65, st['f1'] - st['c8'] - .3, .8, .05, 1.0),
 ('strings-choir-slow-szegvari.mp3', 6, st['f1'], st['g1'] - st['f1'], .55, 1.0, .5),
 ('eyes-in-the-shadows.ogg', 0, st['g1'], st['g2'] - st['g1'] + .5, .6, .5, .2),
 ('epic-loop-fusionwolf.mp3', 40, st['g2'] + .5, st['g8'] - st['g2'] - .5, .9, .05, .6),
 ('gladiators-lament-epic-tragic-music.mp3', 0, st['g8'], st['g9'] - st['g8'] + .3, .8, .6, .6),
 ('time-of-the-apocalypse.ogg', 0, st['i1'] + 1.5, st['i5b'] - st['i1'] - 1.5, .8, 1.5, .3),
 ('strings-choir-slow-szegvari.mp3', 30, st['i6'], st['j1'] - st['i6'], .55, 1.0, .5),
 ('emotional-piano-0.ogg', 0, st['j1'], TOTAL - st['j1'], .7, 1.0, 1.5),
]
ins, fs = [], []
for i, (f, off, at, ln, g, fi, fo) in enumerate(M):
    ins += ['-ss', str(off), '-t', str(ln), '-i', f'{lib}/{f}']; ms = int(at * 1000)
    fs.append(f'[{i}]aresample=48000,aformat=channel_layouts=stereo,volume={g},afade=t=in:d={fi},afade=t=out:st={max(0, ln - fo)}:d={fo},adelay={ms}|{ms}[m{i}]')
fc = ';'.join(fs) + ';' + ''.join(f'[m{i}]' for i in range(len(M))) + f'amix=inputs={len(M)}:normalize=0,apad=whole_dur={TOTAL}[mu]'
subprocess.run(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', fc, '-map', '[mu]', '-ar', '48000', f'{A}/music2.wav'], check=True)
# сведение: музыка приглушается под голос (sidechain), голос громче фона
for VG, OUT in ((3.2, 'remotion/public/ep2-mix.wav'), (0.0, '/tmp/claude-0/ep2-bg.wav')):
    fc = ('[2]asplit=3[vo1][vo2][vo3];[0]volume=0.22,equalizer=f=2500:t=q:w=1.2:g=-5[mu];[mu][vo1]sidechaincompress=threshold=0.015:ratio=12:attack=10:release=450[mud];'
          '[1]volume=0.5[sf0];[sf0][vo3]sidechaincompress=threshold=0.015:ratio=10:attack=8:release=300[sf];'
          f'[vo2]volume={VG}[vv];[mud][sf][vv]amix=inputs=3:normalize=0,alimiter=limit=0.95,atrim=0:{TOTAL}[out]')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{A}/music2.wav', '-i', f'{A}/sfx2.wav', '-i', f'{A}/vo2.wav', '-filter_complex', fc, '-map', '[out]', '-ar', '48000', OUT], check=True)
print('микс готов', round(TOTAL, 2), 'с')
