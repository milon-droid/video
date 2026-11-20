// Лист превью: node scripts/sheet.mjs out.jpg sec1 sec2 ... (SCALE=.3) → одна картинка сеткой
import { bundle } from '@remotion/bundler'; import { renderStill, selectComposition } from '@remotion/renderer'; import path from 'node:path'; import fs from 'node:fs'; import { execSync } from 'node:child_process';
const [out, ...times] = process.argv.slice(2); const dir = '/tmp/claude-0/sheet'; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
const BX = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const comp = await selectComposition({ serveUrl, id: process.env.COMP || 'Ep1', browserExecutable: BX });
const files = []; for (const [i, s] of times.entries()) { const f = path.join(dir, `${String(i).padStart(3, '0')}.jpg`); await renderStill({ composition: comp, serveUrl, frame: Math.min(comp.durationInFrames - 1, Math.round(+s * 30)), output: f, imageFormat: 'jpeg', jpegQuality: 80, browserExecutable: BX, scale: +(process.env.SCALE || .3) }); files.push(f); }
const cols = +(process.env.COLS || 4);
execSync(`python3 -c "
from PIL import Image, ImageDraw
import sys
fs=sys.argv[2:]; ims=[Image.open(f) for f in fs]; w,h=ims[0].size; c=${cols}; r=(len(ims)+c-1)//c
S=Image.new('RGB',(w*c,h*r),'black'); d=ImageDraw.Draw(S)
for i,(im,t) in enumerate(zip(ims,'${times.join(' ')}'.split())): S.paste(im,((i%c)*w,(i//c)*h)); d.text(((i%c)*w+6,(i//c)*h+6),t+'s',fill='yellow')
S.save(sys.argv[1])" ${out} ${files.join(' ')}`);
console.log('sheet', out);
