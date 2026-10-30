import { QUESTIONS, getQuestion } from '../../content/bank';
import { AuthError, type AuthService, type AuthUser } from '../../auth/types';
import type { GameRepository } from '../../data/repository/GameRepository';
import { MemoryGameRepository } from '../../data/repository/MemoryGameRepository';
import { currentQuestionId } from '../../domain/game/game';
import type { Platform } from '../../platform/types';
import { parseExport } from '../../sync/export';
import { decodeSyncState } from '../../sync/snapshot';
import { makeDevice } from '../../sync/testing/device';
import { FakeCloud } from '../../sync/testing/fakeCloud';
import * as actions from '../actions';
import * as session from '../session';
import { useGameStore } from '../store';

const mockHolder: { platform: Platform | null } = { platform: null };
// A sessão guarda a plataforma em cache: o proxy estável delega, a cada chamada, ao "aparelho" do teste atual.
jest.mock('../../platform', () => {
  const p = () => mockHolder.platform!;
  return {
    createPlatform: () => ({
      get preview() {
        return p().preview;
      },
      auth: {
        restore: () => p().auth.restore(),
        signInWithGoogle: () => p().auth.signInWithGoogle(),
        signOut: () => p().auth.signOut(),
        reauthenticate: () => p().auth.reauthenticate(),
        deleteAccount: () => p().auth.deleteAccount(),
        onSessionLost: (l: () => void) => p().auth.onSessionLost(l),
      },
      cloud: () => p().cloud(),
      openRepository: (uid: string) => p().openRepository(uid),
      deleteLocalData: (uid: string) => p().deleteLocalData(uid),
    }),
  };
});
const mockSaved: { name: string; text: string }[] = [];
jest.mock('../share', () => ({
  saveTextFile: async (name: string, text: string) => {
    mockSaved.push({ name, text });
    return { uri: `file:///fake/${name}`, readBack: text };
  },
  shareFile: async () => true,
}));

const ANA: AuthUser = { uid: 'uid-ana', displayName: 'Ana Souza', email: 'ana@example.com' };
const BIA: AuthUser = { uid: 'uid-bia', displayName: 'Bia Lima', email: 'bia@example.com' };

/** "Aparelho": o que sobrevive entre aberturas do app (sessão do Google, bancos por conta, nuvem). */
function makeHardware(opts: { signedIn?: AuthUser | null } = {}) {
  const cloud = new FakeCloud();
  const dbs = new Map<string, GameRepository>();
  const hw = {
    cloud,
    dbs,
    deleted: [] as string[],
    user: (opts.signedIn ?? null) as AuthUser | null,
    pick: ANA as AuthUser, // conta que o seletor do Google devolve no próximo login
    signInError: null as AuthError | null,
    reauthError: null as AuthError | null,
    accountDeleted: false,
    lostListeners: [] as (() => void)[],
  };
  const auth: AuthService = {
    restore: async () => hw.user,
    signInWithGoogle: async () => {
      if (hw.signInError) throw hw.signInError;
      hw.user = hw.pick;
      return hw.pick;
    },
    signOut: async () => {
      hw.user = null;
    },
    reauthenticate: async () => {
      if (hw.reauthError) throw hw.reauthError;
    },
    deleteAccount: async () => {
      hw.accountDeleted = true;
      hw.user = null;
    },
    onSessionLost: (l) => {
      hw.lostListeners.push(l);
      return () => undefined;
    },
  };
  mockHolder.platform = {
    preview: false,
    auth,
    cloud: () => cloud,
    openRepository: async (uid) => {
      const repo = dbs.get(uid) ?? new MemoryGameRepository();
      dbs.set(uid, repo);
      return repo;
    },
    deleteLocalData: async (uid) => {
      dbs.delete(uid);
      hw.deleted.push(uid);
    },
  };
  return hw;
}

/** Abre o app: acompanha a sequência de estados que a tela veria. */
function launch() {
  useGameStore.setState({ status: 'loading', user: null, game: null, authError: null, restoreError: null, sync: null, authBusy: false });
  const statuses: string[] = [useGameStore.getState().status];
  const unsubscribe = useGameStore.subscribe((st) => {
    if (statuses[statuses.length - 1] !== st.status) statuses.push(st.status);
  });
  return { session, actions, statuses, unsubscribe, state: () => useGameStore.getState() };
}

type App = ReturnType<typeof launch>;
let current: App | null = null;
const open = () => {
  current?.unsubscribe();
  return (current = launch());
};

/** Responde a uma expedição de 3 questões (tudo certo): gera XP, histórico e quadro de encomendas. */
async function study(app: App) {
  await app.actions.startExpedition(3);
  for (let i = 0; i < 3; i++) {
    const g = app.state().game!;
    const qid = currentQuestionId(g.session!)!;
    await app.actions.answer({ chosen: getQuestion(qid).answer, guessed: false, hints: 0, timeMs: 20_000 });
  }
  await app.actions.finish();
}

const onboard = (app: App, name: string) =>
  app.actions.finishOnboarding({ name, goal: 'enem', dailyMinutes: 10, selfLevel: 'iniciante', examYear: null });

afterEach(async () => {
  await session.signOut().catch(() => undefined); // encerra o motor (timers)
  current?.unsubscribe();
  current = null;
});

describe('abertura e login', () => {
  it('sem sessão salva, o app mostra o login', async () => {
    makeHardware();
    const app = open();
    await app.session.boot();
    expect(app.state().status).toBe('signed-out');
    expect(app.state().user).toBeNull();
    expect(app.state().game).toBeNull();
  });

  it('primeiro login numa conta nova: confirma que a nuvem está vazia, abre o jogo e o perfil criado vai para a nuvem', async () => {
    const hw = makeHardware();
    const app = open();
    await app.session.boot();
    await app.session.signIn();

    expect(app.statuses).toEqual(['loading', 'signed-out', 'restoring', 'ready']); // jogo só abre DEPOIS de consultar a nuvem
    expect(app.state()).toMatchObject({ status: 'ready', cloudEnabled: true, authError: null, authBusy: false });
    expect(app.state().user?.email).toBe('ana@example.com');
    expect(app.state().game!.profile.onboarded).toBe(false);

    await onboard(app, 'Ana');
    await study(app);
    await app.session.syncNow();
    const doc = hw.cloud.saves.get(ANA.uid)!;
    expect(doc.rev).toBe(1);
    expect(decodeSyncState(doc.data).profile.name).toBe('Ana');
    expect(app.state().sync).toMatchObject({ phase: 'idle', pendingChanges: false });
  });

  it('login numa conta que já tem progresso (outro aparelho): restaura antes de liberar o jogo', async () => {
    const hw = makeHardware();
    const other = await makeDevice({ uid: ANA.uid, name: 'Outro', cloud: hw.cloud });
    await other.engine.syncNow();
    await other.onboard('Ana');
    await other.expedition(QUESTIONS.slice(0, 8).map((q) => q.id), true);
    await other.engine.syncNow({ force: true });
    const xp = other.state().profile.xp;
    const revBefore = hw.cloud.saves.get(ANA.uid)!.rev;
    other.close();

    const app = open();
    await app.session.boot();
    await app.session.signIn();
    expect(app.state().status).toBe('ready');
    expect(app.state().game!.profile).toMatchObject({ name: 'Ana', onboarded: true, xp });
    // O aviso da restauração vira um toast curto (e sai da pendência da nuvem).
    expect(app.state().toasts.map((t) => t.title)).toContain('Progresso restaurado da nuvem');
    expect(hw.cloud.saves.get(ANA.uid)!.rev).toBe(revBefore); // restaurar não grava nada na nuvem
  });

  it('sem internet no primeiro acesso: fica em "restaurando" com mensagem clara e se recupera ao tentar de novo', async () => {
    const hw = makeHardware();
    hw.cloud.down = 'offline';
    const app = open();
    await app.session.boot();
    await app.session.signIn();
    expect(app.state().status).toBe('restoring');
    expect(app.state().restoreError).toMatch(/conexão/i);
    expect(app.state().restoreError).not.toMatch(/enviado/); // o assunto é BUSCAR, não enviar

    hw.cloud.down = null;
    await app.session.retryRestore();
    expect(app.state().status).toBe('ready');
    expect(app.state().restoreError).toBeNull();
  });

  it('login cancelado volta ao botão sem mensagem de erro; falha de rede mostra aviso claro', async () => {
    const hw = makeHardware();
    const app = open();
    await app.session.boot();
    hw.signInError = new AuthError('cancelled', 'cancelado');
    await app.session.signIn();
    expect(app.state()).toMatchObject({ status: 'signed-out', authError: null, authBusy: false });

    hw.signInError = new AuthError('offline', 'Sem conexão com a internet. Conecte-se e tente de novo.');
    await app.session.signIn();
    expect(app.state()).toMatchObject({ status: 'signed-out', authBusy: false });
    expect(app.state().authError).toMatch(/Sem conexão/);

    hw.signInError = null;
    await app.session.signIn();
    expect(app.state()).toMatchObject({ status: 'ready', authError: null });
  });
});

describe('reabrir o app com sessão existente', () => {
  it('abre direto, mesmo sem internet, e continua de onde parou', async () => {
    const hw = makeHardware();
    let app = open();
    await app.session.boot();
    await app.session.signIn();
    await onboard(app, 'Ana');
    await study(app);
    await app.session.syncNow();
    const xp = app.state().game!.profile.xp;
    await app.session.signOut();
    hw.user = ANA; // a sessão do Google continua salva no aparelho

    hw.cloud.down = 'offline'; // …e agora está sem internet
    app = open();
    await app.session.boot();
    expect(app.statuses).toEqual(['loading', 'ready']); // sem passar por "restaurando"
    expect(app.state().game!.profile).toMatchObject({ name: 'Ana', xp });
    await study(app); // joga normalmente offline
    expect(app.state().game!.profile.xp).toBeGreaterThan(xp);
    await expect(app.session.syncNow()).rejects.toMatchObject({ code: 'offline' });
    expect(app.state().sync).toMatchObject({ phase: 'offline', pendingChanges: true });

    hw.cloud.down = null;
    await app.session.syncNow();
    expect(decodeSyncState(hw.cloud.saves.get(ANA.uid)!.data).profile.xp).toBe(app.state().game!.profile.xp);
  });
});

describe('troca de conta e saída', () => {
  it('cada conta vê só o seu progresso; sair não apaga nada e voltar à primeira conta conserva tudo', async () => {
    const hw = makeHardware();
    const app = open();
    await app.session.boot();
    await app.session.signIn();
    await onboard(app, 'Ana');
    await study(app);
    await app.session.syncNow();
    const anaXp = app.state().game!.profile.xp;
    await app.session.signOut();
    expect(app.state()).toMatchObject({ status: 'signed-out', user: null, game: null });
    expect(hw.dbs.has(ANA.uid)).toBe(true); // o banco da conta ficou no aparelho

    hw.pick = BIA;
    await app.session.signIn();
    expect(app.state().game!.profile).toMatchObject({ onboarded: false, xp: 0, name: '' }); // nada da Ana aparece
    await onboard(app, 'Bia');
    await app.session.syncNow();
    expect(decodeSyncState(hw.cloud.saves.get(BIA.uid)!.data).profile.name).toBe('Bia');
    await app.session.signOut();

    hw.pick = ANA;
    await app.session.signIn();
    expect(app.state().game!.profile).toMatchObject({ name: 'Ana', xp: anaXp });
    expect(decodeSyncState(hw.cloud.saves.get(ANA.uid)!.data).profile.name).toBe('Ana'); // a nuvem da Ana não foi tocada
  });

  it('sair com alterações ainda não enviadas e voltar: nada se perde', async () => {
    const hw = makeHardware();
    const app = open();
    await app.session.boot();
    await app.session.signIn();
    await onboard(app, 'Ana');
    await app.session.syncNow();
    hw.cloud.down = 'offline';
    await study(app);
    const xp = app.state().game!.profile.xp;
    await app.session.signOut(); // não consegue enviar, mas guarda no banco da conta
    hw.cloud.down = null;

    await app.session.signIn();
    expect(app.state().game!.profile.xp).toBe(xp);
    await app.session.syncNow();
    expect(decodeSyncState(hw.cloud.saves.get(ANA.uid)!.data).profile.xp).toBe(xp);
  });

  it('sessão revogada pelo servidor volta ao login com um aviso', async () => {
    const hw = makeHardware();
    const app = open();
    await app.session.boot();
    await app.session.signIn();
    expect(hw.lostListeners.length).toBeGreaterThan(0);
    hw.lostListeners[hw.lostListeners.length - 1]();
    expect(app.state()).toMatchObject({ status: 'signed-out', user: null });
    expect(app.state().authError).toMatch(/sessão expirou/i);
  });
});

describe('exclusão de conta, reinício e exportação', () => {
  it('se a confirmação com o Google falhar, NADA é apagado; se der certo, apaga nuvem, conta e banco local', async () => {
    const hw = makeHardware();
    const app = open();
    await app.session.boot();
    await app.session.signIn();
    await onboard(app, 'Ana');
    await study(app);
    await app.session.syncNow();
    expect(hw.cloud.attemptIds(ANA.uid).length).toBe(3);

    hw.reauthError = new AuthError('cancelled', 'cancelado');
    await expect(app.session.deleteAccount()).rejects.toMatchObject({ code: 'cancelled' });
    expect(hw.cloud.saves.has(ANA.uid)).toBe(true);
    expect(hw.accountDeleted).toBe(false);
    expect(hw.deleted).toEqual([]);
    expect(app.state().status).toBe('ready');

    hw.reauthError = null;
    await app.session.deleteAccount();
    expect(hw.cloud.saves.has(ANA.uid)).toBe(false);
    expect(hw.cloud.attemptIds(ANA.uid)).toEqual([]);
    expect(hw.accountDeleted).toBe(true);
    expect(hw.deleted).toEqual([ANA.uid]);
    expect(app.state()).toMatchObject({ status: 'signed-out', user: null, game: null });
  });

  it('se a exclusão falhar no meio (nuvem já apagada, conta não), o app segue utilizável e repetir conclui', async () => {
    const hw = makeHardware();
    const app = open();
    await app.session.boot();
    await app.session.signIn();
    await onboard(app, 'Ana');
    await app.session.syncNow();
    const original = mockHolder.platform!.auth.deleteAccount;
    mockHolder.platform!.auth.deleteAccount = async () => {
      throw new AuthError('requires-recent-login', 'entre de novo');
    };
    await expect(app.session.deleteAccount()).rejects.toMatchObject({ code: 'requires-recent-login' });
    expect(hw.cloud.saves.has(ANA.uid)).toBe(false); // a nuvem já foi apagada
    expect(hw.deleted).toEqual([]); // o banco local continua
    expect(app.state()).toMatchObject({ status: 'ready' });
    expect(app.state().game!.profile.name).toBe('Ana');

    mockHolder.platform!.auth.deleteAccount = original;
    await app.session.deleteAccount();
    expect(hw.deleted).toEqual([ANA.uid]);
    expect(app.state()).toMatchObject({ status: 'signed-out', user: null });
    expect(app.state().authError).toBeNull(); // nenhum "sessão expirou" durante a exclusão
  });

  it('apagar o progresso vale para a conta (nova geração na nuvem) e abre o onboarding de novo', async () => {
    const hw = makeHardware();
    const app = open();
    await app.session.boot();
    await app.session.signIn();
    await onboard(app, 'Ana');
    await study(app);
    await app.session.syncNow();

    await app.actions.resetProgress();
    expect(app.state().game!.profile).toMatchObject({ onboarded: false, xp: 0 });
    await app.session.syncNow();
    const doc = hw.cloud.saves.get(ANA.uid)!;
    expect(doc.epoch).toBe(1);
    expect(decodeSyncState(doc.data).profile.xp).toBe(0);
    expect(hw.cloud.attemptIds(ANA.uid)).toEqual([]);
  });

  it('exportar os dados gera um arquivo íntegro com tudo da conta', async () => {
    makeHardware();
    const app = open();
    await app.session.boot();
    await app.session.signIn();
    await onboard(app, 'Ana');
    await study(app);
    mockSaved.length = 0;
    const r = await app.session.exportMyData();
    expect(r.shared).toBe(true);
    expect(mockSaved).toHaveLength(1);
    const file = parseExport(mockSaved[0].text); // valida checksum e resumo
    expect(file.account).toEqual({ uid: ANA.uid, email: ANA.email });
    expect(file.state.profile.name).toBe('Ana');
    expect(file.attempts).toHaveLength(3);
    expect(file.summary.attempts).toBe(3);
  });
});
