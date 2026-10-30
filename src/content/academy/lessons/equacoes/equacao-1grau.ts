/**
 * Aula: Equações do 1º grau — a balança (operações inversas), traduzir frases em equações
 * (dobro, idades, consecutivos, perímetros, partilhas), incógnita dos dois lados (planos que
 * empatam, distributiva, frações) e problemas de maestria com restos e partes.
 */
import {
  askStep,
  check,
  draftChoice,
  draftNumeric,
  example,
  fill,
  formula,
  gen,
  key,
  lab,
  lesson,
  no,
  numeric,
  ok,
  order,
  p,
  reveal,
  spot,
  stage,
  step,
  strategy,
  text,
} from '../../kit/build';
import { brl, fixed, frac, lcm, num, round } from '../../kit/format';
import type { Rand } from '../../types';

const isInt = (x: number) => Number.isInteger(round(x, 9));
const rs = (x: number) => (isInt(x) ? num(x) : fixed(x, 2));
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

// ———————————————————————————————————————————————— geradores: a balança

/** Equações de um passo: desfazer uma operação. */
function oneStepGen(r: Rand) {
  for (;;) {
    const x = r.int(2, 40);
    const a = r.int(2, 12);
    const kind = r.pick(['soma', 'sub', 'mult', 'div'] as const);
    if (kind === 'sub' && x <= a) continue;
    const eq =
      kind === 'soma' ? `x + ${a} = ${x + a}` : kind === 'sub' ? `x − ${a} = ${x - a}` : kind === 'mult' ? `${a}x = ${a * x}` : `x ÷ ${a} = ${x}`;
    const answer = kind === 'div' ? a * x : x;
    const wrong =
      kind === 'soma'
        ? [{ value: x + 2 * a, feedback: `Isso soma ${a} dos dois lados. Para desfazer "+ ${a}", subtraia ${a}.` }]
        : kind === 'sub'
          ? [{ value: x - 2 * a, feedback: `Isso subtrai ${a} de novo. Para desfazer "− ${a}", some ${a}.` }].filter((w) => w.value > 0)
          : kind === 'mult'
            ? [
                { value: a * a * x, feedback: `Isso multiplica por ${a} de novo. Para desfazer "× ${a}", divida por ${a}.` },
                { value: a * x - a, feedback: `Isso subtrai ${a}, mas o ${a} multiplica x: desfaça com a divisão.` },
              ]
            : [
                { value: round(x / a, 2), feedback: `Isso divide de novo. Para desfazer "÷ ${a}", multiplique por ${a}.` },
                { value: x + a, feedback: `Isso soma ${a}, mas x está dividido por ${a}: desfaça com a multiplicação.` },
              ];
    return draftNumeric({
      prompt: [formula(eq)],
      ask: 'Qual é o valor de x?',
      answer,
      wrong,
      hints: ['Faça a operação inversa dos dois lados da igualdade.', kind === 'soma' ? `Subtraia ${a} dos dois lados.` : kind === 'sub' ? `Some ${a} aos dois lados.` : kind === 'mult' ? `Divida os dois lados por ${a}.` : `Multiplique os dois lados por ${a}.`],
      solution: [kind === 'soma' ? `$x = ${x + a} − ${a} = ${x}` : kind === 'sub' ? `$x = ${x - a} + ${a} = ${x}` : kind === 'mult' ? `$x = ${a * x} ÷ ${a} = ${x}` : `$x = ${x} × ${a} = ${a * x}`],
    });
  }
}

/** Equações de dois passos: ax ± b = c. */
function twoStepGen(r: Rand) {
  for (;;) {
    const a = r.int(2, 9);
    const x = r.int(2, 15);
    const b = r.int(1, 30);
    const plus = r.next() < 0.6;
    const c = plus ? a * x + b : a * x - b;
    if (c <= 0) continue;
    if ((plus && a === 3 && x === 6 && b === 4) || (!plus && a === 5 && x === 5 && b === 7) || (plus && a === 4 && x === 7 && b === 9)) continue; // teoria
    const sign = plus ? '+' : '−';
    return draftNumeric({
      prompt: [formula(`${a}x ${sign} ${b} = ${c}`)],
      ask: 'Qual é o valor de x?',
      answer: x,
      wrong: [
        { value: round((plus ? c + b : c - b) / a, 2), feedback: `Isso ${plus ? 'soma' : 'subtrai'} ${b} em vez de ${plus ? 'subtrair' : 'somar'}. Para desfazer "${sign} ${b}", faça a operação inversa.` },
        { value: round(c / a + (plus ? -b : b), 2), feedback: `Isso divide só o ${c} por ${a}. Primeiro desfaça o "${sign} ${b}"; depois divida o resultado inteiro por ${a}.` },
        { value: (plus ? c - b : c + b) * a, feedback: `Isso multiplica por ${a}. O ${a} multiplica x: desfaça com a divisão.` },
        { value: plus ? c - b : c + b, feedback: `Esse é o valor de ${a}x. Falta dividir por ${a}.` },
      ].filter((w) => w.value > 0),
      hints: [`Primeiro desfaça o "${sign} ${b}": ${plus ? 'subtraia' : 'some'} ${b} dos dois lados.`, `Depois divida os dois lados por ${a}.`],
      solution: [`$${a}x = ${c} ${plus ? '−' : '+'} ${b} = ${a * x}`, `$x = ${a * x} ÷ ${a} = ${x}`],
    });
  }
}

/** Qual destes valores é solução? Conferir substituindo. */
function isSolutionGen(r: Rand) {
  for (;;) {
    const a = r.int(2, 9);
    const x = r.int(2, 12);
    const b = r.int(1, 25);
    const c = a * x + b;
    const cands = [...new Set([x, x + 1, x - 1, Math.round((c + b) / a), c - b].filter((v) => v > 0))];
    if (cands.length < 4) continue;
    const options = r.shuffle(cands.slice(0, 5)).map((v) =>
      v === x ? ok(`x = ${v}`) : no(`x = ${v}`, `Substituindo: ${a} × ${v} + ${b} = ${a * v + b}, e não ${c}.`),
    );
    return draftChoice({
      prompt: [formula(`${a}x + ${b} = ${c}`)],
      ask: 'Qual destes valores é a solução da equação?',
      options,
      hints: ['Substitua cada valor no lugar de x e veja qual deixa os dois lados iguais.', `Procure o valor que dá ${a} × x = ${c - b}.`],
      solution: [`$${a} × ${x} + ${b} = ${a * x} + ${b} = ${c} ✓`],
      verify: () => x,
    });
  }
}

// ———————————————————————————————————————————————— geradores: do texto à equação

const TIMES = [
  { k: 2, word: 'o dobro' },
  { k: 3, word: 'o triplo' },
  { k: 4, word: 'o quádruplo' },
];

/** "O dobro de um número, somado a a, é b." */
function phraseGen(r: Rand) {
  for (;;) {
    const m = r.pick(TIMES);
    const x = r.int(3, 25);
    const a = r.int(2, 20);
    const plus = r.next() < 0.5;
    const b = plus ? m.k * x + a : m.k * x - a;
    if (b <= 0) continue;
    return draftNumeric({
      prompt: [p(`${cap(m.word)} de um número, ${plus ? `somado a ${a}` : `diminuído de ${a}`}, é igual a ${b}.`)],
      ask: 'Que número é esse?',
      answer: x,
      wrong: [
        { value: round((plus ? b + a : b - a) / m.k, 2), feedback: `Isso ${plus ? 'soma' : 'subtrai'} ${a} em vez de ${plus ? 'subtrair' : 'somar'}. Desfaça o "${plus ? '+' : '−'} ${a}" com a operação inversa.` },
        { value: plus ? b - a : b + a, feedback: `Esse é ${m.word} do número. Falta dividir por ${m.k}.` },
        { value: round(b / m.k, 2), feedback: `Isso ignora o ${plus ? '+' : '−'} ${a}. Antes de dividir por ${m.k}, desfaça essa parte.` },
      ].filter((w) => w.value > 0),
      hints: [`Chame o número de x: ${m.k}x ${plus ? '+' : '−'} ${a} = ${b}.`, `${m.k}x = ${plus ? b - a : b + a}; agora divida por ${m.k}.`],
      solution: [`$${m.k}x ${plus ? '+' : '−'} ${a} = ${b}`, `$${m.k}x = ${plus ? b - a : b + a} → x = ${x}`],
    });
  }
}

const NAMES = ['Lia', 'Caio', 'Nina', 'Théo', 'Rui', 'Bia', 'Ivo', 'Ana'];

/** Idades: soma e diferença. */
function ageGen(r: Rand) {
  const [A, B] = r.shuffle(NAMES).slice(0, 2);
  const y = r.int(6, 30);
  const d = r.int(2, 12);
  const S = 2 * y + d;
  return draftNumeric({
    prompt: [p(`${A} tem ${d} anos a mais que ${B}. Juntos, os dois têm ${S} anos.`)],
    ask: `Qual é a idade de ${B}?`,
    unit: 'anos',
    answer: y,
    wrong: [
      { value: round(S / 2, 2), feedback: `Isso divide a soma igualmente, como se tivessem a mesma idade. ${A} tem ${d} anos a mais.` },
      { value: y + d, feedback: `Essa é a idade de ${A}, o mais velho. A pergunta é a de ${B}.` },
      { value: S - d, feedback: `Isso é o dobro da idade de ${B}. Falta dividir por 2.` },
    ],
    hints: [`Chame a idade de ${B} de x. A de ${A} é x + ${d}.`, `x + (x + ${d}) = ${S} → 2x = ${S - d}.`],
    solution: [`$x + x + ${d} = ${S}`, `$2x = ${S - d} → x = ${y}`],
  });
}

/** Números consecutivos (ou pares consecutivos). */
function consecutiveGen(r: Rand) {
  const k = r.pick([3, 4, 5]);
  const even = r.next() < 0.3;
  const st = even ? 2 : 1;
  const x = even ? 2 * r.int(5, 40) : r.int(5, 80);
  const S = k * x + (st * k * (k - 1)) / 2;
  const big = r.next() < 0.4;
  const ans = big ? x + st * (k - 1) : x;
  return draftNumeric({
    prompt: [p(`A soma de ${k} números ${even ? 'pares consecutivos' : 'inteiros consecutivos'} é ${S}.`)],
    ask: big ? 'Qual é o maior deles?' : 'Qual é o menor deles?',
    answer: ans,
    wrong: [
      { value: round(S / k, 2), feedback: 'Isso divide a soma igualmente: dá o número do meio (a média), e não o pedido.' },
      { value: big ? x : x + st * (k - 1), feedback: `Esse é o ${big ? 'menor' : 'maior'} dos números. A pergunta é o ${big ? 'maior' : 'menor'}.` },
      { value: S - (st * k * (k - 1)) / 2, feedback: `Isso é ${k} vezes o menor número. Falta dividir por ${k}.` },
    ],
    hints: [`Chame o menor de x: os números são ${Array.from({ length: k }, (_, i) => (i ? `x + ${i * st}` : 'x')).join(', ')}.`, `Somando: ${k}x + ${(st * k * (k - 1)) / 2} = ${S}.`],
    solution: [`$${k}x + ${(st * k * (k - 1)) / 2} = ${S} → x = ${x}`, ...(big ? [`$Maior: ${x} + ${st * (k - 1)} = ${ans}`] : [])],
  });
}

/** Retângulo: perímetro e relação entre os lados. */
function perimeterGen(r: Rand) {
  for (;;) {
    const w = r.int(3, 30);
    const rel = r.pick(['dobro', 'triplo', 'mais'] as const);
    const d = r.int(2, 15);
    const L = rel === 'dobro' ? 2 * w : rel === 'triplo' ? 3 * w : w + d;
    if (rel === 'dobro' && w === 9) continue; // exercício da teoria
    const P = 2 * (w + L);
    const what = r.pick(['Um terreno retangular', 'Uma horta retangular', 'Um quadro retangular']);
    const relText = rel === 'dobro' ? 'o comprimento é o dobro da largura' : rel === 'triplo' ? 'o comprimento é o triplo da largura' : `o comprimento tem ${d} m a mais que a largura`;
    const k = rel === 'dobro' ? 2 : rel === 'triplo' ? 3 : 1;
    return draftNumeric({
      prompt: [p(`${what} tem perímetro de ${P} m, e ${relText}.`)],
      ask: 'Qual é a largura?',
      unit: 'm',
      answer: w,
      wrong: [
        { value: round(rel === 'mais' ? (P - d) / 2 : P / (k + 1), 2), feedback: 'Isso conta cada lado uma vez só. O perímetro soma os 4 lados: 2 larguras e 2 comprimentos.' },
        { value: round(P / 4, 2), feedback: 'Isso trata o retângulo como um quadrado. Os lados são diferentes: use a relação dada.' },
        { value: L, feedback: 'Esse é o comprimento. A pergunta é a largura.' },
      ],
      hints: [`Chame a largura de x; o comprimento é ${rel === 'mais' ? `x + ${d}` : `${k}x`}.`, `Perímetro: 2 × (x + ${rel === 'mais' ? `x + ${d}` : `${k}x`}) = ${P}.`],
      solution: rel === 'mais' ? [`$2(x + x + ${d}) = ${P} → 4x + ${2 * d} = ${P}`, `$4x = ${P - 2 * d} → x = ${w}`] : [`$2(x + ${k}x) = ${P} → ${2 * (k + 1)}x = ${P}`, `$x = ${w}`],
    });
  }
}

/** Partilha com relações: o 2º recebe k vezes o 1º; o 3º, d a mais que o 2º. */
function shareGen(r: Rand) {
  const x = r.int(4, 60) * 5;
  const k = r.pick([2, 3]);
  const d = r.pick([10, 20, 30, 50]);
  const T = x + k * x + (k * x + d);
  return draftNumeric({
    prompt: [p(`Três amigos dividiram um prêmio de ${brl(T)}. O segundo recebeu ${k === 2 ? 'o dobro' : 'o triplo'} do que recebeu o primeiro, e o terceiro recebeu ${brl(d)} a mais que o segundo.`)],
    ask: 'Quanto recebeu o primeiro?',
    prefix: 'R$',
    answer: x,
    wrong: [
      { value: round(T / 3, 2), feedback: 'Isso divide o prêmio igualmente. As partes são diferentes: use as relações dadas.' },
      { value: round(T / (1 + 2 * k), 2), feedback: `Isso esquece os ${brl(d)} a mais do terceiro.` },
      { value: round((T - d) / 3, 2), feedback: `Isso tira os ${brl(d)}, mas depois divide por 3. Somando as partes: x + ${k}x + ${k}x = ${1 + 2 * k}x.` },
    ],
    hints: [`Primeiro: x; segundo: ${k}x; terceiro: ${k}x + ${d}.`, `x + ${k}x + ${k}x + ${d} = ${T} → ${1 + 2 * k}x = ${T - d}.`],
    solution: [`$${1 + 2 * k}x + ${d} = ${num(T)}`, `$${1 + 2 * k}x = ${num(T - d)} → x = ${num(x)}`],
  });
}

// ———————————————————————————————————————————————— geradores: dois lados

/** ax + b = cx + d. */
function twoSidesGen(r: Rand) {
  for (;;) {
    const x = r.int(2, 20);
    const c = r.int(1, 6);
    const a = c + r.int(1, 6);
    const b = r.int(1, 40);
    const d = (a - c) * x + b;
    return draftNumeric({
      prompt: [formula(`${a}x + ${b} = ${c === 1 ? '' : c}x + ${d}`)],
      ask: 'Qual é o valor de x?',
      answer: x,
      wrong: [
        { value: round((d - b) / (a + c), 2), feedback: `Isso soma os coeficientes. Ao passar o ${c === 1 ? '' : c}x para a esquerda, ele é subtraído: ${a}x − ${c === 1 ? '' : c}x = ${a - c}x.` },
        { value: round((d + b) / (a - c), 2), feedback: `Isso soma ${b} em vez de subtrair. Para tirar o ${b} da esquerda, subtraia ${b} dos dois lados.` },
        { value: round((d - b) / a, 2), feedback: `Isso esquece o ${c === 1 ? '' : c}x do lado direito. Junte os termos com x de um lado só.` },
        { value: d - b, feedback: `Esse é o valor de ${a - c}x. Falta dividir por ${a - c}.` },
      ].filter((w) => w.value > 0),
      hints: [`Subtraia ${c === 1 ? '' : c}x dos dois lados: ${a - c}x + ${b} = ${d}.`, `Depois subtraia ${b} e divida por ${a - c}.`],
      solution: [`$${a}x − ${c === 1 ? '' : c}x = ${d} − ${b}`, `$${a - c}x = ${d - b} → x = ${x}`],
    });
  }
}

const PLAN_CTX = [
  { what: 'Uma operadora oferece dois planos de telefone', unit: 'minutos', per: 'por minuto', fix: 'fixos por mês' },
  { what: 'Duas lavanderias cobram de formas diferentes', unit: 'quilos de roupa', per: 'por quilo', fix: 'de taxa fixa' },
  { what: 'Duas gráficas cobram de formas diferentes', unit: 'cópias', per: 'por cópia', fix: 'de taxa fixa' },
];

/** Dois planos (fixo + por unidade): quando custam o mesmo. */
function plansGen(r: Rand) {
  for (;;) {
    const c = r.pick(PLAN_CTX);
    const x = r.pick([20, 25, 30, 40, 50, 60, 80, 100, 120]);
    const va = r.pick([40, 50, 60, 75, 80, 100]);
    const vb = va - r.pick([10, 15, 20, 25]);
    const Fa = r.pick([10, 15, 20, 25, 30, 35]);
    const Fb = Fa + (x * (va - vb)) / 100;
    if (!isInt(Fb * 100)) continue;
    if (Fa === 30 && va === 50 && vb === 25 && Fb === 40) continue; // questão do banco
    return draftNumeric({
      prompt: [p(`${c.what}: no plano A, ${brl(Fa)} ${c.fix} mais ${brl(va / 100)} ${c.per}; no plano B, ${brl(Fb)} ${c.fix} mais ${brl(vb / 100)} ${c.per}.`)],
      ask: `Para quantos ${c.unit} os dois planos custam o mesmo valor?`,
      answer: x,
      wrong: [
        { value: round((Fb - Fa) / (va / 100), 2), feedback: 'Isso divide a diferença fixa pelo preço de um plano só. Quem compensa a diferença fixa é a diferença entre os preços por unidade.' },
        { value: round((Fb + Fa) / ((va - vb) / 100), 2), feedback: 'Isso soma as partes fixas. Ao juntar os termos, as partes fixas se subtraem.' },
        { value: round(Fb - Fa, 2), feedback: 'Essa é a diferença das partes fixas, em reais. Divida pela diferença dos preços por unidade.' },
      ],
      hints: [`Plano A: ${rs(Fa)} + ${rs(va / 100)}x; plano B: ${rs(Fb)} + ${rs(vb / 100)}x.`, `Iguale e junte os termos: ${rs((va - vb) / 100)}x = ${rs(Fb - Fa)}.`],
      solution: [`$${rs(Fa)} + ${rs(va / 100)}x = ${rs(Fb)} + ${rs(vb / 100)}x`, `$${rs((va - vb) / 100)}x = ${rs(Fb - Fa)} → x = ${x}`],
    });
  }
}

/** Distributiva: a(x ± b) = c. */
function distributiveGen(r: Rand) {
  for (;;) {
    const a = r.int(2, 8);
    const x = r.int(1, 15);
    const b = r.int(1, 12);
    const minus = r.next() < 0.4;
    const inner = minus ? x - b : x + b;
    if (inner <= 0) continue;
    const c = a * inner;
    return draftNumeric({
      prompt: [formula(`${a}(x ${minus ? '−' : '+'} ${b}) = ${c}`)],
      ask: 'Qual é o valor de x?',
      answer: x,
      wrong: [
        { value: round((minus ? c + b : c - b) / a, 2), feedback: `Isso multiplica só o x por ${a}. Na distributiva, o ${a} multiplica também o ${b}: ${a}x ${minus ? '−' : '+'} ${a * b}.` },
        { value: minus ? c + b : c - b, feedback: `Isso desfaz o "${minus ? '−' : '+'} ${b}" antes de desfazer o "× ${a}". Primeiro divida tudo por ${a}.` },
        { value: c / a, feedback: `Esse é o valor de x ${minus ? '−' : '+'} ${b}. Falta ${minus ? 'somar' : 'subtrair'} ${b}.` },
      ].filter((w) => w.value > 0),
      hints: [`Divida os dois lados por ${a}: x ${minus ? '−' : '+'} ${b} = ${c / a}.`, `Ou distribua: ${a}x ${minus ? '−' : '+'} ${a * b} = ${c}.`],
      solution: [`$x ${minus ? '−' : '+'} ${b} = ${c} ÷ ${a} = ${c / a}`, `$x = ${x}`],
    });
  }
}

const FRACS: [number, number][] = [
  [2, 3],
  [3, 4],
  [2, 5],
  [4, 6],
  [3, 6],
  [2, 4],
  [5, 10],
];

/** Frações: x/a + x/b = c. */
function fractionEqGen(r: Rand) {
  for (;;) {
    const [a, b] = r.pick(FRACS);
    const L = lcm(a, b);
    const x = L * r.int(1, 8);
    const c = x / a + x / b;
    if (a === 3 && b === 4 && x === 24) continue; // exemplo da teoria
    return draftNumeric({
      prompt: [formula(`x/${a} + x/${b} = ${c}`)],
      ask: 'Qual é o valor de x?',
      answer: x,
      wrong: [
        { value: round((c * (a + b)) / 2, 2), feedback: `Isso soma numeradores e denominadores (x/${a} + x/${b} = 2x/${a + b}). Para somar frações, use o denominador comum ${L}.` },
        { value: c * (a + b), feedback: `Isso trata a soma como x ÷ (${a} + ${b}). Cada fração é uma parte de x: ${L / a}x/${L} + ${L / b}x/${L}.` },
        { value: c * L, feedback: `Isso multiplica só o lado direito por ${L}. Multiplique os dois lados: ${L / a}x + ${L / b}x = ${c * L}.` },
      ],
      hints: [`Multiplique tudo por ${L}, o MMC de ${a} e ${b}.`, `${L / a}x + ${L / b}x = ${c * L} → ${L / a + L / b}x = ${c * L}.`],
      solution: [`$× ${L}: ${L / a}x + ${L / b}x = ${c * L}`, `$${L / a + L / b}x = ${c * L} → x = ${x}`],
    });
  }
}

/** Gasta uma fração do total e outra fração do resto; sobra um valor. */
function remainderGen(r: Rand) {
  for (;;) {
    const a = r.pick([3, 4, 5]);
    const b = r.pick([2, 3, 4]);
    const left = (1 - 1 / a) * (1 - 1 / b);
    const k = r.pick([200, 240, 300, 360, 400, 450, 600, 900]);
    const x = k / left;
    if (!isInt(x)) continue;
    const fa = a === 3 ? 'um terço' : a === 4 ? 'um quarto' : 'um quinto';
    const fb = b === 2 ? 'metade' : b === 3 ? 'um terço' : 'um quarto';
    return draftNumeric({
      prompt: [p(`Mara gastou ${fa} do seu salário com o aluguel e ${fb} do que restou com o mercado. Sobraram ${brl(k)}.`)],
      ask: 'Qual é o salário de Mara?',
      prefix: 'R$',
      answer: round(x, 2),
      wrong: [
        { value: round(k / (1 - 1 / a - 1 / b), 2), feedback: `Isso calcula as duas frações sobre o salário inteiro. O mercado levou ${fb} do que restou depois do aluguel.` },
        { value: round(k / (1 - 1 / b), 2), feedback: 'Esse é o que restou depois do aluguel. Ainda falta desfazer o gasto com o aluguel.' },
        { value: round(k * a * b, 2), feedback: `Isso multiplica a sobra por ${a} e por ${b}. A sobra é (1 − 1/${a}) × (1 − 1/${b}) do salário: divida por essa fração.` },
      ].filter((w) => w.value > 0 && Number.isFinite(w.value)),
      hints: [`Depois do aluguel, restam ${a - 1}/${a} do salário; depois do mercado, ${b - 1}/${b} disso.`, `Sobra = x × ${a - 1}/${a} × ${b - 1}/${b} = ${num(k)}.`],
      solution: [`$x × ${a - 1}/${a} × ${b - 1}/${b} = ${num(k)}`, `$x × ${frac((a - 1) * (b - 1), a * b)} = ${num(k)} → x = ${num(x)}`],
    });
  }
}

// ———————————————————————————————————————————————— aula

export const EQUACAO_1GRAU = lesson({
  id: 'equacao-1grau',
  topic: 'equacoes',
  subtopics: ['equacao-1grau'],
  title: 'Equações do 1º grau',
  summary: 'A equação como balança: desfazer operações, traduzir frases em equações, resolver com a incógnita dos dois lados e conferir a resposta na situação.',
  requires: ['operacoes'],
  stages: [
    stage('equilibrio', 'descoberta', 'A balança em equilíbrio', 'Entender a equação como uma igualdade em equilíbrio e resolvê-la desfazendo as operações, na ordem inversa, dos dois lados.', () => ({
      learn: [
        text('Uma **equação** é uma igualdade com um valor desconhecido, a **incógnita** (em geral, x). Resolver é descobrir o valor que torna a igualdade verdadeira. Como numa balança em equilíbrio, o que se faz de um lado — somar, subtrair, multiplicar, dividir — precisa ser feito do outro.'),
        lab({
          title: 'A balança',
          intro: 'De um lado da balança, 3 caixas iguais de x quilos e um peso de 4 kg; do outro, 22 kg. Escolha o valor de x.',
          params: [{ key: 'x', label: 'Peso de cada caixa (x)', min: 0, max: 12, step: 1, value: 2, format: (v) => `${v} kg` }],
          readouts: ({ x }) => [
            { label: 'Lado esquerdo: 3x + 4', value: `${3 * x + 4} kg` },
            { label: 'Lado direito', value: '22 kg' },
            { label: 'Balança', value: 3 * x + 4 === 22 ? 'em equilíbrio' : 3 * x + 4 < 22 ? 'pende para a direita' : 'pende para a esquerda', big: true, tone: 'brass' },
          ],
          viz: ({ x }) => ({
            kind: 'bars',
            bars: [
              { label: '3x + 4', value: 3 * x + 4, text: `${3 * x + 4} kg`, tone: 3 * x + 4 === 22 ? 'verdigris' : 'ember' },
              { label: '22', value: 22, text: '22 kg', tone: 'sky' },
            ],
            summary: `Com x = ${x}, o lado esquerdo pesa ${3 * x + 4} kg e o direito, 22 kg`,
          }),
          goal: {
            task: 'Ache o peso de cada caixa que deixa a balança em equilíbrio.',
            done: ({ x }) => x === 6,
            success: 'Isso: 3 × 6 + 4 = 22. Sem tentativas: tire 4 dos dois lados (3x = 18) e divida por 3 (x = 6).',
          },
          insight: 'Tirar o mesmo peso dos dois pratos, ou dividir os dois pela metade, mantém a balança equilibrada: é isso que se faz com a equação.',
        }),
        key('Operações inversas', 'Para isolar x, desfaça as operações na ordem inversa: primeiro o que foi somado ou subtraído; depois o que multiplica ou divide. Em 3x + 4 = 22: tire 4 (3x = 18) e divida por 3 (x = 6).'),
        example('Desfazendo passo a passo', 'Resolva 5x − 7 = 18.', [
          step('Desfaça o "− 7": some 7 aos dois lados.', '5x = 25'),
          askStep('Agora o 5 multiplica x.', 'Qual é o próximo passo?', [
            ok('Dividir os dois lados por 5: x = 5'),
            no('Subtrair 5 dos dois lados: x = 20', 'O 5 está multiplicando x, e não somando: desfaça com a divisão.'),
          ]),
          step('Confira:', '5 × 5 − 7 = 18 ✓'),
        ], 'x = 5.'),
        check(order({
          prompt: [formula('4x + 9 = 37')],
          ask: 'Coloque os passos da resolução em ordem.',
          steps: ['4x + 9 = 37', '4x = 37 − 9', '4x = 28', 'x = 28 ÷ 4', 'x = 7'],
          why: 'Primeiro desfaz-se a soma (tira 9 dos dois lados); depois, a multiplicação (divide por 4).',
          solution: ['$4x = 28 → x = 7', 'Confira: 4 × 7 + 9 = 37.'],
        })),
      ],
      practice: [gen(oneStepGen), gen(twoStepGen), gen(isSolutionGen)],
      challenge: [
        gen(twoStepGen),
        spot({
          prompt: [formula('6x − 8 = 40')],
          ask: 'Uma resolução tem um passo errado. Qual?',
          lines: ['6x − 8 = 40', '6x = 40 − 8', '6x = 32', 'x = 32 ÷ 6'],
          wrong: 1,
          why: 'Para desfazer o "− 8", soma-se 8 aos dois lados: 6x = 48, e x = 8.',
          solution: ['$6x = 40 + 8 = 48', '$x = 48 ÷ 6 = 8'],
        }),
        gen(twoStepGen),
      ],
      recap: [
        'O que se faz de um lado, faz-se do outro.',
        'Desfaça na ordem inversa: soma e subtração primeiro, depois multiplicação e divisão.',
        'Confira substituindo x na equação original.',
      ],
    })),

    stage('traduzir', 'fundamentos', 'Do texto à equação', 'Dar nome ao valor desconhecido e traduzir frases — dobro, metade, a mais, consecutivos, perímetro — em equações que resolvem o problema.', () => ({
      learn: [
        text('Problemas em palavras viram equações em três passos: **nomeie** o que não se sabe (x), **traduza** cada frase e **resolva**. Algumas traduções: "o dobro de um número" = 2x; "a metade" = x/2; "três a mais" = x + 3; "o triplo, diminuído de 5" = 3x − 5; "números consecutivos" = x, x + 1, x + 2.'),
        check(fill({
          prompt: [p('"O triplo de um número, diminuído de 4, é igual a 20."')],
          ask: 'Complete a equação.',
          parts: [{ options: ['3x', 'x + 3', 'x³'], answer: 0 }, ' ', { options: ['− 4', '+ 4', '÷ 4'], answer: 0 }, ' = 20'],
          why: '"O triplo" é 3x; "diminuído de 4" subtrai 4. A equação 3x − 4 = 20 dá x = 8.',
          solution: ['$3x − 4 = 20 → 3x = 24 → x = 8'],
        })),
        example('Idades', 'Ana tem 5 anos a mais que o irmão. Juntos, os dois têm 29 anos. Qual é a idade do irmão?', [
          step('Nomeie:', 'irmão = x; Ana = x + 5'),
          step('Traduza:', 'x + (x + 5) = 29'),
          askStep('2x + 5 = 29.', 'Qual é a idade do irmão?', [
            ok('2x = 24 → x = 12 anos'),
            no('29 ÷ 2 = 14,5 anos', 'Isso divide igualmente, como se tivessem a mesma idade. Primeiro tire os 5 anos de diferença.'),
          ]),
        ], 'O irmão tem 12 anos, e Ana, 17.'),
        example('Consecutivos', 'A soma de três números inteiros consecutivos é 72. Quais são eles?', [
          step('Nomeie o menor de x:', 'x + (x + 1) + (x + 2) = 72'),
          step('Junte:', '3x + 3 = 72 → 3x = 69 → x = 23'),
        ], 'Os números são 23, 24 e 25.'),
        check(numeric({
          prompt: [p('Um terreno retangular tem perímetro de 54 m, e o comprimento é o dobro da largura.')],
          ask: 'Qual é a largura do terreno?',
          unit: 'm',
          answer: 9,
          wrong: [
            { value: 18, feedback: '18 m é o comprimento (o dobro da largura). A pergunta é a largura.' },
            { value: 13.5, feedback: 'Isso trata o terreno como um quadrado (54 ÷ 4). Use a relação: comprimento = 2x.' },
            { value: 27, feedback: 'Isso conta cada lado uma vez só (x + 2x = 27). O perímetro tem 2 larguras e 2 comprimentos: 6x = 54.' },
          ],
          solution: ['$2(x + 2x) = 54 → 6x = 54', '$x = 9'],
        })),
      ],
      practice: [gen(phraseGen), gen(ageGen), gen(consecutiveGen), gen(perimeterGen)],
      challenge: [gen(shareGen), gen(perimeterGen), gen(consecutiveGen), gen(ageGen)],
      recap: [
        'Nomeie a incógnita antes de escrever a equação.',
        'Dobro = 2x; metade = x/2; a mais = + ; a menos = −.',
        'Responda o que foi pedido (o menor, o maior, a largura…).',
      ],
    })),

    stage('dois-lados', 'aplicacoes', 'A incógnita dos dois lados', 'Resolver equações com a incógnita dos dois lados, com distributiva e com frações, e usá-las para descobrir quando dois planos custam o mesmo.', () => ({
      learn: [
        text('Quando x aparece **dos dois lados**, junte os termos com x de um lado e os números do outro, sempre fazendo a mesma operação nos dois lados: 5x + 3 = 2x + 21 → 3x + 3 = 21 → 3x = 18 → x = 6. É assim que se descobre quando dois planos custam o mesmo: fixo A + a·x = fixo B + b·x.'),
        lab({
          title: 'Quando os custos se igualam?',
          intro: 'O plano A custa R$ 12,00 mais R$ 3,00 por hora de uso; o plano B, R$ 30,00 mais R$ 1,50 por hora. Escolha o número de horas.',
          params: [{ key: 'x', label: 'Horas de uso (x)', min: 0, max: 24, step: 1, value: 4, format: (v) => `${v} h` }],
          readouts: ({ x }) => [
            { label: 'Plano A: 12 + 3x', value: brl(12 + 3 * x) },
            { label: 'Plano B: 30 + 1,5x', value: brl(30 + 1.5 * x) },
            { label: 'Comparação', value: 12 + 3 * x === 30 + 1.5 * x ? 'iguais' : 12 + 3 * x < 30 + 1.5 * x ? 'A é mais barato' : 'B é mais barato', big: true, tone: 'brass' },
          ],
          viz: ({ x }) => ({
            kind: 'bars',
            bars: [
              { label: 'Plano A', value: 12 + 3 * x, text: brl(12 + 3 * x), tone: 'ember' },
              { label: 'Plano B', value: 30 + 1.5 * x, text: brl(30 + 1.5 * x), tone: 'verdigris' },
            ],
            summary: `Com ${x} horas: plano A ${brl(12 + 3 * x)}, plano B ${brl(30 + 1.5 * x)}`,
          }),
          goal: {
            task: 'Ache o número de horas em que os dois planos custam o mesmo.',
            done: ({ x }) => x === 12,
            success: 'Isso: 12 + 3 × 12 = 48 e 30 + 1,5 × 12 = 48. Na equação: 12 + 3x = 30 + 1,5x → 1,5x = 18 → x = 12.',
          },
          insight: 'Antes do empate, o plano de parte fixa menor é mais barato; depois, o de menor preço por hora.',
        }),
        key('Junte os semelhantes', 'Subtraia dos dois lados o termo com x do lado direito; depois tire os números do lado esquerdo; por fim, divida pelo coeficiente. Com parênteses, distribua ou divida primeiro. Com frações, multiplique tudo pelo MMC dos denominadores.'),
        example('Dois planos de academia', 'O plano A tem matrícula de R$ 60,00 e mensalidade de R$ 80,00; o plano B não tem matrícula, mas a mensalidade é R$ 95,00. Em quantos meses os gastos se igualam?', [
          step('Equação:', '60 + 80m = 95m'),
          askStep('Junte os termos com m.', 'Qual é o resultado?', [
            ok('60 = 15m → m = 4 meses'),
            no('60 = 175m', 'Ao passar 80m para a direita, ele é subtraído: 95m − 80m = 15m.'),
          ]),
        ], 'Em 4 meses, os dois planos custam R$ 380,00.'),
        example('Com frações', 'Resolva x/3 + x/4 = 14.', [
          step('Multiplique tudo por 12, o MMC de 3 e 4:', '4x + 3x = 168'),
          step('Junte:', '7x = 168 → x = 24'),
        ], 'x = 24.'),
        check(numeric({
          prompt: [formula('7x − 12 = 3x + 20')],
          ask: 'Qual é o valor de x?',
          answer: 8,
          wrong: [
            { value: 3.2, feedback: 'Isso soma os coeficientes (10x = 32). Ao passar 3x para a esquerda, ele é subtraído: 4x.' },
            { value: 2, feedback: 'Isso subtrai 12 de 20. Para tirar o "− 12" da esquerda, some 12 aos dois lados: 4x = 32.' },
            { value: 32, feedback: '32 é o valor de 4x. Falta dividir por 4.' },
          ],
          solution: ['$7x − 3x = 20 + 12', '$4x = 32 → x = 8'],
        })),
      ],
      practice: [gen(twoSidesGen), gen(plansGen), gen(distributiveGen)],
      challenge: [gen(plansGen), gen(fractionEqGen), gen(twoSidesGen), gen(distributiveGen)],
      recap: [
        'x dos dois lados: subtraia para juntá-los de um lado.',
        'Parênteses: distribua ou divida primeiro.',
        'Frações: multiplique tudo pelo MMC.',
      ],
    })),

    stage('maestria', 'maestria', 'Maestria: equações que resolvem problemas', 'Resolver problemas inéditos que exigem montar e resolver equações do 1º grau, com frações, partilhas e comparações, e conferir a resposta.', () => ({
      learn: [
        strategy('Problema com equação em 4 passos', '1) Nomeie a incógnita (o que se pergunta, ou algo de que tudo depende). 2) Traduza cada informação. 3) Resolva desfazendo operações. 4) Confira na situação original e responda exatamente o que foi pedido.'),
        example('Frações do que resta', 'Um viajante gastou um quarto do dinheiro com a passagem e metade do que restou com a hospedagem. Sobraram R$ 300,00. Quanto ele tinha?', [
          step('Depois da passagem, restam 3/4 do dinheiro; depois da hospedagem, metade disso:', 'sobra = x × 3/4 × 1/2 = 3x/8'),
          askStep('3x/8 = 300.', 'Quanto ele tinha?', [
            ok('x = 300 × 8 ÷ 3 = R$ 800,00'),
            no('x = 300 ÷ (1 − 1/4 − 1/2) = R$ 1.200,00', 'A hospedagem levou metade do que restou, e não metade do total: a sobra é 3/4 × 1/2 = 3/8.'),
          ]),
        ], 'Ele tinha R$ 800,00.'),
        reveal('Por que conferir a resposta?', 'Porque erros de tradução não aparecem na conta: uma equação montada errado tem solução, só que de outro problema. Substituir o valor encontrado no enunciado original — e não na equação — revela se a tradução estava certa.'),
        check(numeric({
          prompt: [p('Um prêmio de R$ 1.100,00 foi dividido entre três pessoas: a segunda recebeu o dobro da primeira, e a terceira recebeu R$ 100,00 a mais que a segunda.')],
          ask: 'Quanto recebeu a primeira pessoa?',
          prefix: 'R$',
          answer: 200,
          wrong: [
            { value: 366.67, feedback: 'Isso divide o prêmio igualmente. Use as relações: x + 2x + (2x + 100) = 1.100.' },
            { value: 220, feedback: 'Isso esquece os R$ 100,00 a mais da terceira pessoa (5x = 1.100).' },
            { value: 333.33, feedback: 'Isso tira os R$ 100,00 e divide por 3. Somando as partes: x + 2x + 2x = 5x.' },
          ],
          solution: ['$x + 2x + 2x + 100 = 1.100', '$5x = 1.000 → x = 200'],
        })),
      ],
      practice: [gen(remainderGen), gen(shareGen), gen(twoSidesGen)],
      challenge: [gen(remainderGen), gen(distributiveGen), gen(plansGen), gen(fractionEqGen)],
      recap: [
        'Nomeie, traduza, resolva, confira.',
        '"Do que restou": multiplique as frações que sobram.',
        'Responda exatamente o que foi pedido.',
      ],
    })),
  ],
});
