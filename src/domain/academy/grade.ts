/**
 * Correção dos exercícios da Academia. Funções puras: a interface só mostra o resultado.
 */
import type {
  ChoiceExercise,
  ClassifyExercise,
  FillExercise,
  NumberExercise,
  OrderExercise,
  Rich,
  SelectExercise,
  SpotExercise,
} from '../../content/academy/types';

/** Tolerância padrão das respostas digitadas: aceita o arredondamento ao centésimo. */
export const DEFAULT_TOLERANCE = 0.005;

/**
 * Lê um número digitado como um estudante brasileiro escreveria: "1.234,56", "1234,56",
 * "0,375", "1.500" (milhar), "2.5" (ponto decimal), "−3", "3/8", "2 1/4", "R$ 12", "15%".
 */
export function parseUserNumber(raw: string): number | null {
  let t = raw
    .trim()
    .replace(/[−–]/g, '-')
    .replace(/^R\$\s*/i, '')
    .replace(/\s*%$/, '')
    .replace(/\s+[a-zA-Zá-úÁ-Ú²³]+\.?$/, '')
    .trim();
  if (!t) return null;
  const mixed = t.match(/^(-?)(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) {
    const d = Number(mixed[4]);
    if (d === 0) return null;
    return (mixed[1] ? -1 : 1) * (Number(mixed[2]) + Number(mixed[3]) / d);
  }
  const fraction = t.match(/^(-?\d+(?:[.,]\d+)?)\/(\d+(?:[.,]\d+)?)$/);
  if (fraction) {
    const a = parseUserNumber(fraction[1]);
    const b = parseUserNumber(fraction[2]);
    return a === null || b === null || b === 0 ? null : a / b;
  }
  t = t.replace(/\s/g, '');
  if (t.includes(',')) {
    if (!/^-?\d{1,3}(\.\d{3})*(,\d+)?$|^-?\d+(,\d+)?$/.test(t)) return null;
    t = t.replace(/\./g, '').replace(',', '.');
  } else if (/^-?[1-9]\d{0,2}(\.\d{3})+$/.test(t)) {
    // "1.500" é milhar; "0.375" e "2.5" são decimais com ponto.
    t = t.replace(/\./g, '');
  }
  if (!/^-?\d+(\.\d+)?$|^-?\.\d+$/.test(t)) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

export interface Grade {
  correct: boolean;
  /** Explicação específica do equívoco (quando há). */
  feedback?: Rich;
}

export function gradeChoice(ex: ChoiceExercise, optionIndex: number): Grade {
  const opt = ex.options[optionIndex];
  if (!opt) return { correct: false };
  return { correct: opt.correct, feedback: opt.correct ? undefined : opt.feedback };
}

export function numberTolerance(ex: NumberExercise): number {
  return ex.tolerance ?? Math.max(DEFAULT_TOLERANCE, Math.abs(ex.answer) * 1e-9);
}

export function gradeNumber(ex: NumberExercise, raw: string): Grade & { value: number | null } {
  const value = parseUserNumber(raw);
  if (value === null) return { correct: false, value, feedback: 'Não consegui ler esse número. Use vírgula para os decimais, como em 12,5.' };
  const tol = numberTolerance(ex);
  if (Math.abs(value - ex.answer) <= tol) return { correct: true, value };
  const known = ex.wrong?.find((w) => Math.abs(value - w.value) <= tol);
  return { correct: false, value, feedback: known?.feedback ?? ex.otherwise };
}

/** `sequence`: índices dos passos (na ordem correta original) na ordem escolhida. */
export function gradeOrder(ex: OrderExercise, sequence: readonly number[]): Grade & { firstWrong: number } {
  const firstWrong = ex.steps.findIndex((_, i) => sequence[i] !== i);
  return { correct: firstWrong === -1 && sequence.length === ex.steps.length, firstWrong };
}

export function gradeSpot(ex: SpotExercise, line: number): Grade {
  return { correct: line === ex.wrong, feedback: line === ex.wrong ? undefined : ex.why };
}

export function gradeSelect(ex: SelectExercise, selected: readonly number[]): Grade & { missing: number[]; extra: number[] } {
  const chosen = new Set(selected);
  const missing = ex.chips.map((c, i) => (c.needed && !chosen.has(i) ? i : -1)).filter((i) => i >= 0);
  const extra = ex.chips.map((c, i) => (!c.needed && chosen.has(i) ? i : -1)).filter((i) => i >= 0);
  return { correct: missing.length === 0 && extra.length === 0, missing, extra };
}

/** `assignment[i]`: categoria escolhida para o item i (−1 = sem categoria). */
export function gradeClassify(ex: ClassifyExercise, assignment: readonly number[]): Grade & { wrong: number[] } {
  const wrong = ex.items.map((it, i) => (assignment[i] === it.bin ? -1 : i)).filter((i) => i >= 0);
  return { correct: wrong.length === 0, wrong };
}

/** Lacunas na ordem em que aparecem; `picks[k]`: opção escolhida na lacuna k. */
export function fillBlanks(ex: FillExercise) {
  return ex.parts.filter((x): x is { options: string[]; answer: number } => typeof x !== 'string');
}

export function gradeFill(ex: FillExercise, picks: readonly number[]): Grade & { wrong: number[] } {
  const wrong = fillBlanks(ex)
    .map((b, k) => (picks[k] === b.answer ? -1 : k))
    .filter((k) => k >= 0);
  return { correct: wrong.length === 0, wrong };
}
