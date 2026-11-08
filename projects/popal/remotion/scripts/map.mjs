// Карта кода проекта → ../MAP.md: экспортируемые компоненты с параметрами (чтобы не читать исходники целиком).
// Запуск: node scripts/map.mjs (после добавления персонажей/фонов/планов).
import fs from 'node:fs'; import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..'), out = [];
const files = ['src/chars/Person.tsx', 'src/chars/Cast.tsx', 'src/chars/Cast2.tsx', 'src/bg/Bg.tsx', 'src/bg/Bg2.tsx', 'src/ui/Ui.tsx', 'src/anim.ts', 'src/theme.ts', 'src/ep1/Shots.tsx', 'src/ep1/Shots3.tsx', 'src/ep2/ShotsA.tsx'];
out.push('# Карта кода «ПОПАЛ» (Remotion)\n\nСгенерировано `node remotion/scripts/map.mjs`. Читать вместо исходников; в файл лезть только за нужными строками (`grep -n`).\n');
out.push('Серия = модуль `src/epN/timeline.mjs` (SPEC планов: id, мин. длительность, реплики, звуки; CAP субтитры; statsAt табло) + планы `src/epN/Shots*.tsx` + `EpN.tsx` (MAP id → компонент) + композиции в `src/Root.tsx`.');
out.push('Конвейер серии: `vo/epN.json` → `tools/vo-qwen.py` → `scripts/post-vo-ep2.sh` (длительности, слова, рот) → `scripts/export-ep2.mjs` (sfx-epN.json) → `tools/sfx.py` → `public/epN-mix.wav` → `npx remotion render EpN-720` → `tools/master.py`.\n');
out.push('Координаты: кадр 1080×1920; фигуры — начало между ступнями; `s=1` ≈ рост 740 px; субтитры y≈1290 → лица выше 1100.\n');
for (const f of files) { const src = fs.readFileSync(path.join(root, f), 'utf8').split('\n'); const items = [];
  src.forEach((l, i) => { const m = l.match(/^export (?:const|function|type) (\w+)/); if (!m) return;
    const props = (l.match(/React\.FC<\{([^}]*)\}>/) || [])[1]; const prev = src[i - 1] && src[i - 1].startsWith('//') ? src[i - 1].replace(/^\/\/\s*/, '').replace(/─+/g, '').trim() : '';
    items.push(`- \`${m[1]}\`${props ? ` (${props.split(';').map(p => p.trim().split(':')[0]).filter(Boolean).join(', ')})` : ''}${prev ? ` — ${prev}` : ''} · стр. ${i + 1}`); });
  if (items.length) out.push(`## ${f}\n${items.join('\n')}\n`); }
out.push('## Облики Person (`look`)\nmax, courier, lira (эльфийка-лучница), elf2 (розовая), elf3 (серебряная), elf4 (рыжая). Позы `POSES`: stand, armsUp, shrug, holdUp, point, throwBack, throwFwd, heroic, cover, lotus, fall, lean, phone; `blendPose`, `runPose`, `walkPose` (ep1/Shots3). Предметы `hold`: pan, phone, burger, cola, doner, bow (+ `draw`). Ещё: `bowBack`, `hang`, `slap`, `kisses`, `blush`, `sweat`, `expr`.\n');
fs.writeFileSync(path.join(root, '..', 'MAP.md'), out.join('\n')); console.log('MAP.md', out.join('\n').length);
