/**
 * Descanso do Viajante: ficar dias sem estudar não pune — acumula um saldo que
 * dobra o XP das próximas questões até se esgotar. Recompensa o retorno.
 */
import { DAY_MS } from '../learning/srs';

export const RESTED_PER_DAY = 150;
export const RESTED_CAP = 600;

/** Saldo ganho por uma ausência: o primeiro dia não conta (estudar dia sim, dia não é normal). */
export function restedFromAbsence(lastActiveAt: number | null, now: number): number {
  if (lastActiveAt === null || now <= lastActiveAt) return 0;
  const days = Math.floor((now - lastActiveAt) / DAY_MS);
  if (days < 2) return 0;
  return Math.min(RESTED_CAP, (days - 1) * RESTED_PER_DAY);
}

export function accrueRested(pool: number, lastActiveAt: number | null, now: number) {
  const gained = restedFromAbsence(lastActiveAt, now);
  const next = Math.min(RESTED_CAP, pool + gained);
  return { pool: next, gained: next - pool };
}

/** Consome do saldo o bônus para um ganho de XP (bônus = no máximo o próprio XP). */
export function applyRested(xp: number, pool: number): { bonus: number; pool: number } {
  const bonus = Math.max(0, Math.min(xp, pool));
  return { bonus, pool: pool - bonus };
}
