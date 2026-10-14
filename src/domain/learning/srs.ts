/**
 * Repetição espaçada (sistema de caixas de Leitner) e Ecos.
 * - Erro ⇒ a questão vira um Eco (caixa 1, volta em ~1 dia).
 * - Acerto confiante numa revisão devida ⇒ sobe de caixa (1 → 3 → 7 → 16 → 35 dias).
 * - Acerto por "chute" ⇒ não conta como domínio; volta em ~1 dia para confirmação.
 */

export const DAY_MS = 24 * 60 * 60 * 1000;
export const HOUR_MS = 60 * 60 * 1000;

/** Intervalo em dias por caixa (índice = caixa). */
export const BOX_INTERVAL_DAYS = [0, 1, 3, 7, 16, 35] as const;
export const MAX_BOX = 5;
/** Folga para que "amanhã" inclua o mesmo horário de estudo do dia seguinte. */
const SLACK_MS = 4 * HOUR_MS;

export type Outcome = 'correct' | 'guess' | 'wrong';

export interface QuestionState {
  questionId: string;
  box: number;
  dueAt: number | null;
  seen: number;
  /** Acertos confiantes (sem chute). */
  correct: number;
  wrong: number;
  guessedCorrect: number;
  lastAnsweredAt: number | null;
  lastCorrectAt: number | null;
  lastWrongAt: number | null;
  lastWrongSessionId: string | null;
  lastXpAt: number | null;
  /** Erro ainda não redimido por um acerto confiante. */
  echo: boolean;
  favorite: boolean;
  /** Marcada pelo jogador como dúvida. */
  flagged: boolean;
}

export function emptyQuestionState(questionId: string): QuestionState {
  return {
    questionId,
    box: 0,
    dueAt: null,
    seen: 0,
    correct: 0,
    wrong: 0,
    guessedCorrect: 0,
    lastAnsweredAt: null,
    lastCorrectAt: null,
    lastWrongAt: null,
    lastWrongSessionId: null,
    lastXpAt: null,
    echo: false,
    favorite: false,
    flagged: false,
  };
}

export function intervalMs(box: number): number {
  const b = Math.max(1, Math.min(MAX_BOX, box));
  return BOX_INTERVAL_DAYS[b] * DAY_MS - SLACK_MS;
}

export function isDue(state: QuestionState | undefined, now: number): boolean {
  return !!state && state.dueAt !== null && state.dueAt <= now;
}

export function schedule(
  prev: QuestionState | undefined,
  questionId: string,
  outcome: Outcome,
  now: number,
  sessionId: string,
): QuestionState {
  const base = prev ?? emptyQuestionState(questionId);
  const next: QuestionState = {
    ...base,
    seen: base.seen + 1,
    lastAnsweredAt: now,
  };

  if (outcome === 'wrong') {
    next.wrong += 1;
    next.box = 1;
    next.dueAt = now + intervalMs(1);
    next.echo = true;
    next.lastWrongAt = now;
    next.lastWrongSessionId = sessionId;
    return next;
  }

  if (outcome === 'guess') {
    next.guessedCorrect += 1;
    next.box = 1;
    next.dueAt = now + intervalMs(1);
    return next;
  }

  // Acerto confiante.
  next.correct += 1;
  next.lastCorrectAt = now;
  const firstContact = base.seen === 0;
  const wasDue = isDue(base, now);
  if (firstContact) {
    // Acertou de primeira: já sabia. Primeira revisão em 3 dias.
    next.box = 2;
    next.dueAt = now + intervalMs(2);
  } else if (base.echo || wasDue) {
    next.box = Math.min(MAX_BOX, Math.max(1, base.box) + 1);
    next.dueAt = now + intervalMs(next.box);
  } else {
    // Acerto fora do prazo: evidência registrada, agenda inalterada.
    next.box = Math.max(1, base.box);
    next.dueAt = base.dueAt ?? now + intervalMs(next.box);
  }
  next.echo = false;
  return next;
}

/** Ecos que já podem ser enfrentados (erro de outra sessão ou vencido). */
export function dueQuestionIds(states: Record<string, QuestionState>, now: number): string[] {
  return Object.values(states)
    .filter((s) => isDue(s, now))
    .sort((a, b) => (a.dueAt ?? 0) - (b.dueAt ?? 0))
    .map((s) => s.questionId);
}

export function echoCount(states: Record<string, QuestionState>): number {
  let n = 0;
  for (const s of Object.values(states)) if (s.echo) n++;
  return n;
}
