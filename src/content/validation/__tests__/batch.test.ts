/**
 * Ferramenta de autoria: valida um único lote de questões, sem depender do resto do banco.
 *   QF_BATCH=missoes/r1-m1-a npx jest batch              → valida o lote
 *   QF_BATCH=missoes/r1-m1-a QF_BLIND=1 npx jest batch   → imprime o lote SEM gabarito, dicas e resolução
 *   QF_BATCH=missoes/r1-m1-a QF_KEYS=1 npx jest batch    → imprime só os gabaritos
 * Sem QF_BATCH, o teste não faz nada (o banco inteiro é validado em bank.test.ts).
 */
import { ALT_KEYS, type Block, type Question } from '../../types';
import { validateQuestion } from '../validate';

const target = process.env.QF_BATCH;

function load(): Question[] {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require(`../../questions/${target}`) as Record<string, unknown>;
  return Object.values(mod).filter(Array.isArray).flat() as Question[];
}

function blockText(b: Block): string {
  switch (b.kind) {
    case 'p':
      return b.text;
    case 'math':
      return b.lines.join('\n');
    case 'table':
      return [b.caption ? `Tabela: ${b.caption}` : 'Tabela:', b.header.join(' | '), ...b.rows.map((r) => r.join(' | '))].join('\n');
    case 'bars':
      return [`Gráfico de barras${b.title ? `: ${b.title}` : ''}${b.unit ? ` (${b.unit})` : ''}`, ...b.data.map((d) => `${d.label}: ${d.value}`)].join('\n');
    case 'line':
      return [`Gráfico de linhas${b.title ? `: ${b.title}` : ''}${b.unit ? ` (${b.unit})` : ''}${b.showValues === false ? ' [sem valores sobre os pontos]' : ''}`, ...b.data.map((d) => `${d.label}: ${d.value}`)].join('\n');
    case 'pie':
      return [`Gráfico de setores${b.title ? `: ${b.title}` : ''}`, ...b.data.map((d) => `${d.label}: ${d.text ?? d.value} (ângulo proporcional a ${d.value})`)].join('\n');
    case 'figure':
      return `[Figura ${b.id}${b.caption ? ` — ${b.caption}` : ''}]`;
  }
}

(target ? describe : describe.skip)(`lote ${target}`, () => {
  it('imprime / valida', () => {
    const qs = load();
    if (process.env.QF_BLIND) {
      const out = qs.map((q) => ({
        id: q.id,
        dificuldade: q.difficulty,
        enunciado: q.stem.map(blockText).join('\n\n'),
        pergunta: q.ask,
        alternativas: Object.fromEntries(ALT_KEYS.map((k) => [k, q.alternatives[k]])),
      }));
      process.stdout.write(`\n=====BLIND=====\n${JSON.stringify(out, null, 2)}\n=====FIM=====\n`);
      return;
    }
    if (process.env.QF_KEYS) {
      process.stdout.write(`\n=====KEYS=====\n${JSON.stringify(Object.fromEntries(qs.map((q) => [q.id, q.answer])))}\n=====FIM=====\n`);
      return;
    }
    expect(qs.length).toBeGreaterThan(0);
    const ids = new Set<string>();
    const problems: string[] = [];
    for (const q of qs) {
      if (ids.has(q.id)) problems.push(`${q.id}: ID repetido no lote`);
      ids.add(q.id);
      for (const i of validateQuestion(q)) problems.push(`${i.questionId}: ${i.message}`);
      if (target?.startsWith('missoes/') && !q.verify) problems.push(`${q.id}: sem verify() (toda questão numérica precisa recalcular o gabarito)`);
    }
    expect(problems).toEqual([]);
  });
});
