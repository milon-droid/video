// Фоны Санниvилля: небо с облаками, холмы, дорожка, забор, табличка правила, интерьер дома, кинозал, титры, ракорд.
import { g, INK, PAPER, G1, G2, G3, G4, G5, ell, fillStroke, path, h1, noise, clamp, lerp } from './core.js';

// «акварельная» фактура фона: мягкие пятна поверх заливки
function wash(x, y, w, h, seed, a = .07) {
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  for (let i = 0; i < 22; i++) { const cx = x + h1(seed + i) * w, cy = y + h1(seed + i * 1.7) * h, r = 60 + h1(seed + i * 2.3) * 160;
    const gr = g.createRadialGradient(cx, cy, 0, cx, cy, r); const d = h1(seed + i * 3.1) > .5; gr.addColorStop(0, d ? `rgba(40,36,30,${a})` : `rgba(255,252,240,${a})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(cx - r, cy - r, r * 2, r * 2); }
  g.restore();
}
export function cloud(x, y, s, t = 0, face = 0, grinW = 1) {
  g.save(); g.translate(x + Math.sin(t * .7 + x) * 6, y); g.scale(s, s);
  const B = [[-90, 10, 55], [-40, -20, 70], [30, -30, 78], [90, 5, 55], [0, 20, 60]];
  for (const [bx, by, r] of B) { ell(bx, by, r, r * .85); fillStroke(PAPER, 7); }
  for (const [bx, by, r] of B) { ell(bx, by, r - 3.5, r * .85 - 3.5); g.fillStyle = PAPER; g.fill(); }
  if (face) { ell(-28, -6, 7, 12); g.fillStyle = INK; g.fill(); ell(28, -6, 7, 12); g.fill(); g.beginPath(); g.moveTo(-30 * grinW, 20); g.quadraticCurveTo(0, 20 + 30 * grinW, 30 * grinW, 20); g.lineWidth = 6; g.strokeStyle = INK; g.stroke(); }
  g.restore();
}
export function sky(t, dark = 0) {
  const gr = g.createLinearGradient(0, 0, 0, 1300); gr.addColorStop(0, lerp(0, 1, dark) > .5 ? G5 : G1); gr.addColorStop(1, PAPER);
  g.fillStyle = gr; g.fillRect(-600, -400, 2400, 2800);
  // лучи «солнечного» неба — штриховка
  g.save(); g.globalAlpha = .08; g.translate(760, 250); for (let k = 0; k < 18; k++) { g.rotate(6.283 / 18); g.beginPath(); g.moveTo(0, 0); g.lineTo(-60, -1600); g.lineTo(60, -1600); g.closePath(); g.fillStyle = PAPER; g.fill(); } g.restore();
  wash(-600, -400, 2400, 1700, 3, .05);
  if (dark > 0) { g.fillStyle = `rgba(18,17,16,${dark * .6})`; g.fillRect(-600, -400, 2400, 2800); }
}
export function hills(t, pathOn = 1) {
  // дальний холм
  g.beginPath(); g.moveTo(-600, 1050); g.bezierCurveTo(-100, 820, 400, 900, 700, 980); g.bezierCurveTo(1000, 1060, 1300, 880, 1700, 960); g.lineTo(1700, 2400); g.lineTo(-600, 2400); g.closePath(); fillStroke(G2, 7);
  wash(-600, 820, 2300, 500, 11, .06);
  // ближний холм
  g.beginPath(); g.moveTo(-600, 1260); g.bezierCurveTo(-200, 1150, 300, 1180, 600, 1230); g.bezierCurveTo(900, 1280, 1300, 1170, 1700, 1220); g.lineTo(1700, 2400); g.lineTo(-600, 2400); g.closePath(); fillStroke(G1, 7);
  // штрихи травы
  g.lineWidth = 3; g.strokeStyle = G3; for (let i = 0; i < 70; i++) { const x = -500 + h1(i) * 2100, y = 1300 + h1(i * 1.9) * 900; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 4, y - 14, x + 10, y - 22); g.moveTo(x + 8, y); g.quadraticCurveTo(x + 10, y - 10, x + 2, y - 18); g.stroke(); }
  if (pathOn) { g.beginPath(); g.moveTo(380, 1235); g.bezierCurveTo(300, 1450, 760, 1600, 520, 2400); g.lineTo(1040, 2400); g.bezierCurveTo(1100, 1700, 520, 1500, 560, 1238); g.closePath(); fillStroke(PAPER, 6); }
}
export function fence(x0, x1, y, s = 1) {
  g.lineWidth = 6; g.strokeStyle = INK;
  for (let x = x0; x <= x1; x += 70 * s) { g.beginPath(); g.moveTo(x - 14 * s, y); g.lineTo(x - 14 * s, y - 110 * s); g.lineTo(x, y - 128 * s); g.lineTo(x + 14 * s, y - 110 * s); g.lineTo(x + 14 * s, y); g.closePath(); fillStroke(PAPER, 5); }
  g.fillStyle = PAPER; for (const yy of [y - 85 * s, y - 40 * s]) { g.beginPath(); g.rect(x0 - 20, yy, x1 - x0 + 40, 16 * s); fillStroke(PAPER, 5); }
}
export function sign(x, y, s, t, font, wob = 0) {
  g.save(); g.translate(x, y); g.scale(s, s); g.rotate(Math.sin(t * 3.4) * .02 + wob);
  g.beginPath(); g.rect(-16, -40, 32, 360); fillStroke(G4, 6);
  g.beginPath(); g.roundRect(-250, -300, 500, 270, 16); fillStroke(PAPER, 9);
  g.beginPath(); g.roundRect(-232, -282, 464, 234, 10); g.lineWidth = 3; g.strokeStyle = INK; g.stroke();
  g.fillStyle = INK; g.textAlign = 'center'; g.font = `50px ${font}`; g.fillText('RULE No. 1', 0, -210);
  g.font = `86px ${font}`; g.fillText('ALWAYS', 0, -130); g.fillText('SMILE!', 0, -62);
  g.restore();
}
export function rock(x, y, s = 1) { g.save(); g.translate(x, y); g.scale(s, s); ell(0, -16, 40, 22); fillStroke(G3, 6); ell(-12, -24, 12, 6); g.fillStyle = G1; g.fill(); g.restore(); }
// интерьер дома: тёмная комната, окно светится, доски пола, банка краски
export function interior(t, dark = .5) {
  g.fillStyle = G4; g.fillRect(-300, -300, 1700, 2600);
  g.lineWidth = 4; g.strokeStyle = G5; for (let x = -300; x < 1400; x += 90) { g.beginPath(); g.moveTo(x, -300); g.lineTo(x, 1300); g.stroke(); }
  g.fillStyle = G3; g.fillRect(-300, 1300, 1700, 1000); g.beginPath(); g.moveTo(-300, 1300); g.lineTo(1400, 1300); g.lineWidth = 7; g.strokeStyle = INK; g.stroke();
  g.lineWidth = 3; for (let y = 1360; y < 2300; y += 90) { g.beginPath(); g.moveTo(-300, y); g.lineTo(1400, y); g.stroke(); }
  wash(-300, -300, 1700, 2600, 21, .08);
  if (dark) { g.fillStyle = `rgba(18,17,16,${dark})`; g.fillRect(-300, -300, 1700, 2600); }
}
export function windowFrame(x, y, w, h, drawOutside) {
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); drawOutside(); g.restore();
  g.lineWidth = 16; g.strokeStyle = INK; g.strokeRect(x, y, w, h); g.lineWidth = 12; g.beginPath(); g.moveTo(x + w / 2, y); g.lineTo(x + w / 2, y + h); g.moveTo(x, y + h / 2); g.lineTo(x + w, y + h / 2); g.stroke();
  g.fillStyle = G4; g.fillRect(x - 30, y + h, w + 60, 26); g.strokeRect(x - 30, y + h, w + 60, 26);
}
export function paintCan(x, y, s = 1, open = 1) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.beginPath(); g.rect(-60, -130, 120, 130); fillStroke(G2, 6); ell(0, -130, 60, 16); fillStroke(open ? INK : G3, 6); ell(0, 0, 60, 16); fillStroke(G2, 6);
  g.fillStyle = INK; g.font = '30px "Lime"'; g.textAlign = 'center'; g.fillText('PAINT', 0, -60);
  g.beginPath(); g.moveTo(-60, -110); g.quadraticCurveTo(-58, -60, -50, -40); g.lineWidth = 12; g.strokeStyle = INK; g.stroke();
  g.restore();
}
// кинозал: луч проектора, ряды зрителей, экран
export function theaterBg(t, beam = 1) {
  g.fillStyle = '#0f0e0d'; g.fillRect(-400, -400, 1900, 2800);
  if (beam > 0) { g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createLinearGradient(540, 2000, 540, 0); gr.addColorStop(0, `rgba(160,150,130,${.25 * beam})`); gr.addColorStop(1, 'rgba(160,150,130,0)');
    g.fillStyle = gr; g.beginPath(); g.moveTo(500, 2100); g.lineTo(-300, -200); g.lineTo(1400, -200); g.lineTo(580, 2100); g.closePath(); g.fill();
    for (let i = 0; i < 40; i++) { const k = (h1(i) + t * .03 * (1 + h1(i * 2))) % 1; const x = 540 + (h1(i * 3) - .5) * 1400 * (1 - k), y = 2000 - k * 2100; ell(x, y, 3, 3); g.fillStyle = `rgba(230,220,200,${.4 * beam})`; g.fill(); }
    g.restore(); }
}
export function titleCard(t, font, k = 1) {
  g.fillStyle = G1; g.fillRect(-200, -200, 1500, 2400);
  g.save(); g.translate(540, 900); g.rotate(t * .3);
  for (let i = 0; i < 24; i++) { g.rotate(6.283 / 24); g.beginPath(); g.moveTo(0, 0); g.lineTo(-90, -1500); g.lineTo(90, -1500); g.closePath(); g.fillStyle = i % 2 ? G2 : G1; g.fill(); }
  g.restore();
  ell(540, 900, 420 * k, 300 * k); fillStroke(PAPER, 12); ell(540, 900, 395 * k, 276 * k); g.lineWidth = 4; g.strokeStyle = INK; g.stroke();
  g.fillStyle = INK; g.textAlign = 'center';
  g.font = `40px ${font}`; g.fillText('A JOLLY-TONE CARTOON', 540, 770);
  g.font = `150px ${font}`; g.fillText('SMILE', 540, 930);
  g.font = `56px ${font}`; g.fillText('in Sunnyville', 540, 1010);
  g.font = `34px ${font}`; g.fillText('© MCMXXXII', 540, 1080);
}
// ракорд с обратным отсчётом
export function leader(n, f, font) {
  g.fillStyle = G2; g.fillRect(-200, -200, 1500, 2400);
  g.lineWidth = 8; g.strokeStyle = INK; g.beginPath(); g.arc(540, 960, 330, 0, 6.283); g.stroke(); g.beginPath(); g.arc(540, 960, 280, 0, 6.283); g.stroke();
  g.beginPath(); g.moveTo(540, 300); g.lineTo(540, 1620); g.moveTo(-100, 960); g.lineTo(1180, 960); g.lineWidth = 5; g.stroke();
  g.save(); g.beginPath(); g.moveTo(540, 960); g.arc(540, 960, 600, -Math.PI / 2, -Math.PI / 2 + f * 6.283); g.closePath(); g.fillStyle = 'rgba(18,17,16,.35)'; g.fill(); g.restore();
  g.fillStyle = INK; g.textAlign = 'center'; g.font = `360px ${font}`; g.fillText(String(n), 540, 1080);
}
