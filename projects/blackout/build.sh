#!/usr/bin/env bash
# Сборка серий «Блэкаута»: выгрузка раскадровки/субтитров/звука → микс → рендер → мастер → проверка.
#   bash projects/blackout/build.sh 1 2 3   [SCALE=0.6667 — 720p черновик; SCALE=1 CRF=18 — финал 1080×1920]
set -euo pipefail
cd "$(dirname "$0")/../.."; P=projects/blackout; SCALE=${SCALE:-0.6667}; CRF=${CRF:-20}
EXP=$P/tools-export.cjs
[ -f $P/assets/drone.wav ] || { python3 tools/music.py -o $P/assets/drone.wav --duration 84 --style dark --seed 3; ffmpeg -v error -y -i $P/assets/drone.wav -af "lowpass=f=320,volume=0.8" $P/assets/drone-muffled.wav; }
for n in "$@"; do
  node $EXP $P/src/ep$n.html $P $n
  D=$(python3 -c "import json;print(json.load(open('$P/storyboard/ep$n.json'))['duration'])")
  python3 tools/sfx.py $P/sfx-ep$n.json -o $P/out/ep$n-mix.wav --duration $D >/dev/null
  node tools/render.mjs $P/src/ep$n.html --scale $SCALE --crf $CRF -o $P/out/raw$n.mp4 2>&1 | tr '\r' '\n' | grep -E "Готово|rror" | head -2
  tag=$([ "$SCALE" = "1" ] && echo "1080" || echo "draft-720"); out=$P/out/ep$n-$tag.mp4; [ "$SCALE" = "1" ] && out=$P/out/ep$n.mp4
  python3 tools/master.py $P/out/raw$n.mp4 $out --duration $D --audio $P/out/ep$n-mix.wav
  python3 tools/qa.py $out --frames 12 --step 2 --caption-zone 1150-1400 | grep -E "Длит|Аудио|ВНИМАНИЕ|ОШИБКА" | grep -v разрешение || true
done
