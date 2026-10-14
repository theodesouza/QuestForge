import type { AltKey, Question, QuestionSource } from '../types';

export const AUTORAL: QuestionSource = { kind: 'autoral' };

/** Monta o mapa de alternativas A–E na ordem dada. */
export function alts(a: string, b: string, c: string, d: string, e: string): Record<AltKey, string> {
  return { A: a, B: b, C: c, D: d, E: e };
}

/** Identidade tipada — mantém cada lote legível e checado pelo compilador. */
export function batch(questions: Question[]): readonly Question[] {
  return questions;
}
