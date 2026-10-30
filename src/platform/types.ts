/**
 * Tudo que muda entre o app nativo (Android: SQLite + Firebase) e a pré-visualização web
 * (memória, sem login real) fica atrás desta interface. O resto do app não sabe a diferença.
 */
import type { AuthService } from '../auth/types';
import type { GameRepository } from '../data/repository/GameRepository';
import type { CloudStore } from '../sync/types';

export interface Platform {
  auth: AuthService;
  /** null = sem nuvem (pré-visualização web). */
  cloud(): CloudStore | null;
  /** Abre (criando, se preciso) o banco local DESTA conta. Cada conta tem o seu. */
  openRepository(uid: string): Promise<GameRepository>;
  /** Apaga o banco local da conta (exclusão de conta). */
  deleteLocalData(uid: string): Promise<void>;
  /** Pré-visualização: sem login real e sem nuvem. */
  preview: boolean;
}

/** Nome do banco local da conta. O uid do Firebase é alfanumérico; o filtro é só uma garantia. */
export function accountDatabaseName(uid: string): string {
  return `questforge-${uid.replace(/[^A-Za-z0-9_-]/g, '_')}.db`;
}
