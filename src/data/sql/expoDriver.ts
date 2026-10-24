import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';
import type { SqlDriver, SqlExecutor, SqlValue } from './driver';

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

export async function openExpoDriver(name = 'questforge.db'): Promise<SqlDriver> {
  const db = await openDatabaseAsync(name);
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  return {
    ...wrap(db),
    transaction: (fn) => db.withExclusiveTransactionAsync((txn) => fn(wrap(txn))),
    close: () => db.closeAsync(),
  };
}
