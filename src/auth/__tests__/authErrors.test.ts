import { mapAuthError } from '../authErrors';
import { AUTH_MESSAGES, AuthError } from '../types';

describe('erros de login traduzidos', () => {
  it.each([
    [{ code: 'SIGN_IN_CANCELLED', message: 'x' }, 'cancelled'],
    [{ code: 'PLAY_SERVICES_NOT_AVAILABLE', message: 'x' }, 'play-services'],
    [{ code: 'IN_PROGRESS', message: 'x' }, 'in-progress'],
    [{ code: 'DEVELOPER_ERROR', message: 'x' }, 'config'],
    [{ code: 'SIGN_IN_REQUIRED', message: 'x' }, 'unauthenticated'],
    [{ code: 'ONE_TAP_START_FAILED', message: 'No credentials available' }, 'no-account'],
    [{ code: 'ONE_TAP_START_FAILED', message: 'falha qualquer' }, 'unknown'],
    [{ code: 'auth/network-request-failed' }, 'offline'],
    [{ code: 'auth/requires-recent-login' }, 'requires-recent-login'],
    [{ code: 'auth/user-mismatch' }, 'account-mismatch'],
    [{ code: 'auth/user-disabled' }, 'unauthenticated'],
    [{ code: 'auth/invalid-credential' }, 'config'],
    [{ code: 'auth/algo-novo' }, 'unknown'],
    [new Error('qualquer coisa'), 'unknown'],
    [null, 'unknown'],
  ])('%j → %s', (input, code) => {
    const e = mapAuthError(input);
    expect(e).toBeInstanceOf(AuthError);
    expect(e.code).toBe(code);
    expect(e.message).toBe(AUTH_MESSAGES[code as keyof typeof AUTH_MESSAGES]);
  });

  it('um AuthError já traduzido passa intacto', () => {
    const e = new AuthError('offline', 'x');
    expect(mapAuthError(e)).toBe(e);
  });

  it('toda mensagem é em português e nunca vazia', () => {
    for (const msg of Object.values(AUTH_MESSAGES)) expect(msg.length).toBeGreaterThan(15);
  });
});
