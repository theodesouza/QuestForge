/**
 * Quimera Fracionária — três cabeças sobre um mesmo corpo: Leão (1/2 da vida, no centro),
 * Cabra (1/3, à direita) e Serpente (1/6, à esquerda). Cada cabeça que cai pende, apaga os olhos
 * e perde a cor; a legenda embaixo mostra as frações que ainda restam.
 */
import { memo } from 'react';
import Svg, { Circle, Defs, Ellipse, G, Line, Path, Polygon, RadialGradient, Stop, Text as SvgText } from 'react-native-svg';
import { colors, fonts } from '../../ui/theme';

interface Props {
  size?: number;
  /** Aceito por compatibilidade com os outros chefões; a Quimera usa `headsFelled`. */
  cracked?: boolean;
  defeated?: boolean;
  /** Cabeças que já caíram (0–3). */
  headsFelled?: number;
}

const MANE = Array.from({ length: 14 }, (_, i) => {
  const a = (i * 360) / 14;
  const p = (r: number, d: number) => {
    const t = ((a + d - 90) * Math.PI) / 180;
    return `${(120 + r * Math.cos(t)).toFixed(1)},${(118 + r * Math.sin(t)).toFixed(1)}`;
  };
  return `${p(50, 0)} ${p(33, 13)} ${p(33, -13)}`;
});

export const QuimeraArt = memo(function QuimeraArt({ size = 220, defeated = false, headsFelled = 0 }: Props) {
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
        <RadialGradient id="quiGlow" cx="50%" cy="45%" r="50%">
          <Stop offset="0" stopColor={defeated ? colors.ink600 : '#5FD38D'} stopOpacity={0.24} />
          <Stop offset="1" stopColor={colors.ink900} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={120} cy={110} r={112} fill="url(#quiGlow)" />
      <Path d="M24 214 Q120 200 216 214" stroke={colors.line} strokeWidth={2} fill="none" />

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

      {/* cabra */}
      <Polygon points="140,148 160,98 190,106 176,156" fill={dead(goatDown, '#9AA3C7', '#4A5070')} stroke={colors.ink900} strokeWidth={2} strokeLinejoin="round" />
      <G transform={goatDown ? 'translate(8 38) rotate(32 180 82)' : undefined}>
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
      </G>

      {/* leão */}
      <G transform={lionDown ? 'translate(0 26) rotate(-12 120 118)' : undefined}>
        {MANE.map((pts, i) => (
          <Polygon key={i} points={pts} fill={dead(lionDown, i % 2 ? '#F2B54A' : '#E39A2E', i % 2 ? '#6B5B3E' : '#5A4B32')} stroke={colors.ink900} strokeWidth={1.4} strokeLinejoin="round" />
        ))}
        <Circle cx={120} cy={118} r={31} fill={dead(lionDown, '#EAB45E', '#85704B')} stroke={colors.ink900} strokeWidth={2} />
        <Ellipse cx={120} cy={129} rx={15} ry={11} fill={dead(lionDown, '#F7DA9E', '#9A8560')} />
        <Polygon points="114,121 126,121 120,128" fill={dead(lionDown, '#7A3B2E', '#4A3A30')} />
        <Path d="M120 128 L120 134 M120 134 Q112 140 106 135 M120 134 Q128 140 134 135" stroke={colors.ink900} strokeWidth={1.8} strokeLinecap="round" fill="none" />
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
      </G>

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
