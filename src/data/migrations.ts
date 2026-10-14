/**
 * Migrações versionadas via PRAGMA user_version.
 * Regra: nunca editar uma migração já publicada — sempre acrescentar outra.
 */
import type { SqlDriver } from './sql/driver';

export interface Migration {
  version: number;
  description: string;
  sql: string;
}

export const MIGRATIONS: Migration[] = [
  {
    version: 1,
    description: 'Esquema inicial: perfil, revisão espaçada, tentativas, recompensas, inventário, campanha, chefões e sessões ativas',
    sql: `
      CREATE TABLE profile (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        data TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      );
      CREATE TABLE question_state (
        question_id TEXT PRIMARY KEY,
        box INTEGER NOT NULL,
        due_at INTEGER,
        seen INTEGER NOT NULL,
        correct INTEGER NOT NULL,
        wrong INTEGER NOT NULL,
        guessed_correct INTEGER NOT NULL,
        last_answered_at INTEGER,
        last_correct_at INTEGER,
        last_wrong_at INTEGER,
        last_wrong_session_id TEXT,
        last_xp_at INTEGER,
        echo INTEGER NOT NULL,
        favorite INTEGER NOT NULL,
        flagged INTEGER NOT NULL
      );
      CREATE INDEX idx_question_state_due ON question_state (due_at);
      CREATE TABLE attempts (
        id TEXT PRIMARY KEY,
        question_id TEXT NOT NULL,
        session_id TEXT NOT NULL,
        mode TEXT NOT NULL,
        chosen TEXT NOT NULL,
        correct INTEGER NOT NULL,
        guessed INTEGER NOT NULL,
        hints INTEGER NOT NULL,
        time_ms INTEGER NOT NULL,
        xp INTEGER NOT NULL,
        kind TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
      CREATE INDEX idx_attempts_question ON attempts (question_id);
      CREATE INDEX idx_attempts_created ON attempts (created_at);
      CREATE TABLE reward_ledger (
        key TEXT PRIMARY KEY,
        granted_at INTEGER NOT NULL
      );
      CREATE TABLE inventory (
        item_id TEXT PRIMARY KEY,
        acquired_at INTEGER NOT NULL,
        source TEXT NOT NULL
      );
      CREATE TABLE campaign_progress (
        node_id TEXT PRIMARY KEY,
        completed_at INTEGER,
        best_correct INTEGER NOT NULL,
        runs INTEGER NOT NULL
      );
      CREATE TABLE boss_progress (
        boss_id TEXT PRIMARY KEY,
        attempts INTEGER NOT NULL,
        wins INTEGER NOT NULL,
        failed_since_win INTEGER NOT NULL,
        first_win_at INTEGER,
        flawless INTEGER NOT NULL,
        best_turns INTEGER
      );
      CREATE TABLE active_run (
        kind TEXT PRIMARY KEY CHECK (kind IN ('session', 'battle')),
        data TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `,
  },
  {
    version: 2,
    description: 'Encomendas diárias e semanais (v0.2.0)',
    sql: `
      CREATE TABLE quest_board (
        period TEXT PRIMARY KEY CHECK (period IN ('daily', 'weekly')),
        data TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      );
    `,
  },
];

export const LATEST_VERSION = MIGRATIONS[MIGRATIONS.length - 1].version;

export async function currentVersion(db: SqlDriver): Promise<number> {
  const row = await db.get<{ user_version: number }>('PRAGMA user_version');
  return row?.user_version ?? 0;
}

/** Aplica, em ordem, cada migração pendente na sua própria transação. */
export async function migrate(db: SqlDriver, migrations: Migration[] = MIGRATIONS): Promise<number> {
  let version = await currentVersion(db);
  for (const m of migrations) {
    if (m.version <= version) continue;
    if (m.version !== version + 1) throw new Error(`Migração fora de ordem: ${m.version}`);
    await db.transaction(async (tx) => {
      await tx.exec(m.sql);
      await tx.exec(`PRAGMA user_version = ${m.version}`);
    });
    version = m.version;
  }
  return version;
}
