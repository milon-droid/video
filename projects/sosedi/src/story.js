// «Knock Knock»: дом в разрезе. Этаж 3 (Мия) y 0..860, перекрытие 860..900, этаж 2 (Лео) 900..1760, лестница x 0..300, комнаты x 300..1000.
const DUR = 49.6, REAL_DUR = DUR; var CUR_T = 0;
const F3 = 860, F2 = 1760;
const KNOCKS_UP = [.35, .95, 1.55, 8.6, 9.0, 9.2, 24.6, 24.9];       // Мия стучит в пол (её время)
const KNOCKS_ROOF = [43.0, 43.25];                                    // стук сверху в старости (новая соседка)
const KNOCKS_LEO = [6.8, 7.0, 48.0, 48.2];                            // Лео стучит грифом в потолок
const JAM = [11.0, 16.0], BEAT = .6;
const hairLeo = (y) => y < .5 ? ink(.7, .85, .55) : y < .85 ? ink(.25, .4, .25) : PAPER;
const hairMia = (y) => y < .5 ? ink(.95, .05, .6) : y < .85 ? ink(.3, .35, .3) : ink(.12, .25, .14);
const TL = [32.5, 41.0];                                              // таймлапс лет
const tlStage = t => clamp((t - TL[0]) / (TL[1] - TL[0]));
const ageK = t => t < TL[0] ? 0 : t > TL[1] ? 1 : tlStage(t);         // 0 молодые … 1 старые
function hitAmt(t, list, w = .12) { let m = 0; for (const k of list) { const u = t - k; if (u > -w && u < w * .6) m = Math.max(m, 1 - Math.abs(u) / w); } return m; }
function sky(t) {                         // 0 ночь, 1 день
  if (t < 13.5) return 0; if (t < 16) return .5 + .5 * Math.sin((t - 13.5) / 2.5 * Math.PI * 2 - Math.PI / 2);
  if (t < 26.3) return 0; if (t < 32.5) return sstep(26.3, 27.2, t);
  if (t < TL[1]) return .5 + .5 * Math.sin((t - TL[0]) * 2.2);
  return 0;
}
const rain = t => (t < 26.3 || t > 41.0) ? 1 : 0;
// ---------- Мия ----------
function miaPose(t) {
  const P = { x: 720, y: F3, R: 66, kind: 'woman', age: 24, outfit: 'pajama', pants: ink(.1, .55, 0), hair: 'bob', hairCol: hairMia(0), browCol: hairMia(0), t, seed: 2, look: [0, .7], smile: 0, furrow: .6 };
  const tt = t > 48.5 ? t - DUR : t;                                   // петля: в конце она снова поднимает швабру
  if (tt < 2.6) {                                                      // злится, стучит шваброй
    const h = hitAmt(tt, KNOCKS_UP), lift = Math.max(0, Math.sin(((tt + .25) % .6) / .6 * Math.PI)) * (1 - h);
    Object.assign(P, { broom: [630, F3 - 30 - lift * 140], hA: [640, 560 - lift * 120], hB: [645, 660 - lift * 120], look: [0, .9], furrow: .8, smile: -.3, O: 0 });
  } else if (tt < 8.4) Object.assign(P, { broom: [630, F3 - 30], hA: [640, 560], hB: [645, 660], look: [0, .9], furrow: tt > 7.0 ? 0 : .7, wide: tt > 6.9 ? 1 : 0, brow: tt > 6.9 ? 1 : 0, O: tt > 6.9 && tt < 7.8 ? 1 : 0 });
  else if (tt < 11) { const h = hitAmt(tt, KNOCKS_UP), lift = (tt > 8.4 && tt < 9.3) ? Math.max(0, Math.sin(((tt - 8.4) % .4) / .4 * Math.PI)) * (1 - h) : 0;
    Object.assign(P, { broom: [630, F3 - 30 - lift * 110], hA: [640, 560 - lift * 100], hB: [645, 660 - lift * 100], look: [0, .9], smile: sstep(10.3, 10.8, tt), brow: .5, furrow: 0 }); }
  else if (tt < 16) { const ph = (tt - 11) / BEAT, k = Math.abs(Math.sin(ph * Math.PI)), sw = Math.sin(ph * Math.PI / 2);
    Object.assign(P, { x: 720 + sw * 40, broom: [630 + sw * 40, F3 - 30 - k * 60], hA: [640 + sw * 40, 560 - k * 50], hB: [645 + sw * 40, 660 - k * 50], look: [sw * .4, .4], smile: 1, open: .3, eye: .4, happyEyes: true, tilt: sw * .15, furrow: 0 }); }
  else if (tt < 24.4) { P.x = 900; Object.assign(P, { look: [1, .5], smile: .7, furrow: 0, hB: [960, tt < 17.6 ? 480 + (tt - 16) * 40 : 520], hA: [880, 640], broom: null, lean: .3 });
    if (tt > 23.4) Object.assign(P, { smile: .3, look: [.6, .6], brow: .6 }); }
  else if (tt < 26.3) { const h = hitAmt(tt, KNOCKS_UP), lift = Math.max(0, Math.sin(((tt - 24.35) % .3) / .3 * Math.PI)) * (tt < 25.0 ? 1 : 0) * (1 - h);
    Object.assign(P, { x: 760, broom: [670, F3 - 30 - lift * 90], hA: [680, 560 - lift * 80], hB: [685, 660 - lift * 80], look: [0, .9], smile: 1, furrow: 0, eye: .5, happyEyes: true }); }
  else Object.assign(P, { broom: null, furrow: 0 });
  return P;
}
// ---------- Лео ----------
function leoPose(t) {
  const P = { x: 620, y: F2, R: 70, kind: 'man', age: 25, sit: 1, outfit: 'tee', pants: ink(.45, .8, .3), hair: 'curly', hairCol: hairLeo(0), browCol: hairLeo(0), t, seed: 1, look: [0, .5], smile: .3, guitar: true };
  const strum = (a, b, sp = 14) => t > a && t < b ? Math.sin(t * sp) * 18 : 0;
  P.hA = [575, 1625]; P.hB = [660, 1660 + strum(-1, 2.6) + strum(9.6, 10.5) + strum(11, 16, 10) + strum(20, 21.5, 9)];
  if (t < 2.6) Object.assign(P, { look: [0, .6], smile: .6, eye: .6, happyEyes: false });
  if (t > 2.6 && t < 6.5) Object.assign(P, { look: [0, -1], brow: .6, smile: sstep(5.5, 6.2, t) * .9 });
  if (t > 6.5 && t < 7.3) { const up = sstep(6.5, 6.7, t) * (1 - sstep(7.1, 7.3, t)); P.gup = up; P.hA = [lerp(575, 600, up), lerp(1625, 1250, up)]; P.hB = [lerp(660, 640, up), lerp(1660, 1330, up)]; P.look = [0, -1]; P.smile = 1; }
  if (t > 7.3 && t < 11) Object.assign(P, { look: [0, -1], smile: t > 9.5 ? 1 : .5, brow: .5 });
  if (t > 11 && t < 16) Object.assign(P, { look: [Math.sin(t * 2) * .3, -.4], smile: 1, open: .25, eye: .5, happyEyes: true, tilt: Math.sin(t * 5) * .08 });
  if (t > 16 && t < 18.4) Object.assign(P, { look: [1, -.5], brow: .6, smile: .5 });
  if (t > 17.4 && t < 21.5) { P.x = lerp(620, 800, sstep(17.4, 17.9, t)); P.sit = 1; P.guitar = t > 20; P.hB = t < 20 ? [960, 1180] : P.hB; P.hA = t < 20 ? [700, 1180] : P.hA; P.look = [.6, .4]; P.smile = 1; }
  if (t > 21.5 && t < 24.4) Object.assign(P, { x: 800, guitar: false, hA: [840, 1260], hB: [900, t < 22.3 ? 1290 + Math.sin(t * 20) * 6 : 1220], look: [.8, t < 22.3 ? .4 : -.6], smile: .4 });
  if (t > 24.4 && t < 26.6) Object.assign(P, { x: 800, guitar: false, look: [0, -1], brow: 1, wide: t > 24.65 ? 1 : 0, smile: t > 25.0 ? 1 : 0, open: t > 25.0 ? .4 : 0, hA: [740, t > 25.6 ? 1150 : 1600], hB: [860, t > 25.6 ? 1150 : 1600], bob: t > 25.6 ? -Math.abs(Math.sin(t * 9)) * 30 : 0 });
  return P;
}
