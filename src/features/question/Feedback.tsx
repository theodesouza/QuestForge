import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { getQuestion } from '../../content/bank';
import { subtopicLabel } from '../../content/topics';
import type { Question } from '../../content/types';
import { useReduceMotion } from '../../ui/feedback';
import { Icon } from '../../ui/Icon';
import { Text } from '../../ui/Text';
import { colors, radius, space } from '../../ui/theme';
import type { AttemptOutcome } from './useAttempt';
import { SolutionSheet } from './SolutionSheet';

const CORRECT_TITLES = ['Certeiro!', 'Traçado perfeito.', 'Conta fechada.', 'Na medida exata.', 'Rota confirmada.'];

function pick<T>(list: T[], seed: string): T {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return list[h % list.length];
}

function scaffoldLabel(questionId: string): string {
  const q = getQuestion(questionId);
  return subtopicLabel(q.topic, q.subtopic);
}

const KIND_NOTE: Record<string, string | null> = {
  first: null,
  redemption: 'Redenção! Um Eco derrotado vale 150% de XP.',
  review: 'Revisão no tempo certo: a memória fica mais firme.',
  practice: 'Bom treino! Este Eco volta no prazo — derrotá-lo aí vale 150% de XP.',
  repeat: 'Questão já dominada — XP reduzido.',
  cooldown: 'Você acertou esta há pouco: sem XP agora, mas o treino conta.',
  wrong: null,
};

export function Feedback({
  question,
  outcome,
  answerLetter,
  showSolutionByDefault,
}: {
  question: Question;
  outcome: AttemptOutcome;
  /** Letra da alternativa correta como aparece na tela (as alternativas são embaralhadas). */
  answerLetter: string;
  showSolutionByDefault?: boolean;
}) {
  const reduce = useReduceMotion();
  const { answered, scaffold } = outcome;
  const [open, setOpen] = useState(showSolutionByDefault ?? !answered.correct);

  const accent = answered.correct ? (answered.guessed ? colors.brass : colors.verdigris) : colors.iris;
  const title = answered.correct
    ? answered.guessed
      ? 'Acertou no chute.'
      : pick(CORRECT_TITLES, question.id)
    : 'Virou um Eco.';
  const subtitle = answered.correct
    ? answered.guessed
      ? 'Ela volta amanhã para você confirmar que sabe — sem sorte desta vez.'
      : KIND_NOTE[answered.kind]
    : `A resposta é ${answerLetter}. Este Eco volta amanhã — derrotá-lo vale 150% de XP.`;

  return (
    <Animated.View entering={reduce ? undefined : FadeInDown.duration(320)} style={styles.wrap} accessibilityLiveRegion="polite">
      <View style={[styles.header, { borderColor: accent }]}>
        <View style={[styles.icon, { backgroundColor: accent }]}>
          <Icon name={answered.correct ? 'check' : 'echo'} size={20} color={colors.ink900} strokeWidth={2.2} />
        </View>
        <View style={styles.headerText}>
          <Text variant="heading" color={accent}>
            {title}
          </Text>
          {subtitle ? (
            <Text variant="caption" color={colors.parchmentDim}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      {answered.xp > 0 || answered.ink > 0 ? (
        <View style={styles.rewards}>
          {answered.xp > 0 ? (
            <View style={styles.reward}>
              <Icon name="bolt" size={16} color={colors.brass} fill={colors.brass} strokeWidth={1} />
              <Text variant="number" color={colors.brass}>+{answered.xp} XP</Text>
            </View>
          ) : null}
          {answered.restedBonus > 0 ? (
            <View style={[styles.reward, styles.restedTag]}>
              <Text variant="caption" color={colors.verdigris}>
                inclui +{answered.restedBonus} do Descanso
              </Text>
            </View>
          ) : null}
          {answered.ink > 0 ? (
            <View style={styles.reward}>
              <Icon name="ink" size={16} color={colors.iris} fill={colors.iris} strokeWidth={1} />
              <Text variant="number" color={colors.iris}>+{answered.ink}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((o) => !o)}
        style={styles.toggle}
      >
        <Icon name="book" size={18} color={colors.parchment} />
        <Text variant="bodyStrong" style={styles.toggleText}>
          {open ? 'Resolução passo a passo' : 'Ver resolução passo a passo'}
        </Text>
        <View style={{ transform: [{ rotate: open ? '90deg' : '0deg' }] }}>
          <Icon name="chevronRight" size={18} color={colors.mist} />
        </View>
      </Pressable>

      {open ? <SolutionSheet question={question} /> : null}

      <View style={styles.concept}>
        <Text variant="label" color={colors.iris}>
          Conceito-chave
        </Text>
        <Text variant="body">{question.concept}</Text>
      </View>

      {scaffold ? (
        <View style={styles.scaffold}>
          <Icon name="lantern" size={22} color={colors.brass} fill={colors.brass} />
          <View style={styles.headerText}>
            <Text variant="subheading" color={colors.brass}>
              Vamos por partes
            </Text>
            <Text variant="caption" color={colors.parchmentDim}>
              Dois tropeços seguidos em “{scaffoldLabel(scaffold.conceptFrom)}”. A próxima questão é mais acessível e
              trabalha a base desse raciocínio — depois voltamos ao nível anterior.
            </Text>
          </View>
        </View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.md },
  header: {
    flexDirection: 'row',
    gap: space.md,
    alignItems: 'center',
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    backgroundColor: colors.ink800,
  },
  icon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1, gap: 2 },
  rewards: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  reward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: space.md,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.ink800,
  },
  restedTag: { backgroundColor: colors.verdigrisGlow },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minHeight: 48,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.ink800,
    borderWidth: 1,
    borderColor: colors.lineSoft,
  },
  toggleText: { flex: 1 },
  concept: { gap: space.xs, padding: space.md, borderRadius: radius.md, backgroundColor: colors.irisGlow, borderLeftWidth: 3, borderLeftColor: colors.iris },
  scaffold: {
    flexDirection: 'row',
    gap: space.md,
    padding: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.brassGlow,
    borderWidth: 1,
    borderColor: colors.line,
  },
});
