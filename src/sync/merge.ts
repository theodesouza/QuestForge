/**
 * Merge de 3 vias entre a BASE (último estado que este aparelho sabe estar na nuvem), o estado
 * LOCAL e o estado REMOTO (o que está na nuvem agora). Só roda quando os dois lados mudaram
 * desde a base — o caso comum (um aparelho só) nunca passa por aqui.
 *
 * Princípios (prioridade: nunca perder progresso, nunca duplicar recompensa):
 *  - contadores (XP, Tinta, totais, acertos…): `base + Δlocal + Δremoto` — cada lado contribui só o
 *    que acrescentou; reenviar o mesmo estado não soma nada (Δ é medido contra a base);
 *  - conjuntos que só crescem (registro de recompensas, inventário): união;
 *  - recordes (melhor pontuação, estrelas, menor nº de turnos): o melhor dos dois;
 *  - campos de escolha (nome, equipamento, ajustes, metas): se só um lado mudou, vale o que mudou;
 *    se os dois mudaram, vale o do aparelho usado por último (`profile.lastActiveAt`);
 *  - recompensa ÚNICA concedida nos dois lados desde a base (mesma chave no registro) foi paga
 *    duas vezes: a segunda é estornada (XP/Tinta) — o item já é único no inventário;
 *  - encomenda que fecha SÓ na soma dos dois lados é liquidada aqui (ninguém cruzou o alvo sozinho).
 *
 * A função é pura e simétrica: merge3(b, l, r) ≡ merge3(b, r, l).
 */
import { getBoss } from '../content/bosses';
import { getItem } from '../content/items';
import type { BossProgress, NodeProgress } from '../domain/campaign/campaign';
import { STAR_REWARDS } from '../domain/campaign/score';
import type { QuestionState } from '../domain/learning/srs';
import { inkForLevel } from '../domain/progression/rewards';
import { MISSION_FIRST_INK, MISSION_FIRST_XP } from '../domain/progression/xp';
import {
  DAILY_BONUS,
  DAILY_REWARD,
  WEEKLY_BONUS,
  WEEKLY_FIRST_ITEM,
  WEEKLY_REWARD,
  boardBonus,
  grantsWeeklyItem,
  type QuestBoard,
  type QuestsState,
} from '../domain/quests/quests';
import { meaningfulKey, stableStringify, type SyncProfile, type SyncState } from './snapshot';

export interface MergeReport {
  /** Os dois lados tinham mudanças próprias desde a base. */
  diverged: boolean;
  /** Recompensas únicas pagas nos dois lados; a segunda foi estornada. */
  duplicateGrants: { key: string; xp: number; ink: number }[];
  /** Chaves duplicadas de um tipo desconhecido (não estornadas) — sinal para revisar `grantValue`. */
  unknownDuplicateKeys: string[];
  /** Tinta negativa (duas compras com o mesmo saldo) zerada ao final. */
  inkForgiven: number;
  /** Quadros de encomenda descartados por serem incompatíveis. */
  discardedBoards: ('daily' | 'weekly')[];
  /** Encomendas que fecharam só com a soma dos dois lados (premiadas na liquidação). */
  settledQuests: string[];
  /** Questões alteradas nos dois lados (contadores somados). */
  conflictingQuestions: number;
}

export interface MergeResult {
  merged: SyncState;
  report: MergeReport;
}

const eq = (a: unknown, b: unknown): boolean => a === b || stableStringify(a) === stableStringify(b);

type Side = 'l' | 'r';

/** Contador: base + Δl + Δr, nunca abaixo de zero. */
const add3 = (b: number, l: number, r: number): number => Math.max(0, l + r - b);

function maxNull(a: number | null, b: number | null): number | null {
  if (a === null) return b;
  if (b === null) return a;
  return Math.max(a, b);
}
function minNull(a: number | null, b: number | null): number | null {
  if (a === null) return b;
  if (b === null) return a;
  return Math.min(a, b);
}

/** Escolha de 3 vias: o lado que mudou vence; se ambos mudaram, vence `win`. */
function pick3<T>(b: T, l: T, r: T, win: Side): T {
  if (eq(l, r)) return l;
  if (eq(l, b)) return r;
  if (eq(r, b)) return l;
  return win === 'l' ? l : r;
}

/** Aparelho usado por último; empate decidido por comparação de texto (mantém a simetria). */
function recentSide(l: SyncProfile, r: SyncProfile): Side {
  const la = l.lastActiveAt ?? -1;
  const ra = r.lastActiveAt ?? -1;
  if (la !== ra) return la > ra ? 'l' : 'r';
  return stableStringify(l) >= stableStringify(r) ? 'l' : 'r';
}

// ——————————————————————————————————————————————— perfil

function mergeProfile(b: SyncProfile, l: SyncProfile, r: SyncProfile, win: Side): SyncProfile {
  const out: Record<string, unknown> = {};
  const keys = new Set([...Object.keys(b), ...Object.keys(l), ...Object.keys(r)]);
  const rec = (x: SyncProfile) => x as unknown as Record<string, unknown>;
  for (const k of keys) out[k] = pick3(rec(b)[k], rec(l)[k], rec(r)[k], win);

  out.onboarded = l.onboarded || r.onboarded;
  out.createdAt = Math.min(l.createdAt, r.createdAt);
  out.lastActiveAt = maxNull(l.lastActiveAt, r.lastActiveAt);
  // Sem piso aqui: estornos e compras duplicadas ainda ajustam o saldo; o piso (0) vem no final do merge.
  out.xp = l.xp + r.xp - b.xp;
  out.ink = l.ink + r.ink - b.ink;
  out.restedPool = win === 'l' ? l.restedPool : r.restedPool;
  out.totals = {
    answered: add3(b.totals.answered, l.totals.answered, r.totals.answered),
    correct: add3(b.totals.correct, l.totals.correct, r.totals.correct),
    timeMs: add3(b.totals.timeMs, l.totals.timeMs, r.totals.timeMs),
    sessions: add3(b.totals.sessions, l.totals.sessions, r.totals.sessions),
  };
  out.equipped = mergeRecord(b.equipped, l.equipped, r.equipped, win);
  out.settings = mergeRecord(b.settings, l.settings, r.settings, win);
  out.targets = mergeRecord(b.targets, l.targets, r.targets, win);
  return out as unknown as SyncProfile;
}

/** Registro plano de escolhas: cada chave decidida isoladamente com `pick3`. */
function mergeRecord<T extends object>(b: T, l: T, r: T, win: Side): T {
  const out: Record<string, unknown> = {};
  const rec = (x: T) => x as unknown as Record<string, unknown>;
  for (const k of new Set([...Object.keys(rec(b)), ...Object.keys(rec(l)), ...Object.keys(rec(r))])) {
    const v = pick3(rec(b)[k], rec(l)[k], rec(r)[k], win);
    if (v !== undefined) out[k] = v;
  }
  return out as T;
}

// ——————————————————————————————————————————————— coleções

const EMPTY_QUESTION = (questionId: string): QuestionState => ({
  questionId,
  box: 0,
  dueAt: null,
  seen: 0,
  correct: 0,
  wrong: 0,
  guessedCorrect: 0,
  lastAnsweredAt: null,
  lastCorrectAt: null,
  lastWrongAt: null,
  lastWrongSessionId: null,
  lastXpAt: null,
  echo: false,
  favorite: false,
  flagged: false,
});

function mergeQuestion(b: QuestionState | undefined, l: QuestionState, r: QuestionState, win: Side): QuestionState {
  const base = b ?? EMPTY_QUESTION(l.questionId);
  // O agendamento (caixa, vencimento, Eco) vem do lado que respondeu por último.
  const la = l.lastAnsweredAt ?? -1;
  const ra = r.lastAnsweredAt ?? -1;
  const latest: Side = la !== ra ? (la > ra ? 'l' : 'r') : win;
  const s = latest === 'l' ? l : r;
  return {
    questionId: l.questionId,
    box: s.box,
    dueAt: s.dueAt,
    seen: add3(base.seen, l.seen, r.seen),
    correct: add3(base.correct, l.correct, r.correct),
    wrong: add3(base.wrong, l.wrong, r.wrong),
    guessedCorrect: add3(base.guessedCorrect, l.guessedCorrect, r.guessedCorrect),
    lastAnsweredAt: maxNull(l.lastAnsweredAt, r.lastAnsweredAt),
    lastCorrectAt: maxNull(l.lastCorrectAt, r.lastCorrectAt),
    lastWrongAt: maxNull(l.lastWrongAt, r.lastWrongAt),
    lastWrongSessionId: s.lastWrongSessionId,
    lastXpAt: maxNull(l.lastXpAt, r.lastXpAt),
    echo: s.echo,
    favorite: pick3(base.favorite, l.favorite, r.favorite, win),
    flagged: pick3(base.flagged, l.flagged, r.flagged, win),
  };
}

function mergeNode(b: NodeProgress | undefined, l: NodeProgress, r: NodeProgress, win: Side): NodeProgress {
  return {
    nodeId: l.nodeId,
    completedAt: minNull(l.completedAt, r.completedAt),
    bestCorrect: Math.max(l.bestCorrect, r.bestCorrect),
    runs: add3(b?.runs ?? 0, l.runs, r.runs),
    bestScore: maxNull(l.bestScore, r.bestScore),
    bestStars: Math.max(l.bestStars, r.bestStars),
    lastScore: win === 'l' ? l.lastScore : r.lastScore,
  };
}

function mergeBoss(b: BossProgress | undefined, l: BossProgress, r: BossProgress, win: Side): BossProgress {
  return {
    bossId: l.bossId,
    attempts: add3(b?.attempts ?? 0, l.attempts, r.attempts),
    wins: add3(b?.wins ?? 0, l.wins, r.wins),
    failedSinceWin: win === 'l' ? l.failedSinceWin : r.failedSinceWin,
    firstWinAt: minNull(l.firstWinAt, r.firstWinAt),
    flawless: l.flawless || r.flawless,
    bestTurns: minNull(l.bestTurns, r.bestTurns),
  };
}

/** Mescla um mapa id → registro: lado único vence; os dois mudaram ⇒ `both`. */
function mergeMap<T>(
  b: Record<string, T>,
  l: Record<string, T>,
  r: Record<string, T>,
  both: (id: string, b: T | undefined, l: T, r: T) => T,
  onConflict?: () => void,
): Record<string, T> {
  const out: Record<string, T> = {};
  for (const id of new Set([...Object.keys(l), ...Object.keys(r)])) {
    const lv = l[id];
    const rv = r[id];
    if (lv === undefined) out[id] = rv;
    else if (rv === undefined) out[id] = lv;
    else if (lv === rv || eq(lv, rv)) out[id] = lv;
    else if (eq(lv, b[id])) out[id] = rv;
    else if (eq(rv, b[id])) out[id] = lv;
    else {
      onConflict?.();
      out[id] = both(id, b[id], lv, rv);
    }
  }
  return out;
}

// ——————————————————————————————————————————————— encomendas

function mergeBoard(
  period: 'daily' | 'weekly',
  b: QuestBoard | null,
  l: QuestBoard | null,
  r: QuestBoard | null,
  win: Side,
  report: MergeReport,
): QuestBoard | null {
  if (!l) return r;
  if (!r) return l;
  if (l.key !== r.key) return l.key > r.key ? l : r; // o calendário só avança
  if (eq(l, r)) return l;
  const bb = b && b.key === l.key ? b : null;
  if (bb && eq(l, bb)) return r;
  if (bb && eq(r, bb)) return l;
  if (!eq(l.quests.map((q) => q.id), r.quests.map((q) => q.id))) {
    report.discardedBoards.push(period);
    return win === 'l' ? l : r;
  }
  const days = [...new Set([...l.days, ...r.days])].sort();
  const progress: Record<string, number> = {};
  for (const q of l.quests) {
    // "Dias de estudo" conta dias DISTINTOS: dois aparelhos no mesmo dia valem um dia só.
    const sum =
      q.metric === 'studyDays'
        ? days.length
        : add3(bb?.progress[q.id] ?? 0, l.progress[q.id] ?? 0, r.progress[q.id] ?? 0);
    progress[q.id] = Math.min(q.target, sum);
  }
  return {
    ...l,
    progress,
    days,
    studyMs: add3(bb?.studyMs ?? 0, l.studyMs ?? 0, r.studyMs ?? 0),
    share: l.share ?? r.share,
  };
}

// ——————————————————————————————————————————————— recompensas únicas

interface GrantValue {
  xp: number;
  ink: number;
}

/**
 * Quanto uma chave do registro de recompensas pagou (XP/Tinta; `ink` negativo = compra).
 * Itens não entram: o inventário é uma união e cada item existe uma vez só.
 * Retorna null para chaves desconhecidas — o teste "toda chave do jogo é conhecida" garante
 * que novas recompensas ganhem uma regra aqui.
 */
export function grantValue(key: string, quests: QuestsState): GrantValue | null {
  const parts = key.split(':');
  switch (parts[0]) {
    case 'level': {
      const level = Number(parts[1]);
      return Number.isInteger(level) ? { xp: 0, ink: inkForLevel(level) } : null;
    }
    case 'mission': {
      if (parts[2] === 'first') return { xp: MISSION_FIRST_XP, ink: MISSION_FIRST_INK };
      if (parts[2] === 'star2') return { ...STAR_REWARDS[2] };
      if (parts[2] === 'star3') return { ...STAR_REWARDS[3] };
      return null;
    }
    case 'boss': {
      let boss;
      try {
        boss = getBoss(parts[1]);
      } catch {
        return null;
      }
      if (parts[2] === 'first') return { xp: boss.rewards.firstXp, ink: boss.rewards.firstInk };
      if (parts[2] === 'win') return { xp: boss.rewards.repeatXp, ink: 0 };
      if (parts[2] === 'flawless') return { xp: 0, ink: 0 };
      return null;
    }
    case 'shop': {
      try {
        const price = getItem(parts.slice(1).join(':')).price;
        return price === undefined ? null : { xp: 0, ink: -price };
      } catch {
        return null;
      }
    }
    case 'quest': {
      const period = parts[1] === 'daily' || parts[1] === 'weekly' ? parts[1] : null;
      if (!period) return null;
      const board = quests[period];
      const same = board && board.key === parts[2] ? board : null;
      const what = parts.slice(3).join(':');
      if (what === 'bonus') {
        if (same) return boardBonus(same);
        return { ...(period === 'daily' ? DAILY_BONUS : WEEKLY_BONUS) };
      }
      const def = same?.quests.find((q) => q.id === what);
      if (def) return { xp: def.xp, ink: def.ink };
      return { ...(period === 'daily' ? DAILY_REWARD : WEEKLY_REWARD) };
    }
    default:
      return null;
  }
}

/** Encomendas que ficaram completas só na soma dos dois lados: paga o que ninguém pagou. */
function settleQuests(merged: SyncState, report: MergeReport): void {
  for (const period of ['daily', 'weekly'] as const) {
    const board = merged.quests[period];
    if (!board) continue;
    let completedNow = 0;
    for (const q of board.quests) {
      if ((board.progress[q.id] ?? 0) < q.target) continue;
      const key = `quest:${period}:${board.key}:${q.id}`;
      if (key in merged.ledger) {
        completedNow++;
        continue;
      }
      const at = merged.profile.lastActiveAt ?? Date.now();
      merged.ledger[key] = at;
      merged.profile.xp += q.xp;
      merged.profile.ink += q.ink;
      report.settledQuests.push(key);
      completedNow++;
    }
    const bonusKey = `quest:${period}:${board.key}:bonus`;
    if (completedNow === board.quests.length && completedNow > 0 && !(bonusKey in merged.ledger)) {
      const bonus = boardBonus(board);
      merged.ledger[bonusKey] = merged.profile.lastActiveAt ?? Date.now();
      merged.profile.xp += bonus.xp;
      merged.profile.ink += bonus.ink;
      if (grantsWeeklyItem(board) && !merged.inventory[WEEKLY_FIRST_ITEM]) {
        merged.inventory[WEEKLY_FIRST_ITEM] = {
          itemId: WEEKLY_FIRST_ITEM,
          acquiredAt: merged.profile.lastActiveAt ?? Date.now(),
          source: 'encomendas',
        };
      }
      report.settledQuests.push(bonusKey);
    }
  }
}

// ——————————————————————————————————————————————— merge completo

export function merge3(base: SyncState, local: SyncState, remote: SyncState): MergeResult {
  const report: MergeReport = {
    diverged: meaningfulKey(local) !== meaningfulKey(base) && meaningfulKey(remote) !== meaningfulKey(base),
    duplicateGrants: [],
    unknownDuplicateKeys: [],
    inkForgiven: 0,
    discardedBoards: [],
    settledQuests: [],
    conflictingQuestions: 0,
  };
  const win = recentSide(local.profile, remote.profile);

  // Lados idênticos são a MESMA história (ex.: a nuvem já contém o que o aparelho enviou), não
  // dois conjuntos de incrementos independentes — somar os Δ contaria tudo em dobro.
  if (meaningfulKey(local) === meaningfulKey(remote)) {
    const profile = {
      ...remote.profile,
      lastActiveAt: maxNull(local.profile.lastActiveAt, remote.profile.lastActiveAt),
      restedPool: win === 'l' ? local.profile.restedPool : remote.profile.restedPool,
    };
    return { merged: { ...remote, profile }, report: { ...report, diverged: false } };
  }

  const profile = mergeProfile(base.profile, local.profile, remote.profile, win);

  const questionStates = mergeMap(
    base.questionStates,
    local.questionStates,
    remote.questionStates,
    (_id, b, l, r) => mergeQuestion(b, l, r, win),
    () => report.conflictingQuestions++,
  );

  const inventory: SyncState['inventory'] = { ...remote.inventory };
  for (const [id, e] of Object.entries(local.inventory)) {
    const other = inventory[id];
    inventory[id] = !other || e.acquiredAt < other.acquiredAt ? e : other;
  }

  const ledger: SyncState['ledger'] = { ...remote.ledger };
  for (const [key, at] of Object.entries(local.ledger)) ledger[key] = key in ledger ? Math.min(ledger[key], at) : at;

  const campaign = mergeMap(base.campaign, local.campaign, remote.campaign, (_id, b, l, r) => mergeNode(b, l, r, win));
  const bosses = mergeMap(base.bosses, local.bosses, remote.bosses, (_id, b, l, r) => mergeBoss(b, l, r, win));
  const quests: QuestsState = {
    daily: mergeBoard('daily', base.quests.daily, local.quests.daily, remote.quests.daily, win, report),
    weekly: mergeBoard('weekly', base.quests.weekly, local.quests.weekly, remote.quests.weekly, win, report),
  };

  const merged: SyncState = { profile, questionStates, inventory, ledger, campaign, bosses, quests };

  // Recompensa única paga nos dois lados desde a base ⇒ estorna a segunda.
  const baseKeys = new Set(Object.keys(base.ledger));
  const remoteNew = new Set(Object.keys(remote.ledger).filter((k) => !baseKeys.has(k)));
  for (const key of Object.keys(local.ledger).filter((k) => !baseKeys.has(k) && remoteNew.has(k)).sort()) {
    const value = grantValue(key, merged.quests);
    if (!value) {
      report.unknownDuplicateKeys.push(key);
      continue;
    }
    merged.profile.xp -= value.xp;
    merged.profile.ink -= value.ink;
    report.duplicateGrants.push({ key, ...value });
  }

  settleQuests(merged, report);

  if (merged.profile.ink < 0) {
    report.inkForgiven = -merged.profile.ink;
    merged.profile.ink = 0;
  }
  merged.profile.xp = Math.max(0, merged.profile.xp);
  return { merged, report };
}

// ——————————————————————————————————————————————— salvaguarda contra regressão

/**
 * Lista violações de "o progresso só avança" de `prev` para `next`. O motor consulta antes de
 * gravar na nuvem: se `next` perdeu algo que `prev` (o que a nuvem já tem) possuía, o envio é
 * barrado — protege contra estado local vazio/corrompido e contra qualquer erro de merge.
 */
export function findRegressions(prev: SyncState, next: SyncState, allowedXpLoss = 0): string[] {
  const out: string[] = [];
  // XP só cai por estorno de recompensa duplicada; qualquer outra queda é perda de progresso.
  if (next.profile.xp < prev.profile.xp - allowedXpLoss) out.push(`XP caiu de ${prev.profile.xp} para ${next.profile.xp}`);
  for (const key of Object.keys(prev.ledger)) if (!(key in next.ledger)) out.push(`recompensa ${key} sumiu`);
  for (const id of Object.keys(prev.inventory)) if (!(id in next.inventory)) out.push(`item ${id} sumiu`);
  for (const [id, q] of Object.entries(prev.questionStates)) {
    const n = next.questionStates[id];
    if (!n && q.seen > 0) out.push(`questão ${id} sumiu`);
    else if (n && n.seen < q.seen) out.push(`questão ${id}: ${q.seen} → ${n.seen} respostas`);
  }
  for (const [id, p] of Object.entries(prev.campaign)) {
    const n = next.campaign[id];
    if (!n) out.push(`missão ${id} sumiu`);
    else if (n.runs < p.runs || n.bestStars < p.bestStars || (p.completedAt !== null && n.completedAt === null)) {
      out.push(`missão ${id} regrediu`);
    }
  }
  for (const [id, p] of Object.entries(prev.bosses)) {
    const n = next.bosses[id];
    if (!n || n.attempts < p.attempts || n.wins < p.wins) out.push(`chefão ${id} regrediu`);
  }
  if (next.profile.totals.answered < prev.profile.totals.answered) out.push('total de respostas diminuiu');
  if (prev.profile.onboarded && !next.profile.onboarded) out.push('perfil voltou ao início');
  return out;
}
