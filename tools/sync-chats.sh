#!/bin/bash
# Свести работу других чатов в текущую ветку: знания, инструменты, шаблоны, проекты.
# Каждый чат пушит свою ветку claude/*; здесь все они подтягиваются и вливаются (git merge).
#   bash tools/sync-chats.sh   — в начале каждого чата и перед каждым новым ТЗ (правило в CLAUDE.md)
# Журналы знаний (knowledge/*.md) сливаются без конфликтов (.gitattributes: merge=union).
# Если в коде конфликт — слияние этой ветки отменяется и печатается, что свести вручную.
cd "$(dirname "$0")/.." || exit 0
git rev-parse --git-dir >/dev/null 2>&1 || exit 0
cur=$(git rev-parse --abbrev-ref HEAD)
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then echo "sync-chats: есть незакоммиченные правки — сначала закоммитить, потом запустить снова"; exit 0; fi
git fetch -q origin '+refs/heads/claude/*:refs/remotes/origin/claude/*' 2>/dev/null || { echo "sync-chats: нет связи с GitHub — свод пропущен"; exit 0; }
merged=(); skipped=()
for br in $(git for-each-ref --sort=committerdate --format='%(refname:short)' refs/remotes/origin/claude/); do
  [ "$br" = "origin/$cur" ] && continue
  git merge-base --is-ancestor "$br" HEAD 2>/dev/null && continue   # уже сведено
  if git merge -q --no-edit -m "Свод из другого чата: ${br#origin/}" "$br" >/dev/null 2>&1; then merged+=("${br#origin/}")
  else git merge --abort 2>/dev/null; skipped+=("${br#origin/}"); fi
done
[ ${#merged[@]} -gt 0 ] && echo "sync-chats: сведены изменения из других чатов: ${merged[*]} — перечитать knowledge/preferences.md и lessons.md, запушить ветку"
[ ${#skipped[@]} -gt 0 ] && echo "sync-chats: КОНФЛИКТ при своде ${skipped[*]} — свести вручную: git merge origin/<ветка>, разрешить, закоммитить"
[ ${#merged[@]} -eq 0 ] && [ ${#skipped[@]} -eq 0 ] && echo "sync-chats: новых изменений из других чатов нет"
exit 0
