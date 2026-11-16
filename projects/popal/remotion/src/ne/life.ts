// «Живость» перекладных персонажей: кадр знает позы того же персонажа 1/15 и 2/15 с назад (их записывают
// невидимые проходы сцены в Ne.tsx) → инерция рук и головы, растяжение в прыжке, плавная смена мимики.
import React from 'react';
export type Life = { mode: 'rec' | 'play'; k: number; store: Record<string, any[]>; n: Record<string, number> };
export const LifeCtx = React.createContext<Life | null>(null);
export const LAG = 1 / 15;
