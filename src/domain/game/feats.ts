/**
 * Feitos: recompensas por marcos de jogo (Ecos superados, estrelas, chefões). Cada feito
 * concede itens uma única vez (chave `feat:<id>` no registro) e vale retroativamente — quem
 * já cumpriu o marco antes do feito existir recebe o item na próxima verificação.
 *
 * A verificação roda ao fim de cada sessão e de cada batalha vencida, nunca no meio de uma
 * questão: a revelação do item não interrompe quem está concentrado.
 */
import { BOSSES } from '../../content/bosses';
import { echoesBeatenCount } from '../learning/srs';
import { grantItem, once } from './grant';
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

export const FEATS: Feat[] = [
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

/** Texto da origem de um item concedido por feito (`feat:<id>`), ou null se não for um. */
export function featSourceLabel(source: string): string | null {
  if (!source.startsWith('feat:')) return null;
  return FEATS.find((f) => `feat:${f.id}` === source)?.label ?? null;
}

/** Concede os itens de todo feito cumprido que ainda não pagou. */
export function grantFeats(tx: Tx, now: number) {
  for (const feat of FEATS) {
    if (tx.hasLedger(`feat:${feat.id}`) || !feat.done(tx.state)) continue;
    once(tx, `feat:${feat.id}`, now, () => {
      for (const itemId of feat.itemIds) grantItem(tx, itemId, `feat:${feat.id}`, now);
    });
  }
}
