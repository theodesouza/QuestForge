/**
 * Rever a questão anterior durante a atividade: modo somente leitura, com a alternativa que o
 * jogador escolheu, a correta e a resolução. A questão atual fica guardada (seleção, dicas e
 * rolagem) até o jogador voltar.
 */
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { AltKey } from '../../content/types';
import type { ReviewItem } from '../../domain/game/review';
import { Button } from '../../ui/Button';
import { Icon } from '../../ui/Icon';
import { Text } from '../../ui/Text';
import { colors, radius, space } from '../../ui/theme';
import type { Attempt, AnsweredEvent } from './useAttempt';

const noop = () => undefined;

/** Uma tentativa já respondida, para mostrar no corpo da questão sem poder mudar nada. */
export function reviewAttempt(item: ReviewItem): Attempt {
  const answered: AnsweredEvent = {
    type: 'answered',
    questionId: item.questionId,
    chosen: item.chosen,
    correct: item.correct,
    guessed: item.guessed,
    kind: item.kind,
    echoOvercome: item.echoOvercome,
    xp: item.xp,
    restedBonus: 0,
    ink: item.ink,
  };
  return {
    selected: item.chosen as AltKey,
    select: noop,
    hints: item.hints,
    revealHint: noop,
    guessed: item.guessed,
    toggleGuess: noop,
    outcome: { answered, scaffold: null, events: [] },
    submitting: false,
    error: null,
    submit: async () => undefined,
    setPaused: noop,
  };
}

export interface Review {
  /** A resposta que está sendo revista (null = questão atual). */
  item: ReviewItem | null;
  /** Quantas respostas dá para rever. */
  count: number;
  /** Posição da revista entre as que dá para rever (1 = mais antiga). */
  index: number;
  hasPrevious: boolean;
  hasNext: boolean;
  /** Abre a revisão na resposta mais recente. */
  open: () => void;
  previous: () => void;
  next: () => void;
  /** Volta à questão atual. */
  close: () => void;
}

export function useReview(items: ReviewItem[]): Review {
  const [pos, setPos] = useState<number | null>(null);
  // A lista só muda quando uma resposta nova chega, e isso não acontece durante a revisão;
  // mesmo assim, uma posição fora da lista volta à questão atual.
  const at = pos !== null && pos >= 0 && pos < items.length ? pos : null;
  const open = useCallback(() => setPos(items.length - 1), [items.length]);
  const previous = useCallback(() => setPos((p) => (p === null ? items.length - 1 : Math.max(0, p - 1))), [items.length]);
  const next = useCallback(() => setPos((p) => (p === null || p >= items.length - 1 ? null : p + 1)), [items.length]);
  const close = useCallback(() => setPos(null), []);
  return useMemo(
    () => ({
      item: at === null ? null : items[at],
      count: items.length,
      index: at === null ? items.length : at + 1,
      hasPrevious: at !== null && at > 0,
      hasNext: at !== null && at < items.length - 1,
      open,
      previous,
      next,
      close,
    }),
    [at, items, open, previous, next, close],
  );
}

/** Faixa no topo do corpo: avisa que é uma revisão e que nada do que está ali vale mais pontos. */
export function ReviewBanner({ review, label }: { review: Review; label: string }) {
  const item = review.item;
  if (!item) return null;
  return (
    <View style={styles.banner} accessible accessibilityRole="header" accessibilityLabel={`Revendo ${label} ${item.position}. Somente leitura.`}>
      <Icon name="book" size={16} color={colors.iris} />
      <View style={{ flex: 1 }}>
        <Text variant="label" color={colors.iris}>
          Revendo {label} {item.position}
        </Text>
        <Text variant="caption" color={colors.mist}>
          Só leitura: nada muda e você volta de onde parou.
        </Text>
      </View>
      <Text variant="caption" color={colors.mist}>
        {review.index} de {review.count}
      </Text>
    </View>
  );
}

/** Rodapé do modo revisão: anterior, próxima e o botão grande de voltar à questão atual. */
export function ReviewBar({ review, returnLabel }: { review: Review; returnLabel: string }) {
  return (
    <View style={styles.bar}>
      <View style={styles.pair}>
        <View style={{ flex: 1 }}>
          <Button label="Anterior" icon="chevronLeft" variant="secondary" onPress={review.previous} disabled={!review.hasPrevious} />
        </View>
        <View style={{ flex: 1 }}>
          <Button label="Próxima" iconRight="chevronRight" variant="secondary" onPress={review.next} disabled={!review.hasNext} />
        </View>
      </View>
      <Button label={returnLabel} iconRight="chevronRight" onPress={review.close} />
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.irisGlow,
    borderWidth: 1,
    borderColor: colors.iris,
  },
  bar: { gap: space.sm },
  pair: { flexDirection: 'row', gap: space.sm },
});
