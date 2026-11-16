/**
 * Fundo de todas as telas: espaço profundo. Um degradê do alto, duas nuvens tênues na cor do
 * lugar (`glow`), um campo de estrelas em três tamanhos e algumas órbitas finas — o mesmo céu do
 * Áster, bem mais discreto, para o conteúdo continuar na frente.
 * Estático e memoizado: custo de renderização desprezível.
 */
import { memo, useMemo } from 'react';
import { Platform, StyleSheet, useWindowDimensions, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';
import { colors } from './theme';

/** Sorteio fixo: o céu é sempre o mesmo, em qualquer tela e a cada abertura. */
function field(seed: number, n: number): [number, number, number][] {
  let a = seed >>> 0;
  const r = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return Array.from({ length: n }, () => [r(), r(), r()]);
}

// No navegador o fundo se prende à janela: assim ele continua de ponta a ponta mesmo quando a tela
// que o contém é uma coluna centrada (layout largo).
const FILL = Platform.OS === 'web' ? ({ position: 'fixed', left: 0, top: 0 } as unknown as ViewStyle) : StyleSheet.absoluteFill;

const DUST = field(7, 46);
const BRIGHT = field(19, 9);

export const MapBackdrop = memo(function MapBackdrop({ glow = colors.brass }: { glow?: string }) {
  const { width, height } = useWindowDimensions();
  const orbits = useMemo(
    () =>
      [
        { cx: width * 0.86, cy: height * 0.12, rx: width * 0.74, ry: width * 0.26, rot: -22, o: 0.07 },
        { cx: width * 0.86, cy: height * 0.12, rx: width * 1.02, ry: width * 0.38, rot: -22, o: 0.045 },
        { cx: width * 0.08, cy: height * 0.82, rx: width * 0.8, ry: width * 0.3, rot: 18, o: 0.05 },
      ] as const,
    [width, height],
  );
  return (
    <Svg pointerEvents="none" style={FILL} width={width} height={height}>
      <Defs>
        <LinearGradient id="bdsky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#0D1330" />
          <Stop offset="0.5" stopColor={colors.ink900} />
          <Stop offset="1" stopColor="#080B18" />
        </LinearGradient>
        <RadialGradient id="bdglow" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={glow} stopOpacity={0.13} />
          <Stop offset="1" stopColor={glow} stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id="bdcool" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={colors.iris} stopOpacity={0.09} />
          <Stop offset="1" stopColor={colors.iris} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect x={0} y={0} width={width} height={height} fill="url(#bdsky)" />
      <Ellipse cx={width * 0.82} cy={height * 0.1} rx={width * 0.9} ry={height * 0.3} fill="url(#bdglow)" />
      <Ellipse cx={width * 0.1} cy={height * 0.78} rx={width * 0.8} ry={height * 0.28} fill="url(#bdcool)" />
      <G fill="none" stroke={colors.parchment} strokeWidth={1}>
        {orbits.map((o, i) => (
          <Ellipse key={i} cx={o.cx} cy={o.cy} rx={o.rx} ry={o.ry} strokeOpacity={o.o} strokeDasharray={i === 1 ? '2 7' : undefined} transform={`rotate(${o.rot} ${o.cx} ${o.cy})`} />
        ))}
      </G>
      <G fill={colors.parchment}>
        {DUST.map(([x, y, s], i) => (
          <Circle key={i} cx={x * width} cy={y * height} r={0.5 + s * 0.7} fillOpacity={0.14 + s * 0.26} />
        ))}
      </G>
      {BRIGHT.map(([x, y, s], i) => (
        <G key={i}>
          <Circle cx={x * width} cy={y * height} r={3 + s * 2} fill={i % 3 ? '#BFD6FF' : '#FFE2B8'} fillOpacity={0.07} />
          <Circle cx={x * width} cy={y * height} r={1 + s * 0.6} fill={i % 3 ? '#DCE8FF' : '#FFF0D6'} fillOpacity={0.6} />
        </G>
      ))}
    </Svg>
  );
});
