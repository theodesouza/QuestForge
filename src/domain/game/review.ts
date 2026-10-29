/**
 * Rever questões já respondidas, sem sair da atividade (expedição, missão, foco, Caça aos
 * Ecos ou batalha). Funções puras: dizem QUAIS respostas dá para rever e com que dados.
 */
import type { AltKey } from '../../content/types';
import type { BattleState } from '../boss/battle';
import type { XpKind } from '../progression/xp';
import type { ActiveSession } from './types';

export interface ReviewItem {
  questionId: string;
  /** Alternativa que o jogador escolheu. */
  chosen: AltKey;
  correct: boolean;
  guessed: boolean;
  hints: number;
  xp: number;
  ink: number;
  kind: XpKind;
  echoOvercome: boolean;
  /** Posição na atividade (1 = primeira questão ou golpe), para o aviso "Revendo a questão N". */
  position: number;
}

/**
 * Respostas da sessão que dá para rever: as já respondidas (as puladas não têm resposta),
 * em ordem. `shownIndex` é a posição da questão em tela: se ela já foi respondida (feedback
 * à vista), ela própria não entra na lista — "anterior" é a que veio antes.
 */
export function sessionReviewItems(session: ActiveSession, answeredOnScreen: boolean): ReviewItem[] {
  const limit = answeredOnScreen ? session.index - 1 : session.index;
  const items: ReviewItem[] = [];
  session.answers.slice(0, Math.max(0, limit)).forEach((a, i) => {
    if (a.kind === 'skipped' || a.chosen === null) return;
    items.push({
      questionId: a.questionId,
      chosen: a.chosen,
      correct: a.correct,
      guessed: a.guessed,
      hints: a.hints,
      xp: a.xp,
      ink: a.ink,
      kind: a.kind,
      echoOvercome: !!a.echoOvercome,
      position: i + 1,
    });
  });
  return items;
}

/** Golpes da batalha que dá para rever (só os que guardaram a alternativa escolhida). */
export function battleReviewItems(battle: BattleState, answeredOnScreen: boolean): ReviewItem[] {
  const turns = answeredOnScreen ? battle.turns.slice(0, -1) : battle.turns;
  const items: ReviewItem[] = [];
  turns.forEach((t, i) => {
    if (!t.chosen) return;
    items.push({
      questionId: t.questionId,
      chosen: t.chosen,
      correct: t.correct,
      guessed: t.guessed,
      hints: t.hints,
      xp: 0,
      ink: 0,
      kind: 'first',
      echoOvercome: false,
      position: i + 1,
    });
  });
  return items;
}
