import React from 'react';
import { Composition } from 'remotion';
import './fonts';
import { Ten1, Ten720 } from './ten/Ep1';
import { TOTAL } from './ten/timeline';
export const RemotionRoot: React.FC = () => <>
  <Composition id="Ten1" component={Ten1} durationInFrames={Math.round(TOTAL * 30)} fps={30} width={1080} height={1920} />
  <Composition id="Ten720" component={Ten720} durationInFrames={Math.round(TOTAL * 30)} fps={30} width={720} height={1280} />
</>;
