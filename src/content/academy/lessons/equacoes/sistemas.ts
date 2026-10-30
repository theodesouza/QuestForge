/**
 * Aula: Sistemas lineares — duas incógnitas e duas pistas (cabeças e patas, veículos e rodas,
 * o método da suposição), substituição (ingressos de dois preços), adição (soma e diferença,
 * duas compras, moedas, a solução como cruzamento de retas) e problemas de mistura.
 */
import {
  askStep,
  check,
  draftNumeric,
  example,
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
  stage,
  step,
  strategy,
  text,
} from '../../kit/build';
import { brl, fixed, num, round } from '../../kit/format';
import type { Rand } from '../../types';

const isInt = (x: number) => Number.isInteger(round(x, 9));
const rs = (x: number) => (isInt(x) ? num(x) : fixed(x, 2));

// ———————————————————————————————————————————————— geradores: duas pistas

const LEGS = [
  { ctx: 'Em um estacionamento há apenas carros e motos', A: 'carros', B: 'motos', a1: 'carro', b1: 'moto', qa: 'Quantos', qb: 'Quantas', heads: 'veículos', feet: 'rodas', fa: 4, fb: 2 },
  { ctx: 'Num sítio há apenas coelhos e galinhas', A: 'coelhos', B: 'galinhas', a1: 'coelho', b1: 'galinha', qa: 'Quantos', qb: 'Quantas', heads: 'cabeças', feet: 'patas', fa: 4, fb: 2 },
  { ctx: 'Numa locadora há apenas triciclos e bicicletas', A: 'triciclos', B: 'bicicletas', a1: 'triciclo', b1: 'bicicleta', qa: 'Quantos', qb: 'Quantas', heads: 'veículos', feet: 'rodas', fa: 3, fb: 2 },
];

/** Cabeças e patas (ou veículos e rodas). */
function legsGen(r: Rand) {
  for (;;) {
    const c = r.pick(LEGS);
    const n = r.int(12, 60);
    const na = r.int(2, n - 2);
    const F = na * c.fa + (n - na) * c.fb;
    if (c.A === 'carros' && ((n === 50 && F === 160) || (n === 40 && F === 110))) continue; // banco e laboratório
    if (c.A === 'coelhos' && n === 30 && F === 84) continue; // exercício da teoria
    const askA = r.next() < 0.5;
    const extra = F - c.fb * n;
    const per = c.fa - c.fb;
    return draftNumeric({
      prompt: [p(`${c.ctx}: são ${n} ${c.heads} e ${F} ${c.feet} no total.`)],
      ask: `${askA ? c.qa : c.qb} ${askA ? c.A : c.B} há?`,
      answer: askA ? na : n - na,
      wrong: [
        { value: askA ? n - na : na, feedback: `Esse é o número de ${askA ? c.B : c.A}. A pergunta é sobre os ${askA ? c.A : c.B}.`.replace('os motos', 'as motos').replace('os galinhas', 'as galinhas').replace('os bicicletas', 'as bicicletas') },
        ...(per > 1 ? [{ value: extra, feedback: `${extra} é o excesso de ${c.feet} em relação a "todos ${c.B}". Cada ${c.a1} acrescenta ${per} ${c.feet}: divida por ${per}.` }] : []),
        { value: round(n / 2, 2), feedback: `Isso divide os ${c.heads} igualmente, sem usar o total de ${c.feet}.` },
        { value: round(F / (c.fa + c.fb), 2), feedback: `Isso divide as ${c.feet} por ${c.fa + c.fb}, misturando as duas pistas. Use uma equação para cada uma.` },
      ].filter((w) => w.value > 0),
      hints: [`Se todos fossem ${c.B}, seriam ${c.fb} × ${n} = ${c.fb * n} ${c.feet}.`, `Cada ${c.a1} acrescenta ${per} ${per === 1 ? (c.feet === 'rodas' ? 'roda' : 'pata') : c.feet}: ${extra} ÷ ${per} = número de ${c.A}.`],
      solution: [`$${c.A}: (${F} − ${c.fb} × ${n}) ÷ ${per} = ${na}`, `$${c.B}: ${n} − ${na} = ${n - na}`],
    });
  }
}

// ———————————————————————————————————————————————— geradores: substituição

/** Ingressos de dois preços (inteira e meia): quantidade e arrecadação. */
function ticketsGen(r: Rand) {
  for (;;) {
    const N = r.pick([100, 120, 150, 180, 200, 240, 250, 400]);
    const p1 = r.pick([20, 24, 30, 40, 50, 60]);
    const p2 = p1 / 2;
    const i = r.int(Math.ceil(N / 5), Math.floor((4 * N) / 5));
    if (N === 200 && p1 === 30 && i === 100) continue; // exemplo da teoria
    const T = i * p1 + (N - i) * p2;
    const askMeia = r.next() < 0.5;
    const event = r.pick(['um show de forró', 'uma peça de teatro infantil', 'um festival de cinema']);
    return draftNumeric({
      prompt: [p(`Para ${event}, foram vendidos ${N} ingressos, entre inteiras (${brl(p1)}) e meias-entradas (${brl(p2)}). A arrecadação total foi de ${brl(T)}.`)],
      ask: askMeia ? 'Quantas meias-entradas foram vendidas?' : 'Quantas inteiras foram vendidas?',
      answer: askMeia ? N - i : i,
      wrong: [
        { value: askMeia ? i : N - i, feedback: `Esse é o número de ${askMeia ? 'inteiras' : 'meias-entradas'}. A pergunta é o de ${askMeia ? 'meias-entradas' : 'inteiras'}.` },
        { value: round(N / 2, 2), feedback: 'Isso divide os ingressos igualmente, sem usar a arrecadação.' },
        { value: round((T - N * p2) / p1, 2), feedback: `Isso divide o excesso sobre "todas meias" pelo preço da inteira. Cada inteira acrescenta só a diferença: ${brl(p1 - p2)}.` },
      ].filter((w) => w.value > 0),
      hints: [`inteiras + meias = ${N}; ${num(p1)} × inteiras + ${num(p2)} × meias = ${num(T)}.`, `Substitua meias = ${N} − inteiras na segunda equação.`],
      solution: [`$${num(p1)}i + ${num(p2)}(${N} − i) = ${num(T)}`, `$${num(p1 - p2)}i = ${num(T - N * p2)} → i = ${i}`, `$meias = ${N} − ${i} = ${N - i}`],
    });
  }
}

/** Substituição: x + y = s com y = x + d ou y = kx. */
function substitutionGen(r: Rand) {
  const x = r.int(2, 30);
  const plusForm = r.next() < 0.5;
  const d = r.int(2, 20);
  const k = r.pick([2, 3, 4]);
  const y = plusForm ? x + d : k * x;
  const s = x + y;
  const askY = r.next() < 0.4;
  return draftNumeric({
    prompt: [formula(`x + y = ${s}`, plusForm ? `y = x + ${d}` : `y = ${k}x`)],
    ask: askY ? 'Quanto vale y?' : 'Quanto vale x?',
    answer: askY ? y : x,
    wrong: [
      { value: round(s / 2, 2), feedback: 'Isso divide a soma igualmente, sem usar a segunda equação.' },
      ...(plusForm ? [{ value: s - d, feedback: `Isso é 2x. Substituindo: x + x + ${d} = ${s} → 2x = ${s - d}; falta dividir por 2.` }] : [{ value: round(s / k, 2), feedback: `Isso divide por ${k}. Substituindo: x + ${k}x = ${k + 1}x = ${s}.` }]),
      { value: askY ? x : y, feedback: `Esse é o valor de ${askY ? 'x' : 'y'}. A pergunta é ${askY ? 'y' : 'x'}.` },
    ],
    hints: [`Troque y por ${plusForm ? `x + ${d}` : `${k}x`} na primeira equação.`, plusForm ? `Fica 2x + ${d} = ${s}; resolva em x.` : `Fica ${k + 1}x = ${s}; resolva em x.`],
    solution: [plusForm ? `$x + x + ${d} = ${s} → 2x = ${s - d} → x = ${x}` : `$x + ${k}x = ${s} → ${k + 1}x = ${s} → x = ${x}`, `$y = ${y}`],
  });
}

// ———————————————————————————————————————————————— geradores: adição

/** Soma e diferença de dois números. */
function sumDiffGen(r: Rand) {
  for (;;) {
    const a = r.int(10, 90);
    const b = r.int(2, a - 1);
    const S = a + b;
    const D = a - b;
    if (S === 58 && D === 14) continue; // exemplo da teoria
    const big = r.next() < 0.5;
    return draftNumeric({
      prompt: [p(`A soma de dois números é ${S}, e a diferença entre eles é ${D}.`)],
      ask: big ? 'Qual é o maior número?' : 'Qual é o menor número?',
      answer: big ? a : b,
      wrong: [
        { value: round(S / 2, 2), feedback: 'Isso divide a soma ao meio, como se os números fossem iguais. A diferença mostra que não são.' },
        { value: big ? S + D : S - D, feedback: `Isso é o dobro do ${big ? 'maior' : 'menor'} número. Somando (ou subtraindo) as equações, sobra 2 × o número: divida por 2.` },
        { value: big ? b : a, feedback: `Esse é o ${big ? 'menor' : 'maior'} número.` },
      ],
      hints: ['x + y = soma; x − y = diferença.', big ? 'Some as equações: 2x = soma + diferença.' : 'Subtraia as equações: 2y = soma − diferença.'],
      solution: [big ? `$2x = ${S} + ${D} = ${S + D} → x = ${a}` : `$2y = ${S} − ${D} = ${S - D} → y = ${b}`],
    });
  }
}

const SHOP = [
  { A: 'cadernos', a1: 'caderno', B: 'canetas', b1: 'caneta', gA: 'cada caderno', gB: 'cada caneta' },
  { A: 'pastéis', a1: 'pastel', B: 'sucos', b1: 'suco', gA: 'cada pastel', gB: 'cada suco' },
  { A: 'pães de queijo', a1: 'pão de queijo', B: 'cafés', b1: 'café', gA: 'cada pão de queijo', gB: 'cada café' },
];

/** Duas compras com a mesma quantidade de um dos itens: subtrair elimina esse item. */
function purchaseGen(r: Rand) {
  for (;;) {
    const s = r.pick(SHOP);
    const pa = r.pick([300, 400, 450, 500, 600, 700, 800, 900]) / 100;
    const pb = r.pick([150, 200, 250, 300, 350, 400]) / 100;
    const a1 = r.int(3, 6);
    const a2 = r.int(1, a1 - 1);
    const b = r.int(1, 4);
    if (s.A === 'cadernos' && a1 === 3 && a2 === 2 && b === 2 && pa === 8 && pb === 3.5) continue; // exemplo da teoria
    const T1 = a1 * pa + b * pb;
    const T2 = a2 * pa + b * pb;
    const askA = r.next() < 0.5;
    return draftNumeric({
      prompt: [p(`Numa cantina, ${a1} ${s.A} e ${b} ${b === 1 ? s.b1 : s.B} custam ${brl(T1)}; ${a2} ${a2 === 1 ? s.a1 : s.A} e ${b} ${b === 1 ? s.b1 : s.B} custam ${brl(T2)}.`)],
      ask: `Qual é o preço de ${askA ? s.gA : s.gB}?`,
      prefix: 'R$',
      answer: askA ? pa : pb,
      wrong: [
        ...(a1 - a2 > 1 ? [{ value: round(T1 - T2, 2), feedback: `Essa diferença corresponde a ${a1 - a2} ${s.A}, e não a um só: divida por ${a1 - a2}.` }] : []),
        { value: round(T1 / (a1 + b), 2), feedback: 'Isso divide o total pelo número de itens, como se todos custassem o mesmo.' },
        { value: askA ? pb : pa, feedback: `Esse é o preço de ${askA ? s.gB : s.gA}.` },
      ],
      hints: [`As duas compras têm ${b} ${b === 1 ? s.b1 : s.B}: a diferença de preço vem só dos ${s.A}.`, `${a1 - a2} ${a1 - a2 === 1 ? s.a1 : s.A} = ${rs(T1)} − ${rs(T2)} = ${brl(T1 - T2)}.`],
      solution: [`$${a1 - a2} × ${s.a1} = ${rs(T1 - T2)} → ${s.a1} = ${rs(pa)}`, ...(askA ? [] : [`$${b} × ${s.b1} = ${rs(T2)} − ${a2} × ${rs(pa)} = ${rs(b * pb)} → ${s.b1} = ${rs(pb)}`])],
    });
  }
}

/** Moedas de dois valores: quantidade e total. */
function coinsGen(r: Rand) {
  for (;;) {
    const pair = r.pick([
      { lo: 0.5, hi: 1 },
      { lo: 0.25, hi: 0.5 },
      { lo: 0.1, hi: 0.25 },
    ]);
    const n = r.int(10, 60);
    const k = r.int(2, n - 2);
    const V = round(k * pair.hi + (n - k) * pair.lo, 2);
    const askHi = r.next() < 0.5;
    const name = (v: number) => (v === 1 ? 'R$ 1,00' : `${num(v * 100)} centavos`);
    return draftNumeric({
      prompt: [p(`Um cofrinho tem ${n} moedas, todas de ${name(pair.lo)} ou de ${name(pair.hi)}, que somam ${brl(V)}.`)],
      ask: `Quantas moedas de ${name(askHi ? pair.hi : pair.lo)} há no cofrinho?`,
      answer: askHi ? k : n - k,
      wrong: [
        { value: askHi ? n - k : k, feedback: `Esse é o número de moedas de ${name(askHi ? pair.lo : pair.hi)}.` },
        { value: round(n / 2, 2), feedback: 'Isso divide as moedas igualmente, sem usar o valor total.' },
        { value: round(V - n * pair.lo, 2), feedback: `Esse é o valor que passa de "todas de ${name(pair.lo)}". Cada moeda maior acrescenta ${brl(pair.hi - pair.lo)}: divida por esse valor.` },
      ].filter((w) => w.value > 0),
      hints: [`Se todas fossem de ${name(pair.lo)}, somariam ${brl(n * pair.lo)}.`, `Cada moeda de ${name(pair.hi)} acrescenta ${brl(pair.hi - pair.lo)}.`],
      solution: [`$(${rs(V)} − ${rs(n * pair.lo)}) ÷ ${rs(pair.hi - pair.lo)} = ${k} moedas de ${name(pair.hi)}`, `$${n} − ${k} = ${n - k} moedas de ${name(pair.lo)}`],
    });
  }
}

/** Mistura de dois tipos para um preço médio. */
function mixtureGen(r: Rand) {
  for (;;) {
    const pa = r.pick([16, 18, 20, 24]);
    const pb = pa + r.pick([6, 8, 10, 12]);
    const total = r.pick([10, 20, 30, 40, 50]);
    const qa = r.int(1, total - 1);
    const pm = (qa * pa + (total - qa) * pb) / total;
    if (!isInt(pm * 100)) continue;
    if (pa === 20 && pb === 30 && total === 10 && qa === 6) continue; // exemplo da teoria
    return draftNumeric({
      prompt: [p(`Uma torrefação mistura café de ${brl(pa)} o quilo com café de ${brl(pb)} o quilo para obter ${total} kg de uma mistura que sairá por ${brl(pm)} o quilo, sem lucro nem perda.`)],
      ask: `Quantos quilos do café de ${brl(pa)} entram na mistura?`,
      unit: 'kg',
      answer: qa,
      wrong: [
        { value: total - qa, feedback: `Essa é a quantidade do café de ${brl(pb)}.` },
        { value: round(total / 2, 2), feedback: 'Metade de cada só daria o preço médio exato se ele ficasse no meio dos dois preços.' },
        { value: round(((pm - pa) / (pb - pa)) * total, 2), feedback: 'Isso usa a distância do preço médio ao café mais barato, o que dá a quantidade do mais caro. O mais barato pesa mais quando o preço médio está mais perto dele.' },
      ].filter((w) => w.value > 0),
      hints: [`a + b = ${total}; ${num(pa)}a + ${num(pb)}b = ${num(pm)} × ${total} = ${rs(pm * total)}.`, `Substitua b = ${total} − a.`],
      solution: [`$${num(pa)}a + ${num(pb)}(${total} − a) = ${rs(pm * total)}`, `$${pb - pa}a = ${rs(pb * total - pm * total)} → a = ${qa}`],
    });
  }
}

// ———————————————————————————————————————————————— aula

export const SISTEMAS = lesson({
  id: 'sistemas',
  topic: 'equacoes',
  subtopics: ['sistemas'],
  title: 'Sistemas lineares',
  summary: 'Duas incógnitas, duas pistas: cabeças e patas, ingressos, compras e misturas, resolvidos por suposição, substituição ou adição — e a solução vista como o cruzamento de duas retas.',
  requires: ['equacao-1grau'],
  stages: [
    stage('duas-pistas', 'descoberta', 'Duas incógnitas, duas pistas', 'Reconhecer situações com duas quantidades desconhecidas, escrever uma equação para cada informação e resolver pelo método da suposição.', () => ({
      learn: [
        text('Quando há **duas quantidades desconhecidas**, são necessárias **duas informações** independentes. Num estacionamento com carros e motos, uma pista conta os veículos e a outra, as rodas. Cada pista vira uma equação: c + m = total de veículos e 4c + 2m = total de rodas.'),
        lab({
          title: 'Carros e motos',
          intro: 'Um estacionamento tem 40 veículos, entre carros e motos. Escolha quantos são carros e veja o total de rodas.',
          params: [{ key: 'c', label: 'Carros', min: 0, max: 40, step: 1, value: 5, format: (v) => `${v}` }],
          readouts: ({ c }) => [
            { label: 'Motos', value: `${40 - c}` },
            { label: 'Rodas', value: `4 × ${c} + 2 × ${40 - c} = ${4 * c + 2 * (40 - c)}`, big: true, tone: 'brass' },
          ],
          viz: ({ c }) => ({
            kind: 'parts',
            segments: [
              { label: 'Rodas de carros', value: 4 * c, tone: 'brass' },
              { label: 'Rodas de motos', value: 2 * (40 - c), tone: 'sky' },
            ],
            summary: `${c} carros e ${40 - c} motos: ${4 * c + 2 * (40 - c)} rodas`,
          }),
          goal: {
            task: 'Ache quantos carros fazem o estacionamento ter exatamente 110 rodas.',
            done: ({ c }) => c === 15,
            success: 'Isso: 15 carros e 25 motos dão 60 + 50 = 110 rodas. Repare: cada carro a mais (no lugar de uma moto) acrescenta 2 rodas.',
          },
          insight: 'Com 0 carros, seriam 80 rodas. Cada troca de uma moto por um carro soma 2 rodas: (110 − 80) ÷ 2 = 15 carros.',
        }),
        key('O método da suposição', 'Suponha que todos sejam do tipo "menor" (todos motos). Compare o total suposto com o real: a diferença ÷ (diferença por unidade) dá quantos são do outro tipo.'),
        example('Supondo que todos são motos', 'Um estacionamento tem 40 veículos e 110 rodas, entre carros e motos. Quantos são carros?', [
          step('Se todos fossem motos:', '40 × 2 = 80 rodas'),
          step('Faltam:', '110 − 80 = 30 rodas'),
          askStep('Cada carro tem 2 rodas a mais que uma moto.', 'Quantos carros há?', [
            ok('30 ÷ 2 = 15 carros'),
            no('30 ÷ 4 = 7,5 carros', 'As 30 rodas a mais vêm da diferença entre carro e moto: 4 − 2 = 2 rodas por carro.'),
          ]),
        ], 'São 15 carros e 25 motos.'),
        check(numeric({
          prompt: [p('Num quintal há apenas galinhas e coelhos: são 30 cabeças e 84 patas.')],
          ask: 'Quantos coelhos há?',
          answer: 12,
          wrong: [
            { value: 18, feedback: '18 é o número de galinhas. Coelhos: (84 − 60) ÷ 2 = 12.' },
            { value: 24, feedback: '24 é o excesso de patas sobre "todas galinhas". Cada coelho acrescenta 2 patas: 24 ÷ 2 = 12.' },
            { value: 15, feedback: 'Isso divide as cabeças igualmente, sem usar o total de patas.' },
          ],
          solution: ['$Todas galinhas: 30 × 2 = 60 patas', '$(84 − 60) ÷ 2 = 12 coelhos'],
        })),
      ],
      practice: [
        gen(legsGen),
        numeric({
          prompt: [p('Numa locadora há apenas bicicletas e triciclos: são 25 veículos e 62 rodas no total.')],
          ask: 'Quantos triciclos há?',
          answer: 12,
          wrong: [
            { value: 13, feedback: '13 é o número de bicicletas. Triciclos: 62 − 2 × 25 = 12 rodas a mais, uma por triciclo.' },
            { value: 6, feedback: 'Cada triciclo tem só 1 roda a mais que uma bicicleta (3 − 2): as 12 rodas extras são 12 triciclos.' },
            { value: 12.5, feedback: 'Isso divide os veículos igualmente, sem usar o total de rodas.' },
          ],
          hints: ['Se todos fossem bicicletas, seriam 2 × 25 = 50 rodas.', 'Cada triciclo acrescenta 1 roda: as rodas que faltam dão o número de triciclos.'],
          solution: ['$Todas bicicletas: 50 rodas', '$62 − 50 = 12 rodas a mais → 12 triciclos'],
        }),
        gen(substitutionGen),
      ],
      challenge: [gen(legsGen), gen(ticketsGen), gen(coinsGen)],
      recap: [
        'Duas incógnitas pedem duas equações.',
        'Suponha todos de um tipo e compare com o real.',
        'Diferença total ÷ diferença por unidade.',
      ],
    })),

    stage('substituicao', 'fundamentos', 'Método da substituição', 'Resolver sistemas isolando uma incógnita numa equação e substituindo na outra, em problemas de ingressos, idades e relações entre quantidades.', () => ({
      learn: [
        text('No **método da substituição**, isole uma incógnita numa das equações (por exemplo, m = 200 − i) e troque-a na outra. Sobra uma equação com uma incógnita só, que você já sabe resolver. Depois, volte à equação isolada para achar a segunda.'),
        example('Ingressos', 'Foram vendidos 200 ingressos, entre inteiras (R$ 30,00) e meias (R$ 15,00), arrecadando R$ 4.500,00. Quantas inteiras foram vendidas?', [
          step('Equações:', 'i + m = 200; 30i + 15m = 4.500'),
          step('Isole m na primeira:', 'm = 200 − i'),
          askStep('Substitua na segunda: 30i + 15(200 − i) = 4.500.', 'Quanto vale i?', [
            ok('15i + 3.000 = 4.500 → i = 100'),
            no('30i + 3.000 − i = 4.500', 'O 15 multiplica todo o parêntese: 15 × 200 − 15i.'),
          ]),
        ], 'Foram 100 inteiras e 100 meias.'),
        check(order({
          prompt: [formula('x + y = 25', 'y = x + 7')],
          ask: 'Coloque os passos da substituição em ordem.',
          steps: ['x + (x + 7) = 25', '2x + 7 = 25', '2x = 18', 'x = 9', 'y = 9 + 7 = 16'],
          why: 'Troca-se y por x + 7 na primeira equação, resolve-se em x e volta-se à segunda para achar y.',
          solution: ['$x = 9 e y = 16', 'Confira: 9 + 16 = 25.'],
        })),
        key('Escolha a mais fácil', 'Isole a incógnita que já está "quase sozinha" (com coeficiente 1). Depois de achar uma incógnita, a outra sai da equação isolada.'),
        reveal('E se as duas pistas disserem a mesma coisa?', 'Então o sistema tem infinitas soluções: por exemplo, x + y = 10 e 2x + 2y = 20 são a mesma informação. Se as pistas se contradizem (x + y = 10 e x + y = 12), não há solução. Problemas bem formulados trazem duas pistas independentes.'),
      ],
      practice: [gen(substitutionGen), gen(ticketsGen), gen(legsGen)],
      challenge: [gen(ticketsGen), gen(substitutionGen), gen(ticketsGen)],
      recap: [
        'Isole uma incógnita e substitua na outra equação.',
        'Resolva a equação de uma incógnita só.',
        'Volte para achar a segunda incógnita e confira.',
      ],
    })),

    stage('adicao', 'aplicacoes', 'Somar ou subtrair as equações', 'Eliminar uma incógnita somando ou subtraindo as equações — em somas e diferenças, compras repetidas e moedas — e ver a solução como o ponto de encontro de duas retas.', () => ({
      learn: [
        text('Quando os coeficientes de uma incógnita são **iguais** (ou **opostos**), subtrair (ou somar) as equações faz essa incógnita desaparecer. Em "3 cadernos e 2 canetas custam R$ 31,00; 2 cadernos e 2 canetas custam R$ 23,00", subtrair as compras deixa só 1 caderno = R$ 8,00.'),
        lab({
          title: 'A solução é um cruzamento',
          intro: 'Cada equação do sistema é uma reta. A reta azul é x + y = s; a laranja, y = x + d. Ajuste s e d.',
          params: [
            { key: 's', label: 'Soma (x + y = s)', min: 2, max: 20, step: 1, value: 14, format: (v) => `${v}` },
            { key: 'd', label: 'Diferença (y = x + d)', min: -10, max: 10, step: 1, value: 4, format: (v) => `${v}` },
          ],
          readouts: ({ s, d }) => [
            { label: 'Cruzamento: x', value: num((s - d) / 2, 1) },
            { label: 'Cruzamento: y', value: num((s + d) / 2, 1) },
            { label: 'Solução do sistema', value: `(${num((s - d) / 2, 1)}; ${num((s + d) / 2, 1)})`, big: true, tone: 'brass' },
          ],
          viz: ({ s, d }) => ({
            kind: 'chart',
            xLabel: 'x',
            yLabel: 'y',
            xMin: -5,
            xMax: 20,
            series: [
              { label: `x + y = ${s}`, tone: 'sky', points: [[-5, s + 5], [20, s - 20]] },
              { label: `y = x + ${d}`, tone: 'ember', points: [[-5, -5 + d], [20, 20 + d]] },
            ],
            markers: [{ x: (s - d) / 2, y: (s + d) / 2, label: 'solução', tone: 'brass' }],
            summary: `As retas se cruzam em x = ${num((s - d) / 2, 1)} e y = ${num((s + d) / 2, 1)}`,
          }),
          goal: {
            task: 'Ajuste as retas para que se cruzem no ponto (6; 4).',
            done: ({ s, d }) => s === 10 && d === -2,
            success: 'Isso: x + y = 10 e y = x − 2. Somando as equações (x + y = 10 e −x + y = −2), 2y = 8: y = 4 e x = 6.',
          },
          insight: 'Resolver o sistema é achar o único ponto que está nas duas retas ao mesmo tempo.',
        }),
        key('Eliminação', 'Coeficientes iguais: subtraia as equações. Coeficientes opostos: some. Se nenhum combinar, multiplique uma equação por um número antes.'),
        example('Soma e diferença', 'A soma de dois números é 58, e a diferença é 14. Quais são eles?', [
          step('Equações:', 'x + y = 58; x − y = 14'),
          askStep('Os coeficientes de y são opostos (+1 e −1).', 'O que fazer?', [
            ok('Somar: 2x = 72 → x = 36; y = 22'),
            no('Subtrair: 2y = 44 → y = 22, e parar', 'Subtrair também funciona, mas é preciso achar o outro número: x = 58 − 22 = 36.'),
          ]),
        ], 'Os números são 36 e 22.'),
        example('Duas compras', '3 cadernos e 2 canetas custam R$ 31,00; 2 cadernos e 2 canetas custam R$ 23,00. Qual é o preço de uma caneta?', [
          step('Subtraia as compras:', '1 caderno = 31 − 23 = R$ 8,00'),
          step('Volte a uma delas:', '2 × 8 + 2c = 23 → 2c = 7 → c = R$ 3,50'),
        ], 'Cada caneta custa R$ 3,50.'),
        check(numeric({
          prompt: [p('Um cofrinho tem 40 moedas, todas de 50 centavos ou de R$ 1,00, que somam R$ 31,00.')],
          ask: 'Quantas moedas de R$ 1,00 há?',
          answer: 22,
          wrong: [
            { value: 18, feedback: '18 é o número de moedas de 50 centavos.' },
            { value: 11, feedback: 'R$ 11,00 é o valor a mais sobre "todas de 50 centavos" (R$ 20,00). Cada moeda de R$ 1,00 acrescenta R$ 0,50: 11 ÷ 0,5 = 22.' },
            { value: 20, feedback: 'Isso divide as moedas igualmente, sem usar o valor total.' },
          ],
          solution: ['$Todas de 50 centavos: 40 × 0,5 = 20', '$(31 − 20) ÷ 0,5 = 22 moedas de R$ 1,00'],
        })),
      ],
      practice: [gen(sumDiffGen), gen(purchaseGen), gen(coinsGen)],
      challenge: [gen(purchaseGen), gen(coinsGen), gen(sumDiffGen)],
      recap: [
        'Coeficientes iguais: subtraia; opostos: some.',
        'A solução é o cruzamento das duas retas.',
        'Achou uma incógnita? Volte para achar a outra.',
      ],
    })),

    stage('maestria', 'maestria', 'Maestria: sistemas em situações novas', 'Resolver problemas inéditos que pedem montar e resolver sistemas — misturas, ingressos, moedas e compras — escolhendo o método mais rápido.', () => ({
      learn: [
        strategy('Sistemas em 4 passos', '1) Dê nome às duas incógnitas. 2) Escreva uma equação para cada informação (uma de quantidade, outra de valor, em geral). 3) Elimine uma incógnita por substituição, adição ou suposição. 4) Ache a outra e confira nas duas pistas.'),
        example('Mistura de cafés', 'Uma torrefação mistura café de R$ 20,00 o quilo com café de R$ 30,00 o quilo para obter 10 kg a R$ 24,00 o quilo. Quantos quilos do café mais barato entram?', [
          step('Equações:', 'a + b = 10; 20a + 30b = 240'),
          step('Substitua b = 10 − a:', '20a + 300 − 30a = 240'),
          askStep('−10a = −60.', 'Quanto vale a?', [
            ok('a = 6 kg do café de R$ 20,00'),
            no('a = 4 kg', '4 kg é a quantidade do café de R$ 30,00. Como o preço médio (R$ 24,00) está mais perto do mais barato, ele entra em maior quantidade.'),
          ]),
        ], 'Entram 6 kg do café de R$ 20,00 e 4 kg do de R$ 30,00.'),
        reveal('Por que o preço médio indica a mistura?', 'O preço médio fica mais perto do ingrediente que entra em maior quantidade. Em 6 kg de R$ 20,00 com 4 kg de R$ 30,00, a média (R$ 24,00) está a 4 do mais barato e a 6 do mais caro: as quantidades são inversas às distâncias.'),
        check(numeric({
          prompt: [p('Para um evento, foram vendidos 150 ingressos, entre inteiras de R$ 40,00 e meias de R$ 20,00, com arrecadação de R$ 4.400,00.')],
          ask: 'Quantas meias-entradas foram vendidas?',
          answer: 80,
          wrong: [
            { value: 70, feedback: '70 é o número de inteiras. Meias: 150 − 70 = 80.' },
            { value: 75, feedback: 'Isso divide os ingressos igualmente, sem usar a arrecadação.' },
            { value: 35, feedback: 'Isso divide o excesso sobre "todas meias" (R$ 1.400,00) pelo preço da inteira. Cada inteira acrescenta R$ 20,00: são 70 inteiras.' },
          ],
          solution: ['$Todas meias: 150 × 20 = 3.000', '$Inteiras: (4.400 − 3.000) ÷ 20 = 70', '$Meias: 150 − 70 = 80'],
        })),
      ],
      practice: [gen(legsGen), gen(ticketsGen), gen(coinsGen)],
      challenge: [gen(mixtureGen), gen(purchaseGen), gen(sumDiffGen), gen(ticketsGen)],
      recap: [
        'Uma equação de quantidade, outra de valor.',
        'Escolha o método: suposição, substituição ou adição.',
        'Confira a solução nas duas pistas.',
      ],
    })),
  ],
});
