// «ПОПАЛ», серия 3 «Железная воля»: планы по Sequence, поверх — табло, субтитры, зерно, звук (без озвучки).
import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import '../fonts';
import { SHOTS, CAPS, NAME, DUR, statsAt, HUD_FROM, HUD_HIDE } from './timeline.mjs';
import { PopalPreload } from '../chars/Cast2';
import * as A from './ShotsA';
import * as B from './ShotsB';
import * as C from './ShotsC';
import { Captions, Hud, Post, BottomShade } from '../ui/Ui';

const MAP: Record<string, React.FC<{ t: number; T: number }>> = {
  hook: A.Hook, refuse: A.Refuse, charm: A.Charm, iron: A.Iron, slimeLove: A.SlimeLove, stone: A.Stone, arrow: A.Arrow, bonk: A.Bonk,
  mercy: B.Mercy, overtime: B.Overtime, egg: B.Egg, tears: B.Tears, map: B.MapShot, levelup: B.LevelUp, cloak: B.Cloak,
  throne: C.Throne3, castle: C.Castle, knight: C.Knight, grab: C.Grab, dilemma: C.Dilemma, ask: C.Ask, split: C.Split,
};
const NO_SHADE = ['split'];
const ShotAt: React.FC<{ id: string; a: number }> = ({ id, a }) => { const f = useCurrentFrame(), { fps } = useVideoConfig(); const Comp = MAP[id]; return Comp ? <Comp t={f / fps} T={a + f / fps} /> : null; };
const Overlay: React.FC = () => { const f = useCurrentFrame(), { fps } = useVideoConfig(), T = f / fps;
  const cur = (SHOTS as any[]).find(s => T >= s.a && T < s.b) || SHOTS[SHOTS.length - 1];
  const hud = T >= HUD_FROM && !(HUD_HIDE as number[][]).some(([a, b]) => T >= a && T < b);
  return (<AbsoluteFill>{!NO_SHADE.includes(cur.id) && <BottomShade />}{hud && <Hud t={T} st={statsAt(T)} t0={HUD_FROM} />}
    <Captions t={T} caps={CAPS as any} names={NAME} top={cur.id === 'ask' ? 1580 : 1290} /><Post t={T} /></AbsoluteFill>); };
export const Ep3: React.FC<{ audio?: boolean }> = ({ audio = true }) => { const { fps, width } = useVideoConfig();
  return (<AbsoluteFill style={{ background: '#000', overflow: 'hidden' }}><div style={{ position: 'absolute', width: 1080, height: 1920, transform: `scale(${width / 1080})`, transformOrigin: '0 0', overflow: 'hidden' }}>
    {(SHOTS as any[]).map(s => <Sequence key={s.id} name={s.id} from={Math.round(s.a * fps)} durationInFrames={Math.max(1, Math.round((s.b - s.a) * fps))}><ShotAt id={s.id} a={Math.round(s.a * fps) / fps} /></Sequence>)}
    <Overlay /><PopalPreload /></div>{audio && <Audio src={staticFile('ep3-mix.wav')} />}</AbsoluteFill>); };
export const EP3_FRAMES = Math.round(DUR * 30);
