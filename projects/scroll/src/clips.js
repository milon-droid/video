// «Залипательные» ролики ленты. Пространство ролика 1080×1920. lt — время внутри ролика (у паркура может быть < 0 — петля).
const NEON = ink(1, 0, .2), NEON_B = ink(0, 1, 0), NEON_Y = ink(0, 0, 1);
function uiOverlay(ctx, user, cap, likes, prog) {        // общий интерфейс ленты (без брендов)
  for (const [i, [ic, n]] of [['♥', likes], ['…', '2.1K'], ['➦', 'share']].entries()) {
    const y = 1080 + i * 190; ctx.beginPath(); ctx.arc(980, y, 56, 0, 7); fill(ctx, ink(0, 0, 0, 0)); ctx.lineWidth = 6; ctx.strokeStyle = PAPER; ctx.stroke();
    ctx.font = '900 52px Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = i === 0 ? NEON : PAPER; ctx.fillText(ic, 980, y + 2);
    ctx.font = '800 30px Inter'; ctx.fillStyle = PAPER; ctx.fillText(n, 980, y + 86);
  }
  ctx.textAlign = 'left'; ctx.font = '900 46px Inter'; ctx.fillStyle = PAPER; ctx.fillText(user, 50, 1640);
  ctx.font = '700 40px Inter'; ctx.fillText(cap, 50, 1712);
  ctx.fillStyle = ink(.3, .3, .3); ctx.fillRect(0, 1880, 1080, 10); ctx.fillStyle = PAPER; ctx.fillRect(0, 1880, 1080 * prog, 10);
}
// A — паркур по крышам
function clipParkour(ctx, lt) {
  const sp = 900, X = lt * sp;                            // мир едет влево
  const g = ctx.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, ink(.6, .9, 0)); g.addColorStop(1, ink(1, .2, .6)); ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
  ctx.beginPath(); ctx.arc(780, 520, 150, 0, 7); fill(ctx, ink(0, 0, 1));
  for (let i = Math.floor(X * .3 / 260) - 1; i < Math.floor(X * .3 / 260) + 6; i++) { const x = i * 260 - X * .3, h = 500 + hash(i) * 500; ctx.fillStyle = ink(.7, 1, .5); ctx.fillRect(x, 1920 - h - 200, 240, h + 200); }
  // крыши: блоки с промежутками
  const roof = i => ({ x: i * 700 + (hash(i * 3) * 120), w: 520 + hash(i + 7) * 120, y: 1250 + (hash(i + 3) - .5) * 160 });
  const i0 = Math.floor((X - 400) / 700) - 1;
  for (let i = i0; i < i0 + 5; i++) { const r = roof(i), x = r.x - X; ctx.fillStyle = ink(.9, 1, .8); ctx.fillRect(x, r.y, r.w, 1920 - r.y); ctx.fillStyle = NEON_Y; ctx.fillRect(x, r.y, r.w, 18);
    for (let wy = r.y + 80; wy < 1900; wy += 120) for (let wx = x + 40; wx < x + r.w - 60; wx += 110) { ctx.fillStyle = hash(wx * 7 + wy) > .5 ? NEON_Y : ink(.6, 1, .5); ctx.fillRect(wx, wy, 50, 60); } }
  // бегун: экранная x 330; прыжок над промежутком
  const wx = X + 330, ri = Math.floor((wx - 0) / 700); let r = roof(ri); if (wx > r.x + r.w) r = null;
  const ph = (wx % 700 + 700) % 700, nr = roof(ri + 1), cur = roof(ri);
  let y = cur.y, air = 0;
  const ja = cur.x + cur.w - 60, jb = nr.x + 40;                    // от края до следующей крыши
  if (wx > ja && wx < jb) { const u = (wx - ja) / (jb - ja); air = u; y = lerp(cur.y, nr.y, u) - Math.sin(u * Math.PI) * 330; }
  const flip = air > 0 && ri % 3 === 0 ? air * Math.PI * 2 : 0, rc = lt * 14;
  ctx.save(); ctx.translate(330, y - 150); ctx.rotate(flip);
  const limb = (a, l1, l2, b) => { ctx.beginPath(); ctx.moveTo(0, a); ctx.lineTo(Math.sin(b) * l1, a + Math.cos(b) * l1); ctx.lineTo(Math.sin(b) * l1 + Math.sin(b * .5 - .6) * l2, a + Math.cos(b) * l1 + Math.cos(b * .5 - .6) * l2); stroke(ctx, 30, OUT); stroke(ctx, 18, PAPER); };
  const rr2 = air ? 1.2 : Math.sin(rc);
  limb(20, 80, 80, rr2 * .9); limb(20, 80, 80, -rr2 * .9);                  // ноги
  ctx.beginPath(); ctx.moveTo(0, 20); ctx.lineTo(10, -90); stroke(ctx, 40, OUT); stroke(ctx, 28, NEON);
  limb(-80, 60, 60, -rr2 * 1.2 + Math.PI); limb(-80, 60, 60, rr2 * 1.2 + Math.PI);
  ctx.beginPath(); ctx.arc(14, -140, 40, 0, 7); fill(ctx, PAPER); stroke(ctx, 8);
  ctx.restore();
  uiOverlay(ctx, '@run.forever', 'wait for the last jump 😳', '1.2M', ((lt % 9) + 9) % 9 / 9);
}
// B — гипно-спираль
function clipSpiral(ctx, lt) {
  ctx.fillStyle = ink(.1, .9, 0); ctx.fillRect(0, 0, 1080, 1920);
  ctx.save(); ctx.translate(540, 900); ctx.rotate(lt * 2.6); const pulse = 1 + .08 * Math.sin(lt * 9);
  for (let k = 0; k < 2; k++) { ctx.beginPath(); for (let a = 0; a < 40; a += .05) { const r = (a * 26 + k * 13 * 26 / 13 * 5) * pulse; ctx.lineTo(Math.cos(a + k * Math.PI) * r, Math.sin(a + k * Math.PI) * r); } stroke(ctx, 70, k ? NEON_Y : NEON); }
  ctx.restore();
  ctx.beginPath(); ctx.arc(540, 900, 40 + 10 * Math.sin(lt * 9), 0, 7); fill(ctx, PAPER);
  ctx.font = '900 64px Inter'; ctx.textAlign = 'center'; ctx.fillStyle = PAPER; ctx.lineWidth = 12; ctx.strokeStyle = OUT; ctx.strokeText('STARE FOR 10 SEC 👁', 540, 300); ctx.fillText('STARE FOR 10 SEC 👁', 540, 300);
  uiOverlay(ctx, '@hypno.daily', 'you will see colors after', '890K', lt / 6);
}
// C — резка мыла
function clipSoap(ctx, lt) {
  ctx.fillStyle = ink(.25, 0, .15); ctx.fillRect(0, 0, 1080, 1920);
  rr(ctx, 120, 1150, 840, 90, 20); fill(ctx, ink(.5, .2, .7)); stroke(ctx, 8);
  const cuts = Math.floor(lt / .28), sub = (lt / .28) % 1, bx = 260;
  rr(ctx, bx + cuts * 40, 800, 560 - cuts * 40, 350, 30); fill(ctx, ink(.45, .05, 0)); stroke(ctx, 8);
  for (let i = 0; i < cuts && i < 12; i++) { const age = lt - i * .28, fx = bx + i * 40 - age * 260, fy = 800 + Math.min(age, .4) * 0 + Math.max(0, age - .1) ** 2 * 900; ctx.save(); ctx.translate(fx, Math.min(fy, 1100)); ctx.rotate(-Math.min(age * 2, 1.4)); rr(ctx, -20, 0, 40, 350, 6); fill(ctx, ink(.45, .05, 0)); stroke(ctx, 6); ctx.restore(); }
  const ky = 450 + (sub < .5 ? sub * 2 : 2 - sub * 2) * 720; ctx.fillStyle = PAPER; ctx.beginPath(); ctx.moveTo(bx + cuts * 40 + 30, ky); ctx.lineTo(bx + cuts * 40 + 50, ky - 500); ctx.lineTo(bx + cuts * 40 + 120, ky - 500); ctx.lineTo(bx + cuts * 40 + 30, ky + 20); ctx.fill(); stroke(ctx, 8);
  for (let i = 0; i < 18; i++) { const u = (lt * 1.6 + hash(i)) % 1; ctx.fillStyle = ink(.45, .05, 0); ctx.fillRect(bx + cuts * 40 + (hash(i + 5) - .5) * 200, 1130 - u * 60 + u * u * 200, 14, 14); }
  uiOverlay(ctx, '@asmr.cuts', 'so satisfying 😩🔊', '3.4M', lt / 5);
}
// D — мяч в вращающихся кольцах
function clipRings(ctx, lt) {
  ctx.fillStyle = ink(.6, 1, .4); ctx.fillRect(0, 0, 1080, 1920);
  const esc = Math.floor(lt / .7);
  for (let k = 6; k >= 0; k--) { if (k < esc) continue; const r = 120 + k * 60, gap = .55, a0 = lt * (k % 2 ? 2.4 : -2) + k;
    ctx.beginPath(); ctx.arc(540, 900, r, a0 + gap, a0 + Math.PI * 2); stroke(ctx, 20, [NEON, NEON_Y, NEON_B][k % 3]); }
  for (let k = 0; k < esc && k < 7; k++) { const age = lt - k * .7; if (age > .6) continue; for (let i = 0; i < 14; i++) { const a = i / 14 * 6.28, r = 120 + k * 60 + age * 500; ctx.fillStyle = [NEON, NEON_Y, NEON_B][k % 3]; ctx.fillRect(540 + Math.cos(a) * r, 900 + Math.sin(a) * r, 16, 16); } }
  const br = 40 + Math.min(esc, 6) * 60, ba = lt * 7.3; ctx.beginPath(); ctx.arc(540 + Math.cos(ba) * br * .8, 900 + Math.sin(ba * 1.3) * br * .8, 32, 0, 7); fill(ctx, PAPER); stroke(ctx, 6);
  ctx.font = '900 58px Inter'; ctx.textAlign = 'center'; ctx.fillStyle = PAPER; ctx.lineWidth = 10; ctx.strokeStyle = OUT; ctx.strokeText(`ESCAPED: ${Math.min(esc, 7)}/7`, 540, 360); ctx.fillText(`ESCAPED: ${Math.min(esc, 7)}/7`, 540, 360);
  uiOverlay(ctx, '@ball.escape', 'it gets crazy at the end', '5.8M', lt / 5);
}
// E — гидропресс
function clipPress(ctx, lt) {
  ctx.fillStyle = ink(.15, .3, .1); ctx.fillRect(0, 0, 1080, 1920);
  const cyc = (lt % 1.2 + 1.2) % 1.2, down = cyc < .5 ? E.in(cyc / .5) : cyc < .8 ? 1 : 1 - (cyc - .8) / .4;
  const py = 300 + down * 620, sq = clamp((py + 100 - 900) / 140);
  ctx.fillStyle = ink(.6, .9, .4); ctx.fillRect(500, 0, 80, py - 60); rr(ctx, 260, py - 80, 560, 100, 10); fill(ctx, ink(.7, .9, .5)); stroke(ctx, 8);
  ctx.save(); ctx.translate(540, 1150); ctx.scale(1 + sq * .9, 1 - sq * .8);                // уточка
  ctx.beginPath(); ctx.ellipse(0, -60, 170, 110, 0, 0, 7); fill(ctx, NEON_Y); stroke(ctx, 8);
  ctx.beginPath(); ctx.arc(70, -200, 80, 0, 7); fill(ctx, NEON_Y); stroke(ctx, 8); ctx.beginPath(); ctx.ellipse(160, -190, 50, 22, 0, 0, 7); fill(ctx, ink(.8, 0, 1)); stroke(ctx, 6);
  ctx.beginPath(); ctx.arc(90, -220, 12, 0, 7); fill(ctx, OUT); ctx.restore();
  rr(ctx, 160, 1150, 760, 60, 8); fill(ctx, ink(.7, .9, .5)); stroke(ctx, 8);
  if (sq > .8) for (let i = 0; i < 16; i++) { const a = i / 16 * 6.28, r = 200 + (cyc - .5) * 1500; ctx.fillStyle = NEON_Y; ctx.fillRect(540 + Math.cos(a) * r, 1100 + Math.sin(a) * r * .4, 18, 18); }
  uiOverlay(ctx, '@press.it', 'duck vs 20 tons 🦆', '7.7M', lt / 5);
}
const CLIPS = { A: clipParkour, B: clipSpiral, C: clipSoap, D: clipRings, E: clipPress };
