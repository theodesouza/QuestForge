/**
 * Ações de alto nível usadas pelas telas. Cada uma delega ao reducer puro via
 * GameController (grava antes de publicar).
 */
import { createRepository } from '../data/createRepository';
import { getQuestion } from '../content/bank';
import { findNode } from '../content/regions';
import { getItem } from '../content/items';
import type { AltKey, TopicId } from '../content/types';
import { alternativeOrder, displayLetter } from '../domain/learning/alternatives';
import { planStageDrill } from '../domain/academy/drill';
import * as academy from '../domain/game/academy';
import * as game from '../domain/game/game';
import type { AnswerInput, OnboardingInput } from '../domain/game/game';
import type { GameEvent, Result, Settings } from '../domain/game/types';
import { dayKey, weekKey } from '../domain/quests/quests';
import { hashString } from '../domain/util/random';
import { GameController } from './controller';
import { publish, useGameStore } from './store';

let controller: GameController | null = null;

function ctrl(): GameController {
  if (!controller) throw new Error('Jogo não inicializado');
  return controller;
}

export function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

function seed(): number {
  return hashString(newId('seed'));
}

export async function boot(): Promise<void> {
  if (process.env.EXPO_PUBLIC_QA === '1') {
    // Gancho de QA para testes ponta a ponta no navegador (nunca ativo em builds normais).
    // `shown` traduz a letra canônica para a letra exibida (as alternativas são embaralhadas).
    (globalThis as unknown as { __qf: unknown }).__qf = {
      store: useGameStore,
      getQuestion,
      getItem,
      shown: (questionId: string, attemptKey: string, key: AltKey) => displayLetter(alternativeOrder(getQuestion(questionId), attemptKey), key),
    };
  }
  try {
    if (!controller) {
      const repo = await createRepository();
      controller = new GameController({ repo, onState: publish });
    }
    await controller.init();
  } catch (e) {
    useGameStore.setState({ status: 'error', error: e instanceof Error ? e.message : String(e) });
  }
}

const run = (fn: (s: Parameters<typeof game.touch>[0], now: number) => Result) => ctrl().dispatch(fn);

export function finishOnboarding(input: OnboardingInput) {
  return run((s, now) => game.completeOnboarding(s, input, now));
}

/** Retorna o id da sessão criada. */
export async function startExpedition(minutes: number): Promise<string> {
  const id = newId('exp');
  await run((s, now) =>
    game.startSession(s, { id, mode: 'expedition', nodeId: null, minutes, questionIds: game.planExpedition(s, minutes, now, seed()) }, now),
  );
  return id;
}

export async function startFocus(topic: TopicId, subtopic: string, count = 5): Promise<string> {
  const id = newId('foc');
  await run((s, now) =>
    game.startSession(s, { id, mode: 'expedition', nodeId: null, minutes: null, questionIds: game.planFocus(s, topic, subtopic, count, now, seed()) }, now),
  );
  return id;
}

export async function startEchoHunt(): Promise<string> {
  const id = newId('eco');
  await run((s, now) =>
    game.startSession(s, { id, mode: 'expedition', nodeId: null, minutes: null, questionIds: game.planEchoHunt(s, now) }, now),
  );
  return id;
}

export async function startMission(nodeId: string): Promise<string> {
  const found = findNode(nodeId);
  if (!found || found.node.kind !== 'mission') throw new Error('Missão inválida');
  const node = found.node;
  const id = newId('mis');
  await run((s, now) =>
    game.startSession(s, { id, mode: 'mission', nodeId, minutes: null, questionIds: game.planMission(s, node, now, seed()) }, now),
  );
  return id;
}

/** Treino dirigido: questões do Atlas ligadas a uma etapa da Academia (Ecos primeiro). */
export async function startStageDrill(ref: string): Promise<string> {
  const id = newId('aca');
  await run((s, now) => {
    const ids = planStageDrill(s.questionStates, ref, now, seed());
    return game.startSession(s, { id, mode: 'expedition', nodeId: null, minutes: null, questionIds: ids }, now);
  });
  return id;
}

// ———————————————————————————————————————————— Academia

export const academyView = (ref: string) => run((s, now) => academy.academyView(s, ref, now));
export const academyLearnPos = (ref: string, pos: number) => run((s, now) => academy.academyLearn(s, { ref, pos }, now));
export async function academyLearnDone(ref: string, id: string, correct?: boolean): Promise<GameEvent[]> {
  const r = await run((s, now) => academy.academyLearn(s, { ref, done: { id, correct, answerId: newId('acl') } }, now));
  return r.events;
}
export async function academyPractice(ref: string, exerciseId: string, correct: boolean, hints: number): Promise<GameEvent[]> {
  const r = await run((s, now) => academy.academyPractice(s, { ref, exerciseId, correct, hints, answerId: newId('acp') }, now));
  return r.events;
}
export const academyStartChallenge = (ref: string) =>
  run((s, now) => academy.academyStartChallenge(s, { ref, runId: newId('acr'), seed: seed() }, now));
export async function academyChallengeAnswer(ref: string, runId: string, exerciseId: string, correct: boolean): Promise<GameEvent[]> {
  const r = await run((s, now) => academy.academyChallengeAnswer(s, { ref, runId, exerciseId, correct, answerId: newId('acc') }, now));
  return r.events;
}
export const academyAbandonChallenge = (ref: string) => run((s) => academy.academyAbandonChallenge(s, ref));

export async function answer(input: Omit<AnswerInput, 'attemptId'>): Promise<GameEvent[]> {
  const r = await run((s, now) => game.answerCurrent(s, { ...input, attemptId: newId('att') }, now));
  return r.events;
}

export const skip = () => run((s) => game.skipCurrent(s));
export const finish = () => run((s, now) => game.finishSession(s, now));
export const abandon = () => run((s) => game.abandonSession(s));

export async function beginBattle(bossId: string): Promise<void> {
  await run((s, now) => game.startBattle(s, bossId, newId('bat'), now));
}

export async function battleAnswer(input: Omit<AnswerInput, 'attemptId'>): Promise<GameEvent[]> {
  const r = await run((s, now) => game.battleAnswer(s, { ...input, attemptId: newId('att') }, now));
  return r.events;
}

export const retreat = () => run((s) => game.retreatBattle(s));
export const dismissBattle = () => run((s) => game.dismissBattle(s));

export const equip = (itemId: string) => run((s) => game.equipItem(s, itemId));
export const buy = (itemId: string) => run((s, now) => game.buyItem(s, itemId, now));

/** Troca as encomendas se o dia/semana virou com o app aberto (sem gravar nada se não mudou). */
export async function refreshQuests(): Promise<void> {
  const s = ctrl().current;
  if (!s || !s.profile.onboarded) return;
  const now = Date.now();
  const tz = s.profile.tzOffsetMin;
  if (s.quests.daily?.key === dayKey(now, tz) && s.quests.weekly?.key === weekKey(now, tz)) return;
  await run((st, at) => game.refreshQuestBoards(st, at));
}

export function dismissToast(id: string) {
  useGameStore.setState((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
}
export const unequip = (slot: 'aura' | 'title') => run((s) => game.unequipSlot(s, slot));
export const toggleFavorite = (questionId: string) => run((s) => game.toggleQuestionFlag(s, questionId, 'favorite'));
export const toggleDoubt = (questionId: string) => run((s) => game.toggleQuestionFlag(s, questionId, 'flagged'));
export const updateSettings = (patch: Partial<Settings>) => run((s) => game.updateSettings(s, patch));
export const updateProfile = (patch: Parameters<typeof game.updateProfileBasics>[1]) =>
  run((s) => game.updateProfileBasics(s, patch));

export async function resetProgress(): Promise<void> {
  await ctrl().reset();
  useGameStore.setState({ celebrations: [], toasts: [], reveals: [], lastSummary: null, restedNotice: null });
}

export function dismissReveal(id: string) {
  useGameStore.setState((s) => ({ reveals: s.reveals.filter((r) => r.id !== id) }));
}

export function dismissCelebration(id: string) {
  useGameStore.setState((s) => ({ celebrations: s.celebrations.filter((c) => c.id !== id) }));
}

export function dismissRestedNotice() {
  useGameStore.setState({ restedNotice: null });
}
