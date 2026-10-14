/**
 * Rascunho copy-on-write de um GameState. Cada mutação copia apenas o ramo
 * alterado e marca a chave como "suja" no Delta, que o repositório grava numa
 * única transação.
 */
import type { BattleState } from '../boss/battle';
import type { BossProgress, NodeProgress } from '../campaign/campaign';
import type { QuestionState } from '../learning/srs';
import type {
  ActiveSession,
  Attempt,
  Delta,
  GameEvent,
  GameState,
  InventoryEntry,
  Profile,
  Result,
} from './types';

export function emptyDelta(): Delta {
  return {
    profile: false,
    questionStates: [],
    attempts: [],
    ledger: [],
    inventory: [],
    campaign: [],
    bosses: [],
    session: false,
    battle: false,
  };
}

function addUnique(list: string[], key: string) {
  if (!list.includes(key)) list.push(key);
}

export class Tx {
  state: GameState;
  readonly events: GameEvent[] = [];
  readonly delta: Delta = emptyDelta();

  constructor(base: GameState) {
    this.state = { ...base };
  }

  get profile(): Profile {
    return this.state.profile;
  }

  patchProfile(patch: Partial<Profile>) {
    this.state.profile = { ...this.state.profile, ...patch };
    this.delta.profile = true;
  }

  setQuestionState(qs: QuestionState) {
    this.state.questionStates = { ...this.state.questionStates, [qs.questionId]: qs };
    addUnique(this.delta.questionStates, qs.questionId);
  }

  addAttempt(a: Attempt) {
    this.delta.attempts.push(a);
  }

  hasLedger(key: string): boolean {
    return key in this.state.ledger;
  }

  addLedger(key: string, at: number) {
    this.state.ledger = { ...this.state.ledger, [key]: at };
    addUnique(this.delta.ledger, key);
  }

  addInventory(entry: InventoryEntry) {
    this.state.inventory = { ...this.state.inventory, [entry.itemId]: entry };
    addUnique(this.delta.inventory, entry.itemId);
  }

  setNodeProgress(p: NodeProgress) {
    this.state.campaign = { ...this.state.campaign, [p.nodeId]: p };
    addUnique(this.delta.campaign, p.nodeId);
  }

  setBossProgress(p: BossProgress) {
    this.state.bosses = { ...this.state.bosses, [p.bossId]: p };
    addUnique(this.delta.bosses, p.bossId);
  }

  setSession(s: ActiveSession | null) {
    this.state.session = s;
    this.delta.session = true;
  }

  setBattle(b: BattleState | null) {
    this.state.battle = b;
    this.delta.battle = true;
  }

  emit(e: GameEvent) {
    this.events.push(e);
  }

  done(): Result {
    return { state: this.state, events: this.events, delta: this.delta };
  }
}
