import type { Question } from '../../types';
import { AUTORAL } from '../_helpers';

/** Apenas os metadados repetidos; enunciado, alternativas e contas são sempre autorais. */
export function authored(q: Omit<Question, 'source' | 'skills' | 'estimatedSeconds'> & Partial<Pick<Question, 'skills' | 'estimatedSeconds'>>): Question {
  return { source: AUTORAL, skills: ['H3'], estimatedSeconds: 45 + q.difficulty * 15, ...q };
}
