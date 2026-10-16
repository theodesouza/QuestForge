import type { ItemSlot } from '../../content/items';
import type { AltKey, TopicId } from '../../content/types';
import type { BattleState } from '../boss/battle';
import type { BossProgress, NodeProgress } from '../campaign/campaign';
import type { QuestionState } from '../learning/srs';
import type { QuestPeriod, QuestsState } from '../quests/quests';
import type { Reward } from '../progression/rewards';
import type { XpKind } from '../progression/xp';

export type XpSource = XpKind | 'session' | 'mission' | 'boss' | 'quest';

export type Goal = 'enem' | 'reforco' | 'curiosidade';
export type SelfLevel = 'iniciante' | 'intermediario' | 'avancado';
export type ReduceMotionPref = 'system' | 'always' | 'never';

export type EffectsLevel = 'alto' | 'medio' | 'baixo';

export interface Settings {
  haptics: boolean;
  reduceMotion: ReduceMotionPref;
  /** Intensidade dos efeitos do astrolábio (partículas e camadas). */
  effects: EffectsLevel;
}

export interface Equipped {
  frame: string;
  core: string;
  aura: string | null;
  title: string | null;
}

export interface Profile {
  name: string;
  goal: Goal;
  dailyMinutes: number;
  selfLevel: SelfLevel;
  examYear: number | null;
  onboarded: boolean;
  createdAt: number;
  lastActiveAt: number | null;
  xp: number;
  ink: number;
  restedPool: number;
  equipped: Equipped;
  /** Dificuldade-alvo adaptativa por assunto (1–4). */
  targets: Partial<Record<TopicId, number>>;
  totals: { answered: number; correct: number; timeMs: number; sessions: number };
  settings: Settings;
  /** Fuso do aparelho (minutos, como Date#getTimezoneOffset) — define o "dia" das encomendas. */
  tzOffsetMin: number;
}

export type SessionMode = 'expedition' | 'mission' | 'boss';

export interface Attempt {
  id: string;
  questionId: string;
  sessionId: string;
  mode: SessionMode;
  chosen: AltKey;
  correct: boolean;
  guessed: boolean;
  hints: number;
  timeMs: number;
  xp: number;
  kind: XpKind;
  createdAt: number;
}

export interface SessionAnswer {
  questionId: string;
  chosen: AltKey | null;
  correct: boolean;
  guessed: boolean;
  hints: number;
  timeMs: number;
  xp: number;
  ink: number;
  kind: XpKind | 'skipped';
}

export interface ActiveSession {
  id: string;
  mode: Exclude<SessionMode, 'boss'>;
  nodeId: string | null;
  /** Duração escolhida (min) — apenas informativo. */
  minutes: number | null;
  startedAt: number;
  queue: string[];
  index: number;
  answers: SessionAnswer[];
  /** Questões já puladas uma vez (voltam ao fim da fila só uma vez). */
  skippedOnce: string[];
  /** Questões inseridas pelo andaime adaptativo. */
  scaffoldIds: string[];
  xp: number;
  ink: number;
  restedBonus: number;
}

export interface InventoryEntry {
  itemId: string;
  acquiredAt: number;
  source: string;
}

export interface GameState {
  profile: Profile;
  questionStates: Record<string, QuestionState>;
  inventory: Record<string, InventoryEntry>;
  /** Registro idempotente de recompensas: chave → concedida em. */
  ledger: Record<string, number>;
  campaign: Record<string, NodeProgress>;
  bosses: Record<string, BossProgress>;
  session: ActiveSession | null;
  battle: BattleState | null;
  quests: QuestsState;
}

/** O que precisa ser gravado após uma operação (chaves "sujas" + tentativas novas). */
export interface Delta {
  profile: boolean;
  questionStates: string[];
  attempts: Attempt[];
  ledger: string[];
  inventory: string[];
  campaign: string[];
  bosses: string[];
  session: boolean;
  battle: boolean;
  quests: boolean;
}

export interface SessionSummary {
  sessionId: string;
  mode: ActiveSession['mode'];
  nodeId: string | null;
  answered: number;
  correct: number;
  skipped: number;
  xp: number;
  ink: number;
  restedBonus: number;
  bonusXp: number;
  perfect: boolean;
  missionPassed: boolean | null;
  missionFirstClear: boolean;
  /** XP e Tinta da primeira conclusão da missão (0 se não houve). */
  missionXp: number;
  missionInk: number;
  /** Pontuação (0–1000) e estrelas desta tentativa de missão; null fora de missões. */
  missionScore: number | null;
  missionStars: number | null;
  /** Melhor pontuação antes desta tentativa (null se é a primeira pontuada). */
  previousBest: number | null;
  /** Bateu o recorde anterior (só a partir da segunda tentativa pontuada). */
  newRecord: boolean;
  /** Recompensas únicas por estrela conquistadas nesta tentativa. */
  starXp: number;
  starInk: number;
  /** Questões da missão que o jogador ainda não resolveu (após esta tentativa). */
  unseenLeft: number | null;
  echoes: string[];
  redemptions: string[];
  durationMs: number;
}

export type GameEvent =
  | {
      type: 'answered';
      questionId: string;
      chosen: AltKey;
      correct: boolean;
      guessed: boolean;
      kind: XpKind;
      /** XP total concedido pela resposta (já com o bônus de descanso). */
      xp: number;
      restedBonus: number;
      ink: number;
    }
  | { type: 'xp'; amount: number; restedBonus: number; source: XpSource }
  | { type: 'ink'; amount: number }
  | { type: 'levelUp'; from: number; to: number; rewards: { level: number; rewards: Reward[] }[] }
  | { type: 'item'; itemId: string; source: string; autoEquipped: boolean; slot: ItemSlot }
  | { type: 'echo'; questionId: string }
  | { type: 'redemption'; questionId: string }
  | { type: 'rested'; gained: number; pool: number }
  | { type: 'scaffold'; questionId: string; subtopic: string; conceptFrom: string }
  | { type: 'missionComplete'; nodeId: string; first: boolean }
  | { type: 'bossDefeated'; bossId: string; first: boolean; flawless: boolean }
  | { type: 'sessionComplete'; summary: SessionSummary }
  | { type: 'questComplete'; period: QuestPeriod; questId: string; title: string; xp: number; ink: number }
  | { type: 'questBonus'; period: QuestPeriod; xp: number; ink: number; itemId: string | null }
  | { type: 'purchase'; itemId: string; price: number };

export interface Result {
  state: GameState;
  events: GameEvent[];
  delta: Delta;
}
