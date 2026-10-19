import type { Attempt } from '../game/types';
import { learningProgress, learningWeekStart } from '../learning/progress';

const NOW = Date.UTC(2026, 9, 20, 12);
const MONDAY = Date.UTC(2026, 9, 19, 3); // meia-noite local, UTC−3
const attempt = (createdAt: number, patch: Partial<Attempt> = {}): Attempt => ({
  id: String(createdAt), questionId: 'RZP-001', sessionId: 's1', mode: 'expedition',
  chosen: 'A', correct: true, guessed: false, hints: 0, timeMs: 10000,
  xp: 10, kind: 'first', createdAt, ...patch,
});

it('recorta a semana local, incluindo segunda à meia-noite e excluindo futuro', () => {
  expect(learningWeekStart(NOW, 180)).toBe(MONDAY);
  const result = learningProgress([
    attempt(MONDAY - 1), attempt(MONDAY), attempt(NOW), attempt(NOW + 1),
  ], NOW, 180);
  expect(result.answered).toBe(2);
  expect(result.days.map(d => d.answered)).toEqual([1, 1, 0, 0, 0, 0, 0]);
  expect(result.activeDays).toBe(2);
  expect(result.accuracy).toBeNull();
});

it('mostra precisão apenas com amostra mínima e distingue chutes de acertos confiantes', () => {
  const result = learningProgress([
    ...Array.from({ length: 8 }, (_, i) => attempt(MONDAY + i)),
    attempt(NOW, { guessed: true }), attempt(NOW, { correct: false }),
  ], NOW, 180);
  expect(result).toMatchObject({ answered: 10, correct: 9, confidentCorrect: 8, accuracy: 90 });
});

it('sem estudo tem sete dias vazios e nenhuma porcentagem inventada', () => {
  expect(learningProgress([], NOW, 180)).toMatchObject({ answered: 0, activeDays: 0, accuracy: null });
});
