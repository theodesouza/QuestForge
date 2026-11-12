/**
 * O corpo do Áster (espaço `core`).
 *
 *  - Núcleos antigos (gemas e relíquias dos chefões): o desenho de sempre, agora suspenso numa redoma
 *    de vidro — a esfera dá volume a qualquer um deles.
 *  - Corpos novos (`BODIES`): estrelas, mundos, singularidades, nebulosas e máquinas, cada um montado
 *    sobre a esfera com superfície que gira.
 */
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { G, Path } from 'react-native-svg';
import type { ItemVisual } from '../../content/items';
import { CoreFx } from './cores';
import { C, FxExtent, Spin, useFx } from './engine';
import { arc } from './geometry';
import { Orb } from './space';
import { BODIES } from './bodies2';

export interface BodyProps {
  v: ItemVisual;
  /** Raio do corpo (cresce com o nível). */
  r: number;
  tier: number;
  /** Cor refletida (o Quartzo assume a cor do campo). */
  tint?: string | null;
}

export type BodyRender = (p: BodyProps) => ReactNode;

export function BodyFx(p: BodyProps) {
  const Render = p.v.fx ? BODIES[p.v.fx] : undefined;
  return Render ? <Render {...p} /> : <Relic {...p} />;
}

/** Núcleo antigo dentro da redoma. O desenho foi feito para um raio de ~27: escala com o corpo. */
function Relic({ v, r, tint }: BodyProps) {
  const { flat } = useFx();
  const k = (r / 30) * 1.06;
  const glow = tint ?? v.color;
  return (
    <Orb r={r} lit="#FFFFFF" mid={glow} dark={v.color2 ?? v.color} glass gloss={0.62} limb={0.5} atmosphere={glow} atmosphereSize={0.42}>
      {/* Energia presa na redoma: dois fios de luz girando devagar por trás da relíquia. */}
      <FxExtent r={r}>
        <Spin period={21000} opacity={0.75}>
          <Path d={arc(r * 0.82, 20, 110)} stroke={glow} strokeOpacity={0.5} strokeWidth={1.1} fill="none" strokeLinecap="round" />
          <Path d={arc(r * 0.7, 200, 262)} stroke="#FFFFFF" strokeOpacity={0.38} strokeWidth={0.8} fill="none" strokeLinecap="round" />
          <Path d={arc(r * 0.9, 250, 300)} stroke={glow} strokeOpacity={0.3} strokeWidth={0.7} fill="none" strokeLinecap="round" />
        </Spin>
      </FxExtent>
      {flat ? (
        <G transform={`translate(${C} ${C}) scale(${k}) translate(${-C} ${-C})`}>
          <CoreFx v={v} tint={tint} />
        </G>
      ) : (
        <Scaled k={k}>
          <CoreFx v={v} tint={tint} />
        </Scaled>
      )}
    </Orb>
  );
}

function Scaled({ k, children }: { k: number; children: ReactNode }) {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { transform: [{ scale: k }] }]}>
      {children}
    </View>
  );
}
