import { StyleSheet, View } from 'react-native';
import type { QuestBoard, QuestDef, QuestMetric } from '../../domain/quests/quests';
import { Icon, type IconName } from '../../ui/Icon';
import { ProgressBar } from '../../ui/ProgressBar';
import { Text } from '../../ui/Text';
import { colors, radius, space } from '../../ui/theme';

const METRIC_ICON: Record<QuestMetric, IconName> = {
  answered: 'book',
  correct: 'check',
  correctHard: 'bolt',
  redemptions: 'echo',
  studyMinutes: 'clock',
  sessions: 'flag',
  perfectSessions: 'sparkle',
  missions: 'atlas',
  bossWins: 'sword',
  topicCorrect: 'target',
  studyDays: 'flame',
};

export function QuestRow({ board, quest, compact }: { board: QuestBoard; quest: QuestDef; compact?: boolean }) {
  const value = Math.min(quest.target, board.progress[quest.id] ?? 0);
  const done = value >= quest.target;
  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={`${quest.title}: ${value} de ${quest.target}${done ? ', cumprida' : ''}. Recompensa: ${quest.xp} XP e ${quest.ink} de Tinta.`}
    >
      <View style={[styles.icon, done && styles.iconDone]}>
        <Icon
          name={done ? 'check' : METRIC_ICON[quest.metric]}
          size={16}
          color={done ? colors.ink900 : colors.brass}
          strokeWidth={done ? 2.4 : 1.75}
        />
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <View style={styles.titleRow}>
          <Text variant="bodyStrong" color={done ? colors.mist : colors.parchment} style={{ flex: 1 }} numberOfLines={2}>
            {quest.title}
          </Text>
          <Text variant="number" color={done ? colors.verdigris : colors.mist} style={styles.count}>
            {value}/{quest.target}
          </Text>
        </View>
        <ProgressBar value={value / quest.target} height={5} color={done ? colors.verdigris : colors.brass} />
        {!compact ? (
          <Text variant="caption" color={colors.mistDim}>
            {done ? 'Recompensa recebida' : 'Recompensa'}: +{quest.xp} XP · +{quest.ink} Tinta
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.md, alignItems: 'center', paddingVertical: space.xs },
  icon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brassGlow,
  },
  iconDone: { backgroundColor: colors.verdigris },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  count: { fontSize: 14 },
});
