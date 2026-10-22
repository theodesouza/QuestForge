import { findQuestion, QUESTIONS, questionsFor } from '../../bank';
import { BOSSES } from '../../bosses';
import { REGIONS } from '../../regions';
import { ADDITIONAL_BOSS_QUESTIONS, ADDITIONAL_MISSION_QUESTIONS, EXPANSION_QUESTIONS } from '../../questions/expansion';
import baseline from './fixtures/bank-before-expansion.json';

it('preserva as 314 questões antigas e adiciona exatamente 330 novas', () => {
  expect(EXPANSION_QUESTIONS).toHaveLength(330);
  expect(QUESTIONS).toHaveLength(baseline.total + 330);
  for (const id of baseline.ids) expect(findQuestion(id)).toBeDefined();
  for (const q of EXPANSION_QUESTIONS) expect(baseline.ids).not.toContain(q.id);
});

it('registra 20 extras por missão e 50 por chefe, todos elegíveis nas consultas reais', () => {
  for (const region of REGIONS) for (const node of region.nodes) if (node.kind === 'mission') {
    const added = ADDITIONAL_MISSION_QUESTIONS[node.id];
    expect(added).toHaveLength(20);
    const pool = new Set(questionsFor(node).map(q => q.id));
    for (const q of added) expect(pool.has(q.id)).toBe(true);
    expect(pool.size).toBeGreaterThanOrEqual(baseline.missions[node.id as keyof typeof baseline.missions] + 20);
  }
  for (const boss of BOSSES) {
    const added = ADDITIONAL_BOSS_QUESTIONS[boss.id];
    expect(added).toHaveLength(50);
    const pool = new Set(questionsFor(boss).map(q => q.id));
    for (const q of added) expect(pool.has(q.id)).toBe(true);
    expect(pool.size).toBeGreaterThanOrEqual(baseline.bosses[boss.id as keyof typeof baseline.bosses] + 50);
  }
});

it('não inclui enunciados duplicados nem trocas de números no mesmo texto', () => {
  const addedIds = new Set(EXPANSION_QUESTIONS.map(q => q.id));
  const seen = new Map<string, string>();
  const collisions: string[] = [];
  for (const q of QUESTIONS) {
    const key = JSON.stringify(q.stem).concat(q.ask).toLocaleLowerCase('pt-BR').replace(/\d+(?:[.,/]\d+)*/g, '#').replace(/\s+/g, ' ');
    const previous = seen.get(key);
    if (previous && (addedIds.has(previous) || addedIds.has(q.id))) collisions.push(`${previous}/${q.id}`);
    seen.set(key, q.id);
  }
  expect(collisions).toEqual([]);
});
