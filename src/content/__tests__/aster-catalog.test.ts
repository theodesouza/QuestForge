/* eslint-disable import/first, @typescript-eslint/no-require-imports */
/**
 * O catálogo do Áster: tamanho (o remake triplicou a coleção), variedade por espaço e raridade,
 * e a ligação entre cada ficha e o seu desenho — nenhuma peça fica sem renderizador, nenhum
 * desenho fica órfão, e duas peças nunca dividem o mesmo desenho.
 */
jest.mock('react-native-worklets', () => require('react-native-worklets/lib/module/mock'));
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

import { BODIES } from '../../ui/vfx/bodies2';
import { FIELDS } from '../../ui/vfx/fields';
import { IGNITIONS } from '../../ui/vfx/ignitions';
import { LENSES } from '../../ui/vfx/lenses';
import { ORBITERS } from '../../ui/vfx/orbiters';
import { ORBITAL_RINGS } from '../../ui/vfx/rings2';
import { SKIES } from '../../ui/vfx/skies';
import { TRAILS } from '../../ui/vfx/trails';
import { ASTER_ITEMS, FEAT_TEXT } from '../aster';
import { ITEMS, OPTIONAL_SLOTS, RARITY_TIER, SLOT_HINT, SLOT_LABEL, SLOT_ORDER, type ItemSlot, type Rarity } from '../items';
import legacy from './fixtures/catalog-v1.json';

const REGISTRY: Partial<Record<ItemSlot, Record<string, unknown>>> = {
  core: BODIES,
  frame: ORBITAL_RINGS,
  aura: FIELDS,
  scene: SKIES,
  orbiter: ORBITERS,
  trail: TRAILS,
  lens: LENSES,
  ignition: IGNITIONS,
};

const RARITY_ORDER = Object.keys(RARITY_TIER) as Rarity[];
const newIn = (slot: ItemSlot) => ASTER_ITEMS.filter((i) => i.slot === slot);

describe('tamanho do catálogo', () => {
  it('a coleção triplicou: pelo menos 3× as 116 peças de antes do remake', () => {
    expect(legacy.items).toHaveLength(116);
    expect(ITEMS.length).toBeGreaterThanOrEqual(legacy.items.length * 3);
  });

  it('todo espaço tem peças, rótulo e explicação', () => {
    for (const slot of SLOT_ORDER) {
      expect(ITEMS.some((i) => i.slot === slot)).toBe(true);
      expect(SLOT_LABEL[slot].length).toBeGreaterThan(0);
      expect(SLOT_HINT[slot].length).toBeGreaterThan(0);
    }
    expect(new Set(ITEMS.map((i) => i.slot))).toEqual(new Set(SLOT_ORDER));
  });

  it('os espaços que nasceram com o Áster são opcionais e têm pelo menos uma dúzia de peças', () => {
    for (const slot of ['orbiter', 'trail', 'lens', 'ignition'] as const) {
      expect(OPTIONAL_SLOTS).toContain(slot);
      expect(newIn(slot).length).toBeGreaterThanOrEqual(12);
    }
  });

  it('cada espaço novo vai do comum ao lendário, com mais peças simples do que raras', () => {
    for (const slot of SLOT_ORDER) {
      const items = newIn(slot);
      const count = (r: string) => items.filter((i) => i.rarity === r).length;
      for (const r of RARITY_ORDER) expect({ slot, rarity: r, n: count(r) > 0 }).toEqual({ slot, rarity: r, n: true });
      expect(count('comum') + count('incomum')).toBeGreaterThan(count('epico') + count('lendario'));
      expect(count('lendario')).toBeLessThanOrEqual(count('comum'));
    }
  });
});

describe('ficha ↔ desenho', () => {
  it('toda peça nova (menos os títulos) aponta para um desenho que existe', () => {
    for (const item of ASTER_ITEMS) {
      if (item.slot === 'title') continue;
      expect({ id: item.id, drawn: Object.prototype.hasOwnProperty.call(REGISTRY[item.slot], item.visual.fx ?? '') }).toEqual({ id: item.id, drawn: true });
    }
  });

  it('nenhum desenho novo fica órfão e nenhum é usado por duas peças', () => {
    for (const [slot, registry] of Object.entries(REGISTRY) as [ItemSlot, Record<string, unknown>][]) {
      const used = newIn(slot).map((i) => i.visual.fx as string);
      expect(new Set(used).size).toBe(used.length);
      expect([...used].sort()).toEqual(Object.keys(registry).sort());
    }
  });

  it('nomes e descrições são únicos: nada de peça repetida com outra cor', () => {
    const names = ITEMS.map((i) => `${i.slot}/${i.name}`);
    expect(new Set(names).size).toBe(names.length);
    const descriptions = ASTER_ITEMS.map((i) => i.description);
    expect(new Set(descriptions).size).toBe(descriptions.length);
    for (const d of descriptions) expect(d.length).toBeGreaterThan(20);
  });

  it('núcleos e campos novos têm elemento (a Ressonância vale para eles também)', () => {
    for (const item of [...newIn('core'), ...newIn('aura')]) expect({ id: item.id, element: typeof item.visual.element }).toEqual({ id: item.id, element: 'string' });
  });
});

describe('origem das peças novas', () => {
  it('toda peça nova tem uma origem, e o "como conseguir" sai dela', () => {
    for (const item of ASTER_ITEMS) {
      if (item.get.by === 'shop') expect(item.price).toBe(item.get.price);
      else expect(item.price).toBeUndefined();
      expect(item.howToGet.length).toBeGreaterThan(5);
    }
  });

  it('só comuns e incomuns vão para a Oficina; épicos e lendários nunca vêm de graça por nível baixo', () => {
    for (const item of ASTER_ITEMS) {
      if (item.get.by === 'shop') expect(['comum', 'incomum']).toContain(item.rarity);
      if (item.get.by === 'level' && item.rarity === 'epico') expect(item.get.level).toBeGreaterThanOrEqual(30);
      if (item.get.by === 'level' && item.rarity === 'lendario') expect(item.get.level).toBeGreaterThanOrEqual(45);
    }
  });

  it('todo feito descrito dá pelo menos uma peça (nenhum texto de feito sobra)', () => {
    const used = new Set(ASTER_ITEMS.flatMap((i) => (i.get.by === 'feat' ? [i.get.feat] : [])));
    expect(Object.keys(FEAT_TEXT).filter((id) => !used.has(id as keyof typeof FEAT_TEXT))).toEqual([]);
  });

  it('os três caminhos existem em todo espaço novo: comprar, subir de nível e cumprir feitos', () => {
    for (const slot of SLOT_ORDER) {
      const by = new Set(newIn(slot).map((i) => i.get.by));
      expect({ slot, by: [...by].sort() }).toEqual({ slot, by: ['feat', 'level', 'shop'] });
    }
  });
});
