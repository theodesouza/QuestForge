import { create } from 'zustand';
import type { GameEvent, GameState, SessionSummary } from '../domain/game/types';
import type { Reward } from '../domain/progression/rewards';

export interface LevelUpCelebration {
  id: string;
  from: number;
  to: number;
  rewards: { level: number; rewards: Reward[] }[];
}

export interface GameStore {
  status: 'loading' | 'ready' | 'error';
  error: string | null;
  game: GameState | null;
  celebrations: LevelUpCelebration[];
  lastSummary: SessionSummary | null;
  /** Bônus de retorno recém-concedido (mostrado uma vez no Acampamento). */
  restedNotice: number | null;
  /** Momento da última publicação de estado (evita Date.now() durante a renderização). */
  now: number;
}

export const useGameStore = create<GameStore>(() => ({
  status: 'loading',
  error: null,
  game: null,
  celebrations: [],
  lastSummary: null,
  restedNotice: null,
  now: 0,
}));

let celebrationSeq = 0;

/** Aplica um novo estado e converte eventos em efeitos de interface. */
export function publish(state: GameState, events: GameEvent[]) {
  const patch: Partial<GameStore> = { game: state, status: 'ready', error: null, now: Date.now() };
  const levelUps = events.filter((e): e is Extract<GameEvent, { type: 'levelUp' }> => e.type === 'levelUp');
  if (levelUps.length) {
    patch.celebrations = [
      ...useGameStore.getState().celebrations,
      ...levelUps.map((e) => ({ id: `c${celebrationSeq++}`, from: e.from, to: e.to, rewards: e.rewards })),
    ];
  }
  for (const e of events) {
    if (e.type === 'sessionComplete') patch.lastSummary = e.summary;
    if (e.type === 'rested') patch.restedNotice = e.gained;
  }
  useGameStore.setState(patch);
}

/** Seletor que exige o jogo carregado (telas só renderizam após o boot). */
export function useGame<T>(selector: (g: GameState) => T): T {
  return useGameStore((s) => selector(s.game as GameState));
}
