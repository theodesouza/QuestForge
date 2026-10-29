/**
 * Esfinge do Acaso — corpo de leão deitado, cabeça de nemes rosa e dourado, asa dobrada nas costas
 * e dois dados sobre as patas. No Enigma os olhos brilham e um "?" paira sobre a cabeça; na fase 2
 * (vida abaixo de metade) a asa se abre.
 */
import { memo } from 'react';
import Svg, { Circle, Defs, Ellipse, G, Path, Polygon, RadialGradient, Rect, Stop, Text as SvgText } from 'react-native-svg';
import { colors, fonts } from '../../ui/theme';

interface Props {
  size?: number;
  /** Fase 2: a asa se abre. */
  cracked?: boolean;
  defeated?: boolean;
  /** O golpe atual é um Enigma: olhos acesos e "?" sobre a cabeça. */
  riddle?: boolean;
}

function Die({ x, y, rot, dead }: { x: number; y: number; rot: number; dead: boolean }) {
  return (
    <G transform={`rotate(${rot} ${x} ${y})`}>
      <Rect x={x - 11} y={y - 11} width={22} height={22} rx={4} fill={dead ? '#4A5070' : '#F4ECDC'} stroke={colors.ink900} strokeWidth={2} />
      <G fill={dead ? colors.ink600 : '#FF5FA8'}>
        <Circle cx={x - 5} cy={y - 5} r={2.2} />
        <Circle cx={x} cy={y} r={2.2} />
        <Circle cx={x + 5} cy={y + 5} r={2.2} />
      </G>
    </G>
  );
}

export const EsfingeArt = memo(function EsfingeArt({ size = 220, cracked = false, defeated = false, riddle = false }: Props) {
  const sand = defeated ? '#4A4F66' : '#C9984E';
  const sandDark = defeated ? '#363B52' : '#8A6532';
  const sandLight = defeated ? '#5A607C' : '#E8C27A';
  const pink = defeated ? '#4A4F70' : '#FF8FD1';
  const gold = defeated ? '#5A607C' : '#FFD36B';
  const skin = defeated ? '#565C78' : '#E9C79E';
  const eye = defeated ? colors.ink500 : riddle ? '#FFFFFF' : '#FF5FA8';
  const wingOpen = cracked && !defeated;

  return (
    <Svg width={size} height={size} viewBox="0 0 240 240">
      <Defs>
        <RadialGradient id="espGlow" cx="50%" cy="45%" r="50%">
          <Stop offset="0" stopColor={defeated ? colors.ink600 : riddle ? '#FFD36B' : '#FF8FD1'} stopOpacity={riddle ? 0.34 : 0.24} />
          <Stop offset="1" stopColor={colors.ink900} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={120} cy={112} r={112} fill="url(#espGlow)" />
      <Path d="M18 214 Q120 200 222 214" stroke={colors.line} strokeWidth={2} fill="none" />

      {/* asa: dobrada nas costas ou aberta (fase 2) */}
      {wingOpen ? (
        <G stroke={colors.ink900} strokeWidth={2} strokeLinejoin="round">
          <Polygon points="132,150 118,70 146,40 168,84 190,56 198,112 218,96 200,150" fill={pink} />
          <Polygon points="146,150 142,92 164,72 178,110 196,92 192,140" fill={gold} fillOpacity={0.8} />
        </G>
      ) : (
        <G stroke={colors.ink900} strokeWidth={2} strokeLinejoin="round">
          <Polygon points="120,146 118,112 150,100 188,118 200,148" fill={pink} />
          <Polygon points="134,146 136,122 160,114 184,126 190,146" fill={gold} fillOpacity={0.8} />
        </G>
      )}

      {/* corpo de leão deitado */}
      <G stroke={colors.ink900} strokeWidth={2} strokeLinejoin="round">
        <Path d="M50 204 Q44 150 100 140 L168 142 Q210 150 208 204 Z" fill={sand} />
        <Path d="M60 204 Q58 168 100 160 L150 162 Q186 168 192 204 Z" fill={sandLight} fillOpacity={0.35} stroke="none" />
        {/* patas dianteiras estendidas */}
        <Path d="M22 192 Q22 180 40 180 L104 182 L104 204 L30 204 Q22 204 22 192 Z" fill={sand} />
        <Path d="M36 204 V190 M52 204 V190 M68 204 V190" stroke={sandDark} strokeWidth={2} fill="none" strokeLinecap="round" />
        {/* cauda enrolada */}
        <Path d="M206 190 Q232 186 226 168 Q222 156 210 162" stroke={sandDark} strokeWidth={6} fill="none" strokeLinecap="round" />
      </G>

      {/* cabeça: nemes, rosto e joia */}
      <G stroke={colors.ink900} strokeWidth={2} strokeLinejoin="round">
        <Polygon points="50,66 98,66 112,140 38,140" fill={pink} />
        <G stroke="none" fill={gold} fillOpacity={0.85}>
          <Polygon points="54,70 62,70 54,138 46,138" />
          <Polygon points="70,66 78,66 76,140 66,140" />
          <Polygon points="86,66 94,66 100,140 90,140" />
        </G>
        <Ellipse cx={74} cy={92} rx={22} ry={27} fill={skin} />
        <Path d="M52 60 Q74 36 96 60 L96 70 L52 70 Z" fill={gold} />
      </G>
      <Polygon points="74,46 78,54 74,62 70,54" fill={defeated ? colors.ink600 : '#FF5FA8'} stroke={colors.ink900} strokeWidth={1.4} />
      {defeated ? (
        <G stroke={eye} strokeWidth={2} strokeLinecap="round">
          <Path d="M58 86 L68 94 M68 86 L58 94 M80 86 L90 94 M90 86 L80 94" />
        </G>
      ) : (
        <>
          <Polygon points="56,88 68,84 68,92 58,94" fill={eye} stroke={colors.ink900} strokeWidth={1.2} />
          <Polygon points="92,88 80,84 80,92 90,94" fill={eye} stroke={colors.ink900} strokeWidth={1.2} />
          {riddle ? (
            <>
              <Circle cx={62} cy={89} r={9} fill="#FFFFFF" fillOpacity={0.22} />
              <Circle cx={86} cy={89} r={9} fill="#FFFFFF" fillOpacity={0.22} />
            </>
          ) : null}
        </>
      )}
      <Path d="M66 112 Q74 118 82 112" stroke={colors.ink900} strokeWidth={2} fill="none" strokeLinecap="round" />

      {/* dados sobre as patas */}
      <Die x={118} y={194} rot={-12} dead={defeated} />
      <Die x={144} y={198} rot={14} dead={defeated} />

      {/* Enigma: ponto de interrogação sobre a cabeça */}
      {riddle && !defeated ? (
        <SvgText x={118} y={52} fill={gold} fontSize={44} fontFamily={fonts.display} textAnchor="middle">
          ?
        </SvgText>
      ) : null}
    </Svg>
  );
});
