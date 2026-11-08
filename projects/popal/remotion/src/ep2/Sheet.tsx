import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Person, POSES } from '../chars/Person';
import { ElfForest } from '../bg/Bg2';
export const Sheet: React.FC = () => (<AbsoluteFill style={{ background: '#888' }}><svg viewBox="0 0 1080 1920" width="1080" height="1920">
  <ElfForest t={1} />
  <Person x={300} y={2100} s={1.6} t={1} look="lira" bowBack expr="smug" />
  <Person x={800} y={2100} s={1.6} t={1} look="elf2" expr="happy" blush={1} />
</svg></AbsoluteFill>);
