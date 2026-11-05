// «ҚУАТ» — общие компоненты сериала (на основе «Счётчика» и «Тыныса»). Плоский 2D, детерминированно по t.
// Имена — как в ТЗ (раздел 6): KineticCaption, Hud, ChargeFlow, Overheat, PowerDown, PartSticker, EndCard, PosterFrame.
// StreamFrame, GroupChat, CityGrid, MinerFarm добавятся в сериях 2–5.
'use strict';
const W = 1080, H = 1920, CXC = 510; // центр текста: правее 60 px от края и левее кнопок платформы
const T = { night: '#101B33', dorm: '#F2D7A6', snow: '#EEF3F8', charge: '#3DFF8F', chargeGlow: '#B8FFD4', low: '#FFC83D', empty: '#FF4D4D', miner: '#8A5CFF',
  cyan: '#4FD8FF', warm: '#FFB347', pink: '#FF8FB1', ink: '#0A0F1E', text: '#FFFFFF', ol: '#0A0F1E' };
const SPEAKER = { beka: T.text, erzhan: T.cyan, apai: T.warm, dana: T.pink, ruslan: T.miner };
let ctx;
const initLib = c => { ctx = c.getContext('2d'); };
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, k) => a + (b - a) * k, win = (t, a, b) => clamp((t - a) / (b - a));
const E = { out: k => 1 - Math.pow(1 - k, 3), in2: k => k * k, io: k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2, back: k => { const c1 = 1.7, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); } };
const seeded = s => () => (s = (s * 16807) % 2147483647) / 2147483647;
function rr(x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function circle(x, y, r) { ctx.beginPath(); ctx.arc(x, y, Math.max(0, r), 0, Math.PI * 2); }
function fillOL(col, lw = 5) { ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = lw; ctx.strokeStyle = T.ol; ctx.lineJoin = 'round'; ctx.stroke(); }
function txt(s, x, y, size, col = T.text, { font = 'Mont', weight = 900, align = 'left', alpha = 1, stroke = 0 } = {}) {
  ctx.save(); ctx.globalAlpha *= alpha; ctx.font = `${weight} ${size}px ${font}`; ctx.textBaseline = 'middle'; ctx.textAlign = align;
  if (stroke) { ctx.lineWidth = stroke; ctx.strokeStyle = T.ink; ctx.lineJoin = 'round'; ctx.strokeText(s, x, y); }
  ctx.fillStyle = col; ctx.fillText(s, x, y); ctx.restore(); }
function glow(x, y, r, col, a = 1) { if (r <= 0) return; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore(); }
const cam = (z, fx, fy, draw, dx = 0, dy = 0) => { ctx.save(); ctx.translate(fx + dx, fy + dy); ctx.scale(z, z); ctx.translate(-fx, -fy); draw(); ctx.restore(); };
const push = (t, a, b, draw, fx = 540, fy = 900, z0 = 1, z1 = 1.08) => cam(lerp(z0, z1, E.io(win(t, a, b))), fx, fy, draw); // наезд 100→108%
const pan = (t, a, b, draw, px = 60, py = 0) => { ctx.save(); const k = E.io(win(t, a, b)); ctx.translate(-px * k, -py * k); draw(); ctx.restore(); };
const shake = (t, t0, amp = 30, dec = 7) => t < t0 ? [0, 0] : [Math.sin((t - t0) * 71) * amp * Math.exp(-(t - t0) * dec), Math.cos((t - t0) * 53) * amp * Math.exp(-(t - t0) * dec)];
const flash = (t, t0, col = '255,255,255', a = .9) => { if (t >= t0 && t < t0 + 2 / 30) { ctx.fillStyle = `rgba(${col},${a})`; ctx.fillRect(-400, -400, W + 800, H + 800); } }; // вспышка ровно 2 кадра
const dim = (a, col = '10,15,30') => { ctx.fillStyle = `rgba(${col},${a})`; ctx.fillRect(-400, -400, W + 800, H + 800); };

// ───── снег / метель ─────
const FLAKES = (() => { const r = seeded(17); return Array.from({ length: 220 }, () => [r() * W, r() * H, 60 + r() * 160, 1.5 + r() * 4.5, r() * 6]); })();
function snow(t, a = .8, wind = 0, speed = 1) { ctx.save(); ctx.fillStyle = T.snow;
  for (const [x0, y0, sp, r, ph] of FLAKES) { const y = ((y0 + t * sp * speed) % (H + 40) + H + 40) % (H + 40) - 20, x = ((x0 + Math.sin(t * .8 + ph) * 22 + wind * t * sp * .02) % (W + 40) + W + 40) % (W + 40) - 20;
    ctx.globalAlpha = a * (.4 + r / 7); if (Math.abs(wind) > 60) { ctx.save(); ctx.translate(x, y); ctx.rotate(Math.atan2(sp * speed, wind * sp * .02) - Math.PI / 2); ctx.fillRect(-r * .5, -r * 2.2, r, r * 4.4); ctx.restore(); } else { circle(x, y, r); ctx.fill(); } } ctx.restore(); }

// ───── постобработка: зерно 5% + виньетка ─────
const GRAIN = (() => { const arr = []; for (let k = 0; k < 6; k++) { const c = document.createElement('canvas'); c.width = 270; c.height = 480; const g = c.getContext('2d'), im = g.createImageData(270, 480), r = seeded(101 + k);
  for (let i = 0; i < im.data.length; i += 4) { const v = r() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } g.putImageData(im, 0, 0); arr.push(c); } return arr; })();
function post(t, vig = .35) { ctx.save(); ctx.globalAlpha = .05; ctx.globalCompositeOperation = 'overlay'; ctx.imageSmoothingEnabled = false; ctx.drawImage(GRAIN[Math.floor(t * 30) % GRAIN.length], 0, 0, W, H); ctx.restore();
  const g = ctx.createRadialGradient(540, 960, 500, 540, 960, 1250); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${vig})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }

// ───── заряд Беки: одна функция от времени серии (раздел 8 ТЗ) ─────
// Цены (раздел 2): телефон −2, ноутбук −6 (но не больше, чем осталось), дефибриллятор −20, пауэрбанк +5; сон +10/ч.
const COST = { phone: -2, laptop: -6, defib: -20, powerbank: 5 };
// BATTERY[ep] = { start, showAt, events: [[t, kind | число, ramp?]] } — событие меняет заряд за ramp секунд (цифры «бегут»)
const BATTERY = {};
function batteryAt(ep, t) { const b = BATTERY[ep]; if (!b) return null; let v = b.start;
  for (const [t0, kind, ramp = .14] of b.events) { if (t < t0) break; const d = typeof kind === 'number' ? kind : COST[kind], k = win(t, t0, t0 + ramp), full = Math.max(0, v + d) - v; v += full * k; }
  return v; }
const batteryShown = (ep, t) => { const b = BATTERY[ep]; return b && t >= b.showAt ? batteryAt(ep, t) : null; };
const batteryRate = (ep, t) => { const a = batteryAt(ep, t - .05), b = batteryAt(ep, t); return a == null ? 0 : Math.sign(Math.round(b - a)); };
const battCol = v => v > 50 ? T.charge : v >= 20 ? T.low : T.empty;
// ───── единое сюжетное время: опорные точки [сек серии, 'ЧЧ:ММ'] ─────
const STORY_CLOCK = {};
function storyClock(ep, t) { const ks = STORY_CLOCK[ep]; let i = ks.length - 1; while (i > 0 && ks[i][0] > t) i--; const [h, m] = ks[i][1].split(':').map(Number);
  const nx = ks[i + 1], cap = nx ? (() => { const [h2, m2] = nx[1].split(':').map(Number); let v = h2 * 60 + m2; if (v < h * 60 + m) v += 1440; return v; })() : 1e9, mins = Math.min(cap, h * 60 + m + Math.floor((t - ks[i][0]) / 60)) % 1440;
  return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`; }

// ───── Hud: слева «• АСТАНА · 23:40 · −31°», справа батарея «БЕКА 23%» ─────
// battery: число или null (скрыта); rate: −1/0/+1 — стрелки; appear: 0..1 — анимация появления; stamp — плашка «ЧАС НАЗАД»
function Hud(t, { place = 'АСТАНА', time, temp, battery = null, rate = 0, appear = 1, stamp = null }) {
  const left = `${place} · ${time} · ${temp}`; ctx.save(); ctx.font = '800 32px Mont'; const w = ctx.measureText(left).width + 64;
  ctx.fillStyle = 'rgba(10,15,30,.74)'; rr(70, 212, w, 58, 12); ctx.fill(); ctx.strokeStyle = 'rgba(79,216,255,.55)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = Math.floor(t * 1.5) % 2 ? T.cyan : T.empty; circle(96, 241, 7); ctx.fill(); txt(left, 116, 242, 32, T.text, { weight: 800 }); ctx.restore();
  if (stamp) { ctx.save(); ctx.font = '900 30px Mont'; const sw = ctx.measureText(stamp).width + 40; ctx.fillStyle = T.cyan; rr(70, 284, sw, 50, 10); ctx.fill(); txt(stamp, 90, 310, 30, T.ink, { weight: 900 }); ctx.restore(); }
  if (battery === null) return;
  const v = Math.max(0, Math.round(battery)), col = battCol(v), crit = v <= 5, blink = crit && Math.floor(t * 4) % 2;
  ctx.save(); const ak = E.back(clamp(appear)); const label = `БЕКА ${v}%`; ctx.font = '800 46px JBM'; const tw = ctx.measureText(label).width, bw = tw + 150, x1 = 1010, y0 = 212, bh = 84;
  ctx.translate(x1 - bw / 2, y0 + bh / 2); ctx.scale(ak, ak); ctx.translate(-(x1 - bw / 2), -(y0 + bh / 2)); ctx.globalAlpha = clamp(appear * 2);
  if (rate) { ctx.shadowColor = rate > 0 ? T.charge : col; ctx.shadowBlur = 34; }
  ctx.fillStyle = crit ? `rgba(${blink ? 120 : 70},16,22,.9)` : 'rgba(10,15,30,.82)'; rr(x1 - bw, y0, bw, bh, 14); ctx.fill(); ctx.shadowBlur = 0; ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.stroke();
  const ix = x1 - bw + 24, iy = y0 + 25; ctx.strokeStyle = col; ctx.lineWidth = 4; rr(ix, iy, 70, 34, 6); ctx.stroke(); ctx.fillStyle = col; rr(ix + 72, iy + 10, 7, 14, 2); ctx.fill(); // иконка батареи
  const fw = 62 * clamp(battery / 100); if (fw > 0) { rr(ix + 4, iy + 4, Math.max(4, fw), 26, 3); ctx.fill(); }
  if (rate > 0) { ctx.fillStyle = T.ink; ctx.beginPath(); ctx.moveTo(ix + 40, iy + 3); ctx.lineTo(ix + 30, iy + 19); ctx.lineTo(ix + 37, iy + 19); ctx.lineTo(ix + 32, iy + 31); ctx.lineTo(ix + 46, iy + 14); ctx.lineTo(ix + 38, iy + 14); ctx.closePath(); ctx.fill(); } // молния «заряжается»
  txt(label, ix + 100, y0 + bh / 2 + 2, 46, blink ? '#ffffff' : col, { font: 'JBM', weight: 800 });
  if (rate < 0) { ctx.fillStyle = col; const ax = x1 - 26, ay = y0 + bh + 18 + ((t * 60) % 14); ctx.beginPath(); ctx.moveTo(ax - 12, ay - 8); ctx.lineTo(ax + 12, ay - 8); ctx.lineTo(ax, ay + 8); ctx.closePath(); ctx.fill(); } // стрелка вниз — отдаёт
  ctx.restore(); }

// ───── ChargeFlow: зелёные точки по руке, вспышка 2 кадра на касании, всплывающий процент устройства ─────
// path — точки от устройства (path[0]) к сердцу; dir: 'give' — от сердца к устройству, 'take' — к сердцу;
// t0 — касание, dur — сколько течёт ток; popup: { x, y, text, col } — заряд устройства
function polyAt(path, u) { const seg = []; let L = 0; for (let i = 1; i < path.length; i++) { const d = Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]); seg.push(d); L += d; }
  let s = clamp(u) * L; for (let i = 0; i < seg.length; i++) { if (s <= seg[i] || i === seg.length - 1) { const k = seg[i] ? clamp(s / seg[i]) : 0; return [lerp(path[i][0], path[i + 1][0], k), lerp(path[i][1], path[i + 1][1], k)]; } s -= seg[i]; } return path[0]; }
function ChargeFlow(t, { t0, dur = .8, path, dir = 'give', popup = null, size = 1, dots = 14 }) {
  if (t < t0 - .02 || !path) return; const on = t < t0 + dur, k = on ? E.out(win(t, t0, t0 + .15)) : 1 - win(t, t0 + dur, t0 + dur + .25);
  if (k > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < dots; i++) { let u = ((t - t0) * 1.6 + i / dots) % 1; if (dir === 'give') u = 1 - u; const [x, y] = polyAt(path, u), r = (7 + 4 * Math.sin(i * 2.3)) * size;
      ctx.fillStyle = `rgba(61,255,143,${.95 * k})`; circle(x, y, r); ctx.fill(); ctx.fillStyle = `rgba(184,255,212,${.35 * k})`; circle(x, y, r * 2.2); ctx.fill(); }
    ctx.strokeStyle = `rgba(61,255,143,${.25 * k})`; ctx.lineWidth = 16 * size; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); path.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
    glow(path[0][0], path[0][1], 120 * size, `rgba(61,255,143,${.55 * k})`); ctx.restore(); }
  if (t >= t0 && t < t0 + 2 / 30) { const [x, y] = path[0]; glow(x, y, 420 * size, 'rgba(220,255,235,1)'); glow(x, y, 200 * size, 'rgba(255,255,255,1)'); } // вспышка 2 кадра
  if (popup && t >= t0) { const pk = win(t, t0, t0 + 1.3), rise = E.out(pk) * 90, a = pk < .75 ? 1 : 1 - (pk - .75) / .25, sc = E.back(clamp((t - t0) / .25)); if (a > 0) { ctx.save(); ctx.globalAlpha = a; ctx.translate(popup.x, popup.y - rise); ctx.scale(sc, sc);
    const s = popup.text, fs = popup.size || 56; ctx.font = `900 ${fs}px Mont`; const tw = ctx.measureText(s).width; ctx.fillStyle = 'rgba(10,15,30,.88)'; rr(-tw / 2 - 22, -fs * .7, tw + 44, fs * 1.4, 18); ctx.fill(); ctx.strokeStyle = popup.col || T.charge; ctx.lineWidth = 4; ctx.stroke();
    txt(s, 0, 2, fs, popup.col || T.charge, { align: 'center' }); ctx.restore(); } } }

// ───── PowerDown: веки смыкаются, «0%», кадр гаснет в чёрный (как выключение экрана) ─────
function PowerDown(t, t0, { eyesY = 900 } = {}) { if (t < t0) return; const k = E.io(win(t, t0, t0 + 1.1)), k2 = E.in2(win(t, t0 + 1.1, t0 + 1.6));
  ctx.save(); ctx.fillStyle = '#000'; const gap = lerp(H, 0, k); ctx.fillRect(0, 0, W, eyesY - gap / 2); ctx.fillRect(0, eyesY + gap / 2, W, H); // веки — чёрные шторки к линии глаз
  if (k >= 1) { ctx.fillStyle = `rgba(184,255,212,${1 - k2})`; const lw = lerp(W, 0, k2); ctx.fillRect(540 - lw / 2, eyesY - 3, lw, 6); } // гаснущая линия, как у выключенного экрана
  if (t > t0 + .5) { const zk = win(t, t0 + .5, t0 + .7); ctx.globalAlpha = zk * (1 - win(t, t0 + 2.6, t0 + 3.2)); ctx.strokeStyle = T.empty; ctx.lineWidth = 8; rr(CXC - 120, 560, 220, 110, 18); ctx.stroke(); ctx.fillStyle = T.empty; rr(CXC + 104, 595, 16, 40, 4); ctx.fill();
    txt('0%', CXC, 760, 120, T.empty, { align: 'center', stroke: 12 }); }
  ctx.restore(); }

// ───── KineticCaption: слова загораются по одному, фразы по 3–5 слов, обводка 6 px + тень, на светлом — подложка ─────
// buildCaptions([[начало, конец, 'текст с **акцентом**', { times, speaker, whole, y, size }], ...])
const GLUE = new Set(['В', 'ВО', 'НА', 'К', 'КО', 'С', 'СО', 'У', 'О', 'ОБ', 'ПО', 'ИЗ', 'ЗА', 'ДО', 'ОТ', 'НЕ', 'НИ', 'И', 'А', 'НО', 'ДЛЯ', 'ПРО', 'ПРИ', 'БЕЗ', '—', 'Я']);
const glued = w => GLUE.has(w.text.replace(/[«»",.!?]/g, '')) || /^\d+$/.test(w.text);
function buildCaptions(list, { lead = .05, tail = .35 } = {}) {
  const out = [];
  for (const [a, b, raw, opt = {}] of list) {
    const words = []; let acc = false;
    for (const tok of raw.split(/\s+/).filter(Boolean)) { let w = tok; if (w.startsWith('**')) { acc = true; w = w.slice(2); } const en = w.includes('**'); w = w.replace(/\*\*/g, ''); words.push({ text: w.toUpperCase(), accent: acc }); if (en) acc = false; }
    const segs = []; let cur = []; words.forEach(w => { cur.push(w); if (/[.!?]$/.test(w.text)) { segs.push(cur); cur = []; } }); if (cur.length) segs.push(cur);
    const split = []; for (const sg of segs) { if (sg.length <= 5) { split.push(sg); continue; } const parts = Math.ceil(sg.length / 5), per = Math.ceil(sg.length / parts); for (let i = 0; i < sg.length; i += per) split.push(sg.slice(i, i + per)); }
    const nw = a => a.filter(w => w.text !== '—').length;
    if (opt.whole) { split.length = 0; split.push([...words]); }
    const ph = []; for (const sg of split) { const last = ph[ph.length - 1]; if (last && (nw(last) < 3 || nw(sg) < 3) && nw(last) + nw(sg) <= 5) last.push(...sg); else ph.push([...sg]); }
    for (let i = 0; i < ph.length - 1; i++) while (ph[i].length > 1 && glued(ph[i][ph[i].length - 1])) ph[i + 1].unshift(ph[i].pop());
    const n = words.length, t0 = a + lead, t1 = b - tail; let k = 0, j = 0, prev = t0;
    for (const p of ph) { for (const w of p) { if (opt.times) { w.t = w.text === '—' ? prev : +(opt.times[j++] ?? prev).toFixed(3); prev = w.t; } else w.t = +(t0 + (t1 - t0) * k / n).toFixed(3); k++; }
      const { times, ...rest } = opt; rest.color = SPEAKER[rest.speaker || 'beka']; if (rest.speaker && rest.speaker !== 'beka') rest.accent = '#ffffff'; if (rest.title) rest.accent = T.charge;
      out.push({ a: p[0].t, b, words: p, ...rest }); }
  }
  out.forEach((p, i) => { const nx = out[i + 1]; if (nx && nx.a < p.b) p.b = nx.a; p.words = p.words.filter(w => w.text !== '—').flatMap(w => w.text.length > 14 && w.text.includes('-') ? w.text.split('-').map((x, i, a) => ({ ...w, text: i < a.length - 1 ? x + '-' : x })) : [w]); }); // тире не показываем; длинное слово через дефис — на две строки
  return out;
}
let ENDCARD_AT = -1;
function KineticCaption(t, phrases, y = 1275) {
  const p = phrases.find(q => t >= q.a && t < q.b); if (!p) return; if (ENDCARD_AT === t && !p.y) return; let size = p.size || 72; const maxW = p.maxW || 800; if (p.y) y = p.y;
  ctx.save(); ctx.font = `900 ${size}px Mont`; const longest = Math.max(...p.words.map(w => ctx.measureText(w.text).width)); if (longest > maxW) { size = Math.floor(size * maxW / longest); ctx.font = `900 ${size}px Mont`; } ctx.textBaseline = 'middle'; const sp = ctx.measureText(' ').width * 1.7; // слово шире строки — мельче кегль
  const units = []; p.words.forEach(w => { const u = units[units.length - 1]; if (u && glued(u[u.length - 1])) u.push(w); else units.push([w]); });
  const lines = [[]]; let lw = 0; for (const u of units) { const uw = u.reduce((s2, w) => s2 + ctx.measureText(w.text).width, 0) + sp * (u.length - 1); if (lw + uw > maxW && lines[lines.length - 1].length) { lines.push([]); lw = 0; } for (const w of u) lines[lines.length - 1].push([w, ctx.measureText(w.text).width]); lw += uw + sp; }
  const lh = size * 1.12, blockH = lines.length * lh, widest = Math.max(...lines.map(ln => ln.reduce((s2, [, ww]) => s2 + ww, 0) + sp * (ln.length - 1)));
  const bx = Math.max(0, CXC - widest / 2 - 40), by = y - blockH / 2 - 26, bw2 = Math.min(W - bx, widest + 80), bh2 = blockH + 52;
  try { const im = ctx.getImageData(bx, by, bw2, bh2).data; let sum = 0, cnt = 0; for (let i = 0; i < im.length; i += 4 * 23) { sum += (.2126 * im[i] + .7152 * im[i + 1] + .0722 * im[i + 2]) / 255; cnt++; }
    if (sum / cnt > .30) { ctx.fillStyle = "rgba(10,15,30,.80)"; rr(bx, by, bw2, bh2, 28); ctx.fill(); } } catch (e) { }
  lines.forEach((ln, i) => { const tw = ln.reduce((s2, [, ww]) => s2 + ww, 0) + sp * (ln.length - 1); let x = CXC - tw / 2; const yy = y + (i - (lines.length - 1) / 2) * lh;
    for (const [w, ww] of ln) { const on = t >= w.t, k = E.out(win(t, w.t, w.t + .12)), sc = w.accent && on ? lerp(1, 1.07, k) : 1;
      ctx.save(); ctx.translate(x + ww / 2, yy); ctx.scale(sc, sc);
      ctx.shadowColor = 'rgba(0,0,0,.65)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 5; ctx.lineWidth = 12; ctx.strokeStyle = T.ink; ctx.lineJoin = 'round'; ctx.strokeText(w.text, -ww / 2, 0); ctx.shadowColor = 'transparent'; // обводка 6 px наружу + тень
      ctx.fillStyle = !on ? '#8d98a8' : w.accent ? (p.accent || T.charge) : (p.color || T.text); ctx.fillText(w.text, -ww / 2, 0); ctx.restore(); x += ww + sp; } });
  ctx.restore(); }

// ───── карточки ─────
function PartSticker(n, t, final = false) { ctx.save(); ctx.translate(140, 400); ctx.rotate(-.06); const s = final ? 'ЧАСТЬ 5 · ФИНАЛ' : `ЧАСТЬ ${n}`; ctx.font = '900 44px Mont'; const w = ctx.measureText(s).width + 48;
  ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 16; ctx.fillStyle = T.charge; rr(-24, -38, w, 76, 8); ctx.fill(); ctx.shadowBlur = 0; ctx.fillStyle = T.cyan; ctx.fillRect(-24, 30, w, 8); txt(s, 0, 0, 44, T.ink, { weight: 900 }); ctx.restore(); }
function bolt(x0, y0, x1, y1, seed, { w = 10, branches = 3, col = '255,255,255', glowCol = '160,200,255', a = 1 } = {}) { const r = seeded(seed); const pts = [[x0, y0]]; const n = 14;
  for (let i = 1; i < n; i++) { const k = i / n; pts.push([lerp(x0, x1, k) + (r() - .5) * 120 * (1 - k * .5), lerp(y0, y1, k) + (r() - .5) * 30]); } pts.push([x1, y1]);
  const line = (p, lw, c) => { ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.lineJoin = 'miter'; ctx.lineCap = 'round'; ctx.beginPath(); p.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); };
  ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'lighter'; line(pts, w * 5, `rgba(${glowCol},.25)`); line(pts, w * 2, `rgba(${glowCol},.55)`);
  for (let b = 0; b < branches; b++) { const i0 = 2 + Math.floor(r() * (n - 6)), br = [pts[i0]]; let [x, y] = pts[i0]; const dir = r() < .5 ? -1 : 1; for (let j = 0; j < 5; j++) { x += dir * (30 + r() * 60); y += 40 + r() * 60; br.push([x, y]); } line(br, w * .6, `rgba(${col},.8)`); }
  line(pts, w, `rgba(${col},1)`); ctx.restore(); }
function EndCard(t, t0, text, next, { bolt: withBolt = true } = {}) { ENDCARD_AT = t; ctx.fillStyle = T.night; ctx.fillRect(0, 0, W, H); const k = E.out(win(t, t0, t0 + .4));
  glow(CXC, 900, 700, 'rgba(61,255,143,.16)'); if (withBolt && t - t0 < .25) bolt(CXC + 60, -40, CXC - 20, 760, 9, { a: 1 - (t - t0) / .25, glowCol: '61,255,143' });
  ctx.save(); ctx.font = '900 96px Mont'; const words = text.split(' '), rows = []; let line = ''; for (const w of words) { const tt = line ? line + ' ' + w : w; const plain = tt.replace(/\*\*/g, ''); if (ctx.measureText(plain).width > 820 && line) { rows.push(line); line = w; } else line = tt; } rows.push(line); ctx.restore();
  rows.forEach((r, i) => { const acc = r.includes('**'), s = r.replace(/\*\*/g, '').toUpperCase(); ctx.save(); ctx.shadowColor = acc ? T.charge : 'rgba(0,0,0,.6)'; ctx.shadowBlur = acc ? 40 : 12; const sc = acc ? lerp(.85, 1, E.back(win(t, t0 + .15, t0 + .5))) : 1; ctx.translate(CXC, 860 + (i - (rows.length - 1) / 2) * 112); ctx.scale(sc, sc);
    txt(s, 0, 0, acc ? 112 : 84, acc ? T.charge : T.text, { weight: 900, align: 'center', alpha: k, stroke: 10 }); ctx.restore(); });
  if (next) txt(next, CXC, 1100 + rows.length * 30, 48, T.cyan, { weight: 900, align: 'center', alpha: win(t, t0 + .5, t0 + .9) }); }
// кадр-постер для обложки: кадр сцены + крупный титр сверху
function PosterFrame(drawScene, title, sub) { drawScene(); const g = ctx.createLinearGradient(0, 0, 0, 760); g.addColorStop(0, 'rgba(10,15,30,.85)'); g.addColorStop(1, 'rgba(10,15,30,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 760);
  ctx.save(); ctx.shadowColor = T.charge; ctx.shadowBlur = 40; txt(title, CXC, 330, 150, T.charge, { align: 'center', stroke: 14 }); ctx.restore(); txt(sub, CXC, 480, 58, T.text, { align: 'center', stroke: 10 }); }
