/**
 * Motor de batalha determinístico. Nenhum elemento de sorte: o dano depende
 * apenas da dificuldade, do combo, das dicas e da mecânica do chefão
 * (couraça do Golem, cofre de juros do Mercador, cabeças da Quimera, vértices do Colosso,
 * concreto do Arquiteto).
 */
import type { BossDef, BossFacet, BossHead } from '../../content/bosses';
import type { AltKey, Difficulty } from '../../content/types';
import { hintMultiplier, GUESS_MULT } from '../progression/xp';

export type BattleStatus = 'active' | 'won' | 'retreated';

export interface BattleTurn {
  questionId: string;
  correct: boolean;
  guessed: boolean;
  hints: number;
  damage: number;
  technique: boolean;
  /** A mecânica do chefão quebrou neste turno (início da fase 2). */
  armorBroke: boolean;
  /** Vida recuperada pelo chefão neste turno ("juros" ou regeneração). Ausente em batalhas da v0.1.0. */
  healed?: number;
  /** Cabeças que caíram neste turno (Quimera). Ausente nos demais chefões. */
  headsFelled?: number;
  /** Alternativa escolhida (para rever o golpe depois). Ausente em batalhas gravadas antes. */
  chosen?: AltKey;
  /** Colosso: vértice (face) a que a pergunta pertencia. */
  facet?: string;
  /** Colosso: vértice que rachou neste turno. */
  facetCracked?: string;
  /** Colosso: um erro reajustou o vértice (tirou um acerto). */
  facetRepaired?: boolean;
  /** Arquiteto: camadas de concreto depois deste turno. */
  layers?: number;
  /** Esfinge do Acaso: este turno foi um Enigma. */
  riddle?: boolean;
  /** Leviatã dos Gráficos: escamas depois deste turno. */
  scales?: number;
  /** Leviatã: escamas arrancadas por este acerto. */
  scalesTorn?: number;
  /** Leviatã: escamas que cresceram de volta por causa do erro. */
  scalesRegrown?: number;
  /** Arquiteto: uma camada foi despejada por um erro neste turno. */
  layerAdded?: boolean;
  /** Arquiteto: camadas que a Técnica (ou a fase 2) quebrou neste turno. */
  layersBroken?: number;
}

export interface BattleState {
  id: string;
  bossId: string;
  startedAt: number;
  hp: number;
  maxHp: number;
  resolve: number;
  maxResolve: number;
  /** Fase 2: a mecânica do chefão (couraça, cofre…) foi quebrada. */
  armorBroken: boolean;
  combo: number;
  maxCombo: number;
  /** +10% de dano por tentativa anterior sem vitória (até +30%). */
  knowledgeBonus: number;
  currentQuestionId: string | null;
  usedQuestionIds: string[];
  turns: BattleTurn[];
  status: BattleStatus;
  xpEarned: number;
  /** Colosso: acertos acumulados em cada vértice (até `hitsToCrack`). Ausente nos demais. */
  facetHits?: Record<string, number>;
  /** Arquiteto: camadas de concreto atuais. Ausente nos demais. */
  layers?: number;
  /** Leviatã dos Gráficos: escamas atuais. Ausente nos demais. */
  scales?: number;
}

export const KNOWLEDGE_PER_ATTEMPT = 0.1;
export const KNOWLEDGE_CAP = 0.3;

export function createBattle(
  boss: BossDef,
  id: string,
  now: number,
  previousFailedAttempts: number,
): BattleState {
  return {
    id,
    bossId: boss.id,
    startedAt: now,
    hp: boss.maxHp,
    maxHp: boss.maxHp,
    resolve: boss.resolve,
    maxResolve: boss.resolve,
    armorBroken: false,
    combo: 0,
    maxCombo: 0,
    knowledgeBonus: Math.min(KNOWLEDGE_CAP, Math.max(0, previousFailedAttempts) * KNOWLEDGE_PER_ATTEMPT),
    currentQuestionId: null,
    usedQuestionIds: [],
    turns: [],
    status: 'active',
    xpEarned: 0,
    ...(boss.trait.kind === 'facets' ? { facetHits: {} } : {}),
    ...(boss.trait.kind === 'concrete' ? { layers: 0 } : {}),
    ...(boss.trait.kind === 'scales' ? { scales: boss.trait.maxScales } : {}),
  };
}

export function comboMultiplier(comboAfterHit: number): number {
  return 1 + 0.15 * Math.min(Math.max(0, comboAfterHit - 1), 3);
}

export interface DamageInput {
  difficulty: Difficulty;
  hints: number;
  guessed: boolean;
  /** Subassunto da pergunta (vértices do Colosso). */
  subtopic?: string;
}

export function computeDamage(boss: BossDef, battle: BattleState, input: DamageInput) {
  const comboAfter = battle.combo + 1;
  const technique = comboAfter % boss.technique.every === 0;
  let dmg = boss.damage[input.difficulty];
  const armored = boss.trait.kind === 'armor' && !battle.armorBroken && input.difficulty === 1;
  if (boss.trait.kind === 'armor' && armored) dmg *= boss.trait.easyMultiplier;
  dmg *= comboMultiplier(comboAfter);
  dmg *= hintMultiplier(input.hints);
  if (input.guessed) dmg *= GUESS_MULT;
  dmg *= 1 + battle.knowledgeBonus;
  dmg *= facetMultiplier(boss, battle, input.subtopic);
  dmg *= scalesMultiplier(boss, battle);
  if (boss.trait.kind === 'riddle' && isRiddleTurn(boss, battle)) dmg *= boss.trait.damageMultiplier;
  // A Técnica ignora o concreto (e o quebra); os golpes comuns pagam o preço das camadas.
  if (!technique) dmg *= concreteMultiplier(boss, battle);
  const total = Math.round(dmg) + (technique ? boss.technique.bonus : 0);
  return { damage: total, technique, armored };
}

/** Escalada da dificuldade-alvo a cada turno. */
export function battleTarget(boss: BossDef, battle: BattleState): number {
  // O Enigma da Esfinge é sempre um nível mais difícil.
  return Math.min(4, boss.startTarget + battle.turns.length * boss.targetStep + (isRiddleTurn(boss, battle) ? 1 : 0));
}

export interface BattleAnswer {
  questionId: string;
  chosen?: AltKey;
  difficulty: Difficulty;
  correct: boolean;
  guessed: boolean;
  hints: number;
  /** Subassunto da pergunta: necessário para o Colosso saber qual vértice foi atingido. */
  subtopic?: string;
}

export function applyBattleAnswer(boss: BossDef, battle: BattleState, answer: BattleAnswer) {
  if (battle.status !== 'active') throw new Error('Batalha encerrada');
  if (battle.currentQuestionId !== answer.questionId) throw new Error('Questão fora de turno');

  const next: BattleState = {
    ...battle,
    turns: battle.turns.slice(),
    usedQuestionIds: battle.usedQuestionIds.includes(answer.questionId)
      ? battle.usedQuestionIds
      : [...battle.usedQuestionIds, answer.questionId],
    currentQuestionId: null,
  };
  let turn: BattleTurn;

  const trait = boss.trait;
  if (answer.correct) {
    const { damage, technique } = computeDamage(boss, battle, answer);
    next.hp = Math.max(0, battle.hp - damage);
    next.combo = battle.combo + 1;
    next.maxCombo = Math.max(battle.maxCombo, next.combo);
    turn = { ...pick(answer), damage, technique, armorBroke: false, healed: 0 };
    if (trait.kind === 'riddle' && isRiddleTurn(boss, battle)) turn.riddle = true;
    let armorBroke: boolean;
    if (trait.kind === 'facets') {
      // Cada acerto num vértice intacto o aproxima da rachadura; com os três rachados, o Colosso fica exposto.
      const facet = facetOf(boss, answer.subtopic);
      if (facet) {
        turn.facet = facet.id;
        const hits = facetHitsOf(battle)[facet.id] ?? 0;
        if (hits < trait.hitsToCrack) {
          next.facetHits = { ...facetHitsOf(battle), [facet.id]: hits + 1 };
          if (hits + 1 >= trait.hitsToCrack) turn.facetCracked = facet.id;
        }
      }
      armorBroke = !battle.armorBroken && allFacetsCracked(boss, next);
    } else if (trait.kind === 'scales') {
      // Cada acerto arranca uma escama (a Técnica, duas); sem nenhuma, o Leviatã fica exposto.
      const before = scalesOf(boss, battle);
      const after = Math.max(0, before - (technique ? 2 : 1));
      next.scales = after;
      turn.scales = after;
      if (before > after) turn.scalesTorn = before - after;
      armorBroke = !battle.armorBroken && after === 0;
    } else {
      armorBroke = !battle.armorBroken && next.hp <= boss.maxHp * trait.breaksAtHpRatio;
    }
    if (armorBroke) next.armorBroken = true;
    turn.armorBroke = armorBroke;
    if (trait.kind === 'heads') turn.headsFelled = headsFelled(boss, next.hp) - headsFelled(boss, battle.hp);
    if (trait.kind === 'concrete') {
      const before = concreteLayers(battle);
      // A Técnica quebra o concreto; a fase 2 também (ele racha e escorre).
      if (before > 0 && (technique || armorBroke)) {
        next.layers = 0;
        turn.layersBroken = before;
      }
      turn.layers = concreteLayers(next);
    }
    if (next.hp === 0) next.status = 'won';
  } else {
    next.combo = 0;
    const riddle = trait.kind === 'riddle' && isRiddleTurn(boss, battle);
    next.resolve = Math.max(0, battle.resolve - (trait.kind === 'riddle' && riddle ? trait.missResolve : 1));
    const healed = missHeal(boss, battle);
    next.hp = Math.min(boss.maxHp, battle.hp + healed);
    turn = { ...pick(answer), damage: 0, technique: false, armorBroke: false, healed };
    if (riddle) turn.riddle = true;
    if (trait.kind === 'facets') {
      // O Colosso reajusta o vértice atingido: perde um acerto, se ainda não tinha rachado.
      const facet = facetOf(boss, answer.subtopic);
      if (facet) {
        turn.facet = facet.id;
        const hits = facetHitsOf(battle)[facet.id] ?? 0;
        if (hits > 0 && hits < trait.hitsToCrack) {
          next.facetHits = { ...facetHitsOf(battle), [facet.id]: hits - 1 };
          turn.facetRepaired = true;
        }
      }
    }
    if (trait.kind === 'scales') {
      const before = scalesOf(boss, battle);
      const after = Math.min(trait.maxScales, before + trait.regrow);
      next.scales = after;
      turn.scales = after;
      if (after > before) turn.scalesRegrown = after - before;
    }
    if (trait.kind === 'concrete' && !battle.armorBroken) {
      const before = concreteLayers(battle);
      next.layers = Math.min(trait.maxLayers, before + 1);
      if (next.layers > before) turn.layerAdded = true;
      turn.layers = next.layers;
    } else if (trait.kind === 'concrete') {
      turn.layers = concreteLayers(battle);
    }
    if (next.resolve <= 0) next.status = 'retreated';
  }
  next.turns.push(turn);
  return { battle: next, turn };
}

/** Erros seguidos no fim da batalha, contando o erro atual. */
export function missStreak(battle: BattleState): number {
  let n = 1;
  for (let i = battle.turns.length - 1; i >= 0 && !battle.turns[i].correct; i--) n++;
  return n;
}

/** Cofre de juros: enquanto inteiro, cada erro devolve vida ao chefão, crescendo com erros seguidos. */
export function interestHeal(boss: BossDef, battle: BattleState): number {
  if (boss.trait.kind !== 'interest' || battle.armorBroken) return 0;
  const heal = Math.round(boss.maxHp * boss.trait.healRatio * missStreak(battle));
  return Math.max(0, Math.min(heal, boss.maxHp - battle.hp));
}

// ———————————————————————————————————————————————— Quimera: cabeças como frações da vida

export interface HeadSpan {
  index: number;
  head: BossHead;
  /** A cabeça cai quando a vida chega a este valor (ou menos). */
  floorHp: number;
  /** Topo da cabeça: o máximo que ela pode regenerar. */
  ceilHp: number;
}

/** Faixas de vida de cada cabeça, de cima para baixo. Vazio para chefões sem cabeças. */
export function headSpans(boss: BossDef): HeadSpan[] {
  if (boss.trait.kind !== 'heads') return [];
  const heads = boss.trait.heads;
  let remaining = 1;
  let ceil = boss.maxHp;
  return heads.map((head, index) => {
    remaining -= head.share[0] / head.share[1];
    const floorHp = index === heads.length - 1 ? 0 : Math.max(0, Math.round(boss.maxHp * remaining));
    const span = { index, head, floorHp, ceilHp: ceil };
    ceil = floorHp;
    return span;
  });
}

/** Índice da cabeça de pé (a última, quando só resta ela). */
export function activeHeadIndex(boss: BossDef, hp: number): number {
  const spans = headSpans(boss);
  const i = spans.findIndex((s) => hp > s.floorHp);
  return i < 0 ? Math.max(0, spans.length - 1) : i;
}

/** Quantas cabeças já caíram para esta vida. */
export function headsFelled(boss: BossDef, hp: number): number {
  return headSpans(boss).filter((s) => hp <= s.floorHp).length;
}

/** Regeneração: a cabeça de pé recupera um pouco, nunca além do topo dela. */
export function headRegen(boss: BossDef, battle: BattleState): number {
  if (boss.trait.kind !== 'heads') return 0;
  const span = headSpans(boss)[activeHeadIndex(boss, battle.hp)];
  const heal = Math.round(boss.maxHp * boss.trait.healRatio);
  return Math.max(0, Math.min(heal, span.ceilHp - battle.hp));
}

// ———————————————————————————————————————————————— Colosso: vértices que racham

export function facetOf(boss: BossDef, subtopic?: string): BossFacet | null {
  if (boss.trait.kind !== 'facets' || !subtopic) return null;
  return boss.trait.facets.find((f) => f.subtopics.includes(subtopic)) ?? null;
}

/** Acertos acumulados em cada vértice (vazio em batalhas de outros chefões). */
export function facetHitsOf(battle: BattleState): Record<string, number> {
  return battle.facetHits ?? {};
}

export function isFacetCracked(boss: BossDef, battle: BattleState, facetId: string): boolean {
  return boss.trait.kind === 'facets' && (facetHitsOf(battle)[facetId] ?? 0) >= boss.trait.hitsToCrack;
}

export function crackedFacetCount(boss: BossDef, battle: BattleState): number {
  return boss.trait.kind === 'facets' ? boss.trait.facets.filter((f) => isFacetCracked(boss, battle, f.id)).length : 0;
}

export function allFacetsCracked(boss: BossDef, battle: BattleState): boolean {
  return boss.trait.kind === 'facets' && crackedFacetCount(boss, battle) === boss.trait.facets.length;
}

/** Vértice que faz a próxima pergunta: rodízio entre os que ainda estão intactos (null = todos rachados). */
export function nextFacet(boss: BossDef, battle: BattleState): BossFacet | null {
  if (boss.trait.kind !== 'facets') return null;
  const intact = boss.trait.facets.filter((f) => !isFacetCracked(boss, battle, f.id));
  return intact.length ? intact[battle.turns.length % intact.length] : null;
}

/** Dano do golpe: reduzido no vértice intacto, ampliado com o Colosso exposto. */
export function facetMultiplier(boss: BossDef, battle: BattleState, subtopic?: string): number {
  if (boss.trait.kind !== 'facets') return 1;
  if (allFacetsCracked(boss, battle)) return boss.trait.exposedMultiplier;
  const facet = facetOf(boss, subtopic);
  return facet && !isFacetCracked(boss, battle, facet.id) ? boss.trait.intactMultiplier : 1;
}

// ———————————————————————————————————————————————— Esfinge do Acaso: Enigma

/** De quantos em quantos golpes vem o Enigma agora (0 em chefões sem Enigma). */
export function riddleEvery(boss: BossDef, battle: BattleState): number {
  return boss.trait.kind === 'riddle' ? (battle.armorBroken ? boss.trait.phase2Every : boss.trait.every) : 0;
}

/** O golpe que está para ser dado (o da pergunta atual) é um Enigma? */
export function isRiddleTurn(boss: BossDef, battle: BattleState): boolean {
  const every = riddleEvery(boss, battle);
  return every > 0 && (battle.turns.length + 1) % every === 0;
}

/** Quantos golpes faltam para o próximo Enigma (0 = o golpe atual). */
export function turnsToRiddle(boss: BossDef, battle: BattleState): number {
  const every = riddleEvery(boss, battle);
  return every > 0 ? (every - ((battle.turns.length + 1) % every)) % every : 0;
}

// ———————————————————————————————————————————————— Leviatã dos Gráficos: escamas

/** Escamas que ainda cobrem o Leviatã (zero em batalhas de outros chefões). */
export function scalesOf(boss: BossDef, battle: BattleState): number {
  return boss.trait.kind === 'scales' ? (battle.scales ?? boss.trait.maxScales) : 0;
}

/** Dano do golpe: reduzido pelas escamas, ampliado com o Leviatã exposto. */
export function scalesMultiplier(boss: BossDef, battle: BattleState): number {
  if (boss.trait.kind !== 'scales') return 1;
  return scalesOf(boss, battle) > 0 ? boss.trait.scaledMultiplier : boss.trait.exposedMultiplier;
}

// ———————————————————————————————————————————————— Arquiteto: camadas de concreto

export function concreteLayers(battle: BattleState): number {
  return battle.layers ?? 0;
}

/** Cada camada tira uma fração do dano dos golpes comuns. */
export function concreteMultiplier(boss: BossDef, battle: BattleState): number {
  if (boss.trait.kind !== 'concrete') return 1;
  return Math.max(0, 1 - boss.trait.layerPenalty * concreteLayers(battle));
}

/** Vida que o chefão recupera a cada erro do jogador (juros do Mercador ou regeneração da Quimera). */
export function missHeal(boss: BossDef, battle: BattleState): number {
  return boss.trait.kind === 'heads' ? headRegen(boss, battle) : interestHeal(boss, battle);
}

function pick(a: BattleAnswer) {
  return { questionId: a.questionId, correct: a.correct, guessed: a.guessed, hints: a.hints, ...(a.chosen ? { chosen: a.chosen } : {}) };
}

export function isFlawless(battle: BattleState): boolean {
  return (
    battle.status === 'won' &&
    battle.turns.every((t) => t.correct && t.hints === 0 && !t.guessed)
  );
}
