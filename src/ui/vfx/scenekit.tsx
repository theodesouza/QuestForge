/**
 * Peças comuns dos cenários (paisagens de 300 × 300 unidades): céu, brilho, estrelas e as camadas
 * animadas (cintilar, partículas, deriva, pulso, giro). Usadas por scenes.tsx e skies.tsx.
 */
import { useMemo, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import Svg, { Circle, Defs, G, LinearGradient, Polygon, RadialGradient, Rect, Stop } from 'react-native-svg';
import type { ItemVisual } from '../../content/items';
import { useFx, useLoop } from './engine';

export const W = 300;
export const TAU = Math.PI * 2;
export const fill = StyleSheet.absoluteFill;

// ————————————————————————————————————————————————————— utilidades de desenho

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Box = readonly [number, number, number, number];

export function scatter(seed: number, n: number, box: Box) {
  const r = rng(seed);
  return Array.from({ length: n }, () => ({ x: box[0] + (box[2] - box[0]) * r(), y: box[1] + (box[3] - box[1]) * r(), s: r() }));
}

export function Sky({ id, stops }: { id: string; stops: [number, string][] }) {
  return (
    <>
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          {stops.map(([o, c]) => (
            <Stop key={o} offset={o} stopColor={c} />
          ))}
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={W} height={W} fill={`url(#${id})`} />
    </>
  );
}

export function Glow({ id, x, y, r, color, opacity = 0.3 }: { id: string; x: number; y: number; r: number; color: string; opacity?: number }) {
  return (
    <>
      <Defs>
        <RadialGradient id={id} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={color} stopOpacity={opacity} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={x} cy={y} r={r} fill={`url(#${id})`} />
    </>
  );
}

export function Stars({ seed, n, box, color = '#FFFFFF', max = 1.3 }: { seed: number; n: number; box: Box; color?: string; max?: number }) {
  return (
    <G fill={color}>
      {scatter(seed, n, box).map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y} r={0.5 + p.s * (max - 0.5)} fillOpacity={0.45 + 0.5 * p.s} />
      ))}
    </G>
  );
}

export function crescentPath(cx: number, cy: number, r: number) {
  return `M${cx} ${cy - r} A${r} ${r} 0 1 0 ${cx} ${cy + r} A${r * 0.78} ${r * 0.78} 0 1 1 ${cx} ${cy - r} Z`;
}

/** Pinheiro: três camadas de triângulos sobre um tronco. */
export function Pine({ x, base, h, w, color }: { x: number; base: number; h: number; w: number; color: string }) {
  const tiers = [0, 1, 2].map((i) => {
    const top = base - h + (i * h) / 3.4;
    const bottom = base - h * (1 - (i + 1.4) / 3.4);
    const half = (w / 2) * (0.5 + i * 0.28);
    return `${x},${top} ${x + half},${bottom} ${x - half},${bottom}`;
  });
  return (
    <G fill={color}>
      <Rect x={x - w * 0.05} y={base - h * 0.16} width={w * 0.1} height={h * 0.16} />
      {tiers.map((p, i) => (
        <Polygon key={i} points={p} />
      ))}
    </G>
  );
}

// ————————————————————————————————————————————————————— camadas animadas

export function useUnit() {
  return useFx().px / W;
}

export interface Spot {
  x: number;
  y: number;
  d: number;
  phase: number;
  speed: number;
  color: string;
}

export function useSpots(count: number, seed: number, box: Box, size: [number, number], colors: string[]): Spot[] {
  const { density } = useFx();
  const n = Math.max(2, Math.round(count * density));
  const key = [n, seed, box.join(), size.join(), colors.join()].join('|');
  return useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: n }, (_, i) => ({
      x: box[0] + (box[2] - box[0]) * r(),
      y: box[1] + (box[3] - box[1]) * r(),
      d: size[0] + (size[1] - size[0]) * r(),
      phase: (i + r() * 0.7) / n,
      speed: 0.8 + r() * 0.4,
      color: colors[i % colors.length],
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}

/** Estrelas (ou brilhos) que acendem e apagam devagar, cada uma na sua fase. */
export function Twinkles({ count, seed, box, colors, size = [2, 3.4], period = 3800 }: { count: number; seed: number; box: Box; colors: string[]; size?: [number, number]; period?: number }) {
  const spots = useSpots(count, seed, box, size, colors);
  const clock = useLoop(period, 0.3);
  const unit = useUnit();
  return (
    <View pointerEvents="none" style={fill}>
      {spots.map((s, i) => (
        <Twinkle key={i} s={s} clock={clock} unit={unit} />
      ))}
    </View>
  );
}

export function Twinkle({ s, clock, unit }: { s: Spot; clock: ReturnType<typeof useLoop>; unit: number }) {
  const style = useAnimatedStyle(() => {
    const u = (clock.value * s.speed + s.phase) % 1;
    const w = Math.sin(u * TAU);
    const tw = w > 0 ? w * w : 0;
    return { opacity: 0.1 + 0.9 * tw, transform: [{ scale: 0.65 + 0.55 * tw }, { rotate: '45deg' }] };
  });
  const d = s.d * unit;
  return <Animated.View style={[{ position: 'absolute', left: s.x * unit - d / 2, top: s.y * unit - d / 2, width: d, height: d, borderRadius: d * 0.18, backgroundColor: s.color }, style]} />;
}

/** Partículas que sobem, caem ou vagam (vaga-lumes, neve, poeira, brasas). */
export function Motes({
  count,
  seed,
  box,
  colors,
  size = [2, 3.2],
  period = 6000,
  mode = 'rise',
  travel = 40,
  sway = 8,
  glow = false,
}: {
  count: number;
  seed: number;
  box: Box;
  colors: string[];
  size?: [number, number];
  period?: number;
  mode?: 'rise' | 'fall';
  travel?: number;
  sway?: number;
  glow?: boolean;
}) {
  const spots = useSpots(count, seed, box, size, colors);
  const clock = useLoop(period, 0.3);
  const unit = useUnit();
  return (
    <View pointerEvents="none" style={fill}>
      {spots.map((s, i) => (
        <Mote key={i} s={s} clock={clock} unit={unit} mode={mode} travel={travel} sway={sway} glow={glow} />
      ))}
    </View>
  );
}

export function Mote({ s, clock, unit, mode, travel, sway, glow }: { s: Spot; clock: ReturnType<typeof useLoop>; unit: number; mode: 'rise' | 'fall'; travel: number; sway: number; glow: boolean }) {
  const style = useAnimatedStyle(() => {
    const u = (clock.value * s.speed + s.phase) % 1;
    return {
      opacity: Math.sin(Math.PI * u),
      transform: [{ translateX: Math.sin((u + s.phase) * TAU) * sway * unit }, { translateY: (mode === 'rise' ? -u : u) * travel * unit }],
    };
  });
  const d = s.d * unit;
  const g = d * 2.8;
  return (
    <Animated.View style={[{ position: 'absolute', left: s.x * unit - g / 2, top: s.y * unit - g / 2, width: g, height: g, alignItems: 'center', justifyContent: 'center' }, style]}>
      {glow ? <View style={{ position: 'absolute', width: g, height: g, borderRadius: g / 2, backgroundColor: s.color, opacity: 0.25 }} /> : null}
      <View style={{ width: d, height: d, borderRadius: d / 2, backgroundColor: s.color }} />
    </Animated.View>
  );
}

export function SvgLayer({ children }: { children: ReactNode }) {
  return (
    <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${W}`}>
      {children}
    </Svg>
  );
}

/** Desliza de um lado para o outro (nuvens, névoa, calor). */
export function Drift({ period, amp, phase = 0, children }: { period: number; amp: number; phase?: number; children: ReactNode }) {
  const unit = useUnit();
  const t = useLoop(period, 0.25);
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: Math.sin((t.value + phase) * TAU) * amp * unit }] }));
  return (
    <Animated.View pointerEvents="none" style={[fill, style]}>
      <SvgLayer>{children}</SvgLayer>
    </Animated.View>
  );
}

/** Respira em opacidade (luzes, auroras, runas). */
export function Pulse({ period, opacity, phase = 0, children }: { period: number; opacity: [number, number]; phase?: number; children: ReactNode }) {
  const t = useLoop(period, 0.25);
  const style = useAnimatedStyle(() => {
    const k = 0.5 - 0.5 * Math.cos((t.value + phase) * TAU);
    return { opacity: opacity[0] + (opacity[1] - opacity[0]) * k };
  });
  return (
    <Animated.View pointerEvents="none" style={[fill, style]}>
      <SvgLayer>{children}</SvgLayer>
    </Animated.View>
  );
}

/** Gira em torno de um ponto da paisagem (céu girando em torno do polo). */
export function Rotate({ period, cx, cy, reverse = false, children }: { period: number; cx: number; cy: number; reverse?: boolean; children: ReactNode }) {
  const unit = useUnit();
  const t = useLoop(period, 0);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${(reverse ? -1 : 1) * t.value * 360}deg` }] }));
  return (
    <Animated.View pointerEvents="none" style={[fill, { transformOrigin: `${cx * unit}px ${cy * unit}px` }, style]}>
      <SvgLayer>{children}</SvgLayer>
    </Animated.View>
  );
}

export interface SceneFx {
  Art: (p: { v: ItemVisual; uid: string }) => ReactNode;
  Live?: (p: { v: ItemVisual }) => ReactNode;
}

