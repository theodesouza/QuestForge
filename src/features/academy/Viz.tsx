/**
 * Visualizações dos laboratórios. Desenhos SVG simples (poucos nós, sem filtros) que se
 * redesenham a cada passo do controle — leves o bastante para Android intermediário.
 * Toda visualização tem uma descrição textual para leitores de tela.
 */
import { memo, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, G, Line, Path, Polygon, Polyline, Rect, Text as SvgText } from 'react-native-svg';
import { num } from '../../content/academy/kit/format';
import type { Tone, Viz as VizSpec } from '../../content/academy/types';
import { Text } from '../../ui/Text';
import { colors, fonts, radius, space } from '../../ui/theme';
import { SKY, TONE } from './look';

const tone = (t: Tone | undefined, fallback: string = colors.brass) => (t ? TONE[t] : fallback);
const label = { fontFamily: fonts.bodyMedium, fontSize: 11 };

/** Máximo "redondo" para eixos (1, 2, 2,5, 5 × 10ᵏ). */
export function niceMax(v: number): number {
  if (!(v > 0)) return 1;
  const k = Math.pow(10, Math.floor(Math.log10(v)));
  for (const m of [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (m * k >= v) return m * k;
  return 10 * k;
}

function Chart({ viz, width }: { viz: Extract<VizSpec, { kind: 'chart' }>; width: number }) {
  const H = 210;
  const L = 52;
  const R = 14;
  const T = 14;
  const B = 34;
  const ys = viz.series.flatMap((s) => s.points.map((p) => p[1])).filter(Number.isFinite);
  const yMin = viz.yMin ?? Math.min(0, ...ys);
  const yMax = viz.yMax ?? niceMax(Math.max(...ys, yMin + 1e-9));
  const span = yMax - yMin || 1;
  const xSpan = viz.xMax - viz.xMin || 1;
  const x = (v: number) => L + ((v - viz.xMin) / xSpan) * (width - L - R);
  const y = (v: number) => T + (1 - (Math.min(yMax, Math.max(yMin, v)) - yMin) / span) * (H - T - B);
  const fx = viz.xFormat ?? ((v: number) => num(v, 1));
  const fy = viz.yFormat ?? ((v: number) => num(v, 1));
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((k) => yMin + k * span);
  const xTicks = [0, 0.25, 0.5, 0.75, 1].map((k) => viz.xMin + k * xSpan);
  return (
    <View>
      <Svg width={width} height={H}>
        {yTicks.map((v, i) => (
          <G key={`y${i}`}>
            <Line x1={L} y1={y(v)} x2={width - R} y2={y(v)} stroke={colors.mist} strokeOpacity={i === 0 ? 0.45 : 0.12} />
            <SvgText x={L - 6} y={y(v) + 4} fill={colors.mist} textAnchor="end" {...label}>
              {fy(v)}
            </SvgText>
          </G>
        ))}
        {xTicks.map((v, i) => (
          <SvgText key={`x${i}`} x={x(v)} y={H - B + 16} fill={colors.mist} textAnchor="middle" {...label}>
            {fx(v)}
          </SvgText>
        ))}
        <SvgText x={width - R} y={H - 4} fill={colors.mistDim} textAnchor="end" {...label}>
          {viz.xLabel}
        </SvgText>
        {viz.series.map((s) => {
          const d = s.points.map(([px, py], i) => `${i === 0 ? 'M' : 'L'} ${x(px).toFixed(1)} ${y(py).toFixed(1)}`).join(' ');
          return (
            <G key={s.label}>
              <Path d={d} stroke={tone(s.tone)} strokeWidth={2.4} fill="none" strokeDasharray={s.dashed ? '6 5' : undefined} strokeLinejoin="round" />
              {s.dots ? s.points.map(([px, py], i) => <Circle key={i} cx={x(px)} cy={y(py)} r={3.2} fill={tone(s.tone)} />) : null}
            </G>
          );
        })}
        {(viz.markers ?? []).map((m, i) => (
          <G key={`m${i}`}>
            <Line x1={x(m.x)} y1={y(m.y)} x2={x(m.x)} y2={H - B} stroke={tone(m.tone)} strokeOpacity={0.5} strokeDasharray="3 4" />
            <Circle cx={x(m.x)} cy={y(m.y)} r={5} fill={colors.ink900} stroke={tone(m.tone)} strokeWidth={2} />
            <SvgText x={Math.min(width - R, Math.max(L, x(m.x)))} y={Math.max(12, y(m.y) - 10)} fill={tone(m.tone)} textAnchor={x(m.x) > width * 0.7 ? 'end' : x(m.x) < width * 0.3 ? 'start' : 'middle'} {...label} fontFamily={fonts.bodySemi}>
              {m.label}
            </SvgText>
          </G>
        ))}
      </Svg>
      <View style={styles.legend}>
        {viz.series.map((s) => (
          <View key={s.label} style={styles.legendItem}>
            <View style={[styles.swatch, { backgroundColor: tone(s.tone) }, s.dashed && styles.dashed]} />
            <Text variant="caption" color={colors.mist}>
              {s.label}
            </Text>
          </View>
        ))}
        <Text variant="caption" color={colors.mistDim} style={styles.axisNote}>
          {viz.yLabel}
        </Text>
      </View>
    </View>
  );
}

function Bars({ viz, width }: { viz: Extract<VizSpec, { kind: 'bars' }>; width: number }) {
  const H = 190;
  const T = 24;
  const B = 34;
  const max = viz.max ?? niceMax(Math.max(...viz.bars.map((b) => b.value), viz.refLine?.value ?? 0));
  const n = viz.bars.length;
  const slot = width / n;
  const barW = Math.min(54, slot * 0.6);
  const y = (v: number) => H - B - ((H - T - B) * Math.max(0, v)) / (max || 1);
  return (
    <Svg width={width} height={H}>
      <Line x1={0} y1={H - B} x2={width} y2={H - B} stroke={colors.mist} strokeOpacity={0.4} />
      {viz.refLine ? (
        <G>
          <Line x1={0} y1={y(viz.refLine.value)} x2={width} y2={y(viz.refLine.value)} stroke={colors.parchmentDim} strokeDasharray="5 5" strokeOpacity={0.6} />
          <SvgText x={width - 2} y={y(viz.refLine.value) - 5} fill={colors.parchmentDim} textAnchor="end" {...label}>
            {viz.refLine.label}
          </SvgText>
        </G>
      ) : null}
      {viz.bars.map((b, i) => {
        const x = slot * i + (slot - barW) / 2;
        const top = y(b.value);
        return (
          <G key={`${b.label}${i}`}>
            <Rect x={x} y={top} width={barW} height={Math.max(0, H - B - top)} rx={5} fill={tone(b.tone)} fillOpacity={0.88} />
            <SvgText x={x + barW / 2} y={top - 7} fill={colors.parchment} textAnchor="middle" {...label} fontFamily={fonts.bodySemi}>
              {b.text ?? num(b.value, 2)}
            </SvgText>
            <SvgText x={x + barW / 2} y={H - 12} fill={colors.mist} textAnchor="middle" {...label}>
              {b.label}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
}

function sector(cx: number, cy: number, r: number, a0: number, a1: number): string {
  const p = (a: number) => [cx + r * Math.sin(a), cy - r * Math.cos(a)];
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M ${cx} ${cy} L ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`;
}

function Fraction({ viz, width }: { viz: Extract<VizSpec, { kind: 'fraction' }>; width: number }) {
  const wholes = Math.max(1, viz.wholes ?? 1);
  const color = tone(viz.tone);
  if (viz.shape === 'bar') {
    const rowH = 34;
    const H = wholes * (rowH + 10);
    const cell = width / viz.parts;
    return (
      <Svg width={width} height={H}>
        {Array.from({ length: wholes }, (_, w) =>
          Array.from({ length: viz.parts }, (_, k) => {
            const on = w * viz.parts + k < viz.filled;
            return <Rect key={`${w}-${k}`} x={k * cell + 1} y={w * (rowH + 10) + 1} width={cell - 2} height={rowH} rx={4} fill={on ? color : colors.ink700} stroke={colors.ink900} />;
          }),
        )}
      </Svg>
    );
  }
  const r = Math.min(68, (width / wholes - 16) / 2);
  const H = 2 * r + 12;
  const step = (2 * Math.PI) / viz.parts;
  return (
    <Svg width={width} height={H}>
      {Array.from({ length: wholes }, (_, w) => {
        const cx = (width / wholes) * (w + 0.5);
        const cy = r + 6;
        return (
          <G key={w}>
            <Circle cx={cx} cy={cy} r={r} fill={colors.ink700} />
            {Array.from({ length: viz.parts }, (_, k) => {
              const on = w * viz.parts + k < viz.filled;
              return viz.parts === 1 ? (
                <Circle key={k} cx={cx} cy={cy} r={r} fill={on ? color : colors.ink700} stroke={colors.ink900} strokeWidth={2} />
              ) : (
                <Path key={k} d={sector(cx, cy, r, k * step, (k + 1) * step)} fill={on ? color : colors.ink700} stroke={colors.ink900} strokeWidth={2} />
              );
            })}
          </G>
        );
      })}
    </Svg>
  );
}

function Grid({ viz, width }: { viz: Extract<VizSpec, { kind: 'grid' }>; width: number }) {
  const cell = Math.min(28, Math.floor(width / viz.cols));
  const W = cell * viz.cols;
  const H = cell * viz.rows;
  return (
    <View style={{ alignItems: 'center', gap: space.sm }}>
      <Svg width={W} height={H}>
        {viz.cells.map((c, i) => (
          <Rect
            key={i}
            x={(i % viz.cols) * cell + 1}
            y={Math.floor(i / viz.cols) * cell + 1}
            width={cell - 2}
            height={cell - 2}
            rx={Math.min(4, cell / 5)}
            fill={c ? TONE[c] : colors.ink700}
          />
        ))}
      </Svg>
      <View style={styles.legend}>
        {viz.legend.map((l) => (
          <View key={l.label} style={styles.legendItem}>
            <View style={[styles.swatch, { backgroundColor: TONE[l.tone] }]} />
            <Text variant="caption" color={colors.mist}>
              {l.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function Parts({ viz, width }: { viz: Extract<VizSpec, { kind: 'parts' }>; width: number }) {
  const total = viz.segments.reduce((s, x) => s + Math.max(0, x.value), 0) || 1;
  const widths = viz.segments.map((s) => (Math.max(0, s.value) / total) * width);
  const starts = widths.map((_, i) => widths.slice(0, i).reduce((a, b) => a + b, 0));
  return (
    <View style={{ gap: space.sm }}>
      <Svg width={width} height={40}>
        {viz.segments.map((s, i) => (
          <Rect key={i} x={starts[i] + 1} y={4} width={Math.max(0, widths[i] - 2)} height={32} rx={6} fill={TONE[s.tone]} fillOpacity={0.9} />
        ))}
      </Svg>
      <View style={styles.legend}>
        {viz.segments.map((s) => (
          <View key={s.label} style={styles.legendItem}>
            <View style={[styles.swatch, { backgroundColor: TONE[s.tone] }]} />
            <Text variant="caption" color={colors.mist}>
              {s.label}: {num((100 * Math.max(0, s.value)) / total, 1)}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function NumberLine({ viz, width }: { viz: Extract<VizSpec, { kind: 'numberline' }>; width: number }) {
  const H = 120;
  const P = 18;
  const base = 80;
  const span = viz.max - viz.min || 1;
  const x = (v: number) => P + ((v - viz.min) / span) * (width - 2 * P);
  const step = viz.step ?? niceMax(span / 10);
  const ticks: number[] = [];
  for (let v = Math.ceil(viz.min / step) * step; v <= viz.max + 1e-9; v += step) ticks.push(Math.round(v * 1e9) / 1e9);
  return (
    <Svg width={width} height={H}>
      <Line x1={P - 8} y1={base} x2={width - P + 8} y2={base} stroke={colors.mist} strokeOpacity={0.6} strokeWidth={1.5} />
      {ticks.map((v) => (
        <G key={v}>
          <Line x1={x(v)} y1={base - 5} x2={x(v)} y2={base + 5} stroke={colors.mist} strokeOpacity={v === 0 ? 0.9 : 0.5} strokeWidth={v === 0 ? 2 : 1} />
          {ticks.length <= 16 ? (
            <SvgText x={x(v)} y={base + 20} fill={colors.mist} textAnchor="middle" {...label}>
              {num(v, 2)}
            </SvgText>
          ) : null}
        </G>
      ))}
      {(viz.arrows ?? []).map((a, i) => {
        const x0 = x(a.from);
        const x1 = x(a.to);
        const mid = (x0 + x1) / 2;
        const lift = 26 + i * 10;
        const dir = x1 >= x0 ? 1 : -1;
        return (
          <G key={`a${i}`}>
            <Path d={`M ${x0} ${base - 6} Q ${mid} ${base - lift * 1.6} ${x1} ${base - 6}`} stroke={tone(a.tone)} strokeWidth={2} fill="none" />
            <Polygon points={`${x1},${base - 4} ${x1 - 7 * dir},${base - 12} ${x1 - 1 * dir},${base - 14}`} fill={tone(a.tone)} />
            <SvgText x={mid} y={base - lift * 0.9 - 6} fill={tone(a.tone)} textAnchor="middle" {...label} fontFamily={fonts.bodySemi}>
              {a.label}
            </SvgText>
          </G>
        );
      })}
      {viz.points.map((p, i) => (
        <G key={`p${i}`}>
          <Circle cx={x(p.value)} cy={base} r={6} fill={tone(p.tone)} stroke={colors.ink900} strokeWidth={2} />
          <SvgText x={x(p.value)} y={base + 36} fill={tone(p.tone)} textAnchor="middle" {...label} fontFamily={fonts.bodySemi}>
            {p.label}
          </SvgText>
        </G>
      ))}
    </Svg>
  );
}

function Dots({ viz, width }: { viz: Extract<VizSpec, { kind: 'dots' }>; width: number }) {
  const P = 18;
  const base = 96;
  const span = viz.max - viz.min || 1;
  const x = (v: number) => P + ((v - viz.min) / span) * (width - 2 * P);
  const stack = new Map<number, number>();
  const placed = viz.values.map((v) => {
    const k = Math.round(v * 100) / 100;
    const n = stack.get(k) ?? 0;
    stack.set(k, n + 1);
    return { v, n };
  });
  const H = base + 40;
  return (
    <Svg width={width} height={H}>
      <Line x1={P - 6} y1={base + 8} x2={width - P + 6} y2={base + 8} stroke={colors.mist} strokeOpacity={0.5} />
      {placed.map(({ v, n }, i) => (
        <Circle key={i} cx={x(v)} cy={base - n * 13} r={5.5} fill={colors.parchment} fillOpacity={0.9} />
      ))}
      {viz.marks.map((m, i) => (
        <G key={`m${i}`}>
          <Line x1={x(m.value)} y1={8 + i * 12} x2={x(m.value)} y2={base + 8} stroke={tone(m.tone)} strokeWidth={2} strokeDasharray={i % 2 ? '4 4' : undefined} />
          <SvgText x={Math.min(width - 4, Math.max(4, x(m.value)))} y={base + 26 + i * 12} fill={tone(m.tone)} textAnchor="middle" {...label} fontFamily={fonts.bodySemi}>
            {m.label}
          </SvgText>
        </G>
      ))}
    </Svg>
  );
}

function Timeline({ viz, width }: { viz: Extract<VizSpec, { kind: 'timeline' }>; width: number }) {
  const L = 84;
  const R = 12;
  const rowH = 30;
  const H = viz.tracks.length * rowH + 42;
  const x = (t: number) => L + (t / (viz.length || 1)) * (width - L - R);
  const events = viz.tracks.map((tr) => {
    const out: number[] = [];
    for (let t = tr.offset ?? 0; t <= viz.length + 1e-9; t += tr.period) out.push(Math.round(t * 1e6) / 1e6);
    return out;
  });
  const together = events[0]?.filter((t) => events.every((list) => list.includes(t))) ?? [];
  return (
    <Svg width={width} height={H}>
      {together.map((t) => (
        <G key={`c${t}`}>
          <Rect x={x(t) - 7} y={4} width={14} height={viz.tracks.length * rowH + 4} rx={7} fill={colors.brass} fillOpacity={0.16} />
          <SvgText x={x(t)} y={viz.tracks.length * rowH + 24} fill={colors.brass} textAnchor="middle" {...label} fontFamily={fonts.bodySemi}>
            {num(t)}
          </SvgText>
        </G>
      ))}
      {viz.tracks.map((tr, k) => (
        <G key={tr.label}>
          <SvgText x={4} y={k * rowH + 24} fill={tone(tr.tone)} {...label} fontFamily={fonts.bodySemi}>
            {tr.label}
          </SvgText>
          <Line x1={L} y1={k * rowH + 20} x2={width - R} y2={k * rowH + 20} stroke={colors.mist} strokeOpacity={0.25} />
          {events[k].map((t) => (
            <Circle key={t} cx={x(t)} cy={k * rowH + 20} r={4.5} fill={tone(tr.tone)} />
          ))}
        </G>
      ))}
      <SvgText x={width - R} y={H - 4} fill={colors.mistDim} textAnchor="end" {...label}>
        {viz.unit}
      </SvgText>
    </Svg>
  );
}

function Shape({ viz, width }: { viz: Extract<VizSpec, { kind: 'shape' }>; width: number }) {
  const H = 200;
  const lbl = (t: string | undefined, x: number, y: number, anchor: 'start' | 'middle' | 'end' = 'middle', color: string = colors.brass) =>
    t ? (
      <SvgText x={x} y={y} fill={color} textAnchor={anchor} fontFamily={fonts.bodySemi} fontSize={12.5}>
        {t}
      </SvgText>
    ) : null;
  const [d0 = 1, d1 = 1, d2 = 1] = viz.dims;
  const [l0, l1, l2, l3] = viz.labels;
  switch (viz.shape) {
    case 'rect': {
      const k = Math.min((width - 70) / d0, (H - 50) / d1);
      const w = d0 * k;
      const h = d1 * k;
      const x = (width - w) / 2;
      const y = (H - h) / 2 - 6;
      return (
        <Svg width={width} height={H}>
          <Rect x={x} y={y} width={w} height={h} fill={colors.brass} fillOpacity={0.14} stroke={colors.parchment} strokeWidth={2} />
          {lbl(l0, x + w / 2, y + h + 18)}
          {lbl(l1, x - 8, y + h / 2 + 4, 'end')}
          {lbl(l2, x + w / 2, y + h / 2 + 4, 'middle', colors.parchment)}
        </Svg>
      );
    }
    case 'triangle': {
      const k = Math.min((width - 90) / d0, (H - 50) / d1);
      const a = d0 * k;
      const b = d1 * k;
      const x0 = (width - a) / 2;
      const y0 = (H + b) / 2 - 6;
      return (
        <Svg width={width} height={H}>
          <Polygon points={`${x0},${y0} ${x0 + a},${y0} ${x0 + a},${y0 - b}`} fill={colors.verdigris} fillOpacity={0.14} stroke={colors.parchment} strokeWidth={2} strokeLinejoin="round" />
          <Polyline points={`${x0 + a - 12},${y0} ${x0 + a - 12},${y0 - 12} ${x0 + a},${y0 - 12}`} stroke={colors.parchment} strokeWidth={1.2} fill="none" />
          {lbl(l0, x0 + a / 2, y0 + 18)}
          {lbl(l1, x0 + a + 8, y0 - b / 2 + 4, 'start')}
          {lbl(l2, x0 + a / 2 - 10, y0 - b / 2 - 8, 'end', colors.parchment)}
        </Svg>
      );
    }
    case 'circle':
    case 'ring':
    case 'sector': {
      const R = Math.min(width / 2 - 20, H / 2 - 14);
      const cx = width / 2;
      const cy = H / 2;
      const inner = viz.shape === 'ring' ? (R * d1) / d0 : 0;
      return (
        <Svg width={width} height={H}>
          {viz.shape === 'sector' ? (
            <>
              <Circle cx={cx} cy={cy} r={R} fill={colors.ink700} stroke={colors.parchment} strokeWidth={1.5} />
              {(viz.fill ?? 0) >= 1 ? (
                <Circle cx={cx} cy={cy} r={R} fill={colors.brass} fillOpacity={0.4} />
              ) : (
                <Path d={sector(cx, cy, R, 0, 2 * Math.PI * Math.max(0.0001, viz.fill ?? 0))} fill={colors.brass} fillOpacity={0.45} stroke={colors.brass} strokeWidth={1.5} />
              )}
            </>
          ) : (
            <>
              <Circle cx={cx} cy={cy} r={R} fill={colors.brass} fillOpacity={viz.shape === 'ring' ? 0.32 : 0.14} stroke={colors.parchment} strokeWidth={2} />
              {inner > 0 ? <Circle cx={cx} cy={cy} r={inner} fill={colors.ink850} stroke={colors.parchment} strokeWidth={1.5} /> : null}
            </>
          )}
          <Line x1={cx} y1={cy} x2={cx + R} y2={cy} stroke={colors.verdigris} strokeWidth={2} />
          <Circle cx={cx} cy={cy} r={3} fill={colors.verdigris} />
          {lbl(l0, cx + R / 2, cy - 8, 'middle', colors.verdigris)}
          {lbl(l1, cx, cy + R * 0.55, 'middle', colors.parchment)}
          {lbl(l2, cx, 14, 'middle', colors.mist)}
        </Svg>
      );
    }
    case 'box': {
      const depth = 0.5;
      const k = Math.min((width - 80) / (d0 + d1 * depth), (H - 40) / (d2 + d1 * depth));
      const w = d0 * k;
      const h = d2 * k;
      const dx = d1 * k * depth;
      const dy = d1 * k * depth * 0.6;
      const x = (width - w - dx) / 2;
      const y = (H - h + dy) / 2;
      const level = Math.max(0, Math.min(1, viz.fill ?? 0)) * h;
      return (
        <Svg width={width} height={H}>
          {level > 0 ? <Rect x={x} y={y + h - level} width={w} height={level} fill={SKY} fillOpacity={0.35} /> : null}
          <G stroke={colors.parchment} strokeWidth={1.8} strokeLinejoin="round" fill="none">
            <Rect x={x} y={y} width={w} height={h} />
            <Polygon points={`${x},${y} ${x + dx},${y - dy} ${x + w + dx},${y - dy} ${x + w},${y}`} />
            <Polygon points={`${x + w},${y} ${x + w + dx},${y - dy} ${x + w + dx},${y + h - dy} ${x + w},${y + h}`} />
          </G>
          {lbl(l0, x + w / 2, y + h + 18)}
          {lbl(l1, x + w + dx / 2 + 10, y + h - dy / 2 + 4, 'start')}
          {lbl(l2, x - 8, y + h / 2 + 4, 'end')}
          {lbl(l3, x + w / 2, y + h - level / 2 + 4, 'middle', colors.parchment)}
        </Svg>
      );
    }
    case 'cylinder': {
      // Reserva 22 px acima (rótulo do raio) e abaixo (rótulo da base), além das elipses.
      const k = Math.min((width - 90) / (2 * d0), (H - 56) / (d1 + 0.56 * d0));
      const r = d0 * k;
      const h = d1 * k;
      const ry = Math.max(6, r * 0.28);
      const cx = width / 2;
      const top = 22 + ry + (H - (44 + 2 * ry + h)) / 2;
      const level = Math.max(0, Math.min(1, viz.fill ?? 0)) * h;
      return (
        <Svg width={width} height={H}>
          {level > 0 ? (
            <Path d={`M ${cx - r} ${top + h - level} L ${cx - r} ${top + h} A ${r} ${ry} 0 0 0 ${cx + r} ${top + h} L ${cx + r} ${top + h - level} A ${r} ${ry} 0 0 1 ${cx - r} ${top + h - level} Z`} fill={SKY} fillOpacity={0.35} />
          ) : null}
          <G stroke={colors.parchment} strokeWidth={1.8} fill="none">
            <Path d={`M ${cx - r} ${top} A ${r} ${ry} 0 0 0 ${cx + r} ${top} A ${r} ${ry} 0 0 0 ${cx - r} ${top}`} />
            <Line x1={cx - r} y1={top} x2={cx - r} y2={top + h} />
            <Line x1={cx + r} y1={top} x2={cx + r} y2={top + h} />
            <Path d={`M ${cx - r} ${top + h} A ${r} ${ry} 0 0 0 ${cx + r} ${top + h}`} />
          </G>
          <Line x1={cx} y1={top} x2={cx + r} y2={top} stroke={colors.verdigris} strokeWidth={2} />
          {lbl(l0, cx + r / 2, top - ry - 6, 'middle', colors.verdigris)}
          {lbl(l1, cx + r + 8, top + h / 2 + 4, 'start')}
          {lbl(l2, cx, top + h + ry + 16, 'middle', colors.parchment)}
        </Svg>
      );
    }
  }
}

export const Viz = memo(function Viz({ viz }: { viz: VizSpec }) {
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(Math.floor(e.nativeEvent.layout.width));
  return (
    <View style={styles.wrap} onLayout={onLayout} accessible accessibilityLabel={viz.summary}>
      {width > 0 ? (
        viz.kind === 'chart' ? (
          <Chart viz={viz} width={width} />
        ) : viz.kind === 'bars' ? (
          <Bars viz={viz} width={width} />
        ) : viz.kind === 'fraction' ? (
          <Fraction viz={viz} width={width} />
        ) : viz.kind === 'grid' ? (
          <Grid viz={viz} width={width} />
        ) : viz.kind === 'parts' ? (
          <Parts viz={viz} width={width} />
        ) : viz.kind === 'numberline' ? (
          <NumberLine viz={viz} width={width} />
        ) : viz.kind === 'dots' ? (
          <Dots viz={viz} width={width} />
        ) : viz.kind === 'timeline' ? (
          <Timeline viz={viz} width={width} />
        ) : (
          <Shape viz={viz} width={width} />
        )
      ) : (
        <View style={{ height: 120 }} />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.ink850, borderRadius: radius.md, padding: space.md, borderWidth: 1, borderColor: colors.lineSoft },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md, marginTop: space.xs, alignItems: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch: { width: 14, height: 4, borderRadius: 2 },
  dashed: { opacity: 0.6 },
  axisNote: { marginLeft: 'auto' },
});
