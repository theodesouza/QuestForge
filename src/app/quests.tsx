/**
 * Encomendas: o quadro do dia e o da semana, e a Chama da Constância
 * (dias de estudo da semana — nada zera se você faltar).
 */
import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { getItem } from '../content/items';
import {
  DAILY_BONUS,
  WEEKLY_BONUS,
  WEEKLY_FIRST_ITEM,
  allDone,
  dayKey,
  weekDays,
  type QuestBoard,
} from '../domain/quests/quests';
import { QuestRow } from '../features/quests/QuestRow';
import { refreshQuests } from '../state/actions';
import { useGame, useGameStore } from '../state/store';
import { Icon } from '../ui/Icon';
import { IconButton } from '../ui/IconButton';
import { Panel } from '../ui/Panel';
import { Screen } from '../ui/Screen';
import { Text } from '../ui/Text';
import { colors, radius, space } from '../ui/theme';

const WEEKDAY = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

function Board({ title, board, bonus }: { title: string; board: QuestBoard; bonus: string }) {
  const finished = allDone(board);
  return (
    <Panel>
      <Text variant="label" color={colors.brass}>
        {title}
      </Text>
      <View style={styles.rows}>
        {board.quests.map((q) => (
          <QuestRow key={q.id} board={board} quest={q} />
        ))}
      </View>
      <View style={[styles.bonus, finished && styles.bonusDone]}>
        <Icon name="sparkle" size={18} color={finished ? colors.ink900 : colors.brass} fill={finished ? colors.ink900 : 'none'} />
        <Text variant="caption" color={finished ? colors.ink900 : colors.parchmentDim} style={{ flex: 1 }}>
          {finished ? 'Baú aberto — recompensa entregue.' : bonus}
        </Text>
      </View>
    </Panel>
  );
}

export default function Quests() {
  const quests = useGame((g) => g.quests);
  const tz = useGame((g) => g.profile.tzOffsetMin);
  const ownsTitle = useGame((g) => !!g.inventory[WEEKLY_FIRST_ITEM]);
  const now = useGameStore((s) => s.now);

  useFocusEffect(
    useCallback(() => {
      refreshQuests().catch(() => undefined);
    }, []),
  );

  const today = dayKey(now, tz);
  const studied = new Set(quests.weekly?.days ?? []);
  const days = quests.weekly ? weekDays(quests.weekly.key) : [];

  return (
    <Screen>
      <View style={styles.header}>
        <IconButton icon="chevronLeft" label="Voltar" onPress={() => router.back()} color={colors.parchment} />
        <Text variant="title">Encomendas</Text>
      </View>
      <Text variant="body" color={colors.parchmentDim}>
        Pequenos objetivos para hoje e para a semana. As recompensas chegam sozinhas quando você cumpre — e nada é perdido se um dia
        ficar para trás.
      </Text>

      {quests.daily ? (
        <Board
          title="Hoje"
          board={quests.daily}
          bonus={`Cumpra as 3 para abrir o Baú do dia: +${DAILY_BONUS.xp} XP e +${DAILY_BONUS.ink} Tinta.`}
        />
      ) : null}

      {quests.weekly ? (
        <>
          <Panel tone="raised" accent={colors.verdigris}>
            <View style={styles.flameHead}>
              <Icon name="flame" size={22} color={colors.verdigris} fill={colors.verdigrisGlow} />
              <Text variant="subheading">Chama da Constância</Text>
            </View>
            <View style={styles.week} accessible accessibilityLabel={`Dias de estudo nesta semana: ${studied.size}`}>
              {days.map((d, i) => {
                const on = studied.has(d);
                const isToday = d === today;
                return (
                  <View key={d} style={styles.day}>
                    <View style={[styles.dot, on && styles.dotOn, isToday && !on && styles.dotToday]}>
                      {on ? <Icon name="flame" size={16} color={colors.ink900} fill={colors.ink900} strokeWidth={1} /> : null}
                    </View>
                    <Text variant="caption" color={isToday ? colors.parchment : colors.mistDim}>
                      {WEEKDAY[i]}
                    </Text>
                  </View>
                );
              })}
            </View>
            <Text variant="caption" color={colors.mist}>
              Cada dia com pelo menos uma questão acende a chama. Faltou um dia? Tudo bem — a semana recomeça na segunda, sem perder nada.
            </Text>
          </Panel>
          <Board
            title="Esta semana"
            board={quests.weekly}
            bonus={
              ownsTitle
                ? `Cumpra as 3 para abrir o Baú da semana: +${WEEKLY_BONUS.xp} XP e +${WEEKLY_BONUS.ink} Tinta.`
                : `Cumpra as 3 para abrir o Baú da semana: +${WEEKLY_BONUS.xp} XP, +${WEEKLY_BONUS.ink} Tinta e o título “${getItem(WEEKLY_FIRST_ITEM).name}”.`
            }
          />
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: space.xs, marginLeft: -space.sm },
  rows: { gap: space.sm, marginTop: space.sm },
  bonus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginTop: space.md,
    padding: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.brassGlow,
  },
  bonusDone: { backgroundColor: colors.verdigris },
  flameHead: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  week: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: space.md },
  day: { alignItems: 'center', gap: 4 },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.ink500,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotOn: { backgroundColor: colors.verdigris, borderColor: colors.verdigris },
  dotToday: { borderColor: colors.parchment },
});
