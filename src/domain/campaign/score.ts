/**
 * Pontuação de uma tentativa de missão (0–1000) e estrelas (0–3).
 *
 * - Cada questão planejada vale pontos pela dificuldade; acertar sem dicas vale tudo,
 *   cada dica tira 25% (até 50%) e o chute vale metade — igual ao XP.
 * - A pontuação é normalizada pelo máximo daquela tentativa, então tentativas com
 *   sorteios diferentes são comparáveis: 1000 = todas certas, sem dicas e sem chute.
 * - Questões de reforço (andaime) não entram na conta: elas ajudam, não pontuam.
 * - Estrelas: ★ concluiu, ★★ errou no máximo uma, ★★★ acertou todas.
 */
import type { Difficulty } from '../../content/types';
import { GUESS_MULT, hintMultiplier } from '../progression/xp';

export const SCORE_MAX = 1000;
const POINTS: Record<Difficulty, number> = { 1: 100, 2: 125, 3: 150, 4: 175 };

export interface ScoredAnswer {
  questionId: string;
  difficulty: Difficulty;
  /** null = não respondida (pulada e não retomada). */
  correct: boolean | null;
  guessed: boolean;
  hints: number;
}

export function missionScore(answers: readonly ScoredAnswer[]): number {
  let max = 0;
  let earned = 0;
  for (const a of answers) {
    const p = POINTS[a.difficulty];
    max += p;
    if (a.correct) earned += p * hintMultiplier(a.hints) * (a.guessed ? GUESS_MULT : 1);
  }
  return max === 0 ? 0 : Math.round((SCORE_MAX * earned) / max);
}

export function missionStars(passed: boolean, correct: number, total: number): 0 | 1 | 2 | 3 {
  if (!passed) return 0;
  if (correct >= total) return 3;
  if (correct >= total - 1) return 2;
  return 1;
}

/** Recompensas únicas por estrela (registro `mission:<id>:star<n>`): melhorar compensa uma vez. */
export const STAR_REWARDS: Record<2 | 3, { xp: number; ink: number }> = {
  2: { xp: 15, ink: 5 },
  3: { xp: 30, ink: 10 },
};
