/**
 * Laboratório de efeitos (só em builds de QA: EXPO_PUBLIC_QA=1).
 * /vfx-lab?grid=cores | auras | frames | scenes | synergy   → galeria
 * /vfx-lab?core=…&aura=…&frame=…&scene=…&level=…            → um astrolábio grande
 */
import { Redirect, useGlobalSearchParams } from 'expo-router';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import type { BossArt as BossArtId } from '../content/bosses';
import { ITEMS, RARITY_LABEL, getItem } from '../content/items';
import type { EffectsLevel, Equipped } from '../domain/game/types';
import { BossArt } from '../features/boss/BossArt';
import { Astrolabe } from '../ui/Astrolabe';
import { SceneStage } from '../ui/SceneStage';
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
  const routed = useGlobalSearchParams<{ boss?: string; felled?: string; grid?: string; core?: string; aura?: string; frame?: string; scene?: string; level?: string; fx?: string; glyphs?: string }>();
  // Na exportação web estática os parâmetros às vezes chegam vazios: lê direto da URL.
  const p =
    Platform.OS === 'web' && typeof window !== 'undefined' && Object.keys(routed).length === 0
      ? (Object.fromEntries(new URLSearchParams(window.location.search)) as typeof routed)
      : routed;
  if (!QA) return <Redirect href="/" />;
  const level = Number(p.level ?? 20);
  const effects = (p.fx as EffectsLevel) ?? undefined;
  const base: Equipped = { frame: p.frame ?? 'frame-bronze', core: p.core ?? 'core-quartzo', aura: p.aura ?? null, scene: p.scene ?? null, title: null };

  if (p.boss) {
    const art = p.boss as BossArtId;
    // Quatro estados de progresso (0 a 3) e o chefão derrotado: cabeças caídas, vértices rachados, camadas de concreto.
    const hits = (n: number) => ({ areas: n >= 1 ? 2 : 0, triangulos: n >= 2 ? 2 : n >= 1 ? 1 : 0, circulos: n >= 3 ? 2 : n >= 2 ? 1 : 0 });
    return (
      <ScrollView style={styles.root} contentContainerStyle={styles.grid}>
        {[0, 1, 2, 3, 4].map((n) => (
          <View key={n} style={styles.cell}>
            <BossArt
              art={art}
              size={170}
              headsFelled={Math.min(n, 3)}
              cracked={art === 'colosso' || art === 'arquiteto' ? n >= 3 : n >= 1}
              defeated={n >= (art === 'quimera' ? 3 : 4)}
              facetHits={hits(n)}
              hitsToCrack={2}
              layers={Math.min(n, 3)}
            />
            <Text variant="caption" color={colors.mist}>{n === 4 ? 'derrotado' : `estado ${n}`}</Text>
          </View>
        ))}
      </ScrollView>
    );
  }

  if (p.glyphs) {
    return (
      <ScrollView style={styles.root} contentContainerStyle={styles.grid}>
        {ITEMS.filter((i) => i.slot !== 'title' && (!p.glyphs || p.glyphs === '1' || i.slot === p.glyphs)).map((i) => (
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
    } else if (p.grid === 'frames') {
      for (const i of ITEMS.filter((x) => x.slot === 'frame')) cells.push({ equipped: { ...base, frame: i.id }, label: i.name, sub: `${RARITY_LABEL[i.rarity]} · ${i.visual.frameStyle}` });
    } else if (p.grid === 'scenes') {
      return (
        <ScrollView style={styles.root} contentContainerStyle={styles.grid}>
          {ITEMS.filter((x) => x.slot === 'scene').map((i) => (
            <View key={i.id} style={styles.sceneCell}>
              <SceneStage scene={i.id} height={260} effects={effects}>
                <Astrolabe level={level} equipped={{ ...base, scene: i.id }} size={220} effects={effects} />
              </SceneStage>
              <Text variant="caption" align="center">
                {i.name} · {RARITY_LABEL[i.rarity]}
              </Text>
            </View>
          ))}
        </ScrollView>
      );
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
        ['core-jade', 'aura-petalas'],
        ['core-esmeralda', 'aura-vagalumes'],
        ['core-gelo', 'aura-neve'],
        ['core-eclipse', 'aura-lunar'],
        ['core-euclides', 'aura-constelacao'],
        ['core-poliedro', 'aura-neve'],
        ['core-euclides', 'aura-zenite'],
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
      <View style={{ width: 360 }}>
        <SceneStage scene={base.scene} height={360} effects={effects}>
          <Astrolabe level={level} equipped={base} size={330} effects={effects} />
        </SceneStage>
      </View>
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
  sceneCell: { width: 330, gap: 4, marginBottom: 14 },
  single: { alignItems: 'center', justifyContent: 'center', gap: 8 },
});
