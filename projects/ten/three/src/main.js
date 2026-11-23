// «ТЕНЬ УВОЛИЛАСЬ», серия 1 — монтаж: 16 планов, переходы «тень-шторка», текст поверх.
import { THREE, renderer, camera, composite, ctx, clamp, lerp, ease, sm, back, h1, noise, spring, G, clay, mesh, glow, canvasTex, W, H, TEX_REDRAW } from './core.js';
import { makeToy, applyPose, walk, keys, POSE, makeShade, placeShade, setFade, LOOK, blendPose } from './toy.js';
import { scene, useSet, night, kitchen, hall, handLines, loop, day, plaza, roof, poseCat, club } from './sets.js';
import { narr, shadowSay, sunHud, stamp, shadowWipe, motes, rr } from './overlay.js';
import { handPrint, psNote, condNote, contract, feedUI } from './notes.js';

// ---- общие герои ----
const hero = makeToy(LOOK.senya, { uniq: true }); scene.add(hero.root);
const shade = makeShade(); scene.add(shade.holder);
const girlSh = makeShade({ female: true }); scene.add(girlSh.holder); girlSh.holder.visible = false;
const crowdSh = Array.from({ length: 8 }, () => { const s = makeShade(); scene.add(s.holder); s.holder.visible = false; return s; });
const phone = new THREE.Group(); phone.add(mesh(G.rbox(.07, .13, .015, .01), clay('#15161e', { roughness: .3 }))); const scr = mesh(G.plane(.058, .112), glow('#9ac8ff', .9), false, false); scr.position.z = .009; phone.add(scr);
phone.position.set(0, -.04, .05); phone.rotation.x = -.3; hero.aR.hand.add(phone);
const phoneL = phone.clone(); hero.aL.hand.add(phoneL);
const fadeHand = (H, k) => H.traverse(o => { if (o.isMesh && o.material.emissive) { if (!o.material.alphaHash) { o.material.alphaHash = true; o.material.needsUpdate = true; } o.material.opacity = 1 - k * .75; o.material.emissive.set('#5a7aff'); o.material.emissiveIntensity = k * .5; } });
const band = mesh(G.cap(.04, 1), new THREE.MeshBasicMaterial({ color: '#05050a' }), false, false); band.scale.z = .15; scene.add(band);
const V = new THREE.Vector3();
const toScreen = (x, y, z) => { V.set(x, y, z).project(camera); return [(V.x + 1) / 2 * 1080, (1 - V.y) / 2 * 1920]; };
const worldOf = o => { o.updateWorldMatrix(true, false); return o.getWorldPosition(new THREE.Vector3()); };
function cam(px, py, pz, lx, ly, lz, fov = 32, roll = 0) { camera.fov = fov; camera.updateProjectionMatrix(); camera.position.set(px, py, pz); camera.up.set(0, 1, 0); camera.lookAt(lx, ly, lz); if (roll) camera.rotateZ(roll); }
const hh = (t, amp = .02, seed = 1) => [noise(seed, t * .8) * amp, noise(seed + 5, t * .7) * amp];
function heroAt(x, z, yaw, pose, t, face = {}, { sat = 1, alpha = 1, cast = false, show = true, phoneOn = false, phoneLOn = false } = {}) {
  phoneL.visible = phoneLOn;
  hero.root.visible = show; hero.root.position.set(x, 0, z); hero.root.rotation.set(0, yaw, 0); applyPose(hero, pose, t, face, 1); setFade(hero, sat, alpha, cast); phone.visible = phoneOn; }
const hideAll = () => { shade.holder.visible = false; girlSh.holder.visible = false; crowdSh.forEach(s => s.holder.visible = false); band.visible = false; hero.root.visible = false; };
const talk = (t, a, b) => t < a || t > b ? 0 : clamp(.45 + .55 * Math.sin((t - a) * 16) * Math.sin((t - a) * 5.1 + 1));
let FX = {}; // параметры компоновщика текущего плана

// ===== ПЛАНЫ =====
const S = {};
// 1. ХУК: тень отлипает от пяток
S.S1 = (t) => { useSet('night'); hideAll(); night.neon.visible = false;
  const TP = .5, SNAP = 1.05, Z = .4; const hx = tt => -.35 + tt * .55;
  const x = hx(t); const pose = walk((x + .35) * 1.6, 0, { aR: [.9, -.2, 1.9], headX: .3 });
  heroAt(x, Z, Math.PI / 2, pose, t, { expr: 'calm', lookY: -1, smile: .2 }, { phoneOn: true });
  const px = hx(Math.min(t, TP)), pPose = walk((px + .35) * 1.6, 0, { aR: [.9, -.2, 1.9], headX: .3 });
  const dx = px - night.lampX, dz = Z - night.lampZ; const yaw = Math.atan2(dx, dz), len = 1.05 + Math.hypot(dx, dz) * .32;
  const rec = t > SNAP ? Math.exp(-(t - SNAP) * 5) * Math.sin((t - SNAP) * 28) : 0;
  applyPose(shade, t < TP ? pose : pPose, t, { mood: t > 2.5 ? 'happy' : 'sly', open: ease(t, 1.7, 1.9), look: 1 }, 3);
  placeShade(shade, { x: t < TP ? x : px, z: Z, rise: 0, len: len * (1 + rec * .12), yaw, turn: Math.PI / 2 - yaw });
  // «жвачка» от пяток к пяткам
  if (t > TP && t < SNAP) { const k = (t - TP) / (SNAP - TP); band.visible = true; const ax = px, bx = x; band.position.set((ax + bx) / 2, .005, Z); band.rotation.set(0, 0, Math.PI / 2); band.scale.set(lerp(1, .25, k), Math.max(.01, Math.abs(bx - ax)), .12); }
  const ck = ease(t, SNAP, SNAP + .25);
  const [jx, jy] = hh(t, .03);
  const cx = lerp(.25, .75, ease(t, 0, 3.2, sm)); cam(cx + jx, lerp(3.1, 2.6, ck) + jy, lerp(4.4, 3.6, ck), cx + .05, lerp(.45, .2, ck), lerp(.2, .6, ck), 38, 0);
  FX = { fy: .58, fw: .3, blur: 6, bloom: .35, warm: .05 };
  return () => { if (t > SNAP && t < SNAP + .5) { const [sx, sy] = toScreen((px + hx(SNAP)) / 2, .05, Z); burst(t - SNAP, sx, sy, '#07060c', 18); }
    narr(t, .1, 3.2, 'At 11:47 PM my shadow fucked off.', { y: 290, size: 80, n: 15, accent: ['fucked', 'shadow'] }); };
};
// 2. Тень встаёт на стену, просыпается, потягивается, уходит
S.S2 = (t) => { useSet('night'); hideAll(); night.neon.visible = false;
  const rise = ease(t, .35, 1.3, k => back(k) * .98 + k * .02); const wk = Math.max(0, t - 2.9); const x = .3 - wk * .9;
  const pose = t < 2.9 ? keys(t, [[1.4, 'stand'], [1.95, 'stand'], [2.2, 'armsUp'], [2.6, 'armsUp'], [2.85, 'stand']]) : walk(wk * .9, 0, { aR: [0, -2.6, .35] });
  applyPose(shade, pose, t, { mood: t < 2.0 ? 'calm' : t < 2.9 ? 'happy' : 'sly', open: ease(t, 1.4, 1.6), look: t < 1.9 ? ease(t, 1.55, 1.85) : -1, finger: t > 3.0 }, 3);
  placeShade(shade, { x, z: night.wallZ + .02, rise: clamp(rise), len: 1.15, yaw: 0, turn: t < 2.9 ? 0 : -Math.PI / 2, scale: 1.05 });
  const [jx, jy] = hh(t, .02); cam(.3 + jx, 1.15 + jy, lerp(3.6, 3.3, ease(t, 0, 4)), .3, 1.0, -2.1, 32);
  FX = { fy: .5, fw: .26, bloom: .35 };
  return () => narr(t, 2.4, 4.0, 'I only noticed in the morning.', { y: 1520, size: 72 });
};
// 3. Кухня: у кота и чайника есть тень, у меня — нет
S.S3 = (t) => { useSet('kitchen'); hideAll();
  const hiss = ease(t, 1.15, 1.35) * (1 - ease(t, 4.6, 5)); poseCat(kitchen.cat, t, hiss);
  // пар над чайником — его тень бежит по стене
  kitchen.steam.forEach((m, i) => { const ph = (t * .45 + i / kitchen.steam.length) % 1; m.position.set(1.27 + Math.sin(ph * 6 + i) * .06 + ph * .12, 1.24 + ph * .9, -1.35 + Math.cos(ph * 5 + i) * .03); m.scale.setScalar(.6 + ph * 2.2); m.material.opacity = .5 * (1 - ph); const sh = kitchen.steamSh[i]; sh.position.set(m.position.x + .55 + ph * .1, m.position.y - .28, -1.675); sh.scale.setScalar(.7 + ph * 3.2); sh.material.opacity = .85 * Math.sin(Math.PI * Math.min(1, ph * 1.2)); });
  const pose = keys(t, [[0, 'phone'], [1.5, 'phone'], [1.85, { ...POSE.phone, headX: .55, aL: [.3, .3, .6] }], [3.0, 'scared']]);
  heroAt(-.25, .3, 0, pose, t, { expr: t < 1.25 ? 'calm' : 'scared', lookX: t > 1.2 && t < 1.7 ? 1 : 0, lookY: t > 1.7 ? -1 : -.3, mouth: t > 3 ? .6 : 0, wide: t > 2.9 }, { phoneOn: t < 3 });
  const push = ease(t, 2.85, 3.1); const [jx, jy] = hh(t, .02);
  cam(lerp(.5, -.25, push) + jx, lerp(1.5, 1.12, push) + jy, lerp(5.8, 1.85, push), lerp(.5, -.27, push), lerp(.72, 1.05, push), 0, lerp(38, 32, push));
  FX = { fy: lerp(.55, .4, push), fw: .3, warm: .08, bloom: .25 };
  return () => { const tick = (p, t0, ok) => { const k = spring(t, t0, 3, 7); if (k <= 0 || push > .5) return; const [sx, sy] = p; ctx.save(); ctx.translate(sx, sy); ctx.scale(k, k); ctx.fillStyle = ok ? '#34c06a' : '#ff4a4a'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(0, 0, 44, 0, 7); ctx.fill(); ctx.stroke(); ctx.lineCap = 'round'; ctx.lineWidth = 11; ctx.beginPath(); if (ok) { ctx.moveTo(-20, 0); ctx.lineTo(-6, 16); ctx.lineTo(20, -16); } else { ctx.moveTo(-15, -15); ctx.lineTo(15, 15); ctx.moveTo(15, -15); ctx.lineTo(-15, 15); } ctx.stroke(); ctx.restore(); };
    tick(toScreen(1.8, .05, -.1), .55, true); tick(toScreen(1.25, 1.45, -1.35), 1.0, true); tick(toScreen(.15, .05, .8), 2.6, false);
    narr(t, .25, 2.75, 'The cat has one. The kettle has one.', { y: 1300, size: 70, n: 17, accent: ['cat', 'kettle'] });
    narr(t, 2.95, 5.2, 'I don’t.', { y: 1320, size: 110, accent: ['don’t'] }); };
};
// письмо на стене коридора (общая функция для S4/S6)
const LET1 = ['I QUIT.'], LET2 = ['26 years following you,', 'and you never', 'go anywhere.'], PS = [];
const paintLetter = (t, t0, psT0 = 1e9) => hall.paint(c => {
  handLines(c, LET1, { x: 400, y: 140, size: 118, reveal: (t - t0) * 16, drips: ease(t, t0 + .8, t0 + 2.5), seed: 1 });
  handLines(c, LET2, { x: 400, y: 265, size: 64, lh: 1.0, reveal: (t - t0 - .9) * 24, drips: ease(t, t0 + 2.5, t0 + 4), seed: 5, rot: -.03 });
  handLines(c, ['FUCK THIS.'], { x: 400, y: 575, size: 132, reveal: (t - t0 - 2.6) * 12, drips: ease(t, t0 + 2.9, t0 + 4.2) * 1.6, seed: 7, rot: -.07 });
  if (t > t0 + 3.2) { c.save(); c.globalAlpha = clamp((t - t0 - 3.2) * 4); c.fillStyle = '#0a0910'; c.translate(400, 600); c.rotate(-.07); c.fillRect(-300, 0, 600 * clamp((t - t0 - 3.2) * 3), 12); c.restore(); }
  handLines(c, ['— your Shadow'], { x: 330, y: 720, size: 74, reveal: (t - t0 - 3.9) * 10, seed: 9, rot: -.08 });
  if (t > t0 + 3.7) { c.save(); c.globalAlpha = clamp((t - t0 - 3.7) * 5); handPrint(c, 590, 700, .95, -.22, '#0a0910'); c.restore(); }
});
// 4. Письмо: УВОЛЬНЯЮСЬ (со спины → лицо)
S.S4 = (t) => { useSet('hall'); hideAll(); paintLetter(t, .2);
  if (t < 5.3) {
    heroAt(.75, 1.1, Math.PI + .25, keys(t, [[0, 'stand'], [2.2, 'stand'], [2.6, { ...POSE.scared, headX: -.25 }]]), t, { expr: 'scared' });
    const [jx, jy] = hh(t, .015); cam(.15 + jx, 1.55 + jy, lerp(4.4, 4.0, ease(t, 0, 5.3)), .0, 2.0, -1.5, 40);
    FX = { fy: .4, fw: .3, blur: 5 };
  } else { const tt = t - 5.3;
    heroAt(.75, 1.1, .25, { ...POSE.scared, headX: -.3 }, t, { expr: 'sad', lookY: .8, mouth: .35 + talk(t, 4.6, 5.4) * 0 });
    cam(.82, 1.0, 2.35, .78, 1.13, 1.1, 32); FX = { fy: .42, fw: .25, blur: 9 }; }
  return () => { if (t > 5.3) narr(t, 5.45, 7.0, '…what the fuck.', { y: 1330, size: 80, who: 'SAM' }); };
};
// 5. Миниатюра: дом → работа → дом, 9 490 раз
S.S5 = (t) => { useSet('loop'); hideAll();
  const prog = clamp(t / 2.6) ** 2.1; const laps = prog * 9 + (t > 2.6 ? (t - 2.6) * .3 : 0); const a = laps * Math.PI * 2 + Math.PI;
  const m = loop.mini; m.root.position.set(Math.cos(a) * 1.8, 0, Math.sin(a) * 1.12); m.root.rotation.y = -a; applyPose(m, walk(laps * 9, 1), t, { expr: 'calm' }, 4);
  const ang = t * .12; cam(Math.sin(ang) * 12.5, 12, Math.cos(ang) * 12.5, 0, .2, 0, 30);
  FX = { fy: .5, fw: .12, blur: 12, bloom: .2 };
  const cnt = Math.round(prog * 9490);
  return () => { ctx.textAlign = 'center'; ctx.save(); ctx.globalAlpha = ease(t, 0, .3); ctx.font = '800 64px Unb'; ctx.lineWidth = 14; ctx.strokeStyle = '#140a1e'; ctx.lineJoin = 'round'; ctx.strokeText('HOME → WORK → HOME', 540, 330); ctx.fillStyle = '#fff'; ctx.fillText('HOME → WORK → HOME', 540, 330); ctx.restore();
    const s = cnt >= 1000 ? Math.floor(cnt / 1000) + ' ' + String(cnt % 1000).padStart(3, '0') : String(cnt);
    ctx.font = '900 150px Unb'; ctx.lineWidth = 22; ctx.strokeStyle = '#140a1e'; ctx.strokeText(s, 540, 1520); ctx.fillStyle = '#fff'; ctx.fillText(s, 540, 1520);
    ctx.font = '800 46px Unb'; ctx.lineWidth = 10; ctx.strokeText('TIMES · ONE ROUTINE', 540, 1600); ctx.fillStyle = '#ffd36a'; ctx.fillText('TIMES · ONE ROUTINE', 540, 1600);
    stamp(t, 2.7, 'BORING', { y: 900, size: 140 }); if (t > 2.7 && t < 2.9) { ctx.fillStyle = `rgba(255,255,255,${(2.9 - t) * 2})`; ctx.fillRect(0, 0, 1080, 1920); } };
};
// 6. P.S. → рука просвечивает → таймер
S.S6 = (t, T) => { useSet('hall'); hideAll(); paintLetter(t + 10, .2, .2 + 10);
  if (t < 4.9) { heroAt(5, 5, 0, POSE.stand, t, {}, { show: false });
    cam(.0, 1.6, lerp(3.6, 3.3, ease(t, 0, 4.9)), .0, 1.7, -1.5, 36); FX = { fy: .5, fw: .5, blur: 12 };
    return () => { ctx.fillStyle = 'rgba(10,6,20,.35)'; ctx.fillRect(0, 0, 1080, 1920); psNote(t, .05, 4.65); }; }
  const tt = t - 4.9; const pose = { ...POSE.stand, aL: [1.35, .35, 1.25], headX: .15, headY: -.15 };
  heroAt(0, .4, -.15, pose, t, { expr: 'scared', lookX: -.5, lookY: .2, wide: true, mouth: .3 }, {});
  // растворение кисти
  fadeHand(hero.aL.el, ease(tt, .3, 2.2));
  const hp = worldOf(hero.aL.hand), hd = worldOf(hero.head); const mid = hp.clone().lerp(hd, .45); cam(mid.x - .45, mid.y + .05, mid.z + 1.35, mid.x, mid.y, mid.z, 34);
  FX = { fy: .45, fw: .2, blur: 10, bloom: .3, warm: -.06 };
  return () => { const [sx, sy] = toScreen(hp.x, hp.y + .03, hp.z); sparkles(t, sx, sy - 60, ease(tt, .3, 2)); sunHud(tt, T, { t0: .3, y: 330 }); narr(t, 5.05, 7.0, 'My fingers are see-through.', { y: 1560, size: 66, accent: ['see-through.'] }); };
};
// экран телефона: крыша с танцующей тенью рисуется прямо в прямоугольник экрана (второй рендер после основного)
const scrCam = new THREE.PerspectiveCamera(34, .51, .05, 200);
const bigPhone = new THREE.Group(); const body = new THREE.Group(); bigPhone.add(body);
body.add(mesh(G.rbox(.42, .8, .04, .045), clay('#14151c', { roughness: .25 }))); const bigScr = mesh(G.plane(.39, .77), new THREE.MeshBasicMaterial({ color: '#050508' }), false, false); bigScr.position.z = .021; body.add(bigScr);
const skinU = () => new THREE.MeshStandardMaterial({ color: LOOK.senya.skin, roughness: .82 });
const holdL = new THREE.Group(); bigPhone.add(holdL); // левая рука держит телефон (большой палец слева спереди, пальцы справа)
const thumbL = mesh(G.cap(.06, .14), skinU()); thumbL.position.set(-.23, -.14, .035); thumbL.rotation.z = -.5; holdL.add(thumbL);
[-.12, 0, .12, .23].forEach(y => { const f = mesh(G.cap(.045, .08), skinU()); f.rotation.z = Math.PI / 2; f.position.set(.235, y - .12, -.01); holdL.add(f); });
const palmL = mesh(G.sph(.2), skinU()); palmL.scale.set(1, 1.2, .5); palmL.position.set(-.04, -.36, -.09); holdL.add(palmL); const sleeveL = mesh(G.cap(.17, .45), clay(LOOK.senya.top)); sleeveL.position.set(-.1, -.8, -.12); holdL.add(sleeveL);
const tapR = new THREE.Group(); bigPhone.add(tapR); // правая рука листает — она просвечивает
const fingR = mesh(G.cap(.043, .16), skinU()); fingR.position.set(0, .1, 0); tapR.add(fingR); const fistR = mesh(G.sph(.12), skinU()); fistR.scale.set(1, .9, .8); fistR.position.set(.02, -.06, -.02); tapR.add(fistR);
const sleeveR = mesh(G.cap(.15, .4), clay(LOOK.senya.top)); sleeveR.position.set(.12, -.42, -.06); sleeveR.rotation.z = .5; tapR.add(sleeveR);
scene.add(bigPhone); bigPhone.visible = false;
const BIG = [{ aL: [0, 2.7, .2], aR: [0, -2.7, .2], crouch: .02 }, { aL: [.2, .3, 2.2], aR: [1.5, -.2, .1], crouch: .14, lean: .2, lL: [.9, .3] }, { aL: [0, 1.5, .1], aR: [0, -1.5, .1], crouch: .2, lL: [-.6, .2], lR: [.6, .2] }, { aL: [1.4, .2, 1.9], aR: [-.8, -.4, .3], twist: .5, lR: [.8, .6] }];
const bigDance = (t, sp = 1.8) => { const k = t * sp, i = Math.floor(k) % 4; return { pose: keys(k % 1, [[0, BIG[i]], [.5, BIG[(i + 1) % 4]]]), turn: i === 2 ? (k % 1) * Math.PI * 2 : 0, hop: i === 0 ? Math.sin((k % 1) * Math.PI) * .25 : 0 }; };
function screenRect() { const c = [[-.195, .385], [.195, -.385]].map(([x, y]) => { const v = new THREE.Vector3(x, y, .022).applyMatrix4(bigScr.matrixWorld).project(camera); return [(v.x + 1) / 2 * 1080, (1 - v.y) / 2 * 1920]; });
  return { x: Math.min(c[0][0], c[1][0]), y: Math.min(c[0][1], c[1][1]), w: Math.abs(c[1][0] - c[0][0]), h: Math.abs(c[1][1] - c[0][1]) }; }
function drawFeed(t) { bigPhone.updateMatrixWorld(true); const r = screenRect(); const vis = [hero.root.visible, bigPhone.visible]; hero.root.visible = false; bigPhone.visible = false;
  useSet('club'); club.update(t); const d = bigDance(t); applyPose(shade, d.pose, t, { mood: 'happy' }, 3); placeShade(shade, { x: 0, z: club.wallZ + .03, rise: 1, scale: 1.1, turn: d.turn, op: 1 }); shade.holder.position.y = .35 + d.hop; shade.holder.visible = true;
  scrCam.aspect = r.w / r.h; scrCam.updateProjectionMatrix(); scrCam.position.set(0, 1.45, 3.6); scrCam.lookAt(0, 1.25, -2); scene.updateMatrixWorld(true); renderer.render(scene, scrCam);
  ctx.save(); ctx.beginPath(); ctx.roundRect(r.x, r.y, r.w, r.h, r.w * .1); ctx.clip(); ctx.drawImage(renderer.domElement, 0, 0, 720, 1280, r.x, r.y, r.w, r.h); ctx.restore(); feedUI(t, r);
  hero.root.visible = vis[0]; bigPhone.visible = vis[1]; return r; }
// 7. Видео в трендах (телефон в левой руке, правая просвечивает) → «Ну всё, сука.» → рывок
S.S7 = (t) => {
  if (t < 4.2) { useSet('hall'); hideAll(); bigPhone.visible = true; bigPhone.position.set(noise(3, t) * .01, 1.42 + noise(4, t) * .01, .8); bigPhone.rotation.set(0, 0, 0); fadeHand(holdL, .85);
    const sw = (t * .9) % 1; tapR.position.set(.08 + sw * .02, lerp(-.3, -.05, sm(clamp(sw * 1.6))), .09); tapR.rotation.set(-.2, 0, -.25);
    cam(.0, 1.46, 2.75 - ease(t, 0, 4.2) * .15, 0, 1.44, .8, 34); FX = { fy: .5, fw: .3, blur: 9, bloom: .15 };
    return () => { const r = drawFeed(t); const tp = worldOf(thumbL); const [sx, sy] = toScreen(tp.x, tp.y, tp.z); sparkles(t, sx, sy + 60, 1); const tp2 = worldOf(palmL); const [sx2, sy2] = toScreen(tp2.x, tp2.y, tp2.z); sparkles(t + .4, sx2, sy2, 1); narr(t, .3, 4.2, 'An hour later, the internet found it.', { y: 250, size: 60, n: 20, accent: ['internet'] }); void r; }; }
  bigPhone.visible = false; const tt = t - 4.2; useSet('day'); hideAll(); day.follow(0); day.bus.position.x = -30;
  const run = ease(tt, .9, 1.3); const hx = -3 + Math.max(0, tt - .9) * 4;
  const holdPose = { ...POSE.stand, aL: [.9, .2, 1.9], headX: .3 };
  const pose = tt < .9 ? keys(tt, [[0, holdPose], [.5, holdPose], [.85, { ...POSE.stand, crouch: .08, lean: .2, aL: [-.5, .2, 1.4], aR: [.6, -.2, 1.4] }]]) : walk(hx + 3, 1);
  heroAt(hx, 1.6, tt < .9 ? lerp(0, Math.PI / 2, ease(tt, .55, .9)) : Math.PI / 2, pose, t, { expr: 'determined', lookX: .6 }, { phoneLOn: tt < .6, sat: .9 });
  fadeHand(hero.aL.el, .9);
  cam(-2.6 + run * 1.5, 1.15, 3.9, -2.9 + run * 2.5, .95, 1.6, 34); FX = { fy: .43, fw: .25, blur: 8, bloom: .15 };
  return () => { if (tt > .9) speedLines(t, ease(tt, .9, 1.2)); narr(t, 4.35, 6.3, 'Alright, you little shit.', { y: 1330, size: 88, n: 14, who: 'SAM' }); };
};
// 8. Погоня: тень катается на борту автобуса; Сеня перепрыгивает ограждение
S.S8 = (t) => { useSet('day'); hideAll(); day.fence.position.x = 5.4;
  const hx = -.5 + t * 1.6; const camX = hx + .7; day.follow(camX, 0);
  const bx = -2.5 + t * 2.6; day.bus.position.set(bx, 0, -2.2); day.wheels.forEach(w => w.rotation.y = 0) ; day.wheels.forEach(w => { w.rotation.set(Math.PI / 2, -t * 10, 0); });
  const J0 = 3.5, J1 = 4.1; const jk = t > J0 && t < J1 ? (t - J0) / (J1 - J0) : -1;
  const pose = jk >= 0 ? { ...walk(0, 1), lL: [1.2, .3], lR: [.2, 1.6], aL: [.8, .6, .4], aR: [.8, -.6, .4], lean: .3, crouch: 0 } : walk(hx + .5, 1);
  heroAt(hx, 1.6, Math.PI / 2, pose, t, { expr: 'determined', mouth: .4 }, { sat: .82, alpha: .97 }); fadeHand(hero.aL.el, .9); hero.root.position.y = jk >= 0 ? Math.sin(jk * Math.PI) * .55 : 0;
  // тень на борту автобуса (серфинг)
  // тень на крыше автобуса: еле держится за передний край, её треплет ветром как флаг
  const fl = Math.sin(t * 11) * .5, jolt = t > 3.55 ? Math.exp(-(t - 3.55) * 4) * Math.sin((t - 3.55) * 16) * .35 : 0;
  applyPose(shade, { ...POSE.armsUp, aL: [0, 2.95, .05], aR: [0, -2.95, .05], lL: [fl * .9, .4 + fl * .3], lR: [-fl * .9, .4 - fl * .3], headX: -.2, headZ: Math.sin(t * 9) * .2, hipsZ: fl * .15 }, t, { mood: 'wide', look: 1 }, 3);
  const th = -1.38 + Math.sin(t * 13) * .08 + jolt, S8s = .8, gx = bx + .9, gy = 1.52, gz = -2.2 + .63;
  placeShade(shade, { x: gx + Math.sin(th) * 1.5 * S8s, y: gy - Math.cos(th) * 1.5 * S8s, z: gz, rise: 1, scale: S8s }); shade.holder.rotation.z = th;
  const [jx, jy] = hh(t, .03); cam(camX + jx, 1.35 + jy, 7.4, camX, .85, -.5, 40, -.07);
  FX = { fy: .52, fw: .26, blur: 7, bloom: .15, warm: .04 };
  return () => { if (jk > .95 && jk < 1.4) {} if (t > J1 && t < J1 + .5) { const [sx, sy] = toScreen(5.9, .02, 1.6); burst(t - J1, sx, sy, '#cfc0a8', 12); }
    narr(t, .3, 4.9, 'It rode other people’s buses…', { y: 330, size: 66, n: 18, accent: ['buses'] }); shadowSay(t, 1.2, 3.4, ['Catch me, loser!'], { y: 640, size: 92 }); shadowSay(t, 3.55, 4.95, ['Fuuuuck!'], { y: 640, size: 110 }); };
};
// танец по кругу (для танцоров, тени и Сени)
const DANCE = [{ aL: [0, 2.6, .3], aR: [0, -.4, .2], crouch: .05, hipsZ: .1 }, { aL: [.3, .6, 1.8], aR: [.3, -.6, 1.8], crouch: .1, lean: .1, lL: [.5, .6] }, { aL: [0, .4, .2], aR: [0, -2.6, .3], crouch: .05, hipsZ: -.1 }, { aL: [1.4, .2, .2], aR: [-.6, -.3, .2], twist: .4, lR: [.6, .4] }];
const dance = (t, ph = 0) => { const k = (t + ph) * 1.7; const i = Math.floor(k) % 4; return keys(k % 1, [[0, DANCE[i]], [.45, DANCE[(i + 1) % 4]]]); };
// 9. Площадь: тени танцоров + тень Сени без хозяина; Сеня врывается в круг
S.S9 = (t) => { useSet('plaza'); hideAll(); plaza.sun.position.set(6, 3.6, -.8); plaza.sun.target.position.set(0, 0, 0);
  const pos = [[-.5, -.5], [.55, -1.0], [1.35, -.35]]; plaza.dancers.forEach((d, i) => { d.root.visible = true; d.root.position.set(pos[i][0], 0, pos[i][1]); d.root.rotation.y = .1 - i * .1; applyPose(d, dance(t, i * .25), t, { expr: 'happy', mouth: .3 }, 10 + i); });
  plaza.crowd.forEach((d, i) => { d.root.visible = true; const a = -1 + i / 6 * 2; d.root.position.set(Math.sin(a) * 3.6, 0, -2.6 - Math.cos(a) * .6); d.root.rotation.y = -a * .5; d.root.scale.setScalar(.92);
    const up = Math.floor(t * 4 + i) % 2; applyPose(d, { ...POSE.stand, aL: [1.2, .1, up ? 1.4 : 1.0], aR: [1.2, -.1, up ? 1.4 : 1.0] }, t, { expr: 'happy', mouth: .25 }, 20 + i); });
  // тень Сени лежит на земле, как тени танцоров (той же длины и направления), и танцует без хозяина
  const sunYaw = Math.atan2(-6, .8); applyPose(shade, dance(t * 1.15, .6), t, { mood: 'happy' }, 3); placeShade(shade, { x: .95, z: .35, rise: 0, len: 1.7, yaw: sunYaw, turn: 0, op: 1 });
  const enter = ease(t, 1.1, 2.1, sm); const hx = lerp(-3.6, -1.6, enter);
  const pose = t < 2.1 ? walk(hx + 3.6, 1) : t < 2.5 ? keys(t, [[2.1, 'stand'], [2.4, { ...POSE.shrug }]]) : dance(t * .95, .1);
  heroAt(hx, .6, t < 2.1 ? Math.PI / 2 : .5, pose, t, { expr: t < 2.5 ? 'determined' : 'happy', mouth: t > 2.5 ? .5 : .2 }, { sat: .72, alpha: .92 }); fadeHand(hero.aL.el, .9);
  const [jx, jy] = hh(t, .02); cam(-.55 + jx, 2.2 + jy, lerp(8.6, 8.0, ease(t, 0, 5)), -.55, .55, -.5, 38);
  FX = { fy: .55, fw: .25, blur: 7, bloom: .12, warm: .05 };
  return () => { narr(t, .3, 4.9, '…danced with strangers’ shadows…', { y: 330, size: 66, n: 18, accent: ['shadows'] }); shadowSay(t, 2.7, 4.95, ['Watch and learn,', 'dumbass.'], { y: 1500, size: 84 }); };
};
// 10. Фонтан: бежит через струи, смеётся; руки уже прозрачные
S.S10 = (t, T) => { useSet('plaza'); hideAll(); plaza.sun.position.set(7, 4.6, -1); plaza.sun.target.position.set(0, 0, 0); plaza.dancers.forEach(d => d.root.visible = false); plaza.crowd.forEach(d => d.root.visible = false);
  const hx = 1.4 + t * 1.25; const pose = walk(hx * 1.1, 1);
  heroAt(hx, .55, Math.PI / 2, pose, t, { expr: 'happy', mouth: .8, smile: 1 }, { sat: .55, alpha: .88 }); fadeHand(hero.aL.el, 1);
  const sunYaw = Math.atan2(-7, 1); applyPose(shade, walk(hx * 1.1 + 3, 1), t, { mood: 'happy', look: 1 }, 3); placeShade(shade, { x: hx + 1.9, z: 1.0, rise: 0, len: 1.0, yaw: sunYaw, turn: Math.PI / 2 - sunYaw });
  // струи фонтана
  const M = new THREE.Matrix4(), c0 = plaza.fountain.position; for (let i = 0; i < plaza.N; i++) { const ph = (t * .55 + h1(i)) % 1, a = h1(i + 7) * Math.PI * 2, r = 2.1 * ph * (.8 + h1(i + 3) * .4);
    M.makeTranslation(c0.x + Math.cos(a) * r, .85 + Math.sin(ph * Math.PI) * 1.4 - ph * .4, c0.z + Math.sin(a) * r * .9); plaza.drops.setMatrixAt(i, M); } plaza.drops.instanceMatrix.needsUpdate = true; plaza.drops.visible = true;
  const [jx, jy] = hh(t, .025); cam(hx + .3 + jx, 1.55 + jy, 6.0, hx + .5, .8, -.3, 38);
  FX = { fy: .5, fw: .26, blur: 7, bloom: .25, warm: .03 };
  return () => { const [sx, sy] = toScreen(hx, .9, .55); if (Math.abs(hx - plaza.fountain.position.x) < 1.6) motesSplash(t, sx, sy); sunHud(t, T, { y: 330 }); narr(t, .4, 4.9, '…and for the first time in a year, I ran.', { y: 470, size: 64, n: 20, accent: ['ran.'] }); };
};
// 11. Крыша на закате: тень на парапете; Сеня почти прозрачный
S.S11 = (t, T) => { useSet('roof'); hideAll(); roof.vent.visible = true; roof.fill.intensity = 0; roofLife(t); roof.paint(() => {});
  const hx = lerp(-3.0, -.7, ease(t, 0, 1.7, sm)); const pose = t < 1.7 ? walk(hx + 3, 0, { lean: .25 }) : keys(t, [[1.7, 'tired'], [2.6, 'tired'], [3.0, 'stand'], [3.3, 'reach']]);
  heroAt(hx, -.3, t < 1.7 ? Math.PI / 2 : lerp(Math.PI / 2, .6, ease(t, 1.7, 2.6)), pose, t, { expr: t < 3 ? 'sad' : 'scared', mouth: Math.max(talk(t, 3.4, 4.6), t < 2.8 && t > 1.7 ? .5 : 0), lookX: .8 }, { sat: .25, alpha: .72 });
  applyPose(shade, keys(t, [[0, 'stand'], [3.5, 'stand'], [3.9, { ...POSE.stand, headZ: .25, headX: .15 }]]), t, { mood: t < 3.6 ? 'calm' : 'sad', look: -1 }, 3);
  placeShade(shade, { x: 1.0, y: .55, z: -2.2, rise: 1, scale: 1.0 });
  const [jx, jy] = hh(t, .02); cam(.15 + jx, 1.45 + jy, lerp(6.4, 6.0, ease(t, 0, 6)), .15, 1.05, -1.8, 40);
  FX = { fy: .5, fw: .26, blur: 7, bloom: .4, warm: .12 };
  return () => { sunRays(t); sunHud(t, T, { y: 330 }); narr(t, 3.3, 6.0, 'Come back. I’m fading.', { y: 1380, size: 76, who: 'SAM' }); };
};
// 12. Тень складывается в буквы → город → лицо
const VENT = (() => { const yaw = -.5, cx = 2.6 + Math.sin(yaw) * .62, cz = -.8 + Math.cos(yaw) * .62; return { yaw, cx, cz, nx: Math.sin(yaw), nz: Math.cos(yaw) }; })();
const ventLetters = (t, t0, fadeOut = 1) => roof.paint(c => { c.globalAlpha = fadeOut; handLines(c, ['You chased me', 'all day long.', 'Did you see the city?'], { x: 512, y: 210, size: 92, lh: 1.0, reveal: (t - t0) * 26, seed: 21, rot: -.03, drips: .4 }); c.globalAlpha = 1; });
S.S12 = (t) => { useSet('roof'); hideAll(); roof.vent.visible = true; roof.fill.intensity = 0; roof.paint(() => {}); roofLife(t);
  if (t < 2.4) { // тень с парапета обводит рукой город: «посмотри вокруг»
    const k = ease(t, .2, .8, sm);
    heroAt(-.7, -.3, .6, { ...POSE.stand, headX: -.1 }, t, { expr: 'sad', lookX: .8 }, { sat: .25, alpha: .72 }); fadeHand(hero.aL.el, 1);
    applyPose(shade, { ...POSE.stand, aR: [lerp(.1, .3, k), lerp(-.12, -1.9, k), .1], aL: [0, .12, .15], headY: lerp(0, -.3, k) }, t, { mood: 'calm', look: -1 }, 3);
    placeShade(shade, { x: 1.0, y: .55, z: -2.2, rise: 1, scale: 1.0, op: 1 });
    const [jx, jy] = hh(t, .02); cam(.15 + jx, 1.45 + jy, lerp(5.6, 5.2, ease(t, 0, 2.4)), .15, 1.1, -1.8, 40);
    FX = { fy: .5, fw: .26, blur: 7, bloom: .45, warm: .12 };
    return () => { sunRays(t); shadowSay(t, .3, 2.4, ['Look around.'], { y: 420, size: 110 }); }; }
  if (t < 6.9) { const tt = t - 2.4; // панорама: горы, река, облака, солнце
    heroAt(9, 9, 0, POSE.stand, t, {}, { show: false });
    cam(lerp(.8, -.6, ease(tt, 0, 4.5, sm)), 3.0, lerp(-1.2, -1.6, ease(tt, 0, 4.5)), lerp(-14, 6, ease(tt, 0, 4.5, sm)), -3, -60, 44);
    FX = { fy: .5, fw: .35, blur: 4, warm: .14, bloom: .6 };
    return () => { sunRays(t); shadowSay(t, 2.5, 6.9, ['You lived more today', 'than all year.'], { y: 420, size: 88 }); }; }
  heroAt(-.2, -1.0, Math.PI, { ...POSE.stand, headX: -.12 }, t, { expr: 'happy', smile: lerp(.2, 1, ease(t, 7.1, 7.8)), wide: true, lookY: .3 }, { sat: .35, alpha: 1 });
  cam(-.15, 1.12, -2.45, -.2, 1.06, -1.0, 32); FX = { fy: .42, fw: .25, blur: 9, warm: .16, bloom: .35 };
  return () => shadowSay(t, 7.0, 8.5, ['Work is work.', 'But get out. Mix it up.'], { y: 1520, size: 84 });
};
// жизнь крыши: облака плывут, птицы
function roofLife(t) { roof.clouds.forEach((c, i) => { c.position.x += 0; c.material.rotation = 0; c.position.x = c.userData.x0 ?? (c.userData.x0 = c.position.x); c.position.x = c.userData.x0 + t * (.6 + i * .15); });
  roof.birds.forEach((b, i) => { b.position.set(-6 + ((t * 1.2 + i * 2.1) % 14), 4 + h1(i) * 2 + Math.sin(t * 3 + i) * .1, -12 - i); b.rotation.set(0, 0, Math.sin(t * 12 + i) * .4); }); }
// лучи и блик от солнца (2D), если солнце в кадре
function sunRays(t) { const p = roof.sunDisk.position; const v = new THREE.Vector3(p.x, p.y, p.z).project(camera); if (v.z > 1) return; const sx = (v.x + 1) / 2 * 1080, sy = (1 - v.y) / 2 * 1920; if (sx < -400 || sx > 1480 || sy < -400 || sy > 2300) return;
  ctx.save(); ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + t * .05, w = .025 + h1(i) * .035, L = 800 + h1(i + 3) * 500; const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, L); g.addColorStop(0, 'rgba(255,220,160,.16)'); g.addColorStop(1, 'rgba(255,200,140,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.arc(sx, sy, L, a - w, a + w); ctx.fill(); }
  const dx = 540 - sx, dy = 960 - sy; [[.35, 60, 'rgba(255,180,120,.25)'], [.7, 30, 'rgba(255,120,180,.3)'], [1.2, 90, 'rgba(160,140,255,.15)'], [1.6, 40, 'rgba(255,230,160,.25)']].forEach(([k, r, c]) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(sx + dx * k, sy + dy * k, r, 0, 7); ctx.fill(); });
  ctx.restore(); }
// 13. Тень возвращается: ложится к пяткам — цвет волной
S.S13 = (t, T) => { useSet('roof'); hideAll(); roof.vent.visible = true; roof.fill.intensity = 3; roof.paint(() => {}); roofLife(t + 6);
  const CL = 2.0; const col = ease(t, CL, CL + .8);
  const rise = 1 - ease(t, 1.35, CL, sm); const wx = lerp(2.2, .0, ease(t, 0, 1.35, sm));
  const hp = t < CL ? keys(t, [[0, 'stand'], [1.0, { ...POSE.stand, headY: .4 }], [1.8, 'stand'], [2.3, { ...POSE.armsUp }], [2.9, 'stand']]) : keys(t, [[2.0, 'stand'], [2.3, 'armsUp'], [2.9, 'stand']]);
  heroAt(0, -1.0, 0, hp, t, { expr: t < CL ? 'surprised' : 'happy', smile: col, mouth: t > CL && t < 2.6 ? .7 : 0, lookX: t < 1.4 ? .8 : 0 }, { sat: lerp(.3, 1, col), alpha: lerp(.75, 1, col) });
  const shPose = t < 1.35 ? walk((2.2 - wx) * 1.2, 0) : hp;
  applyPose(shade, shPose, t, { mood: 'happy', look: -1 }, 3);
  placeShade(shade, { x: wx, z: -1.0, rise, len: 1.25, yaw: 0, turn: t < 1.35 ? -Math.PI / 2 : 0 });
  const [jx, jy] = hh(t, .02); cam(.25 + jx, 1.75 + jy, lerp(4.8, 4.4, ease(t, 0, 5.2)), .1, .55, -.6, 36);
  FX = { fy: .52, fw: .28, blur: 6, warm: .12, bloom: .35 + (t > CL && t < CL + .4 ? .6 : 0) };
  return () => { if (t > CL && t < CL + .35) { ctx.fillStyle = `rgba(255,240,210,${(CL + .35 - t) * 2.2})`; ctx.fillRect(0, 0, 1080, 1920); }
    if (t < CL + .2) sunHud(t, T, { y: 330, k: 1 - ease(t, CL, CL + .2) });
    if (t > 2.5) { ctx.fillStyle = `rgba(10,6,20,${.35 * ease(t, 2.5, 2.8)})`; ctx.fillRect(0, 0, 1080, 1920); } condNote(t, 2.55); };
};
// 14. Ладонь к ладони
S.S14 = (t) => { useSet('roof'); hideAll(); roof.vent.visible = true; roof.fill.intensity = 12; roof.paint(() => {});
  const C0 = 5.0; const k = ease(t, C0 + .15, C0 + .8, sm);
  const TX = Math.cos(VENT.yaw), TZ = -Math.sin(VENT.yaw); const P = [VENT.cx + TX * .02, .92, VENT.cz + TZ * .02];
  const hx = VENT.cx + VENT.nx * .45 + TX * .3, hz = VENT.cz + VENT.nz * .45 + TZ * .3;
  heroAt(hx, hz, VENT.yaw + Math.PI - .45, { ...POSE.stand, aR: [lerp(.1, 1.3, k), lerp(-.12, -.6, k), lerp(.15, .1, k)], headY: -.25 }, t, { expr: 'happy', smile: 1 }, {});
  applyPose(shade, { ...POSE.stand, aR: [lerp(.05, .35, k), lerp(-.12, -1.45, k), .1], headY: .2 }, t, { mood: 'happy', look: 1 }, 3);
  placeShade(shade, { x: VENT.cx + VENT.nx * .012 - TX * .22, z: VENT.cz + VENT.nz * .012 - TZ * .22, yaw: VENT.yaw, rise: 1, scale: 1.0, op: 1 });
  const cx = VENT.cx + VENT.nx * 5.2 - TX * 1.3, cz = VENT.cz + VENT.nz * 5.2 - TZ * 1.3; const [jx, jy] = hh(t, .015);
  cam(cx + jx, 1.3 + jy, cz, P[0] + TX * .1, .95, P[2] + TZ * .1, 36);
  FX = { fy: .5, fw: t < C0 ? .5 : .28, blur: t < C0 ? 12 : 6, warm: .12, bloom: .35 };
  return () => { if (t < C0 + .2) { ctx.fillStyle = `rgba(10,6,20,${.4 * (1 - ease(t, C0, C0 + .2))})`; ctx.fillRect(0, 0, 1080, 1920); } contract(t, 0, C0 - .1);
    const tb = t - C0 - .8; if (tb > 0 && tb < .5) { const [sx, sy] = toScreen(...P); burst(tb, sx, sy, '#fff2c8', 18); if (tb < .25) { ctx.fillStyle = `rgba(255,240,200,${(.25 - tb) * 1.6})`; ctx.fillRect(0, 0, 1080, 1920); } }
    if (!ALT) narr(t, C0 + .8, 6.4, 'Deal.', { y: 1400, size: 96, who: 'SAM' }); };
};
// 14b (альтернативная концовка): тень не отпускает руку — «ещё одно условие» → девушка-тень в клубе → «познакомь»
S.S14b = (t) => {
  const TX = Math.cos(VENT.yaw), TZ = -Math.sin(VENT.yaw);
  if (t < 2.6 || t >= 5.4) { useSet('roof'); hideAll(); roof.vent.visible = true; roof.fill.intensity = 12; roof.paint(() => {}); roofLife(t + 12);
    const tt = t < 2.6 ? t : t - 5.4; const late = t >= 5.4;
    const hx = VENT.cx + VENT.nx * .45 + TX * .3, hz = VENT.cz + VENT.nz * .45 + TZ * .3;
    const shake = !late && t < 1.2 ? Math.sin(t * 14) * .08 : 0;
    const hp = late && tt > 1.6 ? keys(tt - 1.6, [[0, { ...POSE.stand, aR: [1.3, -.6, .1], headY: -.25 }], [.35, { ...POSE.facepalm, headY: .4 }]]) : { ...POSE.stand, aR: [1.3 + shake, -.6, .1], headY: late ? .1 : -.25 + (t > 1.6 ? .35 : 0) };
    heroAt(hx, hz, VENT.yaw + Math.PI - .45, hp, t, { expr: late ? 'surprised' : t > 1.6 ? 'surprised' : 'happy', smile: late ? .5 : 1, mouth: talk(t, 1.8, 2.4) + (late ? talk(tt, 1.6, 2.6) : 0) }, {});
    applyPose(shade, { ...POSE.stand, aR: [.35 + shake, -1.45, .1], headY: .2 + (t > .4 && !late ? Math.sin(t * 2) * .15 : 0), headX: late ? .15 : 0, hipsZ: late ? Math.sin(tt * 3) * .06 : 0 }, t, { mood: late ? 'happy' : t > .4 ? 'sly' : 'happy', look: late ? 0 : -.6 }, 3);
    placeShade(shade, { x: VENT.cx + VENT.nx * .012 - TX * .22, z: VENT.cz + VENT.nz * .012 - TZ * .22, yaw: VENT.yaw, rise: 1, scale: 1.0, op: 1 });
    const cx = VENT.cx + VENT.nx * 4.4 - TX * 1.1, cz = VENT.cz + VENT.nz * 4.4 - TZ * 1.1; const [jx, jy] = hh(t, .015);
    cam(cx + jx, 1.25 + jy, cz, VENT.cx + TX * .05, 1.0, VENT.cz + TZ * .05, late ? 32 : 34);
    FX = { fy: .5, fw: .28, blur: 6, warm: .14, bloom: .35 };
    return () => { if (!late) { shadowSay(t, .4, 2.6, ['Oh. And…', 'one more term.'], { y: 420, size: 92 }); narr(t, 1.8, 2.6, '…what now?', { y: 1450, size: 76, who: 'SAM' }); }
      else { shadowSay(tt, .1, 1.6, ['Introduce me', 'to her owner.'], { y: 420, size: 92 }); narr(tt, 1.6, 3.1, '…deal. I guess.', { y: 1450, size: 76, who: 'SAM' });
        if (tt > .2) { const k = spring(tt, .2, 2, 7); ctx.save(); ctx.translate(540, 1660); ctx.rotate(-.06); ctx.scale(k * .9, k * .9); ctx.fillStyle = '#fbf3e2'; ctx.fillRect(-170, -70, 340, 140); ctx.fillStyle = '#e8333f'; ctx.font = '700 50px Cav'; ctx.textAlign = 'center'; ctx.fillText('Term #5:', 0, -12); ctx.fillStyle = '#0b0a12'; ctx.fillText('introduce me ♥', 0, 40); ctx.restore(); }
        heartsFloat(tt, 540, 900, .5); } }; }
  // воспоминание: клуб, девушка-тень танцует в луче
  const tt = t - 2.6; useSet('club'); hideAll(); club.update(t + 3); const d = bigDance(tt * .8, 1.3);
  applyPose(girlSh, { ...d.pose, hipsZ: Math.sin(tt * 4) * .15, headZ: Math.sin(tt * 4) * .1 }, t, { mood: 'happy' }, 7); placeShade(girlSh, { x: 0, z: club.wallZ + .03, rise: 1, scale: 1.25, turn: .9 * Math.sin(tt * 1.6), op: 1 }); girlSh.holder.position.y = .35;
  girlSh.tail.rotation.x = Math.sin(tt * 5) * .4; girlSh.skirt.scale.set(1 + Math.abs(Math.sin(tt * 4)) * .2, 1, 1 + Math.abs(Math.sin(tt * 4)) * .2);
  cam(lerp(.3, -.15, ease(tt, 0, 2.8)), 1.3, lerp(3.4, 3.0, ease(tt, 0, 2.8)), 0, 1.2, -2, 38);
  FX = { fy: .5, fw: .5, blur: 6, warm: .06, bloom: 0 };
  return () => { ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = 'rgba(255,90,170,.22)'; ctx.fillRect(0, 0, 1080, 1920); ctx.restore();
    const g = ctx.createRadialGradient(540, 960, 400, 540, 960, 1100); g.addColorStop(0, 'rgba(255,200,230,0)'); g.addColorStop(1, 'rgba(255,170,210,.55)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
    heartsFloat(tt, 540, 1300, 1); shadowSay(tt, .2, 2.8, ['That shadow at the club…', 'the ponytail… the moves…'], { y: 420, size: 74, glowC: 'rgba(255,220,240,.95)' }); };
};
function heartsFloat(t, x, y, k) { ctx.save(); for (let i = 0; i < 16; i++) { const ph = (t * .5 + h1(i)) % 1, hx = x + (h1(i + 2) - .5) * 900 + Math.sin(t * 2 + i) * 30, hy = y - ph * 900, s = (14 + h1(i + 4) * 22) * k;
  ctx.globalAlpha = (1 - ph) * .9 * k; ctx.fillStyle = i % 3 ? '#ff5a9a' : '#ffffff'; ctx.beginPath(); ctx.moveTo(hx, hy + s * .7); ctx.bezierCurveTo(hx - s * 1.4, hy - s * .4, hx - s * .8, hy - s * 1.4, hx, hy - s * .6); ctx.bezierCurveTo(hx + s * .8, hy - s * 1.4, hx + s * 1.4, hy - s * .4, hx, hy + s * .7); ctx.fill(); } ctx.restore(); }
// 15. Крючок: «ПРОФСОЮЗ ТЕНЕЙ. ЗАБАСТОВКА — ЗАВТРА»
S.S15 = (t) => { useSet('night'); hideAll(); night.neon.visible = true;
  const s2 = t < 2.0 ? 0 : (h1(Math.floor(t * 20)) > .35 || t > 2.5 ? 1 : 0); night.sign2.material.opacity = s2;
  const xs = [-2.5, -1.85, -1.2, 1.3, 1.9, 2.5, 3.1, -3.1]; crowdSh.forEach((s, i) => { s.holder.visible = true; const look = t < 1.6 ? (xs[i] < .2 ? 1 : -1) : -1;
    applyPose(s, i % 3 === 0 ? { ...POSE.stand, aL: [.5, .4, 1.9], aR: [.5, -.4, 1.9] } : i % 3 === 1 ? POSE.stand : { ...POSE.stand, aR: [0, -.2, 1.0], headZ: .1 }, t + i, { mood: t < 1.6 ? 'calm' : 'wide', look }, 30 + i);
    placeShade(s, { x: xs[i], z: night.wallZ + .02, rise: 1, scale: .85 + h1(i) * .2, turn: t < 1.6 ? (xs[i] < .2 ? .5 : -.5) : -.3 }); });
  const hx = lerp(-3.4, -1.0, ease(t, 0, 1.6, sm)); const pose = t < 1.6 ? walk(hx + 3.4, 0) : keys(t, [[1.6, 'stand'], [1.9, { ...POSE.stand, headX: -.15 }]]);
  heroAt(hx, 1.2, t < 1.6 ? Math.PI / 2 : lerp(Math.PI / 2, Math.PI * .85, ease(t, 1.6, 2.1)), pose, t, { expr: t < 1.7 ? 'calm' : 'scared', wide: t > 1.7 }, {});
  const dx = hx - night.lampX, dz = 1.2 - night.lampZ, yaw = Math.atan2(dx, dz);
  applyPose(shade, t < 2.6 ? pose : keys(t, [[2.6, 'stand'], [2.85, 'shrug']]), t, { mood: t < 2.6 ? 'calm' : 'sly', look: 1 }, 3);
  placeShade(shade, { x: hx, z: 1.2, rise: 0, len: 1.15 + Math.hypot(dx, dz) * .25, yaw, turn: (t < 1.6 ? Math.PI / 2 : Math.PI) - yaw });
  const [jx, jy] = hh(t, .02); cam(.2 + jx, 1.9 + jy, lerp(9.8, 9.0, ease(t, 0, 4.4)), .2, 1.55, -1.8, 40);
  FX = { fy: .45, fw: .3, blur: 6, bloom: .55, warm: -.04 };
  return () => narr(t, 2.8, 4.4, 'Tomorrow, they all leave.', { y: 1450, size: 80, accent: ['all'] });
};
// 16. Финальная плашка
S.S16 = (t) => { useSet('night'); hideAll(); renderer.setClearColor('#000'); FX = { skip: true };
  return () => { ctx.fillStyle = '#07060c'; ctx.fillRect(0, 0, 1080, 1920); const b = Math.abs(Math.sin(t * 1.3)) > .08 ? 1 : .1;
    ctx.save(); ctx.fillStyle = '#f4f8ff'; ctx.shadowColor = '#fff'; ctx.shadowBlur = 40; [-1, 1].forEach(s => { ctx.beginPath(); ctx.ellipse(540 + s * 80, 700, 52, 22 * b, s * -.15, 0, 7); ctx.fill(); }); ctx.restore();
    narr(t, .15, 4.5, 'So… do we help the Shadow get the girl?', { y: 1000, size: 72, n: 16, accent: ['girl?'] }); narr(t, 1.9, 4.5, 'Tell us in the comments 👇'.replace(' 👇', ''), { y: 1330, size: 60, n: 20, accent: ['comments'] }); heartsFloat(t, 540, 1700, .6);
    ctx.save(); ctx.globalAlpha = ease(t, .8, 1.2); ctx.textAlign = 'center'; ctx.font = '600 40px Unb'; ctx.fillStyle = '#bfb6d8'; ctx.fillText('SHADOW · episode 2 soon', 540, 1560); ctx.restore(); };
};

// ---- эффекты 2D ----
function burst(dt, x, y, color, n = 14) { const life = .5; if (dt < 0 || dt > life) return; const k = dt / life; ctx.save(); ctx.fillStyle = color; for (let i = 0; i < n; i++) { const a = i / n * 6.283 + i, v = 380 * (.5 + h1(i) * .7); ctx.globalAlpha = 1 - k; ctx.beginPath(); ctx.arc(x + Math.cos(a) * v * dt, y + Math.sin(a) * v * dt * .7 + 500 * dt * dt, 12 * (1 - k) + 2, 0, 7); ctx.fill(); } ctx.restore(); }
function sparkles(t, x, y, k) { if (k <= 0) return; ctx.save(); for (let i = 0; i < 30; i++) { const ph = (t * .8 + h1(i)) % 1; const px = x + (h1(i + 3) - .5) * 260 + Math.sin(t * 2 + i) * 20, py = y - ph * 420; ctx.globalAlpha = (1 - ph) * k; ctx.fillStyle = i % 3 ? '#cfe0ff' : '#ffffff'; ctx.translate(px, py); ctx.rotate(.785); ctx.fillRect(-6, -6, 12, 12); ctx.setTransform(2 / 3, 0, 0, 2 / 3, 0, 0); } ctx.restore(); }
function speedLines(t, k) { ctx.save(); ctx.strokeStyle = '#fff'; for (let i = 0; i < 40; i++) { const y = h1(i) * 1920, l = 200 + h1(i + 2) * 500, x = ((h1(i + 5) * 1600 - t * 4000) % 1600 + 1600) % 1600 - 260; ctx.globalAlpha = k * .6; ctx.lineWidth = 3 + h1(i + 9) * 6; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + l, y); ctx.stroke(); } ctx.restore(); }
function motesSplash(t, x, y) { ctx.save(); for (let i = 0; i < 26; i++) { const ph = (t * 2.2 + h1(i)) % 1; ctx.globalAlpha = (1 - ph) * .9; ctx.fillStyle = '#eaf8ff'; ctx.beginPath(); ctx.arc(x + (h1(i + 1) - .5) * 320 * ph, y - 200 * Math.sin(ph * 3) * h1(i + 2) + ph * 120, 7 * (1 - ph) + 2, 0, 7); ctx.fill(); } ctx.restore(); }

// ---- монтаж ----
export const ALT = window.ALT_END !== false; // по умолчанию — с альтернативной концовкой (решение 2026-11-23)
export const SHOTS = [['S1', 3.2], ['S2', 4.0], ['S3', 5.2], ['S4', 7.0], ['S5', 4.5], ['S6', 7.0], ['S7', 6.3], ['S8', 5.0], ['S9', 5.0], ['S10', 5.0], ['S11', 6.0], ['S12', 8.5], ['S13', 7.2], ['S14', 6.4], ...(ALT ? [['S14b', 8.5]] : []), ['S15', 4.4], ['S16', 4.5]];
const starts = []; let acc = 0; for (const [, d] of SHOTS) { starts.push(acc); acc += d; } export const TOTAL = acc;
const WIPES = [1, 6, 9, ALT ? 14 : 13].map(i => starts[i + 1]); // после S2, S7, S10, S14 (или S14b)
window.SCENE = { duration: TOTAL, fps: 30, width: W, height: H };
window.SHOT_STARTS = SHOTS.map(([id], i) => [id, starts[i]]);
let fontsOk = false;
window.renderFrame = async T => {
  if (!fontsOk) { await Promise.all(['800 40px Unb', '900 40px Unb', '600 40px Unb', '700 40px Cav'].map(f => document.fonts.load(f))); fontsOk = true; TEX_REDRAW.forEach(f => f()); }
  let i = SHOTS.length - 1; for (let j = 0; j < SHOTS.length; j++) if (T < starts[j] + SHOTS[j][1]) { i = j; break; }
  const t = T - starts[i]; FX = {};
  const over = S[SHOTS[i][0]](t, T);
  if (!FX.skip) { scene.updateMatrixWorld(true); try { renderer.render(scene, camera); } catch (e) { scene.traverse(o => { if (o.material) [].concat(o.material).forEach(m => m.needsUpdate = true); }); renderer.render(scene, camera); } }
  composite({ t: T, tilt: FX.skip ? 0 : 1, fy: FX.fy ?? .5, fw: FX.fw ?? .24, blur: FX.blur ?? 7, bloom: FX.bloom ?? 0, warm: FX.warm ?? 0, vign: .45, grain: .05 });
  over && over();
  for (const w of WIPES) { const k = (T - (w - .38)) / .76; if (k > 0 && k < 1) shadowWipe(sm(k), 1, true); }
};
