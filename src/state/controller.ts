/**
 * Orquestra domínio → persistência → store.
 * Toda mudança de progresso passa por `dispatch`, que:
 *  1. roda o reducer puro sobre o estado atual;
 *  2. grava o Delta numa transação;
 *  3. só então publica o novo estado (falha ⇒ nada muda na tela).
 * As operações são enfileiradas: toques duplos nunca rodam em paralelo.
 */
import { createInitialState, fullDelta, touch } from '../domain/game/game';
import type { GameEvent, GameState, Result } from '../domain/game/types';
import type { GameRepository } from '../data/repository/GameRepository';

export type Reducer = (state: GameState, now: number) => Result;

export interface ControllerDeps {
  repo: GameRepository;
  clock?: () => number;
  /** Fuso do aparelho em minutos (Date#getTimezoneOffset). */
  tzOffset?: () => number;
  onState: (state: GameState, events: GameEvent[]) => void;
}

export class GameController {
  private state: GameState | null = null;
  private queue: Promise<unknown> = Promise.resolve();
  private readonly clock: () => number;
  private readonly tzOffset: () => number;

  constructor(private readonly deps: ControllerDeps) {
    this.clock = deps.clock ?? Date.now;
    this.tzOffset = deps.tzOffset ?? (() => new Date().getTimezoneOffset());
  }

  get current(): GameState | null {
    return this.state;
  }

  /** Carrega (ou cria) o estado e aplica o Descanso do Viajante. */
  init(): Promise<GameEvent[]> {
    return this.enqueue(async () => {
      const now = this.clock();
      let state = await this.deps.repo.load();
      if (!state) {
        state = createInitialState(now);
        await this.deps.repo.commit(state, fullDelta(state));
      }
      const touched = touch(state, now, this.tzOffset());
      await this.deps.repo.commit(touched.state, touched.delta);
      this.state = touched.state;
      this.deps.onState(touched.state, touched.events);
      return touched.events;
    });
  }

  dispatch(reducer: Reducer): Promise<Result> {
    return this.enqueue(async () => {
      if (!this.state) throw new Error('Jogo ainda não carregado');
      const result = reducer(this.state, this.clock());
      await this.deps.repo.commit(result.state, result.delta);
      this.state = result.state;
      this.deps.onState(result.state, result.events);
      return result;
    });
  }

  reset(): Promise<void> {
    return this.enqueue(async () => {
      await this.deps.repo.reset();
      const state = createInitialState(this.clock());
      await this.deps.repo.commit(state, fullDelta(state));
      this.state = state;
      this.deps.onState(state, []);
    });
  }

  activitySince(since: number) {
    return this.enqueue(() => this.deps.repo.activitySince(since));
  }

  mistakeHistory(limit: number, offset: number) {
    return this.enqueue(() => this.deps.repo.mistakeHistory(limit, offset));
  }

  private enqueue<T>(job: () => Promise<T>): Promise<T> {
    const run = this.queue.then(job, job);
    this.queue = run.catch(() => undefined);
    return run;
  }
}
