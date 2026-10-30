/**
 * Aula: Probabilidade simples — casos favoráveis ÷ casos possíveis (urnas, dados, sorteios),
 * o espaço amostral de duas moedas e dois dados (pares ordenados), "ou" sem contar duas vezes,
 * o complemento ("não") e maestria com porcentagens.
 */
import {
  askStep,
  check,
  choice,
  draftChoice,
  draftNumeric,
  example,
  gen,
  key,
  lab,
  lesson,
  math,
  no,
  numeric,
  numericOptions,
  ok,
  p,
  reveal,
  sim,
  stage,
  step,
  strategy,
  text,
  warn,
} from '../../kit/build';
import { frac, num, round } from '../../kit/format';
import type { Rand, Tone } from '../../types';

/** Fração irredutível como texto ("0", "1" e "a/b"). */
const fr = (a: number, b: number) => (a === 0 ? '0' : a === b ? '1' : frac(a, b));
/** Alternativa de probabilidade a partir de favoráveis e possíveis. */
const opt = (a: number, b: number) => ({ value: a / b, text: fr(a, b) });
const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
/** Alternativas de probabilidade: descarta distratores que não seriam probabilidades (≤ 0 ou ≥ 1). */
const probOptions = (correct: { value: number; text: string }, wrongs: { value: number; text: string; feedback: string }[]) =>
  numericOptions(correct, wrongs.filter((w) => w.value > 0 && w.value < 1));

// ———————————————————————————————————————————————— geradores: favoráveis ÷ possíveis

const COLORS = [
  { name: 'vermelha', many: 'vermelhas' },
  { name: 'azul', many: 'azuis' },
  { name: 'verde', many: 'verdes' },
  { name: 'amarela', many: 'amarelas' },
];

/** Urna: bolas de uma cor ÷ total de bolas. */
function urnGen(r: Rand) {
  for (;;) {
    const k = r.int(2, 3);
    const cols = r.shuffle(COLORS).slice(0, k);
    const counts = cols.map(() => r.int(1, 9));
    const total = counts.reduce((a, b) => a + b, 0);
    if (new Set(counts).size < k) continue; // cores com a mesma quantidade deixariam distratores iguais à resposta
    if (k === 2 && counts.includes(4) && counts.includes(6)) continue; // questão do banco
    if (k === 3 && counts.join() === '5,3,2') continue; // exercício da teoria
    const i = r.int(0, k - 1);
    const x = counts[i];
    const other = counts[(i + 1) % k];
    const list = cols.map((c, j) => `${counts[j]} ${counts[j] === 1 ? c.name : c.many}`);
    return draftChoice({
      prompt: [p(`Uma urna tem ${list.slice(0, -1).join(', ')} e ${list[k - 1]}, todas do mesmo tamanho. Uma bola é sorteada ao acaso.`)],
      ask: `Qual é a probabilidade de a bola sorteada ser ${cols[i].name}?`,
      options: probOptions(opt(x, total), [
        { ...opt(x, total - x), feedback: `Isso divide as bolas ${cols[i].many} pelas outras. O denominador são todas as ${total} bolas da urna.` },
        { ...opt(1, k), feedback: `Isso supõe uma chance para cada cor, mas as cores têm quantidades diferentes de bolas.` },
        { ...opt(x, other), feedback: `Isso compara com as bolas de uma só das outras cores. Divida pelo total de bolas: ${total}.` },
        { ...opt(total - x, total), feedback: `Essa é a chance de não sair ${cols[i].name}: ${total - x === 1 ? 'a outra bola' : `as outras ${total - x} bolas`}.` },
      ]),
      verify: () => x / total,
      hints: [`Casos possíveis: todas as bolas, ${counts.join(' + ')} = ${total}.`, `Casos favoráveis: ${x === 1 ? `a única bola ${cols[i].name}` : `as ${x} bolas ${cols[i].many}`}.`],
      solution: [`$P = ${x} ÷ ${total} = ${fr(x, total)}`],
    });
  }
}

const DIE_EVENTS = [
  { name: 'um número par', faces: [2, 4, 6] },
  { name: 'um número maior que 4', faces: [5, 6] },
  { name: 'um múltiplo de 3', faces: [3, 6] },
  { name: 'um número primo', faces: [2, 3, 5] },
  { name: 'um número menor que 3', faces: [1, 2] },
  { name: 'um divisor de 6', faces: [1, 2, 3, 6] },
  { name: 'um número diferente de 1', faces: [2, 3, 4, 5, 6] },
];

/** Um dado honesto: faces favoráveis ÷ 6. */
function dieGen(r: Rand) {
  const e = r.pick(DIE_EVENTS);
  const f = e.faces.length;
  return draftChoice({
    prompt: [p('Um dado comum e honesto, de seis faces numeradas de 1 a 6, é lançado uma vez.')],
    ask: `Qual é a probabilidade de sair ${e.name}?`,
    options: probOptions(opt(f, 6), [
      { ...opt(1, 6), feedback: `1/6 é a chance de uma face só. O evento acontece com ${f} faces: ${e.faces.join(', ')}.` },
      { ...opt(f, 6 - f), feedback: `Isso divide as faces favoráveis pelas desfavoráveis. O denominador são as 6 faces.` },
      { ...opt(6 - f, 6), feedback: 'Essa é a chance do contrário: das faces que não servem.' },
      { ...opt(f, 5), feedback: 'O dado tem 6 faces, de 1 a 6: o denominador é 6.' },
      ...(f > 1 ? [{ ...opt(f - 1, 6), feedback: `Isso deixa de contar uma das faces que servem: são ${f} (${e.faces.join(', ')}).` }] : []),
    ]),
    verify: () => f / 6,
    hints: ['Liste as faces que servem.', `São ${f} faces favoráveis entre 6 possíveis.`],
    solution: [`$faces favoráveis: ${e.faces.join(', ')}`, `$P = ${f} ÷ 6 = ${fr(f, 6)}`],
  });
}

/** Sorteio de 1 a N: quantos múltiplos de k existem até N? */
function rangeGen(r: Rand) {
  for (;;) {
    const N = r.pick([20, 25, 30, 40, 50, 60, 80, 100]);
    const k = r.int(3, 9);
    if (N % k === 0) continue; // queremos a armadilha do "1 em cada k"
    const m = Math.floor(N / k);
    const ans = round((100 * m) / N, 2);
    if (N === 20 && k === 3) continue; // exemplo da teoria
    return draftNumeric({
      prompt: [p(`Numa rifa, um número de 1 a ${N} será sorteado. Ganha um brinde quem tiver um múltiplo de ${k}.`)],
      ask: `Qual é a probabilidade, em porcentagem, de o número sorteado ser um múltiplo de ${k}?`,
      unit: '%',
      answer: ans,
      tolerance: 0.01,
      wrong: [
        { value: round(100 / k, 2), feedback: `Isso supõe "1 em cada ${k}" exatamente. Como ${N} não é múltiplo de ${k}, conte: há ${m} múltiplos de ${k} até ${N}.` },
        { value: m, feedback: `${m} é o número de múltiplos. Divida pelos ${N} números possíveis.` },
        { value: round((100 * (m + 1)) / N, 2), feedback: `Isso conta um múltiplo a mais: o maior múltiplo de ${k} até ${N} é ${m * k}, e são ${m}.` },
      ],
      hints: [`Os múltiplos de ${k} até ${N} são ${k}, ${2 * k}, …, ${m * k}.`, `São ${m} favoráveis em ${N}: divida e multiplique por 100.`],
      solution: [`$${N} ÷ ${k} = ${num(N / k, 2)} → ${m} múltiplos`, `$${m} ÷ ${N} = ${num(m / N, 4)} = ${num(ans)}%`],
    });
  }
}

// ———————————————————————————————————————————————— geradores: espaço amostral

const PAIRS = range(1, 6).flatMap((a) => range(1, 6).map((b) => [a, b] as const));
const DICE_EVENTS: { name: string; test: (a: number, b: number) => boolean }[] = [
  ...[2, 3, 4, 5, 6, 8, 9, 10, 11, 12].map((s) => ({ name: `a soma ser ${s}`, test: (a: number, b: number) => a + b === s })),
  { name: 'saírem dois números iguais', test: (a, b) => a === b },
  { name: 'a soma ser maior que 9', test: (a, b) => a + b > 9 },
  { name: 'os dois números serem pares', test: (a, b) => a % 2 === 0 && b % 2 === 0 },
  { name: 'a diferença entre os números ser 1', test: (a, b) => Math.abs(a - b) === 1 },
  { name: 'o produto ser um número par', test: (a, b) => (a * b) % 2 === 0 },
];

/** Dois dados: 36 pares ordenados igualmente prováveis. */
function twoDiceGen(r: Rand) {
  for (;;) {
    const e = r.pick(DICE_EVENTS);
    if (e.name === 'a soma ser 4') continue; // exercício da teoria
    const fav = PAIRS.filter(([a, b]) => e.test(a, b));
    const f = fav.length;
    const unordered = new Set(fav.map(([a, b]) => `${Math.min(a, b)}-${Math.max(a, b)}`)).size;
    const sums = /^a soma ser \d+$/.test(e.name);
    return draftChoice({
      prompt: [p('Dois dados comuns e honestos, de seis faces, são lançados ao mesmo tempo.')],
      ask: `Qual é a probabilidade de ${e.name}?`,
      options: probOptions(opt(f, 36), [
        ...(sums ? [{ ...opt(1, 11), feedback: 'Isso trata as 11 somas possíveis (de 2 a 12) como igualmente prováveis. Elas não são: conte os 36 pares.' }] : []),
        { ...opt(unordered, 21), feedback: 'Isso conta pares sem ordem, como se (1, 2) e (2, 1) fossem o mesmo resultado. Com dois dados, são 36 pares diferentes, todos com a mesma chance.' },
        { ...opt(f, 6), feedback: 'Com dois dados, há 6 × 6 = 36 resultados possíveis, e não 6.' },
        { ...opt(36 - f, 36), feedback: 'Essa é a chance do contrário: dos pares que não servem.' },
      ]),
      verify: () => f / 36,
      hints: ['Monte o quadro 6 × 6: cada casa é um par (1º dado, 2º dado).', 'Conte as casas que servem e divida por 36.'],
      solution: [`$pares favoráveis: ${fav.map(([a, b]) => `(${a}, ${b})`).join(' ')}`, `$P = ${f} ÷ 36 = ${fr(f, 36)}`],
    });
  }
}

/** `placar`: quantos "placares" (número de caras) servem, entre os n + 1 possíveis. */
const COIN_EVENTS = [
  { n: 2, name: 'sair uma cara e uma coroa', count: 2, placar: 1 },
  { n: 2, name: 'saírem duas caras', count: 1, placar: 1 },
  { n: 2, name: 'sair pelo menos uma cara', count: 3, placar: 2 },
  { n: 3, name: 'saírem três resultados iguais', count: 2, placar: 2 },
  { n: 3, name: 'sair pelo menos uma coroa', count: 7, placar: 3 },
  { n: 3, name: 'saírem três caras', count: 1, placar: 1 },
  { n: 4, name: 'saírem quatro caras', count: 1, placar: 1 },
];

/** Moedas: 2ⁿ sequências igualmente prováveis. */
function coinsGen(r: Rand) {
  const e = r.pick(COIN_EVENTS);
  const total = 2 ** e.n;
  return draftChoice({
    prompt: [p(`Uma moeda honesta é lançada ${e.n} vezes seguidas (ou ${e.n} moedas são lançadas juntas).`)],
    ask: `Qual é a probabilidade de ${e.name}?`,
    options: probOptions(opt(e.count, total), [
      { ...opt(e.placar, e.n + 1), feedback: `Isso trata os ${e.n + 1} "placares" (de 0 a ${e.n} caras) como igualmente prováveis. Eles não são: conte as ${total} sequências.` },
      { ...opt(e.count, 2 * e.n), feedback: `Com ${e.n} lançamentos, há 2${e.n === 2 ? '²' : e.n === 3 ? '³' : '⁴'} = ${total} sequências possíveis, e não ${2 * e.n}.` },
      { ...opt(total - e.count, total), feedback: 'Essa é a chance do contrário.' },
      e.count > 1
        ? { ...opt(e.count - 1, total), feedback: `Isso deixa de contar uma das sequências que servem: são ${e.count}, em qualquer ordem.` }
        : { ...opt(1, e.n), feedback: `Isso divide 1 pelo número de lançamentos. As sequências possíveis são 2${e.n === 2 ? '²' : e.n === 3 ? '³' : '⁴'} = ${total}.` },
    ]),
    verify: () => e.count / total,
    hints: [`Liste as sequências: com ${e.n} lançamentos, são ${total} (como ${e.n === 2 ? 'CC, CK, KC, KK' : 'CCC, CCK, …'}).`, 'Conte as que servem.'],
    solution: [`$sequências possíveis: 2${e.n === 2 ? '²' : e.n === 3 ? '³' : '⁴'} = ${total}`, `$favoráveis: ${e.count} → P = ${fr(e.count, total)}`],
  });
}

/** Um dado e uma moeda: 12 resultados. */
function dieCoinGen(r: Rand) {
  const e = r.pick(DIE_EVENTS.slice(0, 5));
  const side = r.pick(['cara', 'coroa']);
  const f = e.faces.length;
  return draftChoice({
    prompt: [p('Lançam-se um dado honesto, de seis faces, e uma moeda honesta.')],
    ask: `Qual é a probabilidade de sair ${side} na moeda e ${e.name} no dado?`,
    options: probOptions(opt(f, 12), [
      { ...opt(f + 1, 12), feedback: `Isso soma os casos da moeda e do dado. Os resultados são pares (moeda, dado): ${side} com cada uma das ${f} faces que servem.` },
      { ...opt(f, 6), feedback: `Isso ignora a moeda. São 2 × 6 = 12 resultados, e só a metade deles tem ${side}.` },
      { ...opt(1, 2), feedback: 'Essa é só a chance da moeda. O dado também precisa dar o resultado pedido.' },
    ]),
    verify: () => f / 12,
    hints: ['Os resultados são pares (moeda, dado): 2 × 6 = 12.', `Favoráveis: ${side} com ${e.faces.join(', ')}.`],
    solution: [`$possíveis: 2 × 6 = 12; favoráveis: ${f}`, `$P = ${f} ÷ 12 = ${fr(f, 12)}`],
  });
}

// ———————————————————————————————————————————————— geradores: "ou" e "não"

/** Múltiplos de a OU de b: tirar o que foi contado duas vezes. */
function orGen(r: Rand) {
  for (;;) {
    const N = r.pick([20, 24, 30, 36, 40, 50, 60]);
    const [a, b] = r.shuffle([2, 3, 4, 5, 6, 7]).slice(0, 2).sort((x, y) => x - y);
    const l = (a * b) / gcdN(a, b);
    if (l > N || b % a === 0) continue;
    if (N === 30 && a === 3 && b === 5) continue; // exemplo da teoria
    const na = Math.floor(N / a);
    const nb = Math.floor(N / b);
    const both = Math.floor(N / l);
    const f = na + nb - both;
    return draftChoice({
      prompt: [p(`Cartões numerados de 1 a ${N} estão numa caixa, e um deles é sorteado.`)],
      ask: `Qual é a probabilidade de sair um múltiplo de ${a} ou de ${b}?`,
      options: probOptions(opt(f, N), [
        { ...opt(na + nb, N), feedback: `Isso soma ${na} + ${nb} e conta duas vezes ${both === 1 ? `o ${l}, que é múltiplo dos dois` : `os ${both} números que são múltiplos dos dois (múltiplos de ${l})`}.` },
        { ...opt(both, N), feedback: `Essa é a chance de ser múltiplo de ${a} e de ${b} ao mesmo tempo. "Ou" vale para qualquer um dos dois.` },
        { ...opt(na, N), feedback: `Isso conta só os múltiplos de ${a}. Os de ${b} também servem.` },
      ]),
      verify: () => f / N,
      hints: [`Múltiplos de ${a}: ${na}; de ${b}: ${nb}.`, `Os múltiplos de ${l} estão nas duas listas: ${both}. Tire-os uma vez.`],
      solution: [`$${na} + ${nb} − ${both} = ${f} favoráveis`, `$P = ${f} ÷ ${N} = ${fr(f, N)}`],
    });
  }
}

function gcdN(a: number, b: number): number {
  return b ? gcdN(b, a % b) : a;
}

/** Roleta numerada: par OU maior que k. */
function wheelOrGen(r: Rand) {
  for (;;) {
    const n = r.pick([6, 10, 12]);
    const k = r.int(2, n - 2);
    const even = range(1, n).filter((x) => x % 2 === 0);
    const big = range(k + 1, n);
    const union = range(1, n).filter((x) => x % 2 === 0 || x > k);
    const inter = even.filter((x) => x > k);
    if (inter.length === 0 || union.length === n) continue;
    return draftChoice({
      prompt: [p(`Uma roleta tem ${n} setores iguais, numerados de 1 a ${n}. Ganha quem tirar um número par ou um número maior que ${k}.`)],
      ask: 'Qual é a probabilidade de ganhar?',
      options: probOptions(opt(union.length, n), [
        { ...opt(even.length + big.length, n), feedback: `Isso soma ${even.length} pares e ${big.length} maiores que ${k}, contando duas vezes ${inter.join(', ')}, que estão nos dois grupos.` },
        { ...opt(inter.length, n), feedback: 'Essa é a chance de ser par e maior ao mesmo tempo. "Ou" vale para qualquer uma das duas condições.' },
        { ...opt(even.length, n), feedback: `Isso conta só os pares. Os ímpares maiores que ${k} também ganham.` },
      ]),
      verify: () => union.length / n,
      hints: [`Pares: ${even.join(', ')}. Maiores que ${k}: ${big.join(', ')}.`, 'Junte as duas listas sem repetir números.'],
      solution: [`$ganham: ${union.join(', ')} → ${union.length} setores`, `$P = ${union.length} ÷ ${n} = ${fr(union.length, n)}`],
    });
  }
}

const NOTS = [
  { intro: (t: number, k: number) => `Num lote de ${t} peças, ${k} são defeituosas. Uma peça é escolhida ao acaso para inspeção.`, ask: 'Qual é a probabilidade, em porcentagem, de a peça não ser defeituosa?', totals: [50, 80, 200, 250, 400, 500] },
  { intro: (t: number, k: number) => `Numa rifa com ${t} números, uma pessoa comprou ${k}. Um número será sorteado.`, ask: 'Qual é a probabilidade, em porcentagem, de essa pessoa não ganhar?', totals: [40, 50, 100, 200, 250] },
];

/** Complemento: P(não A) = 1 − P(A). */
function notGen(r: Rand) {
  for (;;) {
    const g = r.pick(NOTS);
    const t = r.pick(g.totals);
    const k = r.int(2, Math.floor(t / 5));
    const ans = round((100 * (t - k)) / t, 2);
    if (!Number.isInteger(ans * 10)) continue;
    if (t === 40 && k === 3) continue; // exercício da teoria
    return draftNumeric({
      prompt: [p(g.intro(t, k))],
      ask: g.ask,
      unit: '%',
      answer: ans,
      wrong: [
        { value: round((100 * k) / t, 2), feedback: 'Essa é a chance do evento acontecer. A pergunta é a do contrário: 100% menos ela.' },
        { value: t - k, feedback: `${t - k} é o número de casos que servem. Divida pelos ${t} possíveis.` },
        { value: 100 - k, feedback: `Isso tira ${k} de 100, como se ${k} fosse uma porcentagem. As chances são em relação aos ${t} casos: ${t - k} ÷ ${t}.` },
      ],
      hints: [`Casos contrários: ${t} − ${k} = ${t - k}.`, `Divida por ${t} e multiplique por 100 (ou faça 100% − ${num((100 * k) / t, 2)}%).`],
      solution: [`$P(não) = ${t - k} ÷ ${t} = ${num((t - k) / t, 4)} = ${num(ans)}%`],
    });
  }
}

// ———————————————————————————————————————————————— aula

const BALL: Tone[] = ['ember', 'sky'];

export const PROBABILIDADE_SIMPLES = lesson({
  id: 'probabilidade-simples',
  topic: 'probabilidade',
  subtopics: ['probabilidade-simples'],
  title: 'Probabilidade simples',
  summary: 'Casos favoráveis ÷ casos possíveis em urnas, dados e sorteios, o espaço amostral de moedas e dados como pares ordenados, o "ou" sem contar duas vezes e o complemento.',
  requires: ['fracoes', 'porcentagem'],
  stages: [
    stage('chances', 'descoberta', 'Favoráveis ÷ possíveis', 'Calcular a probabilidade de um evento com resultados igualmente prováveis como casos favoráveis ÷ casos possíveis e escrevê-la como fração, decimal ou porcentagem.', () => ({
      learn: [
        text('Quando todos os resultados de um experimento têm a **mesma chance** (uma bola qualquer de uma urna, uma face de um dado honesto), a **probabilidade** de um evento é o número de casos **favoráveis** dividido pelo número de casos **possíveis**. Ela fica sempre entre 0 (impossível) e 1 (certo) e pode ser escrita como fração, decimal ou porcentagem: 1/4 = 0,25 = 25%.'),
        math('P(evento) = [[casos favoráveis|casos possíveis]]'),
        sim({
          title: 'Lançando um dado',
          intro: 'Lance o dado muitas vezes e acompanhe a frequência do evento "sair 5 ou 6".',
          outcomes: range(1, 6).map((f) => ({ label: String(f), p: 1 / 6 })),
          event: { label: 'sair 5 ou 6', outcomes: [4, 5] },
          insight: 'Com poucos lançamentos, a frequência oscila; com muitos, ela se aproxima da probabilidade: 2 faces em 6, ou 1/3 ≈ 33%.',
        }),
        lab({
          title: 'Monte a urna',
          intro: 'Escolha quantas bolas vermelhas e azuis há na urna. Uma bola será sorteada ao acaso.',
          params: [
            { key: 'v', label: 'Bolas vermelhas', min: 0, max: 10, step: 1, value: 1, format: (x) => String(x) },
            { key: 'a', label: 'Bolas azuis', min: 1, max: 10, step: 1, value: 1, format: (x) => String(x) },
          ],
          readouts: ({ v, a }) => [
            { label: 'Possíveis', value: String(v + a) },
            { label: 'P(vermelha)', value: `${fr(v, v + a)} = ${num((100 * v) / (v + a), 1)}%`, big: true, tone: 'ember' },
          ],
          viz: ({ v, a }) => ({
            kind: 'grid',
            rows: 2,
            cols: 10,
            cells: Array.from({ length: 20 }, (_, i) => (i < v ? BALL[0] : i < v + a ? BALL[1] : null)),
            legend: [
              { tone: BALL[0], label: 'vermelha' },
              { tone: BALL[1], label: 'azul' },
            ],
            summary: `${v} bolas vermelhas e ${a} azuis: chance de vermelha ${fr(v, v + a)}`,
          }),
          goal: {
            task: 'Com 3 bolas vermelhas, quantas azuis deixam a chance de vermelha em exatamente 1/4?',
            done: ({ v, a }) => v === 3 && a === 9,
            success: 'Isso: 3 vermelhas em 12 bolas, 3/12 = 1/4. Para a chance ser 1 em 4, o total precisa ser 4 vezes o número de vermelhas.',
          },
          insight: 'Mais bolas azuis não mudam o número de vermelhas, mas aumentam o total — e a chance de vermelha cai.',
        }),
        example('Múltiplos de 3', 'Um número de 1 a 20 é sorteado. Qual é a probabilidade de ele ser múltiplo de 3?', [
          askStep('Primeiro, os casos possíveis.', 'Quantos são os casos possíveis?', [
            ok('20'),
            no('6', '6 são os favoráveis. Os possíveis são todos os números que podem sair: 20.'),
          ]),
          step('Favoráveis e probabilidade:', '3, 6, 9, 12, 15, 18 → 6 números', 'P = 6/20 = 3/10 = 30%'),
        ], 'A probabilidade é 3/10, ou 30%.'),
        check(choice({
          prompt: [p('Um saco tem 5 fichas verdes, 3 amarelas e 2 brancas, todas iguais ao tato. Uma ficha é retirada ao acaso.')],
          ask: 'Qual é a probabilidade de a ficha ser amarela?',
          options: [
            ok('3/10'),
            no('3/7', 'Isso divide as amarelas pelas outras fichas. O denominador são todas as 10 fichas.'),
            no('1/3', 'Isso supõe uma chance para cada cor, mas as cores têm quantidades diferentes de fichas.'),
            no('3/5', 'Isso compara as amarelas só com as verdes. Divida pelo total: 10 fichas.'),
          ],
          solution: ['$possíveis: 5 + 3 + 2 = 10; favoráveis: 3', '$P = 3/10'],
        })),
      ],
      practice: [gen(urnGen), gen(dieGen), gen(rangeGen)],
      challenge: [gen(rangeGen), gen(urnGen), gen(dieGen)],
      recap: [
        'P = favoráveis ÷ possíveis (resultados igualmente prováveis).',
        '0 ≤ P ≤ 1; fração, decimal e porcentagem são o mesmo número.',
        'O denominador são todos os casos possíveis, e não os desfavoráveis.',
      ],
    })),

    stage('espaco', 'fundamentos', 'O espaço amostral', 'Montar o espaço amostral de duas ou mais moedas e de dois dados como pares (ou sequências) ordenados e contar os casos favoráveis.', () => ({
      learn: [
        text('Com dois dados, duas moedas ou duas escolhas, liste o **espaço amostral** como pares **ordenados**: com dois dados há 6 × 6 = 36 pares igualmente prováveis, e (2, 5) é diferente de (5, 2). Com duas moedas, são 4 resultados: (cara, cara), (cara, coroa), (coroa, cara) e (coroa, coroa). Contar pares — e não somas ou "placares" — é o que garante a mesma chance para cada caso.'),
        lab({
          title: 'O quadro dos dois dados',
          intro: 'Cada casa do quadro é um par (1º dado, 2º dado). Escolha uma soma e veja quantas casas a produzem.',
          params: [{ key: 's', label: 'Soma', min: 2, max: 12, step: 1, value: 3, format: (x) => String(x) }],
          readouts: ({ s }) => {
            const f = PAIRS.filter(([a, b]) => a + b === s).length;
            return [
              { label: 'Pares com essa soma', value: String(f) },
              { label: 'Probabilidade', value: `${f}/36 = ${fr(f, 36)}`, big: true, tone: 'iris' },
            ];
          },
          viz: ({ s }) => ({
            kind: 'grid',
            rows: 6,
            cols: 6,
            cells: PAIRS.map(([a, b]) => (a + b === s ? ('iris' as const) : ('mist' as const))),
            legend: [
              { tone: 'iris', label: `soma ${s}` },
              { tone: 'mist', label: 'outras somas' },
            ],
            summary: `${PAIRS.filter(([a, b]) => a + b === s).length} dos 36 pares têm soma ${s}`,
          }),
          goal: {
            task: 'Ache uma soma que aconteça em exatamente 4 dos 36 pares.',
            done: ({ s }) => s === 5 || s === 9,
            success: 'Isso: há 4 pares para essa soma, e a probabilidade é 4/36 = 1/9. As somas do meio têm mais pares; as dos extremos (2 e 12), só um.',
          },
          insight: 'As somas não são igualmente prováveis: os pares é que são. Por isso se conta casas do quadro, e não somas.',
        }),
        example('Duas moedas', 'Duas moedas honestas são lançadas. Qual é a probabilidade de sair uma cara e uma coroa?', [
          askStep('Liste os resultados.', 'Quantos são os resultados possíveis?', [
            ok('4: CC, CK, KC e KK'),
            no('3: duas caras, duas coroas ou uma de cada', 'Esses três casos não têm a mesma chance: "uma de cada" acontece de dois jeitos (CK e KC).'),
          ]),
          step('Favoráveis:', 'CK e KC → 2 de 4', 'P = 2/4 = 1/2'),
        ], 'A probabilidade é 1/2, e não 1/3.'),
        warn('Pares, não somas', 'Com dois dados, as 11 somas (de 2 a 12) não têm a mesma chance. Quem divide por 11 erra: a conta certa usa os 36 pares.'),
        check(choice({
          prompt: [p('Dois dados comuns e honestos são lançados.')],
          ask: 'Qual é a probabilidade de a soma ser 4?',
          options: [
            ok('1/12'),
            no('1/11', 'Isso trata as 11 somas como igualmente prováveis. Conte os pares: (1, 3), (2, 2) e (3, 1), 3 de 36.'),
            no('1/9', 'Isso conta 4 pares. Os que somam 4 são só três: (1, 3), (2, 2) e (3, 1).'),
            no('1/18', 'Isso conta (1, 3) e (3, 1) como um só. Com dois dados, são resultados diferentes.'),
          ],
          solution: ['$pares: (1, 3), (2, 2), (3, 1) → 3 de 36', '$P = 3/36 = 1/12'],
        })),
      ],
      practice: [gen(twoDiceGen), gen(coinsGen), gen(dieCoinGen)],
      challenge: [gen(coinsGen), gen(twoDiceGen), gen(dieCoinGen)],
      recap: [
        'Dois dados: 36 pares ordenados; (1, 2) ≠ (2, 1).',
        'n moedas: 2ⁿ sequências igualmente prováveis.',
        'Conte pares ou sequências, nunca somas ou placares.',
      ],
    })),

    stage('ou-nao', 'interpretacao', '"Ou" e "não"', 'Calcular a probabilidade de "A ou B" sem contar duas vezes os casos comuns e usar o complemento para "não A".', () => ({
      learn: [
        text('Para "**A ou B**", conte os casos que estão em pelo menos um dos dois eventos — sem contar duas vezes os que estão nos dois: P(A ou B) = P(A) + P(B) − P(A e B). Para "**não A**", use o **complemento**: P(não A) = 1 − P(A), ou 100% menos a chance de A.'),
        math('P(A ou B) = P(A) + P(B) − P(A e B)', 'P(não A) = 1 − P(A)'),
        sim({
          title: 'A roleta de 10 setores',
          intro: 'Uma roleta tem 10 setores iguais, de 1 a 10. Gire muitas vezes e acompanhe o evento "múltiplo de 2 ou de 5".',
          outcomes: range(1, 10).map((f) => ({ label: String(f), p: 0.1 })),
          event: { label: 'múltiplo de 2 ou de 5', outcomes: [1, 3, 4, 5, 7, 9] },
          insight: 'Múltiplos de 2: 5 setores; de 5: 2 setores; mas o 10 está nas duas listas. São 5 + 2 − 1 = 6 setores: probabilidade 6/10 = 60%.',
        }),
        example('Múltiplos de 3 ou de 5', 'Cartões de 1 a 30 estão numa caixa. Qual é a probabilidade de sortear um múltiplo de 3 ou de 5?', [
          step('Cada lista:', 'múltiplos de 3: 10; múltiplos de 5: 6'),
          askStep('Alguns números estão nas duas listas.', 'Quantos são múltiplos de 3 e de 5 ao mesmo tempo?', [
            ok('2: 15 e 30'),
            no('Nenhum', '15 e 30 são múltiplos dos dois: foram contados duas vezes.'),
          ]),
          step('Sem contar duas vezes:', '10 + 6 − 2 = 14', 'P = 14/30 = 7/15'),
        ], 'A probabilidade é 7/15.'),
        key('Quando o complemento ajuda', '"Não ganhar", "nenhum defeito", "não sair 6": calcule a chance do contrário, que costuma ser simples, e tire de 1 (ou de 100%).'),
        check(numeric({
          prompt: [p('Numa rifa com 40 números, uma pessoa comprou 3. Um número será sorteado.')],
          ask: 'Qual é a probabilidade, em porcentagem, de essa pessoa não ganhar?',
          unit: '%',
          answer: 92.5,
          wrong: [
            { value: 7.5, feedback: 'Essa é a chance de ganhar (3 ÷ 40). A pergunta é a do contrário: 100% − 7,5%.' },
            { value: 37, feedback: '37 é o número de casos em que ela não ganha. Divida pelos 40 possíveis.' },
            { value: 97, feedback: 'Isso subtrai 3 de 100. As chances são em relação a 40 números: 37 ÷ 40.' },
          ],
          solution: ['$P(ganhar) = 3 ÷ 40 = 7,5%', '$P(não ganhar) = 100% − 7,5% = 92,5%'],
        })),
      ],
      practice: [gen(orGen), gen(wheelOrGen), gen(notGen)],
      challenge: [gen(wheelOrGen), gen(notGen), gen(orGen)],
      recap: [
        '"Ou": some e tire o que foi contado duas vezes.',
        '"Não": 1 − P (ou 100% − P).',
        'Liste os casos comuns antes de somar.',
      ],
    })),

    stage('maestria', 'maestria', 'Maestria: chances no ENEM', 'Resolver problemas inéditos de probabilidade simples que exigem montar o espaço amostral, usar "ou", o complemento e porcentagens.', () => ({
      learn: [
        strategy('Probabilidade em 4 passos', '1) Os resultados são igualmente prováveis? Se não, monte pares ou sequências que sejam. 2) Conte os possíveis. 3) Conte os favoráveis — no "ou", sem repetir; no "não", pelo complemento. 4) Divida e, se pedido, converta para porcentagem.'),
        example('Dois dados, soma maior que 9', 'Dois dados honestos são lançados. Qual é a probabilidade de a soma ser maior que 9?', [
          step('Somas 10, 11 e 12:', '(4, 6), (5, 5), (6, 4) → 3', '(5, 6), (6, 5) → 2', '(6, 6) → 1'),
          askStep('Total de favoráveis: 6.', 'Qual é a probabilidade?', [
            ok('6/36 = 1/6'),
            no('3/11', 'Isso usa as somas (10, 11 e 12) em vez dos pares. As 11 somas não são igualmente prováveis.'),
          ]),
        ], 'A probabilidade é 1/6.'),
        reveal('Probabilidade é previsão?', 'Não exatamente. Dizer que a chance de cara é 1/2 não garante 5 caras em 10 lançamentos; garante que, com muitos lançamentos, a frequência de caras fica perto de 50%.'),
        check(choice({
          prompt: [p('Uma roleta tem 12 setores iguais, numerados de 1 a 12. Ganha quem tirar um múltiplo de 4 ou um número menor que 3.')],
          ask: 'Qual é a probabilidade de ganhar?',
          options: [
            ok('5/12'),
            no('1/4', 'Isso conta só os múltiplos de 4 (4, 8 e 12). Os números 1 e 2 também ganham.'),
            no('1/6', 'Isso conta só os menores que 3. Os múltiplos de 4 também ganham.'),
            no('1/2', 'Com 1/2, seriam 6 setores vencedores. Os grupos (4, 8, 12 e 1, 2) não têm números em comum: são 3 + 2 = 5 setores.'),
          ],
          solution: ['$múltiplos de 4: 4, 8, 12; menores que 3: 1, 2', '$5 setores, sem repetição → P = 5/12'],
        })),
      ],
      practice: [gen(twoDiceGen), gen(wheelOrGen), gen(notGen)],
      challenge: [gen(orGen), gen(twoDiceGen), gen(rangeGen), gen(coinsGen)],
      recap: [
        'Espaço amostral com resultados igualmente prováveis primeiro.',
        '"Ou" sem repetir; "não" pelo complemento.',
        'Fração, decimal e porcentagem: escolha a forma pedida.',
      ],
    })),
  ],
});
