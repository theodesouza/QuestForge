/** Basalto facetado, ombreiras monumentais e núcleo revelado pela quebra da couraça. */
import { memo } from 'react';
import type { SharedValue } from 'react-native-reanimated';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Polygon, RadialGradient, Stop, Text as SvgText } from 'react-native-svg';
import { colors, fonts } from '../../ui/theme';
import { BossJoint } from './BossJoint';

interface Props { size?: number; cracked?: boolean; defeated?: boolean; attacking?: boolean; pulse?: SharedValue<number> }

export const GolemArt = memo(function GolemArt({ size = 220, cracked = false, defeated = false, attacking = false, pulse }: Props) {
  const glow = defeated ? colors.ink500 : cracked ? colors.brass : colors.verdigris;
  return (
    <Svg width={size} height={size} viewBox="0 0 240 240">
      <Defs>
        <LinearGradient id="basalt" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={defeated ? '#454A60' : '#A2ACCF'} />
          <Stop offset="0.45" stopColor="#535D82" /><Stop offset="1" stopColor="#242C48" />
        </LinearGradient>
        <LinearGradient id="basaltEdge" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#7B8AB4" /><Stop offset="1" stopColor="#343D5D" />
        </LinearGradient>
        <RadialGradient id="golemCore">
          <Stop offset="0" stopColor={glow} stopOpacity={0.55} /><Stop offset="1" stopColor={glow} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Ellipse cx={120} cy={220} rx={88} ry={8} fill="#050915" fillOpacity={0.6} />
      <Circle cx={120} cy={126} r={105} fill="url(#golemCore)" opacity={0.35} />
      <G stroke={colors.ink900} strokeWidth={2.5} strokeLinejoin="round">
        <Path d="M77 163 L109 163 L108 205 L98 219 L57 219 L62 201 Z" fill="url(#basaltEdge)" />
        <Path d="M131 163 L163 163 L178 201 L183 219 L142 219 L132 205 Z" fill="url(#basaltEdge)" />
        <Polygon points="63,199 103,201 98,219 57,219" fill="#343D5D" />
        <Polygon points="137,201 177,199 183,219 142,219" fill="#343D5D" />
        <BossJoint pulse={pulse} degrees={-3} x={63} y={85}><G transform={attacking ? 'rotate(-18 63 85)' : 'rotate(4 63 85)'}>
          <Polygon points="26,67 66,57 87,79 72,111 30,110 15,90" fill="url(#basalt)" />
          <Polygon points="29,69 65,61 53,86 17,89" fill="#9EAACD" />
          <Polygon points="33,112 69,108 67,147 51,171 23,156" fill="url(#basaltEdge)" />
          <Polygon points="19,149 57,151 63,175 45,192 14,180 9,165" fill="url(#basalt)" />
          <Path d="M20 168 L50 171 M29 158 L26 182 M40 160 L39 185" stroke="#333C5A" fill="none" />
        </G></BossJoint>
        <BossJoint pulse={pulse} degrees={3} x={177} y={85}><G transform={attacking ? 'rotate(22 177 85)' : 'rotate(-4 177 85)'}>
          <Polygon points="174,57 214,67 225,90 210,110 168,111 153,79" fill="url(#basalt)" />
          <Polygon points="175,61 210,70 222,89 187,86" fill="#9EAACD" />
          <Polygon points="171,108 207,112 217,156 189,171 173,147" fill="url(#basaltEdge)" />
          <Polygon points="183,151 221,149 231,165 226,180 195,192 177,175" fill="url(#basalt)" />
          <Path d="M190 171 L220 168 M214 182 L211 158 M201 185 L200 160" stroke="#333C5A" fill="none" />
        </G></BossJoint>
        <Polygon points="78,70 162,70 178,113 164,167 139,184 101,184 76,167 62,113" fill="url(#basalt)" />
        <Polygon points="79,74 120,88 161,74 149,111 91,111" fill="#8290B8" />
        <Polygon points="91,107 149,107 156,146 137,164 103,164 84,146" fill="#202C43" />
        <Polygon points="104,117 136,117 147,137 133,154 107,154 93,137" fill={glow} fillOpacity={defeated ? 0.1 : cracked ? 0.8 : 0.2} stroke={glow} strokeWidth={1.3} />
        <Polygon points="92,31 111,23 148,30 158,56 151,77 132,88 105,82 85,63" fill="url(#basalt)" />
        <Polygon points="95,33 115,29 144,34 143,43 101,44" fill="#B3BEDA" />
        <Path d="M103 72 L136 72 L130 79 L111 78 Z" fill="#26304D" />
      </G>
      <G fill={glow}>
        <Polygon points={attacking ? '98,49 116,55 113,61 99,58' : '98,52 116,54 113,61 99,59'} />
        <Polygon points={attacking ? '142,49 124,55 127,61 141,58' : '142,52 124,54 127,61 141,59'} />
        {!defeated ? <><Circle cx={108} cy={56} r={8} opacity={0.16} /><Circle cx={132} cy={56} r={8} opacity={0.16} /></> : null}
      </G>
      <SvgText x={120} y={148} textAnchor="middle" fontFamily={fonts.display} fontSize={32} fill={defeated ? colors.ink500 : '#FFF2BC'}>∝</SvgText>
      <G stroke={glow} strokeWidth={1.5} opacity={defeated ? 0.15 : 0.8} fill="none">
        <Path d="M35 82 L48 77 L44 94 M196 77 L206 82 L202 94 M77 190 L82 184 L89 190 M151 190 L158 184 L163 190" />
        <Path d="M107 175 L120 180 L133 175" />
      </G>
      {cracked || defeated ? <G stroke={glow} strokeWidth={2.6} fill="none" strokeLinecap="round">
        <Path d="M83 76 L98 92 L91 107 L102 118 M159 80 L144 99 L152 110 L138 122 M115 29 L120 42 L113 48" />
        <Path d="M30 72 L39 89 L32 101 M209 74 L199 91 L210 104 M85 154 L100 164 L94 176" />
      </G> : null}
      {cracked && !defeated ? <G fill="url(#basaltEdge)" stroke={glow} strokeWidth={0.8}>
        <Polygon points="20,116 28,122 23,132 16,125" /><Polygon points="216,121 226,116 230,126 221,133" />
        <Polygon points="67,36 72,25 79,36 75,43" /><Polygon points="169,31 176,38 170,48 165,40" />
      </G> : null}
    </Svg>
  );
});
