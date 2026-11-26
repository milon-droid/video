// Дом в разрезе: фон, этажи, лестница, предметы. Всё — функция времени t.
function broom(ctx, x, y, top) {          // x,y — щётка внизу; top — верх палки
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 10, top); stroke(ctx, 16); stroke(ctx, 9, ink(.5, .2, .7));
  ctx.beginPath(); ctx.moveTo(x - 50, y + 30); ctx.lineTo(x + 50, y + 30); ctx.lineTo(x + 26, y - 10); ctx.lineTo(x - 26, y - 10); ctx.closePath(); fill(ctx, ink(.2, .1, .9)); stroke(ctx, 5);
}
function guitar(ctx, P, G) {
  const up = P.gup || 0, cx = lerp(P.x + 20, P.x + 10, up), cy = lerp(G.hipY - 40, G.shY - 260, up), rot = lerp(-.45, -1.45, up);
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot);
  ctx.beginPath(); ctx.ellipse(40, 0, 82, 64, 0, 0, 7); fill(ctx, ink(.6, .05, .95)); stroke(ctx, 5);
  ctx.beginPath(); ctx.ellipse(-10, 0, 60, 50, 0, 0, 7); fill(ctx, ink(.6, .05, .95)); stroke(ctx, 5);
  ctx.beginPath(); ctx.arc(30, 0, 18, 0, 7); fill(ctx, OUT);
  rr(ctx, -260, -12, 250, 24, 5); fill(ctx, ink(.6, .3, .8)); stroke(ctx, 4);
  rr(ctx, -300, -18, 46, 36, 6); fill(ctx, ink(.6, .3, .8)); stroke(ctx, 4);
  ctx.restore();
}
function lampSwing(t) { let a = 0; for (const k of [...KNOCKS_UP, ...KNOCKS_ROOF]) { const u = t - k; if (u > 0 && u < 3) a += .22 * Math.exp(-u * 1.4) * Math.sin(u * 7); } return a; }
function knockFx(ctx, t, list, x, y, col) {   // штамп «KNOCK» и облачко пыли
  for (const k of list) { const u = t - k; if (u < 0 || u > .7) continue;
    const s = E.back(clamp(u / .12)), a = clamp((.7 - u) / .2);
    ctx.save(); ctx.globalAlpha = a; ctx.translate(x + (hash(k) - .5) * 160, y - u * 40); ctx.rotate((hash(k * 3) - .5) * .3); ctx.scale(s, s);
    ctx.font = '900 64px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    ctx.lineWidth = 14; ctx.strokeStyle = PAPER; ctx.strokeText('KNOCK', 0, 0); ctx.lineWidth = 5; ctx.strokeStyle = OUT; ctx.strokeText('KNOCK', 0, 0); ctx.fillStyle = col; ctx.fillText('KNOCK', 0, 0);
    ctx.restore();
  }
}
function dust(ctx, t, list, x, y) {
  for (const k of list) { const u = t - k; if (u < 0 || u > 1.2) continue;
    for (let i = 0; i < 5; i++) { const r = 20 + u * 60 * (.6 + hash(i + k) * .6), cx = x + (hash(i * 7 + k) - .5) * 260, cy = y + 30 + u * 140 * hash(i + 2);
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, ink(.2, .2, .3, .5 * (1 - u / 1.2))); g.addColorStop(1, ink(.2, .2, .3, 0)); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill(); } }
}
function windowR(ctx, y0, t) {            // окно в правой стене этажа
  const day = sky(t);
  ctx.fillStyle = ink(lerp(.35, .1, day), lerp(.95, .3, day), lerp(.15, .05, day)); ctx.fillRect(940, y0, 100, 360);
  if (rain(t)) for (let i = 0; i < 6; i++) { const yy = y0 + ((t * 900 + i * 61) % 360); ctx.beginPath(); ctx.moveTo(950 + i * 15, yy); ctx.lineTo(942 + i * 15, yy + 30); stroke(ctx, 3, ink(0, .3, 0)); }
  ctx.strokeStyle = OUT; ctx.lineWidth = 6; ctx.strokeRect(940, y0, 100, 360);
}
function room3(ctx, t) {                  // комната Мии
  ctx.fillStyle = ink(.18, .02, .12); ctx.fillRect(340, 0, 600, F3);
  for (let x = 360; x < 940; x += 80) { ctx.fillStyle = ink(.24, .03, .16); ctx.fillRect(x, 0, 30, F3); }
  windowR(ctx, 250, t);
  rr(ctx, 380, 600, 260, 140, 20); fill(ctx, ink(0, .5, .6)); stroke(ctx, 6);                     // кровать
  rr(ctx, 400, 560, 90, 60, 14); fill(ctx, PAPER); stroke(ctx, 5);
  for (const [x, h] of [[560, 140], [600, 90]]) { ctx.beginPath(); ctx.ellipse(x, 240 - h / 2, 22, h / 2, 0, 0, 7); fill(ctx, ink(0, .75, .9)); stroke(ctx, 4); }
  rr(ctx, 520, 240, 120, 18, 4); fill(ctx, ink(.5, .2, .7)); stroke(ctx, 4);                       // полка с растениями
  rr(ctx, 700, 120, 150, 190, 6); fill(ctx, ink(.9, 0, .3)); stroke(ctx, 5);
  ctx.font = '900 34px Inter'; ctx.textAlign = 'center'; ctx.fillStyle = PAPER; ctx.fillText('DANCE', 775, 225);
}
function room2(ctx, t, ak) {              // комната Лео (ak — сколько прошло лет 0..1)
  ctx.fillStyle = ink(.05, .24, .18); ctx.fillRect(340, 900, 600, F2 - 900);
  for (let x = 360; x < 940; x += 80) { ctx.fillStyle = ink(.08, .3, .22); ctx.fillRect(x, 900, 30, F2 - 900); }
  windowR(ctx, 1150, t);
  if (ak === 0) { rr(ctx, 380, 1520, 140, 240, 10); fill(ctx, ink(.6, .9, .5)); stroke(ctx, 6); ctx.beginPath(); ctx.arc(450, 1600, 40, 0, 7); stroke(ctx, 6, PAPER);   // усилитель
    rr(ctx, 700, 1000, 160, 120, 6); fill(ctx, ink(0, 0, .9)); stroke(ctx, 5); ctx.font = '900 30px Inter'; ctx.textAlign = 'center'; ctx.fillStyle = OUT; ctx.fillText('ROCK', 780, 1072); }
  // лампа на шнуре — качается от стука сверху
  const a = lampSwing(t); ctx.save(); ctx.translate(650, 900); ctx.rotate(a);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 150); stroke(ctx, 5);
  ctx.beginPath(); ctx.moveTo(-50, 200); ctx.lineTo(50, 200); ctx.lineTo(25, 150); ctx.lineTo(-25, 150); ctx.closePath(); fill(ctx, ink(.6, 0, 1)); stroke(ctx, 5);
  ctx.globalCompositeOperation = 'multiply'; const g = ctx.createRadialGradient(0, 210, 10, 0, 300, 450); g.addColorStop(0, ink(.5, .15, 1)); g.addColorStop(1, ink(1, 1, 1));
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-50, 200); ctx.lineTo(50, 200); ctx.lineTo(320, 860); ctx.lineTo(-320, 860); ctx.fill(); ctx.globalCompositeOperation = 'source-over';
  ctx.restore();
}
function stairs(ctx) {
  ctx.fillStyle = ink(.1, .15, .3); ctx.fillRect(0, -40, 340, 1840);
  const step = (x0, y0, x1, y1) => { const n = 10; ctx.beginPath(); ctx.moveTo(x0, y0); for (let i = 1; i <= n; i++) { const x = lerp(x0, x1, i / n), y = lerp(y0, y1, i / n); ctx.lineTo(lerp(x0, x1, (i - 1) / n) + (x1 - x0) / n, lerp(y0, y1, (i - 1) / n)); ctx.lineTo(x, y); } ctx.lineTo(x1, y1 + 40); ctx.lineTo(x0, y0 + 40); ctx.closePath(); fill(ctx, ink(.45, .2, .6)); stroke(ctx, 5); };
  step(330, F2, 40, 1330); step(40, 1330, 330, F3);
  rr(ctx, 0, 1330, 210, 40, 4); fill(ctx, ink(.5, .25, .65)); stroke(ctx, 5);                         // площадка
  ctx.beginPath(); ctx.moveTo(330, F2 - 120); ctx.lineTo(40, 1210); ctx.moveTo(40, 1210); ctx.lineTo(330, F3 - 120); stroke(ctx, 8, ink(.6, .9, .4));
  rr(ctx, 20, 1000, 70, 200, 6); fill(ctx, ink(.1, .45, .1)); stroke(ctx, 5);                         // окно на лестнице
}
function shell(ctx, t) {                  // внешняя рамка дома, перекрытия, соседние этажи
  const day = sky(t);
  ctx.fillStyle = ink(lerp(.4, .1, day), lerp(1, .35, day), lerp(.2, .08, day)); ctx.fillRect(-1200, -1500, 3400, 5200);
  if (rain(t)) for (let i = 0; i < 60; i++) { const x = -800 + hash(i) * 2800, y = ((t * 1400 + hash(i + 9) * 3000) % 3600) - 1000; if (x > -40 && x < 1040) continue; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 14, y + 60); stroke(ctx, 4, ink(0, .25, 0)); }
  ctx.fillStyle = ink(.5, .2, .55); ctx.fillRect(-40, -940, 1080, 3640);                            // кирпич
  for (let y = -930; y < 2700; y += 50) for (let x = -40 + ((y / 50) % 2) * 40; x < 1040; x += 80) { ctx.fillStyle = ink(.6, .26, .65); ctx.fillRect(x, y, 70, 8); }
  ctx.fillStyle = ink(.25, .5, .3); ctx.fillRect(340, -900, 600, 860); ctx.fillRect(340, 1800, 600, 860);   // этажи 4 и 1 — темно
  for (const y of [-40, F3, F2]) { ctx.fillStyle = ink(.55, .45, .6); ctx.fillRect(-40, y, 1080, 40); ctx.strokeStyle = OUT; ctx.lineWidth = 5; ctx.strokeRect(-40, y, 1080, 40); }
}
// записка на верёвке за окном
function note(ctx, x, y, txt, s = 1) {
  ctx.beginPath(); ctx.moveTo(x, y - 700); ctx.lineTo(x, y); stroke(ctx, 3, OUT);
  ctx.save(); ctx.translate(x, y + 40 * s); ctx.rotate(Math.sin(CUR_T * 3) * .06); rr(ctx, -70 * s, -40 * s, 140 * s, 90 * s, 4); fill(ctx, PAPER); stroke(ctx, 4);
  ctx.font = `900 ${18 * s}px Inter`; ctx.textAlign = 'center'; ctx.fillStyle = ink(1, .05, .6); txt.split('\n').forEach((l, i, a) => ctx.fillText(l, 0, (i - (a.length - 1) / 2) * 22 * s + 6 * s)); ctx.restore();
}
