// DAY 214 — таймлайн. Каждый план — функция страницы; переходы — перелистывание (flip) или резкая склейка.
(function () {
  const { lerp, clamp, ss, eio, eo, back, seg, hash, noise1, cr, ell, rect } = E;
  const P = E.PAL;
  const DUR = 43.0;
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
    if (o.bookOnTable) E.blueBook(372, 838, 1, -.05);
    if (o.him !== false) E.himSit(190, 905, 1, Object.assign({ lx: 1, blink: blink(t, 1), book: 'up' }, o.him || {}));
    if (o.her !== false && o.her) E.herSit(o.her.x ?? 530, 905, 1, o.her.f ?? -1, Object.assign({ lx: .8, blink: blink(t, 2) }, o.her));
  }

  // ---------- ПЛАНЫ: [начало, конец, функция страницы(t, lt), переход-вход]
  const S = [];
  const add = (t0, t1, fn, flip = 0, ov) => S.push({ t0, t1, fn, flip, ov });

  // 1. ХУК — риффл (страницы переворачиваются сами в custom)
  const RIFF_T = [0, .42, .78, 1.06, 1.3, 1.5, 1.68, 1.84, 1.98, 2.1, 2.21, 2.31, 2.41, 2.51, 2.62, 2.74, 2.88, 3.04];
  add(0, 3.4, null, 0);
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
    const lb = [[190, 470], [530, 462], [534, 640], [194, 648]]; E.knockC(lb); E.pen(lb.concat([lb[0]]), { w: 2.4, a: .7 });
    E.hand('SKETCHES', 362, 530, 54, 1, { w: 4.5, a: .8 });
    E.hand('- L.', 440, 600, 40, 1, { w: 3.5, a: .7 });
  }, .3);
  const HP = [[24.3, 25.3, 3, { ly: 0 }], [25.3, 26.2, 40, { ly: .2 }], [26.2, 26.9, 97, { m: 1, lx: -1 }], [26.9, 27.2, 130], [27.2, 27.45, 158], [27.45, 27.7, 189], [27.7, 27.95, 206]];
  HP.forEach(([a, b, d, o], i) => add(a, b, (t) => himPainting(d, t, o || {}), i < 3 ? .28 : .18));
  // последняя страница: они двое (её рука) + подпись
  add(27.95, 29.6, (t, lt) => {
    E.pa = .55; E.cam(360, 770, 1.42);
    E.carriage({ dist: 4000, weather: 'sun', col: 1, speed: 1 }); E.table({ col: 1 });
    E.himSit(190, 905, 1, { book: 'up', lx: 1, hoodColor: 1 }); E.herSit(530, 905, 1, -1, { lx: .9, m: 1, coatColor: 1, blush: 1 });
    E.pa = 1;
  }, .22);
  // 8. он: улыбка, цвет затекает в его мир
  add(29.6, 31.9, (t, lt) => {
    E.cam(360, 660, 1 + lt * .015);
    const b = ss(.3, 1.6, lt);
    [[150, 300, P.yellow], [590, 420, P.sky], [130, 900, P.rose], [600, 980, P.ochre], [360, 200, P.sky]].forEach(([x, y, c], i) => E.blot(x, y, 40 + 200 * eo(seg(lt, .2 + i * .15, 1.6 + i * .15)), c, .32, { seed: i + 20 }));
    E.himFront(360, 720, 2.1, { lx: 0, ly: .4, m: lt > .5 ? 2 : 1, open: .2, blush: b, blink: blink(t, 6), browUp: .3, book: 0 });
  }, .3);
  // 9. DAY 215
  add(31.9, 34.0, (t, lt) => {
    const arrive = seg(t, 32.2, 33.4);
    wide(t, { col: .55 + .2 * lt / 2, weather: 'sun',
      her: { x: lerp(860, 530, eio(arrive)), stand: 1 - ss(33.3, 33.9, t), walk: arrive * 12, f: -1, lx: .9, m: 1, coatColor: .8 },
      him: { book: 'lap', lx: lerp(1, .9, arrive), hoodColor: .8, m: t > 33.5 ? 1 : 0, blink: blink(t, 7) } });
    E.cam(); E.hand('DAY 215', 360, 215, 70, seg(lt, .05, .9), { w: 6.5 });
  }, .32);
  add(34.0, 35.6, (t, lt) => {
    wide(t, { col: .8, z: 1.6, y: 760, her: { lx: .9, m: lt > .9 ? 2 : 1, coatColor: 1, browUp: ss(.6, 1, lt) },
      him: { book: 'show', from: 'lap', bk: ss(.05, .45, lt), bookText: 'HI.', textP: seg(lt, .5, 1.1), textSize: 62, lx: 1, hoodColor: 1, m: 1, blush: .6 } });
  });
  add(35.6, 36.9, (t, lt) => {
    E.cam(360, 660, 1 + lt * .02);
    E.blot(360, 640, 520, P.yellow, .18, { seed: 30 });
    E.herFront(360, 700, 2.1, { lx: -.9, m: 2, open: .5 + .3 * Math.abs(Math.sin(lt * 18)), blink: lt > .2 && lt < .9 ? 1 : 0, blush: 1, browUp: .4 });
  });
  add(36.9, DUR, (t, lt) => {
    const c = .8 + .2 * ss(0, 1.5, lt);
    wide(t, { col: c, z: 1.5 - .1 * eo(seg(lt, 0, 5)), y: 760, her: { lx: .9, m: lt % 2.2 > 1.1 ? 2 : 1, open: .2, coatColor: 1, blush: .7, tilt: -.07, blink: blink(t, 9) },
      him: { book: lt < .9 ? 'show' : 'lap', from: 'show', bk: ss(.9, 1.6, lt), bookText: 'HI.', lx: 1, hoodColor: 1, m: lt > 1.2 ? 2 : 1, open: .2, blush: .6, blink: blink(t, 8) } });
    // тёплый свет из окна
    E.blot(560, 420, 300, P.yellow, .2 * c, { seed: 44 });
  });

  // ---------- надписи поверх (стикеры)
  function overlays(T, o) {
    if (T < 3.4) {
      E.note(o, 360, 175, 470, 112, -.03, [['213 DAYS.', 62]], seg(T, 0, .5));
      E.note(o, 380, 290, 470, 112, .025, [['SAME TRAIN.', 62]], seg(T, 1.0, 1.5));
      E.note(o, 350, 405, 520, 112, -.02, [['NOT ONE WORD.', 62]], seg(T, 2.0, 2.5));
    }
    if (T > 9.75 && T < 10.7) E.note(o, 520, 1000, 330, 100, .06, [['ABORT.', 56]], seg(T, 9.75, 10.1));
    // её подписи на страницах (синие чернила, без бумажки)
    const ink = (s, x, y, sz, a, b, rot = -.03) => { if (T > a && T < b) E.hand(s, x, y, sz, seg(T, a + .05, a + .55), { ctx: o, color: '#24427e', w: sz * .09, rot }); };
    ink('DAY 3.', 360, 200, 46, 24.3, 25.3); ink('THE CURLY ONE.', 360, 265, 46, 24.4, 25.3);
    ink('DAY 40.', 360, 200, 46, 25.3, 26.2); ink('HIDING AGAIN.', 360, 265, 46, 25.4, 26.2);
    ink('DAY 97.', 360, 200, 46, 26.2, 26.9); ink('IS HE DRAWING ME?', 360, 265, 44, 26.25, 26.9);
    if (T > 27.95 && T < 29.6) {
      E.hand('DAY 214.', 360, 210, 50, seg(T, 28.0, 28.4), { ctx: o, color: '#24427e', w: 4.8, rot: -.03 });
      E.hand('HE NEVER SAYS HI.', 360, 285, 46, seg(T, 28.35, 28.9), { ctx: o, color: '#24427e', w: 4.4, rot: -.02 });
      E.hand('SO... HI.', 380, 1060, 70, seg(T, 28.9, 29.3), { ctx: o, color: '#24427e', w: 6.5, rot: -.04 });
    }
    if (T > 38.0) {
      E.note(o, 360, 1010, 600, 120, -.02, [["DON'T WAIT 214 DAYS.", 50]], seg(T, 38.0, 38.6));
      E.note(o, 360, 1150, 640, 160, .015, [['SOMEONE MAY BE', 48], ['DRAWING YOU TOO.', 48]], seg(T, 39.4, 40.2), { lh: 62 });
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
      if (k > 0) { E.page(1, () => { if (i + 1 < RIFF.length) herPortrait(RIFF[i + 1], T); else { E.rv = 0; wide(T); E.rv = undefined; } }); flip = eio(k); }
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
    const fade = ss(42.2, 43.0, T) * .92;
    E.compose(flip, fade);
  };
  window.grab = () => E.grab(); window.ready = true;
})();
