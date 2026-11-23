// node tools/still4k.cjs out.png t — один кадр 4K (проверка)
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => { const [out, t] = process.argv.slice(2); const b = await chromium.launch(); const p = await b.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.resolve(__dirname, '../src/scene_4k.html'));
  const t0 = Date.now(); const d = await p.evaluate(t => { renderFrame(+t); return document.getElementById('c').toDataURL('image/png'); }, t);
  console.log('ms', Date.now() - t0, errs.slice(0, 3)); fs.writeFileSync(out, Buffer.from(d.split(',')[1], 'base64')); await b.close(); })();
