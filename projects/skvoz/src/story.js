// DAY 214 — таймлайн. Каждый план — функция страницы; переходы — перелистывание (flip) или резкая склейка.
(function () {
  const { lerp, clamp, ss, eio, eo, back, seg, hash, noise1, cr, ell, rect } = E;
  const P = E.PAL;
  const DUR = 65.6;
  window.DURATION = DUR; window.SCENE = { duration: DUR };

  // ---------- поезд: скорость и пройденный путь (одна функция для всех планов)
  const speed = t => t < 15.6 ? 1 : t < 17.2 ? 1 - eio(seg(t, 15.6, 17.2)) : t < 22.3 ? 0 : t < 24 ? eio(seg(t, 22.3, 24)) : 1;
  const DST = [0]; for (let i = 1; i <= DUR * 60 + 60; i++) DST.push(DST[i - 1] + speed(i / 60) * 300 / 60);
  const dist = t => DST[clamp(Math.round(t * 60), 0, DST.length - 1)];
  window.SPEED = speed;
  // моргание: раз в ~3 с, 0.13 с
  const blink = (t, s = 0) => { const per = 2.6 + hash(s) * 1.4, x = ((t + hash(s + 5) * 3) % per) / .13; return x < 1 ? Math.sin(x * Math.PI) : 0; };
  const rumble = t => [noise1(t * 9) * 1.6 * speed(t), noise1(t * 11 + 7) * 1.2 * speed(t)];
  const WIDE = (t, z = 1.42, y = 770) => { const r = rumble(t); E.cam(360 + r[0], y + r[1], z); };

  // ---------- её портреты для риффла (его рисунки: карандаш, цветной только шарф)
  const WEATHER = ['sun', 'rain', 'leaves', 'snow', 'night', 'sun', 'rain', 'snow', 'leaves', 'sun'];
  const RIFF = [1, 9, 23, 37, 52, 68, 81, 97, 110, 126, 140, 151, 167, 180, 193, 201, 207, 213];
  function herPortrait(day, t) {
    const k = hash(day * 1.7), wz = WEATHER[day % WEATHER.length];
    E.cam(505 + (k - .5) * 30, 700, 2.0);
    E.carriage({ dist: day * 997, weather: wz, speed: 1 });
    const pose = day % 4;
    E.herSit(530, 905, 1, -1, { lx: pose === 0 ? -.9 : .6, ly: pose === 2 ? .8 : 0, blink: pose === 3 ? 1 : 0, m: pose === 1 ? 1 : 0, holdBook: pose === 2 ? 1 : 0, tilt: pose === 3 ? .12 : 0 });
    E.hand('DAY ' + day, 590, 990, 30, 1, { w: 2.8, rot: -.04 });
  }
  // его портреты её рукой (акварель, мягкий карандаш)
  function himPainting(day, t, o = {}) {
    E.pa = .55;
    const wz = WEATHER[(day + 3) % WEATHER.length];
    E.cam(245, 720, 2.0);
    E.carriage({ dist: day * 613, weather: wz, col: 1, speed: 1 });
    E.himSit(190, 905, 1, { book: 'up', lx: 1, hoodColor: 1, blink: 0, ...o });
    E.pa = 1;
  }

  // ---------- план «вагон, общий»
  function wide(t, o = {}) {
    WIDE(t, o.z ?? 1.22, o.y ?? 800);
    E.carriage({ dist: dist(t), weather: o.weather || 'sun', col: o.col || 0, station: o.station || 0, speed: speed(t) });
    E.table({ col: o.col || 0 });
    if (o.bookOnTable) E.blueBook(o.bookX ?? 372, 838, 1, -.05);
    if (o.him !== false) E.himSit(190, 905, 1, Object.assign({ lx: 1, blink: blink(t, 1), book: 'up' }, o.him || {}));
    if (o.her !== false && o.her) E.herSit(o.her.x ?? 530, 905, 1, o.her.f ?? -1, Object.assign({ lx: .8, blink: blink(t, 2) }, o.her));
  }

  // ---------- ПЛАНЫ: [начало, конец, функция страницы(t, lt), переход-вход]
  const S = [];
  let SH = 0;   // сдвиг: план описан в своём «старом» времени, на таймлайне стоит позже
  const add = (t0, t1, fn, flip = 0) => { const X = SH; S.push({ t0: t0 + X, t1: t1 + X, fn: X ? (t, lt) => fn(t - X, lt) : fn, flip }); };

  // 1. ХУК — риффл (страницы переворачиваются сами в custom)
  const RIFF_T = [0, .42, .78, 1.06, 1.3, 1.5, 1.68, 1.84, 1.98, 2.1, 2.21, 2.31, 2.41, 2.51, 2.62, 2.74, 2.88, 3.04];
  add(0, 3.4, null, 0);

  // ===== DAY 1 — флешбэк: как он её впервые увидел и начал рисовать
  add(3.4, 5.6, (t, lt) => {
    const come = seg(t, 3.9, 4.9);
    WIDE(t, 1.42, 770);
    E.carriage({ dist: t * 300 + 9000, weather: 'leaves', speed: 1 }); E.table();
    E.himSit(190, 905, 1, { book: 'draw', lx: t < 4.7 ? .5 : 1, ly: t < 4.7 ? .9 : 0, blink: blink(t, 11), browUp: ss(4.7, 5.0, t) });
    E.wg = ss(4.2, 5.0, t);   // первый цвет в его мире появляется вместе с ней
    if (t > 3.9) E.herSit(lerp(880, 530, eio(come)), 905, 1, -1, { stand: 1 - ss(4.9, 5.5, t), walk: come * 12, lx: .9, ly: .3 });
    E.wg = 1;
    E.cam(); E.hand('DAY 1', 360, 215, 70, seg(lt, .1, .7), { w: 6.5 });
  }, 0);
  add(5.6, 6.8, (t, lt) => {
    E.cam(360, 660, 1 + lt * .04);
    const up = ss(.05, .35, lt);
    E.himFront(360, 720, 2.1, { lx: lerp(0, .9, up), ly: lerp(.9, -.1, up), browUp: up * .9, m: lt > .55 ? 3 : 0, open: .1, blink: lt > .75 && lt < .85 ? 1 : 0, blush: ss(.6, 1.1, lt) * .7, book: 0 });
  });
  // его страница: рука рисует её портрет, потом красным карандашом — шарф
  add(6.8, 9.9, (t, lt) => {
    E.cam(360, 640, 1);
    E.pen([[60, 120], [60, 1200]], { w: 1.2, a: .25 }); // поле страницы
    const k = seg(lt, .1, 1.95), red = seg(lt, 2.05, 2.8);
    const s0 = E.sidNow(); E.rv = s0 + 6 + Math.pow(k, 1.2) * 150; E.wg = red;
    E.herFront(360, 600, 1.8, { lx: -.6, m: 1, blink: 0 });
    E.rv = undefined; E.wg = 1;
    E.hand('DAY 1.', 160, 1040, 44, seg(lt, 2.85, 3.05), { w: 4, rot: -.05 });
    // рука идёт за линией
    const hx = red > 0 && red < 1 ? 360 + Math.sin(lt * 26) * 60 : 360 + Math.sin(lt * 7.3) * 120 + Math.sin(lt * 17) * 30, hy = red > 0 && red < 1 ? 880 + Math.cos(lt * 31) * 30 : lerp(380, 1000, k) + Math.cos(lt * 11) * 40;
    if (lt < 3.0) E.toolHand(hx, hy, red > 0 ? 'red' : 'pencil', .5);
  }, .25);
  // его скетчбук: дни
  const HIS = [
    [9.9, 11.3, 23, 'DAY 23.', 'SHE SLEEPS LIKE A CAT.', { blink: 1, m: 0 }],
    [11.3, 12.7, 52, 'DAY 52.', 'SHE LAUGHED. I ALMOST', { m: 2, open: .4, blink: 1, blush: .6 }, 'SAID HI.'],
    [12.7, 13.9, 97, 'DAY 97.', 'RAIN. SAME SCARF.', { lx: 1, ly: -.3 }]];
  HIS.forEach(([a, b, day, c1, c2, o, c3]) => add(a, b, (t, lt) => {
    E.cam(360, 640, 1 + lt * .02);
    E.pen([[60, 120], [60, 1200]], { w: 1.2, a: .25 });
    if (day === 97) for (let i = 0; i < 26; i++) { const x = 90 + hash(i) * 540, y = 160 + hash(i * 3) * 560; E.pen([[x, y], [x - 16, y + 40]], { w: 1.4, a: .4 }); }
    if (day === 23) { E.pen(cr([[590, 180], [610, 200], [598, 214]]), { w: 2, a: .6 }); E.hand('Z', 600, 240, 40, 1, { w: 3 }); E.hand('z', 560, 300, 30, 1, { w: 2.6 }); }
    E.push(360, 560, 1, 1, day === 23 ? .16 : 0);
    E.herFront(0, 0, 1.75, Object.assign({ lx: .7 }, o));
    E.pop();
    E.hand(c1, 200, 1010, 48, 1, { w: 4.4, rot: -.04 });
    E.hand(c2, 360, 1085, 40, 1, { w: 3.8, rot: -.02 });
    if (c3) E.hand(c3, 360, 1150, 40, 1, { w: 3.8, rot: -.02 });
  }, .25));
  add(13.9, 15.2, (t, lt) => {   // страница попыток «HI»: всё зачёркнуто
    E.cam(360, 640, 1 + lt * .03);
    E.pen([[60, 120], [60, 1200]], { w: 1.2, a: .25 });
    E.hand('DAY 160.', 220, 230, 52, 1, { w: 4.6, rot: -.04 });
    const L = ['HI.', 'HI, I AM MAX.', 'HEY!', 'NICE SCARF.', 'HI???', 'HELLO.', 'HI.'];
    L.forEach((w, i) => { const y = 360 + i * 105, x = 360 + (hash(i) - .5) * 120;
      E.hand(w, x, y, 50, 1, { w: 4.5, rot: (hash(i * 3) - .5) * .1 });
      const tw = E.textPolys(w, 50).w; E.pen(cr([[x - tw / 2 - 14, y - 6], [x, y - 12 + hash(i) * 10], [x + tw / 2 + 14, y - 4]]), { w: 4, a: .9, p: seg(lt, .1 + i * .1, .25 + i * .1) }); });
  }, .25);

  SH = 11.8;   // ===== настоящее: DAY 214 (план описан в старом времени 3.4–23.4)
  // 2. DAY 214 — вагон рисуется сам
  add(3.4, 7.0, (t, lt) => {
    E.rv = 6 + Math.pow(seg(lt, .1, 2.3), 1.4) * 520; E.wg = ss(2.0, 2.8, lt); E.wa = 1;
    const z = 1.42 + lt * .02;
    wide(t, { z, her: { lx: .2 + .6 * ss(2.6, 3.0, lt) }, him: { book: 'up', lx: 1 } });
    E.rv = undefined; E.wg = 1;
    E.cam(); E.hand('DAY 214', 360, 215, 70, seg(lt, .15, 1.1), { w: 6.5 });
  }, 0);
  // 3. переглядка
  add(7.0, 8.4, (t, lt) => { E.cam(360, 660 - lt * 6, 1); E.himFront(360, 720, 2.1, { lx: .95, ly: -.1, book: .32, blink: blink(t, 3), browUp: .2 }); });
  add(8.4, 9.5, (t, lt) => {
    E.cam(360, 660, 1 + lt * .03);
    const lk = eio(seg(lt, .15, .45));
    E.herFront(360, 700, 2.1, { lx: lerp(.7, -.95, lk), ly: lerp(-.2, 0, lk), blink: lt > .7 && lt < .82 ? 1 : 0, m: lt > .55 ? 1 : 0, browUp: .15 * lk });
  });
  add(9.5, 10.7, (t, lt) => {
    E.cam(360, 660, 1);
    const up = lt < .12 ? .32 : lerp(.32, 1.08, back(seg(lt, .12, .32)));
    E.himFront(360, 720 + (lt > .12 ? 12 * eo(seg(lt, .12, .4)) : 0), 2.1, { lx: -.2, ly: 0, book: up, browUp: 1, sweat: ss(.3, .5, lt) });
    if (lt > .35) { E.pen([[600, 330], [585, 420]], { w: 6, a: .9, p: seg(lt, .35, .45) }); E.fillG(ell(582, 450, 6, 6), lt > .45 ? .9 : 0); }
  });
  // 4. репетиция в облачке: пишет — стирает
  const TRY = [['HI.', 10.95, 11.45, 11.7, 12.2], ['HEY... I, UM', 12.35, 13.0, 13.2, 13.75], ['NICE SCARF?', 13.9, 14.5, 14.7, 15.25]];
  add(10.7, 15.7, (t, lt) => {
    E.cam(360, 660, 1);
    const sigh = ss(15.2, 15.6, t);
    E.himFront(360, 900 + sigh * 30, 1.7, { lx: lerp(.6, -.3, ss(11.4, 12, t)), ly: -.7, book: .42 - sigh * .12, blink: blink(t, 4), browUp: .3, browTilt: .6, sweat: ss(14, 14.4, t) * .7 });
    E.cloud(360, 330, 520, 230, seg(lt, .05, .3), 420, 560);
    for (const [txt, a, b, c, d] of TRY) {
      if (t < a || t > d + .2) continue;
      E.hand(txt, 360, 340, txt.length > 6 ? 58 : 84, seg(t, a, b), { w: txt.length > 6 ? 5.5 : 7.5, j: 1.4 });
      if (t > c) { // ластик едет зигзагом, за ним белое
        const k = seg(t, c, d), ex = lerp(130, 600, k), ey = 340 + Math.sin(k * 40) * 28;
        E.erase([[100, 260], [ex + 20, 260], [ex + 20, 420], [100, 420]], .96, 6);
        if (k < 1) E.eraser(ex, ey - 40, .45 + Math.sin(k * 40) * .12);
        E.crumbs(ex, ey + 20, (k * 2) % 1, 8, Math.floor(k * 2) + a);
      }
    }
  });
  // 5. станция: она встаёт, он тянет блокнот — и замирает
  add(15.7, 19.6, (t, lt) => {
    const st = ss(16.7, 17.6, t), out = ss(17.7, 18.5, t);
    wide(t, {
      station: seg(t, 15.6, 17.2), z: 1.42 + out * .08, y: 770 - out * 10,
      her: { stand: st, holdBook: ss(17.0, 17.6, t), lx: st > .5 ? -.2 : .8, ly: st > .5 ? .6 : 0 },
      him: { book: t < 17.7 ? 'up' : 'out', from: 'up', bk: out, lx: 1, ly: lerp(0, -.6, st), m: t > 18.4 ? 3 : 0, browUp: out }
    });
  });
  // крупно: его рот «о», сердце стучит (зум пульсом)
  add(19.0, 19.9, (t, lt) => { const pulse = 1 + .025 * Math.max(0, Math.sin(lt * 14)) ; E.cam(360, 640, 1.05 * pulse); E.himFront(360, 720, 2.1, { lx: .2, ly: -.9, m: 3, open: .3, browUp: 1, sweat: 1, book: 0 }); });
  // 6. она кладёт свой блокнот и уходит
  add(19.9, 23.4, (t, lt) => {
    const give = ss(20.0, 20.9, t), go = seg(t, 21.5, 22.9);
    wide(t, {
      station: 1 - ss(22.3, 23.6, t) * 1, bookOnTable: give >= 1,
      her: { stand: 1, holdBook: give < 1 ? 1 : 0, give, x: 530 + eio(go) * 360, walk: go * 14, lx: go > 0 ? -1 : -.4, ly: go > 0 ? 0 : .7, m: t > 21 ? 1 : 0, f: go > .05 ? 1 : -1 },
      him: { book: 'down', lx: lerp(1, .6, give), ly: lerp(-.6, .5, ss(22.6, 23.2, t)), m: 3, browUp: .6 }
    });
  });
  // 7. её блокнот: обложка → страницы с ним (акварель)
  add(23.4, 24.3, (t, lt) => {
    E.cam(360, 640, 1);
    const Cv = [[96, 150], [636, 138], [648, 1150], [84, 1162]];
    E.wash(Cv, P.blue, .82, { seed: 7, rough: 3 }); E.wash(Cv, P.navy, .25, { seed: 8, rough: 6 });
    E.pen(Cv.concat([Cv[0]]), { w: 3, a: .8 }); E.pen([[86, 1172], [650, 1160]], { w: 1.6, a: .5 }); E.pen([[90, 1182], [652, 1170]], { w: 1.4, a: .4 });
    E.pen([[560, 140], [566, 1160]], { w: 5, a: .55 });   // резинка
    const lb = [[160, 460], [540, 452], [544, 650], [164, 658]]; E.knockC(lb); E.pen(lb.concat([lb[0]]), { w: 2.4, a: .7 });
    E.hand('SKETCHES', 352, 530, 44, 1, { w: 4.2, a: .85 });
    E.hand('- L.', 440, 605, 36, 1, { w: 3.4, a: .7 });
  }, .3);
  SH = 0;
  const HP = [[36.1, 37.4, 1, { book: 'draw', lx: .5, ly: .9 }], [37.4, 38.6, 40, { ly: .2 }], [38.6, 39.8, 61, { book: 'lap', blink: 1, m: 3, open: .2, sink: .4 }], [39.8, 40.9, 97, { m: 1, lx: -1 }],
    [40.9, 41.2, 130], [41.2, 41.45, 158], [41.45, 41.7, 189], [41.7, 42.0, 206]];
  HP.forEach(([a, b, d, o], i) => add(a, b, (t) => himPainting(d, t, o || {}), i < 4 ? .28 : .18));
  add(42.0, 44.0, (t, lt) => {
    E.pa = .55; E.cam(360, 770, 1.42);
    E.carriage({ dist: 4000, weather: 'sun', col: 1, speed: 1 }); E.table({ col: 1 });
    E.himSit(190, 905, 1, { book: 'up', lx: 1, hoodColor: 1 }); E.herSit(530, 905, 1, -1, { lx: .9, m: 1, coatColor: 1, blush: 1 });
    E.pa = 1;
  }, .22);
  SH = 14.4;   // ===== старые 29.6–36.9 → 44.0–51.3
  add(29.6, 31.9, (t, lt) => {
    E.cam(360, 660, 1 + lt * .015);
    const b = ss(.3, 1.6, lt);
    [[150, 300, P.yellow], [590, 420, P.sky], [130, 900, P.rose], [600, 980, P.ochre], [360, 200, P.sky]].forEach(([x, y, c], i) => E.blot(x, y, 40 + 200 * eo(seg(lt, .2 + i * .15, 1.6 + i * .15)), c, .32, { seed: i + 20 }));
    E.himFront(360, 720, 2.1, { lx: 0, ly: .4, m: lt > .5 ? 2 : 1, open: .2, blush: b, blink: blink(t, 6), browUp: .3, book: 0 });
  }, .3);
  add(31.9, 34.0, (t, lt) => {
    const arrive = seg(t, 32.2, 33.4);
    wide(t, { col: .55 + .2 * lt / 2, weather: 'sun',
      her: { x: lerp(860, 530, eio(arrive)), stand: 1 - ss(33.3, 33.9, t), walk: arrive * 12, f: -1, lx: .9, m: 1, coatColor: .8 },
      him: { book: 'lap', lx: lerp(1, .9, arrive), hoodColor: .8, m: t > 33.5 ? 1 : 0, blink: blink(t, 7) } });
    E.cam(); E.hand('DAY 215', 360, 215, 70, seg(lt, .05, .9), { w: 6.5 });
  }, .32);
  SH = 0;
  // ===== возвращает её скетчбук
  add(48.4, 49.9, (t, lt) => {
    const out = ss(.0, .45, lt), take = lt > .8;
    wide(t, { col: .78, z: 1.6, y: 760,
      her: { lx: .9, ly: take ? .4 : .2, m: 1, coatColor: 1, holdBook: take ? 1 : 0, blush: ss(.8, 1.3, lt) * .7, browUp: ss(.3, .6, lt) * .5 },
      him: take ? { book: 'lap', lx: 1, hoodColor: 1, m: 1, blush: .5 } : { book: 'out', from: 'lap', bk: out, bookBlue: true, lx: 1, ly: .2, hoodColor: 1, m: 1, blush: .4 } });
  });
  SH = 15.9;
  add(34.0, 35.6, (t, lt) => {
    wide(t, { col: .8, z: 1.6, y: 760, bookOnTable: true, bookX: 420, her: { lx: lt > 1.1 ? .5 : .9, ly: lt > 1.1 ? .7 : 0, m: 1, coatColor: 1, browUp: ss(.6, .9, lt) * .6, blush: ss(.9, 1.4, lt) },
      him: { book: 'show', from: 'lap', bk: ss(.05, .45, lt), bookText: 'HI.', textP: seg(lt, .5, 1.1), textSize: 40, lx: 1, hoodColor: 1, m: 1, blush: .6 } });
  });
  add(35.6, 36.9, (t, lt) => {
    E.cam(360, 660, 1 + lt * .02);
    E.blot(360, 640, 520, P.yellow, .18, { seed: 30 });
    // смущается: взгляд вниз, румянец растёт, робкая улыбка, глаза на него — и снова вниз
    const peek = ss(.55, .7, lt) * (1 - ss(.95, 1.1, lt));
    E.herFront(360, 700, 2.1, { lx: lerp(-.3, -.9, peek), ly: lerp(.9, 0, peek), lid: lerp(.5, .1, peek), m: lt > .3 ? 1 : 4, blink: lt > 1.18 && lt < 1.26 ? 1 : 0, blush: .5 + .5 * ss(0, .8, lt), browUp: .2, browTilt: .5 });
  });
  SH = 0;
  // ===== разговор в профиль (без субтитров): говорят по очереди, смущаются
  const talk = (t, a, b) => t > a && t < b ? Math.abs(Math.sin((t - a) * 11)) * (.6 + .4 * Math.abs(Math.sin((t - a) * 3.3))) : 0;
  add(52.8, 56.8, (t, lt) => {
    t -= 1.5;
    const hisT = talk(t, 51.5, 52.5) + talk(t, 53.8, 54.3), herT = talk(t, 52.6, 53.7);
    const shyHim = ss(52.5, 52.8, t) * (1 - ss(53.4, 53.7, t)), shyHer = ss(51.6, 51.9, t) * (1 - ss(52.4, 52.6, t)) + ss(54.4, 54.6, t) * (1 - ss(54.9, 55.1, t));
    wide(t, { col: .9, z: 1.75 + lt * .03, y: 700, bookOnTable: true, bookX: 420,
      her: { lx: lerp(.9, .4, shyHer), ly: lerp(0, .8, shyHer), lid: shyHer * .4, m: herT > .05 ? 0 : 1, talk: herT, coatColor: 1, blush: .6 + .4 * shyHer, blink: blink(t, 14), tilt: -.05 * shyHer + .03 * Math.sin(t * 2) },
      him: { book: 'lap', lx: lerp(1, .5, shyHim), ly: lerp(0, .7, shyHim), m: hisT > .05 ? 0 : 1, talk: hisT, hoodColor: 1, blush: .5 + .5 * shyHim, blink: blink(t, 15), tilt: .04 * Math.sin(t * 2.4) + .05 * shyHim } });
  });
  // ===== вместе: она пересела к нему (анфас, вдвоём), общий блокнот
  add(56.8, 59.6, (t, lt) => {
    E.cam(360, 680 - lt * 6, 1.02 + lt * .01);
    E.wash(rect(30, 160, 660, 520), P.sky, .45, { seed: 3, rough: 8 });
    E.blot(560, 300, 60, P.yellow, .7, { seed: 5 });
    E.wash([[30, 470], [200, 430], [420, 460], [690, 420], [690, 680], [30, 680]], P.green, .4, { seed: 4, rough: 6 });
    E.pen(cr([[30, 160], [690, 160], [690, 680], [30, 680], [30, 160]], 1), { w: 3, a: .8 });
    E.wash(rect(0, 700, 720, 600), P.teal, .3, { seed: 6, rough: 10 });
    const look = ss(.2, .5, lt) * (1 - ss(1.1, 1.4, lt)) + ss(2.3, 2.6, lt);
    E.herFront(470, 760, 1.35, { lx: lerp(-.3, -1, look), ly: lerp(.9, 0, look), lid: .2, m: 1, blush: .9, blink: blink(t, 12), turn: -.5 });
    E.himFront(250, 780, 1.35, { lx: lerp(.3, 1, look), ly: lerp(.9, 0, look), m: 1, blush: .9, blink: blink(t, 13) });
    const B = [[150, 1040], [570, 1040], [590, 1240], [130, 1240]];
    E.skBook(B, { off: [3, 5] }); E.pen([[360, 1040], [360, 1240]], { w: 1.6, a: .5 });
    // маленький рисунок появляется под карандашом, кисть подкрашивает
    const k = seg(lt, .15, 2.5), c = seg(lt, 1.3, 2.7);
    const tip = E.drawLive('mini', () => { E.himFront(275, 1110, .42, { lx: 1, m: 1 }); E.wg = c; E.herFront(445, 1108, .42, { lx: -1, m: 1, turn: -.4 }); E.wg = 1; }, k);
    E.blot(275, 1185, 50 * eo(c), P.ochre, .45, { seed: 71 });
    E._handCol = 1; if (k < 1 && tip) E.toolHand(tip[0], tip[1], 'pencil', -2.75, .5); else E.toolHand(250, 1200, 'pencil', -2.75, .5);
    E._handCol = 0; E.toolHand(445 + Math.cos(lt * 7) * 25, 1150 + Math.sin(lt * 9) * 12 + (c > 0 ? 0 : 40), 'brush', 2.7, .5);
  });
  // ===== общая страница: его карандаш + её кисть рисуют их двоих (как в v2)
  add(59.6, DUR, (t, lt) => {
    E.cam(360, 660, 1.05 - lt * .01);
    E.pen([[60, 120], [60, 1200]], { w: 1.2, a: .25 });
    const k = seg(lt, .1, 2.6), c = seg(lt, 1.4, 3.6);
    const s0 = E.sidNow(); E.rv = s0 + 6 + k * 260; E.wg = c;
    E.himFront(250, 640, 1.25, { lx: 1, m: 1, blush: c });
    E.herFront(470, 630, 1.25, { lx: -1, m: 1, blush: c, turn: -.4 });
    E.rv = undefined; E.wg = 1;
    E.blot(250, 870, 130 * eo(c), P.ochre, .5, { seed: 61 }); E.blot(360, 360, 260 * eo(seg(lt, 2, 4.5)), P.yellow, .25, { seed: 62 });
    E.hand('DAY 1.', 360, 1010, 62, seg(lt, 4.2, 4.8), { w: 5.5, rot: -.03 });
    if (lt < 4.1) E.toolHand(230 + Math.sin(lt * 8) * 70, 890 + Math.cos(lt * 13) * 40, 'pencil', -.45, .8);
    if (lt > 1.3 && lt < 4.0) E.toolHand(500 + Math.sin(lt * 5) * 70, 900 + Math.cos(lt * 4) * 50, 'brush', .5, .8);
    if (lt > 4.15 && lt < 4.9) E.toolHand(300 + seg(lt, 4.2, 4.8) * 140, 1015, 'pencil', -.45, .8);
  }, .3);

  // ---------- надписи поверх (стикеры)
  function overlays(T, o) {
    if (T < 3.4) {
      E.note(o, 360, 175, 470, 112, -.03, [['213 DAYS.', 62]], seg(T, 0, .5));
      E.note(o, 380, 290, 470, 112, .025, [['SAME TRAIN.', 62]], seg(T, 1.0, 1.5));
      E.note(o, 350, 405, 520, 112, -.02, [['NOT ONE WORD.', 62]], seg(T, 2.0, 2.5));
    }
    if (T > 5.7 && T < 9.9) E.note(o, 360, 175, 560, 104, -.02, [["HE COULDN'T SAY HI...", 46]], seg(T, 5.7, 6.2));
    if (T > 7.3 && T < 9.9) E.note(o, 380, 285, 470, 104, .02, [['SO HE DREW HER.', 48]], seg(T, 7.3, 7.8));
    if (T > 8.9 && T < 9.9) E.note(o, 520, 1150, 330, 96, -.04, [['IN RED. ONLY HER.', 30]], seg(T, 8.9, 9.3));
    if (T > 21.55 && T < 22.5) E.note(o, 520, 1000, 300, 100, .06, [['NOPE!', 60]], seg(T, 21.55, 21.9));
    const ink = (s, x, y, sz, a, b, rot = -.03) => { if (T > a && T < b) E.hand(s, x, y, sz, seg(T, a + .05, a + .55), { ctx: o, color: '#24427e', w: sz * .09, rot }); };
    ink('DAY 1.', 360, 200, 48, 36.1, 37.4); ink('NEW BOY. ALWAYS DRAWING.', 360, 265, 34, 36.2, 37.4);
    ink('DAY 40.', 360, 200, 48, 37.4, 38.6); ink('HIDING AGAIN.', 360, 265, 46, 37.5, 38.6);
    ink('DAY 61.', 360, 200, 48, 38.6, 39.8); ink('FELL ASLEEP. CUTE.', 360, 265, 46, 38.7, 39.8);
    ink('DAY 97.', 360, 200, 48, 39.8, 40.9); ink('IS HE DRAWING ME?', 360, 265, 44, 39.85, 40.9);
    if (T > 42.0 && T < 44.0) {
      E.hand('DAY 214.', 360, 210, 50, seg(T, 42.05, 42.45), { ctx: o, color: '#24427e', w: 4.8, rot: -.03 });
      E.hand('HE NEVER SAYS HI.', 360, 285, 46, seg(T, 42.4, 42.95), { ctx: o, color: '#24427e', w: 4.4, rot: -.02 });
      E.hand('SO... HI.', 380, 1060, 70, seg(T, 42.95, 43.35), { ctx: o, color: '#24427e', w: 6.5, rot: -.04 });
    }
    if (T > 60.2) {
      E.note(o, 360, 175, 560, 110, -.02, [["DON'T WAIT 7 MONTHS", 48]], seg(T, 60.2, 60.8));
      E.note(o, 370, 295, 620, 110, .015, [['TO REGRET IT FOR 70 YEARS.', 33]], seg(T, 61.6, 62.3));
    }
  }

  // ---------- рендер
  window.renderFrame = function (T) {
    E.T = T; E.boil = Math.floor(T * 12);
    E.pa = 1; E.wa = 1; E.wg = 1; E.rv = undefined;
    let flip = 0;
    if (T < 3.4) {
      // риффл: текущая страница RIFF[i] переворачивается, под ней RIFF[i+1]
      let i = 0; while (i < RIFF_T.length - 1 && T >= RIFF_T[i + 1]) i++;
      const a = RIFF_T[i], b = RIFF_T[i + 1] ?? 3.4, dur = b - a, fd = Math.min(.16, dur * .9);
      const k = clamp((T - (b - fd)) / fd);
      E.page(0, () => herPortrait(RIFF[i], T));
      if (k > 0) { E.page(1, () => { if (i + 1 < RIFF.length) herPortrait(RIFF[i + 1], T); else S[1].fn(3.4, 0); }); flip = eio(k); }
    } else {
      let si = S.length - 1; for (let j = 1; j < S.length; j++) if (T >= S[j].t0 && (j === S.length - 1 || T < S[j + 1].t0)) { si = j; break; }
      const s = S[si];
      const fk = s.flip ? clamp((T - s.t0) / s.flip) : 1;
      if (fk < 1 && si > 0) {
        const pr = S[si - 1];
        E.page(0, () => { if (pr.fn) pr.fn(s.t0 - .001, s.t0 - .001 - pr.t0); else herPortrait(RIFF[RIFF.length - 1], T); });
        E.page(1, () => { E.pa = 1; s.fn(T, T - s.t0); });
        flip = eio(fk);
      } else E.page(0, () => s.fn(T, T - s.t0));
    }
    E.overlay(o => overlays(T, o));
    const fade = ss(64.8, 65.6, T) * .92;
    E.compose(flip, fade);
  };
  window.grab = () => E.grab(); window.ready = true;
})();
