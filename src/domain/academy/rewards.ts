/**
 * Recompensas da Academia. Princípios (PROJECT_PLAN §2.3 e §2.4):
 * - recompensa marcos de aprendizado (estudar, praticar com aproveitamento, dominar,
 *   manter o domínio), nunca o simples avanço por telas ou a repetição;
 * - cada marco paga uma vez só (registro `academy:*`); errar nunca tira nada;
 * - ajuda na prática é bem-vinda, mas acerto com dica vale metade para o marco.
 */
import type { StageKind } from '../../content/academy/types';

export const STUDIED_REWARD = { xp: 15, ink: 2 } as const;
export const PRACTICED_REWARD = { xp: 10, ink: 0 } as const;
/** Acertos na prática para o marco (acerto com dica conta meio). */
export const PRACTICE_MILESTONE = 3;

export const MASTERED_REWARD: Record<StageKind, { xp: number; ink: number }> = {
  descoberta: { xp: 25, ink: 5 },
  fundamentos: { xp: 35, ink: 6 },
  interpretacao: { xp: 40, ink: 8 },
  aplicacoes: { xp: 45, ink: 8 },
  aprofundamento: { xp: 55, ink: 10 },
  maestria: { xp: 70, ink: 14 },
};

/** Revisão espaçada no prazo: uma vez por caixa. */
export const REVIEWED_REWARD = { xp: 12, ink: 3 } as const;
/** Insígnia de domínio: todas as etapas de uma aula dominadas. */
export const SEALED_REWARD = { xp: 80, ink: 25 } as const;

/** Títulos por marcos da Academia (itens do catálogo). */
export const ACADEMY_TITLES = {
  firstMastery: 'title-aprendiz',
  /** Etapas dominadas para o segundo título. */
  manyMastered: { itemId: 'title-estudioso', count: 15 },
  /** Insígnias de aula para o terceiro título. */
  seals: { itemId: 'title-erudito', count: 5 },
  /** Todas as aulas com insígnia. */
  allSeals: 'title-sabio',
} as const;
