import { createInitialState, fullDelta } from '../../domain/game/game';
import type { Attempt } from '../../domain/game/types';
import { emptyDelta } from '../../domain/game/tx';
import { MemoryGameRepository } from '../repository/MemoryGameRepository';
import { SqlGameRepository } from '../repository/SqlGameRepository';
import { openNodeDriver } from '../testing/nodeDriver';

describe.each(['SQLite', 'Memória'])('consultas de aprendizado (%s)', kind => {
  it('filtra por data e pagina apenas erros, com ordem estável em datas iguais', async () => {
    const db = kind === 'SQLite' ? openNodeDriver() : null;
    const repo = db ? new SqlGameRepository(db) : new MemoryGameRepository();
    try {
      const state = createInitialState(100);
      await repo.commit(state, fullDelta(state));
      const base: Attempt = {
        id: 'a', questionId: 'RZP-001', sessionId: 's1', mode: 'expedition',
        chosen: 'A', correct: false, guessed: false, hints: 0, timeMs: 10000,
        xp: 0, kind: 'wrong', createdAt: 100,
      };
      const attempts = [base, { ...base, id: 'b' }, { ...base, id: 'c', createdAt: 200 },
        { ...base, id: 'd', createdAt: 300, correct: true }];
      await repo.commit(state, { ...emptyDelta(), attempts });
      expect((await repo.activitySince(200)).map(a => a.id)).toEqual(['d', 'c']);
      expect((await repo.mistakeHistory(2, 0)).map(a => a.id)).toEqual(['c', 'b']);
      expect((await repo.mistakeHistory(2, 2)).map(a => a.id)).toEqual(['a']);
      expect(await repo.mistakeHistory(2, 4)).toEqual([]);
      await repo.reset();
      expect(await repo.activitySince(0)).toEqual([]);
    } finally { db?.close(); }
  });
});
