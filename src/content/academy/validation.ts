/**
 * Validador da Academia — estrutural, matemático e pedagógico. Roda nos testes e bloqueia
 * conteúdo inconsistente: alternativa correta duplicada, erro sem explicação, prática sem
 * dica, gerador que produz números impossíveis, laboratório cuja missão é inalcançável,
 * questão do banco sem aula que a prepare.
 */
import { QUESTIONS } from '../bank';
import { TOPICS } from '../topics';
import { parseNumeric } from '../validation/validate';
import { COURSES, LESSONS, findStage, stageRef } from './catalog';
import { instantiate } from './kit/build';
import { QUESTION_STAGES } from './questionMap';
import type { Course, Exercise, ExerciseDef, LabSpec, LabValues, Lesson, Option, SimSpec, StageBody, Viz } from './types';

export interface AcademyIssue {
  where: string;
  message: string;
}

type Mode = 'check' | 'practice' | 'challenge';

const LETTER_REF = /\b([Aa]lternativa|[Ll]etra|[Oo]p[çc][ãa]o)\s+["“(]?[A-E]\b/;
const MIN_FEEDBACK = 15;

function textOk(s: string | undefined, min: number): boolean {
  return !!s && s.trim().length >= min;
}

function validateOptions(options: Option[], add: (m: string) => void, fixedOrder?: boolean) {
  if (options.length < 2 || options.length > 6) add(`precisa de 2 a 6 alternativas (tem ${options.length})`);
  const correct = options.filter((o) => o.correct);
  if (correct.length !== 1) add(`precisa de exatamente 1 alternativa correta (tem ${correct.length})`);
  const texts = options.map((o) => o.text.trim().toLowerCase());
  if (new Set(texts).size !== texts.length) add('alternativas repetidas');
  for (const o of options) {
    if (!textOk(o.text, 1)) add('alternativa vazia');
    if (!o.correct && !textOk(o.feedback, MIN_FEEDBACK)) add(`alternativa errada sem explicação do equívoco: "${o.text}"`);
    if (!fixedOrder && o.feedback && LETTER_REF.test(o.feedback)) add(`feedback cita alternativa pela letra (embaralhadas): "${o.feedback.slice(0, 50)}"`);
  }
}

export function validateExercise(ex: Exercise, where: string, mode: Mode): AcademyIssue[] {
  const issues: AcademyIssue[] = [];
  const add = (message: string) => issues.push({ where: `${where} [${ex.id || 'sem id'}]`, message });
  if (!ex.id) add('exercício sem id');
  if (!textOk(ex.ask, 6)) add('pergunta ausente ou curta');
  if (!ex.solution.length || !ex.solution.some((l) => textOk(l, 10))) add('sem resolução comentada');
  if (mode === 'practice' && !(ex.hints && ex.hints.length > 0 && ex.hints.every((h) => textOk(h, 10)))) add('exercício de prática sem dica');
  for (const b of ex.prompt ?? []) {
    if (b.kind === 'table' && b.rows.some((r) => r.length !== b.header.length)) add('tabela com colunas inconsistentes');
  }
  const fixed = ex.kind === 'choice' && !!ex.fixedOrder;
  if (!fixed) {
    for (const t of [...ex.solution, ...(ex.hints ?? []), ex.idea ?? '']) {
      if (LETTER_REF.test(t)) add(`texto cita alternativa pela letra (embaralhadas): "${t.slice(0, 50)}"`);
    }
  }

  switch (ex.kind) {
    case 'choice': {
      validateOptions(ex.options, add, ex.fixedOrder);
      if (ex.verify) {
        let expected: number;
        try {
          expected = ex.verify();
        } catch (e) {
          add(`verify() lançou erro: ${String(e)}`);
          break;
        }
        const tol = ex.tolerance ?? Math.max(1e-9, Math.abs(expected) * 1e-9);
        const values = ex.options.map((o) => parseNumeric(o.text));
        const matches = values.map((v, i) => (v !== null && Math.abs(v - expected) <= tol ? i : -1)).filter((i) => i >= 0);
        const correctIdx = ex.options.findIndex((o) => o.correct);
        if (!matches.includes(correctIdx)) add(`verify() = ${expected} não bate com a alternativa correta "${ex.options[correctIdx]?.text}"`);
        if (matches.length > 1) add(`verify() bate com mais de uma alternativa (${matches.length})`);
      }
      break;
    }
    case 'number': {
      if (!Number.isFinite(ex.answer)) add('resposta não numérica');
      const tol = ex.tolerance ?? Math.max(0.005, Math.abs(ex.answer) * 1e-9);
      if (tol < 0) add('tolerância negativa');
      const seen: number[] = [];
      for (const w of ex.wrong ?? []) {
        if (!Number.isFinite(w.value)) add('valor de erro previsto não numérico');
        if (Math.abs(w.value - ex.answer) <= tol) add(`erro previsto coincide com a resposta: ${w.value}`);
        if (seen.some((v) => Math.abs(v - w.value) <= tol)) add(`erro previsto repetido: ${w.value}`);
        seen.push(w.value);
        if (!textOk(w.feedback, MIN_FEEDBACK)) add(`erro previsto sem explicação: ${w.value}`);
      }
      break;
    }
    case 'order':
      if (ex.steps.length < 3) add('ordenar exige ao menos 3 passos');
      if (new Set(ex.steps.map((s) => s.trim())).size !== ex.steps.length) add('passos repetidos');
      break;
    case 'spot':
      if (ex.lines.length < 3) add('encontrar o erro exige ao menos 3 linhas');
      if (!Number.isInteger(ex.wrong) || ex.wrong < 0 || ex.wrong >= ex.lines.length) add('índice da linha errada inválido');
      if (!textOk(ex.why, MIN_FEEDBACK)) add('sem explicação do erro');
      break;
    case 'select': {
      if (ex.chips.length < 3) add('identificar exige ao menos 3 informações');
      const needed = ex.chips.filter((c) => c.needed).length;
      if (needed === 0 || needed === ex.chips.length) add('é preciso haver dados necessários e dispensáveis');
      if (new Set(ex.chips.map((c) => c.text.trim())).size !== ex.chips.length) add('informações repetidas');
      break;
    }
    case 'classify': {
      if (ex.bins.length < 2) add('classificar exige ao menos 2 categorias');
      if (ex.items.length < 3) add('classificar exige ao menos 3 itens');
      for (const it of ex.items) if (!Number.isInteger(it.bin) || it.bin < 0 || it.bin >= ex.bins.length) add(`categoria inválida: ${it.text}`);
      for (let b = 0; b < ex.bins.length; b++) if (!ex.items.some((it) => it.bin === b)) add(`categoria sem itens: ${ex.bins[b]}`);
      break;
    }
    case 'fill': {
      const blanks = ex.parts.filter((x): x is { options: string[]; answer: number } => typeof x !== 'string');
      if (blanks.length === 0) add('completar exige ao menos 1 lacuna');
      for (const b of blanks) {
        if (b.options.length < 2) add('lacuna com menos de 2 opções');
        if (!Number.isInteger(b.answer) || b.answer < 0 || b.answer >= b.options.length) add('resposta da lacuna inválida');
        if (new Set(b.options).size !== b.options.length) add('opções repetidas na lacuna');
      }
      break;
    }
  }
  return issues;
}

/** Amostras de cada gerador conferidas pelo validador. */
export const GENERATOR_SAMPLES = 120;

export function validateDef(def: ExerciseDef, where: string, mode: Mode): AcademyIssue[] {
  if (def.kind !== 'gen') return validateExercise(def, where, mode);
  const issues: AcademyIssue[] = [];
  const shapes = new Set<string>();
  for (let seed = 1; seed <= GENERATOR_SAMPLES; seed++) {
    let ex: Exercise;
    try {
      ex = instantiate(def, seed);
    } catch (e) {
      issues.push({ where: `${where} [${def.id}]`, message: `gerador falhou na semente ${seed}: ${String(e)}` });
      break;
    }
    const found = validateExercise(ex, `${where} (semente ${seed})`, mode);
    if (found.length) {
      issues.push(...found.slice(0, 3));
      break;
    }
    shapes.add(JSON.stringify([ex.prompt, ex.ask, ex.kind === 'number' ? ex.answer : ex.kind === 'choice' ? ex.options.map((o) => o.text) : null]));
  }
  if (issues.length === 0 && shapes.size < 4) issues.push({ where: `${where} [${def.id}]`, message: `gerador pouco variado (${shapes.size} versões em ${GENERATOR_SAMPLES})` });
  return issues;
}

function hasBadNumber(x: unknown, depth = 0): boolean {
  if (depth > 6) return false;
  if (typeof x === 'number') return !Number.isFinite(x);
  if (Array.isArray(x)) return x.some((v) => hasBadNumber(v, depth + 1));
  if (x && typeof x === 'object') return Object.values(x).some((v) => typeof v !== 'function' && hasBadNumber(v, depth + 1));
  return false;
}

function vizIssues(viz: Viz): string | null {
  if (hasBadNumber(viz)) return 'visualização com número inválido (NaN/∞)';
  if (!viz.summary || viz.summary.length < 10) return 'visualização sem descrição acessível';
  if (viz.kind === 'chart' && viz.series.some((s) => s.points.length < 2)) return 'série com menos de 2 pontos';
  return null;
}

/** Combinações de parâmetros para testar o laboratório (bordas e valor inicial; grade para a missão). */
function grid(lab: LabSpec, perParam: number): LabValues[] {
  let combos: LabValues[] = [{}];
  for (const prm of lab.params) {
    const n = Math.max(1, Math.round((prm.max - prm.min) / prm.step));
    const stride = Math.max(1, Math.floor(n / Math.max(1, perParam - 1)));
    const values = new Set<number>([prm.min, prm.max, prm.value]);
    for (let k = 0; k <= n; k += stride) values.add(Math.round((prm.min + k * prm.step) * 1e9) / 1e9);
    const next: LabValues[] = [];
    for (const c of combos) for (const v of values) next.push({ ...c, [prm.key]: v });
    combos = next;
  }
  return combos;
}

export function validateLab(lab: LabSpec, where: string): AcademyIssue[] {
  const issues: AcademyIssue[] = [];
  const add = (message: string) => issues.push({ where: `${where} [${lab.id}]`, message });
  if (!lab.id) add('laboratório sem id');
  if (lab.params.length === 0) add('laboratório sem parâmetros');
  for (const prm of lab.params) {
    if (!(prm.min < prm.max) || !(prm.step > 0)) add(`parâmetro com faixa inválida: ${prm.key}`);
    if (prm.value < prm.min || prm.value > prm.max) add(`valor inicial fora da faixa: ${prm.key}`);
  }
  const perParam = lab.params.length <= 2 ? 12 : lab.params.length === 3 ? 7 : 5;
  const combos = grid(lab, perParam);
  let reachable = false;
  for (const v of combos) {
    try {
      for (const r of lab.readouts(v)) if (/NaN|Infinity|undefined/.test(r.value)) add(`leitura inválida (${r.label}: ${r.value}) em ${JSON.stringify(v)}`);
      if (lab.viz) {
        const problem = vizIssues(lab.viz(v));
        if (problem) add(`${problem} em ${JSON.stringify(v)}`);
      }
      if (lab.goal && lab.goal.done(v)) reachable = true;
    } catch (e) {
      add(`erro ao calcular com ${JSON.stringify(v)}: ${String(e)}`);
    }
    if (issues.length > 3) break;
  }
  if (lab.goal) {
    const initial = Object.fromEntries(lab.params.map((p) => [p.key, p.value]));
    if (lab.goal.done(initial)) add('a missão do laboratório já começa cumprida');
    if (!reachable) add('a missão do laboratório não é alcançável com os controles');
  }
  return issues;
}

export function validateSim(sim: SimSpec, where: string): AcademyIssue[] {
  const issues: AcademyIssue[] = [];
  const add = (message: string) => issues.push({ where: `${where} [${sim.id}]`, message });
  const total = sim.outcomes.reduce((s, o) => s + o.p, 0);
  if (Math.abs(total - 1) > 1e-9) add(`probabilidades somam ${total}, não 1`);
  if (sim.outcomes.some((o) => !(o.p >= 0))) add('probabilidade negativa');
  if (sim.event && sim.event.outcomes.some((i) => i < 0 || i >= sim.outcomes.length)) add('evento com resultado inexistente');
  return issues;
}

export function validateBody(body: StageBody, where: string): AcademyIssue[] {
  const issues: AcademyIssue[] = [];
  const add = (message: string) => issues.push({ where, message });
  if (body.learn.length < 3) add('"Aprender" precisa de ao menos 3 blocos');
  const interactive = body.learn.some((b) => b.kind === 'check' || b.kind === 'lab' || b.kind === 'sim' || (b.kind === 'example' && b.steps.some((s) => s.ask)) || b.kind === 'reveal');
  if (!interactive) add('"Aprender" sem nenhuma atividade interativa');
  if (body.practice.length < 2) add('"Praticar" precisa de ao menos 2 exercícios');
  if (body.challenge.length < 2) add('"Desafiar" precisa de ao menos 2 problemas');
  if (body.recap.length < 2) add('resumo de bolso precisa de ao menos 2 itens');
  for (const b of body.learn) {
    if (b.kind === 'check') issues.push(...validateDef(b.exercise, where, 'check'));
    if (b.kind === 'lab') issues.push(...validateLab(b.lab, where));
    if (b.kind === 'sim') issues.push(...validateSim(b.sim, where));
    if (b.kind === 'example') {
      if (b.steps.length < 2) add(`exemplo com menos de 2 passos: ${b.title}`);
      for (const s of b.steps) if (s.ask) validateOptions(s.ask.options, (m) => add(`exemplo "${b.title}": ${m}`));
    }
    if (b.kind === 'data' && b.block.kind === 'table') {
      const header = b.block.header;
      if (b.block.rows.some((r) => r.length !== header.length)) add('tabela com colunas inconsistentes');
    }
  }
  for (const e of body.practice) issues.push(...validateDef(e, where, 'practice'));
  for (const e of body.challenge) issues.push(...validateDef(e, where, 'challenge'));
  return issues;
}

function collectIds(body: StageBody): string[] {
  const ids: string[] = [];
  for (const b of body.learn) {
    if (b.kind === 'check') ids.push(b.exercise.id);
    else if (b.kind === 'example' || b.kind === 'reveal') ids.push(b.id);
    else if (b.kind === 'lab') ids.push(b.lab.id);
    else if (b.kind === 'sim') ids.push(b.sim.id);
  }
  return [...ids, ...body.practice.map((e) => e.id), ...body.challenge.map((e) => e.id)];
}

export function validateLesson(lesson: Lesson): AcademyIssue[] {
  const issues: AcademyIssue[] = [];
  const add = (message: string) => issues.push({ where: lesson.id, message });
  const topic = TOPICS.find((t) => t.id === lesson.topic);
  if (!topic) add(`assunto inexistente: ${lesson.topic}`);
  for (const s of lesson.subtopics) if (topic && !topic.subtopics.some((x) => x.id === s)) add(`subassunto inexistente: ${s}`);
  if (lesson.stages.length < 3) add('aula precisa de ao menos 3 etapas');
  if (!lesson.stages.some((s) => s.kind === 'maestria')) add('aula sem etapa de Maestria (preparo para as questões mais difíceis)');
  const ids = lesson.stages.map((s) => s.id);
  if (new Set(ids).size !== ids.length) add('etapas com id repetido');
  for (const r of lesson.requires) if (!LESSONS.some((l) => l.id === r)) add(`pré-requisito inexistente: ${r}`);
  for (const s of lesson.stages) {
    if (!textOk(s.goal, 15)) add(`etapa sem objetivo: ${s.id}`);
    issues.push(...validateBody(s.body(), stageRef(lesson.id, s.id)));
  }
  return issues;
}

export function validateAcademy(courses: Course[] = COURSES): AcademyIssue[] {
  const issues: AcademyIssue[] = [];
  const lessonIds = new Set<string>();
  const exerciseIds = new Map<string, string>();
  for (const c of courses) {
    if (!TOPICS.some((t) => t.id === c.topic)) issues.push({ where: c.topic, message: 'matéria sem assunto correspondente' });
    for (const l of c.lessons) {
      if (l.topic !== c.topic) issues.push({ where: l.id, message: `aula de ${l.topic} dentro da matéria ${c.topic}` });
      if (lessonIds.has(l.id)) issues.push({ where: l.id, message: 'aula com id repetido' });
      lessonIds.add(l.id);
      issues.push(...validateLesson(l));
      for (const s of l.stages) {
        for (const id of collectIds(s.body())) {
          const other = exerciseIds.get(id);
          if (other) issues.push({ where: stageRef(l.id, s.id), message: `id repetido: ${id} (também em ${other})` });
          exerciseIds.set(id, stageRef(l.id, s.id));
        }
      }
    }
  }
  // Pré-requisitos sem ciclo.
  const visiting = new Set<string>();
  const done = new Set<string>();
  const visit = (id: string, path: string[]): void => {
    if (done.has(id)) return;
    if (visiting.has(id)) {
      issues.push({ where: id, message: `pré-requisitos em ciclo: ${[...path, id].join(' → ')}` });
      return;
    }
    visiting.add(id);
    for (const r of LESSONS.find((l) => l.id === id)?.requires ?? []) visit(r, [...path, id]);
    visiting.delete(id);
    done.add(id);
  };
  for (const id of lessonIds) visit(id, []);
  return issues;
}

// ———————————————————————————————————————————————— cobertura do banco de questões

export interface Coverage {
  /** Subassuntos do banco sem nenhuma aula. */
  subtopicsWithoutLesson: string[];
  /** Questões do banco sem etapa associada. */
  unmappedQuestions: string[];
  /** Referências do mapa que não existem. */
  badRefs: string[];
  /** Questões cujas etapas não incluem nenhuma aula do próprio subassunto. */
  offSubtopic: string[];
}

export function academyCoverage(): Coverage {
  const subtopicsWithoutLesson: string[] = [];
  for (const t of TOPICS) {
    for (const s of t.subtopics) {
      if (!LESSONS.some((l) => l.topic === t.id && l.subtopics.includes(s.id))) subtopicsWithoutLesson.push(`${t.id}/${s.id}`);
    }
  }
  const unmappedQuestions: string[] = [];
  const badRefs: string[] = [];
  const offSubtopic: string[] = [];
  for (const q of QUESTIONS) {
    const refs = QUESTION_STAGES[q.id];
    if (!refs || refs.length === 0) {
      unmappedQuestions.push(q.id);
      continue;
    }
    const locs = refs.map((r) => ({ r, loc: findStage(r) }));
    for (const { r, loc } of locs) if (!loc) badRefs.push(`${q.id} → ${r}`);
    if (!locs.some(({ loc }) => loc && loc.lesson.topic === q.topic && loc.lesson.subtopics.includes(q.subtopic))) offSubtopic.push(q.id);
  }
  for (const id of Object.keys(QUESTION_STAGES)) if (!QUESTIONS.some((q) => q.id === id)) badRefs.push(`questão inexistente: ${id}`);
  return { subtopicsWithoutLesson, unmappedQuestions, badRefs, offSubtopic };
}

export interface AcademyReport {
  courses: number;
  lessons: number;
  stages: number;
  learnBlocks: number;
  labs: number;
  sims: number;
  examples: number;
  checks: number;
  practice: number;
  challenge: number;
  generators: number;
  byKind: Record<string, number>;
}

export function academyReport(courses: Course[] = COURSES): AcademyReport {
  const r: AcademyReport = { courses: courses.length, lessons: 0, stages: 0, learnBlocks: 0, labs: 0, sims: 0, examples: 0, checks: 0, practice: 0, challenge: 0, generators: 0, byKind: {} };
  const count = (def: ExerciseDef) => {
    if (def.kind === 'gen') r.generators++;
    const kind = def.kind === 'gen' ? `gen:${instantiate(def, 1).kind}` : def.kind;
    r.byKind[kind] = (r.byKind[kind] ?? 0) + 1;
  };
  for (const c of courses) {
    for (const l of c.lessons) {
      r.lessons++;
      for (const s of l.stages) {
        r.stages++;
        const body = s.body();
        r.learnBlocks += body.learn.length;
        for (const b of body.learn) {
          if (b.kind === 'lab') r.labs++;
          if (b.kind === 'sim') r.sims++;
          if (b.kind === 'example') r.examples++;
          if (b.kind === 'check') {
            r.checks++;
            count(b.exercise);
          }
        }
        r.practice += body.practice.length;
        r.challenge += body.challenge.length;
        body.practice.forEach(count);
        body.challenge.forEach(count);
      }
    }
  }
  return r;
}
