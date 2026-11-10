// Переключатель «персонажи-картинки пользователя» для Baller/Sadie: NeClip кладёт сюда рендер Cut (без циклического импорта).
import React from 'react';
export type CutRender = ((p: any, kind: 'baller' | 'sadie') => React.ReactElement | null) | null;
export const CutCtx = React.createContext<CutRender>(null);
