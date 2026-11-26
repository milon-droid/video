// story.js — монтаж: планы серии подряд, переходы (smear — мазок размазывает кадр, dip — через тёмное, cut), cue-лист звука
const EPS = {};
const STORY = (() => {
  const S = {}; let SH = [];
  S.init = ep => { SH = EPS[ep](); let t = 0; SH.forEach(s => { s.a = t; t += s.d; s.b = t; }); window.DURATION = t; window.CUES = [];
    SH.forEach(s => (s.cues || []).forEach(c => CUES.push({ t: +(s.a + c[0]).toFixed(3), id: c[1], v: c[2] == null ? 1 : c[2], o: c[3] || {} })));
    S.SH = SH; };
  const run = (s, lt, t) => { E.S.cvd = s.cvd == null ? 1 : s.cvd; s.draw(lt, t); return E.S.cvd; };
  S.draw = t => { let i = SH.findIndex(s => t >= s.a && t < s.b); if (i < 0) i = SH.length - 1; const s = SH[i]; const lt = t - s.a; const tr = s.tr || {};
    if (i > 0 && tr.type === 'smear' && lt < tr.d) { const pv = SH[i - 1]; E.target('A'); const c0 = run(pv, t - pv.a, t); E.target('B'); const c1 = run(s, lt, t);
      const k = E.eio(lt / tr.d); E.S.pr = Math.max(.001, k); E.S.dir = tr.dir || [1, 0]; E.S.cvd = E.lerp(c0, c1, k); E.target('A'); }
    else if (i > 0 && tr.type === 'dip' && lt < tr.d / 2) { const pv = SH[i - 1]; E.target('A'); run(pv, t - pv.a, t); E.S.fade = E.sm(lt / (tr.d / 2)); }
    else { E.target('A'); run(s, lt, t); if (tr.type === 'dip' && lt < tr.d) E.S.fade = Math.max(E.S.fade, 1 - E.sm((lt - tr.d / 2) / (tr.d / 2))); if (tr.type === 'fade' && lt < tr.d) E.S.fade = Math.max(E.S.fade, 1 - E.sm(lt / tr.d)); }
    if (s.out && lt > s.d - s.out) E.S.fade = Math.max(E.S.fade, E.sm((lt - (s.d - s.out)) / s.out)); };
  return S;
})();
// общие помощники для серий
const K = {
  drift: (lt, d, a, b) => { const k = E.eio(lt / d); return { x: E.lerp(a.x, b.x, k), y: E.lerp(a.y, b.y, k), z: E.lerp(a.z || 1, b.z || 1, k), r: E.lerp(a.r || 0, b.r || 0, k) }; },
  shake: (t, a) => [E.wob(t, 7, 1) * a, E.wob(t, 7, 2) * a],
  quote: (s, lt, a, b, o = {}) => E.sub(s, lt, a, b, Object.assign({ font: 'Hand', weight: 400, size: 66, color: '#fff3d6' }, o)),
  // карточка конца серии
  card: (lt, d, ep, name, next, o = {}) => { const x = E.ctx(); E.nocam(); x.fillStyle = '#120d0b'; x.fillRect(0, 0, E.W, E.H);
    E.dabs(x, { n: 260, len: 140, wid: 40, seed: 900 + ep, alpha: .5, angle: () => -.4, col: (px, py, r) => [20 + r() * 20, 30, 8 + r() * 10] });
    const k = E.eo(lt / .6); x.save(); x.font = '900 300px Fr'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillStyle = o.titleCol || '#b3231f'; x.globalAlpha = k; x.fillText('RED', E.W / 2, 560 + (1 - k) * 40); x.restore();
    if (o.truthTitle) E.truth(m => m.rect(60, 400, 600, 320));
    E.detail(360, 560, 330, .8);
    E.text(`EPISODE ${ep} · ${name}`, E.W / 2, 790, { size: 40, weight: 700, a: E.ss(lt, .4, .9), ls: 4 });
    if (next) E.text(next, E.W / 2, 900, { size: 46, a: E.ss(lt, 1, 1.5), color: '#e8d9b8' }); },
};
