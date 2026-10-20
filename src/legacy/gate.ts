/**
 * Porta de entrada da migração única. Só é carregada em builds de desenvolvimento
 * (EXPO_PUBLIC_LEGACY_MIGRATION=1) — ver state/session.ts.
 */
import type { AuthUser } from '../auth/types';
import type { Platform } from '../platform/types';
import { openLegacyRepository } from './legacyDb';
import { LEGACY_KEY, parseMarker, readLegacy } from './migration';

let skippedForNow = false;

/** "Agora não": segue sem migrar nesta abertura do app (o banco antigo continua guardado). */
export function skipForNow() {
  skippedForNow = true;
}

/** Há progresso antigo neste aparelho que ainda não foi migrado para a conta que acabou de entrar? */
export async function needsMigration(platform: Platform, user: AuthUser): Promise<boolean> {
  if (platform.preview || skippedForNow) return false;
  try {
    const legacy = await openLegacyRepository();
    if (!legacy) return false;
    try {
      if (!(await readLegacy(legacy.repo))) return false;
    } finally {
      await legacy.close();
    }
  } catch {
    // Existe um banco antigo que não deu para ler com segurança: NÃO seguir em silêncio — a tela mostra o
    // problema (e oferece "Agora não"), em vez de o app abrir como se não houvesse progresso a migrar.
    return true;
  }
  const target = await platform.openRepository(user.uid);
  return !parseMarker(await target.getKv(LEGACY_KEY))?.verifiedAt;
}
