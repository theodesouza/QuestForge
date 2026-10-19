import type { Attempt, Delta, GameState } from '../../domain/game/types';

export interface GameRepository {
  /** Estado salvo, ou null se o app nunca foi iniciado. */
  load(): Promise<GameState | null>;
  /** Grava numa única transação tudo o que o Delta marcou como alterado. */
  commit(state: GameState, delta: Delta): Promise<void>;
  /** Apaga todo o progresso. */
  reset(): Promise<void>;
  recentAttempts(limit: number): Promise<Attempt[]>;
  /** Todas as tentativas desde o instante UTC, inclusive, mais recentes primeiro. */
  activitySince(since: number): Promise<Attempt[]>;
  /** Só erros; desempate por ID decrescente mantém a paginação estável. */
  mistakeHistory(limit: number, offset: number): Promise<Attempt[]>;
}

/** Mantido por compatibilidade: a normalização vive no domínio (normalizeState). */
export { normalizeProfile as hydrateProfile } from '../../domain/game/normalize';
