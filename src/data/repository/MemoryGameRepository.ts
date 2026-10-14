import type { Attempt, Delta, GameState } from '../../domain/game/types';
import { normalizeState } from '../../domain/game/normalize';
import type { GameRepository } from './GameRepository';

/**
 * Repositório em memória (pré-visualização web e testes). Guarda cópias
 * serializadas para se comportar como armazenamento real (sem referências compartilhadas).
 */
export class MemoryGameRepository implements GameRepository {
  private snapshot: string | null = null;
  private attempts: Attempt[] = [];
  /** Permite simular falhas de gravação nos testes. */
  failNextCommit = false;

  async load(): Promise<GameState | null> {
    return this.snapshot ? normalizeState(JSON.parse(this.snapshot) as GameState, Date.now()) : null;
  }

  async commit(state: GameState, delta: Delta): Promise<void> {
    if (this.failNextCommit) {
      this.failNextCommit = false;
      throw new Error('Falha simulada de gravação');
    }
    const ids = new Set(this.attempts.map((a) => a.id));
    const fresh = delta.attempts.filter((a) => !ids.has(a.id));
    this.snapshot = JSON.stringify(state);
    this.attempts.push(...fresh.map((a) => ({ ...a })));
  }

  async reset(): Promise<void> {
    this.snapshot = null;
    this.attempts = [];
  }

  async recentAttempts(limit: number): Promise<Attempt[]> {
    return [...this.attempts].sort((a, b) => b.createdAt - a.createdAt).slice(0, limit);
  }
}
