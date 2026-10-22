/**
 * Banco de questões: agrega os lotes por assunto e oferece consultas.
 * Novos lotes entram aqui; o validador garante consistência (src/content/validation).
 */
import { BASICA } from './questions/basica';
import { FIN_COMPRAS_A_PRAZO } from './questions/financeira/compras-a-prazo';
import { FIN_CUSTO_BENEFICIO } from './questions/financeira/custo-beneficio';
import { FIN_JUROS_COMPOSTOS } from './questions/financeira/juros-compostos';
import { FIN_JUROS_SIMPLES } from './questions/financeira/juros-simples';
import { MISSAO_R1M1_A } from './questions/missoes/r1-m1-a';
import { MISSAO_R1M1_B } from './questions/missoes/r1-m1-b';
import { MISSAO_R1M2_A } from './questions/missoes/r1-m2-a';
import { MISSAO_R1M2_B } from './questions/missoes/r1-m2-b';
import { MISSAO_R1M3_A } from './questions/missoes/r1-m3-a';
import { MISSAO_R1M3_B } from './questions/missoes/r1-m3-b';
import { MISSAO_R2M1_A } from './questions/missoes/r2-m1-a';
import { MISSAO_R2M1_B } from './questions/missoes/r2-m1-b';
import { MISSAO_R2M2_A } from './questions/missoes/r2-m2-a';
import { MISSAO_R2M2_B } from './questions/missoes/r2-m2-b';
import { MISSAO_R2M3_A } from './questions/missoes/r2-m3-a';
import { MISSAO_R2M3_B } from './questions/missoes/r2-m3-b';
import { MISSAO_R3M1_A } from './questions/missoes/r3-m1-a';
import { MISSAO_R3M1_B } from './questions/missoes/r3-m1-b';
import { MISSAO_R3M2_A } from './questions/missoes/r3-m2-a';
import { MISSAO_R3M2_B } from './questions/missoes/r3-m2-b';
import { MISSAO_R3M3_A } from './questions/missoes/r3-m3-a';
import { MISSAO_R3M3_B } from './questions/missoes/r3-m3-b';
import { ESTATISTICA } from './questions/estatistica';
import { EXPANSION_QUESTIONS } from './questions/expansion';
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
  ...FIN_JUROS_SIMPLES,
  ...FIN_JUROS_COMPOSTOS,
  ...FIN_COMPRAS_A_PRAZO,
  ...FIN_CUSTO_BENEFICIO,
  ...MISSAO_R1M1_A,
  ...MISSAO_R1M1_B,
  ...MISSAO_R1M2_A,
  ...MISSAO_R1M2_B,
  ...MISSAO_R1M3_A,
  ...MISSAO_R1M3_B,
  ...MISSAO_R2M1_A,
  ...MISSAO_R2M1_B,
  ...MISSAO_R2M2_A,
  ...MISSAO_R2M2_B,
  ...MISSAO_R2M3_A,
  ...MISSAO_R2M3_B,
  ...MISSAO_R3M1_A,
  ...MISSAO_R3M1_B,
  ...MISSAO_R3M2_A,
  ...MISSAO_R3M2_B,
  ...MISSAO_R3M3_A,
  ...MISSAO_R3M3_B,
  ...EXPANSION_QUESTIONS,
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
