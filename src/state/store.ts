import { create } from 'zustand';
import type { GameEvent, GameState, SessionSummary } from '../domain/game/types';
import type { Reward } from '../domain/progression/rewards';

export interface LevelUpCelebration {
  id: string;
  from: number;
  to: number;
  rewards: { level: number; rewards: Reward[] }[];
}

/** Aviso curto no topo da tela (encomenda cumprida, baú, compra). */
export interface Toast {
  id: string;
  title: string;
  detail: string;
  tone: 'quest' | 'bonus' | 'purchase' | 'echo' | 'news';
}

/** Item recém-conquistado, esperando a cerimônia de revelação. */
export interface ItemReveal {
  id: string;
  itemId: string;
  source: string;
  autoEquipped: boolean;
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
  toasts: Toast[];
  reveals: ItemReveal[];
}

export const useGameStore = create<GameStore>(() => ({
  status: 'loading',
  error: null,
  game: null,
  celebrations: [],
  lastSummary: null,
  restedNotice: null,
  now: 0,
  toasts: [],
  reveals: [],
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
  const toasts: Toast[] = [];
  const reveals: ItemReveal[] = [];
  for (const e of events) {
    if (e.type === 'item') reveals.push({ id: `r${celebrationSeq++}`, itemId: e.itemId, source: e.source, autoEquipped: e.autoEquipped });
    if (e.type === 'sessionComplete') patch.lastSummary = e.summary;
    if (e.type === 'rested') patch.restedNotice = e.gained;
    if (e.type === 'questComplete') {
      toasts.push({ id: `t${celebrationSeq++}`, tone: 'quest', title: 'Encomenda cumprida', detail: `${e.title} · +${e.xp} XP · +${e.ink} Tinta` });
    }
    if (e.type === 'echoesFaded') {
      toasts.push({
        id: `t${celebrationSeq++}`,
        tone: 'echo',
        title: e.count > 1 ? 'Ecos antigos dissipados' : 'Um Eco antigo se dissipou',
        detail: `${e.count} Eco${e.count > 1 ? 's' : ''} muito antigo${e.count > 1 ? 's' : ''} deixou${e.count > 1 ? 'aram' : ''} de pesar — as questões seguem na sua rota.`,
      });
    }
    if (e.type === 'news') toasts.push({ id: `t${celebrationSeq++}`, tone: 'news', title: e.title, detail: e.detail });
    if (e.type === 'questBonus') {
      toasts.push({
        id: `t${celebrationSeq++}`,
        tone: 'bonus',
        title: e.period === 'daily' ? 'Baú do dia aberto!' : 'Baú da semana aberto!',
        detail: `+${e.xp} XP · +${e.ink} Tinta${e.itemId ? ' · novo título' : ''}`,
      });
    }
  }
  if (toasts.length) patch.toasts = [...useGameStore.getState().toasts, ...toasts];
  if (reveals.length) patch.reveals = [...useGameStore.getState().reveals, ...reveals];
  useGameStore.setState(patch);
}

/** Seletor que exige o jogo carregado (telas só renderizam após o boot). */
export function useGame<T>(selector: (g: GameState) => T): T {
  return useGameStore((s) => selector(s.game as GameState));
}
