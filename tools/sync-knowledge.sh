#!/usr/bin/env bash
# Подтянуть знания и инструменты из других чатов (каждый чат пушит свою ветку claude/*).
#   bash tools/sync-knowledge.sh          — влить все ещё не влитые ветки claude/* в текущую
# Конфликты в knowledge/*.md решаются объединением (обе стороны остаются), в остальных файлах — слияние
# отменяется и ветка показывается для ручного разбора. После — перечитать knowledge/preferences.md и lessons.md.
set -uo pipefail
cd "$(dirname "$0")/.."
git fetch -q origin '+refs/heads/claude/*:refs/remotes/origin/claude/*' || { echo "нет сети — пропускаю"; exit 0; }  # явно все ветки чатов: в части контейнеров fetch по умолчанию видит только свою
git diff --quiet && git diff --cached --quiet || { echo "есть незакоммиченные изменения — сначала закоммитить"; exit 1; }
cur=$(git rev-parse --abbrev-ref HEAD); start=$(git rev-parse HEAD)
for b in $(git branch -r --format='%(refname:short)' | grep '^origin/claude/' | grep -v "origin/$cur$"); do
  if git merge-base --is-ancestor "$b" HEAD; then continue; fi
  echo "== $b: $(git log --oneline -1 "$b")"
  if git merge --no-edit "$b" >/dev/null 2>&1; then echo "   влито"; continue; fi
  bad=$(git diff --name-only --diff-filter=U | grep -v '^knowledge/.*\.md$' || true)
  if [ -n "$bad" ]; then git merge --abort; echo "   конфликт не в knowledge/: $bad — разобрать вручную"; continue; fi
  for f in $(git diff --name-only --diff-filter=U); do python3 - "$f" <<'PY'
import re, sys
p = sys.argv[1]; s = open(p, encoding='utf-8').read()
s = re.sub(r'<<<<<<< [^\n]*\n(.*?)=======\n(.*?)>>>>>>> [^\n]*\n', lambda m: m.group(1) + m.group(2), s, flags=re.S)
open(p, 'w', encoding='utf-8').write(s)
PY
    git add "$f"; done
  git commit -q --no-edit && echo "   влито (конфликты в knowledge/ объединены)"
done
[ "$(git rev-parse HEAD)" = "${start:-}" ] && echo "новых изменений из других чатов нет"
