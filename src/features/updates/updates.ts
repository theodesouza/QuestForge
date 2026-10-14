/**
 * Atualizações pela internet (EAS Update). O APK é instalado uma vez; versões novas
 * do código chegam sozinhas. O progresso fica no SQLite do aparelho e não é tocado:
 * a versão nova só roda as migrações pendentes ao abrir.
 *
 * Fluxo: o expo-updates verifica ao abrir o app (ON_LOAD) e também quando o app volta
 * do segundo plano (aqui, no máximo a cada 30 min). Baixada a versão, o Acampamento mostra
 * "Atualizar agora"; se o jogador ignorar, ela é aplicada na próxima abertura.
 */
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';

export const updatesEnabled = Platform.OS !== 'web' && Updates.isEnabled && !__DEV__;

const FOREGROUND_CHECK_INTERVAL_MS = 30 * 60 * 1000;
let lastCheck = 0;

export type CheckOutcome = 'downloaded' | 'up-to-date' | 'disabled' | 'error';

/** Verifica e baixa uma versão nova, se houver. Nunca reinicia o app sozinha. */
export async function checkAndFetch(): Promise<CheckOutcome> {
  if (!updatesEnabled) return 'disabled';
  lastCheck = Date.now();
  try {
    const check = await Updates.checkForUpdateAsync();
    if (!check.isAvailable) return 'up-to-date';
    const fetched = await Updates.fetchUpdateAsync();
    return fetched.isNew ? 'downloaded' : 'up-to-date';
  } catch {
    return 'error';
  }
}

/** Verifica de novo quando o app volta ao primeiro plano (respeitando um intervalo mínimo). */
export function useForegroundUpdateCheck() {
  useEffect(() => {
    if (!updatesEnabled) return;
    lastCheck = Date.now(); // a verificação ON_LOAD acabou de acontecer
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && Date.now() - lastCheck > FOREGROUND_CHECK_INTERVAL_MS) {
        checkAndFetch().catch(() => undefined);
      }
    });
    return () => sub.remove();
  }, []);
}

export function applyUpdateNow(): Promise<void> {
  return Updates.reloadAsync();
}

export interface VersionInfo {
  version: string;
  runtime: string | null;
  channel: string | null;
  updateId: string | null;
  updatedAt: Date | null;
  embedded: boolean;
}

export function versionInfo(): VersionInfo {
  return {
    version: Constants.expoConfig?.version ?? '?',
    runtime: Platform.OS === 'web' ? null : Updates.runtimeVersion,
    channel: Platform.OS === 'web' ? null : Updates.channel,
    updateId: Platform.OS === 'web' ? null : Updates.updateId,
    updatedAt: Platform.OS === 'web' ? null : Updates.createdAt,
    embedded: Platform.OS === 'web' ? true : Updates.isEmbeddedLaunch,
  };
}
