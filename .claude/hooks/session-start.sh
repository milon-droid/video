#!/bin/bash
# При старте чата: подтянуть знания и инструменты из других чатов (разрешено пользователем 2026-11-05).
# Работает без участия модели; в чат попадает одна короткая строка итога.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then exit 0; fi
bash "${CLAUDE_PROJECT_DIR:-.}/tools/sync-knowledge.sh" 2>/dev/null | grep -E "влито|конфликт|новых изменений" | head -5
exit 0
