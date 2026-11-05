// «Счётчик» · серия 2 «Правила» (0:57). Таймкоды и тексты — по ТЗ, раздел 6.
'use strict';
const DUR = 53.5;
window.SCENE = { duration: DUR, fps: 30, width: W, height: H };
initLib(document.getElementById('c'));
const BAL0 = 72 * 3600 + 47 * 60, T0403 = 4 * 3600 + 3 * 60; // как в серии 1: 72:47:00 в 04:03, тикает вниз
const clk = (h, m, s, t, t0) => h * 3600 + m * 60 + s + Math.max(0, t - t0);
const hm = c => `${String(Math.floor(c / 3600)).padStart(2, '0')}:${String(Math.floor(c / 60) % 60).padStart(2, '0')}`;
const bal = c => storyBalance(c); // единая функция сюжета (lib.js)
const NIGHT = t => { const c = clk(4, 5, 0, t, 0); return { night: 1, time: hm(c), temp: '−31°', balance: bal(c) }; };
const MORNING = t => { const c = clk(8, 12, 0, t, 23); return { label: 'УТРО', time: hm(c), temp: '−24°', balance: bal(c) }; };
const DAY = t => { const c = clk(12, 36, 1, t, 37); return { label: 'ДЕНЬ', time: hm(c), temp: '−22°', balance: bal(c) }; };

// ───── голос (черновой) и время слов ─────
const VO_AT = { e2s01: 0.0, e2s02: 4.0, e2s03: 6.3, e2s04a: 13.6, e2s04b: 15.4, e2s06: 24.0, e2s07: 31.4, e2s08: 38.0, e2s09: 45.0, e2s11: 51.25 };
const VO_GAIN = { e2s02: 4.5, e2s03: 4.8, e2s04b: 4.8 }; // голос Марата с эхом — тише, поднять
const VT = id => (window.VO_WORDS && window.VO_WORDS[id] || null) && window.VO_WORDS[id].map(x => x + VO_AT[id]);
const W3 = VT('e2s03') || [6.3, 6.5, 6.8, 7.7, 8, 8.4, 8.5, 8.9, 9.4, 9.8, 10.1]; // карточки правил — по первым словам фраз
const CARD = [W3[0], W3[3], W3[7]];

// ───── сцены ─────
function rearWithMarat(t, o = {}) { rearSeat(t); maratMirror(t, o); }
function snowThrough(t, a, b) { const k = win(t, a, b); if (k <= 0 || k >= 1) return; const r = seeded(77); ctx.fillStyle = '#eef6ff';
  for (let i = 0; i < 22; i++) { const x = MIR.x + 300 + ((r() * 400 + t * 320) % 420), y = MIR.y + 30 + r() * 200; ctx.globalAlpha = .8; circle(x, y, 3 + r() * 3); ctx.fill(); } ctx.globalAlpha = 1; }
function kitchen(t) { ctx.fillStyle = '#c9d3df'; ctx.fillRect(0, 0, W, H); const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(160,185,215,.5)'); g.addColorStop(1, 'rgba(60,70,95,.6)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#9fb0c4'; for (let x = 0; x < W; x += 90) ctx.fillRect(x, 1100, 4, 400); ctx.fillStyle = '#5b6578'; ctx.fillRect(0, 1480, W, H); // кафель, пол
  rr(80, 380, 380, 500, 8); fillOL('#e9f2fb', 8); ctx.save(); rr(96, 396, 348, 468, 4); ctx.clip(); ctx.fillStyle = '#a9c3df'; ctx.fillRect(0, 0, W, H); panelBlock(110, 900, 320, 5, 4, { lit: [] }); FrostOverlay(.8, { x: 96, y: 396, w: 348, h: 468 }, 'edges', 13); ctx.restore(); // окно с инеем
  ctx.strokeStyle = '#e9f2fb'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(270, 396); ctx.lineTo(270, 864); ctx.stroke();
  rr(40, 1060, 560, 420, 10); fillOL('#e6e1d6', 6); for (const cx of [170, 400]) { circle(cx, 1080, 60); fillOL('#2e3138', 5); } // плита
  ctx.save(); ctx.translate(400, 980); rr(-70, -60, 140, 110, 30); fillOL('#b9c4cf', 5); rr(60, -40, 50, 18, 8); fillOL('#b9c4cf', 4); ctx.restore(); // чайник
  ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 14; ctx.lineCap = 'round'; for (let i = 0; i < 3; i++) { const ph = (t * .6 + i / 3) % 1; ctx.globalAlpha = .6 * (1 - ph); ctx.beginPath(); ctx.moveTo(470, 940 - ph * 260); ctx.bezierCurveTo(430, 900 - ph * 300, 520, 860 - ph * 320, 480, 820 - ph * 360); ctx.stroke(); } ctx.restore(); // пар
  tvSet(600, 560, 360, 270, () => tvNews(t, .55)); rr(580, 870, 400, 610, 10); fillOL('#8a6a4f', 6); // тумба
  momBack(300, 1480, 1.25); }
function tvNews(t, s = 1, mode = 'news') { ctx.fillStyle = '#0d1428'; ctx.fillRect(0, 0, W, H);
  // кадр новости: тот же дом, окно открыто
  ctx.save(); const bx = mode === 'big' ? 60 : 610, by = mode === 'big' ? 330 : 570, bw = mode === 'big' ? 840 : 340, bh = mode === 'big' ? 500 : 190; ctx.beginPath(); ctx.rect(bx, by, bw, bh); ctx.clip();
  ctx.fillStyle = '#9fb1c8'; ctx.fillRect(bx, by, bw, bh); ctx.translate(bx, by); ctx.scale(bw / 960, bw / 960); ctx.translate(0, -250); panelBlock(0, 900, 960, 5, 6, { lit: [], callout: null, fortochka: '2-3' }); ctx.fillStyle = '#e6eef9'; ctx.fillRect(0, 900, 960, 400);
  ctx.strokeStyle = T.danger; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(3 * 160 + 80 + 24, 900 - 3 * 150 + 66, 70, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  // плашка
  const px = mode === 'big' ? 60 : 605, py = mode === 'big' ? 850 : 765, pw = mode === 'big' ? 840 : 350, fs = mode === 'big' ? 52 : 15;
  ctx.fillStyle = T.danger; ctx.fillRect(px, py, pw * .34, fs * 1.6); txt('НОВОСТИ', px + 14, py + fs * .8, fs * .8, '#fff', { weight: 900 });
  ctx.fillStyle = 'rgba(244,241,234,.95)'; ctx.fillRect(px, py + fs * 1.6, pw, fs * 3.1);
  txt('ПЕНСИОНЕР НАЙДЕН МЁРТВЫМ', px + 18, py + fs * 2.35, fs * .8, '#111', { weight: 900 }); txt('ОКНО БЫЛО ОТКРЫТО', px + 18, py + fs * 3.75, fs * .8, '#333', { weight: 800 });
  ctx.fillStyle = 'rgba(255,255,255,.05)'; for (let y = 0; y < H; y += 6) ctx.fillRect(0, y, W, 2); }
const SC = [
  [0, 3, 'e2s01', t => push(t, 0, 3, () => MirrorShot(t, tt => rearWithMarat(tt), { frost: .25 }), 540, 720), NIGHT],
  [3, 6, 'e2s02', t => { const tt = Math.min(t, 4.0); cam(t > 4.0 ? 1.06 : 1, 540, 720, () => MirrorShot(tt, x => bekaEyes(x, -1.2 * E.io(win(x, 3.2, 4.0)), 1.1)));
      if (t > 4.0) { ctx.save(); ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = 'rgba(128,128,128,.85)'; ctx.fillRect(0, 0, W, H); ctx.restore(); ctx.fillStyle = 'rgba(207,232,255,.06)'; ctx.fillRect(0, 0, W, H); } }, NIGHT],
  [6, 13, 'e2s03', t => { MirrorShot(t, tt => rearWithMarat(tt), { frost: .3 }); ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(0, 0, W, H);
      RuleCard(t, CARD[0], 1, 'Не отменяй заказ', 330); RuleCard(t, CARD[1], 2, 'Смотри только в зеркало', 520); RuleCard(t, CARD[2], 3, 'Не вози к своим', 710); }, NIGHT],
  [13, 19, 'e2s04', t => push(t, 13, 19, () => MirrorShot(t, tt => { rearWithMarat(tt, { palm: E.out(win(tt, 15.0, 15.8)) }); snowThrough(tt, 15.4, 18.6); }, { frost: .3 }), 540, 720), NIGHT],
  [19, 23, 'e2s05', t => push(t, 19, 23, () => MirrorShot(t, tt => { rearSeat(tt); frostPalm(MIR.x + MIR.w / 2 + 120, MIR.y + 210, 1 - E.io(win(tt, 19.4, 22.8)), tt); }), 540, 720), NIGHT],
  [23, 27, 'e2s06a', t => push(t, 23, 27, () => kitchen(t), 540, 1000), MORNING],
  [27, 31, 'e2s06b', t => push(t, 27, 31, () => tvNews(t, 1, 'big'), 540, 760), MORNING],
  [31, 34, 'e2s07a', t => push(t, 31, 34, () => tvNewsDeath(t), 540, 960), MORNING],
  [34, 37, 'e2s07b', t => { windshield(t, .4); HandPhone(t, tt => PhoneScreen(tt, 'system', [['История поездок'], ['04:03 · +47 мин', true]], 34.1), { k: E.out(win(t, 34, 34.3)), cracked: true }); }, MORNING],
  [37, 41, 'e2s08a', t => push(t, 37, 41, () => { windshield(t, .3); HandPhone(t, tt => PhoneScreen(tt, 'drivers', [['Марат Т.', '00:00:00 · ПАССАЖИР', 'dead', 37.3]], 37.1), { k: E.out(win(t, 37, 37.3)), cracked: true }); }, 540, 700), DAY],
  [41, 44, 'e2s08b', t => push(t, 41, 44, () => bekaFace(t, { lookY: 1, wide: .9 }), CXC, 820, 1, 1.1), DAY], // реакция: лицо в свете экрана
  [44, 48, 'e2s09a', t => push(t, 44, 48, () => { windshield(t, .3); const c = clk(12, 36, 1, t, 37); HandPhone(t, tt => PhoneScreen(tt, 'drivers', [['Марат Т.', '00:00:00 · ПАССАЖИР', 'dead', 0], ['Бекзат Н.', hms(bal(c)), 'me', 44.2]], 0), { cracked: true }); }, 540, 760), DAY],
  [48, 50, 'e2s09b', t => { windshield(t, .4); ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(0, 0, W, H); const c = clk(12, 36, 1, t, 37), z = lerp(1, 1.08, win(t, 48, 50)); ctx.save(); ctx.translate(CXC, 760); ctx.scale(z, z); ctx.shadowColor = T.danger; ctx.shadowBlur = 40;
      txt('БЕКЗАТ Н.', 0, -130, 48, 'rgba(244,241,234,.75)', { weight: 900, align: 'center' }); txt(hms(bal(c)), 0, 0, 150, T.danger, { font: 'JBM', weight: 800, align: 'center' }); ctx.restore(); }, DAY],
  [50, 51, 'e2s10', t => { windshield(t, .2); ctx.fillStyle = 'rgba(0,0,0,.7)'; ctx.fillRect(0, 0, W, H); }, DAY],
  [51, 53.51, 'e2s11', t => EndCard(t, 51.0, '', 'ЧАСТЬ 3 →'), null], // карточка ≤ 2,5 с
];
// в кадре 31–34 на экране — «Время смерти — 04:03»
function tvNewsDeath(t) { tvNews(t, 1, 'big'); const px = 60, py = 850, fs = 52; ctx.fillStyle = 'rgb(244,241,234)'; ctx.fillRect(px, py + fs * 1.6, 840, fs * 3.1);
  txt('ВРЕМЯ СМЕРТИ — 04:03', px + 18, py + fs * 2.35, fs * 1.05, T.danger, { weight: 900 }); txt('СОСЕДИ НИЧЕГО НЕ СЛЫШАЛИ', px + 18, py + fs * 3.75, fs * .8, '#333', { weight: 800 }); }

// ───── субтитры по голосу ─────
const CAPS = buildCaptions([
  [0.0, 3.0, 'В зеркале сидел **Марат**. Год как пропавший', { times: VT('e2s01'), whole: true, size: 56, maxW: 940 }],
  [3.0, 6.0, '— **Не оборачивайся**', { times: VT('e2s02'), dead: true }],
  [6.0, 13.0, '— Не отменяй заказ. Смотри только в зеркало. И никогда не вози к **своим**', { times: VT('e2s03'), dead: true }],
  [13.0, 15.3, '— А если отменить?', { times: VT('e2s04a') }],
  [15.3, 19.0, '— Я отменил **один**', { times: VT('e2s04b'), dead: true }],
  [23.0, 31.0, 'Утром в новостях показали тот дом. Окно — **открыто**', { times: VT('e2s06') }],
  [31.0, 37.0, 'Минута в минуту. Я вёз не пассажира. Я вёз **смерть**', { times: VT('e2s07') }],
  [37.0, 44.0, 'У Марата тоже был счётчик. Он **дотикал**', { times: VT('e2s08') }],
  [44.0, 50.0, 'Мне оставалось меньше **трёх суток**', { times: VT('e2s09') }],
  [51.0, 53.5, 'Чтобы жить, мне придётся **возить смерть**', { times: VT('e2s11'), y: 880, size: 80, whole: true, color: T.danger }],
], { tail: .3 });
CAPS[0].a = 0; CAPS[0].words[0].t = 0; // первый кадр: субтитр уже виден
window.CAPTION_PHRASES = CAPS;

function drawFrame(t) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  let i = SC.length - 1; while (i > 0 && SC[i][0] > t) i--; const [a, b, id, draw, hud] = SC[i];
  ctx.save(); if (hud) cam(lerp(1, 1.03, E.io(win(t, a, b))), 540, 900, () => draw(t)); else draw(t); ctx.restore(); const k = 1 - win(t, a, a + .15); if (i > 0 && k > 0 && SC[i][2] !== 'e2s10') { ctx.fillStyle = `rgba(0,0,0,${k * .8})`; ctx.fillRect(0, 0, W, H); }
  post(t); if (hud) Hud(t, hud(t)); if (t < 3) PartSticker(2, t); KineticCaption(t, CAPS); }

// ───── звук: голос, тёмный эмбиент, CC0-шумы ─────
const M = 'projects/schetchik/assets/music-ep2.wav';
window.SFX_CUES = [
  { t: 0, type: 'file', path: M, gain: .1, dur: 3.9 }, { t: 6.0, type: 'file', path: M, gain: .1, from: 6.0, dur: 44 }, { t: 51, type: 'file', path: M, gain: .08, from: 51, dur: 2.5 }, // «всё стихает» 3.9–6, тишина 50–51
  ...Object.entries(VO_AT).map(([id, t]) => ({ t, type: 'file', path: `projects/schetchik/assets/vo/ep2/${id}.wav`, gain: VO_GAIN[id] || 3.0 })),
  { t: 0.0, type: 'lib', id: 'notification-alert-clear', gain: .5 },                                 // ping в начале (продолжение звонка из бардачка)
  { t: 0.25, type: 'lib', id: 'impact-deep-hard', gain: .5 }, { t: 0.35, type: 'lib', id: 'bsb-ice-crack-1', gain: .5, align: 'start', dur: 1.2 }, // удар баса, ice_crack
  ...CARD.map(t => ({ t, type: 'lib', id: 'notification-alert-soft', gain: .25 })),                  // push ×3
  { t: 15.2, type: 'lib', id: 'bsb-wind-whistle-chimney', gain: .07, align: 'start', dur: 3.5 },     // wind_through
  { t: 19.5, type: 'lib', id: 'bsb-drops-water', gain: .3, align: 'start', dur: 3.3 },              // drip
  { t: 23, type: 'lib', id: 'bsb-kettle-electric', gain: .1, align: 'start', dur: 8 }, { t: 23, type: 'murmur', dur: 11, gain: .08 }, // kettle, tv_murmur
  { t: 34.3, type: 'lib', id: 'money-coin-drop', gain: .5, rate: .62 },                              // coin_distorted
  { t: 37.4, type: 'lib', id: 'bass-sub-drop-long', gain: .35 },                                     // low_tone
  ...[44.2, 45.2, 46.2, 47.2, 48.2, 49.2].map(t => ({ t, type: 'lib', id: 'data-tick', gain: .3 })), // tick
  { t: 51.0, type: 'lib', id: 'impact-deep-firm', gain: .4 }, { t: 52.9, type: 'lib', id: 'notification-alert-clear', gain: .5 }, // ping в конце
];
window.STORYBOARD = { episode: 2, title: 'Правила', duration: DUR, hud: { night: 1, temp: '−31°', balanceStart: '72:45:00' },
  scenes: SC.map(([a, b, id, , hud]) => { const h = hud ? hud(a + .01) : null; const c = CAPS.filter(p => p.a >= a - .01 && p.a < b);
    return { id, start: a, end: +b.toFixed(2), vo: c.length ? { speaker: ['e2s02', 'e2s03', 'e2s04'].includes(id) ? 'marat' : 'beka', text: c.map(p => p.words.map(w => w.text).join(' ')).join(' '), accent: c.flatMap(p => p.words.filter(w => w.accent).map(w => w.text)) } : null,
      sfx: window.SFX_CUES.filter(s => s.t >= a && s.t < b).map(s => ({ id: s.id || s.type, at: s.t })), hud: h ? { time: h.time, balance: h.balance === undefined ? null : hms(h.balance) } : null, overlays: a === 0 ? ['PartSticker:2'] : id === 'e2s11' ? ['EndCard'] : [] }; }) };
window.renderFrame = t => drawFrame(Math.min(t, DUR - .001));
window.READY = Promise.all(['900 72px Mont', '700 34px JBM', '800 34px JBM'].map(f => document.fonts.load(f))).then(() => drawFrame(0));
