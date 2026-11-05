// «Тыныс» — фоны, персонажи и эффект силы (плоский вектор, детерминированно по t).
'use strict';
const SKIN = '#e9b08a', HAIR = '#15131c', HOOD = '#2a3142', SCARF = '#00AFCA';

// ───── степь Улытау: небо, холмы, снег пятнами ─────
function steppeSky(t, sunset = 1) { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, sunset ? '#2a4a7a' : '#3d8fd1'); g.addColorStop(.45, sunset ? '#e58a5a' : '#9fd8f0'); g.addColorStop(.62, sunset ? '#f7c35c' : '#e8f4f8'); g.addColorStop(1, '#d9a441'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (sunset) { glow(760, 1060, 520, 'rgba(254,197,12,.55)'); circle(760, 1060, 120); ctx.fillStyle = '#ffe27a'; ctx.fill(); } }
function hills(y, col, seed, amp = 120) { const r = seeded(seed); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(0, y); let x = 0; while (x < W + 200) { const dx = 160 + r() * 220; ctx.quadraticCurveTo(x + dx / 2, y - amp * (.4 + r() * .8), x + dx, y + (r() - .5) * 30); x += dx; } ctx.lineTo(W, H); ctx.closePath(); ctx.fill(); }
function steppeGround(y, t) { const g = ctx.createLinearGradient(0, y, 0, H); g.addColorStop(0, '#c99039'); g.addColorStop(1, '#8a5f2a'); ctx.fillStyle = g; ctx.fillRect(0, y, W, H - y);
  const r = seeded(29); ctx.fillStyle = 'rgba(242,245,247,.85)'; for (let i = 0; i < 26; i++) { const x = r() * W, yy = y + 20 + r() * (H - y), w2 = 60 + r() * 200; ctx.beginPath(); ctx.ellipse(x, yy, w2, w2 * .12, 0, 0, Math.PI * 2); ctx.fill(); } // снег пятнами
  ctx.strokeStyle = 'rgba(80,50,20,.35)'; ctx.lineWidth = 3; for (let i = 0; i < 40; i++) { const x = r() * W, yy = y + r() * (H - y); ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x - 6, yy - 18); ctx.moveTo(x, yy); ctx.lineTo(x + 7, yy - 16); ctx.stroke(); } } // сухая трава
function steppe(t, { sunset = 1, horizon = 1000 } = {}) { steppeSky(t, sunset); hills(horizon - 40, '#7d5a86', 3, 160); hills(horizon, '#9a6a4e', 7, 90); steppeGround(horizon + 30, t); }
// ───── ступень ракеты (силуэт, без логотипов) ─────
function rocketStage(x, y, s, rot, { fire = 0, scorch = 1 } = {}) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  if (fire > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createLinearGradient(0, 300, 0, 1100); g.addColorStop(0, `rgba(255,240,180,${fire})`); g.addColorStop(.4, `rgba(255,140,40,${.8 * fire})`); g.addColorStop(1, 'rgba(255,80,20,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-110, 300); ctx.quadraticCurveTo(0, 1200, 110, 300); ctx.fill(); ctx.restore(); }
  rr(-110, -360, 220, 680, 30); fillOL('#cfd3d8', 6); ctx.fillStyle = `rgba(40,30,25,${.55 * scorch})`; rr(-110, -360, 220, 680, 30); ctx.fill(); // корпус, обгоревший
  for (const yy of [-220, -40, 140]) { ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-108, yy); ctx.lineTo(108, yy); ctx.stroke(); }
  for (const nx of [-60, 0, 60]) { ctx.beginPath(); ctx.moveTo(nx - 28, 320); ctx.lineTo(nx + 28, 320); ctx.lineTo(nx + 40, 400); ctx.lineTo(nx - 40, 400); ctx.closePath(); fillOL('#3a3a40', 5); } // сопла
  for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sx * 110, 200); ctx.lineTo(sx * 190, 330); ctx.lineTo(sx * 110, 320); ctx.closePath(); fillOL('#9aa0a8', 5); } // стабилизаторы
  ctx.restore(); }
function smokeColumn(x, y, t, k = 1, col = '70,60,60') { const r = seeded(13); for (let i = 0; i < 14; i++) { const ph = (t * .15 + i / 14) % 1, yy = y - ph * 900, rad = 60 + ph * 200 + r() * 40; ctx.fillStyle = `rgba(${col},${.35 * k * (1 - ph)})`; circle(x + Math.sin(i * 2 + t * .5) * 60 * ph, yy, rad); ctx.fill(); } }
// ───── УАЗ-«буханка» сбоку (без марки) ─────
function uaz(x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const bob = Math.sin(t * 22) * 4; ctx.translate(0, bob);
  rr(-230, -230, 460, 190, 50); fillOL('#5e7a4e', 6); ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(-230, -110, 460, 12); // кузов
  for (const [wx, ww] of [[-190, 110], [-60, 110], [70, 70]]) { rr(wx, -200, ww, 72, 12); fillOL('#1d2a3a', 4); } rr(150, -200, 60, 72, 10); fillOL('#2a3a4a', 4); // окна
  for (const wx of [-140, 140]) { circle(wx, -36, 46); fillOL('#16161c', 6); circle(wx, -36, 18); fillOL('#8a8fa3', 3); }
  rr(214, -110, 18, 26, 6); ctx.fillStyle = '#fff4c8'; ctx.fill(); ctx.restore(); }
function dustTrail(x, y, t) { for (let i = 0; i < 10; i++) { const ph = (t * .8 + i / 10) % 1; ctx.fillStyle = `rgba(217,164,65,${.45 * (1 - ph)})`; circle(x - ph * 420, y - ph * 60, 40 + ph * 90); ctx.fill(); } }
// ───── кратер, ящик, сфера ─────
function crater(t) { steppe(t, { horizon: 760 }); ctx.fillStyle = '#5a3d20'; ctx.beginPath(); ctx.ellipse(540, 1050, 520, 180, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#3a2614'; ctx.beginPath(); ctx.ellipse(540, 1070, 420, 130, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#2a1a0c'; ctx.lineWidth = 7; for (const [a2, l] of [[.3, 300], [1.2, 260], [2.4, 320], [3.4, 280], [4.6, 300], [5.6, 240]]) { ctx.beginPath(); ctx.moveTo(540, 1060); let x = 540, y = 1060; for (let k = 1; k <= 4; k++) { x += Math.cos(a2 + k * .2) * l / 4; y += Math.sin(a2 + k * .2) * l / 4 * .4; ctx.lineTo(x, y); } ctx.stroke(); } // трещины
  rocketStage(620, 860, .62, .85, { scorch: 1 }); smokeColumn(640, 820, t, .8); }
function crate(x, y, s, { open = 0, snowK = 0, stencil = 1 } = {}) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rr(-200, -120, 400, 240, 14); fillOL('#5b4a3a', 6);
  ctx.fillStyle = 'rgba(160,80,40,.35)'; for (let i = 0; i < 12; i++) { circle(-180 + i * 33, -100 + (i % 3) * 70, 14 + (i % 4) * 4); ctx.fill(); } // ржавчина
  ctx.strokeStyle = '#3a2c20'; ctx.lineWidth = 8; ctx.strokeRect(-190, -110, 380, 220);
  if (stencil) { txt('ОБЪЕКТ 0', 0, -20, 52, 'rgba(240,235,220,.9)', { font: 'JBM', weight: 800, align: 'center' }); txt('15.11.1988', 0, 44, 40, 'rgba(240,235,220,.85)', { font: 'JBM', weight: 800, align: 'center' }); }
  if (snowK > 0) { const x0 = -200 + 400 * (1 - snowK); ctx.beginPath(); ctx.moveTo(206, -132); ctx.lineTo(206, 128); ctx.lineTo(x0, 128); for (let i = 0; i <= 12; i++) { const yy = 128 - i * 22; ctx.lineTo(x0 + Math.sin(i * 1.7) * 14 + Math.cos(i * 3.1) * 8, yy); }
    ctx.quadraticCurveTo(x0 + 40, -150, x0 + 120, -140); ctx.quadraticCurveTo(140, -150, 206, -132); ctx.closePath(); ctx.fillStyle = '#eef3f7'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(120,150,180,.8)'; ctx.stroke();
    ctx.fillStyle = 'rgba(150,180,210,.35)'; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.ellipse(x0 + 40 + i * (180 - x0) / 5, -60 + (i % 2) * 90, 40, 10, 0, 0, Math.PI * 2); ctx.fill(); } } // снег шапкой, неровный край
  if (open > 0) { ctx.save(); ctx.translate(-200, -120); ctx.rotate(-open * 1.9); rr(0, -40, 400, 46, 10); fillOL('#4a3b2e', 5); ctx.restore(); }
  ctx.restore(); }
function sphere(x, y, r, t, k = 1) { const pulse = .5 + .5 * Math.sin(t * 2.2); glow(x, y, r * 3.2, `rgba(155,231,255,${(.35 + .25 * pulse) * k})`);
  ctx.save(); const g = ctx.createRadialGradient(x - r * .3, y - r * .3, r * .1, x, y, r); g.addColorStop(0, '#e9fbff'); g.addColorStop(.5, '#7fd6ef'); g.addColorStop(1, '#2a7c9a'); circle(x, y, r); ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = T.ol; ctx.stroke();
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.clip(); FrostOverlay(1, { x: x - r, y: y - r, w: 2 * r, h: 2 * r }, 'edges', 61); ctx.restore();
  ctx.strokeStyle = `rgba(155,231,255,${.6 * pulse * k})`; ctx.lineWidth = 4; circle(x, y, r * (1.15 + .1 * pulse)); ctx.stroke(); }
function fog(x, y, t, k, dir = -1, spread = 1) { for (let i = 0; i < 16; i++) { const ph = (t * .35 + i / 16) % 1; ctx.fillStyle = `rgba(200,240,255,${.22 * k * (1 - ph)})`; circle(x + dir * ph * 420 * spread + Math.sin(i + t) * 30, y - ph * 140 + Math.cos(i * 3) * 30, 50 + ph * 120); ctx.fill(); } }
// ───── персонажи ─────
// Ерасыл: круглая голова, глаза-точки, тёмное худи, голубой шарф деда. o: { puff, red, eyes, look, cough, kneel }
function erasylHead(x, y, r, o = {}) { ctx.save(); ctx.translate(x, y); const lw = Math.max(4, r * .05);
  circle(0, 0, r); fillOL(o.red ? `rgb(${lerp(233, 222, o.red)},${lerp(176, 96, o.red)},${lerp(138, 96, o.red)})` : SKIN, lw); circle(-r * .97, r * .08, r * .2); fillOL(SKIN, lw * .8);
  ctx.beginPath(); ctx.arc(0, 0, r, Math.PI * 1.05, Math.PI * 1.95); ctx.quadraticCurveTo(r * .3, -r * .62, -r * .1, -r * .45); ctx.quadraticCurveTo(-r * .6, -r * .55, -r * .98, -r * .1); ctx.closePath(); fillOL(HAIR, lw); // волосы
  const ex = r * .33, es = o.eyes ?? 1, lk = (o.look || 0) * r * .08; for (const s2 of [-1, 1]) { ctx.fillStyle = T.ol; ctx.beginPath(); ctx.ellipse(s2 * ex + lk, r * .02, r * .075 * Math.min(1.2, es), r * .1 * es, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#fff'; circle(s2 * ex + lk + r * .025, -r * .03, r * .025); ctx.fill();
    ctx.strokeStyle = T.ol; ctx.lineWidth = lw * 1.1; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(s2 * ex - r * .13, -r * .22 - (o.strain ? s2 * -r * .04 : 0)); ctx.lineTo(s2 * ex + r * .13, -r * .22 + (o.strain ? s2 * r * .04 : 0)); ctx.stroke(); }
  if (o.puff) { for (const s2 of [-1, 1]) { ctx.fillStyle = `rgba(230,110,100,${.35 + .3 * (o.red || 0)})`; ctx.beginPath(); ctx.ellipse(s2 * r * .45, r * .38, r * .22 * (1 + o.puff * .3), r * .16, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.strokeStyle = T.ol; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(-r * .08, r * .46); ctx.lineTo(r * .08, r * .46); ctx.stroke(); } // щёки надуты, рот сжат
  else if (o.cough) { ctx.fillStyle = '#4a1e24'; ctx.beginPath(); ctx.ellipse(0, r * .45, r * .14, r * .12, 0, 0, Math.PI * 2); ctx.fill(); }
  else if (o.gasp) { ctx.fillStyle = '#4a1e24'; ctx.beginPath(); ctx.ellipse(0, r * .47, r * .12, r * .16 * (.8 + .2 * Math.sin(o.gasp * 9)), 0, 0, Math.PI * 2); ctx.fill(); }
  else { ctx.strokeStyle = T.ol; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(-r * .12, r * .45); ctx.quadraticCurveTo(0, r * (o.smile ? .55 : .47), r * .12, r * .45); ctx.stroke(); }
  ctx.restore(); }
function scarf(x, y, w, t) { ctx.save(); ctx.translate(x, y); rr(-w / 2, -w * .14, w, w * .3, w * .14); fillOL(SCARF, 5); ctx.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -2; i <= 2; i++) ctx.fillRect(i * w * .16 - 4, -w * .12, 8, w * .26);
  ctx.save(); ctx.translate(w * .25, w * .1); ctx.rotate(.2 + Math.sin(t * 2) * .08); rr(-w * .08, 0, w * .16, w * .6, w * .06); fillOL(SCARF, 5); ctx.restore(); ctx.restore(); } // кисть шарфа развевается
function erasyl(x, y, s, t, o = {}) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const kn = o.kneel || 0;
  if (!kn) for (const sx of [-1, 1]) { rr(sx * 26 - 18, -120, 36, 120, 16); fillOL('#2b3550', 5); ctx.beginPath(); ctx.ellipse(sx * 26, 0, 30, 14, 0, 0, Math.PI * 2); fillOL('#1a1a20', 5); }
  else { rr(-80, -60, 160, 60, 26); fillOL('#2b3550', 5); }
  const by = kn ? -60 : -120; rr(-72, by - 190, 144, 200, 44); fillOL(HOOD, 6); ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-30, by - 60); ctx.lineTo(30, by - 60); ctx.stroke(); // худи
  for (const sx of [-1, 1]) { ctx.save(); ctx.translate(sx * 60, by - 170); ctx.rotate(sx * (o.armUp ? -2.4 : .18) + (o.handsKnees ? sx * -.5 : 0)); rr(-18, 0, 36, 140, 16); fillOL(HOOD, 5); circle(0, 146, 17); fillOL(SKIN, 5); ctx.restore(); }
  scarf(0, by - 190, 150, t); erasylHead(0, by - 270, 80, o); ctx.restore(); }
// Ата: тюбетейка, ватная жилетка, седые усы. o: { kneel, look }
function ata(x, y, s, t, o = {}) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const kn = o.kneel || 0, by = kn ? -60 : -120;
  if (!kn) for (const sx of [-1, 1]) { rr(sx * 26 - 18, -120, 36, 120, 16); fillOL('#3b3a40', 5); } else { rr(-90, -60, 180, 60, 26); fillOL('#3b3a40', 5); }
  rr(-78, by - 200, 156, 210, 40); fillOL('#e8e2d6', 6); rr(-82, by - 200, 66, 210, 24); fillOL('#7a5a3a', 5); rr(16, by - 200, 66, 210, 24); fillOL('#7a5a3a', 5); // рубаха + ватная жилетка
  ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 3; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-80, by - 180 + i * 34); ctx.lineTo(-18, by - 180 + i * 34); ctx.moveTo(18, by - 180 + i * 34); ctx.lineTo(80, by - 180 + i * 34); ctx.stroke(); } // стёжка
  for (const sx of [-1, 1]) { ctx.save(); ctx.translate(sx * 66, by - 180); ctx.rotate(sx * .25 + (o.reach ? sx * -.9 : 0)); rr(-18, 0, 36, 140, 16); fillOL('#e8e2d6', 5); circle(0, 146, 17); fillOL('#d7a07a', 5); ctx.restore(); }
  ataHead(0, by - 280, 82, t, o); ctx.restore(); }
function ataHead(x, y, r, t, o = {}) { ctx.save(); ctx.translate(x, y); const lw = Math.max(4, r * .05); circle(0, 0, r); fillOL('#d7a07a', lw); circle(-r * .97, r * .1, r * .2); fillOL('#d7a07a', lw * .8);
  ctx.strokeStyle = 'rgba(120,70,50,.45)'; ctx.lineWidth = lw * .7; for (const yy of [-.42, -.34]) { ctx.beginPath(); ctx.moveTo(-r * .4, r * yy); ctx.lineTo(r * .4, r * yy); ctx.stroke(); } // морщины
  const lk = (o.look || 0) * r * .1; for (const s2 of [-1, 1]) { ctx.fillStyle = T.ol; circle(s2 * r * .32 + lk, r * .02, r * .07); ctx.fill(); if (o.reflect) { ctx.fillStyle = `rgba(155,231,255,${o.reflect})`; circle(s2 * r * .32 + lk, r * .02, r * .045); ctx.fill(); } ctx.strokeStyle = '#e9e6e0'; ctx.lineWidth = lw * 1.3; ctx.beginPath(); ctx.moveTo(s2 * r * .2, -r * .18); ctx.lineTo(s2 * r * .46, -r * .14); ctx.stroke(); } // седые брови
  ctx.fillStyle = '#ecebe6'; ctx.beginPath(); ctx.moveTo(-r * .38, r * .42); ctx.quadraticCurveTo(0, r * .22, r * .38, r * .42); ctx.quadraticCurveTo(r * .2, r * .52, 0, r * .4); ctx.quadraticCurveTo(-r * .2, r * .52, -r * .38, r * .42); ctx.fill(); // седые усы
  if (o.hat !== false) tubeteika(0, -r * .62, r * 1.1); ctx.restore(); }
function tubeteika(x, y, w, rot = 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.beginPath(); ctx.moveTo(-w * .62, w * .16); ctx.quadraticCurveTo(-w * .6, -w * .36, 0, -w * .4); ctx.quadraticCurveTo(w * .6, -w * .36, w * .62, w * .16); ctx.closePath(); fillOL('#1d2a22', 5);
  ctx.strokeStyle = '#e8d9a8'; ctx.lineWidth = 3; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(i * w * .2, w * .14); ctx.quadraticCurveTo(i * w * .1, -w * .1, i * w * .06, -w * .34); ctx.stroke(); } ctx.restore(); } // вышивка
// Гептил: силуэт, респиратор с оранжевыми фильтрами, баллон за спиной, дым из клапанов; лицо не видно до с.5
function heptyl(x, y, s, t, o = {}) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  rr(30, -360, 90, 220, 40); fillOL('#3a3a3e', 5); ctx.fillStyle = T.heptyl; ctx.fillRect(30, -320, 90, 14); // баллон
  ctx.beginPath(); ctx.moveTo(-110, 0); ctx.quadraticCurveTo(-130, -280, -70, -360); ctx.quadraticCurveTo(0, -390, 70, -360); ctx.quadraticCurveTo(130, -280, 110, 0); ctx.closePath(); fillOL('#1c1c1e', 5); // плащ
  circle(0, -430, 76); fillOL('#1c1c1e', 5); rr(-58, -420, 116, 70, 30); fillOL('#2e2e32', 5); for (const sx of [-1, 1]) { circle(sx * 62, -390, 30); fillOL(T.heptyl, 5); circle(sx * 62, -390, 12); fillOL('#7a2e0a', 3); } // респиратор, фильтры
  for (const sx of [-1, 1]) { ctx.fillStyle = 'rgba(255,107,26,.95)'; circle(sx * 26, -450, 9); ctx.fill(); } // оранжевые стёкла
  if (o.binoc) { ctx.save(); ctx.translate(0, lerp(-450, -260, o.binoc)); rr(-50, -18, 100, 36, 12); fillOL('#2a2a30', 4); ctx.restore(); }
  for (let i = 0; i < 6; i++) { const ph = (t * .6 + i / 6) % 1; ctx.fillStyle = `rgba(255,107,26,${.4 * (1 - ph)})`; circle(62 + ph * 60 + Math.sin(t * 3 + i) * 10, -390 - ph * 120, 14 + ph * 30); ctx.fill(); } // дым из клапана
  ctx.restore(); }
// ───── сила: VacuumBubble ─────
// cx, cy — центр сферы; r — радиус; k — включённость 0..1 (появление/исчезновение)
const FROZEN = (() => { const r = seeded(41); return Array.from({ length: 70 }, () => [r() * W, r() * H, 2 + r() * 5, r() * 6.28]); })();
function frozenSnow(t, k) { ctx.save(); ctx.fillStyle = '#f2f5f7'; for (const [x, y, rad, ph] of FROZEN) { const a = t * .3 + ph; ctx.globalAlpha = .75 * k; ctx.save(); ctx.translate(x + Math.sin(a) * 3, y + Math.cos(a) * 3); ctx.rotate(a); ctx.fillRect(-rad, -rad * .3, rad * 2, rad * .6); ctx.fillRect(-rad * .3, -rad, rad * .6, rad * 2); ctx.restore(); } ctx.restore(); } // снежинки застыли и медленно вращаются
function VacuumBubble(t, cx, cy, r, k) { if (k <= 0) return; const c = ctx.canvas;
  const m = ctx.getTransform(), dc = m.transformPoint(new DOMPoint(cx, cy)), dr = r * Math.hypot(m.a, m.b); // кольцо искажения считаем в пикселях холста (камера может быть с наездом)
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.beginPath(); ctx.arc(dc.x, dc.y, dr * 1.06, 0, Math.PI * 2); ctx.arc(dc.x, dc.y, dr * .9, 0, Math.PI * 2, true); ctx.clip(); // картинка в кольце чуть увеличена
  const z = 1 + .05 * k + .01 * Math.sin(t * 5); ctx.translate(dc.x, dc.y); ctx.scale(z, z); ctx.translate(-dc.x, -dc.y); ctx.drawImage(c, 0, 0); ctx.restore();
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(cx, cy, r * .85, cx, cy, r * 1.08); g.addColorStop(0, 'rgba(155,231,255,0)'); g.addColorStop(.7, `rgba(155,231,255,${.45 * k})`); g.addColorStop(1, 'rgba(155,231,255,0)'); ctx.fillStyle = g; ctx.fillRect(cx - r * 1.2, cy - r * 1.2, r * 2.4, r * 2.4); ctx.restore(); // голубое свечение по краю
  ctx.strokeStyle = `rgba(155,231,255,${.5 * k})`; ctx.lineWidth = 3; circle(cx, cy, r * (1 + .01 * Math.sin(t * 7))); ctx.stroke();
  const v = ctx.createRadialGradient(540, 900, 500, 540, 960, 1200); v.addColorStop(0, 'rgba(0,175,202,0)'); v.addColorStop(1, `rgba(0,120,160,${.55 * k})`); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H); } // голубая виньетка на весь кадр
// невесомые предметы: [x, y, вид, размер, фаза]; lift 0..1 — подъём, drop 0..1 — падение
function FloatObjects(t, items, lift, drop = 0) { for (const [x, y, kind, s2, ph] of items) { const up = E.out(lift) * (120 + ph * 60) * (1 - E.in2(drop)), a = (t * .4 + ph) * (1 - drop) + ph * 3; ctx.save(); ctx.translate(x + Math.sin(t * .5 + ph) * 10 * lift, y - up + E.in2(drop) * 6); ctx.rotate(a * lift);
    if (kind === 'bolt') { rr(-s2 * .18, -s2, s2 * .36, s2 * 2, 4); fillOL('#8a8f98', 3); rr(-s2 * .4, -s2 * 1.1, s2 * .8, s2 * .35, 4); fillOL('#6b707a', 3); }
    else if (kind === 'rock') { ctx.beginPath(); ctx.ellipse(0, 0, s2, s2 * .7, ph, 0, Math.PI * 2); fillOL('#7a6a5a', 3); }
    else if (kind === 'plate') { rr(-s2, -s2 * .4, s2 * 2, s2 * .8, 4); fillOL('#b9bec6', 3); }
    ctx.restore(); } }
E.in2 = k => k * k;
