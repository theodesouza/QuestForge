/** Feiticeiro de âmbar: manto flutuante, dedos de ouro e um cofre aprisionado em órbita. */
import { memo } from 'react';
import type { SharedValue } from 'react-native-reanimated';
import Svg, { Circle, Defs, Ellipse, G, Line, LinearGradient, Path, Polygon, RadialGradient, Rect, Stop, Text as SvgText } from 'react-native-svg';
import { colors, fonts } from '../../ui/theme';
import { BossJoint } from './BossJoint';

interface Props { size?: number; cracked?: boolean; defeated?: boolean; attacking?: boolean; pulse?: SharedValue<number> }

export const MercadorArt = memo(function MercadorArt({ size = 220, cracked = false, defeated = false, attacking = false, pulse }: Props) {
  const gold = defeated ? '#80715B' : '#FFD680';
  const amber = defeated ? '#695342' : '#FF9F43';
  return <Svg width={size} height={size} viewBox="0 0 240 240">
    <Defs>
      <LinearGradient id="mercRobe" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor={defeated ? '#443B4D' : '#916378'} /><Stop offset="0.5" stopColor="#4F3453" /><Stop offset="1" stopColor="#211D34" />
      </LinearGradient>
      <LinearGradient id="mercGold" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#FFF0C0" /><Stop offset="0.45" stopColor={gold} /><Stop offset="1" stopColor="#9E622F" />
      </LinearGradient>
      <RadialGradient id="mercAura"><Stop offset="0" stopColor={amber} stopOpacity={0.2} /><Stop offset="1" stopColor={amber} stopOpacity={0} /></RadialGradient>
    </Defs>
    <Circle cx={120} cy={120} r={110} fill="url(#mercAura)" />
    <Ellipse cx={120} cy={225} rx={76} ry={7} fill="#050915" opacity={0.6} />
    <G fill="none" stroke={gold} strokeWidth={1.5} opacity={defeated ? 0.2 : 0.65}>
      <Circle cx={120} cy={60} r={42} /><Circle cx={120} cy={60} r={48} strokeDasharray="2 10" />
      <Path d="M120 8 L120 18 M68 60 L78 60 M162 60 L172 60" />
    </G>
    <G stroke={colors.ink900} strokeWidth={2} strokeLinejoin="round">
      <Path d="M87 86 Q120 66 155 88 L170 150 L194 207 L166 203 L151 220 L119 208 L93 220 L73 202 L49 211 L73 141 Z" fill="url(#mercRobe)" />
      <Path d="M102 94 L92 178 L76 205 M138 91 L152 178 L166 203 M119 146 L119 208" stroke="#A77B8D" opacity={0.5} fill="none" />
      <Path d="M87 89 Q82 60 105 31 L125 19 Q151 37 156 84 L143 108 L116 96 Z" fill="url(#mercRobe)" />
      <Path d="M125 30 Q100 48 98 80 L113 97 L140 91 L145 77 Q139 50 125 30 Z" fill="#110F20" stroke={gold} strokeWidth={1.5} />
      <Path d="M86 94 L68 111 L49 148 L69 160 L95 127 Z" fill="url(#mercRobe)" />
      <Path d="M150 95 L173 111 L193 143 L171 156 L146 125 Z" fill="url(#mercRobe)" />
      <BossJoint pulse={pulse} degrees={-6} x={60} y={147}><G transform={attacking ? 'rotate(-22 60 147)' : undefined}>
        <Path d="M52 142 L66 148 L64 158 L49 164 L37 160 L30 151 L32 147 L43 154 L48 151 Z" fill="url(#mercGold)" />
        <Path d="M42 155 L36 139 M49 154 L45 136 M56 155 L54 138" stroke={gold} strokeWidth={3.5} strokeLinecap="round" />
      </G></BossJoint>
      <BossJoint pulse={pulse} degrees={6} x={181} y={146}><G transform={attacking ? 'rotate(22 181 146)' : undefined}>
        <Path d="M174 145 L188 139 L193 151 L207 145 L211 151 L202 163 L185 167 L175 159 Z" fill="url(#mercGold)" />
        <Path d="M185 151 L187 136 M194 153 L198 135 M202 155 L211 141" stroke={gold} strokeWidth={3.5} strokeLinecap="round" />
      </G></BossJoint>
      <Path d="M94 100 L118 117 L145 98 L135 132 L121 144 L106 132 Z" fill="url(#mercGold)" />
      <Circle cx={120} cy={127} r={9} fill="#704440" stroke={gold} />
    </G>
    <Path d={attacking ? 'M105 67 L117 72 M128 72 L140 66' : 'M105 70 L117 71 M128 71 L140 70'} stroke={amber} strokeWidth={3} strokeLinecap="round" />
    <Path d={cracked ? 'M112 85 Q121 79 132 85' : 'M112 82 Q123 90 134 79'} stroke={gold} strokeWidth={1.5} fill="none" />
    <SvgText x={120} y={174} textAnchor="middle" fontFamily={fonts.display} fontSize={22} fill={gold}>%ⁿ</SvgText>
    <BossJoint pulse={pulse} degrees={5} x={195} y={101}><G transform={cracked ? 'translate(0 12) rotate(14 195 101)' : undefined}>
      <Path d="M170 74 L206 68 L222 81 L220 115 L184 123 L170 111 Z" fill="#39445F" stroke={gold} strokeWidth={1.5} />
      <Polygon points="170,74 206,68 222,81 184,88" fill="#8392B0" stroke={gold} strokeWidth={1} />
      <Polygon points="184,88 222,81 220,115 184,123" fill="#4F5D7C" stroke={gold} strokeWidth={1} />
      <Circle cx={202} cy={102} r={9} fill="#202A43" stroke={gold} /><Line x1={202} y1={96} x2={202} y2={104} stroke={gold} strokeWidth={2} />
      {cracked ? <Path d="M185 87 L194 96 L187 108 L198 119 M217 84 L209 92" stroke={amber} strokeWidth={2.4} fill="none" /> : null}
    </G></BossJoint>
    <G fill="url(#mercGold)" stroke="#A46B37" strokeWidth={1} opacity={defeated ? 0.35 : 1}>
      <Ellipse cx={34} cy={111} rx={8} ry={11} transform="rotate(-25 34 111)" /><Ellipse cx={48} cy={73} rx={6} ry={9} transform="rotate(20 48 73)" />
      <Ellipse cx={65} cy={41} rx={5} ry={7} transform="rotate(35 65 41)" />
      <Ellipse cx={cracked ? 210 : 207} cy={cracked ? 198 : 176} rx={7} ry={4} /><Ellipse cx={cracked ? 190 : 194} cy={cracked ? 213 : 191} rx={6} ry={3} />
    </G>
    {!defeated ? <G fill="none" stroke={gold} strokeWidth={1.2} opacity={0.7}>
      <Path d="M26 105 L42 117 M43 69 L53 77 M62 38 L68 44" />
      <Rect x={113} y={119} width={14} height={14} rx={3} transform="rotate(45 120 126)" />
    </G> : null}
  </Svg>;
});
