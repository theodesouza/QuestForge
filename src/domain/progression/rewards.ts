/**
 * Recompensas por nível. Toda recompensa tem uma chave de registro única
 * (`level:N`) — concedê-la duas vezes é impossível (ver game/grant.ts).
 */
import { MAX_LEVEL } from './levels';

export type Reward =
  | { kind: 'item'; itemId: string }
  | { kind: 'ink'; amount: number };

const LEVEL_ITEMS: Record<number, string[]> = {
  2: ['frame-bronze'],
  3: ['title-tracador'],
  4: ['core-ambar'],
  6: ['aura-brasa'],
  8: ['frame-latao'],
  10: ['core-verdete'],
  12: ['title-incansavel'],
  14: ['aura-mare'],
  16: ['frame-celeste'],
  18: ['core-iris'],
  20: ['aura-aurora'],
  25: ['frame-meridiana', 'title-mestre'],
  30: ['core-solar'],
  35: ['aura-nebulosa'],
  40: ['frame-armilar'],
  45: ['core-pulsar'],
  50: ['aura-zenite', 'title-arquiteto'],
};

/** Tinta concedida ao alcançar o nível — cresce devagar, com bônus nas patentes. */
export function inkForLevel(level: number): number {
  const base = 10 + level * 2;
  return level % 5 === 0 ? base * 2 : base;
}

export function rewardsForLevel(level: number): Reward[] {
  if (level < 2 || level > MAX_LEVEL) return [];
  const items = (LEVEL_ITEMS[level] ?? []).map<Reward>((itemId) => ({ kind: 'item', itemId }));
  return [...items, { kind: 'ink', amount: inkForLevel(level) }];
}

/** Próximo nível (a partir de `level`, exclusivo) que concede um item, para "próxima recompensa". */
export function nextItemLevel(level: number): { level: number; itemIds: string[] } | null {
  for (let l = level + 1; l <= MAX_LEVEL; l++) {
    if (LEVEL_ITEMS[l]) return { level: l, itemIds: LEVEL_ITEMS[l] };
  }
  return null;
}

export const LEVEL_ITEM_TABLE: Readonly<Record<number, string[]>> = LEVEL_ITEMS;
