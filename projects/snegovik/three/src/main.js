// ONE CONDITION — пластилиновое 3D. Снеговику нельзя в тепло; семья выносит праздник к нему.
import { THREE, W, H, K, clamp, lerp, sm, outE, back, h1, noise, renderer, camera, clay, glow, mesh, G, canvasTex, skyTex, ctx, composite } from './core.js';
import { makeToy, applyPose, keys, walk, POSE } from './toy.js';
const DUR = window.DURATION = 42.5;
const ss = (a, b, v) => sm(clamp((v - a) / (b - a)));
const eio = k => (k = clamp(k), k < .5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2);
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const P = (x, y, z, ...ch) => { const g = new THREE.Group(); g.position.set(x, y, z); ch.forEach(c => c && g.add(c)); return g; };
const scene = new THREE.Scene(); scene.fog = new THREE.FogExp2('#1c2850', .035);
scene.background = skyTex([[0, '#0b1230'], [.5, '#1b2a5a'], [.85, '#3a3f78'], [1, '#6a5a8a']]);

// ---------- свет
const hemi = new THREE.HemisphereLight('#8fa2d8', '#3a2a30', .75); renderer.toneMappingExposure = 1.25; scene.add(hemi);
const moon = new THREE.DirectionalLight('#a8bcff', .75); moon.position.set(-8, 12, 10); moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048);
Object.assign(moon.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 40 }); moon.shadow.bias = -.0006; moon.shadow.radius = 4; scene.add(moon);
const roomL = new THREE.PointLight('#ffb470', 9, 12, 1.4); roomL.position.set(0, 2.3, -2); roomL.castShadow = true; roomL.shadow.mapSize.set(1024, 1024); scene.add(roomL);
const winSpot = new THREE.SpotLight('#ffb064', 14, 14, .6, .6, 1.2); winSpot.position.set(0, 1.8, -1.6); winSpot.target.position.set(.2, 0, 3); winSpot.castShadow = true; scene.add(winSpot); scene.add(winSpot.target);
const doorSpot = new THREE.SpotLight('#ffb064', 0, 12, .55, .7, 1.2); doorSpot.position.set(2.6, 1.8, -1.2); doorSpot.target.position.set(2.4, 0, 3.5); doorSpot.castShadow = true; scene.add(doorSpot); scene.add(doorSpot.target);
const party = new THREE.PointLight('#ffc27a', 0, 7, 1.6); party.position.set(-.8, 1.4, 2.8); scene.add(party);

// ---------- двор
const snowM = clay('#eef2fa', { roughness: .95 });
const gGeo = new THREE.PlaneGeometry(60, 60, 120, 120); { const p = gGeo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i); p.setZ(i, (noise(1, x * .7) * .06 + noise(2, y * .9) * .05) * (Math.abs(x) > 1.2 || y < -1 ? 1 : .3)); } gGeo.computeVertexNormals(); }
const ground = mesh(gGeo, snowM, false, true); ground.rotation.x = -Math.PI / 2; scene.add(ground);
// дом: фасад с окном и дверью
const wallM = clay('#a8463a', { roughness: .85 }), trimM = clay('#f2ead8'), roofM = clay('#2c3456');
const house = new THREE.Group(); scene.add(house);
const WX0 = -1.25, WX1 = 1.25, WY0 = .85, WY1 = 2.35, DX0 = 2.1, DX1 = 3.1, DY1 = 2.15;
const wbox = (x0, x1, y0, y1) => { const m = mesh(G.box(x1 - x0, y1 - y0, .3), wallM); m.position.set((x0 + x1) / 2, (y0 + y1) / 2, 0); house.add(m);
  for (let y = Math.ceil(y0 / .3) * .3; y < y1 - .05; y += .3) { if (y < y0 + .05) continue; const l = mesh(G.box(x1 - x0, .02, .02), clay('#8a3a30'), false); l.position.set((x0 + x1) / 2, y, .16); house.add(l); } };
wbox(-5, WX0, 0, 3.4); wbox(WX1, DX0, 0, 3.4); wbox(DX1, 5, 0, 3.4); wbox(WX0, WX1, 0, WY0); wbox(WX0, WX1, WY1, 3.4); wbox(DX0, DX1, DY1, 3.4);
[[WX0 - .06, WX1 + .06, WY0 - .08, WY0], [WX0 - .06, WX1 + .06, WY1, WY1 + .08]].forEach(([a, b, c, d]) => { const m = mesh(G.box(b - a, d - c, .4), trimM); m.position.set((a + b) / 2, (c + d) / 2, .05); house.add(m); });
[WX0, 0, WX1].forEach(x => { const m = mesh(G.box(.07, WY1 - WY0, .12), trimM); m.position.set(x, (WY0 + WY1) / 2, .02); house.add(m); }); { const m = mesh(G.box(WX1 - WX0, .06, .12), trimM); m.position.set(0, (WY0 + WY1) / 2, .02); house.add(m); }
const sill = mesh(G.box(2.8, .14, .5), snowM); sill.position.set(0, WY0 - .02, .25); house.add(sill);
// иней на стекле
const frost = canvasTex(256, 256, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, w * .2, w / 2, h / 2, w * .72); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(235,245,255,.85)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 1; for (let i = 0; i < 160; i++) { const a = h1(i) * 6.283, r = w * (.35 + h1(i * 2) * .2), x = w / 2 + Math.cos(a) * r, y = h / 2 + Math.sin(a) * r; g.beginPath(); g.moveTo(x, y); g.lineTo(x - Math.cos(a) * 20, y - Math.sin(a) * 20); g.stroke(); } });
const glass = mesh(G.plane(WX1 - WX0, WY1 - WY0), new THREE.MeshStandardMaterial({ map: frost, transparent: true, opacity: .95, roughness: .1, metalness: .1, depthWrite: false }), false, false); glass.position.set(0, (WY0 + WY1) / 2, .08); house.add(glass);
// дверь (петля слева)
const doorG = P(DX0, 0, .05); house.add(doorG); const door = mesh(G.box(DX1 - DX0, DY1, .1), clay('#2f5a40', { roughness: .6 })); door.position.set((DX1 - DX0) / 2, DY1 / 2, 0); doorG.add(door);
const knob = mesh(G.sph(.05), clay('#e6b450', { metalness: .7, roughness: .3 })); knob.position.set(.85, 1.0, .08); doorG.add(knob);
const wreath = mesh(new THREE.TorusGeometry(.2, .07, 10, 24), clay('#2f6a46', { roughness: .95 })); wreath.position.set(.5, 1.6, .1); doorG.add(wreath);
for (let i = 0; i < 8; i++) { const b = mesh(G.sph(.03), clay('#c8343c', { roughness: .4 })); b.position.set(.5 + Math.cos(i * .8) * .2, 1.6 + Math.sin(i * .8) * .2, .16); doorG.add(b); }
const doorGlow = mesh(G.plane(DX1 - DX0, DY1), glow('#ffc070', 1.4), false, false); doorGlow.position.set((DX0 + DX1) / 2, DY1 / 2, -.12); house.add(doorGlow);
const porch = mesh(G.sph(.1), glow('#ffd9a0', 2)); porch.position.set(3.4, 2.4, .25); house.add(porch);
// крыша и снег
const roof = mesh(G.box(10.6, .3, 4), roofM); roof.position.set(0, 3.55, -1.6); house.add(roof); const rs = mesh(G.box(10.8, .25, 4.2), snowM); rs.position.set(0, 3.8, -1.6); house.add(rs);
for (let i = 0; i < 14; i++) { const ic = mesh(G.cone(.04, .2 + h1(i) * .3, 6), clay('#dfeefa', { roughness: .1, transparent: true, opacity: .85 })); ic.rotation.x = Math.PI; ic.position.set(-4.8 + i * .72, 3.25, .3); house.add(ic); }
// гирлянда по карнизу
const bulbs = []; const BC = ['#ffcf6a', '#ff5a4a', '#6ac8ff', '#8cf27a', '#ff9ad6'];
for (let i = 0; i < 34; i++) { const x = -4.9 + i * .3; const b = mesh(G.sph(.045, 8), glow(BC[i % 5], 2.4), false, false); b.position.set(x, 3.25 - Math.abs(Math.sin(i * .9)) * .1, .35); house.add(b); bulbs.push(b); }
// комната внутри
const room = new THREE.Group(); scene.add(room);
const rm = (w, h, d, c, x, y, z) => { const m = mesh(G.box(w, h, d), clay(c)); m.position.set(x, y, z); room.add(m); return m; };
rm(10, .1, 5, '#7a4a2e', 0, .02, -2.5); rm(10, 3.4, .2, '#e8d6b0', 0, 1.7, -4.8); rm(.2, 3.4, 5, '#e8d6b0', -4.9, 1.7, -2.5);
for (let i = 0; i < 24; i++) rm(.06, 3.2, .02, '#d6be92', -4.6 + i * .4, 1.7, -4.68);
const fp = rm(1.6, 1.3, .5, '#9a4a36', -2.2, .65, -4.5); const fire = mesh(G.cone(.25, .55, 8), glow('#ff8a3a', 2.6), false, false); fire.position.set(-2.2, .45, -4.2); room.add(fire);
rm(1.8, .12, .6, '#f2ead8', -2.2, 1.36, -4.45);
const itree = new THREE.Group(); for (let i = 0; i < 4; i++) { const c = mesh(G.cone(.75 - i * .15, .8, 12), clay(i % 2 ? '#3e7a52' : '#2c5a40')); c.position.y = .6 + i * .45; itree.add(c); }
for (let i = 0; i < 26; i++) { const a = i * 2.4, y = .5 + (i / 26) * 1.7, r = .7 - (i / 26) * .55; const b = mesh(G.sph(.04, 8), glow(BC[i % 5], 2.2), false, false); b.position.set(Math.cos(a) * r, y, Math.sin(a) * r); itree.add(b); }
const istar = mesh(G.sph(.1, 8), glow('#ffd36a', 3), false, false); istar.position.y = 2.45; itree.add(istar); itree.position.set(2.3, .05, -3.4); room.add(itree);
// стол в комнате (выносят потом — отдельный объект)
const tableG = new THREE.Group(); { const top = mesh(G.box(1.5, .07, .8), clay('#9a6238')); top.position.y = .72; tableG.add(top); const cl = mesh(G.box(1.56, .02, .86), clay('#f2ead8')); cl.position.y = .765; tableG.add(cl);
  [[-.65, -.32], [.65, -.32], [-.65, .32], [.65, .32]].forEach(([x, z]) => { const l = mesh(G.cyl(.035, .035, .72, 8), clay('#9a6238')); l.position.set(x, .36, z); tableG.add(l); });
  for (let i = 0; i < 4; i++) { const pl = mesh(G.cyl(.12, .1, .02, 16), clay('#fafaf4', { roughness: .3 })); pl.position.set(-.5 + i * .33, .785, .22); tableG.add(pl); }
  const tk = mesh(G.sph(.17, 16), clay('#b8662e', { roughness: .4 })); tk.scale.set(1.3, .8, 1); tk.position.set(0, .88, -.1); tableG.add(tk);
  for (let i = 0; i < 3; i++) { const cd = mesh(G.cyl(.022, .022, .2, 8), clay('#f2ead8')); cd.position.set(-.4 + i * .4, .87, -.25); tableG.add(cd); const f = mesh(G.sph(.025, 8), glow('#ffcf6a', 3), false, false); f.position.set(-.4 + i * .4, 1.0, -.25); f.scale.y = 1.6; tableG.add(f); } }
scene.add(tableG);
// двор: ёлка с огнями, скамейка, забор, соседи
const ytree = new THREE.Group(); for (let i = 0; i < 4; i++) { const c = mesh(G.cone(1.0 - i * .2, 1.0, 12), clay(i % 2 ? '#3e7a52' : '#2c5a40')); c.position.y = .7 + i * .55; ytree.add(c); const s = mesh(G.cone(.6 - i * .12, .35, 12), snowM); s.position.y = 1.05 + i * .55; ytree.add(s); }
const ybulbs = []; for (let i = 0; i < 40; i++) { const a = i * 2.3, y = .5 + (i / 40) * 2.1, r = 1.0 - (i / 40) * .8; const b = mesh(G.sph(.05, 8), glow(BC[i % 5], 2.4), false, false); b.position.set(Math.cos(a) * r, y, Math.sin(a) * r); ytree.add(b); ybulbs.push(b); }
ytree.position.set(-3.6, 0, 2.6); scene.add(ytree);
const bench = new THREE.Group(); bench.add(P(0, .45, 0, mesh(G.box(1.2, .08, .4), clay('#7a5236')))); [[-.5], [.5]].forEach(([x]) => bench.add(P(x, .22, 0, mesh(G.box(.08, .45, .35), clay('#5a3a26'))))); bench.add(P(0, .5, 0, mesh(G.box(1.25, .06, .45), snowM)));
bench.position.set(-1.6, 0, 3.0); bench.rotation.y = .25; scene.add(bench);
for (let i = 0; i < 16; i++) { const p = mesh(G.box(.1, .9, .06), clay('#efe6d6')); p.position.set(-6 + i * .8, .45, 6.5); scene.add(p); const c = mesh(G.box(.14, .1, .1), snowM); c.position.set(-6 + i * .8, .93, 6.5); scene.add(c); }
for (let i = 0; i < 6; i++) { const nh = new THREE.Group(); nh.add(P(0, 1.3, 0, mesh(G.box(3, 2.6, 2), clay(['#5a3a50', '#3a4a6a', '#6a4a3a'][i % 3])))); nh.add(P(0, 2.8, 0, mesh(G.box(3.2, .4, 2.2), snowM)));
  for (let j = 0; j < 3; j++) nh.add(P(-.9 + j * .9, 1.4, 1.02, mesh(G.plane(.5, .6), glow('#ffc070', 1.2), false, false))); nh.position.set((i % 2 ? 1 : -1) * (9 + i * 2.5), 0, -2 - i * 3); scene.add(nh); }

// ---------- снеговик
const coal = clay('#141418', { roughness: .4 }), stick = clay('#5a3a22');
const SN = { root: new THREE.Group() }; scene.add(SN.root);
SN.base = mesh(G.sph(.4, 32), snowM); SN.base.position.y = .36; SN.root.add(SN.base);
SN.torso = P(0, .68, 0); SN.root.add(SN.torso); const mid = mesh(G.sph(.3, 32), snowM); mid.position.y = .16; SN.torso.add(mid);
for (let i = 0; i < 3; i++) { const b = mesh(G.sph(.03, 10), coal); b.position.set(0, .3 - i * .12, .28 - Math.abs(i - 1) * .02); SN.torso.add(b); }
const scarf = mesh(new THREE.TorusGeometry(.2, .065, 10, 24), clay('#2f6a8a', { roughness: 1 })); scarf.rotation.x = Math.PI / 2; scarf.position.y = .44; SN.torso.add(scarf);
SN.tail = mesh(G.box(.1, .3, .04), clay('#2f6a8a', { roughness: 1 })); SN.tail.position.set(.1, .3, .2); SN.torso.add(SN.tail);
SN.head = P(0, .62, 0); SN.torso.add(SN.head); const hd = mesh(G.sph(.23, 32), snowM); SN.head.add(hd);
SN.eyes = [-1, 1].map(s => { const e = P(s * .08, .05, .2); const b = mesh(G.sph(.035, 12), coal, false); b.scale.set(.9, 1.1, .6); e.add(b); const hi = mesh(G.sph(.009, 6), glow('#fff', 1.2), false); hi.position.set(.012, .015, .02); e.add(hi); SN.head.add(e); return e; });
SN.lids = [-1, 1].map(s => { const l = mesh(G.sph(.04, 12), snowM, false); l.scale.set(1, .05, .6); l.position.set(s * .08, .09, .205); SN.head.add(l); return l; });
SN.brows = [-1, 1].map(s => { const b = mesh(G.cap(.012, .05), coal, false); b.rotation.z = Math.PI / 2; b.position.set(s * .085, .13, .2); SN.head.add(b); return b; });
SN.nose = P(0, 0, .2); const nz = mesh(G.cone(.035, .22, 10), clay('#ea7a2e', { roughness: .6 })); nz.rotation.x = Math.PI / 2; nz.position.z = .1; SN.nose.add(nz); SN.head.add(SN.nose);
SN.smile = []; for (let i = 0; i < 5; i++) { const a = -.6 + i * .3; const b = mesh(G.sph(.016, 8), coal, false); b.position.set(Math.sin(a) * .09, -.08 - Math.cos(a) * .03 + .03, .21); SN.head.add(b); SN.smile.push(b); }
SN.mouthO = mesh(G.sph(.04, 12), coal, false); SN.mouthO.scale.set(1, .6, .3); SN.mouthO.position.set(0, -.09, .21); SN.head.add(SN.mouthO);
SN.hat = new THREE.Group(); { const h = mesh(G.sph(.2, 20), clay('#c8343c', { roughness: 1 })); h.scale.set(1.05, .75, 1.05); h.position.y = .1; SN.hat.add(h); const c = mesh(G.cyl(.21, .21, .07, 20), clay('#f2ead8', { roughness: 1 })); c.position.y = .05; SN.hat.add(c); const pp = mesh(G.sph(.07, 12), clay('#f2ead8', { roughness: 1 })); pp.position.y = .27; SN.hat.add(pp); }
SN.hat.position.y = .13; SN.head.add(SN.hat);
SN.arms = [-1, 1].map(s => { const sh = P(s * .26, .26, 0); SN.torso.add(sh); const up = mesh(G.cyl(.018, .014, .34, 6), stick); up.rotation.z = Math.PI / 2; up.position.x = s * .17; sh.add(up);
  const el = P(s * .34, 0, 0); sh.add(el); const lo = mesh(G.cyl(.014, .011, .26, 6), stick); lo.rotation.z = Math.PI / 2; lo.position.x = s * .13; el.add(lo);
  const hand = mesh(G.sph(.065, 14), snowM); hand.position.x = s * .28; el.add(hand); for (let f = 0; f < 2; f++) { const tw = mesh(G.cyl(.007, .005, .1, 5), stick); tw.position.set(s * .2, .03 - f * .06, 0); tw.rotation.z = Math.PI / 2 + (f ? -.5 : .5) * s; el.add(tw); }
  return { sh, el, hand }; });
// поза снеговика: x,z, yaw, hop (0..1 фаза прыжка), aL/aR [поднять, локоть], lean, look [x,y], brow, mouth (0..1 'O'), smile, blink, handSize
function snowPose(o, t) {
  const hop = o.hop ?? 0, hy = Math.sin(hop * Math.PI) * .22, sq = hop > 0 && hop < 1 ? Math.cos(hop * Math.PI * 2) * .06 : 0;
  SN.root.position.set(o.x, hy, o.z); SN.root.rotation.y = o.yaw || 0;
  SN.base.scale.set(1 + sq, 1 - sq, 1 + sq); SN.torso.position.y = .68 - sq * .3; SN.torso.rotation.x = o.lean || 0; SN.torso.rotation.z = o.tilt || 0;
  SN.head.rotation.set((o.look?.[1] || 0) * -.3, (o.look?.[0] || 0) * .5, o.headZ || 0);
  const br = Math.sin(t * 2.1) * .01; SN.torso.scale.y = 1 + br;
  SN.arms.forEach((a, i) => { const s = i ? 1 : -1, [up, el] = i ? (o.aR || [.3, .2]) : (o.aL || [.3, .2]); a.sh.rotation.z = s * (up - .4) + noise(i + 4, t * .7) * .05; a.el.rotation.z = s * el; });
  const bl = o.blink ?? (((t + 1.3) % 3.3) < .14 ? 1 : 0); SN.lids.forEach(l => { l.scale.y = .05 + bl * 1.1; l.position.y = .09 - bl * .04; });
  const lx = (o.look?.[0] || 0) * .015, ly = (o.look?.[1] || 0) * .012; SN.eyes.forEach((e, i) => { e.position.set((i ? 1 : -1) * .08 + lx, .05 + ly, .2); e.scale.setScalar(o.wide ? 1.3 : 1); });
  const BR = { calm: [0, 0], sad: [.4, -.005], happy: [-.15, .01], surprised: [0, .03], worried: [.35, .02] }[o.brow || 'calm'];
  SN.brows.forEach((b, i) => { const s = i ? 1 : -1; b.rotation.z = Math.PI / 2 - s * BR[0]; b.position.y = .13 + BR[1]; });
  const mo = o.mouth || 0, smile = o.smile ?? .6; SN.mouthO.visible = mo > .1; SN.mouthO.scale.set(.8 + mo * .3, .3 + mo * .8, .3);
  SN.smile.forEach((b, i) => { b.visible = mo <= .1; const a = -.6 + i * .3; b.position.y = -.05 - Math.cos(a) * .03 * smile * 2 + smile * .03 - .02; });
  SN.arms[1].hand.scale.setScalar(o.handR ?? 1); SN.arms[0].hand.scale.setScalar(o.handL ?? 1);
  SN.hat.visible = !!o.hat; SN.nose.rotation.x = o.noseDroop || 0; SN.nose.visible = o.nose !== false;
}

// ---------- люди
const LK = { mia: { skin: '#f4c8a8', hair: '#6a3a22', top: '#c8343c', top2: '#f2ead8', pants: '#2e3550', shoes: '#3a2a22', hood: true, eye: '#1a1210', blush: .6 },
  mom: { skin: '#f0c2a2', hair: '#4a2a1a', top: '#3f6b8a', top2: '#f2ead8', pants: '#2a2a3a', shoes: '#2a1a12', hood: false, eye: '#1a1210', blush: .4 },
  dad: { skin: '#e8b892', hair: '#2a1a12', top: '#2f5a40', top2: '#c8343c', pants: '#3a3a4a', shoes: '#2a1a12', hood: false, eye: '#1a1210', blush: .3 },
  gpa: { skin: '#eab89a', hair: '#e2e2e6', top: '#7a5a3a', top2: '#c8b48a', pants: '#3a3030', shoes: '#2a1a12', hood: false, eye: '#1a1210', blush: .4 } };
const PP = {}; for (const k in LK) { PP[k] = makeToy(LK[k]); scene.add(PP[k].root); }
PP.mia.root.scale.setScalar(.82); PP.gpa.root.scale.setScalar(.96); PP.dad.root.scale.setScalar(1.08);
const place = (T, x, z, yaw = 0, s) => { T.root.position.set(x, 0, z); T.root.rotation.y = yaw; T.root.visible = true; };
// реквизит
const tray = P(0, 0, 0, mesh(G.cyl(.25, .25, .03, 20), clay('#c0c0c8', { metalness: .6, roughness: .3 }))); for (let i = 0; i < 5; i++) tray.add(P(-.15 + i * .07, .04, 0, mesh(G.cyl(.04, .04, .025, 10), clay('#b5652e')))); scene.add(tray);
const watch = mesh(G.cyl(.06, .06, .02, 16), clay('#e6b450', { metalness: .8, roughness: .3 })); watch.rotation.x = Math.PI / 2; scene.add(watch);
const blanket = mesh(G.box(.5, .12, .3), clay('#7a2a34', { roughness: 1 })); scene.add(blanket);
const sparks = [0, 1].map(() => { const g = new THREE.Group(); g.add(P(0, -.15, 0, mesh(G.cyl(.006, .006, .3, 5), clay('#888')))); const f = mesh(G.sph(.03, 8), glow('#fff2c0', 4), false, false); g.add(f); g.userData.f = f; scene.add(g); return g; });
const snowTable = new THREE.Group(); snowTable.add(P(0, .25, 0, mesh(G.box(.6, .5, .45), snowM))); const icic = [0, 1].map(i => { const c = mesh(G.cyl(.04, .025, .14, 8), clay('#dff2ff', { roughness: .05, transparent: true, opacity: .8 })); c.position.set(-.12 + i * .24, .57, .05); snowTable.add(c); return c; });
snowTable.position.set(-.6, 0, 3.15); scene.add(snowTable);
// пар изо рта, капли, искры салюта, снег
const soft = canvasTex(64, 64, (g, w, h) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
const puffs = []; for (let i = 0; i < 40; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: soft, transparent: true, depthWrite: false, opacity: 0 })); scene.add(s); puffs.push(s); }
function puff(i, pos, t, t0, dir = V(0, .15, .3)) { const s = puffs[i], k = (t - t0) % 2.2; const on = k < 1.2; s.visible = on; if (!on) return; const q = k / 1.2; s.position.copy(pos).addScaledVector(dir, q * 1.4); s.scale.setScalar(.06 + q * .25); s.material.opacity = (1 - q) * .45; }
const drops = []; for (let i = 0; i < 10; i++) { const d = mesh(G.sph(.018, 8), clay('#bfe4ff', { roughness: .05, transparent: true, opacity: .85 }), false, false); scene.add(d); drops.push(d); }
const NSN = 2200, sgeo = new THREE.BufferGeometry(), spos = new Float32Array(NSN * 3); sgeo.setAttribute('position', new THREE.BufferAttribute(spos, 3));
const snowP = new THREE.Points(sgeo, new THREE.PointsMaterial({ size: .05, map: soft, transparent: true, depthWrite: false })); snowP.frustumCulled = false; scene.add(snowP);
function snowfall(t, c, dens = 1, sp = .5) { for (let i = 0; i < NSN; i++) { const on = i < NSN * dens; spos[i * 3] = c.x + (h1(i * 1.3) - .5) * 16 + Math.sin(t * .7 + i) * .2; spos[i * 3 + 2] = c.z + (h1(i * 2.9) - .5) * 16 + Math.cos(t * .5 + i) * .15;
  spos[i * 3 + 1] = on ? 7 - ((h1(i * 4.3) * 8 + t * sp * (.6 + h1(i * 5.1) * .8)) % 8) : -99; } sgeo.attributes.position.needsUpdate = true; }
const FW = []; for (let b = 0; b < 6; b++) { const g = new THREE.Group(); for (let i = 0; i < 40; i++) g.add(mesh(G.sph(.12, 6), glow(['#ff6a5a', '#ffd36a', '#7ad0ff', '#9cf28a', '#ff9ad6', '#ffffff'][b], 3), false, false)); g.position.set(-14 + b * 6, 9 + h1(b) * 4, -28); scene.add(g); FW.push(g); }
function fireworks(t, t0) { FW.forEach((g, b) => { const u = t - t0 - b * .45; g.visible = u > 0 && u < 2.4; if (!g.visible) return; const k = 1 - Math.pow(1 - Math.min(1, u / 1.0), 3);
  g.children.forEach((m, i) => { const a = i / 40 * 6.283, e = (h1(i + b * 9) - .5) * 1.4; m.position.set(Math.cos(a) * Math.cos(e) * 4 * k, Math.sin(e) * 4 * k - u * u * .5, Math.sin(a) * Math.cos(e) * 4 * k); m.scale.setScalar(Math.max(.01, 1 - u / 2.4)); }); }); }

// ---------- титры (сетка 1080×1920)
function cap(text, y, o = {}) { const a = o.a ?? 1; if (a <= 0) return; const size = o.size || 72, font = z => `900 ${z}px IB`, maxW = o.maxW || 960;
  const bx = boxFor(ctx, text, { font, size, maxW, pad: .08, lineH: 1.08 }); const w = Math.min(maxW, bx.w + 14), h = bx.h + 8, x = (1080 - w) / 2;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(540, y + h / 2); const sc = o.pop ?? 1; ctx.scale(sc, sc); ctx.translate(-540, -(y + h / 2));
  if (o.plate !== false) { ctx.fillStyle = 'rgba(14,20,40,.8)'; ctx.beginPath(); ctx.roundRect(x, y, w, h, 26); ctx.fill(); }
  drawBoxText(ctx, text, x, y, w, h, { font, size, min: 30, color: '#f6eede', pad: .08, lines: 3, lineH: 1.08 }); ctx.restore(); }
const clockAt = t => t < 13 ? '11:20 PM' : t < 24 ? '11:45 PM' : t < 27 ? '11:58 PM' : t < 34.6 ? '11:59 PM' : '12:00 AM';
function clockTag(t, a = 1) { if (a <= 0) return; const txt = `DEC 31 · ${clockAt(t)}`; ctx.save(); ctx.globalAlpha = a; const f = z => `600 ${z}px IS`; const bx = boxFor(ctx, txt, { font: f, size: 40, maxW: 600, pad: .1 });
  const w = bx.w + 10, h = bx.h + 4, x = (1080 - w) / 2; ctx.fillStyle = 'rgba(246,238,222,.92)'; ctx.beginPath(); ctx.roundRect(x, 230, w, h, 18); ctx.fill(); drawBoxText(ctx, txt, x, 230, w, h, { font: f, size: 40, min: 20, color: '#1a2040', pad: .1, lines: 1 }); ctx.restore(); }

// ---------- монтаж
const S = []; const shot = (a, b, fn) => S.push({ a, b, fn });
const camAt = (p, tg, fov = 34) => { camera.position.copy(p); camera.lookAt(tg); camera.fov = fov; camera.updateProjectionMatrix(); };
const hideAll = () => { for (const k in PP) PP[k].root.visible = false; [tray, watch, blanket, ...sparks].forEach(o => o.visible = false); };
const breathe = (t, T, i, t0 = 0) => { const p = new THREE.Vector3(); T.head.getWorldPosition(p); p.y -= .02; const d = V(0, .1, .35).applyAxisAngle(V(0, 1, 0), T.root.rotation.y); puff(i, p, t, t0, d); };
const doorOpen = k => { doorG.rotation.y = -k * 1.6; doorGlow.visible = k > .02; doorSpot.intensity = k * 16; };
const insideFamily = (t) => { // родители и дедушка за окном: смеются, танцуют
  place(PP.mom, -.5, -2.2, .3); applyPose(PP.mom, { aL: [.3, .3, 1.2], aR: [.4, -.3, 1.3], headZ: Math.sin(t * 2) * .1, twist: Math.sin(t * 2) * .2 }, t, { expr: 'happy', mouth: .4 + .3 * Math.sin(t * 5) }, 2);
  place(PP.dad, .6, -2.5, -.3); applyPose(PP.dad, { aL: [0, .3, .2], aR: [0, -2.5 + Math.sin(t * 4) * .3, .5] }, t, { expr: 'happy', mouth: .5 }, 3);
  place(PP.gpa, -1.6, -3.2, .5); applyPose(PP.gpa, { aL: [.5, .2, 1.4], aR: [.5, -.2, 1.4], lean: .1 }, t, { expr: 'happy', mouth: .2 }, 4);
};
const toyPose = (T, pose, t, face, seed) => applyPose(T, pose, t, face, seed);

// 1. ХУК 0–3: изнутри — снеговик прижался к стеклу
shot(0, 3.2, (t, u) => {
  camAt(V(.15 + u * .03, 1.5, -2.6 + u * .1), V(.3, 1.45, .6), 34);
  snowPose({ x: .3, z: .62, yaw: Math.PI, look: [0, .1], brow: 'sad', smile: .1, lean: .22, aL: [1.2, .4], aR: [1.3, .5] }, t);
  insideFamily(t); place(PP.mia, -2.6, -3.6, .6); toyPose(PP.mia, { aR: [0, -2.4, .9] }, t, { expr: 'happy', mouth: .5 }, 5);
  return { tilt: .6, fy: .48, fw: .16, blur: 6, warm: .12, bloom: .35, snow: 1, cap: () => cap("HE CAN'T GO INSIDE.\nEVER.", 420, { size: 84, pop: lerp(.92, 1, back(clamp(u / .3))) }) };
});
// 2. 3.2–8: Мия долепливает, убегает в дом; он оживает
shot(3.2, 8.2, (t, u) => {
  camAt(V(3.8 - u * .1, 1.6, 6.2), V(.4, 1.0, 1.4), 34);
  const nose = u > .5; snowPose({ x: .7, z: 1.7, yaw: -.1, nose, blink: u < 4.0 ? 1 : undefined, look: u > 4.3 ? [Math.sin((u - 4.3) * 3) * .8, .1] : [0, 0], brow: u > 4.6 ? 'surprised' : 'calm', smile: .4, wide: u > 4.2 && u < 4.8 }, t);
  const run = ss(1.9, 3.2, u); const mx = lerp(1.25, DX0 + .5, run), mz = lerp(1.9, .5, run);
  place(PP.mia, mx, mz, run > 0 ? Math.atan2(DX0 + .5 - 1.25, .5 - 1.9) : -1.2); PP.mia.root.visible = u < 3.3;
  toyPose(PP.mia, run > 0 && run < 1 ? walk(run * 3, .8) : keys(u, [[0, { aR: [1.4, -.3, .4], lean: .1 }], [.5, { aR: [1.5, -.2, .2], lean: .12 }], [.9, 'stand'], [1.4, { aL: [.3, 0, .4], aR: [.3, 0, .4], headY: .6 }]]), t, { expr: 'happy', mouth: u > 1.4 ? .4 : 0 }, 5);
  doorOpen(ss(1.3, 1.7, u) * (1 - ss(3.4, 3.8, u))); if (u > 1.3 && u < 3.5) { place(PP.mom, DX0 + .5, -.3, 0); toyPose(PP.mom, { aR: [0, -2.2, .8] }, t, { expr: 'happy', mouth: .6 }, 2); }
  breathe(t, PP.mia, 0); insideFamily(t); PP.mom.root.visible = u > 1.3 && u < 3.5;
  return { tilt: .8, fy: .55, fw: .2, blur: 7, warm: .05, bloom: .3, snow: 1, cap: () => clockTag(t, ss(3.3, 3.6, t)) };
});
// 3. 8.2–13: тянется к двери — рука тает, отскакивает
shot(8.2, 13, (t, u) => {
  camAt(V(3.6, 1.4, 3.6), V(2.0, 1.0, .6), 36);
  const h1p = ss(0, 1.6, u), x = lerp(.7, 1.75, h1p), z = lerp(1.7, .75, h1p), hop = (u < 1.6) ? (u * 2.5) % 1 : 0;
  const touch = ss(1.9, 2.3, u), melt = ss(2.3, 3.2, u), jump = ss(3.2, 3.6, u);
  snowPose({ x: x - jump * .5, z: z + jump * .5, yaw: .6, hop: hop || (u > 3.2 && u < 3.7 ? (u - 3.2) / .5 : 0), aR: [lerp(.3, 1.45, touch) - jump * 1.2, .2], aL: [.3 + jump * .8, .4],
    look: [.6 - jump * .6, -.1], brow: melt > .2 ? 'worried' : 'calm', wide: melt > .5, mouth: melt > .4 && u < 4.2 ? .8 : 0, handR: 1 - melt * .45, smile: .3 }, t);
  doorOpen(.08 + ss(1.6, 2.0, u) * .1 - ss(3.5, 4.0, u) * .18);
  drops.forEach((d, i) => { const k = (u - 2.4 - i * .09); d.visible = k > 0 && k < .8; if (!d.visible) return; const p = new THREE.Vector3(); SN.arms[1].hand.getWorldPosition(p); d.position.set(p.x + (h1(i) - .5) * .06, p.y - k * k * 3, p.z); });
  const p = new THREE.Vector3(); SN.arms[1].hand.getWorldPosition(p); puff(1, p, t, 8.2 + 2.3, V(0, .5, 0)); puff(2, p, t, 8.2 + 2.6, V(.1, .5, .1));
  insideFamily(t);
  return { tilt: .8, fy: .5, fw: .2, blur: 7, bloom: .3, snow: 1, cap: () => clockTag(t) };
});
// 4. 13–19: один, лепит себе праздник
shot(13, 19, (t, u) => {
  const cl = u > 3.6; camAt(cl ? V(.1, 1.5, 5.6) : V(1.8, 2.0, 7.2), cl ? V(-1.0, 1.35, 3.3) : V(-1.0, .8, 2.4), cl ? 30 : 36);
  const build = ss(.3, 2.6, u); snowTable.scale.set(1, Math.max(.01, build), 1); icic.forEach((c, i) => c.visible = u > 2.8 + i * .3);
  const hp = ss(0, .8, u); snowPose({ x: lerp(1.2, -1.15, hp), z: lerp(1.0, 3.3, hp), yaw: u < 3.2 ? .5 + Math.sin(u * 6) * .2 : .9, hop: u < .8 ? (u * 3) % 1 : 0, aL: [.9 + Math.sin(u * 9) * .3, .6], aR: [.9 + Math.cos(u * 9) * .3, .6],
    look: u > 3.6 ? [1.0, .15] : [-.3, -.4], brow: u > 4.2 ? 'sad' : 'calm', smile: u > 4.2 ? 0 : .5, handR: .55, lean: u < 3 ? .2 : 0 }, t);
  insideFamily(t);
  return { tilt: .8, fy: .52, fw: .2, blur: 7, bloom: .3, warm: -.05, snow: 1.2, cap: () => clockTag(t) };
});
// 5. 19–24: Мия видит его в окно, выбегает, зовёт; он показывает тающую руку
shot(19, 24, (t, u) => {
  const out = u > 1.7; camAt(out ? V(.9, 1.55, 6.3) : V(.5, 1.75, -2.6), out ? V(-.75, 1.1, 3.2) : V(-.6, 1.2, 2.5), out ? 32 : 34);
  snowPose({ x: -1.15, z: 3.3, yaw: lerp(.9, 1.77, ss(1.9, 2.4, u)), look: out ? [0, .2] : [1.0, .15], brow: u > 3.0 ? 'sad' : u > 2.0 ? 'surprised' : 'sad', smile: u > 2.0 && u < 3 ? .5 : 0,
    headZ: u > 3.1 && u < 3.9 ? Math.sin((u - 3.1) * 14) * .25 : 0, aR: u > 3.5 ? [1.5, .3] : [.3, .2], handR: .55, wide: u > 2 && u < 2.6 }, t);
  insideFamily(t);
  if (!out) { place(PP.mia, .1, -.55, Math.PI); toyPose(PP.mia, { aL: [1.3, .2, .6], aR: [1.3, -.2, .6], lean: .1 }, t, { expr: u > .8 ? 'happy' : 'surprised', mouth: u > .8 ? .5 : .2, wide: u < .8 }, 5); }
  else { const r = ss(1.7, 2.3, u); place(PP.mia, lerp(1.2, -.15, r), lerp(1.4, 3.1, r), -1.37); toyPose(PP.mia, u < 2.3 ? walk(r * 3, .9) : keys(u, [[2.3, { aR: [0, -2.2, 1.2] }], [3.4, { aR: [1.0, -.3, .5], headX: .2 }], [4.2, { aL: [.3, .1, .3], aR: [.3, -.1, .3], headX: .3 }]]), t,
      { expr: u < 3.4 ? 'happy' : 'sad', mouth: u < 3.3 ? .5 : 0, lookX: u > 3.5 ? .6 : 0, lookY: u > 3.5 ? -.6 : 0 }, 5); breathe(t, PP.mia, 3, 19); }
  doorOpen(ss(1.4, 1.8, u));
  return { tilt: .8, fy: .5, fw: .2, blur: 7, bloom: .3, snow: 1.1, cap: () => clockTag(t) };
});
// 6. 24–27: она уходит, он один
shot(24, 27.2, (t, u) => {
  camAt(V(.6 + u * .05, 1.45, 5.9 - u * .1), V(-1.15, 1.25, 3.3), 30);
  snowPose({ x: -1.15, z: 3.3, yaw: 1.0, look: [.8, .05], brow: 'sad', smile: -.2, lean: .1, aL: [.2, .2], aR: [.2, .2], handR: .55 }, t);
  const r = ss(0, 1.2, u); place(PP.mia, lerp(-.2, 2.6, r), lerp(3.0, .5, r), 2.0); PP.mia.root.visible = r < 1; toyPose(PP.mia, walk(r * 4, .7), t, { expr: 'determined' }, 5);
  doorOpen(1 - ss(1.4, 1.8, u)); insideFamily(t);
  return { tilt: .9, fy: .5, fw: .18, blur: 8, bloom: .25, warm: -.08, snow: 1.6, cap: () => clockTag(t) };
});
// 7. 27.2–33.4: семья выносит праздник наружу
shot(27.2, 33.4, (t, u) => {
  camAt(V(1.4 - u * .1, 2.6, 8.6), V(-.4, .9, 2.8), 40);
  doorOpen(ss(0, .3, u));
  snowPose({ x: -1.15, z: 3.3, yaw: lerp(1.0, .6, ss(.3, .8, u)), look: u > .3 ? [.6, .1] : [.8, 0], brow: u > .4 ? (u > 2.5 ? 'happy' : 'surprised') : 'sad', wide: u > .4 && u < 2.5, smile: u > 2.5 ? 1 : .2, aL: u > 2.8 ? [1.4 + Math.sin(u * 8) * .3, .4] : [.3, .2], aR: u > 2.8 ? [1.4, .4] : [.3, .2], handR: .55 }, t);
  const walkTo = (T, x0, z0, x1, z1, a, b, pose, face, seed, carry) => { const r = ss(a, b, u); place(T, lerp(x0, x1, r), lerp(z0, z1, r), Math.atan2(x1 - x0, z1 - z0)); if (r >= 1) T.root.rotation.y = Math.atan2(-1.15 - x1, 3.3 - z1);
    toyPose(T, r > 0 && r < 1 ? { ...walk(r * 5, .4), ...(carry || {}) } : pose, t, face, seed); return r; };
  const rd = walkTo(PP.dad, 2.6, .2, .0, 2.9, .3, 1.9, { aL: [.3, .2, .4], aR: [.3, -.2, .4] }, { expr: 'happy', mouth: .4 }, 3, { aL: [1.2, .2, 1.4], aR: [1.2, -.2, 1.4] });
  tableG.position.set(lerp(2.6, -.1, rd), rd < 1 ? .55 : 0, lerp(.2, 3.25, rd)); tableG.rotation.y = rd * .3;
  walkTo(PP.mom, 2.6, .2, .8, 3.5, .8, 2.4, { aL: [.3, .2, .4], aR: [.3, -.2, .4] }, { expr: 'happy', mouth: .4 }, 2, { aL: [1.1, .2, 1.3], aR: [1.1, -.2, 1.3] });
  const mp = new THREE.Vector3(); PP.mom.aR.hand.getWorldPosition(mp); tray.visible = u < 2.4; tray.position.copy(mp).add(V(0, .05, .1));
  walkTo(PP.gpa, 2.6, .2, -.2, 4.0, 1.3, 3.2, { aR: [1.2, -.2, 1.5] }, { expr: 'happy', mouth: .3 }, 4);
  walkTo(PP.mia, 2.6, .2, -1.7, 3.9, .5, 2.0, keys(u, [[2.0, { aR: [0, -2.4, .4] }], [3, { aL: [1.2, .3, .5], aR: [1.2, -.3, .5] }]]), { expr: 'happy', mouth: .6 }, 5, { aR: [1.2, -.2, 1.3] });
  const bp = new THREE.Vector3(); PP.mia.aR.hand.getWorldPosition(bp); blanket.visible = u < 2.2; blanket.position.copy(bp).add(V(0, .05, .1));
  ['mia', 'mom', 'dad', 'gpa'].forEach((k, i) => breathe(t, PP[k], 4 + i, 27.2 + i * .5));
  party.intensity = ss(1.8, 2.6, u) * 3;
  return { tilt: .7, fy: .55, fw: .22, blur: 7, bloom: .35, warm: .08, snow: 1, cap: () => { clockTag(t); } };
});
// 8. 33.4–38.2: отсчёт, салют, объятие, шапка
shot(33.4, 38.2, (t, u) => {
  const close = u > 2.2; camAt(close ? V(-3.3, 1.55, 5.6) : V(.6, 2.2, 7.6), close ? V(-1.3, 1.2, 3.45) : V(-.6, 1.6, 1.5), close ? 32 : 38);
  tableG.position.set(-.1, 0, 3.25); tableG.rotation.y = .3; party.intensity = 3;
  snowPose({ x: -1.15, z: 3.3, yaw: u > 2.2 ? -.3 : .6, look: u > 1.2 && u < 2.2 ? [.2, .9] : [.6, .1], brow: 'happy', smile: 1, mouth: u > 1.2 && u < 2 ? .7 : 0, aL: [1.5 + Math.sin(u * 8) * .3, .4], aR: [1.4, .4], handR: .55, hat: u > 3.0 }, t);
  place(PP.dad, .0, 2.9, -1.0); toyPose(PP.dad, u > 1.2 ? 'armsUp' : 'stand', t, { expr: 'happy', mouth: .6 }, 3);
  place(PP.mom, .8, 3.5, -1.3); toyPose(PP.mom, u > 1.2 ? 'armsUp' : 'stand', t, { expr: 'happy', mouth: .6 }, 2);
  place(PP.gpa, -.2, 4.0, -2.2); toyPose(PP.gpa, u < 1.2 ? { aR: [1.2, -.2, 1.5], headX: .3 } : 'armsUp', t, { expr: 'happy', mouth: .5 }, 4);
  const wp = new THREE.Vector3(); PP.gpa.aR.hand.getWorldPosition(wp); watch.visible = u < 1.2; watch.position.copy(wp).add(V(0, .04, .05));
  const hug = ss(2.4, 2.9, u); place(PP.mia, lerp(-1.7, -.78, hug), lerp(3.9, 3.62, hug), hug > .3 ? -2.1 : 2.6); toyPose(PP.mia, hug > .5 ? { aL: [1.4, .5, .6], aR: [1.4, -.5, .6], lean: .15 } : (u > 1.2 ? 'armsUp' : 'stand'), t, { expr: 'happy', mouth: hug > .5 ? .2 : .6, lid: hug > .6 ? .6 : 0 }, 5);
  fireworks(t, 34.7); ['mia', 'mom', 'dad', 'gpa'].forEach((k, i) => breathe(t, PP[k], 4 + i, 33.4 + i * .4));
  return { tilt: .7, fy: .5, fw: .22, blur: 7, bloom: .45, warm: .08, snow: .9, cap: () => {
    if (u < 1.2) { const n = 3 - Math.floor(u / .4), k = (u % .4) / .4; ctx.save(); ctx.globalAlpha = 1 - ss(.7, 1, k); const s = lerp(1.4, 1, outE(Math.min(1, k / .3))); ctx.translate(540, 760); ctx.scale(s, s);
      drawBoxText(ctx, String(n), -220, -220, 440, 440, { font: z => `900 ${z}px IB`, size: 360, min: 100, color: '#ffd36a', lines: 1, stroke: 22, strokeColor: '#141a30' }); ctx.restore(); }
    else clockTag(t, 1 - ss(37.6, 38.0, t)); } };
});
// 9. 38.2–42.5: мысль + бенгальский огонь пишет «glean.»
const GL = (() => { const c = document.createElement('canvas'); c.width = 900; c.height = 300; const x = c.getContext('2d'); x.font = '900 230px IB'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#fff'; return { c, x }; })();
shot(38.2, DUR + .1, (t, u) => {
  camAt(V(-1.2 - u * .1, 2.2 + u * .08, 8.0 + u * .3), V(-.8, 1.2, 2.8), 38);
  tableG.position.set(-.1, 0, 3.25); tableG.rotation.y = .3; party.intensity = 3;
  snowPose({ x: -1.15, z: 3.3, yaw: .6, look: [.3, .2], brow: 'happy', smile: 1, aL: [.6, .3], aR: [.6, .3], handR: .55, hat: true }, t);
  place(PP.dad, .0, 2.9, -1.0); toyPose(PP.dad, { aR: [1.0, -.2, 1.2] }, t, { expr: 'happy', mouth: .3 }, 3);
  place(PP.mom, .8, 3.5, -1.3); toyPose(PP.mom, { aL: [.3, .2, 1.0] }, t, { expr: 'happy' }, 2);
  place(PP.gpa, -.2, 4.0, -2.2); toyPose(PP.gpa, 'stand', t, { expr: 'happy', mouth: .2 }, 4);
  place(PP.mia, -1.7, 3.95, 2.6); toyPose(PP.mia, { aR: [1.6, -.3, .2] }, t, { expr: 'happy', mouth: .5 }, 5);
  const sp = new THREE.Vector3(); PP.mia.aR.hand.getWorldPosition(sp); sparks[0].visible = true; sparks[0].position.copy(sp); sparks[0].userData.f.scale.setScalar(1 + Math.sin(t * 30) * .3);
  fireworks(t, 38.4); ['mia', 'mom', 'dad', 'gpa'].forEach((k, i) => breathe(t, PP[k], 4 + i, 38.2 + i * .4));
  return { tilt: .6, fy: .55, fw: .25, blur: 6, bloom: .5, warm: .1, snow: .8, cap: () => {
    cap('Love is when everyone\ngets a little cold for you.', 330, { size: 62, a: ss(38.4, 38.8, t) * (1 - ss(40.4, 40.7, t)) });
    if (t > 40.5) { // светящийся след бенгальского огня пишет слово слева направо
      const k = ss(40.5, 41.7, t); GL.x.clearRect(0, 0, 900, 300); GL.x.fillText('glean.', 450, 150); GL.x.globalCompositeOperation = 'destination-in'; GL.x.fillRect(0, 0, 900 * k, 300); GL.x.globalCompositeOperation = 'source-over';
      ctx.save(); ctx.shadowColor = '#ffd27a'; ctx.shadowBlur = 40; ctx.globalAlpha = .95; ctx.drawImage(GL.c, 90, 300); ctx.shadowBlur = 0; ctx.globalAlpha = .9; ctx.drawImage(GL.c, 90, 300); ctx.restore();
      const hx = 90 + 900 * k * .9 + 45, hy = 450 + Math.sin(k * 40) * 50; ctx.save(); ctx.fillStyle = '#fff6d0'; ctx.shadowColor = '#ffd27a'; ctx.shadowBlur = 50; ctx.beginPath(); ctx.arc(hx, hy, 14 * (k < 1 ? 1 : 0), 0, 7); ctx.fill(); ctx.restore(); }
    if (t > 41.2) cap('Who would you go out in the cold for?', 1360, { size: 50, a: ss(41.2, 41.6, t) }); } };
});

// ---------- кадр
window.renderFrame = function (t) {
  globalThis.__T = t; hideAll(); doorOpen(0); party.intensity = 0; drops.forEach(d => d.visible = false); puffs.forEach(p => p.visible = false);
  tableG.position.set(-.8, 0, -2.6); tableG.rotation.y = 0; snowTable.scale.set(1, 1, 1); icic.forEach(c => c.visible = true);
  if (t < 13) { snowTable.scale.set(1, .001, 1); icic.forEach(c => c.visible = false); }
  bulbs.forEach((b, i) => b.material.color.set(BC[i % 5]).multiplyScalar(1.8 + Math.sin(t * 3 + i) * .6)); ybulbs.forEach((b, i) => b.material.color.set(BC[i % 5]).multiplyScalar(1.8 + Math.sin(t * 2.5 + i * 1.3) * .7));
  fire.scale.set(1 + .15 * Math.sin(t * 13), 1 + .2 * noise(3, t * 6), 1); roomL.intensity = 8 + noise(5, t * 5) * 1.5;
  FW.forEach(g => g.visible = false);
  const s = S.find(s => t >= s.a && t < s.b) || S[S.length - 1];
  const o = s.fn(t, t - s.a) || {};
  snowfall(t, camera.position, o.snow ?? 1, .55);
  renderer.render(scene, camera);
  composite({ tilt: o.tilt ?? .7, fy: o.fy ?? .5, fw: o.fw ?? .2, blur: o.blur ?? 7, vign: .45, grain: .05, t, warm: o.warm || 0, bloom: o.bloom ?? .3 });
  o.cap && o.cap();
};
window.grab = () => ctx.getImageData(0, 0, W, H).data;
window.ready = Promise.all([document.fonts.load('900 40px IB'), document.fonts.load('600 30px IS')]);
