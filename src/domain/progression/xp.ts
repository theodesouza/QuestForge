/**
 * Regras de XP por questão. Função pura e determinística.
 * Documentadas em PROJECT_PLAN.md §2.3.
 */
import type { Difficulty } from '../../content/types';
import { HOUR_MS, isDue, type QuestionState } from '../learning/srs';

export const BASE_XP: Record<Difficulty, number> = { 1: 10, 2: 16, 3: 24, 4: 34 };
export const INK_PER_CORRECT: Record<Difficulty, number> = { 1: 1, 2: 2, 3: 3, 4: 4 };

export const REDEMPTION_MULT = 1.5;
export const REVIEW_MULT = 0.6;
export const REPEAT_MULT = 0.1;
export const GUESS_MULT = 0.5;
export const HINT_PENALTY = 0.25;
export const MIN_HINT_MULT = 0.5;
/** Uma questão já acertada só rende XP de repetição uma vez a cada 20 h. */
export const REPEAT_COOLDOWN_MS = 20 * HOUR_MS;

/**
 * - `practice`: acerto num Eco que ainda não voltou (antes do prazo). Conta como treino,
 *   mas não redime: o Eco continua e vale 150% quando vencer. Sem isso, errar de propósito
 *   e acertar na tentativa seguinte renderia XP de redenção sem fim.
 */
export type XpKind = 'first' | 'redemption' | 'review' | 'practice' | 'repeat' | 'cooldown' | 'wrong';

export interface XpInput {
  difficulty: Difficulty;
  correct: boolean;
  guessed: boolean;
  hintsUsed: number;
  prior: QuestionState | undefined;
  sessionId: string;
  now: number;
}

export interface XpResult {
  kind: XpKind;
  base: number;
  xp: number;
  ink: number;
}

export function hintMultiplier(hintsUsed: number): number {
  return Math.max(MIN_HINT_MULT, 1 - HINT_PENALTY * Math.max(0, hintsUsed));
}

export function classify(input: XpInput): XpKind {
  const { prior, correct, now, sessionId } = input;
  if (!correct) return 'wrong';
  if (!prior || prior.seen === 0) return 'first';
  const due = isDue(prior, now);
  // Redenção exige acerto confiante (um "chute" não redime) e o Eco já de volta (vencido).
  if (prior.echo && due && !input.guessed && prior.lastWrongSessionId !== sessionId) return 'redemption';
  if (due) return 'review';
  if (prior.lastXpAt !== null && now - prior.lastXpAt < REPEAT_COOLDOWN_MS) return 'cooldown';
  if (prior.echo) return 'practice';
  return 'repeat';
}

const KIND_MULT: Record<XpKind, number> = {
  first: 1,
  redemption: REDEMPTION_MULT,
  review: REVIEW_MULT,
  practice: REPEAT_MULT,
  repeat: REPEAT_MULT,
  cooldown: 0,
  wrong: 0,
};

export function computeXp(input: XpInput): XpResult {
  const kind = classify(input);
  const base = BASE_XP[input.difficulty];
  if (kind === 'wrong' || kind === 'cooldown') return { kind, base, xp: 0, ink: 0 };
  let mult = KIND_MULT[kind] * hintMultiplier(input.hintsUsed);
  if (input.guessed) mult *= GUESS_MULT;
  const xp = Math.max(1, Math.round(base * mult));
  const ink = kind === 'repeat' || kind === 'practice' ? 0 : INK_PER_CORRECT[input.difficulty];
  return { kind, base, xp, ink };
}

/**
 * Bônus de sessão (≥ 3 respondidas) e de sessão perfeita (≥ 5, sem erros).
 * Anti-farm: o bônus só vale quando ao menos 3 respostas foram aprendizado de verdade
 * (questão inédita, Eco redimido ou revisão no tempo certo). Repetir sem parar as
 * mesmas questões fáceis não rende bônus — nem XP, que já cai a 10% e depois a 0.
 */
export const VALUABLE_KINDS: readonly XpKind[] = ['first', 'redemption', 'review'];
export const MIN_VALUABLE_FOR_BONUS = 3;
export const SESSION_BONUS = 20;
export const PERFECT_BONUS = 20;
export const MISSION_FIRST_XP = 40;
export const MISSION_FIRST_INK = 10;

export function sessionBonus(answered: number, wrong: number, valuable = answered): { xp: number; perfect: boolean } {
  if (answered < 3 || valuable < MIN_VALUABLE_FOR_BONUS) return { xp: 0, perfect: false };
  const perfect = answered >= 5 && wrong === 0;
  return { xp: SESSION_BONUS + (perfect ? PERFECT_BONUS : 0), perfect };
}
