// превью сцены 1 (ТВ → диван), без звука
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { ShotCouch, ShotTv } from './Movie';
export const NeTv: React.FC = () => { const t = useCurrentFrame() / 30;
  return (<AbsoluteFill style={{ background: '#000', overflow: 'hidden' }}><div style={{ position: 'absolute', width: 1080, height: 1920, transform: 'scale(0.6667)', transformOrigin: '0 0' }}>
    <svg viewBox="0 0 1080 1920" width={1080} height={1920}>{t < 3.8 ? <ShotTv t={t} /> : <ShotCouch t={t - 3.8} />}</svg></div></AbsoluteFill>); };
