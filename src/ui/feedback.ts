/** Feedback tátil e preferência de movimento, respeitando os ajustes do jogador. */
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { useGameStore } from '../state/store';

export type HapticKind = 'select' | 'success' | 'error' | 'impact' | 'heavy';

/**
 * No Android, o canal "feedback ao toque" do sistema (`performHapticFeedback`) é o que funciona
 * mesmo no modo silencioso / Não perturbe; a vibração por `Vibrator` é suprimida nesses modos.
 * Usa o canal do toque primeiro e cai para o vibrador se o aparelho não o aceitar.
 */
const ANDROID_KIND: Record<HapticKind, Haptics.AndroidHaptics> = {
  select: Haptics.AndroidHaptics.Virtual_Key,
  success: Haptics.AndroidHaptics.Confirm,
  error: Haptics.AndroidHaptics.Reject,
  impact: Haptics.AndroidHaptics.Context_Click,
  heavy: Haptics.AndroidHaptics.Long_Press,
};

function vibrator(kind: HapticKind): Promise<void> {
  return kind === 'select'
    ? Haptics.selectionAsync()
    : kind === 'success'
      ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      : kind === 'error'
        ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
        : Haptics.impactAsync(kind === 'heavy' ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Medium);
}

/** Dispara o toque sem olhar os Ajustes (usado também pelo botão "Testar vibração"). */
export function playHaptic(kind: HapticKind): Promise<void> {
  if (Platform.OS === 'web') return Promise.resolve();
  if (Platform.OS === 'android') {
    return Haptics.performAndroidHapticsAsync(ANDROID_KIND[kind]).catch(() => vibrator(kind)).catch(() => undefined);
  }
  return vibrator(kind).catch(() => undefined);
}

export function haptic(kind: HapticKind) {
  if (Platform.OS === 'web') return;
  if (useGameStore.getState().game?.profile.settings.haptics === false) return;
  void playHaptic(kind);
}

/** true quando animações decorativas devem ser reduzidas. */
export function useReduceMotion(): boolean {
  const system = useReducedMotion();
  const pref = useGameStore((s) => s.game?.profile.settings.reduceMotion ?? 'system');
  if (pref === 'always') return true;
  if (pref === 'never') return false;
  return system;
}
