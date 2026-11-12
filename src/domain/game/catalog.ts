/**
 * Entrega do catálogo: o que o jogador já fez por merecer e ainda não recebeu.
 *
 * Quando o catálogo cresce (o remake do Áster triplicou a coleção), quem já joga passou de níveis
 * e cumpriu feitos que agora dão peça. Nada disso se perde: ao abrir o app, toda peça de nível já
 * alcançado e de feito já cumprido entra na coleção — de uma vez, numa remessa, sem trocar o que
 * está equipado e sem uma cerimônia por peça.
 *
 * É idempotente: peça que já está na coleção não é dada de novo, e cada feito tem a sua chave.
 */
import { levelForXp } from '../progression/levels';
import { LEVEL_ITEM_TABLE } from '../progression/rewards';
import { grantFeats } from './feats';
import { grantItem, type Shipped } from './grant';
import type { Tx } from './tx';

export function deliverCatalog(tx: Tx, now: number): Shipped[] {
  const shipment: Shipped[] = [];
  const reached = levelForXp(tx.profile.xp);
  for (const [level, itemIds] of Object.entries(LEVEL_ITEM_TABLE)) {
    if (Number(level) > reached) continue;
    for (const itemId of itemIds) grantItem(tx, itemId, `level:${level}`, now, shipment);
  }
  grantFeats(tx, now, shipment);
  if (shipment.length > 0) tx.emit({ type: 'shipment', items: shipment });
  return shipment;
}
