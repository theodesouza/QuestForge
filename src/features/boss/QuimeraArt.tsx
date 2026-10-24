/**
 * Quimera Fracionária — três cabeças sobre um mesmo corpo: Leão (1/2 da vida, no centro),
 * Cabra (1/3, à direita) e Serpente (1/6, à esquerda). Cada cabeça que cai pende, apaga os olhos
 * e perde a cor; a legenda embaixo mostra as frações que ainda restam.
 */
import { memo } from 'react';
import type { SharedValue } from 'react-native-reanimated';
import Svg, { Circle, Defs, Ellipse, G, Line, LinearGradient, Path, Polygon, RadialGradient, Stop, Text as SvgText } from 'react-native-svg';
import { colors, fonts } from '../../ui/theme';
import { BossJoint } from './BossJoint';

interface Props {
  size?: number;
  /** Aceito por compatibilidade com os outros chefões; a Quimera usa `headsFelled`. */
  cracked?: boolean;
  defeated?: boolean;
  /** Cabeças que já caíram (0–3). */
  headsFelled?: number;
  attacking?: boolean;
  pulse?: SharedValue<number>;
}

const MANE = Array.from({ length: 14 }, (_, i) => {
  const a = (i * 360) / 14;
  const p = (r: number, d: number) => {
    const t = ((a + d - 90) * Math.PI) / 180;
    return `${(120 + r * Math.cos(t)).toFixed(1)},${(118 + r * Math.sin(t)).toFixed(1)}`;
  };
  return `${p(50, 0)} ${p(33, 13)} ${p(33, -13)}`;
});

export const QuimeraArt = memo(function QuimeraArt({ size = 220, defeated = false, headsFelled = 0, attacking = false, pulse }: Props) {
  const fell = defeated ? 3 : headsFelled;
  const lionDown = fell >= 1;
  const goatDown = fell >= 2;
  const snakeDown = fell >= 3;
  const dead = (down: boolean, alive: string, gone: string) => (down ? gone : alive);

  const body = defeated ? '#26352D' : '#2C4636';
  const bodyLight = defeated ? '#33463B' : '#3C5E49';
  const eyeX = (cx: number, cy: number) => (
    <G stroke={colors.ink500} strokeWidth={2} strokeLinecap="round">
      <Line x1={cx - 3.5} y1={cy - 3.5} x2={cx + 3.5} y2={cy + 3.5} />
      <Line x1={cx + 3.5} y1={cy - 3.5} x2={cx - 3.5} y2={cy + 3.5} />
    </G>
  );

  return (
    <Svg width={size} height={size} viewBox="0 0 240 240">
      <Defs>
        <LinearGradient id="quiWing" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={lionDown ? '#648F86' : '#617A88'} /><Stop offset="1" stopColor="#162C37" />
        </LinearGradient>
        <LinearGradient id="quiArmor" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#B9BD90" /><Stop offset="0.5" stopColor="#758268" /><Stop offset="1" stopColor="#304840" />
        </LinearGradient>
        <RadialGradient id="quiGlow" cx="50%" cy="45%" r="50%">
          <Stop offset="0" stopColor={defeated ? colors.ink600 : '#5FD38D'} stopOpacity={0.24} />
          <Stop offset="1" stopColor={colors.ink900} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={120} cy={110} r={112} fill="url(#quiGlow)" />
      <Path d="M24 214 Q120 200 216 214" stroke={colors.line} strokeWidth={2} fill="none" />

      {/* Asas recortadas e membranas: a silhueta se abre quando o leão cai. */}
      <G stroke={lionDown && !defeated ? colors.verdigris : '#7B9891'} strokeWidth={1.5} strokeLinejoin="round" fill="url(#quiWing)" opacity={defeated ? 0.35 : 1}>
        <Path d={lionDown ? 'M85 157 Q43 113 10 28 L6 97 L24 86 L20 130 L44 119 L52 164 Z' : 'M85 157 Q51 120 18 49 L14 111 L31 101 L30 144 L49 135 L57 170 Z'} />
        <Path d={lionDown ? 'M155 157 Q197 113 230 28 L234 97 L216 86 L220 130 L196 119 L188 164 Z' : 'M155 157 Q189 120 222 49 L226 111 L209 101 L210 144 L191 135 L183 170 Z'} />
        <Path d="M24 66 L61 146 M36 109 L68 153 M216 66 L179 146 M204 109 L172 153" fill="none" opacity={0.7} />
      </G>

      {/* serpente (cauda) — atrás do corpo */}
      <G fill="none" strokeLinecap="round" strokeLinejoin="round">
        <Path
          d={snakeDown ? 'M64 196 C22 178 90 164 48 174 C30 180 28 192 38 200' : 'M64 196 C20 176 84 150 46 126 C28 112 34 92 50 86'}
          stroke={dead(snakeDown, '#5FD38D', '#34493E')}
          strokeWidth={11}
        />
        <Path
          d={snakeDown ? 'M64 196 C22 178 90 164 48 174 C30 180 28 192 38 200' : 'M64 196 C20 176 84 150 46 126 C28 112 34 92 50 86'}
          stroke={dead(snakeDown, '#2A8C55', '#26352D')}
          strokeWidth={3}
          strokeDasharray="2 7"
        />
      </G>
      <G transform={snakeDown ? 'translate(-12 114) rotate(40 50 86)' : undefined}>
        <Ellipse cx={50} cy={84} rx={13} ry={9} fill={dead(snakeDown, '#5FD38D', '#34493E')} stroke={colors.ink900} strokeWidth={2} transform="rotate(-24 50 84)" />
        {snakeDown ? (
          eyeX(45, 82)
        ) : (
          <>
            <Circle cx={45} cy={81} r={3} fill="#FFE98A" />
            <Line x1={45} y1={79} x2={45} y2={83} stroke={colors.ink900} strokeWidth={1.4} />
            <Path d="M38 88 L28 92 M28 92 L23 88 M28 92 L24 97" stroke={colors.ember} strokeWidth={1.8} strokeLinecap="round" fill="none" />
          </>
        )}
      </G>

      {/* corpo e patas */}
      <G stroke={colors.ink900} strokeWidth={2} strokeLinejoin="round">
        <Path d="M44 212 Q34 156 82 140 L158 140 Q206 156 196 212 Z" fill={body} />
        <Ellipse cx={80} cy={211} rx={21} ry={7} fill={bodyLight} />
        <Ellipse cx={160} cy={211} rx={21} ry={7} fill={bodyLight} />
      </G>
      <Path d="M70 196 Q120 178 170 196" stroke={bodyLight} strokeWidth={2} fill="none" strokeLinecap="round" />
      <G fill="url(#quiArmor)" stroke="#1A302D" strokeWidth={1.4}>
        <Path d="M76 153 L96 149 L105 163 L89 176 L72 169 Z M144 149 L164 153 L168 169 L151 176 L135 163 Z" />
        <Path d="M104 157 L120 165 L136 157 L133 183 L120 198 L107 183 Z" />
      </G>
      <Path d="M111 176 L120 181 L129 176 M114 184 L120 188 L126 184" fill="none" stroke={defeated ? colors.ink500 : '#A4E3BC'} strokeWidth={1.5} />
      <G fill={defeated ? '#647266' : '#E0D5AC'} stroke="#243E31" strokeWidth={1}>
        {[66, 78, 90, 146, 158, 170].map(x => <Path key={x} d={`M${x} 208 l4 10 l-9 -2 Z`} />)}
      </G>

      {/* cabra */}
      <Polygon points="140,148 160,98 190,106 176,156" fill={dead(goatDown, '#9AA3C7', '#4A5070')} stroke={colors.ink900} strokeWidth={2} strokeLinejoin="round" />
      <BossJoint pulse={goatDown ? undefined : pulse} degrees={-4} x={180} y={96}><G transform={goatDown ? 'translate(8 38) rotate(32 180 82)' : undefined}>
        <Path d="M172 66 Q158 40 178 30 Q172 44 182 52" stroke={dead(goatDown, '#F4ECDC', '#5A6285')} strokeWidth={4.5} strokeLinecap="round" fill="none" />
        <Path d="M190 64 Q208 42 194 28 Q196 44 186 54" stroke={dead(goatDown, '#F4ECDC', '#5A6285')} strokeWidth={4.5} strokeLinecap="round" fill="none" />
        <Ellipse cx={180} cy={80} rx={15} ry={20} fill={dead(goatDown, '#DDE3F5', '#6A7295')} stroke={colors.ink900} strokeWidth={2} transform="rotate(18 180 80)" />
        <Ellipse cx={187} cy={97} rx={9} ry={7} fill={dead(goatDown, '#C9D1F0', '#59618A')} stroke={colors.ink900} strokeWidth={1.6} />
        <Polygon points="183,103 190,103 187,114" fill={dead(goatDown, '#F4ECDC', '#5A6285')} />
        {goatDown ? (
          eyeX(176, 76)
        ) : (
          <>
            <Ellipse cx={176} cy={76} rx={4.5} ry={3.2} fill="#FFD36B" />
            <Line x1={176} y1={73.4} x2={176} y2={78.6} stroke={colors.ink900} strokeWidth={1.6} />
          </>
        )}
      </G></BossJoint>

      {/* leão */}
      <BossJoint pulse={lionDown ? undefined : pulse} degrees={2.5} x={120} y={148}><G transform={lionDown ? 'translate(0 26) rotate(-12 120 118)' : attacking ? 'translate(0 -4) scale(1.03 1)' : undefined}>
        {MANE.map((pts, i) => (
          <Polygon key={i} points={pts} fill={dead(lionDown, i % 2 ? '#F2B54A' : '#E39A2E', i % 2 ? '#6B5B3E' : '#5A4B32')} stroke={colors.ink900} strokeWidth={1.4} strokeLinejoin="round" />
        ))}
        <Circle cx={120} cy={118} r={31} fill={dead(lionDown, '#EAB45E', '#85704B')} stroke={colors.ink900} strokeWidth={2} />
        <Path d="M95 100 L100 85 L110 94 M130 94 L140 85 L145 100" fill="#F7DA9E" stroke={colors.ink900} strokeWidth={1.5} />
        <Path d="M103 101 L110 97 L116 104 M124 104 L130 97 L137 101" fill="none" stroke="#A3682D" strokeWidth={2} />
        <Ellipse cx={120} cy={129} rx={15} ry={11} fill={dead(lionDown, '#F7DA9E', '#9A8560')} />
        <Polygon points="114,121 126,121 120,128" fill={dead(lionDown, '#7A3B2E', '#4A3A30')} />
        <Path d="M120 128 L120 134 M120 134 Q112 140 106 135 M120 134 Q128 140 134 135" stroke={colors.ink900} strokeWidth={1.8} strokeLinecap="round" fill="none" />
        {attacking && !lionDown ? <Path d="M107 134 Q120 155 133 134 Q120 141 107 134 Z" fill="#421E28" stroke={colors.ink900} strokeWidth={1.2} /> : null}
        {lionDown ? (
          <>
            {eyeX(108, 110)}
            {eyeX(132, 110)}
          </>
        ) : (
          <>
            <Polygon points="100,108 115,111 113,117 101,114" fill="#FFF3B0" stroke={colors.ink900} strokeWidth={1.2} />
            <Polygon points="140,108 125,111 127,117 139,114" fill="#FFF3B0" stroke={colors.ink900} strokeWidth={1.2} />
            <Circle cx={108} cy={113} r={2.4} fill={colors.ink900} />
            <Circle cx={132} cy={113} r={2.4} fill={colors.ink900} />
            <Polygon points="113,136 116,136 114.5,142" fill="#FFFFFF" />
            <Polygon points="124,136 127,136 125.5,142" fill="#FFFFFF" />
          </>
        )}
      </G></BossJoint>

      {/* legenda: as frações que ainda restam */}
      {[
        { x: 48, t: '1/6', c: '#5FD38D', down: snakeDown },
        { x: 120, t: '1/2', c: '#F2B54A', down: lionDown },
        { x: 192, t: '1/3', c: '#C9D1F0', down: goatDown },
      ].map((l) => (
        <G key={l.t}>
          <SvgText x={l.x} y={232} fill={l.down ? colors.ink500 : l.c} fontSize={14} fontFamily={fonts.display} textAnchor="middle">
            {l.t}
          </SvgText>
          {l.down ? <Line x1={l.x - 13} y1={227} x2={l.x + 13} y2={227} stroke={colors.ink500} strokeWidth={1.6} strokeLinecap="round" /> : null}
        </G>
      ))}
    </Svg>
  );
});
