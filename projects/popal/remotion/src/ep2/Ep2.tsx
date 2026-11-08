// «ПОПАЛ», серия 2 «Не трогай уши»: планы по Sequence, поверх — табло, субтитры, зерно, звук.
import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import '../fonts';
import { SHOTS, CAPS, NAME, DUR, statsAt, HUD_FROM, HUD_HIDE } from './timeline.mjs';
import * as A from './ShotsA';
import * as B from './ShotsB';
import { Captions, Hud, Post, BottomShade } from '../ui/Ui';

const MAP: Record<string, React.FC<{ t: number; T: number }>> = {
  hook: A.Hook, card: A.Card, net: A.Net, lira: A.Lira, throw: A.Throw, land: A.Land, slap: A.Slap, stand: A.Stand, ears: A.Ears, earsYes: A.EarsYes, lore4: A.Lore4,
  sisters: A.Sisters, motiv: A.Motiv, camp: A.Camp, plan: B.Plan, oops: B.Oops, backs: B.Backs, fight: B.Fight, boss: B.Boss, rico: B.Rico, levelup: B.LevelUp,
  freed: B.Freed, jealous: B.Jealous, throne: B.ThroneEp2, campfire: B.Campfire2, offer: B.Offer, trap: B.Trap, ask: B.Ask, split: B.Split,
};
const NO_SHADE = ['lore4', 'card', 'split'];
const ShotAt: React.FC<{ id: string; a: number }> = ({ id, a }) => { const f = useCurrentFrame(), { fps } = useVideoConfig(); const Comp = MAP[id]; return Comp ? <Comp t={f / fps} T={a + f / fps} /> : null; };
const Overlay: React.FC = () => { const f = useCurrentFrame(), { fps } = useVideoConfig(), T = f / fps;
  const cur = (SHOTS as any[]).find(s => T >= s.a && T < s.b) || SHOTS[SHOTS.length - 1];
  const hud = T >= HUD_FROM && !(HUD_HIDE as number[][]).some(([a, b]) => T >= a && T < b);
  return (<AbsoluteFill>{!NO_SHADE.includes(cur.id) && <BottomShade />}{hud && <Hud t={T} st={statsAt(T)} t0={HUD_FROM} />}
    <Captions t={T} caps={CAPS as any} names={NAME} top={cur.id === 'lore4' ? 1500 : cur.id === 'card' ? 1640 : cur.id === 'motiv' ? 1680 : cur.id === 'ask' ? 1580 : 1290} /><Post t={T} /></AbsoluteFill>); };
export const Ep2: React.FC<{ audio?: boolean }> = ({ audio = true }) => { const { fps, width } = useVideoConfig();
  return (<AbsoluteFill style={{ background: '#000', overflow: 'hidden' }}><div style={{ position: 'absolute', width: 1080, height: 1920, transform: `scale(${width / 1080})`, transformOrigin: '0 0', overflow: 'hidden' }}>
    {(SHOTS as any[]).map(s => <Sequence key={s.id} name={s.id} from={Math.round(s.a * fps)} durationInFrames={Math.max(1, Math.round((s.b - s.a) * fps))}><ShotAt id={s.id} a={Math.round(s.a * fps) / fps} /></Sequence>)}
    <Overlay /></div>{audio && <Audio src={staticFile('ep2-mix.wav')} />}</AbsoluteFill>); };
export const EP2_FRAMES = Math.round(DUR * 30);
