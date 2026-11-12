/**
 * Ignições (espaço `ignition`): como o Áster se acende ao aparecer, ao trocar de peça e ao toque.
 * Cada uma é uma sequência de atos movidos por um relógio de uma passada (0→1).
 */
import type { ReactNode } from 'react';
import type { SharedValue } from 'react-native-reanimated';
import { Circle } from 'react-native-svg';
import type { ItemVisual } from '../../content/items';
import { C } from './engine';
import { ActLayer } from './space';

export interface IgnitionProps {
  v: ItemVisual | null;
  clock: SharedValue<number>;
  /** Cor do Áster (núcleo ou campo). */
  tone: string;
  r: number;
}
export type IgnitionRender = (p: IgnitionProps & { v: ItemVisual }) => ReactNode;

export const IGNITIONS: Record<string, IgnitionRender> = {};

export function IgnitionFx(p: IgnitionProps) {
  const Render = p.v?.fx ? IGNITIONS[p.v.fx] : undefined;
  return Render && p.v ? <Render {...p} v={p.v} /> : <Spark {...p} />;
}

/** Sem peça de ignição: um clarão em anel (o gesto de sempre ao trocar de equipamento). */
function Spark({ clock, tone }: IgnitionProps) {
  return (
    <>
      <ActLayer clock={clock} act={{ t0: 0, t1: 0.75, from: 60, to: 112, drawnAt: 100, peak: 0.6 }}>
        <Circle cx={C} cy={C} r={100} stroke="#FFFFFF" strokeWidth={2.4} fill="none" />
      </ActLayer>
      <ActLayer clock={clock} act={{ t0: 0.05, t1: 0.85, from: 52, to: 104, drawnAt: 92, peak: 0.5 }}>
        <Circle cx={C} cy={C} r={92} stroke={tone} strokeWidth={5} strokeOpacity={0.7} fill="none" />
      </ActLayer>
    </>
  );
}
