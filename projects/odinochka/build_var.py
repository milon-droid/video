# Звук для вариантов «вместо Депо» (remotion/src/ep2v/parts.json): голос + звуки + музыка → remotion/public/var{A,B,C}-mix.wav
import json, subprocess, os, sys
P = json.load(open('remotion/src/ep2v/parts.json')); dur = json.load(open('remotion/public/vo2/durations.json'))
roles = {l['id']: l['role'] for l in json.load(open('vo/ep2.json'))['lines']}
L = lambda id, g=.8, **k: dict(type='lib', id=id, gain=g, **k); S = lambda ty, g=.6, **k: dict(type=ty, gain=g, **k); F = lambda n, g=.9, **k: L('fs-' + n, g, **k)
GORE = lambda n=1: L(f'oc-GORESqsh_BloodSquishSlimy_OS_0{n}', .9)
C = {
 'f2': [(.3, L('impact-deep-hard', .9)), (.3, S('rattle', .5, dur=1.5)), (.5, L('oc-TRNSbwy_SubwayPassbyEnter_OS_01', .7))],
 'h2': [(0, S('wind', .7, dur=3.6)), (0, L('bass-rumble-long', .8)), (.4, S('skid', .6)), (2.4, F('growl-deep', .7, rate=.6))],
 'va1': [(0, S('rattle', .4, dur=3)), (0, F('drone-space', .6, dur=3))] + [(.6 + i * .45, S('zap', .3, dur=.15)) for i in range(5)] + [(1.2, L('oc-VOXWhsp_WhispersCreepyReverb_OS_01', .5))],
 'va2': [(0, F('drone-space', .6, dur=3))] + [(i * .38, S('zap', .35, dur=.12)) for i in range(7)] + [(i * .38 + .1, S('step', .4, pitch=.7)) for i in range(7)] + [(1.5, F('laugh', .35))],
 'va3': [(0, S('hum', .5, dur=3)), (.4, L('bsb-heartbeat-slow', .7)), (.6, S('chord', .3, notes=[45, 48, 52], dur=2.4))],
 'va4': [(0, S('zap', .8, dur=2.5)), (0, F('drone-archi', .5, dur=3.4)), (1.5, F('growl-1', .4))],
 'va5': [(0, S('crackle', .9, dur=4.6)), (0, L('bsb-heartbeat-fast', .6)), (2.0, F('laugh-2', .35)), (3.6, S('hiss', .5, dur=1.0))],
 'va6': [(0, S('powerdown', .6)), (.3, F('growl-hybrid', .9)), (.6, F('flesh-rip', 1.0)), (.6, GORE(2)), (.65, L('oc-CREAHmn_GiantDeathScream_OS_01', .6))],
 'vb1': [(0, F('drone-space', .6, dur=3.4)), (.2, S('zap', .4, dur=1.5)), (.6, F('bodyfall-2', .4)), (1.4, S('step', .7, pitch=.6)), (2.2, S('step', .7, pitch=.6))],
 'vb2': [(0, S('hum', .2, dur=3)), (.8, L('bsb-heartbeat-slow', .8)), (1.6, S('step', .6, pitch=.6)), (2.4, S('tinkle', .2, dur=.3))],
 'vb3': [(.3, S('breath_in', .6, pitch=1.3)), (.45, L('cinematic-drum-big', .8)), (.45, S('glitch', .4)), (1.5, S('chord', .3, notes=[45, 48, 52], dur=1.6))],
 'vb4': [(.3, L('cinematic-metal-big', .9)), (1.2, L('whoosh-medium-hard', .9)), (1.7, L('impact-heavy-hard', 1.0)), (1.7, F('growl-hybrid', .7))],
 'vb5': [(0, L('bsb-heartbeat-fast', .7)), (0, S('crackle', .3, dur=2)), (3.5, F('flesh-rip', 1.0)), (3.5, F('gore-splat', 1.0)), (3.55, L('oc-GOREBone_BonesBreaking_OS_01', .8))],
 'vc1': [(0, S('rattle', .5, dur=2.8))] + [(i * .3, S('step', .5)) for i in range(5)] + [(1.6, L('impact-heavy-hard', 1.0)), (1.6, L('oc-DOORMetl_HatchClose_OS_01', .7))],
 'vc2': [(0, S('rattle', .3, dur=4.6)), (.3, S('brush', .3)), (2.6, L('bsb-heartbeat-slow', .7)), (2.8, S('chord', .3, notes=[45, 49, 52], dur=1.8))],
 'vc3': [(.3, L('cinematic-metal-big', .8)), (.4, S('skid', .7)), (1.0, S('rattle', .7, dur=1.8))],
 'vc4': [(0, S('engine', .7, dur=3)), (0, S('rattle', .8, dur=3)), (.5, S('beep', .4)), (1.0, S('beep', .4)), (1.5, S('beep', .5)), (2.0, S('siren', .3, dur=1))],
 'vc5': [(0, S('rattle', .4, dur=.8)), (.4, F('glass-slow', .7)), (.8, F('glass-axe', 1.0)), (.8, F('trailer-sub', 1.0)), (.9, F('growl-deep', .9)), (1.2, GORE(1)), (2.0, S('wind', .6, dur=2.0))],
 'vc6': [(.1, L('oc-DOORMetl_HatchClose_OS_01', 1.0)), (.1, L('impact-deep-hard', .9)), (.9, L('oc-FGHTImpt_PunchRegular_OS_01', .6)), (1.4, L('oc-FGHTImpt_PunchRegular_OS_01', .6)), (.6, F('growl-hybrid', .6))],
}
for k in sys.argv[1:] or 'ABC':
    shots, a = [], 0
    for s in P[k]:
        prev, vos = -1, []
        for v, at in s['vo']:
            at = max(at, prev + .25); prev = at + dur.get(v, 2); vos.append((v, at))
        d = max([s['d']] + [at + dur.get(v, 2) + .35 for v, at in vos]); shots.append((s['id'], a, d, vos)); a += d
    T = a; cues = [{**c, 't': round(b + t, 3)} for sid, b, d, _ in shots for t, c in C.get(sid, [])]
    os.makedirs('/tmp/claude-0', exist_ok=True); json.dump(cues, open(f'/tmp/claude-0/var{k}.json', 'w'))
    subprocess.run(['python3', '../../tools/sfx.py', f'/tmp/claude-0/var{k}.json', '-o', f'/tmp/claude-0/var{k}-sfx.wav', '--duration', str(T)], check=True, capture_output=True)
    ins, fs = [], []
    for sid, b, d, vos in shots:
        for v, at in vos:
            i = len(ins) // 2; ins += ['-i', f'vo/ep2/{v}.wav']; ms = int((b + at) * 1000)
            fx = {'announcer': ',highpass=f=250,lowpass=f=6000,aecho=0.8:0.6:120|260:0.35|0.2', 'machinist': ''}.get(roles[v], '')
            fs.append(f'[{i}]aresample=48000,aformat=channel_layouts=mono{fx},aecho=0.7:0.5:20|40:0.22|0.13,acompressor=threshold=0.08:ratio=3:makeup=2,adelay={ms}|{ms}[v{i}]')
    n = len(fs); fc = ';'.join(fs) + ';' + ''.join(f'[v{i}]' for i in range(n)) + f'amix=inputs={n}:normalize=0,apad=whole_dur={T}[vo]'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', fc, '-map', '[vo]', '-ac', '2', '-ar', '48000', f'/tmp/claude-0/var{k}-vo.wav'], check=True)
    mus = 'remotion/public/audio/lib/horror-intense-magmi.mp3'
    fc = (f'[2]asplit=2[a][b];[0]atrim=0:{T},volume=0.25,afade=t=out:st={T - 1.5}:d=1.5[m];[m][a]sidechaincompress=threshold=0.015:ratio=12:attack=10:release=450[md];'
          f'[1]volume=0.55[s];[b]volume=3.2[v];[md][s][v]amix=inputs=3:normalize=0,alimiter=limit=0.95,atrim=0:{T}[out]')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', mus, '-i', f'/tmp/claude-0/var{k}-sfx.wav', '-i', f'/tmp/claude-0/var{k}-vo.wav', '-filter_complex', fc, '-map', '[out]', '-ar', '48000', f'remotion/public/var{k}-mix.wav'], check=True)
    print(k, round(T, 2), 'с')
