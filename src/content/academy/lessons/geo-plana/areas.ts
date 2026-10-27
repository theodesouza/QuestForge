/**
 * Aula: Áreas e perímetros — área × perímetro em retângulos e quadrados (unidades m e m²),
 * triângulos, paralelogramos, trapézios e losangos, figuras compostas (decompor ou subtrair),
 * revestimentos (lajotas, tinta) e maestria.
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
import { brl, num, round } from '../../kit/format';
import type { Rand } from '../../types';

// ———————————————————————————————————————————————— geradores: retângulos

const PLOTS = [
  { what: 'Um terreno retangular', a: 'de frente', b: 'de fundo', ask: 'Qual é a área do terreno?' },
  { what: 'Uma quadra de vôlei de praia', a: 'de comprimento', b: 'de largura', ask: 'Qual é a área da quadra?' },
  { what: 'Uma horta retangular', a: 'de comprimento', b: 'de largura', ask: 'Qual é a área da horta?' },
];

/** Área do retângulo: base × altura, em m². */
function rectAreaGen(r: Rand) {
  for (;;) {
    const g = r.pick(PLOTS);
    const w = r.int(6, 40);
    const h = r.int(4, 30);
    if (w === h) continue;
    if ((w === 12 && h === 25) || (w === 25 && h === 12)) continue; // questão do banco
    return draftNumeric({
      prompt: [p(`${g.what} mede ${w} m ${g.a} por ${h} m ${g.b}.`)],
      ask: g.ask,
      unit: 'm²',
      answer: w * h,
      wrong: [
        { value: w + h, feedback: 'Isso soma as medidas. A área conta os quadradinhos de 1 m²: multiplique comprimento por largura.' },
        { value: 2 * (w + h), feedback: 'Esse é o perímetro, o comprimento do contorno, em metros. A área é a superfície: comprimento × largura.' },
        { value: (w * h) / 2, feedback: 'Isso divide por 2, como na área do triângulo. No retângulo, a área é o produto inteiro.' },
      ],
      hints: ['A área é o número de quadradinhos de 1 m × 1 m que cabem na superfície.', `Multiplique: ${w} × ${h}.`],
      solution: [`$A = ${w} × ${h} = ${num(w * h)} m²`],
    });
  }
}

/** Perímetro com portão: o contorno menos a abertura. */
function perimeterGen(r: Rand) {
  for (;;) {
    const w = r.int(8, 40);
    const h = r.int(5, 30);
    const g = r.int(2, 5);
    if (w === h) continue;
    const ans = 2 * (w + h) - g;
    return draftNumeric({
      prompt: [p(`Um sítio vai cercar um pasto retangular de ${w} m por ${h} m com tela, deixando uma abertura de ${g} m para a porteira, que não leva tela.`)],
      ask: 'Quantos metros de tela serão necessários?',
      unit: 'm',
      answer: ans,
      wrong: [
        { value: 2 * (w + h), feedback: `Esse é o contorno inteiro. A porteira ocupa ${g} m, que não levam tela.` },
        { value: w * h, feedback: 'Essa é a área do pasto, em m². A tela contorna o pasto: é um comprimento.' },
        { value: w + h - g, feedback: 'Isso soma só dois lados. O retângulo tem quatro: dois de cada medida.' },
      ],
      hints: [`Contorno: ${w} + ${h} + ${w} + ${h}.`, `Tire os ${g} m da porteira.`],
      solution: [`$2 × (${w} + ${h}) − ${g} = ${2 * (w + h)} − ${g} = ${ans} m`],
    });
  }
}

/** Área com medidas em centímetros, pedida em metros quadrados. */
function unitAreaGen(r: Rand) {
  const a = r.pick([40, 50, 60, 80, 120, 150]);
  const b = r.pick([25, 30, 40, 50, 75]);
  if (a === b) return unitAreaGen(r);
  const m2 = (a * b) / 10000;
  return draftNumeric({
    prompt: [p(`Uma placa retangular de acrílico mede ${a} cm por ${b} cm.`)],
    ask: 'Qual é a área da placa, em metros quadrados?',
    unit: 'm²',
    answer: m2,
    wrong: [
      { value: a * b, feedback: `Essa é a área em centímetros quadrados (${num(a * b)} cm²). Em m², divida por 10.000, porque 1 m² = 100 cm × 100 cm.` },
      { value: (a * b) / 100, feedback: 'Isso divide por 100. Em área, a conversão é ao quadrado: 1 m² = 10.000 cm².' },
      { value: round(((a + b) * 2) / 100, 2), feedback: 'Esse é o perímetro, em metros. A pergunta é a área.' },
    ],
    hints: [`Passe as medidas para metros: ${num(a / 100)} m e ${num(b / 100)} m.`, 'Multiplique as medidas em metros.'],
    solution: [`$${num(a / 100)} m × ${num(b / 100)} m = ${num(m2, 4)} m²`],
  });
}

// ———————————————————————————————————————————————— geradores: outras figuras

/** Triângulo: base × altura ÷ 2 (ou a altura a partir da área). */
function triangleGen(r: Rand) {
  const b = r.int(4, 30);
  const h = r.int(3, 25);
  const askH = r.next() < 0.4;
  const A = (b * h) / 2;
  if (askH) {
    return draftNumeric({
      prompt: [p(`Um canteiro em forma de triângulo tem ${b} m de base e ${num(A)} m² de área.`)],
      ask: 'Qual é a altura do canteiro em relação a essa base?',
      unit: 'm',
      answer: h,
      wrong: [
        { value: round(A / b, 2), feedback: 'Isso esquece o "÷ 2" da área do triângulo. De base × altura ÷ 2 = área, vem altura = 2 × área ÷ base.' },
        { value: round(2 * A * b, 2), feedback: 'Isso multiplica pela base em vez de dividir.' },
        { value: round(A - b, 2), feedback: 'Isso subtrai a base da área. Desfaça a fórmula: altura = 2 × área ÷ base.' },
      ],
      hints: ['A = base × altura ÷ 2.', `Altura = 2 × ${num(A)} ÷ ${b}.`],
      solution: [`$${b} × h ÷ 2 = ${num(A)} → h = ${num(2 * A)} ÷ ${b} = ${h} m`],
    });
  }
  if (b === 10 && h === 6) return triangleGen(r); // laboratório da teoria
  return draftNumeric({
    prompt: [p(`Uma vela de barco tem a forma de um triângulo com ${b} dm de base e ${h} dm de altura.`)],
    ask: 'Qual é a área da vela, em dm²?',
    unit: 'dm²',
    answer: A,
    wrong: [
      { value: b * h, feedback: 'Essa é a área do retângulo de mesma base e altura. O triângulo é metade dele.' },
      { value: b + h, feedback: 'Isso soma as medidas. A área do triângulo é base × altura ÷ 2.' },
      { value: round((b + h) / 2, 2), feedback: 'Isso faz a média das medidas. Multiplique base por altura e divida por 2.' },
    ],
    hints: ['O triângulo é metade de um retângulo de mesma base e altura.', `A = ${b} × ${h} ÷ 2.`],
    solution: [`$A = ${b} × ${h} ÷ 2 = ${num(A)} dm²`],
  });
}

/** Trapézio: média das bases × altura. */
function trapezoidGen(r: Rand) {
  for (;;) {
    const B = r.int(12, 40);
    const b = r.int(6, B - 4);
    const h = r.int(5, 25);
    if (B === 30 && b === 20 && h === 15) continue; // exemplo da teoria
    const A = ((B + b) * h) / 2;
    return draftNumeric({
      prompt: [p(`Um terreno tem a forma de um trapézio: os lados paralelos medem ${B} m e ${b} m, e a distância entre eles é de ${h} m.`)],
      ask: 'Qual é a área do terreno?',
      unit: 'm²',
      answer: A,
      wrong: [
        { value: (B + b) * h, feedback: 'Isso esquece de dividir por 2. A área do trapézio usa a média das bases: (B + b) ÷ 2 × altura.' },
        { value: B * h, feedback: 'Isso usa só a base maior, como se fosse um retângulo. O trapézio é mais estreito em cima.' },
        { value: (B * b * h) / 2, feedback: 'Isso multiplica as bases. Elas se somam: (B + b) × altura ÷ 2.' },
      ],
      hints: [`Média das bases: (${B} + ${b}) ÷ 2 = ${num((B + b) / 2)}.`, `Multiplique pela altura, ${h}.`],
      solution: [`$A = (${B} + ${b}) × ${h} ÷ 2 = ${num(A)} m²`],
    });
  }
}

/** Losango: diagonal maior × diagonal menor ÷ 2. */
function rhombusGen(r: Rand) {
  for (;;) {
    const D = r.pick([20, 30, 40, 50, 60, 80]);
    const d = r.pick([10, 16, 20, 24, 30, 40]);
    if (d >= D) continue;
    if (D === 60 && d === 40) continue; // exercício da teoria
    const A = (D * d) / 2;
    return draftNumeric({
      prompt: [p(`Um azulejo decorativo tem a forma de um losango com diagonais de ${D} cm e ${d} cm.`)],
      ask: 'Qual é a área do azulejo, em cm²?',
      unit: 'cm²',
      answer: A,
      wrong: [
        { value: D * d, feedback: 'Essa é a área do retângulo em que o losango cabe. O losango ocupa metade dele: divida por 2.' },
        { value: D + d, feedback: 'Isso soma as diagonais. A área do losango é D × d ÷ 2.' },
        { value: (D * d) / 4, feedback: 'Isso divide por 4. O losango é metade do retângulo formado pelas diagonais: divida por 2.' },
      ],
      hints: ['O losango é metade do retângulo cujos lados são as diagonais.', `A = ${D} × ${d} ÷ 2.`],
      solution: [`$A = ${D} × ${d} ÷ 2 = ${num(A)} cm²`],
    });
  }
}

// ———————————————————————————————————————————————— geradores: compostas e revestimentos

/** Terreno em L: retângulo grande menos o canto retirado. */
function lShapeGen(r: Rand) {
  for (;;) {
    const W = r.int(14, 40);
    const H = r.int(10, 30);
    const a = r.int(3, W - 5);
    const b = r.int(3, H - 4);
    if (W === 20 && H === 15 && a === 8 && b === 6) continue; // questão do banco
    const ans = W * H - a * b;
    return draftNumeric({
      prompt: [p(`Um terreno tem forma de L: é um retângulo de ${W} m por ${H} m do qual foi retirado, num dos cantos, um retângulo de ${a} m por ${b} m que pertence ao vizinho.`)],
      ask: 'Qual é a área do terreno?',
      unit: 'm²',
      answer: ans,
      wrong: [
        { value: W * H, feedback: 'Essa é a área do retângulo inteiro. O canto do vizinho precisa ser tirado.' },
        { value: W * H + a * b, feedback: 'Isso soma o canto em vez de tirá-lo.' },
        { value: (W - a) * (H - b), feedback: 'Isso calcula só um retângulo menor. O L tem a área do retângulo grande menos a do canto.' },
        { value: a * b, feedback: 'Essa é a área do canto retirado, e não a do terreno.' },
      ],
      hints: [`Retângulo inteiro: ${W} × ${H} = ${W * H} m².`, `Canto retirado: ${a} × ${b} = ${a * b} m².`],
      solution: [`$${W * H} − ${a * b} = ${ans} m²`],
    });
  }
}

/** Calçada ou moldura ao redor de um retângulo: área externa menos interna. */
function frameGen(r: Rand) {
  for (;;) {
    const L = r.int(5, 20);
    const W = r.int(3, 12);
    const x = r.pick([0.5, 1, 1.5, 2]);
    if (L === W) continue;
    if (L === 8 && W === 4 && x === 1) continue; // exercício da teoria
    const outer = (L + 2 * x) * (W + 2 * x);
    const ans = round(outer - L * W, 2);
    return draftNumeric({
      prompt: [p(`Uma piscina retangular de ${L} m por ${W} m será contornada por uma calçada de ${num(x)} m de largura em toda a volta.`)],
      ask: 'Qual é a área da calçada?',
      unit: 'm²',
      answer: ans,
      wrong: [
        { value: round(2 * (L + W) * x, 2), feedback: 'Isso multiplica o perímetro da piscina pela largura e esquece os quatro cantos da calçada.' },
        { value: round(outer, 2), feedback: 'Essa é a área total, com a piscina. Tire a área da piscina.' },
        { value: round((L + x) * (W + x) - L * W, 2), feedback: `Isso aumenta cada medida só em ${num(x)} m. A calçada fica dos dois lados: cada medida cresce 2 × ${num(x)} m.` },
      ],
      hints: [`Medidas externas: ${num(L + 2 * x)} m por ${num(W + 2 * x)} m.`, `Área externa − área da piscina (${L * W} m²).`],
      solution: [`$${num(L + 2 * x)} × ${num(W + 2 * x)} − ${L} × ${W} = ${num(outer)} − ${L * W} = ${num(ans)} m²`],
    });
  }
}

/** Lajotas: área do piso ÷ área de uma lajota, nas mesmas unidades. */
function tilesGen(r: Rand) {
  for (;;) {
    const s = r.pick([20, 25, 30, 40, 50, 60]);
    const L = (s * r.int(6, 20)) / 100;
    const W = (s * r.int(5, 15)) / 100;
    if (L === W) continue;
    if (s === 40 && ((L === 4 && W === 6) || (L === 6 && W === 4))) continue; // questão do banco
    if (s === 30 && L === 3 && W === 2.4) continue; // exemplo da teoria
    const nL = Math.round((L * 100) / s);
    const nW = Math.round((W * 100) / s);
    const ans = nL * nW;
    const area = round(L * W, 4);
    return draftNumeric({
      prompt: [p(`O piso de um cômodo retangular de ${num(L)} m por ${num(W)} m será coberto com lajotas quadradas de ${s} cm de lado, sem sobras nem cortes.`)],
      ask: 'Quantas lajotas serão necessárias?',
      unit: 'lajotas',
      answer: ans,
      wrong: [
        { value: round(area / (s / 100), 2), feedback: `Isso divide a área pelo lado da lajota (${num(s / 100)} m). Divida pela área da lajota: ${num(s / 100)} × ${num(s / 100)} = ${num((s / 100) ** 2, 4)} m².` },
        { value: round(area / ((4 * s) / 100), 2), feedback: 'Isso divide pelo contorno da lajota. O piso é coberto pela área de cada lajota.' },
        { value: nL + nW, feedback: `Isso soma as lajotas de duas paredes vizinhas (${nL} + ${nW}). O piso é um quadriculado: multiplique.` },
      ],
      hints: [`Ao longo de ${num(L)} m cabem ${num(L * 100)} ÷ ${s} = ${nL} lajotas; ao longo de ${num(W)} m, ${nW}.`, `Multiplique: ${nL} × ${nW}.`],
      solution: [`$${num(L * 100)} cm ÷ ${s} cm = ${nL}; ${num(W * 100)} cm ÷ ${s} cm = ${nW}`, `$${nL} × ${nW} = ${num(ans)} lajotas`],
    });
  }
}

/** Tinta: área das paredes menos aberturas, dividida pelo rendimento e arredondada para cima. */
function paintGen(r: Rand) {
  for (;;) {
    const L = r.int(3, 6);
    const W = r.int(3, 5);
    const H = r.pick([2.5, 2.6, 2.8, 3]);
    const open = r.pick([2, 3, 3.5, 4]);
    const cover = r.pick([10, 12, 15, 20]);
    const walls = round(2 * (L + W) * H - open, 2);
    const cans = Math.ceil(walls / cover - 1e-9);
    if (Number.isInteger(walls / cover)) continue;
    return draftNumeric({
      prompt: [p(`Um quarto mede ${L} m por ${W} m e tem ${num(H)} m de altura. As quatro paredes serão pintadas, exceto a porta e a janela, que somam ${num(open)} m². Cada lata de tinta pinta ${cover} m².`)],
      ask: 'Quantas latas, no mínimo, precisam ser compradas?',
      unit: 'latas',
      answer: cans,
      wrong: [
        { value: Math.floor(walls / cover), feedback: `Isso arredonda para baixo. ${num(walls / cover, 2)} latas não bastam com ${Math.floor(walls / cover)}: é preciso comprar mais uma.` },
        { value: Math.ceil((L * W) / cover - 1e-9), feedback: 'Isso usa a área do chão. As paredes têm área = perímetro do quarto × altura.' },
        { value: Math.ceil((2 * (L + W) * H) / cover - 1e-9), feedback: 'Isso esquece de descontar a porta e a janela.' },
      ],
      hints: [`Área das paredes: 2 × (${L} + ${W}) × ${num(H)} = ${num(2 * (L + W) * H)} m²; tire ${num(open)} m².`, `Divida por ${cover} m² e arredonde para cima.`],
      solution: [`$${num(2 * (L + W) * H)} − ${num(open)} = ${num(walls)} m²`, `$${num(walls)} ÷ ${cover} ≈ ${num(walls / cover, 2)} → ${cans} latas`],
    });
  }
}

/** Custo de um revestimento: área × preço por m². */
function costGen(r: Rand) {
  const L = r.int(4, 12);
  const W = r.int(3, 9);
  const price = r.pick([25, 30, 35, 40, 45, 60]);
  const ans = L * W * price;
  return draftNumeric({
    prompt: [p(`Um salão retangular de ${L} m por ${W} m vai receber piso vinílico, que custa ${brl(price)} o metro quadrado, já instalado.`)],
    ask: 'Quanto custará o piso do salão?',
    prefix: 'R$',
    answer: ans,
    wrong: [
      { value: 2 * (L + W) * price, feedback: 'Isso usa o perímetro do salão. O piso cobre a área: comprimento × largura.' },
      { value: (L + W) * price, feedback: 'Isso soma as medidas. A área é o produto: comprimento × largura.' },
      { value: L * W, feedback: 'Essa é a área, em m². Multiplique pelo preço do metro quadrado.' },
    ],
    hints: [`Área: ${L} × ${W} = ${L * W} m².`, `Custo: ${L * W} × ${num(price)}.`],
    solution: [`$${L} × ${W} = ${L * W} m²`, `$${L * W} × ${num(price)} = ${brl(ans)}`],
  });
}

// ———————————————————————————————————————————————— aula

export const AREAS = lesson({
  id: 'areas',
  topic: 'geo-plana',
  subtopics: ['areas'],
  title: 'Áreas e perímetros',
  summary: 'A diferença entre contorno e superfície, áreas de retângulos, triângulos, trapézios e losangos, figuras compostas por decomposição ou subtração e revestimentos com lajotas e tinta.',
  requires: ['operacoes'],
  stages: [
    stage('retangulos', 'descoberta', 'Área e perímetro', 'Distinguir perímetro (contorno, em m) de área (superfície, em m²) e calculá-los em retângulos e quadrados, inclusive convertendo unidades.', () => ({
      learn: [
        text('O **perímetro** é o comprimento do contorno — quanto de cerca, de rodapé ou de moldura —: a soma dos lados, em metros. A **área** é a medida da superfície — quanto de grama, de piso ou de tinta —: num retângulo, comprimento × largura, em **metros quadrados** (m²), o número de quadradinhos de 1 m × 1 m que cabem nele. São grandezas diferentes: dois terrenos com o mesmo perímetro podem ter áreas bem diferentes.'),
        lab({
          title: 'Mesmo contorno, outra área',
          intro: 'Escolha o comprimento e a largura de um retângulo e compare a área com o perímetro.',
          params: [
            { key: 'w', label: 'Comprimento', min: 1, max: 10, step: 1, value: 2, format: (v) => `${v} m` },
            { key: 'h', label: 'Largura', min: 1, max: 10, step: 1, value: 3, format: (v) => `${v} m` },
          ],
          readouts: ({ w, h }) => [
            { label: 'Perímetro', value: `${2 * (w + h)} m` },
            { label: 'Área', value: `${w * h} m²`, big: true, tone: 'verdigris' },
          ],
          viz: ({ w, h }) => ({
            kind: 'shape',
            shape: 'rect',
            dims: [w, h],
            labels: [`${w} m`, `${h} m`, `${w * h} m²`],
            summary: `Retângulo de ${w} m por ${h} m: perímetro ${2 * (w + h)} m e área ${w * h} m²`,
          }),
          goal: {
            task: 'Ache um retângulo com 24 m² de área e 20 m de perímetro.',
            done: ({ w, h }) => w * h === 24 && 2 * (w + h) === 20,
            success: 'Isso: 6 m por 4 m. Repare que um retângulo de 12 m por 2 m também tem 24 m², mas perímetro de 28 m.',
          },
          insight: 'Área e perímetro não andam juntos: esticar o retângulo aumenta o contorno sem aumentar a superfície.',
        }),
        example('Rodapé e piso', 'Um quarto retangular mede 3 m por 4 m. Quantos metros de rodapé e quantos metros quadrados de piso ele tem?', [
          askStep('Comece pelo rodapé.', 'O que se calcula para o rodapé?', [
            ok('O perímetro: 3 + 4 + 3 + 4 = 14 m'),
            no('A área: 3 × 4 = 12 m²', 'O rodapé contorna o quarto: é um comprimento, e não uma superfície.'),
          ]),
          step('Agora, o piso:', 'área = 3 × 4 = 12 m²'),
        ], 'São 14 m de rodapé e 12 m² de piso.'),
        warn('m ou m²?', 'Perímetro é comprimento (m, cm). Área é superfície (m², cm²). E na conversão de áreas a régua conta duas vezes: 1 m² = 100 cm × 100 cm = 10.000 cm².'),
        check(numeric({
          prompt: [p('Um tapete quadrado tem 2,5 m de lado.')],
          ask: 'Qual é a área do tapete?',
          unit: 'm²',
          answer: 6.25,
          wrong: [
            { value: 10, feedback: 'Esse é o perímetro (4 × 2,5 m). A área é lado × lado.' },
            { value: 5, feedback: 'Isso multiplica o lado por 2. A área do quadrado é lado × lado: 2,5 × 2,5.' },
            { value: 12.5, feedback: 'Isso multiplica 2,5 por 5. A área é 2,5 × 2,5.' },
          ],
          solution: ['$2,5 × 2,5 = 6,25 m²'],
        })),
      ],
      practice: [gen(rectAreaGen), gen(perimeterGen), gen(unitAreaGen)],
      challenge: [gen(unitAreaGen), gen(rectAreaGen), gen(perimeterGen)],
      recap: [
        'Perímetro: soma dos lados (m). Área: comprimento × largura (m²).',
        'Mesmo perímetro não garante mesma área.',
        '1 m² = 10.000 cm².',
      ],
    })),

    stage('figuras', 'fundamentos', 'Triângulos, trapézios e losangos', 'Calcular áreas de triângulos, paralelogramos, trapézios e losangos entendendo cada fórmula como um retângulo transformado.', () => ({
      learn: [
        text('Quase toda fórmula de área vem do retângulo. O **triângulo** é metade de um retângulo de mesma base e altura. O **paralelogramo** vira um retângulo se um triângulo for cortado de um lado e colado no outro: base × altura. O **trapézio** usa a **média das bases** × altura. E o **losango** é metade do retângulo formado pelas suas diagonais.'),
        math('triângulo: [[b × h|2]]', 'paralelogramo: b × h', 'trapézio: [[(B + b) × h|2]]', 'losango: [[D × d|2]]'),
        lab({
          title: 'Metade do retângulo',
          intro: 'Escolha a base e a altura de um triângulo retângulo e compare a área dele com a do retângulo de mesma base e altura.',
          params: [
            { key: 'b', label: 'Base', min: 2, max: 16, step: 1, value: 4, format: (v) => `${v} m` },
            { key: 'h', label: 'Altura', min: 2, max: 12, step: 1, value: 3, format: (v) => `${v} m` },
          ],
          readouts: ({ b, h }) => [
            { label: 'Retângulo', value: `${b * h} m²` },
            { label: 'Triângulo', value: `${num((b * h) / 2)} m²`, big: true, tone: 'verdigris' },
          ],
          viz: ({ b, h }) => ({
            kind: 'shape',
            shape: 'triangle',
            dims: [b, h],
            labels: [`${b} m`, `${h} m`, ''],
            summary: `Triângulo de base ${b} m e altura ${h} m: área ${num((b * h) / 2)} m², metade dos ${b * h} m² do retângulo`,
          }),
          goal: {
            task: 'Com base de 10 m, ache a altura que dá um triângulo de 30 m² de área.',
            done: ({ b, h }) => b === 10 && h === 6,
            success: 'Isso: 10 × 6 ÷ 2 = 30. Para achar a altura direto: 2 × 30 ÷ 10 = 6.',
          },
          insight: 'Dobrar a altura (ou a base) dobra a área; o "÷ 2" vem de o triângulo ser metade do retângulo.',
        }),
        example('Um terreno em trapézio', 'Um terreno tem a forma de um trapézio com bases de 30 m e 20 m e altura de 15 m. Qual é a área?', [
          askStep('O trapézio usa as duas bases.', 'Qual é a média das bases?', [
            ok('(30 + 20) ÷ 2 = 25 m'),
            no('30 + 20 = 50 m', 'A soma é o primeiro passo, mas a área usa a média das bases: (30 + 20) ÷ 2.'),
          ]),
          step('Área:', '25 × 15 = 375 m²'),
        ], 'A área é 375 m², a de um retângulo de 25 m por 15 m.'),
        check(numeric({
          prompt: [p('Uma pipa tem a forma de um losango com diagonais de 60 cm e 40 cm.')],
          ask: 'Qual é a área da pipa, em cm²?',
          unit: 'cm²',
          answer: 1200,
          wrong: [
            { value: 2400, feedback: 'Essa é a área do retângulo formado pelas diagonais. O losango ocupa metade dele.' },
            { value: 100, feedback: 'Isso soma as diagonais. A área do losango é D × d ÷ 2.' },
            { value: 600, feedback: 'Isso divide por 4. O losango é metade do retângulo das diagonais: divida por 2.' },
          ],
          solution: ['$60 × 40 ÷ 2 = 1.200 cm²'],
        })),
      ],
      practice: [gen(triangleGen), gen(trapezoidGen), gen(rhombusGen)],
      challenge: [gen(trapezoidGen), gen(rhombusGen), gen(triangleGen)],
      recap: [
        'Triângulo: b × h ÷ 2; paralelogramo: b × h.',
        'Trapézio: média das bases × altura.',
        'Losango: D × d ÷ 2.',
      ],
    })),

    stage('compostas', 'aplicacoes', 'Figuras compostas e revestimentos', 'Calcular áreas de figuras compostas — decompondo ou subtraindo — e resolver problemas de revestimento com lajotas, tinta e custo por metro quadrado.', () => ({
      learn: [
        text('Figuras compostas se resolvem de dois jeitos: **decompondo** em retângulos e triângulos e somando, ou **completando** um retângulo grande e **subtraindo** o que sobra. Em revestimentos, divida a área a cobrir pela área de uma peça — sempre nas **mesmas unidades** —, e, quando o produto vem em latas ou caixas, **arredonde para cima**.'),
        lab({
          title: 'O canto retirado',
          intro: 'Um terreno de 10 por 8 quadradinhos perdeu um canto quadrado. Escolha o lado do canto retirado.',
          params: [{ key: 'k', label: 'Lado do canto retirado', min: 1, max: 5, step: 1, value: 1, format: (v) => String(v) }],
          readouts: ({ k }) => [
            { label: 'Conta', value: `80 − ${k} × ${k}` },
            { label: 'Área do L', value: `${80 - k * k} quadradinhos`, big: true, tone: 'verdigris' },
          ],
          viz: ({ k }) => ({
            kind: 'grid',
            rows: 8,
            cols: 10,
            cells: Array.from({ length: 80 }, (_, i) => (Math.floor(i / 10) < k && i % 10 >= 10 - k ? null : ('verdigris' as const))),
            legend: [{ tone: 'verdigris', label: 'terreno' }],
            summary: `Retângulo de 10 por 8 sem um canto de ${k} por ${k}: ${80 - k * k} quadradinhos`,
          }),
          goal: {
            task: 'Ache o lado do canto que deixa o terreno com 64 quadradinhos.',
            done: ({ k }) => k === 4,
            success: 'Isso: 80 − 16 = 64. Subtrair o canto é mais rápido do que dividir o L em dois retângulos — e dá o mesmo resultado.',
          },
          insight: 'Retângulo grande menos o que falta: a estratégia de completar a figura.',
        }),
        example('Lajotas na cozinha', 'O piso de uma cozinha de 3 m por 2,4 m será coberto com lajotas quadradas de 30 cm de lado. Quantas lajotas são necessárias?', [
          askStep('Ponha tudo na mesma unidade.', 'Quantas lajotas cabem ao longo dos 3 m?', [
            ok('10, porque 3 m = 300 cm e 300 ÷ 30 = 10'),
            no('Nenhuma inteira, porque 3 ÷ 30 dá menos de 1', 'Antes de dividir, converta: 3 m = 300 cm. Aí 300 ÷ 30 = 10.'),
          ]),
          step('Na outra direção e no total:', '2,4 m = 240 cm → 240 ÷ 30 = 8', '10 × 8 = 80 lajotas'),
        ], 'São 80 lajotas.'),
        reveal('Por que arredondar a tinta para cima?', 'Porque 3,2 latas não existem na loja: com 3 latas falta tinta. Sempre que o resultado é "quantas embalagens", arredonde para o próximo inteiro.'),
        check(numeric({
          prompt: [p('Uma piscina retangular de 8 m por 4 m será contornada por uma calçada de 1 m de largura em toda a volta.')],
          ask: 'Qual é a área da calçada?',
          unit: 'm²',
          answer: 28,
          wrong: [
            { value: 24, feedback: 'Isso multiplica o perímetro da piscina (24 m) pela largura e esquece os quatro cantos da calçada.' },
            { value: 60, feedback: 'Essa é a área total, com a piscina (10 × 6). Tire a área da piscina: 32 m².' },
            { value: 13, feedback: 'Isso aumenta cada medida só 1 m. A calçada fica dos dois lados: as medidas externas são 10 m e 6 m.' },
          ],
          solution: ['$medidas externas: 10 m × 6 m = 60 m²', '$60 − 8 × 4 = 60 − 32 = 28 m²'],
        })),
      ],
      practice: [gen(lShapeGen), gen(frameGen), gen(tilesGen), gen(paintGen)],
      challenge: [gen(tilesGen), gen(paintGen), gen(lShapeGen), gen(frameGen)],
      recap: [
        'Compostas: decomponha e some, ou complete e subtraia.',
        'Revestimento: área a cobrir ÷ área da peça, nas mesmas unidades.',
        'Embalagens: arredonde para cima.',
      ],
    })),

    stage('maestria', 'maestria', 'Maestria: áreas no ENEM', 'Resolver problemas inéditos que combinam áreas de várias figuras, conversões de unidade, revestimentos e custos.', () => ({
      learn: [
        strategy('Áreas em 4 passos', '1) Contorno ou superfície? (cerca e rodapé → perímetro; piso, grama, tinta → área). 2) Desenhe e divida a figura em partes conhecidas (ou complete e subtraia). 3) Ponha todas as medidas na mesma unidade. 4) Conte peças dividindo áreas e arredonde para cima quando forem embalagens.'),
        example('Um jardim com canteiro', 'Um jardim retangular de 12 m por 8 m tem, no centro, um canteiro em forma de losango com diagonais de 6 m e 4 m. O resto do jardim receberá grama. Quantos m² de grama são necessários?', [
          step('Jardim inteiro:', '12 × 8 = 96 m²'),
          askStep('Agora, o canteiro.', 'Qual é a área do losango?', [
            ok('6 × 4 ÷ 2 = 12 m²'),
            no('6 × 4 = 24 m²', 'Essa é a área do retângulo das diagonais. O losango ocupa metade dele.'),
          ]),
          step('Grama:', '96 − 12 = 84 m²'),
        ], 'São necessários 84 m² de grama.'),
        reveal('Dobrar as medidas dobra a área?', 'Não: dobrar comprimento e largura multiplica a área por 4 (2 × 2). Uma foto ampliada para o dobro do tamanho ocupa quatro vezes mais papel.'),
        check(numeric({
          prompt: [p('Uma parede de 5 m por 3 m tem uma janela de 2 m por 1,5 m. Ela será revestida com azulejos que custam R$ 40,00 o metro quadrado.')],
          ask: 'Quanto custarão os azulejos?',
          prefix: 'R$',
          answer: 480,
          wrong: [
            { value: 600, feedback: 'Isso reveste a parede inteira, sem descontar a janela de 3 m².' },
            { value: 12, feedback: 'Essa é a área a revestir, em m². Multiplique pelo preço do metro quadrado.' },
            { value: 640, feedback: 'Isso usa o perímetro da parede (16 m). O azulejo cobre a área.' },
          ],
          solution: ['$parede: 5 × 3 = 15 m²; janela: 2 × 1,5 = 3 m²', '$15 − 3 = 12 m² → 12 × 40 = R$ 480,00'],
        })),
      ],
      practice: [gen(costGen), gen(lShapeGen), gen(tilesGen)],
      challenge: [gen(paintGen), gen(frameGen), gen(trapezoidGen), gen(costGen)],
      recap: [
        'Contorno → perímetro; superfície → área.',
        'Mesmas unidades antes de dividir áreas.',
        'Ampliar medidas k vezes multiplica a área por k².',
      ],
    })),
  ],
});
