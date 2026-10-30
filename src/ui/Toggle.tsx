/** Interruptor do app (no lugar do Switch do sistema): trilho e botão no estilo do mapa, deslize calmo. */
import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { EASE_OUT } from './calm';
import { haptic } from './feedback';
import { colors } from './theme';

const W = 52;
const H = 30;
const KNOB = 22;
const PAD = 4;

interface Props {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel: string;
}

export function Toggle({ value, onValueChange, accessibilityLabel }: Props) {
  const on = useSharedValue(value ? 1 : 0);
  useEffect(() => {
    on.set(withTiming(value ? 1 : 0, { duration: 180, easing: EASE_OUT }));
  }, [value, on]);
  const track = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(on.get(), [0, 1], [colors.ink600, colors.brass]),
  }));
  const knob = useAnimatedStyle(() => ({ transform: [{ translateX: on.get() * (W - KNOB - PAD * 2) }] }));
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value }}
      hitSlop={10}
      onPress={() => {
        haptic('select');
        onValueChange(!value);
      }}
    >
      <Animated.View style={[styles.track, track]}>
        <Animated.View style={[styles.knob, knob]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: { width: W, height: H, borderRadius: H / 2, padding: PAD, justifyContent: 'center' },
  knob: { width: KNOB, height: KNOB, borderRadius: KNOB / 2, backgroundColor: colors.parchment },
});
