// «12 SHOTS» — монтаж, вспышки, счётчик, надписи.
import { THREE, scene, camera, renderer, flash, lightning, lamp, moon, glCanvas, snap, composite, ctx, out, W, H, K, clamp, lerp, win, sm, ease, outE, inoutE, noise, h1, V3, canvasTex } from './core.js';
import { buildRoom, R, T as TX } from './room.js';
import { makeFigure, poseFigure } from './figure.js';
import LINES from '../vo/lines.json';
import DUR from '../vo/durations.json';

buildRoom();
const propLight = new THREE.PointLight(0x9fb4ff, 0, 2, 2); propLight.position.set(-1.9, 1.2, 1.2); scene.add(propLight);
const fig = makeFigure(); scene.add(fig.g);
const D = id => DUR[id] ?? 2.5;
const SHOTS = [
  { id: 'H', lines: [], min: 3.4 },
  { id: 'A', lines: ['v01', 'v02'], lead: .5, tail: .6, min: 7 },
  { id: 'B', lines: ['v03'], lead: .3, tail: .8, min: 3.8 },
  { id: 'C', lines: ['v04'], lead: 1.3, tail: .5, min: 4.8 },
  { id: 'Dd', lines: ['v05'], lead: 2.6, tail: .4, min: 5.4 },
  { id: 'E', lines: ['v06'], lead: .2, tail: .3, min: 6.6 },
  { id: 'F', lines: ['v07'], lead: 1.6, tail: .4, min: 4.4 },
  { id: 'G', lines: ['v08'], lead: 1.0, tail: 1.2, min: 4.8 },
  { id: 'H2', lines: ['v09'], lead: .3, tail: .5, min: 3.8 },
  { id: 'I', lines: ['v10'], lead: .2, tail: 2.6, min: 4.2 },
  { id: 'J', lines: ['v11'], lead: .9, tail: 1.0, min: 4 },
  { id: 'Kp', lines: ['v12', 'v13'], lead: .5, tail: 1.0, min: 6 },
  { id: 'L', lines: [], min: 4.6 },
];
let T0 = 0; const VO = [];
for (const s of SHOTS) { let t = s.lead || 0; s.t0 = T0; s.v = []; s.lines.forEach((id, i) => { if (i) t += .35; const Ln = LINES.lines.find(l => l.id === id); VO.push({ id, t: T0 + t, d: D(id), text: Ln.text }); s.v.push(t); t += D(id); }); s.d = Math.max(s.min, t + (s.tail || 0)); T0 += s.d; }
export const TOTAL = T0; window.SHOTS = SHOTS.map(s => ({ id: s.id, t0: s.t0, d: s.d })); window.VO_TIMELINE = VO;
const SH = Object.fromEntries(SHOTS.map(s => [s.id, s]));
// вспышки: [план, локальное время, считается ли кадр]
const FL = [['H', .25, 0], ['H', 1.45, 0], ['Dd', .5, 1], ['Dd', 2.3, 1], ['E', 1.3, 1], ['E', 2.9, 1], ['E', 4.3, 1], ['E', 5.6, 1], ['F', 1.2, 1], ['G', SH.G.d - .7, 1],
  ['H2', .45, 1], ['H2', 1.45, 1], ['H2', 2.45, 1], ['I', 1.0, 1], ['L', 2.5, 0]].map(([s, u, c]) => ({ s, t: SH[s].t0 + u, c }));
window.FLASHES = FL.map(f => f.t);
const shotsLeft = T => 12 - FL.filter(f => f.c && f.t <= T).length;
const lastFlash = T => { let f = null; for (const x of FL) if (x.t <= T) f = x; return f; };

// ---------- состояние сцены ----------
const BED = V3(-.25, 1.18, 1.25), DOORV = V3(.75, 1.15, -4);
function cam(p, look, t, sh = 1, fov = 62) {
  camera.position.set(p.x + noise(1, t * .7) * .012 * sh, p.y + noise(2, t * .6) * .01 * sh + Math.sin(t * 1.7) * .006, p.z + noise(3, t * .5) * .01 * sh);
  camera.lookAt(look.x + noise(4, t * .9) * .03 * sh, look.y + noise(5, t * .8) * .025 * sh, look.z);
  camera.rotateZ(noise(6, t * .4) * .015 * sh); camera.fov = fov; camera.updateProjectionMatrix(); camera.updateMatrixWorld();
}
function reset() { propLight.intensity = 0; fig.g.visible = false; fig.g.position.set(0, 0, 0); R.doorPivot.rotation.y = 1.25; R.wardL.rotation.y = 0; R.wardR.rotation.y = 0; lightning.intensity = .55; lightning.position.set(-6, 5, .5); lightning.target.position.set(1, 0, 0); lamp.intensity = 0; moon.intensity = .9; R.bulb.material.emissive.setHex(0); R.window.material.color.setHex(0x223044); R.endWin.material.color.setHex(0x1a2232); }
function bolt(t, times) { let k = 0; for (const a of times) { const d = t - a; if (d >= 0 && d < .6) k = Math.max(k, (d < .06 ? 1 : d < .12 ? .25 : d < .2 ? .9 : 0) * Math.exp(-d * 3)); } return k; }
function setBolt(k) { lightning.intensity = .55 + k * 6; lightning.position.set(-6, 5, .5); lightning.target.position.set(1, 0, 0); R.window.material.color.setRGB(.13 + k * .9, .19 + k * .9, .27 + k * .9); R.endWin.material.color.setRGB(.1 + k * .5, .13 + k * .5, .2 + k * .5); }
const hallFig = (z, o = {}) => { fig.g.visible = true; poseFigure(fig, { pos: V3(.72 + (o.x || 0), 0, z), yaw: 0, ...o }); };

// u — локальное время; F — режим вспышки (рисуем момент вспышки)
const SHOT = {
  H(u, F) { // хук: две вспышки в коридоре — оно ближе
    cam(V3(.7, 1.2, -1.2), V3(.72, 1.25, -6), u, 1.2, 58);
    if (u >= 1.45) hallFig(-4.3, { headTilt: .75, lean: .25, reach: .35, curl: .6, mouth: .8 }); else hallFig(-8.3, { headTilt: .3 });
    return { hook: 1, stamp: "'26 11 23" };
  },
  A(u, s) { // темно, гроза; камера на тумбочке
    const k = ease(u, s.d * .45, s.d * .85, inoutE);
    cam(BED, V3(lerp(-2, -1.55, k), lerp(1.5, .7, k), lerp(.1, 1.7, k)), u, .6, 62);
    setBolt(bolt(u, [.8, 3.1, 5.4]));
    return {};
  },
  B(u, s) { // фотоаппарат крупно: 12 кадров, заряд вспышки
    cam(V3(-1.35, .86, 1.45), V3(-1.6, .68, 1.75), u, .3, 40);
    propLight.intensity = .35;
    setBolt(bolt(u, [.4, 2.6]) * .7); moon.intensity = .9;
    const led = R.camProp.userData.led.material; led.color.setHex(u < 1.2 ? 0x330000 : u < 2.6 ? (Math.floor(u * 6) % 2 ? 0xff2200 : 0x440000) : 0x22ff44);
    return { counter: 1, led: u < 1.2 ? null : u < 2.6 ? 'charge' : 'ready' };
  },
  C(u, s) { // дверь приоткрыта; стук из коридора
    R.doorPivot.rotation.y = .35;
    cam(BED, V3(.7, 1.1, -2), u, .7, 58);
    setBolt(bolt(u, [2.2]) * .8);
    return { counter: 1, led: 'ready' };
  },
  Dd(u, s, F) { // вспышка 1: пусто; вспышка 2: в конце коридора
    R.doorPivot.rotation.y = lerp(.35, 1.3, ease(u, 0, .4));
    cam(V3(.2, 1.18, .2), V3(.72, 1.2, -6), u, 1, 58);
    if (u >= 2.3) hallFig(-8.3, { headTilt: .25, t: u });
    return { counter: 1 };
  },
  E(u, s) { // каждая перезарядка — ближе
    R.doorPivot.rotation.y = 1.3;
    cam(V3(.2, 1.18, .2 + u * .05), V3(.72, 1.2, -6), u, 1.2, 58);
    const z = u < 1.3 ? -8 : u < 2.9 ? -6.6 : u < 4.3 ? -5.0 : u < 5.6 ? -3.5 : -2.35;
    const o = u < 2.9 ? { headTilt: .35 } : u < 4.3 ? { headTilt: .7, lean: .15 } : u < 5.6 ? { headTilt: .9, lean: .3, reach: .5, curl: .7, mouth: .9 } : { headTilt: 1.15, lean: .5, crouch: .35, reach: .8, curl: .9, mouth: 1, armR: V3(1.1, 1.3, -2.0) };
    hallFig(z, { ...o, t: u });
    return { counter: 1 };
  },
  F(u, s) { // хлопнула дверью; вспышка в закрытую дверь
    R.doorPivot.rotation.y = lerp(1.3, 0, ease(u, .1, .35, outE));
    cam(V3(.1, 1.18, .3), V3(.72, 1.1, -2), u, 1.4, 60);
    setBolt(bolt(u, [2.6]) * .6);
    return { counter: 1 };
  },
  G(u, s) { // стук изнутри комнаты — шкаф. Створки открываются. Вспышка: оно в шкафу (СКРИМЕР 1)
    R.doorPivot.rotation.y = 0;
    const k = ease(u, .6, 1.6, inoutE);
    cam(V3(.1, 1.18, .3), V3(lerp(.72, 1.7, k), lerp(1.1, 1.35, k), lerp(-2, -.1, k)), u, 1.3, 60);
    const op = ease(u, 1.8, s.d - .8);
    R.wardL.rotation.y = -op * 2.0; R.wardR.rotation.y = op * 2.0;
    setBolt(bolt(u, [2.3]) * .7);
    if (u > 1.5) { fig.g.visible = true; poseFigure(fig, { pos: V3(1.72, 0, -.1), yaw: -Math.PI / 2, crouch: .12, lean: .25, headTilt: -.75, curl: .9, mouth: 1, armL: V3(1.38, 1.5, -.82), armR: V3(1.38, 1.15, .62), t: u }); }
    return { counter: 1 };
  },
  H2(u, s) { // «Стой на свету» — быстрые вспышки, а оно всё равно ближе
    const st = u < 1.45 ? 0 : u < 2.45 ? 1 : 2;
    fig.g.visible = true;
    if (st === 0) { cam(V3(.1, 1.18, .45), V3(1.15, 1.3, -.4), u, 1.6, 60); poseFigure(fig, { pos: V3(1.25, 0, -.45), yaw: -Math.PI / 2 - .3, crouch: .05, lean: .2, headTilt: 1.0, curl: .8, mouth: 1, t: u }); }
    else if (st === 1) { cam(V3(.1, 1.18, .45), V3(.85, .55, -.35), u, 1.6, 60); poseFigure(fig, { pos: V3(1.05, 0, -.5), yaw: -Math.PI / 2 - .45, crouch: 1, lean: .9, headTilt: -.5, headPitch: -.9, curl: 1, mouth: 1.2, armL: V3(.75, .05, -.2), armR: V3(.9, .05, .1), t: u }); }
    else { poseFigure(fig, { pos: V3(.1, 0, -.75), yaw: 0, crouch: .35, lean: .55, headTilt: 1.3, curl: 1, mouth: 1.3, reach: .8, t: u }); cam(V3(.1, 1.18, .45), fig.head.position.clone(), u, 1.8, 60); }
    return { counter: 1 };
  },
  I(u, s) { // «Последний.» — пусто
    cam(V3(.1, 1.18, .3), V3(1.0, 1.1, -.2), u, 1, 60);
    setBolt(bolt(u, [2.6]) * .9);
    return { counter: 1 };
  },
  J(u, s) { // свет вернулся
    const on = u > .4 ? (u < .7 ? (Math.floor(u * 30) % 3 ? 1 : 0) : 1) : 0;
    lamp.intensity = on * 9; lamp.position.set(0, 2.2, 0); R.bulb.material.emissive.setHex(on ? 0xffe0b0 : 0); moon.intensity = .15;
    const k = ease(u, 1.2, s.d, inoutE);
    cam(V3(.1, 1.2, .3), V3(lerp(1.0, 1.98, k), lerp(1.1, 1.55, k), lerp(-.2, 1.45, k)), u, .6, 60);
    return { lit: 1 };
  },
  Kp(u, s) { // фото деда, 1961
    lamp.intensity = 9; lamp.position.set(0, 2.2, 0); R.bulb.material.emissive.setHex(0xffe0b0);
    cam(V3(lerp(1.15, 1.45, ease(u, 0, s.d)), 1.55, 1.45), V3(1.99, 1.55, 1.45), u, .4, 40 - u * 1.5);
    return { lit: 1 };
  },
  L(u, s) { // лампа гаснет; вспышка заряжается сама — лицо в объективе (СКРИМЕР 2)
    const on = u < .5 ? 1 : 0; lamp.intensity = on * 9; lamp.position.set(0, 2.2, 0); R.bulb.material.emissive.setHex(on ? 0xffe0b0 : 0);
    cam(V3(.1, 1.2, .3), V3(1.0, 1.15, -.2), u, .8, 60);
    if (u >= 2.5) { fig.g.visible = true; const p = camera.position.clone().add(camera.getWorldDirection(V3()).multiplyScalar(.5)); poseFigure(fig, { pos: V3(p.x, 0, p.z), yaw: Math.atan2(camera.position.x - p.x, camera.position.z - p.z), lean: .25, crouch: .45, headTilt: .55, mouth: 1.3, curl: 1, reach: .6, t: u }); fig.g.position.y = 0;
      // голова — точно перед объективом
      const hp = fig.head.position.clone(); const dir = camera.getWorldDirection(V3()), rt = V3(1, 0, 0).applyQuaternion(camera.quaternion); const want = camera.position.clone().addScaledVector(dir, .55).addScaledVector(rt, .02).add(V3(0, .02, 0)); fig.g.position.add(want.sub(hp)); }
    return { counter: u > .8 ? 1 : 0, led: u < .8 ? null : u < 2.45 ? 'charge' : 'ready', end: u > 2.95 ? 1 : 0 };
  },
};

// ---------- старое фото 1961 (рендерится из той же сцены) ----------
let photoMade = false;
function makePhoto() {
  reset(); R.doorPivot.rotation.y = 0; fig.g.visible = true;
  poseFigure(fig, { pos: V3(1.2, 0, -.15), yaw: -Math.PI / 2 - .4, headTilt: .8, curl: .5, mouth: .7 });
  const pc = new THREE.PerspectiveCamera(55, .34 / .42, .05, 30); pc.position.set(-.6, 1.3, 1.5); pc.lookAt(1.2, 1.1, -.2); pc.updateMatrixWorld();
  const fl2 = new THREE.SpotLight(0xffffff, 40, 14, 1.2, .8, 2); fl2.castShadow = true; pc.add(fl2); fl2.position.set(0, .1, 0); pc.add(fl2.target); fl2.target.position.set(0, 0, -1); scene.add(pc);
  const rt = new THREE.WebGLRenderTarget(340, 420); flash.intensity = 0; moon.intensity = .1; R.photo.visible = false;
  renderer.setRenderTarget(rt); renderer.render(scene, pc); const px = new Uint8Array(340 * 420 * 4); renderer.readRenderTargetPixels(rt, 0, 0, 340, 420, px); renderer.setRenderTarget(null);
  scene.remove(pc); R.photo.visible = true;
  const tex = canvasTex(400, 500, (g, w, h) => {
    g.fillStyle = '#e9e1cf'; g.fillRect(0, 0, w, h);
    const im = g.createImageData(340, 420);
    for (let y = 0; y < 420; y++) for (let x = 0; x < 340; x++) { const i = ((419 - y) * 340 + x) * 4, o = (y * 340 + x) * 4; let l = (px[i] * .3 + px[i + 1] * .59 + px[i + 2] * .11) / 255;
      l = Math.pow(l, .8) * 1.15; const v = Math.hypot(x / 340 - .5, y / 420 - .5); l *= 1 - v * v * 1.6; l += (h1(x * 7.1 + y * 13.3) - .5) * .12;
      im.data[o] = clamp(l * 235 + 18, 0, 255); im.data[o + 1] = clamp(l * 205 + 12, 0, 255); im.data[o + 2] = clamp(l * 160 + 6, 0, 255); im.data[o + 3] = 255; }
    g.putImageData(im, 30, 26);
    g.strokeStyle = 'rgba(255,250,235,.35)'; for (let k = 0; k < 7; k++) { g.lineWidth = h1(k) * 1.5 + .5; g.beginPath(); const x = 30 + h1(k * 3) * 340; g.moveTo(x, 26); g.lineTo(x + (h1(k * 5) - .5) * 30, 446); g.stroke(); }
    g.fillStyle = '#3a2c1c'; g.font = '30px "Typo"'; g.fillText('Nov. 1961 — shot 12', 40, 486);
  }, [1, 1]);
  tex.repeat.set(1, 1); R.photo.material.map = tex; R.photo.material.needsUpdate = true; photoMade = true;
}

// ---------- надписи ----------
const SEG = '"Seg"', TYPO = '"Typo"', INT = '"Int"';
function txt(s, x, y, size, { font = INT, color = '#fff', align = 'center', alpha = 1, stroke = 0 } = {}) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.font = `${size * K}px ${font}`; ctx.textAlign = align;
  if (stroke) { ctx.lineWidth = stroke * K; ctx.strokeStyle = 'rgba(0,0,0,.85)'; ctx.lineJoin = 'round'; ctx.strokeText(s, x * K, y * K); }
  else { ctx.shadowColor = 'rgba(0,0,0,.9)'; ctx.shadowBlur = 10 * K; }
  ctx.fillStyle = color; ctx.fillText(s, x * K, y * K); ctx.restore();
}
function captions(T) {
  const v = VO.find(l => T >= l.t - .05 && T < l.t + l.d + .3); if (!v) return;
  const words = v.text.split(' '), tot = v.text.length; let acc = 0, n = 0; for (const w of words) { if (T >= v.t + (acc / tot) * v.d * .9 - .04) n++; acc += w.length + 1; }
  ctx.save(); ctx.font = `${58 * K}px ${INT}`; const lines = []; let cur = ''; for (const w of words) { const tr = cur ? cur + ' ' + w : w; if (ctx.measureText(tr).width > 900 * K) { lines.push(cur); cur = w; } else cur = tr; } lines.push(cur); ctx.restore();
  let idx = 0; const lh = 74, y0 = 1330 - (lines.length - 1) * lh / 2;
  lines.forEach((ln, li) => { const lw = ln.split(' '); const vis = lw.filter((_, j) => idx + j < n).join(' '); idx += lw.length; if (!vis) return;
    ctx.save(); ctx.font = `${58 * K}px ${INT}`; const full = ctx.measureText(ln).width / K; ctx.restore(); txt(vis, 540 - full / 2, y0 + li * lh, 58, { align: 'left', stroke: 12 }); });
}
function counterHud(T, o) {
  const n = Math.max(0, shotsLeft(T)); const a = o.counter;
  ctx.save(); ctx.globalAlpha = .9 * a; ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(60 * K, 190 * K, 250 * K, 84 * K); ctx.restore();
  txt(`EXP ${String(n).padStart(2, '0')}`, 80, 252, 54, { font: SEG, color: n <= 3 ? '#ff5a3c' : '#ffb35a', align: 'left', alpha: a });
  if (o.led) { const on = o.led === 'ready' || Math.floor(T * 6) % 2 === 0; ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = o.led === 'ready' ? '#3cff6a' : (on ? '#ff2a1a' : '#4a0a05'); ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 14 * K; ctx.beginPath(); ctx.arc(285 * K, 232 * K, 11 * K, 0, 7); ctx.fill(); ctx.restore(); }
}

// ---------- кадр ----------
window.SCENE = { duration: TOTAL, fps: 30, width: W, height: H };
let fontsReady = null;
window.renderFrame = async T => {
  if (!fontsReady) fontsReady = Promise.all([new FontFace('Seg', 'url(fonts/share-tech-mono-latin-400-normal.woff2)'), new FontFace('Typo', 'url(fonts/special-elite-latin-400-normal.woff2)'), new FontFace('Int', 'url(fonts/Inter-ExtraBold.otf)')].map(f => f.load().then(ff => document.fonts.add(ff))));
  await fontsReady; if (!photoMade) makePhoto();
  const s = SHOTS.find(x => T >= x.t0 && T < x.t0 + x.d) || SHOTS[SHOTS.length - 1]; const u = T - s.t0;
  // 1) кадр вспышки (сцена в момент последней вспышки)
  const lf = lastFlash(T); let age = null;
  if (lf && T - lf.t < 2.6) { const fs = SH[lf.s]; reset(); SHOT[lf.s](lf.t - fs.t0, fs); let fi = 55; if (fig.g.visible) { const dd = fig.head.getWorldPosition(V3()).distanceTo(camera.position); fi = 55 * clamp(Math.pow(dd / 2.6, 2), .045, 1); } flash.intensity = fi; lightning.intensity = 0; moon.intensity = 0; lamp.intensity = 0; renderer.render(scene, camera); snap('flash'); age = T - lf.t; }
  // 2) тёмный кадр «сейчас»
  reset(); const o = SHOT[s.id](u, s) || {}; flash.intensity = 0; renderer.render(scene, camera); snap('dark');
  if (o.end) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); txt('12 SHOTS', 540, 980, 96, { font: TYPO, alpha: ease(u - 3.2, 0, .3) }); return; }
  composite(T, { flashAge: age, stamp: lf && (age ?? 9) < 1 ? "'26 11 23  2:14" : null, expo: lf && lf.s === 'L' ? 1.2 : 1 });
  if (o.hook) { const a = ease(u, .4, .6) * (1 - ease(u, s.d - .3, s.d)); txt('IT ONLY MOVES', 540, 420, 92, { font: TYPO, alpha: a }); txt('IN THE DARK.', 540, 530, 110, { font: TYPO, alpha: a, color: '#ffffff' }); }
  if (o.counter) counterHud(T, o);
  captions(T);
};
