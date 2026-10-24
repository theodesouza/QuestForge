/**
 * Aula: Frações — da ideia de parte de um todo aos problemas de etapas sucessivas,
 * inversos ("descobrir o todo") e de ritmos de trabalho (torneiras).
 */
import {
  askStep,
  check,
  choice,
  classify,
  compare,
  draftChoice,
  draftNumeric,
  example,
  fill,
  gen,
  key,
  lab,
  lesson,
  math,
  no,
  numeric,
  ok,
  order,
  p,
  reveal,
  sample,
  select,
  spot,
  stage,
  step,
  strategy,
  table,
  text,
  tip,
  warn,
} from '../../kit/build';
import { brl, frac, gcd, hm, lcm, num, pct } from '../../kit/format';
import type { Option, Rand } from '../../types';

// ———————————————————————————————————————————————— apoio

/** Frações próprias usadas nos controles (um controle percorre a lista). */
const PROPER: [number, number][] = [
  [1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5], [3, 5], [3, 8], [5, 6],
];
const STAGES_LIST: [number, number][] = [
  [1, 5], [1, 4], [1, 3], [2, 5], [1, 2], [3, 5], [2, 3], [3, 4],
];
const f = ([a, b]: [number, number]) => `${a}/${b}`;

function addFrac(a: number, b: number, c: number, d: number): [number, number] {
  const n = a * d + c * b;
  const m = b * d;
  const g = gcd(n, m);
  return [n / g, m / g];
}

const PIECES = [
  { text: 'Uma pizza foi cortada', unit: 'fatias' },
  { text: 'Um bolo foi cortado', unit: 'pedaços' },
  { text: 'Uma barra de chocolate foi dividida', unit: 'quadradinhos' },
  { text: 'Uma torta foi cortada', unit: 'fatias' },
];

function leftoverGen(r: Rand) {
  for (;;) {
    const total = r.pick([6, 8, 10, 12, 16]);
    const a = r.int(1, total - 3);
    const b = r.int(1, total - a - 2);
    const left = total - a - b;
    if (a + b === left) continue;
    const piece = r.pick(PIECES);
    return draftNumeric({
      prompt: [p(`${piece.text} em ${total} ${piece.unit} iguais. Lia comeu ${a} e Rui comeu ${b}.`)],
      ask: 'Que fração sobrou? Responda como fração (ex.: 3/8) ou em decimal.',
      answer: left / total,
      placeholder: 'ex.: 3/8',
      wrong: [
        { value: (a + b) / total, feedback: 'Essa é a fração que foi comida. A pergunta é o que sobrou: o todo menos as partes comidas.' },
        { value: left / (a + b), feedback: 'Você comparou o que sobrou com o que foi comido. A base de "que fração sobrou" é o todo.' },
      ],
      hints: ['Comece pelo todo: em quantas partes iguais foi dividido?', `Tire do total as partes comidas: ${total} − ${a} − ${b}.`],
      solution: [`Comeram ${a} + ${b} = ${a + b} de ${total} ${piece.unit}.`, `Sobraram ${total} − ${a + b} = ${left}.`, `$[[${left}|${total}]]${frac(left, total) !== `${left}/${total}` ? ` = ${frac(left, total)}` : ''}`],
    });
  }
}

const PERCENT_FRACTIONS: [number, number][] = [
  [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 8], [3, 8], [5, 8], [7, 8], [3, 20], [7, 20], [9, 20], [3, 25], [7, 25],
];

function toPercentGen(r: Rand) {
  const [a, b] = r.pick(PERCENT_FRACTIONS);
  const value = (100 * a) / b;
  const options: Option[] = [ok(pct(value, 1))];
  const glued = Number(`${a}${b}`);
  const distract: [number, string][] = [
    [glued, `Não dá para "juntar" os algarismos ${a} e ${b}: a fração é a divisão ${a} ÷ ${b}.`],
    [value / 100, `${num(value / 100, 4)} é o número decimal. Para virar porcentagem, multiplique por 100.`],
    [100 - value, `${pct(100 - value, 1)} é o que falta para o inteiro (1 − ${a}/${b}), não a fração pedida.`],
    [(100 * b) / a, `Você inverteu a fração: ${b}/${a} em vez de ${a}/${b}.`],
  ];
  const used = new Set([value]);
  for (const [v, fb] of distract) {
    if (used.has(v) || options.length >= 4) continue;
    used.add(v);
    options.push(no(pct(v, 1), fb));
  }
  return draftChoice({
    ask: `Quanto é ${a}/${b} em porcentagem?`,
    options,
    hints: [`Fração é divisão: calcule ${a} ÷ ${b}.`, 'Multiplique o decimal por 100.'],
    solution: [`$${a} ÷ ${b} = ${num(a / b, 4)}`, `$${num(a / b, 4)} × 100 = ${pct(value, 1)}`],
    verify: () => value,
  });
}

/** Forma irredutível: alternativas equivalentes "pela metade" e erros clássicos. */
const IRREDUCIBLE: [number, number][] = [
  [2, 3], [3, 4], [2, 5], [3, 5], [4, 5], [5, 6], [3, 7], [4, 9], [5, 8], [7, 12], [5, 9],
];
function irreducibleGen(r: Rand) {
  const [a, b] = r.pick(IRREDUCIBLE);
  const k = r.pick([2, 3, 4, 6]);
  const N = a * k;
  const D = b * k;
  const options: Option[] = [ok(`${a}/${b}`)];
  const texts = new Set([`${a}/${b}`]);
  const push = (t: string, fb: string) => {
    if (!texts.has(t) && options.length < 5) {
      texts.add(t);
      options.push(no(t, fb));
    }
  };
  if (k === 4 || k === 6) push(`${(a * k) / 2}/${(b * k) / 2}`, `É igual a ${N}/${D}, mas ainda dá para simplificar: numerador e denominador ainda têm divisor comum.`);
  push(`${b}/${a}`, 'Você inverteu numerador e denominador.');
  push(`${a}/${D}`, `Você dividiu só o numerador por ${k}. Numerador e denominador devem ser divididos pelo mesmo número.`);
  const m = N - a;
  push(`${N - m}/${D - m}`, `Subtrair o mesmo número em cima e embaixo (${m}) muda a fração. Simplificar é DIVIDIR os dois pelo mesmo número.`);
  return draftChoice({
    ask: `Qual é a forma irredutível de ${N}/${D}?`,
    options,
    hints: ['Procure um número que divida o numerador e o denominador ao mesmo tempo.', `O maior deles (o MDC de ${N} e ${D}) simplifica de uma vez.`],
    solution: [`O MDC de ${N} e ${D} é ${k * gcd(a, b)}.`, `$[[${N}|${D}]] = [[${N} ÷ ${k}|${D} ÷ ${k}]] = [[${a}|${b}]]`, `${a} e ${b} não têm divisor comum além de 1: a fração é irredutível.`],
  });
}

const SUM_DENS = [2, 3, 4, 5, 6, 8, 10];
function missingGen(r: Rand) {
  for (;;) {
    const b = r.pick(SUM_DENS);
    const d = r.pick(SUM_DENS.filter((x) => x !== b));
    const a = r.int(1, b - 1);
    const c = r.int(1, d - 1);
    if (gcd(a, b) !== 1 || gcd(c, d) !== 1) continue;
    const [sn, sd] = addFrac(a, b, c, d);
    if (sn >= sd) continue;
    const left = 1 - sn / sd;
    const ctx = r.pick([
      { t: 'Uma estrada está sendo pavimentada.', a: 'Na 1ª semana, a equipe fez', b: 'na 2ª semana, mais', of: 'do trecho', ask: 'Que fração do trecho ainda falta pavimentar?' },
      { t: 'Uma turma está pintando um mural.', a: 'Na segunda-feira, pintou', b: 'na terça, mais', of: 'do mural', ask: 'Que fração do mural ainda falta pintar?' },
      { t: 'Um tanque está sendo enchido.', a: 'Na 1ª hora, encheu-se', b: 'na 2ª hora, mais', of: 'do tanque', ask: 'Que fração do tanque ainda falta encher?' },
    ]);
    return draftNumeric({
      prompt: [p(`${ctx.t} ${ctx.a} ${a}/${b} ${ctx.of}; ${ctx.b} ${c}/${d} ${ctx.of}.`)],
      ask: `${ctx.ask} (fração ou decimal)`,
      answer: left,
      placeholder: 'ex.: 7/20',
      wrong: [
        { value: sn / sd, feedback: `Essa é a parte já feita (${a}/${b} + ${c}/${d}). A pergunta é quanto falta: 1 menos essa soma.` },
        { value: 1 - (a + c) / (b + d), feedback: 'Você somou os denominadores. Para somar frações, use um denominador comum (o MMC).' },
      ],
      hints: ['Some o que já foi feito usando um denominador comum.', `O MMC de ${b} e ${d} é ${lcm(b, d)}.`],
      solution: [`$[[${a}|${b}]] + [[${c}|${d}]] = [[${sn}|${sd}]]`, `$1 − [[${sn}|${sd}]] = [[${sd - sn}|${sd}]]`, `Faltam ${frac(sd - sn, sd)} ${ctx.of}.`],
    });
  }
}

function fractionOfFractionGen(r: Rand) {
  const [a, b] = r.pick(PROPER);
  const [c, d] = r.pick(PROPER);
  const n = a * c;
  const m = b * d;
  const A = f([a, b]);
  const C = f([c, d]);
  const ctx = r.pick([
    { t: `${A} de um sítio são usados para plantio, e ${C} da área de plantio é de milho.`, ask: 'Que fração do sítio é ocupada pelo milho?', part: 'da área de plantio' },
    { t: `${A} de uma turma foi a um passeio, e ${C} dos que foram levaram lanche.`, ask: 'Que fração da turma foi ao passeio e levou lanche?', part: 'dos que foram ao passeio' },
    { t: `${A} do orçamento de uma escola foi para a reforma, e ${C} do valor da reforma foi gasto com tinta.`, ask: 'Que fração do orçamento foi gasta com tinta?', part: 'do valor da reforma' },
  ]);
  return draftNumeric({
    prompt: [p(ctx.t)],
    ask: `${ctx.ask} (fração ou decimal)`,
    answer: n / m,
    placeholder: 'ex.: 1/4',
    wrong: [
      { value: c / d, feedback: `${C} é a fração ${ctx.part}, não do todo. Uma fração de uma fração é uma multiplicação.` },
      { value: (a + c) / (b + d), feedback: 'Somar numeradores e denominadores não tem significado aqui. "Fração de fração" é multiplicação.' },
    ],
    hints: ['A segunda fração é de uma parte, não do todo: é uma fração de fração.', 'Multiplique: numerador × numerador e denominador × denominador.'],
    solution: [`$[[${c}|${d}]] × [[${a}|${b}]] = [[${n}|${m}]]${frac(n, m) !== `${n}/${m}` ? ` = ${frac(n, m)}` : ''}`],
  });
}

function remainderMoneyGen(r: Rand) {
  for (;;) {
    const fa = r.pick<[number, number]>([[1, 4], [1, 3], [2, 5], [1, 5], [3, 10]]);
    const fb = r.pick<[number, number]>([[1, 4], [1, 3], [1, 2], [2, 5], [3, 5]]);
    const total = r.pick([1200, 1800, 2400, 3000, 3600, 4800, 6000]);
    const left = total * (1 - fa[0] / fa[1]) * (1 - fb[0] / fb[1]);
    if (!Number.isInteger(Math.round(left * 1e6) / 1e6)) continue;
    const ctx = r.pick([
      { who: 'Júlia recebeu', what: 'de salário', a: 'gastou', b: 'com aluguel e', c: 'do que sobrou com mercado' },
      { who: 'Uma escola recebeu', what: 'de verba', a: 'usou', b: 'em material e', c: 'do restante em passeios' },
      { who: 'Um clube arrecadou', what: 'numa rifa', a: 'usou', b: 'para pagar o som da festa e', c: 'do que restou em decoração' },
    ]);
    return draftNumeric({
      prompt: [p(`${ctx.who} ${brl(total)} ${ctx.what}: ${ctx.a} ${f(fa)} ${ctx.b} ${f(fb)} ${ctx.c}.`)],
      ask: 'Quantos reais sobraram?',
      prefix: 'R$',
      answer: left,
      wrong: [
        { value: total * (1 - fa[0] / fa[1] - fb[0] / fb[1]), feedback: `Você aplicou ${f(fb)} ao valor inteiro. Mas é ${f(fb)} do que SOBROU depois da 1ª despesa.` },
        { value: total * (1 - fa[0] / fa[1]), feedback: 'Esse é o valor depois só da primeira despesa. Falta tirar a segunda.' },
      ],
      hints: [`Depois da 1ª despesa, sobra ${frac(fa[1] - fa[0], fa[1])} do valor.`, `A 2ª despesa é ${f(fb)} desse restante: sobra ${frac(fb[1] - fb[0], fb[1])} dele.`],
      solution: [
        `Depois da 1ª despesa: ${brl(total)} × ${frac(fa[1] - fa[0], fa[1])} = ${brl(total * (1 - fa[0] / fa[1]))}.`,
        `Depois da 2ª: ${brl(total * (1 - fa[0] / fa[1]))} × ${frac(fb[1] - fb[0], fb[1])} = ${brl(left)}.`,
      ],
    });
  }
}

function wholeFromPartGen(r: Rand) {
  const [a, b] = r.pick<[number, number]>([[2, 5], [3, 8], [3, 4], [2, 3], [5, 6], [4, 7], [3, 10], [5, 12]]);
  const unit = r.int(2, 12) * (r.pick([1, 5, 10]));
  const whole = unit * b;
  const part = unit * a;
  const ctx = r.pick([
    { t: `${f([a, b])} dos ingressos de um show foram vendidos na pré-venda, o que corresponde a ${num(part)} ingressos.`, ask: 'Quantos ingressos o show tem ao todo?', unit: 'ingressos', prefix: undefined },
    { t: `Uma família já pagou ${f([a, b])} do valor de uma geladeira, o que dá ${brl(part)}.`, ask: 'Qual é o preço total da geladeira?', unit: undefined, prefix: 'R$' },
    { t: `Um ciclista já percorreu ${num(part)} km, que são ${f([a, b])} do percurso.`, ask: 'Quantos quilômetros tem o percurso?', unit: 'km', prefix: undefined },
  ]);
  return draftNumeric({
    prompt: [p(ctx.t)],
    ask: ctx.ask,
    answer: whole,
    unit: ctx.unit,
    prefix: ctx.prefix,
    wrong: [
      { value: (part * a) / b, feedback: `Você calculou ${f([a, b])} da parte. O valor dado já É a parte; o todo é maior: parte ÷ ${f([a, b])}.` },
      { value: part * b, feedback: `Faltou dividir pelo numerador: se ${a} partes valem ${num(part)}, 1 parte vale ${num(part)} ÷ ${a}.` },
    ],
    hints: [`Se ${a} partes de ${b} valem ${num(part)}, quanto vale 1 parte?`, `Depois, multiplique por ${b} (o todo tem ${b} partes).`],
    solution: [`1 parte: ${num(part)} ÷ ${a} = ${num(unit)}.`, `Todo (${b} partes): ${num(unit)} × ${b} = ${num(whole)}.`, `$T = ${num(part)} ÷ [[${a}|${b}]] = ${num(whole)}`],
  });
}

function inverseStagesGen(r: Rand) {
  for (;;) {
    const fa = r.pick<[number, number]>([[1, 4], [1, 3], [2, 5], [1, 2], [3, 5]]);
    const fb = r.pick<[number, number]>([[1, 3], [1, 2], [2, 3], [3, 4], [1, 4]]);
    // Fração do trajeto que ainda falta, em inteiros: (1 − fa)(1 − fb) = sn/sd.
    const sn = (fa[1] - fa[0]) * (fb[1] - fb[0]);
    const sd = fa[1] * fb[1];
    const total = r.pick([120, 180, 240, 300, 360, 480, 600, 720]);
    const left = (total * sn) / sd;
    if (!Number.isInteger(left) || left < 5) continue;
    const afterFirst = (total * (fa[1] - fa[0])) / fa[1];
    return draftNumeric({
      prompt: [p(`Numa viagem, Rita percorreu ${f(fa)} do trajeto no 1º dia e ${f(fb)} do que faltava no 2º dia. Ainda faltam ${num(left)} km.`)],
      ask: 'Quantos quilômetros tem o trajeto inteiro?',
      unit: 'km',
      answer: total,
      wrong: [
        { value: afterFirst, feedback: 'Você desfez só o 2º dia: esse é o que faltava depois do 1º dia. O trajeto inteiro é maior.' },
        { value: (left * sn) / sd, feedback: `Você multiplicou os ${num(left)} km pela fração que falta. Os ${num(left)} km JÁ são a parte que falta: divida por ela.` },
      ],
      hints: [`Depois do 1º dia faltavam ${frac(fa[1] - fa[0], fa[1])} do trajeto; depois do 2º, falta ${frac(fb[1] - fb[0], fb[1])} disso.`, `Então ${num(left)} km correspondem a ${frac(sn, sd)} do trajeto.`],
      solution: [
        `Fração que falta: ${frac(fa[1] - fa[0], fa[1])} × ${frac(fb[1] - fb[0], fb[1])} = ${frac(sn, sd)} do trajeto.`,
        `$T = ${num(left)} ÷ ${frac(sn, sd)} = ${num(total)} km`,
      ],
    });
  }
}

const TAP_TIMES = [2, 3, 4, 5, 6, 8, 10, 12];
function twoTapsGen(r: Rand) {
  for (;;) {
    const a = r.pick(TAP_TIMES);
    const b = r.pick(TAP_TIMES.filter((x) => x !== a));
    const t = (a * b) / (a + b);
    if (Math.abs(t * 60 - Math.round(t * 60)) > 1e-9) continue;
    return draftNumeric({
      prompt: [p(`A torneira A, sozinha, enche um tanque vazio em ${a} h. A torneira B, sozinha, enche o mesmo tanque em ${b} h. As duas são abertas juntas, com o tanque vazio.`)],
      ask: 'Em quantos minutos o tanque fica cheio?',
      unit: 'min',
      answer: t * 60,
      wrong: [
        { value: ((a + b) / 2) * 60, feedback: 'Essa é a média dos tempos. Juntas, as torneiras se ajudam: o tempo é menor que o da mais rápida.' },
        { value: (a + b) * 60, feedback: 'Somar os tempos não faz sentido: some o que cada uma enche por hora.' },
        { value: t, feedback: `${num(t, 3)} é o tempo em HORAS. A pergunta pede minutos: multiplique por 60.` },
      ],
      hints: [`Em 1 hora, A enche 1/${a} do tanque e B enche 1/${b}.`, 'Some essas frações e inverta o resultado para obter o tempo.'],
      solution: [`$[[1|${a}]] + [[1|${b}]] = [[${a + b}|${a * b}]] do tanque por hora`, `$t = [[${a * b}|${a + b}]] h = ${num(t, 3)} h = ${num(t * 60)} min`],
    });
  }
}

function tapDrainGen(r: Rand) {
  for (;;) {
    const a = r.pick([2, 3, 4, 5, 6]);
    const b = r.pick([4, 6, 8, 10, 12].filter((x) => x > a));
    const t = (a * b) / (b - a);
    if (Math.abs(t * 60 - Math.round(t * 60)) > 1e-9 || t > 30) continue;
    const hours = Number.isInteger(t);
    const k = hours ? 1 : 60;
    return draftNumeric({
      prompt: [p(`Uma torneira enche um tanque vazio em ${a} h. Um ralo, sozinho, esvazia o tanque cheio em ${b} h. Por engano, a torneira e o ralo ficam abertos ao mesmo tempo, com o tanque inicialmente vazio.`)],
      ask: hours ? 'Em quantas horas o tanque fica cheio?' : 'Em quantos minutos o tanque fica cheio?',
      unit: hours ? 'h' : 'min',
      answer: t * k,
      wrong: [
        { value: (b - a) * k, feedback: 'Subtrair os tempos não funciona. Subtraia as frações por hora: o que entra menos o que sai.' },
        { value: ((a * b) / (a + b)) * k, feedback: 'Você somou a vazão do ralo como se ele também enchesse. O ralo tira água: a vazão dele subtrai.' },
      ],
      hints: [`Por hora: entra 1/${a} do tanque e sai 1/${b}.`, 'O saldo por hora é a diferença; o tempo é 1 ÷ saldo.'],
      solution: [
        `$[[1|${a}]] − [[1|${b}]] = [[${b - a}|${a * b}]] do tanque por hora`,
        hours ? `$t = [[${a * b}|${b - a}]] = ${num(t)} h` : `$t = [[${a * b}|${b - a}]] h = ${hm(t)} = ${num(t * 60)} min`,
      ],
    });
  }
}

// ———————————————————————————————————————————————— aula

export const FRACOES = lesson({
  id: 'fracoes',
  topic: 'basica',
  subtopics: ['fracoes'],
  title: 'Frações',
  summary:
    'Partes de um todo, equivalência, comparação e as quatro operações — até os problemas de etapas sucessivas, de "descobrir o todo" e de torneiras que o ENEM adora.',
  requires: [],
  stages: [
    stage('partes-do-todo', 'descoberta', 'Partes iguais de um todo', 'Ler e representar uma fração como partes iguais de um todo, calcular o que sobra e passar a fração para decimal e porcentagem.', () => ({
      learn: [
        text('Uma fração responde a duas perguntas: **em quantas partes iguais** o todo foi dividido (o **denominador**, embaixo) e **quantas dessas partes** estamos considerando (o **numerador**, em cima).'),
        lab({
          title: 'Fatias de pizza',
          intro: 'Mude o número de fatias e quantas estão destacadas. Observe a fração, o decimal e quanto falta para o inteiro.',
          params: [
            { key: 'd', label: 'Partes iguais', min: 2, max: 12, step: 1, value: 4, format: (v) => `${v} partes` },
            { key: 'n', label: 'Partes destacadas', min: 0, max: 12, step: 1, value: 1, format: (v) => `${v}` },
          ],
          readouts: ({ n, d }) => [
            { label: 'Fração', value: `${n}/${d}`, big: true, tone: 'brass' },
            { label: 'Decimal', value: num(n / d, 3) },
            { label: 'Porcentagem', value: pct((100 * n) / d, 1) },
            { label: 'Falta para 1 inteiro', value: n <= d ? `${d - n}/${d}` : 'já passou de 1 inteiro' },
          ],
          viz: ({ n, d }) => ({ kind: 'fraction', parts: d, filled: n, shape: 'pie', wholes: Math.max(1, Math.ceil(n / d)), summary: `${n} de ${d} partes iguais destacadas` }),
          goal: {
            task: 'Uma pizza de 8 fatias: João comeu 3 e Maria comeu 2. Mostre a fração da pizza que sobrou.',
            done: ({ n, d }) => d === 8 && n === 3,
            success: 'Isso: sobraram 8 − 3 − 2 = 3 fatias de 8, ou seja, 3/8 da pizza.',
          },
          insight: 'O mesmo número de partes destacadas vale menos quando o todo é dividido em mais partes: 3/8 é menor que 3/4.',
        }),
        math('fração = [[partes consideradas|partes iguais do todo]]'),
        key('As partes precisam ser iguais', 'Se uma barra for dividida em 4 pedaços de tamanhos diferentes, pegar 1 deles não é necessariamente 1/4 da barra. Fração pressupõe partes de **mesmo tamanho**.'),
        example('Que fração dos jogos foi de derrotas?', 'Um time disputou 15 jogos no campeonato: venceu 7, empatou 3 e perdeu os demais.', [
          askStep('Toda fração começa pelo todo.', 'Quem é o todo aqui?', [
            ok('Os 15 jogos disputados'),
            no('As 7 vitórias', 'As vitórias são uma parte, não o todo. O todo é o total de jogos.'),
            no('Os 8 jogos que não foram vitória', 'Isso é uma parte. A pergunta compara as derrotas com todos os jogos disputados.'),
          ]),
          step('Derrotas = total − vitórias − empates.', '15 − 7 − 3 = 5 derrotas'),
          askStep('Agora é só montar a fração: parte sobre todo.', 'Qual é a fração de derrotas?', [
            ok('5/15, que simplificada dá 1/3'),
            no('5/10', 'Você comparou as derrotas com vitórias e empates (10 jogos). A base da fração é o total: 15.'),
            no('5/7', 'Isso compara derrotas com vitórias — é outra razão. A pergunta pede a fração do total de jogos.'),
          ], '[[5|15]] = [[1|3]]'),
        ], '1/3 dos jogos foram derrotas: um em cada três.'),
        warn('Parte de quê?', 'Toda fração tem uma base. 5/15 compara derrotas com o total; 5/7 compararia derrotas com vitórias. Antes de calcular, pergunte: **fração de quê?**'),
        check(choice({
          prompt: [p('Uma barra de chocolate tem 12 quadradinhos iguais. Ana comeu 4 e Bia comeu 3.')],
          ask: 'Que fração da barra sobrou?',
          options: [
            ok('5/12'),
            no('7/12', 'Essa é a fração comida (4 + 3 = 7). Sobrou o resto: 12 − 7 = 5 quadradinhos.'),
            no('5/7', 'Você comparou o que sobrou com o que foi comido. A base é a barra inteira, 12 quadradinhos.'),
            no('1/3', '1/3 = 4/12 é só a parte que Ana comeu.'),
          ],
          solution: ['Comidos: 4 + 3 = 7 de 12.', 'Sobraram 12 − 7 = 5 quadradinhos.', '$[[5|12]] da barra'],
          verify: () => 5 / 12,
        })),
        text('Fração também é **divisão**: a/b = a ÷ b. Por isso toda fração vira número decimal (3/4 = 0,75) e porcentagem (0,75 = 75%). O ENEM mistura as três formas no mesmo problema.'),
        reveal('Uma balança só mostra números decimais. Como pesar 3/8 de grama?', '3 ÷ 8 = 0,375 g. Atalho: 1/8 = 0,125 (metade de 0,25); então 3/8 = 3 × 0,125 = 0,375.'),
        compare([
          { title: 'Fração', tone: 'brass', lines: ['1/2', '1/4', '3/4', '1/5', '1/8'] },
          { title: 'Decimal', tone: 'sky', lines: ['0,5', '0,25', '0,75', '0,2', '0,125'] },
          { title: 'Porcentagem', tone: 'verdigris', lines: ['50%', '25%', '75%', '20%', '12,5%'] },
        ], 'Três jeitos de escrever a mesma parte'),
        check(choice({
          prompt: [p('Numa reta numérica, os pontos 0, P e 1 estão nessa ordem, e a distância de P até 1 é o triplo da distância de 0 até P.')],
          ask: 'Que fração o ponto P representa?',
          options: [
            ok('1/4'),
            no('1/3', 'Com P = 1/3, a distância até 1 seria 2/3: o dobro, não o triplo.'),
            no('3/4', '3/4 é a distância de P até 1. O ponto P fica a 1/4 do zero.'),
            no('1/2', 'No meio da reta, as duas distâncias seriam iguais.'),
          ],
          solution: ['Se a distância de 0 até P é x, a de P até 1 é 3x — e juntas formam a unidade.', '$x + 3x = 1 → x = [[1|4]]'],
          verify: () => 0.25,
        })),
      ],
      practice: [
        choice({
          prompt: [p('Uma torta foi cortada em 10 fatias iguais. Na festa, comeram 4 fatias e levaram 3 para viagem.')],
          ask: 'Que fração da torta ficou na travessa?',
          options: [
            ok('3/10'),
            no('7/10', 'Essa é a parte que saiu da travessa (4 + 3). Ficaram 10 − 7 = 3 fatias.'),
            no('3/7', 'Você comparou o que ficou com o que saiu. A base é a torta inteira: 10 fatias.'),
            no('4/10', '4 fatias foram comidas — a pergunta é o que ficou.'),
          ],
          hints: ['Comece pelo todo: em quantas fatias a torta foi dividida?', 'Do total, tire as fatias comidas e as levadas.'],
          solution: ['Saíram 4 + 3 = 7 fatias de 10.', 'Ficaram 10 − 7 = 3.', '$[[3|10]]'],
          verify: () => 3 / 10,
        }),
        gen(leftoverGen),
        gen(toPercentGen),
        numeric({
          ask: 'Escreva 5/8 em número decimal.',
          answer: 0.625,
          tolerance: 0.0005,
          placeholder: 'ex.: 0,5',
          wrong: [
            { value: 5.8, feedback: 'Não se juntam os algarismos: 5/8 é a divisão 5 ÷ 8.' },
            { value: 1.6, feedback: 'Você calculou 8 ÷ 5. O numerador (5) é dividido pelo denominador (8).' },
            { value: 0.58, feedback: 'Não basta pôr os algarismos depois da vírgula: faça a divisão 5 ÷ 8.' },
          ],
          hints: ['Fração é divisão: 5 ÷ 8.', '1/8 = 0,125; então 5/8 = 5 × 0,125.'],
          solution: ['$5 ÷ 8 = 0,625', 'Conferência: 5 × 0,125 = 0,625.'],
        }),
      ],
      challenge: [
        choice({
          prompt: [p('Numa turma de 40 estudantes, 12 vão de ônibus para a escola, 10 vão de bicicleta e os demais vão a pé.')],
          ask: 'Que fração da turma vai a pé?',
          options: [
            ok('9/20'),
            no('11/20', 'Essa é a fração dos que vão de ônibus ou de bicicleta (22 de 40).'),
            no('3/10', '3/10 = 12/40 é a fração dos que vão de ônibus.'),
            no('9/11', 'Você comparou os que vão a pé (18) com os que não vão (22). A base é a turma inteira.'),
          ],
          solution: ['A pé: 40 − 12 − 10 = 18 estudantes.', '$[[18|40]] = [[9|20]]'],
          verify: () => 18 / 40,
        }),
        numeric({
          prompt: [p('Um ônibus faz o trajeto entre dois bairros em 45 minutos.')],
          ask: 'Que fração de uma hora são 45 minutos? (fração ou decimal)',
          answer: 0.75,
          placeholder: 'ex.: 1/2',
          wrong: [
            { value: 0.45, feedback: 'Uma hora tem 60 minutos, não 100: 45 minutos são 45/60 da hora, não 0,45.' },
            { value: 4 / 3, feedback: 'Você inverteu: 60/45. A parte (45 min) vai em cima e o todo (60 min) embaixo.' },
          ],
          solution: ['$[[45|60]] = [[3|4]] = 0,75 hora'],
        }),
        gen(toPercentGen),
        gen(leftoverGen),
      ],
      recap: [
        'Denominador: em quantas partes iguais o todo foi dividido. Numerador: quantas partes estão sendo consideradas.',
        'O que sobra é o todo menos as partes usadas: 1 − 5/8 = 3/8.',
        'Fração é divisão: a/b = a ÷ b — vira decimal e porcentagem (3/8 = 0,375 = 37,5%).',
        'Sempre pergunte "fração de quê?": a base muda o resultado.',
      ],
    })),

    stage('equivalencia', 'fundamentos', 'Equivalência, simplificação e comparação', 'Simplificar frações, reconhecer frações equivalentes e decidir qual de duas frações é maior, sem cair no "denominador maior é maior".', () => ({
      learn: [
        text('Duas frações são **equivalentes** quando representam a mesma quantidade. Multiplicar (ou dividir) numerador e denominador pelo **mesmo número** não muda a fração: só corta cada parte em pedaços menores (ou junta pedaços).'),
        math('[[3|4]] = [[3 × 2|4 × 2]] = [[6|8]] = [[9|12]]'),
        lab({
          title: 'Comparador de frações',
          intro: 'Monte duas frações, A e B, e compare. As barras mostram o tamanho de cada uma em relação ao inteiro.',
          params: [
            { key: 'n1', label: 'A: numerador', min: 1, max: 12, step: 1, value: 3, format: (v) => `${v}` },
            { key: 'd1', label: 'A: denominador', min: 2, max: 12, step: 1, value: 4, format: (v) => `${v}` },
            { key: 'n2', label: 'B: numerador', min: 1, max: 12, step: 1, value: 5, format: (v) => `${v}` },
            { key: 'd2', label: 'B: denominador', min: 2, max: 12, step: 1, value: 8, format: (v) => `${v}` },
          ],
          readouts: ({ n1, d1, n2, d2 }) => {
            const m = lcm(d1, d2);
            const cmp = n1 * d2 === n2 * d1 ? 'A = B (equivalentes)' : n1 * d2 > n2 * d1 ? 'A > B' : 'A < B';
            return [
              { label: 'A', value: `${n1}/${d1} ≈ ${num(n1 / d1, 3)}` },
              { label: 'B', value: `${n2}/${d2} ≈ ${num(n2 / d2, 3)}` },
              { label: 'Comparação', value: cmp, big: true, tone: 'brass' },
              { label: `Com denominador ${m}`, value: `${(n1 * m) / d1}/${m} e ${(n2 * m) / d2}/${m}` },
            ];
          },
          viz: ({ n1, d1, n2, d2 }) => ({
            kind: 'bars',
            bars: [
              { label: `A = ${n1}/${d1}`, value: n1 / d1, tone: 'brass', text: num(n1 / d1, 3) },
              { label: `B = ${n2}/${d2}`, value: n2 / d2, tone: 'sky', text: num(n2 / d2, 3) },
            ],
            max: Math.max(1, n1 / d1, n2 / d2),
            refLine: { value: 1, label: '1 inteiro' },
            summary: `A vale ${num(n1 / d1, 3)} e B vale ${num(n2 / d2, 3)}`,
          }),
          goal: {
            task: 'Monte em B uma fração equivalente a A, mas com outro denominador.',
            done: ({ n1, d1, n2, d2 }) => n1 * d2 === n2 * d1 && d1 !== d2,
            success: 'Equivalentes: as barras têm exatamente o mesmo tamanho, mesmo com números diferentes.',
          },
          insight: 'Para comparar com segurança, reescreva as duas com o mesmo denominador: aí basta comparar os numeradores.',
        }),
        key('Simplificar', 'Divida numerador e denominador por um divisor comum até não sobrar nenhum (além de 1). O resultado é a fração **irredutível**: 18/24 → 9/12 → 3/4. Dividir pelo MDC (aqui, 6) chega lá de uma vez.'),
        example('Quem está em 3º lugar?', [
          p('Cinco equipes de uma gincana tinham a mesma meta. Ao fim do 1º dia, cada uma havia cumprido a fração da meta indicada na tabela.'),
          table(['Equipe', 'Fração da meta'], [['Sol', '5/6'], ['Lua', '3/4'], ['Mar', '2/3'], ['Rio', '7/12'], ['Céu', '1/2']]),
        ], [
          askStep('Os denominadores são diferentes (6, 4, 3, 12 e 2).', 'Qual é o primeiro passo?', [
            ok('Reescrever todas com o mesmo denominador, 12'),
            no('Comparar só os numeradores: 7 é o maior', 'Numeradores só se comparam quando os pedaços têm o mesmo tamanho. 7/12 são 7 pedaços pequenos.'),
            no('Comparar os denominadores: quanto maior, maior a fração', 'É o contrário: denominador maior significa pedaços menores. 1/12 é menor que 1/2.'),
          ]),
          step('Com denominador 12 (o MMC de 6, 4, 3, 12 e 2):', 'Sol [[10|12]] · Lua [[9|12]] · Mar [[8|12]] · Rio [[7|12]] · Céu [[6|12]]'),
          step('Agora é só ordenar os numeradores: 10 > 9 > 8 > 7 > 6.', '1º Sol · 2º Lua · 3º Mar'),
        ], '3º lugar: Mar, com 2/3 da meta.'),
        warn('Denominador maior não é fração maior', '1/8 de uma pizza é menos do que 1/4 dela: com mais divisões, cada pedaço fica menor. Só compare numeradores quando os denominadores forem iguais.'),
        strategy('Multiplicação cruzada', 'Para comparar a/b com c/d (denominadores positivos), compare a × d com c × b. Ex.: 5/8 ou 3/5? 5 × 5 = 25 e 3 × 8 = 24; como 25 > 24, 5/8 > 3/5.'),
        check(order({
          ask: 'Coloque as frações em ordem crescente (da menor para a maior).',
          steps: ['1/2', '7/12', '2/3', '3/4', '5/6'],
          solution: ['Com denominador 12: 6/12, 7/12, 8/12, 9/12 e 10/12.'],
          why: 'Reescreva tudo em doze avos e compare os numeradores.',
        })),
        text('Porcentagens e decimais também viram frações: escreva sobre 100 (ou 1.000) e simplifique. 62,5% = 62,5/100 = 625/1.000 = 5/8.'),
        check(choice({
          ask: 'Um reservatório está com 37,5% da capacidade. Que fração irredutível representa esse nível?',
          options: [
            ok('3/8'),
            no('37/5', 'A vírgula não separa numerador e denominador: 37,5% = 37,5/100.'),
            no('3/5', '3/5 = 60%. Confira: 37,5/100 = 375/1.000; dividindo por 125, dá 3/8.'),
            no('375/100', 'Essa fração vale 3,75 (375%). O correto é 37,5/100 = 375/1.000 = 3/8.'),
          ],
          solution: ['$37,5% = [[37,5|100]] = [[375|1.000]]', '$[[375 ÷ 125|1.000 ÷ 125]] = [[3|8]]'],
          verify: () => 0.375,
        })),
      ],
      practice: [
        gen(irreducibleGen),
        classify({
          ask: 'Cada fração é maior ou menor que 1/2?',
          bins: ['Menor que 1/2', 'Maior que 1/2'],
          items: [
            { text: '3/7', bin: 0, why: 'O dobro do numerador (6) é menor que o denominador (7).' },
            { text: '5/9', bin: 1, why: 'O dobro do numerador (10) passa do denominador (9).' },
            { text: '4/10', bin: 0, why: '4/10 = 0,4.' },
            { text: '6/11', bin: 1, why: '12 > 11: passa da metade.' },
            { text: '7/15', bin: 0, why: '14 < 15: não chega à metade.' },
            { text: '9/16', bin: 1, why: '18 > 16.' },
          ],
          hints: ['Metade de um denominador d é d/2.', 'Compare o dobro do numerador com o denominador.'],
          solution: ['Uma fração a/b é maior que 1/2 quando 2a > b.'],
        }),
        choice({
          ask: 'Qual destas frações é a maior?',
          options: [
            ok('2/3'),
            no('5/8', '5/8 = 0,625, um pouco menor que 2/3 ≈ 0,667.'),
            no('3/5', '3/5 = 0,6, menor que 2/3 ≈ 0,667 (e que 5/8).'),
            no('7/12', '7 é o maior numerador, mas os pedaços são de 1/12: 7/12 ≈ 0,583.'),
            no('4/7', '4/7 ≈ 0,571: a menor das cinco.'),
          ],
          hints: ['Converta para decimal ou use um denominador comum.', 'Compare cada uma com 2/3 ≈ 0,667 pela multiplicação cruzada.'],
          solution: ['Em decimal: 2/3 ≈ 0,667; 5/8 = 0,625; 3/5 = 0,6; 7/12 ≈ 0,583; 4/7 ≈ 0,571.'],
          verify: () => 2 / 3,
        }),
        numeric({
          ask: 'Escreva 0,45 como fração irredutível. Qual é o denominador dessa fração?',
          answer: 20,
          wrong: [
            { value: 100, feedback: '45/100 ainda pode ser simplificada: numerador e denominador são divisíveis por 5.' },
            { value: 9, feedback: '9 é o numerador. O denominador é 20: 0,45 = 45/100 = 9/20.' },
          ],
          hints: ['0,45 = 45/100.', 'Divida 45 e 100 pelo MDC deles, 5.'],
          solution: ['$0,45 = [[45|100]] = [[9|20]]', 'Denominador: 20.'],
        }),
      ],
      challenge: [
        choice({
          prompt: [p('Numa corrida, a tabela mostra que fração do percurso cada corredor já completou.'), table(['Corredor', 'Fração do percurso'], [['Ana', '3/5'], ['Bia', '5/8'], ['Caio', '7/10'], ['Davi', '2/3'], ['Eva', '11/20']])],
          ask: 'Quem está em 2º lugar?',
          options: [
            ok('Davi'),
            no('Caio', 'Caio, com 7/10 = 0,7, está em 1º lugar.'),
            no('Bia', 'Bia tem 5/8 = 0,625, menos que 2/3 ≈ 0,667: ela é a 3ª.'),
            no('Eva', '11 é o maior numerador, mas 11/20 = 0,55 é a menor fração da tabela.'),
            no('Ana', 'Ana tem 3/5 = 0,6: está em 4º lugar.'),
          ],
          solution: ['Em decimal: Caio 0,7; Davi ≈ 0,667; Bia 0,625; Ana 0,6; Eva 0,55.', '2º lugar: Davi.'],
        }),
        numeric({
          ask: 'Escreva 12,5% como fração irredutível. Qual é o denominador?',
          answer: 8,
          wrong: [
            { value: 1000, feedback: '125/1.000 ainda pode ser simplificada (por 125).' },
            { value: 100, feedback: '12,5/100 tem vírgula no numerador: multiplique em cima e embaixo por 10 e simplifique.' },
          ],
          solution: ['$12,5% = [[12,5|100]] = [[125|1.000]] = [[1|8]]'],
        }),
        gen(irreducibleGen),
        choice({
          ask: 'Qual das frações abaixo é equivalente a 6/15?',
          options: [
            ok('14/35'),
            no('3/5', 'Você dividiu o numerador por 2 e o denominador por 3: números diferentes mudam a fração. 6/15 = 2/5 (dividindo os dois por 3).'),
            no('6/10', 'Mudar só o denominador muda a fração. 6/15 = 0,4 e 6/10 = 0,6.'),
            no('8/17', 'Somar 2 em cima e embaixo não mantém a fração: 8/17 ≈ 0,47, e 6/15 = 0,4.'),
          ],
          solution: ['$[[6|15]] = [[2|5]] = [[2 × 7|5 × 7]] = [[14|35]]'],
          verify: () => 0.4,
        }),
      ],
      recap: [
        'Frações equivalentes: multiplique ou divida numerador e denominador pelo mesmo número.',
        'Irredutível: sem divisor comum além de 1 — divida pelo MDC.',
        'Para comparar: mesmo denominador (MMC) ou multiplicação cruzada. Denominador maior = pedaços menores.',
        'Porcentagem e decimal viram fração sobre 100 ou 1.000: 62,5% = 625/1.000 = 5/8.',
      ],
    })),

    stage('operacoes', 'fundamentos', 'As quatro operações com frações', 'Somar, subtrair, multiplicar e dividir frações e números mistos, sabendo por que cada regra funciona.', () => ({
      learn: [
        text('Para **somar ou subtrair**, os pedaços precisam ter o mesmo tamanho: reescreva as frações com um denominador comum (o MMC dos denominadores) e só então some ou subtraia os numeradores.'),
        example('Quanto falta do muro?', 'No 1º dia, uma equipe construiu 2/5 de um muro. No 2º dia, construiu mais 1/4 do muro.', [
          askStep('Para somar 2/5 com 1/4, os pedaços precisam ser do mesmo tamanho.', 'Qual denominador comum usar?', [
            ok('20, o MMC de 5 e 4'),
            no('9, a soma de 5 e 4', 'Somar denominadores não produz pedaços de mesmo tamanho. Precisamos de um múltiplo comum de 5 e 4.'),
            no('5, o maior dos dois', '1/4 não pode ser escrito em quintos com numerador inteiro. O denominador comum precisa ser múltiplo de 5 e de 4.'),
          ]),
          step('Reescrevendo: 2/5 = 8/20 e 1/4 = 5/20.', '[[8|20]] + [[5|20]] = [[13|20]] do muro'),
          step('O muro inteiro é 20/20. Falta:', '[[20|20]] − [[13|20]] = [[7|20]]'),
        ], 'Faltam 7/20 do muro.'),
        warn('Não some os denominadores', '1/2 + 1/3 não é 2/5 — repare que 2/5 é menor que 1/2 sozinho! O certo é 3/6 + 2/6 = 5/6.'),
        text('Para **multiplicar**, multiplique numerador por numerador e denominador por denominador. A palavra **"de"** costuma indicar multiplicação: 3/8 **de** 2/3 do terreno = 3/8 × 2/3 = 6/24 = 1/4 do terreno.'),
        lab({
          title: 'Fração de fração (modelo de área)',
          intro: 'O quadrado é o terreno inteiro. As faixas horizontais mostram a 1ª fração; dentro delas, as colunas mostram a 2ª. A parte dourada é a fração da fração.',
          params: [
            { key: 'i', label: '1ª fração (do todo)', min: 0, max: PROPER.length - 1, step: 1, value: 2, format: (v) => f(PROPER[v]) },
            { key: 'j', label: '2ª fração (da 1ª)', min: 0, max: PROPER.length - 1, step: 1, value: 4, format: (v) => f(PROPER[v]) },
          ],
          readouts: ({ i, j }) => {
            const [a, b] = PROPER[i];
            const [c, d] = PROPER[j];
            return [
              { label: 'Cálculo', value: `${c}/${d} × ${a}/${b} = ${a * c}/${b * d}` },
              { label: 'Fração do todo', value: frac(a * c, b * d), big: true, tone: 'brass' },
              { label: 'Decimal', value: num((a * c) / (b * d), 3) },
            ];
          },
          viz: ({ i, j }) => {
            const [a, b] = PROPER[i];
            const [c, d] = PROPER[j];
            const cells = Array.from({ length: b * d }, (_, k) => {
              const row = Math.floor(k / d);
              const col = k % d;
              return row < a ? (col < c ? ('brass' as const) : ('sky' as const)) : null;
            });
            return {
              kind: 'grid',
              rows: b,
              cols: d,
              cells,
              legend: [{ tone: 'sky', label: `${a}/${b} do todo` }, { tone: 'brass', label: `${c}/${d} dessa parte` }],
              summary: `${a * c} de ${b * d} quadradinhos: ${frac(a * c, b * d)} do todo`,
            };
          },
          goal: {
            task: 'Encontre duas frações cujo produto seja exatamente 1/4 — sem usar a fração 1/4.',
            done: ({ i, j }) => {
              const [a, b] = PROPER[i];
              const [c, d] = PROPER[j];
              return 4 * a * c === b * d && !(a === 1 && b === 4) && !(c === 1 && d === 4);
            },
            success: 'Isso! Por exemplo, 1/2 × 1/2 = 1/4 e 3/8 × 2/3 = 6/24 = 1/4.',
          },
          insight: 'Quando as duas frações são menores que 1, o resultado é menor que cada uma: pegar uma parte de uma parte diminui.',
        }),
        text('Para **dividir** por uma fração, multiplique pelo inverso dela: a ÷ (b/c) = a × (c/b). A ideia é "quantas vezes cabe": 1/4 cabe 4 vezes em 1, então cabe 12 vezes em 3.'),
        math('3 ÷ [[1|4]] = 3 × 4 = 12', '[[3|4]] ÷ [[3|8]] = [[3|4]] × [[8|3]] = 2'),
        check(numeric({
          prompt: [p('Marcela tem 2 litros de suco e vai servir em copos de 1/4 de litro, sempre cheios.')],
          ask: 'Quantos copos ela consegue encher?',
          answer: 8,
          unit: 'copos',
          wrong: [{ value: 0.5, feedback: 'Você multiplicou 2 × 1/4. Para saber quantos copos cabem, divida: 2 ÷ 1/4 = 2 × 4 = 8.' }],
          solution: ['$2 ÷ [[1|4]] = 2 × 4 = 8 copos'],
        })),
        key('Números mistos', '2 1/2 significa 2 + 1/2 = 5/2. Para operar, transforme em fração: inteiro × denominador + numerador, sobre o denominador. Ex.: 3 3/4 = (3 × 4 + 3)/4 = 15/4.'),
        check(fill({
          ask: 'Complete a divisão.',
          parts: ['[[3|4]] ÷ [[2|5]] = [[3|4]] × ', { options: ['[[5|2]]', '[[2|5]]', '[[4|3]]'], answer: 0 }, ' = ', { options: ['[[15|8]]', '[[6|20]]', '[[8|15]]'], answer: 0 }],
          solution: ['Inverta só o divisor (a segunda fração): 2/5 vira 5/2.', '$[[3|4]] × [[5|2]] = [[15|8]]'],
          why: 'Dividir por uma fração é multiplicar pelo inverso do divisor.',
        })),
        key('Fração de uma quantidade', 'Para calcular 3/5 de 40, divida pelo denominador e multiplique pelo numerador: 40 ÷ 5 × 3 = 24. Se a quantidade se divide em dois grupos e um deles é 3/5, o outro é 1 − 3/5 = 2/5.'),
        check(numeric({
          prompt: [p('Uma escola tem 56 professores. Três oitavos deles dão aula de manhã; os demais, à tarde.')],
          ask: 'Quantos professores dão aula à tarde?',
          answer: 35,
          wrong: [
            { value: 21, feedback: '21 são os professores da manhã (3/8 de 56). Os da tarde são o restante: 5/8 de 56.' },
            { value: 7, feedback: '7 é 1/8 de 56. Os da tarde são 5/8: 5 × 7 = 35.' },
          ],
          solution: ['Tarde: 1 − 3/8 = 5/8 dos professores.', '$56 ÷ 8 × 5 = 7 × 5 = 35'],
        })),
        check(numeric({
          prompt: [p('Uma produtora tem 3,5 L de suco e vai encher garrafas de 2/3 de litro. Só garrafas completamente cheias serão vendidas.')],
          ask: 'Quantas garrafas ela consegue vender?',
          unit: 'garrafas',
          answer: 5,
          wrong: [
            { value: 6, feedback: '3,5 ÷ 2/3 = 5,25: a sexta garrafa ficaria incompleta. Só contam as cheias.' },
            { value: 5.25, feedback: '5,25 é o quociente; garrafas se contam inteiras e só as cheias valem: 5.' },
            { value: 7 / 3, feedback: 'Você multiplicou 3,5 × 2/3. Para saber quantas cabem, divida: 3,5 ÷ 2/3.' },
          ],
          solution: ['$3,5 ÷ [[2|3]] = [[7|2]] × [[3|2]] = [[21|4]] = 5,25', 'Só garrafas cheias contam: 5 (o resto não enche outra garrafa).'],
        })),
      ],
      practice: [
        gen(missingGen),
        gen(fractionOfFractionGen),
        numeric({
          prompt: [p('Uma apicultora tem 4 1/2 litros de mel e vai enchê-los em potes de 3/4 de litro.')],
          ask: 'Quantos potes ela consegue encher completamente?',
          answer: 6,
          unit: 'potes',
          wrong: [{ value: 3.375, feedback: 'Você multiplicou 4,5 × 3/4. Para saber quantos potes cabem, divida o mel pelo tamanho do pote.' }],
          hints: ['4 1/2 = 9/2.', 'Quantas vezes 3/4 cabe em 9/2? Divida: 9/2 ÷ 3/4.'],
          solution: ['$[[9|2]] ÷ [[3|4]] = [[9|2]] × [[4|3]] = [[36|6]] = 6 potes'],
        }),
        spot({
          ask: 'Em qual linha está o erro desta resolução?',
          lines: ['$[[1|2]] + [[2|3]]', '$= [[3|6]] + [[4|6]]', '$= [[7|12]]', '$≈ 0,583'],
          wrong: 2,
          why: 'Com o mesmo denominador, somam-se só os numeradores: 3/6 + 4/6 = 7/6. O denominador indica o tamanho dos pedaços — ele não muda.',
          hints: ['Confira cada passagem: as frações reescritas são equivalentes às originais?', 'Ao somar sextos com sextos, o resultado é em sextos.'],
          solution: ['$[[1|2]] + [[2|3]] = [[3|6]] + [[4|6]] = [[7|6]]'],
        }),
      ],
      challenge: [
        numeric({
          prompt: [p('Uma corda tem 6 m. Dela serão cortados 3 pedaços de 5/4 m e 2 pedaços de 3/5 m. Despreze perdas nos cortes.')],
          ask: 'Quantos metros de corda sobram?',
          answer: 1.05,
          unit: 'm',
          wrong: [{ value: 4.15, feedback: 'Você descontou só um pedaço de cada tamanho. São 3 pedaços de 5/4 m e 2 de 3/5 m.' }],
          solution: ['3 × 5/4 = 15/4 = 3,75 m e 2 × 3/5 = 6/5 = 1,2 m.', '$6 − 3,75 − 1,2 = 1,05 m'],
        }),
        numeric({
          prompt: [p('Uma doceira tem dois potes de calda: um com 1 3/4 L e outro com 2 L. Ela separa 1/2 L para provar e envasa o resto em frascos de 1/4 L.')],
          ask: 'Quantos frascos ela enche completamente?',
          answer: 13,
          unit: 'frascos',
          wrong: [
            { value: 15, feedback: 'Faltou descontar o 1/2 L separado para provar.' },
            { value: 0.8125, feedback: 'Você multiplicou pelo tamanho do frasco. Para saber quantos frascos cabem, divida.' },
          ],
          solution: ['Total: 1 3/4 + 2 = 3 3/4 = 15/4 L.', 'Disponível: 15/4 − 1/2 = 13/4 L.', '$[[13|4]] ÷ [[1|4]] = 13 frascos'],
        }),
        gen(fractionOfFractionGen),
        choice({
          prompt: [p('Uma caixa tem 3/4 de litro de leite. Joana usou 2/3 desse leite numa receita.')],
          ask: 'Quanto leite Joana usou?',
          options: [
            ok('1/2 litro'),
            no('1/12 litro', 'Essa é a diferença 3/4 − 2/3. Mas "2/3 do leite" é uma multiplicação: 2/3 × 3/4.'),
            no('5/7 litro', 'Somar numeradores e denominadores não tem significado. "2/3 de 3/4" é 2/3 × 3/4.'),
            no('1/4 litro', '1/4 L é o que SOBROU na caixa (3/4 − 1/2). A pergunta é quanto foi usado.'),
          ],
          solution: ['$[[2|3]] × [[3|4]] = [[6|12]] = [[1|2]] litro'],
          verify: () => 0.5,
        }),
      ],
      recap: [
        'Somar e subtrair: denominador comum (MMC) e só então operar os numeradores.',
        'Multiplicar: numerador × numerador e denominador × denominador. "Fração de" = vezes.',
        'Dividir: multiplique pelo inverso do divisor ("quantas vezes cabe").',
        'Número misto: 3 3/4 = 15/4 antes de operar.',
      ],
    })),

    stage('fracao-de-que', 'interpretacao', 'Fração de quê? Etapas sucessivas', 'Identificar a base de cada fração num enunciado com etapas ("do restante", "do que sobrou") e encadear as contas sem misturar bases.', () => ({
      learn: [
        text('Nos problemas mais traiçoeiros, cada fração tem uma **base** diferente. "Gastou 1/3 do salário e 1/4 **do restante**" não é 1/3 + 1/4 do salário: o 1/4 é de outra base, o que sobrou depois da 1ª despesa.'),
        example('Quanta água restou?', 'Pela manhã, uma caixa d\'água estava com 3/4 da capacidade. Ao longo do dia, consumiram 2/3 da água que havia na caixa.', [
          askStep('A expressão-chave é "da água que havia".', '2/3 de quê?', [
            ok('Dos 3/4 que havia na caixa'),
            no('Da capacidade total da caixa', 'Se fosse da capacidade, o texto diria "2/3 da capacidade". Ele diz "da água que havia": a base são os 3/4.'),
          ]),
          step('Consumido: 2/3 de 3/4.', '[[2|3]] × [[3|4]] = [[6|12]] = [[1|2]] da capacidade'),
          step('Restou o que havia menos o consumido:', '[[3|4]] − [[1|2]] = [[1|4]] da capacidade'),
          step('Atalho: se consumiram 2/3 da água, sobrou 1/3 dela.', '[[1|3]] × [[3|4]] = [[1|4]]'),
        ], 'Restou 1/4 da capacidade.'),
        lab({
          title: 'Etapas sucessivas',
          intro: 'Escolha a fração da 1ª etapa (do total) e a da 2ª etapa (do que restou). Compare a sobra correta com o erro comum de tratar as duas como frações do total.',
          params: [
            { key: 'i', label: '1ª etapa (do total)', min: 0, max: STAGES_LIST.length - 1, step: 1, value: 1, format: (v) => f(STAGES_LIST[v]) },
            { key: 'j', label: '2ª etapa (do restante)', min: 0, max: STAGES_LIST.length - 1, step: 1, value: 5, format: (v) => f(STAGES_LIST[v]) },
          ],
          readouts: ({ i, j }) => {
            const [a, b] = STAGES_LIST[i];
            const [c, d] = STAGES_LIST[j];
            const second = ((b - a) * c) / (b * d);
            const wrong = 1 - a / b - c / d;
            return [
              { label: '1ª etapa', value: `${a}/${b} do total` },
              { label: '2ª etapa', value: `${c}/${d} de ${frac(b - a, b)} = ${frac(Math.round(second * b * d), b * d)} do total` },
              { label: 'Sobra', value: frac((b - a) * (d - c), b * d), big: true, tone: 'verdigris' },
              { label: 'Se somasse as frações (erro)', value: wrong > 0 ? `sobraria ${num(wrong, 3)} — errado` : 'passaria de 100% — impossível' },
            ];
          },
          viz: ({ i, j }) => {
            const [a, b] = STAGES_LIST[i];
            const [c, d] = STAGES_LIST[j];
            const first = a / b;
            const second = ((b - a) * c) / (b * d);
            return {
              kind: 'parts',
              segments: [
                { label: '1ª etapa', value: first, tone: 'brass' },
                { label: '2ª etapa', value: second, tone: 'sky' },
                { label: 'Sobra', value: 1 - first - second, tone: 'verdigris' },
              ],
              summary: `1ª etapa ${num(first, 3)}, 2ª etapa ${num(second, 3)}, sobra ${num(1 - first - second, 3)} do total`,
            };
          },
          goal: {
            task: 'Faça sobrar exatamente 1/4 do total.',
            done: ({ i, j }) => {
              const [a, b] = STAGES_LIST[i];
              const [c, d] = STAGES_LIST[j];
              return 4 * (b - a) * (d - c) === b * d;
            },
            success: 'Isso: a sobra é o produto das sobras de cada etapa. Ex.: 1/2 e 1/2 deixam 1/2 × 1/2 = 1/4.',
          },
          insight: 'A sobra final é (1 − 1ª) × (1 − 2ª). Por isso duas etapas de 1/2 deixam 1/4, e não zero.',
        }),
        warn('Somar frações de bases diferentes', '1/4 do trajeto + 3/5 do que faltava ≠ 1/4 + 3/5 do trajeto. Converta cada parte para a mesma base (o total) antes de somar.'),
        check(select({
          prompt: [p('Uma artesã comprou 60 m de fita por R$ 45,00. Usou 1/3 da fita num enfeite e 3/4 do que sobrou em laços. O enfeite levou 2 horas para ficar pronto.')],
          ask: 'Marque só as informações necessárias para calcular quantos metros de fita sobraram.',
          chips: [
            { text: '60 m de fita', needed: true },
            { text: 'R$ 45,00', needed: false, why: 'O preço não muda o comprimento da fita.' },
            { text: '1/3 da fita no enfeite', needed: true },
            { text: '3/4 do que sobrou em laços', needed: true },
            { text: '2 horas de trabalho', needed: false, why: 'O tempo não interfere no comprimento.' },
          ],
          solution: ['Sobra = 60 × (1 − 1/3) × (1 − 3/4) = 60 × 2/3 × 1/4 = 10 m.'],
        })),
        check(choice({
          prompt: [p('Um caminhoneiro percorreu 1/4 de um trajeto no 1º dia e 3/5 do que faltava no 2º dia.')],
          ask: 'Que fração do trajeto ele percorreu nos dois dias juntos?',
          options: [
            ok('7/10'),
            no('17/20', 'Você somou 1/4 + 3/5 como se as duas fossem do trajeto inteiro. O 3/5 é do que faltava (3/4).'),
            no('3/20', 'Isso é 1/4 × 3/5. O 2º dia é 3/5 de 3/4 = 9/20, que se soma ao 1/4.'),
            no('3/10', 'Essa é a fração que ainda falta percorrer.'),
          ],
          solution: ['2º dia: 3/5 de 3/4 = 9/20 do trajeto.', '$[[1|4]] + [[9|20]] = [[5|20]] + [[9|20]] = [[14|20]] = [[7|10]]'],
          verify: () => 0.7,
        })),
        tip('Desenhe a barra', 'Desenhe o todo como uma barra, pinte a 1ª parte, divida o restante e pinte a 2ª. Em problemas com "do restante", o desenho impede que você some bases diferentes.'),
      ],
      practice: [
        gen(remainderMoneyGen),
        choice({
          prompt: [p('Uma escola recebeu livros novos: 2/5 foram para o 6º ano e 1/3 do restante para o 7º ano.')],
          ask: 'Que fração do total de livros foi para o 7º ano?',
          options: [
            ok('1/5'),
            no('1/3', '1/3 é do restante (3/5 dos livros), não do total: 1/3 × 3/5 = 1/5.'),
            no('11/15', 'Essa soma (2/5 + 1/3) mistura bases diferentes e nem responde à pergunta.'),
            no('2/5', '2/5 foi a parte do 6º ano.'),
          ],
          hints: ['Depois do 6º ano, que fração dos livros restou?', 'O 7º ano recebeu 1/3 desse restante.'],
          solution: ['Restante após o 6º ano: 1 − 2/5 = 3/5.', '$[[1|3]] × [[3|5]] = [[1|5]] do total'],
          verify: () => 0.2,
        }),
        order({
          ask: 'Ponha em ordem os passos para resolver: "Gastou 1/3 do salário com aluguel e 1/4 do restante com mercado. Que fração do salário sobrou?"',
          steps: [
            'Identificar o todo: o salário inteiro (1).',
            'Aluguel: 1/3 do salário; restam 2/3.',
            'Mercado: 1/4 dos 2/3 que restaram = 1/6 do salário.',
            'Sobra: 2/3 − 1/6 = 1/2 do salário.',
          ],
          hints: ['Comece sempre pelo todo.', 'A 2ª despesa só pode ser calculada depois de saber o restante.'],
          solution: ['Todo → 1ª etapa → restante → 2ª etapa sobre o restante → sobra.'],
          why: 'Cada etapa depende do resultado da anterior.',
        }),
      ],
      challenge: [
        numeric({
          prompt: [p('Uma chocolateira separou 6 kg de chocolate para uma encomenda. Usou 25% dessa massa para cobrir bolos e, do que restou, 2/5 para decorações. Com todo o chocolate que sobrou, fez bombons de 1/40 kg cada.')],
          ask: 'Quantos bombons ela fez?',
          answer: 108,
          unit: 'bombons',
          wrong: [
            { value: 84, feedback: 'Você tirou 2/5 do total, mas as decorações usam 2/5 do que RESTOU depois dos bolos.' },
            { value: 180, feedback: 'Faltou descontar o chocolate das decorações.' },
          ],
          solution: ['Depois dos bolos: 6 × 0,75 = 4,5 kg.', 'Decorações: 2/5 de 4,5 = 1,8 kg; sobram 2,7 kg.', '$2,7 ÷ [[1|40]] = 2,7 × 40 = 108 bombons'],
        }),
        choice({
          prompt: [p('Ana gastou 1/4 da mesada com lanche e 1/3 do que sobrou com transporte.')],
          ask: 'Que fração da mesada sobrou?',
          options: [
            ok('1/2'),
            no('5/12', 'Você fez 1 − 1/4 − 1/3, como se as duas frações fossem da mesada inteira.'),
            no('1/12', '1/4 × 1/3 é o produto das frações gastas — não representa nada no problema.'),
            no('1/4', 'O transporte custou 1/3 de 3/4 = 1/4 da mesada; sobrou 3/4 − 1/4 = 1/2.'),
          ],
          solution: ['$(1 − [[1|4]]) × (1 − [[1|3]]) = [[3|4]] × [[2|3]] = [[1|2]]'],
          verify: () => 0.5,
        }),
        gen(remainderMoneyGen),
      ],
      recap: [
        'Antes de calcular, descubra a base de cada fração: "do total" ou "do restante".',
        'Fração do restante: multiplique pela sobra da etapa anterior.',
        'Sobra final = (1 − 1ª) × (1 − 2ª) × …',
        'Desenhar a barra evita somar frações de bases diferentes.',
      ],
    })),

    stage('descobrir-o-todo', 'aplicacoes', 'Problemas inversos: descobrir o todo', 'Encontrar o total a partir de uma parte conhecida, inclusive quando as partes vêm em frações, decimais e porcentagens misturados.', () => ({
      learn: [
        text('Às vezes o problema dá a parte e pede o todo. Se **2/5 do total são 12**, então 1/5 do total é 6, e o total (5/5) é 30. Numa conta só: **todo = parte ÷ fração**.'),
        math('[[2|5]] × T = 12  ⟹  T = 12 ÷ [[2|5]] = 12 × [[5|2]] = 30'),
        example('Qual era o trajeto?', 'Um caminhoneiro percorreu 1/3 de um trajeto no 1º dia e metade do que faltava no 2º dia. Ainda faltam 40 km.', [
          askStep('Primeiro, descubra que fração do trajeto os 40 km representam.', 'Depois do 1º dia, quanto do trajeto faltava?', [
            ok('2/3 do trajeto'),
            no('1/3 do trajeto', '1/3 foi o que ele percorreu. Faltavam 1 − 1/3 = 2/3.'),
          ]),
          step('No 2º dia, ele andou metade do que faltava; a outra metade ainda falta.', '[[1|2]] × [[2|3]] = [[1|3]] do trajeto ainda falta'),
          askStep('Então 1/3 do trajeto são 40 km.', 'Qual é o trajeto inteiro?', [
            ok('120 km'),
            no('Cerca de 13,3 km', 'Se 1/3 do total é 40, o total é maior que 40: 3 × 40.'),
            no('80 km', '80 km seriam 2/3 do trajeto. O todo são 3/3: 3 × 40.'),
          ], 'T = 40 ÷ [[1|3]] = 120 km'),
        ], 'O trajeto tem 120 km.'),
        check(numeric({
          ask: '3/8 de uma quantia são R$ 120,00. Qual é a quantia toda?',
          prefix: 'R$',
          answer: 320,
          wrong: [{ value: 45, feedback: 'Você calculou 3/8 de 120. Aqui, 120 já é a parte: o todo é 120 ÷ 3/8 = 320.' }],
          solution: ['1/8 da quantia: 120 ÷ 3 = 40.', 'Quantia toda: 8 × 40 = R$ 320,00.'],
        })),
        key('Misturou representações? Converta', 'Se o enunciado traz 2/5, 0,25 e 15% do mesmo total, escreva tudo na mesma forma — por exemplo, em porcentagem: 40%, 25% e 15%. O que falta para 100% é o restante.'),
        check(choice({
          prompt: [p('Numa pesquisa sobre transporte, 3/10 dos entrevistados vão ao trabalho de ônibus, 0,35 vão a pé, 20% de bicicleta e o restante, 30 pessoas, de carro.')],
          ask: 'Quantas pessoas foram entrevistadas?',
          options: [
            ok('200'),
            no('170', '170 é o número dos que NÃO vão de carro (85% de 200). A pergunta é o total.'),
            no('120', '120 sairia se o carro fosse 25%. Some 30% + 35% + 20% = 85%: o carro é 15%.'),
            no('300', '300 sairia se o carro fosse 10%. O carro é 100% − 85% = 15%.'),
          ],
          solution: ['Em porcentagem: 30% + 35% + 20% = 85%; carro = 15%.', '$T = 30 ÷ 0,15 = 200'],
          verify: () => 200,
        })),
        warn('A resposta precisa ser maior que a parte', 'Se a parte é uma fração do todo (menor que 1), o todo é maior que a parte. Chegou a um "todo" menor que a parte? Você multiplicou quando devia dividir.'),
      ],
      practice: [
        gen(wholeFromPartGen),
        gen(inverseStagesGen),
        choice({
          prompt: [p('Numa festa, 1/4 dos convidados chegou antes das 20 h, 0,5 chegou entre 20 h e 21 h e os 40 restantes chegaram depois das 21 h.')],
          ask: 'Quantos convidados havia na festa?',
          options: [
            ok('160'),
            no('80', '80 sairia se os 40 fossem metade. Eles são 1 − 1/4 − 1/2 = 1/4 dos convidados.'),
            no('10', 'Você calculou 1/4 de 40. Os 40 já são a parte (1/4): o todo é 4 × 40.'),
            no('120', '120 são os que chegaram até as 21 h (3/4 de 160). A pergunta é o total.'),
          ],
          hints: ['Escreva tudo como fração: 1/4 e 0,5 = 1/2.', 'Que fração do total são os 40 convidados restantes?'],
          solution: ['$1 − [[1|4]] − [[1|2]] = [[1|4]]', '$T = 40 ÷ [[1|4]] = 160'],
          verify: () => 160,
        }),
      ],
      challenge: [
        numeric({
          prompt: [p('Num torneio de xadrez, metade dos jogadores foi eliminada na 1ª fase e 2/3 dos restantes, na 2ª fase. Sobraram 8 jogadores.')],
          ask: 'Quantos jogadores começaram o torneio?',
          answer: 48,
          wrong: [
            { value: 24, feedback: 'Você desfez só a 2ª fase. 24 era o número de jogadores no início da 2ª fase.' },
            { value: 16, feedback: 'Você desfez só a 1ª fase. Os 8 que sobraram são 1/3 dos que chegaram à 2ª fase.' },
          ],
          solution: ['Sobra: 1/2 × 1/3 = 1/6 dos jogadores.', '$T = 8 ÷ [[1|6]] = 48'],
        }),
        numeric({
          prompt: [p('Numa pesquisa, 1/4 dos entrevistados usa ônibus, 0,4 usa metrô, 15% usa bicicleta e os demais, 36 pessoas, vão de carro.')],
          ask: 'Quantas pessoas foram entrevistadas?',
          answer: 180,
          wrong: [
            { value: 144, feedback: '144 é o número dos que não vão de carro. A pergunta é o total de entrevistados.' },
            { value: 7.2, feedback: 'Você multiplicou 36 pela fração. Os 36 já são a parte (20%): divida por ela.' },
          ],
          solution: ['25% + 40% + 15% = 80%; carro = 20%.', '$T = 36 ÷ 0,2 = 180'],
        }),
        gen(inverseStagesGen),
        gen(wholeFromPartGen),
      ],
      recap: [
        'Todo = parte ÷ fração: se 2/5 do total são 12, o total é 12 ÷ 2/5 = 30.',
        'Com várias etapas, descubra primeiro que fração do total a parte conhecida representa.',
        'Frações, decimais e porcentagens do mesmo total: converta tudo para a mesma forma.',
        'Confira: o todo tem de ser maior que qualquer parte.',
      ],
    })),

    stage('ritmos', 'aprofundamento', 'Ritmos de trabalho: torneiras e tarefas', 'Resolver problemas de vazões e de trabalho conjunto somando "frações do serviço por hora" — inclusive com ralos e com o serviço já começado.', () => ({
      learn: [
        text('Em problemas de torneiras e de tarefas, pense no **que cada um faz em 1 hora**. Se a torneira A enche o tanque em 4 h, ela enche **1/4 do tanque por hora**. Vazões que enchem se somam; as que esvaziam (ralos) se subtraem.'),
        math('A: [[1|4]] por hora    B: [[1|6]] por hora    ralo: −[[1|12]] por hora', 'juntos: [[3|12]] + [[2|12]] − [[1|12]] = [[4|12]] = [[1|3]] do tanque por hora'),
        lab({
          title: 'Tanque e torneiras',
          intro: 'Ajuste o tempo que cada torneira leva para encher o tanque sozinha, o ralo e o nível inicial. O gráfico mostra o nível do tanque ao longo das horas.',
          params: [
            { key: 'a', label: 'Torneira A enche em', min: 2, max: 12, step: 1, value: 4, format: (v) => `${v} h` },
            { key: 'b', label: 'Torneira B enche em', min: 2, max: 12, step: 1, value: 6, format: (v) => `${v} h` },
            { key: 'c', label: 'Ralo esvazia em', min: 0, max: 24, step: 2, value: 12, format: (v) => (v === 0 ? 'sem ralo' : `${v} h`) },
            { key: 'q', label: 'Nível inicial', min: 0, max: 3, step: 1, value: 0, format: (v) => (v === 0 ? 'vazio' : `${v}/4`) },
          ],
          readouts: ({ a, b, c, q }) => {
            const m = lcm(lcm(a, b), c || 1);
            const numer = m / a + m / b - (c ? m / c : 0);
            const net = numer / m;
            const rest = 1 - q / 4;
            return [
              { label: 'Por hora, juntos', value: net > 0 ? `${frac(numer, m)} do tanque` : net === 0 ? 'nada (empate)' : 'o ralo vence' },
              { label: 'Tempo para encher', value: net > 0 ? hm(rest / net) : 'nunca enche', big: true, tone: net > 0 ? 'verdigris' : 'ember' },
            ];
          },
          viz: ({ a, b, c, q }) => {
            const net = 1 / a + 1 / b - (c ? 1 / c : 0);
            const start = q / 4;
            const tFull = net > 0 ? (1 - start) / net : Infinity;
            const xMax = Math.min(12, Math.max(3, Number.isFinite(tFull) ? Math.ceil(tFull + 1) : 12));
            const level = (t: number) => Math.max(0, Math.min(1, start + net * t));
            return {
              kind: 'chart',
              xLabel: 'horas',
              yLabel: 'nível do tanque',
              xMin: 0,
              xMax,
              yMin: 0,
              yMax: 1,
              yFormat: (y) => pct(y * 100, 0),
              series: [{ label: 'nível', tone: 'sky', points: sample(0, xMax, 48, level) }],
              markers: Number.isFinite(tFull) && tFull <= xMax ? [{ x: tFull, y: 1, label: `cheio em ${hm(tFull)}`, tone: 'verdigris' }] : [],
              summary: Number.isFinite(tFull) ? `O tanque enche em ${hm(tFull)}` : 'O tanque nunca enche: o ralo esvazia mais do que as torneiras enchem',
            };
          },
          goal: {
            task: 'Sem ralo e começando vazio, ajuste as torneiras para o tanque encher em exatamente 2 horas.',
            done: ({ a, b, c, q }) => c === 0 && q === 0 && 2 * (a + b) === a * b,
            success: 'Isso: por exemplo, 4 h e 4 h (1/4 + 1/4 = 1/2 por hora) ou 3 h e 6 h (1/3 + 1/6 = 1/2).',
          },
          insight: 'Duas torneiras juntas nunca levam a média dos tempos: elas se ajudam, então o tempo juntas é menor que o da torneira mais rápida.',
        }),
        warn('Não some (nem tire a média) dos tempos', '4 h e 6 h juntas não dão 10 h nem 5 h. Some as vazões (1/4 + 1/6 = 5/12 do tanque por hora) e inverta: 12/5 h = 2 h 24 min.'),
        example('Começando pela metade', 'Um tanque está com metade da capacidade. A torneira A enche o tanque vazio em 3 h, a B em 6 h, e um ralo esvazia o tanque cheio em 4 h. Tudo é aberto ao mesmo tempo.', [
          askStep('Comece pelo que acontece em 1 hora.', 'Quanto do tanque o conjunto enche por hora?', [
            ok('1/3 + 1/6 − 1/4 = 1/4 do tanque'),
            no('1/3 + 1/6 + 1/4 = 3/4 do tanque', 'O ralo tira água: a vazão dele entra com sinal negativo.'),
            no('3 + 6 − 4 = 5 horas', 'Tempos não se somam. Trabalhe com a fração do tanque enchida por hora.'),
          ], '[[4|12]] + [[2|12]] − [[3|12]] = [[3|12]] = [[1|4]]'),
          step('Falta encher a outra metade do tanque.', '1 − [[1|2]] = [[1|2]]'),
          step('Tempo = o que falta ÷ o que enche por hora.', '[[1|2]] ÷ [[1|4]] = [[1|2]] × 4 = 2 horas'),
        ], '2 horas.'),
        check(numeric({
          prompt: [p('Ana pinta uma parede sozinha em 3 h; Beto, em 6 h. Os dois trabalham juntos, cada um no seu ritmo.')],
          ask: 'Em quantas horas eles pintam a parede?',
          answer: 2,
          unit: 'h',
          wrong: [
            { value: 4.5, feedback: 'Essa é a média dos tempos. Juntos, eles se ajudam: 1/3 + 1/6 = 1/2 da parede por hora.' },
            { value: 9, feedback: 'Você somou os tempos. Some as frações de parede pintadas por hora.' },
          ],
          solution: ['$[[1|3]] + [[1|6]] = [[2|6]] + [[1|6]] = [[1|2]] da parede por hora', 'Tempo: 1 ÷ 1/2 = 2 horas.'],
        })),
      ],
      practice: [
        gen(twoTapsGen),
        gen(tapDrainGen),
        choice({
          prompt: [p('Uma máquina, sozinha, faz um serviço em 10 dias. Junto com uma segunda máquina, o mesmo serviço sai em 6 dias.')],
          ask: 'Em quantos dias a segunda máquina faria o serviço sozinha?',
          options: [
            ok('15 dias'),
            no('4 dias', 'Subtrair os tempos (10 − 6) não funciona. Subtraia as frações por dia: 1/6 − 1/10.'),
            no('16 dias', 'Somar os tempos não tem sentido aqui. Trabalhe com a fração do serviço feita por dia.'),
            no('8 dias', 'A média dos tempos não serve. Juntas, as máquinas fazem 1/6 por dia; a 1ª faz 1/10.'),
          ],
          hints: ['Juntas: 1/6 do serviço por dia. A 1ª sozinha: 1/10 por dia.', 'A 2ª faz a diferença: 1/6 − 1/10 por dia.'],
          solution: ['$[[1|6]] − [[1|10]] = [[5|30]] − [[3|30]] = [[2|30]] = [[1|15]] por dia', 'Sozinha: 15 dias.'],
          verify: () => 15,
        }),
      ],
      challenge: [
        numeric({
          prompt: [p('A torneira A enche um tanque vazio em 6 h; a B, em 3 h. A torneira A fica aberta sozinha por 1 hora; depois, a B também é aberta.')],
          ask: 'Depois de abrir a torneira B, quantos minutos faltam para o tanque ficar cheio?',
          answer: 100,
          unit: 'min',
          wrong: [
            { value: 120, feedback: 'Você ignorou o 1/6 do tanque que a torneira A já tinha enchido na 1ª hora.' },
            { value: 160, feedback: 'Esse é o tempo total desde a abertura de A. A pergunta começa a contar quando B é aberta.' },
          ],
          solution: ['Em 1 h, A enche 1/6; faltam 5/6.', 'Juntas: 1/6 + 1/3 = 1/2 do tanque por hora.', '$[[5|6]] ÷ [[1|2]] = [[5|3]] h = 1 h 40 min = 100 min'],
        }),
        numeric({
          prompt: [p('Um tanque está com 1/3 da capacidade. Uma torneira que enche o tanque vazio em 4 h e um ralo que esvazia o tanque cheio em 6 h são abertos ao mesmo tempo.')],
          ask: 'Em quantas horas o tanque fica cheio?',
          answer: 8,
          unit: 'h',
          wrong: [
            { value: 12, feedback: 'Você calculou como se o tanque começasse vazio. Ele já tem 1/3: faltam 2/3.' },
            { value: 1.6, feedback: 'Você somou a vazão do ralo. O ralo tira água: 1/4 − 1/6 = 1/12 por hora.' },
          ],
          solution: ['Por hora: 1/4 − 1/6 = 3/12 − 2/12 = 1/12 do tanque.', 'Faltam 2/3.', '$[[2|3]] ÷ [[1|12]] = 8 horas'],
        }),
        gen(twoTapsGen),
        gen(tapDrainGen),
      ],
      recap: [
        'Trabalhe com "quanto cada um faz por hora": quem enche em t horas faz 1/t por hora.',
        'Vazões de entrada somam; as de saída subtraem.',
        'Tempo = o que falta ÷ vazão total por hora.',
        'Nunca some nem tire a média dos tempos.',
      ],
    })),

    stage('maestria', 'maestria', 'Maestria: frações em problemas complexos', 'Resolver problemas inéditos que combinam várias ideias de frações, escolhendo a estratégia sem orientação e conferindo a resposta.', () => ({
      learn: [
        text('Nas questões mais difíceis do ENEM, as frações aparecem misturadas com porcentagens, unidades e várias etapas. Não existe fórmula única — existe um **roteiro**.'),
        strategy('Roteiro em 4 perguntas', '1) Qual é o todo de cada fração? 2) As frações estão na mesma base? Se não, converta. 3) O problema é direto (achar a parte) ou inverso (achar o todo)? 4) A resposta faz sentido? Uma parte nunca é maior que o todo.'),
        example('Um problema completo', 'Uma cooperativa colheu certa quantidade de laranjas. Vendeu 3/8 a uma fábrica de suco e 40% do restante numa feira. Doou 1/3 do que sobrou e ainda ficaram 500 kg em estoque. Quantos quilogramas foram colhidos?', [
          step('Depois da fábrica, restou 1 − 3/8 = 5/8 da colheita.'),
          askStep('Na feira saíram 40% do restante.', 'Que fração da colheita restava depois da feira?', [
            ok('60% de 5/8 = 3/8'),
            no('5/8 − 2/5 = 9/40', 'Os 40% são do restante (5/8), não da colheita inteira. Restam 60% de 5/8.'),
          ], '0,6 × [[5|8]] = [[3|8]]'),
          step('Doou 1/3 do que sobrou: ficaram 2/3 de 3/8.', '[[2|3]] × [[3|8]] = [[1|4]] da colheita'),
          askStep('Então 1/4 da colheita são os 500 kg do estoque.', 'Quanto foi colhido?', [
            ok('2.000 kg'),
            no('125 kg', 'Você calculou 1/4 de 500. Os 500 kg já são a parte; o todo é 500 ÷ 1/4.'),
            no('1.500 kg', '1.500 kg seriam 3/4 da colheita. O todo é 4 × 500.'),
          ], 'T = 500 ÷ [[1|4]] = 2.000 kg'),
          step('Conferência de trás para a frente: 3/8 de 2.000 = 750 (sobram 1.250); 40% de 1.250 = 500 (sobram 750); 1/3 de 750 = 250 (sobram 500). ✓'),
        ], 'Foram colhidos 2.000 kg.'),
        reveal('Por que a resposta de um problema inverso de frações precisa ser maior que a parte dada?', 'Porque a parte é uma fração (menor que 1) do todo. Se você chegou a um todo menor que a parte, multiplicou quando devia dividir.'),
        tip('Confira de trás para a frente', 'Com o todo encontrado, refaça as etapas na ordem do enunciado. Em 30 segundos você confirma — ou descobre — o erro.'),
        key('Grupos que se sobrepõem', 'Se 3/4 da turma joga e 1/2 canta, a soma (5/4) passa do inteiro porque quem faz as duas coisas foi contado duas vezes. Pelo menos uma atividade = joga + canta − faz as duas; nenhuma = 1 − esse total.'),
        check(numeric({
          prompt: [p('Numa turma, 3/4 dos alunos jogam algum esporte e 1/2 canta no coral. Exatamente 1/3 da turma faz as duas coisas.')],
          ask: 'Que fração da turma não faz nenhuma das duas atividades?',
          answer: 1 / 12,
          tolerance: 0.002,
          placeholder: 'ex.: 1/12',
          wrong: [
            { value: 5 / 12, feedback: 'Você descontou quem faz as duas atividades duas vezes. Desconte uma vez só: 3/4 + 1/2 − 1/3 = 11/12.' },
            { value: 1 / 3, feedback: '1/3 é a fração de quem faz as DUAS atividades, não de quem não faz nenhuma.' },
            { value: 11 / 12, feedback: '11/12 é a fração de quem faz pelo menos uma atividade. Nenhuma: 1 − 11/12.' },
          ],
          solution: ['Pelo menos uma: [[3|4]] + [[1|2]] − [[1|3]] = [[9|12]] + [[6|12]] − [[4|12]] = [[11|12]]', '$Nenhuma: 1 − [[11|12]] = [[1|12]]'],
        })),
      ],
      practice: [
        numeric({
          prompt: [p('Um funcionário gastou 1/5 do salário com aluguel, 3/8 do restante com mercado e metade do que sobrou com contas. Restaram R$ 600,00.')],
          ask: 'Qual é o salário?',
          prefix: 'R$',
          answer: 2400,
          wrong: [
            { value: 1200, feedback: 'Você desfez só a última etapa: R$ 1.200 era o valor antes das contas.' },
            { value: 1920, feedback: 'Faltou desfazer a primeira despesa (o aluguel): R$ 1.920 era o valor depois dele.' },
          ],
          hints: ['Encontre a fração do salário que sobrou: (1 − 1/5) × (1 − 3/8) × (1 − 1/2).', 'Depois, todo = parte ÷ fração.'],
          solution: ['Sobra: 4/5 × 5/8 × 1/2 = 1/4 do salário.', '$S = 600 ÷ [[1|4]] = R$ 2.400,00'],
        }),
        numeric({
          prompt: [p('Na eleição de um grêmio, 3/4 dos alunos votaram. Dos votos, 1/10 foram nulos. O vencedor teve 3/5 dos votos válidos (não nulos): 324 votos.')],
          ask: 'Quantos alunos tem a escola?',
          answer: 800,
          wrong: [
            { value: 540, feedback: 'Esse é o número de votos válidos. Ainda faltam duas etapas para chegar ao total de alunos.' },
            { value: 600, feedback: 'Esse é o número de alunos que votaram. Falta dividir por 3/4.' },
          ],
          hints: ['Vencedor = 3/5 × 9/10 × 3/4 do total de alunos.', 'Calcule essa fração e divida 324 por ela.'],
          solution: ['$[[3|5]] × [[9|10]] × [[3|4]] = [[81|200]] dos alunos', '$T = 324 ÷ [[81|200]] = 324 × [[200|81]] = 800'],
        }),
        gen(inverseStagesGen),
      ],
      challenge: [
        numeric({
          prompt: [p('Um produtor vendeu 2/5 da safra de café. Depois, vendeu 25% do restante. Na secagem do que sobrou, perdeu 1/3. Ficaram 1.200 kg.')],
          ask: 'Quantos quilogramas tinha a safra?',
          answer: 4000,
          unit: 'kg',
          wrong: [
            { value: 1800, feedback: 'Você desfez só a perda na secagem: 1.800 kg era o que havia antes de secar.' },
            { value: 2400, feedback: 'Faltou desfazer a primeira venda (2/5 da safra): 2.400 kg era o que restou depois dela.' },
          ],
          solution: ['Sobra: 3/5 × 3/4 × 2/3 = 3/10 da safra.', '$T = 1.200 ÷ [[3|10]] = 4.000 kg'],
        }),
        numeric({
          prompt: [p('A torneira A enche um tanque vazio em 40 minutos; a B, em 1 hora. Um ralo esvazia o tanque cheio em 2 horas. O tanque está vazio e as duas torneiras e o ralo são abertos juntos.')],
          ask: 'Em quantos minutos o tanque fica cheio?',
          answer: 30,
          unit: 'min',
          wrong: [
            { value: 24, feedback: 'Você ignorou o ralo. Ele tira 1/120 do tanque por minuto.' },
            { value: 20, feedback: 'Você somou o ralo como se ele enchesse. A vazão dele é negativa.' },
          ],
          solution: ['Por minuto: 1/40 + 1/60 − 1/120 = 3/120 + 2/120 − 1/120 = 4/120 = 1/30.', 'Tempo: 30 minutos.'],
        }),
        numeric({
          prompt: [p('Numa assembleia, 4/5 dos sócios compareceram. 1/8 dos presentes votou em branco. A proposta aprovada teve 2/3 dos votos não brancos: 140 votos.')],
          ask: 'Quantos sócios tem a associação?',
          answer: 300,
          wrong: [
            { value: 210, feedback: 'Esse é o número de votos não brancos. Faltam duas etapas.' },
            { value: 240, feedback: 'Esse é o número de presentes. Falta dividir por 4/5.' },
          ],
          solution: ['Proposta = 2/3 × 7/8 × 4/5 = 7/15 dos sócios.', '$T = 140 ÷ [[7|15]] = 300'],
        }),
        choice({
          prompt: [p('Uma receita para 6 pessoas leva 2/3 de xícara de farinha. Sueli vai prepará-la para 8 pessoas, mantendo a proporção.')],
          ask: 'Quanto de farinha ela vai usar?',
          options: [
            ok('8/9 de xícara'),
            no('1 xícara', 'Você somou 1/3 de xícara por 2 pessoas a mais. Mas a farinha por pessoa é 2/3 ÷ 6 = 1/9 de xícara.'),
            no('4/3 de xícara', '4/3 seria para 12 pessoas (o dobro). Para 8, multiplique por 8/6.'),
            no('2/3 de xícara', 'Assim a receita renderia para 6 pessoas, não para 8.'),
          ],
          solution: ['Por pessoa: 2/3 ÷ 6 = 1/9 de xícara.', '$8 × [[1|9]] = [[8|9]] de xícara'],
          verify: () => 8 / 9,
        }),
      ],
      recap: [
        'Roteiro: todo de cada fração → mesma base → direto ou inverso → a resposta faz sentido?',
        'Em cadeias, a sobra é o produto das sobras; o todo é a parte ÷ essa fração.',
        'Confira de trás para a frente: refaça as etapas com o todo encontrado.',
      ],
    })),
  ],
});
