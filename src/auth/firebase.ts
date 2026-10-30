/**
 * Inicialização única do Firebase (Auth + Firestore) para Android/iOS.
 *  - Auth: persistência no cofre do sistema (secureStorage), restaura a sessão ao reabrir sem rede.
 *  - Firestore: cache só em memória — a persistência durável é o SQLite do app (o motor de
 *    sincronização guarda a base e as pendências lá). Long-polling forçado: o transporte padrão
 *    (WebChannel) falha em algumas redes móveis no React Native.
 */
import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth, type Auth } from 'firebase/auth';
import { getFirestore, initializeFirestore, memoryLocalCache, type Firestore } from 'firebase/firestore';
import { AuthError } from './types';
import { cloudConfig } from './config';
import { secureAuthStorage } from './secureStorage';

let cached: { app: FirebaseApp; auth: Auth; db: Firestore } | null = null;

export function firebase(): { app: FirebaseApp; auth: Auth; db: Firestore } {
  if (cached) return cached;
  const cfg = cloudConfig();
  if (!cfg) throw new AuthError('config', 'Configuração do Firebase ausente (variáveis EXPO_PUBLIC_FIREBASE_*).');
  const app = getApps().length > 0 ? getApp() : initializeApp(cfg.firebase);
  let auth: Auth;
  try {
    auth = initializeAuth(app, { persistence: getReactNativePersistence(secureAuthStorage) });
  } catch {
    auth = getAuth(app); // já inicializado (recarga rápida em desenvolvimento)
  }
  let db: Firestore;
  try {
    db = initializeFirestore(app, {
      localCache: memoryLocalCache(),
      experimentalForceLongPolling: true,
      ignoreUndefinedProperties: true,
    });
  } catch {
    db = getFirestore(app);
  }
  cached = { app, auth, db };
  return cached;
}
