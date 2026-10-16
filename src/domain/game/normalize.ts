/**
 * Normaliza um estado carregado do armazenamento. Versões antigas do app gravaram
 * estados sem campos que vieram depois; aqui eles recebem valores padrão seguros.
 * Nunca remove nem altera dados existentes.
 */
import { findNode } from '../../content/regions';
import type { BattleState } from '../boss/battle';
import type { NodeProgress } from '../campaign/campaign';
import type { QuestsState } from '../quests/quests';
import { createInitialState } from './game';
import type { GameState, Profile } from './types';

type Loose<T> = { [K in keyof T]?: T[K] | null | undefined };

export function normalizeProfile(raw: unknown, now: number): Profile {
  const defaults = createInitialState(now).profile;
  if (!raw || typeof raw !== 'object') return defaults;
  const p = raw as Loose<Profile>;
  return {
    ...defaults,
    ...(Object.fromEntries(Object.entries(p).filter(([, v]) => v !== undefined)) as Partial<Profile>),
    equipped: { ...defaults.equipped, ...(p.equipped ?? {}) },
    totals: { ...defaults.totals, ...(p.totals ?? {}) },
    settings: { ...defaults.settings, ...(p.settings ?? {}) },
    targets: { ...(p.targets ?? {}) },
    tzOffsetMin: typeof p.tzOffsetMin === 'number' ? p.tzOffsetMin : defaults.tzOffsetMin,
  };
}

/**
 * Progresso de missão gravado antes da pontuação (v0.2.0): sem pontuação, e as
 * estrelas são deduzidas do melhor número de acertos já registrado. Linhas que já têm
 * pontuação guardam as estrelas de verdade (só das questões planejadas) — deduzir de novo
 * a partir de `bestCorrect`, que conta o reforço do andaime, inflaria as estrelas.
 */
export function normalizeNodeProgress(p: Loose<NodeProgress> & { nodeId: string }): NodeProgress {
  const found = findNode(p.nodeId);
  const total = found && found.node.kind === 'mission' ? found.node.questionCount : 0;
  const pass = found && found.node.kind === 'mission' ? found.node.passCorrect : Infinity;
  const bestCorrect = p.bestCorrect ?? 0;
  const scored = p.bestScore != null;
  let derived = !scored && p.completedAt != null ? 1 : 0;
  if (derived && total > 0 && bestCorrect >= pass) derived = bestCorrect >= total ? 3 : bestCorrect >= total - 1 ? 2 : 1;
  return {
    nodeId: p.nodeId,
    completedAt: p.completedAt ?? null,
    bestCorrect,
    runs: p.runs ?? 0,
    bestScore: p.bestScore ?? null,
    bestStars: Math.max(p.bestStars ?? 0, derived),
    lastScore: p.lastScore ?? null,
  };
}

function normalizeBattle(b: BattleState | null | undefined): BattleState | null {
  if (!b) return null;
  return { ...b, turns: (b.turns ?? []).map((t) => ({ ...t, healed: t.healed ?? 0 })) };
}

function normalizeQuests(q: Partial<QuestsState> | null | undefined): QuestsState {
  const board = (x: QuestsState['daily'] | undefined) =>
    x ? { ...x, progress: x.progress ?? {}, days: x.days ?? [], studyMs: x.studyMs ?? 0 } : null;
  return { daily: board(q?.daily), weekly: board(q?.weekly) };
}

export function normalizeState(raw: Loose<GameState>, now: number): GameState {
  return {
    profile: normalizeProfile(raw.profile, now),
    questionStates: raw.questionStates ?? {},
    inventory: raw.inventory ?? {},
    ledger: raw.ledger ?? {},
    campaign: Object.fromEntries(
      Object.entries(raw.campaign ?? {}).map(([id, p]) => [id, normalizeNodeProgress({ ...p, nodeId: p.nodeId ?? id })]),
    ),
    bosses: raw.bosses ?? {},
    session: raw.session ?? null,
    battle: normalizeBattle(raw.battle),
    quests: normalizeQuests(raw.quests),
  };
}
