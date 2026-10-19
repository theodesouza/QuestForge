import { getQuestion } from '../../content/bank';
import { acknowledgeScaffold, answerCurrent, createInitialState, fullDelta, startSession } from '../../domain/game/game';
import { GameController } from '../../state/controller';
import { MemoryGameRepository } from '../repository/MemoryGameRepository';
import { SqlGameRepository } from '../repository/SqlGameRepository';
import { openNodeDriver } from '../testing/nodeDriver';

const NOW = Date.UTC(2026, 9, 19, 18);

describe.each(['SQLite', 'Memória'])('retomada do reforço (%s)', kind => {
  it('preserva o exemplo pendente e depois preserva sua conclusão sem acrescentar tentativa', async () => {
    const db = kind === 'SQLite' ? openNodeDriver() : null;
    const repo = db ? new SqlGameRepository(db) : new MemoryGameRepository();
    try {
      const ctrl = new GameController({ repo, clock: () => NOW, onState: () => undefined });
      await ctrl.init();
      await ctrl.dispatch((s, now) => startSession(s, {
        id: 'sc', mode: 'expedition', nodeId: null, minutes: null,
        questionIds: ['RZP-006', 'RZP-012', 'PCT-001'],
      }, now));
      for (let i = 0; i < 2; i++) {
        await ctrl.dispatch((s, now) => {
          const q = getQuestion(s.session!.queue[s.session!.index]);
          return answerCurrent(s, { attemptId: `wrong-${i}`, chosen: q.answer === 'A' ? 'B' : 'A', guessed: false, hints: 0, timeMs: 5000 }, now);
        });
      }
      const paused = await repo.load();
      expect(paused!.session!.scaffoldLesson).toBeTruthy();
      const restarted = new GameController({ repo, clock: () => NOW, onState: () => undefined });
      await restarted.init();
      expect(restarted.current!.session).toEqual(paused!.session);
      const lesson = paused!.session!.scaffoldLesson!;
      await restarted.dispatch(s => acknowledgeScaffold(s, lesson.practiceQuestionId));
      expect((await repo.load())!.session!.scaffoldLesson).toBeNull();
      expect(await repo.recentAttempts(10)).toHaveLength(2);
    } finally { db?.close(); }
  });
});

it('uma falha ao salvar a leitura mantém a aula pendente', async () => {
  const repo = new MemoryGameRepository();
  const state = startSession(createInitialState(NOW), {
    id: 'sc', mode: 'expedition', nodeId: null, minutes: null, questionIds: ['RZP-001'],
  }, NOW).state;
  state.session!.scaffoldLesson = { sourceQuestionId: 'RZP-006', practiceQuestionId: 'RZP-001', exampleQuestionId: 'RZP-002' };
  await repo.commit(state, fullDelta(state));
  const ctrl = new GameController({ repo, clock: () => NOW, onState: () => undefined });
  await ctrl.init();
  repo.failNextCommit = true;
  await expect(ctrl.dispatch(s => acknowledgeScaffold(s, 'RZP-001'))).rejects.toThrow();
  expect(ctrl.current!.session!.scaffoldLesson).toEqual(state.session!.scaffoldLesson);
});
