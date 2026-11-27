#!/usr/bin/env bash
# Установка озвучки одной командой (идемпотентно: что уже стоит — пропускается).
#   bash tools/setup-voice.sh            — Qwen3-TTS (рус. с ударениями + VoiceDesign + Base для клона) и ESpeech
#   bash tools/setup-voice.sh qwen       — только Qwen;   bash tools/setup-voice.sh espeech — только ESpeech
# Подходит и для скрипта подготовки облака (запускать из папки репозитория).
set -euo pipefail
cd "$(dirname "$0")/.."
what="${1:-all}"
TORCH=(pip install -q "torch==2.11.0+cpu" "torchaudio==2.11.0+cpu" --index-url https://download.pytorch.org/whl/cpu)
dl() { [ -d "$2" ] && [ -n "$(ls -A "$2" 2>/dev/null)" ] && return 0; "$HF" download "$1" --local-dir "$2" "${@:3}" >/dev/null; }

# Словарь ударений Vosk (нужен Qwen-русской)
if [ ! -d assets/voices/vosk-model-tts-ru-0.10-multi ]; then
  curl -sSL -o /tmp/vosk.zip https://alphacephei.com/vosk/models/vosk-model-tts-ru-0.10-multi.zip
  python3 -c "import zipfile;zipfile.ZipFile('/tmp/vosk.zip').extractall('assets/voices')" && rm /tmp/vosk.zip
fi

if [ "$what" = all ] || [ "$what" = qwen ]; then
  V=~/.venvs/qwentts
  [ -x $V/bin/python ] || { python3 -m venv $V; $V/bin/"${TORCH[@]}"; $V/bin/pip install -q qwen-tts soundfile "huggingface_hub[cli]"; }
  HF=$V/bin/hf
  dl Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign ~/models/vd
  dl Qwen/Qwen3-TTS-12Hz-1.7B-Base ~/models/base
  dl siriusfreak/qwen3-tts-12hz-1.7b-ru-stress-cf ~/models/rus --exclude "lora/*" "scripts/*" "eval/*"
  echo "qwen: ок"
fi

if [ "$what" = all ] || [ "$what" = espeech ]; then
  V=~/.venvs/espeech
  [ -x $V/bin/python ] || { python3 -m venv $V; $V/bin/"${TORCH[@]}"; $V/bin/pip install -q f5-tts ruaccent soundfile "huggingface_hub[cli]"; $V/bin/pip install -q "transformers<5" "datasets<4"; }
  HF=$V/bin/hf
  dl ESpeech/ESpeech-TTS-1_RL-V2 ~/models/espeech-rlv2
  echo "espeech: ок"
fi
