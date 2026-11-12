/** Gravidade (espaço `lens`): como o Áster dobra o espaço ao redor. Desenhado atrás de tudo. */
import type { ReactNode } from 'react';
import type { ItemVisual } from '../../content/items';

export interface LensProps {
  v: ItemVisual;
  r: number;
  tier: number;
}
export type LensRender = (p: LensProps) => ReactNode;

export const LENSES: Record<string, LensRender> = {};

export function LensFx(p: LensProps) {
  const Render = p.v.fx ? LENSES[p.v.fx] : undefined;
  return Render ? <Render {...p} /> : null;
}
