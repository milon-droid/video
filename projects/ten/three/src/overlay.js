// 2D поверх 3D (сетка 1080×1920): нарратор, письма тени (рукописные), HUD заката, штамп, переход «тень-шторка».
import { ctx, clamp, lerp, ease, h1, back } from './core.js';
const wrap = (s, n) => { const o = []; let c = ''; for (const w of s.split(' ')) { if ((c + ' ' + w).trim().length > n && c) { o.push(c); c = w; } else c = (c + ' ' + w).trim(); } if (c) o.push(c); return o; };

// нарратор: слова «выпрыгивают» по одному, акцентные — тёплым цветом
export function narr(t, t0, t1, text, { y = 1280, size = 70, n = 17, accent = [], who, color = '#fff' } = {}) {
  if (t < t0 || t > t1) return; const o = clamp((t1 - t) / .2); const ls = wrap(text, n); let wi = 0; const words = text.split(' ').length; const per = Math.min(.14, (t1 - t0) * .35 / words);
  ctx.save(); ctx.globalAlpha = o; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
  if (who) { ctx.font = `800 34px Unb`; ctx.textAlign = 'center'; ctx.lineWidth = 9; ctx.strokeStyle = '#140a1e'; ctx.strokeText(who, 540, y - size * 1.0); ctx.fillStyle = '#ffd36a'; ctx.fillText(who, 540, y - size * 1.0); ctx.textAlign = 'left'; }
  ctx.font = `800 ${size}px Unb`;
  ls.forEach((ln, i) => { const ws = ln.split(' '); const widths = ws.map(w => ctx.measureText(w + ' ').width); const total = widths.reduce((a, b) => a + b, 0) - ctx.measureText(' ').width; let x = 540 - total / 2; const yy = y + i * size * 1.22;
    ws.forEach((w, j) => { const k = ease(t, t0 + wi * per, t0 + wi * per + .25, back); wi++; const hot = accent.some(a => w.toLowerCase().replace(/[.,…!?—«»]/g, '').startsWith(a));
      if (k > 0) { ctx.save(); const cx = x + widths[j] / 2; ctx.translate(cx, yy); ctx.scale(clamp(k, 0, 1.3), clamp(k, 0, 1.3)); ctx.translate(-cx, -yy);
        ctx.lineWidth = size * .22; ctx.strokeStyle = '#140a1e'; ctx.strokeText(w, x, yy); ctx.fillStyle = hot ? '#ffcf4a' : color; ctx.fillText(w, x, yy); ctx.restore(); }
      x += widths[j]; }); });
  ctx.restore();
}

// реплика тени: чёрный рукописный текст на тёплой «бумажной» подсветке, буквы проступают
export function shadowSay(t, t0, t1, lines, { y = 520, size = 84, rot = -.03, glowC = 'rgba(255,240,215,.95)' } = {}) {
  if (t < t0 || t > t1) return; const o = clamp((t1 - t) / .25); let idx = 0;
  ctx.save(); ctx.globalAlpha = o; ctx.translate(540, y); ctx.rotate(rot); ctx.textAlign = 'center'; ctx.font = `700 ${size}px Cav`; ctx.lineJoin = 'round';
  lines.forEach((ln, i) => { const vis = ln.slice(0, Math.max(0, Math.floor((t - t0) * 32) - idx)); idx += ln.length; const yy = i * size * 1.05;
    ctx.shadowColor = glowC; ctx.shadowBlur = 30; ctx.lineWidth = size * .18; ctx.strokeStyle = glowC; ctx.strokeText(vis, 0, yy); ctx.shadowBlur = 0; ctx.fillStyle = '#07060c'; ctx.fillText(vis, 0, yy); });
  ctx.restore();
}

// HUD «до заката»: одна функция серии; T — глобальное время
export const SUN_KEYS = [[24, 9 * 3600 + 12 * 60], [43, 2 * 3600 + 40 * 60], [48, 22 * 60], [54, 95], [62, 3]];
export const sunLeft = T => { const Kk = SUN_KEYS; if (T <= Kk[0][0]) return Kk[0][1]; for (let i = 1; i < Kk.length; i++) if (T < Kk[i][0]) { const k = (T - Kk[i - 1][0]) / (Kk[i][0] - Kk[i - 1][0]); return lerp(Kk[i - 1][1], Kk[i][1], k); } return Kk[Kk.length - 1][1]; };
const hms = s => { s = Math.max(0, Math.floor(s)); return [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map(v => String(v).padStart(2, '0')).join(':'); };
export function sunHud(t, T, { t0 = 0, y = 330, k: kk = 1 } = {}) {
  const k = ease(t, t0, t0 + .4, back) * kk; if (k <= 0) return; const left = sunLeft(T), red = left < 3600, pulse = red ? .5 + .5 * Math.sin(t * 9) : 0;
  ctx.save(); ctx.translate(540, y); ctx.scale(k, k); ctx.globalAlpha = clamp(k);
  ctx.fillStyle = 'rgba(16,10,24,.72)'; rr(-270, -58, 540, 116, 58); ctx.fill(); ctx.lineWidth = 4 + pulse * 4; ctx.strokeStyle = red ? '#ff5a4a' : '#ffbf5a'; ctx.stroke();
  // солнышко над горизонтом
  ctx.save(); ctx.beginPath(); ctx.rect(-240, -50, 80, 62); ctx.clip(); ctx.fillStyle = red ? '#ff6a3a' : '#ffc04a'; ctx.beginPath(); ctx.arc(-200, 8 + clamp(1 - left / 33000) * 34, 26, 0, 7); ctx.fill(); ctx.restore();
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-240, 12); ctx.lineTo(-160, 12); ctx.stroke();
  ctx.textAlign = 'left'; ctx.fillStyle = '#e0d8f0'; ctx.font = '700 24px Unb'; ctx.fillText('TILL SUNSET', -135, -12);
  ctx.fillStyle = red ? '#ff7a6a' : '#fff'; ctx.font = '800 46px Unb'; ctx.fillText(hms(left), -137, 36); ctx.restore();
}
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
export { rr };

// штамп-удар
export function stamp(t, t0, text, { x = 540, y = 900, size = 150, color = '#ff3d5a', rot = -.14 } = {}) {
  if (t < t0) return; const k = ease(t, t0, t0 + .2); const sc = lerp(2.8, 1, k);
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc); ctx.globalAlpha = clamp(k * 2); ctx.font = `900 ${size}px Unb`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(text).width + 70; ctx.lineWidth = 14; ctx.strokeStyle = color; rr(-w / 2, -size * .7, w, size * 1.4, 22); ctx.stroke(); ctx.fillStyle = color; ctx.fillText(text, 0, 6); ctx.restore();
}

// переход «тень-шторка»: огромная чёрная клякса с глазами проносится через кадр. k: 0…1 (0.5 — кадр закрыт)
export function shadowWipe(k, dir = 1, eyes = true) {
  if (k <= 0 || k >= 1) return; const x = lerp(-1700, 2780, k) * dir + (dir < 0 ? 1080 : 0);
  ctx.save(); ctx.fillStyle = '#07060c'; ctx.beginPath();
  const cx = x, w = 1500; ctx.moveTo(cx - w / 2, -100);
  for (let i = 0; i <= 24; i++) { const yy = -100 + i * 90; ctx.lineTo(cx + w / 2 + Math.sin(i * 1.7 + k * 9) * 60 + h1(i) * 40, yy); }
  for (let i = 24; i >= 0; i--) { const yy = -100 + i * 90; ctx.lineTo(cx - w / 2 + Math.sin(i * 1.3 + k * 7) * 60 - h1(i + 9) * 40, yy); }
  ctx.closePath(); ctx.fill();
  if (eyes) { ctx.fillStyle = '#f4f8ff'; ctx.shadowColor = '#fff'; ctx.shadowBlur = 30; [-1, 1].forEach(s => { ctx.beginPath(); ctx.ellipse(cx + s * 70, 900, 46, 20, s * -.2, 0, 7); ctx.fill(); }); }
  ctx.restore();
}

// пылинки в луче света (2D)
export function motes(t, { x = 540, y = 900, w = 900, h = 1200, n = 40, color = '255,240,210', a = .6, size = 4 } = {}) {
  ctx.save(); for (let i = 0; i < n; i++) { const px = x - w / 2 + ((h1(i) * w + t * 20 * (h1(i + 3) - .5)) % w + w) % w, py = y - h / 2 + ((h1(i + 7) * h - t * 30 * h1(i + 1)) % h + h) % h; ctx.fillStyle = `rgba(${color},${a * (.4 + .6 * Math.sin(t * 2 + i) ** 2)})`; ctx.beginPath(); ctx.arc(px, py, size * (.5 + h1(i + 4)), 0, 7); ctx.fill(); } ctx.restore();
}
