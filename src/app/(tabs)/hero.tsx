/**
 * Herói — o astrolábio em destaque, estatísticas honestas, equipamentos,
 * coleção (com o caminho para cada item) e a estrada de recompensas.
 */
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ITEMS, RARITY_LABEL, SLOT_LABEL, getItem, type ItemSlot } from '../../content/items';
import { echoCount } from '../../domain/learning/srs';
import { levelProgress, rankFor } from '../../domain/progression/levels';
import { rewardsForLevel } from '../../domain/progression/rewards';
import { TryOnSheet } from '../../features/hero/TryOnSheet';
import { useStagePaused } from '../../features/useStagePaused';
import { unequip } from '../../state/actions';
import { useGame } from '../../state/store';
import { Astrolabe } from '../../ui/Astrolabe';
import { Chip } from '../../ui/Chip';
import { haptic, useReduceMotion } from '../../ui/feedback';
import { Icon } from '../../ui/Icon';
import { ItemGlyph } from '../../ui/ItemGlyph';
import { Panel } from '../../ui/Panel';
import { Screen } from '../../ui/Screen';
import { Text } from '../../ui/Text';
import { MYTHIC_COLOR, TAB_BAR_SPACE, colors, radius, rarityColor, space } from '../../ui/theme';
import { resolveSynergy } from '../../ui/vfx/synergy';

const SLOTS: ItemSlot[] = ['frame', 'core', 'aura', 'title'];
const MIN_FOR_ACCURACY = 10;

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
  const [slot, setSlot] = useState<ItemSlot>('frame');
  const [trying, setTrying] = useState<string | null>(null);
  const synergy = useMemo(() => resolveSynergy(profile.equipped), [profile.equipped]);
  const progress = levelProgress(profile.xp);
  const rank = rankFor(progress.level);
  const echoes = useMemo(() => echoCount(questionStates), [questionStates]);
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

  const items = ITEMS.filter((i) => i.slot === slot);
  const equippedId = profile.equipped[slot];

  return (
    <Screen bottomInset={TAB_BAR_SPACE}>
      <Text variant="title">Herói</Text>
      <View style={styles.hero}>
        <Astrolabe level={progress.level} equipped={profile.equipped} size={300} animate={!reduce} paused={stagePaused || !!trying} />
        <Text variant="heading" align="center">
          {profile.name || 'Cartógrafo sem nome'}
        </Text>
        <Text variant="subheading" color={colors.brass} align="center">
          {profile.equipped.title ? getItem(profile.equipped.title).name : rank.title}
        </Text>
        <Text variant="caption" color={colors.mist} align="center">
          Nível {progress.level} · patente {rank.title} · {profile.xp.toLocaleString('pt-BR')} XP no total
        </Text>
        <Text variant="caption" color={colors.mistDim} align="center" style={{ marginTop: space.xs }}>
          A estrela do astrolábio ganha uma ponta a cada patente; o anel ganha gravações a cada nível.
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
            Dica: núcleo e aura do mesmo elemento entram em Ressonância.
          </Text>
        )}
      </View>

      <View style={styles.stats}>
        <Stat label="questões respondidas" value={String(answered)} />
        <Stat
          label="de acerto"
          value={answered >= MIN_FOR_ACCURACY ? `${Math.round((correct / answered) * 100)}%` : '—'}
          note={answered >= MIN_FOR_ACCURACY ? undefined : `após ${MIN_FOR_ACCURACY} respostas`}
        />
        <Stat label="de estudo" value={formatTime(timeMs)} />
        <Stat label="Ecos ativos" value={String(echoes)} />
      </View>

      <Panel>
        <Text variant="label" color={colors.brass} style={{ marginBottom: space.md }}>
          Equipamento
        </Text>
        <View style={styles.slots}>
          {SLOTS.map((s) => {
            const id = profile.equipped[s];
            return (
              <Pressable
                key={s}
                style={[styles.slot, slot === s && styles.slotActive]}
                onPress={() => setSlot(s)}
                accessibilityRole="button"
                accessibilityLabel={`${SLOT_LABEL[s]}: ${id ? getItem(id).name : 'vazio'}`}
              >
                {id ? <ItemGlyph itemId={id} size={44} /> : <View style={styles.emptySlot} />}
                <Text variant="caption" color={slot === s ? colors.brass : colors.mist}>
                  {SLOT_LABEL[s]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Panel>

      <View style={{ gap: space.md }}>
        <View style={styles.collectionHead}>
          <View>
            <Text variant="subheading">Coleção</Text>
            <Text variant="caption" color={colors.mist}>
              {owned} de {ITEMS.length} itens
            </Text>
          </View>
          <Chip label={`Oficina · ${profile.ink} Tinta`} icon="ink" color={colors.iris} onPress={() => router.push('/workshop')} />
        </View>
        <View style={styles.filters}>
          {SLOTS.map((s) => (
            <Chip key={s} label={SLOT_LABEL[s]} selected={slot === s} onPress={() => setSlot(s)} />
          ))}
        </View>
        {(slot === 'aura' || slot === 'title') && equippedId ? (
          <Pressable
            style={styles.none}
            onPress={() => unequip(slot)}
            accessibilityRole="button"
            accessibilityLabel={`Remover ${SLOT_LABEL[slot].toLowerCase()}`}
          >
            <Icon name="close" size={16} color={colors.mist} />
            <Text variant="caption" color={colors.mist}>
              Remover {SLOT_LABEL[slot].toLowerCase()}
            </Text>
          </Pressable>
        ) : null}
        {items.map((item) => {
          const has = !!inventory[item.id];
          const isEquipped = equippedId === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => {
                haptic('select');
                setTrying(item.id);
              }}
              accessibilityRole="button"
              accessibilityLabel={`${item.name}, ${RARITY_LABEL[item.rarity]}. ${has ? (isEquipped ? 'Equipado' : 'Toque para experimentar e equipar') : `Bloqueado: ${item.howToGet}. Toque para ver uma prévia`}`}
              style={[styles.item, isEquipped && { borderColor: colors.brass }, !has && styles.itemLocked]}
            >
              <ItemGlyph itemId={item.id} size={52} locked={!has} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="subheading" color={has ? colors.parchment : colors.mistDim}>
                  {item.name}
                </Text>
                <Text variant="caption" color={has ? rarityColor[item.rarity] : colors.mistDim}>
                  {RARITY_LABEL[item.rarity]}
                </Text>
                <Text variant="caption" color={has ? colors.parchmentDim : colors.mist}>
                  {has ? item.description : item.howToGet}
                </Text>
              </View>
              {isEquipped ? (
                <View style={styles.equippedTag}>
                  <Text variant="label" color={colors.ink900}>
                    Em uso
                  </Text>
                </View>
              ) : !has ? (
                <Icon name="lock" size={18} color={colors.mistDim} />
              ) : null}
            </Pressable>
          );
        })}
      </View>

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
      <TryOnSheet
        itemId={trying}
        owned={!!(trying && inventory[trying])}
        level={progress.level}
        equipped={profile.equipped}
        onClose={() => setTrying(null)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  slots: { flexDirection: 'row', justifyContent: 'space-between' },
  slot: { alignItems: 'center', gap: 6, padding: space.sm, borderRadius: radius.md, borderWidth: 1, borderColor: 'transparent', minWidth: 68 },
  slotActive: { borderColor: colors.line, backgroundColor: colors.ink850 },
  emptySlot: { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.ink500 },
  collectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: space.sm },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  none: { flexDirection: 'row', alignItems: 'center', gap: space.sm, alignSelf: 'flex-start', paddingVertical: space.xs },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1.2,
    borderColor: colors.lineSoft,
    backgroundColor: colors.ink800,
  },
  itemLocked: { backgroundColor: colors.ink850 },
  equippedTag: { backgroundColor: colors.brass, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.pill },
  roadRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: 6 },
  roadLevel: { width: 26, textAlign: 'right' },
  roadDot: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
});
