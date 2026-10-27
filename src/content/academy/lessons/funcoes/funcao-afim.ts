/**
 * Aula: Função afim — parte fixa e taxa (f(x) = ax + b), calcular f(x) e achar x a partir do
 * valor, taxa de variação a partir de dois pontos ou de uma tabela, crescente × decrescente,
 * modelar e prever, zero da função (quando acaba) e comparação de duas funções.
 */
import {
  askStep,
  check,
  classify,
  data,
  draftNumeric,
  example,
  gen,
  key,
  lab,
  lesson,
  no,
  numeric,
  ok,
  p,
  reveal,
  sample,
  stage,
  step,
  strategy,
  table,
  text,
} from '../../kit/build';
import { brl, fixed, num, round } from '../../kit/format';
import type { Rand } from '../../types';

const isInt = (x: number) => Number.isInteger(round(x, 9));
const rs = (x: number) => (isInt(x) ? num(x) : fixed(x, 2));
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

const RATES = [
  {
    who: 'Um aplicativo de corridas cobra',
    fixed: 'de tarifa base',
    per: 'por quilômetro',
    unit: 'km',
    one: 'quilômetro',
    many: 'quilômetros',
    cost: (x: number) => `Quanto custa uma corrida de ${x} km?`,
    howMany: 'Quantos quilômetros teve a corrida?',
  },
  {
    who: 'Um eletricista cobra',
    fixed: 'pela visita',
    per: 'por hora de trabalho',
    unit: 'h',
    one: 'hora',
    many: 'horas',
    cost: (x: number) => `Quanto custa um serviço de ${x} horas?`,
    howMany: 'Quantas horas de trabalho foram cobradas?',
  },
  {
    who: 'Uma locadora de bicicletas cobra',
    fixed: 'de taxa de retirada',
    per: 'por hora de uso',
    unit: 'h',
    one: 'hora',
    many: 'horas',
    cost: (x: number) => `Quanto custa usar a bicicleta por ${x} horas?`,
    howMany: 'Por quantas horas a bicicleta foi usada?',
  },
];

// ———————————————————————————————————————————————— geradores: parte fixa e taxa

/** Calcular f(x) = b + a·x numa situação. */
function evalGen(r: Rand) {
  for (;;) {
    const c = r.pick(RATES);
    const b = r.pick([3, 4, 5, 6, 8, 10, 12, 15]);
    const a = r.pick([1.5, 2, 2.5, 3, 3.5, 4, 5]);
    const x = r.int(3, 20);
    if (b === 5 && a === 2.5 && x === 12) continue; // questão do banco
    const f = b + a * x;
    return draftNumeric({
      prompt: [p(`${c.who} ${brl(b)} ${c.fixed} mais ${brl(a)} ${c.per}.`)],
      ask: c.cost(x),
      prefix: 'R$',
      answer: round(f, 2),
      wrong: [
        { value: round(a * x, 2), feedback: `Isso esquece a parte fixa de ${brl(b)}, que se paga de qualquer jeito.` },
        { value: round((a + b) * x, 2), feedback: `Isso multiplica também a parte fixa por ${x}. Ela é paga uma vez só.` },
        { value: round(b * x + a, 2), feedback: `Isso troca os papéis: ${brl(a)} é o valor ${c.per}, e ${brl(b)} é a parte fixa.` },
      ],
      hints: [`f(x) = ${rs(b)} + ${rs(a)}x, com x em ${c.many}.`, `Substitua x = ${x}.`],
      solution: [`$f(${x}) = ${rs(b)} + ${rs(a)} × ${x} = ${rs(b)} + ${rs(a * x)} = ${rs(f)}`],
    });
  }
}

/** Achar x a partir do valor pago: desfazer a função. */
function inverseGen(r: Rand) {
  for (;;) {
    const c = r.pick(RATES);
    const b = r.pick([3, 4, 5, 6, 8, 10, 12, 15]);
    const a = r.pick([1.5, 2, 2.5, 3, 3.5, 4, 5]);
    const x = r.int(3, 24);
    const f = b + a * x;
    if (b === 5 && a === 2.5 && f === 45) continue; // questão do banco
    if (b === 6 && a === 3 && f === 39) continue; // laboratório da teoria
    return draftNumeric({
      prompt: [p(`${c.who} ${brl(b)} ${c.fixed} mais ${brl(a)} ${c.per}. Um cliente pagou ${brl(f)}.`)],
      ask: c.howMany,
      unit: c.unit,
      answer: x,
      wrong: [
        { value: round(f / a, 2), feedback: `Isso divide o total pelo preço ${c.per}, esquecendo que ${brl(b)} são a parte fixa.` },
        { value: round((f + b) / a, 2), feedback: 'Isso soma a parte fixa ao total. Ela já está dentro do valor pago: precisa sair.' },
        { value: round(f - b, 2), feedback: `${brl(f - b)} é a parte variável, em reais. Falta dividir por ${brl(a)}.` },
      ],
      hints: [`Tire a parte fixa: ${rs(f)} − ${rs(b)} = ${rs(f - b)}.`, `Divida pelo preço ${c.per}: ${rs(f - b)} ÷ ${rs(a)}.`],
      solution: [`$${rs(b)} + ${rs(a)}x = ${rs(f)}`, `$${rs(a)}x = ${rs(f - b)} → x = ${x}`],
    });
  }
}

// ———————————————————————————————————————————————— geradores: taxa de variação

/** Dois registros de uma situação: a taxa (preço por unidade) ou a parte fixa. */
function twoPointsGen(r: Rand) {
  for (;;) {
    const c = r.pick(RATES);
    const b = r.pick([4, 5, 6, 8, 10, 12, 15, 20]);
    const a = r.pick([2, 2.5, 3, 4, 5, 6]);
    const x1 = r.int(1, 6);
    const x2 = x1 + r.int(2, 6);
    const y1 = b + a * x1;
    const y2 = b + a * x2;
    const askA = r.next() < 0.5;
    return draftNumeric({
      prompt: [p(`${c.who} uma parte fixa mais um valor ${c.per}. Por ${x1} ${x1 === 1 ? c.one : c.many}, cobrou ${brl(y1)}; por ${x2} ${c.many}, cobrou ${brl(y2)}.`)],
      ask: askA ? `Qual é o valor cobrado ${c.per}?` : 'Qual é a parte fixa?',
      prefix: 'R$',
      answer: askA ? a : b,
      wrong: (askA
        ? [
            { value: round(y2 / x2, 2), feedback: 'Isso divide um total pelas unidades, misturando a parte fixa no preço por unidade. Use a diferença entre os dois registros.' },
            { value: round(y2 - y1, 2), feedback: `Essa diferença corresponde a ${x2 - x1} ${c.many}, e não a uma só: divida por ${x2 - x1}.` },
            { value: b, feedback: 'Essa é a parte fixa. A pergunta é o valor por unidade.' },
          ]
        : [
            { value: round(y1 - a, 2), feedback: `Isso tira do primeiro valor o preço de uma unidade só. Foram ${x1}: tire ${x1} × ${brl(a)}.` },
            { value: round(y1 / x1, 2), feedback: 'Isso divide o primeiro total pelas unidades: dá um "preço médio", e não a parte fixa.' },
            { value: a, feedback: 'Esse é o valor por unidade. A parte fixa é o que sobra quando se tira a parte variável.' },
          ]
      ).filter((w) => w.value > 0),
      hints: [
        `De ${x1} para ${x2} ${c.many}, o valor subiu ${rs(y2)} − ${rs(y1)} = ${brl(y2 - y1)}.`,
        askA ? `Divida por ${x2 - x1} ${c.many}.` : `Preço por unidade: ${rs(y2 - y1)} ÷ ${x2 - x1} = ${rs(a)}; tire ${x1} × ${rs(a)} de ${rs(y1)}.`,
      ],
      solution: [`$a = (${rs(y2)} − ${rs(y1)}) ÷ (${x2} − ${x1}) = ${rs(a)}`, `$b = ${rs(y1)} − ${x1} × ${rs(a)} = ${rs(b)}`],
    });
  }
}

/** Tabela com três valores de uma função afim: prever outro valor. */
function tableNextGen(r: Rand) {
  for (;;) {
    const b = r.int(-5, 20);
    const a = r.pick([2, 3, 4, 5, 6, 7]);
    const xs = [1, 2, 4];
    const xq = r.pick([7, 8, 10, 12, 15]);
    const f = (x: number) => b + a * x;
    if (b === 0 || xs.some((x) => f(x) <= 0)) continue;
    const ans = f(xq);
    return draftNumeric({
      prompt: [p('A tabela mostra alguns valores de uma função afim f.'), table(['x', ...xs.map(String)], [['f(x)', ...xs.map((x) => String(f(x)))]])],
      ask: `Qual é o valor de f(${xq})?`,
      answer: ans,
      wrong: [
        { value: round(f(4) * (xq / 4), 2), feedback: `Isso supõe que f é proporcional a x (f(${xq}) = f(4) × ${num(xq / 4, 2)}). Com parte fixa, isso não vale.` },
        { value: a * xq, feedback: 'Isso usa só a taxa e esquece a parte fixa (o valor em x = 0).' },
        { value: f(4) + a * (xq - 4) + a, feedback: `Isso soma a taxa uma vez a mais. De x = 4 até x = ${xq}, são ${xq - 4} passos de ${a}.` },
      ],
      hints: [`De x = 1 para x = 2, f aumenta ${a}: essa é a taxa.`, `f(${xq}) = f(4) + ${a} × (${xq} − 4).`],
      solution: [`$taxa: ${f(2)} − ${f(1)} = ${a}`, `$f(${xq}) = ${f(4)} + ${a} × ${xq - 4} = ${ans}`],
    });
  }
}

// ———————————————————————————————————————————————— geradores: modelar e prever

const DRAIN = [
  {
    unit: 'L',
    rates: [10, 15, 20, 25, 30, 40, 50],
    span: [10, 60] as const,
    tu: 'min',
    t: 'minutos',
    gone: 'o que já saiu',
    intro: (q: number, v: number) => `Uma caixa-d’água com ${num(q)} L esvazia à razão constante de ${num(v)} L por minuto.`,
    end: 'Em quantos minutos a caixa esvazia?',
    left: (t: number) => `Quantos litros restam depois de ${t} minutos?`,
  },
  {
    unit: 'cm',
    rates: [0.5, 1, 1.5, 2, 2.5],
    span: [6, 40] as const,
    tu: 'h',
    t: 'horas',
    gone: 'o que já derreteu',
    intro: (q: number, v: number) => `Uma vela de ${num(q)} cm derrete à razão constante de ${num(v)} cm por hora.`,
    end: 'Em quantas horas a vela acaba?',
    left: (t: number) => `Que altura terá a vela depois de ${t} horas?`,
  },
  {
    unit: 'L',
    rates: [2, 2.5, 3, 4, 5, 6, 8],
    span: [5, 30] as const,
    tu: 'h',
    t: 'horas',
    gone: 'o que já foi consumido',
    intro: (q: number, v: number) => `Um gerador tem ${num(q)} L de combustível no tanque e consome ${num(v)} L por hora.`,
    end: 'Em quantas horas o combustível acaba?',
    left: (t: number) => `Quantos litros restam no tanque depois de ${t} horas?`,
  },
];

/** Função decrescente: quando acaba (zero) ou quanto resta. */
function drainGen(r: Rand) {
  for (;;) {
    const d = r.pick(DRAIN);
    const v = r.pick(d.rates);
    const T = r.int(d.span[0], d.span[1]);
    const h0 = v * T;
    if (d.unit === 'cm' && (h0 > 40 || h0 < 8 || !isInt(h0))) continue;
    if (d.unit === 'cm' && h0 === 24 && v === 1.5) continue; // laboratório da teoria
    if (d.t === 'minutos' && h0 === 1200 && v === 40) continue; // exemplo da teoria
    const askZero = r.next() < 0.5;
    const t = r.int(2, T - 1);
    return draftNumeric({
      prompt: [p(d.intro(h0, v))],
      ask: askZero ? d.end : d.left(t),
      unit: askZero ? d.tu : d.unit,
      answer: askZero ? T : round(h0 - v * t, 2),
      wrong: askZero
        ? [
            { value: round(h0 * v, 2), feedback: 'Isso multiplica a quantidade pela taxa. O tempo até acabar é quantidade ÷ taxa.' },
            { value: round(T / 2, 2), feedback: 'Isso é a metade do tempo: é quando resta metade, e não quando acaba.' },
          ]
        : [
            { value: round(v * t, 2), feedback: `Isso é ${d.gone} em ${t} ${d.t}. A pergunta é quanto resta.` },
            { value: round(h0 + v * t, 2), feedback: 'Isso soma o consumo. A quantidade diminui com o tempo: subtraia.' },
            { value: round(h0 - v, 2), feedback: `Isso tira o consumo de uma só unidade de tempo. Foram ${t}.` },
          ],
      hints: [`f(t) = ${num(h0)} − ${num(v)}t, com t em ${d.t}.`, askZero ? `Iguale a zero: ${num(v)}t = ${num(h0)}.` : `Substitua t = ${t}.`],
      solution: askZero ? [`$${num(h0)} − ${num(v)}t = 0 → t = ${num(h0)} ÷ ${num(v)} = ${T}`] : [`$f(${t}) = ${num(h0)} − ${num(v)} × ${t} = ${num(round(h0 - v * t, 2))}`],
    });
  }
}

const GROW = [
  {
    intro: 'Uma muda de árvore cresce sempre o mesmo tanto por mês.',
    at: (n: number, v: number) => `no ${n}º mês, media ${v} cm`,
    ask: (n: number) => `Mantido o ritmo, que altura terá no ${n}º mês?`,
    per: 'mês',
    money: false,
    unit: 'cm',
  },
  {
    intro: 'Um cofrinho recebe sempre a mesma quantia por semana.',
    at: (n: number, v: number) => `na ${n}ª semana, tinha ${brl(v)}`,
    ask: (n: number) => `Mantido o ritmo, quanto terá na ${n}ª semana?`,
    per: 'semana',
    money: true,
    unit: '',
  },
  {
    intro: 'Uma biblioteca comunitária recebe sempre o mesmo número de livros doados por semana.',
    at: (n: number, v: number) => `na ${n}ª semana, tinha ${v} livros`,
    ask: (n: number) => `Mantido o ritmo, quantos livros terá na ${n}ª semana?`,
    per: 'semana',
    money: false,
    unit: 'livros',
  },
];

/** Crescimento constante a partir de dois registros: prever um valor futuro. */
function predictGen(r: Rand) {
  const g = r.pick(GROW);
  const y0 = r.int(10, 80);
  const a = r.int(2, 15);
  const t1 = r.int(1, 4);
  const t2 = t1 + r.int(2, 5);
  const tq = t2 + r.int(3, 10);
  const y1 = y0 + a * t1;
  const y2 = y0 + a * t2;
  const yq = y0 + a * tq;
  return draftNumeric({
    prompt: [p(`${g.intro} ${cap(g.at(t1, y1))}; ${g.at(t2, y2)}.`)],
    ask: g.ask(tq),
    ...(g.money ? { prefix: 'R$' } : { unit: g.unit }),
    answer: yq,
    wrong: [
      { value: round((y2 / t2) * tq, 2), feedback: 'Isso supõe que o valor é proporcional ao tempo. Havia um valor inicial: use o crescimento por período.' },
      { value: y2 + a, feedback: 'Isso avança um período só a partir do último registro.' },
      { value: y2 + (y2 - y1) * (tq - t2), feedback: `Isso usa a diferença entre os registros (${t2 - t1} períodos) como se fosse o crescimento de um período só.` },
    ],
    hints: [`Crescimento por ${g.per}: (${y2} − ${y1}) ÷ ${t2 - t1} = ${a}.`, `Do registro ${t2} ao ${tq}, são ${tq - t2} períodos.`],
    solution: [`$taxa: (${y2} − ${y1}) ÷ ${t2 - t1} = ${a} por ${g.per}`, `$${y2} + ${a} × ${tq - t2} = ${yq}`],
  });
}

/** Duas funções afins: quando se igualam. */
function compareGen(r: Rand) {
  for (;;) {
    const ba = r.int(20, 80);
    const aa = r.int(2, 6);
    const ab = aa + r.int(1, 5);
    const x = r.int(4, 30);
    const bb = ba + (aa - ab) * x;
    if (bb <= 0) continue;
    return draftNumeric({
      prompt: [p(`Lúcia tem ${brl(ba)} guardados e passa a guardar mais ${brl(aa)} por semana; Davi tem ${brl(bb)} e passa a guardar ${brl(ab)} por semana.`)],
      ask: 'Depois de quantas semanas os dois terão a mesma quantia?',
      unit: 'semanas',
      answer: x,
      wrong: [
        { value: round((ba - bb) / ab, 2), feedback: 'Isso divide a diferença inicial pelo depósito de Davi. Quem fecha a diferença é a diferença entre os depósitos semanais.' },
        { value: round((ba + bb) / (ab - aa), 2), feedback: 'Isso soma os valores iniciais. A diferença entre eles é que precisa ser compensada.' },
        { value: ba - bb, feedback: 'Essa é a diferença inicial, em reais. Divida pela diferença entre os depósitos semanais.' },
      ],
      hints: [`Lúcia: ${ba} + ${aa}x; Davi: ${bb} + ${ab}x.`, `Iguale: ${ba - bb} = ${ab - aa}x.`],
      solution: [`$${ba} + ${aa}x = ${bb} + ${ab}x`, `$${ab - aa}x = ${ba - bb} → x = ${x}`],
    });
  }
}

// ———————————————————————————————————————————————— aula

export const FUNCAO_AFIM = lesson({
  id: 'funcao-afim',
  topic: 'funcoes',
  subtopics: ['funcao-afim'],
  title: 'Função afim',
  summary: 'f(x) = ax + b: parte fixa e taxa, calcular e desfazer, taxa de variação a partir de dados, funções que crescem ou diminuem, prever, achar o zero e comparar duas funções.',
  requires: ['equacao-1grau'],
  stages: [
    stage('fixo-variavel', 'descoberta', 'Parte fixa e taxa', 'Reconhecer a parte fixa e a taxa de uma função afim f(x) = ax + b, calcular f(x) para um valor de x e descobrir x a partir do valor da função.', () => ({
      learn: [
        text('Uma **função afim** tem a forma f(x) = a·x + b: uma **parte fixa** b (o valor quando x = 0) e uma **taxa** a, o quanto f aumenta a cada unidade de x. No táxi, a bandeirada é a parte fixa, e o preço por quilômetro, a taxa: f(x) = bandeirada + preço por km × x.'),
        lab({
          title: 'Monte a função',
          intro: 'Escolha a parte fixa e a taxa de uma corrida e veja o gráfico do preço em função da distância.',
          params: [
            { key: 'b', label: 'Parte fixa (b)', min: 0, max: 20, step: 1, value: 4, format: (v) => brl(v) },
            { key: 'a', label: 'Preço por km (a)', min: 0.5, max: 5, step: 0.5, value: 2, format: (v) => brl(v) },
            { key: 'x', label: 'Distância (x)', min: 0, max: 20, step: 1, value: 5, format: (v) => `${v} km` },
          ],
          readouts: ({ b, a, x }) => [
            { label: 'Função', value: `f(x) = ${rs(a)}x + ${rs(b)}` },
            { label: `f(${x})`, value: brl(b + a * x), big: true, tone: 'brass' },
          ],
          viz: ({ b, a, x }) => ({
            kind: 'chart',
            xLabel: 'distância (km)',
            yLabel: 'preço (R$)',
            xMin: 0,
            xMax: 20,
            yMin: 0,
            series: [{ label: 'preço da corrida', tone: 'brass', points: sample(0, 20, 4, (t) => b + a * t) }],
            markers: [{ x, y: b + a * x, label: brl(b + a * x), tone: 'verdigris' }],
            yFormat: (y) => num(y, 0),
            summary: `Com f(x) = ${rs(a)}x + ${rs(b)}, uma corrida de ${x} km custa ${brl(b + a * x)}`,
          }),
          goal: {
            task: 'Com tarifa base de R$ 6,00 e R$ 3,00 por km, ache a distância de uma corrida que custou R$ 39,00.',
            done: ({ b, a, x }) => b === 6 && Math.abs(a - 3) < 1e-9 && x === 11,
            success: 'Isso: 6 + 3 × 11 = 39. Sem tentativas: tire a parte fixa (39 − 6 = 33) e divida pela taxa (33 ÷ 3 = 11).',
          },
          insight: 'A parte fixa é onde a reta começa (x = 0); a taxa é quanto ela sobe a cada quilômetro.',
        }),
        key('Duas leituras', 'Calcular f(x): substitua x e faça as contas. Achar x a partir do valor: desfaça — tire a parte fixa e divida pela taxa.'),
        example('Uma conta de água', 'Uma conta de água é calculada por f(x) = 12 + 4,50x, com x em m³. Quanto custam 8 m³? E quantos m³ dão uma conta de R$ 75,00?', [
          step('Para 8 m³:', 'f(8) = 12 + 4,50 × 8 = 12 + 36 = R$ 48,00'),
          askStep('Para a conta de R$ 75,00, desfaça.', 'Quantos m³?', [
            ok('(75 − 12) ÷ 4,50 = 14 m³'),
            no('75 ÷ 4,50 ≈ 16,7 m³', 'Os R$ 12,00 fixos estão dentro dos R$ 75,00: tire-os antes de dividir pela taxa.'),
          ]),
        ], '8 m³ custam R$ 48,00; uma conta de R$ 75,00 corresponde a 14 m³.'),
        check(numeric({
          prompt: [p('Um encanador cobra R$ 40,00 pela visita mais R$ 25,00 por hora de trabalho. Um serviço custou R$ 152,50.')],
          ask: 'Quantas horas durou o serviço?',
          unit: 'h',
          answer: 4.5,
          wrong: [
            { value: 6.1, feedback: 'Isso divide o total por R$ 25,00, esquecendo que R$ 40,00 são da visita.' },
            { value: 7.7, feedback: 'Isso soma os R$ 40,00 ao total. Eles já estão dentro do valor pago: precisam sair.' },
            { value: 112.5, feedback: 'R$ 112,50 é a parte variável, em reais. Falta dividir por R$ 25,00 por hora.' },
          ],
          solution: ['$40 + 25x = 152,50', '$25x = 112,50 → x = 4,5 h'],
        })),
      ],
      practice: [gen(evalGen), gen(inverseGen), gen(evalGen)],
      challenge: [gen(inverseGen), gen(evalGen), gen(inverseGen)],
      recap: [
        'f(x) = ax + b: b é a parte fixa; a, a taxa por unidade.',
        'Calcular: substitua x.',
        'Desfazer: tire a parte fixa e divida pela taxa.',
      ],
    })),

    stage('taxa-de-variacao', 'fundamentos', 'Taxa de variação', 'Encontrar a taxa e a parte fixa de uma função afim a partir de dois pontos ou de uma tabela e reconhecer funções crescentes, decrescentes e constantes.', () => ({
      learn: [
        text('A **taxa de variação** a diz quanto f(x) muda quando x aumenta 1. Com dois pontos (x₁; y₁) e (x₂; y₂): a = (y₂ − y₁) ÷ (x₂ − x₁). A parte fixa vem de qualquer um deles: b = y₁ − a·x₁. Se a > 0, a função é **crescente**; se a < 0, **decrescente**; se a = 0, **constante**.'),
        data(table(['Roupa lavada (kg)', '2', '5'], [['Preço (R$)', '14,00', '26,00']], 'Uma lavanderia que cobra uma parte fixa mais um valor por quilo')),
        example('A fórmula a partir da tabela', 'Com a tabela acima, escreva a fórmula do preço da lavanderia em função dos quilos de roupa.', [
          step('Taxa:', 'a = (26 − 14) ÷ (5 − 2) = 12 ÷ 3 = R$ 4,00 por quilo'),
          askStep('Agora, a parte fixa.', 'Quanto vale b?', [
            ok('b = 14 − 4 × 2 = R$ 6,00'),
            no('b = 14 ÷ 2 = R$ 7,00', 'Dividir o total pelos quilos mistura a parte fixa no preço por quilo. Tire a parte variável: 14 − 4 × 2.'),
          ]),
        ], 'f(x) = 4x + 6.'),
        check(classify({
          ask: 'Classifique cada função pela taxa de variação.',
          bins: ['Crescente', 'Decrescente', 'Constante'],
          items: [
            { text: 'f(x) = 3x + 2', bin: 0, why: 'A taxa é 3, positiva.' },
            { text: 'f(x) = −2x + 10', bin: 1, why: 'A taxa é −2: a cada unidade, f diminui 2.' },
            { text: 'f(x) = 7', bin: 2, why: 'Não depende de x: a taxa é zero.' },
            { text: 'Litros num tanque que esvazia 5 L por minuto', bin: 1, why: 'Perde 5 L a cada minuto: taxa −5.' },
            { text: 'Salário fixo de R$ 2.000,00, sem comissão', bin: 2, why: 'Não muda com as vendas.' },
            { text: 'Preço de uma corrida pela distância', bin: 0, why: 'Cada quilômetro a mais aumenta o preço.' },
          ],
          solution: ['O sinal da taxa a decide: positivo, crescente; negativo, decrescente; zero, constante.'],
        })),
        reveal('Por que "proporcional" é diferente de "afim"?', 'Numa grandeza proporcional (f(x) = ax), dobrar x dobra f. Com parte fixa (b ≠ 0), não: se 2 kg custam R$ 14,00, 4 kg não custam R$ 28,00, e sim 6 + 4 × 4 = R$ 22,00. A parte fixa não dobra.'),
      ],
      practice: [gen(twoPointsGen), gen(tableNextGen), gen(twoPointsGen)],
      challenge: [gen(tableNextGen), gen(twoPointsGen), gen(predictGen)],
      recap: [
        'Taxa a = Δy ÷ Δx.',
        'Parte fixa b = y₁ − a·x₁.',
        'Com parte fixa, a função não é proporcional.',
      ],
    })),

    stage('modelar', 'aplicacoes', 'Modelar e prever', 'Escrever a função afim de uma situação, prever valores, achar o zero de funções decrescentes e descobrir quando duas funções se igualam.', () => ({
      learn: [
        text('Para **modelar**, identifique a parte fixa e a taxa — no texto ou em dois registros — e escreva f(x). Com ela, dá para prever. Quando algo **diminui** a cada unidade (um tanque esvaziando, uma vela derretendo), a taxa é negativa, e o **zero** da função, f(x) = 0, indica quando acaba.'),
        lab({
          title: 'Uma vela queimando',
          intro: 'Uma vela derrete à razão constante. Escolha a altura inicial e a velocidade.',
          params: [
            { key: 'h', label: 'Altura inicial', min: 10, max: 30, step: 1, value: 20, format: (v) => `${v} cm` },
            { key: 'v', label: 'Derrete por hora', min: 0.5, max: 3, step: 0.5, value: 2, format: (v) => `${num(v)} cm` },
          ],
          readouts: ({ h, v }) => [
            { label: 'Função', value: `f(t) = ${h} − ${num(v)}t` },
            { label: 'Dura', value: `${num(h / v, 1)} horas`, big: true, tone: 'brass' },
          ],
          viz: ({ h, v }) => ({
            kind: 'chart',
            xLabel: 'tempo (h)',
            yLabel: 'altura (cm)',
            xMin: 0,
            xMax: 60,
            yMin: 0,
            series: [{ label: 'altura da vela', tone: 'ember', points: [[0, h], [h / v, 0]] }],
            markers: [{ x: h / v, y: 0, label: `${num(h / v, 1)} h`, tone: 'brass' }],
            summary: `Uma vela de ${h} cm que derrete ${num(v)} cm por hora dura ${num(h / v, 1)} horas`,
          }),
          goal: {
            task: 'Com uma vela de 24 cm, ache a velocidade que faz ela durar exatamente 16 horas.',
            done: ({ h, v }) => h === 24 && Math.abs(v - 1.5) < 1e-9,
            success: 'Isso: 24 − 1,5t = 0 → t = 16. O zero da função é a altura inicial dividida pela taxa.',
          },
          insight: 'Na função decrescente, a parte fixa é o começo, e o zero é o fim.',
        }),
        key('O zero da função', 'Para f(x) = b − v·x (decrescente), f(x) = 0 quando x = b ÷ v. Para comparar duas funções afins, iguale-as: o resultado é o ponto em que se cruzam.'),
        example('Tanque esvaziando', 'Uma caixa-d’água com 1.200 L esvazia 40 L por minuto. Escreva a função, diga quanto resta após 12 minutos e quando esvazia.', [
          step('Função:', 'V(t) = 1.200 − 40t'),
          step('Após 12 minutos:', 'V(12) = 1.200 − 480 = 720 L'),
          askStep('Quando esvazia?', 'Resolva V(t) = 0.', [
            ok('40t = 1.200 → t = 30 minutos'),
            no('t = 1.200 × 40 = 48.000 minutos', 'O tempo até esvaziar é a quantidade dividida pela taxa: 1.200 ÷ 40.'),
          ]),
        ], 'Restam 720 L após 12 minutos, e a caixa esvazia em 30 minutos.'),
        check(numeric({
          prompt: [p('Um celular está com 80% de bateria e perde 6 pontos percentuais por hora de uso.')],
          ask: 'Em quantas horas a bateria chega a 20%?',
          unit: 'h',
          answer: 10,
          wrong: [
            { value: 13.33, feedback: 'Isso calcula o tempo até zerar (80 ÷ 6). A pergunta é até chegar a 20%: (80 − 20) ÷ 6.' },
            { value: 3.33, feedback: 'Isso divide 20 por 6. A bateria precisa cair 60 pontos: de 80% para 20%.' },
            { value: 60, feedback: '60 é quanto a bateria cai, em pontos percentuais. Divida pela perda por hora.' },
          ],
          solution: ['$80 − 6t = 20 → 6t = 60', '$t = 10 h'],
        })),
      ],
      practice: [gen(drainGen), gen(predictGen), gen(compareGen)],
      challenge: [gen(compareGen), gen(drainGen), gen(predictGen)],
      recap: [
        'Modelar: parte fixa + taxa × x.',
        'Decrescente: o zero é quando acaba (b ÷ v).',
        'Duas funções: iguale para achar o cruzamento.',
      ],
    })),

    stage('maestria', 'maestria', 'Maestria: funções afins no mundo real', 'Resolver problemas inéditos que pedem montar, interpretar e comparar funções afins a partir de textos, tabelas e registros.', () => ({
      learn: [
        strategy('Função afim em 4 passos', '1) Ache a taxa (preço por unidade, variação por período). 2) Ache a parte fixa (valor no início, ou y₁ − a·x₁). 3) Escreva f(x) = ax + b. 4) Use: substitua x para prever, ou desfaça para achar x.'),
        example('Dois planos de academia', 'A academia Ritmo cobra R$ 120,00 de matrícula e R$ 70,00 por mês; a Pulso, R$ 30,00 de matrícula e R$ 85,00 por mês. A partir de quantos meses a Ritmo fica mais barata?', [
          step('Funções:', 'R(m) = 120 + 70m; P(m) = 30 + 85m'),
          step('Iguale:', '120 + 70m = 30 + 85m → 90 = 15m → m = 6'),
          askStep('Em 6 meses, empatam.', 'A partir de quando a Ritmo é mais barata?', [
            ok('A partir de 7 meses'),
            no('A partir de 6 meses', 'Com 6 meses, as duas custam R$ 540,00: empatam. A Ritmo só fica mais barata depois.'),
          ]),
        ], 'A Ritmo fica mais barata a partir do 7º mês.'),
        reveal('Como reconhecer uma função afim numa tabela?', 'Se x avança de 1 em 1 e f avança sempre o mesmo valor, a taxa é constante: a função é afim. Se as diferenças mudam (por exemplo, dobram), é outro tipo de função.'),
        check(numeric({
          prompt: [p('Um ônibus de turismo cobra uma parte fixa mais um valor por passageiro. Com 20 passageiros, a viagem custa R$ 1.100,00; com 32, R$ 1.460,00.')],
          ask: 'Quanto custaria a viagem com 40 passageiros?',
          prefix: 'R$',
          answer: 1700,
          wrong: [
            { value: 2200, feedback: 'Isso supõe que o custo é proporcional aos passageiros (dobra de 20 para 40). Há uma parte fixa: use a taxa por passageiro.' },
            { value: 1490, feedback: 'Isso avança só um passageiro a partir de 32. São 8 passageiros a mais, a R$ 30,00 cada.' },
            { value: 1825, feedback: 'Isso divide 1.460 por 32 e multiplica por 40, misturando a parte fixa na taxa.' },
          ],
          solution: ['$taxa: (1.460 − 1.100) ÷ (32 − 20) = 30 por passageiro', '$f(40) = 1.460 + 30 × 8 = 1.700'],
        })),
      ],
      practice: [gen(twoPointsGen), gen(drainGen), gen(inverseGen)],
      challenge: [gen(compareGen), gen(tableNextGen), gen(predictGen), gen(drainGen)],
      recap: [
        'Taxa, parte fixa, fórmula, uso.',
        'Empate de duas funções: iguale; "mais barato a partir de": passe do empate.',
        'Diferenças constantes numa tabela: função afim.',
      ],
    })),
  ],
});
