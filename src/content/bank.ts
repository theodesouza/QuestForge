/**
 * Banco de questões: agrega os lotes por assunto e oferece consultas.
 * Novos lotes entram aqui; o validador garante consistência (src/content/validation).
 */
import { BASICA } from './questions/basica';
import { ESTATISTICA } from './questions/estatistica';
import { FUNCOES } from './questions/funcoes';
import { GEOMETRIA } from './questions/geometria';
import { GRAFICOS } from './questions/graficos';
import { GRANDEZAS } from './questions/grandezas';
import { PORCENTAGEM } from './questions/porcentagem';
import { PROBABILIDADE } from './questions/probabilidade';
import { RAZAO_PROPORCAO } from './questions/razao-proporcao';
import type { Question, TopicId } from './types';

export const QUESTIONS: readonly Question[] = [
  ...RAZAO_PROPORCAO,
  ...PORCENTAGEM,
  ...BASICA,
  ...ESTATISTICA,
  ...PROBABILIDADE,
  ...GEOMETRIA,
  ...FUNCOES,
  ...GRAFICOS,
  ...GRANDEZAS,
];

const BY_ID = new Map(QUESTIONS.map((q) => [q.id, q]));

export function getQuestion(id: string): Question {
  const q = BY_ID.get(id);
  if (!q) throw new Error(`Questão desconhecida: ${id}`);
  return q;
}

export function findQuestion(id: string): Question | undefined {
  return BY_ID.get(id);
}

export function questionsFor(filter: { topics?: TopicId[]; subtopics?: string[] }): Question[] {
  return QUESTIONS.filter(
    (q) =>
      (!filter.topics || filter.topics.length === 0 || filter.topics.includes(q.topic)) &&
      (!filter.subtopics || filter.subtopics.length === 0 || filter.subtopics.includes(q.subtopic)),
  );
}
