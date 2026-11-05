// Автоаудит canvas-сцен (до рендера, за секунды): то, что раньше ловилось только глазами по листу раскадровки.
//   node tools/scene-audit.cjs projects/schetchik/src/ep1.html [ep2.html ...] [--fps 5] [--json out.json]
// Проверяет (правила knowledge/selfcheck.md):
//   • телефон в кадре: доля времени (≤ 25%) и самый длинный отрезок подряд — если в сцене есть функция HandPhone;
//   • тёмные отрезки: средняя яркость кадра < 0,08 дольше 1,5 с (на телефоне днём не видно ничего);
//   • планы длиннее 5 с и финальная карточка длиннее 2,5 с — по window.STORYBOARD.scenes;
//   • хук: первый субтитр виден с 0 с и дочитан к 1,5 с — по window.CAPTION_PHRASES;
//   • паузы без субтитров длиннее 4 с (кроме финальной тишины и карточки);
//   • повторы: план, почти совпадающий с другим планом (в этой или другой серии) — «шаблонность».
// Сцена должна отдавать window.renderFrame(t), window.SCENE.duration и window.READY (как в tools/render.mjs).
const { createRequire } = require('module'); const rq = createRequire(process.cwd() + '/'); const { chromium } = rq('playwright'); const path = require('path'); const fs = require('fs');
const args = process.argv.slice(2), files = args.filter(a => a.endsWith('.html')), opt = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const FPS = +(opt('--fps') || 5);
(async () => {
  const b = await chromium.launch(), all = [], thumbs = [];
  for (const f of files) {
    const p = await b.newPage({ viewport: { width: 1080, height: 1920 } }); await p.goto('file://' + path.resolve(f)); await p.evaluate(() => window.READY);
    const r = await p.evaluate(async FPS => {
      const D = window.SCENE.duration, cv = document.querySelector('canvas'), sm = document.createElement('canvas'); sm.width = 27; sm.height = 48; const sx = sm.getContext('2d', { willReadFrequently: true });
      let phone = false; if (typeof window.HandPhone === 'function') { const o = window.HandPhone; window.HandPhone = function () { phone = true; return o.apply(this, arguments); }; }
      const caps = window.CAPTION_PHRASES || [], sb = window.STORYBOARD, out = { D, samples: [] };
      for (let i = 0; i * (1 / FPS) < D; i++) { const t = i / FPS; phone = false; window.renderFrame(t); await new Promise(r => setTimeout(r, 0));
        sx.drawImage(cv, 0, 0, 27, 48); const px = sx.getImageData(0, 0, 27, 48).data; let s = 0; const g = []; for (let k = 0; k < px.length; k += 4) { const l = (.2126 * px[k] + .7152 * px[k + 1] + .0722 * px[k + 2]) / 255; s += l; g.push(+l.toFixed(3)); }
        out.samples.push({ t, phone, luma: s / (px.length / 4), cap: caps.some(c => t >= c.a && t < c.b), g }); }
      out.scenes = sb && sb.scenes ? sb.scenes.map(s => ({ id: s.id, a: s.start, b: s.end, overlays: s.overlays || [] })) : [];
      out.hasCaps = caps.length > 0; out.hook = caps.length ? { a: caps[0].a, last: Math.max(...caps[0].words.map(w => w.t)) } : null; return out; }, FPS);
    await p.close(); r.file = f; all.push(r);
  }
  await b.close();
  const dt = 1 / FPS, runs = (arr, pred) => { const res = []; let st = null; arr.forEach((s, i) => { if (pred(s)) { if (st === null) st = s.t; } else if (st !== null) { res.push([st, s.t]); st = null; } }); if (st !== null) res.push([st, arr[arr.length - 1].t + dt]); return res; };
  const fmt = x => x.toFixed(1), report = [];
  for (const r of all) {
    const W = [], name = path.basename(path.dirname(path.dirname(path.resolve(r.file)))) + '/' + path.basename(r.file, '.html'), S = r.samples, end = r.scenes.length ? r.scenes[r.scenes.length - 1] : null, endA = end && /EndCard/.test(end.overlays.join()) ? end.a : r.D;
    const ph = S.filter(s => s.phone).length / S.length, phRuns = runs(S, s => s.phone), phMax = phRuns.reduce((m, [a, b2]) => Math.max(m, b2 - a), 0);
    if (S.some(s => s.phone)) { if (ph > .25) W.push(`телефон ${Math.round(ph * 100)}% времени (норма ≤ 25%)`); if (phMax > 5) W.push(`телефон подряд ${fmt(phMax)} с (${phRuns.filter(([a, b2]) => b2 - a > 5).map(([a, b2]) => fmt(a) + '–' + fmt(b2)).join(', ')})`); }
    const dark = runs(S, s => s.luma < .08 && s.t < endA).filter(([a, b2]) => b2 - a > 1.5); if (dark.length) W.push(`тёмные отрезки (яркость < 0,08): ${dark.map(([a, b2]) => fmt(a) + '–' + fmt(b2)).join(', ')}`);
    const long = r.scenes.filter(s => s.b - s.a > 5.01 && !/EndCard/.test(s.overlays.join())); if (long.length) W.push(`планы длиннее 5 с: ${long.map(s => `${s.id} ${fmt(s.b - s.a)} с`).join(', ')}`);
    if (end && /EndCard/.test(end.overlays.join()) && end.b - end.a > 2.55) W.push(`финальная карточка ${fmt(end.b - end.a)} с (норма ≤ 2,5)`);
    if (r.hook) { if (r.hook.a > .05) W.push(`первый субтитр появляется на ${fmt(r.hook.a)} с — в первом кадре его нет`); if (r.hook.last > 1.55) W.push(`хук дочитан только к ${fmt(r.hook.last)} с (норма 1,5)`); }
    const gaps = r.hasCaps ? runs(S, s => !s.cap && s.t < endA - 3).filter(([a, b2]) => b2 - a > 4) : []; // без window.CAPTION_PHRASES паузы не проверяем if (gaps.length) W.push(`долго без субтитров/голоса: ${gaps.map(([a, b2]) => fmt(a) + '–' + fmt(b2)).join(', ')}`);
    const meanL = S.reduce((s, x) => s + x.luma, 0) / S.length;
    for (const sc of r.scenes) { if (/EndCard/.test(sc.overlays.join())) continue; const mid = S.reduce((best, s) => Math.abs(s.t - (sc.a + sc.b) / 2) < Math.abs(best.t - (sc.a + sc.b) / 2) ? s : best, S[0]); thumbs.push({ ep: name, id: sc.id, a: sc.a, g: mid.g }); }
    report.push({ name, D: r.D, phone: Math.round(ph * 100), phoneMax: +phMax.toFixed(1), meanLuma: +meanL.toFixed(3), warnings: W });
  }
  // повторы планов: одинаковая картинка в середине разных планов (не соседних)
  const reps = []; for (let i = 0; i < thumbs.length; i++) for (let j = i + 1; j < thumbs.length; j++) { const A = thumbs[i], B = thumbs[j]; if (A.ep === B.ep && Math.abs(i - j) < 2) continue; let d = 0; for (let k = 0; k < A.g.length; k++) d += Math.abs(A.g[k] - B.g[k]); d /= A.g.length; if (d < .025) reps.push(`${A.ep}:${A.id}(${fmt(A.a)}) ≈ ${B.ep}:${B.id}(${fmt(B.a)})`); }
  for (const r of report) { console.log(`\n${r.name}: ${fmt(r.D)} с · телефон ${r.phone}% (подряд до ${r.phoneMax} с) · средняя яркость ${r.meanLuma}`); if (!r.warnings.length) console.log('  ок'); r.warnings.forEach(w => console.log('  [!] ' + w)); }
  if (reps.length) { console.log(`\nПочти одинаковые планы (${reps.length}) — зритель видит повтор, нужен другой ракурс/крупность:`); reps.slice(0, 30).forEach(x => console.log('  ' + x)); }
  if (opt('--json')) fs.writeFileSync(opt('--json'), JSON.stringify({ report, repeats: reps }, null, 2));
})();
