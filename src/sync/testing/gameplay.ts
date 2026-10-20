/**
 * Auxiliares de teste: jogam de verdade pelos reducers do domínio (nada de estados forjados),
 * para que os testes de sincronização exercitem o mesmo caminho que o app.
 */
import { getQuestion } from '../../content/bank';
import { getRegion } from '../../content/regions';
import { ALT_KEYS, type AltKey } from '../../content/types';
import {
  answerCurrent,
  battleAnswer,
  buyItem,
  completeOnboarding,
  createInitialState,
  currentQuestionId,
  finishSession,
  planExpedition,
  planMission,
  startBattle,
  startSession,
  touch,
} from '../../domain/game/game';
import type { GameState } from '../../domain/game/types';

export const T0 = Date.UTC(2026, 9, 14, 15); // quarta-feira, 12h em Brasília
export const HOUR = 60 * 60 * 1000;
export const DAY = 24 * HOUR;
export const BRT = 180;

export const wrongKey = (qid: string): AltKey => ALT_KEYS.find((k) => k !== getQuestion(qid).answer) as AltKey;

/** Perfil criado e com onboarding concluído, como um aparelho recém-configurado. */
export function newGame(now = T0, name = 'Lia'): GameState {
  return completeOnboarding(
    touch(createInitialState(now), now, BRT).state,
    { name, goal: 'enem', dailyMinutes: 10, selfLevel: 'intermediario', examYear: null },
    now,
  ).state;
}

let seq = 0;
const uid = (tag: string) => `${tag}-${seq++}`;

/** Sessão de expedição respondendo `correct[i]` (true/false) a cada questão da lista. */
export function playQuestions(state: GameState, ids: string[], correct: boolean[] | boolean, now: number, tag = 'dev'): GameState {
  let s = startSession(state, { id: uid(`${tag}-s`), mode: 'expedition', nodeId: null, minutes: null, questionIds: ids }, now).state;
  let i = 0;
  while (s.session && currentQuestionId(s.session)) {
    const qid = currentQuestionId(s.session)!;
    const ok = Array.isArray(correct) ? correct[i] !== false : correct;
    s = answerCurrent(
      s,
      { attemptId: uid(`${tag}-a`), chosen: ok ? getQuestion(qid).answer : wrongKey(qid), guessed: false, hints: 0, timeMs: 40_000 },
      now + i * 1000,
    ).state;
    i++;
  }
  return finishSession(s, now + (i + 1) * 1000).state;
}

/** Expedição planejada pelo próprio jogo. */
export function playExpedition(state: GameState, minutes: number, correct: boolean, now: number, tag = 'dev'): GameState {
  return playQuestions(state, planExpedition(state, minutes, now, 11), correct, now, tag);
}

/** Tentativa de missão da Região 1 com `correctCount` acertos. */
export function playMission(state: GameState, nodeId: string, correctCount: number, now: number, tag = 'dev'): GameState {
  const node = getRegion('vale-proporcoes').nodes.find((n) => n.id === nodeId);
  if (!node || node.kind !== 'mission') throw new Error(`Nó inválido: ${nodeId}`);
  const ids = planMission(state, node, now, 7);
  let s = startSession(state, { id: uid(`${tag}-m`), mode: 'mission', nodeId, minutes: null, questionIds: ids }, now).state;
  let i = 0;
  while (s.session && currentQuestionId(s.session)) {
    const qid = currentQuestionId(s.session)!;
    s = answerCurrent(
      s,
      { attemptId: uid(`${tag}-a`), chosen: i < correctCount ? getQuestion(qid).answer : wrongKey(qid), guessed: false, hints: 0, timeMs: 40_000 },
      now + i * 1000,
    ).state;
    i++;
  }
  return finishSession(s, now + 100_000).state;
}

/** Vence um chefão respondendo tudo certo (abre antes que as missões estejam concluídas). */
export function winBoss(state: GameState, bossId: string, now: number, tag = 'dev'): GameState {
  let s = startBattle(state, bossId, uid(`${tag}-b`), now).state;
  let guard = 0;
  while (s.battle && s.battle.status === 'active' && guard++ < 40) {
    const qid = s.battle.currentQuestionId!;
    s = battleAnswer(s, { attemptId: uid(`${tag}-ba`), chosen: getQuestion(qid).answer, guessed: false, hints: 0, timeMs: 1000 }, now + guard * 1000).state;
  }
  return s;
}

/** As três missões da Região 1 concluídas (abre o Golem). */
export function clearRegion1(state: GameState, now: number, tag = 'dev'): GameState {
  let s = state;
  for (const [i, id] of ['r1-m1', 'r1-m2', 'r1-m3'].entries()) s = playMission(s, id, 5, now + i * DAY, tag);
  return s;
}

export { buyItem };
