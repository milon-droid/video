// Сюжет «ГЛУБИНА»: 12 планов. Каждый план рисует буфер и возвращает параметры post().
(() => {
  const { ctx, W, H, C, lit, glow, beam, text, post, clear, clamp, lerp, inv, E, K, hash, noise1 } = PX;
  const { diver, fish, bulb } = CH;
  const AMBER = (x, y, r, k = 1) => ({ x, y, r, l: .12 * k, a: .75 * k });
  const shake = (t, t0, amp, dur = .5) => { const k = t - t0; if (k < 0 || k > dur) return [0, 0]; const f = (1 - k / dur) ** 2 * amp; return [noise1(t * 40) * f, noise1(t * 40 + 50) * f]; };
  const lampAng = (P, tilt = .12) => (P.dir > 0 ? 0 : Math.PI) + (P.rot || 0) + (P.dir > 0 ? tilt : -tilt) + (P.head || 0) * (P.dir || 1);
  const lampLight = (pt, ang, k, len = 60, r = 90) => ({ x: pt[0] + Math.cos(ang) * len, y: pt[1] + Math.sin(ang) * len, r, l: .55 * k, a: 0 });
  const fishAt = (tx, ty, F) => { const L = F.lure || { ang: -.2, len: 120 }; const bx = 30 + Math.cos(L.ang) * L.len, by = -70 + Math.sin(L.ang) * L.len + 50;
    return Object.assign(F, { x: tx - bx * F.s * (F.dir || 1), y: ty - by * F.s }); };
  const blinkAt = (t, list) => { for (const b of list) { const k = (t - b) / .16; if (k > 0 && k < 1) return Math.sin(k * Math.PI); } return 0; };
  const depthStr = d => { const n = Math.max(0, Math.round(d)); return n >= 1000 ? Math.floor(n / 1000) + ',' + String(n % 1000).padStart(3, '0') : String(n); };
  const MAXD = 10994; // глубина Бездны Челленджера

  const shots = [];
  const S = (dur, f) => shots.push({ dur, f });

  // 1. ХУК — трос лопается прядь за прядью
  S(2.55, t => {
    const snaps = [.25, .9, 2.0]; const left = 3 - snaps.filter(s => t >= s).length;
    const drop = Math.max(0, t - 2.0);
    const [sx, sy] = [0, 1, 2].map(i => shake(t, snaps[i], i === 2 ? 7 : 3, .35)).reduce((a, b) => [a[0] + b[0], a[1] + b[1]]);
    const z = 1 + t * .05;
    WD.water(.13, .02);
    WD.snow(0, -t * 8, 0, .35, [], 140, t);
    const P = { x: 120 + sx, y: 300 + sy + drop * drop * 900, s: 2.35 * z, dir: 1, amb: .8, fear: .8, mo: .6, lamp: 1, eye: .7, look: 0, pupil: .3,
      head: -.35 + Math.sin(t * 9) * .03, arms: [[2.85, .1], [2.75 + Math.sin(t * 14) * .05, .15]], legs: [[.25 + Math.sin(t * 3) * .15, .3], [-.2 - Math.sin(t * 3) * .1, .4]],
      hose: t * 3, blink: blinkAt(t, [1.1]) };
    const topY = P.y - 49 * P.s, snapY = 92 + sy;
    // трос: верх (остаётся) и низ (уходит с водолазом)
    const ax = 120 + sx + 3 * P.s;
    WD.cable(ax, -10, snapY, drop > 0 ? 0 : left, .5, t * .5);
    if (drop > 0) { WD.cable(ax + 2, -10, snapY - 30 - drop * 200, 2, .45, t); }
    WD.cable(ax, snapY + drop * drop * 900, topY + 6, drop > 0 ? 2 : left, .5, t * .5);
    snaps.forEach((s0, i) => WD.snapped(ax, snapY, i % 2 ? -1 : 1, t - s0, .55));
    snaps.forEach((s0, i) => WD.bubbles(ax, snapY, t - s0, 7, .6, i * 11, 8));
    const pts = (() => { const tmp = []; lit(c => { const r = diver(c, P); tmp.push(r); }, [{ x: ax, y: snapY + 40, r: 120, l: .25, a: 0 }]); return tmp[0]; })();
    beam(pts.lamp[0], pts.lamp[1], lampAng(P) - .25, 200, .22, .32);
    // текст
    text('CABLE STRANDS', 120, 54, 2, { l: .9 });
    const big = String(drop > 0 ? 0 : left); const pulse = snaps.some(s => t - s > 0 && t - s < .12);
    text(big, 120, 74, pulse ? 6 : 5, { l: 1, a: left <= 1 || drop > 0 ? 1 : 0 });
    return { flash: snaps.some(s => t - s > 0 && t - s < .05) ? .12 : 0 };
  });

  // 2. ПАДЕНИЕ — счётчик глубины несётся, медузы, стены каньона
  S(3.7, t => {
    const k = E.io(clamp(t / 3.6)), d = lerp(400, MAXD, k), v = 6 + Math.sin(k * Math.PI) * 26;
    WD.water(.05 * (1 - k) + .005, 0);
    const P = { x: 120 + Math.sin(t * 1.3) * 10, y: 240 + Math.sin(t * 2) * 6, s: 2.1, dir: 1, rot: t * 1.15 + Math.sin(t * 2.3) * .3, amb: .5, lamp: 1, eye: .6, pupil: .2,
      arms: [[2.2 + Math.sin(t * 9) * .6, .4], [2.6 + Math.sin(t * 8 + 1) * .5, .3]], legs: [[.6 + Math.sin(t * 7) * .4, .7], [-.3 + Math.sin(t * 6) * .4, .5]], hose: t * 8, blink: 0 };
    const ang = lampAng(P);
    // медузы пролетают вверх
    for (const [t0, x, r] of [[.3, 50, 9], [1.2, 196, 12], [1.9, 70, 6], [2.5, 180, 8]]) { const y = 520 - (t - t0) * 260 * (v / 20); if (y > -40 && y < 470) WD.jelly(x, y, r, t + x, .5); }
    // стены каньона в конце
    const wk = inv(2.5, 3.7, t);
    if (wk > 0) for (const side of [-1, 1]) {
      ctx.fillStyle = C(.06); ctx.beginPath(); const bx = side < 0 ? 0 : W; ctx.moveTo(bx, -10);
      for (let y = -10; y <= H + 10; y += 6) ctx.lineTo(bx - side * (wk * 60 + 14 + noise1(y * .05 + t * 30 * side) * 14 + hash(Math.floor(y / 6 + t * 50)) * 6), y);
      ctx.lineTo(bx, H + 10); ctx.fill();
    }
    WD.snow(0, t * 900 * (v / 20), -v * 1.3, .45, [lampLight([P.x, P.y - 60], ang, 1, 40, 100)], 190, t);
    const r = []; lit(c => r.push(diver(c, P)), [{ x: P.x + Math.cos(ang) * 50, y: P.y - 40, r: 90, l: .15 }]);
    beam(r[0].lamp[0], r[0].lamp[1], ang, 230, .26, .38);
    WD.bubbles(r[0].head[0], r[0].head[1], t, 6, .5, 3, 12);
    text('DEPTH', 110, 54, 2, { l: .85 });
    text(depthStr(d) + ' M', 110, 74, 3, { l: 1 });
    return { gain: 1 };
  });

  // 3. УДАР О ДНО — облако ила, надпись про Эверест
  S(3.0, t => {
    const ti = .32, base = 300;
    const [sx, sy] = shake(t, ti, 8, .6);
    ctx.save(); ctx.translate(sx, sy);
    WD.water(.02, 0);
    const fall = t < ti ? 1 - t / ti : 0;
    const up = E.io(inv(1.4, 2.6, t));
    const crouch = t < ti ? 0 : 1 - up;
    const P = { x: 120, y: base - 26 + crouch * 9 - fall * 360, s: 1.9, dir: 1, amb: .5, lamp: 1, eye: .5, pupil: .3, rot: fall * .8,
      legs: [[lerp(.1, 1.3, crouch), lerp(.1, 2.2, crouch)], [lerp(-.1, .9, crouch), lerp(.15, 2.0, crouch)]],
      arms: [[lerp(-.3, .6, crouch), lerp(-.4, -1.2, crouch)], [lerp(.4, 1.0, crouch), lerp(-.5, -1.4, crouch)]], head: lerp(.1, .45, crouch) - up * .25 + Math.sin(t * 2) * .05, hose: t * 2,
      blink: blinkAt(t, [1.0, 2.3]) };
    const ang = lampAng(P) + .25;
    const lampPt = [P.x + 15, P.y - 90];
    WD.seabed({ base, camX: 0, amb: .3, lights: [lampLight(lampPt, ang, 1, 80, 120), { x: 120, y: base, r: 70, l: .08 }] });
    WD.snow(0, -t * 4, 0, .25, [lampLight(lampPt, ang, 1, 60, 90)], 120, t);
    const r = []; lit(c => r.push(diver(c, P)), [{ x: 160, y: base - 40, r: 80, l: .15 }]);
    beam(r[0].lamp[0], r[0].lamp[1], ang, 210, .25, .35);
    // ил: главный взрыв + боковые клубы
    if (t > ti) {
      const k = t - ti, R = 70 * E.o(clamp(k / 1.4)), al = 1 - inv(1.2, 2.8, k) * .75;
      WD.silt(120, base + 2, R, .5, 0, 3, al);
      WD.silt(120 - k * 40, base - 6 - k * 8, R * .6, .42, 0, 7, al * .85);
      WD.silt(120 + k * 46, base - 4 - k * 7, R * .55, .45, 0, 9, al * .85);
    }
    ctx.restore();
    if (t > .7) text(depthStr(MAXD) + ' M', 110, 58, 3, { l: 1, chars: Math.floor((t - .7) * 30) });
    if (t > 1.25) { text('DEEPER THAN', 110, 92, 2, { l: .9, chars: Math.floor((t - 1.25) * 30) }); text('EVEREST IS TALL', 110, 110, 2, { l: .9, chars: Math.floor((t - 1.5) * 30) }); }
    return { flash: t > ti && t < ti + .06 ? .15 : 0 };
  });

  // 4. ФОНАРЬ УМИРАЕТ — мигание, темнота, сердце
  S(3.2, t => {
    const flick = [[0, 1], [.55, 1], [.62, .2], [.7, 1], [.95, .1], [1.0, .9], [1.3, .3], [1.36, .8], [1.62, 0], [1.75, .5], [1.8, 0], [2.05, .25], [2.1, 0]];
    let lamp = 0; for (const [a, v] of flick) if (t >= a) lamp = v;
    const z = 1 + t * .03;
    WD.water(.015, 0);
    const P = { x: 100, y: 330, s: 3.9 * z, dir: 1, amb: .15 + lamp * .35, lamp, eye: .15 + lamp * .55, pupil: lamp ? .3 : .9, head: Math.sin(t * 2) * .03 - .05,
      arms: [[-.2, -.6], t > .45 && t < 1.7 ? [2.75 + (Math.floor(t * 7) % 2) * .12, .5] : [.4, -.9]], legs: [[.15, .1], [-.1, .1]], hose: t, blink: blinkAt(t, [2.6]) };
    const ang = lampAng(P);
    WD.seabed({ base: 360, amb: .12 + lamp * .2, lights: [{ x: 210, y: 370, r: 140 * lamp, l: .45 * lamp }], far: false });
    WD.snow(0, 0, 0, .12 + lamp * .2, [lampLight([P.x + 40, P.y - 190], ang, lamp, 80, 120)], 120, t);
    const r = []; lit(c => r.push(diver(c, P)), [{ x: 180, y: 160, r: 160, l: .2 * lamp }]);
    beam(r[0].lamp[0], r[0].lamp[1], ang, 260, .25, .45 * lamp);
    if (t > 2.2) {
      const sec = 180 - Math.floor((t - 2.2) * 1.4);
      text('O2  ' + Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0'), 120, 60, 3, { l: .85, al: 1 });
      text('LAMP: DEAD', 120, 90, 2, { l: .6, a: 1 });
    }
    return { gain: 1 };
  });

  // 5. ОГОНЁК — отражение в стекле, затем вид глазами
  S(3.0, t => {
    if (t < 1.5) {
      const k = E.o(inv(.15, .9, t));
      WD.water(0, 0);
      const P = { x: 70, y: 590, s: 10.5, dir: 1, amb: .1 + k * .06, lamp: 0, eye: .15 + k * .5, eyeA: k * .9, pupil: .4 + k * .5, look: k * .6, head: .04,
        arms: [[.1, -.3], [.3, -.4]], legs: [[0, 0], [0, 0]], hose: t, blink: blinkAt(t, [1.05]) };
      const r = []; lit(c => r.push(diver(c, P)), [{ x: 230, y: 230, r: 160 * k, l: .06, a: .55 * k }]);
      const f = r[0].face; // отражение огонька на стекле
      const rx = f[0] + 24 + Math.sin(t * 2) * 3, ry = f[1] - 22;
      if (k > 0) { glow(rx, ry, 18 * k, .3 * k, .8 * k); ctx.fillStyle = C(1, k); ctx.fillRect(Math.round(rx), Math.round(ry), 2, 2); }
      return {};
    }
    const u = t - 1.5;
    WD.water(0, 0);
    const lx = 150 + Math.sin(u * 1.6) * 6, ly = 228 + Math.sin(u * 2.2) * 3;
    WD.seabed({ base: 300, amb: .05, lights: [AMBER(lx, ly + 60, 110, 1)], far: false });
    WD.snow(0, 0, 0, .05, [AMBER(lx, ly, 70, 1)], 160, t);
    // в темноте за огоньком — ничего (зритель пока не знает)
    bulb(ctx, lx, ly, 2.2, .9 + Math.sin(u * 7) * .1);
    return {};
  });

  // 6. ИДЁТ НА СВЕТ — трекинг сбоку, огонёк приближается; за ним угадывается силуэт
  S(3.8, t => {
    const camX = t * 34, base = 312, w = t * 5.4;
    const lx = 222 - t * 17, ly = 236 + Math.sin(t * 1.7) * 5;
    WD.water(0, 0);
    const F = fishAt(lx, ly, { s: .9, dir: -1, amb: .04, mouth: .55, eye: 0, sway: t * 1.7, lure: { ang: -.15, len: 115 } });
    const AL = [AMBER(lx, ly, 210, 1.5)];
    lit(c => fish(c, F), [AMBER(lx, ly, 90, .9)]);
    WD.seabed({ base, camX, amb: .05, lights: [AMBER(lx, ly + 70, 170, 1)], far: false });
    const P = { x: 92, y: base - 26, s: 2.4, dir: 1, amb: .05, lamp: 0, eye: .35, eyeA: .9, pupil: .8, walk: w, arms: [[-Math.sin(w) * .35, -.4], [Math.sin(w) * .35 + .2, -.5]], head: -.05, hose: t * 2 };
    lit(c => diver(c, P), AL);
    // пыль из-под ботинок на каждом шаге
    for (let i = 0; i < 25; i++) { const tc = (i * Math.PI + Math.PI / 2) / 5.4; const a = t - tc; if (a > 0 && a < 1.2) WD.silt(92 + (i % 2 ? 6 : -2) - a * 34 + 10, base - 2, 6 + a * 8, .06, .25, i, 1 - a / 1.2); }
    WD.snow(camX, 0, 0, .04, AL, 160, t);
    bulb(ctx, lx, ly, 2.4, 1);
    return {};
  });

  // 7. ОТКРОВЕНИЕ — камера отъезжает: огонёк висит перед гигантской пастью
  S(4.0, t => {
    const z = lerp(1.7, 1.0, E.io(inv(0, 3.4, t))), fx = 78, fy = 196; // точка фокуса (огонёк)
    const T = (x, y) => [(x - fx) * z + 120, (y - fy) * z + 205];
    WD.water(0, 0);
    const sway = t * 1.5;
    const Fw = fishAt(fx, fy, { s: .92, dir: -1, mouth: .85, eye: 0, sway, lure: { ang: -.05, len: 112 } });
    const swayDx = 0;
    const [Fx, Fy] = T(Fw.x, Fw.y);
    const F = Object.assign({}, Fw, { x: Fx, y: Fy, s: Fw.s * z, amb: .05 });
    const pre = []; // где сейчас приманка (с учётом качания)
    lit(c => pre.push(fish(c, F)), []);
    const b = pre[0].bulb;
    clear(0); WD.water(0, 0);
    const [gx, gy0] = T(0, 300);
    WD.seabed({ base: gy0, camX: 0, amb: .04, lights: [AMBER(b[0], b[1] + 80, 180 * z, 1)], far: false });
    lit(c => fish(c, Object.assign({}, F, { toothL: .2 + .25 * Math.max(0, Math.sin(t * 3)) })), [AMBER(b[0], b[1], 210 * z, 2.0)]);
    const reach = E.io(inv(1.5, 3.6, t));
    const [dx, dy] = T(36, 274);
    const P = { x: dx, y: dy, s: 1.15 * z, dir: 1, amb: .04, lamp: 0, eye: .4, eyeA: .9, pupil: .8, head: -.25 * reach,
      walk: t < 1.5 ? t * 5 : null, legs: t < 1.5 ? null : [[.2, .15], [-.15, .1]], arms: [[-.3, -.4], [lerp(.4, 2.2, reach), lerp(-.6, -.1, reach)]], hose: t };
    lit(c => diver(c, P), [AMBER(b[0], b[1], 90 * z, 1.1)]);
    WD.snow(0, 0, 0, .03, [AMBER(b[0], b[1], 100 * z, 1)], 160, t);
    bulb(ctx, b[0], b[1], 2.2 * z, 1);
    return {};
  });

  // 8. ГЛАЗ — рука у приманки, за ней открывается глаз; лицо водолаза
  S(2.6, t => {
    if (t < 1.5) {
      WD.water(0, 0);
      const bx = 96 + Math.sin(t * 1.4) * 3, by = 200;
      const eo = E.io(inv(.45, 1.2, t));
      // огромная голова: глаз в правой верхней части
      const F = { x: 272, y: 268, s: 3.2, dir: -1, amb: .05, mouth: .6, eye: eo, pupil: lerp(1, .85, eo), look: -.6, eyeA: .7, broken: true };
      lit(c => fish(c, F), [AMBER(bx, by, 220, 1.2)]);
      // рука водолаза входит снизу слева
      const reach = E.o(inv(0, 1.1, t)) * .9;
      // рука в перчатке тянется снизу слева к огоньку
      const hx = lerp(30, 78, reach), hy = lerp(330, 228, reach);
      lit(c => { c.lineCap = 'round';
        c.strokeStyle = C(.02); c.lineWidth = 34; c.beginPath(); c.moveTo(-20, 470); c.quadraticCurveTo(20, 330, hx, hy); c.stroke();
        c.strokeStyle = C(.15); c.lineWidth = 31; c.stroke();
        c.fillStyle = C(.02); c.beginPath(); c.arc(hx + 4, hy - 4, 19, 0, 7); c.fill(); c.fillStyle = C(.2); c.beginPath(); c.arc(hx + 4, hy - 4, 17, 0, 7); c.fill();
        for (let i = 0; i < 3; i++) { c.strokeStyle = C(.02); c.lineWidth = 9; c.beginPath(); c.moveTo(hx + 8, hy - 12 + i * 8); c.lineTo(hx + 22 - i * 2, hy - 18 + i * 7); c.stroke();
          c.strokeStyle = C(.22); c.lineWidth = 7; c.stroke(); }
      }, [AMBER(bx, by, 170, 1.4)]);
      // стебель удочки сверху
      ctx.strokeStyle = C(.03, .3); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(bx, by - 4); ctx.quadraticCurveTo(bx + 40, by - 120, 160, -10); ctx.stroke();
      WD.snow(0, 0, 0, .03, [AMBER(bx, by, 90, 1)], 120, t);
      bulb(ctx, bx, by, 6, 1);
      return {};
    }
    const u = t - 1.5;
    WD.water(0, 0);
    const k = E.o(clamp(u / .3));
    const P = { x: 70, y: 590 - u * 6, s: 10.5 + u * .8, dir: 1, amb: .1, lamp: 0, eye: .7, eyeA: .9, pupil: lerp(.9, .05, k), look: .6, head: .04, arms: [[.1, -.3], [.3, -.4]], legs: [[0, 0], [0, 0]] };
    const [sx, sy] = shake(t, 1.5, 3, .3); P.x += sx; P.y += sy;
    const r = []; lit(c => r.push(diver(c, P)), [AMBER(230, 230, 200, 1.1)]);
    return {};
  });

  // 9. ВСПЫШКА — удар по шлему, фонарь вспыхивает, рыба ослеплена
  S(2.4, t => {
    const on = t > .32 ? 1 : 0; const fl = on ? Math.max(0, 1 - (t - .32) * 2.2) : 0;
    const [sx, sy] = shake(t, .32, 7, .6);
    ctx.save(); ctx.translate(sx, sy);
    WD.water(on * .03, 0);
    const rec = E.o(inv(.35, 1.0, t));
    const F = { x: 236 + rec * 30, y: 210 - rec * 10, s: 1.25, dir: -1, rot: rec * -.12, amb: .05 + on * .55, mouth: t < .4 ? .6 : t < .55 ? .05 : lerp(.05, 1, E.o(inv(.55, .9, t))), eye: 1,
      pupil: on ? lerp(.9, .03, clamp((t - .32) * 6)) : .9, look: -.3, sway: t * 4, tail: t * 20, lure: { ang: -.1, len: 110 } };
    const fr = []; lit(c => fr.push(fish(c, F)), [{ x: 120, y: 200, r: 220, l: .5 * on }, AMBER(fr[0]?.bulb?.[0] || 90, 200, 80, 1)]);
    const P = { x: 52, y: 300, s: 2.7, dir: 1, amb: .08 + on * .3, lamp: on, eye: .3 + on * .5, pupil: .3, head: -.05,
      arms: [[-.3, -.5], t < .45 ? [lerp(.4, 2.8, E.o(clamp(t / .3))), .3] : [lerp(2.8, 1.3, E.o(inv(.45, .9, t))), -.4]], legs: [[.25, .2], [-.25, .2]], hose: t * 3 };
    const r = []; lit(c => r.push(diver(c, P)), [{ x: 120, y: 200, r: 120, l: .3 * on }]);
    beam(r[0].lamp[0], r[0].lamp[1], lampAng(P) - .05, 300, .3, .7 * on);
    if (fr[0].bulb) bulb(ctx, fr[0].bulb[0], fr[0].bulb[1], 2.6, 1);
    if (on) WD.bubbles(fr[0].mouth[0], fr[0].mouth[1], t - .55, 14, .8, 21, 40);
    ctx.restore();
    return { flash: fl * .38 };
  });

  // 10. ПОДЪЁМ — рыба в панике несётся вверх, водолаз висит на удочке
  S(4.4, t => {
    const k = E.io(clamp(t / 4.2)), d = lerp(MAXD, 0, k), sp = Math.sin(k * Math.PI);
    const lightTop = k * k;
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, C(.02 + lightTop * .55)); g.addColorStop(1, C(lightTop * .18)); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // лучи солнца ближе к поверхности
    if (lightTop > .05) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 6; i++) { const x0 = 20 + i * 42 + Math.sin(t + i) * 10;
      const gg = ctx.createLinearGradient(0, 0, 0, H); gg.addColorStop(0, C(.25 * lightTop)); gg.addColorStop(1, C(0)); ctx.fillStyle = gg;
      ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x0 + 14, 0); ctx.lineTo(x0 - 30, H); ctx.lineTo(x0 - 52, H); ctx.fill(); } ctx.restore(); }
    WD.snow(0, -t * 1400 * (.3 + sp), 18 + sp * 30, .4 + lightTop * .3, [], 200, t);
    const wob = Math.sin(t * 9) * .08;
    const F = { x: 130 + Math.sin(t * 3) * 6, y: 300, s: 1.05, dir: 1, rot: -Math.PI / 2 + wob, amb: .45 + lightTop * .5, mouth: .25 + Math.sin(t * 6) * .1, eye: .15, pupil: .05,
      tail: t * 28, lure: { ang: -.6, len: 100 }, sway: 0 };
    const fr = []; lit(c => fr.push(fish(c, F)), [{ x: 130, y: 120, r: 140, l: .4 }]);
    const b = fr[0].bulb;
    const P = { x: b[0] + 4, y: b[1] + 52, s: 1.7, dir: -1, rot: Math.sin(t * 5) * .15, amb: .3 + lightTop * .5, lamp: 1, eye: .6, pupil: .3, head: .4,
      arms: [[2.9, .1], [3.0, .05]], legs: [[.5 + Math.sin(t * 13) * .5, .6], [-.3 + Math.sin(t * 11 + 2) * .5, .5]], hose: t * 12 };
    lit(c => diver(c, P), [{ x: b[0], y: b[1] + 30, r: 80, l: .2 }]);
    // фонарь водолаза светит вниз — в морду рыбе
    beam(b[0] + 6, b[1] + 6, Math.PI / 2 + .2, 160, .3, .35);
    bulb(ctx, b[0], b[1], 2.4, 1);
    text('DEPTH', 110, 54, 2, { l: .85 });
    text(depthStr(d) + ' M', 110, 74, 3, { l: 1 });
    return { pal: y => k * k * .65 + (1 - y / H) * k * .2 };
  });

  // кадр «над/под водой»: линия воды wl
  function overUnder(t, wl, sunK = 1) {
    // небо
    const g = ctx.createLinearGradient(0, 0, 0, wl); g.addColorStop(0, C(.62)); g.addColorStop(1, C(.82)); ctx.fillStyle = g; ctx.fillRect(0, 0, W, wl);
    glow(190, wl - 120, 70, .5); ctx.fillStyle = C(1); ctx.beginPath(); ctx.arc(190, wl - 120, 13, 0, 7); ctx.fill();
    for (let i = 0; i < 4; i++) { const cx = ((i * 83 + t * 6) % 320) - 40, cy = wl - 150 + i * 22; ctx.fillStyle = C(.95); for (let j = 0; j < 4; j++) { ctx.beginPath(); ctx.ellipse(cx + j * 9, cy - (j % 2) * 4, 10, 5, 0, 0, 7); ctx.fill(); } }
    // дальние волны
    ctx.fillStyle = C(.5); ctx.beginPath(); ctx.moveTo(0, wl);
    for (let x = 0; x <= W; x += 3) ctx.lineTo(x, wl - 3 - Math.sin(x * .09 + t * 2) * 2 - Math.sin(x * .03 - t) * 2); ctx.lineTo(W, wl); ctx.fill();
    // под водой
    const g2 = ctx.createLinearGradient(0, wl, 0, H); g2.addColorStop(0, C(.62)); g2.addColorStop(.35, C(.25)); g2.addColorStop(1, C(0)); ctx.fillStyle = g2; ctx.fillRect(0, wl, W, H - wl);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 7; i++) { const x0 = i * 38 + Math.sin(t * .8 + i) * 8; const gg = ctx.createLinearGradient(0, wl, 0, wl + 220); gg.addColorStop(0, C(.2)); gg.addColorStop(1, C(0)); ctx.fillStyle = gg;
      ctx.beginPath(); ctx.moveTo(x0, wl); ctx.lineTo(x0 + 12, wl); ctx.lineTo(x0 - 20, wl + 220); ctx.lineTo(x0 - 40, wl + 220); ctx.fill(); }
    ctx.restore();
  }
  const waveY = (x, wl, t) => wl + Math.sin(x * .07 + t * 3) * 2.2 + Math.sin(x * .023 - t * 1.6) * 2;
  function surfaceLine(wl, t, foam = 0) {
    // полоса воды поверх предметов: под водой — затемнение, сама линия — светлая
    ctx.save(); ctx.globalAlpha = .35; ctx.fillStyle = C(.02); ctx.beginPath(); ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 2) ctx.lineTo(x, waveY(x, wl, t)); ctx.lineTo(W, H); ctx.fill(); ctx.restore();
    ctx.strokeStyle = C(1); ctx.lineWidth = 1.5; ctx.beginPath(); for (let x = 0; x <= W; x += 2) ctx.lineTo(x, waveY(x, wl, t)); ctx.stroke();
    if (foam > 0) for (let i = 0; i < 30; i++) { const x = 120 + (hash(i) - .5) * 120 * foam; ctx.fillStyle = C(1); ctx.fillRect(Math.round(x), Math.round(waveY(x, wl, t) - hash(i * 3) * 3), 2, 1); }
  }

  // 11. ВЫНЫРНУЛ — брызги, удочка обламывается, рыба уходит вниз
  S(3.4, t => {
    const wl = 160;
    overUnder(t, wl);
    const jump = t < 1.3 ? Math.sin(Math.PI * clamp(t / 1.3)) : 0;
    // рыба выпрыгивает дугой и падает обратно
    const fk = clamp(t / 1.6);
    const F = { x: 150 + fk * 20, y: lerp(330, 260, Math.sin(Math.PI * fk)) + (t > 1.6 ? (t - 1.6) * 90 : 0), s: .8, dir: 1, rot: lerp(-1.2, 1.3, fk), amb: .45, mouth: .5, eye: .1, pupil: .05,
      tail: t * 20, broken: t > .55, lure: { ang: -.6, len: 95 } };
    const fr = []; lit(c => fr.push(fish(c, F)), [{ x: 120, y: 60, r: 220, l: .25 }]);
    // водолаз: вылетает и плюхается, потом покачивается на волнах
    const bob = t > 1.2 ? Math.sin(t * 3) * 3 : 0;
    const dy = t < 1.2 ? lerp(60, -70, Math.sin(Math.PI * clamp(t / 1.2))) : bob;
    const raise = E.back(inv(1.8, 2.5, t));
    const P = { x: 98, y: wl + 52 + dy, s: 1.9, dir: 1, rot: t < 1.2 ? Math.sin(t * 6) * .3 : Math.sin(t * 2) * .05, amb: .7, lamp: 1, eye: .6, pupil: .4, head: -.1 + Math.sin(t * 2) * .05,
      arms: [[lerp(1.6, .9, raise), -.4], [lerp(1.7, 2.9, raise), lerp(-.5, .2, raise)]], legs: [[.4 + Math.sin(t * 4) * .3, .5], [-.2 + Math.sin(t * 4 + 2) * .3, .4]], hose: t * 4, blink: blinkAt(t, [2.9]) };
    const r = []; lit(c => r.push(diver(c, P)), [{ x: 120, y: 60, r: 200, l: .2 }]);
    surfaceLine(wl, t, inv(.1, .3, t) * (1 - inv(1.5, 3.4, t)));
    // всплеск: капли
    for (const [t0, x0, n] of [[.15, 110, 40], [1.15, 100, 30], [1.55, 180, 30]]) { const a = t - t0; if (a < 0 || a > 1.2) continue;
      for (let i = 0; i < n; i++) { const vx = (hash(i + x0) - .5) * 140, vy = -60 - hash(i * 3 + x0) * 140; const x = x0 + vx * a, y = wl + vy * a + 260 * a * a; if (y > wl + 2) continue;
        ctx.fillStyle = C(1); ctx.fillRect(Math.round(x), Math.round(y), hash(i) > .6 ? 2 : 1, 2); } }
    // приманка: сначала на рыбе, после облома — в руке водолаза
    if (t <= .55 && fr[0].bulb) bulb(ctx, fr[0].bulb[0], fr[0].bulb[1], 2.4, 1);
    else bulb(ctx, r[0].hand[0], r[0].hand[1] - 2, 2.4, 1);
    return { pal: y => y < wl + 2 ? 1 : lerp(.85, .2, clamp((y - wl) / 260)) };
  });

  // 12. ФИНАЛ — приманка мигает… из глубины мигают в ответ
  S(5.6, t => {
    const tilt = E.io(inv(.9, 2.6, t)), wl = lerp(160, 52, tilt);
    overUnder(t + 3.4, wl);
    const P = { x: 98, y: wl + 52 + Math.sin((t + 3.4) * 3) * 3, s: 1.9, dir: 1, rot: Math.sin(t * 2) * .05, amb: .7, lamp: 1, eye: .6, pupil: .4, look: tilt * .3,
      head: -.1 + tilt * .35, arms: [[.9, -.4], [lerp(2.9, 1.9, inv(2.6, 3.2, t)), .2]], legs: [[.4 + Math.sin(t * 2) * .2, .5], [-.2 + Math.sin(t * 2 + 2) * .2, .4]], hose: t * 2, blink: blinkAt(t, [.4, 4.2]) };
    const r = []; lit(c => r.push(diver(c, P)), [{ x: 120, y: 30, r: 200, l: .2 }]);
    surfaceLine(wl, t + 3.4, 0);
    const hb = r[0].hand;
    // приманка в руке мигает дважды
    const myOn = (t > .5 && t < .7) || (t > .9 && t < 1.1) ? .15 : 1;
    const end = t > 5.15 ? 0 : 1;
    bulb(ctx, hb[0], hb[1] - 2, 2.4, myOn * (end ? 1 : .15));
    // огни в глубине
    const N = 46;
    for (let i = 0; i < N; i++) {
      const t0 = i === 0 ? 2.7 : i < 7 ? 3.3 + i * .08 : 3.8 + hash(i) * .7;
      if (t < t0) continue;
      const x = i === 0 ? 110 : 14 + hash(i * 3.3) * 190, y = i === 0 ? 300 : wl + 165 + hash(i * 7.1) * (340 - wl - 165) + Math.sin(t * 1.3 + i) * 2;
      const zz = .5 + hash(i * 1.7) * .6;
      let on = Math.min(1, (t - t0) / .25);
      if (i === 0 && t < 3.3) on = ((t - 2.7) % .4) < .2 ? 1 : .1; // первый отвечает двумя миганиями
      on *= end;
      if (on > 0) bulb(ctx, x, y, 1.6 * zz, on * .9);
    }
    if (t > 4.0 && end) { text('THEY WANT', 110, 156, 3, { l: 1, chars: Math.floor((t - 4.0) * 25) }); text('IT BACK', 110, 182, 3, { l: 1, a: 1, chars: Math.floor((t - 4.3) * 25) }); }
    return { pal: y => y < wl + 2 ? 1 : lerp(.8, 0, clamp((y - wl) / 160)), fade: inv(5.2, 5.6, t) * .0 };
  });

  // ---------- таймлайн ----------
  let acc = 0; for (const s of shots) { s.t0 = acc; acc += s.dur; }
  window.SCENE = { width: 720, height: 1280, fps: 30, duration: +acc.toFixed(2) };
  window.SHOTS = shots.map((s, i) => ({ i: i + 1, t0: +s.t0.toFixed(2), dur: s.dur }));
  window.renderFrame = t => {
    let s = shots[shots.length - 1]; for (const x of shots) if (t >= x.t0 && t < x.t0 + x.dur) { s = x; break; }
    clear(0);
    const o = s.f(Math.min(t - s.t0, s.dur - 1e-4)) || {};
    post(o);
  };
})();
