// Персонажи «резиновых шлангов» 30-х: глаза-«пирожки», белые перчатки, руки-шланги, большие ботинки.
// Координаты — от точки между ступнями, вверх — минус. Рисунок аккуратный: толщина линий постоянная, формы — эллипсы и кривые.
import { g, INK, PAPER, G1, G2, G3, G4, G5, ell, fillStroke, path, clamp, lerp, sm, h1, noise } from './core.js';

export function hose(a, b, bend = 0, w = 14, col = INK) {
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
  const cx = mx - dy / L * bend, cy = my + dx / L * bend;
  g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(cx, cy, b[0], b[1]); g.lineWidth = w; g.strokeStyle = col; g.lineCap = 'round'; g.stroke();
  return Math.atan2(b[1] - cy, b[0] - cx); // направление у конца
}
// перчатка: запястье в (x, y), ang — направление предплечья (пальцы смотрят дальше по нему)
export function glove(x, y, ang, pose = 'open', s = 1, flip = 1) {
  g.save(); g.translate(x, y); g.rotate(ang + Math.PI / 2); g.scale(s * flip, s); // локально пальцы вверх (−y)
  const lw = 5;
  const finger = (a, L, w = 17) => { g.save(); g.translate(0, -26); g.rotate(a); g.beginPath(); g.roundRect(-w / 2, -L - 8, w, L + 8, w / 2); fillStroke(PAPER, lw); g.restore(); };
  if (pose === 'open' || pose === 'wave') { finger(-.42, 30); finger(-.05, 36); finger(.33, 32); finger(-1.35, 24, 16); }
  else if (pose === 'point') { finger(0, 44); finger(-1.25, 20, 16); }
  else if (pose === 'hold') { finger(-1.3, 18, 16); }
  ell(0, -26, 27, 26); fillStroke(PAPER, lw);
  if (pose === 'fist' || pose === 'hold' || pose === 'point') { for (let i = 0; i < 3; i++) { ell(-12 + i * 12 + (pose === 'point' ? 6 : 0), -44, 8, 7); fillStroke(PAPER, 4); } }
  else { g.beginPath(); g.moveTo(-8, -18); g.lineTo(-8, -32); g.moveTo(4, -17); g.lineTo(4, -33); g.lineWidth = 3; g.strokeStyle = INK; g.stroke(); }
  g.beginPath(); g.roundRect(-24, -6, 48, 18, 7); fillStroke(PAPER, lw);   // манжета
  g.restore();
}
export function shoe(x, y, dir = 1, s = 1) {
  g.save(); g.translate(x, y); g.scale(dir * s, s);
  ell(22, -16, 44, 22); fillStroke(G5, 6); ell(36, -24, 12, 6, -.3); g.fillStyle = 'rgba(243,239,228,.55)'; g.fill();
  g.restore();
}
// глаз-«пирожок»: зрачок с вырезом; shrink — зрачок-точка от ужаса; hollow — пустая чёрная глазница
export function pieEye(x, y, rx, ry, { blink = 0, shrink = 0, hollow = 0, white = 0 } = {}) {
  if (white) { ell(x, y, rx * 1.55, ry * 1.25); fillStroke(PAPER, 4); }
  if (blink > .5) { g.beginPath(); g.moveTo(x - rx * 1.2, y + 2); g.quadraticCurveTo(x, y + ry * .6, x + rx * 1.2, y + 2); g.lineWidth = 6; g.strokeStyle = INK; g.stroke(); return; }
  if (hollow > 0) { ell(x, y, rx * (1 + hollow * .5), ry * (1 + hollow * .2)); g.fillStyle = INK; g.fill(); ell(x, y + ry * .1, 3, 3); g.fillStyle = PAPER; g.globalAlpha = hollow; g.fill(); g.globalAlpha = 1; return; }
  const k = 1 - shrink * .72; ell(x, y, rx * k, ry * k); g.fillStyle = INK; g.fill();
  if (shrink < .5) { g.beginPath(); g.moveTo(x, y); g.ellipse(x, y, rx * k * 1.02, ry * k * 1.02, 0, -1.2, -.55); g.closePath(); g.fillStyle = PAPER; g.fill(); }
}

// ===================== ТИППИ (котёнок) =====================
// P: x,y,s, t, bob (подскок 0…1), lean, look[x,y], mouth: grin|smile|frown|scream|o|painted, blink, shrink (ужас),
// armL/armR {hand:[dx,dy] от плеча, pose, bend}, walk (фаза) / walkAmp, tears 0…1, paint 0…1, drips, cone (в правой руке), brush, tremble
export function tippy(P) {
  const s = P.s || 1, t = P.t || 0, tr = (P.tremble || 0) * noise(17, t * 30) * 4;
  g.save(); g.translate(P.x + tr, P.y);
  const sq = P.squash || 0; g.scale(s * (1 + sq), s * (1 - sq)); g.rotate(P.lean || 0);
  const bob = P.bob || 0, ph = P.walk || 0, wa = P.walkAmp || 0;
  const by = -bob * 26 - Math.abs(Math.sin(ph)) * 14 * wa;
  // хвост
  const tw = Math.sin(t * 3) * 14;
  g.beginPath(); g.moveTo(-30, -200 + by); g.bezierCurveTo(-130, -210 + by, -150 + tw, -330 + by, -95 + tw, -350 + by); g.lineWidth = 14; g.strokeStyle = INK; g.stroke();
  // ноги
  for (const sd of [-1, 1]) {
    const p2 = ph + (sd < 0 ? 0 : Math.PI);
    const fx = sd * 44 + Math.sin(p2) * 52 * wa, fy = -Math.max(0, Math.cos(p2)) * 34 * wa;
    hose([sd * 28, -178 + by], [fx, fy - 6], sd * 10 * (1 - wa * .5), 14);
    shoe(fx - (sd < 0 ? 0 : 0), fy, sd, 1);
  }
  g.translate(0, by);
  // тело с шортами и пуговицами
  ell(0, -240, 74, 88); g.fillStyle = INK; g.fill();
  g.save(); ell(0, -240, 74, 88); g.clip(); g.fillStyle = G3; g.fillRect(-90, -222, 180, 80); g.beginPath(); g.moveTo(-90, -222); g.lineTo(90, -222); g.lineWidth = 6; g.strokeStyle = INK; g.stroke(); g.restore();
  for (const sd of [-1, 1]) { ell(sd * 24, -200, 11, 13); fillStroke(PAPER, 4); ell(sd * 24, -200, 3, 3); g.fillStyle = INK; g.fill(); }
  // голова
  g.save(); g.translate(0, -405); g.rotate(P.tilt || 0); g.translate(0, 405);
  const ear = (sd, tw2) => { path([[sd * 98, -448], [sd * (82 + tw2), -548], [sd * 26, -492]], true); fillStroke(INK, 0); path([[sd * 84, -462], [sd * (77 + tw2), -522], [sd * 44, -490]], true); g.fillStyle = G4; g.fill(); };
  ear(-1, P.earTw || 0); ear(1, -(P.earTw || 0));
  ell(0, -405, 104, 100); g.fillStyle = INK; g.fill();
  // маска лица
  g.fillStyle = PAPER; ell(-35, -432, 45, 50); g.fill(); ell(35, -432, 45, 50); g.fill(); ell(0, -376, 88, 62); g.fill();
  // глаза
  const lk = P.look || [0, 0], bl = P.blink || 0, shr = P.shrink || 0;
  for (const sd of [-1, 1]) pieEye(sd * 31 + lk[0] * 9, -434 + lk[1] * 9, 17, 31, { blink: bl, shrink: shr });
  if (P.brows) { for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(sd * 14, -478 - P.brows * 6); g.lineTo(sd * 52, -486 + P.brows * 14); g.lineWidth = 7; g.strokeStyle = INK; g.stroke(); } }
  // слёзы
  if (P.tears) { for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) { const f = ((t * .9 + k / 3 + (sd > 0 ? .17 : 0)) % 1); const yy = -405 + f * 110; const xx = sd * (42 + f * 26);
      g.globalAlpha = P.tears * (1 - f * .6); g.beginPath(); g.moveTo(xx, yy - 14); g.quadraticCurveTo(xx + 9, yy + 4, xx, yy + 8); g.quadraticCurveTo(xx - 9, yy + 4, xx, yy - 14); fillStroke(PAPER, 3.5); g.globalAlpha = 1; } }
  // нос, усы
  ell(0, -397, 16, 11); g.fillStyle = INK; g.fill(); ell(-5, -401, 5, 3); g.fillStyle = PAPER; g.fill();
  g.lineWidth = 4; g.strokeStyle = INK; for (const sd of [-1, 1]) for (let k = -1; k <= 1; k++) { g.beginPath(); g.moveTo(sd * 52, -386 + k * 9); g.lineTo(sd * 118, -392 + k * 18); g.stroke(); }
  mouthTippy(P);
  g.restore();
  // руки
  for (const sd of [-1, 1]) {
    const A = sd < 0 ? P.armL : P.armR; const sh = [sd * 60, -292];
    const swing = Math.sin(ph + (sd < 0 ? Math.PI : 0)) * 40 * wa;
    const hd = A?.hand || [sd * 26 + swing * .4, 118 - Math.abs(swing) * .2];
    const wr = [sh[0] + hd[0], sh[1] + hd[1]];
    const ang = hose(sh, wr, (A?.bend ?? sd * -24), 14);
    if (sd > 0 && P.cone) cone(wr[0], wr[1] - 8, P.cone);
    if (sd > 0 && P.brush) brush(wr[0], wr[1], ang);
    glove(wr[0], wr[1], ang, A?.pose || 'open', 1, sd);
  }
  g.restore();
}
function mouthTippy(P) {
  const m = P.mouth || 'smile', t = P.t || 0, w = P.grinW || 1;
  if (m === 'grin' || m === 'smile') {
    const d = m === 'grin' ? 70 : 42; g.save(); g.translate(0, -372); g.scale(w, 1);
    g.beginPath(); g.moveTo(-58, -6); g.quadraticCurveTo(0, d, 58, -6); g.quadraticCurveTo(0, d * .38, -58, -6); g.fillStyle = INK; g.fill();
    if (m === 'grin') { g.save(); g.clip(); ell(8, 36, 24, 13); g.fillStyle = G3; g.fill(); g.restore(); }
    g.lineWidth = 5; g.strokeStyle = INK; for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(sd * 54, -16); g.quadraticCurveTo(sd * 66, -6, sd * 60, 6); g.stroke(); }
    g.restore();
  } else if (m === 'frown') {
    const q = Math.sin(t * 24) * 2; g.beginPath(); g.moveTo(-36, -346 + q); g.quadraticCurveTo(0, -374, 36, -346 - q); g.lineWidth = 7; g.strokeStyle = INK; g.stroke();
  } else if (m === 'scream') { ell(0, -352, 27, 38); g.fillStyle = INK; g.fill(); g.save(); ell(0, -352, 27, 38); g.clip(); ell(0, -326, 18, 12); g.fillStyle = G3; g.fill(); g.restore(); }
  else if (m === 'o') { ell(0, -356, 12, 16); g.fillStyle = INK; g.fill(); }
  if (P.paint) { // нарисованная кистью улыбка поверх настоящего рта
    const p = P.paint;
    g.save(); g.beginPath(); g.rect(-130, -460, 260 * p, 200); g.clip();
    g.beginPath(); g.moveTo(-84, -388); g.bezierCurveTo(-60, -300, 60, -300, 84, -388); g.bezierCurveTo(50, -338, -50, -338, -84, -388); g.fillStyle = INK; g.fill();
    g.lineWidth = 16; g.strokeStyle = INK; g.beginPath(); g.moveTo(-90, -392); g.bezierCurveTo(-62, -296, 62, -296, 92, -394); g.stroke();
    // зубы краской
    g.fillStyle = PAPER; for (let k = -3; k <= 3; k++) { g.beginPath(); g.roundRect(k * 17 - 7, -360 + Math.abs(k) * -4, 13, 18, 3); g.fill(); }
    g.restore();
    if (P.drips) for (let k = 0; k < 4; k++) { const x = -60 + k * 40 + h1(k) * 10, L = P.drips * (30 + h1(k + 3) * 50); g.beginPath(); g.moveTo(x, -330); g.lineTo(x, -330 + L); g.lineWidth = 9; g.strokeStyle = INK; g.stroke(); ell(x, -326 + L, 7, 8); g.fillStyle = INK; g.fill(); }
  }
}
export function cone(x, y, k = 1) {
  g.save(); g.translate(x, y);
  path([[-22, -10], [22, -10], [0, 60]], true); fillStroke(G2, 5);
  g.save(); path([[-22, -10], [22, -10], [0, 60]], true); g.clip(); g.lineWidth = 3; g.strokeStyle = G4; for (let i = -4; i < 5; i++) { g.beginPath(); g.moveTo(i * 12 - 30, -10); g.lineTo(i * 12 + 20, 60); g.moveTo(i * 12 + 30, -10); g.lineTo(i * 12 - 20, 60); g.stroke(); } g.restore();
  if (k > 0) { ell(0, -34, 34 * k, 30 * k); fillStroke(PAPER, 5); ell(-10, -44, 9, 6); g.fillStyle = G1; g.fill(); ell(14, -12, 8, 12); fillStroke(PAPER, 4); }
  g.restore();
}
function brush(x, y, ang) {
  g.save(); g.translate(x, y); g.rotate(ang + Math.PI / 2);
  g.beginPath(); g.roundRect(-7, -120, 14, 110, 6); fillStroke(G2, 5); g.beginPath(); g.roundRect(-11, -150, 22, 34, 4); fillStroke(G4, 5);
  g.beginPath(); g.moveTo(-11, -150); g.quadraticCurveTo(0, -200, 11, -150); fillStroke(INK, 4); g.restore();
}

// ===================== МЭР-СВИНЬЯ =====================
// P: x,y,s,t,bob, look, peel 0…1 (наклейка-улыбка сползает и падает), scream 0…1 (лицо под ней), hat (тип шляпы), point (рука к табличке)
export function pig(P) {
  const s = P.s || 1, t = P.t || 0, bob = P.bob || 0, by = -bob * 18;
  g.save(); g.translate(P.x, P.y); g.scale(s, s);
  for (const sd of [-1, 1]) { hose([sd * 45, -80 + by], [sd * 55, -8], sd * 6, 18); shoe(sd * 55, 0, sd, 1.05); }
  g.translate(0, by);
  // тело во фраке
  ell(0, -215, 122, 140); fillStroke(G2, 7);
  g.save(); ell(0, -215, 122, 140); g.clip(); g.fillStyle = INK; g.fillRect(-140, -380, 70, 330); g.fillRect(70, -380, 70, 330); g.restore();
  path([[-55, -330], [55, -330], [0, -150]], true); g.fillStyle = PAPER; g.fill();
  for (let k = 0; k < 3; k++) { ell(0, -265 + k * 38, 6, 6); g.fillStyle = INK; g.fill(); }
  path([[0, -322], [-34, -342], [-34, -302]], true); fillStroke(INK, 0); path([[0, -322], [34, -342], [34, -302]], true); fillStroke(INK, 0);
  // руки
  const shL = [-110, -270], shR = [110, -270];
  const hL = P.handL || [-150, -170], hR = P.handR || [160, -170];
  glove(hL[0], hL[1], hose(shL, hL, 20, 16), P.poseL || 'open', 1.05, -1);
  glove(hR[0], hR[1], hose(shR, hR, -20, 16), P.poseR || 'open', 1.05, 1);
  // голова
  g.save(); g.translate(0, -400); g.rotate(P.tilt || 0);
  for (const sd of [-1, 1]) { path([[sd * 60, -60], [sd * 92, -112], [sd * 96, -40]], true); fillStroke(G3, 6); }
  ell(0, 0, 100, 88); fillStroke(G2, 7);
  const sc = P.scream || 0, hol = sc;
  for (const sd of [-1, 1]) pieEye(sd * 38 + (P.look?.[0] || 0) * 8, -22, 13, 21, { white: 1, hollow: hol, shrink: P.shrink || 0, blink: P.blink || 0 });
  // монокль
  g.beginPath(); g.arc(38, -22, 30, 0, 6.28); g.lineWidth = 5; g.strokeStyle = INK; g.stroke(); g.beginPath(); g.moveTo(66, -10); g.quadraticCurveTo(90, 40, 70, 90); g.lineWidth = 3; g.stroke();
  // пятачок
  ell(0, 20, 40, 27); fillStroke(G1, 6); ell(-13, 20, 7, 11); g.fillStyle = INK; g.fill(); ell(13, 20, 7, 11); g.fill();
  // лицо под улыбкой: крик
  if (sc > 0) { g.globalAlpha = sc; ell(0, 80, 42 * (.6 + sc * .4), 58 * (.5 + sc * .5)); g.fillStyle = INK; g.fill(); g.globalAlpha = 1;
    g.lineWidth = 4; g.strokeStyle = INK; for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(sd * 70, 40); g.quadraticCurveTo(sd * 60, 90, sd * 40, 130); g.stroke(); } }
  // улыбка-наклейка
  const pe = P.peel || 0;
  if (pe < 1) {
    g.save(); g.translate(0, 46 + pe * pe * 260); g.scale(.9, .9); g.rotate(pe * .9 * (P.peelDir || 1)); g.globalAlpha = 1 - clamp((pe - .85) / .15);
    const w = P.grinW || 1; g.scale(w, 1);
    g.beginPath(); g.moveTo(-74, -8); g.quadraticCurveTo(0, 74, 74, -8); g.quadraticCurveTo(0, 22, -74, -8); fillStroke(INK, 0);
    g.save(); g.clip(); g.fillStyle = PAPER; for (let k = -4; k <= 4; k++) { g.beginPath(); g.roundRect(k * 15 - 6, -4 + Math.abs(k) * 1.5, 12, 22, 3); g.fill(); } g.restore();
    for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(sd * 70, -18); g.quadraticCurveTo(sd * 84, -6, sd * 76, 8); g.lineWidth = 5; g.strokeStyle = INK; g.stroke(); }
    if (pe > .05) { g.beginPath(); g.moveTo(-74, -8); g.quadraticCurveTo(0, 74, 74, -8); g.lineWidth = 3; g.strokeStyle = G2; g.setLineDash([6, 6]); g.stroke(); g.setLineDash([]); }
    g.restore();
  }
  // цилиндр
  g.save(); g.rotate(-.08); ell(0, -78, 92, 18); fillStroke(INK, 0); g.beginPath(); g.roundRect(-56, -200, 112, 124, 8); g.fillStyle = INK; g.fill(); g.fillStyle = G4; g.fillRect(-56, -110, 112, 18); g.restore();
  g.restore(); g.restore();
}

// ===================== ЦВЕТОК С ЛИЦОМ =====================
export function flower(P) {
  const s = P.s || 1, t = P.t || 0, sw = P.sway ?? Math.sin(t * 3.4 + (P.ph || 0)) * .12;
  g.save(); g.translate(P.x, P.y); g.scale(s, s);
  const top = [Math.sin(sw) * 170, -Math.cos(sw) * 170];
  hose([0, 0], top, 18 * Math.sign(sw || 1), 9, INK);
  for (const sd of [-1, 1]) { g.save(); g.translate(top[0] * .45, top[1] * .45); g.rotate(sd * .9 + sw); ell(sd * 26, 0, 30, 11); fillStroke(G3, 4); g.restore(); }
  g.translate(top[0], top[1]); g.rotate(sw * .6 + (P.tilt || 0));
  const tn = P.turn ?? 1; // 1 — лицом к нам, 0 — профиль
  for (let k = 0; k < 10; k++) { const a = k / 10 * 6.283 + t * 0; g.save(); g.rotate(a); ell(0, -56, 17, 30); fillStroke(PAPER, 4); g.restore(); }
  ell(0, 0, 40, 40); fillStroke(G2, 5);
  g.save(); g.scale(Math.max(.15, tn), 1); g.translate((1 - tn) * 20, 0);
  for (const sd of [-1, 1]) pieEye(sd * 14 + (P.look?.[0] || 0) * 5, -8, 6, 11, { shrink: P.shrink || 0, hollow: P.hollow || 0 });
  const w = P.grinW || 1; g.beginPath(); g.moveTo(-24 * w, 8); g.quadraticCurveTo(0, 8 + 26 * w, 24 * w, 8); g.quadraticCurveTo(0, 18, -24 * w, 8); g.fillStyle = INK; g.fill();
  g.restore(); g.restore();
}

// ===================== СОЛНЦЕ =====================
export function sun(P) {
  const R = P.r || 150, t = P.t || 0;
  g.save(); g.translate(P.x, P.y); g.rotate(P.tilt || 0);
  g.save(); g.rotate(t * .25); for (let k = 0; k < 14; k++) { g.rotate(6.283 / 14); path([[-20, -R - 8], [0, -R - 70 - (k % 2) * 25], [20, -R - 8]], true); fillStroke(G1, 5); } g.restore();
  ell(0, 0, R, R); fillStroke(PAPER, 9);
  const lk = P.look || [0, 0];
  for (const sd of [-1, 1]) { pieEye(sd * R * .3 + lk[0] * R * .06, -R * .15 + lk[1] * R * .06, R * .1, R * .18, { shrink: P.shrink || 0, blink: P.blink || 0 });
    g.beginPath(); g.moveTo(sd * R * .14, -R * .45 + (P.brow || 0) * R * .1); g.quadraticCurveTo(sd * R * .3, -R * .55, sd * R * .46, -R * .42 - (P.brow || 0) * R * .08); g.lineWidth = 7; g.strokeStyle = INK; g.stroke();
    ell(sd * R * .55, R * .18, R * .12, R * .08); g.fillStyle = G1; g.fill(); }
  const w = P.grinW || 1; g.save(); g.translate(0, R * .2); g.scale(w, w > 1.3 ? 1 + (w - 1.3) * .8 : 1);
  g.beginPath(); g.moveTo(-R * .5, 0); g.quadraticCurveTo(0, R * .62, R * .5, 0); g.quadraticCurveTo(0, R * .2, -R * .5, 0); g.fillStyle = INK; g.fill();
  if (P.teeth) { g.save(); g.clip(); g.fillStyle = PAPER; for (let k = -6; k <= 6; k++) { path([[k * R * .075 - R * .03, R * .08], [k * R * .075, R * .2 + Math.abs(k) * -2], [k * R * .075 + R * .03, R * .08]], true); g.fill(); } g.restore(); }
  g.restore(); g.restore();
}

// ===================== ДОМ С ЛИЦОМ =====================
export function house(P) {
  const s = P.s || 1, t = P.t || 0, b = P.bob || 0;
  g.save(); g.translate(P.x, P.y); g.scale(s * (1 + b * .04), s * (1 - b * .05));
  g.beginPath(); g.roundRect(-110, -230, 220, 230, 10); fillStroke(G1, 7);
  path([[-140, -220], [0, -360], [140, -220]], true); fillStroke(G4, 7);
  g.save(); path([[-140, -220], [0, -360], [140, -220]], true); g.clip(); g.lineWidth = 3; g.strokeStyle = G5; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(-150, -230 - i * 22); g.lineTo(150, -230 - i * 22); g.stroke(); } g.restore();
  g.beginPath(); g.roundRect(48, -340, 34, 70, 4); fillStroke(G3, 6);
  for (const sd of [-1, 1]) { g.beginPath(); g.roundRect(sd * 58 - 30, -190, 60, 62, 6); fillStroke(P.lit ? PAPER : G5, 6); if (P.face) pieEye(sd * 58 + (P.look || 0) * 10, -158, 9, 16, { shrink: P.shrink || 0 }); }
  if (P.face) { const w = P.grinW || 1; g.beginPath(); g.moveTo(-50 * w, -86); g.quadraticCurveTo(0, -86 + 62 * w, 50 * w, -86); g.quadraticCurveTo(0, -66, -50 * w, -86); g.fillStyle = INK; g.fill(); }
  else { g.beginPath(); g.roundRect(-30, -110, 60, 110, [30, 30, 0, 0]); fillStroke(G4, 6); }
  g.restore();
}
export function tree(P) {
  const s = P.s || 1, t = P.t || 0, sw = Math.sin(t * 3.4 + (P.ph || 0)) * .05;
  g.save(); g.translate(P.x, P.y); g.scale(s, s); g.rotate(sw);
  g.beginPath(); g.moveTo(-26, 0); g.quadraticCurveTo(-14, -120, -20, -230); g.lineTo(20, -230); g.quadraticCurveTo(14, -120, 26, 0); g.closePath(); fillStroke(G4, 6);
  for (const [x, y, r] of [[-70, -260, 70], [70, -270, 72], [0, -330, 92], [-40, -230, 60], [40, -230, 60]]) { ell(x, y, r, r * .92); fillStroke(G3, 6); }
  for (const [x, y, r] of [[-70, -260, 70], [70, -270, 72], [0, -330, 92], [-40, -230, 60], [40, -230, 60]]) { ell(x, y, r - 4, r * .92 - 4); g.fillStyle = G3; g.fill(); }
  if (P.face) { for (const sd of [-1, 1]) pieEye(sd * 26, -300, 9, 16, { shrink: P.shrink || 0 }); const w = P.grinW || 1; g.beginPath(); g.moveTo(-34 * w, -262); g.quadraticCurveTo(0, -262 + 40 * w, 34 * w, -262); g.quadraticCurveTo(0, -250, -34 * w, -262); g.fillStyle = INK; g.fill(); }
  g.restore();
}
// ===================== ЗРИТЕЛЬ В КИНОЗАЛЕ =====================
// turn: 0 — затылок, 1 — лицо (нарисованная улыбка); hat: 0 котелок, 1 шляпка, 2 без
export function viewer(x, y, s, turn, hat = 0, lit = .3, grinK = 1) {
  g.save(); g.translate(x, y); g.scale(s, s);
  ell(0, 60, 95, 55); g.fillStyle = INK; g.fill();                              // плечи
  ell(0, -20, 52, 62); g.fillStyle = INK; g.fill();                             // голова
  if (turn > 0) { g.save(); g.scale(Math.max(.05, turn), 1); ell(0, -16, 46, 56); g.fillStyle = `rgba(140,134,123,${lit})`; g.fill();
    if (turn > .5) { const a = (turn - .5) * 2; g.globalAlpha = a; for (const sd of [-1, 1]) { ell(sd * 17, -30, 6, 6); g.fillStyle = PAPER; g.fill(); }
      g.beginPath(); g.moveTo(-34 * grinK, 4); g.quadraticCurveTo(0, 4 + 44 * grinK, 34 * grinK, 4); g.quadraticCurveTo(0, 22, -34 * grinK, 4); g.fillStyle = PAPER; g.fill(); g.globalAlpha = 1; }
    g.restore(); }
  if (turn < .5) { g.beginPath(); g.ellipse(0, -20, 50, 60, 0, Math.PI * 1.1, Math.PI * 1.9); g.lineWidth = 7; g.strokeStyle = `rgba(190,182,166,${.55 * (1 - turn * 2)})`; g.stroke();
    g.beginPath(); g.ellipse(0, 60, 92, 52, 0, Math.PI * 1.15, Math.PI * 1.85); g.lineWidth = 6; g.stroke(); }
  if (hat === 0) { ell(0, -60, 70, 14); g.fillStyle = INK; g.fill(); ell(0, -78, 46, 34); g.fill(); }
  if (hat === 1) { ell(0, -56, 58, 30); g.fillStyle = INK; g.fill(); }
  g.restore();
}
