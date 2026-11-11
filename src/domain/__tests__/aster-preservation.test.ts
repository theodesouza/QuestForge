/**
 * Remake do Áster: prova de que a progressão anterior continua inteira.
 * `catalog-v1.json` é a fotografia do catálogo de antes do remake (116 peças) — nunca editar.
 */
import { BOSSES } from '../../content/bosses';
import { ITEMS, getItem, hasItem } from '../../content/items';
import { MemoryGameRepository } from '../../data/repository/MemoryGameRepository';
import { SqlGameRepository } from '../../data/repository/SqlGameRepository';
import { MIGRATIONS, migrate } from '../../data/migrations';
import { openNodeDriver } from '../../data/testing/nodeDriver';
import { PRE_ASTER_BACKUP_KEY, backupBeforeAster, readPreAsterBackup } from '../../state/backup';
import { decodeSyncState, encodeSyncState, toSyncState } from '../../sync/snapshot';
import { FEATS } from '../game/feats';
import { createInitialState } from '../game/game';
import { normalizeProfile, sanitizeEquipped } from '../game/normalize';
import type { GameState } from '../game/types';
import { LEVEL_ITEM_TABLE } from '../progression/rewards';
import v1 from '../../content/__tests__/fixtures/catalog-v1.json';

const T0 = Date.UTC(2026, 9, 1, 12);

/** De onde cada peça vem hoje (mesma regra usada para gerar a fotografia). */
function sourceOf(id: string): string {
  for (const [l, ids] of Object.entries(LEVEL_ITEM_TABLE)) if (ids.includes(id)) return `level:${l}`;
  for (const f of FEATS) if (f.itemIds.includes(id)) return `feat:${f.id}`;
  for (const b of BOSSES) {
    if (b.rewards.firstItems.includes(id)) return `boss:${b.id}:first`;
    if (b.rewards.flawlessItem === id) return `boss:${b.id}:flawless`;
  }
  return getItem(id).price !== undefined ? 'oficina' : 'outro';
}

/** Um veterano como o app antigo gravava: equipamento só com os cinco espaços de antes e TODAS as peças antigas. */
function veteranV1(): GameState {
  const g = createInitialState(T0);
  const inventory = Object.fromEntries(v1.items.map((i, n) => [i.id, { itemId: i.id, acquiredAt: T0 + n, source: i.source }]));
  const profile = {
    ...g.profile,
    name: 'Theo',
    onboarded: true,
    xp: 18_450,
    ink: 912,
    equipped: { frame: 'frame-tres-arcos', core: 'core-trindade', aura: 'aura-aurora', scene: 'scene-planicie', title: 'title-soma-inteira' },
  } as unknown as GameState['profile'];
  return { ...g, profile, inventory };
}

describe('catálogo: nada do que existia sumiu', () => {
  it('a fotografia tem as 116 peças de antes', () => {
    expect(v1.total).toBe(116);
    expect(v1.items).toHaveLength(116);
  });

  it('toda peça antiga continua existindo, no mesmo espaço e com a mesma raridade', () => {
    for (const old of v1.items) {
      expect({ id: old.id, exists: hasItem(old.id) }).toEqual({ id: old.id, exists: true });
      const now = getItem(old.id);
      expect({ id: old.id, slot: now.slot, rarity: now.rarity }).toEqual({ id: old.id, slot: old.slot, rarity: old.rarity });
    }
  });

  it('toda peça antiga continua vindo da mesma conquista (nível, feito, chefão, Oficina)', () => {
    for (const old of v1.items) expect({ id: old.id, source: sourceOf(old.id) }).toEqual({ id: old.id, source: old.source });
  });

  it('nenhuma peça antiga ficou mais cara na Oficina', () => {
    for (const old of v1.items) {
      if (old.price === null) continue;
      expect(getItem(old.id).price).toBeLessThanOrEqual(old.price);
    }
  });

  it('o catálogo cresceu (não foi trocado): as antigas são um subconjunto', () => {
    const ids = new Set(ITEMS.map((i) => i.id));
    expect(v1.items.every((i) => ids.has(i.id))).toBe(true);
    expect(ITEMS.length).toBeGreaterThanOrEqual(v1.total);
  });
});

describe('save antigo: equipamento, inventário e progresso atravessam o remake', () => {
  it('o perfil gravado pelo app antigo mantém o que estava equipado; os espaços novos nascem vazios', () => {
    const old = veteranV1();
    const p = normalizeProfile(JSON.parse(JSON.stringify(old.profile)), T0);
    expect(p.equipped).toEqual({
      frame: 'frame-tres-arcos',
      core: 'core-trindade',
      aura: 'aura-aurora',
      scene: 'scene-planicie',
      title: 'title-soma-inteira',
      orbiter: null,
      trail: null,
      lens: null,
      ignition: null,
    });
    expect({ xp: p.xp, ink: p.ink, name: p.name, onboarded: p.onboarded }).toEqual({ xp: 18_450, ink: 912, name: 'Theo', onboarded: true });
  });

  it('banco SQLite real gravado no formato antigo: abre com tudo no lugar', async () => {
    const driver = openNodeDriver(':memory:');
    await migrate(driver, MIGRATIONS);
    const old = veteranV1();
    await driver.run('INSERT INTO profile (id, data, updated_at) VALUES (1, ?, 1)', [JSON.stringify(old.profile)]);
    for (const e of Object.values(old.inventory)) await driver.run('INSERT INTO inventory (item_id, acquired_at, source) VALUES (?, ?, ?)', [e.itemId, e.acquiredAt, e.source]);
    const repo = new SqlGameRepository(driver, () => T0 + 1000);
    const loaded = (await repo.load())!;
    expect(Object.keys(loaded.inventory).sort()).toEqual(v1.items.map((i) => i.id).sort());
    expect(loaded.inventory['core-trindade']).toEqual({ itemId: 'core-trindade', acquiredAt: expect.any(Number), source: 'boss:quimera-fracionaria:flawless' });
    expect(loaded.profile.equipped.core).toBe('core-trindade');
    expect(loaded.profile.equipped.frame).toBe('frame-tres-arcos');
    expect(loaded.profile.equipped.orbiter).toBeNull();
    expect(loaded.profile.xp).toBe(18_450);
    driver.close();
  });

  it('a nuvem leva e traz o equipamento com os espaços novos, sem perder os antigos', () => {
    const g = veteranV1();
    const state = { ...g, profile: normalizeProfile(g.profile, T0) };
    const round = decodeSyncState(encodeSyncState(toSyncState(state)), T0);
    expect(round.profile.equipped).toEqual(state.profile.equipped);
    expect(Object.keys(round.inventory)).toHaveLength(116);
  });

  it('peça desconhecida no equipamento (volta de versão) não derruba: o espaço volta ao inicial ou fica vazio', () => {
    const d = createInitialState(T0).profile.equipped;
    const weird = { ...d, core: 'core-que-nao-existe', frame: 'aura-brasa', aura: 'aura-inexistente', scene: 'scene-noite' };
    expect(sanitizeEquipped(weird, d)).toEqual({ ...d, scene: 'scene-noite' });
  });
});

describe('cópia de segurança de antes do remake', () => {
  it('é gravada uma vez, com o estado exatamente como estava, e pode ser lida de volta', async () => {
    const repo = new MemoryGameRepository();
    const before = veteranV1();
    const normalized = { ...before, profile: normalizeProfile(before.profile, T0) };
    expect(await backupBeforeAster(repo, normalized, '0.3.0', T0)).toBe(true);
    const copy = (await readPreAsterBackup(repo, T0))!;
    expect(copy.appVersion).toBe('0.3.0');
    expect(copy.state.profile.equipped.core).toBe('core-trindade');
    expect(copy.state.profile.xp).toBe(18_450);
    expect(Object.keys(copy.state.inventory)).toHaveLength(116);

    // Uma segunda abertura (já com peças novas) NÃO sobrescreve a cópia original.
    const later = { ...normalized, profile: { ...normalized.profile, xp: 99_999 } };
    expect(await backupBeforeAster(repo, later, '0.3.0', T0 + 5)).toBe(false);
    expect((await readPreAsterBackup(repo, T0))!.state.profile.xp).toBe(18_450);
    expect(await repo.getKv(PRE_ASTER_BACKUP_KEY)).toContain('"at":' + T0);
  });

  it('sem jogo carregado, ou se o banco falhar, não grava e não lança', async () => {
    const repo = new MemoryGameRepository();
    expect(await backupBeforeAster(repo, null, '0.3.0', T0)).toBe(false);
    const broken = { getKv: async () => { throw new Error('disco cheio'); } } as unknown as MemoryGameRepository;
    await expect(backupBeforeAster(broken, veteranV1(), '0.3.0', T0)).resolves.toBe(false);
  });
});
