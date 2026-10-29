import { getQuestion } from '../../content/bank';
import type { AltKey } from '../../content/types';
import { ALT_KEYS } from '../../content/types';
import {
  answerCurrent,
  completeOnboarding,
  createInitialState,
  finishSession,
  planEchoHunt,
  startSession,
  touch,
} from '../game/game';
import type { GameEvent, GameState } from '../game/types';
import {
  DAY_MS,
  ECHO_MAX_AGE_DAYS,
  MAX_ACTIVE_ECHOES,
  dueEchoIds,
  dueReviewIds,
  echoCount,
  echoesBeatenCount,
  echoesFadedCount,
  emptyQuestionState,
  retireOldEchoes,
  schedule,
  type QuestionState,
} from '../learning/srs';

const T0 = Date.UTC(2026, 9, 29, 15);

function onboarded(now = T0): GameState {
  return completeOnboarding(
    touch(createInitialState(now), now, 180).state,
    { name: 'Lia', goal: 'enem', dailyMinutes: 10, selfLevel: 'intermediario', examYear: null },
    now,
  ).state;
}

/** Eco ativo criado por um erro `ageDays` dias antes de T0. */
function echoAged(id: string, ageDays: number): QuestionState {
  return schedule(undefined, id, 'wrong', T0 - ageDays * DAY_MS, 'old');
}

const wrongKey = (qid: string): AltKey => ALT_KEYS.find((k) => k !== getQuestion(qid).answer) as AltKey;

describe('Ecos superados', () => {
  it('na partida: acertar um Eco o supera, emite o aviso na resposta e entra no resumo', () => {
    const qid = 'BAS-001';
    let state = onboarded();
    state = { ...state, questionStates: { [qid]: echoAged(qid, 0.1) } };
    state = startSession(state, { id: 's1', mode: 'expedition', nodeId: null, minutes: null, questionIds: [qid] }, T0).state;
    const r = answerCurrent(state, { attemptId: 'a1', chosen: getQuestion(qid).answer, guessed: false, hints: 0, timeMs: 20_000 }, T0);
    const answered = r.events.find((e): e is Extract<GameEvent, { type: 'answered' }> => e.type === 'answered')!;
    expect(answered.correct).toBe(true);
    expect(answered.echoOvercome).toBe(true);
    expect(answered.kind).toBe('practice'); // ainda não tinha voltado: XP de treino, sem redenção
    expect(r.state.questionStates[qid]).toMatchObject({ echo: false, echoBeaten: 1, echoBeatenAt: T0 });
    expect(echoCount(r.state.questionStates)).toBe(0);
    expect(echoesBeatenCount(r.state.questionStates)).toBe(1);
    const fin = finishSession(r.state, T0 + 1000);
    const summary = (fin.events.find((e) => e.type === 'sessionComplete') as Extract<GameEvent, { type: 'sessionComplete' }>).summary;
    expect(summary.overcame).toEqual([qid]);
    expect(summary.redemptions).toEqual([]);
  });

  it('errar um Eco continua sendo um Eco; acertar uma questão comum não conta como superado', () => {
    const echoId = 'BAS-001';
    const plainId = 'BAS-004';
    let state = onboarded();
    state = { ...state, questionStates: { [echoId]: echoAged(echoId, 0.1) } };
    state = startSession(state, { id: 's1', mode: 'expedition', nodeId: null, minutes: null, questionIds: [echoId, plainId] }, T0).state;
    const miss = answerCurrent(state, { attemptId: 'a1', chosen: wrongKey(echoId), guessed: false, hints: 0, timeMs: 20_000 }, T0);
    expect(miss.state.questionStates[echoId]).toMatchObject({ echo: true, echoBeaten: 0 });
    const hit = answerCurrent(miss.state, { attemptId: 'a2', chosen: getQuestion(plainId).answer, guessed: false, hints: 0, timeMs: 20_000 }, T0 + 1000);
    const answered = hit.events.find((e): e is Extract<GameEvent, { type: 'answered' }> => e.type === 'answered')!;
    expect(answered.echoOvercome).toBe(false);
  });
});

describe('Ecos antigos se dissipam', () => {
  it('dissipa Ecos com mais de 21 dias e guarda os recentes; a agenda da questão não muda', () => {
    const old = echoAged('A-1', ECHO_MAX_AGE_DAYS + 1);
    const edge = echoAged('A-2', ECHO_MAX_AGE_DAYS - 1);
    const fresh = echoAged('A-3', 2);
    const states = { 'A-1': old, 'A-2': edge, 'A-3': fresh };
    const out = retireOldEchoes(states, T0);
    expect(out.map((s) => s.questionId)).toEqual(['A-1']);
    expect(out[0]).toMatchObject({ echo: false, echoFadedAt: T0, dueAt: old.dueAt, box: old.box, wrong: old.wrong });
    expect(retireOldEchoes({ ...states, 'A-1': out[0] }, T0)).toEqual([]);
  });

  it('respeita o teto de Ecos ativos: acima dele, os mais antigos se dissipam primeiro', () => {
    const states: Record<string, QuestionState> = {};
    const total = MAX_ACTIVE_ECHOES + 7;
    for (let i = 0; i < total; i++) states[`Q-${i}`] = echoAged(`Q-${i}`, 10 - i * 0.1); // todos recentes; Q-0 é o mais antigo
    const out = retireOldEchoes(states, T0);
    expect(out).toHaveLength(7);
    expect(out.map((s) => s.questionId).sort()).toEqual(Array.from({ length: 7 }, (_, i) => `Q-${i}`).sort());
  });

  it('um Eco dissipado volta a ser Eco se a questão for errada de novo, e não é contado como superado', () => {
    const faded = retireOldEchoes({ x: echoAged('x', 40) }, T0)[0];
    expect(echoesFadedCount({ x: faded })).toBe(1);
    expect(echoesBeatenCount({ x: faded })).toBe(0);
    const again = schedule(faded, 'x', 'wrong', T0 + 1000, 's');
    expect(again).toMatchObject({ echo: true, echoFadedAt: null });
    expect(echoesFadedCount({ x: again })).toBe(0);
  });

  it('ao abrir o app, os Ecos antigos se dissipam uma única vez e o jogador é avisado', () => {
    let state = onboarded(T0 - 30 * DAY_MS);
    state = { ...state, questionStates: { 'BAS-001': echoAged('BAS-001', 30), 'BAS-002': echoAged('BAS-002', 3) } };
    const r = touch(state, T0, 180);
    const faded = r.events.find((e): e is Extract<GameEvent, { type: 'echoesFaded' }> => e.type === 'echoesFaded');
    expect(faded?.count).toBe(1);
    expect(r.state.questionStates['BAS-001']).toMatchObject({ echo: false, echoFadedAt: T0 });
    expect(r.state.questionStates['BAS-002'].echo).toBe(true);
    // Reabrir logo depois não avisa de novo.
    expect(touch(r.state, T0 + 1000, 180).events.some((e) => e.type === 'echoesFaded')).toBe(false);
  });
});

describe('Caça aos Ecos', () => {
  it('traz primeiro os Ecos ativos que já voltaram e completa com revisões; nunca um Eco que ainda não venceu', () => {
    const wrongLongAgo = (id: string, days: number) => schedule(undefined, id, 'wrong', T0 - days * DAY_MS, 's');
    const states: Record<string, QuestionState> = {
      'BAS-001': wrongLongAgo('BAS-001', 5), // Eco devido
      'BAS-002': wrongLongAgo('BAS-002', 3), // Eco devido
      'BAS-003': schedule(undefined, 'BAS-003', 'wrong', T0 - 1000, 's'), // Eco que ainda não voltou
      'BAS-004': { ...emptyQuestionState('BAS-004'), seen: 2, correct: 2, box: 2, dueAt: T0 - 2 * DAY_MS }, // revisão devida
    };
    const base = onboarded();
    const state: GameState = { ...base, questionStates: states };
    expect(dueEchoIds(states, T0)).toEqual(['BAS-001', 'BAS-002']);
    expect(dueReviewIds(states, T0)).toEqual(['BAS-004']);
    expect(planEchoHunt(state, T0)).toEqual(['BAS-001', 'BAS-002', 'BAS-004']);
  });
});
