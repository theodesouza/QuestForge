import { ITEMS, RARITY_TIER, getItem } from '../../../content/items';
import { createInitialState } from '../../../domain/game/game';
import { normalizeProfile } from '../../../domain/game/normalize';
import { AURA_FX, CORE_FX, resolveSynergy } from '../rules';

describe('catálogo de efeitos', () => {
  it('todo núcleo e toda aura têm efeito próprio e elemento', () => {
    for (const item of ITEMS.filter((i) => i.slot === 'core' || i.slot === 'aura')) {
      expect(item.visual.element).toBeDefined();
      const registry: readonly string[] = item.slot === 'core' ? CORE_FX : AURA_FX;
      expect(registry).toContain(item.visual.fx);
    }
  });

  it('núcleos e auras não reaproveitam o mesmo efeito (identidades distintas)', () => {
    for (const slot of ['core', 'aura'] as const) {
      const fx = ITEMS.filter((i) => i.slot === slot).map((i) => i.visual.fx);
      expect(new Set(fx).size).toBe(fx.length);
    }
  });

  it('a hierarquia tem todas as raridades entre núcleos e auras, do comum ao lendário', () => {
    const tiers = new Set(ITEMS.filter((i) => i.slot === 'core' || i.slot === 'aura').map((i) => RARITY_TIER[i.rarity]));
    expect([...tiers].sort()).toEqual([0, 1, 2, 3, 4]);
  });
});

describe('sinergias', () => {
  it('sem aura, sem sinergia', () => {
    expect(resolveSynergy({ core: 'core-solar', aura: null })).toBeNull();
  });
  it('mesmo elemento ⇒ Ressonância, mais forte com raridade maior', () => {
    const low = resolveSynergy({ core: 'core-ambar', aura: 'aura-brasa' });
    const high = resolveSynergy({ core: 'core-solar', aura: 'aura-brasa' });
    expect(low).toMatchObject({ kind: 'resonance', element: 'fogo' });
    expect(high!.strength).toBeGreaterThan(low!.strength);
    expect(resolveSynergy({ core: 'core-pulsar', aura: 'aura-aurora' })).toMatchObject({ kind: 'resonance', element: 'tempestade' });
  });
  it('elementos diferentes ⇒ nada', () => {
    expect(resolveSynergy({ core: 'core-ambar', aura: 'aura-mare' })).toBeNull();
  });
  it('Quartzo refrata qualquer aura', () => {
    const s = resolveSynergy({ core: 'core-quartzo', aura: 'aura-mare' });
    expect(s).toMatchObject({ kind: 'refraction', color: getItem('aura-mare').visual.color });
  });
  it('lendário + lendário ⇒ Forma Mítica, acima de tudo', () => {
    expect(resolveSynergy({ core: 'core-tesouro', aura: 'aura-zenite' })).toMatchObject({ kind: 'mythic', strength: 1 });
    expect(resolveSynergy({ core: 'core-tesouro', aura: 'aura-aurea' })).toMatchObject({ kind: 'mythic' });
  });
});

describe('ajuste de intensidade dos efeitos', () => {
  it('começa em Alta e saves antigos (sem o campo) também', () => {
    expect(createInitialState(0).profile.settings.effects).toBe('alto');
    const old = { ...createInitialState(0).profile, settings: { haptics: true, reduceMotion: 'system' } };
    expect(normalizeProfile(old, 0).settings).toEqual({ haptics: true, reduceMotion: 'system', effects: 'alto' });
  });
});
