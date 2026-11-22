// «Окна» поверх кадра: записка P.S., записка «Новые условия», интерактивный договор, интерфейс видео-ленты, отпечаток ладони.
import { ctx, clamp, lerp, ease, back, h1, spring } from './core.js';
const INK = '#0b0a12', RED = '#e8333f';

// человеческая ладонь: ладонь + 4 пальца + большой палец (толстые линии со скруглением)
export function handPrint(c, x, y, s = 1, rot = 0, color = INK) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s); c.fillStyle = color; c.strokeStyle = color; c.lineCap = 'round';
  c.beginPath(); c.ellipse(0, 10, 40, 48, 0, 0, 7); c.fill();
  [[-27, -26, -.18, 62, 19], [-9, -34, -.05, 78, 20], [10, -33, .06, 74, 20], [27, -24, .2, 58, 17]].forEach(([fx, fy, a, L, w]) => {
    c.lineWidth = w; c.beginPath(); c.moveTo(fx, fy + 10); c.lineTo(fx + Math.sin(a) * L, fy - Math.cos(a) * L); c.stroke(); });
  c.lineWidth = 21; c.beginPath(); c.moveTo(-30, 18); c.lineTo(-72, -14); c.stroke();
  c.restore();
}

function paperCard(t, t0, w, h, x = 540, y = 900, rot0 = -.06) {
  const k = spring(t, t0, 1.6, 6.5); const sc = lerp(.35, 1, clamp(k, 0, 1.2)); const r = lerp(-.35, rot0, clamp(k));
  ctx.save(); ctx.translate(x, y); ctx.rotate(r); ctx.scale(sc, sc); ctx.globalAlpha = clamp((t - t0) * 6);
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(-w / 2 + 18, -h / 2 + 22, w, h);
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, '#fbf3e2'); g.addColorStop(1, '#efe2c8'); ctx.fillStyle = g; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.strokeStyle = 'rgba(120,150,200,.25)'; ctx.lineWidth = 2; for (let yy = -h / 2 + 110; yy < h / 2 - 20; yy += 62) { ctx.beginPath(); ctx.moveTo(-w / 2 + 30, yy); ctx.lineTo(w / 2 - 30, yy); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,236,170,.75)'; [[-w / 2 + 40, -.5], [w / 2 - 40, .5]].forEach(([tx, a]) => { ctx.save(); ctx.translate(tx, -h / 2 + 6); ctx.rotate(a); ctx.fillRect(-60, -18, 120, 36); ctx.restore(); });
  return () => ctx.restore();
}
const typed = (s, t, t0, cps = 26) => s.slice(0, Math.max(0, Math.floor((t - t0) * cps)));
function hand(text, x, y, size, color = INK, align = 'left') { ctx.font = `700 ${size}px Cav`; ctx.textAlign = align; ctx.fillStyle = color; ctx.fillText(text, x, y); return ctx.measureText(text).width; }
// рисованный овал вокруг слова (анимированный штрих)
function scribbleOval(cx, cy, rx, ry, k, color = RED) { if (k <= 0) return; ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath();
  const N = 60, end = Math.floor(N * 1.15 * clamp(k)); for (let i = 0; i <= end; i++) { const a = -2.6 + i / N * Math.PI * 2; const wob = 1 + Math.sin(i * .7) * .03; const px = cx + Math.cos(a) * rx * wob * (1 + i / N * .04), py = cy + Math.sin(a) * ry * wob; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); } ctx.stroke(); ctx.restore(); }
function shadowDoodle(x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(0, -30, 26, 0, 7); ctx.fill(); ctx.beginPath(); ctx.moveTo(-26, -8); ctx.quadraticCurveTo(0, -18, 26, -8); ctx.lineTo(34, 50); ctx.lineTo(-34, 50); ctx.fill();
  const b = (t * 1.3) % 3 < .12 ? .15 : 1; ctx.fillStyle = '#fff'; [-1, 1].forEach(sd => { ctx.beginPath(); ctx.ellipse(sd * 10, -32, 7, 3.5 * b, sd * -.2, 0, 7); ctx.fill(); }); ctx.restore(); }

// «окно»-правило (не слова тени): официальная карточка «ЗАКОН ТЕНЕЙ», акцент — «ДО ЗАКАТА»
export function psNote(t, t0, out = 99) {
  if (t < t0) return; const o = 1 - ease(t, out, out + .25); if (o <= 0) return; ctx.save(); ctx.globalAlpha = o;
  const k = spring(t, t0, 1.6, 6.5), sc = lerp(.4, 1, clamp(k, 0, 1.15)); ctx.translate(540, 900 + ease(t, out, out + .25) * 700); ctx.rotate(lerp(.25, -.03, clamp(k))); ctx.scale(sc, sc);
  const W = 880, Hh = 900; ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fillRect(-W / 2 + 18, -Hh / 2 + 22, W, Hh);
  ctx.fillStyle = '#f6efe0'; ctx.fillRect(-W / 2, -Hh / 2, W, Hh); ctx.fillStyle = '#1a1424'; ctx.fillRect(-W / 2, -Hh / 2, W, 150);
  ctx.textAlign = 'center'; ctx.fillStyle = '#f6efe0'; ctx.font = '800 60px Unb'; ctx.fillText('ЗАКОН ТЕНЕЙ', 0, -Hh / 2 + 95);
  ctx.fillStyle = '#ffcf4a'; ctx.font = '600 26px Unb'; ctx.fillText('ПРАВИЛО № 1', 0, -Hh / 2 + 132);
  const a = t0 + .3; ctx.fillStyle = INK; ctx.font = '700 64px Unb';
  [['Человек без тени', -210], ['держится', -125]].forEach(([l, y], i) => { const kk = ease(t, a + i * .25, a + i * .25 + .25); ctx.globalAlpha = o * kk; ctx.fillText(l, 0, y); }); ctx.globalAlpha = o;
  const k2 = ease(t, a + .6, a + .85, back); ctx.save(); ctx.translate(0, 0); ctx.scale(k2, k2); ctx.fillStyle = RED; ctx.font = '900 112px Unb'; ctx.fillText('ДО ЗАКАТА', 0, 20); ctx.restore();
  scribbleOval(0, -18, 380, 92, ease(t, a + .85, a + 1.35));
  [['Потом он сам', 150], ['становится тенью.', 230]].forEach(([l, y], i) => { const kk = ease(t, a + 1.3 + i * .25, a + 1.55 + i * .25); ctx.globalAlpha = o * kk; ctx.fillStyle = INK; ctx.font = '700 60px Unb'; ctx.fillText(l, 0, y); }); ctx.globalAlpha = o;
  // песочные часы-солнце и печать
  if (t > a + 1.9) { const kk = ease(t, a + 1.9, a + 2.1); ctx.save(); ctx.translate(250, 345); ctx.rotate(-.2); ctx.scale(lerp(2.4, 1, kk), lerp(2.4, 1, kk)); ctx.globalAlpha = o * kk; ctx.strokeStyle = RED; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(0, 0, 70, 0, 7); ctx.stroke(); ctx.fillStyle = RED; ctx.font = '800 22px Unb'; ctx.fillText('БЕЗ', 0, -14); ctx.fillText('ИСКЛЮ-', 0, 12); ctx.fillText('ЧЕНИЙ', 0, 36); ctx.restore(); }
  ctx.globalAlpha = o; ctx.fillStyle = '#ffb84a'; ctx.beginPath(); ctx.arc(-330, 340, 34, Math.PI, 0); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-390, 342); ctx.lineTo(-270, 342); ctx.stroke();
  ctx.restore();
}

// записка «Новые условия» (то же «окно»), переходит в договор
export function condNote(t, t0) {
  if (t < t0) return; const done = paperCard(t, t0, 840, 560, 540, 760, .04);
  const w = hand(typed('Новые условия.', t, t0 + .2, 22), 0, -110, 118, INK, 'center');
  if (t > t0 + .9) { ctx.strokeStyle = RED; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(-w / 2, -80); ctx.lineTo(-w / 2 + w * ease(t, t0 + .9, t0 + 1.2), -86); ctx.stroke(); }
  hand(typed('Подпишешь — вернусь.', t, t0 + 1.1, 26), 0, 30, 76, INK, 'center');
  if (t > t0 + 1.9) { const k = ease(t, t0 + 1.9, t0 + 2.3); ctx.globalAlpha = k; hand('↓ договор', 0, 160, 64, RED, 'center'); ctx.globalAlpha = 1; shadowDoodle(320, 150, .9, t); }
  done();
}

// интерактивный договор: пункты появляются, тень-рука ставит галочки, подписи, печать
const ITEMS = ['Раз в неделю — туда,|где мы ещё не были', 'Закат — без телефона', 'Танцевать,|даже если стрёмно', 'Нарушишь —|увольняюсь нахуй'];
export function contract(t, t0, out) {
  if (t < t0) return; const up = ease(t, t0, t0 + .35, back), away = ease(t, out, out + .3);
  ctx.save(); ctx.translate(540, lerp(2400, 930, up) + away * 1800); ctx.rotate(.015);
  const W = 900, Hh = 1260; ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.fillRect(-W / 2 + 20, -Hh / 2 + 24, W, Hh);
  ctx.fillStyle = '#fbf6ea'; ctx.fillRect(-W / 2, -Hh / 2, W, Hh); ctx.strokeStyle = '#c9b38a'; ctx.lineWidth = 4; ctx.strokeRect(-W / 2 + 22, -Hh / 2 + 22, W - 44, Hh - 44);
  ctx.textAlign = 'center'; ctx.fillStyle = INK; ctx.font = '800 62px Unb'; ctx.fillText('ДОГОВОР № 1', 0, -Hh / 2 + 120);
  ctx.font = '700 54px Cav'; ctx.fillText('между Сеней и его Тенью', 0, -Hh / 2 + 185);
  let y = -Hh / 2 + 300;
  ITEMS.forEach((it, i) => { const ti = t0 + .4 + i * .42; if (t < ti) return; const k = ease(t, ti, ti + .2); const lines = it.split('|');
    ctx.globalAlpha = k; ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.strokeRect(-W / 2 + 70, y - 46, 56, 56);
    ctx.textAlign = 'left'; lines.forEach((l, j) => { ctx.font = '700 58px Cav'; ctx.fillStyle = i === 3 ? RED : INK; ctx.fillText(l, -W / 2 + 160, y + j * 56); });
    const tk = ease(t, ti + .2, ti + .38); if (tk > 0) { ctx.strokeStyle = '#1f9a52'; ctx.lineWidth = 11; ctx.lineCap = 'round'; ctx.beginPath(); const px = -W / 2 + 76, py = y - 22;
      ctx.moveTo(px, py); const p2 = [px + 22, py + 26], p3 = [px + 70, py - 40]; if (tk < .4) ctx.lineTo(lerp(px, p2[0], tk / .4), lerp(py, p2[1], tk / .4)); else { ctx.lineTo(...p2); ctx.lineTo(lerp(p2[0], p3[0], (tk - .4) / .6), lerp(p2[1], p3[1], (tk - .4) / .6)); } ctx.stroke(); }
    ctx.globalAlpha = 1; y += 70 + lines.length * 56; });
  // подписи
  const sy = Hh / 2 - 250; ctx.textAlign = 'left'; ctx.font = '700 50px Cav'; ctx.fillStyle = '#6a5a7a'; ctx.fillText('Сеня', -W / 2 + 70, sy); ctx.fillText('Тень', 40, sy);
  ctx.strokeStyle = '#6a5a7a'; ctx.lineWidth = 3; [[-W / 2 + 70, -40], [40, W / 2 - 60]].forEach(([a, b]) => { ctx.beginPath(); ctx.moveTo(a, sy + 70); ctx.lineTo(b, sy + 70); ctx.stroke(); });
  const sk = ease(t, t0 + 2.15, t0 + 2.5); if (sk > 0) { ctx.strokeStyle = '#2a3a8a'; ctx.lineWidth = 5; ctx.beginPath(); for (let i = 0; i <= 40 * sk; i++) { const u = i / 40; ctx.lineTo(-W / 2 + 80 + u * 300, sy + 50 - Math.sin(u * 19) * 22 * (1 - u * .5) - u * 10); } ctx.stroke(); }
  if (t > t0 + 2.45) { const k = clamp((t - t0 - 2.45) * 6); handPrint(ctx, 210, sy + 40, lerp(1.8, .75, k), -.25); }
  if (t > t0 + 2.7) { const k = ease(t, t0 + 2.7, t0 + 2.9); ctx.save(); ctx.translate(230, -60); ctx.rotate(-.2); ctx.scale(lerp(2.6, 1, k), lerp(2.6, 1, k)); ctx.globalAlpha = k; ctx.strokeStyle = RED; ctx.lineWidth = 10; ctx.strokeRect(-230, -62, 460, 112); ctx.fillStyle = RED; ctx.textAlign = 'center'; ctx.font = '900 68px Unb'; ctx.fillText('ПОДПИСАНО', 0, 22); ctx.restore(); }
  // курсор: рука тени ставит галочки
  const cur = Math.min(3, Math.floor((t - t0 - .4) / .42)); if (t > t0 + .45 && t < t0 + 2.1) { let yy = -Hh / 2 + 300; for (let i = 0; i < cur; i++) yy += 70 + ITEMS[i].split('|').length * 56; handPrint(ctx, -W / 2 + 150, yy + 10, .55, -.6); }
  ctx.restore();
}

// интерфейс видео-ленты поверх экрана телефона (rect в сетке 1080×1920)
export function feedUI(t, r) {
  const { x, y, w, h } = r; const s = w / 440; ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const g = ctx.createLinearGradient(0, 620, 0, 880); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.55)'); ctx.fillStyle = g; ctx.fillRect(0, 600, 440, 280);
  ctx.textAlign = 'center'; ctx.font = '600 19px Unb'; ctx.font = '600 16px Unb'; ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillText('Подписки', 130, 62); ctx.fillStyle = '#fff'; ctx.fillText('Рекомендации', 290, 62); ctx.fillRect(262, 72, 56, 3);
  ctx.fillStyle = '#ff2a5a'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(16, 92, 150, 34, 17) : ctx.rect(16, 92, 150, 34); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = '800 17px Unb'; ctx.fillText('В ТРЕНДАХ', 91, 115);
  // правая колонка
  const col = 395; ctx.fillStyle = '#ddd'; ctx.beginPath(); ctx.arc(col, 430, 24, 0, 7); ctx.fill(); ctx.fillStyle = '#07060c'; ctx.beginPath(); ctx.arc(col, 426, 12, 0, 7); ctx.fill(); ctx.fillStyle = '#ff2a5a'; ctx.beginPath(); ctx.arc(col, 455, 9, 0, 7); ctx.fill();
  const likes = (1.2 + t * .7).toFixed(1).replace('.', ','); const icon = (yy, draw, label) => { draw(yy); ctx.fillStyle = '#fff'; ctx.font = '700 15px Unb'; ctx.fillText(label, col, yy + 40); };
  icon(510, yy => { const pk = 1 + Math.max(0, Math.sin(t * 6)) * .12; ctx.save(); ctx.translate(col, yy); ctx.scale(pk, pk); ctx.fillStyle = '#ff2a5a'; ctx.beginPath(); ctx.moveTo(0, 14); ctx.bezierCurveTo(-30, -10, -18, -32, 0, -16); ctx.bezierCurveTo(18, -32, 30, -10, 0, 14); ctx.fill(); ctx.restore(); }, likes + ' млн');
  icon(590, yy => { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(col, yy, 22, 17, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.moveTo(col - 8, yy + 12); ctx.lineTo(col - 16, yy + 24); ctx.lineTo(col + 2, yy + 14); ctx.fill(); }, '48,3 тыс');
  icon(665, yy => { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(col - 18, yy + 12); ctx.quadraticCurveTo(col - 14, yy - 10, col + 6, yy - 8); ctx.lineTo(col + 6, yy - 18); ctx.lineTo(col + 22, yy - 2); ctx.lineTo(col + 6, yy + 14); ctx.lineTo(col + 6, yy + 4); ctx.quadraticCurveTo(col - 8, yy + 2, col - 18, yy + 12); ctx.fill(); }, 'Поделиться');
  // летящие сердечки
  for (let i = 0; i < 6; i++) { const ph = (t * .9 + i / 6) % 1; ctx.globalAlpha = 1 - ph; ctx.fillStyle = i % 2 ? '#ff6a9a' : '#ff2a5a'; const hx = col - 10 - Math.sin(ph * 6 + i) * 18, hy = 500 - ph * 220; ctx.beginPath(); ctx.moveTo(hx, hy + 7); ctx.bezierCurveTo(hx - 15, hy - 5, hx - 9, hy - 16, hx, hy - 8); ctx.bezierCurveTo(hx + 9, hy - 16, hx + 15, hy - 5, hx, hy + 7); ctx.fill(); } ctx.globalAlpha = 1;
  ctx.textAlign = 'left'; ctx.fillStyle = '#fff'; ctx.font = '800 20px Unb'; ctx.fillText('@club_lastochka', 18, 760);
  ctx.font = '500 18px Unb'; ctx.fillText('в клубе танцует тень. без человека', 18, 790); ctx.fillText('это вообще нормально?? 😳'.replace(' 😳', ''), 18, 815);
  ctx.font = '500 15px Unb'; ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.fillText('♫ клуб «Ласточка» · вчера ночью', 18, 845);
  ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillRect(0, 872, 440, 4); ctx.fillStyle = '#fff'; ctx.fillRect(0, 872, 440 * ((t * .35) % 1), 4);
  ctx.restore();
}
