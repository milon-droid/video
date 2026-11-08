// Слои поверх кадра: субтитры, табло СИЛА/ЗДОРОВЬЕ/АУРА, окно системы, инфо-стенд закона мира, бирки, звуковые слова,
// штамп, карточка выбора, финальная плашка, зерно и виньетка.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, FONT, MONO, WHO_COL } from '../theme';
import { clamp, lerp, out, spr, win } from '../anim';

export const Frame: React.FC<{ children: React.ReactNode; bg?: string; style?: React.CSSProperties }> = ({ children, bg = '#000', style }) =>
  <AbsoluteFill style={{ background: bg, ...style }}><svg viewBox="0 0 1080 1920" width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}>{children}</svg></AbsoluteFill>;
export const Cam: React.FC<{ z?: number; fx?: number; fy?: number; dx?: number; dy?: number; rot?: number; children: React.ReactNode }> = ({ z = 1, fx = 540, fy = 960, dx = 0, dy = 0, rot = 0, children }) =>
  <g transform={`translate(${fx + dx},${fy + dy}) rotate(${rot}) scale(${z}) translate(${-fx},${-fy})`}>{children}</g>;
const stroke = (w: number, c = '#14121c') => `${w}px ${c}`;

// ───── субтитры: 1–2 строки, слова загораются по голосу, акцент жёлтым; у говорящих в кадре — бирка имени ─────
export type Word = { text: string; t: number; accent: boolean };
export type Phrase = { who: string; a: number; b: number; words: Word[] };
export const Captions: React.FC<{ t: number; caps: Phrase[]; names: Record<string, string>; top?: number }> = ({ t, caps, names, top = 1290 }) => {
  const p = caps.find(q => t >= q.a && t < q.b); if (!p) return null; const fa = out(win(t, p.a - .02, p.a + .12)); const col = WHO_COL[p.who] || C.text;
  const name = p.who !== 'zk' && p.who !== 'max' ? names[p.who] : null;
  return (<div style={{ position: 'absolute', left: 60, width: 860, top, transform: `translate(0,-50%) translateY(${(1 - fa) * 16}px)`, opacity: fa, textAlign: 'center' }}>
    {name && <div style={{ display: 'inline-block', marginBottom: 10, padding: '6px 20px', borderRadius: 12, background: col, color: '#14121c', fontFamily: FONT, fontWeight: 900, fontSize: 34, letterSpacing: 1 }}>{name}</div>}
    <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 70, lineHeight: 1.12, textTransform: 'uppercase', letterSpacing: .5, wordSpacing: 10 }}>
      {p.words.map((w, i) => { const on = t >= w.t, k = out(win(t, w.t, w.t + .12)); return (<React.Fragment key={i}>{i > 0 && ' '}<span style={{ display: 'inline-block', color: !on ? 'rgba(220,222,232,.55)' : w.accent ? C.yellow : col,
        WebkitTextStroke: stroke(11), paintOrder: 'stroke fill', transform: `scale(${w.accent && on ? lerp(1.12, 1, k) : 1})`, textShadow: '0 6px 14px rgba(0,0,0,.6)' }}>{w.text}</span></React.Fragment>); })}</div></div>); };
export const BottomShade: React.FC = () => <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(10,8,20,.42) 78%, rgba(10,8,20,.55) 100%)' }} />;

// ───── табло героя ─────
export type Stats = { str: number; hp: number; aura: number; hit: number; gain: number; loss: number; hpBar: number; auraFrom?: number; auraAt?: number };
export const Hud: React.FC<{ t: number; st: Stats; t0: number }> = ({ t, st, t0 }) => {
  const plate = (i: number, icon: string, label: string, val: string, col: string, extra?: React.ReactNode, flashCol?: string, flashK = 0, shakeK = 0) => {
    const k = spr(t, t0 + i * .95, { damping: 11, stiffness: 140 }); const sx = Math.sin(t * 70) * 10 * shakeK;
    return (<div key={i} style={{ position: 'absolute', top: 205, left: 64 + i * 322, width: 300, height: 132, borderRadius: 22, background: flashK > 0 ? `color-mix(in srgb, ${flashCol} ${Math.round(flashK * 70)}%, rgba(20,18,28,.82))` : 'rgba(20,18,28,.82)',
      borderTop: `5px solid ${col}`, boxShadow: flashK > 0 ? `0 0 ${40 * flashK}px ${flashCol}` : '0 8px 24px rgba(0,0,0,.35)', transform: `translate(${sx}px, ${(1 - k) * -260}px) scale(${lerp(.6, 1, k)})`, opacity: clamp(k * 2), boxSizing: 'border-box', padding: '12px 18px', fontFamily: FONT, color: C.text, overflow: 'visible' }}>
      <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: 1.5, color: col, display: 'flex', gap: 8, alignItems: 'center' }}><span style={{ fontSize: 30 }}>{icon}</span>{label}</div>
      <div style={{ fontSize: 66, fontWeight: 900, lineHeight: 1.05, fontFamily: FONT }}>{val}</div>{extra}</div>); };
  const aK = st.auraAt != null ? clamp((t - st.auraAt) / .45) : 1, auraShow = Math.round(lerp(st.auraFrom ?? st.aura, st.aura, aK));
  const gainK = clamp(1 - (t - st.gain) / .7), lossK = clamp(1 - (t - st.loss) / .7), hitK = clamp(1 - (t - st.hit) / .5);
  const pop = (txt: string, col: string, t1: number) => { const k = (t - t1) / 1.1; if (k < 0 || k > 1) return null; return <div style={{ position: 'absolute', right: 6, top: 60 - k * 70, fontSize: 44, fontWeight: 900, color: col, opacity: 1 - k * k, WebkitTextStroke: stroke(6), paintOrder: 'stroke fill', fontFamily: FONT }}>{txt}</div>; };
  return (<>{plate(0, '⚔', 'СИЛА', String(st.str), '#ff8a5a', pop('+1', C.green, st.gain), C.green, st.str > 1 ? gainK : 0)}
    {plate(1, '❤', 'ЗДОРОВЬЕ', String(st.hp), '#ff4a6a', <div style={{ position: 'absolute', left: 120, right: 18, top: 78, height: 18, borderRadius: 9, background: 'rgba(255,255,255,.15)' }}><div style={{ width: `${st.hpBar * 100}%`, height: '100%', borderRadius: 9, background: st.hpBar < .35 ? C.red : '#ff4a6a' }} /></div>, C.red, hitK, hitK)}
    {plate(2, '✦', 'АУРА', String(auraShow), C.gold, <>{st.auraAt != null && st.aura > (st.auraFrom ?? 0) && pop(`+${st.aura - (st.auraFrom ?? 0)}`, C.gold, st.auraAt)}{st.auraAt != null && st.aura < (st.auraFrom ?? 0) && pop(`${st.aura - (st.auraFrom ?? 0)}`, C.red, st.auraAt)}</>, st.aura >= (st.auraFrom ?? 0) ? C.gold : C.red, Math.max(st.aura > 0 ? gainK * (st.gain === st.auraAt || st.gain > -1 ? 1 : 0) : 0, lossK), lossK)}</>); };

// ───── окно «системы» (голограмма) ─────
export const SysWindow: React.FC<{ t: number; t0: number; title: string; sub?: string; y?: number; col?: string }> = ({ t, t0, title, sub, y = 760, col = C.teal }) => {
  const k = out(win(t, t0, t0 + .35)), sc = spr(t, t0, { damping: 13 }); if (t < t0) return null;
  return (<div style={{ position: 'absolute', left: 90, width: 900, top: y, transform: `scale(${lerp(.7, 1, sc)},${lerp(.05, 1, k)})`, opacity: k, border: `4px solid ${col}`, borderRadius: 18, background: 'rgba(10,40,60,.78)', boxShadow: `0 0 40px ${col}`, padding: '26px 30px', fontFamily: FONT, color: '#e8fbff', textAlign: 'center' }}>
    <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: 6, color: col }}>◆ СИСТЕМА ◆</div><div style={{ fontSize: 64, fontWeight: 900, lineHeight: 1.1, marginTop: 6 }}>{title}</div>
    {sub && <div style={{ fontSize: 34, fontWeight: 700, marginTop: 8, opacity: .9 }}>{sub}</div>}</div>); };

// ───── инфо-стенд «Закон вселенной» ─────
export type StandLine = { t: number; icon?: string; text: string; col?: string; big?: boolean };
export const InfoStand: React.FC<{ t: number; num: string; title: string; lines: StandLine[]; art?: React.ReactNode; col?: string; top?: number }> = ({ t, num, title, lines, art, col = C.teal, top = 420 }) => {
  const k = spr(t, 0, { damping: 13, stiffness: 120 });
  return (<AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 40%, #2a2a5a 0%, #12122a 70%)' }}>
    <svg width="1080" height="1920" style={{ position: 'absolute', inset: 0, opacity: .25 }}>{Array.from({ length: 30 }, (_, i) => <path key={i} d={`M0,${i * 70 + (t * 20) % 70} L1080,${i * 70 + (t * 20) % 70}`} stroke={col} strokeWidth={1} />)}</svg>
    <div style={{ position: 'absolute', left: 70, width: 940, top, transform: `translateY(${(1 - k) * 120}px) scale(${lerp(.9, 1, k)})`, opacity: clamp(k * 1.5), borderRadius: 30, background: 'linear-gradient(180deg, rgba(30,34,70,.96), rgba(16,18,40,.96))', border: `4px solid ${col}`, boxShadow: `0 0 60px ${col}55`, padding: '28px 40px 36px', fontFamily: FONT, color: C.text }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}><div style={{ background: col, color: '#10122a', fontWeight: 900, fontSize: 30, padding: '8px 18px', borderRadius: 12, letterSpacing: 2 }}>{num}</div>
        <div style={{ fontWeight: 800, fontSize: 30, letterSpacing: 4, color: col }}>ЗАКОНЫ МИРА</div></div>
      <div style={{ fontWeight: 900, fontSize: 60, lineHeight: 1.08, marginTop: 18, textTransform: 'uppercase' }}>{title}</div>
      {art && <div style={{ height: 380, marginTop: 20, position: 'relative' }}><svg viewBox="0 0 860 380" width="860" height="380" style={{ position: 'absolute', inset: 0 }}>{art}</svg></div>}
      <div style={{ marginTop: 18 }}>{lines.map((l, i) => { const kk = out(win(t, l.t, l.t + .3)); return (<div key={i} style={{ display: 'flex', gap: 18, alignItems: 'center', marginTop: 16, opacity: kk, transform: `translateX(${(1 - kk) * -60}px)` }}>
        {l.icon && <div style={{ fontSize: 46, width: 64, textAlign: 'center', color: l.col || col }}>{l.icon}</div>}<div style={{ fontSize: l.big ? 50 : 42, fontWeight: l.big ? 900 : 800, lineHeight: 1.15, color: l.col || C.text }}>{l.text}</div></div>); })}</div></div></AbsoluteFill>); };

// ───── бирка-ярлык ─────
export const Tag: React.FC<{ t: number; t0: number; x: number; y: number; title: string; sub?: string; col?: string; tx?: number; ty?: number; w?: number }> = ({ t, t0, x, y, title, sub, col = C.red, tx, ty, w = 560 }) => {
  const k = out(win(t, t0, t0 + .3)); if (t < t0) return null;
  return (<>{tx != null && <svg width="1080" height="1920" style={{ position: 'absolute', inset: 0 }}><path d={`M${x + 20},${y + 40} L${tx},${ty}`} stroke={col} strokeWidth={5} strokeDasharray={`${k * 600} 600`} /><circle cx={tx} cy={ty} r={10 * k} fill={col} /></svg>}
    <div style={{ position: 'absolute', left: x, top: y, width: w, transform: `translateX(${(1 - k) * -40}px)`, opacity: k, background: 'rgba(20,18,28,.88)', borderLeft: `10px solid ${col}`, borderRadius: 12, padding: '12px 20px', fontFamily: FONT, color: C.text }}>
      <div style={{ fontSize: 44, fontWeight: 900, lineHeight: 1.05 }}>{title}</div>{sub && <div style={{ fontSize: 30, fontWeight: 800, color: col, marginTop: 4 }}>{sub}</div>}</div></>); };

// ───── звуковое слово и штамп ─────
export const Onomato: React.FC<{ t: number; t0: number; x: number; y: number; text: string; col?: string; size?: number; rot?: number; dur?: number }> = ({ t, t0, x, y, text, col = C.yellow, size = 150, rot = -8, dur = 1.1 }) => {
  if (t < t0 || t > t0 + dur) return null; const k = spr(t, t0, { damping: 8, stiffness: 220 }), o = clamp((t0 + dur - t) / .2);
  return <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${k})`, opacity: o, fontFamily: FONT, fontWeight: 900, fontSize: size, color: col, WebkitTextStroke: stroke(16), paintOrder: 'stroke fill', textShadow: '0 10px 0 #14121c', whiteSpace: 'nowrap' }}>{text}</div>; };
export const Stamp: React.FC<{ t: number; t0: number; text: string; sub?: string; col?: string; y?: number; size?: number; rot?: number }> = ({ t, t0, text, sub, col = C.yellow, y = 820, size = 230, rot = -6 }) => {
  if (t < t0) return null; const k = out(win(t, t0, t0 + .22)), sc = lerp(3, 1, k), bl = (1 - k) * 12;
  return (<div style={{ position: 'absolute', left: 0, width: 1080, top: y, textAlign: 'center', transform: `rotate(${rot}deg) scale(${sc})`, opacity: clamp(k * 2), filter: `blur(${bl}px)` }}>
    <div style={{ display: 'inline-block', fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1, color: col, WebkitTextStroke: stroke(22), paintOrder: 'stroke fill', textShadow: '0 16px 0 #14121c' }}>{text}</div>
    {sub && <div style={{ marginTop: 18 }}><span style={{ background: '#ffd23f', color: '#14121c', fontFamily: FONT, fontWeight: 900, fontSize: 54, padding: '8px 28px', borderRadius: 10 }}>{sub}</span></div>}</div>); };
export const Flash: React.FC<{ t: number; t0: number; dur?: number; col?: string }> = ({ t, t0, dur = .25, col = '#fff' }) => { const k = clamp(1 - (t - t0) / dur); if (t < t0 || k <= 0) return null; return <AbsoluteFill style={{ background: col, opacity: k }} />; };

// ───── карточка выбора ─────
export const Choice: React.FC<{ t: number; left: { title: string; sub: string; col: string; art: React.ReactNode; size?: number }; right: { title: string; sub: string; col: string; art: React.ReactNode; size?: number }; center?: React.ReactNode }> = ({ t, left, right, center }) => {
  const kl = spr(t, .15, { damping: 12 }), kr = spr(t, .4, { damping: 12 }), pulse = .5 + .5 * Math.sin(t * 6);
  const half = (side: 0 | 1, o: typeof left, k: number) => (<div style={{ position: 'absolute', top: 0, bottom: 0, left: side ? 540 : 0, width: 540, overflow: 'hidden', transform: `translateX(${(1 - k) * (side ? 560 : -560)}px)` }}>
    <svg viewBox="0 0 540 1920" width="540" height="1920" style={{ position: 'absolute', inset: 0 }}>{o.art}</svg>
    <div style={{ position: 'absolute', left: 30, right: 30, top: 1090, textAlign: 'center', fontFamily: FONT }}>
      <div style={{ display: 'inline-block', background: o.col, color: '#14121c', fontWeight: 900, fontSize: 30, padding: '6px 16px', borderRadius: 10 }}>{side ? 'ВАРИАНТ Б' : 'ВАРИАНТ А'}</div>
      <div style={{ fontWeight: 900, fontSize: o.size ?? 64, lineHeight: 1.0, color: '#fff', WebkitTextStroke: stroke(12), paintOrder: 'stroke fill', marginTop: 10, whiteSpace: 'nowrap', transform: `scale(${1 + pulse * .03})` }}>{o.title}</div>
      <div style={{ fontWeight: 800, fontSize: 32, color: o.col, marginTop: 8, WebkitTextStroke: stroke(6), paintOrder: 'stroke fill' }}>{o.sub}</div></div></div>);
  return (<AbsoluteFill style={{ background: '#14121c' }}>{half(0, left, kl)}{half(1, right, kr)}
    <div style={{ position: 'absolute', left: 528, top: 0, width: 24, height: 1920, background: 'linear-gradient(180deg, #ffd23f, #fff, #ffd23f)', boxShadow: '0 0 30px #ffd23f', transform: `scaleY(${out(win(t, .5, .9))})` }} />
    <div style={{ position: 'absolute', left: 540, top: 600, transform: `translate(-50%,-50%) scale(${spr(t, .7, { damping: 9 })})`, width: 150, height: 150, borderRadius: 75, background: '#ffd23f', border: '8px solid #14121c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 50, color: '#14121c' }}>ИЛИ</div>
    {center}</AbsoluteFill>); };

export const EndCard: React.FC<{ t: number }> = ({ t }) => { const k = out(win(t, 0, .35)), k2 = out(win(t, .35, .7));
  return (<AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 45%, #3a2a6a, #120e22 75%)' }}>
    <div style={{ position: 'absolute', top: 640, left: 60, width: 960, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 96, lineHeight: 1.02, color: C.yellow, WebkitTextStroke: stroke(14), paintOrder: 'stroke fill', opacity: k, transform: `scale(${lerp(1.25, 1, k)})` }}>СЕРИЯ 2</div>
    <div style={{ position: 'absolute', top: 760, left: 60, width: 960, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 64, lineHeight: 1.1, color: '#fff', opacity: k2 }}>ПО ВАШЕМУ ВЫБОРУ</div>
    <div style={{ position: 'absolute', top: 920, left: 60, width: 960, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 46, color: C.teal, opacity: out(win(t, .7, 1.0)) }}>ПИШИ В КОММЕНТАХ 👇</div></AbsoluteFill>); };

export const PartSticker: React.FC<{ t: number; t0: number; t1: number }> = ({ t, t0, t1 }) => { if (t < t0 || t > t1) return null; const k = spr(t, t0, { damping: 10 });
  return (<div style={{ position: 'absolute', left: 96, top: 380, rotate: '-4deg', scale: String(k), background: '#ffd23f', padding: '10px 30px', fontFamily: FONT, fontWeight: 900, fontSize: 46, color: '#14121c', boxShadow: '0 8px 20px rgba(0,0,0,.45)' }}>СЕРИЯ 1</div>); };

export const Post: React.FC<{ t: number }> = ({ t }) => (<AbsoluteFill style={{ pointerEvents: 'none' }}>
  <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, mixBlendMode: 'overlay', opacity: .1 }}><filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves={2} seed={Math.floor(t * 30) % 97} /><feColorMatrix type="saturate" values="0" /></filter><rect width="100%" height="100%" filter="url(#grain)" /></svg>
  <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,.28) 100%)' }} /></AbsoluteFill>);
export { MONO };
