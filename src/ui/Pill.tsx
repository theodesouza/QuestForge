import { StyleSheet, View } from 'react-native';
import { Icon, type IconName } from './Icon';
import { Text } from './Text';
import { colors, radius, space } from './theme';

/** Valor compacto com ícone (XP, Tinta, Ecos). */
export function Pill({ icon, value, color = colors.brass, label }: { icon: IconName; value: string; color?: string; label: string }) {
  return (
    <View style={styles.pill} accessible accessibilityLabel={`${label}: ${value}`}>
      <Icon name={icon} size={15} color={color} fill={color} strokeWidth={1.2} />
      <Text variant="number" style={styles.value}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: space.md,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: colors.ink800,
    borderWidth: 1,
    borderColor: colors.lineSoft,
  },
  value: { fontSize: 15 },
});
