// Один кадр любой композиции: node scripts/still1.mjs <id> <out.png> [кадр] [scale]
import { bundle } from '@remotion/bundler'; import { renderStill, selectComposition } from '@remotion/renderer'; import path from 'node:path';
const [id, out, fr = '0', sc = '.5'] = process.argv.slice(2);
const BX = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const comp = await selectComposition({ serveUrl, id, browserExecutable: BX });
await renderStill({ composition: comp, serveUrl, frame: +fr, output: out, browserExecutable: BX, scale: +sc }); console.log('ok');
