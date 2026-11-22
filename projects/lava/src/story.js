// ЛАВА — сюжет: камера, капли, лица по времени. Всё — функции от абсолютного времени t (сек).
(function(){
const PI = Math.PI, TAU = 2 * PI;
const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, f) => a + (b - a) * f;
const sm = x => { x = cl(x); return x * x * (3 - 2 * x); };
const EZ = { s: sm, l: x => x, o: x => 1 - (1 - x) ** 3, i: x => x ** 3, b: x => { const c = 1.7; x -= 1; return 1 + (c + 1) * x ** 3 + c * x * x; } };
const mix = (a, b, f) => Array.isArray(a) ? a.map((v, i) => lerp(v, b[i], f)) : lerp(a, b, f);
// ключи: [[t, v, ease?], ...] — ease применяется на отрезке, который заканчивается этим ключом
function K(t, keys){
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) {
    const [t0, v0] = keys[i - 1], [t1, v1, e] = keys[i];
    return mix(v0, v1, (EZ[e || 's'])((t - t0) / (t1 - t0)));
  }
  return keys[keys.length - 1][1];
}
const hash = n => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };
// дрожь камеры после удара
function shake(t, t0, amp, dur = .45){
  const u = t - t0; if (u < 0 || u > dur) return [0, 0, 0];
  const a = amp * (1 - u / dur) ** 2;
  return [a * Math.sin(u * 73), a * Math.sin(u * 61 + 1), a * .5 * Math.sin(u * 89 + 2)];
}
const add = (a, b) => a.map((v, i) => v + b[i]);
// моргание: список моментов → добавка к верхнему веку
function blink(t, times){ let v = 0; for (const b of times) { const u = t - b; if (u > -.07 && u < .16) v = Math.max(v, u < 0 ? 1 + u / .07 : 1 - u / .16); } return cl(v); }

// профиль колбы (как в шейдере)
function bottleR(y){ const x = cl(y, .92, 3.18) - 2.05; return (((-.03927 * x + .08288) * x - .05269) * x - .18254) * x + .52989; }

// ---------- фоновые капли (сонные пассажиры) ----------
const AMB = [
  { r: .15, T: 17, ph: .08, ang: .6, face: 1 },
  { r: .14, T: 15, ph: .52, ang: 2.7, face: 2 },
  { r: .12, T: 19, ph: .80, ang: 4.3, face: 3 },
  { r: .10, T: 13, ph: .30, ang: 1.5 },
  { r: .08, T: 16, ph: .66, ang: 3.6 },
];
function amb(i, t){
  const a = AMB[i];
  const c = .5 - .5 * Math.cos(TAU * (t / a.T + a.ph));
  const y = 1.12 + 1.75 * c;
  const vy = Math.sin(TAU * (t / a.T + a.ph));
  const rr = Math.max(0, bottleR(y) - a.r - .07) * .75;
  const an = a.ang + .25 * Math.sin(t * .23 + i);
  const e = 1 + .22 * Math.abs(vy);
  return { p: [rr * Math.cos(an), y, rr * Math.sin(an)], r: a.r, s: [1 / Math.sqrt(e), e, 1 / Math.sqrt(e)], heat: cl(.38 - .15 * (y - 1.1)), k: .1 };
}
function sleepyFace(b, i, t, cam){
  const bp = b.p;
  return { b: i, eye: .30, up: cl(.6 + .08 * Math.sin(t * .7 + i) + blink(t, [3 + i * 2.3, 9.1 + i * 3.1, 15 + i * 1.7, 24 + i, 33 + i * 1.3])), lo: .08,
    yaw: Math.atan2(cam.ro[0] - bp[0], cam.ro[2] - bp[2]) + .35 * Math.sin(t * .2 + i), pitch: -.1, lx: .05 * Math.sin(t * .5 + i), ly: -.15, pu: .75, tilt: -.12 };
}

// ---------- кадры ----------
// каждый кадр: [начало, конец, функция(t, lt) → {cam, hero, heroFace, over?, env?, cap?}]
const HERO_R = .085;
const SHOTS = [];
const shot = (a, b, f) => SHOTS.push({ a, b, f });

// 1. ХУК: шлёп лицом в стекло (0–2.4)
shot(0, 2.4, (t) => {
  const zw = bottleR(1.74);
  const hz = K(t, [[0, zw - .34], [.17, zw - .045, 'i'], [1.0, zw - .05], [1.35, zw - .22, 'o'], [2.4, zw - .25]]);
  const hy = K(t, [[0, 1.80], [.17, 1.76, 'l'], [1.0, 1.70], [2.4, 1.72]]);
  const wob = Math.exp(-(t - .17) * 6) * Math.sin((t - .17) * 40) * (t > .17 ? 1 : 0);
  const sp = t < .17 ? [.9, .95, 1.25] : (t < 1.0 ? [1.42 + .12 * wob, 1.34 - .12 * wob, .62] : mix([1.42, 1.34, .62], [1, 1, 1], EZ.b(cl((t - 1.0) / .45))));
  const sh = shake(t, .17, .035, .5);
  const cam = { ro: add([0, 1.75, zw + .78], sh), ta: [0, 1.72, 0], fov: 38, focus: .78, ap: .5 };
  const face = { up: t < .17 ? 0 : (t < 1.0 ? 0 : blink(t, [1.6]) ), lo: 0, eye: .40, pu: t < 1.0 ? .55 : .85, mo: t > .17 && t < 1.0 ? .75 : K(t, [[1.0, .7], [1.4, .0]]), mw: .25,
    lx: t > 1.5 ? K(t, [[1.5, 0], [1.8, -.5], [2.1, .45]]) : 0, ly: 0, yaw: 0, tilt: t > 1.4 ? -.15 : 0 };
  return { cam, hero: { p: [0, hy, hz], r: HERO_R, s: sp, heat: .85, k: .06 }, heroFace: face };
});

// 2. ОТЪЕЗД: это лава-лампа на столе ночью (2.4–6.0)
shot(2.4, 6.0, (t, lt) => {
  const f = EZ.o(cl(lt / 3.3));
  const zw = bottleR(1.74);
  const cam = { ro: [lerp(0, .25, f), lerp(1.75, 2.05, f), lerp(zw + .78, 7.2, f)], ta: [0, lerp(1.72, 1.85, f), 0], fov: lerp(38, 34, f), focus: lerp(.78, 7.2, f), ap: lerp(.5, .35, f) };
  const hz = zw - .25, hy = K(lt, [[0, 1.72], [3.6, 1.62]]);
  return { cam, hero: { p: [0, hy, hz], r: HERO_R, heat: .97, k: .06 },
    heroFace: { up: blink(lt, [.9, 2.6]), lo: 0, eye: .40, pu: .85, lx: K(lt, [[0, .45], [.6, 0], [1.6, 0], [2.0, -.3]]), ly: K(lt, [[1.4, 0], [2.2, .55]]), yaw: 0 } };
});

// 3. ВНУТРИ: сонные пассажиры, герой смотрит наверх (6.0–9.6)
shot(6.0, 9.6, (t, lt) => {
  const cam = { ro: [lerp(.25, .05, lt / 3.6), 1.42, lerp(1.25, 1.15, lt / 3.6)], ta: [0, K(lt, [[0, 1.42], [2.4, 1.45], [3.4, 1.75]]), 0], fov: 36, focus: 1.15, ap: .35 };
  const hp = [0.0, 1.17 + .01 * Math.sin(lt * 3), 0.02];
  return { cam, hero: { p: hp, r: HERO_R, heat: .95, k: .06, s: [1 + .03 * Math.sin(lt * 3), 1 - .03 * Math.sin(lt * 3), 1] },
    heroFace: { up: blink(lt, [1.1, 2.2]), lo: 0, eye: .40, pu: .85, lx: K(lt, [[0, -.4], [1.2, .5], [2.0, .2]]), ly: K(lt, [[0, .2], [2.0, .2], [2.6, .7]]), pitch: K(lt, [[2.0, 0], [2.8, .45]]), yaw: K(lt, [[0, -.15], [1.2, .2], [2.4, 0]]) },
    hide: [2, 4], amb: { 0: (b) => { b.p = [K(lt, [[0, .18], [3.6, .10]]), K(lt, [[0, 1.05], [3.6, 2.05], ]), -.12]; }, 1: (b) => { b.p = [-.22, K(lt, [[0, 2.3], [3.6, 1.55]]), -.05]; } } };
});

// 4. POV: далеко наверху — крышка (9.6–11.2)
shot(9.6, 11.2, (t, lt) => {
  const cam = { ro: [K(lt, [[0, .75], [1.6, .6]]), 2.75, K(lt, [[0, 2.7], [1.6, 2.45]])], ta: [-.25, 3.05, 0], fov: 34, focus: 2.6, ap: .35 };
  return { cam, hero: { p: [0, 1.17, .02], r: HERO_R, heat: .95, k: .06 }, heroFace: { up: 0, eye: .4 } };
});

// 5. Решимость — крупно (11.2–12.6)
shot(11.2, 12.6, (t, lt) => {
  const cam = { ro: [.02, 1.25, .40], ta: [0, 1.19, 0], fov: K(lt, [[0, 44], [1.4, 38]]), focus: .38, ap: .25 };
  const sq = K(lt, [[0, 0], [.55, 0], [.75, 1, 'o'], [1.1, 0]]);
  return { cam, hero: { p: [0, 1.17 - .01 * sq, .02], r: HERO_R, heat: .97, k: .06, s: [1 + .12 * sq, 1 - .12 * sq, 1 + .12 * sq] },
    heroFace: { up: K(lt, [[0, .05], [.5, .32]]), lo: K(lt, [[0, 0], [.5, .12]]), eye: .40, pu: .8, tilt: K(lt, [[0, 0], [.5, .42]]), ly: .35, pitch: .25, yaw: 0 } };
});

// 6. Попытка 1: всплыть — и остыть (12.6–17.2)
shot(12.6, 17.2, (t, lt) => {
  const hy = K(lt, [[0, 1.17], [.3, 1.14, 'o'], [2.2, 2.58, 's'], [2.7, 2.62, 'o'], [3.1, 2.62], [4.6, 1.75, 'i']]);
  const heat = K(lt, [[0, .85], [.3, 1], [1.6, .9], [2.6, .28], [4.6, .22]]);
  const vy = (K(lt + .02, [[0, 1.17], [.3, 1.14, 'o'], [2.2, 2.58, 's'], [2.7, 2.62, 'o'], [3.1, 2.62], [4.6, 1.75, 'i']]) - hy) / .02;
  const e = 1 + cl(Math.abs(vy) * .18, 0, .3);
  const cy = K(lt, [[0, 1.3], [2.4, 2.45], [3.2, 2.5], [4.6, 1.95]]);
  const cam = { ro: [.30, cy + .02, 1.25], ta: [0, cy + K(lt, [[2.0, 0], [2.6, .25], [3.4, 0]]), 0], fov: 34, focus: 1.25, ap: .3 };
  return { cam, hero: { p: [.03, hy, .03], r: HERO_R, heat, k: .06, s: [1 / Math.sqrt(e), e, 1 / Math.sqrt(e)] },
    heroFace: { up: K(lt, [[0, .1], [2.0, .1], [2.7, 0], [3.4, .35]]) + blink(lt, [1.2]), lo: 0, eye: .42, pu: K(lt, [[2.5, .85], [2.8, .55], [3.5, .8]]),
      tilt: K(lt, [[2.8, 0], [3.4, -.38]]), ly: K(lt, [[0, .5], [2.6, .6], [3.2, -.3]]), lx: K(lt, [[3.2, 0], [4.0, .5]]), mo: K(lt, [[0, 0], [.4, .3], [2.0, .3], [2.4, 0], [2.6, 0], [2.85, .35], [3.3, .1]]), mw: .3, yaw: .2 }, hide: [1, 2, 4] };
});

// 7. Попытка 2: прокатиться на большой — и утонуть в ней (17.2–22.0)
shot(17.2, 22.0, (t, lt) => {
  const by = K(lt, [[0, 1.30], [4.8, 2.20, 'l']]);
  const B = { p: [-.05, by, -.02], r: .17, s: [1, 1.08, 1], heat: .5, k: .1 };
  const top = by + .17 * 1.08;
  // герой прыгает сверху, проваливается внутрь, выдёргивается
  const sink = K(lt, [[0, 0], [1.2, 0], [1.5, .15, 'o'], [3.0, .95, 's'], [3.4, 1]]);
  const pop = K(lt, [[3.4, 0], [3.75, 1, 'o']]);
  const jump = K(lt, [[0, -.25], [.5, -.30], [.95, .20, 'o'], [1.2, .02, 'i']]);
  let hy = lt < 1.2 ? top + HERO_R * .8 + jump : lerp(top + HERO_R * .8, by + .05, sink);
  let hx = lt < 1.2 ? K(lt, [[0, .22], [.5, .22], [1.2, -.05]]) : -.05;
  let k = lerp(.06, .16, sink);
  let s = [1, 1, 1];
  if (lt < .5) { s = [1 + .2 * sm(lt / .5), 1 - .2 * sm(lt / .5), 1 + .2 * sm(lt / .5)]; }
  if (lt >= 1.2 && lt < 1.5) { const q = Math.sin((lt - 1.2) / .3 * PI); s = [1 + .25 * q, 1 - .25 * q, 1 + .25 * q]; }
  if (lt > 3.35) { hy = lerp(by + .05, top + .3, pop) + K(lt, [[3.75, 0], [4.8, -.5, 'i']]); hx = lerp(-.05, .18, pop); k = lerp(.16, .01, pop); const st = Math.sin(cl((lt - 3.35) / .5) * PI); s = [1 - .25 * st, 1 + .6 * st, 1 - .25 * st]; }
  const cy = lerp(1.55, 2.25, lt / 4.8);
  const cam = { ro: [.22, cy, 1.35], ta: [-.03, cy - .02, 0], fov: 36, focus: 1.35, ap: .3 };
  const panic = sm((lt - 2.0) / .4) * (1 - sm((lt - 3.9) / .3));
  return { cam, hero: { p: [hx, hy, .02], r: HERO_R, heat: .97, k, s },
    heroFace: { up: K(lt, [[0, .05], [1.5, .05], [1.8, .3], [2.0, 0]]), lo: K(lt, [[0, 0], [1.3, .45], [1.7, .45], [1.9, 0]]), eye: .40, pu: lerp(.85, .5, panic), mo: panic * .7, mw: .3,
      lx: K(lt, [[0, -.5], [1.2, -.2], [2.2, .5], [2.6, -.5], [3.0, .4]]), ly: K(lt, [[0, -.2], [1.2, -.3], [2.2, .3]]), yaw: .1 },
    amb: { 1: (b) => { Object.assign(b, B); } }, bFace: { up: .68 }, hide: [0, 2, 3] };
});

// 8. Попытка 3: на самом дне над лампочкой — разогреться (22.0–26.0)
shot(22.0, 26.0, (t, lt) => {
  const heat = K(lt, [[0, .7], [2.6, 1.0]]);
  const sq = K(lt, [[0, 0], [2.6, 0], [3.6, 1, 's'], [3.85, 1.15, 'o'], [4.0, -.6, 'i']]);
  const jit = lt > 1.0 ? .006 * sm((lt - 1) / 2) * Math.sin(lt * 90) : 0;
  const cam = { ro: [K(lt, [[0, .25], [4, .12]]), K(lt, [[0, 1.30], [4, 1.24]]), K(lt, [[0, 1.05], [4, .92]])], ta: [0, 1.2, 0], fov: K(lt, [[0, 34], [4, 28]]), focus: 1.0, ap: .35 };
  const hp = [jit, 1.15 - .025 * Math.max(sq, 0), 0];
  return { cam, hero: { p: hp, r: HERO_R, heat, k: .06, s: [1 + .3 * sq, 1 - .35 * sq, 1 + .3 * sq] },
    heroFace: { up: K(lt, [[0, .25], [1.0, .3]]) + blink(lt, [.6]), lo: .1, eye: .40, pu: .75, tilt: .45, ly: .45, pitch: .25, yaw: .25, mo: K(lt, [[2.6, 0], [3.0, .25], [3.8, .25]]), mw: .9 },
    hide: [0, 1, 2, 4], bubbles: lt > .8 ? [0, 1, 2].map(i => { const u = ((lt - .8) * 1.3 + i / 3) % 1; return { p: [.05 * Math.sin(i * 2.1 + lt), 1.22 + u * .7, .03 * Math.cos(i * 3 + lt)], r: .018 * (1 - u * .4), heat: 1, k: .01 }; }) : [] };
});

// 9. РАКЕТА вверх и удар в крышку снизу (26.0–27.6)
shot(26.0, 27.6, (t, lt) => {
  const hy = K(lt, [[0, 1.2], [.55, 3.05, 'i'], [1.6, 3.0, 'o']]);
  const imp = .55;
  let s;
  if (lt < imp) { const e = 1 + 1.0 * sm(lt / .2); s = [1 / Math.sqrt(e), e, 1 / Math.sqrt(e)]; }
  else { const u = lt - imp; const w = Math.exp(-u * 5) * Math.cos(u * 26); s = [1 + .45 * w, 1 - .5 * w, 1 + .45 * w]; }
  const sh = shake(t, 26.0 + imp, .05, .6);
  const cy = K(lt, [[0, 1.6], [.55, 2.85, 'i']]);
  const cam = { ro: add([.32, cy, .18], sh), ta: [0, cy + .25, 0], fov: 50, focus: .32, ap: .18, roll: K(lt, [[0, .25], [.55, 0, 'o']]) };
  return { cam, hero: { p: [0, hy, 0], r: HERO_R, heat: 1, k: .06, s },
    heroFace: { up: lt > imp ? K(lt, [[imp, 0], [imp + .1, .5]]) : .1, lo: .05, eye: .40, pu: lt > imp ? .5 : .7, tilt: lt > imp ? -.2 : .5, mo: lt > imp ? .45 : 0, mw: .4, ly: .5, pitch: .3, lx: lt > imp + .2 ? .5 * Math.sin((lt - imp) * 14) : 0 },
    hide: [], cap: [0, lt > imp ? .03 * Math.exp(-(lt - imp) * 8) : 0, 0, 0], env: [0, 1, lt > imp && lt < imp + .06 ? .25 : 0, 0], scatter: lt < .6 ? sm(lt / .4) : 1 };
});

// 10. Снаружи: крышку выбивает (27.6–30.4)
const SLAMS = [27.95, 28.75, 29.55];
shot(27.6, 30.4, (t, lt) => {
  let capY = 0, capR = 0, capX = 0;
  for (let i = 0; i < 2; i++) { const u = t - SLAMS[i]; if (u > 0) capY += (i + 1) * .035 * Math.exp(-u * 7) * Math.abs(Math.cos(u * 18)); }
  const u3 = t - SLAMS[2];
  if (u3 > 0) { capY = 3.2 * u3 - 4.9 * u3 * u3 * .5 + u3 * 1.2; capX = .9 * u3; capR = -u3 * 7; }
  const sh = add(add(shake(t, SLAMS[0], .025), shake(t, SLAMS[1], .035)), shake(t, SLAMS[2], .05));
  const cam = { ro: add([.75, 3.15, 2.0], sh), ta: [0, 3.3, 0], fov: 32, focus: 2.15, ap: .3 };
  // под крышкой — светящийся герой бьётся
  let hy = 3.0;
  for (const s of SLAMS) { const u = t - s; if (u > -.25 && u < .45) hy = 2.82 + .26 * (u < 0 ? sm(1 + u / .25) : Math.exp(-u * 6)); }
  return { cam, hero: { p: [0, Math.min(hy, 3.1), 0], r: HERO_R, heat: 1, k: .06, s: [1.2, .8, 1.2] }, heroFace: { up: .2, eye: .4, tilt: .4 },
    cap: [capX, capY, 0, capR], env: [0, 1, 0, 0] };
});

// 11. Выход наружу: свобода (30.4–34.2)
shot(30.4, 34.2, (t, lt) => {
  const hy = K(lt, [[0, 3.02], [.9, 3.27, 'o'], [3.8, 3.25]]);
  const st = K(lt, [[0, 1.4], [.9, 1, 'b']]);
  const orb = K(lt, [[0, -.25], [3.8, .55]]);
  const cam = { ro: [Math.sin(orb) * 1.05, 3.48, Math.cos(orb) * 1.05], ta: [0, 3.25, 0], fov: 34, focus: 1.05, ap: .45 };
  return { cam, hero: { p: [0, hy, 0], r: HERO_R, heat: .97, k: .06, s: [1 / Math.sqrt(st), st, 1 / Math.sqrt(st)], out: lt > .1 },
    heroFace: { up: blink(lt, [1.3, 2.9]), lo: K(lt, [[2.2, 0], [2.6, .42]]), eye: .42, pu: .8, yaw: K(lt, [[0, orb], [1.0, orb - .55], [2.0, orb - .35], [3.0, orb]]), pitch: K(lt, [[1.0, 0], [1.6, .15]]), lx: K(lt, [[1.0, 0], [1.8, -.3]]), ly: .1, mo: K(lt, [[1.0, 0], [1.4, .35], [2.2, .15]]), mw: .5 },
    cap: [3, 5, 0, 0] };
});

// 12. Холод: застывает, музыка тянется и встаёт (34.2–38.8)
shot(34.2, 38.8, (t, lt) => {
  const heat = K(lt, [[0, .8], [2.6, 0]]);
  const jit = lt > .6 && lt < 2.8 ? .004 * Math.sin(lt * 80) : 0;
  const pb = K(lt, [[0, 0], [4.6, 1]]);
  const cam = { ro: [lerp(.55, 1.5, pb), lerp(3.42, 3.6, pb), lerp(.75, 2.6, pb)], ta: [0, lerp(3.26, 3.1, pb), 0], fov: 36, focus: lerp(.92, 3.0, pb), ap: .4 };
  return { cam, hero: { p: [jit, 3.25 - .02 * sm(lt / 2.6), 0], r: HERO_R, heat, k: .06, s: [1 + .06 * sm(lt / 2.6), 1 - .08 * sm(lt / 2.6), 1 + .06 * sm(lt / 2.6)], out: true },
    heroFace: { up: K(lt, [[0, 0], [1.2, .25], [2.0, .5], [2.6, .62]]) + (lt < 2 ? blink(lt, [.7, 1.5]) : 0), lo: 0, eye: .42, pu: .7, tilt: K(lt, [[0, 0], [1.0, -.3]]), ly: K(lt, [[0, .1], [1.0, -.45]]), yaw: .5, pitch: -.15, mo: K(lt, [[0, 0], [.8, .3], [2.6, .18]]), mw: .25 },
    cap: [3, 5, 0, 0], bloom: lerp(1, .7, pb) };
});

// 13. Рассвет: солнечный луч — оттаивает (38.8–43.4)
shot(38.8, 43.4, (t, lt) => {
  const dawn = K(lt, [[0, 0], [2.0, 1, 'l']]);
  const heat = K(lt, [[1.8, 0], [3.2, .85]]);
  const cam = { ro: [.62, 3.38, .70], ta: [0, 3.26, 0], fov: K(lt, [[0, 40], [4.6, 34]]), focus: .94, ap: .45 };
  const wake = sm((lt - 2.4) / .5);
  return { cam, hero: { p: [0, 3.23 + .02 * wake, 0], r: HERO_R, heat, k: .06, s: [1 + .06 * (1 - wake), 1 - .08 * (1 - wake) + .1 * Math.sin(cl((lt - 2.6) / .4) * PI), 1 + .06 * (1 - wake)], out: true },
    heroFace: { up: lerp(.62, 0, wake) + blink(lt, [3.1, 3.4]), lo: K(lt, [[3.6, 0], [4.1, .45]]), eye: .42, pu: lerp(.7, .9, wake), tilt: lerp(-.3, 0, wake), ly: lerp(-.45, .15, wake), lx: lerp(0, -.5, wake), yaw: lerp(.5, -.75, sm((lt - 3.0) / .6)), pitch: .05, mo: K(lt, [[2.9, 0], [3.2, .4], [3.9, .2]]), mw: .5 },
    cap: [3, 5, 0, 0], env: [dawn, 1, 0, sm((lt - 1.6) / 1.2)] };
});

// 14. Прыжок к солнцу (43.4–46.0)
shot(43.4, 46.0, (t, lt) => {
  const cam = { ro: [1.25, 3.0, 1.9], ta: [-.6, 3.4, -.9], fov: 38, focus: 2.3, ap: .3 };
  const sq = K(lt, [[0, 0], [.5, 1], [.7, -.4, 'o'], [1.0, 0]]);
  const ju = cl((lt - .62) / 1.4);
  const p = [lerp(0, -2.2, ju), 3.25 + 1.6 * ju - 1.9 * ju * ju + (lt < .62 ? -.02 * sq : 0), lerp(0, -2.8, ju)];
  return { cam, hero: { p, r: HERO_R, heat: .9, k: .06, s: [1 + .25 * sq, 1 - .3 * sq, 1 + .25 * sq], out: true },
    heroFace: { up: 0, lo: .4, eye: .42, yaw: -2.45, pitch: .2, ly: .2 },
    cap: [3, 5, 0, 0], env: [1, 1, 0, 1] };
});

// 15. Финал-петля: сонная капля открывает глаза — и шлёп в стекло (46.0–49.0)
shot(46.0, 49.0, (t, lt) => {
  const zw = bottleR(1.74);
  const cam = { ro: [0, 1.75, zw + .78], ta: [0, 1.72, 0], fov: 38, focus: .82, ap: .5 };
  const hz = K(lt, [[0, -.05], [1.6, -.02], [2.6, zw - .28, 'i'], [2.8, zw - .07, 'i']]);
  const sp = lt < 2.8 ? [1, 1, 1] : [1.42, 1.34, .62];
  return { cam: { ...cam, ro: add(cam.ro, shake(t, 48.8, .035)) },
    hero: { p: [.02, 1.74, hz], r: .12, heat: .85, k: .06, s: sp },
    heroFace: { up: K(lt, [[0, .62], [.9, .62], [1.1, 0, 'o']]), lo: 0, eye: .34, pu: K(lt, [[1.0, .8], [1.3, .55]]), ly: K(lt, [[0, -.15], [1.2, .5], [1.8, 0]]), mo: lt > 2.8 ? .75 : 0, mw: .25 },
    env: [1, 1, 0, 0], fade: lt > 2.85 ? 0 : 1 };
});

window.DURATION = 49.0;
window.SHOTS = SHOTS;

window.STORY = function(t){
  const sh = SHOTS.find(s => t >= s.a && t < s.b) || SHOTS[SHOTS.length - 1];
  const R = sh.f(t, t - sh.a);
  const cam = R.cam;
  const blobs = [{ p: [0, .97, 0], r: .44, s: [1, .2, 1], heat: .62, k: .14 }];
  const faces = [];
  const hero = R.hero;
  blobs.push(hero);
  faces.push({ b: 1, ...R.heroFace, yaw: R.heroFace.yaw ?? Math.atan2(cam.ro[0] - hero.p[0], cam.ro[2] - hero.p[2]) });
  for (let i = 0; i < AMB.length; i++) {
    const b = amb(i, t);
    if (R.amb && R.amb[i]) R.amb[i](b);
    if (R.hide && R.hide.includes(i)) { b.r = 0; }
    if (R.scatter && Math.abs(b.p[1] - hero.p[1]) < .4) { const d = Math.hypot(b.p[0], b.p[2]) || .01; const push = R.scatter * .25; b.p[0] += b.p[0] / d * push; b.p[2] += b.p[2] / d * push; }
    // не даём капле проглотить камеру
    const dx = b.p[0] - cam.ro[0], dy = b.p[1] - cam.ro[1], dz = b.p[2] - cam.ro[2];
    const dd = Math.hypot(dx, dy, dz), need = b.r * 1.15 + .16;
    if (dd < need) { const f = need / Math.max(dd, 1e-3); b.p = [cam.ro[0] + dx * f, cam.ro[1] + dy * f, cam.ro[2] + dz * f]; }
    { const A = cam.ro, H = hero.p; const ab = H.map((v, j) => v - A[j]); const L2 = ab[0]**2 + ab[1]**2 + ab[2]**2;
      const u = cl(((b.p[0]-A[0])*ab[0] + (b.p[1]-A[1])*ab[1] + (b.p[2]-A[2])*ab[2]) / L2, 0, 1);
      if (u > 0 && u < .92 && L2 < 1.5) { const c = A.map((v, j) => v + ab[j] * u); const off = b.p.map((v, j) => v - c[j]); const dl = Math.hypot(...off) || 1e-3; const want = b.r + .05;
        if (dl < want) { b.p = c.map((v, j) => v + off[j] / dl * want); } } }
    blobs.push(b);
    if (AMB[i].face) { const fc = sleepyFace(b, blobs.length - 1, t, cam); if (i === 1 && R.bFace) Object.assign(fc, R.bFace); faces.push(fc); }
  }
  for (const b of (R.bubbles || [])) blobs.push(b);
  return { cam, blobs: blobs.slice(0, 12), faces: faces.slice(0, 4), cap: R.cap || [0, 0, 0, 0], env: R.env || [0, 1, 0, 0], bloom: R.bloom, fade: R.fade };
};
})();
