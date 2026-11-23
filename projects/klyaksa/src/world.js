// Свиток: солнце, дракон без глаза (путь-змейка), облака-завитки (закрывают тело), горы в тумане, сосна, водопад, птицы, волны, камни, печать.
'use strict';
const Wd = {};
(function () {
  const { stroke, line, blob, erase, hash, n1, n2, cl, lerp } = E;
  // ---------- путь дракона: хвост → кольца → голова → полёт → орбиты вокруг солнца
  const SUN = [760, 330];
  const coil = [[900, 990], [780, 905], [600, 880], [420, 870], [290, 790], [240, 640], [280, 480], [390, 350], [560, 280], [720, 310], [820, 420], [820, 520], [760, 585], [680, 605]];
  const fly = [[560, 612], [430, 570], [340, 440], [380, 280], [520, 170], [700, 130], [880, 200], [960, 330]];
  const orbit = []; for (let i = 0; i < 160; i++) { const a = -0.25 + i / 40 * Math.PI * 2 * -1 + Math.PI * .05; const r = 290 + 30 * Math.sin(i * .7);
    orbit.push([SUN[0] - 80 + Math.cos(-a) * r * .85, SUN[1] + 90 + Math.sin(-a) * r * .78]); }
  function buildPath(pts) {
    const P = E.spline(pts.map(p => [p[0], p[1], 0]), 4); const L = [0];
    for (let i = 1; i < P.length; i++) L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
    return { P, L, tot: L[L.length - 1] };
  }
  // соединяем: орбиту стыкуем к концу «полёта» по ближайшей точке
  let oi = 0, best = 1e9; for (let i = 0; i < 40; i++) { const d = Math.hypot(orbit[i][0] - fly[fly.length - 1][0], orbit[i][1] - fly[fly.length - 1][1]); if (d < best) { best = d; oi = i; } }
  const PATH = buildPath([...coil, ...fly, ...orbit.slice(oi + 1)]);
  const COIL = buildPath(coil).tot;
  function at(d) {
    const { P, L } = PATH; d = cl(d, 0, PATH.tot - 1);
    let lo = 0, hi = L.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (L[m] < d) lo = m; else hi = m; }
    const f = (d - L[lo]) / ((L[hi] - L[lo]) || 1); const a = P[lo], b = P[hi];
    return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, Math.atan2(b[1] - a[1], b[0] - a[0])];
  }
  Wd.SUN = SUN; Wd.at = at; Wd.COIL = COIL; Wd.wBody = u => wBody(u);
  // состояние дракона задаёт сценарий
  Wd.D = { head: COIL, alive: 0, jaw: 0, blink: 0, pupil: 0, glow: 0, surge: -1, look: [0, 0], t: 0, wink: 0 };
  const BL = COIL;            // длина тела
  function wBody(u) { return u < .08 ? lerp(30, 40, u / .08) : u < .3 ? lerp(40, 46, (u - .08) / .22) : lerp(46, 5, Math.pow((u - .3) / .7, 1.15)); }
  function spine(n) {
    const D = Wd.D, out = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n; const p = at(D.head - u * BL);
      const amp = D.alive * 14 * Math.sin(u * Math.PI) * (u > .05 ? 1 : u / .05);
      const off = amp * Math.sin(u * 13 - D.t * 5.5);
      out.push([p[0] - Math.sin(p[2]) * off, p[1] + Math.cos(p[2]) * off, p[2], u]);
    }
    for (let i = 0; i <= n; i++) { const a = out[Math.max(0, i - 1)], b = out[Math.min(n, i + 1)]; out[i][2] = Math.atan2(a[1] - b[1], a[0] - b[0]); }  // направление к голове
    return out;
  }
  // голова: локальные координаты, вперёд = +x, вверх = −y
  Wd.headTf = function () {
    const S = spine(40), p = S[0], a = p[2];
    const flip = cl(Math.cos(a) * 3, -1, 1);          // «перекат» — голова всегда макушкой вверх
    return { x: p[0], y: p[1], a, sy: flip >= 0 ? Math.max(.12, flip) : Math.min(-.12, flip), sc: 1.2 };
  };
  Wd.toWorld = function (lx, ly) {
    const h = Wd.headTf(), cs = Math.cos(h.a), sn = Math.sin(h.a);
    const x = lx * h.sc, y = ly * h.sc * h.sy;
    return [h.x + x * cs - y * sn, h.y + x * sn + y * cs];
  };
  Wd.EYE = [66, -22];  Wd.EYER = 15;
  Wd.eyePos = () => Wd.toWorld(Wd.EYE[0], Wd.EYE[1]);
  function head(D) {
    const h = Wd.headTf(), c = E.ctx; c.save(); c.translate(h.x, h.y); c.rotate(h.a); c.scale(h.sc, h.sc * h.sy);
    const T = D.t, al = D.alive, jaw = D.jaw;
    const sw = (k, a) => Math.sin(T * 2.2 * (1 + al) + k) * a * (.35 + al);
    const S = (pts, w, o = {}) => { const a0 = pts[0][2] ?? w, a1 = pts[pts.length - 1][2] ?? a0;
      stroke(pts.map((p, i) => [p[0], p[1], p[2] ?? (w || (a0 + (a1 - a0) * i / (pts.length - 1)))]), Object.assign({ a: .95, dry: .3 }, o)); };
    // грива назад
    for (let i = 0; i < 7; i++) {
      const y0 = -24 + i * 9, L = 80 + (i % 3) * 22;
      S([[14, y0, 12], [-14, y0 - 6 + sw(i, 5), 11], [-L * .6, y0 - 16 + sw(i + 1, 10), 8], [-L, y0 - 8 + sw(i + 2, 16), 2]], 0, { a: .9, dry: .5, seed: 40 + i, bands: 5 });
    }
    // рога-ветви
    S([[24, -38, 12], [4, -68, 10], [-26, -90 + sw(1, 2), 7], [-62, -98, 3]], 0, { seed: 51, dry: .3 });
    S([[-2, -72, 7], [0, -96, 5], [-6, -112, 2]], 0, { seed: 52, dry: .25 });
    S([[-30, -90, 6], [-30, -114, 4], [-38, -126, 2]], 0, { seed: 53, dry: .25 });
    S([[40, -40, 6], [30, -70], [12, -92, 1.5]], 0, { a: .6, seed: 54, dry: .5 });
    // силуэт головы — лёгкая заливка
    c.beginPath(); c.moveTo(0, -30); c.bezierCurveTo(20, -46, 50, -46, 62, -40); c.bezierCurveTo(80, -32, 100, -26, 120, -34);
    c.bezierCurveTo(140, -42, 154, -26, 152, -8); c.lineTo(140, 0); c.lineTo(58, 6); c.lineTo(20, 34); c.lineTo(0, 12); c.closePath();
    { const g = c.createLinearGradient(0, -46, 0, 34); g.addColorStop(0, E.col('ink', .42)); g.addColorStop(1, E.col('ink', .1)); c.fillStyle = g; c.fill(); }
    // пасть (киноварь) между губой и челюстью
    if (jaw > .03) { const ca = Math.cos(jaw * .5), sa = Math.sin(jaw * .5), J = (x, y) => [56 + x * ca - y * sa, 6 + x * sa + y * ca];
      E.poly([[56, 6], [84, 1], [112, 2], [142, -2], J(84, 2), J(60, 10), J(30, 10)], .9 * cl(jaw * 4), 'red'); }
    // нижняя челюсть
    c.save(); c.translate(56, 6); c.rotate(jaw * .5);
    c.beginPath(); c.moveTo(0, 0); c.lineTo(80, 4); c.lineTo(76, 12); c.lineTo(36, 20); c.lineTo(-14, 24); c.closePath(); c.fillStyle = E.col('ink', .14); c.fill();
    S([[-16, 22, 5], [30, 20], [76, 12, 3]], 0, { a: .9, seed: 56, dry: .4 });
    S([[2, 2, 6], [36, 10], [70, 10], [80, 4, 3]], 0, { seed: 57 });
    E.poly([[62, 6], [67, 6], [63, -6]], .95); E.poly([[28, 9], [33, 9], [29, -2]], .95);   // нижние клыки
    S([[60, 12, 4], [40, 34 + sw(3, 4)], [16, 50 + sw(4, 6), 1.5]], 0, { a: .85, dry: .5, seed: 58, bands: 4 });   // борода
    S([[40, 14, 4], [24, 40 + sw(5, 4)], [0, 54 + sw(6, 6), 1.5]], 0, { a: .8, dry: .5, seed: 59, bands: 4 });
    c.restore();
    // контуры: лоб, переносица, нос, губа
    S([[2, -30, 8], [30, -45], [62, -40, 6]], 0, { seed: 61 });
    S([[60, -38, 6], [94, -28], [120, -34, 5]], 0, { seed: 62 });
    S([[116, -34, 7], [136, -42], [151, -28], [153, -12], [142, -3, 4]], 0, { seed: 63 });
    S([[132, -24, 3], [140, -26], [143, -18], [137, -15, 2]], 0, { seed: 64, bands: 3 });     // ноздря
    S([[142, -2, 5], [112, 2], [84, 1], [56, 6, 3]], 0, { seed: 65 });
    E.poly([[119, 0], [125, 0], [121, 12]], .95); E.poly([[85, 1], [90, 1], [87, 11]], .95);   // верхние клыки
    S([[56, 6, 6], [42, -6], [28, 2], [34, 12, 3]], 0, { seed: 66, bands: 5 });              // скула-завиток
    // бровь-пламя
    S([[76, -40, 7], [56, -50], [38, -62], [20, -64, 1.5]], 0, { seed: 67, dry: .5 });
    S([[66, -44, 5], [52, -60], [44, -74, 1.5]], 0, { seed: 68, dry: .5 });
    // усы
    for (const [k, dy] of [[0, -4], [1, 4]]) {
      const pts = []; for (let i = 0; i <= 10; i++) { const s = i / 10; pts.push([146 + s * 120 - s * s * 150, dy + (k ? 1 : -1) * (s * 30 + s * s * 50) + Math.sin(s * 5 - T * 3) * 18 * s * (.4 + al), 4 * (1 - s) + .7]); }
      stroke(pts, { a: .92, bands: 2, dry: .1, seed: 60 + k, taper: .6 });
    }
    // глаз: внутри бумага; зрачок — клякса
    const [ex, ey] = Wd.EYE, er = Wd.EYER;
    erase(c2 => { c2.beginPath(); c2.ellipse(ex, ey, er, er * .85 * (1 - D.blink), 0, 0, 7); c2.fill(); });
    if (D.pupil > 0) {
      const pr = er * .66 * D.pupil, sq = (1 - D.blink) * (1 - D.wink * .92);
      blob(ex + D.look[0] * 3, ey + D.look[1] * 2, pr, .98, 'ink', .08, 7, T * .5, 1, sq);
      if (sq > .5) erase(c2 => { c2.beginPath(); c2.arc(ex + D.look[0] * 3 - pr * .35, ey - pr * .35, pr * .24, 0, 7); c2.fill(); });
    }
    if (D.glow > 0) { const g = c.createRadialGradient(ex, ey, 0, ex, ey, er * 4); g.addColorStop(0, E.col('gold', D.glow)); g.addColorStop(1, E.col('gold', 0)); c.fillStyle = g; c.beginPath(); c.arc(ex, ey, er * 4, 0, 7); c.fill(); }
    const lid = 1 - Math.max(D.blink, D.wink * .9);
    S([[ex - er - 4, ey + 3, 3], [ex - er * .4, ey - er * .95 * lid], [ex + er * .6, ey - er * .85 * lid], [ex + er + 5, ey - 2, 2]], 0, { bands: 3, dry: .1, seed: 69 });
    S([[ex - er + 1, ey + 4, 2.5], [ex, ey + er * .9], [ex + er + 2, ey + 3, 2]], 0, { a: .85, bands: 3, dry: .2, seed: 70 });
    c.restore();
  }
  function leg(S, u, side, D, k) {
    const i = Math.round(u * (S.length - 1)), p = S[i], a = p[2], w = wBody(u);
    const nx = -Math.sin(a), ny = Math.cos(a);   // нормаль (к брюху при side=1)
    const ph = Math.sin(D.t * 4 + k * 1.7) * D.alive;
    const bx = p[0] + nx * w * .3 * side, by = p[1] + ny * w * .3 * side;
    const ex = bx + nx * 38 * side + Math.cos(a) * (-14 + ph * 14), ey = by + ny * 38 * side + Math.sin(a) * (-14 + ph * 14);
    const fx = ex + Math.cos(a) * (26 + ph * 8) + nx * 14 * side, fy = ey + Math.sin(a) * (26 + ph * 8) + ny * 14 * side;
    stroke([[bx, by, 13], [ex, ey, 10], [fx, fy, 6]], { a: .9, dry: .35, seed: 70 + k });
    for (let j = -1; j <= 1; j++) {
      const ca = a + j * .5 + side * .4, cx = fx + Math.cos(ca) * 18, cy = fy + Math.sin(ca) * 18;
      stroke([[fx, fy, 4], [cx, cy, 3], [cx + Math.cos(ca + side * 1.4) * 9, cy + Math.sin(ca + side * 1.4) * 9, 1]], { a: .95, bands: 3, dry: .1, seed: 80 + k * 3 + j });
    }
  }
  Wd.dragon = function () {
    const D = Wd.D, n = 90, S = spine(n), c = E.ctx;
    const Lp = [], Rp = [];
    for (const p of S) { const w = wBody(p[3]) / 2, nx = -Math.sin(p[2]), ny = Math.cos(p[2]); Lp.push([p[0] - nx * w, p[1] - ny * w]); Rp.push([p[0] + nx * w, p[1] + ny * w]); }
    // тело: лёгкая заливка + волна туши/золота при пробуждении
    c.beginPath(); Lp.forEach((p, i) => c[i ? 'lineTo' : 'moveTo'](p[0], p[1])); for (let i = Rp.length - 1; i >= 0; i--) c.lineTo(Rp[i][0], Rp[i][1]); c.closePath();
    c.fillStyle = E.col('ink', .22 + .1 * D.alive); c.fill();
    for (let i = 0; i < n; i++) { const m0 = [(Lp[i][0] + Rp[i][0]) / 2, (Lp[i][1] + Rp[i][1]) / 2], m1 = [(Lp[i + 1][0] + Rp[i + 1][0]) / 2, (Lp[i + 1][1] + Rp[i + 1][1]) / 2];
      E.poly([Lp[i], Lp[i + 1], [m1[0] * .7 + Rp[i + 1][0] * .3, m1[1] * .7 + Rp[i + 1][1] * .3], [m0[0] * .7 + Rp[i][0] * .3, m0[1] * .7 + Rp[i][1] * .3]], .3); }
    if (D.surge > -0.2 && D.surge < 1.3) for (let i = 0; i < n; i++) {
      const u = i / n, f = Math.exp(-Math.pow((u - D.surge) / .07, 2)); if (f < .02) continue;
      E.poly([Lp[i], Lp[i + 1], Rp[i + 1], Rp[i]], f * .7, 'ink'); E.poly([Lp[i], Lp[i + 1], Rp[i + 1], Rp[i]], f * .8, 'gold');
    }
    // чешуя
    for (let i = 4; i < n - 3; i += 2) {
      const u = i / n, p = S[i], w = wBody(u), a = p[2];
      for (let r = -1; r <= 1; r++) {
        const ox = -Math.sin(a) * w * .28 * r, oy = Math.cos(a) * w * .28 * r, s = w * .2;
        const cx = p[0] + ox + Math.cos(a) * ((i % 4) ? s * .5 : 0), cy = p[1] + oy + Math.sin(a) * ((i % 4) ? s * .5 : 0);
        stroke([[cx - Math.sin(a) * s, cy + Math.cos(a) * s, 2.4], [cx - Math.cos(a) * s * .8, cy - Math.sin(a) * s * .8, 3], [cx + Math.sin(a) * s, cy - Math.cos(a) * s, 1.8]], { a: .85, bands: 2, dry: .3, seed: i * 3 + r, step: 2 });
      }
    }
    // гребень по спине
    for (let i = 6; i < n - 4; i += 3) {
      const p = Lp[i], q = Lp[Math.min(n, i + 3)], a = S[i][2], u = i / n, hgt = wBody(u) * .55 * (1 + .2 * Math.sin(i));
      const tip = [p[0] - Math.sin(a) * -hgt * -1 + Math.cos(a) * -hgt * .6, p[1] - Math.cos(a) * hgt + Math.sin(a) * -hgt * .6];
      stroke([[p[0], p[1], 4], [tip[0], tip[1], 1.5]], { a: .9, bands: 3, dry: .3, seed: 90 + i, taper: .7 });
      stroke([[tip[0], tip[1], 1.5], [q[0], q[1], 3]], { a: .7, bands: 2, dry: .3, seed: 190 + i });
    }
    // контуры спины и брюха
    stroke(Lp.filter((_, i) => i % 3 === 0).map((p, j, A) => [p[0], p[1], 11 * (1 - j / A.length) + 3]), { a: .97, dry: .45, seed: 11, step: 3, taper: .2 });
    stroke(Rp.filter((_, i) => i % 3 === 0).map((p, j, A) => [p[0], p[1], 6 * (1 - j / A.length) + 2]), { a: .92, dry: .4, seed: 12, step: 3, taper: .2 });
    // брюшные пластины
    for (let i = 5; i < n - 8; i += 3) { const p = Rp[i], a = S[i][2], w = wBody(i / n) * .35; stroke([[p[0], p[1], 2], [p[0] + Math.sin(a) * w, p[1] - Math.cos(a) * w, 1.5]], { a: .5, bands: 2, dry: .2, seed: i }); }
    // хвост-пламя
    { const p = S[n], a = p[2] + Math.PI; for (let j = -2; j <= 2; j++) { const aa = a + j * .35 + Math.sin(D.t * 3 + j) * .15 * (.3 + D.alive);
      stroke([[p[0], p[1], 6], [p[0] + Math.cos(aa) * 40, p[1] + Math.sin(aa) * 40, 4], [p[0] + Math.cos(aa + .4) * 70, p[1] + Math.sin(aa + .4) * 70, 1]], { a: .85, dry: .5, seed: 300 + j, bands: 4 }); } }
    leg(S, .14, 1, D, 0); leg(S, .2, -1, D, 1); leg(S, .52, 1, D, 2); leg(S, .58, -1, D, 3);
    head(D);
  };
  // ---------- облака-завитки (стирают то, что под ними)
  const CLOUDS = [
    { l: [[210, 300, 46], [270, 280, 58], [340, 300, 42], [300, 330, 40]], tail: -1, s: 1 },
    { l: [[610, 430, 30], [660, 412, 40], [715, 430, 30]], tail: 1, s: 2 },
    { l: [[840, 650, 44], [900, 630, 52], [960, 660, 40]], tail: -1, s: 3 },
    { l: [[150, 640, 40], [210, 620, 48], [262, 646, 34]], tail: 1, s: 4 },
    { l: [[520, 760, 40], [580, 742, 52], [646, 762, 40], [600, 790, 36]], tail: -1, s: 5 },
    { l: [[740, 880, 38], [800, 862, 46], [850, 885, 34]], tail: 1, s: 6 },
    { l: [[130, 920, 38], [190, 905, 46], [245, 925, 32]], tail: 1, s: 7 },
    { l: [[880, 230, 40], [940, 214, 48]], tail: -1, s: 8 },
  ];
  Wd.CLOUDS = CLOUDS;
  function cloud(cd, T) {
    const dx = Math.sin(T * .15 + cd.s) * 6, L = cd.l.map(q => [q[0] + dx, q[1], q[2]]);
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; L.forEach(q => { x0 = Math.min(x0, q[0] - q[2] - 120); x1 = Math.max(x1, q[0] + q[2] + 120); y0 = Math.min(y0, q[1] - q[2]); y1 = Math.max(y1, q[1] + q[2]); });
    if (!E.vis(x0, y0, x1, y1)) return;
    erase(c => { c.beginPath(); L.forEach(q => { c.moveTo(q[0] + q[2], q[1]); c.arc(q[0], q[1], q[2], 0, 7); }); c.fill(); });
    L.forEach((q, i) => {
      // внешний контур: части окружности вне других лепестков
      let run = [];
      const flush = () => { if (run.length > 3) stroke(run, { a: .85, bands: 3, dry: .35, seed: cd.s * 10 + i, taper: .3 }); run = []; };
      for (let k = 0; k <= 48; k++) {
        const an = Math.PI * .95 + k / 48 * Math.PI * 1.1 * 2 * .95, px = q[0] + Math.cos(an) * q[2], py = q[1] + Math.sin(an) * q[2];
        const inside = L.some((o, j) => j !== i && Math.hypot(px - o[0], py - o[1]) < o[2] - 1);
        if (!inside) run.push([px, py, 3.2]); else flush();
      }
      flush();
      // завиток внутри
      const sp = []; for (let k = 0; k <= 22; k++) { const s = k / 22, an = -Math.PI / 2 + s * Math.PI * 2.1 * (i % 2 ? 1 : -1), r = q[2] * (.62 - .5 * s); sp.push([q[0] + Math.cos(an) * r, q[1] + 4 + Math.sin(an) * r, 2.6 * (1 - s * .6)]); }
      stroke(sp, { a: .7, bands: 3, dry: .3, seed: cd.s * 7 + i });
      // тень снизу
      stroke([[q[0] - q[2] * .7, q[1] + q[2] * .62, 7], [q[0], q[1] + q[2] * .9], [q[0] + q[2] * .7, q[1] + q[2] * .62, 5]], { a: .12, bands: 3, dry: .1, seed: cd.s + i });
    });
    // шлейф
    const e = cd.tail > 0 ? L[L.length - 1] : L[0], sx = e[0] + cd.tail * e[2] * .8, sy = e[1] + e[2] * .5;
    stroke([[sx, sy, 3], [sx + cd.tail * 40, sy + 8 + Math.sin(T + cd.s) * 3], [sx + cd.tail * 90, sy - 2], [sx + cd.tail * 130, sy + 6, 1]], { a: .7, bands: 2, dry: .3, seed: cd.s * 3 });
  }
  // ---------- солнце
  function sun() { const [x, y] = SUN; blob(x, y, 92, .82, 'red', .02, 1, 0); }
  // ---------- горы в тумане (кэш мягкой заливки + сухие штрихи)
  function ridge(seed, x0, x1, base, amp, peaks) {
    const pts = []; for (let x = x0; x <= x1; x += 8) { let y = base; peaks.forEach(([px, ph, pw]) => { y -= ph * Math.exp(-Math.pow((x - px) / pw, 2)); }); y -= amp * (n1(x * .02 + seed) - .5); pts.push([x, y]); } return pts;
  }
  const R1 = ridge(1, -40, 1040, 1250, 30, [[180, 160, 120], [420, 220, 140], [700, 120, 110], [900, 180, 120]]);
  const R2 = ridge(2, -40, 1040, 1400, 40, [[90, 180, 120], [360, 120, 110], [560, 210, 120], [760, 80, 90]]);
  const CLIFF = ridge(3, 380, 1040, 1520, 24, [[860, 350, 190], [1000, 250, 120]]).map(p => [p[0], p[1] + Math.max(0, 600 - p[0]) * 1.3]);
  function mtnFill(R, a, depth) {
    return c => { const g = c.createLinearGradient(0, Math.min(...R.map(p => p[1])), 0, Math.max(...R.map(p => p[1])) + depth);
      g.addColorStop(0, E.col('ink', a)); g.addColorStop(.55, E.col('ink', a * .5)); g.addColorStop(1, E.col('ink', 0));
      c.beginPath(); c.moveTo(R[0][0], R[0][1]); R.forEach(p => c.lineTo(p[0], p[1])); const my = Math.max(...R.map(p => p[1])) + depth; c.lineTo(R[R.length - 1][0], my); c.lineTo(R[0][0], my); c.closePath(); c.fillStyle = g; c.fill(); };
  }
  function mountains() {
    if (!E.vis(-50, 950, 1050, 1750)) return;
    E.draw(E.cache('m1', -60, 900, 1120, 900, .5, 10, mtnFill(R1, .22, 300)));
    E.draw(E.cache('m2', -60, 1050, 1120, 900, .5, 8, mtnFill(R2, .36, 320)));
    // контуры хребтов сухой кистью
    stroke(R1.filter((_, i) => i % 3 === 0).map(p => [p[0], p[1], 3]), { a: .4, dry: .7, seed: 21, step: 4, taper: .1, press: .02 });
    stroke(R2.filter((_, i) => i % 3 === 0).map(p => [p[0], p[1], 4]), { a: .6, dry: .7, seed: 22, step: 4, taper: .1, press: .02 });
    // текстурные штрихи по склонам
    for (let i = 0; i < 46; i++) { const j = Math.floor(hash(i * 3.1) * R2.length), p = R2[j], L = 20 + 40 * hash(i * 7.7);
      stroke([[p[0], p[1] + 6, 3], [p[0] - 6 + 12 * hash(i), p[1] + L * .5], [p[0] - 10 + 20 * hash(i * 2), p[1] + L, 1]], { a: .35, bands: 3, dry: .7, seed: 400 + i }); }
  }
  // ---------- водопад слева
  function waterfall(T) {
    if (!E.vis(120, 1150, 420, 1800)) return;
    erase(c => { c.beginPath(); c.moveTo(268, 1130); for (let y = 1130; y <= 1640; y += 20) c.lineTo(268 - (y - 1130) * .04 - 3 * E.n1(y * .05), y); for (let y = 1640; y >= 1130; y -= 20) c.lineTo(292 + (y - 1130) * .04 + 3 * E.n1(y * .05 + 4), y); c.closePath(); c.fill();
      const g = c.createRadialGradient(280, 1660, 10, 280, 1660, 150); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.beginPath(); c.ellipse(280, 1660, 150, 80, 0, 0, 7); c.fill(); });
    stroke([[268, 1130, 5], [262, 1300], [254, 1480], [246, 1620, 1]], { a: .85, dry: .6, seed: 31, bands: 5 });
    stroke([[292, 1130, 5], [298, 1300], [306, 1480], [314, 1620, 1]], { a: .85, dry: .6, seed: 32, bands: 5 });
    for (let i = 0; i < 6; i++) { const x = 270 + i * 4, ph = (T * 160 + i * 97) % 420;
      stroke([[x, 1150 + ph, 1.2], [x + 1, 1230 + ph, 1.2]], { a: .3, bands: 1, dry: 0, seed: i }); }
  }
  // ---------- сосна на утёсе справа
  const PINE = [[930, 1300], [880, 1230], [830, 1190], [770, 1170]];
  function pine(T) {
    if (!E.vis(560, 1000, 1060, 1500)) return;
    E.draw(E.cache('cliff', 360, 950, 700, 950, .5, 8, mtnFill(CLIFF, .55, 360)));
    stroke(CLIFF.filter((_, i) => i % 2 === 0).map(p => [p[0], p[1], 6]), { a: .9, dry: .6, seed: 33, step: 3, taper: .1, press: .03 });
    for (let i = 0; i < 18; i++) { const j = Math.floor(hash(i * 5.3) * CLIFF.length), p = CLIFF[j]; stroke([[p[0], p[1] + 8, 5], [p[0] + 8, p[1] + 50 + 40 * hash(i), 1]], { a: .55, bands: 4, dry: .75, seed: 500 + i }); }
    const sw = Math.sin(T * .8) * 2;
    stroke(PINE.map((p, i) => [p[0], p[1] + (i === 3 ? sw : 0), 20 - i * 4]), { a: .9, dry: .75, seed: 34, bands: 8 });
    const br = [[[880, 1230], [820, 1250], [760, 1262]], [[840, 1196], [800, 1150], [740, 1140]], [[790, 1175], [730, 1186], [690, 1178]]];
    br.forEach((b, i) => { stroke(b.map(p => [p[0], p[1] + sw, 6]), { a: .9, dry: .6, seed: 35 + i });
      const e = b[2]; for (const [cx, cy] of [[e[0], e[1]], [b[1][0], b[1][1] - 6]]) {
        for (let k = 0; k < 11; k++) { const an = Math.PI + (k / 10) * Math.PI; const L = 26 + 6 * hash(k + i * 11);
          stroke([[cx, cy + sw, 2.5], [cx + Math.cos(an) * L, cy + sw + Math.sin(an) * L * .55, 1]], { a: .95, bands: 2, dry: .1, seed: 600 + k + i * 20, taper: .5 }); }
        stroke([[cx - 30, cy + 4 + sw, 10], [cx + 30, cy + 4 + sw, 8]], { a: .2, bands: 3, dry: .1, seed: 700 + i }); } });
    // мох-точки на гребне (среди них прячется клякса)
    Wd.MOSS.forEach(([x, y, r], i) => blob(x, y, r, .95, 'ink', .25, 800 + i, 0));
  }
  Wd.MOSS = []; for (let i = 0; i < 9; i++) { const x = 640 + i * 26 + 8 * hash(i * 2.2); let y = 1420; CLIFF.forEach(p => { if (Math.abs(p[0] - x) < 5) y = p[1]; }); Wd.MOSS.push([x, y - 3, 5 + 3 * hash(i * 9.1)]); }
  Wd.cliffY = x => { let y = 1420, d = 1e9; CLIFF.forEach(p => { const dd = Math.abs(p[0] - x); if (dd < d) { d = dd; y = p[1]; } }); return y; };
  // ---------- птицы
  Wd.bird = function (x, y, s, ph, a = .95) {
    const f = Math.sin(ph) * .9;
    stroke([[x - 10 * s, y + f * 14 * s - 4 * s, 1.5 * s], [x - 5 * s, y - 2 * s, 2.5 * s], [x, y, 3 * s]], { a, bands: 2, dry: .1, seed: 1 });
    stroke([[x, y, 3 * s], [x + 6 * s, y - 2 * s, 2.5 * s], [x + 12 * s, y + f * 14 * s - 4 * s, 1.5 * s]], { a, bands: 2, dry: .1, seed: 2 });
    blob(x, y + 1 * s, 3 * s, a, 'ink', .1, 3, 0, 1.4, 1);
  };
  Wd.flock = []; for (let i = 0; i < 7; i++) Wd.flock.push([hash(i * 4.4) * 120 - 60, hash(i * 7.1) * 70 - 35, .8 + .5 * hash(i * 3.3), hash(i) * 6]);
  Wd.flockPos = T => [1100 - (T - 16.5) * 120, 1500 + (T - 16.5) * 40 + Math.sin(T) * 10];
  function birds(T) { const [fx, fy] = Wd.flockPos(T); Wd.flock.forEach(([dx, dy, s, ph]) => { const x = fx + dx + Math.sin(T * 1.3 + ph) * 6, y = fy + dy; if (E.vis(x - 30, y - 30, x + 30, y + 30)) Wd.bird(x, y, s * 2.4, T * 9 + ph); }); }
  // ---------- река, волны, камни
  function waves(T) {
    if (!E.vis(-50, 1750, 1050, 2150)) return;
    for (let r = 0; r < 6; r++) for (let i = 0; i < 9; i++) {
      const y = 1820 + r * 48, x = -40 + i * 130 + (r % 2) * 65 + ((T * 18) % 130), w = 60 + 10 * hash(i + r * 9);
      stroke([[x - w, y + 8, 2], [x - w * .4, y - 6], [x + w * .2, y - 8], [x + w * .45, y - 2], [x + w * .3, y + 4, 1.5]], { a: .5 + r * .05, bands: 2, dry: .3, seed: r * 20 + i });
      stroke([[x + w * .3, y + 4, 1.5], [x + w * .1, y + 2], [x + w * .2, y - 2, 1]], { a: .5, bands: 1, dry: .1, seed: 3 });
    }
  }
  Wd.ROCKS = [[180, 2260, 150, 110, 1], [520, 2290, 190, 100, 2], [860, 2240, 130, 130, 3]];
  function rocks() {
    if (!E.vis(-50, 2080, 1050, 2420)) return;
    Wd.ROCKS.forEach(([x, y, rx, ry, s]) => {
      E.draw(E.cache('rk' + s, x - rx, y - ry, rx * 2, ry * 2, .5, 6, c => { const g = c.createLinearGradient(0, y - ry, 0, y + ry); g.addColorStop(0, E.col('ink', .05)); g.addColorStop(1, E.col('ink', .45));
        E.blobPath(x, y, 1, .18, s, 0, rx, ry); c.fillStyle = g; c.fill(); }));
      const pts = []; for (let k = 0; k <= 24; k++) { const an = Math.PI * 1.05 + k / 24 * Math.PI * .95; const rr = 1 + .18 * (n2(Math.cos(an) * 1.3 + s * 3, Math.sin(an) * 1.3) - .5) * 2; pts.push([x + Math.cos(an) * rx * rr, y + Math.sin(an) * ry * rr, 6]); }
      stroke(pts, { a: .97, dry: .45, seed: 900 + s, step: 3, bands: 8 });
      stroke([[x - rx * .2, y - ry * .7, 5], [x - rx * .05, y - ry * .2], [x - rx * .25, y + ry * .3, 2]], { a: .8, dry: .55, seed: 920 + s });
      for (let i = 0; i < 6; i++) blob(x - rx * .7 + hash(i * 5 + s) * rx * 1.3, y - ry * (.78 + .1 * hash(i + s)), 4 + 3 * hash(i * 2 + s), .95, 'ink', .3, i + s * 9);
      for (let i = 0; i < 7; i++) stroke([[x - rx * .6 + hash(i + s) * rx * 1.2, y - ry * .3 + hash(i * 3 + s) * ry * .6, 3], [x - rx * .55 + hash(i + s) * rx * 1.2, y + hash(i * 3 + s) * ry * .6, 1]], { a: .4, bands: 3, dry: .7, seed: 950 + i });
    });
  }
  function seal(x, y, s, a = 1, seed = 1) {
    const c = E.ctx; c.save(); c.translate(x, y); c.rotate(.03);
    E.blob(0, 0, s * .5, .9 * a, 'red', .04, seed, 0, 1, 1, 0);
    c.fillStyle = E.col('red', .9 * a); c.fillRect(-s / 2, -s / 2, s, s);
    erase(c2 => { c2.fillRect(-s * .38, -s * .38, s * .76, s * .06); c2.fillRect(-s * .38, s * .32, s * .76, s * .06); c2.fillRect(-s * .38, -s * .38, s * .06, s * .76); c2.fillRect(s * .32, -s * .38, s * .06, s * .76);
      c2.fillRect(-s * .2, -s * .22, s * .4, s * .05); c2.fillRect(-s * .02, -s * .22, s * .05, s * .44); c2.fillRect(-s * .2, s * .1, s * .4, s * .05); });
    c.restore();
  }
  Wd.seal = seal;
  // ---------- пятна-удары кисти (сценарий добавляет)
  Wd.marks = [];   // {x,y,r,t0,seed, wash:t}
  function marks(T) {
    Wd.marks.forEach(m => {
      if (T < m.t0) return; const g = E.seg(T, m.t0, m.t0 + .12, 'o');
      let a = .96; if (m.wash !== undefined && T > m.wash) { const w = E.seg(T, m.wash, m.wash + 2.2, 's'); a *= 1 - w * .92; E.dissolve(m.x, m.y, m.r * (1.6 + w * 1.2), Math.min(1, E.seg(T, m.wash, m.wash + .3) * 1.2) * (1 - E.seg(T, m.wash + 2.5, m.wash + 3.5))); }
      if (a < .02) return;
      let mx = m.x, my = m.y, k = 0;
      if (Wd.absorb && m.wash === undefined && T > Wd.absorb.t) { k = E.seg(T, Wd.absorb.t + m.seed % 5 * .07, Wd.absorb.t + .8 + m.seed % 5 * .07, 'i'); const tg = Wd.absorb.p;
        mx = lerp(m.x, tg[0], k) + Math.sin(k * Math.PI) * 60; my = lerp(m.y, tg[1], k) - Math.sin(k * Math.PI) * 40; if (k >= 1) return;
        blob(mx, my, m.r * .5 * (1 - k), k * .9, 'gold', .2, m.seed, T); }
      const gg = g * (1 - k);
      blob(mx, my, m.r * gg, a, 'ink', .28, m.seed, 0, m.sx || 1.3, m.sy || .8, m.rot || 0);
      for (let i = 0; i < 9; i++) { const an = hash(m.seed * 9 + i) * 7, d = m.r * (1.3 + hash(i + m.seed) * 1.4) * gg; blob(mx + Math.cos(an) * d, my + Math.sin(an) * d * .8, m.r * (.06 + .12 * hash(i * 3 + m.seed)) * (1 - k), a, 'ink', .2, i + m.seed, 0); }
    });
  }
  // ---------- весь свиток
  Wd.paint = function (T, opt = {}) {
    sun();
    if (!opt.noDragon) Wd.dragon();
    CLOUDS.forEach(cd => cloud(cd, T));
    mountains(); waterfall(T); pine(T); waves(T); rocks(); birds(T);
    seal(905, 2330, 64, 1, 2);
    marks(T);
  };
})();
