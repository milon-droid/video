// «Didn't Want To Anyway» (projects/ne-ochen): сборка планов по timeline.json, субтитры, бирки, звук public/ne-mix.wav.
import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { clamp } from '../anim';
import { FONT } from '../theme';
import { NameTag } from '../stars/Clip';
import { ShotCouch, ShotTv } from './Movie';
import { ShotBench, ShotBox, ShotCorridor, ShotDoor, ShotFans, ShotGrab, ShotHandshake, ShotHearts, ShotMiss, ShotRun, ShotToss, ShotWave } from './Stadium';
import { PhoneUI, ShotFlash, ShotFrozen, ShotLounge, Sub } from './Final';
import TL from './timeline.json';
import MOUTH from './mouth.json';

type Shot = { id: string; a: number; b: number; vo?: string; at?: number; voDur?: number; text?: string };
const SHOTS = TL.shots as Shot[];
export const NE_FRAMES = Math.round(TL.total * 30);
export const NE_AT = Object.fromEntries(SHOTS.map(s => [s.id, s.a]));
// рот по голосу: только реплика в кадре (b2 — рукопожатие и флешбэк)
const mouth = (s: Shot, t: number) => { if (!s.vo || s.vo !== 'b2') return 0; const M = (MOUTH as any)[s.vo], i = Math.floor((t - (s.at ?? 0)) * M.fps); return i >= 0 && i < M.v.length ? M.v[i] * .7 : 0; };

const Scene: React.FC<{ s: Shot; t: number }> = ({ s, t }) => { const m = mouth(s, t);
  switch (s.id) {
    case 'tv': return <ShotTv t={t} />;
    case 'couch': return <ShotCouch t={t} crush={1.0} />;
    case 'grab': return <ShotGrab t={t} />;
    case 'toss': return <ShotToss t={t} toss={1.0} />;
    case 'bench': return <ShotBench t={t} up={.45} />;
    case 'shake': return <ShotHandshake t={t} m={m} />;
    case 'run': return <ShotRun t={t} />;
    case 'box': return <ShotBox t={t} />;
    case 'hearts': return <ShotHearts t={t} />;
    case 'miss': return <ShotMiss t={t} />;
    case 'fans': return <ShotFans t={t} />;
    case 'wave': return <ShotWave t={t} />;
    case 'corridor': return <ShotCorridor t={t} swap={1.05} />;
    case 'door': return <ShotDoor t={t} />;
    case 'lounge': return <ShotLounge t={t} reveal={1.0} />;
    case 'frozen': return <ShotFrozen t={t} />;
    case 'flash': return <ShotFlash t={t} m={m} cut={1.1} />;
    case 'hide': return <ShotFrozen t={t} hide={.25} />;
    default: return <rect width={1080} height={1920} fill="#000" />;
  } };

export const NeClip: React.FC<{ audio?: boolean }> = ({ audio = true }) => {
  const f = useCurrentFrame(), { fps, width } = useVideoConfig(), T = f / fps;
  const s = SHOTS.find(x => T >= x.a && T < x.b) ?? SHOTS[SHOTS.length - 1], t = T - s.a;
  const prevFlash = s.id === 'flash' || s.id === 'hide' ? clamp(1 - t / .25) : 0;
  return (<AbsoluteFill style={{ background: '#000', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', width: 1080, height: 1920, transform: `scale(${width / 1080})`, transformOrigin: '0 0', overflow: 'hidden' }}>
      {s.id === 'phone' ? <PhoneUI t={t} msg="Wanna see a real superhero? Bernabéu, Saturday." reply="No, thanks." tSend={2.3} tReply={4.15} />
        : <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
          <Scene s={s} t={t} />
          {s.id !== 'black' && <><defs><radialGradient id="neVig" cx=".5" cy=".45" r=".78"><stop offset=".62" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".5" /></radialGradient></defs>
            <rect width={1080} height={1920} fill="url(#neVig)" /></>}
        </svg>}
      {s.id === 'tv' && <NameTag t={t} t0={.5} x={60} y={210} name="SADIE SINK" sub="on TV" col="#ff5a7a" />}
      {s.id === 'couch' && <NameTag t={t} t0={.2} x={60} y={210} name="VINÍCIUS JR." sub="at home" col="#ffd23f" />}
      {s.id === 'shake' && <NameTag t={t} t0={.25} x={60} y={210} name="YAN DIOMANDE" sub="teammate" col="#5af0c8" />}
      {s.id === 'black' && <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, opacity: clamp((t - .55) / .3) }}>
        <div style={{ color: '#fff', fontSize: 92, fontWeight: 900, textAlign: 'center', lineHeight: 1.1, padding: '0 80px' }}>Didn't want to<br />anyway.</div>
        <div style={{ color: '#8a8a96', fontSize: 34, fontWeight: 700, marginTop: 40 }}>Parody. All events are fictional.</div></div>}
      {s.vo && s.text && <div style={{ position: 'absolute', inset: 0, transform: s.id === 'phone' ? 'translateY(-1020px)' : undefined }}><Sub t={t} t0={s.at ?? 0} dur={s.voDur ?? 1} text={s.text} /></div>}
      {s.id === 'flash' && t < 1.1 && <div style={{ position: 'absolute', top: 200, width: 1080, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 44, color: '#f4e4c0', letterSpacing: 6, opacity: .85 }}>EARLIER…</div>}
      <AbsoluteFill style={{ background: '#fff', opacity: prevFlash * .8, pointerEvents: 'none' }} />
    </div>{audio && <Audio src={staticFile('ne-mix.wav')} />}</AbsoluteFill>); };
