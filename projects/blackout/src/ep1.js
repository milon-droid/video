// «Блэкаут» · серия 1 «Тень над городом» (0:58). Сценарий после проверки — plan.md (22 плана).
// Хук = тот же миг, что блэкаут в 0:43 (лицо Диаса, город гаснет в очках) → перемотка 20:03 → 20:00.
// Клиффхэнгер: 1 с тишины в лучах фонариков → стук, дверь вздрагивает, под дверью свет и тень ног → «КТО ЗА ДВЕРЬЮ?».
'use strict';
const DUR = 58, EP = 1;
window.SCENE = { duration: DUR, fps: 30, width: W, height: H };
initLib(document.getElementById('c'));
const OUT = 42.75; // блэкаут Алматы, 20:03
const VO_AT = { e1n01: .05, e1n02: 3.15, e1n03: 5.55, e1n04: 8.15, e1n05: 10.95, e1n06: 13.15, e1n07: 18.15, e1n08: 20.75, e1n09: 26.2, e1d01: 28.4, e1d02: 31.7, e1d03: 35.75, e1d04: 38.9, e1n10: 45.7, e1n11: 53.95 };
const VO_GAIN = { e1n06: 6.5, e1n11: 8 };
const VO_CUT = { e1d04: 1.98 }; // диктор обрывается на «гр…»
const VT = id => window.VO_WORDS && VO_WORDS[id] ? VO_WORDS[id].map(x => +(x + VO_AT[id]).toFixed(3)) : null;
const mouthOf = (t, id) => window.VO_MOUTH && t < VO_AT[id] + (VO_CUT[id] || 9) ? AK.mouth(t, VO_MOUTH[id], VO_AT[id]) : 0;
const anchorMouth = t => Math.max(...['e1d01', 'e1d02', 'e1d03', 'e1d04'].map(id => mouthOf(t, id)));
const hookTimes = (() => { const v = VT('e1n01'); if (v) v[0] = 0; return v; })(); // субтитр виден с первого кадра
const CAPS = buildCaptions([
  [0, 3.0, 'В тот вечер в Алматы погас **весь свет**', { times: hookTimes }],
  [3.0, 5.5, 'Восемь вечера. Поздняя осень.', { times: VT('e1n02') }],
  [5.5, 8.0, 'Старая **сталинка** в центре', { times: VT('e1n03') }],
  [8.0, 10.85, 'Четверо студентов ужинали.', { times: VT('e1n04') }],
  [10.85, 13.0, 'Обычный **уютный** вечер.', { times: VT('e1n05') }],
  [13.0, 15.8, 'Над крышей с рёвом пронёсся **истребитель**.', { times: VT('e1n06') }],
  [18.0, 20.6, 'Парни схватились за **телефоны**.', { times: VT('e1n07') }],
  [20.6, 23.7, 'Мессенджер завис. Связь пропала **полностью**.', { times: VT('e1n08') }],
  [26.0, 28.2, 'Оставался только **телевизор**.', { times: VT('e1n09') }],
  [28.2, 31.6, 'Внимание. **Экстренное** сообщение.', { times: VT('e1d01'), speaker: 'anchor' }],
  [31.6, 35.5, 'Юг России, Восточная Европа и Кавказ **без света**', { times: VT('e1d02'), speaker: 'anchor' }],
  [35.5, 38.8, 'Обесточен весь **Западный Казахстан**.', { times: VT('e1d03'), speaker: 'anchor' }],
  [38.8, 40.95, 'Над Волгоградом **аномальные…**', { times: (VT('e1d04') || []).slice(0, 3), speaker: 'anchor' }],
  [45.4, 49.2, 'Через секунду во тьму погрузился весь **Алматы**.', { times: VT('e1n10') }],
  [53.0, 56.7, 'И в этой тишине кто-то **постучал** в дверь.', { times: VT('e1n11'), whisper: 1 }],
]);
const shk = (t, list) => list.reduce((a, [t0, amp, d]) => { const s = ScreenShake(t, t0, amp, d); return [a[0] + s[0], a[1] + s[1]]; }, [0, 0]);
const dimAll = a => { ctx.fillStyle = `rgba(5,7,16,${a})`; ctx.fillRect(-300, -300, W + 600, H + 600); };
const warmWash = a => { ctx.save(); ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = `rgba(255,170,80,${a})`; ctx.fillRect(-300, -300, W + 600, H + 600); ctx.restore(); };
function nameTag(t, t0, x, y, text, hx, hy) { const k = AK.overshoot(win(t, t0, t0 + .22)); if (k <= 0) return; ctx.save(); ctx.globalAlpha = clamp(k);
  ctx.strokeStyle = 'rgba(244,241,234,.8)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, y + 30); ctx.lineTo(lerp(x, hx, clamp(k)), lerp(y + 30, hy, clamp(k))); ctx.stroke(); ctx.fillStyle = T.text; circle(hx, hy, 7); ctx.fill();
  ctx.translate(x, y); ctx.scale(k, k); ctx.font = '900 42px Mont'; const w = ctx.measureText(text).width + 40; ctx.fillStyle = 'rgba(11,16,32,.88)'; rr(-w / 2, -30, w, 60, 14); ctx.fill(); ctx.fillStyle = T.window; ctx.fillRect(-w / 2 + 10, 26, w - 20, 4);
  txt(text, 0, 2, 42, T.text, { align: 'center' }); ctx.restore(); }

// ───── 1 и 17. Лицо Диаса: огни гаснут в очках (u — время от начала плана; блэкаут при u = .65) ─────
function hookFace(t, t0) { const u = t - t0, fl = u < .3 ? 1 : u < .65 ? (Math.sin(u * 70) > -.2 ? .85 : .2) : 0, wave = win(u, .65, 1.5), ph = E.out(win(u, .95, 1.5));
  const lightK = x01 => clamp((x01 + .1) - wave * 1.25) > 0 ? 1 : 0; // огонь в точке x01 (0 — запад) ещё горит?
  LIGHT.dark = lerp(.82, 0, fl);
  wallpaper(-200, 0, W + 400, H); if (fl > 0) glow(540, -100, 900, `rgba(255,190,100,${.5 * fl})`);
  // боке окна за героем — мягкие пятна, гаснут волной
  const r = seeded(77); for (let i = 0; i < 16; i++) { const bx = r() * 1080, by = 350 + r() * 500, br = 40 + r() * 70; if (lightK(bx / 1080)) AK.puff(bx, by, br, '242,179,61', .3 + r() * .2); }
  const sc = 3.05, rx = u > .65 ? ScreenShake(t, t0 + .65, 6, .6) : [0, 0]; ctx.save(); ctx.translate(rx[0], rx[1]);
  bust(540, 1150, sc, t, 'dias', { noArms: 1, look: [0, u > .7 ? -.25 : 0], brow: lerp(0, 1, E.out(win(u, .68, .85))), wide: lerp(1, 1.3, E.out(win(u, .68, .85))), blink: u > .6 && u < .74 ? .3 : AK.blink(t, 1),
    smile: lerp(.3, -.2, win(u, .7, 1)), under: ph * .95, underRgb: '127,179,255',
    lens: (cx, cy, gw, gh) => { ctx.fillStyle = 'rgba(14,21,48,.85)'; ctx.fillRect(cx - gw / 2, cy - gh / 2, gw, gh); ctx.fillStyle = 'rgba(40,52,90,.9)'; ctx.beginPath(); ctx.moveTo(cx - gw / 2, cy); for (let i = 0; i <= 6; i++) ctx.lineTo(cx - gw / 2 + gw * i / 6, cy - gh * (.05 + .12 * Math.sin(i * 2.3))); ctx.lineTo(cx + gw / 2, cy + gh / 2); ctx.lineTo(cx - gw / 2, cy + gh / 2); ctx.fill();
      const rr2 = seeded(5); for (let i = 0; i < 46; i++) { const px = rr2(), py = rr2(); if (!lightK(px)) continue; ctx.fillStyle = `rgba(255,200,90,${.6 + rr2() * .4})`; ctx.fillRect(cx - gw / 2 + px * gw, cy + py * gh * .45, 5, 5); }
      if (fl > 0) glow(cx - gw * .2, cy - gh * .4, gw * .5, `rgba(255,220,150,${.6 * fl})`); if (ph > 0) glow(cx, cy + gh * .5, gw * .6, `rgba(127,179,255,${.35 * ph})`); } });
  ctx.restore(); if (ph > 0) glow(540, 1500, 420, `rgba(127,179,255,${.35 * ph})`); }
// ───── 2. Угол дома: таблички улиц, фонарь, падает лист ─────
function signs(t) { LIGHT.dark = 0; nightSky(t); mountains(760, t, { amp: .8 });
  ctx.save(); ctx.fillStyle = '#7E654D'; ctx.beginPath(); ctx.moveTo(-100, 160); ctx.lineTo(560, 260); ctx.lineTo(560, H + 100); ctx.lineTo(-100, H + 100); ctx.fill();
  ctx.fillStyle = '#5E4A38'; ctx.beginPath(); ctx.moveTo(560, 260); ctx.lineTo(1200, 140); ctx.lineTo(1200, H + 100); ctx.lineTo(560, H + 100); ctx.fill();
  ctx.strokeStyle = 'rgba(30,20,15,.35)'; ctx.lineWidth = 4; for (let i = 0; i < 12; i++) { const y = 420 + i * 120; ctx.beginPath(); ctx.moveTo(-100, y - 100 * .15); ctx.lineTo(560, y); ctx.lineTo(1200, y - 640 * .19); ctx.stroke(); } // руст
  ctx.fillStyle = '#9C8468'; ctx.beginPath(); ctx.moveTo(-100, 120); ctx.lineTo(560, 220); ctx.lineTo(1200, 100); ctx.lineTo(1200, 150); ctx.lineTo(560, 270); ctx.lineTo(-100, 170); ctx.fill(); // карниз
  const plate = (x, y, w, h, shear, small, big, size) => { ctx.save(); ctx.translate(x, y); ctx.transform(1, shear, 0, 1, 0, 0); ctx.fillStyle = 'rgba(0,0,0,.35)'; rr(8, 12, w, h, 10); ctx.fill(); ctx.fillStyle = '#1F4E8C'; rr(0, 0, w, h, 10); ctx.fill(); ctx.strokeStyle = '#F4F1EA'; ctx.lineWidth = 6; rr(10, 10, w - 20, h - 20, 6); ctx.stroke();
    txt(small, w / 2, 52, 36, '#F4F1EA', { align: 'center', weight: 800 }); txt(big, w / 2, h / 2 + 26, size, '#F4F1EA', { align: 'center' }); ctx.restore(); };
  plate(70, 600, 440, 230, .15, 'ПРОСПЕКТ', 'АБАЯ', 96); plate(610, 660, 420, 230, -.19, 'УЛИЦА', 'БАЙТУРСЫНОВА', 50);
  ctx.fillStyle = '#3A3F4A'; ctx.fillRect(520, 260, 22, H); // водосток на углу
  ctx.restore(); streetLamp(160, 1900, 1150, 1); glow(250, 760, 500, 'rgba(242,179,61,.28)'); warmWash(.15);
  fallingLeaves(t, 6, 3, { s: 1.5, area: [0, 1080, 1000, 1900] }); leaf(lerp(860, 520, win(t, 3, 5.4)), lerp(920, 1500, win(t, 3, 5.4)), 2.4, t * 3.2, '#F2C14E'); }
// ───── 3. Фасад сталинки снизу, наезд на окно Диаса ─────
function facade(t) { LIGHT.dark = 0; nightSky(t); mountains(720, t, { amp: 1.2, seed: 8 });
  const bottom = stalinka(-40, 520, 1160, 250, t, { lit: (f, j) => { const r = seeded(f * 7 + j * 3 + 1)(); if (f === 1 && j === 2) return { on: 1, who: 1, col: '#FFD27A' }; return { on: r > .3 ? .85 + r * .15 : 0, who: r > .8 }; } });
  ctx.fillStyle = '#2A2C34'; ctx.fillRect(-100, bottom, W + 200, 400); ctx.fillStyle = '#3A3D46'; ctx.fillRect(-100, bottom, W + 200, 30);
  const wy = 520 + 40 + 250; chandelier(540, wy + 20, .35, t, { on: 1 }); // люстра в окне Диаса
  for (const [tx, s] of [[-60, 1.3], [1130, 1.2]]) { ctx.fillStyle = '#2B2016'; ctx.fillRect(tx - 18 * s, 900, 36 * s, 1100); const r = seeded(tx + 999); for (let i = 0; i < 70; i++) leaf(tx + (r() - .5) * 420 * s, 800 + r() * 500, 1.7 * s, r() * 6, ['#E8A42A', '#D9782A', '#F2C14E', '#B85A1E'][i % 4]); }
  streetLamp(860, 1900, 820, 1); fallingLeaves(t, 9, 11, { s: 1.4 }); warmWash(.12); }
// ───── комната (общий план) ─────
const SEATS = { nurs: [425, 850, .82], beib: [680, 860, .84], dias: [175, 975, 1.06], alik: [905, 980, 1.06] };
function roomBg(t, { on = 1, swing = 0, jit = 0, lights = 1, chY = 260, chS = 1 } = {}) { wallpaper(-200, 0, W + 400, H); carpet(240, 400, 600, 380); cityWindow(880, 360, 300, 600, t, () => lights); chandelier(540, chY, chS, t, { swing, on, jit }); }
function tableTop(t, { jit = 0 } = {}) { table(1150); plov(540, 1225, .85); teapot(805, 1185, .55); bread(290, 1190, .6); for (const [x, y, s] of [[330, 1262, .6], [430, 1198, .55], [655, 1200, .55], [770, 1268, .6]]) kese(x, y, s, { jitter: jit * Math.sin(t * 60 + x) }); }
function dinnerWide(t) { LIGHT.dark = 0; roomBg(t);
  const talk = (sd) => Math.max(0, Math.sin(t * 7 + sd * 2)) * (Math.sin(t * 1.3 + sd) > .2 ? .6 : 0);
  const P = { nurs: { look: [.3, 0], mouth: talk(2), smile: .5, part: 'body' }, beib: { look: [-.3, 0], smile: .8, mouth: talk(5), part: 'body' }, dias: { look: [.5, .1], smile: .6, part: 'body' }, alik: { look: [-.5, .1], mouth: talk(9), part: 'body' } };
  const H0 = {}; for (const k of ['nurs', 'beib', 'dias', 'alik']) H0[k] = bust(...SEATS[k], t, k, P[k]);
  tableTop(t); steam(430, 1170, t, .8, .7); steam(655, 1172, t + 1, .8, .7);
  bust(...SEATS.nurs, t, 'nurs', { part: 'arms', armL: { to: [370, 1180] }, armR: { to: [470, 1190] } }); bust(...SEATS.beib, t, 'beib', { part: 'arms', armL: { to: [610, 1190] }, armR: { to: [720, 1180] } });
  bust(...SEATS.dias, t, 'dias', { part: 'arms', armL: { to: [90, 1300] }, armR: { to: [320, 1235] } }); bust(...SEATS.alik, t, 'alik', { part: 'arms', armL: { to: [760, 1240] }, armR: { to: [990, 1300] } });
  warmWash(.18); const tg = VT('e1n04') ? VT('e1n04')[0] : 8.2;
  nameTag(t, tg + .05, 175, 640, 'ДИАС', H0.dias.hx, H0.dias.hy - 100); nameTag(t, tg + .2, 380, 470, 'НУРСУЛТАН', H0.nurs.hx, H0.nurs.hy - 100); nameTag(t, tg + .35, 720, 560, 'БЕЙБАРЫС', H0.beib.hx, H0.beib.hy - 70); nameTag(t, tg + .5, 905, 690, 'АЛИХАН', H0.alik.hx, H0.alik.hy - 100); }
// ───── 5. Вставка: механические часы Алихана, 20:00, секундная стрелка ─────
function watchInsert(t) { LIGHT.dark = 0; const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#4A2C26'); g.addColorStop(.45, '#7a5a44'); g.addColorStop(1, '#E8DCC4'); ctx.fillStyle = g; ctx.fillRect(-200, -200, W + 400, H + 400);
  AK.puff(200, 500, 300, '242,179,61', .35); AK.puff(880, 380, 220, '242,179,61', .3); ctx.fillStyle = 'rgba(178,42,46,.5)'; ctx.fillRect(-200, 1560, W + 400, 50); // размытая кайма скатерти
  const lift = E.out(win(t, 10.9, 12.2)) * 40;
  ctx.save(); ctx.translate(0, -lift); kese(400, 900, 2.9); steam(400, 790, t, 1, 2.4); // рука в клетчатом рукаве
  ctx.fillStyle = '#A8432C'; ctx.beginPath(); ctx.moveTo(1250, 1250); ctx.lineTo(1250, 1650); ctx.lineTo(760, 1150); ctx.lineTo(820, 900); ctx.closePath(); ctx.fill(); ctx.save(); ctx.clip(); ctx.strokeStyle = '#5E2216'; ctx.lineWidth = 16; for (let i = -8; i < 12; i++) { ctx.beginPath(); ctx.moveTo(600 + i * 70, 700); ctx.lineTo(1100 + i * 70, 1700); ctx.moveTo(600, 700 + i * 70); ctx.lineTo(1300, 300 + i * 70); ctx.stroke(); } ctx.restore();
  ctx.fillStyle = '#F4F1EA'; ctx.beginPath(); ctx.moveTo(820, 900); ctx.lineTo(760, 1150); ctx.lineTo(730, 1130); ctx.lineTo(790, 885); ctx.fill(); // манжета
  ctx.fillStyle = '#E6B48C'; ctx.beginPath(); ctx.moveTo(800, 910); ctx.quadraticCurveTo(620, 880, 520, 860); ctx.quadraticCurveTo(470, 900, 520, 960); ctx.quadraticCurveTo(640, 1010, 760, 1110); ctx.fill(); // запястье и кисть
  for (let i = 0; i < 4; i++) { ctx.fillStyle = '#E6B48C'; rr(470 - i * 4, 800 + i * 50, 120, 46, 22); ctx.fill(); ctx.fillStyle = 'rgba(150,60,50,.18)'; rr(470 - i * 4, 836 + i * 50, 120, 8, 4); ctx.fill(); }
  cutShade((dx, dy) => { ctx.moveTo(800 + dx, 910 + dy); ctx.quadraticCurveTo(620 + dx, 880 + dy, 520 + dx, 860 + dy); ctx.quadraticCurveTo(470 + dx, 900 + dy, 520 + dx, 960 + dy); ctx.quadraticCurveTo(640 + dx, 1010 + dy, 760 + dx, 1110 + dy); ctx.closePath(); }, 0, -24);
  // часы
  const cx = 690, cy = 990; ctx.save(); ctx.translate(cx, cy); ctx.rotate(-.42); ctx.fillStyle = '#6B3E22'; rr(-60, -250, 120, 500, 20); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 3; for (let i = -5; i <= 5; i++) { ctx.beginPath(); ctx.moveTo(-50, i * 44); ctx.lineTo(50, i * 44); ctx.stroke(); }
  ctx.fillStyle = '#C9A45A'; circle(0, 0, 170); ctx.fill(); ctx.fillStyle = '#B08A40'; rr(160, -20, 30, 40, 8); ctx.fill(); ctx.fillStyle = '#F2E8D2'; circle(0, 0, 148); ctx.fill();
  for (let i = 0; i < 60; i++) { ctx.save(); ctx.rotate(i * Math.PI / 30); ctx.fillStyle = '#2a2420'; ctx.fillRect(-(i % 5 ? 2 : 5), -140, i % 5 ? 4 : 10, i % 5 ? 12 : 26); ctx.restore(); }
  const hand = (ang, len, w, col) => { ctx.save(); ctx.rotate(ang); ctx.fillStyle = col; rr(-w / 2, -len, w, len + 20, w / 2); ctx.fill(); ctx.restore(); };
  hand(Math.PI * 2 * 8 / 12, 80, 14, '#1d1916'); hand(0, 118, 9, '#1d1916'); const sec = Math.floor((t - 10.8) / 1) + Math.min(1, ((t - 10.8) % 1) / .08); hand(sec * Math.PI / 30, 132, 4, '#C0392B'); ctx.fillStyle = '#1d1916'; circle(0, 0, 10); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.beginPath(); ctx.ellipse(-50, -60, 70, 36, -.6, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  ctx.restore(); warmWash(.2); }
// ───── 6. Снизу на крыши: пролёт истребителя, тень по фасадам ─────
function jetSky(t) { LIGHT.dark = 0; nightSky(t, { cityGlow: 1.2 }); const k = win(t, 13.2, 14.9), jx = lerp(-500, 1600, k), jy = lerp(1350, 150, k);
  const VP = [540, -2200]; // точка схода вертикалей
  const side = (xb0, xb1, ytop, col) => { const at = (xb, y) => xb + (VP[0] - xb) * (H + 100 - y) / (H + 100 - VP[1]); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(xb0, H + 100); ctx.lineTo(at(xb0, ytop), ytop); ctx.lineTo(at(xb1, ytop), ytop); ctx.lineTo(xb1, H + 100); ctx.fill();
    for (let r = 0; r < 7; r++) for (let c = 0; c < 3; c++) { const y = 1750 - r * 190, x = lerp(xb0, xb1, (c + .5) / 3); if (y - 120 < ytop) continue; const on = seeded(r * 9 + c + xb0)() > .3; ctx.fillStyle = on ? 'rgba(242,179,61,.85)' : '#141a2c'; const px = at(x, y); rr(px - 34, y - 110, 68, 100, 4); ctx.fill(); }
    ctx.fillStyle = mix(col, '#ffffff', .12); ctx.beginPath(); ctx.moveTo(at(xb0, ytop) - 20, ytop - 30); ctx.lineTo(at(xb1, ytop) + 20, ytop - 30); ctx.lineTo(at(xb1, ytop), ytop); ctx.lineTo(at(xb0, ytop), ytop); ctx.fill(); };
  side(-300, 380, 520, '#6E5946'); side(720, 1380, 620, '#5A4838');
  // тень самолёта скользит по фасадам
  ctx.save(); ctx.globalAlpha = .45 * Math.sin(k * Math.PI); ctx.fillStyle = '#05060c'; ctx.beginPath(); ctx.moveTo(jx - 300, jy + 500); ctx.lineTo(jx + 100, jy + 300); ctx.lineTo(jx + 300, jy + 700); ctx.lineTo(jx - 100, jy + 900); ctx.fill(); ctx.restore();
  for (let i = 0; i < 6; i++) { ctx.strokeStyle = `rgba(220,225,255,${.12 * Math.sin(k * Math.PI)})`; ctx.lineWidth = 3; ctx.beginPath(); const oy = (i - 3) * 60; ctx.moveTo(jx - 300, jy + oy + 170); ctx.lineTo(jx - 900, jy + oy + 500); ctx.stroke(); }
  jetSilhouette(jx, jy, lerp(.9, 1.35, Math.sin(k * Math.PI)), -.5, t); warmWash(.1); }
// ───── 7. Комната: люстра качается, посуда дрожит, парни пригнулись ─────
function roomShake(t) { LIGHT.dark = 0; const u = t - 15.4, sw = .2 * Math.sin(u * 5.2) * Math.exp(-u * .5) + .03, fl = Math.sin(t * 35) > .7 ? .82 : 1;
  roomBg(t, { swing: sw, jit: 6 * Math.exp(-u * .6), chY: 420, chS: 1.45, on: fl });
  const looks = { brow: 1, wide: 1.3, duck: .35 };
  bust(290, 1180, 1.45, t, 'dias', { ...looks, look: [.3, -1], part: 'body', mouth: .35 }); bust(800, 1190, 1.45, t, 'alik', { ...looks, look: [-.3, -1], part: 'body', mouth: .5 });
  table(1380); for (const [x, s] of [[420, .8], [640, .8]]) kese(x, 1440, s, { jitter: 5 * Math.exp(-u * .7) * Math.sin(t * 70 + x) });
  bust(290, 1180, 1.45, t, 'dias', { part: 'arms', duck: .35, armL: [.35, -.5], armR: { to: [470, 1410], flip: 1 } }); bust(800, 1190, 1.45, t, 'alik', { part: 'arms', armL: [2.6, .5], armR: { to: [920, 1450] } });
  FX.emote(t, 15.55, '!', 170, 650, 1); FX.emote(t, 15.7, '!', 940, 640, 1); warmWash(.18 * fl); }
// ───── 8. Сверху над столом: руки хватают телефоны ─────
const GRABS = [ // [край, телефон, время, рукав, особенность]
  { from: [-200, 640], ph: [300, 640], t0: 18.2, col: '#D49A2E' }, { from: [700, -250], ph: [720, 560], t0: 18.55, col: '#3E5A63' },
  { from: [1300, 1080], ph: [820, 1040], t0: 18.9, col: '#A8432C', watch: 'mech' }, { from: [-200, 1620], ph: [330, 1560], t0: 19.25, col: '#26357F', watch: 'smart', stripes: 1 }];
function grabPhones(t) { LIGHT.dark = 0; ctx.fillStyle = '#EFE6D4'; ctx.fillRect(-200, -200, W + 400, H + 400); ctx.strokeStyle = '#B22A2E'; ctx.lineWidth = 30; ctx.strokeRect(-40, 120, 1160, 1700); ctx.lineWidth = 6; ctx.strokeRect(10, 170, 1060, 1600);
  for (let i = 0; i < 12; i++) { ctx.fillStyle = 'rgba(178,42,46,.5)'; ctx.save(); ctx.translate(40 + i * 90, 190); ctx.rotate(Math.PI / 4); ctx.fillRect(-12, -12, 24, 24); ctx.restore(); }
  ctx.fillStyle = '#E9E1D0'; circle(540, 900, 250); ctx.fill(); ctx.strokeStyle = '#2E5AA8'; ctx.lineWidth = 12; circle(540, 900, 225); ctx.stroke(); ctx.fillStyle = '#E8B95A'; circle(540, 900, 190); ctx.fill(); const r = seeded(4); for (let i = 0; i < 40; i++) { ctx.fillStyle = i % 3 ? '#E07A2A' : '#7A3E22'; const a = r() * 6.28, d = r() * 160; rr(540 + Math.cos(a) * d, 900 + Math.sin(a) * d, 28, 10, 4); ctx.fill(); }
  for (const [x, y] of [[230, 420], [860, 380], [880, 1330], [200, 1240]]) { ctx.fillStyle = '#F4F1EA'; circle(x, y, 62); ctx.fill(); ctx.fillStyle = '#8A4A1C'; circle(x, y, 48); ctx.fill(); ctx.strokeStyle = '#2E5AA8'; ctx.lineWidth = 6; circle(x, y, 60); ctx.stroke(); }
  ctx.fillStyle = '#C98A44'; circle(860, 760, 110); ctx.fill(); ctx.fillStyle = '#E2B26C'; circle(860, 760, 66); ctx.fill();
  ctx.fillStyle = 'rgba(30,12,40,.12)'; for (const g of GRABS) { rr(g.ph[0] - 70 + 10, g.ph[1] - 120 + 14, 140, 240, 20); ctx.fill(); }
  for (const g of GRABS) { const u = t - g.t0, reach = E.out(clamp(u / .28)), back = E.io(clamp((u - .5) / .55)), k = reach - back * 1.1;
    const hx = lerp(g.from[0], g.ph[0], k), hy = lerp(g.from[1], g.ph[1], k), has = u > .3;
    if (!has) phoneObj(g.ph[0], g.ph[1], 1.9, 0, { screen: 0 }); if (k <= -.05) continue;
    const ang = Math.atan2(hy - g.from[1], hx - g.from[0]), wide = 120; ctx.fillStyle = g.col; ctx.save(); ctx.translate(hx, hy); ctx.rotate(ang); rr(-1600, -wide / 2, 1600, wide, 50); ctx.fill();
    if (g.stripes) { ctx.fillStyle = '#E9ECF2'; ctx.fillRect(-1600, -wide / 2 + 12, 1600, 12); }
    ctx.fillStyle = '#F2D2B0'; if (g.col === '#A8432C') ctx.fillStyle = '#E6B48C'; ctx.beginPath(); ctx.ellipse(30, 0, 80, 66, 0, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(50, has ? -48 : -70, 50, 22, -.4, 0, Math.PI * 2); ctx.fill();
    if (g.watch) { ctx.save(); ctx.translate(-110, 0); ctx.rotate(Math.PI / 2); watchOnWrist(0, 0, 0, 120, g.watch); ctx.restore(); }
    ctx.restore(); if (has) phoneObj(hx + Math.cos(ang) * 40, hy + Math.sin(ang) * 40, 1.9, ang + Math.PI / 2, { screen: .6 }); }
  warmWash(.12); }
// ───── 9. Телефон в руке: вымышленный мессенджер, «Connecting…» ─────
const PH = { x: 300, y: 330, w: 480, h: 780 };
function phoneMessenger(t) { LIGHT.dark = 0; wallpaper(-200, 0, W + 400, H); ctx.save(); ctx.globalAlpha = .5; carpet(80, 300, 900, 600); ctx.restore(); dimAll(.25); glow(540, 700, 700, 'rgba(127,179,255,.25)');
  const lost = t >= 22.6, sp = t * 6;
  ctx.fillStyle = '#D49A2E'; ctx.beginPath(); ctx.moveTo(320, H + 50); ctx.lineTo(420, 1160); ctx.lineTo(700, 1160); ctx.lineTo(820, H + 50); ctx.fill(); // рукав
  ctx.fillStyle = '#E2A97F'; ctx.beginPath(); ctx.ellipse(560, 1080, 230, 150, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#0d0f16'; rr(PH.x - 16, PH.y - 16, PH.w + 32, PH.h + 32, 56); ctx.fill(); ctx.save(); rr(PH.x, PH.y, PH.w, PH.h, 44); ctx.clip();
  ctx.fillStyle = '#121a33'; ctx.fillRect(PH.x, PH.y, PH.w, PH.h); txt('20:01', PH.x + 40, PH.y + 40, 26, 'rgba(244,241,234,.8)', { font: 'JBM', weight: 700 });
  for (let i = 0; i < 4; i++) { ctx.fillStyle = (lost || i < 4 - Math.floor(win(t, 21.2, 22.6) * 4)) ? (lost ? 'rgba(229,56,59,.9)' : '#F4F1EA') : 'rgba(244,241,234,.2)'; rr(PH.x + PH.w - 120 + i * 16, PH.y + 50 - i * 8, 10, 10 + i * 8, 2); ctx.fill(); }
  ctx.fillStyle = '#1b2547'; ctx.fillRect(PH.x, PH.y + 80, PH.w, 96); for (const [i, c] of [[0, '#D49A2E'], [1, '#3E5A63'], [2, '#26357F'], [3, '#A8432C']]) { ctx.fillStyle = c; circle(PH.x + 60 + i * 44, PH.y + 128, 26); ctx.fill(); ctx.strokeStyle = '#1b2547'; ctx.lineWidth = 5; ctx.stroke(); }
  const bub = (y, w, mine, col) => { ctx.fillStyle = col; rr(mine ? PH.x + PH.w - 30 - w : PH.x + 30, y, w, 70, 26); ctx.fill(); };
  bub(PH.y + 220, 260, 0, '#24305a'); bub(PH.y + 310, 200, 0, '#24305a'); bub(PH.y + 400, 280, 1, '#2f6fd6');
  const ic = PH.x + PH.w - 60, iy = PH.y + 495; if (lost) { ctx.fillStyle = T.danger; circle(ic, iy, 20); ctx.fill(); txt('!', ic, iy + 2, 32, '#fff', { align: 'center' }); } else { ctx.strokeStyle = 'rgba(244,241,234,.8)'; ctx.lineWidth = 4; circle(ic, iy, 16); ctx.stroke(); ctx.beginPath(); ctx.moveTo(ic, iy); ctx.lineTo(ic + Math.cos(sp) * 11, iy + Math.sin(sp) * 11); ctx.stroke(); }
  // строка 1: Connecting… со спиннером; строка 2 (акцент): НЕТ СЕТИ
  ctx.save(); ctx.translate(PH.x + 70, PH.y + 620); ctx.rotate(sp); for (let i = 0; i < 8; i++) { ctx.rotate(Math.PI / 4); ctx.fillStyle = `rgba(127,179,255,${(i + 1) / 8})`; rr(-4, -26, 8, 14, 4); ctx.fill(); } ctx.restore();
  txt('Connecting' + '...'.slice(0, 1 + Math.floor(t * 3) % 3), PH.x + 110, PH.y + 620, 44, '#CFE3FF', { weight: 800 });
  if (lost) { const a = E.out(win(t, 22.6, 22.9)); txt('НЕТ СЕТИ', PH.x + PH.w / 2, PH.y + 712, 54, T.danger, { align: 'center', alpha: a }); }
  ctx.restore(); ctx.fillStyle = '#E2A97F'; for (let i = 0; i < 3; i++) { rr(PH.x + PH.w - 10, PH.y + 420 + i * 110, 70, 90, 32); ctx.fill(); } rr(PH.x - 50, PH.y + 520, 70, 220, 32); ctx.fill();
  for (const tp of [21.2, 21.9]) { const k = win(t, tp, tp + .35); if (k > 0 && k < 1) { ctx.strokeStyle = `rgba(207,227,255,${1 - k})`; ctx.lineWidth = 5; circle(PH.x + PH.w - 120, PH.y + 435, 20 + k * 60); ctx.stroke(); } }
  const thumbK = Math.max(...[21.2, 21.9].map(tp => Math.sin(clamp((t - tp + .15) / .3) * Math.PI))); ctx.fillStyle = '#E2A97F'; ctx.save(); ctx.translate(lerp(PH.x + PH.w + 60, PH.x + PH.w - 110, thumbK), lerp(PH.y + 560, PH.y + 450, thumbK)); ctx.rotate(-.7); rr(-40, -80, 80, 190, 40); ctx.fill(); ctx.restore();
  warmWash(.1); }
// ───── 10. Диас тянет телефон к потолку, ищет сеть ─────
function searchSignal(t) { LIGHT.dark = 0; cam(1.25, 540, 600, () => roomBg(t, { chY: 150, chS: .8 })); dimAll(.12); const up = E.out(win(t, 23.5, 24.1));
  bust(800, 1020, 1.15, t, 'nurs', { look: [-.2, .6], under: .7, part: 'body', brow: .4 }); bust(800, 1020, 1.15, t, 'nurs', { part: 'arms', armL: { to: [700, 1260] }, armR: { to: [780, 1250] }, holdR: (x, y) => phoneObj(x - 40, y - 30, 1.2, -.2, { screen: 1 }) });
  ctx.fillStyle = 'rgba(11,16,32,.25)'; ctx.fillRect(560, 0, 600, H); // глубина: дальний план темнее
  const tgt = [lerp(560, 690, up), lerp(1150, 520, up)];
  bust(400, 1180, 1.75, t, 'dias', { look: [.7, -.9 * up], brow: lerp(0, -.6, win(t, 24.4, 24.8)), part: 'body', smile: -.3 });
  bust(400, 1180, 1.75, t, 'dias', { part: 'arms', armL: [.2, -.3], armR: { to: tgt, flip: 1 }, holdR: (x, y) => { phoneObj(x, y - 40, 1.7, .15, { screen: 1 }); glow(x, y - 40, 160, 'rgba(127,179,255,.35)'); } });
  FX.emote(t, 24.5, '?', 170, 700, 1.1, 1.4); warmWash(.12); }
// ───── 11 и 16. Через плечи: телевизор на тумбе ─────
function backHead(x, y, s, who, { rim = 0 } = {}) { const c = CAST[who], R = 95 * s, sw = 125 * s * c.sh; ctx.fillStyle = C(mix(c.top, '#000000', .35)); ctx.beginPath(); ctx.moveTo(x - sw * 1.1, y + 600 * s); ctx.lineTo(x - sw, y + 60 * s); ctx.quadraticCurveTo(x, y - 20 * s, x + sw, y + 60 * s); ctx.lineTo(x + sw * 1.1, y + 600 * s); ctx.fill();
  const hy = y - R * (c.neck + c.hh * .9); ctx.fillStyle = C(mix(c.hair, '#000000', .2)); ctx.beginPath(); ctx.ellipse(x, hy, R * c.hw, R * c.hh, 0, 0, Math.PI * 2); ctx.fill();
  if (c.style === 'curly') for (let i = 0; i < 12; i++) { circle(x + Math.cos(i * .52) * R * c.hw, hy + Math.sin(i * .52) * R * c.hh * .9, R * .22); ctx.fill(); }
  if (c.hood) { ctx.fillStyle = C(mix(c.top, '#000000', .3)); ctx.beginPath(); ctx.ellipse(x, y + 10 * s, R * 1.3, R * .6, 0, 0, Math.PI * 2); ctx.fill(); }
  if (rim > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(127,179,255,${.55 * rim})`; ctx.lineWidth = 8 * s; ctx.beginPath(); ctx.ellipse(x, hy, R * c.hw, R * c.hh, 0, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); ctx.restore(); } }
function newsContent(t, x, y, w, h, { frozen = -1, mapMode = 0 } = {}) { const tt = frozen > 0 ? frozen : t;
  const g = ctx.createLinearGradient(x, y, x, y + h); g.addColorStop(0, '#13265a'); g.addColorStop(1, '#0a1433'); ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = 'rgba(127,179,255,.12)'; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.arc(x + w * .78, y + h * .35, 60 + i * 40, 0, Math.PI * 2); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(127,179,255,.10)'; ctx.stroke(); }
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); const prevD = LIGHT.dark; LIGHT.dark = 0; const s = h / 560;
  bust(x + w * .5, y + h * .62, 1.15 * s, tt, 'anchor', { noArms: 1, mouth: anchorMouth(tt), look: [0, 0], smile: .1, brow: tt > 38.9 ? .6 : 0 }); LIGHT.dark = prevD;
  ctx.fillStyle = '#C8262B'; ctx.fillRect(x, y + h - 175 * s, w * .78, 72 * s); txt('ЭКСТРЕННЫЙ ВЫПУСК', x + 30 * s, y + h - 139 * s, 48 * s, '#fff');
  ctx.fillStyle = '#F4F1EA'; ctx.fillRect(x, y + h - 96 * s, w, 70 * s); ctx.save(); ctx.beginPath(); ctx.rect(x, y + h - 96 * s, w, 70 * s); ctx.clip();
  const tick = '  ОТКЛЮЧЕНИЯ СВЕТА · ЮГ РОССИИ · ВОСТОЧНАЯ ЕВРОПА · КАВКАЗ ·'; ctx.font = `900 ${44 * s}px Mont`; const tw = ctx.measureText(tick).width, off = (tt * 160 * s) % tw; txt(tick + tick, x - off, y + h - 60 * s, 44 * s, '#0B1020'); ctx.restore();
  ctx.fillStyle = '#C8262B'; circle(x + w - 60 * s, y + 60 * s, 14 * s); ctx.globalAlpha = .5 + .5 * Math.sin(tt * 6); ctx.fill(); ctx.globalAlpha = 1; // «в эфире» — точка без текста
  ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 6 * s; ctx.beginPath(); ctx.arc(x + 70 * s, y + 66 * s, 28 * s, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x + 50 * s, y + 70 * s); ctx.quadraticCurveTo(x + 70 * s, y + 46 * s, x + 90 * s, y + 70 * s); ctx.stroke(); // знак вымышленного канала
  ctx.restore(); }
function tvRoom(t, { tvOn = 1, content, flick = 1, remote = 0 } = {}) { wallpaper(-200, 0, W + 400, H);
  ctx.fillStyle = C('#4A3226'); rr(-60, 300, 300, 900, 10); ctx.fill(); ctx.fillStyle = 'rgba(200,220,255,.12)'; for (let i = 0; i < 3; i++) { rr(-30, 340 + i * 260, 240, 220, 8); ctx.fill(); } for (let i = 0; i < 6; i++) { ctx.fillStyle = C(i % 2 ? '#E8E0D0' : '#2E5AA8'); circle(20 + (i % 3) * 70, 470 + Math.floor(i / 3) * 260, 26); ctx.fill(); } // сервант с посудой
  ctx.fillStyle = C('#5A3C2A'); ctx.fillRect(160, 1040, 840, 200); ctx.fillStyle = C('#3E2A1E'); ctx.fillRect(160, 1040, 840, 18);
  tvSet(200, 560, 760, 440, content, { on: tvOn }); if (flick < 1) dimAll((1 - flick) * .5);
  backHead(250, 1600, 2.3, 'nurs', { rim: tvOn }); backHead(860, 1650, 2.2, 'alik', { rim: tvOn });
  if (remote > 0) { const k = E.out(remote); ctx.fillStyle = C('#A8432C'); ctx.beginPath(); ctx.moveTo(940, H + 50); ctx.lineTo(lerp(1000, 760, k), lerp(1700, 1260, k)); ctx.lineTo(lerp(1060, 830, k), lerp(1730, 1290, k)); ctx.lineTo(1160, H + 50); ctx.fill();
    const rx = lerp(1030, 795, k), ry = lerp(1690, 1260, k); ctx.fillStyle = C('#E6B48C'); circle(rx, ry, 46); ctx.fill(); ctx.fillStyle = '#1a1b22'; ctx.save(); ctx.translate(rx - 10, ry - 60); ctx.rotate(-.5); rr(-22, -80, 44, 130, 12); ctx.fill(); ctx.fillStyle = T.danger; circle(0, -60, 6); ctx.fill(); ctx.restore(); } }
function remoteTV(t) { LIGHT.dark = 0; const click = 26.4, on = win(t, click + .08, click + .4);
  tvRoom(t, { tvOn: t > click + .05 ? 1 : 0, remote: win(t, 26.0, 26.3), content: (x, y, w, h) => { if (on < .5) { const lh = lerp(4, h, E.out(on * 2)); ctx.fillStyle = '#E8F0FF'; ctx.fillRect(x, y + h / 2 - lh / 2, w, lh); } else newsContent(t, x, y, w, h); } });
  if (t > click + .05) glow(580, 780, 700, `rgba(127,179,255,${.2 * on})`); warmWash(.15); }
function tvNews(t) { LIGHT.dark = 0; wallpaper(-200, 0, W + 400, H); ctx.fillStyle = '#5A3C2A'; ctx.fillRect(-200, 1120, W + 400, 300); tvSet(40, 440, 1000, 620, (x, y, w, h) => newsContent(t, x, y, w, h)); warmWash(.08); }
// ───── карта блэкаута в телевизоре: пятна регионов гаснут по очереди ─────
const REG = [ // id, центр (0..1), радиусы, подпись, гаснет в
  { id: 'ee', c: [.2, .3], r: [.15, .2], label: 'ВОСТ. ЕВРОПА', off: 33.35, lx: .25, ly: .3 }, { id: 'sr', c: [.5, .26], r: [.14, .18], label: 'ЮГ РОССИИ', off: 31.85, lx: .53, ly: .14 },
  { id: 'kv', c: [.4, .64], r: [.1, .12], label: 'КАВКАЗ', off: 34.55, lx: .4, ly: .64 }, { id: 'wk', c: [.68, .45], r: [.13, .2], label: 'ЗАП. КАЗАХСТАН', off: 37.25, lx: .62, ly: .5 }];
function BlackoutMap(t, x, y, w, h, { front = 0, lightning = 0, ticker = 0 } = {}) { ctx.fillStyle = '#081633'; ctx.fillRect(x, y, w, h);
  const P = (u, v) => [x + u * w, y + v * h]; ctx.fillStyle = '#14234a'; ctx.beginPath(); ctx.moveTo(...P(0, .05)); [[.3, 0], [.6, .08], [1, .02], [1, 1], [.55, 1], [.5, .82], [.42, .92], [.3, .82], [.2, .95], [0, .9]].forEach(p => ctx.lineTo(...P(...p))); ctx.fill(); // суша условно
  ctx.fillStyle = '#0b1a3c'; ctx.beginPath(); ctx.ellipse(...P(.29, .62), w * .06, h * .1, 0, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(...P(.52, .7), w * .035, h * .12, 0, 0, Math.PI * 2); ctx.fill(); // моря пятнами
  const regions = [...REG, { id: 'ek', c: [.86, .55], r: [.1, .2], off: 99 }];
  for (const R of regions) { const isOff = t >= R.off, k = clamp((t - R.off) / .4), [cx, cy] = P(...R.c); const rs = seeded(R.c[0] * 1000);
    for (let i = 0; i < 70; i++) { const a = rs() * 6.28, d = Math.sqrt(rs()), px = cx + Math.cos(a) * d * R.r[0] * w, py = cy + Math.sin(a) * d * R.r[1] * h, fr = clamp((px - x) / w - front);
      const lit = !isOff && !(front > 0 && (px - x) / w < front); ctx.fillStyle = lit ? `rgba(242,179,61,${.5 + rs() * .5})` : 'rgba(90,100,130,.35)'; ctx.fillRect(px - 5, py - 5, 10, 10); }
    if (isOff) { ctx.strokeStyle = `rgba(229,56,59,${.9 * (1 - k * .5) * (.6 + .4 * Math.sin(t * 8))})`; ctx.lineWidth = 6; ctx.setLineDash([16, 12]); ctx.beginPath(); ctx.ellipse(cx, cy, R.r[0] * w * 1.15, R.r[1] * h * 1.1, 0, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      if (k < 1) glow(cx, cy, R.r[0] * w * 2, `rgba(229,56,59,${.4 * (1 - k)})`); } else glow(cx, cy, R.r[0] * w * 1.4, 'rgba(242,179,61,.18)');
    if (R.label) txt(R.label, ...P(R.lx, R.ly), 44, isOff ? '#ff9a9c' : T.text, { align: 'center', stroke: 10 }); }
  if (front > 0) { const fx = x + front * w; const g = ctx.createLinearGradient(fx - 200, 0, fx + 40, 0); g.addColorStop(0, 'rgba(5,7,16,.0)'); g.addColorStop(.8, 'rgba(5,7,16,.55)'); g.addColorStop(1, 'rgba(5,7,16,0)'); ctx.fillStyle = g; ctx.fillRect(fx - 200, y, 240, h); }
  const [ax, ay] = P(.86, .7); ctx.fillStyle = T.danger; circle(ax, ay, 16 + 6 * Math.sin(t * 10)); ctx.fill(); ctx.strokeStyle = `rgba(229,56,59,${.5 + .5 * Math.sin(t * 10)})`; ctx.lineWidth = 4; circle(ax, ay, 40 + ((t * 60) % 40)); ctx.stroke(); txt('АЛМАТЫ', ax - 40, ay + 2, 44, T.text, { align: 'right', stroke: 10 });
  const [vx, vy] = P(.55, .22); ctx.fillStyle = '#fff'; circle(vx, vy, 8); ctx.fill();
  if (lightning > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(vx, vy, 200, `rgba(185,198,255,${.8 * lightning})`); ctx.strokeStyle = `rgba(230,236,255,${lightning})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(vx - 10, vy - 120); ctx.lineTo(vx + 14, vy - 70); ctx.lineTo(vx - 6, vy - 50); ctx.lineTo(vx + 10, vy); ctx.stroke(); ctx.restore(); }
  if (ticker > 0) { ctx.fillStyle = '#C8262B'; ctx.fillRect(x, y + h - 80, w, 80); ctx.save(); ctx.beginPath(); ctx.rect(x, y + h - 80, w, 80); ctx.clip(); const s = '  АНОМАЛЬНЫЕ ГРОЗЫ · ВОЛГОГРАД ·'; ctx.font = '900 46px Mont'; const tw = ctx.measureText(s).width; txt(s + s + s, x + w - ((t - 37.3) * 190) % tw - tw * .4, y + h - 40, 46, '#fff'); ctx.restore(); } }
function tvMap1(t) { LIGHT.dark = 0; wallpaper(-200, 0, W + 400, H); tvSet(30, 400, 1020, 690, (x, y, w, h) => BlackoutMap(t, x, y, w, h)); dimAll(.05); }
function tvMap2(t) { LIGHT.dark = 0; wallpaper(-200, 0, W + 400, H); const fl = [39.4, 40.35].reduce((a, l) => Math.max(a, clamp(1 - Math.abs(t - l) / .12)), 0);
  tvSet(30, 400, 1020, 690, (x, y, w, h) => BlackoutMap(t, x, y, w, h, { front: t > 37.25 ? lerp(.78, .86, E.out(win(t, 37.6, 40.9))) : 0, lightning: fl, ticker: t > 37.3 ? 1 : 0 })); }
// ───── 14. Реакция: Нурсултан и Бейбарыс в синем свете экрана ─────
function reactTV(t) { LIGHT.dark = .25; wallpaper(-200, 0, W + 400, H); dimAll(.2); glow(540, 900, 900, 'rgba(127,179,255,.22)'); const pull = E.out(win(t, 35.7, 36.3));
  bust(330, 1230, 1.7, t, 'nurs', { look: [.25, -.05], brow: 1, wide: 1.25, under: .6, part: 'body', phonesOff: pull > .5, mouth: .2 });
  bust(330, 1230, 1.7, t, 'nurs', { part: 'arms', armL: [.1, -.2], armR: { to: [lerp(560, 420, pull), lerp(1300, 1240, pull)] }, holdR: pull > .5 ? (x, y) => { ctx.strokeStyle = '#E5383B'; ctx.lineWidth = 22; ctx.beginPath(); ctx.arc(x, y + 40, 70, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); } : null });
  bust(790, 1290, 1.6, t, 'beib', { look: [-.4, .35], brow: .8, wide: 1.2, under: .55, part: 'body' }); bust(790, 1290, 1.6, t, 'beib', { part: 'arms', armL: [.1, -.2], armR: { to: [700, 1180], flip: 1 } }); }
// ───── 16. Телевизор сбоит и гаснет в точку, люстра мигает ─────
function tvDie(t) { LIGHT.dark = 0; const fl = t > 41.2 ? (Math.sin(t * 47) > .1 ? 1 : .35) : 1, sq = win(t, 41.65, 41.95), dot = win(t, 41.95, 42.2), fade = win(t, 42.2, 42.4);
  tvRoom(t, { flick: fl, content: (x, y, w, h) => { if (sq <= 0) { newsContent(t, x, y, w, h, { frozen: 40.88 }); if (t > 40.9) { const r = seeded(Math.floor(t * 30)); for (let i = 0; i < 6; i++) { const yy = r() * h, hh = 10 + r() * 60; ctx.save(); ctx.beginPath(); ctx.rect(x, y + yy, w, hh); ctx.clip(); newsContent(t, x + (r() - .5) * 140, y, w, h, { frozen: 40.88 }); ctx.restore(); } ctx.fillStyle = `rgba(229,56,59,${.15 + .1 * Math.sin(t * 50)})`; ctx.fillRect(x, y, w, h); } }
    else { ctx.fillStyle = '#05060a'; ctx.fillRect(x, y, w, h); const lh = lerp(h, 6, E.io(sq)), lw = lerp(w, 8, E.io(dot)); ctx.fillStyle = `rgba(230,240,255,${1 - fade})`; ctx.fillRect(x + w / 2 - lw / 2, y + h / 2 - lh / 2, lw, lh); glow(x + w / 2, y + h / 2, 120, `rgba(200,220,255,${.8 * (1 - fade)})`); } } }); }
// ───── 18. Панорама Алматы: волна гаснущих огней с запада, фары ещё едут ─────
const CITY = (() => { const r = seeded(123), L = []; for (let i = 0; i < 520; i++) { const y = 1000 + Math.pow(r(), 1.6) * 900, sc = .4 + (y - 1000) / 900 * 1.6; L.push({ x: r() * 1160 - 40, y, s: sc, j: r() * .08, c: r() < .85 ? 'w' : 'l' }); } return L; })();
const ROADS = [[540, 990, -300, 1950], [540, 990, 540, 1950], [540, 990, 1400, 1950], [540, 990, 1500, 1300]];
function LightsOutWave(t, x01, t0 = 45.8, dur = 1.9) { const w = lerp(-.1, 1.15, win(t, t0, t0 + dur)); return x01 > w ? 1 : (w - x01 < .05 ? (Math.sin(t * 90 + x01 * 50) > 0 ? .7 : 0) : 0); }
function panorama(t) { LIGHT.dark = 0; const wave = win(t, 45.8, 47.7), flashes = [47.9, 49.05].reduce((a, l) => Math.max(a, clamp(1 - Math.abs(t - l) / .1) * (Math.sin(t * 80) > -.3 ? 1 : .4)), 0);
  nightSky(t, { cityGlow: 1 - wave * .85, storm: flashes }); mountains(940, t, { amp: 1.5, seed: 21, k: .7 + flashes * .3 });
  ctx.fillStyle = '#121a30'; ctx.beginPath(); ctx.moveTo(-100, 1000); ctx.quadraticCurveTo(160, 820, 420, 1000); ctx.fill(); // холм Кок-Тобе
  ctx.strokeStyle = '#0b1020'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(150, 900); ctx.lineTo(180, 560); ctx.lineTo(210, 900); ctx.moveTo(165, 760); ctx.lineTo(195, 760); ctx.stroke(); ctx.fillStyle = '#0b1020'; ctx.fillRect(176, 520, 8, 50);
  const tw = LightsOutWave(t, .16); if (tw > 0) for (const ty of [530, 650, 790]) { ctx.fillStyle = `rgba(229,56,59,${tw * (.6 + .4 * Math.sin(t * 4))})`; circle(180, ty, 7); ctx.fill(); glow(180, ty, 40, `rgba(229,56,59,${.6 * tw})`); }
  ctx.fillStyle = '#0d1428'; ctx.fillRect(-100, 990, W + 200, 1000); const rb = seeded(9); for (let i = 0; i < 46; i++) { const bx = rb() * 1160 - 40, by = 1000 + rb() * 700, bh = 60 + rb() * 220 * (by - 900) / 900, bw = 50 + rb() * 120 * (by - 900) / 600; ctx.fillStyle = mix('#0d1428', '#1d2644', rb() * .8); ctx.fillRect(bx, by - bh, bw, bh); }
  for (const L of CITY) { const k = LightsOutWave(t, L.x / 1080 + L.j); if (k <= 0) continue; ctx.fillStyle = L.c === 'w' ? `rgba(242,179,61,${.8 * k})` : `rgba(255,230,170,${k})`; ctx.fillRect(L.x, L.y, 4 * L.s + 2, 5 * L.s + 2); if (L.c === 'l') glow(L.x, L.y, 26 * L.s, `rgba(242,179,61,${.4 * k})`); }
  for (const [x0, y0, x1, y1] of ROADS) { ctx.strokeStyle = 'rgba(30,36,60,.9)'; ctx.lineWidth = 26; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    for (let i = 1; i < 9; i++) { const u = i / 9, px = lerp(x0, x1, u * u), py = lerp(y0, y1, u * u), k = LightsOutWave(t, px / 1080); if (k > 0) { glow(px, py, 30 + u * 40, `rgba(255,214,140,${.7 * k})`); } } // фонари вдоль проспектов
    for (let i = 0; i < 7; i++) { const u = ((t * .05 + i / 7) % 1), uu = u * u, px = lerp(x0, x1, uu), py = lerp(y0, y1, uu), sz = 2 + uu * 7; ctx.fillStyle = 'rgba(255,255,240,.95)'; circle(px - sz, py, sz); ctx.fill(); circle(px + sz, py, sz); ctx.fill(); glow(px, py, 20 + uu * 50, 'rgba(255,250,230,.45)');
      const u2 = 1 - ((t * .04 + i / 7 + .07) % 1), u22 = u2 * u2, qx = lerp(x0, x1, u22) + 10 + u22 * 14, qy = lerp(y0, y1, u22); ctx.fillStyle = 'rgba(229,56,59,.9)'; circle(qx, qy, 1.5 + u22 * 5); ctx.fill(); } } // фары едут — двигатели работают
  for (const [sx, sy] of [[380, 1300], [700, 1240], [900, 1500]]) { const k = LightsOutWave(t, sx / 1080); ctx.fillStyle = k > 0 ? `rgba(46,204,113,${k})` : 'rgba(40,40,50,.8)'; circle(sx, sy, 8); ctx.fill(); if (k > 0) glow(sx, sy, 40, 'rgba(46,204,113,.5)'); }
  if (flashes > 0) { ctx.fillStyle = `rgba(185,198,255,${.12 * flashes})`; ctx.fillRect(-200, -200, W + 400, H + 400); } }
// ───── 19–20. Темнота: фонарики телефонов включаются по одному; 1 с тишины ─────
const TORCH = { dias: 49.95, alik: 50.3, beib: 50.6, nurs: 50.9 };
function torchBeam(x, y, ang, k, len = 900) { if (k <= 0) return; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.translate(x, y); ctx.rotate(ang); const g = ctx.createLinearGradient(0, 0, len, 0); g.addColorStop(0, `rgba(255,248,225,${.45 * k})`); g.addColorStop(1, 'rgba(255,248,225,0)'); ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(len, -len * .28); ctx.lineTo(len, len * .28); ctx.lineTo(0, 10); ctx.fill(); ctx.restore(); glow(x, y, 70, `rgba(255,250,235,${.9 * k})`); }
function flashlights(t) { LIGHT.dark = 1; roomBg(t, { on: 0, lights: 0 }); const look = E.out(win(t, 52.15, 52.45)) * .75, lit = id => E.out(win(t, TORCH[id], TORCH[id] + .08));
  const seat = { nurs: [430, 900, .95], beib: [660, 910, .95], dias: [215, 1070, 1.2], alik: [870, 1080, 1.2] };
  for (const id of ['nurs', 'beib', 'dias', 'alik']) bust(...seat[id], t, id, { part: 'body', look: [look, .2 - look * .2], brow: .6, wide: 1.15, under: lit(id) * .9, underRgb: '255,246,225', blink: t > 52 && t < 53 ? 1 : undefined, watchK: id === 'beib' ? 1 : 1 });
  table(1320); for (const id of ['nurs', 'beib', 'dias', 'alik']) { const [x, y, s] = seat[id]; bust(x, y, s, t, id, { part: 'arms', armL: [.25, -.4], armR: { to: [x + (id === 'alik' ? -60 : 60) * s, y + 230 * s], flip: id === 'alik' ? -1 : 1 }, watchK: 1,
    holdR: (hx, hy) => { phoneObj(hx, hy - 40 * s, 1.1 * s, 0, { back: 1, torch: lit(id) }); torchBeam(hx - 10, hy - 90 * s, id === 'alik' ? -2.1 : -1.05, lit(id), 1000); } }); }
  // пыль в лучах — мягкие точки, в тишине почти замирают
  const sp = t < 52 ? 1 : .15, r = seeded(66); for (let i = 0; i < 40; i++) { const x = r() * 1080, y = 300 + r() * 900, a = Math.max(...Object.values(TORCH).map(t0 => win(t, t0, t0 + .3))); AK.puff(x + Math.sin(t * sp + i) * 20, y + ((t * 8 * sp + i * 30) % 60), 6 + r() * 6, '255,248,225', .5 * a); } }
// ───── 21. Дверь: стуки, пыль с косяка, свет и тень ног под дверью ─────
const KNOCK = [53.0, 53.33, 53.66];
function doorKnock(t) { LIGHT.dark = .72; const hit = KNOCK.reduce((a, k0) => { const h = AK.impact(t, k0, { amp: 10, squash: .012, dur: .25, dec: 12 }); return { dx: a.dx + h.dx, dy: a.dy + h.dy * .4, sx: a.sx * h.sx, sy: a.sy * h.sy }; }, { dx: 0, dy: 0, sx: 1, sy: 1 });
  const gk = E.out(win(t, 54.4, 54.8)), gx = lerp(330, 720, E.io(win(t, 54.6, 56.2))), feet = t > 54.6 ? [gx - 70 + Math.sin(t * 6) * 10, gx + 70] : [];
  ctx.save(); ctx.translate(0, -110); door(t, { hit, gap: gk > 0 ? { x: gx, k: gk, feet } : null });
  for (const k0 of KNOCK) { const a = 1 - (t - k0) / .9; if (t < k0 || a <= 0) continue; ctx.save(); ctx.globalAlpha = a; AK.dust(t, k0, 540, 345, { w: .18, rgb: '170,160,140', n: 7, seed: Math.floor(k0 * 10) }); ctx.restore(); }
  ctx.restore(); const jx = KNOCK.reduce((a, k0) => a + ScreenShake(t, k0, 14, .3)[0], 0);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(470 + jx, 820, 0, 470 + jx, 860, 560); g.addColorStop(0, 'rgba(255,246,225,.6)'); g.addColorStop(.6, 'rgba(255,246,225,.18)'); g.addColorStop(1, 'rgba(255,246,225,0)'); ctx.fillStyle = g; ctx.fillRect(-200, -200, W + 400, H + 400); ctx.restore(); }

// ───── монтаж ─────
const SC = [ // [начало, конец, id, кадр, склейка]
  [0, 3, 'e1s01', t => cam(lerp(1.0, 1.06, win(t, 0, 3)), 540, 820, () => hookFace(t, 0))],
  [3, 5.4, 'e1s02', t => pan(t, 3, 5.4, () => signs(t), 70)],
  [5.4, 8.0, 'e1s03', t => push(t, 5.4, 8.0, () => facade(t), 540, 880, 1, 1.14)],
  [8.0, 10.8, 'e1s04', t => push(t, 8.0, 10.8, () => dinnerWide(t), 540, 900, 1, 1.06)],
  [10.8, 13.0, 'e1s05', t => push(t, 10.8, 13.0, () => watchInsert(t), 650, 950, 1, 1.08)],
  [13.0, 15.4, 'e1s06', t => { const s = ScreenShake(t, 14.0, 9, .6); cam(lerp(1, 1.05, win(t, 13, 15.4)), 540, 900, () => jetSky(t), s[0], s[1]); }],
  [15.4, 18.0, 'e1s07', t => { const s = shk(t, [[15.4, 8, .6]]); cam(lerp(1, 1.06, win(t, 15.4, 18)), 540, 900, () => roomShake(t), s[0], s[1]); }],
  [18.0, 20.6, 'e1s08', t => push(t, 18.0, 20.6, () => grabPhones(t), 540, 960, 1, 1.07)],
  [20.6, 23.4, 'e1s09', t => push(t, 20.6, 23.4, () => phoneMessenger(t), 540, 700, 1, 1.07)],
  [23.4, 26.0, 'e1s10', t => push(t, 23.4, 26.0, () => searchSignal(t), 500, 900, 1, 1.07)],
  [26.0, 28.2, 'e1s11', t => push(t, 26.0, 28.2, () => remoteTV(t), 580, 800, 1, 1.08)],
  [28.2, 31.6, 'e1s12', t => push(t, 28.2, 31.6, () => tvNews(t), 540, 760, 1, 1.07)],
  [31.6, 35.4, 'e1s13', t => push(t, 31.6, 35.4, () => tvMap1(t), 380, 760, 1, 1.07)],
  [35.4, 37.0, 'e1s14', t => push(t, 35.4, 37.0, () => reactTV(t), 540, 900, 1.02, 1.08)],
  [37.0, 40.9, 'e1s15', t => push(t, 37.0, 40.9, () => tvMap2(t), 760, 760, 1, 1.1)],
  [40.9, 42.4, 'e1s16', t => cam(lerp(1.04, 1.1, win(t, 40.9, 42.4)), 580, 780, () => tvDie(t), ...AK.handheld(t, 4, 3).slice(0, 2))],
  [42.4, 45.4, 'e1s17', t => { cam(lerp(1.02, 1.1, win(t, 42.4, 45.4)), 540, 820, () => hookFace(t, 42.1)); FX.stamp(t, 43.05, 'БЛЭКАУТ', CXC, 1270, { col: T.danger, size: 130, rot: -.07, life: 2.35 }); }],
  [45.4, 49.6, 'e1s18', t => push(t, 45.4, 49.6, () => panorama(t), 540, 1100, 1, 1.07)],
  [49.6, 53.0, 'e1s19', t => push(t, 49.6, 53.0, () => flashlights(t), 540, 900, 1, 1.08)],
  [53.0, 56.7, 'e1s21', t => push(t, 53.0, 56.7, () => doorKnock(t), 540, 1100, 1, 1.12)],
  [56.7, 58.01, 'e1s22', t => { const s = ScreenShake(t, 57.2, 10, .35); ctx.save(); ctx.translate(s[0], s[1]); EndCard(t, 56.7, 'КТО ЗА|ДВЕРЬЮ?', 'ЧАСТЬ 2 →'); ctx.restore(); }],
];
function rewindFx(t) { const k = win(t, 3, 3.5); if (k <= 0 || k >= 1) return; const a = Math.sin(k * Math.PI); ctx.save(); const r = seeded(Math.floor(t * 30) + 3);
  for (let i = 0; i < 5; i++) { const y = (r() * H + t * 4000) % H; ctx.fillStyle = `rgba(230,236,255,${.25 * a})`; ctx.fillRect(0, y, W, 6 + r() * 30); }
  ctx.fillStyle = `rgba(11,16,32,${.25 * a})`; ctx.fillRect(0, 0, W, H); txt('◀◀', CXC, 900, 160, `rgba(244,241,234,${.9 * a})`, { align: 'center' }); ctx.restore(); }
function drawFrame(t) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ENDCARD_AT = -1; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  let i = SC.length - 1; while (i > 0 && SC[i][0] > t) i--; const [a, b, id, draw, cutKind = 'none'] = SC[i];
  ctx.save(); draw(t); ctx.restore(); LIGHT.dark = 0; if (i > 0) AK.cut(t, a, cutKind); rewindFx(t);
  if (id !== 'e1s22') { post(t); Hud(t, { ...storyAt(EP, t), sigFlash: 22.6 }); } if (t < 3) PartSticker(1, t); KineticCaption(t, CAPS); }

// ───── звук: дрон под всей серией (после блэкаута глуше), 1 с тишины 52–53, каждое событие со звуком ─────
const BED = 'projects/blackout/assets/drone.wav', BEDM = 'projects/blackout/assets/drone-muffled.wav', KN = 'assets/sfx-library/meta-open-sound/corpora/oculus-audio-pack/ogg/DOORKnck_OfficeDoorKnock_OS_01.ogg';
const knock = (t, g = .9) => [{ t, type: 'file', path: KN, from: 0, dur: .24, gain: g * 1.6 }, { t, type: 'thud', gain: g * .5, pitch: .7 }, { t: t + .01, type: 'lib', id: 'impact-deep-soft', gain: g * .35 }];
window.SFX_CUES = [
  ...Object.entries(VO_AT).map(([id, t]) => ({ t, type: 'file', path: `projects/blackout/assets/vo/ep1/${id}.wav`, gain: VO_GAIN[id] || 4.2, ...(VO_CUT[id] ? { dur: VO_CUT[id] } : {}) })),
  { t: 0, type: 'file', path: BED, gain: .5, dur: OUT }, { t: OUT, type: 'file', path: BEDM, gain: .55, from: OUT, dur: 52 - OUT }, { t: 53, type: 'file', path: BEDM, gain: .32, from: 53, dur: 5 },
  // 1 хук
  { t: 0, type: 'hum', dur: .65, gain: .25 }, { t: .3, type: 'zap', dur: .3, gain: .12 }, { t: .65, type: 'lib', id: 'impact-deep-hard', gain: .7 }, { t: .65, type: 'powerdown', dur: 1.0, gain: .35 }, { t: .66, type: 'rattle', dur: .9, gain: .25 },
  // перемотка, город, листья
  { t: 3, type: 'rewind', dur: .5, gain: .35 }, { t: 3.5, type: 'lib', id: 'oc-AMBUrbn_CityEuroDaytime_LOOP_01', gain: .25, align: 'start', dur: 4.5 }, { t: 3.5, type: 'wind', dur: 4.5, gain: .07 }, { t: 4.4, type: 'lib', id: 'foley-paper-touch', gain: .25 }, { t: 6.2, type: 'lib', id: 'foley-paper-touch', gain: .2 },
  // ужин
  { t: 8.0, type: 'murmur', dur: 2.8, gain: .16 }, ...[8.3, 8.9, 9.6, 10.3].map(t => ({ t, type: 'tick', gain: .12, pitch: 1.6 })), ...[8.2, 8.35, 8.5, 8.65].map(t => ({ t: t + .1, type: 'pop', gain: .12, pitch: 1.4 })), // бирки
  ...[10.8, 11.8, 12.8].map(t => ({ t, type: 'tick', gain: .3, pitch: .9 })), { t: 11.0, type: 'lib', id: 'foley-fabric-touch', gain: .2 },
  // истребитель
  { t: 12.95, type: 'jet', dur: 4.8, peak: .23, gain: .95 }, { t: 14.0, type: 'lib', id: 'impact-deep-firm', gain: .45 }, { t: 14.05, type: 'rattle', dur: 1.6, gain: .3 }, { t: 15.4, type: 'tinkle', dur: 2.4, gain: .35 }, { t: 15.4, type: 'rattle', dur: 1.4, gain: .25 },
  // телефоны
  ...GRABS.map(g => ({ t: g.t0 + .2, type: 'lib', id: 'foley-fabric-slide', gain: .3 })), ...GRABS.map(g => ({ t: g.t0 + .3, type: 'lib', id: 'click-tap-soft', gain: .25 })),
  { t: 21.2, type: 'lib', id: 'click-tap-firm', gain: .4 }, { t: 21.9, type: 'lib', id: 'click-tap-firm', gain: .4 }, { t: 22.6, type: 'lib', id: 'notification-failure-low', gain: .45 }, { t: 22.62, type: 'glitch', gain: .12 },
  { t: 23.6, type: 'lib', id: 'foley-fabric-slide', gain: .25 }, { t: 24.5, type: 'pop', gain: .15 },
  // телевизор
  { t: 26.4, type: 'lib', id: 'click-button-firm', gain: .5 }, { t: 26.48, type: 'lib', id: 'digital-static', gain: .3 }, { t: 28.22, type: 'lib', id: 'impact-deep-firm', gain: .35 }, { t: 28.25, type: 'chord', notes: [146.8, 220, 293.7], dur: 1.2, attack: .02, gain: .18 },
  ...REG.map(R => ({ t: R.off, type: 'lib', id: 'bass-sub-drop-short', gain: .4 })), { t: 35.4, type: 'lib', id: 'foley-fabric-slide', gain: .2 },
  { t: 39.4, type: 'lib', id: 'bass-rumble-medium', gain: .35 }, { t: 40.35, type: 'lib', id: 'cinematic-thunder-big', gain: .18 },
  // сбой и блэкаут
  { t: 40.9, type: 'lib', id: 'digital-corrupt', gain: .35 }, { t: 40.95, type: 'glitch', gain: .2 }, ...[41.25, 41.6, 42.05].map(t => ({ t, type: 'zap', dur: .2, gain: .1 })), { t: 41.65, type: 'lib', id: 'bsb-crt-off', gain: .5, align: 'start', dur: 1 },
  { t: OUT, type: 'lib', id: 'impact-deep-hard', gain: .75 }, { t: OUT, type: 'powerdown', dur: 1.4, gain: .4 }, { t: OUT + .02, type: 'rattle', dur: .7, gain: .2 }, { t: 43.05, type: 'lib', id: 'cinematic-drum-big', gain: .45 },
  // город гаснет
  { t: 45.4, type: 'wind', dur: 4.2, gain: .1 }, { t: 45.8, type: 'lib', id: 'bass-rumble-long', gain: .4 }, ...[46.1, 46.5, 46.9, 47.3].map((t, i) => ({ t, type: 'click', gain: .08, pitch: .5, pan: -0.6 + i * .4 })), { t: 47.9, type: 'lib', id: 'bass-rumble-medium', gain: .3 }, { t: 49.05, type: 'lib', id: 'cinematic-thunder-big', gain: .14 },
  // фонарики
  ...Object.values(TORCH).map(t => ({ t, type: 'lib', id: 'click-button-medium', gain: .5 })),
  // 52–53 — тишина
  ...KNOCK.flatMap((t, i) => knock(t, 1 - i * .05)), { t: 54.6, type: 'step', gain: .06, pitch: .7 }, { t: 55.2, type: 'step', gain: .05, pitch: .7 }, { t: 55.8, type: 'step', gain: .05, pitch: .7 },
  { t: 56.7, type: 'lib', id: 'impact-deep-firm', gain: .35 }, ...knock(57.2, 1.1),
];
// ───── раскадровка storyboard/ep1.json (схема раздела 7) ─────
window.STORYBOARD = { episode: EP, title: 'Тень над городом', duration: DUR, hud: { city: 'АЛМАТЫ', temp: '+6°', timeStart: '20:00', signal: 'full' },
  scenes: SC.map(([a, b, id, , cut]) => { const h = storyAt(EP, a + .01), c = CAPS.filter(p => p.a >= a - .01 && p.a < b);
    return { id, start: a, end: +Math.min(b, DUR).toFixed(2), camera: { type: id === 'e1s02' || id === 'e1s13' ? 'pan' : 'pushIn', from: 1.0, to: 1.08 }, cut: cut || 'cut',
      vo: c.length ? { speaker: c[0].speaker || (c[0].whisper ? 'narrator-whisper' : 'narrator'), text: c.map(p => p.words.map(w => w.text).join(' ')).join(' '), accent: c.flatMap(p => p.words.filter(w => w.accent).map(w => w.text)) } : null,
      sfx: window.SFX_CUES.filter(s => s.t >= a && s.t < b && !(s.path || '').includes('/vo/')).map(s => ({ id: s.id || (s.path ? s.path.split('/').pop() : s.type), at: +s.t.toFixed(2) })),
      effects: [id === 'e1s06' ? { id: 'ScreenShake', amp: 9, at: 14.0, duration: .6 } : null, id === 'e1s07' ? { id: 'ScreenShake', amp: 8, at: 15.4, duration: .6 } : null, id === 'e1s16' ? { id: 'Glitch', at: 40.9 } : null].filter(Boolean),
      hud: id === 'e1s22' ? null : { time: h.time, signal: h.signal }, overlays: [a === 0 ? 'PartSticker:1' : null, id === 'e1s09' ? 'PhoneScreen:messenger' : null, /e1s1[1236]/.test(id) ? 'TvScreen:news' : null, /e1s1[35]/.test(id) ? 'BlackoutMap' : null, id === 'e1s06' ? 'JetFlyover:low' : null, id === 'e1s18' ? 'LightsOutWave' : null, id === 'e1s22' ? 'EndCard' : null].filter(Boolean) }; }) };
window.CAPTION_PHRASES = CAPS;
window.renderFrame = t => drawFrame(Math.min(t, DUR - .001));
window.READY = Promise.all(['900 72px Mont', '800 32px Mont', '800 44px JBM'].map(f => document.fonts.load(f))).then(() => drawFrame(0));
