import { usePathname } from 'expo-router';
import { Tabs, type BottomTabBarProps } from 'expo-router/tabs';
import { useEffect, useMemo } from 'react';
import { AppState, Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useReducedMotion, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { TAB_ORDER, goToTab, resetSlide, setSystemReduceMotion, slideWidth, tabIndexOf, tabSlide } from '../../features/tabs/slide';
import { EASE_OUT } from '../../ui/calm';
import { Icon, type IconName } from '../../ui/Icon';
import { Text } from '../../ui/Text';
import { colors, radius, space } from '../../ui/theme';

const TABS: Record<string, { label: string; icon: IconName }> = {
  camp: { label: 'Acampamento', icon: 'camp' },
  atlas: { label: 'Atlas', icon: 'atlas' },
  academy: { label: 'Academia', icon: 'scroll' },
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
                if (!focused && !event.defaultPrevented) goToTab(state.index, index);
              }}
              style={styles.item}
            >
              <View style={[styles.iconWrap, focused && styles.iconActive]}>
                <Icon name={meta.icon} size={22} color={focused ? colors.ink900 : colors.mist} fill={focused ? colors.ink900 : 'none'} />
              </View>
              <Text variant="caption" color={focused ? colors.brass : colors.mist} style={styles.label} numberOfLines={1} adjustsFontSizeToFit>
                {meta.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/** Arrastar a tela para o lado troca de aba; nas pontas, o arrasto só "resiste". */
function useSwipe(index: number) {
  return useMemo(
    () =>
      Gesture.Pan()
        .enabled(index >= 0)
        .activeOffsetX([-18, 18])
        .failOffsetY([-14, 14])
        .onUpdate((e) => {
          'worklet';
          const edge = (e.translationX > 0 && index === 0) || (e.translationX < 0 && index === TAB_ORDER.length - 1);
          tabSlide.set(edge ? e.translationX * 0.2 : e.translationX);
        })
        .onEnd((e) => {
          'worklet';
          const w = slideWidth();
          const far = Math.abs(e.translationX) > w * 0.25;
          const fast = Math.abs(e.velocityX) > 650 && Math.abs(e.translationX) > 24;
          const toNext = e.translationX < 0;
          const target = index + (toNext ? 1 : -1);
          if ((far || fast) && target >= 0 && target < TAB_ORDER.length) {
            scheduleOnRN(goToTab, index, target, e.translationX, e.velocityX);
          } else {
            tabSlide.set(withTiming(0, { duration: 220, easing: EASE_OUT }));
          }
        }),
    [index],
  );
}

export default function TabsLayout() {
  const pathname = usePathname();
  const index = tabIndexOf(pathname);
  const swipe = useSwipe(index);
  const reduceSystem = useReducedMotion();
  useEffect(() => setSystemReduceMotion(reduceSystem), [reduceSystem]);
  useEffect(() => {
    const sub = AppState.addEventListener('change', (st) => {
      if (st === 'active') resetSlide();
    });
    return () => sub.remove();
  }, []);
  return (
    <GestureDetector gesture={swipe}>
      <View style={styles.fill}>
        <Tabs
          tabBar={(props) => <TabBar {...props} />}
          screenOptions={{ headerShown: false, animation: 'none', sceneStyle: { backgroundColor: colors.ink900 } }}
        >
          <Tabs.Screen name="camp" />
          <Tabs.Screen name="atlas" />
          <Tabs.Screen name="academy" />
          <Tabs.Screen name="hero" />
        </Tabs>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
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
