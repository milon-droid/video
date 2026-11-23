// Класс (начало), скамейка (конец), самолётик, записка, фон.
const SIDE_A = ['NO. BETTER.', 'IT GOES FAST.', 'HAVE FUN.', '— YOU, 80'], SIDE_B = ['HELLO, FUTURE ME!', 'ARE WE RICH?', 'ARE WE FAMOUS?', '— ME, 10'];
const NB = SIDE_B.join('').length, NA = SIDE_A.join('').length;

function handText(ctx, lines, x, y, size, col, reveal = 1e9, seed = 0, maxW = 1e9) {
  ctx.font = `900 ${size}px Inter`;
  const mw = Math.max(...lines.map(l => ctx.measureText(l).width)); if (mw > maxW) { size *= maxW / mw; ctx.font = `900 ${size}px Inter`; } ctx.textBaseline = 'middle'; ctx.fillStyle = col;
  let n = 0;
  lines.forEach((l, li) => {
    const w = ctx.measureText(l).width; let cx = x - w / 2;
    for (const ch of l) {
      if (n++ >= reveal) return;
      const cw = ctx.measureText(ch).width, k = n + seed * 31;
      ctx.save(); ctx.translate(cx + cw / 2, y + li * size * 1.25 + (hash(k) - .5) * size * .12); ctx.rotate((hash(k + 7) - .5) * .16);
      ctx.fillText(ch, -cw / 2, 0); ctx.restore(); cx += cw * 1.02;
    }
  });
}
// лист: cx,cy — центр, w — ширина, flip 1/−1 (сторона), fold 0..1 (сворачивается в самолётик)
function sheet(ctx, cx, cy, w, side, flipX, fold, reveal = 1e9) {
  const h = w * .72, sx = flipX * (1 - fold * .8), sy = 1 - fold * .7;
  if (Math.abs(sx) < .02) return;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(sx, sy); ctx.rotate(fold * .6);
  rr(ctx, -w / 2, -h / 2, w, h, 4); fill(ctx, PAPER); stroke(ctx, w * .012);
  for (const fx of [-.25, 0, .25]) { ctx.beginPath(); ctx.moveTo(fx * w, -h / 2); ctx.lineTo(fx * w, h / 2); stroke(ctx, w * .004, ink(.1, .2, .05)); }
  if (flipX < 0) ctx.scale(-1, 1);
  if (fold < .5) handText(ctx, side === 'A' ? SIDE_A : SIDE_B, side === 'A' ? -w * .1 : 0, -h * .3, w * .11, side === 'A' ? ink(.15, 1, .1) : ink(1, .05, .6), reveal, side === 'A' ? 1 : 2, side === 'A' ? w * .64 : w * .86);
  if (fold < .5 && side === 'A' && reveal >= NA) doodle(ctx, w * .33, h * .1, w * .1);
  ctx.restore();
}
function doodle(ctx, x, y, r) {             // рисунок-подпись: старик с таким же вихром
  ctx.save(); ctx.translate(x, y); const c = ink(.15, 1, .1), L = r * .09;
  ctx.beginPath(); ctx.ellipse(0, 0, r * .85, r, 0, 0, 7); stroke(ctx, L, c);
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * r * .35, -r * .1, r * .22, 0, 7); stroke(ctx, L, c); ctx.beginPath(); ctx.arc(s * r * .9, -r * .35, r * .25, 0, 7); stroke(ctx, L, c); }
  ctx.beginPath(); ctx.moveTo(-r * .1, -r); ctx.quadraticCurveTo(0, -r * 1.6, r * .45, -r * 1.55); stroke(ctx, L * 1.2, ink(1, .05, .6));   // вихор
  ctx.beginPath(); ctx.arc(0, r * .35, r * .3, .2, Math.PI - .2); stroke(ctx, L, c);
  ctx.restore();
}
function pen(ctx, x, y) { ctx.save(); ctx.translate(x, y); ctx.rotate(.5); rr(ctx, -6, -60, 12, 64, 4); fill(ctx, ink(0, .9, .1)); stroke(ctx, 3); ctx.restore(); }
function plane(ctx, x, y, L, ang, bank, dir = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(dir, 1);
  const wt = L * (.18 + .22 * Math.abs(Math.cos(bank)));
  ctx.beginPath(); ctx.moveTo(L * .55, 0); ctx.lineTo(-L * .45, -wt); ctx.lineTo(-L * .3, 0); ctx.closePath(); fill(ctx, PAPER); stroke(ctx, L * .025);
  ctx.beginPath(); ctx.moveTo(L * .55, 0); ctx.lineTo(-L * .45, L * .14); ctx.lineTo(-L * .3, 0); ctx.closePath(); fill(ctx, ink(.05, .18, .05)); stroke(ctx, L * .025);
  ctx.beginPath(); ctx.moveTo(L * .55, 0); ctx.lineTo(-L * .3, 0); stroke(ctx, L * .02);
  ctx.restore();
}
function wake(ctx, pts) {                       // след ветра за самолётиком
  if (pts.length < 2) return;
  ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
  ctx.setLineDash([22, 26]); stroke(ctx, 7, ink(0, .45, .05)); ctx.setLineDash([]);
}

// ---------- класс ----------
function school(ctx, t, K) {
  facade(ctx, -200, 1600, 250, ink(.55, .12, .5), ink(.65, .2, .6));
  stamp(ctx, 'SCHOOL', 650, 330, 0, ink(.1, .9, .1), 70);
  window_(ctx, 160, 420, 980, 1100, ink(.05, .3, .22), () => {
    rr(ctx, 260, 500, 640, 330, 10); fill(ctx, ink(.4, 1, .65)); stroke(ctx, 7);                   // доска
    ctx.font = '700 44px Inter'; ctx.fillStyle = PAPER; ctx.textAlign = 'left'; ctx.fillText('2 + 2 = 4', 300, 580); ctx.fillText('NOV 23', 300, 650);
    ctx.beginPath(); ctx.arc(780, 640, 60, 0, 7); stroke(ctx, 5, PAPER); ctx.beginPath(); ctx.moveTo(780, 640); ctx.lineTo(780, 595); ctx.moveTo(780, 640); ctx.lineTo(815, 655); stroke(ctx, 5, PAPER);
    ctx.beginPath(); ctx.arc(1040, 560, 50, 0, 7); fill(ctx, PAPER); stroke(ctx, 5);                // часы
    drawPerson(ctx, { x: 1000, y: 1650, R: 88, kind: 'boy', age: 10, sit: 1, outfit: 'dress', hair: 'bun', t, seed: 4, smile: .3, look: [-.2, .8], hA: [950, 1395], hB: [1050 + Math.sin(t * 14) * 10, 1390] });   // соседка пишет
    drawPerson(ctx, K);
    rr(ctx, 260, 1390, 860, 40, 6); fill(ctx, ink(.45, .12, .72)); stroke(ctx, 6);                 // парта
    ctx.fillStyle = ink(.55, .2, .8); ctx.fillRect(280, 1430, 820, 120);
  });
  // распахнутая створка
  ctx.beginPath(); ctx.moveTo(1140, 420); ctx.lineTo(1330, 360); ctx.lineTo(1330, 1580); ctx.lineTo(1140, 1520); ctx.closePath(); fill(ctx, ink(.02, .12, .1, .9)); stroke(ctx, 7);
}
// ---------- скамейка ----------
function bench(ctx, t, O, W) {
  tree(ctx, BENCH_X - 520, PAPER, 9); tree(ctx, BENCH_X + 600, PAPER, 4);
  ctx.beginPath(); ctx.moveTo(BENCH_X + 380, GY); ctx.lineTo(BENCH_X + 380, 900); stroke(ctx, 22); stroke(ctx, 12, ink(.2, .6, .2));
  rr(ctx, BENCH_X + 330, 860, 100, 70, 10); fill(ctx, ink(0, 0, .9)); stroke(ctx, 6);                // фонарь
  for (const lx of [-300, 300]) { ctx.beginPath(); ctx.moveTo(BENCH_X + lx, GY); ctx.lineTo(BENCH_X + lx, 1490); stroke(ctx, 18); }
  rr(ctx, BENCH_X - 360, 1250, 720, 60, 10); fill(ctx, ink(.45, .12, .72)); stroke(ctx, 6);
  rr(ctx, BENCH_X - 360, 1330, 720, 50, 10); fill(ctx, ink(.45, .12, .72)); stroke(ctx, 6);
  ctx.beginPath(); ctx.ellipse(BENCH_X - 200, 1245, 120, 18, 0, 0, 7); fill(ctx, PAPER);             // снег на спинке
  drawPerson(ctx, W || wifePose(t));
  const G = drawPerson(ctx, O);
  ctx.beginPath(); ctx.moveTo(G.hc[0] - 80, G.shY - 6); ctx.quadraticCurveTo(G.hc[0], G.shY + 40, G.hc[0] + 80, G.shY - 6);   // шарф
  stroke(ctx, 44, OUT); stroke(ctx, 34, ink(.9, .05, .3));
  rr(ctx, BENCH_X - 360, 1470, 720, 50, 10); fill(ctx, ink(.45, .12, .72)); stroke(ctx, 6);
  const u = (t * .45) % 1;                                                                             // пар изо рта
  ctx.globalAlpha = .6 * Math.sin(u * Math.PI); ctx.beginPath(); ctx.arc(G.hc[0] - 40 - u * 80, G.hc[1] + 50 - u * 60, 18 + u * 30, 0, 7); fill(ctx, PAPER); ctx.globalAlpha = 1;
  return G;
}

// ---------- фон ----------
function background(ctx, cam, t) {
  const s = season(cam.cx), sk = skyAt(s), top = cam.cy - cam.vw * 8 / 9;
  ctx.fillStyle = ink(...sk); ctx.fillRect(cam.cx - cam.vw, top - 50, cam.vw * 2, GY - top + 60);
  // дальний город (параллакс .45)
  const k = .45, ox = cam.cx * (1 - k);
  ctx.save(); ctx.translate(ox, 0);
  const x0 = Math.floor((cam.cx * k - cam.vw) / 160) - 1;
  for (let i = x0; i < x0 + cam.vw / 80 + 4; i++) {
    const h = 250 + hash(i) * 380, bx = i * 160;
    ctx.fillStyle = ink(sk[0] + .12, sk[1] + .18, sk[2] + .08); ctx.fillRect(bx, GY - 120 - h, 150, h + 120);
    if (s > 1.5 && s < 2.5) for (let j = 0; j < 4; j++) if (hash(i * 5 + j) > .5) { ctx.fillStyle = ink(0, 0, .9); ctx.fillRect(bx + 30 + (j % 2) * 60, GY - h + 40 + Math.floor(j / 2) * 70, 24, 30); }
  }
  ctx.restore();
  if (s > 1.4 && s < 2.6) { const a = 1 - Math.abs(s - 2) / .6; for (let i = 0; i < 30; i++) { ctx.globalAlpha = clamp(a); star(ctx, cam.cx - cam.vw / 2 + hash(i) * cam.vw, top + hash(i + 9) * 700, 8, 0); fill(ctx, ink(0, 0, 1)); } ctx.globalAlpha = 1; }
}
function ground(ctx, cam) {
  const s = season(cam.cx), snow = sstep(3.5, 4, s);
  ctx.fillStyle = snow > .5 ? PAPER : ink(.25, .2, .45); ctx.fillRect(cam.cx - cam.vw, GY, cam.vw * 2, 120);
  ctx.fillStyle = ink(.5, .55, .5); ctx.fillRect(cam.cx - cam.vw, GY + 120, cam.vw * 2, 600);
  for (let x = Math.floor((cam.cx - cam.vw) / 300) * 300; x < cam.cx + cam.vw; x += 300) { ctx.fillStyle = snow > .5 ? ink(0, .15, 0) : ink(.1, .1, .6); ctx.fillRect(x, GY + 290, 160, 16); }
  ctx.beginPath(); ctx.moveTo(cam.cx - cam.vw, GY); ctx.lineTo(cam.cx + cam.vw, GY); stroke(ctx, 7);
}
function foreground(ctx, cam) {               // низкие кусты ближнего плана (параллакс 1.25) — не закрывают сцены
  const k = 1.25, ox = cam.cx * (1 - k), sn = season(cam.cx), col = sn > 3.6 ? PAPER : sn > 2.8 ? ink(.7, .1, .9) : ink(0, .75, .9);
  ctx.save(); ctx.translate(ox, 0);
  const i0 = Math.floor((cam.cx * k - cam.vw) / 520);
  for (let i = i0; i < i0 + cam.vw / 260 + 3; i++) {
    const x = i * 520 + hash(i) * 200, r = 90 + hash(i + 4) * 60;
    for (const [dx, dy, rr2] of [[-r * .7, 20, .8], [0, 0, 1], [r * .7, 25, .75]]) { ctx.beginPath(); ctx.arc(x + dx, GY + 300 + dy, r * rr2, 0, 7); fill(ctx, col); stroke(ctx, 7); }
  }
  ctx.restore();
}
function particles(ctx, cam, t) {             // лепестки / листья / снег — по сезону
  const s = season(cam.cx), top = cam.cy - cam.vw * 8 / 9, h = cam.vw * 16 / 9;
  const kind = s < .8 ? 0 : s < 2.8 ? -1 : s < 3.6 ? 1 : 2; if (kind < 0) return;
  const col = [ink(.6, 0, .1), ink(.7, .05, .95), PAPER][kind], n = [26, 22, 60][kind];
  for (let i = 0; i < n; i++) {
    const TAU = 2 * Math.PI / REAL_DUR, sp = Math.round([.12, .16, .1][kind] * REAL_DUR) / REAL_DUR, u = ((t * sp + hash(i)) % 1 + 1) % 1;   // всё периодично по длине ролика — петля без скачка
    const x = cam.cx - cam.vw / 2 + ((hash(i + 3) * cam.vw + Math.sin(t * TAU * 9 + i) * 60 - (kind === 2 ? 0 : (t / REAL_DUR) * cam.vw * 3)) % cam.vw + cam.vw) % cam.vw;
    const y = top + u * h, r = cam.vw * (kind === 2 ? .006 : .009) * (.6 + hash(i + 5));
    ctx.save(); ctx.translate(x, y); ctx.rotate(t * TAU * 14 + i);
    ctx.beginPath(); ctx.ellipse(0, 0, r, r * (kind === 2 ? 1 : .55), 0, 0, 7); fill(ctx, col); if (kind !== 2) stroke(ctx, r * .25);
    ctx.restore();
  }
}
