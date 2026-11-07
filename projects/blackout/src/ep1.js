// «Блэкаут» · серия 1 «Тень над Алматы» v2 (1:24). ТЗ — brief-ep1-v2.md, правки к v1 — pravki-ep1-v1.md, план — plan.md.
// Хук: 20:03, тёмная прихожая, дверь трясётся от ударов → на «пять» перемотка 0,7 с → тёплый свет, 19:58.
// Блэкаут: в самой кухне гаснут монитор, люстра, утюг. Город: 6 планов «аспект-к-аспекту» (ЖК, люди, «Нурлы Тау» и гостиница,
// собор, Кок-Тобе, дорога с фарами). Финал: тишина с фоном комнаты → шёпот → на «застучал» удар, головы к двери → дверь → карточка 3 с.
'use strict';
const DUR = 83.8, EP = 1;
window.SCENE = { duration: DUR, fps: 30, width: W, height: H };
initLib(document.getElementById('c'));
const OUT = 62.6; // 20:03 — свет гаснет в кухне
const VO_AT = { n01: .05, n02: 3.1, n03: 6.1, a01: 10.4, n04: 14.1, n05: 19.25, n06: 22.3, n07: 25.15, d01: 29.15, b01: 31.3, n08: 35.2, d02: 41.9, an1: 44.95, an2: 47.2, an3: 53.0, an4: 58.15, n09: 64.55, n10: 71.5, n11: 76.6 };
const VO_GAIN = { n01: 8, n07: 6.5, n11: 12, d02: 9.5, an4: 5.5, a01: 4.6, b01: 4.4, d01: 4.6 };
const VO_CUT = { an4: 2.98 }; // диктор обрывается на «и…»
const VT = id => window.VO_WORDS && VO_WORDS[id] ? VO_WORDS[id].map(x => +(x + VO_AT[id]).toFixed(3)) : null;
const mouthOf = (t, id) => window.VO_MOUTH && VO_MOUTH[id] && t < VO_AT[id] + (VO_CUT[id] || 9) ? AK.mouth(t, VO_MOUTH[id], VO_AT[id]) : 0;
const anchorMouth = t => Math.max(...['an1', 'an2', 'an3', 'an4'].map(id => mouthOf(t, id)));
const KNOCK_AT = (VT('n11') || [0, 0, 0, 0, 0, 77.54])[5]; // первый удар — ровно на слове «застучал»
const hook0 = (() => { const v = VT('n01'); if (v) v[0] = 0; return v; })();
const CAPS = buildCaptions([
  [0, 3.0, 'До конца света оставалось **пять минут**', { times: hook0 }],
  [3.0, 6.0, 'Старая **сталинка** на Абая — Байтурсынова', { times: VT('n02') }],
  [6.0, 10.3, 'Мы ужинали дошираком. Каждый был занят **своим**.', { times: VT('n03') }],
  [10.3, 14.0, 'Не мешайте, у меня завтра **рубежка**.', { times: VT('a01') }],
  [14.0, 19.0, 'А у Диаса — свидание. Она уже ехала на **такси**.', { times: VT('n04') }],
  [19.0, 22.0, 'Это сообщение ещё успело **дойти**.', { times: VT('n05') }],
  [22.0, 25.0, 'Сначала задрожали **стены**.', { times: VT('n06') }],
  [25.0, 29.0, 'Над крышей с рёвом пронёсся **истребитель**.', { times: VT('n07') }],
  [29.0, 31.0, 'Это что за **хрень**?!', { times: VT('d01') }],
  [31.0, 35.0, 'Надо чекнуть паблики, чьи это **учения**!', { times: VT('b01') }],
  [35.0, 40.0, 'Диас написал ей. Сообщения **не доходили**.', { times: VT('n08') }],
  [40.0, 44.0, 'Давай же… **давай**…', { times: VT('d02') }],
  [44.0, 47.0, 'Внимание. **Экстренное** сообщение.', { times: VT('an1'), speaker: 'anchor' }],
  [47.0, 52.9, 'Масштабные перебои на юге России, в Восточной Европе и на **Кавказе**.', { times: VT('an2'), speaker: 'anchor' }],
  [52.9, 58.1, 'Из Европы передают: молнии уничтожают **подстанции**.', { times: VT('an3'), speaker: 'anchor' }],
  [58.1, 61.2, 'Простите… Блэкаут накрыл весь **Западный Казахстан**…', { times: (VT('an4') || []).slice(0, 6), speaker: 'anchor' }],
  [64.3, 69.2, 'И весь Алматы погрузился во **тьму**.', { times: VT('n09') }],
  [71.2, 75.6, 'А где-то там, в темноте, ехала **Аружан**.', { times: VT('n10') }],
  [76.6, 80.8, 'И в этой тьме кто-то **застучал** в дверь.', { times: VT('n11') }],
]);
const dimAll = a => { ctx.fillStyle = `rgba(5,7,16,${a})`; ctx.fillRect(-300, -300, W + 600, H + 600); };
const warmWash = a => { ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = `rgba(255,170,80,${a})`; ctx.fillRect(-300, -300, W + 600, H + 600); ctx.restore(); };
const shakeAt = (t, list) => list.reduce((a, [t0, amp, d]) => { const s = ScreenShake(t, t0, amp, d); return [a[0] + s[0], a[1] + s[1]]; }, [0, 0]);
const fitFont = (s, maxW, size, min = 44, w = 800) => { ctx.font = `${w} ${size}px Mont`; while (size > min && ctx.measureText(s).width > maxW) { size -= 2; ctx.font = `${w} ${size}px Mont`; } return size; };

// ───── прихожая и дверь: дерматин, «пуговицы», крючки с куртками. dark — темнота с лучом фонарика из руки ─────
function hallway(t, { dark = 0, hit = { dx: 0, dy: 0, sx: 1, sy: 1 }, gap = null, beamK = 1, beamJit = 0 } = {}) { LIGHT.dark = dark * .7;
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, C('#D9C29C')); g.addColorStop(1, C('#B89C74')); ctx.fillStyle = g; ctx.fillRect(-200, -200, W + 400, H + 400);
  ctx.fillStyle = C('#8A6A4A'); ctx.fillRect(-200, 1420, W + 400, 30); ctx.fillStyle = C('#6B5040'); ctx.fillRect(250, 330, 640, 1110); // наличник
  ctx.save(); ctx.translate(570 + hit.dx, 885 + hit.dy); ctx.scale(hit.sx, hit.sy); ctx.translate(-570, -885);
  ctx.fillStyle = C('#4A2C26'); rr(285, 360, 570, 1060, 14); ctx.fill(); ctx.strokeStyle = C('#331C18'); ctx.lineWidth = 4;
  for (let i = 0; i < 5; i++) for (let j = 0; j < 10; j++) { const px = 335 + i * 115 + (j % 2) * 57, py = 410 + j * 102; if (px > 820) continue; ctx.beginPath(); ctx.moveTo(px, py - 51); ctx.lineTo(px + 57, py); ctx.lineTo(px, py + 51); ctx.lineTo(px - 57, py); ctx.closePath(); ctx.stroke(); ctx.fillStyle = C('#C9A45A'); circle(px, py - 51, 6); ctx.fill(); }
  ctx.fillStyle = C('#C9A45A'); circle(570, 640, 15); ctx.fill(); ctx.fillStyle = '#0c0c10'; circle(570, 640, 7); ctx.fill(); ctx.fillStyle = C('#C9A45A'); rr(770, 900, 28, 80, 8); ctx.fill(); rr(700, 926, 98, 24, 12); ctx.fill(); ctx.restore();
  for (const [hx, col] of [[120, '#26357F'], [190, '#3E3A36']]) { ctx.fillStyle = C('#8A8F99'); ctx.fillRect(hx - 4, 560, 8, 30); ctx.fillStyle = C(col); ctx.beginPath(); ctx.moveTo(hx - 50, 590); ctx.lineTo(hx + 50, 590); ctx.lineTo(hx + 70, 980); ctx.lineTo(hx - 70, 980); ctx.fill(); }
  ctx.fillStyle = C('#E8E4DC'); rr(960, 800, 50, 80, 8); ctx.fill(); // выключатель
  ctx.fillStyle = '#05060a'; ctx.fillRect(285, 1420, 570, 20);
  if (gap) { ctx.save(); ctx.beginPath(); ctx.rect(285, 1420, 570, 20); ctx.clip(); const gr = ctx.createLinearGradient(gap.x - 240, 0, gap.x + 240, 0); gr.addColorStop(0, 'rgba(255,250,230,0)'); gr.addColorStop(.5, `rgba(255,250,230,${gap.k})`); gr.addColorStop(1, 'rgba(255,250,230,0)'); ctx.fillStyle = gr; ctx.fillRect(285, 1420, 570, 20);
    ctx.fillStyle = '#05060a'; for (const fx of gap.feet) ctx.fillRect(fx - 36, 1420, 72, 20); ctx.restore(); glow(gap.x, 1450, 220, `rgba(255,250,230,${.3 * gap.k})`); }
  ctx.fillStyle = C('#5A4436'); ctx.fillRect(-200, 1450, W + 400, 600); ctx.fillStyle = C('#7A5A44'); rr(330, 1480, 480, 80, 10); ctx.fill();
  if (dark > .5) { dimAll(.42 * dark); // в темноте видно только то, что в луче: луч идёт из руки с телефоном (низ слева)
    const bx = 560 + beamJit, by = 860; ctx.save(); ctx.globalCompositeOperation = 'lighter'; const cg = ctx.createLinearGradient(40, 1600, bx, by); cg.addColorStop(0, `rgba(255,248,230,${.45 * beamK})`); cg.addColorStop(1, `rgba(255,248,230,${.1 * beamK})`); ctx.fillStyle = cg;
    ctx.beginPath(); ctx.moveTo(70, 1590); ctx.lineTo(bx - 330, by - 160); ctx.lineTo(bx + 330, by + 160); ctx.lineTo(120, 1630); ctx.fill(); const sg = ctx.createRadialGradient(bx, by, 0, bx, by, 380); sg.addColorStop(0, `rgba(255,248,230,${.62 * beamK})`); sg.addColorStop(1, 'rgba(255,248,230,0)'); ctx.fillStyle = sg; ctx.fillRect(bx - 400, by - 400, 800, 800); ctx.restore();
    ctx.fillStyle = '#2a1e1a'; ctx.save(); ctx.translate(60, 1640); ctx.rotate(-.75); rr(-30, -60, 60, 120, 10); ctx.fill(); ctx.restore(); drawHand(-40, 1760, -.75, 130, '#3a2a22', { grip: 1 }); glow(80, 1600, 60, `rgba(255,250,235,${beamK})`); } }
// ───── 1. Хук ─────
const HOOK_K = [.15, .42, .7, .98];
function hook(t) { const rw = win(t, 1.2, 1.9), dark = 1 - E.io(rw);
  const hit = HOOK_K.reduce((a, k0) => { const h = AK.impact(t, k0, { amp: 22, squash: .04, dur: .22, dec: 12 }); return { dx: a.dx + h.dx, dy: a.dy + h.dy * .4, sx: a.sx * h.sx, sy: a.sy * h.sy }; }, { dx: 0, dy: 0, sx: 1, sy: 1 });
  hallway(t, { dark, hit: t < 1.2 ? hit : undefined, beamJit: Math.sin(t * 23) * 8 + shakeAt(t, HOOK_K.map(k => [k, 12, .25]))[0] });
  if (t < 1.2) for (const k0 of HOOK_K) { const a = 1 - (t - k0) / .7; if (t >= k0 && a > 0) { ctx.save(); ctx.globalAlpha = a; AK.dust(t, k0, 570, 360, { w: .16, rgb: '170,160,140', n: 6, seed: Math.floor(k0 * 100) }); ctx.restore(); } }
  if (rw > 0 && rw < 1) { const a = Math.sin(rw * Math.PI), r = seeded(Math.floor(t * 30) + 3); for (let i = 0; i < 7; i++) { const y = (r() * H + t * 5000) % H; ctx.fillStyle = `rgba(230,236,255,${.3 * a})`; ctx.fillRect(-100, y, W + 200, 8 + r() * 40); }
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = 'rgba(11,16,32,.55)'; circle(CXC, 880, 190); ctx.fill(); txt('◀◀', CXC - 6, 885, 190, T.text, { align: 'center' }); ctx.restore(); }
  if (t > 1.9) warmWash(.2); }
// ───── 2. Угол сталинки снизу вверх: высота, таблички по наклону стен ─────
function facadeV(t) { LIGHT.dark = 0; nightSky(t);
  const face = (side, col) => { ctx.save(); const sh = side < 0 ? .2 : -.2; ctx.transform(1, sh, 0, 1, 540, 0); ctx.fillStyle = col; const x0 = side < 0 ? -700 : 0, x1 = side < 0 ? 0 : 700; ctx.fillRect(x0, 200, x1 - x0, 2000);
    ctx.fillStyle = 'rgba(30,20,15,.25)'; for (let i = 0; i < 16; i++) ctx.fillRect(x0, 1250 + i * 60, x1 - x0, 3); // руст первого этажа
    for (let f = 0; f < 6; f++) for (let c = 0; c < 4; c++) { const wx = (side < 0 ? -640 : 70) + c * 150, wy = 260 + f * 170; if (wy > 1080) continue; const on = seeded(f * 9 + c + (side < 0 ? 5 : 50))() > .22;
      ctx.fillStyle = C('#4C3C2E'); rr(wx - 10, wy - 10, 100, 140, f === 4 ? 50 : 5); ctx.fill(); ctx.fillStyle = on ? '#F2B33D' : '#141a2c'; rr(wx, wy, 80, 120, f === 4 ? 40 : 3); ctx.fill(); if (on) { ctx.fillStyle = 'rgba(150,60,40,.45)'; ctx.fillRect(wx, wy + 4, 18, 116); ctx.fillRect(wx + 62, wy + 4, 18, 116); }
      ctx.strokeStyle = 'rgba(30,20,20,.6)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(wx + 40, wy); ctx.lineTo(wx + 40, wy + 120); ctx.stroke(); ctx.fillStyle = C('#B8A487'); ctx.fillRect(wx - 12, wy + 124, 104, 10); }
    ctx.fillStyle = C('#9C8468'); ctx.fillRect(x0, 160, x1 - x0, 60); ctx.fillStyle = C('#5E4C3A'); ctx.fillRect(x0, 210, x1 - x0, 14); ctx.restore(); };
  face(-1, '#7E654D'); face(1, '#5E4A38'); for (let i = 0; i < 9; i++) glow(i % 2 ? 300 : 800, 300 + i * 100, 160, 'rgba(242,179,61,.08)');
  ctx.fillStyle = '#3A3F4A'; ctx.fillRect(534, 0, 14, H); // угол-водосток
  const plate = (cx, cy, w, h, sh, small, big) => { ctx.save(); ctx.translate(cx, cy); ctx.transform(1, sh, 0, 1, 0, 0); ctx.fillStyle = 'rgba(0,0,0,.35)'; rr(-w / 2 + 8, -h / 2 + 10, w, h, 10); ctx.fill(); ctx.fillStyle = '#1F4E8C'; rr(-w / 2, -h / 2, w, h, 10); ctx.fill(); ctx.strokeStyle = '#F4F1EA'; ctx.lineWidth = 6; rr(-w / 2 + 10, -h / 2 + 10, w - 20, h - 20, 6); ctx.stroke();
    txt(small, 0, -h / 2 + 48, 34, '#F4F1EA', { align: 'center', weight: 800 }); const fs = fitFont(big, w - 90, 74, 40, 900); txt(big, 0, 30, fs, '#F4F1EA', { align: 'center' }); ctx.restore(); };
  plate(330, 860, 340, 190, .2, 'ПРОСПЕКТ', 'АБАЯ'); plate(770, 860, 420, 190, -.2, 'УЛИЦА', 'БАЙТУРСЫНОВА');
  ctx.fillStyle = '#20232c'; ctx.fillRect(-100, 1500, W + 200, 500); streetLamp(950, 1560, 560, 1); ctx.fillStyle = '#2B2016'; ctx.fillRect(14, 1300, 32, 400); const r = seeded(7); for (let i = 0; i < 40; i++) leaf(20 + (r() - .5) * 260, 1180 + r() * 300, 1.8, r() * 6, ['#E8A42A', '#D9782A', '#F2C14E'][i % 3]);
  fallingLeaves(t, 8, 5, { s: 1.5, area: [0, 1080, 300, 1900] }); warmWash(.14); }
// ───── кухня: кто где ─────
const POS = { beka: [540, 1000, 1.0], dias: [880, 930, 1.0], alik: [235, 985, .95] };
function threeAtTable(t, o = {}) { const { on = 1, swing = 0, jump = [0, 0, 0], cupJ = 0, duck = 0, look = null, pour = 0, take = 0, outfit = 'diasT', emote = 0, phones = 0 } = o;
  kitchen(t, { on, swing, tvOn: o.tvOn || 0, tvDraw: o.tvDraw, routerLost: o.routerLost });
  const lk = look || { beka: [0, .4], dias: [-.6, .3], alik: [-.9, 0] }, base = { brow: duck ? 1 : 0, wide: duck ? 1.3 : 1, duck };
  bust(...POS.alik, t, 'alik', { ...base, part: 'body', look: lk.alik, under: phones * .8 }); bust(...POS.beka, t, 'beka', { ...base, part: 'body', look: lk.beka, smile: .5, under: phones * .8 }); bust(...POS.dias, t, outfit, { ...base, part: 'body', look: lk.dias, smile: .4, under: phones * .8 });
  oilcloth(1170); const bx = [lerp(400, 300, E.io(take)), 540, lerp(680, 800, E.io(take))];
  doshirak(bx[0], 1250 - jump[0], .8, t, { open: pour > .2, steam: pour > .3 ? 1 : 0 }); doshirak(bx[1], 1235 - jump[1], .8, t, { open: pour > .5, steam: pour > .6 ? 1 : 0 }); doshirak(bx[2], 1250 - jump[2], .8, t, { open: pour > .8, steam: pour > .9 ? 1 : 0 });
  cupTea(210, 1255 - cupJ, .55, t, cupJ ? 1 : 0); iron(900, 1230 - jump[2] * .6, .7, -.1, { on: on > 0, t }); shirtOnTable(860, 1270, .7);
  const kt = pour > 0 && pour < 1; bust(...POS.beka, t, 'beka', { part: 'arms', armL: { to: [430, 1190] }, armR: kt ? { to: [lerp(330, 760, pour), 1060], flip: 1 } : { to: [600, 1200] },
    holdR: kt ? (x, y) => { kettle(x + 20, y - 40, .9, -.9); ctx.strokeStyle = 'rgba(220,235,255,.8)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x - 70, y - 60); ctx.quadraticCurveTo(x - 80, y + 20, bx[Math.min(2, Math.floor(pour * 3))], 1180); ctx.stroke(); } : (phones ? (x, y) => phoneObj(x, y - 30, 1, 0, { screen: 1 }) : null), gripR: 1 });
  bust(...POS.alik, t, 'alik', { part: 'arms', armL: [.25, -.3], armR: { to: [bx[0] + 30, 1200] }, gripR: take > .5 ? 1 : 0, holdR: phones ? (x, y) => phoneObj(x, y - 30, 1, 0, { screen: 1 }) : null });
  bust(...POS.dias, t, outfit, { part: 'arms', armL: { to: [bx[2] - 20, 1200] }, armR: { to: [960, 1180] }, gripL: take > .5 ? 1 : 0, holdL: phones ? (x, y) => phoneObj(x, y - 30, 1, 0, { screen: 1 }) : null });
  if (emote) { FX.emote(t, emote, '!', 120, 690, 1); FX.emote(t, emote + .1, '!', 980, 620, 1); }
  if (on > 0) warmWash(.12 * on); }
// ───── 4. Сплит-экран «каждый занят своим»: три узкие панели как в комиксе ─────
function splitBusy(t) { LIGHT.dark = 0; ctx.fillStyle = '#F4F1EA'; ctx.fillRect(-100, -100, W + 200, H + 200); const P = [[60, 'alik'], [390, 'beka'], [720, 'diasT']];
  P.forEach(([px, who], i) => { const k = E.out(win(t, 7.9 + i * .1, 8.2 + i * .1)); if (k <= 0) return; ctx.save(); ctx.translate(0, (1 - k) * 60); ctx.globalAlpha = k; ctx.beginPath(); rr(px, 430, 300, 690, 14); ctx.clip();
    const g = ctx.createLinearGradient(0, 430, 0, 1120); g.addColorStop(0, '#E2C99C'); g.addColorStop(1, '#C9AD80'); ctx.fillStyle = g; ctx.fillRect(px, 430, 300, 690);
    if (who === 'alik') { ctx.fillStyle = '#EDF3FF'; ctx.fillRect(px, 470, 110, 220); glow(px + 40, 600, 260, 'rgba(127,179,255,.35)'); const f = (Math.sin(t * 2.4) + 1) / 2;
      bust(px + 190, 900, 1.05, t, 'alik', { look: [-.9, 0], noArms: 1, mouth: f > .8 ? .4 : 0 }); doshirak(px + 120, 1080 - f * 120, .55, t, { fork: 1 }); }
    if (who === 'beka') { bust(px + 150, 930, 1.0, t, 'beka', { look: [0, .9], part: 'body', smile: .6, under: .7 }); bust(px + 150, 930, 1.0, t, 'beka', { part: 'arms', armL: [.3, -.2], armR: { to: [px + 170, 1030] }, holdR: (x, y) => { phoneObj(x, y - 20, 1, 0, { screen: 1 }); }, gripR: 1 });
      ctx.fillStyle = 'rgba(244,241,234,.9)'; ctx.fillRect(px + 160 + Math.sin(t * 8) * 6, 990, 8, 30); }
    if (who === 'diasT') { const sw = Math.sin(t * 3.2); bust(px + 170, 900, 1.0, t, 'diasT', { look: [-.3, .8], part: 'body' }); shirtOnTable(px + 140, 1060, .6); iron(px + 140 + sw * 50, 1040, .55, 0, { steamK: 1, t }); bust(px + 170, 900, 1.0, t, 'diasT', { part: 'arms', armL: [.3, -.3], armR: { to: [px + 150 + sw * 50, 1010] }, gripR: 1 }); }
    ctx.restore(); ctx.strokeStyle = '#0B1020'; ctx.lineWidth = 8; rr(px, 430 + (1 - k) * 60, 300, 690, 14); ctx.stroke(); }); }
// ───── 5. Алихан у компьютера ─────
function alikPC(t) { LIGHT.dark = 0; const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#E2C99C'); g.addColorStop(1, '#C9AD80'); ctx.fillStyle = g; ctx.fillRect(-200, -200, W + 400, H + 400);
  bust(880, 900, .8, t, 'beka', { look: [0, .9], part: 'body', under: .6 }); bust(880, 900, .8, t, 'beka', { part: 'arms', armL: [.3, -.2], armR: { to: [900, 990] }, holdR: (x, y) => phoneObj(x, y - 20, .8, 0, { screen: 1 }), gripR: 1 }); dimAll(.12);
  ctx.fillStyle = '#1A1C22'; rr(40, 470, 520, 360, 16); ctx.fill(); ctx.fillStyle = '#EDF3FF'; rr(60, 490, 480, 320, 8); ctx.fill(); ctx.fillStyle = '#2E5AA8'; ctx.fillRect(90, 520, 230, 22); ctx.fillStyle = 'rgba(30,40,70,.45)'; for (let i = 0; i < 9; i++) ctx.fillRect(90, 570 + i * 26, 380 - (i % 3) * 70, 10); ctx.fillStyle = 'rgba(229,56,59,.7)'; ctx.fillRect(90, 570 + 5 * 26, 150, 10); ctx.fillStyle = '#1A1C22'; ctx.fillRect(280, 830, 40, 60);
  glow(300, 650, 520, 'rgba(127,179,255,.3)'); ctx.fillStyle = '#6B4A32'; ctx.fillRect(-100, 1090, 900, 30);
  const f = ((t - 10.3) * .8) % 1, up = Math.sin(f * Math.PI), m = mouthOf(t, 'a01');
  bust(660, 1080, 1.55, t, 'alik', { look: [-.85, -.05], brow: -.5, mouth: m > .05 ? m : (up > .9 ? .35 : 0), part: 'body', under: .5 });
  doshirak(470, 1180, .9, t, {}); bust(660, 1080, 1.55, t, 'alik', { part: 'arms', armL: { to: [lerp(470, 520, up), lerp(1180, 1000, up)] }, armR: { to: [600 + Math.sin(t * 20) * 6, 1190] }, gripL: 1,
    holdL: (x, y) => { ctx.fillStyle = '#C9CDD6'; ctx.save(); ctx.translate(x, y); ctx.rotate(-1.2); ctx.fillRect(-4, -110, 8, 110); ctx.restore(); if (up > .5) { ctx.strokeStyle = '#E9C46A'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x - 60, y - 60); ctx.quadraticCurveTo(x - 70, y - 20, x - 50, y + 10); ctx.stroke(); } } });
  ctx.fillStyle = '#2a2c34'; rr(330, 1105, 260, 24, 6); ctx.fill(); warmWash(.12); }
// ───── 6. Диас гладит рубашку, телефон вибрирует ─────
function diasIron(t) { LIGHT.dark = 0; kitchen(t, { pc: 0 }); const sw = Math.sin((t - 14) * 3.4), buzz = t > 14.9 && t < 15.7 ? Math.sin(t * 90) * 5 : 0, turn = E.out(win(t, 15.1, 15.4));
  bust(560, 1060, 1.5, t, 'diasT', { look: [lerp(-.2, .7, turn), .7], part: 'body', smile: .5 }); oilcloth(1260, { x0: 60, x1: 1020 }); shirtOnTable(470, 1340, 1.2);
  phoneObj(870 + buzz, 1330, 1.3, 1.57, { screen: t > 14.9 ? 1 : 0 }); if (t > 14.9 && t < 15.8) glow(870, 1330, 140, 'rgba(127,179,255,.5)');
  iron(460 + sw * 120, 1310, 1.1, 0, { steamK: 1, t }); bust(560, 1060, 1.5, t, 'diasT', { part: 'arms', armL: { to: [250, 1330] }, armR: { to: [470 + sw * 120, 1260] }, gripR: 1 }); warmWash(.12); }
// ───── лицо Диаса с телефоном: экран отражается в очках ─────
function diasFace(t, { outfit = 'dias', mood = 0, smile = .5, look = [0, .55], lit = 1, dark = 0, mouth = 0, toEar = 0, eyesClosed = 0 } = {}) { LIGHT.dark = dark;
  cam(1.6, 540, 500, () => kitchen(t, { on: 1 - dark })); dimAll(.15 + dark * .6);
  const lens = (cx, cy, gw, gh) => { ctx.fillStyle = `rgba(127,179,255,${.55 * lit})`; ctx.fillRect(cx - gw * .3, cy - gh * .2, gw * .5, gh * .7); ctx.fillStyle = `rgba(255,255,255,${.6 * lit})`; ctx.fillRect(cx - gw * .22, cy - gh * .05, gw * .3, gh * .08); ctx.fillRect(cx - gw * .22, cy + gh * .12, gw * .22, gh * .08); };
  bust(540, 1190, 2.55, t, outfit, { noArms: 1, look, brow: mood, wide: mood > .5 ? 1.25 : 1, smile, mouth, under: lit * .85, underRgb: '127,179,255', lens, blink: eyesClosed ? 0 : undefined });
  if (toEar > 0) { const k = E.out(toEar); ctx.fillStyle = C('#DCE8F2'); ctx.beginPath(); ctx.moveTo(1150, H); ctx.lineTo(lerp(1150, 860, k), lerp(H, 1100, k)); ctx.lineTo(lerp(1250, 980, k), lerp(H, 1180, k)); ctx.lineTo(1300, H); ctx.fill(); phoneObj(lerp(1000, 800, k), lerp(1460, 820, k), 2.2, -.3, { back: 1 }); drawHand(lerp(1000, 830, k), lerp(1520, 900, k), -2.0, 150, '#E2A97F', { grip: 1 }); }
  if (lit > 0) glow(540, 1500, 500, `rgba(127,179,255,${.3 * lit})`); }
// ───── большой экран телефона: шапка, статус «4G / Wi-Fi», содержимое. В руке, ниже табло ─────
const PB = { x: 190, y: 450, w: 700, h: 1340 };
function phoneBig(t, draw, { lost = false, header = null, sub = null, avatar = '#E8A0B4', time = '20:00' } = {}) { LIGHT.dark = 0;
  ctx.fillStyle = '#C9AD80'; ctx.fillRect(-200, -200, W + 400, H + 400); ctx.save(); ctx.globalAlpha = .6; cam(1.8, 540, 500, () => kitchen(t, { pc: 0 })); ctx.restore(); dimAll(.35);
  ctx.fillStyle = '#0d0f16'; rr(PB.x - 18, PB.y - 18, PB.w + 36, PB.h + 36, 70); ctx.fill(); ctx.save(); rr(PB.x, PB.y, PB.w, PB.h, 56); ctx.clip(); ctx.fillStyle = '#101833'; ctx.fillRect(PB.x, PB.y, PB.w, PB.h);
  txt(time, PB.x + 50, PB.y + 48, 32, 'rgba(244,241,234,.85)', { font: 'JBM', weight: 700 });
  const icon = (x, label) => { txt(label, x, PB.y + 48, 30, lost ? 'rgba(244,241,234,.45)' : '#F4F1EA', { font: 'JBM', weight: 800, align: 'right' }); if (lost) { ctx.strokeStyle = T.danger; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x - 80, PB.y + 64); ctx.lineTo(x + 4, PB.y + 30); ctx.stroke(); } };
  icon(PB.x + PB.w - 170, '4G'); icon(PB.x + PB.w - 50, 'Wi-Fi');
  if (header) { ctx.fillStyle = '#18234a'; ctx.fillRect(PB.x, PB.y + 90, PB.w, 130); ctx.fillStyle = avatar; circle(PB.x + 90, PB.y + 155, 42); ctx.fill(); txt(header[0], PB.x + 90, PB.y + 157, 40, '#0B1020', { align: 'center' }); txt(header, PB.x + 152, PB.y + 140, fitFont(header, PB.w - 180, 44, 30, 900), T.text, { weight: 900 });
    if (sub) txt(sub, PB.x + 152, PB.y + 188, 30, sub.startsWith('Conn') ? '#9DB8E8' : '#7FD0A0', { weight: 700 }); }
  draw(PB.x, PB.y + 230, PB.w, PB.h - 230); ctx.restore();
  // рука: ладонь снизу, пальцы по левому краю (кисть целиком, не «сосиски»)
    ctx.save(); ctx.translate(PB.x - 20, 1000); for (let i = 0; i < 4; i++) { ctx.fillStyle = '#E2A97F'; rr(-50, i * 86, 104, 80, 38); ctx.fill(); if (i) { ctx.fillStyle = 'rgba(120,50,40,.25)'; ctx.fillRect(-40, i * 86 - 3, 80, 3); } } ctx.restore(); }
const thumbTap = (t, taps) => Math.max(0, ...taps.map(tp => Math.sin(clamp((t - tp + .15) / .3) * Math.PI)));
function thumb(t, taps, tx, ty) { const k = thumbTap(t, taps); ctx.fillStyle = '#E2A97F'; ctx.save(); ctx.translate(lerp(PB.x + PB.w + 70, tx + 40, k), lerp(1340, ty + 60, k)); ctx.rotate(-.75); rr(-46, -90, 92, 230, 46); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.35)'; rr(-30, -84, 60, 50, 24); ctx.fill(); ctx.restore();
  for (const tp of taps) { const r = win(t, tp, tp + .35); if (r > 0 && r < 1) { ctx.strokeStyle = `rgba(207,227,255,${1 - r})`; ctx.lineWidth = 5; circle(tx, ty, 20 + r * 70); ctx.stroke(); } } }
function bubble(x, y, w, text, { mine = 0, col, accent = 0, ticks = 0, clock = 0, size = 46, k = 1, icon = null } = {}) { if (k <= 0) return; ctx.save(); ctx.globalAlpha = clamp(k); const fs = fitFont(text, w - 110 - (icon ? 64 : 0) - (ticks || clock ? 60 : 0), size, 44, 800), tw = Math.min(w, ctx.measureText(text).width + 70 + (icon ? 64 : 0) + (ticks || clock ? 60 : 0)), bx = mine ? x + w - tw : x;
  ctx.translate(0, (1 - clamp(k)) * 30); ctx.fillStyle = col || (mine ? '#2f6fd6' : '#24305a'); rr(bx, y, tw, 96, 34); ctx.fill(); txt(text, bx + 34, y + 49, fs, accent ? '#FFD0D0' : T.text, { weight: 800 }); ctx.font = `800 ${fs}px Mont`; let ix = bx + 40 + ctx.measureText(text).width;
  if (icon) { icon(ix + 30, y + 48); ix += 64; } if (ticks) { ctx.strokeStyle = ticks > 1 ? '#7FD0FF' : 'rgba(244,241,234,.8)'; ctx.lineWidth = 5; for (let i = 0; i < ticks; i++) { ctx.beginPath(); ctx.moveTo(ix + 4 + i * 14, y + 52); ctx.lineTo(ix + 14 + i * 14, y + 64); ctx.lineTo(ix + 32 + i * 14, y + 38); ctx.stroke(); } }
  if (clock) { ctx.strokeStyle = 'rgba(244,241,234,.7)'; ctx.lineWidth = 4; circle(ix + 20, y + 50, 14); ctx.stroke(); ctx.beginPath(); ctx.moveTo(ix + 20, y + 50); ctx.lineTo(ix + 20, y + 40); ctx.moveTo(ix + 20, y + 50); ctx.lineTo(ix + 28, y + 54); ctx.stroke(); }
  ctx.restore(); }
const taxiIcon = (x, y) => { ctx.fillStyle = '#F2C14E'; rr(x - 26, y - 6, 52, 22, 8); ctx.fill(); rr(x - 16, y - 20, 32, 18, 6); ctx.fill(); ctx.fillStyle = '#111'; ctx.fillRect(x - 8, y - 28, 16, 8); ctx.fillStyle = '#222'; circle(x - 14, y + 18, 6); ctx.fill(); circle(x + 14, y + 18, 6); ctx.fill(); };
const smileIcon = (x, y) => { ctx.fillStyle = '#FFD23F'; circle(x, y, 20); ctx.fill(); ctx.fillStyle = '#3a2a10'; circle(x - 7, y - 5, 3); ctx.fill(); circle(x + 7, y - 5, 3); ctx.fill(); ctx.strokeStyle = '#3a2a10'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y + 2, 10, .3, Math.PI - .3); ctx.stroke(); };
function chatIn(t) { phoneBig(t, (x, y, w) => { bubble(x + 30, y + 40, w - 60, 'Уже в такси', { icon: taxiIcon }); bubble(x + 30, y + 160, w - 60, 'Буду у кафе через 15 мин', { accent: 1, col: '#3a2f62', k: E.out(win(t, 17.7, 17.95)) }); }, { header: 'Аружан', sub: 'в сети', time: '19:59' }); }
function chatSend(t) { const typed = 'Выхожу через 5 минут', n = Math.floor(clamp((t - 19.05) / .6) * typed.length), sent = t > 19.85;
  phoneBig(t, (x, y, w) => { bubble(x + 30, y + 40, w - 60, 'Буду у кафе через 15 мин', { col: '#3a2f62' }); if (sent) bubble(x + 30, y + 160, w - 60, typed, { mine: 1, icon: smileIcon, ticks: t > 20.35 ? 2 : 1, k: E.out(win(t, 19.85, 20.05)) });
    ctx.fillStyle = '#1b2547'; rr(x + 30, y + 470, w - 60, 100, 40); ctx.fill(); if (!sent) txt(typed.slice(0, n) + (Math.floor(t * 4) % 2 ? '|' : ''), x + 66, y + 520, 44, T.text, { weight: 700 }); ctx.fillStyle = '#2f6fd6'; circle(x + w - 90, y + 520, 38); ctx.fill(); }, { header: 'Аружан', sub: 'в сети', time: '20:00' });
  thumb(t, [19.85], PB.x + PB.w - 90, PB.y + 230 + 520); }
function messenger(t) { const lost = t > 33.6, sp = t * 6; phoneBig(t, (x, y, w) => { for (let i = 0; i < 3; i++) { ctx.fillStyle = '#1b2547'; rr(x + 30, y + 30 + i * 230, w - 60, 200, 24); ctx.fill(); ctx.fillStyle = '#2b3a6a'; rr(x + 54, y + 54 + i * 230, 150, 150, 16); ctx.fill(); ctx.fillStyle = 'rgba(244,241,234,.25)'; for (let j = 0; j < 3; j++) ctx.fillRect(x + 230, y + 70 + i * 230 + j * 40, 300 - j * 60, 18); }
    ctx.fillStyle = 'rgba(16,24,51,.85)'; ctx.fillRect(x, y + 260, w, 200); ctx.save(); ctx.translate(x + 110, y + 360); ctx.rotate(sp); for (let i = 0; i < 8; i++) { ctx.rotate(Math.PI / 4); ctx.fillStyle = `rgba(127,179,255,${(i + 1) / 8})`; rr(-5, -34, 10, 18, 5); ctx.fill(); } ctx.restore();
    txt('Connecting' + '...'.slice(0, 1 + Math.floor(t * 3) % 3), x + 170, y + 362, 52, '#CFE3FF', { weight: 800 }); }, { header: 'АЛМАТЫ СЕЙЧАС', sub: 'Connecting…', avatar: '#E5383B', lost, time: '20:01' }); thumb(t, [33.5, 34.2], PB.x + 350, PB.y + 600); }
function chatFail(t) { const fail = t > 38.4; phoneBig(t, (x, y, w) => { bubble(x + 30, y + 40, w - 60, 'Ты где? Ответь', { mine: 1, clock: 1, k: E.out(win(t, 37.3, 37.5)) }); if (fail) { const a = E.out(win(t, 38.4, 38.65)); ctx.globalAlpha = a; ctx.fillStyle = T.danger; circle(x + w - 70, y + 196, 22); ctx.fill(); txt('!', x + w - 70, y + 198, 34, '#fff', { align: 'center' }); txt('Не доставлено', x + w - 110, y + 198, 50, T.danger, { align: 'right', weight: 900 }); ctx.globalAlpha = 1; } }, { header: 'Аружан', sub: 'Connecting…', lost: true, time: '20:01' }); thumb(t, [37.3], PB.x + PB.w - 90, PB.y + 750); }
function callScreen(t) { const noNet = t > 41.1; phoneBig(t, (x, y, w) => { ctx.fillStyle = '#E8A0B4'; circle(x + w / 2, y + 230, 130); ctx.fill(); txt('А', x + w / 2, y + 236, 120, '#0B1020', { align: 'center' }); txt('Аружан', x + w / 2, y + 450, 64, T.text, { align: 'center' });
    if (!noNet) txt('Вызов' + '...'.slice(0, 1 + Math.floor(t * 3) % 3), x + w / 2, y + 540, 50, '#9DB8E8', { align: 'center', weight: 800 }); else txt('Нет сети', x + w / 2, y + 540, 56, T.danger, { align: 'center' });
    ctx.fillStyle = '#E5383B'; circle(x + w / 2, y + 760, 60); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(x + w / 2, y + 780, 30, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); }, { lost: true, time: '20:01' }); }
// ───── 9. Предвестие: рябь в чашке, вилка дрожит о коробку, календарь на стене ─────
function rippleCup(t) { LIGHT.dark = 0; const k = win(t, 22.0, 25.0), j = Math.sin(t * 70) * 3 * k; const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#E2C99C'); g.addColorStop(1, '#C9AD80'); ctx.fillStyle = g; ctx.fillRect(-200, -200, W + 400, H + 400);
  ctx.save(); ctx.translate(Math.sin(t * 50) * 4 * k, 0); ctx.fillStyle = '#F4F1EA'; ctx.fillRect(660, 450, 260, 270); ctx.fillStyle = '#C8372E'; ctx.fillRect(660, 450, 260, 74); txt('НОЯБРЬ', 790, 488, 44, '#fff', { align: 'center' }); ctx.fillStyle = 'rgba(30,30,40,.25)'; for (let i = 0; i < 15; i++) ctx.fillRect(676 + (i % 5) * 48, 545 + Math.floor(i / 5) * 56, 32, 28); ctx.restore(); // календарь дрожит
  for (let i = 0; i < 5; i++) { ctx.strokeStyle = `rgba(90,60,40,${.14 * k})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 340 + i * 22); for (let x = 0; x < 1080; x += 40) ctx.lineTo(x, 340 + i * 22 + Math.sin(t * 40 + i + x * .02) * 6 * k); ctx.stroke(); } // вибрация по стене
  oilcloth(760, { x0: -40, x1: 1120, drop: 1200 }); doshirak(720 + j, 1000, 1.9, t, { fork: k * 1.5 }); cupTea(330, 1010 + j * .5, 1.9, t, .3 + .7 * k); warmWash(.12); }
// ───── 10. Истребитель над крышами: окна светятся, без тени ─────
function jetSky(t) { LIGHT.dark = 0; nightSky(t, { cityGlow: 1.2 }); const k = win(t, 25.1, 26.7), jx = lerp(-520, 1600, k), jy = lerp(1350, 150, k); const VP = [540, -2200];
  const side = (xb0, xb1, ytop, col) => { const at = (xb, y) => xb + (VP[0] - xb) * (H + 100 - y) / (H + 100 - VP[1]); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(xb0, H + 100); ctx.lineTo(at(xb0, ytop), ytop); ctx.lineTo(at(xb1, ytop), ytop); ctx.lineTo(xb1, H + 100); ctx.fill();
    for (let r = 0; r < 7; r++) for (let c = 0; c < 3; c++) { const y = 1750 - r * 190, x = lerp(xb0, xb1, (c + .5) / 3); if (y - 120 < ytop) continue; const on = seeded(r * 9 + c + xb0)() > .15; const px = at(x, y); ctx.fillStyle = on ? '#F2B33D' : '#141a2c'; rr(px - 34, y - 110, 68, 100, 4); ctx.fill(); if (on) glow(px, y - 60, 90, 'rgba(242,179,61,.18)'); }
    ctx.fillStyle = mix(col, '#ffffff', .12); ctx.beginPath(); ctx.moveTo(at(xb0, ytop) - 20, ytop - 30); ctx.lineTo(at(xb1, ytop) + 20, ytop - 30); ctx.lineTo(at(xb1, ytop), ytop); ctx.lineTo(at(xb0, ytop), ytop); ctx.fill(); };
  side(-300, 380, 520, '#6E5946'); side(720, 1380, 620, '#5A4838');
  for (let i = 0; i < 6; i++) { ctx.strokeStyle = `rgba(220,225,255,${.14 * Math.sin(k * Math.PI)})`; ctx.lineWidth = 3; ctx.beginPath(); const oy = (i - 3) * 50; ctx.moveTo(jx - 330, jy + oy + 180); ctx.lineTo(jx - 950, jy + oy + 520); ctx.stroke(); }
  fighter(jx, jy, lerp(.95, 1.35, Math.sin(k * Math.PI)), -.5, t); warmWash(.1); }
// ───── 12. Диас застыл с утюгом, воротник наполовину расстёгнут ─────
function diasFrozen(t) { LIGHT.dark = 0; cam(1.4, 540, 600, () => kitchen(t, { swing: .12 * Math.sin(t * 5) * Math.exp(-(t - 29) * .8) })); dimAll(.08); const m = mouthOf(t, 'd01');
  bust(540, 1150, 2.0, t, 'dias', { look: [-.3, -.6], brow: 1, wide: 1.35, mouth: Math.max(m, .15), part: 'body' });
  bust(540, 1150, 2.0, t, 'dias', { part: 'arms', armL: [.3, -.25], armR: { to: [870, 1110], flip: 1 }, gripR: 1, holdR: (x, y) => { iron(x + 50, y - 20, .9, -.4, { steamK: .6, t }); } }); FX.emote(t, 29.15, '!', 230, 640, 1.2); warmWash(.12); }
// ───── 13. Бека хватает телефон; роутер на полке мигает красным ─────
function bekaPhone(t) { LIGHT.dark = 0; cam(1.3, 760, 600, () => kitchen(t, { routerLost: t > 32.8, pc: 0 })); dimAll(.06); const up = E.out(win(t, 31.05, 31.4)), m = mouthOf(t, 'b01');
  bust(470, 1150, 1.75, t, 'beka', { look: [.1, lerp(.6, .4, up)], brow: .6, mouth: m, part: 'body', under: up * .7 }); bust(470, 1150, 1.75, t, 'beka', { part: 'arms', armL: [.3, -.3], armR: { to: [lerp(640, 720, up), lerp(1380, 1170, up)] }, gripR: 1, holdR: (x, y) => phoneObj(x - 10, y - 50, 1.6, -.1, { screen: 1 }) });
  if (t > 32.8) FX.emote(t, 32.85, '?', 900, 560, .9, 1.4); warmWash(.12); }
// ───── 17. Телевизор на полке: Алихан с пульта; ЖК включается без «кинескопа» ─────
function newsContent(t, x, y, w, h, { frozen = -1, normal = 0, stumble = 0 } = {}) { const tt = frozen > 0 ? frozen : t, s = h / 560;
  if (normal) { const g = ctx.createLinearGradient(x, y, x, y + h); g.addColorStop(0, '#F2C14E'); g.addColorStop(1, '#E07A2A'); ctx.fillStyle = g; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#7A3E22'; rr(x + w * .1, y + h * .62, w * .8, h * .12, 10); ctx.fill(); ctx.fillStyle = '#C9CDD6'; rr(x + w * .35, y + h * .38, w * .3, h * .24, 20); ctx.fill(); for (let i = 0; i < 3; i++) AK.puff(x + w * .5 + i * 20, y + h * (.3 - i * .06), 40 * s, '255,255,255', .4); return; } // кулинарное шоу
  const g = ctx.createLinearGradient(x, y, x, y + h); g.addColorStop(0, '#13265a'); g.addColorStop(1, '#0a1433'); ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  for (let i = 0; i < 8; i++) { ctx.lineWidth = 3 * s; ctx.strokeStyle = 'rgba(127,179,255,.10)'; ctx.beginPath(); ctx.arc(x + w * .8, y + h * .35, (60 + i * 40) * s, 0, Math.PI * 2); ctx.stroke(); }
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); const pd = LIGHT.dark; LIGHT.dark = 0;
  bust(x + w * .5, y + h * .64, 1.15 * s, tt, 'anchor', { noArms: 1, mouth: anchorMouth(tt), look: [stumble ? -.8 : 0, 0], smile: .1, brow: stumble ? .7 : 0 });
  if (stumble) { const k = E.out(win(tt, 57.8, 58.3)); ctx.fillStyle = '#F4F1EA'; ctx.save(); ctx.translate(x - 40 * s + k * 200 * s, y + h * .78); ctx.rotate(-.2); ctx.fillRect(0, 0, 180 * s, 120 * s); ctx.restore(); drawHand(x - 60 * s + k * 200 * s, y + h * .85, -.2, 80 * s, '#D9A07A'); }
  LIGHT.dark = pd; ctx.fillStyle = '#C8262B'; ctx.fillRect(x, y + h - 160 * s, w * .82, 78 * s); txt('ЭКСТРЕННЫЙ ВЫПУСК', x + 34 * s, y + h - 121 * s, fitFont('ЭКСТРЕННЫЙ ВЫПУСК', w * .82 - 68 * s, 50 * s, 20, 900), '#fff');
  ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 6 * s; ctx.beginPath(); ctx.arc(x + 70 * s, y + 66 * s, 28 * s, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x + 50 * s, y + 70 * s); ctx.quadraticCurveTo(x + 70 * s, y + 46 * s, x + 90 * s, y + 70 * s); ctx.stroke();
  ctx.fillStyle = '#C8262B'; ctx.globalAlpha = .5 + .5 * Math.sin(tt * 6); circle(x + w - 60 * s, y + 60 * s, 14 * s); ctx.fill(); ctx.globalAlpha = 1; ctx.restore(); }
const TVF = { x: 90, y: 520, w: 900, h: 506 }; // телевизор целиком в кадре
function backHead(x, y, s, who, { rim = 0 } = {}) { const c = CAST[who], R = 95 * s, sw = 125 * s * c.sh; ctx.fillStyle = C(mix(c.top, '#000000', .35)); ctx.beginPath(); ctx.moveTo(x - sw * 1.1, y + 600 * s); ctx.lineTo(x - sw, y + 60 * s); ctx.quadraticCurveTo(x, y - 20 * s, x + sw, y + 60 * s); ctx.lineTo(x + sw * 1.1, y + 600 * s); ctx.fill();
  const hy = y - R * (c.neck + c.hh * .9); ctx.fillStyle = C(mix(c.hair, '#000000', .2)); ctx.beginPath(); ctx.ellipse(x, hy, R * c.hw, R * c.hh, 0, 0, Math.PI * 2); ctx.fill();
  if (c.style === 'curly') for (let i = 0; i < 12; i++) { circle(x + Math.cos(i * .52) * R * c.hw, hy + Math.sin(i * .52) * R * c.hh * .9, R * .22); ctx.fill(); }
  if (c.glasses) { ctx.strokeStyle = C('#3A2A22'); ctx.lineWidth = 8 * s; ctx.beginPath(); ctx.moveTo(x - R * c.hw, hy); ctx.lineTo(x - R * c.hw - 10 * s, hy + 6 * s); ctx.moveTo(x + R * c.hw, hy); ctx.lineTo(x + R * c.hw + 10 * s, hy + 6 * s); ctx.stroke(); }
  if (rim > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(127,179,255,${.55 * rim})`; ctx.lineWidth = 8 * s; ctx.beginPath(); ctx.ellipse(x, hy, R * c.hw, R * c.hh, 0, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); ctx.restore(); } }
function tvWall(t, draw, { on = 1, remote = 0, faces = 0 } = {}) { LIGHT.dark = 0; const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#E2C99C'); g.addColorStop(1, '#C9AD80'); ctx.fillStyle = g; ctx.fillRect(-200, -200, W + 400, H + 400);
  ctx.fillStyle = '#8A6A4A'; ctx.fillRect(40, TVF.y + TVF.h + 40, 1000, 26); router(880, TVF.y - 60, .8, t, t > 33.6); tvSet(TVF.x, TVF.y, TVF.w, TVF.h, draw, { on }); dimAll(.08);
  if (remote > 0) { const k = E.out(remote); ctx.fillStyle = '#A8432C'; ctx.beginPath(); ctx.moveTo(-60, H + 50); ctx.lineTo(lerp(-60, 260, k), lerp(1700, 1290, k)); ctx.lineTo(lerp(40, 350, k), lerp(1760, 1340, k)); ctx.lineTo(160, H + 50); ctx.fill(); const hx = lerp(0, 300, k), hy = lerp(1650, 1250, k); ctx.fillStyle = '#1a1b22'; ctx.save(); ctx.translate(hx + 60, hy - 70); ctx.rotate(.5); rr(-22, -80, 44, 130, 12); ctx.fill(); ctx.fillStyle = T.danger; circle(0, -62, 6); ctx.fill(); ctx.restore(); drawHand(hx, hy, -1.0, 120, '#E6B48C', { grip: 1 }); watchOnWrist(hx - 70, hy + 70, -1.0, 60, 'mech'); }
  if (faces) { backHead(200, 1840, 1.6, 'beka', { rim: on }); backHead(880, 1860, 1.6, 'dias', { rim: on }); } warmWash(.1); }
function tvOnShot(t) { const on = t > 44.25, mode = t < 44.85 ? 'normal' : 'news'; tvWall(t, (x, y, w, h) => { const bl = E.out(win(t, 44.25, 44.4)); ctx.globalAlpha = bl; newsContent(t, x, y, w, h, { normal: mode === 'normal' }); ctx.globalAlpha = 1; if (mode === 'news' && t < 44.95) { ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(x, y, w, h); } }, { on: on ? 1 : 0, remote: win(t, 44.0, 44.2), faces: 1 }); }
// ───── 18. Кадры очевидцев в ТВ: вертикальное видео с размытыми полями ─────
function footage(t, x, y, w, h, kind) { const hx = Math.sin(t * 9) * 6 + Math.sin(t * 23) * 3, hy = Math.cos(t * 7) * 5, blue = Math.sin(t * 12) > 0, fw = h * .62, fx = x + (w - fw) / 2;
  ctx.fillStyle = '#0a0d18'; ctx.fillRect(x, y, w, h); ctx.save(); ctx.globalAlpha = .35; ctx.fillStyle = blue ? '#1a3a8a' : '#6a1a1a'; ctx.fillRect(x, y, w, h); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(fx, y, fw, h); ctx.clip(); ctx.translate(hx, hy); ctx.fillStyle = '#0d1020'; ctx.fillRect(fx - 20, y - 20, fw + 40, h + 40);
  for (let i = 0; i < 6; i++) { const bx = fx - 40 + i * fw / 4.5, bh = h * (.45 + (i % 3) * .12); ctx.fillStyle = '#151a2e'; ctx.fillRect(bx, y + h - bh, fw / 4.6, bh); ctx.beginPath(); ctx.moveTo(bx, y + h - bh); ctx.lineTo(bx + fw / 9.2, y + h - bh - 40); ctx.lineTo(bx + fw / 4.6, y + h - bh); ctx.fill(); }
  if (kind === 'fire') { glow(fx + fw * .6, y + h * .55, fw * .7, 'rgba(255,120,40,.55)'); for (let i = 0; i < 5; i++) AK.puff(fx + fw * .6 + Math.sin(t + i) * 30, y + h * .4 - ((t * 40 + i * 30) % 120), 50 + i * 10, '60,50,55', .5); for (let i = 0; i < 4; i++) passer(fx + 30 + ((t * 120 + i * 90) % (fw + 60)) - 30, y + h * .95, .55, t, { pose: 'walk', col: '#0a0a12', skin: '#0a0a12', seed: i }); }
  else { ctx.fillStyle = '#1e2233'; ctx.fillRect(fx, y + h * .78, fw, h * .22); ctx.fillStyle = '#2a2f44'; rr(fx + fw * .15, y + h * .66, fw * .5, h * .14, 10); ctx.fill(); ctx.fillStyle = blue ? '#3a6bff' : '#ff3a3a'; rr(fx + fw * .32, y + h * .62, fw * .14, h * .05, 6); ctx.fill(); glow(fx + fw * .39, y + h * .64, fw * .6, blue ? 'rgba(60,110,255,.6)' : 'rgba(255,60,60,.6)');
    for (let i = 0; i < 4; i++) { ctx.fillStyle = i % 2 ? '#E5383B' : '#F4F1EA'; ctx.fillRect(fx + fw * .62 + i * 22, y + h * .8, 22, 16); } }
  ctx.restore(); ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 3; ctx.strokeRect(fx, y, fw, h); ctx.fillStyle = '#C8262B'; circle(fx + 30, y + 30, 9); ctx.fill(); }
function footageShot(t, kind) { tvWall(t, (x, y, w, h) => { footage(t, x, y, w, h, kind); ctx.fillStyle = '#C8262B'; ctx.fillRect(x, y + h - 80, 480, 70); txt('ВИДЕО ОЧЕВИДЦЕВ', x + 26, y + h - 45, 44, '#fff'); }); }
// ───── карта: условные пятна регионов с контуром, 3 подписи на плашках, метка Волгограда, молнии ─────
const REG = [{ id: 'eu', c: [.2, .36], r: [.17, .24], off: 48.4 }, { id: 'sr', c: [.44, .3], r: [.12, .16], off: 47.6 }, { id: 'kv', c: [.4, .66], r: [.09, .1], off: 50.9 }, { id: 'wk', c: [.6, .44], r: [.1, .16], off: 59.9 }];
function BlackoutMap(t, x, y, w, h, { lightning = 0, ticker = 0, front = 0 } = {}) { ctx.fillStyle = '#081633'; ctx.fillRect(x, y, w, h); const P = (u, v) => [x + u * w, y + v * h];
  ctx.fillStyle = '#14234a'; ctx.beginPath(); ctx.moveTo(...P(0, .06)); [[.3, 0], [.6, .07], [1, .03], [1, 1], [.56, 1], [.5, .84], [.42, .93], [.3, .84], [.2, .95], [0, .9]].forEach(p => ctx.lineTo(...P(...p))); ctx.fill();
  for (const R of [...REG, { id: 'ek', c: [.78, .55], r: [.12, .22], off: 999 }]) { const off = t >= R.off, [cx, cy] = P(...R.c), rs = seeded(R.c[0] * 1000 + 3);
    ctx.fillStyle = off ? '#0b1430' : '#1d2c5a'; ctx.beginPath(); for (let i = 0; i <= 12; i++) { const a = i / 12 * Math.PI * 2, rr2 = 1 + .18 * Math.sin(i * 2.7 + R.c[0] * 9); ctx.lineTo(cx + Math.cos(a) * R.r[0] * w * rr2, cy + Math.sin(a) * R.r[1] * h * rr2); } ctx.closePath(); ctx.fill(); ctx.strokeStyle = off ? `rgba(229,56,59,${.6 + .4 * Math.sin(t * 8)})` : 'rgba(242,179,61,.5)'; ctx.lineWidth = 5; ctx.stroke();
    for (let i = 0; i < 40; i++) { const a = rs() * 6.28, d = Math.sqrt(rs()) * .85, px = cx + Math.cos(a) * d * R.r[0] * w, py = cy + Math.sin(a) * d * R.r[1] * h; const lit = !off && !(front > 0 && (px - x) / w < front); if (lit) { ctx.fillStyle = `rgba(242,179,61,${.6 + rs() * .4})`; ctx.fillRect(px - 5, py - 5, 10, 10); } } }
  if (front > 0) { const fx = x + front * w, g = ctx.createLinearGradient(fx - 160, 0, fx + 20, 0); g.addColorStop(0, 'rgba(5,7,16,0)'); g.addColorStop(.85, 'rgba(5,7,16,.6)'); g.addColorStop(1, 'rgba(5,7,16,0)'); ctx.fillStyle = g; ctx.fillRect(fx - 160, y, 180, h); }
  const lab = (s, u, v, col = T.text) => { const [lx, ly] = P(u, v); ctx.font = '900 44px Mont'; const tw = ctx.measureText(s).width; ctx.fillStyle = 'rgba(8,12,28,.85)'; rr(lx - tw / 2 - 16, ly - 30, tw + 32, 60, 12); ctx.fill(); txt(s, lx, ly + 2, 44, col, { align: 'center' }); };
  const [vx, vy] = P(.47, .26); ctx.fillStyle = '#fff'; circle(vx, vy, 10); ctx.fill(); lab('ВОЛГОГРАД', .47, .11); lab('ЕВРОПА', .2, .64, t >= 48.4 ? '#ff9a9c' : T.text);
  const [ax, ay] = P(.72, .64); ctx.fillStyle = T.danger; circle(ax, ay, 16 + 6 * Math.sin(t * 10)); ctx.fill(); ctx.strokeStyle = `rgba(229,56,59,${.5 + .5 * Math.sin(t * 10)})`; ctx.lineWidth = 4; circle(ax, ay, 40 + ((t * 60) % 40)); ctx.stroke(); lab('АЛМАТЫ', .72, .8);
  if (lightning > 0) for (const [u, v] of [[.47, .26], [.18, .3]]) { const [lx, ly] = P(u, v); ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(lx, ly, 200, `rgba(185,198,255,${.8 * lightning})`); ctx.strokeStyle = `rgba(230,236,255,${lightning})`; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(lx - 12, ly - 140); ctx.lineTo(lx + 16, ly - 80); ctx.lineTo(lx - 8, ly - 56); ctx.lineTo(lx + 10, ly); ctx.stroke(); ctx.restore(); }
  if (ticker) { ctx.fillStyle = '#C8262B'; ctx.fillRect(x, y + h - 76, w, 76); ctx.save(); ctx.beginPath(); ctx.rect(x, y + h - 76, w, 76); ctx.clip(); const s = '   АНОМАЛЬНЫЕ ГРОЗЫ · ВОЛГОГРАД ·'; ctx.font = '900 46px Mont'; const tw = ctx.measureText(s).width, off = ((t - 52) * 200) % tw; txt(s + s + s, x - off, y + h - 38, 46, '#fff'); ctx.restore(); } }
const flashes = (t, list) => list.reduce((a, l) => Math.max(a, clamp(1 - Math.abs(t - l) / .1)), 0);
function mapShot1(t) { tvWall(t, (x, y, w, h) => BlackoutMap(t, x, y, w, h, { lightning: flashes(t, [52.6, 53.7, 54.6]), ticker: 1 })); }
function mapShot2(t) { tvWall(t, (x, y, w, h) => BlackoutMap(t, x, y, w, h, { front: t > 59.9 ? lerp(.62, .7, E.out(win(t, 60.0, 61.2))) : 0, lightning: flashes(t, [60.4]) })); }
function anchorStumble(t) { tvWall(t, (x, y, w, h) => newsContent(t, x, y, w, h, { stumble: 1 })); }
function reactTV(t) { LIGHT.dark = .2; cam(1.4, 700, 500, () => kitchen(t, { pc: 0 })); dimAll(.35); const fl = Math.sin(t * 9) > .6 ? 1 : .8; glow(540, 700, 900, `rgba(127,179,255,${.25 * fl})`); const turn = E.out(win(t, 55.9, 56.3));
  bust(330, 1180, 1.5, t, 'beka', { look: [.2, -.05], brow: 1, wide: 1.25, under: .5, noArms: 1 }); bust(760, 1150, 1.65, t, 'dias', { look: [lerp(-.3, .9, turn), lerp(0, -.2, turn)], brow: .9, wide: 1.2, under: .5, noArms: 1 }); }
// ───── 21. ТВ схлопывается в полосу и точку ─────
function tvCollapse(t) { tvWall(t, (x, y, w, h) => { const sq = win(t, 61.3, 61.6), dot = win(t, 61.6, 61.85), fade = win(t, 61.85, 62.1);
  if (sq <= 0) { newsContent(t, x, y, w, h, { frozen: 61.15, stumble: 1 }); const r = seeded(Math.floor(t * 30)); for (let i = 0; i < 5; i++) { const yy = r() * h, hh = 10 + r() * 50; ctx.save(); ctx.beginPath(); ctx.rect(x, y + yy, w, hh); ctx.clip(); newsContent(t, x + (r() - .5) * 140, y, w, h, { frozen: 61.15 }); ctx.restore(); } }
  else { ctx.fillStyle = '#05060a'; ctx.fillRect(x, y, w, h); const lh = lerp(h, 6, E.io(sq)), lw = lerp(w, 10, E.io(dot)); ctx.fillStyle = `rgba(235,242,255,${1 - fade})`; ctx.fillRect(x + w / 2 - lw / 2, y + h / 2 - lh / 2, lw, lh); glow(x + w / 2, y + h / 2, 140, `rgba(200,220,255,${.8 * (1 - fade)})`); } }, { faces: 1 }); }
// ───── 22. Свет гаснет в кухне: монитор, люстра, утюг → только экраны телефонов ─────
function kitchenOut(t) { const u = t - OUT, flick = u < 0 ? (u > -.25 && Math.sin(t * 80) > 0 ? .5 : 1) : 0, phonesK = E.out(win(t, OUT + .5, OUT + 1.1));
  threeAtTable(t, { on: flick, take: 1, outfit: 'dias', look: { beka: [0, .6], dias: [-.3, -.2], alik: [-.9, -.1] }, phones: u > 0 ? phonesK : 0 }); LIGHT.dark = 0;
  if (u >= 0) { dimAll(.88 - phonesK * .1); for (const [x, y] of [[POS.beka[0] + 80, 1110], [POS.alik[0] + 130, 1150], [POS.dias[0] - 140, 1120]]) glow(x, y - 120, 260 * phonesK, `rgba(127,179,255,${.35 * phonesK})`); } }
// ───── 23. Город гаснет: 6 коротких планов ─────
const blackT = { zhk: 64.5, people: 65.55, nt: 66.6, cat: 67.75, kt: 68.75 };
const offTop = (t, t0, f, n, d = .7) => t < t0 + (f / n) * d ? 1 : 0; // окна гаснут сверху вниз по этажам
function cityA(t) { LIGHT.dark = 0; nightSky(t, { cityGlow: t < blackT.zhk ? 1 : .2 }); ridge(1000, t, { amp: 1.2, seed: 33 }); const fl = f => offTop(t, blackT.zhk, f, 16);
  zhk(-40, 1700, 330, 16, t, f => fl(f), { col: '#3E4560', seed: 2, fh: 40 }); zhk(360, 1760, 300, 18, t, f => fl(f), { col: '#4A4E6A', seed: 3, fh: 40 }); zhk(740, 1700, 380, 15, t, f => fl(f), { col: '#3A3F58', seed: 4, fh: 42 });
  for (let i = 0; i < 6; i++) tree(80 + i * 190, 1780, 1.2, t > blackT.zhk ? 1 : 0, i); }
function cityB(t) { LIGHT.dark = 0; const off = t > blackT.people; ctx.fillStyle = off ? '#0e1324' : '#2a2a40'; ctx.fillRect(-200, -200, W + 400, H + 400); zhk(-60, 1300, 1200, 14, t, () => off ? 0 : 1, { col: '#3A3F58', seed: 9, fh: 60 });
  ctx.fillStyle = off ? '#141a2c' : '#3a3a52'; ctx.fillRect(-100, 1300, W + 200, 700); if (!off) streetLamp(100, 1500, 520, 1);
  const k = E.out(win(t, blackT.people + .2, blackT.people + .5)), tk = E.out(win(t, 66.05, 66.3)); const P = [[220, 'look', '#7A4A8A', 0], [420, 'shrug', '#4A6A8A', 0], [620, 'hug', '#8A5A3A', 0], [700, 'look', '#3A7A6A', 1], [880, 'shake', '#6A6A7A', 0]];
  for (const [x, pose, col, child] of P) passer(x, 1650, 2.0, t, { pose: off ? (k > .5 ? pose : 'freeze') : (pose === 'shake' ? 'phone' : 'walk'), col, dark: off ? .6 : 0, child, face: 1, seed: x, torch: off && (x === 420 || x === 880) ? tk : 0 }); }
function cityC(t) { LIGHT.dark = 0; nightSky(t, { cityGlow: t < blackT.nt ? 1 : .2 }); ridge(1080, t, { amp: 1, seed: 12 }); nurlyTau(330, 1650, 1.0, t, (id, f) => offTop(t, blackT.nt, f, 18, .8)); hotelTower(800, 1650, 1.05, t, f => f < 0 ? (t < blackT.nt + .85 ? 1 : 0) : offTop(t, blackT.nt + .1, f, 22, .8), { red: 1 });
  ctx.fillStyle = '#141a2c'; ctx.fillRect(-100, 1650, W + 200, 400); for (let i = 0; i < 7; i++) tree(40 + i * 170, 1700, 1, t > blackT.nt ? 1 : 0, i + 20); }
function cityD(t) { LIGHT.dark = 0; nightSky(t, { cityGlow: .3 }); const k = t < blackT.cat ? 1 : (t < blackT.cat + .2 && Math.sin(t * 70) > 0 ? .5 : 0); cathedral(540, 1560, 1.15, t, k);
  for (const x of [80, 240, 840, 1000]) tree(x, 1640, 1.6, k ? 0 : 1, x); ctx.fillStyle = '#1a1f33'; ctx.fillRect(-100, 1600, W + 200, 400); for (const x of [190, 890]) streetLamp(x, 1700, 420, k); }
function cityE(t) { LIGHT.dark = 0; nightSky(t, { cityGlow: .15 }); const u = t - blackT.kt, red = u < 0 ? (.6 + .4 * Math.sin(t * 4)) : (u < .45 ? (Math.sin(u * 40) > 0 ? 1 : 0) : 0), w2 = u < .2 ? 1 : 0; kokTobe(420, 1700, 1.2, t, w2, red); for (let i = 0; i < 8; i++) tree(i * 150, 1780, 1.1, 1, i + 40); }
function cityF(t) { LIGHT.dark = 0; const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0e1430'); g.addColorStop(.5, '#22305a'); g.addColorStop(1, '#141a32'); ctx.fillStyle = g; ctx.fillRect(-200, -200, W + 400, H + 400);
  glow(820, 420, 200, 'rgba(220,226,255,.25)'); ctx.fillStyle = '#E8ECF6'; circle(820, 420, 40); ctx.fill(); ridge(900, t, { amp: 1.4, seed: 21, moon: 1 });
  ctx.fillStyle = '#0c1122'; for (const [x, w, h] of [[20, 120, 240], [160, 90, 380], [270, 140, 200], [700, 120, 300], [830, 160, 220], [980, 120, 340]]) ctx.fillRect(x, 1000 - h, w, h); ctx.fillRect(-100, 990, W + 200, 1000);
  ctx.save(); ctx.translate(430, 1000); ctx.scale(.45, .45); ctx.fillStyle = '#0c1122'; ctx.fillRect(-170, -560, 130, 560); ctx.fillRect(60, -470, 120, 470); ctx.restore(); // силуэты «Нурлы Тау»
  for (const [x0, y0, x1, y1] of [[540, 1000, -300, 1950], [540, 1000, 540, 1950], [540, 1000, 1400, 1950]]) { ctx.strokeStyle = 'rgba(30,36,60,.9)'; ctx.lineWidth = 30; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    for (let i = 0; i < 2; i++) { const u = ((t * .03 + i / 2 + x1 / 5000) % 1), uu = u * u, px = lerp(x0, x1, uu), py = lerp(y0, y1, uu), sz = 2 + uu * 8; ctx.fillStyle = 'rgba(255,255,240,.95)'; circle(px - sz, py, sz); ctx.fill(); circle(px + sz, py, sz); ctx.fill(); glow(px, py, 30 + uu * 70, 'rgba(255,250,230,.4)'); } } // редкие фары ползут
  const r = seeded(5); for (let i = 0; i < 14; i++) { const x = r() * 1080, y = 1100 + r() * 700; if ((t * 2 + i) % 3 > .4) { glow(x, y, 26, 'rgba(255,248,225,.7)'); ctx.fillStyle = 'rgba(255,250,235,.95)'; circle(x, y, 3); ctx.fill(); } } } // фонарики людей
// ───── 24–25. Диас у окна; вид вниз на проспект, такси с шашечкой ─────
function diasWindow(t) { LIGHT.dark = 1; ctx.fillStyle = '#05070f'; ctx.fillRect(-200, -200, W + 400, H + 400); ctx.save(); rr(140, 300, 800, 900, 8); ctx.clip(); ctx.fillStyle = '#0b1020'; ctx.fillRect(140, 300, 800, 900); ridge(800, t, { amp: .7, moon: .8 }); ctx.fillStyle = '#0c1122'; ctx.fillRect(140, 820, 800, 400); for (let i = 0; i < 3; i++) { const u = (t * .08 + i / 3) % 1; glow(lerp(200, 900, u), 1000 + i * 40, 40, 'rgba(255,250,230,.6)'); } ctx.restore();
  ctx.strokeStyle = '#1a1e2a'; ctx.lineWidth = 22; rr(140, 300, 800, 900, 8); ctx.stroke(); ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(540, 300); ctx.lineTo(540, 1200); ctx.stroke();
  glow(700, 760, 160, 'rgba(255,250,235,.35)'); // блик фонарика в стекле
  bust(360, 1250, 2.0, t, 'dias', { look: [.8, -.1], brow: .9, wide: 1.1, noArms: 1, under: .9, underRgb: '127,179,255', lens: (cx, cy, gw, gh) => { ctx.fillStyle = 'rgba(127,179,255,.5)'; ctx.fillRect(cx - gw * .3, cy - gh * .2, gw * .5, gh * .6); ctx.fillStyle = 'rgba(229,56,59,.8)'; ctx.fillRect(cx - gw * .2, cy + gh * .15, gw * .3, gh * .08); } }); }
function avenuePOV(t) { LIGHT.dark = 0; ctx.fillStyle = '#070a14'; ctx.fillRect(-200, -200, W + 400, H + 400); ctx.fillStyle = '#10152a'; ctx.beginPath(); ctx.moveTo(300, 300); ctx.lineTo(780, 300); ctx.lineTo(1300, H); ctx.lineTo(-220, H); ctx.fill(); // проспект сверху
  ctx.strokeStyle = 'rgba(200,200,220,.12)'; ctx.lineWidth = 6; ctx.setLineDash([40, 50]); ctx.beginPath(); ctx.moveTo(540, 300); ctx.lineTo(540, H); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = '#0a0d1a'; ctx.fillRect(-100, 300, 340, H); ctx.fillRect(840, 300, 400, H); for (let i = 0; i < 10; i++) passer(120 + (i % 2) * 60, 600 + i * 120, .9, t, { pose: i % 3 ? 'look' : 'freeze', col: '#1a1e2c', skin: '#2a2830', torch: i % 4 === 0 ? 1 : 0, seed: i });
  const car = (u, lane, taxi) => { const y = lerp(300, 1700, u), sc = lerp(.4, 1.3, u), x = lerp(540, lane > 0 ? 760 : 320, u); ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.fillStyle = taxi ? '#B8902A' : '#1c2030'; rr(-70, -120, 140, 240, 30); ctx.fill(); ctx.fillStyle = '#0c0f18'; rr(-56, -70, 112, 80, 14); ctx.fill();
    if (taxi) { ctx.fillStyle = '#FFD23F'; rr(-30, -20, 60, 26, 6); ctx.fill(); ctx.fillStyle = '#111'; for (let i = 0; i < 3; i++) ctx.fillRect(-26 + i * 18, -16, 9, 9); glow(0, -8, 60, 'rgba(255,210,63,.6)'); }
    ctx.restore(); glow(x - 40 * sc, y + 130 * sc, 140 * sc, 'rgba(255,250,230,.55)'); glow(x + 40 * sc, y + 130 * sc, 140 * sc, 'rgba(255,250,230,.55)'); ctx.fillStyle = 'rgba(255,250,235,.95)'; circle(x - 40 * sc, y + 118 * sc, 10 * sc); ctx.fill(); circle(x + 40 * sc, y + 118 * sc, 10 * sc); ctx.fill(); };
  car((t - 72.0) * .12, -1, 0); car((t - 73.3) * .16, 1, 1); car(.15 + (t - 73.4) * .05, -1, 0); }
// ───── 26–27. Тишина; шёпот; на «застучал» головы к двери ─────
function darkFaces(t, { snap = -1 } = {}) { LIGHT.dark = 1; ctx.fillStyle = '#04050b'; ctx.fillRect(-200, -200, W + 400, H + 400); const k = snap > 0 ? E.out(win(t, snap, snap + .12)) : 0, torch = snap > 0 ? E.out(win(t, snap + .25, snap + .4)) : 0;
  for (const [who, x, y, s, lx] of [['alik', 210, 1180, 1.25, -.2], ['beka', 540, 1240, 1.25, .1], ['dias', 860, 1170, 1.3, -.1]]) bust(x, y, s, t, who, { noArms: 1, look: [lerp(lx, .95, k), lerp(0, -.05, k)], brow: lerp(.6, 1, k), wide: lerp(1.05, 1.35, k), under: .6, underRgb: '127,179,255', tilt: k * .12, mouth: k * .25 });
  dimAll(.25); if (torch > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createLinearGradient(560, 1300, 1200, 1000); g.addColorStop(0, `rgba(255,248,225,${.5 * torch})`); g.addColorStop(1, 'rgba(255,248,225,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(560, 1290); ctx.lineTo(1200, 800); ctx.lineTo(1200, 1300); ctx.lineTo(560, 1320); ctx.fill(); ctx.restore(); glow(560, 1300, 50, `rgba(255,250,235,${torch})`); } }
// ───── 28. Дверь: частые удары ─────
const KNOCKS = (() => { const a = []; let t = KNOCK_AT; for (const d of [.42, .32, .3, .3, .28, .34, .3, .28, .3]) { a.push(+t.toFixed(3)); t += d; } return a; })();
const KNOCKS_END = [80.95, 81.25, 81.55];
function doorKnock(t) { const hit = KNOCKS.reduce((a, k0) => { const h = AK.impact(t, k0, { amp: 22, squash: .04, dur: .22, dec: 12 }); return { dx: a.dx + h.dx, dy: a.dy + h.dy * .4, sx: a.sx * h.sx, sy: a.sy * h.sy }; }, { dx: 0, dy: 0, sx: 1, sy: 1 });
  const gk = E.out(win(t, 78.4, 78.8)), gx = lerp(380, 700, E.io(win(t, 78.6, 80.5))), feet = t > 78.6 ? [gx - 60 + Math.sin(t * 7) * 12, gx + 60] : [];
  hallway(t, { dark: 1, hit, gap: gk > 0 ? { x: gx, k: gk, feet } : null, beamJit: KNOCKS.reduce((a, k0) => a + ScreenShake(t, k0, 16, .25)[0], 0) });
  for (const k0 of KNOCKS) { const a = 1 - (t - k0) / .7; if (t >= k0 && a > 0) { ctx.save(); ctx.globalAlpha = a; AK.dust(t, k0, 570, 360, { w: .15, rgb: '170,160,140', n: 6, seed: Math.floor(k0 * 100) }); ctx.restore(); } } }

// ───── монтаж: [начало, конец, id, кадр, склейка] ─────
const P8 = (t, a, b, f, fx = 540, fy = 900, z1 = 1.08) => push(t, a, b, f, fx, fy, 1, z1);
const SC = [
  [0, 3.0, 'e1s01', t => cam(lerp(1, 1.06, win(t, 0, 3)), 570, 900, () => hook(t), ...shakeAt(t, HOOK_K.map(k => [k, 7, .3])))],
  [3.0, 6.0, 'e1s02', t => push(t, 3.0, 6.0, () => facadeV(t), 540, 300, 1, 1.07)],
  [6.0, 7.9, 'e1s03', t => cam(lerp(1.08, 1.12, win(t, 6, 7.9)), 540, 1240, () => threeAtTable(t, { pour: win(t, 6.1, 7.0), take: win(t, 7.2, 7.6), look: { beka: [0, .7], dias: [-.6, .5], alik: [.3, .4] } }), 0, -220)],
  [7.9, 10.3, 'e1s04', t => splitBusy(t)],
  [10.3, 14.0, 'e1s05', t => P8(t, 10.3, 14.0, () => alikPC(t), 560, 900)],
  [14.0, 15.9, 'e1s06', t => P8(t, 14.0, 15.9, () => diasIron(t), 600, 1100)],
  [15.9, 17.4, 'e1s07a', t => P8(t, 15.9, 17.4, () => diasFace(t, { outfit: 'diasT', smile: .8, look: [0, .6] }), 540, 800)],
  [17.4, 19.0, 'e1s07b', t => P8(t, 17.4, 19.0, () => chatIn(t), 540, 800, 1.05)],
  [19.0, 20.7, 'e1s08a', t => P8(t, 19.0, 20.7, () => chatSend(t), 540, 800, 1.05)],
  [20.7, 22.0, 'e1s08b', t => P8(t, 20.7, 22.0, () => diasFace(t, { outfit: 'dias', smile: 1, look: [.2, .5] }), 540, 800)],
  [22.0, 25.0, 'e1s09', t => cam(lerp(1, 1.1, win(t, 22, 25)), 540, 1150, () => rippleCup(t), Math.sin(t * 60) * 3 * win(t, 22, 25), 0)],
  [25.0, 27.4, 'e1s10', t => { const s = ScreenShake(t, 25.85, 10, .6); cam(lerp(1, 1.05, win(t, 25, 27.4)), 540, 900, () => jetSky(t), s[0], s[1]); }],
  [27.4, 29.0, 'e1s11', t => { const u = t - 27.4, s = shakeAt(t, [[27.4, 10, .6]]), jp = i => 75 * Math.max(0, Math.sin((u * 8 + i) * Math.PI)) * Math.exp(-u * 1.2);
    cam(1.1, 540, 1240, () => threeAtTable(t, { take: 1, outfit: 'dias', swing: .25 * Math.sin(u * 6) * Math.exp(-u * .7), jump: [jp(0), jp(.4), jp(.8)], cupJ: jp(.2), duck: .4, look: { beka: [0, -1], dias: [-.2, -1], alik: [.3, -1] }, emote: 27.5 }), s[0], s[1] - 220); }],
  [29.0, 31.0, 'e1s12', t => P8(t, 29.0, 31.0, () => diasFrozen(t), 540, 800)],
  [31.0, 33.2, 'e1s13', t => P8(t, 31.0, 33.2, () => bekaPhone(t), 540, 900)],
  [33.2, 35.0, 'e1s14', t => P8(t, 33.2, 35.0, () => messenger(t), 540, 800, 1.05)],
  [35.0, 37.3, 'e1s15a', t => P8(t, 35.0, 37.3, () => diasFace(t, { mood: .6, smile: -.2, look: [0, .7] }), 540, 800)],
  [37.3, 40.0, 'e1s15b', t => P8(t, 37.3, 40.0, () => chatFail(t), 540, 800, 1.05)],
  [40.0, 41.8, 'e1s16a', t => P8(t, 40.0, 41.8, () => callScreen(t), 540, 800, 1.05)],
  [41.8, 44.0, 'e1s16b', t => P8(t, 41.8, 44.0, () => diasFace(t, { mood: 1, smile: -.4, look: [-.4, .2], lit: .4, toEar: win(t, 41.8, 42.1), mouth: mouthOf(t, 'd02') * .6, eyesClosed: t > 42.6 && t < 43.4 }), 540, 800)],
  [44.0, 47.0, 'e1s17', t => P8(t, 44.0, 47.0, () => tvOnShot(t), 540, 780)],
  [47.0, 49.6, 'e1s18a', t => P8(t, 47.0, 49.6, () => footageShot(t, 'street'), 540, 780, 1.06)],
  [49.6, 52.0, 'e1s18b', t => P8(t, 49.6, 52.0, () => footageShot(t, 'fire'), 540, 780, 1.06)],
  [52.0, 55.4, 'e1s19a', t => P8(t, 52.0, 55.4, () => mapShot1(t), 540, 780, 1.06)],
  [55.4, 57.2, 'e1s19b', t => P8(t, 55.4, 57.2, () => reactTV(t), 540, 900)],
  [57.2, 59.3, 'e1s20a', t => P8(t, 57.2, 59.3, () => anchorStumble(t), 540, 780, 1.07)],
  [59.3, 61.2, 'e1s20b', t => P8(t, 59.3, 61.2, () => mapShot2(t), 760, 860, 1.08)],
  [61.2, 62.3, 'e1s21', t => cam(lerp(1.04, 1.1, win(t, 61.2, 62.3)), 540, 780, () => tvCollapse(t), ...AK.handheld(t, 4, 3).slice(0, 2))],
  [62.3, 64.3, 'e1s22', t => cam(lerp(1.08, 1.12, win(t, 62.3, 64.3)), 540, 1240, () => kitchenOut(t), 0, -220)],
  [64.3, 65.3, 'e1s23a', t => P8(t, 64.3, 65.3, () => cityA(t), 540, 1300)],
  [65.3, 66.4, 'e1s23b', t => P8(t, 65.3, 66.4, () => cityB(t), 540, 1400)],
  [66.4, 67.5, 'e1s23c', t => P8(t, 66.4, 67.5, () => cityC(t), 540, 1100)],
  [67.5, 68.5, 'e1s23d', t => P8(t, 67.5, 68.5, () => cityD(t), 540, 1100)],
  [68.5, 69.6, 'e1s23e', t => P8(t, 68.5, 69.6, () => cityE(t), 480, 900)],
  [69.6, 71.2, 'e1s23f', t => push(t, 69.6, 71.2, () => cityF(t), 540, 1100, 1.0, 1.06)],
  [71.2, 73.4, 'e1s24', t => P8(t, 71.2, 73.4, () => diasWindow(t), 450, 900)],
  [73.4, 75.6, 'e1s25', t => P8(t, 73.4, 75.6, () => avenuePOV(t), 540, 1000)],
  [75.6, 76.6, 'e1s26', t => push(t, 75.6, 76.6, () => darkFaces(t), 540, 1100, 1.0, 1.03)],
  [76.6, 77.9, 'e1s27', t => { const s = ScreenShake(t, KNOCK_AT, 8, .3); cam(lerp(1.03, 1.08, win(t, 76.6, 77.9)), 540, 1100, () => darkFaces(t, { snap: KNOCK_AT }), s[0], s[1]); }],
  [77.9, 80.8, 'e1s28', t => { const s = KNOCKS.reduce((a, k0) => { const q = ScreenShake(t, k0, 7, .25); return [a[0] + q[0], a[1] + q[1]]; }, [0, 0]); cam(lerp(1, 1.12, win(t, 77.9, 80.8)), 570, 1100, () => doorKnock(t), s[0], s[1]); }],
  [80.8, DUR + .01, 'e1s29', t => { const s = KNOCKS_END.reduce((a, k0) => { const q = ScreenShake(t, k0, 10, .25); return [a[0] + q[0], a[1] + q[1]]; }, [0, 0]); ctx.save(); ctx.translate(s[0], s[1]); EndCard(t, 80.8, 'КТО-ТО|СТУЧИТ', 'ЧАСТЬ 2 →'); ctx.restore(); }],
];
function drawFrame(t) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ENDCARD_AT = -1; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  let i = SC.length - 1; while (i > 0 && SC[i][0] > t) i--; const [a, , id, draw, cutKind = 'none'] = SC[i];
  ctx.save(); draw(t); ctx.restore(); LIGHT.dark = 0; if (i > 0) AK.cut(t, a, cutKind);
  if (t >= 1.2 && t < 1.2 + 4 / 30) Glitch(t, 1); // 4 кадра сбоя на перемотке
  if (id !== 'e1s29') { post(t); Hud(t, { ...storyAt(EP, t), sigFlash: 33.6 }); } if (t < 3) PartSticker(1, t); KineticCaption(t, CAPS); }

// ───── звук: дрон без дыр (после блэкаута глуше); вместо цифровой тишины — фон комнаты; хвосты через склейки ─────
const BED = 'projects/blackout/assets/drone.wav', BEDM = 'projects/blackout/assets/drone-muffled.wav';
const knock = (t, g = 1) => [{ t, type: 'knock', gain: .9 * g, pitch: .9 + (t * 7 % 1) * .2 }, { t: t + .005, type: 'lib', id: 'impact-deep-soft', gain: .25 * g }];
const VOX = Object.entries(VO_AT).map(([id, t]) => ({ t, type: 'file', path: `projects/blackout/assets/vo/ep1/${id}.wav`, gain: VO_GAIN[id] || 4.2, ...(VO_CUT[id] ? { dur: VO_CUT[id] } : {}) }));
window.SFX_CUES = [...VOX,
  { t: 0, type: 'file', path: BED, gain: .5, dur: 58 }, { t: 58, type: 'file', path: BED, gain: .5, from: 20, dur: OUT - 58 }, { t: OUT, type: 'file', path: BEDM, gain: .6, from: 2, dur: 75.6 - OUT }, { t: 76.6, type: 'file', path: BEDM, gain: .45, from: 20, dur: 5.3 },
  // 1 хук: удары в дверь, удар баса, дребезг, перемотка
  { t: .15, type: 'lib', id: 'impact-deep-hard', gain: .5 }, ...HOOK_K.flatMap(k => knock(k, .6)), { t: .2, type: 'rattle', dur: .9, gain: .25 }, { t: 1.2, type: 'rewind', dur: .7, gain: .5 }, { t: 1.2, type: 'glitch', gain: .2 }, { t: 1.9, type: 'lib', id: 'whoosh-slow-hard', gain: .2 },
  // город, кухня
  { t: 3.0, type: 'murmur', dur: 3, gain: .06, pitch: .7 }, { t: 3.0, type: 'engine', dur: 3, gain: .05, pitch: .6 }, { t: 3.0, type: 'wind', dur: 3, gain: .08 }, { t: 4.3, type: 'lib', id: 'foley-paper-touch', gain: .2 },
  { t: 6.1, type: 'hiss', dur: .9, lo: 400, hi: 3000, gain: .12, pulse: 7 }, { t: 7.25, type: 'lib', id: 'foley-fabric-touch', gain: .2 }, { t: 7.45, type: 'lib', id: 'foley-fabric-touch', gain: .2 },
  ...[7.95, 8.05, 8.15].map(t => ({ t, type: 'lib', id: 'swipe-fast-soft', gain: .2 })), ...[8.6, 9.4].map(t => ({ t, type: 'hiss', dur: .3, lo: 900, hi: 4000, gain: .06 })), { t: 8.9, type: 'hiss', dur: .5, lo: 2000, hi: 8000, gain: .06 },
  ...Array.from({ length: 22 }, (_, i) => ({ t: 10.4 + i * .16 + (i % 3) * .03, type: 'lib', id: i % 2 ? 'keyboard-letter-soft' : 'keyboard-letter-medium', gain: .22 })), { t: 11.6, type: 'hiss', dur: .35, lo: 900, hi: 4000, gain: .07 },
  ...[14.2, 14.5, 14.8, 15.1].map(t => ({ t, type: 'hiss', dur: .4, lo: 2000, hi: 8000, gain: .07 })), { t: 14.9, type: 'lib', id: 'phone-vibrate-table', gain: .5 }, { t: 17.7, type: 'lib', id: 'notification-message-in-clear', gain: .5 },
  ...Array.from({ length: 6 }, (_, i) => ({ t: 19.1 + i * .1, type: 'lib', id: 'click-tap-soft', gain: .2 })), { t: 19.85, type: 'lib', id: 'notification-message-out-clear', gain: .45 }, { t: 20.7, type: 'lib', id: 'foley-fabric-slide', gain: .2 },
  // предвестие и истребитель (рёв начинается заранее и уходит хвостом за склейку)
  { t: 22.0, type: 'roar', dur: 3.6, attack: 3.0, dist: .9, pitch: .45, gain: .5 }, { t: 22.2, type: 'rattle', dur: 2.6, gain: .12 }, { t: 23.4, type: 'rattle', dur: 1.6, gain: .15, pitch: 1.4 },
  { t: 24.4, type: 'jet', dur: 5.6, peak: .26, gain: .8 }, { t: 25.85, type: 'lib', id: 'impact-deep-firm', gain: .5 }, { t: 25.9, type: 'rattle', dur: 1.8, gain: .3 }, { t: 27.4, type: 'tinkle', dur: 2.2, gain: .35 }, { t: 27.4, type: 'rattle', dur: 1.4, gain: .35, pitch: .8 }, ...[27.5, 27.75, 28.0].map(t => ({ t, type: 'bonk', gain: .15, pitch: 1.5 })),
  { t: 29.15, type: 'hiss', dur: .5, lo: 2000, hi: 8000, gain: .05 }, { t: 31.05, type: 'lib', id: 'foley-fabric-slide', gain: .3 }, { t: 32.8, type: 'lib', id: 'notification-failure-low', gain: .35 },
  { t: 33.5, type: 'lib', id: 'click-tap-firm', gain: .4 }, { t: 33.6, type: 'glitch', gain: .12 }, { t: 34.2, type: 'lib', id: 'click-tap-firm', gain: .4 },
  ...[35.4, 35.55, 35.7, 36.2, 36.35, 37.3].map(t => ({ t, type: 'lib', id: 'click-tap-soft', gain: .25 })), { t: 38.4, type: 'lib', id: 'notification-failure-thud', gain: .5 },
  ...[40.3, 40.75].map(t => ({ t, type: 'tone', freq: 425, dur: .35, gain: .14 })), ...[41.1, 41.45, 41.8].map(t => ({ t, type: 'tone', freq: 425, dur: .2, gain: .16 })), ...[42.6, 42.85, 43.1, 43.35].map(t => ({ t, type: 'tone', freq: 425, dur: .14, gain: .03 })),
  // телевизор
  { t: 44.2, type: 'lib', id: 'click-button-firm', gain: .5 }, { t: 44.3, type: 'murmur', dur: .5, gain: .12, pitch: 1.3 }, { t: 44.85, type: 'lib', id: 'impact-deep-firm', gain: .4 }, { t: 44.88, type: 'chord', notes: [146.8, 220, 293.7], dur: 1.2, attack: .02, gain: .18 },
  { t: 47.0, type: 'siren', dur: 5, dist: .7, gain: .2 }, { t: 47.0, type: 'murmur', dur: 5, gain: .1, pitch: 1.5 }, { t: 49.6, type: 'crackle', dur: 2.4, gain: .12 }, { t: 49.6, type: 'siren', dur: 2.4, dist: .8, gain: .12, pitch: .93 },
  ...REG.filter(R => R.off < 55).map(R => ({ t: R.off, type: 'lib', id: 'bass-sub-drop-short', gain: .35 })), { t: 52.6, type: 'lib', id: 'bass-rumble-medium', gain: .3 }, { t: 53.7, type: 'lib', id: 'cinematic-thunder-big', gain: .15 }, { t: 54.6, type: 'lib', id: 'bass-rumble-medium', gain: .25 },
  ...[55.4, 56.2, 57.4, 58.2, 59.0, 59.7, 60.4].map((t, i) => ({ t, type: 'heartbeat', gain: .25 + i * .02, pitch: .8 + i * .04 })), { t: 57.8, type: 'lib', id: 'foley-paper-slide', gain: .3 },
  { t: 59.9, type: 'lib', id: 'bass-sub-drop-short', gain: .45 }, { t: 60.4, type: 'lib', id: 'bass-rumble-medium', gain: .3 },
  // блэкаут
  { t: 61.15, type: 'lib', id: 'digital-corrupt', gain: .4 }, { t: 61.2, type: 'zap', dur: .35, gain: .2 }, { t: 61.3, type: 'lib', id: 'bsb-crt-off', gain: .4, align: 'start', dur: .9 },
  { t: OUT - .25, type: 'zap', dur: .2, gain: .12 }, { t: OUT, type: 'lib', id: 'click-toggle-on-soft', gain: .5 }, { t: OUT, type: 'powerdown', dur: 1.3, gain: .45 }, { t: OUT + .02, type: 'powerdown', dur: .5, gain: .2, pitch: 2.2 }, { t: OUT, type: 'lib', id: 'impact-deep-hard', gain: .6 },
  // город: гул обрывается, щелчки районов, голоса, удар на Кок-Тобе
  { t: 64.3, type: 'murmur', dur: .3, gain: .12, pitch: .7 }, { t: 64.3, type: 'engine', dur: .25, gain: .1, pitch: .6 }, { t: blackT.zhk, type: 'lib', id: 'click-toggle-soft', gain: .4 }, { t: blackT.zhk + .3, type: 'click', gain: .1, pitch: .5 },
  { t: blackT.people, type: 'lib', id: 'click-toggle-soft', gain: .35 }, { t: blackT.people + .3, type: 'murmur', dur: 1.2, gain: .18, pitch: 1.1 }, { t: 65.9, type: 'horn', dur: .6, gain: .12 }, { t: 66.05, type: 'lib', id: 'click-button-soft', gain: .25 },
  { t: blackT.nt, type: 'lib', id: 'click-toggle-soft', gain: .35 }, ...[0, .1, .2, .3].map(d => ({ t: blackT.nt + .1 + d, type: 'click', gain: .07, pitch: .4 + d })), { t: blackT.cat, type: 'lib', id: 'click-toggle-on-soft', gain: .35 },
  { t: blackT.kt + .45, type: 'lib', id: 'impact-deep-hard', gain: .55 }, { t: blackT.kt + .45, type: 'powerdown', dur: 1.0, gain: .3, pitch: .6 }, { t: 69.6, type: 'wind', dur: 6, gain: .1 }, { t: 70.4, type: 'horn', dur: .4, gain: .07 }, { t: 74.2, type: 'horn', dur: .7, gain: .06, pitch: .9 },
  // тишина 75,6–76,6: без музыки и голоса, только комната — тиканье механических часов и дыхание
  ...[75.7, 76.2].map(t => ({ t, type: 'tick', gain: .25, pitch: .9 })), { t: 75.65, type: 'breath_in', dur: .6, gain: .12 }, { t: 75.6, type: 'wind', dur: 1, gain: .025 },
  // стук: первый — на слове «застучал»
  ...KNOCKS.flatMap((k, i) => knock(k, i < 5 ? .45 : 1)), { t: KNOCK_AT, type: 'lib', id: 'impact-deep-firm', gain: .4 }, { t: 78.6, type: 'step', gain: .06, pitch: .7 }, { t: 79.2, type: 'step', gain: .06, pitch: .7 },
  { t: 80.8, type: 'lib', id: 'impact-deep-firm', gain: .35 }, ...KNOCKS_END.flatMap(k => knock(k, 1.1)), { t: 81.9, type: 'wind', dur: 1.95, gain: .04 }, { t: 82.4, type: 'tick', gain: .15, pitch: .9 }, { t: 83.4, type: 'tick', gain: .15, pitch: .9 },
];
// ───── раскадровка storyboard/ep1.json (схема раздела 7 ТЗ v2) ─────
const SPK = id => ({ a01: 'alikhan', d01: 'dias', d02: 'dias', b01: 'beka', an1: 'anchor', an2: 'anchor', an3: 'anchor', an4: 'anchor' }[id] || 'narrator');
window.STORYBOARD = { episode: EP, title: 'Тень над Алматы', duration: DUR, hud: { city: 'АЛМАТЫ', temp: '+6°', timeStart: '19:58', signal: 'full' }, characters: ['dias', 'beka', 'alikhan'],
  scenes: SC.map(([a, b, id]) => { const h = storyAt(EP, a + .01), c = CAPS.filter(p => p.a >= a - .01 && p.a < b), vo = Object.entries(VO_AT).find(([, v]) => v >= a - .05 && v < b);
    return { id, start: a, end: +Math.min(b, DUR).toFixed(2), camera: { type: 'pushIn', from: 1.0, to: 1.08 },
      vo: c.length ? { speaker: vo ? SPK(vo[0]) : 'narrator', text: c.map(p => p.words.map(w => w.text).join(' ')).join(' '), accent: c.flatMap(p => p.words.filter(w => w.accent).map(w => w.text)) } : null,
      sfx: window.SFX_CUES.filter(s => s.t >= a && s.t < b && !(s.path || '').includes('/vo/')).map(s => ({ id: s.id || (s.path ? s.path.split('/').pop() : s.type), at: +(s.t - a).toFixed(2) })),
      hud: id === 'e1s29' ? null : { time: h.time, signal: h.signal, ...(id === 'e1s01' ? { timeMode: 'rewind', rewindTo: '19:58', rewindAt: 1.2 } : {}) } }; }) };
window.CAPTION_PHRASES = CAPS;
window.renderFrame = t => drawFrame(Math.min(t, DUR - .001));
window.READY = Promise.all(['900 72px Mont', '800 32px Mont', '800 44px JBM'].map(f => document.fonts.load(f))).then(() => drawFrame(0));
