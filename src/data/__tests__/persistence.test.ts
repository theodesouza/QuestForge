import { getQuestion } from '../../content/bank';
import {
  answerCurrent,
  completeOnboarding,
  createInitialState,
  currentQuestionId,
  finishSession,
  fullDelta,
  startSession,
} from '../../domain/game/game';
import { academyChallengeAnswer, academyLearn, academyPractice, academyStartChallenge } from '../../domain/game/academy';
import { emptyDelta } from '../../domain/game/tx';
import type { GameState } from '../../domain/game/types';
import { GameController } from '../../state/controller';
import { LATEST_VERSION, currentVersion, migrate } from '../migrations';
import type { GameRepository } from '../repository/GameRepository';
import { MemoryGameRepository } from '../repository/MemoryGameRepository';
import { SqlGameRepository } from '../repository/SqlGameRepository';
import { openNodeDriver } from '../testing/nodeDriver';

const T0 = Date.UTC(2026, 9, 14, 12);

function onboarded(): GameState {
  return completeOnboarding(
    createInitialState(T0),
    { name: 'Rafa', goal: 'enem', dailyMinutes: 15, selfLevel: 'iniciante', examYear: null },
    T0,
  ).state;
}

/** Joga uma sessão de 3 acertos (sobe para o nível 2 e ganha a primeira moldura). */
function playFirstSession(state: GameState) {
  let s = startSession(
    state,
    { id: 's1', mode: 'expedition', nodeId: null, minutes: 3, questionIds: ['RZP-001', 'PCT-002', 'GEO-001'] },
    T0,
  ).state;
  const results = [];
  for (let i = 0; i < 3; i++) {
    const qid = currentQuestionId(s.session!)!;
    const r = answerCurrent(
      s,
      { attemptId: `a${i}`, chosen: getQuestion(qid).answer, guessed: false, hints: 0, timeMs: 15000 },
      T0 + i,
    );
    results.push(r);
    s = r.state;
  }
  results.push(finishSession(s, T0 + 10));
  return results;
}

const factories: [string, () => { repo: GameRepository; close?: () => void }][] = [
  [
    'SQLite',
    () => {
      const driver = openNodeDriver();
      return { repo: new SqlGameRepository(driver, () => T0), close: driver.close };
    },
  ],
  ['Memória', () => ({ repo: new MemoryGameRepository() })],
];

describe.each(factories)('repositório (%s)', (_name, make) => {
  it('estado vazio retorna null', async () => {
    const { repo } = make();
    expect(await repo.load()).toBeNull();
  });

  it('grava e recarrega exatamente o mesmo estado após cada operação', async () => {
    const { repo, close } = make();
    let state = onboarded();
    await repo.commit(state, fullDelta(state));
    for (const r of playFirstSession(state)) {
      await repo.commit(r.state, r.delta);
      state = r.state;
      expect(await repo.load()).toEqual(state);
    }
    expect(state.profile.equipped.frame).toBe('frame-bronze');
    expect(await repo.recentAttempts(10)).toHaveLength(3);
    close?.();
  });

  it('grava e recarrega o progresso da Academia (etapa vista, prática e desafio em andamento)', async () => {
    const { repo, close } = make();
    let state = onboarded();
    await repo.commit(state, fullDelta(state));
    const ref = 'fracoes/partes-do-todo';
    const steps = [
      (s: GameState) => academyLearn(s, { ref, pos: 3 }, T0 + 1),
      (s: GameState) => academyPractice(s, { ref, exerciseId: 'fracoes.partes-do-todo.p1', correct: true, hints: 1, answerId: 'ac1' }, T0 + 2),
      (s: GameState) => academyStartChallenge(s, { ref, runId: 'run', seed: 5 }, T0 + 3),
      (s: GameState) =>
        academyChallengeAnswer(s, { ref, runId: 'run', exerciseId: s.academy[ref].challenge.run!.items[0].exerciseId, correct: true, answerId: 'ac2' }, T0 + 4),
    ];
    for (const step of steps) {
      const r = step(state);
      await repo.commit(r.state, r.delta);
      state = r.state;
      expect(await repo.load()).toEqual(state);
    }
    expect(state.academy[ref].challenge.run!.answers).toHaveLength(1);
    close?.();
  });

  it('reset apaga todo o progresso', async () => {
    const { repo } = make();
    const state = onboarded();
    await repo.commit(state, fullDelta(state));
    await repo.reset();
    expect(await repo.load()).toBeNull();
    expect(await repo.recentAttempts(10)).toEqual([]);
  });
});

describe('SQLite', () => {
  it('migra do zero até a última versão e é idempotente', async () => {
    const db = openNodeDriver();
    expect(await currentVersion(db)).toBe(0);
    expect(await migrate(db)).toBe(LATEST_VERSION);
    expect(await migrate(db)).toBe(LATEST_VERSION);
    db.close();
  });

  it('migração com erro é revertida por inteiro', async () => {
    const db = openNodeDriver();
    await expect(
      migrate(db, [{ version: 1, description: 'quebrada', sql: 'CREATE TABLE a (x INTEGER); CREATE TABLE a (y INTEGER);' }]),
    ).rejects.toThrow();
    expect(await currentVersion(db)).toBe(0);
    expect(await db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='a'")).toEqual([]);
    db.close();
  });

  it('commit é atômico: uma falha no meio não deixa gravação parcial', async () => {
    const driver = openNodeDriver();
    const repo = new SqlGameRepository(driver, () => T0);
    const state = onboarded();
    await repo.commit(state, fullDelta(state));
    const [first] = playFirstSession(state);
    // Força erro: questão com estado ausente no meio de um delta válido.
    driver.raw.exec("CREATE TRIGGER boom BEFORE INSERT ON attempts BEGIN SELECT RAISE(ABORT, 'falha'); END;");
    await expect(repo.commit(first.state, first.delta)).rejects.toThrow();
    const loaded = await repo.load();
    expect(loaded).toEqual(state);
    expect(loaded!.profile.xp).toBe(0);
    driver.close();
  });

  it('tentativa com ID repetido não é duplicada', async () => {
    const driver = openNodeDriver();
    const repo = new SqlGameRepository(driver, () => T0);
    const state = onboarded();
    await repo.commit(state, fullDelta(state));
    const [first] = playFirstSession(state);
    await repo.commit(first.state, first.delta);
    await repo.commit(first.state, first.delta);
    expect(await repo.recentAttempts(10)).toHaveLength(1);
    driver.close();
  });

  it('recompensas no registro nunca duplicam', async () => {
    const driver = openNodeDriver();
    const repo = new SqlGameRepository(driver, () => T0);
    const state = { ...onboarded(), ledger: { 'level:2': T0 } };
    const delta = { ...emptyDelta(), ledger: ['level:2'] };
    await repo.commit(state, delta);
    await repo.commit({ ...state, ledger: { 'level:2': T0 + 999 } }, delta);
    expect(await driver.all('SELECT * FROM reward_ledger')).toEqual([{ key: 'level:2', granted_at: T0 }]);
    driver.close();
  });

  it('perfil salvo por versão antiga recebe campos novos com valores padrão', async () => {
    const driver = openNodeDriver();
    const repo = new SqlGameRepository(driver, () => T0);
    await repo.load(); // roda migrações
    await driver.run('INSERT INTO profile (id, data, updated_at) VALUES (1, ?, ?)', [
      JSON.stringify({ name: 'Antigo', xp: 120, onboarded: true }),
      T0,
    ]);
    const loaded = await repo.load();
    expect(loaded!.profile).toMatchObject({ name: 'Antigo', xp: 120, settings: { haptics: true } });
    expect(loaded!.profile.equipped.frame).toBe('frame-cobre');
    driver.close();
  });

  it('respostas da Academia ficam num registro imutável, sem duplicar', async () => {
    const driver = openNodeDriver();
    const repo = new SqlGameRepository(driver, () => T0);
    const state = onboarded();
    await repo.commit(state, fullDelta(state));
    const r = academyPractice(state, { ref: 'fracoes/partes-do-todo', exerciseId: 'fracoes.partes-do-todo.p1', correct: false, hints: 0, answerId: 'dup' }, T0);
    await repo.commit(r.state, r.delta);
    await repo.commit(r.state, r.delta);
    expect(await driver.all('SELECT id, stage_ref, mode, correct FROM academy_answers')).toEqual([
      { id: 'dup', stage_ref: 'fracoes/partes-do-todo', mode: 'practice', correct: 0 },
    ]);
    await repo.reset();
    expect(await driver.all('SELECT * FROM academy_answers')).toEqual([]);
    expect(await driver.all('SELECT * FROM academy_progress')).toEqual([]);
    driver.close();
  });

  it('sessão interrompida sobrevive a um "reinício" do app', async () => {
    const driver = openNodeDriver();
    const repo1 = new SqlGameRepository(driver, () => T0);
    let s = onboarded();
    await repo1.commit(s, fullDelta(s));
    const started = startSession(
      s,
      { id: 'live', mode: 'expedition', nodeId: null, minutes: 5, questionIds: ['RZP-001', 'RZP-004'] },
      T0,
    );
    await repo1.commit(started.state, started.delta);
    const answered = answerCurrent(
      started.state,
      { attemptId: 'x1', chosen: getQuestion('RZP-001').answer, guessed: false, hints: 0, timeMs: 1 },
      T0 + 1,
    );
    await repo1.commit(answered.state, answered.delta);
    s = answered.state;

    const repo2 = new SqlGameRepository(driver, () => T0 + 1000);
    const reloaded = await repo2.load();
    expect(reloaded!.session).toEqual(s.session);
    expect(currentQuestionId(reloaded!.session!)).toBe('RZP-004');
    driver.close();
  });
});

describe('GameController', () => {
  it('cria o estado no primeiro uso, serializa operações e não publica estado se a gravação falhar', async () => {
    const repo = new MemoryGameRepository();
    const published: GameState[] = [];
    const ctrl = new GameController({ repo, clock: () => T0, onState: (s) => published.push(s) });
    await ctrl.init();
    expect(ctrl.current!.profile.onboarded).toBe(false);

    await ctrl.dispatch((s, now) =>
      completeOnboarding(s, { name: 'Lia', goal: 'enem', dailyMinutes: 5, selfLevel: 'avancado', examYear: null }, now),
    );
    await ctrl.dispatch((s, now) =>
      startSession(s, { id: 'c1', mode: 'expedition', nodeId: null, minutes: 3, questionIds: ['RZP-001'] }, now),
    );
    const answerOnce = () =>
      ctrl.dispatch((s, now) =>
        answerCurrent(s, { attemptId: 'dbl', chosen: getQuestion('RZP-001').answer, guessed: false, hints: 0, timeMs: 1 }, now),
      );
    // Toque duplo: a segunda chamada roda depois da primeira e é rejeitada pelo domínio.
    const [a, b] = await Promise.allSettled([answerOnce(), answerOnce()]);
    expect(a.status).toBe('fulfilled');
    expect(b.status).toBe('rejected');
    expect(ctrl.current!.profile.totals.answered).toBe(1);

    const before = ctrl.current;
    const count = published.length;
    repo.failNextCommit = true;
    await expect(ctrl.dispatch((s, now) => finishSession(s, now))).rejects.toThrow('Falha simulada');
    expect(ctrl.current).toBe(before);
    expect(published).toHaveLength(count);

    // Reabrir o app carrega exatamente o que foi gravado.
    const ctrl2 = new GameController({ repo, clock: () => T0, onState: () => undefined });
    await ctrl2.init();
    expect(ctrl2.current!.profile.xp).toBe(before!.profile.xp);
    expect(ctrl2.current!.session).toEqual(before!.session);
  });
});
