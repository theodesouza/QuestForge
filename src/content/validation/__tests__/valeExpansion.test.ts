import { QUESTIONS } from '../../bank';
import { GOLEM_EXTRA, VALE_MISSIONS } from '../../questions/expansion/vale';
import { REGIONS } from '../../regions';
import { ALT_KEYS, type Question } from '../../types';
import { parseNumeric, validateBank } from '../validate';

const all = [...Object.values(VALE_MISSIONS).flat(), ...GOLEM_EXTRA];
const byId = new Map(all.map(q => [q.id, q]));
const signature = (q: Question) => JSON.stringify(q.stem).normalize('NFC').toLowerCase() + q.ask.normalize('NFC').toLowerCase();

// Resultados obtidos dos enunciados durante a revisão, sem chamar verify().
const missionResults = [
  1.5, 120, 88, 1 / 3, 48, 1, 4.2, 56, 0.02, 3,
  25, 500, 0.5, 390, 20000, 60, 75, 5, 1400 / 3, 160,
  15, 40, 108, 30, 10.8, 3, 20, 12, 15, 30,
  60, 7, 345.6, 27, 1.25, 15, 6, 14.4, 3, 14,
  42, 35, 30, 4800, 24, 56.7, 30, 15, 459, 560,
  35, 30, 50, 54, 100, 10, 100, 340, 240 / 23, 3750 / 19,
];
const golemResults = [
  2 / 3, 63, 720, 120, 6, 300, 70, 3, 180, 30,
  32, 60, 100, 36, 200, 72, 8, 7, 43.2, 16,
  350, 36, 28, 20, 540, 780, 1500, 100, 400, 140 / 3,
  300, 56, 30, 100 / 9, 20, 25, 300 / 7, 50 / 3, 720, 40,
  80 / 3, 80, 30, 20, 100, 90, 300 / 19, 25 / 3, 7500 / 23, 300,
];
const expected = [
  ...missionResults.map((value, i) => [`VAM-${String(i + 1).padStart(3, '0')}`, value] as const),
  ...golemResults.map((value, i) => [`VAG-${String(i + 1).padStart(3, '0')}`, value] as const),
];

describe('expansão do Vale das Proporções', () => {
  it('acrescenta exatamente 20 questões por missão e 50 para o Golem', () => {
    expect(Object.keys(VALE_MISSIONS)).toEqual(['r1-m1', 'r1-m2', 'r1-m3']);
    for (const [id, questions] of Object.entries(VALE_MISSIONS)) {
      const mission = REGIONS[0].nodes.find(node => node.id === id);
      if (mission?.kind !== 'mission') throw new Error(`Missão ausente: ${id}`);
      expect(questions).toHaveLength(20);
      for (const q of questions) {
        expect(mission.topics).toContain(q.topic);
        expect(mission.subtopics).toContain(q.subtopic);
      }
    }
    expect(GOLEM_EXTRA).toHaveLength(50);
    expect(all).toHaveLength(110);
    expect(expected).toHaveLength(110);
    expect(new Set(all.map(q => q.id)).size).toBe(110);
  });

  it('mantém conteúdo completo, autoral e distinto do banco original', () => {
    expect(validateBank(all)).toEqual([]);
    expect(new Set(all.map(signature)).size).toBe(110);
    const originalSignatures = new Set(QUESTIONS.filter(q => !byId.has(q.id)).map(signature));
    for (const q of all) {
      expect(originalSignatures.has(signature(q))).toBe(false);
      expect(q.source.kind).toBe('autoral');
      expect(q.hints).toHaveLength(2);
      expect(q.hints[0]).not.toBe(q.hints[1]);
      expect(q.solution.every(step => typeof step !== 'string' && step.explanation.length > 0 && step.calculation.length > 0)).toBe(true);
      const values = ALT_KEYS.map(key => parseNumeric(q.alternatives[key]));
      expect(values.every(value => value !== null && Number.isFinite(value))).toBe(true);
      for (let i = 0; i < values.length; i++) {
        for (let j = i + 1; j < values.length; j++) {
          expect(Math.abs(values[i]! - values[j]!)).toBeGreaterThan(q.tolerance ?? 1e-9);
        }
      }
    }
    expect(new Set(all.map(q => q.difficulty))).toEqual(new Set([1, 2, 3, 4]));
    for (const key of ALT_KEYS) expect(all.filter(q => q.answer === key)).toHaveLength(22);
  });

  it('identifica escalas e proporcionalidade com as habilidades específicas', () => {
    for (const q of all.filter(q => q.topic === 'razao-proporcao' && q.subtopic !== 'razao')) {
      expect(q.skills).toContain(q.subtopic === 'escala' ? 'H11' : 'H16');
    }
    for (const id of ['VAM-019', 'VAM-039', 'VAG-024', 'VAG-042', 'VAG-049']) {
      expect(byId.get(id)?.skills).toContain('H21');
    }
  });

  it.each(expected)('%s coincide com a solução independente e tem um único gabarito numérico', (id, result) => {
    const q = byId.get(id)!;
    expect(q).toBeDefined();
    expect(q.verify).toBeDefined();
    expect(q.verify!()).toBeCloseTo(result, 7);
    const tolerance = q.tolerance ?? 1e-8;
    const matches = ALT_KEYS.filter(key => Math.abs(parseNumeric(q.alternatives[key])! - result) <= tolerance);
    expect(matches).toEqual([q.answer]);
  });
});
