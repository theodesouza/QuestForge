/**
 * Entrega do catálogo do Áster: quem já joga recebe, ao abrir o app, as peças novas dos níveis que
 * já alcançou e dos feitos que já cumpriu — numa remessa, sem trocar o que veste e sem perder nada.
 */
import { LESSONS, STAGE_REFS } from '../../content/academy/catalog';
import { ASTER_ITEMS, FEAT_TEXT, type FeatId } from '../../content/aster';
import { BOSSES } from '../../content/bosses';
import { ITEMS, getItem } from '../../content/items';
import { REGIONS } from '../../content/regions';
import v1 from '../../content/__tests__/fixtures/catalog-v1.json';
import { emptyStageProgress } from '../academy/progress';
import { FEATS, SWIFT_TURNS } from '../game/feats';
import { buyItem, completeOnboarding, createInitialState, touch } from '../game/game';
import { grantXp } from '../game/grant';
import { normalizeProfile } from '../game/normalize';
import { Tx } from '../game/tx';
import type { GameEvent, GameState } from '../game/types';
import { emptyQuestionState } from '../learning/srs';
import { LEVEL_START_XP, levelForXp } from '../progression/levels';
import { LEVEL_ITEM_TABLE } from '../progression/rewards';

const T0 = Date.UTC(2026, 10, 12, 12);
const DAY = 24 * 60 * 60 * 1000;
const MISSIONS = REGIONS.flatMap((r) => r.nodes.filter((n) => n.kind === 'mission'));

const shipmentOf = (events: GameEvent[]) => events.find((e): e is Extract<GameEvent, { type: 'shipment' }> => e.type === 'shipment');
const itemEvents = (events: GameEvent[]) => events.filter((e) => e.type === 'item');
const asterFeat = (id: FeatId) => FEATS.find((f) => f.id === id);

/** Veterano do app antigo: nível 30, todas as peças de antes, visual escolhido, três chefões vencidos. */
function veteran(level = 30): GameState {
  const g = createInitialState(T0);
  const inventory = Object.fromEntries(v1.items.map((i, n) => [i.id, { itemId: i.id, acquiredAt: T0 - DAY + n, source: i.source }]));
  const ledger: Record<string, number> = { 'news:cosmetics-v2': T0 - DAY, 'news:atlas-r4-r5': T0 - DAY, 'news:atlas-r6-r9': T0 - DAY };
  for (let l = 2; l <= level; l++) ledger[`level:${l}`] = T0 - DAY;
  const profile = normalizeProfile(
    {
      ...g.profile,
      name: 'Theo',
      onboarded: true,
      xp: LEVEL_START_XP[level] + 5,
      ink: 640,
      lastActiveAt: T0 - 60_000,
      totals: { answered: 820, correct: 640, timeMs: 6.5 * 60 * 60 * 1000, sessions: 96 },
      equipped: { frame: 'frame-tres-arcos', core: 'core-trindade', aura: null, scene: 'scene-planicie', title: 'title-soma-inteira' },
    },
    T0,
  );
  const campaign = Object.fromEntries(
    MISSIONS.slice(0, 9).map((n) => [n.id, { nodeId: n.id, completedAt: T0 - DAY, bestCorrect: 8, runs: 2, bestScore: 900, bestStars: 3, lastScore: 900 }]),
  );
  const bosses = Object.fromEntries(
    BOSSES.slice(0, 3).map((b) => [b.id, { bossId: b.id, attempts: 2, wins: 2, failedSinceWin: 0, firstWinAt: T0 - DAY, flawless: false, bestTurns: 12 }]),
  );
  return { ...g, profile, inventory, ledger, campaign, bosses };
}

/** Estado em que todo feito novo está cumprido. */
function maxed(): GameState {
  const g = veteran(50);
  const questionStates = Object.fromEntries(Array.from({ length: 150 }, (_, i) => [`Q-${i}`, { ...emptyQuestionState(`Q-${i}`), seen: 2, correct: 1, wrong: 1, echoBeaten: 1, echoBeatenAt: T0 }]));
  const campaign = Object.fromEntries(MISSIONS.map((n) => [n.id, { nodeId: n.id, completedAt: T0, bestCorrect: 10, runs: 3, bestScore: 1000, bestStars: 3, lastScore: 1000 }]));
  const bosses = Object.fromEntries(BOSSES.map((b) => [b.id, { bossId: b.id, attempts: 6, wins: 6, failedSinceWin: 0, firstWinAt: T0, flawless: true, bestTurns: SWIFT_TURNS }]));
  const academy = Object.fromEntries(STAGE_REFS.map((ref) => [ref, { ...emptyStageProgress(ref), viewedAt: T0, studiedAt: T0, masteredAt: T0, box: 1 }]));
  const inventory = Object.fromEntries(ITEMS.map((i, n) => [i.id, { itemId: i.id, acquiredAt: T0, source: n < 40 ? 'oficina' : 'outro' }]));
  const ledger = { ...g.ledger };
  for (let d = 0; d < 100; d++) ledger[`quest:daily:2026-${d}:bonus`] = T0;
  for (let w = 0; w < 12; w++) ledger[`quest:weekly:2026-W${w}:bonus`] = T0;
  return {
    ...g,
    profile: { ...g.profile, totals: { answered: 5000, correct: 4700, timeMs: 60 * 60 * 60 * 1000, sessions: 200 } },
    questionStates,
    campaign,
    bosses,
    academy,
    inventory,
    ledger,
  };
}

describe('o que precisa existir para os feitos serem alcançáveis', () => {
  it('27 missões, 9 chefões, 20 aulas, 120 etapas e 275 peças', () => {
    expect(MISSIONS).toHaveLength(27);
    expect(BOSSES).toHaveLength(9);
    expect(LESSONS.length).toBeGreaterThanOrEqual(20);
    expect(STAGE_REFS.length).toBeGreaterThanOrEqual(120);
    expect(ITEMS.length).toBeGreaterThanOrEqual(275);
    for (const id of Object.keys(FEAT_TEXT)) if (id.startsWith('region:')) expect(REGIONS.some((r) => `region:${r.id}` === id)).toBe(true);
  });

  it('todo feito do catálogo tem regra, rótulo e peças; no começo nenhum está cumprido, no fim todos estão', () => {
    const fresh = completeOnboarding(createInitialState(T0), { name: 'Lia', goal: 'enem', dailyMinutes: 10, selfLevel: 'intermediario', examYear: null }, T0).state;
    const full = maxed();
    for (const id of Object.keys(FEAT_TEXT) as FeatId[]) {
      const feat = asterFeat(id);
      expect({ id, defined: feat !== undefined }).toEqual({ id, defined: true });
      expect(feat!.label).toBe(FEAT_TEXT[id].label);
      expect(feat!.itemIds.length).toBeGreaterThan(0);
      expect({ id, done: feat!.done(fresh) }).toEqual({ id, done: false });
      expect({ id, done: feat!.done(full) }).toEqual({ id, done: true });
    }
  });

  it('os limiares são exatos: um a menos não cumpre', () => {
    const g = veteran();
    const withTotals = (t: Partial<GameState['profile']['totals']>): GameState => ({ ...g, profile: { ...g.profile, totals: { ...g.profile.totals, ...t } } });
    expect(asterFeat('answers:1500')!.done(withTotals({ answered: 1499 }))).toBe(false);
    expect(asterFeat('answers:1500')!.done(withTotals({ answered: 1500 }))).toBe(true);
    expect(asterFeat('time:12h')!.done(withTotals({ timeMs: 12 * 3_600_000 - 1 }))).toBe(false);
    expect(asterFeat('time:12h')!.done(withTotals({ timeMs: 12 * 3_600_000 }))).toBe(true);
    expect(asterFeat('accuracy:80')!.done(withTotals({ answered: 199, correct: 199 }))).toBe(false);
    expect(asterFeat('accuracy:80')!.done(withTotals({ answered: 200, correct: 160 }))).toBe(true);
    expect(asterFeat('accuracy:90')!.done(withTotals({ answered: 500, correct: 449 }))).toBe(false);
    expect(asterFeat('accuracy:90')!.done(withTotals({ answered: 500, correct: 450 }))).toBe(true);
    expect(asterFeat('bosses:3')!.done(g)).toBe(true);
    expect(asterFeat('bosses:6')!.done(g)).toBe(false);
    expect(asterFeat('swift')!.done(g)).toBe(false);
    expect(asterFeat('region:vale-proporcoes')!.done(g)).toBe(true);
    expect(asterFeat('region:ilhas-medida')!.done(g)).toBe(false);
    expect(asterFeat('starsum:15')!.done(g)).toBe(true);
    expect(asterFeat('starsum:30')!.done(g)).toBe(false);
  });
});

describe('remessa retroativa ao abrir o app', () => {
  const before = veteran();
  const opened = touch(before, T0, before.profile.tzOffsetMin);
  const shipment = shipmentOf(opened.events);

  it('chega uma remessa única, sem uma cerimônia por peça', () => {
    expect(shipment).toBeDefined();
    expect(shipment!.items.length).toBeGreaterThan(20);
    expect(itemEvents(opened.events)).toEqual([]);
    expect(opened.events.filter((e) => e.type === 'shipment')).toHaveLength(1);
  });

  it('traz toda peça nova de nível já alcançado — e nenhuma de nível que ainda não chegou', () => {
    const ids = new Set(shipment!.items.map((i) => i.itemId));
    for (const item of ASTER_ITEMS) {
      if (item.get.by !== 'level') continue;
      expect({ id: item.id, shipped: ids.has(item.id) }).toEqual({ id: item.id, shipped: item.get.level <= 30 });
      if (item.get.level <= 30) expect(opened.state.inventory[item.id]).toMatchObject({ source: `level:${item.get.level}` });
    }
  });

  it('traz as peças dos feitos já cumpridos e marca cada feito como pago', () => {
    for (const id of ['answers:750', 'correct:400', 'time:5h', 'sessions:75', 'missions:9', 'bosses:3', 'region:vale-proporcoes', 'bosswins:5'] as FeatId[]) {
      expect({ id, paid: opened.state.ledger[`feat:${id}`] !== undefined }).toEqual({ id, paid: true });
      for (const itemId of asterFeat(id)!.itemIds) expect(opened.state.inventory[itemId]).toMatchObject({ source: `feat:${id}` });
    }
    expect(opened.state.ledger['feat:answers:1500']).toBeUndefined();
    expect(opened.state.ledger['feat:bosses:6']).toBeUndefined();
  });

  it('feitos de coleção se cumprem com as próprias peças da remessa', () => {
    // 116 peças antigas + a remessa passam de 150: os feitos de coleção pagam na mesma abertura.
    expect(Object.keys(opened.state.inventory).length).toBeGreaterThanOrEqual(150);
    expect(opened.state.ledger['feat:collect:100']).toBeDefined();
    expect(opened.state.ledger['feat:collect:150']).toBeDefined();
    for (const itemId of asterFeat('collect:150')!.itemIds) expect(opened.state.inventory[itemId]).toBeDefined();
  });

  it('nada do que estava equipado muda — nem os espaços que a pessoa deixou vazios', () => {
    expect(opened.state.profile.equipped).toEqual(before.profile.equipped);
    expect(opened.state.profile.equipped).toMatchObject({ frame: 'frame-tres-arcos', core: 'core-trindade', aura: null, scene: 'scene-planicie', title: 'title-soma-inteira', orbiter: null, trail: null, lens: null, ignition: null });
  });

  it('nenhuma peça antiga some, nem muda de origem ou de data', () => {
    for (const old of v1.items) expect(opened.state.inventory[old.id]).toEqual(before.inventory[old.id]);
  });

  it('XP, nível, Tinta, totais, missões e chefões ficam exatamente como estavam', () => {
    expect(opened.state.profile.xp).toBe(before.profile.xp);
    expect(levelForXp(opened.state.profile.xp)).toBe(30);
    expect(opened.state.profile.ink).toBe(before.profile.ink);
    expect(opened.state.profile.totals).toEqual(before.profile.totals);
    expect(opened.state.campaign).toEqual(before.campaign);
    expect(opened.state.bosses).toEqual(before.bosses);
    expect(opened.state.questionStates).toEqual(before.questionStates);
  });

  it('é gravado: as peças e os feitos novos entram no que vai para o banco', () => {
    expect(new Set(opened.delta.inventory)).toEqual(new Set(shipment!.items.map((i) => i.itemId)));
    expect(opened.delta.ledger).toEqual(expect.arrayContaining(['feat:bosses:3', 'feat:collect:150']));
  });

  it('abrir de novo não entrega nada em dobro', () => {
    const again = touch(opened.state, T0 + 60_000, before.profile.tzOffsetMin);
    expect(shipmentOf(again.events)).toBeUndefined();
    expect(itemEvents(again.events)).toEqual([]);
    expect(again.state.inventory).toEqual(opened.state.inventory);
    expect(again.delta.inventory).toEqual([]);
  });

  it('quem acabou de chegar não recebe remessa nenhuma', () => {
    const fresh = completeOnboarding(touch(createInitialState(T0), T0, 180).state, { name: 'Lia', goal: 'enem', dailyMinutes: 10, selfLevel: 'intermediario', examYear: null }, T0).state;
    const r = touch(fresh, T0 + 1000, 180);
    expect(shipmentOf(r.events)).toBeUndefined();
    expect(Object.keys(r.state.inventory).sort()).toEqual(Object.keys(fresh.inventory).sort());
  });

  it('o nível máximo recebe todas as peças de nível do catálogo', () => {
    const top = touch(veteran(50), T0, 180).state;
    for (const ids of Object.values(LEVEL_ITEM_TABLE)) for (const id of ids) expect({ id, owned: top.inventory[id] !== undefined }).toEqual({ id, owned: true });
  });
});

describe('daqui para a frente', () => {
  it('subir de nível entrega as peças novas daquele nível, com cerimônia', () => {
    const g = touch(veteran(2), T0, 180).state;
    const tx = new Tx(g);
    grantXp(tx, LEVEL_START_XP[3] - g.profile.xp, 'session', T0 + 5000, false);
    const r = tx.done();
    expect(levelForXp(r.state.profile.xp)).toBe(3);
    const up = r.events.find((e): e is Extract<GameEvent, { type: 'levelUp' }> => e.type === 'levelUp');
    const rewarded = up!.rewards.flatMap((x) => x.rewards.flatMap((y) => (y.kind === 'item' ? [y.itemId] : [])));
    expect(rewarded).toEqual(expect.arrayContaining(LEVEL_ITEM_TABLE[3]));
    expect(LEVEL_ITEM_TABLE[3].some((id) => getItem(id).slot === 'orbiter')).toBe(true);
    for (const id of LEVEL_ITEM_TABLE[3]) expect(r.state.inventory[id]).toMatchObject({ source: 'level:3' });
  });

  it('um espaço novo e vazio veste a primeira peça ganha jogando (a remessa, não)', () => {
    const g = touch(veteran(2), T0, 180).state;
    expect(g.profile.equipped.orbiter).toBeNull();
    const tx = new Tx(g);
    grantXp(tx, LEVEL_START_XP[3] - g.profile.xp, 'session', T0 + 5000, false);
    const orbiter = LEVEL_ITEM_TABLE[3].find((id) => getItem(id).slot === 'orbiter');
    expect(tx.done().state.profile.equipped.orbiter).toBe(orbiter);
  });

  it('forjar na Oficina conta para os feitos de forja e paga na hora', () => {
    let g: GameState = { ...veteran(), inventory: {}, ledger: {} };
    g = { ...g, inventory: { 'frame-cobre': { itemId: 'frame-cobre', acquiredAt: T0, source: 'inicial' }, 'core-quartzo': { itemId: 'core-quartzo', acquiredAt: T0, source: 'inicial' } }, profile: { ...g.profile, ink: 5000, xp: 0, totals: { answered: 0, correct: 0, timeMs: 0, sessions: 0 } }, campaign: {}, bosses: {} };
    const forSale = ITEMS.filter((i) => i.price !== undefined).slice(0, 5);
    let last: GameEvent[] = [];
    for (const item of forSale) {
      const r = buyItem(g, item.id, T0 + 1);
      g = r.state;
      last = r.events;
    }
    expect(g.ledger['feat:shop:5']).toBeDefined();
    const reward = asterFeat('shop:5')!.itemIds[0];
    expect(g.inventory[reward]).toMatchObject({ source: 'feat:shop:5' });
    expect(last.some((e) => e.type === 'item' && e.itemId === reward)).toBe(true);
  });
});
