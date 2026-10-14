/**
 * Encomendas diárias e semanais — objetivos curtos e alcançáveis.
 * Princípios (PROJECT_PLAN.md §2.8):
 * - recompensa automática ao cumprir: nada "expira sem resgatar";
 * - dia ou semana perdidos não zeram nada: o quadro só é trocado;
 * - metas proporcionais ao tempo diário escolhido pelo jogador;
 * - uma encomenda diária mira o assunto que o treinador recomenda.
 * Funções puras; a aplicação ao estado fica em game/quests.ts.
 */
import { QUESTIONS } from '../../content/bank';
import { subtopicLabel } from '../../content/topics';
import type { TopicId } from '../../content/types';
import { recommendFocus } from '../learning/recommend';
import type { QuestionState } from '../learning/srs';
import { createRng, hashString, shuffle } from '../util/random';

export type QuestPeriod = 'daily' | 'weekly';

export type QuestMetric =
  | 'answered'
  | 'correct'
  | 'correctHard'
  | 'redemptions'
  | 'studyMinutes'
  | 'sessions'
  | 'perfectSessions'
  | 'missions'
  | 'bossWins'
  | 'topicCorrect'
  | 'studyDays';

export interface QuestDef {
  id: string;
  metric: QuestMetric;
  target: number;
  title: string;
  /** Só para topicCorrect: assunto e subassunto exigidos. */
  topic?: TopicId;
  subtopic?: string;
  xp: number;
  ink: number;
}

export interface QuestBoard {
  period: QuestPeriod;
  /** Dia local (AAAA-MM-DD) ou semana (S-AAAA-MM-DD da segunda-feira). */
  key: string;
  quests: QuestDef[];
  progress: Record<string, number>;
  /** Dias locais com estudo nesta semana (só no quadro semanal). */
  days: string[];
  /** Tempo de estudo acumulado no período (para "estude por N minutos"). */
  studyMs: number;
}

export interface QuestsState {
  daily: QuestBoard | null;
  weekly: QuestBoard | null;
}

export const DAILY_REWARD = { xp: 25, ink: 10 } as const;
export const DAILY_BONUS = { xp: 20, ink: 15 } as const;
export const WEEKLY_REWARD = { xp: 80, ink: 40 } as const;
export const WEEKLY_BONUS = { xp: 100, ink: 60 } as const;
/** Título concedido na primeira semana completa. */
export const WEEKLY_FIRST_ITEM = 'title-constante';
/** Tempo máximo que uma resposta conta para "estude por N minutos" (evita contar o app aberto parado). */
export const STUDY_CAP_PER_ANSWER_MS = 5 * 60 * 1000;

const MINUTE = 60 * 1000;

// ———————————————————————————————————————————— calendário local

/** Dia local a partir do deslocamento de fuso (minutos, como Date#getTimezoneOffset). */
export function dayKey(now: number, tzOffsetMin: number): string {
  return new Date(now - tzOffsetMin * MINUTE).toISOString().slice(0, 10);
}

/** Semana local começando na segunda-feira. */
export function weekKey(now: number, tzOffsetMin: number): string {
  const local = new Date(now - tzOffsetMin * MINUTE);
  const dow = (local.getUTCDay() + 6) % 7; // 0 = segunda
  const monday = new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() - dow));
  return `S-${monday.toISOString().slice(0, 10)}`;
}

/** Os 7 dias (AAAA-MM-DD) da semana de uma chave semanal. */
export function weekDays(key: string): string[] {
  const start = Date.parse(`${key.slice(2)}T00:00:00Z`);
  return Array.from({ length: 7 }, (_, i) => new Date(start + i * 24 * 60 * MINUTE).toISOString().slice(0, 10));
}

// ———————————————————————————————————————————— geração

export interface GenerationContext {
  dailyMinutes: number;
  createdAt: number;
  questionStates: Record<string, QuestionState>;
  /** Há algum chefão desbloqueado e ainda ativo para enfrentar? */
  bossAvailable: boolean;
}

function tier(dailyMinutes: number): 0 | 1 | 2 {
  return dailyMinutes <= 5 ? 0 : dailyMinutes <= 10 ? 1 : 2;
}

function plural(n: number, one: string, many: string) {
  return n === 1 ? one : many;
}

function echoTotal(states: Record<string, QuestionState>): number {
  let n = 0;
  for (const s of Object.values(states)) if (s.echo) n++;
  return n;
}

type Candidate = Omit<QuestDef, 'id' | 'xp' | 'ink'>;

function dailyCandidates(ctx: GenerationContext): { opener: Candidate[]; extra: Candidate[]; focus: Candidate | null } {
  const t = tier(ctx.dailyMinutes);
  const pick = (a: [number, number, number]) => a[t];
  const answered = pick([3, 5, 8]);
  const correct = pick([2, 4, 6]);
  const hard = pick([1, 1, 2]);
  const minutes = pick([3, 6, 10]);
  const sessions = pick([1, 1, 2]);
  const opener: Candidate[] = [
    { metric: 'answered', target: answered, title: `Resolva ${answered} questões` },
    { metric: 'studyMinutes', target: minutes, title: `Estude por ${minutes} minutos` },
    {
      metric: 'sessions',
      target: sessions,
      title: plural(sessions, 'Conclua uma expedição ou missão', `Conclua ${sessions} expedições ou missões`),
    },
  ];
  const extra: Candidate[] = [
    { metric: 'correct', target: correct, title: `Acerte ${correct} questões` },
    { metric: 'correctHard', target: hard, title: plural(hard, 'Acerte 1 questão difícil', `Acerte ${hard} questões difíceis`) },
  ];
  const echoes = echoTotal(ctx.questionStates);
  if (echoes >= 1) extra.push({ metric: 'redemptions', target: 1, title: 'Derrote 1 Eco' });

  const rec = recommendFocus(QUESTIONS, ctx.questionStates);
  const focusTarget = pick([2, 2, 3]);
  const focus: Candidate | null = rec
    ? {
        metric: 'topicCorrect',
        target: focusTarget,
        topic: rec.topic,
        subtopic: rec.subtopic,
        title: `Acerte ${focusTarget} questões de ${subtopicLabel(rec.topic, rec.subtopic).toLowerCase()}`,
      }
    : null;
  return { opener, extra, focus };
}

export function generateDaily(key: string, ctx: GenerationContext): QuestBoard {
  const rng = createRng(hashString(`daily:${key}:${ctx.createdAt}`));
  const { opener, extra, focus } = dailyCandidates(ctx);
  const chosen: Candidate[] = [shuffle(opener, rng)[0]];
  if (focus) chosen.push(focus);
  for (const c of shuffle(extra, rng)) if (chosen.length < 3) chosen.push(c);
  const quests = chosen.map((c, i) => ({ ...c, id: `d${i}-${c.metric}`, ...DAILY_REWARD }));
  return { period: 'daily', key, quests, progress: {}, days: [], studyMs: 0 };
}

export function generateWeekly(key: string, ctx: GenerationContext): QuestBoard {
  const rng = createRng(hashString(`weekly:${key}:${ctx.createdAt}`));
  const t = tier(ctx.dailyMinutes);
  const days = [3, 4, 5][t];
  const answered = [20, 35, 50][t];
  const third: Candidate[] = [
    { metric: 'missions', target: 2, title: 'Conclua 2 missões do Atlas' },
    { metric: 'correctHard', target: [4, 6, 10][t], title: `Acerte ${[4, 6, 10][t]} questões difíceis` },
    { metric: 'perfectSessions', target: 2, title: 'Faça 2 sessões perfeitas (5+ questões, sem erros)' },
  ];
  if (echoTotal(ctx.questionStates) >= 2) third.push({ metric: 'redemptions', target: 3, title: 'Derrote 3 Ecos' });
  if (ctx.bossAvailable) third.push({ metric: 'bossWins', target: 1, title: 'Vença um chefão' });
  const chosen: Candidate[] = [
    { metric: 'studyDays', target: days, title: `Estude em ${days} dias diferentes` },
    { metric: 'answered', target: answered, title: `Resolva ${answered} questões` },
    shuffle(third, rng)[0],
  ];
  const quests = chosen.map((c, i) => ({ ...c, id: `w${i}-${c.metric}`, ...WEEKLY_REWARD }));
  return { period: 'weekly', key, quests, progress: {}, days: [], studyMs: 0 };
}

// ———————————————————————————————————————————— progresso

export interface QuestIncrement {
  metric: QuestMetric;
  amount: number;
  topic?: TopicId;
  subtopic?: string;
}

/** Aplica incrementos a um quadro; retorna o novo quadro e as encomendas que acabaram de ser cumpridas. */
export function applyIncrements(board: QuestBoard, incs: QuestIncrement[]) {
  const progress = { ...board.progress };
  const completed: QuestDef[] = [];
  for (const q of board.quests) {
    const before = progress[q.id] ?? 0;
    if (before >= q.target) continue;
    let gained = 0;
    for (const inc of incs) {
      if (inc.metric !== q.metric || inc.amount <= 0) continue;
      if (q.metric === 'topicCorrect' && (inc.topic !== q.topic || inc.subtopic !== q.subtopic)) continue;
      gained += inc.amount;
    }
    if (gained <= 0) continue;
    const after = Math.min(q.target, before + gained);
    progress[q.id] = after;
    if (after >= q.target) completed.push(q);
  }
  return { board: { ...board, progress }, completed };
}

export function isQuestDone(board: QuestBoard, q: QuestDef): boolean {
  return (board.progress[q.id] ?? 0) >= q.target;
}

export function allDone(board: QuestBoard): boolean {
  return board.quests.every((q) => isQuestDone(board, q));
}

/** Converte minutos de estudo (respeitando o teto por resposta) em incremento inteiro de minutos. */
export function studyMinutesGained(prevMs: number, answerMs: number): { totalMs: number; minutes: number } {
  const add = Math.max(0, Math.min(answerMs, STUDY_CAP_PER_ANSWER_MS));
  const totalMs = prevMs + add;
  return { totalMs, minutes: Math.floor(totalMs / MINUTE) - Math.floor(prevMs / MINUTE) };
}
