import { COURSES } from '../catalog';
import { academyCoverage, academyReport, distractorCoverage, validateAcademy, validateDistractorNotes } from '../validation';

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

  it('cobre todo o currículo: cada subtópico tem aula e cada questão do banco aponta para uma etapa do seu subtópico', () => {
    expect(academyCoverage()).toEqual({ subtopicsWithoutLesson: [], unmappedQuestions: [], badRefs: [], offSubtopic: [] });
  });

  it('explica todas as alternativas erradas do banco', () => {
    const d = distractorCoverage();
    expect(d.explained).toBe(d.wrongAlternatives);
  });

  it('toda aula termina numa etapa de maestria', () => {
    for (const c of COURSES) {
      expect(c.lessons.length).toBeGreaterThan(0);
      for (const l of c.lessons) expect(l.stages[l.stages.length - 1].kind).toBe('maestria');
    }
  });
});
