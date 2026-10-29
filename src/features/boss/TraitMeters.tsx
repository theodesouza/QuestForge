/**
 * Medidores das mecânicas dos chefões de geometria:
 *   FacetsBar   — Colosso: um chip por vértice, com os acertos que faltam para rachá-lo.
 *                 O vértice da pergunta atual fica em destaque; os partidos ficam riscados.
 *   ConcreteTag — Arquiteto: as camadas de concreto no corpo (cada uma tira dano) e o aviso
 *                 de que o concreto rachou na fase 2.
 */
import { StyleSheet, View } from 'react-native';
import type { BossDef } from '../../content/bosses';
import { concreteLayers, facetHitsOf, scalesOf, type BattleState } from '../../domain/boss/battle';
import { Icon } from '../../ui/Icon';
import { Text } from '../../ui/Text';
import { colors, radius } from '../../ui/theme';

export function FacetsBar({ boss, battle, activeFacetId }: { boss: BossDef; battle: BattleState; activeFacetId?: string | null }) {
  if (boss.trait.kind !== 'facets') return null;
  const { facets, hitsToCrack } = boss.trait;
  const hits = facetHitsOf(battle);
  const state = facets.map((f) => ({ f, n: Math.min(hitsToCrack, hits[f.id] ?? 0) }));
  const label = state.map(({ f, n }) => `${f.name}: ${n >= hitsToCrack ? 'partido' : `${n} de ${hitsToCrack} acertos`}`).join('; ');
  return (
    <View style={styles.row} accessible accessibilityLabel={`Vértices do Colosso. ${label}.`}>
      {state.map(({ f, n }) => {
        const broken = n >= hitsToCrack;
        const active = f.id === activeFacetId && !broken;
        return (
          <View key={f.id} style={[styles.chip, active && { borderColor: f.color }]}>
            <Text variant="caption" color={broken ? colors.ink500 : active ? f.color : colors.mist} numberOfLines={1} style={[styles.name, broken && styles.struck, active && styles.bold]}>
              {f.name}
            </Text>
            <View style={styles.pips}>
              {Array.from({ length: hitsToCrack }, (_, i) => (
                <View key={i} style={[styles.pip, { borderColor: broken ? colors.ink500 : f.color, backgroundColor: i < n ? (broken ? colors.ink500 : f.color) : 'transparent' }]} />
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );
}

export function ConcreteTag({ boss, battle }: { boss: BossDef; battle: BattleState }) {
  if (boss.trait.kind !== 'concrete') return null;
  const { maxLayers, layerPenalty } = boss.trait;
  const layers = concreteLayers(battle);
  const cracked = battle.armorBroken;
  return (
    <View
      style={styles.tag}
      accessible
      accessibilityLabel={`Concreto: ${layers} de ${maxLayers} camadas, ${Math.round(layers * layerPenalty * 100)}% menos dano${cracked ? '. Rachado: não se forma mais' : ''}`}
    >
      <Icon name="shield" size={13} color={cracked ? colors.ember : colors.mist} />
      <Text variant="caption" color={cracked ? colors.ember : colors.mist}>
        {cracked ? 'rachado' : 'concreto'}
      </Text>
      <View style={styles.pips}>
        {Array.from({ length: maxLayers }, (_, i) => (
          <View key={i} style={[styles.layer, i < layers && styles.layerOn, cracked && i < layers && { backgroundColor: colors.ember, borderColor: colors.ember }]} />
        ))}
      </View>
    </View>
  );
}

export function ScalesTag({ boss, battle }: { boss: BossDef; battle: BattleState }) {
  if (boss.trait.kind !== 'scales') return null;
  const { maxScales, scaledMultiplier, exposedMultiplier } = boss.trait;
  const left = scalesOf(boss, battle);
  const exposed = left === 0;
  return (
    <View
      style={styles.tag}
      accessible
      accessibilityLabel={`Escamas: ${left} de ${maxScales}. ${exposed ? `Exposto: ${Math.round((exposedMultiplier - 1) * 100)}% a mais de dano` : `${Math.round((1 - scaledMultiplier) * 100)}% a menos de dano`}`}
    >
      <Icon name="shield" size={13} color={exposed ? colors.ember : colors.mist} />
      <Text variant="caption" color={exposed ? colors.ember : colors.mist}>
        {exposed ? 'exposto' : 'escamas'}
      </Text>
      <View style={styles.pips}>
        {Array.from({ length: maxScales }, (_, i) => (
          <View key={i} style={[styles.scale, i < left && styles.scaleOn]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6 },
  chip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 4, paddingHorizontal: 8, height: 26, borderRadius: radius.pill, backgroundColor: colors.ink800, borderWidth: 1, borderColor: 'transparent' },
  name: { flexShrink: 1, fontSize: 11, lineHeight: 15 },
  struck: { textDecorationLine: 'line-through' },
  bold: { fontWeight: '700' },
  pips: { flexDirection: 'row', gap: 3 },
  pip: { width: 7, height: 7, borderRadius: 4, borderWidth: 1.2 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, height: 24, borderRadius: radius.pill, backgroundColor: colors.ink800 },
  scale: { width: 9, height: 9, borderRadius: 5, borderWidth: 1.2, borderColor: colors.ink500 },
  scaleOn: { backgroundColor: colors.verdigris, borderColor: '#7FF3FF' },
  layer: { width: 9, height: 9, borderRadius: 2, borderWidth: 1.2, borderColor: colors.ink500 },
  layerOn: { backgroundColor: '#9097AE', borderColor: '#B8BED4' },
});
