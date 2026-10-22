/**
 * Seleção adaptativa de questões.
 * Ordem de prioridade: Ecos/revisões devidas → questões inéditas próximas da
 * dificuldade-alvo, favorecendo subassuntos fracos → questões já vistas há mais tempo.
 * Evita dois itens seguidos do mesmo subassunto quando possível.
 */
import type { Difficulty, Question, TopicId } from '../../content/types';
import { createRng, shuffle, type Rng } from '../util/random';
import { MASTERY_PRIORITY, masteryBySubtopic, subtopicKey } from './mastery';
import { isDue, type QuestionState } from './srs';

export const DEFAULT_TARGET = 2;

export interface SelectionInput {
  pool: readonly Question[];
  states: Record<string, QuestionState>;
  count: number;
  now: number;
  seed: number;
  /** Dificuldade-alvo por assunto (1–4, contínua). */
  targets?: Partial<Record<TopicId, number>>;
  /** Força uma dificuldade-alvo para todos os assuntos (ex.: escalada do chefão). */
  fixedTarget?: number;
  exclude?: ReadonlySet<string>;
  /** Fração máxima de revisões na primeira passada (padrão 0,4). */
  maxReviewShare?: number;
}

export function difficultyFit(d: Difficulty, target: number): number {
  const diff = d - target;
  return Math.exp(-(diff * diff) / 0.8);
}

/** Nos chefes, revisões ficam nas atividades próprias; a revanche privilegia novidade. */
export function selectBossQuestion(input: Omit<SelectionInput, 'count'>): Question | undefined {
  const candidates = input.pool.filter(q => !input.exclude?.has(q.id));
  const fresh = candidates.filter(q => !input.states[q.id] || input.states[q.id].seen === 0);
  if (fresh.length) return selectQuestions({ ...input, pool: fresh, count: 1, maxReviewShare: 0 })[0];
  const target = input.fixedTarget ?? DEFAULT_TARGET;
  return shuffle(candidates, createRng(input.seed)).sort((a, b) =>
    (input.states[a.id]?.lastAnsweredAt ?? 0) - (input.states[b.id]?.lastAnsweredAt ?? 0) ||
    difficultyFit(b.difficulty, target) - difficultyFit(a.difficulty, target),
  )[0];
}

function weightedPick<T>(items: { item: T; w: number }[], rng: Rng): number {
  const total = items.reduce((s, x) => s + x.w, 0);
  if (total <= 0) return 0;
  let r = rng() * total;
  for (let i = 0; i < items.length; i++) {
    r -= items[i].w;
    if (r <= 0) return i;
  }
  return items.length - 1;
}

export function selectQuestions(input: SelectionInput): Question[] {
  const { pool, states, count, now } = input;
  const rng = createRng(input.seed);
  const exclude = input.exclude ?? new Set<string>();
  const candidates = pool.filter((q) => !exclude.has(q.id));
  if (count <= 0 || candidates.length === 0) return [];

  const mastery = masteryBySubtopic(pool, states);
  const targetFor = (q: Question) =>
    input.fixedTarget ?? input.targets?.[q.topic] ?? DEFAULT_TARGET;

  const reviews = candidates
    .filter((q) => isDue(states[q.id], now))
    .sort((a, b) => (states[a.id].dueAt ?? 0) - (states[b.id].dueAt ?? 0));
  const fresh = candidates.filter((q) => !states[q.id] || states[q.id].seen === 0);
  const stale = candidates
    .filter((q) => states[q.id] && states[q.id].seen > 0 && !isDue(states[q.id], now))
    .sort((a, b) => (states[a.id].lastAnsweredAt ?? 0) - (states[b.id].lastAnsweredAt ?? 0));

  const picked: Question[] = [];
  const reviewQuota = Math.ceil(count * (input.maxReviewShare ?? 0.4));
  picked.push(...reviews.slice(0, Math.min(reviewQuota, count)));

  // Um assunto com mais conteúdo não deve abafar os demais nas expedições.
  const topicCounts = new Map<TopicId, number>();
  for (const q of fresh) topicCounts.set(q.topic, (topicCounts.get(q.topic) ?? 0) + 1);
  const weighted = fresh.map((q) => {
    const m = mastery.get(subtopicKey(q.topic, q.subtopic));
    const priority = m ? MASTERY_PRIORITY[m.level] : 1;
    // Jitter evita sequências previsíveis sem abandonar a adaptação.
    return { item: q, w: difficultyFit(q.difficulty, targetFor(q)) * priority * (0.75 + rng() * 0.5) / topicCounts.get(q.topic)! };
  });
  while (picked.length < count && weighted.length > 0) {
    const i = weightedPick(weighted, rng);
    picked.push(weighted[i].item);
    weighted.splice(i, 1);
  }

  // Ainda falta? Revisões restantes, depois as vistas há mais tempo (próximas do alvo primeiro).
  for (const q of reviews.slice(reviewQuota)) if (picked.length < count) picked.push(q);
  const staleByFit = stale
    .map((q, idx) => ({ q, score: difficultyFit(q.difficulty, targetFor(q)) - idx * 0.01 }))
    .sort((a, b) => b.score - a.score);
  for (const { q } of staleByFit) if (picked.length < count) picked.push(q);

  return spreadSubtopics(picked);
}

/** Reordena para evitar o mesmo subassunto em sequência, mantendo a ordem relativa quando possível. */
export function spreadSubtopics(items: Question[]): Question[] {
  const remaining = items.slice();
  const out: Question[] = [];
  while (remaining.length) {
    const prev = out[out.length - 1];
    let idx = remaining.findIndex((q) => !prev || q.subtopic !== prev.subtopic);
    if (idx < 0) idx = 0;
    out.push(remaining.splice(idx, 1)[0]);
  }
  return out;
}

/** Ajuste gradual da dificuldade-alvo de um assunto após cada resposta. */
export function adjustTarget(current: number, correct: boolean, difficulty: Difficulty): number {
  const delta = correct ? 0.12 + Math.max(0, difficulty - current) * 0.05 : -0.22;
  return Math.min(4, Math.max(1, current + delta));
}
