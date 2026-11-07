// Обложка с.1: экшен + интрига. Истребитель с форсажем над Алматы, город гаснет по диагонали (половина ещё горит),
// внизу Диас в ужасе смотрит вверх, в очках — красное «Не доставлено». «БЛЭКАУТ» со сбоем, красное 20:03, крючок «ДО КОНЦА СВЕТА 5 МИНУТ».
window.SCENE = { duration: 1, fps: 30, width: W, height: H };
window.renderFrame = () => { const t = 25.9; ctx.setTransform(1, 0, 0, 1, 0, 0); LIGHT.dark = 0;
  const lineX = y => 260 + (1300 - y) * .55; // граница волны: левее — уже темно
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0B1020'); g.addColorStop(.55, '#26305a'); g.addColorStop(1, '#3a2a3a'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 7; i++) AK.puff(100 + i * 170, 300 + (i % 3) * 90, 280, '70,60,90', .55); glow(860, 380, 500, 'rgba(185,198,255,.35)'); // гроза в тучах
  ctx.save(); ctx.strokeStyle = 'rgba(230,236,255,.9)'; ctx.lineWidth = 6; ctx.shadowColor = '#B9C6FF'; ctx.shadowBlur = 30; ctx.beginPath(); ctx.moveTo(930, 180); ctx.lineTo(880, 330); ctx.lineTo(920, 360); ctx.lineTo(860, 520); ctx.stroke(); ctx.restore();
  ridge(1000, t, { amp: 1.3, seed: 33 });
  const lit = x => x > lineX(1200) ? 1 : 0;
  zhk(-60, 1300, 260, 14, t, (f, c) => lit(-60 + c * 30), { col: '#3E4560', seed: 2, fh: 36 }); nurlyTau(330, 1300, .62, t, () => 0); hotelTower(640, 1300, .7, t, f => f < 0 ? 1 : 1, { red: 1 }); zhk(790, 1320, 320, 16, t, () => 1, { col: '#4A4E6A', seed: 4, fh: 36 });
  // свечение волны блэкаута по диагонали
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const lg = ctx.createLinearGradient(lineX(1300) - 60, 0, lineX(1300) + 60, 0); lg.addColorStop(0, 'rgba(229,56,59,0)'); lg.addColorStop(.5, 'rgba(229,56,59,.35)'); lg.addColorStop(1, 'rgba(229,56,59,0)'); ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(lineX(700) - 60, 700); ctx.lineTo(lineX(700) + 60, 700); ctx.lineTo(lineX(1350) + 60, 1350); ctx.lineTo(lineX(1350) - 60, 1350); ctx.fill(); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.moveTo(-10, 600); ctx.lineTo(lineX(600), 600); ctx.lineTo(lineX(1400), 1400); ctx.lineTo(-10, 1400); ctx.closePath(); ctx.clip(); ctx.fillStyle = 'rgba(5,7,16,.55)'; ctx.fillRect(0, 600, W, 800); ctx.restore(); // левая часть уже во тьме
  for (let i = 0; i < 6; i++) { ctx.strokeStyle = 'rgba(230,236,255,.18)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(380, 760 + i * 30); ctx.lineTo(-100, 1000 + i * 40); ctx.stroke(); }
  fighter(600, 640, 1.25, -.42, t, { burn: 1.2 });
  // Диас снизу: смотрит вверх, свет телефона, в очках красное «Не доставлено»
  const lens = (cx, cy, gw, gh) => { ctx.fillStyle = 'rgba(127,179,255,.55)'; ctx.fillRect(cx - gw * .32, cy - gh * .2, gw * .55, gh * .7); ctx.fillStyle = 'rgba(229,56,59,.95)'; ctx.fillRect(cx - gw * .25, cy + gh * .18, gw * .4, gh * .12); };
  bust(540, 1900, 2.6, t, 'dias', { noArms: 1, look: [.15, -1], brow: 1, wide: 1.4, mouth: .55, under: 1, underRgb: '127,179,255', lens, blink: 1 });
  post(0); const vg = ctx.createLinearGradient(0, 760, 0, 1150); vg.addColorStop(0, 'rgba(5,7,16,0)'); vg.addColorStop(1, 'rgba(5,7,16,.0)'); ctx.fillStyle = vg; ctx.fillRect(0, 760, W, 400);
  // название со сбоем и крючок
  ctx.save(); ctx.translate(CXC, 1010); ctx.rotate(-.05); ctx.font = '900 168px Mont'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
  ctx.lineWidth = 26; ctx.strokeStyle = '#05060c'; ctx.strokeText('БЛЭКАУТ', 0, 0); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = 'rgba(0,200,255,.7)'; ctx.fillText('БЛЭКАУТ', -9, 4); ctx.globalCompositeOperation = 'source-over';
  ctx.shadowColor = 'rgba(229,56,59,.9)'; ctx.shadowBlur = 40; ctx.fillStyle = T.danger; ctx.fillText('БЛЭКАУТ', 0, 0); ctx.shadowBlur = 0; ctx.fillStyle = '#05060c'; for (const [y, h, dx] of [[-34, 16, 22], [18, 12, -18]]) { ctx.save(); ctx.beginPath(); ctx.rect(-500, y, 1000, h); ctx.clip(); ctx.clearRect(-500, y, 1000, h); ctx.fillStyle = '#26305a'; ctx.fillRect(-500, y, 1000, h); ctx.lineWidth = 26; ctx.strokeStyle = '#05060c'; ctx.strokeText('БЛЭКАУТ', dx, 0); ctx.fillStyle = T.danger; ctx.fillText('БЛЭКАУТ', dx, 0); ctx.restore(); } ctx.restore();
  ctx.save(); ctx.font = '900 54px Mont'; const s1 = 'ДО КОНЦА СВЕТА', s2 = '5 МИНУТ', w1 = ctx.measureText(s1 + ' ').width, w2 = ctx.measureText(s2).width, x0 = CXC - (w1 + w2) / 2; ctx.fillStyle = 'rgba(5,7,16,.82)'; rr(x0 - 26, 1110, w1 + w2 + 52, 84, 18); ctx.fill(); ctx.restore();
  txt(s1, x0, 1153, 54, T.text); txt(s2, x0 + w1, 1153, 54, '#FFD23F');
  ctx.save(); ctx.translate(800, 470); ctx.rotate(.06); ctx.fillStyle = 'rgba(5,7,16,.85)'; rr(-130, -60, 260, 120, 18); ctx.fill(); ctx.strokeStyle = T.danger; ctx.lineWidth = 5; ctx.stroke(); txt('20:03', 0, 4, 76, T.danger, { font: 'JBM', weight: 800, align: 'center' }); ctx.restore();
  PartSticker(1, 1); };
