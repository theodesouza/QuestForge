/**
 * Arquiteto dos Sólidos — um construtor de cubos empilhados, de capacete amarelo, com um prumo na
 * mão esquerda e um esquadro na direita. Cada erro do jogador despeja uma camada de concreto
 * (até três) subindo pelo corpo; a Técnica as quebra de uma vez e, na fase 2, o concreto racha.
 */
import { memo } from 'react';
import Svg, { Circle, Defs, G, Line, Path, Polygon, RadialGradient, Rect, Stop } from 'react-native-svg';
import { colors } from '../../ui/theme';

interface Props {
  size?: number;
  /** Fase 2: o concreto rachou. */
  cracked?: boolean;
  defeated?: boolean;
  /** Camadas de concreto no corpo (0–3). */
  layers?: number;
}

/** Faixas de concreto de baixo para cima; cada uma com pingos e uma linha de topo ondulada. */
const BANDS = [
  {
    body: 'M38 214 L38 180 Q58 170 80 177 T122 175 T162 177 T202 180 L202 214 Z',
    drips: 'M70 176 q-1 10 3 12 q4 -2 3 -12 M150 177 q-1 12 3 14 q4 -2 3 -14',
    crack: 'M96 177 L100 190 L94 200 L99 212',
  },
  {
    body: 'M64 180 L64 152 Q84 142 106 149 T148 149 T176 152 L176 180 Z',
    drips: 'M92 150 q-1 9 3 11 q4 -2 3 -11 M138 150 q-1 11 3 13 q4 -2 3 -13',
    crack: 'M118 150 L123 163 L116 172 L121 179',
  },
  {
    body: 'M68 154 L68 124 Q88 114 108 121 T150 121 T172 124 L172 154 Z',
    drips: 'M100 122 q-1 8 3 10 q4 -2 3 -10 M144 122 q-1 10 3 12 q4 -2 3 -12',
    crack: 'M84 122 L90 134 L83 144 L89 153',
  },
] as const;

export const ArquitetoArt = memo(function ArquitetoArt({ size = 220, cracked = false, defeated = false, layers = 0 }: Props) {
  const top = defeated ? '#4A4F72' : '#8F7CF0';
  const left = defeated ? '#3A3F57' : '#5B49B8';
  const right = defeated ? '#2A2E42' : '#43348F';
  const eye = defeated ? colors.ink500 : '#7FF3FF';
  const concrete = Math.max(0, Math.min(3, defeated ? 0 : layers));

  return (
    <Svg width={size} height={size} viewBox="0 0 240 240">
      <Defs>
        <RadialGradient id="arqGlow" cx="50%" cy="45%" r="50%">
          <Stop offset="0" stopColor={defeated ? colors.ink600 : '#9B87FF'} stopOpacity={0.26} />
          <Stop offset="1" stopColor={colors.ink900} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={120} cy={112} r={112} fill="url(#arqGlow)" />
      <Path d="M24 214 Q120 200 216 214" stroke={colors.line} strokeWidth={2} fill="none" />

      <G stroke={colors.ink900} strokeWidth={2} strokeLinejoin="round">
        {/* pernas */}
        <Polygon points="82,172 110,172 110,212 82,212" fill={left} />
        <Polygon points="130,172 158,172 158,212 130,212" fill={right} />
        {/* torso: cubo isométrico */}
        <Polygon points="120,72 168,100 120,128 72,100" fill={top} />
        <Polygon points="72,100 120,128 120,184 72,156" fill={left} />
        <Polygon points="120,128 168,100 168,156 120,184" fill={right} />
        {/* cabeça: cubo menor */}
        <Polygon points="120,30 140,41 120,52 100,41" fill={top} />
        <Polygon points="100,41 120,52 120,76 100,65" fill={left} />
        <Polygon points="120,52 140,41 140,65 120,76" fill={right} />
      </G>
      {/* olhos nas duas faces da cabeça */}
      {defeated ? (
        <G stroke={eye} strokeWidth={1.8} strokeLinecap="round">
          <Line x1={105} y1={54} x2={113} y2={60} />
          <Line x1={113} y1={54} x2={105} y2={60} />
          <Line x1={127} y1={60} x2={135} y2={54} />
          <Line x1={135} y1={60} x2={127} y2={54} />
        </G>
      ) : (
        <G fill={eye}>
          <Polygon points="104,55 113,60 113,63 104,58" />
          <Polygon points="127,60 136,55 136,58 127,63" />
        </G>
      )}
      {/* capacete */}
      <G stroke={colors.ink900} strokeWidth={2} strokeLinejoin="round">
        <Path d="M96 38 Q120 -2 144 38 Z" fill={defeated ? '#6B6A52' : '#F2B54A'} />
        <Rect x={90} y={36} width={60} height={8} rx={4} fill={defeated ? '#55543F' : '#E39A2E'} />
      </G>

      {/* braço esquerdo + prumo */}
      <G stroke={colors.ink900} strokeWidth={2} strokeLinejoin="round">
        <Polygon points="72,102 52,122 60,132 80,112" fill={left} />
      </G>
      <Line x1={54} y1={128} x2={54} y2={190} stroke={defeated ? colors.ink500 : colors.parchmentDim} strokeWidth={1.4} />
      <Polygon points="54,198 47,184 61,184" fill={defeated ? '#55543F' : '#F2B54A'} stroke={colors.ink900} strokeWidth={1.6} strokeLinejoin="round" />
      {/* braço direito + esquadro */}
      <G stroke={colors.ink900} strokeWidth={2} strokeLinejoin="round">
        <Polygon points="168,102 190,120 182,130 160,112" fill={right} />
      </G>
      <Path d="M186 122 V162 H222 Z" fill={defeated ? colors.ink600 : colors.brass} fillOpacity={0.18} stroke={defeated ? colors.ink500 : colors.brass} strokeWidth={4.5} strokeLinejoin="round" />

      {/* concreto: uma faixa por camada, de baixo para cima */}
      {BANDS.slice(0, concrete).map((b, i) => (
        <G key={i}>
          <Path d={b.body} fill="#9097AE" stroke={colors.ink900} strokeWidth={2} strokeLinejoin="round" />
          <Path d={b.drips} fill="#9097AE" stroke={colors.ink900} strokeWidth={1.6} strokeLinejoin="round" />
          <G fill="#B8BED4" fillOpacity={0.7}>
            <Circle cx={90 + i * 6} cy={192 - i * 28} r={2} />
            <Circle cx={140 - i * 4} cy={198 - i * 28} r={1.6} />
            <Circle cx={116 + i * 3} cy={184 - i * 28} r={1.4} />
          </G>
          {cracked ? <Path d={b.crack} stroke={colors.ember} strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : null}
        </G>
      ))}
      {defeated ? (
        <G stroke={colors.ink600} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M98 74 L104 86 L97 96" />
          <Path d="M140 106 L134 120 L141 132" />
        </G>
      ) : null}
    </Svg>
  );
});
