/**
 * Ações de alto nível usadas pelas telas. Cada uma delega ao reducer puro via
 * GameController (grava antes de publicar).
 */
import { findNode } from '../content/regions';
import type { TopicId } from '../content/types';
import * as game from '../domain/game/game';
import type { AnswerInput, OnboardingInput } from '../domain/game/game';
import type { GameEvent, Result, Settings } from '../domain/game/types';
import { dayKey, weekKey } from '../domain/quests/quests';
import { hashString } from '../domain/util/random';
import { getSyncEngine, requireController } from './session';
import { useGameStore } from './store';

const ctrl = requireController;

export function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

function seed(): number {
  return hashString(newId('seed'));
}

const run = (fn: (s: Parameters<typeof game.touch>[0], now: number) => Result) => ctrl().dispatch(fn);

/** Marcos do jogo (fim de sessão, chefão, onboarding): pedem envio já, em vez de esperar o lote. */
const syncSoon = () => getSyncEngine()?.requestSync('now');

export async function finishOnboarding(input: OnboardingInput) {
  const r = await run((s, now) => game.completeOnboarding(s, input, now));
  syncSoon();
  return r;
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

export async function answer(input: Omit<AnswerInput, 'attemptId'>): Promise<GameEvent[]> {
  const r = await run((s, now) => game.answerCurrent(s, { ...input, attemptId: newId('att') }, now));
  return r.events;
}

export const skip = () => run((s) => game.skipCurrent(s));
export async function finish() {
  const r = await run((s, now) => game.finishSession(s, now));
  syncSoon();
  return r;
}
export const abandon = () => run((s) => game.abandonSession(s));

export async function beginBattle(bossId: string): Promise<void> {
  await run((s, now) => game.startBattle(s, bossId, newId('bat'), now));
}

export async function battleAnswer(input: Omit<AnswerInput, 'attemptId'>): Promise<GameEvent[]> {
  const r = await run((s, now) => game.battleAnswer(s, { ...input, attemptId: newId('att') }, now));
  if (r.state.battle && r.state.battle.status !== 'active') syncSoon(); // vitória ou retirada encerram a batalha
  return r.events;
}

export async function retreat() {
  const r = await run((s) => game.retreatBattle(s));
  syncSoon();
  return r;
}
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

export { resetProgress } from './session';

export function dismissReveal(id: string) {
  useGameStore.setState((s) => ({ reveals: s.reveals.filter((r) => r.id !== id) }));
}

export function dismissCelebration(id: string) {
  useGameStore.setState((s) => ({ celebrations: s.celebrations.filter((c) => c.id !== id) }));
}

export function dismissRestedNotice() {
  useGameStore.setState({ restedNotice: null });
}
