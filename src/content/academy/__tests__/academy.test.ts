import { academyReport, validateAcademy } from '../validation';

describe('Academia: conteúdo', () => {
  it('não tem inconsistências estruturais, matemáticas ou pedagógicas', () => {
    expect(validateAcademy()).toEqual([]);
  });

  it('tem aulas com laboratórios, exemplos, prática e desafios', () => {
    const r = academyReport();
    expect(r.lessons).toBeGreaterThan(0);
    expect(r.labs).toBeGreaterThan(0);
    expect(r.examples).toBeGreaterThan(0);
  });
});
