/**
 * Subida de nível: momento especial, curto e pulável com um toque.
 * Com "reduzir movimento", vira um simples fade.
 */
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { calm } from '../../ui/calm';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getItem, RARITY_LABEL, SLOT_LABEL } from '../../content/items';
import { rankFor } from '../../domain/progression/levels';
import { dismissCelebration } from '../../state/actions';
import { useGameStore } from '../../state/store';
import { Astrolabe } from '../../ui/Astrolabe';
import { Button } from '../../ui/Button';
import { haptic, useReduceMotion } from '../../ui/feedback';
import { Icon } from '../../ui/Icon';
import { ItemGlyph } from '../../ui/ItemGlyph';
import { Text } from '../../ui/Text';
import { colors, radius, rarityColor, space } from '../../ui/theme';

export function LevelUpOverlay() {
  const celebration = useGameStore((s) => s.celebrations[0]);
  const equipped = useGameStore((s) => s.game?.profile.equipped);
  const reduce = useReduceMotion();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (celebration) haptic('heavy');
  }, [celebration]);

  if (!celebration || !equipped) return null;
  const rankChanged = rankFor(celebration.to).index > rankFor(celebration.from).index;
  const items = celebration.rewards.flatMap((r) => r.rewards.filter((x) => x.kind === 'item').map((x) => (x.kind === 'item' ? x.itemId : '')));
  const ink = celebration.rewards.reduce(
    (s, r) => s + r.rewards.reduce((a, x) => a + (x.kind === 'ink' ? x.amount : 0), 0),
    0,
  );
  const close = () => dismissCelebration(celebration.id);

  return (
    <Animated.View
      entering={FadeIn.duration(reduce ? 150 : 260)}
      exiting={FadeOut.duration(180)}
      style={[StyleSheet.absoluteFill, styles.scrim]}
      accessibilityViewIsModal
    >
      <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel="Fechar celebração" />
      <View style={[styles.content, { paddingTop: insets.top + space.xl, paddingBottom: insets.bottom + space.xl }]} pointerEvents="box-none">
        <Animated.View entering={reduce ? undefined : calm.appear(0, 480)}>
          <Astrolabe level={celebration.to} equipped={equipped} size={264} animate={!reduce} />
        </Animated.View>
        <View style={styles.center} accessible accessibilityRole="header">
          <Text variant="label" color={colors.brass}>
            Subiu de nível
          </Text>
          <Text variant="hero" align="center" style={styles.level}>
            Nível {celebration.to}
          </Text>
          {rankChanged ? (
            <Text variant="subheading" color={colors.verdigris} align="center">
              Nova patente: {rankFor(celebration.to).title} — uma estrela a mais no seu astrolábio.
            </Text>
          ) : (
            <Text variant="body" color={colors.parchmentDim} align="center">
              Seu astrolábio ganhou novas gravações.
            </Text>
          )}
        </View>

        <View style={styles.rewards} pointerEvents="box-none">
          {items.map((id) => {
            const item = getItem(id);
            return (
              <View key={id} style={[styles.reward, { borderColor: rarityColor[item.rarity] }]}>
                <ItemGlyph itemId={id} size={46} />
                <View style={{ flex: 1 }}>
                  <Text variant="subheading">{item.name}</Text>
                  <Text variant="caption" color={rarityColor[item.rarity]}>
                    {SLOT_LABEL[item.slot]} · {RARITY_LABEL[item.rarity]}
                  </Text>
                </View>
              </View>
            );
          })}
          {ink > 0 ? (
            <View style={[styles.reward, { borderColor: colors.lineSoft }]}>
              <View style={styles.inkIcon}>
                <Icon name="ink" size={24} color={colors.iris} fill={colors.iris} strokeWidth={1} />
              </View>
              <Text variant="subheading">+{ink} de Tinta</Text>
            </View>
          ) : null}
        </View>

        <Button label="Continuar" onPress={close} style={styles.button} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scrim: { backgroundColor: colors.scrim, zIndex: 100 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.xl, gap: space.xl },
  center: { alignItems: 'center', gap: space.xs },
  level: { fontSize: 52, lineHeight: 56 },
  rewards: { alignSelf: 'stretch', gap: space.sm },
  reward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1.2,
    backgroundColor: colors.ink800,
  },
  inkIcon: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center' },
  button: { alignSelf: 'stretch' },
});
