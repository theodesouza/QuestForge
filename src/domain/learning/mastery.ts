/**
 * Domínio por subassunto. Estimativa bayesiana simples (Beta(1,1)) sobre acertos
 * confiantes × erros, com amostra mínima antes de qualquer porcentagem e exigência
 * de evidência espaçada (caixa ≥ 3) para "Dominado".
 */
import type { Question, TopicId } from '../../content/types';
import type { QuestionState } from './srs';

export type MasteryLevel = 'inexplorado' | 'descoberta' | 'progresso' | 'firme' | 'dominado';

export const MASTERY_LABEL: Record<MasteryLevel, string> = {
  inexplorado: 'Inexplorado',
  descoberta: 'Em descoberta',
  progresso: 'Em progresso',
  firme: 'Firme',
  dominado: 'Dominado',
};

/** Abaixo disso, a UI não exibe porcentagem de acerto. */
export const MIN_SAMPLE = 5;

export interface MasteryInfo {
  level: MasteryLevel;
  /** Evidências (acertos confiantes + erros). */
  n: number;
  /** Média a posteriori de acerto (0–1). */
  estimate: number;
  /** Questões com evidência espaçada (caixa ≥ 3). */
  spaced: number;
}

export function masteryFromCounts(correct: number, wrong: number, spaced: number): MasteryInfo {
  const n = correct + wrong;
  const estimate = (correct + 1) / (n + 2);
  let level: MasteryLevel;
  if (n === 0) level = 'inexplorado';
  else if (n < 4) level = 'descoberta';
  else if (estimate >= 0.8 && n >= 8 && spaced >= 3) level = 'dominado';
  else if (estimate >= 0.7) level = 'firme';
  else level = 'progresso';
  return { level, n, estimate, spaced };
}

export function subtopicKey(topic: TopicId, subtopic: string): string {
  return `${topic}/${subtopic}`;
}

export function masteryBySubtopic(
  questions: readonly Question[],
  states: Record<string, QuestionState>,
): Map<string, MasteryInfo> {
  const acc = new Map<string, { c: number; w: number; s: number }>();
  for (const q of questions) {
    const key = subtopicKey(q.topic, q.subtopic);
    const entry = acc.get(key) ?? { c: 0, w: 0, s: 0 };
    const st = states[q.id];
    if (st) {
      entry.c += st.correct;
      entry.w += st.wrong;
      if (st.box >= 3) entry.s += 1;
    }
    acc.set(key, entry);
  }
  const out = new Map<string, MasteryInfo>();
  for (const [key, v] of acc) out.set(key, masteryFromCounts(v.c, v.w, v.s));
  return out;
}

/** Fator de prioridade de treino: assuntos fracos/novos primeiro, dominados por último. */
export const MASTERY_PRIORITY: Record<MasteryLevel, number> = {
  inexplorado: 1.0,
  descoberta: 1.15,
  progresso: 1.35,
  firme: 0.75,
  dominado: 0.45,
};
