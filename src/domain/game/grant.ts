import { getItem, STARTER_ITEMS } from '../../content/items';
import { levelForXp } from '../progression/levels';
import { applyRested } from '../progression/rested';
import { rewardsForLevel, type Reward } from '../progression/rewards';
import type { XpKind } from '../progression/xp';
import type { Tx } from './tx';

type XpSource = XpKind | 'session' | 'mission' | 'boss';

/**
 * Concede XP (com bônus de descanso opcional), processa subidas de nível e as
 * recompensas de cada nível atravessado — cada uma protegida pela chave `level:N`.
 * Retorna o total efetivamente concedido (XP + bônus).
 */
export function grantXp(
  tx: Tx,
  amount: number,
  source: XpSource,
  now: number,
  useRested: boolean,
): number {
  if (amount <= 0) return 0;
  const p = tx.profile;
  const { bonus, pool } = useRested ? applyRested(amount, p.restedPool) : { bonus: 0, pool: p.restedPool };
  const total = amount + bonus;
  const fromLevel = levelForXp(p.xp);
  const toLevel = levelForXp(p.xp + total);
  tx.patchProfile({ xp: p.xp + total, restedPool: pool });
  tx.emit({ type: 'xp', amount, restedBonus: bonus, source });

  if (toLevel > fromLevel) {
    const granted: { level: number; rewards: Reward[] }[] = [];
    for (let level = fromLevel + 1; level <= toLevel; level++) {
      const key = `level:${level}`;
      if (tx.hasLedger(key)) continue;
      const rewards = rewardsForLevel(level);
      tx.addLedger(key, now);
      for (const r of rewards) applyReward(tx, r, key, now);
      granted.push({ level, rewards });
    }
    tx.emit({ type: 'levelUp', from: fromLevel, to: toLevel, rewards: granted });
  }
  return total;
}

export function grantInk(tx: Tx, amount: number) {
  if (amount <= 0) return;
  tx.patchProfile({ ink: tx.profile.ink + amount });
  tx.emit({ type: 'ink', amount });
}

function applyReward(tx: Tx, reward: Reward, source: string, now: number) {
  if (reward.kind === 'ink') grantInk(tx, reward.amount);
  else grantItem(tx, reward.itemId, source, now);
}

const STARTERS = new Set<string>(STARTER_ITEMS);

/**
 * Adiciona um item ao inventário (no-op se já possuído). Equipa automaticamente
 * quando o espaço está vazio ou ocupado por um item inicial — assim a primeira
 * recompensa aparece no personagem na hora, sem desfazer escolhas do jogador.
 */
export function grantItem(tx: Tx, itemId: string, source: string, now: number) {
  if (tx.state.inventory[itemId]) return;
  const item = getItem(itemId);
  tx.addInventory({ itemId, acquiredAt: now, source });
  const current = tx.profile.equipped[item.slot];
  const autoEquip = current === null || STARTERS.has(current);
  if (autoEquip) tx.patchProfile({ equipped: { ...tx.profile.equipped, [item.slot]: itemId } });
  tx.emit({ type: 'item', itemId, source, autoEquipped: autoEquip, slot: item.slot });
}

/** Executa `fn` apenas se a chave ainda não estiver no registro; registra-a. */
export function once(tx: Tx, key: string, now: number, fn: () => void): boolean {
  if (tx.hasLedger(key)) return false;
  tx.addLedger(key, now);
  fn();
  return true;
}
