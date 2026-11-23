// DAY 214 — вагон электрички карандашом: окно с бегущим пейзажем (3 слоя параллакса), сиденья, столик, поручни.
// o: t — время (пейзаж), speed (0..1), weather: 'sun'|'rain'|'snow'|'leaves'|'night', col (0..1 — акварель мира), station (0..1 — платформа в окне)
(function () {
  const { lerp, clamp, cr, ell, rect, noise1, hash } = E;
  const P = E.PAL, pen = E.pen;
  const WX0 = 40, WX1 = 680, WY0 = 290, WY1 = 700;
  E.WIN = { WX0, WX1, WY0, WY1 };
  // пройденный путь поезда (интеграл скорости задаётся снаружи через o.dist)
  E.landscape = function (o) {
    const d = o.dist || 0, col = o.col || 0;
    const g = E.g; g.save(); g.beginPath(); g.rect(WX0, WY0, WX1 - WX0, WY1 - WY0); g.clip();
    const c = E.c; c.save(); c.beginPath(); c.rect(WX0, WY0, WX1 - WX0, WY1 - WY0); c.clip();
    // небо
    if (col > 0) E.wash(rect(WX0 - 10, WY0 - 10, WX1 - WX0 + 20, 260), o.weather === 'night' ? P.navy : P.sky, .5 * col, { seed: 51, grow: col, rough: 8 });
    if (o.weather === 'night') E.hatch(rect(WX0, WY0, WX1 - WX0, WY1 - WY0), { gap: 5, a: .35, ang: -.7, cross: true });
    // дальние холмы (медленно)
    const f = d * .08;
    const H1 = []; for (let x = WX0 - 20; x <= WX1 + 20; x += 18) H1.push([x, 470 + 30 * noise1((x + f) * .006) + 18 * noise1((x + f) * .017 + 4)]);
    pen(H1, { w: 1.6, a: .45, taper: false });
    if (col > 0) E.wash(H1.concat([[WX1 + 20, WY1], [WX0 - 20, WY1]]), P.green, .32 * col, { seed: 52, grow: col, rough: 4, layer: false });
    // солнце / луна
    if (o.weather === 'sun' || o.weather === 'leaves') { pen(ell(560, 370, 28, 28), { w: 1.8, a: .5 }); if (col > 0) E.blot(560, 370, 30, P.yellow, .7 * col, { seed: 53 }); }
    // средний план: деревья и домики (быстрее)
    const m = d * .35, step = 150;
    for (let i = Math.floor((WX0 - 200 + m) / step); i * step - m < WX1 + 200; i++) {
      const x = i * step - m + 40 * hash(i), y = 560, k = hash(i * 3.3);
      if (k < .55) { // дерево: ствол + крона облаком
        const r = 34 + 22 * hash(i * 7);
        const crown = []; for (let a = 0; a < 18; a++) { const t = a / 18 * 6.283; crown.push([x + Math.cos(t) * r * (1 + .15 * noise1(i + a)), y - 40 - r * .7 + Math.sin(t) * r * .8 * (1 + .15 * noise1(i * 2 + a))]); }
        crown.push(crown[0]);
        pen(crown, { w: 1.8, a: .55 }); pen([[x, y + 30], [x, y - 20]], { w: 2.4, a: .6 });
        E.hatch(crown, { gap: 8, a: .14, ang: -.8 });
        if (col > 0) E.wash(crown, o.weather === 'leaves' ? P.ochre : P.green, .5 * col, { seed: i, grow: col, rough: 4 });
      } else if (k < .8) { // домик
        const w = 70 + 30 * hash(i * 5), h = 60;
        pen([[x - w / 2, y + 30], [x - w / 2, y + 30 - h], [x, y - h - 10], [x + w / 2, y + 30 - h], [x + w / 2, y + 30]], { w: 1.8, a: .6 });
        pen(rect(x - 10, y - 4, 18, 22), { w: 1.4, a: .5 });
        if (col > 0) { E.wash([[x - w / 2, y + 30 - h], [x, y - h - 10], [x + w / 2, y + 30 - h]], P.red, .45 * col, { seed: i + 3, grow: col }); E.wash(rect(x - w / 2, y + 30 - h, w, h), P.ochre, .3 * col, { seed: i + 4, grow: col }); }
      }
    }
    // земля
    pen([[WX0, 600], [WX1, 598]], { w: 1.6, a: .5, taper: false });
    // платформа станции
    if (o.station > 0) {
      const sx = lerp(WX1 + 380, 340, E.eo(o.station));
      E.knock(rect(sx - 300, 330, 600, 330)); E.knockC(rect(sx - 300, 330, 600, 330));
      pen([[sx - 400, 600], [sx + 400, 600]], { w: 2.4, a: .7 }); pen([[sx - 400, 640], [sx + 400, 640]], { w: 1.6, a: .5 });
      pen([[sx - 120, 600], [sx - 120, 400]], { w: 2.2, a: .7 }); pen([[sx + 120, 600], [sx + 120, 400]], { w: 2.2, a: .7 });
      const sg = rect(sx - 150, 350, 300, 70); E.knock(sg); pen(sg, { w: 2.6, a: .85 });
      E.hand('ELM ST.', sx, 386, 46, 1, { w: 4.5 });
      E.hatch(rect(sx - 400, 600, 800, 40), { gap: 6, a: .2, ang: -.3 });
    }
    // столбы (быстро, размазаны)
    const n = d * 1.4, ps = 420;
    for (let i = Math.floor((WX0 - 60 + n) / ps); i * ps - n < WX1 + 60; i++) {
      const x = i * ps - n; pen([[x, WY0 - 10], [x + 4, WY1 + 10]], { w: 5, a: .5 }); pen([[x - 30, 340], [x + 30, 338]], { w: 2.4, a: .45 });
      if ((o.speed ?? 1) > .5) E.hatch(rect(x - 40, WY0, 40, WY1 - WY0), { gap: 6, a: .07, ang: 0 });
    }
    // провода
    pen(cr([[WX0, 330], [360, 352], [WX1, 330]]), { w: 1.2, a: .4, taper: false });
    // погода
    if (o.weather === 'rain') for (let i = 0; i < 60; i++) { const x = WX0 + hash(i) * (WX1 - WX0), y = WY0 + ((hash(i * 3) * 410 + E.T * 900) % 410); pen([[x, y], [x - 22, y + 10]], { w: 1.4, a: .4, taper: false }); }
    if (o.weather === 'snow') for (let i = 0; i < 70; i++) { const x = WX0 + ((hash(i) * 640 - E.T * 120 + 6400) % 640), y = WY0 + ((hash(i * 3) * 410 + E.T * 60) % 410); E.fillG(ell(x, y, 3.2, 3.2, 0, 6.3, 8), .55); }
    if (o.weather === 'leaves') for (let i = 0; i < 14; i++) { const x = WX0 + ((hash(i) * 640 - E.T * 260 + 6400) % 640), y = WY0 + ((hash(i * 3) * 410 + E.T * 80) % 410); pen(ell(x, y, 7, 3.5, 0, 6.3, 10, E.T * 3 + i), { w: 1.4, a: .6 }); if (col > 0) E.blot(x, y, 6, P.ochre, .7 * col); }
    g.restore(); c.restore();
  };

  E.carriage = function (o = {}) {
    const col = o.col || 0;
    // потолок, поручень, ручки
    pen([[0, 180], [720, 186]], { w: 2, a: .55 });
    pen([[0, 232], [720, 236]], { w: 3, a: .7 }); pen([[0, 242], [720, 246]], { w: 1.2, a: .4 });
    for (let i = 0; i < 4; i++) {
      const x = 90 + i * 180, sw = Math.sin(E.T * 2.2 + i) * .07 * (o.speed ?? 1);
      E.push(x, 238, 1, 1, sw); pen([[0, 0], [0, 40]], { w: 2, a: .6 }); pen(ell(0, 58, 16, 18), { w: 2.4, a: .7 }); E.pop();
    }
    // окно: рама с закруглениями
    E.landscape(o);
    const fr = cr([[WX0 + 20, WY0], [WX1 - 20, WY0], [WX1, WY0 + 20], [WX1, WY1 - 20], [WX1 - 20, WY1], [WX0 + 20, WY1], [WX0, WY1 - 20], [WX0, WY0 + 20]], 4, true);
    pen(fr, { w: 3.4, a: .85 });
    pen(cr([[WX0 - 14, WY0 - 4], [WX1 + 14, WY0 - 4]]), { w: 1.6, a: .5 });
    pen([[WX0 - 10, WY1 + 14], [WX1 + 10, WY1 + 14]], { w: 2.4, a: .7 });   // подоконник
    // блик на стекле
    pen([[WX0 + 60, WY0 + 40], [WX0 + 20 + 60, WY0 + 120]], { w: 2, a: .25 }); pen([[WX1 - 120, WY0 + 30], [WX1 - 60, WY0 + 140]], { w: 1.4, a: .2 });
    // стена под окном — лёгкая штриховка
    E.hatch(rect(0, WY1 + 16, 720, 1080 - WY1 - 16), { gap: 11, a: .1, ang: -.25 });
    if (col > 0) E.wash(rect(-10, WY1 + 16, 740, 380), P.ochre, .18 * col, { seed: 61, grow: col, rough: 8 });
    // пол
    pen([[0, 1086], [720, 1080]], { w: 2.4, a: .7 });
    for (let i = -3; i < 6; i++) pen([[360 + i * 70, 1084], [360 + i * 170, 1280]], { w: 1.2, a: .25 });
    if (col > 0) E.wash(rect(-10, 1084, 740, 200), P.brown, .22 * col, { seed: 62, grow: col, rough: 6 });
    // сиденья (спинки за героями)
    const seat = (x, f) => {
      const B = cr([[x, 560], [x + f * 90, 548], [x + f * 104, 600], [x + f * 100, 900], [x + f * 20, 912], [x - f * 4, 880]], 5, true);
      pen(B, { w: 3, a: .8 }); E.hatch(B, { gap: 7, a: .2, ang: f * .7 });
      const S = cr([[x - f * 4, 900], [x + f * 240, 892], [x + f * 250, 940], [x - f * 4, 950]], 3, true);
      pen(S, { w: 2.8, a: .8 }); E.hatch(S, { gap: 7, a: .16, ang: 0 });
      pen([[x + f * 40, 950], [x + f * 40, 1080]], { w: 3, a: .7 }); pen([[x + f * 210, 945], [x + f * 210, 1082]], { w: 2.4, a: .6 });
      if (col > 0) { E.wash(B, P.teal, .5 * col, { seed: 70 + x, grow: col }); E.wash(S, P.teal, .5 * col, { seed: 71 + x, grow: col }); }
    };
    if (o.seats !== false) { seat(36, 1); seat(684, -1); }
  };
  E.table = function (o = {}) {
    const T0 = cr([[270, 846], [450, 846], [462, 868], [258, 868]], 3, true);
    E.knock(T0); pen(T0, { w: 3, a: .85 }); pen([[360, 868], [360, 1080]], { w: 4, a: .75 }); pen([[320, 1080], [400, 1080]], { w: 3, a: .7 });
    if (o.col) E.wash(T0, P.brown, .45 * o.col, { seed: 81, grow: o.col });
  };
})();
