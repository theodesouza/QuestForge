import { openExpoDriver } from './sql/expoDriver';
import type { GameRepository } from './repository/GameRepository';
import { SqlGameRepository } from './repository/SqlGameRepository';

/** Android/iOS: SQLite local. (A variante .web.ts usa memória para pré-visualização.) */
export async function createRepository(): Promise<GameRepository> {
  return new SqlGameRepository(await openExpoDriver());
}
