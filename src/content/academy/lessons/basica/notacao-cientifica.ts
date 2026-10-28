/**
 * Aula: Notação científica — escrever e normalizar a × 10ⁿ, prefixos do SI, as quatro
 * operações (com normalização), comparações "quantas vezes", ordem de grandeza e os
 * problemas com unidades misturadas.
 */
import {
  askStep,
  check,
  choice,
  data,
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
  spot,
  stage,
  step,
  strategy,
  table,
  text,
  tip,
  warn,
} from '../../kit/build';
import { num, round, sci, sup } from '../../kit/format';
import type { Option, Rand } from '../../types';

/** "4,5 × 10⁻³" com a mantissa já informada (sem normalizar). */
const sn = (m: number, e: number) => `${num(m, 3)} × 10${sup(e)}`;
/** Número escrito por extenso (sem notação científica). */
const plain = (x: number) => num(x, 12);
const exponentOf = (x: number) => Math.floor(Math.log10(Math.abs(x)) + 1e-9);
/** Inteiro com o sinal de menos tipográfico; `par` ainda põe negativos entre parênteses. */
const sg = (n: number) => (n < 0 ? `−${-n}` : `${n}`);
const par = (n: number) => (n < 0 ? `(−${-n})` : `${n}`);

// ———————————————————————————————————————————————— geradores

function toSciGen(r: Rand) {
  for (;;) {
    const m = r.int(11, 99) / 10;
    const big = r.next() < 0.5;
    const e = big ? r.int(3, 9) : -r.int(2, 9);
    if ((m === 4.8 && e === 6) || (m === 1.2 && e === -7) || m === Math.round(m)) continue;
    const x = m * 10 ** e;
    const options: Option[] = [
      ok(sn(m, e)),
      no(sn(m, e + (big ? 1 : -1)), `Conte as casas de novo: a vírgula anda ${Math.abs(e)} casas, não ${Math.abs(e) + 1}.`),
      no(sn(m, e - (big ? 1 : -1)), `Conte as casas de novo: a vírgula anda ${Math.abs(e)} casas, não ${Math.abs(e) - 1}.`),
      no(sn(m, -e), big ? 'Número grande tem expoente positivo; o negativo é para números menores que 1.' : 'Número menor que 1 tem expoente negativo.'),
      no(sn(m * 10, e - 1), `O valor está certo, mas ${num(m * 10, 2)} não está entre 1 e 10: não é a forma padrão.`),
    ];
    return draftChoice({
      prompt: [p(big ? `Uma reportagem informou que ${plain(x)} pessoas assistiram a um evento.` : `Uma partícula mede ${plain(x)} metro.`)],
      ask: 'Como esse número se escreve em notação científica?',
      options: options.filter((o, i) => i < 4 || r.next() < 0.5),
      hints: ['Coloque a vírgula logo depois do primeiro algarismo diferente de zero.', 'Conte quantas casas a vírgula andou: para a esquerda, expoente positivo; para a direita, negativo.'],
      solution: [`Mantissa: ${num(m, 1)} (entre 1 e 10).`, `A vírgula anda ${Math.abs(e)} casas para a ${big ? 'esquerda' : 'direita'}: ${sn(m, e)}.`],
    });
  }
}

function fromSciGen(r: Rand) {
  for (;;) {
    const m = r.int(11, 99) / 10;
    const e = r.next() < 0.5 ? r.int(2, 7) : -r.int(2, 6);
    if ((m === 6.2 && e === 5) || m === Math.round(m)) continue;
    const x = round(m * 10 ** e, 10);
    return draftNumeric({
      prompt: [p(`Um instrumento registrou a medida ${sn(m, e)}.`)],
      ask: 'Escreva essa medida na forma decimal (sem potência de 10).',
      answer: x,
      tolerance: Math.abs(x) * 1e-6,
      wrong: [
        { value: round(m * 10 ** (e + 1), 10), feedback: `A vírgula andou uma casa a mais: ${sn(m, e + 1)} = ${plain(m * 10 ** (e + 1))}.` },
        { value: round(m * 10 ** (e - 1), 10), feedback: `A vírgula andou uma casa a menos: ${sn(m, e - 1)} = ${plain(m * 10 ** (e - 1))}.` },
        { value: round(m * 10 ** -e, 10), feedback: e > 0 ? 'Expoente positivo: a vírgula anda para a DIREITA (o número cresce).' : 'Expoente negativo: a vírgula anda para a ESQUERDA (o número fica menor que 1).' },
      ],
      hints: [e > 0 ? `Expoente +${e}: ande ${e} casas com a vírgula para a direita.` : `Expoente ${e}: ande ${-e} casas com a vírgula para a esquerda.`, 'Complete com zeros as casas que faltarem.'],
      solution: [`$${sn(m, e)} = ${plain(x)}`],
    });
  }
}

function normalizeGen(r: Rand) {
  for (;;) {
    const kind = r.int(0, 2);
    const e = r.int(-9, 9);
    const k = kind === 0 ? r.int(11, 99) : kind === 1 ? r.int(101, 999) : r.int(11, 99) / 100;
    if (k % 10 === 0 || (k === 48 && e === -6)) continue;
    const shift = exponentOf(k);
    const answer = e + shift;
    const mant = k / 10 ** shift;
    return draftNumeric({
      prompt: [p(`Uma medida foi anotada como ${sn(k, e)}. Ela será reescrita na forma a × 10ⁿ, com 1 ≤ a < 10.`)],
      ask: 'Qual será o expoente n?',
      answer,
      placeholder: 'use − para negativo',
      wrong: [
        { value: e, feedback: `${sg(e)} é o expoente antes de normalizar. Mudar a mantissa de ${num(k, 2)} para ${num(mant, 3)} muda o expoente.` },
        { value: e - shift, feedback: shift > 0 ? 'Ao DIVIDIR a mantissa por 10, o expoente AUMENTA para compensar (e não diminui).' : 'Ao MULTIPLICAR a mantissa por 10, o expoente DIMINUI para compensar (e não aumenta).' },
        { value: -answer, feedback: 'Confira o sinal: normalizar não muda o tamanho do número, só a forma de escrever.' },
      ],
      hints: [`Escreva ${num(k, 2)} como ${num(mant, 3)} × 10${sup(shift)}.`, 'Some os expoentes das duas potências de 10.'],
      solution: [`$${num(k, 2)} = ${sn(mant, shift)}`, `$${sn(k, e)} = ${num(mant, 3)} × 10${sup(shift)} × 10${sup(e)} = ${sn(mant, answer)}`],
    });
  }
}

const PREFIXES = [
  { name: 'nano', sym: 'n', e: -9 },
  { name: 'micro', sym: 'μ', e: -6 },
  { name: 'mili', sym: 'm', e: -3 },
  { name: 'quilo', sym: 'k', e: 3 },
  { name: 'mega', sym: 'M', e: 6 },
  { name: 'giga', sym: 'G', e: 9 },
];

function prefixGen(r: Rand) {
  for (;;) {
    const v = r.pick([12, 25, 35, 45, 60, 75, 80, 120, 250, 350, 600, 800]);
    const pf = r.pick(PREFIXES);
    if (pf.e === -9 && [550, 90, 70].includes(v)) continue;
    const unit = r.pick(pf.e < 0 ? [{ u: 'm', what: 'Uma estrutura mede' }, { u: 'g', what: 'Uma amostra tem massa de' }] : [{ u: 'W', what: 'Uma usina tem potência de' }, { u: 'B', what: 'Um arquivo ocupa' }]);
    const d = exponentOf(v);
    const mant = v / 10 ** d;
    const e = pf.e + d;
    const options: Option[] = [
      ok(`${sn(mant, e)} ${unit.u}`),
      no(`${sn(mant, pf.e)} ${unit.u}`, `${sn(mant, pf.e)} esqueceu de compensar a mantissa: ${v} = ${sn(mant, d)}, então o expoente fica ${sg(pf.e)} + ${d} = ${sg(e)}.`),
      no(`${sn(mant, pf.e - d)} ${unit.u}`, `Ao escrever ${v} como ${sn(mant, d)}, o expoente SOBE ${d}: ${sg(pf.e)} + ${d} = ${sg(e)}.`),
      no(`${sn(mant, -e)} ${unit.u}`, pf.e < 0 ? `O prefixo ${pf.name} indica uma fração da unidade: o expoente é negativo.` : `O prefixo ${pf.name} indica um múltiplo da unidade: o expoente é positivo.`),
    ];
    return draftChoice({
      prompt: [p(`${unit.what} ${v} ${pf.sym}${unit.u} (1 ${pf.sym}${unit.u} = 10${sup(pf.e)} ${unit.u}).`)],
      ask: `Quanto é isso em ${unit.u === 'B' ? 'bytes' : unit.u}, em notação científica?`,
      options,
      hints: [`${v} ${pf.sym}${unit.u} = ${v} × 10${sup(pf.e)} ${unit.u}.`, `Escreva ${v} como ${sn(mant, d)} e some os expoentes.`],
      solution: [`$${v} × 10${sup(pf.e)} = ${sn(mant, d)} × 10${sup(pf.e)} = ${sn(mant, e)} ${unit.u}`],
    });
  }
}

const COEFS = [1.5, 2, 2.5, 3, 4, 5, 6, 8];
const BANK_PRODUCTS = new Set(['2e4*3e3', '6e3*2.5e2', '9e4*8e3', '2e-3*7e4']);

function mulGen(r: Rand) {
  for (;;) {
    const a = r.pick(COEFS);
    const b = r.pick(COEFS);
    const m = r.int(-6, 8);
    const n = r.int(-6, 8);
    if (BANK_PRODUCTS.has(`${a}e${m}*${b}e${n}`) || BANK_PRODUCTS.has(`${b}e${n}*${a}e${m}`) || m * n === m + n) continue;
    const raw = a * b;
    const big = raw >= 10;
    const mant = big ? raw / 10 : raw;
    const exp = m + n + (big ? 1 : 0);
    const value = raw * 10 ** (m + n);
    const plus = a + b;
    const wrongs = [
      { coef: plus >= 10 ? plus / 10 : plus, e: m + n + (plus >= 10 ? 1 : 0), feedback: `Os coeficientes se MULTIPLICAM (${num(a, 1)} × ${num(b, 1)} = ${num(raw, 2)}), não se somam.` },
      { coef: mant, e: m * n + (big ? 1 : 0), feedback: `Os expoentes se SOMAM na multiplicação: ${sg(m)} + ${par(n)} = ${sg(m + n)}, não ${sg(m)} × ${par(n)}.` },
      ...(big ? [{ coef: mant, e: m + n, feedback: `${num(raw, 2)} × 10${sup(m + n)} normalizado é ${sn(mant, exp)}: ao dividir a mantissa por 10, o expoente SOBE 1.` }] : []),
      { coef: mant, e: exp - 1 - (big ? 1 : 0), feedback: 'Confira a soma dos expoentes e a normalização.' },
    ];
    return draftChoice({
      prompt: [{ kind: 'math', lines: [`(${sn(a, m)}) × (${sn(b, n)})`] }],
      ask: 'Qual é o resultado, em notação científica?',
      options: numericOptions(
        { value, text: sn(mant, exp) },
        wrongs.map((w) => ({ value: w.coef * 10 ** w.e, text: sn(w.coef, w.e), feedback: w.feedback })),
      ),
      hints: ['Multiplique os coeficientes e some os expoentes.', 'Se o coeficiente passar de 10, divida-o por 10 e some 1 ao expoente.'],
      solution: [`$${num(a, 1)} × ${num(b, 1)} = ${num(raw, 2)}; 10${sup(m)} × 10${sup(n)} = 10${sup(m + n)}`, big ? `$${num(raw, 2)} × 10${sup(m + n)} = ${sn(mant, exp)}` : `Resultado: ${sn(mant, exp)}.`],
      verify: () => value,
      tolerance: Math.abs(value) * 1e-9,
    });
  }
}

const DIV_PAIRS: [number, number][] = [
  [6, 2], [8, 2], [9, 3], [4.5, 1.5], [7.5, 2.5], [6, 1.5], [9, 4.5], [1.2, 4], [1.5, 3], [2, 8], [3, 6], [2.4, 8], [1.8, 6], [3.6, 9], [4.8, 6],
];

function divGen(r: Rand) {
  for (;;) {
    const [a, b] = r.pick(DIV_PAIRS);
    const m = r.int(-5, 9);
    const n = r.int(-5, 8);
    if ((a === 9 && b === 3 && m === 7 && n === 5) || (a === 6 && b === 2 && m === -4 && n === -2)) continue;
    const raw = a / b;
    const small = raw < 1;
    const mant = small ? raw * 10 : raw;
    const exp = m - n - (small ? 1 : 0);
    const value = raw * 10 ** (m - n);
    const inv = b / a;
    const wrongs = [
      { coef: inv >= 10 ? inv / 10 : inv < 1 ? inv * 10 : inv, e: m - n + (inv >= 10 ? 1 : inv < 1 ? -1 : 0), feedback: `A divisão dos coeficientes ficou invertida: é ${num(a, 1)} ÷ ${num(b, 1)}, não ${num(b, 1)} ÷ ${num(a, 1)}.` },
      { coef: mant, e: m + n - (small ? 1 : 0), feedback: `Na divisão, os expoentes se SUBTRAEM: ${sg(m)} − ${par(n)} = ${sg(m - n)}.` },
      ...(small ? [{ coef: mant, e: m - n, feedback: `${num(raw, 2)} × 10${sup(m - n)} normalizado é ${sn(mant, exp)}: ao multiplicar a mantissa por 10, o expoente DESCE 1.` }] : []),
    ];
    return draftChoice({
      prompt: [{ kind: 'math', lines: [`(${sn(a, m)}) ÷ (${sn(b, n)})`] }],
      ask: 'Qual é o resultado, em notação científica?',
      options: numericOptions(
        { value, text: sn(mant, exp) },
        wrongs.map((w) => ({ value: w.coef * 10 ** w.e, text: sn(w.coef, w.e), feedback: w.feedback })),
      ),
      hints: ['Divida os coeficientes e subtraia os expoentes (o do divisor).', 'Se o coeficiente ficar menor que 1, multiplique-o por 10 e tire 1 do expoente.'],
      solution: [`$${num(a, 1)} ÷ ${num(b, 1)} = ${num(raw, 3)}; 10${sup(m)} ÷ 10${sup(n)} = 10${sup(m - n)}`, small ? `$${num(raw, 3)} × 10${sup(m - n)} = ${sn(mant, exp)}` : `Resultado: ${sn(mant, exp)}.`],
      verify: () => value,
      tolerance: Math.abs(value) * 1e-9,
    });
  }
}

function addGen(r: Rand) {
  for (;;) {
    const a = r.int(11, 89) / 10;
    const b = r.int(11, 89) / 10;
    const m = r.int(3, 9);
    if ((a === 3.2 && b === 7.5 && m === 6) || a === Math.round(a)) continue;
    const sum = a + b / 10;
    const big = sum >= 10;
    const mant = big ? sum / 10 : sum;
    const exp = m + (big ? 1 : 0);
    const value = a * 10 ** m + b * 10 ** (m - 1);
    const naive = a + b;
    const wrongs = [
      { coef: naive >= 10 ? naive / 10 : naive, e: m + (naive >= 10 ? 1 : 0), feedback: `Somou ${num(a, 1)} + ${num(b, 1)} com expoentes diferentes. Iguale antes: ${sn(b, m - 1)} = ${sn(b / 10, m)}.` },
      { coef: naive >= 10 ? naive / 10 : naive, e: 2 * m - 1 + (naive >= 10 ? 1 : 0), feedback: 'Na soma, os expoentes não se somam: iguale as potências e some só os coeficientes.' },
      { coef: round(a + b / 100, 4), e: m, feedback: `${sn(b, m - 1)} = ${sn(b / 10, m)}: a vírgula do ${num(b, 1)} anda UMA casa.` },
    ];
    return draftChoice({
      prompt: [p('Dois arquivos serão reunidos, sem registros repetidos.'), { kind: 'math', lines: [`${sn(a, m)} + ${sn(b, m - 1)}`] }],
      ask: 'Quantos registros terá o arquivo reunido?',
      options: numericOptions(
        { value, text: sn(round(mant, 4), exp) },
        wrongs.map((w) => ({ value: w.coef * 10 ** w.e, text: sn(round(w.coef, 4), w.e), feedback: w.feedback })),
      ),
      hints: ['Para somar, as potências de 10 precisam ser iguais.', `Escreva ${sn(b, m - 1)} como ${sn(b / 10, m)}.`],
      solution: [`$${sn(b, m - 1)} = ${sn(b / 10, m)}`, `$(${num(a, 1)} + ${num(b / 10, 2)}) × 10${sup(m)} = ${sn(round(sum, 4), m)}${big ? ` = ${sn(round(mant, 4), exp)}` : ''}`],
      verify: () => value,
      tolerance: Math.abs(value) * 1e-9,
    });
  }
}

/** Contextos com expoentes realistas: um caminhão tem ~10⁴ kg; uma moeda, ~10⁻³ kg; e assim por diante. */
const RATIOS = [
  { what: 'massa', a: 'a massa de um caminhão', b: 'a de uma moeda', ua: 'kg', ub: 'kg', ms: [4], ns: [-3, -2] },
  { what: 'distância', a: 'a distância de uma viagem', b: 'o comprimento de uma formiga', ua: 'm', ub: 'm', ms: [5, 6], ns: [-3] },
  { what: 'população', a: 'a população de um país', b: 'a de um bairro', ua: 'habitantes', ub: 'habitantes', ms: [7, 8], ns: [3, 4] },
];

function ratioGen(r: Rand) {
  for (;;) {
    const [a, b] = r.pick(DIV_PAIRS.filter(([x, y]) => x / y >= 1));
    const ctx = r.pick(RATIOS);
    const m = r.pick(ctx.ms);
    const n = r.pick(ctx.ns);
    const raw = a / b;
    const value = raw * 10 ** (m - n);
    return draftChoice({
      prompt: [p(`Compare ${ctx.a} (${sn(a, m)} ${ctx.ua}) com ${ctx.b} (${sn(b, n)} ${ctx.ub}).`)],
      ask: `A primeira ${ctx.what} é quantas vezes a segunda?`,
      options: numericOptions({ value, text: sci(value) }, [
        { value: raw * 10 ** (m + n), text: sci(raw * 10 ** (m + n)), feedback: `"Quantas vezes" é divisão: os expoentes se subtraem, ${sg(m)} − ${par(n)} = ${sg(m - n)}.` },
        { value: (b / a) * 10 ** (n - m), text: sci((b / a) * 10 ** (n - m)), feedback: 'A divisão ficou invertida: divida a maior pela menor.' },
        { value: raw * 10 ** (m - n - 1), text: sci(raw * 10 ** (m - n - 1)), feedback: `Confira a subtração dos expoentes: ${sg(m)} − ${par(n)} = ${sg(m - n)}.` },
      ]),
      hints: ['"Quantas vezes A é B" = A ÷ B.', 'Divida os coeficientes e subtraia os expoentes.'],
      solution: [`$coeficientes: ${num(a)} ÷ ${num(b)} = ${num(raw, 3)};  expoentes: ${sg(m)} − ${par(n)} = ${sg(m - n)}`, `$(${sn(a, m)}) ÷ (${sn(b, n)}) = ${sci(value)}`],
      verify: () => value,
      tolerance: Math.abs(value) * 1e-9,
    });
  }
}

// ———————————————————————————————————————————————— aula

export const NOTACAO_CIENTIFICA = lesson({
  id: 'notacao-cientifica',
  topic: 'basica',
  subtopics: ['notacao-cientifica'],
  title: 'Notação científica',
  summary:
    'Do tamanho de um vírus à distância até o Sol: escrever, converter e operar com números muito grandes e muito pequenos sem perder a vírgula — e estimar a ordem de grandeza.',
  requires: ['potencias'],
  stages: [
    stage('escrever', 'descoberta', 'Escrever e normalizar', 'Escrever números grandes e pequenos na forma a × 10ⁿ (com 1 ≤ a < 10), voltar para a forma decimal e normalizar mantissas fora do padrão.', () => ({
      learn: [
        text('Números muito grandes ou muito pequenos ficam mais legíveis na forma **a × 10ⁿ**, com a mantissa **a** entre 1 e 10. Em 3.700.000 = 3,7 × 10⁶, a vírgula andou 6 casas para a esquerda; em 0,00036 = 3,6 × 10⁻⁴, andou 4 casas para a direita.'),
        lab({
          title: 'Mover a vírgula',
          intro: 'Escolha a mantissa e o expoente e veja o número escrito por extenso.',
          params: [
            { key: 'a', label: 'Mantissa', min: 1, max: 9.9, step: 0.1, value: 3, format: (v) => num(v, 1) },
            { key: 'e', label: 'Expoente', min: -8, max: 8, step: 1, value: 2, format: (v) => `${v}` },
          ],
          readouts: ({ a, e }) => [
            { label: 'Notação científica', value: sn(a, e), big: true, tone: 'brass' },
            { label: 'Por extenso', value: plain(round(a * 10 ** e, 10)) },
            { label: 'A vírgula', value: e === 0 ? 'fica onde está' : `anda ${Math.abs(e)} casa${Math.abs(e) > 1 ? 's' : ''} para a ${e > 0 ? 'direita' : 'esquerda'}` },
          ],
          goal: {
            task: 'Escreva 0,00072 em notação científica.',
            done: ({ a, e }) => Math.abs(a - 7.2) < 1e-9 && e === -4,
            success: 'Isso: 0,00072 = 7,2 × 10⁻⁴. A vírgula anda 4 casas para a direita até ficar depois do 7.',
          },
          insight: 'Cada unidade no expoente é uma casa da vírgula — e multiplica ou divide o número por 10.',
        }),
        key('O sinal do expoente', 'Expoente positivo: número maior que 10 (a vírgula andou para a esquerda ao escrever). Expoente negativo: número menor que 1 (andou para a direita). 10⁰ = 1.'),
        example('O tamanho da bactéria', 'Uma bactéria mede 0,0000045 m. Como escrever em notação científica?', [
          step('A mantissa precisa ficar entre 1 e 10: 4,5.'),
          askStep('Agora conte as casas que a vírgula anda até ficar depois do 4.', 'Qual é o expoente?', [
            ok('−6'),
            no('−7', 'Conte de novo: 0,000004|5 — a vírgula pula 6 algarismos (5 zeros e o 4).'),
            no('+6', 'Números menores que 1 têm expoente negativo.'),
          ], '0,0000045 = 4,5 × 10⁻⁶'),
        ], 'A bactéria mede 4,5 × 10⁻⁶ m.'),
        warn('Valor certo, forma errada', '12 × 10⁻⁸ e 0,12 × 10⁻⁶ valem o mesmo que 1,2 × 10⁻⁷, mas não estão na forma padrão. Para normalizar: se a mantissa fica 10 vezes MAIOR, o expoente DIMINUI 1; se fica 10 vezes menor, o expoente aumenta 1.'),
        check(choice({
          ask: 'Qual é a forma padrão de 36 × 10⁻⁴?',
          options: [
            ok('3,6 × 10⁻³'),
            no('3,6 × 10⁻⁵', 'Ao dividir a mantissa por 10 (36 → 3,6), o expoente AUMENTA 1: −4 + 1 = −3.'),
            no('0,36 × 10⁻²', 'Tem o valor certo, mas 0,36 é menor que 1: não está na forma padrão.'),
            no('3,6 × 10⁻⁴', 'Mudou a mantissa sem compensar no expoente: o valor ficou 10 vezes menor.'),
          ],
          solution: ['$36 = 3,6 × 10¹', '$36 × 10⁻⁴ = 3,6 × 10¹ × 10⁻⁴ = 3,6 × 10⁻³'],
        })),
        check(numeric({
          ask: 'Escreva 7,05 × 10⁴ na forma decimal.',
          answer: 70500,
          wrong: [
            { value: 7050, feedback: '7.050 = 7,05 × 10³: a vírgula precisa andar 4 casas para a direita.' },
            { value: 705000, feedback: '705.000 = 7,05 × 10⁵: uma casa a mais.' },
          ],
          solution: ['$7,05 × 10⁴ = 70.500'],
        })),
      ],
      practice: [gen(toSciGen), gen(fromSciGen), gen(normalizeGen)],
      challenge: [
        gen(normalizeGen),
        choice({
          prompt: [p('Três estagiários anotaram diâmetros de grãos de pólen em formatos diferentes: 0,5 × 10⁻³ m, 4,2 × 10⁻⁴ m e 61 × 10⁻⁵ m.')],
          ask: 'Qual é o maior diâmetro?',
          options: [
            ok('61 × 10⁻⁵ m'),
            no('0,5 × 10⁻³ m', 'Normalize: 0,5 × 10⁻³ = 5 × 10⁻⁴, menor que 61 × 10⁻⁵ = 6,1 × 10⁻⁴.'),
            no('4,2 × 10⁻⁴ m', 'Normalizados, os três ficam com 10⁻⁴: 5; 4,2 e 6,1. O 4,2 é o menor.'),
          ],
          hints: ['Escreva os três com a mesma potência de 10.', '0,5 × 10⁻³ = 5 × 10⁻⁴ e 61 × 10⁻⁵ = 6,1 × 10⁻⁴.'],
          solution: ['Em 10⁻⁴: 5 × 10⁻⁴, 4,2 × 10⁻⁴ e 6,1 × 10⁻⁴.', 'O maior é 6,1 × 10⁻⁴ = 61 × 10⁻⁵ m.'],
        }),
        gen(toSciGen),
      ],
      recap: [
        'Notação científica: a × 10ⁿ, com 1 ≤ a < 10.',
        'Expoente = casas que a vírgula anda: positivo para números grandes, negativo para menores que 1.',
        'Normalizar: mantissa × 10 → expoente − 1; mantissa ÷ 10 → expoente + 1.',
      ],
    })),

    stage('prefixos', 'fundamentos', 'Prefixos e unidades', 'Converter medidas com prefixos do SI (nano, micro, mili, quilo, mega, giga) usando potências de 10.', () => ({
      learn: [
        text('Os prefixos das unidades são potências de 10 disfarçadas: 5 km = 5 × 10³ m; 3 mg = 3 × 10⁻³ g; 20 GB = 2 × 10¹⁰ bytes (no sistema decimal).'),
        data(table(['Prefixo', 'Símbolo', 'Vale'], [
          ['giga', 'G', '10⁹'],
          ['mega', 'M', '10⁶'],
          ['quilo', 'k', '10³'],
          ['centi', 'c', '10⁻²'],
          ['mili', 'm', '10⁻³'],
          ['micro', 'μ', '10⁻⁶'],
          ['nano', 'n', '10⁻⁹'],
        ], 'Prefixos mais usados no ENEM')),
        example('O fio de cabelo', 'Um fio de cabelo tem cerca de 70 μm de espessura (1 μm = 10⁻⁶ m). Quanto é isso em metros, em notação científica?', [
          step('Troque o prefixo pela potência:', '70 μm = 70 × 10⁻⁶ m'),
          askStep('70 não está entre 1 e 10.', 'Como normalizar?', [
            ok('7 × 10¹ × 10⁻⁶ = 7 × 10⁻⁵'),
            no('7 × 10⁻⁷', 'Ao escrever 70 como 7 × 10¹, o expoente SOBE 1: −6 + 1 = −5.'),
            no('0,7 × 10⁻⁴', 'Tem o valor certo, mas 0,7 não está entre 1 e 10.'),
          ], '7 × 10⁻⁵ m'),
        ], 'O fio tem 7 × 10⁻⁵ m.'),
        warn('Unidade maior, número menor', 'Converter para uma unidade MAIOR (mm → m) deixa o número MENOR: 0,8 mm = 8 × 10⁻⁴ m. Para uma unidade menor (m → mm), o número cresce.'),
        reveal('Quantos nanômetros cabem em 1 milímetro?', '1 mm = 10⁻³ m e 1 nm = 10⁻⁹ m: 10⁻³ ÷ 10⁻⁹ = 10⁶. Um milímetro tem um milhão de nanômetros.'),
        check(choice({
          ask: 'Um pen drive tem 32 GB (1 GB = 10⁹ bytes). Quantos bytes, em notação científica?',
          options: [
            ok('3,2 × 10¹⁰ bytes'),
            no('3,2 × 10⁹ bytes', '32 = 3,2 × 10¹: o expoente sobe 1, 9 + 1 = 10.'),
            no('3,2 × 10⁸ bytes', 'Ao escrever 32 como 3,2 × 10¹, o expoente SOBE: 10⁹ × 10¹ = 10¹⁰.'),
            no('32 × 10¹⁰ bytes', 'Além de 32 não estar entre 1 e 10, o valor ficou 10 vezes maior.'),
          ],
          solution: ['$32 GB = 32 × 10⁹ = 3,2 × 10¹ × 10⁹ = 3,2 × 10¹⁰ bytes'],
        })),
      ],
      practice: [
        gen(prefixGen),
        choice({
          ask: 'Uma película tem 0,8 mm de espessura. Quanto é isso em metros (1 m = 1.000 mm)?',
          options: [
            ok('8 × 10⁻⁴ m'),
            no('8 × 10⁻³ m', '8 × 10⁻³ m = 8 mm. Como 0,8 mm = 0,0008 m: 8 × 10⁻⁴.'),
            no('8 × 10² m', 'Passar para uma unidade maior diminui o número: o expoente é negativo.'),
            no('8 × 10⁻⁵ m', '8 × 10⁻⁵ m = 0,08 mm, dez vezes menos.'),
          ],
          hints: ['Divida por 1.000: 0,8 ÷ 1.000.', '0,0008 em notação científica.'],
          solution: ['$0,8 mm = 0,8 × 10⁻³ m = 8 × 10⁻¹ × 10⁻³ = 8 × 10⁻⁴ m'],
        }),
        choice({
          ask: 'Quantos micrômetros há em 1 metro?',
          options: [
            ok('10⁶'),
            no('10⁻⁶', '10⁻⁶ m é o tamanho de UM micrômetro. Em 1 m cabem 1 ÷ 10⁻⁶ = 10⁶ micrômetros.'),
            no('10³', '10³ milímetros cabem em 1 metro. Micrômetros são mil vezes menores que milímetros.'),
            no('10⁹', '10⁹ nanômetros cabem em 1 metro.'),
          ],
          hints: ['1 μm = 10⁻⁶ m.', 'Quantas vezes 10⁻⁶ cabe em 1? Divida.'],
          solution: ['$1 ÷ 10⁻⁶ = 10⁶ micrômetros'],
        }),
      ],
      challenge: [
        gen(prefixGen),
        choice({
          prompt: [p('Uma célula mede 8 μm e um vírus, 80 nm (1 μm = 10⁻⁶ m; 1 nm = 10⁻⁹ m).')],
          ask: 'Quantas vezes a célula é maior que o vírus?',
          options: [
            ok('100'),
            no('10', '8 × 10⁻⁶ ÷ (8 × 10⁻⁸) = 10², não 10¹: 80 nm = 8 × 10⁻⁸ m.'),
            no('1.000', '1.000 seria a razão entre 8 μm e 8 nm. O vírus tem 80 nm.'),
            no('0,01', 'A divisão ficou invertida: a célula é a maior.'),
          ],
          solution: ['$8 μm = 8 × 10⁻⁶ m; 80 nm = 8 × 10⁻⁸ m', '$(8 × 10⁻⁶) ÷ (8 × 10⁻⁸) = 10² = 100'],
          verify: () => 100,
        }),
        choice({
          ask: 'Sabendo que 1 L = 10⁶ mm³, quantos milímetros cúbicos há em 2,5 L?',
          options: [
            ok('2,5 × 10⁶ mm³'),
            no('2,5 × 10³ mm³', '10³ é a relação entre litros e cm³... e o enunciado diz 1 L = 10⁶ mm³.'),
            no('2,5 × 10⁻⁶ mm³', 'Passar para uma unidade menor (mm³) aumenta o número: expoente positivo.'),
            no('25 × 10⁶ mm³', '25 × 10⁶ = 2,5 × 10⁷: dez vezes mais.'),
          ],
          solution: ['$2,5 L × 10⁶ mm³/L = 2,5 × 10⁶ mm³'],
        }),
      ],
      recap: [
        'giga 10⁹, mega 10⁶, quilo 10³, centi 10⁻², mili 10⁻³, micro 10⁻⁶, nano 10⁻⁹.',
        'Troque o prefixo pela potência e normalize: 70 μm = 70 × 10⁻⁶ m = 7 × 10⁻⁵ m.',
        'Unidade maior → número menor (e vice-versa).',
      ],
    })),

    stage('operacoes', 'fundamentos', 'Operações em notação científica', 'Multiplicar, dividir, somar e subtrair números em notação científica, normalizando o resultado.', () => ({
      learn: [
        text('Para **multiplicar**, multiplique os coeficientes e some os expoentes. Para **dividir**, divida os coeficientes e subtraia os expoentes. No fim, normalize.'),
        math('(a × 10ᵐ) × (b × 10ⁿ) = (a × b) × 10ᵐ⁺ⁿ', '(a × 10ᵐ) ÷ (b × 10ⁿ) = (a ÷ b) × 10ᵐ⁻ⁿ'),
        lab({
          title: 'Multiplicar e normalizar',
          intro: 'Escolha dois números em notação científica e veja o produto — antes e depois de normalizar.',
          params: [
            { key: 'a', label: 'Coeficiente 1', min: 1, max: 9.5, step: 0.5, value: 2, format: (v) => num(v, 1) },
            { key: 'm', label: 'Expoente 1', min: -6, max: 6, step: 1, value: 3, format: (v) => `${v}` },
            { key: 'b', label: 'Coeficiente 2', min: 1, max: 9.5, step: 0.5, value: 3, format: (v) => num(v, 1) },
            { key: 'n', label: 'Expoente 2', min: -6, max: 6, step: 1, value: 2, format: (v) => `${v}` },
          ],
          readouts: ({ a, m, b, n }) => {
            const raw = a * b;
            const big = raw >= 10;
            return [
              { label: 'Conta', value: `(${sn(a, m)}) × (${sn(b, n)})` },
              { label: 'Coeficientes × e expoentes +', value: sn(raw, m + n) },
              { label: 'Normalizado', value: big ? sn(raw / 10, m + n + 1) : `${sn(raw, m + n)} (já está no padrão)`, big: true, tone: 'brass' },
            ];
          },
          goal: {
            task: 'Monte um produto igual a 1,2 × 10⁵ em que a multiplicação dos coeficientes passe de 10 (e seja preciso normalizar).',
            done: ({ a, m, b, n }) => Math.abs(a * b - 12) < 1e-9 && m + n === 4,
            success: 'Isso: coeficientes com produto 12 e expoentes somando 4 dão 12 × 10⁴ = 1,2 × 10⁵.',
          },
          insight: 'Quando o produto dos coeficientes passa de 10, a normalização acrescenta 1 ao expoente.',
        }),
        example('Uma multiplicação com ajuste', [{ kind: 'math', lines: ['(4 × 10⁵) × (3,5 × 10³)'] }], [
          step('Coeficientes e expoentes:', '4 × 3,5 = 14; 10⁵ × 10³ = 10⁸'),
          askStep('O resultado bruto é 14 × 10⁸.', 'Como fica normalizado?', [
            ok('1,4 × 10⁹'),
            no('1,4 × 10⁸', 'Ao dividir a mantissa por 10 (14 → 1,4), o expoente SOBE 1.'),
            no('14 × 10⁸', 'Tem o valor certo, mas 14 não está entre 1 e 10.'),
          ], '14 × 10⁸ = 1,4 × 10⁹'),
        ], 'O produto é 1,4 × 10⁹.'),
        example('Uma divisão com ajuste', [{ kind: 'math', lines: ['(1,2 × 10⁸) ÷ (4 × 10³)'] }], [
          step('Coeficientes e expoentes:', '1,2 ÷ 4 = 0,3; 10⁸ ÷ 10³ = 10⁵'),
          step('0,3 é menor que 1: multiplique por 10 e tire 1 do expoente.', '0,3 × 10⁵ = 3 × 10⁴'),
        ], 'O quociente é 3 × 10⁴.'),
        key('Somar e subtrair', 'Só depois de igualar as potências: 4,1 × 10⁷ + 6 × 10⁶ = 4,1 × 10⁷ + 0,6 × 10⁷ = 4,7 × 10⁷. Os expoentes NÃO se somam: 2 × 10³ + 3 × 10³ = 5 × 10³.'),
        check(spot({
          ask: 'Em qual linha está o primeiro erro?',
          lines: ['$(5 × 10⁻³) × (4 × 10⁶)', '$= 20 × 10³', '$= 2 × 10²', '$= 200'],
          wrong: 2,
          why: 'Ao dividir a mantissa por 10 (20 → 2), o expoente SOBE 1: 20 × 10³ = 2 × 10⁴ = 20.000.',
          solution: ['$(5 × 10⁻³) × (4 × 10⁶) = 20 × 10³ = 2 × 10⁴'],
        })),
      ],
      practice: [gen(mulGen), gen(divGen), gen(addGen)],
      challenge: [
        gen(mulGen),
        gen(divGen),
        numeric({
          prompt: [p('O produto (7 × 10⁻³) × (4 × 10⁻²) será escrito na forma a × 10ⁿ, com 1 ≤ a < 10.')],
          ask: 'Qual é o expoente n?',
          answer: -4,
          placeholder: 'use − para negativo',
          wrong: [
            { value: -5, feedback: '28 × 10⁻⁵ normalizado vira 2,8 × 10⁻⁴: ao dividir a mantissa por 10, o expoente SOBE 1.' },
            { value: 6, feedback: 'Os expoentes se somam: −3 + (−2) = −5 (e não −3 × −2). Depois, a normalização leva a −4.' },
            { value: -6, feedback: 'Ao normalizar 28 → 2,8, o expoente sobe 1: −5 + 1 = −4.' },
          ],
          solution: ['$7 × 4 = 28; 10⁻³ × 10⁻² = 10⁻⁵', '$28 × 10⁻⁵ = 2,8 × 10⁻⁴ → n = −4'],
        }),
        gen(addGen),
      ],
      recap: [
        'Multiplicar: coeficientes ×, expoentes +. Dividir: coeficientes ÷, expoentes −.',
        'Normalize no fim: mantissa ≥ 10 → expoente + 1; mantissa < 1 → expoente − 1.',
        'Somar ou subtrair: primeiro iguale as potências; os expoentes não se somam.',
      ],
    })),

    stage('grandezas', 'aplicacoes', 'Comparar grandezas e estimar', 'Resolver problemas com grandezas astronômicas e microscópicas: tempos, razões "quantas vezes", conversões de unidade e ordem de grandeza.', () => ({
      learn: [
        text('Notação científica brilha nos problemas de ciências: distâncias no espaço, tamanhos de células, populações, consumo de energia. O roteiro é sempre o mesmo: **mesma unidade**, conta com coeficientes e expoentes, e normalização.'),
        example('A luz da Lua', 'A Lua está a cerca de 3,84 × 10⁵ km da Terra, e a luz viaja a 3 × 10⁵ km/s. Quanto tempo a luz refletida pela Lua leva para chegar até nós?', [
          askStep('Tempo é distância dividida por velocidade.', 'Qual é a conta?', [
            ok('(3,84 × 10⁵) ÷ (3 × 10⁵)'),
            no('(3,84 × 10⁵) × (3 × 10⁵)', 'Multiplicar distância por velocidade não dá tempo. Tempo = distância ÷ velocidade.'),
            no('(3 × 10⁵) ÷ (3,84 × 10⁵)', 'Velocidade ÷ distância dá "1 por segundo", não segundos. Divida a distância pela velocidade.'),
          ], '3,84 ÷ 3 = 1,28; 10⁵ ÷ 10⁵ = 10⁰'),
          step('Como 10⁰ = 1, o resultado já está pronto:', '1,28 × 10⁰ s = 1,28 s'),
        ], 'A luz da Lua leva cerca de 1,28 s para chegar à Terra.'),
        example('Água da cidade', 'Uma cidade com 4 × 10⁵ habitantes consome, em média, 2 × 10² litros por pessoa por dia. Quanto consome por dia, em m³ (1 m³ = 10³ L)?', [
          step('Consumo total em litros:', '4 × 10⁵ × 2 × 10² = 8 × 10⁷ L'),
          askStep('Agora passe para m³.', 'Como fica?', [
            ok('8 × 10⁷ ÷ 10³ = 8 × 10⁴ m³'),
            no('8 × 10⁷ × 10³ = 8 × 10¹⁰ m³', 'O m³ é uma unidade MAIOR que o litro: o número fica menor. Divida por 10³.'),
          ], '8 × 10⁴ m³'),
        ], 'A cidade consome 8 × 10⁴ m³ por dia.'),
        key('Ordem de grandeza', 'É a potência de 10 mais próxima do número. Regra prática dos livros: em a × 10ⁿ, se a for menor que √10 ≈ 3,16, a ordem é 10ⁿ; se for maior, 10ⁿ⁺¹. Assim, 1,5 × 10⁸ tem ordem 10⁸ e 7,5 × 10⁸ tem ordem 10⁹. Se o enunciado der outra definição, siga a do enunciado.'),
        check(choice({
          prompt: [p('Um grão de areia tem massa de 2 × 10⁻⁵ kg, e uma pedra, de 5 × 10⁻¹ kg.')],
          ask: 'Quantas vezes a massa da pedra é a do grão?',
          options: [
            ok('2,5 × 10⁴'),
            no('2,5 × 10⁻⁶', 'Expoentes na divisão se subtraem: −1 − (−5) = +4 (e o coeficiente 5 ÷ 2 = 2,5).'),
            no('4 × 10⁻⁵', 'A divisão ficou invertida: a pedra é a maior. Pedra ÷ grão.'),
            no('2,5 × 10⁵', 'Confira: −1 − (−5) = 4, não 5.'),
          ],
          solution: ['$(5 × 10⁻¹) ÷ (2 × 10⁻⁵) = 2,5 × 10⁻¹⁺⁵ = 2,5 × 10⁴'],
          verify: () => 25000,
        })),
      ],
      practice: [
        gen(ratioGen),
        numeric({
          prompt: [p('Um computador executa 4 × 10⁹ operações por segundo. Uma tarefa exige 7,2 × 10¹⁶ operações. Lembre que 1 hora tem 3.600 s.')],
          ask: 'Quantas horas a tarefa leva?',
          unit: 'h',
          answer: 5000,
          wrong: [
            { value: 1.8e7, feedback: '1,8 × 10⁷ é o tempo em SEGUNDOS. Em horas, divida por 3.600.' },
            { value: 300000, feedback: '3 × 10⁵ é o tempo em MINUTOS (÷ 60). Para horas, divida por 3.600.' },
            { value: 500, feedback: '500 h: dez vezes menos. 1,8 × 10⁷ ÷ 3,6 × 10³ = 0,5 × 10⁴ = 5 × 10³.' },
          ],
          hints: ['Segundos: (7,2 × 10¹⁶) ÷ (4 × 10⁹).', 'Horas: divida os segundos por 3,6 × 10³.'],
          solution: ['$(7,2 × 10¹⁶) ÷ (4 × 10⁹) = 1,8 × 10⁷ s', '$(1,8 × 10⁷) ÷ (3,6 × 10³) = 0,5 × 10⁴ = 5 × 10³ h'],
        }),
        choice({
          prompt: [p('Uma rede social tem 1,8 × 10⁶ usuários numa cidade, e cada um publica em média 5 × 10² vezes por ano.')],
          ask: 'Qual é a ordem de grandeza do número de publicações por ano nessa cidade?',
          options: [
            ok('10⁹'),
            no('10⁸', '1,8 × 5 = 9: o total é 9 × 10⁸, bem mais perto de 10⁹ do que de 10⁸.'),
            no('10¹²', 'Os expoentes se somam (6 + 2 = 8), não se multiplicam.'),
            no('10⁶', '10⁶ é a ordem de grandeza dos usuários, não das publicações.'),
          ],
          hints: ['Calcule o total: (1,8 × 10⁶) × (5 × 10²).', 'Compare a mantissa com 3,16.'],
          solution: ['$(1,8 × 10⁶) × (5 × 10²) = 9 × 10⁸', '9 > 3,16: a ordem de grandeza é 10⁹.'],
        }),
      ],
      challenge: [
        choice({
          prompt: [p('Cada milímetro cúbico de sangue tem cerca de 7 × 10³ glóbulos brancos, e uma pessoa tem cerca de 5 L de sangue (1 L = 10⁶ mm³).')],
          ask: 'Quantos glóbulos brancos essa pessoa tem, aproximadamente?',
          options: [
            ok('3,5 × 10¹⁰'),
            no('3,5 × 10⁹', '35 × 10⁹ normalizado é 3,5 × 10¹⁰: o expoente sobe 1.'),
            no('3,5 × 10⁴', 'Faltou converter litros em mm³: 5 L = 5 × 10⁶ mm³.'),
            no('1,2 × 10¹⁰', 'Os coeficientes se multiplicam (7 × 5 = 35), não se somam.'),
          ],
          solution: ['$5 L = 5 × 10⁶ mm³', '$(7 × 10³) × (5 × 10⁶) = 35 × 10⁹ = 3,5 × 10¹⁰'],
          verify: () => 3.5e10,
          tolerance: 1,
        }),
        gen(ratioGen),
        numeric({
          prompt: [p('A distância média da Terra à Lua é de 3,84 × 10⁸ m, e a luz viaja a 3 × 10⁸ m/s. Um sinal de rádio (que viaja à mesma velocidade) vai da Terra à Lua e volta.')],
          ask: 'Quanto tempo leva a ida e a volta?',
          unit: 's',
          answer: 2.56,
          tolerance: 0.01,
          wrong: [
            { value: 1.28, feedback: '1,28 s é só a ida. O sinal vai e volta: o dobro da distância.' },
            { value: 1.152e17, feedback: 'Multiplicou distância por velocidade. Tempo = distância ÷ velocidade.' },
          ],
          solution: ['Ida e volta: 2 × 3,84 × 10⁸ = 7,68 × 10⁸ m.', '$(7,68 × 10⁸) ÷ (3 × 10⁸) = 2,56 s'],
        }),
      ],
      recap: [
        'Antes de calcular, ponha as grandezas na mesma unidade.',
        '"Quantas vezes A é B" = A ÷ B (coeficientes ÷, expoentes −).',
        'Tempo = distância ÷ velocidade; total = quantidade por unidade × número de unidades.',
        'Ordem de grandeza: compare a mantissa com √10 ≈ 3,16 (ou use a definição do enunciado).',
      ],
    })),

    stage('maestria', 'maestria', 'Maestria: unidades misturadas e várias etapas', 'Resolver problemas inéditos com várias conversões e operações em notação científica, somando só o que está na mesma unidade e potência.', () => ({
      learn: [
        strategy('Roteiro em três passos', '1) Converta tudo para a mesma unidade (de preferência a do resultado pedido). 2) Iguale as potências de 10 antes de somar ou subtrair. 3) Normalize e confira a ordem de grandeza: o resultado faz sentido?'),
        example('A energia comprada', 'Três usinas geraram 0,8 GWh, 450 MWh e 30.000 kWh num dia. A cidade consumiu 1,5 × 10⁹ Wh. Quanto foi comprado da rede? (1 kWh = 10³ Wh; 1 MWh = 10⁶ Wh; 1 GWh = 10⁹ Wh)', [
          step('Tudo em Wh, com a mesma potência (10⁹):', '0,8 GWh = 0,8 × 10⁹ Wh', '450 MWh = 4,5 × 10⁸ = 0,45 × 10⁹ Wh', '30.000 kWh = 3 × 10⁷ = 0,03 × 10⁹ Wh'),
          step('Geração total:', '(0,8 + 0,45 + 0,03) × 10⁹ = 1,28 × 10⁹ Wh'),
          askStep('Compra = consumo − geração = 0,22 × 10⁹ Wh.', 'Como fica normalizado?', [
            ok('2,2 × 10⁸ Wh'),
            no('2,2 × 10⁹ Wh', 'Ao multiplicar a mantissa por 10 (0,22 → 2,2), o expoente DESCE 1.'),
            no('2,2 × 10¹⁰ Wh', 'O expoente desce, não sobe: 0,22 × 10⁹ = 2,2 × 10⁸.'),
          ], '0,22 × 10⁹ = 2,2 × 10⁸ Wh'),
        ], 'Foram comprados 2,2 × 10⁸ Wh (220 MWh).'),
        tip('Desconfie de resultados absurdos', 'Um vírus de 10⁷ m seria maior que o planeta; uma conta de luz de 10⁻³ reais não existe. A ordem de grandeza denuncia erros de sinal no expoente.'),
        check(numeric({
          prompt: [p('Uma amostra de 6 × 10⁻⁴ g de uma substância ocupa 3 × 10⁻² mL.')],
          ask: 'Qual é a massa por mililitro, em g/mL?',
          answer: 0.02,
          tolerance: 0.0001,
          wrong: [
            { value: 0.002, feedback: '0,002 = 2 × 10⁻³: confira a subtração dos expoentes, −4 − (−2) = −2.' },
            { value: 2, feedback: '2 é só a divisão dos coeficientes. Falta a potência: 10⁻⁴ ÷ 10⁻² = 10⁻².' },
            { value: 0.0002, feedback: 'Subtrair −2 é SOMAR 2: −4 + 2 = −2, então 2 × 10⁻² = 0,02.' },
          ],
          solution: ['$(6 × 10⁻⁴) ÷ (3 × 10⁻²) = 2 × 10⁻⁴⁺² = 2 × 10⁻² = 0,02 g/mL'],
        })),
      ],
      practice: [
        choice({
          prompt: [p('Um laboratório anotou quatro medidas de partículas: 0,7 × 10⁻⁵ m, 6,5 × 10⁻⁶ m, 72 × 10⁻⁷ m e 0,0005 × 10⁻² m.')],
          ask: 'Qual é a maior medida, em notação científica padrão?',
          options: [
            ok('7,2 × 10⁻⁶ m'),
            no('7 × 10⁻⁶ m', '0,7 × 10⁻⁵ = 7 × 10⁻⁶, um pouco menor que 72 × 10⁻⁷ = 7,2 × 10⁻⁶.'),
            no('6,5 × 10⁻⁶ m', 'Normalizadas: 7; 6,5; 7,2 e 5 (todas × 10⁻⁶). A maior é 7,2.'),
            no('7,2 × 10⁻⁸ m', '72 × 10⁻⁷ = 7,2 × 10⁻⁶: ao dividir a mantissa por 10, o expoente SOBE 1.'),
          ],
          hints: ['Escreva todas com 10⁻⁶.', '0,0005 × 10⁻² = 5 × 10⁻⁶.'],
          solution: ['0,7 × 10⁻⁵ = 7 × 10⁻⁶; 6,5 × 10⁻⁶; 72 × 10⁻⁷ = 7,2 × 10⁻⁶; 0,0005 × 10⁻² = 5 × 10⁻⁶.', 'A maior é 7,2 × 10⁻⁶ m.'],
        }),
        numeric({
          prompt: [p('Um satélite transmite 2,5 × 10⁶ bytes por segundo, sem interrupção, durante 4 horas. Considere 1 GB = 10⁹ bytes.')],
          ask: 'Quantos gigabytes são transmitidos?',
          unit: 'GB',
          answer: 36,
          wrong: [
            { value: 0.01, feedback: '0,01 GB corresponde a 4 segundos. As 4 horas têm 4 × 3.600 = 14.400 s.' },
            { value: 3.6e10, feedback: '3,6 × 10¹⁰ é o total em BYTES. Em GB, divida por 10⁹.' },
            { value: 0.6, feedback: '0,6 GB corresponde a 4 minutos (240 s). São 4 horas: 14.400 s.' },
          ],
          hints: ['4 h = 14.400 s = 1,44 × 10⁴ s.', 'Bytes = taxa × tempo; depois divida por 10⁹.'],
          solution: ['$(2,5 × 10⁶) × (1,44 × 10⁴) = 3,6 × 10¹⁰ bytes', '$3,6 × 10¹⁰ ÷ 10⁹ = 36 GB'],
        }),
        gen(addGen),
      ],
      challenge: [
        choice({
          prompt: [p('Uma colmeia tem 4 × 10⁴ abelhas. Cada abelha visita, em média, 1,5 × 10³ flores por dia.')],
          ask: 'Quantas visitas a flores a colmeia faz em 30 dias?',
          options: [
            ok('1,8 × 10⁹'),
            no('6 × 10⁷', '6 × 10⁷ são as visitas de um dia só. Em 30 dias, multiplique por 30.'),
            no('1,8 × 10⁸', '180 × 10⁷ normalizado é 1,8 × 10⁹: o expoente sobe 2.'),
            no('5,5 × 10⁸', 'Os coeficientes se multiplicam (4 × 1,5 = 6), não se somam.'),
          ],
          solution: ['Por dia: (4 × 10⁴) × (1,5 × 10³) = 6 × 10⁷ visitas.', '$30 dias: 6 × 10⁷ × 3 × 10¹ = 18 × 10⁸ = 1,8 × 10⁹'],
          verify: () => 1.8e9,
          tolerance: 1,
        }),
        numeric({
          prompt: [p('Um rio despeja no mar 2,4 × 10⁴ m³ de água por segundo. Considere 1 dia = 8,64 × 10⁴ s e 1 m³ = 10³ L.')],
          ask: 'Quantos bilhões de litros (10⁹ L) o rio despeja em um dia?',
          answer: 2073.6,
          tolerance: 0.5,
          wrong: [
            { value: 2.0736, feedback: '2,07 corresponde a bilhões de m³, não de litros: 1 m³ = 10³ L.' },
            { value: 2073600, feedback: 'Isso está em milhões de litros (10⁶). Em bilhões (10⁹), divida por mais 10³.' },
          ],
          solution: ['$(2,4 × 10⁴) × (8,64 × 10⁴) = 20,736 × 10⁸ = 2,0736 × 10⁹ m³', '$Em litros: 2,0736 × 10¹² L = 2.073,6 × 10⁹ L'],
        }),
        gen(ratioGen),
      ],
      recap: [
        'Mesma unidade primeiro; mesma potência antes de somar ou subtrair.',
        'Normalize no fim e confira a ordem de grandeza.',
        'Em problemas de várias etapas, escreva a unidade de cada resultado parcial.',
      ],
    })),
  ],
});
