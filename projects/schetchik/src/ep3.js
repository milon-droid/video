// «Счётчик» · серия 3 «Шахта» (0:58). Таймкоды и тексты — по ТЗ, раздел 6.
'use strict';
const DUR = 58;
window.SCENE = { duration: DUR, fps: 30, width: W, height: H };
initLib(document.getElementById('c'));
// баланс 2-й ночи: 49:32:00 в 03:17, тикает вниз; в 03:54:30 начисляется +05:12:00 → 54:06:30
const B0 = 49 * 3600 + 32 * 60, T0317 = 3 * 3600 + 17 * 60, FLIP_T = 41.5;
const clk = (h, m, s, t, t0) => h * 3600 + m * 60 + s + Math.max(0, t - t0);
const hm = c => `${String(Math.floor(c / 3600)).padStart(2, '0')}:${String(Math.floor(c / 60) % 60).padStart(2, '0')}`;
const bal = (c, t) => storyBalance(ST(1, 0, 0, c)); // единая функция сюжета (lib.js): +05:12:00 начисляется в 03:54:30
const HUD = (h, m, s, t0) => t => { const c = clk(h, m, s, t, t0); return { night: 2, time: hm(c), temp: '−28°', balance: bal(c, t), flash: Math.max(0, 1 - Math.abs(t - FLIP_T) * 2) }; };

// ───── голос (черновой) и время слов ─────
const VO_AT = { e3s01: 0.0, e3s02: 3.6, e3s03: 8.6, e3s04: 12.3, e3s05: 17.2, e3s06: 24.6, e3s07: 29.0, e3s08: 33.6, e3s09: 41.8, e3s10: 45.2, e3s13: 54.0 };
const VO_GAIN = { e3s05: 11, e3s07: 4.5 }; // шёпот мамы тихий — поднять
const VT = id => (window.VO_WORDS && window.VO_WORDS[id] || null) && window.VO_WORDS[id].map(x => x + VO_AT[id]);

// ───── сцены ─────
function bigPay(t, t0, s = '+05:12:00') { const k = E.back(win(t, t0, t0 + .4)); ctx.fillStyle = '#05070f'; ctx.fillRect(0, 0, W, H); bokeh(t, 3, 12, 300, 1400, .35);
  ctx.save(); ctx.translate(CXC, 820); ctx.scale(lerp(.6, 1, k), lerp(.6, 1, k)); ctx.shadowColor = T.danger; ctx.shadowBlur = 50 + 20 * Math.sin(t * 9);
  txt(s, 0, 0, 160, T.danger, { font: 'JBM', weight: 800, align: 'center', alpha: clamp(k * 2) }); ctx.restore();
  txt('ОПЛАТА · ЧУЖАЯ ЖИЗНЬ', CXC, 960, 40, 'rgba(244,241,234,.7)', { font: 'JBM', weight: 800, align: 'center', alpha: win(t, t0 + .3, t0 + .6) }); }
function headframe(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = '#0b1022'; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(-120, 0); ctx.lineTo(-20, -520); ctx.lineTo(20, -520); ctx.lineTo(120, 0); ctx.moveTo(-90, -150); ctx.lineTo(90, -150); ctx.moveTo(-60, -300); ctx.lineTo(60, -300); ctx.moveTo(20, -520); ctx.lineTo(240, 0); ctx.stroke();
  circle(0, -540, 46); ctx.lineWidth = 10; ctx.stroke(); ctx.restore(); } // шахтный копёр
function miner(x, y, s, t, lamp = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (lamp > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(0, -430, 0, 0, -430, 700); g.addColorStop(0, `rgba(255,248,220,${.9 * lamp})`); g.addColorStop(.2, `rgba(255,236,180,${.35 * lamp})`); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-30, -430); ctx.lineTo(-700, 600); ctx.lineTo(700, 600); ctx.closePath(); ctx.fill(); ctx.restore(); }
  ctx.beginPath(); ctx.moveTo(-130, 0); ctx.quadraticCurveTo(-140, -260, -90, -330); ctx.quadraticCurveTo(0, -360, 90, -330); ctx.quadraticCurveTo(140, -260, 130, 0); ctx.closePath(); fillOL('#0a0c14', 5); // роба
  circle(0, -400, 72); fillOL('#07080d', 5); // лицо в угле
  ctx.beginPath(); ctx.arc(0, -420, 86, Math.PI, 0); ctx.lineTo(100, -410); ctx.lineTo(-100, -410); ctx.closePath(); fillOL('#2c2a24', 5); // каска
  rr(-24, -470, 48, 34, 10); fillOL('#fff8dc', 4); if (lamp > 0) glow(0, -452, 160 * lamp, 'rgba(255,250,225,.9)');
  ctx.restore(); }
function bathhouse(t) { nightSky(); ctx.save(); ctx.translate(0, -300); terricons(1050); headframe(820, 1050, 1);
  rr(60, 640, 760, 640, 6); fillOL('#2b2630', 6); ctx.fillStyle = 'rgba(0,0,0,.25)'; for (let y = 660; y < 1280; y += 36) for (let x = 70 + ((y / 36) % 2) * 30; x < 810; x += 60) ctx.fillRect(x, y, 54, 30);
  for (const wx of [110, 300, 600]) { rr(wx, 760, 130, 170, 4); fillOL('#05060b', 5); ctx.strokeStyle = 'rgba(207,232,255,.25)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(wx + 10, 770); ctx.lineTo(wx + 70, 850); ctx.lineTo(wx + 40, 900); ctx.stroke(); } // выбитые окна
  rr(380, 980, 180, 300, 4); fillOL('#020306', 5); // тёмный проём
  ctx.save(); ctx.translate(470, 690); ctx.rotate(.05); rr(-150, -40, 300, 80, 6); fillOL('#6b4a32', 4); txt('ШАХТА №9', 0, 3, 46, '#e8d6b8', { font: 'JBM', weight: 800, align: 'center' }); ctx.restore(); // вывеска
  ctx.fillStyle = '#dfe9f7'; ctx.fillRect(0, 1280, W, H);
  const k = E.out(win(t, 4.4, 7.4));
  ctx.fillStyle = '#dfe9f7'; ctx.fillRect(0, 1280, W, 900); if (k > 0) { ctx.save(); ctx.globalAlpha = clamp(k * 1.5); miner(470, lerp(1280, 1460, k), lerp(.7, 1.05, k), t, k); ctx.restore(); } ctx.restore(); snow(t, .9, 60, 1.2); }
function lampMirror(t) { rearSeat(t); const fl = .85 + .15 * Math.sin(t * 13) * Math.sin(t * 7); ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const cx = MIR.x + MIR.w / 2 + 40, cy = MIR.y + 120, g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 520); g.addColorStop(0, `rgba(255,252,235,${fl})`); g.addColorStop(.25, `rgba(255,240,200,${.7 * fl})`); g.addColorStop(1, 'rgba(255,230,180,0)');
  ctx.fillStyle = g; ctx.fillRect(MIR.x, MIR.y, MIR.w, MIR.h); ctx.strokeStyle = `rgba(255,250,230,${.5 * fl})`; ctx.lineWidth = 4; for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + t * .2; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * 600, cy + Math.sin(a) * 600); ctx.stroke(); } ctx.restore(); }
function highway(t) { ctx.fillStyle = '#03040a'; ctx.fillRect(0, 0, W, H); ctx.save(); ctx.beginPath(); ctx.moveTo(0, 200); ctx.lineTo(W, 200); ctx.lineTo(W, 1250); ctx.lineTo(0, 1250); ctx.clip();
  ctx.fillStyle = '#070a16'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#0c1020'; ctx.beginPath(); ctx.moveTo(500, 720); ctx.lineTo(560, 720); ctx.lineTo(1200, 1260); ctx.lineTo(-140, 1260); ctx.fill(); // дорога без фонарей
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(530, 1250, 0, 530, 1250, 700); g.addColorStop(0, 'rgba(255,236,180,.22)'); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); // фары
  ctx.fillStyle = 'rgba(223,233,247,.55)'; for (let i = 0; i < 6; i++) { const k = ((i / 6) + t * .9) % 1, y = lerp(730, 1260, k * k), w2 = lerp(3, 40, k * k); ctx.fillRect(530 - w2 / 2, y, w2, lerp(8, 90, k * k)); } // разметка
  const r = seeded(51); ctx.fillStyle = '#e8f2ff'; for (let i = 0; i < 90; i++) { const a = r() * Math.PI * 2, sp = (r() + t * (1.2 + r())) % 1, d = sp * sp * 900; ctx.globalAlpha = sp; ctx.fillRect(530 + Math.cos(a) * d, 720 + Math.sin(a) * d * .7, 3 + sp * 4, 3 + sp * 10); } ctx.globalAlpha = 1; ctx.restore();
  ctx.fillStyle = '#05060b'; ctx.beginPath(); ctx.moveTo(0, 1180); ctx.quadraticCurveTo(540, 1080, W, 1180); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill(); // торпеда
  for (const [gx, col] of [[400, '242,179,61'], [680, '61,220,132']]) { circle(gx, 1250, 70); fillOL('#0a0c16', 4); glow(gx, 1250, 90, `rgba(${col},.35)`); ctx.strokeStyle = `rgba(${col},.9)`; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(gx, 1250, 54, Math.PI * .8, Math.PI * (.8 + 1.2 * (.4 + .1 * Math.sin(t)))); ctx.stroke(); } // подсветка приборов
  const sq = 1 + .05 * Math.max(0, Math.sin(t * (6 + win(t, 16, 23) * 8)));
  ctx.lineCap = 'round'; ctx.strokeStyle = '#2a2e3d'; ctx.lineWidth = 70; ctx.beginPath(); ctx.ellipse(540, 1700, 520, 330, 0, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke(); // руль — виден целиком сверху
  ctx.strokeStyle = 'rgba(160,180,230,.25)'; ctx.lineWidth = 8; ctx.beginPath(); ctx.ellipse(540, 1675, 520, 330, 0, Math.PI * 1.15, Math.PI * 1.6); ctx.stroke();
  for (const s2 of [-1, 1]) { ctx.save(); ctx.translate(540 + s2 * 400, 1475); ctx.rotate(s2 * -.55); ctx.scale(sq, sq); rr(-62, -40, 124, 140, 50); fillOL('#e9b08a', 6); for (let i = 0; i < 4; i++) { rr(-58 + i * 30, -74, 27, 64, 12); fillOL('#e9b08a', 4); ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(-44 + i * 30, -66, 6, Math.PI, 0); ctx.stroke(); } ctx.restore(); } } // костяшки побелели
function momSilhouette(cx, cy) { ctx.fillStyle = '#05060a'; ctx.beginPath(); ctx.arc(cx, cy - 40, 90, Math.PI * .9, Math.PI * 2.1); ctx.lineTo(cx + 130, cy + 160); ctx.lineTo(cx - 130, cy + 160); ctx.closePath(); ctx.fill(); }
function mirrorGlitch(t) { const f = t >= 23.2 && t < 23.2 + 4 / 30; rearSeat(t); if (f) { momSilhouette(MIR.x + MIR.w / 2, MIR.y + 170); } else { ctx.save(); ctx.beginPath(); ctx.rect(MIR.x, MIR.y, MIR.w, MIR.h); ctx.clip(); miner(MIR.x + MIR.w / 2, MIR.y + MIR.h + 330, .9, t, .7); ctx.restore(); } }
function porch(t) { nightSky(); ctx.save(); ctx.translate(0, -240); ctx.fillStyle = '#141a30'; ctx.beginPath(); ctx.moveTo(60, 700); ctx.lineTo(540, 400); ctx.lineTo(1020, 700); ctx.closePath(); fillOL('#3a2d2a', 6); // крыша
  rr(100, 700, 880, 620, 4); fillOL('#4b3b33', 6); ctx.fillStyle = 'rgba(0,0,0,.2)'; for (let y = 720; y < 1320; y += 40) ctx.fillRect(100, y, 880, 4); // бревенчатая стена
  ctx.fillStyle = '#eef6ff'; ctx.beginPath(); ctx.moveTo(40, 705); ctx.lineTo(540, 390); ctx.lineTo(1040, 705); ctx.lineTo(1000, 712); ctx.lineTo(540, 410); ctx.lineTo(80, 712); ctx.fill(); // снег на крыше
  const lightOn = t < 36.0, op = E.out(win(t, 32.5, 33.1));
  rr(380, 860, 280, 460, 4); fillOL(lightOn ? '#ffd98a' : '#0a0c14', 6); if (lightOn) glow(520, 1080, 500 * op, 'rgba(255,200,110,.5)');
  ctx.save(); ctx.translate(380, 860); ctx.scale(1 - op * .8, 1); rr(0, 0, 280, 460, 4); fillOL('#5a3f2c', 6); circle(240, 240, 10); ctx.fillStyle = '#c9a36a'; ctx.fill(); ctx.restore(); // дверь открывается до стука
  if (op > .3) { const ak = E.out(win(t, 33.0, 33.6)); ctx.save(); ctx.translate(520, 1310); ctx.rotate(.06 * ak); ctx.fillStyle = lightOn ? '#1a1416' : '#05060a'; // старик-силуэт против света: наклон вперёд, руки навстречу
    ctx.beginPath(); ctx.moveTo(-70, 0); ctx.lineTo(-60, -260); ctx.lineTo(60, -260); ctx.lineTo(70, 0); ctx.fill(); rr(-55, -270, 110, 150, 30); ctx.fillStyle = lightOn ? '#d8d2c8' : '#111'; ctx.fill(); // майка
    ctx.fillStyle = lightOn ? '#1a1416' : '#05060a'; circle(0, -320, 52); ctx.fill(); for (const s2 of [-1, 1]) { ctx.save(); ctx.translate(s2 * 55, -250); ctx.rotate(s2 * lerp(.2, .95, ak)); rr(-14, 0, 28, 95, 14); ctx.fill(); ctx.translate(0, 88); ctx.rotate(s2 * -lerp(0, .9, ak)); rr(-13, 0, 26, 85, 13); ctx.fill(); circle(0, 88, 16); ctx.fill(); ctx.restore(); } ctx.restore(); } // локти согнуты, ладони вперёд
  rr(330, 1320, 380, 40, 4); fillOL('#3a2d2a', 5); // крыльцо
  rr(495, 780, 50, 40, 8); fillOL('#2b2b33', 4); if (lightOn) glow(520, 810, 260, 'rgba(255,220,150,.6)'); // лампа на крыльце
  const bk = win(t, 33.6, 35.6); if (bk > 0 && lightOn) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(255,250,225,${.35 * (1 - bk * .7)})`; ctx.beginPath(); ctx.moveTo(-100, lerp(1500, 1250, bk)); ctx.lineTo(lerp(-100, 520, bk), lerp(1250, 1100, bk)); ctx.lineTo(lerp(-100, 520, bk), lerp(1450, 1250, bk)); ctx.closePath(); ctx.fill(); ctx.restore(); } // луч фонаря уходит в дом
  ctx.fillStyle = '#dfe9f7'; ctx.fillRect(0, 1360, W, 900); ctx.restore(); snow(t, .8, 10); }
function rearDoor(t) { ctx.fillStyle = '#0a0d18'; ctx.fillRect(0, 0, W, H); const sl = t > 48.4 ? Math.sin((t - 48.4) * 55) * 16 * Math.exp(-(t - 48.4) * 8) : 0; ctx.save(); ctx.translate(sl, 0);
  rr(60, 300, 960, 1200, 50); fillOL('#1b2033', 8); const win2 = { x: 140, y: 380, w: 800, h: 560 }; rr(win2.x, win2.y, win2.w, win2.h, 30); fillOL('#0b1226', 6);
  ctx.save(); rr(win2.x, win2.y, win2.w, win2.h, 30); ctx.clip(); bokeh(t, 13, 14, 400, 900, .8); snow(t, .5, -30); FrostOverlay(E.io(win(t, 48.6, 51.8)), win2, 'edges', 71); ctx.restore();
  rr(700, 1100, 200, 50, 20); fillOL('#2b3149', 5); ctx.restore(); } // ручка
const SC = [
  [0, 3, 'e3s01', t => bigPay(t, 0), HUD(3, 17, 0, 0)],
  [3, 8, 'e3s02', t => push(t, 3, 8, () => bathhouse(t), 470, 1100), HUD(3, 20, 0, 3)],
  [8, 12, 'e3s03', t => push(t, 8, 12, () => MirrorShot(t, tt => lampMirror(tt)), 540, 720), HUD(3, 22, 10, 8)],
  [12, 16, 'e3s04', t => push(t, 12, 16, () => { windshield(t, .5); HandPhone(t, tt => PhoneScreen(tt, 'order', [['Получатель:'], ['81 год', true]], 12.1), { cracked: true }); }, 540, 800), HUD(3, 23, 0, 12)],
  [16, 19.5, 'e3s05a', t => push(t, 16, 19.5, () => highway(t), 540, 1000), HUD(3, 35, 0, 16)],
  [19.5, 23, 'e3s05b', t => push(t, 19.5, 23, () => highway(t), 540, 1450, 1.3, 1.55), HUD(3, 35, 3.5, 19.5)], // медленный наезд на костяшки
  [23, 28, 'e3s06', t => { MirrorShot(t, tt => mirrorGlitch(tt)); if (t >= 23.2 && t < 23.4) Glitch(t, 1); CornerTag(t, 'ПРАВИЛО 2'); }, HUD(3, 38, 0, 23)],
  [28, 28.9, 'e3s07a', t => push(t, 28, 28.9, () => bekaFace(t, { sweat: true }), CXC, 820), HUD(3, 40, 0, 28)],
  [28.9, 32, 'e3s07b', t => push(t, 28.9, 32, () => MirrorShot(t, tt => lampMirror(tt)), 540, 720, 1.05, 1.2), HUD(3, 40, 0.9, 28.9)], // «Молодец» звучит на зеркале с бликом фонаря
  [32, 35.5, 'e3s08a', t => push(t, 32, 35.5, () => porch(t), 520, 900), HUD(3, 52, 0, 32)],
  [35.5, 40, 'e3s08b', t => push(t, 35.5, 40, () => porch(t), 520, 900, 1.45, 1.6), HUD(3, 52, 3.5, 35.5)],
  [40, 44, 'e3s09', t => bigPay(t, 40), HUD(3, 54, 28.5, 40)],
  [44, 48, 'e3s10', t => { windshield(t, .4); HandPhone(t, tt => PhoneScreen(tt, 'system', [['Новый заказ'], ['Принят автоматически', true]], 44.1), { cracked: true }); Glitch(t, (t < 44.6 || (t > 46.4 && t < 46.7)) ? 1 : 0); }, HUD(3, 55, 0, 44)],
  [48, 52, 'e3s11', t => rearDoor(t), HUD(3, 55, 20, 48)],
  [52, 53, 'e3s12', t => { cabinBg3(t); ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(0, 0, W, H); }, HUD(3, 55, 40, 52)],
  [53, 55.6, 'e3s13a', t => { windshield(t, .4); HandPhone(t, tt => PhoneScreen(tt, 'order', [['Куда:'], ['⌂ Дом', true]], 53.1), { k: E.out(win(t, 53, 53.3)), cracked: true }); }, HUD(3, 55, 41, 53)],
  [55.6, 58.01, 'e3s13b', t => EndCard(t, 55.6, '', 'ЧАСТЬ 4 →'), null],
];

// ───── субтитры по голосу ─────
const T13 = VT('e3s13') || [];
const CAPS = buildCaptions([
  [0.0, 3.0, 'Вторая ночь. Заказ на **пять часов** чужой жизни', { times: VT('e3s01'), whole: true, size: 56, maxW: 940 }],
  [3.0, 8.0, 'Заброшенная баня шахты. Он вышел из **темноты**', { times: VT('e3s02') }],
  [8.0, 12.0, 'В зеркале — только **свет** его фонаря', { times: VT('e3s03') }],
  [12.0, 16.0, 'Получателю восемьдесят один. Его часы станут **моими**', { times: VT('e3s04') }],
  [16.0, 23.0, '— Бека… балам. Обернись. Это **я**', { times: VT('e3s05'), dead: true }],
  [23.0, 28.0, 'Голос мамы. Но мама **спит дома**', { times: VT('e3s06') }],
  [28.0, 32.0, '— **Молодец**', { times: VT('e3s07'), dead: true }],
  [32.0, 40.0, 'Старик открыл сам. Будто **ждал сына** тридцать лет', { times: VT('e3s08') }],
  [40.0, 44.0, 'Его пять часов. Теперь — **мои**', { times: VT('e3s09') }],
  [44.0, 48.0, 'Я **не нажимал** «принять»', { times: VT('e3s10') }],
  [53.0, 55.6, 'Адрес — **мой дом**.', { times: T13.slice(0, 3) }],
  [55.6, 58.0, 'Там спит **мама**', { times: T13.slice(3).map(x => Math.max(x, 55.7)), y: 880, size: 80, color: T.danger }], // крупно — только на финальной карточке
], { tail: .3 });
CAPS[0].a = 0; CAPS[0].words[0].t = 0; // первый кадр: субтитр уже виден
window.CAPTION_PHRASES = CAPS;

function drawFrame(t) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  let i = SC.length - 1; while (i > 0 && SC[i][0] > t) i--; const [a, b, id, draw, hud] = SC[i];
  ctx.save(); if (hud) cam(lerp(1, 1.03, E.io(win(t, a, b))), 540, 900, () => draw(t)); else draw(t); ctx.restore(); const k = 1 - win(t, a, a + .15); if (i > 0 && k > 0 && id !== 'e3s12') { ctx.fillStyle = `rgba(0,0,0,${k * .8})`; ctx.fillRect(0, 0, W, H); }
  post(t); if (hud) Hud(t, hud(t)); if (t < 3) PartSticker(3, t); KineticCaption(t, CAPS); }

// ───── звук ─────
const M = 'projects/schetchik/assets/music-ep3.wav';
const HB = (a, b, s0, s1) => { const r = []; let t = a; while (t < b) { r.push(+t.toFixed(2)); t += lerp(s0, s1, (t - a) / (b - a)); } return r; };
window.SFX_CUES = [
  { t: 0, type: 'file', path: M, gain: .1, dur: 52 }, { t: 53, type: 'file', path: M, gain: .08, from: 53, dur: 5 }, // тишина 52–53
  ...Object.entries(VO_AT).map(([id, t]) => ({ t, type: 'file', path: `projects/schetchik/assets/vo/ep3/${id}.wav`, gain: VO_GAIN[id] || 3.0 })),
  { t: 0.0, type: 'lib', id: 'notification-alert-clear', gain: .5 }, ...HB(0.2, 3, .8, .8).map(t => ({ t, type: 'heartbeat', gain: .13 })),        // ping, heartbeat
  { t: 3, type: 'lib', id: 'bsb-wind-whistle-chimney', gain: .12, align: 'start', dur: 5 }, { t: 4.6, type: 'lib', id: 'bsb-heavy-chain', gain: .25, align: 'start', dur: 1.5 }, // wind_howl, metal_clang
  { t: 10.4, type: 'lib', id: 'bsb-cough-man', gain: .25, align: 'start', dur: 1.4 },                                                            // cough_heavy
  { t: 12.15, type: 'lib', id: 'click-button-soft', gain: .6 },                                                                                 // ui_click
  { t: 16, type: 'tires', dur: 7, gain: .05 }, ...HB(16.3, 23, .9, .38).map(t => ({ t, type: 'heartbeat', gain: .1 })),                           // heartbeat ускоряется
  { t: 23.2, type: 'lib', id: 'digital-glitch-clear', gain: .5 }, { t: 29.0, type: 'lib', id: 'impact-deep-hard', gain: .5 },                    // Glitch, удар баса
  { t: 32.5, type: 'lib', id: 'bsb-door-creak-open', gain: .35, align: 'start', dur: 1.5 }, { t: 36.0, type: 'lib', id: 'click-button-firm', gain: .5, rate: .7 }, // door_creak, switch_click
  { t: 41.5, type: 'lib', id: 'money-coin-drop', gain: .5, rate: .62 },                                                                         // coin_distorted
  { t: 44.1, type: 'lib', id: 'digital-glitch-clear', gain: .45 }, { t: 46.4, type: 'lib', id: 'digital-glitch-subtle', gain: .4 },             // glitch
  { t: 48.4, type: 'lib', id: 'bsb-car-door-slam-inside', gain: .7, align: 'start', dur: 1.2 }, { t: 48.7, type: 'lib', id: 'bsb-ice-crack-2', gain: .45, align: 'start', dur: 2 }, // slam, ice_crack
  { t: 53.0, type: 'lib', id: 'notification-alert-clear', gain: .5 }, { t: 55.6, type: 'lib', id: 'impact-deep-firm', gain: .35 },               // ping в конце
];
window.STORYBOARD = { episode: 3, title: 'Шахта', duration: DUR, hud: { night: 2, temp: '−28°', balanceStart: '49:32:00' },
  scenes: SC.map(([a, b, id, , hud]) => { const h = hud ? hud(a + .01) : null; const c = CAPS.filter(p => p.a >= a - .01 && p.a < b);
    return { id, start: a, end: +b.toFixed(2), vo: c.length ? { speaker: id === 'e3s05' ? 'mom_voice' : id === 'e3s07' ? 'dead_voice' : 'beka', text: c.map(p => p.words.map(w => w.text).join(' ')).join(' '), accent: c.flatMap(p => p.words.filter(w => w.accent).map(w => w.text)) } : null,
      sfx: window.SFX_CUES.filter(s => s.t >= a && s.t < b).map(s => ({ id: s.id || s.type, at: s.t })), hud: h ? { time: h.time, balance: h.balance === undefined ? null : hms(h.balance) } : null, overlays: a === 0 ? ['PartSticker:3'] : id === 'e3s13b' ? ['EndCard'] : id === 'e3s06' ? ['Glitch', 'RuleCard:2'] : [] }; }) };
window.renderFrame = t => drawFrame(Math.min(t, DUR - .001));
window.READY = Promise.all(['900 72px Mont', '700 34px JBM', '800 34px JBM'].map(f => document.fonts.load(f))).then(() => drawFrame(0));
