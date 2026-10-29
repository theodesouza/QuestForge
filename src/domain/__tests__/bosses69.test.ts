import { getBoss } from '../../content/bosses';
import { getRegion } from '../../content/regions';
import { getTopic } from '../../content/topics';
import { applyBattleAnswer, createBattle, scalesMultiplier, scalesOf, type BattleState } from '../boss/battle';
import { nodeStatus } from '../campaign/campaign';

const T0 = Date.UTC(2026, 9, 30, 15);

const win = (id: string) => ({ bossId: id, attempts: 1, wins: 1, failedSinceWin: 0, firstWinAt: T0, flawless: false, bestTurns: 7 });
const done = (ids: string[]) => Object.fromEntries(ids.map((id) => [id, { nodeId: id, completedAt: T0, bestCorrect: 5, runs: 1, bestScore: 900, bestStars: 3, lastScore: 900 }]));

describe('Atlas: Regiões 6 a 9 (estrutura)', () => {
  const regions = [
    { id: 'observatorio-dados', index: 6, prefix: 'r6', boss: 'leviata-dos-graficos', after: 'r5-boss' },
  ];
  it.each(regions)('região $index: três missões em cadeia, chefão só depois delas', ({ id, index, prefix, boss, after }) => {
    const region = getRegion(id);
    expect(region.index).toBe(index);
    expect(region.nodes.map((n) => n.id)).toEqual([`${prefix}-m1`, `${prefix}-m2`, `${prefix}-m3`, `${prefix}-boss`]);
    const first = region.nodes[0];
    expect(first.requires).toEqual([after]);
    const bosses = Object.fromEntries(['golem-proporcional', 'mercador-composto', 'quimera-fracionaria', 'colosso-euclidiano', 'arquiteto-dos-solidos'].map((b) => [b, win(b)]));
    const prevBoss = after.replace('-boss', '');
    expect(prevBoss).toMatch(/^r\d$/);
    expect(nodeStatus(region.nodes[3], { progress: {}, bosses })).toBe('locked');
    expect(nodeStatus(region.nodes[3], { progress: done([`${prefix}-m1`, `${prefix}-m2`, `${prefix}-m3`]), bosses })).toBe('available');
    expect(region.nodes[3].kind === 'boss' && region.nodes[3].bossId).toBe(boss);
  });

  it('cada missão usa só subassuntos que existem nos assuntos dela', () => {
    for (const { id } of regions) {
      for (const n of getRegion(id).nodes) {
        if (n.kind !== 'mission') continue;
        const known = n.topics.flatMap((t) => getTopic(t).subtopics.map((s) => s.id));
        for (const s of n.subtopics) expect(known).toContain(s);
        expect(n.difficulty).toHaveLength(n.questionCount);
      }
    }
  });
});

// ———————————————————————————————————————————————— Leviatã dos Gráficos

describe('Leviatã dos Gráficos: Escamas de Dados', () => {
  const boss = getBoss('leviata-dos-graficos');
  const fresh = (): BattleState => ({ ...createBattle(boss, 'c', T0, 0), currentQuestionId: 'Q' });
  const hit = (b: BattleState, difficulty: 1 | 2 | 3 | 4 = 3) =>
    applyBattleAnswer(boss, { ...b, currentQuestionId: 'Q' }, { questionId: 'Q', difficulty, correct: true, guessed: false, hints: 0 });
  const miss = (b: BattleState) => applyBattleAnswer(boss, { ...b, currentQuestionId: 'Q' }, { questionId: 'Q', difficulty: 2, correct: false, guessed: false, hints: 0 });

  it('começa com todas as escamas; outros chefões não têm escamas', () => {
    expect(boss.trait.kind).toBe('scales');
    expect(fresh().scales).toBe(4);
    expect(scalesOf(boss, fresh())).toBe(4);
    expect(createBattle(getBoss('golem-proporcional'), 'x', T0, 0).scales).toBeUndefined();
    expect(scalesMultiplier(getBoss('golem-proporcional'), fresh())).toBe(1);
  });

  it('batalhas gravadas sem o campo valem como escamas cheias', () => {
    const { scales: _omit, ...old } = fresh();
    expect(scalesOf(boss, old as BattleState)).toBe(4);
  });

  it('com escamas o dano cai 30%; cada acerto arranca uma; a Técnica arranca duas', () => {
    let b = fresh();
    const first = hit(b, 3);
    expect(first.turn.damage).toBe(Math.round(38 * 0.7)); // 27
    expect(first.turn.scalesTorn).toBe(1);
    expect(first.battle.scales).toBe(3);
    b = first.battle;
    const second = hit(b, 3);
    expect(second.battle.scales).toBe(2);
    const third = hit(second.battle, 3); // 3º acerto seguido: Técnica
    expect(third.turn.technique).toBe(true);
    expect(third.turn.scalesTorn).toBe(2);
    expect(third.battle.scales).toBe(0);
    expect(third.turn.armorBroke).toBe(true);
    expect(third.battle.armorBroken).toBe(true);
  });

  it('sem escamas o Leviatã fica exposto: +50% de dano', () => {
    let b = fresh();
    for (let i = 0; i < 4; i++) b = hit(b, 1).battle; // 1 + 1 + Técnica(2) → 0
    expect(b.scales).toBe(0);
    expect(scalesMultiplier(boss, b)).toBe(1.5);
    const r = hit({ ...b, combo: 0 }, 3);
    expect(r.turn.damage).toBe(Math.round(38 * 1.5)); // 57, sem combo
    expect(r.turn.scalesTorn).toBeUndefined();
  });

  it('cada erro faz duas escamas crescerem de volta, até o máximo — e o custo é só da Determinação', () => {
    let b = hit(hit(fresh(), 2).battle, 2).battle; // 2 escamas
    const m = miss(b);
    expect(m.battle.scales).toBe(4);
    expect(m.turn.scalesRegrown).toBe(2);
    expect(m.turn.healed).toBe(0);
    expect(m.battle.resolve).toBe(boss.resolve - 1);
    const again = miss(m.battle);
    expect(again.battle.scales).toBe(4);
    expect(again.turn.scalesRegrown).toBeUndefined();
    b = hit(fresh(), 2).battle; // 3 escamas: cresce só 1
    expect(miss(b).battle.scales).toBe(4);
    expect(miss(b).turn.scalesRegrown).toBe(1);
  });

  it('exposto, um erro cobre o Leviatã de novo; a fase 2 só começa uma vez', () => {
    let b = fresh();
    b = hit(b, 1).battle;
    b = hit(b, 1).battle;
    const t = hit(b, 1); // Técnica: arranca 2, zera
    expect(t.turn.armorBroke).toBe(true);
    const m = miss(t.battle);
    expect(m.battle.scales).toBe(2);
    expect(m.battle.armorBroken).toBe(true);
    expect(scalesMultiplier(boss, m.battle)).toBe(0.7);
    const a = hit(m.battle, 1);
    const b2 = hit(a.battle, 1);
    expect(b2.battle.scales).toBe(0);
    expect(b2.turn.armorBroke).toBe(false);
  });

  it('o acerto final termina a batalha mesmo com escamas', () => {
    const b = { ...fresh(), hp: 5 };
    const r = hit(b, 3);
    expect(r.battle.hp).toBe(0);
    expect(r.battle.status).toBe('won');
  });
});
