/**
 * Inicialização única do Firebase (Auth + Firestore) para o navegador (versão para computador).
 *  - Auth: sessão guardada no próprio navegador (IndexedDB; cai para localStorage se ele estiver
 *    bloqueado), então reabrir a página não pede login de novo.
 *  - Firestore: cache só em memória, como no celular — o que dura é o banco local da conta
 *    (IndexedDbGameRepository), onde o motor de sincronização guarda a base e as pendências.
 */
import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { browserLocalPersistence, browserPopupRedirectResolver, getAuth, indexedDBLocalPersistence, initializeAuth, type Auth } from 'firebase/auth';
import { getFirestore, initializeFirestore, memoryLocalCache, type Firestore } from 'firebase/firestore';
import { cloudConfig } from './config';
import { AuthError } from './types';

let cached: { app: FirebaseApp; auth: Auth; db: Firestore } | null = null;

export function firebase(): { app: FirebaseApp; auth: Auth; db: Firestore } {
  if (cached) return cached;
  const cfg = cloudConfig();
  if (!cfg) throw new AuthError('config', 'Configuração do Firebase ausente (variáveis EXPO_PUBLIC_FIREBASE_*).');
  const app = getApps().length > 0 ? getApp() : initializeApp(cfg.firebase);
  let auth: Auth;
  try {
    auth = initializeAuth(app, { persistence: [indexedDBLocalPersistence, browserLocalPersistence], popupRedirectResolver: browserPopupRedirectResolver });
  } catch {
    auth = getAuth(app); // já inicializado (recarga rápida em desenvolvimento)
  }
  let db: Firestore;
  try {
    db = initializeFirestore(app, { localCache: memoryLocalCache(), ignoreUndefinedProperties: true });
  } catch {
    db = getFirestore(app);
  }
  cached = { app, auth, db };
  return cached;
}
