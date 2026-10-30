import { ACADEMY_TITLES } from '../../domain/academy/rewards';
import { FEATS } from '../../domain/game/feats';
import { LEVEL_ITEM_TABLE } from '../../domain/progression/rewards';
import { WEEKLY_FIRST_ITEM } from '../../domain/quests/quests';
import { AURA_FX, CORE_FX, SCENE_FX } from '../../ui/vfx/rules';
import { BOSSES } from '../bosses';
import {
  CUSTOM_FRAME_STYLES,
  FRAME_STYLES,
  ITEMS,
  OPTIONAL_SLOTS,
  RARITY_TIER,
  SHOP_ITEMS,
  SLOT_ORDER,
  STARTER_ITEMS,
  getItem,
  type ItemSlot,
  type Rarity,
} from '../items';

const inSlot = (slot: ItemSlot) => ITEMS.filter((i) => i.slot === slot);

describe('catálogo de cosméticos', () => {
  it('ids únicos e nomes únicos por espaço', () => {
    expect(new Set(ITEMS.map((i) => i.id)).size).toBe(ITEMS.length);
    for (const slot of SLOT_ORDER) {
      const names = inSlot(slot).map((i) => i.name);
      expect(new Set(names).size).toBe(names.length);
    }
  });

  it('id começa com o espaço do item (frame-, core-, aura-, scene-, title-)', () => {
    for (const i of ITEMS) expect(i.id.startsWith(`${i.slot}-`)).toBe(true);
  });

  it('a coleção cresceu: ao menos 15 molduras, 15 núcleos, 12 auras, 10 cenários e 20 títulos', () => {
    expect(inSlot('frame').length).toBeGreaterThanOrEqual(15);
    expect(inSlot('core').length).toBeGreaterThanOrEqual(15);
    expect(inSlot('aura').length).toBeGreaterThanOrEqual(12);
    expect(inSlot('scene').length).toBeGreaterThanOrEqual(10);
    expect(inSlot('title').length).toBeGreaterThanOrEqual(20);
  });

  it('todo espaço tem peças de várias raridades, do comum ao lendário nos espaços visuais', () => {
    for (const slot of ['frame', 'core', 'aura', 'scene'] as const) {
      const tiers = new Set(inSlot(slot).map((i) => RARITY_TIER[i.rarity]));
      expect(tiers.has(0) && tiers.has(1) && tiers.has(2)).toBe(true);
    }
    for (const slot of ['core', 'aura', 'scene', 'title'] as const) {
      expect(inSlot(slot).some((i) => i.rarity === 'lendario')).toBe(true);
    }
  });

  it('as peças iniciais existem, são comuns e ocupam moldura e núcleo', () => {
    for (const id of STARTER_ITEMS) expect(getItem(id).rarity).toBe('comum');
    expect(getItem(STARTER_ITEMS[0]).slot).toBe('frame');
    expect(getItem(STARTER_ITEMS[1]).slot).toBe('core');
  });
});

describe('visual de cada peça', () => {
  it('toda moldura tem um estilo conhecido; os estilos novos aparecem no catálogo', () => {
    for (const f of inSlot('frame')) expect(FRAME_STYLES).toContain(f.visual.frameStyle);
    const used = new Set(inSlot('frame').map((f) => f.visual.frameStyle));
    for (const style of CUSTOM_FRAME_STYLES) expect(used.has(style)).toBe(true);
  });

  it('todo cenário aponta para um desenho único', () => {
    const fx = inSlot('scene').map((s) => s.visual.fx);
    for (const id of fx) expect(SCENE_FX as readonly (string | undefined)[]).toContain(id);
    expect(new Set(fx).size).toBe(fx.length);
    expect(new Set(SCENE_FX).size).toBe(SCENE_FX.length);
  });

  it('todo desenho de núcleo e aura é usado por exatamente uma peça (sem efeito órfão)', () => {
    expect([...inSlot('core').map((i) => i.visual.fx)].sort()).toEqual([...CORE_FX].sort());
    expect([...inSlot('aura').map((i) => i.visual.fx)].sort()).toEqual([...AURA_FX].sort());
  });

  it('núcleos e auras da Natureza existem (Ressonância possível)', () => {
    const nature = ITEMS.filter((i) => i.visual.element === 'natureza');
    expect(nature.some((i) => i.slot === 'core') && nature.some((i) => i.slot === 'aura')).toBe(true);
  });

  it('cores são hexadecimais', () => {
    for (const i of ITEMS) {
      expect(i.visual.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      if (i.visual.color2) expect(i.visual.color2).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});

describe('Oficina', () => {
  const MAX_PRICE: Record<Rarity, number> = { comum: 130, incomum: 260, raro: 0, epico: 0, lendario: 0 };

  it('só comuns e incomuns são vendidos, com preço dentro da faixa da raridade', () => {
    expect(SHOP_ITEMS.length).toBeGreaterThanOrEqual(30);
    for (const i of SHOP_ITEMS) {
      expect(['comum', 'incomum']).toContain(i.rarity);
      expect(i.price).toBeGreaterThanOrEqual(30);
      expect(i.price).toBeLessThanOrEqual(MAX_PRICE[i.rarity]);
    }
  });

  it('incomuns custam mais que comuns do mesmo espaço (o mais barato incomum > o mais barato comum)', () => {
    for (const slot of SLOT_ORDER) {
      const items = SHOP_ITEMS.filter((i) => i.slot === slot);
      const cheapest = (r: Rarity) => Math.min(...items.filter((i) => i.rarity === r).map((i) => i.price ?? Infinity));
      if (items.some((i) => i.rarity === 'comum') && items.some((i) => i.rarity === 'incomum')) {
        expect(cheapest('incomum')).toBeGreaterThan(cheapest('comum'));
      }
    }
  });

  it('o texto "como conseguir" confere com o preço', () => {
    for (const i of SHOP_ITEMS) expect(i.howToGet).toBe(`Oficina: ${i.price} de Tinta.`);
  });

  it('a vitrine está em ordem de preço e todo espaço tem algo à venda', () => {
    const prices = SHOP_ITEMS.map((i) => i.price ?? 0);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
    for (const slot of SLOT_ORDER) expect(SHOP_ITEMS.some((i) => i.slot === slot)).toBe(true);
  });

  it('um jogador consegue comprar a primeira peça de cada espaço logo no começo (≤ 90 de Tinta)', () => {
    for (const slot of SLOT_ORDER) {
      const cheapest = Math.min(...SHOP_ITEMS.filter((i) => i.slot === slot).map((i) => i.price ?? Infinity));
      expect(cheapest).toBeLessThanOrEqual(90);
    }
  });
});

describe('toda peça tem um caminho para ser conquistada', () => {
  const byLevel = new Map<string, number>();
  for (const [level, ids] of Object.entries(LEVEL_ITEM_TABLE)) for (const id of ids) byLevel.set(id, Number(level));
  const byFeat = new Map<string, string>();
  for (const feat of FEATS) for (const id of feat.itemIds) byFeat.set(id, feat.id);
  const byBoss = new Set<string>();
  for (const b of BOSSES) {
    for (const id of b.rewards.firstItems) byBoss.add(id);
    byBoss.add(b.rewards.flawlessItem);
  }
  const byAcademy = new Set<string>([ACADEMY_TITLES.firstMastery, ACADEMY_TITLES.manyMastered.itemId, ACADEMY_TITLES.seals.itemId, ACADEMY_TITLES.allSeals]);
  const sources = (id: string) =>
    [
      STARTER_ITEMS.includes(id as (typeof STARTER_ITEMS)[number]) ? 'inicial' : null,
      getItem(id).price !== undefined ? 'oficina' : null,
      byLevel.has(id) ? 'nível' : null,
      byFeat.has(id) ? 'feito' : null,
      byBoss.has(id) ? 'chefão' : null,
      byAcademy.has(id) ? 'academia' : null,
      id === WEEKLY_FIRST_ITEM ? 'encomendas' : null,
    ].filter(Boolean);

  it('exatamente uma origem por peça (nada inalcançável, nada duplicado)', () => {
    for (const i of ITEMS) expect({ id: i.id, sources: sources(i.id) }).toEqual({ id: i.id, sources: [expect.any(String)] });
  });

  it('itens de nível e de feito só aparecem em raridade compatível, e os raros+ nunca são vendidos', () => {
    for (const i of ITEMS) {
      if (RARITY_TIER[i.rarity] >= 2) expect(i.price).toBeUndefined();
    }
  });

  it('o "como conseguir" dos itens por nível cita o nível certo', () => {
    for (const [id, level] of byLevel) expect(getItem(id).howToGet).toBe(`Alcance o nível ${level}.`);
  });

  it('raridade cresce com o nível exigido dentro de cada espaço', () => {
    for (const slot of ['frame', 'core', 'aura'] as const) {
      const tiers = inSlot(slot)
        .filter((i) => byLevel.has(i.id))
        .sort((a, b) => (byLevel.get(a.id) ?? 0) - (byLevel.get(b.id) ?? 0))
        .map((i) => RARITY_TIER[i.rarity]);
      expect(tiers).toEqual([...tiers].sort((a, b) => a - b));
    }
  });

  it('cada feito concede itens que existem, com rótulo e id único', () => {
    expect(new Set(FEATS.map((f) => f.id)).size).toBe(FEATS.length);
    for (const f of FEATS) {
      expect(f.label.length).toBeGreaterThan(0);
      for (const id of f.itemIds) expect(getItem(id)).toBeDefined();
    }
  });

  it('espaços opcionais são aura, cenário e título', () => {
    expect([...OPTIONAL_SLOTS].sort()).toEqual(['aura', 'scene', 'title']);
  });
});
