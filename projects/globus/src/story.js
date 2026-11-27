// SNOW GLOBE — сюжет. Все времена — секунды ролика. Год — только из yearAt().
(function () {
  const { clamp, lerp, ss, eio, eo, back, hash, noise1 } = E;
  const DUR = window.DURATION = 44.2;
  // ---------- год на табличке-дате (одна функция на весь ролик)
  const YEARS = [[0, 2009], [7.4, 2011], [8.8, 2013], [10.2, 2014], [11.6, 2015], [13.0, 2016]];
  function yearAt(t) {
    if (t >= 30.5) return 2026;
    if (t >= 17.3 && t < 30.5) return Math.min(2023, 2017 + Math.floor(clamp((t - 17.3) / 3.2) * 6.99));
    let y = 2009; for (const [a, v] of YEARS) if (t >= a) y = v; return y;
  }
  E.yearAt = yearAt;
  // ---------- тряски шара (снег в жидкости поднимается от каждой)
  E.SHAKES.push({ t: -.4, s: 1.05 }, { t: 4.0, s: .9, x: .3 }, { t: 7.4, s: .8 }, { t: 8.8, s: .85, x: -.3 }, { t: 10.2, s: .8 }, { t: 11.6, s: .6 },
    { t: 17.0, s: 0 }, { t: 21.8, s: .22, x: -.4 }, { t: 23.0, s: .32, x: -.5 }, { t: 24.3, s: .45, x: -.6 }, { t: 27.35, s: 1.0, x: .4 },
    { t: 33.0, s: 0 }, { t: 37.0, s: 1.1 }, { t: 41.5, s: .7 });
  // ---------- помощники
  const key = (u, ks) => { if (u <= ks[0][0]) return ks[0][1]; for (let i = 1; i < ks.length; i++) if (u < ks[i][0]) { const [a, va] = ks[i - 1], [b, vb] = ks[i]; return lerp(va, vb, eio((u - a) / (b - a))); } return ks[ks.length - 1][1]; };
  const blink = (t, sd = 0) => { const p = (t + sd * 1.7) % 3.1; return p < .12 ? Math.sin(p / .12 * Math.PI) : 0; };
  const jolt = (u, a = 1, f = 21, d = 2.2) => u < 0 ? 0 : a * Math.sin(u * f) * Math.exp(-u * d);
  const S = [];
  const shot = (a, b, fn) => S.push({ a, b, fn });

  // ---------- мир внутри шара
  function world(t, cp, o) {
    const c0 = E.layerCtx(0), c1 = E.layerCtx(1), c2 = E.layerCtx(2), tint = o.tint ?? 1;
    A.ground(c0, 0, tint); A.tree(c0, -.36, E.ground(-.36, E.LZ[0]) + .03, .5);
    A.tree(c0, -.62, E.ground(-.62, E.LZ[0]) + .04, .3);
    A.house(c0, .3, E.ground(.3, E.LZ[0]) + .03, 1.05, o.light ?? 1, t);
    A.ground(c1, 1, tint);
    const m = o.man || {}; const mx = m.x ?? -.12;
    // скамейка
    c1.fillStyle = '#5a3420'; c1.fillRect(-.33, E.ground(-.3, E.LZ[1]) + .055, .16, .016); c1.fillRect(-.32, E.ground(-.3, E.LZ[1]), .012, .06); c1.fillRect(-.19, E.ground(-.3, E.LZ[1]), .012, .06);
    c1.fillStyle = '#f6f9ff'; c1.fillRect(-.335, E.ground(-.3, E.LZ[1]) + .07, .17, .01);
    A.snowman(c1, .2, E.ground(.2, E.LZ[1]) - .005, o.snow ?? .5, { tilt: o.snowTilt || 0 });
    A.man(c1, Object.assign({ t, y: E.ground(mx, E.LZ[1]) + (m.dy || 0), s: 1.2, blink: blink(t, 1) }, m, { x: mx }));
    A.ground(c2, 2, tint);
    if (o.bubbles) for (let i = 0; i < 26; i++) { const ph = (t * (.25 + hash(i) * .3) + hash(i * 3)) % 1; const x = -.55 + hash(i * 5) * .4 + Math.sin(t * 3 + i) * .02, y = -.4 + ph * 1.2;
      if (y > E.P.H2O) continue; const c = E.layerCtx(i % 2 + 1); c.strokeStyle = 'rgba(230,245,255,.8)'; c.lineWidth = .004; c.beginPath(); c.arc(x, y, .008 + hash(i * 7) * .014, 0, 7); c.stroke(); }
    E.drawFlakes(t, cp, o.snowA ?? 1);
  }
  const insideCam = (p, tg, fov = 58, roll = 0) => { E.cam = { p, t: tg, fov, roll }; };
  const tagYear = (t, a = 1) => A.tag(E.vx, `DEC 24 · ${yearAt(t)}`, a);
  const fadeIn = (u, d = .25) => clamp(u / d);

  // ============ 1. ХУК: небо трясётся (0–3.2)
  shot(0, 3.2, (t, u) => {
    const j = jolt(u + .4, 1, 19, 1.3);
    insideCam([-.05 + j * .03, -.3 + j * .02, .78], [-.1, -.2 + j * .05, -1], 58, j * .14);
    E.OUTOFF = [j * 120, -40 + j * 30];
    const cp = E.prepare();
    const fall = key(u, [[0, .35], [.45, 1.25], [1.5, 1.25], [1.9, .25], [2.3, 0]]);
    world(t, cp, { snow: .45, man: { x: -.1, fall, dy: fall > .6 ? .02 : 0, aL: key(u, [[0, 2.4], [1.6, 2.6], [2.0, .3]]), aR: key(u, [[0, 2.7], [2.1, 2.5], [2.4, 2.9], [2.7, 2.3], [3, 2.9]]),
      mouth: u < 1.9 ? .7 + .3 * Math.sin(u * 18) : .2, smile: 1, look: u > 2 ? -.3 : 0, brow: u < 1.9 ? 1 : 0 } });
    A.room(E.ox, 'night', t);
    A.face(E.ox, { age: 'g6', x: 360 + jolt(u + .4, 1, 19, 1.3) * -60, y: key(u, [[0, 420], [1.3, 200]]), s: key(u, [[0, 1.2], [1.5, 1.9]]), smile: .9, mouth: .5 + .2 * Math.sin(u * 9), blink: blink(t), look: [0, 1] });
    A.cap(E.vx, 'OUR SKY SHAKES\nONCE A YEAR', 900, { size: 60, maxW: 680, pop: lerp(.9, 1, back(u / .3)) });
    tagYear(t, fadeIn(u - 1.6));
  });
  // ============ 2. Снаружи: Лили трясёт шар (3.2–7.4)
  shot(3.2, 7.4, (t, u) => {
    const k = t - 4.0; E.globe = { rx: 0, rz: k > 0 ? jolt(k, .22, 14, 1.6) : 0, off: [k > 0 ? jolt(k, .25, 14, 1.6) : 0, k > 0 ? Math.abs(jolt(k, .12, 14, 1.6)) : 0, 0] };
    E.cam = { p: [.35, .2, lerp(5.3, 4.8, u / 4.2)], t: [0, -.42, 0], fov: 42, roll: 0 };
    const cp = E.prepare();
    world(t, cp, { snow: .45, man: { aR: 2.5 + .4 * Math.sin(u * 9), aL: .3, mouth: .3, smile: 1, look: .2 } });
    A.room(E.ox, 'night', t);
    A.face(E.ox, { age: 'g6', x: 540, y: 250, s: 1.15, smile: 1, mouth: k > 0 && k < 1.5 ? .6 : .25, blink: blink(t, 2), look: [-.6, .8], tilt: -.1 });
    const b = A.base(E.vx, 'LILY · 2009'); A.hands(E.vx, { kind: 'mit' });
    A.cap(E.vx, 'Every Christmas Eve,\nLily shakes it.', 930, { size: 44, a: fadeIn(u - .3) });
    tagYear(t);
  });
  // ============ 3. Годы (7.4–13.0): изнутри, лицо за куполом взрослеет, снеговик растёт
  const MON = [{ a: 7.4, age: 'g6', sn: .6, pose: 'wave2' }, { a: 8.8, age: 'g10', sn: .72, pose: 'bow' }, { a: 10.2, age: 'g10', sn: .86, pose: 'wave' }, { a: 11.6, age: 'g14', sn: 1, pose: 'wave' }];
  MON.forEach((m, i) => shot(m.a, m.a + 1.4, (t, u) => {
    const j = jolt(u, .8, 20, 2.5);
    const ang = [-.12, .1, -.05, .12][i];
    insideCam([ang + j * .02, -.28, .74], [ang * 2 - .05, -.2 + j * .04, -1], 60, j * .1);
    E.OUTOFF = [j * 90 + ang * 200, -20];
    const cp = E.prepare();
    let man = { mouth: .4, smile: 1 };
    if (m.pose == 'wave2') man = { aL: 2.6 + .3 * Math.sin(u * 10), aR: 2.6 + .3 * Math.sin(u * 10 + 1), mouth: .5, smile: 1 };
    if (m.pose == 'bow') man = { lean: key(u, [[0, 0], [.5, .5], [1.0, .5], [1.3, 0]]), aR: 1.2, aL: .3, smile: 1 };
    if (m.pose == 'wave') man = { aR: 2.5 + .4 * Math.sin(u * 9), aL: .3, mouth: i == 3 ? .1 : .4, smile: 1, look: i == 3 ? -.2 : 0 };
    world(t, cp, { snow: m.sn, man });
    A.room(E.ox, i == 3 ? 'teen' : 'night', t);
    const look = i == 3 ? [lerp(0, .9, ss(.5, 1.0, u)), .2] : [0, 1];
    A.face(E.ox, { age: m.age, x: 360, y: 200, s: 1.7, smile: i == 3 ? .3 : .9, mouth: i == 3 ? 0 : .35, blink: blink(t, i), look });
    A.tag(E.vx, `DEC 24 · ${yearAt(t)}`);
    if (t > 8.0 && t < 11.0) A.cap(E.vx, 'He lived for that one day.', 920, { size: 42, maxW: 700, a: fadeIn(t - 8.0) * (1 - clamp((t - 10.8) / .2)) });
  }));
  // ============ 4. Поворот 1: выросла (13.0–17.0)
  shot(13.0, 17.0, (t, u) => {
    const down = key(u, [[0, 0], [1.4, 0], [2.6, 1]]);
    E.globe = { rx: 0, rz: 0, off: [0, -down * 1.0, 0] };
    E.cam = { p: [.2, .25, 5.0], t: [0, -.42, 0], fov: 42, roll: 0 };
    E.P.expo = lerp(1, .0, ss(2.6, 3.8, u));
    const cp = E.prepare();
    world(t, cp, { snow: 1, man: { aR: key(u, [[0, 2.6], [1.6, 2.6], [2.4, .4]]), aL: .3, smile: key(u, [[0, .8], [2, -.2]]), look: .1 } });
    A.room(E.ox, 'teen', t);
    A.face(E.ox, { age: 'g14', x: 520, y: 230, s: 1.15, smile: .1, blink: blink(t, 3), look: [.4, 1], glow: 1 });
    // телефон у неё в руке (в фоне)
    E.ox.fillStyle = '#111'; E.ox.beginPath(); E.ox.roundRect(600, 470, 90, 160, 14); E.ox.fill(); E.ox.fillStyle = '#9cc8ff'; E.ox.fillRect(608, 480, 74, 140);
    A.base(E.vx, 'LILY · 2009'); A.hands(E.vx, { kind: 'kid', cuff: '#5a4b7a' });
    // коробка поднимается спереди, клапаны закрываются
    const v = E.vx, by = lerp(1400, 640, eo((u - 1.2) / 1.4));
    v.fillStyle = '#9a6a3a'; v.fillRect(40, by, 640, 900); v.fillStyle = 'rgba(0,0,0,.25)'; v.fillRect(40, by, 640, 30);
    v.fillStyle = '#c8b48a'; v.fillRect(300, by, 120, 900);
    drawBoxText(v, 'ATTIC · XMAS', 140, by + 120, 440, 110, { font: z => `900 ${z}px IB`, size: 60, min: 24, color: 'rgba(40,20,10,.8)', lines: 1 });
    const fl = ss(2.7, 3.5, u);
    if (fl > 0) { v.fillStyle = '#8a5a2e'; v.fillRect(40, -40, 640, fl * 700); v.fillStyle = 'rgba(0,0,0,.4)'; v.fillRect(40, fl * 700 - 60, 640, 20); }
    A.cap(E.vx, 'Then she grew up.', 930, { size: 50, a: fadeIn(u - .4) * (1 - ss(3.4, 3.8, u)) });
    tagYear(t, 1 - ss(3.4, 3.8, u));
  });
  // ============ 5. В коробке: годы без снега; он раскачивает шар сам (17.0–25.5)
  shot(17.0, 25.5, (t, u) => {
    // попытки: разбег → удар о стекло (21.8, 23.0, 24.3)
    const hits = [21.8, 23.0, 24.3], amp = [.4, .65, 1];
    let jl = 0, rockRoll = 0; hits.forEach((h, i) => { jl += jolt(t - h, amp[i], 16, 2.6); rockRoll += t > h ? amp[i] * .03 : 0; });
    insideCam([.0 + jl * .03, -.27, .9], [-.2, -.24 + jl * .05, -1], 62, jl * .1 + rockRoll * Math.sin(t * 2.4) * .5);
    E.OUTOFF = [jl * 80, 0];
    E.P.expo = lerp(0, .78, ss(17, 17.8, t)); E.P.amb = [.55, .6, .78]; E.P.room = [.18, .14, .1]; E.P.env = .5; E.P.bloom = 1.1;
    const cp = E.prepare();
    // поза: сидит на скамейке → встаёт → бег к стеклу и удар → откат, падение
    let man;
    if (t < 20.8) man = { x: -.25, sit: 1, aL: .2, aR: .2, look: -.4 + .2 * Math.sin(t * .7), smile: -.1, dy: .03, brow: .5 };
    else {
      let x = -.25, run, fall = 0, mouth = 0, brow = 0;
      const seg = [[20.8, 21.8, -.25, -.74], [22.2, 23.0, -.4, -.74], [23.4, 24.3, -.42, -.74]];
      for (let i = 0; i < 3; i++) { const [a, b, x0, x1] = seg[i];
        if (t >= a && t < b) { const q = (t - a) / (b - a); x = lerp(x0, x1, q * q); run = q * 14; brow = -1; }
        const nb = seg[i + 1] ? seg[i + 1][0] : 25.6;
        if (t >= b && t < nb) { const q = t - b; x = lerp(x1, x1 + .3 + i * .05, eo(q / .5)); fall = -key(q, [[0, 0], [.2, 1.1], [nb - b - .3, 1.1], [nb - b, 0]]) * (i == 2 ? .8 : 1); mouth = q < .3 ? .6 : 0; }
      }
      man = { x, run, fall, aL: run !== undefined ? 1.2 : .6, aR: run !== undefined ? 1.2 : .6, flip: 1, lean: run !== undefined ? .3 : 0, mouth, brow, smile: 0 };
    }
    const light = t < 18 ? 1 : t < 20.5 ? clamp(1 - (t - 18) / 2.5 + (noise1(t * 9) > .5 ? .15 : -.15)) : 0;
    world(t, cp, { snow: 1, light, man, tint: .9 });
    A.room(E.ox, 'box', t);
    // щель света в клапанах коробки
    E.ox.fillStyle = 'rgba(255,220,160,.25)'; E.ox.fillRect(-108, 150, 936, 10);
    A.tag(E.vx, `DEC 24 · ${yearAt(t)}`, ss(17.3, 17.6, t));
    A.cap(E.vx, 'Nobody shakes a world in a box.', 930, { size: 46, a: fadeIn(t - 17.7) * (1 - ss(20.4, 20.7, t)) });
    A.cap(E.vx, 'So he shook it himself.', 930, { size: 48, a: fadeIn(t - 20.9) * (1 - ss(24.0, 24.3, t)) });
  });
  // ============ 6. Полка → падение → трещина (25.5–30.5)
  shot(25.5, 27.35, (t, u) => {
    const rock = key(u, [[0, 0], [.9, 0]]) + Math.sin(u * 9) * .06 * (1 + u);
    const tip = ss(.85, 1.85, u);
    E.globe = { rx: tip * 1.5, rz: rock, off: [tip * .4, -tip * tip * 4.2, tip * .2] };
    E.cam = { p: [0, .3 - tip * 2.2, 6.2], t: [0, -.2 - tip * 2.8, 0], fov: 42, roll: 0 };
    E.P.expo = .7; E.P.room = [.12, .12, .2]; E.P.amb = [.55, .6, .8];
    const cp = E.prepare();
    world(t, cp, { snow: 1, light: 0, man: { x: -.5, fall: -.9, mouth: .7, brow: 1 }, tint: .9 });
    A.room(E.ox, 'attic', t); E.ox.fillStyle = 'rgba(160,190,255,.25)'; E.ox.fillRect(480, 0, 200, 260); // лунное окно
    const v = E.vx, C = E.projG([0, 0, 0]);
    // полка
    const shY = E.project([0, -1.3, 0]).y; v.fillStyle = '#2a1a12'; v.fillRect(-20, shY, 520, 40); v.fillStyle = 'rgba(255,255,255,.08)'; v.fillRect(-20, shY, 520, 4);
    // коробка: раскачивается и опрокидывается, шар вылетает
    if (tip < .35) {
      v.save(); v.translate(C.x, C.y + C.s * .2); v.rotate(rock * 1.3 + tip * 2); const s = C.s;
      v.fillStyle = '#7a542c'; v.fillRect(-s * 1.25, -s * 1.3, s * 2.5, s * 2.75); v.fillStyle = '#a88c60'; v.fillRect(-s * .2, -s * 1.3, s * .4, s * 2.75);
      drawBoxText(v, 'ATTIC · XMAS', -s * .9, -s * .2, s * 1.8, s * .5, { font: z => `900 ${z}px IB`, size: 40, min: 14, color: 'rgba(30,15,5,.75)', lines: 1 });
      v.restore();
    } else { E.P.expo = .75; }
    E.P.fade = 1;
  });
  shot(27.35, 29.1, (t, u) => {
    const bounce = Math.abs(jolt(u, .25, 15, 3.5));
    E.globe = { rx: 0, rz: .12 + jolt(u, .2, 12, 3), off: [0, bounce, 0] };
    E.cam = { p: [.4 + jolt(u, .08, 30, 4), -.5, 4.6], t: [0, -.6, 0], fov: 42, roll: jolt(u, .06, 30, 4) };
    E.P.H2O = lerp(1.2, .55, ss(.1, 1.75, u)); E.P.expo = .75 + (u < .08 ? 2 : 0); E.P.room = [.12, .1, .12]; E.P.amb = [.6, .62, .78];
    const cp = E.prepare();
    world(t, cp, { snow: 1, light: 0, man: { x: -.1, fall: key(u, [[0, -1.2], [1.2, -1.2], [1.7, -.3]]), mouth: .6, brow: 1, smile: -.5 }, tint: .9, snowTilt: -.4 });
    A.room(E.ox, 'floor', t);
    const b = A.base(E.vx, 'LILY · 2009');
    const cr = [-.48, -.3, .82]; A.crack(E.vx, cr, ss(0, .25, u), t);
    // вытекающая струйка и лужа
    const P = E.projG(cr), v = E.vx, pk = ss(.2, 1.7, u);
    v.strokeStyle = 'rgba(200,225,255,.7)'; v.lineWidth = 4; v.beginPath(); v.moveTo(P.x, P.y); v.quadraticCurveTo(P.x - 30, P.y + 40, P.x - 34, b.bot + 10); v.stroke();
    const pg = v.createRadialGradient(P.x - 60, b.bot + 26, 0, P.x - 60, b.bot + 26, 260 * pk); pg.addColorStop(0, 'rgba(170,200,240,.45)'); pg.addColorStop(1, 'rgba(170,200,240,0)');
    v.fillStyle = pg; v.beginPath(); v.ellipse(P.x - 60, b.bot + 26, 260 * pk + 1, 50 * pk + 1, 0, 0, 7); v.fill();
    A.cap(E.vx, 'The sky cracked.', 930, { size: 54, a: fadeIn(u - .45) });
    if (u < .1) { v.fillStyle = `rgba(255,255,255,${.8 * (1 - u / .1)})`; v.fillRect(0, 0, 720, 1280); }
  });
  shot(29.1, 30.5, (t, u) => {
    insideCam([.05, .06, .8], [-.08, -.2, -1], 62, .05);
    E.P.H2O = lerp(.5, -.12, ss(0, 1.4, u)); E.P.expo = .72; E.P.amb = [.6, .62, .78]; E.P.room = [.1, .08, .1]; E.P.env = .6;
    const cp = E.prepare();
    world(t, cp, { snow: 1, light: 0, bubbles: 1, man: { x: -.1, look: -.6, aL: .9, aR: .9, mouth: .45, brow: 1, smile: -.6 }, tint: .9, snowTilt: -.4 });
    A.room(E.ox, 'floor', t);
    A.cap(E.vx, 'The sky cracked.', 930, { size: 54 });
  });
  // ============ 7. Нашли (30.5–37.0)
  shot(30.5, 32.2, (t, u) => {
    insideCam([.05, .04, .8], [-.05, -.12, -1], 64, 0);
    E.P.H2O = -.12; E.P.expo = lerp(.7, 1.05, ss(0, .6, u)); E.P.amb = [lerp(.6, 1, ss(0, .6, u)), lerp(.62, .95, ss(0, .6, u)), .85]; E.P.room = [.4, .32, .25];
    const cp = E.prepare();
    world(t, cp, { snow: 1, light: 0, man: { x: -.1, look: -.4, aL: .3, aR: .3, mouth: 0, brow: .8, smile: -.2 }, snowTilt: -.4 });
    A.room(E.ox, 'attic', t); const g = E.ox.createRadialGradient(360, 0, 0, 360, 0, 700); g.addColorStop(0, `rgba(255,230,180,${.8 * ss(0, .5, u)})`); g.addColorStop(1, 'rgba(255,230,180,0)'); E.ox.fillStyle = g; E.ox.fillRect(-108, -192, 936, 1664);
    A.face(E.ox, { age: 'b6', x: 360 + Math.sin(u * 2) * 20, y: key(u, [[0, -300], [.9, 210]]), s: 1.7, smile: .5, mouth: .2, blink: blink(t, 5), look: [0, 1], tilt: .15 });
    tagYear(t, fadeIn(u - .3));
  });
  shot(32.2, 33.7, (t, u) => {
    E.globe = { rx: 0, rz: .12, off: [0, 0, 0] };
    E.cam = { p: [-.3, -.35, lerp(4.4, 4.0, u / 1.5)], t: [0, -.5, 0], fov: 42, roll: 0 };
    E.P.H2O = -.12; E.P.room = [.4, .32, .25];
    const cp = E.prepare();
    world(t, cp, { snow: 1, light: 0, man: { x: -.1, look: .3, aL: .3, aR: .3, brow: .8, smile: 0 }, snowTilt: -.4 });
    A.room(E.ox, 'floor', t); const g = E.ox.createRadialGradient(360, 0, 0, 360, 0, 900); g.addColorStop(0, 'rgba(255,230,180,.6)'); g.addColorStop(1, 'rgba(255,230,180,0)'); E.ox.fillStyle = g; E.ox.fillRect(-108, -192, 936, 1664);
    A.face(E.ox, { age: 'b6', x: 640, y: 380, s: .8, smile: .4, blink: blink(t, 5), look: [-1, .5] });
    A.face(E.ox, { age: 'w', x: 330, y: 260, s: 1.15, smile: key(u, [[0, -.1], [.8, -.1], [1.3, .6]]), mouth: key(u, [[0, .0], [.4, .15], [1, .1]]), brow: key(u, [[0, 0], [.4, 1], [1.2, .3]]), blink: blink(t, 6), look: [0, 1] });
    A.base(E.vx, 'LILY · 2009'); A.crack(E.vx, [-.48, -.3, .82], 1, t);
    A.cap(E.vx, 'Lily. 17 years later.', 930, { size: 50, a: fadeIn(u - .2) });
  });
  shot(33.7, 35.5, (t, u) => {
    E.globe = { rx: 0, rz: 0, off: [0, 0, 0] };
    E.cam = { p: [.2, .15, 5.0], t: [0, -.42, 0], fov: 42, roll: 0 };
    E.P.H2O = lerp(-.12, 1.2, ss(.1, 1.2, u)); E.P.room = [.75, .62, .5]; E.P.expo = 1.05;
    const cp = E.prepare();
    world(t, cp, { snow: 1, light: 0, man: { x: -.1, look: -.5, aL: 2.4, aR: 2.4, mouth: .5, brow: 1, smile: 1 } });
    A.room(E.ox, 'kitchen', t);
    A.face(E.ox, { age: 'w', x: 540, y: 220, s: 1.05, smile: .6, blink: blink(t, 6), look: [-.7, .8], tilt: -.08 });
    const v = E.vx; A.base(v, 'LILY · 2009'); const cr = [-.48, -.3, .82]; const P = E.projG(cr);
    A.crack(v, cr, 1, t);
    if (u < 1.3) { v.strokeStyle = 'rgba(210,235,255,.8)'; v.lineWidth = 6; v.beginPath(); v.moveTo(P.x - 200, P.y - 400); v.quadraticCurveTo(P.x - 60, P.y - 300, P.x, P.y); v.stroke();
      v.fillStyle = 'rgba(220,240,255,.35)'; v.beginPath(); v.roundRect(P.x - 300, P.y - 560, 120, 170, 16); v.fill(); }
    if (u > 1.3) { const k = eo((u - 1.3) / .3); v.save(); v.translate(P.x, P.y); v.rotate(-.5); v.fillStyle = 'rgba(245,235,200,.85)'; v.fillRect(-90 * k, -26, 180 * k, 52); v.restore(); }
    A.hands(v, { kind: 'skin', cuff: '#3c4a5e' });
    A.cap(v, 'She fixed the sky.', 930, { size: 52, a: fadeIn(u - .3) });
  });
  shot(35.5, 37.0, (t, u) => {
    const pass = eio(u / 1.1);
    E.globe = { rx: 0, rz: 0, off: [lerp(-.4, .5, pass), 0, 0] };
    E.cam = { p: [0, .1, 5.2], t: [0, -.42, 0], fov: 42, roll: 0 };
    E.P.room = [.75, .62, .5]; E.P.expo = 1.05;
    const cp = E.prepare();
    world(t, cp, { snow: 1, light: 0, man: { x: -.1, look: .3, aL: .3, aR: 2.5, smile: 1 } });
    A.room(E.ox, 'kitchen', t);
    A.face(E.ox, { age: 'w', x: 170, y: 250, s: .95, smile: .8, blink: blink(t, 6), look: [1, .5] });
    A.face(E.ox, { age: 'b6', x: 590, y: 420, s: .95, smile: 1, mouth: .6, blink: blink(t, 5), look: [-.8, .7] });
    const v = E.vx; A.base(v, 'LILY · 2009'); A.crack(v, [-.48, -.3, .82], 1, t);
    const P = E.projG([-.48, -.3, .82]); v.save(); v.translate(P.x, P.y); v.rotate(-.5); v.fillStyle = 'rgba(245,235,200,.85)'; v.fillRect(-90, -26, 180, 52); v.restore();
    A.hands(v, { kind: pass < .6 ? 'skin' : 'kid', cuff: pass < .6 ? '#3c4a5e' : '#d9a13a' });
    A.cap(v, 'Your turn.', 930, { size: 52, a: fadeIn(u - .3) });
  });
  // ============ 8. Снег снова (37.0–41.8)
  shot(37.0, 41.8, (t, u) => {
    const j = jolt(u, 1, 19, 1.3);
    insideCam([-.05 + j * .03, -.3 + j * .02, .9], [-.1, -.2 + j * .05, -1], 58, j * .14);
    E.OUTOFF = [j * 120, -30];
    E.P.room = [.75, .62, .5]; E.P.expo = 1.05;
    const cp = E.prepare();
    const fall = key(u, [[0, .35], [.4, 1.25], [1.2, 1.25], [1.6, .2], [2.0, 0]]);
    world(t, cp, { snow: 1, light: u > .15 ? 1 : 0, man: { x: -.1, fall, dy: fall > .6 ? .02 : 0, aL: key(u, [[0, 2.4], [1.6, 2.6], [2.1, 2.5]]) + (u > 2.1 ? .3 * Math.sin(u * 9 + 1) : 0), aR: 2.5 + .35 * Math.sin(u * 9),
      mouth: u < 1.6 ? .7 + .3 * Math.sin(u * 18) : .35, smile: 1, look: u > 1.8 ? -.25 : 0 } });
    A.room(E.ox, 'kitchen', t);
    A.face(E.ox, { age: 'w', x: 200, y: key(u, [[0, 300], [1, 230]]), s: 1.25, smile: .9, mouth: .3, blink: blink(t, 6), look: [.4, 1] });
    A.face(E.ox, { age: 'b6', x: 530, y: key(u, [[0, 340], [1, 260]]), s: 1.35, smile: 1, mouth: .6 + .2 * Math.sin(u * 8), blink: blink(t, 5), look: [-.3, 1] });
    A.cap(E.vx, 'It never snows\nin a world\nnobody picks up.', 880, { size: 50, maxW: 700, a: fadeIn(u - 1.3, .4), maxW: 620 });
  });
  // ============ 9. glean. + призыв (41.8–44.2)
  shot(41.8, DUR + .1, (t, u) => {
    E.globe = { rx: 0, rz: 0, off: [0, 0, 0] };
    E.cam = { p: [0, .1, lerp(5.6, 5.3, u / 2.4)], t: [0, -.4, 0], fov: 42, roll: 0 };
    E.P.room = [.4, .3, .25];
    const cp = E.prepare();
    world(t, cp, { snow: 1, light: 1, man: { x: -.1, aR: 2.5 + .3 * Math.sin(u * 8), smile: 1 } });
    A.room(E.ox, 'night', t);
    const v = E.vx; A.base(v, 'LILY · 2009');
    const P = E.projG([-.48, -.3, .82]); v.save(); v.translate(P.x, P.y); v.rotate(-.5); v.fillStyle = 'rgba(245,235,200,.85)'; v.fillRect(-90, -26, 180, 52); v.restore();
    v.save(); v.globalAlpha = fadeIn(u, .3); drawBoxText(v, 'glean.', 110, 40, 500, 150, { font: z => `900 ${z}px IB`, size: 110, min: 40, color: '#fff', lines: 1 }); v.restore();
    A.cap(v, "Who's waiting\non your shelf?", 1030, { size: 46, a: fadeIn(u - .2) });
  });

  window.renderFrame = function (t) {
    globalThis.__T = t;
    E.clearAll(); E.defaults(); E.globe = { rx: 0, rz: 0, off: [0, 0, 0] }; E.OUTOFF = [0, 0];
    const s = S.find(s => t >= s.a && t < s.b) || S[S.length - 1];
    s.fn(t, t - s.a);
    E.present(t);
  };
  window.SHOTS = S.map(s => [s.a, s.b]);
  window.ready = Promise.all([document.fonts.load('900 40px IB'), document.fonts.load('600 30px IS')]);
})();
