import { StyleSheet, View } from 'react-native';
import { Button } from '../../ui/Button';
import { Chip } from '../../ui/Chip';
import { Text } from '../../ui/Text';
import { colors, space } from '../../ui/theme';
import type { Attempt } from './useAttempt';

interface Props {
  attempt: Attempt;
  onConfirm: () => void;
  onContinue: () => void;
  continueLabel: string;
  onSkip?: () => void;
  /** Rótulo do botão de confirmação (ex.: "Atacar" na batalha). */
  confirmLabel?: string;
  /** Rever a questão anterior (só aparece quando há uma para rever). */
  onPrevious?: () => void;
}

/** Rodapé fixo: controles antes da resposta; "Continuar" depois. */
export function AnswerBar({ attempt, onConfirm, onContinue, continueLabel, onSkip, confirmLabel = 'Confirmar resposta', onPrevious }: Props) {
  if (attempt.outcome) {
    if (!onPrevious) return <Button label={continueLabel} iconRight="chevronRight" onPress={onContinue} />;
    return (
      <View style={styles.pair}>
        <View style={{ flex: 0.85 }}>
          <Button label="Anterior" icon="chevronLeft" variant="secondary" onPress={onPrevious} />
        </View>
        <View style={{ flex: 1.5 }}>
          <Button label={continueLabel} iconRight="chevronRight" onPress={onContinue} />
        </View>
      </View>
    );
  }
  return (
    <View style={styles.wrap}>
      {attempt.error ? (
        <Text variant="caption" color={colors.ember} align="center">
          {attempt.error}
        </Text>
      ) : null}
      <View style={styles.tools}>
        {onPrevious ? <Chip label="Anterior" icon="chevronLeft" onPress={onPrevious} color={colors.mist} accessibilityLabel="Rever a questão anterior; sua resposta atual fica guardada" /> : null}
        {onSkip ? <Chip label="Pular" icon="skip" onPress={onSkip} color={colors.mist} accessibilityLabel="Pular esta questão; ela volta no fim" /> : null}
        <Chip
          label={attempt.hints >= 2 ? 'Sem dicas' : `Dica ${attempt.hints}/2`}
          icon="lantern"
          onPress={attempt.hints < 2 ? attempt.revealHint : undefined}
          accessibilityLabel="Revelar uma dica. Cada dica reduz o XP em 25%."
        />
        <Chip
          label="Chute"
          icon="dice"
          selected={attempt.guessed}
          color={colors.iris}
          onPress={attempt.toggleGuess}
          accessibilityLabel="Marcar que estou chutando. Acertos por chute não contam como domínio."
        />
      </View>
      <Button label={confirmLabel} onPress={onConfirm} disabled={!attempt.selected} loading={attempt.submitting} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm + 2 },
  tools: { flexDirection: 'row', gap: space.sm, justifyContent: 'center', flexWrap: 'wrap' },
  pair: { flexDirection: 'row', gap: space.sm },
});
