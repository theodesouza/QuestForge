/**
 * Aula: Cilindros — volume como área da base × altura (V = πr²h), comparação de embalagens
 * (o raio entra ao quadrado), rótulos (planificação da lateral), nível de líquidos e porções, e
 * maestria (despejar, preço por mL, tempo de encher). Usa-se π = 3, como é comum no ENEM.
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
  ok,
  p,
  stage,
  step,
  strategy,
  table,
  text,
  warn,
} from '../../kit/build';
import { brl, hm, num, round } from '../../kit/format';
import type { Rand } from '../../types';

const piText = 'Use π = 3.';
/** As medidas das duas embalagens da questão do banco (ESP-004) e da lata da ESP-002. */
const isBankPair = (r1: number, h1: number, r2: number, h2: number) => (r1 === 4 && h1 === 10 && r2 === 2 && h2 === 30) || (r1 === 2 && h1 === 30 && r2 === 4 && h2 === 10);
const cansTable = (r1: number, h1: number, r2: number, h2: number, extra?: [string, string]) =>
  table(extra ? ['Lata', 'Raio da base', 'Altura', 'Preço'] : ['Lata', 'Raio da base', 'Altura'], [
    ['1', `${r1} cm`, `${h1} cm`, ...(extra ? [extra[0]] : [])],
    ['2', `${r2} cm`, `${h2} cm`, ...(extra ? [extra[1]] : [])],
  ]);

// ———————————————————————————————————————————————— geradores: volume

/** Volume a partir do raio: 3 × r² × h. */
function cylVolumeGen(r: Rand) {
  for (;;) {
    const cup = r.next() < 0.5;
    const rad = cup ? r.int(3, 5) : r.int(3, 8);
    const h = cup ? r.int(6, 15) : r.int(5, 25);
    if (rad === 5 && h === 12) continue; // questão do banco
    if (rad === 4 && h === 10) continue; // embalagem da questão do banco
    if (rad === 3 && h === 10) continue; // exemplo da teoria
    const V = 3 * rad * rad * h;
    const u = cup ? 'mL' : 'cm³';
    return draftNumeric({
      prompt: [p(cup ? `Um copo cilíndrico tem ${rad} cm de raio da base e ${h} cm de altura (medidas internas). ${piText}` : `Uma vela cilíndrica maciça tem ${rad} cm de raio e ${h} cm de altura. ${piText}`)],
      ask: cup ? 'Qual é a capacidade do copo, em mililitros?' : 'Qual é o volume de parafina da vela?',
      unit: u,
      answer: V,
      wrong: [
        { value: 3 * rad * h, feedback: `Isso esquece de elevar o raio ao quadrado. A base é um círculo: 3 × ${rad}² = ${3 * rad * rad} cm².` },
        { value: 6 * rad * h, feedback: 'Essa é a área da lateral (2πr × h), uma superfície. O volume é a área da base vezes a altura.' },
        { value: rad * rad * h, feedback: `Isso esquece o π: a área da base é π × r² = 3 × ${rad * rad} = ${3 * rad * rad} cm².` },
      ],
      hints: [`Área da base: π × r² = 3 × ${rad}².`, `Volume = área da base × altura = ${3 * rad * rad} × ${h}.`],
      solution: [`$base: 3 × ${rad}² = 3 × ${rad * rad} = ${3 * rad * rad} cm²`, `$V = ${3 * rad * rad} × ${h} = ${num(V)} ${u}`],
    });
  }
}

/** Volume a partir do diâmetro: primeiro, o raio. */
function cylDiameterGen(r: Rand) {
  for (;;) {
    const paint = r.next() < 0.5;
    const d = paint ? r.pick([10, 12, 16, 20]) : r.pick([6, 8, 10, 12]);
    const h = paint ? r.pick([12, 15, 18, 20]) : r.pick([8, 10, 12, 15]);
    if (!paint && d === 6 && h === 8) continue; // exercício da teoria
    const rad = d / 2;
    const V = 3 * rad * rad * h;
    return draftNumeric({
      prompt: [p(paint ? `Uma lata de tinta cilíndrica tem ${d} cm de diâmetro e ${h} cm de altura. ${piText}` : `Um pote de vidro cilíndrico tem ${d} cm de diâmetro interno e ${h} cm de altura. ${piText}`)],
      ask: paint ? 'Qual é o volume da lata?' : 'Qual é o volume do pote?',
      unit: 'cm³',
      answer: V,
      wrong: [
        { value: 3 * d * d * h, feedback: `Isso usa o diâmetro (${d} cm) como raio: o resultado fica 4 vezes maior. O raio é ${rad} cm.` },
        { value: 3 * d * h, feedback: 'Isso calcula π × d × h, a área da lateral. O volume é π × r² × h.' },
        { value: 3 * rad * h, feedback: `Isso esquece de elevar o raio ao quadrado: a base é 3 × ${rad}² = ${3 * rad * rad} cm².` },
      ],
      hints: [`O raio é metade do diâmetro: ${d} ÷ 2 = ${rad} cm.`, `V = 3 × ${rad}² × ${h}.`],
      solution: [`$r = ${d} ÷ 2 = ${rad} cm;  base: 3 × ${rad * rad} = ${3 * rad * rad} cm²`, `$V = ${3 * rad * rad} × ${h} = ${num(V)} cm³`],
    });
  }
}

/** Volume em litros: canos e baldes. */
function cylLitersGen(r: Rand) {
  if (r.next() < 0.5) {
    const d = r.pick([4, 6, 10, 20]);
    const len = r.pick([1, 2, 3, 5]);
    const rad = d / 2;
    const cm3 = 3 * rad * rad * len * 100;
    const L = cm3 / 1000;
    return draftNumeric({
      prompt: [p(`Um cano reto de ${d} cm de diâmetro interno e ${len} m de comprimento está completamente cheio de água. ${piText}`)],
      ask: 'Quantos litros de água há no cano?',
      unit: 'L',
      answer: L,
      wrong: [
        { value: cm3, feedback: `Esse é o volume em cm³ (${num(cm3)} cm³). Como 1 L = 1.000 cm³, divida por 1.000.` },
        { value: round((3 * rad * rad * len) / 1000, 4), feedback: `Isso mistura metros e centímetros. Passe o comprimento para centímetros: ${len} m = ${len * 100} cm.` },
        { value: round((3 * d * d * len * 100) / 1000, 3), feedback: `Isso usa o diâmetro como raio. O raio é ${rad} cm.` },
      ],
      hints: [`Tudo em centímetros: raio ${rad} cm e comprimento ${len * 100} cm.`, `V = 3 × ${rad}² × ${len * 100} cm³; depois, ÷ 1.000 para litros.`],
      solution: [`$V = 3 × ${num(rad * rad)} × ${len * 100} = ${num(cm3)} cm³`, `$${num(cm3)} ÷ 1.000 = ${num(L, 3)} L`],
    });
  }
  const d = r.pick([20, 24, 30]);
  const h = r.pick([20, 25, 30]);
  const rad = d / 2;
  const cm3 = 3 * rad * rad * h;
  const L = cm3 / 1000;
  return draftNumeric({
    prompt: [p(`Um balde cilíndrico tem ${d} cm de diâmetro e ${h} cm de altura (medidas internas). ${piText}`)],
    ask: 'Quantos litros cabem no balde?',
    unit: 'L',
    answer: L,
    tolerance: 0.01,
    wrong: [
      { value: cm3, feedback: `Esse é o volume em cm³ (${num(cm3)} cm³). Como 1 L = 1.000 cm³, divida por 1.000.` },
      { value: cm3 / 100, feedback: 'Isso divide por 100. Um litro tem 1.000 cm³.' },
      { value: (3 * d * d * h) / 1000, feedback: `Isso usa o diâmetro (${d} cm) como raio. O raio é ${rad} cm.` },
    ],
    hints: [`Raio: ${d} ÷ 2 = ${rad} cm.`, `V = 3 × ${rad}² × ${h} cm³; depois, ÷ 1.000 para litros.`],
    solution: [`$V = 3 × ${rad * rad} × ${h} = ${num(cm3)} cm³`, `$${num(cm3)} ÷ 1.000 = ${num(L, 3)} L`],
  });
}

// ———————————————————————————————————————————————— geradores: comparar

/** Mudar raio e altura: o raio entra ao quadrado; a altura, uma vez. */
function cylScaleGen(r: Rand) {
  const k = r.pick([2, 3]);
  const m = r.pick([1, 2, 0.5]);
  const V0 = r.pick([150, 200, 250, 300, 350]);
  const ans = V0 * k * k * m;
  const rText = k === 2 ? 'o dobro do raio' : 'o triplo do raio';
  const hText = m === 1 ? 'a mesma altura' : m === 2 ? 'o dobro da altura' : 'metade da altura';
  return draftNumeric({
    prompt: [p(`Uma lata cilíndrica de molho de tomate tem ${V0} mL. O fabricante vai lançar uma lata com ${rText} e ${hText}.`)],
    ask: 'Qual será a capacidade da nova lata?',
    unit: 'mL',
    answer: ans,
    wrong: [
      { value: V0 * k * m, feedback: `Isso trata o raio como a altura, multiplicando o volume só por ${k}. O raio entra ao quadrado: fator ${k}² = ${k * k}.` },
      ...(m !== 1 ? [{ value: V0 * k * k, feedback: `Isso considera só o raio. A altura também mudou: multiplique ainda por ${num(m)}.` }] : []),
      ...(m === 1 ? [{ value: V0 * k ** 3, feedback: `Isso usa ${k}³, como se as três medidas crescessem. Só o raio mudou: fator ${k}² = ${k * k}.` }] : []),
    ],
    hints: ['V = π × r² × h: o fator do raio vai ao quadrado; o da altura, não.', `Fator total: ${k}² × ${num(m)} = ${num(k * k * m)}.`],
    solution: [`$fator: ${k}² × ${num(m)} = ${num(k * k * m)}`, `$${V0} × ${num(k * k * m)} = ${num(ans)} mL`],
  });
}

/** Pares de latas (raio, altura, raio, altura) com o mesmo r² × h. */
const EQUAL_CANS = [[2, 18, 3, 8], [2, 27, 3, 12], [3, 16, 4, 9], [2, 25, 5, 4], [4, 9, 6, 4], [3, 12, 6, 3], [2, 36, 6, 4], [4, 25, 5, 16], [3, 25, 5, 9], [2, 9, 3, 4]];

/** Qual lata comporta mais: compare r² × h. */
function cylCompareGen(r: Rand) {
  for (;;) {
    const equal = r.next() < 0.25;
    const pair = equal ? r.pick(EQUAL_CANS) : [r.int(2, 6), r.int(4, 20), r.int(2, 6), r.int(4, 20)];
    const [r1, h1, r2, h2] = r.next() < 0.5 ? pair : [pair[2], pair[3], pair[0], pair[1]];
    if (r1 === r2 || isBankPair(r1, h1, r2, h2)) continue;
    const v1 = r1 * r1 * h1;
    const v2 = r2 * r2 * h2;
    if (!equal && Math.abs(v1 - v2) / Math.min(v1, v2) < 0.08) continue;
    const why = `Compare r² × h (o π é o mesmo nas duas): lata 1, ${r1}² × ${h1} = ${v1}; lata 2, ${r2}² × ${h2} = ${v2}.`;
    return draftChoice({
      prompt: [p('Duas latas cilíndricas têm as medidas internas abaixo.'), cansTable(r1, h1, r2, h2)],
      ask: 'Qual lata comporta mais?',
      options: [
        !equal && v1 > v2 ? ok('A lata 1') : no('A lata 1', why),
        !equal && v2 > v1 ? ok('A lata 2') : no('A lata 2', why),
        equal ? ok('As duas comportam o mesmo') : no('As duas comportam o mesmo', why),
      ],
      hints: ['Volume = π × r² × h. O π aparece nas duas: basta comparar r² × h.', 'O raio entra ao quadrado: uma lata mais larga pode ser mais baixa e comportar mais.'],
      solution: [`$lata 1: ${r1}² × ${h1} = ${v1};  lata 2: ${r2}² × ${h2} = ${v2}`, v1 === v2 ? 'Os volumes são iguais.' : `A lata ${v1 > v2 ? 1 : 2} comporta mais.`],
    });
  }
}

/** Quantos por cento um cilindro tem a mais que outro. */
function cylPercentGen(r: Rand) {
  for (;;) {
    const r1 = r.int(3, 6);
    const r2 = r.int(2, 5);
    const h1 = r.int(5, 20);
    const h2 = r.int(5, 30);
    if (isBankPair(r1, h1, r2, h2)) continue;
    if (r1 === 6 && h1 === 5 && r2 === 3 && h2 === 16) continue; // exemplo da teoria
    const v1 = r1 * r1 * h1;
    const v2 = r2 * r2 * h2;
    const pct = (v1 / v2 - 1) * 100;
    if (![20, 25, 50, 60, 75, 80, 100, 125, 150].some((x) => Math.abs(pct - x) < 1e-9)) continue;
    const linear = ((r1 * h1) / (r2 * h2) - 1) * 100;
    return draftNumeric({
      prompt: [p('Uma empresa compara duas embalagens cilíndricas, com as medidas internas abaixo.'), cansTable(r1, h1, r2, h2)],
      ask: 'O volume da lata 1 é quantos por cento maior que o da lata 2?',
      unit: '%',
      answer: round(pct, 2),
      wrong: [
        { value: round((v1 / v2) * 100, 2), feedback: `Isso dá a lata 1 como porcentagem da 2 (${num((v1 / v2) * 100)}%). "A mais" é o que passa de 100%.` },
        { value: round(((v1 - v2) / v1) * 100, 2), feedback: 'Isso compara a diferença com a lata 1. A base da comparação é a lata 2: diferença ÷ volume da lata 2.' },
        ...(linear > 0 ? [{ value: round(linear, 2), feedback: 'Isso usa o raio sem elevar ao quadrado. Compare r² × h de cada lata.' }] : []),
      ],
      hints: ['O π se cancela: compare r² × h de cada lata.', `Lata 1: ${r1}² × ${h1} = ${v1}; lata 2: ${r2}² × ${h2} = ${v2}. Quanto a 1 passa da 2, em relação à 2?`],
      solution: [`$lata 1: ${r1}² × ${h1} = ${v1};  lata 2: ${r2}² × ${h2} = ${v2}`, `$(${v1} − ${v2}) ÷ ${v2} = ${num(v1 - v2)} ÷ ${v2} = ${num(pct / 100, 4)} = ${num(pct)}%`],
    });
  }
}

// ———————————————————————————————————————————————— geradores: rótulos, níveis e porções

/** Rótulo: a lateral aberta é um retângulo de 2πr por h. */
function labelGen(r: Rand) {
  for (;;) {
    const rad = r.int(3, 8);
    const h = r.int(6, 20);
    if (rad === 3 && h === 11) continue; // exercício da teoria
    const A = 6 * rad * h;
    const can = r.next() < 0.5;
    return draftNumeric({
      prompt: [p(can ? `Uma lata de ${rad} cm de raio e ${h} cm de altura receberá um rótulo de papel cobrindo toda a lateral, sem sobreposição. ${piText}` : `Um porta-lápis cilíndrico, de ${rad} cm de raio e ${h} cm de altura, será forrado com tecido só na lateral, sem sobreposição. ${piText}`)],
      ask: can ? 'Qual é a área do rótulo?' : 'Quantos centímetros quadrados de tecido serão usados?',
      unit: 'cm²',
      answer: A,
      wrong: [
        { value: 3 * rad * h, feedback: 'Isso usa π × r como largura. Aberta, a lateral é um retângulo com o comprimento da circunferência, 2πr, de largura.' },
        { value: 3 * rad * rad * h, feedback: 'Esse é o volume (πr²h). A lateral é uma superfície: um retângulo de 2πr por h.' },
        can
          ? { value: 6 * rad * h + 6 * rad * rad, feedback: 'Isso inclui as duas tampas (2 × πr²). A pergunta é só a lateral: 2πr × h.' }
          : { value: 6 * rad * h + 3 * rad * rad, feedback: 'Isso inclui o fundo (πr²). O tecido cobre só a lateral: 2πr × h.' },
      ],
      hints: [`Aberta, a lateral vira um retângulo: largura 2πr = 2 × 3 × ${rad} = ${6 * rad} cm.`, `Área = ${6 * rad} × ${h}.`],
      solution: [`$largura: 2 × 3 × ${rad} = ${6 * rad} cm;  altura: ${h} cm`, `$A = ${6 * rad} × ${h} = ${num(A)} cm²`],
    });
  }
}

/** Altura do líquido: volume ÷ área da base. */
function levelCylGen(r: Rand) {
  if (r.next() < 0.4) {
    const rad = r.pick([1, 1.5, 2]);
    const h = r.pick([1, 2, 3, 4]);
    const m3 = 3 * rad * rad * h;
    const L = round(m3 * 1000, 6);
    return draftNumeric({
      prompt: [p(`Um reservatório cilíndrico tem ${num(rad)} m de raio da base. Ele recebeu ${num(L)} litros de água. ${piText}`)],
      ask: 'Que altura a água atinge?',
      unit: 'm',
      answer: h,
      wrong: [
        { value: round(L / (3 * rad * rad), 2), feedback: `Isso divide os litros pela área em m². Converta antes: ${num(L)} L = ${num(m3, 3)} m³.` },
        { value: round(m3 / (3 * rad), 4), feedback: `Isso esquece de elevar o raio ao quadrado: a base tem 3 × ${num(rad)}² = ${num(3 * rad * rad, 2)} m².` },
        { value: round(m3 / (rad * rad), 4), feedback: `Isso esquece o π na área da base: 3 × ${num(rad)}² = ${num(3 * rad * rad, 2)} m².` },
      ],
      hints: [`${num(L)} L = ${num(m3, 3)} m³ (1 m³ = 1.000 L).`, `Área da base: 3 × ${num(rad)}² = ${num(3 * rad * rad, 2)} m²; altura = volume ÷ base.`],
      solution: [`$${num(L)} L = ${num(m3, 3)} m³;  base: 3 × ${num(rad * rad, 2)} = ${num(3 * rad * rad, 2)} m²`, `$h = ${num(m3, 3)} ÷ ${num(3 * rad * rad, 2)} = ${h} m`],
    });
  }
  const rad = r.pick([3, 4, 5]);
  const h = r.int(6, 14);
  const V = 3 * rad * rad * h;
  return draftNumeric({
    prompt: [p(`Num copo cilíndrico de ${rad} cm de raio da base, foram colocados ${num(V)} mL de suco. ${piText}`)],
    ask: 'Até que altura o suco chega?',
    unit: 'cm',
    answer: h,
    wrong: [
      { value: round(V / (3 * rad), 2), feedback: `Isso esquece de elevar o raio ao quadrado: a base tem 3 × ${rad}² = ${3 * rad * rad} cm².` },
      { value: round(V / (rad * rad), 2), feedback: `Isso esquece o π: a área da base é 3 × ${rad}² = ${3 * rad * rad} cm².` },
    ],
    hints: [`Área da base: 3 × ${rad}² = ${3 * rad * rad} cm² (e ${num(V)} mL = ${num(V)} cm³).`, `Altura = volume ÷ área da base = ${num(V)} ÷ ${3 * rad * rad}.`],
    solution: [`$base: 3 × ${rad * rad} = ${3 * rad * rad} cm²`, `$h = ${num(V)} ÷ ${3 * rad * rad} = ${h} cm`],
  });
}

/** Porções: volume da jarra ÷ volume de cada copo. */
function portionsGen(r: Rand) {
  for (;;) {
    const rad = r.pick([5, 6, 7, 8]);
    const h = r.pick([15, 18, 20, 24, 25]);
    const c = r.pick([150, 180, 200, 250, 300]);
    const V = 3 * rad * rad * h;
    if (V % c !== 0) continue;
    const n = V / c;
    return draftNumeric({
      prompt: [p(`Uma jarra cilíndrica de ${rad} cm de raio da base e ${h} cm de altura está cheia de suco. O suco será servido em copos de ${c} mL, todos cheios. ${piText}`)],
      ask: 'Quantos copos podem ser servidos?',
      unit: 'copos',
      answer: n,
      wrong: [
        { value: round((3 * rad * h) / c, 2), feedback: `Isso esquece de elevar o raio ao quadrado. A jarra tem 3 × ${rad}² × ${h} = ${num(V)} mL.` },
        { value: round((rad * rad * h) / c, 2), feedback: `Isso esquece o π. A jarra tem 3 × ${rad}² × ${h} = ${num(V)} mL.` },
      ],
      hints: [`Volume da jarra: 3 × ${rad}² × ${h} cm³ = mL.`, `Copos = volume da jarra ÷ ${c}.`],
      solution: [`$V = 3 × ${rad * rad} × ${h} = ${num(V)} mL`, `$${num(V)} ÷ ${c} = ${n} copos`],
    });
  }
}

// ———————————————————————————————————————————————— geradores: maestria

/** Despejar o conteúdo de um cilindro numa bandeja retangular. */
function pourGen(r: Rand) {
  for (;;) {
    const rad = r.pick([4, 5, 6]);
    const h = r.int(10, 20);
    const a = r.pick([20, 25, 30, 40]);
    const b = r.pick([10, 15, 20, 25]);
    if ((rad === 5 && h === 12) || (rad === 4 && h === 10)) continue; // medidas da questão do banco
    const V = 3 * rad * rad * h;
    if ((V * 100) % (a * b) !== 0) continue;
    const ans = V / (a * b);
    if (ans < 0.5) continue;
    return draftNumeric({
      prompt: [p(`Uma lata cilíndrica de ${rad} cm de raio e ${h} cm de altura, cheia de tinta, foi despejada numa bandeja retangular de fundo plano, de ${a} cm por ${b} cm. ${piText}`)],
      ask: 'Que altura a tinta atinge na bandeja?',
      unit: 'cm',
      answer: ans,
      wrong: [
        { value: round((3 * rad * h) / (a * b), 3), feedback: `Isso esquece de elevar o raio ao quadrado. A lata tem 3 × ${rad}² × ${h} = ${num(V)} cm³.` },
        { value: round((rad * rad * h) / (a * b), 3), feedback: `Isso esquece o π. A lata tem 3 × ${rad}² × ${h} = ${num(V)} cm³.` },
        { value: V, feedback: 'Esse é o volume da tinta. A altura na bandeja é esse volume dividido pela área do fundo da bandeja.' },
      ],
      hints: [`Volume da tinta: 3 × ${rad}² × ${h} = ${num(V)} cm³ — ele não muda ao trocar de recipiente.`, `Altura = ${num(V)} ÷ (${a} × ${b}).`],
      solution: [`$V = 3 × ${rad * rad} × ${h} = ${num(V)} cm³;  fundo: ${a} × ${b} = ${num(a * b)} cm²`, `$h = ${num(V)} ÷ ${num(a * b)} = ${num(ans)} cm`],
    });
  }
}

/** Preço por mililitro de duas latas cilíndricas. */
function priceGen(r: Rand) {
  for (;;) {
    const r1 = r.pick([3, 4]);
    const h1 = r.pick([8, 10, 12]);
    const r2 = r.pick([5, 6]);
    const h2 = r.pick([10, 12, 15]);
    if ((r1 === 4 && h1 === 10) || (r2 === 5 && h2 === 12)) continue; // medidas da questão do banco
    const v1 = 3 * r1 * r1 * h1;
    const v2 = 3 * r2 * r2 * h2;
    if (v2 > 4 * v1) continue;
    // Preço da lata grande perto do proporcional, para que qualquer uma possa ser a mais vantajosa.
    const p1 = r.pick([3, 3.5, 4, 4.5, 5]);
    const p2 = round(p1 * (v2 / v1) * r.pick([0.75, 0.8, 0.85, 1.15, 1.2, 1.3]), 1);
    const u1 = (p1 / v1) * 100;
    const u2 = (p2 / v2) * 100;
    if (Math.abs(u1 - u2) / Math.min(u1, u2) < 0.06) continue;
    const why = `A lata 1 tem ${num(v1)} mL e sai a cerca de ${brl(u1)} por 100 mL; a lata 2, ${num(v2)} mL, a cerca de ${brl(u2)}.`;
    return draftChoice({
      prompt: [p(`Um mercado vende o mesmo creme de leite em duas latas cilíndricas. ${piText}`), cansTable(r1, h1, r2, h2, [brl(p1), brl(p2)])],
      ask: 'Qual lata tem o mililitro mais barato?',
      options: [
        u1 < u2 ? ok('A lata 1') : no('A lata 1', why),
        u2 < u1 ? ok('A lata 2') : no('A lata 2', why),
        no('As duas têm o mesmo preço por mL', `Os preços por 100 mL são diferentes: cerca de ${brl(u1)} na lata 1 e ${brl(u2)} na lata 2.`),
      ],
      hints: ['Calcule o volume de cada lata: 3 × r² × h (cm³ = mL).', 'Divida o preço pelo volume: o menor resultado é o mais barato.'],
      solution: [`$lata 1: 3 × ${r1}² × ${h1} = ${num(v1)} mL → cerca de ${brl(u1)} por 100 mL`, `$lata 2: 3 × ${r2}² × ${h2} = ${num(v2)} mL → cerca de ${brl(u2)} por 100 mL`],
    });
  }
}

/** Tempo para encher um reservatório cilíndrico. */
function tankTimeGen(r: Rand) {
  for (;;) {
    const rad = r.pick([1, 1.5, 2]);
    const h = r.pick([1, 1.2, 1.5, 2]);
    const q = r.pick([50, 60, 75, 100, 150]);
    const L = round(3000 * rad * rad * h, 6);
    if (!Number.isInteger(L) || L % q !== 0) continue;
    const t = L / q;
    return draftNumeric({
      prompt: [p(`Um reservatório cilíndrico de ${num(rad)} m de raio da base e ${num(h)} m de altura está vazio. Uma bomba o enche com ${q} litros por minuto. ${piText}`)],
      ask: 'Em quantos minutos o reservatório fica cheio?',
      unit: 'min',
      answer: t,
      wrong: [
        { value: round(t / 60, 4), feedback: 'Esse é o tempo em horas. A pergunta pede minutos.' },
        { value: round((3 * rad * rad * h) / q, 4), feedback: `Isso divide o volume em m³ pela vazão em litros. Converta antes: ${num(L / 1000, 3)} m³ = ${num(L)} L.` },
        { value: round((3000 * rad * h) / q, 2), feedback: `Isso esquece de elevar o raio ao quadrado. O volume é 3 × ${num(rad)}² × ${num(h)} = ${num(L / 1000, 3)} m³.` },
      ],
      hints: [`Volume: 3 × ${num(rad)}² × ${num(h)} m³; cada m³ são 1.000 L.`, `Tempo = litros ÷ ${q} litros por minuto.`],
      solution: [`$V = 3 × ${num(rad * rad, 2)} × ${num(h)} = ${num(L / 1000, 3)} m³ = ${num(L)} L`, `$${num(L)} ÷ ${q} = ${t} min${t >= 60 ? ` (${hm(t / 60)})` : ''}`],
    });
  }
}

// ———————————————————————————————————————————————— aula

export const CILINDRO = lesson({
  id: 'cilindro',
  topic: 'geo-espacial',
  subtopics: ['cilindro'],
  title: 'Cilindros',
  summary: 'Volume do cilindro (área da base × altura), embalagens comparadas pelo raio ao quadrado, rótulos pela planificação da lateral, nível de líquidos, porções e tempo para encher.',
  requires: ['volumes', 'circulo'],
  stages: [
    stage('base-altura', 'descoberta', 'Base vezes altura', 'Calcular o volume de um cilindro como área da base (πr²) vezes a altura, a partir do raio ou do diâmetro, em cm³, mL e litros.', () => ({
      learn: [
        text('Como no bloco retangular, o volume de um cilindro é **área da base × altura**: empilhe moedas iguais e você terá um cilindro. A diferença é que a base é um círculo, de área π × r². Assim, V = π × r² × h. No ENEM é comum usar **π = 3**; e lembre: 1 cm³ = 1 mL.'),
        math('V = (área da base) × altura = π × r² × h'),
        lab({
          title: 'A lata',
          intro: 'Escolha o raio da base e a altura de uma lata (π = 3) e veja quanto cabe nela.',
          params: [
            { key: 'r', label: 'Raio da base', min: 1, max: 10, step: 1, value: 2, format: (v) => `${v} cm` },
            { key: 'h', label: 'Altura', min: 2, max: 20, step: 2, value: 6, format: (v) => `${v} cm` },
          ],
          readouts: ({ r, h }) => [
            { label: 'Área da base', value: `3 × ${r}² = ${3 * r * r} cm²` },
            { label: 'Volume', value: `${3 * r * r} × ${h} = ${num(3 * r * r * h)} mL`, big: true, tone: 'sky' },
          ],
          viz: ({ r, h }) => ({
            kind: 'shape',
            shape: 'cylinder',
            dims: [r, h],
            labels: [`r = ${r} cm`, `h = ${h} cm`, `${num(3 * r * r * h)} mL`],
            fill: 1,
            summary: `Lata de raio ${r} cm e altura ${h} cm: base de ${3 * r * r} cm² e volume de ${num(3 * r * r * h)} mL`,
          }),
          goal: {
            task: 'Monte uma lata que comporte exatamente 1,2 litro (1.200 mL).',
            done: ({ r, h }) => 3 * r * r * h === 1200,
            success: 'Isso: 1.200 ÷ 3 = 400 = r² × h — por exemplo, raio 5 cm e altura 16 cm (25 × 16), ou raio 10 cm e altura 4 cm (100 × 4).',
          },
          insight: 'Dobrar a altura dobra o volume; dobrar o raio o multiplica por 4, porque a base cresce com r².',
        }),
        example('O copo', 'Um copo cilíndrico tem 3 cm de raio da base e 10 cm de altura. Quantos mililitros cabem nele? (Use π = 3.)', [
          askStep('Comece pela base.', 'Qual é a área da base?', [
            ok('3 × 3² = 27 cm²'),
            no('2 × 3 × 3 = 18 cm', 'Isso é 2πr, o contorno da base. A área do círculo é π × r² = 3 × 9 = 27 cm².'),
          ]),
          step('Base vezes altura:', '27 × 10 = 270 cm³ = 270 mL'),
        ], 'Cabem 270 mL.'),
        warn('Diâmetro nas embalagens', 'Embalagens costumam informar o diâmetro. Divida por 2 antes de elevar ao quadrado: usar o diâmetro como raio dá um volume 4 vezes maior.'),
        check(numeric({
          prompt: [p('Um pote cilíndrico tem 6 cm de diâmetro e 8 cm de altura (medidas internas). Use π = 3.')],
          ask: 'Quantos mililitros cabem no pote?',
          unit: 'mL',
          answer: 216,
          wrong: [
            { value: 864, feedback: 'Isso usa o diâmetro (6 cm) como raio: 3 × 36 × 8. O raio é 3 cm.' },
            { value: 144, feedback: 'Essa é a área da lateral (2 × 3 × 3 × 8). O volume é π × r² × h.' },
            { value: 72, feedback: 'Isso esquece de elevar o raio ao quadrado: a base é 3 × 3² = 27 cm².' },
          ],
          solution: ['$r = 6 ÷ 2 = 3 cm;  base: 3 × 3² = 27 cm²', '$V = 27 × 8 = 216 cm³ = 216 mL'],
        })),
      ],
      practice: [gen(cylVolumeGen), gen(cylDiameterGen), gen(cylLitersGen)],
      challenge: [gen(cylDiameterGen), gen(cylLitersGen), gen(cylVolumeGen)],
      recap: [
        'V = π × r² × h (área da base × altura).',
        'Com o diâmetro, use r = d ÷ 2.',
        '1 cm³ = 1 mL; 1.000 cm³ = 1 L.',
      ],
    })),

    stage('comparar', 'interpretacao', 'Comparar embalagens', 'Comparar volumes de cilindros sem calcular tudo: o π se cancela, o raio entra ao quadrado e a altura, uma vez.', () => ({
      learn: [
        text('Para comparar dois cilindros, o π aparece nos dois volumes e **se cancela**: basta comparar **r² × h**. Como o raio vai ao quadrado, ele pesa mais que a altura: dobrar o raio multiplica o volume por 4, enquanto dobrar a altura só o dobra. Uma lata larga e baixa pode comportar mais que uma alta e fina.'),
        math('[[V₁|V₂]] = [[r₁² × h₁|r₂² × h₂]]'),
        lab({
          title: 'Duas latas',
          intro: 'A lata A tem 3 cm de raio e 8 cm de altura (216 mL). Ajuste a lata B e compare.',
          params: [
            { key: 'r', label: 'Raio da lata B', min: 1, max: 6, step: 1, value: 3, format: (v) => `${v} cm` },
            { key: 'h', label: 'Altura da lata B', min: 2, max: 16, step: 2, value: 8, format: (v) => `${v} cm` },
          ],
          readouts: ({ r, h }) => [
            { label: 'Lata A', value: '3 × 3² × 8 = 216 mL' },
            { label: 'Lata B', value: `3 × ${r}² × ${h} = ${num(3 * r * r * h)} mL` },
            { label: 'B ÷ A', value: `${num((r * r * h) / 72, 3)}`, big: true, tone: 'sky' },
          ],
          viz: ({ r, h }) => ({
            kind: 'shape',
            shape: 'cylinder',
            dims: [r, h],
            labels: [`r = ${r} cm`, `h = ${h} cm`, `lata B: ${num(3 * r * r * h)} mL`],
            fill: 1,
            summary: `Lata B com raio ${r} cm e altura ${h} cm: ${num(3 * r * r * h)} mL, ${num((r * r * h) / 72, 3)} vezes a lata A`,
          }),
          goal: {
            task: 'Faça a lata B ter o dobro do raio da lata A e, mesmo assim, o mesmo volume.',
            done: ({ r, h }) => r === 6 && r * r * h === 72,
            success: 'Isso: raio 6 cm e altura 2 cm. O raio dobrado multiplica a base por 4, então a altura precisa cair para um quarto (8 ÷ 4 = 2).',
          },
          insight: 'Raio × 2 → volume × 4; altura × 2 → volume × 2. Para compensar o dobro do raio, divida a altura por 4.',
        }),
        example('Qual lata rende mais?', [p('Compare as duas latas (π = 3).'), table(['Lata', 'Raio da base', 'Altura'], [['A', '3 cm', '16 cm'], ['B', '6 cm', '5 cm']])], [
          askStep('Não precisa calcular o π.', 'O que comparar?', [
            ok('r² × h de cada lata'),
            no('Só as alturas: a mais alta comporta mais', 'A altura entra uma vez, mas o raio entra ao quadrado. Compare r² × h.'),
          ]),
          step('Comparando:', 'A: 3² × 16 = 144;  B: 6² × 5 = 180', '180 ÷ 144 = 1,25'),
        ], 'A lata B comporta 25% a mais, mesmo sendo bem mais baixa.'),
        check(choice({
          ask: 'Se dobrarmos o raio da base de um cilindro e mantivermos a altura, o volume:',
          options: [
            ok('fica 4 vezes maior'),
            no('dobra', 'O raio entra ao quadrado na área da base: 2² = 4. O volume fica 4 vezes maior.'),
            no('fica 8 vezes maior', 'Seria 8 se as três medidas dobrassem, como num cubo. Aqui a altura não muda: fator 2² = 4.'),
            no('não muda, porque a altura é a mesma', 'A base fica 4 vezes maior (π × (2r)² = 4πr²), e o volume acompanha a base.'),
          ],
          hints: ['V = π × r² × h.', 'Troque r por 2r: π × (2r)² × h = π × 4r² × h.'],
          solution: ['π × (2r)² × h = 4 × (π × r² × h): o volume fica 4 vezes maior.'],
        })),
      ],
      practice: [gen(cylScaleGen), gen(cylCompareGen), gen(cylPercentGen)],
      challenge: [gen(cylCompareGen), gen(cylPercentGen), gen(cylScaleGen)],
      recap: [
        'Para comparar, o π se cancela: compare r² × h.',
        'Raio × k → volume × k²; altura × k → volume × k.',
        '"Quantos % a mais": diferença ÷ volume de referência.',
      ],
    })),

    stage('planificacao', 'aplicacoes', 'Rótulos, níveis e porções', 'Calcular a área da lateral pela planificação, a altura de um líquido num cilindro e quantas porções um recipiente rende.', () => ({
      learn: [
        text('Abra a lateral de uma lata: ela vira um **retângulo** cuja largura é o contorno da base (**2πr**) e cuja altura é a da lata. É o rótulo: área = 2πr × h. Já a **altura de um líquido** num cilindro é volume ÷ área da base, e o número de **porções** é o volume total ÷ volume de cada porção.'),
        math('lateral (rótulo) = 2πr × h', 'altura do líquido = V ÷ (π r²)'),
        lab({
          title: 'O rótulo da lata',
          intro: 'Escolha o raio e a altura de uma lata (π = 3) e veja o rótulo aberto.',
          params: [
            { key: 'r', label: 'Raio da base', min: 2, max: 8, step: 1, value: 2, format: (v) => `${v} cm` },
            { key: 'h', label: 'Altura', min: 4, max: 16, step: 2, value: 4, format: (v) => `${v} cm` },
          ],
          readouts: ({ r, h }) => [
            { label: 'Largura do rótulo (2πr)', value: `2 × 3 × ${r} = ${6 * r} cm` },
            { label: 'Altura do rótulo', value: `${h} cm` },
            { label: 'Área do rótulo', value: `${num(6 * r * h)} cm²`, big: true, tone: 'sky' },
          ],
          viz: ({ r, h }) => ({
            kind: 'shape',
            shape: 'rect',
            dims: [6 * r, h],
            labels: [`${6 * r} cm (2πr)`, `${h} cm`, `${num(6 * r * h)} cm²`],
            summary: `Rótulo aberto: retângulo de ${6 * r} cm por ${h} cm, com ${num(6 * r * h)} cm²`,
          }),
          goal: {
            task: 'Ache a lata de 10 cm de altura cujo rótulo tenha exatamente 360 cm².',
            done: ({ r, h }) => h === 10 && 6 * r * h === 360,
            success: 'Isso: raio 6 cm. A largura do rótulo é 2 × 3 × 6 = 36 cm, e 36 × 10 = 360 cm².',
          },
          insight: 'O rótulo cresce de forma proporcional ao raio (não ao quadrado): sua largura é o contorno 2πr.',
        }),
        example('Quantos copos?', 'Uma jarra cilíndrica de 6 cm de raio e 20 cm de altura está cheia de suco. Quantos copos de 240 mL ela enche? (Use π = 3.)', [
          askStep('Comece pelo volume da jarra.', 'Qual é o volume da jarra?', [
            ok('3 × 6² × 20 = 2.160 mL'),
            no('3 × 6 × 20 = 360 mL', 'Isso esquece de elevar o raio ao quadrado. A base é 3 × 6² = 108 cm².'),
          ]),
          step('Divida pelos copos:', '2.160 ÷ 240 = 9'),
        ], 'A jarra enche 9 copos.'),
        check(numeric({
          prompt: [p('Uma lata de 3 cm de raio e 11 cm de altura vai receber um rótulo cobrindo toda a lateral. Use π = 3.')],
          ask: 'Qual é a área do rótulo?',
          unit: 'cm²',
          answer: 198,
          wrong: [
            { value: 99, feedback: 'Isso usa π × r como largura. A largura do rótulo é o contorno da base: 2 × 3 × 3 = 18 cm.' },
            { value: 297, feedback: 'Esse é o volume da lata (3 × 9 × 11). O rótulo é uma superfície: 18 × 11.' },
            { value: 252, feedback: 'Isso inclui as duas tampas (2 × 27 cm²). O rótulo cobre só a lateral: 198 cm².' },
          ],
          solution: ['$largura: 2 × 3 × 3 = 18 cm', '$área: 18 × 11 = 198 cm²'],
        })),
      ],
      practice: [gen(labelGen), gen(levelCylGen), gen(portionsGen)],
      challenge: [gen(levelCylGen), gen(portionsGen), gen(labelGen)],
      recap: [
        'Rótulo (lateral): retângulo de 2πr por h.',
        'Altura do líquido = volume ÷ área da base.',
        'Porções = volume total ÷ volume de cada porção.',
      ],
    })),

    stage('maestria', 'maestria', 'Maestria: cilindros no ENEM', 'Resolver problemas inéditos que combinam cilindros com outros sólidos, conversões, preços e tempo.', () => ({
      learn: [
        strategy('Cilindros em 4 passos', '1) Volume ou superfície? (encher, caber → volume; rótulo, pintura → lateral.) 2) Raio: se vier o diâmetro, divida por 2. 3) V = π × r² × h, com o π indicado no enunciado. 4) Converta no fim (cm³ = mL; m³ = 1.000 L) e, ao trocar de recipiente, lembre que o volume do líquido não muda.'),
        example('Caixa ou cilindro?', 'Uma caixa tem base quadrada de 10 cm × 10 cm e 8 cm de altura. Um cilindro com 10 cm de diâmetro e 8 cm de altura cabe exatamente dentro dela. Qual fração da caixa ele ocupa? (Use π = 3.)', [
          step('Volumes:', 'caixa: 10 × 10 × 8 = 800 cm³', 'cilindro: 3 × 5² × 8 = 600 cm³'),
          askStep('Agora, a comparação.', 'Que fração da caixa é o cilindro?', [
            ok('600 ÷ 800 = 3/4'),
            no('1/2, porque o círculo é metade do quadrado', 'O círculo inscrito ocupa mais que metade do quadrado: 75 cm² de 100 cm², com π = 3.'),
          ]),
        ], 'O cilindro ocupa 3/4 da caixa.'),
        key('O cilindro dentro da caixa', 'Um cilindro encaixado numa caixa de base quadrada (diâmetro igual ao lado) ocupa π/4 dela: 3/4 com π = 3, ou cerca de 78,5% com π = 3,14.'),
        check(numeric({
          prompt: [p('Um tanque cilíndrico tem 2 m de diâmetro e 1,5 m de altura. Use π = 3.')],
          ask: 'Quantos litros cabem no tanque?',
          unit: 'L',
          answer: 4500,
          wrong: [
            { value: 18000, feedback: 'Isso usa o diâmetro (2 m) como raio. O raio é 1 m: 3 × 1² × 1,5 = 4,5 m³.' },
            { value: 4.5, feedback: 'Esse é o volume em m³. Cada m³ são 1.000 L.' },
            { value: 450, feedback: 'Isso usa 1 m³ = 100 L. São 1.000 L por m³: 4,5 × 1.000 = 4.500 L.' },
          ],
          solution: ['$r = 1 m;  V = 3 × 1² × 1,5 = 4,5 m³', '$4,5 × 1.000 = 4.500 L'],
        })),
      ],
      practice: [gen(pourGen), gen(priceGen), gen(tankTimeGen)],
      challenge: [gen(cylPercentGen), gen(pourGen), gen(priceGen), gen(levelCylGen)],
      recap: [
        'Trocar de recipiente não muda o volume do líquido.',
        'Preço por mL: preço ÷ volume.',
        'Tempo = litros ÷ vazão (m³ × 1.000 = L).',
      ],
    })),
  ],
});
