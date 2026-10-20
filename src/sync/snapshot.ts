/**
 * Snapshot de sincronização: a parte do GameState que viaja para a nuvem.
 *
 * Fica FORA do snapshot (e portanto só no aparelho):
 *  - `session` e `battle` — execuções em andamento, presas às sementes e à ordem embaralhada daquele aparelho;
 *  - `profile.tzOffsetMin` — fuso do aparelho, atualizado a cada abertura;
 *  - `attempts` — log append-only, sincronizado à parte (ver `attempts.ts`).
 *
 * O formato é versionado (`SNAPSHOT_SCHEMA`) e canônico: o mesmo estado SEMPRE gera a mesma
 * string (chaves ordenadas), então comparar strings é comparar estados.
 *
 * Regra de compatibilidade: acrescentar um campo que um app antigo não saiba reler e regravar
 * exige subir `SNAPSHOT_SCHEMA`. Um app que encontra um schema maior que o seu NUNCA sincroniza
 * (ver `SnapshotError('too-new')`) — assim uma versão antiga não apaga campos que não conhece.
 */
import type { NodeProgress, BossProgress } from '../domain/campaign/campaign';
import { normalizeNodeProgress, normalizeProfile, normalizeQuests } from '../domain/game/normalize';
import { createInitialState } from '../domain/game/game';
import type { GameState, InventoryEntry, Profile } from '../domain/game/types';
import type { QuestionState } from '../domain/learning/srs';
import type { QuestsState } from '../domain/quests/quests';
import { levelForXp } from '../domain/progression/levels';

export const SNAPSHOT_SCHEMA = 1;

/** Teto do campo `data` no Firestore (o documento aceita 1 MiB; deixamos folga para os metadados). */
export const MAX_DATA_CHARS = 900_000;

export type SyncProfile = Omit<Profile, 'tzOffsetMin'>;

export interface SyncState {
  profile: SyncProfile;
  questionStates: Record<string, QuestionState>;
  inventory: Record<string, InventoryEntry>;
  /** Registro idempotente de recompensas: chave → concedida em. */
  ledger: Record<string, number>;
  campaign: Record<string, NodeProgress>;
  bosses: Record<string, BossProgress>;
  quests: QuestsState;
}

export type SnapshotErrorCode = 'corrupt' | 'too-new' | 'too-large';

export class SnapshotError extends Error {
  constructor(
    readonly code: SnapshotErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'SnapshotError';
  }
}

// ——————————————————————————————————————————————— conversão GameState ⇄ SyncState

export function toSyncState(g: GameState): SyncState {
  const { tzOffsetMin: _tz, ...profile } = g.profile;
  void _tz;
  return {
    profile,
    questionStates: g.questionStates,
    inventory: g.inventory,
    ledger: g.ledger,
    campaign: g.campaign,
    bosses: g.bosses,
    quests: g.quests,
  };
}

/** Aplica um SyncState sobre o estado local, preservando o que é só do aparelho. */
export function withSyncState(local: GameState, s: SyncState): GameState {
  return {
    ...local,
    profile: { ...s.profile, tzOffsetMin: local.profile.tzOffsetMin },
    questionStates: s.questionStates,
    inventory: s.inventory,
    ledger: s.ledger,
    campaign: s.campaign,
    bosses: s.bosses,
    quests: s.quests,
  };
}

/** Estado inicial de uma conta nova (usado como base de quem nunca sincronizou). */
export function pristineSyncState(now: number): SyncState {
  return toSyncState(createInitialState(now));
}

/** Verdadeiro se nada foi feito ainda (nenhum progresso a perder). */
export function isPristine(s: SyncState): boolean {
  return (
    !s.profile.onboarded &&
    s.profile.xp === 0 &&
    s.profile.totals.answered === 0 &&
    Object.keys(s.questionStates).length === 0 &&
    Object.keys(s.ledger).length === 0 &&
    Object.keys(s.campaign).length === 0 &&
    Object.keys(s.bosses).length === 0
  );
}

// ——————————————————————————————————————————————— serialização canônica

/** JSON com chaves ordenadas recursivamente (arrays mantêm a ordem). */
export function stableStringify(value: unknown): string {
  return JSON.stringify(sortKeys(value));
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(value as object).sort()) {
      const v = (value as Record<string, unknown>)[k];
      if (v !== undefined) out[k] = sortKeys(v);
    }
    return out;
  }
  return value;
}

const b = (v: boolean): number => (v ? 1 : 0);

function packQuestion(q: QuestionState): unknown[] {
  return [
    q.box,
    q.dueAt,
    q.seen,
    q.correct,
    q.wrong,
    q.guessedCorrect,
    q.lastAnsweredAt,
    q.lastCorrectAt,
    q.lastWrongAt,
    q.lastWrongSessionId,
    q.lastXpAt,
    b(q.echo),
    b(q.favorite),
    b(q.flagged),
  ];
}

/** Estados de questão sem nenhum registro útil não precisam viajar. */
function isBlankQuestion(q: QuestionState): boolean {
  return q.seen === 0 && !q.echo && !q.favorite && !q.flagged && q.dueAt === null;
}

/**
 * Forma compacta: `questionStates`, `inventory`, `campaign` e `bosses` viram tuplas (o campo
 * mais volumoso são os estados de questão: ~110 bytes cada em vez de ~330).
 */
export function encodeSyncState(s: SyncState): string {
  const qs: Record<string, unknown[]> = {};
  for (const [id, q] of Object.entries(s.questionStates)) if (!isBlankQuestion(q)) qs[id] = packQuestion(q);
  const inv: Record<string, unknown[]> = {};
  for (const [id, e] of Object.entries(s.inventory)) inv[id] = [e.acquiredAt, e.source];
  const camp: Record<string, unknown[]> = {};
  for (const [id, p] of Object.entries(s.campaign)) {
    camp[id] = [p.completedAt, p.bestCorrect, p.runs, p.bestScore, p.bestStars, p.lastScore];
  }
  const boss: Record<string, unknown[]> = {};
  for (const [id, p] of Object.entries(s.bosses)) {
    boss[id] = [p.attempts, p.wins, p.failedSinceWin, p.firstWinAt, b(p.flawless), p.bestTurns];
  }
  const text = stableStringify({
    v: SNAPSHOT_SCHEMA,
    profile: s.profile,
    qs,
    inv,
    led: s.ledger,
    camp,
    boss,
    quests: s.quests,
  });
  if (text.length > MAX_DATA_CHARS) {
    throw new SnapshotError('too-large', `Snapshot com ${text.length} caracteres excede ${MAX_DATA_CHARS}`);
  }
  return text;
}

type Json = Record<string, unknown>;
const isObj = (v: unknown): v is Json => !!v && typeof v === 'object' && !Array.isArray(v);
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const numOrNull = (v: unknown): number | null => (isNum(v) ? v : null);
const strOrNull = (v: unknown): string | null => (typeof v === 'string' ? v : null);

function corrupt(what: string): never {
  throw new SnapshotError('corrupt', `Snapshot inválido: ${what}`);
}

/** Lê e valida um snapshot. Nunca devolve um estado parcial: ou é íntegro, ou lança SnapshotError. */
export function decodeSyncState(text: string, now = Date.now()): SyncState {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return corrupt('JSON ilegível');
  }
  if (!isObj(raw)) return corrupt('raiz não é objeto');
  if (!isNum(raw.v)) return corrupt('sem versão de schema');
  if (raw.v > SNAPSHOT_SCHEMA) throw new SnapshotError('too-new', `Snapshot de schema ${raw.v}; este app entende até ${SNAPSHOT_SCHEMA}`);
  if (!isObj(raw.profile)) return corrupt('perfil ausente');
  if (!isObj(raw.qs) || !isObj(raw.inv) || !isObj(raw.led) || !isObj(raw.camp) || !isObj(raw.boss)) return corrupt('coleção ausente');

  const profile = normalizeProfile(raw.profile, now);
  if (!isNum(profile.xp) || profile.xp < 0 || !isNum(profile.ink) || !Number.isInteger(profile.xp)) corrupt('XP/Tinta inválidos');
  const { tzOffsetMin: _tz, ...syncProfile } = profile;
  void _tz;

  const questionStates: SyncState['questionStates'] = {};
  for (const [id, t] of Object.entries(raw.qs)) {
    if (!Array.isArray(t) || t.length < 14) corrupt(`estado da questão ${id}`);
    questionStates[id] = {
      questionId: id,
      box: Number(t[0]),
      dueAt: numOrNull(t[1]),
      seen: Number(t[2]),
      correct: Number(t[3]),
      wrong: Number(t[4]),
      guessedCorrect: Number(t[5]),
      lastAnsweredAt: numOrNull(t[6]),
      lastCorrectAt: numOrNull(t[7]),
      lastWrongAt: numOrNull(t[8]),
      lastWrongSessionId: strOrNull(t[9]),
      lastXpAt: numOrNull(t[10]),
      echo: t[11] === 1,
      favorite: t[12] === 1,
      flagged: t[13] === 1,
    };
  }
  const inventory: SyncState['inventory'] = {};
  for (const [id, t] of Object.entries(raw.inv)) {
    if (!Array.isArray(t) || !isNum(t[0]) || typeof t[1] !== 'string') corrupt(`item ${id}`);
    inventory[id] = { itemId: id, acquiredAt: t[0], source: t[1] };
  }
  const ledger: SyncState['ledger'] = {};
  for (const [key, at] of Object.entries(raw.led)) {
    if (!isNum(at)) corrupt(`registro ${key}`);
    ledger[key] = at;
  }
  const campaign: SyncState['campaign'] = {};
  for (const [id, t] of Object.entries(raw.camp)) {
    if (!Array.isArray(t) || t.length < 6) corrupt(`missão ${id}`);
    campaign[id] = normalizeNodeProgress({
      nodeId: id,
      completedAt: numOrNull(t[0]),
      bestCorrect: Number(t[1]),
      runs: Number(t[2]),
      bestScore: numOrNull(t[3]),
      bestStars: Number(t[4]),
      lastScore: numOrNull(t[5]),
    });
  }
  const bosses: SyncState['bosses'] = {};
  for (const [id, t] of Object.entries(raw.boss)) {
    if (!Array.isArray(t) || t.length < 6) corrupt(`chefão ${id}`);
    bosses[id] = {
      bossId: id,
      attempts: Number(t[0]),
      wins: Number(t[1]),
      failedSinceWin: Number(t[2]),
      firstWinAt: numOrNull(t[3]),
      flawless: t[4] === 1,
      bestTurns: numOrNull(t[5]),
    };
  }
  const quests = normalizeQuests(raw.quests as Partial<QuestsState> | undefined);
  return { profile: syncProfile, questionStates, inventory, ledger, campaign, bosses, quests };
}

// ——————————————————————————————————————————————— dirty, hash e estatísticas

/**
 * Campos que mudam a cada abertura do app sem representar progresso. Mudanças SÓ neles não
 * disparam envio (poupa uma gravação por abertura); viajam junto com a próxima mudança real.
 */
function withoutVolatile(s: SyncState): SyncState {
  return { ...s, profile: { ...s.profile, lastActiveAt: null, restedPool: 0 } };
}

/** Chave de comparação: dois estados com a mesma chave não têm diferença que valha enviar. */
export function meaningfulKey(s: SyncState): string {
  return encodeSyncState(withoutVolatile(s));
}

/** Hash de 53 bits (cyrb53) — detecta truncamento/corrupção; NÃO é criptográfico. */
export function hashText(text: string, seed = 0): string {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(14, '0');
}

export interface SyncStats {
  xp: number;
  level: number;
  ink: number;
  answered: number;
  questions: number;
  items: number;
  ledger: number;
  nodes: number;
  stars: number;
  bosses: number;
}

/** Resumo exibido ao confirmar restauração/migração e usado em verificações antes/depois. */
export function statsOf(s: SyncState): SyncStats {
  return {
    xp: s.profile.xp,
    level: levelForXp(s.profile.xp),
    ink: s.profile.ink,
    answered: s.profile.totals.answered,
    questions: Object.values(s.questionStates).filter((q) => q.seen > 0).length,
    items: Object.keys(s.inventory).length,
    ledger: Object.keys(s.ledger).length,
    nodes: Object.values(s.campaign).filter((n) => n.completedAt !== null).length,
    stars: Object.values(s.campaign).reduce((sum, n) => sum + n.bestStars, 0),
    bosses: Object.values(s.bosses).filter((p) => p.wins > 0).length,
  };
}

