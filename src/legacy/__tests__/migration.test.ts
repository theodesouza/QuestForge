import { mkdtempSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { SqlGameRepository } from '../../data/repository/SqlGameRepository';
import { answerCurrent, completeOnboarding, createInitialState, currentQuestionId, startSession } from '../../domain/game/game';
import { openNodeDriver } from '../../data/testing/nodeDriver';
import { buildExport, parseExport } from '../../sync/export';
import { decodeSyncState, encodeSyncState, hashText, toSyncState } from '../../sync/snapshot';
import { Clock, clearRegion1, makeDevice } from '../../sync/testing/device';
import { FakeCloud } from '../../sync/testing/fakeCloud';
import { QUESTIONS, getQuestion } from '../../content/bank';
import { LEGACY_KEY, LegacyError, allAttempts, fingerprintOf, parseMarker, readLegacy, runMigration, summarize, type LegacyData } from '../migration';
import { emailAllowed, makeReadOnly } from '../readOnly';

const UID = 'uid-dev';
const ids = (n: number, from = 0) => QUESTIONS.slice(from, from + n).map((q) => q.id);

/** Um banco IGUAL ao do celular do desenvolvedor: esquema v3, jogado de verdade, com sessão em andamento. */
async function makeLegacyDb() {
  const dir = mkdtempSync(join(tmpdir(), 'qf-legacy-'));
  const path = join(dir, 'questforge.db');
  const clock = new Clock();
  const d = await makeDevice({ uid: 'legacy', name: 'L', cloud: new FakeCloud(), clock, driverPath: path, schemaVersion: 3 });
  await d.onboard('Theo');
  await clearRegion1(d);
  await d.boss('golem-proporcional');
  await d.expedition(ids(10), [true, true, false, true, true, true, false, true, true, true]);
  // deixa uma expedição pela metade (o jogador fechou o app no meio)
  await d.controller.dispatch((s, now) => startSession(s, { id: 'in-progress', mode: 'expedition', nodeId: null, minutes: null, questionIds: ids(4, 100) }, now));
  const qid = currentQuestionId(d.state().session!)!;
  await d.controller.dispatch((s, now) => answerCurrent(s, { attemptId: 'in-progress-a1', chosen: getQuestion(qid).answer, guessed: false, hints: 0, timeMs: 9000 }, now));
  expect(d.state().session).not.toBeNull();
  d.close();
  return { path, clock };
}

async function openLegacy(path: string) {
  const driver = await makeReadOnly(openNodeDriver(path));
  const repo = new SqlGameRepository(driver, Date.now, { migrate: false });
  return { driver, repo };
}

async function freshTarget(uid = UID) {
  const dir = mkdtempSync(join(tmpdir(), 'qf-target-'));
  const path = join(dir, `${uid}.db`);
  const driver = openNodeDriver(path);
  return { path, driver, repo: new SqlGameRepository(driver) };
}

describe('banco legado: somente leitura e intocado', () => {
  it('o SQLite recusa qualquer escrita na conexão do legado, e o arquivo não muda um byte', async () => {
    const { path } = await makeLegacyDb();
    const before = readFileSync(path);
    const { driver, repo } = await openLegacy(path);
    await expect(driver.run('DELETE FROM profile')).rejects.toThrow();
    await expect(driver.run('DROP TABLE attempts')).rejects.toThrow();
    await expect(driver.exec('CREATE TABLE sync_kv (key TEXT)')).rejects.toThrow();
    await expect(driver.run('UPDATE profile SET data = ?', ['{}'])).rejects.toThrow();
    const data = await readLegacy(repo);
    expect(data!.state.profile.name).toBe('Theo');
    expect(data!.attempts.length).toBeGreaterThan(20);
    driver.close();
    expect(readFileSync(path).equals(before)).toBe(true);
  });

  it('lê o esquema v3 sem aplicar migrações (não cria tabelas novas nele)', async () => {
    const { path } = await makeLegacyDb();
    const { driver, repo } = await openLegacy(path);
    await readLegacy(repo);
    expect(await driver.get<{ user_version: number }>('PRAGMA user_version')).toEqual({ user_version: 3 });
    expect(await driver.all("SELECT name FROM sqlite_master WHERE name = 'sync_kv'")).toEqual([]);
    driver.close();
  });

  it('um banco sem progresso (instalação nova) não tem o que migrar', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'qf-legacy-'));
    const d = await makeDevice({ uid: 'x', name: 'X', cloud: new FakeCloud(), driverPath: join(dir, 'a.db'), schemaVersion: 3 });
    d.close();
    const { repo } = await openLegacy(join(dir, 'a.db'));
    expect(await readLegacy(repo)).toBeNull();
  });
});

describe('migração única', () => {
  async function setup(opts: { cloud?: FakeCloud } = {}) {
    const { path } = await makeLegacyDb();
    const legacyBytes = readFileSync(path);
    const { driver: legacyDriver, repo: legacyRepo } = await openLegacy(path);
    const legacy = (await readLegacy(legacyRepo))!;
    const cloud = opts.cloud ?? new FakeCloud();
    const target = await freshTarget();
    return { path, legacyBytes, legacyDriver, legacy, cloud, target, ports: { legacy, uid: UID, target: target.repo, cloud, appVersion: 'test', engine: { timeoutMs: 500 } } };
  }

  it('copia TUDO para a conta, confere a nuvem e o banco novo, e deixa o legado intacto', async () => {
    const { path, legacyBytes, legacyDriver, legacy, cloud, target, ports } = await setup();
    const steps: string[] = [];
    const r = await runMigration(ports, (s) => steps.push(s));
    expect(steps).toEqual(['check', 'seed', 'upload', 'verify']);
    expect(r.alreadyDone).toBe(false);
    expect(r.checks.every((c) => c.ok)).toBe(true);
    expect(r.checks.length).toBeGreaterThan(15);
    expect(r.rev).toBe(1);

    // Nuvem: o mesmo progresso, com o marcador da migração.
    const doc = cloud.saves.get(UID)!;
    expect(doc.legacyImport?.fingerprint).toBe(fingerprintOf(legacy));
    expect(hashText(doc.data)).toBe(doc.hash);
    expect(encodeSyncState(decodeSyncState(doc.data))).toBe(encodeSyncState(toSyncState(legacy.state)));
    expect(cloud.attemptIds(UID)).toEqual(legacy.attempts.map((a) => a.id).sort());

    // Antes × depois.
    expect(r.after).toEqual(r.before);
    expect(r.before.xp).toBe(legacy.state.profile.xp);

    // Banco novo: estado e tentativas idênticos, inclusive a expedição que estava pela metade.
    const local = (await target.repo.load())!;
    expect(encodeSyncState(toSyncState(local))).toBe(encodeSyncState(toSyncState(legacy.state)));
    expect(local.session).toEqual(legacy.state.session);
    expect(local.session).not.toBeNull();
    expect((await allAttempts(target.repo)).map((a) => a.id).sort()).toEqual(legacy.attempts.map((a) => a.id).sort());
    expect(parseMarker(await target.repo.getKv(LEGACY_KEY))?.verifiedAt).toBeGreaterThan(0);

    // O legado, o backup original, não mudou um byte.
    legacyDriver.close();
    expect(readFileSync(path).equals(legacyBytes)).toBe(true);
    target.driver.close();
  });

  it('é idempotente: repetir a migração não grava, não soma e não duplica nada', async () => {
    const { legacy, cloud, target, ports } = await setup();
    const first = await runMigration(ports);
    const snapshot = JSON.stringify(cloud.saves.get(UID));
    const writes = { ...cloud.counts };
    for (let i = 0; i < 3; i++) {
      const again = await runMigration(ports);
      expect(again.alreadyDone).toBe(true);
      expect(again.rev).toBe(1);
      expect(again.after.xp).toBe(first.after.xp);
    }
    expect(JSON.stringify(cloud.saves.get(UID))).toBe(snapshot);
    expect(cloud.counts.writes).toBe(writes.writes);
    expect(cloud.counts.attemptWrites).toBe(writes.attemptWrites);
    expect((await allAttempts(target.repo)).length).toBe(legacy.attempts.length);
    target.driver.close();
  });

  it('interrompida na conferência, é retomada sem gravar de novo', async () => {
    const { cloud, target, ports } = await setup();
    const original = cloud.listAttempts.bind(cloud);
    cloud.listAttempts = async () => {
      throw new Error('queda de conexão na conferência');
    };
    await expect(runMigration(ports)).rejects.toThrow(/queda/);
    expect(parseMarker(await target.repo.getKv(LEGACY_KEY))?.verifiedAt).toBeUndefined(); // NÃO está concluída
    const rev = cloud.saves.get(UID)!.rev;
    const writes = cloud.counts.writes;

    cloud.listAttempts = original;
    const r = await runMigration(ports);
    expect(r.checks.every((c) => c.ok)).toBe(true);
    expect(cloud.saves.get(UID)!.rev).toBe(rev);
    expect(cloud.counts.writes).toBe(writes);
    expect(parseMarker(await target.repo.getKv(LEGACY_KEY))?.verifiedAt).toBeGreaterThan(0);
    target.driver.close();
  });

  it('sem internet no envio: nada é marcado como concluído, e o legado segue intacto', async () => {
    const { path, legacyBytes, legacyDriver, cloud, target, ports } = await setup();
    cloud.down = 'offline';
    await expect(runMigration(ports)).rejects.toMatchObject({ code: 'offline' });
    expect(cloud.saves.size).toBe(0);
    expect(parseMarker(await target.repo.getKv(LEGACY_KEY))?.verifiedAt).toBeUndefined();
    cloud.down = null;
    const r = await runMigration(ports);
    expect(r.checks.every((c) => c.ok)).toBe(true);
    legacyDriver.close();
    expect(readFileSync(path).equals(legacyBytes)).toBe(true);
    target.driver.close();
  });

  it('recusa conta que já tem dados na nuvem — nada é sobrescrito nem misturado', async () => {
    const cloud = new FakeCloud();
    const other = await makeDevice({ uid: UID, name: 'O', cloud });
    await other.engine.syncNow();
    await other.onboard('Outra pessoa');
    await other.expedition(ids(5), true);
    await other.engine.syncNow();
    const before = JSON.stringify(cloud.saves.get(UID));
    other.close();

    const { target, ports } = await setup({ cloud });
    await expect(runMigration(ports)).rejects.toMatchObject({ code: 'cloud-not-empty' });
    expect(JSON.stringify(cloud.saves.get(UID))).toBe(before);
    expect(await target.repo.load()).toBeNull(); // o banco novo nem foi tocado
    target.driver.close();
  });

  it('recusa um banco novo que já tem progresso próprio', async () => {
    const { target, ports, cloud } = await setup();
    const own = completeOnboarding(createInitialState(1), { name: 'Já existia', goal: 'enem', dailyMinutes: 10, selfLevel: 'iniciante', examYear: null }, 1).state;
    await target.repo.replaceAll(own);
    await expect(runMigration(ports)).rejects.toMatchObject({ code: 'target-not-empty' });
    expect(cloud.saves.size).toBe(0);
    expect((await target.repo.load())!.profile.name).toBe('Já existia');
    target.driver.close();
  });

  it('se o banco legado mudar no meio do caminho, a migração para em vez de enviar algo diferente do que foi conferido', async () => {
    const { legacy, target, ports, cloud } = await setup();
    // primeira rodada interrompida logo após copiar (a queda acontece no envio)
    const transact = cloud.transact.bind(cloud);
    cloud.transact = async () => {
      throw new Error('queda no envio');
    };
    await expect(runMigration(ports)).rejects.toThrow(/queda/);
    expect(parseMarker(await target.repo.getKv(LEGACY_KEY))).not.toBeNull(); // já copiou para o banco novo
    cloud.transact = transact;
    const changed: LegacyData = { ...legacy, attempts: [...legacy.attempts, { ...legacy.attempts[0], id: 'att-extra' }] };
    await expect(runMigration({ ...ports, legacy: changed })).rejects.toMatchObject({ code: 'fingerprint-changed' });
    expect(cloud.saves.size).toBe(0);
    target.driver.close();
  });

  it('a conferência pega divergências: nuvem adulterada, tentativa faltando', async () => {
    const { legacy, cloud, target, ports } = await setup();
    await runMigration(ports);
    // Adultera o salvamento na nuvem (mantendo o hash coerente, como um bug de gravação faria).
    const doc = cloud.saves.get(UID)!;
    const tampered = doc.data.replace(/"xp":(\d+)/, (_m, n) => `"xp":${Number(n) + 7}`);
    cloud.saves.set(UID, { ...doc, data: tampered, hash: hashText(tampered) });
    await expect(runMigration(ports)).rejects.toMatchObject({ code: 'verify-failed' });

    cloud.saves.set(UID, doc); // restaura
    const chunk = [...cloud.attempts.get(UID)!.values()][0];
    chunk.attempts.pop();
    try {
      await runMigration(ports);
      throw new Error('deveria ter falhado');
    } catch (e) {
      expect(e).toBeInstanceOf(LegacyError);
      const err = e as LegacyError;
      expect(err.checks.filter((c) => !c.ok).map((c) => c.label)).toContain('Histórico de respostas na nuvem');
    }
    expect(legacy.attempts.length).toBeGreaterThan(0);
    target.driver.close();
  });

  it('depois de migrado, o app segue normal: abre, joga, sincroniza e outro aparelho restaura tudo', async () => {
    const { legacy, cloud, target, ports } = await setup();
    await runMigration(ports);
    target.driver.close();

    // "Reabre o app" sobre o banco da conta: já tem base, não vai pedir restauração.
    const clock = new Clock(Date.UTC(2026, 9, 30, 12));
    const device = await makeDevice({ uid: UID, name: 'D', cloud, clock, driverPath: target.path });
    expect((await device.engine.meta()).baseRev).toBe(1);
    expect(device.state().profile.name).toBe('Theo');
    expect(device.state().profile.xp).toBeGreaterThanOrEqual(legacy.state.profile.xp);
    await device.expedition(ids(5, 200), true);
    await device.engine.syncNow({ force: true });
    const progressed = device.state();

    const restored = await makeDevice({ uid: UID, name: 'R', cloud });
    await restored.engine.syncNow();
    expect(restored.state().profile).toMatchObject({ name: 'Theo', xp: progressed.profile.xp, ink: progressed.profile.ink });
    expect(restored.state().campaign).toEqual(progressed.campaign);
    expect(restored.state().bosses).toEqual(progressed.bosses);
    expect(restored.state().inventory).toEqual(progressed.inventory);
    expect(restored.state().ledger).toEqual(progressed.ledger);
    expect((await restored.repo.recentAttempts(1000)).length).toBe(legacy.attempts.length + 5);
    device.close();
    restored.close();
  });
});

describe('backup verificável', () => {
  it('o arquivo de backup traz o estado completo e recusa adulteração', async () => {
    const { path } = await makeLegacyDb();
    const { repo } = await openLegacy(path);
    const legacy = (await readLegacy(repo))!;
    const { text, file } = buildExport({ state: legacy.state, attempts: legacy.attempts, account: { uid: UID, email: 'dev@example.com' }, appVersion: 'test', now: Date.UTC(2026, 9, 20) });
    expect(file.summary).toMatchObject({ xp: legacy.state.profile.xp, attempts: legacy.attempts.length });
    const back = parseExport(text);
    expect(back.state).toEqual(JSON.parse(JSON.stringify(legacy.state)));
    expect(back.attempts).toHaveLength(legacy.attempts.length);
    expect(summarize(legacy).answered).toBe(legacy.state.profile.totals.answered);

    // Alterar o conteúdo (o XP do perfil) ou só o resumo: ambos são detectados.
    expect(() => parseExport(text.replace(/("profile": \{[\s\S]*?"xp": )(\d+)/, (_m, a, n) => `${a}${Number(n) + 1}`))).toThrow(/checksum/);
    expect(() => parseExport(text.replace(/"xp": (\d+)/, (_m, n) => `"xp": ${Number(n) + 1}`))).toThrow(/resumo/);
    expect(() => parseExport(text.slice(0, text.length - 40))).toThrow();
    expect(() => parseExport('{"format":"outro"}')).toThrow(/exportação/);
  });
});

describe('conta correta', () => {
  it('só prossegue com o e-mail esperado (quando definido), sem distinguir maiúsculas', () => {
    expect(emailAllowed('Theo@Example.com', 'theo@example.com')).toBe(true);
    expect(emailAllowed('theo@example.com', 'outra@example.com')).toBe(false);
    expect(emailAllowed('theo@example.com', null)).toBe(false);
    expect(emailAllowed('', 'qualquer@example.com')).toBe(true);
    expect(emailAllowed(undefined, null)).toBe(true);
  });
});
