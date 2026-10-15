/**
 * Planejamento de uma tentativa de missão (rejogabilidade).
 *
 * Regras, em ordem de prioridade:
 * 1. Dificuldade coerente com a missão: cada vaga tem uma dificuldade-alvo (perfil da
 *    missão) e só aceita questões a no máximo 1 nível de distância.
 * 2. Inéditas primeiro: enquanto houver questão nunca resolvida que caiba na vaga,
 *    nenhuma já vista é repetida.
 * 3. Reaproveitamento inteligente: esgotadas as inéditas, voltam primeiro os Ecos
 *    (erros ainda não redimidos) que já venceram, depois os demais Ecos, as revisões
 *    vencidas, as que já foram erradas ou acertadas no chute e, por último, as vistas
 *    há mais tempo — a tentativa anterior é a última a se repetir.
 * 4. Variedade: subassuntos se alternam e o sorteio muda a cada tentativa (semente).
 *
 * Função pura e determinística para a mesma semente.
 */
import type { Difficulty, Question } from '../../content/types';
import { createRng, shuffle } from '../util/random';
import { isDue, type QuestionState } from './srs';

export interface MissionPlanInput {
  pool: readonly Question[];
  states: Record<string, QuestionState>;
  /** Dificuldade-alvo de cada vaga (o tamanho define quantas questões a tentativa tem). */
  profile: readonly Difficulty[];
  now: number;
  seed: number;
}

/** Quanto menor, mais cedo a questão já vista volta a uma tentativa. */
export function reuseRank(state: QuestionState | undefined, now: number): number {
  if (!state || state.seen === 0) return -1; // inédita
  if (state.echo && isDue(state, now)) return 0;
  if (state.echo) return 1;
  if (isDue(state, now)) return 2;
  if (state.wrong > 0 || state.guessedCorrect > 0) return 3;
  return 4;
}

export function isUnseen(state: QuestionState | undefined): boolean {
  return !state || state.seen === 0;
}

/** Quantas questões do pool o jogador ainda não resolveu. */
export function unseenCount(pool: readonly Question[], states: Record<string, QuestionState>): number {
  return pool.filter((q) => isUnseen(states[q.id])).length;
}

export function planMissionRun(input: MissionPlanInput): Question[] {
  const { pool, states, now } = input;
  const rng = createRng(input.seed);
  // Ordem aleatória como último critério de desempate (muda a cada tentativa).
  const tiebreak = new Map(shuffle(pool, rng).map((q, i) => [q.id, i]));
  // Vagas mais raras (dificuldades extremas) escolhem primeiro, para não ficarem sem questão.
  const slots = input.profile.map((d, i) => ({ d, i }));
  const supply = (d: Difficulty) => pool.filter((q) => Math.abs(q.difficulty - d) <= 1).length;
  const fillOrder = shuffle(slots, rng).sort((a, b) => supply(a.d) - supply(b.d));

  const picked = new Map<number, Question>();
  const used = new Set<string>();
  const perSubtopic = new Map<string, number>();

  for (const slot of fillOrder) {
    let best: { q: Question; key: number[] } | null = null;
    for (const q of pool) {
      if (used.has(q.id)) continue;
      const st = states[q.id];
      const distance = Math.abs(q.difficulty - slot.d);
      const outOfBand = distance > 1 ? 1 : 0;
      const unseen = isUnseen(st) ? 0 : 1;
      const rank = reuseRank(st, now);
      const recency = st?.lastAnsweredAt ?? 0; // mais antiga primeiro
      const key = [outOfBand, unseen, distance, rank, perSubtopic.get(q.subtopic) ?? 0, recency, tiebreak.get(q.id) ?? 0];
      if (!best || lexLess(key, best.key)) best = { q, key };
    }
    if (!best) break;
    picked.set(slot.i, best.q);
    used.add(best.q.id);
    perSubtopic.set(best.q.subtopic, (perSubtopic.get(best.q.subtopic) ?? 0) + 1);
  }

  // Ordem de apresentação: rampa de dificuldade (o perfil já vem em ordem crescente),
  // sem repetir subassunto em sequência quando der.
  const ordered = slots.map((s) => picked.get(s.i)).filter((q): q is Question => !!q);
  return avoidSameSubtopicInARow(ordered);
}

function lexLess(a: number[], b: number[]): boolean {
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return a[i] < b[i];
  }
  return false;
}

/** Troca vizinhas de mesma dificuldade para evitar o mesmo subassunto em sequência. */
function avoidSameSubtopicInARow(list: Question[]): Question[] {
  const out = list.slice();
  for (let i = 1; i < out.length; i++) {
    if (out[i].subtopic !== out[i - 1].subtopic) continue;
    const j = out.findIndex(
      (q, k) => k > i && q.difficulty === out[i].difficulty && q.subtopic !== out[i - 1].subtopic,
    );
    if (j > 0) [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
