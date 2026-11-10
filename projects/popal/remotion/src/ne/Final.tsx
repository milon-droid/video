// «Didn't Want To Anyway», сцены 4c–5d: ложа (твист), Вини застыл, флешбэк, прячет букет. Экран мессенджера и титры — HTML.
import React from 'react';
import { clamp, lerp, noise, spr } from '../anim';
import { Glow } from '../bg/Bg';
import { blendPose, Pose, POSES } from '../chars/Person';
import { Cam } from '../ui/Ui';
import { FONT } from '../theme';
import { Stadium } from '../stars/Clip';
import { Baller, Bouquet, Sadie, smooth } from '../stars/Stars';
import { ShotHandshake, VipBox } from './Stadium';
import { ShotP } from './Stadium';

const full = (p: Partial<Pose>): Pose => ({ ...POSES.stand, ...p } as Pose);

// ───── 4c: ложа изнутри — Сэди на диване; камера отъезжает: рядом Диоманде, смеются, обнявшись ─────
const SEAT = 1340;
const Lounge: React.FC<{ t: number }> = ({ t }) => (<g>
  <defs><linearGradient id="lgW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a2a24" /><stop offset="1" stopColor="#5a4234" /></linearGradient></defs>
  <rect width={1080} height={1920} fill="url(#lgW)" />
  {/* панорамное окно на ночное поле */}
  <rect x={60} y={260} width={960} height={560} rx={10} fill="#0a0f22" />
  <svg x={70} y={270} width={940} height={540} viewBox="0 600 1080 620" preserveAspectRatio="xMidYMid slice"><Stadium t={t + 20} /></svg>
  <path d="M370,270 L370,810 M710,270 L710,810" stroke="#2a1e18" strokeWidth={12} />
  <Glow x={300} y={300} r={300} c="#ffd8a0" o={.5} id="lgL1" /><Glow x={800} y={300} r={300} c="#ffd8a0" o={.5} id="lgL2" />
  <rect y={1560} width={1080} height={360} fill="#2a1c18" />
  {/* спинка дивана */}
  <rect x={80} y={1000} width={920} height={380} rx={60} fill="#e8dcc4" /><rect x={80} y={1000} width={920} height={40} rx={20} fill="#f4ecd8" />
</g>);
const SofaFront: React.FC = () => (<g><rect x={50} y={SEAT} width={980} height={260} rx={50} fill="#d8ccb2" /><rect x={50} y={SEAT} width={980} height={30} rx={14} fill="#f0e6d0" />
  <rect x={20} y={1180} width={110} height={420} rx={40} fill="#d0c4aa" /><rect x={950} y={1180} width={110} height={420} rx={40} fill="#d0c4aa" />
  <rect x={300} y={1610} width={480} height={30} rx={10} fill="#1a1210" /><rect x={280} y={1580} width={520} height={40} rx={12} fill="#3a2a22" /></g>);
export const ShotLounge: React.FC<ShotP & { reveal: number }> = ({ t, reveal }) => {
  const k = smooth(reveal - .3, reveal + 1.0, t), z = lerp(2.6, 1.0, k), fx = lerp(640, 540, k), fy = lerp(800, 1000, k);
  const laugh = .25 + .25 * Math.abs(Math.sin(t * 9)), hip = 268 * .9;
  return (<Cam z={z} fx={fx} fy={fy}>
    <Lounge t={t} />
    <Baller who="diom" outfit="track" x={400} y={SEAT + hip} s={.9} t={t + 2} expr="happy" teeth mouth={laugh} headTilt={8} eye={[.6, 0]} pose={{ armR: [1.55, .65], armL: [-.2, .5] }} />
    <Sadie x={650} y={SEAT + hip} s={.9} t={t + 4} expr="happy" mouth={laugh * .8} headTilt={-12} eye={[-.6, 0]} pose={{ armL: [-.6, .9], armR: [.4, -1.5], lean: -.08 }} />
    <SofaFront />
  </Cam>); };

// ───── 5a / 5c: Вини в дверях с букетом; потом медленно прячет его за спину ─────
const Doorway: React.FC<{ t: number }> = ({ t }) => (<g>
  <rect width={1080} height={1920} fill="#2a201c" />
  <rect x={170} y={260} width={740} height={1500} fill="#4a3a32" /><Glow x={540} y={900} r={700} c="#ffd8a0" o={.4} id="dwL" />
  <rect x={150} y={240} width={780} height={1540} fill="none" stroke="#5a3422" strokeWidth={40} />
  <rect y={1640} width={1080} height={280} fill="#3a2a22" />
</g>);
export const ShotFrozen: React.FC<ShotP & { hide?: number }> = ({ t, hide }) => {
  const k = hide != null ? smooth(hide, hide + 1.1, t) : 0, behind = k > .55;
  const P = blendPose(full({ armL: [-.2, .2], armR: [.9, -1.6] }), full({ armL: [-.2, .2], armR: [-.3, -.25] }), k);
  const petal = t * 1.0 % 2.2;
  return (<Cam z={hide != null ? 1.3 + .1 * k : 1.3 + .04 * t} fy={1080} dy={-40}>
    <Doorway t={t} />
    {behind && <g transform="translate(640,1290) rotate(150) scale(.8)" opacity={.95}><Bouquet t={t} /></g>}
    <Baller who="vini" x={540} y={1650} s={1.05} t={hide != null ? 30 : 30} expr={hide != null && k > .2 ? 'deadpan' : 'shock'} pose={P} hold={behind ? null : 'flowers'} eye={hide != null ? [-.3, .3] : [0, 0]} lid={hide != null ? .45 : 0} />
    {hide == null && <path d={`M${720 + Math.sin(petal * 4) * 30},${1060 + petal * 260} c-10,-14 -24,-4 -10,10 c14,6 20,-6 10,-10z`} fill="#ff4a6a" opacity={clamp(1 - petal / 2.2)} />}
  </Cam>); };

// ───── 5b: флешбэк (выцветший): Сэди махала скамейке, где Диоманде; затем рукопожатие ─────
export const ShotFlash: React.FC<ShotP & { cut: number }> = ({ t, m = 0, cut }) => {
  const k = smooth(.1, cut - .1, t);
  return (<g filter="url(#sepia)">
    <defs><filter id="sepia"><feColorMatrix type="matrix" values=".39 .77 .19 0 0  .35 .69 .17 0 0  .27 .53 .13 0 0  0 0 0 1 0" /></filter></defs>
    {t < cut ? <g>
      <g transform={`translate(0,${lerp(0, -960, k)})`}>
        <g transform="translate(0,0)"><VipBox t={t} look={[-.8, .7]} /></g>
        <g transform="translate(0,1920)"><Cam z={1} fy={1200}><Stadium t={t} />
          <Baller who="diom" sit x={540} y={1560} s={1.05} t={t + 6} expr="happy" teeth pose={{ armR: [2.6 + Math.sin(t * 11) * .25, .4], armL: [-.15, .6], legL: [-.15, 0], legR: [.15, 0] }} eye={[.3, -.9]} /></Cam></g>
      </g></g>
      : <ShotHandshake t={t - cut + .4} m={m} />}
    <rect width={1080} height={1920} fill="url(#fbVig)" /><defs><radialGradient id="fbVig" cx=".5" cy=".5" r=".7"><stop offset=".55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#2a1a0a" stopOpacity=".8" /></radialGradient></defs>
    {Array.from({ length: 5 }, (_, i) => <rect key={i} x={(noise('fl' + i, t, 4) * .5 + .5) * 1080} y={0} width={2} height={1920} fill="#fff" opacity={.12} />)}
  </g>); };

// ───── HTML: экран мессенджера (без логотипа) ─────
export const PhoneUI: React.FC<{ t: number; msg: string; reply: string; tSend: number; tReply: number }> = ({ t, msg, reply, tSend, tReply }) => {
  const n = Math.floor(clamp((t - .2) / (tSend - .3)) * msg.length), sent = t > tSend, typing = t > tSend + .5 && t < tReply, rk = spr(t, tReply, { damping: 10, stiffness: 220 });
  const bub = (mine: boolean, text: string, k = 1): React.ReactNode => <div style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: 620, background: mine ? '#3a7bff' : '#2c2c34', color: '#fff', fontSize: 50, fontWeight: 700, lineHeight: 1.2, padding: '22px 30px', borderRadius: 36, transform: `scale(${k})`, transformOrigin: mine ? 'right bottom' : 'left bottom' }}>{text}</div>;
  return (<div style={{ position: 'absolute', inset: 0, background: '#0c0c10', fontFamily: FONT, display: 'flex', flexDirection: 'column' }}>
    <div style={{ height: 230, background: '#16161c', display: 'flex', alignItems: 'center', padding: '60px 50px 0', gap: 28 }}>
      <div style={{ fontSize: 60, color: '#3a7bff' }}>‹</div>
      <div style={{ width: 110, height: 110, borderRadius: 55, background: 'radial-gradient(circle at 50% 70%, #f8ddc9 34%, #b8442a 36%)', border: '4px solid #ff5a7a' }} />
      <div><div style={{ color: '#fff', fontSize: 50, fontWeight: 900 }}>sadie.sink <span style={{ color: '#3a9bff', fontSize: 40 }}>✔</span></div><div style={{ color: '#8a8a96', fontSize: 34, fontWeight: 700 }}>{typing ? 'typing…' : 'Active now'}</div></div>
    </div>
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 26, padding: '0 50px 80px' }}>
      {sent && bub(true, msg)}
      {sent && t < tReply && <div style={{ alignSelf: 'flex-end', color: '#8a8a96', fontSize: 32, fontWeight: 700 }}>Seen</div>}
      {typing && <div style={{ alignSelf: 'flex-start', background: '#2c2c34', borderRadius: 36, padding: '26px 34px', display: 'flex', gap: 14 }}>{[0, 1, 2].map(i => <div key={i} style={{ width: 20, height: 20, borderRadius: 10, background: '#aaa', opacity: .4 + .6 * Math.max(0, Math.sin(t * 9 - i)) }} />)}</div>}
      {t > tReply && bub(false, reply, rk)}
    </div>
    <div style={{ height: 300, background: '#16161c', padding: '30px 40px', display: 'flex', gap: 20, alignItems: 'flex-start' }}>
      <div style={{ flex: 1, minHeight: 100, background: '#24242c', borderRadius: 50, color: '#fff', fontSize: 46, fontWeight: 600, padding: '24px 34px', lineHeight: 1.2 }}>{sent ? <span style={{ color: '#6a6a76' }}>Message…</span> : <>{msg.slice(0, n)}<span style={{ opacity: Math.sin(t * 12) > 0 ? 1 : 0 }}>|</span></>}</div>
      <div style={{ width: 100, height: 100, borderRadius: 50, background: '#3a7bff', color: '#fff', fontSize: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>↑</div>
    </div>
  </div>); };

// ───── HTML: субтитры по фразе, слова загораются по длине ─────
export const Sub: React.FC<{ t: number; t0: number; dur: number; text: string }> = ({ t, t0, dur, text }) => {
  if (t < t0 - .05 || t > t0 + dur + .25) return null; const words = text.split(' '), tot = text.length; let acc = 0;
  return (<div style={{ position: 'absolute', left: 60, right: 60, top: 1300, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 64, lineHeight: 1.15 }}>
    {words.map((w, i) => { const on = t >= t0 + dur * (acc / tot); acc += w.length + 1;
      return <span key={i} style={{ color: on ? '#ffffff' : 'rgba(255,255,255,.45)', WebkitTextStroke: '12px #14121c', paintOrder: 'stroke fill', marginRight: 16, display: 'inline-block' }}>{w}</span>; })}</div>); };
