/** Driver SQL para testes usando o SQLite embutido do Node (node:sqlite). */
import type { SqlDriver, SqlExecutor, SqlValue } from '../sql/driver';

interface NodeStatement {
  run(...params: SqlValue[]): unknown;
  all(...params: SqlValue[]): unknown[];
  get(...params: SqlValue[]): unknown;
}
interface NodeDatabase {
  exec(sql: string): void;
  prepare(sql: string): NodeStatement;
  close(): void;
}

const sqlite = (process as unknown as { getBuiltinModule(id: string): { DatabaseSync: new (path: string) => NodeDatabase } })
  .getBuiltinModule('node:sqlite');

export function openNodeDriver(path = ':memory:'): SqlDriver & { close(): void; raw: NodeDatabase } {
  const db = new sqlite.DatabaseSync(path);
  const plain = <T,>(rows: unknown[]) => rows.map((r) => ({ ...(r as object) })) as T[];
  const exec: SqlExecutor = {
    exec: async (sql) => db.exec(sql),
    run: async (sql, params = []) => {
      db.prepare(sql).run(...params);
    },
    all: async <T,>(sql: string, params: SqlValue[] = []) => plain<T>(db.prepare(sql).all(...params)),
    get: async <T,>(sql: string, params: SqlValue[] = []) => {
      const row = db.prepare(sql).get(...params);
      return row ? ({ ...(row as object) } as T) : null;
    },
  };
  return {
    ...exec,
    raw: db,
    close: () => db.close(),
    transaction: async (fn) => {
      db.exec('BEGIN IMMEDIATE');
      try {
        await fn(exec);
        db.exec('COMMIT');
      } catch (e) {
        db.exec('ROLLBACK');
        throw e;
      }
    },
  };
}
