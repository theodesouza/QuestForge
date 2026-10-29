import { getBoss } from '../../content/bosses';
import { getRegion } from '../../content/regions';
import { getTopic } from '../../content/topics';
import {
  allFacetsCracked,
  applyBattleAnswer,
  concreteLayers,
  concreteMultiplier,
  crackedFacetCount,
  createBattle,
  facetHitsOf,
  facetMultiplier,
  facetOf,
  isFacetCracked,
  nextFacet,
  type BattleState,
} from '../boss/battle';
import { nodeStatus } from '../campaign/campaign';

const T0 = Date.UTC(2026, 9, 29, 15);

const win = (id: string) => ({ bossId: id, attempts: 1, wins: 1, failedSinceWin: 0, firstWinAt: T0, flawless: false, bestTurns: 7 });
const done = (ids: string[]) => Object.fromEntries(ids.map((id) => [id, { nodeId: id, completedAt: T0, bestCorrect: 5, runs: 1, bestScore: 900, bestStars: 3, lastScore: 900 }]));

describe('Atlas: Regiões 4 e 5', () => {
  it('a Região 4 abre com o fim da 3 e a 5 com o fim da 4; cada chefão só depois das três missões', () => {
    const r3 = ['golem-proporcional', 'mercador-composto', 'quimera-fracionaria'].map(win);
    const bosses = Object.fromEntries(r3.map((b) => [b.bossId, b]));
    const r4 = getRegion('torres-euclidianas');
    const r5 = getRegion('cavernas-volumetricas');
    expect([r4.index, r5.index]).toEqual([4, 5]);
    expect(r4.nodes.map((n) => n.id)).toEqual(['r4-m1', 'r4-m2', 'r4-m3', 'r4-boss']);
    expect(r5.nodes.map((n) => n.id)).toEqual(['r5-m1', 'r5-m2', 'r5-m3', 'r5-boss']);
    expect(nodeStatus(r4.nodes[0], { progress: {}, bosses: { 'golem-proporcional': bosses['golem-proporcional'] } })).toBe('locked');
    expect(nodeStatus(r4.nodes[0], { progress: {}, bosses })).toBe('available');
    expect(nodeStatus(r4.nodes[3], { progress: {}, bosses })).toBe('locked');
    expect(nodeStatus(r4.nodes[3], { progress: done(['r4-m1', 'r4-m2', 'r4-m3']), bosses })).toBe('available');
    const withR4 = { ...bosses, 'colosso-euclidiano': win('colosso-euclidiano') };
    expect(nodeStatus(r5.nodes[0], { progress: {}, bosses })).toBe('locked');
    expect(nodeStatus(r5.nodes[0], { progress: {}, bosses: withR4 })).toBe('available');
    expect(nodeStatus(r5.nodes[3], { progress: done(['r5-m1', 'r5-m2', 'r5-m3']), bosses: withR4 })).toBe('available');
  });

  it('cada missão usa só subassuntos que existem no assunto dela', () => {
    for (const id of ['torres-euclidianas', 'cavernas-volumetricas']) {
      for (const n of getRegion(id).nodes) {
        if (n.kind !== 'mission') continue;
        const known = n.topics.flatMap((t) => getTopic(t).subtopics.map((s) => s.id));
        for (const s of n.subtopics) expect(known).toContain(s);
        expect(n.difficulty).toHaveLength(n.questionCount);
      }
    }
  });
});

// ———————————————————————————————————————————————— Colosso Euclidiano

describe('Colosso Euclidiano: Três Vértices', () => {
  const boss = getBoss('colosso-euclidiano');
  const fresh = (): BattleState => ({ ...createBattle(boss, 'c', T0, 0), currentQuestionId: 'Q' });
  const hit = (b: BattleState, subtopic: string, difficulty: 1 | 2 | 3 | 4 = 3) =>
    applyBattleAnswer(boss, { ...b, currentQuestionId: 'Q' }, { questionId: 'Q', difficulty, correct: true, guessed: false, hints: 0, subtopic });
  const miss = (b: BattleState, subtopic: string) =>
    applyBattleAnswer(boss, { ...b, currentQuestionId: 'Q' }, { questionId: 'Q', difficulty: 2, correct: false, guessed: false, hints: 0, subtopic });

  it('três vértices cobrem exatamente os seis subassuntos da região, sem repetição', () => {
    expect(boss.trait.kind).toBe('facets');
    if (boss.trait.kind !== 'facets') return;
    const covered = boss.trait.facets.flatMap((f) => f.subtopics).sort();
    expect(covered).toEqual(['angulos', 'areas', 'areas-compostas', 'circulo', 'pitagoras', 'semelhanca']);
    expect(new Set(covered).size).toBe(covered.length);
    const region = getRegion(boss.regionId);
    const taught = region.nodes.flatMap((n) => (n.kind === 'mission' ? n.subtopics : [])).sort();
    expect(covered).toEqual(taught);
    expect(boss.trait.hitsToCrack).toBe(2);
  });

  it('vértice intacto reduz o dano; o primeiro acerto aproxima da rachadura', () => {
    const b = fresh();
    expect(facetOf(boss, 'pitagoras')?.id).toBe('triangulos');
    expect(facetOf(boss, 'nada')).toBeNull();
    expect(facetMultiplier(boss, b, 'areas')).toBe(0.6);
    const r = hit(b, 'areas', 3);
    expect(r.turn.damage).toBe(Math.round(38 * 0.6)); // 23
    expect(r.turn.facet).toBe('areas');
    expect(r.turn.facetCracked).toBeUndefined();
    expect(facetHitsOf(r.battle)).toEqual({ areas: 1 });
    expect(r.turn.healed).toBe(0);
  });

  it('dois acertos racham o vértice para sempre: dano volta ao normal e erro não o reajusta mais', () => {
    let b = fresh();
    b = hit(b, 'areas').battle;
    const second = hit(b, 'areas-compostas'); // outro subassunto do mesmo vértice
    expect(second.turn.facetCracked).toBe('areas');
    expect(isFacetCracked(boss, second.battle, 'areas')).toBe(true);
    expect(crackedFacetCount(boss, second.battle)).toBe(1);
    expect(second.battle.armorBroken).toBe(false);
    // Vértice rachado: golpe sem redução (3º acerto seguido: combo ×1,3 e Técnica).
    const third = hit(second.battle, 'areas', 3);
    expect(third.turn.technique).toBe(true);
    expect(third.turn.damage).toBe(Math.round(38 * 1.3) + boss.technique.bonus);
    expect(third.turn.facetCracked).toBeUndefined();
    // Um erro nele não desfaz a rachadura.
    const m = miss(third.battle, 'areas');
    expect(m.turn.facetRepaired).toBeUndefined();
    expect(isFacetCracked(boss, m.battle, 'areas')).toBe(true);
    expect(m.battle.resolve).toBe(boss.resolve - 1);
  });

  it('um erro reajusta o vértice intacto (tira um acerto) — mas nunca abaixo de zero', () => {
    let b = hit(fresh(), 'circulo').battle;
    expect(facetHitsOf(b)).toEqual({ circulos: 1 });
    const m = miss(b, 'angulos');
    expect(m.turn.facetRepaired).toBe(true);
    expect(facetHitsOf(m.battle)).toEqual({ circulos: 0 });
    b = m.battle;
    const again = miss(b, 'circulo');
    expect(again.turn.facetRepaired).toBeUndefined();
    expect(facetHitsOf(again.battle)).toEqual({ circulos: 0 });
  });

  it('com os três vértices rachados o Colosso fica exposto uma única vez: fase 2 e +40% de dano', () => {
    let b = fresh();
    const seq = ['areas', 'areas', 'pitagoras', 'semelhanca', 'circulo'];
    const flags: boolean[] = [];
    for (const s of seq) {
      const r = hit(b, s, 1);
      flags.push(r.turn.armorBroke);
      b = r.battle;
    }
    expect(flags).toEqual([false, false, false, false, false]);
    expect(allFacetsCracked(boss, b)).toBe(false);
    const last = hit(b, 'angulos', 1);
    expect(last.turn.armorBroke).toBe(true);
    expect(last.turn.facetCracked).toBe('circulos');
    expect(last.battle.armorBroken).toBe(true);
    expect(allFacetsCracked(boss, last.battle)).toBe(true);
    expect(facetMultiplier(boss, last.battle, 'areas')).toBe(1.4);
    const next = hit(last.battle, 'areas', 3);
    expect(next.turn.armorBroke).toBe(false);
    expect(next.turn.damage).toBeGreaterThan(Math.round(38 * 1.4));
  });

  it('as perguntas fazem rodízio entre os vértices intactos e liberam tudo quando todos racham', () => {
    const b = fresh();
    if (boss.trait.kind !== 'facets') return;
    const ids = boss.trait.facets.map((f) => f.id);
    const turnsOf = (n: number): BattleState => ({ ...b, turns: Array.from({ length: n }, () => ({ questionId: 'Q', correct: true, guessed: false, hints: 0, damage: 1, technique: false, armorBroke: false })) });
    expect([0, 1, 2, 3].map((n) => nextFacet(boss, turnsOf(n))?.id)).toEqual([ids[0], ids[1], ids[2], ids[0]]);
    // Com o primeiro vértice rachado, o rodízio é entre os outros dois.
    const cracked = { ...turnsOf(2), facetHits: { areas: 2 } };
    expect([0, 1, 2, 3].map((n) => nextFacet(boss, { ...cracked, turns: turnsOf(n).turns })?.id)).toEqual([ids[1], ids[2], ids[1], ids[2]]);
    expect(nextFacet(boss, { ...b, facetHits: { areas: 2, triangulos: 2, circulos: 2 } })).toBeNull();
  });

  it('batalhas gravadas sem facetHits continuam funcionando', () => {
    const old: BattleState = { ...fresh() };
    delete old.facetHits;
    expect(facetHitsOf(old)).toEqual({});
    expect(hit(old, 'areas').battle.facetHits).toEqual({ areas: 1 });
  });
});

// ———————————————————————————————————————————————— Arquiteto dos Sólidos

describe('Arquiteto dos Sólidos: Concreto Fresco', () => {
  const boss = getBoss('arquiteto-dos-solidos');
  const fresh = (): BattleState => ({ ...createBattle(boss, 'a', T0, 0), currentQuestionId: 'Q' });
  const hit = (b: BattleState, difficulty: 1 | 2 | 3 | 4 = 3) =>
    applyBattleAnswer(boss, { ...b, currentQuestionId: 'Q' }, { questionId: 'Q', difficulty, correct: true, guessed: false, hints: 0, subtopic: 'volumes' });
  const miss = (b: BattleState) =>
    applyBattleAnswer(boss, { ...b, currentQuestionId: 'Q' }, { questionId: 'Q', difficulty: 2, correct: false, guessed: false, hints: 0, subtopic: 'volumes' });

  it('cada erro despeja uma camada, até três, sem curar o chefão', () => {
    let b = fresh();
    const seen: number[] = [];
    for (let i = 0; i < 3; i++) {
      const r = { ...miss({ ...b, resolve: 9, maxResolve: 9 }) };
      expect(r.turn.healed).toBe(0);
      expect(r.battle.hp).toBe(boss.maxHp);
      seen.push(concreteLayers(r.battle));
      b = { ...r.battle, resolve: 9 };
    }
    expect(seen).toEqual([1, 2, 3]);
    const capped = miss(b);
    expect(concreteLayers(capped.battle)).toBe(3);
    expect(capped.turn.layerAdded).toBeUndefined();
  });

  it('cada camada tira 20% do dano dos golpes comuns; acertos sozinhos não removem o concreto', () => {
    const b: BattleState = { ...fresh(), layers: 2 };
    expect(concreteMultiplier(boss, b)).toBeCloseTo(0.6, 12);
    const r = hit(b, 3);
    expect(r.turn.damage).toBe(Math.round(38 * 0.6));
    expect(concreteLayers(r.battle)).toBe(2);
    expect(r.turn.layersBroken).toBeUndefined();
    expect(concreteMultiplier(boss, { ...b, layers: 5 })).toBe(0); // nunca negativo
  });

  it('a Técnica (3 acertos seguidos) ignora as camadas, quebra todas e paga o bônus', () => {
    let b: BattleState = { ...fresh(), layers: 3 };
    b = hit(b, 3).battle;
    b = hit(b, 3).battle;
    expect(concreteLayers(b)).toBe(3);
    const t = hit(b, 3);
    expect(t.turn.technique).toBe(true);
    expect(t.turn.layersBroken).toBe(3);
    expect(concreteLayers(t.battle)).toBe(0);
    // Golpe cheio: 38 × combo 1,3 (3º acerto) + bônus da Técnica.
    expect(t.turn.damage).toBe(Math.round(38 * 1.3) + boss.technique.bonus);
  });

  it('um erro no meio quebra o combo: o concreto volta a pesar', () => {
    let b = hit(fresh()).battle;
    b = hit(b).battle;
    b = miss(b).battle;
    expect(b.combo).toBe(0);
    expect(concreteLayers(b)).toBe(1);
    const r = hit(b, 3);
    expect(r.turn.damage).toBe(Math.round(38 * 0.8));
  });

  it('abaixo de 50% de vida o concreto racha, some e para de se formar', () => {
    const b: BattleState = { ...fresh(), hp: Math.round(boss.maxHp * 0.5) + 10, layers: 2 };
    const r = hit(b, 4);
    expect(r.turn.armorBroke).toBe(true);
    expect(r.battle.armorBroken).toBe(true);
    expect(r.turn.layersBroken).toBe(2);
    expect(concreteLayers(r.battle)).toBe(0);
    const m = miss(r.battle);
    expect(concreteLayers(m.battle)).toBe(0);
    expect(m.turn.layerAdded).toBeUndefined();
  });

  it('batalhas gravadas sem `layers` continuam funcionando', () => {
    const old: BattleState = { ...fresh() };
    delete old.layers;
    expect(concreteLayers(old)).toBe(0);
    expect(concreteMultiplier(boss, old)).toBe(1);
  });
});
