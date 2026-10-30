import { SyncError } from '../../../sync/types';
import { mapFirestoreError } from '../firestoreCloudStore';

// A tradução de erros não usa o SDK; ele é simulado só para o arquivo carregar no ambiente de teste do React Native.
jest.mock('firebase/firestore', () => ({}));

describe('erros do Firestore traduzidos para o motor', () => {
  it.each([
    ['unavailable', 'offline'],
    ['firestore/unavailable', 'offline'],
    ['cancelled', 'offline'],
    ['aborted', 'offline'],
    ['deadline-exceeded', 'timeout'],
    ['resource-exhausted', 'quota'],
    ['permission-denied', 'permission'],
    ['unauthenticated', 'unauthenticated'],
    ['invalid-argument', 'unknown'],
  ])('%s → %s', (code, expected) => {
    expect(mapFirestoreError(Object.assign(new Error('x'), { code })).code).toBe(expected);
  });

  it('mensagens de "cliente offline" sem código viram offline', () => {
    expect(mapFirestoreError(new Error('Failed to get document because the client is offline.')).code).toBe('offline');
  });

  it('um SyncError passa intacto', () => {
    const e = new SyncError('integrity', 'x');
    expect(mapFirestoreError(e)).toBe(e);
  });
});
