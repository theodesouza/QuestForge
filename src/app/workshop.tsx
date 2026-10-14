/**
 * Oficina: gaste Tinta em cosméticos comuns e incomuns. Raros e lendários não
 * estão à venda — vêm de feitos. Compra em dois toques (sem pop-up), sem dinheiro real.
 */
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { RARITY_LABEL, SHOP_ITEMS, SLOT_LABEL } from '../content/items';
import { buy, equip } from '../state/actions';
import { useGame } from '../state/store';
import { Button } from '../ui/Button';
import { haptic } from '../ui/feedback';
import { IconButton } from '../ui/IconButton';
import { ItemGlyph } from '../ui/ItemGlyph';
import { Pill } from '../ui/Pill';
import { Screen } from '../ui/Screen';
import { Text } from '../ui/Text';
import { colors, radius, rarityColor, space } from '../ui/theme';

export default function Workshop() {
  const ink = useGame((g) => g.profile.ink);
  const inventory = useGame((g) => g.inventory);
  const equipped = useGame((g) => g.profile.equipped);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const purchase = async (itemId: string) => {
    if (pending !== itemId) {
      setPending(itemId);
      setError(null);
      return;
    }
    try {
      await buy(itemId);
      haptic('success');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setPending(null);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <IconButton icon="chevronLeft" label="Voltar" onPress={() => router.back()} color={colors.parchment} />
        <Text variant="title" style={{ flex: 1 }}>
          Oficina
        </Text>
        <Pill icon="ink" value={String(ink)} color={colors.iris} label="Tinta" />
      </View>
      <Text variant="body" color={colors.parchmentDim}>
        Troque a Tinta que você ganha estudando por peças para o seu astrolábio. Itens raros e lendários não estão à venda: eles vêm de
        feitos, como vencer chefões sem errar.
      </Text>
      {error ? (
        <Text variant="caption" color={colors.ember}>
          {error}
        </Text>
      ) : null}

      {SHOP_ITEMS.map((item) => {
        const owned = !!inventory[item.id];
        const inUse = equipped[item.slot] === item.id;
        const price = item.price ?? 0;
        const affordable = ink >= price;
        const confirming = pending === item.id;
        return (
          <View key={item.id} style={[styles.item, owned && styles.owned]}>
            <ItemGlyph itemId={item.id} size={56} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="subheading">{item.name}</Text>
              <Text variant="caption" color={rarityColor[item.rarity]}>
                {SLOT_LABEL[item.slot]} · {RARITY_LABEL[item.rarity]}
              </Text>
              <Text variant="caption" color={colors.parchmentDim}>
                {item.description}
              </Text>
              <View style={styles.actions}>
                {owned ? (
                  inUse ? (
                    <Text variant="label" color={colors.verdigris}>
                      Em uso
                    </Text>
                  ) : (
                    <Button label="Equipar" size="md" variant="secondary" onPress={() => equip(item.id)} />
                  )
                ) : (
                  <Button
                    label={confirming ? `Confirmar · ${price} Tinta` : affordable ? `Comprar · ${price} Tinta` : `Faltam ${price - ink} de Tinta`}
                    size="md"
                    icon="ink"
                    variant={confirming ? 'primary' : 'secondary'}
                    disabled={!affordable}
                    onPress={() => purchase(item.id)}
                    accessibilityHint={confirming ? 'Toque para confirmar a compra' : 'Toque duas vezes para comprar'}
                  />
                )}
              </View>
            </View>
          </View>
        );
      })}
      {pending ? (
        <Pressable onPress={() => setPending(null)} accessibilityRole="button" style={styles.cancel}>
          <Text variant="caption" color={colors.mist} align="center">
            Cancelar compra
          </Text>
        </Pressable>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: space.xs, marginLeft: -space.sm },
  item: {
    flexDirection: 'row',
    gap: space.md,
    padding: space.md,
    borderRadius: radius.lg,
    backgroundColor: colors.ink800,
    borderWidth: 1,
    borderColor: colors.lineSoft,
  },
  owned: { backgroundColor: colors.ink850 },
  actions: { flexDirection: 'row', marginTop: space.sm },
  cancel: { paddingVertical: space.md },
});
