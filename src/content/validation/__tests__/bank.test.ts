import { QUESTIONS, questionsFor } from '../../bank';
import { BOSSES } from '../../bosses';
import { ITEMS } from '../../items';
import { REGIONS } from '../../regions';
import { LEVEL_ITEM_TABLE } from '../../../domain/progression/rewards';
import { bankReport, parseNumeric, validateBank, validateCatalog, validateQuestion } from '../validate';
import type { Question } from '../../types';

describe('parseNumeric', () => {
  it.each([
    ['R$ 1.250,00', 1250],
    ['12,5%', 12.5],
    ['≈ 15%', 15],
    ['3/8', 0.375],
    ['1 : 400.000', 400000],
    ['4 h 48 min', 4.8],
    ['2 h', 2],
    ['36 cm', 36],
    ['2.000', 2000],
    ['0,2 m²', 0.2],
  ])('%s → %d', (text, value) => {
    expect(parseNumeric(text)).toBeCloseTo(value, 9);
  });

  it('retorna null sem número', () => {
    expect(parseNumeric('igual ao inicial')).toBeNull();
  });
});

describe('banco de questões', () => {
  it('não tem nenhuma inconsistência estrutural ou matemática', () => {
    const issues = validateBank(QUESTIONS);
    expect(issues).toEqual([]);
  });

  it('tem gabaritos bem distribuídos entre A–E (nenhuma letra acima de 35%)', () => {
    const { answerDistribution, total } = bankReport(QUESTIONS);
    for (const k of ['A', 'B', 'C', 'D', 'E']) {
      expect((answerDistribution[k] ?? 0) / total).toBeLessThan(0.35);
    }
  });

  it('verifica automaticamente a grande maioria das questões', () => {
    const { verified, total } = bankReport(QUESTIONS);
    expect(verified / total).toBeGreaterThan(0.95);
  });

  it('cobre as quatro dificuldades', () => {
    const { byDifficulty } = bankReport(QUESTIONS);
    for (const d of [1, 2, 3, 4]) expect(byDifficulty[d]).toBeGreaterThan(0);
  });

  it('nenhuma questão autoral se apresenta como oficial', () => {
    for (const q of QUESTIONS) {
      expect(q.source.kind).toBe('autoral');
      expect(JSON.stringify(q.stem)).not.toMatch(/\(ENEM\s*\d{4}\)/i);
    }
  });

  it('cada missão tem questões suficientes, e o chefão tem pool amplo', () => {
    for (const region of REGIONS) {
      for (const node of region.nodes) {
        if (node.kind === 'mission') {
          const pool = questionsFor({ topics: node.topics, subtopics: node.subtopics });
          expect(pool.length).toBeGreaterThanOrEqual(node.questionCount + 2);
        }
      }
    }
    for (const boss of BOSSES) {
      expect(questionsFor({ topics: boss.topics, subtopics: boss.subtopics }).length).toBeGreaterThanOrEqual(20);
    }
  });
});

describe('validador detecta erros', () => {
  const base = QUESTIONS.find((q) => q.id === 'RZP-004') as Question;

  it('gabarito inconsistente com verify()', () => {
    const broken: Question = { ...base, answer: 'A' };
    expect(validateQuestion(broken).some((i) => i.message.includes('não corresponde'))).toBe(true);
  });

  it('duas alternativas com o valor correto', () => {
    const broken: Question = { ...base, alternatives: { ...base.alternatives, A: '5,0 xícaras' } };
    expect(validateQuestion(broken).some((i) => i.message.includes('mais de uma'))).toBe(true);
  });

  it('alternativas repetidas e IDs duplicados', () => {
    const dup: Question = { ...base, alternatives: { ...base.alternatives, A: base.alternatives.B } };
    expect(validateQuestion(dup).some((i) => i.message.includes('repetidas'))).toBe(true);
    expect(validateBank([base, base]).some((i) => i.message === 'ID duplicado')).toBe(true);
  });

  it('subassunto inexistente', () => {
    expect(validateQuestion({ ...base, subtopic: 'nada' }).length).toBeGreaterThan(0);
  });
});

describe('catálogos', () => {
  it('itens únicos e todos os itens de recompensa existem', () => {
    expect(validateCatalog()).toEqual([]);
    const ids = new Set(ITEMS.map((i) => i.id));
    for (const list of Object.values(LEVEL_ITEM_TABLE)) for (const id of list) expect(ids.has(id)).toBe(true);
    for (const b of BOSSES) {
      for (const id of [...b.rewards.firstItems, b.rewards.flawlessItem]) expect(ids.has(id)).toBe(true);
    }
  });
});
