// anim-kit.js — «оживляж» для canvas-сцен (плоский вектор). Подключать после lib.js проекта: нужен глобальный ctx.
// Появился после ретро 2026-11-05 (Заказ из дома, Счётчик 1–5, Тыныс 1): персонажи стояли куклами, колёса не крутились,
// дым был плоскими кружками, удары без отдачи, все склейки одинаковые.
//
//   AK.blink(t, seed)            → 0..1 открытость глаз (моргание раз в 2,5–5 с, 0,14 с), умножать на высоту глаза
//   AK.breathe(t, seed, amp)     → смещение по y (дыхание в покое), amp ≈ 3–6 px
//   AK.mouth(t, env, t0)         → 0..1 открытость рта по огибающей голоса (tools/mouth.py), t0 — когда начинается реплика
//   AK.puff(x, y, r, rgb, a)     → мягкий клуб дыма/пыли/тумана (радиальный градиент, без жёсткого края)
//   AK.smoke(x, y, t, o)         → столб дыма из мягких клубов разного размера, клубы растут и расходятся (без повторяющегося рисунка)
//   AK.dust(t, t0, x, y, o)      → облако пыли от удара: вспухает, оседает, редеет
//   AK.wheel(x, y, r, t, speed)  → колесо со спицами/дисками, которое крутится (speed — px/с хода машины)
//   AK.impact(t, t0, o)          → { sx, sy, dx, dy, hold } — сплющивание/растяжение, тряска, «стоп-кадр» на 2 кадра в момент удара
//   AK.drop(k, bounces)          → 0..1 → падение с отскоками (для предметов после выдоха, тюбетейки, телефона)
//   AK.anticip(k, a)             → 0..1 → с замахом назад (подготовка движения), a ≈ .15
//   AK.overshoot(k)              → 0..1 → с перелётом и возвратом (появления, остановки)
//   AK.cut(t, a, kind)           → переход в начале плана: 'dip' (затемнение), 'flash' (белая вспышка 2 кадра), 'whip' (смаз-панорама), 'none'
//   AK.handheld(t, amp, seed)    → [dx, dy, rot] — лёгкая «ручная камера» для тревожных планов
//   AK.limb(x, y, a1, a2, l1, l2, w, col, ol) → рука/нога из двух частей с локтем/коленом (a1 — плечо от вертикали вниз, a2 — сгиб); вместо прямых палок
//   AK.reach(x, y, tx, ty, l1, l2, flip) → [a1, a2] — углы, чтобы кисть дотянулась до точки (обратная кинематика на 2 звена)
'use strict';
const AK = (() => {
  const cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  const noise1 = x => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return hash(i) * (1 - u) + hash(i + 1) * u; }; // гладкий шум 0..1
  function blink(t, seed = 1) { const per = 2.5 + hash(seed) * 2.5, ph = ((t + hash(seed + 7) * per) % per); const d = .14; if (ph > d) return 1; const k = ph / d; return Math.abs(1 - 2 * k) ** .7; }
  const breathe = (t, seed = 1, amp = 4) => Math.sin(t * (1.6 + hash(seed) * .4) * Math.PI / 2) * amp;
  function mouth(t, env, t0 = 0) { if (!env || !env.v) return 0; const i = Math.floor((t - t0) * env.fps); if (i < 0 || i >= env.v.length) return 0; return cl(env.v[i]); }
  function puff(x, y, r, rgb = '70,60,60', a = .4) { if (r <= 0 || a <= 0) return; const g = ctx.createRadialGradient(x, y, r * .15, x, y, r); g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(.55, `rgba(${rgb},${a * .55})`); g.addColorStop(1, `rgba(${rgb},0)`); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }
  function smoke(x, y, t, { k = 1, rgb = '60,50,52', h = 900, n = 22, wind = 40, size = 1, seed = 3 } = {}) {
    for (let i = 0; i < n; i++) { const life = 4 + hash(seed + i) * 3, ph = ((t + hash(seed * 9 + i) * life) % life) / life, yy = y - ph * h, sw = (noise1(i * 3.1 + t * .4) - .5) * 160 * ph;
      puff(x + sw + wind * ph * ph * 3, yy, (50 + ph * 230 * (0.6 + hash(i + seed) * .8)) * size, rgb, .42 * k * Math.sin(Math.min(1, ph * 6) * Math.PI / 2) * (1 - ph) ** 1.3); } }
  function dust(t, t0, x, y, { w = 1, rgb = '201,150,80', n = 16, seed = 5 } = {}) { if (t < t0) return; const dt = t - t0, k = 1 - Math.exp(-dt * 2.2), fade = Math.exp(-dt * .55);
    for (let i = 0; i < n; i++) { const a = Math.PI * (.05 + .9 * hash(seed + i)), d = k * (160 + hash(i * 3 + seed) * 380) * w, side = i % 2 ? 1 : -1;
      puff(x + Math.cos(a) * d * 1.5 * side, y - Math.sin(a) * d * .45 - dt * 25 * hash(i), (70 + k * 160 * (0.6 + hash(i + 9))) * w, rgb, .55 * fade); } }
  function wheel(x, y, r, t, speed = 600, { tire = '#16161c', rim = '#8a8fa3', ol = '#0B1A2A' } = {}) { const ang = t * speed / r; ctx.save(); ctx.translate(x, y);
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fillStyle = tire; ctx.fill(); ctx.lineWidth = Math.max(3, r * .1); ctx.strokeStyle = ol; ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, r * .5, 0, Math.PI * 2); ctx.fillStyle = rim; ctx.fill(); ctx.lineWidth = Math.max(2, r * .06); ctx.stroke(); ctx.rotate(ang);
    ctx.fillStyle = ol; for (let i = 0; i < 5; i++) { ctx.rotate(Math.PI * 2 / 5); ctx.beginPath(); ctx.arc(r * .3, 0, r * .07, 0, Math.PI * 2); ctx.fill(); } // болты — видно вращение
    ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = r * .08; ctx.beginPath(); ctx.arc(0, 0, r * .78, .2, 1.3); ctx.stroke(); ctx.restore(); } // блик протектора крутится вместе
  function impact(t, t0, { amp = 30, dec = 7, squash = .18, dur = .35, hold = 2 / 30 } = {}) { if (t < t0) return { sx: 1, sy: 1, dx: 0, dy: 0, hold: false };
    const dt = t - t0, k = cl(dt / dur), sq = squash * Math.sin(k * Math.PI) * (1 - k) * 2.2, e = Math.exp(-dt * dec);
    return { sx: 1 + sq, sy: 1 - sq, dx: Math.sin(dt * 71) * amp * e, dy: Math.cos(dt * 53) * amp * e, hold: dt < hold }; }
  function drop(k, bounces = 2) { k = cl(k); const n = bounces + 1, seg = [1]; for (let i = 1; i < n; i++) seg.push(seg[i - 1] * .5); const tot = seg.reduce((s, x) => s + x, 0); let acc = 0;
    for (let i = 0; i < n; i++) { const L = seg[i] / tot; if (k <= acc + L || i === n - 1) { const u = cl((k - acc) / L); if (i === 0) return u * u; const hgt = (.25 ** i); return 1 - hgt * 4 * u * (1 - u); } acc += L; } return 1; } // 0 → 1 (1 = на земле)
  const anticip = (k, a = .15) => { k = cl(k); return k < .25 ? -a * Math.sin(k / .25 * Math.PI / 2) : -a + (1 + a) * (1 - (1 - (k - .25) / .75) ** 3); };
  const overshoot = k => { k = cl(k); const c1 = 1.7, c3 = c1 + 1; return 1 + c3 * (k - 1) ** 3 + c1 * (k - 1) ** 2; };
  function cut(t, a, kind = 'dip') { const W = ctx.canvas.width, H = ctx.canvas.height; if (kind === 'none' || t < a) return; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (kind === 'dip') { const k = 1 - cl((t - a) / .15); if (k > 0) { ctx.fillStyle = `rgba(0,0,0,${k * .8})`; ctx.fillRect(0, 0, W, H); } }
    if (kind === 'flash' && t - a < 2 / 30) { ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fillRect(0, 0, W, H); }
    if (kind === 'whip') { const k = 1 - cl((t - a) / .2); if (k > 0) { const img = ctx.getImageData(0, 0, W, H); for (let i = 1; i <= 6; i++) { ctx.globalAlpha = .18 * k; ctx.putImageData(img, 0, 0); ctx.drawImage(ctx.canvas, -i * 40 * k, 0); } } }
    ctx.restore(); }
  const handheld = (t, amp = 6, seed = 1) => [(noise1(t * 1.3 + seed) - .5) * 2 * amp, (noise1(t * 1.1 + seed + 50) - .5) * 2 * amp, (noise1(t * .7 + seed + 90) - .5) * .006 * amp];
  function limb(x, y, a1, a2, l1, l2, w = 34, col = '#2a3142', ol = '#0B1A2A', hand = null) { const ex = x + Math.sin(-a1) * l1, ey = y + Math.cos(a1) * l1, hx = ex + Math.sin(-(a1 + a2)) * l2, hy = ey + Math.cos(a1 + a2) * l2;
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(ex, ey); ctx.lineTo(hx, hy); ctx.strokeStyle = ol; ctx.lineWidth = w + 10; ctx.stroke(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.stroke();
    if (hand) { ctx.beginPath(); ctx.arc(hx, hy, w * .55, 0, Math.PI * 2); ctx.fillStyle = hand; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = ol; ctx.stroke(); } ctx.restore(); return [hx, hy]; }
  function reach(x, y, tx, ty, l1, l2, flip = 1) { const dx = tx - x, dy = ty - y, d = Math.min(Math.hypot(dx, dy), l1 + l2 - .01), c2 = cl((d * d - l1 * l1 - l2 * l2) / (2 * l1 * l2), -1, 1), a2 = Math.acos(c2) * flip;
    const base = Math.atan2(-dx, dy), k = Math.atan2(l2 * Math.sin(a2), l1 + l2 * Math.cos(a2)); return [base - k, a2]; }
  return { limb, reach, blink, breathe, mouth, puff, smoke, dust, wheel, impact, drop, anticip, overshoot, cut, handheld, noise1 };
})();
