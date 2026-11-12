/**
 * Anéis do Áster (espaço `frame`).
 *
 *  - Anéis de contenção (as antigas Molduras): ficam de frente, em volta do corpo, com o desenho de
 *    sempre (`frameStyle`) e um acabamento metálico (luz no alto à esquerda, sombra embaixo à direita).
 *  - Anéis em órbita (novos, `visual.fx`): discos e estruturas num plano inclinado, que passam por
 *    trás e pela frente do corpo. Cada um tem `Back` e `Front`.
 */
import type { ReactNode } from 'react';
import { Circle, Ellipse, G, Path, Polygon } from 'react-native-svg';
import { RARITY_TIER, type ItemDef, type ItemVisual } from '../../content/items';
import { Breathe, C, FxExtent, Layer, Spin } from './engine';
import { frameParts, isCustomFrame, type FrameParts } from './frames';
import { arc, ngon, polar } from './geometry';
import { ORBITAL_RINGS } from './rings2';

/** Raio dos anéis de contenção. */
export const HALO_R = 84;

export interface RingProps {
  v: ItemVisual;
  half: 'back' | 'front';
  /** Raio do corpo (os discos se ajustam a ele). */
  r: number;
  tier: number;
}

export interface RingFxDef {
  Back: (p: RingProps) => ReactNode;
  Front: (p: RingProps) => ReactNode;
}

export function RingFx({ item, half, r }: { item: ItemDef; half: 'back' | 'front'; r: number }) {
  const tier = RARITY_TIER[item.rarity];
  const fx = item.visual.fx ? ORBITAL_RINGS[item.visual.fx] : undefined;
  if (fx) return half === 'back' ? <fx.Back v={item.visual} half={half} r={r} tier={tier} /> : <fx.Front v={item.visual} half={half} r={r} tier={tier} />;
  // Anel de contenção: não cruza o corpo, então é desenhado inteiro na passada de trás.
  return half === 'back' ? <Halo v={item.visual} tier={tier} /> : null;
}

// ————————————————————————————————————————————————————— anéis de contenção (molduras antigas)

function Halo({ v, tier }: { v: ItemVisual; tier: number }) {
  const studColor = v.color2 ?? v.color;
  const custom = isCustomFrame(v.frameStyle) ? frameParts(v.frameStyle, { color: v.color, color2: v.color2 ?? v.color, r: HALO_R, w: 3.2 }) : null;
  return (
    <>
      <FxExtent r={100}>
        <Layer>
          {/* Corpo do anel: uma faixa escura por baixo dá espessura ao traço. */}
          <Circle cx={C} cy={C} r={HALO_R} stroke="#060A16" strokeOpacity={0.55} strokeWidth={6.5} fill="none" />
          {v.frameStyle === 'segmented' ? (
            <Segments color={v.color} color2={v.color2 ?? v.color} r={HALO_R} width={3.4} />
          ) : custom ? (
            custom.fixed
          ) : (
            <Circle cx={C} cy={C} r={HALO_R} stroke={v.color} strokeWidth={3} fill="none" />
          )}
          {v.frameStyle === 'double' || v.frameStyle === 'armillary' ? (
            <Circle cx={C} cy={C} r={HALO_R - 5} stroke={v.color} strokeOpacity={0.55} strokeWidth={1.2} fill="none" />
          ) : null}
          {v.frameStyle === 'armillary' && tier < 3 ? <Armillary color={studColor} /> : null}
          {/* Acabamento metálico: reflexo e sombra opostos (o anel deixa de parecer um traço chapado). */}
          <Path d={arc(HALO_R + 1.1, 286, 352)} stroke="#FFFFFF" strokeOpacity={0.55} strokeWidth={1} fill="none" strokeLinecap="round" />
          <Path d={arc(HALO_R - 1.2, 108, 172)} stroke="#000000" strokeOpacity={0.45} strokeWidth={1.4} fill="none" strokeLinecap="round" />
        </Layer>
      </FxExtent>
      <FxExtent r={94}>
        {v.frameStyle === 'notched' ? (
          tier >= 2 ? (
            <Breathe period={2800} opacity={[0.55, 1]}>
              <Studs color={studColor} />
            </Breathe>
          ) : (
            <Layer>
              <Studs color={studColor} />
            </Layer>
          )
        ) : null}
        {v.frameStyle === 'segmented' ? (
          <Breathe period={3200} opacity={[0.55, 1]}>
            <G fill="#FFFFFF">
              {[0, 180, 300].map((deg) => {
                const p = polar(HALO_R, deg);
                return <Polygon key={deg} points={`${p.x},${p.y - 4.4} ${p.x + 3},${p.y} ${p.x},${p.y + 4.4} ${p.x - 3},${p.y}`} />;
              })}
            </G>
          </Breathe>
        ) : null}
        {v.frameStyle === 'armillary' && tier >= 3 ? (
          <>
            <Spin period={30000}>
              <Ellipse cx={C} cy={C} rx={90} ry={30} stroke={studColor} strokeOpacity={0.75} strokeWidth={1.3} fill="none" transform={`rotate(-24 ${C} ${C})`} />
            </Spin>
            <Spin period={44000} reverse>
              <Ellipse cx={C} cy={C} rx={90} ry={30} stroke={v.color} strokeOpacity={0.7} strokeWidth={1.3} fill="none" transform={`rotate(24 ${C} ${C})`} />
            </Spin>
          </>
        ) : null}
      </FxExtent>
      {custom?.moving ? (
        <FxExtent r={104}>
          <FrameMotion parts={custom} />
        </FxExtent>
      ) : null}
    </>
  );
}

/** A parte que se mexe das molduras de estilo próprio (frames.tsx): gira ou respira. */
function FrameMotion({ parts }: { parts: FrameParts }) {
  const m = parts.motion;
  if (!m) return <Layer>{parts.moving}</Layer>;
  return m.kind === 'spin' ? (
    <Spin period={m.period} reverse={m.reverse}>
      {parts.moving}
    </Spin>
  ) : (
    <Breathe period={m.period} opacity={m.opacity}>
      {parts.moving}
    </Breathe>
  );
}

/** Anel em três arcos de 1/2, 1/3 e 1/6 da volta (com pequenas folgas): Leão, Cabra e Serpente. */
export const SEGMENT_SILVER = '#C9D1F0';
export const SEGMENTS = [
  { from: 3, to: 177 },
  { from: 183, to: 297 },
  { from: 303, to: 357 },
] as const;

export function Segments({ color, color2, r, width, cx = C, cy = C }: { color: string; color2: string; r: number; width: number; cx?: number; cy?: number }) {
  const tints = [color2, SEGMENT_SILVER, color];
  return (
    <G fill="none" strokeLinecap="round" strokeWidth={width}>
      {SEGMENTS.map((s, i) => (
        <Path key={i} d={arc(r, s.from, s.to, cx, cy)} stroke={tints[i]} />
      ))}
    </G>
  );
}

function Studs({ color }: { color: string }) {
  return (
    <G>
      {Array.from({ length: 8 }, (_, i) => {
        const a = polar(HALO_R, i * 45 + 22.5);
        return (
          <G key={i}>
            <Circle cx={a.x} cy={a.y} r={5.5} fill={color} fillOpacity={0.18} />
            <Polygon points={ngon(4, 3.6, 0).replace(/([\d.]+),([\d.]+)/g, (_, x, y) => `${(Number(x) - C + a.x).toFixed(2)},${(Number(y) - C + a.y).toFixed(2)}`)} fill={color} />
          </G>
        );
      })}
    </G>
  );
}

function Armillary({ color }: { color: string }) {
  return (
    <G stroke={color} strokeOpacity={0.7} strokeWidth={1.2} fill="none">
      <Ellipse cx={C} cy={C} rx={90} ry={30} transform={`rotate(-24 ${C} ${C})`} />
      <Ellipse cx={C} cy={C} rx={90} ry={30} transform={`rotate(24 ${C} ${C})`} />
    </G>
  );
}
