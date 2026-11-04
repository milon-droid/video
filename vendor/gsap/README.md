# GSAP 3.15.1

`gsap.min.js` из npm-пакета `gsap@3.15.1`. Лицензия: GSAP Standard "No Charge"
License (https://gsap.com/standard-license) — бесплатно, в том числе для
коммерческих проектов. Скиллы: `gsap-core`, `gsap-timeline`.

Подключение в сцене `projects/<проект>/src/scene.html`:
```html
<script src="../../../vendor/gsap/gsap.min.js"></script>
<script>
  const TL = gsap.timeline({ paused: true });
  TL.from('.title', { y: 80, opacity: 0, duration: .5, ease: 'back.out(2)' }, 0.2);
  window.TL = TL;   // tools/render.mjs перематывает TL.seek(t) на каждом кадре
</script>
```
