import { Tabs, type BottomTabBarProps } from 'expo-router/tabs';
import { Pressable, StyleSheet, View } from 'react-native';
import { haptic } from '../../ui/feedback';
import { Icon, type IconName } from '../../ui/Icon';
import { Text } from '../../ui/Text';
import { colors, radius, space } from '../../ui/theme';

const TABS: Record<string, { label: string; icon: IconName }> = {
  camp: { label: 'Acampamento', icon: 'camp' },
  atlas: { label: 'Atlas', icon: 'atlas' },
  hero: { label: 'Herói', icon: 'hero' },
};

function TabBar({ state, navigation, insets }: BottomTabBarProps) {
  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, space.md) }]} pointerEvents="box-none">
      <View style={styles.bar} accessibilityRole="tablist">
        {state.routes.map((route, index) => {
          const meta = TABS[route.name];
          if (!meta) return null;
          const focused = state.index === index;
          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={meta.label}
              onPress={() => {
                const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!focused && !event.defaultPrevented) {
                  haptic('select');
                  navigation.navigate(route.name);
                }
              }}
              style={styles.item}
            >
              <View style={[styles.iconWrap, focused && styles.iconActive]}>
                <Icon name={meta.icon} size={22} color={focused ? colors.ink900 : colors.mist} fill={focused ? colors.ink900 : 'none'} />
              </View>
              <Text variant="caption" color={focused ? colors.brass : colors.mist} style={styles.label}>
                {meta.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.ink900 } }}
    >
      <Tabs.Screen name="camp" />
      <Tabs.Screen name="atlas" />
      <Tabs.Screen name="hero" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: space.lg },
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.ink800,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: space.sm,
    paddingHorizontal: space.sm,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  item: { flex: 1, alignItems: 'center', gap: 3, minHeight: 52, justifyContent: 'center' },
  iconWrap: { width: 44, height: 30, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  iconActive: { backgroundColor: colors.brass },
  label: { fontSize: 11.5 },
});
