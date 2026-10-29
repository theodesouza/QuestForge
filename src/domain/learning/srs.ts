/**
 * Repetição espaçada (sistema de caixas de Leitner) e Ecos.
 * - Erro ⇒ a questão vira um Eco (caixa 1, volta em ~1 dia).
 * - Acerto confiante num Eco, a qualquer momento ⇒ o Eco é SUPERADO: deixa de ser Eco
 *   (e conta nos "Ecos superados"). Se errar de novo, volta a ser Eco.
 * - Acerto confiante numa revisão devida ⇒ sobe de caixa (1 → 3 → 7 → 16 → 35 dias).
 * - Acerto por "chute" ⇒ não conta como domínio nem supera Eco; volta em ~1 dia.
 * - Eco muito antigo (mais de 21 dias) ou excesso de Ecos (acima de 40) ⇒ se DISSIPA
 *   sozinho: a pilha de erros não cresce sem fim, e a questão segue a agenda normal.
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
  /** Erro ainda não superado por um acerto confiante. */
  echo: boolean;
  /** Quantas vezes um Eco desta questão foi superado. */
  echoBeaten: number;
  echoBeatenAt: number | null;
  /** Quando o Eco ativo se dissipou por ser muito antigo (some se a questão voltar a errar). */
  echoFadedAt: number | null;
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
    echoBeaten: 0,
    echoBeatenAt: null,
    echoFadedAt: null,
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
    next.echoFadedAt = null;
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
  } else if (wasDue) {
    next.box = Math.min(MAX_BOX, Math.max(1, base.box) + 1);
    next.dueAt = now + intervalMs(next.box);
  } else {
    // Acerto fora do prazo: evidência registrada, agenda inalterada.
    next.box = Math.max(1, base.box);
    next.dueAt = base.dueAt ?? now + intervalMs(next.box);
  }
  // Acertar com confiança supera o Eco na hora (o XP de redenção, esse sim, só vale no prazo).
  if (base.echo) {
    next.echoBeaten = base.echoBeaten + 1;
    next.echoBeatenAt = now;
  }
  next.echo = false;
  return next;
}

/** Ecos que já podem ser enfrentados: Eco ativo com a revisão vencida, o mais antigo primeiro. */
export function dueEchoIds(states: Record<string, QuestionState>, now: number): string[] {
  return Object.values(states)
    .filter((s) => s.echo && isDue(s, now))
    .sort((a, b) => (a.dueAt ?? 0) - (b.dueAt ?? 0))
    .map((s) => s.questionId);
}

/** Revisões vencidas de questões que não são Ecos ativos (inclui Ecos já superados). */
export function dueReviewIds(states: Record<string, QuestionState>, now: number): string[] {
  return Object.values(states)
    .filter((s) => !s.echo && isDue(s, now))
    .sort((a, b) => (a.dueAt ?? 0) - (b.dueAt ?? 0))
    .map((s) => s.questionId);
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

/** Total de Ecos superados até hoje (inclui quem errou de novo depois). */
export function echoesBeatenCount(states: Record<string, QuestionState>): number {
  let n = 0;
  for (const s of Object.values(states)) n += s.echoBeaten;
  return n;
}

/** Ecos que se dissiparam por idade ou excesso e ainda não voltaram a ser Eco. */
export function echoesFadedCount(states: Record<string, QuestionState>): number {
  let n = 0;
  for (const s of Object.values(states)) if (!s.echo && s.echoFadedAt !== null) n++;
  return n;
}

/** Eco com mais de 3 semanas já não é "erro de agora": dissipa-se sozinho. */
export const ECHO_MAX_AGE_DAYS = 21;
/** Teto de Ecos ativos: acima disso, os mais antigos se dissipam. */
export const MAX_ACTIVE_ECHOES = 40;

/**
 * Ecos a dissipar agora: os mais velhos que `ECHO_MAX_AGE_DAYS` e, se ainda sobrarem mais de
 * `MAX_ACTIVE_ECHOES`, os mais antigos entre os restantes. Devolve os estados já atualizados
 * (só `echo` e `echoFadedAt` mudam: a caixa e o vencimento seguem a agenda normal).
 */
export function retireOldEchoes(states: Record<string, QuestionState>, now: number): QuestionState[] {
  const errorAt = (s: QuestionState) => s.lastWrongAt ?? s.lastAnsweredAt ?? 0;
  const active = Object.values(states).filter((s) => s.echo);
  const retire = new Set<string>();
  for (const s of active) if (now - errorAt(s) > ECHO_MAX_AGE_DAYS * DAY_MS) retire.add(s.questionId);
  const rest = active.filter((s) => !retire.has(s.questionId)).sort((a, b) => errorAt(a) - errorAt(b));
  for (let i = 0; i < rest.length - MAX_ACTIVE_ECHOES; i++) retire.add(rest[i].questionId);
  return [...retire].map((id) => ({ ...states[id], echo: false, echoFadedAt: now }));
}
