import { LEVEL_START_XP, MAX_LEVEL, levelForXp, levelProgress, rankFor, xpToNext } from '../progression/levels';
import { RESTED_CAP, accrueRested, applyRested, restedFromAbsence } from '../progression/rested';
import { nextItemLevel, rewardsForLevel } from '../progression/rewards';
import { BASE_XP, REPEAT_COOLDOWN_MS, computeXp, hintMultiplier, sessionBonus } from '../progression/xp';
import { DAY_MS, HOUR_MS, emptyQuestionState, schedule } from '../learning/srs';

const NOW = Date.UTC(2026, 9, 14, 12);

describe('curva de níveis', () => {
  it('é estritamente crescente e começa rápida', () => {
    expect(xpToNext(1)).toBe(50);
    for (let l = 2; l < MAX_LEVEL; l++) expect(xpToNext(l)).toBeGreaterThan(xpToNext(l - 1));
    expect(xpToNext(MAX_LEVEL)).toBe(Infinity);
  });

  it('total até o nível 50 fica em ~58 mil XP', () => {
    expect(LEVEL_START_XP[MAX_LEVEL]).toBe(58000);
  });

  it('levelForXp respeita exatamente os limiares', () => {
    expect(levelForXp(0)).toBe(1);
    expect(levelForXp(49)).toBe(1);
    expect(levelForXp(50)).toBe(2);
    expect(levelForXp(LEVEL_START_XP[10] - 1)).toBe(9);
    expect(levelForXp(LEVEL_START_XP[10])).toBe(10);
    expect(levelForXp(10_000_000)).toBe(MAX_LEVEL);
    expect(levelForXp(-20)).toBe(1);
  });

  it('levelProgress calcula restante e razão', () => {
    const p = levelProgress(30);
    expect(p).toMatchObject({ level: 1, into: 30, span: 50, remaining: 20, isMax: false });
    expect(p.ratio).toBeCloseTo(0.6);
    expect(levelProgress(10_000_000)).toMatchObject({ level: 50, isMax: true, ratio: 1 });
  });

  it('patentes mudam a cada 5 níveis', () => {
    expect(rankFor(1).title).toBe('Aprendiz de Cartógrafo');
    expect(rankFor(4).index).toBe(0);
    expect(rankFor(5).index).toBe(1);
    expect(rankFor(50).title).toBe('Senhor do Zênite');
  });
});

describe('recompensas por nível', () => {
  it('nível 2 concede a primeira moldura e Tinta', () => {
    expect(rewardsForLevel(2)).toEqual([
      { kind: 'item', itemId: 'frame-bronze' },
      { kind: 'ink', amount: 14 },
    ]);
  });
  it('todo nível de 2 a 50 concede algo; nível 1 e acima de 50, nada', () => {
    for (let l = 2; l <= 50; l++) expect(rewardsForLevel(l).length).toBeGreaterThan(0);
    expect(rewardsForLevel(1)).toEqual([]);
    expect(rewardsForLevel(51)).toEqual([]);
  });
  it('próxima recompensa com item', () => {
    expect(nextItemLevel(1)).toEqual({ level: 2, itemIds: ['frame-bronze'] });
    expect(nextItemLevel(4)?.level).toBe(5);
    expect(nextItemLevel(5)?.level).toBe(6);
    expect(nextItemLevel(50)).toBeNull();
  });
});

describe('regras de XP', () => {
  const input = (over: Partial<Parameters<typeof computeXp>[0]> = {}) => ({
    difficulty: 2 as const,
    correct: true,
    guessed: false,
    hintsUsed: 0,
    prior: undefined,
    sessionId: 's1',
    now: NOW,
    ...over,
  });

  it('acerto inédito dá a base da dificuldade', () => {
    expect(computeXp(input())).toMatchObject({ kind: 'first', xp: BASE_XP[2], ink: 2 });
    expect(computeXp(input({ difficulty: 4 })).xp).toBe(34);
  });

  it('erro não dá XP', () => {
    expect(computeXp(input({ correct: false }))).toMatchObject({ kind: 'wrong', xp: 0, ink: 0 });
  });

  it('dicas reduzem 25% cada, com piso de 50%', () => {
    expect(hintMultiplier(1)).toBe(0.75);
    expect(hintMultiplier(2)).toBe(0.5);
    expect(hintMultiplier(5)).toBe(0.5);
    expect(computeXp(input({ hintsUsed: 1 })).xp).toBe(12);
  });

  it('chute rende metade', () => {
    expect(computeXp(input({ guessed: true })).xp).toBe(8);
  });

  it('redenção (acertar um Eco de outra sessão) rende 150%', () => {
    const prior = schedule(undefined, 'Q', 'wrong', NOW - DAY_MS, 's0');
    expect(computeXp(input({ prior })).kind).toBe('redemption');
    expect(computeXp(input({ prior })).xp).toBe(24);
  });

  it('chute não redime um Eco', () => {
    const prior = schedule(undefined, 'Q', 'wrong', NOW - DAY_MS, 's0');
    expect(computeXp(input({ prior, guessed: true })).kind).not.toBe('redemption');
  });

  it('acertar o Eco na mesma sessão do erro não é redenção', () => {
    const prior = schedule(undefined, 'Q', 'wrong', NOW - 60_000, 's1');
    expect(computeXp(input({ prior })).kind).not.toBe('redemption');
  });

  it('revisão devida rende 60%', () => {
    const prior = { ...schedule(undefined, 'Q', 'correct', NOW - 4 * DAY_MS, 's0'), lastXpAt: NOW - 4 * DAY_MS };
    expect(computeXp(input({ prior }))).toMatchObject({ kind: 'review', xp: 10 });
  });

  it('anti-farm: repetir uma questão já acertada rende 0 dentro de 20 h e 10% depois', () => {
    const answered = { ...schedule(undefined, 'Q', 'correct', NOW, 's0'), lastXpAt: NOW };
    expect(computeXp(input({ prior: answered, now: NOW + HOUR_MS }))).toMatchObject({ kind: 'cooldown', xp: 0 });
    const later = NOW + REPEAT_COOLDOWN_MS + 1;
    // Ainda não devida (caixa 2 = ~3 dias): repetição comum.
    expect(computeXp(input({ prior: answered, now: later }))).toMatchObject({ kind: 'repeat', xp: 2, ink: 0 });
  });

  it('repetir uma questão fácil 100 vezes num dia rende no máximo a base uma vez', () => {
    let prior = undefined as ReturnType<typeof schedule> | undefined;
    let total = 0;
    for (let i = 0; i < 100; i++) {
      const now = NOW + i * 60_000;
      const r = computeXp({ difficulty: 1, correct: true, guessed: false, hintsUsed: 0, prior, sessionId: `s${i}`, now });
      total += r.xp;
      prior = { ...schedule(prior, 'Q', 'correct', now, `s${i}`), lastXpAt: r.xp > 0 ? now : prior?.lastXpAt ?? null };
    }
    expect(total).toBe(BASE_XP[1]);
  });

  it('bônus de sessão', () => {
    expect(sessionBonus(2, 0)).toEqual({ xp: 0, perfect: false });
    expect(sessionBonus(3, 1)).toEqual({ xp: 20, perfect: false });
    expect(sessionBonus(5, 0)).toEqual({ xp: 40, perfect: true });
  });
});

describe('Descanso do Viajante', () => {
  it('não acumula com menos de 2 dias de ausência', () => {
    expect(restedFromAbsence(NOW - DAY_MS * 1.5, NOW)).toBe(0);
    expect(restedFromAbsence(null, NOW)).toBe(0);
  });
  it('acumula 150 por dia após o primeiro, até o teto', () => {
    expect(restedFromAbsence(NOW - 2 * DAY_MS, NOW)).toBe(150);
    expect(restedFromAbsence(NOW - 4 * DAY_MS, NOW)).toBe(450);
    expect(restedFromAbsence(NOW - 30 * DAY_MS, NOW)).toBe(RESTED_CAP);
    expect(accrueRested(500, NOW - 4 * DAY_MS, NOW)).toEqual({ pool: RESTED_CAP, gained: 100 });
  });
  it('o bônus nunca excede o XP ganho nem o saldo', () => {
    expect(applyRested(16, 600)).toEqual({ bonus: 16, pool: 584 });
    expect(applyRested(16, 5)).toEqual({ bonus: 5, pool: 0 });
    expect(applyRested(0, 100)).toEqual({ bonus: 0, pool: 100 });
  });
});

describe('repetição espaçada', () => {
  it('erro vira Eco devido em ~1 dia', () => {
    const s = schedule(undefined, 'Q', 'wrong', NOW, 's');
    expect(s).toMatchObject({ box: 1, echo: true, wrong: 1, seen: 1 });
    expect(s.dueAt).toBe(NOW + DAY_MS - 4 * HOUR_MS);
  });
  it('acerto de primeira vai para a caixa 2 (3 dias)', () => {
    const s = schedule(undefined, 'Q', 'correct', NOW, 's');
    expect(s).toMatchObject({ box: 2, echo: false, correct: 1 });
  });
  it('revisões devidas sobem de caixa até 5', () => {
    let s = schedule(undefined, 'Q', 'wrong', NOW, 's');
    let t = NOW;
    const boxes: number[] = [];
    for (let i = 0; i < 6; i++) {
      t = (s.dueAt ?? t) + 1;
      s = schedule(s, 'Q', 'correct', t, `s${i}`);
      boxes.push(s.box);
    }
    expect(boxes).toEqual([2, 3, 4, 5, 5, 5]);
    expect(s.echo).toBe(false);
  });
  it('acerto fora do prazo não altera a agenda', () => {
    const s1 = schedule(undefined, 'Q', 'correct', NOW, 's');
    const s2 = schedule(s1, 'Q', 'correct', NOW + HOUR_MS, 's2');
    expect(s2.box).toBe(s1.box);
    expect(s2.dueAt).toBe(s1.dueAt);
    expect(s2.correct).toBe(2);
  });
  it('chute não conta como domínio e agenda confirmação', () => {
    const s = schedule(emptyQuestionState('Q'), 'Q', 'guess', NOW, 's');
    expect(s).toMatchObject({ box: 1, correct: 0, guessedCorrect: 1 });
  });
});
