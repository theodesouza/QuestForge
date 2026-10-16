/**
 * Miniatura de um cosmético. Núcleos e auras mostram uma prévia estática do efeito
 * real (o mesmo desenho do astrolábio, parado); a borda cresce com a raridade —
 * dá para reconhecer um lendário de longe, sem ler o nome.
 */
import { memo, useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Path, Polygon, RadialGradient, Stop } from 'react-native-svg';
import { RARITY_TIER, getItem } from '../content/items';
import { colors, rarityColor } from './theme';
import { AuraBack, AuraFront } from './vfx/auras';
import { CoreFx } from './vfx/cores';
import { FxProvider } from './vfx/engine';
import { star } from './vfx/geometry';

export const ItemGlyph = memo(function ItemGlyph({ itemId, size = 44, locked = false }: { itemId: string; size?: number; locked?: boolean }) {
  const item = getItem(itemId);
  const tier = RARITY_TIER[item.rarity];
  const ring = locked ? colors.ink600 : rarityColor[item.rarity];
  const c = locked ? colors.ink500 : item.visual.color;
  const c2 = locked ? colors.ink600 : item.visual.color2 ?? item.visual.color;
  const gid = `g${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const live = !locked && (item.slot === 'core' || item.slot === 'aura');

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 48 48" style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id={gid} cx="40%" cy="38%" r="65%">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity={locked ? 0 : 0.85} />
            <Stop offset="0.4" stopColor={c} />
            <Stop offset="1" stopColor={c2} />
          </RadialGradient>
        </Defs>
        <Circle cx={24} cy={24} r={22} fill={colors.ink850} />
        {item.slot === 'frame' ? (
          <>
            <Circle cx={24} cy={24} r={14} stroke={c} strokeWidth={3} fill="none" />
            {item.visual.frameStyle !== 'plain' ? <Circle cx={24} cy={24} r={10} stroke={c} strokeOpacity={0.6} strokeWidth={1.2} fill="none" /> : null}
          </>
        ) : null}
        {item.slot === 'title' ? (
          <Path d="M14 18 L34 18 L32 30 L24 34 L16 30 Z" fill={c} fillOpacity={0.22} stroke={c} strokeWidth={1.6} strokeLinejoin="round" />
        ) : null}
        {locked && item.slot === 'core' ? <Circle cx={24} cy={24} r={10} fill={`url(#${gid})`} /> : null}
        {locked && item.slot === 'aura' ? <Circle cx={24} cy={24} r={15} stroke={c} strokeWidth={4} strokeOpacity={0.5} fill="none" /> : null}
      </Svg>

      {live ? (
        <View style={[StyleSheet.absoluteFill, { borderRadius: size / 2, overflow: 'hidden' }]} pointerEvents="none">
          {item.slot === 'core' ? <CorePreview itemId={itemId} size={size} /> : <AuraPreview itemId={itemId} size={size} />}
        </View>
      ) : null}

      {/* Borda de raridade: simples → dupla → com gemas → estrela dourada */}
      <Svg width={size} height={size} viewBox="0 0 48 48" style={StyleSheet.absoluteFill} pointerEvents="none">
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

/** Núcleo: o palco é ampliado para que a região do núcleo (raio ~48) preencha a miniatura. */
function CorePreview({ itemId, size }: { itemId: string; size: number }) {
  const px = size * 2.5;
  const off = (px - size) / 2;
  return (
    <FxProvider value={{ animate: false, density: 0.6, px }}>
      <View style={{ position: 'absolute', left: -off, top: -off, width: px, height: px }}>
        <CoreFx v={getItem(itemId).visual} />
      </View>
    </FxProvider>
  );
}

/**
 * Aura: enquadramento de "horizonte" — o topo do disco aparece embaixo e a aura se
 * ergue acima dele, ampliada. Numa miniatura, um anel fino ao redor do disco
 * inteiro ficaria quase invisível.
 */
function AuraPreview({ itemId, size }: { itemId: string; size: number }) {
  const v = getItem(itemId).visual;
  // Zoom alto: a borda do disco vira um "horizonte" baixo e a aura ocupa o céu acima.
  const px = size * 2.8;
  const left = -(px - size) / 2;
  const top = size * 0.3;
  return (
    <FxProvider value={{ animate: false, density: 0.8, px }}>
      <View style={{ position: 'absolute', left, top, width: px, height: px }}>
        <AuraBack v={v} />
        <Svg width={px} height={px} viewBox="0 0 240 240" style={StyleSheet.absoluteFill}>
          <Circle cx={120} cy={120} r={84} fill={colors.ink800} stroke={colors.ink500} strokeWidth={2.5} />
        </Svg>
        <AuraFront v={v} />
      </View>
    </FxProvider>
  );
}
