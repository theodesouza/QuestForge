import { getQuestion } from '../../content/bank';
import { REGIONS, findNode, type MissionNode } from '../../content/regions';
import { ALT_KEYS, type AltKey, type Difficulty, type Question } from '../../content/types';
import { missionScore, missionStars, STAR_REWARDS } from '../campaign/score';
import {
  answerCurrent,
  completeOnboarding,
  createInitialState,
  currentQuestionId,
  finishSession,
  missionPool,
  planMission,
  startSession,
  touch,
} from '../game/game';
import type { GameEvent, GameState, Result, SessionSummary } from '../game/types';
import { alternativeOrder, displayLetter } from '../learning/alternatives';
import { maxUnseenMatching, planMissionRun, reuseRank, unseenCount } from '../learning/missionPlan';
import { normalizeNodeProgress } from '../game/normalize';
import { schedule, type QuestionState } from '../learning/srs';
import { classify, sessionBonus } from '../progression/xp';

const T0 = Date.UTC(2026, 9, 14, 15);
const DAY = 24 * 60 * 60 * 1000;

function fakeQuestion(id: string, difficulty: Difficulty, subtopic: string): Question {
  return {
    id,
    topic: 'razao-proporcao',
    subtopic,
    difficulty,
    skills: ['H1'],
    stem: [{ kind: 'p', text: 'Enunciado de teste.' }],
    ask: 'Pergunta de teste?',
    alternatives: { A: '1', B: '2', C: '3', D: '4', E: '5' },
    answer: 'A',
    hints: ['Dica de teste 1.', 'Dica de teste 2.'],
    solution: ['Passo.'],
    concept: 'Conceito de teste suficientemente longo.',
    estimatedSeconds: 60,
    source: { kind: 'autoral' },
  };
}

/** Pool sintético de 30 questões: 12 fáceis, 12 médias, 6 difíceis, em 3 subassuntos. */
const POOL: Question[] = [
  ...Array.from({ length: 12 }, (_, i) => fakeQuestion(`TST-${100 + i}`, 1, ['a', 'b', 'c'][i % 3])),
  ...Array.from({ length: 12 }, (_, i) => fakeQuestion(`TST-${200 + i}`, 2, ['a', 'b', 'c'][i % 3])),
  ...Array.from({ length: 6 }, (_, i) => fakeQuestion(`TST-${300 + i}`, 3, ['a', 'b', 'c'][i % 3])),
];
const PROFILE: Difficulty[] = [1, 1, 2, 2, 3];

function markSeen(states: Record<string, QuestionState>, ids: string[], now: number, outcome: 'correct' | 'wrong' = 'correct') {
  const next = { ...states };
  for (const id of ids) next[id] = schedule(next[id], id, outcome, now, `run-${now}`);
  return next;
}

describe('planejamento de tentativas de missão', () => {
  it('monta a tentativa com o tamanho e a rampa de dificuldade do perfil', () => {
    const run = planMissionRun({ pool: POOL, states: {}, profile: PROFILE, now: T0, seed: 1 });
    expect(run).toHaveLength(5);
    expect(new Set(run.map((q) => q.id)).size).toBe(5);
    expect(run.map((q) => q.difficulty)).toEqual([1, 1, 2, 2, 3]);
  });

  it('é determinística por semente e varia entre tentativas', () => {
    const a = planMissionRun({ pool: POOL, states: {}, profile: PROFILE, now: T0, seed: 7 });
    expect(planMissionRun({ pool: POOL, states: {}, profile: PROFILE, now: T0, seed: 7 })).toEqual(a);
    const variants = new Set(Array.from({ length: 12 }, (_, s) => planMissionRun({ pool: POOL, states: {}, profile: PROFILE, now: T0, seed: s }).map((q) => q.id).join()));
    expect(variants.size).toBeGreaterThan(8);
  });

  it('não repete nenhuma questão enquanto houver inéditas: 6 tentativas cobrem as 30', () => {
    let states: Record<string, QuestionState> = {};
    const seen = new Set<string>();
    for (let run = 0; run < 6; run++) {
      const now = T0 + run * 60_000;
      const ids = planMissionRun({ pool: POOL, states, profile: PROFILE, now, seed: 100 + run }).map((q) => q.id);
      for (const id of ids) {
        expect(seen.has(id)).toBe(false);
        seen.add(id);
      }
      states = markSeen(states, ids, now);
    }
    expect(seen.size).toBe(30);
    expect(unseenCount(POOL, states)).toBe(0);
  });

  it('esgotadas as inéditas, volta primeiro com Ecos, revisões e erros; a última tentativa fica por último', () => {
    let states: Record<string, QuestionState> = {};
    // Todas vistas e acertadas há 2 dias (nenhuma revisão vencida: caixa 3 = 3 dias).
    for (const q of POOL) states = markSeen(markSeen(states, [q.id], T0 - 5 * DAY), [q.id], T0 - 2 * DAY);
    // Eco devido (errada há 2 dias), revisão vencida e uma questão errada no passado.
    states = markSeen(states, ['TST-205'], T0 - 2 * DAY, 'wrong');
    states = { ...states, 'TST-101': { ...states['TST-101'], dueAt: T0 - 1000 } };
    states = { ...states, 'TST-302': { ...states['TST-302'], wrong: 1 } };
    // A tentativa anterior acabou de acontecer: deve ser a última a voltar.
    const recent = ['TST-100', 'TST-102', 'TST-200', 'TST-201', 'TST-300'];
    states = markSeen(states, recent, T0 - 60_000);
    expect(reuseRank(states['TST-205'], T0)).toBe(0);
    expect(reuseRank(states['TST-101'], T0)).toBe(2);
    expect(reuseRank(states['TST-302'], T0)).toBe(3);

    const ids = planMissionRun({ pool: POOL, states, profile: PROFILE, now: T0, seed: 3 }).map((q) => q.id);
    expect(ids).toEqual(expect.arrayContaining(['TST-205', 'TST-101', 'TST-302']));
    for (const id of recent) expect(ids).not.toContain(id);
  });

  it('nunca foge mais de 1 nível da dificuldade-alvo quando há questões no nível', () => {
    for (let seed = 0; seed < 30; seed++) {
      const run = planMissionRun({ pool: POOL, states: {}, profile: [3, 3, 3, 3, 3], now: T0, seed });
      for (const q of run) expect(q.difficulty).toBeGreaterThanOrEqual(2);
    }
  });

  it('com pool pequeno, devolve o que há sem repetir', () => {
    const run = planMissionRun({ pool: POOL.slice(0, 3), states: {}, profile: PROFILE, now: T0, seed: 1 });
    expect(run).toHaveLength(3);
    expect(new Set(run.map((q) => q.id)).size).toBe(3);
  });
});

describe('planejamento: prioridades finas', () => {
  it('usa o máximo de inéditas possível, mesmo quando a escolha gulosa as desperdiçaria', () => {
    // Inéditas [1,1,2,3,4] para o perfil [1,2,2,3,3]: cabem todas (a de nível 4 numa vaga 3).
    const fresh = [fakeQuestion('TST-901', 1, 'a'), fakeQuestion('TST-902', 1, 'b'), fakeQuestion('TST-903', 2, 'c'), fakeQuestion('TST-904', 3, 'a'), fakeQuestion('TST-905', 4, 'b')];
    const pool = [...POOL, ...fresh];
    const states = markSeen({}, POOL.map((q) => q.id), T0);
    const profile: Difficulty[] = [1, 2, 2, 3, 3];
    expect(maxUnseenMatching(profile, fresh)).toBe(5);
    for (let seed = 0; seed < 200; seed++) {
      const run = planMissionRun({ pool, states, profile, now: T0 + 60_000, seed });
      expect(run.map((q) => q.id).sort()).toEqual(fresh.map((q) => q.id));
    }
  });

  it('um Eco vencido volta antes de questões dominadas, mesmo a 1 nível da vaga', () => {
    let states = markSeen({}, POOL.map((q) => q.id), T0);
    states = markSeen(states, ['TST-301'], T0, 'wrong'); // nível 3, Eco
    const profile: Difficulty[] = [1, 1, 2, 2, 2]; // nenhuma vaga de nível 3
    const later = T0 + 2 * DAY;
    expect(reuseRank(states['TST-301'], later)).toBe(0);
    for (let seed = 0; seed < 50; seed++) {
      const run = planMissionRun({ pool: POOL, states, profile, now: later, seed });
      expect(run.map((q) => q.id)).toContain('TST-301');
    }
  });

  it('entre as já vistas, a resolvida há mais tempo volta antes da tentativa anterior', () => {
    let states = markSeen({}, POOL.map((q) => q.id), T0);
    const last = planMissionRun({ pool: POOL, states, profile: PROFILE, now: T0 + 1000, seed: 3 }).map((q) => q.id);
    states = markSeen(states, last, T0 + 1000);
    for (let seed = 0; seed < 50; seed++) {
      const run = planMissionRun({ pool: POOL, states, profile: PROFILE, now: T0 + 2000, seed });
      expect(run.filter((q) => last.includes(q.id))).toEqual([]);
    }
  });
});

describe('Ecos: redenção só quando o Eco volta', () => {
  it('acertar um Eco antes do prazo é treino: sem redenção, e o Eco continua', () => {
    const prior = schedule(undefined, 'X', 'wrong', T0, 's1');
    const base = { difficulty: 2 as Difficulty, correct: true, guessed: false, hintsUsed: 0, sessionId: 's2' };
    expect(classify({ ...base, prior, now: T0 + 60_000 })).toBe('practice');
    const after = schedule(prior, 'X', 'correct', T0 + 60_000, 's2');
    expect(after.echo).toBe(true);
    expect(after.dueAt).toBe(prior.dueAt);
    expect(classify({ ...base, prior: after, now: T0 + 2 * DAY })).toBe('redemption');
    expect(schedule(after, 'X', 'correct', T0 + 2 * DAY, 's3').echo).toBe(false);
  });
});

describe('alternativas embaralhadas', () => {
  const q = { id: 'RZP-001', fixedOrder: false };
  it('é uma permutação de A–E, estável por tentativa e diferente entre tentativas', () => {
    const order = alternativeOrder(q, 'sessao-1');
    expect([...order].sort()).toEqual([...ALT_KEYS]);
    expect(alternativeOrder(q, 'sessao-1')).toEqual(order);
    const orders = new Set(Array.from({ length: 20 }, (_, i) => alternativeOrder(q, `sessao-${i}`).join('')));
    expect(orders.size).toBeGreaterThan(12);
  });

  it('a alternativa correta aparece em todas as posições com frequência parecida', () => {
    const counts: Record<AltKey, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    for (let i = 0; i < 2000; i++) counts[displayLetter(alternativeOrder(q, `t${i}`), 'C')]++;
    for (const k of ALT_KEYS) {
      expect(counts[k]).toBeGreaterThan(300);
      expect(counts[k]).toBeLessThan(500);
    }
  });

  it('ordem fixa quando a questão pede', () => {
    expect(alternativeOrder({ id: 'X', fixedOrder: true }, 'qualquer')).toEqual([...ALT_KEYS]);
  });

  it('a letra exibida corresponde à posição da alternativa canônica', () => {
    const order: AltKey[] = ['D', 'A', 'E', 'C', 'B'];
    expect(displayLetter(order, 'D')).toBe('A');
    expect(displayLetter(order, 'B')).toBe('E');
  });
});

describe('pontuação e estrelas', () => {
  const a = (difficulty: Difficulty, correct: boolean | null, hints = 0, guessed = false) => ({ questionId: 'x', difficulty, correct, hints, guessed });
  it('1000 = tudo certo, sem dica e sem chute; dicas, chutes e erros descontam', () => {
    expect(missionScore([a(1, true), a(2, true), a(3, true)])).toBe(1000);
    expect(missionScore([a(1, false), a(2, false)])).toBe(0);
    expect(missionScore([a(2, true, 1), a(2, true)])).toBe(875);
    expect(missionScore([a(2, true, 0, true), a(2, true)])).toBe(750);
    expect(missionScore([a(1, true), a(3, null)])).toBe(400);
    expect(missionScore([])).toBe(0);
  });
  it('estrelas: concluir, errar no máximo uma, acertar todas', () => {
    expect(missionStars(false, 2, 5)).toBe(0);
    expect(missionStars(true, 3, 5)).toBe(1);
    expect(missionStars(true, 4, 5)).toBe(2);
    expect(missionStars(true, 5, 5)).toBe(3);
  });
});

// ——————————————————————————————————————————————————— no jogo

const wrongKey = (qid: string): AltKey => ALT_KEYS.find((k) => k !== getQuestion(qid).answer) as AltKey;
const node = findNode('r1-m1')!.node as MissionNode;

function onboarded(now = T0): GameState {
  return completeOnboarding(
    touch(createInitialState(now), now, 180).state,
    { name: 'Lia', goal: 'enem', dailyMinutes: 10, selfLevel: 'intermediario', examYear: null },
    now,
  ).state;
}

let seq = 0;
function runMission(state: GameState, now: number, opts: { wrong?: number; hints?: number } = {}) {
  const ids = planMission(state, node, now, 1000 + seq);
  let s = startSession(state, { id: `m${seq++}`, mode: 'mission', nodeId: node.id, minutes: null, questionIds: ids }, now).state;
  let i = 0;
  while (s.session && currentQuestionId(s.session)) {
    const qid = currentQuestionId(s.session)!;
    const wrong = i < (opts.wrong ?? 0);
    s = answerCurrent(
      s,
      { attemptId: `a${seq++}`, chosen: wrong ? wrongKey(qid) : getQuestion(qid).answer, guessed: false, hints: opts.hints ?? 0, timeMs: 30_000 },
      now + i,
    ).state;
    i++;
  }
  const fin: Result = finishSession(s, now + 1000);
  const summary = (fin.events.find((e) => e.type === 'sessionComplete') as Extract<GameEvent, { type: 'sessionComplete' }>).summary;
  return { state: fin.state, ids, summary };
}

describe('missões repetidas no jogo', () => {
  it('a segunda tentativa traz questões inéditas da missão', () => {
    const s0 = onboarded();
    const first = runMission(s0, T0);
    const second = runMission(first.state, T0 + 60_000);
    expect(second.ids.filter((id) => first.ids.includes(id))).toEqual([]);
    expect(second.summary.unseenLeft).toBe(missionPool(node).length - 10);
  });

  it('registra pontuação, estrelas e recorde; recompensa de estrela só uma vez', () => {
    const s0 = onboarded();
    const r1 = runMission(s0, T0, { wrong: 2 }); // 3/5: passa com 1 estrela
    expect(r1.summary).toMatchObject({ missionPassed: true, missionStars: 1, previousBest: null, newRecord: false, starXp: 0 });
    expect(r1.state.campaign[node.id]).toMatchObject({ bestStars: 1, lastScore: r1.summary.missionScore, bestScore: r1.summary.missionScore });

    const r2 = runMission(r1.state, T0 + DAY); // 5/5: 3 estrelas, recorde
    const s2 = r2.summary as SessionSummary;
    expect(s2).toMatchObject({ missionStars: 3, newRecord: true, previousBest: r1.summary.missionScore });
    expect(s2.starXp).toBe(STAR_REWARDS[2].xp + STAR_REWARDS[3].xp);
    expect(s2.starInk).toBe(STAR_REWARDS[2].ink + STAR_REWARDS[3].ink);
    expect(r2.state.ledger[`mission:${node.id}:star3`]).toBeDefined();
    expect(r2.state.campaign[node.id]).toMatchObject({ bestStars: 3, bestScore: 1000, runs: 2 });

    const r3 = runMission(r2.state, T0 + 2 * DAY, { wrong: 2 }); // pior: o recorde fica
    expect(r3.summary).toMatchObject({ newRecord: false, starXp: 0, starInk: 0 });
    expect(r3.state.campaign[node.id]).toMatchObject({ bestStars: 3, bestScore: 1000, lastScore: r3.summary.missionScore });

    const r4 = runMission(r3.state, T0 + 3 * DAY); // 3 estrelas de novo: sem nova recompensa
    expect(r4.summary).toMatchObject({ missionStars: 3, newRecord: false, starXp: 0 });
  });

  it('dicas reduzem a pontuação, mas não as estrelas', () => {
    const r = runMission(onboarded(), T0, { hints: 2 });
    expect(r.summary.missionStars).toBe(3);
    expect(r.summary.missionScore).toBe(500);
  });

  it('anti-farm: repetir sem parar questões já resolvidas não rende bônus nem XP', () => {
    let s = onboarded();
    const runs = Math.ceil(missionPool(node).length / node.questionCount);
    for (let i = 0; i < runs; i++) s = runMission(s, T0 + i * 60_000).state; // esgota as inéditas
    // (Encomendas do dia podem ser cumpridas aqui: são recompensas únicas por dia, não farm.)
    let bonusTotal = 0;
    let answerXp = 0;
    let ink = 0;
    for (let i = 0; i < 10; i++) {
      const r = runMission(s, T0 + DAY / 2 + i * 60_000);
      bonusTotal += r.summary.bonusXp;
      answerXp += r.summary.xp;
      ink += r.summary.ink;
      s = r.state;
    }
    expect(bonusTotal).toBe(0);
    expect(answerXp).toBe(0);
    expect(ink).toBe(0);
  });

  it('anti-farm: errar de propósito e acertar na tentativa seguinte não vira redenção', () => {
    let s = onboarded();
    const runs = Math.ceil(missionPool(node).length / node.questionCount);
    for (let i = 0; i < runs; i++) s = runMission(s, T0 + i * 60_000).state; // esgota as inéditas
    let bonus = 0;
    let ink = 0;
    let redemptions = 0;
    for (let i = 0; i < 5; i++) {
      const t = T0 + DAY / 2 + i * 120_000;
      const fail = runMission(s, t, { wrong: 99 });
      const fix = runMission(fail.state, t + 60_000);
      bonus += fail.summary.bonusXp + fix.summary.bonusXp;
      ink += fix.summary.ink;
      redemptions += fix.summary.redemptions.length;
      s = fix.state;
    }
    expect(redemptions).toBe(0);
    expect(bonus).toBe(0);
    expect(ink).toBe(0);
    // Os Ecos continuam vivos e valem a redenção quando voltam no prazo.
    const later = runMission(s, T0 + 3 * DAY);
    expect(later.summary.redemptions.length).toBeGreaterThan(0);
  });

  it('estrelas gravadas com pontuação não são recalculadas ao carregar', () => {
    // 4 acertos contando o reforço do andaime, mas 1 estrela pelas questões planejadas.
    const loaded = normalizeNodeProgress({ nodeId: node.id, completedAt: T0, bestCorrect: 4, runs: 1, bestScore: 450, bestStars: 1, lastScore: 450 });
    expect(loaded.bestStars).toBe(1);
    // Progresso antigo (sem pontuação) continua ganhando as estrelas deduzidas.
    const legacy = normalizeNodeProgress({ nodeId: node.id, completedAt: T0, bestCorrect: 4, runs: 1 });
    expect(legacy.bestStars).toBe(2);
  });

  it('bônus de sessão exige respostas que ensinam algo', () => {
    expect(sessionBonus(5, 0, 5)).toEqual({ xp: 40, perfect: true });
    expect(sessionBonus(5, 0, 2)).toEqual({ xp: 0, perfect: false });
    expect(sessionBonus(3, 0, 3)).toEqual({ xp: 20, perfect: false });
  });
});

describe('missões reais: rejogabilidade com o banco de questões', () => {
  const missions = REGIONS.flatMap((r) => r.nodes).filter((n): n is MissionNode => n.kind === 'mission');

  it.each(missions.map((m) => [m.id, m]))('%s: ao menos 5 tentativas sem repetir; repetição só quando não sobra inédita compatível', (_id, n) => {
    const node = n as MissionNode;
    const pool = missionPool(node);
    let states: Record<string, QuestionState> = {};
    let freshRuns = 0;
    let stillFresh = true;
    for (let run = 0; run < 12 && unseenCount(pool, states) > 0; run++) {
      const now = T0 + run * 60_000;
      const picked = planMissionRun({ pool, states, profile: node.difficulty, now, seed: 500 + run });
      expect(picked).toHaveLength(node.questionCount);
      const ids = new Set(picked.map((q) => q.id));
      let repeated = false;
      picked.forEach((q, i) => {
        const d = node.difficulty[i];
        expect(Math.abs(q.difficulty - d)).toBeLessThanOrEqual(1);
        if (states[q.id]?.seen) {
          repeated = true;
          // Repetiu: não podia haver inédita compatível com esta vaga sobrando fora da tentativa.
          const spare = pool.filter((c) => !ids.has(c.id) && !states[c.id]?.seen && Math.abs(c.difficulty - d) <= 1);
          expect(spare.map((c) => c.id)).toEqual([]);
        }
      });
      if (repeated) stillFresh = false;
      if (stillFresh) freshRuns++;
      states = markSeen(states, picked.map((q) => q.id), now);
    }
    // 5 questões por tentativa + 20 extras ⇒ pelo menos 5 tentativas totalmente inéditas.
    expect(freshRuns).toBeGreaterThanOrEqual(5);
  });
});
