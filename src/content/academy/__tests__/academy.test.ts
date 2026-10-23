import { academyReport, validateAcademy, validateDistractorNotes } from '../validation';

describe('Academia: conteúdo', () => {
  it('não tem inconsistências estruturais, matemáticas ou pedagógicas', () => {
    expect(validateAcademy()).toEqual([]);
  });

  it('as notas das alternativas erradas do banco são válidas (nunca na correta, nunca citam letras)', () => {
    expect(validateDistractorNotes()).toEqual([]);
  });

  it('tem aulas com laboratórios, exemplos, prática e desafios', () => {
    const r = academyReport();
    expect(r.lessons).toBeGreaterThan(0);
    expect(r.labs).toBeGreaterThan(0);
    expect(r.examples).toBeGreaterThan(0);
  });
});
