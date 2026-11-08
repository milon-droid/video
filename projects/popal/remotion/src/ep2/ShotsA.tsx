// Планы серии 2, часть 1 (лес эльфиек → лагерь бесов). t — секунды от начала плана, T — от начала серии.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import MOUTH from '../data/ep2/mouth.json';
import MOUTH1 from '../data/mouth.json';
import { VO, SHOT, WORD_AT, VO_AT, CARD } from './timeline.mjs';
import { clamp, lerp, out, io, spr, win, shake, noise } from '../anim';
import { C, FONT } from '../theme';
import { Person, POSES, blendPose, Face } from '../chars/Person';
import { Imp, NetTrap, Cage } from '../chars/Cast2';
import { ElfForest, ImpCamp, Cauldron } from '../bg/Bg2';
import { Glow, Motes } from '../bg/Bg';
import { Frame, Cam, InfoStand, Tag, Onomato } from '../ui/Ui';
import { Puffs, Speed } from '../ep1/Shots';
import { walkPose } from '../ep1/Shots3';

export type P = { t: number; T: number };
const MM = { ...(MOUTH1 as Record<string, number[]>), ...(MOUTH as Record<string, number[]>) };
// рот говорящего по голосу (огибающая tools/mouth.py); p1 — реплика из серии 1
export const mouth = (who: string, T: number) => { const v = (VO as any[]).find(q => q.who === who && T >= q.t && T < q.t + q.d); if (!v) return 0;
  const arr = v.id === 'p1' ? (MOUTH1 as any).m1 : MM[v.id]; const i = Math.floor((T - v.t) * 30); return arr ? clamp((arr[i] ?? 0) * 1.1) : Math.abs(Math.sin((T - v.t) * 13)) * .6; };
export const dur = (id: string) => SHOT[id].b - SHOT[id].a;
export const at = (id: string, T: number) => T - SHOT[id].a;
export const html = (s: React.CSSProperties): React.CSSProperties => ({ position: 'absolute', fontFamily: FONT, whiteSpace: 'nowrap', ...s });
const W = (id: string, i: number, shot: string) => WORD_AT(id, i) - SHOT[shot].a;
// летящая сковорода (вращается)
export const FlyPan: React.FC<{ x: number; y: number; r: number; s?: number; glow?: number }> = ({ x, y, r, s = 1, glow = 1 }) => (<g transform={`translate(${x},${y}) rotate(${r}) scale(${s})`}>
  <Glow x={0} y={0} r={140} c="#ffd23f" o={.5 * glow} id={`fp${Math.round(x)}`} />
  <rect x={-12} y={60} width={24} height={110} rx={10} fill="#4a2f22" /><ellipse cx={0} cy={0} rx={92} ry={88} fill="#2a2c33" /><ellipse cx={0} cy={-2} rx={76} ry={72} fill="#3b3e48" />
  <ellipse cx={0} cy={0} rx={92} ry={88} fill="none" stroke="#ffd23f" strokeWidth={6} opacity={glow} /></g>);
// мечта-облачко
const Dream: React.FC<{ x: number; y: number; k: number; t: number; children: React.ReactNode }> = ({ x, y, k, t, children }) => k <= 0 ? null : (<g transform={`translate(${x},${y}) scale(${k})`}>
  {[[-170, 230, 22], [-120, 170, 34]].map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} fill="#fff" opacity={.95} />)}
  <path d="M-300,40 C-340,-80 -220,-170 -120,-150 C-80,-240 80,-250 130,-160 C240,-200 340,-90 300,20 C350,110 240,190 140,160 C80,230 -80,230 -130,160 C-240,190 -340,120 -300,40 Z" fill="#fff" opacity={.95} />
  <clipPath id="dreamC"><path d="M-290,40 C-330,-75 -215,-160 -118,-140 C-78,-228 78,-238 126,-150 C232,-190 330,-86 292,20 C340,106 236,180 138,150 C80,218 -78,218 -128,150 C-234,180 -330,114 -290,40 Z" /></clipPath>
  <g clipPath="url(#dreamC)"><rect x={-340} y={-260} width={680} height={500} fill="#ffe0f0" />{children}</g></g>);
const Hearts: React.FC<{ t: number; x: number; y: number; n?: number; k?: number }> = ({ t, x, y, n = 6, k = 1 }) => <g opacity={k}>{Array.from({ length: n }, (_, i) => { const q = (t * .7 + i / n) % 1;
  return <path key={i} transform={`translate(${x + Math.sin(i * 2.3 + t * 2) * 90},${y - q * 260}) scale(${.6 + q * .6})`} d="M0,12 C-30,-10 -24,-34 0,-22 C24,-34 30,-10 0,12 Z" fill="#ff4a8a" opacity={1 - q} />; })}</g>;

// ───────────── 1. Хук: Макс входит в лес эльфиек, в мечтах — три эльфийки ─────────────
export const Hook: React.FC<P> = ({ t, T }) => { const walk = clamp(t / 2.2), x = lerp(150, 430, io(walk)), ph = (x - 150) / 110 * Math.PI, moving = t < 2.2;
  const dk = spr(t, 1.3, { damping: 11 });
  return (<Frame bg="#7a5ad0"><Cam z={lerp(1.0, 1.08, io(win(t, 0, dur('hook'))))} fy={1100}><ElfForest t={T} />
    <Person x={x} y={1620 - (moving ? Math.abs(Math.sin(ph)) * 10 : 0)} s={1.05} t={T} pose={moving ? walkPose(ph) : blendPose(POSES.stand, POSES.armsUp, spr(t, 2.6, { damping: 9 }))} hold={moving ? 'pan' : null} expr={t > 1.2 ? 'happy' : 'neutral'} mouth={mouth('max', T)} blush={t > 1.2 ? .8 : 0} eye={[.3, -.4]} />
    <Hearts t={T} x={x} y={820} k={clamp((t - 1.2) * 2)} />
    <Dream x={720} y={560} k={dk} t={T}>{[['elf2', -170], ['lira', 0], ['elf3', 170]].map(([lk, dx], i) => <Person key={i} x={dx as number} y={330} s={.42} t={T + i} look={lk as any} expr="happy" pose={{ armL: [-.2, .2], armR: [2.6 + Math.sin(T * 6 + i) * .3, -.3] }} blush={.6} />)}</Dream>
  </Cam></Frame>); };

// ───────────── 2. Карточка героя ─────────────
const Bar: React.FC<{ t: number; t0: number; label: string; icon: string; val: number; max: number; col: string }> = ({ t, t0, label, icon, val, max, col }) => { const k = out(win(t, t0, t0 + .5));
  return (<div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 18, opacity: clamp((t - t0 + .3) * 3) }}>
    <div style={{ width: 230, fontSize: 36, fontWeight: 900, color: col }}>{icon} {label}</div>
    <div style={{ flex: 1, height: 34, borderRadius: 17, background: 'rgba(255,255,255,.12)', overflow: 'hidden', position: 'relative' }}>
      <div style={{ width: `${Math.max(4, val / max * 100) * k}%`, height: '100%', background: col, borderRadius: 17 }} />
      <div style={{ position: 'absolute', top: 0, left: `${((t * .7) % 1.4 - .2) * 100}%`, width: 60, height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.6), transparent)' }} /></div>
    <div style={{ width: 110, textAlign: 'right', fontSize: 50, fontWeight: 900 }}>{Math.round(val * k)}</div></div>); };
export const Card: React.FC<P> = ({ t, T }) => { const k = spr(t, 0, { damping: 13 }), id = 'b1', st = W(id, 6, 'card');
  return (<><Frame bg="#2a1f4a"><Cam z={1.15} fy={1000}><ElfForest t={T} dim={.55} /></Cam></Frame>
    <AbsoluteFill><div style={{ position: 'absolute', left: 80, width: 920, top: 330, transform: `translateY(${(1 - k) * 200}px) rotate(${(1 - k) * -6}deg)`, opacity: clamp(k * 1.5), borderRadius: 36, background: 'linear-gradient(160deg, #2c2a5a, #16142e)', border: `5px solid ${C.gold}`, boxShadow: `0 0 70px ${C.gold}66`, padding: '34px 44px 40px', fontFamily: FONT, color: C.text, boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', gap: 30, alignItems: 'center' }}>
        <div style={{ width: 230, height: 230, borderRadius: 24, background: 'radial-gradient(circle at 50% 40%, #6a5ad0, #2a2050)', border: `4px solid ${C.gold}`, overflow: 'hidden', flexShrink: 0 }}>
          <svg viewBox="-150 -170 300 300" width="230" height="230"><path d="M-100,-20 C-104,-100 -50,-128 0,-128 C50,-128 104,-100 100,-20 C98,40 70,84 24,98 Q0,104 -24,98 C-70,84 -98,40 -100,-20 Z" fill="#f6cfae" />
            <Face t={T} expr="smug" L={{ skin: '#f6cfae', skinSh: '#e3a989', hair: '#2f231f', iris: '#7a4a28' } as any} seed={7} />
            <path d="M-104,10 C-118,-70 -80,-128 -20,-132 C40,-138 104,-108 108,-30 L112,8 C96,-30 86,-44 70,-52 L76,-18 C58,-44 40,-58 18,-62 L22,-30 C4,-52 -16,-58 -34,-56 L-30,-26 C-48,-46 -62,-50 -76,-44 L-80,-6 C-90,-20 -96,-10 -104,10 Z" fill="#2f231f" /></svg></div>
        <div><div style={{ fontSize: 30, fontWeight: 800, letterSpacing: 4, color: C.gold }}>КАРТОЧКА ГЕРОЯ</div>
          <div style={{ fontSize: 96, fontWeight: 900, lineHeight: 1 }}>МАКС</div>
          <div style={{ fontSize: 38, fontWeight: 800, color: C.teal, marginTop: 6 }}>{CARD.cls} · ур. {CARD.lvl}</div></div></div>
      <div style={{ marginTop: 24 }}>
        <Bar t={t} t0={W(id, 1, 'card') - .1} label="СИЛА" icon="⚔" val={CARD.str} max={10} col="#ff8a5a" />
        <Bar t={t} t0={.5} label="ЗДОРОВЬЕ" icon="❤" val={CARD.hp} max={10} col="#ff4a6a" />
        <Bar t={t} t0={W(id, 3, 'card') - .1} label="АУРА" icon="✦" val={CARD.aura} max={1000} col={C.gold} /></div>
      <div style={{ marginTop: 26, fontSize: 38, fontWeight: 800 }}>Предмет: <span style={{ color: C.yellow }}>{CARD.item}</span></div>
      <div style={{ marginTop: 16, fontSize: 38, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 18 }}><span>Статус:</span>
        {t > st - .05 && <span style={{ display: 'inline-block', background: C.red, color: '#fff', padding: '6px 22px', borderRadius: 10, fontWeight: 900, fontSize: 44, transformOrigin: '0 50%', transform: `rotate(-4deg) scale(${lerp(1.8, 1, out(win(t, st - .05, st + .15)))})` }}>{CARD.status.toUpperCase()}</span>}</div>
    </div></AbsoluteFill></>); };

// ───────────── 3. Эльфийка в сети вниз головой ─────────────
const HANG = { armL: [-.7, .4] as [number, number], armR: [.6, -.5] as [number, number], legL: [-.12, .5] as [number, number], legR: [.14, -.3] as [number, number] };
export const Net: React.FC<P> = ({ t, T }) => { const z = lerp(1.0, 1.1, io(win(t, 0, dur('net')))), up = io(win(t, .2, 1.6)), sw = Math.sin(T * 1.6) * 3;
  return (<Frame bg="#7a5ad0"><Cam z={z} fy={lerp(1300, 900, up)} dy={lerp(-80, 140, up)}><ElfForest t={T} />
    <rect x={380} y={330} width={700} height={40} rx={20} fill="#5a3a2e" />
    <NetTrap x={720} y={360} t={T} w={190} h={560} />
    <g transform={`rotate(${sw} 720 360)`}><Person x={720} y={380} s={.78} t={T} look="lira" rot={180} hang pose={HANG} expr={mouth('lira', T) > 0 || t > VO_AT('d2') - SHOT.net.a ? 'determined' : 'deadpan'} mouth={mouth('lira', T)} bowBack /></g>
    <NetTrap x={720} y={360} t={T} w={190} h={560} front />
    <Person x={300} y={1640} s={.92} t={T} pose={POSES.stand} hold="pan" expr={t > 1 ? 'shock' : 'neutral'} eye={[.7, -.9]} headTilt={-6} />
  </Cam></Frame>); };

// ───────────── 4. Крупно Лира + ярлык ─────────────
export const Lira: React.FC<P> = ({ t, T }) => (<><Frame bg="#7a5ad0"><Cam z={lerp(1.75, 1.85, t / dur('lira'))} fx={720} fy={760} dy={-120}><ElfForest t={T} />
  <NetTrap x={720} y={360} t={T} w={190} h={560} />
  <g transform={`rotate(${Math.sin(T * 1.6) * 3} 720 360)`}><Person x={720} y={380} s={.78} t={T} look="lira" rot={180} hang pose={HANG} expr="deadpan" eye={[-.6, .4]} bowBack /></g>
  <NetTrap x={720} y={360} t={T} w={190} h={560} front /></Cam></Frame>
  <Tag t={t} t0={.3} x={70} y={1000} title="ЛИРА" sub="ЛУЧШАЯ ЛУЧНИЦА ЛЕСА" col="#7dffb0" w={520} /></>);

// ───────────── 5. Бросок: сковорода перерубает верёвку ─────────────
export const Throw: React.FC<P> = ({ t, T }) => { const rel = 1.0, hit = 1.45, k = clamp((t - rel) / (hit - rel)), cut = t > hit;
  const pose = t < .6 ? POSES.stand : t < rel ? blendPose(POSES.stand, POSES.throwBack, out(win(t, .6, rel))) : blendPose(POSES.throwBack, POSES.throwFwd, out(win(t, rel, rel + .15)));
  const px = lerp(420, 720, k), py = lerp(1000, 300, k) - Math.sin(k * Math.PI) * 120, s = shake(t, hit, 10, .3);
  return (<Frame bg="#7a5ad0"><Cam z={1.02} dx={s[0]} dy={s[1] + 60} fy={1100}><ElfForest t={T} />
    <rect x={380} y={330} width={700} height={40} rx={20} fill="#5a3a2e" />
    {!cut ? <NetTrap x={720} y={360} t={T} w={190} h={560} /> : <path d={`M720,370 L720,${300 - (t - hit) * 200}`} stroke="#8a6a3a" strokeWidth={14} />}
    <g transform={cut ? `translate(0,${Math.min(500, (t - hit) ** 2 * 2400)})` : undefined}>
      <Person x={720} y={380} s={.78} t={T} look="lira" rot={180} hang pose={HANG} expr={cut ? 'shock' : 'deadpan'} bowBack />
      <NetTrap x={720} y={360} t={T} w={190} h={560} front /></g>
    <Person x={330} y={1640} s={.92} t={T} pose={pose} hold={t < rel ? 'pan' : null} expr="determined" mouth={mouth('max', T)} eye={[.7, -.8]} />
    {t >= rel && t < hit + .05 && <FlyPan x={px} y={py} r={t * 1400} s={.6} />}
    {t >= hit && <FlyPan x={720 + (t - hit) * 700} y={300 + (t - hit) * 300} r={t * 1400} s={.6} />}
    <Onomato t={t} t0={hit} x={860} y={520} text="ДЗЫНЬ!" col={C.yellow} size={120} rot={8} />
  </Cam></Frame>); };

// ───────────── 6. Мягкая посадка: Лира падает на Макса ─────────────
export const SIT = { armL: [-.5, .9] as [number, number], armR: [.5, -.9] as [number, number], legL: [1.45, -1.4] as [number, number], legR: [1.35, -1.25] as [number, number], hip: 0 };
export const Land: React.FC<P> = ({ t, T }) => { const hit = .5, s = shake(t, hit, 20, .4), fall = clamp(t / hit);
  return (<Frame bg="#7a5ad0"><Cam z={lerp(1.0, 1.1, io(win(t, hit, dur('land'))))} dx={s[0]} dy={s[1] - 160} fy={1400}><ElfForest t={T} />
    <Person x={760} y={1600} s={.95} t={T} rot={-90} pose={{ armL: [-2.4, .3], armR: [2.6, -.4], legL: [-.1, .1], legR: [.1, -.1] }} expr={t < hit ? 'shock' : 'happy'} mouth={mouth('max', T)} blush={t > hit ? 1 : 0} shadow={false} />
    {t < hit ? <Person x={460} y={lerp(-200, 1250, fall * fall)} s={.9} t={T} look="lira" rot={lerp(180, 360, fall)} pose={POSES.fall} expr="shock" />
      : <Person x={430} y={1748} s={.9} t={T} look="lira" pose={SIT} expr="shock" blush={1} squash={Math.max(0, .5 - (t - hit)) * 1.5} shadow={false} />}
    <Puffs t={t} t0={hit} x={480} y={1600} n={10} col="#e8ffe8" spread={340} up={120} size={70} id="landP" />
    <Onomato t={t} t0={hit} x={760} y={760} text="БУХ!" col={C.yellow} size={150} rot={-8} />
  </Cam></Frame>); };

// ───────────── 7. Пощёчина ─────────────
export const Slap: React.FC<P> = ({ t, T }) => { const hit = .15, hx = t < hit ? lerp(1200, 640, out(clamp(t / hit))) : lerp(640, 1300, out(win(t, hit, hit + .25))), s = shake(t, hit, 26, .35);
  return (<Frame bg="#7a5ad0"><Cam z={1.0} dx={s[0]} dy={s[1]}><ElfForest t={T} dim={.1} />
    <Person x={540 + (t > hit ? -40 : 0)} y={2300} s={2.3} t={T} expr={t < hit ? 'happy' : 'pain'} slap={t > hit ? 1 : 0} headTilt={t > hit ? -14 + Math.sin((t - hit) * 30) * 4 * clamp(1 - (t - hit) * 2) : 0} blush={1} />
    <g transform={`translate(${hx},880) rotate(-80) scale(3.2)`}><ellipse cx={0} cy={12} rx={22} ry={24} fill="#f6d8c2" /><path d="M-16,22 Q-14,44 -8,44 Q-4,44 -4,26 M0,26 Q0,48 6,48 Q11,48 10,26 M10,24 Q14,40 18,38 Q22,36 18,20" fill="#f6d8c2" stroke="#e0b49a" strokeWidth={2} /><rect x={-26} y={-60} width={52} height={64} fill="#e8f0d8" /></g>
    <Onomato t={t} t0={hit} x={300} y={620} text="ШЛЁП!" col="#ff7a9a" size={150} rot={-10} />
  </Cam></Frame>); };

// ───────────── 8. Лира встаёт: «Человек. Ещё и с кухонной утварью» ─────────────
export const Stand: React.FC<P> = ({ t, T }) => (<Frame bg="#7a5ad0"><Cam z={lerp(1.04, 1.1, t / dur('stand'))} fy={1100} dy={-120}><ElfForest t={T} />
  <Person x={300} y={1720} s={.85} t={T} pose={POSES.lotus} hold="pan" expr="shock" slap={1} eye={[.8, -.9]} headTilt={-8} />
  <Person x={700} y={1640} s={1.1} t={T} look="lira" bowBack pose={blendPose(SIT as any, { armL: [-.55, 1.6], armR: [.55, -1.6], legL: [-.08, .04], legR: [.08, -.04] }, out(win(t, 0, .45)))} expr="smug" mouth={mouth('lira', T)} eye={[-.8, .5]} headTilt={6} flip />
</Cam></Frame>);

// ───────────── 9. «А уши настоящие?» — «Не трогай уши!» ─────────────
export const Ears: React.FC<P> = ({ t, T }) => { const reach = out(win(t, .5, 1.2)), flinch = out(win(t, W('g2', 0, 'ears') - .2, W('g2', 0, 'ears'))), sx = shake(t, W('g2', 0, 'ears'), 6, .3);
  return (<Frame bg="#7a5ad0"><Cam z={lerp(1.1, 1.18, t / dur('ears'))} fy={900} dy={-60 + sx[1]} dx={sx[0]}><ElfForest t={T} />
    <Person x={350} y={1640} s={1.1} t={T} slap={1} pose={{ ...POSES.stand, armR: [lerp(.12, 2.3, reach * (1 - flinch * .5)), lerp(-.15, -.5, reach)] }} expr={flinch > .5 ? 'shock' : 'happy'} mouth={mouth('max', T)} eye={[.8, -.3]} />
    <Person x={760 + flinch * 40} y={1640} s={1.08} t={T} look="lira" bowBack pose={{ ...POSES.stand, lean: -flinch * .14, armL: [-.12 + flinch * .8, .15 + flinch * 1.6] }} expr={flinch > .5 ? 'determined' : 'deadpan'} mouth={mouth('lira', T)} blush={flinch} flip eye={[-.8, 0]} />
  </Cam></Frame>); };

// ───────────── 10. «…Ладно. Ещё раз тронь» ─────────────
export const EarsYes: React.FC<P> = ({ t, T }) => { const sh = out(win(t, .3, 1.0));
  return (<Frame bg="#7a5ad0"><Cam z={lerp(1.9, 2.0, t / dur('earsYes'))} fx={720} fy={820} dy={-80}><ElfForest t={T} />
    <rect width={1080} height={1920} fill="#ff7ab0" opacity={sh * .15} />
    <Person x={720} y={1640} s={1.08} t={T} look="lira" bowBack expr={t < .9 ? 'deadpan' : 'smug'} mouth={mouth('lira', T)} blush={sh} eye={[lerp(-.8, .7, sh), lerp(0, .5, sh)]} headTilt={lerp(0, -10, sh)} flip />
    <Hearts t={T} x={600} y={760} n={5} k={clamp((t - 1.1) * 2)} />
  </Cam></Frame>); };

// ───────────── 11. Инфографика: закон №4 ─────────────
const EarArt: React.FC<{ t: number }> = ({ t }) => { const k = out(win(t, .3, 1.2)), wig = Math.sin(t * 14) * 4 * k;
  return (<g><path d={`M300,320 L${640 + wig},${40 - wig} L360,180 Z`} fill="#f6d8c2" stroke="#e0b49a" strokeWidth={6} strokeLinejoin="round" />
    <path d={`M330,280 L${560 + wig},${90 - wig} L370,200 Z`} fill="#ff8aa6" opacity={.4 + .5 * k} />
    {[0, 1, 2].map(i => { const q = (t * 1.2 + i / 3) % 1; return <path key={i} d={`M${560 + q * 120},${60 - q * 30} q20,-20 0,-40`} stroke="#ff4a8a" strokeWidth={6} fill="none" opacity={(1 - q) * k} />; })}
    <text x={150} y={250} fontSize={130} fontWeight={900} fill="#ff4a8a" textAnchor="middle" fontFamily={FONT} transform={`scale(${lerp(.6, 1, k)})`} style={{ transformOrigin: '150px 210px' }}>×100</text></g>); };
export const Lore4: React.FC<P> = ({ t }) => (<InfoStand t={t} num="ЗАКОН №4" title="Уши эльфиек" col="#ff7ab0" top={380} art={<EarArt t={t} />}
  lines={[{ t: W('h1', 2, 'lore4') - .2, icon: '♥', text: 'Чувствительность ×100' }, { t: W('h1', 6, 'lore4') - .2, icon: '⚠', text: 'Трогать — только с согласия', col: '#ffd23f', big: true }]} />);

// ───────────── 12. «Бесы утащили моих сестёр» ─────────────
const Flashback: React.FC<{ t: number; k: number }> = ({ t, k }) => k <= 0 ? null : (<g opacity={k} transform={`translate(540,560) scale(${lerp(.8, 1, k)})`}>
  <clipPath id="fbC"><ellipse cx={0} cy={0} rx={420} ry={300} /></clipPath>
  <g clipPath="url(#fbC)"><g transform="translate(-540,-1300)"><ImpCamp t={t} /></g><rect x={-500} y={-400} width={1000} height={800} fill="#8a2a1a" opacity={.35} />
    {[0, 1].map(i => { const x = -180 + i * 320 + ((t * 80) % 200); return <g key={i}><Cage x={x} y={230} s={.45} t={t}><Person x={0} y={-30} s={.5} t={t + i} look={i ? 'elf3' : 'elf2'} expr="sad" pose={POSES.armsUp} /></Cage>
      <Imp x={x - 140} y={240} s={.45} t={t + i} state="run" seed={i} /><Imp x={x + 140} y={240} s={.45} t={t + i + .4} state="run" seed={i + 2} /></g>; })}</g>
  <ellipse cx={0} cy={0} rx={420} ry={300} fill="none" stroke="#fff" strokeWidth={10} /></g>);
export const Sisters: React.FC<P> = ({ t, T }) => (<Frame bg="#5a4a90"><Cam z={lerp(1.02, 1.08, t / dur('sisters'))} fy={1100} dy={-60}><ElfForest t={T} dim={.35} />
  <Flashback t={T} k={out(win(t, .4, .9))} />
  <Person x={330} y={1680} s={1.0} t={T} look="lira" bowBack expr="sad" mouth={mouth('lira', T)} eye={[.6, .4]} />
  <Person x={760} y={1680} s={1.0} t={T} slap={1} hold="pan" expr={t > W('i2', 0, 'sisters') ? 'shock' : 'sad'} mouth={mouth('max', T)} eye={[-.7, 0]} flip />
</Cam></Frame>);

// ───────────── 13. Мотивация +1000% ─────────────
export const Motiv: React.FC<P> = ({ t, T }) => { const k = io(win(t, .3, 1.5)), boom = t > 1.5, s = shake(t, 1.5, 22, .5), pct = Math.round(lerp(0, 1000, k));
  return (<><Frame bg="#3a1408"><rect width={1080} height={1920} fill="#5a1a0a" /><Speed t={T} col="#ffb04a" o={.4 + k * .4} />
    <Cam z={lerp(1.0, 1.12, t / dur('motiv'))} dx={s[0]} dy={s[1]}>
      <Glow x={540} y={900} r={700} c="#ff8a2a" o={.5 + k * .4} id="motG" />
      <g transform="translate(540,920) scale(3.4)"><path d="M-100,-20 C-104,-100 -50,-128 0,-128 C50,-128 104,-100 100,-20 C98,40 70,84 24,98 Q0,104 -24,98 C-70,84 -98,40 -100,-20 Z" fill="#f6cfae" />
        <Face t={T} expr="determined" L={{ skin: '#f6cfae', skinSh: '#e3a989', hair: '#2f231f', iris: '#ff6a00' } as any} seed={9} eye={[0, 0]} noBlink />
        {[-1, 1].map(sd => <g key={sd}><ellipse cx={sd * 42} cy={10} rx={34} ry={40} fill="#ffb020" opacity={.25 + k * .5} /><path d={`M${sd * 42 - 14},-10 Q${sd * 42},${-60 - k * 40} ${sd * 42 + 14},-10 Z`} fill="#ffd23f" opacity={k} /></g>)}
        <path d="M-104,10 C-118,-70 -80,-128 -20,-132 C40,-138 104,-108 108,-30 L112,8 C96,-30 86,-44 70,-52 L76,-18 C58,-44 40,-58 18,-62 L22,-30 C4,-52 -16,-58 -34,-56 L-30,-26 C-48,-46 -62,-50 -76,-44 L-80,-6 C-90,-20 -96,-10 -104,10 Z" fill="#2f231f" /></g>
    </Cam></Frame>
    <AbsoluteFill><div style={html({ left: 90, width: 900, top: 1300, height: 70, borderRadius: 35, background: 'rgba(0,0,0,.5)', border: '5px solid #ffd23f', overflow: 'hidden' })}>
      <div style={{ width: `${Math.min(100, k * 140)}%`, height: '100%', background: 'linear-gradient(90deg, #ffd23f, #ff5a1a)' }} /></div>
      <div style={html({ left: 0, width: 1080, top: 1390, textAlign: 'center', fontSize: 44, fontWeight: 900, color: '#ffd23f', WebkitTextStroke: '8px #14121c', paintOrder: 'stroke fill' })}>МОТИВАЦИЯ</div>
      <div style={html({ left: 0, width: 1080, top: 1450, textAlign: 'center', fontSize: boom ? 150 : 120, fontWeight: 900, color: boom ? '#ff4a2a' : '#fff', WebkitTextStroke: '14px #14121c', paintOrder: 'stroke fill', transform: `scale(${boom ? lerp(1.4, 1, out(win(t, 1.5, 1.8))) : 1})` })}>+{pct}%</div></AbsoluteFill></>); };

// ───────────── 14. Лагерь бесов ─────────────
export const CampScene: React.FC<{ T: number; turn?: number; dance?: boolean; dent?: number; children?: React.ReactNode }> = ({ T, turn = 0, dance = true, dent = 0, children }) => (<g>
  <ImpCamp t={T} />
  <Cage x={180} y={1330} s={.8} t={T}><Person x={0} y={-30} s={.62} t={T} look="elf2" expr="sad" pose={POSES.armsUp} /></Cage>
  <Cage x={900} y={1330} s={.8} t={T}><Person x={0} y={-30} s={.62} t={T + 1} look="elf3" expr="scared" /></Cage>
  {[[380, 1420, 0], [700, 1430, 1], [470, 1500, 2], [640, 1520, 3]].map(([x, y, sd]) => <Imp key={sd} x={x} y={y} s={.62} t={T} seed={sd} state={turn > 0 ? 'turn' : dance ? 'dance' : 'stand'} flip={turn > 0 ? false : sd % 2 === 1} look={turn} />)}
  <Cauldron x={545} y={1440} s={.7} t={T} dent={dent} />
  {children}
</g>);
export const Camp: React.FC<P> = ({ t, T }) => { const beat = (t % .5) < .08;
  return (<><Frame bg="#120a24"><Cam z={lerp(1.0, 1.1, io(win(t, 0, dur('camp'))))} fy={1300} dy={-200 + (beat ? 4 : 0)}><CampScene T={T}>
    <g transform="translate(960,1600)"><Imp x={0} y={0} s={.55} t={T} seed={3} state="stand" flip /><ellipse cx={-90} cy={-110} rx={60} ry={24} fill="#d8c8a8" /><rect x={-150} y={-110} width={120} height={70} fill="#8a3a2a" />
      <path d={`M-40,-160 L${beat ? -80 : -60},-120`} stroke="#5a3a24" strokeWidth={10} strokeLinecap="round" /></g>
  </CampScene></Cam></Frame>
    {beat && <Onomato t={t} t0={t - .01} x={860} y={800} text="БУМ" col="#ff9a5a" size={80} rot={6} dur={.1} />}
    <Tag t={t} t0={1.4} x={70} y={480} title="БЕС" sub="ПООДИНОЧКЕ — СЛАБАК" col={C.red} w={460} /></>); };
