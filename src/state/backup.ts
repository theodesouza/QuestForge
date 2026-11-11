/**
 * Cópia de segurança de antes do remake do Áster. Na primeira abertura com a versão nova, o estado
 * inteiro do jogador (perfil, equipamento, inventário, registro de recompensas, campanha, chefões,
 * revisões) é guardado, como estava, numa chave do próprio banco. O remake não apaga nada — a cópia
 * existe para que qualquer surpresa possa ser desfeita com os dados originais em mãos.
 */
import type { GameRepository } from '../data/repository/GameRepository';
import type { GameState } from '../domain/game/types';
import { decodeSyncState, encodeSyncState, toSyncState, type SyncState } from '../sync/snapshot';

export const PRE_ASTER_BACKUP_KEY = 'backup:pre-aster';

interface StoredBackup {
  at: number;
  appVersion: string;
  snapshot: string;
}

/** Grava a cópia uma única vez (se já existe, não toca). Nunca lança: falhar aqui não pode impedir o jogo de abrir. */
export async function backupBeforeAster(repo: GameRepository, state: GameState | null, appVersion: string, now: number): Promise<boolean> {
  try {
    if (!state) return false;
    if (await repo.getKv(PRE_ASTER_BACKUP_KEY)) return false;
    const stored: StoredBackup = { at: now, appVersion, snapshot: encodeSyncState(toSyncState(state)) };
    await repo.setKv([{ key: PRE_ASTER_BACKUP_KEY, value: JSON.stringify(stored) }]);
    return true;
  } catch {
    return false;
  }
}

/** Lê a cópia (ou null). Usada em diagnóstico e na recuperação. */
export async function readPreAsterBackup(repo: GameRepository, now: number): Promise<{ at: number; appVersion: string; state: SyncState } | null> {
  const raw = await repo.getKv(PRE_ASTER_BACKUP_KEY);
  if (!raw) return null;
  const stored = JSON.parse(raw) as StoredBackup;
  return { at: stored.at, appVersion: stored.appVersion, state: decodeSyncState(stored.snapshot, now) };
}
