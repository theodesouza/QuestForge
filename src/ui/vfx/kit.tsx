/**
 * Peças compartilhadas pelos desenhos de núcleos e auras: gradiente de gema, brilho
 * radial, facetas e o anel de brilho das auras. Ficam aqui para que os arquivos de efeitos
 * (cores, auras e suas extensões) não dependam uns dos outros.
 */
import { useId, type ReactNode } from 'react';
import { Circle, Defs, G, Line, RadialGradient, Stop } from 'react-native-svg';
import type { ItemVisual } from '../../content/items';
import { C } from './engine';
import { polar } from './geometry';

export interface CoreProps {
  v: ItemVisual;
  /** Cor refletida (o Quartzo assume a cor da aura). */
  tint?: string | null;
}

export function useGid(prefix: string) {
  return `${prefix}${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
}

/** Gradiente de gema: brilho branco no alto à esquerda, cor, cor profunda. */
export function GemGradient({ id, c1, c2, hi = 0.95 }: { id: string; c1: string; c2: string; hi?: number }) {
  return (
    <RadialGradient id={id} cx="38%" cy="34%" r="70%">
      <Stop offset="0" stopColor="#FFFFFF" stopOpacity={hi} />
      <Stop offset="0.32" stopColor={c1} />
      <Stop offset="1" stopColor={c2} />
    </RadialGradient>
  );
}

export function Glow({ id, color, r, opacity = 0.45 }: { id: string; color: string; r: number; opacity?: number }) {
  return (
    <>
      <Defs>
        <RadialGradient id={id} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={color} stopOpacity={opacity} />
          <Stop offset="0.55" stopColor={color} stopOpacity={opacity * 0.35} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={C} cy={C} r={r} fill={`url(#${id})`} />
    </>
  );
}

/** Facetas: linhas do centro aos vértices de um polígono. */
export function Facets({ n, r, rotate = 0, color = '#FFFFFF', opacity = 0.35 }: { n: number; r: number; rotate?: number; color?: string; opacity?: number }) {
  return (
    <G stroke={color} strokeOpacity={opacity} strokeWidth={0.7}>
      {Array.from({ length: n }, (_, i) => {
        const p = polar(r, rotate + (360 / n) * i);
        return <Line key={i} x1={C} y1={C} x2={p.x} y2={p.y} />;
      })}
    </G>
  );
}


export interface AuraProps {
  v: ItemVisual;
}

export interface AuraFx {
  Back: (p: AuraProps) => ReactNode;
  Front?: (p: AuraProps) => ReactNode;
}

/** Anel de brilho radial entre r0 e r1. */
export function HaloRing({ id, color, color2, r0, r1, opacity }: { id: string; color: string; color2?: string; r0: number; r1: number; opacity: number }) {
  const k = r0 / r1;
  return (
    <>
      <Defs>
        <RadialGradient id={id} cx="50%" cy="50%" r="50%">
          <Stop offset={k * 0.92} stopColor={color} stopOpacity={0} />
          <Stop offset={k + (1 - k) * 0.25} stopColor={color} stopOpacity={opacity} />
          <Stop offset={k + (1 - k) * 0.6} stopColor={color2 ?? color} stopOpacity={opacity * 0.45} />
          <Stop offset="1" stopColor={color2 ?? color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={C} cy={C} r={r1} fill={`url(#${id})`} />
    </>
  );
}

