import { Pressable, StyleSheet, View } from 'react-native';
import { haptic } from './feedback';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';
import { colors, radius, space } from './theme';

interface Props {
  label: string;
  onPress?: () => void;
  selected?: boolean;
  icon?: IconName;
  color?: string;
  accessibilityLabel?: string;
}

export function Chip({ label, onPress, selected, icon, color = colors.brass, accessibilityLabel }: Props) {
  const content = (
    <View
      style={[
        styles.chip,
        selected ? { backgroundColor: color, borderColor: color } : { borderColor: colors.line },
      ]}
    >
      {icon ? <Icon name={icon} size={16} color={selected ? colors.ink900 : color} fill={selected ? colors.ink900 : 'none'} /> : null}
      <Text variant="caption" color={selected ? colors.ink900 : colors.parchment} style={styles.label}>
        {label}
      </Text>
    </View>
  );
  if (!onPress) return content;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected: !!selected }}
      hitSlop={6}
      onPress={() => {
        haptic('select');
        onPress();
      }}
      style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs + 2,
    minHeight: 40,
    paddingHorizontal: space.md + 2,
    borderRadius: radius.pill,
    borderWidth: 1.2,
    backgroundColor: colors.ink800,
  },
  label: { fontFamily: 'Inter_600SemiBold' },
});
