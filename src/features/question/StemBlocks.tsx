import { memo, useState } from 'react';
import { ScrollView, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, { G, Line, Rect, Text as SvgText } from 'react-native-svg';
import type { Block } from '../../content/types';
import { Text } from '../../ui/Text';
import { colors, fonts, radius, space } from '../../ui/theme';
import { Figure } from './figures';

function formatNumber(n: number): string {
  return n.toLocaleString('pt-BR');
}

function Bars({ block }: { block: Extract<Block, { kind: 'bars' }> }) {
  const [width, setWidth] = useState(0);
  const height = 190;
  const top = 26;
  const bottom = 28;
  const max = Math.max(...block.data.map((d) => d.value));
  const n = block.data.length;
  const slot = width / n;
  const barW = Math.min(44, slot * 0.58);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);
  const summary = block.data.map((d) => `${d.label}: ${formatNumber(d.value)}`).join('; ');
  return (
    <View style={styles.chart} onLayout={onLayout} accessible accessibilityLabel={`${block.title ?? 'Gráfico de barras'}. ${summary}`}>
      {block.title ? (
        <Text variant="label" color={colors.mist} style={styles.chartTitle}>
          {block.title}
        </Text>
      ) : null}
      {width > 0 ? (
        <Svg width={width} height={height}>
          <Line x1={0} y1={height - bottom} x2={width} y2={height - bottom} stroke={colors.mist} strokeOpacity={0.4} />
          {block.data.map((d, i) => {
            const h = ((height - top - bottom) * d.value) / max;
            const x = slot * i + (slot - barW) / 2;
            const y = height - bottom - h;
            return (
              <G key={d.label}>
                <Rect x={x} y={y} width={barW} height={h} rx={5} fill={colors.brass} fillOpacity={0.85} />
                <SvgText x={x + barW / 2} y={y - 7} fill={colors.parchment} fontSize={12.5} fontFamily={fonts.bodySemi} textAnchor="middle">
                  {formatNumber(d.value)}
                </SvgText>
                <SvgText x={x + barW / 2} y={height - 9} fill={colors.mist} fontSize={12} fontFamily={fonts.bodyMedium} textAnchor="middle">
                  {d.label}
                </SvgText>
              </G>
            );
          })}
        </Svg>
      ) : (
        <View style={{ height }} />
      )}
    </View>
  );
}

function Table({ block }: { block: Extract<Block, { kind: 'table' }> }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tableWrap}>
      <View style={styles.table} accessibilityRole="summary">
        <View style={[styles.row, styles.headRow]}>
          {block.header.map((h, i) => (
            <View key={i} style={[styles.cell, i === 0 && styles.firstCell]}>
              <Text variant="label" color={colors.brass}>
                {h}
              </Text>
            </View>
          ))}
        </View>
        {block.rows.map((r, ri) => (
          <View key={ri} style={[styles.row, ri % 2 === 1 && styles.altRow]}>
            {r.map((c, ci) => (
              <View key={ci} style={[styles.cell, ci === 0 && styles.firstCell]}>
                <Text variant={ci === 0 ? 'bodyStrong' : 'body'}>{c}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

export const StemBlocks = memo(function StemBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <View style={styles.stem}>
      {blocks.map((b, i) => {
        switch (b.kind) {
          case 'p':
            return (
              <Text key={i} variant="question">
                {b.text}
              </Text>
            );
          case 'math':
            return (
              <View key={i} style={styles.math}>
                {b.lines.map((l, j) => (
                  <Text key={j} variant="ask" align="center" style={styles.mathLine}>
                    {l}
                  </Text>
                ))}
              </View>
            );
          case 'table':
            return <Table key={i} block={b} />;
          case 'bars':
            return <Bars key={i} block={b} />;
          case 'figure':
            return (
              <View key={i} style={styles.figure} accessible accessibilityLabel={b.caption ?? 'Figura do enunciado'}>
                <Figure id={b.id} />
                {b.caption ? (
                  <Text variant="caption" color={colors.mist} align="center">
                    {b.caption}
                  </Text>
                ) : null}
              </View>
            );
        }
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  stem: { gap: space.lg },
  math: {
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    borderRadius: radius.md,
    backgroundColor: colors.ink850,
    borderWidth: 1,
    borderColor: colors.lineSoft,
  },
  mathLine: { fontSize: 18, letterSpacing: 0.4 },
  chart: { backgroundColor: colors.ink850, borderRadius: radius.md, padding: space.md, borderWidth: 1, borderColor: colors.lineSoft },
  chartTitle: { marginBottom: space.sm },
  tableWrap: { flexGrow: 1 },
  table: { flexGrow: 1, borderRadius: radius.md, overflow: 'hidden', borderWidth: 1, borderColor: colors.lineSoft },
  row: { flexDirection: 'row', backgroundColor: colors.ink850 },
  headRow: { backgroundColor: colors.ink700 },
  altRow: { backgroundColor: colors.ink800 },
  cell: { minWidth: 64, flexGrow: 1, flexBasis: 0, paddingVertical: 10, paddingHorizontal: 10, justifyContent: 'center' },
  firstCell: { minWidth: 96 },
  figure: { backgroundColor: colors.ink850, borderRadius: radius.md, padding: space.md, gap: space.sm, borderWidth: 1, borderColor: colors.lineSoft },
});
