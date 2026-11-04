// Риг стикмена (из проекта stickman-skip, v4/v5). Подключать в HTML-сцену после утилит
// clamp/lerp/D2R/E/ev/blend/track/win/pulse и const ctx, RED, FINAL_GESTURE.
// Что есть: позы P.* (стойка, шаг/бег по фазе, торможение, испуг, прыжок, падение, злость…),
// gait()/walker()/runner() — шаг без проскальзывания, drawStick(st, t) — гибкие конечности,
// инерция головы/кистей, тень, лица FACES (neutral, surprised, scared, panic, relieved, happy,
// angry, suspicious, annoyed, dizzy), значки эмоций (!, ?, !?, sweat, anger, ..., stars),
// клоны (ghost: true, shade). Пример использования — projects/stickman-skip/src/scene.html.
// ───────── позы (градусы; конечности: 0 = вниз, + = вперёд) ─────────
const BASE = { t: 0, h: 0, a1u: -8, a1f: -4, a2u: 8, a2f: 4, l1u: -6, l1l: -6, l2u: 6, l2l: 6 };
// циклы по фазе ph (в циклах): опорная нога 1 — когда cos(2πph) < 0
function walkPh(ph, amp = 24) { const w = ph * 2 * Math.PI, s = Math.sin(w), c = Math.cos(w), th = amp * s;
  return { t: 5 + 2 * Math.abs(s), h: -2 * c, l1u: th, l1l: th - 38 * Math.max(0, c), l2u: -th, l2l: -th - 38 * Math.max(0, -c), a1u: -20 * s, a1f: -20 * s + 18, a2u: 20 * s, a2f: 20 * s + 18 }; }
function runPh(ph, amp = 40, arms = 'swing') { const w = ph * 2 * Math.PI, s = Math.sin(w), c = Math.cos(w), th = amp * s;
  const p = { t: 18 + 4 * Math.abs(c), h: -6, l1u: th, l1l: th - 90 * Math.max(0, c), l2u: -th, l2l: -th - 90 * Math.max(0, -c), a1u: -45 * s, a1f: -45 * s + 85, a2u: 45 * s, a2f: 45 * s + 85 };
  if (arms === 'panic') Object.assign(p, { t: 24, h: -14, a1u: 150 + 22 * s, a1f: 178 + 10 * c, a2u: 160 - 22 * s, a2f: 190 - 10 * c });
  if (arms === 'back') Object.assign(p, { h: -55 });
  return p; }
const P = {
  stand: { ...BASE },
  walk: t => walkPh(t * 1.6),
  run: t => runPh(t * 2.2),
  panicRun: t => runPh(t * 2.2, 40, 'panic'),
  lookBackRun: t => ({ ...runPh(t * 2.2, 40, 'panic'), h: -60 }),
  backRun: t => ({ ...runPh(t * 2.2), t: -10, h: 8 }),
  brake: { t: -26, h: -12, a1u: -110, a1f: -140, a2u: 120, a2f: 150, l1u: -20, l1l: -52, l2u: 38, l2l: 46 },
  slip: { t: -32, h: -18, a1u: -150, a1f: -175, a2u: 150, a2f: 170, l1u: -14, l1l: -30, l2u: 55, l2l: 75 },
  windmill: t => { const w = t * 9; return { t: -14, h: -6, a1u: -100 + 70 * Math.sin(w), a1f: -130 + 70 * Math.sin(w), a2u: 110 + 70 * Math.sin(w + 1.6), a2f: 140 + 70 * Math.sin(w + 1.6), l1u: -12, l1l: -30, l2u: 18, l2l: 22 }; },
  lookDown: { t: 18, h: 34, a1u: -14, a1f: -8, a2u: 22, a2f: 30, l1u: -8, l1l: -16, l2u: 12, l2l: 10 },
  lookFeet: { t: 22, h: 48, a1u: -20, a1f: -10, a2u: 14, a2f: 10, l1u: -6, l1l: -6, l2u: 6, l2l: 6 },
  lookUp: { t: -10, h: -48, a1u: -20, a1f: -8, a2u: 20, a2f: 8, l1u: -8, l1l: -8, l2u: 8, l2l: 8 },
  recoil: { t: -18, h: -10, a1u: -70, a1f: -110, a2u: 70, a2f: 110, l1u: -20, l1l: -24, l2u: 20, l2l: 24 },
  surprised: { t: -10, h: -16, a1u: -125, a1f: -160, a2u: 125, a2f: 160, l1u: -10, l1l: -12, l2u: 10, l2l: 12 },
  scared: { t: -6, h: 6, a1u: 60, a1f: 140, a2u: 70, a2f: 150, l1u: 14, l1l: -10, l2u: 24, l2l: -4 },
  reachUp: { t: 4, h: -26, a1u: -20, a1f: -10, a2u: 150, a2f: 168, l1u: -6, l1l: -8, l2u: 8, l2l: 6 },
  press: { t: 10, h: -20, a1u: -24, a1f: -14, a2u: 140, a2f: 150, l1u: -8, l1l: -14, l2u: 14, l2l: 6 },
  cheer: { t: -6, h: -14, a1u: -155, a1f: -172, a2u: 155, a2f: 172, l1u: -16, l1l: -40, l2u: 16, l2l: -20 },
  crouch: { t: 28, h: -18, a1u: -50, a1f: -30, a2u: -40, a2f: -20, l1u: 72, l1l: -40, l2u: 84, l2l: -30 },
  takeoff: { t: 22, h: -14, a1u: 160, a1f: 175, a2u: 150, a2f: 170, l1u: -40, l1l: -40, l2u: 40, l2l: 20 },
  fear: { t: 14, h: 26, a1u: 150, a1f: 245, a2u: 160, a2f: 255, l1u: 40, l1l: -26, l2u: 52, l2l: -10 },
  peek: { t: 6, h: -6, a1u: 120, a1f: 200, a2u: 70, a2f: 150, l1u: 30, l1l: -20, l2u: 40, l2l: -6 },
  smug: { t: -6, h: -12, a1u: 28, a1f: 100, a2u: 22, a2f: 96, l1u: -10, l1l: -10, l2u: 12, l2l: 12 },
  angry: { t: 12, h: 8, a1u: -30, a1f: 40, a2u: 30, a2f: 100, l1u: -14, l1l: -14, l2u: 14, l2l: 14 },
  point: { t: 8, h: 0, a1u: -20, a1f: 20, a2u: 85, a2f: 92, l1u: -12, l1l: -12, l2u: 12, l2l: 12 },
  hang: { t: 0, h: -20, a1u: 175, a1f: 178, a2u: 185, a2f: 182, l1u: 10, l1l: 30, l2u: -10, l2l: -20 },
  scramble: t => { const w = t * 12; return { t: 35, h: -25, a1u: 120 + 30 * Math.sin(w), a1f: 150, a2u: 130 - 30 * Math.sin(w), a2f: 160, l1u: 40 + 40 * Math.sin(w), l1l: -30, l2u: 40 - 40 * Math.sin(w), l2l: -20 }; },
  fall: t => { const w = t * 8; return { t: -20, h: -30, a1u: -150 + 30 * Math.sin(w), a1f: -170 + 30 * Math.sin(w), a2u: 150 + 30 * Math.sin(w + 2), a2f: 170 + 30 * Math.sin(w + 2), l1u: -30 + 25 * Math.sin(w + 1), l1l: -60, l2u: 40 - 25 * Math.sin(w + 1), l2l: 10 }; },
  tuck: { t: 10, h: -10, a1u: -140, a1f: -170, a2u: 150, a2f: 175, l1u: 70, l1l: -20, l2u: 90, l2l: 10 },
  flat: { t: 0, h: 0, a1u: -165, a1f: -170, a2u: 165, a2f: 170, l1u: -10, l1l: -8, l2u: 10, l2l: 8 },
  splat: { t: 0, h: 0, a1u: -80, a1f: -80, a2u: 80, a2f: 80, l1u: -40, l1l: -40, l2u: 40, l2l: 40 },
  dodge: { t: -30, h: -30, a1u: -160, a1f: -175, a2u: 170, a2f: 185, l1u: -50, l1l: -90, l2u: 60, l2l: 20 },
  hold: { t: 4, h: 10, a1u: -12, a1f: -6, a2u: 72, a2f: 92, l1u: -6, l1l: -8, l2u: 8, l2l: 6 },
  reachIn: { t: 18, h: 14, a1u: 60, a1f: 80, a2u: 78, a2f: 95, l1u: -14, l1l: -18, l2u: 18, l2l: 6 },
  exhale: { t: 14, h: 22, a1u: 4, a1f: 2, a2u: 6, a2f: 4, l1u: -6, l1l: -6, l2u: 6, l2l: 6 },
  raise: { t: -4, h: -6, a1u: -10, a1f: -6, a2u: 120, a2f: 178, l1u: -6, l1l: -6, l2u: 6, l2l: 6 },
  bonk: { t: -30, h: -30, a1u: -60, a1f: -80, a2u: 60, a2f: 80, l1u: 10, l1l: 10, l2u: 30, l2l: 30 },
};
const tremble = (pose, amp = 3) => t2 => { const p = ev(pose, t2); return { ...p, t: p.t + amp * Math.sin(t2 * 70), h: p.h + amp * Math.sin(t2 * 55) }; };

// ───────── стикмен ─────────
const L = { torso: 96, head: 31, ua: 52, fa: 48, th: 62, sh: 62 };
function skeleton(p, f) {
  const ta = p.t * D2R, N = { x: Math.sin(ta) * L.torso * f, y: -Math.cos(ta) * L.torso };
  const ha = (p.t + p.h) * D2R, Hd = { x: N.x + Math.sin(ha) * (L.head + 6) * f, y: N.y - Math.cos(ha) * (L.head + 6) };
  const S = { x: N.x - Math.sin(ta) * 10 * f, y: N.y + Math.cos(ta) * 10 };
  const limb = (o, u, l, lu, ll) => { const K = { x: o.x + Math.sin(u * D2R) * lu * f, y: o.y + Math.cos(u * D2R) * lu }; return [K, { x: K.x + Math.sin(l * D2R) * ll * f, y: K.y + Math.cos(l * D2R) * ll }]; };
  const [E1, W1] = limb(S, p.a1u, p.a1f, L.ua, L.fa), [E2, W2] = limb(S, p.a2u, p.a2f, L.ua, L.fa);
  const [K1, F1] = limb({ x: 0, y: 0 }, p.l1u, p.l1l, L.th, L.sh), [K2, F2] = limb({ x: 0, y: 0 }, p.l2u, p.l2l, L.th, L.sh);
  return { H0: { x: 0, y: 0 }, N, Hd, S, E1, W1, E2, W2, K1, F1, K2, F2, ha };
}
// шаг без проскальзывания: опорная ступня стоит на месте, таз «переступает» через неё
const footRel = (p, leg) => leg === 1 ? L.th * Math.sin(p.l1u * D2R) + L.sh * Math.sin(p.l1l * D2R) : L.th * Math.sin(p.l2u * D2R) + L.sh * Math.sin(p.l2l * D2R);
function gait(t, o) { // o: {t0, x0, dir, s, freq, ph0, posePh(ph)}
  const { t0, x0, dir = 1, s = 1, freq, ph0 = 0, posePh } = o;
  const phAt = tt => ph0 + (tt - t0) * freq, ph = phAt(Math.max(t, t0)), rel = (q, leg) => footRel(posePh(q), leg) * s * dir;
  const stance = q => Math.cos(2 * Math.PI * q) < 0 ? 1 : 2;
  let qa = phAt(t0), leg = stance(qa + 1e-4), anchor = x0 + rel(qa, leg);
  let qb = .25 + (Math.floor((qa - .25) / .5) + 1) * .5;
  while (qb < ph) { const xb = anchor - rel(qb, leg); leg = leg === 1 ? 2 : 1; anchor = xb + rel(qb, leg); qb += .5; }
  return { x: anchor - rel(ph, leg), pose: posePh(ph), ph };
}
const WALK = ph => walkPh(ph), RUN = ph => runPh(ph), PANIC = ph => runPh(ph, 40, 'panic'), LOOKBACK = ph => runPh(ph, 40, 'back');
const walker = (t, t0, x0, s, dir = 1, freq = 1.6, posePh = WALK) => gait(t, { t0, x0, s, dir, freq, posePh });
const runner = (t, t0, x0, s, dir = 1, freq = 2.2, posePh = PANIC) => gait(t, { t0, x0, s, dir, freq, posePh });

// лица: согласованная система выражений с первой сцены
const FACES = {
  neutral: { eye: 1, lid: .1, brow: 0, mouth: 'line' }, surprised: { eye: 1.3, lid: 0, brow: -1, mouth: 'o' },
  scared: { eye: 1.25, lid: 0, brow: 'worry', mouth: 'wave' }, panic: { eye: 1.4, pupil: .5, lid: 0, brow: 'worry', mouth: 'open' },
  relieved: { eye: 'closed', brow: 0, mouth: 'smile' }, happy: { eye: 'closed', brow: -1, mouth: 'grin' },
  angry: { eye: .95, lid: .45, brow: 'v', mouth: 'frown' }, suspicious: { eye: .9, lid: .55, brow: 'flat', mouth: 'line' },
  annoyed: { eye: 1, lid: .6, brow: 'flat', mouth: 'flat' }, dizzy: { eye: 'x', brow: 0, mouth: 'wave' },
};
function drawFace(Hd, ha, f, face, ghost, look) {
  const F = typeof face === 'string' ? FACES[face] : face; if (!F) return;
  const ink = ghost ? '#2a2840' : '#f4ecff', white = ghost ? '#f8f6ff' : '#ffffff';
  ctx.save(); ctx.translate(Hd.x, Hd.y); ctx.rotate(ha * f * .6); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const eyes = look === 'cam' ? [-11, 11] : [6 * f, 21 * f], ey = -3, ew = 6.5;
  for (const ex of eyes) {
    if (F.eye === 'closed') { ctx.strokeStyle = ink; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.arc(ex, ey + 2, 5, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); continue; }
    if (F.eye === 'x') { ctx.strokeStyle = ink; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(ex - 4, ey - 4); ctx.lineTo(ex + 4, ey + 4); ctx.moveTo(ex + 4, ey - 4); ctx.lineTo(ex - 4, ey + 4); ctx.stroke(); continue; }
    const r = ew * F.eye; ctx.fillStyle = white; ctx.beginPath(); ctx.ellipse(ex, ey, r * .85, r, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0b0b12'; ctx.beginPath(); ctx.arc(ex + (look === 'cam' ? 0 : 1.5 * f), ey + 1, r * .45 * (F.pupil || 1), 0, Math.PI * 2); ctx.fill();
    if (F.lid) { ctx.fillStyle = ghost ? '#8e8ca6' : '#0b0b12'; ctx.fillRect(ex - r - 1, ey - r - 1, r * 2 + 2, (r * 2 + 2) * F.lid); }
  }
  ctx.strokeStyle = ink; ctx.lineWidth = 3.5;
  const [e1, e2] = eyes, by = ey - 11;
  if (F.brow === 'v') { ctx.beginPath(); ctx.moveTo(e1 - 6 * f, by - 4); ctx.lineTo(e1 + 5 * f, by + 2); ctx.moveTo(e2 + 6 * f, by - 4); ctx.lineTo(e2 - 5 * f, by + 2); ctx.stroke(); }
  else if (F.brow === 'worry') { ctx.beginPath(); ctx.moveTo(e1 - 6 * f, by + 1); ctx.lineTo(e1 + 5 * f, by - 4); ctx.moveTo(e2 + 6 * f, by + 1); ctx.lineTo(e2 - 5 * f, by - 4); ctx.stroke(); }
  else if (F.brow === 'flat') { ctx.beginPath(); ctx.moveTo(e1 - 6, by + 3); ctx.lineTo(e1 + 6, by + 3); ctx.moveTo(e2 - 6, by + 3); ctx.lineTo(e2 + 6, by + 3); ctx.stroke(); }
  else if (F.brow === -1) { ctx.beginPath(); ctx.arc(e1, by + 2, 6, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); ctx.beginPath(); ctx.arc(e2, by + 2, 6, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); }
  const mx = look === 'cam' ? 0 : 15 * f, my = 15;
  ctx.beginPath();
  if (F.mouth === 'o') { ctx.ellipse(mx, my, 4, 5.5, 0, 0, Math.PI * 2); ctx.stroke(); }
  else if (F.mouth === 'open') { ctx.fillStyle = ink; ctx.ellipse(mx, my + 1, 6, 6.5, 0, 0, Math.PI * 2); ctx.fill(); }
  else if (F.mouth === 'smile') { ctx.arc(mx, my - 4, 7, Math.PI * .2, Math.PI * .8); ctx.stroke(); }
  else if (F.mouth === 'grin') { ctx.fillStyle = ink; ctx.arc(mx, my - 3, 8, 0, Math.PI); ctx.fill(); }
  else if (F.mouth === 'frown') { ctx.arc(mx, my + 6, 7, Math.PI * 1.2, Math.PI * 1.8); ctx.stroke(); }
  else if (F.mouth === 'wave') { ctx.moveTo(mx - 8, my); for (let i = 0; i <= 8; i++) ctx.lineTo(mx - 8 + i * 2, my + (i % 2 ? -2.5 : 2.5)); ctx.stroke(); }
  else { ctx.moveTo(mx - 6, my); ctx.lineTo(mx + 6, my); ctx.stroke(); }
  ctx.restore();
}
// st: x, y (земля), s, f, pose, lift, rot, sq, alpha, ghost, shade, face, look, eyes(старое: =look cam), finger, emo, emoK, shadow, glitch
function drawStick(st, t) {
  if (!st || st.alpha === 0) return;
  const f = st.f || 1, s = st.s || 1;
  let p = ev(st.pose, t);
  if (typeof st.pose === 'function' && !st.noLag) { // инерция: голова и кисти чуть запаздывают
    const q = ev(st.pose, t - .07); p = { ...p, h: lerp(p.h, q.h, .35), a1f: lerp(p.a1f, q.a1f, .3), a2f: lerp(p.a2f, q.a2f, .3), t: lerp(p.t, q.t, .15) };
  }
  const sk = skeleton(p, f), low = Math.max(sk.F1.y, sk.F2.y);
  if (st.shadow !== false && !st.rot) { const k = clamp(1 - (st.lift || 0) / 250); ctx.save(); ctx.fillStyle = `rgba(25,10,45,${.4 * k * (st.alpha ?? 1)})`; ctx.beginPath(); ctx.ellipse(st.x, st.y + 4, 64 * s * (.55 + .45 * k), 11 * s * (.6 + .4 * k), 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
  ctx.save();
  ctx.translate(st.x + (st.glitch ? Math.sin(t * 173) * 10 * st.glitch : 0), st.y - (st.lift || 0) * s);
  const sq = st.sq || 1; ctx.scale(s / Math.sqrt(sq), s * sq);
  if (st.rot) { ctx.translate(0, -low - 60); ctx.rotate(st.rot * D2R); ctx.translate(0, 60); } else ctx.translate(0, -low);
  ctx.globalAlpha = st.alpha ?? 1; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const curve = (a, j, b) => { const cx = 2 * j.x - (a.x + b.x) / 2, cy = 2 * j.y - (a.y + b.y) / 2; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.quadraticCurveTo(cx, cy, b.x, b.y); ctx.stroke(); };
  const path = (lw) => {
    ctx.lineWidth = lw;
    curve(sk.S, sk.E1, sk.W1); curve(sk.H0, sk.K1, sk.F1);
    ctx.beginPath(); ctx.moveTo(sk.H0.x, sk.H0.y); ctx.lineTo(sk.N.x, sk.N.y); ctx.stroke();
    curve(sk.H0, sk.K2, sk.F2); curve(sk.S, sk.E2, sk.W2);
    ctx.beginPath(); ctx.arc(sk.Hd.x, sk.Hd.y, L.head + (lw - 15) / 2, 0, Math.PI * 2); ctx.fill();
  };
  if (st.ghost) {
    if (st.glitch) { ctx.save(); ctx.globalAlpha *= .5; ctx.translate(8 * st.glitch, 0); ctx.strokeStyle = ctx.fillStyle = 'rgba(255,40,80,.8)'; path(15); ctx.restore(); }
    ctx.shadowColor = 'rgba(255,240,255,.7)'; ctx.shadowBlur = 16;
    ctx.strokeStyle = ctx.fillStyle = '#e8e4f6'; path(19); ctx.shadowBlur = 0;
    ctx.strokeStyle = ctx.fillStyle = st.shade || '#8e8ca6'; path(15);
  } else {
    ctx.save(); ctx.translate(-3.5, -2.5); ctx.strokeStyle = ctx.fillStyle = '#ffb27a'; path(16); ctx.restore(); // контровой свет заката
    ctx.strokeStyle = ctx.fillStyle = '#0b0b12'; path(15);
  }
  if (st.finger) { ctx.fillStyle = ctx.strokeStyle = st.ghost ? (st.shade || '#8e8ca6') : '#0b0b12'; drawFingerHand(sk.W2, sk.E2, st.finger); }
  const face = st.face || (st.angry ? 'angry' : null) || (st.eyes ? 'annoyed' : null);
  if (face) drawFace(sk.Hd, sk.ha, f, face, st.ghost, st.look || (st.eyes ? 'cam' : null));
  ctx.restore();
  if (st.emo) drawEmo(st, sk, low);
}
function drawFingerHand(Wp, Ep, k) {
  const ang = Math.atan2(Wp.y - Ep.y, Wp.x - Ep.x); ctx.save(); ctx.translate(Wp.x, Wp.y); ctx.rotate(ang + Math.PI / 2);
  ctx.beginPath(); ctx.arc(0, -4, 15, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = 11; ctx.beginPath();
  if (FINAL_GESTURE === 'finger') { ctx.moveTo(0, -12); ctx.lineTo(0, -12 - 30 * clamp(k)); } else { ctx.moveTo(4, -10); ctx.lineTo(4 + 22 * clamp(k), -22); }
  ctx.stroke(); ctx.restore(); }
function drawEmo(st, sk, low) {
  const k = st.emoK ?? 1; if (k <= 0) return;
  const s = st.s || 1, f = st.f || 1;
  const hx = st.x + sk.Hd.x * s, hy = st.y - (st.lift || 0) * s + (sk.Hd.y - low) * s * (st.sq || 1);
  ctx.save(); ctx.translate(hx + 42 * s * f, hy - 52 * s); ctx.scale(s * E.back(clamp(k)), s * E.back(clamp(k)));
  ctx.lineCap = 'round'; ctx.lineWidth = 7;
  const col = st.ghost ? '#e9e7ff' : '#16121f';
  if (st.emo === 'anger') { ctx.strokeStyle = RED; ctx.lineWidth = 8; for (const a of [0, 1.57, 3.14, 4.71]) { ctx.save(); ctx.rotate(a + .78); ctx.beginPath(); ctx.arc(14, 14, 10, Math.PI, Math.PI * 1.5); ctx.stroke(); ctx.restore(); } }
  else if (st.emo === 'sweat') { ctx.fillStyle = '#9fd8ff'; for (const [dx, dy, r] of [[0, 0, 11], [24, 22, 8]]) { ctx.beginPath(); ctx.moveTo(dx, dy - r * 1.8); ctx.quadraticCurveTo(dx + r, dy, dx, dy + r); ctx.quadraticCurveTo(dx - r, dy, dx, dy - r * 1.8); ctx.fill(); } }
  else if (st.emo === '...') { ctx.fillStyle = col; for (const dx of [0, 20, 40]) { ctx.beginPath(); ctx.arc(dx, 0, 6, 0, Math.PI * 2); ctx.fill(); } }
  else if (st.emo === 'stars') { ctx.fillStyle = '#ffe680'; for (let i = 0; i < 3; i++) { const a = i * 2.1 + k * 6; ctx.save(); ctx.translate(Math.cos(a) * 34 - 40 * f, Math.sin(a) * 10 + 30); ctx.font = '900 34px Inter'; ctx.fillText('✦', 0, 0); ctx.restore(); } }
  else { ctx.fillStyle = col; ctx.font = '900 64px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(st.emo, 0, 0);
    ctx.strokeStyle = col; ctx.lineWidth = 5; for (const a of [-.5, 0, .5]) { ctx.beginPath(); ctx.moveTo(Math.sin(a) * 50 - 10, -Math.cos(a) * 50); ctx.lineTo(Math.sin(a) * 66 - 10, -Math.cos(a) * 66); ctx.stroke(); } }
  ctx.restore();
}

