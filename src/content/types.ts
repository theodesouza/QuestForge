/**
 * Tipos do conteúdo educacional. Puro TypeScript: usado pelo domínio, pela UI
 * e pelo validador. Nenhuma dependência de React aqui.
 */

export type Difficulty = 1 | 2 | 3 | 4;
export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  1: 'Fácil',
  2: 'Médio',
  3: 'Difícil',
  4: 'Muito difícil',
};

export const ALT_KEYS = ['A', 'B', 'C', 'D', 'E'] as const;
export type AltKey = (typeof ALT_KEYS)[number];

/** Habilidades da Matriz de Referência de Matemática do ENEM (H1–H30). */
export type SkillCode =
  | 'H1' | 'H2' | 'H3' | 'H4' | 'H5' | 'H6' | 'H7' | 'H8' | 'H9' | 'H10'
  | 'H11' | 'H12' | 'H13' | 'H14' | 'H15' | 'H16' | 'H17' | 'H18' | 'H19' | 'H20'
  | 'H21' | 'H22' | 'H23' | 'H24' | 'H25' | 'H26' | 'H27' | 'H28' | 'H29' | 'H30';

export type TopicId =
  | 'basica'
  | 'razao-proporcao'
  | 'porcentagem'
  | 'financeira'
  | 'equacoes'
  | 'funcoes'
  | 'graficos'
  | 'estatistica'
  | 'probabilidade'
  | 'combinatoria'
  | 'geo-plana'
  | 'geo-espacial'
  | 'grandezas';

/** Figuras vetoriais registradas na UI (src/features/question/figures). */
export type FigureId =
  | 'terreno-L'
  | 'triangulo-rampa'
  | 'caixa-dagua'
  | 'praca-circular'
  | 'roleta-8';

/** Blocos que compõem um enunciado. */
export type Block =
  | { kind: 'p'; text: string }
  /** Linhas de destaque matemático (unicode: ², √, π, ·, ÷, ≤ …). */
  | { kind: 'math'; lines: string[] }
  | { kind: 'table'; header: string[]; rows: string[][]; caption?: string }
  | {
      kind: 'bars';
      title?: string;
      unit?: string;
      data: { label: string; value: number }[];
    }
  | { kind: 'figure'; id: FigureId; caption?: string };

export type QuestionSource =
  | { kind: 'autoral' }
  | { kind: 'enem'; year: number; edition: string; item: number; license: string };

/** Texto explica o motivo; as linhas de conta preservam a notação escrita pelo autor. */
export type SolutionStep = string | { explanation: string; calculation: string[] };

export interface Question {
  /** Estável e único: `<PREFIXO>-<NNN>`. Nunca reutilizar. */
  id: string;
  topic: TopicId;
  subtopic: string;
  difficulty: Difficulty;
  skills: SkillCode[];
  stem: Block[];
  /** Pergunta final, exibida em destaque logo acima das alternativas. */
  ask: string;
  alternatives: Record<AltKey, string>;
  answer: AltKey;
  /** Dicas graduais: a primeira orienta o raciocínio, a segunda indica o primeiro passo. */
  hints: [string, string];
  /** Resolução passo a passo. */
  solution: SolutionStep[];
  /** Conceito envolvido, em linguagem direta. */
  concept: string;
  estimatedSeconds: number;
  source: QuestionSource;
  /**
   * Recalcula a resposta a partir dos dados do enunciado. O validador exige que o
   * valor coincida com a alternativa correta e com nenhuma outra.
   */
  verify?: () => number;
  /** Tolerância absoluta na comparação de `verify` (respostas arredondadas). */
  tolerance?: number;
  /**
   * As alternativas são embaralhadas a cada tentativa. Marque `true` só quando a ordem
   * faz parte do sentido (ex.: alternativas que se referem umas às outras).
   */
  fixedOrder?: boolean;
}

export interface Subtopic {
  id: string;
  label: string;
}

export interface Topic {
  id: TopicId;
  label: string;
  short: string;
  /** Peso relativo no ENEM (1–5), usado para priorizar recomendações. */
  enemWeight: number;
  subtopics: Subtopic[];
}
