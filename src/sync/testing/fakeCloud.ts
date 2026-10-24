/**
 * Nuvem falsa para testes. Reproduz o contrato do Firestore que o motor usa:
 *  - transação = ler → `decide` → gravar só se o documento não mudou desde a leitura (senão repete `decide`);
 *  - regras de segurança: `rev` precisa ser `anterior + 1`; documentos acima do teto são recusados;
 *  - falhas injetáveis: sem rede, resposta perdida (gravou mas o aparelho não soube), transação que
 *    trava e só termina depois (commit tardio), serviço de armazenamento fora do ar.
 */
import { MAX_DATA_CHARS } from '../snapshot';
import { SyncError, type AttemptChunk, type CloudStore, type RemoteSave, type SyncErrorCode, type TransactResult } from '../types';

const clone = <T>(v: T): T => (v === null || v === undefined ? v : (JSON.parse(JSON.stringify(v)) as T));

export class FakeCloud implements CloudStore {
  saves = new Map<string, RemoteSave>();
  attempts = new Map<string, Map<string, AttemptChunk>>();
  counts = { reads: 0, transactions: 0, writes: 0, attemptWrites: 0, attemptReads: 0 };

  /** Todas as chamadas falham com este código enquanto estiver definido (ex.: 'offline'). */
  down: SyncErrorCode | null = null;
  /** Próxima gravação por transação chega à nuvem, mas o aparelho recebe erro de rede (resposta perdida). */
  dropNextAck = false;
  /** Próxima transação trava até `releaseHeld()`; ao liberar, roda `decide` e tenta gravar. */
  holdNextTransaction = false;
  private held: (() => void)[] = [];
  /** Executa entre a decisão e a gravação — permite outro aparelho gravar no meio (contenção). */
  afterDecide: (() => Promise<void> | void) | null = null;
  /** Falha só as operações de tentativas (serviço de armazenamento parcial). */
  attemptsDown: SyncErrorCode | null = null;

  releaseHeld() {
    const fns = this.held;
    this.held = [];
    for (const f of fns) f();
  }

  private check() {
    if (this.down) throw new SyncError(this.down, `nuvem fora do ar (${this.down})`);
  }

  async read(uid: string): Promise<RemoteSave | null> {
    this.check();
    this.counts.reads++;
    return clone(this.saves.get(uid) ?? null);
  }

  async transact(uid: string, decide: (remote: RemoteSave | null) => RemoteSave | null): Promise<TransactResult> {
    this.check();
    this.counts.transactions++;
    if (this.holdNextTransaction) {
      this.holdNextTransaction = false;
      await new Promise<void>((resolve) => this.held.push(resolve));
    }
    for (let attempt = 0; attempt < 6; attempt++) {
      const seen = clone(this.saves.get(uid) ?? null);
      const next = decide(clone(seen));
      if (this.afterDecide) {
        const hook = this.afterDecide;
        this.afterDecide = null;
        await hook();
      }
      const current = this.saves.get(uid) ?? null;
      if ((current?.rev ?? 0) !== (seen?.rev ?? 0)) continue; // alguém gravou no meio: decide de novo
      if (!next) return { remote: seen, written: null };
      this.enforceRules(uid, current, next);
      this.saves.set(uid, clone(next));
      this.counts.writes++;
      if (this.dropNextAck) {
        this.dropNextAck = false;
        throw new SyncError('offline', 'resposta perdida (a gravação chegou)');
      }
      return { remote: seen, written: clone(next) };
    }
    throw new SyncError('unknown', 'contenção excessiva');
  }

  /** Espelha firestore.rules: o que o servidor recusaria por conta própria. */
  private enforceRules(_uid: string, current: RemoteSave | null, next: RemoteSave) {
    if (next.rev !== (current?.rev ?? 0) + 1) {
      throw new SyncError('permission', `regras: rev ${next.rev} após ${current?.rev ?? 0}`);
    }
    if (next.data.length > MAX_DATA_CHARS) throw new SyncError('permission', 'regras: documento grande demais');
    if (next.ancestry.length > 32) throw new SyncError('permission', 'regras: ancestry grande demais');
  }

  async putAttempts(uid: string, chunk: AttemptChunk): Promise<void> {
    this.check();
    if (this.attemptsDown) throw new SyncError(this.attemptsDown, 'armazenamento de tentativas fora do ar');
    this.counts.attemptWrites++;
    const m = this.attempts.get(uid) ?? new Map<string, AttemptChunk>();
    m.set(chunk.id, clone(chunk));
    this.attempts.set(uid, m);
  }

  async listAttempts(uid: string): Promise<AttemptChunk[]> {
    this.check();
    if (this.attemptsDown) throw new SyncError(this.attemptsDown, 'armazenamento de tentativas fora do ar');
    this.counts.attemptReads++;
    return [...(this.attempts.get(uid)?.values() ?? [])].map(clone).sort((a, b) => a.id.localeCompare(b.id));
  }

  async deleteAttempts(uid: string): Promise<void> {
    this.check();
    this.attempts.delete(uid);
  }

  async deleteAllUserData(uid: string): Promise<void> {
    this.check();
    this.saves.delete(uid);
    this.attempts.delete(uid);
  }

  /** Ids de tentativas guardadas na nuvem para a conta. */
  attemptIds(uid: string): string[] {
    return [...(this.attempts.get(uid)?.values() ?? [])].flatMap((c) => c.attempts.map((a) => a.id)).sort();
  }
}
