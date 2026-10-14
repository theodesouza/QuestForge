/**
 * Normaliza um estado carregado do armazenamento. Versões antigas do app gravaram
 * estados sem campos que vieram depois; aqui eles recebem valores padrão seguros.
 * Nunca remove nem altera dados existentes.
 */
import type { BattleState } from '../boss/battle';
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
    campaign: raw.campaign ?? {},
    bosses: raw.bosses ?? {},
    session: raw.session ?? null,
    battle: normalizeBattle(raw.battle),
    quests: normalizeQuests(raw.quests),
  };
}
