import { MERCADO_MISSIONS, MERCADOR_EXTRA } from '../../questions/expansion/mercado';
import { REGIONS } from '../../regions';
import { ALT_KEYS } from '../../types';
import { validateBank } from '../validate';

const all = [...Object.values(MERCADO_MISSIONS).flat(), ...MERCADOR_EXTRA];

describe('expansão do Mercado de Âmbar', () => {
  it('acrescenta 20 questões compatíveis por missão e 50 para o Mercador', () => {
    expect(Object.keys(MERCADO_MISSIONS)).toEqual(['r2-m1', 'r2-m2', 'r2-m3']);
    for (const [id, questions] of Object.entries(MERCADO_MISSIONS)) {
      const mission = REGIONS[1].nodes.find(node => node.id === id);
      expect(mission?.kind).toBe('mission');
      if (mission?.kind !== 'mission') throw new Error(`Missão ausente: ${id}`);
      expect(questions).toHaveLength(20);
      for (const q of questions) {
        expect(mission.topics).toContain(q.topic);
        expect(mission.subtopics).toContain(q.subtopic);
      }
    }
    expect(MERCADOR_EXTRA).toHaveLength(50);
    expect(all).toHaveLength(110);
  });

  it('valida estrutura, unicidade e todos os resultados numéricos', () => {
    expect(validateBank(all)).toEqual([]);
    expect(new Set(all.map(q => JSON.stringify(q.stem) + q.ask)).size).toBe(110);
    for (const q of all) {
      expect(q.verify).toBeDefined();
      expect(q.solution.some(step => typeof step !== 'string' && step.calculation.length > 0)).toBe(true);
      expect(q.source.kind).toBe('autoral');
    }
  });

  it('distribui os gabaritos igualmente sem depender da posição', () => {
    for (const key of ALT_KEYS) expect(all.filter(q => q.answer === key)).toHaveLength(22);
    expect(new Set(all.map(q => q.difficulty))).toEqual(new Set([1, 2, 3, 4]));
  });
});
