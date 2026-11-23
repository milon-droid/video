// Спальня (камера на кровати, смотрит на дверь) + коридор за дверью. Обои, доски, дверь, шкаф, окно с дождём, тумбочка с фотоаппаратом, фото деда.
import { THREE, scene, mesh, mat, G, canvasTex, V3, h1 } from './core.js';
export const R = {};
const add = (m, x, y, z) => { m.position.set(x, y, z); scene.add(m); return m; };
const bx = (x0, x1, y0, y1, z0, z1, m, cast = true) => add(mesh(G.box(x1 - x0, y1 - y0, z1 - z0), m, cast, true), (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);

const wallpaper = canvasTex(512, 512, (g, w, h) => {
  g.fillStyle = '#7d8a74'; g.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 64) { g.fillStyle = 'rgba(40,50,35,.18)'; g.fillRect(x, 0, 6, h); g.fillStyle = 'rgba(230,230,210,.10)'; g.fillRect(x + 32, 0, 3, h); }
  for (let y = 0; y < h; y += 96) for (let x = 0; x < w; x += 64) { const ox = x + ((y / 96) % 2 ? 32 : 0); g.save(); g.translate(ox + 16, y + 48); g.fillStyle = 'rgba(220,225,200,.16)';
    g.beginPath(); g.ellipse(0, -14, 7, 16, 0, 0, 7); g.ellipse(0, 14, 7, 16, 0, 0, 7); g.ellipse(-12, 0, 12, 5, 0, 0, 7); g.ellipse(12, 0, 12, 5, 0, 0, 7); g.fill(); g.restore(); }
  for (let i = 0; i < 2500; i++) { g.fillStyle = `rgba(0,0,0,${h1(i) * .05})`; g.fillRect(h1(i * 2) * w, h1(i * 3) * h, 2, 2); }
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(60,50,30,.12)'); gr.addColorStop(.5, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
}, [3, 1.6]);
const floorTex = canvasTex(512, 512, (g, w, h) => {
  for (let i = 0; i < 8; i++) { const c = 70 + h1(i) * 25; g.fillStyle = `rgb(${c + 30},${c + 12},${c - 10})`; g.fillRect(0, i * 64, w, 64); g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(0, i * 64, w, 2);
    for (let k = 0; k < 40; k++) { g.strokeStyle = `rgba(30,15,5,${.12 + h1(i * 40 + k) * .15})`; g.lineWidth = 1; g.beginPath(); const y = i * 64 + h1(k + i) * 64; g.moveTo(0, y); g.bezierCurveTo(w * .3, y + 6, w * .6, y - 6, w, y + h1(k) * 4); g.stroke(); }
    g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(((i * 197) % w), i * 64, 2, 64); }
}, [3, 3]);
const doorTex = canvasTex(256, 512, (g, w, h) => {
  g.fillStyle = '#d6d0c2'; g.fillRect(0, 0, w, h);
  for (const [x, y, ww, hh] of [[28, 30, 200, 190], [28, 260, 200, 220]]) { g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 6; g.strokeRect(x, y, ww, hh); g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 2; g.strokeRect(x + 8, y + 8, ww - 16, hh - 16); }
  for (let i = 0; i < 800; i++) { g.fillStyle = `rgba(80,60,40,${h1(i) * .08})`; g.fillRect(h1(i * 5) * w, h1(i * 7) * h, 3, 1); }
});
const sheetTex = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#cfcfd6'; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 32) for (let y = 0; y < h; y += 32) { g.fillStyle = 'rgba(90,90,130,.18)'; g.beginPath(); g.arc(x + 16, y + 16, 6, 0, 7); g.fill(); } }, [3, 3]);
const rainTex = canvasTex(256, 512, (g, w, h) => { g.fillStyle = '#05070c'; g.fillRect(0, 0, w, h); for (let i = 0; i < 180; i++) { g.strokeStyle = `rgba(150,170,210,${.15 + h1(i) * .3})`; g.lineWidth = 1 + h1(i * 2); const x = h1(i * 3) * w, y = h1(i * 5) * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 3, y + 14 + h1(i) * 30); g.stroke(); } }, [1, 1]);
export const T = { wallpaper, rainTex };

export function buildRoom() {
  const wallM = mat(0xffffff, { map: wallpaper, roughness: .9 }), floorM = mat(0xffffff, { map: floorTex, roughness: .6 }), ceilM = mat(0xe8e4da, { roughness: .95 }), trimM = mat(0xe0dbcf, { roughness: .5 });
  // ===== СПАЛЬНЯ x[-2,2] z[-2,2] h2.6 =====
  bx(-2, 2, -.05, 0, -2, 2.2, floorM, false); bx(-2, 2, 2.6, 2.65, -2, 2.2, ceilM, false);
  bx(-2.05, -2, 0, 2.6, -2, 2.2, wallM); bx(2, 2.05, 0, 2.6, -2, 2.2, wallM); bx(-2, 2, 0, 2.6, 2.2, 2.25, wallM);
  // стена с дверью (z=-2), проём x[.3,1.2]
  bx(-2, .3, 0, 2.6, -2.05, -2, wallM); bx(1.2, 2, 0, 2.6, -2.05, -2, wallM); bx(.3, 1.2, 2.1, 2.6, -2.05, -2, wallM);
  bx(.24, .3, 0, 2.15, -2.07, -1.97, trimM); bx(1.2, 1.26, 0, 2.15, -2.07, -1.97, trimM); bx(.24, 1.26, 2.1, 2.16, -2.07, -1.97, trimM);
  // дверь на петлях у x=1.2, открывается внутрь комнаты
  R.doorPivot = new THREE.Group(); R.doorPivot.position.set(1.2, 0, -2.02); scene.add(R.doorPivot);
  const door = mesh(G.box(.9, 2.08, .045), mat(0xffffff, { map: doorTex, roughness: .55 })); door.position.set(-.45, 1.04, 0); R.doorPivot.add(door);
  const knob = mesh(G.sph(.03, 16), mat(0xb8a070, { metalness: .8, roughness: .3 })); knob.position.set(-.82, 1.0, .05); R.doorPivot.add(knob);
  // плинтусы
  bx(-2, 2, 0, .1, 2.18, 2.2, trimM); bx(-2, -1.98, 0, .1, -2, 2.2, trimM); bx(1.98, 2, 0, .1, -2, 2.2, trimM);
  // окно слева (x=-2), z[-.6,.7]
  R.window = add(mesh(G.plane(1.3, 1.25), new THREE.MeshBasicMaterial({ map: rainTex, color: 0x223044 }), false, false), -1.995, 1.45, .05); R.window.rotation.y = Math.PI / 2;
  const fr = mat(0xd8d2c4, { roughness: .5 }); bx(-2.02, -1.94, .8, .86, -.62, .72, fr); bx(-2.02, -1.94, 2.06, 2.12, -.62, .72, fr); bx(-2.02, -1.94, .8, 2.12, -.66, -.6, fr); bx(-2.02, -1.94, .8, 2.12, .7, .76, fr); bx(-2.0, -1.96, .8, 2.12, .03, .07, fr); bx(-2, -1.96, 1.43, 1.47, -.62, .72, fr);
  bx(-2.0, -1.8, .78, .82, -.7, .8, fr);
  // штора
  const curtain = mat(0x5a3a3a, { roughness: .95, side: THREE.DoubleSide }); for (let k = 0; k < 6; k++) bx(-1.93, -1.88 + (k % 2) * .03, .4, 2.3, .75 + k * .07, .82 + k * .07, curtain);
  // кровать (у задней стены), камера на ней
  const wood = mat(0x5b3a22, { roughness: .55 });
  bx(-1.2, .6, 0, .4, .3, 2.2, wood); bx(-1.15, .55, .4, .62, .35, 2.15, mat(0xffffff, { map: sheetTex, roughness: .9 }));
  bx(-1.25, .65, 0, 1.15, 2.1, 2.2, wood); add(mesh(G.box(.6, .16, .4), mat(0xe2e2e8, { roughness: .9 })), -.3, .72, 1.85);
  // тумбочка с фотоаппаратом
  bx(-1.85, -1.35, 0, .6, 1.55, 2.05, wood); bx(-1.85, -1.35, .6, .63, 1.55, 2.05, mat(0x6b4a30, { roughness: .4 }));
  R.camProp = buildCameraProp(); R.camProp.position.set(-1.6, .66, 1.75); R.camProp.rotation.y = .5; scene.add(R.camProp);
  // шкаф справа (x=2): створки открываются
  bx(1.4, 1.98, 0, 2.25, -.9, .7, wood);
  R.wardL = new THREE.Group(); R.wardL.position.set(1.39, 0, -.9); scene.add(R.wardL); const dl = mesh(G.box(.03, 2.2, .78), mat(0x6b4529, { roughness: .5 })); dl.position.set(0, 1.12, .39); R.wardL.add(dl);
  R.wardR = new THREE.Group(); R.wardR.position.set(1.39, 0, .7); scene.add(R.wardR); const dr = mesh(G.box(.03, 2.2, .78), mat(0x6b4529, { roughness: .5 })); dr.position.set(0, 1.12, -.39); R.wardR.add(dr);
  bx(1.94, 1.96, .02, 2.2, -.88, .68, mat(0xa58560, { roughness: .8 }));   // светлая задняя стенка шкафа
  for (let k = 0; k < 6; k++) { const c = mesh(G.box(.06, .9, .4), mat([0x8a8f99, 0xb7a58c, 0x6c7a6a, 0xc9c2b5, 0x7f6a5c, 0x9aa2ad][k], { roughness: .95 })); c.position.set(1.7, 1.6, -.7 + k * .26); c.rotation.y = Math.PI / 2 + (k % 2 ? .1 : -.1); scene.add(c); }
  bx(1.42, 1.96, 2.04, 2.07, -.88, .68, mat(0x6b4529));
  // стол со стулом, лампа на потолке
  bx(-1.95, -1.3, .74, .78, -1.8, -1.0, wood); for (const [x, z] of [[-1.9, -1.75], [-1.35, -1.75], [-1.9, -1.05], [-1.35, -1.05]]) bx(x - .02, x + .02, 0, .74, z - .02, z + .02, wood);
  bx(-1.2, -.8, .45, .48, -1.6, -1.2, wood); bx(-1.2, -.8, .48, 1.0, -1.62, -1.58, wood);
  R.bulb = add(mesh(G.sph(.07, 20), new THREE.MeshStandardMaterial({ color: 0xfff2d8, emissive: 0x000000 })), 0, 2.3, 0); add(mesh(G.cyl(.01, .01, .3), mat(0x222222)), 0, 2.48, 0);
  add(mesh(G.cyl(.05, .26, .2, 24), mat(0xe8dcc0, { side: THREE.DoubleSide, roughness: .8 }), false), 0, 2.38, 0);
  // фото деда на правой стене (текстура — позже, из рендера)
  R.photoFrame = add(mesh(G.box(.04, .5, .42), mat(0x3a2414, { roughness: .4 })), 1.98, 1.55, 1.45);
  R.photo = add(mesh(G.plane(.34, .42), mat(0xffffff, { roughness: .7 }), false, true), 1.955, 1.55, 1.45); R.photo.rotation.y = -Math.PI / 2;
  // ===== КОРИДОР x[.15,1.35] z[-9,-2] =====
  bx(.15, 1.35, -.05, 0, -9, -2, floorM, false); bx(.15, 1.35, 2.5, 2.55, -9, -2, ceilM, false);
  bx(.1, .15, 0, 2.5, -9, -2, wallM); bx(1.35, 1.4, 0, 2.5, -9, -2, wallM); bx(.15, 1.35, 0, 2.5, -9.05, -9, wallM);
  bx(.3, 1.2, .005, .01, -8.8, -2.2, mat(0x5a2626, { roughness: 1 }), false);   // ковровая дорожка
  for (const z of [-4.2, -6.8]) { bx(.15, .19, 0, 2.05, z - .45, z + .45, mat(0xffffff, { map: doorTex, roughness: .55 })); bx(1.31, 1.35, 0, 2.05, z - .9, z, mat(0xffffff, { map: doorTex, roughness: .55 })); }
  for (const z of [-3.2, -5.5, -7.8]) bx(1.32, 1.35, 1.35, 1.75, z - .2, z + .2, mat(0x2a1a10));
  R.endWin = add(mesh(G.plane(.5, .8), new THREE.MeshBasicMaterial({ map: rainTex, color: 0x1a2232 }), false, false), .75, 1.5, -8.99);
}
// старый плёночный фотоаппарат
export function buildCameraProp() {
  const g = new THREE.Group(); const body = mat(0x1c1c1e, { roughness: .45 }), chrome = mat(0xc9c9c9, { metalness: .9, roughness: .25 });
  const b = mesh(G.box(.14, .08, .05), body); g.add(b); const top = mesh(G.box(.14, .012, .05), chrome); top.position.y = .046; g.add(top);
  const lens = mesh(G.cyl(.024, .028, .03, 24), chrome); lens.rotation.x = Math.PI / 2; lens.position.set(.02, 0, .035); g.add(lens);
  const glass = mesh(G.cyl(.018, .018, .005, 24), mat(0x101820, { metalness: .5, roughness: .05 })); glass.rotation.x = Math.PI / 2; glass.position.set(.02, 0, .051); g.add(glass);
  const fl = mesh(G.box(.035, .018, .006), mat(0xeeeeee, { emissive: 0x000000, roughness: .2 })); fl.position.set(-.045, .025, .027); g.add(fl);
  g.userData.led = mesh(G.sph(.004, 8), new THREE.MeshBasicMaterial({ color: 0x330000 })); g.userData.led.position.set(-.055, .05, .0); g.add(g.userData.led);
  return g;
}
