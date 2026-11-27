// DECEMBER — 17 дней за 40 секунд. Дата — только из dateAt().
(function () {
  const { clamp, lerp, ss, eio, eo, back, hash, noise1, key } = E; const K = A.K;
  const DUR = window.DURATION = 41.5;
  const S = []; const shot = (a, b, fn) => S.push({ a, b, fn });
  // ---------- дата и отсчёт (одна функция)
  const DAYS = [[0, 14], [2.6, 15], [5.2, 17], [7.8, 19], [10.4, 20], [12.8, 21], [15.2, 22], [17.4, 23], [19.8, 24], [22.4, 25], [25.0, 26], [27.6, 31]];
  function dateAt(t) {
    if (t >= 34.4) return { m: 'JAN', d: 1, time: '00:00' };
    let d = 14; for (const [a, v] of DAYS) if (t >= a) d = v;
    if (t >= 25.0 && t < 27.6) d = 26 + Math.min(4, Math.floor((t - 25.0) / 2.6 * 5));
    let time = null; if (t >= 27.6 && t < 31) time = `${18 + Math.floor((t - 27.6) / 3.4 * 5)}:00`; if (t >= 31 && t < 34.4) time = '23:59';
    return { m: 'DEC', d, time };
  }
  E.dateAt = dateAt;
  function pill(t, a = 1) {
    const v = E.X[4], D = dateAt(t); if (a <= 0) return;
    const left = D.m == 'JAN' ? 'HAPPY NEW YEAR' : D.d == 31 ? 'TONIGHT' : `${31 - D.d} DAYS LEFT`;
    const txt = `${D.m} ${D.d}${D.time ? ' · ' + D.time : ''}`;
    v.save(); v.setTransform(1, 0, 0, 1, 0, 0); v.globalAlpha = a; const f1 = z => `900 ${z}px IB`, f2 = z => `600 ${z}px IS`;
    const b1 = boxFor(v, txt, { font: f1, size: 34, maxW: 420, pad: .12 }), b2 = boxFor(v, left, { font: f2, size: 22, maxW: 420, pad: .12 });
    const w = Math.max(b1.w, b2.w) + 10, h = b1.h + b2.h - 6, x = (720 - w) / 2, y = 150;
    v.fillStyle = 'rgba(243,234,216,.94)'; v.beginPath(); v.roundRect(x, y, w, h, 16); v.fill();
    v.fillStyle = K.red; v.fillRect(x, y, w, 6);
    drawBoxText(v, txt, x, y + 4, w, b1.h, { font: f1, size: 34, min: 18, color: K.night, pad: .12, lines: 1 });
    drawBoxText(v, left, x, y + b1.h - 6, w, b2.h, { font: f2, size: 22, min: 12, color: K.burg, pad: .12, lines: 1 });
    v.restore();
  }
  function cap(text, y, o = {}) {
    const v = E.X[4], a = o.a ?? 1; if (a <= 0) return; const size = o.size || 52, font = z => `900 ${z}px IB`, maxW = o.maxW || 660;
    const bx = boxFor(v, text, { font, size, maxW, pad: .08, lineH: 1.08 }); const w = Math.min(maxW, bx.w + 10), h = bx.h + 6, x = (720 - w) / 2;
    v.save(); v.setTransform(1, 0, 0, 1, 0, 0); v.globalAlpha = a; v.translate(360, y + h / 2); const sc = o.pop ?? 1; v.scale(sc, sc); v.translate(-360, -(y + h / 2));
    if (o.plate !== false) { v.fillStyle = o.bg || 'rgba(19,26,48,.82)'; v.beginPath(); v.roundRect(x, y, w, h, 18); v.fill(); }
    drawBoxText(v, text, x, y, w, h, { font, size, min: 24, color: o.color || K.cream, pad: .08, lines: 3, lineH: 1.08 });
    v.restore();
  }
  const whipIn = (u, dir = 1) => { if (u < .22) { E.P.whip = (1 - u / .22) * .35; E.P.wdir = [dir, 0]; } };
  const whipOut = (u, d, dir = 1) => { if (u > d - .18) { E.P.whip = ((u - (d - .18)) / .18) * .35; E.P.wdir = [dir, 0]; } };
  const blink = (t, s) => ((t + s * 1.3) % 2.9) < .1;
  const pair = (i, d) => [E.L(i, d), E.L(3, d ?? E.DEPTH[i])];

  // ============ 1. ХУК: улица, огни волной (0–2.6)
  shot(0, 2.6, (t, u) => {
    E.cam = { x: 360 + u * 30, y: 680, z: 1 + u * .035, r: 0 };
    let [c, L] = pair(0);
    A.sky(c, ['#2a2f5a', '#4a3f74', '#7a4f7c', '#b56a7c', '#e39a84']);
    A.stars(c, L, 30, -300, 300, t);
    for (let i = 0; i < 9; i++) { const x = -260 + i * 150, h = 160 + hash(i) * 180; A.R(c, x, 760 - h, 130, h + 400, i % 2 ? '#2b3155' : '#333a64'); for (let j = 0; j < 6; j++) { const on = ss(.1 + hash(i * 9 + j) * 1.4, .3 + hash(i * 9 + j) * 1.4, u); if (on > 0) { A.R(c, x + 18 + (j % 3) * 36, 790 - h + Math.floor(j / 3) * 50, 18, 24, '#ffcf7a'); A.glow(L, x + 27 + (j % 3) * 36, 802 - h + Math.floor(j / 3) * 50, 30, 'rgba(255,200,110,.8)', on * .5); } } }
    [c, L] = pair(1);
    A.ground(c, 1000, K.snow, 8);
    const hs = [[-30, K.burg, K.navy], [230, K.hunter, K.burg], [490, K.mustard, K.navy]];
    hs.forEach(([x, w, r], i) => A.house(c, L, x, 1000, 230, 230, { wall: w, roof: r, win: ss(.1 + i * .25, .3 + i * .25, u), lights: clamp((u - .15 - i * .35) / .5), wreath: 1, door: i == 1 ? K.red : K.hunter }, t));
    A.person(c, lerp(120, 300, u / 2.6), 1060, 1.05, { coat: K.red, walk: t * 9, aL: .3, aR: .2, hat: 'beanie', hatC: K.cream, hatT: K.hunter, blink: blink(t, 1) });
    A.gift(c, lerp(120, 300, u / 2.6) + 22, 1000, 26, 28, K.hunter, K.gold);
    A.snow(c, t, 60, 2.4, 50, 1);
    [c, L] = pair(2);
    // фонарь с венком
    A.R(c, 600, 640, 14, 700, K.night); A.circ(c, 607, 630, 26, K.night); A.circ(c, 607, 628, 16, '#ffe2a0'); A.glow(L, 607, 628, 120, 'rgba(255,220,150,.9)', .8);
    c.strokeStyle = K.green; c.lineWidth = 12; c.beginPath(); c.arc(607, 760, 34, 0, 7); c.stroke(); A.poly(c, [607, 790, 590, 820, 624, 820], K.red);
    A.ground(c, 1180, '#fffaf0', 24, 2);
    A.snow(c, t, 26, 5, 90, 7);
    pill(t);
    cap('17 DAYS\nIN 40 SECONDS', 300, { size: 58, pop: lerp(.92, 1, back(u / .3)) });
    whipOut(u, 2.6);
  });
  // ============ 2. Ёлочный базар (2.6–5.2)
  shot(2.6, 5.2, (t, u) => {
    E.cam = { x: 360 + u * 50, y: 700, z: 1.05, r: 0 }; whipIn(u); whipOut(u, 2.6);
    let [c, L] = pair(0); A.sky(c, ['#5a5a8a', '#8a6f92', '#c48a8a', '#e9b08a', '#f2cf9a']);
    for (let i = 0; i < 12; i++) A.tree(c, L, -200 + i * 110, 860, 220 + hash(i) * 60, { col: '#4a6f5a', dk: '#38584a', snow: 1 });
    [c, L] = pair(1); A.ground(c, 1010, K.snow, 6);
    A.string(c, L, -100, 520, 820, 540, 16, 1, 30, t);
    // табличка
    A.R(c, 60, 600, 8, 180, K.brown); A.R(c, 210, 600, 8, 180, K.brown); A.R(c, 40, 560, 200, 80, K.red);
    drawBoxText(c, 'TREES $40', 40, 560, 200, 80, { font: z => `900 ${z}px IB`, size: 36, min: 14, color: K.cream, lines: 1 });
    for (let i = 0; i < 5; i++) A.tree(c, L, 40 + i * 70, 1000, 170, { col: K.green, dk: K.hunter });
    const cx = u < 1.6 ? 470 : lerp(470, 1000, eio((u - 1.6) / 1.0));
    A.car(c, L, cx, 1060, 1.25, K.teal, ss(.2, .8, u) > 0 ? back(ss(.2, .8, u)) : 0, t);
    A.person(c, 640, 1068, 1.05, { coat: K.navy, hat: 'beanie', hatC: K.red, hatT: K.cream, aL: u < 1.4 ? 2.6 : .2, aR: u < 1.4 ? 2.4 : .3, flip: 1, blink: blink(t, 2), mouth: u > 1.6 ? .5 : 0 });
    A.person(c, 300, 1070, .8, { coat: K.mustard, hat: 'beanie', hatC: K.teal, aR: 2.6 + .3 * Math.sin(t * 10), aL: .3, mouth: .5, blink: blink(t, 3) });
    A.snow(c, t, 40, 2.4, 40, 2);
    [c, L] = pair(2); A.tree(c, L, -40, 1400, 520, { col: '#2f5a42', dk: '#24402f', snow: 1 }); A.ground(c, 1200, '#fffaf0', 20, 4);
    E.P.b2 = 2.2;
    pill(t);
  });
  // ============ 3. Фасад: венок и гирлянда (5.2–7.8)
  shot(5.2, 7.8, (t, u) => {
    E.cam = { x: 380, y: 780, z: lerp(1.25, 1.12, u / 2.6), r: 0 }; whipIn(u, -1);
    let [c, L] = pair(0); A.sky(c, ['#141a36', '#1d2550', '#2a3366', '#3c447a']); A.stars(c, L, 40, -300, 500, t, 3);
    A.circ(c, 120, 260, 50, '#f6ecd0'); A.glow(L, 120, 260, 180, 'rgba(255,240,200,.6)', .5);
    [c, L] = pair(1); A.ground(c, 1080, K.snow, 6);
    A.house(c, L, 150, 1080, 420, 380, { wall: K.cream, roof: K.burg, win: 1, lights: clamp((u - .9) / .9), wreath: back(ss(.25, .6, u)), door: K.red }, t);
    // мама вешает венок, ребёнок держит гирлянду
    A.person(c, 470, 1110, 1.1, { coat: K.hunter, hat: 'hair', hatC: K.brown, long: 1, aR: u < .7 ? 2.7 : lerp(2.7, .3, ss(.7, 1, u)), aL: .3, flip: 1, blink: blink(t, 4), mouth: u > 1.3 ? .4 : 0 });
    A.person(c, 640, 1110, .8, { coat: K.red, hat: 'beanie', hatC: K.cream, hatT: K.teal, aL: 1.7, aR: 1.7, look: -2, mouth: u > 1.3 ? .6 : 0, blink: blink(t, 5) });
    if (u > .1) { A.string(c, L, 590, 1020, 690, 1020, 4, clamp((u - .9) / .9), 22, t); }
    A.snow(c, t, 50, 2.6, 55, 3);
    [c, L] = pair(2); A.ground(c, 1220, '#fffaf0', 18, 6); A.snow(c, t, 22, 5.5, 100, 9); for (let i = 0; i < 3; i++) A.bulb(c, L, 80 + i * 260, 1260, ['#ff6b5a', '#ffd36b', '#7ed2ff'][i], clamp((u - .9) * 3), 9);
    pill(t);
    whipOut(u, 2.6);
  });
  // ============ 4. Рождественская ярмарка (7.8–10.4)
  shot(7.8, 10.4, (t, u) => {
    E.cam = { x: lerp(300, 460, u / 2.6), y: 720, z: 1.08, r: 0 }; whipIn(u);
    let [c, L] = pair(0); A.sky(c, ['#121830', '#1b2448', '#283262']);
    // карусель
    const cx = 560, cy = 760; A.poly(c, [cx - 170, cy - 180, cx + 170, cy - 180, cx, cy - 300], K.red); A.R(c, cx - 170, cy - 190, 340, 24, K.gold);
    for (let i = 0; i < 9; i++) { const a = t * 1.2 + i * .7, x = cx + Math.sin(a) * 150, z = Math.cos(a); if (z < 0) continue; A.R(c, x - 2, cy - 166, 4, 150, K.gold); A.ell(c, x, cy - 40 + Math.sin(a * 2) * 10, 22, 14, i % 2 ? K.cream : K.teal); }
    for (let i = 0; i < 12; i++) A.bulb(c, L, cx - 165 + i * 30, cy - 178, '#ffd36b', .8 + .2 * Math.sin(t * 6 + i), 4);
    A.glow(L, cx, cy - 100, 260, 'rgba(255,200,120,.6)', .5);
    [c, L] = pair(1); A.ground(c, 1040, K.snow, 4);
    A.string(c, L, -200, 470, 900, 470, 22, 1, 40, t);
    // домики-ларьки
    [[-120, K.burg, 'MULLED WINE'], [170, K.hunter, 'GINGERBREAD'], [460, K.navy, 'ORNAMENTS']].forEach(([x, col, s], i) => {
      A.R(c, x, 800, 250, 230, col); A.poly(c, [x - 20, 800, x + 125, 690, x + 270, 800], K.cream); for (let j = 0; j < 6; j++) A.poly(c, [x + j * 42, 800, x + j * 42 + 42, 800, x + j * 42 + 21, 830], j % 2 ? K.red : K.cream);
      A.R(c, x + 20, 860, 210, 110, '#2a1a12'); A.glow(L, x + 125, 910, 140, 'rgba(255,190,100,.8)', .7);
      A.R(c, x + 30, 940, 190, 30, K.wood); for (let j = 0; j < 5; j++) A.circ(c, x + 50 + j * 38, 930, 10, [K.gold, K.red, K.cream, K.teal, K.gold][j]);
      drawBoxText(c, s, x + 15, 745, 220, 40, { font: z => `900 ${z}px IB`, size: 26, min: 10, color: K.night, lines: 1 }); });
    // люди с кружками, пар
    [[90, K.mustard, 0], [330, K.teal, 1], [560, K.plum, 2]].forEach(([x, col, i]) => { const p = A.person(c, x + Math.sin(t + i) * 10, 1100, 1, { coat: col, hat: i == 1 ? 'hair' : 'beanie', hatC: i == 1 ? K.brown : K.cream, aR: 1.2, aL: .3, flip: i == 2 ? 1 : 0, mouth: (Math.sin(t * 3 + i) > .5) ? .5 : 0, blink: blink(t, i + 6) });
      A.R(c, p.hr[0] - 7, p.hr[1] - 12, 14, 16, K.red); A.steam(c, p.hr[0], p.hr[1] - 14, t + i * .3, 3, .8); });
    A.snow(c, t, 45, 2.4, 45, 4);
    [c, L] = pair(2); A.string(c, L, -100, 210, 820, 260, 10, 1, 60, t); A.snow(c, t, 18, 6, 110, 11);
    pill(t);
    whipOut(u, 2.6, -1);
  });
  // ============ 5. Каток у большой ёлки (10.4–12.8)
  shot(10.4, 12.8, (t, u) => {
    E.cam = { x: 360, y: lerp(560, 700, u / 2.4), z: 1.02, r: 0 }; whipIn(u, -1);
    let [c, L] = pair(0); A.sky(c, ['#10162c', '#182040', '#222c58']); A.stars(c, L, 30, -300, 300, t, 5);
    for (let i = 0; i < 7; i++) { const x = -200 + i * 190; A.R(c, x, 300 - hash(i + 3) * 200, 160, 900, '#1e2648'); for (let j = 0; j < 10; j++) if (hash(i * 13 + j) > .45) A.R(c, x + 20 + (j % 3) * 45, 330 - hash(i + 3) * 200 + Math.floor(j / 3) * 70, 22, 30, '#ffcf7a'); }
    [c, L] = pair(1);
    A.ell(c, 360, 1060, 520, 170, '#cfe0ec'); A.ell(c, 360, 1060, 500, 155, '#dfeaf2'); A.ell(c, 300, 1030, 200, 30, 'rgba(255,255,255,.6)');
    A.tree(c, L, 360, 1000, 620, { col: K.green, dk: K.hunter, orn: 1, lights: 1, star: 1 }, t);
    // фигуристы по кругу
    for (let i = 0; i < 6; i++) { const a = t * .9 + i * 1.05, x = 360 + Math.cos(a) * 380, y = 1080 + Math.sin(a) * 110, front = Math.sin(a) > 0;
      if (!front) A.person(c, x, y, .78, { coat: [K.red, K.teal, K.mustard, K.plum, K.navy, K.burg][i], hat: 'beanie', hatC: K.cream, flip: Math.cos(a + 1.57) < 0, aL: 1.3, aR: 1.3, tilt: .15, blink: blink(t, i) }); }
    for (let i = 0; i < 6; i++) { const a = t * .9 + i * 1.05, x = 360 + Math.cos(a) * 380, y = 1080 + Math.sin(a) * 110, front = Math.sin(a) > 0;
      if (front) A.person(c, x, y, .95, { coat: [K.red, K.teal, K.mustard, K.plum, K.navy, K.burg][i], hat: 'beanie', hatC: K.cream, hatT: K.red, flip: Math.cos(a + 1.57) < 0, aL: 1.3, aR: 1.3, tilt: .15, mouth: .4, blink: blink(t, i) }); }
    A.snow(c, t, 50, 2.4, 45, 5);
    [c, L] = pair(2); A.R(c, -100, 1210, 920, 16, K.red); for (let i = 0; i < 10; i++) A.R(c, -60 + i * 90, 1180, 10, 80, K.cream); A.snow(c, t, 18, 6, 100, 12);
    pill(t);
    whipOut(u, 2.4);
  });
  // ============ 6. Кухня: имбирное печенье (12.8–15.2)
  shot(12.8, 15.2, (t, u) => {
    E.cam = { x: 360, y: 700, z: lerp(1.0, 1.08, u / 2.4), r: 0 }; whipIn(u);
    let [c, L] = pair(0);
    A.R(c, -300, -300, 1400, 2000, '#e9d9b8'); for (let i = 0; i < 20; i++) { A.R(c, -300 + i * 80, -300, 30, 2000, 'rgba(160,40,50,.12)'); A.R(c, -300, -300 + i * 80, 1400, 30, 'rgba(40,70,50,.1)'); } // клетка
    // окно с снегом, запотевшее
    A.R(c, 80, 260, 300, 340, '#1d2a4a'); A.snow(c, t, 30, 3, 50, 6, '#fffaf0', [80, 260, 380, 600]); A.R(c, 80, 260, 300, 340, 'rgba(230,236,240,.35)'); c.strokeStyle = K.cream; c.lineWidth = 14; c.strokeRect(80, 260, 300, 340); A.R(c, 223, 260, 14, 340, K.cream);
    A.string(c, L, 70, 255, 390, 255, 7, 1, 18, t);
    [c, L] = pair(1);
    // духовка
    A.R(c, 420, 640, 280, 300, '#d8d0c0'); A.R(c, 445, 700, 230, 150, '#3a2a20'); const og = .6 + .2 * Math.sin(t * 5); A.R(c, 455, 710, 210, 130, `rgba(255,${140 + og * 50 | 0},60,${og})`); A.glow(L, 560, 775, 160, 'rgba(255,150,60,.9)', og * .35);
    for (let i = 0; i < 4; i++) A.circ(c, 470 + i * 60, 670, 9, '#3a3a3a');
    // стол, противень с человечками
    A.R(c, -100, 960, 920, 400, K.wood); A.R(c, -100, 950, 920, 16, '#b07a48');
    const trayX = lerp(560, 230, eo(ss(.2, .8, u)));
    A.R(c, trayX - 150, 930, 300, 22, '#9aa0a8');
    for (let i = 0; i < 4; i++) { const gx = trayX - 110 + i * 72, gy = 920; A.circ(c, gx, gy - 30, 12, '#b5652e'); A.poly(c, [gx - 18, gy - 20, gx + 18, gy - 20, gx + 14, gy, gx - 14, gy], '#b5652e');
      if (u > 1.2 + i * .25) { A.circ(c, gx - 4, gy - 32, 2, K.cream); A.circ(c, gx + 4, gy - 32, 2, K.cream); A.R(c, gx - 10, gy - 14, 20, 3, K.cream); A.circ(c, gx, gy - 8, 2.5, K.red); } }
    A.steam(c, trayX, 900, t, 4, 1.2);
    // девочка с кондитерским мешком
    const p = A.person(c, 650, 1120, 1.1, { coat: K.red, hat: 'hair', hatC: K.mustard, long: 1, aL: 1.1, aR: 1.25, flip: 1, look: -2, mouth: .3, blink: blink(t, 7), scarf: K.cream });
    // облако муки
    if (u > .9 && u < 1.8) { const k = (u - .9) / .9; for (let i = 0; i < 7; i++) { c.globalAlpha = (1 - k) * .8; A.circ(c, 360 + Math.cos(i) * 60 * k, 940 - k * 60 + Math.sin(i * 2) * 30 * k, 18 + k * 20, '#fffaf0'); } c.globalAlpha = 1; }
    [c, L] = pair(2); A.R(c, -100, 1180, 920, 200, '#8a5430'); 
    pill(t);
    whipOut(u, 2.4, -1);
  });
  // ============ 7. Упаковка подарков, кот (15.2–17.4)
  shot(15.2, 17.4, (t, u) => {
    E.cam = { x: 360, y: 760, z: 1.1, r: Math.sin(t) * .01 }; whipIn(u, -1);
    let [c, L] = pair(0); A.R(c, -300, -300, 1400, 2000, K.hunter); for (let i = 0; i < 30; i++) A.star4(c, -200 + (i % 6) * 220 + (Math.floor(i / 6) % 2) * 110, -200 + Math.floor(i / 6) * 260, 6, 'rgba(230,180,80,.35)');
    [c, L] = pair(1); A.R(c, -100, 900, 920, 500, K.burg); A.R(c, -100, 890, 920, 14, '#5a1520');
    // рулоны бумаги
    for (let i = 0; i < 3; i++) { A.R(c, 40 + i * 60, 760, 46, 150, [K.red, K.gold, K.teal][i]); for (let j = 0; j < 5; j++) A.star4(c, 63 + i * 60, 780 + j * 28, 4, K.cream); }
    // коробка оборачивается
    const wrap = ss(.1, .8, u), bx = 330, by = 890;
    A.R(c, bx, by - 160, 200, 160, '#c8a878');
    A.R(c, bx, by - 160 * wrap, 200, 160 * wrap, K.red); for (let j = 0; j < 8; j++) if (j / 8 < wrap) A.star4(c, bx + 25 + (j % 4) * 50, by - 30 - Math.floor(j / 4) * 70, 6, K.gold);
    if (u > .85) { const k = back(ss(.85, 1.2, u)); A.R(c, bx + 92, by - 160, 16 * k, 160, K.gold); A.R(c, bx, by - 88, 200 * k, 16, K.gold); }
    if (u > 1.15) { const k = back(ss(1.15, 1.45, u), 2.5); A.ell(c, bx + 80, by - 172, 30 * k, 18 * k, K.gold, .5); A.ell(c, bx + 120, by - 172, 30 * k, 18 * k, K.gold, -.5); A.circ(c, bx + 100, by - 168, 10 * k, '#c99a30'); }
    // пустая коробка и кот
    A.R(c, 80, 1020, 170, 110, '#c8a878'); A.R(c, 80, 1010, 170, 14, '#b0905e');
    const cat = ss(1.3, 1.75, u), cy = 1010 - Math.sin(cat * Math.PI) * 140 + (cat >= 1 ? 30 : 0), cxp = lerp(700, 165, cat);
    if (u > 1.25) { A.ell(c, cxp, cy - 10, 42, 26, '#e08a3a'); A.circ(c, cxp + 30, cy - 34, 22, '#e08a3a'); A.poly(c, [cxp + 14, cy - 50, cxp + 20, cy - 70, cxp + 30, cy - 54], '#e08a3a'); A.poly(c, [cxp + 34, cy - 54, cxp + 44, cy - 72, cxp + 48, cy - 50], '#e08a3a');
      A.circ(c, cxp + 24, cy - 36, 2.5, '#222'); A.circ(c, cxp + 38, cy - 36, 2.5, '#222'); c.strokeStyle = '#e08a3a'; c.lineWidth = 8; c.beginPath(); c.moveTo(cxp - 38, cy - 10); c.quadraticCurveTo(cxp - 70, cy - 40, cxp - 60, cy - 70); c.stroke(); }
    A.R(c, 80, 1060, 170, 70, '#c8a878'); // передняя стенка коробки поверх кота
    // ножницы, лента
    c.strokeStyle = K.gold; c.lineWidth = 6; c.beginPath(); c.moveTo(560, 960); c.bezierCurveTo(620, 900, 660, 1020, 700, 940); c.stroke();
    [c, L] = pair(2); A.string(c, L, -60, 250, 800, 250, 9, 1, 50, t);
    pill(t);
    whipOut(u, 2.2);
  });
  // ============ 8. Наряжают ёлку, звезда (17.4–19.8)
  shot(17.4, 19.8, (t, u) => {
    E.cam = { x: 360, y: lerp(820, 640, eio(u / 2.4)), z: 1.04, r: 0 }; whipIn(u);
    let [c, L] = pair(0); A.R(c, -300, -300, 1400, 2000, '#2a3a5a'); for (let i = 0; i < 16; i++) A.R(c, -300 + i * 90, -300, 4, 2000, 'rgba(255,255,255,.05)');
    A.R(c, 470, 300, 220, 300, K.night); A.snow(c, t, 20, 2.5, 40, 8, '#fffaf0', [470, 300, 690, 600]); c.strokeStyle = K.cream; c.lineWidth = 10; c.strokeRect(470, 300, 220, 300);
    [c, L] = pair(1); A.R(c, -100, 1060, 920, 400, '#5a3a28');
    A.tree(c, L, 330, 1080, 760, { col: K.green, dk: K.hunter, orn: ss(.0, 1.6, u), lights: ss(.2, 1.0, u) }, t);
    // папа поднимает сына к верхушке
    const lift = ss(1.0, 1.7, u);
    A.person(c, 560, 1110, 1.3, { coat: K.navy, hat: 'hair', hatC: K.brown, aL: lerp(.4, 2.6, lift), aR: lerp(.4, 2.6, lift), flip: 1, look: -2, mouth: u > 2 ? .5 : 0, blink: blink(t, 8) });
    const kx = lerp(520, 470, lift), ky = lerp(1110, 610, lift);
    if (u > .9) A.person(c, kx, ky, .9, { coat: K.red, hat: 'hair', hatC: K.mustard, aL: 2.8, aR: 2.6, look: -2, mouth: u > 1.8 ? .6 : 0, blink: blink(t, 9) });
    const st = ss(1.7, 2.0, u); E.L(1); E.L(3, 1);
    A.tree(c, L, 330, 1080, 760, { col: 'rgba(0,0,0,0)', dk: 'rgba(0,0,0,0)', star: st }, t);
    if (u > 1.6 && u < 1.75) A.star5(c, kx - 40, ky - 150, 40, K.gold);
    [c, L] = pair(2); A.gift(c, 60, 1250, 140, 110, K.red, K.gold); A.gift(c, 520, 1260, 120, 90, K.teal, K.cream);
    pill(t);
    whipOut(u, 2.4, -1);
  });
  // ============ 9. Сочельник: камин, носки, сани на фоне луны (19.8–22.4)
  shot(19.8, 22.4, (t, u) => {
    E.cam = { x: 360, y: 720, z: lerp(1.12, 1.0, u / 2.6), r: 0 }; whipIn(u, -1);
    let [c, L] = pair(0); A.R(c, -300, -300, 1400, 2000, '#3a1f2a');
    A.R(c, 420, 180, 260, 360, K.night); A.circ(c, 560, 300, 70, '#f6ecd0'); A.glow(L, 560, 300, 200, 'rgba(255,240,200,.7)', .5);
    // сани с оленями силуэтом
    const sx = lerp(380, 760, ss(.4, 2.2, u)), sy = 330 - Math.sin(ss(.4, 2.2, u) * Math.PI) * 60;
    c.save(); c.beginPath(); c.rect(420, 180, 260, 360); c.clip(); c.fillStyle = K.night;
    for (let i = 0; i < 3; i++) { const dx = sx + 60 + i * 34; A.ell(c, dx, sy - 4, 14, 6, K.night); A.R(c, dx - 10, sy, 2, 10, K.night); A.R(c, dx + 8, sy, 2, 10, K.night); A.R(c, dx + 12, sy - 14, 2, 10, K.night); }
    A.poly(c, [sx - 30, sy - 10, sx + 30, sy - 10, sx + 24, sy + 6, sx - 26, sy + 6], K.night); A.circ(c, sx - 4, sy - 18, 8, K.night); c.restore();
    c.strokeStyle = K.cream; c.lineWidth = 12; c.strokeRect(420, 180, 260, 360); A.R(c, 540, 180, 12, 360, K.cream);
    [c, L] = pair(1);
    // камин
    A.R(c, 40, 700, 460, 380, '#8a3a2a'); for (let i = 0; i < 8; i++) for (let j = 0; j < 6; j++) A.R(c, 40 + i * 58 + (j % 2) * 29, 700 + j * 63, 54, 3, 'rgba(0,0,0,.18)');
    A.R(c, 20, 680, 500, 34, K.cream); A.R(c, 130, 830, 280, 250, '#1a0e0a');
    const fl = .7 + .3 * noise1(t * 8);
    for (let i = 0; i < 5; i++) A.poly(c, [170 + i * 45, 1080, 200 + i * 45 + Math.sin(t * 9 + i) * 6, 960 - fl * 40 - (i % 2) * 30, 230 + i * 45, 1080], i % 2 ? '#ffb347' : '#ff6a3a');
    A.glow(L, 270, 1000, 240, 'rgba(255,140,60,.9)', fl * .35);
    // носки
    [[90, K.red], [210, K.hunter], [330, K.red]].forEach(([x, col], i) => { const sw = Math.sin(t * 2 + i) * .04; c.save(); c.translate(x + 30, 714); c.rotate(sw);
      A.R(c, -18, 0, 36, 70, col); A.ell(c, -2, 74, 32, 18, col); A.R(c, -22, 0, 44, 18, K.cream); c.restore(); });
    A.string(c, L, 30, 690, 510, 690, 10, 1, 16, t);
    // печенье и молоко
    A.R(c, 560, 960, 180, 14, K.wood); A.R(c, 640, 974, 14, 120, K.wood); A.ell(c, 610, 954, 44, 9, K.cream); for (let i = 0; i < 3; i++) A.circ(c, 592 + i * 18, 946, 11, '#b5652e');
    A.R(c, 680, 905, 26, 50, '#f6f4ee');
    pill(t);
    cap('Christmas Eve', 920, { size: 46, a: ss(.3, .6, u) * (1 - ss(2.2, 2.5, u)) });
    whipOut(u, 2.6);
  });
  // ============ 10. Утро 25-го: взрыв обёрточной бумаги (22.4–25.0)
  shot(22.4, 25.0, (t, u) => {
    E.cam = { x: 360, y: 760, z: 1.05 + Math.max(0, .03 - u * .02) * Math.sin(u * 30), r: 0 }; whipIn(u);
    let [c, L] = pair(0); A.R(c, -300, -300, 1400, 2000, '#f1e4c8'); A.R(c, 420, 220, 300, 420, '#bcd8ec'); A.ground(c, 560, K.snow, 10); c.strokeStyle = K.cream; c.lineWidth = 12; c.strokeRect(420, 220, 300, 420);
    // лучи солнца
    for (let i = 0; i < 4; i++) { c.globalAlpha = .18; A.poly(c, [450 + i * 60, 230, 520 + i * 60, 230, 200 + i * 120, 1300, 60 + i * 120, 1300], '#fff6d8'); } c.globalAlpha = 1;
    [c, L] = pair(1); A.R(c, -100, 1040, 920, 400, '#7a4a3a');
    A.tree(c, L, 150, 1060, 600, { col: K.green, dk: K.hunter, orn: 1, lights: 1, star: 1 }, t);
    // дети в пижамах рвут бумагу
    const rip = ss(.3, .6, u);
    A.gift(c, 330, 1090, 150, 120, K.red, K.gold, rip);
    A.person(c, 300, 1150, .9, { coat: K.teal, legs: K.teal, hat: 'hair', hatC: K.brown, aL: rip > 0 ? 2.8 : 1.2, aR: rip > 0 ? 2.6 : 1.2, mouth: rip > 0 ? .8 : 0, blink: blink(t, 10), scarf: null });
    A.person(c, 560, 1150, .85, { coat: K.pink, legs: K.pink, hat: 'hair', hatC: K.mustard, long: 1, aL: 2.5 + .3 * Math.sin(t * 12), aR: 2.6, flip: 1, mouth: .7, blink: blink(t, 11), scarf: null });
    // игрушечный поезд выезжает
    if (u > .7) { const tx = lerp(400, 640, ss(.7, 2.4, u)); A.R(c, tx - 40, 1100, 60, 30, K.red); A.R(c, tx - 30, 1080, 20, 22, K.red); A.R(c, tx + 26, 1105, 40, 25, K.gold); A.circ(c, tx - 26, 1132, 8, '#222'); A.circ(c, tx + 6, 1132, 8, '#222'); A.steam(c, tx - 20, 1076, t, 3, .7); }
    [c, L] = pair(2);
    // обрывки бумаги
    if (u > .3) for (let i = 0; i < 40; i++) { const k = u - .3, a = hash(i) * 6.283, v = 300 + hash(i * 3) * 500, x = 405 + Math.cos(a) * v * k * .9, y = 1000 + Math.sin(a) * v * k * .6 - 300 * k + 420 * k * k;
      c.save(); c.translate(x, y); c.rotate(k * 8 * (hash(i * 5) - .5)); A.R(c, -14, -10, 28, 20, [K.red, K.gold, K.teal, K.cream][i % 4]); c.restore(); }
    pill(t);
    cap('Christmas morning', 920, { size: 46, a: ss(.5, .8, u) * (1 - ss(2.3, 2.6, u)) });
    whipOut(u, 2.6, -1);
  });
  // ============ 11. Тихая неделя: плед, какао, кино, сугробы растут (25.0–27.6)
  shot(25.0, 27.6, (t, u) => {
    E.cam = { x: 360, y: 760, z: 1.06, r: 0 }; whipIn(u, -1);
    let [c, L] = pair(0); A.R(c, -300, -300, 1400, 2000, '#2e3a52');
    A.R(c, 160, 240, 400, 380, '#18213e'); A.snow(c, t * 3, 50, 3, 120, 9, '#fffaf0', [160, 240, 560, 620]);
    A.ground(c, lerp(610, 470, u / 2.6), K.snow, 18, 3); c.strokeStyle = K.cream; c.lineWidth = 14; c.strokeRect(160, 240, 400, 380); A.R(c, 353, 240, 14, 380, K.cream);
    A.R(c, -300, 620, 1400, 1400, '#2e3a52');
    [c, L] = pair(1);
    // диван, плед в клетку, семья
    A.R(c, 20, 860, 680, 220, K.burg); A.R(c, 0, 820, 80, 260, K.burg); A.R(c, 640, 820, 80, 260, K.burg);
    for (let i = 0; i < 3; i++) A.person(c, 200 + i * 150, 1010, 1.05, { coat: [K.cream, K.mustard, K.teal][i], hat: i == 1 ? 'hair' : i == 0 ? 'beanie' : 'hair', hatC: i == 0 ? K.red : K.brown, long: i == 1, eyes: u > 1.8 && i == 2 ? 'closed' : 'dot', aR: 1.4, aL: .5, mouth: Math.sin(t * 2 + i) > .7 ? .4 : 0, blink: blink(t, i + 12) });
    A.R(c, 60, 960, 600, 140, K.hunter); for (let i = 0; i < 8; i++) { A.R(c, 60 + i * 80, 960, 14, 140, 'rgba(192,56,63,.6)'); } for (let j = 0; j < 3; j++) A.R(c, 60, 975 + j * 45, 600, 10, 'rgba(230,180,80,.5)');
    for (let i = 0; i < 3; i++) { A.R(c, 214 + i * 150, 925, 22, 26, [K.red, K.cream, K.teal][i]); A.steam(c, 225 + i * 150, 920, t + i * .4, 3, .7); }
    // свет телевизора мерцает
    const tv = .5 + .4 * Math.abs(noise1(t * 4)); A.glow(L, 360, 1300, 500, 'rgba(140,180,255,.6)', tv * .22);
    [c, L] = pair(2); A.R(c, 300, 1220, 120, 80, '#1a1a22');
    // листки календаря улетают
    for (let i = 0; i < 5; i++) { const k = (u - i * .5) / .9; if (k < 0 || k > 1) continue; const x = 600 + k * 260, y = 600 - k * 240 + k * k * 400;
      c.save(); c.translate(x, y); c.rotate(k * 3); A.R(c, -50, -60, 100, 120, K.cream); A.R(c, -50, -60, 100, 26, K.red);
      drawBoxText(c, String(26 + i), -50, -30, 100, 90, { font: z => `900 ${z}px IB`, size: 56, min: 20, color: K.night, lines: 1 }); c.restore(); }
    pill(t);
    cap('the cozy week', 920, { size: 46, a: ss(.3, .6, u) * (1 - ss(2.3, 2.6, u)) });
    whipOut(u, 2.6);
  });
  // ============ 12. 31 декабря: стол накрывается слоями, гости (27.6–31.0)
  shot(27.6, 31.0, (t, u) => {
    E.cam = { x: 360, y: lerp(720, 780, u / 3.4), z: lerp(1.0, 1.06, u / 3.4), r: 0 }; whipIn(u);
    let [c, L] = pair(0); A.R(c, -300, -300, 1400, 2000, '#26304e'); A.string(c, L, -200, 280, 900, 280, 18, 1, 40, t);
    A.R(c, 470, 340, 200, 300, K.night); A.snow(c, t, 20, 2.5, 50, 10, '#fffaf0', [470, 340, 670, 640]); c.strokeStyle = K.cream; c.lineWidth = 10; c.strokeRect(470, 340, 200, 300);
    // гости в дверях (2.4–)
    A.R(c, 60, 420, 220, 560, '#3a2618'); if (u > 2.3) { A.R(c, 70, 430, 200, 550, '#1d2a4a'); A.snow(c, t, 14, 2.5, 50, 11, '#fffaf0', [70, 430, 270, 980]);
      const g = ss(2.3, 3.0, u); A.person(c, lerp(40, 140, g), 990, 1.0, { coat: K.teal, hat: 'beanie', hatC: K.snow, hatT: K.red, aR: 2.6, aL: .4, mouth: .6, blink: blink(t, 14) }); A.person(c, lerp(10, 220, g), 995, 1.05, { coat: K.plum, hat: 'hair', hatC: K.brown, long: 1, aL: 1.0, aR: .3, mouth: .5, blink: blink(t, 15) }); }
    [c, L] = pair(1);
    // стол
    A.R(c, -100, 1000, 920, 400, '#4a2a1e');
    const cloth = ss(.1, .5, u); A.R(c, -100, 990, 920 * cloth, 34, K.cream); for (let i = 0; i < 10; i++) if (i / 10 < cloth) A.R(c, -100 + i * 92, 1020, 92, 110, i % 2 ? K.red : K.cream);
    // свечи
    if (u > .5) for (let i = 0; i < 3; i++) { const k = back(ss(.5 + i * .1, .8 + i * .1, u)); A.R(c, 200 + i * 160, 990 - 70 * k, 14, 70 * k, K.cream); if (u > .85 + i * .1) { A.ell(c, 207 + i * 160, 912, 5, 10, '#ffcf6a'); A.glow(L, 207 + i * 160, 912, 90, 'rgba(255,200,110,.9)', .8); } }
    // тарелки, бокалы
    if (u > .9) for (let i = 0; i < 4; i++) { const k = back(ss(.9 + i * .08, 1.2 + i * .08, u)); A.ell(c, 90 + i * 180, 995, 52 * k, 10 * k, '#f6f4ee'); }
    if (u > 1.2) for (let i = 0; i < 4; i++) { const k = back(ss(1.2 + i * .08, 1.5 + i * .08, u)); A.poly(c, [150 + i * 180, 990 - 60 * k, 172 + i * 180, 990 - 60 * k, 165 + i * 180, 990 - 30 * k, 157 + i * 180, 990 - 30 * k], 'rgba(230,240,250,.8)'); A.R(c, 160 + i * 180, 990 - 30 * k, 2, 30 * k, 'rgba(230,240,250,.8)'); }
    // запечённая птица, хлопушки-crackers
    if (u > 1.6) { const k = back(ss(1.6, 1.95, u)); A.ell(c, 360, 970, 80 * k, 44 * k, '#b0602a'); A.ell(c, 340, 955, 34 * k, 16 * k, '#d08848'); A.ell(c, 360, 1000, 110 * k, 14 * k, '#f6f4ee'); }
    if (u > 2.0) for (let i = 0; i < 3; i++) { const k = back(ss(2.0 + i * .08, 2.3 + i * .08, u)); c.save(); c.translate(120 + i * 220, 1060); c.rotate(-.2); A.R(c, -40 * k, -9, 80 * k, 18, [K.gold, K.red, K.teal][i]); A.poly(c, [-40 * k, -9, -52 * k, -14, -52 * k, 14, -40 * k, 9], [K.gold, K.red, K.teal][i]); A.poly(c, [40 * k, -9, 52 * k, -14, 52 * k, 14, 40 * k, 9], [K.gold, K.red, K.teal][i]); c.restore(); }
    [c, L] = pair(2); A.string(c, L, -80, 160, 800, 200, 9, 1, 60, t);
    pill(t);
    cap("New Year's Eve", 920, { size: 46, a: ss(.3, .6, u) * (1 - ss(2.0, 2.3, u)) });
    whipOut(u, 3.4, -1);
  });
  // ============ 13. 23:59 — колпаки, отсчёт (31.0–34.4)
  shot(31.0, 34.4, (t, u) => {
    E.cam = { x: 360, y: 760, z: lerp(1.0, 1.12, u / 3.4) + (u > 1 ? Math.sin(u * 40) * .002 : 0), r: 0 }; whipIn(u, -1);
    let [c, L] = pair(0); A.R(c, -300, -300, 1400, 2000, '#1e2442'); A.string(c, L, -200, 300, 900, 300, 18, 1, 40, t);
    // часы на стене
    A.circ(c, 360, 520, 120, K.cream); A.circ(c, 360, 520, 106, '#fbf6ea'); for (let i = 0; i < 12; i++) A.R(c, 360 + Math.sin(i * .5236) * 92 - 3, 520 - Math.cos(i * .5236) * 92 - 3, 6, 6, K.night);
    const secs = 50 + (u > .9 ? Math.min(10, (u - .9) / .5) : 0); c.strokeStyle = K.night; c.lineWidth = 8; c.beginPath(); c.moveTo(360, 520); c.lineTo(360, 440); c.moveTo(360, 520); c.lineTo(352, 446); c.stroke();
    c.strokeStyle = K.red; c.lineWidth = 3; const sa = secs / 60 * 6.283; c.beginPath(); c.moveTo(360, 520); c.lineTo(360 + Math.sin(sa) * 96, 520 - Math.cos(sa) * 96); c.stroke();
    [c, L] = pair(1);
    for (let i = 0; i < 5; i++) A.person(c, 80 + i * 140, 1130 + (i % 2) * 20, 1.15, { coat: [K.red, K.teal, K.mustard, K.plum, K.hunter][i], hat: 'party', hatC: [K.gold, K.red, K.teal, K.gold, K.pink][i], look: (360 - (80 + i * 140)) / 80, aR: u > 1 ? 1.9 : .4, aL: .3, flip: i > 2, mouth: u > 1 ? .4 + .4 * Math.abs(Math.sin(u * 6.3)) : 0, blink: blink(t, i + 16) });
    A.snow(c, t, 30, 3, 40, 13, 'rgba(230,180,80,.85)');
    [c, L] = pair(2);
    pill(t);
    // отсчёт 5-4-3-2-1
    if (u > .9) { const n = 5 - Math.floor((u - .9) / .5), k = ((u - .9) % .5) / .5; if (n >= 1) { const v = E.X[4]; v.save(); v.setTransform(1, 0, 0, 1, 0, 0); v.globalAlpha = 1 - ss(.7, 1, k); const s = lerp(1.4, 1, eo(k / .3));
      v.translate(360, 520); v.scale(s, s); drawBoxText(v, String(n), -150, -150, 300, 300, { font: z => `900 ${z}px IB`, size: 240, min: 80, color: K.gold, lines: 1, stroke: 14, strokeColor: K.night }); v.restore(); } }
    whipOut(u, 3.4);
  });
  // ============ 14. 00:00 — бокалы, салют, «glean.» из салюта (34.4–41.5)
  const GLEAN = (() => { const cv = document.createElement('canvas'); cv.width = 720; cv.height = 300; const x = cv.getContext('2d'); x.fillStyle = '#fff'; x.font = '900 180px IB'; x.textAlign = 'center'; x.textBaseline = 'middle'; return { cv, x, pts: null }; })();
  function gleanPts() { if (GLEAN.pts) return GLEAN.pts; const x = GLEAN.x; x.clearRect(0, 0, 720, 300); x.fillText('glean.', 360, 150); const d = x.getImageData(0, 0, 720, 300).data, p = [];
    for (let y = 0; y < 300; y += 7) for (let xx = 0; xx < 720; xx += 7) if (d[(y * 720 + xx) * 4 + 3] > 128) p.push([xx, y]); GLEAN.pts = p; return p; }
  shot(34.4, 35.8, (t, u) => {
    E.cam = { x: 360, y: 760, z: 1.15 - u * .05, r: 0 };
    let [c, L] = pair(0); A.R(c, -300, -300, 1400, 2000, '#1e2442'); A.string(c, L, -200, 300, 900, 300, 18, 1, 40, t);
    [c, L] = pair(1);
    // бокалы встречаются
    const k = eo(u / .35);
    for (const sd of [-1, 1]) { const x = 360 + sd * lerp(220, 40, k); c.save(); c.translate(x, 760); c.rotate(-sd * .25);
      A.poly(c, [-40, -120, 40, -120, 26, 10, -26, 10], 'rgba(230,240,250,.85)'); A.poly(c, [-34, -90, 34, -90, 24, 6, -24, 6], 'rgba(240,200,110,.9)'); A.R(c, -4, 10, 8, 120, 'rgba(230,240,250,.85)'); A.ell(c, 0, 132, 40, 8, 'rgba(230,240,250,.85)'); c.restore(); }
    if (u > .35) { A.glow(L, 360, 650, 160, 'rgba(255,240,200,.9)', .45 * clamp(1 - (u - .35) * 2)); for (let i = 0; i < 16; i++) { const q = (u - .35) / 1, a = hash(i) * 6.283; A.circ(c, 360 + Math.cos(a) * 200 * q, 650 + Math.sin(a) * 140 * q - 60 * q, 6 * (1 - q), K.gold); } }
    // конфетти
    for (let i = 0; i < 70; i++) { const x = hash(i) * 800 - 40, y = -100 + ((hash(i * 3) * 1500 + u * 600 * (.5 + hash(i * 7))) % 1500); c.save(); c.translate(x, y); c.rotate(u * 6 * (hash(i * 5) - .5) + i); A.R(c, -7, -4, 14, 8, [K.red, K.gold, K.teal, K.cream, K.pink][i % 5]); c.restore(); }
    pill(t);
    cap('HAPPY NEW YEAR!', 900, { size: 60, pop: back(ss(.3, .6, u)), a: ss(.3, .45, u) });
  });
  shot(35.8, DUR + .1, (t, u) => {
    E.cam = { x: 360, y: lerp(900, 700, eio(u / 2.4)), z: 1, r: 0 };
    let [c, L] = pair(0); A.sky(c, ['#0c1024', '#121838', '#1a2248', '#242e5a']); A.stars(c, L, 40, -300, 600, t, 9);
    const FW = [[0, 200, 330, '#ff6b5a'], [.4, 520, 280, '#ffd36b'], [.8, 360, 420, '#7ed2ff'], [1.3, 150, 480, '#9cf28a'], [1.7, 560, 450, '#ffb0e0']];
    FW.forEach(([t0, x, y, col], i) => A.firework(c, L, x, y, 35.8 + t0, t, col, 150, 40, i));
    [c, L] = pair(1);
    // город: крыши с огнями
    for (let i = 0; i < 6; i++) { const x = -120 + i * 170; A.house(c, L, x, 1180, 150, 180 + (i % 3) * 50, { wall: [K.burg, K.hunter, K.navy, K.mustard, K.burg, K.teal][i], roof: K.night, win: 1, lights: 1, wreath: 1 }, t); }
    A.ground(c, 1180, K.snow, 8, 5);
    // люди на улице смотрят вверх
    for (let i = 0; i < 4; i++) A.person(c, 120 + i * 160, 1260, .9, { coat: [K.red, K.teal, K.mustard, K.plum][i], hat: 'party', hatC: K.gold, look: 0, aR: 2.6 + .2 * Math.sin(t * 8 + i), aL: .3, mouth: .5, blink: blink(t, i + 20) });
    // салют складывается в «glean.» (37.4–)
    const g = ss(37.2, 38.4, t);
    if (t > 37.0) { const P = gleanPts(), cx = 0, cy = 260 - 150; L = E.L(3, .45); c = E.L(0);
      P.forEach(([px, py], i) => { const a = hash(i) * 6.283, r0 = 40 + hash(i * 3) * 60; const sx = 360 + Math.cos(a) * r0, sy = 360 + Math.sin(a) * r0;
        const x = lerp(sx, cx + px, eio(g)), y = lerp(sy, cy + py, eio(g)) + (1 - g) * (t - 37) * 20; const tw = .7 + .3 * Math.sin(t * 9 + i);
        A.circ(L, x, y, 3.4 * tw, i % 7 ? '#ffe6a0' : '#ff9a7a'); A.glow(L, x, y, 12, 'rgba(255,220,140,.9)', .45 * tw); });
      if (t < 37.4) A.glow(L, 360, 360, 300, 'rgba(255,230,170,.9)', clamp((37.4 - t) * 3)); }
    pill(t, 1 - ss(37.0, 37.4, t));
    cap('Which day is\nyour favorite?', 860, { size: 46, a: ss(39.2, 39.6, t) });
    // нижнее предложение — ответ в комментариях
    if (t > 39.6) { const v = E.X[4]; v.save(); v.setTransform(1, 0, 0, 1, 0, 0); v.globalAlpha = ss(39.6, 40, t); drawBoxText(v, 'tell us below ↓', 160, 1010, 400, 50, { font: z => `600 ${z}px IS`, size: 30, min: 14, color: K.cream, lines: 1 }); v.restore(); }
  });

  window.renderFrame = function (t) {
    globalThis.__T = t; E.clearAll(); E.defaults();
    const s = S.find(s => t >= s.a && t < s.b) || S[S.length - 1];
    s.fn(t, t - s.a); E.present(t);
  };
  window.SHOTS = S.map(s => [s.a, s.b]);
  window.ready = Promise.all([document.fonts.load('900 40px IB'), document.fonts.load('600 30px IS')]);
})();
