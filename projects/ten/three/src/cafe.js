// Серия 2: кафе «Luna» (зал у окна: стол, стулья, стойка с бариста; светлая стена — холст для теней) и его фасад снаружи.
import { THREE, G, clay, mesh, glow, canvasTex, skyTex, h1 } from './core.js';
import { reg, add, building } from './sets.js';
import { makeToy } from './toy.js';

const plaster = (base, spot) => canvasTex(256, 256, (c) => { c.fillStyle = base; c.fillRect(0, 0, 256, 256); for (let i = 0; i < 500; i++) { c.fillStyle = `rgba(${spot},${h1(i) * .07})`; c.beginPath(); c.arc(h1(i + 1) * 256, h1(i + 2) * 256, 2 + h1(i + 3) * 6, 0, 7); c.fill(); } });

// ===== ЗАЛ =====
export const cafe = (() => {
  const g = new THREE.Group();
  g.add(new THREE.HemisphereLight('#fff0dc', '#7a5a48', .75));
  // солнце из большого окна слева-спереди: тени стола и стульев ложатся на заднюю стену
  const sun = new THREE.DirectionalLight('#ffe2b0', 3.6); sun.position.set(-3.2, 3.6, 4.5); sun.target.position.set(.3, .8, -1.6);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: .5, far: 20 }); sun.shadow.bias = -.0006; sun.shadow.radius = 4; g.add(sun, sun.target);
  const WZ = -1.6;
  const floorT = canvasTex(256, 256, (c) => { for (let i = 0; i < 8; i++) { c.fillStyle = `hsl(28,${38 + h1(i) * 10}%,${36 + h1(i + 3) * 8}%)`; c.fillRect(0, i * 32, 256, 31); c.fillStyle = 'rgba(0,0,0,.15)'; c.fillRect(h1(i + 9) * 256, i * 32, 3, 32); } });
  floorT.wrapS = floorT.wrapT = THREE.RepeatWrapping; floorT.repeat.set(5, 5);
  const floor = mesh(G.plane(14, 10), new THREE.MeshStandardMaterial({ map: floorT, roughness: .8 }), false, true); floor.rotation.x = -Math.PI / 2; g.add(floor);
  const wt = plaster('#f3e3c8', '150,110,70'); wt.wrapS = wt.wrapT = THREE.RepeatWrapping; wt.repeat.set(3, 1.5);
  const wall = mesh(G.box(9, 3.6, .2), new THREE.MeshStandardMaterial({ map: wt, roughness: .95 }), false, true); add(g, wall, .5, 1.8, WZ - .1);
  // панель внизу стены
  add(g, mesh(G.box(9, .62, .05), clay('#5a7a6a'), false, true), .5, .31, WZ + .02);
  add(g, mesh(G.box(9, .05, .08), clay('#e8dcc4'), false, true), .5, .63, WZ + .03);
  // левая стена с окном
  const side = mesh(G.box(.2, 3.6, 7), new THREE.MeshStandardMaterial({ map: wt, roughness: .95 }), false, true); add(g, side, -2.7, 1.8, 1.8);
  const win = mesh(G.plane(2.6, 1.9), glow('#fff4dc', 1.25), false, false); win.rotation.y = Math.PI / 2; add(g, win, -2.58, 1.65, .9);
  [-1.2, 0, 1.2].forEach(dz => add(g, mesh(G.box(.06, 1.95, .07), clay('#4a3a30'), false, false), -2.56, 1.65, .9 + dz));
  add(g, mesh(G.box(.06, .07, 2.65), clay('#4a3a30'), false, false), -2.56, 1.65, .9);
  add(g, mesh(G.box(.25, .07, 2.8), clay('#e8dcc4')), -2.5, .68, .9);
  // картины, полка с растениями, меловое меню, бра
  const frame = (x, y, w, h, col, draw) => { add(g, mesh(G.rbox(w + .08, h + .08, .04, .01), clay('#3a2a22')), x, y, WZ + .02); add(g, mesh(G.plane(w, h), new THREE.MeshStandardMaterial({ map: canvasTex(128, 128 * h / w | 0, draw), roughness: .9 }), false, true), x, y, WZ + .045); };
  frame(-1.75, 2.25, .5, .62, 0, (c, w, h) => { c.fillStyle = '#f0b878'; c.fillRect(0, 0, w, h); c.fillStyle = '#e8705a'; c.beginPath(); c.arc(w / 2, h * .45, w * .28, 0, 7); c.fill(); c.fillStyle = '#4a6a8a'; c.fillRect(0, h * .7, w, h * .3); });
  frame(2.55, 2.2, .7, .5, 0, (c, w, h) => { c.fillStyle = '#9ad0c8'; c.fillRect(0, 0, w, h); for (let i = 0; i < 4; i++) { c.fillStyle = ['#f6d48a', '#e88a9a', '#ffffff', '#5a8a6a'][i]; c.beginPath(); c.arc(20 + i * 30, h * .6, 14, 0, 7); c.fill(); } });
  const shelf = mesh(G.rbox(1.3, .05, .22, .01), clay('#8a5a3a')); add(g, shelf, 1.2, 2.45, WZ + .1);
  [[.75, '#c8604a'], [1.15, '#e8e0d0'], [1.6, '#5a7aa8']].forEach(([x, col], i) => { add(g, mesh(G.cyl(.07, .055, .14, 14), clay(col)), x, 2.55, WZ + .1); [[0, .2, 0, .09], [.06, .17, .03, .06], [-.05, .16, -.02, .06]].forEach(([dx, dy, dz, r]) => add(g, mesh(G.sph(r, 10), clay(i === 1 ? '#3a8a5a' : '#4aa86a')), x + dx, 2.5 + dy, WZ + .1 + dz)); });
  const menu = mesh(G.rbox(.8, 1.0, .04, .02), new THREE.MeshStandardMaterial({ map: canvasTex(160, 200, (c) => { c.fillStyle = '#26302c'; c.fillRect(0, 0, 160, 200); c.fillStyle = '#f0ece0'; c.font = '700 24px Cav'; c.textAlign = 'center'; c.fillText('LUNA', 80, 34); c.font = '700 17px Cav'; ['latte ....... 4', 'flat white . 4', 'cocoa ....... 3', 'croissant .. 3', 'love ...... free'].forEach((l, i) => c.fillText(l, 80, 72 + i * 26)); }), roughness: .9 }), false, true);
  add(g, menu, 3.3, 1.75, WZ + .03);
  // подвесные лампы
  [-.2, 1.6].forEach(x => { add(g, mesh(G.cyl(.006, .006, 1.1), clay('#222')), x, 3.05, -.5); const sh = mesh(G.cyl(.06, .18, .16, 20, 1, true), clay('#e8a83a', { side: THREE.DoubleSide })); add(g, sh, x, 2.45, -.5); add(g, mesh(G.sph(.05), glow('#fff0c8', 1.6), false, false), x, 2.4, -.5); });
  // стол и стулья (центр стола x=0, z=-.55)
  const TX = 0, TZ = -.55;
  const table = new THREE.Group(); add(table, mesh(G.cyl(.4, .4, .035, 32), clay('#f2ece0')), 0, .42, 0); add(table, mesh(G.cyl(.03, .04, .4, 12), clay('#2a2a30')), 0, .2, 0); add(table, mesh(G.cyl(.18, .2, .025, 20), clay('#2a2a30')), 0, .012, 0); add(g, table, TX, 0, TZ);
  const chair = (x, yaw) => { const c = new THREE.Group(); add(c, mesh(G.rbox(.3, .04, .28, .015), clay('#b0603a')), 0, .18, 0); [[-.12, -.11], [.12, -.11], [-.12, .11], [.12, .11]].forEach(([a, b]) => add(c, mesh(G.cyl(.012, .012, .18, 8), clay('#2a2a30')), a, .09, b)); add(c, mesh(G.rbox(.3, .26, .03, .015), clay('#b0603a')), 0, .42, -.13); [-.12, .12].forEach(a => add(c, mesh(G.cyl(.012, .012, .26, 8), clay('#2a2a30')), a, .3, -.13)); c.rotation.y = yaw; add(g, c, x, 0, TZ); return c; };
  const chL = chair(-.52, Math.PI / 2), chR = chair(.52, -Math.PI / 2);
  // чашки, книга, вазочка
  const cup = (x, z, col) => { const c = new THREE.Group(); add(c, mesh(G.cyl(.045, .036, .08, 16), clay(col)), 0, .04, 0); add(c, mesh(G.cyl(.04, .04, .005, 16), clay('#7a4a2a')), 0, .078, 0); const hd = mesh(new THREE.TorusGeometry(.022, .007, 6, 12), clay(col)); hd.position.set(.05, .045, 0); c.add(hd); add(c, mesh(G.cyl(.07, .07, .01, 18), clay(col)), 0, .002, 0); add(g, c, x, .44, z); return c; };
  const cupS = cup(-.18, TZ + .08, '#ffffff'), cupM = cup(.2, TZ + .1, '#f6c8d8');
  const book = new THREE.Group(); add(book, mesh(G.box(.16, .025, .22), clay('#3a5a9a')), 0, 0, 0); add(book, mesh(G.box(.15, .02, .21), clay('#f8f2e4')), .005, .004, 0); add(g, book, .16, .45, TZ - .14); book.rotation.y = .3;
  const vase = new THREE.Group(); add(vase, mesh(G.cyl(.03, .04, .1, 14), clay('#9ad0e8', { roughness: .2 })), 0, .05, 0); add(vase, mesh(G.cyl(.005, .005, .14, 6), clay('#3a8a4a')), 0, .15, 0); add(vase, mesh(G.sph(.035, 12), clay('#ff6a8a')), 0, .23, 0); add(g, vase, 0, .44, TZ - .2);
  // пятно пролитого кофе (показывается в сцене 7)
  const spill = mesh(new THREE.CircleGeometry(.12, 24), clay('#6a3a1e', { roughness: .2 }), false, true); spill.rotation.x = -Math.PI / 2; add(g, spill, -.12, .439, TZ + .12); spill.visible = false;
  // стойка с кофемашиной справа
  const counter = new THREE.Group(); add(counter, mesh(G.rbox(1.6, .62, .5, .03), clay('#6a4a3a')), 0, .31, 0); add(counter, mesh(G.rbox(1.7, .05, .56, .02), clay('#e8e0d4')), 0, .64, 0);
  add(counter, mesh(G.rbox(.4, .32, .3, .04), clay('#c8ccd4', { metalness: .5, roughness: .3 })), -.3, .82, -.05); add(counter, mesh(G.cyl(.1, .1, .24, 16), clay('#f4ecd8', { roughness: .3 })), .35, .78, 0);
  add(g, counter, 2.6, 0, -.9);
  const barista = makeToy({ skin: '#c88a64', hair: '#1a1214', top: '#f2f2f2', top2: '#2a2a30', pants: '#2a2a30', shoes: '#3a3a40', hood: false, eye: '#1a1210', blush: .3 });
  barista.root.position.set(2.5, 0, -1.25); barista.root.traverse(o => { if (o.isMesh) o.castShadow = true; }); g.add(barista.root);
  const apron = mesh(G.rbox(.24, .3, .02, .01), clay('#2e4a3e')); apron.position.set(0, .14, .14); barista.spine.add(apron);
  const tray = new THREE.Group(); add(tray, mesh(G.cyl(.16, .16, .015, 24), clay('#c8ccd4', { metalness: .5, roughness: .3 })), 0, 0, 0); [[-.06, 0], [.06, .03]].forEach(([x, z]) => add(tray, mesh(G.cyl(.035, .03, .07, 14), clay('#ffffff')), x, .04, z)); g.add(tray);
  [table, chL, chR, book, vase, cupS, cupM].forEach(o => o.traverse(m => { if (m.isMesh) m.castShadow = false; }));
  // пятно солнца из окна на стене (тени-персонажи стоят в нём)
  const patch = mesh(G.plane(3.4, 2.2), new THREE.MeshBasicMaterial({ map: canvasTex(340, 220, (c) => { c.filter = 'blur(10px)'; c.fillStyle = 'rgba(255,214,150,.75)'; [[30, 20], [180, 20], [30, 115], [180, 115]].forEach(([x, y]) => c.fillRect(x, y, 135, 88)); }), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }), false, false);
  add(g, patch, .45, 1.45, WZ + .05);
  reg('cafe', g, new THREE.Color('#2a1e1a'));
  return { g, sun, patch, wallZ: WZ, TX, TZ, chL, chR, cupS, cupM, book, vase, spill, barista, tray, counter };
})();

// ===== ФАСАД КАФЕ (снаружи, день) =====
export const front = (() => {
  const g = new THREE.Group();
  g.add(new THREE.HemisphereLight('#cfe6ff', '#c8a078', .95));
  const sun = new THREE.DirectionalLight('#fff0d0', 3.8); sun.position.set(3, 5, 6); sun.target.position.set(0, .5, -1.3);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: .5, far: 25 }); sun.shadow.bias = -.0006; sun.shadow.radius = 3; g.add(sun, sun.target);
  const FZ = -1.3;
  const pav = canvasTex(256, 256, (c) => { c.fillStyle = '#d8c8b0'; c.fillRect(0, 0, 256, 256); c.strokeStyle = '#bfae96'; c.lineWidth = 4; for (let i = 0; i <= 4; i++) { c.beginPath(); c.moveTo(i * 64, 0); c.lineTo(i * 64, 256); c.stroke(); c.beginPath(); c.moveTo(0, i * 64); c.lineTo(256, i * 64); c.stroke(); } });
  pav.wrapS = pav.wrapT = THREE.RepeatWrapping; pav.repeat.set(12, 8);
  const ground = mesh(G.plane(40, 26), new THREE.MeshStandardMaterial({ map: pav, roughness: .95 }), false, true); ground.rotation.x = -Math.PI / 2; g.add(ground);
  const road = mesh(G.plane(40, 5), clay('#5a5866'), false, true); road.rotation.x = -Math.PI / 2; add(g, road, 0, .004, 4.4);
  add(g, mesh(G.box(40, .1, .2), clay('#b8b0a8'), true, true), 0, .05, 1.85);
  const wt = plaster('#f6e6cc', '160,120,80'); wt.wrapS = wt.wrapT = THREE.RepeatWrapping; wt.repeat.set(4, 2);
  const fac = mesh(G.box(12, 4.2, .3), new THREE.MeshStandardMaterial({ map: wt, roughness: .95 }), false, true); add(g, fac, 0, 2.1, FZ - .15);
  // витрина: тёплый зал внутри
  const vit = mesh(G.plane(2.2, 1.5), new THREE.MeshStandardMaterial({ map: canvasTex(220, 150, (c) => { c.fillStyle = '#f4c88a'; c.fillRect(0, 0, 220, 150); c.fillStyle = '#e8a860'; c.fillRect(0, 100, 220, 50); c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.moveTo(20, 0); c.lineTo(70, 0); c.lineTo(20, 150); c.lineTo(-30, 150); c.fill(); c.fillStyle = '#6a4a3a'; c.beginPath(); c.arc(150, 98, 22, Math.PI, 0); c.fill(); c.fillRect(146, 98, 8, 40); c.fillStyle = '#ffffff'; c.font = '700 22px Cav'; c.fillText('Luna', 30, 40); }), emissive: '#ffcf8a', emissiveIntensity: .35, roughness: .3 }), false, true);
  add(g, vit, -1.7, 1.25, FZ + .02); add(g, mesh(G.rbox(2.35, 1.65, .06, .02), clay('#2e4a3e')), -1.7, 1.25, FZ);
  // дверь
  // дверь на петлях (левый край x=.125), за ней — тёплый проём
  add(g, mesh(G.plane(.85, 1.75), glow('#ffd49a', .9), false, false), .55, .875, FZ - .005);
  const door = new THREE.Group(); door.position.set(.125, 0, FZ + .03); g.add(door);
  add(door, mesh(G.rbox(.85, 1.75, .06, .02), clay('#2e4a3e'), false, true), .425, .875, 0);
  add(door, mesh(G.plane(.55, .9), new THREE.MeshStandardMaterial({ color: '#f4d8a8', emissive: '#ffcf8a', emissiveIntensity: .3, roughness: .2 }), false, false), .425, 1.15, .035);
  add(door, mesh(G.sph(.03), clay('#d8b860', { metalness: .6, roughness: .3 })), .72, .9, .05);
  // маркиза и вывеска
  const aw = mesh(G.box(3.8, .06, .8), new THREE.MeshStandardMaterial({ map: canvasTex(128, 32, (c) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#f2e8e0' : '#2e8a6a'; c.fillRect(i * 16, 0, 16, 32); } }), roughness: .8 }), true, true); aw.rotation.x = .35; add(g, aw, -.6, 2.35, FZ + .4);
  const sign = mesh(G.plane(1.8, .42), new THREE.MeshBasicMaterial({ map: canvasTex(512, 120, (c) => { c.fillStyle = '#2e4a3e'; c.fillRect(0, 0, 512, 120); c.fillStyle = '#f6e6cc'; c.font = '800 64px Unb'; c.textAlign = 'center'; c.fillText('CAFÉ LUNA', 256, 84); }) }), false, false); add(g, sign, -.6, 2.95, FZ + .02);
  // горшки с цветами, стойка-меню
  [[-3.1, '#e8705a'], [1.35, '#f6d48a']].forEach(([x, col]) => { add(g, mesh(G.cyl(.18, .14, .3, 16), clay('#c86a4a')), x, .15, FZ + .3); [[0, .42, 0, .2], [.12, .36, .06, .13], [-.12, .37, -.04, .13]].forEach(([dx, dy, dz, r]) => add(g, mesh(G.sph(r, 12), clay('#4aa86a')), x + dx, dy, FZ + .3 + dz)); [[.05, .5, .12], [-.1, .45, .1], [.14, .4, .0]].forEach(([dx, dy, dz]) => add(g, mesh(G.sph(.045, 10), clay(col)), x + dx, dy, FZ + .3 + dz)); });
  const board = new THREE.Group(); const bt = mesh(G.box(.5, .7, .03), new THREE.MeshStandardMaterial({ map: canvasTex(100, 140, (c) => { c.fillStyle = '#26302c'; c.fillRect(0, 0, 100, 140); c.fillStyle = '#f0ece0'; c.font = '700 18px Cav'; c.textAlign = 'center'; ['TODAY:', 'first', 'dates', 'welcome ♥'].forEach((l, i) => c.fillText(l, 50, 30 + i * 28)); }) }));
  bt.rotation.x = -.18; add(board, bt, 0, .38, 0); add(g, board, 2.3, 0, FZ + .6); board.rotation.y = -.3;
  for (let i = 0; i < 8; i++) building(g, -16 + i * 4.4, -6, 3.6, 5 + h1(i + 70) * 4, 2.5, ['#f0a878', '#9ad0c8', '#e88a9a', '#a8b8f0'][i % 4], '#fff6dc', 80 + i, .5);
  reg('front', g, skyTex([[0, '#6ab8ff'], [.7, '#bfe0ff'], [1, '#ffe2b8']]), new THREE.Fog('#d8e8ff', 14, 40));
  return { g, sun, wallZ: FZ + .02, doorX: .55, door };
})();
