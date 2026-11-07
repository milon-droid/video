// fx-kit.js — приёмы из каталога knowledge/visual-style.md (п.11), общие для всех сериалов. Нужен глобальный ctx (lib.js проекта).
// Появился в ҚУАТ с.3 (2026-11-07).
//   FX.stamp(t, t0, text, x, y, o)   — штамп-удар из камеры: 300% → 100% за 0,25 с, поворот 5–8°, тряска (A1, G1)
//   FX.emote(t, t0, kind, x, y, s)   — знак эмоции над головой: '!' '?' 'sweat' 'anger' 'heart' (D2)
//   FX.onomato(t, t0, text, x, y, o) — звуковое слово «БДЫЩ!», «РАЗ!» с выстрелом и дрожью (D6)
//   FX.backGlow(x, y, r, rgb, k)     — цветное пятно света за героем по смыслу (C1)
//   FX.xray(k, draw)                 — режим «рентген»: тёмно-синий фон, draw() рисует светящиеся линии (E22, D10)
//   FX.shake(t, t0, amp)             — [dx, dy] тряска кадра после удара
'use strict';
const FX = (() => {
  const cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), out5 = p => 1 - (1 - cl(p)) ** 5;
  const shake = (t, t0, amp = 16) => { if (t < t0) return [0, 0]; const e = Math.exp(-(t - t0) * 9); return [Math.sin((t - t0) * 83) * amp * e, Math.cos((t - t0) * 61) * amp * e]; };
  function label(text, size, fill, ol = '#0A0F1E') { ctx.font = `900 ${size}px Mont`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round'; ctx.lineWidth = size * .16; ctx.strokeStyle = ol; ctx.strokeText(text, 0, 0); ctx.fillStyle = fill; ctx.fillText(text, 0, 0); }
  function stamp(t, t0, text, x, y, { col = '#e5383b', size = 110, rot = -.12, life = 2.2, box = true } = {}) { if (t < t0 || t > t0 + life) return; const k = out5((t - t0) / .25), sc = 3 - 2 * k, a = cl((t0 + life - t) / .25), [dx, dy] = shake(t, t0 + .25, 12);
    ctx.save(); ctx.globalAlpha = cl(k * 2) * a; ctx.translate(x + dx, y + dy); ctx.rotate(rot * (2 - k)); ctx.scale(sc, sc);
    if (box) { ctx.font = `900 ${size}px Mont`; const w = ctx.measureText(text).width + size * .7, h = size * 1.35; ctx.strokeStyle = col; ctx.lineWidth = size * .09; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, size * .16); ctx.stroke(); ctx.fillStyle = 'rgba(10,15,30,.55)'; ctx.fill(); }
    label(text, size, col); ctx.restore(); }
  function emote(t, t0, kind, x, y, s = 1, life = 1.6) { if (t < t0 || t > t0 + life) return; const k = cl((t - t0) / .2), pop = k < 1 ? 1 + 1.7 * (k - 1) ** 3 + 2.7 * (k - 1) ** 2 : 1, a = cl((t0 + life - t) / .25), bob = Math.sin((t - t0) * 9) * 6;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y + bob); ctx.scale(s * pop, s * pop);
    if (kind === '!' || kind === '?') label(kind, 120, '#ffd23f');
    else if (kind === 'sweat') { for (const [dx, dy, r] of [[0, 0, 1], [46, 30, .7]]) { ctx.save(); ctx.translate(dx, dy + ((t - t0) * 40) % 30); ctx.scale(r, r); ctx.beginPath(); ctx.moveTo(0, -34); ctx.quadraticCurveTo(24, 6, 0, 22); ctx.quadraticCurveTo(-24, 6, 0, -34); ctx.fillStyle = '#9fe3ff'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#0A0F1E'; ctx.stroke(); ctx.restore(); } }
    else if (kind === 'anger') { ctx.strokeStyle = '#e5383b'; ctx.lineWidth = 12; ctx.lineCap = 'round'; for (let i = 0; i < 4; i++) { ctx.save(); ctx.rotate(i * Math.PI / 2); ctx.beginPath(); ctx.moveTo(10, 10); ctx.quadraticCurveTo(34, 12, 34, 36); ctx.stroke(); ctx.restore(); } }
    else if (kind === 'heart') { ctx.beginPath(); ctx.moveTo(0, 30); ctx.bezierCurveTo(-60, -10, -30, -60, 0, -26); ctx.bezierCurveTo(30, -60, 60, -10, 0, 30); ctx.fillStyle = '#e5383b'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#0A0F1E'; ctx.stroke(); }
    ctx.restore(); }
  function onomato(t, t0, text, x, y, { col = '#ffd23f', size = 96, rot = -.1, life = .8 } = {}) { if (t < t0 || t > t0 + life) return; const k = cl((t - t0) / .15), pop = 1 + 1.7 * (k - 1) ** 3 + 2.7 * (k - 1) ** 2, a = cl((t0 + life - t) / .2), j = Math.sin((t - t0) * 70) * 3;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(x + j, y - (t - t0) * 40); ctx.rotate(rot); ctx.scale(pop, pop); label(text, size, col); ctx.restore(); }
  function backGlow(x, y, r, rgb = '61,255,143', k = 1) { if (k <= 0) return; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${rgb},${.55 * k})`); g.addColorStop(.5, `rgba(${rgb},${.2 * k})`); g.addColorStop(1, `rgba(${rgb},0)`); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); ctx.restore(); }
  function xray(k, draw) { if (k <= 0) return; const W = ctx.canvas.width, H = ctx.canvas.height; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = k; ctx.fillStyle = '#07123a'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; ctx.restore();
    ctx.save(); ctx.globalAlpha = k; ctx.shadowColor = 'rgba(140,220,255,.9)'; ctx.shadowBlur = 30; ctx.strokeStyle = '#bfefff'; ctx.lineWidth = 8; ctx.lineCap = 'round'; draw(); ctx.restore(); }
  return { stamp, emote, onomato, backGlow, xray, shake };
})();
