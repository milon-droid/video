// Оформление канала с футбольными мемами «ФК НЕ ОЧЕНЬ»: шапка 2560×1440 (YouTube, безопасная зона 1546×423 по центру)
// и аватарка 1080×1080 (круг). Стиль ролика «Didn't Want To Anyway»: ночной стадион, неон. Только вымышленные персонажи.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Stadium } from '../stars/Clip';
import { Glow } from '../bg/Bg';
import { Ball, Baller } from '../stars/Stars';

const NAME = 'ФК НЕ ОЧЕНЬ', TAG = 'футбол, который пошёл не по плану';
const Neon: React.FC<{ x: number; y: number; size: number; text: string; c: string; glow: string; w?: number; ls?: number }> = ({ x, y, size, text, c, glow, w = 900, ls = 0 }) => (<g fontFamily="Mont" fontWeight={w} fontSize={size} textAnchor="middle" letterSpacing={ls}>
  <text x={x} y={y} fill="none" stroke={glow} strokeWidth={size * .16} opacity={.35} filter="url(#blur)">{text}</text>
  <text x={x} y={y + size * .06} fill="#0a0d24" opacity={.7}>{text}</text>
  <text x={x} y={y} fill={c}>{text}</text>
</g>);
const Defs = () => (<defs><filter id="blur" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="18" /></filter>
  <linearGradient id="trail" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#fff" stopOpacity=".7" /></linearGradient></defs>);

export const Banner: React.FC = () => (<AbsoluteFill style={{ background: '#040817' }}><svg viewBox="0 0 2560 1440" width="100%" height="100%"><Defs />
  {/* стадион ролика растянут на ширину: 1080 → 2560 */}
  <g transform="translate(0,-1560) scale(2.37)"><Stadium t={2} /></g>
  <rect width={2560} height={1440} fill="#070a20" opacity={.28} />
  <Glow x={1280} y={700} r={900} c="#8a5cff" o={.35} id="bnGlow" />
  {/* слева: герой пробил «верняк» — мяч улетает в небо; справа: вратарь разводит руками, тренер за голову */}
  <Baller who="mate" x={500} y={1180} s={.82} t={1} expr="shock" eye={[.6, -.9]} headTilt={-8}
    pose={{ armL: [-1.4, .5], armR: [.9, -.3], legL: [-.1, .05], legR: [1.25, -.2], lean: -.12 }} />
  <path d="M640,1130 Q1250,320 2120,260" stroke="url(#trail)" strokeWidth={26} fill="none" strokeLinecap="round" strokeDasharray="2 46" />
  <Ball x={2140} y={250} r={46} rot={40} />
  <Baller who="opp2" outfit="gk" x={2060} y={1180} s={.78} t={2} expr="deadpan" eye={[-.4, -.8]} flip pose={{ armL: [-1.1, 1.7], armR: [1.1, -1.7] }} />
  <Baller who="coach" outfit="coat" x={2330} y={1200} s={.7} t={3} expr="pain" pose={{ armL: [-2.6, 1.2], armR: [2.6, -1.2] }} />
  {/* название — в безопасной зоне (y 508–931) */}
  <ellipse cx={1280} cy={760} rx={760} ry={190} fill="#070a20" opacity={.55} filter="url(#blur)" />
  <Neon x={1280} y={740} size={160} text={NAME} c="#ffd23f" glow="#ff4a9a" ls={6} />
  <Neon x={1280} y={850} size={62} text={TAG} c="#7ef0ff" glow="#3ad0ff" w={700} />
</svg></AbsoluteFill>);

export const Avatar: React.FC = () => (<AbsoluteFill style={{ background: '#0a0d24' }}><svg viewBox="0 0 1080 1080" width="100%" height="100%"><Defs />
  <radialGradient id="avBg" cx=".5" cy=".4" r=".7"><stop offset="0" stopColor="#3a2a8a" /><stop offset="1" stopColor="#0a0d24" /></radialGradient>
  <rect width={1080} height={1080} fill="url(#avBg)" />
  <circle cx={540} cy={540} r={500} fill="none" stroke="#ff4a9a" strokeWidth={14} opacity={.9} />
  <circle cx={540} cy={540} r={500} fill="none" stroke="#ff4a9a" strokeWidth={40} opacity={.3} filter="url(#blur)" />
  {/* ворота, мяч летит выше перекладины */}
  <g stroke="#fff" strokeWidth={18} fill="none" strokeLinecap="round"><path d="M250,700 L250,430 L830,430 L830,700" /></g>
  <g stroke="#fff" strokeWidth={3} opacity={.25}>{Array.from({ length: 11 }, (_, i) => <line key={i} x1={250 + i * 58} y1={430} x2={250 + i * 58} y2={700} />)}{Array.from({ length: 5 }, (_, i) => <line key={'h' + i} x1={250} y1={430 + i * 54} x2={830} y2={430 + i * 54} />)}</g>
  <path d="M330,640 Q520,330 760,250" stroke="url(#trail)" strokeWidth={22} fill="none" strokeLinecap="round" strokeDasharray="2 38" />
  <Ball x={780} y={240} r={70} rot={30} />
  <Neon x={540} y={850} size={140} text="НЕ ОЧЕНЬ" c="#ffd23f" glow="#ff4a9a" />
  <Neon x={390} y={360} size={96} text="ФК" c="#7ef0ff" glow="#3ad0ff" />
</svg></AbsoluteFill>);
