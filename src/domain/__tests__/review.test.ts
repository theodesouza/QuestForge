import { getQuestion } from '../../content/bank';
import { getBoss } from '../../content/bosses';
import { ALT_KEYS, type AltKey } from '../../content/types';
import { applyBattleAnswer, createBattle } from '../boss/battle';
import {
  answerCurrent,
  completeOnboarding,
  createInitialState,
  currentQuestionId,
  skipCurrent,
  startSession,
  touch,
} from '../game/game';
import { battleReviewItems, sessionReviewItems } from '../game/review';
import type { GameState } from '../game/types';

const T0 = Date.UTC(2026, 9, 29, 15);

function onboarded(): GameState {
  return completeOnboarding(
    touch(createInitialState(T0), T0, 180).state,
    { name: 'Lia', goal: 'enem', dailyMinutes: 10, selfLevel: 'intermediario', examYear: null },
    T0,
  ).state;
}
const wrongKey = (qid: string): AltKey => ALT_KEYS.find((k) => k !== getQuestion(qid).answer) as AltKey;
const IDS = ['BAS-001', 'BAS-002', 'BAS-003', 'BAS-004', 'BAS-005'];

describe('rever a questão anterior numa sessão', () => {
  it('lista só o que já foi respondido, com a alternativa escolhida e a posição na rota', () => {
    let s = startSession(onboarded(), { id: 's1', mode: 'expedition', nodeId: null, minutes: null, questionIds: IDS }, T0).state;
    expect(sessionReviewItems(s.session!, false)).toEqual([]);

    s = answerCurrent(s, { attemptId: 'a1', chosen: getQuestion('BAS-001').answer, guessed: false, hints: 1, timeMs: 10_000 }, T0).state;
    s = answerCurrent(s, { attemptId: 'a2', chosen: wrongKey('BAS-002'), guessed: false, hints: 0, timeMs: 10_000 }, T0 + 1000).state;
    const items = sessionReviewItems(s.session!, false);
    expect(items.map((i) => [i.questionId, i.position, i.correct, i.hints])).toEqual([
      ['BAS-001', 1, true, 1],
      ['BAS-002', 2, false, 0],
    ]);
    expect(items[1].chosen).toBe(wrongKey('BAS-002'));
  });

  it('com o feedback da questão à vista, ela própria não entra: "anterior" é a que veio antes', () => {
    let s = startSession(onboarded(), { id: 's1', mode: 'expedition', nodeId: null, minutes: null, questionIds: IDS }, T0).state;
    s = answerCurrent(s, { attemptId: 'a1', chosen: getQuestion('BAS-001').answer, guessed: false, hints: 0, timeMs: 10_000 }, T0).state;
    s = answerCurrent(s, { attemptId: 'a2', chosen: getQuestion('BAS-002').answer, guessed: false, hints: 0, timeMs: 10_000 }, T0 + 1000).state;
    expect(sessionReviewItems(s.session!, true).map((i) => i.questionId)).toEqual(['BAS-001']);
    expect(sessionReviewItems(s.session!, false).map((i) => i.questionId)).toEqual(['BAS-001', 'BAS-002']);
  });

  it('questões puladas não têm resposta para rever, e rever não altera a sessão', () => {
    let s = startSession(onboarded(), { id: 's1', mode: 'expedition', nodeId: null, minutes: null, questionIds: IDS }, T0).state;
    s = skipCurrent(s).state;
    expect(currentQuestionId(s.session!)).toBe('BAS-002');
    s = answerCurrent(s, { attemptId: 'a1', chosen: getQuestion('BAS-002').answer, guessed: false, hints: 0, timeMs: 10_000 }, T0).state;
    const before = JSON.stringify(s);
    const items = sessionReviewItems(s.session!, false);
    expect(items.map((i) => [i.questionId, i.position])).toEqual([['BAS-002', 2]]);
    expect(JSON.stringify(s)).toBe(before);
  });

  it('um Eco superado aparece marcado na revisão', () => {
    const qid = 'BAS-001';
    let s = onboarded();
    s = { ...s, questionStates: { [qid]: { ...(s.questionStates[qid] ?? ({} as never)), questionId: qid, box: 1, dueAt: T0 + 1000, seen: 1, correct: 0, wrong: 1, guessedCorrect: 0, lastAnsweredAt: T0 - 1000, lastCorrectAt: null, lastWrongAt: T0 - 1000, lastWrongSessionId: 'old', lastXpAt: null, echo: true, echoBeaten: 0, echoBeatenAt: null, echoFadedAt: null, favorite: false, flagged: false } } };
    s = startSession(s, { id: 's1', mode: 'expedition', nodeId: null, minutes: null, questionIds: [qid, 'BAS-002'] }, T0).state;
    s = answerCurrent(s, { attemptId: 'a1', chosen: getQuestion(qid).answer, guessed: false, hints: 0, timeMs: 10_000 }, T0).state;
    expect(sessionReviewItems(s.session!, false)[0].echoOvercome).toBe(true);
  });
});

describe('rever golpes numa batalha', () => {
  const boss = getBoss('golem-proporcional');
  const hit = (b: ReturnType<typeof createBattle>, qid: string, chosen: AltKey | undefined, correct: boolean) =>
    applyBattleAnswer(boss, { ...b, currentQuestionId: qid }, { questionId: qid, chosen, difficulty: 2, correct, guessed: false, hints: 0 }).battle;

  it('guarda a alternativa escolhida em cada golpe e lista os anteriores', () => {
    let b = createBattle(boss, 'b1', T0, 0);
    b = hit(b, 'RZP-001', 'B', true);
    b = hit(b, 'RZP-002', 'C', false);
    expect(b.turns.map((t) => t.chosen)).toEqual(['B', 'C']);
    expect(battleReviewItems(b, false).map((i) => [i.questionId, i.chosen, i.correct, i.position])).toEqual([
      ['RZP-001', 'B', true, 1],
      ['RZP-002', 'C', false, 2],
    ]);
    // Feedback do último golpe à vista: ele não entra na lista.
    expect(battleReviewItems(b, true).map((i) => i.questionId)).toEqual(['RZP-001']);
  });

  it('golpes de batalhas gravadas antes (sem alternativa guardada) simplesmente não entram', () => {
    let b = createBattle(boss, 'b1', T0, 0);
    b = hit(b, 'RZP-001', undefined, true);
    b = hit(b, 'RZP-002', 'D', true);
    expect(battleReviewItems(b, false).map((i) => i.questionId)).toEqual(['RZP-002']);
  });
});
