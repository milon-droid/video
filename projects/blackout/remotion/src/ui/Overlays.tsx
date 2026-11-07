// Слои поверх кадра (раздел 5 ТЗ): KineticCaption, Hud, PartSticker, EndCard, Post (зерно 6% + виньетка 35%), Glitch, Cam.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, FONT, MONO } from '../theme';
import { clamp, lerp, out, spr, win } from '../anim';
import type { Phrase } from '../ep1/shared.mjs';

export const Cam: React.FC<{ z?: number; fx?: number; fy?: number; dx?: number; dy?: number; rot?: number; children: React.ReactNode }> = ({ z = 1, fx = 540, fy = 960, dx = 0, dy = 0, rot = 0, children }) =>
  <g transform={`translate(${fx + dx},${fy + dy}) rotate(${rot}) scale(${z}) translate(${-fx},${-fy})`}>{children}</g>;
export const Frame: React.FC<{ children: React.ReactNode; bg?: string; filter?: string }> = ({ children, bg = C.night, filter }) =>
  <AbsoluteFill style={{ background: bg, filter }}><svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>{children}</svg></AbsoluteFill>;

// субтитры: фраза 3–5 слов, слова загораются по голосу, акцент красный с 1.0→1.06, плашка всегда, проявление 4 кадра
export const KineticCaption: React.FC<{ t: number; caps: Phrase[]; hidden?: boolean }> = ({ t, caps, hidden }) => {
  const p = caps.find(q => t >= q.a && t < q.b); if (!p || hidden) return null; const fa = out(win(t, p.a - .02, p.a + .13));
  const col = p.speaker === 'anchor' ? '#CFE3FF' : C.text;
  return (<div style={{ position: 'absolute', left: 60, width: 900, top: 1275, transform: `translate(0,-50%) translateY(${(1 - fa) * 14}px)`, opacity: fa, display: 'flex', justifyContent: 'center' }}>
    <div style={{ background: 'rgba(11,16,32,.82)', borderRadius: 28, padding: '18px 34px', maxWidth: 840, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 72, lineHeight: 1.1, textTransform: 'uppercase', letterSpacing: .5, wordSpacing: 18 }}>
      {p.words.map((w, i) => { const on = t >= w.t, k = out(win(t, w.t, w.t + .12)); return (<React.Fragment key={i}>{i > 0 && ' '}<span style={{ display: 'inline-block', color: !on ? C.dim : w.accent ? C.danger : col, transform: `scale(${w.accent && on ? lerp(1, 1.06, k) : 1})`, textShadow: '0 4px 10px rgba(0,0,0,.55)' }}>{w.text}</span></React.Fragment>); })}
    </div></div>); };

// табло: «• АЛМАТЫ · +6°» и время слева, связь справа; y = 290 (ниже интерфейса платформы)
export const Hud: React.FC<{ t: number; time: string; signal: 'full' | 'lost' | 'dead'; rewind?: number; flashAt?: number }> = ({ t, time, signal, rewind = 0, flashAt = -9 }) => {
  const full = signal === 'full', fl = clamp(1 - (t - flashAt) / .6);
  const box: React.CSSProperties = { position: 'absolute', top: 290, height: 128, borderRadius: 18, background: 'rgba(11,16,32,.76)', borderTop: `4px solid ${full ? C.window : C.danger}`, boxSizing: 'border-box', fontFamily: MONO, color: C.text };
  return (<>
    <div style={{ ...box, left: 64, width: 300, padding: '14px 22px' }}>
      <div style={{ fontSize: 30, fontWeight: 800, opacity: .88, display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ width: 14, height: 14, borderRadius: 7, background: full ? C.window : C.danger, display: 'inline-block' }} />АЛМАТЫ · +6°</div>
      <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.05, display: 'flex', gap: 14 }}>{time}{rewind > 0 && <span style={{ fontFamily: FONT, fontSize: 40, color: C.window, opacity: Math.sin(rewind * Math.PI), alignSelf: 'center' }}>◀◀</span>}</div></div>
    <div style={{ ...box, right: 70, width: full ? 220 : 320, padding: '0 24px', display: 'flex', alignItems: 'center', gap: 18, boxShadow: fl > 0 ? `0 0 ${50 * fl}px ${C.danger}` : 'none', background: fl > 0 ? `rgba(${lerp(11, 130, fl)},16,28,.85)` : box.background }}>
      <svg width="84" height="70" viewBox="0 0 84 70">{[0, 1, 2, 3].map(i => <rect key={i} x={i * 21} y={60 - (i + 1) * 15} width={14} height={(i + 1) * 15} rx={3} fill={full ? C.text : 'rgba(244,241,234,.22)'} />)}{!full && <path d="M2,6 L80,66" stroke={C.danger} strokeWidth={7} strokeLinecap="round" />}</svg>
      <div style={{ fontSize: 34, fontWeight: 800, color: full ? C.text : C.danger, lineHeight: 1.15 }}>{full ? 'СЕТЬ' : <>НЕТ<br />СЕТИ</>}</div></div>
  </>); };

export const PartSticker: React.FC<{ t: number; n: number }> = ({ t, n }) => { const k = spr(t, 0, { damping: 10 }); if (t > 3) return null;
  return (<div style={{ position: 'absolute', left: 96, top: 448, rotate: '-4deg', scale: String(k), background: '#FFD23F', padding: '10px 30px', fontFamily: FONT, fontWeight: 900, fontSize: 46, color: C.ink, boxShadow: '0 8px 20px rgba(0,0,0,.45)', clipPath: 'polygon(0 4%,10% 0,22% 5%,36% 0,50% 4%,64% 0,78% 5%,90% 0,100% 4%,100% 96%,90% 100%,78% 95%,64% 100%,50% 96%,36% 100%,22% 95%,10% 100%,0 96%)' }}>ЧАСТЬ {n}</div>); };

export const EndCard: React.FC<{ t: number; t0: number; text: string[]; next: string; shakeX?: number }> = ({ t, t0, text, next, shakeX = 0 }) => { const k = out(win(t, t0, t0 + .35));
  return (<AbsoluteFill style={{ background: '#05060c', alignItems: 'center', justifyContent: 'center', translate: `${shakeX}px 0` }}>
    <div style={{ position: 'absolute', top: 760, left: 60, width: 900, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 104, lineHeight: 1.05, color: C.danger, textShadow: '0 0 40px rgba(229,56,59,.7)', opacity: k, scale: String(lerp(1.2, 1, k)) }}>{text.map(s => <div key={s}>{s}</div>)}</div>
    <div style={{ position: 'absolute', top: 1060, left: 60, width: 900, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 70, color: C.text, opacity: out(win(t, t0 + .45, t0 + .8)) }}>{next}</div></AbsoluteFill>); };

// постобработка: зерно 6% (feTurbulence с новым seed каждый кадр) и виньетка 35%
export const Post: React.FC<{ t: number }> = ({ t }) => (<AbsoluteFill style={{ pointerEvents: 'none' }}>
  <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, mixBlendMode: 'overlay', opacity: .16 }}><filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves={2} seed={Math.floor(t * 30) % 97} /><feColorMatrix type="saturate" values="0" /></filter><rect width="100%" height="100%" filter="url(#grain)" /></svg>
  <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,.35) 100%)' }} /></AbsoluteFill>);

// цифровой сбой: цветные смещённые полосы на несколько кадров
export const GlitchBars: React.FC<{ t: number; k: number }> = ({ t, k }) => { if (k <= 0) return null; const r = (n: number) => { const s = Math.sin(n * 91.7 + Math.floor(t * 30) * 13.1) * 43758.5; return s - Math.floor(s); };
  return (<AbsoluteFill style={{ pointerEvents: 'none' }}>{Array.from({ length: 9 }, (_, i) => <div key={i} style={{ position: 'absolute', left: (r(i) - .5) * 160 * k, top: r(i + 20) * 1920, width: 1080, height: 12 + r(i + 40) * 70, background: i % 3 === 0 ? 'rgba(229,56,59,.35)' : i % 3 === 1 ? 'rgba(80,200,255,.3)' : 'rgba(244,241,234,.18)', mixBlendMode: 'screen' }} />)}</AbsoluteFill>); };
