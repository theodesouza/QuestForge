import type { Attempt, Delta, GameState } from '../../domain/game/types';
import { normalizeState } from '../../domain/game/normalize';
import type { GameRepository, KvWrite, StoredAttempt } from './GameRepository';

/**
 * Repositório em memória (pré-visualização web e testes). Guarda cópias
 * serializadas para se comportar como armazenamento real (sem referências compartilhadas).
 */
export class MemoryGameRepository implements GameRepository {
  private snapshot: string | null = null;
  private attempts: StoredAttempt[] = [];
  private nextRowid = 1;
  private kv = new Map<string, string>();
  /** Permite simular falhas de gravação nos testes. */
  failNextCommit = false;

  async load(): Promise<GameState | null> {
    return this.snapshot ? normalizeState(JSON.parse(this.snapshot) as GameState, Date.now()) : null;
  }

  async commit(state: GameState, delta: Delta, kv: KvWrite[] = []): Promise<void> {
    if (this.failNextCommit) {
      this.failNextCommit = false;
      throw new Error('Falha simulada de gravação');
    }
    this.snapshot = JSON.stringify(state);
    this.addAttempts(delta.attempts);
    this.applyKv(kv);
  }

  async reset(): Promise<void> {
    this.snapshot = null;
    this.attempts = [];
    this.nextRowid = 1;
  }

  async recentAttempts(limit: number): Promise<Attempt[]> {
    return this.attempts
      .map((s) => s.attempt)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);
  }

  async replaceAll(state: GameState, opts: { kv?: KvWrite[]; wipeAttempts?: boolean } = {}): Promise<void> {
    if (this.failNextCommit) {
      this.failNextCommit = false;
      throw new Error('Falha simulada de gravação');
    }
    this.snapshot = JSON.stringify(state);
    if (opts.wipeAttempts) {
      this.attempts = [];
      this.nextRowid = 1;
    }
    this.applyKv(opts.kv ?? []);
  }

  async getKv(key: string): Promise<string | null> {
    return this.kv.get(key) ?? null;
  }

  async setKv(writes: KvWrite[]): Promise<void> {
    this.applyKv(writes);
  }

  async attemptsAfter(cursor: number, limit: number): Promise<StoredAttempt[]> {
    return this.attempts.filter((s) => s.rowid > cursor).slice(0, limit).map((s) => ({ rowid: s.rowid, attempt: { ...s.attempt } }));
  }

  async maxAttemptRowid(): Promise<number> {
    return this.attempts.length ? this.attempts[this.attempts.length - 1].rowid : 0;
  }

  async importAttempts(attempts: Attempt[]): Promise<number> {
    this.addAttempts(attempts);
    return this.maxAttemptRowid();
  }

  private addAttempts(list: Attempt[]) {
    const ids = new Set(this.attempts.map((s) => s.attempt.id));
    for (const a of list) {
      if (ids.has(a.id)) continue;
      ids.add(a.id);
      this.attempts.push({ rowid: this.nextRowid++, attempt: { ...a } });
    }
  }

  private applyKv(writes: KvWrite[]) {
    for (const w of writes) {
      if (w.value === null) this.kv.delete(w.key);
      else this.kv.set(w.key, w.value);
    }
  }
}
