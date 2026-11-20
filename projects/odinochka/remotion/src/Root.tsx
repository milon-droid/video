import React from 'react';
import { Composition } from 'remotion';
import './fonts';
import { Test, TestHeads } from './Test';
import { TestCity } from './TestCity';
export const RemotionRoot: React.FC = () => <>
  <Composition id="Test" component={Test} durationInFrames={60} fps={30} width={1080} height={1920} />
  <Composition id="TestHeads" component={TestHeads} durationInFrames={60} fps={30} width={1080} height={1920} />
  <Composition id="TestCity" component={TestCity} durationInFrames={60} fps={30} width={1080} height={1920} />
  <Composition id="TestCityDay" component={TestCity} defaultProps={{ night: false }} durationInFrames={60} fps={30} width={1080} height={1920} />
</>;
