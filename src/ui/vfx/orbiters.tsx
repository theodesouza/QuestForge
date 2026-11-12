/** Satélites (espaço `orbiter`): corpos e criaturas que giram em torno do Áster, com profundidade. */
import type { ReactNode } from 'react';
import type { ItemVisual } from '../../content/items';

export interface DepthProps {
  v: ItemVisual;
  half: 'back' | 'front';
  r: number;
  tier: number;
}
export type DepthRender = (p: DepthProps) => ReactNode;

export const ORBITERS: Record<string, DepthRender> = {};

export function OrbiterFx(p: DepthProps) {
  const Render = p.v.fx ? ORBITERS[p.v.fx] : undefined;
  return Render ? <Render {...p} /> : null;
}
