import type { Attempt, Delta, GameState } from '../../domain/game/types';

/** Escrita num par chave → valor de sincronização (`null` apaga). Vai na MESMA transação do commit. */
export interface KvWrite {
  key: string;
  value: string | null;
}

export interface StoredAttempt {
  /** Posição no log local (monótona): serve de cursor para o envio em lotes. */
  rowid: number;
  attempt: Attempt;
}

export interface GameRepository {
  /** Estado salvo, ou null se o app nunca foi iniciado. */
  load(): Promise<GameState | null>;
  /** Grava numa única transação tudo o que o Delta marcou como alterado (e, junto, as escritas `kv`). */
  commit(state: GameState, delta: Delta, kv?: KvWrite[]): Promise<void>;
  /** Apaga todo o progresso (mantém os metadados de sincronização). */
  reset(): Promise<void>;
  recentAttempts(limit: number): Promise<Attempt[]>;

  /** Substitui TODO o progresso por `state` numa transação (restauração/adoção de reinício remoto). */
  replaceAll(state: GameState, opts?: { kv?: KvWrite[]; wipeAttempts?: boolean }): Promise<void>;
  getKv(key: string): Promise<string | null>;
  setKv(writes: KvWrite[]): Promise<void>;
  /** Tentativas gravadas depois do cursor, em ordem — o que ainda não foi enviado à nuvem. */
  attemptsAfter(cursor: number, limit: number): Promise<StoredAttempt[]>;
  /** Maior posição do log de tentativas (0 se vazio). */
  maxAttemptRowid(): Promise<number>;
  /** Insere tentativas vindas da nuvem; IDs repetidos são ignorados. Devolve a nova maior posição. */
  importAttempts(attempts: Attempt[]): Promise<number>;
}

/** Mantido por compatibilidade: a normalização vive no domínio (normalizeState). */
export { normalizeProfile as hydrateProfile } from '../../domain/game/normalize';
