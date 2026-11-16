/**
 * Estúdio — onde o Áster é montado. O Áster fica vivo no topo o tempo todo; tocar numa peça a
 * veste na hora, como prévia (mesmo as bloqueadas: é a vitrine do que vem pela frente). Nada muda
 * de verdade até "Equipar". A barra de baixo diz o que a peça é, como consegui-la e o que dá para
 * fazer com ela agora.
 */
import { router, useLocalSearchParams } from 'expo-router';
import { memo, useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BOSSES } from '../content/bosses';
import { ELEMENT_LABEL, ITEMS, OPTIONAL_SLOTS, RARITY_LABEL, RARITY_TIER, SLOT_HINT, SLOT_LABEL, SLOT_ORDER, getItem, type ItemDef, type ItemSlot, type Rarity } from '../content/items';
import type { Equipped } from '../domain/game/types';
import { levelProgress, rankFor } from '../domain/progression/levels';
import { useStagePaused } from '../features/useStagePaused';
import { buy, equip, unequip } from '../state/actions';
import { useGame } from '../state/store';
import { Aster } from '../ui/Aster';
import { Button } from '../ui/Button';
import { Chip } from '../ui/Chip';
import { haptic, useReduceMotion } from '../ui/feedback';
import { Icon } from '../ui/Icon';
import { IconButton } from '../ui/IconButton';
import { useWide } from '../ui/layout';
import { ItemGlyph } from '../ui/ItemGlyph';
import { MapBackdrop } from '../ui/MapBackdrop';
import { Pill } from '../ui/Pill';
import { SceneStage } from '../ui/SceneStage';
import { Text } from '../ui/Text';
import { MYTHIC_COLOR, colors, radius, rarityColor, space } from '../ui/theme';
import { resolveSynergy } from '../ui/vfx/synergy';

type Filter = 'todos' | 'meus' | 'venda' | 'bloqueados';
const FILTER_LABEL: Record<Filter, string> = { todos: 'Tudo', meus: 'Minhas', venda: 'À venda', bloqueados: 'A conquistar' };
const RARITIES: Rarity[] = ['comum', 'incomum', 'raro', 'epico', 'lendario'];
const GAP = space.sm;
const PAD = space.lg;
/** Largura máxima do Estúdio em dois painéis. */
const WIDE_MAX = 1320;

type Row = { key: string; kind: 'head'; rarity: Rarity; owned: number; total: number } | { key: string; kind: 'tiles'; items: ItemDef[] };

const isSlot = (s: unknown): s is ItemSlot => typeof s === 'string' && (SLOT_ORDER as readonly string[]).includes(s);
const isOptional = (s: ItemSlot) => (OPTIONAL_SLOTS as readonly string[]).includes(s);

/** Origem em poucas letras, para a etiqueta da peça bloqueada. */
function sourceHint(item: ItemDef): { icon: 'ink' | 'lock'; text: string } {
  if (item.price !== undefined) return { icon: 'ink', text: String(item.price) };
  const level = /nível (\d+)/.exec(item.howToGet);
  if (level) return { icon: 'lock', text: `Nível ${level[1]}` };
  if (/chef/i.test(item.howToGet)) return { icon: 'lock', text: 'Chefão' };
  return { icon: 'lock', text: 'Feito' };
}

/** Losangos de raridade: um para comum, cinco para lendário. Dá para ler sem ler. */
function Pips({ rarity, dim = false }: { rarity: Rarity; dim?: boolean }) {
  const n = RARITY_TIER[rarity] + 1;
  const color = dim ? colors.ink500 : rarityColor[rarity];
  return (
    <View style={styles.pips} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {Array.from({ length: n }, (_, i) => (
        <View key={i} style={[styles.pip, { backgroundColor: color }]} />
      ))}
    </View>
  );
}

const Tile = memo(function Tile({ item, owned, inUse, selected, width, onPick }: { item: ItemDef; owned: boolean; inUse: boolean; selected: boolean; width: number; onPick: (id: string) => void }) {
  const tier = RARITY_TIER[item.rarity];
  const tone = rarityColor[item.rarity];
  const hint = owned ? null : sourceHint(item);
  return (
    <Pressable
      onPress={() => onPick(item.id)}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${item.name}, ${RARITY_LABEL[item.rarity]}. ${inUse ? 'Em uso' : owned ? 'Na coleção' : `Bloqueada: ${item.howToGet}`}`}
      style={[
        styles.tile,
        { width, borderColor: selected ? colors.parchment : owned ? `${tone}${tier >= 2 ? 'B0' : '55'}` : colors.lineSoft, backgroundColor: owned && tier >= 3 ? `${tone}16` : colors.ink800 },
        selected && styles.tileSelected,
      ]}
    >
      {item.slot === 'title' ? (
        <View style={[styles.plate, { borderColor: owned ? tone : colors.ink500 }]}>
          <Text variant="caption" align="center" numberOfLines={3} color={owned ? item.visual.color : colors.mistDim}>
            {item.name}
          </Text>
        </View>
      ) : (
        <ItemGlyph itemId={item.id} size={Math.min(64, width - 30)} locked={!owned} />
      )}
      <Pips rarity={item.rarity} dim={!owned} />
      {item.slot === 'title' ? null : (
        <Text variant="caption" align="center" numberOfLines={2} color={owned ? colors.parchment : colors.mist} style={styles.tileName}>
          {item.name}
        </Text>
      )}
      {inUse ? (
        <View style={styles.inUse}>
          <Text variant="label" color={colors.ink900} style={styles.tagText}>
            Em uso
          </Text>
        </View>
      ) : hint ? (
        <View style={styles.hint}>
          <Icon name={hint.icon} size={12} color={hint.icon === 'ink' ? colors.iris : colors.mistDim} />
          <Text variant="label" color={hint.icon === 'ink' ? colors.iris : colors.mistDim} style={styles.tagText}>
            {hint.text}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
});

export default function Studio() {
  const params = useLocalSearchParams<{ slot?: string }>();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const reduce = useReduceMotion();
  const stagePaused = useStagePaused();
  const profile = useGame((g) => g.profile);
  const inventory = useGame((g) => g.inventory);
  const bosses = useGame((g) => g.bosses);
  const equipped = profile.equipped;
  const level = levelProgress(profile.xp).level;
  const trophies = useMemo(() => BOSSES.filter((b) => (bosses[b.id]?.wins ?? 0) > 0).length, [bosses]);

  const [slot, setSlot] = useState<ItemSlot>(isSlot(params.slot) ? params.slot : 'core');
  const [filter, setFilter] = useState<Filter>('todos');
  const [picked, setPicked] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [spark, setSpark] = useState(0);

  const focusId = picked ?? equipped[slot];
  const focus = focusId ? getItem(focusId) : null;
  const previewing = picked !== null && picked !== equipped[slot];
  const shown: Equipped = useMemo(() => (picked ? { ...equipped, [getItem(picked).slot]: picked } : equipped), [equipped, picked]);
  const synergy = useMemo(() => resolveSynergy(shown), [shown]);
  const owned = focus ? !!inventory[focus.id] : false;
  const inUse = focus ? equipped[slot] === focus.id : false;

  // Janela larga: dois painéis. A grade só conta com a largura do painel dela.
  const wide = useWide();
  const paneW = Math.round(Math.min(520, Math.max(360, width * 0.38)));
  const listW = wide ? Math.min(WIDE_MAX, width) - paneW - PAD * 3 : width;
  const cols = Math.max(3, Math.min(7, Math.floor((listW - PAD * 2 + GAP) / ((wide ? 118 : 104) + GAP))));
  const tileW = Math.floor((listW - PAD * 2 - GAP * (cols - 1)) / cols);
  // O palco cede espaço à grade em telas baixas: a peça escolhida precisa de vizinhas à vista.
  const stageH = wide ? Math.round(Math.min(paneW - PAD, Math.max(260, height * 0.46))) : Math.round(Math.min(290, Math.max(168, height * 0.245)));

  const counts = useMemo(() => {
    const out = {} as Record<ItemSlot, { owned: number; total: number }>;
    for (const s of SLOT_ORDER) out[s] = { owned: 0, total: 0 };
    for (const i of ITEMS) {
      out[i.slot].total++;
      if (inventory[i.id]) out[i.slot].owned++;
    }
    return out;
  }, [inventory]);
  const ownedTotal = Object.keys(inventory).length;

  const rows = useMemo<Row[]>(() => {
    const all = ITEMS.filter((i) => i.slot === slot);
    const pass = (i: ItemDef) => (filter === 'todos' ? true : filter === 'meus' ? !!inventory[i.id] : filter === 'venda' ? !inventory[i.id] && i.price !== undefined : !inventory[i.id]);
    const out: Row[] = [];
    for (const rarity of RARITIES) {
      const ofRarity = all.filter((i) => i.rarity === rarity);
      const items = ofRarity.filter(pass);
      if (items.length === 0) continue;
      out.push({ key: `h-${rarity}`, kind: 'head', rarity, owned: ofRarity.filter((i) => inventory[i.id]).length, total: ofRarity.length });
      for (let i = 0; i < items.length; i += cols) out.push({ key: `r-${rarity}-${i}`, kind: 'tiles', items: items.slice(i, i + cols) });
    }
    return out;
  }, [slot, filter, inventory, cols]);

  const pick = useCallback(
    (id: string) => {
      haptic('select');
      setConfirm(null);
      setError(null);
      setPicked((cur) => (cur === id ? cur : id));
    },
    [],
  );

  const changeSlot = (s: ItemSlot) => {
    haptic('select');
    setSlot(s);
    setPicked(null);
    setConfirm(null);
    setError(null);
  };

  const run = async (fn: () => Promise<unknown>, done?: () => void) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
      haptic('success');
      done?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
      setConfirm(null);
    }
  };

  const renderRow = useCallback(
    ({ item: row }: { item: Row }) =>
      row.kind === 'head' ? (
        <View style={styles.head}>
          <View style={[styles.headBar, { backgroundColor: rarityColor[row.rarity] }]} />
          <Text variant="label" color={rarityColor[row.rarity]}>
            {RARITY_LABEL[row.rarity]}
          </Text>
          <Pips rarity={row.rarity} />
          <Text variant="caption" color={colors.mistDim} style={styles.headCount}>
            {row.owned}/{row.total}
          </Text>
        </View>
      ) : (
        <View style={styles.row}>
          {row.items.map((item) => (
            <Tile key={item.id} item={item} width={tileW} owned={!!inventory[item.id]} inUse={equipped[item.slot] === item.id} selected={focusId === item.id} onPick={pick} />
          ))}
        </View>
      ),
    [tileW, inventory, equipped, focusId, pick],
  );

  const price = focus?.price;
  const short = price !== undefined ? Math.max(0, price - profile.ink) : 0;
  const titleShown = shown.title ? getItem(shown.title).name : rankFor(level).title;

  const header = (
        <View style={styles.header}>
          <IconButton icon="chevronLeft" label="Voltar" onPress={() => router.back()} color={colors.parchment} />
          <View style={styles.headerText}>
            <Text variant="heading">Estúdio</Text>
            <Text variant="caption" color={colors.mist}>
              {ownedTotal} de {ITEMS.length} peças
            </Text>
          </View>
          <Pressable onPress={() => router.push('/workshop')} accessibilityRole="button" accessibilityLabel={`Oficina. Você tem ${profile.ink} de Tinta`} hitSlop={8}>
            <Pill icon="ink" value={String(profile.ink)} color={colors.iris} label="Tinta" />
          </Pressable>
        </View>
  );
  const stage = (
        <Pressable
          onPress={() => {
            haptic('impact');
            setSpark((n) => n + 1);
          }}
          accessibilityRole="button"
          accessibilityLabel="Áster. Toque para acender"
        >
          <SceneStage scene={shown.scene} height={stageH} animate={!reduce} paused={stagePaused} reserve>
            <Aster level={level} equipped={shown} size={stageH - 14} animate={!reduce} paused={stagePaused} trophies={trophies} igniteKey={spark} />
            <View style={styles.nameplate} pointerEvents="none">
              <Text variant="caption" color={shown.title ? getItem(shown.title).visual.color : colors.brass} numberOfLines={1}>
                {titleShown}
              </Text>
            </View>
            {previewing ? (
              <View style={styles.previewTag} pointerEvents="none">
                <Text variant="label" color={colors.ink900} style={styles.tagText}>
                  Prévia
                </Text>
              </View>
            ) : null}
            {synergy ? (
              <View style={[styles.synergy, { borderColor: synergy.kind === 'mythic' ? MYTHIC_COLOR : colors.line }]} pointerEvents="none">
                <Icon name="sparkle" size={12} color={synergy.kind === 'mythic' ? MYTHIC_COLOR : colors.brass} fill={synergy.kind === 'mythic' ? MYTHIC_COLOR : colors.brass} />
                <Text variant="caption" color={colors.parchment} numberOfLines={1}>
                  {synergy.label}
                </Text>
              </View>
            ) : null}
          </SceneStage>
        </Pressable>
  );
  const slots = (
    <>
          {SLOT_ORDER.map((s) => {
            const id = equipped[s];
            const active = s === slot;
            return (
              <Pressable
                key={s}
                onPress={() => changeSlot(s)}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`${SLOT_LABEL[s]}: ${id ? getItem(id).name : 'vazio'}. ${counts[s].owned} de ${counts[s].total} peças`}
                style={[styles.slot, active && styles.slotActive]}
              >
                {id && s !== 'title' ? <ItemGlyph itemId={id} size={38} /> : <View style={[styles.slotEmpty, id ? { borderStyle: 'solid', borderColor: colors.brass } : null]}>{id ? <Icon name="sparkle" size={14} color={colors.brass} /> : null}</View>}
                <Text variant="caption" color={active ? colors.brass : colors.parchmentDim} numberOfLines={1}>
                  {SLOT_LABEL[s]}
                </Text>
                <Text variant="label" color={colors.mistDim} style={styles.tagText}>
                  {counts[s].owned}/{counts[s].total}
                </Text>
              </Pressable>
            );
          })}
    </>
  );
  const list = (
      <FlatList
        data={rows}
        keyExtractor={(r) => r.key}
        renderItem={renderRow}
        extraData={focusId}
        initialNumToRender={5}
        maxToRenderPerBatch={4}
        windowSize={7}
        removeClippedSubviews
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.listHead}>
            <View style={styles.filters}>
              {(Object.keys(FILTER_LABEL) as Filter[]).map((f) => (
                <Chip key={f} label={FILTER_LABEL[f]} selected={filter === f} onPress={() => setFilter(f)} />
              ))}
            </View>
          </View>
        }
        ListEmptyComponent={
          <Text variant="caption" color={colors.mist} style={styles.empty}>
            {filter === 'meus' ? 'Você ainda não tem peças neste espaço.' : filter === 'venda' ? 'Nada à venda neste espaço agora.' : 'Você já tem todas as peças deste espaço.'}
          </Text>
        }
      />
  );
  const bar = (
      <View style={wide ? styles.barWide : [styles.bar, { paddingBottom: insets.bottom + space.md }]}>
        {focus ? (
          <>
            <View style={styles.barHead}>
              <View style={styles.barText}>
                <Text variant="label" color={rarityColor[focus.rarity]}>
                  {RARITY_LABEL[focus.rarity]} · {SLOT_LABEL[focus.slot]}
                  {focus.visual.element ? ` · ${ELEMENT_LABEL[focus.visual.element]}` : ''}
                </Text>
                <Text variant="subheading" numberOfLines={1}>
                  {focus.name}
                </Text>
              </View>
              {previewing ? <IconButton icon="close" label="Desfazer a prévia" onPress={() => setPicked(null)} color={colors.mist} /> : null}
            </View>
            <Text variant="caption" color={colors.parchmentDim} numberOfLines={2}>
              {focus.description}
            </Text>
            {!owned ? (
              <View style={styles.how}>
                <Icon name={price !== undefined ? 'ink' : 'lock'} size={14} color={price !== undefined ? colors.iris : colors.mist} />
                <Text variant="caption" color={colors.mist} style={styles.barText}>
                  {price !== undefined && short > 0 ? `${focus.howToGet} Faltam ${short}.` : focus.howToGet}
                </Text>
              </View>
            ) : null}
            {error ? (
              <Text variant="caption" color={colors.ember}>
                {error}
              </Text>
            ) : null}
            {owned && !inUse ? (
              <Button label="Equipar" icon="sparkle" size="md" loading={busy} onPress={() => run(() => equip(focus.id), () => setPicked(null))} />
            ) : owned && inUse && isOptional(focus.slot) ? (
              <Button label={`Em uso · Remover ${SLOT_LABEL[focus.slot].toLowerCase()}`} variant="ghost" size="md" loading={busy} onPress={() => run(() => unequip(focus.slot as never))} />
            ) : owned ? (
              <View style={styles.wearing}>
                <Icon name="check" size={14} color={colors.brass} />
                <Text variant="caption" color={colors.brass}>
                  Em uso
                </Text>
              </View>
            ) : price !== undefined ? (
              <Button
                label={confirm === focus.id ? `Confirmar · ${price} de Tinta` : `Forjar · ${price} de Tinta`}
                icon="ink"
                size="md"
                disabled={short > 0}
                loading={busy}
                onPress={() => (confirm === focus.id ? run(() => buy(focus.id), () => setPicked(null)) : setConfirm(focus.id))}
              />
            ) : null}
          </>
        ) : (
          <Text variant="caption" color={colors.mist}>
            {SLOT_HINT[slot]} Nada em uso aqui: toque numa peça para ver como fica no seu Áster.
          </Text>
        )}
      </View>
  );

  if (wide) {
    // Computador: o Áster e a ficha da peça ficam à esquerda, sempre à vista; as peças rolam à direita.
    return (
      <View style={styles.root}>
        <MapBackdrop glow={focus ? rarityColor[focus.rarity] : undefined} />
        <View style={[styles.wideRow, { paddingTop: insets.top + space.xl }]}>
          <View style={[styles.widePane, { width: paneW }]}>
            {header}
            {stage}
            {bar}
          </View>
          <View style={styles.wideList}>
            <View style={styles.railWrap}>{slots}</View>
            {list}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <MapBackdrop glow={focus ? rarityColor[focus.rarity] : undefined} />
      <View style={[styles.top, { paddingTop: insets.top + space.sm }]}>
        {header}
        {stage}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
          {slots}
        </ScrollView>
      </View>
      {list}
      {bar}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ink900 },
  top: { paddingHorizontal: PAD, gap: space.sm },
  header: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  headerText: { flex: 1 },
  nameplate: { position: 'absolute', bottom: 8, alignSelf: 'center', paddingHorizontal: space.md, paddingVertical: 3, borderRadius: radius.pill, backgroundColor: 'rgba(11, 16, 32, 0.72)' },
  previewTag: { position: 'absolute', top: 10, left: 10, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: colors.parchment },
  synergy: { position: 'absolute', top: 10, right: 10, maxWidth: '62%', flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.pill, borderWidth: 1, backgroundColor: 'rgba(11, 16, 32, 0.72)' },
  rail: { gap: 6, paddingVertical: 2 },
  slot: { width: 72, alignItems: 'center', gap: 1, paddingVertical: 4, borderRadius: radius.md, borderWidth: 1, borderColor: 'transparent' },
  slotActive: { borderColor: colors.line, backgroundColor: colors.ink800 },
  slotEmpty: { width: 38, height: 38, borderRadius: 19, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.ink500, alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: PAD, paddingBottom: space.xl, gap: GAP },
  listHead: { gap: space.sm, paddingTop: space.sm },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  empty: { paddingVertical: space.xl },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.sm },
  headBar: { width: 3, height: 14, borderRadius: 2 },
  headCount: { marginLeft: 'auto' },
  row: { flexDirection: 'row', gap: GAP },
  tile: { alignItems: 'center', gap: 4, paddingTop: space.sm, paddingBottom: 6, paddingHorizontal: 4, borderRadius: radius.md, borderWidth: 1.2, minHeight: 128 },
  tileSelected: { borderWidth: 2, backgroundColor: colors.ink700 },
  tileName: { minHeight: 36 },
  plate: { alignSelf: 'stretch', minHeight: 64, marginHorizontal: 4, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm, borderWidth: 1, backgroundColor: colors.ink850 },
  pips: { flexDirection: 'row', gap: 3, height: 7, alignItems: 'center' },
  pip: { width: 5, height: 5, borderRadius: 1, transform: [{ rotate: '45deg' }] },
  inUse: { backgroundColor: colors.brass, paddingHorizontal: 7, paddingVertical: 2, borderRadius: radius.pill },
  hint: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  tagText: { fontSize: 10, lineHeight: 12, letterSpacing: 0.6 },
  bar: { paddingHorizontal: PAD, paddingTop: space.sm, gap: 6, borderTopWidth: 1, borderColor: colors.line, backgroundColor: colors.ink850 },
  barHead: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  barText: { flex: 1 },
  how: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  wideRow: { flex: 1, flexDirection: 'row', gap: PAD, paddingHorizontal: PAD, paddingBottom: PAD, width: '100%', maxWidth: WIDE_MAX, alignSelf: 'center' },
  widePane: { gap: space.md },
  wideList: { flex: 1, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.lineSoft, backgroundColor: 'rgba(14, 20, 40, 0.6)', overflow: 'hidden' },
  railWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: PAD, paddingTop: space.md },
  barWide: { padding: PAD, gap: space.sm, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.ink850 },
  wearing: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 2 },
});
