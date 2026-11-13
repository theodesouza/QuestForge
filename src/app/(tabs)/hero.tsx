/**
 * Herói — o Áster em destaque, o que ele já ganhou com a patente e o que vem a seguir, as nove
 * peças em uso (cada uma abre o Estúdio no seu espaço), a coleção por raridade, estatísticas
 * honestas e a estrada de recompensas.
 */
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { LESSONS, courseOf } from '../../content/academy/catalog';
import { BOSSES } from '../../content/bosses';
import { ITEMS, RARITY_LABEL, SLOT_LABEL, SLOT_ORDER, getItem, type Rarity } from '../../content/items';
import { lessonSealed } from '../../domain/academy/progress';
import { ECHO_MAX_AGE_DAYS, echoCount, echoesBeatenCount, echoesFadedCount } from '../../domain/learning/srs';
import { RANKS, levelProgress, rankFor } from '../../domain/progression/levels';
import { rewardsForLevel } from '../../domain/progression/rewards';
import { TONE } from '../../features/academy/look';
import { useStagePaused } from '../../features/useStagePaused';
import { useGame } from '../../state/store';
import { Aster, RANK_TRAIT_LABEL } from '../../ui/Aster';
import { Chip } from '../../ui/Chip';
import { Button } from '../../ui/Button';
import { haptic, useReduceMotion } from '../../ui/feedback';
import { Icon } from '../../ui/Icon';
import { ItemGlyph } from '../../ui/ItemGlyph';
import { Panel } from '../../ui/Panel';
import { SceneStage } from '../../ui/SceneStage';
import { Screen } from '../../ui/Screen';
import { Text } from '../../ui/Text';
import { MYTHIC_COLOR, TAB_BAR_SPACE, colors, radius, rarityColor, space } from '../../ui/theme';
import { resolveSynergy } from '../../ui/vfx/synergy';

const SLOTS = SLOT_ORDER;
const MIN_FOR_ACCURACY = 10;
const RARITIES: Rarity[] = ['comum', 'incomum', 'raro', 'epico', 'lendario'];

function formatTime(ms: number): string {
  const min = Math.round(ms / 60000);
  if (ms > 0 && min < 1) return '< 1 min';
  if (min < 60) return `${min} min`;
  return `${Math.floor(min / 60)} h ${min % 60} min`;
}

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <View style={styles.stat} accessible accessibilityLabel={`${label}: ${value}${note ? `, ${note}` : ''}`}>
      <Text variant="title">{value}</Text>
      <Text variant="caption" color={colors.mist}>
        {label}
      </Text>
      {note ? (
        <Text variant="caption" color={colors.mistDim}>
          {note}
        </Text>
      ) : null}
    </View>
  );
}

export default function Hero() {
  const reduce = useReduceMotion();
  const stagePaused = useStagePaused();
  const profile = useGame((g) => g.profile);
  const inventory = useGame((g) => g.inventory);
  const questionStates = useGame((g) => g.questionStates);
  const academy = useGame((g) => g.academy);
  const seals = useMemo(() => LESSONS.filter((l) => lessonSealed(l, academy)), [academy]);
  const masteredStages = useMemo(() => Object.values(academy).filter((p) => p.masteredAt !== null).length, [academy]);
  const bosses = useGame((g) => g.bosses);
  const [spark, setSpark] = useState(0);
  const trophies = useMemo(() => BOSSES.filter((b) => (bosses[b.id]?.wins ?? 0) > 0).length, [bosses]);
  const synergy = useMemo(() => resolveSynergy(profile.equipped), [profile.equipped]);
  const progress = levelProgress(profile.xp);
  const rank = rankFor(progress.level);
  const echoes = useMemo(() => echoCount(questionStates), [questionStates]);
  const echoesBeaten = useMemo(() => echoesBeatenCount(questionStates), [questionStates]);
  const echoesFaded = useMemo(() => echoesFadedCount(questionStates), [questionStates]);
  const { answered, correct, timeMs } = profile.totals;
  const owned = Object.keys(inventory).length;

  const road = useMemo(() => {
    const list: { level: number; text: string; itemId: string | null }[] = [];
    for (let l = progress.level + 1; l <= Math.min(50, progress.level + 5); l++) {
      const rewards = rewardsForLevel(l);
      const item = rewards.find((r) => r.kind === 'item');
      const ink = rewards.find((r) => r.kind === 'ink');
      list.push({
        level: l,
        itemId: item && item.kind === 'item' ? item.itemId : null,
        text: [item && item.kind === 'item' ? getItem(item.itemId).name : null, ink && ink.kind === 'ink' ? `+${ink.amount} Tinta` : null]
          .filter(Boolean)
          .join(' · '),
      });
    }
    return list;
  }, [progress.level]);

  const byRarity = useMemo(
    () =>
      RARITIES.map((rarity) => {
        const all = ITEMS.filter((i) => i.rarity === rarity);
        return { rarity, owned: all.filter((i) => inventory[i.id]).length, total: all.length };
      }),
    [inventory],
  );
  const nextRank = RANKS[rank.index + 1];
  const openStudio = (slot?: string) => router.push(slot ? { pathname: '/studio', params: { slot } } : '/studio');

  return (
    <Screen tab bottomInset={TAB_BAR_SPACE}>
      <Text variant="title">Seu Áster</Text>
      <View style={styles.hero}>
        <Pressable
          onPress={() => {
            haptic('impact');
            setSpark((n) => n + 1);
          }}
          accessibilityRole="button"
          accessibilityLabel="Seu Áster. Toque para acender"
          style={{ alignSelf: 'stretch' }}
        >
          <SceneStage scene={profile.equipped.scene} height={336} animate={!reduce} paused={stagePaused} reserve>
            <Aster level={progress.level} equipped={profile.equipped} size={300} animate={!reduce} paused={stagePaused} trophies={trophies} igniteKey={spark} />
          </SceneStage>
        </Pressable>
        <Text variant="heading" align="center">
          {profile.name || 'Viajante sem nome'}
        </Text>
        <Text variant="subheading" color={colors.brass} align="center">
          {profile.equipped.title ? getItem(profile.equipped.title).name : rank.title}
        </Text>
        <Text variant="caption" color={colors.mist} align="center">
          Nível {progress.level} · patente {rank.title} · {profile.xp.toLocaleString('pt-BR')} XP no total
        </Text>
        {synergy ? (
          <View style={[styles.synergy, { borderColor: synergy.kind === 'mythic' ? MYTHIC_COLOR : colors.line }]}>
            <Icon name="sparkle" size={16} color={synergy.kind === 'mythic' ? MYTHIC_COLOR : colors.brass} fill={synergy.kind === 'mythic' ? MYTHIC_COLOR : colors.brass} />
            <Text variant="caption" color={colors.parchment}>
              {synergy.label}
            </Text>
          </View>
        ) : (
          <Text variant="caption" color={colors.mistDim} align="center">
            Dica: núcleo e campo do mesmo elemento entram em Ressonância.
          </Text>
        )}
      </View>

      <Panel accent={colors.brass}>
        <Text variant="label" color={colors.brass}>
          Evolução do Áster
        </Text>
        <Text variant="caption" color={colors.parchmentDim} style={{ marginTop: space.xs }}>
          O corpo cresce a cada nível. Na patente {rank.title}, ele já tem {RANK_TRAIT_LABEL.slice(1, rank.index + 1).length ? RANK_TRAIT_LABEL.slice(1, rank.index + 1).join(', ') : RANK_TRAIT_LABEL[0]}.
        </Text>
        {nextRank ? (
          <View style={styles.next}>
            <Icon name="sparkle" size={14} color={colors.brass} />
            <Text variant="caption" color={colors.parchment} style={{ flex: 1 }}>
              No nível {nextRank.from} ({nextRank.title}): {RANK_TRAIT_LABEL[rank.index + 1]}.
            </Text>
          </View>
        ) : null}
        <View style={styles.next}>
          <Icon name="seal" size={14} color={colors.brass} />
          <Text variant="caption" color={colors.parchment} style={{ flex: 1 }}>
            Coroa: {trophies} de {BOSSES.length} estrelas — cada chefão vencido acende uma.
          </Text>
        </View>
      </Panel>

      <View style={{ gap: space.md }}>
        <View style={styles.collectionHead}>
          <View style={{ flex: 1 }}>
            <Text variant="subheading">Em uso</Text>
            <Text variant="caption" color={colors.mist}>
              Toque num espaço para trocar a peça
            </Text>
          </View>
          <Chip label={`${profile.ink} Tinta`} icon="ink" color={colors.iris} onPress={() => router.push('/workshop')} accessibilityLabel={`Oficina. Você tem ${profile.ink} de Tinta`} />
        </View>
        <View style={styles.loadout}>
          {SLOTS.map((s) => {
            const id = profile.equipped[s];
            const item = id ? getItem(id) : null;
            return (
              <Pressable
                key={s}
                style={[styles.cell, item ? { borderColor: `${rarityColor[item.rarity]}66` } : null]}
                onPress={() => {
                  haptic('select');
                  openStudio(s);
                }}
                accessibilityRole="button"
                accessibilityLabel={`${SLOT_LABEL[s]}: ${item ? `${item.name}, ${RARITY_LABEL[item.rarity]}` : 'vazio'}. Abrir no Estúdio`}
              >
                {item && s !== 'title' ? <ItemGlyph itemId={item.id} size={46} /> : <View style={styles.emptySlot}>{item ? <Icon name="sparkle" size={16} color={item.visual.color} /> : null}</View>}
                <Text variant="label" color={colors.mist} style={styles.cellLabel}>
                  {SLOT_LABEL[s]}
                </Text>
                <Text variant="caption" align="center" numberOfLines={2} color={item ? colors.parchment : colors.mistDim}>
                  {item ? item.name : 'Vazio'}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Button label="Abrir o Estúdio" icon="sparkle" onPress={() => openStudio()} />
      </View>

      <Panel>
        <View style={styles.collectionHead}>
          <Text variant="label" color={colors.brass}>
            Coleção
          </Text>
          <Text variant="caption" color={colors.mist}>
            {owned} de {ITEMS.length} peças
          </Text>
        </View>
        <View style={{ gap: space.sm, marginTop: space.md }}>
          {byRarity.map((r) => (
            <View key={r.rarity} style={styles.rarityRow} accessible accessibilityLabel={`${RARITY_LABEL[r.rarity]}: ${r.owned} de ${r.total}`}>
              <Text variant="caption" color={rarityColor[r.rarity]} style={styles.rarityName}>
                {RARITY_LABEL[r.rarity]}
              </Text>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${Math.round((r.owned / Math.max(1, r.total)) * 100)}%`, backgroundColor: rarityColor[r.rarity] }]} />
              </View>
              <Text variant="caption" color={colors.mist} style={styles.rarityCount}>
                {r.owned}/{r.total}
              </Text>
            </View>
          ))}
        </View>
      </Panel>

      <View style={styles.stats}>
        <Stat label="questões respondidas" value={String(answered)} />
        <Stat
          label="de acerto"
          value={answered >= MIN_FOR_ACCURACY ? `${Math.round((correct / answered) * 100)}%` : '—'}
          note={answered >= MIN_FOR_ACCURACY ? undefined : `após ${MIN_FOR_ACCURACY} respostas`}
        />
        <Stat label="de estudo" value={formatTime(timeMs)} />
        <Stat label="Ecos ativos" value={String(echoes)} note={`somem após ${ECHO_MAX_AGE_DAYS} dias`} />
        <Stat label="Ecos superados" value={String(echoesBeaten)} note="errou e depois acertou" />
        {echoesFaded > 0 ? <Stat label="Ecos dissipados" value={String(echoesFaded)} note="eram muito antigos" /> : null}
      </View>

      <Button label="Ver minha evolução" icon="book" variant="secondary" onPress={() => router.push('/progress')} />

      <Panel accent={colors.verdigris}>
        <View style={styles.sealsHead}>
          <Icon name="seal" size={20} color={colors.verdigris} fill={colors.verdigrisGlow} />
          <Text variant="label" color={colors.verdigris} style={{ flex: 1 }}>
            Insígnias de domínio
          </Text>
          <Pressable onPress={() => router.push('/academy')} accessibilityRole="button" accessibilityLabel="Abrir a Academia" hitSlop={8}>
            <Text variant="caption" color={colors.brass}>
              Academia
            </Text>
          </Pressable>
        </View>
        <Text variant="caption" color={colors.parchmentDim} style={{ marginTop: space.xs }}>
          {masteredStages} etapa{masteredStages === 1 ? '' : 's'} dominada{masteredStages === 1 ? '' : 's'} sem ajuda · {seals.length} de {LESSONS.length} aulas com insígnia. Uma insígnia exige dominar todas as etapas de uma aula.
        </Text>
        {seals.length ? (
          <View style={styles.seals}>
            {seals.map((l) => (
              <View key={l.id} style={[styles.sealChip, { borderColor: TONE[courseOf(l).tone] }]}>
                <Icon name="seal" size={14} color={TONE[courseOf(l).tone]} fill={colors.ink900} />
                <Text variant="caption" color={colors.parchment}>
                  {l.title}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </Panel>

      {road.length > 0 ? (
        <Panel tone="sunken">
          <Text variant="label" color={colors.brass} style={{ marginBottom: space.sm }}>
            Estrada de recompensas
          </Text>
          {road.map((r) => (
            <View key={r.level} style={styles.roadRow}>
              <Text variant="number" color={colors.mist} style={styles.roadLevel}>
                {r.level}
              </Text>
              {r.itemId ? <ItemGlyph itemId={r.itemId} size={30} /> : <View style={styles.roadDot} />}
              <Text variant="caption" color={r.itemId ? colors.parchment : colors.mist} style={{ flex: 1 }}>
                {r.text}
              </Text>
            </View>
          ))}
        </Panel>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  sealsHead: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  seals: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.md },
  sealChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: space.sm, minHeight: 30, borderRadius: radius.pill, borderWidth: 1 },
  hero: { alignItems: 'center', gap: 2 },
  synergy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginTop: space.sm,
    paddingHorizontal: space.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    backgroundColor: colors.ink800,
  },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  stat: {
    flexBasis: '47%',
    flexGrow: 1,
    padding: space.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.ink800,
    borderWidth: 1,
    borderColor: colors.lineSoft,
  },
  next: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.sm },
  loadout: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  cell: { flexBasis: '30%', flexGrow: 1, alignItems: 'center', gap: 3, paddingVertical: space.md, paddingHorizontal: 4, borderRadius: radius.md, borderWidth: 1.2, borderColor: colors.lineSoft, backgroundColor: colors.ink800, minHeight: 124 },
  cellLabel: { fontSize: 10, lineHeight: 12, marginTop: 2 },
  emptySlot: { width: 46, height: 46, borderRadius: 23, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.ink500, alignItems: 'center', justifyContent: 'center' },
  rarityRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  rarityName: { width: 76 },
  rarityCount: { width: 48, textAlign: 'right' },
  track: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.ink700, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
  collectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space.sm },
  roadRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: 6 },
  roadLevel: { width: 26, textAlign: 'right' },
  roadDot: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
});
