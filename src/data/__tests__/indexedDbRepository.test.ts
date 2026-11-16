/**
 * Repositório do navegador (versão para computador): mesmo contrato do SQLite do celular.
 * Roda sobre um IndexedDB de mentira, em memória, fiel à especificação.
 */
import 'fake-indexeddb/auto';
import { getQuestion } from '../../content/bank';
import { answerCurrent, completeOnboarding, createInitialState, currentQuestionId, finishSession, fullDelta, startSession } from '../../domain/game/game';
import { emptyDelta } from '../../domain/game/tx';
import type { Attempt, GameState } from '../../domain/game/types';
import { GameController } from '../../state/controller';
import { IndexedDbGameRepository, deleteIndexedDb, openIndexedDb } from '../repository/IndexedDbGameRepository';

const T0 = Date.UTC(2026, 10, 16, 12);
let seq = 0;
const freshName = () => `questforge-test-${seq++}`;
const open = async (name = freshName()) => ({ name, repo: new IndexedDbGameRepository(await openIndexedDb(name)) });

function onboarded(): GameState {
  return completeOnboarding(createInitialState(T0), { name: 'Theo', goal: 'enem', dailyMinutes: 15, selfLevel: 'iniciante', examYear: null }, T0).state;
}

function playFirstSession(state: GameState) {
  let s = startSession(state, { id: 's1', mode: 'expedition', nodeId: null, minutes: 3, questionIds: ['RZP-001', 'PCT-002', 'GEO-001'] }, T0).state;
  const results = [];
  for (let i = 0; i < 3; i++) {
    const qid = currentQuestionId(s.session!)!;
    const r = answerCurrent(s, { attemptId: `a${i}`, chosen: getQuestion(qid).answer, guessed: false, hints: 0, timeMs: 15000 }, T0 + i);
    results.push(r);
    s = r.state;
  }
  results.push(finishSession(s, T0 + 10));
  return results;
}

const attempt = (id: string, createdAt: number, correct = false): Attempt => ({
  id, questionId: 'RZP-001', sessionId: 's1', mode: 'expedition', chosen: 'A', correct, guessed: false, hints: 0, timeMs: 10000, xp: 0, kind: correct ? 'first' : 'wrong', createdAt,
});

describe('repositório (IndexedDB)', () => {
  it('estado vazio retorna null', async () => {
    const { repo } = await open();
    expect(await repo.load()).toBeNull();
    expect(await repo.maxAttemptRowid()).toBe(0);
    expect(await repo.recentAttempts(5)).toEqual([]);
  });

  it('grava e recarrega exatamente o mesmo estado após cada operação', async () => {
    const { repo } = await open();
    let state = onboarded();
    await repo.commit(state, fullDelta(state));
    for (const r of playFirstSession(state)) {
      await repo.commit(r.state, r.delta);
      state = r.state;
      expect(await repo.load()).toEqual(state);
    }
    expect(state.profile.equipped.frame).toBe('frame-bronze');
    expect(await repo.recentAttempts(10)).toHaveLength(3);
  });

  it('o progresso sobrevive a fechar e reabrir o navegador (outra conexão, mesmo banco)', async () => {
    const first = await open();
    let state = onboarded();
    await first.repo.commit(state, fullDelta(state));
    for (const r of playFirstSession(state)) {
      await first.repo.commit(r.state, r.delta);
      state = r.state;
    }
    await first.repo.setKv([{ key: 'sync:base', value: 'rev-7' }]);
    first.repo.close();

    const again = await open(first.name);
    expect(await again.repo.load()).toEqual(state);
    expect(await again.repo.getKv('sync:base')).toBe('rev-7');
    expect((await again.repo.attemptsAfter(0, 10)).map((a) => a.attempt.id)).toEqual(['a0', 'a1', 'a2']);
  });

  it('cada conta tem o seu banco: uma não enxerga a outra', async () => {
    const a = await open('questforge-contaA');
    const b = await open('questforge-contaB');
    const state = onboarded();
    await a.repo.commit(state, fullDelta(state));
    expect(await b.repo.load()).toBeNull();
    a.repo.close();
    await deleteIndexedDb('questforge-contaA');
    expect(await (await open('questforge-contaA')).repo.load()).toBeNull();
  });

  it('tentativa com id repetido não é duplicada — no mesmo lote, em lotes seguidos ou vinda da nuvem', async () => {
    const { repo } = await open();
    const state = onboarded();
    await repo.commit(state, { ...emptyDelta(), attempts: [attempt('x', 1), attempt('x', 1), attempt('y', 2)] });
    await repo.commit(state, { ...emptyDelta(), attempts: [attempt('y', 2), attempt('z', 3)] });
    expect(await repo.importAttempts([attempt('z', 3), attempt('w', 4)])).toBe(4);
    expect((await repo.attemptsAfter(0, 10)).map((a) => [a.rowid, a.attempt.id])).toEqual([[1, 'x'], [2, 'y'], [3, 'z'], [4, 'w']]);
    // E a gravação com repetida não foi abortada: o estado entrou.
    expect(await repo.load()).toEqual(state);
  });

  it('o cursor de envio anda em ordem e em lotes', async () => {
    const { repo } = await open();
    await repo.importAttempts(Array.from({ length: 7 }, (_, i) => attempt(`t${i}`, 100 + i)));
    const first = await repo.attemptsAfter(0, 3);
    expect(first.map((a) => a.attempt.id)).toEqual(['t0', 't1', 't2']);
    const next = await repo.attemptsAfter(first[2].rowid, 10);
    expect(next.map((a) => a.attempt.id)).toEqual(['t3', 't4', 't5', 't6']);
    expect(await repo.attemptsAfter(next[3].rowid, 10)).toEqual([]);
    expect(await repo.maxAttemptRowid()).toBe(7);
  });

  it('filtra por data e pagina apenas erros, com ordem estável em datas iguais', async () => {
    const { repo } = await open();
    const state = createInitialState(100);
    await repo.commit(state, { ...fullDelta(state), attempts: [attempt('a', 100), attempt('b', 100), attempt('c', 200), attempt('d', 300, true)] });
    expect((await repo.activitySince(200)).map((a) => a.id)).toEqual(['d', 'c']);
    expect((await repo.mistakeHistory(2, 0)).map((a) => a.id)).toEqual(['c', 'b']);
    expect((await repo.mistakeHistory(2, 2)).map((a) => a.id)).toEqual(['a']);
    expect(await repo.mistakeHistory(2, 4)).toEqual([]);
    expect((await repo.recentAttempts(2)).map((a) => a.id)).toEqual(['d', 'c']);
  });

  it('reset apaga o progresso e as tentativas, mas mantém os metadados de sincronização', async () => {
    const { repo } = await open();
    const state = onboarded();
    await repo.commit(state, { ...fullDelta(state), attempts: [attempt('a', 1)] }, [{ key: 'device', value: 'pc-1' }]);
    await repo.reset();
    expect(await repo.load()).toBeNull();
    expect(await repo.recentAttempts(10)).toEqual([]);
    expect(await repo.getKv('device')).toBe('pc-1');
  });

  it('replaceAll troca tudo de uma vez (restauração da nuvem), com ou sem apagar as tentativas', async () => {
    const { repo } = await open();
    const local = onboarded();
    await repo.commit(local, { ...fullDelta(local), attempts: [attempt('a', 1)] });
    const cloud = { ...onboarded(), profile: { ...onboarded().profile, name: 'Theo do celular', xp: 18_450 } };
    await repo.replaceAll(cloud, { kv: [{ key: 'sync:base', value: 'rev-12' }, { key: 'velha', value: null }] });
    expect((await repo.load())!.profile).toMatchObject({ name: 'Theo do celular', xp: 18_450 });
    expect(await repo.recentAttempts(10)).toHaveLength(1);
    expect(await repo.getKv('sync:base')).toBe('rev-12');
    await repo.replaceAll(cloud, { wipeAttempts: true });
    expect(await repo.recentAttempts(10)).toEqual([]);
  });

  it('metadados: grava, lê e apaga', async () => {
    const { repo } = await open();
    await repo.setKv([{ key: 'a', value: '1' }, { key: 'b', value: '2' }]);
    await repo.setKv([{ key: 'a', value: null }, { key: 'b', value: '3' }]);
    expect(await repo.getKv('a')).toBeNull();
    expect(await repo.getKv('b')).toBe('3');
    expect(await repo.getKv('nunca')).toBeNull();
  });

  it('o jogo inteiro roda em cima dele: criar, jogar, fechar e continuar', async () => {
    const first = await open();
    const ctrl = new GameController({ repo: first.repo, onState: () => undefined });
    await ctrl.init();
    await ctrl.dispatch((s, now) => completeOnboarding(s, { name: 'Theo', goal: 'enem', dailyMinutes: 10, selfLevel: 'intermediario', examYear: null }, now));
    const xp = ctrl.current!.profile.xp;
    first.repo.close();

    const again = await open(first.name);
    const resumed = new GameController({ repo: again.repo, onState: () => undefined });
    await resumed.init();
    expect(resumed.current!.profile).toMatchObject({ name: 'Theo', onboarded: true, xp });
  });
});
