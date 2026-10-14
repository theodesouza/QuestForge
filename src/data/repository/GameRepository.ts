import { createInitialState } from '../../domain/game/game';
import type { Attempt, Delta, GameState, Profile } from '../../domain/game/types';

export interface GameRepository {
  /** Estado salvo, ou null se o app nunca foi iniciado. */
  load(): Promise<GameState | null>;
  /** Grava numa única transação tudo o que o Delta marcou como alterado. */
  commit(state: GameState, delta: Delta): Promise<void>;
  /** Apaga todo o progresso. */
  reset(): Promise<void>;
  recentAttempts(limit: number): Promise<Attempt[]>;
}

/**
 * Completa um perfil salvo com valores padrão — permite acrescentar campos ao
 * perfil em versões futuras sem migração de esquema.
 */
export function hydrateProfile(raw: unknown, now: number): Profile {
  const defaults = createInitialState(now).profile;
  if (!raw || typeof raw !== 'object') return defaults;
  const p = raw as Partial<Profile>;
  return {
    ...defaults,
    ...p,
    equipped: { ...defaults.equipped, ...(p.equipped ?? {}) },
    totals: { ...defaults.totals, ...(p.totals ?? {}) },
    settings: { ...defaults.settings, ...(p.settings ?? {}) },
    targets: { ...(p.targets ?? {}) },
  };
}
