/**
 * Reducers da Academia: (estado, entrada, agora) → { estado, eventos, delta }, como o resto
 * do jogo. Toda mudança de progresso educacional passa por aqui.
 */
import { LESSONS, getStage } from '../../content/academy/catalog';
import type { ExerciseDef, StageBody } from '../../content/academy/types';
import { challengePassed, planChallenge } from '../academy/challenge';
import {
  MAX_REVIEW_BOX,
  RETRY_REVIEW_DAYS,
  checkpointIds,
  emptyStageProgress,
  isReviewDue,
  learnComplete,
  lessonSealed,
  practiceStudied,
  reviewInterval,
  type StageProgress,
} from '../academy/progress';
import {
  ACADEMY_TITLES,
  MASTERED_REWARD,
  PRACTICED_REWARD,
  PRACTICE_MILESTONE,
  REVIEWED_REWARD,
  SEALED_REWARD,
  STUDIED_REWARD,
} from '../academy/rewards';
import { DAY_MS } from '../learning/srs';
import { grantInk, grantItem, grantXp, once } from './grant';
import { Tx } from './tx';
import type { GameState, Result } from './types';

function progressOf(tx: Tx, ref: string): StageProgress {
  return tx.state.academy[ref] ?? emptyStageProgress(ref);
}

/** Ids interativos de "Aprender" que podem ser registrados como concluídos. */
function learnIds(body: StageBody): Set<string> {
  const ids = new Set<string>();
  for (const b of body.learn) {
    if (b.kind === 'check') ids.add(b.exercise.id);
    else if (b.kind === 'example' || b.kind === 'reveal') ids.add(b.id);
    else if (b.kind === 'lab') ids.add(b.lab.id);
    else if (b.kind === 'sim') ids.add(b.sim.id);
  }
  return ids;
}

function findDef(list: ExerciseDef[], id: string): ExerciseDef | undefined {
  return list.find((e) => e.id === id);
}

function reward(tx: Tx, key: string, xp: number, ink: number, now: number): boolean {
  return once(tx, key, now, () => {
    grantXp(tx, xp, 'academy', now, false);
    grantInk(tx, ink);
  });
}

function markStudied(tx: Tx, p: StageProgress, now: number): StageProgress {
  if (p.studiedAt !== null) return p;
  const next = { ...p, studiedAt: now };
  if (reward(tx, `academy:${p.ref}:studied`, STUDIED_REWARD.xp, STUDIED_REWARD.ink, now)) {
    tx.emit({ type: 'academy', ref: p.ref, milestone: 'studied', xp: STUDIED_REWARD.xp, ink: STUDIED_REWARD.ink });
  }
  return next;
}

// ———————————————————————————————————————————————— visitar e estudar

export function academyView(state: GameState, ref: string, now: number): Result {
  getStage(ref);
  const tx = new Tx(state);
  const p = progressOf(tx, ref);
  tx.setStageProgress({ ...p, viewedAt: p.viewedAt ?? now, lastAt: now });
  return tx.done();
}

export interface LearnInput {
  ref: string;
  /** Blocos revelados até agora. */
  pos?: number;
  /** Uma atividade de "Aprender" concluída (verificação, exemplo, laboratório…). */
  done?: { id: string; correct?: boolean; answerId?: string };
}

export function academyLearn(state: GameState, input: LearnInput, now: number): Result {
  const { stage } = getStage(input.ref);
  const body = stage.body();
  const tx = new Tx(state);
  let p = progressOf(tx, input.ref);
  p = { ...p, viewedAt: p.viewedAt ?? now, lastAt: now };
  if (input.pos !== undefined) {
    if (!Number.isInteger(input.pos) || input.pos < 0) throw new Error('Posição inválida');
    p.learnPos = Math.max(p.learnPos, Math.min(input.pos, body.learn.length));
  }
  if (input.done) {
    if (!learnIds(body).has(input.done.id)) throw new Error(`Atividade desconhecida: ${input.done.id}`);
    if (!p.checks.includes(input.done.id)) p.checks = [...p.checks, input.done.id];
    const isCheck = body.learn.some((b) => b.kind === 'check' && b.exercise.id === input.done?.id);
    if (isCheck && input.done.answerId) {
      tx.addAcademyAnswer({
        id: input.done.answerId,
        ref: input.ref,
        exerciseId: input.done.id,
        mode: 'check',
        correct: !!input.done.correct,
        hints: 0,
        createdAt: now,
      });
    }
  }
  if (learnComplete(body, p)) p = markStudied(tx, p, now);
  tx.setStageProgress(p);
  return tx.done();
}

// ———————————————————————————————————————————————— praticar

export interface PracticeInput {
  ref: string;
  exerciseId: string;
  correct: boolean;
  hints: number;
  answerId: string;
}

export function academyPractice(state: GameState, input: PracticeInput, now: number): Result {
  const { stage } = getStage(input.ref);
  const body = stage.body();
  if (!findDef(body.practice, input.exerciseId)) throw new Error(`Exercício desconhecido: ${input.exerciseId}`);
  if (!Number.isInteger(input.hints) || input.hints < 0) throw new Error('Dicas inválidas');
  const tx = new Tx(state);
  const prev = progressOf(tx, input.ref);
  const unaided = input.correct && input.hints === 0;
  let p: StageProgress = {
    ...prev,
    viewedAt: prev.viewedAt ?? now,
    lastAt: now,
    practice: {
      answered: prev.practice.answered + 1,
      correct: prev.practice.correct + (input.correct ? 1 : 0),
      unaided: prev.practice.unaided + (unaided ? 1 : 0),
      helped: prev.practice.helped + (input.hints > 0 ? 1 : 0),
      seen: prev.practice.seen.includes(input.exerciseId) ? prev.practice.seen : [...prev.practice.seen, input.exerciseId],
    },
  };
  tx.addAcademyAnswer({
    id: input.answerId,
    ref: input.ref,
    exerciseId: input.exerciseId,
    mode: 'practice',
    correct: input.correct,
    hints: input.hints,
    createdAt: now,
  });
  const helpedCorrect = p.practice.correct - p.practice.unaided;
  if (p.practice.unaided + helpedCorrect / 2 >= PRACTICE_MILESTONE) {
    if (reward(tx, `academy:${input.ref}:practiced`, PRACTICED_REWARD.xp, PRACTICED_REWARD.ink, now)) {
      tx.emit({ type: 'academy', ref: input.ref, milestone: 'practiced', xp: PRACTICED_REWARD.xp, ink: PRACTICED_REWARD.ink });
    }
  }
  if (practiceStudied(p)) p = markStudied(tx, p, now);
  tx.setStageProgress(p);
  return tx.done();
}

// ———————————————————————————————————————————————— desafiar (e manter o domínio)

export interface ChallengeStartInput {
  ref: string;
  runId: string;
  seed: number;
}

/** Começa (ou retoma) um desafio. Uma tentativa em andamento é mantida: nada se perde ao sair. */
export function academyStartChallenge(state: GameState, input: ChallengeStartInput, now: number): Result {
  const { stage } = getStage(input.ref);
  const body = stage.body();
  if (body.challenge.length === 0) throw new Error('Etapa sem desafio');
  const tx = new Tx(state);
  const prev = progressOf(tx, input.ref);
  const running = prev.challenge.run;
  if (running && running.answers.length < running.items.length) return tx.done();
  const items = planChallenge(body, prev.challenge.lastIds, input.seed);
  tx.setStageProgress({
    ...prev,
    viewedAt: prev.viewedAt ?? now,
    lastAt: now,
    challenge: {
      ...prev.challenge,
      run: { id: input.runId, review: isReviewDue(prev, now), items, answers: [], startedAt: now },
    },
  });
  return tx.done();
}

export interface ChallengeAnswerInput {
  ref: string;
  runId: string;
  exerciseId: string;
  correct: boolean;
  answerId: string;
}

export function academyChallengeAnswer(state: GameState, input: ChallengeAnswerInput, now: number): Result {
  const { stage, lesson } = getStage(input.ref);
  const tx = new Tx(state);
  const prev = progressOf(tx, input.ref);
  const run = prev.challenge.run;
  if (!run || run.id !== input.runId) throw new Error('Nenhum desafio em andamento');
  const expected = run.items[run.answers.length];
  if (!expected) throw new Error('Desafio já concluído');
  if (expected.exerciseId !== input.exerciseId) throw new Error('Problema fora de ordem');

  tx.addAcademyAnswer({
    id: input.answerId,
    ref: input.ref,
    exerciseId: input.exerciseId,
    mode: 'challenge',
    correct: input.correct,
    hints: 0,
    createdAt: now,
  });
  const answers = [...run.answers, { exerciseId: input.exerciseId, correct: input.correct }];
  let p: StageProgress = { ...prev, lastAt: now, challenge: { ...prev.challenge, run: { ...run, answers } } };

  if (answers.length === run.items.length) {
    const correct = answers.filter((a) => a.correct).length;
    const total = answers.length;
    const passed = challengePassed(correct, total);
    p.challenge = {
      runs: prev.challenge.runs + 1,
      passes: prev.challenge.passes + (passed ? 1 : 0),
      best: Math.max(prev.challenge.best, correct / total),
      lastIds: run.items.map((i) => i.exerciseId),
      run: null,
    };
    if (passed && p.masteredAt === null) {
      p = { ...p, masteredAt: now, box: 1, dueAt: now + reviewInterval(1) };
      if (p.studiedAt === null) p.studiedAt = now;
      const r = MASTERED_REWARD[stage.kind];
      if (reward(tx, `academy:${input.ref}:mastered`, r.xp, r.ink, now)) {
        tx.emit({ type: 'academy', ref: input.ref, milestone: 'mastered', xp: r.xp, ink: r.ink });
      }
    } else if (passed && run.review) {
      const box = Math.min(MAX_REVIEW_BOX, p.box + 1);
      p = { ...p, box, dueAt: now + reviewInterval(box) };
      if (reward(tx, `academy:${input.ref}:review${box}`, REVIEWED_REWARD.xp, REVIEWED_REWARD.ink, now)) {
        tx.emit({ type: 'academy', ref: input.ref, milestone: 'reviewed', xp: REVIEWED_REWARD.xp, ink: REVIEWED_REWARD.ink });
      }
    } else if (!passed && run.review && p.masteredAt !== null) {
      // Revisão que não deu certo: o domínio continua registrado, mas a revisão volta logo.
      p = { ...p, box: 1, dueAt: now + RETRY_REVIEW_DAYS * DAY_MS };
    }
    tx.setStageProgress(p);
    if (passed) afterMastery(tx, lesson.id, now);
    return tx.done();
  }
  tx.setStageProgress(p);
  return tx.done();
}

/** Desiste do desafio em andamento: sem penalidade (a próxima tentativa sorteia de novo). */
export function academyAbandonChallenge(state: GameState, ref: string): Result {
  getStage(ref);
  const tx = new Tx(state);
  const p = progressOf(tx, ref);
  if (p.challenge.run) tx.setStageProgress({ ...p, challenge: { ...p.challenge, run: null } });
  return tx.done();
}

/** Insígnia da aula e títulos da Academia. */
function afterMastery(tx: Tx, lessonId: string, now: number) {
  const lesson = LESSONS.find((l) => l.id === lessonId);
  if (lesson && lessonSealed(lesson, tx.state.academy)) {
    once(tx, `academy:seal:${lesson.id}`, now, () => {
      grantXp(tx, SEALED_REWARD.xp, 'academy', now, false);
      grantInk(tx, SEALED_REWARD.ink);
      tx.emit({ type: 'academy', ref: '', milestone: 'sealed', xp: SEALED_REWARD.xp, ink: SEALED_REWARD.ink, lessonId: lesson.id });
    });
  }
  const mastered = Object.values(tx.state.academy).filter((p) => p.masteredAt !== null).length;
  const seals = LESSONS.filter((l) => lessonSealed(l, tx.state.academy)).length;
  if (mastered >= 1) grantItem(tx, ACADEMY_TITLES.firstMastery, 'academia', now);
  if (mastered >= ACADEMY_TITLES.manyMastered.count) grantItem(tx, ACADEMY_TITLES.manyMastered.itemId, 'academia', now);
  if (seals >= ACADEMY_TITLES.seals.count) grantItem(tx, ACADEMY_TITLES.seals.itemId, 'academia', now);
  if (LESSONS.length > 0 && seals === LESSONS.length) grantItem(tx, ACADEMY_TITLES.allSeals, 'academia', now);
}

/** Etapas cujo "Aprender" está completo (para a interface marcar a conclusão). */
export function learnCheckpoints(ref: string): string[] {
  return checkpointIds(getStage(ref).stage.body());
}
