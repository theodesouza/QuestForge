/**
 * Mercador Composto — figura encapuzada atrás do balcão, com uma balança
 * de pratos e o Cofre de Juros ao lado. O cofre racha na fase 2.
 */
import { memo } from 'react';
import Svg, { Circle, Defs, Ellipse, G, Line, Path, Rect, RadialGradient, Stop, Text as SvgText } from 'react-native-svg';
import { colors, fonts } from '../../ui/theme';

interface Props {
  size?: number;
  cracked?: boolean;
  defeated?: boolean;
}

export const MercadorArt = memo(function MercadorArt({ size = 220, cracked = false, defeated = false }: Props) {
  const amber = defeated ? '#6B5A45' : '#FF9F43';
  const gold = defeated ? '#7A6A52' : '#FFD36B';
  const robe = defeated ? '#2E2A3A' : '#4A2F5C';
  const robeDark = defeated ? '#23202D' : '#331F42';
  const wood = defeated ? '#3A3240' : '#5C3B2E';
  const eye = defeated ? colors.ink500 : amber;
  return (
    <Svg width={size} height={size} viewBox="0 0 240 240">
      <Defs>
        <RadialGradient id="mercGlow" cx="50%" cy="42%" r="50%">
          <Stop offset="0" stopColor={defeated ? colors.ink600 : amber} stopOpacity={0.24} />
          <Stop offset="1" stopColor={colors.ink900} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={120} cy={108} r={110} fill="url(#mercGlow)" />

      {/* balança */}
      <G stroke={gold} strokeWidth={2} fill="none" strokeLinecap="round">
        <Line x1={120} y1={22} x2={120} y2={48} />
        <Line x1={70} y1={30} x2={170} y2={30} />
        <Line x1={70} y1={30} x2={60} y2={58} />
        <Line x1={70} y1={30} x2={80} y2={58} />
        <Line x1={170} y1={30} x2={160} y2={50} />
        <Line x1={170} y1={30} x2={180} y2={50} />
      </G>
      <Path d="M56 58 Q70 68 84 58 Z" fill={gold} />
      <Path d="M156 50 Q170 60 184 50 Z" fill={gold} />
      <Circle cx={120} cy={20} r={4} fill={gold} />

      {/* manto e capuz */}
      <G stroke={colors.ink900} strokeWidth={2} strokeLinejoin="round">
        <Path d="M78 196 L92 104 Q120 88 148 104 L162 196 Z" fill={robe} />
        <Path d="M90 108 Q120 40 150 108 Q120 96 90 108 Z" fill={robeDark} />
        <Path d="M96 104 Q120 56 144 104 Q120 92 96 104 Z" fill={robe} />
      </G>
      {/* rosto na sombra */}
      <Ellipse cx={120} cy={92} rx={17} ry={14} fill="#120C1A" />
      <G>
        <Path d="M108 90 L116 88 L115 93 L108 94 Z" fill={eye} />
        <Path d="M132 90 L124 88 L125 93 L132 94 Z" fill={eye} />
        {!defeated ? (
          <>
            <Circle cx={112} cy={91} r={6} fill={amber} fillOpacity={0.2} />
            <Circle cx={128} cy={91} r={6} fill={amber} fillOpacity={0.2} />
          </>
        ) : null}
      </G>
      {/* símbolo de juros compostos no peito */}
      <SvgText x={120} y={150} fill={defeated ? colors.ink500 : gold} fontSize={20} fontFamily={fonts.display} textAnchor="middle">
        %ⁿ
      </SvgText>

      {/* balcão com pilhas de moedas */}
      <Rect x={30} y={180} width={180} height={30} rx={4} fill={wood} stroke={colors.ink900} strokeWidth={2} />
      <Line x1={30} y1={188} x2={210} y2={188} stroke={colors.ink900} strokeOpacity={0.5} />
      {[48, 60, 72].map((x, i) => (
        <G key={x}>
          {Array.from({ length: 3 + i }, (_, k) => (
            <Ellipse key={k} cx={x} cy={178 - k * 5} rx={7} ry={3} fill={gold} stroke={colors.ink900} strokeWidth={1} />
          ))}
        </G>
      ))}

      {/* Cofre de Juros */}
      <G stroke={colors.ink900} strokeWidth={2}>
        <Rect x={160} y={132} width={44} height={48} rx={6} fill={defeated ? '#3A3F57' : '#596084'} />
        <Circle cx={182} cy={156} r={10} fill={defeated ? '#2A2E42' : '#3B4163'} />
      </G>
      <Line x1={182} y1={148} x2={182} y2={156} stroke={gold} strokeWidth={2} strokeLinecap="round" />
      {cracked || defeated ? (
        <G stroke={defeated ? colors.ink600 : colors.ember} strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M166 136 L174 150 L168 160 L176 176" />
          <Path d="M198 140 L190 152 L198 166" />
        </G>
      ) : null}
      {cracked && !defeated ? (
        <G>
          <Ellipse cx={208} cy={184} rx={6} ry={2.5} fill={gold} />
          <Ellipse cx={216} cy={178} rx={5} ry={2} fill={gold} />
        </G>
      ) : null}
    </Svg>
  );
});
