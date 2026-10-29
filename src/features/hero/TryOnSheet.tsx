/**
 * Experimentar um cosmético: o astrolábio aparece com o equipamento atual e, um
 * instante depois, "veste" o item — a transformação (clarão + núcleo acendendo)
 * acontece na frente do jogador. Itens bloqueados também podem ser experimentados:
 * é a vitrine do que vem pela frente.
 */
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ELEMENT_LABEL, RARITY_LABEL, SLOT_LABEL, getItem } from '../../content/items';
import type { Equipped } from '../../domain/game/types';
import { equip } from '../../state/actions';
import { Astrolabe } from '../../ui/Astrolabe';
import { SceneStage } from '../../ui/SceneStage';
import { Button } from '../../ui/Button';
import { calm } from '../../ui/calm';
import { haptic, useReduceMotion } from '../../ui/feedback';
import { Icon } from '../../ui/Icon';
import { Text } from '../../ui/Text';
import { colors, radius, rarityColor, space } from '../../ui/theme';
import { resolveSynergy } from '../../ui/vfx/synergy';

interface Props {
  itemId: string | null;
  owned: boolean;
  level: number;
  equipped: Equipped;
  /** Texto no lugar de "Ainda bloqueado" para peças que dá para comprar (Oficina). */
  lockedNote?: string;
  onClose: () => void;
}

const TRY_DELAY_MS = 420;

export function TryOnSheet({ itemId, owned, level, equipped, lockedNote, onClose }: Props) {
  return (
    <Modal visible={!!itemId} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      {itemId ? <Sheet key={itemId} itemId={itemId} owned={owned} level={level} equipped={equipped} lockedNote={lockedNote} onClose={onClose} /> : null}
    </Modal>
  );
}

function Sheet({ itemId, owned, level, equipped, lockedNote, onClose }: Omit<Props, 'itemId'> & { itemId: string }) {
  const reduce = useReduceMotion();
  const insets = useSafeAreaInsets();
  const item = getItem(itemId);
  const color = rarityColor[item.rarity];
  const candidate: Equipped = item.slot === 'title' ? equipped : { ...equipped, [item.slot]: itemId };
  const [wearing, setWearing] = useState(reduce);
  const [busy, setBusy] = useState(false);
  const isEquipped = equipped[item.slot] === itemId;

  useEffect(() => {
    if (wearing) return;
    const t = setTimeout(() => {
      setWearing(true);
      haptic('impact');
    }, TRY_DELAY_MS);
    return () => clearTimeout(t);
  }, [wearing]);

  const shown = wearing ? candidate : equipped;
  const synergy = item.slot === 'core' || item.slot === 'aura' ? resolveSynergy(candidate) : null;

  return (
    <View style={styles.backdrop}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Fechar prévia" />
      <Animated.View
        entering={reduce ? FadeIn : calm.sheet()}
        style={[styles.sheet, { paddingBottom: insets.bottom + space.lg }]}
        accessibilityViewIsModal
      >
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <View style={styles.handle} />
          <SceneStage scene={shown.scene} height={304} animate={!reduce} reserve={item.slot === 'scene'}>
            <Astrolabe level={level} equipped={shown} size={item.slot === 'scene' ? 250 : 280} animate={!reduce} />
          </SceneStage>
          <View style={styles.center}>
            <Text variant="label" color={color} style={{ letterSpacing: 2 }}>
              {RARITY_LABEL[item.rarity]} · {SLOT_LABEL[item.slot]}
              {item.visual.element ? ` · ${ELEMENT_LABEL[item.visual.element]}` : ''}
            </Text>
            <Text variant="title" align="center">
              {item.name}
            </Text>
            <Text variant="body" color={colors.parchmentDim} align="center">
              {owned ? item.description : `Como conseguir: ${item.howToGet}`}
            </Text>
            {synergy ? (
              <View style={[styles.synergy, { borderColor: color }]}>
                <Icon name="sparkle" size={16} color={color} fill={color} />
                <Text variant="caption" color={colors.parchment} style={{ flex: 1 }}>
                  {synergy.label}
                </Text>
              </View>
            ) : null}
            {item.slot === 'title' ? (
              <Text variant="caption" color={colors.mist} align="center">
                Títulos aparecem embaixo do seu nome no Acampamento e no Herói.
              </Text>
            ) : null}
            {item.slot === 'scene' ? (
              <Text variant="caption" color={colors.mist} align="center">
                O Cenário fica atrás do astrolábio no Acampamento e no Herói.
              </Text>
            ) : null}
          </View>
          <View style={styles.actions}>
            {owned && !isEquipped ? (
              <Button
                label="Equipar"
                icon="sparkle"
                loading={busy}
                onPress={async () => {
                  setBusy(true);
                  try {
                    await equip(itemId);
                    haptic('success');
                    onClose();
                  } finally {
                    setBusy(false);
                  }
                }}
              />
            ) : null}
            {!owned ? (
              <View style={styles.locked}>
                <Icon name="lock" size={16} color={colors.mist} />
                <Text variant="caption" color={colors.mist} style={{ flex: 1 }}>
                  {lockedNote ?? 'Ainda bloqueado — esta é só uma prévia.'}
                </Text>
              </View>
            ) : null}
            <Button label={isEquipped ? 'Em uso · Fechar' : 'Fechar'} variant="ghost" onPress={onClose} />
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(6, 9, 20, 0.82)' },
  sheet: {
    maxHeight: '92%',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    backgroundColor: colors.ink850,
    borderTopWidth: 1,
    borderColor: colors.line,
  },
  body: { alignItems: 'center', paddingHorizontal: space.xl, paddingTop: space.sm, gap: space.md },
  handle: { width: 44, height: 4, borderRadius: 2, backgroundColor: colors.ink500, marginBottom: space.xs },
  center: { alignItems: 'center', gap: space.xs, alignSelf: 'stretch' },
  synergy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginTop: space.sm,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    alignSelf: 'stretch',
    backgroundColor: colors.ink800,
  },
  actions: { alignSelf: 'stretch', gap: space.sm, marginTop: space.sm },
  locked: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: space.sm },
});
