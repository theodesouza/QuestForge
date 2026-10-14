/**
 * Interface SQL mínima. Implementada com expo-sqlite no app e com node:sqlite
 * nos testes — a mesma lógica de repositório e migrações roda nos dois.
 */
export type SqlValue = string | number | null;

export interface SqlExecutor {
  exec(sql: string): Promise<void>;
  run(sql: string, params?: SqlValue[]): Promise<void>;
  all<T>(sql: string, params?: SqlValue[]): Promise<T[]>;
  get<T>(sql: string, params?: SqlValue[]): Promise<T | null>;
}

export interface SqlDriver extends SqlExecutor {
  /** Executa `fn` numa transação exclusiva: tudo ou nada. */
  transaction(fn: (tx: SqlExecutor) => Promise<void>): Promise<void>;
}
