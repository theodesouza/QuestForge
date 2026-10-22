import { getQuestion, QUESTIONS } from '../../content/bank';
import {
  acknowledgeScaffold, answerCurrent, createInitialState, currentQuestionId, startSession,
} from '../game/game';
import type { GameState } from '../game/types';
import { scaffoldExample } from '../learning/scaffold';

const NOW = Date.UTC(2026, 9, 19, 18);

function scaffoldState(previousExamples: string[] = []): GameState {
  let state = startSession(createInitialState(NOW), {
    id: 'scaffold-lesson', mode: 'expedition', nodeId: null, minutes: null,
    questionIds: ['RZP-006', 'RZP-012', 'PCT-001'],
  }, NOW).state;
  if (previousExamples.length) state = { ...state, session: { ...state.session!, scaffoldExampleIds: previousExamples } };
  for (let i = 0; i < 2; i++) {
    const q = getQuestion(currentQuestionId(state.session!)!);
    state = answerCurrent(state, {
      attemptId: `wrong-${i}`, chosen: q.answer === 'A' ? 'B' : 'A', guessed: false, hints: 0, timeMs: 5000,
    }, NOW + i).state;
  }
  return state;
}

it('dois erros oferecem um exemplo distinto, relacionado ao reforço e fora da avaliação', () => {
  const state = scaffoldState();
  const lesson = state.session!.scaffoldLesson!;
  expect(lesson.sourceQuestionId).toBe('RZP-012');
  expect(lesson.practiceQuestionId).toBe(currentQuestionId(state.session!));
  expect(lesson.exampleQuestionId).not.toBe(lesson.sourceQuestionId);
  expect(state.session!.queue).not.toContain(lesson.exampleQuestionId);
  const example = getQuestion(lesson.exampleQuestionId);
  const practice = getQuestion(lesson.practiceQuestionId);
  expect(example.subtopic).toBe(practice.subtopic);
  expect(example.difficulty).toBeLessThanOrEqual(practice.difficulty);
});

it('ler o exemplo não altera aprendizado, tentativas, recompensas nem o planejamento', () => {
  const state = scaffoldState();
  const result = acknowledgeScaffold(state, state.session!.scaffoldLesson!.practiceQuestionId);
  expect(result.state).toEqual({ ...state, session: { ...state.session, scaffoldLesson: null } });
  expect(result.delta.attempts).toEqual([]);
  expect(result.delta.questionStates).toEqual([]);
  expect(result.events).toEqual([]);
  expect(result.delta.session).toBe(true);
  expect(acknowledgeScaffold(result.state, 'qualquer-id').state).toEqual(result.state);
});

it('depois do exemplo e da questão de reforço retorna à próxima questão planejada', () => {
  const state = scaffoldState();
  const practice = getQuestion(currentQuestionId(state.session!)!);
  const ready = acknowledgeScaffold(state, practice.id).state;
  const next = answerCurrent(ready, {
    attemptId: 'practice-answer', chosen: practice.answer, guessed: false, hints: 0, timeMs: 4000,
  }, NOW + 100).state;
  expect(currentQuestionId(next.session!)).toBe('PCT-001');
  expect(next.session!.scaffoldIds).toContain(practice.id);
  expect(next.questionStates[state.session!.scaffoldLesson!.exampleQuestionId]).toBeUndefined();
});

it('não revela uma questão futura nem usa outro subassunto quando falta exemplo', () => {
  const practice = getQuestion('RZP-001');
  const pool = QUESTIONS.filter(q => q.subtopic === practice.subtopic);
  expect(scaffoldExample(practice, pool.map(q => q.id))).toBeUndefined();
});

it('pode explicar no nível da questão errada antes de recuar para uma prática mais fácil', () => {
  const practice = getQuestion('RZP-212');
  const planned = QUESTIONS.filter(q => q.topic === practice.topic && q.subtopic === practice.subtopic && q.difficulty === 1).map(q => q.id);
  const example = scaffoldExample(practice, planned, 2);
  expect(example).toBeDefined();
  expect(example!.subtopic).toBe(practice.subtopic);
  expect(example!.difficulty).toBe(2);
  expect(planned).not.toContain(example!.id);
});

it('uma questão já mostrada como exemplo não volta como reforço avaliado nem como novo exemplo', () => {
  const exposedId = scaffoldState().session!.scaffoldLesson!.practiceQuestionId;
  const next = scaffoldState([exposedId]);
  expect(next.session!.scaffoldIds).toHaveLength(1);
  expect(next.session!.queue).not.toContain(exposedId);
  expect(next.session!.scaffoldLesson?.exampleQuestionId).not.toBe(exposedId);
});

it('uma sessão antiga sem aula pendente continua compatível e um toque antigo não libera outra aula', () => {
  const state = scaffoldState();
  expect(acknowledgeScaffold(state, 'old-practice').state).toEqual(state);
  const old = { ...state, session: { ...state.session! } };
  delete old.session.scaffoldLesson;
  expect(acknowledgeScaffold(old, currentQuestionId(old.session)!).state).toEqual(old);
});
