/** Feedback tátil e preferência de movimento, respeitando os ajustes do jogador. */
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { useGameStore } from '../state/store';

export type HapticKind = 'select' | 'success' | 'error' | 'impact' | 'heavy';

export function haptic(kind: HapticKind) {
  if (Platform.OS === 'web') return;
  if (useGameStore.getState().game?.profile.settings.haptics === false) return;
  const p =
    kind === 'select'
      ? Haptics.selectionAsync()
      : kind === 'success'
        ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        : kind === 'error'
          ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
          : Haptics.impactAsync(kind === 'heavy' ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Medium);
  p.catch(() => undefined);
}

/** true quando animações decorativas devem ser reduzidas. */
export function useReduceMotion(): boolean {
  const system = useReducedMotion();
  const pref = useGameStore((s) => s.game?.profile.settings.reduceMotion ?? 'system');
  if (pref === 'always') return true;
  if (pref === 'never') return false;
  return system;
}
