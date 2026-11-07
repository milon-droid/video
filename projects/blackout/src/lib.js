// «Блэкаут» — общие компоненты серий (ядро — из «Тыныса»: камера, субтитры по словам, постобработка; табло, стикер, карточка — свои).
// Имена — как в разделе 5 ТЗ: KineticCaption, Hud, PartSticker, EndCard, Glitch, ScreenShake. Графика мест и персонажей — art.js.
'use strict';
const W = 1080, H = 1920, CXC = 510;
const T = { night: '#0B1020', night2: '#1A2340', window: '#F2B33D', danger: '#E5383B', storm: '#B9C6FF', glow: '#7FB3FF', text: '#F4F1EA', ink: '#0B1020', ol: '#0B1020', gold: '#F2B33D', dimTxt: '#9DA3B4' };
let ctx;
const initLib = c => { ctx = c.getContext('2d'); };
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, k) => a + (b - a) * k, win = (t, a, b) => clamp((t - a) / (b - a));
const E = { out: k => 1 - Math.pow(1 - k, 3), io: k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2, back: k => { const c1 = 1.7, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); } };
const seeded = s => () => (s = (s * 16807) % 2147483647) / 2147483647;
function rr(x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function circle(x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); }
function fillOL(col, lw = 5) { ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = T.ol; ctx.lineJoin = 'round'; ctx.stroke(); }
function txt(s, x, y, size, col = T.text, { font = 'Mont', weight = 900, align = 'left', alpha = 1, stroke = 0 } = {}) {
  ctx.save(); ctx.globalAlpha *= alpha; ctx.font = `${weight} ${size}px ${font}`; ctx.textBaseline = 'middle'; ctx.textAlign = align;
  if (stroke) { ctx.lineWidth = stroke; ctx.strokeStyle = 'rgba(5,7,16,.9)'; ctx.lineJoin = 'round'; ctx.strokeText(s, x, y); }
  ctx.fillStyle = col; ctx.fillText(s, x, y); ctx.restore(); }
function glow(x, y, r, col, a = 1) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore(); }
const cam = (z, fx, fy, draw, dx = 0, dy = 0) => { ctx.save(); ctx.translate(fx + dx, fy + dy); ctx.scale(z, z); ctx.translate(-fx, -fy); draw(); ctx.restore(); };
// наезд 100→108% (правило кадра из ТЗ)
const push = (t, a, b, draw, fx = 540, fy = 900, z0 = 1, z1 = 1.08) => cam(lerp(z0, z1, E.io(win(t, a, b))), fx, fy, draw);
const pan = (t, a, b, draw, px = 60) => { ctx.save(); ctx.translate(-px * E.io(win(t, a, b)), 0); draw(); ctx.restore(); };
const GRAIN = (() => { const arr = []; for (let k = 0; k < 6; k++) { const c = document.createElement('canvas'); c.width = 270; c.height = 480; const g = c.getContext('2d'), im = g.createImageData(270, 480), r = seeded(101 + k);
  for (let i = 0; i < im.data.length; i += 4) { const v = r() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } g.putImageData(im, 0, 0); arr.push(c); } return arr; })();
function post(t) { ctx.save(); ctx.globalAlpha = .06; ctx.globalCompositeOperation = 'overlay'; ctx.imageSmoothingEnabled = false; ctx.drawImage(GRAIN[Math.floor(t * 30) % GRAIN.length], 0, 0, W, H); ctx.restore();
  const g = ctx.createRadialGradient(540, 960, 500, 540, 960, 1250); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.35)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
const GLUE = new Set(['В', 'ВО', 'НА', 'К', 'КО', 'С', 'СО', 'У', 'О', 'ОБ', 'ПО', 'ИЗ', 'ЗА', 'ДО', 'ОТ', 'НЕ', 'НИ', 'И', 'А', 'НО', 'ДЛЯ', 'ПРО', 'ПРИ', 'БЕЗ', '—']);
const glued = w => GLUE.has(w.text.replace(/[«»"]/g, '')) || /^\d/.test(w.text); // не оставлять в конце фразы/строки
function buildCaptions(list, { lead = .05, tail = .35 } = {}) {
  const out = [];
  for (const [a, b, raw, opt = {}] of list) {
    const words = []; let acc = false;
    for (const tok of raw.split(/\s+/).filter(Boolean)) { let w = tok; const st = w.startsWith('**'); if (st) { acc = true; w = w.slice(2); } const en = w.includes('**'); w = w.replace(/\*\*/g, '');
      words.push({ text: w.toUpperCase(), accent: acc }); if (en) acc = false; }
    // разбить на фразы: по знакам препинания, не длиннее 5 слов, короткие (<3) склеить со следующей
    const segs = []; let cur = []; words.forEach(w => { cur.push(w); if (/[.!?]$/.test(w.text)) { segs.push(cur); cur = []; } }); if (cur.length) segs.push(cur);
    const split = []; for (const sg of segs) { if (sg.length <= 5) { split.push(sg); continue; } const parts = Math.ceil(sg.length / 5), per = Math.ceil(sg.length / parts); for (let i = 0; i < sg.length; i += per) split.push(sg.slice(i, i + per)); }
    const nw = a => a.filter(w => w.text !== '—').length;
    if (opt.whole) { split.length = 0; split.push([...words]); }
    const ph = []; for (const sg of split) { const last = ph[ph.length - 1]; if (last && (nw(last) < 3 || nw(sg) < 3) && nw(last) + nw(sg) <= 5) last.push(...sg); else if (last && nw(sg) < 2) { const all = [...last, ...sg], h = Math.ceil(all.length / 2); ph[ph.length - 1] = all.slice(0, h); ph.push(all.slice(h)); } else ph.push([...sg]); }
    for (let i = 0; i < ph.length - 1; i++) while (ph[i].length > 1 && glued(ph[i][ph[i].length - 1])) ph[i + 1].unshift(ph[i].pop()); // «на пять / часов» → «на пять часов»
    const n = words.length, t0 = a + lead, t1 = b - tail; let k = 0, j = 0, prev = t0;
    // opt.times — времена слов по голосу (tools/words.py, без тире); иначе — равномерно внутри сцены
    for (const p of ph) { for (const w of p) { if (opt.times) { w.t = w.text === '—' ? prev : +(opt.times[j++] ?? prev).toFixed(3); prev = w.t; } else w.t = +(t0 + (t1 - t0) * k / n).toFixed(3); k++; }
      const { times, ...rest } = opt; if (rest.speaker === 'anchor') rest.color = '#CFE3FF'; out.push({ a: p[0].t, b, words: p, ...rest }); }
  }
  out.forEach((p, i) => { const nx = out[i + 1]; if (nx && nx.a < p.b) p.b = nx.a; p.words = p.words.filter(w => w.text !== '—'); }); /* тире в субтитрах не показываем (урок ҚУАТ) */
  return out;
}
let ENDCARD_AT = -1; // EndCard скрывает обычные субтитры (остаются только центральные фразы с y)
function KineticCaption(t, phrases, y = 1275) {
  const p = phrases.find(q => t >= q.a && t < q.b); if (!p) return; if (ENDCARD_AT === t && !p.y) return; const size = p.size || 72, maxW = p.maxW || 780; if (p.y) y = p.y;
  ctx.save(); ctx.font = `900 ${size}px Mont`; ctx.textBaseline = 'middle'; const sp = ctx.measureText(' ').width * 1.7;
  const units = []; p.words.forEach((w, i) => { const u = units[units.length - 1]; if (u && glued(u[u.length - 1])) u.push(w); else units.push([w]); }); // предлог держится со словом
  const lines = [[]]; let lw = 0; for (const u of units) { const uw = u.reduce((s2, w) => s2 + ctx.measureText(w.text).width, 0) + sp * (u.length - 1); if (lw + uw > maxW && lines[lines.length - 1].length) { lines.push([]); lw = 0; } for (const w of u) lines[lines.length - 1].push([w, ctx.measureText(w.text).width]); lw += uw + sp; }
  const lh = size * 1.12, blockH = lines.length * lh, widest = Math.max(...lines.map(ln => ln.reduce((s2, [, ww]) => s2 + ww, 0) + sp * (ln.length - 1)));
  // подложка, если фон под блоком светлый (средняя яркость > 0,40)
  const bx = Math.max(0, CXC - widest / 2 - 40), by = y - blockH / 2 - 26, bw2 = Math.min(W - bx, widest + 80), bh2 = blockH + 52;
  try { if (0) { const im = 0; }
    } catch (e) { } const fa = E.out(win(t, p.a - .02, p.a + .13)); ctx.globalAlpha = fa; ctx.translate(0, (1 - fa) * 14); ctx.fillStyle = 'rgba(11,16,32,.8)'; rr(bx, by, bw2, bh2, 28); ctx.fill(); /* одна подложка на весь ролик (правки с.1) */
  lines.forEach((ln, i) => { const tw = ln.reduce((s2, [, ww]) => s2 + ww, 0) + sp * (ln.length - 1); let x = CXC - tw / 2; const yy = y + (i - (lines.length - 1) / 2) * lh;
    for (const [w, ww] of ln) { const on = t >= w.t, k = E.out(win(t, w.t, w.t + .12)), sc = w.accent && on ? lerp(1, 1.06, k) : 1;
      ctx.save(); ctx.translate(x + ww / 2, yy); ctx.scale(sc, sc); if (p.italic) ctx.transform(1, 0, -.2, 1, 0, 0);
      ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 4; ctx.lineWidth = 14; ctx.strokeStyle = T.ink; ctx.lineJoin = 'round'; ctx.strokeText(w.text, -ww / 2, 0); ctx.shadowColor = 'transparent';
      ctx.fillStyle = !on ? T.dimTxt : w.accent ? (p.accent || T.danger) : (p.color || T.text); ctx.fillText(w.text, -ww / 2, 0); ctx.restore(); x += ww + sp; } }); // ещё не сказанные — сплошным серым, не прозрачностью
  ctx.restore(); }

// ───── телефон в руке и экран тарифа «Последний» ─────
const PHN = { x: 270, y: 330, w: 520, h: 860 };
function Glitch(t, k = 1) { if (k <= 0) return; const r = seeded(Math.floor(t * 30) + 7); const img = ctx.getImageData(0, 0, W, H); ctx.save();
  for (let i = 0; i < 9; i++) { const y = r() * H, h = 20 + r() * 90, dx = (r() - .5) * 120 * k; ctx.putImageData(img, dx, 0, 0, y, W, h); }
  ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(229,56,59,${.12 * k})`; ctx.fillRect(0, 0, W, H); ctx.restore(); }

// ───── цвета: смешать, затемнить для ночи ─────
const hex2 = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, k) => { const A = hex2(a), B = hex2(b); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], clamp(k))).toString(16).padStart(2, '0')).join(''); };
let LIGHT = { dark: 0 }; // текущий свет сцены: dark 0 — тёплый вечер, 1 — блэкаут (цвета уходят в ночь)
const C = c => LIGHT.dark ? mix(c, '#0B1020', LIGHT.dark * .72) : c;
// тень «вырезанной фигурки»: внутри формы path() закрасить часть, не накрытую той же формой, сдвинутой к свету
function cutShade(path, dx, dy, col = 'rgba(20,14,40,.28)') { ctx.save(); ctx.beginPath(); path(0, 0); ctx.clip(); ctx.beginPath(); ctx.rect(-5000, -5000, 10000, 10000); path(dx, dy); ctx.fillStyle = col; ctx.fill('evenodd'); ctx.restore(); }

// ───── сюжетное время и связь (раздел 8 ТЗ) — одна функция на все серии ─────
const STORY = {
  1: { clock: [[0, '20:03'], [1.9, '19:58'], [14.0, '19:59'], [19.0, '20:00'], [25.0, '20:01'], [44.0, '20:02'], [62.6, '20:03']], signal: [[0, 'lost'], [1.9, 'full'], [33.6, 'lost']], rewind: [1.2, 1.9] },
};
function storyAt(ep, t) { const S = STORY[ep]; const pick = arr => { let i = arr.length - 1; while (i > 0 && arr[i][0] > t) i--; return arr[i][1]; };
  let time = pick(S.clock), rw = 0;
  if (S.rewind && t >= S.rewind[0] && t < S.rewind[1]) { rw = win(t, S.rewind[0], S.rewind[1]); const m = Math.round(lerp(3, -2, E.io(rw))); time = m >= 0 ? '20:0' + m : '19:5' + (10 + m); }
  return { time, signal: pick(S.signal), rewind: rw }; }

// ───── табло: слева «• АЛМАТЫ · +6°» и время, справа связь (y = 240 по ТЗ) ─────
function Hud(t, { time, city = 'АЛМАТЫ', temp = '+6°', signal = 'full', rewind = 0, sigFlash = -9 }) {
  const y0 = 290; ctx.save(); /* ниже интерфейса Reels/TikTok (правки с.1) */
  ctx.fillStyle = 'rgba(11,16,32,.74)'; rr(64, y0, 300, 128, 18); ctx.fill(); ctx.fillStyle = T.window; ctx.fillRect(64 + 18, y0, 300 - 36, 4);
  ctx.fillStyle = signal === 'full' ? T.window : T.danger; circle(92, y0 + 34, 8); ctx.fill();
  txt(`${city} · ${temp}`, 110, y0 + 35, 30, 'rgba(244,241,234,.85)', { font: 'JBM', weight: 800 });
  txt(time, 84, y0 + 88, 64, T.text, { font: 'JBM', weight: 800 });
  if (rewind > 0) { const a = Math.sin(rewind * Math.PI); txt('◀◀', 300, y0 + 88, 40, T.window, { alpha: a, font: 'Mont' }); }
  // связь
  const x1 = 1010, bw = signal === 'full' ? 220 : 330, flash = clamp(1 - (t - sigFlash) / .6);
  if (flash > 0) { ctx.shadowColor = T.danger; ctx.shadowBlur = 50 * flash; }
  ctx.fillStyle = flash > 0 ? `rgba(${lerp(11, 120, flash)},${lerp(16, 20, flash)},${lerp(32, 24, flash)},.85)` : 'rgba(11,16,32,.74)'; rr(x1 - bw, y0, bw, 128, 18); ctx.fill(); ctx.shadowBlur = 0;
  ctx.fillStyle = signal === 'full' ? T.window : T.danger; ctx.fillRect(x1 - bw + 18, y0, bw - 36, 4);
  const bars = signal === 'full' ? 4 : 0; for (let i = 0; i < 4; i++) { ctx.fillStyle = i < bars ? T.text : 'rgba(244,241,234,.22)'; rr(x1 - bw + 28 + i * 22, y0 + 92 - (i + 1) * 15, 14, (i + 1) * 15, 3); ctx.fill(); }
  if (signal === 'full') txt('СЕТЬ', x1 - bw + 126, y0 + 64, 34, T.text, { font: 'JBM', weight: 800 });
  else { ctx.strokeStyle = T.danger; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x1 - bw + 26, y0 + 30); ctx.lineTo(x1 - bw + 112, y0 + 98); ctx.stroke();
    txt(signal === 'dead' ? 'ЭКРАН' : 'НЕТ', x1 - bw + 128, y0 + 44, 34, T.danger, { font: 'JBM', weight: 800 }); txt(signal === 'dead' ? 'МЁРТВ' : 'СЕТИ', x1 - bw + 128, y0 + 88, 34, T.danger, { font: 'JBM', weight: 800 }); }
  ctx.restore(); }

// ───── тряска кадра (ScreenShake): amp px, duration с — вокруг момента t0 ─────
const ScreenShake = (t, t0, amp = 8, dur = .6) => { if (t < t0 || t > t0 + dur) return [0, 0]; const k = 1 - (t - t0) / dur; return [Math.sin((t - t0) * 87) * amp * k, Math.cos((t - t0) * 61) * amp * k]; };

// ───── жёлтый стикер «ЧАСТЬ N» (первые 3 с) ─────
function PartSticker(n, t, final = false) { const k = AK.overshoot(win(t, 0, .25)); ctx.save(); ctx.translate(96, 490); ctx.rotate(-.07); ctx.scale(k, k);
  const s = final ? `ЧАСТЬ ${n} · ФИНАЛ` : `ЧАСТЬ ${n}`; ctx.font = '900 46px Mont'; const w = ctx.measureText(s).width + 56;
  ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6; ctx.fillStyle = '#FFD23F'; ctx.beginPath(); ctx.moveTo(0, -40);
  for (let i = 0; i <= 10; i++) ctx.lineTo(w * i / 10, -40 + (i % 2 ? 4 : 0)); ctx.lineTo(w, 40); for (let i = 10; i >= 0; i--) ctx.lineTo(w * i / 10, 40 - (i % 2 ? 4 : 0)); ctx.closePath(); ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(w * .62, -40, 26, 80); // полоска скотча
  txt(s, 28, 2, 46, T.ink, { weight: 900 }); ctx.restore(); }

// ───── финальная карточка: чёрный экран, красный текст, «ЧАСТЬ N+1 →» ─────
function EndCard(t, t0, text, next) { ENDCARD_AT = t; ctx.fillStyle = '#05060c'; ctx.fillRect(0, 0, W, H); const k = E.out(win(t, t0, t0 + .35)), jit = t - t0 < .5 ? (Math.random() - .5) * 0 : 0;
  ctx.save(); ctx.translate(CXC, 900); const sc = lerp(1.25, 1, k); ctx.scale(sc, sc); ctx.shadowColor = 'rgba(229,56,59,.7)'; ctx.shadowBlur = 40;
  const rows = text.split('|'); rows.forEach((r, i) => txt(r, 0, (i - (rows.length - 1) / 2) * 104, 96, T.danger, { weight: 900, align: 'center', alpha: k })); ctx.restore();
  if (next) txt(next, CXC, 1120, 68, T.text, { weight: 900, align: 'center', alpha: win(t, t0 + .45, t0 + .8) }); }
