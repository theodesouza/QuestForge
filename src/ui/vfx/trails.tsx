/** Rastros (espaço `trail`): matéria em movimento em volta do Áster. */
import type { DepthProps, DepthRender } from './orbiters';

export const TRAILS: Record<string, DepthRender> = {};

export function TrailFx(p: DepthProps) {
  const Render = p.v.fx ? TRAILS[p.v.fx] : undefined;
  return Render ? <Render {...p} /> : null;
}
