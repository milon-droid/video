#!/bin/bash
# Сведение серии 1: музыка + шумы приглушаются под голос (sidechain), мастер −14 LUFS, лимитер с передискретизацией.
cd "$(dirname "$0")"
ffmpeg -v error -y -i music.wav -i sfx.wav -i ${VO:-vo.wav} -filter_complex "[0:a]volume=-3dB[m];[1:a]volume=0dB[s];[m][s]amix=inputs=2:normalize=0[bg];[2:a]asplit=2[v][vk];[bg][vk]sidechaincompress=threshold=0.03:ratio=6:attack=15:release=300:makeup=1[bgd];[v]volume=4dB[vv];[bgd][vv]amix=inputs=2:normalize=0:duration=longest,acompressor=threshold=-24dB:ratio=3:attack=5:release=180:makeup=4,loudnorm=I=-14:TP=-2.5:LRA=10,aresample=192000,alimiter=limit=0.7:attack=1:release=40:level=disabled,aresample=48000" -ar 48000 ${OUT:-mix.wav}
ffmpeg -i ${OUT:-mix.wav} -af ebur128=peak=true -f null - 2>&1 | grep -E "I:|Peak:" | tail -2
