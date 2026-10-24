/**
 * Diferença entre dois GameStates como Delta de gravação. Usada quando o estado muda por fora das
 * ações do jogo (resultado de uma sincronização): só as chaves alteradas vão ao SQLite.
 */
import type { Delta, GameState } from '../domain/game/types';
import { emptyDelta } from '../domain/game/tx';
import { stableStringify } from './snapshot';

const differs = (a: unknown, b: unknown): boolean => a !== b && stableStringify(a) !== stableStringify(b);

function changedKeys<T>(prev: Record<string, T>, next: Record<string, T>): string[] {
  return Object.keys(next).filter((k) => differs(prev[k], next[k]));
}

/**
 * Atenção: o repositório grava ledger e inventário com INSERT OR IGNORE (só chaves novas) — o merge
 * nunca remove nem renomeia essas chaves, então "novas" é tudo que importa. Remoções só acontecem em
 * `replaceAll` (reinício adotado), que reescreve tudo.
 */
export function diffDelta(prev: GameState, next: GameState): Delta {
  const d = emptyDelta();
  d.profile = differs(prev.profile, next.profile);
  d.questionStates = changedKeys(prev.questionStates, next.questionStates);
  d.ledger = Object.keys(next.ledger).filter((k) => !(k in prev.ledger));
  d.inventory = Object.keys(next.inventory).filter((k) => !(k in prev.inventory));
  d.campaign = changedKeys(prev.campaign, next.campaign);
  d.bosses = changedKeys(prev.bosses, next.bosses);
  d.session = differs(prev.session, next.session);
  d.battle = differs(prev.battle, next.battle);
  d.quests = differs(prev.quests, next.quests);
  d.academy = changedKeys(prev.academy, next.academy);
  return d;
}
