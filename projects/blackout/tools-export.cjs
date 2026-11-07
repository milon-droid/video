// Выгрузка из сцены серии: звуки (sfx-epN.json), раскадровка (storyboard/epN.json), субтитры (out/epN.srt).
//   node projects/schetchik/tools-export.cjs projects/schetchik/src/ep1.html projects/schetchik 1
// выгрузка из сцены: звуки, раскадровка JSON и субтитры SRT
const { createRequire } = require('module'); const r = createRequire(process.cwd() + '/'); const { chromium } = r('playwright'); const path = require('path'); const fs = require('fs');
const [scene, outDir, n] = process.argv.slice(2);
(async () => { const b = await chromium.launch(); const p = await b.newPage(); await p.goto('file://' + path.resolve(scene)); await p.evaluate(() => window.READY);
  const { sfx, sb, caps } = await p.evaluate(() => ({ sfx: window.SFX_CUES, sb: window.STORYBOARD, caps: window.CAPTION_PHRASES }));
  fs.mkdirSync(path.join(outDir, 'storyboard'), { recursive: true }); fs.mkdirSync(path.join(outDir, 'out'), { recursive: true });
  fs.writeFileSync(path.join(outDir, `sfx-ep${n}.json`), JSON.stringify(sfx)); fs.writeFileSync(path.join(outDir, 'storyboard', `ep${n}.json`), JSON.stringify(sb, null, 2));
  const ts = s => { const ms = Math.round(s * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, ss = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
  fs.writeFileSync(path.join(outDir, 'out', `ep${n}.srt`), caps.map((c, i) => `${i + 1}\n${ts(c.a)} --> ${ts(c.b)}\n${c.words.map(w => w.text).join(' ')}\n`).join('\n'));
  console.log('cues', sfx.length, 'scenes', sb.scenes.length, 'phrases', caps.length); await b.close(); })();
