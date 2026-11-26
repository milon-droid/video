// Квартира: гостиная → коридор (зеркало в конце) → спальня. Всё — в градусах.
import { THREE, scene, tMat, mesh, G, V3, thermalMirror, canvasTex, steamPoints, setHeat } from './core.js';
export const S = {};
const add = (m, x, y, z) => { m.position.set(x, y, z); scene.add(m); return m; };
// коробка по границам
const bx = (x0, x1, y0, y1, z0, z1, mat) => add(mesh(G.box(x1 - x0, y1 - y0, z1 - z0), mat), (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);

// --- материалы ---
const lrWall = tMat({ T: 19.6, grad: .7, studs: .35, studAx: [1, 0], nz: .25, fres: .45, edge: [0, 2.6, -1.3] });
const lrWallX = tMat({ T: 19.6, grad: .7, studs: .35, studAx: [0, 1], nz: .25, fres: .45, edge: [0, 2.6, -1.3] });
const lrFloor = tMat({ T: 18.6, nz: .3, nzs: 1.5, fres: .5 });
const ceil = tMat({ T: 21.2, nz: .2, fres: .4 });
// коридор: чем дальше к зеркалу, тем холоднее
const hwG = [0, .5, .72], hwP = [0, 0, -2.5];
const hwWall = tMat({ T: 16.2, grad: hwG, p0: hwP, studs: .45, studAx: [0, 1], nz: .3, edge: [0, 2.5, -1.4] });
const hwWallZ = tMat({ T: 16.2, grad: hwG, p0: hwP, studs: .45, studAx: [1, 0], nz: .3, edge: [0, 2.5, -1.4] });
const hwFloorM = (decal) => tMat({ T: 15.2, grad: [0, 0, .7], p0: hwP, nz: .3, nzs: 2, decal, decalK: -3.2 });
const brWall = tMat({ T: 18.6, grad: .6, studs: .3, studAx: [1, 0], nz: .25, edge: [0, 2.5, -1.2] });
const brWallX = tMat({ T: 18.6, grad: .6, studs: .3, studAx: [0, 1], nz: .25, edge: [0, 2.5, -1.2] });
const wood = tMat({ T: 17.8, nz: .35, nzs: 6 });

export function buildSet() {
  // ===== ГОСТИНАЯ x[-3,3] z[-2.5,2.5] h2.6 =====
  bx(-3, 3, -.1, 0, -2.5, 2.5, lrFloor); bx(-3, 3, 2.6, 2.7, -2.5, 2.5, ceil);
  bx(-3.1, -3, 0, 2.6, -2.5, 2.5, lrWallX); bx(3, 3.1, 0, 2.6, -2.5, 2.5, lrWallX); bx(-3, 3, 0, 2.6, 2.5, 2.6, lrWall);
  // задняя стена с окном и проёмом в коридор
  bx(-3, -1.9, 0, 2.6, -2.6, -2.5, lrWall); bx(-1.9, -.1, 0, .9, -2.6, -2.5, lrWall); bx(-1.9, -.1, 2.1, 2.6, -2.6, -2.5, lrWall);
  bx(-.1, 1.45, 0, 2.6, -2.6, -2.5, lrWall); bx(1.45, 2.55, 2.1, 2.6, -2.6, -2.5, lrWall); bx(2.55, 3, 0, 2.6, -2.6, -2.5, lrWall);
  // окно: стекло отражает тепло комнаты; за ним — ночь
  const win = thermalMirror(1.8, 1.2, { glass: 9, refl: .9, res: 1 }); win.position.set(-1, 1.5, -2.53); scene.add(win); S.window = win;
  const frameM = tMat({ T: 11.5, nz: .2 });
  bx(-1.95, -.05, .88, .93, -2.62, -2.46, frameM); bx(-1.95, -.05, 2.07, 2.12, -2.62, -2.46, frameM); bx(-1.95, -1.9, .9, 2.1, -2.62, -2.46, frameM); bx(-.1, -.05, .9, 2.1, -2.62, -2.46, frameM);
  bx(-1.03, -.97, .9, 2.1, -2.58, -2.5, frameM); bx(-1.9, -.1, 1.48, 1.52, -2.58, -2.5, frameM);
  bx(-2.05, .05, .86, .9, -2.5, -2.3, tMat({ T: 21, nz: .2 })); // подоконник греется от батареи
  // батарея: горячие рёбра
  const rad = tMat({ T: 46.5, grad: -6, p0: [0, .78, 0], nz: .4, nzs: 5, fres: .3 });
  for (let i = 0; i < 12; i++) bx(-1.7 + i * .115, -1.7 + i * .115 + .07, .14, .78, -2.46, -2.36, rad);
  bx(-1.72, -.33, .1, .14, -2.45, -2.4, rad); bx(-1.72, -.33, .76, .8, -2.45, -2.4, rad);
  setHeat(0, -1, 1.05, -2.5, .55, 29); setHeat(1, -1, .45, -2.2, .5, 27);
  // диван, столик, кружка, телевизор, торшер, растение
  const sofa = tMat({ T: 20.4, nz: .5, nzs: 4, fres: .6 }), cushion = tMat({ T: 20.9, nz: .6, nzs: 5, fres: .7 });
  bx(-2.95, -2.1, .1, .45, -.7, 1.7, sofa); bx(-3, -2.75, .45, 1.0, -.7, 1.7, sofa); bx(-2.95, -2.1, .1, .7, -.95, -.7, sofa); bx(-2.95, -2.1, .1, .7, 1.7, 1.95, sofa);
  for (const z of [-.25, .5, 1.25]) { const c = add(mesh(G.box(.72, .16, .7, 3), cushion), -2.48, .53, z); c.scale.set(1, 1, .98); const b = add(mesh(G.box(.2, .45, .68, 3), cushion), -2.68, .78, z); b.rotation.z = -.12; }
  bx(-1.75, -.95, .38, .42, .2, .85, wood); for (const [x, z] of [[-1.7, .25], [-1, .25], [-1.7, .8], [-1, .8]]) bx(x - .02, x + .02, 0, .38, z - .02, z + .02, wood);
  S.mug = add(mesh(G.cyl(.042, .038, .1, 18), tMat({ T: 61, grad: 18, p0: [0, .47, 0], nz: .3, fres: .35 })), -1.3, .47, .45);
  add(mesh(new THREE.TorusGeometry(.028, .009, 8, 14), tMat({ T: 49, nz: .1 })), -1.255, .47, .45).rotation.y = Math.PI / 2;
  S.steam = steamPoints(60); scene.add(S.steam);
  const tvM = tMat({ T: 26.5, grad: 3, p0: [0, 1.25, 0], nz: .2, fres: .4 });
  bx(2.88, 2.97, .95, 1.6, -.25, .85, tvM); bx(2.5, 2.99, 0, .5, -.4, 1, wood);
  bx(2.6, 2.75, .5, .58, .1, .5, tMat({ T: 34, nz: .3 })); // приставка тёплая
  const lampM = tMat({ T: 18.5, nz: .1 }); bx(2.55, 2.6, 0, 1.6, 1.9, 1.95, lampM); add(mesh(G.cyl(.12, .2, .25, 16), lampM), 2.57, 1.65, 1.92);
  const plant = tMat({ T: 17.2, nz: .8, nzs: 18, fres: .7 }); add(mesh(G.cyl(.16, .12, .35, 14), tMat({ T: 17.8 })), 2.55, .17, -2.1);
  for (let i = 0; i < 9; i++) { const l = add(mesh(G.sph(.13 + (i % 3) * .03, 10), plant), 2.55 + Math.sin(i * 2.1) * .17, .5 + i * .07, -2.1 + Math.cos(i * 2.1) * .15); l.scale.set(1, .55, 1); }
  // рама проёма
  const casing = tMat({ T: 17.5, nz: .2 }); bx(1.4, 1.48, 0, 2.15, -2.5, -2.42, casing); bx(2.52, 2.6, 0, 2.15, -2.5, -2.42, casing); bx(1.4, 2.6, 2.1, 2.17, -2.5, -2.42, casing);

  // ===== КОРИДОР x[1.45,2.55] z[-9,-2.5] h2.5 =====
  // следы на полу: холодные отпечатки босых ног — из спальни к гостиной
  const fTex = canvasTex(256, 1536, (g, w, h) => {
    const Z = z => (z + 9) / 6.5 * h, X = x => (x - 1.45) / 1.1 * w;
    g.filter = 'blur(2px)'; g.fillStyle = '#fff';
    const foot = (x, z, a, L) => { g.save(); g.translate(X(x), Z(z)); g.rotate(a); g.globalAlpha = .85; g.beginPath(); g.ellipse(0, -6, 17, 34, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(0, 36, 13, 18, 0, 0, 7); g.fill();
      for (let k = 0; k < 5; k++) { g.beginPath(); g.arc((L ? -1 : 1) * (-14 + k * 7), -46 - Math.sin(k / 4 * 3.1) * 6 + k * 1.5, 6 - k * .6, 0, 7); g.fill(); } g.restore(); };
    const pts = [[1.62, -6.25, -1.2, 1], [1.82, -6.0, -.6, 0], [1.9, -5.45, -.15, 1], [2.12, -4.95, 0, 0], [1.92, -4.4, 0, 1], [2.14, -3.85, 0, 0], [1.94, -3.3, 0, 1], [2.13, -2.8, 0, 0]];
    pts.forEach(([x, z, a, L]) => foot(x, z, Math.PI + a, L));
  });
  S.hwFloor = add(mesh(G.plane(1.1, 6.5), hwFloorM(fTex)), 2, 0, -5.75); S.hwFloor.rotation.x = -Math.PI / 2;
  bx(1.45, 2.55, 2.5, 2.6, -9, -2.5, tMat({ T: 17, grad: [0, 0, .5], p0: hwP, nz: .2 }));
  // левая стена (общая со спальней) с дверным проёмом z[-6.6,-5.7]
  bx(1.4, 1.5, 0, 2.5, -5.7, -2.5, hwWall); bx(1.4, 1.5, 0, 2.5, -9, -6.6, hwWall); bx(1.4, 1.5, 2.05, 2.5, -6.6, -5.7, hwWall);
  bx(1.38, 1.52, 0, 2.08, -5.72, -5.66, casing); bx(1.38, 1.52, 0, 2.08, -6.64, -6.58, casing);
  // правая стена с закрытой дверью ванной
  bx(2.55, 2.65, 0, 2.5, -9, -2.5, hwWall);
  bx(2.5, 2.56, 0, 2.05, -4.5, -3.7, tMat({ T: 15.4, grad: [0, .4, .7], p0: hwP, nz: .3, nzs: 5 }));
  add(mesh(G.sph(.03, 10), tMat({ T: 12, nz: 0 })), 2.48, 1.0, -3.8);
  // отпечатки ладоней на правой стене — холоднее стены
  const hTex = canvasTex(512, 256, (g, w, h) => {
    g.filter = 'blur(3px)'; g.fillStyle = '#fff';
    const hand = (x, y, a, s, al) => { g.save(); g.translate(x, y); g.rotate(a); g.scale(s, s); g.globalAlpha = al; g.beginPath(); g.ellipse(0, 0, 22, 26, 0, 0, 7); g.fill();
      [[-17, -30, -.35, 26], [-6, -40, -.1, 30], [6, -42, .05, 32], [17, -36, .2, 27]].forEach(([fx, fy, fa, fl]) => { g.save(); g.translate(fx, fy); g.rotate(fa); g.beginPath(); g.roundRect(-5, -fl / 2, 10, fl, 5); g.fill(); g.restore(); });
      g.save(); g.translate(-26, 2); g.rotate(-1); g.beginPath(); g.roundRect(-5, -14, 10, 28, 5); g.fill(); g.restore(); g.restore(); };
    hand(70, 120, .2, 1.1, .9); hand(160, 95, .1, 1.05, .8); hand(250, 140, -.1, 1.1, .7); hand(330, 110, .15, 1, .55); hand(420, 130, 0, 1.05, .45);
    // смаз — проведённая по стене рука
    g.globalAlpha = .35; g.lineWidth = 26; g.lineCap = 'round'; g.strokeStyle = '#fff'; g.beginPath(); g.moveTo(90, 135); g.bezierCurveTo(200, 150, 300, 120, 470, 140); g.stroke();
  });
  const hp = add(mesh(G.plane(2.8, 1.4), tMat({ T: 16.2, grad: hwG, p0: hwP, studs: .45, studAx: [0, 1], nz: .3, edge: [0, 2.5, -1.4], decal: hTex, decalK: -3.6 })), 2.548, 1.25, -4.4); hp.rotation.y = -Math.PI / 2;
  // торцевая стена с зеркалом
  bx(1.45, 2.55, 0, 2.5, -9.1, -9, hwWallZ);
  bx(1.55, 2.45, .78, .82, -8.98, -8.7, wood); bx(1.6, 1.64, 0, .78, -8.95, -8.75, wood); bx(2.36, 2.4, 0, .78, -8.95, -8.75, wood); // консоль
  const mir = thermalMirror(.74, 1.5, { glass: 11.2, refl: .82, layers: [1], res: 1 }); mir.position.set(2, 1.62, -8.97); scene.add(mir); S.mirror = mir;
  const mf = tMat({ T: 12.6, nz: .25, nzs: 7 }); bx(1.58, 2.42, .82, .87, -9, -8.94, mf); bx(1.58, 2.42, 2.37, 2.42, -9, -8.94, mf); bx(1.58, 1.63, .82, 2.42, -9, -8.94, mf); bx(2.37, 2.42, .82, 2.42, -9, -8.94, mf);
  // вешалка с куртками у входа в коридор
  const coat = tMat({ T: 16.4, nz: .6, nzs: 6, fres: .7 }); bx(2.5, 2.55, 1.75, 1.8, -3.4, -2.8, wood);
  for (const z of [-3.25, -2.95]) { const c = add(mesh(G.cyl(.09, .2, .95, 12), coat), 2.4, 1.3, z); c.scale.set(.7, 1, 1); }

  // ===== СПАЛЬНЯ x[-2.6,1.45] z[-8.6,-4.6] h2.5 =====
  bx(-2.6, 1.45, -.1, 0, -8.6, -4.6, tMat({ T: 18, nz: .3, nzs: 1.5 })); bx(-2.6, 1.45, 2.5, 2.6, -8.6, -4.6, ceil);
  bx(-2.7, -2.6, 0, 2.5, -8.6, -4.6, brWallX); bx(-2.6, 1.4, 0, 2.5, -4.7, -4.6, brWall); bx(-2.6, 1.4, 0, 2.5, -8.7, -8.6, brWall);
  const bedM = tMat({ T: 18.4, nz: .3, nzs: 6 }); bx(-2.6, -.5, 0, .36, -7.55, -5.65, bedM); bx(-2.62, -2.52, 0, 1.15, -7.6, -5.6, bedM);
  bx(-2.52, -.5, .36, .56, -7.5, -5.7, tMat({ T: 20.5, nz: .2 }));
  S.pillowJ = add(mesh(G.box(.42, .13, .62, 4), tMat({ T: 27.5, nz: .4, nzs: 6 })), -2.25, .63, -7.0);
  S.pillowD = add(mesh(G.box(.42, .13, .62, 4), tMat({ T: 11.5, nz: .4, nzs: 6 })), -2.25, .63, -6.15);
  // одеяло: поверхность обтекает тело Джесс; тело греет одеяло, на половине Дэна — холодный отпечаток
  const bl = G.plane(1.85, 2.0, 60, 60); bl.rotateX(-Math.PI / 2); const P = bl.attributes.position;
  const body = [[-2.0, -7.0, .16], [-1.65, -6.98, .2], [-1.25, -6.96, .19], [-.9, -6.95, .13], [-.62, -6.93, .1]];
  const dan = [[-1.95, -6.15, .1], [-1.5, -6.15, .1], [-1.0, -6.15, .07]];
  for (let i = 0; i < P.count; i++) {
    const x = P.getX(i) - 1.33, z = P.getZ(i) - 6.6; let h = .58;
    for (const [bx2, bz, r] of body) { const d = Math.hypot(x - bx2, z - bz); if (d < r * 1.9) h = Math.max(h, .58 + r * .75 * Math.cos(Math.min(1, d / (r * 1.9)) * Math.PI / 2)); }
    for (const [bx2, bz, r] of dan) { const d = Math.hypot(x - bx2, z - bz); if (d < r * 2) h = Math.min(h, .58 - .025 * Math.cos(d / (r * 2) * Math.PI / 2)); }
    const ex = Math.min(z + 7.6, -5.6 - z, -.42 - x); if (ex < .12) h = .58 - (.12 - ex) * 1.6; // свисает с края
    h += Math.sin(x * 9 + z * 4) * .006 + Math.sin(z * 13 - x * 3) * .004;
    P.setY(i, h);
  }
  bl.computeVertexNormals();
  S.blanket = add(mesh(bl, tMat({ T: 20.2, nz: .5, nzs: 7, fres: .55 })), -1.33, 0, -6.6);
  S.bodyHeat = body; S.danCold = dan;
  // тумбочка: часы и телефон на зарядке тёплые
  bx(-2.5, -2.05, 0, .55, -8.2, -7.7, wood); bx(-2.4, -2.25, .55, .64, -8.0, -7.85, tMat({ T: 29, nz: .1 })); bx(-2.2, -2.1, .55, .565, -7.95, -7.8, tMat({ T: 31.5, nz: .1 }));
  bx(-2.6, -1.0, 0, 2.0, -4.75, -4.6, tMat({ T: 17.6, nz: .3, nzs: 3 })); // шкаф
  bx(.2, 1.3, 0, .45, -8.55, -8.1, wood); // комод
}
// пар над кружкой: детерминированные частицы
export function steam(pts, t, src, { n = 60, rise = .35, life = 2.2, spread = .05, size = .06, a = .55, dT = 14, wind = [0, 0] } = {}) {
  const pos = pts.geometry.attributes.position, al = pts.geometry.attributes.a, sz = pts.geometry.attributes.sz;
  pts.material.uniforms.uDT.value = dT;
  for (let i = 0; i < n; i++) {
    const ph = ((t / life + i / n) % 1 + 1) % 1, seed = Math.floor(t / life + i / n) * 31 + i;
    const sx = Math.sin(seed * 12.9) * spread, sz2 = Math.cos(seed * 7.3) * spread;
    const x = src.x + sx * (1 + ph * 2) + Math.sin(ph * 6 + i) * .03 * ph + wind[0] * ph, y = src.y + ph * rise, z = src.z + sz2 * (1 + ph * 2) + wind[1] * ph;
    pos.setXYZ(i, x, y, z); al.setX(i, Math.sin(ph * Math.PI) * a); sz.setX(i, size * (1 + ph * 2.5));
  }
  pos.needsUpdate = al.needsUpdate = sz.needsUpdate = true;
}
