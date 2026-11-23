// КЛЯКСА — сценарий: кадры, клякса, кисть, камера, капли, переходы, титр.
'use strict';
window.DURATION = 48.2;
(function () {
  const { K, seg, ez, cl, lerp, hash, n1 } = E;
  const L = [505, 505];                       // куда падает капля
  const EYE = Wd.eyePos();                    // пустой глаз дракона
  const R0 = 22;
  const HIDE = [763, Wd.cliffY(763) - 4];
  const ROCKTOP = [520, 2168], EDGE = [722, 2378];
  const flockPos = T => [760 - (T - 18.6) * 150, 1330 + (T - 18.6) * 70 + Math.sin(T * 2) * 6];
  Wd.flockPos = flockPos;
  // ---------- прыжок-дуга (мир картины: вверх = −y)
  function arc(t, t0, t1, p0, p1, hgt, e = 'l') { const u = ez[e](cl((t - t0) / (t1 - t0))); return [lerp(p0[0], p1[0], u), lerp(p0[1], p1[1], u) - hgt * 4 * u * (1 - u), u]; }
  function onBody(d, r) {   // точка на спине дракона
    const p = Wd.at(d), u = 1 - d / Wd.COIL, w = Wd.wBody(u) / 2; let nx = -Math.sin(p[2]), ny = Math.cos(p[2]); if (ny > 0) { nx = -nx; ny = -ny; }
    return [p[0] + nx * (w + r * .85), p[1] + ny * (w + r * .85), p[2]];
  }
  // ---------- кисть по времени
  function brushAt(t) {
    const b = { x: 575, y: 420, a: .2, h: 260, s: 1.5, t, load: 0, wet: 0, drop: 0, show: true };
    if (t < 3.2) { b.load = t < .55 ? ez.i(t / .55) : 0; b.h = 260 + seg(t, 1.2, 3.2, 'io') * 40; b.y = 420 - seg(t, 1.2, 3.2) * 20; }
    else if (t < 7) { const u = seg(t, 3.4, 5.4, 'io'); b.x = lerp(575, 610, u); b.y = lerp(400, 330, u); b.h = 300 + u * 100; b.a = .2 + .05 * u;
      if (t > 6) { const k = seg(t, 6, 6.3) * (1 - seg(t, 6.8, 7)); b.x += Math.sin(t * 90) * 3 * k; b.y += Math.cos(t * 77) * 2 * k; } }
    else if (t < 9.4) { b.x = L[0] + 22; b.y = L[1] - 30; b.a = .12; b.h = K(t, [[7, 520], [8.4, 260, 'o'], [8.9, 240], [9.03, 0, 'i']]); b.y -= b.h * .1;
      if (t > 8.4 && t < 8.9) { b.x += Math.sin(t * 70) * 1.5; } if (t > 9.03) { b.x = L[0] + 4; b.y = L[1] - 6; } }
    else if (t < 13.6) {
      // погоня: два удара по облакам рядом с кляксой
      const P = [[9.4, L[0] + 4, L[1] - 6, 0], [9.9, 620, 600, 220], [10.6, 680, 760, 160], [10.86, 690, 790, 0], [11.15, 700, 780, 0], [11.6, 780, 760, 200], [12.02, 800, 860, 0], [12.3, 805, 855, 0], [13.6, 860, 700, 600]];
      let i = 0; while (i < P.length - 2 && t > P[i + 1][0]) i++;
      const [t0, x0, y0, h0] = P[i], [t1, x1, y1, h1] = P[i + 1], u = ez.io(cl((t - t0) / (t1 - t0)));
      b.x = lerp(x0, x1, u); b.y = lerp(y0, y1, u); b.h = lerp(h0, h1, h1 === 0 ? ez.i(cl((t - t0) / (t1 - t0))) : u); b.a = .1;
    }
    else if (t < 14.6) b.show = false;
    else if (t < 17.8) { const x = K(t, [[14.6, 600], [15.4, 690], [16.0, 840], [16.6, HIDE[0] + 10, 'io'], [17.15, HIDE[0] + 10], [17.35, HIDE[0] + 40, 'o'], [17.8, HIDE[0] + 120]]);
      b.x = x; b.y = Wd.cliffY(x) - 70 + (t > 17.15 ? -seg(t, 17.15, 17.4, 'o') * 120 : 0); b.h = t < 17.15 ? 200 : 200 + seg(t, 17.15, 17.4, 'o') * 150; b.a = .1 + (t > 17.15 ? seg(t, 17.15, 17.35, 'o') * .2 : 0); }
    else if (t < 19.5) b.show = false;
    else if (t < 20.8) { // взмах-мазок через стаю
      const u = seg(t, 19.85, 20.25, 'io'); b.x = K(t, [[19.5, 300], [19.85, 380], [20.25, 1000, 'io'], [20.8, 1150]]); b.y = 1400 - (b.x - 380) * .12; b.h = t < 19.85 ? K(t, [[19.5, 300], [19.85, 0, 'i']]) : t < 20.25 ? 0 : seg(t, 20.25, 20.6, 'o') * 300; b.a = -.6 + u * .3; }
    else if (t < 24.1) b.show = false;
    else if (t < 25.9) { b.x = 660; b.y = 2300; b.a = .15; b.h = K(t, [[24.1, 500], [24.45, 160, 'o'], [24.56, 0, 'i'], [24.85, 0], [25.4, 300, 'io'], [25.9, 900, 'i']]); b.y -= b.h * .4; if (t > 25.4) b.x += (t - 25.4) * 300; }
    else if (t < 29.5) { b.wet = 1; b.x = 650; b.y = 2240; b.a = .1; b.h = K(t, [[25.9, 700], [26.3, 200, 'o'], [29.5, 190]]); b.y -= (b.h - 190) * .4;
      b.drop = t < 26.75 ? seg(t, 26.3, 26.75, 'i') : t < 28.2 ? 0 : seg(t, 28.2, 29.4) * .3; if (t > 28.2) { const u = seg(t, 28.2, 29.4, 'io'); b.x = lerp(650, EDGE[0] + 10, u); b.y = lerp(2240, EDGE[1] - 70, u); } }
    else if (t < 31.9) { b.wet = 1; b.x = EDGE[0] + 10; b.y = EDGE[1] - 70; b.a = .1; b.h = 190; b.drop = t < 30.55 ? .3 + seg(t, 29.5, 30.55, 'i') * .7 : 0;
      if (t > 31.15) { const u = seg(t, 31.15, 31.6, 'i'); b.h = 190 + u * 500; b.y -= u * 260; b.a = .1 - u * .2; } }
    else if (t < 38.5) { b.wet = 1; b.drop = 0; const sw = Math.sin(t * 1.6) * 4; b.x = EYE[0] + 110 + sw; b.y = EYE[1] - 130 + Math.cos(t * 1.3) * 3; b.a = .22; b.h = 240; b.s = 1.5;
      if (t > 37.2) { const u = seg(t, 37.2, 38.2, 'i'); b.x += u * 400; b.y -= u * 700; b.h += u * 400; } }
    else b.show = false;
    return b;
  }
  // ---------- клякса по времени
  function blotAt(t) {
    const s = { x: L[0], y: L[1], r: R0, t, open: 1, brow: 'calm', mouth: 'none', lx: 0, ly: 0, sx: 1, sy: 1, show: t >= .95, pupil: 1 };
    if (t < 1.75) { s.open = 0; }
    if (t < 3.2) {
      s.open = K(t, [[1.7, 0], [1.86, 1.2, 'o'], [1.98, 1]]); s.blink = Math.max(0, 1 - Math.abs(t - 2.3) / .07);
      s.lx = K(t, [[2.4, 0], [2.5, -1], [2.75, -1], [2.85, 1], [3.05, 1], [3.15, 0]]); s.ly = K(t, [[2.4, 0], [3.0, 0], [3.15, -1]]); s.brow = t > 2.0 ? 'up' : 'calm';
    } else if (t < 7) {
      s.lx = K(t, [[3.2, 0], [4.8, .3], [5.0, 0]]); s.ly = K(t, [[3.2, -1], [4.8, -1], [5.0, 0], [6.0, 0], [6.15, -1]]); s.brow = t > 6 ? 'fear' : 'up'; s.mouth = t > 6.1 ? 'gulp' : 'none';
      s.blink = Math.max(0, 1 - Math.abs(t - 5.3) / .07);
    } else if (t < 8.85) {
      s.ly = -1; s.lx = .2; s.brow = 'fear'; s.pupil = K(t, [[7, 1], [7.9, .6]]); s.mouth = t > 8.0 ? 'O' : 'gulp'; s.shiver = seg(t, 7.6, 8.2); s.sweat = t > 7.6 && t < 8.7 ? seg(t, 7.6, 8.6) : 0;
      const q = seg(t, 8.55, 8.85, 'o'); s.sy = 1 - q * .3; s.sx = 1 + q * .25; s.y += q * R0 * .3;
    } else if (t < 9.35) { const [x, y, u] = arc(t, 8.85, 9.35, L, [585, 668], 90); s.x = x; s.y = y; s.sx = .85; s.sy = 1.2; s.rot = .3 * (1 - u); s.brow = 'fear'; s.mouth = 'O'; s.lx = -1; s.ly = .5;
    } else if (t < 10.05) {
      const land = seg(t, 9.35, 9.6); s.x = 585; s.y = 668; s.sy = 1 - .3 * Math.sin(land * Math.PI); s.sx = 1 + .25 * Math.sin(land * Math.PI); s.lx = -1; s.ly = -.6; s.brow = 'fear'; s.mouth = 'O';
      if (t > 9.75) { const [x, y] = arc(t, 9.75, 10.05, [585, 668], onBody(280, R0), 50); s.x = x; s.y = y; s.lx = 1; s.ly = .5; }
    } else if (t < 13.0) {   // катится по спине дракона к хвосту
      const d = 280 * (1 - ez.i(seg(t, 10.05, 13.0))); const p = onBody(d, R0); s.x = p[0]; s.y = p[1]; s.rot = p[2] + Math.PI; s.sx = 1.15; s.sy = .88;
      s.lx = K(t, [[10.1, 1], [10.8, -1], [11.2, 1], [11.9, -1], [12.3, 1]]); s.ly = .3; s.brow = 'fear'; s.mouth = t > 12.5 ? 'O' : 'grit';
    } else if (t < 14.0) { const p0 = onBody(0, R0); const [x, y, u] = arc(t, 13.0, 14.0, p0, [HIDE[0], HIDE[1] - R0], 130); s.x = x; s.y = y; s.rot = -u * 6.3; s.brow = 'fear'; s.mouth = 'O'; s.sx = .9; s.sy = 1.15;
    } else if (t < 17.75) {
      const sq = seg(t, 14.0, 14.25); s.x = HIDE[0]; s.y = HIDE[1] - R0 + R0 * .25 * Math.sin(sq * Math.PI);
      s.sy = 1 - .35 * Math.sin(sq * Math.PI); s.sx = 1 + .3 * Math.sin(sq * Math.PI);
      const shrink = seg(t, 14.4, 14.85, 'io') * (1 - seg(t, 17.45, 17.7, 'back'));
      s.r = lerp(R0, 7, shrink); s.y = lerp(s.y, HIDE[1], shrink); s.closed = t > 14.75 && t < 16.95; s.noDrip = shrink > .5;
      s.lx = K(t, [[16.95, 0], [17.0, -1], [17.12, 0]]); s.ly = -1; s.brow = t > 17.2 ? 'fear' : 'calm'; s.mouth = t > 17.25 ? 'O' : 'none'; s.big = t > 17.2 ? 1.25 : 1;
      if (t > 17.45) { s.y = lerp(HIDE[1], HIDE[1] - R0, seg(t, 17.45, 17.7)); }
    } else if (t < 18.6) { const [x, y, u] = arc(t, 17.75, 18.6, [HIDE[0], HIDE[1] - R0], flockPos(18.6), 70); s.x = x; s.y = y; s.morph = seg(t, 18.15, 18.55, 'o'); s.flap = t * 9; s.brow = 'fear'; s.mouth = 'O'; s.rot = -.2;
    } else if (t < 21.6) {
      const f = flockPos(Math.min(t, 19.95)); s.x = f[0]; s.y = f[1]; s.morph = 1 - seg(t, 21.15, 21.5); s.flap = t * 10; s.brow = t > 19.6 ? 'fear' : 'angry'; s.mouth = t > 19.6 ? 'O' : 'smile'; s.lx = -1;
      if (t > 19.95) { const u = seg(t, 19.95, 21.6, 'i'); s.x = lerp(f[0], ROCKTOP[0], seg(t, 19.95, 21.6, 'o')); s.y = lerp(f[1], ROCKTOP[1], u); s.rot = .2; s.ly = 1; s.flap = t * 22; }
    } else if (t < 23.0) {
      const ld = seg(t, 21.6, 21.85); s.x = ROCKTOP[0]; s.y = ROCKTOP[1]; s.sy = 1 - .4 * Math.sin(ld * Math.PI); s.sx = 1 + .35 * Math.sin(ld * Math.PI); s.y += R0 * .3 * Math.sin(ld * Math.PI);
      if (t > 21.9) { const u = seg(t, 21.9, 23.0, 'i'); const [x, y] = arc(t, 21.9, 23.0, ROCKTOP, EDGE, 30, 'i'); s.x = x; s.y = y; s.rot = u * 4; }
      s.brow = 'fear'; s.mouth = 'O';
    } else {
      s.x = EDGE[0]; s.y = EDGE[1];
      const tt = seg(t, 23.0, 24.0); s.rot = Math.sin(tt * Math.PI * 4) * .35 * (1 - tt) + (t < 24 ? 0 : 0); s.x += Math.sin(tt * Math.PI * 4) * 4 * (1 - tt);
      s.ly = t < 24 ? 1 : -1; s.lx = t < 24 ? .3 : 0; s.brow = 'fear'; s.mouth = t < 24 ? 'O' : 'gulp';
      if (t > 24.5) { s.lx = -1; s.ly = -.2; const fl = seg(t, 24.56, 24.8); s.sx = 1 + .2 * Math.sin(fl * Math.PI); s.sy = 1 - .2 * Math.sin(fl * Math.PI); }
      if (t > 26.8) { s.mouth = 'O'; s.big = 1.2; s.shiver = seg(t, 27.2, 27.6); s.sweat = seg(t, 27.4, 28.6) * (t < 28.8 ? 1 : 0); s.pupil = .6; }
      if (t > 28.4) { s.lx = 0; s.ly = -1; s.big = 1; }
      if (t > 30.4 && t < 30.7) { const q = seg(t, 30.4, 30.7, 'o'); s.sy = 1 - q * .35; s.sx = 1 + q * .3; s.y += q * R0 * .3; }
      if (t >= 30.7) {   // прыжок на кисть (к камере)
        const B = brushAt(t), hp = E.toWorldLocal(B, -20, -150);
        const u = seg(t, 30.7, 31.05, 'o'); s.x = lerp(EDGE[0], hp[0], u); s.y = lerp(EDGE[1], hp[1], u) - 40 * Math.sin(u * Math.PI); s.r = R0 * lerp(1, 1.35, u); s.lift = u * 60; s.brow = 'angry'; s.mouth = 'grit'; s.ly = -1;
        if (t > 31.05) { s.x = hp[0]; s.y = hp[1]; s.lift = 60; s.mouth = t < 31.4 ? 'grit' : 'O'; s.brow = 'fear'; }
        if (t > 31.9) {   // у головы дракона
          s.r = R0 * 1.35; s.lift = 60; s.brow = K(t, [[31.9, 0], [1, 1]]) ? 'calm' : 'calm';
          const look = [EYE[0] - s.x, EYE[1] - s.y], ll = Math.hypot(...look); s.lx = look[0] / ll; s.ly = look[1] / ll; s.mouth = 'none';
          if (t > 32.8 && t < 33.6) { s.mouth = 'o'; s.big = 1.2; }
          if (t > 33.6) { s.lx = K(t, [[33.6, s.lx], [33.75, 0]]); s.ly = K(t, [[33.6, s.ly], [33.75, 0]]); s.brow = 'sad'; }
          if (t > 34.15) { s.brow = 'angry'; s.mouth = 'flat'; s.lx = look[0] / ll; s.ly = look[1] / ll; }
          const q = seg(t, 34.45, 34.8, 'o'); s.sy = 1 - q * .3; s.sx = 1 + q * .25;
          if (t > 34.8) { const [x, y, u] = arc(t, 34.8, 35.3, hp, EYE, 70); s.x = x; s.y = y; s.r = lerp(R0 * 1.35, Wd.EYER * 1.2 * .66, u); s.lift = 60 * (1 - u); s.sx = .9; s.sy = 1.1; s.rot = -u * 6.28; s.brow = 'angry'; s.mouth = 'grit'; }
          if (t >= 35.3) s.show = false;
        }
      }
    }
    return s;
  }
  // ---------- капли (тушь в начале, вода в конце): xy от кончика к цели, тень сходится
  function fallDrop(t, t0, t1, from, h0, kind) {
    if (t < t0 || t > t1) return;
    const u = ez.i(seg(t, t0, t1)), h = h0 * (1 - u), x = from[0], y = from[1] + 6;
    const ox = 20 + h * .55, oy = 26 + h * .75, rr = (kind === 'ink' ? 9 : 12) * (1 + h / 600);
    E.blob(x + ox * .9, y + oy * .9, rr * 1.1, .14, 'ink', .05, 2, 0);
    if (kind === 'ink') E.blob(x, y, rr, .97, 'ink', .06, 3, t * 3, 1 - u * .1, 1 + .25 * (1 - u));
    else E.waterDrop(x, y, rr * 1.15, 1, 1.15);
  }
  function waterRing(t, t0, p, r0) { if (t < t0 || t > t0 + 1.4) return; const u = seg(t, t0, t0 + 1.4, 'o'); E.waterDrop(p[0], p[1], r0 * (1 + u * 1.6), (1 - u) * .9, .62); }
  // ---------- брызги кляксы (остаются на бумаге)
  const SPR = []; for (let i = 0; i < 14; i++) { const a = hash(i * 3.7) * 6.28, d = 34 + hash(i * 9.1) * 70; SPR.push([Math.cos(a) * d, Math.sin(a) * d * .9, 1.5 + hash(i * 5.3) * 4.5, a]); }
  function splash(t) {
    if (t < .95) return;
    const ab = t > 36.5 ? seg(t, 36.5, 37.4, 'i') : 0; if (ab >= 1) return;
    const u = seg(t, .95, 1.1, 'o');
    SPR.forEach(([dx, dy, r, a], i) => { const k = u; let x = L[0] + dx * k, y = L[1] + dy * k; x = lerp(x, EYE[0], ab); y = lerp(y, EYE[1], ab) - Math.sin(ab * 3.14) * 30; E.blob(x, y, r * (1 + (1 - k) * .6) * (1 - ab), .95, 'ink', .2, i, 0, 1 + (1 - k) * 1.5, 1, a); if (ab > 0) E.blob(x, y, r * 1.5 * (1 - ab), ab, 'gold', .2, i, 0); });
  }
  // первый взрыв кляксы
  function splat(t) {
    const u = seg(t, .95, 1.07, 'o'), v = seg(t, 1.07, 1.7, 'el');
    const r = lerp(0, 34, u) + (R0 - 34) * v; E.blob(L[0], L[1], r, .97, 'ink', lerp(.45, .13, v), 3, t * .9, 1 + .25 * (1 - v), 1 - .2 * (1 - v));
  }
  // ---------- следы ударов кисти
  Wd.marks.push({ x: L[0] + 2, y: L[1] + 2, r: 34, t0: 9.03, seed: 11 }); Wd.absorb = { t: 36.5, p: EYE };
  Wd.marks.push({ x: 690, y: 800, r: 30, t0: 10.86, seed: 12, sx: 1.4, sy: .8 });
  Wd.marks.push({ x: 800, y: 868, r: 28, t0: 12.02, seed: 13, sx: 1.2, sy: .9, rot: .4 });
  Wd.marks.push({ x: 650, y: 2318, r: 30, t0: 24.56, seed: 14, wash: 26.9 });
  function swipe(t) {   // мазок через стаю
    if (t < 19.85) return; const p = seg(t, 19.85, 20.25, 'io');
    E.stroke([[380, 1400, 30], [560, 1378, 40], [780, 1350, 34], [1000, 1326, 12]], { a: .95, dry: .7, seed: 77, prog: p, bands: 9 });
  }
  // ---------- титр кистью (Hershey → мазки), золотом на шёлке
  const GL = {};
  function glyphs(str, size) {
    const F = window.HFONT.futural, sc = size / 21; let pen = 0; const strokes = [];
    for (const ch of str) {
      if (ch === ' ') { pen += 12; continue; }
      const g = F[ch.charCodeAt(0) - 33]; if (!g) continue;
      let mx = -1e9, mn = 1e9; g[0].replace(/(-?\d+),(-?\d+)/g, (_, a) => { mx = Math.max(mx, +a); mn = Math.min(mn, +a); });
      const off = pen - mn;
      g[0].split('M').filter(Boolean).forEach(part => { const pts = []; part.replace(/(-?\d+),(-?\d+)/g, (_, a, b) => { pts.push([(+a + off) * sc, +b * sc]); }); if (pts.length > 1) strokes.push(pts); });
      pen = off + mx + 3;
    }
    return { strokes, w: pen * sc };
  }
  function title(t, str, cx, cy, size, t0, t1, ch = 'gold', w = 5) {
    if (t < t0) return; const key = str + size; const G = GL[key] || (GL[key] = glyphs(str, size));
    const p = seg(t, t0, t1), n = G.strokes.length;
    const c = E.ctx; c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
    G.strokes.forEach((s, i) => { const q = cl(p * n * 1.05 - i); if (q <= 0) return; E.stroke(s.map(([x, y]) => [cx - G.w / 2 + x, cy + y - size * .55, w]), { a: .95, ch, dry: .12, prog: q, seed: i + 3, bands: 3, step: 1.5, taper: .2, press: .15 }); });
    c.restore();
  }
  // ---------- чернильная шторка (переход) в экранных координатах
  function inkWipe(t, t0, tc, t1) {
    if (t < t0 || t > t1) return;
    const c = E.ctx; c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
    if (t < tc) { const p = seg(t, t0, tc, 'i');
      E.stroke([[-200, 1500, 900], [360, 640, 1100], [920, -200, 900]], { a: 1, dry: .5, prog: p, seed: 5, bands: 11, step: 8, taper: .05, press: .02 });
      E.stroke([[-300, 900, 700], [500, 300, 800], [1000, -300, 600]], { a: 1, dry: .4, prog: cl(p * 1.3 - .3), seed: 6, bands: 9, step: 8, taper: .05, press: .02 });
      E.stroke([[-200, 1900, 700], [500, 1100, 800], [1000, 400, 600]], { a: 1, dry: .4, prog: cl(p * 1.3 - .3), seed: 7, bands: 9, step: 8, taper: .05, press: .02 });
    } else { const q = seg(t, tc, t1, 'o'); c.fillStyle = E.col('ink', 1 - q); c.fillRect(0, 0, 720, 1280);
      E.x.save(); E.x.setTransform(1, 0, 0, 1, 0, 0); E.x.fillStyle = `rgba(0,255,0,${Math.min(1, (1 - q) * 1.5)})`; E.x.fillRect(0, 0, 360, 640); E.x.restore(); }
    c.restore();
  }
  // ---------- камера
  function camAt(t, B, S) {
    const D = Wd.D; let x, y, z, shake = 0;
    if (t < 3.2) { x = K(t, [[0, 566], [.9, 552], [3.2, 546]]); y = K(t, [[0, 445], [.9, 475], [3.2, 492]]); z = K(t, [[0, 4.2], [.9, 4.9, 'i'], [3.2, 5.2]]); shake = 8 * Math.max(0, 1 - Math.abs(t - 1.0) / .25); }
    else if (t < 7) { const u = seg(t, 3.2, 5.9, 'io'); x = lerp(546, 520, u); y = lerp(492, 640, u); z = Math.exp(lerp(Math.log(5.2), Math.log(.72), u)); z += seg(t, 5.9, 7) * .04; }
    else if (t < 9.35) { x = 548; y = K(t, [[7, 450], [8.8, 470]]); z = K(t, [[7, 2.6], [8.85, 3.1]]); shake = 14 * Math.max(0, 1 - Math.abs(t - 9.05) / .3); }
    else if (t < 14.3) { const f = t < 10.05 ? [600, 620] : [S.x, S.y - 40]; x = f[0]; y = f[1]; z = K(t, [[9.35, 2.4], [10.2, 2.2], [12.8, 2.0], [13.6, 1.5]]);
      shake = 10 * Math.max(0, 1 - Math.abs(t - 10.9) / .25) + 10 * Math.max(0, 1 - Math.abs(t - 12.05) / .25); }
    else if (t < 17.75) { x = HIDE[0] - 20; y = HIDE[1] - 30; z = K(t, [[14.3, 1.8], [14.9, 2.6, 'o'], [16.6, 2.9], [17.0, 2.9], [17.12, 4.6, 'o'], [17.6, 3.8]]); if (t > 17.0) { x = HIDE[0]; y = HIDE[1] - 6; } }
    else if (t < 21.7) { x = S.x; y = S.y - 30; z = K(t, [[17.75, 2.6], [18.6, 1.8], [19.9, 1.9], [20.3, 1.6], [21.4, 1.8]]); shake = 10 * Math.max(0, 1 - Math.abs(t - 20.05) / .3); }
    else if (t < 25.6) { x = K(t, [[21.7, 560], [23.0, 660], [24.3, 680]]); y = K(t, [[21.7, 2230], [23.0, 2300]]); z = K(t, [[21.7, 2.0], [23.0, 2.6], [24.0, 2.7], [24.4, 2.3]]); shake = 12 * Math.max(0, 1 - Math.abs(t - 24.58) / .3); }
    else if (t < 29.5) { x = K(t, [[25.6, 690], [28.6, 680]]); y = K(t, [[25.6, 2260], [27, 2290], [28.6, 2300]]); z = K(t, [[25.6, 2.2], [26.9, 2.5], [28.6, 2.9]]); }
    else if (t < 31.9) { x = 720; y = K(t, [[29.5, 2290], [31.2, 2270], [31.6, 2150, 'i']]); z = K(t, [[29.5, 2.6], [30.6, 2.9], [31.2, 2.4]]); shake = 6 * Math.max(0, 1 - Math.abs(t - 30.9) / .2); }
    else if (t < 35.3) { x = K(t, [[31.9, EYE[0] + 60], [35.3, EYE[0] + 30]]); y = K(t, [[31.9, EYE[1] - 90], [35.3, EYE[1] - 50]]); z = K(t, [[31.9, 2.4], [34.4, 3.0], [34.8, 3.1], [35.3, 3.6, 'i']]); }
    else if (t < 36.4) { x = EYE[0]; y = EYE[1]; z = K(t, [[35.3, 3.6], [35.4, 5.6, 'o'], [36.4, 6]]); shake = 6 * Math.max(0, 1 - Math.abs(t - 35.32) / .3); }
    else if (t < 38.6) { const u = seg(t, 36.4, 38.4, 'io'); x = lerp(EYE[0], 560, u); y = lerp(EYE[1], 560, u); z = Math.exp(lerp(Math.log(6), Math.log(1.15), u)); shake = 10 * seg(t, 37.6, 37.9) * (1 - seg(t, 38.4, 38.9)); }
    else if (t < 43.0) { const h = Wd.headTf(); x = lerp(560, h.x, .4); y = lerp(560, h.y, .4); z = K(t, [[38.6, 1.15], [43, .85]]); x = cl(x, 430, 570); y = cl(y, 420, 700); }
    else if (t < 44.4) { const h = Wd.headTf(); const e = Wd.eyePos(); const u = seg(t, 43.0, 43.45, 'io'); const h0 = [cl(lerp(560, h.x, .4), 430, 570), cl(lerp(560, h.y, .4), 420, 700)]; x = lerp(h0[0], e[0], u); y = lerp(h0[1], e[1], u); z = Math.exp(lerp(Math.log(.85), Math.log(2.7), u)) + seg(t, 43.45, 44.4) * .2; }
    else { const e = Wd.eyePos(); const u = seg(t, 44.4, 45.5, 'io'); x = lerp(e[0], 500, u); y = lerp(e[1], 900, u); z = Math.exp(lerp(Math.log(2.9), Math.log(.62), u)); }
    return { x, y, z, sx: shake * (n1(t * 31) - .5) * 2, sy: shake * (n1(t * 29 + 5) - .5) * 2 };
  }
  // ---------- дракон по времени
  function dragonAt(t) {
    const D = Wd.D; D.t = t; D.pupil = t >= 35.3 ? 1 : 0; D.look = [0, 0];
    D.glow = t > 35.3 ? Math.max(0, 1 - Math.abs(t - 35.9) / .6) * 1.1 + (t > 36.3 ? .15 : 0) : 0;
    D.blink = Math.max(0, 1 - Math.abs(t - 36.2) / .09);
    D.surge = t > 36.4 ? (t - 36.4) / 1.0 : -1;
    D.alive = seg(t, 37.0, 38.0, 'io');
    D.jaw = t > 37.5 ? Math.max(0, Math.min(1, (t - 37.5) / .25)) * (1 - seg(t, 38.9, 39.4)) : 0;
    D.head = Wd.COIL + (t > 38.3 ? (t - 38.3) * 120 + Math.pow(Math.max(0, t - 38.3), 2) * 70 : 0);
    if (t > 40.5) D.head = Wd.COIL + 2.2 * 120 + 2.2 * 2.2 * 70 + (t - 40.5) * (120 + 2 * 2.2 * 70);
    D.wink = Math.max(0, 1 - Math.abs(t - 43.85) / .16);
    D.look = t > 43.4 && t < 44.3 ? [.7, .5] : [0, 0];
  }
  // ---------- кадр
  window.renderFrame = function (t) {
    const S = blotAt(t), B = brushAt(t);
    dragonAt(t);
    const cam = camAt(t, B, S); Object.assign(E.cam, cam);
    E.post.FL = .5 * Math.max(0, 1 - Math.abs(t - 35.32) / .12) + .35 * Math.max(0, 1 - Math.abs(t - 37.55) / .15);
    E.post.FD = 0; E.post.FDC = .93;
    E.begin();
    Wd.paint(t);
    splash(t); swipe(t);
    if (t >= .95 && t < 1.75) splat(t);
    else if (S.show) C.blot(S);
    // капли
    if (t < 3.2) fallDrop(t, .55, .95, [B.x, B.y], B.h, 'ink');
    fallDrop(t, 26.75, 26.92, E.toWorldLocal(B, 0, 0), 190, 'water'); waterRing(t, 26.92, [650, 2318], 16);
    fallDrop(t, 30.55, 30.88, E.toWorldLocal(brushAt(30.55), 0, 0), 190, 'water'); waterRing(t, 30.88, EDGE, 18);
    if (B.show) C.brush(B);
    if (S.show && t > 31.05 && t < 34.8) C.blot(S);   // клякса на ручке — поверх кисти
    // финал: титр и печать
    if (t > 45.1) { title(t, 'EVERY MASTERPIECE', 360, 96, 50, 45.2, 46.1, 'gold', 6); title(t, 'NEEDS ONE MISTAKE', 360, 172, 50, 46.0, 46.8, 'gold', 6); }
    if (t > 46.9) { const u = seg(t, 46.9, 47.02, 'i'); const c = E.ctx; c.save(); const s = lerp(1.6, 1, u);
      c.restore();
      if (u > 0) { E.ctx.save(); E.ctx.translate(110, 110); E.ctx.scale(s, s); Wd.seal(0, 0, 100, u > .99 ? 1 : u * .3, 9); C.blot({ x: 0, y: 4, r: 22, t: 0, noDrip: true, brow: 'none', mouth: 'smile', ch: 'red' }); E.ctx.restore(); } }
    inkWipe(t, 31.45, 31.9, 32.5);
    E.post.GR = .035;
    E.end(t);
  };
  window.grab = () => E.grab(); window.ready = true;
})();
