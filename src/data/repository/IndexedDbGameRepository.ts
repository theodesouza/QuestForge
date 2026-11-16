/**
 * Repositório do navegador (versão para computador): o mesmo contrato do SQLite do celular, sobre
 * o IndexedDB. Um banco por conta (`questforge-<uid>`), com três gavetas:
 *
 *   state     o progresso inteiro, num registro só (JSON)
 *   attempts  o log de tentativas; a chave é a posição (`rowid`, crescente), com índice único pelo
 *             id da tentativa (repetida não entra duas vezes) e índice por data
 *   kv        metadados da sincronização (base, pendências, cursor) e o backup de antes do Áster
 *
 * Cada gravação é UMA transação do IndexedDB: ou entra tudo (progresso, tentativas e metadados),
 * ou não entra nada. Fechar a aba no meio não deixa o progresso pela metade.
 */
import { normalizeState } from '../../domain/game/normalize';
import type { Attempt, Delta, GameState } from '../../domain/game/types';
import type { GameRepository, KvWrite, StoredAttempt } from './GameRepository';

const VERSION = 1;
const STATE = 'state';
const ATTEMPTS = 'attempts';
const KV = 'kv';
const STATE_KEY = 'game';

interface AttemptRow {
  rowid?: number;
  id: string;
  createdAt: number;
  correct: boolean;
  attempt: Attempt;
}

const request = <T>(req: IDBRequest<T>): Promise<T> =>
  new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('Falha no armazenamento local'));
  });

const finished = (tx: IDBTransaction): Promise<void> =>
  new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('Falha ao gravar no armazenamento local'));
    tx.onabort = () => reject(tx.error ?? new Error('Gravação interrompida'));
  });

/** Mais recentes primeiro; em datas iguais, id decrescente (paginação estável). */
const newestFirst = (a: Attempt, b: Attempt) => b.createdAt - a.createdAt || (a.id < b.id ? 1 : a.id > b.id ? -1 : 0);

export function openIndexedDb(name: string, factory: IDBFactory = indexedDB): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = factory.open(name, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STATE)) db.createObjectStore(STATE);
      if (!db.objectStoreNames.contains(KV)) db.createObjectStore(KV);
      if (!db.objectStoreNames.contains(ATTEMPTS)) {
        const store = db.createObjectStore(ATTEMPTS, { keyPath: 'rowid', autoIncrement: true });
        store.createIndex('id', 'id', { unique: true });
        store.createIndex('createdAt', 'createdAt');
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('Não foi possível abrir o armazenamento local'));
    req.onblocked = () => reject(new Error('O armazenamento local está em uso por outra aba'));
  });
}

export function deleteIndexedDb(name: string, factory: IDBFactory = indexedDB): Promise<void> {
  return new Promise((resolve, reject) => {
    const req = factory.deleteDatabase(name);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error ?? new Error('Não foi possível apagar o armazenamento local'));
    req.onblocked = () => resolve(); // some quando a última aba fechar
  });
}

export class IndexedDbGameRepository implements GameRepository {
  constructor(private readonly db: IDBDatabase) {}

  close(): void {
    this.db.close();
  }

  async load(): Promise<GameState | null> {
    const raw = await request<string | undefined>(this.db.transaction(STATE).objectStore(STATE).get(STATE_KEY));
    return raw ? normalizeState(JSON.parse(raw) as GameState, Date.now()) : null;
  }

  async commit(state: GameState, delta: Delta, kv: KvWrite[] = []): Promise<void> {
    const tx = this.db.transaction([STATE, ATTEMPTS, KV], 'readwrite');
    const done = finished(tx);
    tx.objectStore(STATE).put(JSON.stringify(state), STATE_KEY);
    this.addAttempts(tx, delta.attempts);
    this.applyKv(tx, kv);
    await done;
  }

  async reset(): Promise<void> {
    const tx = this.db.transaction([STATE, ATTEMPTS], 'readwrite');
    const done = finished(tx);
    tx.objectStore(STATE).clear();
    tx.objectStore(ATTEMPTS).clear();
    await done;
  }

  async replaceAll(state: GameState, opts: { kv?: KvWrite[]; wipeAttempts?: boolean } = {}): Promise<void> {
    const tx = this.db.transaction([STATE, ATTEMPTS, KV], 'readwrite');
    const done = finished(tx);
    tx.objectStore(STATE).put(JSON.stringify(state), STATE_KEY);
    if (opts.wipeAttempts) tx.objectStore(ATTEMPTS).clear();
    this.applyKv(tx, opts.kv ?? []);
    await done;
  }

  async getKv(key: string): Promise<string | null> {
    return (await request<string | undefined>(this.db.transaction(KV).objectStore(KV).get(key))) ?? null;
  }

  async setKv(writes: KvWrite[]): Promise<void> {
    const tx = this.db.transaction(KV, 'readwrite');
    const done = finished(tx);
    this.applyKv(tx, writes);
    await done;
  }

  async recentAttempts(limit: number): Promise<Attempt[]> {
    return (await this.allAttempts()).sort((a, b) => b.createdAt - a.createdAt).slice(0, limit);
  }

  async attemptsAfter(cursor: number, limit: number): Promise<StoredAttempt[]> {
    if (limit <= 0) return [];
    const rows = await request<AttemptRow[]>(this.db.transaction(ATTEMPTS).objectStore(ATTEMPTS).getAll(IDBKeyRange.lowerBound(cursor, true), limit));
    return rows.map((r) => ({ rowid: r.rowid as number, attempt: r.attempt }));
  }

  async maxAttemptRowid(): Promise<number> {
    const cursor = await request(this.db.transaction(ATTEMPTS).objectStore(ATTEMPTS).openKeyCursor(null, 'prev'));
    return cursor ? (cursor.key as number) : 0;
  }

  async importAttempts(attempts: Attempt[]): Promise<number> {
    const tx = this.db.transaction(ATTEMPTS, 'readwrite');
    const done = finished(tx);
    this.addAttempts(tx, attempts);
    await done;
    return this.maxAttemptRowid();
  }

  async activitySince(since: number): Promise<Attempt[]> {
    const rows = await request<AttemptRow[]>(this.db.transaction(ATTEMPTS).objectStore(ATTEMPTS).index('createdAt').getAll(IDBKeyRange.lowerBound(since)));
    return rows.map((r) => r.attempt).sort(newestFirst);
  }

  async mistakeHistory(limit: number, offset: number): Promise<Attempt[]> {
    return (await this.allAttempts())
      .filter((a) => !a.correct)
      .sort(newestFirst)
      .slice(offset, offset + limit);
  }

  private async allAttempts(): Promise<Attempt[]> {
    const rows = await request<AttemptRow[]>(this.db.transaction(ATTEMPTS).objectStore(ATTEMPTS).getAll());
    return rows.map((r) => r.attempt);
  }

  /**
   * Acrescenta ao log as tentativas que ainda não estão nele. A conferência usa o índice único por
   * id dentro da mesma transação; o `add` só é pedido depois dela, então um id repetido nunca chega
   * a causar o erro de unicidade (que abortaria a transação inteira).
   */
  private addAttempts(tx: IDBTransaction, list: Attempt[]): void {
    if (list.length === 0) return;
    const store = tx.objectStore(ATTEMPTS);
    const byId = store.index('id');
    const seen = new Set<string>();
    for (const attempt of list) {
      if (seen.has(attempt.id)) continue;
      seen.add(attempt.id);
      const check = byId.getKey(attempt.id);
      check.onsuccess = () => {
        if (check.result === undefined) store.add({ id: attempt.id, createdAt: attempt.createdAt, correct: attempt.correct, attempt } satisfies AttemptRow);
      };
    }
  }

  private applyKv(tx: IDBTransaction, writes: KvWrite[]): void {
    if (writes.length === 0) return;
    const store = tx.objectStore(KV);
    for (const w of writes) {
      if (w.value === null) store.delete(w.key);
      else store.put(w.value, w.key);
    }
  }
}
