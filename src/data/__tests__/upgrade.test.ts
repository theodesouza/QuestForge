/**
 * Atualização da v0.1.0 para a versão atual usando bancos SQLite REAIS gravados
 * pelo código da v0.1.0 (fixtures/). Garante que nenhum progresso se perde.
 */
import { copyFileSync, mkdtempSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { getQuestion } from '../../content/bank';
import { battleAnswer, currentQuestionId, answerCurrent } from '../../domain/game/game';
import type { GameState } from '../../domain/game/types';
import { GameController } from '../../state/controller';
import { LATEST_VERSION, MIGRATIONS, currentVersion, migrate } from '../migrations';
import { SqlGameRepository } from '../repository/SqlGameRepository';
import { openNodeDriver } from '../testing/nodeDriver';

const FIXTURES = join(__dirname, 'fixtures');
const LATER = Date.UTC(2026, 9, 20, 18); // 10 dias depois da gravação

function openCopy(name: string) {
  const dir = mkdtempSync(join(tmpdir(), 'qf-upgrade-'));
  const path = join(dir, `${name}.db`);
  copyFileSync(join(FIXTURES, `${name}.db`), path);
  return openNodeDriver(path);
}

function expected(name: string): GameState {
  return JSON.parse(readFileSync(join(FIXTURES, `${name}.expected.json`), 'utf8'));
}

describe.each(['v0.1.0-sessao', 'v0.1.0-batalha'])('atualização a partir de %s', (name) => {
  it('migra o banco e preserva todo o progresso salvo', async () => {
    const driver = openCopy(name);
    expect(await currentVersion(driver)).toBe(1);
    const repo = new SqlGameRepository(driver, () => LATER);
    const loaded = (await repo.load())!;
    expect(await currentVersion(driver)).toBe(LATEST_VERSION);

    const old = expected(name);
    expect(loaded.questionStates).toEqual(old.questionStates);
    expect(loaded.inventory).toEqual(old.inventory);
    expect(loaded.ledger).toEqual(old.ledger);
    // Missões: campos antigos idênticos; pontuação nova em branco e estrelas deduzidas dos acertos.
    expect(Object.keys(loaded.campaign)).toEqual(Object.keys(old.campaign));
    for (const [id, p] of Object.entries(old.campaign)) {
      expect(loaded.campaign[id]).toMatchObject(p);
      expect(loaded.campaign[id].bestScore).toBeNull();
      expect(loaded.campaign[id].lastScore).toBeNull();
      expect(loaded.campaign[id].bestStars).toBe(p.completedAt ? (p.bestCorrect >= 5 ? 3 : p.bestCorrect >= 4 ? 2 : 1) : 0);
    }
    expect(loaded.bosses).toEqual(old.bosses);
    expect(loaded.session).toEqual(old.session);
    // Perfil: todos os campos antigos idênticos; campos novos recebem padrão.
    expect(loaded.profile).toMatchObject(old.profile);
    expect(loaded.profile.tzOffsetMin).toBe(180);
    // Batalha: idêntica, com o campo novo `healed` preenchido como 0 nos turnos antigos.
    if (old.battle) {
      expect(loaded.battle).toMatchObject({ ...old.battle, turns: old.battle.turns.map((t) => ({ ...t, healed: 0 })) });
    } else {
      expect(loaded.battle).toBeNull();
    }
    expect(loaded.quests).toEqual({ daily: null, weekly: null });
    expect(await repo.recentAttempts(100)).not.toHaveLength(0);
    driver.close();
  });

  it('ao abrir o app atualizado: gera encomendas, concede Descanso e continua de onde parou', async () => {
    const driver = openCopy(name);
    const repo = new SqlGameRepository(driver, () => LATER);
    const old = expected(name);
    const ctrl = new GameController({ repo, clock: () => LATER, tzOffset: () => 180, onState: () => undefined });
    const events = await ctrl.init();
    const s = ctrl.current!;
    expect(s.profile.xp).toBe(old.profile.xp);
    expect(s.profile.ink).toBe(old.profile.ink);
    expect(s.profile.equipped).toEqual(old.profile.equipped);
    expect(s.profile.restedPool).toBeGreaterThan(0);
    expect(events.some((e) => e.type === 'rested')).toBe(true);
    expect(s.quests.daily?.quests).toHaveLength(3);
    expect(s.quests.weekly?.quests).toHaveLength(3);

    // Continua a sessão/batalha interrompida na v0.1.0.
    let next: GameState;
    if (s.session) {
      const qid = currentQuestionId(s.session)!;
      next = (await ctrl.dispatch((st, now) =>
        answerCurrent(st, { attemptId: 'pos-update-1', chosen: getQuestion(qid).answer, guessed: false, hints: 0, timeMs: 20000 }, now),
      )).state;
      expect(next.session!.answers.length).toBe(s.session.answers.length + 1);
    } else {
      const qid = s.battle!.currentQuestionId!;
      next = (await ctrl.dispatch((st, now) =>
        battleAnswer(st, { attemptId: 'pos-update-1', chosen: getQuestion(qid).answer, guessed: false, hints: 0, timeMs: 20000 }, now),
      )).state;
      expect(next.battle!.turns.length).toBe(s.battle!.turns.length + 1);
      expect(next.battle!.hp).toBeLessThan(s.battle!.hp);
    }
    // O quadro semanal sempre conta respostas e dias de estudo.
    expect(next.quests.weekly!.days).toHaveLength(1);
    expect(Object.values(next.quests.weekly!.progress).some((v) => v > 0)).toBe(true);

    // Reabrir de novo: tudo o que foi feito depois da atualização também persiste.
    const repo2 = new SqlGameRepository(driver, () => LATER + 1000);
    expect(await repo2.load()).toEqual(next);
    driver.close();
  });
});

describe('atualização para a Academia (bancos nas versões 3 e 4)', () => {
  it('cria as tabelas da Academia sem mexer no progresso existente', async () => {
    const driver = openNodeDriver(':memory:');
    await migrate(driver, MIGRATIONS.slice(0, 3));
    expect(await currentVersion(driver)).toBe(3);
    await driver.exec(`INSERT INTO profile (id, data, updated_at) VALUES (1, '${JSON.stringify({ name: 'Lia', onboarded: true, xp: 900 })}', 1)`);
    await driver.run('INSERT INTO campaign_progress (node_id, completed_at, best_correct, runs, best_score, best_stars, last_score) VALUES (?, ?, ?, ?, ?, ?, ?)', ['r1-m1', 1000, 5, 3, 920, 3, 920]);
    const repo = new SqlGameRepository(driver, () => LATER);
    const loaded = (await repo.load())!;
    expect(await currentVersion(driver)).toBe(LATEST_VERSION);
    expect(loaded.profile.xp).toBe(900);
    expect(loaded.campaign['r1-m1']).toMatchObject({ bestScore: 920, bestStars: 3 });
    expect(loaded.academy).toEqual({});
    // Progresso gravado por uma versão sem campos novos é completado com padrões.
    await driver.run('INSERT INTO academy_progress (stage_ref, data, updated_at) VALUES (?, ?, ?)', [
      'fracoes/partes-do-todo',
      JSON.stringify({ ref: 'fracoes/partes-do-todo', viewedAt: 5, studiedAt: 6, checks: ['x'] }),
      7,
    ]);
    const again = (await new SqlGameRepository(driver, () => LATER).load())!;
    expect(again.academy['fracoes/partes-do-todo']).toMatchObject({
      viewedAt: 5,
      studiedAt: 6,
      checks: ['x'],
      masteredAt: null,
      practice: { answered: 0, correct: 0, unaided: 0, helped: 0, seen: [] },
      challenge: { runs: 0, run: null },
    });
    driver.close();
  });

  it('banco na versão 4 (sincronização já publicada): ganha a Academia sem tocar nos metadados da nuvem', async () => {
    const driver = openNodeDriver(':memory:');
    await migrate(driver, MIGRATIONS.slice(0, 4));
    expect(await currentVersion(driver)).toBe(4);
    await driver.exec(`INSERT INTO profile (id, data, updated_at) VALUES (1, '${JSON.stringify({ name: 'Lia', onboarded: true, xp: 900 })}', 1)`);
    await driver.run('INSERT INTO sync_kv (key, value) VALUES (?, ?)', ['meta', '{"v":1,"uid":"uid-lia"}']);
    const repo = new SqlGameRepository(driver, () => LATER);
    const loaded = (await repo.load())!;
    expect(await currentVersion(driver)).toBe(LATEST_VERSION);
    expect(LATEST_VERSION).toBe(5);
    expect(loaded.profile.xp).toBe(900);
    expect(loaded.academy).toEqual({});
    expect(await repo.getKv('meta')).toBe('{"v":1,"uid":"uid-lia"}');
    driver.close();
  });
});

describe('atualização a partir da v0.2.0 (banco na versão 2)', () => {
  it('acrescenta a pontuação das missões sem mexer no progresso', async () => {
    const driver = openNodeDriver(':memory:');
    await migrate(driver, MIGRATIONS.slice(0, 2));
    expect(await currentVersion(driver)).toBe(2);
    await driver.exec(`INSERT INTO profile (id, data, updated_at) VALUES (1, '${JSON.stringify({ name: 'Lia', onboarded: true, xp: 300, level: 3 })}', 1)`);
    await driver.run('INSERT INTO campaign_progress (node_id, completed_at, best_correct, runs) VALUES (?, ?, ?, ?)', ['r1-m1', 1000, 4, 2]);
    await driver.run('INSERT INTO campaign_progress (node_id, completed_at, best_correct, runs) VALUES (?, ?, ?, ?)', ['r1-m2', null, 2, 1]);
    const repo = new SqlGameRepository(driver, () => LATER);
    const loaded = (await repo.load())!;
    expect(await currentVersion(driver)).toBe(LATEST_VERSION);
    expect(loaded.profile.xp).toBe(300);
    expect(loaded.campaign['r1-m1']).toEqual({ nodeId: 'r1-m1', completedAt: 1000, bestCorrect: 4, runs: 2, bestScore: null, bestStars: 2, lastScore: null });
    expect(loaded.campaign['r1-m2']).toEqual({ nodeId: 'r1-m2', completedAt: null, bestCorrect: 2, runs: 1, bestScore: null, bestStars: 0, lastScore: null });
    // Grava e relê: os campos novos persistem.
    await repo.commit({ ...loaded, campaign: { ...loaded.campaign, 'r1-m1': { ...loaded.campaign['r1-m1'], bestScore: 870, bestStars: 3, lastScore: 870 } } }, {
      questionStates: [], attempts: [], ledger: [], inventory: [], campaign: ['r1-m1'], bosses: [], profile: false, session: false, battle: false, quests: false,
    } as never);
    const again = (await new SqlGameRepository(driver, () => LATER).load())!;
    expect(again.campaign['r1-m1']).toMatchObject({ bestScore: 870, bestStars: 3, lastScore: 870, bestCorrect: 4, runs: 2 });
    driver.close();
  });
});
