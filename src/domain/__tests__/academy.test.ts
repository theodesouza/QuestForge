import { getStage, questionsForStage, stagesForQuestion } from '../../content/academy/catalog';
import { instantiate } from '../../content/academy/kit/build';
import { challengePassed, planChallenge } from '../academy/challenge';
import { planStageDrill } from '../academy/drill';
import { classify, stageEvidence } from '../academy/evidence';
import { gradeChoice, gradeFill, gradeNumber, gradeOrder, parseUserNumber } from '../academy/grade';
import { checkpointIds, isReviewDue, lessonSealed, stageStatus } from '../academy/progress';
import { bossPrepBonus, recommendStages } from '../academy/recommend';
import { MASTERED_REWARD, STUDIED_REWARD } from '../academy/rewards';
import {
  academyAbandonChallenge,
  academyChallengeAnswer,
  academyLearn,
  academyPractice,
  academyStartChallenge,
  academyView,
} from '../game/academy';
import { completeOnboarding, createInitialState } from '../game/game';
import type { GameState } from '../game/types';
import { DAY_MS, emptyQuestionState } from '../learning/srs';

const T0 = Date.UTC(2026, 9, 14, 12);
const REF = 'fracoes/partes-do-todo';

function onboarded(): GameState {
  return completeOnboarding(
    createInitialState(T0),
    { name: 'Ana', goal: 'enem', dailyMinutes: 10, selfLevel: 'iniciante', examYear: null },
    T0,
  ).state;
}

/** Resolve um desafio inteiro, acertando ou não cada problema. */
function playChallenge(state: GameState, ref: string, correct: (i: number) => boolean, now: number, runId = 'run1') {
  let s = academyStartChallenge(state, { ref, runId, seed: 7 }, now).state;
  const run = s.academy[ref].challenge.run!;
  let last = { state: s, events: [] as ReturnType<typeof academyChallengeAnswer>['events'] };
  run.items.forEach((item, i) => {
    last = academyChallengeAnswer(s, { ref, runId, exerciseId: item.exerciseId, correct: correct(i), answerId: `${runId}-${i}` }, now + i);
    s = last.state;
  });
  return last;
}

describe('Academia: leitura de números digitados', () => {
  it.each([
    ['1.234,56', 1234.56],
    ['1234,56', 1234.56],
    ['0,375', 0.375],
    ['0.375', 0.375],
    ['1.500', 1500],
    ['2.5', 2.5],
    ['−3', -3],
    ['3/8', 0.375],
    ['2 1/4', 2.25],
    ['R$ 12,50', 12.5],
    ['15%', 15],
    ['36 cm', 36],
  ])('%s → %d', (raw, value) => {
    expect(parseUserNumber(raw)).toBeCloseTo(value, 9);
  });

  it('recusa o que não é número', () => {
    expect(parseUserNumber('')).toBeNull();
    expect(parseUserNumber('abc')).toBeNull();
    expect(parseUserNumber('1,2,3')).toBeNull();
    expect(parseUserNumber('3/0')).toBeNull();
  });
});

describe('Academia: correção', () => {
  const body = getStage('fracoes/partes-do-todo').stage.body();

  it('múltipla escolha devolve o feedback específico da alternativa errada', () => {
    const ex = body.practice[0];
    if (ex.kind !== 'choice') throw new Error('esperava múltipla escolha');
    const wrong = ex.options.findIndex((o) => !o.correct);
    expect(gradeChoice(ex, ex.options.findIndex((o) => o.correct)).correct).toBe(true);
    const g = gradeChoice(ex, wrong);
    expect(g.correct).toBe(false);
    expect(g.feedback).toBe(ex.options[wrong].feedback);
  });

  it('resposta numérica reconhece erros previstos e aceita fração ou decimal', () => {
    const ex = instantiate(body.practice[1], 3);
    if (ex.kind !== 'number') throw new Error('esperava numérico');
    expect(gradeNumber(ex, String(ex.answer).replace('.', ',')).correct).toBe(true);
    const w = ex.wrong![0];
    const g = gradeNumber(ex, String(w.value));
    expect(g.correct).toBe(false);
    expect(g.feedback).toBe(w.feedback);
  });

  it('ordenar e completar conferem cada posição', () => {
    const ordering = getStage('fracoes/equivalencia').stage.body().learn.find((b) => b.kind === 'check' && b.exercise.kind === 'order');
    if (!ordering || ordering.kind !== 'check' || ordering.exercise.kind !== 'order') throw new Error('sem ordenar');
    expect(gradeOrder(ordering.exercise, [0, 1, 2, 3, 4]).correct).toBe(true);
    expect(gradeOrder(ordering.exercise, [1, 0, 2, 3, 4])).toMatchObject({ correct: false, firstWrong: 0 });
    const filling = getStage('fracoes/operacoes').stage.body().learn.find((b) => b.kind === 'check' && b.exercise.kind === 'fill');
    if (!filling || filling.kind !== 'check' || filling.exercise.kind !== 'fill') throw new Error('sem completar');
    expect(gradeFill(filling.exercise, [0, 0]).correct).toBe(true);
    expect(gradeFill(filling.exercise, [1, 0])).toMatchObject({ correct: false, wrong: [0] });
  });
});

describe('Academia: visto → estudado → dominado', () => {
  it('abrir a etapa marca como vista, sem XP', () => {
    const r = academyView(onboarded(), REF, T0);
    expect(stageStatus(r.state.academy[REF])).toBe('visto');
    expect(r.state.profile.xp).toBe(0);
    expect(r.delta.academy).toEqual([REF]);
  });

  it('percorrer o Aprender e responder às verificações marca como estudada, com XP uma única vez', () => {
    const body = getStage(REF).stage.body();
    let s = onboarded();
    s = academyLearn(s, { ref: REF, pos: body.learn.length }, T0).state;
    expect(stageStatus(s.academy[REF])).toBe('visto');
    const checks = checkpointIds(body);
    expect(checks.length).toBeGreaterThan(0);
    let events: ReturnType<typeof academyLearn>['events'] = [];
    for (const id of checks) {
      const r = academyLearn(s, { ref: REF, done: { id, correct: false, answerId: `a-${id}` } }, T0 + 1);
      s = r.state;
      events = r.events;
    }
    expect(stageStatus(s.academy[REF])).toBe('estudado');
    expect(events.some((e) => e.type === 'academy' && e.milestone === 'studied')).toBe(true);
    expect(s.profile.xp).toBe(STUDIED_REWARD.xp);
    // Refazer não paga de novo.
    const again = academyLearn(s, { ref: REF, done: { id: checks[0], correct: true, answerId: 'b' } }, T0 + 2);
    expect(again.state.profile.xp).toBe(STUDIED_REWARD.xp);
  });

  it('rejeita atividades que não existem na etapa', () => {
    expect(() => academyLearn(onboarded(), { ref: REF, done: { id: 'inventado' } }, T0)).toThrow();
    expect(() => academyView(onboarded(), 'nada/nada', T0)).toThrow();
  });

  it('praticar com aproveitamento também conta como estudo; dica conta meio acerto para o marco', () => {
    const body = getStage(REF).stage.body();
    let s = onboarded();
    const ids = body.practice.map((e) => e.id);
    s = academyPractice(s, { ref: REF, exerciseId: ids[0], correct: true, hints: 1, answerId: 'p1' }, T0).state;
    s = academyPractice(s, { ref: REF, exerciseId: ids[1], correct: true, hints: 2, answerId: 'p2' }, T0).state;
    expect(s.academy[REF].practice).toMatchObject({ answered: 2, correct: 2, unaided: 0, helped: 2 });
    let r = academyPractice(s, { ref: REF, exerciseId: ids[2], correct: false, hints: 0, answerId: 'p3' }, T0);
    s = r.state;
    expect(stageStatus(s.academy[REF])).toBe('estudado');
    expect(r.events.some((e) => e.type === 'academy' && e.milestone === 'practiced')).toBe(false);
    s = academyPractice(s, { ref: REF, exerciseId: ids[2], correct: true, hints: 0, answerId: 'p4' }, T0).state;
    r = academyPractice(s, { ref: REF, exerciseId: ids[3], correct: true, hints: 0, answerId: 'p5' }, T0);
    expect(r.events.some((e) => e.type === 'academy' && e.milestone === 'practiced')).toBe(true);
    expect(r.delta.academyAnswers).toHaveLength(1);
  });

  it('dominar exige acertar o desafio inteiro, sem ajuda; paga uma vez e agenda a revisão', () => {
    const { stage } = getStage(REF);
    const failed = playChallenge(onboarded(), REF, (i) => i !== 0, T0);
    expect(stageStatus(failed.state.academy[REF])).not.toBe('dominado');
    expect(failed.state.academy[REF].challenge).toMatchObject({ runs: 1, passes: 0, run: null });

    const won = playChallenge(failed.state, REF, () => true, T0 + 10, 'run2');
    const p = won.state.academy[REF];
    expect(stageStatus(p)).toBe('dominado');
    expect(p.box).toBe(1);
    expect(p.dueAt).toBe(T0 + 10 + 2 + 3 * DAY_MS);
    expect(won.events.some((e) => e.type === 'academy' && e.milestone === 'mastered')).toBe(true);
    expect(won.state.profile.xp).toBe(MASTERED_REWARD[stage.kind].xp);
    expect(won.state.inventory['title-aprendiz']).toBeDefined();

    // Repetir o desafio antes da revisão: sem XP.
    const again = playChallenge(won.state, REF, () => true, T0 + 20, 'run3');
    expect(again.state.profile.xp).toBe(won.state.profile.xp);
    expect(again.state.academy[REF].box).toBe(1);
  });

  it('a nova tentativa evita repetir os problemas da anterior quando há outros', () => {
    const body = getStage(REF).stage.body();
    const first = planChallenge(body, [], 1).map((i) => i.exerciseId);
    const second = planChallenge(body, first, 2).map((i) => i.exerciseId);
    const fixedRepeats = second.filter((id) => first.includes(id) && body.challenge.find((e) => e.id === id)?.kind !== 'gen');
    expect(fixedRepeats.length).toBeLessThan(first.length);
  });

  it('desafio em andamento sobrevive e não aceita respostas fora de ordem', () => {
    let s = academyStartChallenge(onboarded(), { ref: REF, runId: 'r', seed: 3 }, T0).state;
    const run = s.academy[REF].challenge.run!;
    s = academyChallengeAnswer(s, { ref: REF, runId: 'r', exerciseId: run.items[0].exerciseId, correct: true, answerId: 'x0' }, T0).state;
    // Começar de novo retoma a mesma tentativa.
    const resumed = academyStartChallenge(s, { ref: REF, runId: 'outra', seed: 9 }, T0).state;
    expect(resumed.academy[REF].challenge.run!.id).toBe('r');
    expect(() =>
      academyChallengeAnswer(resumed, { ref: REF, runId: 'r', exerciseId: 'errado', correct: true, answerId: 'x1' }, T0),
    ).toThrow();
    expect(academyAbandonChallenge(resumed, REF).state.academy[REF].challenge.run).toBeNull();
  });

  it('revisão espaçada no prazo sobe a caixa; revisão que falha volta logo, sem apagar o domínio', () => {
    const mastered = playChallenge(onboarded(), REF, () => true, T0).state;
    const due = T0 + 4 * DAY_MS;
    expect(isReviewDue(mastered.academy[REF], due)).toBe(true);
    const reviewed = playChallenge(mastered, REF, () => true, due, 'rev1');
    expect(reviewed.state.academy[REF].box).toBe(2);
    expect(reviewed.events.some((e) => e.type === 'academy' && e.milestone === 'reviewed')).toBe(true);
    const later = due + 8 * DAY_MS;
    const failed = playChallenge(reviewed.state, REF, (i) => i > 0, later, 'rev2').state.academy[REF];
    expect(failed.masteredAt).not.toBeNull();
    expect(failed.box).toBe(1);
    expect(failed.dueAt).toBe(later + 2 + DAY_MS);
  });

  it('dominar todas as etapas da aula concede o selo', () => {
    const { lesson } = getStage(REF);
    let s = onboarded();
    let sealed = false;
    lesson.stages.forEach((st, k) => {
      const r = playChallenge(s, `${lesson.id}/${st.id}`, () => true, T0 + k * 100, `run-${k}`);
      s = r.state;
      sealed ||= r.events.some((e) => e.type === 'academy' && e.milestone === 'sealed');
    });
    expect(lessonSealed(lesson, s.academy)).toBe(true);
    expect(sealed).toBe(true);
    expect(s.ledger[`academy:seal:${lesson.id}`]).toBeDefined();
  });
});

describe('Academia: diagnóstico com evidências do Atlas', () => {
  const states = (entries: [string, Partial<ReturnType<typeof emptyQuestionState>>][]) =>
    Object.fromEntries(entries.map(([id, p]) => [id, { ...emptyQuestionState(id), seen: 1, ...p }]));

  it('classifica com honestidade: poucos dados não viram veredito', () => {
    expect(classify(0, 0, 0, 0)).toBe('sem-dados');
    expect(classify(1, 0, 1, 0)).toBe('poucos-dados');
    expect(classify(4, 1, 3, 0)).toBe('atencao');
    expect(classify(4, 2, 2, 0)).toBe('dificuldade');
    expect(classify(5, 0, 5, 0)).toBe('solido');
    expect(classify(4, 0, 1, 2)).toBe('em-construcao');
  });

  it('erros ainda não redimidos em questões ligadas a uma etapa indicam dificuldade', () => {
    const ref = 'fracoes/operacoes';
    const ids = questionsForStage(ref).filter((q) => q.weight === 1).map((q) => q.id);
    expect(ids.length).toBeGreaterThanOrEqual(3);
    const qs = states([
      [ids[0], { wrong: 1, echo: true, lastWrongAt: T0 }],
      [ids[1], { wrong: 1, echo: true, lastWrongAt: T0 }],
      [ids[2], { correct: 1, lastCorrectAt: T0 }],
    ]);
    const ev = stageEvidence(ref, qs);
    expect(ev.level).toBe('dificuldade');
    expect(ev.openIds.sort()).toEqual([ids[0], ids[1]].sort());

    const recs = recommendStages({ questionStates: qs, academy: {}, campaign: {}, bosses: {} }, T0);
    expect(recs[0]).toMatchObject({ ref, reason: 'dificuldade', action: 'estudar' });
  });

  it('erros da atividade que acabou apontam a etapa principal de cada questão', () => {
    const wrongIds = ['BAS-108', 'BAS-006'];
    const recs = recommendStages({ questionStates: {}, academy: {}, campaign: {}, bosses: {} }, T0, { wrongIds, where: 'nesta missão' });
    const refs = recs.filter((r) => r.reason === 'erros-recentes').map((r) => r.ref);
    expect(refs).toEqual(expect.arrayContaining([stagesForQuestion('BAS-108')[0], stagesForQuestion('BAS-006')[0]]));
    expect(recs[0].detail).toContain('nesta missão');
  });

  it('depois de estudar a etapa, a recomendação passa a ser testar no Atlas', () => {
    const ref = 'fracoes/operacoes';
    const ids = questionsForStage(ref).filter((q) => q.weight === 1).map((q) => q.id);
    const qs = states([
      [ids[0], { wrong: 1, echo: true, lastWrongAt: T0 }],
      [ids[1], { wrong: 1, echo: true, lastWrongAt: T0 }],
    ]);
    const studied = playChallenge(onboarded(), ref, () => true, T0 + DAY_MS).state;
    const recs = recommendStages({ questionStates: qs, academy: studied.academy, campaign: {}, bosses: {} }, T0 + DAY_MS + 10);
    expect(recs.find((r) => r.ref === ref)).toMatchObject({ action: 'testar' });
  });

  it('o treino dirigido traz primeiro os Ecos da etapa', () => {
    const ref = 'fracoes/operacoes';
    const ids = questionsForStage(ref).map((q) => q.id);
    const echo = ids[ids.length - 1];
    const qs = states([[echo, { wrong: 1, echo: true, lastWrongAt: T0 - 2 * DAY_MS, dueAt: T0 - DAY_MS, box: 1 }]]);
    const drill = planStageDrill(qs, ref, T0, 1);
    expect(drill[0]).toBe(echo);
    expect(new Set(drill).size).toBe(drill.length);
    expect(drill.length).toBe(5);
  });

  it('preparo da Academia só dá bônus contra chefões com etapas dominadas', () => {
    expect(bossPrepBonus('quimera-fracionaria', {})).toBe(0);
    const s = playChallenge(onboarded(), REF, () => true, T0).state;
    expect(bossPrepBonus('quimera-fracionaria', s.academy)).toBeGreaterThan(0);
    expect(bossPrepBonus('golem-proporcional', s.academy)).toBe(0);
  });

  it('regra de aprovação do desafio', () => {
    expect(challengePassed(3, 3)).toBe(true);
    expect(challengePassed(2, 3)).toBe(false);
    expect(challengePassed(3, 4)).toBe(true);
    expect(challengePassed(2, 4)).toBe(false);
  });
});
