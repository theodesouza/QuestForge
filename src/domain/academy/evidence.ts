/**
 * Diagnóstico por etapa a partir das questões do Atlas (missões, chefões, expedições).
 *
 * Cada questão do banco está ligada às etapas que ensinam o que ela exige
 * (`content/academy/questionMap`). O estado de revisão de cada questão diz o que vale
 * agora: um Eco (erro ainda não redimido) é uma dificuldade em aberto; um erro que depois
 * virou acerto confiante é evolução; um acerto no chute não prova nada.
 *
 * Honestidade estatística: poucos dados não viram veredito. Um erro isolado é "atenção",
 * não "dificuldade"; dois ou três acertos não são "sólido".
 */
import { questionsForStage } from '../../content/academy/catalog';
import type { QuestionState } from '../learning/srs';
import type { StageProgress } from './progress';

export type EvidenceLevel = 'sem-dados' | 'poucos-dados' | 'dificuldade' | 'atencao' | 'em-construcao' | 'solido';

export const EVIDENCE_LABEL: Record<EvidenceLevel, string> = {
  'sem-dados': 'Sem dados ainda',
  'poucos-dados': 'Poucos dados',
  dificuldade: 'Dificuldade identificada',
  atencao: 'Vale revisar',
  'em-construcao': 'Em construção',
  solido: 'Sólido',
};

/** Evidência mínima (questões respondidas, ponderadas) para chamar algo de sólido. */
export const MIN_EVIDENCE = 3;
/** Erros em aberto (ponderados) e sua proporção para chamar algo de dificuldade. */
export const DIFFICULTY_OPEN = 2;
export const DIFFICULTY_SHARE = 0.4;

export interface StageEvidence {
  ref: string;
  /** Questões respondidas ligadas à etapa (ponderadas: principal 1, secundária 0,5). */
  answered: number;
  /** Erros ainda não redimidos. */
  open: number;
  /** Questões erradas e depois acertadas com confiança. */
  recovered: number;
  /** Acertos confiantes sem erro. */
  solid: number;
  /** Só acertos no chute. */
  guessed: number;
  level: EvidenceLevel;
  /** Questões com erro em aberto (para treinar e para explicar o diagnóstico). */
  openIds: string[];
  answeredIds: string[];
  /** Momento do erro em aberto mais recente. */
  lastOpenAt: number | null;
  /** Desempenho nas questões do Atlas depois de estudar/dominar a etapa. */
  since: { at: number; correct: number; wrong: number } | null;
}

export function classify(answered: number, open: number, solidish: number, guessed: number): EvidenceLevel {
  if (answered <= 0) return 'sem-dados';
  if (open >= DIFFICULTY_OPEN && open >= DIFFICULTY_SHARE * answered) return 'dificuldade';
  if (open > 0) return 'atencao';
  if (answered < MIN_EVIDENCE) return 'poucos-dados';
  if (solidish / answered >= 0.75 && guessed / answered < 0.25) return 'solido';
  return 'em-construcao';
}

export function stageEvidence(
  ref: string,
  states: Record<string, QuestionState>,
  progress?: StageProgress,
): StageEvidence {
  let answered = 0;
  let open = 0;
  let recovered = 0;
  let solid = 0;
  let guessed = 0;
  let lastOpenAt: number | null = null;
  const openIds: string[] = [];
  const answeredIds: string[] = [];
  const since = progress?.masteredAt ?? progress?.studiedAt ?? null;
  let sinceCorrect = 0;
  let sinceWrong = 0;

  for (const { id, weight } of questionsForStage(ref)) {
    const qs = states[id];
    if (!qs || qs.seen === 0) continue;
    answered += weight;
    answeredIds.push(id);
    if (qs.echo) {
      open += weight;
      openIds.push(id);
      if (qs.lastWrongAt !== null && (lastOpenAt === null || qs.lastWrongAt > lastOpenAt)) lastOpenAt = qs.lastWrongAt;
    } else if (qs.correct > 0) {
      if (qs.wrong > 0) recovered += weight;
      else solid += weight;
    } else if (qs.guessedCorrect > 0) {
      guessed += weight;
    }
    if (since !== null) {
      if (qs.lastCorrectAt !== null && qs.lastCorrectAt > since) sinceCorrect++;
      if (qs.lastWrongAt !== null && qs.lastWrongAt > since) sinceWrong++;
    }
  }

  return {
    ref,
    answered,
    open,
    recovered,
    solid,
    guessed,
    level: classify(answered, open, solid + recovered, guessed),
    openIds,
    answeredIds,
    lastOpenAt,
    since: since !== null && sinceCorrect + sinceWrong > 0 ? { at: since, correct: sinceCorrect, wrong: sinceWrong } : null,
  };
}

/** Frase curta e honesta sobre a evidência (interface). */
export function evidenceSentence(e: StageEvidence): string {
  const n = Math.round(e.answered);
  const openN = e.openIds.length;
  switch (e.level) {
    case 'sem-dados':
      return 'Você ainda não respondeu questões do Atlas sobre esta etapa.';
    case 'poucos-dados':
      return `Só ${n === 1 ? '1 questão respondida' : `${n} questões respondidas`} sobre esta etapa até agora — pouco para tirar conclusões.`;
    case 'dificuldade':
      return `${openN} erros ainda não redimidos em questões que esta etapa ensina a resolver.`;
    case 'atencao':
      return openN === 1
        ? 'Um erro ainda em aberto numa questão desta etapa. Um tropeço só não é diagnóstico, mas vale revisar.'
        : `${openN} erros em aberto, entre vários acertos: vale revisar antes de voltar ao Atlas.`;
    case 'em-construcao':
      return `${n} questões respondidas: há acertos, mas ainda não o bastante para dizer que está firme.`;
    case 'solido':
      return `${n} questões respondidas, sem erros em aberto: as evidências indicam domínio.`;
  }
}
