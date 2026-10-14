/** Miniatura de um cosmético (moldura, núcleo, aura ou título). */
import { memo, useId } from 'react';
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from 'react-native-svg';
import { getItem } from '../content/items';
import { colors } from './theme';

export const ItemGlyph = memo(function ItemGlyph({ itemId, size = 44, locked = false }: { itemId: string; size?: number; locked?: boolean }) {
  const item = getItem(itemId);
  const c = locked ? colors.ink500 : item.visual.color;
  const c2 = locked ? colors.ink600 : item.visual.color2 ?? item.visual.color;
  const gid = `g${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Defs>
        <RadialGradient id={gid} cx="40%" cy="38%" r="65%">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity={locked ? 0 : 0.85} />
          <Stop offset="0.4" stopColor={c} />
          <Stop offset="1" stopColor={c2} />
        </RadialGradient>
      </Defs>
      <Circle cx={24} cy={24} r={22} fill={colors.ink850} stroke={colors.lineSoft} />
      {item.slot === 'frame' ? (
        <>
          <Circle cx={24} cy={24} r={14} stroke={c} strokeWidth={3} fill="none" />
          {item.visual.frameStyle !== 'plain' ? <Circle cx={24} cy={24} r={10} stroke={c} strokeOpacity={0.6} strokeWidth={1.2} fill="none" /> : null}
        </>
      ) : null}
      {item.slot === 'core' ? <Circle cx={24} cy={24} r={10} fill={`url(#${gid})`} /> : null}
      {item.slot === 'aura' ? (
        <>
          <Circle cx={24} cy={24} r={16} fill={c} fillOpacity={0.25} />
          <Circle cx={24} cy={24} r={11} fill={c2} fillOpacity={0.35} />
          <Circle cx={24} cy={24} r={5} fill={c} />
        </>
      ) : null}
      {item.slot === 'title' ? (
        <Path d="M14 18 L34 18 L32 30 L24 34 L16 30 Z" fill={c} fillOpacity={0.22} stroke={c} strokeWidth={1.6} strokeLinejoin="round" />
      ) : null}
    </Svg>
  );
});
