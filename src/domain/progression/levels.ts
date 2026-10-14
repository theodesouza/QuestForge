/**
 * Curva de níveis 1–50.
 * xpParaProximo(L) = arredondado para múltiplo de 5 de 50 + 12·(L−1)^1.4
 * Rápida no começo (nível 2 em ~4 questões) e exigente no fim (~58 mil XP no total).
 */

export const MAX_LEVEL = 50;

function roundTo5(n: number): number {
  return Math.round(n / 5) * 5;
}

/** XP necessário para ir do nível `level` ao `level + 1`. */
export function xpToNext(level: number): number {
  if (!Number.isInteger(level) || level < 1) throw new RangeError(`Nível inválido: ${level}`);
  if (level >= MAX_LEVEL) return Infinity;
  return roundTo5(50 + 12 * Math.pow(level - 1, 1.4));
}

/** LEVEL_START_XP[L] = XP total necessário para atingir o nível L (índice 0 não usado). */
export const LEVEL_START_XP: readonly number[] = (() => {
  const starts = [0, 0];
  for (let level = 1; level < MAX_LEVEL; level++) {
    starts.push(starts[level] + xpToNext(level));
  }
  return starts;
})();

export function levelForXp(totalXp: number): number {
  const xp = Math.max(0, Math.floor(totalXp));
  let level = 1;
  // Busca linear em 50 posições: barata e legível.
  while (level < MAX_LEVEL && xp >= LEVEL_START_XP[level + 1]) level++;
  return level;
}

export interface LevelProgress {
  level: number;
  /** XP já acumulado dentro do nível atual. */
  into: number;
  /** XP total do nível atual (Infinity no nível máximo). */
  span: number;
  /** XP restante para o próximo nível (0 no nível máximo). */
  remaining: number;
  /** 0–1 */
  ratio: number;
  isMax: boolean;
}

export function levelProgress(totalXp: number): LevelProgress {
  const level = levelForXp(totalXp);
  if (level >= MAX_LEVEL) {
    return { level, into: 0, span: Infinity, remaining: 0, ratio: 1, isMax: true };
  }
  const span = xpToNext(level);
  const into = Math.max(0, Math.floor(totalXp)) - LEVEL_START_XP[level];
  return { level, into, span, remaining: span - into, ratio: into / span, isMax: false };
}

/** Patentes: mudam a cada 5 níveis e adicionam uma estrela orbital ao Astrolábio. */
export const RANKS: readonly { from: number; title: string }[] = [
  { from: 1, title: 'Aprendiz de Cartógrafo' },
  { from: 5, title: 'Traçador' },
  { from: 10, title: 'Desbravador' },
  { from: 15, title: 'Agrimensor' },
  { from: 20, title: 'Navegador Estelar' },
  { from: 25, title: 'Cartógrafo Mestre' },
  { from: 30, title: 'Guardião dos Meridianos' },
  { from: 35, title: 'Arquiteto de Rotas' },
  { from: 40, title: 'Sábio do Atlas' },
  { from: 45, title: 'Lenda Cartográfica' },
  { from: 50, title: 'Senhor do Zênite' },
];

export function rankFor(level: number): { title: string; index: number } {
  let index = 0;
  for (let i = 0; i < RANKS.length; i++) if (level >= RANKS[i].from) index = i;
  return { title: RANKS[index].title, index };
}
