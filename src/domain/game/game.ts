/**
 * Reducer do jogo: funções puras (estado, entrada, agora) → { estado, eventos, delta }.
 * Toda regra que muda progresso passa por aqui — a UI nunca altera estado diretamente.
 */
import { findQuestion, getQuestion, questionsFor } from '../../content/bank';
import { getBoss, type BossDef } from '../../content/bosses';
import { STARTER_ITEMS, getItem } from '../../content/items';
import { REGIONS, findNode, type BossNode, type MissionNode } from '../../content/regions';
import { TOPIC_IDS } from '../../content/topics';
import { ALT_KEYS, type AltKey, type Question, type TopicId } from '../../content/types';
import {
  applyBattleAnswer,
  battleTarget,
  createBattle,
  isFlawless,
  type BattleState,
} from '../boss/battle';
import { nodeStatus, type BossProgress } from '../campaign/campaign';
import { DEFAULT_TARGET, adjustTarget, selectQuestions } from '../learning/selection';
import { dueQuestionIds, emptyQuestionState, schedule } from '../learning/srs';
import { accrueRested } from '../progression/rested';
import {
  MISSION_FIRST_INK,
  MISSION_FIRST_XP,
  computeXp,
  sessionBonus,
  type XpResult,
} from '../progression/xp';
import { hashString } from '../util/random';
import { grantInk, grantItem, grantXp, once } from './grant';
import { Tx } from './tx';
import type {
  ActiveSession,
  GameState,
  Goal,
  Profile,
  Result,
  SelfLevel,
  SessionMode,
  SessionSummary,
  Settings,
} from './types';

// ————————————————————————————————————————————————————————— estado inicial

export const DEFAULT_SETTINGS: Settings = { haptics: true, reduceMotion: 'system' };

export function createInitialState(now: number): GameState {
  const profile: Profile = {
    name: '',
    goal: 'enem',
    dailyMinutes: 10,
    selfLevel: 'intermediario',
    examYear: null,
    onboarded: false,
    createdAt: now,
    lastActiveAt: null,
    xp: 0,
    ink: 0,
    restedPool: 0,
    equipped: { frame: STARTER_ITEMS[0], core: STARTER_ITEMS[1], aura: null, title: null },
    targets: {},
    totals: { answered: 0, correct: 0, timeMs: 0, sessions: 0 },
    settings: DEFAULT_SETTINGS,
  };
  const inventory: GameState['inventory'] = {};
  for (const itemId of STARTER_ITEMS) inventory[itemId] = { itemId, acquiredAt: now, source: 'inicial' };
  return {
    profile,
    questionStates: {},
    inventory,
    ledger: {},
    campaign: {},
    bosses: {},
    session: null,
    battle: null,
  };
}

/** Delta completo — usado para gravar o estado inicial. */
export function fullDelta(state: GameState): Result['delta'] {
  return {
    profile: true,
    questionStates: Object.keys(state.questionStates),
    attempts: [],
    ledger: Object.keys(state.ledger),
    inventory: Object.keys(state.inventory),
    campaign: Object.keys(state.campaign),
    bosses: Object.keys(state.bosses),
    session: true,
    battle: true,
  };
}

const SELF_LEVEL_TARGET: Record<SelfLevel, number> = {
  iniciante: 1.3,
  intermediario: 2.0,
  avancado: 2.7,
};

export interface OnboardingInput {
  name: string;
  goal: Goal;
  dailyMinutes: number;
  selfLevel: SelfLevel;
  examYear: number | null;
}

export function completeOnboarding(state: GameState, input: OnboardingInput, now: number): Result {
  const tx = new Tx(state);
  const target = SELF_LEVEL_TARGET[input.selfLevel];
  const targets: Partial<Record<TopicId, number>> = {};
  for (const id of TOPIC_IDS) targets[id] = target;
  tx.patchProfile({
    name: input.name.trim().slice(0, 24),
    goal: input.goal,
    dailyMinutes: input.dailyMinutes,
    selfLevel: input.selfLevel,
    examYear: input.examYear,
    onboarded: true,
    targets,
    lastActiveAt: now,
  });
  return tx.done();
}

/** Chamado ao abrir o app: converte ausência em Descanso do Viajante. */
export function touch(state: GameState, now: number): Result {
  const tx = new Tx(state);
  const p = tx.profile;
  if (!p.onboarded) return tx.done();
  const { pool, gained } = accrueRested(p.restedPool, p.lastActiveAt, now);
  tx.patchProfile({ restedPool: pool, lastActiveAt: now });
  if (gained > 0) tx.emit({ type: 'rested', gained, pool });
  return tx.done();
}

// ————————————————————————————————————————————————————————— planejamento

/** Minutos → quantidade de questões das expedições rápidas. */
export const EXPEDITION_SIZES: Record<number, number> = { 3: 3, 5: 5, 10: 8, 15: 12, 25: 20 };

export function planExpedition(state: GameState, minutes: number, now: number, seed: number): string[] {
  const count = EXPEDITION_SIZES[minutes] ?? 5;
  return selectQuestions({
    pool: questionsFor({}),
    states: state.questionStates,
    count,
    now,
    seed,
    targets: state.profile.targets,
  }).map((q) => q.id);
}

export function planMission(state: GameState, node: MissionNode, now: number, seed: number): string[] {
  return selectQuestions({
    pool: questionsFor({ topics: node.topics, subtopics: node.subtopics }),
    states: state.questionStates,
    count: node.questionCount,
    now,
    seed,
    targets: state.profile.targets,
    maxReviewShare: 0.2,
  }).map((q) => q.id);
}

/** Foco num subassunto (recomendação): completa com o assunto se faltar questão. */
export function planFocus(
  state: GameState,
  topic: TopicId,
  subtopic: string,
  count: number,
  now: number,
  seed: number,
): string[] {
  const primary = selectQuestions({
    pool: questionsFor({ topics: [topic], subtopics: [subtopic] }),
    states: state.questionStates,
    count,
    now,
    seed,
    targets: state.profile.targets,
  });
  if (primary.length >= count) return primary.map((q) => q.id);
  const extra = selectQuestions({
    pool: questionsFor({ topics: [topic] }),
    states: state.questionStates,
    count: count - primary.length,
    now,
    seed: seed + 1,
    targets: state.profile.targets,
    exclude: new Set(primary.map((q) => q.id)),
  });
  return [...primary, ...extra].map((q) => q.id);
}

/** Caça aos Ecos: só questões com revisão vencida, as mais antigas primeiro. */
export const ECHO_HUNT_SIZE = 5;
export function planEchoHunt(state: GameState, now: number): string[] {
  return dueQuestionIds(state.questionStates, now)
    .filter((id) => findQuestion(id))
    .slice(0, ECHO_HUNT_SIZE);
}

// ————————————————————————————————————————————————————————— sessões

export interface StartSessionInput {
  id: string;
  mode: ActiveSession['mode'];
  nodeId: string | null;
  minutes: number | null;
  questionIds: string[];
}

export function startSession(state: GameState, input: StartSessionInput, now: number): Result {
  if (state.battle && state.battle.status === 'active') throw new Error('Há uma batalha em andamento');
  if (input.questionIds.length === 0) throw new Error('Sessão sem questões');
  for (const id of input.questionIds) getQuestion(id);
  if (input.mode === 'mission') {
    const found = input.nodeId ? findNode(input.nodeId) : null;
    if (!found || found.node.kind !== 'mission') throw new Error('Missão inválida');
    if (nodeStatus(found.node, view(state)) === 'locked') throw new Error('Missão bloqueada');
  }
  const tx = new Tx(state);
  tx.setSession({
    id: input.id,
    mode: input.mode,
    nodeId: input.nodeId,
    minutes: input.minutes,
    startedAt: now,
    queue: input.questionIds.slice(),
    index: 0,
    answers: [],
    skippedOnce: [],
    scaffoldIds: [],
    xp: 0,
    ink: 0,
    restedBonus: 0,
  });
  return tx.done();
}

export interface AnswerInput {
  attemptId: string;
  chosen: AltKey;
  guessed: boolean;
  hints: number;
  timeMs: number;
}

function validateAnswer(input: AnswerInput) {
  if (!ALT_KEYS.includes(input.chosen)) throw new Error(`Alternativa inválida: ${input.chosen}`);
  if (!Number.isInteger(input.hints) || input.hints < 0 || input.hints > 2) throw new Error('Dicas inválidas');
}

/** Registra uma resposta: tentativa, revisão espaçada, XP, Tinta, alvo adaptativo e totais. */
function recordAnswer(
  tx: Tx,
  q: Question,
  input: AnswerInput,
  mode: SessionMode,
  sessionId: string,
  now: number,
): { correct: boolean; xp: XpResult; granted: number } {
  validateAnswer(input);
  const prior = tx.state.questionStates[q.id];
  const correct = input.chosen === q.answer;
  const guessed = correct && input.guessed;
  const xp = computeXp({
    difficulty: q.difficulty,
    correct,
    guessed,
    hintsUsed: input.hints,
    prior,
    sessionId,
    now,
  });
  const outcome = !correct ? 'wrong' : guessed ? 'guess' : 'correct';
  const qs = schedule(prior, q.id, outcome, now, sessionId);
  if (xp.xp > 0) qs.lastXpAt = now;
  tx.setQuestionState(qs);

  if (!correct && !prior?.echo) tx.emit({ type: 'echo', questionId: q.id });
  if (xp.kind === 'redemption') tx.emit({ type: 'redemption', questionId: q.id });

  const poolBefore = tx.profile.restedPool;
  const granted = grantXp(tx, xp.xp, xp.kind, now, true);
  tx.emit({
    type: 'answered',
    questionId: q.id,
    chosen: input.chosen,
    correct,
    guessed,
    kind: xp.kind,
    xp: granted,
    restedBonus: poolBefore - tx.profile.restedPool,
    ink: xp.ink,
  });
  grantInk(tx, xp.ink);

  const p = tx.profile;
  const currentTarget = p.targets[q.topic] ?? DEFAULT_TARGET;
  tx.patchProfile({
    targets: { ...p.targets, [q.topic]: adjustTarget(currentTarget, correct && !guessed, q.difficulty) },
    totals: {
      ...p.totals,
      answered: p.totals.answered + 1,
      correct: p.totals.correct + (correct ? 1 : 0),
      timeMs: p.totals.timeMs + Math.max(0, Math.min(input.timeMs, 30 * 60 * 1000)),
    },
    lastActiveAt: now,
  });

  tx.addAttempt({
    id: input.attemptId,
    questionId: q.id,
    sessionId,
    mode,
    chosen: input.chosen,
    correct,
    guessed,
    hints: input.hints,
    timeMs: input.timeMs,
    xp: granted,
    kind: xp.kind,
    createdAt: now,
  });
  return { correct, xp, granted };
}

export function currentQuestionId(session: ActiveSession): string | null {
  return session.queue[session.index] ?? null;
}

const MAX_SCAFFOLDS = 2;

export function answerCurrent(state: GameState, input: AnswerInput, now: number): Result {
  const session = state.session;
  if (!session) throw new Error('Nenhuma sessão ativa');
  const qid = currentQuestionId(session);
  if (!qid) throw new Error('Sessão sem questão atual');
  if (session.answers.length !== session.index) throw new Error('Questão já respondida');

  const q = getQuestion(qid);
  const tx = new Tx(state);
  const before = tx.profile.restedPool;
  const { correct, xp, granted } = recordAnswer(tx, q, input, session.mode, session.id, now);
  const restedUsed = before - tx.profile.restedPool;

  const next: ActiveSession = {
    ...session,
    queue: session.queue.slice(),
    answers: [
      ...session.answers,
      {
        questionId: q.id,
        chosen: input.chosen,
        correct,
        guessed: correct && input.guessed,
        hints: input.hints,
        timeMs: input.timeMs,
        xp: granted,
        ink: xp.ink,
        kind: xp.kind,
      },
    ],
    index: session.index + 1,
    xp: session.xp + granted,
    ink: session.ink + xp.ink,
    restedBonus: session.restedBonus + restedUsed,
  };

  // Andaime adaptativo: dois erros seguidos no mesmo subassunto ⇒ questão mais acessível + conceito.
  if (!correct && next.scaffoldIds.length < MAX_SCAFFOLDS) {
    const prev = [...session.answers].reverse().find((a) => a.kind !== 'skipped');
    const prevQ = prev ? findQuestion(prev.questionId) : undefined;
    if (prev && !prev.correct && prevQ && prevQ.subtopic === q.subtopic) {
      const easier = findEasier(q, next.queue, tx.state);
      if (easier) {
        next.queue.splice(next.index, 0, easier.id);
        next.scaffoldIds = [...next.scaffoldIds, easier.id];
        tx.emit({ type: 'scaffold', questionId: easier.id, subtopic: q.subtopic, conceptFrom: q.id });
      }
    }
  }

  tx.setSession(next);
  return tx.done();
}

/** Questão mais acessível: mesmo subassunto se houver; senão, a base do mesmo assunto. */
function findEasier(q: Question, queue: string[], state: GameState): Question | undefined {
  const inQueue = new Set(queue);
  const maxDifficulty = Math.max(1, q.difficulty - 1);
  const rank = (c: Question) =>
    (c.subtopic === q.subtopic ? 0 : 100) + (state.questionStates[c.id]?.seen ?? 0) * 10 + c.difficulty;
  return questionsFor({ topics: [q.topic] })
    .filter((c) => c.id !== q.id && !inQueue.has(c.id) && c.difficulty <= maxDifficulty)
    .sort((a, b) => rank(a) - rank(b))[0];
}

/** Pular: a questão volta uma única vez ao fim da fila; nada é perdido. */
export function skipCurrent(state: GameState): Result {
  const session = state.session;
  if (!session) throw new Error('Nenhuma sessão ativa');
  const qid = currentQuestionId(session);
  if (!qid || session.answers.length !== session.index) throw new Error('Nada para pular');
  const tx = new Tx(state);
  const firstSkip = !session.skippedOnce.includes(qid);
  tx.setSession({
    ...session,
    queue: firstSkip ? [...session.queue, qid] : session.queue,
    skippedOnce: firstSkip ? [...session.skippedOnce, qid] : session.skippedOnce,
    answers: [
      ...session.answers,
      {
        questionId: qid,
        chosen: null,
        correct: false,
        guessed: false,
        hints: 0,
        timeMs: 0,
        xp: 0,
        ink: 0,
        kind: 'skipped',
      },
    ],
    index: session.index + 1,
  });
  return tx.done();
}

export function finishSession(state: GameState, now: number): Result {
  const session = state.session;
  if (!session) throw new Error('Nenhuma sessão ativa');
  const tx = new Tx(state);
  const answered = session.answers.filter((a) => a.kind !== 'skipped');
  // Uma questão pulada e depois respondida conta uma vez só.
  const correct = answered.filter((a) => a.correct).length;
  const wrong = answered.length - correct;
  const skipped = session.queue.filter(
    (id) => !answered.some((a) => a.questionId === id),
  ).length;

  const bonus = sessionBonus(answered.length, wrong);
  const bonusXp = grantXp(tx, bonus.xp, 'session', now, false);

  let missionPassed: boolean | null = null;
  let missionFirstClear = false;
  let missionXp = 0;
  let missionInk = 0;
  if (session.mode === 'mission' && session.nodeId) {
    const found = findNode(session.nodeId);
    if (found && found.node.kind === 'mission') {
      const node = found.node;
      missionPassed = correct >= node.passCorrect;
      const prev = tx.state.campaign[node.id];
      tx.setNodeProgress({
        nodeId: node.id,
        runs: (prev?.runs ?? 0) + 1,
        bestCorrect: Math.max(prev?.bestCorrect ?? 0, correct),
        completedAt: prev?.completedAt ?? (missionPassed ? now : null),
      });
      if (missionPassed) {
        missionFirstClear = once(tx, `mission:${node.id}:first`, now, () => {
          missionXp = grantXp(tx, MISSION_FIRST_XP, 'mission', now, false);
          missionInk = MISSION_FIRST_INK;
          grantInk(tx, MISSION_FIRST_INK);
        });
        tx.emit({ type: 'missionComplete', nodeId: node.id, first: missionFirstClear });
      }
    }
  }

  if (answered.length > 0) {
    tx.patchProfile({ totals: { ...tx.profile.totals, sessions: tx.profile.totals.sessions + 1 } });
  }

  const summary: SessionSummary = {
    sessionId: session.id,
    mode: session.mode,
    nodeId: session.nodeId,
    answered: answered.length,
    correct,
    skipped,
    xp: session.xp,
    ink: session.ink,
    restedBonus: session.restedBonus,
    bonusXp,
    perfect: bonus.perfect,
    missionPassed,
    missionFirstClear,
    missionXp,
    missionInk,
    echoes: answered.filter((a) => !a.correct).map((a) => a.questionId),
    redemptions: answered.filter((a) => a.kind === 'redemption').map((a) => a.questionId),
    durationMs: Math.max(0, now - session.startedAt),
  };
  tx.setSession(null);
  tx.emit({ type: 'sessionComplete', summary });
  return tx.done();
}

/** Abandonar mantém tudo o que já foi respondido (cada resposta já foi gravada). */
export function abandonSession(state: GameState): Result {
  const tx = new Tx(state);
  tx.setSession(null);
  return tx.done();
}

// ————————————————————————————————————————————————————————— chefões

function view(state: GameState) {
  return { progress: state.campaign, bosses: state.bosses };
}

export function bossNodeStatus(state: GameState, bossId: string) {
  const node = findBossNode(bossId);
  return node ? nodeStatus(node, view(state)) : 'locked';
}

function findBossNode(bossId: string): BossNode | null {
  for (const region of REGIONS) {
    for (const node of region.nodes) if (node.kind === 'boss' && node.bossId === bossId) return node;
  }
  return null;
}

function bossPool(boss: BossDef) {
  return questionsFor({ topics: boss.topics, subtopics: boss.subtopics });
}

function pickBossQuestion(state: GameState, boss: BossDef, battle: BattleState, now: number): string {
  const pool = bossPool(boss);
  const pickWith = (exclude: Set<string>) =>
    selectQuestions({
      pool,
      states: state.questionStates,
      count: 1,
      now,
      seed: hashString(`${battle.id}:${battle.turns.length}`),
      fixedTarget: battleTarget(boss, battle),
      exclude,
      maxReviewShare: 0,
    })[0];
  const q =
    pickWith(new Set(battle.usedQuestionIds)) ??
    pickWith(new Set(battle.usedQuestionIds.slice(-3)));
  if (!q) throw new Error('Sem questões para o chefão');
  return q.id;
}

export function startBattle(state: GameState, bossId: string, battleId: string, now: number): Result {
  const boss = getBoss(bossId);
  if (state.battle && state.battle.status === 'active') throw new Error('Já existe uma batalha ativa');
  if (state.session) throw new Error('Termine a sessão atual antes da batalha');
  if (bossNodeStatus(state, bossId) === 'locked') throw new Error('Chefão bloqueado');
  const tx = new Tx(state);
  const prev = state.bosses[bossId];
  const progress: BossProgress = {
    bossId,
    attempts: (prev?.attempts ?? 0) + 1,
    wins: prev?.wins ?? 0,
    failedSinceWin: prev?.failedSinceWin ?? 0,
    firstWinAt: prev?.firstWinAt ?? null,
    flawless: prev?.flawless ?? false,
    bestTurns: prev?.bestTurns ?? null,
  };
  tx.setBossProgress(progress);
  const battle = createBattle(boss, battleId, now, progress.failedSinceWin);
  battle.currentQuestionId = pickBossQuestion(state, boss, battle, now);
  tx.setBattle(battle);
  return tx.done();
}

function utcDay(now: number): string {
  return new Date(now).toISOString().slice(0, 10);
}

export function battleAnswer(state: GameState, input: AnswerInput, now: number): Result {
  const battle = state.battle;
  if (!battle || battle.status !== 'active' || !battle.currentQuestionId) {
    throw new Error('Nenhuma batalha ativa');
  }
  const boss = getBoss(battle.bossId);
  const q = getQuestion(battle.currentQuestionId);
  const tx = new Tx(state);
  const { correct, granted } = recordAnswer(tx, q, input, 'boss', battle.id, now);
  const { battle: after } = applyBattleAnswer(boss, battle, {
    questionId: q.id,
    difficulty: q.difficulty,
    correct,
    guessed: correct && input.guessed,
    hints: input.hints,
  });
  const next: BattleState = { ...after, xpEarned: battle.xpEarned + granted };

  const prev = tx.state.bosses[boss.id];
  if (next.status === 'won') {
    const flawless = isFlawless(next);
    const first = once(tx, `boss:${boss.id}:first`, now, () => {
      next.xpEarned += grantXp(tx, boss.rewards.firstXp, 'boss', now, false);
      grantInk(tx, boss.rewards.firstInk);
      for (const itemId of boss.rewards.firstItems) grantItem(tx, itemId, `boss:${boss.id}`, now);
    });
    if (!first) {
      once(tx, `boss:${boss.id}:win:${utcDay(now)}`, now, () => {
        next.xpEarned += grantXp(tx, boss.rewards.repeatXp, 'boss', now, false);
      });
    }
    if (flawless) {
      once(tx, `boss:${boss.id}:flawless`, now, () =>
        grantItem(tx, boss.rewards.flawlessItem, `boss:${boss.id}:flawless`, now),
      );
    }
    tx.setBossProgress({
      ...prev,
      wins: prev.wins + 1,
      failedSinceWin: 0,
      firstWinAt: prev.firstWinAt ?? now,
      flawless: prev.flawless || flawless,
      bestTurns: prev.bestTurns === null ? next.turns.length : Math.min(prev.bestTurns, next.turns.length),
    });
    tx.patchProfile({ totals: { ...tx.profile.totals, sessions: tx.profile.totals.sessions + 1 } });
    tx.emit({ type: 'bossDefeated', bossId: boss.id, first, flawless });
  } else if (next.status === 'retreated') {
    tx.setBossProgress({ ...prev, failedSinceWin: prev.failedSinceWin + 1 });
    tx.patchProfile({ totals: { ...tx.profile.totals, sessions: tx.profile.totals.sessions + 1 } });
  } else {
    next.currentQuestionId = pickBossQuestion(tx.state, boss, next, now);
  }
  tx.setBattle(next);
  return tx.done();
}

/** Retirada voluntária: o XP fica, e a próxima tentativa ganha Conhecimento do Inimigo. */
export function retreatBattle(state: GameState): Result {
  const battle = state.battle;
  if (!battle || battle.status !== 'active') throw new Error('Nenhuma batalha ativa');
  const tx = new Tx(state);
  const prev = state.bosses[battle.bossId];
  tx.setBossProgress({ ...prev, failedSinceWin: prev.failedSinceWin + 1 });
  tx.setBattle({ ...battle, status: 'retreated', currentQuestionId: null });
  return tx.done();
}

export function dismissBattle(state: GameState): Result {
  const tx = new Tx(state);
  if (state.battle && state.battle.status === 'active') throw new Error('Batalha ainda ativa');
  tx.setBattle(null);
  return tx.done();
}

// ————————————————————————————————————————————————————————— personagem e preferências

export function equipItem(state: GameState, itemId: string): Result {
  if (!state.inventory[itemId]) throw new Error('Item não possuído');
  const item = getItem(itemId);
  const tx = new Tx(state);
  tx.patchProfile({ equipped: { ...tx.profile.equipped, [item.slot]: itemId } });
  return tx.done();
}

/** Aura e título podem ser removidos; moldura e núcleo são obrigatórios. */
export function unequipSlot(state: GameState, slot: 'aura' | 'title'): Result {
  const tx = new Tx(state);
  tx.patchProfile({ equipped: { ...tx.profile.equipped, [slot]: null } });
  return tx.done();
}

export function toggleQuestionFlag(
  state: GameState,
  questionId: string,
  flag: 'favorite' | 'flagged',
): Result {
  getQuestion(questionId);
  const tx = new Tx(state);
  const prev = state.questionStates[questionId] ?? emptyQuestionState(questionId);
  tx.setQuestionState({ ...prev, [flag]: !prev[flag] });
  return tx.done();
}

export function updateSettings(state: GameState, patch: Partial<Settings>): Result {
  const tx = new Tx(state);
  tx.patchProfile({ settings: { ...tx.profile.settings, ...patch } });
  return tx.done();
}

export function updateProfileBasics(
  state: GameState,
  patch: Partial<Pick<Profile, 'name' | 'dailyMinutes' | 'goal' | 'examYear'>>,
): Result {
  const tx = new Tx(state);
  const clean = { ...patch };
  if (clean.name !== undefined) clean.name = clean.name.trim().slice(0, 24);
  tx.patchProfile(clean);
  return tx.done();
}
