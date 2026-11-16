/**
 * Remessa — várias peças chegando de uma vez. Aparece em dois momentos:
 *
 *  · na primeira abertura depois do remake ("O Astrolábio despertou"): apresenta o Áster, diz com
 *    todas as letras que nada se perdeu e mostra as peças novas que a pessoa já tinha feito por
 *    merecer (níveis alcançados, feitos cumpridos);
 *  · sempre que uma única ação render muitas peças: uma tela só, em vez de uma fila de cerimônias.
 *
 * Nada é equipado aqui: as peças entram na coleção e o Estúdio é onde se escolhe o que vestir.
 * Espera a celebração de nível e não aparece no meio de uma questão ou batalha. É um Modal de
 * verdade (o leitor de tela não sai dele; o Voltar do Android fecha).
 */
import { router, usePathname } from 'expo-router';
import { useMemo } from 'react';
import { Modal, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RARITY_LABEL, RARITY_TIER, SLOT_LABEL, SLOT_ORDER, getItem, hasItem, type ItemDef, type Rarity } from '../../content/items';
import { levelForXp } from '../../domain/progression/levels';
import { dismissShipment } from '../../state/actions';
import { useGameStore, type Shipment } from '../../state/store';
import { Aster } from '../../ui/Aster';
import { Button } from '../../ui/Button';
import { calm } from '../../ui/calm';
import { useReduceMotion } from '../../ui/feedback';
import { Icon } from '../../ui/Icon';
import { ItemGlyph } from '../../ui/ItemGlyph';
import { SceneStage } from '../../ui/SceneStage';
import { Text } from '../../ui/Text';
import { colors, radius, rarityColor, space } from '../../ui/theme';

const HOLD_ON: readonly string[] = ['/session', '/boss'];
/** Miniaturas mostradas; o resto vira "+N". */
const SHOWN = 15;
const RARITIES: Rarity[] = ['lendario', 'epico', 'raro', 'incomum', 'comum'];

const KEPT = ['Nível, XP e Tinta', 'Missões, estrelas e chefões', 'Todas as peças que você já tinha', 'O que você estava usando'] as const;

export function ShipmentOverlay() {
  const shipment = useGameStore((s) => s.shipments[0]);
  const celebrating = useGameStore((s) => s.celebrations.length > 0);
  // Uma tela de cada vez: as cerimônias de peça (espólio de chefão, por exemplo) passam primeiro.
  const revealing = useGameStore((s) => s.reveals.length > 0);
  const game = useGameStore((s) => s.game);
  const pathname = usePathname();
  if (!shipment || !game || celebrating || (revealing && !shipment.rebirth) || HOLD_ON.includes(pathname)) return null;
  return (
    <Modal visible transparent animationType="none" statusBarTranslucent navigationBarTranslucent onRequestClose={() => dismissShipment(shipment.id)}>
      <Sheet key={shipment.id} shipment={shipment} />
    </Modal>
  );
}

function Sheet({ shipment }: { shipment: Shipment }) {
  const insets = useSafeAreaInsets();
  const reduce = useReduceMotion();
  const game = useGameStore((s) => s.game);
  const items = useMemo(
    () =>
      shipment.items
        .filter((i) => hasItem(i.itemId))
        .map((i) => getItem(i.itemId))
        .sort((a, b) => RARITY_TIER[b.rarity] - RARITY_TIER[a.rarity]),
    [shipment.items],
  );
  const bySlot = useMemo(() => SLOT_ORDER.map((slot) => ({ slot, n: items.filter((i) => i.slot === slot).length })).filter((x) => x.n > 0), [items]);
  const byRarity = useMemo(() => RARITIES.map((rarity) => ({ rarity, n: items.filter((i) => i.rarity === rarity).length })).filter((x) => x.n > 0), [items]);
  if (!game) return null;
  const level = levelForXp(game.profile.xp);
  const close = () => dismissShipment(shipment.id);
  const studio = () => {
    close();
    router.push('/studio');
  };
  const enter = (i: number) => (reduce ? FadeIn : calm.rise(120 + i * 110));

  return (
    <Animated.View entering={FadeIn.duration(220)} style={[styles.scrim, { paddingTop: insets.top + space.lg, paddingBottom: insets.bottom + space.lg }]} accessibilityViewIsModal>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {shipment.rebirth ? (
          <>
            <Animated.View entering={enter(0)} style={styles.center}>
              <Text variant="label" color={colors.brass} style={styles.kicker}>
                Uma nova forma
              </Text>
              <Text variant="title" align="center">
                O Astrolábio despertou
              </Text>
            </Animated.View>
            <Animated.View entering={reduce ? FadeIn : FadeInDown.duration(420).delay(120)} style={styles.stage}>
              <SceneStage scene={game.profile.equipped.scene} height={280} animate={!reduce} reserve>
                <Aster level={level} equipped={game.profile.equipped} size={262} animate={!reduce} />
              </SceneStage>
            </Animated.View>
            <Animated.View entering={enter(1)} style={styles.center}>
              <Text variant="body" color={colors.parchmentDim} align="center">
                Ele agora é o <Text variant="bodyStrong">Áster</Text>: um corpo celeste que cresce com o seu nível, ganha luas e cinturões a cada patente e acende uma estrela na coroa a cada chefão vencido.
              </Text>
            </Animated.View>
            <Animated.View entering={enter(2)} style={styles.kept}>
              <Text variant="label" color={colors.verdigris}>
                Continua tudo aqui
              </Text>
              {KEPT.map((line) => (
                <View key={line} style={styles.keptRow}>
                  <Icon name="check" size={16} color={colors.verdigris} />
                  <Text variant="caption" color={colors.parchment} style={styles.flex}>
                    {line}
                  </Text>
                </View>
              ))}
              <Text variant="caption" color={colors.mist}>
                As molduras viraram anéis de contenção e os núcleos antigos seguem dentro do corpo. Há quatro espaços novos — satélite, rastro, gravidade e ignição — esperando no Estúdio.
              </Text>
            </Animated.View>
          </>
        ) : (
          <Animated.View entering={enter(0)} style={styles.center}>
            <Text variant="label" color={colors.brass} style={styles.kicker}>
              Remessa
            </Text>
            <Text variant="title" align="center">
              {items.length} peças novas
            </Text>
          </Animated.View>
        )}

        {items.length > 0 ? (
          <Animated.View entering={enter(3)} style={styles.crate}>
            {shipment.rebirth ? (
              <>
                <Text variant="subheading" align="center">
                  {items.length} {items.length === 1 ? 'peça nova chegou' : 'peças novas chegaram'}
                </Text>
                <Text variant="caption" color={colors.mist} align="center">
                  Pelos níveis que você já alcançou e pelos feitos que já cumpriu.
                </Text>
              </>
            ) : (
              <Text variant="caption" color={colors.mist} align="center">
                Já estão na sua coleção. Nada foi trocado no que você está usando.
              </Text>
            )}
            <View style={styles.rarities}>
              {byRarity.map((r) => (
                <View key={r.rarity} style={[styles.rarity, { borderColor: rarityColor[r.rarity] }]} accessible accessibilityLabel={`${r.n} ${RARITY_LABEL[r.rarity]}`}>
                  <Text variant="number" color={rarityColor[r.rarity]} style={styles.rarityN}>
                    {r.n}
                  </Text>
                  <Text variant="caption" color={colors.parchmentDim}>
                    {RARITY_LABEL[r.rarity]}
                  </Text>
                </View>
              ))}
            </View>
            <View style={styles.glyphs}>
              {items.slice(0, SHOWN).map((item: ItemDef) => (
                <ItemGlyph key={item.id} itemId={item.id} size={50} />
              ))}
              {items.length > SHOWN ? (
                <View style={styles.more}>
                  <Text variant="number" color={colors.parchment}>
                    +{items.length - SHOWN}
                  </Text>
                </View>
              ) : null}
            </View>
            <Text variant="caption" color={colors.mist} align="center">
              {bySlot.map((x) => `${x.n} em ${SLOT_LABEL[x.slot]}`).join(' · ')}
            </Text>
          </Animated.View>
        ) : null}
      </ScrollView>
      <View style={styles.actions}>
        <Button label="Abrir o Estúdio" icon="sparkle" onPress={studio} />
        <Button label={shipment.rebirth ? 'Continuar jogando' : 'Fechar'} variant="ghost" onPress={close} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: 'rgba(6, 9, 20, 0.97)' },
  body: { paddingHorizontal: space.xl, gap: space.lg, alignItems: 'center', paddingBottom: space.lg, width: '100%', maxWidth: 580, alignSelf: 'center' },
  center: { alignItems: 'center', gap: space.xs, alignSelf: 'stretch' },
  kicker: { letterSpacing: 2.4 },
  stage: { alignSelf: 'stretch' },
  kept: { alignSelf: 'stretch', gap: space.sm, padding: space.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: 'rgba(56, 214, 176, 0.3)', backgroundColor: colors.ink850 },
  keptRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  flex: { flex: 1 },
  crate: { alignSelf: 'stretch', gap: space.md, padding: space.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.ink800 },
  rarities: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: space.sm },
  rarity: { alignItems: 'center', minWidth: 62, paddingHorizontal: space.sm, paddingVertical: 6, borderRadius: radius.md, borderWidth: 1, backgroundColor: colors.ink850 },
  rarityN: { fontSize: 20, lineHeight: 24 },
  glyphs: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: space.sm },
  more: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.lineSoft, backgroundColor: colors.ink700 },
  actions: { paddingHorizontal: space.xl, paddingTop: space.md, gap: space.sm, width: '100%', maxWidth: 580, alignSelf: 'center' },
});
