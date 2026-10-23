/**
 * Modelo de conteúdo da Academia QuestForge. TypeScript puro (sem React): usado pelo
 * domínio (progresso, diagnóstico), pela interface e pelo validador.
 *
 * Organização: Matéria (assunto do banco) → Aula (um ou mais subassuntos) → Etapas
 * progressivas. Cada etapa oferece três experiências: Aprender (explicação guiada,
 * laboratórios, exemplos resolvidos e verificações), Praticar (exercícios com dicas e
 * feedback específico) e Desafiar (problemas sem ajuda, que comprovam o domínio).
 */
import type { Block, TopicId } from '../types';

/** Etapas de referência; cada aula usa as que fazem sentido para o seu conteúdo. */
export type StageKind = 'descoberta' | 'fundamentos' | 'interpretacao' | 'aplicacoes' | 'aprofundamento' | 'maestria';

export const STAGE_KIND_LABEL: Record<StageKind, string> = {
  descoberta: 'Descoberta',
  fundamentos: 'Fundamentos',
  interpretacao: 'Interpretação',
  aplicacoes: 'Aplicações',
  aprofundamento: 'Aprofundamento',
  maestria: 'Maestria',
};

/** Cores semânticas resolvidas pela interface (tokens do design system). */
export type Tone = 'brass' | 'verdigris' | 'ember' | 'iris' | 'sky' | 'mist' | 'parchment';

/**
 * Texto com marcação mínima: **negrito**. Em resoluções e passos, uma linha que começa
 * com `$` é exibida como fórmula; em fórmulas, `[[a|b]]` vira uma fração empilhada.
 */
export type Rich = string;

// ———————————————————————————————————————————————— exercícios

export interface Option {
  text: Rich;
  correct: boolean;
  /** Por que esta alternativa está errada: obrigatória nas erradas (feedback específico). */
  feedback?: Rich;
}

interface ExerciseBase {
  id: string;
  /** Contexto do problema (mesmos blocos das questões: parágrafo, tabela, gráfico, figura). */
  prompt?: Block[];
  /** Pergunta, em destaque. */
  ask: Rich;
  /** Dicas graduais — só aparecem no modo Praticar. */
  hints?: Rich[];
  /** Resolução comentada, mostrada depois da resposta. */
  solution: Rich[];
  /** Ideia que o exercício treina (aparece no feedback). */
  idea?: Rich;
}

/** Múltipla escolha: cada alternativa errada explica o equívoco que a produz. */
export interface ChoiceExercise extends ExerciseBase {
  kind: 'choice';
  options: Option[];
  /** As alternativas são embaralhadas; marque quando a ordem fizer parte do sentido. */
  fixedOrder?: boolean;
  /** Recalcula a resposta; o validador exige que bata com a alternativa correta e com nenhuma outra. */
  verify?: () => number;
  tolerance?: number;
}

/** Resposta digitada: sem alternativas para "chutar". Valores típicos de erro têm feedback próprio. */
export interface NumberExercise extends ExerciseBase {
  kind: 'number';
  answer: number;
  /** Tolerância absoluta (padrão: 0,005 — aceita arredondamento ao centésimo). */
  tolerance?: number;
  /** Prefixo exibido no campo (ex.: "R$"). */
  prefix?: string;
  /** Unidade exibida depois do campo (ex.: "m²", "%", "dias"). */
  unit?: string;
  /** Respostas erradas previsíveis e o que cada uma revela. */
  wrong?: { value: number; feedback: Rich }[];
  /** Feedback para qualquer outro valor errado. */
  otherwise?: Rich;
  /** Exemplo de formato no campo vazio (ex.: "3/8 ou 0,375"). */
  placeholder?: string;
}

/** Montar a resolução: os passos aparecem embaralhados e o estudante põe em ordem. */
export interface OrderExercise extends ExerciseBase {
  kind: 'order';
  /** Passos na ordem correta. */
  steps: Rich[];
  why?: Rich;
}

/** Encontre o erro: uma resolução com exatamente um passo errado. */
export interface SpotExercise extends ExerciseBase {
  kind: 'spot';
  lines: Rich[];
  /** Índice da linha errada. */
  wrong: number;
  /** O que está errado e como corrigir. */
  why: Rich;
}

/** Identificar informações: marcar os dados necessários (e só eles) para responder. */
export interface SelectExercise extends ExerciseBase {
  kind: 'select';
  chips: { text: Rich; needed: boolean; why?: Rich }[];
}

/** Classificar: levar cada item para a categoria certa (ex.: direta × inversa). */
export interface ClassifyExercise extends ExerciseBase {
  kind: 'classify';
  bins: string[];
  items: { text: Rich; bin: number; why?: Rich }[];
}

/** Completar expressão: cada lacuna tem opções; texto fixo entre elas. */
export interface FillExercise extends ExerciseBase {
  kind: 'fill';
  parts: (string | { options: string[]; answer: number })[];
  why?: Rich;
}

export type Exercise =
  | ChoiceExercise
  | NumberExercise
  | OrderExercise
  | SpotExercise
  | SelectExercise
  | ClassifyExercise
  | FillExercise;

export type ExerciseKind = Exercise['kind'];

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
export type ExerciseDraft = DistributiveOmit<Exercise, 'id'>;

/** Gerador determinístico: os mesmos números para a mesma semente, outros a cada tentativa. */
export interface Rand {
  /** 0 ≤ x < 1 */
  next(): number;
  /** Inteiro em [min, max]. */
  int(min: number, max: number): number;
  pick<T>(items: readonly T[]): T;
  shuffle<T>(items: readonly T[]): T[];
}

export interface ExerciseGen {
  kind: 'gen';
  id: string;
  make: (r: Rand) => ExerciseDraft;
}

export type ExerciseDef = Exercise | ExerciseGen;

// ———————————————————————————————————————————————— visualizações dos laboratórios

export interface ChartSeries {
  label: string;
  tone: Tone;
  points: [number, number][];
  dashed?: boolean;
  /** Desenha os pontos como marcadores (dados discretos). */
  dots?: boolean;
}

export type Viz =
  | {
      kind: 'chart';
      xLabel: string;
      yLabel: string;
      xMin: number;
      xMax: number;
      yMin?: number;
      yMax?: number;
      xFormat?: (n: number) => string;
      yFormat?: (n: number) => string;
      series: ChartSeries[];
      markers?: { x: number; y: number; label: string; tone: Tone }[];
      summary: string;
    }
  | {
      kind: 'bars';
      bars: { label: string; value: number; tone?: Tone; text?: string }[];
      max?: number;
      refLine?: { value: number; label: string };
      summary: string;
    }
  | {
      kind: 'fraction';
      /** Partes iguais do todo e quantas estão destacadas. */
      parts: number;
      filled: number;
      shape: 'bar' | 'pie';
      tone?: Tone;
      /** Quantos "todos" desenhar (frações impróprias). */
      wholes?: number;
      summary: string;
    }
  | {
      kind: 'grid';
      rows: number;
      cols: number;
      /** Cor de cada célula, linha a linha (null = apagada). */
      cells: (Tone | null)[];
      legend: { tone: Tone; label: string }[];
      summary: string;
    }
  | {
      kind: 'parts';
      /** Barra empilhada (razões, misturas, composição de um total). */
      segments: { label: string; value: number; tone: Tone }[];
      summary: string;
    }
  | {
      kind: 'numberline';
      min: number;
      max: number;
      step?: number;
      points: { value: number; label: string; tone: Tone }[];
      arrows?: { from: number; to: number; label: string; tone: Tone }[];
      summary: string;
    }
  | {
      kind: 'dots';
      min: number;
      max: number;
      values: number[];
      marks: { value: number; label: string; tone: Tone }[];
      summary: string;
    }
  | {
      kind: 'timeline';
      length: number;
      unit: string;
      tracks: { label: string; period: number; offset?: number; tone: Tone }[];
      summary: string;
    }
  | {
      kind: 'shape';
      shape: 'rect' | 'triangle' | 'circle' | 'ring' | 'box' | 'cylinder' | 'sector';
      /** Medidas na escala do desenho (a interface ajusta ao espaço disponível). */
      dims: number[];
      labels: string[];
      /** 0–1: fração preenchida (nível de água, setor). */
      fill?: number;
      summary: string;
    };

export type LabValues = Record<string, number>;

export interface LabParam {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  format: (v: number) => string;
}

export interface LabReadout {
  label: string;
  value: string;
  tone?: Tone;
  big?: boolean;
}

/** Laboratório: o estudante mexe nos parâmetros e observa as consequências. */
export interface LabSpec {
  id: string;
  title: string;
  intro: Rich;
  params: LabParam[];
  readouts: (v: LabValues) => LabReadout[];
  viz?: (v: LabValues) => Viz;
  /** Missão do laboratório: uma condição a alcançar mexendo nos controles. */
  goal?: { task: Rich; done: (v: LabValues) => boolean; success: Rich };
  /** O que observar. */
  insight?: Rich;
}

/** Simulação de um experimento aleatório: frequência observada × probabilidade teórica. */
export interface SimSpec {
  id: string;
  title: string;
  intro: Rich;
  outcomes: { label: string; p: number }[];
  /** Evento de interesse: quais resultados contam como "sucesso". */
  event?: { label: string; outcomes: number[] };
  insight: Rich;
}

// ———————————————————————————————————————————————— blocos de "Aprender"

export interface ExampleStep {
  text: Rich;
  math?: string[];
  /** Antes de revelar o passo, o estudante escolhe o próximo movimento. */
  ask?: { question: Rich; options: Option[] };
}

export type CalloutTone = 'key' | 'tip' | 'warn' | 'enem' | 'strategy';

export type LearnBlock =
  | { kind: 'text'; text: Rich }
  | { kind: 'math'; lines: string[]; caption?: Rich }
  | { kind: 'callout'; tone: CalloutTone; title: string; text: Rich }
  | { kind: 'data'; block: Block }
  | { kind: 'example'; id: string; title: string; problem: Block[]; steps: ExampleStep[]; result?: Rich }
  | { kind: 'reveal'; id: string; prompt: Rich; answer: Rich }
  | { kind: 'check'; exercise: ExerciseDef }
  | { kind: 'lab'; lab: LabSpec }
  | { kind: 'sim'; sim: SimSpec }
  | { kind: 'compare'; title?: string; columns: { title: string; tone: Tone; lines: Rich[] }[] };

// ———————————————————————————————————————————————— estrutura

export interface StageBody {
  learn: LearnBlock[];
  practice: ExerciseDef[];
  challenge: ExerciseDef[];
  /** Quantos problemas o desafio sorteia do conjunto (padrão: até 3). */
  challengeSize?: number;
  /** Resumo de bolso: o essencial da etapa, para consulta rápida. */
  recap: Rich[];
}

export interface Stage {
  /** Único dentro da aula. A referência global é `aula/etapa`. */
  id: string;
  kind: StageKind;
  title: string;
  /** Ao final da etapa, o que o estudante consegue fazer. */
  goal: Rich;
  /** Conteúdo montado sob demanda (e memorizado): o catálogo carrega leve na abertura do app. */
  body: () => StageBody;
}

export interface Lesson {
  id: string;
  topic: TopicId;
  /** Subassuntos do banco de questões que a aula cobre. */
  subtopics: string[];
  title: string;
  summary: Rich;
  /** Aulas que ajudam antes desta (sugestão — nunca bloqueia o acesso). */
  requires: string[];
  stages: Stage[];
}

export interface Course {
  topic: TopicId;
  title: string;
  tagline: string;
  tone: Tone;
  lessons: Lesson[];
}
