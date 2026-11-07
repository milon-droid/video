// «Тыныс» — фоны, персонажи и эффект силы (плоский вектор, детерминированно по t).
'use strict';
const SKIN = '#e9b08a', HAIR = '#15131c', HOOD = '#2a3142', SCARF = '#00AFCA';

// ───── степь Улытау: небо, холмы, снег пятнами ─────
function steppeSky(t, sunset = 1) { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, sunset ? '#2a4a7a' : '#3d8fd1'); g.addColorStop(.45, sunset ? '#e58a5a' : '#9fd8f0'); g.addColorStop(.62, sunset ? '#f7c35c' : '#e8f4f8'); g.addColorStop(1, '#d9a441'); ctx.fillStyle = g; ctx.fillRect(-150, -150, W + 300, H + 300); // с запасом за край: тряска и наезд не открывают пустоту
  if (sunset) { glow(760, 1060, 520, 'rgba(254,197,12,.55)'); circle(760, 1060, 120); ctx.fillStyle = '#ffe27a'; ctx.fill(); } }
function hills(y, col, seed, amp = 120) { const r = seeded(seed); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-150, H + 150); ctx.lineTo(-150, y); let x = -150; while (x < W + 200) { const dx = 160 + r() * 220; ctx.quadraticCurveTo(x + dx / 2, y - amp * (.4 + r() * .8), x + dx, y + (r() - .5) * 30); x += dx; } ctx.lineTo(W + 150, H + 150); ctx.closePath(); ctx.fill(); }
function steppeGround(y, t) { const g = ctx.createLinearGradient(0, y, 0, H); g.addColorStop(0, '#c99039'); g.addColorStop(1, '#8a5f2a'); ctx.fillStyle = g; ctx.fillRect(-150, y, W + 300, H - y + 150);
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
function smokeColumn(x, y, t, k = 1, col = '70,60,60') { AK.smoke(x, y, t, { k, rgb: col, size: .9 }); } // мягкие клубы вместо плоских кружков
// ───── УАЗ-«буханка» сбоку (без марки) ─────
function uaz(x, y, s, t) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const bob = Math.sin(t * 22) * 4; ctx.translate(0, bob);
  rr(-230, -230, 460, 190, 50); fillOL('#5e7a4e', 6); ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(-230, -110, 460, 12); // кузов
  for (const [wx, ww] of [[-190, 110], [-60, 110], [70, 70]]) { rr(wx, -200, ww, 72, 12); fillOL('#1d2a3a', 4); } rr(150, -200, 60, 72, 10); fillOL('#2a3a4a', 4); // окна
  for (const wx of [-140, 140]) AK.wheel(wx, -36 - bob, 46, t, 1400); // колёса крутятся и не подпрыгивают вместе с кузовом
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
function fog(x, y, t, k, dir = -1, spread = 1) { for (let i = 0; i < 14; i++) { const ph = (t * .35 + i / 14) % 1; AK.puff(x + dir * ph * 420 * spread + Math.sin(i + t) * 30, y - ph * 140 + Math.cos(i * 3) * 30, 90 + ph * 170, '200,240,255', .3 * k * Math.sin(ph * Math.PI)); } }
// ───── персонажи ─────
// Ерасыл: круглая голова, глаза-точки, тёмное худи, голубой шарф деда. o: { puff, red, eyes, look, cough, kneel }
function erasylHead(x, y, r, o = {}) { ctx.save(); ctx.translate(x, y); const lw = Math.max(4, r * .05);
  circle(0, 0, r); fillOL(o.red ? `rgb(${lerp(233, 222, o.red)},${lerp(176, 96, o.red)},${lerp(138, 96, o.red)})` : SKIN, lw); circle(-r * .97, r * .08, r * .2); fillOL(SKIN, lw * .8);
  ctx.beginPath(); ctx.arc(0, 0, r, Math.PI * 1.05, Math.PI * 1.95); ctx.quadraticCurveTo(r * .3, -r * .62, -r * .1, -r * .45); ctx.quadraticCurveTo(-r * .6, -r * .55, -r * .98, -r * .1); ctx.closePath(); fillOL(HAIR, lw); // волосы
  const ex = r * .33, es = (o.eyes ?? 1) * Math.max(.08, o.blink ?? 1), lk = (o.look || 0) * r * .08; for (const s2 of [-1, 1]) { ctx.fillStyle = T.ol; ctx.beginPath(); ctx.ellipse(s2 * ex + lk, r * .02, r * .075 * Math.min(1.2, es), r * .1 * es, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#fff'; circle(s2 * ex + lk + r * .025, -r * .03, r * .025); ctx.fill();
    ctx.strokeStyle = T.ol; ctx.lineWidth = lw * 1.1; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(s2 * ex - r * .13, -r * .22 - (o.strain ? s2 * -r * .04 : 0)); ctx.lineTo(s2 * ex + r * .13, -r * .22 + (o.strain ? s2 * r * .04 : 0)); ctx.stroke(); }
  if (o.puff) { for (const s2 of [-1, 1]) { ctx.fillStyle = `rgba(230,110,100,${.35 + .3 * (o.red || 0)})`; ctx.beginPath(); ctx.ellipse(s2 * r * .45, r * .38, r * .22 * (1 + o.puff * .3), r * .16, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.strokeStyle = T.ol; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(-r * .08, r * .46); ctx.lineTo(r * .08, r * .46); ctx.stroke(); } // щёки надуты, рот сжат
  else if (o.cough) { ctx.fillStyle = '#4a1e24'; ctx.beginPath(); ctx.ellipse(0, r * .45, r * .14, r * .12, 0, 0, Math.PI * 2); ctx.fill(); }
  else if (o.gasp) { ctx.fillStyle = '#4a1e24'; ctx.beginPath(); ctx.ellipse(0, r * .47, r * .12, r * .16 * (.8 + .2 * Math.sin(o.gasp * 9)), 0, 0, Math.PI * 2); ctx.fill(); }
  else { ctx.strokeStyle = T.ol; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(-r * .12, r * .45); ctx.quadraticCurveTo(0, r * (o.smile ? .55 : .47), r * .12, r * .45); ctx.stroke(); }
  ctx.restore(); }
function scarf(x, y, w, t) { ctx.save(); ctx.translate(x, y); rr(-w / 2, -w * .14, w, w * .3, w * .14); fillOL(SCARF, 5); ctx.fillStyle = 'rgba(255,255,255,.25)'; for (let i = -2; i <= 2; i++) ctx.fillRect(i * w * .16 - 4, -w * .12, 8, w * .26);
  ctx.save(); ctx.translate(w * .25, w * .1); ctx.rotate(.2 + Math.sin(t * 2) * .08); rr(-w * .08, 0, w * .16, w * .6, w * .06); fillOL(SCARF, 5); ctx.restore(); ctx.restore(); } // кисть шарфа развевается
function erasyl(x, y, s, t, o = {}) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); if (o.lean) ctx.rotate(o.lean); const kn = o.kneel || 0;
  if (!kn) for (const sx of [-1, 1]) { rr(sx * 26 - 18, -120, 36, 120, 16); fillOL('#2b3550', 5); ctx.beginPath(); ctx.ellipse(sx * 26, 0, 30, 14, 0, 0, Math.PI * 2); fillOL('#1a1a20', 5); }
  else { rr(-80, -60, 160, 60, 26); fillOL('#2b3550', 5); }
  const by = kn ? -60 : -120; rr(-72, by - 190, 144, 200, 44); fillOL(HOOD, 6); ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-30, by - 60); ctx.lineTo(30, by - 60); ctx.stroke(); // худи
  for (const sx of [-1, 1]) { const arm = sx < 0 ? o.armL : o.armR; if (arm) { const hp = AK.limb(sx * 60, by - 170, arm[0], arm[1], 74, 70, 36, HOOD, T.ol, SKIN); if (o.hold && sx > 0) o.hold(hp[0], hp[1]); continue; } /* руки с локтем (AK.limb) */
    ctx.save(); ctx.translate(sx * 60, by - 170); ctx.rotate(sx * (o.armUp ? -2.4 : .18) + (o.handsKnees ? sx * -.5 : 0)); rr(-18, 0, 36, 140, 16); fillOL(HOOD, 5); circle(0, 146, 17); fillOL(SKIN, 5); ctx.restore(); }
  const br = o.still ? 0 : AK.breathe(t, 3, 3); scarf(0, by - 190 + br * .5, 150, t); erasylHead(0, by - 270 + br, 80, { blink: AK.blink(t, 3), ...o }); ctx.restore(); }
// Ата: тюбетейка, ватная жилетка, седые усы. o: { kneel, look }
function ata(x, y, s, t, o = {}) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const kn = o.kneel || 0, by = kn ? -60 : -120;
  if (!kn) for (const sx of [-1, 1]) { rr(sx * 26 - 18, -120, 36, 120, 16); fillOL('#3b3a40', 5); } else { rr(-90, -60, 180, 60, 26); fillOL('#3b3a40', 5); }
  if (o.young) { ctx.beginPath(); ctx.moveTo(-80, by - 200); ctx.lineTo(80, by - 200); ctx.lineTo(96, by + 90); ctx.lineTo(-96, by + 90); ctx.closePath(); fillOL('#f2efe6', 6); ctx.strokeStyle = 'rgba(0,0,0,.2)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, by - 200); ctx.lineTo(0, by + 90); ctx.moveTo(-34, by - 200); ctx.lineTo(0, by - 120); ctx.lineTo(34, by - 200); ctx.stroke(); rr(30, by - 150, 36, 44, 4); ctx.stroke(); } // 1988: лабораторный халат
  else { rr(-78, by - 200, 156, 210, 40); fillOL('#e8e2d6', 6); rr(-82, by - 200, 66, 210, 24); fillOL('#7a5a3a', 5); rr(16, by - 200, 66, 210, 24); fillOL('#7a5a3a', 5); // рубаха + ватная жилетка
  ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 3; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-80, by - 180 + i * 34); ctx.lineTo(-18, by - 180 + i * 34); ctx.moveTo(18, by - 180 + i * 34); ctx.lineTo(80, by - 180 + i * 34); ctx.stroke(); } } // стёжка
  for (const sx of [-1, 1]) { const arm = sx < 0 ? o.armL : o.armR, sl = o.young ? '#f2efe6' : '#e8e2d6'; if (arm) { const hp = AK.limb(sx * 66, by - 180, arm[0], arm[1], 74, 70, 36, sl, T.ol, o.gloves ? '#3a4a5a' : '#d7a07a'); if (o.hold && sx > 0) o.hold(hp[0], hp[1]); continue; }
    ctx.save(); ctx.translate(sx * 66, by - 180); ctx.rotate(sx * .25 + (o.reach ? sx * -.9 : 0)); rr(-18, 0, 36, 140, 16); fillOL(sl, 5); circle(0, 146, 17); fillOL('#d7a07a', 5); ctx.restore(); }
  ataHead(0, by - 280 + (o.still ? 0 : AK.breathe(t, 5, 2.5)), 82, t, { blink: AK.blink(t, 5), ...o }); ctx.restore(); }
function ataHead(x, y, r, t, o = {}) { ctx.save(); ctx.translate(x, y); const lw = Math.max(4, r * .05); circle(0, 0, r); fillOL('#d7a07a', lw); circle(-r * .97, r * .1, r * .2); fillOL('#d7a07a', lw * .8);
  if (!o.young) { ctx.strokeStyle = 'rgba(120,70,50,.45)'; ctx.lineWidth = lw * .7; } else ctx.strokeStyle = 'rgba(0,0,0,0)'; for (const yy of [-.42, -.34]) { ctx.beginPath(); ctx.moveTo(-r * .4, r * yy); ctx.lineTo(r * .4, r * yy); ctx.stroke(); } // морщины
  const lk = (o.look || 0) * r * .1; for (const s2 of [-1, 1]) { const bl = Math.max(.08, o.blink ?? 1); ctx.fillStyle = T.ol; ctx.beginPath(); ctx.ellipse(s2 * r * .32 + lk, r * .02, r * .07, r * .07 * bl, 0, 0, Math.PI * 2); ctx.fill(); if (o.reflect && bl > .5) { ctx.fillStyle = `rgba(155,231,255,${o.reflect})`; circle(s2 * r * .32 + lk, r * .02, r * .045); ctx.fill(); } ctx.strokeStyle = o.young ? '#2a2020' : '#e9e6e0'; ctx.lineWidth = lw * 1.3; ctx.beginPath(); ctx.moveTo(s2 * r * .2, -r * .18); ctx.lineTo(s2 * r * .46, -r * .14); ctx.stroke(); } // седые брови
  ctx.fillStyle = o.young ? '#2a2020' : '#ecebe6'; ctx.beginPath(); ctx.moveTo(-r * .38, r * .42); ctx.quadraticCurveTo(0, r * .22, r * .38, r * .42); ctx.quadraticCurveTo(r * .2, r * .52, 0, r * .4); ctx.quadraticCurveTo(-r * .2, r * .52, -r * .38, r * .42); ctx.fill(); // седые усы
  if (o.mouth > 0) { ctx.fillStyle = '#4a1e24'; ctx.beginPath(); ctx.ellipse(0, r * .55, r * .13, r * .03 + r * .11 * o.mouth, 0, 0, Math.PI * 2); ctx.fill(); } // рот по огибающей голоса (tools/mouth.py)
  if (o.young) { ctx.beginPath(); ctx.arc(0, 0, r * 1.02, Math.PI * 1.05, Math.PI * 1.95); ctx.quadraticCurveTo(0, -r * .5, -r * .98, -r * .2); ctx.closePath(); fillOL('#1a1416', lw); } else if (o.hat !== false) tubeteika(0, -r * .62, r * 1.1);
  if (o.mouth === 'open') { ctx.fillStyle = '#4a1e24'; ctx.beginPath(); ctx.ellipse(0, r * .55, r * .13, r * .1, 0, 0, Math.PI * 2); ctx.fill(); } else if (o.mouth === 'laugh') { ctx.fillStyle = '#4a1e24'; ctx.beginPath(); ctx.arc(0, r * .5, r * .18, 0, Math.PI); ctx.fill(); } ctx.restore(); } // рот по голосу
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
function FloatObjects(t, items, lift, drop = 0) { for (const [x, y, kind, s2, ph] of items) { const up = E.out(lift) * (120 + ph * 60) * (1 - AK.drop(clamp(drop * (1 + ph * .3)), 2)), a = (t * .4 + ph) * (1 - drop) + ph * 3; /* падают с отскоками, не одновременно */ ctx.save(); ctx.translate(x + Math.sin(t * .5 + ph) * 10 * lift, y - up); ctx.rotate(a * lift);
    if (kind === 'bolt') { rr(-s2 * .18, -s2, s2 * .36, s2 * 2, 4); fillOL('#8a8f98', 3); rr(-s2 * .4, -s2 * 1.1, s2 * .8, s2 * .35, 4); fillOL('#6b707a', 3); }
    else if (kind === 'rock') { ctx.beginPath(); ctx.ellipse(0, 0, s2, s2 * .7, ph, 0, Math.PI * 2); fillOL('#7a6a5a', 3); }
    else if (kind === 'plate') { rr(-s2, -s2 * .4, s2 * 2, s2 * .8, 4); fillOL('#b9bec6', 3); }
    ctx.restore(); } }
E.in2 = k => k * k;

// ════════ серия 2 «1988» ════════
// архив 1988: сепия с голубым в тенях, зерно ~12%, скруглённая рамка с датой (ArchiveFrame из ТЗ)
function ArchiveFrame(t, date = '15.11.1988', k = 1) { if (k <= 0) return; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = k;
  ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = 'rgb(128,128,128)'; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = '#e8cfa0'; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = 'rgba(40,80,110,.25)'; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = .12 * k; ctx.drawImage(GRAIN[Math.floor(t * 12) % GRAIN.length], 0, 0, W, H);
  ctx.globalAlpha = k; ctx.globalCompositeOperation = 'source-over'; ctx.strokeStyle = '#efe2c4'; ctx.lineWidth = 22; rr(30, 160, W - 60, 1680, 40); ctx.stroke(); ctx.strokeStyle = 'rgba(60,40,20,.6)'; ctx.lineWidth = 4; rr(44, 174, W - 88, 1652, 32); ctx.stroke();
  if (Math.floor(t * 8) % 7 === 0) { ctx.fillStyle = 'rgba(255,240,210,.08)'; ctx.fillRect(0, 0, W, H); } // мерцание плёнки
  ctx.restore(); }
// шаттл «Буран» силуэтом без надписей: delta-крыло, чёрный низ и нос из плиток, белый верх
function shuttle(x, y, s, rot = 0, { tiles = 1 } = {}) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-40, -260); ctx.lineTo(-40, 120); ctx.lineTo(-210, 230); ctx.lineTo(-200, 270); ctx.lineTo(200, 270); ctx.lineTo(210, 230); ctx.lineTo(40, 120); ctx.lineTo(40, -260); ctx.quadraticCurveTo(0, -330, -40, -260); ctx.closePath(); fillOL('#ececea', 6); // корпус и крылья
  ctx.fillStyle = T.tile; ctx.beginPath(); ctx.moveTo(-40, -250); ctx.quadraticCurveTo(0, -330, 40, -250); ctx.lineTo(30, -220); ctx.lineTo(-30, -220); ctx.closePath(); ctx.fill(); // чёрный нос
  ctx.beginPath(); ctx.moveTo(-200, 270); ctx.lineTo(-180, 240); ctx.lineTo(180, 240); ctx.lineTo(200, 270); ctx.closePath(); ctx.fill(); // кромка крыла
  if (tiles) { ctx.strokeStyle = 'rgba(0,0,0,.18)'; ctx.lineWidth = 2; for (let i = -6; i <= 6; i++) { ctx.beginPath(); ctx.moveTo(i * 30, 140); ctx.lineTo(i * 30, 240); ctx.stroke(); } }
  ctx.beginPath(); ctx.moveTo(-14, 150); ctx.lineTo(0, 40); ctx.lineTo(14, 150); ctx.closePath(); fillOL('#ececea', 4); // киль
  for (const sx of [-1, 1]) { ctx.fillStyle = '#2a3a4a'; rr(sx * 10 - 8, -220, 16, 22, 4); ctx.fill(); } ctx.restore(); } // окна кабины
function launchPad(t, { steam = 1 } = {}) { steppeSky(t, 0); hills(1250, '#9a8a7a', 4, 60); steppeGround(1300, t);
  ctx.fillStyle = '#5a5a60'; ctx.fillRect(140, 300, 60, 1000); for (let i = 0; i < 12; i++) { ctx.strokeStyle = '#3a3a40'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(140, 320 + i * 80); ctx.lineTo(200, 380 + i * 80); ctx.stroke(); } // башня обслуживания
  for (const [bx, w2] of [[440, 90], [560, 110], [680, 90]]) { rr(bx - w2 / 2, 380, w2, 900, 40); fillOL(bx === 560 ? '#e8e2d0' : '#d8d0b8', 6); } // ракета-носитель: центральный блок и боковые
  shuttle(740, 760, 1.05, 0); if (steam) for (let i = 0; i < 4; i++) AK.smoke(380 + i * 140, 1320, t + i, { k: steam, rgb: '235,235,230', h: 500, n: 10, wind: -20, size: 1.2, seed: 5 + i }); }
// небо над облаками и шаттл без экипажа
function skyFlight(t, prog = 0) { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0b1f3a'); g.addColorStop(.55, '#3d8fd1'); g.addColorStop(1, '#e8f4f8'); ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, H + 600);
  for (let i = 0; i < 9; i++) { const x = ((i * 260 - prog * 900) % 1600 + 1600) % 1600 - 300; AK.puff(x, 1450 + (i % 3) * 120, 260, '255,255,255', .9); } // облака уносятся назад
  shuttle(540, 820, .95, -1.4 + Math.sin(t * .8) * .03); glow(300, 820, 260, 'rgba(255,240,210,.25)'); }
// RadarScreen: отметка уходит влево и пропадает
function RadarScreen(t, t0, lostAt) { ctx.fillStyle = '#081410'; ctx.fillRect(-300, -300, W + 600, H + 600); const cx = 540, cy = 860, R = 430;
  circle(cx, cy, R + 30); fillOL('#1a2a22', 10); circle(cx, cy, R); ctx.fillStyle = '#04150c'; ctx.fill(); ctx.strokeStyle = 'rgba(61,220,132,.35)'; ctx.lineWidth = 3; for (const k of [.33, .66, 1]) { circle(cx, cy, R * k); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy); ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy + R); ctx.stroke();
  const sw = (t * 2.2) % (Math.PI * 2); ctx.save(); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, sw - .6, sw); ctx.closePath(); const gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R); gg.addColorStop(0, 'rgba(61,220,132,.05)'); gg.addColorStop(1, 'rgba(61,220,132,.35)'); ctx.fillStyle = gg; ctx.fill(); ctx.restore();
  const path = u => [cx + 260 - u * 120 - Math.max(0, u - .55) * 520, cy - 300 + u * 380]; // курс на полосу, потом резкий уход влево
  const u = clamp((t - t0) / (lostAt - t0)); for (let i = 0; i < 14; i++) { const uu = u - i * .02; if (uu < 0) break; const [px, py] = path(uu); ctx.fillStyle = `rgba(61,220,132,${.9 - i * .06})`; circle(px, py, 12 - i * .6); ctx.fill(); }
  if (t < lostAt || Math.floor(t * 6) % 2) { const [px, py] = path(u); if (t < lostAt) { glow(px, py, 60, 'rgba(61,220,132,.9)'); txt('БУРАН', px + 26, py - 26, 30, '#3ddc84', { font: 'Mont', weight: 900 }); } }
  rr(cx - 60, cy + 300, 120, 18, 6); ctx.fillStyle = 'rgba(61,220,132,.5)'; ctx.fill(); txt('ПОЛОСА', cx, cy + 345, 26, '#3ddc84', { font: 'Mont', weight: 800, align: 'center' }); } // посадочная полоса
// кухня вечером: лампа над столом, кесе, чайник
function kitchen(t, { lampSwing = 0 } = {}) { const g = ctx.createRadialGradient(540, 500, 80, 540, 700, 1300); g.addColorStop(0, '#e6c695'); g.addColorStop(.6, '#9a7350'); g.addColorStop(1, '#3a2a20'); ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, H + 600);
  rr(720, 320, 280, 380, 8); fillOL('#e9e4d8', 6); ctx.fillStyle = '#16244a'; ctx.fillRect(736, 336, 248, 348); snow(t, .4, 20, .4); // окно, вечер
  const a = Math.sin(t * 1.3) * .05 + lampSwing; ctx.save(); ctx.translate(500, 0); ctx.rotate(a); ctx.strokeStyle = T.ol; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 400); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-120, 480); ctx.lineTo(120, 480); ctx.lineTo(60, 400); ctx.lineTo(-60, 400); ctx.closePath(); fillOL('#c0392b', 6); glow(0, 500, 600, 'rgba(255,220,150,.45)'); ctx.restore();
  ctx.fillStyle = '#7a4e32'; ctx.fillRect(-300, 1080, W + 600, 70); ctx.fillStyle = '#5a3a24'; ctx.fillRect(-300, 1150, W + 600, H); // стол
  ctx.fillStyle = '#f4f1ea'; ctx.fillRect(-300, 1060, W + 600, 30); for (let i = 0; i < 18; i++) { ctx.fillStyle = i % 2 ? '#c0392b' : '#f4f1ea'; ctx.fillRect(-300 + i * 90, 1060, 45, 30); } } // скатерть
function kese(x, y, s = 1, tea = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(-60, -50); ctx.quadraticCurveTo(-56, 30, 0, 34); ctx.quadraticCurveTo(56, 30, 60, -50); ctx.closePath(); fillOL('#f4f1ea', 5); ctx.strokeStyle = '#2a6fb0'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-54, -24); ctx.quadraticCurveTo(0, -10, 54, -24); ctx.stroke(); // пиала с узором
  if (tea) { ctx.fillStyle = '#b5652a'; ctx.beginPath(); ctx.ellipse(0, -48, 56, 10, 0, 0, Math.PI * 2); ctx.fill(); } ctx.restore(); }
function steamRise(x, y, t, k = 1) { for (let i = 0; i < 3; i++) { const ph = (t * .45 + i / 3) % 1; ctx.strokeStyle = `rgba(255,255,255,${.45 * (1 - ph) * k})`; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(x - 20 + i * 20, y - ph * 120); ctx.quadraticCurveTo(x - 32 + i * 20 + Math.sin(t * 3 + i) * 14, y - 40 - ph * 120, x - 20 + i * 20, y - 80 - ph * 120); ctx.stroke(); } }
// грузовой отсек шаттла: рёбра, иней
function cargoBay(t) { ctx.fillStyle = '#1c2430'; ctx.fillRect(-300, -300, W + 600, H + 600); for (let i = 0; i < 7; i++) { const k = i / 6; ctx.strokeStyle = `rgba(200,220,240,${.15 + .25 * k})`; ctx.lineWidth = 10 + 20 * k; ctx.beginPath(); ctx.ellipse(540, 900, 300 + k * 520, 220 + k * 700, 0, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke(); } // рёбра отсека
  glow(540, 260, 700, 'rgba(255,250,230,.35)'); FrostOverlay(.6, { x: 0, y: 0, w: W, h: H }, 'edges', 23); }
// двор днём: белёная стена, синие рамы, дверь мастерской, ведро
function yard(t) { steppeSky(t, 0); ctx.fillStyle = '#efe8d8'; ctx.fillRect(-300, 300, W + 600, 950); ctx.strokeStyle = 'rgba(0,0,0,.08)'; ctx.lineWidth = 3; for (let y = 340; y < 1250; y += 60) { ctx.beginPath(); ctx.moveTo(-300, y); ctx.lineTo(W + 300, y); ctx.stroke(); }
  rr(80, 470, 260, 300, 8); fillOL('#2a6fb0', 8); ctx.fillStyle = '#9fd8f0'; ctx.fillRect(100, 490, 220, 260); // окно
  rr(700, 520, 260, 730, 6); fillOL('#5a4030', 6); rr(730, 560, 200, 60, 6); fillOL('#e9e4d8', 3); txt('УСТАХАНА', 830, 591, 28, T.ink, { font: 'Mont', weight: 900, align: 'center' }); // мастерская
  ctx.fillStyle = '#c9a26a'; ctx.fillRect(-300, 1250, W + 600, H); ctx.fillStyle = 'rgba(242,245,247,.85)'; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.ellipse(120 + i * 190, 1330 + (i % 2) * 140, 150, 20, 0, 0, Math.PI * 2); ctx.fill(); } }
function bucket(x, y, s = 1, level = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(-80, -150); ctx.lineTo(80, -150); ctx.lineTo(62, 0); ctx.lineTo(-62, 0); ctx.closePath(); fillOL('#9aa3b5', 6); ctx.strokeStyle = 'rgba(0,0,0,.2)'; ctx.lineWidth = 4; for (const yy of [-110, -60]) { ctx.beginPath(); ctx.moveTo(-74, yy); ctx.lineTo(74, yy); ctx.stroke(); }
  ctx.fillStyle = '#5aa8d8'; ctx.beginPath(); ctx.ellipse(0, -150 + (1 - level) * 60, 78, 16, 0, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = T.ol; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, -150, 84, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke(); ctx.restore(); }
// водяной шар: дрожит и переливается
function waterBall(x, y, r, t, ph = 0) { const wob = 1 + .07 * Math.sin(t * 7 + ph), g = ctx.createRadialGradient(x - r * .35, y - r * .35, r * .1, x, y, r); g.addColorStop(0, 'rgba(230,248,255,.95)'); g.addColorStop(.5, 'rgba(90,168,216,.75)'); g.addColorStop(1, 'rgba(30,100,160,.85)');
  ctx.save(); ctx.translate(x, y); ctx.scale(wob, 2 - wob); ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(11,26,42,.6)'; ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.beginPath(); ctx.ellipse(-r * .35, -r * .4, r * .18, r * .1, -.6, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
// мастерская ночью: выбитая дверь, пустая полка «1988»
function workshop(t, { beam = 1 } = {}) { ctx.fillStyle = '#121620'; ctx.fillRect(-300, -300, W + 600, H + 600); ctx.fillStyle = '#1a1f2c'; for (let i = 0; i < 9; i++) ctx.fillRect(i * 130, 300, 120, 1000);
  rr(560, 560, 420, 60, 6); fillOL('#6b4a32', 6); rr(560, 820, 420, 60, 6); fillOL('#6b4a32', 6); for (const [x, y, w2, h2, c] of [[600, 470, 60, 90, '#7a3b2b'], [680, 490, 40, 70, '#3b5a7a'], [880, 450, 70, 110, '#5a5a40']]) { rr(x, y, w2, h2, 4); fillOL(c, 4); } // полка, банки
  ctx.fillStyle = 'rgba(200,190,170,.25)'; ctx.fillRect(760, 760, 120, 60); rr(720, 900, 170, 52, 6); fillOL('#e9e4d8', 3); txt('1988', 805, 927, 36, T.ink, { font: 'JBM', weight: 800, align: 'center' }); // пыльный след от тетради
  ctx.save(); ctx.translate(120, 520); ctx.rotate(-.35); rr(0, 0, 300, 800, 6); fillOL('#4a3628', 6); ctx.restore(); // выбитая дверь висит
  glow(300, 700, 500, 'rgba(160,190,255,.12)'); }
function heptylStain(x, y, t, k = 1) { ctx.save(); ctx.translate(x, y); ctx.fillStyle = `rgba(255,107,26,${.75 * k})`; ctx.beginPath(); for (let i = 0; i <= 24; i++) { const a = i / 24 * Math.PI * 2, r = 150 + 40 * Math.sin(a * 5 + 1) + 20 * Math.sin(a * 11); i ? ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r * .55) : ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r * .55); } ctx.closePath(); ctx.fill();
  ctx.fillStyle = `rgba(255,200,120,${.5 * k})`; ctx.beginPath(); ctx.ellipse(-30, -10, 60, 20, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); AK.smoke(x, y, t, { k: .8 * k, rgb: '255,107,26', h: 520, n: 14, wind: 15, size: .8, seed: 9 }); }
