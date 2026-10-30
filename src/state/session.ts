/**
 * Sessão do aplicativo: conta Google → banco local DA CONTA → progresso (local + nuvem) → jogo.
 *
 *  1. restaura a sessão salva (sem rede); sem conta ⇒ tela de login;
 *  2. abre o banco desta conta (`questforge-<uid>.db`) e carrega o jogo;
 *  3. conta nova NESTE aparelho (nunca falou com a nuvem) ⇒ "restaurando": busca o progresso antes
 *     de liberar o jogo — jogar antes disso criaria um perfil em branco concorrendo com o da nuvem;
 *  4. daí em diante o jogo roda local e rápido; o motor de sincronização envia em lote, em segundo plano.
 *
 * Sair da conta NÃO apaga nada: o banco da conta fica no aparelho (com o que ainda não foi enviado).
 */
import Constants from 'expo-constants';
import { AppState, type NativeEventSubscription } from 'react-native';
import { AUTH_MESSAGES, AuthError, type AuthUser } from '../auth/types';
import { getQuestion } from '../content/bank';
import { getItem } from '../content/items';
import type { AltKey } from '../content/types';
import type { GameRepository } from '../data/repository/GameRepository';
import { alternativeOrder, displayLetter } from '../domain/learning/alternatives';
import { createPlatform } from '../platform';
import type { Platform } from '../platform/types';
import { buildExport } from '../sync/export';
import { SyncEngine, toSyncError } from '../sync/engine';
import { RESTORE_ERROR_MESSAGES, SYNC_ERROR_MESSAGES, noticeText } from '../sync/messages';
import type { SyncNotice, SyncStatus } from '../sync/types';
import { GameController } from './controller';
import { saveTextFile, shareFile } from './share';
import { publish, useGameStore } from './store';

interface LegacyModule {
  /** Este login precisa passar pela migração única antes de abrir a conta? */
  needsMigration(platform: Platform, user: AuthUser): Promise<boolean>;
}

/** Só existe em builds de desenvolvimento (EXPO_PUBLIC_LEGACY_MIGRATION=1); no bundle de produção o `require` é removido. */
function legacyModule(): LegacyModule | null {
  if (process.env.EXPO_PUBLIC_LEGACY_MIGRATION === '1') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- require condicional: o Metro remove este ramo (e o módulo) do bundle de produção
    return require('../legacy/gate') as LegacyModule;
  }
  return null;
}

const FOREGROUND_PULL_MS = 5 * 60_000;
const appVersion = Constants.expoConfig?.version ?? 'dev';

let platform: Platform | null = null;
let controller: GameController | null = null;
let engine: SyncEngine | null = null;
let account: AuthUser | null = null;
let repo: GameRepository | null = null;
let cleanups: (() => void)[] = [];
let lastForegroundPull = 0;

export function getPlatform(): Platform {
  return (platform ??= createPlatform());
}

export function getController(): GameController | null {
  return controller;
}

export function requireController(): GameController {
  if (!controller) throw new Error('Jogo não inicializado');
  return controller;
}

export function getSyncEngine(): SyncEngine | null {
  return engine;
}

export function getAccount(): AuthUser | null {
  return account;
}

const set = useGameStore.setState;

// ——————————————————————————————————————————————— abrir e fechar a conta

function closeAccount() {
  for (const fn of cleanups) fn();
  cleanups = [];
  engine?.dispose();
  engine = null;
  controller?.close(); // um ciclo atrasado não pode publicar o jogo desta conta depois da saída
  controller = null;
  repo = null;
}

async function openAccount(user: AuthUser): Promise<void> {
  closeAccount();
  const p = getPlatform();

  const legacy = legacyModule();
  if (legacy && (await legacy.needsMigration(p, user))) {
    account = user;
    set({ user, status: 'legacy', authBusy: false, authError: null });
    return;
  }

  const r = await p.openRepository(user.uid);
  const cloud = p.cloud();
  let eng: SyncEngine | null = null;
  const ctl = new GameController({ repo: r, onState: publish, onChange: () => eng?.requestSync('change') });
  if (cloud) eng = new SyncEngine({ uid: user.uid, controller: ctl, repo: r, cloud, appVersion });
  repo = r;
  controller = ctl;
  engine = eng;
  account = user;
  set({ user, cloudEnabled: !!cloud, authError: null });

  await ctl.init();
  if (eng && (await eng.meta()).baseRev === null) {
    set({ status: 'restoring', restoreError: null });
    await restoreFromCloud();
    return;
  }
  finishOpen();
}

/** Primeiro contato com a nuvem para esta conta neste aparelho. */
async function restoreFromCloud(): Promise<void> {
  if (!engine) return;
  try {
    await engine.syncNow({ force: true });
  } catch (e) {
    const err = toSyncError(e);
    set({ status: 'restoring', restoreError: RESTORE_ERROR_MESSAGES[err.code] ?? SYNC_ERROR_MESSAGES[err.code] });
    return;
  }
  finishOpen();
}

function finishOpen() {
  const eng = engine;
  if (eng) {
    const onStatus = (s: SyncStatus) => {
      set({ sync: s });
      surfaceNotice(eng, s);
    };
    cleanups.push(eng.subscribe(onStatus));
    onStatus(eng.getStatus());
    void eng.refreshStatus();
    cleanups.push(watchAppState(eng));
    lastForegroundPull = Date.now();
    eng.syncNow().catch(() => undefined); // atualização em segundo plano; erros ficam no status
  }
  set({ status: 'ready', error: null, restoreError: null, authBusy: false });
}

/** Avisos da nuvem (restauração, fusão, reinício) viram um aviso curto no topo e já saem da pendência. */
const shownNotices = new Set<string>();
const NOTICE_TITLES: Record<SyncNotice['kind'], string> = {
  restored: 'Progresso restaurado da nuvem',
  merged: 'Progresso de dois aparelhos combinado',
  'reset-adopted': 'Progresso reiniciado em outro aparelho',
};
function surfaceNotice(eng: SyncEngine, s: SyncStatus) {
  const n = s.notice;
  if (!n) return;
  const key = `${n.kind}:${n.at}`;
  if (shownNotices.has(key)) return;
  shownNotices.add(key);
  const detail =
    n.kind === 'restored'
      ? `Nível ${n.stats.level}, ${n.stats.xp} XP, ${n.stats.nodes} missão(ões) concluída(s).`
      : noticeText(n);
  useGameStore.setState((st) => ({
    toasts: [...st.toasts, { id: `sync${key}`, tone: 'news', title: NOTICE_TITLES[n.kind], detail, ms: 6000 }],
  }));
  void eng.dismissNotice();
}

function watchAppState(eng: SyncEngine): () => void {
  const sub: NativeEventSubscription = AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      if (Date.now() - lastForegroundPull > FOREGROUND_PULL_MS) {
        lastForegroundPull = Date.now();
        eng.requestSync('foreground');
      }
    } else if (state === 'background') {
      eng.syncNow().catch(() => undefined); // melhor esforço: o sistema pode pausar o app a qualquer momento
    }
  });
  return () => sub.remove();
}

function resetUi() {
  set({
    status: 'signed-out',
    user: null,
    game: null,
    sync: null,
    restoreError: null,
    celebrations: [],
    toasts: [],
    reveals: [],
    lastSummary: null,
    restedNotice: null,
  });
}

// ——————————————————————————————————————————————— API usada pelas telas

export async function boot(): Promise<void> {
  if (process.env.EXPO_PUBLIC_QA === '1') {
    // Gancho de QA para testes ponta a ponta no navegador (nunca ativo em builds normais).
    // `shown` traduz a letra canônica para a letra exibida (as alternativas são embaralhadas).
    (globalThis as unknown as { __qf: unknown }).__qf = {
      store: useGameStore,
      getQuestion,
      getItem,
      shown: (questionId: string, attemptKey: string, key: AltKey) => displayLetter(alternativeOrder(getQuestion(questionId), attemptKey), key),
    };
  }
  set({ status: 'loading', error: null });
  try {
    const user = await getPlatform().auth.restore();
    if (!user) {
      resetUi();
      return;
    }
    await openAccount(user);
    cleanups.push(getPlatform().auth.onSessionLost(handleSessionLost));
  } catch (e) {
    set({ status: 'error', error: e instanceof Error ? e.message : String(e) });
  }
}

function handleSessionLost() {
  closeAccount();
  resetUi();
  set({ authError: AUTH_MESSAGES.unauthenticated });
}

export async function signIn(): Promise<void> {
  set({ authBusy: true, authError: null });
  try {
    const user = await getPlatform().auth.signInWithGoogle();
    await openAccount(user);
    cleanups.push(getPlatform().auth.onSessionLost(handleSessionLost));
  } catch (e) {
    const err = e instanceof AuthError ? e : null;
    // Cancelar não é erro: só volta ao botão.
    set({
      authBusy: false,
      status: useGameStore.getState().status === 'loading' ? 'signed-out' : useGameStore.getState().status,
      authError: err ? (err.code === 'cancelled' ? null : err.message) : e instanceof Error ? e.message : AUTH_MESSAGES.unknown,
    });
  }
}

/** Tenta de novo a busca inicial do progresso (tela "restaurando"). */
export async function retryRestore(): Promise<void> {
  set({ restoreError: null });
  if (engine) await restoreFromCloud();
  else await boot();
}

/** Sai da conta. O progresso (inclusive o ainda não enviado) fica guardado neste aparelho. */
export async function signOut(): Promise<void> {
  try {
    await engine?.flush(8000); // melhor esforço: se não der, continua guardado no banco da conta
  } finally {
    closeAccount();
    account = null;
    try {
      await getPlatform().auth.signOut();
    } catch (e) {
      set({ authError: e instanceof AuthError ? e.message : AUTH_MESSAGES.unknown });
    }
    resetUi();
  }
}

/** Sincroniza já e devolve uma frase em português dizendo o que aconteceu (ou lança o erro). */
export async function syncNow(): Promise<string> {
  if (!engine) return 'A nuvem não está disponível neste ambiente.';
  const outcome = await engine.syncNow({ force: true });
  switch (outcome.kind) {
    case 'pushed':
    case 'created':
    case 'merged':
      return 'Progresso enviado à nuvem.';
    case 'pulled':
      return 'Progresso mais novo baixado da nuvem.';
    case 'reset-adopted':
      return 'Este aparelho acompanhou o reinício feito em outro aparelho.';
    default:
      return 'Tudo já estava na nuvem.';
  }
}

export function dismissSyncNotice() {
  void engine?.dismissNotice();
}

/**
 * Exclui a conta: confirma a identidade com o Google, apaga os dados da nuvem, a conta de
 * autenticação e o banco local. Falhar em confirmar a identidade não apaga nada.
 */
export async function deleteAccount(): Promise<void> {
  const user = account;
  if (!user) return;
  const p = getPlatform();
  await p.auth.reauthenticate(); // se falhar, nada foi alterado

  // Daqui em diante a conta está sendo desmontada: desliga o motor e os ouvintes (excluir o usuário do
  // Firebase dispara "sessão perdida", que não pode ser confundido com expiração).
  for (const fn of cleanups) fn();
  cleanups = [];
  engine?.dispose();
  try {
    const cloud = p.cloud();
    if (cloud) await cloud.deleteAllUserData(user.uid);
    await p.auth.deleteAccount();
  } catch (e) {
    // Falhou no meio: o que ficou no aparelho continua íntegro. Reabre a conta para o app seguir
    // utilizável; repetir a exclusão conclui o que faltou.
    await openAccount(user).catch(() => undefined);
    throw e;
  }
  closeAccount();
  account = null;
  await p.deleteLocalData(user.uid);
  resetUi();
}

/** Apaga o progresso da conta (neste aparelho e na nuvem). */
export async function resetProgress(): Promise<void> {
  if (engine) await engine.resetProgress();
  else await requireController().reset();
  set({ celebrations: [], toasts: [], reveals: [], lastSummary: null, restedNotice: null });
}

/** Exporta tudo o que o app guarda desta conta (JSON) e abre o menu de compartilhar. */
export async function exportMyData(): Promise<{ shared: boolean; uri: string }> {
  const ctl = requireController();
  const r = repo;
  if (!r) throw new Error('Banco local indisponível');
  const attempts = [];
  for (let cursor = 0; ; ) {
    const page = await r.attemptsAfter(cursor, 1000);
    if (page.length === 0) break;
    attempts.push(...page.map((x) => x.attempt));
    cursor = page[page.length - 1].rowid;
  }
  const { text } = buildExport({
    state: ctl.current!,
    attempts,
    account: account ? { uid: account.uid, email: account.email } : null,
    appVersion,
    now: Date.now(),
  });
  const saved = await saveTextFile(`questforge-meus-dados-${new Date().toISOString().slice(0, 10)}.json`, text);
  const shared = await shareFile(saved.uri, 'Exportar meus dados do QuestForge');
  return { shared, uri: saved.uri };
}

/** Chamado pela migração única quando ela termina: abre a conta normalmente. */
export async function completeLegacyMigration(): Promise<void> {
  if (!account) return;
  set({ status: 'loading' });
  const user = account;
  await openAccount(user);
}

