/**
 * Encomendas diárias e semanais — objetivos curtos e alcançáveis.
 * Princípios (PROJECT_PLAN.md §2.8):
 * - recompensa automática ao cumprir: nada "expira sem resgatar";
 * - dia ou semana perdidos não zeram nada: o quadro só é trocado;
 * - metas proporcionais ao tempo diário escolhido pelo jogador;
 * - uma encomenda diária mira o assunto que o treinador recomenda.
 * Funções puras; a aplicação ao estado fica em game/quests.ts.
 */
import { QUESTIONS, questionsFor } from '../../content/bank';
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
  /**
   * Fração do período coberta pelo quadro (1 = semana inteira). Um quadro semanal criado
   * no meio da semana tem metas e recompensas proporcionais. Ausente em quadros antigos (= 1).
   */
  share?: number;
}

export interface QuestsState {
  daily: QuestBoard | null;
  weekly: QuestBoard | null;
}

export const DAILY_REWARD = { xp: 25, ink: 10 } as const;
export const DAILY_BONUS = { xp: 20, ink: 15 } as const;
export const WEEKLY_REWARD = { xp: 80, ink: 40 } as const;
export const WEEKLY_BONUS = { xp: 100, ink: 60 } as const;
/** Título concedido na primeira semana inteira (quadro criado na segunda-feira) cumprida. */
export const WEEKLY_FIRST_ITEM = 'title-constante';
/** Tempo máximo que uma resposta conta para "estude por N minutos" (evita contar o app aberto parado). */
export const STUDY_CAP_PER_ANSWER_MS = 5 * 60 * 1000;

const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;

/** Arredonda para múltiplo de 5, respeitando um mínimo. */
function round5(n: number, min: number): number {
  return Math.max(min, Math.round(n / 5) * 5);
}

/** Recompensa de cada encomenda semanal, proporcional à parte da semana coberta. */
export function weeklyReward(share: number) {
  if (share >= 1) return { ...WEEKLY_REWARD };
  return { xp: round5(WEEKLY_REWARD.xp * share, 20), ink: round5(WEEKLY_REWARD.ink * share, 10) };
}

/** Baú de um quadro (o semanal é proporcional à parte da semana coberta). */
export function boardBonus(board: QuestBoard): { xp: number; ink: number } {
  if (board.period === 'daily') return { ...DAILY_BONUS };
  const share = board.share ?? 1;
  if (share >= 1) return { ...WEEKLY_BONUS };
  return { xp: round5(WEEKLY_BONUS.xp * share, 25), ink: round5(WEEKLY_BONUS.ink * share, 15) };
}

/** O título da Constância só vem de uma semana inteira. */
export function grantsWeeklyItem(board: QuestBoard): boolean {
  return board.period === 'weekly' && (board.share ?? 1) >= 1;
}

/** Rótulo de subassunto no meio de uma frase: só a inicial vira minúscula (e siglas ficam). */
export function inlineLabel(label: string): string {
  const isUpper = (c: string) => c !== '' && c === c.toUpperCase() && c !== c.toLowerCase();
  if (isUpper(label.charAt(0)) && isUpper(label.charAt(1))) return label;
  return label.charAt(0).toLowerCase() + label.slice(1);
}

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
  return Array.from({ length: 7 }, (_, i) => new Date(start + i * DAY).toISOString().slice(0, 10));
}

/** Instante (UTC) em que o dia local de uma chave diária termina. */
export function dayEnd(key: string, tzOffsetMin: number): number {
  return Date.parse(`${key}T00:00:00Z`) + DAY + tzOffsetMin * MINUTE;
}

/** Instante (UTC) em que a semana local de uma chave semanal termina. */
export function weekEnd(key: string, tzOffsetMin: number): number {
  return Date.parse(`${key.slice(2)}T00:00:00Z`) + 7 * DAY + tzOffsetMin * MINUTE;
}

/** Dias da semana que ainda restam, contando hoje (segunda = 7, domingo = 1). */
export function daysLeftInWeek(key: string, now: number, tzOffsetMin: number): number {
  const today = Date.parse(`${dayKey(now, tzOffsetMin)}T00:00:00Z`);
  const elapsed = Math.round((today - Date.parse(`${key.slice(2)}T00:00:00Z`)) / DAY);
  return Math.max(1, Math.min(7, 7 - elapsed));
}

/** Tolerância para um quadro "à frente" do dia local: viagem de fuso muda a data em no máximo 2 dias. */
export const BOARD_AHEAD_TOLERANCE_DAYS = 2;

/**
 * O quadro guardado deve ser trocado pelo do período atual? Só quando o período
 * avançou: mudar o fuso para "trás" não devolve um quadro já cumprido nem apaga o
 * progresso de hoje. Um quadro que começa mais de 2 dias depois de hoje (relógio do
 * aparelho estava adiantado) também é trocado, para não ficar preso.
 *
 * @param currentKey chave do período atual (dia ou semana)
 * @param boardKey chave do quadro guardado
 * @param today dia local de hoje (AAAA-MM-DD), referência para o "à frente"
 */
export function shouldReplaceBoard(currentKey: string, boardKey: string, today: string): boolean {
  if (boardKey === currentKey) return false;
  const start = Date.parse(`${boardKey.startsWith('S-') ? boardKey.slice(2) : boardKey}T00:00:00Z`);
  const ahead = (start - Date.parse(`${today}T00:00:00Z`)) / DAY;
  return !(ahead > 0 && ahead <= BOARD_AHEAD_TOLERANCE_DAYS);
}

// ———————————————————————————————————————————— geração

export interface GenerationContext {
  dailyMinutes: number;
  createdAt: number;
  questionStates: Record<string, QuestionState>;
  /** Há algum chefão desbloqueado e ainda ativo para enfrentar? */
  bossAvailable: boolean;
  /** Momento da geração e fuso do aparelho (metas proporcionais ao que resta do período). */
  now: number;
  tzOffsetMin: number;
}

function tier(dailyMinutes: number): 0 | 1 | 2 {
  return dailyMinutes <= 5 ? 0 : dailyMinutes <= 10 ? 1 : 2;
}

function plural(n: number, one: string, many: string) {
  return n === 1 ? one : many;
}

/** Ecos que voltam para revisão até o fim do período — os que dá para derrotar nele. */
function echoesDueBy(states: Record<string, QuestionState>, until: number): number {
  let n = 0;
  for (const s of Object.values(states)) if (s.echo && s.dueAt !== null && s.dueAt <= until) n++;
  return n;
}

type Candidate = Omit<QuestDef, 'id' | 'xp' | 'ink'>;

function dailyCandidates(key: string, ctx: GenerationContext): { opener: Candidate[]; extra: Candidate[]; focus: Candidate | null } {
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
  if (echoesDueBy(ctx.questionStates, dayEnd(key, ctx.tzOffsetMin)) >= 1) {
    extra.push({ metric: 'redemptions', target: 1, title: 'Derrote 1 Eco' });
  }

  const rec = recommendFocus(QUESTIONS, ctx.questionStates);
  let focus: Candidate | null = null;
  if (rec) {
    // Nunca mais acertos do que o subassunto tem de questões.
    const pool = questionsFor({ topics: [rec.topic], subtopics: [rec.subtopic] }).length;
    const target = Math.min(pick([2, 2, 3]), pool);
    const label = inlineLabel(subtopicLabel(rec.topic, rec.subtopic));
    if (target > 0) {
      focus = {
        metric: 'topicCorrect',
        target,
        topic: rec.topic,
        subtopic: rec.subtopic,
        title: plural(target, `Acerte 1 questão de ${label}`, `Acerte ${target} questões de ${label}`),
      };
    }
  }
  return { opener, extra, focus };
}

export function generateDaily(key: string, ctx: GenerationContext): QuestBoard {
  const rng = createRng(hashString(`daily:${key}:${ctx.createdAt}`));
  const { opener, extra, focus } = dailyCandidates(key, ctx);
  const chosen: Candidate[] = [shuffle(opener, rng)[0]];
  if (focus) chosen.push(focus);
  for (const c of shuffle(extra, rng)) if (chosen.length < 3) chosen.push(c);
  const quests = chosen.map((c, i) => ({ ...c, id: `d${i}-${c.metric}`, ...DAILY_REWARD }));
  return { period: 'daily', key, quests, progress: {}, days: [], studyMs: 0 };
}

export function generateWeekly(key: string, ctx: GenerationContext): QuestBoard {
  const rng = createRng(hashString(`weekly:${key}:${ctx.createdAt}`));
  const t = tier(ctx.dailyMinutes);
  // Quadro criado no meio da semana: metas e recompensas proporcionais aos dias que restam,
  // com folga (o dia de hoje conta, mesmo que o quadro tenha surgido só ao abrir o app).
  const left = daysLeftInWeek(key, ctx.now, ctx.tzOffsetMin);
  const share = left / 7;
  const scale = (full: number, min: number) => Math.max(min, Math.ceil(full * share));
  const fullDays = [3, 4, 5][t];
  const days = Math.max(1, Math.min(fullDays, Math.floor(fullDays * share)));
  const answered = scale([20, 35, 50][t], 5);
  const hard = scale([4, 6, 10][t], 1);
  const missions = scale(2, 1);
  const perfect = scale(2, 1);
  const echoes = scale(3, 1);
  const third: Candidate[] = [
    { metric: 'missions', target: missions, title: plural(missions, 'Conclua 1 missão do Atlas', `Conclua ${missions} missões do Atlas`) },
    { metric: 'correctHard', target: hard, title: plural(hard, 'Acerte 1 questão difícil', `Acerte ${hard} questões difíceis`) },
    {
      metric: 'perfectSessions',
      target: perfect,
      title: plural(perfect, 'Faça 1 sessão perfeita (5+ questões, sem erros)', `Faça ${perfect} sessões perfeitas (5+ questões, sem erros)`),
    },
  ];
  if (echoesDueBy(ctx.questionStates, weekEnd(key, ctx.tzOffsetMin)) >= echoes) {
    third.push({ metric: 'redemptions', target: echoes, title: plural(echoes, 'Derrote 1 Eco', `Derrote ${echoes} Ecos`) });
  }
  if (ctx.bossAvailable) third.push({ metric: 'bossWins', target: 1, title: 'Vença um chefão' });
  const chosen: Candidate[] = [
    { metric: 'studyDays', target: days, title: plural(days, 'Estude em pelo menos 1 dia', `Estude em ${days} dias diferentes`) },
    { metric: 'answered', target: answered, title: `Resolva ${answered} questões` },
    shuffle(third, rng)[0],
  ];
  const reward = weeklyReward(share);
  const quests = chosen.map((c, i) => ({ ...c, id: `w${i}-${c.metric}`, ...reward }));
  return { period: 'weekly', key, quests, progress: {}, days: [], studyMs: 0, share };
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
