/**
 * Por que cada alternativa errada do banco de questões está errada: o equívoco que leva
 * a ela. A tela de feedback das missões, chefões e expedições mostra a nota da
 * alternativa escolhida (letra canônica — as alternativas são embaralhadas na tela, então
 * as notas nunca citam letras).
 */
import type { AltKey } from '../types';
import { NOTES_BASICA } from './distractors/basica';
import { NOTES_FINANCEIRA } from './distractors/financeira';
import { NOTES_OUTROS } from './distractors/outros';
import { NOTES_PORCENTAGEM } from './distractors/porcentagem';
import { NOTES_RAZAO } from './distractors/razao-proporcao';

export type DistractorNotes = Record<string, Partial<Record<AltKey, string>>>;

export const DISTRACTOR_NOTES: DistractorNotes = {
  ...NOTES_BASICA,
  ...NOTES_RAZAO,
  ...NOTES_PORCENTAGEM,
  ...NOTES_FINANCEIRA,
  ...NOTES_OUTROS,
};

export function distractorNote(questionId: string, chosen: AltKey): string | undefined {
  return DISTRACTOR_NOTES[questionId]?.[chosen];
}
