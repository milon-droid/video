// «SHADOW QUIT», серия 2 «The Date»: тень Sam влюбилась в тень Mia — свидание устраивают хозяева.
import { THREE, renderer, camera, composite, ctx, clamp, lerp, ease, sm, back, h1, noise, spring, G, clay, mesh, glow, skyTex, W, H, TEX_REDRAW } from './core.js';
import { makeToy, applyPose, walk, keys, POSE, makeShade, placeShade, setFade, LOOK, blendPose } from './toy.js';
import { scene, useSet, night, hall, day, makeCat, poseCat } from './sets.js';
import { cafe, front } from './cafe.js';
import { narr, shadowSay, stamp, shadowWipe, motes, rr } from './overlay.js';
import { build } from './ep2-lines.js';
import DURS from './ep2-durs.json';
import TEXT from './ep2-text.json';

// ---- реплики: время из общего монтажа ----
const { AT, starts, TOTAL, shots: SHOTS } = build(DURS);
const line = id => [AT[id], AT[id] + DURS[id]];
let SHOT0 = 0; // начало текущего плана (глобально)
const talkG = (T, ...ids) => { for (const id of ids) { const [a, b] = line(id); if (T > a && T < b) return clamp(.45 + .55 * Math.sin((T - a) * 16) * Math.sin((T - a) * 5.1 + 1)); } return 0; };
const lt = id => (id in AT ? AT[id] : 1e4) - SHOT0; // время реплики в координатах плана
const wrapS = (s, n = 20) => { const o = []; let c = ''; for (const w of s.split(' ')) { if ((c + ' ' + w).trim().length > n && c) { o.push(c); c = w; } else c = (c + ' ' + w).trim(); } if (c) o.push(c); return o; };
const kind = id => TEXT[id][0] === 'shadow2_en' || TEXT[id][0] === 'mshadow_en' ? 's' : TEXT[id][0] === 'narrator_en' ? 'n' : 'p';
const NEXT = {}; { const ids = Object.keys(AT).sort((x, y) => AT[x] - AT[y]); ids.forEach((id, i) => { const nx = ids.slice(i + 1).find(j => kind(j) === kind(id)); NEXT[id] = nx ? AT[nx] : 1e9; }); }
function drawLines(T, opt = {}) {
  for (const id in AT) { const [a, b] = line(id); const [role, text] = TEXT[id]; const o = opt[id] || {}; if (o.hide) continue; const t1 = Math.min(b + (o.hold ?? .35), NEXT[id] - .06);
    if (T < a - .05 || T > t1) continue;
    if (role === 'shadow2_en') shadowSay(T, a, t1, o.lines || wrapS(text, o.n || 20), { y: o.y ?? 400, size: o.size ?? 84 });
    else if (role === 'mshadow_en') shadowSay(T, a, t1, o.lines || wrapS(text, o.n || 20), { y: o.y ?? 400, size: o.size ?? 90, glowC: 'rgba(255,190,225,.95)' });
    else if (role === 'narrator_en') { if (o.show) narr(T, a, t1, text, { y: o.y ?? 1450, size: 64, n: 20 }); }
    else narr(T, a, t1, text, { y: o.y ?? 1460, size: o.size ?? 68, n: o.n ?? 18, who: role === 'mia_en' ? 'MIA' : 'SAM', accent: o.accent || [], color: role === 'mia_en' ? '#ffe4f0' : '#fff' }); }
}

// ---- герои ----
const hero = makeToy(LOOK.senya, { uniq: true }); scene.add(hero.root);
const GIRL = { skin: '#f2c9ad', hair: '#3a2018', top: '#e8508a', top2: '#c03a6a', pants: '#2a2e44', shoes: '#ffffff', hood: false, eye: '#1a1210', blush: .6 };
const mia = makeToy(GIRL, { uniq: true }); scene.add(mia.root);
{ const hm = clay(GIRL.hair); const tl = new THREE.Group(); mia.head.add(tl); tl.position.set(0, .16, -.14); [[0, 0, 0, .1], [0, -.1, -.09, .085], [0, -.21, -.13, .072], [0, -.32, -.14, .058]].forEach(([x, y, z, r]) => { const m = mesh(G.sph(r, 12), hm); m.position.set(x, y, z); tl.add(m); }); mia.tail = tl;
  const sk = mesh(new THREE.ConeGeometry(.26, .3, 20, 1, true), clay('#2a2e44')); sk.position.y = -.12; mia.hips.add(sk);
  const bow = mesh(G.sph(.045, 10), clay('#ffd36a')); bow.scale.set(1.6, .8, .8); bow.position.set(0, .16, -.17); mia.head.add(bow); }
const shade = makeShade(); scene.add(shade.holder);
const miaSh = makeShade({ female: true }); scene.add(miaSh.holder);
// аксессуары тени: цилиндр и бабочка (чёрные, сплющиваются вместе с тенью)
const ink = new THREE.MeshBasicMaterial({ color: '#05050a', transparent: true, opacity: .92 });
const hat = new THREE.Group(); hat.add(mesh(G.cyl(.3, .3, .03, 24), ink, false, false)); { const tp = mesh(G.cyl(.17, .18, .34, 24), ink, false, false); tp.position.y = .18; hat.add(tp); } hat.position.set(0, .26, 0); hat.rotation.z = -.12; shade.head.add(hat);
const tie = new THREE.Group(); [-1, 1].forEach(s => { const w = mesh(new THREE.ConeGeometry(.07, .12, 12), ink, false, false); w.rotation.z = s * Math.PI / 2; w.position.x = s * .06; tie.add(w); }); tie.add(mesh(G.sph(.03, 8), ink, false, false)); tie.position.set(0, .36, .16); shade.spine.add(tie);
// цветок в руке Sam
const flower = new THREE.Group(); { const st = mesh(G.cyl(.008, .008, .3, 6), clay('#3a8a4a')); st.position.y = .12; flower.add(st); [[0, .29, 0], [.03, .27, .02], [-.03, .27, .02], [0, .27, -.03]].forEach(([x, y, z]) => { const p = mesh(G.sph(.035, 10), clay('#ff4a6a')); p.position.set(x, y, z); flower.add(p); }); flower.position.set(0, -.06, .03); hero.aR.hand.add(flower); }
const barista = cafe.barista; const tray = cafe.tray;

const V = new THREE.Vector3();
const toScreen = (x, y, z) => { V.set(x, y, z).project(camera); return [(V.x + 1) / 2 * 1080, (1 - V.y) / 2 * 1920]; };
const wpos = o => { o.updateWorldMatrix(true, false); return o.getWorldPosition(new THREE.Vector3()); };
function cam(px, py, pz, lx, ly, lz, fov = 34, roll = 0) { camera.fov = fov; camera.updateProjectionMatrix(); camera.position.set(px, py, pz); camera.up.set(0, 1, 0); camera.lookAt(lx, ly, lz); if (roll) camera.rotateZ(roll); }
const hh = (t, amp = .02, seed = 1) => [noise(seed, t * .8) * amp, noise(seed + 5, t * .7) * amp];
function put(T, x, z, yaw, pose, t, face = {}, y = 0, seed = 1) { T.root.visible = true; T.root.position.set(x, y, z); T.root.rotation.set(0, yaw, 0); applyPose(T, pose, t, face, seed); }
// поцелуй теней: лицом друг к другу, руки обнимают, головы сближены, глаза прикрыты
function kissPair(t, cx, y, z, { sc = 1.0, gap = .11, dip = 0 } = {}) {
  const P = { ...POSE.stand, aL: [1.25, .55, 1.3], aR: [1.25, -.55, 1.3], lean: .2, headX: -.05, headZ: .12 };
  applyPose(shade, P, t, { mood: 'happy', look: 1, open: .12 }, 3); applyPose(miaSh, { ...P, lean: .14 - dip * .7, headX: -.3, headZ: -.1, aL: [1.1, .4, 1.6], aR: [1.1, -.4, 1.6], lL: [dip * .5, dip * .6] }, t, { mood: 'happy', look: -1, open: .12 }, 7);
  placeShade(shade, { x: cx - gap, z: z + .004, rise: 1, scale: sc, turn: Math.PI / 2, op: 1 }); placeShade(miaSh, { x: cx + gap + dip * .05, z, rise: 1, scale: sc, turn: -Math.PI / 2, op: 1 });
  shade.holder.position.y = y; miaSh.holder.position.y = y - dip * .1; miaSh.tail.rotation.x = -.6 - dip * .5 + Math.sin(t * 6) * .1; }
const hideAll = () => { if (typeof catHat !== 'undefined') { catHat.visible = false; pix2.g.visible = false; } miaSh.aL.sh.scale.y = 1; cafe.cupS.visible = false; cafe.cupM.rotation.z = 0; cafe.cupM.position.set(.06, .44, cafe.TZ + .1); cafe.spill.visible = false;  shade.aR.sh.scale.y = 1; if (typeof sunDisc !== 'undefined') sunDisc.visible = false; [hero.root, mia.root].forEach(r => r.visible = false); shade.holder.visible = false; miaSh.holder.visible = false; hat.visible = false; tie.visible = false; flower.visible = false; };
setFade(hero, 1, 1, false); setFade(mia, 1, 1, false);
let FX = {};
// сидя: бёдра вперёд, колени вниз; SY — опускание корня до сиденья
const SY = -.135;
const SIT = { lL: [1.5, 1.35], lR: [1.5, 1.35], aL: [.7, .1, 1.3], aR: [.7, -.1, 1.3] };
const sit = (o = {}) => ({ ...SIT, ...o });

// ---- 2D-эффекты ----
function heart(x, y, s, col = '#ff5a9a') { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x, y + s * .7); ctx.bezierCurveTo(x - s * 1.4, y - s * .4, x - s * .8, y - s * 1.4, x, y - s * .6); ctx.bezierCurveTo(x + s * .8, y - s * 1.4, x + s * 1.4, y - s * .4, x, y + s * .7); ctx.fill(); }
function heartsFloat(t, x, y, k, spread = 900, n = 16) { ctx.save(); for (let i = 0; i < n; i++) { const ph = (t * .5 + h1(i)) % 1, hx = x + (h1(i + 2) - .5) * spread + Math.sin(t * 2 + i) * 30, hy = y - ph * 700, s = (14 + h1(i + 4) * 22) * k;
  ctx.globalAlpha = (1 - ph) * .9 * clamp(k); heart(hx, hy, s, i % 3 ? '#ff5a9a' : '#ffffff'); } ctx.restore(); }
// глаза-сердечки тени: поверх светящихся глаз
function heartEyes(sh, k, t) { if (k <= 0) return; sh.eyes.forEach(e => { const p = wpos(e.children[0]); const [x, y] = toScreen(p.x, p.y, p.z); const s = (26 + Math.sin(t * 12) * 4) * k; ctx.save(); ctx.shadowColor = '#ff8ab8'; ctx.shadowBlur = 20; heart(x, y + 6, s, '#ff4a8a'); ctx.restore(); }); }
function burst(dt, x, y, color, n = 14, v0 = 380) { const life = .55; if (dt < 0 || dt > life) return; const k = dt / life; ctx.save(); ctx.fillStyle = color; for (let i = 0; i < n; i++) { const a = i / n * 6.283 + i, v = v0 * (.5 + h1(i) * .7); ctx.globalAlpha = 1 - k; ctx.beginPath(); ctx.arc(x + Math.cos(a) * v * dt, y + Math.sin(a) * v * dt * .8, 12 * (1 - k) + 2, 0, 7); ctx.fill(); } ctx.restore(); }
function sparks(t, x, y, k) { if (k <= 0) return; ctx.save(); for (let i = 0; i < 18; i++) { const a = i / 18 * 6.283 + t * 2, r = 30 + ((t * 120 + h1(i) * 90) % 90); ctx.globalAlpha = k * (1 - r / 130); ctx.fillStyle = i % 2 ? '#fff6c8' : '#ffd36a'; ctx.save(); ctx.translate(x + Math.cos(a) * r, y + Math.sin(a) * r); ctx.rotate(.785); ctx.fillRect(-6, -6, 12, 12); ctx.restore(); } ctx.restore(); }
function notes(t, x, y, k) { if (k <= 0) return; ctx.save(); ctx.font = '700 64px Cav'; ctx.textAlign = 'center'; for (let i = 0; i < 4; i++) { const ph = (t * .9 + i / 4) % 1; ctx.globalAlpha = k * (1 - ph); ctx.fillStyle = '#07060c'; ctx.strokeStyle = 'rgba(255,240,215,.9)'; ctx.lineWidth = 8; const px = x + 40 + ph * 120 + Math.sin(ph * 9) * 14, py = y - ph * 170; ctx.strokeText(i % 2 ? '♪' : '♫', px, py); ctx.fillText(i % 2 ? '♪' : '♫', px, py); } ctx.restore(); }
function sweat(x, y, k) { if (k <= 0) return; ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = '#9ad8ff'; ctx.strokeStyle = '#1a3a5a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, y - 26); ctx.quadraticCurveTo(x + 18, y, x, y + 10); ctx.quadraticCurveTo(x - 18, y, x, y - 26); ctx.fill(); ctx.stroke(); ctx.restore(); }
function warmGlow(a, col = '255,170,90') { const g = ctx.createRadialGradient(540, 700, 200, 540, 900, 1200); g.addColorStop(0, `rgba(${col},0)`); g.addColorStop(1, `rgba(${col},${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920); }

// ===== ПЛАНЫ =====
const S = {};
// 1. ХУК: Sam струсил у двери кафе — его тень хватает его и вталкивает внутрь
S.S1 = (t, T) => { useSet('front'); hideAll(); flower.visible = true;
  const WZ = front.wallZ + .03, DX = front.doorX;
  const TURN = .45, GRAB = 1.2, PUSH = Math.max(2.4, lt('p2') + .1), IN = PUSH + .4;
  // Sam: мнётся у двери → разворачивается и уходит влево → рывок назад (тень тянет за капюшон) → толчок → влетает в дверь
  let x, z = -.6, yaw, pose, face;
  const x1 = DX - .05 - (GRAB - TURN) * .8;
  if (t < TURN) { x = DX - .05; yaw = Math.PI * .9; pose = { ...POSE.stand, aR: [.3, -.1, 1.6], headX: .25, lean: -.05, headY: Math.sin(t * 8) * .1 }; face = { expr: 'scared', smile: 0, lookY: -.6 }; }
  else if (t < GRAB) { const d = (t - TURN) * .8; x = DX - .05 - d; yaw = lerp(Math.PI * .9, -Math.PI / 2, ease(t, TURN, TURN + .25)); pose = walk(d * 1.6, 0, { aR: [.4, -.1, 1.4] }); face = { expr: 'calm', smile: .2, lookX: -.3 }; }
  else if (t < PUSH) { const k = ease(t, GRAB + .15, PUSH - .2, sm); x = lerp(x1, DX - .35, k) + Math.exp(-(t - GRAB) * 9) * Math.sin((t - GRAB) * 30) * .04; yaw = -Math.PI / 2;
    pose = { ...POSE.stand, lean: -.4, crouch: .04, aL: [-.7, .6, .4], aR: [-.3, -.7, 1.2], lL: [-.3, .2], lR: [.25, .1], headX: -.2 }; face = { expr: 'surprised', mouth: .8, wide: true }; }
  else { const k = ease(t, PUSH, IN + .15, sm); x = lerp(DX - .35, DX + .02, k); z = lerp(-.6, -1.25, ease(t, PUSH + .1, IN + .3)); yaw = lerp(-Math.PI / 2, Math.PI, ease(t, PUSH, PUSH + .12)); pose = { ...walk(k * 3, 1), lean: .45, aL: [1.4, .4, .2], aR: [1.2, -.5, .3] }; face = { expr: 'scared', mouth: .9, wide: true }; }
  const inside = t > IN + .3; if (!inside) put(hero, x, z, yaw, pose, t, face);
  front.door.rotation.y = -lerp(0, 1.5, ease(t, PUSH + .05, PUSH + .3)) * (1 - ease(t, IN + .5, IN + 1.0, sm));
  // тень (солнце слева — тень правее Sam): копирует → остаётся, вытягивает руку-резину, хватает → тащит → обегает и толкает двумя руками
  let sx, sPose, turn, mood = 'calm', stretch = 0;
  if (t < TURN) { sx = x + .85; sPose = pose; turn = Math.PI * .9 - Math.PI / 2; mood = 'calm'; }
  else if (t < GRAB) { sx = DX + .8; const k = ease(t, TURN + .2, GRAB, sm); sPose = { ...POSE.stand, aR: [lerp(.1, 1.55, k), -.05, .05], lean: k * .15, headY: -.3 }; turn = -Math.PI / 2; mood = 'angry'; stretch = k * (DX + .8 - .2 - x1) / .43; }
  else if (t < PUSH) { sx = DX + .8; const k = ease(t, GRAB + .15, PUSH - .2, sm); sPose = { ...POSE.stand, aR: [1.55, -.05, .05], lean: -.3, lL: [.35, .1], lR: [-.3, .1] }; turn = -Math.PI / 2; mood = 'angry'; stretch = (DX + .8 - .2 - lerp(x1, DX - .35, k)) / .43; }
  else { sx = lerp(DX + .8, DX + .1, ease(t, PUSH - .1, PUSH + .15)); sPose = { ...POSE.stand, aL: [1.5, .1, .1], aR: [1.5, -.1, .1], lean: .35, lL: [.5, .2], lR: [-.4, .2] }; turn = -Math.PI / 2; mood = 'angry'; }
  applyPose(shade, sPose, t, { mood: t > IN ? 'happy' : mood, look: -1 }, 3);
  shade.aR.sh.scale.y = Math.max(1, stretch * 1.4);
  placeShade(shade, { x: inside ? DX + .1 : sx, z: WZ, rise: 1, scale: 1.15, turn: t > IN + .3 ? 0 : turn, op: 1 });
  shade.holder.position.y = -.02;
  const [jx, jy] = hh(t, .03); const pk = spring(t, PUSH, 2.5, 6) * .12;
  cam(DX + .2 + jx, 1.15 + jy, lerp(5.4, 4.9, ease(t, 0, 4.2)) - pk, DX + .25, .9, -1.2, 36, -.03 + pk * .2);
  FX = { fy: .5, fw: .3, blur: 6, bloom: .2, warm: .06 };
  return () => { if (t > GRAB && t < GRAB + .5) { const [bx, by] = toScreen(x + .1, 1.0, z); burst(t - GRAB, bx, by, '#07060c', 10, 300); }
    if (t > IN && t < IN + .55) { const [bx, by] = toScreen(DX, 1.0, WZ); burst(t - IN, bx, by, '#ffd36a', 16, 420); }
    if (t > IN + .4) { const [ex, ey] = toScreen(DX + .1, 1.5, WZ); heartsFloat(t - IN, ex, ey, .5, 300, 6); }
    drawLines(T, { p1: { y: 1440 }, p2: { y: 380, size: 110, n: 14 } }); };
};
// H. ХОЛОДНОЕ НАЧАЛО: на стене кафе тени целуются взасос, а хозяева сидят деревянно и не смотрят друг на друга
S.H = (t, T) => { useSet('cafe'); hideAll(); cafe.spill.visible = true; cafe.spill.scale.setScalar(1); cafe.cupM.rotation.z = -1.6;
  seatSam(t, sit({ aR: [.75, -.1, 1.4 + Math.max(0, Math.sin(t * 14)) * .15], headY: -.5, headX: .1 }), { expr: 'scared', smile: .1, lookX: -.9, lookY: .3, mouth: talkG(T, 'h1') });
  seatMia(t, sit({ aL: [.8, .3, 1.7], aR: [.8, -.3, 1.7], headY: .55, headX: -.1 }), { expr: 'calm', smile: .2, lookX: .9, lookY: .5, mouth: talkG(T, 'h2') });
  kissPair(t, .05, .4, WZc, { sc: 1.0 });
  const RW = SHOTS.find(x => x[0] === 'H')[1] - .9; const rw = ease(t, RW, RW + .5);
  const [jx, jy] = hh(t, .012); cam(lerp(.0, .05, ease(t, 0, 4)) + jx, lerp(1.2, 1.3, ease(t, 0, 4)) + jy, lerp(3.6, 4.1, ease(t, 0, 4, sm)), .05, lerp(1.05, .95, ease(t, 0, 4)), -1.1, 36, rw * .05);
  FX = { fy: .4, fw: .35, blur: 6, warm: .12, bloom: .3 };
  return () => { const p = wpos(shade.head), q = wpos(miaSh.head); const [x1, y1] = toScreen((p.x + q.x) / 2, p.y, p.z); heartsFloat(t, x1, y1 - 30, .8, 300, 12);
    { const h = wpos(hero.head); const [hx, hy] = toScreen(h.x, h.y, h.z); sweat(hx - 70, hy - 70 + (t % 1) * 20, 1); }
    drawLines(T, { h1: { y: 1470, accent: ['making'] }, h2: { y: 1470 } });
    if (rw > 0) { ctx.save(); ctx.globalAlpha = rw * .5; for (let i = 0; i < 14; i++) { ctx.fillStyle = i % 2 ? '#fff' : '#000'; ctx.fillRect(0, ((i * 160 + t * 2400) % 1920), 1080, 14 + h1(i) * 30); } ctx.restore(); stamp(t, RW + .1, '◀◀ REWIND', { y: 900, size: 92, color: '#ffffff', rot: -.05 }); } };
};
// FB. ФЛЭШБЕК «LAST NIGHT»: тень увидела тень Mia — и трусливо удрала
S.FB = (t, T) => { nightDoor(1, false); hideAll();
  const W0 = night.wallZ + .02, RUN = lt('fb2') - .2;
  const gx = lerp(3.0, .6, ease(t, 0, 2.2, sm)) - Math.max(0, t - 3.0) * .6; put(mia, gx, 1.3, -Math.PI / 2, walk((3 - gx) * 1.6), t, { expr: 'happy', smile: 1 }, 0, 8); mia.tail.rotation.x = Math.sin(t * 6) * .25;
  applyPose(miaSh, t > 1.6 && t < 2.6 ? { ...POSE.wave } : walk((3 - gx) * 1.6), t, { mood: t > 1.6 ? 'sly' : 'happy', look: -1 }, 7); placeShade(miaSh, { x: gx + .3, z: W0, rise: 1, scale: 1.3, turn: t > 1.6 && t < 2.6 ? 0 : -Math.PI / 2, op: 1 });
  put(hero, -.9, .9, .3, POSE.stand, t, { expr: 'calm', lookX: .9 });
  const run = ease(t, RUN, RUN + 1.0, k => k); const sx = lerp(-.6, -4.0, run);
  applyPose(shade, t < RUN - .5 ? { ...POSE.stand, aR: [0, -2.4, .9] } : t < RUN ? { ...POSE.scared, lean: -.15 } : walk(run * 9, 1), t, { mood: t > RUN - .5 ? 'wide' : 'happy', look: 1 }, 3);
  placeShade(shade, { x: sx, z: W0 + .005, rise: 1, scale: 1.3, turn: t >= RUN ? -Math.PI / 2 : 0, op: 1 });
  const [jx, jy] = hh(t, .02); cam(-.1 + jx, 1.6 + jy, 7.2, -.1, 1.4, -1.8, 38);
  FX = { fy: .5, fw: .35, blur: 5, bloom: .3, warm: .15 };
  return () => { ctx.save(); ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = 'rgba(128,128,128,.75)'; ctx.fillRect(0, 0, 1080, 1920); ctx.restore(); ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = 'rgba(200,150,90,.6)'; ctx.fillRect(0, 0, 1080, 1920); ctx.restore();
    if (t > RUN) { ctx.save(); ctx.strokeStyle = '#fff'; for (let i = 0; i < 14; i++) { const p = wpos(shade.head); const [x, y] = toScreen(p.x, p.y, p.z); ctx.globalAlpha = .6 * (1 - run); ctx.lineWidth = 4; const yy = y - 120 + i * 24; ctx.beginPath(); ctx.moveTo(x + 60, yy); ctx.lineTo(x + 220 + h1(i) * 160, yy); ctx.stroke(); } ctx.restore(); }
    ctx.save(); ctx.font = '800 44px Unb'; ctx.textAlign = 'center'; ctx.fillStyle = '#f6efe0'; ctx.fillText('LAST NIGHT', 540, 330); ctx.restore();
    drawLines(T, { fb1: { y: 1470 }, fb2: { y: 1470, accent: ['bitch'] } }); };
};
// SS. Поиск: тень тащит Sam вдоль улицы и проверяет тени на стенах — хвост кота Пикселя, метла — и хвостик в окне кафе
const pixel = makeCat(); pixel.g.traverse(o => { if (o.isMesh) o.castShadow = true; }); pixel.g.scale.setScalar(1.1); pixel.g.position.set(-5.05, 0, -.95); pixel.g.rotation.y = .5; front.g.add(pixel.g);
const broom = new THREE.Group(); { const st = mesh(G.cyl(.018, .018, 1.2, 8), clay('#b07a4a')); st.position.y = .6; broom.add(st); const br = mesh(new THREE.ConeGeometry(.13, .28, 12), clay('#d8b860')); br.position.y = .1; broom.add(br); broom.position.set(-3.75, 0, -1.08); broom.rotation.z = -.32; broom.traverse(o => { if (o.isMesh) o.castShadow = true; }); front.g.add(broom); }
const winSil = mesh(G.plane(2.1, 1.4), new THREE.MeshBasicMaterial({ transparent: true, map: (() => { const c = document.createElement('canvas'); c.width = 420; c.height = 280; const g = c.getContext('2d');
  g.fillStyle = 'rgba(20,12,16,.85)'; g.beginPath(); g.arc(250, 120, 34, 0, 7); g.fill(); g.beginPath(); g.ellipse(214, 112, 16, 34, .9, 0, 7); g.fill(); g.beginPath(); g.ellipse(196, 140, 12, 26, .5, 0, 7); g.fill();
  g.beginPath(); g.moveTo(215, 160); g.quadraticCurveTo(250, 145, 290, 160); g.lineTo(305, 280); g.lineTo(200, 280); g.fill(); g.fillStyle = 'rgba(255,200,120,.0)';
  const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; return tx; })() }), false, false);
winSil.position.set(-1.7, 1.25, -1.265); front.g.add(winSil);
S.SS = (t, T) => { useSet('front'); hideAll();
  const s2 = lt('s2'), s3 = lt('s3'), s4 = lt('s4');
  // путь: идут → стоп у кота → идут → стоп у метлы → идут → стоп у окна
  const P = [[0, -6.9], [s2 - .2, -5.55], [s2 + 1.2, -5.55], [s3 - .2, -4.2], [s3 + 1.1, -4.2], [s4 - .2, -2.55], [99, -2.55]];
  let X = P[0][1], moving = false, dist = 0; for (let i = 1; i < P.length; i++) { if (t < P[i][0]) { const k = (t - P[i - 1][0]) / (P[i][0] - P[i - 1][0]); X = lerp(P[i - 1][1], P[i][1], i % 2 ? sm(clamp(k)) : 0) + (i % 2 ? 0 : 0); if (i % 2 === 0) X = P[i - 1][1]; moving = i % 2 === 1; break; } }
  dist = X + 6.9;
  put(hero, X, -.55, moving ? Math.PI / 2 : Math.PI / 2 - .5, moving ? { ...walk(dist * 1.6, .3), aR: [.9, -.6, .2], lean: -.1 } : { ...POSE.stand, aR: [.7, -.5, .2], headY: .3 }, t, { expr: 'scared', smile: .1, lookX: .6 });
  // тень впереди на стене, тянет Sam за руку; на остановках осматривает чужую тень
  const look = !moving; const sx = X + .75;
  applyPose(shade, moving ? { ...walk(dist * 1.6, .5), lean: .3, aL: [-1.3, .2, .1] } : { ...POSE.stand, lean: .25, headX: .2, aL: [-1.0, .2, .2], aR: t > s4 - .2 ? [1.5, -.2, .05] : [.6, -.3, 1.8] }, t, { mood: t > s4 ? 'happy' : look ? 'sly' : 'angry', look: 1 }, 3);
  placeShade(shade, { x: sx, z: front.wallZ + .03, rise: 1, scale: 1.15, turn: Math.PI / 2, op: 1 }); shade.holder.position.y = -.02;
  poseCat(pixel, t, t > s2 + .4 && t < s2 + 1.2 ? .8 : 0);
  const [jx, jy] = hh(t, .02); cam(X + .55 + jx, 1.15 + jy, 4.6, X + .55, .85, -1.2, 36);
  FX = { fy: .5, fw: .3, blur: 6, bloom: .2, warm: .06 };
  return () => { if (t > s4 && t < s4 + 2) { const [wx, wy] = toScreen(-1.55, 1.3, -1.26); heartsFloat(t - s4, wx, wy, .6, 260, 8); ctx.save(); ctx.globalAlpha = ease(t, s4, s4 + .3) * (.6 + .4 * Math.sin(t * 8)); ctx.strokeStyle = '#ffd36a'; ctx.lineWidth = 8; ctx.beginPath(); ctx.ellipse(wx, wy, 140, 120, 0, 0, 7); ctx.stroke(); ctx.restore(); }
    drawLines(T, { s1: { y: 380 }, s2: { y: 380, size: 96 }, s3: { y: 380 }, s4: { y: 380, size: 100 } }); };
};
// 2. Коридор, утро: на стене записка «Term #5» + «DUE TODAY»; тень стучит по ней
let paintedS2 = false;
function paintNote(c, stampK) { const x = 400, y = 320, w = 360, h = 250; c.save(); c.translate(x, y); c.rotate(-.06); c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(-w / 2 + 10, -h / 2 + 12, w, h); c.fillStyle = '#fbf3e2'; c.fillRect(-w / 2, -h / 2, w, h);
  c.fillStyle = 'rgba(255,236,170,.85)'; c.fillRect(-35, -h / 2 - 16, 70, 30); c.textAlign = 'center'; c.fillStyle = '#e8333f'; c.font = '700 54px Cav'; c.fillText('Term #5:', 0, -60); c.fillStyle = '#0b0a12'; c.font = '700 44px Cav'; c.fillText('introduce me ♥', 0, -8);
  if (stampK > 0) { c.save(); c.translate(0, 64); c.rotate(-.08); c.globalAlpha = stampK; c.font = '900 34px Unb'; const tw = c.measureText('DUE TODAY').width; const bw = Math.min(w - 40, tw + 36); const sc = Math.min(1, (bw - 30) / tw);
    c.strokeStyle = '#e8333f'; c.lineWidth = 6; c.strokeRect(-bw / 2, -30, bw, 60); c.fillStyle = '#e8333f'; c.textBaseline = 'middle'; c.save(); c.scale(sc, 1); c.fillText('DUE TODAY', 0, 2); c.restore(); c.restore(); }
  c.restore(); }
// 2. Утро: Sam троллит тень за вчерашний побег — тень ломается и стесняется
S.S2 = (t, T) => { useSet('hall'); hideAll(); hall.paint(() => {});
  const b10 = lt('b10'), b11 = lt('b11'), b12 = lt('b12');
  put(hero, -.55, .55, .35, keys(t, [[0, { ...POSE.stand, aL: [.5, .3, 1.8] }], [b10, { ...POSE.stand, aR: [1.4, -.2, .1], lean: .1, headZ: .1 }], [b10 + 1.6, { ...POSE.stand, aL: [.9, .3, 2.0], aR: [.9, -.3, 2.0], lean: -.1 }], [b12, { ...POSE.stand, aL: [.6, .4, 2.3], aR: [.6, -.4, 2.3], headZ: -.15 }]]), t,
    { expr: 'happy', smile: 1, lookY: .8, lookX: .4, mouth: Math.max(talkG(T, 'b10', 'b12'), t > b10 + 1.5 && t < b11 ? .5 + .4 * Math.sin(t * 18) : 0) });
  // тень: смущённо ковыряет пол ногой, руки за спиной, голова вниз; на «crush» отворачивается
  const shy = { ...POSE.stand, aL: [-.5, .2, 1.4], aR: [-.5, -.2, 1.4], headX: .35, headZ: .15, lL: [.15 + Math.max(0, Math.sin(t * 5)) * .25, .4], lean: .1 };
  applyPose(shade, t < .3 ? POSE.stand : t < b11 ? keys(t, [[.3, { ...POSE.stand, aL: [.3, .5, 1.8], aR: [.3, -.5, 1.8] }], [1.2, shy]]) : t < b12 + .3 ? shy : { ...shy, headY: -1.0, aL: [.9, .3, 2.3], aR: [.9, -.3, 2.3] }, t, { mood: 'sad', look: -1 }, 3);
  placeShade(shade, { x: .45, z: -1.47, rise: 1, scale: 1.1, turn: t > b12 + .3 ? -.5 : 0, op: 1 }); shade.holder.position.y = 0;
  const [jx, jy] = hh(t, .02); cam(lerp(.2, 0, ease(t, 0, 7)) + jx, 1.5 + jy, lerp(5.0, 4.4, ease(t, 0, 7)), 0, 1.35, -1.4, 34);
  FX = { fy: .4, fw: .3, blur: 6, warm: .08, bloom: .15 };
  return () => { const p = wpos(shade.head); const [x, y] = toScreen(p.x, p.y, p.z);
    if (t > b11) { ctx.save(); ctx.globalAlpha = .85; ctx.fillStyle = '#ff6a9a'; [-1, 1].forEach(sd => { ctx.beginPath(); ctx.ellipse(x + sd * 34, y + 18, 18, 8, 0, 0, 7); ctx.fill(); }); ctx.restore(); sweat(x + 70, y - 50, 1); }
    if (t > b12) heartsFloat(t - b12, x, y - 40, .5, 220, 6);
    drawLines(T, { b9: { y: 700, size: 96 }, b10: { y: 1480, n: 19 }, b11: { y: 680, n: 20 }, b12: { y: 1480, n: 19, accent: ['crush'] } }); };
};
// 2b. Ответка: Term #5 — Sam негодует, тень посылает
S.S2B = (t, T) => { useSet('hall'); hideAll();
  const sk = ease(t, lt('b4') - .1, lt('b4') + .1); const nk = t > lt('b13') + .2; hall.paint(c => { if (nk) paintNote(c, sk > 0 ? 1 : 0); }); // карточка на холсте стены
  put(hero, -.55, .55, .35, keys(t, [[0, { ...POSE.stand, headX: -.15 }], [lt('b3'), { ...POSE.stand, headX: -.25 }], [lt('b3') + .25, { ...POSE.shrug, aL: [.4, 1.2, 1.2], aR: [.4, -1.2, 1.2], lean: .1 }], [lt('b4'), { ...POSE.shrug }], [lt('b5'), { ...POSE.reach, aR: [1.2, -.4, .3] }], [lt('b6') + .4, { ...POSE.stand, headX: .2 }], [lt('b7') + .3, POSE.facepalm]]), t, { expr: t < lt('b4') + .3 ? 'angry' : t > lt('b7') ? 'sad' : 'calm', lookY: .8, lookX: .4, mouth: talkG(T, 'b3', 'b5') });
  // тень на стене: стучит пальцем по записке
  const tap = Math.max(0, Math.sin(t * 9)) * (t > .6 && t < 2.6 ? 1 : 0);
  applyPose(shade, keys(t, [[0, POSE.stand], [.5, { ...POSE.stand, aR: [0, -2.2, .7 + tap * .4] }], [2.6, { ...POSE.stand, aR: [0, -2.2, .7] }], [lt('b4'), { ...POSE.stand, aL: [.6, .9, 1.9], aR: [.6, -.9, 1.9], lean: .1 }]]), t, { mood: t > lt('b4') ? 'sly' : 'calm', look: -1, finger: t < 2.8 }, 3);
  placeShade(shade, { x: .45, z: -1.47, rise: 1, scale: 1.1, turn: 0, op: 1 }); shade.holder.position.y = 0;
  const [jx, jy] = hh(t, .02); cam(lerp(.2, 0, ease(t, 0, 5)) + jx, 1.5 + jy, lerp(5.0, 4.5, ease(t, 0, 5)), 0, 1.35, -1.4, 34);
  FX = { fy: .4, fw: .3, blur: 6, warm: .08, bloom: .15 };
  return () => { if (t > lt('b4') - .1 && t < lt('b4') + .5) { const [bx, by] = toScreen(.1, 1.75, -1.47); burst(t - lt('b4') + .1, bx, by, '#e8333f', 12, 260); } if (t > lt('b13') + .2 && t < lt('b13') + .7) { const [nx, ny] = toScreen(-.1, 2.6, -1.47); burst(t - lt('b13') - .2, nx, ny, '#fff6c8', 12, 300); }
    drawLines(T, { b13: { y: 660, n: 24, size: 76 }, b14: { y: 1480 }, b15: { y: 660, n: 24, size: 76 }, b3: { y: 1480, accent: ['five'] }, b4: { y: 700 }, b5: { y: 1480 }, b6: { y: 400, n: 22, size: 78 }, b7: { y: 420 } }); };
};
// 3. Тень примеряет цилиндр и бабочку; «Black is slimming»
S.S3 = (t, T) => { useSet('hall'); hideAll(); hall.paint(c => paintNote(c, 1));
  const c1 = lt('c1'), c2 = lt('c2'), c3 = lt('c5');
  hat.visible = t > c1 + .1 && t < c2 + .6 || t > c3 - .4; tie.visible = t > c2 + .9;
  const hk = spring(t, c1 + .1, 2.5, 6); hat.scale.setScalar(hat.visible ? clamp(hk, 0, 1.2) : 0);
  const pose = t < c2 ? keys(t, [[c1, POSE.stand], [c1 + .4, { ...POSE.stand, aR: [0, -2.8, 1.6], headZ: .2 }], [c1 + 1.2, { ...POSE.stand, aL: [.2, .6, 1.8], aR: [0, -2.6, 1.5], hipsZ: .15, headZ: -.15 }]])
    : t < c3 ? keys(t, [[c2, { ...POSE.stand, aL: [.2, .6, 1.8], aR: [0, -2.6, 1.5] }], [c2 + .9, { ...POSE.stand, aL: [.9, .4, 2.3], aR: [.9, -.4, 2.3], headX: -.2 }], [c3 - .2, { ...POSE.stand, aL: [.3, .3, 2.0], aR: [.9, -.4, 2.3] }]])
    : keys(t, [[c3, { ...POSE.stand, aL: [.3, .3, 2.0], aR: [.9, -.4, 2.3] }], [c3 + .35, { ...POSE.stand, aL: [.2, .7, 2.2], aR: [0, -2.7, .2], hipsZ: -.2, headZ: .2, lean: -.1 }]]);
  applyPose(shade, pose, t, { mood: t > c3 ? 'sly' : t > c2 + .9 ? 'happy' : 'calm', look: t < c2 ? 1 : 0 }, 3);
  placeShade(shade, { x: .2, z: -1.47, rise: 1, scale: 1.2, turn: t > c2 && t < c3 ? .4 : 0, op: 1 }); shade.holder.position.y = -.05;
  put(hero, -.45, .3, .45, keys(t, [[0, POSE.stand], [c2 + .2, { ...POSE.shrug }], [c3 - .3, POSE.stand], [c3 + .5, POSE.facepalm]]), t, { expr: t > c3 ? 'sad' : 'calm', lookY: .9, lookX: .6, mouth: talkG(T, 'c2'), smile: .1 });
  const [jx, jy] = hh(t, .02); cam(lerp(.6, .3, ease(t, 0, 6)) + jx, 1.55 + jy, lerp(4.5, 4.2, ease(t, 0, 6)), .1, 1.4, -1.4, 34);
  FX = { fy: .4, fw: .3, blur: 6, warm: .08, bloom: .15 };
  return () => { if (hat.visible && t < c1 + .6) { const [bx, by] = toScreen(.2, 2.1, -1.47); burst(t - c1 - .1, bx, by, '#fff6c8', 12, 300); }
    if (t > c2 + .9 && t < c2 + 1.4) { const [bx, by] = toScreen(.2, 1.4, -1.47); burst(t - c2 - .9, bx, by, '#fff6c8', 10, 260); }
    drawLines(T, { c1: { y: 380 }, c2: { y: 1440, n: 19 }, c5: { y: 380, size: 86 } }); };
};
// CAT. Гэг на выходе: тень надевает цилиндр — Пиксель прыгает на стену, сбивает его и сидит с цилиндром на своей тени
const pix2 = makeCat(); pix2.g.traverse(o => { if (o.isMesh) o.castShadow = true; }); pix2.g.scale.setScalar(1.2); hall.g.add(pix2.g);
const catHat = new THREE.Group(); catHat.add(mesh(G.cyl(.3, .3, .03, 24), ink, false, false)); { const tp = mesh(G.cyl(.17, .18, .34, 24), ink, false, false); tp.position.y = .18; catHat.add(tp); } catHat.scale.setScalar(.42); scene.add(catHat); catHat.visible = false;
const LAMP_H = new THREE.Vector3(-.3, 3.2, .8);
const onWall = (P, zw = -1.46) => { const k = (zw - LAMP_H.z) / (P.z - LAMP_H.z); return LAMP_H.clone().add(P.clone().sub(LAMP_H).multiplyScalar(k)); };
S.CAT = (t, T) => { useSet('hall'); hideAll(); hall.paint(c => paintNote(c, 1)); pix2.g.visible = true;
  const POP = .15, EYE = .7, JUMP = 1.45, HIT = 1.75, LAND = 2.15, c2 = lt('ct2');
  hat.visible = t < HIT; hat.scale.setScalar(clamp(spring(t, POP, 2.5, 6), 0, 1.2));
  // кот: смотрит вверх → виляет попой → прыжок к стене → приземляется → гордо сидит
  const jk = clamp((t - JUMP) / (LAND - JUMP)); const cx = lerp(1.0, .7, jk), cy = t > JUMP && t < LAND ? Math.sin(jk * Math.PI) * 1.05 : 0, cz = lerp(-.7, -1.15, Math.sin(jk * Math.PI));
  pix2.g.position.set(cx, cy, cz); pix2.g.rotation.set(0, Math.PI / 2 + .3, t > JUMP && t < LAND ? -jk * .9 + .5 : 0);
  poseCat(pix2, t, t > EYE && t < JUMP ? .25 + Math.sin(t * 30) * .1 : t > c2 ? .15 : 0); pix2.head.rotation.z = t > EYE && t < LAND ? .6 : t > LAND ? .2 : 0;
  // тень: позирует в цилиндре → «ай!» → орёт на кота
  const pose = t < HIT ? keys(t, [[POP, POSE.stand], [POP + .35, { ...POSE.stand, aR: [0, -2.8, 1.6], headZ: .2, hipsZ: .15 }], [EYE + .3, { ...POSE.stand, aL: [.3, .3, 2.0], aR: [.9, -.4, 2.3], hipsZ: -.15 }]])
    : keys(t, [[HIT, { ...POSE.scared, lean: -.2 }], [c2 - .1, { ...POSE.scared }], [c2 + .2, { ...POSE.stand, aL: [.6, .9, 1.9], aR: [1.3, -.2, .1], lean: .2 }]]);
  applyPose(shade, pose, t, { mood: t > HIT ? 'angry' : 'sly', look: t > EYE && t < HIT ? 1 : 0, finger: t > c2 }, 3);
  placeShade(shade, { x: .2, z: -1.47, rise: 1, scale: 1.2, turn: t > c2 ? .5 : 0, op: 1 }); shade.holder.position.y = -.05;
  // цилиндр тени слетает по стене и садится на тень кота
  scene.updateMatrixWorld(true); const hp0 = wpos(shade.head).add(new THREE.Vector3(0, .32, 0)); const ch = onWall(wpos(pix2.head)).add(new THREE.Vector3(0, .2, 0));
  if (t > HIT) { catHat.visible = true; const head = wpos(pix2.head).add(new THREE.Vector3(0, .12, 0)); const fall = ease(t, HIT, LAND + .15, k => k * k);
    catHat.position.set(lerp(hp0.x, head.x, fall), lerp(hp0.y, head.y, fall) + Math.sin(fall * Math.PI) * .25, lerp(-1.4, head.z, fall)); catHat.rotation.set(0, 0, (1 - fall) * 6 - .25); catHat.scale.setScalar(lerp(1.0, .42, fall)); }
  put(hero, -.55, .55, .35, t < c2 ? { ...POSE.stand, headX: -.1 } : { ...POSE.stand, aL: [.9, .3, 2.0], aR: [.9, -.3, 2.0], lean: -.1 }, t, { expr: 'happy', smile: 1, lookY: .8, lookX: .6, mouth: t > LAND ? .5 + .4 * Math.sin(t * 18) : 0 });
  const [jx, jy] = hh(t, .02); cam(lerp(.4, .5, ease(t, 0, 4)) + jx, 1.35 + jy, lerp(4.4, 4.0, ease(t, 0, 4)), .35, 1.15, -1.4, 34);
  FX = { fy: .45, fw: .32, blur: 6, warm: .08, bloom: .15 };
  return () => { if (t > HIT && t < HIT + .5) { const [x, y] = toScreen(hp0.x, hp0.y, -1.46); burst(t - HIT, x, y, '#07060c', 12, 300); }
    if (t > LAND) { const p = wpos(pix2.head); const [x, y] = toScreen(p.x, p.y, p.z); ctx.save(); ctx.globalAlpha = ease(t, LAND, LAND + .2); ctx.font = '800 40px Unb'; ctx.fillStyle = '#ffd36a'; ctx.strokeStyle = '#140a1e'; ctx.lineWidth = 9; ctx.textAlign = 'center'; ctx.strokeText('MINE.', x, y - 80); ctx.fillText('MINE.', x, y - 80); ctx.restore(); }
    drawLines(T, { ct1: { y: 1660 }, ct2: { y: 1640, size: 96, n: 16 } }); };
};
// 4. Окно-правило №2 (рассказчик)
function rule2(t, a, out) {
  if (t < a) return; const o = 1 - ease(t, out, out + .25); if (o <= 0) return; ctx.save(); ctx.globalAlpha = o;
  const k = spring(t, a, 1.6, 6.5), sc = lerp(.4, 1, clamp(k, 0, 1.15)); ctx.translate(540, 880 + ease(t, out, out + .25) * 700); ctx.rotate(lerp(-.25, .025, clamp(k))); ctx.scale(sc, sc);
  const Wd = 880, Hh = 860; ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fillRect(-Wd / 2 + 18, -Hh / 2 + 22, Wd, Hh);
  ctx.fillStyle = '#f6efe0'; ctx.fillRect(-Wd / 2, -Hh / 2, Wd, Hh); ctx.fillStyle = '#1a1424'; ctx.fillRect(-Wd / 2, -Hh / 2, Wd, 150);
  ctx.textAlign = 'center'; ctx.fillStyle = '#f6efe0'; ctx.font = '800 60px Unb'; ctx.fillText('LAW OF SHADOWS', 0, -Hh / 2 + 95);
  ctx.fillStyle = '#ffcf4a'; ctx.font = '600 26px Unb'; ctx.fillText('RULE #2', 0, -Hh / 2 + 132);
  const b = a + .3; ctx.fillStyle = '#0b0a12'; ctx.font = '700 62px Unb'; ctx.globalAlpha = o * ease(t, b, b + .25); ctx.fillText('A shadow', 0, -175); ctx.globalAlpha = o;
  const k2 = ease(t, b + .4, b + .65, back); ctx.save(); ctx.scale(k2, k2); ctx.fillStyle = '#e8333f'; ctx.font = '900 80px Unb'; const fit = (str, y) => { const w = ctx.measureText(str).width, sc = Math.min(1, 760 / w); ctx.save(); ctx.scale(sc, sc); ctx.fillText(str, 0, y / sc); ctx.restore(); };
  fit('CAN’T LEAVE', -80); fit('ITS OWNER', 10); ctx.restore();
  // человек и тень на поводке у пяток
  const dk = ease(t, b + .8, b + 1.1); ctx.globalAlpha = o * dk; const sw = Math.sin(t * 4) * .4;
  const fig = (x, col, eyes, lean) => { ctx.save(); ctx.translate(x, 230); ctx.rotate(lean); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, -60, 26, 0, 7); ctx.fill(); ctx.fillRect(-24, -32, 48, 66); ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.strokeStyle = col; ctx.beginPath(); ctx.moveTo(-12, 34); ctx.lineTo(-14, 84); ctx.moveTo(12, 34); ctx.lineTo(14, 84); ctx.stroke();
    if (eyes) { ctx.fillStyle = '#fff'; [-9, 9].forEach(ex => { ctx.beginPath(); ctx.ellipse(ex, -62, 7, 3, 0, 0, 7); ctx.fill(); }); } ctx.restore(); };
  fig(-150, '#8e96a8', false, 0); fig(150 + sw * 20, '#0b0a12', true, .25 + sw * .1);
  ctx.strokeStyle = '#0b0a12'; ctx.lineWidth = 6; ctx.setLineDash([14, 10]); ctx.beginPath(); ctx.moveTo(-135, 314); ctx.quadraticCurveTo(0, 345 - Math.abs(sw) * 20, 140 + sw * 20, 314); ctx.stroke(); ctx.setLineDash([]);
  ctx.globalAlpha = o;
  ctx.restore();
}
S.S4 = (t, T) => { useSet('cafe'); hideAll(); const d2 = lt('d4');
  cam(.2, 1.0, 3.6, .2, .9, -1.2, 34); FX = { fy: .5, fw: 0, blur: 14, warm: .1 };
  return () => { ctx.fillStyle = 'rgba(12,8,20,.55)'; ctx.fillRect(0, 0, 1080, 1920); rule2(t, .1, 99);
    if (t > d2) { stamp(t, d2, '*UNLESS IT QUITS', { x: 560, y: 1390, size: 52, rot: -.06 }); } };
};
// 5. Кафе: Mia у окна с книгой; на стене её тень с хвостиком. Тень Sam влюбилась
const WZc = cafe.wallZ + .07;
function seatMia(t, pose, face, opt = {}) { put(mia, cafe.TX + .52, cafe.TZ, -Math.PI / 2, pose, t, face, SY, 8); mia.tail.rotation.x = Math.sin(t * 2.2) * .12 + (opt.tail || 0); }
function seatSam(t, pose, face) { put(hero, cafe.TX - .52, cafe.TZ, Math.PI / 2, pose, t, face, SY, 1); }
// тень сидящего: тот же риг на стене, правее и выше хозяина (свет из окна слева)
function wallShade(Sh, ownerX, pose, t, face, seed, { dx = .3, y = .42, turn = 0, sc = 1.0, op = 1 } = {}) { applyPose(Sh, pose, t, face, seed); placeShade(Sh, { x: ownerX + dx, z: WZc + (Sh === shade ? .004 : 0), rise: 1, scale: sc, turn, op }); Sh.holder.position.y = y; }
const READ = sit({ aL: [.9, .3, 1.6], aR: [.9, -.3, 1.6], headX: .3 });
S.S5 = (t, T) => { useSet('cafe'); hideAll();
  seatMia(t, { ...READ, headY: t > 4.8 ? -.3 : 0 }, { expr: 'calm', smile: .5, lookY: -.8 });
  wallShade(miaSh, cafe.TX + .52, READ, t, { mood: 'calm', look: 0 }, 7, { turn: -Math.PI / 2 }); miaSh.tail.rotation.x = Math.sin(t * 2.2) * .12;
  // Sam у входа (справа на переднем плане, спиной) и его тень входит в кадр по стене
  put(hero, 1.35, 1.1, Math.PI + .4, keys(t, [[0, { ...POSE.stand, aR: [.2, -.1, 1.5] }], [lt('e2'), { ...POSE.stand, aR: [.2, -.1, 1.5], headY: -.3 }]]), t, { expr: 'calm', mouth: talkG(T, 'e2') }); flower.visible = true;
  const sx = 1.7; const e4 = lt('e4'); const melt = ease(t, .6, 1.1);
  const reach = ease(t, lt('e3') + .3, e4 + .1, sm) * (1 - ease(t, e4 + .5, e4 + .75)); const snap = t > e4 + .5 ? spring(t, e4 + .5, 3, 6) : 0;
  applyPose(shade, reach > 0 ? { ...POSE.stand, aR: [1.55, -.05, .05], lean: .3 * reach, lL: [.3, .1], lR: [-.3, .1] } : keys(t, [[0, POSE.stand], [.7, { ...POSE.stand, aL: [.9, .3, 2.2], aR: [.9, -.3, 2.2], lean: -.1, headZ: .2 }], [e4 + .6, { ...POSE.stand, aL: [.6, .9, 1.9], aR: [.6, -.9, 1.9] }]]), t, { mood: t > e4 ? 'angry' : 'happy', look: -1 }, 3);
  shade.aR.sh.scale.y = 1 + reach * 2.4 + Math.sin(t * 40) * .05 * reach; placeShade(shade, { x: sx + snap * .03, z: WZc + .004, rise: 1, scale: 1.15, turn: reach > 0 ? -Math.PI / 2 : -.4, op: 1 }); shade.holder.position.y = .02;
  const [jx, jy] = hh(t, .015);
  cam(lerp(1.6, 1.1, ease(t, 0, 6)) + jx, 1.35 + jy, lerp(4.8, 4.3, ease(t, 0, 6)), lerp(.7, .55, ease(t, 0, 6)), .95, -1.0, 36);
  FX = { fy: .45, fw: .3, blur: 6, warm: .1, bloom: .25 };
  return () => { heartEyes(shade, melt * (t < lt('e4') ? 1 : 0), t); if (t > .8 && t < lt('e3')) { const p = wpos(shade.head); const [x, y] = toScreen(p.x, p.y, p.z); heartsFloat(t - 1.2, x, y - 40, .6, 260, 8); }
    motes(t, { x: 400, y: 700, w: 700, h: 900, n: 30, a: .5 });
    drawLines(T, { e1: { y: 380, n: 18 }, e2: { y: 1480 }, e3: { y: 380, size: 96 }, e4: { y: 380, size: 100 } }); };
};
// 6. Sam подходит и садится; тени на стене робко косятся
S.S6 = (t, T) => { useSet('cafe'); hideAll(); const f1 = lt('f1'), f2 = lt('f2'), SITT = f2 + .9;
  const lookUp = ease(t, f1 + .6, f1 + 1.0);
  seatMia(t, { ...READ, headX: lerp(.3, -.05, lookUp), headY: lerp(0, .25, lookUp), aL: [lerp(.9, .6, lookUp), .3, 1.6] }, { expr: t > f2 ? 'happy' : 'surprised', smile: t > f2 ? 1 : .3, lookX: -lookUp * .8, mouth: talkG(T, 'f2') });
  wallShade(miaSh, cafe.TX + .52, { ...READ, headY: lerp(0, .25, lookUp) }, t, { mood: t > f2 ? 'happy' : 'calm', look: 0 }, 7, { turn: -Math.PI / 2 });
  // Sam: идёт к столу → стоит, мнётся → садится
  const sx = lerp(1.25, -.52, ease(t, 0, f1 - .1, sm)), sz = lerp(.9, cafe.TZ + .05, ease(t, 0, f1 - .1, sm));
  let pose, yaw, y = 0; const sk = ease(t, SITT, SITT + .5, sm);
  if (t < f1 - .1) { pose = walk(t * 1.1, 0, { aR: [.3, -.1, 1.5] }); yaw = Math.atan2(-1.77, -.85); }
  else { pose = blendPose({ ...POSE.stand, aL: [.2, .1, .5], aR: [.4, -.1, 1.7], headZ: -.1 }, sit({ aR: [.6, -.1, 1.6] }), sk); yaw = lerp(Math.PI * .65, Math.PI / 2, ease(t, f1 - .1, f1 + .3)); y = SY * sk; }
  put(hero, t < f1 - .1 ? sx : lerp(-.52, -.52, 1), t < f1 - .1 ? sz : lerp(cafe.TZ + .05, cafe.TZ, sk), yaw, pose, t, { expr: 'scared', smile: .2, mouth: talkG(T, 'f1'), lookX: .5 }, y); flower.visible = true;
  const shp = t < f1 - .1 ? pose : pose; const hx = hero.root.position.x;
  wallShade(shade, hx, shp, t, { mood: t > f2 ? 'happy' : 'calm', look: t > SITT + .3 ? (Math.sin(t * 2) > 0 ? 1 : 0) : 1 }, 3, { turn: t < f1 - .1 ? -Math.PI / 2 : Math.PI / 2, y: .42 + y });
  if (t > SITT + .3) { miaSh.eyes.forEach(e => e.position.x += Math.sin(t * 2 + 1) > 0 ? -.03 : 0); }
  const [jx, jy] = hh(t, .015); cam(lerp(.6, .1, ease(t, 0, 5.6)) + jx, 1.35 + jy, lerp(4.6, 4.2, ease(t, 0, 5.6)), .15, .95, -1.0, 36);
  FX = { fy: .45, fw: .3, blur: 6, warm: .1, bloom: .25 };
  return () => { if (t > SITT + .3) { const p = wpos(shade.head), q = wpos(miaSh.head); const [x1, y1] = toScreen(p.x, p.y, p.z), [x2, y2] = toScreen(q.x, q.y, q.z); ctx.save(); ctx.globalAlpha = .7; heart((x1 + x2) / 2, Math.min(y1, y2) - 90 - Math.sin(t * 3) * 10, 22); ctx.restore(); }
    drawLines(T, { f1: { y: 1480 }, f2: { y: 1480 } }); };
};
// 7. «Lean in. Closer…» — локоть сбивает чашку
S.S7 = (t, T) => { useSet('cafe'); hideAll(); const g1 = lt('g4'), g2 = lt('g5'), KNOCK = lt('g3') - .3;
  const lean = ease(t, g1 + .5, g1 + 1.3) * .25 + ease(t, g2 + .4, g2 + 1.2) * .3 - ease(t, KNOCK + .2, KNOCK + .6) * .5;
  const samP = sit({ lean, aR: t > KNOCK - .35 && t < KNOCK + .3 ? [1.1, .25, .5] : [.7, -.1, 1.3], aL: [.75, .1, 1.3] });
  seatSam(t, t > KNOCK + .2 ? keys(t, [[KNOCK + .2, samP], [KNOCK + .5, sit({ aL: [1.2, .3, 1.8], aR: [1.2, -.3, 1.8], lean: -.1 })]]) : samP, { expr: t > KNOCK ? 'scared' : lean > .3 ? 'determined' : 'calm', smile: .3, mouth: talkG(T, 'g3'), lookX: .8, wide: t > KNOCK });
  const laugh = ease(t, KNOCK + .5, KNOCK + .8);
  seatMia(t, sit({ lean: laugh * .1 + Math.sin(t * 14) * .03 * laugh, aL: [.8 + laugh * .5, .3, 1.8], aR: [.7, -.1, 1.3], headX: -laugh * .15 }), { expr: laugh > 0 ? 'happy' : 'calm', smile: 1, mouth: laugh * (.5 + .4 * Math.sin(t * 18)), lookX: -.8 });
  wallShade(shade, -.52, samP, t, { mood: 'sly', look: 1 }, 3, { turn: Math.PI / 2 });
  wallShade(miaSh, .52, sit({ lean: lean * .5 }), t, { mood: 'happy', look: -1 }, 7, { turn: -Math.PI / 2 });
  // чашка Sam падает со стола, пятно
  const ck = ease(t, KNOCK, KNOCK + .35); const cup = cafe.cupM; cup.rotation.z = -ck * 1.6; cup.position.set(.06 + ck * .06, .44, cafe.TZ + .1); cafe.spill.visible = t > KNOCK + .2; cafe.spill.scale.setScalar(ease(t, KNOCK + .2, KNOCK + .6));
  const [jx, jy] = hh(t, .012); const push = ease(t, 0, KNOCK, sm);
  cam(lerp(.1, 0, push) + jx, lerp(1.35, 1.25, push) + jy, lerp(4.2, 3.6, push), .05, .95, -1.0, 36);
  FX = { fy: .45, fw: .3, blur: 6, warm: .1, bloom: .25 };
  return () => { if (t > KNOCK && t < KNOCK + .6) { const [bx, by] = toScreen(.1, .5, cafe.TZ + .1); burst(t - KNOCK, bx, by, '#7a4a2a', 16, 360); }
    if (t > KNOCK) { const p = wpos(hero.head); const [x, y] = toScreen(p.x, p.y, p.z); sweat(x - 70, y - 60 + (t - KNOCK) * 30, 1 - ease(t, KNOCK + 1.4, KNOCK + 1.8)); }
    drawLines(T, { g4: { y: 380 }, g5: { y: 380 }, g3: { y: 1480 } }); };
};
// 8. «Now. Her hand.» — руки ползут; на стене ладони теней касаются — искры; у людей — оба отдёрнули
S.S8 = (t, T) => { useSet('cafe'); hideAll(); cafe.spill.visible = true; cafe.spill.scale.setScalar(1); cafe.cupM.rotation.z = -1.6;
  const TOUCH = 2.9, JERK = 3.25;
  const reach = ease(t, .9, TOUCH, sm) * (1 - ease(t, JERK, JERK + .2));
  const samP = sit({ aR: [lerp(.7, 1.35, reach), lerp(-.1, .35, reach), lerp(1.3, .15, reach)], lean: reach * .12 });
  const miaP = sit({ aL: [lerp(.7, 1.35, reach), lerp(.1, -.35, reach), lerp(1.3, .15, reach)], lean: reach * .12 });
  const jerk = t > JERK ? keys(t, [[JERK, sit()], [JERK + .25, sit({ aL: [1.3, .4, 2.2], aR: [1.3, -.4, 2.2], lean: -.15 })]]) : null;
  seatSam(t, jerk || samP, { expr: t > JERK ? 'surprised' : 'determined', smile: .3, lookX: .8, wide: t > JERK, lookY: t < TOUCH ? -.5 : 0 });
  seatMia(t, jerk || miaP, { expr: t > JERK ? 'surprised' : 'calm', smile: .6, lookX: -.8, wide: t > JERK });
  // тени не отдёргивают руки — держатся
  const shR = ease(t, .9, TOUCH, sm);
  wallShade(shade, -.52, sit({ aR: [lerp(.7, 1.45, shR), lerp(-.1, .2, shR), lerp(1.3, .05, shR)], lean: shR * .2 }), t, { mood: t > TOUCH ? 'happy' : 'sly', look: 1 }, 3, { turn: Math.PI / 2 });
  wallShade(miaSh, .52, sit({ aL: [lerp(.7, 1.45, shR), lerp(.1, -.2, shR), lerp(1.3, .05, shR)], lean: shR * .2 }), t, { mood: 'happy', look: -1 }, 7, { turn: -Math.PI / 2 });
  // хозяева отдёрнули — тени отъезжают вместе с ними, но руки тянутся резиной и не отпускают
  const back = ease(t, JERK, JERK + .25); if (back > 0) { const wob = 1 + Math.sin((t - JERK) * 25) * .06 * Math.exp(-(t - JERK) * 3);
    shade.aR.sh.scale.y = (1 + back * .55) * wob; miaSh.aL.sh.scale.y = (1 + back * .55) * wob; shade.holder.position.x -= back * .14; miaSh.holder.position.x += back * .14; }
  const [jx, jy] = hh(t, .01); cam(.05 + jx, 1.25 + jy, lerp(3.7, 3.2, ease(t, 0, TOUCH, sm)), .1, .95, -1.1, 36);
  FX = { fy: .45, fw: .3, blur: 6, warm: .12, bloom: .3 };
  return () => { if (t > TOUCH - .1) { const p = wpos(shade.aR.hand), q = wpos(miaSh.aL.hand); const [x1, y1] = toScreen(p.x, p.y, p.z), [x2, y2] = toScreen(q.x, q.y, q.z); sparks(t, (x1 + x2) / 2, (y1 + y2) / 2, ease(t, TOUCH - .1, TOUCH + .2)); heartsFloat(t - TOUCH, (x1 + x2) / 2, (y1 + y2) / 2 - 40, .6, 300, 8); }
    if (t > JERK && t < JERK + .5) { const p = wpos(hero.aR.hand); const [x, y] = toScreen(p.x, p.y, p.z); burst(t - JERK, x + 30, y, '#ffffff', 10, 260); }
    drawLines(T, { h3: { y: 380, n: 18 } }); };
};
// 9. ПОВОРОТ: Mia шипит на свою тень; «Did yours?»; оба смотрят на стену — тени притворяются и насвистывают
S.S9 = (t, T) => { useSet('cafe'); hideAll(); cafe.spill.visible = true; cafe.cupM.rotation.z = -1.6;
  const i1 = lt('i1'), i2 = lt('i2'), i3 = lt('i3'), LOOK2 = i3 + DURS.i3 + .2;
  const turnM = t < i2 ? ease(t, i1 - .2, i1 + .1) : 1 - ease(t, i2 - .3, i2);
  const both = ease(t, LOOK2, LOOK2 + .3);
  seatMia(t, sit({ headY: -turnM * .9 - both * .9, headX: -.1 + both * -.2, aL: t < i2 ? [.9, .5, 2.0] : [.8, .3, 1.8] }), { expr: t < i2 ? 'angry' : t < i3 + .2 ? 'scared' : 'happy', smile: t > i3 ? .6 : 0, mouth: talkG(T, 'i1', 'i3'), lookX: t < i2 ? .9 : -.8 });
  seatSam(t, sit({ headY: both * .9, headX: -both * .2, lean: t > i2 && t < i3 ? .1 : 0 }), { expr: t > i2 - .2 && t < i3 + .5 ? 'surprised' : 'calm', mouth: talkG(T, 'i2'), lookX: t > LOOK2 ? -.6 : .8, wide: t > i1 + .3 && t < i3 });
  // тень Mia: руками «давай-давай» → застывает, копирует; тень Sam тоже
  const freeze = both > 0;
  const mP = freeze ? sit({ headY: -.9, headX: -.3 }) : keys(t, [[0, sit({ aL: [.9, 1.2, .6], aR: [.9, -1.2, .6] })], [i1, sit({ aL: [1.2, .9, 1.4], aR: [.4, -.2, 1.2], lean: .15 })], [i2, sit({ aL: [.9, 1.2, .6], aR: [.9, -1.2, .6], headX: .2 })]]);
  wallShade(miaSh, .52, mP, t, { mood: freeze ? 'calm' : t < i2 ? 'sly' : 'wide', look: freeze ? 0 : -1, open: freeze ? lerp(1, .15, ease(t, LOOK2 + .3, LOOK2 + .6)) : 1 }, 7, { turn: -Math.PI / 2 });
  const sP = freeze ? sit({ headY: .9, headX: -.3 }) : sit({ aR: [1.1, -.9, .5], headZ: .15 });
  wallShade(shade, -.52, sP, t, { mood: freeze ? 'calm' : 'happy', look: freeze ? 0 : 1, open: freeze ? lerp(1, .15, ease(t, LOOK2 + .3, LOOK2 + .6)) : 1 }, 3, { turn: Math.PI / 2 });
  const [jx, jy] = hh(t, .012);
  if (t < i2) cam(.35 + jx, .95 + jy, 2.2, .45, .8, -1.0, 34); // крупно Mia
  else if (t < LOOK2) cam(-.4 + jx, .95 + jy, 2.2, -.45, .8, -1.0, 34); // крупно Sam
  else cam(.05 + jx, 1.35 + jy, lerp(4.0, 4.3, ease(t, LOOK2, 7.6)), .1, 1.0, -1.2, 36); // оба смотрят на стену
  FX = { fy: t > LOOK2 ? .35 : .45, fw: .3, blur: 6, warm: .1, bloom: .2 };
  return () => { if (freeze) { const p = wpos(miaSh.head), q = wpos(shade.head); const [x1, y1] = toScreen(p.x, p.y, p.z), [x2, y2] = toScreen(q.x, q.y, q.z); notes(t, x1, y1 - 40, both); notes(t + .5, x2 - 120, y2 - 40, both); }
    drawLines(T, { i1: { y: 1480 }, i2: { y: 1480, n: 19 }, i3: { y: 1480 } }); };
};
// 10. Смех и знакомство; на стене тени обнимаются и кружатся — бариста роняет поднос
S.S10 = (t, T) => { useSet('cafe'); hideAll(); cafe.spill.visible = true; cafe.cupM.rotation.z = -1.6;
  const j3 = lt('j3'), j4 = lt('j4'), SHAKE = j4 + .2, HUG = SHAKE + .3, DROP = HUG + .6;
  const laugh = 1 - ease(t, .6, 1.0);
  const shk = ease(t, SHAKE - .2, SHAKE + .2) * (1 - ease(t, SHAKE + 1.4, SHAKE + 1.7)); const bob = Math.sin(t * 12) * .15 * shk;
  seatSam(t, sit({ aR: [lerp(.7, 1.35, shk), lerp(-.1, .3, shk) , lerp(1.3, .2, shk) + bob], lean: laugh * .1 * Math.sin(t * 16) + shk * .1, headY: t > HUG + .3 && t < DROP + 1.5 ? .9 : 0 }), { expr: 'happy', smile: 1, mouth: Math.max(talkG(T, 'j2', 'j4'), laugh * (.5 + .4 * Math.sin(t * 17))), lookX: .8 });
  seatMia(t, sit({ aL: [lerp(.7, 1.35, shk), lerp(.1, -.3, shk), lerp(1.3, .2, shk) - bob], lean: laugh * .1 * Math.sin(t * 15) + shk * .1, headY: t > HUG + .3 && t < DROP + 1.5 ? -.9 : 0 }), { expr: 'happy', smile: 1, mouth: Math.max(talkG(T, 'j1', 'j3'), laugh * (.5 + .4 * Math.sin(t * 18))), lookX: -.8 });
  // тени: обнимаются и кружатся (нарушают правило №2)
  const hug = ease(t, HUG, HUG + .4); const spin = clamp(t - HUG - .4, 0, 1.26) * 5; const KISS = HUG + 1.7;
  const midX = 0;
  const sp = hug > 0 ? { ...POSE.stand, aL: [1.3, .6, 1.0], aR: [1.3, -.6, 1.0], lL: [Math.sin(spin) * .4, .3], lR: [-Math.sin(spin) * .4, .3] } : sit({ aR: [lerp(.7, 1.35, shk), -.1, lerp(1.3, .2, shk)] });
  applyPose(shade, sp, t, { mood: 'happy', look: 1 }, 3); applyPose(miaSh, sp, t, { mood: 'happy', look: -1 }, 7);
  const r = .2 * hug; const ang = spin;
  placeShade(shade, { x: lerp(-.22, midX - Math.cos(ang) * r, hug), z: WZc + .004, rise: 1, scale: 1.0, turn: lerp(Math.PI / 2, Math.PI / 2 + ang, hug), op: 1 }); shade.holder.position.y = lerp(.42, .3, hug) + Math.abs(Math.sin(spin)) * .05 * hug;
  placeShade(miaSh, { x: lerp(.82, midX + Math.cos(ang) * r, hug), z: WZc, rise: 1, scale: 1.0, turn: lerp(-Math.PI / 2, -Math.PI / 2 + ang, hug), op: 1 }); miaSh.holder.position.y = shade.holder.position.y; miaSh.tail.rotation.x = -.4 * hug + Math.sin(t * 9) * .3 * hug;
  if (t > KISS) kissPair(t, midX, .32, WZc);
  // бариста роняет поднос
  const bk = ease(t, DROP, DROP + .25); const bx = lerp(2.2, 1.45, ease(t, 0, DROP - .3, sm)); put(barista, bx, -.15, -Math.PI / 2 + .3, t < DROP - .3 ? { ...walk((2.2 - bx) * 1.6), aR: [1.2, -.1, 1.6] } : t < DROP ? { ...POSE.stand, aR: [1.2, -.1, 1.6] } : keys(t, [[DROP, { ...POSE.stand, aR: [1.2, -.1, 1.6] }], [DROP + .2, { ...POSE.scared, lean: -.15 }]]), t, { expr: t > DROP ? 'surprised' : 'calm', wide: t > DROP, mouth: t > DROP ? .8 : 0, lookX: -.8 }, 0, 11);
  const hp = wpos(barista.aR.hand); tray.position.set(hp.x + bk * .2, t < DROP ? hp.y + .02 : Math.max(.02, hp.y + .02 - (t - DROP) ** 2 * 9), hp.z + .08); tray.rotation.set(bk * 1.2, 0, bk * .8);
  const pan = ease(t, DROP - .5, DROP + .4, sm) * (1 - ease(t, DROP + 1.4, DROP + 1.9, sm));
  const [jx, jy] = hh(t, .012);
  cam(lerp(.05, 1.2, pan) + jx, 1.35 + jy, lerp(4.2, 4.5, ease(t, 0, 8)), lerp(.1, 1.3, pan), .95, -1.1, 36);
  FX = { fy: .4, fw: .3, blur: 6, warm: .12, bloom: .3 };
  return () => { if (hug > 0) { const p = wpos(shade.head); const [x, y] = toScreen(midX, p.y, p.z); heartsFloat(t - HUG, x, y - 30, .8, 380, 12); }
    if (t > DROP + .15 && t < DROP + .8) { const [qx, qy] = toScreen(tray.position.x, .05, tray.position.z); burst(t - DROP - .15, qx, qy, '#ffffff', 16, 420); }
    drawLines(T, { j1: { y: 1480 }, j2: { y: 1480 }, j3: { y: 1480 }, j4: { y: 1480, size: 80 } }); };
};
// 11. Закат, прогулка: люди идут на расстоянии; их длинные тени на асфальте держатся за руки и кружатся
const sunsetSky = skyTex([[0, '#3a4a9a'], [.45, '#e87a8a'], [.75, '#ffb070'], [1, '#ffe0a0']]);
const sunDisc = mesh(G.sph(2.2, 32), glow('#ffd8a0', 1.6), false, false); sunDisc.position.set(-2, 3.2, -45); day.g.add(sunDisc); sunDisc.visible = false;
S.S11 = (t, T) => { useSet('day'); hideAll(); scene.background = sunsetSky; scene.fog = new THREE.Fog('#f0a088', 16, 60); sunDisc.visible = true;
  day.sun.color.set('#ffa860'); day.sun.intensity = 3.0; day.bus.visible = false; day.fence.visible = false;
  // хозяева идут к камере плечом к плечу (близко — иначе теням не дотянуться), солнце позади: тени лежат впереди и отрываются по полной
  const Z = -1.2 + t * .45, Xs = -1.72, Xm = -1.18; const wk = t * .45 * 1.6;
  put(hero, Xs, Z, 0, walk(wk, 0, { headY: .45 }), t, { expr: 'happy', smile: 1, mouth: Math.max(talkG(T, 'k3', 'k4'), .3 * Math.abs(Math.sin(t * 9)) * (Math.sin(t * 2.5) > .2 ? 1 : 0)), lookX: .7 });
  put(mia, Xm, Z, 0, walk(wk + .7, 0, { headY: -.45 }), t, { expr: 'happy', smile: 1, mouth: .3 * Math.abs(Math.sin(t * 8)) * (Math.sin(t * 2.5 + 2) > .3 ? 1 : 0), lookX: -.7 }, 0, 8); mia.tail.rotation.x = Math.sin(t * 7) * .2;
  day.sun.position.set(-1.45, 1.5, Z - 9); day.sun.target.position.set(-1.45, 0, Z + 1);
  // фазы: держатся за руки → кружит её → танец → наклон-«дип» и поцелуй
  const ph = t < 1.6 ? 0 : t < 3.0 ? 1 : t < 5.0 ? 2 : 3;
  const dz = Z + .03; let sp, mp, sTurn = Math.PI, mTurn = Math.PI, sYaw = 0, mYaw = 0, sx = Xs, mx = Xm;
  if (ph === 0) { sp = { ...walk(wk), aR: [.2, -1.3, .15] }; mp = { ...walk(wk + .7), aL: [.2, 1.3, .15] }; }
  else if (ph === 1) { const k = (t - 1.6) / 1.4; sp = { ...POSE.stand, aR: [.3, -2.6, .3] }; mp = { ...POSE.stand, aL: [.2, 2.6, .2], aR: [0, -.6, .3], hipsZ: .15 }; mTurn = Math.PI + k * Math.PI * 4; }
  else if (ph === 2) { const b = Math.sin(t * 9); sp = { ...POSE.stand, aL: [.3, 1.6 + b * .6, .5], aR: [.3, -1.6 + b * .6, .5], hipsZ: b * .2, lL: [Math.max(0, b) * .6, .4], lR: [Math.max(0, -b) * .6, .4], crouch: .04 + Math.abs(b) * .04 };
    mp = { ...POSE.stand, aL: [.2, 2.7, .2 + Math.abs(b) * .6], aR: [.2, -2.7, .2 + Math.abs(b) * .6], hipsZ: -b * .25, lL: [Math.max(0, -b) * .5, .3], lR: [Math.max(0, b) * .5, .3] }; sTurn = Math.PI + b * .4; mTurn = Math.PI - b * .4; }
  else { const k = ease(t, 5.0, 5.5); sp = { ...POSE.stand, aL: [1.3, .5, 1.0], aR: [1.3, -.5, 1.0], lean: .35 * k }; mp = { ...POSE.stand, aL: [1.0, .5, 1.6], aR: [1.0, -.5, 1.6], lean: -.6 * k, lL: [.7 * k, .9 * k] };
    sTurn = Math.PI + Math.PI / 2 * k; mTurn = Math.PI - Math.PI / 2 * k; sx = lerp(Xs, -1.56, k); mx = lerp(Xm, -1.34, k); }
  applyPose(shade, sp, t, { mood: 'happy' }, 3); applyPose(miaSh, mp, t, { mood: 'happy', open: ph === 3 ? .12 : 1 }, 7);
  placeShade(shade, { x: sx, z: dz, rise: 0, len: 1.6, yaw: sYaw, scale: .9, turn: sTurn, op: .9 });
  placeShade(miaSh, { x: mx, z: dz, rise: 0, len: 1.6, yaw: mYaw, scale: .9, turn: mTurn, op: .9 }); miaSh.tail.rotation.x = Math.sin(t * 8) * .4;
  const [jx, jy] = hh(t, .02); cam(-1.4 + jx, 3.6 + jy, Z + 3.9, -1.45, 0, Z + .9, 40);
  FX = { fy: .6, fw: .38, blur: 6, warm: .2, bloom: .5 };
  return () => { warmGlow(.3); const [px, py] = toScreen(-1.45, 0, Z + 1.3); if (ph >= 2) heartsFloat(t, px, py, ph === 3 ? 1 : .6, 400, 12);
    if (ph === 3) { ctx.save(); ctx.globalAlpha = .9; ctx.font = '800 56px Unb'; ctx.textAlign = 'center'; ctx.lineWidth = 12; ctx.strokeStyle = '#140a1e'; ctx.fillStyle = '#ff6a9a'; ctx.strokeText('MWAH', px + 150, py - 60); ctx.fillText('MWAH', px + 150, py - 60); ctx.restore(); }
    drawLines(T, { k3: { y: 1720 }, k4: { y: 1720 } }); };
};
// ---- ночь у двери Mia ----
// дверь Mia: светлая (на ней читаются тени), фонарик-бра, ступеньки; правее неоновой двери, между окнами
const DX2 = 2.6, WN = night.wallZ + .02;
const mdoor = new THREE.Group(); mdoor.visible = false; night.g.add(mdoor);
{ const A = (m, x, y, z) => { m.position.set(x, y, z); mdoor.add(m); return m; };
  A(mesh(G.rbox(1.12, 2.12, .08, .02), clay('#3a2a22'), false, true), DX2, 1.06, -2.16);
  A(mesh(G.rbox(.96, 2.0, .06, .02), clay('#efe0c4'), false, true), DX2, 1.0, -2.12);
  A(mesh(G.plane(.5, .5), new THREE.MeshStandardMaterial({ color: '#ffd89a', emissive: '#ffbf6a', emissiveIntensity: .6 }), false, false), DX2, 1.45, -2.085);
  A(mesh(G.sph(.035), clay('#d8b860', { metalness: .6, roughness: .3 })), DX2 + .36, .95, -2.07);
  [0, 1].forEach(k => A(mesh(G.rbox(1.4 - k * .25, .1, .5 - k * .15, .02), clay('#7a6a8a'), false, true), DX2, .05 + k * .1, -1.95 + k * .07));
  A(mesh(G.rbox(.3, .2, .04, .01), new THREE.MeshStandardMaterial({ map: (() => { const c = document.createElement('canvas'); c.width = 128; c.height = 80; const g = c.getContext('2d'); g.fillStyle = '#f6efe0'; g.fillRect(0, 0, 128, 80); g.fillStyle = '#c03a6a'; g.font = '700 40px serif'; g.textAlign = 'center'; g.fillText('12', 64, 54); const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; return tx; })() })), DX2 + .75, 1.75, -2.1);
  A(mesh(G.cap(.015, .16), clay('#1a1622')), DX2 - .78, 2.2, -2.05); }
const lanternBulb = mesh(G.sph(.1, 16), glow('#ffe2a8', 1.8), false, false); lanternBulb.position.set(DX2 - .78, 2.05, -1.98); mdoor.add(lanternBulb);
const porch = new THREE.PointLight('#ffcf8a', 7, 9, 1.2); porch.position.set(DX2 - .1, 1.7, -.2); porch.castShadow = false; mdoor.add(porch);
const benchN = night.g.children.find(o => o.isGroup && Math.abs(o.position.x - 3.2) < .01 && Math.abs(o.position.z + 1.7) < .01);
let nightBulb = []; { const lp = new THREE.Vector3(night.lampX, 3.1, night.lampZ); night.g.children.forEach(o => { if (o.position.distanceTo(lp) < .02) nightBulb.push(o); }); }
const hemi = night.g.children.find(o => o.isHemisphereLight);
function nightDoor(lampOn, door = true) { useSet('night'); night.neon.visible = false; mdoor.visible = door; if (benchN) benchN.visible = !door;
  porch.intensity = 7 * lampOn; lanternBulb.visible = lampOn > .5; night.sp.intensity = door ? 30 : 95; hemi.intensity = lerp(.1, .7, lampOn); }
// 12. Тени тянутся поцеловаться — хозяевам надо наклониться… фонарь гаснет
S.S12 = (t, T) => { hideAll(); const OFF = lt('l2') - .45;
  const fl = t > OFF - .5 && t < OFF ? (Math.sin(t * 60) > .2 ? 1 : .3) : 1; const lamp = t < OFF ? fl : 0; nightDoor(lamp);
  const lean = ease(t, lt('l1') + .5, OFF, sm);
  put(hero, DX2 - .6, -1.3, Math.PI / 2 - .3, { ...POSE.stand, lean: lean * .35, headX: -lean * .1, aL: [.1, .2, .3], aR: [.1, -.2, .3] }, t, { expr: 'calm', smile: .6, lookX: .7, lid: lean * .6 });
  put(mia, DX2 + .1, -1.8, -Math.PI / 2 + .4, { ...POSE.stand, lean: lean * .3, crouch: 0, headX: -lean * .15, aL: [.4, .1, 1.6], aR: [.4, -.1, 1.6] }, t, { expr: 'happy', smile: .8, lookX: -.7, lid: lean * .7 }, .2, 8);
  // тени на стене: тень Sam тянется сильнее хозяина
  const sl = ease(t, 0, lt('l1'), sm);
  applyPose(shade, { ...POSE.stand, lean: .2 + lean * .4, aR: [1.2, -.3, .4], aL: [.3, .2, .3] }, t, { mood: 'happy', look: 1, open: lerp(1, .2, lean) }, 3);
  applyPose(miaSh, { ...POSE.stand, lean: lean * .4, aL: [.4, .1, 1.6], aR: [.4, -.1, 1.6] }, t, { mood: 'happy', look: -1, open: lerp(1, .2, lean) }, 7);
  const op = t < OFF ? 1 : .02;
  placeShade(shade, { x: lerp(DX2 - .85, DX2 - .55 + lean * .12, sl), z: WN + .03, rise: 1, scale: 1.3, turn: Math.PI / 2, op });
  placeShade(miaSh, { x: DX2 + .2 - lean * .15, z: WN + .07, rise: 1, scale: 1.3, turn: -Math.PI / 2, op }); shade.holder.position.y = .1; miaSh.holder.position.y = .3;
  if (t > OFF) { [shade, miaSh].forEach(s => applyPose(s, { ...POSE.stand }, t, { mood: 'wide', look: Math.sin(t * 7) }, s === shade ? 3 : 7)); }
  const [jx, jy] = hh(t, .015); cam(lerp(DX2 + .2, DX2 - .1, ease(t, 0, OFF)) + jx, 1.35 + jy, lerp(4.6, 3.7, ease(t, 0, OFF, sm)), DX2 - .15, 1.15, -1.8, 36);
  FX = { fy: .45, fw: .3, blur: 6, bloom: t < OFF ? .45 : .1, warm: -.02 };
  return () => { if (t < OFF && lean > .3) { const [x, y] = toScreen(DX2 - .2, 1.6, WN); heartsFloat(t, x, y, lean * .6, 300, 8); }
    if (t > OFF) { ctx.fillStyle = 'rgba(0,0,8,.55)'; ctx.fillRect(0, 0, 1080, 1920); }
    drawLines(T, { l1: { y: 380, size: 96 }, l2: { y: 380, size: 96 } }); };
};
// 13. «Sam? Next time… …without them.» Mia уходит в дом — а её тень остаётся на двери: увольняется и уходит к тени Sam
S.S13 = (t, T) => { hideAll(); const m1 = lt('m1'), m2 = lt('m2'), q1 = lt('q1'), q2 = lt('q2');
  const lamp = t < .5 ? (Math.sin(t * 50) > 0 ? 1 : .2) : 1; nightDoor(lamp);
  const glance = ease(t, m2 - .2, m2 + .2) * (1 - ease(t, m2 + 1.0, m2 + 1.3));
  const GO = m2 + DURS.m2 + .3, goIn = ease(t, GO, GO + 1.0, sm), gone = t > GO + 1.0;
  put(hero, DX2 - .6, -1.3, Math.PI / 2 - .3, keys(t, [[0, { ...POSE.stand, lean: -.1 }], [m1 + .3, POSE.stand], [GO + 1.2, { ...POSE.stand, headY: -.3 }], [q1 + .5, { ...POSE.stand, headY: .6, lean: -.1 }]]), t, { expr: t > q1 ? 'surprised' : t > m2 + .5 ? 'happy' : 'surprised', smile: t > m2 + .5 && t < q1 ? 1 : .2, lookX: t > GO + 1.2 ? -.6 : .7, wide: t > q1 });
  if (!gone) put(mia, lerp(DX2 + .1, DX2, goIn), lerp(-1.8, -2.08, goIn), lerp(-Math.PI / 2 + .4, Math.PI, ease(t, GO, GO + .3)), goIn > 0 ? walk(goIn * 2) : { ...POSE.stand, aL: [.4, .1, 1.6], aR: [.3, -.2, 1.2], headY: glance * 1.2, headZ: -glance * .1 }, t, { expr: 'happy', smile: 1, lookX: glance > .5 ? .9 : -.7, mouth: talkG(T, 'm1', 'm2') }, .2, 8);
  // тень Mia: остаётся на двери → «отклеивается» (дрожь) → идёт к тени Sam, берёт за руку
  const peel = ease(t, GO + 1.1, GO + 1.6); const walkK = ease(t, GO + 1.7, q1 - .1, sm);
  const mx = lerp(DX2 + .2, DX2 - .5, walkK);
  applyPose(miaSh, walkK > 0 && walkK < 1 ? walk(walkK * 4) : t > q1 ? { ...POSE.stand, aR: [.6, -.6, .3], headZ: .1 } : { ...POSE.stand, headY: glance * 1.2, aL: [.2, .3, .5] }, t, { mood: t > GO + 1.1 ? 'sly' : 'happy', look: -1 }, 7);
  placeShade(miaSh, { x: mx + (peel > 0 && peel < 1 ? Math.sin(t * 60) * .02 : 0), z: WN + .07, rise: 1, scale: 1.3, turn: walkK > 0 && walkK < 1 ? -Math.PI / 2 : -Math.PI / 2, op: 1 }); miaSh.holder.position.y = lerp(.3, .1, walkK);
  applyPose(shade, t > q2 ? keys(t, [[q2, { ...POSE.stand, aL: [.6, .6, .3] }], [q2 + .2, { ...POSE.armsUp, aL: [.6, .6, .3], aR: [0, -2.7, .2] }]]) : t > q1 ? { ...POSE.stand, aL: [.6, .6, .3] } : { ...POSE.stand, lean: .1 }, t, { mood: t > q2 ? 'happy' : t > GO + 1.1 ? 'wide' : 'calm', look: 1 }, 3);
  placeShade(shade, { x: DX2 - .85, z: WN + .03, rise: 1, scale: 1.3, turn: t > q2 + .1 ? 0 : Math.PI / 2, op: 1 }); shade.holder.position.y = .1;
  const [jx, jy] = hh(t, .015);
  if (t < GO + .6) cam(DX2 - .05 + jx, 1.3 + jy, lerp(3.4, 3.0, ease(t, 0, GO)), DX2 - .1, 1.1, -1.8, 34);
  else cam(DX2 - .3 + jx, 1.45 + jy, lerp(4.0, 3.6, ease(t, GO, GO + 4)), DX2 - .35, 1.3, -2.0, 36);
  FX = { fy: .45, fw: .3, blur: 6, bloom: .45, warm: -.02 };
  return () => { if (peel > 0 && peel < 1) { const [x, y] = toScreen(DX2 + .2, 1.4, WN); burst((t - GO - 1.1), x, y, '#07060c', 12, 260); }
    if (t > q1) { const [x, y] = toScreen(DX2 - .7, 2.1, WN); heartsFloat(t - q1, x, y, .7, 300, 10); }
    drawLines(T, { m1: { y: 1480 }, m2: { y: 1480 }, q1: { y: 420, size: 110 }, q2: { y: 420, size: 110 } }); };
};
// 14. КЛИФФХЭНГЕР: в доме зажигается свет — «Where's my shadow?!»; Sam: «…Oh, fuck.»; правило №1 — до заката
S.S14 = (t, T) => { hideAll(); nightDoor(1); const r1 = lt('r1'), r2 = lt('r2');
  put(hero, DX2 - .6, -1.3, Math.PI / 2 - .3 + ease(t, r1 + .3, r1 + .7) * .6, keys(t, [[0, { ...POSE.stand, headY: .6 }], [r1 + .4, { ...POSE.stand, headX: -.1 }], [r2, { ...POSE.facepalm }]]), t, { expr: t > r1 ? 'scared' : 'surprised', wide: true, mouth: talkG(T, 'r2'), lookX: .2 });
  applyPose(shade, { ...POSE.stand, aL: [.6, .6, .3], headY: t > r1 ? .5 : 0 }, t, { mood: t > r1 ? 'wide' : 'happy', look: 1 }, 3); placeShade(shade, { x: DX2 - .85, z: WN + .03, rise: 1, scale: 1.3, turn: 0, op: 1 }); shade.holder.position.y = .1;
  applyPose(miaSh, { ...POSE.stand, aR: [.6, -.6, .3], headY: t > r1 ? -.5 : 0 }, t, { mood: t > r1 ? 'wide' : 'happy', look: -1 }, 7); placeShade(miaSh, { x: DX2 - .5, z: WN + .07, rise: 1, scale: 1.3, turn: 0, op: 1 }); miaSh.holder.position.y = .1;
  const [jx, jy] = hh(t, .02); const cl = ease(t, r2 - .4, r2, sm);
  cam(lerp(DX2 - .2, DX2 - .55, cl) + jx, lerp(1.4, 1.0, cl) + jy, lerp(3.8, 2.0, cl), lerp(DX2 - .2, DX2 - .6, cl), lerp(1.25, .95, cl), -1.6, 36);
  FX = { fy: .45, fw: .3, blur: 6, bloom: .5, warm: -.02 };
  return () => { const gk = ease(t, r1 - .2, r1); if (gk > 0) { const [x, y] = toScreen(DX2, 1.45, -2.08); ctx.save(); ctx.globalAlpha = gk * (.7 + .3 * Math.sin(t * 30)); const g = ctx.createRadialGradient(x, y, 10, x, y, 260); g.addColorStop(0, 'rgba(255,230,160,.9)'); g.addColorStop(1, 'rgba(255,200,120,0)'); ctx.fillStyle = g; ctx.fillRect(x - 300, y - 300, 600, 600); ctx.restore(); }
    drawLines(T, { r1: { y: 360, size: 74 }, r2: { y: 1480, size: 80 } });
    const sk = r2 + DURS.r2 + .2; if (t > sk) stamp(t, sk, 'RULE #1: TILL SUNSET', { y: 1180, size: 58, rot: -.08 }); };
};
// 15. Финальная плашка: вопрос зрителям
S.S15 = (t, T) => { useSet('night'); hideAll(); FX = { skip: true };
  return () => { const g = ctx.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, '#07060c'); g.addColorStop(1, '#2a0e18'); ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
    const sun = 520 + ease(t, 0, 4.8) * 120; ctx.save(); ctx.fillStyle = '#ff8a4a'; ctx.shadowColor = '#ffb070'; ctx.shadowBlur = 80; ctx.beginPath(); ctx.arc(540, sun, 130, Math.PI, 0); ctx.fill(); ctx.restore(); ctx.fillStyle = '#07060c'; ctx.fillRect(0, 520, 1080, 400);
    const b1 = Math.abs(Math.sin(t * 1.3)) > .08 ? 1 : .1, b2 = Math.abs(Math.sin(t * 1.1 + 1)) > .08 ? 1 : .1;
    ctx.save(); ctx.fillStyle = '#f4f8ff'; ctx.shadowColor = '#fff'; ctx.shadowBlur = 30; [[-120, b1], [120, b2]].forEach(([x, b]) => [-1, 1].forEach(s => { ctx.beginPath(); ctx.ellipse(540 + x + s * 45, 700, 30, 13 * b, s * -.15, 0, 7); ctx.fill(); })); ctx.restore();
    narr(t, .2, 4.8, 'Will Mia make it to sunset?', { y: 1040, size: 72, n: 16, accent: ['sunset?'] });
    narr(t, 1.6, 4.8, 'Tell us in the comments', { y: 1330, size: 60, n: 26, accent: ['comments'] });
    ctx.save(); ctx.globalAlpha = ease(t, .8, 1.2); ctx.textAlign = 'center'; ctx.font = '600 40px Unb'; ctx.fillStyle = '#d8b6c8'; ctx.fillText('FINAL EPISODE · tomorrow', 540, 1560); ctx.restore(); };
};

// ---- монтаж ----
const WIPES = ['FB', 'S4', 'SS', 'S5', 'S11', 'S12', 'S15'].map(id => starts[id]);
window.SCENE = { duration: TOTAL, fps: 30, width: W, height: H };
window.SHOT_STARTS = SHOTS.map(([id]) => [id, starts[id]]);
let fontsOk = false;
window.renderFrame = async T => {
  if (!fontsOk) { await Promise.all(['800 40px Unb', '900 40px Unb', '600 40px Unb', '700 40px Cav'].map(f => document.fonts.load(f))); fontsOk = true; TEX_REDRAW.forEach(f => f()); }
  let i = SHOTS.length - 1; for (let j = 0; j < SHOTS.length; j++) if (T < starts[SHOTS[j][0]] + SHOTS[j][1]) { i = j; break; }
  const id = SHOTS[i][0]; SHOT0 = starts[id]; const t = T - SHOT0; FX = {};
  scene.fog = null; const over = S[id](t, T);
  if (!FX.skip) { scene.updateMatrixWorld(true); try { renderer.render(scene, camera); } catch (e) { scene.traverse(o => { if (o.material) [].concat(o.material).forEach(m => m.needsUpdate = true); }); renderer.render(scene, camera); } }
  composite({ t: T, tilt: FX.skip ? 0 : 1, fy: FX.fy ?? .5, fw: FX.fw ?? .24, blur: FX.blur ?? 7, bloom: FX.bloom ?? 0, warm: FX.warm ?? 0, vign: .45, grain: .05 });
  over && over();
  for (const w of WIPES) { const k = (T - (w - .38)) / .76; if (k > 0 && k < 1) shadowWipe(sm(k), 1, true); }
};
