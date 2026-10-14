import { QUESTIONS, getQuestion, questionsFor } from '../../content/bank';
import { getBoss } from '../../content/bosses';
import { getRegion } from '../../content/regions';
import { ALT_KEYS, type AltKey } from '../../content/types';
import { applyBattleAnswer, computeDamage, createBattle } from '../boss/battle';
import { nextNode, nodeStatus } from '../campaign/campaign';
import {
  abandonSession,
  answerCurrent,
  battleAnswer,
  completeOnboarding,
  createInitialState,
  currentQuestionId,
  dismissBattle,
  equipItem,
  finishSession,
  planEchoHunt,
  planExpedition,
  planMission,
  retreatBattle,
  skipCurrent,
  startBattle,
  startSession,
  toggleQuestionFlag,
  touch,
} from '../game/game';
import type { GameEvent, GameState, Result } from '../game/types';
import { masteryFromCounts } from '../learning/mastery';
import { recommendFocus } from '../learning/recommend';
import { selectQuestions, spreadSubtopics } from '../learning/selection';
import { DAY_MS, schedule } from '../learning/srs';
import { levelForXp } from '../progression/levels';

const T0 = Date.UTC(2026, 9, 14, 12);

function onboarded(): GameState {
  return completeOnboarding(
    createInitialState(T0),
    { name: 'Ana', goal: 'enem', dailyMinutes: 10, selfLevel: 'intermediario', examYear: 2026 },
    T0,
  ).state;
}

const wrongKey = (qid: string): AltKey => ALT_KEYS.find((k) => k !== getQuestion(qid).answer) as AltKey;

let attemptSeq = 0;
function answer(state: GameState, correct: boolean, now: number, extra: { hints?: number; guessed?: boolean } = {}) {
  const qid = currentQuestionId(state.session!)!;
  return answerCurrent(
    state,
    {
      attemptId: `a${attemptSeq++}`,
      chosen: correct ? getQuestion(qid).answer : wrongKey(qid),
      guessed: extra.guessed ?? false,
      hints: extra.hints ?? 0,
      timeMs: 20_000,
    },
    now,
  );
}

function events<T extends GameEvent['type']>(r: Result, type: T) {
  return r.events.filter((e): e is Extract<GameEvent, { type: T }> => e.type === type);
}

function runMission(state: GameState, nodeId: string, correctCount: number, now: number, sessionId: string) {
  const region = getRegion('vale-proporcoes');
  const node = region.nodes.find((n) => n.id === nodeId);
  if (!node || node.kind !== 'mission') throw new Error('nó');
  const ids = planMission(state, node, now, 7);
  let s = startSession(state, { id: sessionId, mode: 'mission', nodeId, minutes: null, questionIds: ids }, now).state;
  let i = 0;
  while (currentQuestionId(s.session!)) {
    s = answer(s, i < correctCount, now + i).state;
    i++;
  }
  return finishSession(s, now + 100);
}

describe('seleção adaptativa', () => {
  it('é determinística para a mesma semente e sem repetições', () => {
    const a = selectQuestions({ pool: QUESTIONS, states: {}, count: 10, now: T0, seed: 42 });
    const b = selectQuestions({ pool: QUESTIONS, states: {}, count: 10, now: T0, seed: 42 });
    expect(a.map((q) => q.id)).toEqual(b.map((q) => q.id));
    expect(new Set(a.map((q) => q.id)).size).toBe(10);
  });

  it('prioriza Ecos devidos', () => {
    const states = { 'PCT-001': schedule(undefined, 'PCT-001', 'wrong', T0 - 2 * DAY_MS, 'x') };
    const picked = selectQuestions({ pool: QUESTIONS, states, count: 5, now: T0, seed: 1 });
    expect(picked.map((q) => q.id)).toContain('PCT-001');
  });

  it('dificuldade-alvo baixa favorece questões fáceis', () => {
    const easy = selectQuestions({ pool: QUESTIONS, states: {}, count: 12, now: T0, seed: 3, fixedTarget: 1 });
    const hard = selectQuestions({ pool: QUESTIONS, states: {}, count: 12, now: T0, seed: 3, fixedTarget: 4 });
    const avg = (xs: typeof easy) => xs.reduce((s, q) => s + q.difficulty, 0) / xs.length;
    expect(avg(easy)).toBeLessThan(avg(hard));
  });

  it('evita mesmo subassunto em sequência quando possível', () => {
    const qs = questionsFor({ topics: ['razao-proporcao'] }).slice(0, 6);
    const spread = spreadSubtopics(qs);
    for (let i = 1; i < spread.length; i++) {
      const possible = new Set(spread.slice(i).map((q) => q.subtopic)).size > 1;
      if (possible) expect(spread[i].subtopic).not.toBe(spread[i - 1].subtopic);
    }
  });
});

describe('domínio', () => {
  it('não afirma domínio sem amostra e exige evidência espaçada', () => {
    expect(masteryFromCounts(0, 0, 0).level).toBe('inexplorado');
    expect(masteryFromCounts(3, 0, 0).level).toBe('descoberta');
    expect(masteryFromCounts(10, 0, 0).level).toBe('firme');
    expect(masteryFromCounts(10, 0, 3).level).toBe('dominado');
    expect(masteryFromCounts(2, 4, 0).level).toBe('progresso');
  });
});

describe('primeira sessão: XP, nível 2 e primeira recompensa', () => {
  it('3 acertos + bônus de sessão sobem para o nível 2 e equipam a Moldura de Bronze', () => {
    let s = onboarded();
    const ids = planExpedition(s, 3, T0, 11);
    expect(ids).toHaveLength(3);
    s = startSession(s, { id: 's1', mode: 'expedition', nodeId: null, minutes: 3, questionIds: ids }, T0).state;
    for (let i = 0; i < 3; i++) s = answer(s, true, T0 + i * 1000).state;
    const done = finishSession(s, T0 + 5000);
    expect(done.state.profile.xp).toBeGreaterThanOrEqual(50);
    const st = done.state;
    expect(levelForXp(st.profile.xp)).toBe(2);
    expect(st.inventory['frame-bronze']).toBeDefined();
    expect(st.profile.equipped.frame).toBe('frame-bronze');
    expect(st.ledger['level:2']).toBeDefined();
    expect(events(done, 'sessionComplete')[0].summary).toMatchObject({ answered: 3, correct: 3 });
  });

  it('o Descanso do Viajante dobra o XP até esgotar', () => {
    let s = onboarded();
    s = touch(s, T0 + 5 * DAY_MS).state;
    expect(s.profile.restedPool).toBe(600);
    const ids = planExpedition(s, 3, T0 + 5 * DAY_MS, 2);
    s = startSession(s, { id: 'r', mode: 'expedition', nodeId: null, minutes: 3, questionIds: ids }, T0 + 5 * DAY_MS).state;
    const r = answer(s, true, T0 + 5 * DAY_MS + 1);
    const xpEv = events(r, 'xp')[0];
    expect(xpEv.restedBonus).toBe(xpEv.amount);
    expect(r.state.profile.restedPool).toBe(600 - xpEv.amount);
  });
});

describe('sessões', () => {
  it('erro gera Eco; pular devolve a questão uma vez ao fim da fila', () => {
    let s = onboarded();
    const ids = planExpedition(s, 5, T0, 5);
    s = startSession(s, { id: 'e', mode: 'expedition', nodeId: null, minutes: 5, questionIds: ids }, T0).state;
    const r = answer(s, false, T0);
    expect(events(r, 'echo')).toHaveLength(1);
    expect(r.state.questionStates[ids[0]].echo).toBe(true);
    s = r.state;
    const skippedId = currentQuestionId(s.session!)!;
    s = skipCurrent(s).state;
    expect(s.session!.queue[s.session!.queue.length - 1]).toBe(skippedId);
    expect(s.session!.queue).toHaveLength(6);
  });

  it('não aceita responder a mesma questão duas vezes (toque duplo)', () => {
    let s = onboarded();
    s = startSession(s, { id: 'd', mode: 'expedition', nodeId: null, minutes: 3, questionIds: ['RZP-001'] }, T0).state;
    s = answer(s, true, T0).state;
    expect(() => answer(s, true, T0)).toThrow();
  });

  it('andaime: dois erros seguidos no mesmo subassunto inserem uma questão mais acessível', () => {
    let s = onboarded();
    s = startSession(
      s,
      { id: 'sc', mode: 'expedition', nodeId: null, minutes: null, questionIds: ['RZP-006', 'RZP-012', 'PCT-001'] },
      T0,
    ).state;
    s = answer(s, false, T0).state;
    const r = answer(s, false, T0 + 1);
    const sc = events(r, 'scaffold');
    expect(sc).toHaveLength(1);
    const inserted = getQuestion(sc[0].questionId);
    // Não há composta mais fácil: o andaime recua para a base do mesmo assunto.
    expect(inserted.topic).toBe('razao-proporcao');
    expect(inserted.difficulty).toBeLessThan(3);
    expect(sc[0].conceptFrom).toBe('RZP-012');
    expect(currentQuestionId(r.state.session!)).toBe(inserted.id);
  });

  it('abandonar mantém o XP já ganho', () => {
    let s = onboarded();
    s = startSession(s, { id: 'ab', mode: 'expedition', nodeId: null, minutes: 3, questionIds: ['RZP-001', 'RZP-004'] }, T0).state;
    s = answer(s, true, T0).state;
    const xp = s.profile.xp;
    s = abandonSession(s).state;
    expect(s.session).toBeNull();
    expect(s.profile.xp).toBe(xp);
  });
});

describe('campanha e chefão', () => {
  it('missões desbloqueiam em ordem; recompensa de 1ª conclusão é única', () => {
    let s = onboarded();
    const region = getRegion('vale-proporcoes');
    const view = () => ({ progress: s.campaign, bosses: s.bosses });
    expect(nodeStatus(region.nodes[1], view())).toBe('locked');
    expect(() =>
      startSession(s, { id: 'x', mode: 'mission', nodeId: 'r1-m2', minutes: null, questionIds: ['RZP-004'] }, T0),
    ).toThrow('bloqueada');

    // Falhar (2 acertos de 5) não conclui.
    let r = runMission(s, 'r1-m1', 2, T0, 'm1a');
    expect(events(r, 'sessionComplete')[0].summary.missionPassed).toBe(false);
    s = r.state;
    expect(nodeStatus(region.nodes[0], view())).toBe('available');

    r = runMission(s, 'r1-m1', 5, T0 + DAY_MS, 'm1b');
    expect(events(r, 'missionComplete')[0]).toMatchObject({ nodeId: 'r1-m1', first: true });
    s = r.state;
    expect(nodeStatus(region.nodes[1], view())).toBe('available');
    expect(nextNode(view())?.node.id).toBe('r1-m2');

    const xpBefore = s.profile.xp;
    r = runMission(s, 'r1-m1', 5, T0 + 2 * DAY_MS, 'm1c');
    expect(events(r, 'missionComplete')[0].first).toBe(false);
    expect(events(r, 'xp').some((e) => e.source === 'mission')).toBe(false);
    expect(r.state.profile.xp).toBeGreaterThanOrEqual(xpBefore);
  });

  function unlockBoss(): GameState {
    let s = onboarded();
    s = runMission(s, 'r1-m1', 5, T0, 'u1').state;
    s = runMission(s, 'r1-m2', 5, T0 + DAY_MS, 'u2').state;
    s = runMission(s, 'r1-m3', 5, T0 + 2 * DAY_MS, 'u3').state;
    return s;
  }

  it('o chefão só abre depois das 3 missões', () => {
    expect(() => startBattle(onboarded(), 'golem-proporcional', 'b0', T0)).toThrow('bloqueado');
    const s = unlockBoss();
    expect(() => startBattle(s, 'golem-proporcional', 'b1', T0)).not.toThrow();
  });

  it('vitória sem erros e sem dicas concede itens do chefão e a aura lendária — uma única vez', () => {
    let s = unlockBoss();
    const t = T0 + 3 * DAY_MS;
    s = startBattle(s, 'golem-proporcional', 'b1', t).state;
    let last: Result | null = null;
    let guard = 0;
    while (s.battle!.status === 'active' && guard++ < 30) {
      const qid = s.battle!.currentQuestionId!;
      last = battleAnswer(s, { attemptId: `b${guard}`, chosen: getQuestion(qid).answer, guessed: false, hints: 0, timeMs: 1000 }, t + guard);
      s = last.state;
    }
    expect(s.battle!.status).toBe('won');
    expect(events(last!, 'bossDefeated')[0]).toMatchObject({ first: true, flawless: true });
    expect(s.inventory['frame-basalto']).toBeDefined();
    expect(s.inventory['title-quebra-golem']).toBeDefined();
    expect(s.inventory['aura-aurea']).toBeDefined();
    expect(new Set(s.battle!.usedQuestionIds).size).toBe(s.battle!.usedQuestionIds.length);

    // Segunda vitória no mesmo dia: sem itens nem XP de 1ª vitória.
    s = dismissBattle(s).state;
    s = startBattle(s, 'golem-proporcional', 'b2', t + 1000).state;
    guard = 0;
    const bossItemEvents: GameEvent[] = [];
    while (s.battle!.status === 'active' && guard++ < 30) {
      const qid = s.battle!.currentQuestionId!;
      last = battleAnswer(s, { attemptId: `c${guard}`, chosen: getQuestion(qid).answer, guessed: false, hints: 0, timeMs: 1000 }, t + 2000 + guard);
      s = last.state;
      bossItemEvents.push(...events(last, 'item').filter((e) => e.source.startsWith('boss:')));
    }
    expect(events(last!, 'bossDefeated')[0].first).toBe(false);
    expect(bossItemEvents).toHaveLength(0);
    expect(events(last!, 'xp').filter((e) => e.source === 'boss').map((e) => e.amount)).toEqual([getBoss('golem-proporcional').rewards.repeatXp]);
    expect(s.bosses['golem-proporcional'].wins).toBe(2);
  });

  it('três erros = retirada; a próxima tentativa ganha Conhecimento do Inimigo', () => {
    let s = unlockBoss();
    s = startBattle(s, 'golem-proporcional', 'f1', T0).state;
    for (let i = 0; i < 3; i++) {
      const qid = s.battle!.currentQuestionId!;
      s = battleAnswer(s, { attemptId: `f${i}`, chosen: wrongKey(qid), guessed: false, hints: 0, timeMs: 1000 }, T0 + i).state;
    }
    expect(s.battle!.status).toBe('retreated');
    expect(s.bosses['golem-proporcional'].failedSinceWin).toBe(1);
    s = dismissBattle(s).state;
    s = startBattle(s, 'golem-proporcional', 'f2', T0 + 10).state;
    expect(s.battle!.knowledgeBonus).toBeCloseTo(0.1);
    s = retreatBattle(s).state;
    expect(s.bosses['golem-proporcional'].failedSinceWin).toBe(2);
  });
});

describe('motor de batalha', () => {
  const boss = getBoss('golem-proporcional');
  it('couraça reduz dano de questões fáceis até quebrar', () => {
    const b = createBattle(boss, 'x', T0, 0);
    expect(computeDamage(boss, b, { difficulty: 1, hints: 0, guessed: false }).damage).toBe(9);
    expect(computeDamage(boss, { ...b, armorBroken: true }, { difficulty: 1, hints: 0, guessed: false }).damage).toBe(18);
  });
  it('combo de 3 ativa a técnica; dano é determinístico', () => {
    let b = { ...createBattle(boss, 'x', T0, 0), currentQuestionId: 'Q1' };
    const hits: number[] = [];
    const techs: boolean[] = [];
    for (let i = 0; i < 3; i++) {
      const r = applyBattleAnswer(boss, b, { questionId: b.currentQuestionId!, difficulty: 2, correct: true, guessed: false, hints: 0 });
      hits.push(r.turn.damage);
      techs.push(r.turn.technique);
      b = { ...r.battle, currentQuestionId: `Q${i + 2}` };
    }
    expect(hits).toEqual([26, 30, 34 + boss.technique.bonus]);
    expect(techs).toEqual([false, false, true]);
  });
  it('rejeita resposta fora de turno', () => {
    const b = { ...createBattle(boss, 'x', T0, 0), currentQuestionId: 'Q1' };
    expect(() =>
      applyBattleAnswer(boss, b, { questionId: 'Q2', difficulty: 2, correct: true, guessed: false, hints: 0 }),
    ).toThrow();
  });
});

describe('personagem', () => {
  it('só equipa itens possuídos', () => {
    const s = onboarded();
    expect(() => equipItem(s, 'aura-zenite')).toThrow();
    expect(equipItem(s, 'frame-cobre').state.profile.equipped.frame).toBe('frame-cobre');
  });
  it('favoritar cria estado sem contar como resposta', () => {
    const s = toggleQuestionFlag(onboarded(), 'GEO-001', 'favorite').state;
    expect(s.questionStates['GEO-001']).toMatchObject({ favorite: true, seen: 0 });
  });
});

describe('recomendação e planos especiais', () => {
  it('recomenda um subassunto fraco quando há evidência de dificuldade', () => {
    const states: GameState['questionStates'] = {};
    let t = T0;
    for (const id of ['EST-001', 'EST-003', 'EST-004', 'EST-006']) {
      states[id] = schedule(undefined, id, 'wrong', t++, 'x');
    }
    states['EST-001'] = schedule(states['EST-001'], 'EST-001', 'wrong', t++, 'y');
    const rec = recommendFocus(QUESTIONS, states);
    expect(rec).toMatchObject({ topic: 'estatistica', subtopic: 'media', reason: 'fraco' });
  });

  it('sem histórico, recomenda um assunto inexplorado de alto peso', () => {
    const rec = recommendFocus(QUESTIONS, {});
    expect(rec?.reason).toBe('inexplorado');
  });

  it('caça aos Ecos usa só revisões vencidas', () => {
    const s = onboarded();
    s.questionStates = {
      'PCT-001': schedule(undefined, 'PCT-001', 'wrong', T0, 'a'),
      'PCT-002': schedule(undefined, 'PCT-002', 'correct', T0, 'a'),
    };
    expect(planEchoHunt(s, T0 + 1000)).toEqual([]);
    expect(planEchoHunt(s, T0 + 2 * DAY_MS)).toEqual(['PCT-001']);
  });
});
