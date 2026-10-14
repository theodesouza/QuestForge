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
import { LATEST_VERSION, currentVersion } from '../migrations';
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
    expect(loaded.campaign).toEqual(old.campaign);
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
