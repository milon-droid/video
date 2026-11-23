// МАЯК — часть 2: сигнал → луг отвечает → рой → линза → луч → поворот → рассвет → объятие → финал.
// ---------- светлячки луга: позиции детерминированы (слой i, номер j)
const FF = (() => {
  const list = []; for (let i = 0; i < 260; i++) { const r = E.hash(i * 1.37 + 5), q = E.hash(i * 2.71 + 1), l = Math.floor(E.hash(i * .73) * 4);
    list.push({ i, x: -200 + r * 1120, y: 760 + l * 120 + q * 160, l, ph: E.hash(i * 9.1) }); }
  // волна ответа: от точки (sx,sy) со скоростью v; каждая мигает 2 раза с интервалом 0.25, потом периодично
  function lit(ff, lt, sx = 360, sy = 900, v = 520) { const d = Math.hypot(ff.x - sx, ff.y - sy), t0 = d / v; const u = lt - t0; if (u < 0) return 0;
    const p = (u % 1.1); return Math.max(0, 1 - Math.abs(p - .1) / .1) + Math.max(0, 1 - Math.abs(p - .38) / .1) * .9 + .12; }
  return { list, lit };
})();
function meadow(t, y0, f, seed = 4) {
  const cols = ['#142028', '#18282c', '#1c3230', '#223c34'], rims = ['#24363c', '#2a4440', '#30503f', '#3a5e46'];
  for (let l = 0; l < 4; l++) E.paper({ z: 3.2 - l * .55, shadow: 16, tint: f ? `rgba(210,220,255,${f * .25})` : null, draw: c => {
    const o = { y: y0 + l * 150, amp: 34, len: 460 + l * 90, ph: l * 2.1 + seed, seed: l + seed, x0: -500, x1: 1300 };
    c.fillStyle = cols[l]; P.wave(c, o); c.fill(); c.fillStyle = rims[l]; P.grass(c, -500, 1300, o.y - 4 + l * 2, 14 + l * 5, l + seed, Math.sin(t * 2 + l) * 3); c.save(); P.wave(c, Object.assign({}, o, { y: o.y + 26 })); c.restore();
    // стебли с колосками
    c.strokeStyle = rims[l]; c.lineWidth = 2 + l; for (let k = 0; k < 9; k++) { const x = -200 + k * 140 + E.hash(k + l * 9) * 90, y = o.y + 40 + E.hash(k * 3 + l) * 30, h = 60 + 50 * E.hash(k * 7 + l) + l * 20, sw = Math.sin(t * 1.6 + k) * 6;
      c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + sw, y - h * .6, x + sw * 1.5, y - h); c.stroke(); c.fillStyle = rims[l]; c.beginPath(); c.ellipse(x + sw * 1.5, y - h, 5 + l, 12 + l * 2, sw * .03, 0, TAU); c.fill(); } } });
}
// ================= 9. Сигнал фонариком в сторону луга (24.6–27.6)
shot(24.6, 27.6, (lt, t) => {
  const S = E.S; S.cam.zoom = 1.04 + lt * .02; S.cam.y = -lt * 10;
  const f = Wd.sky(t, { drift: t * 20, skyY: -40 }); const p = Wd.pal(0);
  // луг на утёсе (сверху вниз): холмы слоями
  meadow(t, 660, f, 4);
  // ответы: сначала один, потом несколько
  const answers = [[2.0, 300, 1010, 1], [2.45, 470, 880, 1], [2.55, 160, 940, 1], [2.75, 560, 1080, 1], [2.8, 250, 820, 1], [2.9, 410, 1180, 1]];
  E.glow(1.6, g => { for (const [ta, x, y] of answers) { const u = lt - ta; if (u < 0) continue; const v = Math.max(0, 1 - Math.abs((u % .9) - .08) / .1) + .15; C.fireflyGlow(g, x, y, 1.9, Math.min(1, v)); } });
  E.flushGlow();
  // Мира на галерее справа сверху, светит вниз-влево: 3 вспышки
  const fl = [[.3, .55], [.75, 1.0], [1.2, 1.45]]; const on = fl.some(([a, b]) => lt > a && lt < b) ? 1 : 0;
  let hp; E.paper({ z: 1.2, shadow: 20, draw: c => { c.fillStyle = '#2a2f3a'; c.fillRect(420, 560, 500, 30); c.fillStyle = '#e7e1d3'; c.fillRect(470, -100, 400, 660); c.fillStyle = '#c33b32'; c.fillRect(470, 300, 400, 90);
    hp = C.person(c, 'mira', { x: 560, y: 565, s: 1.25, side: -1, hood: 1, aR: 1.6, eR: .25, hold: 'flash', holdA: 1.05, flashOn: on, look: lt < 1.9 ? [.5, .8] : [.8, .8], mouth: lt < 2.1 ? 'grit' : 'small', brow: lt < 2.1 ? .4 : -.2, browUp: lt > 2.1 ? 1 : 0, seed: 7 });
    railing(c, 470); } });
  E.glow(1.2, g => { if (hp && on) { beam(g, hp.tip[0], hp.tip[1], hp.tipA, 520, 8, 110, .55); halo(g, hp.tip[0], hp.tip[1], 50, 'rgba(255,250,220,A)', 1); } });
  E.flushGlow();
  E.paper({ z: .9, shadow: 0, tex: 0, draw: c => P.rain(c, t, { n: 70, col: 'rgba(200,215,240,.45)' }) });
  E.post();
});
// ================= 10. Луг отвечает тысячами огней, рой поднимается (27.6–30.6)
shot(27.6, 30.6, (lt, t) => {
  const S = E.S; S.cam.y = K(lt, [[0, 80], [1.6, 60], [3, -240, 'in']]); S.cam.zoom = 1.0 + lt * .02;
  const f = Wd.sky(t, { drift: t * 20, skyY: -100 });
  E.paper({ z: 3.6, shadow: 14, draw: c => { Wd.lighthouse(c, 360, 640, 520); } });
  const rise = u => Math.max(0, lt - 1.5 - u * .6);
  for (let l = 0; l < 4; l++) {
    { const cols = ['#142028', '#18282c', '#1c3230', '#223c34'], rims = ['#24363c', '#2a4440', '#30503f', '#3a5e46']; E.paper({ z: 3.0 - l * .5, shadow: 16, draw: c => { const o = { y: 700 + l * 150, amp: 34, len: 480 + l * 90, ph: l * 2.3, seed: l + 7, x0: -500, x1: 1300 }; c.fillStyle = cols[l]; P.wave(c, o); c.fill(); c.fillStyle = rims[l]; P.grass(c, -500, 1300, o.y - 2, 16 + l * 5, l + 9, Math.sin(t * 2 + l) * 3); c.fill(); } }); }
    E.glow(3.0 - l * .5, g => { for (const ff of FF.list) { if (ff.l !== l) continue; const r = rise(ff.ph); const y = ff.y - r * r * 260 - r * 120, x = ff.x + Math.sin(t * 2 + ff.i) * 14 + r * (360 - ff.x) * .25;
      const v = FF.lit(ff, lt, 360, 950, 700); C.fireflyGlow(g, x, y, .9 + l * .3, Math.min(1, r > 0 ? .6 : v)); } });
    E.flushGlow(1.1);
  }
  E.post({ vig: .5 });
});
// ================= 11. Река света вокруг башни вверх (30.6–34.0)
shot(30.6, 34.0, (lt, t) => {
  const S = E.S; S.cam.y = K(lt, [[0, 520], [3.4, -560, 'sine']]); S.cam.zoom = 1.08;
  const f = Wd.sky(t, { drift: t * 20, skyY: -300 });
  const TX = 360, base = 1500, top = -500, Rh = 210;
  const N = 520; const pts = [];
  for (let i = 0; i < N; i++) { const u0 = E.hash(i * 3.3), sp = .34 + .1 * E.hash(i * 1.9); const u = (lt * sp - u0 * .6 + .25); if (u < 0 || u > 1.1) continue;
    const th = u * TAU * 2.4 + E.hash(i) * .5; const r = Rh * (1 + .25 * Math.sin(i)) * (1 - .15 * u);
    pts.push({ x: TX + Math.cos(th) * r + (E.hash(i * 5) - .5) * 18, y: lerp(base, top, u) + (E.hash(i * 7) - .5) * 26 + Math.sin(th) * 50, front: Math.sin(th) > 0, a: Math.min(1, (1.1 - u) * 3) * (.6 + .4 * Math.sin(t * 9 + i)) }); }
  E.glow(1.5, g => { for (const q of pts) if (!q.front) C.fireflyGlow(g, q.x, q.y, .55, q.a * .5); }); E.flushGlow(.6);
  E.paper({ z: 1.5, shadow: 24, draw: c => { const w0 = 280, w1 = 200; c.beginPath(); c.moveTo(TX - w0 / 2, 1900); c.lineTo(TX - w1 / 2, -300); c.lineTo(TX + w1 / 2, -300); c.lineTo(TX + w0 / 2, 1900); c.closePath(); P.fill(c, '#e7e1d3', .25);
    c.save(); c.clip(); c.fillStyle = '#bf3a31'; for (let i = 0; i < 4; i++) c.fillRect(0, 1500 - i * 560, 720, 200); const sg = c.createLinearGradient(TX - w0 / 2, 0, TX + w0 / 2, 0); sg.addColorStop(0, 'rgba(0,0,0,.05)'); sg.addColorStop(1, 'rgba(0,0,0,.45)'); c.fillStyle = sg; c.fillRect(0, -400, 720, 2400); c.restore();
    c.fillStyle = '#1d2433'; for (let i = 0; i < 4; i++) { c.beginPath(); c.ellipse(TX, 1300 - i * 520, 22, 34, 0, 0, TAU); c.fill(); }
    c.fillStyle = '#2a2f3a'; c.fillRect(TX - 190, -330, 380, 30); } });
  // свет снизу на башне — от роя
  E.glow(1.5, g => { for (const q of pts) if (q.front) C.fireflyGlow(g, q.x, q.y, .7, q.a * .75); }); E.flushGlow(.75);
  E.paper({ z: .9, shadow: 0, tex: 0, alpha: .6, draw: c => P.rain(c, t, { n: 60 }) });
  E.post({ vig: .5 });
});
// ================= 12. Рой влетает в линзу, кольца загораются (34.0–37.0)
shot(34.0, 37.0, (lt, t) => {
  const S = E.S; S.cam.zoom = 1.02 + lt * .04; if (lt > 2.4 && lt < 2.9) S.shake = 6 * (1 - (lt - 2.4) / .5);
  const ring = i => cl((lt - 1.0 - (6 - i) * .18) / .25), all = cl((lt - 1.0) / 1.4);
  const warm = `rgba(255,236,170,${all * .28})`;
  E.paper({ z: 2.6, shadow: 0, tint: warm, draw: c => Wd.roomBack(c, t, { flash: 0 }) });
  E.paper({ z: 2.0, shadow: 20, draw: c => { c.fillStyle = '#2b2f38'; c.fillRect(470, 980, 60, 400); Wd.lens(c, 500, 640, 290, { ring, lit: all }); } });
  E.glow(2.0, g => { halo(g, 500, 640, 600, 'rgba(255,240,170,A)', all * .5); halo(g, 500, 640, 260, 'rgba(255,255,230,A)', all * .7);
    for (let i = 0; i < 160; i++) { const u = cl((lt - E.hash(i) * 1.3) / 1.1); if (u <= 0 || u >= 1) continue; const a0 = E.hash(i * 2) * TAU; const sx = -100, sy = 300 + E.hash(i * 3) * 500;
      const r = (1 - u) * 300; const x = lerp(sx, 500 + Math.cos(a0 + u * 8) * r, ease.io(u)), y = lerp(sy, 640 + Math.sin(a0 + u * 8) * r, ease.io(u)); C.fireflyGlow(g, x, y, .9, .9); } });
  E.flushGlow(1.1);
  E.paper({ z: 1.9, shadow: 6, tint: warm, draw: c => floor(c, 1000) });
  E.paper({ z: 1.15, shadow: 22, tint: `rgba(255,236,170,${all * .25})`, draw: c => C.person(c, 'mira', { x: 150, y: 1500, s: 2.6, aR: lerp(.3, 1.2, all), eR: lerp(.3, 1.0, all), aL: .2, look: [1, -.4], mouth: lt < 1.2 ? 'o' : 'open', brow: -.2, browUp: 1, seed: 8 }) });
  E.post({ white: lt > 2.4 && lt < 2.7 ? (1 - (lt - 2.4) / .3) * .7 : 0 });
});
// ================= 13. ЛУЧ: режет шторм, находит скалы (37.0–40.2)
function lhBeam(t, ang, a, z = 2.6, x = 590, y = 862 - 560 + 39 - 560 * .07) {
  E.glow(z, g => { beam(g, x, y, ang, 1400, 16, 230, .7 * a); beam(g, x, y, ang, 1400, 6, 70, .5 * a, 'rgba(255,255,240,A)'); halo(g, x, y, 90, 'rgba(255,250,220,A)', a); });
}
shot(37.0, 40.2, (lt, t) => {
  const S = E.S; S.cam.x = K(lt, [[0, 60], [3.2, -60]]); S.cam.zoom = 1.06;
  const ang = K(lt, [[0, -.25], [.15, -.25], [1.6, Math.PI - .55, 'io'], [3.2, Math.PI - .42]]); const a = cl(lt / .12);
  const hitRock = cl((lt - 1.4) / .3) * (1 - cl((lt - 2.6) / .5) * .3);
  extWide(t, lt, { shipX: 95 + lt * 8, shipS: .42, rockLit: hitRock, lampCol: '#fff6c8' });
  lhBeam(t, ang, a);
  E.flushGlow(1.2);
  label('THERE!', 300, 1160, lt - 1.6, { size: 50, rot: -.06 });
  E.post();
});
// ================= 14. Дедушка видит скалы, крутит штурвал (40.2–43.4)
shot(40.2, 43.4, (lt, t) => {
  const S = E.S; S.cam.zoom = 1.04 + lt * .02; S.cam.rot = K(lt, [[0, 0], [1.0, 0], [2.4, -.08], [3.2, -.05]]);
  const see = lt > .35; const spin = K(lt, [[0, 0], [.9, 0], [2.8, 9, 'in'], [3.2, 10.5, 'out']]);
  const sweep = Math.max(0, 1 - Math.abs(lt - .3) / .5);
  deck(t, lt, { f: 0, heel: K(lt, [[0, 0], [1.2, 0], [2.6, .1]]), wheel: spin, handRot: Math.sin(spin * 1.3) * .5, tint: `rgba(255,248,210,${sweep * .55})`,
    gp: { look: see ? [-.6, -.3] : [0, 0], mouth: see && lt < 1.0 ? 'o' : 'grit', brow: lt < 1.0 ? -.2 : .8, browUp: see && lt < 1.0 ? 1 : 0, lean: K(lt, [[0, 0], [1.2, 0], [2, -.06]]), blink: 0 } });
  E.glow(1.5, g => beam(g, -300, 300 + lt * 60, .25, 1400, 30, 160, sweep * .6));
  E.flushGlow();
  E.post();
});
// ================= 15. Корабль отворачивает в волоске от скал (43.4–46.4)
shot(43.4, 46.4, (lt, t) => {
  const S = E.S; S.cam.x = K(lt, [[0, -40], [3, 40]]); S.cam.zoom = 1.0;
  const f = Wd.sky(t, { drift: t * 20 });
  const flip = K(lt, [[0, 1], [.6, 1], [1.5, -1, 'io']]); const sx = K(lt, [[0, 140], [1.4, 330], [3, 260]]), sy = K(lt, [[0, 900], [1.4, 880], [3, 830]]), ss = K(lt, [[0, .95], [1.4, .9], [3, .62]]);
  const sweep = .55 + .45 * Math.sin(lt * 2.2);
  Wd.sea(t, { y0: 800, y1: 1220, z0: 3.0, z1: 1.0, n: 5, before: (i) => {
    if (i === 2) { const heel = Math.sin(t * 1.7) * .05 + (flip < 1 && flip > -1 ? .12 * (1 - Math.abs(flip)) : 0); E.paper({ z: 2.0, shadow: 16, tint: `rgba(255,248,210,${sweep * .2})`, draw: c => Wd.ship(c, sx, sy + Math.sin(t * 2) * 8, ss, { lit: 1, flip, heel }) });
      E.glow(2.0, g => Wd.shipGlow(g, sx, sy + Math.sin(t * 2) * 8, ss, { flip, heel }, .9)); E.flushGlow(.9); }
    if (i === 4) E.paper({ z: 1.08, shadow: 24, tint: `rgba(255,248,215,${sweep * .45})`, draw: c => { c.fillStyle = '#20262f'; P.rock(c, -40, 1180, 420, 520, 4); c.fill(); c.fillStyle = '#161b23'; P.rock(c, 180, 1240, 220, 300, 12); c.fill(); } });
  } });
  // брызги о скалы — бумажные капли
  E.paper({ z: 1.05, shadow: 6, tex: 0, draw: c => { c.fillStyle = 'rgba(225,238,250,.9)'; for (let i = 0; i < 18; i++) { const u = ((lt * .9 + E.hash(i)) % 1); const x = 120 + (E.hash(i * 3) - .5) * 300 + u * 60 * (E.hash(i * 5) - .5), y = 900 - Math.sin(u * Math.PI) * (160 + 140 * E.hash(i * 7)); c.beginPath(); c.ellipse(x, y, 8 * (1 - u) + 3, 12 * (1 - u) + 4, 0, 0, TAU); c.fill(); } } });
  E.glow(1.5, g => beam(g, 900, 200, Math.PI - .5 + Math.sin(lt * 2.2) * .12, 1400, 20, 220, .45));
  E.flushGlow();
  E.paper({ z: .9, shadow: 0, tex: 0, draw: c => P.rain(c, t, { n: 70 }) });
  E.post();
});
// ================= 16. Мира прыгает от радости (46.4–48.6)
shot(46.4, 48.6, (lt, t) => {
  const S = E.S; S.cam.zoom = 1.06 - lt * .02;
  const jumpK = [[0, 0], [.25, -14], [.55, 120, 'out'], [.85, 0, 'in'], [1.0, -12], [1.25, 90, 'out'], [1.5, 0, 'in'], [1.65, -8], [1.8, 0]];
  const j = K(lt, jumpK); const squash = j < 0 ? -j / 14 : 0;
  E.paper({ z: 2.6, shadow: 0, tint: 'rgba(255,236,170,.28)', draw: c => Wd.roomBack(c, t, { flash: 0 }) });
  E.paper({ z: 2.0, shadow: 20, draw: c => Wd.lens(c, 360, 560, 300, { lit: 1 }) });
  E.glow(2.0, g => { halo(g, 360, 560, 560, 'rgba(255,240,170,A)', .5); halo(g, 360, 560, 240, 'rgba(255,255,230,A)', .7); for (let i = 0; i < 40; i++) { const a = i / 40 * TAU + t * .5; C.fireflyGlow(g, 360 + Math.cos(a) * (330 + 40 * Math.sin(i + t)), 560 + Math.sin(a) * (330 + 40 * Math.sin(i * 2 + t)), .9, .5 + .5 * Math.sin(t * 6 + i)); } });
  E.flushGlow();
  E.paper({ z: 1.9, shadow: 6, tint: 'rgba(255,236,170,.2)', draw: c => floor(c, 1000) });
  const up = j > 10 ? 1 : 0;
  E.paper({ z: 1.3, shadow: 22, tint: 'rgba(255,236,170,.2)', draw: c => { c.save(); c.translate(360, 1230); c.scale(1 + squash * .08, 1 - squash * .1); c.translate(-360, -1230);
    C.person(c, 'mira', { x: 360, y: 1230, s: 2.1, jump: j, aR: lerp(.4, 2.8, cl(j / 60)), eR: -.2, aL: lerp(.4, 2.8, cl(j / 60)), eL: -.2, mouth: 'open', brow: -.3, browUp: 1, blink: j > 60 ? 1 : 0, legL: up * -.25, legR: up * .25, tail: A.lag(tt => K(tt - 46.4, jumpK) / 100, t, 10, 3) * 1.2, hem: A.lag(tt => K(tt - 46.4, jumpK) / 100, t, 10, 3) * .6, seed: 9 }); c.restore(); } });
  E.post();
});
// ================= 17. Рассвет: шторм ушёл, корабль у причала, светлячки уходят (48.6–53.0)
shot(48.6, 53.0, (lt, t) => {
  const S = E.S; S.cam.zoom = 1.12 - lt * .025; S.cam.y = -lt * 8;
  const m = cl(lt / 1.2) * .6 + .4;
  Wd.sky(t, { dawn: m, flash: 0, drift: 200 + t * 6 });
  const p = Wd.pal(m);
  Wd.sea(t, { y0: 820, y1: 1200, z0: 3.4, z1: 1.1, n: 5, storm: .12, dawn: m, before: (i) => {
    if (i === 2) E.paper({ z: 2.6, shadow: 18, draw: c => { Wd.cliff(c, 430, 900, p); Wd.lighthouse(c, 590, 902, 560, { lamp: '#fff2c0' });
      c.fillStyle = '#6b4a34'; c.fillRect(250, 930, 200, 14); for (let k = 0; k < 5; k++) c.fillRect(260 + k * 44, 930, 8, 60); Wd.ship(c, 250, 960, .42, { lit: 0 }); } });
  } });
  E.glow(2.6, g => { for (let i = 0; i < 70; i++) { const u = cl((lt - E.hash(i) * 1.5) / 3); if (u <= 0) continue; const x = 590 + (E.hash(i * 3) - .5) * 200 + Math.sin(t * 2 + i) * 30 + u * (E.hash(i * 5) - .5) * 600, y = 340 - u * 600 - E.hash(i * 7) * 80;
    C.fireflyGlow(g, x, y, .8, (1 - u) * (.6 + .4 * Math.sin(t * 7 + i))); } });
  E.flushGlow();
  // чайки — бумажные галочки
  E.paper({ z: 2.2, shadow: 6, draw: c => { c.strokeStyle = '#4b4a5a'; c.lineWidth = 4; c.lineCap = 'round'; for (let i = 0; i < 3; i++) { const x = 80 + i * 70 + lt * 40, y = 420 + i * 30 + Math.sin(t * 3 + i) * 8, w = Math.sin(t * 8 + i) * 8; c.beginPath(); c.moveTo(x - 18, y - w); c.quadraticCurveTo(x - 8, y - 10, x, y); c.quadraticCurveTo(x + 8, y - 10, x + 18, y - w); c.stroke(); } } });
  E.post({ vig: .35 });
});
// ================= 18. Дедушка поднимается, объятие (53.0–56.0)
shot(53.0, 56.0, (lt, t) => {
  const S = E.S; S.cam.zoom = 1.4 + lt * .04; S.cam.y = 250; S.cam.x = 20;
  const sun = 'rgba(255,214,160,.25)';
  E.paper({ z: 2.6, shadow: 0, tint: sun, draw: c => { c.fillStyle = '#b8876a'; c.fillRect(-400, -400, 1600, 2200); for (let i = 0; i < 3; i++) { const x = -40 + i * 300; c.fillStyle = '#ffcf98'; c.fillRect(x, 160, 230, 560); c.strokeStyle = '#6a4b30'; c.lineWidth = 12; c.strokeRect(x, 160, 230, 560); c.lineWidth = 7; c.beginPath(); c.moveTo(x + 115, 160); c.lineTo(x + 115, 720); c.moveTo(x, 440); c.lineTo(x + 230, 440); c.stroke(); } } });
  E.glow(2.6, g => { for (let i = 0; i < 3; i++) halo(g, 75 + i * 300, 440, 200, 'rgba(255,220,170,A)', .22); });
  E.flushGlow();
  E.paper({ z: 1.9, shadow: 6, tint: sun, draw: c => floor(c, 1000, '#6a4a36') });
  const meet = 1.1; const kneel = K(lt, [[.2, 0], [.8, 1, 'out']]);
  const mx = K(lt, [[0, -40], [meet, 330, 'out']]), ph = lt * 16, run = lt < meet;
  const hug = cl((lt - meet) / .35), sway = hug * Math.sin((lt - meet) * 2.4) * .03;
  const gpX = 470, gpY = 1230 + kneel * 150;
  const L = C.LOOKS.grandpa, gs = 1.5; const neck = [gpX + 10, gpY + (L.sh + 5) * gs];
  E.paper({ z: 1.3, shadow: 22, tint: sun, draw: c => {
    C.person(c, 'grandpa', { x: gpX, y: gpY, s: gs, side: -1, lean: kneel * .1 + sway, legL: kneel * .9, legR: -kneel * .5, aL: .3, eL: .3, aR: lerp(.2, .9, kneel), eR: lerp(.1, .9, kneel),
      mouth: hug > .4 ? 'smile' : 'open', brow: -.3, blink: hug > .6 ? 1 : 0, look: [.7, .3], seed: 10 });
    const my = 1230 - (run ? Math.abs(Math.sin(ph)) * 18 : 0) - hug * 20;
    C.person(c, 'mira', { x: mx, y: my, s: 1.6, legL: run ? Math.sin(ph) * .45 : -hug * .2, legR: run ? -Math.sin(ph) * .45 : hug * .3, lean: run ? .12 : .1 * hug - sway,
      ikR: hug > 0 ? [lerp(mx + 60, neck[0] + 30, hug), lerp(my - 300, neck[1] - 10, hug)] : undefined, bendR: 1, aR: .4 - Math.sin(ph) * .6, eR: .6, aL: run ? .4 + Math.sin(ph) * .6 : .3, eL: .6,
      mouth: 'open', brow: -.3, browUp: 1, blink: hug > .6 ? 1 : 0, tail: A.lag(tt => K(tt - 53, [[0, -40], [meet, 330, 'out']]) / 100, t, 10, 3) * -1.2, seed: 11 });
    // рука дедушки обнимает Миру за спину (поверх)
    if (hug > 0) { const sx = gpX - 30, sy = gpY + (L.sh + 20) * gs; const ex = sx - 60, ey = sy + 70, hx = lerp(sx - 40, mx - 20, hug), hy = lerp(sy + 120, my - 200, hug);
      c.strokeStyle = '#2f5d55'; c.lineWidth = L.H * .055 * gs; c.lineCap = 'round'; c.beginPath(); c.moveTo(sx, sy); c.lineTo(ex, ey); c.lineTo(hx, hy); c.stroke(); c.fillStyle = '#e9bf9b'; c.beginPath(); c.arc(hx - 4, hy, L.H * .032 * gs, 0, TAU); c.fill(); }
  } });
  E.post({ vig: .35 });
});
// ================= 19. Последний светлячок мигает дважды и улетает (56.0–60.0)
shot(56.0, 60.0, (lt, t) => {
  const S = E.S; S.cam.zoom = 1.0 + lt * .02; S.aperture = 3.0; S.focus = 1.0;
  Wd.sky(t, { dawn: 1, flash: 0, drift: 260 + t * 6 });
  Wd.sea(t, { y0: 900, y1: 1150, z0: 3.6, z1: 2.4, n: 3, storm: .1, dawn: 1 });
  E.paper({ z: 1.0, shadow: 20, draw: c => { c.fillStyle = '#3b3533'; c.fillRect(-300, 1000, 1400, 34); c.fillRect(-300, 1180, 1400, 22); for (let i = 0; i < 10; i++) c.fillRect(-300 + i * 160, 1000, 14, 400); } });
  const b1 = .9, b2 = 1.35, go = 2.1; const u = cl((lt - go) / 1.6);
  const fx = 380 + u * u * 300 + Math.sin(u * 8) * 30 * u, fy = 958 - u * 900 + Math.sin(u * 5) * 20;
  const lit = Math.max(0, 1 - Math.abs(lt - b1) / .12) + Math.max(0, 1 - Math.abs(lt - b2) / .12) + .25;
  E.paper({ z: 1.0, shadow: 8, draw: c => C.firefly(c, fx, fy, 3.2 * (1 - u * .6), t, { rot: u > 0 ? .3 : 0, flap: u > 0 ? undefined : 0, open: u > 0 ? 1 : 0, lit: lit > .6 }) });
  E.glow(1.0, g => C.fireflyGlow(g, fx, fy + 45 * (1 - u * .6), 4 * (1 - u * .5), Math.min(1, lit)));
  E.flushGlow(1.2);
  label('SOME LIGHTS\nANSWER BACK.', 360, 420, lt - 2.4, { size: 50, rot: -.02 });
  E.post({ vig: .35, fade: lt > 3.6 ? (lt - 3.6) / .4 : 0 });
});
