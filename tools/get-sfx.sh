#!/usr/bin/env bash
# Скачать бесплатные библиотеки звуков в assets/sfx-library/ (в git не хранится) и собрать каталог.
#   bash tools/get-sfx.sh
# 1) wyzowl/sfx-kit — 320 звуков для видео и анимации, CC0 (без указания автора)
# 2) Meta Oculus Audio Pack — шаги, удары, мультяшные звуки, голоса; CC BY 4.0:
#    при публикации указать в описании «Sounds: Oculus Audio Pack by Meta (CC BY 4.0)»
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"; lib="$root/assets/sfx-library"; mkdir -p "$lib"
if [ ! -d "$lib/sfx-kit" ]; then git clone -q --depth 1 https://github.com/wyzowl/sfx-kit "$lib/sfx-kit"; fi
if [ ! -d "$lib/meta-open-sound" ]; then
  git clone -q --depth 1 --filter=blob:none --sparse https://github.com/facebookincubator/Meta-open-sound "$lib/meta-open-sound"
  (cd "$lib/meta-open-sound" && git sparse-checkout set corpora/oculus-audio-pack)
fi
python3 "$root/tools/sfx_index.py" "$lib"
