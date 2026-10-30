/**
 * Tradução dos erros do Google (Credential Manager) e do Firebase Auth para códigos que a interface
 * sabe explicar. Puro (sem módulos nativos) para poder ser testado em Node.
 */
import { AUTH_MESSAGES, AuthError, type AuthErrorCode } from './types';

const fail = (code: AuthErrorCode, cause?: unknown): AuthError => new AuthError(code, AUTH_MESSAGES[code], cause);

/** Códigos de `statusCodes` do react-native-nitro-google-signin (cadeias fixas da biblioteca). */
const GOOGLE_CODES: Record<string, AuthErrorCode> = {
  SIGN_IN_CANCELLED: 'cancelled',
  PLAY_SERVICES_NOT_AVAILABLE: 'play-services',
  IN_PROGRESS: 'in-progress',
  SIGN_IN_REQUIRED: 'unauthenticated',
  DEVELOPER_ERROR: 'config',
};

const FIREBASE_CODES: Record<string, AuthErrorCode> = {
  'auth/network-request-failed': 'offline',
  'auth/requires-recent-login': 'requires-recent-login',
  'auth/user-mismatch': 'account-mismatch',
  'auth/user-disabled': 'unauthenticated',
  'auth/user-token-expired': 'unauthenticated',
  'auth/user-not-found': 'unauthenticated',
  'auth/invalid-credential': 'config',
  'auth/operation-not-allowed': 'config',
  'auth/invalid-api-key': 'config',
  'auth/app-not-authorized': 'config',
  'auth/internal-error': 'config',
};

export function mapAuthError(e: unknown): AuthError {
  if (e instanceof AuthError) return e;
  const code = (e as { code?: unknown } | null)?.code;
  const message = (e as { message?: unknown } | null)?.message;
  if (typeof code === 'string') {
    if (code.startsWith('auth/')) return fail(FIREBASE_CODES[code] ?? 'unknown', e);
    const mapped = GOOGLE_CODES[code];
    if (mapped) return fail(mapped, e);
    if (typeof message === 'string' && /no credential|nenhuma conta|no account/i.test(message)) return fail('no-account', e);
  }
  return fail('unknown', e);
}
