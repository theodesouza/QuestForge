import { BOSSES } from '../../content/bosses';
import { getItem } from '../../content/items';
import { answerCurrent, buyItem, completeOnboarding, createInitialState, equipItem, finishSession, startSession, touch, unequipSlot } from '../game/game';
import { getQuestion } from '../../content/bank';
import { FEATS, featSourceLabel, grantFeats } from '../game/feats';
import { Tx } from '../game/tx';
import type { GameEvent, GameState } from '../game/types';
import { normalizeProfile } from '../game/normalize';
import { emptyQuestionState, type QuestionState } from '../learning/srs';

const T0 = Date.UTC(2026, 9, 29, 15);

function onboarded(): GameState {
  return completeOnboarding(
    touch(createInitialState(T0), T0, 180).state,
    { name: 'Lia', goal: 'enem', dailyMinutes: 10, selfLevel: 'intermediario', examYear: null },
    T0,
  ).state;
}

/** Roda uma sessão curta e a encerra, devolvendo o estado e os itens concedidos no fim. */
function playOne(state: GameState): { state: GameState; items: string[] } {
  let s = startSession(state, { id: `s${Object.keys(state.ledger).length}`, mode: 'expedition', nodeId: null, minutes: null, questionIds: ['BAS-001'] }, T0).state;
  s = answerCurrent(s, { attemptId: `a${Math.random()}`, chosen: getQuestion('BAS-001').answer, guessed: false, hints: 0, timeMs: 10_000 }, T0).state;
  const fin = finishSession(s, T0 + 1000);
  const items = fin.events.filter((e): e is Extract<GameEvent, { type: 'item' }> => e.type === 'item').map((e) => e.itemId);
  return { state: fin.state, items };
}

const beaten = (n: number): Record<string, QuestionState> =>
  Object.fromEntries(Array.from({ length: n }, (_, i) => [`Q-${i}`, { ...emptyQuestionState(`Q-${i}`), seen: 2, correct: 1, wrong: 1, echoBeaten: 1, echoBeatenAt: T0 }]));

const wonBoss = (id: string, flawless = false) => ({
  bossId: id,
  attempts: 1,
  wins: 1,
  failedSinceWin: 0,
  firstWinAt: T0,
  flawless,
  bestTurns: 6,
});

describe('feitos', () => {
  it('10 Ecos superados rendem o título ao fim da sessão — uma única vez', () => {
    const base = { ...onboarded() };
    const { state, items } = playOne({ ...base, questionStates: beaten(9) });
    expect(items).not.toContain('title-cacador-ecos');
    const r1 = playOne({ ...state, questionStates: { ...state.questionStates, ...beaten(10) } });
    expect(r1.items).toContain('title-cacador-ecos');
    expect(r1.state.inventory['title-cacador-ecos']).toMatchObject({ source: 'feat:echoes:10' });
    expect(r1.state.ledger['feat:echoes:10']).toBeDefined();
    const r2 = playOne(r1.state);
    expect(r2.items).not.toContain('title-cacador-ecos');
  });

  it('o título de feito se equipa sozinho só quando o espaço está vazio', () => {
    const base = onboarded();
    const r = playOne({ ...base, questionStates: beaten(10) });
    expect(r.state.profile.equipped.title).toBe('title-cacador-ecos');
    // Quem já escolheu outro título não é atropelado pelo próximo feito.
    const chosen = { ...r.state, profile: { ...r.state.profile, equipped: { ...r.state.profile.equipped, title: 'title-tracador' } }, inventory: { ...r.state.inventory, 'title-tracador': { itemId: 'title-tracador', acquiredAt: T0, source: 'level:3' } } };
    const r2 = playOne({ ...chosen, questionStates: { ...chosen.questionStates, ...beaten(40) } });
    expect(r2.items).toContain('title-senhor-ecos');
    expect(r2.state.profile.equipped.title).toBe('title-tracador');
  });

  it('vencer um chefão rende o Cenário da região — inclusive para quem venceu antes do feito existir', () => {
    const base = onboarded();
    const golem = BOSSES.find((b) => b.id === 'golem-proporcional')!;
    const r = playOne({ ...base, bosses: { [golem.id]: wonBoss(golem.id) } });
    expect(r.items).toEqual(['scene-pedreira']);
    expect(r.state.profile.equipped.scene).toBe('scene-pedreira');
  });

  it('cada chefão com o seu cenário', () => {
    const scenes = FEATS.filter((f) => f.id.startsWith('scene:')).flatMap((f) => f.itemIds);
    expect(scenes.sort()).toEqual(['scene-cavernas', 'scene-cordilheira', 'scene-labirinto', 'scene-mercado', 'scene-mirante', 'scene-pedreira', 'scene-planicie', 'scene-torres']);
    for (const b of BOSSES) expect(FEATS.some((f) => f.id === `scene:${b.id}`)).toBe(true);
  });

  it('feito lendário: só com todos os chefões sem erro e sem dica', () => {
    const base = onboarded();
    const some = Object.fromEntries(BOSSES.map((b, i) => [b.id, wonBoss(b.id, i > 0)]));
    expect(playOne({ ...base, bosses: some }).items).not.toContain('scene-cosmos');
    const all = Object.fromEntries(BOSSES.map((b) => [b.id, wonBoss(b.id, true)]));
    const r = playOne({ ...base, bosses: all });
    expect(r.items).toEqual(expect.arrayContaining(['scene-cosmos', 'title-lenda']));
    expect(getItem('scene-cosmos').rarity).toBe('lendario');
  });

  it('3 estrelas em 6 missões e 1000 respostas rendem seus títulos', () => {
    const base = onboarded();
    const stars = Object.fromEntries(Array.from({ length: 6 }, (_, i) => [`m${i}`, { nodeId: `m${i}`, completedAt: T0, bestCorrect: 5, runs: 1, bestScore: 900, bestStars: 3, lastScore: 900 }]));
    const r = playOne({ ...base, campaign: stars, profile: { ...base.profile, totals: { ...base.profile.totals, answered: 1000 } } });
    expect(r.items).toEqual(expect.arrayContaining(['title-estrelado', 'title-mil-passos']));
  });

  it('grantFeats é idempotente dentro da mesma transação', () => {
    const tx = new Tx({ ...onboarded(), questionStates: beaten(10) });
    grantFeats(tx, T0);
    const first = tx.events.length;
    grantFeats(tx, T0);
    expect(tx.events).toHaveLength(first);
  });

  it('rótulos de origem para a revelação', () => {
    expect(featSourceLabel('feat:echoes:10')).toBe('Feito: 10 Ecos superados');
    expect(featSourceLabel('feat:scene:golem-proporcional')).toContain('Golem');
    expect(featSourceLabel('level:5')).toBeNull();
    expect(featSourceLabel('feat:inexistente')).toBeNull();
  });
});

describe('Cenário (novo espaço de equipamento)', () => {
  it('começa vazio, equipa, troca e remove — sem tocar no resto do equipamento', () => {
    let s = onboarded();
    expect(s.profile.equipped.scene).toBeNull();
    s = { ...s, inventory: { ...s.inventory, 'scene-noite': { itemId: 'scene-noite', acquiredAt: T0, source: 'oficina' } } };
    const before = s.profile.equipped;
    s = equipItem(s, 'scene-noite').state;
    expect(s.profile.equipped).toEqual({ ...before, scene: 'scene-noite' });
    s = unequipSlot(s, 'scene').state;
    expect(s.profile.equipped).toEqual(before);
  });

  it('não dá para equipar um cenário que não se tem', () => {
    expect(() => equipItem(onboarded(), 'scene-noite')).toThrow('Item não possuído');
  });

  it('comprar um cenário gasta a Tinta e já o coloca atrás do herói', () => {
    const base = onboarded();
    const price = getItem('scene-colinas').price!;
    const s = buyItem({ ...base, profile: { ...base.profile, ink: price + 5 } }, 'scene-colinas', T0).state;
    expect(s.profile.ink).toBe(5);
    expect(s.profile.equipped.scene).toBe('scene-colinas');
    expect(s.inventory['scene-colinas']).toBeDefined();
    expect(() => buyItem(s, 'scene-colinas', T0)).toThrow('Você já tem este item');
  });

  it('não vende o que é de feito (cenário de chefão) nem o que falta Tinta', () => {
    const base = { ...onboarded() };
    expect(() => buyItem({ ...base, profile: { ...base.profile, ink: 9999 } }, 'scene-pedreira', T0)).toThrow('não está à venda');
    expect(() => buyItem({ ...base, profile: { ...base.profile, ink: 0 } }, 'scene-noite', T0)).toThrow('Tinta insuficiente');
  });

  it('perfis salvos antes do Cenário ganham o espaço vazio sem perder o resto', () => {
    const old = { ...createInitialState(T0).profile, equipped: { frame: 'frame-bronze', core: 'core-ambar', aura: 'aura-brasa', title: null } };
    expect(normalizeProfile(old, T0).equipped).toEqual({ frame: 'frame-bronze', core: 'core-ambar', aura: 'aura-brasa', scene: null, title: null });
  });
});

describe('avisos de novidade', () => {
  const newsOf = (events: GameEvent[]) => events.filter((e): e is Extract<GameEvent, { type: 'news' }> => e.type === 'news');

  it('quem acabou de fazer a apresentação não recebe aviso do que sempre existiu', () => {
    const s = onboarded();
    expect(newsOf(touch(s, T0 + 1000, 180).events)).toEqual([]);
    expect(Object.keys(s.ledger).some((k) => k.startsWith('news:'))).toBe(true);
  });

  it('quem já jogava antes (sem a chave no registro) é avisado uma única vez', () => {
    const s = onboarded();
    const ledger = Object.fromEntries(Object.entries(s.ledger).filter(([k]) => !k.startsWith('news:')));
    const old = { ...s, ledger };
    const first = touch(old, T0 + 1000, 180);
    expect(newsOf(first.events)).toEqual([
      expect.objectContaining({ id: 'cosmetics-v2', title: 'Novidades na personalização' }),
      expect.objectContaining({ id: 'atlas-r4-r5', title: 'Duas novas regiões no Atlas' }),
    ]);
    expect(first.delta.ledger).toEqual(expect.arrayContaining(['news:cosmetics-v2', 'news:atlas-r4-r5']));
    expect(newsOf(touch(first.state, T0 + 2000, 180).events)).toEqual([]);
  });

  it('quem já viu o aviso anterior recebe só o das novas regiões', () => {
    const s = onboarded();
    const ledger = Object.fromEntries(Object.entries(s.ledger).filter(([k]) => k !== 'news:atlas-r4-r5'));
    const { events } = touch({ ...s, ledger }, T0 + 1000, 180);
    expect(newsOf(events).map((n) => n.id)).toEqual(['atlas-r4-r5']);
  });

  it('antes da apresentação não há aviso', () => {
    expect(newsOf(touch(createInitialState(T0), T0, 180).events)).toEqual([]);
  });
});
