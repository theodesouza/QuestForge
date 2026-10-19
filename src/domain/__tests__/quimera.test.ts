import { getQuestion, questionsFor } from '../../content/bank';
import { getBoss } from '../../content/bosses';
import { getItem } from '../../content/items';
import { getRegion } from '../../content/regions';
import type { AltKey } from '../../content/types';
import {
  activeHeadIndex,
  applyBattleAnswer,
  createBattle,
  headRegen,
  headSpans,
  headsFelled,
  missHeal,
  type BattleState,
} from '../boss/battle';
import { nodeStatus } from '../campaign/campaign';
import { battleAnswer, completeOnboarding, createInitialState, startBattle, touch } from '../game/game';
import type { GameState } from '../game/types';

const T0 = Date.UTC(2026, 9, 19, 15);
const boss = getBoss('quimera-fracionaria');

function fresh(hp = boss.maxHp): BattleState {
  return { ...createBattle(boss, 'q', T0, 0), hp, currentQuestionId: 'Q' };
}
const hit = (b: BattleState, difficulty: 1 | 2 | 3 | 4 = 3) =>
  applyBattleAnswer(boss, { ...b, currentQuestionId: 'Q' }, { questionId: 'Q', difficulty, correct: true, guessed: false, hints: 0 });
const miss = (b: BattleState) =>
  applyBattleAnswer(boss, { ...b, currentQuestionId: 'Q' }, { questionId: 'Q', difficulty: 2, correct: false, guessed: false, hints: 0 });

describe('Região 3 e Quimera Fracionária', () => {
  it('a Região 3 só abre depois de derrotar o Mercador, e o chefão só depois das três missões', () => {
    const r3 = getRegion('planicies-numericas');
    expect(r3.nodes.map((n) => n.id)).toEqual(['r3-m1', 'r3-m2', 'r3-m3', 'r3-boss']);
    const win = (id: string) => ({ bossId: id, attempts: 1, wins: 1, failedSinceWin: 0, firstWinAt: T0, flawless: false, bestTurns: 7 });
    const lockedView = { progress: {}, bosses: { 'golem-proporcional': win('golem-proporcional') } };
    expect(nodeStatus(r3.nodes[0], lockedView)).toBe('locked');
    const open = { progress: {}, bosses: { ...lockedView.bosses, 'mercador-composto': win('mercador-composto') } };
    expect(nodeStatus(r3.nodes[0], open)).toBe('available');
    expect(nodeStatus(r3.nodes[3], open)).toBe('locked');
    const done = Object.fromEntries(['r3-m1', 'r3-m2', 'r3-m3'].map((id) => [id, { nodeId: id, completedAt: T0, bestCorrect: 5, runs: 1, bestScore: 900, bestStars: 3, lastScore: 900 }]));
    expect(nodeStatus(r3.nodes[3], { progress: done, bosses: open.bosses })).toBe('available');
  });

  it('as cabeças ocupam 1/2, 1/3 e 1/6 da vida, de cima para baixo', () => {
    expect(boss.trait.kind).toBe('heads');
    const spans = headSpans(boss);
    expect(spans.map((s) => [s.ceilHp, s.floorHp])).toEqual([[240, 120], [120, 40], [40, 0]]);
    if (boss.trait.kind === 'heads') {
      const sum = boss.trait.heads.reduce((t, h) => t + h.share[0] / h.share[1], 0);
      expect(sum).toBeCloseTo(1, 12);
      expect(spans.map((s) => (s.ceilHp - s.floorHp) / boss.maxHp)).toEqual(boss.trait.heads.map((h) => h.share[0] / h.share[1]));
    }
  });

  it('a cabeça de pé e as caídas seguem a vida', () => {
    const cases: [number, number, number][] = [
      [240, 0, 0],
      [121, 0, 0],
      [120, 1, 1],
      [41, 1, 1],
      [40, 2, 2],
      [1, 2, 2],
      [0, 3, 2],
    ];
    for (const [hp, felled, active] of cases) {
      expect(headsFelled(boss, hp)).toBe(felled);
      expect(activeHeadIndex(boss, hp)).toBe(active);
    }
  });

  it('um erro regenera a cabeça de pé, mas nunca além do topo dela (cabeça derrubada não volta)', () => {
    const heal = Math.round(boss.maxHp * 0.06);
    expect(headRegen(boss, fresh(200))).toBe(heal);
    expect(headRegen(boss, fresh(240))).toBe(0);
    // Leão caído: a Cabra só chega até 120, não volta ao Leão.
    expect(headRegen(boss, fresh(118))).toBe(2);
    expect(headRegen(boss, fresh(110))).toBe(10);
    expect(headRegen(boss, fresh(100))).toBe(heal);
    // Serpente: teto em 40.
    expect(headRegen(boss, fresh(38))).toBe(2);
    expect(miss(fresh(118)).battle.hp).toBe(120);
    // O erro custa Determinação, como sempre.
    expect(miss(fresh(200)).battle.resolve).toBe(boss.resolve - 1);
    // Nenhum chefão sem cabeças regenera por aqui.
    const golem = getBoss('golem-proporcional');
    expect(missHeal(golem, createBattle(golem, 'g', T0, 0))).toBe(0);
  });

  it('registra quantas cabeças caíram em cada golpe e quebra a fase 2 ao cair o Leão', () => {
    const r1 = hit(fresh(125), 4);
    expect(r1.turn.headsFelled).toBe(1);
    expect(r1.turn.armorBroke).toBe(true);
    expect(r1.battle.hp).toBeLessThanOrEqual(120);
    // Um golpe com combo e técnica pode derrubar duas cabeças de uma vez.
    const big = hit({ ...fresh(125), combo: 2 }, 4);
    expect(big.turn.technique).toBe(true);
    expect(big.turn.headsFelled).toBe(2);
    // Golpe que não cruza fronteira não derruba nada.
    expect(hit(fresh(240), 1).turn.headsFelled).toBe(0);
  });

  it('a vitória acontece quando as três cabeças caem, e as recompensas existem no catálogo', () => {
    let b = fresh();
    let turns = 0;
    while (b.status === 'active' && turns < 40) {
      b = hit(b, 4).battle;
      turns++;
    }
    expect(b.status).toBe('won');
    expect(headsFelled(boss, b.hp)).toBe(3);
    for (const id of [...boss.rewards.firstItems, boss.rewards.flawlessItem]) expect(getItem(id)).toBeDefined();
    expect(getItem(boss.rewards.flawlessItem).rarity).toBe('lendario');
  });

  it('cada cabeça faz perguntas da própria matéria, e há questões de sobra em todas', () => {
    if (boss.trait.kind !== 'heads') throw new Error('Quimera deveria ter cabeças');
    for (const head of boss.trait.heads) {
      const pool = questionsFor({ topics: boss.topics, subtopics: head.subtopics });
      expect(pool.length).toBeGreaterThanOrEqual(20);
      for (const q of pool) expect(head.subtopics).toContain(q.subtopic);
    }
  });

  it('numa batalha de verdade, a pergunta de cada turno é da cabeça que está de pé', () => {
    if (boss.trait.kind !== 'heads') throw new Error('Quimera deveria ter cabeças');
    const heads = boss.trait.heads;
    let state: GameState = completeOnboarding(
      touch(createInitialState(T0), T0, 180).state,
      { name: 'Lia', goal: 'enem', dailyMinutes: 10, selfLevel: 'intermediario', examYear: null },
      T0,
    ).state;
    const done = Object.fromEntries(['r3-m1', 'r3-m2', 'r3-m3'].map((id) => [id, { nodeId: id, completedAt: T0, bestCorrect: 5, runs: 1, bestScore: 900, bestStars: 3, lastScore: 900 }]));
    const win = (id: string) => ({ bossId: id, attempts: 1, wins: 1, failedSinceWin: 0, firstWinAt: T0, flawless: false, bestTurns: 7 });
    state = { ...state, campaign: { ...state.campaign, ...done }, bosses: { 'golem-proporcional': win('golem-proporcional'), 'mercador-composto': win('mercador-composto') } };

    state = startBattle(state, boss.id, 'b1', T0).state;
    const seen: Record<string, number> = {};
    for (let turn = 0; turn < 60 && state.battle?.status === 'active'; turn++) {
      const b = state.battle;
      const q = getQuestion(b.currentQuestionId as string);
      const head = headSpans(boss)[activeHeadIndex(boss, b.hp)].head;
      expect(head.subtopics).toContain(q.subtopic);
      seen[head.id] = (seen[head.id] ?? 0) + 1;
      state = battleAnswer(state, { attemptId: `a${turn}`, chosen: q.answer as AltKey, guessed: false, hints: 0, timeMs: 30_000 }, T0 + turn * 1000).state;
    }
    expect(state.battle?.status).toBe('won');
    expect(Object.keys(seen).sort()).toEqual(heads.map((h) => h.id).sort());
  });
});
