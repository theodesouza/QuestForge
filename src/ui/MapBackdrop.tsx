/**
 * Fundo cartográfico: grade de meridianos, curvas de nível e poucas estrelas.
 * Estático e memoizado — custo de renderização desprezível.
 */
import { memo } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { colors } from './theme';

const STARS: [number, number, number][] = [
  [0.12, 0.06, 1.1], [0.82, 0.04, 0.9], [0.64, 0.14, 1.3], [0.28, 0.2, 0.8], [0.92, 0.27, 1],
  [0.06, 0.38, 0.9], [0.5, 0.33, 0.7], [0.75, 0.5, 1.1], [0.18, 0.62, 0.8], [0.9, 0.7, 0.9],
  [0.4, 0.78, 1], [0.08, 0.9, 1.2], [0.66, 0.92, 0.8],
];

export const MapBackdrop = memo(function MapBackdrop({ glow = colors.brass }: { glow?: string }) {
  const { width, height } = useWindowDimensions();
  const gridStep = 56;
  const vLines = Math.ceil(width / gridStep);
  const hLines = Math.ceil(height / gridStep);
  const contour = (k: number) => {
    const y = height * (0.18 + k * 0.17);
    return `M -20 ${y} C ${width * 0.25} ${y - 40 - k * 6}, ${width * 0.55} ${y + 50}, ${width + 20} ${y - 20 + k * 4}`;
  };
  return (
    <Svg pointerEvents="none" style={StyleSheet.absoluteFill} width={width} height={height}>
      <Defs>
        <LinearGradient id="bdglow" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={glow} stopOpacity={0.09} />
          <Stop offset="0.45" stopColor={colors.ink900} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={width} height={height} fill={colors.ink900} />
      <Rect x={0} y={0} width={width} height={height} fill="url(#bdglow)" />
      <G stroke={colors.mist} strokeOpacity={0.05} strokeWidth={1}>
        {Array.from({ length: vLines }, (_, i) => (
          <Line key={`v${i}`} x1={i * gridStep + 12} y1={0} x2={i * gridStep + 12} y2={height} />
        ))}
        {Array.from({ length: hLines }, (_, i) => (
          <Line key={`h${i}`} x1={0} y1={i * gridStep + 20} x2={width} y2={i * gridStep + 20} />
        ))}
      </G>
      <G stroke={colors.brass} strokeOpacity={0.06} strokeWidth={1.2} fill="none">
        {[0, 1, 2, 3, 4].map((k) => (
          <Path key={k} d={contour(k)} strokeDasharray={k % 2 ? '6 8' : undefined} />
        ))}
      </G>
      {STARS.map(([x, y, r], i) => (
        <Circle key={i} cx={x * width} cy={y * height} r={r} fill={colors.parchment} fillOpacity={0.35} />
      ))}
    </Svg>
  );
});
