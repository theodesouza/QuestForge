/**
 * Leviatã das Escalas — uma baleia imensa com uma régua desenhada no dorso. Ela encolhe a cada
 * escala vencida (Colossal → Grande → Comum), e a unidade mostrada (km, m, cm) acompanha o
 * tamanho; as cores também mudam. Derrotada, vira uma silhueta cinzenta.
 */
import { memo } from 'react';
import Svg, { Circle, Defs, G, Line, Path, RadialGradient, Stop, Text as SvgText } from 'react-native-svg';
import { colors, fonts } from '../../ui/theme';

interface Props {
  size?: number;
  cracked?: boolean;
  defeated?: boolean;
  /** Escalas já vencidas (0 = Colossal, 1 = Grande, 2 = Comum). */
  stage?: number;
}

const STAGES = [
  { scale: 1, body: '#2C5BD6', belly: '#8DB0FF', unit: 'km', tint: '#4C8DFF' },
  { scale: 0.8, body: '#1E9C86', belly: '#8DF0D2', unit: 'm', tint: '#38D6B0' },
  { scale: 0.6, body: '#C99A2A', belly: '#FFE7A3', unit: 'cm', tint: '#FFD36B' },
] as const;

/** Altura do dorso (parábola suave) para posicionar os traços da régua. */
const back = (x: number) => 82 + 0.0035 * (x - 100) ** 2;

export const EscalasArt = memo(function EscalasArt({ size = 220, defeated = false, stage = 0 }: Props) {
  const st = STAGES[Math.max(0, Math.min(2, stage))];
  const body = defeated ? '#3A3F57' : st.body;
  const belly = defeated ? '#565C78' : st.belly;
  const accent = defeated ? colors.ink500 : st.tint;
  const eye = defeated ? colors.ink500 : '#FFFFFF';

  return (
    <Svg width={size} height={size} viewBox="0 0 240 240">
      <Defs>
        <RadialGradient id="escGlow" cx="50%" cy="45%" r="50%">
          <Stop offset="0" stopColor={defeated ? colors.ink600 : st.tint} stopOpacity={0.26} />
          <Stop offset="1" stopColor={colors.ink900} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={120} cy={112} r={112} fill="url(#escGlow)" />

      {/* a baleia encolhe em torno da linha d'água */}
      <G transform={`translate(120 206) scale(${st.scale}) translate(-120 -206)`}>
        <Path
          d="M30 152 C30 98 100 78 150 94 C176 102 192 118 200 136 L228 112 L222 152 L238 180 L200 170 C182 194 118 206 70 192 C44 184 30 170 30 152 Z"
          fill={body}
          stroke={colors.ink900}
          strokeWidth={2.4}
          strokeLinejoin="round"
        />
        <Path d="M44 164 C70 184 130 192 180 176 C150 196 84 198 52 180 Z" fill={belly} fillOpacity={0.85} />
        <Path d="M110 170 L96 196 L132 184 Z" fill={body} stroke={colors.ink900} strokeWidth={2} strokeLinejoin="round" />
        {/* régua no dorso */}
        <G stroke={defeated ? colors.ink500 : '#FFFFFF'} strokeWidth={1.6} strokeLinecap="round">
          {Array.from({ length: 14 }, (_, i) => {
            const x = 52 + i * 10;
            const y = back(x);
            const len = i % 5 === 0 ? 9 : 5;
            return <Line key={i} x1={x} y1={y + 2} x2={x} y2={y - len} />;
          })}
        </G>
        {/* olho e boca */}
        {defeated ? (
          <Path d="M52 124 L62 134 M62 124 L52 134" stroke={eye} strokeWidth={2.2} strokeLinecap="round" />
        ) : (
          <>
            <Circle cx={58} cy={129} r={6.5} fill={accent} fillOpacity={0.3} />
            <Circle cx={58} cy={129} r={3.6} fill={eye} />
            <Circle cx={58} cy={129} r={1.6} fill={colors.ink900} />
          </>
        )}
        <Path d="M32 156 Q54 170 84 166" stroke={colors.ink900} strokeWidth={2} fill="none" strokeLinecap="round" />
      </G>

      {/* mar e unidade da escala */}
      <Path d="M0 206 Q22 196 44 206 T88 206 T132 206 T176 206 T240 206 L240 240 L0 240 Z" fill={defeated ? '#18212A' : '#0E2257'} stroke={colors.ink900} strokeWidth={2} />
      <Path d="M0 220 Q22 212 44 220 T88 220 T132 220 T176 220 T240 220" stroke={defeated ? colors.ink600 : st.tint} strokeOpacity={0.5} strokeWidth={2} fill="none" />
      {!defeated ? (
        <SvgText x={196} y={52} fill={accent} fontSize={26} fontFamily={fonts.display} textAnchor="middle">
          {st.unit}
        </SvgText>
      ) : null}
    </Svg>
  );
});
