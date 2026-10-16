/**
 * Planejamento de uma tentativa de missão (rejogabilidade).
 *
 * Regras, em ordem de prioridade:
 * 1. Dificuldade coerente com a missão: cada vaga tem uma dificuldade-alvo (perfil da
 *    missão) e só aceita questões a no máximo 1 nível de distância.
 * 2. Inéditas primeiro: a tentativa usa o MAIOR número possível de inéditas (emparelhamento
 *    máximo entre vagas e inéditas compatíveis) — nenhuma já vista é repetida se uma
 *    inédita ainda pudesse ocupar o lugar dela.
 * 3. Reaproveitamento inteligente: esgotadas as inéditas, voltam primeiro os Ecos
 *    (erros ainda não redimidos) que já venceram, depois os demais Ecos, as revisões
 *    vencidas, as que já foram erradas ou acertadas no chute e, por último, as vistas
 *    há mais tempo — a tentativa anterior é a última a se repetir. Essa prioridade vem
 *    antes da distância de dificuldade (dentro da faixa de ±1).
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
  const slots = input.profile.map((d, i) => ({ d, i }));
  const picked = new Map<number, Question>();
  const used = new Set<string>();
  const perSubtopic = new Map<string, number>();
  const unseenPool = pool.filter((q) => isUnseen(states[q.id]));
  // Quantas inéditas a tentativa consegue usar no máximo — a meta a preservar a cada escolha.
  const target = maxUnseenMatching(input.profile, unseenPool);
  let unseenPicked = 0;
  // A cada passo, escolhe primeiro a vaga com MENOS inéditas compatíveis: assim as
  // inéditas raras (ex.: só nível 4 sobrando) vão para a vaga que pode usá-las.
  const openSlots = shuffle(slots, rng);
  const freshOptions = (d: Difficulty) => unseenPool.filter((q) => !used.has(q.id) && inBand(q, d)).length;

  while (openSlots.length) {
    let k = 0;
    for (let j = 1; j < openSlots.length; j++) {
      if (freshOptions(openSlots[j].d) < freshOptions(openSlots[k].d)) k = j;
    }
    const slot = openSlots.splice(k, 1)[0];
    const rest = openSlots.map((o) => o.d);
    const ranked = pool
      .filter((q) => !used.has(q.id))
      .map((q) => {
        const st = states[q.id];
        const distance = Math.abs(q.difficulty - slot.d);
        const unseen = isUnseen(st);
        const recency = st?.lastAnsweredAt ?? 0; // mais antiga primeiro
        const key = [distance > 1 ? 1 : 0, unseen ? 0 : 1, reuseRank(st, now), distance, recency, perSubtopic.get(q.subtopic) ?? 0, tiebreak.get(q.id) ?? 0];
        return { q, unseen, key };
      })
      .sort((a, b) => (lexLess(a.key, b.key) ? -1 : lexLess(b.key, a.key) ? 1 : 0));
    // Primeira candidata que ainda deixa as vagas restantes alcançarem a meta de inéditas.
    const choice =
      ranked.find((c) => {
        const after = unseenPicked + (c.unseen ? 1 : 0);
        if (after >= target) return true;
        const remaining = unseenPool.filter((q) => !used.has(q.id) && q.id !== c.q.id);
        return after + maxUnseenMatching(rest, remaining) >= target;
      }) ?? ranked[0];
    if (!choice) break;
    picked.set(slot.i, choice.q);
    used.add(choice.q.id);
    if (choice.unseen) unseenPicked++;
    perSubtopic.set(choice.q.subtopic, (perSubtopic.get(choice.q.subtopic) ?? 0) + 1);
  }

  // Ordem de apresentação: rampa de dificuldade (o perfil já vem em ordem crescente),
  // sem repetir subassunto em sequência quando der.
  const ordered = slots.map((s) => picked.get(s.i)).filter((q): q is Question => !!q);
  return avoidSameSubtopicInARow(ordered);
}

function inBand(q: Question, d: Difficulty): boolean {
  return Math.abs(q.difficulty - d) <= 1;
}

/**
 * Emparelhamento máximo entre vagas (dificuldades) e questões compatíveis (±1).
 * Cada questão cobre um intervalo [d−1, d+1] de vagas; percorrendo as vagas em ordem
 * crescente e dando a cada uma a questão compatível de intervalo que termina primeiro,
 * o guloso é ótimo (problema clássico de pontos × intervalos).
 */
export function maxUnseenMatching(slots: readonly Difficulty[], questions: readonly Question[]): number {
  const free = questions.map((q) => q.difficulty).sort((a, b) => a - b);
  let n = 0;
  for (const d of [...slots].sort((a, b) => a - b)) {
    const i = free.findIndex((qd) => Math.abs(qd - d) <= 1);
    if (i < 0) continue;
    free.splice(i, 1);
    n++;
  }
  return n;
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
