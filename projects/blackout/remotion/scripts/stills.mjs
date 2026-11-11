// Кадры-превью без полного рендера: node scripts/stills.mjs out/sb 0.5 4.5 12 …  (секунды)
import { bundle } from '@remotion/bundler'; import { renderStill, selectComposition } from '@remotion/renderer'; import path from 'node:path'; import fs from 'node:fs';
const [dir, ...times] = process.argv.slice(2); fs.mkdirSync(dir, { recursive: true });
const BX = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const comp = await selectComposition({ serveUrl, id: process.env.COMP || 'Ep1-720', browserExecutable: BX });
for (const s of times) { const frame = Math.round(+s * 30); await renderStill({ composition: comp, serveUrl, frame, output: path.join(dir, `f_${String(frame).padStart(4, '0')}.png`), browserExecutable: BX, scale: .5 }); }
console.log('ok', times.length);
