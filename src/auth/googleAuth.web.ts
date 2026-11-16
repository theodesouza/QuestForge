/**
 * Login com Google no navegador (versão para computador): janela de contas do Google aberta pelo
 * Firebase Auth (`signInWithPopup`). É a MESMA conta do celular — o mesmo uid —, então o progresso
 * que o celular enviou para a nuvem é o que abre aqui.
 *
 *  - A sessão fica no navegador (ver firebase.web.ts) e é restaurada ao reabrir a página.
 *  - O endereço do site precisa estar em Firebase → Authentication → Settings → Authorized domains;
 *    sem isso o Firebase recusa com `auth/unauthorized-domain` (ver docs/DESKTOP.md).
 */
import { GoogleAuthProvider, deleteUser, onAuthStateChanged, reauthenticateWithPopup, signInWithPopup, signOut as firebaseSignOut, type User } from 'firebase/auth';
import { mapAuthError } from './authErrors';
import { firebase } from './firebase';
import { AUTH_MESSAGES, AuthError, type AuthService, type AuthUser } from './types';

const toUser = (u: User): AuthUser => ({ uid: u.uid, displayName: u.displayName, email: u.email });

function provider(): GoogleAuthProvider {
  const p = new GoogleAuthProvider();
  p.setCustomParameters({ prompt: 'select_account' }); // sempre deixa escolher a conta (a do celular)
  return p;
}

export function createGoogleAuthService(): AuthService {
  return {
    async restore() {
      try {
        const { auth } = firebase();
        await auth.authStateReady();
        return auth.currentUser ? toUser(auth.currentUser) : null;
      } catch (e) {
        throw mapAuthError(e);
      }
    },

    async signInWithGoogle() {
      try {
        const result = await signInWithPopup(firebase().auth, provider());
        return toUser(result.user);
      } catch (e) {
        throw mapAuthError(e);
      }
    },

    async signOut() {
      await firebaseSignOut(firebase().auth);
    },

    async reauthenticate() {
      try {
        const { auth } = firebase();
        if (!auth.currentUser) throw new AuthError('unauthenticated', AUTH_MESSAGES.unauthenticated);
        await reauthenticateWithPopup(auth.currentUser, provider());
      } catch (e) {
        throw mapAuthError(e);
      }
    },

    async deleteAccount() {
      try {
        const { auth } = firebase();
        if (!auth.currentUser) throw new AuthError('unauthenticated', AUTH_MESSAGES.unauthenticated);
        await deleteUser(auth.currentUser);
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
