---
name: html-animation
description: Как писать HTML/CSS/JS-сцены для покадрового рендера в видео через tools/render.mjs — кинетическая типографика, титры, плашки, инфографика, наезд камеры по фото, переходы. Использовать перед созданием или правкой любого scene.html / overlay.html в projects/.
---

# HTML-сцены для видео

`tools/render.mjs` открывает сцену в Chromium, для каждого кадра перематывает
время на `t` и делает скриншот. Поэтому сцена обязана быть **детерминированной**:
кадр зависит только от `t`.

## Контракт сцены
```html
<script>
  window.SCENE = { duration: 8, fps: 30, width: 1080, height: 1920 };
  window.renderFrame = (t) => { /* выставить состояние на момент t (сек) */ };
  // необязательно: window.READY = Promise — рендер подождёт (например, загрузку данных)
</script>
```
- CSS-анимации (`animation: ... <delay> both`) и Web Animations API
  перематываются **автоматически**: время сцены = `animation-delay` + прогресс.
  Это основной способ: задавать момент появления через `animation-delay`.
- Всегда `animation-fill-mode: both` — иначе до старта элемент виден в конечном
  состоянии, а после конца прыгает обратно.
- `renderFrame(t)` — для того, что считается формулой: счётчики, прогресс-бары,
  графики, пути по кривой, синхронизация с таймкодами.

## Запрещено (ломает покадровый рендер)
- `Date.now()`, `performance.now()`, `setTimeout`, `setInterval`,
  `requestAnimationFrame`-циклы, CSS `transition` (не перематываются).
- `Math.random()` без зерна — использовать свой генератор с фиксированным seed.
- `<video>`, `<audio>`, GIF — видео склеивать ffmpeg, а сцену накладывать через `--alpha`.
- Шрифты и картинки из интернета — только локальные файлы (`../assets/...`).
  Шрифт `Inter` (400–900, кириллица) подключается рендером автоматически.

## Раскладка 1080×1920
- Холст: `html, body { width:1080px; height:1920px; overflow:hidden }`.
- Безопасная зона для текста и важного: **x 60–920, y 220–1500** (класс `.safe`
  в шаблоне). Фон и картинки могут выходить за неё.
- Проверка: `--safe` рисует зоны интерфейса поверх кадра.
- Кегль: заголовки 96–140 px (900), подписи 56–80 px (700–800), минимум 48 px.
- Контраст: светлый текст на тёмном или обводка `-webkit-text-stroke`/`text-shadow`,
  либо плашка под текстом.

## Готовые приёмы
```css
/* появление «с пружиной» */
@keyframes pop { from { transform: scale(.3); opacity:0 } to { transform: scale(1); opacity:1 } }
.x { animation: pop .45s cubic-bezier(.2,1.6,.4,1) 1.2s both; }

/* слова по очереди: задать каждому span свой animation-delay (шаг 0.2–0.3 с) */

/* наезд камеры по фото */
@keyframes kenburns { from { transform: scale(1) } to { transform: scale(1.15) translate(-2%,-3%) } }
img.bg { animation: kenburns 4s linear 0s both; object-fit: cover; }

/* выезд снизу */
@keyframes rise { from { transform: translateY(60px); opacity:0 } to { transform:none; opacity:1 } }

/* выделение маркером */
@keyframes mark { from { background-size: 0% 100% } to { background-size: 100% 100% } }
.hl { background: linear-gradient(#ffe600,#ffe600) no-repeat; animation: mark .4s ease-out 2s both; }

/* тряска для акцента */
@keyframes shake { 0%,100%{transform:none} 20%{transform:translateX(-12px) rotate(-1deg)} 40%{transform:translateX(10px)} 60%{transform:translateX(-6px)} 80%{transform:translateX(4px)} }
```
```js
// счётчик 0 → 1000 за 1.5 с, начиная с 2 с
const ease = (x) => 1 - Math.pow(1 - x, 3);
const clamp = (x) => Math.max(0, Math.min(1, x));
window.renderFrame = (t) => {
  el.textContent = Math.round(1000 * ease(clamp((t - 2) / 1.5))).toLocaleString('ru-RU');
};
```

## Рабочий цикл
1. Скопировать/дописать сцену (шаблон: `templates/short/scene.html`).
2. Проверить ключевые моменты кадрами — быстро и дёшево:
   `node tools/render.mjs <scene> --still 0.5`, затем `--still 3` и т.д., смотреть PNG через Read.
3. Черновик: `--draft --safe` (половинное разрешение, ~4× быстрее).
4. Финал: без флагов (или `--alpha` для наложения), затем `python3 tools/qa.py`.

Скорость (4 параллельных браузера): ≈ 6–7 кадров/с в полном разрешении —
30-секундный ролик ≈ 2–3 минуты; черновик быстрее. Для правок рендерить
отрезок: `--from 4 --to 7`. Долгий рендер запускать в фоне (run_in_background).
