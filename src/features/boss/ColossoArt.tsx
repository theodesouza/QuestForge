/**
 * Colosso Euclidiano — um gigante de pedra clara em forma de triângulo, com três vértices que
 * racham: a cabeça (Círculos), o bloco quadrado à esquerda (Áreas) e o bloco triangular à
 * direita (Triângulos). Cada vértice mostra os acertos que já levou: intacto, rachadura fina
 * e, quando se parte de vez, apagado e coberto de rachaduras. Com os três partidos, o torso
 * brilha em brasa: o Colosso está exposto.
 */
import { memo } from 'react';
import Svg, { Circle, Defs, G, Line, Path, Polygon, RadialGradient, Rect, Stop } from 'react-native-svg';
import { colors } from '../../ui/theme';

interface Props {
  size?: number;
  /** Os três vértices racharam (fase 2): o torso brilha. */
  cracked?: boolean;
  defeated?: boolean;
  /** Acertos em cada vértice (`areas`, `triangulos`, `circulos`). */
  facetHits?: Record<string, number>;
  /** Acertos que racham um vértice. */
  hitsToCrack?: number;
}

const FACET_COLOR = { circulos: '#FF8FD1', areas: '#F2B54A', triangulos: '#7FB6FF' } as const;

/** Rachaduras de cada vértice: a primeira (fina) aparece no primeiro acerto, a segunda quando se parte. */
const CRACKS = {
  circulos: ['M108 22 L115 32 L107 41 L113 55', 'M133 24 L127 35 L135 44 L129 54'],
  areas: ['M30 154 L40 168 L33 178 L44 190', 'M58 152 L51 166 L60 177 L53 190'],
  triangulos: ['M173 158 L183 171 L176 181 L185 190', 'M199 175 L193 186'],
} as const;

export const ColossoArt = memo(function ColossoArt({ size = 220, cracked = false, defeated = false, facetHits = {}, hitsToCrack = 2 }: Props) {
  const stone = defeated ? '#3A3F57' : '#5A6690';
  const stoneDark = defeated ? '#2A2E42' : '#3B4570';
  const stoneLight = defeated ? '#4A5070' : '#8592C4';
  const hits = (id: keyof typeof FACET_COLOR) => (defeated ? hitsToCrack : Math.min(hitsToCrack, facetHits[id] ?? 0));
  const broken = (id: keyof typeof FACET_COLOR) => hits(id) >= hitsToCrack;
  const tint = (id: keyof typeof FACET_COLOR) => (broken(id) ? colors.ink500 : FACET_COLOR[id]);
  const exposed = cracked && !defeated;
  const eye = defeated ? colors.ink500 : exposed ? colors.ember : '#BFE0FF';
  const crackStroke = (id: keyof typeof FACET_COLOR) => (defeated ? colors.ink600 : broken(id) ? colors.ember : colors.ink900);

  return (
    <Svg width={size} height={size} viewBox="0 0 240 240">
      <Defs>
        <RadialGradient id="colGlow" cx="50%" cy="45%" r="50%">
          <Stop offset="0" stopColor={defeated ? colors.ink600 : exposed ? colors.ember : '#7FB6FF'} stopOpacity={0.24} />
          <Stop offset="1" stopColor={colors.ink900} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={120} cy={112} r={112} fill="url(#colGlow)" />
      <Path d="M24 214 Q120 200 216 214" stroke={colors.line} strokeWidth={2} fill="none" />

      {/* brilho dos vértices intactos */}
      {!defeated ? (
        <G>
          {([['circulos', 120, 40, 36], ['areas', 44, 170, 34], ['triangulos', 190, 172, 34]] as const).map(([id, x, y, r]) =>
            broken(id) ? null : <Circle key={id} cx={x} cy={y} r={r} fill={FACET_COLOR[id]} fillOpacity={hits(id) > 0 ? 0.1 : 0.18} />,
          )}
        </G>
      ) : null}

      <G stroke={colors.ink900} strokeWidth={2} strokeLinejoin="round">
        {/* pernas */}
        <Polygon points="86,176 112,176 108,212 82,212" fill={stoneDark} />
        <Polygon points="128,176 154,176 158,212 132,212" fill={stoneDark} />
        {/* torso: um grande triângulo */}
        <Polygon points="120,60 192,178 48,178" fill={stone} />
        <Polygon points="120,92 166,168 74,168" fill={exposed ? '#7A2E22' : stoneDark} />
        <Polygon points="120,60 138,90 102,90" fill={stoneLight} />
      </G>
      {/* linhas de construção no torso (régua e esquadro) */}
      <G stroke={defeated ? colors.ink600 : '#BFE0FF'} strokeOpacity={0.4} strokeWidth={1.2} fill="none">
        <Line x1={120} y1={92} x2={120} y2={168} strokeDasharray="3 4" />
        <Path d="M120 168 H134 V154 H120" />
      </G>
      {exposed ? (
        <Path d="M120 92 L112 112 L123 130 L112 150 L120 168" stroke={colors.ember} strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      ) : null}

      {/* vértice dos Círculos: a cabeça */}
      <G>
        <Circle cx={120} cy={38} r={22} fill={stoneLight} stroke={colors.ink900} strokeWidth={2} />
        <Circle cx={120} cy={38} r={22} fill={tint('circulos')} fillOpacity={0.28} />
        <Circle cx={120} cy={38} r={15} stroke={tint('circulos')} strokeOpacity={0.9} strokeWidth={1.6} fill="none" />
        <Line x1={120} y1={38} x2={132} y2={30} stroke={tint('circulos')} strokeWidth={1.4} strokeLinecap="round" />
        <Rect x={106} y={35} width={28} height={6} rx={3} fill={colors.ink900} />
        {defeated ? (
          <G stroke={eye} strokeWidth={1.8} strokeLinecap="round">
            <Line x1={111} y1={34} x2={117} y2={42} />
            <Line x1={117} y1={34} x2={111} y2={42} />
            <Line x1={123} y1={34} x2={129} y2={42} />
            <Line x1={129} y1={34} x2={123} y2={42} />
          </G>
        ) : (
          <>
            <Circle cx={113} cy={38} r={2.8} fill={eye} />
            <Circle cx={127} cy={38} r={2.8} fill={eye} />
          </>
        )}
      </G>

      {/* vértice das Áreas: bloco quadrado com grade */}
      <G>
        <Rect x={24} y={150} width={40} height={40} fill={stoneLight} stroke={colors.ink900} strokeWidth={2} strokeLinejoin="round" />
        <Rect x={24} y={150} width={40} height={40} fill={tint('areas')} fillOpacity={0.28} />
        <G stroke={tint('areas')} strokeOpacity={0.85} strokeWidth={1.2}>
          <Line x1={37.3} y1={152} x2={37.3} y2={188} />
          <Line x1={50.7} y1={152} x2={50.7} y2={188} />
          <Line x1={26} y1={163.3} x2={62} y2={163.3} />
          <Line x1={26} y1={176.7} x2={62} y2={176.7} />
        </G>
      </G>

      {/* vértice dos Triângulos: bloco triangular com um triângulo semelhante dentro */}
      <G>
        <Polygon points="170,150 170,190 214,190" fill={stoneLight} stroke={colors.ink900} strokeWidth={2} strokeLinejoin="round" />
        <Polygon points="170,150 170,190 214,190" fill={tint('triangulos')} fillOpacity={0.28} />
        <Polygon points="173,170 173,187 197,187" fill="none" stroke={tint('triangulos')} strokeOpacity={0.9} strokeWidth={1.4} strokeLinejoin="round" />
        <Path d="M173 180 H180 V187" stroke={tint('triangulos')} strokeWidth={1.1} fill="none" />
      </G>

      {/* rachaduras: uma ao primeiro acerto, duas quando o vértice se parte */}
      {(Object.keys(CRACKS) as (keyof typeof CRACKS)[]).map((id) => {
        const n = hits(id);
        if (n === 0) return null;
        return (
          <G key={id} stroke={crackStroke(id)} strokeWidth={n >= hitsToCrack ? 2.4 : 1.5} fill="none" strokeLinecap="round" strokeLinejoin="round">
            <Path d={CRACKS[id][0]} />
            {n >= hitsToCrack ? <Path d={CRACKS[id][1]} /> : null}
          </G>
        );
      })}
    </Svg>
  );
});
