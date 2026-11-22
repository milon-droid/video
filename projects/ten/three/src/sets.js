// Декорации: ночная улица (+неон), кухня, коридор, миниатюра «петля», дневная улица, площадь с фонтаном, крыша на закате.
import { THREE, G, clay, mesh, glow, canvasTex, skyTex, h1, lerp, clamp } from './core.js';
import { makeToy, applyPose, makeShade, placeShade } from './toy.js';

export const scene = new THREE.Scene();
const sets = {};
export function useSet(name) { for (const k in sets) sets[k].visible = k === name; const s = sets[name]; scene.background = s.userData.bg; scene.fog = s.userData.fog || null; return s; }
const reg = (name, g, bg, fog) => { g.userData.bg = bg; g.userData.fog = fog; g.visible = false; scene.add(g); sets[name] = g; return g; };
const add = (g, m, x = 0, y = 0, z = 0) => { m.position.set(x, y, z); g.add(m); return m; };

// окна домов: цвет стены + светящиеся окна (emissiveMap)
function windowMats(wall, lit, seed, cols = 4, rows = 6, ratio = .45, w = 128, h = 256) {
  const draw = em => canvasTex(w, h, (g) => { g.fillStyle = em ? '#000' : wall; g.fillRect(0, 0, w, h); const cw = w / cols, rh = h / rows;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const on = h1(seed * 100 + r * 10 + c) < ratio; g.fillStyle = em ? (on ? lit : '#000') : (on ? lit : 'rgba(20,20,40,.55)'); g.fillRect(c * cw + cw * .2, r * rh + rh * .22, cw * .6, rh * .52); } });
  const map = draw(false), em = draw(true);
  return new THREE.MeshStandardMaterial({ map, emissiveMap: em, emissive: '#ffffff', emissiveIntensity: 1.1, roughness: .9 });
}
function building(g, x, z, w, h, d, wall, lit, seed, ratio = .45) { const m = windowMats(wall, lit, seed, Math.max(2, Math.round(w * 2)), Math.max(2, Math.round(h * 1.6)), ratio); const b = mesh(G.box(w, h, d), [m, m, clay(wall), clay(wall), m, m], true, true); add(g, b, x, h / 2, z); return b; }

// ===== НОЧНАЯ УЛИЦА =====
export const night = (() => {
  const g = new THREE.Group();
  g.add(new THREE.HemisphereLight('#7a8aff', '#3a2a40', .85));
  const moon = mesh(G.sph(1.4), glow('#f4ecd8', 1.4), false, false); add(g, moon, 7, 15, -40);
  // звёзды
  const sg = new THREE.BufferGeometry(); const pts = []; for (let i = 0; i < 300; i++) pts.push((h1(i) - .5) * 160, 8 + h1(i + 3) * 40, -60 - h1(i + 7) * 20); sg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  g.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: '#ffffff', size: .25, sizeAttenuation: true, fog: false })));
  // тротуар с плиткой
  const tile = canvasTex(256, 256, (c) => { c.fillStyle = '#3e3956'; c.fillRect(0, 0, 256, 256); c.strokeStyle = '#2a2640'; c.lineWidth = 6; for (let i = 0; i <= 4; i++) { c.beginPath(); c.moveTo(i * 64, 0); c.lineTo(i * 64, 256); c.stroke(); c.beginPath(); c.moveTo(0, i * 64); c.lineTo(256, i * 64); c.stroke(); } for (let i = 0; i < 300; i++) { c.fillStyle = `rgba(0,0,0,${h1(i) * .15})`; c.fillRect(h1(i + 1) * 256, h1(i + 2) * 256, 3, 3); } });
  tile.wrapS = tile.wrapT = THREE.RepeatWrapping; tile.repeat.set(20, 20);
  const ground = mesh(G.plane(60, 60), new THREE.MeshStandardMaterial({ map: tile, roughness: .95 }), false, true); ground.rotation.x = -Math.PI / 2; g.add(ground);
  // проезжая часть впереди
  const road = mesh(G.plane(60, 6), clay('#24222e'), false, true); road.rotation.x = -Math.PI / 2; add(g, road, 0, .005, 6.5);
  const curb = mesh(G.box(60, .12, .25), clay('#5a5470'), false, true); add(g, curb, 0, .06, 3.4);
  // стена дома с кирпичом
  const brick = canvasTex(512, 512, (c) => { c.fillStyle = '#3a2f4e'; c.fillRect(0, 0, 512, 512); for (let r = 0; r < 16; r++) for (let k = 0; k < 9; k++) { c.fillStyle = `hsl(${262 + h1(r * 9 + k) * 14},${18 + h1(k + r) * 10}%,${30 + h1(r * 3 + k * 7) * 9}%)`; c.fillRect(k * 64 - (r % 2) * 32 + 3, r * 32 + 3, 58, 26); } });
  brick.wrapS = brick.wrapT = THREE.RepeatWrapping; brick.repeat.set(6, 2.4);
  const wallM = new THREE.MeshStandardMaterial({ map: brick, roughness: .95 });
  const wall = mesh(G.box(24, 4.4, .3), wallM, true, true); add(g, wall, 0, 2.2, -2.3);
  // окна в стене
  [[1.6, 2.4], [3.6, 2.4], [-3.4, 2.6], [5.8, 2.6]].forEach(([x, y], i) => { const fr = mesh(G.rbox(1.0, 1.25, .12, .03), clay('#1e1830'), false, true); add(g, fr, x, y, -2.12);
    const gl = mesh(G.plane(.84, 1.08), glow(i % 2 ? '#ffd27a' : '#ffbf6a', i === 2 ? .25 : 1.05), false, false); add(g, gl, x, y, -2.05);
    const cr = mesh(G.box(.06, 1.08, .04), clay('#1e1830')); add(g, cr, x, y, -2.03); const cr2 = mesh(G.box(.84, .06, .04), clay('#1e1830')); add(g, cr2, x, y, -2.03); });
  // дома за стеной
  for (let i = 0; i < 14; i++) building(g, -18 + i * 2.8 + h1(i) * .8, -6 - h1(i + 4) * 5, 2.2 + h1(i + 1), 5 + h1(i + 2) * 7, 2, '#241f42', '#ffd88a', i + 1, .3);
  // фонарь
  const lampX = -1.6, lampZ = -1.1;
  const post = mesh(G.cyl(.05, .07, 3.3), clay('#15131f')); add(g, post, lampX, 1.65, lampZ);
  const arm = mesh(G.cap(.035, .5), clay('#15131f')); arm.rotation.z = Math.PI / 2; add(g, arm, lampX + .25, 3.25, lampZ);
  const head = mesh(G.cyl(.08, .2, .16), clay('#15131f')); add(g, head, lampX + .5, 3.2, lampZ);
  const bulb = mesh(G.sph(.09), glow('#fff2cc', 2.2), false, false); add(g, bulb, lampX + .5, 3.1, lampZ);
  const sp = new THREE.SpotLight('#ffcf8a', 95, 14, .9, .55, 1.3); sp.position.set(lampX + .5, 3.08, lampZ); sp.target.position.set(lampX + 1.1, 0, lampZ + .9);
  sp.castShadow = true; sp.shadow.mapSize.set(1024, 1024); sp.shadow.bias = -.0004; sp.shadow.radius = 4; g.add(sp, sp.target);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: canvasTex(64, 64, (c) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,230,170,.9)'); gr.addColorStop(1, 'rgba(255,200,120,0)'); c.fillStyle = gr; c.fillRect(0, 0, 64, 64); }), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  halo.scale.set(1.6, 1.6, 1); add(g, halo, lampX + .5, 3.1, lampZ);
  // скамейка, урна, гидрант
  const bench = new THREE.Group(); [0, .14].forEach(dy => { const sl = mesh(G.rbox(1.4, .06, .14, .02), clay('#8a5a3a')); add(bench, sl, 0, .42 + dy * 0, dy - .07); });
  const back = mesh(G.rbox(1.4, .3, .06, .02), clay('#8a5a3a')); add(bench, back, 0, .7, -.14); [-.6, .6].forEach(x => add(bench, mesh(G.box(.06, .42, .3), clay('#22202c')), x, .21, 0)); add(g, bench, 3.2, 0, -1.7);
  const bin = mesh(G.cyl(.2, .17, .55), clay('#3a6a5a')); add(g, bin, -3.0, .275, -1.6);
  const hyd = new THREE.Group(); add(hyd, mesh(G.cyl(.1, .12, .4), clay('#d84a3a')), 0, .2, 0); add(hyd, mesh(G.sph(.11), clay('#d84a3a')), 0, .42, 0); add(g, hyd, 5.0, 0, 2.8);
  // неон «ПРОФСОЮЗ ТЕНЕЙ» (для финала) + дверь
  const neon = new THREE.Group(); neon.visible = false;
  const signTex = canvasTex(1024, 300, (c) => { c.fillStyle = '#0a0612'; c.fillRect(0, 0, 1024, 300); c.strokeStyle = '#ff3a8a'; c.lineWidth = 14; c.shadowColor = '#ff3a8a'; c.shadowBlur = 30; c.strokeRect(20, 20, 984, 260); c.font = '800 98px Unb'; c.textAlign = 'center'; c.fillStyle = '#ffd0e8'; c.fillText('ПРОФСОЮЗ', 512, 140); c.fillText('ТЕНЕЙ', 512, 250); });
  const sign = mesh(G.plane(2.6, .76), new THREE.MeshBasicMaterial({ map: signTex, toneMapped: false }), false, false); add(neon, sign, .2, 3.35, -2.13);
  const sign2Tex = canvasTex(1024, 160, (c) => { c.font = '800 60px Unb'; c.textAlign = 'center'; c.fillStyle = '#7af0ff'; c.shadowColor = '#7af0ff'; c.shadowBlur = 26; c.fillText('ЗАБАСТОВКА — ЗАВТРА', 512, 100); });
  const sign2 = mesh(G.plane(2.1, .33), new THREE.MeshBasicMaterial({ map: sign2Tex, transparent: true, toneMapped: false }), false, false); add(neon, sign2, .1, 2.78, -2.13);
  const door = mesh(G.rbox(1.0, 2.0, .1, .03), clay('#120e22'), false, true); add(neon, door, .2, 1.0, -2.12);
  const dfr = mesh(G.rbox(1.15, 2.1, .08, .02), clay('#3a3260'), false, true); add(neon, dfr, .2, 1.05, -2.14);
  const nl = new THREE.PointLight('#ff3a8a', 6, 6, 1.5); nl.position.set(.2, 3.0, -1.4); neon.add(nl);
  g.add(neon);
  g.userData = {}; reg('night', g, skyTex([[0, '#070a22'], [.6, '#1b1d4a'], [1, '#3a2a5a']]), new THREE.Fog('#1d1a40', 9, 34));
  return { g, sp, lampX: lampX + .5, lampZ, neon, sign, sign2, nl, wallZ: -2.14 };
})();

// ===== КОТ =====
export function makeCat() { const g = new THREE.Group(); const O = clay('#ec8a3c'), D = clay('#c0602a'), W = clay('#fff4e8');
  const body = mesh(G.cap(.13, .28), O); body.rotation.z = Math.PI / 2; add(g, body, 0, .24, 0);
  const stripes = [-.08, 0, .08].map(x => { const s = mesh(G.cyl(.135, .135, .025), D); s.rotation.z = Math.PI / 2; s.position.set(x, 0, 0); return s; }); const bodyG = new THREE.Group(); bodyG.add(body); stripes.forEach(s => body.add(s)); g.add(bodyG); body.position.set(0, .24, 0);
  const head = new THREE.Group(); add(g, head, -.3, .38, 0); add(head, mesh(G.sph(.13, 24), O), 0, 0, 0);
  const ears = [-1, 1].map(s => { const e = mesh(new THREE.ConeGeometry(.05, .1, 12), O); e.position.set(-.0, .12, s * .07); e.rotation.x = s * .25; head.add(e); return e; });
  const muz = mesh(G.sph(.06, 16), W); muz.scale.set(.7, .7, 1.2); add(head, muz, -.1, -.04, 0);
  const eyes = [-1, 1].map(s => { const e = mesh(G.sph(.028, 12), clay('#cfe84a', { roughness: .3 })); e.scale.set(.5, 1, 1); add(head, e, -.11, .03, s * .055); const p = mesh(G.sph(.016, 8), clay('#111')); p.scale.set(.4, 1.3, .6); add(head, p, -.125, .03, s * .055); return [e, p]; });
  const nose = mesh(G.sph(.016, 8), clay('#e86a7a')); add(head, nose, -.135, -.02, 0);
  const mouth = mesh(G.sph(.03, 12), clay('#5a1020')); mouth.scale.set(.5, .1, 1); add(head, mouth, -.12, -.07, 0);
  const legs = [[-.18, .07], [-.18, -.07], [.17, .07], [.17, -.07]].map(([x, z], i) => { const l = mesh(G.cap(.035, .14), i % 2 ? D : O); add(g, l, x, .1, z); return l; });
  const tail = []; let parent = g; let px = .3, py = .28; for (let i = 0; i < 6; i++) { const seg = new THREE.Group(); seg.position.set(i === 0 ? px : .07, i === 0 ? py : 0, 0); const m = mesh(G.sph(.035 - i * .002, 10), O); seg.add(m); parent.add(seg); tail.push(seg); parent = seg; }
  const spikes = []; for (let i = 0; i < 10; i++) { const sp = mesh(new THREE.ConeGeometry(.03, .09, 6), O); const a = (i / 9 - .5) * 2.2; sp.position.set(Math.sin(a) * .16, .36 + Math.cos(a) * .05, 0); sp.rotation.z = -a; sp.visible = false; g.add(sp); spikes.push(sp); }
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return { g, head, ears, eyes, mouth, tail, body: bodyG, spikes, legs };
}
export function poseCat(C, t, hiss = 0) {
  C.body.position.y = hiss * .1; C.body.scale.set(1, 1 + hiss * .25, 1); C.head.position.y = .38 + hiss * .05; C.head.rotation.z = -hiss * .2;
  C.ears.forEach((e, i) => { e.rotation.z = hiss * .9; });
  C.mouth.scale.set(.5, .1 + hiss * .9, 1);
  C.eyes.forEach(([e, p]) => { e.scale.set(.5, 1 + hiss * .3, 1); p.scale.set(.4, 1.3 - hiss * .6, .6); });
  C.tail.forEach((s, i) => { s.rotation.z = (i === 0 ? .9 : .25) + Math.sin(t * 2.5 - i * .6) * .12 * (1 - hiss) + hiss * (i === 0 ? .7 : .05); s.children[0].scale.setScalar(1 + hiss * .6); });
  C.spikes.forEach((s, i) => { s.visible = hiss > .1; s.scale.setScalar(hiss); s.position.y = .36 + hiss * .12 + Math.cos((i / 9 - .5) * 2.2) * .05; });
  C.legs.forEach(l => { l.position.y = .1 + hiss * .03; l.scale.y = 1 + hiss * .3; });
}

// ===== КУХНЯ =====
export const kitchen = (() => {
  const g = new THREE.Group();
  g.add(new THREE.HemisphereLight('#fff0dc', '#a8785a', .9));
  const sun = new THREE.DirectionalLight('#fff0c8', 4.2); sun.position.set(-5, 4.2, 2.2); sun.target.position.set(.6, 0, -.3); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: .5, far: 20 }); sun.shadow.bias = -.0005; sun.shadow.radius = 3; g.add(sun, sun.target);
  const planks = canvasTex(512, 512, (c) => { for (let i = 0; i < 8; i++) { c.fillStyle = `hsl(28,${40 + h1(i) * 10}%,${46 + h1(i + 3) * 8}%)`; c.fillRect(0, i * 64, 512, 62); c.fillStyle = 'rgba(80,40,20,.25)'; c.fillRect(0, i * 64 + 62, 512, 2); } });
  planks.wrapS = planks.wrapT = THREE.RepeatWrapping; planks.repeat.set(3, 3);
  const floor = mesh(G.plane(10, 10), new THREE.MeshStandardMaterial({ map: planks, roughness: .8 }), false, true); floor.rotation.x = -Math.PI / 2; g.add(floor);
  const wallC = clay('#f6dcb8'); const backW = mesh(G.box(10, 4, .2), wallC, false, true); add(g, backW, 0, 2, -1.8);
  // левая стена с проёмом окна (4 куска)
  const WX = -1.9; [[0, .55, 0, 4.4, 1.1], [0, 3.35, 0, 4.4, 1.3], [-1.6, 1.95, 0, 1.2, 1.7], [1.6, 1.95, 0, 1.2, 1.7]].forEach(([z, y, _, d, h]) => { const p = mesh(G.box(.2, h, d), wallC, true, true); add(g, p, WX, y, z - .2 + 0); });
  const frame = mesh(G.rbox(.14, 1.75, 2.05, .03), clay('#ffffff'), true, true); frame.scale.set(1, 1, 1); const fr = new THREE.Group(); [[0, .85, 0, .1, 2.05], [0, -.85, 0, .1, 2.05], [0, 0, 1.0, 1.75, .1], [0, 0, -1.0, 1.75, .1], [0, 0, 0, 1.75, .06], [0, 0, 0, .06, 2.05]].forEach(([x, y, z, h, d]) => add(fr, mesh(G.box(.16, h, d), clay('#ffffff')), x, y, z)); add(g, fr, WX, 1.95, -.2); void frame;
  const sill = mesh(G.rbox(.4, .06, 2.2, .02), clay('#ffffff')); add(g, sill, WX + .15, 1.08, -.2);
  // вид из окна (светлое небо + дома)
  const view = mesh(G.plane(6, 4), new THREE.MeshBasicMaterial({ map: canvasTex(512, 340, (c) => { const gr = c.createLinearGradient(0, 0, 0, 340); gr.addColorStop(0, '#8fd0ff'); gr.addColorStop(1, '#ffe8c0'); c.fillStyle = gr; c.fillRect(0, 0, 512, 340); for (let i = 0; i < 9; i++) { c.fillStyle = '#a8bcd8'; const hh = 80 + h1(i) * 150; c.fillRect(i * 60, 340 - hh, 52, hh); } }), toneMapped: false }), false, false);
  view.rotation.y = Math.PI / 2; add(g, view, WX - 2, 2, -.2);
  // столешница
  const cab = mesh(G.rbox(2.6, .9, .6, .03), clay('#c8925e'), true, true); add(g, cab, 1.4, .45, -1.4);
  [0.55, 1.4, 2.25].forEach(x => { add(g, mesh(G.rbox(.8, .78, .02, .02), clay('#b88050')), x, .45, -1.09); add(g, mesh(G.sph(.025), clay('#4a2a10')), x + .25, .6, -1.07); });
  const top = mesh(G.rbox(2.7, .06, .66, .02), clay('#efe4d2'), true, true); add(g, top, 1.4, .93, -1.4);
  // фартук-плитка
  const tiles = canvasTex(256, 128, (c) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, 256, 128); c.strokeStyle = '#d8e0e8'; c.lineWidth = 4; for (let i = 0; i <= 8; i++) { c.beginPath(); c.moveTo(i * 32, 0); c.lineTo(i * 32, 128); c.stroke(); } for (let j = 0; j <= 4; j++) { c.beginPath(); c.moveTo(0, j * 32); c.lineTo(256, j * 32); c.stroke(); } });
  const ap = mesh(G.plane(2.7, .8), new THREE.MeshStandardMaterial({ map: tiles, roughness: .4 }), false, true); add(g, ap, 1.4, 1.36, -1.69);
  // чайник
  const kettle = new THREE.Group(); const kb = mesh(G.sph(.17, 24), clay('#e2483c', { roughness: .4 })); kb.scale.set(1, .85, 1); add(kettle, kb, 0, .14, 0);
  const sp = mesh(G.cyl(.025, .04, .2), clay('#e2483c', { roughness: .4 })); sp.rotation.z = -1.0; add(kettle, sp, .19, .2, 0);
  const hd = mesh(new THREE.TorusGeometry(.1, .02, 8, 16, Math.PI), clay('#2a1a14')); add(kettle, hd, 0, .26, 0);
  add(kettle, mesh(G.sph(.03), clay('#2a1a14')), 0, .29, 0); add(g, kettle, 1.0, .96, -1.35);
  // кружка, растение, тостер
  const mug = new THREE.Group(); add(mug, mesh(G.cyl(.06, .055, .13), clay('#4a8ad8')), 0, .065, 0); const mh = mesh(new THREE.TorusGeometry(.04, .012, 6, 12), clay('#4a8ad8')); add(mug, mh, .07, .07, 0); add(g, mug, 1.55, .96, -1.25);
  const plant = new THREE.Group(); add(plant, mesh(G.cyl(.09, .07, .16), clay('#c86a4a')), 0, .08, 0); for (let i = 0; i < 7; i++) { const lf = mesh(G.sph(.07, 10), clay('#4aa86a')); lf.scale.set(.6, 1.4, .3); lf.position.set(Math.sin(i) * .06, .26 + h1(i) * .08, Math.cos(i) * .06); lf.rotation.set(Math.cos(i) * .5, i, Math.sin(i) * .5); plant.add(lf); } add(g, plant, 2.35, .96, -1.4);
  const toast = mesh(G.rbox(.3, .2, .18, .04), clay('#d8dce4', { roughness: .35 })); add(g, toast, 1.95, 1.06, -1.42);
  // лампа-абажур сверху
  const shade = mesh(G.cyl(.12, .3, .25, 24, 1), clay('#ffcf6a')); add(g, shade, .2, 3.3, -.4);
  const cat = makeCat(); g.add(cat.g); cat.g.position.set(1.25, 0, .25); cat.g.rotation.y = .3;
  // коврик
  const rug = mesh(G.cyl(.9, .9, .02, 40), clay('#7a8ac8'), false, true); rug.scale.set(1, 1, .6); add(g, rug, .2, .01, .3);
  reg('kitchen', g, new THREE.Color('#f6dcb8'));
  return { g, cat, kettle, sun };
})();

// ===== КОРИДОР (стена-холст для писем) =====
export const hall = (() => {
  const g = new THREE.Group();
  g.add(new THREE.HemisphereLight('#fff4e0', '#806050', .8));
  const lamp = new THREE.PointLight('#ffe6c0', 14, 10, 1.4); lamp.position.set(-.3, 3.2, .8); lamp.castShadow = true; lamp.shadow.mapSize.set(1024, 1024); g.add(lamp);
  const lampM = mesh(G.sph(.15), glow('#fff2d0', 1.8), false, false); add(g, lampM, -.3, 3.35, .8);
  const C = document.createElement('canvas'); C.width = 800; C.height = 1018; const tex = new THREE.CanvasTexture(C); tex.colorSpace = THREE.SRGBColorSpace;
  const base = document.createElement('canvas'); base.width = 1024; base.height = 1024; const b = base.getContext('2d');
  b.fillStyle = '#efe2cc'; b.fillRect(0, 0, 1024, 1024); for (let i = 0; i < 16; i++) { b.fillStyle = 'rgba(200,180,150,.35)'; b.fillRect(i * 64, 0, 22, 1024); }
  for (let i = 0; i < 16; i++) for (let j = 0; j < 18; j++) { b.fillStyle = 'rgba(190,160,120,.4)'; b.beginPath(); b.arc(32 + i * 64, 28 + j * 58 + (i % 2) * 29, 5, 0, 7); b.fill(); }
  const baseTex = new THREE.CanvasTexture(base); baseTex.colorSpace = THREE.SRGBColorSpace;
  const letters = mesh(G.plane(2.2, 2.8), new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: .95 }), false, true); add(g, letters, 0, 2.0, -1.49);
  const wallM = new THREE.MeshStandardMaterial({ map: baseTex, roughness: .95 });
  const wall = mesh(G.plane(6, 4.2), wallM, false, true); add(g, wall, 0, 2.1, -1.5);
  const sideW = mesh(G.box(.2, 4.2, 6), clay('#e6d6bc'), false, true); add(g, sideW, 2.2, 2.1, 1.4);
  const floor = mesh(G.plane(10, 10), clay('#8a6446'), false, true); floor.rotation.x = -Math.PI / 2; g.add(floor);
  const bb = mesh(G.box(4.2, .14, .04), clay('#6a4a30')); add(g, bb, 0, .07, -1.48);
  const door = mesh(G.rbox(1.0, 2.1, .08, .02), clay('#c8a878'), false, true); add(g, door, 1.75, 1.05, -1.45);
  add(g, mesh(G.sph(.04), clay('#d8b860', { metalness: .6, roughness: .3 })), 1.42, 1.0, -1.38);
  const hook = mesh(G.rbox(.7, .06, .06, .02), clay('#6a4a30')); add(g, hook, -1.4, 2.0, -1.45);
  const coat = mesh(G.cap(.18, .5), clay('#3a5a8a')); coat.scale.set(1, 1, .4); add(g, coat, -1.5, 1.6, -1.38);
  reg('hall', g, new THREE.Color('#2a2028'));
  // рисование надписей: fn(ctx2d) поверх обоев
  const paint = fn => { const c = C.getContext('2d'); c.clearRect(0, 0, C.width, C.height); fn(c); tex.needsUpdate = true; };
  return { g, paint, wall };
})();

// рукописные буквы с подтёками на 2D-канвасе стены; reveal — число видимых символов
export function handLines(c, lines, { x = 512, y = 200, size = 120, lh = 1.0, reveal = 1e9, color = '#0a0910', rot = -.05, drips = 0, seed = 1 } = {}) {
  c.save(); c.translate(x, y); c.rotate(rot); c.textAlign = 'left'; c.fillStyle = color; c.font = `700 ${size}px Cav`; let idx = 0;
  lines.forEach((ln, i) => { const w = c.measureText(ln).width; let xx = -w / 2; const yy = i * size * lh;
    for (const ch of ln) { if (idx++ >= reveal) break; const cw = c.measureText(ch).width; c.save(); c.translate(xx, yy); c.rotate((h1(idx + seed) - .5) * .08); c.fillText(ch, 0, 0); c.restore();
      if (drips && ch !== ' ' && h1(idx * 3 + seed) < .3) { const L = drips * (12 + h1(idx) * 50); c.fillRect(xx + cw * .4, yy + 4, 5, L); c.beginPath(); c.arc(xx + cw * .4 + 2.5, yy + 4 + L, 5, 0, 7); c.fill(); }
      xx += cw; } });
  c.restore();
}

// ===== МИНИАТЮРА «ДОМ → РАБОТА → ДОМ» =====
export const loop = (() => {
  const g = new THREE.Group();
  g.add(new THREE.HemisphereLight('#dfe8ff', '#5a6a4a', .9));
  const sun = new THREE.DirectionalLight('#fff4dc', 3); sun.position.set(3, 6, 4); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4 }); g.add(sun);
  const base = mesh(G.cyl(3, 3.1, .4, 64), clay('#7ac87a'), true, true); add(g, base, 0, -.2, 0);
  const rim = mesh(G.cyl(3.12, 3.2, .3, 64), clay('#8a6a4a')); add(g, rim, 0, -.45, 0);
  const path = mesh(new THREE.TorusGeometry(1.8, .16, 8, 80), clay('#e8d8b0'), false, true); path.rotation.x = Math.PI / 2; path.scale.set(1, .62, .1); add(g, path, 0, .01, 0);
  // домик
  const house = new THREE.Group(); add(house, mesh(G.rbox(.9, .7, .8, .05), clay('#ffd86a')), 0, .35, 0); const roof = mesh(new THREE.ConeGeometry(.75, .5, 4), clay('#e85a4a')); roof.rotation.y = Math.PI / 4; add(house, roof, 0, .95, 0);
  add(house, mesh(G.box(.2, .35, .02), clay('#6a3a2a')), 0, .18, .41); add(house, mesh(G.box(.2, .2, .02), glow('#fff0b0', .8)), .27, .45, .41); add(g, house, -2.3, 0, 0);
  // офис
  const off = building(new THREE.Group(), 0, 0, .9, 1.8, .9, '#7aa8e8', '#e8f4ff', 77, .7); off.parent.position.set(2.3, 0, 0); g.add(off.parent);
  // деревья
  [[-.5, -1.9], [.6, -2.0], [-1.0, 1.9], [1.2, 1.8], [0, 0], [-.6, .4], [.7, -.3]].forEach(([x, z], i) => { const tr = new THREE.Group(); add(tr, mesh(G.cyl(.04, .05, .3), clay('#7a5236')), 0, .15, 0); add(tr, mesh(G.sph(.2 + h1(i) * .1, 12), clay(i % 2 ? '#3a9a5a' : '#4ab06a')), 0, .42, 0); add(g, tr, x, 0, z); });
  const mini = makeToy(undefined); mini.root.scale.setScalar(.38); g.add(mini.root);
  reg('loop', g, skyTex([[0, '#1a1e40'], [1, '#3a3a7a']]));
  return { g, mini };
})();

// ===== ДНЕВНАЯ УЛИЦА =====
export const day = (() => {
  const g = new THREE.Group();
  g.add(new THREE.HemisphereLight('#bfe2ff', '#c8a078', 1.0));
  const sun = new THREE.DirectionalLight('#fff2d4', 4.0); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: .5, far: 40 }); sun.shadow.bias = -.0005; sun.shadow.radius = 3; g.add(sun, sun.target);
  const ground = mesh(G.plane(200, 60), clay('#d8c8b0'), false, true); ground.rotation.x = -Math.PI / 2; g.add(ground);
  const road = mesh(G.plane(200, 4.4), clay('#5a5866'), false, true); road.rotation.x = -Math.PI / 2; add(g, road, 0, .004, -1.4);
  for (let i = 0; i < 60; i++) { const d = mesh(G.plane(1.2, .14), clay('#f4f0e0'), false, true); d.rotation.x = -Math.PI / 2; add(g, d, -60 + i * 3, .008, -1.4); }
  const curb1 = mesh(G.box(200, .1, .2), clay('#b8b0a8'), true, true); add(g, curb1, 0, .05, .85); const curb2 = curb1.clone(); add(g, curb2, 0, .05, -3.65);
  const cols = ['#f0a878', '#f6d48a', '#9ad0c8', '#e88a9a', '#a8b8f0', '#f4c0a0'];
  for (let i = 0; i < 26; i++) building(g, -40 + i * 3.4, -6.2, 3.1, 3.5 + h1(i) * 4, 2.6, cols[i % cols.length], '#fff6dc', 30 + i, .5);
  // деревья вдоль тротуара
  for (let i = 0; i < 20; i++) { const tr = new THREE.Group(); add(tr, mesh(G.cyl(.06, .08, 1.0), clay('#7a5236')), 0, .5, 0); [[0, 1.3, 0, .5], [.25, 1.15, .1, .35], [-.25, 1.2, -.05, .38]].forEach(([x, y, z, r]) => add(tr, mesh(G.sph(r, 14), clay('#4aa86a')), x, y, z)); add(g, tr, -38 + i * 4.3, 0, -4.3); }
  // ограждение (прыжок)
  const fence = new THREE.Group(); add(fence, mesh(G.rbox(1.4, .07, .07, .02), clay('#e8e8f0')), 0, .55, 0); [-.65, .65].forEach(x => add(fence, mesh(G.cyl(.035, .035, .55), clay('#3a3a44')), x, .275, 0)); add(fence, mesh(G.rbox(1.4, .07, .07, .02), clay('#e84a3a')), 0, .3, 0); add(g, fence, 6.6, 0, 1.6);
  // автобус
  const bus = new THREE.Group(); const bm = clay('#f2a62a', { roughness: .5 });
  add(bus, mesh(G.rbox(3.4, 1.25, 1.2, .2), bm), 0, .85, 0);
  add(bus, mesh(G.rbox(3.42, .16, 1.22, .05), clay('#d07a10')), 0, .55, 0);
  for (let i = 0; i < 5; i++) add(bus, mesh(G.rbox(.5, .45, 1.24, .05), clay('#bfe4ff', { roughness: .15, metalness: .1 })), -1.25 + i * .62, 1.12, 0);
  const wheels = [-1.1, 1.1].flatMap(x => [-.6, .6].map(z => { const w = mesh(G.cyl(.26, .26, .16, 20), clay('#1a1a1e')); w.rotation.x = Math.PI / 2; add(bus, w, x, .27, z); const hub = mesh(G.cyl(.12, .12, .17, 12), clay('#c8c8d0')); w.add(hub); const sp = mesh(G.box(.05, .175, .2), clay('#8a8a90')); w.add(sp); return w; }));
  const num = mesh(G.plane(.7, .26), new THREE.MeshBasicMaterial({ map: canvasTex(256, 96, (c) => { c.fillStyle = '#1a1a1e'; c.fillRect(0, 0, 256, 96); c.fillStyle = '#ffcf4a'; c.font = '800 64px Unb'; c.textAlign = 'center'; c.fillText('47', 128, 72); }) }), false, false); add(bus, num, 0, 1.5, .61);
  bus.traverse(o => { if (o.isMesh) o.castShadow = true; }); add(g, bus, 0, 0, -2.2);
  reg('day', g, skyTex([[0, '#6ab8ff'], [.7, '#bfe0ff'], [1, '#ffe2b8']]), new THREE.Fog('#d8e8ff', 18, 60));
  // солнце следует за кадром (тень в рамке)
  const follow = (x, z = 0) => { sun.position.set(x + 5, 9, z - 6); sun.target.position.set(x, 0, z); };
  return { g, sun, bus, wheels, follow, fence };
})();

// ===== ПЛОЩАДЬ С ФОНТАНОМ =====
export const plaza = (() => {
  const g = new THREE.Group();
  g.add(new THREE.HemisphereLight('#c8e4ff', '#d0a880', 1.0));
  const sun = new THREE.DirectionalLight('#fff0cc', 4.2); sun.position.set(7, 4.6, -1); sun.target.position.set(0, 0, 0); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: .5, far: 30 }); sun.shadow.bias = -.0005; sun.shadow.radius = 3; g.add(sun, sun.target);
  const pav = canvasTex(256, 256, (c) => { c.fillStyle = '#e2c8a0'; c.fillRect(0, 0, 256, 256); for (let r = 0; r < 8; r++) for (let k = 0; k < 8; k++) { c.fillStyle = `hsl(32,${30 + h1(r * 8 + k) * 15}%,${70 + h1(k * 3 + r) * 10}%)`; c.fillRect(k * 32 + 1 + (r % 2) * 16, r * 32 + 1, 30, 30); } });
  pav.wrapS = pav.wrapT = THREE.RepeatWrapping; pav.repeat.set(16, 16);
  const ground = mesh(G.plane(60, 60), new THREE.MeshStandardMaterial({ map: pav, roughness: .9 }), false, true); ground.rotation.x = -Math.PI / 2; g.add(ground);
  const cols = ['#f0a878', '#f6d48a', '#9ad0c8', '#e88a9a', '#a8b8f0'];
  for (let i = 0; i < 9; i++) building(g, -13 + i * 3.3, -8, 3.0, 4 + h1(i + 40) * 4, 2.5, cols[i % 5], '#fff6dc', 60 + i, .5);
  // фонтан
  const fnt = new THREE.Group(); add(fnt, mesh(G.cyl(1.6, 1.7, .35, 48), clay('#c8c0c8')), 0, .175, 0); const water = mesh(G.cyl(1.45, 1.45, .05, 48), new THREE.MeshStandardMaterial({ color: '#7ac8f0', roughness: .15, metalness: .1 }), false, true); add(fnt, water, 0, .3, 0);
  add(fnt, mesh(G.cyl(.18, .25, .7, 20), clay('#c8c0c8')), 0, .5, 0);
  add(g, fnt, 4.2, 0, -.6);
  // капли (инстансы)
  const N = 260; const drops = new THREE.InstancedMesh(G.sph(.035, 6), new THREE.MeshStandardMaterial({ color: '#e8f8ff', emissive: '#9fd8ff', emissiveIntensity: .5, roughness: .1 }), N); drops.castShadow = false; g.add(drops);
  // танцоры и зрители
  const LOOKS = [
    { skin: '#e8b898', hair: '#1a1416', top: '#e8508a', top2: '#c03a6a', pants: '#2a2e44', shoes: '#ffffff', hood: false, eye: '#1a1210', blush: .5 },
    { skin: '#c88a64', hair: '#0e0c0c', top: '#3ab07a', top2: '#2a8a5a', pants: '#e8e0d0', shoes: '#ffcf4a', hood: true, eye: '#1a1210', blush: .3 },
    { skin: '#f4d0b4', hair: '#e8b04a', top: '#ff8a2a', top2: '#d06a1a', pants: '#2a3a6a', shoes: '#ffffff', hood: false, eye: '#1a1210', blush: .5 },
  ];
  const dancers = LOOKS.map(L => { const d = makeToy(L); d.root.traverse(o => { if (o.isMesh) o.castShadow = true; }); g.add(d.root); return d; });
  const CROWD = ['#6a7ab8', '#b86a8a', '#8ab86a', '#c8a050', '#6ab0b8', '#a07ac8', '#d88a5a'].map((c, i) => ({ skin: ['#f2c9ad', '#c88a64', '#e8b898'][i % 3], hair: ['#2a1a14', '#c88a3a', '#0e0c0c', '#8a5a3a'][i % 4], top: c, top2: c, pants: '#3a3a4a', shoes: '#e8e8e8', hood: i % 2 === 0, eye: '#1a1210', blush: .4 }));
  const crowd = CROWD.map(L => { const d = makeToy(L); d.root.traverse(o => { if (o.isMesh) o.castShadow = true; }); g.add(d.root); return d; });
  reg('plaza', g, skyTex([[0, '#78c0ff'], [.7, '#c8e4ff'], [1, '#ffe0b0']]), new THREE.Fog('#d8e8ff', 16, 50));
  return { g, sun, dancers, crowd, drops, N, fountain: fnt };
})();

// ===== КРЫША НА ЗАКАТЕ =====
export const roof = (() => {
  const g = new THREE.Group();
  g.add(new THREE.HemisphereLight('#ffb08a', '#4a2048', .8));
  const sunL = new THREE.DirectionalLight('#ffb070', 4.5); sunL.position.set(-1, 2.2, -14); sunL.target.position.set(0, 0, 0); sunL.castShadow = true; sunL.shadow.mapSize.set(2048, 2048); Object.assign(sunL.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: .5, far: 40 }); sunL.shadow.bias = -.0006; sunL.shadow.radius = 4; g.add(sunL, sunL.target);
  const sunDisk = mesh(G.sph(5, 32), glow('#fff0c0', 1.6), false, false); add(g, sunDisk, -4, 4, -90);
  const sunHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: canvasTex(128, 128, (c) => { const gr = c.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,220,150,.9)'); gr.addColorStop(.4, 'rgba(255,150,90,.4)'); gr.addColorStop(1, 'rgba(255,120,90,0)'); c.fillStyle = gr; c.fillRect(0, 0, 128, 128); }), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  sunHalo.scale.set(50, 50, 1); add(g, sunHalo, -4, 4, -88);
  // крыша
  const tar = mesh(G.plane(30, 30), clay('#3a2440'), false, true); tar.rotation.x = -Math.PI / 2; g.add(tar);
  const para = mesh(G.rbox(14, .5, .35, .05), clay('#5a3a58'), true, true); add(g, para, 0, .25, -2.2);
  const paraTop = mesh(G.rbox(14.1, .07, .42, .02), clay('#8a5a70')); add(g, paraTop, 0, .52, -2.2);
  // город внизу
  for (let i = 0; i < 40; i++) { const x = -40 + h1(i) * 80, z = -8 - h1(i + 9) * 40, h = 4 + h1(i + 3) * 12; building(g, x, z, 2 + h1(i + 5) * 2, h, 2 + h1(i + 6) * 2, i % 3 ? '#5a2a5a' : '#7a3a6a', '#ffcf7a', 200 + i, .25).position.y = h / 2 - 14; }
  // вентшахта (стена для писем)
  const C = document.createElement('canvas'); C.width = 1024; C.height = 768; const tex = new THREE.CanvasTexture(C); tex.colorSpace = THREE.SRGBColorSpace;
  const vent = new THREE.Group(); const vbox = mesh(G.rbox(2.4, 1.8, 1.2, .04), clay('#c8a090'), true, true); add(vent, vbox, 0, .9, 0);
  const face = mesh(G.plane(2.3, 1.72), new THREE.MeshStandardMaterial({ map: tex, roughness: .95 }), false, true); add(vent, face, 0, .9, .605);
  add(vent, mesh(G.cyl(.18, .18, .6, 16), clay('#9a8a88')), .7, 2.1, 0); add(vent, mesh(G.cyl(.25, .25, .08, 16), clay('#9a8a88')), .7, 2.42, 0);
  add(g, vent, 2.6, 0, -.8); vent.rotation.y = -.5;
  // бак и антенна — силуэты
  const tank = mesh(G.cyl(.7, .7, 1.4, 24), clay('#6a4a5a')); add(g, tank, -4.5, 1.6, -1.2); add(g, mesh(G.box(.06, 1.0, .06), clay('#3a2a3a')), -4.8, .5, -1.2); add(g, mesh(G.box(.06, 1.0, .06), clay('#3a2a3a')), -4.2, .5, -1.2);
  const ant = mesh(G.cyl(.02, .03, 3), clay('#2a1a2a')); add(g, ant, -2.8, 1.5, -1.8);
  const fill = new THREE.PointLight('#ffc89a', 0, 9, 1.2); fill.position.set(1.0, 2.2, 1.6); g.add(fill);
  // птицы
  const birds = []; for (let i = 0; i < 6; i++) { const b = mesh(new THREE.TorusGeometry(.18, .025, 4, 8, Math.PI), clay('#2a1428'), false, false); g.add(b); birds.push(b); }
  const paint = fn => { const c = C.getContext('2d'); c.fillStyle = '#d8b0a0'; c.fillRect(0, 0, 1024, 768); for (let i = 0; i < 400; i++) { c.fillStyle = `rgba(90,50,40,${h1(i) * .12})`; c.fillRect(h1(i + 1) * 1024, h1(i + 2) * 768, 4, 4); } fn(c); tex.needsUpdate = true; };
  reg('roof', g, skyTex([[0, '#2a1e5a'], [.35, '#9a3a7a'], [.62, '#ff7a4a'], [.8, '#ffc07a'], [1, '#ffe0a0']]), new THREE.Fog('#ff9a6a', 20, 95));
  return { g, sunL, vent, paint, birds, sunDisk, fill };
})();

export { makeShade, placeShade, applyPose, lerp, clamp };
