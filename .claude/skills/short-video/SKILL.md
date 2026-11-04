---
name: short-video
description: Полный цикл производства короткого вертикального видео для TikTok, Instagram Reels и YouTube Shorts — от ТЗ до готового MP4 1080×1920. Использовать всякий раз, когда пользователь присылает ТЗ на ролик, просит сделать/смонтировать/переделать короткое видео, добавить субтитры, звук, проверить ролик перед публикацией.
---

# Производство короткого видео

Инструменты лежат в `tools/`, шаблон — в `templates/short/`. Все команды — из корня репозитория.

## 0. Перед началом
Прочитать `knowledge/preferences.md`, `knowledge/lessons.md` и список
`templates/components/README.md` — учесть вкусы пользователя и готовые куски.
Если пользователь прислал референс-видео «сделай так же» — подключить скилл
`video-by-reference` для разбора стиля и ритма.

## 1. Старт проекта
```bash
bash tools/new-project.sh <имя-латиницей>
```
Сохранить ТЗ пользователя дословно в `projects/<имя>/brief.md`.

Уточнять только то, без чего нельзя начать: площадка, длительность, есть ли
голос/съёмка пользователя, стиль. Остальное — разумные значения по умолчанию.

## 2. Сценарий и раскадровка
Для сценария можно вызвать агента **scriptwriter** (передать ему путь к brief.md).
Результат — `projects/<имя>/plan.md`: таблица сцен с таймингом и список ассетов.

Правила формата (проверять каждый план):
- **Хук в первые 1–2 с**: крупный текст + движение с первого кадра. Без логотипов,
  приветствий и «медленного старта».
- Смена кадра/визуального события каждые **1.5–3 с**.
- Длительность: 15–35 с для развлекательных, до 60 с для обучающих.
- Текст на экране: до ~7 слов за раз, кегль ≥ 64 px, контрастная обводка/плашка.
- В конце — призыв (сохрани/подпишись/коммент) или зацикливание на начало.
- Ролик должен быть понятен **без звука** (субтитры обязательны, если есть речь).

## 3. Ассеты от пользователя
Всё, что требует качества (фото, иллюстрации, персонажи, фоны, сложная анимация,
голос, музыка) — запросить у пользователя **одним списком** по шаблону из
`CLAUDE.md`, сохранить запрос в `assets/requests/`. Пока ждём — собирать
остальное с плашками `ASSET #NN`.

Полученные файлы → `projects/<имя>/assets/`. Проверить размер/формат:
```bash
ffprobe -v error -show_entries stream=width,height,codec_name,duration -of compact <файл>
```
Изображения для полного кадра — не меньше 1080×1920; для вставок — с запасом ×1.2
под наезд камеры.

## 4. Анимация и сборка
- Графику, текст и простую анимацию делать в HTML-сцене
  (`projects/<имя>/src/scene.html`, скилл **html-animation**) и рендерить:
  ```bash
  node tools/render.mjs projects/<имя>/src/scene.html --draft --safe   # черновик с зонами UI
  node tools/render.mjs projects/<имя>/src/scene.html --still 1.5      # один кадр — быстро посмотреть
  node tools/render.mjs projects/<имя>/src/scene.html --audio projects/<имя>/assets/music.mp3  # финал
  ```
  Длинный ролик — несколькими сценами (scene1.html, scene2.html…) и склейка.
- Видео пользователя (съёмка, сложная анимация) **режется и склеивается в ffmpeg**.
  В HTML-сцену видео не вставлять: `<video>` не перематывается покадрово.
- Графика поверх видео пользователя (титры, плашки, стрелки, счётчики): сцена
  с прозрачным фоном (`body { background: transparent }`), рендер с `--alpha`
  → `.mov` с альфа-каналом, затем наложение:
  ```bash
  node tools/render.mjs projects/<имя>/src/overlay.html --alpha
  ffmpeg -i footage.mp4 -i projects/<имя>/render/overlay.mov -filter_complex "[0][1]overlay=0:0:eof_action=pass" -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a copy out.mp4
  ```

Частые команды ffmpeg:
```bash
# привести любое видео к 1080×1920 (заполнить кадр с обрезкой)
ffmpeg -i in.mp4 -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30" -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac out.mp4
# горизонтальное видео на размытом фоне
ffmpeg -i in.mp4 -filter_complex "[0]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=30[bg];[0]scale=1080:-2[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2" -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac out.mp4
# вырезать кусок
ffmpeg -ss 3.2 -to 7.8 -i in.mp4 -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac cut.mp4
# склеить куски одинакового формата
printf "file '%s'\n" a.mp4 b.mp4 c.mp4 > list.txt && ffmpeg -f concat -safe 0 -i list.txt -c copy joined.mp4
# склеить с переходом (fade 0.3 с; offset = длительность первого − 0.3)
ffmpeg -i a.mp4 -i b.mp4 -filter_complex "[0][1]xfade=transition=fade:duration=0.3:offset=4.7;[0:a][1:a]acrossfade=d=0.3" -c:v libx264 -crf 18 -pix_fmt yuv420p out.mp4
# музыка под голос: приглушить музыку до −18 дБ
ffmpeg -i video.mp4 -i music.mp3 -filter_complex "[1:a]volume=-18dB[m];[0:a][m]amix=inputs=2:duration=first[a]" -map 0:v -map "[a]" -c:v copy -c:a aac out.mp4
# нормализация громкости под соцсети (−14 LUFS)
ffmpeg -i in.mp4 -af loudnorm=I=-14:TP=-1:LRA=11 -c:v copy -c:a aac -b:a 192k out.mp4
```

## 5. Субтитры
Разметить текст с таймингом и сгенерировать стиль «TikTok»:
```bash
python3 tools/captions.py projects/<имя>/subs.txt --karaoke --upper
ffmpeg -i in.mp4 -vf "subtitles=projects/<имя>/subs.ass:fontsdir=fonts" -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a copy out.mp4
```
Формат `subs.txt`: `0:01.2 - 0:02.8 | текст`. Тайминг речи брать из сценария
или со слов пользователя; автоматическое распознавание речи можно попробовать
(`pip install faster-whisper`), но модель качается из интернета и может быть
недоступна — тогда попросить пользователя текст и примерные тайминги.

## 6. Проверка и сдача
1. `python3 tools/qa.py projects/<имя>/render/<файл>.mp4` — технический отчёт и
   контактный лист с зонами UI. Посмотреть лист (Read картинки).
   Для тщательной проверки — агент **video-qa**.
2. Черновик показать пользователю, после правок — финальный рендер без `--draft`
   и `--safe`, нормализация громкости, повторный `qa.py`.
3. Отправить файл пользователю (SendUserFile) и написать в `plan.md` подпись к
   посту + 3–5 хештегов.
4. Закоммитить исходники (сцены, plan.md, subs.txt). Рендеры в git не идут.
5. Когда пользователь принял ролик — скилл **after-video**.

## Технические требования (итог)
1080×1920, 9:16 · 30 fps · H.264 yuv420p · AAC 192k 44.1/48 кГц · −14 LUFS, пик ≤ −1 dBFS ·
MP4 с `+faststart` · текст и важное — внутри x 60–920, y 220–1500 (ориентировочно,
у площадок интерфейс немного отличается).
