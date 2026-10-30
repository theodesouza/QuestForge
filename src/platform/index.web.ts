/**
 * Pré-visualização web (capturas de tela e roteiro ponta a ponta): progresso em memória, sem login
 * real e sem nuvem. Nunca é um destino de distribuição — o produto é o app nativo.
 */
import type { AuthService, AuthUser } from '../auth/types';
import { MemoryGameRepository } from '../data/repository/MemoryGameRepository';
import type { GameRepository } from '../data/repository/GameRepository';
import type { Platform } from './types';

const PREVIEW_USER: AuthUser = { uid: 'web-preview', displayName: 'Pré-visualização', email: null };

export function createPlatform(): Platform {
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
