#!/usr/bin/env bash
# Создать новый проект ролика из шаблона:  bash tools/new-project.sh <имя-латиницей>
set -euo pipefail
name="${1:?Укажите имя проекта, например: bash tools/new-project.sh coffee-tips}"
root="$(cd "$(dirname "$0")/.." && pwd)"
dir="$root/projects/$name"
[ -e "$dir" ] && { echo "Проект уже существует: $dir"; exit 1; }
mkdir -p "$dir/assets" "$dir/src"
cp "$root/templates/short/scene.html" "$dir/src/scene.html"
cat > "$dir/brief.md" <<MD
# $name — ТЗ

(сюда дословно ТЗ пользователя и все уточнения)
MD
cat > "$dir/plan.md" <<MD
# $name — план

Формат: 1080×1920, 30 fps, ~__ с. Площадка: TikTok / Reels / Shorts.

## Сценарий и раскадровка
| # | Время | Кадр (что видно) | Текст на экране | Звук/голос | Ассет |
|---|-------|------------------|-----------------|------------|-------|

## Ассеты от пользователя
| # | Тип | Описание | Статус |
|---|-----|----------|--------|

## Подпись к посту и хештеги
MD
echo "Создан проект: projects/$name"
