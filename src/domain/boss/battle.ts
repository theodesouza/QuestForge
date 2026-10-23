/**
 * Motor de batalha determinístico. Nenhum elemento de sorte: o dano depende
 * apenas da dificuldade, do combo, das dicas e da mecânica do chefão
 * (couraça do Golem, cofre de juros do Mercador, cabeças da Quimera).
 */
import type { BossDef, BossHead } from '../../content/bosses';
import type { Difficulty } from '../../content/types';
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
  /** Preparo na Academia: etapas dominadas das aulas do chefão (até +15%). Ausente em batalhas antigas. */
  prepBonus?: number;
  currentQuestionId: string | null;
  usedQuestionIds: string[];
  turns: BattleTurn[];
  status: BattleStatus;
  xpEarned: number;
}

export const KNOWLEDGE_PER_ATTEMPT = 0.1;
export const KNOWLEDGE_CAP = 0.3;

export function createBattle(
  boss: BossDef,
  id: string,
  now: number,
  previousFailedAttempts: number,
  prepBonus = 0,
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
    prepBonus: Math.max(0, prepBonus),
    currentQuestionId: null,
    usedQuestionIds: [],
    turns: [],
    status: 'active',
    xpEarned: 0,
  };
}

export function comboMultiplier(comboAfterHit: number): number {
  return 1 + 0.15 * Math.min(Math.max(0, comboAfterHit - 1), 3);
}

export interface DamageInput {
  difficulty: Difficulty;
  hints: number;
  guessed: boolean;
}

export function computeDamage(boss: BossDef, battle: BattleState, input: DamageInput) {
  const comboAfter = battle.combo + 1;
  let dmg = boss.damage[input.difficulty];
  const armored = boss.trait.kind === 'armor' && !battle.armorBroken && input.difficulty === 1;
  if (boss.trait.kind === 'armor' && armored) dmg *= boss.trait.easyMultiplier;
  dmg *= comboMultiplier(comboAfter);
  dmg *= hintMultiplier(input.hints);
  if (input.guessed) dmg *= GUESS_MULT;
  dmg *= 1 + battle.knowledgeBonus + (battle.prepBonus ?? 0);
  const technique = comboAfter % boss.technique.every === 0;
  const total = Math.round(dmg) + (technique ? boss.technique.bonus : 0);
  return { damage: total, technique, armored };
}

/** Escalada da dificuldade-alvo a cada turno. */
export function battleTarget(boss: BossDef, battle: BattleState): number {
  return Math.min(4, boss.startTarget + battle.turns.length * boss.targetStep);
}

export interface BattleAnswer {
  questionId: string;
  difficulty: Difficulty;
  correct: boolean;
  guessed: boolean;
  hints: number;
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

  if (answer.correct) {
    const { damage, technique } = computeDamage(boss, battle, answer);
    next.hp = Math.max(0, battle.hp - damage);
    next.combo = battle.combo + 1;
    next.maxCombo = Math.max(battle.maxCombo, next.combo);
    const armorBroke = !battle.armorBroken && next.hp <= boss.maxHp * boss.trait.breaksAtHpRatio;
    if (armorBroke) next.armorBroken = true;
    turn = { ...pick(answer), damage, technique, armorBroke, healed: 0 };
    if (boss.trait.kind === 'heads') turn.headsFelled = headsFelled(boss, next.hp) - headsFelled(boss, battle.hp);
    if (next.hp === 0) next.status = 'won';
  } else {
    next.combo = 0;
    next.resolve = battle.resolve - 1;
    const healed = missHeal(boss, battle);
    next.hp = Math.min(boss.maxHp, battle.hp + healed);
    turn = { ...pick(answer), damage: 0, technique: false, armorBroke: false, healed };
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

/** Vida que o chefão recupera a cada erro do jogador (juros do Mercador ou regeneração da Quimera). */
export function missHeal(boss: BossDef, battle: BattleState): number {
  return boss.trait.kind === 'heads' ? headRegen(boss, battle) : interestHeal(boss, battle);
}

function pick(a: BattleAnswer) {
  return { questionId: a.questionId, correct: a.correct, guessed: a.guessed, hints: a.hints };
}

export function isFlawless(battle: BattleState): boolean {
  return (
    battle.status === 'won' &&
    battle.turns.every((t) => t.correct && t.hints === 0 && !t.guessed)
  );
}
