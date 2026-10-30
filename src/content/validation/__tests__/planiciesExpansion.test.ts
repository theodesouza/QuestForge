import { PLANICIES_MISSIONS, QUIMERA_EXTRA } from '../../questions/expansion/planicies';
import { ALT_KEYS } from '../../types';
import { bankReport, parseNumeric, validateBank } from '../validate';

const all = [...Object.values(PLANICIES_MISSIONS).flat(), ...QUIMERA_EXTRA];

// Resultados obtidos ao resolver cada enunciado, sem usar seus gabaritos ou verify().
const independentlySolved = {
  PLM: [
    7 / 12, 7 / 12, 3 / 10, 6, 1 / 30,
    2, 18, 19.5, 30, 48,
    1 / 2, 3, 15, 41 / 12, 3 / 10,
    4, 1 / 5, 14, 72, 1,
    24, 12, 7, 60, 8,
    6, 108, 20, 7, 40,
    37, 24, 4, 8, 24,
    84, 16, 60, 144, 2,
    81, 256, 25, 81, 0.001,
    0.00045, 620000, 384, 60000000, 300,
    1.5, 0, 4, 1000, 3950000,
    8192, 5, -5, 140, 27,
  ],
  PLQ: [
    5 / 24, -75, 1 / 12, 5, 0,
    27, 1, 17 / 12, 3 / 10, 2,
    5 / 12, 22, 160, 40, 1 / 6,
    10, 1 / 3, 12, 1 / 60, 13,
    13, 90, 66, 3, 2,
    24, 2, 35, 33, 108,
    2, 900, 68, 2, 31,
    1, 5, 3 / 8, 54, 405,
    0.03, 4500000, 1500000, 7e-8, 5,
    8, 0.003, 100000, 8, 40,
  ],
};

const solvedCases = Object.entries(independentlySolved).flatMap(([prefix, results]) =>
  results.map((expected, index) => ({ id: `${prefix}-${String(index + 1).padStart(3, '0')}`, expected })),
);

describe('expansão das Planícies Numéricas', () => {
  it('acrescenta exatamente 20 itens por missão e 50 à Quimera', () => {
    expect(Object.keys(PLANICIES_MISSIONS)).toEqual(['r3-m1', 'r3-m2', 'r3-m3']);
    for (const questions of Object.values(PLANICIES_MISSIONS)) expect(questions).toHaveLength(20);
    expect(QUIMERA_EXTRA).toHaveLength(50);
    expect(all).toHaveLength(110);
    expect(new Set(all.map(q => q.id)).size).toBe(110);
  });

  it('valida estrutura, cálculos e unicidade numérica das respostas', () => {
    expect(validateBank(all)).toEqual([]);
    for (const question of all) {
      expect(question.verify).toBeDefined();
      expect(question.solution.some(step => typeof step !== 'string')).toBe(true);
    }
  });

  it.each(solvedCases)('$id corresponde à solução independente e tem uma única alternativa equivalente', ({ id, expected }) => {
    const question = all.find(q => q.id === id)!;
    const tolerance = Math.max(1e-15, Math.abs(expected) * 1e-12);
    expect(Math.abs(question.verify!() - expected)).toBeLessThanOrEqual(tolerance);
    const equivalent = ALT_KEYS.filter(key => {
      const numeric = parseNumeric(question.alternatives[key]);
      return numeric !== null && Math.abs(numeric - expected) <= tolerance;
    });
    expect(equivalent).toEqual([question.answer]);
  });

  it('classifica representações, padrões, decisões e conversões pela habilidade exercitada', () => {
    for (const [id, skill] of [
      ['PLM-001', 'H1'], ['PLM-027', 'H2'], ['PLM-008', 'H3'], ['PLM-005', 'H4'],
      ['PLQ-007', 'H5'], ['PLM-060', 'H7'], ['PLQ-044', 'H10'], ['PLQ-041', 'H12'],
    ]) {
      expect(all.find(q => q.id === id)?.skills).toContain(skill);
    }
  });

  it('equilibra as letras e cobre dificuldades e as três cabeças', () => {
    const report = bankReport(all);
    for (const key of ALT_KEYS) expect(report.answerDistribution[key]).toBe(22);
    for (const difficulty of [1, 2, 3, 4]) expect(report.byDifficulty[difficulty]).toBeGreaterThan(0);
    for (const topics of [['fracoes', 'operacoes'], ['mmc-mdc'], ['potencias', 'notacao-cientifica']]) {
      expect(QUIMERA_EXTRA.filter(q => topics.includes(q.subtopic)).length).toBeGreaterThanOrEqual(15);
    }
  });

  it('recalcula problemas de contagem e divisão inteira com seus limites', () => {
    expect(all.find(q => q.id === 'PLM-012')?.verify?.()).toBe(3);
    expect(all.find(q => q.id === 'PLM-022')?.verify?.()).toBe(12);
    expect(all.find(q => q.id === 'PLM-024')?.verify?.()).toBe(60);
  });
});
