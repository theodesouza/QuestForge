import type { SqlDriver } from '../data/sql/driver';

/**
 * Torna a conexão SOMENTE LEITURA: qualquer INSERT/UPDATE/DELETE/DDL passa a falhar no próprio SQLite
 * (`PRAGMA query_only`), então o banco legado não pode ser alterado nem por engano.
 */
export async function makeReadOnly<T extends SqlDriver>(driver: T): Promise<T> {
  await driver.exec('PRAGMA query_only = ON');
  return driver;
}

/** Confere (sem comparar maiúsculas/minúsculas) se a conta que entrou é a esperada. Sem e-mail esperado ⇒ true. */
export function emailAllowed(expected: string | undefined | null, actual: string | null): boolean {
  const want = (expected ?? '').trim().toLowerCase();
  if (!want) return true;
  return !!actual && actual.trim().toLowerCase() === want;
}
