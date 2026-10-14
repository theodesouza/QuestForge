import { useEffect, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withTiming, Easing } from 'react-native-reanimated';
import { useReduceMotion } from './feedback';
import { colors, radius } from './theme';

interface Props {
  /** 0–1 */
  value: number;
  color?: string;
  track?: string;
  height?: number;
  /** Marcas de régua ao longo da barra (efeito instrumento). */
  ticks?: number;
  delay?: number;
  accessibilityLabel?: string;
}

export function ProgressBar({
  value,
  color = colors.brass,
  track = colors.ink600,
  height = 10,
  ticks = 0,
  delay = 0,
  accessibilityLabel,
}: Props) {
  const reduce = useReduceMotion();
  const [width, setWidth] = useState(0);
  const progress = useSharedValue(Math.max(0, Math.min(1, value)));

  useEffect(() => {
    const v = Math.max(0, Math.min(1, value));
    progress.set(reduce
      ? v
      : withDelay(delay, withTiming(v, { duration: 700, easing: Easing.out(Easing.cubic) })));
  }, [value, reduce, delay, progress]);

  const fill = useAnimatedStyle(() => ({ width: progress.value * width }));
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  return (
    <View
      onLayout={onLayout}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100) }}
      style={[styles.track, { height, backgroundColor: track, borderRadius: height / 2 }]}
    >
      <Animated.View style={[styles.fill, { backgroundColor: color, borderRadius: height / 2 }, fill]}>
        <View style={[styles.shine, { height: Math.max(2, height / 3), borderRadius: height }]} />
      </Animated.View>
      {ticks > 0
        ? Array.from({ length: ticks - 1 }, (_, i) => (
            <View key={i} style={[styles.tick, { left: `${((i + 1) / ticks) * 100}%`, height }]} />
          ))
        : null}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', overflow: 'hidden', borderRadius: radius.pill },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0 },
  shine: { position: 'absolute', left: 4, right: 4, top: 2, backgroundColor: 'rgba(255,255,255,0.28)' },
  tick: { position: 'absolute', top: 0, width: 1, backgroundColor: colors.ink900, opacity: 0.55 },
});
