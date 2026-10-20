/**
 * Contratos da sincronização. O motor (`engine.ts`) só conhece estas interfaces: o Firestore real,
 * o repositório SQLite e o controlador do jogo entram por fora — nos testes, entram versões
 * simuladas (nuvem falsa com falhas injetáveis, vários aparelhos).
 */
import type { Attempt } from '../domain/game/types';
import type { SyncStats } from './snapshot';

// ——————————————————————————————————————————————— nuvem

/** O documento de salvamento (`users/{uid}/save/state`). */
export interface RemoteSave {
  /** Versão do formato de `data` (ver snapshot.ts). */
  schema: number;
  /** Revisão: começa em 1 e cresce de 1 em 1. As regras do Firestore só aceitam `anterior + 1`. */
  rev: number;
  /** Geração do progresso. Reiniciar o progresso incrementa; a maior geração vence sem fusão. */
  epoch: number;
  /** Identificador único desta gravação (idempotência: permite saber se um envio chegou). */
  nonce: string;
  /** Nonces das gravações anteriores incluídas neste estado (as últimas 32). */
  ancestry: string[];
  deviceId: string;
  /** Relógio do aparelho que gravou (ms). Informativo. */
  updatedAt: number;
  appVersion: string;
  /** SyncState codificado (string canônica). Opaco para o servidor. */
  data: string;
  /** Hash de `data`: detecta truncamento/corrupção na leitura. */
  hash: string;
  /** Resumo legível (console, tela de confirmação). Não é fonte de verdade. */
  stats: SyncStats;
  /** Presente quando o estado nasceu da migração única do progresso legado. */
  legacyImport?: { fingerprint: string; at: number };
}

export interface AttemptChunk {
  /** `${deviceId}-${primeira posição}`: regravar o mesmo lote é idempotente. */
  id: string;
  deviceId: string;
  from: number;
  to: number;
  attempts: Attempt[];
}

export interface TransactResult {
  /** Documento que a nuvem tinha quando a transação decidiu (null se não existia). */
  remote: RemoteSave | null;
  /** Documento gravado; null se a decisão foi não gravar. */
  written: RemoteSave | null;
}

export interface CloudStore {
  /** Leitura simples (sem transação). */
  read(uid: string): Promise<RemoteSave | null>;
  /**
   * Leitura-decisão-gravação atômica. `decide` recebe o estado atual e devolve o próximo documento
   * (ou null para não gravar). Pode ser chamada mais de uma vez (contenção) e DEVE ser pura.
   * A gravação só vale se o documento não mudou desde a leitura — e o servidor ainda exige
   * `rev = anterior + 1` (regras de segurança).
   */
  transact(uid: string, decide: (remote: RemoteSave | null) => RemoteSave | null): Promise<TransactResult>;
  putAttempts(uid: string, chunk: AttemptChunk): Promise<void>;
  listAttempts(uid: string): Promise<AttemptChunk[]>;
  /** Apaga os lotes de tentativas (reinício do progresso). */
  deleteAttempts(uid: string): Promise<void>;
  /** Apaga TUDO que a conta tem na nuvem (exclusão de conta). */
  deleteAllUserData(uid: string): Promise<void>;
}

// ——————————————————————————————————————————————— erros

export type SyncErrorCode =
  | 'offline' // sem rede ou serviço indisponível: tenta de novo
  | 'timeout' // a operação não respondeu a tempo: tenta de novo
  | 'quota' // cota do serviço esgotada: tenta bem mais tarde
  | 'unauthenticated' // sessão expirou ou foi revogada: precisa entrar de novo
  | 'permission' // regras negaram: não adianta repetir
  | 'needs-update' // a nuvem tem dados de uma versão mais nova do app
  | 'corrupt-remote' // o que está na nuvem não passou na verificação
  | 'integrity' // o envio faria o progresso regredir: barrado
  | 'remote-missing' // a nuvem perdeu um documento que já existiu
  | 'wrong-account' // o banco local pertence a outra conta
  | 'unknown';

/** Códigos que se resolvem sozinhos com o tempo. */
export const RETRYABLE: ReadonlySet<SyncErrorCode> = new Set(['offline', 'timeout', 'quota', 'unknown']);

export class SyncError extends Error {
  constructor(
    readonly code: SyncErrorCode,
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'SyncError';
  }
}

// ——————————————————————————————————————————————— metadados locais (sync_kv)

export const KV = {
  meta: 'meta',
  /** SyncState (codificado) que este aparelho sabe estar na nuvem — a BASE do merge de 3 vias. */
  base: 'base',
  /** Envios cuja chegada à nuvem ainda é incerta. */
  pending: 'pending',
  /** Cópia do progresso local descartado por um reinício vindo de outro aparelho (rede de segurança). */
  discarded: 'discarded',
} as const;

export type SyncNotice =
  | { kind: 'merged'; at: number; duplicateGrants: number; inkForgiven: number; settledQuests: number }
  | { kind: 'reset-adopted'; at: number }
  | { kind: 'restored'; at: number; stats: SyncStats };

export interface SyncMeta {
  v: 1;
  uid: string;
  deviceId: string;
  /** null = nunca falou com a nuvem; 0 = a nuvem estava vazia; n ≥ 1 = revisão da base. */
  baseRev: number | null;
  epoch: number;
  /** Reinício local ainda não confirmado pela nuvem. */
  resetPending: boolean;
  /** Última posição do log de tentativas já enviada. */
  attemptsCursor: number;
  lastSyncedAt: number | null;
  notice: SyncNotice | null;
  /** Restaurou de uma conta existente: falta baixar o histórico de tentativas. */
  restoreAttempts?: boolean;
  /** Reinício confirmado na nuvem: falta apagar os lotes antigos de tentativas. */
  wipeCloudAttempts?: boolean;
}

export interface PendingPush {
  nonce: string;
  /** SyncState (codificado) que foi enviado — vira a base se o envio tiver chegado. */
  snapshot: string;
}

// ——————————————————————————————————————————————— estado observável

export type SyncPhase = 'idle' | 'syncing' | 'offline' | 'error' | 'blocked';

export interface SyncStatus {
  phase: SyncPhase;
  error: SyncErrorCode | null;
  lastSyncedAt: number | null;
  /** Há alterações locais que a nuvem ainda não confirmou. */
  pendingChanges: boolean;
  notice: SyncNotice | null;
}

export type SyncOutcome =
  | { kind: 'up-to-date' }
  | { kind: 'pushed'; rev: number }
  | { kind: 'pulled'; rev: number }
  | { kind: 'merged'; rev: number }
  | { kind: 'created'; rev: number }
  | { kind: 'confirmed-empty' }
  | { kind: 'reset-adopted'; rev: number };
