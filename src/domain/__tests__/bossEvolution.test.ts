import { getBoss } from '../../content/bosses';
import { getQuestion, QUESTIONS } from '../../content/bank';
import { applyBattleAnswer, createBattle, knowledgeSeals, CONVERGENCE_BONUS, type BattleState } from '../boss/battle';
import { selectBossQuestion, selectQuestions } from '../learning/selection';
import { emptyQuestionState } from '../learning/srs';
import { battleAnswer, createInitialState, fullDelta, startBattle } from '../game/game';
import { SqlGameRepository } from '../../data/repository/SqlGameRepository';
import { openNodeDriver } from '../../data/testing/nodeDriver';

const boss = getBoss('golem-proporcional');
const initial = () => createBattle(boss, 'seal-test', 1000, 0);
function hit(battle: BattleState, key: string, extra = {}) {
  const questionId = `q${battle.turns.length}`;
  return applyBattleAnswer(boss, { ...battle, currentQuestionId: questionId }, {
    questionId, difficulty: 1, correct: true, hints: 0, guessed: false, knowledgeKey: key, ...extra,
  });
}

describe('Selos de Conhecimento', () => {
  it('uma resposta real persiste o selo em SQLite e preserva o cálculo de XP', async () => {
    const state = createInitialState(1000);
    state.campaign['r1-m3'] = { nodeId: 'r1-m3', completedAt: 999, bestCorrect: 5, runs: 1, bestScore: 1000, bestStars: 3, lastScore: 1000 };
    const started = startBattle(state, boss.id, 'sqlite-seals', 1000).state;
    const q = getQuestion(started.battle!.currentQuestionId!);
    const result = battleAnswer(started, { attemptId: 'sqlite-answer', chosen: q.answer, hints: 0, guessed: false, timeMs: 20000 }, 2000);
    expect(knowledgeSeals(result.state.battle!)).toEqual([`${q.topic}:${q.subtopic}`]);
    expect(result.state.profile.xp).toBeGreaterThan(state.profile.xp);
    const driver = openNodeDriver();
    try {
      const repo = new SqlGameRepository(driver, () => 2000);
      await repo.commit(result.state, fullDelta(result.state));
      const reloaded = await repo.load();
      expect(reloaded!.battle).toEqual(result.state.battle);
      expect(reloaded!.profile.xp).toBe(result.state.profile.xp);
    } finally { driver.close(); }
  });
  it('converge apenas ao dominar três subassuntos diferentes e reinicia os selos', () => {
    let b = hit(initial(), 'razao:razao').battle;
    b = hit(b, 'razao:razao').battle;
    expect(knowledgeSeals(b)).toEqual(['razao:razao']);
    b = hit(b, 'razao:escala').battle;
    const before = b;
    const result = hit(b, 'porcentagem:variacao');
    const plain = hit(before, 'razao:razao');
    expect(result.turn.convergence).toBe(true);
    expect(result.turn.damage - plain.turn.damage).toBe(CONVERGENCE_BONUS);
    expect(knowledgeSeals(result.battle)).toEqual([]);
    expect(knowledgeSeals(hit(result.battle, 'razao:razao').battle)).toHaveLength(1);
  });

  it('dicas, chute e erro não carregam selos nem apagam os já conquistados', () => {
    let b = hit(initial(), 'a').battle;
    b = hit(b, 'b', { hints: 1 }).battle;
    b = hit(b, 'c', { guessed: true }).battle;
    b = hit(b, 'd', { correct: false }).battle;
    expect(knowledgeSeals(b)).toEqual(['a']);
    expect(b.resolve).toBe(boss.resolve - 1);
  });

  it('retoma de JSON sem perder selos e aceita batalhas antigas sem metadados', () => {
    const saved = JSON.parse(JSON.stringify(hit(hit(initial(), 'a').battle, 'b').battle));
    expect(hit(saved, 'c').turn.convergence).toBe(true);
    const old = hit(initial(), 'a').battle;
    old.turns = old.turns.map(({ seal: _seal, convergence: _convergence, ...turn }) => turn);
    expect(knowledgeSeals(old)).toEqual([]);
    expect(hit(old, 'b').battle.status).toBe('active');
  });

  it('convergência pode vencer e não produz vida negativa', () => {
    const b = hit(hit(initial(), 'a').battle, 'b').battle;
    const result = hit({ ...b, hp: 1 }, 'c');
    expect(result.battle.status).toBe('won');
    expect(result.battle.hp).toBe(0);
  });
});

describe('rejogabilidade dos chefes', () => {
  const pool = QUESTIONS.slice(0, 5);
  it('escolhe inéditas antes de revisões e respeita as exclusões do combate', () => {
    const states = Object.fromEntries(pool.slice(0, 4).map(q => [q.id, { ...emptyQuestionState(q.id), seen: 1, dueAt: 1 }]));
    expect(selectBossQuestion({ pool, states, now: 1000, seed: 42 })?.id).toBe(pool[4].id);
    expect(selectBossQuestion({ pool, states, now: 1000, seed: 42, exclude: new Set(pool.map(q => q.id)) })).toBeUndefined();
  });
  it('esgotadas as inéditas, escolhe a mais antiga mesmo fora da dificuldade ideal', () => {
    const states = Object.fromEntries(pool.map((q, i) => [q.id, { ...emptyQuestionState(q.id), seen: 1, lastAnsweredAt: i + 10 }]));
    expect(selectBossQuestion({ pool, states, now: 1000, seed: 42, fixedTarget: 4 })?.id).toBe(pool[0].id);
    states[pool[0].id].lastAnsweredAt = 2000;
    expect(selectBossQuestion({ pool, states, now: 3000, seed: 42 })?.id).toBe(pool[1].id);
  });
});

it('a expansão de um assunto não domina as expedições por ter mais questões', () => {
  const base = QUESTIONS[0];
  const pool = [
    { ...base, id: 'rare', topic: 'estatistica' as const },
    ...Array.from({ length: 40 }, (_, i) => ({ ...base, id: `many-${i}`, topic: 'basica' as const })),
  ];
  const rare = Array.from({ length: 200 }, (_, seed) => selectQuestions({ pool, states: {}, count: 1, now: 0, seed })[0]).filter(q => q.id === 'rare').length;
  expect(rare).toBeGreaterThan(65);
  expect(rare).toBeLessThan(135);
});
