import React from 'react';
import { SP } from './common';
import { Intro } from './Intro';
import { S01, S02, S03, S04 } from './ShotsA';
import { S05, S06, S07, S08, S09, S10, S11, S12 } from './ShotsB';
import * as P from './ShotsP';
export const MAP: Record<string, React.FC<SP>> = { s01: S01, s02: S02, s03: S03, s04i: Intro, s04: S04, s05: S05, s06: S06, s07: S07, s08: S08, s09: S09, s10: S10, s11: S11, s12: S12,
  ...Object.fromEntries(Object.entries(P).filter(([k]) => /^P\d+$/.test(k)).map(([k, v]) => [k.toLowerCase(), v as React.FC<SP>])) };
