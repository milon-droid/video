// Обложка серии 1: лицо Диаса в момент блэкаута (половина огней в очках уже погасла) + название.
window.SCENE = { duration: 1, fps: 30, width: W, height: H };
window.renderFrame = () => { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  ctx.save(); cam(1.05, 540, 820, () => hookFace(.98, 0)); ctx.restore(); LIGHT.dark = 0;
  ctx.save(); ctx.translate(820, 420); ctx.rotate(-.5); ctx.globalAlpha = .9; jetSilhouette(0, 0, .45, 0, 0, { burn: .6 }); ctx.restore();
  post(0); const g = ctx.createLinearGradient(0, 1150, 0, 1700); g.addColorStop(0, 'rgba(5,7,16,0)'); g.addColorStop(1, 'rgba(5,7,16,.85)'); ctx.fillStyle = g; ctx.fillRect(0, 1150, W, 770);
  ctx.save(); ctx.shadowColor = 'rgba(229,56,59,.8)'; ctx.shadowBlur = 40; txt('БЛЭКАУТ', CXC, 1250, 150, T.danger, { align: 'center', stroke: 16 }); ctx.restore();
  txt('ТЕНЬ НАД ГОРОДОМ', CXC, 1385, 60, T.text, { align: 'center', stroke: 12 }); PartSticker(1, 1); };
