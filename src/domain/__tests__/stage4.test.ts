import { getQuestion, questionsFor } from '../../content/bank';
import { getBoss } from '../../content/bosses';
import { SHOP_ITEMS, getItem } from '../../content/items';
import { getRegion } from '../../content/regions';
import { ALT_KEYS, type AltKey } from '../../content/types';
import { applyBattleAnswer, createBattle, interestHeal, type BattleState } from '../boss/battle';
import { nodeStatus } from '../campaign/campaign';
import {
  answerCurrent,
  buyItem,
  completeOnboarding,
  createInitialState,
  currentQuestionId,
  finishSession,
  refreshQuestBoards,
  startSession,
  touch,
} from '../game/game';
import type { GameEvent, GameState, Result } from '../game/types';
import {
  DAILY_BONUS,
  DAILY_REWARD,
  applyIncrements,
  dayKey,
  generateDaily,
  generateWeekly,
  studyMinutesGained,
  weekDays,
  weekKey,
} from '../quests/quests';
import { schedule } from '../learning/srs';

const T0 = Date.UTC(2026, 9, 14, 15); // quarta-feira, 12h em Brasília
const DAY = 24 * 60 * 60 * 1000;
const BRT = 180;

function onboarded(now = T0, minutes = 10): GameState {
  return completeOnboarding(
    touch(createInitialState(now), now, BRT).state,
    { name: 'Lia', goal: 'enem', dailyMinutes: minutes, selfLevel: 'intermediario', examYear: null },
    now,
  ).state;
}
const wrongKey = (qid: string): AltKey => ALT_KEYS.find((k) => k !== getQuestion(qid).answer) as AltKey;
const events = <T extends GameEvent['type']>(r: Result, t: T) =>
  r.events.filter((e): e is Extract<GameEvent, { type: T }> => e.type === t);

let seq = 0;
function play(state: GameState, ids: string[], correct: boolean[], now: number, timeMs = 40_000) {
  let s = startSession(state, { id: `s${seq++}`, mode: 'expedition', nodeId: null, minutes: null, questionIds: ids }, now).state;
  const all: Result[] = [];
  let i = 0;
  while (s.session && currentQuestionId(s.session)) {
    const qid = currentQuestionId(s.session)!;
    const r = answerCurrent(
      s,
      { attemptId: `a${seq++}`, chosen: correct[i] === false ? wrongKey(qid) : getQuestion(qid).answer, guessed: false, hints: 0, timeMs },
      now + i,
    );
    all.push(r);
    s = r.state;
    i++;
  }
  const fin = finishSession(s, now + 1000);
  all.push(fin);
  return { state: fin.state, results: all };
}

describe('calendário local das encomendas', () => {
  it('usa o fuso do aparelho para o dia e a semana (segunda a domingo)', () => {
    // 01h UTC de quinta = 22h de quarta em Brasília.
    const lateWed = Date.UTC(2026, 9, 15, 1);
    expect(dayKey(lateWed, BRT)).toBe('2026-10-14');
    expect(dayKey(lateWed, 0)).toBe('2026-10-15');
    expect(weekKey(T0, BRT)).toBe('S-2026-10-12');
    expect(weekKey(Date.UTC(2026, 9, 19, 2), BRT)).toBe('S-2026-10-12'); // domingo 23h
    expect(weekKey(Date.UTC(2026, 9, 19, 4), BRT)).toBe('S-2026-10-19'); // segunda 01h
    expect(weekDays('S-2026-10-12')).toEqual([
      '2026-10-12', '2026-10-13', '2026-10-14', '2026-10-15', '2026-10-16', '2026-10-17', '2026-10-18',
    ]);
  });
});

describe('geração das encomendas', () => {
  const ctx = { dailyMinutes: 10, createdAt: T0, questionStates: {}, bossAvailable: false };
  it('é determinística por dia, tem 3 encomendas distintas e varia entre dias', () => {
    const a = generateDaily('2026-10-14', ctx);
    expect(generateDaily('2026-10-14', ctx)).toEqual(a);
    expect(a.quests).toHaveLength(3);
    expect(new Set(a.quests.map((q) => q.metric)).size).toBe(3);
    const titles = new Set<string>();
    for (let d = 10; d < 24; d++) for (const q of generateDaily(`2026-10-${d}`, ctx).quests) titles.add(q.title);
    expect(titles.size).toBeGreaterThan(4);
  });
  it('mira o assunto recomendado e só pede Eco quando existe Eco', () => {
    const a = generateDaily('2026-10-14', ctx);
    expect(a.quests.some((q) => q.metric === 'topicCorrect' && q.topic)).toBe(true);
    for (let d = 10; d < 30; d++) {
      expect(generateDaily(`2026-10-${d}`, ctx).quests.some((q) => q.metric === 'redemptions')).toBe(false);
    }
    const withEcho = { ...ctx, questionStates: { 'PCT-001': schedule(undefined, 'PCT-001', 'wrong', T0, 'x') } };
    const any = Array.from({ length: 20 }, (_, i) => generateDaily(`2026-11-${10 + i}`, withEcho)).some((b) =>
      b.quests.some((q) => q.metric === 'redemptions'),
    );
    expect(any).toBe(true);
  });
  it('metas escalam com o tempo diário escolhido', () => {
    const small = generateWeekly('S-2026-10-12', { ...ctx, dailyMinutes: 5 });
    const big = generateWeekly('S-2026-10-12', { ...ctx, dailyMinutes: 25 });
    const answered = (b: typeof small) => b.quests.find((q) => q.metric === 'answered')!.target;
    expect(answered(small)).toBeLessThan(answered(big));
    expect(small.quests.find((q) => q.metric === 'studyDays')!.target).toBe(3);
    expect(generateWeekly('S-2026-10-12', ctx).quests.some((q) => q.metric === 'bossWins')).toBe(false);
  });
  it('progresso não passa da meta e respeita o assunto exigido', () => {
    const b = generateDaily('2026-10-14', ctx);
    const focus = b.quests.find((q) => q.metric === 'topicCorrect')!;
    const { board: b1, completed: c1 } = applyIncrements(b, [{ metric: 'topicCorrect', amount: 5, topic: 'geo-plana', subtopic: 'nada' }]);
    expect(c1).toHaveLength(0);
    const { board: b2, completed: c2 } = applyIncrements(b1, [
      { metric: 'topicCorrect', amount: 50, topic: focus.topic, subtopic: focus.subtopic },
    ]);
    expect(c2.map((q) => q.id)).toEqual([focus.id]);
    expect(b2.progress[focus.id]).toBe(focus.target);
    expect(applyIncrements(b2, [{ metric: 'topicCorrect', amount: 1, topic: focus.topic, subtopic: focus.subtopic }]).completed).toHaveLength(0);
  });
  it('tempo de estudo limita 5 min por resposta', () => {
    expect(studyMinutesGained(0, 30 * 60 * 1000)).toEqual({ totalMs: 5 * 60 * 1000, minutes: 5 });
    expect(studyMinutesGained(50_000, 20_000)).toEqual({ totalMs: 70_000, minutes: 1 });
  });
});

describe('encomendas no jogo', () => {
  it('são criadas no onboarding, progridem jogando e pagam uma vez só (com baú do dia)', () => {
    let s = onboarded(T0, 5);
    expect(s.quests.daily?.key).toBe('2026-10-14');
    expect(s.quests.weekly?.key).toBe('S-2026-10-12');
    const ids = questionsFor({ topics: ['razao-proporcao'] }).map((q) => q.id);
    const xpBefore = s.profile.xp;
    const completedEvents: GameEvent[] = [];
    // Joga bastante: todas as encomendas diárias possíveis devem ser cumpridas.
    for (let round = 0; round < 3; round++) {
      const r = play(s, ids.slice(round * 6, round * 6 + 6), [], T0 + round * 10_000, 4 * 60 * 1000);
      s = r.state;
      completedEvents.push(...r.results.flatMap((x) => x.events.filter((e) => e.type === 'questComplete' || e.type === 'questBonus')));
    }
    const dailyDone = completedEvents.filter((e) => e.type === 'questComplete' && e.period === 'daily');
    const doneIds = s.quests.daily!.quests.filter((q) => (s.quests.daily!.progress[q.id] ?? 0) >= q.target).map((q) => q.id);
    expect(dailyDone).toHaveLength(doneIds.length);
    for (const id of doneIds) expect(s.ledger[`quest:daily:2026-10-14:${id}`]).toBeDefined();
    if (doneIds.length === 3) {
      expect(completedEvents.filter((e) => e.type === 'questBonus' && e.period === 'daily')).toHaveLength(1);
      expect(s.ledger['quest:daily:2026-10-14:bonus']).toBeDefined();
    }
    expect(s.profile.xp).toBeGreaterThan(xpBefore + doneIds.length * DAILY_REWARD.xp);
    expect(DAILY_BONUS.ink).toBeGreaterThan(0);
  });

  it('virar o dia troca o quadro sem tirar nada; a semana guarda os dias de estudo', () => {
    let s = onboarded(T0);
    s = play(s, ['RZP-001', 'RZP-004', 'PCT-001'], [], T0).state;
    const xp = s.profile.xp;
    const ink = s.profile.ink;
    const tomorrow = T0 + DAY;
    const r = refreshQuestBoards(s, tomorrow);
    expect(r.state.quests.daily!.key).toBe('2026-10-15');
    expect(r.state.quests.daily!.progress).toEqual({});
    expect(r.state.quests.weekly).toBe(s.quests.weekly);
    expect(r.state.profile.xp).toBe(xp);
    expect(r.state.profile.ink).toBe(ink);
    s = play(r.state, ['GEO-001'], [], tomorrow).state;
    expect(s.quests.weekly!.days).toEqual(['2026-10-14', '2026-10-15']);
    const nextWeek = refreshQuestBoards(s, T0 + 6 * DAY).state;
    expect(nextWeek.quests.weekly!.key).toBe('S-2026-10-19');
    expect(nextWeek.quests.weekly!.days).toEqual([]);
  });

  it('não é possível receber a mesma encomenda duas vezes, mesmo re-aplicando o quadro', () => {
    let s = onboarded(T0);
    const q = s.quests.daily!.quests[0];
    // Força o quadro quase completo e completa duas vezes seguidas.
    s = { ...s, quests: { ...s.quests, daily: { ...s.quests.daily!, progress: { [q.id]: q.target - 1 } } } };
    const once = play(s, ['RZP-001', 'RZP-004', 'PCT-001', 'BAS-001', 'GRA-001'], [], T0, 6 * 60 * 1000);
    const count = (r: Result[]) => r.flatMap((x) => events(x, 'questComplete')).filter((e) => e.questId === q.id).length;
    expect(count(once.results)).toBeLessThanOrEqual(1);
    const replay = { ...once.state, quests: { ...once.state.quests, daily: { ...once.state.quests.daily!, progress: {} } } };
    const again = play(replay, ['EST-001', 'PRB-001', 'COM-001', 'GEO-005', 'FUN-001'], [], T0 + 5000, 6 * 60 * 1000);
    expect(count(again.results)).toBe(0);
  });
});

describe('Oficina', () => {
  it('só vende comuns e incomuns, com preço', () => {
    expect(SHOP_ITEMS.length).toBeGreaterThanOrEqual(6);
    for (const i of SHOP_ITEMS) {
      expect(['comum', 'incomum']).toContain(i.rarity);
      expect(i.price).toBeGreaterThan(0);
    }
  });
  it('compra desconta Tinta, entrega o item, equipa e não pode repetir', () => {
    const item = SHOP_ITEMS[0];
    let s = onboarded();
    expect(() => buyItem(s, item.id, T0)).toThrow('Tinta insuficiente');
    s = { ...s, profile: { ...s.profile, ink: 500 } };
    const r = buyItem(s, item.id, T0);
    expect(r.state.profile.ink).toBe(500 - item.price!);
    expect(r.state.inventory[item.id]).toMatchObject({ source: 'oficina' });
    expect(r.state.profile.equipped[item.slot]).toBe(item.id);
    expect(r.state.ledger[`shop:${item.id}`]).toBeDefined();
    expect(events(r, 'purchase')).toEqual([{ type: 'purchase', itemId: item.id, price: item.price }]);
    expect(() => buyItem(r.state, item.id, T0)).toThrow('já tem');
    expect(() => buyItem(r.state, 'frame-basalto', T0)).toThrow('não está à venda');
    expect(getItem('frame-basalto').price).toBeUndefined();
  });
});

describe('Região 2 e Mercador Composto', () => {
  it('a Região 2 só abre depois de derrotar o Golem', () => {
    const r2 = getRegion('mercado-ambar');
    const view = { progress: {}, bosses: {} };
    expect(nodeStatus(r2.nodes[0], view)).toBe('locked');
    const won = { progress: {}, bosses: { 'golem-proporcional': { bossId: 'golem-proporcional', attempts: 1, wins: 1, failedSinceWin: 0, firstWinAt: T0, flawless: false, bestTurns: 7 } } };
    expect(nodeStatus(r2.nodes[0], won)).toBe('available');
    expect(nodeStatus(r2.nodes[3], won)).toBe('locked');
  });

  it('cofre de juros: erros devolvem vida (crescendo com erros seguidos) até o cofre quebrar', () => {
    const boss = getBoss('mercador-composto');
    expect(boss.trait.kind).toBe('interest');
    let b: BattleState = { ...createBattle(boss, 'm', T0, 0), hp: 200, currentQuestionId: 'Q1' };
    const miss = (bt: BattleState, q: string) =>
      applyBattleAnswer(boss, { ...bt, currentQuestionId: q }, { questionId: q, difficulty: 2, correct: false, guessed: false, hints: 0 });
    const r1 = miss(b, 'Q1');
    expect(r1.turn.healed).toBe(Math.round(260 * 0.08));
    expect(r1.battle.hp).toBe(200 + 21);
    const r2 = miss(r1.battle, 'Q2');
    expect(r2.turn.healed).toBe(Math.min(Math.round(260 * 0.08 * 2), 260 - 221));
    // Nunca passa da vida máxima.
    expect(interestHeal(boss, { ...b, hp: 255 })).toBe(5);
    // Cofre quebrado (fase 2): sem cura.
    b = { ...b, armorBroken: true };
    expect(miss(b, 'Q1').turn.healed).toBe(0);
    // O Golem (couraça) nunca cura.
    const golem = getBoss('golem-proporcional');
    expect(interestHeal(golem, createBattle(golem, 'g', T0, 0))).toBe(0);
  });

  it('quebra o cofre ao cair abaixo de 50% e premia a primeira vitória com itens do Mercador', () => {
    const boss = getBoss('mercador-composto');
    let b: BattleState = { ...createBattle(boss, 'm', T0, 0), currentQuestionId: 'Q0' };
    let broke = false;
    for (let i = 0; i < 20 && b.status === 'active'; i++) {
      const r = applyBattleAnswer(boss, { ...b, currentQuestionId: `Q${i}` }, { questionId: `Q${i}`, difficulty: 3, correct: true, guessed: false, hints: 0 });
      if (r.turn.armorBroke) {
        broke = true;
        expect(r.battle.hp).toBeLessThanOrEqual(boss.maxHp / 2);
      }
      b = r.battle;
    }
    expect(broke).toBe(true);
    expect(b.status).toBe('won');
    for (const id of [...boss.rewards.firstItems, boss.rewards.flawlessItem]) expect(getItem(id)).toBeDefined();
  });
});
