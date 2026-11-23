// Мир: «улица жизни» слева направо. Земля y=1600. Кварталы — возрасты героя. p — насколько самолётик прошёл квартал (0..1),
// поэтому при полёте назад сценки проигрываются задом наперёд.
const GY = 1600;
const BLOCKS = [
  { x0: 1500, w: 1500, age: 16, draw: bTeen },
  { x0: 3000, w: 1500, age: 22, draw: bGrad },
  { x0: 4500, w: 1600, age: 28, draw: bWedding },
  { x0: 6100, w: 1500, age: 34, draw: bNight },
  { x0: 7600, w: 1600, age: 45, draw: bBike },
  { x0: 9200, w: 1500, age: 62, draw: bRetire },
];
const BENCH_X = 11600;
// сезон по x: 0 весна, 1 лето, 2 ночь, 3 осень, 4 зима (плавно)
function season(x) {
  const k = [[0, 0], [4300, 0], [4700, 1], [6000, 1], [6300, 2], [7300, 2], [7700, 3], [9000, 3], [9500, 4], [99999, 4]];
  for (let i = 1; i < k.length; i++) if (x <= k[i][0]) return lerp(k[i - 1][1], k[i][1], sstep(k[i - 1][0], k[i][0], x));
  return 4;
}
const SKY = [[.12, .3, .05], [.05, .42, .25], [.45, .95, .15], [.3, .25, .55], [.1, .35, .06]];
function skyAt(s) { const i = Math.min(3, Math.floor(s)), u = s - i; return SKY[i].map((v, j) => lerp(v, SKY[i + 1][j], u)); }

function window_(ctx, x, y, w, h, light, drawIn) {
  rr(ctx, x - 18, y - 18, w + 36, h + 36, 8); fill(ctx, ink(.55, .2, .7)); stroke(ctx, 6);
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.fillStyle = light; ctx.fillRect(x, y, w, h);
  drawIn();
  ctx.restore();
  ctx.strokeStyle = OUT; ctx.lineWidth = 6; ctx.strokeRect(x, y, w, h);
}
function facade(ctx, x, w, top, col, pat) {
  ctx.fillStyle = col; ctx.fillRect(x, top, w, GY - top);
  if (pat) for (let yy = top + 30; yy < GY; yy += 60) for (let xx = x + ((yy / 60) % 2) * 50; xx < x + w; xx += 100) { ctx.fillStyle = pat; ctx.fillRect(xx, yy, 90, 8); }
  ctx.strokeStyle = OUT; ctx.lineWidth = 7; ctx.strokeRect(x, top, w, GY - top);
}
function stamp(ctx, txt, x, y, r, col, size) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(r); ctx.font = `900 ${size}px Inter`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(txt).width + size * .6, h = size * 1.3;
  rr(ctx, -w / 2, -h / 2, w, h, size * .15); stroke(ctx, size * .1, col); ctx.fillStyle = col; ctx.fillText(txt, 0, size * .05); ctx.restore();
}

// ---------- кварталы ----------
function bTeen(ctx, x0, p, t) {
  facade(ctx, x0 + 100, 1300, 520, ink(.35, 0, .2), ink(.45, .05, .28));
  ctx.beginPath(); ctx.moveTo(x0 + 50, 540); ctx.lineTo(x0 + 750, 220); ctx.lineTo(x0 + 1450, 540); fill(ctx, ink(.6, .5, .3)); stroke(ctx, 7);
  window_(ctx, x0 + 350, 720, 700, 620, ink(.05, 0, .35), () => {
    ctx.fillStyle = ink(.15, .5, .05); ctx.fillRect(x0 + 350, 720, 700, 620);
    rr(ctx, x0 + 820, 760, 150, 200, 6); fill(ctx, ink(1, 0, .2)); stroke(ctx, 5);                 // постер
    stamp(ctx, 'ROCK', x0 + 895, 860, -.1, PAPER, 40);
    rr(ctx, x0 + 380, 1200, 640, 160, 20); fill(ctx, ink(0, .6, .7)); stroke(ctx, 6);              // кровать
    const st = Math.sin(t * 14) * 18;
    const P = { x: x0 + 700, y: 1380, R: 62, kind: 'man', age: 16, sit: 1, outfit: 'tee', hair: 'mop', t, seed: 1,
      smile: .7, open: .3 + .2 * Math.abs(Math.sin(t * 7)), eye: .6, happyEyes: true, tilt: Math.sin(t * 3) * .12, look: [.3, -.3],
      hA: [x0 + 650, 1255], hB: [x0 + 745, 1290 + st], armsFront: true };
    drawPerson(ctx, P);
    ctx.save(); ctx.translate(x0 + 705, 1280); ctx.rotate(-.5);                                    // гитара
    ctx.beginPath(); ctx.ellipse(30, 0, 70, 55, 0, 0, 7); fill(ctx, ink(.6, .05, .95)); stroke(ctx, 5);
    ctx.beginPath(); ctx.arc(30, 0, 16, 0, 7); fill(ctx, OUT);
    rr(ctx, -160, -10, 170, 20, 4); fill(ctx, ink(.6, .3, .8)); stroke(ctx, 4); ctx.restore();
    drawArmsP(ctx, personGeom(P), P, OUTFIT.tee[0], 5);
  });
  for (let i = 0; i < 4; i++) {                                                                       // ноты летят из окна
    const u = ((t * .5 + i * .25) % 1), nx = x0 + 950 + u * 380 + Math.sin(u * 9 + i) * 30, ny = 760 - u * 380;
    ctx.globalAlpha = Math.sin(u * Math.PI); ctx.beginPath(); ctx.ellipse(nx, ny, 18, 13, -.4, 0, 7); fill(ctx, ink(1, .1, .9));
    ctx.beginPath(); ctx.moveTo(nx + 15, ny); ctx.lineTo(nx + 15, ny - 60); ctx.lineTo(nx + 40, ny - 45); stroke(ctx, 6, ink(1, .1, .9)); ctx.globalAlpha = 1;
  }
}
function bGrad(ctx, x0, p, t) {
  facade(ctx, x0 + 150, 1200, 900, ink(.1, .45, .35), ink(.15, .55, .45));
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { rr(ctx, x0 + 230 + c * 280, 1000 + r * 190, 170, 120, 6); fill(ctx, ink(.05, .2, .7)); stroke(ctx, 5); }
  const q = clamp((p - .25) / .55), capY = 900 - 300 - 700 * Math.sin(Math.PI * q), capX = x0 + 760 + q * 60;
  const P = { x: x0 + 700, y: 900, R: 58, kind: 'man', age: 22, outfit: 'gown', hair: 'mop', t, seed: 2, smile: 1, open: .5, look: [0, -1], brow: .8,
    hA: q > 0 && q < 1 ? [x0 + 640, 640] : [x0 + 640, 760], hB: q > 0 && q < .15 ? [x0 + 760, 600] : (q >= .85 || q === 0 ? [x0 + 760, 630] : [x0 + 790, 600]) };
  drawPerson(ctx, P);
  const G = personGeom(P);
  const cy = q > 0 && q < 1 ? capY : G.hc[1] - 95, cx = q > 0 && q < 1 ? capX : G.hc[0];
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(q * 12);
  ctx.beginPath(); ctx.moveTo(-70, 0); ctx.lineTo(0, -26); ctx.lineTo(70, 0); ctx.lineTo(0, 26); ctx.closePath(); fill(ctx, ink(.6, 1, .5)); stroke(ctx, 5);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(50, 40); stroke(ctx, 5, ink(0, 0, 1)); ctx.restore();
  for (const [fx, s] of [[x0 + 470, 3], [x0 + 930, 4]]) drawPerson(ctx, { x: fx, y: 900, R: 50, kind: 'woman', age: 22, outfit: 'gown', hair: s === 3 ? 'bun' : 'dark', t, seed: s, smile: 1, open: .4, look: [0, -1],
    hA: [fx - 60, 700 + Math.sin(t * 9 + s) * 20], hB: [fx + 60, 700 + Math.cos(t * 9 + s) * 20] });
}
function bWedding(ctx, x0, p, t) {
  const ax = x0 + 800;
  ctx.beginPath(); ctx.moveTo(ax - 300, GY); ctx.lineTo(ax - 300, 1050); ctx.arc(ax, 1050, 300, Math.PI, 0); ctx.lineTo(ax + 300, GY); stroke(ctx, 44); stroke(ctx, 30, ink(0, .7, .9));
  for (let i = 0; i < 26; i++) { const a = Math.PI + i * Math.PI / 25, r = 300; const fx = ax + Math.cos(a) * r, fy = 1050 + Math.sin(a) * r; ctx.beginPath(); ctx.arc(fx, fy, 22, 0, 7); fill(ctx, i % 2 ? ink(1, 0, .3) : PAPER); stroke(ctx, 4); }
  const kiss = sstep(.45, .7, p) * (1 - sstep(.92, 1, p));
  const groom = { x: ax - 110, y: GY, R: 58, kind: 'man', age: 28, outfit: 'suit', pants: ink(.55, 1, .45), hair: 'mop', t, seed: 5, smile: 1, eye: 1 - kiss, happyEyes: true, face: .7 * kiss, headDX: .5 * kiss, tilt: .2 * kiss, hB: [ax, 1320] };
  const bride = { x: ax + 110, y: GY, R: 56, kind: 'woman', age: 27, outfit: 'dress', hair: 'bun', t, seed: 6, smile: 1, eye: 1 - kiss, happyEyes: true, face: -.7 * kiss, headDX: -.5 * kiss, tilt: -.2 * kiss, hA: [ax, 1320] };
  drawPerson(ctx, groom); drawPerson(ctx, bride);
  const bg = personGeom(bride);                                                                    // фата
  ctx.globalAlpha = .7; ctx.beginPath(); ctx.moveTo(bg.hc[0] - 40, bg.hc[1] - 90); ctx.quadraticCurveTo(bg.hc[0] + 150, bg.hc[1], bg.hc[0] + 90, bg.hc[1] + 260); ctx.lineTo(bg.hc[0] + 40, bg.hc[1] - 60); fill(ctx, PAPER); ctx.globalAlpha = 1;
  if (kiss > .5) { ctx.globalAlpha = kiss; heart(ctx, ax, bg.hc[1] - 170 - kiss * 40, 34); ctx.globalAlpha = 1; }
  // гости — силуэты в первом ряду
  for (let i = 0; i < 6; i++) { const gx = x0 + 150 + i * 260 + (i > 2 ? 250 : 0); ctx.beginPath(); ctx.arc(gx, 1500, 60, 0, 7); ctx.rect(gx - 80, 1500, 160, 120); fill(ctx, ink(.5, .8, .5)); }
}
function heart(ctx, x, y, s) { ctx.beginPath(); ctx.moveTo(x, y + s); ctx.bezierCurveTo(x - s * 1.6, y - s * .2, x - s * .6, y - s * 1.3, x, y - s * .4); ctx.bezierCurveTo(x + s * .6, y - s * 1.3, x + s * 1.6, y - s * .2, x, y + s); fill(ctx, ink(1, 0, .4)); stroke(ctx, 4); }
function bNight(ctx, x0, p, t) {
  facade(ctx, x0 + 100, 1300, 520, ink(.4, .95, .3), ink(.45, 1, .35));
  ctx.beginPath(); ctx.moveTo(x0 + 50, 540); ctx.lineTo(x0 + 750, 250); ctx.lineTo(x0 + 1450, 540); fill(ctx, ink(.6, 1, .5)); stroke(ctx, 7);
  window_(ctx, x0 + 420, 700, 660, 620, ink(.1, 0, .75), () => {
    const sway = Math.sin(t * 2.2), yawn = sstep(.35, .5, p) * (1 - sstep(.6, .75, p));
    const P = { x: x0 + 750 + sway * 8, y: 1420, R: 60, kind: 'man', age: 34, outfit: 'pajama', pants: ink(.1, .55, 0), hair: 'mop', t, seed: 7,
      eye: .45 - yawn * .4, O: yawn, smile: yawn ? 0 : .3, tilt: sway * .07, look: [0, .8], hA: [x0 + 720, 1235], hB: [x0 + 790, 1225], armsFront: true };
    drawPerson(ctx, P);
    ctx.save(); ctx.translate(x0 + 755 + sway * 14, 1215); ctx.rotate(sway * .25);               // младенец в одеяле
    ctx.beginPath(); ctx.ellipse(0, 0, 80, 44, 0, 0, 7); fill(ctx, ink(.75, .05, .15)); stroke(ctx, 5);
    ctx.beginPath(); ctx.arc(-46, -6, 30, 0, 7); fill(ctx, SKIN); stroke(ctx, 4);
    const gig = sstep(.5, .6, p) * (1 - sstep(.8, .9, p));
    ctx.beginPath(); ctx.arc(-46, 2, 6 + gig * 5, 0, Math.PI); stroke(ctx, 3.5); ctx.restore();
  });
  ctx.beginPath(); ctx.arc(x0 + 1250, 300, 70, 0, 7); fill(ctx, ink(0, 0, 1)); ctx.beginPath(); ctx.arc(x0 + 1280, 285, 62, 0, 7); fill(ctx, ink(.4, .95, .15));
}
function bBike(ctx, x0, p, t) {
  tree(ctx, x0 + 250, ink(.75, .05, .95), 3);
  const let_ = .42, bx = x0 + 300 + p * 1050, wob = Math.sin(t * 9) * (p < let_ ? .02 : .08 * (1 - sstep(.7, 1, p)));
  // дочка на велосипеде
  ctx.save(); ctx.translate(bx, GY); ctx.rotate(wob);
  for (const wx of [-70, 70]) { ctx.beginPath(); ctx.arc(wx, -48, 46, 0, 7); stroke(ctx, 9); ctx.beginPath(); ctx.arc(wx, -48, 6, 0, 7); fill(ctx, OUT); }
  ctx.beginPath(); ctx.moveTo(-70, -48); ctx.lineTo(-10, -48); ctx.lineTo(30, -120); ctx.lineTo(-30, -120); ctx.lineTo(-10, -48); ctx.moveTo(30, -120); ctx.lineTo(70, -48); ctx.moveTo(30, -120); ctx.lineTo(40, -150); stroke(ctx, 10, ink(1, 0, .4));
  drawPerson(ctx, { x: -10, y: -40, R: 42, kind: 'girl', age: 6, sit: 1, outfit: 'stripes', hair: 'pig', t, seed: 8, smile: p > let_ ? 1 : .3, open: p > let_ ? .5 : 0, wide: p > let_ ? .5 : 0, hA: [25, -150], hB: [55, -150], legSwing: Math.sin(t * 9) * .2 });
  ctx.restore();
  // папа: бежит, держит сиденье, отпускает и радуется
  const dx = p < let_ ? bx - 140 : x0 + 300 + let_ * 1050 - 140 + (p - let_) * 120, run = p < let_;
  const cheer = sstep(let_ + .05, let_ + .15, p);
  drawPerson(ctx, { x: dx, y: GY, R: 56, kind: 'man', age: 45, outfit: 'sweater', hair: 'short', t, seed: 9, bob: run ? -Math.abs(Math.sin(t * 9)) * 12 : 0,
    legSwing: run ? Math.sin(t * 9) * .35 : 0, smile: 1, open: .3 + cheer * .3, brow: cheer, look: [1, 0], face: .4,
    hA: cheer ? [dx - 80, 1180 - Math.abs(Math.sin(t * 7)) * 20] : [dx + 40, 1430], hB: cheer ? [dx + 80, 1180 - Math.abs(Math.cos(t * 7)) * 20] : [bx - 40, 1500] });
}
function tree(ctx, x, col, seed) {
  ctx.beginPath(); ctx.moveTo(x, GY); ctx.lineTo(x, 1150); stroke(ctx, 46); stroke(ctx, 34, ink(.6, .5, .85));
  ctx.beginPath(); ctx.moveTo(x, 1250); ctx.lineTo(x - 120, 1080); ctx.moveTo(x, 1200); ctx.lineTo(x + 130, 1050); stroke(ctx, 26); stroke(ctx, 16, ink(.6, .5, .85));
  for (let i = 0; i < 11; i++) { ctx.beginPath(); ctx.arc(x + (hash(i + seed) - .5) * 420, 980 + (hash(i * 3 + seed) - .5) * 260, 80 + hash(i * 7) * 40, 0, 7); fill(ctx, col); stroke(ctx, 6); }
}
function bRetire(ctx, x0, p, t) {
  facade(ctx, x0 + 120, 1260, 380, ink(.15, .3, .1), ink(.2, .4, .15));
  window_(ctx, x0 + 300, 640, 900, 640, ink(.05, 0, .4), () => {
    ctx.fillStyle = ink(.2, .1, .5); ctx.fillRect(x0 + 300, 640, 900, 640);
    ctx.beginPath(); ctx.moveTo(x0 + 330, 690); ctx.quadraticCurveTo(x0 + 750, 760, x0 + 1170, 690); stroke(ctx, 4);
    ctx.font = '900 46px Inter'; ctx.textAlign = 'center'; ctx.fillStyle = ink(1, 0, .3); ctx.fillText('HAPPY RETIREMENT!', x0 + 750, 750);
    for (const [cx, s] of [[x0 + 420, 11], [x0 + 1080, 12]]) drawPerson(ctx, { x: cx, y: 1400, R: 48, kind: s === 11 ? 'woman' : 'man', age: 40, outfit: 'shirt', hair: s === 11 ? 'bun' : 'dark', t, seed: s, smile: 1, open: .4,
      hA: [cx - 30 + Math.sin(t * 12 + s) * 14, 1180], hB: [cx + 30 - Math.sin(t * 12 + s) * 14, 1180], armsFront: true });
    const blow = sstep(.42, .5, p) * (1 - sstep(.6, .7, p)), out = p > .5;
    drawPerson(ctx, { x: x0 + 750, y: 1420, R: 58, kind: 'man', age: 62, outfit: 'shirt', hair: 'grey', t, seed: 10, blow: blow > .3, smile: blow > .3 ? 0 : 1, open: out ? .4 : 0, look: [0, .7], lean: blow,
      hA: [x0 + 690, 1265], hB: [x0 + 810, 1265] });
    rr(ctx, x0 + 560, 1260, 380, 40, 6); fill(ctx, ink(.5, .2, .7)); stroke(ctx, 5);                  // стол
    rr(ctx, x0 + 640, 1170, 220, 90, 14); fill(ctx, PAPER); stroke(ctx, 5); ctx.fillStyle = ink(1, 0, .3); ctx.fillRect(x0 + 640, 1200, 220, 16);
    for (let i = 0; i < 6; i++) { const cx = x0 + 665 + i * 34; ctx.fillStyle = ink(0, .7, .1); ctx.fillRect(cx - 4, 1130, 8, 40);
      if (!out) { ctx.beginPath(); ctx.ellipse(cx, 1118 + Math.sin(t * 20 + i) * 2, 7, 13, 0, 0, 7); fill(ctx, ink(.6, 0, 1)); }
      else { const u = clamp((p - .5) * 3); ctx.globalAlpha = 1 - u; ctx.beginPath(); ctx.moveTo(cx, 1120); ctx.bezierCurveTo(cx + 20, 1080 - u * 60, cx - 20, 1040 - u * 90, cx + 10 * Math.sin(i), 1000 - u * 120); stroke(ctx, 5, ink(.2, .3, .2)); ctx.globalAlpha = 1; } }
  });
}
