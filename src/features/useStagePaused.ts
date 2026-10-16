/**
 * O astrolábio de uma aba deve parar quando ninguém o vê: aba fora de foco (as abas
 * visitadas continuam montadas, e a questão/batalha abre por cima delas) ou coberta
 * por uma celebração ou revelação de item.
 */
import { useIsFocused } from 'expo-router';
import { useGameStore } from '../state/store';

export function useStagePaused(): boolean {
  const focused = useIsFocused();
  const covered = useGameStore((s) => s.celebrations.length > 0 || s.reveals.length > 0);
  return !focused || covered;
}
