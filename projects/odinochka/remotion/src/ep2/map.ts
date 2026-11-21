import React from 'react';
import { SP } from '../ep1/common';
import * as A from './ShotsA';
import * as B from './ShotsB';
import * as C from './ShotsC';
import * as D from './ShotsD';
export const MAP: Record<string, React.FC<SP>> = Object.fromEntries(Object.entries({ ...A, ...B, ...C, ...D }).filter(([k]) => /^[A-H]\d$/.test(k)).map(([k, v]) => [k.toLowerCase(), v as React.FC<SP>]));
