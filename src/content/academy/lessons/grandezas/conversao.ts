/**
 * Aula: Conversão de unidades — a escada de comprimento, massa e capacidade (cada degrau,
 * × 10), unidades de área (× 100 por degrau, hectare) e de volume (× 1.000, litros), doses,
 * gotas e porções, e maestria (conta de água, adubo por hectare e doses por peso).
 */
import {
  askStep,
  check,
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
  order,
  p,
  reveal,
  stage,
  step,
  strategy,
  text,
  tip,
  warn,
} from '../../kit/build';
import { brl, num, round } from '../../kit/format';
import type { Rand, Tone } from '../../types';

const LEN = ['km', 'hm', 'dam', 'm', 'dm', 'cm', 'mm'];

/**
 * Rascunho de conversão: resposta = valor × fator. O erro de direção (dividir em vez de
 * multiplicar, ou o contrário) entra sempre; `slips` são os fatores trocados típicos.
 */
function conv(c: { t: string; ask: string; value: number; from: string; to: string; factor: number; rule: string; slips: { factor: number; feedback: string }[] }) {
  const ans = round(c.value * c.factor, 6);
  const up = c.factor > 1;
  const op = up ? `× ${num(c.factor, 6)}` : `÷ ${num(1 / c.factor, 6)}`;
  return draftNumeric({
    prompt: [p(c.t)],
    ask: c.ask,
    unit: c.to,
    answer: ans,
    wrong: [
      { value: round(c.value / c.factor, 6), feedback: `Isso faz a conta ao contrário. De ${c.from} para ${c.to} a unidade fica ${up ? 'menor, então o número fica maior' : 'maior, então o número fica menor'}: ${op}.` },
      ...c.slips.map((s) => ({ value: round(c.value * s.factor, 6), feedback: s.feedback })),
    ],
    hints: [c.rule, up ? 'A unidade nova é menor: cabem mais dela, e o número aumenta.' : 'A unidade nova é maior: cabem menos dela, e o número diminui.'],
    solution: [`$${num(c.value, 6)} ${c.from} ${op} = ${num(ans, 6)} ${c.to}`],
  });
}

// ———————————————————————————————————————————————— geradores: a escada

/** Comprimentos: km, m, cm e mm. */
function lengthConvGen(r: Rand) {
  const k = r.int(0, 3);
  if (k === 0) {
    const v = r.pick([1.2, 2.5, 3.75, 4.8, 12.5, 0.85]);
    return conv({
      t: `Uma trilha num parque tem ${num(v)} km de extensão.`,
      ask: 'Quantos metros tem a trilha?',
      value: v,
      from: 'km',
      to: 'm',
      factor: 1000,
      rule: '1 km = 1.000 m: são três degraus na escada (km → hm → dam → m).',
      slips: [
        { factor: 100, feedback: 'Isso usa 1 km = 100 m. De km para m são três degraus: × 10 × 10 × 10 = × 1.000.' },
        { factor: 10000, feedback: 'Isso desce quatro degraus. De km para m são três: × 1.000.' },
      ],
    });
  }
  if (k === 1) {
    const v = r.pick([35, 48, 125, 250, 7.5]);
    return conv({
      t: `Um parafuso tem ${num(v)} mm de comprimento.`,
      ask: 'Qual é o comprimento do parafuso, em centímetros?',
      value: v,
      from: 'mm',
      to: 'cm',
      factor: 0.1,
      rule: '1 cm = 10 mm: é um degrau só.',
      slips: [{ factor: 0.01, feedback: 'Isso divide por 100, como de cm para m. De mm para cm é um degrau só: ÷ 10.' }],
    });
  }
  if (k === 2) {
    const v = r.pick([180, 245, 1250, 3600, 75]);
    return conv({
      t: `Uma fita de cetim mede ${num(v)} cm.`,
      ask: 'Quantos metros tem a fita?',
      value: v,
      from: 'cm',
      to: 'm',
      factor: 0.01,
      rule: '1 m = 100 cm: são dois degraus (m → dm → cm).',
      slips: [
        { factor: 0.1, feedback: 'Isso divide por 10, um degrau só. De cm para m são dois degraus: ÷ 100.' },
        { factor: 0.001, feedback: 'Isso divide por 1.000, como de mm para m. De cm para m: ÷ 100.' },
      ],
    });
  }
  const v = r.pick([750, 1500, 2350, 4800, 12000]);
  return conv({
    t: `Uma corrida de rua tem ${num(v)} m de percurso.`,
    ask: 'Quantos quilômetros tem o percurso?',
    value: v,
    from: 'm',
    to: 'km',
    factor: 0.001,
    rule: '1 km = 1.000 m.',
    slips: [{ factor: 0.01, feedback: 'Isso divide por 100. Um quilômetro tem 1.000 metros: ÷ 1.000.' }],
  });
}

/** Massas: t, kg, g e mg. */
function massConvGen(r: Rand) {
  const k = r.int(0, 3);
  if (k === 0) {
    const v = r.pick([250, 500, 750, 125, 80]);
    return conv({
      t: `Um comprimido tem ${v} mg de princípio ativo.`,
      ask: 'Quantos gramas de princípio ativo há no comprimido?',
      value: v,
      from: 'mg',
      to: 'g',
      factor: 0.001,
      rule: '1 g = 1.000 mg.',
      slips: [{ factor: 0.01, feedback: 'Isso divide por 100. Um grama tem 1.000 miligramas: ÷ 1.000.' }],
    });
  }
  if (k === 1) {
    const v = r.pick([0.75, 1.25, 2.5, 0.3, 1.8]);
    return conv({
      t: `Uma receita de pão usa ${num(v)} kg de farinha.`,
      ask: 'Quantos gramas de farinha a receita usa?',
      value: v,
      from: 'kg',
      to: 'g',
      factor: 1000,
      rule: '1 kg = 1.000 g.',
      slips: [{ factor: 100, feedback: 'Isso usa 1 kg = 100 g. Um quilograma tem 1.000 gramas.' }],
    });
  }
  if (k === 2) {
    const v = r.pick([12.5, 8, 25, 3.6, 0.9]);
    return conv({
      t: `Um caminhão transporta ${num(v)} toneladas de soja.`,
      ask: 'Quantos quilogramas de soja ele transporta?',
      value: v,
      from: 't',
      to: 'kg',
      factor: 1000,
      rule: '1 t = 1.000 kg.',
      slips: [
        { factor: 100, feedback: 'Isso usa 1 t = 100 kg. Uma tonelada tem 1.000 kg.' },
        { factor: 1000000, feedback: 'Isso converte para gramas (1 t = 1.000.000 g). A pergunta pede quilogramas.' },
      ],
    });
  }
  const v = r.pick([250, 500, 400, 1200, 50]);
  return conv({
    t: `Um pacote de café tem ${num(v)} g.`,
    ask: 'Quantos quilogramas de café há no pacote?',
    value: v,
    from: 'g',
    to: 'kg',
    factor: 0.001,
    rule: '1 kg = 1.000 g.',
    slips: [{ factor: 0.01, feedback: 'Isso divide por 100. Um quilograma tem 1.000 gramas: ÷ 1.000.' }],
  });
}

/** Capacidades: L, mL e cm³. */
function capacityConvGen(r: Rand) {
  const k = r.int(0, 2);
  if (k === 0) {
    const v = r.pick([350, 220, 473, 310, 600]);
    return conv({
      t: `Uma lata de suco tem ${v} mL.`,
      ask: 'Quantos litros de suco há na lata?',
      value: v,
      from: 'mL',
      to: 'L',
      factor: 0.001,
      rule: '1 L = 1.000 mL.',
      slips: [{ factor: 0.01, feedback: 'Isso divide por 100. Um litro tem 1.000 mililitros: ÷ 1.000.' }],
    });
  }
  if (k === 1) {
    const v = r.pick([1.5, 0.5, 2, 0.75, 1.25]);
    return conv({
      t: `Uma garrafa de água tem ${num(v)} L.`,
      ask: 'Quantos mililitros de água há na garrafa?',
      value: v,
      from: 'L',
      to: 'mL',
      factor: 1000,
      rule: '1 L = 1.000 mL.',
      slips: [{ factor: 100, feedback: 'Isso usa 1 L = 100 mL. Um litro tem 1.000 mililitros.' }],
    });
  }
  const v = r.pick([125, 150, 250, 600, 1000]);
  return conv({
    t: `O motor de uma moto tem ${v} cm³ (as "cilindradas").`,
    ask: 'Quantos litros isso representa?',
    value: v,
    from: 'cm³',
    to: 'L',
    factor: 0.001,
    rule: '1 L = 1.000 cm³ (e 1 cm³ = 1 mL).',
    slips: [
      { factor: 0.01, feedback: 'Isso divide por 100. Um litro tem 1.000 cm³: ÷ 1.000.' },
      { factor: 0.000001, feedback: 'Isso divide por 1.000.000, como de cm³ para m³. Para litros: ÷ 1.000.' },
    ],
  });
}

// ———————————————————————————————————————————————— geradores: área e volume

/** Áreas: cm², m² e km² (cada degrau vale × 100). */
function areaConvGen(r: Rand) {
  const k = r.int(0, 2);
  if (k === 0) {
    const s = r.pick([15, 20, 25, 50, 60]); // 30 cm: exemplo da teoria
    return conv({
      t: `Um azulejo quadrado de ${s} cm de lado tem ${num(s * s)} cm² de área.`,
      ask: 'Qual é a área do azulejo, em metros quadrados?',
      value: s * s,
      from: 'cm²',
      to: 'm²',
      factor: 0.0001,
      rule: '1 m² = 100 cm × 100 cm = 10.000 cm².',
      slips: [{ factor: 0.01, feedback: 'Isso divide por 100, como em comprimentos. Em área, cada degrau vale 100: de cm² para m² são dois degraus, ÷ 10.000.' }],
    });
  }
  if (k === 1) {
    const v = r.pick([1.2, 2.5, 0.8, 1.75, 0.45]);
    return conv({
      t: `Uma toalha de mesa tem ${num(v)} m² de tecido.`,
      ask: 'Quantos centímetros quadrados de tecido tem a toalha?',
      value: v,
      from: 'm²',
      to: 'cm²',
      factor: 10000,
      rule: '1 m² = 100 cm × 100 cm = 10.000 cm².',
      slips: [
        { factor: 100, feedback: 'Isso multiplica por 100, como em comprimentos. Cada m² tem 100 × 100 = 10.000 cm².' },
        { factor: 1000, feedback: 'Isso multiplica por 1.000. Em área, de m² para cm² são dois degraus de × 100: × 10.000.' },
      ],
    });
  }
  const v = r.pick([0.6, 1.5, 2.25, 4, 0.08]);
  return conv({
    t: `Um parque ocupa ${num(v)} km².`,
    ask: 'Quantos metros quadrados ocupa o parque?',
    value: v,
    from: 'km²',
    to: 'm²',
    factor: 1000000,
    rule: '1 km² = 1.000 m × 1.000 m = 1.000.000 m².',
    slips: [{ factor: 1000, feedback: 'Isso multiplica por 1.000, como em comprimentos. Um km² é um quadrado de 1.000 m de lado: 1.000.000 m².' }],
  });
}

/** Hectares (a área da questão do banco, 2,4 ha, fica de fora). */
function hectareGen(r: Rand) {
  if (r.next() < 0.5) {
    const v = r.pick([0.5, 1.5, 3.2, 12, 0.8, 4.5]);
    return conv({
      t: `Uma fazenda tem ${num(v)} ${v >= 2 ? 'hectares' : 'hectare'} de pasto.`,
      ask: 'Quantos metros quadrados de pasto tem a fazenda?',
      value: v,
      from: 'ha',
      to: 'm²',
      factor: 10000,
      rule: '1 ha é a área de um quadrado de 100 m de lado: 100 × 100 = 10.000 m².',
      slips: [
        { factor: 100, feedback: 'Isso usa 1 ha = 100 m², confundindo o lado (100 m) com a área. O quadrado de 100 m de lado tem 10.000 m².' },
        { factor: 1000, feedback: 'Isso usa 1 ha = 1.000 m². Um hectare tem 100 × 100 = 10.000 m².' },
      ],
    });
  }
  const v = r.pick([5000, 25000, 18000, 125000, 7500]);
  return conv({
    t: `Um terreno à venda tem ${num(v)} m².`,
    ask: 'Quantos hectares tem o terreno?',
    value: v,
    from: 'm²',
    to: 'ha',
    factor: 0.0001,
    rule: '1 ha = 10.000 m² (um quadrado de 100 m de lado).',
    slips: [{ factor: 0.01, feedback: 'Isso divide por 100. Um hectare tem 10.000 m²: ÷ 10.000.' }],
  });
}

/** Volumes: m³, L e cm³ (cada degrau vale × 1.000). */
function volumeConvGen(r: Rand) {
  const k = r.int(0, 2);
  if (k === 0) {
    const v = r.pick([0.5, 1.5, 2.5, 5, 0.25, 4]);
    return conv({
      t: `Uma piscina de plástico tem ${num(v)} m³ de capacidade.`,
      ask: 'Quantos litros cabem na piscina?',
      value: v,
      from: 'm³',
      to: 'L',
      factor: 1000,
      rule: '1 m³ = 1.000 L (1 m = 10 dm, e 10 × 10 × 10 = 1.000 dm³).',
      slips: [
        { factor: 100, feedback: 'Isso usa 1 m³ = 100 L. Como 1 m = 10 dm, 1 m³ = 10 × 10 × 10 = 1.000 dm³ = 1.000 L.' },
        { factor: 1000000, feedback: 'Isso dá mililitros (1 m³ = 1.000.000 mL). Em litros: × 1.000.' },
      ],
    });
  }
  if (k === 1) {
    const v = r.pick([500, 1500, 20000, 750, 12000]);
    return conv({
      t: `Um reservatório guarda ${num(v)} L de água.`,
      ask: 'Quantos metros cúbicos de água ele guarda?',
      value: v,
      from: 'L',
      to: 'm³',
      factor: 0.001,
      rule: '1 m³ = 1.000 L.',
      slips: [{ factor: 0.01, feedback: 'Isso divide por 100. Cada metro cúbico tem 1.000 litros: ÷ 1.000.' }],
    });
  }
  const v = r.pick([0.5, 1.5, 2, 0.6, 0.35]);
  return conv({
    t: `Um pote de sorvete tem ${num(v)} L.`,
    ask: 'Qual é o volume do pote, em centímetros cúbicos?',
    value: v,
    from: 'L',
    to: 'cm³',
    factor: 1000,
    rule: '1 L = 1 dm³ = 1.000 cm³.',
    slips: [{ factor: 100, feedback: 'Isso usa 1 L = 100 cm³. Um litro é um cubo de 10 cm de aresta: 10 × 10 × 10 = 1.000 cm³.' }],
  });
}

// ———————————————————————————————————————————————— geradores: doses e porções

/** Gotas: quantos dias completos dura um frasco (a receita da questão do banco fica de fora). */
function dropsGen(r: Rand) {
  for (;;) {
    const g = r.pick([10, 15, 20, 25, 30, 40]);
    const n = r.pick([1, 2, 3]);
    const F = r.pick([10, 15, 20, 25, 30, 50]);
    const k = r.pick([20, 25]);
    if (g === 15 && n === 3 && F === 30 && k === 20) continue; // questão do banco
    const total = F * k;
    const perDay = g * n;
    const days = Math.floor(total / perDay);
    if (days < 3 || days > 60) continue;
    const times = n === 1 ? 'uma vez ao dia' : n === 2 ? 'duas vezes ao dia' : 'três vezes ao dia';
    return draftNumeric({
      prompt: [p(`Uma veterinária receitou para um cão ${g} gotas de um suplemento, ${times}. O frasco tem ${F} mL e, segundo a bula, 1 mL corresponde a ${k} gotas.`)],
      ask: 'Para quantos dias completos o frasco é suficiente?',
      unit: 'dias',
      answer: days,
      wrong: [
        { value: Math.ceil(total / perDay), feedback: `Isso arredonda para cima: ${total} ÷ ${perDay} = ${num(total / perDay, 2)}, e o último dia ficaria incompleto. Contam só os dias completos.` },
        { value: round(F / perDay, 4), feedback: `Isso divide os mililitros pelas gotas, sem converter. O frasco tem ${F} × ${k} = ${total} gotas.` },
        { value: Math.floor(total / g), feedback: `Isso conta doses, e não dias: cada dia tem ${n} doses de ${g} gotas.` },
      ],
      hints: [`Gotas no frasco: ${F} × ${k}. Gotas por dia: ${g} × ${n}.`, 'Divida e fique só com a parte inteira: dias completos.'],
      solution: [`$frasco: ${F} × ${k} = ${total} gotas;  por dia: ${g} × ${n} = ${perDay} gotas`, `$${total} ÷ ${perDay} = ${num(total / perDay, 2)} → ${days} dias completos`],
    });
  }
}

/** Porções: litros ÷ mililitros de cada copo (a combinação da questão do banco fica de fora). */
function cupsGen(r: Rand) {
  const big = r.next() < 0.5;
  const V = big ? r.pick([5, 10, 20]) : r.pick([1, 1.5, 2, 3]);
  const c = big ? r.pick([300, 350, 500, 750]) : r.pick([50, 80, 120, 150, 200, 300]);
  const mL = V * 1000;
  const n = Math.floor(mL / c);
  return draftNumeric({
    prompt: [p(big ? `Um galão com ${V} L de água mineral será dividido em garrafinhas de ${c} mL, todas cheias.` : `Uma garrafa térmica com ${num(V)} L de café será servida em xícaras de ${c} mL, todas cheias.`)],
    ask: big ? 'Quantas garrafinhas podem ser enchidas?' : 'Quantas xícaras podem ser servidas?',
    unit: big ? 'garrafinhas' : 'xícaras',
    answer: n,
    wrong: [
      { value: round(V / c, 5), feedback: `Isso divide litros por mililitros. Converta antes: ${num(V)} L = ${num(mL)} mL.` },
      { value: round((V * 100) / c, 2), feedback: `Isso usa 1 L = 100 mL. Um litro tem 1.000 mL: ${num(V)} L = ${num(mL)} mL.` },
      { value: Math.ceil(mL / c), feedback: `Isso arredonda para cima, mas o último recipiente não ficaria cheio: ${num(mL)} ÷ ${c} = ${num(mL / c, 2)}.` },
    ],
    hints: [`${num(V)} L = ${num(mL)} mL.`, `Divida por ${c} mL e fique com a parte inteira.`],
    solution: [`$${num(V)} L = ${num(mL)} mL`, `$${num(mL)} ÷ ${c} = ${num(mL / c, 2)} → ${n} cheias`],
  });
}

/** Dose por peso: mg por kg → mL de xarope. */
function doseGen(r: Rand) {
  for (;;) {
    const w = r.pick([12, 15, 18, 20, 24, 30]);
    const m = r.pick([5, 10, 15]);
    const C = r.pick([100, 125, 200, 250]);
    if (w === 18 && m === 10 && C === 100) continue; // exercício da teoria
    const mg = w * m;
    if ((mg * 50) % C !== 0) continue; // mL com no máximo uma casa decimal
    const ml = (mg * 5) / C;
    return draftNumeric({
      prompt: [p(`Para uma criança de ${w} kg, a pediatra indicou ${m} mg de um antitérmico por quilograma de peso, em cada dose. O xarope tem ${C} mg do remédio em cada 5 mL.`)],
      ask: 'Quantos mililitros devem ser dados em cada dose?',
      unit: 'mL',
      answer: ml,
      wrong: [
        { value: mg, feedback: `Essa é a dose em miligramas (${w} × ${m} = ${mg} mg). Falta converter para mililitros de xarope.` },
        { value: round(mg / C, 3), feedback: `Isso conta quantas porções de ${C} mg cabem na dose, mas cada porção tem 5 mL: multiplique por 5.` },
        { value: round((m * 5) / C, 3), feedback: `Essa seria a dose para 1 kg. A criança tem ${w} kg.` },
      ],
      hints: [`Dose em mg: ${w} kg × ${m} mg/kg.`, `Regra de três: ${C} mg estão em 5 mL; ${mg} mg estão em x mL.`],
      solution: [`$dose: ${w} × ${m} = ${mg} mg`, `$${mg} ÷ ${C} × 5 = ${num(ml)} mL`],
    });
  }
}

// ———————————————————————————————————————————————— geradores: maestria

/** Conta de água: litros por dia → metros cúbicos no mês → reais. */
function billGen(r: Rand) {
  const Lpd = r.pick([400, 500, 600, 750, 800]);
  const T = r.pick([4, 5, 6.5, 8]);
  const m3 = (Lpd * 30) / 1000;
  const cost = round(m3 * T, 2);
  return draftNumeric({
    prompt: [p(`Uma família consome, em média, ${num(Lpd)} litros de água por dia. A companhia de saneamento cobra ${brl(T)} por metro cúbico.`)],
    ask: 'Quanto a família paga por 30 dias de consumo?',
    prefix: 'R$',
    answer: cost,
    wrong: [
      { value: Lpd * 30 * T, feedback: `Isso cobra os litros como se fossem metros cúbicos. ${num(Lpd * 30)} L = ${num(m3)} m³.` },
      { value: round((Lpd * T) / 1000, 2), feedback: 'Esse é o custo de um dia só. Multiplique por 30 dias.' },
      { value: round(((Lpd * 30) / 100) * T, 2), feedback: 'Isso usa 1 m³ = 100 L. Cada metro cúbico tem 1.000 litros.' },
    ],
    hints: [`Em 30 dias: ${num(Lpd)} × 30 = ${num(Lpd * 30)} L.`, 'Passe para m³ (÷ 1.000) e multiplique pela tarifa.'],
    solution: [`$${num(Lpd)} × 30 = ${num(Lpd * 30)} L = ${num(m3)} m³`, `$${num(m3)} × ${num(T, 2)} = ${brl(cost)}`],
  });
}

/** Adubo: gramas por m² numa área em hectares → quilogramas. */
function fertilizerGen(r: Rand) {
  const a = r.pick([20, 25, 40, 50, 60]);
  const h = r.pick([0.5, 1.2, 2, 0.25, 3]);
  const kg = round(a * h * 10, 4);
  return draftNumeric({
    prompt: [p(`A recomendação para uma horta comercial é de ${a} g de adubo por metro quadrado. A área a adubar tem ${num(h)} ${h >= 2 ? 'hectares' : 'hectare'}.`)],
    ask: 'Quantos quilogramas de adubo serão necessários?',
    unit: 'kg',
    answer: kg,
    wrong: [
      { value: round(a * h * 10000, 4), feedback: 'Essa é a quantidade em gramas. Divida por 1.000 para ter quilogramas.' },
      { value: round((a * h * 100) / 1000, 4), feedback: 'Isso usa 1 ha = 100 m². Um hectare é um quadrado de 100 m de lado: 10.000 m².' },
      { value: round(a * h, 4), feedback: `Isso multiplica sem converter: os ${a} g valem para cada m², e cada hectare tem 10.000 m².` },
    ],
    hints: [`Área: ${num(h)} × 10.000 = ${num(h * 10000)} m².`, `Adubo: ${num(h * 10000)} × ${a} g; depois, ÷ 1.000 para kg.`],
    solution: [`$${num(h)} ha = ${num(h * 10000)} m²`, `$${num(h * 10000)} × ${a} = ${num(a * h * 10000)} g = ${num(kg)} kg`],
  });
}

// ———————————————————————————————————————————————— aula

const gridCellsAll = (n: number, t: Tone) => Array.from({ length: n * n }, () => t);

export const CONVERSAO = lesson({
  id: 'conversao',
  topic: 'grandezas',
  subtopics: ['conversao'],
  title: 'Conversão de unidades',
  summary: 'A escada das unidades de comprimento, massa e capacidade, por que área anda de 100 em 100 e volume de 1.000 em 1.000, hectares e litros, e doses, gotas e porções.',
  requires: ['operacoes', 'areas'],
  stages: [
    stage('escada', 'descoberta', 'A escada das unidades', 'Converter comprimentos, massas e capacidades usando a escada do sistema métrico: cada degrau multiplica ou divide por 10.', () => ({
      learn: [
        text('No sistema métrico, as unidades formam uma **escada**: km, hm, dam, **m**, dm, cm, mm. Cada degrau para baixo **multiplica por 10** (a unidade fica menor, então cabem mais dela); cada degrau para cima **divide por 10**. A mesma escada vale para massa (kg, hg, dag, **g**, dg, cg, mg) e capacidade (kL … **L** … mL).'),
        math('km → hm → dam → m → dm → cm → mm', 'cada degrau para baixo: × 10;  para cima: ÷ 10', '1 km = 1.000 m;  1 m = 100 cm;  1 kg = 1.000 g;  1 L = 1.000 mL'),
        lab({
          title: 'Descendo a escada',
          intro: 'Escolha a unidade e veja como fica a medida de 3,5 km.',
          params: [{ key: 'u', label: 'Unidade', min: 0, max: 6, step: 1, value: 0, format: (v) => LEN[v] }],
          readouts: ({ u }) => [
            { label: 'Degraus descidos', value: u === 0 ? 'nenhum' : `${u} (× ${num(10 ** u)})` },
            { label: 'Medida', value: `3,5 km = ${num(3.5 * 10 ** u)} ${LEN[u]}`, big: true, tone: 'brass' },
          ],
          goal: {
            task: 'Ache a unidade em que 3,5 km se escreve 350.000.',
            done: ({ u }) => u === 5,
            success: 'Isso: 3,5 km = 350.000 cm. São 5 degraus para baixo: × 10 cinco vezes = × 100.000.',
          },
          insight: 'Quanto menor a unidade, maior o número: a medida é a mesma, só muda a "régua".',
        }),
        example('A maratona', 'Uma maratona tem 42,195 km. Quantos metros são?', [
          askStep('De km para m, a unidade fica menor.', 'O que fazer com o número?', [
            ok('Multiplicar por 1.000 (três degraus para baixo)'),
            no('Dividir por 1.000', 'O metro é menor que o quilômetro: cabem mais metros, então o número aumenta. Multiplique por 1.000.'),
          ]),
          step('Conta:', '42,195 × 1.000 = 42.195 m'),
        ], 'A maratona tem 42.195 m.'),
        warn('Para onde vai a vírgula?', 'Multiplicar por 10, 100 ou 1.000 desloca a vírgula 1, 2 ou 3 casas para a direita; dividir, para a esquerda. Complete com zeros quando faltarem casas: 0,5 g = 500 mg.'),
        check(numeric({
          prompt: [p('Um comprimido tem 0,5 g de princípio ativo.')],
          ask: 'Quantos miligramas são?',
          unit: 'mg',
          answer: 500,
          wrong: [
            { value: 50, feedback: 'Isso multiplica por 100. Um grama tem 1.000 miligramas: 0,5 × 1.000 = 500.' },
            { value: 5000, feedback: 'Isso multiplica por 10.000. De g para mg são três degraus: × 1.000.' },
            { value: 0.0005, feedback: 'Isso divide por 1.000. O miligrama é menor: o número aumenta, 0,5 × 1.000 = 500.' },
          ],
          solution: ['$1 g = 1.000 mg', '$0,5 × 1.000 = 500 mg'],
        })),
      ],
      practice: [
        gen(lengthConvGen),
        gen(massConvGen),
        gen(capacityConvGen),
        order({
          ask: 'Ponha os comprimentos em ordem, do maior para o menor.',
          steps: ['2,5 km', '300 m', '25.000 cm', '2.600 mm'],
          hints: ['Converta tudo para metros antes de comparar.', '25.000 cm = 250 m e 2.600 mm = 2,6 m.'],
          solution: ['Em metros: 2,5 km = 2.500 m; 300 m; 25.000 cm = 250 m; 2.600 mm = 2,6 m.'],
          why: 'Com todos na mesma unidade, a comparação fica direta.',
        }),
      ],
      challenge: [gen(massConvGen), gen(capacityConvGen), gen(lengthConvGen)],
      recap: [
        'Cada degrau da escada: × 10 para baixo, ÷ 10 para cima.',
        '1 km = 1.000 m; 1 m = 100 cm; 1 kg = 1.000 g; 1 L = 1.000 mL.',
        'Unidade menor → número maior.',
      ],
    })),

    stage('area-volume', 'fundamentos', 'Unidades de área e de volume', 'Converter áreas (cada degrau, × 100; 1 ha = 10.000 m²) e volumes (cada degrau, × 1.000; 1 m³ = 1.000 L).', () => ({
      learn: [
        text('Área tem **duas** dimensões: 1 m² é um quadrado de 1 m × 1 m, que contém 10 × 10 = **100 dm²** ou 100 × 100 = **10.000 cm²**. Por isso, em área, cada degrau vale **× 100**. Volume tem **três** dimensões, e cada degrau vale **× 1.000**: 1 m³ = 1.000 dm³ = 1.000 L. O **hectare** (ha) é a área de um quadrado de 100 m de lado: 10.000 m².'),
        math('1 m² = 100 dm² = 10.000 cm²', '1 km² = 1.000.000 m²;  1 ha = 10.000 m²', '1 m³ = 1.000 dm³ = 1.000 L;  1 L = 1.000 cm³'),
        lab({
          title: 'Quadradinhos no metro quadrado',
          intro: 'Divida cada lado de um quadrado de 1 m em partes iguais e conte os quadradinhos.',
          params: [{ key: 'n', label: 'Partes em cada lado', min: 1, max: 10, step: 1, value: 2, format: (v) => String(v) }],
          readouts: ({ n }) => [
            { label: 'Lado de cada quadradinho', value: `${num(100 / n, 2)} cm` },
            { label: 'Quadradinhos', value: `${n} × ${n} = ${n * n}`, big: true, tone: 'brass' },
          ],
          viz: ({ n }) => ({
            kind: 'grid',
            rows: n,
            cols: n,
            cells: gridCellsAll(n, 'brass'),
            legend: [{ tone: 'brass', label: `quadradinhos de ${num(100 / n, 2)} cm de lado` }],
            summary: `1 m² dividido em ${n} × ${n} = ${n * n} quadradinhos de ${num(100 / n, 2)} cm de lado`,
          }),
          goal: {
            task: 'Divida o metro quadrado em quadradinhos de 1 dm (10 cm) de lado.',
            done: ({ n }) => n === 10,
            success: 'Isso: 10 × 10 = 100 quadradinhos. Um degrau na escada de comprimento (1 m = 10 dm) vira × 100 na área: 1 m² = 100 dm².',
          },
          insight: 'O lado foi dividido por 10, mas a quantidade de quadradinhos foi multiplicada por 100: em área, os fatores aparecem ao quadrado.',
        }),
        example('O azulejo', 'Um azulejo quadrado de 30 cm de lado: qual é a área dele em m²?', [
          step('Em cm²:', '30 × 30 = 900 cm²'),
          askStep('Agora, a conversão.', 'Como passar 900 cm² para m²?', [
            ok('Dividir por 10.000'),
            no('Dividir por 100', 'Dividir por 100 serve para comprimentos (cm → m). Em área, 1 m² = 100 × 100 = 10.000 cm².'),
          ]),
        ], '900 ÷ 10.000 = 0,09 m². (Ou: 30 cm = 0,3 m, e 0,3 × 0,3 = 0,09 m².)'),
        tip('Converta antes de multiplicar', 'Um caminho mais seguro: passe as medidas lineares para a unidade desejada e só depois calcule a área ou o volume. 30 cm = 0,3 m → 0,3 × 0,3 = 0,09 m².'),
        check(numeric({
          prompt: [p('Uma parede tem 3,5 m² de área.')],
          ask: 'Quantos centímetros quadrados são?',
          unit: 'cm²',
          answer: 35000,
          wrong: [
            { value: 350, feedback: 'Isso multiplica por 100, como em comprimentos. Cada m² tem 100 × 100 = 10.000 cm².' },
            { value: 3500, feedback: 'Isso multiplica por 1.000. De m² para cm² são dois degraus de × 100: × 10.000.' },
            { value: 0.00035, feedback: 'Isso divide. O cm² é menor que o m²: o número aumenta, × 10.000.' },
          ],
          solution: ['$1 m² = 10.000 cm²', '$3,5 × 10.000 = 35.000 cm²'],
        })),
      ],
      practice: [gen(areaConvGen), gen(hectareGen), gen(volumeConvGen)],
      challenge: [gen(hectareGen), gen(volumeConvGen), gen(areaConvGen)],
      recap: [
        'Área: cada degrau vale × 100 (1 m² = 10.000 cm²).',
        'Hectare: 100 m × 100 m = 10.000 m².',
        'Volume: cada degrau vale × 1.000 (1 m³ = 1.000 L).',
      ],
    })),

    stage('doses', 'aplicacoes', 'Doses, gotas e porções', 'Resolver problemas de remédios, gotas e porções que exigem converter unidades e decidir como arredondar.', () => ({
      learn: [
        text('Em problemas de doses e porções, o roteiro é sempre o mesmo: **ponha tudo na mesma unidade** (mL com mL, gotas com gotas, mg com mg) e então divida. Atenção ao **arredondamento**: "dias completos" ou "copos cheios" pedem a **parte inteira** do resultado — o que sobra não forma mais um dia nem mais um copo.'),
        math('quantidade de porções = total ÷ tamanho de cada porção (na mesma unidade)'),
        lab({
          title: 'O frasco de gotas',
          intro: 'Um frasco tem 20 mL de um remédio, e cada mL tem 20 gotas. Escolha a receita.',
          params: [
            { key: 'g', label: 'Gotas por dose', min: 5, max: 30, step: 5, value: 5, format: (v) => `${v} gotas` },
            { key: 'n', label: 'Doses por dia', min: 1, max: 4, step: 1, value: 1, format: (v) => `${v}×` },
          ],
          readouts: ({ g, n }) => [
            { label: 'Gotas no frasco', value: '20 mL × 20 = 400 gotas' },
            { label: 'Gotas por dia', value: `${g} × ${n} = ${g * n}` },
            { label: 'Dias completos', value: `${Math.floor(400 / (g * n))}`, big: true, tone: 'brass' },
            { label: 'Sobram', value: `${400 - Math.floor(400 / (g * n)) * g * n} gotas` },
          ],
          goal: {
            task: 'Ache uma receita em que o frasco dure exatamente 10 dias, sem sobrar nenhuma gota.',
            done: ({ g, n }) => g * n * 10 === 400,
            success: 'Isso: 40 gotas por dia (20 × 2 ou 10 × 4), e 400 ÷ 40 = 10 dias exatos.',
          },
          insight: 'Quando a divisão não é exata, a sobra não chega a completar mais um dia: conte só a parte inteira.',
        }),
        example('A garrafa térmica', 'Uma garrafa térmica tem 1,8 L de café. Quantas xícaras de 60 mL ela serve, todas cheias?', [
          askStep('Litros e mililitros não se dividem direto.', 'Quanto é 1,8 L em mL?', [
            ok('1.800 mL'),
            no('180 mL', 'Isso usa 1 L = 100 mL. Um litro tem 1.000 mL: 1,8 × 1.000 = 1.800 mL.'),
          ]),
          step('Divida:', '1.800 ÷ 60 = 30'),
        ], 'São 30 xícaras.'),
        check(numeric({
          prompt: [p('Uma criança de 18 kg deve tomar 10 mg de um remédio por quilograma de peso, em cada dose. O xarope tem 100 mg do remédio em cada 5 mL.')],
          ask: 'Quantos mililitros devem ser dados em cada dose?',
          unit: 'mL',
          answer: 9,
          wrong: [
            { value: 180, feedback: 'Essa é a dose em miligramas (18 × 10). Falta converter para mililitros de xarope.' },
            { value: 1.8, feedback: '180 ÷ 100 = 1,8 conta porções de 100 mg, mas cada uma tem 5 mL: 1,8 × 5 = 9 mL.' },
            { value: 36, feedback: 'Isso divide 180 mg por 5. A concentração é de 100 mg em 5 mL, ou 20 mg por mL: 180 ÷ 20 = 9 mL.' },
          ],
          solution: ['$dose: 18 × 10 = 180 mg', '$100 mg em 5 mL → 20 mg por mL', '$180 ÷ 20 = 9 mL'],
        })),
      ],
      practice: [gen(dropsGen), gen(cupsGen), gen(doseGen)],
      challenge: [gen(doseGen), gen(dropsGen), gen(cupsGen)],
      recap: [
        'Mesma unidade antes de dividir.',
        '"Completos" ou "cheios": fique com a parte inteira.',
        'Dose por peso: mg/kg × kg, depois converta pela concentração.',
      ],
    })),

    stage('maestria', 'maestria', 'Maestria: medidas no ENEM', 'Resolver problemas inéditos que encadeiam várias conversões: tempo, volume, área e dinheiro.', () => ({
      learn: [
        strategy('Conversões em 4 passos', '1) Liste as grandezas e suas unidades. 2) Decida a unidade final pedida. 3) Converta uma etapa por vez — comprimento (× 10 por degrau), área (× 100), volume (× 1.000), hectare (10.000 m²), litro (1.000 mL). 4) Confira a ordem de grandeza: um copo tem centenas de mL, e não milhares de litros.'),
        example('O condomínio', 'Um condomínio consumiu 45 m³ de água em 30 dias. Quantos litros por dia, em média?', [
          step('Em litros:', '45 m³ = 45 × 1.000 = 45.000 L'),
          askStep('Agora, por dia.', 'Qual é a média diária?', [
            ok('45.000 ÷ 30 = 1.500 L por dia'),
            no('45 ÷ 30 = 1,5 L por dia', 'Isso esquece de converter: 45 m³ são 45.000 L, e não 45 L.'),
          ]),
        ], 'São 1.500 L por dia.'),
        key('A unidade conta a história', 'Escrever as unidades em cada passo (L/dia × dias = L; L ÷ 1.000 = m³; m³ × R$/m³ = R$) evita a maioria dos erros: se as unidades não se cancelam, a conta está errada.'),
        reveal('Por que o sistema métrico usa potências de 10?', 'Para que converter seja só deslocar a vírgula. Em sistemas antigos (polegadas, pés, jardas), cada passo tinha um fator diferente — 12 polegadas num pé, 3 pés numa jarda — e as contas eram bem mais trabalhosas.'),
        check(numeric({
          prompt: [p('Uma torneira pingando desperdiça 40 mL de água por minuto.')],
          ask: 'Quantos litros ela desperdiça em um dia?',
          unit: 'L',
          answer: 57.6,
          wrong: [
            { value: 57600, feedback: 'Essa é a quantidade em mililitros (40 × 60 × 24). Divida por 1.000 para ter litros.' },
            { value: 2.4, feedback: 'Esse é o desperdício de uma hora (40 × 60 = 2.400 mL). Um dia tem 24 horas.' },
            { value: 576, feedback: 'Isso usa 1 L = 100 mL. Um litro tem 1.000 mL: 57.600 ÷ 1.000 = 57,6 L.' },
          ],
          solution: ['$40 × 60 × 24 = 57.600 mL', '$57.600 ÷ 1.000 = 57,6 L'],
        })),
      ],
      practice: [gen(billGen), gen(fertilizerGen), gen(doseGen)],
      challenge: [gen(fertilizerGen), gen(billGen), gen(dropsGen), gen(hectareGen)],
      recap: [
        'Uma conversão por vez, com as unidades escritas.',
        'L ÷ 1.000 = m³; ha × 10.000 = m²; g ÷ 1.000 = kg.',
        'Confira a ordem de grandeza da resposta.',
      ],
    })),
  ],
});
