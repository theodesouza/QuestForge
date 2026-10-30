/**
 * Aula: Mediana e moda — ordenar e achar o meio (quantidade ímpar ou par), a moda, mediana e
 * moda em tabelas de frequência, qual medida representa melhor os dados (valores extremos,
 * dados não numéricos) e maestria com dados que mudam.
 */
import {
  askStep,
  check,
  choice,
  compare,
  draftChoice,
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
  stage,
  step,
  strategy,
  table,
  text,
} from '../../kit/build';
import { brl, num, round } from '../../kit/format';
import type { Rand } from '../../types';

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const sorted = (xs: number[]) => [...xs].sort((a, b) => a - b);
function median(xs: number[]): number {
  const s = sorted(xs);
  const n = s.length;
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
}
/** Moda única (ou null se não houver uma só). */
function mode(xs: number[]): number | null {
  const count = new Map<number, number>();
  for (const x of xs) count.set(x, (count.get(x) ?? 0) + 1);
  const max = Math.max(...count.values());
  const tops = [...count].filter(([, c]) => c === max).map(([v]) => v);
  return max > 1 && tops.length === 1 ? tops[0] : null;
}
const list = (xs: number[], f: (x: number) => string = (x) => num(x)) => `${xs.slice(0, -1).map(f).join(', ')} e ${f(xs[xs.length - 1])}`;

// ———————————————————————————————————————————————— geradores: ordenar e achar o meio

const SETS = [
  { intro: 'Uma jogadora de basquete marcou os pontos da tabela nos últimos jogos.', head: 'Jogo', row: 'Pontos', lo: 4, hi: 30, ask: 'Qual é a mediana dos pontos por jogo?' },
  { intro: 'A tabela mostra o tempo de espera, em minutos, de clientes numa fila de banco.', head: 'Cliente', row: 'Espera (min)', lo: 2, hi: 25, ask: 'Qual é a mediana do tempo de espera?' },
  { intro: 'A tabela mostra quantos livros cada estudante de um grupo leu no ano.', head: 'Estudante', row: 'Livros', lo: 0, hi: 12, ask: 'Qual é a mediana do número de livros lidos?' },
];

/** Mediana: ordenar e pegar o meio (ou a média dos dois do meio). */
function medianGen(r: Rand) {
  for (;;) {
    const g = r.pick(SETS);
    const n = r.int(5, 8);
    const v = Array.from({ length: n }, () => r.int(g.lo, g.hi));
    const s = sorted(v);
    const md = median(v);
    const mean = sum(v) / n;
    const mid = n % 2 ? v[(n - 1) / 2] : (v[n / 2 - 1] + v[n / 2]) / 2;
    if (Math.abs(mid - md) < 0.5 || Math.abs(mean - md) < 0.25) continue;
    return draftNumeric({
      prompt: [p(g.intro), table([g.head, ...v.map((_, i) => String(i + 1))], [[g.row, ...v.map(String)]])],
      ask: g.ask,
      answer: md,
      wrong: [
        { value: mid, feedback: 'Isso pega o meio da lista sem ordená-la. A mediana é o valor central depois de pôr os dados em ordem.' },
        { value: round(mean, 2), feedback: 'Essa é a média. A mediana é o valor do meio da lista ordenada.' },
        ...(n % 2 === 0 ? [{ value: s[n / 2 - 1], feedback: `Com quantidade par (${n} valores), há dois valores centrais: a mediana é a média deles.` }] : []),
      ],
      hints: [`Em ordem: ${s.join(', ')}.`, n % 2 ? `Com ${n} valores, o do meio é o ${(n + 1) / 2}º.` : `Com ${n} valores, os centrais são o ${n / 2}º e o ${n / 2 + 1}º.`],
      solution: [`$em ordem: ${s.join(', ')}`, n % 2 ? `$mediana: o ${(n + 1) / 2}º valor = ${num(md)}` : `$mediana: (${s[n / 2 - 1]} + ${s[n / 2]}) ÷ 2 = ${num(md)}`],
    });
  }
}

/** Moda: o valor que mais se repete. */
function modeGen(r: Rand) {
  for (;;) {
    const ctx = r.pick([
      { intro: 'Os números de calçado dos jogadores de um time de vôlei são', ask: 'Qual é a moda dos números de calçado?', lo: 38, hi: 45 },
      { intro: 'As idades dos participantes de uma oficina de robótica são', ask: 'Qual é a moda das idades?', lo: 11, hi: 17 },
      { intro: 'As notas, de 1 a 5, que os clientes deram a um restaurante foram', ask: 'Qual é a moda das notas?', lo: 1, hi: 5 },
    ]);
    const n = r.int(7, 10);
    const v = Array.from({ length: n }, () => r.int(ctx.lo, ctx.hi));
    const m = mode(v);
    if (m === null) continue;
    const freq = v.filter((x) => x === m).length;
    const md = median(v);
    if (md === m || freq === m) continue;
    return draftNumeric({
      prompt: [p(`${ctx.intro} ${list(v)}.`)],
      ask: ctx.ask,
      answer: m,
      wrong: [
        { value: freq, feedback: `Esse é o número de vezes que a moda aparece (${freq}). A moda é o próprio valor que mais se repete.` },
        { value: md, feedback: 'Essa é a mediana, o valor do meio. A moda é o valor que mais se repete.' },
        { value: round(sum(v) / n, 2), feedback: 'Essa é a média. A moda é o valor que mais se repete.' },
      ],
      hints: ['Conte quantas vezes aparece cada valor.', 'A moda é o valor com a maior contagem.'],
      solution: [`O valor ${m} aparece ${freq} vezes, mais que qualquer outro: é a moda.`],
    });
  }
}

// ———————————————————————————————————————————————— geradores: tabelas de frequência

const FTABLES = [
  {
    head: ['Salário (R$)', 'Funcionários'],
    money: true,
    make: (r: Rand) => {
      const v1 = 100 * r.int(14, 18);
      const v2 = v1 + 100 * r.int(3, 8);
      const v3 = v2 + 100 * r.int(8, 15);
      const v4 = 1000 * r.int(8, 15);
      return { values: [v1, v2, v3, v4], freqs: [r.int(3, 6), r.int(2, 4), r.int(1, 2), 1] };
    },
    intro: 'Uma pequena empresa tem os funcionários e salários mensais da tabela.',
    ask: 'Qual é a mediana dos salários?',
  },
  {
    head: ['Número do calçado', 'Pessoas'],
    money: false,
    make: (r: Rand) => {
      const a = r.int(34, 38);
      return { values: [a, a + 1, a + 2, a + 3, a + 4], freqs: [r.int(1, 7), r.int(1, 7), r.int(1, 7), r.int(1, 7), r.int(1, 7)] };
    },
    intro: 'Uma loja anotou o número do calçado dos clientes atendidos numa manhã.',
    ask: 'Qual é a mediana dos números de calçado?',
  },
  {
    head: ['Faltas no mês', 'Estudantes'],
    money: false,
    make: (r: Rand) => ({ values: [0, 1, 2, 3, 4], freqs: [r.int(2, 9), r.int(2, 9), r.int(1, 7), r.int(1, 5), r.int(1, 4)] }),
    intro: 'A tabela mostra quantas faltas os estudantes de uma turma tiveram no mês.',
    ask: 'Qual é a mediana do número de faltas?',
  },
];

/** Mediana numa tabela de frequências: posição do meio pelas frequências acumuladas. */
function freqMedianGen(r: Rand) {
  for (;;) {
    const g = r.pick(FTABLES);
    const { values, freqs } = g.make(r);
    if (values.join() === '1500,2000,3000,10000' && freqs.join() === '5,3,1,1') continue; // questão do banco
    if (values.join() === '1600,2200,3500,12000' && freqs.join() === '4,3,1,1') continue; // exemplo da teoria
    const data = values.flatMap((v, i) => Array(freqs[i]).fill(v) as number[]);
    const n = data.length;
    const md = median(data);
    const mean = sum(data) / n;
    const m = mode(data);
    const plain = sum(values) / values.length;
    const midRow = values.length % 2 ? values[(values.length - 1) / 2] : (values[values.length / 2 - 1] + values[values.length / 2]) / 2;
    if (Math.abs(mean - md) < 0.3 || md === midRow) continue;
    const fmt = (x: number) => (g.money ? brl(x) : num(x));
    let acc = 0;
    const cum = freqs.map((f) => (acc += f));
    return draftNumeric({
      prompt: [p(g.intro), table(g.head, values.map((v, i) => [g.money ? num(v) : String(v), String(freqs[i])]))],
      ask: g.ask,
      ...(g.money ? { prefix: 'R$' } : {}),
      answer: md,
      wrong: [
        ...(m !== null && m !== md ? [{ value: m, feedback: `Essa é a moda, o valor mais frequente (${fmt(m)}). A mediana é o valor do meio dos ${n} dados em ordem.` }] : []),
        { value: round(mean, 2), feedback: 'Essa é a média ponderada pelas frequências. A mediana é o valor do meio dos dados em ordem.' },
        { value: round(plain, 2), feedback: 'Isso faz a média dos valores da tabela sem considerar as frequências.' },
        { value: midRow, feedback: 'Isso pega o meio das linhas da tabela. A mediana conta os dados (as frequências), não as linhas.' },
      ],
      hints: [`Total de dados: ${freqs.join(' + ')} = ${n}. ${n % 2 ? `A mediana é o ${(n + 1) / 2}º dado.` : `A mediana é a média do ${n / 2}º e do ${n / 2 + 1}º dados.`}`, `Frequências acumuladas: ${cum.join(', ')}.`],
      solution: [
        `$n = ${n} → ${n % 2 ? `posição ${(n + 1) / 2}` : `posições ${n / 2} e ${n / 2 + 1}`}`,
        `$acumuladas: ${values.map((v, i) => `${g.money ? num(v) : v} → ${cum[i]}`).join('; ')}`,
        `$mediana = ${fmt(md)}`,
      ],
    });
  }
}

/** Moda numa tabela de frequências: o valor de maior frequência, não a frequência. */
function freqModeGen(r: Rand) {
  for (;;) {
    const g = FTABLES[1];
    const { values, freqs } = g.make(r);
    const max = Math.max(...freqs);
    if (freqs.filter((f) => f === max).length > 1) continue;
    const m = values[freqs.indexOf(max)];
    const data = values.flatMap((v, i) => Array(freqs[i]).fill(v) as number[]);
    const md = median(data);
    if (md === m) continue;
    return draftNumeric({
      prompt: [p(g.intro), table(g.head, values.map((v, i) => [String(v), String(freqs[i])]))],
      ask: 'Qual número de calçado é a moda?',
      answer: m,
      wrong: [
        { value: max, feedback: `${max} é a maior frequência: quantas pessoas calçam o número mais comum. A moda é o próprio número, ${m}.` },
        { value: md, feedback: 'Essa é a mediana, o valor do meio. A moda é o valor de maior frequência.' },
        { value: values[values.length - 1], feedback: 'Esse é o maior número da tabela. A moda é o mais frequente, e não o maior.' },
      ],
      hints: ['Procure a maior frequência na coluna "Pessoas".', 'A moda é o número de calçado dessa linha.'],
      solution: [`A maior frequência é ${max}, do número ${m}: a moda é ${m}.`],
    });
  }
}

// ———————————————————————————————————————————————— geradores: qual medida representa melhor

/** Um erro de digitação no maior valor: a média muda, a mediana não. */
function outlierEffectGen(r: Rand) {
  for (;;) {
    const n = r.pick([5, 6, 8, 10]);
    const base = Array.from({ length: n - 1 }, () => 100 * r.int(15, 30));
    const top = 100 * r.int(31, 50);
    const vals = sorted([...base, top]);
    if (new Set(vals).size < n) continue;
    const inc = (9 * top) / n;
    if (!Number.isInteger(inc * 100)) continue;
    return draftNumeric({
      prompt: [p(`Os salários dos ${n} funcionários de uma oficina são ${list(vals, (x) => brl(x))}. Ao digitar a planilha, alguém lançou o maior salário com um zero a mais: ${brl(10 * top)}.`)],
      ask: 'Em quanto o erro aumentou a média dos salários da planilha?',
      prefix: 'R$',
      answer: inc,
      wrong: [
        { value: 9 * top, feedback: `Esse é o erro no total (${brl(10 * top)} − ${brl(top)}). Na média, ele se divide pelos ${n} funcionários.` },
        { value: 0, feedback: 'Quem não muda é a mediana, que só olha para o meio da lista. A média usa todos os valores, inclusive o errado.' },
        { value: round((9 * top) / (n - 1), 2), feedback: `Isso divide o erro por ${n - 1}. A média é sobre os ${n} funcionários.` },
      ],
      hints: [`O erro aumentou o total em ${brl(10 * top)} − ${brl(top)} = ${brl(9 * top)}.`, `Divida esse aumento pelos ${n} funcionários.`],
      solution: [`$aumento no total: ${num(10 * top)} − ${num(top)} = ${num(9 * top)}`, `$aumento na média: ${num(9 * top)} ÷ ${n} = ${brl(inc)}`, 'A mediana não muda: o meio da lista continua o mesmo.'],
    });
  }
}

const NOMINAL = [
  { intro: 'Uma sorveteria registrou o sabor escolhido por cada um dos 200 clientes de um sábado.', what: 'Sabores' },
  { intro: 'Uma pesquisa perguntou a 150 moradores qual é o meio de transporte que mais usam.', what: 'Meios de transporte' },
  { intro: 'Uma escola registrou a cor de uniforme preferida por 300 estudantes numa votação.', what: 'Cores' },
];

/** Qual medida usar? Dados não numéricos → moda; valor extremo → mediana. */
function whichMeasureGen(r: Rand) {
  if (r.next() < 0.45) {
    const g = r.pick(NOMINAL);
    return draftChoice({
      prompt: [p(g.intro)],
      ask: 'Qual medida pode resumir esses dados?',
      options: [
        ok('A moda'),
        no('A média', `${g.what} não são números: não dá para somá-los e dividir. A média só existe para dados numéricos.`),
        no('A mediana', `${g.what} não têm uma ordem natural, então não existe "valor do meio".`),
      ],
      hints: ['Os dados são números ou categorias?', 'Para categorias, só faz sentido falar no valor mais frequente.'],
      solution: ['Para dados que são categorias (sabor, cor, transporte), a única medida possível é a moda: a categoria mais frequente.'],
    });
  }
  for (;;) {
    const n = r.int(6, 8);
    const base = Array.from({ length: n - 1 }, () => 100 * r.int(16, 30));
    const boss = 1000 * r.int(15, 30);
    const vals = sorted([...base, boss]);
    if (new Set(vals).size < n) continue;
    const mean = sum(vals) / n;
    const md = median(vals);
    return draftChoice({
      prompt: [p(`Os salários dos ${n} funcionários de uma loja, incluindo o do gerente-proprietário, são ${list(vals, (x) => brl(x))}.`)],
      ask: 'Qual medida descreve melhor o salário típico de quem trabalha nessa loja?',
      options: [
        ok('A mediana'),
        no('A média', `A média (${brl(round(mean, 2))}) é puxada pelo salário de ${brl(boss)}, que só uma pessoa recebe. ${n - 1} dos ${n} salários ficam abaixo dela.`),
        no('A moda', 'Nenhum salário se repete: não há moda.'),
      ],
      hints: ['Há algum valor muito afastado dos outros?', 'Que medida não é puxada por valores extremos?'],
      solution: [`$média = ${brl(round(mean, 2))}; mediana = ${brl(md)}`, 'A mediana fica no meio dos salários e não é afetada pelo valor extremo: descreve melhor o salário típico.'],
    });
  }
}

// ———————————————————————————————————————————————— geradores: maestria

/** Um dado novo entra na lista: a mediana passa a ser a média dos dois centrais. */
function newValueMedianGen(r: Rand) {
  for (;;) {
    const ctx = r.pick([
      { intro: 'Os pesos, em kg, das malas de um grupo de viajantes são', add: (a: number) => `Chega mais um viajante, com uma mala de ${a} kg.`, ask: 'Qual é a nova mediana dos pesos das malas?', lo: 5, hi: 30 },
      { intro: 'Os tempos, em minutos, dos corredores que completaram uma prova de 10 km foram', add: (a: number) => `Um corredor atrasado completa a prova em ${a} minutos.`, ask: 'Qual é a nova mediana dos tempos?', lo: 40, hi: 80 },
    ]);
    const n = r.pick([5, 7, 9]);
    const v = sorted(Array.from({ length: n }, () => r.int(ctx.lo, ctx.hi)));
    if (new Set(v).size < n) continue;
    const where = r.pick(['low', 'high', 'mid'] as const);
    const x = where === 'low' ? r.int(ctx.lo - 4, v[0] - 1) : where === 'high' ? r.int(v[n - 1] + 1, ctx.hi + 10) : r.int(v[0] + 1, v[n - 1] - 1);
    if (x <= 0 || v.includes(x)) continue;
    const all = sorted([...v, x]);
    const md2 = median(all);
    const md1 = median(v);
    if (md2 === md1) continue;
    return draftNumeric({
      prompt: [p(`${ctx.intro} ${list(v)}. ${ctx.add(x)}`)],
      ask: ctx.ask,
      answer: md2,
      wrong: [
        { value: md1, feedback: `Essa era a mediana antes. Com ${n + 1} valores (quantidade par), ela passa a ser a média dos dois centrais.` },
        { value: round(sum(all) / (n + 1), 2), feedback: 'Essa é a nova média. A mediana é o meio da lista ordenada.' },
        { value: all[(n - 1) / 2], feedback: `Isso pega só um dos centrais. Com ${n + 1} valores, a mediana é a média do ${(n + 1) / 2}º e do ${(n + 1) / 2 + 1}º.` },
      ],
      hints: [`Nova lista em ordem: ${all.join(', ')}.`, `Com ${n + 1} valores, os centrais são o ${(n + 1) / 2}º e o ${(n + 1) / 2 + 1}º.`],
      solution: [`$em ordem: ${all.join(', ')}`, `$mediana: (${all[(n + 1) / 2 - 1]} + ${all[(n + 1) / 2]}) ÷ 2 = ${num(md2)}`],
    });
  }
}

// ———————————————————————————————————————————————— aula

export const MEDIANA_MODA = lesson({
  id: 'mediana-moda',
  topic: 'estatistica',
  subtopics: ['mediana-moda'],
  title: 'Mediana e moda',
  summary: 'A mediana como o valor do meio (com quantidade ímpar ou par), a moda, as duas em tabelas de frequência e a escolha da medida que melhor resume os dados quando há valores extremos ou categorias.',
  requires: ['media'],
  stages: [
    stage('ordenar', 'descoberta', 'O valor do meio', 'Achar a mediana de uma lista — ordenando e pegando o valor central ou a média dos dois centrais — e a moda, o valor que mais se repete.', () => ({
      learn: [
        text('A **mediana** é o valor do meio quando os dados estão em **ordem**: metade dos valores fica abaixo dela, metade acima. Com quantidade ímpar, é o valor central; com quantidade par, é a **média dos dois valores centrais**. A **moda** é o valor que mais se repete — pode haver mais de uma, ou nenhuma.'),
        lab({
          title: 'O meio da lista',
          intro: 'A lista tem os valores 2, 4, 5, 7 e 9, mais um valor x que você escolhe. Veja onde ficam a mediana e a média.',
          params: [{ key: 'x', label: 'Valor x', min: 0, max: 20, step: 1, value: 3, format: (v) => String(v) }],
          readouts: ({ x }) => {
            const all = sorted([2, 4, 5, 7, 9, x]);
            return [
              { label: 'Em ordem', value: all.join(', ') },
              { label: 'Mediana', value: num(median(all)), big: true, tone: 'verdigris' },
              { label: 'Média', value: num(sum(all) / 6, 2) },
            ];
          },
          viz: ({ x }) => ({
            kind: 'dots',
            min: 0,
            max: 20,
            values: [2, 4, 5, 7, 9, x],
            marks: [
              { value: median([2, 4, 5, 7, 9, x]), label: 'mediana', tone: 'verdigris' },
              { value: (27 + x) / 6, label: 'média', tone: 'brass' },
            ],
            summary: `Com x = ${x}, a mediana é ${num(median([2, 4, 5, 7, 9, x]))} e a média, ${num((27 + x) / 6, 2)}`,
          }),
          goal: {
            task: 'Ache o menor valor de x que deixa a mediana igual a 6.',
            done: ({ x }) => x === 7,
            success: 'Isso: com x = 7, a lista em ordem é 2, 4, 5, 7, 7, 9, e a mediana é (5 + 7) ÷ 2 = 6. Daí em diante, aumentar x não muda a mediana — mas a média continua subindo.',
          },
          insight: 'A mediana só olha para o meio da lista ordenada; os extremos podem crescer à vontade sem mexer nela.',
        }),
        example('Espera na fila', 'Os tempos de espera, em minutos, de seis clientes foram 12, 5, 8, 20, 5 e 9. Quais são a mediana e a moda?', [
          askStep('Antes de procurar o meio…', 'Qual é o primeiro passo?', [
            ok('Pôr os valores em ordem'),
            no('Pegar os valores do meio da lista como ela está', 'Sem ordenar, o meio da lista não diz nada: aqui seriam 8 e 20, que não são os centrais.'),
          ]),
          step('Em ordem:', '5, 5, 8, 9, 12, 20'),
          step('Seis valores (par): média dos dois centrais.', 'mediana = (8 + 9) ÷ 2 = 8,5 min', 'moda = 5 min (aparece duas vezes)'),
        ], 'A mediana é 8,5 min e a moda, 5 min.'),
        check(numeric({
          prompt: [p('Sete jurados deram as notas 8,5; 9,0; 7,5; 9,5; 8,0; 9,0 e 8,5 a uma apresentação.')],
          ask: 'Qual é a mediana das notas?',
          answer: 8.5,
          wrong: [
            { value: 9.5, feedback: 'Isso pega a 4ª nota da lista sem ordená-la. Em ordem: 7,5; 8,0; 8,5; 8,5; 9,0; 9,0; 9,5.' },
            { value: 8.57, feedback: 'Essa é a média (60 ÷ 7). A mediana é a nota do meio da lista ordenada.' },
            { value: 8.75, feedback: 'Com 7 notas (quantidade ímpar), a mediana é uma só: a 4ª da lista ordenada.' },
          ],
          solution: ['$em ordem: 7,5; 8,0; 8,5; 8,5; 9,0; 9,0; 9,5', '$mediana: a 4ª nota = 8,5'],
        })),
      ],
      practice: [gen(medianGen), gen(modeGen), gen(medianGen)],
      challenge: [gen(medianGen), gen(modeGen), gen(medianGen)],
      recap: [
        'Mediana: ordene; quantidade ímpar → o valor central; par → média dos dois centrais.',
        'Moda: o valor que mais se repete (pode não existir ou haver mais de uma).',
        'Sem ordenar, não existe "meio".',
      ],
    })),

    stage('frequencias', 'fundamentos', 'Mediana em tabelas de frequência', 'Achar a mediana e a moda em tabelas de frequência, localizando a posição do meio pelas frequências acumuladas.', () => ({
      learn: [
        text('Numa **tabela de frequências**, não é preciso escrever todos os dados. Some as frequências para obter o total **n**; a mediana está na posição (n + 1) ÷ 2 — se n é par, é a média dos dados nas posições n ÷ 2 e n ÷ 2 + 1. Vá **acumulando** as frequências até alcançar essa posição. A moda é o valor de **maior frequência** (o valor, e não a frequência).'),
        lab({
          title: 'Onde está o meio?',
          intro: 'Uma loja vendeu calçados dos números 36 a 40. Escolha quantos pares de número 38 foram vendidos e acompanhe a mediana.',
          params: [{ key: 'k', label: 'Pares de número 38', min: 0, max: 12, step: 1, value: 1, format: (v) => String(v) }],
          readouts: ({ k }) => {
            const data = [...Array(4).fill(36), ...Array(6).fill(37), ...Array(k).fill(38), ...Array(5).fill(39), ...Array(3).fill(40)] as number[];
            const n = data.length;
            return [
              { label: 'Total de pares', value: String(n) },
              { label: n % 2 ? 'Posição do meio' : 'Posições do meio', value: n % 2 ? `${(n + 1) / 2}ª` : `${n / 2}ª e ${n / 2 + 1}ª` },
              { label: 'Mediana', value: num(median(data)), big: true, tone: 'verdigris' },
            ];
          },
          viz: ({ k }) => {
            const data = [...Array(4).fill(36), ...Array(6).fill(37), ...Array(k).fill(38), ...Array(5).fill(39), ...Array(3).fill(40)] as number[];
            const md = median(data);
            return {
              kind: 'bars',
              bars: [36, 37, 38, 39, 40].map((s, i) => ({ label: String(s), value: [4, 6, k, 5, 3][i], tone: Math.abs(s - md) < 0.6 ? ('verdigris' as const) : ('mist' as const) })),
              max: 12,
              summary: `Com ${k} pares de número 38, são ${data.length} pares vendidos, e a mediana é ${num(md)}`,
            };
          },
          goal: {
            task: 'Ache o menor número de pares 38 que faz a mediana ser 38.',
            done: ({ k }) => k === 3,
            success: 'Isso: com 3 pares de 38, são 21 pares, e a mediana é o 11º. Até o 37 há 10 pares; o 11º já é um 38. Com 2 pares (20 no total), os centrais seriam o 10º (37) e o 11º (38): mediana 37,5.',
          },
          insight: 'A mediana depende de onde cai a posição do meio nas frequências acumuladas, e não da altura de uma barra só.',
        }),
        example('Salários de uma loja', [
          p('Uma loja tem 9 funcionários.'),
          table(['Salário (R$)', 'Funcionários'], [['1.600', '4'], ['2.200', '3'], ['3.500', '1'], ['12.000', '1']]),
        ], [
          askStep('São 9 funcionários.', 'Em que posição está a mediana?', [
            ok('Na 5ª: (9 + 1) ÷ 2'),
            no('Na 2ª linha da tabela', 'A posição conta pessoas, e não linhas: com 9 funcionários, a mediana é o 5º salário em ordem.'),
          ]),
          step('Acumulando:', 'R$ 1.600: posições 1 a 4', 'R$ 2.200: posições 5 a 7 → a 5ª é R$ 2.200'),
          step('Compare:', 'moda: R$ 1.600; média: 28.500 ÷ 9 ≈ R$ 3.166,67'),
        ], 'A mediana é R$ 2.200,00 — bem abaixo da média, puxada pelo salário de R$ 12.000,00.'),
        key('Moda é o valor', 'Numa tabela, a moda é o valor da linha de maior frequência. Responder a própria frequência ("6 pessoas") em vez do valor ("número 37") é um erro comum.'),
        check(numeric({
          prompt: [
            p('A tabela mostra os números de calçado de 20 pessoas.'),
            table(['Número', 'Pessoas'], [['36', '8'], ['37', '3'], ['38', '4'], ['39', '5']]),
          ],
          ask: 'Qual é a mediana dos números de calçado?',
          answer: 37,
          wrong: [
            { value: 36, feedback: 'Essa é a moda, o número mais frequente. A mediana é a média do 10º e do 11º dados em ordem.' },
            { value: 37.5, feedback: 'Isso faz a média do menor e do maior número (36 e 39). A mediana vem das posições 10 e 11.' },
            { value: 37.3, feedback: 'Essa é a média (746 ÷ 20). A mediana é o valor do meio dos dados em ordem.' },
          ],
          solution: ['$n = 20 → posições 10 e 11', '$acumuladas: 36 → 8; 37 → 11', '$10º e 11º: ambos 37 → mediana = 37'],
        })),
      ],
      practice: [gen(freqMedianGen), gen(freqModeGen), gen(freqMedianGen)],
      challenge: [gen(freqMedianGen), gen(freqModeGen), gen(freqMedianGen)],
      recap: [
        'n = soma das frequências; mediana na posição (n + 1) ÷ 2.',
        'Acumule as frequências até alcançar a posição do meio.',
        'Moda: o valor de maior frequência.',
      ],
    })),

    stage('resumir', 'interpretacao', 'Média, mediana ou moda?', 'Escolher a medida que melhor resume um conjunto de dados, percebendo o efeito de valores extremos e o tipo de dado.', () => ({
      learn: [
        text('Cada medida responde a uma pergunta. A **média** usa todos os valores e é sensível a valores extremos; a **mediana** só olha para o meio e resiste a eles; a **moda** é a única que serve para dados que não são números (cor, sabor, time). Num grupo com um salário muito alto, a média engana: a mediana descreve melhor o salário típico.'),
        lab({
          title: 'O salário do diretor',
          intro: 'Cinco funcionários ganham R$ 1.800, R$ 2.000, R$ 2.100, R$ 2.200 e R$ 2.400. Escolha o salário do diretor e veja a média e a mediana.',
          params: [{ key: 'x', label: 'Salário do diretor', min: 2500, max: 30000, step: 500, value: 2500, format: (v) => brl(v) }],
          readouts: ({ x }) => [
            { label: 'Média', value: brl((10500 + x) / 6), big: true, tone: 'brass' },
            { label: 'Mediana', value: brl(median([1800, 2000, 2100, 2200, 2400, x])), tone: 'verdigris' },
          ],
          viz: ({ x }) => ({
            kind: 'dots',
            min: 0,
            max: 30000,
            values: [1800, 2000, 2100, 2200, 2400, x],
            marks: [
              { value: median([1800, 2000, 2100, 2200, 2400, x]), label: 'mediana', tone: 'verdigris' },
              { value: (10500 + x) / 6, label: 'média', tone: 'brass' },
            ],
            summary: `Com o diretor ganhando ${brl(x)}, a média é ${brl((10500 + x) / 6)} e a mediana, ${brl(median([1800, 2000, 2100, 2200, 2400, x]))}`,
          }),
          goal: {
            task: 'Ache o primeiro salário do diretor, no controle, que faz a média passar de R$ 5.000,00.',
            done: ({ x }) => x === 20000,
            success: 'Isso: com R$ 20.000,00, a média vai a R$ 5.083,33, embora cinco dos seis ganhem até R$ 2.400,00. A mediana continua em R$ 2.150,00.',
          },
          insight: 'Um único valor extremo arrasta a média; a mediana nem se mexe.',
        }),
        compare([
          { title: 'Média', tone: 'brass', lines: ['Usa todos os valores', 'Sensível a extremos', 'Só para números'] },
          { title: 'Mediana', tone: 'verdigris', lines: ['O meio da lista ordenada', 'Resiste a extremos', 'Precisa de ordem'] },
          { title: 'Moda', tone: 'sky', lines: ['O mais frequente', 'Serve até para categorias', 'Pode não existir'] },
        ], 'Três medidas, três perguntas'),
        check(choice({
          prompt: [p('Uma pesquisa perguntou aos moradores de um bairro qual é o meio de transporte que eles mais usam.')],
          ask: 'Qual medida faz sentido para resumir as respostas?',
          options: [
            ok('A moda'),
            no('A média', 'Não dá para somar "ônibus" com "bicicleta": a média só existe para dados numéricos.'),
            no('A mediana', 'Meios de transporte não têm uma ordem natural, então não existe "valor do meio".'),
          ],
          solution: ['Para categorias, a única medida possível é a moda: a resposta mais frequente.'],
        })),
      ],
      practice: [gen(whichMeasureGen), gen(outlierEffectGen), gen(whichMeasureGen)],
      challenge: [gen(outlierEffectGen), gen(whichMeasureGen), gen(outlierEffectGen)],
      recap: [
        'Valores extremos puxam a média, não a mediana.',
        'Categorias (cor, sabor, transporte): só a moda.',
        'Para o "valor típico" com extremos, prefira a mediana.',
      ],
    })),

    stage('maestria', 'maestria', 'Maestria: medidas de centro', 'Resolver problemas inéditos que pedem mediana, moda e média de listas e tabelas, inclusive quando os dados mudam.', () => ({
      learn: [
        strategy('Medidas de centro em 4 passos', '1) Ponha os dados em ordem (ou use as frequências acumuladas). 2) Conte n e ache a posição do meio. 3) Média: some tudo e divida; moda: o valor mais frequente. 4) Para escolher a medida, olhe os extremos e o tipo de dado.'),
        example('O jogo típico', 'Uma jogadora marcou 12, 8, 15, 8, 20, 10, 9 e 30 pontos em oito jogos. Que medida descreve melhor o jogo típico dela?', [
          step('Em ordem:', '8, 8, 9, 10, 12, 15, 20, 30'),
          step('As três medidas:', 'mediana: (10 + 12) ÷ 2 = 11', 'média: 112 ÷ 8 = 14', 'moda: 8'),
          askStep('Os 30 pontos foram um jogo fora da curva.', 'Qual medida descreve melhor o jogo típico?', [
            ok('A mediana, 11 pontos'),
            no('A média, 14 pontos', 'Só 3 dos 8 jogos passam de 14 pontos: o jogo de 30 puxou a média para cima.'),
          ]),
        ], 'A mediana (11 pontos) descreve melhor o jogo típico; a média (14) foi inflada pelo jogo de 30 pontos.'),
        reveal('A mediana precisa ser um dos dados?', 'Não. Com quantidade par, ela é a média dos dois centrais: em 2, 3, 6 e 9, a mediana é 4,5, que não aparece na lista.'),
        check(numeric({
          prompt: [p('As idades de cinco irmãos são 4, 7, 9, 12 e 15 anos. Nasce mais uma irmã.')],
          ask: 'Qual passa a ser a mediana das idades dos seis irmãos?',
          unit: 'anos',
          answer: 8,
          wrong: [
            { value: 9, feedback: 'Essa era a mediana dos cinco. Com seis idades, ela é a média das duas centrais.' },
            { value: 7.83, feedback: 'Essa é a nova média (47 ÷ 6). A mediana é o meio da lista ordenada.' },
            { value: 7, feedback: 'Isso pega só a 3ª idade. Com seis valores, a mediana é a média da 3ª e da 4ª: (7 + 9) ÷ 2.' },
          ],
          solution: ['$em ordem: 0, 4, 7, 9, 12, 15', '$mediana: (7 + 9) ÷ 2 = 8 anos'],
        })),
      ],
      practice: [gen(newValueMedianGen), gen(freqMedianGen), gen(whichMeasureGen)],
      challenge: [gen(newValueMedianGen), gen(freqMedianGen), gen(outlierEffectGen), gen(medianGen)],
      recap: [
        'Ordem primeiro; depois, a posição do meio.',
        'Um dado novo muda n: refaça a posição do meio.',
        'Extremos: mediana; categorias: moda; dados equilibrados: a média também serve.',
      ],
    })),
  ],
});
