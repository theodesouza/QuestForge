import type { GameRepository } from './repository/GameRepository';
import { MemoryGameRepository } from './repository/MemoryGameRepository';

/** Web: apenas pré-visualização de design — progresso em memória, não persiste. */
export async function createRepository(): Promise<GameRepository> {
  return new MemoryGameRepository();
}
