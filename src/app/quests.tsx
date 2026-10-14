/**
 * Encomendas: o quadro do dia e o da semana, e a Chama da Constância
 * (dias de estudo da semana — nada zera se você faltar).
 */
import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { getItem } from '../content/items';
import {
  WEEKLY_FIRST_ITEM,
  allDone,
  boardBonus,
  dayKey,
  grantsWeeklyItem,
  isQuestDone,
  weekDays,
  type QuestBoard,
  type QuestDef,
} from '../domain/quests/quests';
import { QuestRow } from '../features/quests/QuestRow';
import { useStarter } from '../features/useStarter';
import { refreshQuests, startFocus } from '../state/actions';
import { useGame, useGameStore } from '../state/store';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { IconButton } from '../ui/IconButton';
import { Panel } from '../ui/Panel';
import { Screen } from '../ui/Screen';
import { Text } from '../ui/Text';
import { colors, radius, space } from '../ui/theme';

const WEEKDAY = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

function Board({
  title,
  board,
  bonus,
  onTrain,
  training,
  paused,
}: {
  title: string;
  board: QuestBoard;
  bonus: string;
  onTrain?: (q: QuestDef) => void;
  training?: boolean;
  /** Há uma sessão pausada: o botão retoma em vez de começar outra (e não a descarta). */
  paused?: boolean;
}) {
  const finished = allDone(board);
  return (
    <Panel>
      <Text variant="label" color={colors.brass}>
        {title}
      </Text>
      <View style={styles.rows}>
        {board.quests.map((q) => (
          <View key={q.id} style={styles.quest}>
            <QuestRow board={board} quest={q} />
            {onTrain && q.metric === 'topicCorrect' && q.topic && !isQuestDone(board, q) ? (
              <Button
                label={paused ? 'Retomar a sessão pausada' : 'Treinar este assunto'}
                size="md"
                variant="secondary"
                icon={paused ? 'play' : 'target'}
                loading={training}
                onPress={() => (paused ? router.push('/session') : onTrain(q))}
                accessibilityHint={
                  paused
                    ? 'Volta para a sessão que você pausou; termine-a para treinar este assunto'
                    : 'Começa uma expedição curta focada no assunto desta encomenda'
                }
                style={styles.train}
              />
            ) : null}
          </View>
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

function weeklyBonusText(board: QuestBoard, ownsTitle: boolean): string {
  const { xp, ink } = boardBonus(board);
  if (ownsTitle || !grantsWeeklyItem(board)) return `Cumpra as 3 para abrir o Baú da semana: +${xp} XP e +${ink} Tinta.`;
  return `Cumpra as 3 para abrir o Baú da semana: +${xp} XP, +${ink} Tinta e o título “${getItem(WEEKLY_FIRST_ITEM).name}”.`;
}

export default function Quests() {
  const quests = useGame((g) => g.quests);
  const tz = useGame((g) => g.profile.tzOffsetMin);
  const ownsTitle = useGame((g) => !!g.inventory[WEEKLY_FIRST_ITEM]);
  const paused = useGame((g) => !!g.session);
  const now = useGameStore((s) => s.now);
  const { busy, start } = useStarter();
  const train = (q: QuestDef) => {
    if (q.topic && q.subtopic) start('focus', () => startFocus(q.topic!, q.subtopic!));
  };

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
          onTrain={train}
          training={busy === 'focus'}
          paused={paused}
          bonus={`Cumpra as 3 para abrir o Baú do dia: +${boardBonus(quests.daily).xp} XP e +${boardBonus(quests.daily).ink} Tinta.`}
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
            bonus={weeklyBonusText(quests.weekly, ownsTitle)}
          />
          {(quests.weekly.share ?? 1) < 1 ? (
            <Text variant="caption" color={colors.mist}>
              Este quadro começou no meio da semana: metas e recompensas são proporcionais aos dias que restavam. Na segunda chega um
              quadro completo.
            </Text>
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: space.xs, marginLeft: -space.sm },
  rows: { gap: space.sm, marginTop: space.sm },
  quest: { gap: space.sm },
  train: { alignSelf: 'flex-start', marginLeft: 32 + space.md },
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
