#!/usr/bin/env bash
# Копирует движок серии (canvas-сцены из ../src) и шрифты в public/ — Remotion берёт их через staticFile().
set -euo pipefail; cd "$(dirname "$0")/.."; R=../../..
mkdir -p public/engine public/fonts
cp ../src/lib.js ../src/art.js ../src/art2.js ../src/ep1.js ../src/ep1-words.js ../src/ep1-mouth.js ../src/cover1.js public/engine/
cp $R/templates/components/anim-kit.js $R/templates/components/fx-kit.js public/engine/
cp $R/fonts/Montserrat-VF.ttf $R/fonts/JetBrainsMono-VF.ttf public/fonts/
[ -f ../out/ep1-mix.wav ] && cp ../out/ep1-mix.wav public/ep1-mix.wav || echo "нет ../out/ep1-mix.wav — сначала bash projects/blackout/build.sh 1"
