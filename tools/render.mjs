#!/usr/bin/env node
// Покадровый рендер HTML-анимации в MP4 через Playwright + ffmpeg.
//
//   node tools/render.mjs scene.html -o out.mp4 [опции]
//   node tools/render.mjs scene.html --still 2.5 -o frame.png   # один кадр
//
// Опции:
//   -o, --out FILE      выходной файл (по умолчанию render/<имя>.mp4 рядом со сценой)
//   --duration S        длительность, сек (иначе window.SCENE.duration)
//   --fps N             кадров в секунду (иначе SCENE.fps или 30)
//   --width/--height    размер холста (иначе SCENE.width/height или 1080×1920)
//   --from S --to S     отрендерить только отрезок
//   --draft             черновик: половинное разрешение, быстрее
//   --scale K           масштаб вывода (0.6667 = 720×1280 из 1080×1920)
//   --safe              наложить безопасные зоны TikTok/Reels (для превью)
//   --audio FILE        подложить звук (обрезается по длине видео)
//   --crf N             качество x264 (по умолчанию 18; меньше = лучше)
//   --workers N         параллельных вкладок (по умолчанию min(4, ядер))
//   --still T           сохранить один кадр в момент T (PNG)
//   --alpha             прозрачный фон → .mov (ProRes 4444) для наложения поверх видео;
//                       в сцене фон body должен быть transparent
//
// Контракт сцены (см. .claude/skills/html-animation/SKILL.md):
//   window.SCENE = { duration, fps?, width?, height? }
//   window.renderFrame(t)  — необязательна; выставляет состояние сцены на время t (сек)
//   CSS-анимации, Web Animations и GSAP-таймлайн window.TL перематываются автоматически.

import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';

const { chromium } = createRequire(import.meta.url)('playwright');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Рендеры кладём в projects/<проект>/render, даже если сцена лежит в src/.
function outBase(p) { const d = path.dirname(p); return path.basename(d) === 'src' ? path.dirname(d) : d; }

function parseArgs(argv) {
  const o = { flags: {} };
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    switch (a) {
      case '-o': case '--out': o.out = next(); break;
      case '--duration': o.duration = +next(); break;
      case '--fps': o.fps = +next(); break;
      case '--width': o.width = +next(); break;
      case '--height': o.height = +next(); break;
      case '--from': o.from = +next(); break;
      case '--to': o.to = +next(); break;
      case '--audio': o.audio = next(); break;
      case '--crf': o.crf = +next(); break;
      case '--still': o.still = +next(); break;
      case '--draft': o.draft = true; break;
      case '--scale': o.scale = +next(); break;
      case '--safe': o.safe = true; break;
      case '--alpha': o.alpha = true; break;
      case '--workers': o.workers = +next(); break;
      case '-h': case '--help': o.help = true; break;
      default: rest.push(a);
    }
  }
  o.scene = rest[0];
  return o;
}

const FONT_CSS = ['Regular:400', 'SemiBold:600', 'Bold:700', 'ExtraBold:800', 'Black:900']
  .map((s) => {
    const [name, weight] = s.split(':');
    const url = pathToFileURL(path.join(ROOT, 'fonts', `Inter-${name}.otf`)).href;
    return `@font-face{font-family:'Inter';src:url('${url}');font-weight:${weight};}`;
  })
  .join('\n');

// Ориентировочные зоны интерфейса TikTok/Reels/Shorts для 1080×1920.
const SAFE_CSS = `
#__safe{position:fixed;inset:0;pointer-events:none;z-index:2147483647}
#__safe div{position:absolute;background:rgba(255,0,60,.28);outline:2px dashed rgba(255,0,60,.9)}
`;
function safeOverlayScript(w, h) {
  const sx = w / 1080, sy = h / 1920;
  const zones = [
    [0, 0, 1080, 220],          // верх: вкладки, статус-бар
    [0, 1500, 1080, 420],       // низ: подпись, музыка, кнопки
    [920, 220, 160, 1280],      // справа: лайки, комменты, репост
  ];
  return `(() => {
    const root = document.createElement('div'); root.id='__safe';
    for (const [x,y,zw,zh] of ${JSON.stringify(zones)}) {
      const d = document.createElement('div');
      Object.assign(d.style,{left:x*${sx}+'px',top:y*${sy}+'px',width:zw*${sx}+'px',height:zh*${sy}+'px'});
      root.appendChild(d);
    }
    document.body.appendChild(root);
  })()`;
}

async function main() {
  const o = parseArgs(process.argv.slice(2));
  if (o.help || !o.scene) {
    console.log('Использование: node tools/render.mjs scene.html [-o out.mp4] [--draft] [--safe] [--audio a.mp3] [--still T]');
    process.exit(o.help ? 0 : 1);
  }
  const scenePath = path.resolve(o.scene);
  if (!existsSync(scenePath)) throw new Error(`Нет файла сцены: ${scenePath}`);

  const browser = await chromium.launch();
  const extra = [];
  try {
    // Сначала узнаём параметры сцены.
    let page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
    await page.goto(pathToFileURL(scenePath).href);
    const meta = await page.evaluate(() => window.SCENE || {});
    await page.close();

    const width = o.width || meta.width || 1080;
    const height = o.height || meta.height || 1920;
    const fps = o.fps || meta.fps || 30;
    const duration = o.duration || meta.duration;
    if (!duration && o.still === undefined) throw new Error('Не задана длительность: --duration или window.SCENE.duration');
    const scale = o.scale || (o.draft ? 0.5 : 1);

    const openPage = async (_, k = 0) => {
      // Каждому потоку — свой процесс браузера: вкладки одного браузера рисуют в одном потоке.
      let b = browser;
      if (k > 0) { b = await chromium.launch(); extra.push(b); }
      const ctx = await b.newContext({ viewport: { width, height }, deviceScaleFactor: scale });
      const page = await ctx.newPage();
      page.on('pageerror', (e) => console.error('[сцена] ошибка JS:', e.message));
      page.on('console', (m) => { if (m.type() === 'error') console.error('[сцена]', m.text()); });
      await page.goto(pathToFileURL(scenePath).href, { waitUntil: 'load' });
      await page.addStyleTag({ content: FONT_CSS + (o.safe ? SAFE_CSS : '') });
      if (o.safe) await page.evaluate(safeOverlayScript(width, height));
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all([...document.images].map((im) => im.complete ? 0 : new Promise((r) => { im.onload = im.onerror = r; })));
        if (window.READY) await window.READY;
      });
      const shot = async (t) => {
        await page.evaluate(async (t) => {
          for (const a of document.getAnimations()) { a.pause(); a.currentTime = t * 1000; }
          // GSAP: сцена кладёт главный таймлайн в window.TL (paused) — перематываем его.
          if (window.TL && typeof window.TL.seek === 'function') window.TL.seek(t, false);
          if (typeof window.renderFrame === 'function') await window.renderFrame(t);
        }, t);
        return page.screenshot({ type: 'png', omitBackground: !!o.alpha });
      };
      return shot;
    };

    if (o.still !== undefined) {
      const out = path.resolve(o.out || path.join(outBase(scenePath), 'render', `still-${o.still}.png`));
      mkdirSync(path.dirname(out), { recursive: true });
      const shot = await openPage();
      writeFileSync(out, await shot(o.still));
      console.log(`Кадр ${o.still}s → ${out}`);
      return;
    }

    const t0 = o.from || 0;
    const t1 = Math.min(o.to ?? duration, duration);
    const frames = Math.round((t1 - t0) * fps);
    const base = path.basename(scenePath, path.extname(scenePath));
    const out = path.resolve(o.out || path.join(outBase(scenePath), 'render', `${base}${o.draft ? '-draft' : ''}${o.alpha ? '.mov' : '.mp4'}`));
    mkdirSync(path.dirname(out), { recursive: true });

    const args = ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-'];
    if (o.audio) args.push('-ss', String(t0), '-i', path.resolve(o.audio));
    if (o.alpha) args.push('-c:v', 'prores_ks', '-profile:v', '4444', '-pix_fmt', 'yuva444p10le', '-r', String(fps));
    else args.push('-c:v', 'libx264', '-preset', o.draft ? 'veryfast' : 'medium', '-crf', String(o.crf ?? (o.draft ? 26 : 18)),
      '-pix_fmt', 'yuv420p', '-r', String(fps));
    if (o.audio) args.push('-c:a', 'aac', '-b:a', '192k', '-shortest');
    if (!o.alpha) args.push('-movflags', '+faststart');
    args.push(out);

    const ff = spawn('ffmpeg', args, { stdio: ['pipe', 'inherit', 'inherit'] });
    const ffDone = new Promise((res, rej) => ff.on('close', (c) => c === 0 ? res() : rej(new Error(`ffmpeg завершился с кодом ${c}`))));
    const write = (buf) => new Promise((res) => { if (ff.stdin.write(buf)) res(); else ff.stdin.once('drain', res); });

    // Несколько вкладок рендерят кадры параллельно, в ffmpeg пишем строго по порядку.
    const workers = Math.max(1, Math.min(o.workers || Math.min(4, os.cpus().length), frames));
    const started = Date.now();
    const shots = await Promise.all(Array.from({ length: workers }, (_, k) => openPage(null, k)));
    const done = new Map();
    let next = 0, written = 0, wake = null;
    const notify = () => { if (wake) { const w = wake; wake = null; w(); } };
    const worker = async (shot) => {
      for (;;) {
        const i = next++;
        if (i >= frames) return;
        while (i - written > workers * 2) await new Promise((r) => setTimeout(r, 5)); // не копить кадры в памяти
        done.set(i, await shot(t0 + i / fps));
        notify();
      }
    };
    const writer = (async () => {
      while (written < frames) {
        if (!done.has(written)) { await new Promise((r) => { wake = r; }); continue; }
        const buf = done.get(written); done.delete(written);
        await write(buf);
        written++;
        if (written % fps === 0 || written === frames) {
          process.stderr.write(`\rкадр ${written}/${frames} (${Math.round((written / frames) * 100)}%)`);
        }
      }
    })();
    await Promise.all(shots.map(worker));
    await writer;
    ff.stdin.end();
    await ffDone;
    process.stderr.write('\n');
    console.log(`Готово: ${out} — ${frames} кадров, ${workers} потока, ${((Date.now() - started) / 1000).toFixed(1)} с`);
  } finally {
    await Promise.all(extra.map((b) => b.close()));
    await browser.close();
  }
}

main().catch((e) => { console.error(e.message || e); process.exit(1); });
