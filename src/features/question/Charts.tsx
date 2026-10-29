/**
 * Gráficos de linhas e de setores dos enunciados (o de barras e a tabela ficam em StemBlocks).
 * Tudo em SVG estático, com resumo falado para leitores de tela.
 */
import { useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, G, Line, Path, Polyline, Text as SvgText } from 'react-native-svg';
import type { Block } from '../../content/types';
import { Text } from '../../ui/Text';
import { colors, fonts, radius, space } from '../../ui/theme';

const format = (n: number) => n.toLocaleString('pt-BR');

/** Escala "bonita" para o eixo vertical: limites e passo redondos (1, 2, 2,5, 5 × 10ⁿ). */
export function niceScale(min: number, max: number, ticks = 4) {
  const span = max - min || 1;
  const raw = span / ticks;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag;
  return { lo: Math.floor(min / step) * step, hi: Math.ceil(max / step) * step, step };
}

export function LineChart({ block }: { block: Extract<Block, { kind: 'line' }> }) {
  const [width, setWidth] = useState(0);
  const height = 210;
  const padL = 42;
  const padR = 26;
  const padT = 26;
  const padB = 30;
  const values = block.data.map((d) => d.value);
  const floor = block.yMin ?? Math.min(0, ...values);
  const { lo, hi, step } = niceScale(floor, Math.max(...values));
  const plotW = Math.max(0, width - padL - padR);
  const plotH = height - padT - padB;
  const n = block.data.length;
  const x = (i: number) => padL + (n === 1 ? plotW / 2 : (plotW * i) / (n - 1));
  const y = (v: number) => padT + plotH * (1 - (v - lo) / (hi - lo));
  const grid: number[] = [];
  for (let v = lo; v <= hi + step / 1000; v += step) grid.push(Math.round(v * 1000) / 1000);
  const showValues = block.showValues !== false;
  const summary = block.data.map((d) => `${d.label}: ${format(d.value)}`).join('; ');
  return (
    <View
      style={styles.chart}
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width - space.md * 2)}
      accessible
      accessibilityLabel={`${block.title ?? 'Gráfico de linhas'}${block.unit ? ` em ${block.unit}` : ''}. ${summary}`}
    >
      {block.title ? (
        <Text variant="label" color={colors.mist} style={styles.chartTitle}>
          {block.title}
        </Text>
      ) : null}
      {width > 0 ? (
        <Svg width={width} height={height}>
          {grid.map((v) => (
            <G key={v}>
              <Line x1={padL} y1={y(v)} x2={width - padR} y2={y(v)} stroke={colors.mist} strokeOpacity={v === lo ? 0.45 : 0.16} />
              <SvgText x={padL - 7} y={y(v) + 4} fill={colors.mist} fontSize={11} fontFamily={fonts.bodyMedium} textAnchor="end">
                {format(v)}
              </SvgText>
            </G>
          ))}
          <Polyline points={block.data.map((d, i) => `${x(i)},${y(d.value)}`).join(' ')} fill="none" stroke={colors.brass} strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round" />
          {block.data.map((d, i) => (
            <G key={d.label}>
              <Circle cx={x(i)} cy={y(d.value)} r={4} fill={colors.brass} stroke={colors.ink850} strokeWidth={1.5} />
              {showValues ? (
                <SvgText x={x(i)} y={y(d.value) - 10} fill={colors.parchment} fontSize={12} fontFamily={fonts.bodySemi} textAnchor="middle">
                  {format(d.value)}
                </SvgText>
              ) : null}
              <SvgText x={x(i)} y={height - 9} fill={colors.mist} fontSize={12} fontFamily={fonts.bodyMedium} textAnchor="middle">
                {d.label}
              </SvgText>
            </G>
          ))}
        </Svg>
      ) : (
        <View style={{ height }} />
      )}
      {block.unit ? (
        <Text variant="caption" color={colors.mistDim}>
          Eixo vertical: {block.unit}
        </Text>
      ) : null}
    </View>
  );
}

export const PIE_COLORS = ['#F2B54A', '#38D6B0', '#9B87FF', '#FF8A7A', '#7FB6FF', '#FF8FD1', '#D6FF6B', '#C9D1F0'];

/** Caminho de uma fatia entre dois ângulos (graus, 0 = topo, sentido horário). */
export function slicePath(cx: number, cy: number, r: number, from: number, to: number): string {
  const pt = (deg: number) => {
    const a = ((deg - 90) * Math.PI) / 180;
    return `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;
  };
  return `M${cx} ${cy} L${pt(from)} A${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${pt(to)} Z`;
}

export function PieChart({ block }: { block: Extract<Block, { kind: 'pie' }> }) {
  const [width, setWidth] = useState(0);
  const size = 196;
  const r = 84;
  const c = size / 2;
  const total = block.data.reduce((s, d) => s + d.value, 0);
  let acc = 0;
  const slices = block.data.map((d, i) => {
    const from = (acc / total) * 360;
    acc += d.value;
    return { ...d, from, to: (acc / total) * 360, color: PIE_COLORS[i % PIE_COLORS.length] };
  });
  const summary = block.data.map((d) => `${d.label}${d.text ? `: ${d.text}` : ''}`).join('; ');
  return (
    <View
      style={styles.chart}
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
      accessible
      accessibilityLabel={`${block.title ?? 'Gráfico de setores'}. ${summary}`}
    >
      {block.title ? (
        <Text variant="label" color={colors.mist} style={styles.chartTitle}>
          {block.title}
        </Text>
      ) : null}
      {width > 0 ? (
        <View style={{ alignItems: 'center' }}>
          <Svg width={size} height={size}>
            {slices.map((s) => {
              const mid = ((s.from + s.to) / 2 - 90) * (Math.PI / 180);
              const lx = c + r * 0.62 * Math.cos(mid);
              const ly = c + r * 0.62 * Math.sin(mid);
              return (
                <G key={s.label}>
                  <Path d={slicePath(c, c, r, s.from, s.to)} fill={s.color} fillOpacity={0.9} stroke={colors.ink850} strokeWidth={2} strokeLinejoin="round" />
                  {s.text && s.to - s.from >= 24 ? (
                    <SvgText x={lx} y={ly + 4.5} fill={colors.ink900} fontSize={13} fontFamily={fonts.bodySemi} textAnchor="middle">
                      {s.text}
                    </SvgText>
                  ) : null}
                </G>
              );
            })}
          </Svg>
        </View>
      ) : (
        <View style={{ height: size }} />
      )}
      <View style={styles.legend}>
        {slices.map((s) => (
          <View key={s.label} style={styles.legendItem}>
            <View style={[styles.swatch, { backgroundColor: s.color }]} />
            <Text variant="caption" color={colors.parchment}>
              {s.label}
              {s.text ? ` · ${s.text}` : ''}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chart: { backgroundColor: colors.ink850, borderRadius: radius.md, padding: space.md, borderWidth: 1, borderColor: colors.lineSoft, gap: space.xs },
  chartTitle: { marginBottom: space.sm },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.sm },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch: { width: 11, height: 11, borderRadius: 3 },
});
