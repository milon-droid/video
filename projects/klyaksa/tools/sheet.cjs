// node tools/sheet.cjs out.png t1 t2 ...  — лист кадров (масштаб SCALE, по умолчанию .3)
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const [out, ...ts] = process.argv.slice(2); const S = +(process.env.SCALE || .3);
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 720, height: 1280 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto('file://' + path.resolve(__dirname, '../src/scene.html'));
  const imgs = [];
  for (const t of ts) { await p.evaluate(t => window.renderFrame(+t), t); imgs.push(await p.evaluate(() => document.getElementById('c').toDataURL('image/png'))); }
  if (errs.length) console.log('ERR', errs.slice(0, 5));
  const cols = Math.min(ts.length, +(process.env.COLS || 6)), w = Math.round(720 * S), h = Math.round(1280 * S);
  await p.setViewportSize({ width: cols * w, height: Math.ceil(ts.length / cols) * (h + 16) });
  await p.setContent(`<body style="margin:0;background:#222;display:flex;flex-wrap:wrap;width:${cols * w}px;font:12px sans-serif;color:#fff">` +
    imgs.map((d, i) => `<div style="width:${w}px"><img src="${d}" width="${w}" height="${h}" style="image-rendering:pixelated;display:block"><div>${ts[i]}s</div></div>`).join('') + '</body>');
  await p.screenshot({ path: out, fullPage: true }); await b.close(); console.log('ok', out);
})();
