#!/usr/bin/env bash
# Установка озвучки одной командой (идемпотентно: что уже стоит — пропускается).
#   bash tools/setup-voice.sh            — Qwen3-TTS (рус. с ударениями + VoiceDesign + Base для клона)
#   bash tools/setup-voice.sh kokoro / cosy — Kokoro (быстро, готовые голоса) / CosyVoice 3 (копия голоса)
#   (ESpeech удалён 2026-11-27 — пользователь отклонил дважды)
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


# Kokoro (2026-11-27): ru — zaakirio/kokoro-ru (OpenRAIL), en — hexgrad/Kokoro-82M (Apache). Python 3.11 (spacy не собирается на 3.13)
if [ "$what" = all ] || [ "$what" = kokoro ]; then
  V=~/.venvs/kokoro
  [ -x $V/bin/python ] || { uv venv -q -p 3.11 $V; VIRTUAL_ENV=$V uv pip install -q torch --index-url https://download.pytorch.org/whl/cpu;
    VIRTUAL_ENV=$V uv pip install -q kokoro soundfile huggingface_hub ruaccent faster-whisper librosa https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-3.8.0/en_core_web_sm-3.8.0-py3-none-any.whl; }
  [ -f ~/models/kokoro-ru/kokoro-ru-v2-dima.pth ] || $V/bin/python -c "from huggingface_hub import snapshot_download as s; s('zaakirio/kokoro-ru', local_dir='$HOME/models/kokoro-ru', allow_patterns=['*.py','*.json','*.pth','voices/*','espeak-data/*'])"
  echo "kokoro: ок"
fi

# CosyVoice 3 (2026-11-27): Apache 2.0 (в лицензии есть оговорка — проверить перед заработком). torch 2.3.1 cpu + openai-whisper
if [ "$what" = all ] || [ "$what" = cosy ]; then
  V=~/.venvs/cosy
  [ -d ~/models/cosyvoice ] || git clone -q --recursive https://github.com/FunAudioLLM/CosyVoice.git ~/models/cosyvoice
  [ -x $V/bin/python ] || { uv venv -q -p 3.11 $V; VIRTUAL_ENV=$V uv pip install -q torch==2.3.1 torchaudio==2.3.1 --index-url https://download.pytorch.org/whl/cpu;
    grep -v -E '^\s*--|torch|onnxruntime-gpu|tensorrt|deepspeed|openai-whisper' ~/models/cosyvoice/requirements.txt > /tmp/cosyreq.txt;
    VIRTUAL_ENV=$V uv pip install -q -r /tmp/cosyreq.txt onnxruntime huggingface_hub openai-whisper; }
  [ -f ~/models/cosyvoice3-0.5b/llm.pt ] || $V/bin/python -c "from huggingface_hub import snapshot_download as s; s('FunAudioLLM/Fun-CosyVoice3-0.5B-2512', local_dir='$HOME/models/cosyvoice3-0.5b')"
  echo "cosy: ок"
fi
