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
  5: ['title-cartografo-aprendiz'],
  6: ['aura-brasa'],
  8: ['frame-latao'],
  9: ['title-explorador'],
  10: ['core-verdete'],
  12: ['title-incansavel'],
  14: ['aura-mare'],
  15: ['title-estrategista'],
  16: ['frame-celeste'],
  18: ['core-iris'],
  20: ['aura-aurora', 'title-veterano'],
  22: ['frame-louros'],
  25: ['frame-meridiana', 'title-mestre'],
  27: ['aura-eletrica'],
  28: ['core-esmeralda'],
  30: ['core-solar', 'title-estrela-guia'],
  32: ['scene-polar'],
  33: ['frame-runica'],
  35: ['aura-nebulosa'],
  37: ['core-gelo'],
  39: ['aura-constelacao'],
  40: ['frame-armilar', 'title-sabio-dos-mapas'],
  42: ['core-eclipse'],
  45: ['core-pulsar'],
  46: ['scene-observatorio'],
  47: ['frame-cristalina'],
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
