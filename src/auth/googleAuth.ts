/**
 * Login com Google no Android: Credential Manager (API atual do Android) via
 * react-native-nitro-google-signin → idToken do Google → Firebase Auth (`signInWithCredential`).
 *
 *  - A sessão do Firebase é persistida no cofre do sistema (ver secureStorage.ts) e restaurada ao
 *    reabrir o app, sem rede.
 *  - O uid do Firebase Auth é o identificador estável que nomeia o banco local e o caminho na nuvem.
 *  - Nenhuma credencial ou segredo vive no app: só identificadores públicos do projeto (config.ts).
 */
import {
  GoogleAuthProvider,
  deleteUser,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signInWithCredential,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { GoogleOneTapSignIn, isCancelledResponse, isSuccessResponse } from 'react-native-nitro-google-signin';
import { mapAuthError } from './authErrors';
import { cloudConfig } from './config';
import { firebase } from './firebase';
import { AUTH_MESSAGES, AuthError, type AuthErrorCode, type AuthService, type AuthUser } from './types';

const toUser = (u: User): AuthUser => ({ uid: u.uid, displayName: u.displayName, email: u.email });

function fail(code: AuthErrorCode, cause?: unknown): AuthError {
  return new AuthError(code, AUTH_MESSAGES[code], cause);
}

/** Abre o seletor de contas do Google e devolve o idToken (nunca guardado: vira credencial do Firebase). */
async function pickGoogleIdToken(): Promise<string> {
  const cfg = cloudConfig();
  if (!cfg) throw fail('config');
  GoogleOneTapSignIn.configure({ webClientId: cfg.googleWebClientId });
  await GoogleOneTapSignIn.checkPlayServices();
  const response = await GoogleOneTapSignIn.presentExplicitSignIn();
  if (isCancelledResponse(response)) throw fail('cancelled');
  if (!isSuccessResponse(response)) throw fail('no-account');
  const idToken = response.data.idToken;
  if (!idToken) throw fail('config');
  return idToken;
}

export function createGoogleAuthService(): AuthService {
  return {
    async restore() {
      try {
        const { auth } = firebase();
        await auth.authStateReady(); // sessão lida do cofre local; não depende de rede
        return auth.currentUser ? toUser(auth.currentUser) : null;
      } catch (e) {
        throw mapAuthError(e);
      }
    },

    async signInWithGoogle() {
      try {
        const { auth } = firebase();
        const idToken = await pickGoogleIdToken();
        const result = await signInWithCredential(auth, GoogleAuthProvider.credential(idToken));
        return toUser(result.user);
      } catch (e) {
        throw mapAuthError(e);
      }
    },

    async signOut() {
      try {
        await firebaseSignOut(firebase().auth);
      } finally {
        await GoogleOneTapSignIn.signOut().catch(() => undefined);
      }
    },

    async reauthenticate() {
      try {
        const { auth } = firebase();
        if (!auth.currentUser) throw fail('unauthenticated');
        const idToken = await pickGoogleIdToken();
        await reauthenticateWithCredential(auth.currentUser, GoogleAuthProvider.credential(idToken));
      } catch (e) {
        throw mapAuthError(e);
      }
    },

    async deleteAccount() {
      try {
        const { auth } = firebase();
        if (!auth.currentUser) throw fail('unauthenticated');
        const email = auth.currentUser.email;
        await deleteUser(auth.currentUser);
        if (email) await GoogleOneTapSignIn.revokeAccess(email).catch(() => undefined);
        await GoogleOneTapSignIn.signOut().catch(() => undefined);
      } catch (e) {
        throw mapAuthError(e);
      }
    },

    onSessionLost(listener) {
      let hadUser = false;
      return onAuthStateChanged(firebase().auth, (user) => {
        if (user) hadUser = true;
        else if (hadUser) listener();
      });
    },
  };
}
