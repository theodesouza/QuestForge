/** Estrelas de desempenho de uma missão (0–3). */
import { StyleSheet, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { useReduceMotion } from './feedback';
import { Icon } from './Icon';
import { colors } from './theme';

export function Stars({ value, size = 16, animated = false, delay = 0 }: { value: number; size?: number; animated?: boolean; delay?: number }) {
  const reduce = useReduceMotion();
  return (
    <View style={styles.row} accessible accessibilityLabel={`${value} de 3 estrelas`}>
      {[1, 2, 3].map((n) => {
        const on = value >= n;
        const star = (
          <Icon name="star" size={size} color={on ? colors.brass : colors.ink500} fill={on ? colors.brass : 'none'} strokeWidth={on ? 1 : 1.6} />
        );
        return animated && on && !reduce ? (
          <Animated.View key={n} entering={ZoomIn.delay(delay + 160 * n).springify().damping(11)}>
            {star}
          </Animated.View>
        ) : (
          <View key={n}>{star}</View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 2, alignItems: 'center' },
});
