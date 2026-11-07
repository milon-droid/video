// «ПОПАЛ», серия 1: планы по Sequence, поверх — табло, субтитры, зерно, звук.
import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import '../fonts';
import { SHOTS, CAPS, NAME, DUR, statsAt, HUD_FROM, HUD_HIDE } from './timeline.mjs';
import * as S from './Shots';
import { Captions, Hud, Post, BottomShade } from '../ui/Ui';

const MAP: Record<string, React.FC<{ t: number; T: number }>> = {
  hook: S.Hook, freeze: S.Freeze, title: S.Title, courier: S.Courier, visor: S.Visor, pov: S.Pov, void: S.VoidShot, hall: S.HallShot, board: S.Board, lore1: S.Lore1,
  window: S.WindowShot, catsAsk: S.CatsAsk, catsNo: S.CatsNo, system: S.SystemShot, monday: S.Monday, lore2: S.Lore2, lever: S.Lever, reels: S.Reels, pan: S.PanShot,
  swipe: S.Swipe, fall: S.Fall, splash: S.Splash, slime: S.SlimeShot, goose: S.GooseShot, lore3: S.Lore3, chase: S.Chase, corner: S.Corner, throw: S.Throw,
  levelup: S.LevelUp, groin: S.Groin, signal: S.Signal, throne: S.ThroneShot, succ: S.SuccShot, eyes: S.Eyes, signpost: S.Signpost, choice: S.ChoiceShot, end: S.End,
};
const LORE = ['lore1', 'lore2', 'lore3'];
const ShotAt: React.FC<{ id: string; a: number }> = ({ id, a }) => { const f = useCurrentFrame(), { fps } = useVideoConfig(); const Comp = MAP[id]; return Comp ? <Comp t={f / fps} T={a + f / fps} /> : null; };
const Overlay: React.FC = () => { const f = useCurrentFrame(), { fps } = useVideoConfig(), T = f / fps;
  const cur = (SHOTS as any[]).find(s => T >= s.a && T < s.b) || SHOTS[SHOTS.length - 1];
  const hud = T >= HUD_FROM && !(HUD_HIDE as number[][]).some(([a, b]) => T >= a && T < b) && !(cur.id === 'lore2' && T > cur.a + 5.55 && T < cur.a + 6.75 && false);
  const lore = LORE.includes(cur.id), plain = !lore && cur.id !== 'choice' && cur.id !== 'end';
  return (<AbsoluteFill>{plain && <BottomShade />}{hud && <Hud t={T} st={statsAt(T)} t0={HUD_FROM} />}
    {cur.id !== 'end' && <Captions t={T} caps={CAPS as any} names={NAME} top={lore ? 1440 : cur.id === 'choice' ? 1500 : 1290} />}<Post t={T} /></AbsoluteFill>); };
export const Ep1: React.FC<{ audio?: boolean }> = ({ audio = true }) => { const { fps, width } = useVideoConfig();
  return (<AbsoluteFill style={{ background: '#000', overflow: 'hidden' }}><div style={{ position: 'absolute', width: 1080, height: 1920, transform: `scale(${width / 1080})`, transformOrigin: '0 0', overflow: 'hidden' }}>
    {(SHOTS as any[]).map(s => <Sequence key={s.id} name={s.id} from={Math.round(s.a * fps)} durationInFrames={Math.max(1, Math.round((s.b - s.a) * fps))}><ShotAt id={s.id} a={Math.round(s.a * fps) / fps} /></Sequence>)}
    <Overlay /></div>{audio && <Audio src={staticFile('ep1-mix.wav')} />}</AbsoluteFill>); };
export const EP1_FRAMES = Math.round(DUR * 30);
