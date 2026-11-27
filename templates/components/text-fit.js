// Текст ВСЕГДА внутри своей плашки/стикера (правило 2026-11-26: «текст вылезает за стикер» — самая частая ошибка).
// Подключать в любой canvas-сцене и рисовать ВСЕ надписи в плашках только через fitBox / drawBoxText.
//
//   const f = fitBox(ctx, 'ТЕКСТ', { w: 600, h: 160, font: (s) => `900 ${s}px Mont`, size: 72, min: 36, pad: .08, lines: 3 });
//   // f = { size, lines: ['...'], lineH, ok }  — ok:false, если не влезло даже минимальным кеглем
//   drawBoxText(ctx, 'ТЕКСТ', x, y, w, h, { font, size, color, align: 'center' }); // рисует внутри (x,y,w,h) с полями
//
// Не влезло → строка уходит в globalThis.TEXT_ISSUES; tools/render.mjs печатает их в конце рендера
// («ТЕКСТ ЗА ПЛАШКОЙ: …») — рендер не сдавать, пока список не пуст. Плашку под текст лучше строить от текста:
// boxFor(ctx, text, {font,size,maxW,pad}) → {w,h}.
(function (G) {
  const issues = G.TEXT_ISSUES || (G.TEXT_ISSUES = []);
  const wrap = (ctx, text, maxW) => {
    const out = []; for (const para of String(text).split('\n')) {
      let line = ''; for (const word of para.split(/\s+/).filter(Boolean)) {
        const t = line ? line + ' ' + word : word;
        if (ctx.measureText(t).width <= maxW || !line) line = t; else { out.push(line); line = word; }
      } out.push(line);
    } return out;
  };
  function fitBox(ctx, text, o) {
    const pad = o.pad ?? .08, maxW = o.w * (1 - 2 * pad), maxH = o.h * (1 - 2 * pad), lh = o.lineH ?? 1.15, maxL = o.lines ?? 3;
    let size = o.size, min = o.min ?? Math.round(o.size * .5), lines, ok = false;
    ctx.save();
    for (; size >= min; size -= 2) {
      ctx.font = o.font(size); lines = wrap(ctx, text, maxW);
      const widest = Math.max(...lines.map((l) => ctx.measureText(l).width));
      if (lines.length <= maxL && widest <= maxW && lines.length * size * lh <= maxH) { ok = true; break; }
    }
    if (!ok) { size = min; ctx.font = o.font(size); lines = wrap(ctx, text, maxW); }
    ctx.restore();
    if (!ok && !issues.some((i) => i.text === text)) issues.push({ text: String(text).slice(0, 60), box: `${Math.round(o.w)}×${Math.round(o.h)}`, t: G.__T });
    return { size, lines, lineH: size * lh, ok };
  }
  function drawBoxText(ctx, text, x, y, w, h, o) {
    const f = fitBox(ctx, text, { ...o, w, h }), pad = o.pad ?? .08;
    ctx.save(); ctx.font = o.font(f.size); ctx.fillStyle = o.color || '#fff'; ctx.textBaseline = 'middle';
    ctx.textAlign = o.align || 'center';
    const ax = ctx.textAlign === 'center' ? x + w / 2 : ctx.textAlign === 'right' ? x + w * (1 - pad) : x + w * pad;
    const y0 = y + h / 2 - (f.lines.length - 1) * f.lineH / 2;
    f.lines.forEach((l, i) => { if (o.stroke) { ctx.lineWidth = o.stroke; ctx.strokeStyle = o.strokeColor || '#000'; ctx.strokeText(l, ax, y0 + i * f.lineH); } ctx.fillText(l, ax, y0 + i * f.lineH); });
    ctx.restore(); return f;
  }
  function boxFor(ctx, text, o) {
    const pad = o.pad ?? .08; ctx.save(); ctx.font = o.font(o.size);
    const lines = wrap(ctx, text, o.maxW * (1 - 2 * pad)), wd = Math.max(...lines.map((l) => ctx.measureText(l).width));
    ctx.restore(); const lh = o.size * (o.lineH ?? 1.15);
    return { w: wd / (1 - 2 * pad), h: lines.length * lh / (1 - 2 * pad), lines };
  }
  Object.assign(G, { fitBox, drawBoxText, boxFor });
  if (typeof module !== 'undefined') module.exports = { fitBox, drawBoxText, boxFor };
})(typeof globalThis !== 'undefined' ? globalThis : window);
