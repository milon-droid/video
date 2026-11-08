// «ПОПАЛ», серия 1 v4: планы по Sequence, поверх — табло, субтитры, зерно, звук.
import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import '../fonts';
import { SHOTS, CAPS, NAME, DUR, statsAt, HUD_FROM, HUD_HIDE } from './timeline.mjs';
import * as S from './Shots';
import * as S2 from './Shots2';
import * as S3 from './Shots3';
import { Captions, Hud, Post, BottomShade } from '../ui/Ui';

const MAP: Record<string, React.FC<{ t: number; T: number }>> = {
  room: S2.Room, fridge: S2.FridgeShot, street: S2.StreetHit, freeze: S2.FreezeTitle, courier: S.Courier, visor: S.Visor, soul: S3.Soul, hall: S3.HallGold,
  window: S.WindowShot, catsAsk: S.CatsAsk, catsNo: S.CatsNo, system: S.SystemShot, lore2: S3.Lore2Simple, slot: S2.SlotShot, odds: S2.Odds, item: S2.Item, dodep: S2.Dodep, nah: S2.Nah,
  fall: S.Fall, splash: S.Splash, slime: S.SlimeShot, gooseUp: S2.GooseUp, chase: S.Chase, lore3: S2.Mob, corner: S.Corner, throw: S.Throw,
  levelup: S.LevelUp, groin: S.Groin, throne: S3.ThroneSeated, succ: S.SuccShot, eyes: S2.EyesBull, walk: S3.Walk, forkAsk: S3.ForkAsk, split: S3.Split,
};
const LORE = ['lore2', 'odds', 'lore3'];
const ShotAt: React.FC<{ id: string; a: number }> = ({ id, a }) => { const f = useCurrentFrame(), { fps } = useVideoConfig(); const Comp = MAP[id]; return Comp ? <Comp t={f / fps} T={a + f / fps} /> : null; };
const Overlay: React.FC = () => { const f = useCurrentFrame(), { fps } = useVideoConfig(), T = f / fps;
  const cur = (SHOTS as any[]).find(s => T >= s.a && T < s.b) || SHOTS[SHOTS.length - 1];
  const hud = T >= HUD_FROM && !(HUD_HIDE as number[][]).some(([a, b]) => T >= a && T < b);
  const lore = LORE.includes(cur.id);
  return (<AbsoluteFill>{!lore && <BottomShade />}{hud && <Hud t={T} st={statsAt(T)} t0={HUD_FROM} />}
    <Captions t={T} caps={CAPS as any} names={NAME} top={lore ? 1440 : cur.id === 'forkAsk' ? 1330 : 1290} /><Post t={T} /></AbsoluteFill>); };
export const Ep1: React.FC<{ audio?: boolean }> = ({ audio = true }) => { const { fps, width } = useVideoConfig();
  return (<AbsoluteFill style={{ background: '#000', overflow: 'hidden' }}><div style={{ position: 'absolute', width: 1080, height: 1920, transform: `scale(${width / 1080})`, transformOrigin: '0 0', overflow: 'hidden' }}>
    {(SHOTS as any[]).map(s => <Sequence key={s.id} name={s.id} from={Math.round(s.a * fps)} durationInFrames={Math.max(1, Math.round((s.b - s.a) * fps))}><ShotAt id={s.id} a={Math.round(s.a * fps) / fps} /></Sequence>)}
    <Overlay /></div>{audio && <Audio src={staticFile('ep1-mix.wav')} />}</AbsoluteFill>); };
export const EP1_FRAMES = Math.round(DUR * 30);
