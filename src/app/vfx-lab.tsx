/**
 * Laboratório de efeitos (só em builds de QA: EXPO_PUBLIC_QA=1).
 * /vfx-lab?grid=cores | auras | synergy   → galeria
 * /vfx-lab?core=…&aura=…&frame=…&level=…  → um astrolábio grande
 */
import { Redirect, useGlobalSearchParams } from 'expo-router';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { ITEMS, RARITY_LABEL, getItem } from '../content/items';
import type { EffectsLevel, Equipped } from '../domain/game/types';
import { Astrolabe } from '../ui/Astrolabe';
import { ItemGlyph } from '../ui/ItemGlyph';
import { Text } from '../ui/Text';
import { colors, rarityColor } from '../ui/theme';
import { resolveSynergy } from '../ui/vfx/synergy';

const QA = process.env.EXPO_PUBLIC_QA === '1';

function Cell({ equipped, label, sub, size, level, effects }: { equipped: Equipped; label: string; sub: string; size: number; level: number; effects?: EffectsLevel }) {
  return (
    <View style={styles.cell}>
      <Astrolabe level={level} equipped={equipped} size={size} effects={effects} />
      <Text variant="caption" align="center">
        {label}
      </Text>
      <Text variant="caption" color={colors.mist} align="center">
        {sub}
      </Text>
    </View>
  );
}

export default function VfxLab() {
  const routed = useGlobalSearchParams<{ grid?: string; core?: string; aura?: string; frame?: string; level?: string; fx?: string; glyphs?: string }>();
  // Na exportação web estática os parâmetros às vezes chegam vazios: lê direto da URL.
  const p =
    Platform.OS === 'web' && typeof window !== 'undefined' && Object.keys(routed).length === 0
      ? (Object.fromEntries(new URLSearchParams(window.location.search)) as typeof routed)
      : routed;
  if (!QA) return <Redirect href="/" />;
  const level = Number(p.level ?? 20);
  const effects = (p.fx as EffectsLevel) ?? undefined;
  const base: Equipped = { frame: p.frame ?? 'frame-bronze', core: p.core ?? 'core-quartzo', aura: p.aura ?? null, title: null };

  if (p.glyphs) {
    return (
      <ScrollView style={styles.root} contentContainerStyle={styles.grid}>
        {ITEMS.filter((i) => i.slot !== 'title').map((i) => (
          <View key={i.id} style={styles.glyph}>
            <ItemGlyph itemId={i.id} size={64} />
            <Text variant="caption" color={rarityColor[i.rarity]}>
              {RARITY_LABEL[i.rarity]}
            </Text>
          </View>
        ))}
      </ScrollView>
    );
  }

  if (p.grid) {
    const cells: { equipped: Equipped; label: string; sub: string }[] = [];
    if (p.grid === 'cores') {
      for (const i of ITEMS.filter((x) => x.slot === 'core')) cells.push({ equipped: { ...base, core: i.id, aura: null }, label: i.name, sub: RARITY_LABEL[i.rarity] });
    } else if (p.grid === 'auras') {
      for (const i of ITEMS.filter((x) => x.slot === 'aura')) cells.push({ equipped: { ...base, core: 'core-ambar', aura: i.id }, label: i.name, sub: RARITY_LABEL[i.rarity] });
    } else {
      const pairs: [string, string][] = [
        ['core-solar', 'aura-brasa'],
        ['core-pulsar', 'aura-aurora'],
        ['core-verdete', 'aura-mare'],
        ['core-safira', 'aura-lunar'],
        ['core-iris', 'aura-nebulosa'],
        ['core-quartzo', 'aura-nebulosa'],
        ['core-tesouro', 'aura-aurea'],
        ['core-tesouro', 'aura-zenite'],
      ];
      for (const [core, aura] of pairs) {
        const s = resolveSynergy({ core, aura });
        cells.push({ equipped: { ...base, frame: 'frame-armilar', core, aura }, label: `${getItem(core).name} + ${getItem(aura).name}`, sub: s?.label ?? '—' });
      }
    }
    return (
      <ScrollView style={styles.root} contentContainerStyle={styles.grid}>
        {cells.map((c, i) => (
          <Cell key={i} {...c} size={170} level={level} effects={effects} />
        ))}
      </ScrollView>
    );
  }

  const s = base.aura ? resolveSynergy(base) : null;
  return (
    <View style={[styles.root, styles.single]}>
      <Astrolabe level={level} equipped={base} size={330} effects={effects} />
      <Text variant="subheading" align="center">
        {getItem(base.core).name}
        {base.aura ? ` + ${getItem(base.aura).name}` : ''}
      </Text>
      <Text variant="caption" color={colors.mist}>
        {s?.label ?? ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ink900 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', paddingVertical: 16, gap: 4 },
  cell: { width: 180, alignItems: 'center', gap: 2, marginBottom: 10 },
  glyph: { width: 84, alignItems: 'center', gap: 4, marginBottom: 8 },
  single: { alignItems: 'center', justifyContent: 'center', gap: 8 },
});
