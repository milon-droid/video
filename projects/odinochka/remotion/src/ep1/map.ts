import React from 'react';
import { SP } from './common';
import { Intro } from './Intro';
import { S01, S02, S03, S04 } from './ShotsA';
import { S05, S06, S07, S08, S09, S10, S11, S12, S13 } from './ShotsB';
import { S14 } from './ShotsC';
import { S15, S16 } from './ShotsT';
import * as F from './ShotsF';
export const MAP: Record<string, React.FC<SP>> = { s01: S01, s02: S02, s03: S03, s04i: Intro, s04: S04, s05: S05, s06: S06, s07: S07, s08: S08, s09: S09, s10: S10, s11: S11, s12: S12,
  s13: S13, s14: S14, s15: S15, s16: S16,
  ...Object.fromEntries(Object.entries(F).filter(([k]) => /^F\d+[a-z]?$/.test(k)).map(([k, v]) => [k.toLowerCase(), v as React.FC<SP>])) };
