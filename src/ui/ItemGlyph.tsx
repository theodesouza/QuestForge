/**
 * Miniatura de um cosmético. Núcleos e auras mostram uma prévia estática do efeito
 * real (o mesmo desenho do astrolábio, parado); a borda cresce com a raridade —
 * dá para reconhecer um lendário de longe, sem ler o nome.
 *
 * Tudo num SVG só, do tamanho da miniatura: o efeito é desenhado no modo plano do motor
 * e recortado em círculo (a coleção tem dezenas de miniaturas).
 */
import { memo, useId } from 'react';
import { View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import Svg, { Circle, ClipPath, Defs, G, Path, Polygon, RadialGradient, Rect, Stop } from 'react-native-svg';
import { RARITY_TIER, getItem, type ItemDef, type ItemSlot } from '../content/items';
import { colors, rarityColor } from './theme';
import { AuraBack, AuraFront } from './vfx/auras';
import { BodyFx } from './vfx/bodies';
import { CoreFx } from './vfx/cores';
import { C, FxProvider, STAGE } from './vfx/engine';
import { IgnitionFx } from './vfx/ignitions';
import { LensFx } from './vfx/lenses';
import { OrbiterFx } from './vfx/orbiters';
import { RingFx, Segments } from './vfx/rings';
import { TrailFx } from './vfx/trails';
import { frameParts, isCustomFrame } from './vfx/frames';
import { star } from './vfx/geometry';
import { SceneArt } from './vfx/scenes';

/** Janela do palco (240 × 240) mostrada na miniatura: [x, y, lado]. */
const CORE_WINDOW = [C - 48, C - 48, 96] as const;
// Aura: enquadramento de "horizonte" — o topo do disco aparece embaixo e a aura se
// ergue acima dele, ampliada (um anel fino ao redor do disco inteiro sumiria).
const AURA_SIDE = STAGE / 2.8;
const AURA_WINDOW = [C - AURA_SIDE / 2, -0.3 * AURA_SIDE, AURA_SIDE] as const;

/** Peças do Áster: lado da janela do palco (centrada) que cada espaço mostra na miniatura. */
const ASTER_WINDOW: Partial<Record<ItemSlot, number>> = { core: 90, frame: 214, aura: 196, orbiter: 156, trail: 168, lens: 172, ignition: 224 };
const THUMB_R = 30;

/** O corpo neutro em volta do qual a peça é mostrada (anel, campo, satélite…). */
function ThumbBody() {
  return <Circle cx={C} cy={C} r={THUMB_R - 4} fill={colors.ink700} stroke={colors.ink500} strokeWidth={2} />;
}

function IgnitionThumb({ item }: { item: ItemDef }) {
  const clock = useSharedValue(0.42);
  return (
    <>
      <ThumbBody />
      <IgnitionFx v={item.visual} clock={clock} tone={item.visual.color} r={THUMB_R} />
    </>
  );
}

/** A peça do Áster sozinha, parada, em volta de um corpo neutro: o mesmo desenho que vai para o palco. */
function AsterThumb({ item }: { item: ItemDef }) {
  const v = item.visual;
  const tier = RARITY_TIER[item.rarity];
  switch (item.slot) {
    case 'core':
      return <BodyFx v={v} r={THUMB_R + 4} tint={null} tier={tier} />;
    case 'frame':
      return (
        <>
          <RingFx item={item} half="back" r={THUMB_R} />
          <ThumbBody />
          <RingFx item={item} half="front" r={THUMB_R} />
        </>
      );
    case 'aura':
      return (
        <>
          <AuraBack v={v} r={THUMB_R} />
          <ThumbBody />
          <AuraFront v={v} r={THUMB_R} />
        </>
      );
    case 'orbiter':
      return (
        <>
          <OrbiterFx v={v} half="back" r={THUMB_R} tier={tier} />
          <ThumbBody />
          <OrbiterFx v={v} half="front" r={THUMB_R} tier={tier} />
        </>
      );
    case 'trail':
      return (
        <>
          <TrailFx v={v} half="back" r={THUMB_R} tier={tier} />
          <ThumbBody />
          <TrailFx v={v} half="front" r={THUMB_R} tier={tier} />
        </>
      );
    case 'lens':
      return (
        <>
          <LensFx v={v} r={THUMB_R} tier={tier} />
          <ThumbBody />
        </>
      );
    case 'ignition':
      return <IgnitionThumb item={item} />;
    default:
      return null;
  }
}

export const ItemGlyph = memo(function ItemGlyph({ itemId, size = 44, locked = false }: { itemId: string; size?: number; locked?: boolean }) {
  const item = getItem(itemId);
  const tier = RARITY_TIER[item.rarity];
  const ring = locked ? colors.ink600 : rarityColor[item.rarity];
  const c = locked ? colors.ink500 : item.visual.color;
  const c2 = locked ? colors.ink600 : item.visual.color2 ?? item.visual.color;
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const gid = `g${uid}`;
  const clip = `k${uid}`;
  // Peças do Áster têm desenho próprio em todo espaço (menos título e ambiente, que seguem o caminho de sempre).
  const asterSide = 'get' in item ? ASTER_WINDOW[item.slot] : undefined;
  const live = !asterSide && !locked && (item.slot === 'core' || item.slot === 'aura');
  const win = item.slot === 'core' ? CORE_WINDOW : AURA_WINDOW;
  const custom = !asterSide && item.slot === 'frame' && isCustomFrame(item.visual.frameStyle) ? frameParts(item.visual.frameStyle, { color: c, color2: c2, r: 12.5, w: 2.6, cx: 24, cy: 24, compact: true }) : null;
  const k = 48 / win[2];

  return (
    <View style={{ width: size, height: size }} pointerEvents="none">
      <Svg width={size} height={size} viewBox="0 0 48 48">
        <Defs>
          <RadialGradient id={gid} cx="40%" cy="38%" r="65%">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity={locked ? 0 : 0.85} />
            <Stop offset="0.4" stopColor={c} />
            <Stop offset="1" stopColor={c2} />
          </RadialGradient>
          <ClipPath id={clip}>
            <Circle cx={24} cy={24} r={24} />
          </ClipPath>
        </Defs>
        <Circle cx={24} cy={24} r={22} fill={colors.ink850} />
        {custom ? (
          <>
            {custom.fixed}
            {custom.moving}
          </>
        ) : item.slot === 'frame' && !asterSide ? (
          <>
            {item.visual.frameStyle === 'segmented' ? (
              <Segments color={c} color2={c2} r={14} width={3} cx={24} cy={24} />
            ) : (
              <Circle cx={24} cy={24} r={14} stroke={c} strokeWidth={3} fill="none" />
            )}
            {item.visual.frameStyle !== 'plain' ? <Circle cx={24} cy={24} r={10} stroke={c} strokeOpacity={0.6} strokeWidth={1.2} fill="none" /> : null}
          </>
        ) : null}
        {item.slot === 'scene' ? (
          <G clipPath={`url(#${clip})`}>
            <G transform={`scale(${(48 / 300).toFixed(4)})`}>
              <SceneArt v={item.visual} uid={uid} />
              {locked ? <Rect x={0} y={0} width={300} height={300} fill={colors.ink850} fillOpacity={0.78} /> : null}
            </G>
          </G>
        ) : null}
        {item.slot === 'title' ? (
          <Path d="M14 18 L34 18 L32 30 L24 34 L16 30 Z" fill={c} fillOpacity={0.22} stroke={c} strokeWidth={1.6} strokeLinejoin="round" />
        ) : null}
        {locked && !asterSide && item.slot === 'core' ? <Circle cx={24} cy={24} r={10} fill={`url(#${gid})`} /> : null}
        {locked && !asterSide && item.slot === 'aura' ? <Circle cx={24} cy={24} r={15} stroke={c} strokeWidth={4} strokeOpacity={0.5} fill="none" /> : null}

        {live ? (
          <G clipPath={`url(#${clip})`}>
            <G transform={`scale(${k.toFixed(4)}) translate(${(-win[0]).toFixed(2)} ${(-win[1]).toFixed(2)})`}>
              <FxProvider value={{ animate: false, flat: true, density: item.slot === 'core' ? 0.6 : 0.8, px: size / k }}>
                {item.slot === 'core' ? (
                  <CoreFx v={item.visual} />
                ) : (
                  <>
                    <AuraBack v={item.visual} />
                    <Circle cx={C} cy={C} r={84} fill={colors.ink800} stroke={colors.ink500} strokeWidth={2.5} />
                    <AuraFront v={item.visual} />
                  </>
                )}
              </FxProvider>
            </G>
          </G>
        ) : null}

        {asterSide ? (
          // Bloqueada, a peça aparece apagada: é a vitrine do que vem pela frente.
          <G clipPath={`url(#${clip})`} opacity={locked ? 0.3 : 1}>
            <G transform={`scale(${(48 / asterSide).toFixed(4)}) translate(${(asterSide / 2 - C).toFixed(2)} ${(asterSide / 2 - C).toFixed(2)})`}>
              <FxProvider value={{ animate: false, flat: true, density: 0.7, px: (size * STAGE) / asterSide, poster: 0.42 }}>
                <AsterThumb item={item} />
              </FxProvider>
            </G>
          </G>
        ) : null}

        {/* Borda de raridade: simples → dupla → com gemas → estrela dourada */}
        <Circle cx={24} cy={24} r={22.3} stroke={ring} strokeOpacity={tier === 0 ? 0.35 : 0.9} strokeWidth={tier >= 3 ? 1.8 : 1.2} fill="none" />
        {tier >= 2 ? <Circle cx={24} cy={24} r={20.2} stroke={ring} strokeOpacity={0.45} strokeWidth={0.7} fill="none" /> : null}
        {tier >= 3
          ? [0, 90, 180, 270].map((deg) => {
              const a = ((deg - 90) * Math.PI) / 180;
              const x = 24 + 22.3 * Math.cos(a);
              const y = 24 + 22.3 * Math.sin(a);
              return <Polygon key={deg} points={`${x},${y - 2.4} ${x + 1.6},${y} ${x},${y + 2.4} ${x - 1.6},${y}`} fill={ring} />;
            })
          : null}
        {tier >= 4 ? (
          <Polygon
            points={star(5, 5.2, 2.2).replace(/([\d.]+),([\d.]+)/g, (_, x, y) => `${((Number(x) - 120) + 24).toFixed(2)},${((Number(y) - 120) + 3.2).toFixed(2)}`)}
            fill={ring}
            stroke={colors.ink900}
            strokeWidth={0.6}
          />
        ) : null}
      </Svg>
    </View>
  );
});
