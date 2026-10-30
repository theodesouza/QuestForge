/**
 * Progresso individual em cada etapa da Academia. Distingue o que foi **visto** (abriu a
 * etapa), **estudado** (percorreu a explicação e respondeu às verificações, ou praticou com
 * aproveitamento) e **dominado** (resolveu o desafio sem nenhuma ajuda). Domínio também é
 * revisado no tempo: etapas dominadas voltam para uma revisão rápida em intervalos crescentes.
 */
import { findStage, stageRef } from '../../content/academy/catalog';
import type { Course, Lesson, StageBody } from '../../content/academy/types';
import { DAY_MS } from '../learning/srs';

export interface ChallengeRun {
  id: string;
  /** Revisão espaçada de uma etapa já dominada (vale para manter o domínio). */
  review: boolean;
  items: { exerciseId: string; seed: number }[];
  answers: { exerciseId: string; correct: boolean }[];
  startedAt: number;
}

export interface StageProgress {
  ref: string;
  viewedAt: number | null;
  studiedAt: number | null;
  /** Verificações e passos interativos de "Aprender" já respondidos (ids). */
  checks: string[];
  /** Quantos blocos de "Aprender" já foram revelados (retomada). */
  learnPos: number;
  /** Prática: respostas, acertos, acertos sem dica, respostas com dica e exercícios já vistos. */
  practice: { answered: number; correct: number; unaided: number; helped: number; seen: string[] };
  challenge: {
    runs: number;
    passes: number;
    /** Melhor aproveitamento (0–1) num desafio. */
    best: number;
    /** Exercícios da última tentativa (a próxima evita repeti-los). */
    lastIds: string[];
    run: ChallengeRun | null;
  };
  masteredAt: number | null;
  /** Caixa de revisão (0 = ainda não dominada; 1–4 = revisões em 3, 7, 16 e 35 dias). */
  box: number;
  dueAt: number | null;
  lastAt: number | null;
}

export function emptyStageProgress(ref: string): StageProgress {
  return {
    ref,
    viewedAt: null,
    studiedAt: null,
    checks: [],
    learnPos: 0,
    practice: { answered: 0, correct: 0, unaided: 0, helped: 0, seen: [] },
    challenge: { runs: 0, passes: 0, best: 0, lastIds: [], run: null },
    masteredAt: null,
    box: 0,
    dueAt: null,
    lastAt: null,
  };
}

export type StageStatus = 'novo' | 'visto' | 'estudado' | 'dominado';

export const STAGE_STATUS_LABEL: Record<StageStatus, string> = {
  novo: 'Não iniciada',
  visto: 'Vista',
  estudado: 'Estudada',
  dominado: 'Dominada',
};

export function stageStatus(p: StageProgress | undefined): StageStatus {
  if (!p) return 'novo';
  if (p.masteredAt !== null) return 'dominado';
  if (p.studiedAt !== null) return 'estudado';
  if (p.viewedAt !== null) return 'visto';
  return 'novo';
}

/** Intervalo (dias) até a próxima revisão de uma etapa dominada, por caixa. */
export const REVIEW_DAYS = [0, 3, 7, 16, 35] as const;
export const MAX_REVIEW_BOX = 4;
/** Revisão que falhou volta logo (amanhã) para uma nova chance. */
export const RETRY_REVIEW_DAYS = 1;

export function reviewInterval(box: number): number {
  return REVIEW_DAYS[Math.max(1, Math.min(MAX_REVIEW_BOX, box))] * DAY_MS;
}

export function isReviewDue(p: StageProgress | undefined, now: number): boolean {
  return !!p && p.masteredAt !== null && p.dueAt !== null && p.dueAt <= now;
}

// ———————————————————————————————————————————————— "Aprender": verificações

/** Ids que precisam ser respondidos para o "Aprender" contar como estudado. */
export function checkpointIds(body: StageBody): string[] {
  const ids: string[] = [];
  for (const b of body.learn) {
    if (b.kind === 'check') ids.push(b.exercise.id);
    if (b.kind === 'example' && b.steps.some((s) => s.ask)) ids.push(b.id);
  }
  return ids;
}

/** Percorreu toda a explicação e respondeu a todas as verificações (certo ou errado). */
export function learnComplete(body: StageBody, p: StageProgress): boolean {
  const done = new Set(p.checks);
  return p.learnPos >= body.learn.length && checkpointIds(body).every((id) => done.has(id));
}

/** Praticar também conta como estudo: ao menos 3 respostas com 2 acertos. */
export const PRACTICE_STUDY = { answered: 3, correct: 2 } as const;

export function practiceStudied(p: StageProgress): boolean {
  return p.practice.answered >= PRACTICE_STUDY.answered && p.practice.correct >= PRACTICE_STUDY.correct;
}

// ———————————————————————————————————————————————— resumos

export interface ProgressSummary {
  stages: number;
  viewed: number;
  studied: number;
  mastered: number;
  reviewsDue: number;
}

function summarize(refs: string[], academy: Record<string, StageProgress>, now: number): ProgressSummary {
  const out: ProgressSummary = { stages: refs.length, viewed: 0, studied: 0, mastered: 0, reviewsDue: 0 };
  for (const ref of refs) {
    const status = stageStatus(academy[ref]);
    if (status !== 'novo') out.viewed++;
    if (status === 'estudado' || status === 'dominado') out.studied++;
    if (status === 'dominado') out.mastered++;
    if (isReviewDue(academy[ref], now)) out.reviewsDue++;
  }
  return out;
}

export function lessonRefs(lesson: Lesson): string[] {
  return lesson.stages.map((s) => stageRef(lesson.id, s.id));
}

export function lessonSummary(lesson: Lesson, academy: Record<string, StageProgress>, now: number): ProgressSummary {
  return summarize(lessonRefs(lesson), academy, now);
}

export function courseSummary(course: Course, academy: Record<string, StageProgress>, now: number): ProgressSummary {
  return summarize(course.lessons.flatMap(lessonRefs), academy, now);
}

/** Insígnia de domínio: todas as etapas da aula dominadas. */
export function lessonSealed(lesson: Lesson, academy: Record<string, StageProgress>): boolean {
  return lessonRefs(lesson).every((ref) => academy[ref]?.masteredAt != null);
}

/**
 * Onde continuar uma aula: a etapa mais recente ainda não dominada; se não houver
 * atividade, a primeira não dominada; com tudo dominado, uma revisão pendente ou a primeira.
 */
export function continueStage(lesson: Lesson, academy: Record<string, StageProgress>, now: number): string {
  const refs = lessonRefs(lesson);
  const due = refs.find((r) => isReviewDue(academy[r], now));
  const open = refs.filter((r) => stageStatus(academy[r]) !== 'dominado');
  if (open.length === 0) return due ?? refs[0];
  const recent = open
    .filter((r) => academy[r]?.lastAt != null)
    .sort((a, b) => (academy[b].lastAt ?? 0) - (academy[a].lastAt ?? 0))[0];
  return recent ?? open[0];
}

/** Última etapa em que o estudante mexeu (para "continuar de onde parou"). */
export function lastActiveStage(academy: Record<string, StageProgress>): StageProgress | null {
  let best: StageProgress | null = null;
  for (const p of Object.values(academy)) {
    if (p.lastAt === null || !findStage(p.ref)) continue;
    if (!best || p.lastAt > (best.lastAt ?? 0)) best = p;
  }
  return best;
}
