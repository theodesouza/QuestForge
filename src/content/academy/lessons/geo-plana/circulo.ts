/**
 * Aula: Círculo e circunferência — comprimento (C = 2πr = πd) e voltas de rodas, área (πr²) e o
 * efeito de mudar o raio, coroas circulares, setores, arcos e semicírculos, e maestria. Usa-se
 * π = 3,14 em todos os cálculos, e os números sorteados dão contas exatas (sem arredondar).
 */
import {
  askStep,
  check,
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
  ok,
  p,
  reveal,
  stage,
  step,
  strategy,
  text,
  warn,
} from '../../kit/build';
import { brl, frac, num, round } from '../../kit/format';
import type { Rand } from '../../types';

const PI = 3.14;
const piText = 'Use π = 3,14.';
/** "=" quando o valor mostrado é exato; "≈" quando foi arredondado. */
const eq = (v: number, d: number) => (Math.abs(round(v, d) - v) < 1e-9 ? '=' : '≈');

// ———————————————————————————————————————————————— geradores: comprimento

/** Comprimento da circunferência a partir do raio ou do diâmetro. */
function circumferenceGen(r: Rand) {
  const useD = r.next() < 0.5;
  const ctx = r.pick([
    { unit: 'm', x: r.int(2, 30), intro: (m: string) => `Um canteiro circular tem ${m}. Ele será contornado por uma fileira de tijolos.`, ask: 'Qual é o comprimento do contorno do canteiro?' },
    { unit: 'cm', x: r.int(8, 16) * 5 * (useD ? 2 : 1), intro: (m: string) => `O tampo de uma mesa redonda tem ${m}. Uma fita decorativa vai contornar a borda.`, ask: 'Quantos centímetros de fita são necessários para uma volta?' },
  ]);
  const { x, unit } = ctx;
  const rad = useD ? x / 2 : x;
  const C = round(2 * PI * rad, 2);
  return draftNumeric({
    prompt: [p(`${ctx.intro(useD ? `${x} ${unit} de diâmetro` : `${x} ${unit} de raio`)} ${piText}`)],
    ask: ctx.ask,
    unit,
    answer: C,
    tolerance: 0.01,
    wrong: [
      useD
        ? { value: round(2 * PI * x, 2), feedback: `Isso usa o diâmetro (${x} ${unit}) como raio em 2πr. Use C = π × d = 3,14 × ${x}.` }
        : { value: round(PI * x, 2), feedback: `Isso multiplica π só pelo raio. O comprimento é 2πr, ou π vezes o diâmetro (${2 * x} ${unit}).` },
      { value: round(PI * rad * rad, 2), feedback: 'Essa é a área do círculo (πr²). O contorno é um comprimento: 2πr.' },
      { value: useD ? x : 2 * x, feedback: 'Esse é o diâmetro. O contorno é π vezes o diâmetro: um pouco mais que o triplo dele.' },
    ],
    hints: [useD ? `O comprimento é π vezes o diâmetro, que já foi dado: ${x} ${unit}.` : `O diâmetro é o dobro do raio: ${2 * x} ${unit}.`, useD ? `C = 3,14 × ${x}.` : `C = 2 × 3,14 × ${x}.`],
    solution: [useD ? `$C = π × d = 3,14 × ${x} = ${num(C)} ${unit}` : `$C = 2πr = 2 × 3,14 × ${x} = ${num(C)} ${unit}`],
  });
}

/** Voltas de uma roda: distância ÷ comprimento de uma volta (a roda de 70 cm fica de fora: questão do banco). */
function turnsGen(r: Rand) {
  for (;;) {
    const ctx = r.pick([
      { ds: [10, 12, 15, 20], text: (d: number, dist: string) => `As rodas de um patinete têm ${d} cm de diâmetro. Num passeio, o patinete avançou ${dist} m, com as rodas girando sem escorregar.` },
      { ds: [50, 56, 60, 64], text: (d: number, dist: string) => `As rodas de uma cadeira de rodas têm ${d} cm de diâmetro. A cadeira avançou ${dist} m num corredor reto, com as rodas girando sem escorregar.` },
    ]);
    const d = r.pick(ctx.ds);
    const n = r.pick([100, 250, 400, 500, 1000, 1500]);
    if (d === 60 && n === 500) continue; // exercício da teoria
    const Cm = (PI * d) / 100;
    const dist = round(n * Cm, 2);
    return draftNumeric({
      prompt: [p(`${ctx.text(d, num(dist))} ${piText}`)],
      ask: 'Quantas voltas completas cada roda deu?',
      unit: 'voltas',
      answer: n,
      wrong: [
        { value: n / 2, feedback: `Isso usa 2π × ${d}: o diâmetro no lugar do raio. Uma volta mede π × d = ${num(Cm, 4)} m.` },
        { value: round(dist / (PI * d), 2), feedback: 'Isso mistura unidades: a distância está em metros e o diâmetro, em centímetros. Converta antes de dividir.' },
        { value: round(dist / (d / 100), 2), feedback: 'Isso divide pelo diâmetro. Em cada volta, a roda avança o comprimento da circunferência, π × d.' },
      ],
      hints: [`Uma volta: C = π × d = 3,14 × ${num(d / 100)} m = ${num(Cm, 4)} m.`, `Voltas = ${num(dist)} ÷ ${num(Cm, 4)}.`],
      solution: [`$C = 3,14 × ${num(d / 100)} = ${num(Cm, 4)} m`, `$${num(dist)} ÷ ${num(Cm, 4)} = ${num(n)} voltas`],
    });
  }
}

/** Distância percorrida: número de voltas × comprimento de uma volta. */
function distanceGen(r: Rand) {
  const ctx = r.pick([
    { rads: [15, 20, 25], text: (rad: number, n: number) => `A roda de um carrinho de mão tem ${rad} cm de raio e deu ${n} voltas inteiras, sem deslizar.`, ask: 'Quantos metros o carrinho percorreu?' },
    { rads: [50, 60, 75], text: (rad: number, n: number) => `O cilindro de um rolo compactador de asfalto tem ${rad} cm de raio. Para compactar uma rua, ele deu ${n} voltas, sem deslizar.`, ask: 'Quantos metros de rua o rolo percorreu?' },
  ]);
  const rad = r.pick(ctx.rads);
  const n = r.pick([50, 100, 150, 200, 300]);
  const Ccm = round(2 * PI * rad, 2);
  const ans = round((n * Ccm) / 100, 2);
  return draftNumeric({
    prompt: [p(`${ctx.text(rad, n)} ${piText}`)],
    ask: ctx.ask,
    unit: 'm',
    answer: ans,
    wrong: [
      { value: round(n * Ccm, 2), feedback: 'Essa é a distância em centímetros. Converta para metros: divida por 100.' },
      { value: round(ans / 2, 2), feedback: 'Isso multiplica π pelo raio. Uma volta mede 2πr: o dobro.' },
      { value: round((n * 2 * rad) / 100, 2), feedback: 'Isso multiplica as voltas pelo diâmetro. Em cada volta, a roda avança o contorno: π vezes o diâmetro.' },
    ],
    hints: [`Uma volta: 2 × 3,14 × ${rad} cm = ${num(Ccm)} cm = ${num(Ccm / 100, 4)} m.`, `Multiplique o comprimento de uma volta pelas ${n} voltas.`],
    solution: [`$C = 2 × 3,14 × ${rad} = ${num(Ccm)} cm = ${num(Ccm / 100, 4)} m`, `$${n} × ${num(Ccm / 100, 4)} = ${num(ans)} m`],
  });
}

// ———————————————————————————————————————————————— geradores: área

/** Área do círculo: πr² (cuidado com o diâmetro). */
function circleAreaGen(r: Rand) {
  for (;;) {
    const useD = r.next() < 0.5;
    const x = r.int(3, 20) * (useD ? 2 : 1);
    const rad = useD ? x / 2 : x;
    if (useD && x === 6) continue; // exercício da teoria
    const A = round(PI * rad * rad, 2);
    const ctx = r.pick([
      { intro: (m: string) => `Um irrigador gira e molha um círculo de ${m} no gramado.`, ask: 'Qual é a área molhada?' },
      { intro: (m: string) => `Uma pista de patinação circular tem ${m}. O piso será todo trocado.`, ask: 'Qual é a área do piso da pista?' },
    ]);
    return draftNumeric({
      prompt: [p(`${ctx.intro(useD ? `${x} m de diâmetro` : `${x} m de raio`)} ${piText}`)],
      ask: ctx.ask,
      unit: 'm²',
      answer: A,
      tolerance: 0.01,
      wrong: [
        ...(useD ? [{ value: round(PI * x * x, 2), feedback: `Isso usa o diâmetro (${x} m) como raio. O raio é metade: ${num(rad)} m.` }] : []),
        { value: round(2 * PI * rad, 2), feedback: 'Esse é o comprimento da circunferência (2πr). A área é πr².' },
        { value: round(PI * rad, 2), feedback: 'Isso esquece de elevar o raio ao quadrado: A = π × r × r.' },
        { value: round((PI * rad) ** 2, 2), feedback: 'Isso eleva ao quadrado também o π. Em πr², só o raio vai ao quadrado.' },
      ],
      hints: [useD ? `Raio = metade do diâmetro = ${num(rad)} m.` : `O raio é ${x} m; eleve-o ao quadrado.`, `A = 3,14 × ${num(rad)}² = 3,14 × ${num(rad * rad)}.`],
      solution: [`$A = πr² = 3,14 × ${num(rad * rad)} = ${num(A)} m²`],
    });
  }
}

/** Pizzas: comparar o preço do centímetro quadrado. */
function pizzaGen(r: Rand) {
  for (;;) {
    const d1 = r.pick([25, 30, 35]);
    const d2 = d1 + r.pick([5, 10, 15]);
    const p1 = r.pick([30, 35, 40, 45]);
    const p2 = p1 + r.pick([10, 15, 20, 25, 30]);
    const a1 = PI * (d1 / 2) ** 2;
    const a2 = PI * (d2 / 2) ** 2;
    const u1 = (p1 / a1) * 100;
    const u2 = (p2 / a2) * 100;
    if (Math.abs(u1 - u2) / Math.min(u1, u2) < 0.06) continue;
    if (d1 === 30 && d2 === 40 && p1 === 40 && p2 === 60) continue; // exemplo da teoria
    const area = (d: number, a: number) => `3,14 × ${num(d / 2)}² ${eq(a, 1)} ${num(a, 1)} cm²`;
    const both = `A média tem ${num(a1, 1)} cm² e sai a cerca de ${brl(u1)} a cada 100 cm²; a grande, ${num(a2, 1)} cm², a cerca de ${brl(u2)}.`;
    return draftChoice({
      prompt: [p(`Uma pizzaria vende a pizza média, de ${d1} cm de diâmetro, por ${brl(p1)}, e a grande, de ${d2} cm de diâmetro, por ${brl(p2)}. ${piText}`)],
      ask: 'Qual pizza tem o centímetro quadrado mais barato?',
      options: [
        u2 < u1 ? ok('A grande') : no('A grande', both),
        u1 < u2 ? ok('A média') : no('A média', both),
        no('As duas têm o mesmo preço por cm²', `Os preços por 100 cm² são diferentes: cerca de ${brl(u1)} na média e ${brl(u2)} na grande.`),
      ],
      hints: ['Calcule a área de cada pizza com o raio (metade do diâmetro).', 'Divida o preço pela área: o menor resultado é o mais barato.'],
      solution: [`$média: ${area(d1, a1)} → cerca de ${brl(u1)} por 100 cm²`, `$grande: ${area(d2, a2)} → cerca de ${brl(u2)} por 100 cm²`],
    });
  }
}

/** Mudar o raio muda a área com o quadrado do fator. */
function scaleAreaGen(r: Rand) {
  const k = r.pick([2, 3, 4, 1.5]);
  const A0 = r.pick([50, 80, 120, 200, 314]);
  const ans = round(A0 * k * k, 2);
  const change = k === 2 ? 'o dobro do raio' : k === 3 ? 'o triplo do raio' : k === 4 ? 'o quádruplo do raio' : 'o raio 50% maior';
  return draftNumeric({
    prompt: [p(`Um espelho circular tem ${num(A0)} cm² de área. Um modelo maior, também circular, tem ${change}.`)],
    ask: 'Qual é a área do modelo maior?',
    unit: 'cm²',
    answer: ans,
    wrong: [
      { value: round(A0 * k, 2), feedback: `Isso multiplica a área por ${num(k)}, como o raio. A área depende de r²: multiplique por ${num(k)}² = ${num(k * k)}.` },
      { value: round(A0 * PI * k * k, 2), feedback: `Isso multiplica por π outra vez. O π já está na área original; só o fator ${num(k)}² = ${num(k * k)} muda.` },
      ...(k === 1.5 ? [{ value: A0 * 2, feedback: 'Isso soma os 50% duas vezes (50% + 50% = 100%). Com o raio 1,5 vez maior, a área fica 1,5² = 2,25 vezes maior: 125% a mais.' }] : []),
    ],
    hints: ['A = πr²: se o raio fica k vezes maior, a área fica k² vezes maior.', `Fator: ${num(k)}² = ${num(k * k)}.`],
    solution: [`$fator da área: ${num(k)}² = ${num(k * k)}`, `$${num(A0)} × ${num(k * k)} = ${num(ans)} cm²`],
  });
}

// ———————————————————————————————————————————————— geradores: coroas, setores e semicírculos

/** Coroa circular: π(R² − r²), com R = r + largura. */
function ringGen(r: Rand) {
  for (;;) {
    const rin = r.int(3, 25);
    const w = r.int(1, 5);
    const R = rin + w;
    if (rin === 20 && w === 2) continue; // questão do banco
    if (rin === 10 && w === 3) continue; // exemplo da teoria
    const ans = round(PI * (R * R - rin * rin), 2);
    return draftNumeric({
      prompt: [p(`Um lago circular tem ${rin} m de raio. Em volta dele será plantada uma faixa de grama de ${w} m de largura, formando uma coroa circular. ${piText}`)],
      ask: 'Qual é a área da faixa de grama?',
      unit: 'm²',
      answer: ans,
      tolerance: 0.01,
      wrong: [
        { value: round(PI * w * w, 2), feedback: `Isso calcula 3,14 × ${w}²: subtrai os raios antes de elevar ao quadrado. Eleve cada raio ao quadrado e só depois subtraia.` },
        { value: round(PI * R * R, 2), feedback: 'Essa é a área do círculo grande inteiro, com o lago. Tire a área do lago.' },
        { value: round(PI * rin * rin, 2), feedback: 'Essa é a área do lago. A grama fica no anel entre o círculo grande e o lago.' },
        { value: round(2 * PI * R * w, 2), feedback: 'Isso multiplica o contorno externo pela largura e conta grama a mais: por dentro o anel é mais curto. Use π(R² − r²).' },
      ],
      hints: [`Raio externo: ${rin} + ${w} = ${R} m.`, `Área = 3,14 × (${R}² − ${rin}²) = 3,14 × (${R * R} − ${rin * rin}).`],
      solution: [`$R = ${rin} + ${w} = ${R} m`, `$3,14 × (${R * R} − ${rin * rin}) = 3,14 × ${R * R - rin * rin} = ${num(ans)} m²`],
    });
  }
}

/** Setor e arco: a fração ângulo ÷ 360° do círculo inteiro. */
function sectorGen(r: Rand) {
  for (;;) {
    const ang = r.pick([30, 45, 60, 90, 120, 135, 150, 180, 240, 270]);
    const rad = r.pick([4, 5, 6, 8, 10, 12, 15]);
    const arc = r.next() < 0.4;
    // Só combinações com conta exata em centésimos (3,14 × ... × ângulo/360).
    if (arc ? (rad * ang) % 90 !== 0 : (rad * rad * ang) % 180 !== 0) continue;
    if (ang === 60 && rad === 6) continue; // exercício da teoria
    const f = ang / 360;
    const part = frac(ang, 360);
    const ans = round(arc ? f * 2 * PI * rad : f * PI * rad * rad, 2);
    return draftNumeric({
      prompt: [p(`Num gráfico de setores desenhado com ${rad} cm de raio, um dos setores tem ângulo central de ${ang}°. ${piText}`)],
      ask: arc ? 'Qual é o comprimento do arco desse setor?' : 'Qual é a área desse setor?',
      unit: arc ? 'cm' : 'cm²',
      answer: ans,
      tolerance: 0.01,
      wrong: arc
        ? [
            { value: round(2 * PI * rad, 2), feedback: `Esse é o contorno do círculo inteiro. O arco é só a fração ${ang}/360 = ${part} dele.` },
            { value: round(f * PI * rad * rad, 2), feedback: 'Essa é a área do setor. O arco é um comprimento: a fração de 2πr.' },
            { value: round(f * PI * rad, 2), feedback: 'Isso usa πr. O comprimento da circunferência inteira é 2πr.' },
          ]
        : [
            { value: round(PI * rad * rad, 2), feedback: `Essa é a área do círculo inteiro. O setor é só a fração ${ang}/360 = ${part} dele.` },
            { value: round(f * 2 * PI * rad, 2), feedback: 'Esse é o comprimento do arco. A área do setor é a fração de πr².' },
            { value: round((ang / 100) * PI * rad * rad, 2), feedback: 'Isso usa o ângulo como porcentagem. A volta completa tem 360°, e não 100.' },
          ],
      hints: [`O setor é ${ang}/360 = ${part} do círculo.`, arc ? `Arco = ${part} × 2 × 3,14 × ${rad}.` : `Área = ${part} × 3,14 × ${rad}².`],
      solution: [arc ? `$${part} × 2 × 3,14 × ${rad} = ${part} × ${num(2 * PI * rad)} = ${num(ans)} cm` : `$${part} × 3,14 × ${rad * rad} = ${part} × ${num(PI * rad * rad)} = ${num(ans)} cm²`],
    });
  }
}

/** Janela em arco: retângulo com um semicírculo em cima. */
function windowGen(r: Rand) {
  const w = r.pick([60, 80, 100, 120]);
  const h = r.pick([80, 100, 120, 150]);
  const rad = w / 2;
  const semi = round((PI * rad * rad) / 2, 2);
  const ans = w * h + semi;
  return draftNumeric({
    prompt: [p(`Uma janela tem a forma de um retângulo de ${w} cm de largura por ${h} cm de altura, com um semicírculo apoiado no lado de cima, de diâmetro igual à largura. ${piText}`)],
    ask: 'Qual é a área de vidro da janela?',
    unit: 'cm²',
    answer: ans,
    wrong: [
      { value: round(w * h + 2 * semi, 2), feedback: 'Isso soma o círculo inteiro. Em cima da janela há só metade dele.' },
      { value: round(w * h + (PI * w * w) / 2, 2), feedback: `Isso usa a largura (${w} cm) como raio. O raio do semicírculo é metade dela: ${rad} cm.` },
      { value: w * h, feedback: 'Essa é só a parte retangular. Some a área do semicírculo.' },
    ],
    hints: [`Retângulo: ${w} × ${h} = ${num(w * h)} cm².`, `Semicírculo de raio ${rad} cm: 3,14 × ${rad}² ÷ 2.`],
    solution: [`$retângulo: ${w} × ${h} = ${num(w * h)} cm²`, `$semicírculo: 3,14 × ${num(rad * rad)} ÷ 2 = ${num(semi)} cm²`, `$total: ${num(w * h)} + ${num(semi)} = ${num(ans)} cm²`],
  });
}

// ———————————————————————————————————————————————— geradores: maestria

/** Cercar um círculo: do comprimento ao raio e do raio à área. */
function fenceGen(r: Rand) {
  const rad = r.pick([5, 6, 8, 10, 12, 15, 20]);
  const C = round(2 * PI * rad, 2);
  const A = round(PI * rad * rad, 2);
  const ctx = r.pick([
    { intro: `Com ${num(C)} m de tela, sem sobras, será cercado um galinheiro circular.`, ask: 'Qual será a área do galinheiro?' },
    { intro: `Um cordão de luzes de ${num(C)} m vai contornar, sem sobras, a borda de um tablado circular.`, ask: 'Qual é a área do tablado?' },
  ]);
  return draftNumeric({
    prompt: [p(`${ctx.intro} ${piText}`)],
    ask: ctx.ask,
    unit: 'm²',
    answer: A,
    tolerance: 0.01,
    wrong: [
      { value: round(PI * 4 * rad * rad, 2), feedback: `Isso usa ${num(C)} ÷ 3,14 = ${2 * rad} m, que é o diâmetro, como raio. O raio é metade: ${rad} m.` },
      { value: round((C / 4) ** 2, 2), feedback: 'Essa seria a área de um cercado quadrado com a mesma tela (lado igual a um quarto dela). O círculo cerca mais área.' },
      { value: round(PI * C * C, 2), feedback: 'Isso usa o comprimento da tela como raio. Primeiro ache o raio: r = C ÷ (2 × 3,14).' },
    ],
    hints: [`Do comprimento ao raio: r = ${num(C)} ÷ (2 × 3,14) = ${num(C)} ÷ 6,28.`, `Depois, A = 3,14 × r², com r = ${rad} m.`],
    solution: [`$r = ${num(C)} ÷ 6,28 = ${rad} m`, `$A = 3,14 × ${rad}² = 3,14 × ${rad * rad} = ${num(A)} m²`],
  });
}

/** Raias de uma pista: a diferença de uma volta só depende da distância entre as raias. */
function laneGen(r: Rand) {
  const R = r.pick([30, 36, 40, 50]);
  const g = r.pick([1, 1.5, 2, 2.5, 3, 4]);
  const ans = round(2 * PI * g, 2);
  return draftNumeric({
    prompt: [p(`Numa pista circular, a raia de dentro tem ${R} m de raio, e a de fora fica ${num(g)} m mais afastada do centro. Dois corredores dão uma volta completa, cada um na sua raia. ${piText}`)],
    ask: 'Quantos metros a mais corre quem está na raia de fora?',
    unit: 'm',
    answer: ans,
    tolerance: 0.01,
    wrong: [
      { value: round(2 * PI * (R + g), 2), feedback: 'Essa é a volta inteira na raia de fora. A pergunta é a diferença entre as duas voltas.' },
      { value: round(PI * g, 2), feedback: `Isso usa π × ${num(g)}. A diferença é 2π(R + ${num(g)}) − 2πR = 2π × ${num(g)}.` },
      { value: round(PI * ((R + g) ** 2 - R * R), 2), feedback: 'Essa é a área do anel entre as raias. A diferença pedida é de comprimento: 2π × (diferença dos raios).' },
    ],
    hints: [`Volta de dentro: 2 × 3,14 × ${R}; volta de fora: 2 × 3,14 × ${num(R + g)}.`, `Subtraia: 2 × 3,14 × (${num(R + g)} − ${R}) = 2 × 3,14 × ${num(g)}.`],
    solution: [`$2π(R + ${num(g)}) − 2πR = 2π × ${num(g)}`, `$2 × 3,14 × ${num(g)} = ${num(ans)} m`],
  });
}

// ———————————————————————————————————————————————— aula

export const CIRCULO = lesson({
  id: 'circulo',
  topic: 'geo-plana',
  subtopics: ['circulo'],
  title: 'Círculo e circunferência',
  summary: 'O número π, o comprimento da circunferência e as voltas de uma roda, a área do círculo e o efeito de mudar o raio, coroas circulares, setores, arcos e semicírculos.',
  requires: ['areas'],
  stages: [
    stage('comprimento', 'descoberta', 'Comprimento da circunferência', 'Calcular o comprimento de uma circunferência a partir do raio ou do diâmetro e usá-lo em problemas de rodas e voltas.', () => ({
      learn: [
        text('Em qualquer circunferência, o contorno é um pouco mais que **3 vezes o diâmetro**: essa razão é o número **π** ≈ 3,14. Por isso, o comprimento é C = π × d, ou C = 2 × π × r (o diâmetro é o dobro do raio). Uma roda que gira sem deslizar avança, a cada volta, exatamente o comprimento da sua circunferência.'),
        math('C = π × d = 2 × π × r', 'π ≈ 3,14'),
        lab({
          title: 'A roda que avança',
          intro: 'Escolha o diâmetro de uma roda e o número de voltas, e veja quanto ela avança.',
          params: [
            { key: 'd', label: 'Diâmetro da roda', min: 10, max: 100, step: 5, value: 20, format: (v) => `${v} cm` },
            { key: 'n', label: 'Voltas', min: 1, max: 20, step: 1, value: 1, format: (v) => String(v) },
          ],
          readouts: ({ d, n }) => [
            { label: 'Uma volta', value: `3,14 × ${d} = ${num(PI * d, 2)} cm` },
            { label: 'Distância percorrida', value: `${num((n * PI * d) / 100, 4)} m`, big: true, tone: 'verdigris' },
          ],
          viz: ({ d }) => ({
            kind: 'shape',
            shape: 'circle',
            dims: [d / 2],
            labels: [`r = ${num(d / 2)} cm`, '', `uma volta: ${num(PI * d, 2)} cm`],
            summary: `Roda de ${d} cm de diâmetro: cada volta avança ${num(PI * d, 2)} cm`,
          }),
          goal: {
            task: 'Ache o diâmetro de uma roda que avança exatamente 1,57 m por volta.',
            done: ({ d }) => d === 50,
            success: 'Isso: 3,14 × 50 cm = 157 cm = 1,57 m. Do comprimento ao diâmetro, divida por π: 157 ÷ 3,14 = 50.',
          },
          insight: 'Dobrar o diâmetro dobra o quanto a roda avança por volta: o comprimento é proporcional ao diâmetro.',
        }),
        example('A pista circular', 'Uma pista de corrida circular tem 50 m de raio. Quantos metros tem uma volta? (Use π = 3,14.)', [
          askStep('A medida dada é o raio.', 'Qual conta dá o comprimento da volta?', [
            ok('C = 2πr = 2 × 3,14 × 50'),
            no('C = πr = 3,14 × 50', 'π vezes o raio dá só meia volta. Use π vezes o diâmetro, ou 2π vezes o raio.'),
          ]),
          step('Conta:', 'C = 2 × 3,14 × 50 = 314 m'),
        ], 'Uma volta na pista tem 314 m.'),
        check(numeric({
          prompt: [p('As rodas de uma cadeira de rodas têm 60 cm de diâmetro. Cada roda deu 500 voltas completas, sem escorregar. Use π = 3,14.')],
          ask: 'Quantos metros a cadeira avançou?',
          unit: 'm',
          answer: 942,
          wrong: [
            { value: 94200, feedback: 'Essa é a distância em centímetros. Converta para metros: divida por 100.' },
            { value: 471, feedback: 'Isso usa o raio (30 cm) no lugar do diâmetro em π × d. Uma volta mede 3,14 × 60 = 188,4 cm.' },
            { value: 1884, feedback: 'Isso usa 2π × 60: o diâmetro no lugar do raio. Uma volta mede π × d = 188,4 cm.' },
          ],
          solution: ['$uma volta: 3,14 × 60 = 188,4 cm', '$500 × 188,4 = 94.200 cm = 942 m'],
        })),
      ],
      practice: [gen(circumferenceGen), gen(turnsGen), gen(distanceGen)],
      challenge: [gen(turnsGen), gen(distanceGen), gen(circumferenceGen)],
      recap: [
        'C = π × d = 2πr, com π ≈ 3,14.',
        'Uma volta de roda avança o comprimento da circunferência.',
        'Voltas = distância ÷ comprimento de uma volta (nas mesmas unidades).',
      ],
    })),

    stage('area', 'fundamentos', 'Área do círculo', 'Calcular a área do círculo com A = πr², sem confundir raio e diâmetro, e prever como a área muda quando o raio muda.', () => ({
      learn: [
        text('A **área do círculo** é A = π × r²: o raio entra **ao quadrado**. Duas armadilhas: usar o diâmetro no lugar do raio (o resultado sai quatro vezes maior) e confundir área com comprimento. E, como em qualquer figura, ampliar as medidas k vezes multiplica a área por k²: um círculo com o dobro do raio tem quatro vezes a área.'),
        math('A = π × r²'),
        lab({
          title: 'O raio ao quadrado',
          intro: 'Escolha o raio e compare a área com a do círculo de raio 3 cm.',
          params: [{ key: 'r', label: 'Raio', min: 1, max: 12, step: 1, value: 3, format: (v) => `${v} cm` }],
          readouts: ({ r }) => [
            { label: 'Área', value: `3,14 × ${r}² = ${num(PI * r * r, 2)} cm²`, big: true, tone: 'verdigris' },
            { label: 'Comparada à do raio 3 cm', value: `${num((r * r) / 9, 2)} vez${(r * r) / 9 >= 2 ? 'es' : ''}` },
          ],
          viz: ({ r }) => ({
            kind: 'shape',
            shape: 'circle',
            dims: [r],
            labels: [`r = ${r} cm`, '', `área: ${num(PI * r * r, 2)} cm²`],
            summary: `Círculo de raio ${r} cm: área de ${num(PI * r * r, 2)} cm², ${num((r * r) / 9, 2)} vez${(r * r) / 9 >= 2 ? 'es' : ''} a do círculo de raio 3 cm`,
          }),
          goal: {
            task: 'Ache o raio do círculo que tem exatamente 4 vezes a área do círculo de raio 3 cm.',
            done: ({ r }) => r === 6,
            success: 'Isso: raio 6 cm, o dobro de 3 cm, dá 2² = 4 vezes a área (113,04 cm² contra 28,26 cm²).',
          },
          insight: 'A área cresce com o quadrado do raio: o dobro do raio, o quádruplo da área; o triplo do raio, nove vezes a área.',
        }),
        example('Média ou grande?', 'Uma pizza média de 30 cm de diâmetro custa R$ 40,00, e a grande, de 40 cm, custa R$ 60,00. Qual tem o centímetro quadrado mais barato? (Use π = 3,14.)', [
          askStep('Para a área, use o raio.', 'Qual é o raio da pizza média?', [
            ok('15 cm'),
            no('30 cm', '30 cm é o diâmetro. O raio é metade: 15 cm.'),
          ]),
          step('Áreas e preços:', 'média: 3,14 × 15² = 706,5 cm² → cerca de R$ 5,66 por 100 cm²', 'grande: 3,14 × 20² = 1.256 cm² → cerca de R$ 4,78 por 100 cm²'),
        ], 'A grande é mais vantajosa: o diâmetro é só 33% maior, mas a área é 78% maior, e o preço sobe só 50%.'),
        warn('Raio, não diâmetro', 'Se o problema dá o diâmetro, divida por 2 antes de elevar ao quadrado. Usar o diâmetro em πr² dá uma área quatro vezes maior.'),
        check(numeric({
          prompt: [p('Um canteiro circular tem 6 m de diâmetro. Use π = 3,14.')],
          ask: 'Qual é a área do canteiro?',
          unit: 'm²',
          answer: 28.26,
          wrong: [
            { value: 113.04, feedback: 'Isso usa o diâmetro (6 m) como raio. O raio é 3 m: 3,14 × 9.' },
            { value: 18.84, feedback: 'Esse é o comprimento do contorno (3,14 × 6). A área é πr².' },
            { value: 9.42, feedback: 'Isso esquece de elevar o raio ao quadrado: 3,14 × 3 × 3.' },
          ],
          solution: ['$r = 6 ÷ 2 = 3 m', '$A = 3,14 × 3² = 3,14 × 9 = 28,26 m²'],
        })),
      ],
      practice: [gen(circleAreaGen), gen(pizzaGen), gen(scaleAreaGen)],
      challenge: [gen(pizzaGen), gen(scaleAreaGen), gen(circleAreaGen)],
      recap: [
        'A = πr²; com o diâmetro, use r = d ÷ 2.',
        'Raio k vezes maior → área k² vezes maior.',
        'Comparar preços de pizzas: preço ÷ área.',
      ],
    })),

    stage('partes', 'aplicacoes', 'Coroas, setores e semicírculos', 'Calcular áreas de coroas circulares, setores e figuras com semicírculos, e comprimentos de arcos, usando frações do círculo.', () => ({
      learn: [
        text('Uma **coroa circular** (um anel, uma calçada em volta de uma praça) é o círculo grande menos o pequeno: π(R² − r²) — eleve cada raio ao quadrado **antes** de subtrair. Um **setor** de ângulo θ é a fração θ/360 do círculo: área θ/360 × πr², e o seu **arco**, θ/360 × 2πr. Um **semicírculo** é metade do círculo.'),
        math('coroa: π(R² − r²)', 'setor: [[θ|360]] × πr²     arco: [[θ|360]] × 2πr'),
        lab({
          title: 'Fatias do círculo',
          intro: 'Num círculo de 10 cm de raio, escolha o ângulo central de um setor.',
          params: [{ key: 'a', label: 'Ângulo central', min: 30, max: 360, step: 30, value: 30, format: (v) => `${v}°` }],
          readouts: ({ a }) => [
            { label: 'Fração do círculo', value: a === 360 ? '360/360 = 1' : `${a}/360 = ${frac(a, 360)}` },
            { label: 'Área do setor', value: `${num((a / 360) * PI * 100, 2)} cm²`, big: true, tone: 'verdigris' },
            { label: 'Arco', value: `${num((a / 360) * 2 * PI * 10, 2)} cm` },
          ],
          viz: ({ a }) => ({
            kind: 'shape',
            shape: 'sector',
            dims: [10],
            labels: ['r = 10 cm', '', `ângulo de ${a}°`],
            fill: a / 360,
            summary: `Setor de ${a}° num círculo de raio 10 cm: ${num((a / 360) * PI * 100, 2)} cm² de área`,
          }),
          goal: {
            task: 'Ache o ângulo do setor que tem exatamente 1/3 da área do círculo.',
            done: ({ a }) => a === 120,
            success: 'Isso: 120/360 = 1/3, e a área é 314 ÷ 3 ≈ 104,67 cm². A fração do ângulo é a fração da área — e a do arco.',
          },
          insight: 'Setor é proporção: dobrar o ângulo dobra a área e o arco.',
        }),
        example('A calçada da praça', 'Uma praça circular de 10 m de raio vai ganhar uma calçada de 3 m de largura em toda a volta. Qual é a área da calçada? (Use π = 3,14.)', [
          askStep('A calçada é uma coroa circular.', 'Qual é o raio externo?', [
            ok('10 + 3 = 13 m'),
            no('3 m, a largura da calçada', 'A calçada vai do raio de 10 m até o de 13 m: o raio externo é 13 m.'),
          ]),
          step('Coroa:', '3,14 × (13² − 10²) = 3,14 × (169 − 100)', '= 3,14 × 69 = 216,66 m²'),
        ], 'A calçada tem 216,66 m².'),
        check(numeric({
          prompt: [p('Num gráfico de setores desenhado com 6 cm de raio, um dos setores tem ângulo central de 60°. Use π = 3,14.')],
          ask: 'Qual é a área desse setor?',
          unit: 'cm²',
          answer: 18.84,
          wrong: [
            { value: 113.04, feedback: 'Essa é a área do círculo inteiro (3,14 × 36). O setor é 60/360 = 1/6 dele.' },
            { value: 6.28, feedback: 'Esse é o comprimento do arco (1/6 de 2 × 3,14 × 6). A área é 1/6 de πr².' },
            { value: 67.82, feedback: 'Isso usa 60% do círculo. O ângulo é uma fração de 360°, e não de 100.' },
          ],
          solution: ['$60/360 = 1/6', '$1/6 × 3,14 × 36 = 113,04 ÷ 6 = 18,84 cm²'],
        })),
      ],
      practice: [gen(ringGen), gen(sectorGen), gen(windowGen)],
      challenge: [gen(sectorGen), gen(windowGen), gen(ringGen)],
      recap: [
        'Coroa: π(R² − r²), elevando antes de subtrair.',
        'Setor e arco: a fração θ/360 do círculo e da circunferência.',
        'Semicírculo: metade da área (raio = metade do diâmetro).',
      ],
    })),

    stage('maestria', 'maestria', 'Maestria: círculos no ENEM', 'Resolver problemas inéditos que combinam comprimento, área, coroas, setores e conversões de unidade.', () => ({
      learn: [
        strategy('Círculos em 4 passos', '1) Contorno ou superfície? (volta, borda, roda, cerca → comprimento; tapete, gramado, pizza → área). 2) Raio ou diâmetro? Converta para o que a fórmula pede. 3) Partes: coroa (π(R² − r²)), setor (θ/360), semicírculo (metade). 4) Confira as unidades — rodas costumam vir em centímetros, e distâncias, em metros.'),
        example('A roda-gigante', 'A cabine de uma roda-gigante está a 20 m do centro. Quantos metros ela percorre em 3 voltas e meia? (Use π = 3,14.)', [
          step('Uma volta:', '2 × 3,14 × 20 = 125,6 m'),
          askStep('Agora, as 3 voltas e meia.', 'Quanto é 3,5 voltas?', [
            ok('3,5 × 125,6 = 439,6 m'),
            no('3 × 125,6 + 0,5 = 377,3 m', 'Meia volta é metade do comprimento de uma volta (62,8 m), e não 0,5 m.'),
          ]),
        ], 'A cabine percorre 439,6 m.'),
        key('Comprimento é linear; área é quadrática', 'Dobrar o raio dobra o comprimento da circunferência, mas quadruplica a área. É o mesmo efeito de ampliar qualquer figura.'),
        reveal('De onde vem o π?', 'Meça o contorno de qualquer objeto redondo e divida pelo diâmetro: sempre dá cerca de 3,14. Essa constante é o π, um número com infinitas casas decimais (3,14159…) que não se repetem em padrão.'),
        check(numeric({
          prompt: [p('Uma pizza de 40 cm de diâmetro foi cortada em 8 fatias iguais. Use π = 3,14.')],
          ask: 'Qual é a área de uma fatia?',
          unit: 'cm²',
          answer: 157,
          wrong: [
            { value: 628, feedback: 'Isso usa o diâmetro como raio (3,14 × 40² ÷ 8). O raio é 20 cm.' },
            { value: 1256, feedback: 'Essa é a área da pizza inteira (3,14 × 20²). Divida pelas 8 fatias.' },
            { value: 15.7, feedback: 'Esse é o comprimento da borda de uma fatia (125,6 ÷ 8). A pergunta é a área.' },
          ],
          solution: ['$pizza: 3,14 × 20² = 1.256 cm²', '$fatia: 1.256 ÷ 8 = 157 cm²'],
        })),
      ],
      practice: [gen(fenceGen), gen(turnsGen), gen(ringGen)],
      challenge: [gen(laneGen), gen(fenceGen), gen(windowGen), gen(pizzaGen)],
      recap: [
        'Contorno → 2πr; superfície → πr².',
        'Do comprimento ao raio: r = C ÷ 2π.',
        'Partes do círculo são frações dele.',
      ],
    })),
  ],
});
