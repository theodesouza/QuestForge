import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { EASE_OUT } from './calm';
import { haptic } from './feedback';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';
import { colors, motion, radius, space } from './theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  icon?: IconName;
  iconRight?: IconName;
  disabled?: boolean;
  loading?: boolean;
  size?: 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
  children?: ReactNode;
}

const PALETTE: Record<Variant, { bg: string; fg: string; border: string }> = {
  primary: { bg: colors.brass, fg: colors.ink900, border: colors.brass },
  success: { bg: colors.verdigris, fg: colors.ink900, border: colors.verdigris },
  danger: { bg: 'transparent', fg: colors.ember, border: colors.ember },
  secondary: { bg: colors.ink700, fg: colors.parchment, border: colors.line },
  ghost: { bg: 'transparent', fg: colors.mist, border: 'transparent' },
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  iconRight,
  disabled,
  loading,
  size = 'lg',
  style,
  accessibilityHint,
}: Props) {
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const p = PALETTE[variant];
  const inactive = disabled || loading;

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      disabled={inactive}
      onPressIn={() => {
        scale.set(withTiming(0.97, { duration: motion.press, easing: EASE_OUT }));
      }}
      onPressOut={() => {
        scale.set(withTiming(1, { duration: motion.press * 1.6, easing: EASE_OUT }));
      }}
      onPress={() => {
        haptic('select');
        onPress();
      }}
      style={[
        styles.base,
        size === 'lg' ? styles.lg : styles.md,
        { backgroundColor: p.bg, borderColor: p.border, opacity: inactive ? 0.45 : 1 },
        pressStyle,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={p.fg} />
      ) : (
        <View style={styles.row}>
          {icon ? <Icon name={icon} size={20} color={p.fg} fill={variant === 'primary' ? p.fg : 'none'} /> : null}
          <Text variant="bodyStrong" color={p.fg} style={size === 'lg' ? styles.labelLg : undefined}>
            {label}
          </Text>
          {iconRight ? <Icon name={iconRight} size={18} color={p.fg} /> : null}
        </View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xl,
  },
  lg: { minHeight: 56 },
  md: { minHeight: 44, paddingHorizontal: space.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  labelLg: { fontSize: 16.5 },
});
