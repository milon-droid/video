// Кадры-превью: node scripts/still.mjs <id> <out-dir> [секунды…]  (для Still — без секунд)
import { bundle } from '@remotion/bundler'; import { renderStill, selectComposition } from '@remotion/renderer'; import path from 'node:path'; import fs from 'node:fs';
const [id, dir, ...times] = process.argv.slice(2); fs.mkdirSync(dir, { recursive: true });
const BX = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const comp = await selectComposition({ serveUrl, id, browserExecutable: BX });
const list = times.length ? times : ['0'];
for (const s of list) { const frame = Math.round(+s * 30); await renderStill({ composition: comp, serveUrl, frame, output: path.join(dir, `${id}_${String(s).replace('.', '_')}.jpg`), imageFormat: 'jpeg', jpegQuality: 85, browserExecutable: BX, scale: +(process.env.SCALE || .5) }); }
console.log('ok', list.length);
