#!/bin/bash
# Сведение серии 2 (EP2_PART=main|A|B|C): музыка + шумы приглушаются под голос, −14 LUFS, лимитер с передискретизацией.
cd "$(dirname "$0")"; P=${EP2_PART:-main}; S=$([ "$P" = main ] && printf "" || printf -- "-%s" "$P")
D=$(EP2_PART=$P python3 -c "from timing import load;print(round(load()['total'],3))")
EP2_PART=$P python3 score2.py music2$S.wav >/dev/null && EP2_PART=$P python3 build_sfx2.py >/dev/null && python3 /home/user/video/tools/sfx.py sfx2$S.json -o sfx2$S.wav --duration $D >/dev/null && EP2_PART=$P python3 build_vo2.py
ffmpeg -v error -y -i music2$S.wav -i sfx2$S.wav -i vo2$S.wav -filter_complex "[0:a]volume=-3dB[m];[1:a]volume=0dB[s];[m][s]amix=inputs=2:normalize=0[bg];[2:a]asplit=2[v][vk];[bg][vk]sidechaincompress=threshold=0.03:ratio=6:attack=15:release=300:makeup=1[bgd];[v]volume=4dB[vv];[bgd][vv]amix=inputs=2:normalize=0:duration=longest,acompressor=threshold=-24dB:ratio=3:attack=5:release=180:makeup=4,loudnorm=I=-14:TP=-2.5:LRA=10,aresample=192000,alimiter=limit=0.7:attack=1:release=40:level=disabled,aresample=48000" -ar 48000 mix2$S.wav
ffmpeg -i mix2$S.wav -af ebur128=peak=true -f null - 2>&1 | grep -E "I:|Peak:" | tail -2
