/** Cartão compacto das encomendas do dia, no Acampamento. */
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { DAILY_BONUS, allDone, isQuestDone } from '../../domain/quests/quests';
import { useGame } from '../../state/store';
import { Icon } from '../../ui/Icon';
import { Panel } from '../../ui/Panel';
import { Text } from '../../ui/Text';
import { colors, space } from '../../ui/theme';
import { QuestRow } from './QuestRow';

export function DailyQuestCard() {
  const daily = useGame((g) => g.quests.daily);
  const weekly = useGame((g) => g.quests.weekly);
  if (!daily) return null;
  const done = daily.quests.filter((q) => isQuestDone(daily, q)).length;
  const days = weekly?.quests.find((q) => q.metric === 'studyDays');
  return (
    <Pressable
      onPress={() => router.push('/quests')}
      accessibilityRole="button"
      accessibilityLabel={`Encomendas do dia: ${done} de ${daily.quests.length} cumpridas. Ver todas as encomendas`}
    >
      <Panel>
        <View style={styles.head}>
          <Text variant="label" color={colors.brass}>
            Encomendas do dia
          </Text>
          <View style={styles.headRight}>
            <Text variant="caption" color={colors.mist}>
              {done}/{daily.quests.length}
            </Text>
            <Icon name="chevronRight" size={16} color={colors.mist} />
          </View>
        </View>
        <View style={styles.rows}>
          {daily.quests.map((q) => (
            <QuestRow key={q.id} board={daily} quest={q} compact />
          ))}
        </View>
        <Text variant="caption" color={allDone(daily) ? colors.verdigris : colors.mistDim} style={styles.foot}>
          {allDone(daily)
            ? 'Baú do dia aberto. Novas encomendas amanhã.'
            : `Cumpra as 3 para abrir o Baú do dia (+${DAILY_BONUS.ink} Tinta).`}
          {days && weekly ? `  ·  Semana: ${Math.min(days.target, weekly.progress[days.id] ?? 0)}/${days.target} dias de estudo` : ''}
        </Text>
      </Panel>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rows: { gap: space.xs, marginTop: space.sm },
  foot: { marginTop: space.sm },
});
