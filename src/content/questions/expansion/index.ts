import type { Question } from '../../types';
import { GOLEM_EXTRA, VALE_MISSIONS } from './vale';
import { MERCADO_MISSIONS, MERCADOR_EXTRA } from './mercado';
import { PLANICIES_MISSIONS, QUIMERA_EXTRA } from './planicies';

export const ADDITIONAL_MISSION_QUESTIONS: Record<string, readonly Question[]> = {
  ...VALE_MISSIONS, ...MERCADO_MISSIONS, ...PLANICIES_MISSIONS,
};
export const ADDITIONAL_BOSS_QUESTIONS: Record<string, readonly Question[]> = {
  'golem-proporcional': GOLEM_EXTRA,
  'mercador-composto': MERCADOR_EXTRA,
  'quimera-fracionaria': QUIMERA_EXTRA,
};
export const EXPANSION_QUESTIONS: readonly Question[] = [
  ...Object.values(ADDITIONAL_MISSION_QUESTIONS).flat(),
  ...Object.values(ADDITIONAL_BOSS_QUESTIONS).flat(),
];
