/**
 * MIGRAÇÃO ÚNICA DO PROGRESSO LEGADO (ferramenta de desenvolvimento — não vai para o app publicado).
 *
 * Contexto: antes das contas, o progresso vivia só em `questforge.db`. Este módulo copia esse progresso
 * para a conta Google do desenvolvedor, com estas garantias:
 *
 *  1. O banco legado é lido SOMENTE LEITURA e nunca é alterado (nem apagado): é o backup original.
 *  2. A cópia vai para o banco novo da conta (`questforge-<uid>.db`); nunca para o legado.
 *  3. Idempotente: a nuvem recebe o documento com uma impressão digital (`legacyImport.fingerprint`).
 *     Repetir a migração reconhece a mesma impressão digital e não grava nem soma nada.
 *  4. Recusa-se a mesclar com uma conta que já tenha dados (nuvem ou aparelho): nada é sobrescrito.
 *  5. "Concluída" só depois de reler a nuvem e conferir, campo a campo, que ela contém o mesmo
 *     progresso (estado, tentativas) e que o banco novo deste aparelho também o contém.
 *
 * O código aqui é puro (portas injetadas) para ser testado com SQLite real e nuvem simulada.
 */
import type { CloudStore } from '../sync/types';
import type { GameRepository } from '../data/repository/GameRepository';
import type { Attempt, GameState } from '../domain/game/types';
import { GameController } from '../state/controller';
import { SyncEngine, type EngineDeps } from '../sync/engine';
import { findRegressions } from '../sync/merge';
import {
  decodeSyncState,
  encodeSyncState,
  hashText,
  stableStringify,
  statsOf,
  toSyncState,
  type SyncStats,
} from '../sync/snapshot';

export const LEGACY_KEY = 'legacy';

/**
 * Assinatura da ferramenta. `npm run verify:no-legacy` procura esta cadeia (e os textos da tela) no
 * bundle de produção: se aparecer, a ferramenta vazou para o app publicado.
 */
export const LEGACY_TOOL_MARKER = 'QF_LEGACY_MIGRATION_TOOL_V1';

export type LegacyErrorCode =
  | 'fingerprint-changed' // o banco legado mudou depois de uma migração já iniciada
  | 'target-not-empty' // o banco novo desta conta já tem progresso próprio
  | 'cloud-not-empty' // a conta já tem dados na nuvem que não vieram desta migração
  | 'verify-failed'; // a releitura não confere com o original

export class LegacyError extends Error {
  constructor(
    readonly code: LegacyErrorCode,
    message: string,
    readonly checks: Check[] = [],
  ) {
    super(message);
    this.name = 'LegacyError';
  }
}

export interface LegacyData {
  state: GameState;
  attempts: Attempt[];
}

export interface LegacyMarker {
  v: 1;
  tool?: typeof LEGACY_TOOL_MARKER;
  fingerprint: string;
  seededAt: number;
  verifiedAt?: number;
}

export interface Check {
  label: string;
  ok: boolean;
  before: string;
  after: string;
}

export type LegacySummary = SyncStats & { attempts: number; seenQuestions: number };

/** Há progresso real a preservar? */
export function hasProgress(state: GameState): boolean {
  return state.profile.onboarded || state.profile.totals.answered > 0 || Object.keys(state.ledger).length > 0;
}

/** Lê o estado e todas as tentativas do banco legado. null = nada a migrar. */
export async function readLegacy(repo: GameRepository): Promise<LegacyData | null> {
  const state = await repo.load();
  if (!state || !hasProgress(state)) return null;
  return { state, attempts: await allAttempts(repo) };
}

export async function allAttempts(repo: GameRepository): Promise<Attempt[]> {
  const out: Attempt[] = [];
  for (let cursor = 0; ; ) {
    const page = await repo.attemptsAfter(cursor, 1000);
    if (page.length === 0) return out;
    out.push(...page.map((p) => p.attempt));
    cursor = page[page.length - 1].rowid;
  }
}

/** Impressão digital do conteúdo legado: estado de sincronização + conjunto de tentativas + sessão/batalha. */
export function fingerprintOf(data: LegacyData): string {
  const ids = data.attempts.map((a) => a.id).sort();
  const local = stableStringify({ session: data.state.session, battle: data.state.battle });
  return hashText(`${encodeSyncState(toSyncState(data.state))}|${ids.join(',')}|${local}`);
}

export function summarize(data: LegacyData): LegacySummary {
  const sync = toSyncState(data.state);
  return {
    ...statsOf(sync),
    attempts: data.attempts.length,
    seenQuestions: Object.values(data.state.questionStates).filter((q) => q.seen > 0).length,
  };
}

export function parseMarker(raw: string | null): LegacyMarker | null {
  if (!raw) return null;
  try {
    const m = JSON.parse(raw) as LegacyMarker;
    return m && typeof m.fingerprint === 'string' ? m : null;
  } catch {
    return null;
  }
}

export interface MigrationPorts {
  legacy: LegacyData;
  uid: string;
  /** Banco novo desta conta (nunca o legado). */
  target: GameRepository;
  cloud: CloudStore;
  appVersion: string;
  clock?: () => number;
  engine?: Partial<EngineDeps>;
}

export type MigrationStep = 'check' | 'seed' | 'upload' | 'verify';

export interface MigrationResult {
  fingerprint: string;
  rev: number;
  /** A nuvem já continha esta migração (repetição): nada foi gravado. */
  alreadyDone: boolean;
  checks: Check[];
  before: LegacySummary;
  after: LegacySummary;
}

const fmt = (v: unknown) => String(v);

/** Executa (ou retoma) a migração. Qualquer divergência lança `LegacyError`; nada é considerado concluído antes da conferência. */
export async function runMigration(ports: MigrationPorts, onStep: (step: MigrationStep) => void = () => undefined): Promise<MigrationResult> {
  const { legacy, uid, target, cloud } = ports;
  const clock = ports.clock ?? Date.now;
  const fingerprint = fingerprintOf(legacy);

  // 1. Pré-condições: nada de mesclar com dados que não são esta migração.
  onStep('check');
  const marker = parseMarker(await target.getKv(LEGACY_KEY));
  if (marker && marker.fingerprint !== fingerprint) {
    throw new LegacyError('fingerprint-changed', 'O banco antigo mudou depois que a migração começou. Nada foi enviado; fale com o desenvolvedor.');
  }
  if (!marker) {
    const existing = await target.load();
    if (existing && hasProgress(existing)) {
      throw new LegacyError('target-not-empty', 'Esta conta já tem progresso próprio neste aparelho. Para não misturar dados, a migração foi bloqueada.');
    }
  }
  const remote = await cloud.read(uid);
  if (remote && remote.legacyImport?.fingerprint !== fingerprint) {
    throw new LegacyError('cloud-not-empty', 'Esta conta já tem dados na nuvem que não vieram desta migração. Para não misturar dados, a migração foi bloqueada.');
  }
  const alreadyDone = !!remote && !!marker?.verifiedAt;

  // 2. Copia o legado para o banco novo da conta (o legado fica intocado). Retomável: tudo idempotente.
  onStep('seed');
  if (!marker) {
    const seeded: LegacyMarker = { v: 1, tool: LEGACY_TOOL_MARKER, fingerprint, seededAt: clock() };
    await target.replaceAll(legacy.state, { kv: [{ key: LEGACY_KEY, value: JSON.stringify(seeded) }], wipeAttempts: true });
  }
  await target.importAttempts(legacy.attempts); // INSERT OR IGNORE: repetir não duplica

  // 3. Envia. O estado enviado é EXATAMENTE o legado (sem `touch()` do abrir-app, que trocaria quadros e descanso).
  onStep('upload');
  const controller = new GameController({ repo: target, clock, tzOffset: () => legacy.state.profile.tzOffsetMin, onState: () => undefined });
  const seededState = await target.load();
  if (!seededState) throw new LegacyError('verify-failed', 'O banco novo não ficou legível após a cópia.');
  controller.adopt(seededState);
  const engine = new SyncEngine({
    uid,
    controller,
    repo: target,
    cloud,
    clock,
    appVersion: ports.appVersion,
    legacyImport: { fingerprint, at: clock() },
    ...ports.engine,
  });
  await engine.syncNow({ force: true });
  engine.dispose();

  // 4. Conferência: relê a nuvem e o banco novo e compara com o legado, campo a campo.
  onStep('verify');
  const { checks, rev } = await verify(ports, fingerprint);
  const failed = checks.filter((c) => !c.ok);
  if (failed.length > 0) {
    throw new LegacyError('verify-failed', `A conferência encontrou ${failed.length} divergência(s): ${failed.map((c) => c.label).join(', ')}. A migração NÃO foi concluída.`, checks);
  }
  const done: LegacyMarker = { v: 1, tool: LEGACY_TOOL_MARKER, fingerprint, seededAt: marker?.seededAt ?? clock(), verifiedAt: clock() };
  await target.setKv([{ key: LEGACY_KEY, value: JSON.stringify(done) }]);

  const before = summarize(legacy);
  return { fingerprint, rev, alreadyDone, checks, before, after: summarize({ state: (await target.load()) ?? legacy.state, attempts: await allAttempts(target) }) };
}

async function verify(ports: MigrationPorts, fingerprint: string): Promise<{ checks: Check[]; rev: number }> {
  const { legacy, uid, target, cloud } = ports;
  const checks: Check[] = [];
  const add = (label: string, ok: boolean, before: unknown, after: unknown) => checks.push({ label, ok, before: fmt(before), after: fmt(after) });

  const legacySync = toSyncState(legacy.state);
  const remote = await cloud.read(uid);
  if (!remote) {
    add('Salvamento na nuvem existe', false, 'sim', 'não');
    return { checks, rev: 0 };
  }
  add('Salvamento na nuvem existe', true, 'sim', `sim (revisão ${remote.rev})`);
  add('Integridade do documento (hash)', hashText(remote.data) === remote.hash, 'confere', hashText(remote.data) === remote.hash ? 'confere' : 'não confere');
  add('Marcador da migração', remote.legacyImport?.fingerprint === fingerprint, fingerprint, remote.legacyImport?.fingerprint ?? 'ausente');

  const cloudState = decodeSyncState(remote.data);
  const cloudStats = statsOf(cloudState);
  const legacyStats = statsOf(legacySync);
  if (remote.rev === 1) {
    add('Conteúdo da nuvem idêntico ao legado', encodeSyncState(cloudState) === encodeSyncState(legacySync), 'idêntico', encodeSyncState(cloudState) === encodeSyncState(legacySync) ? 'idêntico' : 'diferente');
  } else {
    // A conta já avançou depois da migração (outro aparelho): a nuvem precisa conter TUDO do legado.
    const lost = findRegressions(legacySync, cloudState);
    add('Nuvem contém tudo do legado (e talvez mais)', lost.length === 0, 'nada a menos', lost.length === 0 ? 'nada a menos' : lost.slice(0, 2).join('; '));
  }
  const exact = remote.rev === 1;
  const cmp = (label: string, a: number, b: number) => add(label, exact ? a === b : b >= a, a, b);
  cmp('XP total', legacyStats.xp, cloudStats.xp);
  cmp('Nível', legacyStats.level, cloudStats.level);
  add('Tinta', exact ? legacyStats.ink === cloudStats.ink : true, legacyStats.ink, cloudStats.ink);
  cmp('Missões concluídas', legacyStats.nodes, cloudStats.nodes);
  cmp('Estrelas conquistadas', legacyStats.stars, cloudStats.stars);
  cmp('Chefões vencidos', legacyStats.bosses, cloudStats.bosses);
  cmp('Itens no inventário', legacyStats.items, cloudStats.items);
  cmp('Questões vistas', legacyStats.questions, cloudStats.questions);
  cmp('Recompensas registradas', legacyStats.ledger, cloudStats.ledger);
  cmp('Respostas totais', legacyStats.answered, cloudStats.answered);

  const chunks = await cloud.listAttempts(uid);
  const cloudAttempts = new Map(chunks.flatMap((c) => c.attempts).map((a) => [a.id, a]));
  const missing = legacy.attempts.filter((a) => stableStringify(cloudAttempts.get(a.id)) !== stableStringify(a));
  add('Histórico de respostas na nuvem', missing.length === 0, legacy.attempts.length, `${legacy.attempts.length - missing.length} de ${legacy.attempts.length} idênticas`);

  const local = await target.load();
  const localOk = !!local && encodeSyncState(toSyncState(local)) === encodeSyncState(legacySync);
  add('Banco novo deste aparelho idêntico ao legado', localOk, 'idêntico', localOk ? 'idêntico' : 'diferente');
  const keepsRuns = !!local && stableStringify({ s: local.session, b: local.battle }) === stableStringify({ s: legacy.state.session, b: legacy.state.battle });
  add('Sessão e batalha em andamento preservadas', keepsRuns, legacy.state.session || legacy.state.battle ? 'em andamento' : 'nenhuma', keepsRuns ? 'preservadas' : 'diferentes');
  const localAttempts = await allAttempts(target);
  const localSet = new Set(localAttempts.map((a) => a.id));
  add('Histórico de respostas no banco novo', legacy.attempts.every((a) => localSet.has(a.id)), legacy.attempts.length, localAttempts.length);

  return { checks, rev: remote.rev };
}
