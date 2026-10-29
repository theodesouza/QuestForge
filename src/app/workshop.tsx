/**
 * Oficina: gaste Tinta em cosméticos comuns e incomuns. Raros, épicos e lendários não
 * estão à venda — vêm de nível, chefões e feitos. Compra em dois toques (sem pop-up), sem
 * dinheiro real. Dá para experimentar qualquer peça no seu astrolábio antes de comprar.
 */
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { RARITY_LABEL, SHOP_ITEMS, SLOT_LABEL, SLOT_ORDER, type ItemDef, type ItemSlot } from '../content/items';
import { levelProgress } from '../domain/progression/levels';
import { TryOnSheet } from '../features/hero/TryOnSheet';
import { buy, equip } from '../state/actions';
import { useGame } from '../state/store';
import { Button } from '../ui/Button';
import { Chip } from '../ui/Chip';
import { haptic } from '../ui/feedback';
import { IconButton } from '../ui/IconButton';
import { ItemGlyph } from '../ui/ItemGlyph';
import { Pill } from '../ui/Pill';
import { Screen } from '../ui/Screen';
import { Text } from '../ui/Text';
import { colors, radius, rarityColor, space } from '../ui/theme';

const SECTION_TITLE: Record<ItemSlot, string> = {
  frame: 'Molduras',
  core: 'Núcleos',
  aura: 'Auras',
  scene: 'Cenários',
  title: 'Títulos',
};

type Tab = 'todos' | ItemSlot;

export default function Workshop() {
  const ink = useGame((g) => g.profile.ink);
  const xp = useGame((g) => g.profile.xp);
  const inventory = useGame((g) => g.inventory);
  const equipped = useGame((g) => g.profile.equipped);
  const [tab, setTab] = useState<Tab>('todos');
  const [onlyAffordable, setOnlyAffordable] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [trying, setTrying] = useState<ItemDef | null>(null);

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

  const available = useMemo(() => SHOP_ITEMS.filter((i) => !inventory[i.id]).length, [inventory]);
  const slotsWithStock = useMemo(() => SLOT_ORDER.filter((s) => SHOP_ITEMS.some((i) => i.slot === s)), []);
  const sections = useMemo(
    () =>
      slotsWithStock
        .filter((s) => tab === 'todos' || tab === s)
        .map((slot) => {
          const all = SHOP_ITEMS.filter((i) => i.slot === slot);
          // O que ainda não é seu primeiro (do mais barato ao mais caro); as peças já compradas vão para o fim.
          const items = [...all.filter((i) => !inventory[i.id]), ...all.filter((i) => inventory[i.id])].filter(
            (i) => !onlyAffordable || (!inventory[i.id] && (i.price ?? 0) <= ink),
          );
          return { slot, items, free: all.filter((i) => !inventory[i.id]).length };
        })
        .filter((s) => s.items.length > 0),
    [slotsWithStock, tab, inventory, onlyAffordable, ink],
  );

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
        Troque a Tinta que você ganha estudando por peças para o seu astrolábio. Toque em Experimentar para ver como a peça fica antes de
        comprar. Itens raros, épicos e lendários não estão à venda: eles vêm de níveis, chefões e feitos.
      </Text>
      <Text variant="caption" color={colors.mist}>
        {available > 0 ? `${available} peças à venda · você já tem ${SHOP_ITEMS.length - available} de ${SHOP_ITEMS.length}` : 'Você já tem todas as peças da Oficina.'}
      </Text>

      <View style={styles.filters}>
        <Chip label="Tudo" selected={tab === 'todos'} onPress={() => setTab('todos')} />
        {slotsWithStock.map((s) => (
          <Chip key={s} label={SECTION_TITLE[s]} selected={tab === s} onPress={() => setTab(s)} />
        ))}
      </View>
      <View style={styles.filters}>
        <Chip label="Só o que posso comprar" selected={onlyAffordable} onPress={() => setOnlyAffordable((v) => !v)} />
      </View>

      {error ? (
        <Text variant="caption" color={colors.ember}>
          {error}
        </Text>
      ) : null}

      {sections.length === 0 ? (
        <Text variant="body" color={colors.mist}>
          {onlyAffordable ? 'Nada cabe na sua Tinta agora. Estude mais um pouco — ela rende a cada sessão.' : 'Nada por aqui.'}
        </Text>
      ) : null}

      {sections.map(({ slot, items, free }) => (
        <View key={slot} style={{ gap: space.md }}>
          <View style={styles.sectionHead}>
            <Text variant="subheading">{SECTION_TITLE[slot]}</Text>
            <Text variant="caption" color={colors.mist}>
              {free > 0 ? `${free} à venda` : 'completa'}
            </Text>
          </View>
          {items.map((item) => {
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
                      <>
                        <Button
                          label={confirming ? `Confirmar · ${price} Tinta` : affordable ? `Comprar · ${price} Tinta` : `Faltam ${price - ink} de Tinta`}
                          size="md"
                          icon="ink"
                          variant={confirming ? 'primary' : 'secondary'}
                          disabled={!affordable}
                          onPress={() => purchase(item.id)}
                          accessibilityHint={confirming ? 'Toque para confirmar a compra' : 'Toque duas vezes para comprar'}
                        />
                        <Button label="Experimentar" size="md" variant="ghost" onPress={() => setTrying(item)} />
                      </>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      ))}

      {pending ? (
        <Pressable onPress={() => setPending(null)} accessibilityRole="button" style={styles.cancel}>
          <Text variant="caption" color={colors.mist} align="center">
            Cancelar compra
          </Text>
        </Pressable>
      ) : null}

      <TryOnSheet
        itemId={trying?.id ?? null}
        owned={!!(trying && inventory[trying.id])}
        level={levelProgress(xp).level}
        equipped={equipped}
        lockedNote={trying ? `À venda na Oficina por ${trying.price} de Tinta.` : undefined}
        onClose={() => setTrying(null)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: space.xs, marginLeft: -space.sm },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  sectionHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: space.sm },
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
  actions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space.sm, marginTop: space.sm },
  cancel: { paddingVertical: space.md },
});
