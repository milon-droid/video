#!/usr/bin/env bash
# Копирует в public/ то, что Remotion берёт через staticFile(): шрифты, голоса, готовый микс (собирается tools/sfx.py).
set -euo pipefail; cd "$(dirname "$0")/.."; R=../../..
mkdir -p public/fonts public/vo
cp $R/fonts/Montserrat-VF.ttf $R/fonts/JetBrainsMono-VF.ttf public/fonts/
cp ../assets/vo/ep1/*.wav public/vo/ 2>/dev/null || true
[ -f ../out/ep1-mix.wav ] && cp ../out/ep1-mix.wav public/ep1-mix.wav || echo "нет ../out/ep1-mix.wav — node scripts/export-ep1.mjs и tools/sfx.py"
# серия 1 v4: картинки пользователя и нарезка героев (tools/cut4.py)
mkdir -p public/v4/bg && cp ../assets/ep1v4/*.jpg ../assets/ep1v4/*.png public/v4/bg/
[ -f public/v4/alik/head.png ] || python3 ../tools/cut4.py
