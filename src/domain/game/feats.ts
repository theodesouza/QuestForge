/**
 * Feitos: recompensas por marcos de jogo (Ecos superados, estrelas, chefões). Cada feito
 * concede itens uma única vez (chave `feat:<id>` no registro) e vale retroativamente — quem
 * já cumpriu o marco antes do feito existir recebe o item na próxima verificação.
 *
 * A verificação roda ao fim de cada sessão e de cada batalha vencida, nunca no meio de uma
 * questão: a revelação do item não interrompe quem está concentrado.
 */
import { LESSONS } from '../../content/academy/catalog';
import { ASTER_ITEMS, FEAT_TEXT, type FeatId } from '../../content/aster';
import { BOSSES } from '../../content/bosses';
import { getItem, type ItemSlot } from '../../content/items';
import { REGIONS } from '../../content/regions';
import { lessonSealed } from '../academy/progress';
import { echoesBeatenCount } from '../learning/srs';
import { grantItem, once, type Shipped } from './grant';
import type { Tx } from './tx';
import type { GameState } from './types';

export interface Feat {
  id: string;
  /** Como o feito aparece na revelação do item ("Feito: …"). */
  label: string;
  itemIds: string[];
  done: (state: GameState) => boolean;
}

const bossWon = (bossId: string) => (s: GameState) => (s.bosses[bossId]?.wins ?? 0) > 0;
const allBossesFlawless = (s: GameState) => BOSSES.every((b) => s.bosses[b.id]?.flawless === true);
const threeStarMissions = (s: GameState) => Object.values(s.campaign).filter((n) => n.bestStars >= 3).length;

const LEGACY_FEATS: Feat[] = [
  { id: 'scene:golem-proporcional', label: 'Espólio do Golem Proporcional', itemIds: ['scene-pedreira'], done: bossWon('golem-proporcional') },
  { id: 'scene:mercador-composto', label: 'Espólio do Mercador Composto', itemIds: ['scene-mercado'], done: bossWon('mercador-composto') },
  { id: 'scene:quimera-fracionaria', label: 'Espólio da Quimera Fracionária', itemIds: ['scene-planicie'], done: bossWon('quimera-fracionaria') },
  { id: 'scene:colosso-euclidiano', label: 'Espólio do Colosso Euclidiano', itemIds: ['scene-torres'], done: bossWon('colosso-euclidiano') },
  { id: 'scene:arquiteto-dos-solidos', label: 'Espólio do Arquiteto dos Sólidos', itemIds: ['scene-cavernas'], done: bossWon('arquiteto-dos-solidos') },
  { id: 'scene:leviata-dos-graficos', label: 'Espólio do Leviatã dos Gráficos', itemIds: ['scene-mirante'], done: bossWon('leviata-dos-graficos') },
  { id: 'scene:esfinge-do-acaso', label: 'Espólio da Esfinge do Acaso', itemIds: ['scene-labirinto'], done: bossWon('esfinge-do-acaso') },
  { id: 'scene:hidra-das-funcoes', label: 'Espólio da Hidra das Funções', itemIds: ['scene-cordilheira'], done: bossWon('hidra-das-funcoes') },
  { id: 'scene:leviata-das-escalas', label: 'Espólio do Leviatã das Escalas', itemIds: ['scene-ilhas'], done: bossWon('leviata-das-escalas') },
  { id: 'echoes:10', label: 'Feito: 10 Ecos superados', itemIds: ['title-cacador-ecos'], done: (s) => echoesBeatenCount(s.questionStates) >= 10 },
  { id: 'echoes:40', label: 'Feito: 40 Ecos superados', itemIds: ['title-senhor-ecos'], done: (s) => echoesBeatenCount(s.questionStates) >= 40 },
  { id: 'answers:1000', label: 'Feito: 1000 questões respondidas', itemIds: ['title-mil-passos'], done: (s) => s.profile.totals.answered >= 1000 },
  { id: 'stars:6', label: 'Feito: 3 estrelas em 6 missões', itemIds: ['title-estrelado'], done: (s) => threeStarMissions(s) >= 6 },
  { id: 'legend', label: 'Feito lendário: todos os chefões, sem errar', itemIds: ['scene-cosmos', 'title-lenda'], done: allBossesFlawless },
];


// ————————————————————————————————————————————————————— feitos do Áster

const HOUR = 60 * 60 * 1000;
const MISSIONS = REGIONS.flatMap((r) => r.nodes.filter((n) => n.kind === 'mission'));
const totals = (s: GameState) => s.profile.totals;
const missionsDone = (s: GameState) => MISSIONS.filter((n) => s.campaign[n.id]?.completedAt != null).length;
const starSum = (s: GameState) => MISSIONS.reduce((sum, n) => sum + (s.campaign[n.id]?.bestStars ?? 0), 0);
const regionPerfect = (regionId: string) => (s: GameState) => {
  const missions = REGIONS.find((r) => r.id === regionId)?.nodes.filter((n) => n.kind === 'mission') ?? [];
  return missions.length > 0 && missions.every((n) => (s.campaign[n.id]?.bestStars ?? 0) >= 3);
};
const bossesBeaten = (s: GameState) => BOSSES.filter((b) => (s.bosses[b.id]?.wins ?? 0) > 0).length;
const bossesFlawless = (s: GameState) => BOSSES.filter((b) => s.bosses[b.id]?.flawless === true).length;
const bossWins = (s: GameState) => Object.values(s.bosses).reduce((sum, b) => sum + b.wins, 0);
/** Golpes da vitória mais rápida que conta como "veloz". */
export const SWIFT_TURNS = 9;
const swift = (s: GameState) => Object.values(s.bosses).some((b) => b.bestTurns !== null && b.bestTurns <= SWIFT_TURNS);
const stagesMastered = (s: GameState) => Object.values(s.academy).filter((p) => p.masteredAt !== null).length;
const seals = (s: GameState) => LESSONS.filter((l) => lessonSealed(l, s.academy)).length;
const owned = (s: GameState) => Object.keys(s.inventory).length;
const slotOf = new Map<string, ItemSlot>();
const ownedIn = (slot: ItemSlot) => (s: GameState) =>
  Object.keys(s.inventory).filter((id) => {
    if (!slotOf.has(id)) {
      try {
        slotOf.set(id, getItem(id).slot);
      } catch {
        return false; // peça de uma versão mais nova: não conta, mas também não quebra
      }
    }
    return slotOf.get(id) === slot;
  }).length;
/** Baús abertos: cada quadro de encomendas completo deixa uma chave `quest:<período>:<quadro>:bonus`. */
const chests = (period: 'daily' | 'weekly') => (s: GameState) => Object.keys(s.ledger).filter((k) => k.startsWith(`quest:${period}:`) && k.endsWith(':bonus')).length;
const accuracy = (min: number, rate: number) => (s: GameState) => totals(s).answered >= min && totals(s).correct / totals(s).answered >= rate;
const forged = (s: GameState) => Object.values(s.inventory).filter((e) => e.source === 'oficina').length;

/** A regra de cada feito novo, lida do próprio id (`tipo:alvo`). Um id sem regra é erro de catálogo. */
function ruleFor(id: FeatId): (s: GameState) => boolean {
  const [kind, arg = ''] = id.split(':');
  const n = parseInt(arg, 10);
  const atLeast = (count: (s: GameState) => number) => (s: GameState) => count(s) >= n;
  switch (kind) {
    case 'answers':
      return atLeast((s) => totals(s).answered);
    case 'correct':
      return atLeast((s) => totals(s).correct);
    case 'time':
      return (s) => totals(s).timeMs >= n * HOUR;
    case 'sessions':
      return atLeast((s) => totals(s).sessions);
    case 'missions':
      return atLeast(missionsDone);
    case 'starsum':
      return atLeast(starSum);
    case 'stars3':
      return atLeast(threeStarMissions);
    case 'region':
      return regionPerfect(arg);
    case 'bosses':
      return atLeast(bossesBeaten);
    case 'flawless':
      return atLeast(bossesFlawless);
    case 'bosswins':
      return atLeast(bossWins);
    case 'swift':
      return swift;
    case 'echoes':
      return atLeast((s) => echoesBeatenCount(s.questionStates));
    case 'stages':
      return atLeast(stagesMastered);
    case 'seals':
      return atLeast(seals);
    case 'collect':
      if (arg === 'cores10') return (s) => ownedIn('core')(s) >= 10;
      if (arg === 'skies8') return (s) => ownedIn('scene')(s) >= 8;
      return atLeast(owned);
    case 'daily':
      return atLeast(chests('daily'));
    case 'weekly':
      return atLeast(chests('weekly'));
    case 'accuracy':
      return n >= 90 ? accuracy(500, 0.9) : accuracy(200, 0.8);
    case 'shop':
      return atLeast(forged);
    default:
      throw new Error(`Feito sem regra: ${id}`);
  }
}

/** Um feito por id de `FEAT_TEXT` que alguma peça use; as peças vêm da ficha (`get`). */
const ASTER_FEATS: Feat[] = (Object.keys(FEAT_TEXT) as FeatId[])
  .map((id) => ({
    id,
    label: FEAT_TEXT[id].label,
    itemIds: ASTER_ITEMS.filter((i) => i.get.by === 'feat' && i.get.feat === id).map((i) => i.id),
    done: ruleFor(id),
  }))
  .filter((f) => f.itemIds.length > 0);

export const FEATS: Feat[] = [...LEGACY_FEATS, ...ASTER_FEATS];

/** Texto da origem de um item concedido por feito (`feat:<id>`), ou null se não for um. */
export function featSourceLabel(source: string): string | null {
  if (!source.startsWith('feat:')) return null;
  return FEATS.find((f) => `feat:${f.id}` === source)?.label ?? null;
}

/**
 * Concede os itens de todo feito cumprido que ainda não pagou. Repete até não sobrar nada:
 * um feito de coleção ("tenha 50 peças") pode se cumprir com as peças que outro acabou de dar.
 * Com `shipment`, as peças entram caladas na coleção e são anotadas na remessa (ver grantItem).
 */
export function grantFeats(tx: Tx, now: number, shipment?: Shipped[]) {
  for (let pass = 0; pass < 8; pass++) {
    let paid = false;
    for (const feat of FEATS) {
      const key = `feat:${feat.id}`;
      if (tx.hasLedger(key) || !feat.done(tx.state)) continue;
      once(tx, key, now, () => {
        for (const itemId of feat.itemIds) grantItem(tx, itemId, key, now, shipment);
      });
      paid = true;
    }
    if (!paid) return;
  }
}
