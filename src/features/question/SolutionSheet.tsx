import { StyleSheet, View } from 'react-native';
import { subtopicLabel } from '../../content/topics';
import type { Question } from '../../content/types';
import { Text } from '../../ui/Text';
import { colors, radius, space } from '../../ui/theme';
import { mathParts } from './mathParts';

function MathLine({ line }: { line: string }) {
  return (
    <View accessible accessibilityLabel={line} style={styles.mathLine}>
      {mathParts(line).map((part, i) => typeof part === 'string' ? (
        <Text key={i} color={colors.ink900} style={styles.mathText}>{part}</Text>
      ) : (
        <View key={i} style={styles.fraction} accessibilityElementsHidden>
          <Text color={colors.ink900} style={[styles.mathText, styles.numerator]}>{part.numerator}</Text>
          <Text color={colors.ink900} align="center" style={styles.mathText}>{part.denominator}</Text>
        </View>
      ))}
    </View>
  );
}

/** Folha visual, com texto nativo para ampliar com a fonte do aparelho e ler offline. */
export function SolutionSheet({ question }: { question: Question }) {
  return (
    <View style={styles.sheet} testID="solution-sheet">
      <View style={styles.header}>
        <Text variant="label" color={colors.ink600}>QuestForge · {question.id}</Text>
        <Text variant="heading" color={colors.ink900} accessibilityRole="header">Folha de resolução</Text>
        <Text variant="caption" color={colors.ink600}>{subtopicLabel(question.topic, question.subtopic)}</Text>
      </View>
      <Text variant="caption" color={colors.ink600}>Acompanhe o raciocínio, uma conta por vez.</Text>
      {question.solution.map((step, i) => (
        <View key={i} style={styles.step}>
          <View style={styles.stepHeading}>
            <Text variant="number" color={colors.ink600}>{String(i + 1).padStart(2, '0')}</Text>
            <Text color={colors.ink900} style={styles.explanation}>{typeof step === 'string' ? step : step.explanation}</Text>
          </View>
          {typeof step !== 'string' ? (
            <View style={styles.calculation}>
              {step.calculation.map((line, j) => <MathLine key={j} line={line} />)}
            </View>
          ) : null}
        </View>
      ))}
      <View style={styles.answer}>
        <Text variant="label" color={colors.ink600}>Resposta final</Text>
        <Text variant="heading" color={colors.ink900}>{question.alternatives[question.answer]}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: { backgroundColor: colors.parchment, borderRadius: radius.md, padding: space.lg, gap: space.lg },
  header: { gap: space.sm, paddingBottom: space.md, borderBottomWidth: 1, borderColor: colors.ink500 },
  step: { gap: space.sm },
  stepHeading: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
  explanation: { flex: 1 },
  calculation: { paddingLeft: space.md, borderLeftWidth: 2, borderColor: colors.brassDeep, gap: space.sm },
  mathLine: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: space.xs, rowGap: space.sm, paddingVertical: space.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.mist },
  mathText: { fontSize: 18, lineHeight: 28, maxWidth: '100%', fontVariant: ['tabular-nums'] },
  fraction: { alignItems: 'stretch', paddingHorizontal: 2 },
  numerator: { borderBottomWidth: 1.5, borderColor: colors.ink900, textAlign: 'center' },
  answer: { gap: space.sm, borderWidth: 1.5, borderColor: colors.verdigrisDeep, borderRadius: radius.sm, padding: space.md },
});
