/**
 * Motor de sincronização: local (SQLite) ⇄ nuvem (um documento-snapshot por conta).
 *
 * Modelo
 *  - A nuvem guarda UM documento versionado (`rev`, só avança de 1 em 1; as regras do servidor
 *    recusam qualquer gravação que não seja `rev anterior + 1`). Gravar sobre uma versão que o
 *    aparelho não viu é impossível: a transação falha e o merge de 3 vias roda sobre a versão nova.
 *  - Cada aparelho guarda a BASE (o último estado que sabe estar na nuvem). "Há alterações a
 *    enviar" = estado local ≠ base. Não existe flag de sujeira que possa divergir da realidade.
 *  - Antes de gravar, o envio é registrado como PENDENTE (com um `nonce` que vai dentro do
 *    documento). Se a resposta se perder, o próximo ciclo reconhece pelo `nonce`/`ancestry` que
 *    o envio chegou e usa o estado enviado como base — sem somar os mesmos incrementos duas vezes.
 *  - Reiniciar o progresso incrementa a geração (`epoch`); a maior geração vence sem fusão.
 *  - Tentativas (log append-only) vão à parte, em lotes idempotentes; o snapshot tem prioridade.
 *
 * Tudo que toca o estado do jogo roda dentro de `controller.exclusive`, a mesma fila das respostas:
 * uma resposta nunca é gravada "no meio" de uma sincronização.
 */
import type { GameRepository, KvWrite } from '../data/repository/GameRepository';
import type { GameState } from '../domain/game/types';
import type { GameController } from '../state/controller';
import { diffDelta } from './delta';
import { findRegressions, merge3, type MergeReport } from './merge';
import {
  SNAPSHOT_SCHEMA,
  SnapshotError,
  decodeSyncState,
  encodeSyncState,
  hashText,
  isPristine,
  meaningfulKey,
  pristineSyncState,
  statsOf,
  toSyncState,
  withSyncState,
  type SyncState,
} from './snapshot';
import {
  KV,
  RETRYABLE,
  SyncError,
  type CloudStore,
  type PendingPush,
  type RemoteSave,
  type SyncMeta,
  type SyncNotice,
  type SyncOutcome,
  type SyncStatus,
} from './types';

const ANCESTRY_LIMIT = 32;
const PENDING_LIMIT = 4;
const ATTEMPT_CHUNK_MAX = 400;
/** Tentativas paradas há mais que isto são enviadas mesmo sem completar um lote. */
const ATTEMPT_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const BACKOFF_MS = [5_000, 15_000, 60_000, 5 * 60_000, 15 * 60_000];

export interface Scheduler {
  set(fn: () => void, ms: number): unknown;
  clear(handle: unknown): void;
}

export interface EngineDeps {
  uid: string;
  controller: GameController;
  repo: GameRepository;
  cloud: CloudStore;
  clock?: () => number;
  newId?: (prefix: string) => string;
  appVersion?: string;
  /** Tempo máximo de cada chamada à nuvem. */
  timeoutMs?: number;
  /** Espera depois da última alteração antes de enviar (junta uma sessão inteira num único envio). */
  debounceMs?: number;
  /** Teto de espera sob alterações contínuas. Marcos (fim de sessão, chefão…) pedem envio imediato. */
  maxWaitMs?: number;
  /** Quantas tentativas novas acumulam antes de virarem um lote (sem `force`). */
  attemptBatch?: number;
  scheduler?: Scheduler;
  /** Marca o documento CRIADO por este motor como nascido da migração única do progresso legado. */
  legacyImport?: { fingerprint: string; at: number };
}

const defaultScheduler: Scheduler = {
  set: (fn, ms) => setTimeout(fn, ms),
  clear: (h) => clearTimeout(h as ReturnType<typeof setTimeout>),
};

const defaultId = (prefix: string) => `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;

export function toSyncError(e: unknown): SyncError {
  if (e instanceof SyncError) return e;
  if (e instanceof SnapshotError) {
    // 'too-large' é do estado LOCAL (não cabe no documento); os outros vêm do que está na nuvem.
    return new SyncError(e.code === 'too-new' ? 'needs-update' : e.code === 'too-large' ? 'integrity' : 'corrupt-remote', e.message, e);
  }
  return new SyncError('unknown', e instanceof Error ? e.message : String(e), e);
}

interface Plan {
  /** Documento a gravar (null = não grava). */
  write: RemoteSave | null;
  /** Documento que a nuvem terá depois (o gravado, ou o que já estava lá). null = nuvem vazia. */
  head: RemoteSave | null;
  /** Estado local alvo (head + tudo que o aparelho ainda tem de próprio). */
  merged: SyncState;
  report: MergeReport | null;
  /** A nuvem foi reiniciada em outro aparelho: o local é substituído por ela. */
  adoptReset: boolean;
  /** Este envio é o reinício local chegando à nuvem. */
  resetting: boolean;
  /** A nuvem estava vazia e não havia nada a criar. */
  confirmedEmpty: boolean;
  /** O local era virgem e a nuvem tinha progresso: é uma restauração. */
  restored: boolean;
}

export class SyncEngine {
  private readonly clock: () => number;
  private readonly newId: (prefix: string) => string;
  private readonly scheduler: Scheduler;
  private readonly timeoutMs: number;
  private readonly debounceMs: number;
  private readonly maxWaitMs: number;
  private readonly attemptBatch: number;

  private status: SyncStatus = { phase: 'idle', error: null, lastSyncedAt: null, pendingChanges: false, notice: null };
  private readonly listeners = new Set<(s: SyncStatus) => void>();
  private inFlight: Promise<SyncOutcome> | null = null;
  private again = false;
  private forceAttempts = false;
  private timer: unknown = null;
  private firstRequestAt: number | null = null;
  private failures = 0;
  private disposed = false;
  private metaCache: SyncMeta | null = null;
  /** Aberto enquanto um reinício de progresso roda: nenhuma sincronização começa. */
  private gate: Promise<void> | null = null;

  constructor(private readonly deps: EngineDeps) {
    this.clock = deps.clock ?? Date.now;
    this.newId = deps.newId ?? defaultId;
    this.scheduler = deps.scheduler ?? defaultScheduler;
    this.timeoutMs = deps.timeoutMs ?? 20_000;
    this.debounceMs = deps.debounceMs ?? 90_000;
    this.maxWaitMs = deps.maxWaitMs ?? 5 * 60_000;
    this.attemptBatch = deps.attemptBatch ?? 40;
  }

  // ——————————————————————————————————————————————— estado observável

  getStatus(): SyncStatus {
    return this.status;
  }

  subscribe(fn: (s: SyncStatus) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private setStatus(patch: Partial<SyncStatus>) {
    this.status = { ...this.status, ...patch };
    for (const l of this.listeners) l(this.status);
  }

  dispose() {
    this.disposed = true;
    if (this.timer !== null) this.scheduler.clear(this.timer);
    this.timer = null;
    this.listeners.clear();
  }

  // ——————————————————————————————————————————————— metadados

  async meta(): Promise<SyncMeta> {
    if (this.metaCache) return this.metaCache;
    const raw = await this.deps.repo.getKv(KV.meta);
    if (raw) {
      const meta = JSON.parse(raw) as SyncMeta;
      if (meta.uid !== this.deps.uid) {
        throw new SyncError('wrong-account', 'O banco local pertence a outra conta.');
      }
      this.metaCache = meta;
    } else {
      const fresh: SyncMeta = {
        v: 1,
        uid: this.deps.uid,
        deviceId: this.newId('dev'),
        baseRev: null,
        epoch: 0,
        resetPending: false,
        attemptsCursor: 0,
        lastSyncedAt: null,
        notice: null,
      };
      await this.deps.repo.setKv([{ key: KV.meta, value: JSON.stringify(fresh) }]);
      this.metaCache = fresh;
    }
    this.setStatus({ lastSyncedAt: this.metaCache.lastSyncedAt, notice: this.metaCache.notice });
    return this.metaCache;
  }

  private metaWrite(meta: SyncMeta): KvWrite {
    this.metaCache = meta;
    return { key: KV.meta, value: JSON.stringify(meta) };
  }

  /** Carrega metadados e calcula se há alterações locais ainda não confirmadas (chamar após o controlador iniciar). */
  async refreshStatus(): Promise<SyncStatus> {
    const dirty = await this.isDirty();
    this.setStatus({ pendingChanges: dirty });
    return this.status;
  }

  async isDirty(): Promise<boolean> {
    const meta = await this.meta();
    const game = this.deps.controller.current;
    if (!game) return false;
    const L0 = toSyncState(game);
    const baseStr = await this.deps.repo.getKv(KV.base);
    const pendings = await this.loadPendings();
    if (meta.resetPending || pendings.length > 0) return true;
    if (meta.baseRev === null) return !isPristine(L0);
    if (!baseStr) return true;
    return meaningfulKey(L0) !== meaningfulKey(decodeSyncState(baseStr));
  }

  private async loadPendings(): Promise<PendingPush[]> {
    const raw = await this.deps.repo.getKv(KV.pending);
    if (!raw) return [];
    try {
      const list = JSON.parse(raw) as PendingPush[];
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  }

  async dismissNotice(): Promise<void> {
    const meta = await this.meta();
    if (!meta.notice) return;
    await this.deps.repo.setKv([this.metaWrite({ ...meta, notice: null })]);
    this.setStatus({ notice: null });
  }

  // ——————————————————————————————————————————————— agendamento

  /** Pede uma sincronização em segundo plano (com atraso para juntar alterações em lote). */
  requestSync(reason: 'change' | 'foreground' | 'now' = 'change') {
    if (this.disposed) return;
    const now = this.clock();
    if (reason === 'change') this.setStatus({ pendingChanges: true });
    if (this.firstRequestAt === null) this.firstRequestAt = now;
    const wait = reason === 'change' ? Math.min(this.debounceMs, Math.max(0, this.firstRequestAt + this.maxWaitMs - now)) : 0;
    this.schedule(wait);
  }

  private schedule(ms: number) {
    if (this.timer !== null) this.scheduler.clear(this.timer);
    this.timer = this.scheduler.set(() => {
      this.timer = null;
      this.firstRequestAt = null;
      this.syncNow().catch(() => undefined); // o erro já foi registrado no status e reagendado
    }, ms);
  }

  /** Sincroniza agora (uma por vez). `force` também envia as tentativas acumuladas. */
  syncNow(opts: { force?: boolean } = {}): Promise<SyncOutcome> {
    if (this.gate) return this.gate.then(() => this.syncNow(opts));
    if (opts.force) this.forceAttempts = true;
    if (this.inFlight) {
      this.again = true;
      return this.inFlight;
    }
    this.inFlight = this.runLoop().finally(() => {
      this.inFlight = null;
    });
    return this.inFlight;
  }

  /** Tenta enviar tudo antes de sair da conta/fechar; devolve false se não deu tempo. */
  async flush(timeoutMs = 10_000): Promise<boolean> {
    let timer: unknown;
    const timeout = new Promise<'timeout'>((resolve) => {
      timer = this.scheduler.set(() => resolve('timeout'), timeoutMs);
    });
    try {
      const r = await Promise.race([this.syncNow({ force: true }).then(() => 'ok' as const), timeout]);
      return r === 'ok';
    } catch {
      return false;
    } finally {
      this.scheduler.clear(timer);
    }
  }

  private async runLoop(): Promise<SyncOutcome> {
    this.setStatus({ phase: 'syncing' });
    try {
      let outcome: SyncOutcome;
      do {
        this.again = false;
        outcome = await this.syncOnce();
        const force = this.forceAttempts;
        this.forceAttempts = false;
        await this.flushAttempts(force);
        await this.finishPendingHousekeeping();
      } while (this.again);
      this.failures = 0;
      const meta = await this.meta();
      this.setStatus({ phase: 'idle', error: null, errorDetail: null, lastSyncedAt: meta.lastSyncedAt, pendingChanges: await this.isDirty(), notice: meta.notice });
      return outcome;
    } catch (e) {
      const err = toSyncError(e);
      this.failures++;
      const retryable = RETRYABLE.has(err.code);
      this.setStatus({
        phase: !retryable ? 'blocked' : err.code === 'offline' || err.code === 'timeout' ? 'offline' : 'error',
        error: err.code,
        errorDetail: err.message.slice(0, 300),
        // Se não der para saber, assume que há o que enviar (o aviso certo é o mais cauteloso).
        pendingChanges: await this.isDirty().catch(() => true),
      });
      if (retryable && !this.disposed) this.schedule(err.code === 'quota' ? BACKOFF_MS[BACKOFF_MS.length - 1] : BACKOFF_MS[Math.min(this.failures - 1, BACKOFF_MS.length - 1)]);
      throw err;
    }
  }

  // ——————————————————————————————————————————————— rede com prazo

  private async net<T>(op: Promise<T>, onTimeout?: () => void): Promise<T> {
    let timer: unknown;
    const timeout = new Promise<never>((_, reject) => {
      timer = this.scheduler.set(() => {
        onTimeout?.();
        reject(new SyncError('timeout', 'A nuvem não respondeu a tempo.'));
      }, this.timeoutMs);
    });
    try {
      return await Promise.race([op, timeout]);
    } catch (e) {
      throw toSyncError(e);
    } finally {
      this.scheduler.clear(timer);
    }
  }

  // ——————————————————————————————————————————————— um ciclo

  private async syncOnce(): Promise<SyncOutcome> {
    const { uid, repo, cloud, controller } = this.deps;
    const meta0 = await this.meta();
    const L0 = await controller.exclusive(async () => {
      if (!controller.current) throw new SyncError('unknown', 'Jogo ainda não carregado.');
      return toSyncState(controller.current);
    });
    const baseStr = await repo.getKv(KV.base);
    const pendings = await this.loadPendings();
    const base = this.baseFor(meta0, baseStr, L0);
    const needsPush = meta0.resetPending || pendings.length > 0 || meaningfulKey(L0) !== meaningfulKey(base);

    // Nada local a enviar: só olha se a nuvem avançou (uma leitura simples).
    if (!needsPush && meta0.baseRev !== null) {
      const remote = await this.net(cloud.read(uid));
      if (remote && remote.rev === meta0.baseRev) {
        await repo.setKv([this.metaWrite({ ...meta0, lastSyncedAt: this.clock() })]);
        return { kind: 'up-to-date' };
      }
      const plan = this.plan({ meta: meta0, L0, base, pendings, remote, nonce: this.newId('n') });
      if (!plan.write) return this.apply(plan, L0, meta0);
    }

    // Há o que enviar (ou a nuvem avançou e o merge precisa gravar): registra o envio como pendente
    // ANTES de falar com a rede — se a resposta se perder, o próximo ciclo sabe reconhecer o envio.
    const nonce = this.newId('n');
    const mine: PendingPush = { nonce, snapshot: encodeSyncState(L0) };
    await repo.setKv([{ key: KV.pending, value: JSON.stringify([...pendings, mine].slice(-PENDING_LIMIT)) }]);

    const attempt = { cancelled: false };
    const holder: { plan: Plan | null } = { plan: null };
    const result = await this.net(
      cloud.transact(uid, (remote) => {
        // Um envio abandonado por prazo não pode gravar depois (a nova tentativa já tem outra base).
        if (attempt.cancelled) return null;
        holder.plan = this.plan({ meta: meta0, L0, base, pendings: [...pendings, mine], remote, nonce });
        return holder.plan.write;
      }),
      () => {
        attempt.cancelled = true;
      },
    );
    const plan = holder.plan;
    if (!plan) throw new SyncError('unknown', 'Transação sem decisão.');
    if (plan.write && !result.written) throw new SyncError('unknown', 'A nuvem não confirmou a gravação.');
    return this.apply(plan, L0, meta0);
  }

  /** Base do merge: a salva; ou, para quem nunca sincronizou, o estado virgem. */
  private baseFor(meta: SyncMeta, baseStr: string | null, L0: SyncState): SyncState {
    if (baseStr) {
      try {
        return decodeSyncState(baseStr, this.clock());
      } catch (e) {
        throw new SyncError('integrity', 'A base de sincronização local está ilegível.', e);
      }
    }
    if (meta.baseRev === null || meta.baseRev === 0) {
      return isPristine(L0) ? L0 : pristineSyncState(L0.profile.createdAt);
    }
    throw new SyncError('integrity', 'A base de sincronização local desapareceu.');
  }

  /** Decisão pura: dado o que a nuvem tem agora, o que gravar e qual deve ser o estado local. */
  private plan(i: {
    meta: SyncMeta;
    L0: SyncState;
    base: SyncState;
    pendings: PendingPush[];
    remote: RemoteSave | null;
    nonce: string;
  }): Plan {
    const { meta, L0, base, pendings, remote, nonce } = i;
    const none = { report: null, adoptReset: false, resetting: false, confirmedEmpty: false, restored: false };

    if (!remote) {
      if (meta.baseRev !== null && meta.baseRev > 0) {
        throw new SyncError('remote-missing', 'O salvamento na nuvem não foi encontrado. Nada foi sobrescrito.');
      }
      if (isPristine(L0) && !meta.resetPending) {
        return { ...none, write: null, head: null, merged: L0, confirmedEmpty: true };
      }
      const created = this.build(1, meta, L0, null, nonce);
      return { ...none, write: created, head: created, merged: L0, resetting: meta.resetPending };
    }

    if (remote.schema > SNAPSHOT_SCHEMA) {
      throw new SyncError('needs-update', 'A nuvem tem dados de uma versão mais nova do QuestForge. Atualize o app.');
    }
    if (hashText(remote.data) !== remote.hash) {
      throw new SyncError('corrupt-remote', 'O salvamento na nuvem não passou na verificação de integridade.');
    }
    const remoteState = decodeSyncState(remote.data, this.clock()); // lança SnapshotError ('corrupt'/'too-new')

    // No primeiro contato a geração da nuvem é simplesmente adotada: não é um "reinício" vindo de fora.
    const localEpoch = meta.baseRev === null ? remote.epoch : meta.epoch;
    if (remote.epoch > localEpoch) {
      return { ...none, write: null, head: remote, merged: remoteState, adoptReset: true };
    }

    const resetting = meta.resetPending && remote.epoch < localEpoch;
    let b = base;
    for (const p of [...pendings].reverse()) {
      if (p.nonce === remote.nonce || remote.ancestry.includes(p.nonce)) {
        b = decodeSyncState(p.snapshot, this.clock()); // o envio chegou: ele é a base
        break;
      }
    }
    const wasPristine = meta.baseRev === null && isPristine(L0);

    let merged: SyncState;
    let report: MergeReport | null = null;
    if (resetting) {
      merged = L0; // o reinício deliberado vence o que a nuvem tinha
    } else {
      const r = merge3(b, L0, remoteState);
      merged = r.merged;
      report = r.report;
      const allowedXpLoss = r.report.duplicateGrants.reduce((sum, d) => sum + Math.max(0, d.xp), 0);
      const problems = findRegressions(remoteState, merged, allowedXpLoss);
      if (problems.length > 0) {
        throw new SyncError('integrity', `Envio barrado: faria o progresso regredir (${problems.slice(0, 3).join('; ')}).`);
      }
    }
    const needWrite = resetting || meaningfulKey(merged) !== meaningfulKey(remoteState);
    const write = needWrite ? this.build(remote.rev + 1, { ...meta, epoch: Math.max(meta.epoch, localEpoch) }, merged, remote, nonce) : null;
    return {
      write,
      head: write ?? remote,
      merged,
      report,
      adoptReset: false,
      resetting,
      confirmedEmpty: false,
      restored: wasPristine && !needWrite && !isPristine(remoteState),
    };
  }

  private build(rev: number, meta: SyncMeta, state: SyncState, prev: RemoteSave | null, nonce: string): RemoteSave {
    const data = encodeSyncState(state);
    return {
      schema: SNAPSHOT_SCHEMA,
      rev,
      epoch: meta.epoch,
      nonce,
      ancestry: prev ? [...prev.ancestry, prev.nonce].slice(-ANCESTRY_LIMIT) : [],
      deviceId: meta.deviceId,
      updatedAt: this.clock(),
      appVersion: this.deps.appVersion ?? 'dev',
      data,
      hash: hashText(data),
      stats: statsOf(state),
      ...(rev === 1 && this.deps.legacyImport ? { legacyImport: this.deps.legacyImport } : {}),
    };
  }

  /** Aplica o resultado localmente (estado + base + metadados na mesma transação SQLite). */
  private async apply(plan: Plan, L0: SyncState, meta: SyncMeta): Promise<SyncOutcome> {
    const { repo, controller } = this.deps;
    const now = this.clock();
    let outcome: SyncOutcome = { kind: 'up-to-date' };

    await controller.exclusive(async () => {
      const cur = controller.current!;
      const curSync = toSyncState(cur);
      const headRev = plan.head ? plan.head.rev : 0;
      const baseValue = plan.head ? plan.head.data : encodeSyncState(L0);

      let notice: SyncNotice | null = meta.notice;
      if (plan.report?.diverged) {
        notice = {
          kind: 'merged',
          at: now,
          duplicateGrants: plan.report.duplicateGrants.length,
          inkForgiven: plan.report.inkForgiven,
          settledQuests: plan.report.settledQuests.length,
        };
      }
      if (plan.restored) notice = { kind: 'restored', at: now, stats: statsOf(plan.merged) };
      if (plan.adoptReset) notice = { kind: 'reset-adopted', at: now };

      // O que o aparelho acumulou DURANTE a sincronização é somado ao resultado, não perdido.
      const target = plan.adoptReset || meaningfulKey(curSync) === meaningfulKey(L0) ? plan.merged : merge3(L0, curSync, plan.merged).merged;
      const next: GameState = withSyncState(cur, target);

      const nextMeta: SyncMeta = {
        ...meta,
        baseRev: headRev,
        epoch: plan.head ? Math.max(meta.epoch, plan.head.epoch) : meta.epoch,
        resetPending: plan.resetting ? false : plan.adoptReset ? false : meta.resetPending,
        attemptsCursor: plan.adoptReset ? 0 : meta.attemptsCursor,
        lastSyncedAt: now,
        notice,
        ...(plan.restored ? { restoreAttempts: true } : {}),
        ...(plan.resetting ? { wipeCloudAttempts: true } : {}),
      };
      const kv: KvWrite[] = [
        { key: KV.base, value: baseValue },
        { key: KV.pending, value: null },
        this.metaWrite(nextMeta),
      ];

      if (plan.adoptReset) {
        const hadWork = !isPristine(curSync) && meaningfulKey(curSync) !== meaningfulKey(plan.merged);
        kv.push({ key: KV.discarded, value: hadWork ? encodeSyncState(curSync) : null });
        await repo.replaceAll(next, { kv, wipeAttempts: true });
        if (!this.disposed) controller.adopt(next);
        outcome = { kind: 'reset-adopted', rev: headRev };
        return;
      }

      const delta = diffDelta(cur, next);
      await repo.commit(next, delta, kv);
      const changed = delta.profile || delta.quests || delta.questionStates.length || delta.ledger.length || delta.inventory.length || delta.campaign.length || delta.bosses.length;
      if (changed && !this.disposed) controller.adopt(next); // depois de encerrada, só o banco é atualizado

      outcome = plan.confirmedEmpty
        ? { kind: 'confirmed-empty' }
        : plan.write
          ? plan.write.rev === 1
            ? { kind: 'created', rev: 1 }
            : plan.report?.diverged
              ? { kind: 'merged', rev: plan.write.rev }
              : { kind: 'pushed', rev: plan.write.rev }
          : plan.head && plan.head.rev !== meta.baseRev
            ? { kind: 'pulled', rev: plan.head.rev }
            : { kind: 'up-to-date' };
    });
    return outcome;
  }

  // ——————————————————————————————————————————————— tentativas (log append-only)

  private async flushAttempts(force: boolean): Promise<void> {
    const { uid, repo, cloud } = this.deps;
    let meta = await this.meta();
    if (meta.baseRev === null) return; // sem contato com a nuvem ainda
    for (;;) {
      const rows = await repo.attemptsAfter(meta.attemptsCursor, ATTEMPT_CHUNK_MAX);
      if (rows.length === 0) return;
      // O estado derivado (XP, missões, revisões…) já viaja no snapshot a cada ciclo; o log bruto pode
      // esperar um lote cheio — ou 24 h — em vez de gerar uma gravação minúscula por ida ao segundo plano.
      const stale = this.clock() - rows[0].attempt.createdAt >= ATTEMPT_MAX_AGE_MS;
      if (!force && rows.length < this.attemptBatch && !stale) return;
      const from = rows[0].rowid;
      const to = rows[rows.length - 1].rowid;
      await this.net(cloud.putAttempts(uid, { id: `${meta.deviceId}-${String(from).padStart(10, '0')}`, deviceId: meta.deviceId, from, to, attempts: rows.map((r) => r.attempt) }));
      meta = { ...meta, attemptsCursor: to };
      await repo.setKv([this.metaWrite(meta)]);
      if (rows.length < ATTEMPT_CHUNK_MAX) return;
    }
  }

  /** Tarefas que dependem de um envio já confirmado: restaurar histórico e limpar o antigo após reinício. */
  private async finishPendingHousekeeping(): Promise<void> {
    const { uid, repo, cloud } = this.deps;
    let meta = await this.meta();
    if (meta.wipeCloudAttempts) {
      await this.net(cloud.deleteAttempts(uid));
      meta = { ...meta, wipeCloudAttempts: undefined };
      await repo.setKv([this.metaWrite(meta)]);
    }
    if (meta.restoreAttempts) {
      const chunks = await this.net(cloud.listAttempts(uid));
      const cursor = await repo.importAttempts(chunks.flatMap((c) => c.attempts));
      meta = { ...meta, restoreAttempts: undefined, attemptsCursor: cursor };
      await repo.setKv([this.metaWrite(meta)]);
    }
  }

  // ——————————————————————————————————————————————— reinício do progresso

  /**
   * Apaga o progresso deste aparelho E da conta: nova geração (`epoch`). Espera o ciclo em andamento
   * terminar e impede novos enquanto reinicia, para que o resultado de um ciclo antigo não ressuscite
   * o progresso apagado. Sem internet, o reinício fica marcado de forma durável e chega à nuvem depois.
   */
  async resetProgress(): Promise<void> {
    let open!: () => void;
    this.gate = new Promise<void>((resolve) => {
      open = resolve;
    });
    try {
      if (this.timer !== null) this.scheduler.clear(this.timer);
      this.timer = null;
      await this.inFlight?.catch(() => undefined);
      await this.deps.controller.reset();
      const meta = await this.meta();
      const state = this.deps.controller.current;
      const kv: KvWrite[] = [
        this.metaWrite({ ...meta, epoch: meta.epoch + 1, resetPending: true, attemptsCursor: 0 }),
        { key: KV.pending, value: null },
      ];
      if (state) kv.push({ key: KV.base, value: encodeSyncState(toSyncState(state)) });
      await this.deps.repo.setKv(kv);
      this.setStatus({ pendingChanges: true });
    } finally {
      this.gate = null;
      open();
    }
    this.requestSync('now');
  }
}
