// PhoneScreen (раздел 5 ТЗ): chat | messenger | call. HTML — текст переносится сам и не вылезает; максимум 2 строки, кегль ≥ 44.
// Статус-бар: «4G» и «Wi-Fi» перечёркиваются при потере связи. Аватар Аружан — нарисованный портрет (без фото реальных людей).
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, FONT, MONO } from '../theme';
import { clamp, out, win } from '../anim';

export const AruzhanAvatar: React.FC<{ size: number }> = ({ size }) => (<svg width={size} height={size} viewBox="0 0 100 100" style={{ borderRadius: '50%', display: 'block', flexShrink: 0 }}>
  <defs><linearGradient id="avbg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F7B5C8" /><stop offset="1" stopColor="#F2C27A" /></linearGradient></defs>
  <rect width="100" height="100" fill="url(#avbg)" /><path d="M18,100 C14,60 22,24 50,22 C78,24 86,60 82,100 Z" fill="#2A1A1E" />
  <path d="M30,100 C30,82 40,78 50,78 C60,78 70,82 70,100 Z" fill="#E86A8A" /><rect x="44" y="64" width="12" height="16" rx="5" fill="#E9B994" />
  <ellipse cx="50" cy="50" rx="19" ry="23" fill="#EDC09C" /><path d="M30,48 C30,28 44,24 52,24 C64,24 72,32 70,48 C64,38 56,34 46,36 C40,38 34,42 30,48 Z" fill="#2A1A1E" />
  <path d="M41,50 q3,-3 6,0 M53,50 q3,-3 6,0" stroke="#2A1A1E" strokeWidth="2.2" fill="none" strokeLinecap="round" /><path d="M44,61 q6,5 12,0" stroke="#B5484A" strokeWidth="2.6" fill="none" strokeLinecap="round" />
  <ellipse cx="38" cy="58" rx="4" ry="2.5" fill="#E8735E" opacity=".3" /><ellipse cx="62" cy="58" rx="4" ry="2.5" fill="#E8735E" opacity=".3" /><circle cx="31" cy="60" r="2.4" fill="#F2C14E" /><circle cx="69" cy="60" r="2.4" fill="#F2C14E" /></svg>);

const Status: React.FC<{ time: string; lost: boolean }> = ({ time, lost }) => { const Ic: React.FC<{ s: string }> = ({ s }) => (<span style={{ position: 'relative', opacity: lost ? .5 : 1, marginLeft: 26 }}>{s}{lost && <span style={{ position: 'absolute', left: -6, right: -6, top: '50%', height: 5, background: C.danger, rotate: '-24deg', borderRadius: 3 }} />}</span>);
  return (<div style={{ display: 'flex', justifyContent: 'space-between', padding: '26px 46px 10px', fontFamily: MONO, fontWeight: 800, fontSize: 30, color: C.text }}><span>{time}</span><span><Ic s="4G" /><Ic s="Wi-Fi" /></span></div>); };
export type Msg = { text: string; mine?: boolean; accent?: boolean; ticks?: 0 | 1 | 2; clock?: boolean; icon?: 'taxi' | 'smile'; k?: number };
const Taxi = () => <svg width="54" height="40" viewBox="0 0 54 40" style={{ verticalAlign: 'middle' }}><rect x="4" y="16" width="46" height="16" rx="6" fill="#F2C14E" /><rect x="13" y="6" width="28" height="14" rx="5" fill="#F2C14E" /><rect x="20" y="0" width="14" height="6" fill="#222" /><circle cx="15" cy="33" r="5" fill="#222" /><circle cx="39" cy="33" r="5" fill="#222" /></svg>;
const Smile = () => <svg width="44" height="44" viewBox="0 0 44 44" style={{ verticalAlign: 'middle' }}><circle cx="22" cy="22" r="20" fill="#FFD23F" /><circle cx="15" cy="18" r="3" fill="#3a2a10" /><circle cx="29" cy="18" r="3" fill="#3a2a10" /><path d="M12,26 q10,10 20,0" stroke="#3a2a10" strokeWidth="3" fill="none" strokeLinecap="round" /></svg>;
const Bubble: React.FC<Msg> = ({ text, mine, accent, ticks = 0, clock, icon, k = 1 }) => (<div style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '100%', boxSizing: 'border-box', background: mine ? '#2f6fd6' : accent ? '#3a2f62' : '#24305a', color: accent ? '#FFE0E0' : C.text, borderRadius: 34, padding: '20px 24px', fontFamily: FONT, fontWeight: 800, fontSize: 44, letterSpacing: -1, whiteSpace: 'nowrap', lineHeight: 1.15, opacity: k, translate: `0 ${(1 - k) * 30}px`, display: 'flex', alignItems: 'center', gap: 12 }}>
  <span>{text}</span>{icon === 'taxi' && <Taxi />}{icon === 'smile' && <Smile />}
  {ticks > 0 && <span style={{ color: ticks > 1 ? '#7FD0FF' : 'rgba(244,241,234,.8)', fontSize: 38, letterSpacing: -14, fontWeight: 900 }}>{ticks > 1 ? '✓✓' : '✓'}</span>}
  {clock && <svg width="34" height="34" viewBox="0 0 34 34"><circle cx="17" cy="17" r="13" stroke="rgba(244,241,234,.75)" strokeWidth="3.5" fill="none" /><path d="M17,17 L17,9 M17,17 L23,20" stroke="rgba(244,241,234,.75)" strokeWidth="3.5" strokeLinecap="round" /></svg>}</div>);

// телефон в руке: экран крупно, ниже табло (верх y 450), пальцы по левому краю, большой палец справа
export const PhoneBig: React.FC<{ t: number; lost?: boolean; time: string; header?: { name: string; sub: string; avatar?: 'aruzhan' | 'news' }; children: React.ReactNode; thumbAt?: number[]; thumbXY?: [number, number]; noHand?: boolean }> = ({ t, lost = false, time, header, children, thumbAt = [], noHand = false, thumbXY = [780, 1200] }) => {
  const tap = Math.max(0, ...thumbAt.map(tp => Math.sin(clamp((t - tp + .15) / .3) * Math.PI)));
  return (<AbsoluteFill>
    <div style={{ position: 'absolute', left: 172, top: 432, width: 736, height: 1380, borderRadius: 74, background: '#0d0f16', boxShadow: '0 30px 80px rgba(0,0,0,.55)' }} />
    <div style={{ position: 'absolute', left: 190, top: 450, width: 700, height: 1340, borderRadius: 58, overflow: 'hidden', background: '#101833', display: 'flex', flexDirection: 'column' }}>
      <Status time={time} lost={lost} />
      {header && <div style={{ display: 'flex', alignItems: 'center', gap: 22, padding: '18px 34px', background: '#18234a' }}>
        {header.avatar === 'news' ? <div style={{ width: 92, height: 92, borderRadius: 46, background: C.danger, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 40, color: '#fff' }}>A</div> : <AruzhanAvatar size={92} />}
        <div style={{ overflow: 'hidden' }}><div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 46, color: C.text, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{header.name}</div><div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 30, color: header.sub.startsWith('Conn') ? '#9DB8E8' : '#7FD0A0' }}>{header.sub}</div></div></div>}
      <div style={{ flex: 1, position: 'relative' }}>{children}</div></div>
    {!noHand && <svg viewBox="0 0 1080 1920" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
      {[0, 1, 2, 3].map(i => <g key={i}><rect x={120} y={1000 + i * 92} width={112} height={82} rx={40} fill="#E3AC84" /><path d={`M150,${1004 + i * 92} L150,${1078 + i * 92}`} stroke="#C68863" strokeWidth={3} opacity={.6} /></g>)}
      <g transform={`translate(${880 + (thumbXY[0] - 860) * tap},${1340 + (thumbXY[1] - 1320) * tap}) rotate(-40)`}><rect x={-46} y={-96} width={92} height={240} rx={46} fill="#E3AC84" /><rect x={-30} y={-90} width={60} height={52} rx={24} fill="#F0C8A8" /></g>
      {thumbAt.map(tp => { const r = win(t, tp, tp + .35); return r > 0 && r < 1 ? <circle key={tp} cx={thumbXY[0]} cy={thumbXY[1]} r={20 + r * 70} stroke="rgba(207,227,255,1)" strokeOpacity={1 - r} strokeWidth={5} fill="none" /> : null; })}
    </svg>}</AbsoluteFill>); };
export const ChatList: React.FC<{ msgs: Msg[]; input?: string; failAt?: number; t: number }> = ({ msgs, input, failAt, t }) => (<div style={{ display: 'flex', flexDirection: 'column', gap: 22, padding: '36px 30px' }}>
  {msgs.map((m, i) => <Bubble key={i} {...m} />)}
  {failAt !== undefined && t > failAt && <div style={{ alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: 14, fontFamily: FONT, fontWeight: 900, fontSize: 48, color: C.danger, opacity: out(win(t, failAt, failAt + .25)) }}>Не доставлено <span style={{ width: 44, height: 44, borderRadius: 22, background: C.danger, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 34 }}>!</span></div>}
  {input !== undefined && <div style={{ position: 'absolute', left: 30, right: 30, top: 560, height: 104, borderRadius: 52, background: '#1b2547', display: 'flex', alignItems: 'center', padding: '0 30px', fontFamily: FONT, fontWeight: 700, fontSize: 44, color: C.text }}>{input}<span style={{ marginLeft: 'auto', width: 76, height: 76, borderRadius: 38, background: '#2f6fd6' }} /></div>}</div>);
export const Spinner: React.FC<{ t: number; label?: string }> = ({ t, label = 'Connecting' }) => (<div style={{ display: 'flex', alignItems: 'center', gap: 26, fontFamily: FONT, fontWeight: 800, fontSize: 52, color: '#CFE3FF' }}>
  <svg width="70" height="70" viewBox="-35 -35 70 70" style={{ rotate: `${t * 340}deg` }}>{Array.from({ length: 8 }, (_, i) => <rect key={i} x={-5} y={-33} width={10} height={18} rx={5} fill="#7FB3FF" opacity={(i + 1) / 8} transform={`rotate(${i * 45})`} />)}</svg>{label + '...'.slice(0, 1 + Math.floor(t * 3) % 3)}</div>);
