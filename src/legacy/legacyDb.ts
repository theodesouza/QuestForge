/**
 * Abre o banco ANTIGO (`questforge.db`, anterior às contas) em modo SOMENTE LEITURA.
 * `PRAGMA query_only` faz o próprio SQLite recusar qualquer escrita nesta conexão.
 */
import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import type { GameRepository } from '../data/repository/GameRepository';
import { SqlGameRepository } from '../data/repository/SqlGameRepository';
import type { SqlDriver, SqlExecutor, SqlValue } from '../data/sql/driver';

export const LEGACY_DB_NAME = 'questforge.db';

function wrap(db: SQLiteDatabase): SqlExecutor {
  return {
    exec: (sql) => db.execAsync(sql),
    run: async (sql, params: SqlValue[] = []) => {
      await db.runAsync(sql, params);
    },
    all: <T,>(sql: string, params: SqlValue[] = []) => db.getAllAsync<T>(sql, params),
    get: <T,>(sql: string, params: SqlValue[] = []) => db.getFirstAsync<T>(sql, params),
  };
}

export interface OpenedLegacy {
  repo: GameRepository;
  close(): Promise<void>;
}

/** null = não há banco antigo com progresso neste aparelho. */
export async function openLegacyRepository(): Promise<OpenedLegacy | null> {
  const db = await openDatabaseAsync(LEGACY_DB_NAME);
  await db.execAsync('PRAGMA query_only = ON');
  const hasProfile = await db.getFirstAsync<{ name: string }>("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'profile'");
  if (!hasProfile) {
    await db.closeAsync();
    return null;
  }
  const driver: SqlDriver = {
    ...wrap(db),
    transaction: (fn) => db.withExclusiveTransactionAsync((txn) => fn(wrap(txn))),
  };
  // migrate:false — o banco antigo nunca recebe migrações nem tabelas novas.
  return { repo: new SqlGameRepository(driver, Date.now, { migrate: false }), close: () => db.closeAsync() };
}
