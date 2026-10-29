import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { subtopicLabel } from '../../content/topics';
import type { Question } from '../../content/types';
import { alternativeOrder, displayLetter } from '../../domain/learning/alternatives';
import { toggleDoubt, toggleFavorite } from '../../state/actions';
import { useGame } from '../../state/store';
import { DifficultyPips } from '../../ui/DifficultyPips';
import { useReduceMotion } from '../../ui/feedback';
import { Icon } from '../../ui/Icon';
import { IconButton } from '../../ui/IconButton';
import { Text } from '../../ui/Text';
import { colors, radius, space } from '../../ui/theme';
import { Alternatives } from './Alternatives';
import { Feedback } from './Feedback';
import { StemBlocks } from './StemBlocks';
import type { Attempt } from './useAttempt';

interface Props {
  question: Question;
  attempt: Attempt;
  /** Identifica a tentativa (sessão ou batalha): define a ordem das alternativas. */
  attemptKey: string;
  /** Posição vertical do feedback, para a tela rolar até ele após a resposta. */
  onFeedbackLayout?: (y: number) => void;
  /** Revisão de uma resposta antiga (sem tremor nem animação de entrada do feedback). */
  readOnly?: boolean;
}

export function QuestionBody({ question, attempt, attemptKey, onFeedbackLayout, readOnly }: Props) {
  const reduce = useReduceMotion();
  const order = useMemo(() => alternativeOrder(question, attemptKey), [question, attemptKey]);
  const qs = useGame((g) => g.questionStates[question.id]);
  const isEcho = !!qs?.echo;

  return (
    <Animated.View key={question.id} entering={reduce ? undefined : FadeIn.duration(260)} style={styles.wrap}>
      <View style={styles.meta}>
        <View style={styles.metaLeft}>
          <Text variant="label" color={colors.mist} numberOfLines={1} style={styles.subtopic}>
            {subtopicLabel(question.topic, question.subtopic)}
          </Text>
          <DifficultyPips value={question.difficulty} />
          {isEcho && !attempt.outcome ? (
            <View style={styles.echoTag}>
              <Icon name="echo" size={13} color={colors.iris} />
              <Text variant="caption" color={colors.iris}>Eco</Text>
            </View>
          ) : null}
          {!isEcho && (qs?.echoBeaten ?? 0) > 0 && !attempt.outcome ? (
            <View style={[styles.echoTag, styles.beatenTag]} accessible accessibilityLabel="Eco superado: você já errou esta questão e depois acertou">
              <Icon name="check" size={13} color={colors.verdigris} />
              <Text variant="caption" color={colors.verdigris}>Eco superado</Text>
            </View>
          ) : null}
        </View>
        <View style={styles.metaRight}>
          <IconButton
            icon="flag"
            label={qs?.flagged ? 'Remover marcação de dúvida' : 'Marcar como dúvida'}
            active={!!qs?.flagged}
            activeColor={colors.iris}
            size={19}
            onPress={() => toggleDoubt(question.id)}
          />
          <IconButton
            icon="star"
            label={qs?.favorite ? 'Remover dos favoritos' : 'Favoritar questão'}
            active={!!qs?.favorite}
            size={19}
            onPress={() => toggleFavorite(question.id)}
          />
        </View>
      </View>

      <StemBlocks blocks={question.stem} />

      <View style={styles.ask}>
        <Text variant="ask">{question.ask}</Text>
      </View>

      {attempt.hints > 0 && !attempt.outcome ? (
        <View style={styles.hints}>
          {question.hints.slice(0, attempt.hints).map((h, i) => (
            <Animated.View key={i} entering={reduce ? undefined : FadeIn.duration(240)} style={styles.hint}>
              <Icon name="lantern" size={18} color={colors.brass} fill={colors.brass} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="label" color={colors.brass}>
                  Lanterna {i + 1}
                </Text>
                <Text variant="body">{h}</Text>
              </View>
            </Animated.View>
          ))}
        </View>
      ) : null}

      <Alternatives
        question={question}
        order={order}
        selected={attempt.selected}
        onSelect={attempt.select}
        revealedChoice={attempt.outcome?.answered.chosen ?? null}
        quiet={readOnly}
      />

      {attempt.outcome ? (
        <View onLayout={(e) => onFeedbackLayout?.(e.nativeEvent.layout.y)}>
          <Feedback question={question} outcome={attempt.outcome} answerLetter={displayLetter(order, question.answer)} />
        </View>
      ) : null}

      <Text variant="caption" color={colors.mistDim} align="center">
        {question.source.kind === 'autoral' ? `Questão autoral inspirada no ENEM · ${question.id}` : `ENEM ${question.source.year} · ${question.id}`}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.lg },
  meta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: -space.sm },
  metaLeft: { flexDirection: 'row', alignItems: 'center', gap: space.sm, flex: 1 },
  metaRight: { flexDirection: 'row', marginRight: -space.sm },
  subtopic: { flexShrink: 1 },
  echoTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    height: 22,
    borderRadius: radius.pill,
    backgroundColor: colors.irisGlow,
  },
  beatenTag: { backgroundColor: colors.verdigrisGlow },
  ask: { borderLeftWidth: 3, borderLeftColor: colors.brass, paddingLeft: space.md, paddingVertical: 2 },
  hints: { gap: space.sm },
  hint: {
    flexDirection: 'row',
    gap: space.md,
    padding: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.brassGlow,
    borderWidth: 1,
    borderColor: colors.line,
  },
});
