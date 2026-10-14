/**
 * Golem Proporcional — construído com blocos geométricos de basalto,
 * olhos de verdete e a runa ∝ (proporcionalidade) no peito.
 * A couraça racha visivelmente quando a fase 2 começa.
 */
import { memo } from 'react';
import Svg, { Circle, Defs, G, Path, Polygon, RadialGradient, Stop, Text as SvgText } from 'react-native-svg';
import { colors, fonts } from '../../ui/theme';

interface Props {
  size?: number;
  cracked?: boolean;
  defeated?: boolean;
}

export const GolemArt = memo(function GolemArt({ size = 220, cracked = false, defeated = false }: Props) {
  const stone = defeated ? '#3A3F57' : '#596084';
  const stoneDark = defeated ? '#2A2E42' : '#3B4163';
  const stoneLight = defeated ? '#4A5070' : '#7A82AA';
  const eye = defeated ? colors.ink500 : colors.verdigris;
  return (
    <Svg width={size} height={size} viewBox="0 0 240 240">
      <Defs>
        <RadialGradient id="golemGlow" cx="50%" cy="45%" r="50%">
          <Stop offset="0" stopColor={defeated ? colors.ink600 : colors.verdigris} stopOpacity={0.22} />
          <Stop offset="1" stopColor={colors.ink900} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={120} cy={112} r={112} fill="url(#golemGlow)" />
      {/* chão */}
      <Path d="M30 214 Q120 200 210 214" stroke={colors.line} strokeWidth={2} fill="none" />
      <G stroke={colors.ink900} strokeWidth={2} strokeLinejoin="round">
        {/* pernas */}
        <Polygon points="82,168 108,168 104,210 76,210" fill={stoneDark} />
        <Polygon points="132,168 158,168 164,210 136,210" fill={stoneDark} />
        {/* braços */}
        <Polygon points="48,92 74,84 80,150 54,164 38,140" fill={stone} />
        <Polygon points="192,92 166,84 160,150 186,164 202,140" fill={stone} />
        <Polygon points="34,150 60,158 58,182 30,178" fill={stoneLight} />
        <Polygon points="206,150 180,158 182,182 210,178" fill={stoneLight} />
        {/* tronco */}
        <Polygon points="74,78 166,78 172,150 154,176 86,176 68,150" fill={stone} />
        <Polygon points="86,92 154,92 150,146 90,146" fill={stoneDark} />
        {/* cabeça */}
        <Polygon points="92,34 148,34 156,70 140,82 100,82 84,70" fill={stoneLight} />
        <Polygon points="84,70 156,70 140,82 100,82" fill={stone} />
      </G>
      {/* olhos */}
      <G>
        <Polygon points="102,52 116,55 113,62 100,59" fill={eye} />
        <Polygon points="138,52 124,55 127,62 140,59" fill={eye} />
        {!defeated ? (
          <>
            <Circle cx={108} cy={57} r={9} fill={colors.verdigris} fillOpacity={0.18} />
            <Circle cx={132} cy={57} r={9} fill={colors.verdigris} fillOpacity={0.18} />
          </>
        ) : null}
      </G>
      {/* runa ∝ no peito */}
      <SvgText
        x={120}
        y={131}
        fill={defeated ? colors.ink500 : colors.brass}
        fontSize={36}
        fontFamily={fonts.display}
        textAnchor="middle"
      >
        ∝
      </SvgText>
      {/* rachaduras da couraça */}
      {cracked || defeated ? (
        <G stroke={defeated ? colors.ink600 : colors.ember} strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M96 80 L104 100 L96 112 L104 128" />
          <Path d="M150 84 L140 102 L150 118" />
          <Path d="M64 104 L72 118 L64 130" />
          <Path d="M176 110 L168 122 L176 136" />
          <Path d="M112 34 L118 46 L112 52" />
        </G>
      ) : null}
    </Svg>
  );
});
