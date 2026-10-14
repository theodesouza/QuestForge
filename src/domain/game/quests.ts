/**
 * Aplicação das encomendas ao estado do jogo: troca de quadros na virada do dia/semana,
 * progresso a partir das ações do jogador e recompensas idempotentes (registro `quest:*`).
 */
import { REGIONS } from '../../content/regions';
import { nodeStatus } from '../campaign/campaign';
import {
  DAILY_BONUS,
  WEEKLY_BONUS,
  WEEKLY_FIRST_ITEM,
  allDone,
  applyIncrements,
  dayKey,
  generateDaily,
  generateWeekly,
  shouldReplaceBoard,
  studyMinutesGained,
  weekDays,
  weekKey,
  type GenerationContext,
  type QuestBoard,
  type QuestIncrement,
} from '../quests/quests';
import { grantInk, grantItem, grantXp, once } from './grant';
import type { Tx } from './tx';
import type { GameState } from './types';

function generationContext(state: GameState, now: number): GenerationContext {
  const view = { progress: state.campaign, bosses: state.bosses };
  const bossAvailable = REGIONS.some((r) =>
    r.nodes.some((n) => n.kind === 'boss' && nodeStatus(n, view) !== 'locked'),
  );
  return {
    dailyMinutes: state.profile.dailyMinutes,
    createdAt: state.profile.createdAt,
    questionStates: state.questionStates,
    bossAvailable,
    now,
    tzOffsetMin: state.profile.tzOffsetMin,
  };
}

/**
 * Garante quadros do dia e da semana atuais. Quadros antigos são trocados sem penalidade;
 * o quadro só avança no calendário (trocar o fuso para trás mantém o quadro e o progresso).
 */
export function refreshQuests(tx: Tx, now: number) {
  if (!tx.profile.onboarded) return;
  const tz = tx.profile.tzOffsetMin;
  const dKey = dayKey(now, tz);
  const wKey = weekKey(now, tz);
  const q = tx.state.quests;
  const needDaily = !q.daily || shouldReplaceBoard(dKey, q.daily.key, 2);
  const needWeekly = !q.weekly || shouldReplaceBoard(wKey, q.weekly.key, 7);
  if (!needDaily && !needWeekly) return;
  const ctx = generationContext(tx.state, now);
  tx.setQuests({
    daily: needDaily ? generateDaily(dKey, ctx) : q.daily,
    weekly: needWeekly ? generateWeekly(wKey, ctx) : q.weekly,
  });
}

export interface ProgressInput {
  incs: QuestIncrement[];
  /** Tempo da resposta (para "estude por N minutos" e dias de estudo). */
  answerTimeMs?: number;
}

/** Aplica progresso às encomendas e concede recompensas das que acabaram de ser cumpridas. */
export function progressQuests(tx: Tx, input: ProgressInput, now: number) {
  if (!tx.profile.onboarded) return;
  refreshQuests(tx, now);
  const today = dayKey(now, tx.profile.tzOffsetMin);
  const isAnswer = input.answerTimeMs !== undefined;

  const step = (board: QuestBoard | null): QuestBoard | null => {
    if (!board) return board;
    const incs = input.incs.slice();
    let b: QuestBoard = { ...board };
    if (isAnswer) {
      const { totalMs, minutes } = studyMinutesGained(b.studyMs ?? 0, input.answerTimeMs ?? 0);
      b = { ...b, studyMs: totalMs };
      if (minutes > 0) incs.push({ metric: 'studyMinutes', amount: minutes });
      if (b.period === 'weekly' && !b.days.includes(today) && weekDays(b.key).includes(today)) {
        b = { ...b, days: [...b.days, today] };
        incs.push({ metric: 'studyDays', amount: 1 });
      }
    }
    const { board: next, completed } = applyIncrements(b, incs);
    for (const q of completed) {
      once(tx, `quest:${next.period}:${next.key}:${q.id}`, now, () => {
        grantXp(tx, q.xp, 'quest', now, false);
        grantInk(tx, q.ink);
        tx.emit({ type: 'questComplete', period: next.period, questId: q.id, title: q.title, xp: q.xp, ink: q.ink });
      });
    }
    if (completed.length > 0 && allDone(next)) {
      once(tx, `quest:${next.period}:${next.key}:bonus`, now, () => {
        const bonus = next.period === 'daily' ? DAILY_BONUS : WEEKLY_BONUS;
        grantXp(tx, bonus.xp, 'quest', now, false);
        grantInk(tx, bonus.ink);
        let itemId: string | null = null;
        if (next.period === 'weekly' && !tx.state.inventory[WEEKLY_FIRST_ITEM]) {
          grantItem(tx, WEEKLY_FIRST_ITEM, 'encomendas', now);
          itemId = WEEKLY_FIRST_ITEM;
        }
        tx.emit({ type: 'questBonus', period: next.period, xp: bonus.xp, ink: bonus.ink, itemId });
      });
    }
    return next;
  };

  const daily = step(tx.state.quests.daily);
  const weekly = step(tx.state.quests.weekly);
  if (daily !== tx.state.quests.daily || weekly !== tx.state.quests.weekly) {
    tx.setQuests({ daily, weekly });
  }
}
