import { QUESTIONS } from '../../content/bank';
import type { Difficulty, Question } from '../../content/types';

/** Um exemplo da mesma base do reforço, sem revelar questões avaliadas nesta sessão. */
export function scaffoldExample(practice: Question, excludedIds: readonly string[], maxDifficulty: Difficulty = practice.difficulty): Question | undefined {
  const excluded = new Set([...excludedIds, practice.id]);
  return QUESTIONS
    .filter(q => q.topic === practice.topic && q.subtopic === practice.subtopic &&
      q.difficulty <= maxDifficulty && !excluded.has(q.id))
    .sort((a, b) => a.difficulty - b.difficulty || a.id.localeCompare(b.id))[0];
}
