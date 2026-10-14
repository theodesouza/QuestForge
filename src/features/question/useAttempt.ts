import { useCallback, useEffect, useRef, useState } from 'react';
import type { AltKey } from '../../content/types';
import type { GameEvent } from '../../domain/game/types';
import { haptic } from '../../ui/feedback';

export type AnsweredEvent = Extract<GameEvent, { type: 'answered' }>;

export interface AttemptOutcome {
  answered: AnsweredEvent;
  scaffold: Extract<GameEvent, { type: 'scaffold' }> | null;
  events: GameEvent[];
}

interface AttemptState {
  questionId: string | null;
  selected: AltKey | null;
  hints: number;
  guessed: boolean;
  outcome: AttemptOutcome | null;
  submitting: boolean;
  error: string | null;
}

const fresh = (questionId: string | null): AttemptState => ({
  questionId,
  selected: null,
  hints: 0,
  guessed: false,
  outcome: null,
  submitting: false,
  error: null,
});

/** Estado local de uma tentativa: seleção, dicas, chute, tempo e resultado. Reinicia a cada questão. */
export function useAttempt(questionId: string | null) {
  const [state, setState] = useState<AttemptState>(() => fresh(questionId));
  // Estado derivado: nova questão ⇒ nova tentativa (sem efeito em cascata).
  const current = state.questionId === questionId ? state : fresh(questionId);
  if (current !== state) setState(current);

  const startedAt = useRef(0);
  useEffect(() => {
    startedAt.current = Date.now();
  }, [questionId]);

  const patch = (p: Partial<AttemptState>) => setState((s) => (s.questionId === questionId ? { ...s, ...p } : s));

  const submit = useCallback(
    async (send: (input: { chosen: AltKey; guessed: boolean; hints: number; timeMs: number }) => Promise<GameEvent[]>) => {
      const { selected, submitting, outcome, guessed, hints } = current;
      if (!selected || submitting || outcome) return;
      setState((s) => ({ ...s, submitting: true, error: null }));
      try {
        const events = await send({ chosen: selected, guessed, hints, timeMs: Date.now() - startedAt.current });
        const answered = events.find((e): e is AnsweredEvent => e.type === 'answered');
        if (!answered) throw new Error('Resposta não registrada');
        const scaffold = events.find((e): e is Extract<GameEvent, { type: 'scaffold' }> => e.type === 'scaffold') ?? null;
        haptic(answered.correct ? 'success' : 'error');
        setState((s) => ({ ...s, submitting: false, outcome: { answered, scaffold, events } }));
      } catch (e) {
        setState((s) => ({
          ...s,
          submitting: false,
          error: e instanceof Error ? e.message : 'Não foi possível salvar a resposta. Tente de novo.',
        }));
      }
    },
    [current],
  );

  return {
    selected: current.selected,
    select: (k: AltKey) => {
      if (!current.outcome) patch({ selected: k });
    },
    hints: current.hints,
    revealHint: () => patch({ hints: Math.min(2, current.hints + 1) }),
    guessed: current.guessed,
    toggleGuess: () => patch({ guessed: !current.guessed }),
    outcome: current.outcome,
    submitting: current.submitting,
    error: current.error,
    submit,
  };
}

export type Attempt = ReturnType<typeof useAttempt>;
