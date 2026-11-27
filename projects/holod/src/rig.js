// Персонажи из «костей-отрезков»: суставы считаются каждый кадр (IK рук и ног), отрезки — конусы между суставами.
// В тепловизоре важен силуэт и распределение тепла: глаза горячие, нос холодный, волосы и одежда прохладнее кожи.
import { THREE, tMat, mesh, G, V3, lerp, clamp, noise, sm } from './core.js';
const UP = V3(0, 1, 0), YAX = V3(0, 1, 0);
const segGeo = new THREE.CylinderGeometry(1, 1, 1, 14, 1, true); segGeo.translate(0, .5, 0);

export class Rig {
  constructor(layer = 0) { this.g = new THREE.Group(); this.segs = {}; this.balls = {}; this.mats = {}; this.layer = layer; }
  mat(name, o) { if (!this.mats[name]) this.mats[name] = tMat({ nz: .25, nzs: 9, fres: .6, heatK: 0, ...o }); return this.mats[name]; }
  addMesh(m) { m.layers.set(this.layer); this.g.add(m); return m; }
  seg(name, r1, r2, mat) { // r1 — у начала, r2 — у конца
    const geo = new THREE.CylinderGeometry(r2, r1, 1, 14, 1, false); geo.translate(0, .5, 0);
    const m = this.addMesh(mesh(geo, mat)); this.segs[name] = m; return m; }
  ball(name, r, mat, sx = 1, sy = 1, sz = 1) { const m = this.addMesh(mesh(G.sph(r, 18), mat)); m.scale.set(sx, sy, sz); this.balls[name] = m; return m; }
  put(name, a, b) { const m = this.segs[name]; const d = b.clone().sub(a); const L = d.length(); m.position.copy(a); m.quaternion.setFromUnitVectors(YAX, d.divideScalar(L || 1)); m.scale.y = L; }
  at(name, p) { this.balls[name].position.copy(p); }
}
// двухзвенное IK: плечо a, цель t, длины l1/l2, полюс pole (куда смотрит локоть/колено)
export function ik2(a, t, l1, l2, pole) {
  const d = t.clone().sub(a); let L = d.length(); const Lc = clamp(L, .02, (l1 + l2) * .999); d.normalize();
  const tt = a.clone().add(d.clone().multiplyScalar(Lc));
  const x = (l1 * l1 - l2 * l2 + Lc * Lc) / (2 * Lc); const h = Math.sqrt(Math.max(0, l1 * l1 - x * x));
  const pv = pole.clone().sub(d.clone().multiplyScalar(pole.dot(d))).normalize();
  return { mid: a.clone().add(d.multiplyScalar(x)).add(pv.multiplyScalar(h)), end: tt };
}
function frame(pos, yaw) { const f = V3(Math.sin(yaw), 0, Math.cos(yaw)), r = V3(-Math.cos(yaw), 0, Math.sin(yaw)); return { f, r, L: (x, y, z) => pos.clone().addScaledVector(r, x).addScaledVector(UP, y).addScaledVector(f, z) }; }
const rotAbout = (p, c, axis, ang) => p.clone().sub(c).applyAxisAngle(axis, ang).add(c);

// ---------- ЧЕЛОВЕК ----------
// look: { skin, cloth, legs, hair, cold:true (весь 4 °C), dress, longHair, device }
export function makeHuman(look = {}, layer = 0) {
  const R = new Rig(layer);
  const c = look.cold ? 4.1 : null;
  const M = (n, T, o = {}) => R.mat(n, { T: c ? c + (T - 33) * .45 : T, ...o, ...(look.cold ? { nz: 1.2, nzs: 6, fres: .05, ambK: 0 } : {}) });
  const skin = M('skin', 34.6), face = M('face', 35.3), eye = M('eye', 36.9, { nz: 0 }), nose = M('nose', 30.8), hair = M('hair', 27), cloth = M('cloth', look.cloth ?? 31.2), legs = M('legs', look.legs ?? 30.2), feet = M('feet', 27.5), hand = M('hand', 33.6);
  const sl = look.slim ? .78 : 1; R.sl = sl;
  R.seg('torso', .15 * sl, .17 * sl, cloth); R.seg('belly', .14 * sl, .15 * sl, cloth); R.seg('neck', .055, .05, skin);
  R.ball('head', .108, face, .95, 1.12, 1.02); R.ball('eyeL', .019, eye); R.ball('eyeR', .019, eye); R.ball('nose', .02, nose, 1, 1, 1.4); R.ball('hairCap', .113, hair, .98, .95, 1.03);
  if (look.longHair) R.ball('hairBack', .115, hair, 1.0, 1.3, .7);
  R.ball('chest', .17 * sl, cloth, 1.12, .8, .78); R.ball('pelvis', .145 * sl, legs, 1.15, .8, .8);
  for (const s of ['L', 'R']) {
    R.ball('sh' + s, .062 * sl, cloth); R.seg('ua' + s, .058 * sl, .048 * sl, look.short ? skin : cloth); R.ball('el' + s, .046 * sl, look.short ? skin : cloth); R.seg('fa' + s, .045 * sl, .034 * sl, look.short ? skin : cloth); R.ball('hand' + s, .045 * sl, hand, .8, 1.1, .55);
    R.seg('th' + s, .085, .062, legs); R.ball('kn' + s, .058, legs); R.seg('sn' + s, .055, .04, legs); R.seg('ft' + s, .04, .035, feet);
  }
  if (look.dress) R.seg('dress', .16, .23, cloth);
  if (look.device) { R.dev = R.addMesh(mesh(G.box(.13, .09, .17), R.mat('dev', { T: 32.5, nz: .1, fres: .3 }))); R.lens = R.addMesh(mesh(G.cyl(.032, .032, .03, 16), R.mat('lens', { T: 14, nz: 0, fres: .2 }))); }
  R.look = look; return R;
}
// P: pos (стопы), yaw, lean, headYaw, headPitch, walk (фаза), walkAmp, armL/armR (цели кистей или null), breath
export function poseHuman(R, P) {
  const { f, r, L } = frame(P.pos, P.yaw || 0); const s = P.scale || 1;
  const ph = P.walk || 0, wa = P.walkAmp || 0;
  const bob = Math.abs(Math.sin(ph)) * .025 * wa, br = Math.sin((P.t || 0) * 1.6) * .006;
  const hipC = L(0, .93 * s - bob, 0);
  const lean = P.lean || 0, ra = r.clone();
  const up = (y, x = 0, z = 0) => rotAbout(L(x, y * s - bob, z), hipC, ra, lean);
  const sw = .19 * (R.sl || 1) ** .5, chest = up(1.3 + br, 0, 0), neck0 = up(1.48 + br), sh = { L: up(1.44 + br, -sw), R: up(1.44 + br, sw) };
  const headC = up(1.62 + br, 0, .01);
  R.put('belly', hipC, up(1.15)); R.put('torso', up(1.12), up(1.42 + br)); R.at('chest', chest); R.at('pelvis', hipC);
  R.balls.chest.quaternion.setFromAxisAngle(ra, lean); R.balls.pelvis.quaternion.setFromAxisAngle(ra, lean * .3);
  // голова
  const hy = (P.yaw || 0) + (P.headYaw || 0), hp = (P.headPitch || 0) + lean;
  const hf = V3(Math.sin(hy) * Math.cos(hp), -Math.sin(hp), Math.cos(hy) * Math.cos(hp)), hr = V3(-Math.cos(hy), 0, Math.sin(hy)); if (P.headRoll) hr.applyAxisAngle(hf, P.headRoll); const hu = hr.clone().cross(hf);
  R.put('neck', neck0, headC.clone().addScaledVector(hu, -.06));
  R.at('head', headC); R.balls.head.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(hr.clone().negate(), hu, hf));
  const hp2 = (x, y, z) => headC.clone().addScaledVector(hr, x).addScaledVector(hu, y).addScaledVector(hf, z);
  R.at('eyeL', hp2(-.036, .018, .088)); R.at('eyeR', hp2(.036, .018, .088)); R.at('nose', hp2(0, -.012, .105));
  R.at('hairCap', hp2(0, .028, -.018)); R.balls.hairCap.quaternion.copy(R.balls.head.quaternion);
  if (R.balls.hairBack) { R.at('hairBack', hp2(0, -.1, -.075)); R.balls.hairBack.quaternion.copy(R.balls.head.quaternion); }
  if (R.dev) { const dp = hp2(.0, -.03, .2); R.dev.position.copy(dp); R.dev.quaternion.copy(R.balls.head.quaternion); R.lens.position.copy(hp2(.0, -.03, .29)); R.lens.quaternion.setFromUnitVectors(YAX, hf); }
  // руки
  for (const sd of ['L', 'R']) {
    const sx = sd === 'L' ? -1 : 1, a = sh[sd];
    const swing = Math.sin(ph + (sd === 'L' ? 0 : Math.PI)) * .18 * wa;
    let tgt = P['arm' + sd] || a.clone().addScaledVector(r, sx * .06).addScaledVector(UP, -.56 * s).addScaledVector(f, .06 + swing);
    const pole = r.clone().multiplyScalar(sx * .5).addScaledVector(f, -.8).addScaledVector(UP, -.4);
    const k = ik2(a, tgt, .29 * s, .27 * s, pole);
    R.at('sh' + sd, a); R.put('ua' + sd, a, k.mid); R.at('el' + sd, k.mid); R.put('fa' + sd, k.mid, k.end);
    R.at('hand' + sd, k.end.clone().addScaledVector(k.end.clone().sub(k.mid).normalize(), .05));
    R.balls['hand' + sd].quaternion.setFromUnitVectors(YAX, k.end.clone().sub(k.mid).normalize());
  }
  // ноги: фаза шага от пройденного пути
  for (const sd of ['L', 'R']) {
    const sx = sd === 'L' ? -1 : 1, p2 = ph + (sd === 'L' ? 0 : Math.PI);
    const hip = L(sx * .095, .93 * s - bob, 0);
    const fz = Math.sin(p2) * .28 * wa, lift = Math.max(0, Math.cos(p2)) * .1 * wa;
    const ank = L(sx * .1, .08 + lift, fz);
    const k = ik2(hip, ank, .45 * s, .43 * s, f.clone());
    R.put('th' + sd, hip, k.mid); R.at('kn' + sd, k.mid); R.put('sn' + sd, k.mid, k.end); R.put('ft' + sd, k.end, k.end.clone().addScaledVector(f, .17).add(V3(0, -.05, 0)));
  }
  if (R.segs.dress) R.put('dress', up(1.02), hipC.clone().add(V3(0, -.5 * s, 0)));
  return { headC, hf, hr, hu, hp2, chest };
}

// ---------- СОБАКА ----------
export function makeDog(layer = 0) {
  const R = new Rig(layer);
  const M = (n, T, o = {}) => R.mat(n, { T, ...o });
  const fur = M('fur', 27.2, { nz: .9, nzs: 16, fres: .75 }), chestM = M('chest', 31.4, { nz: .6, nzs: 12, fres: .7 }), head = M('head', 30.4, { nz: .5, nzs: 16, fres: .7 }), eye = M('eye', 38.2, { nz: 0 }), nose = M('nose', 21.5, { nz: 0 }),
    mouth = M('mouth', 36.8, { nz: .1 }), ear = M('ear', 34.2, { fres: .5 }), leg = M('leg', 25.6, { nz: .6, nzs: 14, fres: .75 }), paw = M('paw', 23.4), tail = M('tail', 24.8, { fres: .8 });
  R.ball('chest', .17, chestM, 1, 1.05, 1.2); R.ball('belly', .15, chestM, 1, .95, 1.1); R.ball('hips', .15, fur, 1, 1, 1.05);
  R.seg('back', .16, .14, fur); R.seg('neck', .1, .085, fur);
  R.ball('head', .1, head, 1, .95, 1.1); R.seg('snout', .062, .045, head); R.seg('jaw', .045, .032, mouth); R.ball('nose', .03, nose, 1.1, .85, 1); R.ball('snTip', .046, head, 1, .9, 1); R.ball('mouthIn', .04, mouth, 1, .7, 1.5);
  R.ball('eyeL', .017, eye); R.ball('eyeR', .017, eye);
  R.seg('earL', .028, .042, ear); R.seg('earR', .028, .042, ear);
  for (const s of ['FL', 'FR', 'BL', 'BR']) { R.seg('u' + s, .05, .04, leg); R.ball('j' + s, .038, leg); R.seg('l' + s, .036, .028, leg); R.ball('p' + s, .035, paw, 1, .6, 1.3); if (s[0] === 'B') { R.seg('m' + s, .04, .032, leg); R.ball('h' + s, .032, leg); } }
  for (let i = 0; i < 4; i++) R.seg('tail' + i, .035 - i * .005, .03 - i * .005, tail);
  return R;
}
// P: pos, yaw, t, walk, walkAmp, growl 0…1 (голова ниже, передние лапы шире), bark 0…1 (пасть открыта, рывок), headYaw, wag, look (наклон головы)
export function poseDog(R, P) {
  const { f, r, L } = frame(P.pos, P.yaw || 0); const t = P.t || 0, g = P.growl || 0, bk = P.bark || 0, ph = P.walk || 0, wa = P.walkAmp || 0;
  const br = Math.sin(t * (2.2 + g * 3)) * (.006 + g * .006), trem = g * noise(7, t * 18) * .004;
  const bob = Math.abs(Math.sin(ph)) * .02 * wa;
  const chestP = L(trem, .5 - g * .05 + br - bob, .26 - g * .03 + bk * .02), hipP = L(0, .5 - g * .015 - bob, -.3), bellyP = L(0, .43 - g * .04 + br, -.03);
  R.at('chest', chestP); R.at('hips', hipP); R.at('belly', bellyP); R.put('back', hipP.clone().add(V3(0, .03, 0)), chestP.clone().add(V3(0, .03, 0)));
  const hy = (P.yaw || 0) + (P.headYaw || 0);
  const hf = V3(Math.sin(hy), 0, Math.cos(hy)), hr = V3(-Math.cos(hy), 0, Math.sin(hy));
  const pitch = g * .35 - bk * .25 + (P.look || 0);
  const hfp = hf.clone().multiplyScalar(Math.cos(pitch)).add(V3(0, -Math.sin(pitch), 0)).normalize();
  const hu = hr.clone().cross(hfp);
  const neckBase = L(0, .58 - g * .07, .32);
  const headC = neckBase.clone().addScaledVector(hf, .15 + bk * .03 + g * .04).add(V3(0, .2 - g * .19 + bk * .03, 0));
  R.put('neck', neckBase, headC);
  R.at('head', headC); R.balls.head.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(hr.clone().negate(), hu, hfp));
  const hp = (x, y, z) => headC.clone().addScaledVector(hr, x).addScaledVector(hu, y).addScaledVector(hfp, z);
  const sn0 = hp(0, -.02, .06), sn1 = hp(0, -.035, .21);
  R.put('snout', sn0, sn1); R.at('snTip', sn1.clone().addScaledVector(hfp, -.02)); R.at('nose', sn1.clone().addScaledVector(hfp, .012).addScaledVector(hu, .01));
  const jo = bk * .55 + g * .08; const jdir = hfp.clone().applyAxisAngle(hr, -jo).normalize();
  R.put('jaw', hp(0, -.06, .05), hp(0, -.06, .05).addScaledVector(jdir, .15));
  R.at('mouthIn', hp(0, -.055 - jo * .04, .11)); R.balls.mouthIn.scale.set(1, .4 + jo * 1.6, 1.4);
  R.at('eyeL', hp(-.045, .035, .075)); R.at('eyeR', hp(.045, .035, .075));
  const earBack = g * .6; // прижатые уши при рычании
  for (const [s, sx] of [['L', -1], ['R', 1]]) { const e0 = hp(sx * .07, .07, -.01); R.put('ear' + s, e0, e0.clone().addScaledVector(hr, sx * (.05 + earBack * .02)).addScaledVector(hu, -.13 + earBack * .04).addScaledVector(hfp, -.01 - earBack * .05)); } // висячие уши
  // лапы
  const legs = { FL: [-1, .26, 0], FR: [1, .26, Math.PI], BL: [-1, -.3, Math.PI], BR: [1, -.3, 0] };
  for (const [s, [sx, z, po]] of Object.entries(legs)) {
    const p2 = ph + po, fz = Math.sin(p2) * .16 * wa, lift = Math.max(0, Math.cos(p2)) * .07 * wa;
    const spread = s[0] === 'F' ? g * .05 : 0;
    const top = L(sx * .08, s[0] === 'F' ? .44 - g * .05 : .46, z);
    const pawP = L(sx * (.085 + spread), .03 + lift, z + fz + (s[0] === 'F' ? g * .05 : -g * .03));
    if (s[0] === 'F') { const k = ik2(top, pawP, .2, .24, f.clone().negate()); R.put('u' + s, top, k.mid); R.at('j' + s, k.mid); R.put('l' + s, k.mid, k.end); R.at('p' + s, k.end.clone().addScaledVector(f, .03)); }
    else { const hock = pawP.clone().add(V3(0, .15, 0)).addScaledVector(f, -.07); const k = ik2(top, hock, .2, .17, f.clone()); R.put('u' + s, top, k.mid); R.at('j' + s, k.mid); R.put('m' + s, k.mid, hock); R.at('h' + s, hock); R.put('l' + s, hock, pawP); R.at('p' + s, pawP.clone().addScaledVector(f, .03)); }
    R.balls['p' + s].quaternion.setFromAxisAngle(UP, P.yaw || 0);
  }
  // хвост: при рычании — поджат и напряжён, иначе виляет
  let prev = L(0, .55, -.42); const wag = (P.wag ?? (1 - g)) * Math.sin(t * 9) * .5;
  for (let i = 0; i < 4; i++) { const a = -.6 + g * 1.4 + i * (.25 - g * .2); const dir = f.clone().multiplyScalar(-Math.cos(a)).add(V3(0, Math.sin(-a) * -1, 0)).addScaledVector(r, Math.sin(wag * (i + 1) * .5) * .5).normalize(); const nx = prev.clone().addScaledVector(dir, .1); R.put('tail' + i, prev, nx); prev = nx; }
  return { headC, mouth: hp(0, -.05, .2), nose: sn1 };
}
