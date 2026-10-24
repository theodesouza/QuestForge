import type { BattleState } from '../../domain/boss/battle';
import type { BossProgress, NodeProgress } from '../../domain/campaign/campaign';
import type { QuestionState } from '../../domain/learning/srs';
import type { StageProgress } from '../../domain/academy/progress';
import type { AcademyAnswer, ActiveSession, Attempt, Delta, GameState } from '../../domain/game/types';
import { migrate } from '../migrations';
import type { SqlDriver, SqlExecutor, SqlValue } from '../sql/driver';
import { normalizeState } from '../../domain/game/normalize';
import type { QuestBoard } from '../../domain/quests/quests';
import type { GameRepository, KvWrite, StoredAttempt } from './GameRepository';
import { fullDelta } from '../../domain/game/game';

const b = (v: boolean): number => (v ? 1 : 0);

interface QuestionStateRow {
  question_id: string;
  box: number;
  due_at: number | null;
  seen: number;
  correct: number;
  wrong: number;
  guessed_correct: number;
  last_answered_at: number | null;
  last_correct_at: number | null;
  last_wrong_at: number | null;
  last_wrong_session_id: string | null;
  last_xp_at: number | null;
  echo: number;
  favorite: number;
  flagged: number;
}

function rowToQuestionState(r: QuestionStateRow): QuestionState {
  return {
    questionId: r.question_id,
    box: r.box,
    dueAt: r.due_at,
    seen: r.seen,
    correct: r.correct,
    wrong: r.wrong,
    guessedCorrect: r.guessed_correct,
    lastAnsweredAt: r.last_answered_at,
    lastCorrectAt: r.last_correct_at,
    lastWrongAt: r.last_wrong_at,
    lastWrongSessionId: r.last_wrong_session_id,
    lastXpAt: r.last_xp_at,
    echo: r.echo === 1,
    favorite: r.favorite === 1,
    flagged: r.flagged === 1,
  };
}

interface AttemptRow {
  id: string;
  question_id: string;
  session_id: string;
  mode: Attempt['mode'];
  chosen: Attempt['chosen'];
  correct: number;
  guessed: number;
  hints: number;
  time_ms: number;
  xp: number;
  kind: Attempt['kind'];
  created_at: number;
}

function safeParse<T>(json: string): T | null {
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export interface SqlRepositoryOptions {
  /**
   * `false` abre o banco SEM aplicar migrações (leitura do banco legado, que não deve ser tocado).
   * Padrão: aplica as migrações pendentes, como em toda abertura normal do app.
   */
  migrate?: boolean;
}

const PROGRESS_TABLES = [
  'profile',
  'question_state',
  'reward_ledger',
  'inventory',
  'campaign_progress',
  'boss_progress',
  'active_run',
  'quest_board',
  'academy_progress',
];

/** Registros imutáveis (tentativas do Atlas e respostas da Academia): só saem num reset ou com `wipeAttempts`. */
const HISTORY_TABLES = ['attempts', 'academy_answers'];

export class SqlGameRepository implements GameRepository {
  private ready: Promise<void> | null = null;

  constructor(
    private readonly db: SqlDriver,
    private readonly clock: () => number = Date.now,
    private readonly options: SqlRepositoryOptions = {},
  ) {}

  private init(): Promise<void> {
    if (!this.ready) {
      this.ready = this.options.migrate === false ? Promise.resolve() : migrate(this.db).then(() => undefined);
    }
    return this.ready;
  }

  async load(): Promise<GameState | null> {
    await this.init();
    const profileRow = await this.db.get<{ data: string }>('SELECT data FROM profile WHERE id = 1');
    if (!profileRow) return null;
    const now = this.clock();

    const questionStates: GameState['questionStates'] = {};
    for (const r of await this.db.all<QuestionStateRow>('SELECT * FROM question_state')) {
      questionStates[r.question_id] = rowToQuestionState(r);
    }
    const ledger: GameState['ledger'] = {};
    for (const r of await this.db.all<{ key: string; granted_at: number }>('SELECT * FROM reward_ledger')) {
      ledger[r.key] = r.granted_at;
    }
    const inventory: GameState['inventory'] = {};
    for (const r of await this.db.all<{ item_id: string; acquired_at: number; source: string }>('SELECT * FROM inventory')) {
      inventory[r.item_id] = { itemId: r.item_id, acquiredAt: r.acquired_at, source: r.source };
    }
    const campaign: GameState['campaign'] = {};
    for (const r of await this.db.all<{
      node_id: string;
      completed_at: number | null;
      best_correct: number;
      runs: number;
      best_score: number | null;
      best_stars: number | null;
      last_score: number | null;
    }>('SELECT * FROM campaign_progress')) {
      campaign[r.node_id] = {
        nodeId: r.node_id,
        completedAt: r.completed_at,
        bestCorrect: r.best_correct,
        runs: r.runs,
        bestScore: r.best_score ?? null,
        bestStars: r.best_stars ?? 0,
        lastScore: r.last_score ?? null,
      };
    }
    const bosses: GameState['bosses'] = {};
    for (const r of await this.db.all<{
      boss_id: string;
      attempts: number;
      wins: number;
      failed_since_win: number;
      first_win_at: number | null;
      flawless: number;
      best_turns: number | null;
    }>('SELECT * FROM boss_progress')) {
      bosses[r.boss_id] = {
        bossId: r.boss_id,
        attempts: r.attempts,
        wins: r.wins,
        failedSinceWin: r.failed_since_win,
        firstWinAt: r.first_win_at,
        flawless: r.flawless === 1,
        bestTurns: r.best_turns,
      };
    }
    const runs = await this.db.all<{ kind: string; data: string }>('SELECT kind, data FROM active_run');
    const sessionRow = runs.find((r) => r.kind === 'session');
    const battleRow = runs.find((r) => r.kind === 'battle');
    const boards = await this.db.all<{ period: string; data: string }>('SELECT period, data FROM quest_board');
    const academy: Record<string, StageProgress> = {};
    // O banco legado é lido sem migrar (`migrate: false`) e pode não ter as tabelas da Academia.
    const academyRows = (await this.hasTable('academy_progress'))
      ? await this.db.all<{ stage_ref: string; data: string }>('SELECT stage_ref, data FROM academy_progress')
      : [];
    for (const r of academyRows) {
      const p = safeParse<StageProgress>(r.data);
      if (p) academy[r.stage_ref] = { ...p, ref: r.stage_ref };
    }
    const board = (period: string) => {
      const row = boards.find((b) => b.period === period);
      return row ? safeParse<QuestBoard>(row.data) : null;
    };

    return normalizeState(
      {
        profile: safeParse(profileRow.data),
        questionStates,
        inventory,
        ledger,
        campaign,
        bosses,
        session: sessionRow ? safeParse<ActiveSession>(sessionRow.data) : null,
        battle: battleRow ? safeParse<BattleState>(battleRow.data) : null,
        quests: { daily: board('daily'), weekly: board('weekly') },
        academy,
      },
      now,
    );
  }

  private async hasTable(name: string): Promise<boolean> {
    return !!(await this.db.get<{ ok: number }>("SELECT 1 AS ok FROM sqlite_master WHERE type = 'table' AND name = ?", [name]));
  }

  async commit(state: GameState, delta: Delta, kv: KvWrite[] = []): Promise<void> {
    await this.init();
    const now = this.clock();
    await this.db.transaction(async (tx) => {
      await this.writeDelta(tx, state, delta, now);
      await writeKv(tx, kv);
    });
  }

  private async writeDelta(tx: SqlExecutor, state: GameState, delta: Delta, now: number): Promise<void> {
    if (delta.profile) {
      await tx.run('INSERT OR REPLACE INTO profile (id, data, updated_at) VALUES (1, ?, ?)', [
        JSON.stringify(state.profile),
        now,
      ]);
    }
    for (const id of delta.questionStates) {
      const s = state.questionStates[id];
      if (s) await upsertQuestionState(tx, s);
    }
    for (const a of delta.attempts) await insertAttempt(tx, a);
    for (const key of delta.ledger) {
      await tx.run('INSERT OR IGNORE INTO reward_ledger (key, granted_at) VALUES (?, ?)', [key, state.ledger[key] ?? now]);
    }
    for (const itemId of delta.inventory) {
      const e = state.inventory[itemId];
      if (e) {
        await tx.run('INSERT OR IGNORE INTO inventory (item_id, acquired_at, source) VALUES (?, ?, ?)', [
          e.itemId,
          e.acquiredAt,
          e.source,
        ]);
      }
    }
    for (const nodeId of delta.campaign) {
      const p = state.campaign[nodeId];
      if (p) await upsertNode(tx, p);
    }
    for (const bossId of delta.bosses) {
      const p = state.bosses[bossId];
      if (p) await upsertBoss(tx, p);
    }
    if (delta.session) await writeRun(tx, 'session', state.session, now);
    if (delta.battle) await writeRun(tx, 'battle', state.battle, now);
    if (delta.quests) {
      for (const period of ['daily', 'weekly'] as const) {
        const b = state.quests[period];
        if (b) {
          await tx.run('INSERT OR REPLACE INTO quest_board (period, data, updated_at) VALUES (?, ?, ?)', [
            period,
            JSON.stringify(b),
            now,
          ]);
        } else {
          await tx.run('DELETE FROM quest_board WHERE period = ?', [period]);
        }
      }
    }
    for (const ref of delta.academy ?? []) {
      const p = state.academy[ref];
      if (p) {
        await tx.run('INSERT OR REPLACE INTO academy_progress (stage_ref, data, updated_at) VALUES (?, ?, ?)', [ref, JSON.stringify(p), now]);
      }
    }
    for (const a of delta.academyAnswers ?? []) await insertAcademyAnswer(tx, a);
  }

  async reset(): Promise<void> {
    await this.init();
    await this.db.transaction(async (tx) => {
      for (const table of [...PROGRESS_TABLES, ...HISTORY_TABLES]) await tx.exec(`DELETE FROM ${table}`);
    });
  }

  async replaceAll(state: GameState, opts: { kv?: KvWrite[]; wipeAttempts?: boolean } = {}): Promise<void> {
    await this.init();
    const now = this.clock();
    await this.db.transaction(async (tx) => {
      for (const table of PROGRESS_TABLES) await tx.exec(`DELETE FROM ${table}`);
      if (opts.wipeAttempts) for (const table of HISTORY_TABLES) await tx.exec(`DELETE FROM ${table}`);
      await this.writeDelta(tx, state, fullDelta(state), now);
      await writeKv(tx, opts.kv ?? []);
    });
  }

  async getKv(key: string): Promise<string | null> {
    await this.init();
    return (await this.db.get<{ value: string }>('SELECT value FROM sync_kv WHERE key = ?', [key]))?.value ?? null;
  }

  async setKv(writes: KvWrite[]): Promise<void> {
    await this.init();
    await this.db.transaction((tx) => writeKv(tx, writes));
  }

  async attemptsAfter(cursor: number, limit: number): Promise<StoredAttempt[]> {
    await this.init();
    const rows = await this.db.all<AttemptRow & { rid: number }>(
      'SELECT rowid AS rid, * FROM attempts WHERE rowid > ? ORDER BY rowid LIMIT ?',
      [cursor, limit],
    );
    return rows.map((r) => ({ rowid: r.rid, attempt: rowToAttempt(r) }));
  }

  async maxAttemptRowid(): Promise<number> {
    await this.init();
    return (await this.db.get<{ m: number | null }>('SELECT MAX(rowid) AS m FROM attempts'))?.m ?? 0;
  }

  async importAttempts(attempts: Attempt[]): Promise<number> {
    await this.init();
    await this.db.transaction(async (tx) => {
      for (const a of attempts) await insertAttempt(tx, a);
    });
    return this.maxAttemptRowid();
  }

  async recentAttempts(limit: number): Promise<Attempt[]> {
    await this.init();
    const rows = await this.db.all<AttemptRow>('SELECT * FROM attempts ORDER BY created_at DESC LIMIT ?', [limit]);
    return rows.map(rowToAttempt);
  }

  async activitySince(since: number): Promise<Attempt[]> {
    await this.init();
    const rows = await this.db.all<AttemptRow>('SELECT * FROM attempts WHERE created_at >= ? ORDER BY created_at DESC, id DESC', [since]);
    return rows.map(rowToAttempt);
  }

  async mistakeHistory(limit: number, offset: number): Promise<Attempt[]> {
    await this.init();
    const rows = await this.db.all<AttemptRow>('SELECT * FROM attempts WHERE correct = 0 ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?', [limit, offset]);
    return rows.map(rowToAttempt);
  }
}

function rowToAttempt(r: AttemptRow): Attempt {
  return {
    id: r.id,
    questionId: r.question_id,
    sessionId: r.session_id,
    mode: r.mode,
    chosen: r.chosen,
    correct: r.correct === 1,
    guessed: r.guessed === 1,
    hints: r.hints,
    timeMs: r.time_ms,
    xp: r.xp,
    kind: r.kind,
    createdAt: r.created_at,
  };
}

async function writeKv(tx: SqlExecutor, writes: KvWrite[]) {
  for (const w of writes) {
    if (w.value === null) await tx.run('DELETE FROM sync_kv WHERE key = ?', [w.key]);
    else await tx.run('INSERT OR REPLACE INTO sync_kv (key, value) VALUES (?, ?)', [w.key, w.value]);
  }
}

async function upsertQuestionState(tx: SqlExecutor, s: QuestionState) {
  const values: SqlValue[] = [
    s.questionId,
    s.box,
    s.dueAt,
    s.seen,
    s.correct,
    s.wrong,
    s.guessedCorrect,
    s.lastAnsweredAt,
    s.lastCorrectAt,
    s.lastWrongAt,
    s.lastWrongSessionId,
    s.lastXpAt,
    b(s.echo),
    b(s.favorite),
    b(s.flagged),
  ];
  await tx.run(
    `INSERT OR REPLACE INTO question_state (question_id, box, due_at, seen, correct, wrong, guessed_correct,
      last_answered_at, last_correct_at, last_wrong_at, last_wrong_session_id, last_xp_at, echo, favorite, flagged)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    values,
  );
}

async function insertAttempt(tx: SqlExecutor, a: Attempt) {
  // OR IGNORE: um ID repetido (toque duplo, nova tentativa de gravação) nunca duplica a tentativa.
  await tx.run(
    `INSERT OR IGNORE INTO attempts (id, question_id, session_id, mode, chosen, correct, guessed, hints, time_ms, xp, kind, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [a.id, a.questionId, a.sessionId, a.mode, a.chosen, b(a.correct), b(a.guessed), a.hints, a.timeMs, a.xp, a.kind, a.createdAt],
  );
}

async function insertAcademyAnswer(tx: SqlExecutor, a: AcademyAnswer) {
  // Log imutável: repetir o id (toque duplo, nova tentativa de gravação) não duplica a resposta.
  await tx.run(
    `INSERT OR IGNORE INTO academy_answers (id, stage_ref, exercise_id, mode, correct, hints, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [a.id, a.ref, a.exerciseId, a.mode, b(a.correct), a.hints, a.createdAt],
  );
}

async function upsertNode(tx: SqlExecutor, p: NodeProgress) {
  await tx.run(
    `INSERT OR REPLACE INTO campaign_progress (node_id, completed_at, best_correct, runs, best_score, best_stars, last_score)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [p.nodeId, p.completedAt, p.bestCorrect, p.runs, p.bestScore, p.bestStars, p.lastScore],
  );
}

async function upsertBoss(tx: SqlExecutor, p: BossProgress) {
  await tx.run(
    `INSERT OR REPLACE INTO boss_progress (boss_id, attempts, wins, failed_since_win, first_win_at, flawless, best_turns)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [p.bossId, p.attempts, p.wins, p.failedSinceWin, p.firstWinAt, b(p.flawless), p.bestTurns],
  );
}

async function writeRun(tx: SqlExecutor, kind: 'session' | 'battle', value: unknown, now: number) {
  if (value === null || value === undefined) {
    await tx.run('DELETE FROM active_run WHERE kind = ?', [kind]);
  } else {
    await tx.run('INSERT OR REPLACE INTO active_run (kind, data, updated_at) VALUES (?, ?, ?)', [
      kind,
      JSON.stringify(value),
      now,
    ]);
  }
}
