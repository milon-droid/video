#!/usr/bin/env bash
# Сборка серий «ҚУАТ»: выгрузка раскадровки/субтитров/звука → микс → рендер → мастер → проверка.
#   bash projects/kuat/build.sh 1   [SCALE=0.6667 — 720p черновик; SCALE=1 CRF=18 — финал 1080×1920]
set -euo pipefail
cd "$(dirname "$0")/../.."; P=projects/kuat; SCALE=${SCALE:-0.6667}; CRF=${CRF:-20}
for n in "$@"; do
  python3 -c "import json;d=json.load(open('$P/vo/ep$n-words.json'));open('$P/src/ep$n-words.js','w').write('window.VO_WORDS = '+json.dumps(d,indent=1)+';\n')"
  node $P/tools-export.cjs $P/src/ep$n.html $P $n
  D=$(python3 -c "import json;print(json.load(open('$P/storyboard/ep$n.json'))['duration'])")
  python3 tools/sfx.py $P/sfx-ep$n.json -o $P/out/ep$n-mix.wav --duration $D >/dev/null
  node tools/render.mjs $P/src/ep$n.html --scale $SCALE --crf $CRF -o $P/out/raw$n.mp4 2>&1 | tr '\r' '\n' | grep -E "Готово|rror" | head -2
  out=$P/out/ep$n-draft-720.mp4; [ "$SCALE" = "1" ] && out=$P/out/ep$n.mp4
  python3 tools/master.py $P/out/raw$n.mp4 $out --duration $D --audio $P/out/ep$n-mix.wav
  python3 tools/qa.py $out --frames 12 --step 2 --caption-zone 1150-1400 | grep -E "Длит|Аудио|LUFS|ВНИМАНИЕ|ОШИБКА" | grep -v разрешение || true
done
