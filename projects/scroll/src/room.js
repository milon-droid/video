// Комната от первого лица и телефон в руках. Мир 1080×1920 (как экран), экран телефона R0.
const R0 = { x: 325, y: 968, w: 430, h: 764 };
function roomPOV(ctx, t, ra) {
  const spin = lapse(t), day = spin ? .5 + .5 * Math.sin(t * 9) : (t > 33 ? .7 : 0);
  ctx.fillStyle = ink(lerp(.25, .4, ra), lerp(.55, .45, ra), lerp(.15, .45, ra)); ctx.fillRect(-200, -200, 1480, 1700);      // стена (темнеет и желтеет)
  ctx.fillStyle = ink(.45, .3, .6); ctx.fillRect(-200, 1480, 1480, 640);                                                  // пол
  // окно: день/ночь мелькают, сезоны
  rr(ctx, 640, 360, 380, 520, 8); fill(ctx, ink(.5, .3, .6)); stroke(ctx, 7);
  ctx.fillStyle = ink(lerp(.4, .05, day), lerp(1, .3, day), lerp(.2, .05, day)); ctx.fillRect(662, 382, 336, 476);
  const sea = Math.floor(ra * 40) % 4; ctx.fillStyle = [ink(.4, 0, .1), ink(0, .7, .9), ink(.7, .05, .95), PAPER][spin ? sea : 0];
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(700 + i * 80, 820 - (i % 2) * 30, 60, 0, 7); ctx.fill(); }
  const sky = Math.floor(ra * 8); for (let i = 0; i < 2 + sky; i++) { ctx.fillStyle = ink(.6, 1, .5, .7); const h = 120 + hash(i) * 260; ctx.fillRect(670 + (i * 47) % 300, 858 - h, 40, h); }   // город растёт
  ctx.fillStyle = ink(.5, .3, .6); ctx.fillRect(820, 382, 12, 476);
  // часы
  ctx.beginPath(); ctx.arc(480, 300, 80, 0, 7); fill(ctx, PAPER); stroke(ctx, 7);
  const hm = spin ? t * 40 : 0.05 + t * .002, hh = spin ? t * 3.3 : 0;
  ctx.beginPath(); ctx.moveTo(480, 300); ctx.lineTo(480 + Math.sin(hm) * 62, 300 - Math.cos(hm) * 62); ctx.moveTo(480, 300); ctx.lineTo(480 + Math.sin(hh) * 40, 300 - Math.cos(hh) * 40); stroke(ctx, 7);
  // календарь: год
  rr(ctx, 380, 450, 200, 220, 6); fill(ctx, PAPER); stroke(ctx, 6); ctx.fillStyle = NEON; ctx.fillRect(380, 450, 200, 50);
  ctx.font = '900 60px Inter'; ctx.textAlign = 'center'; ctx.fillStyle = OUT; ctx.fillText(String(2026 + Math.floor(ra * 47)), 480, 610);
  // полка с цветком (вянет)
  rr(ctx, 120, 760, 220, 20, 4); fill(ctx, ink(.5, .2, .7)); stroke(ctx, 5);
  const wilt = clamp(ra / .45), dead = ra > .5;
  ctx.beginPath(); ctx.moveTo(150, 760); ctx.lineTo(310, 760); ctx.lineTo(290, 680); ctx.lineTo(170, 680); ctx.closePath(); fill(ctx, ink(.6, .08, .8)); stroke(ctx, 5);
  for (const [dx, a] of [[-30, -.5], [0, 0], [30, .5]]) { ctx.save(); ctx.translate(230 + dx, 680); ctx.rotate(a + wilt * 1.6 * Math.sign(a || 1)); ctx.beginPath(); ctx.ellipse(0, -60, 18, 60, 0, 0, 7); fill(ctx, dead ? ink(.6, .5, .85) : ink(0, .75, .9)); stroke(ctx, 4); ctx.restore(); }
  // дверь и пёс
  rr(ctx, 40, 420, 300, 1060, 8); fill(ctx, ink(.55, .25, .7)); stroke(ctx, 7); ctx.beginPath(); ctx.arc(300, 980, 16, 0, 7); fill(ctx, NEON_Y); stroke(ctx, 4);
  ctx.beginPath(); ctx.moveTo(330, 640); ctx.lineTo(330, 700); stroke(ctx, 8);                                          // крючок
  if (ra < .7) dog(ctx, 190, 1480, ra, t); else { ctx.beginPath(); ctx.moveTo(330, 700); ctx.quadraticCurveTo(360, 820, 320, 900); stroke(ctx, 14, NEON); }   // остался только поводок
  ctx.beginPath(); ctx.ellipse(110, 1470, 60, 18, 0, 0, 7); fill(ctx, ink(.1, .9, .1)); stroke(ctx, 5);                   // миска
  // паутина
  if (ra > .6) { ctx.globalAlpha = clamp((ra - .6) * 3); for (const [x, y, s] of [[-10, -10, 1], [1090, -10, -1]]) for (let i = 1; i < 5; i++) { ctx.beginPath(); ctx.arc(x, y, i * 60, s > 0 ? 0 : Math.PI / 2, s > 0 ? Math.PI / 2 : Math.PI); stroke(ctx, 3, PAPER); } ctx.globalAlpha = 1; }
  // журнальный стол: коробки пиццы, торт
  rr(ctx, -40, 1560, 1160, 60, 8); fill(ctx, ink(.5, .2, .75)); stroke(ctx, 6);
  const boxes = Math.min(7, Math.floor(ra * 14)); for (let i = 0; i < boxes; i++) { rr(ctx, 780 + (i % 2) * 14, 1500 - i * 36, 260, 36, 4); fill(ctx, ink(.1, .05, .5)); stroke(ctx, 4); }
  if (ra > .25) { const melt = clamp((ra - .25) / .25); rr(ctx, 40, 1440, 220, 120, 14); fill(ctx, PAPER); stroke(ctx, 5); ctx.fillStyle = NEON; ctx.fillRect(40, 1480, 220, 14);
    for (let i = 0; i < 5; i++) { const h = 70 * (1 - melt) + 8; ctx.fillStyle = ink(0, .7, .1); ctx.fillRect(70 + i * 38, 1440 - h, 10, h); if (melt < 1) { ctx.beginPath(); ctx.ellipse(75 + i * 38, 1430 - h, 7, 13, 0, 0, 7); fill(ctx, ink(.6, 0, 1)); } } }
}
function dog(ctx, x, y, ra, t) {
  const old = ra > .45, lying = ra > .15, wag = lying ? 0 : Math.sin(t * 12) * .5, col = old ? ink(.25, .3, .3) : ink(.55, .2, .85);
  ctx.save(); ctx.translate(x, y);
  if (!lying) {
    ctx.beginPath(); ctx.ellipse(0, -110, 80, 110, 0, 0, 7); fill(ctx, col); stroke(ctx, 6);
    ctx.save(); ctx.translate(60, -60); ctx.rotate(wag - .8); ctx.beginPath(); ctx.ellipse(0, -40, 12, 45, 0, 0, 7); fill(ctx, col); stroke(ctx, 5); ctx.restore();
    ctx.beginPath(); ctx.arc(0, -250, 70, 0, 7); fill(ctx, col); stroke(ctx, 6);
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * 62, -260, 22, 46, s * .3, 0, 7); fill(ctx, ink(.75, .4, .9)); stroke(ctx, 5); ctx.beginPath(); ctx.arc(s * 24, -262, 9, 0, 7); fill(ctx, OUT); }
    ctx.beginPath(); ctx.ellipse(0, -220, 18, 12, 0, 0, 7); fill(ctx, OUT);
    ctx.beginPath(); ctx.moveTo(-40, -205); ctx.quadraticCurveTo(-10, -170, 40, -205); stroke(ctx, 14, NEON);           // поводок в зубах
    ctx.beginPath(); ctx.moveTo(40, -205); ctx.quadraticCurveTo(120, -120, 80, -20); stroke(ctx, 10, NEON);
  } else {
    ctx.beginPath(); ctx.ellipse(0, -55, 140, 60, 0, 0, 7); fill(ctx, col); stroke(ctx, 6);
    ctx.beginPath(); ctx.arc(-110, -70, 60, 0, 7); fill(ctx, col); stroke(ctx, 6);
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(-110 + s * 50, -70, 18, 40, s * .3, 0, 7); fill(ctx, ink(.75, .4, .9)); stroke(ctx, 5); }
    ctx.beginPath(); ctx.moveTo(-135, -75); ctx.lineTo(-115, -70); ctx.moveTo(-95, -75); ctx.lineTo(-75, -70); stroke(ctx, 5);   // глаза закрыты/грустные
  }
  ctx.restore();
}
function phone(ctx, t, ra, drawScreen, z = 0) {
  rr(ctx, R0.x - 24, R0.y - 40, R0.w + 48, R0.h + 80, 50); fill(ctx, ink(.75, 1, .7)); stroke(ctx, 7);
  ctx.save(); ctx.beginPath(); ctx.rect(R0.x, R0.y, R0.w, R0.h); ctx.clip(); drawScreen(); ctx.restore();
  if (z > .9) return;
  // руки: левая держит, правый большой палец свайпает
  const skin = ra > .6 ? ink(.35, .12, .45) : SKIN, f = feedAt(t), th = f.sw > 0 ? f.sw : 0;
  for (const [x, y] of [[R0.x - 30, R0.y + R0.h - 60], [R0.x + R0.w + 30, R0.y + R0.h - 40]]) { ctx.beginPath(); ctx.ellipse(x, y + 120, 110, 160, 0, 0, 7); fill(ctx, skin); stroke(ctx, 7); }
  ctx.beginPath(); ctx.ellipse(R0.x + R0.w - 70, R0.y + R0.h - 120 - th * 260, 40, 70, -.4, 0, 7); fill(ctx, skin); stroke(ctx, 6);   // палец
  if (ra > .6) for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(R0.x - 60 + hash(i) * 80, R0.y + R0.h + 40 + hash(i + 3) * 120, 8, 0, 7); fill(ctx, ink(.6, .3, .6)); }   // пятна на старых руках
  for (const s of [-1, 1]) { ctx.fillStyle = ink(.2, .7, .1); ctx.fillRect(s < 0 ? R0.x - 150 : R0.x + R0.w + 40, R0.y + R0.h + 180, 110, 200); }   // рукава
}
// крупно лицо, освещённое телефоном
function faceShot(ctx, ra, t) {
  ctx.fillStyle = ink(.7, 1, .6); ctx.fillRect(-200, -200, 1480, 2400);
  const P = { x: 540, y: 2900, R: 330, kind: 'man', age: 25 + ra * 50, outfit: 'tee', hair: ra > .5 ? 'grey' : 'short', hairCol: ra > .5 ? ink(.18, .32, .2) : ink(.7, .95, .7), browCol: ra > .5 ? ink(.18, .32, .2) : ink(.7, .95, .7), t, seed: 3, look: [0, .7], eye: .55, smile: 0, open: .1 };
  const G = drawPerson(ctx, P);
  if (ra > .3) { ctx.save(); ctx.translate(G.hc[0], G.hc[1]); ctx.scale(3.3, 3.3); ctx.globalAlpha = .9; ctx.beginPath(); ctx.moveTo(-90, 20); ctx.quadraticCurveTo(-80, 125, 0, 130); ctx.quadraticCurveTo(80, 125, 90, 20); ctx.quadraticCurveTo(40, 95, 0, 95); ctx.quadraticCurveTo(-40, 95, -90, 20); fill(ctx, P.hairCol); ctx.restore(); }   // борода
  for (const s of [-1, 1]) { const ex = G.hc[0] + s * 34 * 3.3, ey = G.hc[1] - 6 * 3.3 + 30; ctx.save(); ctx.translate(ex, ey); ctx.rotate(t * 6 * s); ctx.beginPath(); for (let a = 0; a < 14; a += .2) ctx.lineTo(Math.cos(a) * a * 2.2, Math.sin(a) * a * 2.2); stroke(ctx, 5, NEON); ctx.restore(); }   // спирали в глазах
  ctx.globalCompositeOperation = 'multiply'; const g = ctx.createRadialGradient(540, 1700, 50, 540, 1400, 1100); g.addColorStop(0, ink(.3, .4, 1)); g.addColorStop(1, ink(1, 1, 1)); ctx.fillStyle = g; ctx.fillRect(-200, -200, 1480, 2400); ctx.globalCompositeOperation = 'source-over';
}
