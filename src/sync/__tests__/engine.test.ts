import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { QUESTIONS } from '../../content/bank';
import { createInitialState } from '../../domain/game/game';
import { KV, SyncError, type RemoteSave } from '../types';
import { findRegressions } from '../merge';
import { SNAPSHOT_SCHEMA, decodeSyncState, encodeSyncState, hashText, isPristine, meaningfulKey, toSyncState } from '../snapshot';
import { Clock, clearRegion1, makeDevice, type Device } from '../testing/device';
import { FakeCloud } from '../testing/fakeCloud';
import { DAY, HOUR } from '../testing/gameplay';

const UID = 'uid-ana';
const ids = (n: number, from = 0) => QUESTIONS.slice(from, from + n).map((q) => q.id);
const sync = (d: Device) => toSyncState(d.state());
const cloudState = (c: FakeCloud, uid = UID) => decodeSyncState(c.saves.get(uid)!.data);

async function signedUp(cloud: FakeCloud, name = 'A', uid = UID, clock = new Clock()): Promise<Device> {
  const d = await makeDevice({ uid, name, cloud, clock });
  await d.engine.syncNow(); // primeiro contato: nuvem vazia
  await d.onboard();
  await d.engine.syncNow();
  return d;
}

describe('conta nova', () => {
  it('primeiro contato com a nuvem vazia não grava nada; o perfil nasce no primeiro envio', async () => {
    const cloud = new FakeCloud();
    const d = await makeDevice({ uid: UID, name: 'A', cloud });
    const first = await d.engine.syncNow();
    expect(first).toEqual({ kind: 'confirmed-empty' });
    expect(cloud.saves.size).toBe(0);
    expect((await d.engine.meta()).baseRev).toBe(0);

    await d.onboard();
    expect(await d.engine.isDirty()).toBe(true);
    expect(await d.engine.syncNow()).toEqual({ kind: 'created', rev: 1 });
    expect(cloud.saves.get(UID)!.rev).toBe(1);
    expect(cloudState(cloud).profile.name).toBe('Lia');
    expect(await d.engine.isDirty()).toBe(false);
  });
});

describe('salvar progresso', () => {
  it('envia só o que mudou, em lote, e a nuvem fica idêntica ao aparelho', async () => {
    const cloud = new FakeCloud();
    const d = await signedUp(cloud);
    const writes = cloud.counts.writes;
    await d.expedition(ids(5), true);
    await d.expedition(ids(5, 5), [true, false, true, true, false]);
    expect(await d.engine.syncNow()).toEqual({ kind: 'pushed', rev: 2 });
    expect(cloud.counts.writes).toBe(writes + 1); // duas sessões, uma gravação
    expect(encodeSyncState(cloudState(cloud))).toBe(encodeSyncState(sync(d)));
    expect(cloud.saves.get(UID)!.stats.answered).toBe(10);
    expect(await d.engine.isDirty()).toBe(false);
  });

  it('sem alterações, sincronizar de novo não grava nem relê o documento inteiro por nada', async () => {
    const cloud = new FakeCloud();
    const d = await signedUp(cloud);
    const before = { ...cloud.counts };
    for (let i = 0; i < 4; i++) expect((await d.engine.syncNow()).kind).toBe('up-to-date');
    expect(cloud.counts.writes).toBe(before.writes);
    expect(cloud.counts.transactions).toBe(before.transactions);
  });

  it('abrir o app (descanso/última atividade) sozinho não gera gravação na nuvem', async () => {
    const cloud = new FakeCloud();
    const clock = new Clock();
    const d = await signedUp(cloud, 'A', UID, clock);
    const lastBefore = sync(d).profile.lastActiveAt!;
    clock.advance(2 * HOUR);
    await d.controller.init(); // "reabre": touch() atualiza lastActiveAt
    expect(sync(d).profile.lastActiveAt).toBeGreaterThan(lastBefore);
    expect(await d.engine.isDirty()).toBe(false);
    const writes = cloud.counts.writes;
    await d.engine.syncNow();
    expect(cloud.counts.writes).toBe(writes);
  });

  it('virar o dia troca o quadro de encomendas — isso sim é uma alteração a enviar (uma gravação por dia de uso)', async () => {
    const cloud = new FakeCloud();
    const clock = new Clock();
    const d = await signedUp(cloud, 'A', UID, clock);
    clock.advance(DAY);
    await d.controller.init();
    expect(await d.engine.isDirty()).toBe(true);
    const writes = cloud.counts.writes;
    await d.engine.syncNow();
    expect(cloud.counts.writes).toBe(writes + 1);
    d.close();
  });
});

describe('reabrir o app (sessão existente)', () => {
  it('banco, base e metadados sobrevivem; nada é reenviado e nada se perde', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'qf-sync-'));
    const path = join(dir, 'a.db');
    const cloud = new FakeCloud();
    const clock = new Clock();
    const first = await makeDevice({ uid: UID, name: 'A', cloud, clock, driverPath: path });
    await first.engine.syncNow();
    await first.onboard();
    await first.expedition(ids(5), true);
    await first.engine.syncNow();
    const before = meaningfulKey(sync(first));
    const metaBefore = await first.engine.meta();
    first.close();

    clock.advance(2 * HOUR);
    const reopened = await makeDevice({ uid: UID, name: 'A2', cloud, clock, driverPath: path });
    expect(meaningfulKey(sync(reopened))).toBe(before);
    expect((await reopened.engine.meta()).deviceId).toBe(metaBefore.deviceId);
    const writes = cloud.counts.writes;
    expect((await reopened.engine.syncNow()).kind).toBe('up-to-date');
    expect(cloud.counts.writes).toBe(writes);
    reopened.close();
  });
});

describe('recuperação após reinstalação', () => {
  it('banco novo + mesma conta restaura tudo, sem gravar nada na nuvem', async () => {
    const cloud = new FakeCloud();
    const a = await signedUp(cloud);
    await clearRegion1(a);
    await a.boss('golem-proporcional');
    await a.expedition(ids(10), [true, true, false, true, true, true, false, true, true, true]);
    await a.engine.syncNow({ force: true });
    const original = a.state();
    expect(original.bosses['golem-proporcional'].wins).toBe(1);
    expect(cloud.attemptIds(UID).length).toBeGreaterThan(20);
    a.close();

    const writes = cloud.counts.writes;
    const revBefore = cloud.saves.get(UID)!.rev;
    const b = await makeDevice({ uid: UID, name: 'B', cloud }); // "instalou de novo": banco vazio
    expect(b.state().profile.onboarded).toBe(false);
    const outcome = await b.engine.syncNow();
    expect(outcome.kind).toBe('pulled');

    expect(cloud.counts.writes).toBe(writes); // restaurar nunca sobrescreve a nuvem
    expect(cloud.saves.get(UID)!.rev).toBe(revBefore);
    const restored = b.state();
    expect(restored.profile).toMatchObject({ onboarded: true, name: 'Lia', xp: original.profile.xp, ink: original.profile.ink });
    expect(restored.profile.equipped).toEqual(original.profile.equipped);
    expect(restored.profile.totals).toEqual(original.profile.totals);
    expect(restored.questionStates).toEqual(original.questionStates);
    expect(restored.inventory).toEqual(original.inventory);
    expect(restored.ledger).toEqual(original.ledger);
    expect(restored.campaign).toEqual(original.campaign);
    expect(restored.bosses).toEqual(original.bosses);
    expect(restored.quests).toEqual(original.quests);
    expect((await b.engine.meta()).notice?.kind).toBe('restored');
    // O histórico de respostas também volta (e não é reenviado).
    const restoredAttempts = await b.repo.recentAttempts(1000);
    expect(restoredAttempts.map((x) => x.id).sort()).toEqual(cloud.attemptIds(UID));
    const attemptWrites = cloud.counts.attemptWrites;
    await b.engine.syncNow({ force: true });
    expect(cloud.counts.attemptWrites).toBe(attemptWrites);
    expect(await b.engine.isDirty()).toBe(false);
    b.close();
  });

  it('garantia honesta: o que nunca chegou à nuvem não volta — tudo o que chegou, sim', async () => {
    const cloud = new FakeCloud();
    const a = await signedUp(cloud);
    await a.expedition(ids(5), true);
    await a.engine.syncNow({ force: true });
    const synced = a.state().profile.xp;

    cloud.down = 'offline';
    await a.expedition(ids(5, 5), true); // estudou sem internet…
    expect(a.state().profile.xp).toBeGreaterThan(synced);
    await expect(a.engine.syncNow()).rejects.toMatchObject({ code: 'offline' });
    a.close(); // …e desinstalou antes de reconectar
    cloud.down = null;

    const b = await makeDevice({ uid: UID, name: 'B', cloud });
    await b.engine.syncNow();
    expect(b.state().profile.xp).toBe(synced);
    b.close();
  });

  it('um aparelho novo que ainda tem progresso próprio (nunca sincronizado) soma à nuvem em vez de sobrescrever', async () => {
    const cloud = new FakeCloud();
    const a = await signedUp(cloud);
    await a.expedition(ids(5), true);
    await a.engine.syncNow();
    const cloudXp = a.state().profile.xp;

    const b = await makeDevice({ uid: UID, name: 'B', cloud });
    await b.onboard('Lia B');
    await b.expedition(ids(5, 40), true); // jogou offline numa instalação nova
    const bXp = b.state().profile.xp;
    await b.engine.syncNow();
    const merged = b.state();
    expect(merged.profile.xp).toBeGreaterThanOrEqual(cloudXp + bXp - 100); // soma (menos estornos de recompensas iguais)
    expect(merged.profile.totals.answered).toBe(10);
    expect(findRegressions(cloudState(cloud), toSyncState(merged))).toEqual([]);
    a.close();
    b.close();
  });
});

describe('offline e falhas', () => {
  it('sem internet nada se perde: tudo fica gravado e é enviado quando a rede volta', async () => {
    const cloud = new FakeCloud();
    const a = await signedUp(cloud);
    cloud.down = 'offline';
    await clearRegion1(a);
    await a.expedition(ids(10), true);
    const err = await a.engine.syncNow().catch((e) => e);
    expect(err).toBeInstanceOf(SyncError);
    expect(err.code).toBe('offline');
    expect(a.engine.getStatus()).toMatchObject({ phase: 'offline', error: 'offline', pendingChanges: true });
    expect(a.state().campaign['r1-m3'].completedAt).not.toBeNull();

    cloud.down = null;
    expect((await a.engine.syncNow()).kind).toBe('pushed');
    expect(encodeSyncState(cloudState(cloud))).toBe(encodeSyncState(sync(a)));
    expect(a.engine.getStatus()).toMatchObject({ phase: 'idle', error: null, pendingChanges: false });
    a.close();
  });

  it('resposta perdida: a gravação chegou mas o aparelho não soube — o reenvio NÃO soma de novo', async () => {
    const cloud = new FakeCloud();
    const a = await signedUp(cloud);
    await a.expedition(ids(5), true);
    cloud.dropNextAck = true;
    await expect(a.engine.syncNow()).rejects.toMatchObject({ code: 'offline' });
    const xpOnCloud = cloudState(cloud).profile.xp;
    expect(xpOnCloud).toBe(a.state().profile.xp); // chegou
    expect(cloud.saves.get(UID)!.rev).toBe(2);

    const writes = cloud.counts.writes;
    await a.engine.syncNow();
    expect(cloudState(cloud).profile.xp).toBe(xpOnCloud);
    expect(cloudState(cloud).profile.totals.answered).toBe(5);
    expect(a.state().profile.xp).toBe(xpOnCloud);
    expect(cloud.counts.writes).toBe(writes); // nada novo a gravar
    expect(await a.engine.isDirty()).toBe(false);
    a.close();
  });

  it('resposta perdida e progresso novo depois: só o incremento novo vai, uma vez', async () => {
    const cloud = new FakeCloud();
    const a = await signedUp(cloud);
    await a.expedition(ids(5), true);
    cloud.dropNextAck = true;
    await expect(a.engine.syncNow()).rejects.toMatchObject({ code: 'offline' });
    const afterFirst = a.state().profile.xp;
    await a.expedition(ids(5, 5), true);
    const final = a.state().profile.xp;
    await a.engine.syncNow();
    expect(cloudState(cloud).profile.xp).toBe(final);
    expect(cloudState(cloud).profile.totals.answered).toBe(10);
    expect(final).toBeGreaterThan(afterFirst);
    a.close();
  });

  it('resposta perdida e OUTRO aparelho gravou depois: o envio perdido é reconhecido pela linhagem', async () => {
    const cloud = new FakeCloud();
    const a = await signedUp(cloud);
    const b = await makeDevice({ uid: UID, name: 'B', cloud });
    await b.engine.syncNow(); // B restaura

    await a.expedition(ids(5), true);
    cloud.dropNextAck = true;
    await expect(a.engine.syncNow()).rejects.toMatchObject({ code: 'offline' });
    const dA = a.state().profile.totals.answered; // 5, já na nuvem

    await b.engine.syncNow(); // B vê o envio de A
    await b.expedition(ids(5, 30), true);
    await b.engine.syncNow(); // B grava por cima (linhagem inclui o envio de A)
    expect(cloudState(cloud).profile.totals.answered).toBe(dA + 5);

    await a.expedition(ids(3, 60), true); // A continua estudando sem saber de nada
    await a.engine.syncNow();
    expect(cloudState(cloud).profile.totals.answered).toBe(dA + 5 + 3); // nenhuma resposta contada duas vezes
    expect(a.state().profile.totals.answered).toBe(dA + 5 + 3);
    a.close();
    b.close();
  });

  it('prazo estourado: o envio abandonado não pode gravar depois (commit tardio)', async () => {
    const cloud = new FakeCloud();
    const a = await signedUp(cloud);
    await a.expedition(ids(5), true);
    cloud.holdNextTransaction = true;
    await expect(a.engine.syncNow()).rejects.toMatchObject({ code: 'timeout' });
    expect(a.engine.getStatus().phase).toBe('offline');
    const writes = cloud.counts.writes;

    await a.engine.syncNow(); // nova tentativa funciona
    expect(cloud.counts.writes).toBe(writes + 1);
    const rev = cloud.saves.get(UID)!.rev;
    cloud.releaseHeld(); // a transação antiga acorda: não pode mais gravar
    await new Promise((r) => setTimeout(r, 20));
    expect(cloud.counts.writes).toBe(writes + 1);
    expect(cloud.saves.get(UID)!.rev).toBe(rev);
    expect(cloudState(cloud).profile.totals.answered).toBe(5);
    a.close();
  });

  it('serviço de tentativas fora do ar não impede salvar o progresso; o histórico segue depois, sem duplicar', async () => {
    const cloud = new FakeCloud();
    const a = await signedUp(cloud);
    await a.expedition(ids(10), true);
    cloud.attemptsDown = 'unknown';
    await expect(a.engine.syncNow({ force: true })).rejects.toMatchObject({ code: 'unknown' });
    expect(cloudState(cloud).profile.totals.answered).toBe(10); // o snapshot (crítico) já está salvo
    expect(cloud.attemptIds(UID)).toEqual([]);

    cloud.attemptsDown = null;
    await a.engine.syncNow({ force: true });
    const sent = cloud.attemptIds(UID);
    expect(sent).toHaveLength(10);
    await a.engine.syncNow({ force: true });
    await a.engine.syncNow({ force: true });
    expect(cloud.attemptIds(UID)).toEqual(sent);
    expect(new Set(sent).size).toBe(sent.length);
    a.close();
  });

  it('tentativas só viajam em lote (ou quando forçado), e cada lote é idempotente', async () => {
    const cloud = new FakeCloud();
    const d = await makeDevice({ uid: UID, name: 'A', cloud, engine: { attemptBatch: 8 } });
    await d.engine.syncNow();
    await d.onboard();
    await d.expedition(ids(5), true);
    await d.engine.syncNow();
    expect(cloud.counts.attemptWrites).toBe(0); // 5 < 8: ainda acumulando
    await d.expedition(ids(5, 5), true);
    await d.engine.syncNow();
    expect(cloud.counts.attemptWrites).toBe(1);
    expect(cloud.attemptIds(UID)).toHaveLength(10);
    await d.expedition(ids(2, 10), true);
    await d.engine.syncNow();
    expect(cloud.counts.attemptWrites).toBe(1);
    await d.engine.syncNow({ force: true });
    expect(cloud.attemptIds(UID)).toHaveLength(12);
    d.close();
  });
});

describe('envios duplicados', () => {
  it('várias chamadas ao mesmo tempo viram um único envio', async () => {
    const cloud = new FakeCloud();
    const a = await signedUp(cloud);
    await a.expedition(ids(5), true);
    const writes = cloud.counts.writes;
    const results = await Promise.all([a.engine.syncNow(), a.engine.syncNow(), a.engine.syncNow()]);
    expect(cloud.counts.writes).toBe(writes + 1);
    expect(new Set(results.map((r) => JSON.stringify(r))).size).toBeLessThanOrEqual(2);
    expect(cloudState(cloud).profile.totals.answered).toBe(5);
    a.close();
  });

  it('repetir o ciclo depois de um sucesso não altera nada', async () => {
    const cloud = new FakeCloud();
    const a = await signedUp(cloud);
    await a.expedition(ids(5), true);
    await a.engine.syncNow();
    const snapshot = JSON.stringify(cloud.saves.get(UID));
    for (let i = 0; i < 3; i++) await a.engine.syncNow();
    expect(JSON.stringify(cloud.saves.get(UID))).toBe(snapshot);
    a.close();
  });
});

describe('conflito entre aparelhos', () => {
  it('dois aparelhos estudam offline: nada se perde, nada duplica, e ambos convergem', async () => {
    const cloud = new FakeCloud();
    const a = await signedUp(cloud);
    await clearRegion1(a);
    await a.engine.syncNow();
    const b = await makeDevice({ uid: UID, name: 'B', cloud });
    await b.engine.syncNow();
    const baseXp = a.state().profile.xp;
    const baseAnswered = a.state().profile.totals.answered;
    expect(b.state().profile.xp).toBe(baseXp);

    // Offline nos dois: A joga 10 questões; B joga outras 5 e conclui a mesma missão de novo.
    cloud.down = 'offline';
    a.clock.advance(HOUR);
    b.clock.advance(2 * HOUR);
    await a.expedition(ids(10, 100), true);
    await b.expedition(ids(5, 200), true);
    const dA = a.state().profile.xp - baseXp;
    const dB = b.state().profile.xp - baseXp;
    cloud.down = null;

    await a.engine.syncNow(); // A chega primeiro
    const out = await b.engine.syncNow(); // B encontra a nuvem avançada: merge
    expect(out.kind).toBe('merged');
    await a.engine.syncNow(); // A recebe o resultado

    const sa = sync(a);
    const sb = sync(b);
    expect(encodeSyncState(sa)).toBe(encodeSyncState(sb));
    expect(encodeSyncState(cloudState(cloud))).toBe(encodeSyncState(sb));
    expect(sb.profile.totals.answered).toBe(baseAnswered + 10 + 5);
    // XP = base + o que cada um fez − o que foi pago em dobro
    const dup = (await b.engine.meta()).notice;
    expect(dup?.kind).toBe('merged');
    expect(sb.profile.xp).toBeGreaterThanOrEqual(baseXp + Math.max(dA, dB));
    expect(sb.profile.xp).toBeLessThanOrEqual(baseXp + dA + dB);
    expect(findRegressions(sync(a), sb)).toEqual([]);
    a.close();
    b.close();
  });

  it('a mesma missão concluída pela 1ª vez nos dois aparelhos paga a recompensa uma vez só', async () => {
    const cloud = new FakeCloud();
    const a = await signedUp(cloud);
    const b = await makeDevice({ uid: UID, name: 'B', cloud });
    await b.engine.syncNow();
    const baseXp = a.state().profile.xp;
    const baseInk = a.state().profile.ink;

    a.clock.advance(DAY);
    b.clock.advance(DAY + HOUR);
    await a.mission('r1-m1', 5);
    await b.mission('r1-m1', 5);
    const dXpA = a.state().profile.xp - baseXp;
    const dXpB = b.state().profile.xp - baseXp;
    const dInkA = a.state().profile.ink - baseInk;
    const dInkB = b.state().profile.ink - baseInk;

    await a.engine.syncNow();
    await b.engine.syncNow();
    const merged = sync(b);
    // Recompensas únicas (1ª conclusão, estrelas, níveis, encomendas iguais) foram estornadas na segunda vez.
    expect(merged.profile.xp).toBeLessThan(baseXp + dXpA + dXpB);
    expect(merged.profile.ink).toBeLessThan(baseInk + dInkA + dInkB);
    expect(merged.profile.xp).toBeGreaterThanOrEqual(baseXp + Math.max(dXpA, dXpB));
    expect(merged.campaign['r1-m1'].runs).toBe(2);
    expect(Object.keys(merged.ledger).filter((k) => k === 'mission:r1-m1:first')).toHaveLength(1);
    a.close();
    b.close();
  });

  it('contenção: outro aparelho grava no meio da transação — a decisão é refeita sobre a versão nova', async () => {
    const cloud = new FakeCloud();
    const a = await signedUp(cloud);
    const b = await makeDevice({ uid: UID, name: 'B', cloud });
    await b.engine.syncNow();
    await a.expedition(ids(5), true);
    await b.expedition(ids(5, 50), true);

    cloud.afterDecide = async () => {
      await b.engine.syncNow(); // B grava enquanto A decide
    };
    await a.engine.syncNow();
    const final = cloudState(cloud);
    expect(final.profile.totals.answered).toBe(10);
    expect(cloud.saves.get(UID)!.rev).toBe(3); // criação, gravação de B no meio, e a de A refeita sobre ela
    expect(findRegressions(sync(a), final)).toEqual([]);
    a.close();
    b.close();
  });

  it('alterações feitas DURANTE a sincronização não se perdem', async () => {
    const cloud = new FakeCloud();
    const a = await signedUp(cloud);
    await a.expedition(ids(5), true);
    cloud.afterDecide = async () => {
      await a.expedition(ids(3, 70), true); // o estudante responde enquanto a nuvem processa
    };
    await a.engine.syncNow();
    expect(a.state().profile.totals.answered).toBe(8);
    expect(await a.engine.isDirty()).toBe(true); // as 3 novas ainda não foram
    await a.engine.syncNow();
    expect(cloudState(cloud).profile.totals.answered).toBe(8);
    a.close();
  });
});

describe('troca de conta e isolamento', () => {
  it('cada conta tem a própria nuvem e o próprio banco: nada vaza de uma para a outra', async () => {
    const cloud = new FakeCloud();
    const ana = await signedUp(cloud, 'Ana', 'uid-ana');
    await clearRegion1(ana);
    await ana.engine.syncNow();
    const bia = await signedUp(cloud, 'Bia', 'uid-bia');
    await bia.expedition(ids(5), true);
    await bia.engine.syncNow();

    expect(ana.state().campaign['r1-m3']).toBeDefined();
    expect(bia.state().campaign['r1-m3']).toBeUndefined();
    expect(cloudState(cloud, 'uid-ana').campaign['r1-m3']).toBeDefined();
    expect(cloudState(cloud, 'uid-bia').campaign['r1-m3']).toBeUndefined();
    expect(cloud.saves.get('uid-ana')!.deviceId).not.toBe(cloud.saves.get('uid-bia')!.deviceId);
    ana.close();
    bia.close();
  });

  it('um banco local nunca é usado por outra conta (barrado antes de qualquer envio)', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'qf-sync-'));
    const path = join(dir, 'ana.db');
    const cloud = new FakeCloud();
    const ana = await makeDevice({ uid: 'uid-ana', name: 'Ana', cloud, driverPath: path });
    await ana.engine.syncNow();
    await ana.onboard();
    await ana.engine.syncNow();
    ana.close();

    const intruder = await makeDevice({ uid: 'uid-bia', name: 'Bia', cloud, driverPath: path });
    await expect(intruder.engine.syncNow()).rejects.toMatchObject({ code: 'wrong-account' });
    expect(cloud.saves.has('uid-bia')).toBe(false);
    intruder.close();
  });

  it('sair e entrar de novo na mesma conta continua de onde parou (o banco da conta é mantido)', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'qf-sync-'));
    const path = join(dir, 'ana.db');
    const cloud = new FakeCloud();
    const clock = new Clock();
    const first = await makeDevice({ uid: 'uid-ana', name: 'Ana', cloud, clock, driverPath: path });
    await first.engine.syncNow();
    await first.onboard();
    await first.engine.syncNow();
    cloud.down = 'offline';
    await first.expedition(ids(5), true); // sai da conta sem conseguir enviar
    first.close();
    cloud.down = null;

    const again = await makeDevice({ uid: 'uid-ana', name: 'Ana2', cloud, clock, driverPath: path });
    expect(again.state().profile.totals.answered).toBe(5);
    await again.engine.syncNow();
    expect(cloudState(cloud, 'uid-ana').profile.totals.answered).toBe(5);
    again.close();
  });
});

describe('proteções de integridade', () => {
  it('estado local vazio nunca sobrescreve o progresso da nuvem', async () => {
    const cloud = new FakeCloud();
    const a = await signedUp(cloud);
    await clearRegion1(a);
    await a.expedition(ids(10), true);
    await a.engine.syncNow();
    const good = JSON.stringify(cloud.saves.get(UID));

    // Corrompe o banco local: volta ao estado de fábrica mantendo os metadados de sincronização.
    const empty = createInitialState(a.clock.now());
    await a.repo.replaceAll(empty, { wipeAttempts: true });
    a.controller.adopt(empty);

    await expect(a.engine.syncNow()).rejects.toMatchObject({ code: 'integrity' });
    expect(JSON.stringify(cloud.saves.get(UID))).toBe(good);
    expect(a.engine.getStatus().phase).toBe('blocked');
    a.close();
  });

  it('versão de dados mais nova que o app: não grava nada e avisa para atualizar', async () => {
    const cloud = new FakeCloud();
    const a = await signedUp(cloud);
    await a.expedition(ids(5), true);
    await a.engine.syncNow();
    const doc = cloud.saves.get(UID)!;
    cloud.saves.set(UID, { ...doc, schema: SNAPSHOT_SCHEMA + 1 });
    await a.expedition(ids(3, 5), true);
    const writes = cloud.counts.writes;
    await expect(a.engine.syncNow()).rejects.toMatchObject({ code: 'needs-update' });
    expect(cloud.counts.writes).toBe(writes);
    expect(a.engine.getStatus().phase).toBe('blocked');
    expect(a.state().profile.totals.answered).toBe(8); // o local continua intacto
    a.close();
  });

  it('documento corrompido na nuvem é recusado, nunca "consertado" por cima', async () => {
    const cloud = new FakeCloud();
    const a = await signedUp(cloud);
    await a.engine.syncNow();
    const doc = cloud.saves.get(UID)!;
    const tampered: RemoteSave = { ...doc, data: doc.data.replace('"xp":0', '"xp":9') };
    cloud.saves.set(UID, tampered);
    await a.expedition(ids(3), true);
    await expect(a.engine.syncNow()).rejects.toMatchObject({ code: 'corrupt-remote' });
    expect(cloud.saves.get(UID)).toEqual(tampered);
    a.close();
  });

  it('salvamento que sumiu da nuvem não é recriado às cegas', async () => {
    const cloud = new FakeCloud();
    const a = await signedUp(cloud);
    cloud.saves.delete(UID);
    await a.expedition(ids(3), true);
    await expect(a.engine.syncNow()).rejects.toMatchObject({ code: 'remote-missing' });
    expect(cloud.saves.has(UID)).toBe(false);
    expect(a.state().profile.totals.answered).toBe(3);
    a.close();
  });

  it('as regras do servidor recusam rev fora de ordem (defesa em profundidade)', async () => {
    const cloud = new FakeCloud();
    const a = await signedUp(cloud);
    const doc = cloud.saves.get(UID)!;
    await expect(cloud.transact(UID, () => ({ ...doc, rev: doc.rev + 5 }))).rejects.toMatchObject({ code: 'permission' });
    await expect(cloud.transact(UID, () => ({ ...doc, rev: doc.rev }))).rejects.toMatchObject({ code: 'permission' });
    expect(cloud.saves.get(UID)!.rev).toBe(doc.rev);
    a.close();
  });

  it('o documento gravado é íntegro: hash confere e o estado volta idêntico', async () => {
    const cloud = new FakeCloud();
    const a = await signedUp(cloud);
    await a.expedition(ids(8), true);
    await a.engine.syncNow();
    const doc = cloud.saves.get(UID)!;
    expect(hashText(doc.data)).toBe(doc.hash);
    expect(encodeSyncState(decodeSyncState(doc.data))).toBe(doc.data);
    expect(doc.ancestry.length).toBeLessThanOrEqual(32);
    a.close();
  });
});

describe('reinício do progresso', () => {
  it('reiniciar vale para a conta toda: o outro aparelho adota o reinício e guarda uma cópia do que descartou', async () => {
    const cloud = new FakeCloud();
    const a = await signedUp(cloud);
    await a.expedition(ids(5), true);
    await a.engine.syncNow({ force: true });
    const b = await makeDevice({ uid: UID, name: 'B', cloud });
    await b.engine.syncNow();
    expect(b.state().profile.totals.answered).toBe(5);

    await a.engine.resetProgress();
    await a.engine.syncNow({ force: true });
    expect(cloud.saves.get(UID)!.epoch).toBe(1);
    expect(isPristine(cloudState(cloud))).toBe(true);
    expect(cloud.attemptIds(UID)).toEqual([]);

    b.clock.advance(HOUR);
    await b.expedition(ids(3, 90), true); // B estuda antes de saber do reinício
    expect((await b.engine.syncNow()).kind).toBe('reset-adopted');
    expect(isPristine(sync(b))).toBe(true);
    expect(await b.repo.recentAttempts(100)).toEqual([]);
    expect(await b.repo.getKv(KV.discarded)).not.toBeNull(); // rede de segurança: nada é apagado sem rastro
    expect((await b.engine.meta()).notice?.kind).toBe('reset-adopted');
    a.close();
    b.close();
  });

  it('reiniciar sem internet fica marcado de forma durável e chega à nuvem depois', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'qf-sync-'));
    const path = join(dir, 'a.db');
    const cloud = new FakeCloud();
    const clock = new Clock();
    const a = await makeDevice({ uid: UID, name: 'A', cloud, clock, driverPath: path });
    await a.engine.syncNow();
    await a.onboard();
    await a.expedition(ids(5), true);
    await a.engine.syncNow({ force: true });

    cloud.down = 'offline';
    await a.engine.resetProgress();
    await expect(a.engine.syncNow()).rejects.toMatchObject({ code: 'offline' });
    a.close();
    cloud.down = null;

    const reopened = await makeDevice({ uid: UID, name: 'A2', cloud, clock, driverPath: path });
    expect((await reopened.engine.meta()).resetPending).toBe(true);
    await reopened.engine.syncNow();
    expect(cloud.saves.get(UID)!.epoch).toBe(1);
    expect(isPristine(cloudState(cloud))).toBe(true);
    expect((await reopened.engine.meta()).resetPending).toBe(false);
    reopened.close();
  });
});

describe('agendamento', () => {
  function manualScheduler() {
    const jobs: { id: number; at: number; fn: () => void }[] = [];
    let seq = 0;
    let now = 0;
    return {
      scheduler: {
        set: (fn: () => void, ms: number) => {
          const job = { id: ++seq, at: now + ms, fn };
          jobs.push(job);
          return job;
        },
        clear: (h: unknown) => {
          const i = jobs.indexOf(h as (typeof jobs)[number]);
          if (i >= 0) jobs.splice(i, 1);
        },
      },
      pending: () => jobs.map((j) => j.at - now),
      async advance(ms: number) {
        now += ms;
        for (const j of jobs.filter((x) => x.at <= now).sort((a, b) => a.at - b.at)) {
          jobs.splice(jobs.indexOf(j), 1);
          j.fn();
          await new Promise((r) => setTimeout(r, 15));
        }
      },
    };
  }

  it('muitas alterações seguidas viram um único envio', async () => {
    const cloud = new FakeCloud();
    const s = manualScheduler();
    const clock = new Clock();
    const a = await makeDevice({ uid: UID, name: 'A', cloud, clock, engine: { scheduler: s.scheduler, timeoutMs: 5_000_000 } });
    await a.engine.syncNow();
    await a.onboard();
    const before = cloud.counts.writes;
    for (let i = 0; i < 20; i++) a.engine.requestSync('change');
    expect(s.pending()).toHaveLength(1);
    expect(a.engine.getStatus().pendingChanges).toBe(true);
    await s.advance(14_999);
    expect(cloud.counts.writes).toBe(before);
    await s.advance(2);
    expect(cloud.counts.writes).toBe(before + 1);
    a.close();
  });

  it('falha de rede reagenda com espera crescente; erro definitivo não fica repetindo', async () => {
    const cloud = new FakeCloud();
    const s = manualScheduler();
    const a = await makeDevice({ uid: UID, name: 'A', cloud, engine: { scheduler: s.scheduler, timeoutMs: 5_000_000 } });
    await a.engine.syncNow();
    await a.onboard();
    cloud.down = 'offline';
    a.engine.requestSync('now');
    await s.advance(1);
    expect(a.engine.getStatus().phase).toBe('offline');
    expect(s.pending()).toEqual([5_000 - 0]);
    await s.advance(5_000);
    expect(s.pending()).toEqual([15_000]);
    cloud.down = null;
    await s.advance(15_000);
    expect(a.engine.getStatus()).toMatchObject({ phase: 'idle', pendingChanges: false });
    expect(s.pending()).toEqual([]);

    cloud.down = 'permission';
    await a.expedition(ids(3), true);
    a.engine.requestSync('now');
    await s.advance(1);
    expect(a.engine.getStatus()).toMatchObject({ phase: 'blocked', error: 'permission' });
    expect(s.pending()).toEqual([]); // sem repetição automática
    a.close();
  });
});
