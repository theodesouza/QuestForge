/**
 * CloudStore sobre o Cloud Firestore (SDK JS). Layout — nada além do que a conta precisa:
 *
 *   users/{uid}/save/state          documento-snapshot versionado (ver sync/types.ts → RemoteSave)
 *   users/{uid}/attempts/{chunkId}  lotes do log de tentativas (append-only, idempotentes)
 *
 * O servidor valida tudo nas regras (firestore.rules): dono = uid autenticado pelo Google,
 * `rev = anterior + 1`, geração e schema que nunca regridem, tamanhos e campos permitidos.
 * O conteúdo do progresso é uma string opaca (`data`) — o servidor não precisa entendê-lo, e
 * strings longas evitam a explosão de índices que mapas aninhados causariam.
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  runTransaction,
  setDoc,
  writeBatch,
  type DocumentData,
  type Firestore,
} from 'firebase/firestore';
import type { Attempt } from '../../domain/game/types';
import {
  SyncError,
  type AttemptChunk,
  type CloudStore,
  type RemoteSave,
  type SyncErrorCode,
  type TransactResult,
} from '../../sync/types';

const SAVE_FIELDS = ['schema', 'rev', 'epoch', 'nonce', 'ancestry', 'deviceId', 'updatedAt', 'appVersion', 'data', 'hash', 'stats'] as const;
const BATCH = 400; // limite do Firestore: 500 operações por lote

/** Traduz erros do Firestore para os códigos que o motor sabe tratar. */
export function mapFirestoreError(e: unknown): SyncError {
  if (e instanceof SyncError) return e;
  const code = String((e as { code?: unknown } | null)?.code ?? '').replace(/^firestore\//, '');
  const message = e instanceof Error ? e.message : String(e);
  const table: Record<string, SyncErrorCode> = {
    unavailable: 'offline',
    cancelled: 'offline',
    aborted: 'offline', // contenção que esgotou as tentativas: o motor refaz o ciclo
    'failed-precondition': 'offline',
    'deadline-exceeded': 'timeout',
    'resource-exhausted': 'quota',
    'permission-denied': 'permission',
    unauthenticated: 'unauthenticated',
  };
  const mapped = table[code] ?? (/offline|network|unavailable/i.test(message) ? 'offline' : 'unknown');
  return new SyncError(mapped, message, e);
}

async function guard<T>(op: () => Promise<T>): Promise<T> {
  try {
    return await op();
  } catch (e) {
    throw mapFirestoreError(e);
  }
}

function toRemoteSave(data: DocumentData): RemoteSave {
  for (const f of SAVE_FIELDS) {
    if (data[f] === undefined) throw new SyncError('corrupt-remote', `Documento de salvamento sem o campo "${f}".`);
  }
  if (typeof data.data !== 'string' || typeof data.rev !== 'number' || !Array.isArray(data.ancestry)) {
    throw new SyncError('corrupt-remote', 'Documento de salvamento com tipos inválidos.');
  }
  const save: RemoteSave = {
    schema: data.schema,
    rev: data.rev,
    epoch: data.epoch,
    nonce: data.nonce,
    ancestry: data.ancestry,
    deviceId: data.deviceId,
    updatedAt: data.updatedAt,
    appVersion: data.appVersion,
    data: data.data,
    hash: data.hash,
    stats: data.stats,
  };
  if (data.legacyImport) save.legacyImport = data.legacyImport;
  return save;
}

const toDocument = (save: RemoteSave): DocumentData => ({ ...save });

export class FirestoreCloudStore implements CloudStore {
  constructor(private readonly db: Firestore) {}

  private saveRef(uid: string) {
    return doc(this.db, 'users', uid, 'save', 'state');
  }

  private attemptsRef(uid: string) {
    return collection(this.db, 'users', uid, 'attempts');
  }

  read(uid: string): Promise<RemoteSave | null> {
    return guard(async () => {
      const snap = await getDoc(this.saveRef(uid));
      return snap.exists() ? toRemoteSave(snap.data()) : null;
    });
  }

  transact(uid: string, decide: (remote: RemoteSave | null) => RemoteSave | null): Promise<TransactResult> {
    return guard(() =>
      runTransaction(
        this.db,
        async (tx) => {
          const ref = this.saveRef(uid);
          const snap = await tx.get(ref);
          const remote = snap.exists() ? toRemoteSave(snap.data()) : null;
          const next = decide(remote);
          if (next) tx.set(ref, toDocument(next));
          return { remote, written: next };
        },
        { maxAttempts: 5 },
      ),
    );
  }

  putAttempts(uid: string, chunk: AttemptChunk): Promise<void> {
    return guard(() =>
      setDoc(doc(this.attemptsRef(uid), chunk.id), {
        deviceId: chunk.deviceId,
        from: chunk.from,
        to: chunk.to,
        count: chunk.attempts.length,
        data: JSON.stringify(chunk.attempts),
      }),
    );
  }

  listAttempts(uid: string): Promise<AttemptChunk[]> {
    return guard(async () => {
      const snap = await getDocs(this.attemptsRef(uid));
      return snap.docs
        .map((d) => {
          const x = d.data();
          let attempts: Attempt[];
          try {
            attempts = JSON.parse(String(x.data)) as Attempt[];
          } catch {
            throw new SyncError('corrupt-remote', `Lote de tentativas ${d.id} ilegível.`);
          }
          return { id: d.id, deviceId: String(x.deviceId), from: Number(x.from), to: Number(x.to), attempts };
        })
        .sort((a, b) => a.id.localeCompare(b.id));
    });
  }

  deleteAttempts(uid: string): Promise<void> {
    return guard(async () => {
      const snap = await getDocs(this.attemptsRef(uid));
      for (let i = 0; i < snap.docs.length; i += BATCH) {
        const batch = writeBatch(this.db);
        for (const d of snap.docs.slice(i, i + BATCH)) batch.delete(d.ref);
        await batch.commit();
      }
    });
  }

  deleteAllUserData(uid: string): Promise<void> {
    return guard(async () => {
      await this.deleteAttempts(uid);
      const batch = writeBatch(this.db);
      batch.delete(this.saveRef(uid));
      await batch.commit();
    });
  }
}
