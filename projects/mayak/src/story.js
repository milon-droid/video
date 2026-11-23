// МАЯК — сюжет по кадрам (часть 1: хук → светлячок). Время в секундах. Общие помощники здесь.
window.DURATION = 60;
const SH = []; const shot = (t0, t1, fn) => SH.push({ t0, t1, fn });
const { K, seg, cl, lerp, ease } = A;
const TAU = Math.PI * 2;
// молнии всего ролика (те же моменты — в звуке)
Wd.setFlashes([1.45, 2.55, 4.7, 6.35, 9.9, 13.6, 18.4, 20.6, 25.2, 31.2]);
// ---------- надпись: полоска бумаги, вылетает с «пружиной»
function label(txt, x, y, lt, o = {}) {
  if (lt < 0) return; const k = ease.back(cl(lt / .35)); const out = o.out != null ? cl((lt - o.out) / .25) : 0;
  const size = o.size || 40, rot = (o.rot || -.03) + (1 - k) * .25;
  E.paper({ z: .9, shadow: 9, par: 0, alpha: 1 - out, draw: c => {
    c.setTransform(1, 0, 0, 1, 0, 0); c.translate(x, y - out * 40); c.rotate(rot); c.scale(.6 + .4 * k, .6 + .4 * k);
    c.font = `${size}px IB`; const lines = txt.split('\n'); const w = Math.max(...lines.map(l => c.measureText(l).width)) + size * .9, h = lines.length * size * 1.12 + size * .55;
    P.poly(c, [[-w / 2, -h / 2], [w / 2, -h / 2 + 3], [w / 2 + 6, -h / 4], [w / 2 - 2, h / 4], [w / 2 + 4, h / 2], [-w / 2 + 3, h / 2 - 2], [-w / 2 - 5, h / 4], [-w / 2 + 2, -h / 6]], 3, txt.length);
    c.fillStyle = o.bg || '#f3ecdc'; c.fill(); c.fillStyle = o.col || '#231a16'; c.textAlign = 'center'; c.textBaseline = 'middle';
    lines.forEach((l, i) => c.fillText(l, 0, (i - (lines.length - 1) / 2) * size * 1.12 + size * .04)); } });
}
// осколки стекла (бумажные треугольники летят на камеру)
function shards(c, lt, x, y, n = 16) {
  for (let i = 0; i < n; i++) { const a = E.hash(i + 3) * TAU, sp = 380 + 520 * E.hash(i * 7.3), d = lt * sp, g = 260 * lt * lt;
    const sc = 1 + lt * (1.5 + 2 * E.hash(i)); const px = x + Math.cos(a) * d * sc * .7, py = y + Math.sin(a) * d * sc * .7 + g;
    c.save(); c.translate(px, py); c.rotate(lt * (6 + 8 * E.hash(i * 2)) + i); c.scale(sc, sc);
    c.fillStyle = i % 3 ? 'rgba(215,232,245,.85)' : 'rgba(255,248,220,.9)'; c.beginPath(); c.moveTo(0, -14 - 10 * E.hash(i)); c.lineTo(10 + 6 * E.hash(i * 3), 9); c.lineTo(-9, 7); c.closePath(); c.fill(); c.restore(); }
}
// мягкий дым: клубы-градиенты
function smoke(c, x, y, lt, n = 6) { for (let i = 0; i < n; i++) { const u = lt - i * .12; if (u < 0) continue; const r = 10 + u * 40, a = Math.max(0, .35 - u * .22);
  const px = x + Math.sin(u * 3 + i) * 14 + u * 12, py = y - u * 90; const gr = c.createRadialGradient(px, py, 0, px, py, r); gr.addColorStop(0, `rgba(200,205,215,${a})`); gr.addColorStop(1, 'rgba(200,205,215,0)'); c.fillStyle = gr; c.beginPath(); c.arc(px, py, r, 0, TAU); c.fill(); } }
// искры
function sparks(c, lt, x, y, n = 14, col = '#ffe9a0') { for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + (E.hash(i + 9) - .5) * 2.6, sp = 250 + 350 * E.hash(i * 3.3);
  const px = x + Math.cos(a) * sp * lt, py = y + Math.sin(a) * sp * lt + 600 * lt * lt; c.fillStyle = col; P.spark(c, px, py, 8 * (1 - lt), 4, i); c.fill(); } }
function sparksGlow(g, lt, x, y, n = 14) { for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + (E.hash(i + 9) - .5) * 2.6, sp = 250 + 350 * E.hash(i * 3.3);
  const px = x + Math.cos(a) * sp * lt, py = y + Math.sin(a) * sp * lt + 600 * lt * lt; const r = 22 * (1 - lt); if (r <= 0) continue; const gr = g.createRadialGradient(px, py, 0, px, py, r); gr.addColorStop(0, 'rgba(255,240,180,.9)'); gr.addColorStop(1, 'rgba(255,160,60,0)'); g.fillStyle = gr; g.beginPath(); g.arc(px, py, r, 0, TAU); g.fill(); } }
function halo(g, x, y, r, col, a = 1) { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, col.replace('A', a)); gr.addColorStop(1, col.replace('A', 0)); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
// пол и дальняя комната
function floor(c, y, col = '#3a2a22') { c.fillStyle = col; c.fillRect(-500, y, 1800, 1200); c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 2; for (let i = 0; i < 12; i++) { c.beginPath(); c.moveTo(-500, y + 20 + i * i * 6); c.lineTo(1300, y + 20 + i * i * 6); c.stroke(); } }
// рычаг-рубильник
function lever(c, x, y, a, spark = 0) {
  c.fillStyle = '#4a5160'; c.fillRect(x - 60, y - 90, 120, 180); c.strokeStyle = 'rgba(255,255,255,.2)'; c.lineWidth = 2; c.strokeRect(x - 60, y - 90, 120, 180);
  c.fillStyle = '#c9b27a'; c.fillRect(x - 50, y - 10, 100, 20); c.save(); c.translate(x, y); c.rotate(a); c.fillStyle = '#2b2f38'; c.fillRect(-7, -110, 14, 110); c.fillStyle = '#c4362e'; c.beginPath(); c.ellipse(0, -112, 20, 14, 0, 0, TAU); c.fill(); c.restore();
  c.fillStyle = '#e9c04a'; P.poly(c, [[x - 20, y + 40], [x, y + 25], [x + 20, y + 40], [x, y + 75]], 0); c.fill(); c.fillStyle = '#2b2f38'; c.font = '28px IB'; c.textAlign = 'center'; c.fillText('!', x, y + 62);
}
// штурвал
function wheel(c, x, y, r, a) { c.save(); c.translate(x, y); c.rotate(a); c.strokeStyle = '#6d4a2a'; c.lineWidth = r * .14; c.beginPath(); c.arc(0, 0, r * .8, 0, TAU); c.stroke(); c.lineWidth = r * .1; c.lineCap = 'round';
  for (let i = 0; i < 8; i++) { const q = i / 8 * TAU; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(q) * r * 1.15, Math.sin(q) * r * 1.15); c.stroke(); } c.fillStyle = '#c9a463'; c.beginPath(); c.arc(0, 0, r * .18, 0, TAU); c.fill(); c.restore(); }
// палуба корабля крупно (для подзорной трубы и штурвала)
function deck(t, lt, o = {}) {
  const f = o.f || 0; Wd.sky(t, { flash: f, drift: t * 30 });
  Wd.sea(t, { y0: 760, y1: 940, z0: 3, z1: 2, n: 3, flash: f });
  E.paper({ z: 1.5, shadow: 16, tint: o.tint, draw: c => { c.save(); c.translate(360, 900); c.rotate(o.heel || 0); c.translate(-360, -900);
    c.fillStyle = '#5a4030'; c.fillRect(-200, 860, 1200, 600); c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 3; for (let i = 0; i < 9; i++) { c.beginPath(); c.moveTo(-200, 880 + i * 50); c.lineTo(1000, 880 + i * 50); c.stroke(); }
    c.fillStyle = '#e3d8c3'; c.fillRect(-200, 380, 360, 490); c.fillStyle = '#3a2c2c'; c.fillRect(-200, 370, 370, 18); c.fillStyle = '#ffcf73'; c.fillRect(20, 470, 90, 90); c.restore(); } });
  E.glow(1.5, g => halo(g, 65, 515, 110, 'rgba(255,200,120,A)', .8));
  const wa = o.wheel || 0, wx = 370, wy = 900, wr = 105;
  const gp = Object.assign({ x: 370, y: 1250, s: 1.7, ikL: [wx + Math.cos(Math.PI * 1.15 + (o.handRot || 0)) * wr * .8, wy + Math.sin(Math.PI * 1.15 + (o.handRot || 0)) * wr * .8], ikR: [wx + Math.cos(-.15 - (o.handRot || 0)) * wr * .8, wy + Math.sin(-.15 - (o.handRot || 0)) * wr * .8], bendL: -1, bendR: -1, mouth: 'grit', brow: -1, seed: 3 }, o.gp || {});
  E.paper({ z: 1.25, shadow: 18, tint: o.tint, draw: c => { c.save(); c.translate(360, 900); c.rotate(o.heel || 0); c.translate(-360, -900); c.fillStyle = '#4a3020'; c.fillRect(wx - 9, wy, 18, 420); C.person(c, 'grandpa', gp); wheel(c, wx, wy, wr, wa); c.restore(); } });
  E.paper({ z: .95, shadow: 0, tex: 0, draw: c => P.rain(c, t, { n: 70, ang: .35, col: 'rgba(200,215,240,.5)' }) });
}

// ================= 1. ХУК: лампа лопается (0–2.2)
shot(0, 2.2, (lt, t) => {
  const pop = .85, f = Wd.flash(t); const S = E.S; S.cam.zoom = 1.04 + lt * .05; if (lt > pop && lt < pop + .4) S.shake = 9 * (1 - (lt - pop) / .4);
  const fl = lt < pop ? (.55 + .45 * Math.abs(Math.sin(lt * 31) * Math.sin(lt * 13.7))) * (lt > .55 ? (E.hash(Math.floor(lt * 24)) > .45 ? 1 : .15) : 1) : 0;
  E.paper({ z: 3, shadow: 0, draw: c => Wd.roomBack(c, t, { flash: f }) });
  E.paper({ z: 1.5, shadow: 22, draw: c => Wd.lens(c, 360, 600, 330, { lit: fl * .75, bulb: fl }) });
  E.glow(1.5, g => { if (fl > 0) { halo(g, 360, 600, 520, 'rgba(255,215,140,A)', fl * .55); halo(g, 360, 600, 120, 'rgba(255,250,220,A)', fl); } });
  if (lt > pop) E.paper({ z: 1, shadow: 10, tex: 0, draw: c => { c.save(); c.translate(360, 600); c.scale(2.2, 2.2); c.translate(-360, -600); shards(c, lt - pop, 360, 600, 24); c.restore(); } });
  E.flushGlow();
  label('THE LIGHT\nWENT OUT.', 360, 1040, lt - 1.0, { size: 54 });
  E.post({ white: lt > pop && lt < pop + .12 ? 1 - (lt - pop) / .12 : 0 });
});
// ================= 2. Шторм снаружи: корабль идёт на скалы (2.2–6.0)
function extWide(t, lt, o) {
  const f = Wd.sky(t, { bolt: o.bolt, dawn: o.dawn || 0 });
  const p = Wd.pal(o.dawn || 0);
  Wd.sea(t, { y0: 760, y1: 1180, z0: 3.4, z1: 1.0, n: 5, flash: f, storm: o.storm == null ? 1 : o.storm, dawn: o.dawn || 0, before: (i, z) => {
    if (i === 1) { E.paper({ z: 3.0, shadow: 6, draw: c => Wd.ship(c, o.shipX, 770 + Math.sin(t * 2.2) * 6, o.shipS || .4, { lit: 1, heel: Math.sin(t * 1.7) * .06, flip: o.flip }) });
      E.glow(3.0, g => Wd.shipGlow(g, o.shipX, 770 + Math.sin(t * 2.2) * 6, o.shipS || .4, { heel: Math.sin(t * 1.7) * .06, flip: o.flip }, .9)); E.flushGlow(.8); }
    if (i === 2) E.paper({ z: 2.6, shadow: 18, tint: f ? `rgba(220,230,255,${f * .25})` : null, draw: c => { Wd.cliff(c, 430, 860, p); Wd.lighthouse(c, 590, 862, 560, { lamp: o.lampCol }); } });
    if (i === 3) E.paper({ z: 1.6, shadow: 18, tint: (o.rockLit || f) ? `rgba(230,236,255,${Math.max(o.rockLit || 0, f) * .55})` : null, draw: c => { c.fillStyle = p.rock[1]; P.rock(c, 130, 1010, 260, 190, 4); c.fill(); c.fillStyle = p.rock[0]; P.rock(c, 270, 1030, 160, 120, 9); c.fill(); } });
  } });
  if (!o.noRain) E.paper({ z: .9, shadow: 0, tex: 0, draw: c => P.rain(c, t, { n: 80 }) });
  return f;
}
shot(2.2, 6.0, (lt, t) => {
  const S = E.S; S.cam.x = K(lt, [[0, 160], [3.8, -40, 'sine']]); S.cam.zoom = 1.08 - lt * .015;
  const shipX = 120 + lt * 12;
  extWide(t, lt, { shipX, bolt: [200, 120] });
  // маршрут пунктиром: корабль → скалы, крестик
  const r = cl((lt - 1.5) / 1.1);
  if (r > 0) E.paper({ z: 1.6, shadow: 5, tex: 0, draw: c => { c.fillStyle = '#ffd36a'; const x0 = shipX + 60, y0 = 830 + 60, x1 = 120, y1 = 900; const n = 14;
    for (let i = 0; i < n * r; i++) { const k = i / n, x = lerp(x0 * 1.6 - 80, x1, k), y = lerp(y0 - 60, y1, k) - Math.sin(k * Math.PI) * 30; c.save(); c.translate(x, y); c.rotate(Math.atan2(y1 - y0, x1 - x0)); c.fillRect(-7, -3, 14, 6); c.restore(); }
    if (r >= 1) { const k = ease.back(cl((lt - 2.6) / .3)); c.save(); c.translate(130, 905); c.scale(k, k); c.rotate(.785); c.fillStyle = '#ff5a4a'; c.fillRect(-26, -7, 52, 14); c.fillRect(-7, -26, 14, 52); c.restore(); } } });
  label('A SHIP IS HEADING\nFOR THE ROCKS.', 330, 560, lt - 1.2, { size: 40, rot: .02 });
  E.post();
});
// ================= 3. Внутри: Мира у окна, подзорная труба (6.0–8.6)
function room(t, o = {}) {
  const f = o.f == null ? Wd.flash(t) : o.f;
  E.paper({ z: 2.6, shadow: 0, draw: c => { Wd.roomBack(c, t, { flash: f }); } });
  E.paper({ z: 2.55, shadow: 0, tex: 0, alpha: .7, draw: c => { c.beginPath(); for (let i = 0; i < 3; i++) c.rect(-40 + i * 300, 160, 230, 560); c.clip(); P.rain(c, t, { n: 60, col: 'rgba(170,190,230,.5)' }); } });
  if (o.lens !== false) E.paper({ z: 2.0, shadow: 20, draw: c => { c.fillStyle = '#2b2f38'; c.fillRect((o.lensX || 640) - 30, 980, 60, 400); Wd.lens(c, o.lensX || 640, 720, 260, { lit: o.lit || 0, ring: o.ring }); } });
  E.paper({ z: 1.9, shadow: 6, draw: c => floor(c, 1000) });
  return f;
}
shot(6.0, 8.6, (lt, t) => {
  const S = E.S; S.cam.zoom = 1 + lt * .04; S.cam.x = -lt * 10;
  const f = room(t, { lensX: 700 });
  const up = K(lt, [[0, 0], [.9, 0], [1.5, 1, 'back']]);
  const X = 360, Y = 1200, s = 2.0; const L = C.LOOKS.mira;
  // труба: от бедра → к глазу, смотрит в окно (влево-вверх)
  const eye = [X - 15 * s, Y + (L.headY + 2) * s], hip = [X + 70, Y - 230];
  const B = [lerp(hip[0], eye[0] + 10, up), lerp(hip[1], eye[1], up)], ang = lerp(.5, Math.PI + .25, up), len = 95 * s;
  const along = d => [B[0] + Math.cos(ang) * d, B[1] + Math.sin(ang) * d];
  const mp = { x: X, y: Y, s, look: up > .5 ? [-1, -.3] : K(lt, [[0, [-1, -.2]], [.5, [-1, -.2]], [.8, [-.4, .2]], [.9, [-1, -.3]]]), mouth: lt < 1.6 ? 'flat' : 'o', brow: -.6, seed: 1,
    ikR: along(len * .18), ikL: along(len * .62), bendR: 1, bendL: -1, tail: A.lag(tt => K(tt - 6, [[0, 0], [.9, 0], [1.5, 1, 'back']]), t, 9, 4) * -.6 };
  E.paper({ z: 1.3, shadow: 22, tint: f ? `rgba(210,220,255,${f * .3})` : null, draw: c => { C.person(c, 'mira', mp);
    c.save(); c.translate(B[0], B[1]); c.rotate(ang); c.fillStyle = '#7a5a3a'; c.fillRect(0, -12 * s * .6, len, 24 * s * .6); c.fillStyle = '#c9a463'; c.fillRect(-6, -14 * s * .6, 14, 28 * s * .6); c.fillRect(len * .55, -14 * s * .6, 12, 28 * s * .6); c.fillRect(len - 14, -17 * s * .6, 18, 34 * s * .6); c.restore(); } });
  E.post();
});
// ================= 4. Подзорная труба: дедушка на палубе (8.6–11.4)
shot(8.6, 11.4, (lt, t) => {
  const S = E.S; S.cam.x = Math.sin(t * 1.3) * 22 + E.noise1(t * 2) * 20; S.cam.y = Math.cos(t * 1.1) * 18; S.cam.zoom = 1.02 + lt * .03;
  const f = Wd.flash(t);
  deck(t, lt, { f, heel: Math.sin(t * 1.4) * .05, wheel: Math.sin(t * 1.2) * .3, gp: { blink: .45 + .2 * Math.sin(lt * 3), look: [-.3, -.2], aL: 1.05 + Math.sin(t * 1.2) * .1, aR: 1.05 - Math.sin(t * 1.2) * .1 } });
  E.overlay(g => { g.save(); g.beginPath(); g.rect(0, 0, 720, 1280); g.arc(360, 640, 330, 0, TAU, true); g.fillStyle = '#07080c'; g.fill('evenodd');
    g.lineWidth = 26; g.strokeStyle = '#8a6a3c'; g.beginPath(); g.arc(360, 640, 340, 0, TAU); g.stroke(); g.lineWidth = 4; g.strokeStyle = '#c9a463'; g.beginPath(); g.arc(360, 640, 352, 0, TAU); g.stroke();
    const v = g.createRadialGradient(360, 640, 220, 360, 640, 335); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.6)'); g.fillStyle = v; g.beginPath(); g.arc(360, 640, 335, 0, TAU); g.fill(); g.restore(); });
  label('GRANDPA\nIS ON BOARD.', 360, 1110, lt - .7, { size: 42, rot: -.04 });
  E.post({ vig: .3 });
});
// ================= 5. Рубильник: искры, ничего (11.4–14.4)
shot(11.4, 14.4, (lt, t) => {
  const S = E.S; S.cam.zoom = 1.05 + lt * .03; S.cam.x = K(lt, [[0, -60], [1, 20]]);
  const f = room(t, { lensX: 120 });
  const walk = cl(lt / .8), x = lerp(140, 380, ease.out(walk)), ph = lt * 15;
  const pull = K(lt, [[0, 0], [.9, 0], [1.15, -.35], [1.35, .6, 'in']]); // замах вверх → рывок вниз
  const hit = 1.35; const jolt = lt > hit + .05 ? K(lt - hit, [[.05, 0], [.25, 1, 'out'], [1.4, .6]]) : 0;
  const lx = 545, ly = 780, la = -.9 + pull * 1.4, hx = lx + 112 * Math.sin(la), hy = ly - 112 * Math.cos(la);
  E.paper({ z: 1.3, shadow: 18, draw: c => { lever(c, lx, ly, la); c.strokeStyle = '#1e222b'; c.lineWidth = 8; c.beginPath(); c.moveTo(lx, ly + 90); c.lineTo(lx, 1300); c.stroke(); } });
  E.glow(1.3, g => { if (lt > hit) sparksGlow(g, cl((lt - hit) / .7), lx, ly - 30, 16); if (lt > hit && lt < hit + .7) halo(g, lx, ly - 30, 180, 'rgba(255,220,140,A)', (1 - (lt - hit) / .7) * .8); });
  if (lt > hit) E.paper({ z: 1.28, shadow: 4, tex: 0, draw: c => sparks(c, cl((lt - hit) / .7), lx, ly - 30, 16) });
  E.flushGlow();
  const reach = cl((lt - .65) / .3); const grab = lt < hit + .05;
  const restR = [x + 70, 900];
  E.paper({ z: 1.3, shadow: 22, tint: (f || (lt > hit && lt < hit + .5)) ? `rgba(255,230,190,${Math.max(f * .3, lt > hit && lt < hit + .5 ? .25 : 0)})` : null, draw: c => C.person(c, 'mira', {
    x: x - jolt * 50, y: 1200 - Math.abs(Math.sin(ph)) * 10 * (1 - walk), s: 2.0, legL: walk < 1 ? Math.sin(ph) * .35 : 0, legR: walk < 1 ? -Math.sin(ph) * .35 : 0, lean: walk < 1 ? .08 : -jolt * .15,
    ikR: grab ? [lerp(restR[0], hx, reach), lerp(restR[1], hy, reach)] : undefined, aR: 1.6 + jolt * .6, eR: 1.2, bendR: 1, aL: walk < 1 ? .3 + Math.sin(ph) * .4 : .3 + jolt * 1.4, eL: .5 + jolt,
    look: lt < hit ? [.6, -.6] : [.5, -.2], mouth: lt < hit ? 'grit' : 'o', brow: lt < hit ? .6 : -1, browUp: lt > hit ? 1 : 0, seed: 2, tail: (walk < 1 ? -.25 * (1 - walk) : 0) + (lt > hit ? Math.sin((lt - hit) * 12) * .3 * Math.exp(-(lt - hit) * 3) : 0) }) });
  if (lt > 2.1) label('NOTHING.', 360, 340, lt - 2.1, { size: 46, rot: .04 });
  E.post();
});
// ================= 6. Свеча у линзы — задуло (14.4–17.6)
shot(14.4, 17.6, (lt, t) => {
  const S = E.S; S.cam.zoom = 1.0 + lt * .03; const f = Wd.flash(t);
  const gust = K(lt, [[0, 0], [1.3, 0], [1.6, 1, 'out'], [2.5, .3]]); const out = 1.75;
  E.paper({ z: 2.6, shadow: 0, draw: c => Wd.roomBack(c, t, { flash: f }) });
  E.paper({ z: 2.0, shadow: 20, draw: c => Wd.lens(c, 620, 560, 380, { lit: 0 }) });
  E.paper({ z: 1.7, shadow: 0, tex: 0, draw: c => P.rain(c, t, { n: Math.round(40 + gust * 80), ang: lerp(.25, 1.2, gust), spd: 1500 + gust * 1200, col: 'rgba(190,210,240,.6)' }) });
  const mp = { x: 280, y: 1560, s: 3.1, ikR: [480, 860], bendR: 1, aL: .3, eL: .8, hold: 'candle', holdA: gust * .25, look: lt < out ? [.4, -.5] : [.2, -.3], mouth: lt < 1.2 ? 'small' : (lt < out + .2 ? 'o' : 'frown'), brow: lt < 1.2 ? -.2 : -1, seed: 4,
    tail: .7 * gust + Math.sin(t * 9) * .1 * gust, hem: gust, browUp: lt > 1.4 && lt < 2.2 ? 1 : 0 };
  let tip; E.paper({ z: 1.2, shadow: 22, tint: `rgba(255,170,90,${lt < out ? .1 : 0})`, draw: c => { tip = C.person(c, 'mira', mp); } });
  const fl = lt < out ? (lt < 1.3 ? 1 : 1 - (lt - 1.3) / .45 * .6) : 0;
  // свеча: пламя — бумажная капля + свечение
  const ct = tip ? tip.top : [0, 0];
  if (fl > 0) { E.paper({ z: 1.2, shadow: 0, tex: 0, draw: c => { c.save(); c.translate(ct[0], ct[1]); c.rotate(gust * .9 + Math.sin(t * 17) * .08); c.scale(1, fl); c.fillStyle = '#ffd36a'; c.beginPath(); c.moveTo(0, -46); c.quadraticCurveTo(18, -10, 0, 4); c.quadraticCurveTo(-18, -10, 0, -46); c.fill(); c.fillStyle = '#fff6d0'; c.beginPath(); c.ellipse(0, -10, 6, 12, 0, 0, TAU); c.fill(); c.restore(); } });
    E.glow(1.2, g => halo(g, ct[0], ct[1] - 20, 200, 'rgba(255,180,90,A)', fl * (.4 + .06 * Math.sin(t * 23)))); E.glow(1.2, g => halo(g, ct[0], ct[1] - 22, 40, 'rgba(255,240,200,A)', fl * .8)); }
  if (lt > out) E.paper({ z: 1.15, shadow: 0, tex: 0, draw: c => smoke(c, ct[0] + 10, ct[1] - 10, lt - out, 7) });
  E.flushGlow();
  E.post();
});
// ================= 7. Галерея: фонарик слишком слабый (17.6–21.0)
function gallery(t, o = {}) {
  const f = o.f == null ? Wd.sky(t, { drift: t * 30, skyY: 200 }) : o.f;
  Wd.sea(t, { y0: 940, y1: 1250, z0: 3.6, z1: 2.4, n: 3, flash: f, before: (i) => { if (i === 1 && o.ship !== false) { E.paper({ z: 3.3, shadow: 4, draw: c => Wd.ship(c, o.shipX || 560, 965, .22, { lit: 1 }) }); E.glow(3.3, g => Wd.shipGlow(g, o.shipX || 560, 965, .22, {}, .9)); E.flushGlow(.8); } } });
  // стекло фонарной слева за спиной
  E.paper({ z: 1.5, shadow: 22, tint: f ? `rgba(210,220,255,${f * .3})` : null, draw: c => { c.fillStyle = '#2a2f3a'; c.fillRect(-400, 120, 640, 1100);
    for (let i = 0; i < 3; i++) { c.fillStyle = Wd.mix('#1a2236', '#8090c0', f); c.fillRect(-380 + i * 205, 150, 185, 860); } c.fillStyle = '#2a2f3a'; c.fillRect(-400, 100, 660, 40); } });
  E.paper({ z: 1.3, shadow: 14, draw: c => { c.fillStyle = '#232833'; c.fillRect(-400, 1100, 1600, 400); c.strokeStyle = 'rgba(255,255,255,.08)'; c.lineWidth = 2; for (let i = 0; i < 30; i++) { c.beginPath(); c.moveTo(-400 + i * 50, 1100); c.lineTo(-500 + i * 60, 1400); c.stroke(); } } });
  return f;
}
function railing(c, y, col = '#262b35') { c.fillStyle = col; c.fillRect(-300, y, 1400, 16); c.fillRect(-300, y + 150, 1400, 12); for (let i = 0; i < 20; i++) c.fillRect(-300 + i * 80, y, 9, 300); }
function beam(g, x, y, ang, len, w0, w1, a, col = 'rgba(255,248,210,A)') { g.save(); g.translate(x, y); g.rotate(ang); const gr = g.createLinearGradient(0, 0, len, 0); gr.addColorStop(0, col.replace('A', a)); gr.addColorStop(1, col.replace('A', 0));
  g.fillStyle = gr; g.beginPath(); g.moveTo(0, -w0); g.lineTo(len, -w1); g.lineTo(len, w1); g.lineTo(0, w0); g.closePath(); g.fill(); g.restore(); }
shot(17.6, 21.0, (lt, t) => {
  const S = E.S; S.cam.zoom = 1.02 + lt * .02; S.cam.x = lt * 8;
  const f = gallery(t, { shipX: 600 - lt * 6 });
  const slump = K(lt, [[0, 0], [2.3, 0], [3.0, 1, 'out']]);
  const on = lt < .25 ? 0 : (lt > 1.5 && lt < 2.1 ? (E.hash(Math.floor(lt * 20)) > .5 ? 1 : .2) : (lt > 2.1 ? Math.max(0, 1 - (lt - 2.1) * 3) * .5 + .15 : 1));
  const mp = { x: 240, y: 1110, s: 1.75, hood: 1, aR: lerp(1.75, .5, slump), eR: lerp(.05, .2, slump), aL: lerp(.2, .1, slump), hold: 'flash', holdA: lerp(.25, 1.2, slump), flashOn: on > .3,
    look: lt < 2.3 ? [1, .3] : [.2, 1], mouth: lt < 1.4 ? 'grit' : (lt < 2.3 ? 'flat' : 'frown'), brow: lt < 1.4 ? .3 : -1, lean: slump * .12, seed: 5, blink: slump * .5, tail: Math.sin(t * 6) * .12 };
  let hp; E.paper({ z: 1.25, shadow: 20, tint: f ? `rgba(210,220,255,${f * .3})` : null, draw: c => { hp = C.person(c, 'mira', mp); } });
  E.glow(1.25, g => { if (hp && on > .05) { beam(g, hp.tip[0], hp.tip[1], hp.tipA, 300, 6, 70, .55 * on); halo(g, hp.tip[0], hp.tip[1], 40, 'rgba(255,250,220,A)', on); } });
  E.flushGlow();
  E.paper({ z: 1.1, shadow: 16, draw: c => railing(c, 900) });
  E.paper({ z: .9, shadow: 0, tex: 0, draw: c => P.rain(c, t, { n: 110, col: 'rgba(200,215,240,.6)' }) });
  label('TOO WEAK.', 470, 380, lt - 1.9, { size: 46, rot: -.05 });
  E.post();
});
// ================= 8. Светлячок садится на фонарик (21.0–24.6)
shot(21.0, 24.6, (lt, t) => {
  const S = E.S; S.cam.zoom = 1.0 + lt * .025;
  const land = 1.2, b1 = 1.8, b2 = 2.1; const pull = K(lt, [[0, 0], [2.3, 0], [2.9, 1]]);
  S.aperture = 3.0; S.focus = lerp(1.0, 1.9, pull);
  Wd.sky(t, { drift: t * 30, skyY: 300 });
  // лицо Миры сзади (сначала размыто)
  const react = cl((lt - 2.4) / .3);
  E.paper({ z: 2.2, shadow: 20, draw: c => C.person(c, 'mira', { x: 300, y: 1620, s: 4.2, hood: 1, aR: .1, aL: .1, look: react > 0 ? [.35, .5] : [.2, .9], blink: react > 0 ? 0 : .5, mouth: react > .5 ? 'small' : 'frown', brow: react > 0 ? -.3 : -1, browUp: react, seed: 6 }) });
  E.paper({ z: 1.6, shadow: 0, tex: 0, draw: c => P.rain(c, t, { n: 50, col: 'rgba(200,215,240,.45)' }) });
  // рука с фонариком на переднем плане
  E.paper({ z: 1.0, shadow: 26, draw: c => { c.save(); c.translate(250, 1060); c.rotate(-.18); c.fillStyle = '#f2b632'; c.fillRect(-420, -55, 300, 110); c.fillStyle = '#f4cfae'; c.beginPath(); c.ellipse(-110, 0, 70, 62, 0, 0, TAU); c.fill();
    c.fillStyle = '#3d4b5e'; c.fillRect(-160, -42, 400, 84); c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(-160, -42, 400, 14); c.fillStyle = '#9aa7b8'; c.fillRect(230, -66, 90, 132); c.fillStyle = '#56606e'; c.fillRect(318, -56, 10, 112);
    c.fillStyle = '#f4cfae'; c.beginPath(); c.ellipse(-60, -36, 30, 24, -.3, 0, TAU); c.fill(); c.restore(); } });
  // светлячок: подлетает по кривой, садится, складывает крылья, мигает
  const u = cl(lt / land); const fx = lerp(-60, 330, ease.out(u)) + Math.sin(u * 9) * 40 * (1 - u), fy = lerp(560, 948, ease.io(u)) + Math.cos(u * 7) * 60 * (1 - u);
  const lit = (lt < land ? .35 + .2 * Math.sin(lt * 9) : 0) + (Math.max(0, 1 - Math.abs(lt - b1) / .12) + Math.max(0, 1 - Math.abs(lt - b2) / .12)) + (lt > 2.9 ? .3 : 0);
  E.paper({ z: 1.0, shadow: 10, draw: c => C.firefly(c, fx, fy, 2.6, t, { rot: lt < land ? .9 * (1 - u) + .3 : -.15, flap: lt < land ? undefined : 0, open: lt < land ? 1 : 0, lit: lit > .5 }) });
  E.glow(1.0, g => C.fireflyGlow(g, fx + Math.sin(lt < land ? .3 : -.15) * -38, fy + 38, 3.4, Math.min(1, lit)));
  E.flushGlow(1.2);
  E.post();
});
