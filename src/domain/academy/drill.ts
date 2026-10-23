/**
 * Treino dirigido: depois de estudar uma etapa, o estudante testa o que aprendeu em
 * questões do Atlas ligadas a ela — primeiro os Ecos (erros ainda não redimidos), depois
 * as inéditas e, por fim, as já vistas há mais tempo.
 */
import { findStage, questionsForStage } from '../../content/academy/catalog';
import { findQuestion, questionsFor } from '../../content/bank';
import { isDue, type QuestionState } from '../learning/srs';
import { createRng, shuffle } from '../util/random';

export const DRILL_SIZE = 5;

function rank(st: QuestionState | undefined, now: number): number {
  if (!st || st.seen === 0) return 2;
  if (st.echo && isDue(st, now)) return 0;
  if (st.echo) return 1;
  if (st.wrong > 0 || st.guessedCorrect > 0) return 3;
  return 4;
}

export function planStageDrill(
  states: Record<string, QuestionState>,
  ref: string,
  now: number,
  seed: number,
  count = DRILL_SIZE,
): string[] {
  const loc = findStage(ref);
  if (!loc) return [];
  const rng = createRng(seed);
  const order = (ids: string[], weightOf: (id: string) => number) =>
    shuffle(ids, rng)
      .map((id) => ({ id, r: rank(states[id], now), w: weightOf(id), at: states[id]?.lastAnsweredAt ?? 0 }))
      .sort((a, b) => a.r - b.r || b.w - a.w || a.at - b.at)
      .map((x) => x.id);

  const mapped = questionsForStage(ref).filter((q) => findQuestion(q.id));
  const weights = new Map(mapped.map((q) => [q.id, q.weight]));
  const picked = order(
    mapped.map((q) => q.id),
    (id) => weights.get(id) ?? 0,
  ).slice(0, count);
  if (picked.length >= count) return picked;

  // Completa com questões dos subassuntos da aula (mesmo assunto).
  const chosen = new Set(picked);
  const extra = questionsFor({ topics: [loc.lesson.topic], subtopics: loc.lesson.subtopics })
    .map((q) => q.id)
    .filter((id) => !chosen.has(id));
  return [...picked, ...order(extra, () => 0)].slice(0, count);
}
