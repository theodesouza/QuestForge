/**
 * Aula: Razão — comparar por divisão (parte : parte, parte : todo, ordem), taxas e razões
 * unitárias (preço por kg, km/L, MB/s, hab/km², por mil habitantes), dividir um total numa
 * razão, unir razões, razões que mudam e as razões encadeadas das aplicações (engrenagens,
 * densidade, sensores com zero deslocado, emissões por pessoa).
 */
import {
  askStep,
  check,
  choice,
  classify,
  draftChoice,
  draftNumeric,
  enem,
  example,
  gen,
  key,
  lab,
  lesson,
  no,
  numeric,
  ok,
  p,
  reveal,
  select,
  stage,
  step,
  strategy,
  table,
  text,
  tip,
  warn,
} from '../../kit/build';
import { brl, frac, gcd, lcm, num, round } from '../../kit/format';
import type { Option, Rand } from '../../types';

const ratio = (a: number, b: number) => {
  const g = gcd(a, b) || 1;
  return `${a / g} : ${b / g}`;
};

// ———————————————————————————————————————————————— geradores

const GROUPS = [
  { a: 'meninas', b: 'meninos', who: 'Uma turma tem' },
  { a: 'livros de romance', b: 'livros de poesia', who: 'Uma estante tem' },
  { a: 'carros elétricos', b: 'carros a combustão', who: 'Uma frota tem' },
  { a: 'votos a favor', b: 'votos contra', who: 'Numa votação houve' },
];

type PartKind = 'ab' | 'ba' | 'at' | 'bt';

/** Parte : parte ou parte : todo, na ordem pedida. */
function partGen(r: Rand) {
  for (;;) {
    const g = r.pick(GROUPS);
    const k = r.int(2, 9);
    const x = r.int(1, 6);
    const y = r.int(1, 6);
    if (x === y || gcd(x, y) !== 1) continue;
    const a = x * k;
    const b = y * k;
    // Combinações das questões do banco e do texto da etapa.
    if ((a === 12 && b === 18) || (a === 45 && b === 30) || (a === 12 && b === 6) || (a === 15 && b === 20)) continue;
    const total = a + b;
    const asked = r.pick(['ab', 'ba', 'at', 'bt'] as const);
    const pair: Record<PartKind, [number, number]> = { ab: [a, b], ba: [b, a], at: [a, total], bt: [b, total] };
    const name: Record<PartKind, string> = {
      ab: `a razão ${g.a} : ${g.b}`,
      ba: `a razão ${g.b} : ${g.a}`,
      at: `a fração de ${g.a} no total`,
      bt: `a fração de ${g.b} no total`,
    };
    const ofTotal = (kind: PartKind) => kind === 'at' || kind === 'bt';
    const why = (wrong: PartKind) => {
      if (!ofTotal(asked) && !ofTotal(wrong)) return `A ordem importa: a pergunta pede ${pair[asked][0]} ÷ ${pair[asked][1]}.`;
      if (!ofTotal(asked)) return 'A pergunta compara as duas partes entre si, sem o total.';
      if (!ofTotal(wrong)) return `A pergunta compara uma parte com o TOTAL (${a} + ${b} = ${total}).`;
      return `A pergunta é sobre ${asked === 'at' ? g.a : g.b}.`;
    };
    const ask = {
      ab: `Qual é a razão entre ${g.a} e ${g.b}, nessa ordem?`,
      ba: `Qual é a razão entre ${g.b} e ${g.a}, nessa ordem?`,
      at: `Que fração do total é formada por ${g.a}?`,
      bt: `Que fração do total é formada por ${g.b}?`,
    }[asked];
    const [n0, d0] = pair[asked];
    const options: Option[] = [ok(frac(n0, d0))];
    const seen = new Set([frac(n0, d0)]);
    for (const kind of ['ab', 'ba', 'at', 'bt'] as const) {
      const t = frac(...pair[kind]);
      if (kind === asked || seen.has(t)) continue;
      seen.add(t);
      options.push(no(t, `Essa é ${name[kind]}. ${why(kind)}`));
    }
    return draftChoice({
      prompt: [p(`${g.who} ${a} ${g.a} e ${b} ${g.b}.`)],
      ask,
      options,
      hints: [
        'Identifique o que vem antes (numerador) e o que vem depois (denominador).',
        ofTotal(asked) ? `O total é ${a} + ${b} = ${total}.` : 'Compare as duas partes diretamente, sem o total.',
      ],
      solution: [`$[[${n0}|${d0}]] = ${frac(n0, d0)}`],
    });
  }
}

const OFFERS = [
  { item: 'arroz', unit: 'kg', sizes: [1, 2, 5] },
  { item: 'sabão em pó', unit: 'kg', sizes: [0.8, 1.6, 2.4, 4] },
  { item: 'detergente', unit: 'L', sizes: [0.5, 1, 2, 5] },
  { item: 'ração de gato', unit: 'kg', sizes: [0.5, 1, 3, 10] },
];

/** Menor preço por unidade entre três embalagens. */
function unitPriceGen(r: Rand) {
  for (;;) {
    const o = r.pick(OFFERS);
    const sizes = r.shuffle(o.sizes).slice(0, 3).sort((x, y) => x - y);
    const base = r.int(8, 40);
    const prices = sizes.map((s) => round(s * base * (1 + r.int(-12, 12) / 100), 2));
    const unit = prices.map((pr, i) => pr / sizes[i]);
    const best = unit.indexOf(Math.min(...unit));
    if (unit.filter((u) => Math.abs(u - unit[best]) < 0.05).length > 1) continue;
    const label = (s: number) => (o.unit === 'kg' && s < 1 ? `${num(s * 1000)} g` : `${num(s, 2)} ${o.unit}`);
    const options: Option[] = sizes.map((s, i) =>
      i === best
        ? ok(`A embalagem de ${label(s)}`)
        : no(`A embalagem de ${label(s)}`, `Ela sai por ${brl(unit[i])} o ${o.unit}, mais que os ${brl(unit[best])} da embalagem de ${label(sizes[best])}.`),
    );
    return draftChoice({
      prompt: [p(`Um mercado vende ${o.item} em três embalagens.`), table(['Embalagem', 'Preço'], sizes.map((s, i) => [label(s), brl(prices[i])]))],
      ask: `Qual embalagem tem o menor preço por ${o.unit}?`,
      options,
      fixedOrder: true,
      hints: [
        `Calcule o preço por ${o.unit} de cada uma: preço ÷ quantidade.`,
        sizes[0] < 1
          ? o.unit === 'kg'
            ? `Converta gramas em quilogramas antes de dividir (${label(sizes[0])} = ${num(sizes[0], 2)} kg).`
            : 'Meio litro é 0,5 L: divida o preço por 0,5.'
          : 'Embalagem maior não garante preço menor: faça as divisões.',
      ],
      solution: sizes.map((s, i) => `${label(s)}: ${brl(prices[i])} ÷ ${num(s, 2)} = ${brl(unit[i])} por ${o.unit}`),
    });
  }
}

/** Indicadores com base fixa: ocorrências por mil habitantes. */
function rateBaseGen(r: Rand) {
  const pop = r.pick([80000, 120000, 150000, 250000, 300000, 450000]);
  const rate = r.pick([8, 12, 15, 16, 18, 22]);
  const events = (rate * pop) / 1000;
  const what = r.pick([
    { name: 'nascidos vivos', label: 'taxa de natalidade' },
    { name: 'casos de dengue', label: 'taxa de incidência de dengue' },
    { name: 'acidentes de trânsito', label: 'taxa de acidentes' },
  ]);
  return draftNumeric({
    prompt: [p(`Uma cidade de ${num(pop)} habitantes registrou ${num(events)} ${what.name} em um ano. A ${what.label} é expressa em ocorrências para cada 1.000 habitantes.`)],
    ask: `Qual foi a ${what.label}, por mil habitantes?`,
    unit: 'por mil',
    answer: rate,
    wrong: [
      { value: rate / 10, feedback: 'Isso seria por 100 habitantes (porcentagem). A base pedida é 1.000.' },
      { value: rate * 10, feedback: 'Isso seria por 10.000 habitantes. A base pedida é 1.000.' },
      { value: round(pop / events, 2), feedback: 'A razão ficou invertida: são ocorrências por habitante, não habitantes por ocorrência.' },
      { value: round(events / pop, 4), feedback: 'Esse é o valor por habitante. Falta multiplicar pela base: × 1.000.' },
    ],
    hints: ['Taxa = ocorrências ÷ população × 1.000.', `${num(events)} ÷ ${num(pop)} = ${num(events / pop, 4)}.`],
    solution: [`$${num(events)} ÷ ${num(pop)} × 1.000 = ${rate} por mil habitantes`],
  });
}

/** Comparar rendimentos (km/L) obtidos com quantidades diferentes de combustível. */
function rateCompareGen(r: Rand) {
  for (;;) {
    const l1 = r.int(6, 15);
    const k1 = r.int(5, 12);
    const l2 = r.int(6, 15);
    const k2 = r.int(5, 12);
    if (k1 === k2) continue;
    // Números de uma questão do banco (54 km com 9 L contra 70 km com 10 L).
    if ((l1 === 9 && k1 === 6 && l2 === 10 && k2 === 7) || (l2 === 9 && k2 === 6 && l1 === 10 && k1 === 7)) continue;
    const d1 = l1 * k1;
    const d2 = l2 * k2;
    const diff = Math.abs(k1 - k2);
    const better = k1 > k2 ? 'primeiro' : 'segundo';
    return draftNumeric({
      prompt: [p(`Num teste, o primeiro carro percorreu ${d1} km com ${l1} L de combustível, e o segundo percorreu ${d2} km com ${l2} L.`)],
      ask: `Em quantos km/L o rendimento do ${better} carro supera o do outro?`,
      unit: 'km/L',
      answer: diff,
      wrong: [
        { value: Math.abs(d1 - d2), feedback: 'Comparar as distâncias não serve: os carros usaram quantidades diferentes de combustível. Compare km por litro.' },
        { value: Math.max(k1, k2), feedback: `${Math.max(k1, k2)} km/L é o rendimento do ${better} carro. A pergunta é a diferença.` },
        { value: round(Math.max(k1, k2) / Math.min(k1, k2), 2), feedback: 'Isso diz quantas VEZES um rende o outro. A pergunta é a diferença, em km/L.' },
      ],
      hints: ['Rendimento = distância ÷ litros.', `Primeiro: ${d1} ÷ ${l1}; segundo: ${d2} ÷ ${l2}.`],
      solution: [`$${d1} ÷ ${l1} = ${k1} km/L e ${d2} ÷ ${l2} = ${k2} km/L`, `$Diferença: ${diff} km/L`],
    });
  }
}

const NAMES = ['Ana', 'Bruno', 'Carla'];

/** Repartir um total numa razão de dois ou três termos. */
function splitGen(r: Rand) {
  for (;;) {
    const three = r.next() < 0.35;
    const w = three ? [r.int(1, 6), r.int(1, 6), r.int(1, 6)] : [r.int(1, 9), r.int(1, 9)];
    if (new Set(w).size < w.length || w.reduce((g2, x) => gcd(g2, x)) !== 1) continue;
    const sum = w.reduce((s, x) => s + x, 0);
    const k = r.int(3, 25);
    const total = sum * k;
    if (!three && w[0] === 7 && w[1] === 5 && total === 180) continue;
    const ask = r.int(0, w.length - 1);
    const names = NAMES.slice(0, w.length);
    const others = w.map((x, i) => ({ x, name: names[i] })).filter((_, i) => i !== ask);
    return draftNumeric({
      prompt: [p(`${three ? `${names[0]}, ${names[1]} e ${names[2]}` : `${names[0]} e ${names[1]}`} vão dividir ${brl(total)} de um prêmio na razão ${w.join(' : ')}, nessa ordem.`)],
      ask: `Quanto ${names[ask]} vai receber?`,
      prefix: 'R$',
      answer: w[ask] * k,
      wrong: [
        { value: round(total / w.length, 2), feedback: 'Isso divide em partes iguais. A razão diz quantas partes cada um recebe.' },
        { value: round((total * w[ask]) / others.reduce((s, o) => s + o.x, 0), 2), feedback: `Divida pelo TOTAL de partes (${sum}), não só pelas partes dos outros.` },
        { value: round(total / w[ask], 2), feedback: `Cada parte vale ${num(total)} ÷ ${sum}; depois multiplique pelas ${w[ask]} partes.` },
        ...others.map((o) => ({ value: o.x * k, feedback: `Essa é a parte de ${o.name}.` })),
      ],
      hints: [`Some as partes da razão: ${w.join(' + ')} = ${sum}.`, `Cada parte vale ${num(total)} ÷ ${sum} = ${k}.`],
      solution: [`$${w.join(' + ')} = ${sum} partes; cada parte = ${num(total)} ÷ ${sum} = ${k}`, `$${names[ask]}: ${w[ask]} × ${k} = ${brl(w[ask] * k)}`],
    });
  }
}

const CHAINS = [
  { where: 'Numa feira', what: 'barracas', many: 'Quantas barracas', a: 'frutas', b: 'verduras', c: 'artesanato' },
  { where: 'Numa escola', what: 'alunos', many: 'Quantos alunos', a: '6º ano', b: '7º ano', c: '8º ano' },
  { where: 'Num viveiro', what: 'mudas', many: 'Quantas mudas', a: 'ipê', b: 'jacarandá', c: 'pau-brasil' },
];

/** Unir a : b e b : c pelo termo comum. */
function combineGen(r: Rand) {
  for (;;) {
    const ctx = r.pick(CHAINS);
    const a = r.int(2, 7);
    const b = r.int(2, 7);
    const c = r.int(2, 7);
    const d = r.int(2, 7);
    if (a === b || c === d || gcd(a, b) !== 1 || gcd(c, d) !== 1 || b === c) continue;
    // Razões de uma questão do banco e do exemplo da etapa.
    if ((a === 3 && b === 2 && c === 4 && d === 5) || (a === 2 && b === 3 && c === 6 && d === 5)) continue;
    // Termo comum igualado pelo MMC: a terna já sai irredutível.
    const y = lcm(b, c);
    const x = (a * y) / b;
    const z = (d * y) / c;
    const k = r.int(2, 6);
    if (x * k > 120) continue;
    const given = x * k;
    const answer = z * k;
    const [A, B, C] = [ctx.a, ctx.b, ctx.c];
    return draftNumeric({
      prompt: [p(`${ctx.where}, as razões entre os números de ${ctx.what} de ${A}, de ${B} e de ${C} são ${A} : ${B} = ${a} : ${b} e ${B} : ${C} = ${c} : ${d}. Há ${given} ${ctx.what} de ${A}.`)],
      ask: `${ctx.many} são de ${C}?`,
      answer,
      wrong: [
        { value: round((given * d) / c, 2), feedback: `Isso usa ${c} : ${d} como se fosse ${A} : ${C}. Iguale o termo comum (${B}) nas duas razões antes.` },
        { value: y * k, feedback: `${y * k} é o número de ${ctx.what} de ${B}. A pergunta é sobre ${C}.` },
        { value: round((y * k * c) / d, 2), feedback: `Com ${B} : ${C} = ${c} : ${d}, o grupo de ${C} é ${B} × ${d}/${c}, e não × ${c}/${d}.` },
      ],
      hints: [`O termo comum é ${B}: deixe-o igual nas duas razões (MMC de ${b} e ${c} = ${y}).`, `${A} : ${B} : ${C} = ${x} : ${y} : ${z}.`],
      solution: [
        `$${A} : ${B} = ${a} : ${b} = ${x} : ${y}; ${B} : ${C} = ${c} : ${d} = ${y} : ${z}`,
        `$${A} : ${B} : ${C} = ${x} : ${y} : ${z}; cada parte = ${given} ÷ ${x} = ${k}`,
        `$${C}: ${z} × ${k} = ${answer}`,
      ],
    });
  }
}

const CHANGES = [
  { where: 'Num grupo de corrida', a: 'homens', aArt: 'os', b: 'mulheres', bArt: 'as', many: 'Quantas pessoas', unit: 'pessoas', arrive: 'entraram' },
  { where: 'Numa escola de música', a: 'alunos de violão', aArt: 'os', b: 'alunos de piano', bArt: 'os', many: 'Quantos alunos', unit: 'alunos', arrive: 'se matricularam' },
  { where: 'Num abrigo de animais', a: 'gatos', aArt: 'os', b: 'cães', bArt: 'os', many: 'Quantos animais', unit: 'animais', arrive: 'chegaram' },
];

/** Uma quantidade fica fixa, a outra cresce, e a razão muda: ak, bk e a equação. */
function changeGen(r: Rand) {
  for (;;) {
    const ctx = r.pick(CHANGES);
    const x = r.int(1, 5);
    const y = r.int(1, 6);
    const p1 = r.int(1, 4);
    const q1 = r.int(1, 6);
    if (gcd(x, y) !== 1 || gcd(p1, q1) !== 1 || (x === p1 && y === q1)) continue;
    const gap = x * q1 - p1 * y; // > 0: o segundo grupo cresce em relação ao primeiro
    if (gap <= 0) continue;
    const k = (p1 / gcd(p1, gap)) * r.int(1, 8);
    const n = (k * gap) / p1;
    const A = x * k;
    const B = y * k;
    const after = A + B + n;
    if (k < 3 || n < 2 || after > 600) continue;
    // Números de uma questão do banco (3 : 5, +24, 1 : 2).
    if (x === 3 && y === 5 && p1 === 1 && q1 === 2 && n === 24) continue;
    const askAfter = r.next() < 0.6;
    return draftNumeric({
      prompt: [p(`${ctx.where}, a razão entre ${ctx.a} e ${ctx.b} era ${x} : ${y}. Depois, mais ${n} ${ctx.b} ${ctx.arrive} (e o número de ${ctx.a} não mudou), e a razão passou a ${p1} : ${q1}.`)],
      ask: askAfter ? `${ctx.many} há agora no total?` : `${ctx.many} havia antes, no total?`,
      answer: askAfter ? after : A + B,
      wrong: askAfter
        ? [
            { value: A + B, feedback: `${A + B} era o total ANTES. Some ${ctx.bArt} ${n} ${ctx.b} que ${ctx.arrive} depois.` },
            { value: B + n, feedback: `${B + n} é só o número de ${ctx.b} depois da mudança. Some ${ctx.aArt} ${A} ${ctx.a}.` },
            { value: A, feedback: `${A} é o número de ${ctx.a}, que não mudou.` },
          ]
        : [
            { value: after, feedback: `${after} é o total DEPOIS da chegada de mais ${n} ${ctx.b}.` },
            { value: B, feedback: `${B} é só o número de ${ctx.b} antes. Some ${ctx.aArt} ${A} ${ctx.a}.` },
            { value: A, feedback: `${A} é o número de ${ctx.a}. Falta somar ${ctx.bArt} ${B} ${ctx.b}.` },
          ],
      hints: [`Escreva ${ctx.a} = ${x}k e ${ctx.b} = ${y}k.`, `Depois: ${x}k : (${y}k + ${n}) = ${p1} : ${q1}. Use o produto cruzado.`],
      solution: [
        `Antes: ${ctx.a} = ${x}k e ${ctx.b} = ${y}k.`,
        `$${q1} × ${x}k = ${p1} × (${y}k + ${n}) → ${q1 * x}k = ${p1 * y}k + ${p1 * n} → k = ${k}`,
        `Antes: ${A} ${ctx.a} e ${B} ${ctx.b} (${A + B} ${ctx.unit}); depois: ${A} e ${B + n} (${after} ${ctx.unit}).`,
      ],
    });
  }
}

// ———————————————————————————————————————————————— aula

export const RAZAO = lesson({
  id: 'razao',
  topic: 'razao-proporcao',
  subtopics: ['razao'],
  title: 'Razão',
  summary:
    'Comparar por divisão: parte com parte, parte com o todo, preço por quilo, quilômetros por litro, habitantes por km² — e repartir um total numa razão sem perder a ordem.',
  requires: ['fracoes'],
  stages: [
    stage('comparar', 'descoberta', 'Razão: comparar por divisão', 'Escrever e simplificar razões, distinguindo parte : parte de parte : todo e respeitando a ordem pedida.', () => ({
      learn: [
        text('Uma **razão** compara duas quantidades por divisão. Numa sala com 15 meninas e 20 meninos, a razão entre meninas e meninos é 15 : 20 = 3 : 4 ("para cada 3 meninas, 4 meninos"). Já a razão entre meninas e o total é 15 : 35 = 3 : 7 — uma fração da turma.'),
        lab({
          title: 'A mistura de tintas',
          intro: 'Misture latas de tinta azul e amarela. A barra mostra a composição da mistura.',
          params: [
            { key: 'a', label: 'Latas de azul', min: 1, max: 12, step: 1, value: 4, format: (v) => `${v}` },
            { key: 'b', label: 'Latas de amarelo', min: 1, max: 12, step: 1, value: 4, format: (v) => `${v}` },
          ],
          readouts: ({ a, b }) => [
            { label: 'Azul : amarelo', value: `${a} : ${b} = ${ratio(a, b)}`, big: true, tone: 'sky' },
            { label: 'Azul em relação ao total', value: `${frac(a, a + b)} (${num((100 * a) / (a + b), 1)}%)` },
            { label: 'Amarelo : azul (razão inversa)', value: ratio(b, a) },
          ],
          viz: ({ a, b }) => ({
            kind: 'parts',
            segments: [
              { label: 'azul', value: a, tone: 'sky' },
              { label: 'amarelo', value: b, tone: 'brass' },
            ],
            summary: `${a} latas de azul e ${b} de amarelo: razão ${ratio(a, b)}`,
          }),
          goal: {
            task: 'Faça uma mistura com razão azul : amarelo igual a 3 : 2 usando 15 latas no total.',
            done: ({ a, b }) => a === 9 && b === 6,
            success: 'Isso: 9 : 6 = 3 : 2, e 9 + 6 = 15. A razão não muda quando as duas quantidades são multiplicadas pelo mesmo número (aqui, 3).',
          },
          insight: 'Razões equivalentes descrevem a mesma mistura: 3 : 2, 6 : 4 e 9 : 6 dão o mesmo tom de verde.',
        }),
        key('A ordem importa', '"A razão entre a e b, nessa ordem" é a ÷ b. Trocar a ordem dá a razão inversa (b ÷ a). E parte : parte (meninas : meninos) é diferente de parte : todo (meninas : turma).'),
        example('Poltronas vazias', 'Um cinema tem 50 poltronas, e 35 estão ocupadas. Qual é a razão entre poltronas vazias e ocupadas?', [
          askStep('Primeiro, a quantidade que não foi dada.', 'Quantas poltronas estão vazias?', [
            ok('50 − 35 = 15'),
            no('50', '50 é o total de poltronas. As vazias são o que sobra depois das ocupadas.'),
          ], 'Vazias: 15'),
          step('Agora a razão vazias : ocupadas, nessa ordem:', '15 : 35 = 3 : 7'),
        ], 'A razão é 3 : 7 (para cada 3 poltronas vazias, 7 ocupadas).'),
        warn('Quem entra no denominador?', 'Se a pergunta restringe o grupo ("entre as peças que não são vermelhas"), o denominador é só esse grupo. Com 10 peças vermelhas, 4 azuis e 12 verdes, a fração de azuis ENTRE as não vermelhas é 4/16 = 1/4, e não 4/26 = 2/13.'),
        check(choice({
          prompt: [p('Numa biblioteca há 40 livros de ficção e 24 de não ficção.')],
          ask: 'Qual é a razão entre os livros de não ficção e o total de livros?',
          options: [
            ok('3/8'),
            no('3/5', '3/5 = 24/40 compara não ficção com FICÇÃO. O total é 40 + 24 = 64.'),
            no('5/8', '5/8 = 40/64 é a fração dos livros de ficção.'),
            no('8/3', '8/3 é a razão inversa (total : não ficção).'),
          ],
          solution: ['$Total: 40 + 24 = 64', '$[[24|64]] = [[3|8]]'],
          verify: () => 3 / 8,
        })),
      ],
      practice: [
        gen(partGen),
        numeric({
          prompt: [p('Um museu registrou os visitantes de quatro meses: 2.100 em janeiro, 1.400 em fevereiro, 4.200 em março e 3.500 em abril.')],
          ask: 'Qual é a razão entre o maior e o menor número mensal de visitantes, nessa ordem?',
          answer: 3,
          wrong: [
            { value: 0.33, feedback: '1.400 ÷ 4.200 é a razão inversa. "Entre o maior e o menor, nessa ordem": 4.200 ÷ 1.400.' },
            { value: 1.2, feedback: '1,2 = 4.200 ÷ 3.500 não usa o menor mês (fevereiro).' },
            { value: 2800, feedback: '2.800 é a diferença (4.200 − 1.400). Razão é divisão.' },
          ],
          hints: ['Encontre o maior (março) e o menor (fevereiro).', 'Razão "entre a e b, nessa ordem" = a ÷ b.'],
          solution: ['$4.200 ÷ 1.400 = 3'],
        }),
        choice({
          prompt: [p('Numa caixa há 9 bolas vermelhas, 6 azuis e 4 verdes. Vamos olhar só as bolas que não são vermelhas.')],
          ask: 'Entre essas bolas, que fração é formada pelas azuis?',
          options: [
            ok('3/5'),
            no('6/19', '6/19 usa todas as bolas no denominador. Só entram as não vermelhas: 6 + 4 = 10.'),
            no('2/5', '2/5 = 4/10 é a fração das verdes entre as não vermelhas.'),
            no('3/2', '3/2 = 6/4 compara azuis com verdes, não com o grupo analisado.'),
          ],
          hints: ['O grupo analisado são as bolas não vermelhas.', 'Quantas são? 6 + 4.'],
          solution: ['$Não vermelhas: 6 + 4 = 10', '$Azuis: [[6|10]] = [[3|5]]'],
          verify: () => 0.6,
        }),
      ],
      challenge: [
        gen(partGen),
        numeric({
          prompt: [p('Numa escola, a razão entre professores e alunos é 1 : 15. Há 480 alunos.')],
          ask: 'Quantas pessoas (professores e alunos) há na escola?',
          answer: 512,
          wrong: [
            { value: 32, feedback: '32 é o número de professores (480 ÷ 15). A pergunta inclui os alunos.' },
            { value: 7200, feedback: 'Para cada 15 alunos há 1 professor: divida 480 por 15, não multiplique.' },
            { value: 495, feedback: 'Somar 15 não faz sentido: há 480 ÷ 15 = 32 professores.' },
          ],
          solution: ['$Professores: 480 ÷ 15 = 32', '$Total: 480 + 32 = 512'],
        }),
        choice({
          prompt: [p('Num estacionamento há 36 carros e 12 motos. Chegam mais 4 motos.')],
          ask: 'Qual passa a ser a razão entre motos e carros?',
          options: [
            ok('4/9'),
            no('1/3', '1/3 = 12/36 era a razão ANTES das 4 motos novas.'),
            no('9/4', '9/4 é a razão inversa (carros : motos).'),
            no('4/13', '4/13 = 16/52 compara as motos com o TOTAL de veículos; a pergunta é motos : carros.'),
          ],
          solution: ['$Motos: 12 + 4 = 16', '$[[16|36]] = [[4|9]]'],
          verify: () => 4 / 9,
        }),
      ],
      recap: [
        'Razão entre a e b (nessa ordem) = a ÷ b; trocar a ordem dá a razão inversa.',
        'Parte : parte ≠ parte : todo. Leia o que está sendo comparado.',
        'Razões equivalentes: multiplique ou divida os dois termos pelo mesmo número.',
        'Se o grupo é restrito, o denominador é só esse grupo.',
      ],
    })),

    stage('taxas', 'fundamentos', 'Taxas e razões unitárias', 'Calcular e comparar taxas entre grandezas diferentes (preço por kg, km/L, MB/s, hab/km², por mil habitantes), ajustando as unidades antes de dividir.', () => ({
      learn: [
        text('Quando as grandezas são de naturezas diferentes, a razão vira uma **taxa**: 300 km em 4 h dão 75 km/h; R$ 12,00 por 500 g dão R$ 24,00 por kg; 240 mil habitantes em 80 km² dão 3.000 hab/km². A taxa responde "quanto de uma coisa para cada unidade da outra".'),
        lab({
          title: 'Qual embalagem rende mais?',
          intro: 'Compare duas embalagens do mesmo produto pelo preço por quilo.',
          params: [
            { key: 'p1', label: 'Preço do pacote de 500 g', min: 5, max: 30, step: 0.5, value: 12, format: (v) => brl(v) },
            { key: 'p2', label: 'Preço do pacote de 1 kg', min: 10, max: 50, step: 0.5, value: 26, format: (v) => brl(v) },
          ],
          readouts: ({ p1, p2 }) => [
            { label: 'Pacote de 500 g', value: `${brl(p1 * 2)} por kg` },
            { label: 'Pacote de 1 kg', value: `${brl(p2)} por kg` },
            { label: 'Mais vantajoso', value: Math.abs(p1 * 2 - p2) < 1e-9 ? 'empate' : p1 * 2 < p2 ? 'o de 500 g' : 'o de 1 kg', big: true, tone: 'brass' },
          ],
          viz: ({ p1, p2 }) => ({
            kind: 'bars',
            bars: [
              { label: '500 g (por kg)', value: p1 * 2, text: brl(p1 * 2), tone: 'sky' },
              { label: '1 kg (por kg)', value: p2, text: brl(p2), tone: 'brass' },
            ],
            summary: `Preço por kg: ${brl(p1 * 2)} contra ${brl(p2)}`,
          }),
          goal: {
            task: 'Com o pacote de 500 g a R$ 12,00, ajuste o preço do pacote de 1 kg para os dois terem o mesmo preço por quilo.',
            done: ({ p1, p2 }) => Math.abs(p1 - 12) < 1e-9 && Math.abs(p2 - 24) < 1e-9,
            success: 'Isso: R$ 12,00 por 500 g é o mesmo que R$ 24,00 por kg. Embalagem maior só é vantagem se o preço por unidade for menor.',
          },
          insight: 'O preço por unidade de medida é a razão que permite comparar embalagens de tamanhos diferentes.',
        }),
        warn('Unidades primeiro', 'Para obter MB/s a partir de "720 MB em 3 minutos", converta: 3 min = 180 s, e 720 ÷ 180 = 4 MB/s. Dividir 720 por 3 dá 240 MB por MINUTO.'),
        key('Taxas com base fixa', 'Indicadores como natalidade e incidência de doenças usam uma base fixa: (ocorrências ÷ população) × 1.000 (ou × 100.000). Assim, cidades de tamanhos diferentes podem ser comparadas.'),
        example('Qual cidade é mais densa?', [p('A densidade demográfica é habitantes ÷ área.'), table(['Cidade', 'Habitantes', 'Área (km²)'], [['Alfa', '520.000', '200'], ['Beta', '330.000', '75']])], [
          askStep('Comparar 520.000 com 330.000 não basta.', 'Por quê?', [
            ok('As áreas são diferentes: é preciso a taxa por km²'),
            no('Porque Alfa tem mais gente, então é mais densa', 'Alfa tem mais gente, mas espalhada numa área quase 3 vezes maior. Compare habitantes por km².'),
          ]),
          step('Alfa: 520.000 ÷ 200 = 2.600 hab/km²; Beta: 330.000 ÷ 75 = 4.400 hab/km².'),
        ], 'Beta é mais densa: 1.800 hab/km² a mais que Alfa.'),
        enem('Como costuma cair', 'Taxas aparecem em tabelas de preço, consumo e indicadores sociais. As quantidades vêm diferentes de propósito — e o resultado da comparação dos TOTAIS costuma estar entre as alternativas erradas.'),
        check(numeric({
          prompt: [p('Um celular baixou um aplicativo de 1.200 MB em 4 minutos, com taxa constante.')],
          ask: 'Qual foi a taxa de download, em MB por segundo?',
          unit: 'MB/s',
          answer: 5,
          wrong: [
            { value: 300, feedback: '300 MB é a taxa por MINUTO (1.200 ÷ 4). Em segundos: 4 min = 240 s.' },
            { value: 0.2, feedback: '0,2 = 240 ÷ 1.200 inverteu a razão: são megabytes por segundo.' },
            { value: 20, feedback: '20 = 1.200 ÷ 60 dividiu por 60 s, mas o download levou 4 minutos (240 s).' },
          ],
          solution: ['$4 min = 240 s', '$1.200 ÷ 240 = 5 MB/s'],
        })),
      ],
      practice: [gen(unitPriceGen), gen(rateBaseGen), gen(rateCompareGen)],
      challenge: [
        gen(unitPriceGen),
        numeric({
          prompt: [p('A impressora A imprime 90 páginas em 6 minutos. A impressora B imprime 300 páginas em 4 minutos.')],
          ask: 'Quantas vezes a velocidade de B (em páginas por minuto) corresponde à de A?',
          unit: 'vezes',
          answer: 5,
          wrong: [
            { value: 3.33, feedback: '300 ÷ 90 compara os totais, que foram impressos em tempos diferentes. Compare páginas por minuto: 75 ÷ 15.' },
            { value: 60, feedback: '60 = 75 − 15 é a diferença em páginas por minuto. "Quantas vezes" é divisão.' },
            { value: 75, feedback: '75 páginas por minuto é a velocidade de B. Divida pela de A (15).' },
          ],
          solution: ['A: 90 ÷ 6 = 15 páginas por minuto. B: 300 ÷ 4 = 75 páginas por minuto.', '$75 ÷ 15 = 5 vezes'],
        }),
        numeric({
          prompt: [p('Uma linha de ônibus teve 42 reclamações em 6.000 viagens no primeiro semestre e 27 reclamações em 4.500 viagens no segundo. A empresa acompanha as reclamações por 1.000 viagens.')],
          ask: 'De quanto foi a redução, em reclamações por 1.000 viagens?',
          answer: 1,
          wrong: [
            { value: 15, feedback: '15 = 42 − 27 compara totais de semestres com números de viagens diferentes. Compare as taxas: 7 e 6 por 1.000.' },
            { value: 7, feedback: '7 é a taxa do primeiro semestre. Falta subtrair a do segundo (6).' },
            { value: 0.001, feedback: 'Essa é a redução por VIAGEM. A empresa mede por 1.000 viagens: × 1.000.' },
          ],
          solution: ['1º semestre: 42 ÷ 6.000 × 1.000 = 7. 2º semestre: 27 ÷ 4.500 × 1.000 = 6.', '$Redução: 7 − 6 = 1 reclamação por 1.000 viagens'],
        }),
      ],
      recap: [
        'Taxa = razão entre grandezas diferentes: km/h, R$/kg, km/L, hab/km².',
        'Converta as unidades antes de dividir.',
        'Compare situações pela taxa (por unidade), nunca pelos totais.',
        'Taxas com base fixa: ocorrências ÷ população × 1.000.',
      ],
    })),

    stage('dividir', 'interpretacao', 'Repartir, unir e mudar razões', 'Repartir um total numa razão dada, unir razões com um termo comum e resolver problemas em que uma razão muda.', () => ({
      learn: [
        text('Dividir R$ 240,00 na razão 5 : 3 significa formar 5 + 3 = **8 partes iguais** (de R$ 30,00) e dar 5 partes a um e 3 ao outro: R$ 150,00 e R$ 90,00. O truque é chamar cada parte de **k**: 5k + 3k = 240.'),
        lab({
          title: 'Repartir na razão',
          intro: 'Escolha o total e a razão. A barra mostra as partes de cada um.',
          params: [
            { key: 't', label: 'Total', min: 12, max: 240, step: 12, value: 60, format: (v) => num(v) },
            { key: 'a', label: 'Partes de A', min: 1, max: 6, step: 1, value: 1, format: (v) => `${v}` },
            { key: 'b', label: 'Partes de B', min: 1, max: 6, step: 1, value: 1, format: (v) => `${v}` },
          ],
          readouts: ({ t, a, b }) => {
            const k = t / (a + b);
            return [
              { label: 'Cada parte (k)', value: `${num(t)} ÷ ${a + b} = ${num(k, 2)}` },
              { label: 'A recebe', value: `${a} × ${num(k, 2)} = ${num(a * k, 2)}`, big: true, tone: 'sky' },
              { label: 'B recebe', value: `${b} × ${num(k, 2)} = ${num(b * k, 2)}`, big: true, tone: 'brass' },
            ];
          },
          viz: ({ t, a, b }) => ({
            kind: 'parts',
            segments: [
              { label: 'A', value: (a * t) / (a + b), tone: 'sky' },
              { label: 'B', value: (b * t) / (a + b), tone: 'brass' },
            ],
            summary: `${num(t)} repartido na razão ${a} : ${b}`,
          }),
          goal: {
            task: 'Reparta 168 na razão 4 : 3.',
            done: ({ t, a, b }) => t === 168 && a === 4 && b === 3,
            success: 'Isso: 7 partes de 24 — A fica com 96 e B com 72. Confira: 96 : 72 = 4 : 3.',
          },
          insight: 'Dividir em partes proporcionais é dividir pelo total de partes, não pelo número de pessoas.',
        }),
        example('Unir duas razões', 'Num depósito, a razão entre caixas de arroz e de feijão é 2 : 3, e entre feijão e milho é 6 : 5. Há 40 caixas de arroz. Quantas são de milho?', [
          askStep('O feijão aparece nas duas razões, com números diferentes (3 e 6).', 'Como unir as razões?', [
            ok('Deixar o feijão igual: 2 : 3 = 4 : 6'),
            no('Somar as razões: 8 : 8', 'Razões não se somam. Iguale o termo comum (o feijão) multiplicando uma delas.'),
            no('Usar 2 : 5 direto', 'O 5 está ligado ao 6 do feijão, não ao 3. Primeiro iguale o feijão.'),
          ], 'arroz : feijão : milho = 4 : 6 : 5'),
          step('40 caixas de arroz = 4 partes → cada parte = 10.', 'milho = 5 × 10 = 50'),
        ], 'Há 50 caixas de milho.'),
        key('Quando a razão muda', 'Se uma quantidade fica fixa e a outra muda, escreva as quantidades como múltiplos de k e monte uma equação. Ex.: homens : mulheres = 2 : 3 (2k e 3k); chegam 10 mulheres e a razão vira 1 : 2 → 2k / (3k + 10) = 1/2 → 4k = 3k + 10 → k = 10.'),
        check(numeric({
          prompt: [p('Num show, a razão entre ingressos de pista e de camarote foi 9 : 2. Foram vendidos 660 ingressos ao todo.')],
          ask: 'Quantos ingressos de camarote foram vendidos?',
          answer: 120,
          wrong: [
            { value: 330, feedback: '330 é a metade. A razão 9 : 2 forma 11 partes: 660 ÷ 11 = 60 por parte.' },
            { value: 540, feedback: '540 = 9 × 60 é o número de ingressos de pista.' },
            { value: 146.67, feedback: 'Divida pelo total de partes (9 + 2 = 11), não por 9.' },
          ],
          solution: ['$9 + 2 = 11 partes; 660 ÷ 11 = 60', '$Camarote: 2 × 60 = 120'],
        })),
      ],
      practice: [
        gen(splitGen),
        gen(combineGen),
        numeric({
          prompt: [p('Numa sala, a razão entre meninos e meninas é 3 : 4. Entram 6 meninos (e nenhuma menina), e a razão passa a 1 : 1.')],
          ask: 'Quantos alunos havia na sala antes de os meninos entrarem?',
          answer: 42,
          wrong: [
            { value: 48, feedback: '48 é o total DEPOIS da entrada dos 6 meninos.' },
            { value: 18, feedback: '18 é o número de meninos antes. Some as 24 meninas.' },
            { value: 24, feedback: '24 é o número de meninas. Some os 18 meninos que já estavam.' },
          ],
          hints: ['Escreva meninos = 3k e meninas = 4k.', 'Depois: 3k + 6 = 4k.'],
          solution: ['$3k + 6 = 4k → k = 6', '$Antes: 18 meninos + 24 meninas = 42 alunos'],
        }),
        gen(changeGen),
      ],
      challenge: [
        gen(splitGen),
        numeric({
          prompt: [p('Num clube, a razão entre sócios homens e mulheres era 4 : 5. Depois de uma campanha, entraram 30 homens (e nenhuma mulher), e a razão passou a 1 : 1.')],
          ask: 'Quantos sócios o clube passou a ter?',
          answer: 300,
          wrong: [
            { value: 270, feedback: '270 era o total ANTES da campanha (4k + 5k com k = 30). Some os 30 homens novos.' },
            { value: 150, feedback: '150 é o número de mulheres (e, depois da campanha, também de homens). O total é o dobro.' },
            { value: 120, feedback: '120 era o número de homens antes da campanha.' },
          ],
          solution: ['Antes: 4k homens e 5k mulheres.', '$(4k + 30) / 5k = 1 → 4k + 30 = 5k → k = 30', 'Depois: 150 homens e 150 mulheres → 300 sócios.'],
        }),
        gen(combineGen),
      ],
      recap: [
        'Dividir T na razão a : b: cada parte vale k = T ÷ (a + b); um recebe a·k, o outro b·k.',
        'Unir a : b e b : c: iguale o termo comum (b) antes de juntar.',
        'Razão que muda: escreva as quantidades como ak e bk e monte a equação com a nova razão.',
      ],
    })),

    stage('aplicacoes', 'aplicacoes', 'Razões encadeadas no mundo real', 'Encadear razões e conferir unidades em problemas de engrenagens, densidade, sensores com zero deslocado e comparações por pessoa.', () => ({
      learn: [
        text('Muitos problemas encadeiam razões: voltas da roda por pedalada × metros por volta × pedaladas por minuto = metros por minuto. O segredo é **acompanhar as unidades** — elas se cancelam como frações.'),
        lab({
          title: 'A marcha da bicicleta',
          intro: 'A coroa (pedais) e a catraca (roda) são ligadas pela corrente. A roda tem 2 m de circunferência.',
          params: [
            { key: 'c', label: 'Dentes da coroa', min: 24, max: 52, step: 2, value: 40, format: (v) => `${v}` },
            { key: 't', label: 'Dentes da catraca', min: 11, max: 32, step: 1, value: 20, format: (v) => `${v}` },
            { key: 'cad', label: 'Pedaladas por minuto', min: 40, max: 100, step: 5, value: 60, format: (v) => `${v}` },
          ],
          readouts: ({ c, t, cad }) => {
            const turns = c / t;
            const kmh = (cad * turns * 2 * 60) / 1000;
            return [
              { label: 'Voltas da roda por pedalada', value: `${c} ÷ ${t} = ${num(turns, 3)}` },
              { label: 'Metros por minuto', value: `${cad} × ${num(turns, 3)} × 2 = ${num(cad * turns * 2, 1)}` },
              { label: 'Velocidade', value: `${num(kmh, 1)} km/h`, big: true, tone: 'brass' },
            ];
          },
          goal: {
            task: 'Pedalando 80 vezes por minuto, escolha a marcha que leva a bicicleta a exatamente 30 km/h.',
            done: ({ c, t, cad }) => cad === 80 && Math.abs((cad * (c / t) * 2 * 60) / 1000 - 30) < 1e-6,
            success: 'Isso: coroa 50 e catraca 16 dão 3,125 voltas por pedalada; 80 × 3,125 × 2 m = 500 m/min = 30 km/h.',
          },
          insight: 'Coroa maior ou catraca menor: mais voltas da roda por pedalada — mais velocidade, mais esforço.',
        }),
        example('Densidade: a taxa massa/volume', 'Uma amostra de 50 mL de um óleo tem massa de 40 g. Que volume desse óleo tem massa de 72 g?', [
          step('Densidade (taxa constante):', '40 ÷ 50 = 0,8 g/mL'),
          askStep('Agora o volume da nova massa.', 'Qual é a conta?', [
            ok('72 ÷ 0,8 = 90 mL'),
            no('72 × 0,8 = 57,6 mL', 'Multiplicar massa por densidade não dá volume. Volume = massa ÷ densidade.'),
            no('72 mL', 'Massa (g) e volume (mL) só coincidem se a densidade for 1 g/mL.'),
          ], '72 ÷ 0,8 = 90 mL'),
        ], 'São 90 mL.'),
        warn('Zero deslocado', 'Um dinamômetro que marca 10 divisões vazio e 30 divisões com 400 g não é proporcional à leitura total: é proporcional ao ACRÉSCIMO (30 − 10 = 20 divisões para 400 g). Uma leitura de 45 divisões vale (45 − 10) × 20 g = 700 g.'),
        tip('Por pessoa ou por veículo?', 'Um carro que emite 120 g de CO₂ por km leva 3 pessoas: por pessoa, são 40 g/km. Só compare com um ônibus (g por passageiro-km) depois de pôr as duas taxas na mesma base.'),
        check(select({
          prompt: [p('Uma bicicleta tem coroa de 44 dentes e catraca de 11 dentes. A roda tem 2,1 m de circunferência. O ciclista pedala 70 vezes por minuto, e a bicicleta pesa 12 kg.')],
          ask: 'Marque só os dados necessários para calcular a velocidade.',
          chips: [
            { text: 'Coroa de 44 dentes', needed: true },
            { text: 'Catraca de 11 dentes', needed: true },
            { text: 'Roda de 2,1 m de circunferência', needed: true },
            { text: '70 pedaladas por minuto', needed: true },
            { text: 'Bicicleta de 12 kg', needed: false, why: 'A massa não entra no cálculo da velocidade a partir das voltas.' },
          ],
          solution: ['$44 ÷ 11 = 4 voltas por pedalada; 70 × 4 × 2,1 = 588 m/min ≈ 35,3 km/h'],
        })),
      ],
      practice: [
        numeric({
          prompt: [p('Uma bicicleta tem coroa de 40 dentes e catraca de 16 dentes, e a roda tem 2 m de circunferência. O ciclista mantém 60 pedaladas por minuto.')],
          ask: 'Qual é a velocidade, em km/h?',
          unit: 'km/h',
          answer: 18,
          wrong: [
            { value: 7.2, feedback: '7,2 km/h ignora a transmissão: cada pedalada dá 40 ÷ 16 = 2,5 voltas da roda.' },
            { value: 300, feedback: '300 m/min é a velocidade em metros por MINUTO. Em km/h: × 60 ÷ 1.000.' },
            { value: 5, feedback: '5 m/s é a velocidade em metros por SEGUNDO. Em km/h: 300 m/min × 60 = 18.000 m/h.' },
          ],
          hints: ['Voltas da roda por pedalada = dentes da coroa ÷ dentes da catraca.', 'm/min = pedaladas × voltas × 2 m; depois converta para km/h.'],
          solution: ['$40 ÷ 16 = 2,5 voltas por pedalada', '$60 × 2,5 × 2 = 300 m/min', '$300 × 60 ÷ 1.000 = 18 km/h'],
        }),
        numeric({
          prompt: [p('Um dinamômetro marca 8 divisões sem nada pendurado e 23 divisões com um peso de 300 g. O acréscimo de divisões é proporcional à massa.')],
          ask: 'Qual massa faz o dinamômetro marcar 38 divisões?',
          unit: 'g',
          answer: 600,
          wrong: [
            { value: 495.65, feedback: '38 × 300 ÷ 23 ignora as 8 divisões do aparelho vazio. Proporcional é o acréscimo: 38 − 8 = 30.' },
            { value: 760, feedback: '760 trata cada divisão como 20 g desde o zero, mas o aparelho vazio já marca 8.' },
            { value: 391.3, feedback: 'Você descontou o vazio só na nova leitura. A calibração também tem o zero deslocado: 23 − 8 = 15 divisões para 300 g.' },
          ],
          hints: ['Desconte o vazio: 23 − 8 = 15 divisões para 300 g.', 'Cada divisão vale 20 g; agora conte o acréscimo de 38.'],
          solution: ['$23 − 8 = 15 divisões ↔ 300 g → 20 g por divisão', '$38 − 8 = 30 divisões → 30 × 20 = 600 g'],
        }),
        numeric({
          prompt: [p('Um carro emite 120 g de CO₂ por quilômetro rodado, qualquer que seja o número de ocupantes. Um ônibus emite 25 g de CO₂ por passageiro a cada quilômetro. Três amigos vão fazer juntos uma viagem de 50 km.')],
          ask: 'Quantos gramas de CO₂ cada amigo economizaria indo de ônibus em vez de carro?',
          unit: 'g',
          answer: 750,
          wrong: [
            { value: 4750, feedback: 'Isso compara o carro inteiro (6.000 g) com um passageiro de ônibus. Divida a emissão do carro pelos 3 amigos.' },
            { value: 95, feedback: '95 g/km = 120 − 25 compara o carro inteiro com uma pessoa, e só por quilômetro.' },
            { value: 15, feedback: '15 g/km é a diferença por pessoa POR QUILÔMETRO (40 − 25). A viagem tem 50 km.' },
          ],
          hints: ['Carro por pessoa: 120 ÷ 3 = 40 g/km.', 'Diferença por pessoa: 40 − 25 = 15 g/km; multiplique pelos 50 km.'],
          solution: ['$Carro: 120 × 50 ÷ 3 = 2.000 g por pessoa', '$Ônibus: 25 × 50 = 1.250 g por pessoa', '$Economia: 2.000 − 1.250 = 750 g'],
        }),
      ],
      challenge: [
        numeric({
          prompt: [p('Uma esteira de fábrica tem uma polia motora de 30 cm de diâmetro que gira a 120 rotações por minuto. Ela está ligada por correia a outra polia, de 20 cm de diâmetro.')],
          ask: 'Quantas rotações por minuto faz a polia menor?',
          unit: 'rpm',
          answer: 180,
          wrong: [
            { value: 80, feedback: 'A polia MENOR gira mais depressa: a correia percorre o mesmo comprimento nas duas. 120 × 30 ÷ 20.' },
            { value: 120, feedback: 'As polias têm diâmetros diferentes: a menor dá mais voltas para a mesma correia.' },
            { value: 3600, feedback: '3.600 = 120 × 30 ainda precisa ser dividido pelo diâmetro da polia menor (20 cm).' },
          ],
          solution: ['A correia passa o mesmo comprimento nas duas polias: rotações × diâmetro é constante.', '$120 × 30 = r × 20 → r = 180 rpm'],
        }),
        numeric({
          prompt: [p('Um óleo tem densidade 0,9 g/mL. Um tanque comporta 2.400 mL desse óleo.')],
          ask: 'Qual é a massa de óleo no tanque cheio, em quilogramas?',
          unit: 'kg',
          answer: 2.16,
          wrong: [
            { value: 2160, feedback: '2.160 é a massa em GRAMAS. Em quilogramas, divida por 1.000.' },
            { value: 2.67, feedback: 'Massa = densidade × volume (e não volume ÷ densidade): 0,9 × 2.400 = 2.160 g.' },
          ],
          solution: ['$Massa = 0,9 g/mL × 2.400 mL = 2.160 g = 2,16 kg'],
        }),
        numeric({
          prompt: [p('Um carro elétrico consome 15 kWh a cada 100 km. A energia custa R$ 0,80 o kWh. Um carro a gasolina faz 12 km/L, e a gasolina custa R$ 6,00 o litro.')],
          ask: 'Numa viagem de 300 km, quantos reais o carro elétrico economiza em relação ao carro a gasolina?',
          prefix: 'R$',
          answer: 114,
          wrong: [
            { value: 36, feedback: 'R$ 36,00 é o custo do elétrico (45 kWh × 0,80). Falta compará-lo com o da gasolina (R$ 150,00).' },
            { value: 150, feedback: 'R$ 150,00 é o custo da gasolina (25 L × 6,00). A economia é a diferença para os R$ 36,00 do elétrico.' },
            { value: 38, feedback: 'Isso compara os custos de 100 km. A viagem tem 300 km: 150 − 36.' },
          ],
          solution: ['Elétrico: 300 km → 45 kWh → 45 × 0,80 = R$ 36,00.', 'Gasolina: 300 ÷ 12 = 25 L → 25 × 6 = R$ 150,00.', '$Economia: 150 − 36 = R$ 114,00'],
        }),
      ],
      recap: [
        'Encadeie razões acompanhando as unidades: elas se cancelam como frações.',
        'Engrenagens e polias: voltas × dentes (ou × diâmetro) é constante.',
        'Densidade: massa = densidade × volume; volume = massa ÷ densidade.',
        'Zero deslocado: a proporção vale para o acréscimo da leitura.',
        'Compare taxas na mesma base (por pessoa, por km, por 1.000 viagens).',
      ],
    })),

    stage('maestria', 'maestria', 'Maestria: razões nos problemas difíceis', 'Resolver problemas inéditos que combinam razões, taxas e mudanças de razão, escolhendo a estratégia e conferindo as unidades.', () => ({
      learn: [
        strategy('Três perguntas antes da conta', '1) O que está sendo comparado com o quê (e em que ordem)? 2) As grandezas estão nas mesmas unidades e na mesma base? 3) Alguma quantidade fica fixa enquanto a outra muda?'),
        example('A escola que cresceu', 'Numa escola, a razão entre alunos do diurno e do noturno era 5 : 2. Abriram uma turma noturna de 36 alunos, e a razão passou a 5 : 3. Quantos alunos a escola tem agora?', [
          step('Antes: diurno 5k, noturno 2k. O diurno não mudou.'),
          askStep('Depois: 5k : (2k + 36) = 5 : 3.', 'Que equação sai daí?', [
            ok('3 × 5k = 5 × (2k + 36)'),
            no('5k + 2k + 36 = 5 + 3', 'A razão não é a soma das quantidades. Use o produto cruzado: 3 · 5k = 5 · (2k + 36).'),
          ], '15k = 10k + 180 → k = 36'),
          step('Diurno: 5 × 36 = 180; noturno: 2 × 36 + 36 = 108.', '180 + 108 = 288'),
        ], 'A escola tem 288 alunos agora.'),
        reveal('Por que a mesma razão pode descrever um grupo pequeno e um enorme?', 'Porque razão compara, não conta: 2 : 3 vale para 2 e 3 pessoas ou para 200 e 300. Para saber as quantidades, é preciso mais um dado (o total, uma das partes ou uma mudança).'),
        check(classify({
          ask: 'Cada razão é parte : parte, parte : todo ou uma taxa (grandezas diferentes)?',
          bins: ['Parte : parte', 'Parte : todo', 'Taxa'],
          items: [
            { text: 'Meninas : meninos de uma turma', bin: 0 },
            { text: 'Votos válidos : total de votos', bin: 1 },
            { text: 'Quilômetros : litros de combustível', bin: 2 },
            { text: 'Açúcar : farinha numa receita', bin: 0 },
            { text: 'Nascidos vivos por mil habitantes', bin: 2, why: 'Compara ocorrências com população, numa base fixa.' },
            { text: 'Assentos ocupados : assentos do ônibus', bin: 1 },
          ],
          solution: ['Parte : parte compara pedaços do mesmo todo; parte : todo é uma fração; taxa relaciona grandezas de naturezas diferentes.'],
        })),
      ],
      practice: [
        numeric({
          prompt: [p('Para pintar uma parede, mistura-se tinta e água na razão 5 : 1. Um pintor já pôs 3 L de água no balde e quer preparar exatamente 21 L da mistura.')],
          ask: 'Quantos litros de água ainda precisa acrescentar?',
          unit: 'L',
          answer: 0.5,
          wrong: [
            { value: 3.5, feedback: '3,5 L é a água TOTAL da mistura (21 ÷ 6). Ele já pôs 3 L.' },
            { value: 17.5, feedback: '17,5 L é a quantidade de tinta (5 × 3,5).' },
            { value: 1.2, feedback: 'Você dividiu 21 por 5, mas a razão 5 : 1 forma 6 partes: água total = 21 ÷ 6 = 3,5 L.' },
          ],
          hints: ['A razão 5 : 1 forma 6 partes.', 'Água total = 21 ÷ 6; desconte o que já está no balde.'],
          solution: ['$Água total: 21 ÷ 6 = 3,5 L', '$Falta: 3,5 − 3 = 0,5 L'],
        }),
        gen(combineGen),
        numeric({
          prompt: [p('Num aquário, a razão entre peixes-palhaço e peixes-anjo é 3 : 4, e entre peixes-anjo e peixes-cirurgião é 2 : 5. Há 136 peixes ao todo dessas três espécies.')],
          ask: 'Quantos são peixes-cirurgião?',
          answer: 80,
          wrong: [
            { value: 56.67, feedback: 'Isso junta 3 : 4 com o 5 sem igualar o anjo: o 5 está ligado ao 2, não ao 4. Use 2 : 5 = 4 : 10.' },
            { value: 32, feedback: '32 é o número de peixes-anjo (4 × 8).' },
            { value: 24, feedback: '24 é o número de peixes-palhaço (3 × 8).' },
          ],
          hints: ['Iguale o termo comum (anjo): 2 : 5 = 4 : 10.', 'palhaço : anjo : cirurgião = 3 : 4 : 10 → 17 partes.'],
          solution: ['$3 : 4 e 4 : 10 → 3 : 4 : 10 (17 partes)', '$Cada parte: 136 ÷ 17 = 8', '$Cirurgião: 10 × 8 = 80'],
        }),
        gen(changeGen),
      ],
      challenge: [
        numeric({
          prompt: [p('Num campeonato, a razão entre times masculinos e femininos inscritos era 7 : 3. Com a abertura de novas vagas, inscreveram-se mais 60 times femininos (os masculinos não mudaram), e a razão passou a 7 : 5.')],
          ask: 'Quantos times passaram a estar inscritos?',
          answer: 360,
          wrong: [
            { value: 300, feedback: '300 era o total ANTES das novas inscrições. Some os 60 times femininos.' },
            { value: 210, feedback: '210 é o número de times masculinos.' },
            { value: 150, feedback: '150 é o número de times femininos depois das inscrições (90 + 60). Some os masculinos.' },
          ],
          solution: ['Antes: 7k e 3k. Depois: 7k : (3k + 60) = 7 : 5.', '$5 × 7k = 7 × (3k + 60) → 35k = 21k + 420 → k = 30', 'Masculinos 210 e femininos 90 + 60 = 150 → 360 times.'],
        }),
        numeric({
          prompt: [p('Uma bicicleta tem coroa de 48 dentes e catraca de 12 dentes, e a roda tem 2,2 m de circunferência. Um ciclista quer andar a 33 km/h.')],
          ask: 'Quantas pedaladas por minuto ele precisa dar?',
          answer: 62.5,
          tolerance: 0.1,
          wrong: [
            { value: 250, feedback: '250 é o número de voltas da RODA por minuto (550 m ÷ 2,2 m). Cada pedalada dá 4 voltas da roda.' },
            { value: 3.75, feedback: 'Converta a velocidade antes: 33 km/h = 33.000 m ÷ 60 min = 550 m/min.' },
            { value: 15, feedback: 'Converta a velocidade para metros por minuto e considere as 4 voltas da roda por pedalada.' },
          ],
          solution: ['$33 km/h = 33.000 m ÷ 60 = 550 m/min', '$Voltas da roda: 550 ÷ 2,2 = 250 por minuto', '$Pedaladas: 250 ÷ (48 ÷ 12) = 250 ÷ 4 = 62,5 por minuto'],
        }),
        gen(changeGen),
        gen(combineGen),
      ],
      recap: [
        'Identifique o que se compara, em que ordem e em que base.',
        'Quantidade fixa + razão que muda: ak e bk numa equação.',
        'Una razões pelo termo comum; reparta pelo total de partes.',
        'Encadeie taxas conferindo as unidades a cada passo.',
      ],
    })),
  ],
});
