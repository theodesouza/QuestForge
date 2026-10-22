import type { Attempt } from '../game/types';
import { dayKey, weekDays, weekKey } from '../quests/quests';

export const PROGRESS_MIN_SAMPLE = 10;

export function learningWeekStart(now: number, tzOffsetMin: number): number {
  return Date.parse(`${weekKey(now, tzOffsetMin).slice(2)}T00:00:00Z`) + tzOffsetMin * 60000;
}

/** Atividade desta semana local; acertos por chute aparecem separados de evidência confiante. */
export function learningProgress(attempts: readonly Attempt[], now: number, tzOffsetMin: number) {
  const days = weekDays(weekKey(now, tzOffsetMin)).map(date => ({ date, answered: 0, correct: 0 }));
  const start = learningWeekStart(now, tzOffsetMin);
  let correct = 0;
  let confidentCorrect = 0;
  let answered = 0;
  for (const a of attempts) {
    if (a.createdAt < start || a.createdAt > now) continue;
    const day = days.find(d => d.date === dayKey(a.createdAt, tzOffsetMin));
    if (!day) continue;
    day.answered++;
    answered++;
    if (a.correct) {
      correct++;
      day.correct++;
      if (!a.guessed) confidentCorrect++;
    }
  }
  return {
    days, answered, correct, confidentCorrect,
    activeDays: days.filter(d => d.answered > 0).length,
    accuracy: answered >= PROGRESS_MIN_SAMPLE ? Math.round(correct / answered * 100) : null,
  };
}
