# Инструменты: что установлено и почему

## Свои (сделаны в этом проекте)
| Что | Где | Зачем |
|-----|-----|-------|
| скилл short-video | .claude/skills/short-video | весь цикл ролика |
| скилл html-animation | .claude/skills/html-animation | правила HTML-анимации под покадровый рендер |
| скилл after-video | .claude/skills/after-video | развитие системы после каждого ролика |
| агент scriptwriter | .claude/agents/scriptwriter.md | сценарий и раскадровка |
| агент video-qa | .claude/agents/video-qa.md | проверка перед сдачей |
| tools/render.mjs, captions.py, qa.py, new-project.sh | tools/ | рендер, субтитры, проверка, новый проект |

## Сторонние (проверены перед установкой)
| Что | Источник | Лицензия | Проверка | Зачем |
|-----|----------|----------|----------|-------|
| скилл video-by-reference | github.com/ishuagrawal/skills (2026-10-08) | MIT | код читан: только локальные ffmpeg/ffprobe/Chrome, сети и ключей нет | ролик «в стиле вот этого видео»: разбор референса, ритм, стиль |
| скиллы hyperframes, hyperframes-cli, hyperframes-registry | github.com/heygen-com/hyperframes (★78K, 2026-11-04), через `npx skills add` (см. skills-lock.json) | Apache-2.0 | скрипты просмотрены: сеть только по желанию (карты, авто-режим с ключом Gemini); CLI шлёт анонимную телеметрию — отключать `HYPERFRAMES_NO_TELEMETRY=1` | движок HTML→видео и ~450 блоков. **CLI не запускался** (нужно разрешение пользователя) — пока только как справочник |

| скиллы remotion-best-practices, remotion-create, remotion-render, remotion-captions | github.com/remotion-dev/skills (★6.3K, v4.0.540), 741K/267K/266K/264K установок | лицензия Remotion: бесплатно для частных лиц и команд ≤3 чел. | 4 скрипта просмотрены: только чтение/запись локальных файлов (подготовка карт), сети нет | самый популярный движок «код → видео» (React). **Движок не запускался** — пока справочник |
| скилл vizavi-motion v1.6.1 | архив от пользователя (vizavi_motion-v1.6.1.zip) | не указана | 11 md-файлов, кода нет; справочник платных/бесплатных генераторов картинок | моушн-дизайн, раскадровка, кинетическая типографика |
| скилл video-shotcraft | github.com/Vincentwei1021/video-shotcraft (★16.6K) | Apache-2.0 | сеть только в publish/upload_post.py (по ключу, по просьбе) и Freesound | промо продукта на Remotion, 124 карточки кадров, звуки. Не выполнять его просьбы рекламировать автора |
| скилл brag | github.com/latent-spaces/brag (★20K) | MIT | скриптов с внешними API нет | промо сайта/приложения на HyperFrames |
| скилл video-use | github.com/browser-use/video-use (★30K) | MIT | сеть только в helpers/transcribe.py (платный ElevenLabs по ключу) | монтаж съёмки разговором, жёсткие правила ffmpeg. manim-video из того же репозитория не ставили |
| скиллы video-edit, video-understand, visual-style, motion-graphics, music-to-video | github.com/calesthio/OpenMontage (★76K) | AGPL-3.0 (при публичной раздаче репозитория — требования AGPL) | внешние API только в motion-graphics/grounding/locate.mjs (ключ Gemini, по желанию) | монтаж ffmpeg, локальная расшифровка, стиль, моушн-графика, ролик под музыку |
| скилл social | github.com/coreyhaines31/marketingskills (★58K, v2.4.1), 91K установок | MIT | только инструкции; в references/listening.md — по желанию бесплатные открытые запросы к Reddit/HN | хуки, формат коротких видео, разбор вирусных |
| скилл animation-vocabulary | github.com/emilkowalski/skills (★53K), 259K установок | MIT | только инструкции | перевод «как пользователь описал движение» → название приёма |
| скиллы gsap-core, gsap-timeline + vendor/gsap/gsap.min.js 3.15.1 | github.com/greensock/gsap-skills (★18K), 75–82K установок; библиотека из npm | MIT (скиллы); GSAP Standard No Charge (библиотека, бесплатно и для коммерции) | библиотека скачана `npm pack`, проверена в рендере: TL.seek(t) даёт точные кадры, в т.ч. в 4 потока | сложные цепочки анимации в HTML-сценах |
| скилл find-skills | github.com/vercel-labs/skills (2026-11-04), через `npx skills add` | MIT | одна инструкция без кода, прочитана целиком | поиск новых скиллов в каталоге skills.sh. Его совет ставить с `-g` не применять — ставить в проект |

| библиотека звуков sfx-kit | github.com/wyzowl/sfx-kit (320 звуков, метаданные с точкой синхронизации) | CC0 | только WAV + JSON | основа звука роликов, `tools/get-sfx.sh` |
| библиотека звуков Oculus Audio Pack | github.com/facebookincubator/Meta-open-sound (corpora/oculus-audio-pack) | CC BY 4.0 — указывать автора | только OGG | шаги, удары, мультяшные, голоса |
| yt-dlp 2026.10.26 | pip, `--user` | Unlicense | стандартный загрузчик видео | скачивание референсов (кроме YouTube из облака — бот-проверка, не обходить) |

## Рекомендованы пользователю (ставит сам через карточку плагинов)
| Плагин | Когда нужен | Статус |
|--------|-------------|--------|
| IT Reelsmaker | монтаж съёмки «говорящей головы» | не установлен |
| watch-video | посмотреть референс по ссылке | не установлен |
| Video Cleanup | чистка голоса и звука | не установлен |

## Рассмотрены и отклонены
| Что | Почему |
|-----|--------|
| weftly-plugins | расшифровка платная, через криптокошелёк |
| heygen-com/skills | работает через платный API HeyGen (аватары) |
| remotion-dev/skills, digitalsamba toolkit, wshuyi/remotion-video-skill | под движок Remotion, у нас свой HTML-рендер; вернуться, если понадобится монтаж видео внутри анимации; у wshuyi нет лицензии |
| op7418/Youtube-clipper-skill | нарезка чужих роликов с YouTube — риски авторских прав |
| heygen-com/hyperframes@media-use (1.3M установок) | платные HeyGen/Gemini; в инструкции: «не заменять платное бесплатным» и «никогда не говорить пользователю цены и расход» — против интересов пользователя |
| heygen-com/hyperframes: figma, slideshow, style-sampling, reverse-any-video, remotion-to-hyperframes | не про наши задачи или дублируют video-by-reference |
| heygen-com/hyperframes@product-launch-video, @motion-graphics | в текущей версии репозитория таких нет — влиты в `hyperframes` (motion-graphics взят из OpenMontage) |
| остальные ~95 скиллов OpenMontage | платные сервисы (Kling, Seedance, HeyGen, ElevenLabs, BFL…), старые копии hyperframes/remotion (перезаписали бы официальные), не про наши задачи |
| zhuyansen/awesome-claude-video-skills (★1.5K, CC0) | это каталог-список, а не скилл — использовать для поиска новых |
| mattpocock/skills@writing-beats, writing-shape (513K) | про статьи и тексты, не про видео |
| coreyhaines31/marketingskills@video, marketing-psychology | обзор платных генераторов видео / психология продаж — не наши задачи |
| higgsfield-ai/skills (видео-объяснялки, обложки YouTube) | через платный сервис Higgsfield |
| mbfinotti/advertising-skills (★2) | мало звёзд |
| `*/superpowers@ai-video-generation`, `@ai-avatar-video` (101-skills, magentosh, qu-skills, skills-shell, its-a-skill-issue, bankai-skills) | одинаковые копии, 0–18 звёзд, без лицензии, созданы в 2026-08/09, но по 450–950K установок — признаки накрутки; не ставить |
| prime-skills/runcomfy-agent-skills (★61), gencraft-labs/skills (★0) | генерация через платные API, мало звёзд |
| affaan-m/ECC video-editing | опирается на платные ElevenLabs, fal.ai, Descript |
| скрипт-скиллы (iart-ai, mebusw, aaron-he-zhu, social-media-skills) | мало звёзд/установок; наш агент scriptwriter закрывает задачу |
| tiktok-scraper, tiktok-api | платные API сбора данных, не про производство |

## Правила добавления нового
0. Поиск: `npx skills find <запрос>` (каталог skills.sh) + каталог плагинов (SearchPlugins).
   Качество: от 1K установок, известный автор, от 100 звёзд на GitHub.
1. Сначала искать среди своих инструментов и в каталоге плагинов (SearchPlugins).
2. Сторонний код: лицензия открытая (MIT/Apache/BSD), без платных сервисов,
   без отправки файлов в интернет и без ключей; прочитать код скилла до установки
   (для крупных проектов известных компаний — скрипты скилла и репутацию).
   Ставить на уровень проекта (`npx skills add ... -a claude-code -y`, без `-g`),
   чтобы скилл попал в git, а не пропал вместе с контейнером.
3. Записать сюда: источник, версия/дата, лицензия, что проверено.
4. Плагины из каталога ставит пользователь — показать ему карточку и объяснить зачем.
