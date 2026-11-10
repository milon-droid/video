// «Didn't Want To Anyway», сцены 1c–3f: телефон, скамейка, рукопожатие, пробежка, VIP-ложа, промах, трибуны.
// Все кадры 1080×1920, время t от начала плана. Эмблем клубов нет; номер у Диоманде не ставим (не проверен).
import React from 'react';
import { clamp, lerp, noise, shake, spr } from '../anim';
import { Glow } from '../bg/Bg';
import { blendPose, Pose, POSES, runPose } from '../chars/Person';
import { Cam } from '../ui/Ui';
import { Stadium } from '../stars/Clip';
import { Ball, Baller, Bouquet, legPts, Sadie, smooth } from '../stars/Stars';

const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const full = (p: Partial<Pose>): Pose => ({ ...POSES.stand, ...p } as Pose);
const wave = (t: number, base: number, amp = .25, f = 11) => base + Math.sin(t * f) * amp;
export type ShotP = { t: number; m?: number };   // m — открытие рта по голосу

// ───── 1c: Вини достаёт телефон (диван, средний план) ─────
export const ShotGrab: React.FC<ShotP> = ({ t, m = 0 }) => {
  const k = spr(t, .25, { damping: 12, stiffness: 140 }), fl = .5 + .5 * noise('gf', t, 3);
  return (<Cam z={1.55} fy={1050} dy={-80}>
    <rect width={1080} height={1920} fill="#1c1828" />
    <rect x={720} y={300} width={300} height={520} rx={8} fill="#0e0c16" /><rect x={734} y={314} width={272} height={492} fill="#1a2a5a" />
    <Glow x={540} y={700} r={900} c="#6a7aff" o={.35 + .2 * fl} id="grabTv" />
    <rect x={60} y={1080} width={960} height={260} rx={70} fill="#4a3650" /><rect x={30} y={1260} width={1020} height={420} rx={60} fill="#3a2a40" />
    <Baller who="vini" outfit="home" sit x={540} y={1560} s={1.1} t={t + 9} expr="smug" mouth={m} hold="phone" headTilt={-6}
      pose={blendPose(full({ armL: [-.15, .5], armR: [.15, -.5] }), full({ armL: [-.15, .5], armR: [.25, -2.15] }), k)} eye={[.3, .1]} />
  </Cam>); };

// ───── 1d: экран мессенджера (без логотипа) — рисуется в HTML поверх, см. Phone UI в Ne.tsx ─────

// ───── 1e: лицо Вини крупно, отбрасывает телефон ─────
export const ShotToss: React.FC<ShotP & { toss: number }> = ({ t, m = 0, toss }) => {
  const k = spr(t, toss, { damping: 10, stiffness: 200 }), fly = t > toss ? t - toss : 0;
  return (<Cam z={2.1} fy={900} dy={-120}>
    <rect width={1080} height={1920} fill="#1c1828" />
    <Glow x={540} y={700} r={900} c="#6a7aff" o={.4} id="tossTv" />
    <rect x={60} y={1080} width={960} height={260} rx={70} fill="#4a3650" />
    <Baller who="vini" outfit="home" sit x={540} y={1560} s={1.1} t={t + 12} expr="deadpan" mouth={m} hold={t < toss ? 'phone' : null} headTilt={4}
      pose={blendPose(full({ armL: [-.15, .5], armR: [.25, -2.15] }), full({ armL: [-.15, .5], armR: [2.2, -.3] }), k)} eye={[-.1, 0]} />
    {fly > 0 && <g transform={`translate(${760 + fly * 1500},${700 - fly * 900 + fly * fly * 1400}) rotate(${fly * 900})`}><rect x={-28} y={-54} width={56} height={104} rx={10} fill="#111" /><rect x={-23} y={-47} width={46} height={88} rx={6} fill="#5ad0ff" /></g>}
  </Cam>); };

// ───── 2a: скамейка запасных, тренер зовёт, Вини вскакивает ─────
const Dugout: React.FC = () => (<g>
  <path d="M-40,880 Q540,780 1120,880 L1120,1420 L-40,1420 Z" fill="#0e1428" opacity={.85} />
  <path d="M-40,880 Q540,780 1120,880 L1120,930 Q540,830 -40,930 Z" fill="#9ad0ff" opacity={.25} />
  {Array.from({ length: 6 }, (_, i) => <g key={i} transform={`translate(${110 + i * 175},1300)`}><path d="M-70,-150 Q-74,-30 -60,0 L60,0 Q74,-30 70,-150 Q0,-170 -70,-150 Z" fill="#1d3a8a" /><rect x={-66} y={-10} width={132} height={40} rx={10} fill="#16306e" /></g>)}
</g>);
export const ShotBench: React.FC<ShotP & { up: number }> = ({ t, m = 0, up }) => {
  const sit = t < up, j = spr(t, up, { damping: 9, stiffness: 180 }), hop = t > up ? Math.sin(clamp((t - up) / .35) * Math.PI) * 60 : 0;
  return (<Cam z={1.05 + .03 * t} fy={1200} dy={-60}>
    <Stadium t={t + 2} />
    <Dugout />
    <Baller who="vini" sit={sit} x={420} y={sit ? 1560 : 1560 - hop} s={1.05} t={t + 3} expr={sit ? 'sad' : 'happy'} teeth={!sit} mouth={m}
      pose={sit ? { armL: [-.15, .6], armR: [.15, -.6], legL: [-.15, 0], legR: [.15, 0] } : blendPose(full({ armL: [-.3, .3], armR: [.3, -.3] }), full({ armL: [-2.5, .3], armR: [2.5, -.3], legL: [-.2, .1], legR: [.2, -.1] }), j) as Pose} eye={[.7, -.1]} />
    <Baller who="coach" outfit="coat" x={850} y={1620} s={1.0} t={t} expr="determined" mouth={t > .2 && t < .9 ? .3 + .2 * Math.sin(t * 20) : 0}
      pose={{ armL: [-.2, .2], armR: [wave(t, 2.2, .5, 9), -1.2] }} eye={[-.8, 0]} headTilt={-6} />
  </Cam>); };

// ───── 2b: бровка — Диоманде уходит, рукопожатие и хлопок по плечу ─────
export const ShotHandshake: React.FC<ShotP & { faded?: boolean }> = ({ t, m = 0 }) => {
  const pat = Math.max(0, Math.sin(t * 9)) * .12;
  return (<Cam z={1.08 + .04 * t} fy={1150} dy={-40}>
    <Stadium t={t + 4} />
    <Baller who="diom" x={360} y={1600} s={1.05} t={t + 1} expr="happy" teeth pose={{ armR: [1.25, .35], armL: [-.2, .2] }} eye={[.8, 0]} headTilt={5} />
    <Baller who="vini" x={720} y={1600} s={1.05} t={t + 5} expr="smug" mouth={m} pose={{ armL: [-1.45 - pat, .3], armR: [.2, -.2] }} eye={[-.8, 0]} headTilt={-4} />
  </Cam>); };

// ───── 3a: Вини получает пас и бежит к пустым воротам ─────
const Goal: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (<g transform={`translate(${x},${y}) scale(${s})`}>
  <path d="M-200,0 L-200,-320 L200,-320 L200,0" stroke="#f4f6fa" strokeWidth={18} fill="none" />
  <path d="M-200,-320 L-150,-260 L150,-260 L200,-320 M-150,-260 L-150,30 M150,-260 L150,30" stroke="#dfe4ee" strokeWidth={6} fill="none" opacity={.7} />
  {Array.from({ length: 13 }, (_, i) => <path key={i} d={`M${-150 + i * 25},-260 L${-190 + i * 32},0`} stroke="#fff" strokeWidth={2} opacity={.35} />)}
  {Array.from({ length: 9 }, (_, i) => <path key={'h' + i} d={`M-170,${-250 + i * 30} L170,${-250 + i * 30}`} stroke="#fff" strokeWidth={2} opacity={.3} />)}
</g>);
export const ShotRun: React.FC<ShotP> = ({ t }) => {
  const dist = t * 520, ph = dist / 70, P = runPose(ph), ballX = 560 + Math.sin(ph) * 14, ballY = 1590 - Math.abs(Math.sin(ph)) * 26;
  const recv = clamp(t / .3), passBall = t < .3 ? [lerp(-60, ballX, recv), lerp(1500, ballY, recv)] : [ballX, ballY];
  return (<Cam z={1.0} fy={1200} dy={-40}>
    <g transform={`translate(${540 - dist * .12},960) scale(1.25) translate(-540,-960)`}><Stadium t={t + 6} /></g>
    {Array.from({ length: 8 }, (_, i) => { const x = ((i * 260 - dist) % 2080 + 2080) % 2080 - 300; return <path key={i} d={`M${x},1700 l220,0`} stroke="#fff" strokeWidth={5} opacity={.12} />; })}
    <Goal x={lerp(1350, 930, smooth(0, 1.6, t))} y={1520} s={.85} />
    <Baller who="vini" x={400} y={1610} s={1.0} t={t + 7} expr="determined" pose={P} eye={[.6, .5]} />
    <Ball x={passBall[0]} y={passBall[1]} r={34} rot={dist * 1.2} />
  </Cam>); };

// ───── 3b: VIP-ложа — за стеклом только Сэди, машет (взгляд в сторону скамейки) ─────
export const VipBox: React.FC<{ t: number; look?: [number, number] }> = ({ t, look = [-.8, .4] }) => (<g>
  <rect width={1080} height={1920} fill="#0c1022" />
  <path d="M-40,1160 Q540,1080 1120,1160 L1120,1920 L-40,1920 Z" fill="#141c3a" />
  {Array.from({ length: 160 }, (_, i) => { const x = hash(i) * 1120 - 20, y = 1200 + hash(i * 3) * 700; return <circle key={i} cx={x} cy={y} r={10 + hash(i * 5) * 5} fill={['#3a4a8a', '#5a3a6a', '#e8e8f0', '#2a4a6a'][i % 4]} opacity={.5} />; })}
  <rect x={0} y={300} width={1080} height={760} fill="#1a1e30" />
  {[0, 1].map(i => <rect key={i} x={i ? 860 : 0} y={330} width={220} height={700} fill="#22283e" />)}
  {/* стекло ложи с тёплым светом */}
  <rect x={170} y={380} width={740} height={600} rx={10} fill="#3a2a2a" />
  <Glow x={540} y={640} r={520} c="#ffc890" o={.75} id="vipWarm" />
  <g clipPath="url(#vipClip)"><defs><clipPath id="vipClip"><rect x={180} y={390} width={720} height={580} /></clipPath></defs>
    <rect x={180} y={820} width={720} height={160} fill="#6a3a2a" />
    <Sadie x={560} y={1330} s={.95} t={t + 2} expr="happy" eye={look} headTilt={-6} pose={{ armR: [wave(t, 2.5, .2), .45], armL: [-.15, .1] }} />
  </g>
  <rect x={180} y={880} width={720} height={100} fill="#1a1e30" opacity={.85} /><rect x={170} y={870} width={740} height={16} fill="#c8c0b0" />
  <path d="M220,400 L380,400 L240,960 L180,960 Z" fill="#fff" opacity={.08} /><path d="M620,400 L700,400 L560,960 L480,960 Z" fill="#fff" opacity={.06} />
  <rect x={170} y={380} width={740} height={600} rx={10} fill="none" stroke="#0a0c16" strokeWidth={14} />
  <text x={540} y={1035} fontSize={44} fontWeight={900} fill="#e8c46a" textAnchor="middle" fontFamily="Mont" letterSpacing={8}>VIP</text>
</g>);
export const ShotBox: React.FC<ShotP> = ({ t }) => <Cam z={1.45 + .1 * smooth(0, 1.6, t)} fy={720} dy={180}><VipBox t={t} /></Cam>;

// ───── 3c: Вини крупно, глаза-сердечки ─────
export const ShotHearts: React.FC<ShotP> = ({ t, m = 0 }) => {
  const h = spr(t, .35, { damping: 7, stiffness: 220 });
  return (<Cam z={2.2} fy={880} dy={-80}>
    <Stadium t={t + 8} />
    <Glow x={540} y={760} r={500} c="#ff7aa0" o={.35 * h} id="heartGlow" />
    <Baller who="vini" x={540} y={1600} s={1.0} t={t + 9} expr="happy" teeth={t > .35} mouth={m} hearts={h} headTilt={-8} eye={[-.6, -.6]} pose={{ armL: [-.3, .3], armR: [.3, -.3] }} />
    {t > .4 && [0, 1, 2, 3].map(i => { const u = t - .4 - i * .3; if (u < 0) return null; const x = 440 + i * 70 + Math.sin(u * 5 + i) * 20, y = 760 - u * 260;
      return <path key={i} transform={`translate(${x},${y}) scale(.9)`} d="M0,14 C-6,8 -30,-4 -30,-18 C-30,-32 -12,-36 0,-22 C12,-36 30,-32 30,-18 C30,-4 6,8 0,14 Z" fill="#ff5a8a" opacity={clamp(1 - u)} />; })}
  </Cam>); };

// ───── 3d: промах — бьёт, глядя на ложу, мяч улетает в трибуну мимо пустых ворот ─────
export const KICK_AT = .55;
export const ShotMiss: React.FC<ShotP> = ({ t }) => {
  const P = t < .3 ? full({ armL: [-.5, .3], armR: [.5, -.3] }) : t < KICK_AT ? blendPose(full({ armL: [-.5, .3], armR: [.5, -.3] }), full({ legR: [-.4, -1.25], legL: [-.1, .12], armL: [-1.25, .3], armR: [1.0, .3], lean: -.06 }), smooth(.3, KICK_AT, t))
    : blendPose(full({ legR: [1.2, .05], legL: [-.12, .1], armL: [-1.6, .25], armR: [.35, .3], lean: -.14 }), full({ legR: [1.7, .1], legL: [-.14, .1], armL: [-1.7, .2], armR: [.3, .3], lean: -.2 }), smooth(KICK_AT, KICK_AT + .3, t));
  const x = 360, y = 1610, s = .95, an = legPts(1, [1.2, .05]).an, bx0 = x + (an[0] + 40) * s, by0 = y + (an[1] - 20) * s;
  const u = Math.max(0, t - KICK_AT), bx = t < KICK_AT ? bx0 : bx0 + u * 900, by = t < KICK_AT ? by0 : by0 - u * 2600 + u * u * 900, sh = shake(t, KICK_AT, 10, .3);
  return (<Cam z={1.0} fy={1200} dx={sh[0]} dy={sh[1] - 40}>
    <Stadium t={t + 10} />
    <Goal x={820} y={1520} s={.9} />
    <Baller who="vini" x={x} y={y} s={s} t={t + 11} expr="happy" teeth pose={P} headTilt={-14} eye={[-.7, -.9]} />
    <Ball x={bx} y={by} r={34 * s * (1 - u * .25)} rot={t * 1400} />
    {t > KICK_AT && t < KICK_AT + .25 && <circle cx={bx0} cy={by0} r={30 + (t - KICK_AT) * 600} fill="none" stroke="#fff" strokeWidth={10} opacity={1 - (t - KICK_AT) / .25} />}
  </Cam>); };

// ───── 3e: трибуны хватаются за головы ─────
export const ShotFans: React.FC<ShotP> = ({ t }) => {
  const sh = shake(t, .05, 8, .5), grab = spr(t, .08, { damping: 9, stiffness: 200 });
  const skins = ['#f1c7a6', '#c88a62', '#6e4632', '#e2b08c', '#8a5a40'], shirts = ['#f6f6f3', '#1d2a5c', '#f6f6f3', '#d2a640', '#f6f6f3'];
  return (<Cam z={1.06} fy={960} dx={sh[0]} dy={sh[1]}>
    <rect width={1080} height={1920} fill="#0d1430" />
    {[0, 1, 2, 3].map(row => <g key={row}>
      <rect x={-40} y={520 + row * 360} width={1160} height={60} fill="#1d2a55" />
      {Array.from({ length: 5 }, (_, i) => { const n = row * 5 + i, cx = 110 + i * 215 + (row % 2) * 100 - 50, cy = 470 + row * 360, sk = skins[n % 5], sc = .9 + row * .12, a = grab * (1.9 + hash(n) * .5);
        return (<g key={i} transform={`translate(${cx},${cy}) scale(${sc})`}>
          <path d="M-70,90 Q-74,-10 -40,-30 L40,-30 Q74,-10 70,90 Z" fill={shirts[n % 5]} />
          {[-1, 1].map(sd => { const sx = sd * 52, sy = -10, ex = sx + Math.sin(sd * a) * 70, ey = sy - Math.cos(a) * 70 * .1 - 60 * grab;
            return <path key={sd} d={`M${sx},${sy} Q${ex + sd * 20},${ey + 20} ${sd * 50},${-110}`} stroke={sk} strokeWidth={22} fill="none" strokeLinecap="round" />; })}
          <circle cx={0} cy={-100} r={50} fill={sk} />
          <ellipse cx={-17} cy={-106} rx={8} ry={10} fill="#fff" /><ellipse cx={17} cy={-106} rx={8} ry={10} fill="#fff" /><circle cx={-17} cy={-104} r={4} fill="#1a0f0a" /><circle cx={17} cy={-104} r={4} fill="#1a0f0a" />
          <ellipse cx={0} cy={-76} rx={10} ry={14 * grab + 2} fill="#5a1d24" />
          <path d="M-30,-128 Q-20,-120 -8,-124 M30,-128 Q20,-120 8,-124" stroke="#2a1a1a" strokeWidth={4} fill="none" />
          {[-1, 1].map(sd => <circle key={'h' + sd} cx={sd * 50} cy={-110} r={17} fill={sk} />)}
        </g>); })}
    </g>)}
    <Glow x={540} y={200} r={700} c="#cfe8ff" o={.3} id="fanLight" />
  </Cam>); };

// ───── 3f: Вини улыбается и машет ложе ─────
export const ShotWave: React.FC<ShotP> = ({ t, m = 0 }) => (<Cam z={1.6} fy={1050} dy={-60}>
  <Stadium t={t + 12} />
  <Baller who="vini" x={540} y={1620} s={1.0} t={t + 13} expr="smug" mouth={m} teeth={m < .1} headTilt={-8} eye={[-.6, -.7]} pose={{ armR: [wave(t, 2.5, .25), .4], armL: [-.2, .2] }} />
</Cam>);

// ───── 4a: коридор VIP: поправляет причёску, букет из-за спины ─────
const Corridor: React.FC<{ t: number }> = ({ t }) => (<g>
  <defs><linearGradient id="corW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a2e2a" /><stop offset="1" stopColor="#5a463a" /></linearGradient></defs>
  <rect width={1080} height={1920} fill="url(#corW)" />
  {Array.from({ length: 6 }, (_, i) => <rect key={i} x={i * 190 - 40} y={500} width={150} height={900} rx={6} fill="#4a3a32" opacity={.6} />)}
  {[200, 540, 880].map((x, i) => <g key={i}><rect x={x - 50} y={200} width={100} height={20} rx={8} fill="#fff4d8" /><Glow x={x} y={240} r={300} c="#ffd8a0" o={.45} id={'cl' + i} /></g>)}
  <rect y={1460} width={1080} height={460} fill="#2a1a1a" /><path d="M340,1460 L740,1460 L980,1920 L100,1920 Z" fill="#7a1a2a" />
  <path d="M340,1460 L740,1460" stroke="#c8a24a" strokeWidth={6} />
</g>);
export const ShotCorridor: React.FC<ShotP & { swap: number }> = ({ t, swap }) => {
  const k = spr(t, swap, { damping: 9, stiffness: 160 }), hair = t < swap - .1;
  const P = hair ? full({ armL: [-2.3, -1.3 + Math.sin(t * 12) * .25], armR: [-.35, -.3] }) : blendPose(full({ armL: [-.2, .2], armR: [-.35, -.3] }), full({ armL: [-.2, .2], armR: [.9, -1.6] }), k);
  return (<Cam z={1.25} fy={1100} dy={-40}>
    <Corridor t={t} />
    <Baller who="vini" x={540} y={1640} s={1.05} t={t + 14} expr={hair ? 'cool' : 'smug'} teeth={!hair} hold={t > swap ? 'flowers' : null} pose={P} eye={[.3, 0]} headTilt={hair ? -6 : 0} />
    {t > swap && t < swap + .5 && [0, 1, 2, 3, 4].map(i => { const a = i * 1.26, r = 60 + (t - swap) * 400; return <path key={i} d={`M${700 + Math.cos(a) * r},${1050 + Math.sin(a) * r} l0,-24 l6,18 l18,6 l-18,6 z`} fill="#ffe27a" opacity={1 - (t - swap) / .5} />; })}
  </Cam>); };

// ───── 4b: дверь VIP открывается ─────
export const ShotDoor: React.FC<ShotP> = ({ t }) => {
  const k = smooth(.2, .8, t);
  return (<Cam z={1.15} fy={1000}>
    <rect width={1080} height={1920} fill="#3a2e2a" />
    <rect x={240} y={300} width={600} height={1300} fill="#fff1d8" /><Glow x={540} y={900} r={700} c="#ffe0b0" o={k} id="doorLight" />
    <g transform={`translate(240,0) scale(${1 - k * .85},1)`}><rect x={0} y={300} width={600} height={1300} fill="#5a3422" />
      <rect x={60} y={380} width={480} height={500} rx={10} fill="none" stroke="#4a2a1a" strokeWidth={14} /><rect x={60} y={960} width={480} height={560} rx={10} fill="none" stroke="#4a2a1a" strokeWidth={14} />
      <rect x={200} y={220 + 200} width={200} height={70} rx={10} fill="#c8a24a" /><text x={300} y={470} fontSize={44} fontWeight={900} fill="#3a2414" textAnchor="middle" fontFamily="Mont">VIP</text>
      <circle cx={530} cy={960} r={22} fill="#e8c46a" /></g>
    <rect x={220} y={280} width={640} height={1340} fill="none" stroke="#2a1e18" strokeWidth={40} />
  </Cam>); };
