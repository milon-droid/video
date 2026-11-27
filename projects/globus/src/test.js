// тестовая сцена
E.SHAKES.push({ t: 0, s: 1 });
window.DURATION = 4;
function world(t, cp) {
  for (let i = 0; i < 3; i++) E.layerCtx(i);
  const c0 = E.layerCtx(0); A.ground(c0, 0); A.tree(c0, -.55, E.ground(-.55, E.LZ[0]) + .02, .45); A.house(c0, .3, E.ground(.3, E.LZ[0]) + .02, 1, 1, t);
  const c1 = E.layerCtx(1); A.ground(c1, 1); A.snowman(c1, .22, E.ground(.22, E.LZ[1]), .8); A.man(c1, { x: -.12, y: E.ground(-.12, E.LZ[1]), s: 1.2, t, aR: 2.6, mouth: .5 });
  const c2 = E.layerCtx(2); A.ground(c2, 2);
  E.drawFlakes(t, cp);
}
window.renderFrame = function (t) {
  E.clearAll(); E.defaults();
  if (window.MODE == 1) { E.cam = { p: [0, -.3, .75], t: [0, -.15, -1], fov: 55, roll: 0 }; }
  else { E.cam = { p: [0, .1, 5.2], t: [0, -.05, 0], fov: 40, roll: 0 }; }
  const cp = E.prepare(); world(t, cp);
  A.room(E.ox, 'night', t); if (window.MODE == 1) A.face(E.ox, { age: 'g6', x: 360, y: 180, s: 1.6, smile: .8, mouth: .4 });
  else { A.face(E.ox, { age: 'g6', x: 520, y: 260, s: 1.2, smile: .8 }); A.base(E.vx, 'LILY · 2009'); A.hands(E.vx, { kind: 'mit' }); }
  A.cap(E.vx, 'OUR SKY SHAKES ONCE A YEAR', 220, { size: 56 });
  E.present(t);
};
window.ready = Promise.resolve();
