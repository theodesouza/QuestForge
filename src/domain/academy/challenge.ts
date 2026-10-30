/**
 * Desafios: problemas sem dicas que comprovam o domínio de uma etapa.
 * - Cada tentativa sorteia problemas do conjunto da etapa, evitando os da tentativa anterior
 *   (geradores trazem números novos a cada vez): refazer na hora não vira decoreba.
 * - Domínio exige acertar tudo em desafios de até 3 problemas (com 4 ou mais, admite um erro).
 */
import type { StageBody } from '../../content/academy/types';
import { createRng, hashString, shuffle } from '../util/random';

export const DEFAULT_CHALLENGE_SIZE = 3;

export function challengeSize(body: StageBody): number {
  return Math.max(1, Math.min(body.challengeSize ?? DEFAULT_CHALLENGE_SIZE, body.challenge.length));
}

export function challengePassed(correct: number, total: number): boolean {
  if (total <= 0) return false;
  return total <= 3 ? correct === total : correct >= total - 1;
}

export interface PlannedItem {
  exerciseId: string;
  seed: number;
}

/**
 * Sorteia os problemas de uma tentativa. Prioriza os que não estavam na tentativa anterior
 * (geradores contam sempre como novos) e mantém a ordem do conjunto (do mais simples ao
 * mais exigente).
 */
export function planChallenge(body: StageBody, lastIds: readonly string[], seed: number): PlannedItem[] {
  const size = challengeSize(body);
  const rng = createRng(seed);
  const last = new Set(lastIds);
  const pool = body.challenge.map((def, index) => ({ def, index, fresh: def.kind === 'gen' || !last.has(def.id) }));
  const ranked = [...shuffle(pool.filter((x) => x.fresh), rng), ...shuffle(pool.filter((x) => !x.fresh), rng)];
  return ranked
    .slice(0, size)
    .sort((a, b) => a.index - b.index)
    .map(({ def }) => ({ exerciseId: def.id, seed: hashString(`${seed}:${def.id}`) }));
}
