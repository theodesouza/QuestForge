/**
 * Linguagem de autoria das aulas: funções curtas que montam o modelo tipado
 * (`../types`). Os ids de exercícios, exemplos e laboratórios são atribuídos pela
 * posição dentro da etapa (`aula.etapa.p1`, `.c2`, `.k1`…) quando não são informados.
 * Para não embaralhar o progresso salvo, acrescente conteúdo novo no fim de cada lista.
 */
import type { Block } from '../../types';
import type {
  CalloutTone,
  ChoiceExercise,
  ClassifyExercise,
  Course,
  Exercise,
  ExerciseDef,
  ExerciseDraft,
  ExerciseGen,
  ExampleStep,
  FillExercise,
  LabSpec,
  LearnBlock,
  Lesson,
  NumberExercise,
  Option,
  OrderExercise,
  Rand,
  Rich,
  SelectExercise,
  SimSpec,
  SpotExercise,
  Stage,
  StageBody,
  StageKind,
  Tone,
} from '../types';
import { makeRand } from './rand';

// ———————————————————————————————————————————————— blocos de enunciado

export const p = (text: string): Block => ({ kind: 'p', text });
export const formula = (...lines: string[]): Block => ({ kind: 'math', lines });
export const table = (header: string[], rows: string[][], caption?: string): Block => ({ kind: 'table', header, rows, caption });
export const barChart = (data: { label: string; value: number }[], title?: string, unit?: string): Block => ({
  kind: 'bars',
  data,
  title,
  unit,
});

// ———————————————————————————————————————————————— alternativas

export const ok = (text: Rich): Option => ({ text, correct: true });
export const no = (text: Rich, feedback: Rich): Option => ({ text, correct: false, feedback });

/**
 * Alternativas numéricas sem repetição: descarta distratores que coincidem com a
 * resposta (ou entre si) para os números sorteados. Usado pelos geradores.
 */
export function numericOptions(
  correct: { value: number; text: string },
  wrongs: { value: number; text: string; feedback: Rich }[],
): Option[] {
  // Comparação relativa: vale também para números muito pequenos (notação científica).
  const same = (a: number, b: number) => Math.abs(a - b) <= Math.max(Math.abs(a), Math.abs(b)) * 1e-9;
  const out: Option[] = [ok(correct.text)];
  const values = [correct.value];
  const texts = new Set([correct.text]);
  for (const w of wrongs) {
    if (!Number.isFinite(w.value) || values.some((v) => same(v, w.value)) || texts.has(w.text)) continue;
    values.push(w.value);
    texts.add(w.text);
    out.push(no(w.text, w.feedback));
  }
  return out;
}

// ———————————————————————————————————————————————— exercícios

type Draft<T> = Omit<T, 'id' | 'kind'> & { id?: string };

export const choice = (e: Draft<ChoiceExercise>): ChoiceExercise => ({ ...e, kind: 'choice', id: e.id ?? '' });
export const numeric = (e: Draft<NumberExercise>): NumberExercise => ({ ...e, kind: 'number', id: e.id ?? '' });
export const order = (e: Draft<OrderExercise>): OrderExercise => ({ ...e, kind: 'order', id: e.id ?? '' });
export const spot = (e: Draft<SpotExercise>): SpotExercise => ({ ...e, kind: 'spot', id: e.id ?? '' });
export const select = (e: Draft<SelectExercise>): SelectExercise => ({ ...e, kind: 'select', id: e.id ?? '' });
export const classify = (e: Draft<ClassifyExercise>): ClassifyExercise => ({ ...e, kind: 'classify', id: e.id ?? '' });
export const fill = (e: Draft<FillExercise>): FillExercise => ({ ...e, kind: 'fill', id: e.id ?? '' });

/** Exercício gerado: números novos a cada tentativa, sempre recalculados. */
export const gen = (make: (r: Rand) => ExerciseDraft, id = ''): ExerciseGen => ({ kind: 'gen', id, make });

// Rascunhos para geradores (sem id).
export const draftChoice = (e: Omit<ChoiceExercise, 'id' | 'kind'>): ExerciseDraft => ({ ...e, kind: 'choice' });
/**
 * Rascunho numérico de gerador: descarta erros previstos que, para os números sorteados,
 * coincidem com a resposta ou entre si (o feedback específico ficaria ambíguo).
 */
export function draftNumeric(e: Omit<NumberExercise, 'id' | 'kind'>): ExerciseDraft {
  const tol = e.tolerance ?? Math.max(0.005, Math.abs(e.answer) * 1e-9);
  const kept: { value: number; feedback: Rich }[] = [];
  for (const w of e.wrong ?? []) {
    if (!Number.isFinite(w.value) || Math.abs(w.value - e.answer) <= tol) continue;
    if (kept.some((k) => Math.abs(k.value - w.value) <= tol)) continue;
    kept.push(w);
  }
  return { ...e, wrong: kept, kind: 'number' };
}

/** Instância concreta de um exercício (geradores usam a semente). */
export function instantiate(def: ExerciseDef, seed: number): Exercise {
  if (def.kind !== 'gen') return def;
  return { ...def.make(makeRand(seed)), id: def.id } as Exercise;
}

// ———————————————————————————————————————————————— blocos de "Aprender"

export const text = (t: Rich): LearnBlock => ({ kind: 'text', text: t });
export const math = (...lines: string[]): LearnBlock => ({ kind: 'math', lines });
export const mathNote = (caption: Rich, ...lines: string[]): LearnBlock => ({ kind: 'math', lines, caption });

const callout = (tone: CalloutTone) => (title: string, t: Rich): LearnBlock => ({ kind: 'callout', tone, title, text: t });
/** Ideia-chave. */
export const key = callout('key');
/** Dica prática. */
export const tip = callout('tip');
/** Erro comum. */
export const warn = callout('warn');
/** Como o ENEM costuma cobrar. */
export const enem = callout('enem');
/** Estratégia de resolução. */
export const strategy = callout('strategy');

export const data = (block: Block): LearnBlock => ({ kind: 'data', block });

/** Exemplo resolvido, revelado passo a passo (alguns passos pedem o próximo movimento). */
export function example(title: string, problem: string | Block[], steps: (Rich | ExampleStep)[], result?: Rich): LearnBlock {
  return {
    kind: 'example',
    id: '',
    title,
    problem: typeof problem === 'string' ? [p(problem)] : problem,
    steps: steps.map((s) => (typeof s === 'string' ? { text: s } : s)),
    result,
  };
}

/** Passo de exemplo com fórmula. */
export const step = (t: Rich, ...lines: string[]): ExampleStep => ({ text: t, math: lines.length ? lines : undefined });
/** Passo de exemplo que pergunta o próximo movimento antes de mostrá-lo. */
export const askStep = (t: Rich, question: Rich, options: Option[], ...lines: string[]): ExampleStep => ({
  text: t,
  math: lines.length ? lines : undefined,
  ask: { question, options },
});

/** "Pense antes de ver": o estudante tenta responder mentalmente e depois revela. */
export const reveal = (prompt: Rich, answer: Rich): LearnBlock => ({ kind: 'reveal', id: '', prompt, answer });

/** Verificação rápida no meio da explicação. */
export const check = (exercise: ExerciseDef): LearnBlock => ({ kind: 'check', exercise });

export const lab = (spec: Omit<LabSpec, 'id'> & { id?: string }): LearnBlock => ({ kind: 'lab', lab: { ...spec, id: spec.id ?? '' } });
export const sim = (spec: Omit<SimSpec, 'id'> & { id?: string }): LearnBlock => ({ kind: 'sim', sim: { ...spec, id: spec.id ?? '' } });

export const compare = (columns: { title: string; tone: Tone; lines: Rich[] }[], title?: string): LearnBlock => ({
  kind: 'compare',
  title,
  columns,
});

// ———————————————————————————————————————————————— apoio às visualizações

/** Grade preenchida em ordem de leitura por grupos (ex.: 37 de 100 células = 37%). */
export function gridCells(rows: number, cols: number, groups: { count: number; tone: Tone }[]): (Tone | null)[] {
  const cells: (Tone | null)[] = Array.from({ length: rows * cols }, () => null);
  let i = 0;
  for (const g of groups) for (let k = 0; k < g.count && i < cells.length; k++) cells[i++] = g.tone;
  return cells;
}

/** Amostra uma função em n+1 pontos de [a, b] (séries de gráficos). */
export function sample(a: number, b: number, n: number, f: (x: number) => number): [number, number][] {
  return Array.from({ length: n + 1 }, (_, k) => {
    const x = a + ((b - a) * k) / n;
    return [x, f(x)] as [number, number];
  });
}

// ———————————————————————————————————————————————— estrutura

export function stage(id: string, kind: StageKind, title: string, goal: Rich, body: () => StageBody): Stage {
  return { id, kind, title, goal, body };
}

function assignIds(body: StageBody, prefix: string): StageBody {
  const counters: Record<string, number> = {};
  const next = (k: string) => `${prefix}.${k}${(counters[k] = (counters[k] ?? 0) + 1)}`;
  for (const b of body.learn) {
    if (b.kind === 'check') b.exercise.id ||= next('k');
    else if (b.kind === 'example') b.id ||= next('e');
    else if (b.kind === 'reveal') b.id ||= next('r');
    else if (b.kind === 'lab') b.lab.id ||= next('lab');
    else if (b.kind === 'sim') b.sim.id ||= next('sim');
  }
  for (const e of body.practice) e.id ||= next('p');
  for (const e of body.challenge) e.id ||= next('c');
  return body;
}

/** Aula: cada etapa monta o próprio conteúdo na primeira consulta (e o reaproveita depois). */
export function lesson(def: Lesson): Lesson {
  return {
    ...def,
    stages: def.stages.map((s) => {
      let cache: StageBody | null = null;
      return { ...s, body: () => (cache ??= assignIds(s.body(), `${def.id}.${s.id}`)) };
    }),
  };
}

export function course(def: Course): Course {
  return def;
}
