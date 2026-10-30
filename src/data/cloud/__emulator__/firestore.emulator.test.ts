/**
 * Integração com os emuladores REAIS do Firebase (Auth + Firestore) e as regras de segurança do projeto.
 * Executar com `npm run test:rules`.
 *
 * O login usa o recurso do emulador de Auth que aceita um idToken do Google "falso" em JSON — o token
 * resultante tem `sign_in_provider = google.com`, exatamente o que as regras exigem.
 */
import { deleteApp, initializeApp, type FirebaseApp } from 'firebase/app';
import { GoogleAuthProvider, connectAuthEmulator, getAuth, signInAnonymously, signInWithCredential } from 'firebase/auth';
import { connectFirestoreEmulator, deleteDoc, doc, getDoc, initializeFirestore, setDoc, type Firestore } from 'firebase/firestore';
import { QUESTIONS } from '../../../content/bank';
import { decodeSyncState, encodeSyncState, hashText, statsOf, toSyncState } from '../../../sync/snapshot';
import { makeDevice } from '../../../sync/testing/device';
import { DAY, HOUR } from '../../../sync/testing/gameplay';
import { FirestoreCloudStore } from '../firestoreCloudStore';

const apps: FirebaseApp[] = [];
let counter = 0;

interface Account {
  uid: string;
  db: Firestore;
  store: FirestoreCloudStore;
}

async function connect(sub: string, provider: 'google' | 'anonymous' = 'google'): Promise<Account> {
  const app = initializeApp({ projectId: 'demo-questforge', apiKey: 'fake-api-key' }, `t${counter++}-${sub}`);
  apps.push(app);
  const auth = getAuth(app);
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  const cred =
    provider === 'google'
      ? await signInWithCredential(auth, GoogleAuthProvider.credential(JSON.stringify({ sub, email: `${sub}@example.com`, email_verified: true })))
      : await signInAnonymously(auth);
  const db = initializeFirestore(app, { experimentalForceLongPolling: true, ignoreUndefinedProperties: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  return { uid: cred.user.uid, db, store: new FirestoreCloudStore(db) };
}

async function unauthenticated(): Promise<Firestore> {
  const app = initializeApp({ projectId: 'demo-questforge', apiKey: 'fake-api-key' }, `t${counter++}-anon-none`);
  apps.push(app);
  const db = initializeFirestore(app, { experimentalForceLongPolling: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  return db;
}

afterAll(async () => {
  await Promise.all(apps.map((a) => deleteApp(a)));
});

/** Documento de salvamento válido segundo as regras. */
function saveDoc(rev: number, over: Record<string, unknown> = {}) {
  const data = '{"v":1}';
  return {
    schema: 1,
    rev,
    epoch: 0,
    nonce: `n${rev}`,
    ancestry: [],
    deviceId: 'dev-a',
    updatedAt: Date.now(),
    appVersion: 'test',
    data,
    hash: hashText(data),
    stats: { xp: 0 },
    ...over,
  };
}

const denied = (p: Promise<unknown>) => expect(p).rejects.toMatchObject({ code: 'permission-denied' });
/** Pelo adaptador, o erro do SDK já chega traduzido para o código do motor. */
const deniedViaStore = (p: Promise<unknown>) => expect(p).rejects.toMatchObject({ code: 'permission' });
const savePath = (db: Firestore, uid: string) => doc(db, 'users', uid, 'save', 'state');

describe('regras: quem pode acessar', () => {
  it('sem login nada é lido nem gravado', async () => {
    const owner = await connect('dono-1');
    await setDoc(savePath(owner.db, owner.uid), saveDoc(1));
    const anon = await unauthenticated();
    await denied(getDoc(savePath(anon, owner.uid)));
    await denied(setDoc(savePath(anon, owner.uid), saveDoc(2)));
  });

  it('login que não é do Google (anônimo) é recusado, mesmo no próprio uid', async () => {
    const guest = await connect('x', 'anonymous');
    await denied(setDoc(savePath(guest.db, guest.uid), saveDoc(1)));
    await denied(getDoc(savePath(guest.db, guest.uid)));
  });

  it('uma conta nunca lê, grava nem apaga os dados de outra', async () => {
    const ana = await connect('ana-iso');
    const bia = await connect('bia-iso');
    await setDoc(savePath(ana.db, ana.uid), saveDoc(1));
    await setDoc(doc(ana.db, 'users', ana.uid, 'attempts', 'dev-a-0000000001'), { deviceId: 'dev-a', from: 1, to: 1, count: 1, data: '[]' });

    await denied(getDoc(savePath(bia.db, ana.uid)));
    await denied(setDoc(savePath(bia.db, ana.uid), saveDoc(2)));
    await denied(deleteDoc(savePath(bia.db, ana.uid)));
    await denied(getDoc(doc(bia.db, 'users', ana.uid, 'attempts', 'dev-a-0000000001')));
    await denied(setDoc(doc(bia.db, 'users', ana.uid, 'attempts', 'x'), { deviceId: 'b', from: 1, to: 1, count: 0, data: '[]' }));
    await deniedViaStore(bia.store.read(ana.uid));
    await deniedViaStore(bia.store.listAttempts(ana.uid));
    // E a de Ana continua intacta.
    expect((await getDoc(savePath(ana.db, ana.uid))).data()).toMatchObject({ rev: 1 });
  });

  it('nada fora de users/{uid}/save|attempts é acessível (nem o documento users/{uid})', async () => {
    const ana = await connect('ana-root');
    await denied(setDoc(doc(ana.db, 'users', ana.uid), { x: 1 }));
    await denied(getDoc(doc(ana.db, 'users', ana.uid)));
    await denied(setDoc(doc(ana.db, 'public', 'x'), { x: 1 }));
    await denied(setDoc(doc(ana.db, 'users', ana.uid, 'outro', 'x'), { x: 1 }));
    await denied(setDoc(doc(ana.db, 'users', ana.uid, 'save', 'outro'), saveDoc(1)));
  });
});

describe('regras: integridade do salvamento', () => {
  it('só aceita criar com rev 1 e atualizar com rev = anterior + 1', async () => {
    const a = await connect('rev-user');
    const ref = savePath(a.db, a.uid);
    await denied(setDoc(ref, saveDoc(2))); // criar com rev 2
    await setDoc(ref, saveDoc(1));
    await denied(setDoc(ref, saveDoc(1))); // repetir a mesma revisão
    await denied(setDoc(ref, saveDoc(3))); // pular revisão
    await setDoc(ref, saveDoc(2));
    await denied(setDoc(ref, saveDoc(1))); // voltar atrás
    expect((await getDoc(ref)).data()).toMatchObject({ rev: 2 });
  });

  it('a geração (epoch) e o schema nunca regridem — um app antigo não sobrescreve dados novos', async () => {
    const a = await connect('epoch-user');
    const ref = savePath(a.db, a.uid);
    await setDoc(ref, saveDoc(1, { epoch: 2, schema: 3 }));
    await denied(setDoc(ref, saveDoc(2, { epoch: 1, schema: 3 })));
    await denied(setDoc(ref, saveDoc(2, { epoch: 2, schema: 2 })));
    await setDoc(ref, saveDoc(2, { epoch: 3, schema: 3 }));
    expect((await getDoc(ref)).data()).toMatchObject({ rev: 2, epoch: 3 });
  });

  it('recusa campos extras, tipos errados, ausentes e tamanhos fora do limite', async () => {
    const a = await connect('shape-user');
    const ref = savePath(a.db, a.uid);
    await denied(setDoc(ref, saveDoc(1, { admin: true })));
    await denied(setDoc(ref, saveDoc(1, { rev: '1' })));
    await denied(setDoc(ref, saveDoc(1, { data: 123 })));
    await denied(setDoc(ref, saveDoc(1, { data: '' })));
    await denied(setDoc(ref, saveDoc(1, { data: 'x'.repeat(900_001) })));
    await denied(setDoc(ref, saveDoc(1, { ancestry: Array.from({ length: 33 }, (_, i) => `n${i}`) })));
    await denied(setDoc(ref, saveDoc(1, { nonce: '' })));
    const { hash: _hash, ...semHash } = saveDoc(1);
    void _hash;
    await denied(setDoc(ref, semHash));
    await setDoc(ref, saveDoc(1)); // o válido passa
  });

  it('lotes de tentativas só aceitam o formato esperado', async () => {
    const a = await connect('chunk-user');
    const ref = (id: string) => doc(a.db, 'users', a.uid, 'attempts', id);
    await setDoc(ref('ok'), { deviceId: 'd', from: 1, to: 3, count: 3, data: '[]' });
    await denied(setDoc(ref('bad1'), { deviceId: 'd', from: 3, to: 1, count: 3, data: '[]' }));
    await denied(setDoc(ref('bad2'), { deviceId: 'd', from: 1, to: 3, count: 3, data: '[]', extra: 1 }));
    await denied(setDoc(ref('bad3'), { deviceId: 'd', from: 1, to: 3, count: 3, data: 'x'.repeat(900_001) }));
  });

  it('a própria conta pode apagar seus dados (exclusão de conta)', async () => {
    const a = await connect('delete-user');
    await setDoc(savePath(a.db, a.uid), saveDoc(1));
    await setDoc(doc(a.db, 'users', a.uid, 'attempts', 'c1'), { deviceId: 'd', from: 1, to: 1, count: 0, data: '[]' });
    await a.store.deleteAllUserData(a.uid);
    expect((await getDoc(savePath(a.db, a.uid))).exists()).toBe(false);
    expect(await a.store.listAttempts(a.uid)).toEqual([]);
  });
});

describe('motor de sincronização sobre o Firestore real', () => {
  const ids = (n: number, from = 0) => QUESTIONS.slice(from, from + n).map((q) => q.id);

  it('criar, salvar, reinstalar e restaurar — ponta a ponta com regras reais', async () => {
    const acc = await connect('e2e-user');
    const a = await makeDevice({ uid: acc.uid, name: 'A', cloud: acc.store, engine: { timeoutMs: 15_000 } });
    await a.engine.syncNow();
    await a.onboard();
    expect((await a.engine.syncNow()).kind).toBe('created');
    await a.expedition(ids(10), [true, true, false, true, true, true, true, false, true, true]);
    expect((await a.engine.syncNow({ force: true })).kind).toBe('pushed');

    const remote = (await acc.store.read(acc.uid))!;
    expect(remote.rev).toBe(2);
    expect(hashText(remote.data)).toBe(remote.hash);
    expect(encodeSyncState(decodeSyncState(remote.data))).toBe(encodeSyncState(toSyncState(a.state())));
    expect(remote.stats).toEqual(statsOf(toSyncState(a.state())));
    const original = a.state();
    a.close();

    // "Reinstalou": banco novo, mesma conta.
    const b = await makeDevice({ uid: acc.uid, name: 'B', cloud: acc.store, engine: { timeoutMs: 15_000 } });
    expect((await b.engine.syncNow()).kind).toBe('pulled');
    expect(b.state().profile).toMatchObject({ onboarded: true, xp: original.profile.xp, ink: original.profile.ink });
    expect(b.state().questionStates).toEqual(original.questionStates);
    expect((await b.repo.recentAttempts(100)).length).toBe(10);
    expect((await acc.store.read(acc.uid))!.rev).toBe(2); // restaurar não gravou nada
    b.close();
  });

  it('dois aparelhos com a mesma conta divergem e convergem sem perder nem duplicar', async () => {
    const acc = await connect('e2e-merge');
    const a = await makeDevice({ uid: acc.uid, name: 'A', cloud: acc.store, engine: { timeoutMs: 15_000 } });
    await a.engine.syncNow();
    await a.onboard();
    await a.engine.syncNow();
    const b = await makeDevice({ uid: acc.uid, name: 'B', cloud: acc.store, engine: { timeoutMs: 15_000 } });
    await b.engine.syncNow();

    a.clock.advance(HOUR);
    b.clock.advance(2 * HOUR);
    await a.expedition(ids(5), true);
    await b.expedition(ids(5, 30), true);
    await a.engine.syncNow();
    expect((await b.engine.syncNow()).kind).toBe('merged');
    await a.engine.syncNow();

    expect(a.state().profile.totals.answered).toBe(10);
    expect(encodeSyncState(toSyncState(a.state()))).toBe(encodeSyncState(toSyncState(b.state())));
    expect((await acc.store.read(acc.uid))!.rev).toBe(3); // criação, envio de A, fusão de B
    a.close();
    b.close();
  });

  it('isolamento: o motor de uma conta não consegue ler nem escrever na outra', async () => {
    const ana = await connect('e2e-ana');
    const bia = await connect('e2e-bia');
    const a = await makeDevice({ uid: ana.uid, name: 'A', cloud: ana.store, engine: { timeoutMs: 15_000 } });
    await a.engine.syncNow();
    await a.onboard();
    await a.engine.syncNow();
    // Um aparelho da Bia tentando operar sobre o uid da Ana (cliente adulterado) é barrado pelo servidor.
    const intruder = await makeDevice({ uid: ana.uid, name: 'X', cloud: bia.store, engine: { timeoutMs: 15_000 } });
    await expect(intruder.engine.syncNow()).rejects.toMatchObject({ code: 'permission' });
    expect((await ana.store.read(ana.uid))!.rev).toBe(1);
    a.close();
    intruder.close();
  });

  it('reiniciar o progresso e excluir os dados da conta', async () => {
    const acc = await connect('e2e-reset');
    const a = await makeDevice({ uid: acc.uid, name: 'A', cloud: acc.store, engine: { timeoutMs: 15_000 } });
    await a.engine.syncNow();
    await a.onboard();
    await a.expedition(ids(5), true);
    await a.engine.syncNow({ force: true });
    expect((await acc.store.listAttempts(acc.uid)).length).toBe(1);

    await a.engine.resetProgress();
    await a.engine.syncNow({ force: true });
    const afterReset = (await acc.store.read(acc.uid))!;
    expect(afterReset.epoch).toBe(1);
    expect(afterReset.rev).toBe(2); // criação (já com a sessão) e o reinício
    expect(await acc.store.listAttempts(acc.uid)).toEqual([]);

    await acc.store.deleteAllUserData(acc.uid);
    expect(await acc.store.read(acc.uid)).toBeNull();
    // Passado um dia, o aparelho que continua aberto não recria o salvamento às cegas.
    a.clock.advance(DAY);
    await a.onboard();
    await expect(a.engine.syncNow()).rejects.toMatchObject({ code: 'remote-missing' });
    a.close();
  });
});
