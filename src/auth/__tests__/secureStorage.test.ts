import { secureAuthStorage } from '../secureStorage';

const mockStore = new Map<string, string>();
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async (k: string) => mockStore.get(k) ?? null),
  setItemAsync: jest.fn(async (k: string, v: string) => {
    if (!/^[A-Za-z0-9._-]+$/.test(k)) throw new Error(`chave inválida: ${k}`);
    mockStore.set(k, v);
  }),
  deleteItemAsync: jest.fn(async (k: string) => {
    mockStore.delete(k);
  }),
}));

const FIREBASE_KEY = 'firebase:authUser:AIzaFakeKey:[DEFAULT]';

beforeEach(() => mockStore.clear());

describe('sessão no cofre do sistema', () => {
  it('guarda e devolve o valor (chave do Firebase com ":" e "[" vira uma chave aceita)', async () => {
    await secureAuthStorage.setItem(FIREBASE_KEY, '{"uid":"abc"}');
    expect(await secureAuthStorage.getItem(FIREBASE_KEY)).toBe('{"uid":"abc"}');
    expect([...mockStore.keys()].every((k) => /^[A-Za-z0-9._-]+$/.test(k))).toBe(true);
  });

  it('valores grandes são divididos e remontados sem perda', async () => {
    const big = JSON.stringify({ token: 'x'.repeat(5000), name: 'Ana ✓ çãõ' });
    await secureAuthStorage.setItem(FIREBASE_KEY, big);
    expect(mockStore.size).toBeGreaterThan(3);
    expect(await secureAuthStorage.getItem(FIREBASE_KEY)).toBe(big);
  });

  it('regravar com um valor menor não deixa pedaços antigos para trás', async () => {
    await secureAuthStorage.setItem(FIREBASE_KEY, 'y'.repeat(6000));
    await secureAuthStorage.setItem(FIREBASE_KEY, 'curto');
    expect(await secureAuthStorage.getItem(FIREBASE_KEY)).toBe('curto');
    expect(mockStore.size).toBe(2); // 1 pedaço + contador
  });

  it('uma escrita interrompida nunca produz leitura parcial', async () => {
    await secureAuthStorage.setItem(FIREBASE_KEY, 'z'.repeat(6000));
    const chunk = [...mockStore.keys()].find((k) => k.endsWith('_1'))!;
    mockStore.delete(chunk); // pedaço perdido
    expect(await secureAuthStorage.getItem(FIREBASE_KEY)).toBeNull();
  });

  it('remover apaga tudo; ausente devolve null', async () => {
    expect(await secureAuthStorage.getItem(FIREBASE_KEY)).toBeNull();
    await secureAuthStorage.setItem(FIREBASE_KEY, 'w'.repeat(4000));
    await secureAuthStorage.removeItem(FIREBASE_KEY);
    expect(mockStore.size).toBe(0);
    expect(await secureAuthStorage.getItem(FIREBASE_KEY)).toBeNull();
  });
});
