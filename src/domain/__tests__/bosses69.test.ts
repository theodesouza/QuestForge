import { getBoss } from '../../content/bosses';
import { getRegion } from '../../content/regions';
import { getTopic } from '../../content/topics';
import { applyBattleAnswer, battleTarget, createBattle, hydraHeadsOf, hydraRegen, isRiddleTurn, riddleEvery, scalesMultiplier, scalesOf, turnsToRiddle, type BattleState, type BattleTurn } from '../boss/battle';
import { nodeStatus } from '../campaign/campaign';

const T0 = Date.UTC(2026, 9, 30, 15);

const win = (id: string) => ({ bossId: id, attempts: 1, wins: 1, failedSinceWin: 0, firstWinAt: T0, flawless: false, bestTurns: 7 });
const done = (ids: string[]) => Object.fromEntries(ids.map((id) => [id, { nodeId: id, completedAt: T0, bestCorrect: 5, runs: 1, bestScore: 900, bestStars: 3, lastScore: 900 }]));

describe('Atlas: Regiões 6 a 9 (estrutura)', () => {
  const regions = [
    { id: 'observatorio-dados', index: 6, prefix: 'r6', boss: 'leviata-dos-graficos', after: 'r5-boss' },
    { id: 'labirinto-acaso', index: 7, prefix: 'r7', boss: 'esfinge-do-acaso', after: 'r6-boss' },
    { id: 'cordilheira-funcoes', index: 8, prefix: 'r8', boss: 'hidra-das-funcoes', after: 'r7-boss' },
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

// ———————————————————————————————————————————————— Esfinge do Acaso

describe('Esfinge do Acaso: Enigma', () => {
  const boss = getBoss('esfinge-do-acaso');
  const filler = (n: number): BattleTurn[] =>
    Array.from({ length: n }, (_, i) => ({ questionId: `q${i}`, correct: true, guessed: false, hints: 0, damage: 10, technique: false, armorBroke: false }));
  /** Batalha parada no golpe n + 1 (n golpes já dados), sem combo. */
  const at = (n: number, extra: Partial<BattleState> = {}): BattleState => ({ ...createBattle(boss, 'c', T0, 0), currentQuestionId: 'Q', turns: filler(n), ...extra });
  const hit = (b: BattleState, difficulty: 1 | 2 | 3 | 4 = 3) => applyBattleAnswer(boss, b, { questionId: 'Q', difficulty, correct: true, guessed: false, hints: 0 });
  const miss = (b: BattleState) => applyBattleAnswer(boss, b, { questionId: 'Q', difficulty: 2, correct: false, guessed: false, hints: 0 });

  it('o Enigma vem a cada 4 golpes e, na fase 2, a cada 3', () => {
    expect(boss.trait.kind).toBe('riddle');
    expect([0, 1, 2, 3, 4, 5, 6, 7].map((n) => isRiddleTurn(boss, at(n)))).toEqual([false, false, false, true, false, false, false, true]);
    expect(riddleEvery(boss, at(0))).toBe(4);
    expect(riddleEvery(boss, at(0, { armorBroken: true }))).toBe(3);
    expect([0, 1, 2, 3, 4, 5].map((n) => isRiddleTurn(boss, at(n, { armorBroken: true })))).toEqual([false, false, true, false, false, true]);
    expect([0, 1, 2, 3, 4].map((n) => turnsToRiddle(boss, at(n)))).toEqual([3, 2, 1, 0, 3]);
    expect(isRiddleTurn(getBoss('golem-proporcional'), at(3))).toBe(false);
    expect(turnsToRiddle(getBoss('golem-proporcional'), at(3))).toBe(0);
  });

  it('o Enigma pede uma questão um nível mais difícil (até 4)', () => {
    expect(battleTarget(boss, at(0))).toBe(2);
    expect(battleTarget(boss, at(3))).toBe(boss.startTarget + 3 * boss.targetStep + 1);
    expect(battleTarget(boss, at(31))).toBe(4);
  });

  it('acertar o Enigma amplia o dano em 50%; um golpe comum não muda', () => {
    const normal = hit(at(2), 3);
    expect(normal.turn.damage).toBe(38);
    expect(normal.turn.riddle).toBeUndefined();
    const enigma = hit(at(3), 3);
    expect(enigma.turn.damage).toBe(57);
    expect(enigma.turn.riddle).toBe(true);
    expect(enigma.battle.resolve).toBe(boss.resolve);
  });

  it('errar o Enigma custa 2 de Determinação; um erro comum, 1', () => {
    const normal = miss(at(1));
    expect(normal.battle.resolve).toBe(boss.resolve - 1);
    expect(normal.turn.riddle).toBeUndefined();
    const enigma = miss(at(3));
    expect(enigma.battle.resolve).toBe(boss.resolve - 2);
    expect(enigma.turn.riddle).toBe(true);
    expect(enigma.turn.healed).toBe(0);
    expect(enigma.battle.status).toBe('active');
  });

  it('errar o Enigma com 1 ponto de Determinação encerra a batalha, sem passar de zero', () => {
    const r = miss(at(3, { resolve: 1 }));
    expect(r.battle.resolve).toBe(0);
    expect(r.battle.status).toBe('retreated');
    const last = miss(at(3, { resolve: 2 }));
    expect(last.battle.resolve).toBe(0);
    expect(last.battle.status).toBe('retreated');
  });

  it('a fase 2 começa com a vida abaixo de 50% e antecipa o Enigma', () => {
    const b = at(1, { hp: Math.round(boss.maxHp * 0.5) + 10 });
    const r = hit(b, 3);
    expect(r.battle.hp).toBeLessThanOrEqual(boss.maxHp * 0.5);
    expect(r.turn.armorBroke).toBe(true);
    expect(isRiddleTurn(boss, r.battle)).toBe(true); // 2 golpes dados, 3º golpe com período 3
  });

  it('a Técnica no Enigma soma o bônus depois da ampliação', () => {
    const r = hit(at(3, { combo: 2 }), 3); // 3º acerto seguido: Técnica, combo ×1,3
    expect(r.turn.technique).toBe(true);
    expect(r.turn.damage).toBe(Math.round(38 * 1.3 * 1.5) + boss.technique.bonus);
  });
});

// ———————————————————————————————————————————————— Hidra das Funções

describe('Hidra das Funções: Cabeças que Renascem', () => {
  const boss = getBoss('hidra-das-funcoes');
  const fresh = (extra: Partial<BattleState> = {}): BattleState => ({ ...createBattle(boss, 'c', T0, 0), currentQuestionId: 'Q', ...extra });
  const hit = (b: BattleState, difficulty: 1 | 2 | 3 | 4 = 3) => applyBattleAnswer(boss, { ...b, currentQuestionId: 'Q' }, { questionId: 'Q', difficulty, correct: true, guessed: false, hints: 0 });
  const miss = (b: BattleState) => applyBattleAnswer(boss, { ...b, currentQuestionId: 'Q' }, { questionId: 'Q', difficulty: 2, correct: false, guessed: false, hints: 0 });
  const regen = boss.trait.kind === 'hydra' ? boss.trait.regenPerHead : 0;

  it('começa sem cabeças novas; outros chefões não têm cabeças de Hidra', () => {
    expect(boss.trait.kind).toBe('hydra');
    expect(fresh().hydraHeads).toBe(0);
    expect(createBattle(getBoss('golem-proporcional'), 'x', T0, 0).hydraHeads).toBeUndefined();
    expect(hydraRegen(getBoss('golem-proporcional'), fresh())).toBe(0);
    const { hydraHeads: _omit, ...old } = fresh();
    expect(hydraHeadsOf(old as BattleState)).toBe(0);
  });

  it('o 1º erro faz nascer uma cabeça, que já regenera a Hidra no mesmo golpe', () => {
    const b = fresh({ hp: 300 });
    const m = miss(b);
    expect(m.battle.hydraHeads).toBe(1);
    expect(m.turn.headGrown).toBe(true);
    expect(m.turn.healed).toBe(regen);
    expect(m.battle.hp).toBe(300 + regen);
    expect(m.battle.resolve).toBe(boss.resolve - 1);
  });

  it('as cabeças se acumulam até o máximo e a regeneração cresce com elas', () => {
    let b = fresh({ hp: 300, resolve: 9, maxResolve: 9 });
    const seen: number[] = [];
    for (let i = 0; i < 5; i++) {
      const r = miss(b);
      b = r.battle;
      seen.push(r.battle.hydraHeads ?? -1);
    }
    expect(seen).toEqual([1, 2, 3, 3, 3]);
    expect(hydraRegen(boss, b)).toBe(3 * regen);
  });

  it('cada acerto sem Técnica deixa as cabeças regenerarem a Hidra', () => {
    const b = fresh({ hp: 300, hydraHeads: 2 });
    const r = hit(b, 3);
    expect(r.turn.technique).toBe(false);
    expect(r.turn.damage).toBe(38);
    expect(r.turn.healed).toBe(2 * regen);
    expect(r.battle.hp).toBe(300 - 38 + 2 * regen);
    expect(r.battle.hydraHeads).toBe(2);
  });

  it('a Técnica cauteriza uma cabeça antes da regeneração', () => {
    const b = fresh({ hp: 300, hydraHeads: 2, combo: 2 });
    const r = hit(b, 3);
    expect(r.turn.technique).toBe(true);
    expect(r.turn.headCut).toBe(true);
    expect(r.battle.hydraHeads).toBe(1);
    expect(r.turn.healed).toBe(regen);
    const none = hit(fresh({ hp: 300, hydraHeads: 0, combo: 2 }), 3);
    expect(none.turn.headCut).toBeUndefined();
    expect(none.turn.healed).toBe(0);
  });

  it('a regeneração nunca passa da vida máxima', () => {
    const r = miss(fresh({ hp: boss.maxHp - 3, hydraHeads: 2 }));
    expect(r.battle.hp).toBe(boss.maxHp);
    expect(r.turn.healed).toBe(3);
  });

  it('o acerto final termina a batalha sem regeneração', () => {
    const r = hit(fresh({ hp: 10, hydraHeads: 3 }), 3);
    expect(r.battle.hp).toBe(0);
    expect(r.battle.status).toBe('won');
    expect(r.turn.healed).toBe(0);
  });

  it('com a vida abaixo de 40% os pescoços secam: sem cabeças, sem regeneração e sem novas cabeças', () => {
    const b = fresh({ hp: Math.round(boss.maxHp * 0.4) + 10, hydraHeads: 3 });
    const r = hit(b, 3);
    expect(r.battle.hp).toBeLessThanOrEqual(boss.maxHp * 0.4);
    expect(r.turn.armorBroke).toBe(true);
    expect(r.battle.hydraHeads).toBe(0);
    expect(r.turn.healed).toBe(0);
    expect(r.battle.hp).toBe(Math.round(boss.maxHp * 0.4) + 10 - 38);
    const m = miss(r.battle);
    expect(m.battle.hydraHeads).toBe(0);
    expect(m.turn.healed).toBe(0);
    expect(m.turn.headGrown).toBeUndefined();
    expect(hydraRegen(boss, r.battle)).toBe(0);
  });
});
