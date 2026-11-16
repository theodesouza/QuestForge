/**
 * Navegador. Dois modos, decididos na montagem do site:
 *
 *  · versão para computador (o Firebase está configurado): a mesma conta Google e a mesma nuvem do
 *    celular; o progresso fica guardado no navegador (IndexedDB, um banco por conta) e o motor de
 *    sincronização funciona igual — dá para jogar sem rede e enviar depois;
 *  · pré-visualização (sem configuração, ou build de testes `EXPO_PUBLIC_QA=1`): progresso em
 *    memória, sem login real e sem nuvem. É o que as capturas de tela e o roteiro ponta a ponta usam.
 */
import { cloudConfig } from '../auth/config';
import { firebase } from '../auth/firebase';
import { createGoogleAuthService } from '../auth/googleAuth';
import type { AuthService, AuthUser } from '../auth/types';
import { FirestoreCloudStore } from '../data/cloud/firestoreCloudStore';
import type { GameRepository } from '../data/repository/GameRepository';
import { IndexedDbGameRepository, deleteIndexedDb, openIndexedDb } from '../data/repository/IndexedDbGameRepository';
import { MemoryGameRepository } from '../data/repository/MemoryGameRepository';
import type { Platform } from './types';

const PREVIEW_USER: AuthUser = { uid: 'web-preview', displayName: 'Pré-visualização', email: null };

/** Nome do banco do navegador para a conta (o uid do Firebase é alfanumérico; o filtro é só garantia). */
export const browserDatabaseName = (uid: string) => `questforge-${uid.replace(/[^A-Za-z0-9_-]/g, '_')}`;

function previewPlatform(): Platform {
  const repos = new Map<string, GameRepository>();
  const auth: AuthService = {
    restore: async () => PREVIEW_USER,
    signInWithGoogle: async () => PREVIEW_USER,
    signOut: async () => undefined,
    reauthenticate: async () => undefined,
    deleteAccount: async () => undefined,
    onSessionLost: () => () => undefined,
  };
  return {
    preview: true,
    auth,
    cloud: () => null,
    openRepository: async (uid) => {
      const repo = repos.get(uid) ?? new MemoryGameRepository();
      repos.set(uid, repo);
      return repo;
    },
    deleteLocalData: async (uid) => {
      repos.delete(uid);
    },
  };
}

function desktopPlatform(): Platform {
  const open = new Map<string, IndexedDbGameRepository>();
  let cloud: FirestoreCloudStore | null = null;
  return {
    preview: false,
    auth: createGoogleAuthService(),
    cloud: () => (cloud ??= new FirestoreCloudStore(firebase().db)),
    async openRepository(uid) {
      const name = browserDatabaseName(uid);
      const existing = open.get(name);
      if (existing) return existing;
      const repo = new IndexedDbGameRepository(await openIndexedDb(name));
      open.set(name, repo);
      // Pede ao navegador para não descartar o banco quando faltar espaço (melhor esforço).
      void globalThis.navigator?.storage?.persist?.().catch(() => undefined);
      return repo;
    },
    async deleteLocalData(uid) {
      const name = browserDatabaseName(uid);
      open.get(name)?.close();
      open.delete(name);
      await deleteIndexedDb(name);
    },
  };
}

export function createPlatform(): Platform {
  const real = process.env.EXPO_PUBLIC_QA !== '1' && cloudConfig() !== null && typeof indexedDB !== 'undefined';
  return real ? desktopPlatform() : previewPlatform();
}
