/**
 * Validador do banco de questões — estrutural e matemático.
 * Roda nos testes (`npm run validate:content`) e bloqueia conteúdo inconsistente.
 */
import { ITEMS } from '../items';
import { TOPICS } from '../topics';
import { ALT_KEYS, type Question } from '../types';

export interface Issue {
  questionId: string;
  message: string;
}

const ID_PATTERN = /^[A-Z]{3}-\d{3}$/;
const SKILL_PATTERN = /^H([1-9]|[12]\d|30)$/;

/**
 * Extrai o valor numérico de uma alternativa em português.
 * Suporta: "R$ 1.250,00", "12,5%", "≈ 15%", "3/8", "1 : 400.000" (→ 400000),
 * "4 h 48 min" (→ 4,8 h), "2 h" (→ 2), números com unidade ("36 cm").
 * Retorna null quando não há número reconhecível.
 */
export function parseNumeric(text: string): number | null {
  const t = text.replace(/\s+/g, ' ').trim();

  const hm = t.match(/^(\d+) h(?: (\d+) min)?$/);
  if (hm) return Number(hm[1]) + (hm[2] ? Number(hm[2]) / 60 : 0);

  const scale = t.match(/^1 ?: ?([\d.]+)$/);
  if (scale) return parsePtNumber(scale[1]);

  const frac = t.match(/^(-?\d+)\/(\d+)$/);
  if (frac) return Number(frac[1]) / Number(frac[2]);

  const num = t.match(/-?\d{1,3}(?:\.\d{3})+(?:,\d+)?|-?\d+(?:,\d+)?/);
  if (!num) return null;
  return parsePtNumber(num[0]);
}

function parsePtNumber(s: string): number {
  return Number(s.replace(/\./g, '').replace(',', '.'));
}

export function validateQuestion(q: Question): Issue[] {
  const issues: Issue[] = [];
  const add = (message: string) => issues.push({ questionId: q.id, message });

  if (!ID_PATTERN.test(q.id)) add(`ID fora do padrão AAA-000: ${q.id}`);

  const topic = TOPICS.find((t) => t.id === q.topic);
  if (!topic) add(`assunto inexistente: ${q.topic}`);
  else if (!topic.subtopics.some((s) => s.id === q.subtopic)) add(`subassunto inexistente: ${q.subtopic}`);

  if (![1, 2, 3, 4].includes(q.difficulty)) add('dificuldade fora de 1–4');
  if (q.skills.length === 0) add('sem habilidades da matriz');
  for (const s of q.skills) if (!SKILL_PATTERN.test(s)) add(`habilidade inválida: ${s}`);

  if (q.stem.length === 0) add('enunciado vazio');
  for (const b of q.stem) {
    if (b.kind === 'p' && b.text.trim().length < 10) add('parágrafo muito curto');
    if (b.kind === 'table' && b.rows.some((r) => r.length !== b.header.length)) add('tabela com colunas inconsistentes');
    if (b.kind === 'bars' && b.data.length < 2) add('gráfico com menos de 2 barras');
  }
  if (q.ask.trim().length < 8) add('pergunta (ask) ausente ou curta');

  const keys = Object.keys(q.alternatives);
  if (keys.length !== 5 || !ALT_KEYS.every((k) => keys.includes(k))) add('alternativas devem ser exatamente A–E');
  const texts = ALT_KEYS.map((k) => (q.alternatives[k] ?? '').trim());
  if (texts.some((t) => t.length === 0)) add('alternativa vazia');
  if (new Set(texts.map((t) => t.toLowerCase())).size !== texts.length) add('alternativas repetidas');
  if (!ALT_KEYS.includes(q.answer)) add(`gabarito inválido: ${q.answer}`);

  if (q.hints.length !== 2 || q.hints.some((h) => h.trim().length < 10)) add('são necessárias 2 dicas');
  if (q.solution.length === 0) add('sem resolução');
  if (q.concept.trim().length < 20) add('explicação do conceito ausente');
  if (q.estimatedSeconds < 15 || q.estimatedSeconds > 600) add('tempo estimado fora de 15–600 s');

  // Alternativas embaralhadas a cada tentativa: textos não podem depender de letra ou posição.
  if (!q.fixedOrder) {
    const letterRef = /\b([Aa]lternativa|[Ll]etra|[Oo]p[çc][ãa]o|[Ii]tem)\s+["“(]?[A-E]\b|\(([A-E])\)\s*$|^[A-E]\)/;
    for (const text of [...q.hints, ...q.solution, q.concept]) {
      if (letterRef.test(text)) add(`texto cita alternativa pela letra (as alternativas são embaralhadas): "${text.slice(0, 60)}"`);
    }
    for (const text of texts) {
      if (/anterior(es)?\b|nenhuma das|todas as (alternativas|anteriores)|acima|abaixo/i.test(text)) {
        add(`alternativa depende da posição (as alternativas são embaralhadas): "${text}"`);
      }
    }
  }

  if (q.source.kind === 'enem') {
    if (!q.source.year || !q.source.license) add('questão oficial sem ano ou licença');
  }

  if (q.verify) {
    let expected: number;
    try {
      expected = q.verify();
    } catch (e) {
      add(`verify() lançou erro: ${String(e)}`);
      return issues;
    }
    if (!Number.isFinite(expected)) add('verify() não retornou número finito');
    const tol = q.tolerance ?? 1e-9;
    const values = ALT_KEYS.map((k) => parseNumeric(q.alternatives[k] ?? ''));
    const matches = ALT_KEYS.filter((_, i) => values[i] !== null && Math.abs((values[i] as number) - expected) <= tol);
    if (values[ALT_KEYS.indexOf(q.answer)] === null) add('alternativa correta não é numérica, mas há verify()');
    if (!matches.includes(q.answer)) add(`verify() = ${expected} não corresponde ao gabarito ${q.answer} (${q.alternatives[q.answer]})`);
    if (matches.length > 1) add(`verify() corresponde a mais de uma alternativa: ${matches.join(', ')}`);
  }

  return issues;
}

export function validateBank(questions: readonly Question[]): Issue[] {
  const issues: Issue[] = [];
  const seen = new Set<string>();
  for (const q of questions) {
    if (seen.has(q.id)) issues.push({ questionId: q.id, message: 'ID duplicado' });
    seen.add(q.id);
    issues.push(...validateQuestion(q));
  }
  return issues;
}

export function validateCatalog(): string[] {
  const problems: string[] = [];
  const ids = new Set<string>();
  for (const item of ITEMS) {
    if (ids.has(item.id)) problems.push(`item duplicado: ${item.id}`);
    ids.add(item.id);
  }
  return problems;
}

export interface BankReport {
  total: number;
  verified: number;
  byTopic: Record<string, number>;
  byDifficulty: Record<number, number>;
  answerDistribution: Record<string, number>;
}

export function bankReport(questions: readonly Question[]): BankReport {
  const byTopic: Record<string, number> = {};
  const byDifficulty: Record<number, number> = {};
  const answerDistribution: Record<string, number> = {};
  for (const q of questions) {
    byTopic[q.topic] = (byTopic[q.topic] ?? 0) + 1;
    byDifficulty[q.difficulty] = (byDifficulty[q.difficulty] ?? 0) + 1;
    answerDistribution[q.answer] = (answerDistribution[q.answer] ?? 0) + 1;
  }
  return {
    total: questions.length,
    verified: questions.filter((q) => q.verify).length,
    byTopic,
    byDifficulty,
    answerDistribution,
  };
}
