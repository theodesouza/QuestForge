/**
 * Aula: Princípio multiplicativo — escolhas em etapas (árvore, produto), com e sem repetição
 * (senhas, pódios, filas, fatorial), contagem com restrições (começar pela etapa mais restrita,
 * complemento para "pelo menos um", casos que se somam) e maestria com placas e blocos.
 */
import {
  askStep,
  check,
  draftNumeric,
  example,
  gen,
  lab,
  lesson,
  math,
  no,
  numeric,
  ok,
  p,
  reveal,
  stage,
  step,
  strategy,
  text,
  warn,
} from '../../kit/build';
import { num } from '../../kit/format';
import type { Rand, Tone } from '../../types';

const prod = (xs: number[]) => xs.reduce((a, b) => a * b, 1);
const fact = (n: number): number => (n <= 1 ? 1 : n * fact(n - 1));
/** n × (n − 1) × … (k fatores). */
const falling = (n: number, k: number) => prod(Array.from({ length: k }, (_, i) => n - i));
const times = (xs: number[]) => xs.join(' × ');
const SUP = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
const pow = (b: string, n: number) => `${b}${String(n).split('').map((d) => SUP[Number(d)]).join('')}`;

// ———————————————————————————————————————————————— geradores: escolhas em etapas

const MENUS = [
  {
    intro: (o: number[]) => `Um restaurante monta o prato executivo com 1 entrada entre ${o[0]} opções, 1 prato principal entre ${o[1]} e 1 sobremesa entre ${o[2]}.`,
    ask: 'Quantos pratos executivos diferentes podem ser montados?',
    k: 3,
    tag: 'menu',
  },
  {
    intro: (o: number[]) => `Um modelo de carro pode ser comprado em ${o[0]} cores, com ${o[1]} tipos de motor e ${o[2]} acabamentos internos.`,
    ask: 'Quantas versões diferentes desse carro existem?',
    k: 3,
    tag: 'carro',
  },
  {
    intro: (o: number[]) => `Uma estudante tem ${o[0]} blusas, ${o[1]} calças e ${o[2]} pares de tênis.`,
    ask: 'De quantas formas diferentes ela pode se vestir com uma blusa, uma calça e um par de tênis?',
    k: 3,
    tag: 'roupa',
  },
  {
    intro: (o: number[]) => `De casa até a praça há ${o[0]} caminhos, e da praça até a escola há ${o[1]}.`,
    ask: 'Quantos trajetos diferentes vão de casa à escola passando pela praça?',
    k: 2,
    tag: 'caminho',
  },
];

/** Etapas independentes: multiplica-se o número de opções de cada uma. */
function productGen(r: Rand) {
  for (;;) {
    const g = r.pick(MENUS);
    const o = Array.from({ length: g.k }, () => r.int(2, 8));
    const key = [...o].sort().join();
    if (g.k === 3 && key === '2,3,4') continue; // a conta da questão do banco
    if (g.tag === 'roupa' && key === '2,3,5') continue; // laboratório da teoria
    if (g.k === 3 && key === '3,4,5') continue; // exercício da teoria
    const ans = prod(o);
    return draftNumeric({
      prompt: [p(g.intro(o))],
      ask: g.ask,
      answer: ans,
      wrong: [
        { value: o.reduce((a, b) => a + b, 0), feedback: 'Isso soma as opções. Para cada opção de uma etapa, há todas as opções das outras: multiplique.' },
        { value: prod(o.slice(0, -1)), feedback: 'Isso esquece a última etapa da escolha. Cada combinação anterior se desdobra em todas as opções dela.' },
        ...(g.k === 3 ? [{ value: o[0] * o[2], feedback: 'Isso esquece a etapa do meio. Todas as etapas entram no produto.' }] : []),
      ],
      hints: ['A escolha acontece em etapas, e cada etapa não depende das outras.', `Multiplique: ${times(o)}.`],
      solution: [`$${times(o)} = ${num(ans)}`],
    });
  }
}

const CODES = [
  { intro: 'Um cadeado tem 3 rodas, cada uma com os algarismos de 0 a 9.', ask: 'Quantas combinações diferentes o cadeado tem?', base: 10, k: 3, what: 'algarismos', pos: 'rodas' },
  { intro: 'Uma prova tem 8 questões de verdadeiro ou falso, e cada uma deve ser respondida.', ask: 'De quantas formas diferentes a prova pode ser respondida?', base: 2, k: 8, what: 'respostas possíveis', pos: 'questões' },
  { intro: 'Um teste tem 5 questões, cada uma com 4 alternativas, e todas devem ser respondidas.', ask: 'De quantas formas diferentes o teste pode ser respondido?', base: 4, k: 5, what: 'alternativas', pos: 'questões' },
  { intro: 'Um código de acesso tem 4 algarismos, escolhidos de 0 a 9, e pode repetir algarismos.', ask: 'Quantos códigos diferentes existem?', base: 10, k: 4, what: 'algarismos', pos: 'posições' },
];

/** Com repetição: as mesmas opções em cada posição → opçõesᵏ. */
function repetitionGen(r: Rand) {
  const g = r.pick(CODES);
  const ans = g.base ** g.k;
  return draftNumeric({
    prompt: [p(g.intro)],
    ask: g.ask,
    answer: ans,
    wrong: [
      { value: g.base * g.k, feedback: `Isso multiplica ${g.base} por ${g.k}. São ${g.k} etapas, cada uma com ${g.base} ${g.what}: ${times(Array(g.k).fill(g.base))}.` },
      { value: g.k ** g.base, feedback: `Isso inverte base e expoente. Cada uma das ${g.k} ${g.pos} tem ${g.base} opções: ${pow(String(g.base), g.k)}.` },
      ...(g.base >= g.k ? [{ value: falling(g.base, g.k), feedback: 'Isso impede a repetição. Aqui, a mesma opção pode aparecer em mais de uma posição.' }] : []),
    ],
    hints: [`São ${g.k} ${g.pos}, e cada uma tem ${g.base} ${g.what}.`, `Multiplique ${g.base} por ele mesmo ${g.k} vezes: ${pow(String(g.base), g.k)}.`],
    solution: [`$${times(Array(g.k).fill(g.base))} = ${pow(String(g.base), g.k)} = ${num(ans)}`],
  });
}

// ———————————————————————————————————————————————— geradores: sem repetição

const RANKS = [
  { intro: (n: number) => `Numa corrida com ${n} atletas, serão premiados o 1º, o 2º e o 3º lugares.`, ask: 'De quantas formas diferentes o pódio pode ficar?', k: 3, ns: [6, 7, 8, 9, 10, 12] },
  { intro: (n: number) => `Um clube com ${n} sócios vai eleger presidente, vice e tesoureiro, e ninguém pode ocupar dois cargos.`, ask: 'De quantas formas diferentes a diretoria pode ser formada?', k: 3, ns: [6, 7, 9, 11, 12, 15] },
  { intro: () => 'Um código é formado por 4 letras diferentes, escolhidas entre A, B, C, D, E, F, G e H.', ask: 'Quantos códigos diferentes podem ser formados?', k: 4, ns: [8] },
  { intro: (n: number) => `Uma senha tem 3 algarismos diferentes, escolhidos entre os ${n} algarismos de 1 a ${n}.`, ask: 'Quantas senhas diferentes são possíveis?', k: 3, ns: [5, 6, 7, 8, 9] },
];

/** Sem repetição: cada escolha tira uma opção das seguintes. */
function noRepeatGen(r: Rand) {
  const g = r.pick(RANKS);
  const n = r.pick(g.ns);
  const ans = falling(n, g.k);
  const factors = Array.from({ length: g.k }, (_, i) => n - i);
  return draftNumeric({
    prompt: [p(g.intro(n))],
    ask: g.ask,
    answer: ans,
    wrong: [
      { value: n ** g.k, feedback: `Isso permite repetir: ${pow(String(n), g.k)}. Quem já foi escolhido não pode ser escolhido de novo, então as opções diminuem.` },
      { value: n * g.k, feedback: `Isso multiplica o número de opções (${n}) pelo de posições (${g.k}). Multiplique as opções de cada etapa: ${times(factors)}.` },
      { value: ans / fact(g.k), feedback: `Isso desconsidera a ordem (divide por ${g.k}!). Aqui as posições são diferentes: trocar a ordem muda o resultado.` },
    ],
    hints: [`Na 1ª posição há ${n} opções; na 2ª, ${n - 1}, porque uma já foi usada.`, `Multiplique: ${times(factors)}.`],
    solution: [`$${times(factors)} = ${num(ans)}`],
  });
}

const WORDS = ['LIVRO', 'CAMPO', 'PRATO', 'FUTEBOL', 'BRASIL', 'ESCOLA', 'NUVEM', 'PEIXE'];

/** Ordenar n objetos distintos: n!. */
function factorialGen(r: Rand) {
  for (;;) {
    const anagram = r.next() < 0.5;
    if (anagram) {
      const w = r.pick(WORDS);
      if (new Set(w).size !== w.length) continue; // só palavras sem letras repetidas
      if (w === 'LIVRO') continue; // exercício da teoria
      const n = w.length;
      return draftNumeric({
        prompt: [p(`Um anagrama é qualquer ordenação das letras de uma palavra, com sentido ou não.`)],
        ask: `Quantos anagramas tem a palavra ${w}?`,
        answer: fact(n),
        wrong: [
          { value: n * n, feedback: `Isso multiplica ${n} por ${n}. As letras não se repetem: ${times(Array.from({ length: n }, (_, i) => n - i))}.` },
          { value: n ** n, feedback: 'Isso deixa cada letra ser usada várias vezes. Num anagrama, cada letra aparece uma única vez.' },
          { value: (n * (n + 1)) / 2, feedback: `Isso soma 1 + 2 + … + ${n}. As opções de cada posição se multiplicam.` },
        ],
        hints: [`São ${n} letras diferentes: ${n} opções para a 1ª posição, ${n - 1} para a 2ª…`, `${n}! = ${times(Array.from({ length: n }, (_, i) => n - i))}.`],
        solution: [`$${n}! = ${times(Array.from({ length: n }, (_, i) => n - i))} = ${num(fact(n))}`],
      });
    }
    const n = r.int(4, 7);
    const who = r.pick(['amigos vão se sentar num banco', 'livros diferentes vão ser arrumados numa prateleira', 'atletas vão se alinhar para uma foto']);
    const slots = who.startsWith('amigos') ? `com ${n} lugares` : 'em fila';
    return draftNumeric({
      prompt: [p(`${n} ${who} ${slots}.`)],
      ask: 'De quantas formas diferentes isso pode ser feito?',
      answer: fact(n),
      wrong: [
        { value: n * (n - 1), feedback: `Isso para depois de duas posições. São ${n} posições: continue até a última, ${times(Array.from({ length: n }, (_, i) => n - i))}.` },
        { value: n * n, feedback: `Isso multiplica ${n} por ${n}. A cada posição ocupada, sobra uma opção a menos.` },
        { value: (n * (n + 1)) / 2, feedback: `Isso soma 1 + 2 + … + ${n}. As opções de cada posição se multiplicam.` },
      ],
      hints: [`Para a 1ª posição há ${n} opções; para a 2ª, ${n - 1}; e assim até a última, com 1.`, `${n}! = ${times(Array.from({ length: n }, (_, i) => n - i))}.`],
      solution: [`$${n}! = ${times(Array.from({ length: n }, (_, i) => n - i))} = ${num(fact(n))}`],
    });
  }
}

/** Com ou sem repetição: a mesma situação, duas contagens. */
function withWithoutGen(r: Rand) {
  const n = r.int(4, 7);
  const k = r.int(2, 3);
  const rep = r.next() < 0.5;
  const digits = Array.from({ length: n }, (_, i) => i + 1).join(', ');
  const ans = rep ? n ** k : falling(n, k);
  return draftNumeric({
    prompt: [p(`Com os algarismos ${digits}, serão formados números de ${k} algarismos${rep ? ', podendo repetir algarismos' : ', sem repetir nenhum algarismo'}.`)],
    ask: 'Quantos números diferentes podem ser formados?',
    answer: ans,
    wrong: [
      rep
        ? { value: falling(n, k), feedback: 'Isso proíbe a repetição. Aqui os algarismos podem se repetir: todas as posições têm as mesmas opções.' }
        : { value: n ** k, feedback: 'Isso permite repetir algarismos. Sem repetição, cada posição tem uma opção a menos que a anterior.' },
      { value: n * k, feedback: `Isso multiplica a quantidade de algarismos (${n}) pela de posições (${k}). Multiplique as opções de cada posição.` },
    ],
    hints: [rep ? `Cada uma das ${k} posições tem ${n} opções.` : `A 1ª posição tem ${n} opções; a 2ª, ${n - 1}…`, `Multiplique: ${rep ? times(Array(k).fill(n)) : times(Array.from({ length: k }, (_, i) => n - i))}.`],
    solution: [rep ? `$${times(Array(k).fill(n))} = ${num(ans)}` : `$${times(Array.from({ length: k }, (_, i) => n - i))} = ${num(ans)}`],
  });
}

// ———————————————————————————————————————————————— geradores: restrições

/** Começar pela posição com restrição: primeiro algarismo diferente de 0, número par, termina em vogal. */
function restrictedGen(r: Rand) {
  const kind = r.pick(['zero', 'par', 'vogal'] as const);
  if (kind === 'zero') {
    const k = r.int(3, 5);
    const rep = r.next() < 0.5;
    if (!rep && k === 4) return restrictedGen(r); // 9 × 9 × 8 × 7: laboratório da teoria
    const factors = rep ? [9, ...Array(k - 1).fill(10)] : [9, ...Array.from({ length: k - 1 }, (_, i) => 9 - i)];
    const ans = prod(factors);
    return draftNumeric({
      prompt: [p('Um número de vários algarismos não pode começar com 0: 0372, por exemplo, tem só 3 algarismos.')],
      ask: `Quantos números de ${k} algarismos${rep ? '' : ', todos diferentes,'} existem?`,
      answer: ans,
      wrong: [
        { value: rep ? 10 ** k : falling(10, k), feedback: 'Isso deixa o 0 ocupar a primeira posição. Um número como 0372 tem só 3 algarismos.' },
        { value: rep ? 9 ** k : falling(9, k), feedback: 'Isso tira o 0 de todas as posições. Ele só não pode ser o primeiro: depois, volta a ser uma opção.' },
        ...(!rep ? [{ value: 9 * falling(10, k - 1), feedback: 'Isso esquece que o primeiro algarismo já foi usado: nas posições seguintes, há uma opção a menos a cada vez.' }] : []),
      ],
      hints: ['Comece pela 1ª posição: ela não pode ser 0.', rep ? `Depois, cada posição tem 10 opções: ${times(factors)}.` : `Depois, o 0 volta a valer, mas um algarismo já foi usado: ${times(factors)}.`],
      solution: [`$${times(factors)} = ${num(ans)}`],
    });
  }
  if (kind === 'par') {
    const n = r.int(6, 9);
    const evens = Array.from({ length: n }, (_, i) => i + 1).filter((d) => d % 2 === 0).length;
    const ans = evens * (n - 1) * (n - 2);
    return draftNumeric({
      prompt: [p(`Com os algarismos de 1 a ${n}, sem repetir nenhum, serão formados números de 3 algarismos.`)],
      ask: 'Quantos desses números são pares?',
      answer: ans,
      wrong: [
        { value: falling(n, 3), feedback: 'Esse é o total, pares e ímpares. Para ser par, o último algarismo precisa ser par.' },
        { value: falling(n, 3) / 2, feedback: `Isso supõe metade pares, mas de 1 a ${n} há ${evens} algarismos pares e ${n - evens} ímpares.` },
        { value: evens * n * n, feedback: 'Isso permite repetir algarismos nas outras posições. Sem repetição, cada escolha tira uma opção.' },
      ],
      hints: [`Comece pela última posição: ela precisa ser par (${evens} opções).`, `Depois, a 1ª e a 2ª posições: ${n - 1} e ${n - 2} opções.`],
      solution: [`$último: ${evens} opções; depois: ${n - 1} × ${n - 2}`, `$${evens} × ${n - 1} × ${n - 2} = ${num(ans)}`],
    });
  }
  const w = r.pick(['PRATO', 'NUVEM', 'CAMPO', 'BRASIL', 'ESCOLA']);
  const vowels = [...w].filter((c) => 'AEIOU'.includes(c)).length;
  const n = w.length;
  const ans = vowels * fact(n - 1);
  return draftNumeric({
    prompt: [p(`Um anagrama é qualquer ordenação das letras de uma palavra.`)],
    ask: `Quantos anagramas da palavra ${w} terminam em vogal?`,
    answer: ans,
    wrong: [
      { value: fact(n), feedback: 'Esse é o total de anagramas. Só valem os que terminam em vogal.' },
      { value: fact(n - 1), feedback: `Isso fixa uma vogal só no fim. ${w} tem ${vowels} vogais, e cada uma pode ser a última.` },
      { value: vowels * fact(n), feedback: `Isso esquece que a vogal do fim já foi usada: as outras ${n - 1} letras ocupam as ${n - 1} posições restantes.` },
    ],
    hints: [`Comece pela última posição: há ${vowels} vogais em ${w}.`, `As outras ${n - 1} letras se arrumam nas ${n - 1} posições restantes: ${n - 1}!.`],
    solution: [`$${vowels} × ${n - 1}! = ${vowels} × ${num(fact(n - 1))} = ${num(ans)}`],
  });
}

/** "Pelo menos um": total menos os casos sem nenhum. */
function complementGen(r: Rand) {
  const k = r.int(2, 4);
  const d = r.int(1, 9);
  if (k === 3 && d === 7) return complementGen(r); // exercício da teoria
  const total = 10 ** k;
  const none = 9 ** k;
  const ans = total - none;
  return draftNumeric({
    prompt: [p(`Um código tem ${k} algarismos, escolhidos de 0 a 9, e pode repetir algarismos.`)],
    ask: `Quantos códigos têm pelo menos um algarismo ${d}?`,
    answer: ans,
    wrong: [
      { value: k * 10 ** (k - 1), feedback: `Isso fixa o ${d} em cada posição e soma (${k} × ${num(10 ** (k - 1))}), contando mais de uma vez os códigos com dois ou mais ${d}.` },
      { value: none, feedback: `Esses são os códigos sem nenhum ${d}. A pergunta é o contrário: tire-os do total.` },
      { value: 10 ** (k - 1), feedback: `Isso conta só os códigos que começam com ${d}. O ${d} pode estar em qualquer posição.` },
    ],
    hints: [`Total de códigos: ${pow('10', k)} = ${num(total)}.`, `Sem nenhum ${d}: cada posição tem 9 opções, ${pow('9', k)} = ${num(none)}.`],
    solution: [`$total: ${num(total)}; sem nenhum ${d}: ${num(none)}`, `$${num(total)} − ${num(none)} = ${num(ans)}`],
  });
}

/** Casos que não acontecem juntos se somam. */
function casesGen(r: Rand) {
  const a = r.int(2, 4);
  const b = a + 1;
  const base = r.pick([10, 26]);
  const what = base === 10 ? 'algarismos (de 0 a 9)' : 'letras (das 26 do alfabeto)';
  const ans = base ** a + base ** b;
  return draftNumeric({
    prompt: [p(`Um sistema aceita senhas de ${a} ou de ${b} ${what}, podendo repetir.`)],
    ask: 'Quantas senhas diferentes o sistema aceita?',
    answer: ans,
    wrong: [
      { value: base ** a * base ** b, feedback: 'Isso multiplica os dois casos, como se a senha tivesse as duas partes. É uma senha de um tamanho OU do outro: some.' },
      { value: base ** b, feedback: `Isso conta só as senhas de ${b}. As de ${a} também são aceitas.` },
      { value: base ** (a + b), feedback: `Isso trata a senha como se tivesse ${a + b} posições.` },
    ],
    hints: [`Conte cada tamanho separadamente: ${pow(String(base), a)} e ${pow(String(base), b)}.`, 'Os casos não acontecem juntos: some.'],
    solution: [`$${pow(String(base), a)} + ${pow(String(base), b)} = ${num(base ** a)} + ${num(base ** b)} = ${num(ans)}`],
  });
}

/** Ida e volta: com ou sem repetir caminhos. */
function roundTripGen(r: Rand) {
  const x = r.int(2, 5);
  const y = r.int(2, 5);
  const distinct = r.next() < 0.5;
  const go = x * y;
  const back = distinct ? (x - 1) * (y - 1) : go;
  const ans = go * back;
  return draftNumeric({
    prompt: [p(`Da cidade A à cidade B há ${x} estradas, e de B a C há ${y}. Uma pessoa vai de A até C, passando por B, e volta do mesmo jeito${distinct ? ', sem usar na volta nenhuma estrada que usou na ida' : ', podendo repetir estradas'}.`)],
    ask: 'De quantas formas diferentes ela pode fazer a viagem de ida e volta?',
    answer: ans,
    wrong: [
      { value: go, feedback: `Isso conta só a ida (${x} × ${y}). A volta também é uma escolha em etapas: multiplique.` },
      { value: 2 * go, feedback: 'Isso soma ida e volta. Para cada ida, há várias voltas possíveis: multiplique.' },
      ...(distinct ? [{ value: go * go, feedback: 'Isso permite repetir estradas na volta. Cada trecho tem uma opção a menos na volta.' }] : [{ value: go * (x - 1) * (y - 1), feedback: 'Isso proíbe repetir estradas na volta, mas aqui é permitido.' }]),
    ],
    hints: [`Ida: ${x} × ${y} = ${go} formas.`, distinct ? `Volta sem repetir: ${y - 1} × ${x - 1} formas.` : `Volta: também ${go} formas.`],
    solution: [`$ida: ${x} × ${y} = ${go}; volta: ${distinct ? `${y - 1} × ${x - 1}` : `${y} × ${x}`} = ${back}`, `$${go} × ${back} = ${num(ans)}`],
  });
}

/** Pessoas (ou objetos) que precisam ficar juntos: um bloco que também se reorganiza por dentro. */
function togetherGen(r: Rand) {
  for (;;) {
    const ctx = r.pick([
      { intro: (n: number, g: number) => `${n} amigos vão se sentar lado a lado numa fileira de cinema com ${n} lugares. ${g === 2 ? 'Dois deles, um casal, querem' : 'Três deles, irmãos, querem'} ficar juntos.`, ask: 'De quantas formas diferentes os amigos podem se sentar?' },
      { intro: (n: number, g: number) => `${n} livros diferentes vão ser arrumados numa prateleira. ${g === 2 ? 'Os 2 volumes' : 'Os 3 volumes'} de uma mesma coleção devem ficar juntos, em qualquer ordem.`, ask: 'De quantas formas diferentes os livros podem ser arrumados?' },
    ]);
    const n = r.int(4, 8);
    const g = r.pick([2, 2, 3]);
    if (n === 5 && g === 2) continue; // exercício da teoria
    if (g === 3 && n < 5) continue;
    const units = n - g + 1;
    const ans = fact(units) * fact(g);
    return draftNumeric({
      prompt: [p(ctx.intro(n, g))],
      ask: ctx.ask,
      answer: ans,
      wrong: [
        { value: fact(n), feedback: `Esse é o total sem a restrição (${n}!). O grupo precisa ficar junto.` },
        { value: fact(units), feedback: `Isso trata o grupo como um bloco, mas esquece que os ${g} podem trocar de lugar dentro dele: × ${g}!.` },
        { value: fact(units - 1) * fact(g), feedback: `O bloco conta como uma unidade só: são ${n - g} + 1 = ${units} unidades para arrumar, ${units}!.` },
      ],
      hints: [`Trate os ${g} como um bloco: ficam ${units} unidades para arrumar.`, `Dentro do bloco, os ${g} podem se arrumar de ${g}! = ${fact(g)} formas.`],
      solution: [`$${units}! × ${g}! = ${num(fact(units))} × ${fact(g)} = ${num(ans)}`],
    });
  }
}

// ———————————————————————————————————————————————— aula

const TONES: Tone[] = ['ember', 'brass', 'sky'];

export const PRINCIPIO_MULTIPLICATIVO = lesson({
  id: 'principio-multiplicativo',
  topic: 'combinatoria',
  subtopics: ['principio-multiplicativo'],
  title: 'Princípio multiplicativo',
  summary: 'Contar sem listar: escolhas em etapas que se multiplicam, com e sem repetição (senhas, pódios, filas, fatorial) e contagens com restrições, complemento para "pelo menos um" e casos que se somam.',
  requires: ['operacoes'],
  stages: [
    stage('etapas', 'descoberta', 'Escolhas em etapas', 'Contar escolhas feitas em etapas independentes multiplicando as opções de cada etapa e distinguir quando somar e quando multiplicar.', () => ({
      learn: [
        text('Quando uma escolha é feita em **etapas** e o número de opções de cada etapa não depende das outras, o total de possibilidades é o **produto** das opções: é o **princípio multiplicativo**. Uma árvore de possibilidades mostra por quê: cada opção da primeira etapa se ramifica em todas as da segunda, e assim por diante.'),
        lab({
          title: 'Montando roupas',
          intro: 'Escolha quantas camisetas, bermudas e pares de tênis há no armário. Cada quadradinho é uma roupa completa; a cor indica o tênis.',
          params: [
            { key: 'a', label: 'Camisetas', min: 1, max: 6, step: 1, value: 1, format: (v) => String(v) },
            { key: 'b', label: 'Bermudas', min: 1, max: 4, step: 1, value: 1, format: (v) => String(v) },
            { key: 'c', label: 'Pares de tênis', min: 1, max: 3, step: 1, value: 1, format: (v) => String(v) },
          ],
          readouts: ({ a, b, c }) => [
            { label: 'Conta', value: `${a} × ${b} × ${c}` },
            { label: 'Roupas diferentes', value: String(a * b * c), big: true, tone: 'ember' },
          ],
          viz: ({ a, b, c }) => ({
            kind: 'grid',
            rows: a,
            cols: b * c,
            cells: Array.from({ length: a * b * c }, (_, i) => TONES[i % c]),
            legend: Array.from({ length: c }, (_, t) => ({ tone: TONES[t], label: `tênis ${t + 1}` })),
            summary: `${a} camisetas, ${b} bermudas e ${c} pares de tênis dão ${a * b * c} roupas diferentes`,
          }),
          goal: {
            task: 'Com 3 bermudas e 2 pares de tênis, quantas camisetas são necessárias para montar 30 roupas diferentes?',
            done: ({ a, b, c }) => a === 5 && b === 3 && c === 2,
            success: 'Isso: 5 × 3 × 2 = 30. Cada camiseta (uma linha) combina com 3 × 2 = 6 pares de bermuda e tênis.',
          },
          insight: 'Cada linha é uma camiseta, e todas as linhas têm as mesmas combinações de bermuda e tênis: por isso se multiplica.',
        }),
        example('A árvore de possibilidades', 'Uma cantina oferece 2 sucos (laranja e uva) e 3 lanches (misto, queijo e frango). Quantos combos de 1 suco e 1 lanche existem?', [
          askStep('Desenhe a árvore: primeiro o suco, depois o lanche.', 'Quantos ramos de lanche saem de cada suco?', [
            ok('3, um para cada lanche'),
            no('2', 'De cada suco saem tantos ramos quantos são os lanches: 3.'),
          ]),
          step('Total de combos:', '2 sucos × 3 lanches = 6 combos'),
        ], 'São 6 combos: laranja ou uva, cada um com misto, queijo ou frango.'),
        warn('Somar ou multiplicar?', 'Escolhas que acontecem juntas ("um suco E um lanche") se multiplicam. Escolhas alternativas ("vai de ônibus OU de metrô") se somam.'),
        check(numeric({
          prompt: [p('Uma loja personaliza camisetas: o cliente escolhe 1 entre 5 cores de tecido, 1 entre 3 tamanhos de estampa e 1 entre 4 frases.')],
          ask: 'Quantas camisetas diferentes podem ser montadas?',
          answer: 60,
          wrong: [
            { value: 12, feedback: 'Isso soma as opções (5 + 3 + 4). As escolhas acontecem juntas: multiplique.' },
            { value: 15, feedback: 'Isso esquece as 4 frases. Cada combinação de cor e estampa ainda se desdobra em 4.' },
            { value: 20, feedback: 'Isso esquece os 3 tamanhos de estampa. Todas as etapas entram no produto.' },
          ],
          solution: ['$5 × 3 × 4 = 60'],
        })),
      ],
      practice: [gen(productGen), gen(repetitionGen), gen(productGen)],
      challenge: [gen(repetitionGen), gen(productGen), gen(repetitionGen)],
      recap: [
        'Etapas independentes: multiplique as opções de cada uma.',
        '"E" (escolhas juntas): multiplica. "OU" (alternativas): soma.',
        'Mesmas opções em k posições: opçõesᵏ.',
      ],
    })),

    stage('sem-repeticao', 'fundamentos', 'Sem repetição', 'Contar escolhas em que cada opção usada sai das seguintes — pódios, cargos, senhas sem repetir, filas — e usar o fatorial.', () => ({
      learn: [
        text('Às vezes uma escolha **consome** a opção: num pódio, quem ficou em 1º não pode ficar em 2º; numa senha "sem repetir algarismos", cada dígito usado sai da lista. Aí as opções diminuem a cada etapa: um pódio entre 8 atletas tem 8 × 7 × 6 possibilidades. Ordenar todos os n objetos distintos dá n × (n − 1) × … × 1, o **fatorial** de n, escrito **n!**.'),
        math('n! = n × (n − 1) × (n − 2) × … × 2 × 1', '5! = 5 × 4 × 3 × 2 × 1 = 120'),
        example('O pódio', 'Numa corrida com 8 atletas, de quantas formas pode ficar o pódio (1º, 2º e 3º lugares)?', [
          step('1º lugar:', '8 opções'),
          askStep('Agora, o 2º lugar.', 'Depois de definido o 1º, quantos podem ficar em 2º?', [
            ok('7'),
            no('8', 'Quem ganhou o 1º lugar não pode ficar também em 2º: sobram 7.'),
          ]),
          step('3º lugar e total:', '6 opções', '8 × 7 × 6 = 336 pódios'),
        ], 'O pódio pode ficar de 336 formas diferentes.'),
        reveal('Com ou sem repetição: quanto muda?', 'Uma senha de 3 algarismos com repetição tem 10 × 10 × 10 = 1.000 possibilidades. Sem repetição, 10 × 9 × 8 = 720. A diferença está toda em poder, ou não, reutilizar uma opção.'),
        check(numeric({
          prompt: [p('Um anagrama é qualquer ordenação das letras de uma palavra, com sentido ou não.')],
          ask: 'Quantos anagramas tem a palavra LIVRO?',
          answer: 120,
          wrong: [
            { value: 25, feedback: 'Isso multiplica 5 por 5. A cada letra usada, sobra uma opção a menos: 5 × 4 × 3 × 2 × 1.' },
            { value: 3125, feedback: 'Isso deixa cada letra ser usada várias vezes (5⁵). Num anagrama, cada letra aparece uma única vez.' },
            { value: 15, feedback: 'Isso soma 1 + 2 + 3 + 4 + 5. As opções de cada posição se multiplicam.' },
          ],
          solution: ['$5! = 5 × 4 × 3 × 2 × 1 = 120'],
        })),
      ],
      practice: [gen(noRepeatGen), gen(factorialGen), gen(withWithoutGen)],
      challenge: [gen(withWithoutGen), gen(noRepeatGen), gen(factorialGen)],
      recap: [
        'Sem repetição: as opções diminuem uma a cada etapa.',
        'Ordenar n objetos distintos: n!.',
        'Posições diferentes (1º, 2º, cargos): a ordem importa.',
      ],
    })),

    stage('restricoes', 'aplicacoes', 'Contar com condições', 'Contar com restrições começando pela etapa mais restrita, usar o complemento para "pelo menos um" e somar casos que não acontecem juntos.', () => ({
      learn: [
        text('Com condições, comece pela **etapa mais restrita**: se o número não pode começar com 0, escolha primeiro o algarismo inicial (9 opções) e depois os outros. Para "**pelo menos um**", costuma ser mais fácil contar o **complemento**: o total menos os casos sem nenhum. E quando há casos separados (senhas de 3 OU de 4 algarismos), conte cada caso e **some**.'),
        lab({
          title: 'Números com regras',
          intro: 'Conte números formados com os algarismos de 0 a 9. Escolha o tamanho e as regras; as barras mostram as opções de cada posição.',
          params: [
            { key: 'L', label: 'Quantidade de algarismos', min: 1, max: 5, step: 1, value: 1, format: (v) => String(v) },
            { key: 'rep', label: 'Pode repetir algarismos?', min: 0, max: 1, step: 1, value: 1, format: (v) => (v ? 'sim' : 'não') },
            { key: 'z', label: 'Proibir começar com 0?', min: 0, max: 1, step: 1, value: 0, format: (v) => (v ? 'sim' : 'não') },
          ],
          readouts: ({ L, rep, z }) => {
            const opts = Array.from({ length: L }, (_, i) => (i === 0 && z ? 9 : rep ? 10 : 10 - i));
            return [
              { label: 'Conta', value: times(opts) },
              { label: 'Total', value: num(prod(opts)), big: true, tone: 'ember' },
            ];
          },
          viz: ({ L, rep, z }) => {
            const opts = Array.from({ length: L }, (_, i) => (i === 0 && z ? 9 : rep ? 10 : 10 - i));
            return {
              kind: 'bars',
              bars: opts.map((o, i) => ({ label: `${i + 1}ª`, value: o, tone: i === 0 && z ? ('brass' as const) : ('ember' as const) })),
              max: 10,
              summary: `Com ${L} algarismos, ${rep ? 'com' : 'sem'} repetição${z ? ' e sem começar com 0' : ''}, há ${num(prod(opts))} números`,
            };
          },
          goal: {
            task: 'Configure a contagem dos números de 4 algarismos distintos (um número não começa com 0).',
            done: ({ L, rep, z }) => L === 4 && rep === 0 && z === 1,
            success: 'Isso: 9 × 9 × 8 × 7 = 4.536. A 1ª posição tem 9 opções (sem o 0); a 2ª também tem 9, porque o 0 volta a valer, mas um algarismo já foi usado.',
          },
          insight: 'A restrição muda as opções de uma posição; a falta de repetição muda as das posições seguintes.',
        }),
        example('Números pares', 'Com os algarismos de 1 a 7, sem repetir, quantos números pares de 3 algarismos podem ser formados?', [
          askStep('Há uma restrição: ser par.', 'Por qual posição começar?', [
            ok('Pela última, que precisa ser par'),
            no('Pela primeira, como de costume', 'Se escolher primeiro as outras, não dá para saber quantos pares sobraram para o fim. Comece pela posição com restrição.'),
          ]),
          step('Contando:', 'última: 2, 4 ou 6 → 3 opções', '1ª e 2ª: 6 × 5 = 30', 'total: 3 × 30 = 90'),
        ], 'São 90 números pares.'),
        check(numeric({
          prompt: [p('Um código tem 3 algarismos, escolhidos de 0 a 9, e pode repetir algarismos.')],
          ask: 'Quantos códigos têm pelo menos um algarismo 7?',
          answer: 271,
          wrong: [
            { value: 300, feedback: 'Isso fixa o 7 em cada posição e soma (3 × 100), contando mais de uma vez códigos como 771 e 777.' },
            { value: 729, feedback: 'Esses são os códigos sem nenhum 7 (9 × 9 × 9). A pergunta é o contrário.' },
            { value: 100, feedback: 'Isso conta só os códigos que começam com 7. O 7 pode estar em qualquer posição.' },
          ],
          solution: ['$total: 10 × 10 × 10 = 1.000', '$sem nenhum 7: 9 × 9 × 9 = 729', '$1.000 − 729 = 271'],
        })),
      ],
      practice: [gen(restrictedGen), gen(complementGen), gen(casesGen)],
      challenge: [gen(complementGen), gen(restrictedGen), gen(roundTripGen)],
      recap: [
        'Comece pela posição com restrição.',
        '"Pelo menos um" = total − nenhum.',
        'Casos separados (OU): conte cada um e some.',
      ],
    })),

    stage('maestria', 'maestria', 'Maestria: contagens no ENEM', 'Resolver problemas inéditos de contagem que combinam etapas, repetição, restrições e casos.', () => ({
      learn: [
        strategy('Contagem em 4 passos', '1) Liste as etapas da escolha. 2) Pergunte: a ordem importa? Pode repetir? Há restrições? 3) Comece pela etapa mais restrita e multiplique. 4) "Pelo menos um": use o complemento; casos separados: some.'),
        example('Placas de carro', 'Num modelo de placa, há 3 letras (das 26) seguidas de 4 algarismos (de 0 a 9), podendo repetir. Quantas placas existem?', [
          askStep('São 7 posições.', 'Quantas opções tem cada posição de letra?', [
            ok('26, porque pode repetir'),
            no('26, 25 e 24', 'Isso valeria sem repetição. Numa placa, as letras podem se repetir (AAA-0000 existe).'),
          ]),
          step('Total:', '26 × 26 × 26 × 10 × 10 × 10 × 10 = 17.576 × 10.000 = 175.760.000'),
        ], 'São 175.760.000 placas.'),
        reveal('Por que o complemento ajuda?', '"Pelo menos um" junta muitos casos (exatamente um, exatamente dois, …). Contar o oposto — "nenhum" — é uma conta só, e o que se quer é o total menos ela.'),
        check(numeric({
          prompt: [p('Cinco amigos vão posar para uma foto lado a lado. Ana e Bia querem ficar juntas.')],
          ask: 'De quantas formas diferentes os cinco podem se posicionar?',
          answer: 48,
          wrong: [
            { value: 120, feedback: 'Esse é o total sem a restrição (5!). Ana e Bia precisam ficar juntas.' },
            { value: 24, feedback: 'Isso trata Ana e Bia como um bloco (4!), mas esquece que elas podem trocar de lugar dentro dele: × 2.' },
            { value: 12, feedback: 'O bloco de Ana e Bia conta como uma pessoa: são 4 "unidades" para arrumar, 4! = 24, vezes 2.' },
          ],
          solution: ['$bloco Ana-Bia + 3 amigos = 4 unidades → 4! = 24', '$dentro do bloco: 2 ordens → 24 × 2 = 48'],
        })),
      ],
      practice: [gen(togetherGen), gen(roundTripGen), gen(restrictedGen)],
      challenge: [gen(togetherGen), gen(casesGen), gen(noRepeatGen), gen(complementGen)],
      recap: [
        'Etapas, ordem, repetição, restrições: nessa ordem de perguntas.',
        'Elementos que ficam juntos: trate como um bloco e conte as ordens dentro dele.',
        'Somar só quando os casos são alternativos.',
      ],
    })),
  ],
});
