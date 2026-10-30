import { QUESTIONS } from '../../content/bank';
import { createInitialState, startSession } from '../../domain/game/game';
import { useGameStore } from '../../state/store';
import { closeDialog, useDialogStore } from '../dialog/dialog';
import { guardBattle, guardStart } from '../startGuard';

const mockRouter = { push: jest.fn(), replace: jest.fn() };
jest.mock('expo-router', () => ({ router: { push: (...a: unknown[]) => mockRouter.push(...a), replace: (...a: unknown[]) => mockRouter.replace(...a) } }));
const mockAbandon = jest.fn(async () => undefined);
jest.mock('../../state/actions', () => ({ abandon: () => mockAbandon() }));

const T0 = Date.UTC(2026, 9, 1, 12);

function withSession(opts: { mode: 'expedition' | 'mission'; nodeId?: string | null; minutes?: number | null }) {
  const base = createInitialState(T0);
  const ids = QUESTIONS.slice(0, 5).map((q) => q.id);
  const state =
    opts.mode === 'mission'
      ? { ...base, session: { ...startSession({ ...base, campaign: base.campaign }, { id: 's', mode: 'expedition', nodeId: null, minutes: 5, questionIds: ids }, T0).state.session!, mode: 'mission' as const, nodeId: opts.nodeId ?? 'r1-m1', minutes: null } }
      : startSession(base, { id: 's', mode: 'expedition', nodeId: null, minutes: opts.minutes ?? 5, questionIds: ids }, T0).state;
  useGameStore.setState({ game: state });
}

const buttons = () => useDialogStore.getState().queue[0]?.buttons.map((b) => b.text);
const press = (label: string) => {
  const d = useDialogStore.getState().queue[0];
  closeDialog(d.id, d.buttons.find((b) => b.text === label));
};

beforeEach(() => {
  jest.clearAllMocks();
  useDialogStore.setState({ queue: [] });
  useGameStore.setState({ game: createInitialState(T0) });
});

describe('começar uma atividade nova', () => {
  it('sem nada em andamento, o caminho está livre', async () => {
    await expect(guardStart({ mode: 'expedition', nodeId: null, minutes: 5 })).resolves.toBe('start');
    expect(useDialogStore.getState().queue).toHaveLength(0);
  });

  it('a mesma expedição pausada é retomada, sem criar outra nem perguntar', async () => {
    withSession({ mode: 'expedition', minutes: 5 });
    await expect(guardStart({ mode: 'expedition', nodeId: null, minutes: 5 })).resolves.toBe('resumed');
    expect(mockRouter.push).toHaveBeenCalledWith('/session');
    expect(useDialogStore.getState().queue).toHaveLength(0);
  });

  it('a mesma missão pausada é retomada (com replace quando pedido)', async () => {
    withSession({ mode: 'mission', nodeId: 'r1-m1' });
    await expect(guardStart({ mode: 'mission', nodeId: 'r1-m1', minutes: null }, true)).resolves.toBe('resumed');
    expect(mockRouter.replace).toHaveBeenCalledWith('/session');
  });

  it('outra atividade em andamento: pergunta, e "Terminar a atual" leva de volta a ela', async () => {
    withSession({ mode: 'expedition', minutes: 5 });
    const verdict = guardStart({ mode: 'expedition', nodeId: null, minutes: 10 });
    expect(buttons()).toEqual(['Terminar a atual', 'Descartar e começar a nova', 'Cancelar']);
    expect(useDialogStore.getState().queue[0].message).toContain('expedição de 5 min');
    press('Terminar a atual');
    await expect(verdict).resolves.toBe('resumed');
    expect(mockRouter.push).toHaveBeenCalledWith('/session');
    expect(mockAbandon).not.toHaveBeenCalled();
  });

  it('"Descartar e começar a nova" fecha a sessão aberta e libera a nova', async () => {
    withSession({ mode: 'mission', nodeId: 'r1-m1' });
    const verdict = guardStart({ mode: 'expedition', nodeId: null, minutes: 5 });
    press('Descartar e começar a nova');
    await expect(verdict).resolves.toBe('start');
    expect(mockAbandon).toHaveBeenCalledTimes(1);
  });

  it('Cancelar não muda nada', async () => {
    withSession({ mode: 'expedition', minutes: 5 });
    const verdict = guardStart(undefined);
    press('Cancelar');
    await expect(verdict).resolves.toBe('cancel');
    expect(mockAbandon).not.toHaveBeenCalled();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it('fechar o diálogo com o botão Voltar equivale a cancelar', async () => {
    withSession({ mode: 'expedition', minutes: 5 });
    const verdict = guardStart(undefined);
    const d = useDialogStore.getState().queue[0];
    closeDialog(d.id, d.buttons.find((b) => b.style === 'cancel'));
    await expect(verdict).resolves.toBe('cancel');
  });
});

describe('antes de uma batalha', () => {
  it('sem sessão aberta, segue', async () => {
    await expect(guardBattle()).resolves.toBe('start');
  });

  it('com sessão aberta, pergunta e pode descartar para lutar', async () => {
    withSession({ mode: 'expedition', minutes: 5 });
    const verdict = guardBattle();
    expect(buttons()).toEqual(['Terminar a atual', 'Descartar e lutar', 'Cancelar']);
    press('Descartar e lutar');
    await expect(verdict).resolves.toBe('start');
    expect(mockAbandon).toHaveBeenCalledTimes(1);
  });
});
