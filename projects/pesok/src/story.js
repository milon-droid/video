// ПЕСОК / «LATER» — планы. Каждый план: t0, t1, свет, переход в начале (kind, dur), draw(c, lt, T).
// Экран: действие выше y≈770 (пол), полоса текста 815+, реплики на y≈885 (безопасная зона TikTok).
(function () {
  const { lerp, clamp, ss, eio, eo, hash, noise1 } = E;
  const W = E.W, H = E.H;
  const L = E.LIGHT;
  const FLOOR_S = 770;
  const cam = (c, x, y, z = 1, r = 0) => { E.setCam(c, x, y, z, r); E.cam = { x, y, z, r }; };
  const camF = (c, x, floorW, z, fs = FLOOR_S) => cam(c, x, floorW - (fs - 640) / z, z);   // мировой пол → экранный FLOOR_S
  const cyF = (floorW, z, fs = FLOOR_S) => floorW - (fs - 640) / z;
  const scr = c => c.setTransform(1, 0, 0, 1, 0, 0);
  const K = (lt, a, b) => ss(a, b, lt);
  const TXT = 885;
  // ---------- реплики [t, t_end, text, who, size]
  const LINES = [
    [8.5, 10.75, 'Daddy, build a castle with me?', 'g', 52],
    [10.85, 12.6, 'Later.', 'm', 72],
    [14.4, 15.8, 'Can we go to the beach?', 'g', 52],
    [15.85, 17.5, 'Later, sweetie.', 'm', 60],
    [19.2, 20.45, 'Dad, look!', 'g', 64],
    [20.55, 21.7, 'Later.', 'm', 72],
    [23.3, 24.9, 'Beach this weekend?', 'm', 56],
    [25.0, 26.5, 'Later, Dad.', 't', 64],
    [27.9, 29.2, 'Bye, Dad!', 'w', 64],
    [40.5, 42.5, 'Grandpa, build a castle with me?', 'k', 52],
  ];
  E.LINES = LINES;
  function mouth(T, who) {
    const l = LINES.find(l => l[3] === who && T >= l[0] && T < l[0] + l[2].length * .05 + .25);
    if (!l) return 0; return clamp(.35 + .65 * Math.abs(Math.sin((T - l[0]) * 15 + hash(l[0]) * 3)) * (.6 + .4 * Math.sin((T - l[0]) * 5.3)));
  }
  function lines(c, T, from, to, y = TXT) {
    scr(c);
    for (const l of LINES) {
      if (l[0] < from || l[0] >= to || T < l[0]) continue;
      const dur = Math.max(.35, l[2].length * .045), p = clamp((T - l[0]) / dur);
      const fade = 1 - ss(l[1] - .25, l[1], T);   // песок засыпает борозду
      if (fade <= 0) continue;
      const sz = l[4], two = E.textPolys(l[2], 'scripts', sz).w > 560;
      if (two) {
        const ws = l[2].split(' '), half = Math.ceil(ws.length / 2), a = ws.slice(0, half).join(' '), b = ws.slice(half).join(' ');
        const la = a.length / (a.length + b.length);
        E.write(c, a, W / 2 - 20, y - sz * .5, sz, clamp(p / la), { a: fade, w: sz * .105 });
        E.write(c, b, W / 2 - 20, y + sz * .7, sz, clamp((p - la) / (1 - la)), { a: fade, w: sz * .105 });
      } else E.write(c, l[2], W / 2 - 20, y, sz, p, { a: fade, w: sz * .105 });
    }
  }
  // ---------- счётчик дней (одна функция на весь ролик)
  const DAYS = [[3.4, 18250], [7.4, 18248], [7.45, 16425], [13.4, 16420], [13.45, 15695], [17.6, 15690], [17.65, 14600], [22.8, 14596],
    [22.85, 12410], [27.0, 12406], [27.05, 10220], [31.2, 10218], [31.6, 10218], [35.0, 2920], [45, 2914], [52, 2912]];
  function days(T) {
    if (T <= DAYS[0][0]) return 29200;
    for (let i = 1; i < DAYS.length; i++) if (T < DAYS[i][0]) { const [a, va] = DAYS[i - 1], [b, vb] = DAYS[i]; const k = (T - a) / (b - a); return Math.round(lerp(va, vb, i === 13 ? eio(k) : k)); }
    return DAYS[DAYS.length - 1][1];
  }
  E.days = days;
  function counter(c, T, a = 1) {
    if (a <= .01) return; scr(c);
    const n = days(T).toLocaleString('en-US');
    E.hourglass(c, 70, 200, 60, days(T) / 29200, T, { a });
    E.write(c, n, 108, 192, 36, 1, { font: 'futural', align: 'l', mode: 'sand', a, w: 3.8 });
    E.write(c, 'days left', 108, 230, 24, 1, { font: 'futural', align: 'l', mode: 'sand', a: a * .85, w: 2.6 });
  }
  const wall = (c, a = .34) => { E.sand(c, a); c.fillRect(-600, -600, 2000, 2600); E.reset(c); };

  // ---------- общие декорации
  const deskScene = (c, lt, T, o = {}) => {
    wall(c, o.wall ?? .12);
    E.frame(c, 120, 540, 100, 80);
    E.window(c, 440, 300, 200, 250, { fr: 14, leaves: o.leaves, snow: o.snow, t: T });
    E.floor(c, 880, .62);
    E.chair(c, 252, 805, 1);
    E.desk(c, 380, 735, 300);
    E.laptop(c, 470, 735, -1, o.glow ?? 1, T);
    E.lamp(c, 660, 735, o.lamp ?? 0);
    E.hourglass(c, 590, 660, 150, o.level ?? days(T) / 29200, T);
  };
  const beach = (c, T, lt, o = {}) => {
    E.sand(c, .07); c.fillRect(-900, -1700, 2600, 2400); E.reset(c);
    E.sun(c, o.sunX ?? 590, o.sunY ?? 470, 50);
    E.gull(c, 170 + lt * 26, 380, 1, T); E.gull(c, 240 + lt * 30, 350, .7, T + 1.4);
    const wv = o.wave || 0;
    E.sea(c, 560, 650 + wv * 150, T, .34);
    E.sand(c, .2); c.fillRect(-900, 650 + wv * 150, 2600, 2000); E.reset(c);
    E.grains(c, 360, 900, 700, 200, 160, 4, .3, 1.6);
    if (wv > 0) { const pts = []; for (let x = -200; x <= 1000; x += 16) pts.push([x, 650 + wv * 150 + noise1(x * .03 + T * 2) * 7]); E.sline(c, pts, 5, .55); E.groove(c, pts.map(([x, y]) => [x, y - 6]), 3, .9, 0); }
  };
  // стоя на коленях: бедро вперёд-вниз, голень назад по земле (y — земля)
  const kneel = (P, ground) => { const Kd = E.KIND[P.kind], s = P.s || 1; return Object.assign(P, { sit: true, y: ground - Kd.leg * .5 * Math.cos(38 * Math.PI / 180) * s - Kd.wL * .4 * s, hip: [-50, -46], knee: [42, 46] }); };

  const S = [];
  const shot = (t0, t1, o) => S.push(Object.assign({ t0, t1 }, o));

  // 1. ХУК — песочные часы: камера отъезжает от струи, «1 GRAIN = 1 DAY»
  shot(0, 3.4, { light: L.warm, lamp: [.5, .36], draw(c, lt, T) {
    const out = eo(K(lt, 0, 1.0)), inn = eio(K(lt, 2.3, 3.4));
    const z = lerp(1.7, 1.0, out) + lt * .02 + inn * 2.2;
    cam(c, 360, lerp(lerp(470, 470, out), 640, inn), z, lerp(-.05, 0, out));
    wall(c, .05);
    const lvl = 1 - lt * .006, h = 640, top = 470 - h / 2, bot = h / 2 - (1 - lvl) * h * .4;
    E.hourglass(c, 360, 470, h, lvl, T * 1.4);
    E.grains(c, 360, 470 + bot - 10, 30, 10, 26, Math.floor(T * 24), .9, 2.2);   // прыгающие песчинки на горке
    scr(c); E.band(c, 815);
    E.write(c, '1 GRAIN = 1 DAY', W / 2 - 20, 880, 54, K(lt, 0, .7) * 1.15, { font: 'futural', w: 7.5 });
    E.write(c, 'OF YOUR LIFE', W / 2 - 20, 950, 42, (lt - .55) / .4, { font: 'futural', w: 5 });
  } });

  // 2. Её первый день — отец с младенцем у окна
  shot(3.4, 7.4, { light: L.gold, lamp: [.75, .3], tr: { kind: 'pour', dur: 1.2, seed: 2 }, draw(c, lt, T) {
    cam(c, 380 + lt * 4, 680 - lt * 4, 1.75 + lt * .06);
    wall(c, .1);
    E.window(c, 560, 300, 240, 440, { fr: 16 });
    E.clear(c, 470, 500, 200, .7);
    E.floor(c, 880, .6);
    E.grains(c, 520, 520, 170, 200, 30, Math.floor(T * 2), .45, 2);
    const rock = Math.sin(lt * 2.0);   // папа покачивает
    const R0 = E.person(c, { kind: 'man', x: 330, y: 880, s: 1, f: 1, t: T, lean: 5 + rock * 1.5, head: 34 + rock * 2, sh: [30 + rock * 3, 48 + rock * 3], el: [62, 50],
      blink: E.blink(T, 1), brow: .7, mouth: Math.sin(lt * 1.7) > .7 ? .35 : 0 });
    const [n1x, n1y] = R0.hands[0], [n2x, n2y] = R0.hands[1];
    // свёрток лежит на обоих предплечьях, головка — в ладони дальней руки
    const bx = 330 + (n1x + n2x) / 2 - 30, by = 880 + Math.min(n1y, n2y) - 15, hx2 = 330 + n2x + 6, hy2 = 880 + n2y - 18;
    c.save(); E.sand(c, 1);
    c.beginPath(); c.ellipse(bx, by, 44, 18, Math.atan2(hy2 - by, hx2 - bx) * .5, 0, 7); c.fill();       // одеяльце
    c.beginPath(); c.arc(hx2 + 4, hy2 - 2, 19, 0, 7); c.fill();                                          // головка
       // носик вверх
        const hr = Math.sin(T * 3.1) * .5 + .5;                                                             // ручка тянется к папе
    c.lineWidth = 5; c.lineCap = 'round'; E.path(c, [[bx + 14, by - 12], [bx + 20, by - 26 - hr * 8], [bx + 26 + hr * 4, by - 36 - hr * 10]]); c.stroke();
    c.beginPath(); c.arc(bx + 27 + hr * 4, by - 38 - hr * 10, 4, 0, 7); c.fill();
    E.carve(c, .9); c.lineWidth = 2;
    c.lineWidth = 3; c.beginPath(); c.arc(hx2 + 4, hy2 - 2, 22, 1.7, 4.3); c.stroke();                   // край пелёнки у головки
    c.lineWidth = 2; c.beginPath(); c.moveTo(bx - 34, by + 4); c.quadraticCurveTo(bx, by - 8, bx + 22, by + 8); c.stroke();   // складка одеяльца
    c.beginPath(); c.arc(hx2 + 9, hy2 - 6, 3.4, .3, 2.8); c.stroke();                                   // спящий глазик
    c.restore(); E.reset(c);
    E.sand(c, 1); c.beginPath(); c.arc(330 + n1x, 880 + n1y - 4, 7, 0, 7); c.fill(); E.reset(c);       // кисть под одеяльцем
    counter(c, T, K(lt, .6, 1.2));
    scr(c); E.band(c, 815);
    E.write(c, 'Her first day.', W / 2, TXT, 60, (lt - 1.0) / .7, { w: 6 });
  } });

  // 3. Кабинет: «Daddy, build a castle with me?» — «Later.» → крупно её лицо
  shot(7.4, 13.4, { light: L.warm, lamp: [.42, .38], tr: { kind: 'sweep', dur: 1.1, ang: 0, seed: 3 }, draw(c, lt, T) {
    const cu = eio(K(lt, 4.35, 5.0)), z0 = 1.32 + lt * .02, z = lerp(z0, 3.1, cu);
    cam(c, lerp(330, 180, cu), lerp(cyF(880, z0), 752, cu), lerp(z0, 2.8, cu));
    deskScene(c, lt, T, {});
    const typ = Math.sin(T * 18) * 6, gest = K(lt, 3.45, 3.75) - K(lt, 4.6, 5.0);
    E.person(c, { kind: 'man', x: 290, y: 805, sit: true, s: 1, f: 1, t: T, lean: 14, head: 6, hip: [0, 4], knee: [0, 10],
      sh: [lerp(60 + typ, 150, gest), 55 - typ], el: [lerp(38, 30, gest), 40], blink: E.blink(T, 2), mouth: mouth(T, 'm'), brow: 0 });
    const wx = lerp(-80, 168, eo(K(lt, 0, 1.25))), walking = lt < 1.25;
    const wk = E.walk((wx + 80) / 46, walking ? 1 : 0);
    const tug = K(lt, 1.15, 1.4) * (1 - K(lt, 3.5, 3.8)), tugW = Math.sin(T * 13) * 7 * tug * (lt < 3.2 ? 1 : 0);
    const sad = K(lt, 3.6, 4.2), drop = K(lt, 4.0, 4.5);
    E.person(c, { kind: 'girl5', x: wx, y: 880, s: 1, f: 1, t: T, ...wk, dress: true, tail: Math.sin(T * 6) * .3 + (walking ? .4 : 0),
      sh: [lerp(wk.sh[0], 128 + tugW, tug), lerp(walking ? wk.sh[1] : 6, 2, drop)], el: [lerp(wk.el[0], 12, tug), lerp(8, 0, drop)],
      head: lerp(-14, 20, sad), blink: E.blink(T, 7), mouth: mouth(T, 'g'), brow: lerp(.5, -1, sad), lean: lerp(0, 6, sad), eye: 1.15,
      hold: [null, drop < .9 ? (c, x, y) => E.bucket(c, x - 2, y - 4, .9, 0) : null] });
    if (drop >= .9) E.bucket(c, 194, 838, .9, 0);   // ведёрко осталось на полу — оно пролежит здесь 40 лет
    E.shovel(c, 214, 846, .9, 1.2);
    counter(c, T, 1 - cu);
    scr(c); E.band(c, 815); lines(c, T, 8, 13);
  } });

  // 4. Дождь в окне: «Can we go to the beach?» — «Later, sweetie.»
  shot(13.4, 17.6, { light: L.cold, lamp: [.5, .36], tr: { kind: 'sweep', dur: 1.1, ang: Math.PI, seed: 4 }, draw(c, lt, T) {
    camF(c, 370 - lt * 6, 860, 1.16 + lt * .025);
    wall(c, .3);
    E.carve(c, 1); c.fillRect(110, 280, 500, 470); E.reset(c);
    E.window(c, 110, 280, 500, 470, { fr: 22, rain: true, t: T });
    E.rect(c, 70, 750, 580, 34, 1);   // подоконник
    E.floor(c, 860, .7);
    const look = K(lt, 2.4, 3.0);
    E.person(c, { kind: 'girl5', x: 240, y: 752, sit: true, s: 1.05, f: 1, t: T, lean: -2, head: lerp(4, -16, look), dress: true, tail: Math.sin(T * 2) * .1,
      sh: [40, 70], el: [40, 50], hip: [-6, 0], knee: [0, 14], blink: E.blink(T, 3), mouth: mouth(T, 'g'), brow: lerp(.4, -.9, look), eye: 1.15 });
    E.bucket(c, 410, 712, .85, 0);
    const px = 470 + Math.sin(lt * 1.4) * 40, pv = Math.cos(lt * 1.4), talk = mouth(T, 'm') || (lt < .7 || lt > 3.6 ? Math.abs(Math.sin(T * 11)) * .5 : 0);
    const wk = E.walk(px / 40, Math.abs(pv) * .7);
    E.person(c, { kind: 'man', x: px, y: 860, s: .94, f: pv > 0 ? 1 : -1, t: T, a: .8, head: 4, ...wk, sh: [160, wk.sh[1]], el: [40, 14],
      blink: E.blink(T, 4), mouth: talk, carveA: .7, hold: [(c, x, y) => E.phone(c, x, y + 6, .3), null] });
    counter(c, T);
    scr(c); E.band(c, 815); lines(c, T, 14, 17.6);
  } });

  // 5. Пляж: замок одна, папа с ноутбуком — «Dad, look!» — «Later.» — волна смывает замок
  shot(17.6, 22.8, { light: L.warm, lamp: [.5, .48], tr: { kind: 'iris', dur: 1.0, x: 560, y: 300, seed: 5 }, draw(c, lt, T) {
    camF(c, 360 + lt * 8, 880, 1.2 + lt * .02);
    const wv = K(lt, 3.6, 4.4) - K(lt, 4.6, 5.3) * .7;
    beach(c, T, lt, { wave: wv * 1.6 });
    E.umbrella(c, 100, 880, 1); E.lounger(c, 130, 880, 1);
    E.person(c, { kind: 'man', x: 104, y: 852, sit: true, s: .95, f: 1, t: T, lean: -42, head: 26, hip: [-4, 0], knee: [-80, -86], sh: [70 + Math.sin(T * 17) * 5, 64], el: [40, 46],
      blink: E.blink(T, 5), mouth: mouth(T, 'm'), hold: [(c, x, y) => E.laptop(c, x + 10, y + 4, -1, .9, T), null] });
    const washed = K(lt, 3.9, 4.8);
    E.castle(c, 440, 872, .9, K(lt, 0, 1.6), washed);
    const stand = K(lt, 4.2, 4.8), wave = K(lt, 1.55, 1.8) * (1 - K(lt, 2.85, 3.1));
    const G = { kind: 'girl10', x: 610, s: 1, f: -1, t: T, tail: Math.sin(T * 5) * .4, blink: E.blink(T, 6), mouth: mouth(T, 'g'), brow: lerp(.5, -1, washed), eye: 1.1 };
    if (stand < .5) { kneel(G, 880); Object.assign(G, { lean: 26 - wave * 20, head: lerp(12, -10, wave), sh: [lerp(80 + Math.sin(T * 8) * 22, 175 + Math.sin(T * 16) * 22, wave), 60], el: [lerp(30, 10, wave), 24] }); }
    else Object.assign(G, { y: 880, lean: 2, head: 14, sh: [10, 6], el: [6, 6] });
    E.person(c, G);
    E.bucket(c, 420, 840, .8, 0);
    counter(c, T);
    scr(c); E.band(c, 815); lines(c, T, 19, 22.8);
  } });

  // 6. Подросток: «Beach this weekend?» — «Later, Dad.» — дверь закрывается
  shot(22.8, 27.0, { light: L.dusk, lamp: [.62, .4], tr: { kind: 'sweep', dur: 1.1, ang: -Math.PI / 2, seed: 6 }, draw(c, lt, T) {
    const shut = eio(K(lt, 3.0, 3.3));
    camF(c, 390, 880, 1.32 + lt * .03 + shut * .05);
    wall(c, .36);
    E.carve(c, 1); c.fillRect(400, 380, 200, 500); E.reset(c);
    E.carve(c, .4 * (1 - shut)); c.beginPath(); c.moveTo(400, 880); c.lineTo(600, 880); c.lineTo(340, 1000); c.lineTo(-40, 1000); c.closePath(); c.fill(); E.reset(c);
    E.floor(c, 880, .62);
    E.frame(c, 170, 560, 90, 74);
    const ph = K(lt, 2.1, 2.45);
    E.person(c, { kind: 'teen', x: 480, y: 880, s: 1, f: -1, t: T, phones: true, sh: [lerp(10, 165, ph), lerp(6, 165, ph)], el: [lerp(10, 40, ph), lerp(6, 40, ph)],
      head: lerp(-4, 10, ph), tail: Math.sin(T * 3) * .2, blink: E.blink(T, 8), mouth: mouth(T, 't'), brow: -.2, lean: -2 });
    E.door(c, 400, 380, 200, 500, 1 - shut, 0);
    const hope = 1 - K(lt, 3.2, 3.9);
    E.person(c, { kind: 'man', x: 230, y: 880, s: 1.02, f: 1, t: T, sh: [40, 14], el: [50, 10], head: lerp(-6, 16, 1 - hope), blink: E.blink(T, 9), mouth: mouth(T, 'm'), brow: lerp(.6, -1, 1 - hope), lean: lerp(4, 10, 1 - hope),
      hold: [(c, x, y) => E.bucket(c, x - 4, y - 6, .9, 0), null] });
    counter(c, T);
    scr(c); E.band(c, 815); lines(c, T, 23, 27);
  } });

  // 7. Отъезд: «Bye, Dad!» — машина уезжает к горизонту
  shot(27.0, 31.2, { light: L.dusk, lamp: [.62, .5], tr: { kind: 'pour', dur: 1.2, seed: 7 }, draw(c, lt, T) {
    camF(c, 360 + lt * 6, 880, 1.22 + lt * .02);
    wall(c, .06);
    E.sun(c, 560, 760, 44);
    E.sand(c, .75); c.fillRect(-600, 880, 2000, 600); E.reset(c);
    E.tree(c, 650, 880, .6, T, .45); E.tree(c, 720, 880, .38, T, .3);
    E.house(c, -60, 880, 1); E.fence(c, 180, 230, 880, 1); E.fence(c, 300, 340, 880, 1);
    const go = eio(K(lt, 2.3, 4.2)), ds = lerp(1, .1, go);
    const cx = lerp(500, 600, go), cy = 880;
    const wave = K(lt, .7, .95) * (1 - K(lt, 1.75, 1.95)), walk = K(lt, 1.85, 2.25);
    const wx = lerp(380, 470, walk);
    if (lt < 2.3) E.person(c, { kind: 'woman', x: wx, y: 880, s: 1, f: walk > 0 ? 1 : -1, t: T, ...E.walk(wx / 42, walk > 0 && walk < 1 ? 1 : 0), tail: Math.sin(T * 4) * .3,
      blink: E.blink(T, 10), mouth: mouth(T, 'w'), head: -6, a: 1 - K(lt, 2.1, 2.3), sh: [lerp(10, 175 + Math.sin(T * 14) * 22, wave), 6], el: [lerp(10, 10, wave), 6],
      hold: [null, (c, x, y) => E.suitcase(c, x, y - 4, .8, 0)] });
    E.car(c, cx, cy, ds, lerp(1, .55, go), T * go * 3);
    if (go > .05 && go < .6) { const g = 1 - go / .6; c.save(); E.sand(c, g); c.lineWidth = 9 * ds; const hx = cx - 10 * ds, hy = cy - 92 * ds; E.path(c, [[hx, hy], [hx - 16 * ds + Math.sin(T * 14) * 8 * ds, hy - 46 * ds]]); c.stroke(); c.restore(); E.reset(c); }
    const low = K(lt, 3.2, 4.0), wv2 = K(lt, 2.35, 2.6);
    if (lt > 2.05 && lt < 2.6) E.grains(c, wx, 760, 30, 80, 60, Math.floor(T * 30), 1 - K(lt, 2.3, 2.6), 2);
    E.person(c, { kind: 'man', x: 260, y: 880, s: 1, f: 1, t: T, sh: [lerp(lerp(20, 172 + Math.sin(T * 10) * 18, wv2), 10, low), 4], el: [lerp(14, 10, low), 6], head: lerp(-4, 12, low), brow: lerp(.3, -1, low),
      blink: E.blink(T, 11), lean: lerp(0, 6, low) });
    counter(c, T);
    scr(c); E.band(c, 815); lines(c, T, 27, 31.2);
  } });

  // 8. Годы летят: тот же кабинет, он сутулится и седеет, часы и счётчик несутся
  shot(31.2, 35.0, { light: L.cold, lamp: [.45, .38], tr: { kind: 'sweep', dur: 1.1, ang: .4, seed: 8 }, draw(c, lt, T) {
    const k = K(lt, .4, 3.4);
    camF(c, 360, 880, 1.22 + lt * .02);
    deskScene(c, lt, T, { leaves: k < .4 || k >= .78, snow: k >= .4 && k < .78, lamp: 1, level: days(T) / 29200 });
    const old = k > .55;
    if (Math.abs(k - .55) < .07) E.grains(c, 300, 640, 50, 50, 60, Math.floor(T * 30), .8, 2);
    E.person(c, { kind: old ? 'old' : 'man', x: 290, y: 805, sit: true, s: 1, f: 1, t: T, lean: 14 + k * 14, hunch: k, head: 6 + k * 8, hip: [0, 4], knee: [0, 10],
      sh: [60 + Math.sin(T * 18) * 6, 55 - Math.sin(T * 18) * 6], el: [38, 40], blink: E.blink(T, 2), brow: -k * .5 });
    E.bucket(c, 194, 838, .9, 0); E.shovel(c, 214, 846, .9, 1.2);
    for (let i = 0; i < 4; i++) { const ph = (lt * 1.3 + i * .25) % 1; c.save(); c.translate(150 + ph * 120, 600 - ph * 160 + ph * ph * 300); c.rotate(ph * 4 + i); E.sand(c, .8 * (1 - ph)); c.fillRect(-14, -18, 28, 36); c.restore(); }
    E.reset(c); E.rect(c, 136, 570, 36, 46, 1); E.carve(c, .9); c.fillRect(142, 582, 24, 3); E.reset(c);
    counter(c, T);
    scr(c); E.band(c, 815);
  } });

  // 9. Крупно: часы почти пусты; взгляд опускается на ведёрко под столом
  shot(35.0, 38.6, { light: L.cold, lamp: [.62, .42], tr: { kind: 'iris', dur: .9, x: 560, y: 520, seed: 9 }, draw(c, lt, T) {
    const dn = eio(K(lt, 2.2, 3.3));
    cam(c, lerp(455, 230, dn), lerp(650, 830, dn), lerp(1.75 + lt * .06, 2.8, dn));
    deskScene(c, lt, T, { lamp: 1, level: .1 - lt * .006, glow: .6 });
    const see = K(lt, .7, .95);
    E.person(c, { kind: 'old', x: 290, y: 805, sit: true, s: 1, f: 1, t: T, lean: 24 - see * 10, hunch: 1, head: lerp(-6, 34, dn), hip: [0, 4], knee: [0, 10],
      sh: [lerp(55, 30, see), 40], el: [lerp(40, 20, see), 40], blink: lt > .7 && lt < 2 ? 0 : E.blink(T, 12), eye: 1 + see * .45, brow: see * .9 - dn * 1.4 });
    E.bucket(c, 194, 838, .9, 0); E.shovel(c, 214, 846, .9, 1.2);
    E.grains(c, 196, 850, 22, 8, 16, 3, .45, 1.4);   // пыль на ведёрке
    counter(c, T, 1 - dn);
    scr(c); E.band(c, 815);
  } });

  // 10. Звонок в дверь: дочь и внучка — «Grandpa, build a castle with me?»
  shot(38.6, 42.6, { light: L.dusk, lamp: [.7, .42], tr: { kind: 'sweep', dur: 1.0, ang: 0, seed: 10 }, draw(c, lt, T) {
    const op = eio(K(lt, 1.25, 1.8));
    camF(c, 420 + lt * 5, 880, 1.3 + lt * .03);
    wall(c, .36);
    E.frame(c, 170, 560, 90, 74);
    E.carve(c, op); c.fillRect(430, 360, 220, 520); E.reset(c);
    E.carve(c, .5 * op); c.beginPath(); c.moveTo(430, 880); c.lineTo(650, 880); c.lineTo(440, 1000); c.lineTo(-60, 1000); c.closePath(); c.fill(); E.reset(c);
    E.floor(c, 880, .62);
    if (op > .02) {
      E.person(c, { kind: 'woman', x: 600, y: 880, s: 1, f: -1, t: T, sh: [20, 40], el: [20, 50], blink: E.blink(T, 13), brow: .3, head: 8, tail: Math.sin(T * 3) * .2 });
      E.person(c, { kind: 'kid', x: 520, y: 880, s: 1, f: -1, t: T, dress: true, sh: [lerp(10, 140, K(lt, 2.0, 2.3)) + Math.sin(T * 8) * 8, 20], el: [20, 10], head: -16, eye: 1.15,
        blink: E.blink(T, 14), mouth: mouth(T, 'k'), brow: .6, tail: Math.sin(T * 6) * .5, hold: [null, (c, x, y) => E.shovel(c, x, y, .9, -.4)] });
    }
    E.door(c, 430, 360, 220, 520, op, 0);
    const wx = lerp(130, 340, eo(K(lt, 0, 1.25)));
    E.person(c, { kind: 'old', x: wx, y: 880, s: 1, f: 1, t: T, ...E.walk(wx / 40, lt < 1.25 ? .55 : 0), hunch: 1, lean: 10, head: lerp(0, -8, op), brow: lerp(0, .9, op), eye: 1 + op * .3,
      sh: [lt < 1.1 ? 14 : lerp(14, 80, K(lt, 1.0, 1.25)) - K(lt, 1.6, 2) * 66, 18], el: [20, 30], blink: E.blink(T, 15),
      hold: [null, (c, x, y) => E.bucket(c, x - 4, y - 6, .9, 0)] });
    counter(c, T);
    scr(c); E.band(c, 815); lines(c, T, 40, 42.6);
  } });

  // 11. Крупно: он улыбается — «Now.»
  shot(42.6, 45.2, { light: L.gold, lamp: [.62, .4], tr: { kind: 'iris', dur: .6, x: 420, y: 520, seed: 11 }, draw(c, lt, T) {
    cam(c, 310, 655, 3.0 + lt * .08);
    wall(c, .32);
    E.clear(c, 470, 600, 220, .95);
    E.person(c, { kind: 'old', x: 290, y: 880, s: 1, f: 1, t: T, hunch: .6, lean: 6, head: -4 - K(lt, .3, 1.0) * 8, brow: .6, blink: lt > .4 ? E.blink(T, 16) : 0,
      mouth: lt > 1.0 && lt < 1.45 ? .8 : 0, tear: K(lt, .2, 1.8), sh: [20, 20], el: [20, 20] });
    scr(c); E.band(c, 815);
    E.write(c, 'NOW.', W / 2, 900, 110, (lt - 1.0) / .4, { font: 'futural', w: 11 });
  } });

  // 12. Пляж, золото: строят вместе; отъезд — пляж внутри песочных часов; последняя песчинка — флажок
  const FLAG_T = 51.2;
  const finale = (c, lt, T, live) => {
    beach(c, T, lt, { sunX: 600, sunY: 470 });
    const g = live ? K(T, 45.6, 48.8) : 1;
    E.castle(c, 385, 872, 1, g, 0, ss(FLAG_T - .05, FLAG_T + .35, T));
    const flip = live ? K(T, 46.6, 47.1) - K(T, 47.3, 47.7) : 0;
    E.person(c, kneel({ kind: 'old', x: 240, s: 1, f: 1, t: T, lean: 22 + flip * 10, hunch: .6, sh: [lerp(70, 120, flip) + (live ? Math.sin(T * 5) * 6 : 0), 54], el: [30, 30],
      blink: live ? E.blink(T, 17) : 0, brow: .6, mouth: live && Math.sin(T * 2.1) > .7 ? .55 : 0, head: 8, carveA: live ? 1 : .8,
      hold: [(c, x, y) => E.bucket(c, x - 4, y - 4, .9, flip * 3), null] }, 880));
    E.person(c, kneel({ kind: 'kid', x: 525, s: 1, f: -1, t: T, lean: 24, sh: [80 + (live ? Math.sin(T * 7) * 22 : 0), 60], el: [30, 30], tail: Math.sin(T * 4) * .4,
      blink: live ? E.blink(T, 18) : 0, brow: .7, mouth: live && Math.sin(T * 2.3) > .6 ? .6 : 0, head: 6, hold: [(c, x, y) => E.shovel(c, x, y, .9, -.8 + (live ? Math.sin(T * 7) * .4 : 0)), null] }, 880));
    E.person(c, { kind: 'woman', x: 650, y: 846, sit: true, s: .9, f: -1, t: T, lean: -6, a: .8, hip: [0, 6], knee: [-40, -50], sh: [-30, 30], el: [30, 50], blink: E.blink(T, 19), brow: .4, head: 4, carveA: .7, tail: Math.sin(T * 2) * .2 });
  };
  const GL = { cx: 360, cy: -150, h: 2400 }, ZF = .56, CYF = 1050 - 160 / ZF;
  shot(45.2, 51.6, { light: L.gold, lamp: [.5, .5], tr: { kind: 'pour', dur: 1.2, seed: 12 }, draw(c, lt, T) {
    const pull = eio(K(T, 48.4, 50.6)), z0 = 1.22 + lt * .015;
    const z = lerp(z0, ZF, pull);
    cam(c, 360, lerp(cyF(880, z0), CYF, pull), z);
    const glass = E.giantGlass(c, GL.cx, GL.cy, GL.h, .05 * (1 - K(T, 49.6, FLAG_T - .5)), T, T < FLAG_T - .55 ? 745 : 0, ss(.05, .5, pull));
    c.save(); if (pull > .05) { glass(); c.clip(); }
    finale(c, lt, T, true);
    c.restore();
    if (T > FLAG_T - .6 && T < FLAG_T) { const k = (T - (FLAG_T - .6)) / .6; E.sand(c, 1); c.beginPath(); c.arc(385, lerp(-150, 745, k * k), 4.5, 0, 7); c.fill(); E.reset(c); }
    scr(c); E.band(c, 815);
    counter(c, T, 1 - K(T, 47.5, 48.4));
  } });

  // 13. Финальные слова
  shot(51.6, 57.0, { light: L.gold, lamp: [.5, .45], draw(c, lt, T) {
    cam(c, 360, CYF, ZF - lt * .004);
    const glass = E.giantGlass(c, GL.cx, GL.cy, GL.h, 0, T, 0, 1);
    c.save(); glass(); c.clip(); finale(c, lt, T, false); c.restore();
    scr(c); E.band(c, 815);
    E.write(c, "You can't stop the sand.", W / 2 - 20, 850, 44, (lt - .2) / 1.0, { w: 6 });
    E.write(c, 'But you can choose', W / 2 - 20, 912, 44, (lt - 1.7) / .6, { w: 6 });
    E.write(c, 'what it builds.', W / 2 - 20, 970, 44, (lt - 2.3) / .55, { w: 6 });
  } });

  window.DURATION = 57.0; window.SCENE = { duration: 57.0 };
  window.SHOTS = S.map(s => s.t0);
  window.renderFrame = function (T) {
    let i = S.findIndex(s => T >= s.t0 && T < s.t1); if (i < 0) i = S.length - 1;
    const s = S[i], p = S[i - 1], tr = s.tr;
    let k = 1;
    if (p && tr && T < s.t0 + tr.dur) k = clamp((T - s.t0) / tr.dur);
    if (k < 1) E.compose(c => p.draw(c, T - p.t0, T), c => s.draw(c, T - s.t0, T), k, tr.kind, tr);
    else E.compose(() => {}, c => s.draw(c, T - s.t0, T), 1);
    const lp = k < 1 ? E.mixLight(p.light, s.light, eio(k)) : s.light;
    const lx = k < 1 ? lerp(p.lamp[0], s.lamp[0], eio(k)) : s.lamp[0], ly = k < 1 ? lerp(p.lamp[1], s.lamp[1], eio(k)) : s.lamp[1];
    E.light = { a: lp.a, b: lp.b, x: lx + Math.sin(T * .7) * .01, y: ly, expo: Math.min(1, T / .2 + .4), dust: 1 };
    E.present(T);
  };
  window.grab = () => E.grab(); window.ready = true;
})();
