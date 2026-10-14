import { Pressable, StyleSheet } from 'react-native';
import { haptic } from './feedback';
import { Icon, type IconName } from './Icon';
import { colors, hitSlop } from './theme';

interface Props {
  icon: IconName;
  label: string;
  onPress: () => void;
  color?: string;
  active?: boolean;
  activeColor?: string;
  size?: number;
}

export function IconButton({ icon, label, onPress, color = colors.mist, active, activeColor = colors.brass, size = 22 }: Props) {
  const tint = active ? activeColor : color;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!active }}
      hitSlop={hitSlop}
      onPress={() => {
        haptic('select');
        onPress();
      }}
      style={({ pressed }) => [styles.btn, { opacity: pressed ? 0.6 : 1 }]}
    >
      <Icon name={icon} size={size} color={tint} fill={active ? tint : 'none'} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22 },
});
