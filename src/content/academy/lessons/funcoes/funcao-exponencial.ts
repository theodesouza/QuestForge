/**
 * Aula: Função exponencial — crescer multiplicando (dobrar, triplicar, cair pela metade), a
 * fórmula V = V₀ · qⁿ com taxas percentuais, reconhecer exponenciais em tabelas, descobrir o
 * tempo até uma meta (meias-vidas, dobras, tabelas de potências) e comparar com o crescimento afim.
 */
import {
  askStep,
  check,
  classify,
  data,
  draftNumeric,
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
  sample,
  stage,
  step,
  strategy,
  table,
  text,
} from '../../kit/build';
import { brl, fixed, num, round } from '../../kit/format';
import type { Rand } from '../../types';

const SUP = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
const pow = (b: string, n: number) => `${b}${String(n).split('').map((d) => SUP[Number(d)]).join('')}`;
const plural = (n: number, one: string, many: string) => `${num(n)} ${n === 1 ? one : many}`;
/** Potência sem o expoente 1. */
const powN = (b: string, n: number) => (n === 1 ? b : pow(b, n));

// ———————————————————————————————————————————————— geradores: dobrar e cair pela metade

const GROWTH = [
  {
    intro: (v0: number, verb: string, per: string) => `Num lago, a área coberta por uma alga é de ${num(v0)} m² e ${verb} a cada ${per}.`,
    ask: (t: string) => `Qual será a área coberta depois de ${t}?`,
    unit: 'm²',
    starts: [3, 5, 8, 10, 12, 15],
    periods: [2, 3, 4, 5],
    span: [2, 5],
    one: 'dia',
    many: 'dias',
  },
  {
    intro: (v0: number, verb: string, per: string) => `Um perfil novo numa rede social tem ${num(v0)} seguidores, e esse número ${verb} a cada ${per}.`,
    ask: (t: string) => `Quantos seguidores terá depois de ${t}?`,
    unit: 'seguidores',
    starts: [50, 80, 120, 200, 250, 400],
    periods: [1, 2, 3],
    span: [2, 5],
    one: 'semana',
    many: 'semanas',
  },
  {
    intro: (v0: number, verb: string, per: string) => `Uma cultura de leveduras começa com ${num(v0)} células, e a população ${verb} a cada ${per}.`,
    ask: (t: string) => `Quantas células haverá depois de ${t}?`,
    unit: 'células',
    starts: [100, 200, 300, 500],
    periods: [15, 20, 30, 40],
    span: [3, 6],
    one: 'minuto',
    many: 'minutos',
  },
];

/** Tempo em minutos escrito em horas quando dá um número inteiro de horas. */
function clock(total: number, one: string, many: string): { text: string; shown: number } {
  if (one === 'minuto' && total % 60 === 0) return { text: plural(total / 60, 'hora', 'horas'), shown: total / 60 };
  return { text: plural(total, one, many), shown: total };
}

/** Dobrar ou triplicar a cada período: V₀ · qⁿ. */
function doublingGen(r: Rand) {
  for (;;) {
    const g = r.pick(GROWTH);
    const q = r.pick([2, 2, 3]);
    const v0 = r.pick(g.starts);
    const P = r.pick(g.periods);
    const n = r.int(g.span[0], g.span[1]);
    if (q === 3 && n > 4) continue;
    if (v0 === 500 && q === 2 && n === 4) continue; // a conta da questão do banco
    const verb = q === 2 ? 'dobra' : 'triplica';
    const per = plural(P, g.one, g.many).replace(/^1 /, '');
    const t = clock(n * P, g.one, g.many);
    const ans = v0 * q ** n;
    return draftNumeric({
      prompt: [p(g.intro(v0, verb, per))],
      ask: g.ask(t.text),
      unit: g.unit,
      answer: ans,
      wrong: [
        { value: v0 * q * n, feedback: `Isso multiplica por ${q} × ${n} = ${q * n}. Quem ${verb} ${n} vezes é multiplicado por ${pow(String(q), n)} = ${q ** n}.` },
        { value: v0 + v0 * (q - 1) * n, feedback: `Isso soma o mesmo acréscimo (${num(v0 * (q - 1))}) a cada período, como numa função afim. Mas o acréscimo cresce: cada período multiplica o valor anterior.` },
        { value: v0 * q ** (n - 1), feedback: `Isso ${verb} só ${n - 1} ${n - 1 === 1 ? 'vez' : 'vezes'}. Em ${t.text}, cabem ${n} períodos de ${per}.` },
        ...(t.shown !== n && t.shown <= 12 ? [{ value: v0 * q ** t.shown, feedback: `Isso usa ${t.shown} como número de períodos. Mas o valor ${verb} a cada ${per}: em ${t.text}, são ${n} períodos.` }] : []),
      ],
      hints: [`Em ${t.text}, cabem ${n * P} ÷ ${P} = ${n} períodos de ${per}.`, `Multiplique ${num(v0)} por ${q}, ${n} vezes: ${num(v0)} × ${pow(String(q), n)}.`],
      solution: [`$n = ${n * P} ÷ ${P} = ${n} períodos`, `$${num(v0)} × ${pow(String(q), n)} = ${num(v0)} × ${q ** n} = ${num(ans)}`],
    });
  }
}

const DECAY = [
  {
    intro: (v0: number, per: string) => `A cafeína tem meia-vida de cerca de ${per} no organismo: a cada ${per}, a quantidade no sangue cai pela metade. Uma pessoa ingeriu ${num(v0)} mg de cafeína.`,
    ask: (t: string) => `Quanta cafeína restará no sangue depois de ${t}?`,
    unit: 'mg',
    starts: [80, 120, 160, 200, 240, 320],
    periods: [4, 5],
    span: [2, 4],
    one: 'hora',
    many: 'horas',
  },
  {
    intro: (v0: number, per: string) => `Um material radioativo tem meia-vida de ${per}: a cada ${per}, a massa dele cai pela metade. Um laboratório guarda ${num(v0)} g desse material.`,
    ask: (t: string) => `Quantos gramas restarão depois de ${t}?`,
    unit: 'g',
    starts: [64, 96, 128, 160, 320, 480],
    periods: [6, 8, 10, 15],
    span: [2, 5],
    one: 'dia',
    many: 'dias',
  },
  {
    intro: (v0: number, per: string) => `Um tratamento reduz pela metade, a cada ${per}, a concentração de um poluente num lago, que hoje é de ${num(v0)} mg por litro.`,
    ask: (t: string) => `Qual será a concentração depois de ${t}?`,
    unit: 'mg/L',
    starts: [48, 64, 80, 96, 120],
    periods: [1, 2],
    span: [2, 4],
    one: 'semana',
    many: 'semanas',
  },
];

/** Cair pela metade a cada período: V₀ ÷ 2ⁿ. */
function halvingGen(r: Rand) {
  const g = r.pick(DECAY);
  const v0 = r.pick(g.starts);
  const P = r.pick(g.periods);
  const n = r.int(g.span[0], g.span[1]);
  const per = plural(P, g.one, g.many).replace(/^1 /, '');
  const t = plural(n * P, g.one, g.many);
  const ans = round(v0 / 2 ** n, 4);
  return draftNumeric({
    prompt: [p(g.intro(v0, per))],
    ask: g.ask(t),
    unit: g.unit,
    answer: ans,
    wrong: [
      { value: round(v0 / (2 * n), 4), feedback: `Isso divide por 2 × ${n} = ${2 * n}. Cair pela metade ${n} vezes é dividir por ${pow('2', n)} = ${2 ** n}.` },
      { value: v0 / 2, feedback: `Isso divide por 2 uma vez só. Em ${t}, houve ${n} meias-vidas: divida por 2 a cada uma.` },
      { value: round(v0 / 2 ** (n + 1), 4), feedback: `Isso divide ${n + 1} vezes. Contando os instantes 0, ${P}, ${2 * P}…, aparecem ${n + 1} marcas, mas são só ${n} meias-vidas.` },
    ],
    hints: [`Em ${t}, cabem ${n} períodos de ${per}.`, `Divida ${num(v0)} por 2, ${n} vezes: ${num(v0)} ÷ ${pow('2', n)}.`],
    solution: [`$n = ${n * P} ÷ ${P} = ${n} meias-vidas`, `$${num(v0)} ÷ ${pow('2', n)} = ${num(v0)} ÷ ${2 ** n} = ${num(ans, 4)} ${g.unit}`],
  });
}

// ———————————————————————————————————————————————— geradores: a fórmula e as taxas

const PGROW = [
  {
    intro: (v0: number, i: number) => `Uma cidade tem ${num(v0)} habitantes, e a população cresce ${i}% ao ano.`,
    ask: (n: number) => `Quantos habitantes terá daqui a ${n} anos?`,
    unit: 'habitantes',
    rates: [10, 20],
    base: 10000,
  },
  {
    intro: (v0: number, i: number) => `Um aplicativo tem ${num(v0)} usuários, e esse número cresce ${i}% ao mês.`,
    ask: (n: number) => `Quantos usuários terá daqui a ${n} meses?`,
    unit: 'usuários',
    rates: [10, 20, 30, 50],
    base: 1000,
  },
  {
    intro: (v0: number, i: number) => `Uma horta comunitária colheu ${num(v0)} kg nesta safra, e a colheita cresce ${i}% a cada safra.`,
    ask: (n: number) => `Quantos quilos serão colhidos daqui a ${n} safras?`,
    unit: 'kg',
    rates: [10, 20, 30],
    base: 1000,
  },
];

/** Crescimento de i% por período: V₀ · (1 + i)ⁿ. */
function percentGrowthGen(r: Rand) {
  const g = r.pick(PGROW);
  const i = r.pick(g.rates);
  const n = r.int(2, 3);
  const v0 = g.base * r.int(2, 9);
  const q = 1 + i / 100;
  const ans = round(v0 * q ** n, 2);
  return draftNumeric({
    prompt: [p(g.intro(v0, i))],
    ask: g.ask(n),
    unit: g.unit,
    answer: ans,
    wrong: [
      { value: round(v0 * (1 + (n * i) / 100), 2), feedback: `Isso aplica ${i}% sempre sobre o valor inicial (${n} × ${i}% = ${n * i}%). No crescimento exponencial, cada aumento incide sobre o valor já aumentado.` },
      { value: round(v0 * q * n, 2), feedback: `Isso multiplica o fator ${num(q)} por ${n}, em vez de elevá-lo a ${n}: são ${n} multiplicações por ${num(q)}.` },
      { value: round(v0 * (q ** n - 1), 2), feedback: 'Esse é só o crescimento acumulado. A pergunta é o total: o valor inicial mais o crescimento.' },
    ],
    hints: [`Crescer ${i}% é multiplicar por ${num(q)}.`, `Faça ${num(v0)} × ${pow(num(q), n)}.`],
    solution: [`$${pow(num(q), n)} = ${num(q ** n, 4)}`, `$${num(v0)} × ${num(q ** n, 4)} = ${num(ans)}`],
  });
}

const PDECAY = [
  {
    intro: (v0: number, i: number) => `Um carro novo custa ${brl(v0)} e desvaloriza ${i}% ao ano.`,
    ask: (n: number) => `Quanto o carro valerá daqui a ${n} anos?`,
    money: true,
    unit: '',
    rates: [10, 15, 20],
    starts: [40000, 48000, 60000, 64000, 80000, 100000],
  },
  {
    intro: (v0: number, i: number) => `Durante uma seca, um reservatório com ${num(v0)} m³ de água perde ${i}% do volume a cada semana.`,
    ask: (n: number) => `Quantos metros cúbicos restarão depois de ${n} semanas?`,
    money: false,
    unit: 'm³',
    rates: [10, 20],
    starts: [20000, 30000, 50000, 80000],
  },
  {
    intro: (v0: number, i: number) => `Um lago tem ${num(v0)} peixes de uma espécie, e a população cai ${i}% ao ano por causa da pesca predatória.`,
    ask: (n: number) => `Quantos peixes haverá daqui a ${n} anos?`,
    money: false,
    unit: 'peixes',
    rates: [10, 20, 30],
    starts: [2000, 3000, 5000, 8000],
  },
];

/** Queda de i% por período: V₀ · (1 − i)ⁿ. */
function percentDecayGen(r: Rand) {
  for (;;) {
    const g = r.pick(PDECAY);
    const i = r.pick(g.rates);
    const v0 = r.pick(g.starts);
    if (g.money && v0 === 50000 && i === 20) continue; // laboratório da teoria
    const n = r.int(2, 3);
    const q = 1 - i / 100;
    const ans = round(v0 * q ** n, 2);
    return draftNumeric({
      prompt: [p(g.intro(v0, i))],
      ask: g.ask(n),
      ...(g.money ? { prefix: 'R$' } : { unit: g.unit }),
      answer: ans,
      wrong: [
        { value: round(v0 * (1 - (n * i) / 100), 2), feedback: `Isso desconta ${i}% sempre do valor inicial. Cada queda incide sobre o que sobrou, que é cada vez menor.` },
        { value: round(v0 * (1 + i / 100) ** n, 2), feedback: `Isso aumenta ${i}% a cada período. Perder ${i}% é multiplicar por ${num(q)}.` },
        { value: round(v0 * (1 - q ** n), 2), feedback: 'Essa é a perda acumulada. A pergunta é quanto resta.' },
      ],
      hints: [`Perder ${i}% é ficar com ${100 - i}%: multiplicar por ${num(q)}.`, `Faça ${num(v0)} × ${pow(num(q), n)}.`],
      solution: [`$${pow(num(q), n)} = ${num(q ** n, 4)}`, `$${num(v0)} × ${num(q ** n, 4)} = ${g.money ? brl(ans) : num(ans)}`],
    });
  }
}

/** Tabela de uma exponencial: a razão entre valores seguidos é constante. */
function ratioTableGen(r: Rand) {
  const opts = [
    { q: 2, starts: [3, 5, 6, 10] },
    { q: 3, starts: [2, 4, 5] },
    { q: 1.5, starts: [64, 128, 192] },
    { q: 0.5, starts: [640, 1280, 1920, 3200] },
  ];
  const o = r.pick(opts);
  const v0 = r.pick(o.starts);
  const k = r.pick([5, 6]);
  const V = (n: number) => round(v0 * o.q ** n, 4);
  const grows = o.q > 1;
  return draftNumeric({
    prompt: [
      p(grows ? 'Um pesquisador contou os insetos de uma estufa no início de cada semana.' : 'Um laboratório mediu a massa de uma amostra que se decompõe, no início de cada dia.'),
      table([grows ? 'Semana' : 'Dia', '0', '1', '2', '3'], [[grows ? 'Insetos' : 'Massa (mg)', ...[0, 1, 2, 3].map((n) => num(V(n)))]]),
    ],
    ask: grows ? `Mantido o padrão, quantos insetos haverá na semana ${k}?` : `Mantido o padrão, qual será a massa no dia ${k}, em mg?`,
    answer: V(k),
    wrong: [
      ...(V(3) + (V(3) - V(2)) * (k - 3) > 0
        ? [{ value: round(V(3) + (V(3) - V(2)) * (k - 3), 4), feedback: `Isso continua somando a última diferença (${num(V(3) - V(2))}), como numa função afim. Aqui é a razão que é constante: cada valor é ${num(o.q)} vezes o anterior.` }]
        : []),
      { value: round(V(3) * o.q, 4), feedback: 'Isso avança só um período a partir do último valor da tabela.' },
      { value: round(v0 * o.q * k, 4), feedback: `Isso multiplica o valor inicial por ${num(o.q)} × ${k}. O certo é multiplicar por ${num(o.q)}, ${k} vezes: ${pow(num(o.q), k)}.` },
    ],
    hints: [`Divida um valor pelo anterior: ${num(V(1))} ÷ ${num(V(0))} = ${num(o.q)}.`, `Do período 3 ao ${k}, multiplique por ${num(o.q)} mais ${k - 3} ${k - 3 === 1 ? 'vez' : 'vezes'}.`],
    solution: [`$razão: ${num(o.q)}`, `$${num(V(3))} × ${pow(num(o.q), k - 3)} = ${num(V(k))}`],
  });
}

// ———————————————————————————————————————————————— geradores: quanto tempo leva

const HALF = [
  { what: 'Um material radioativo', unit: 'g', periods: [6, 8, 10, 15], one: 'dia', many: 'dias', tu: 'dias', starts: [96, 160, 320, 480, 640] },
  { what: 'Um agrotóxico aplicado no solo', unit: 'mg por kg de solo', periods: [20, 30, 45], one: 'dia', many: 'dias', tu: 'dias', starts: [32, 48, 64, 80] },
  { what: 'A cafeína', unit: 'mg no sangue', periods: [4, 5], one: 'hora', many: 'horas', tu: 'h', starts: [160, 240, 320] },
];

/** Meias-vidas até uma quantidade: achar a potência de 2 e multiplicar pelo período. */
function halfLifeTimeGen(r: Rand) {
  const g = r.pick(HALF);
  const P = r.pick(g.periods);
  const A = r.pick(g.starts);
  const n = P === 6 ? r.pick([2, 3, 5]) : r.int(2, 5); // meia-vida 6 com 4 meias-vidas: a conta da questão do banco
  const ratio = 2 ** n;
  const end = A / ratio;
  return draftNumeric({
    prompt: [p(`${g.what} tem meia-vida de ${plural(P, g.one, g.many)}: a cada ${plural(P, g.one, g.many)}, a quantidade cai pela metade. No início, há ${num(A)} ${g.unit}.`)],
    ask: `Depois de quanto tempo restarão ${num(end, 4)} ${g.unit}?`,
    unit: g.tu,
    answer: n * P,
    wrong: [
      { value: n, feedback: `Esse é o número de meias-vidas. Cada uma dura ${plural(P, g.one, g.many)}: multiplique.` },
      { value: (ratio / 2) * P, feedback: `Isso divide ${ratio} por 2 e conta ${ratio / 2} meias-vidas. O número de meias-vidas é a potência: ${pow('2', n)} = ${ratio}.` },
      { value: (n + 1) * P, feedback: `Isso conta uma meia-vida a mais: de ${num(A)} para ${num(A / 2)} já é uma; até ${num(end, 4)} são ${n}.` },
    ],
    hints: [`Compare o início com a meta: ${num(A)} ÷ ${num(end, 4)} = ${ratio}.`, `${ratio} = ${pow('2', n)}: são ${n} meias-vidas.`],
    solution: [`$${num(A)} ÷ ${num(end, 4)} = ${ratio} = ${pow('2', n)} → ${n} meias-vidas`, `$${n} × ${P} = ${n * P} ${g.tu}`],
  });
}

const DOUBLE = [
  { intro: (v0: number, verb: string, per: string) => `Um vídeo tem ${num(v0)} visualizações, e esse número ${verb} a cada ${per}.`, target: (v: number) => `${num(v)} visualizações`, one: 'dia', many: 'dias', tu: 'dias', starts: [150, 250, 400, 600] },
  { intro: (v0: number, verb: string, per: string) => `Uma colônia tem ${num(v0)} formigas, e a população ${verb} a cada ${per}.`, target: (v: number) => `${num(v)} formigas`, one: 'mês', many: 'meses', tu: 'meses', starts: [200, 300, 500] },
];

/** Dobras (ou triplicações) até uma meta exata. */
function growTimeGen(r: Rand) {
  for (;;) {
    const g = r.pick(DOUBLE);
    const q = r.pick([2, 2, 3]);
    const n = r.int(3, q === 2 ? 6 : 4);
    const P = r.pick([2, 3, 4]);
    const v0 = r.pick(g.starts);
    const verb = q === 2 ? 'dobra' : 'triplica';
    const per = plural(P, g.one, g.many);
    const ratio = q ** n;
    return draftNumeric({
      prompt: [p(g.intro(v0, verb, per))],
      ask: `Depois de quanto tempo chegará a ${g.target(v0 * ratio)}?`,
      unit: g.tu,
      answer: n * P,
      wrong: [
        { value: n, feedback: `Esse é o número de vezes que o valor ${verb}. Cada vez leva ${per}: multiplique.` },
        { value: ratio, feedback: `${ratio} é quantas vezes o valor cresce (${num(v0 * ratio)} ÷ ${num(v0)}), e não o tempo.` },
        { value: (n - 1) * P, feedback: `Nesse tempo, o valor ${verb} só ${n - 1} vezes e chega a ${num(v0 * q ** (n - 1))}.` },
      ],
      hints: [`${num(v0 * ratio)} ÷ ${num(v0)} = ${ratio}.`, `${ratio} = ${pow(String(q), n)}: o valor ${verb} ${n} vezes.`],
      solution: [`$${num(v0 * ratio)} ÷ ${num(v0)} = ${ratio} = ${pow(String(q), n)}`, `$${n} × ${P} = ${n * P} ${g.tu}`],
    });
  }
}

const POWERS = [
  { q: 1.1, grows: true, intro: (v0: number) => `Uma cidade tem ${num(v0)} habitantes, e a população cresce 10% ao ano.`, ask: (l: number) => `Ao fim de quantos anos a população passará, pela primeira vez, de ${num(l)} habitantes?`, rate: 10, starts: [10000, 20000, 40000, 50000] },
  { q: 1.2, grows: true, intro: (v0: number) => `Uma plataforma de cursos tem ${num(v0)} assinantes, e esse número cresce 20% ao ano.`, ask: (l: number) => `Ao fim de quantos anos passará, pela primeira vez, de ${num(l)} assinantes?`, rate: 20, starts: [5000, 8000, 10000, 20000] },
  { q: 0.9, grows: false, intro: (v0: number) => `Durante uma seca, uma represa com ${num(v0)} m³ de água perde 10% do volume a cada mês.`, ask: (l: number) => `Ao fim de quantos meses o volume ficará, pela primeira vez, abaixo de ${num(l)} m³?`, rate: 10, starts: [100000, 200000, 500000] },
  { q: 0.8, grows: false, intro: (v0: number) => `Uma máquina industrial custa ${brl(v0)} e desvaloriza 20% ao ano.`, ask: (l: number) => `Ao fim de quantos anos passará, pela primeira vez, a valer menos de ${brl(l)}?`, rate: 20, starts: [100000, 200000, 250000] },
];

/** Tabela de potências: o primeiro período em que a meta é ultrapassada. */
function percentTimeGen(r: Rand) {
  for (;;) {
    const g = r.pick(POWERS);
    const v0 = r.pick(g.starts);
    const n = r.int(3, 7);
    const before = v0 * g.q ** (n - 1);
    const after = v0 * g.q ** n;
    const step = v0 >= 100000 ? 10000 : 1000;
    const L = Math.round((before + after) / 2 / step) * step;
    const ratio = L / v0;
    const pows = Array.from({ length: 8 }, (_, k) => g.q ** (k + 1));
    if (!(g.grows ? before < L && L < after : after < L && L < before)) continue;
    if (pows.some((v) => Math.abs(v - ratio) < 0.015)) continue; // evita empate aparente na tabela arredondada
    const units = g.q === 0.9 ? 'meses' : 'anos';
    const linear = g.grows ? Math.ceil(round((ratio - 1) / (g.rate / 100), 9) + 1e-9) : Math.ceil(round((1 - ratio) / (g.rate / 100), 9) + 1e-9);
    return draftNumeric({
      prompt: [
        p(g.intro(v0)),
        table(['n', ...pows.map((_, k) => String(k + 1))], [[`${num(g.q)}ⁿ`, ...pows.map((v) => fixed(v, 2))]], `Potências de ${num(g.q)}`),
      ],
      ask: g.ask(L),
      unit: units,
      answer: n,
      wrong: [
        { value: n - 1, feedback: `Ao fim de ${n - 1} ${units}, o valor é ${num(v0)} × ${pow(num(g.q), n - 1)} ≈ ${num(round(before, 0))}: ainda não ${g.grows ? 'passou' : 'ficou abaixo'}.` },
        { value: linear, feedback: `Isso supõe que ${g.grows ? 'o aumento' : 'a queda'} é sempre ${g.rate}% do valor inicial, como numa função afim. Mas ${g.grows ? 'os aumentos' : 'as quedas'} incidem sobre o valor já ${g.grows ? 'aumentado' : 'reduzido'}.` },
      ],
      hints: [`A meta corresponde a ${num(L)} ÷ ${num(v0)} = ${num(ratio, 3)} vezes o valor inicial.`, `Procure na tabela a primeira potência ${g.grows ? 'maior' : 'menor'} que ${num(ratio, 3)}.`],
      solution: [`$${num(L)} ÷ ${num(v0)} = ${num(ratio, 3)}`, `$${pow(num(g.q), n - 1)} ≈ ${fixed(g.q ** (n - 1), 2)} e ${pow(num(g.q), n)} ≈ ${fixed(g.q ** n, 2)} → ${n} períodos`],
    });
  }
}

// ———————————————————————————————————————————————— geradores: maestria

const RACES = [
  { intro: (v0: number, k: number) => `Dois canais de vídeo começam com ${num(v0)} inscritos cada. O canal A ganha ${num(k)} inscritos por mês; o canal B dobra o número de inscritos a cada mês.`, ask: 'Ao fim de quantos meses o canal B passará a ter mais inscritos que o A?', unit: 'meses', one: 'mês', first: 'No 1º mês', what: 'inscritos', per: 'por mês' },
  { intro: (v0: number, k: number) => `Duas plantações de cogumelos começam com ${num(v0)} g cada. A primeira ganha ${num(k)} g por semana; a segunda dobra de massa a cada semana.`, ask: 'Ao fim de quantas semanas a segunda passará a ter mais massa que a primeira?', unit: 'semanas', one: 'semana', first: 'Na 1ª semana', what: 'g', per: 'por semana' },
];

/** Somar × dobrar: quando a exponencial ultrapassa a afim. */
function compareGrowthGen(r: Rand) {
  for (;;) {
    const g = r.pick(RACES);
    const v0 = r.pick([50, 100, 200, 500]);
    const m = r.int(1, 8);
    if (v0 === 100 && m === 3) continue; // laboratório da teoria
    const k = m * v0;
    const lin = (t: number) => v0 + k * t;
    const exp = (t: number) => v0 * 2 ** t;
    let n = 1;
    while (exp(n) <= lin(n)) n++;
    const tie = exp(n - 1) === lin(n - 1);
    return draftNumeric({
      prompt: [p(g.intro(v0, k))],
      ask: g.ask,
      unit: g.unit,
      answer: n,
      wrong: [
        { value: n - 1, feedback: `Ao fim de ${n - 1} ${n - 1 === 1 ? g.one : g.unit}, ${tie ? `os dois empatam (${num(lin(n - 1))} ${g.what})` : `quem soma tem ${num(lin(n - 1))} ${g.what} e quem dobra, ${num(exp(n - 1))}`}: ainda não passou.` },
        ...(n > 2 ? [{ value: 1, feedback: `${g.first}, quem dobra tem só ${num(exp(1))} ${g.what}, contra ${num(lin(1))} de quem ganha ${num(k)} ${g.per}. A virada vem depois.` }] : []),
      ],
      hints: [`Quem soma: ${num(v0)} + ${num(k)}t. Quem dobra: ${num(v0)} × 2ᵗ.`, `Monte uma tabela, ${g.one} a ${g.one}, até quem dobra passar à frente.`],
      solution: [
        ...Array.from({ length: n }, (_, j) => `$t = ${j + 1}: ${num(lin(j + 1))} contra ${num(exp(j + 1))}`),
        `Quem dobra passa à frente ao fim de ${n} ${g.unit}.`,
      ],
    });
  }
}

/** Desfazer o crescimento: achar o valor inicial. */
function initialGen(r: Rand) {
  const doubling = r.next() < 0.5;
  if (doubling) {
    const n = r.int(3, 6);
    const v0 = r.pick([150, 250, 300, 600, 750]);
    const F = v0 * 2 ** n;
    return draftNumeric({
      prompt: [p(`Uma cultura de bactérias dobra a cada 20 minutos. Depois de ${n * 20} minutos, havia ${num(F)} bactérias.`)],
      ask: 'Quantas bactérias havia no início?',
      unit: 'bactérias',
      answer: v0,
      wrong: [
        { value: round(F / (2 * n), 2), feedback: `Isso divide por 2 × ${n}. Desfazer ${n} dobras é dividir por ${pow('2', n)} = ${2 ** n}.` },
        { value: F / 2, feedback: `Isso desfaz só uma dobra. Em ${n * 20} minutos, houve ${n} dobras.` },
        { value: F / 2 ** (n - 1), feedback: `Isso desfaz ${n - 1} dobras. Em ${n * 20} minutos, cabem ${n} períodos de 20 minutos.` },
      ],
      hints: [`Em ${n * 20} minutos, a cultura dobrou ${n} vezes.`, `Divida ${num(F)} por ${pow('2', n)}.`],
      solution: [`$${n * 20} ÷ 20 = ${n} dobras`, `$${num(F)} ÷ ${2 ** n} = ${num(v0)}`],
    });
  }
  const i = r.pick([10, 20]);
  const n = 2;
  const q = 1 + i / 100;
  const v0 = 10000 * r.int(2, 9);
  const F = round(v0 * q ** n, 2);
  return draftNumeric({
    prompt: [p(`Uma cidade cresceu ${i}% ao ano por ${n} anos seguidos e chegou a ${num(F)} habitantes.`)],
    ask: `Quantos habitantes tinha ${n} anos antes?`,
    unit: 'habitantes',
    answer: v0,
    wrong: [
      { value: round(F * (1 - i / 100) ** n, 2), feedback: `Isso tira ${i}% de ${num(F)} a cada ano. Mas os ${i}% foram calculados sobre valores menores: desfazer é dividir por ${num(q)} a cada ano.` },
      { value: round(F * (1 - (n * i) / 100), 2), feedback: `Isso tira ${n * i}% de uma vez do valor final. Desfazer o crescimento é dividir por ${pow(num(q), n)}.` },
      { value: round(F / (1 + (n * i) / 100), 2), feedback: `Isso desfaz um aumento único de ${n * i}%. Os aumentos foram sucessivos: divida por ${pow(num(q), n)} = ${num(q ** n, 4)}.` },
    ],
    hints: [`Crescer ${i}% ao ano por ${n} anos é multiplicar por ${pow(num(q), n)} = ${num(q ** n, 4)}.`, `Desfaça: divida ${num(F)} por ${num(q ** n, 4)}.`],
    solution: [`$V₀ × ${num(q ** n, 4)} = ${num(F)}`, `$V₀ = ${num(F)} ÷ ${num(q ** n, 4)} = ${num(v0)}`],
  });
}

const SWINGS = [
  { intro: (v0: number, up: string, down: string) => `Uma população de aves com ${num(v0)} indivíduos ${up}; depois, por causa de uma seca, ${down}.`, unit: 'aves', ask: 'Quantas aves haverá no fim desse período?' },
  { intro: (v0: number, up: string, down: string) => `Um parque recebia ${num(v0)} visitantes por ano. O número ${up}; depois, com uma obra na estrada, ${down}.`, unit: 'visitantes', ask: 'Quantos visitantes por ano o parque terá no fim desse período?' },
];

/** Altas e quedas percentuais seguidas: os fatores se multiplicam. */
function swingGen(r: Rand) {
  const g = r.pick(SWINGS);
  const i = r.pick([10, 20, 30]);
  const j = r.pick([10, 20, 30]);
  const a = r.int(1, 2);
  const b = r.int(1, 2);
  const v0 = 10000 * r.int(2, 9);
  const qu = 1 + i / 100;
  const qd = 1 - j / 100;
  const ans = round(v0 * qu ** a * qd ** b, 2);
  const up = a === 1 ? `cresceu ${i}% em um ano` : `cresceu ${i}% ao ano por ${a} anos seguidos`;
  const down = b === 1 ? `caiu ${j}% no ano seguinte` : `caiu ${j}% ao ano nos ${b} anos seguintes`;
  return draftNumeric({
    prompt: [p(g.intro(v0, up, down))],
    ask: g.ask,
    unit: g.unit,
    answer: ans,
    wrong: [
      { value: round(v0 * (1 + (i * a - j * b) / 100), 2), feedback: 'Isso soma e subtrai as porcentagens. Em variações sucessivas, os fatores se multiplicam, e cada um incide sobre o valor do momento.' },
      ...(a === 2 || b === 2 ? [{ value: round(v0 * qu * qd, 2), feedback: `Isso aplica só uma alta e uma queda. Foram ${a} de alta e ${b} de queda.` }] : []),
      ...(b === 2 ? [{ value: round(v0 * qu ** a * (1 - (2 * j) / 100), 2), feedback: `Isso junta as duas quedas numa só, de ${2 * j}%. A segunda queda incide sobre o valor já reduzido: multiplique por ${num(qd)} duas vezes.` }] : []),
    ],
    hints: [`Alta de ${i}%: × ${num(qu)}. Queda de ${j}%: × ${num(qd)}.`, `Faça ${num(v0)} × ${powN(num(qu), a)} × ${powN(num(qd), b)}.`],
    solution: [`$${num(v0)} × ${powN(num(qu), a)} × ${powN(num(qd), b)} = ${num(v0)} × ${num(qu ** a * qd ** b, 4)} = ${num(ans)}`],
  });
}

// ———————————————————————————————————————————————— aula

export const FUNCAO_EXPONENCIAL = lesson({
  id: 'funcao-exponencial',
  topic: 'funcoes',
  subtopics: ['funcao-exponencial'],
  title: 'Função exponencial',
  summary: 'Crescer multiplicando: dobrar, triplicar e cair pela metade, a fórmula V = V₀ · qⁿ com taxas percentuais, o tempo até uma meta (meias-vidas, dobras, tabelas de potências) e a corrida entre somar e multiplicar.',
  requires: ['funcao-afim', 'porcentagem'],
  stages: [
    stage('dobrar', 'descoberta', 'Crescer multiplicando', 'Perceber a diferença entre crescer somando e crescer multiplicando e calcular valores que dobram, triplicam ou caem pela metade a cada período.', () => ({
      learn: [
        text('Numa função afim, a cada período se **soma** o mesmo valor. Numa **função exponencial**, a cada período se **multiplica** pelo mesmo fator: dobra (× 2), triplica (× 3), cai pela metade (× ½). Por isso ela começa devagar e depois dispara — ou despenca e fica cada vez mais perto de zero, sem nunca chegar lá.'),
        lab({
          title: 'Somar ou multiplicar?',
          intro: 'Duas colônias começam com 100 g de algas. A colônia A ganha k gramas por semana; a colônia B dobra a cada semana. Escolha k e avance as semanas.',
          params: [
            { key: 'k', label: 'Ganho semanal de A (k)', min: 100, max: 500, step: 100, value: 100, format: (v) => `${v} g` },
            { key: 'n', label: 'Semanas', min: 1, max: 10, step: 1, value: 1, format: (v) => String(v) },
          ],
          readouts: ({ k, n }) => [
            { label: 'A (soma k)', value: `${num(100 + k * n)} g` },
            { label: 'B (dobra)', value: `${num(100 * 2 ** n)} g`, big: true, tone: 'iris' },
            { label: 'Na frente', value: 100 * 2 ** n > 100 + k * n ? 'B' : 100 * 2 ** n === 100 + k * n ? 'empate' : 'A' },
          ],
          viz: ({ k, n }) => ({
            kind: 'chart',
            xLabel: 'semanas',
            yLabel: 'massa (g)',
            xMin: 0,
            xMax: n,
            yMin: 0,
            series: [
              { label: 'A: soma k por semana', tone: 'brass', points: Array.from({ length: n + 1 }, (_, t) => [t, 100 + k * t] as [number, number]), dots: true },
              { label: 'B: dobra a cada semana', tone: 'iris', points: Array.from({ length: n + 1 }, (_, t) => [t, 100 * 2 ** t] as [number, number]), dots: true },
            ],
            summary: `Na semana ${n}, A tem ${num(100 + k * n)} g e B tem ${num(100 * 2 ** n)} g`,
          }),
          goal: {
            task: 'Com k = 300 g, ache a primeira semana em que a colônia B passa a ter mais massa que a A.',
            done: ({ k, n }) => k === 300 && n === 4,
            success: 'Isso: na semana 3, A tem 1.000 g e B, 800 g; na semana 4, A tem 1.300 g e B já tem 1.600 g. Somar uma quantia fixa perde, cedo ou tarde, para multiplicar.',
          },
          insight: 'No começo, somar pode render mais; mas quem multiplica acelera a cada período e sempre acaba passando à frente.',
        }),
        key('Fator por período', 'Com valor inicial V₀ e fator q por período, depois de n períodos: V = V₀ · qⁿ. Dobrar n vezes é multiplicar por 2ⁿ; cair pela metade n vezes é dividir por 2ⁿ.'),
        example('Um vídeo que viraliza', 'Um vídeo tem 300 visualizações, e esse número triplica a cada dia. Quantas visualizações terá em 4 dias?', [
          askStep('Em 4 dias, o número triplica 4 vezes.', 'Por quanto o valor inicial fica multiplicado?', [
            ok('3⁴ = 3 × 3 × 3 × 3 = 81'),
            no('3 × 4 = 12', 'Isso seria somar o fator 4 vezes. Triplicar 4 vezes é multiplicar por 3 × 3 × 3 × 3 = 81.'),
          ]),
          step('Total:', '300 × 81 = 24.300 visualizações'),
        ], 'Em 4 dias, o vídeo terá 24.300 visualizações.'),
        check(numeric({
          prompt: [p('Uma folha de papel tem 0,1 mm de espessura. Ela é dobrada ao meio 6 vezes seguidas.')],
          ask: 'Qual é a espessura da pilha, em mm?',
          unit: 'mm',
          answer: 6.4,
          wrong: [
            { value: 0.6, feedback: 'Isso soma 0,1 mm a cada dobra. Mas cada dobra dobra a espessura da pilha inteira.' },
            { value: 1.2, feedback: 'Isso multiplica por 2 × 6 = 12. Dobrar 6 vezes é multiplicar por 2⁶ = 64.' },
            { value: 3.2, feedback: 'Isso dobra só 5 vezes (0,1 × 32). Foram 6 dobras: 0,1 × 64.' },
          ],
          solution: ['$0,1 × 2⁶ = 0,1 × 64 = 6,4 mm'],
        })),
      ],
      practice: [gen(doublingGen), gen(halvingGen), gen(doublingGen)],
      challenge: [gen(halvingGen), gen(doublingGen), gen(halvingGen)],
      recap: [
        'Afim: soma o mesmo valor; exponencial: multiplica pelo mesmo fator.',
        'Dobrar n vezes: × 2ⁿ. Cair pela metade n vezes: ÷ 2ⁿ.',
        'Conte os períodos: tempo total ÷ duração de cada período.',
      ],
    })),

    stage('formula', 'fundamentos', 'A fórmula e as taxas', 'Usar a fórmula V = V₀ · qⁿ com taxas percentuais de crescimento ou de queda e reconhecer uma exponencial numa tabela pela razão constante.', () => ({
      learn: [
        text('Na fórmula **V = V₀ · qⁿ**, V₀ é o valor inicial, q é o fator por período e n é o número de períodos. Um aumento de i% por período dá q = 1 + i (+10% → × 1,1); uma queda de i% dá q = 1 − i (−20% → × 0,8). Se q > 1, a função cresce; se 0 < q < 1, decresce. É a mesma conta dos juros compostos.'),
        data(table(['Ano', '0', '1', '2', '3'], [['Valor A', '1.000', '1.200', '1.440', '1.728'], ['Valor B', '1.000', '1.200', '1.400', '1.600']], 'Dois crescimentos que começam iguais')),
        reveal('Qual das duas linhas é exponencial?', 'A linha A: cada valor é 1,2 vez o anterior (1.200 ÷ 1.000 = 1.440 ÷ 1.200 = 1,2), um fator constante — cresce 20% ao ano. A linha B soma sempre 200: diferença constante, função afim.'),
        lab({
          title: 'Quanto vale o carro?',
          intro: 'Um carro de R$ 50.000,00 perde uma porcentagem fixa do valor a cada ano. Escolha a taxa e o número de anos.',
          params: [
            { key: 'i', label: 'Desvalorização ao ano', min: 5, max: 30, step: 5, value: 10, format: (v) => `${v}%` },
            { key: 'n', label: 'Anos', min: 0, max: 10, step: 1, value: 1, format: (v) => String(v) },
          ],
          readouts: ({ i, n }) => [
            { label: 'Fator anual', value: `× ${num(1 - i / 100)}` },
            { label: 'Valor', value: brl(50000 * (1 - i / 100) ** n), big: true, tone: 'brass' },
            { label: 'Do preço inicial', value: `${num(100 * (1 - i / 100) ** n, 1)}%` },
          ],
          viz: ({ i, n }) => ({
            kind: 'chart',
            xLabel: 'anos',
            yLabel: 'valor (mil R$)',
            xMin: 0,
            xMax: 10,
            yMin: 0,
            yMax: 50000,
            yFormat: (y) => num(y / 1000, 0),
            series: [{ label: 'valor do carro', tone: 'brass', points: Array.from({ length: 11 }, (_, t) => [t, 50000 * (1 - i / 100) ** t] as [number, number]), dots: true }],
            markers: [{ x: n, y: 50000 * (1 - i / 100) ** n, label: brl(50000 * (1 - i / 100) ** n), tone: 'ember' }],
            summary: `Com ${i}% ao ano, o carro vale ${brl(50000 * (1 - i / 100) ** n)} depois de ${n} ${n === 1 ? 'ano' : 'anos'}`,
          }),
          goal: {
            task: 'Com 20% ao ano, ache o primeiro ano em que o carro passa a valer menos da metade do preço inicial.',
            done: ({ i, n }) => i === 20 && n === 4,
            success: 'Isso: 50.000 × 0,8³ = R$ 25.600,00 (ainda mais da metade) e 50.000 × 0,8⁴ = R$ 20.480,00. Perder 20% ao ano por 4 anos não é perder 80%: sobram 41%.',
          },
          insight: 'Cada ano tira a mesma porcentagem de um valor menor: as perdas em reais vão diminuindo, e o valor nunca chega a zero.',
        }),
        example('Uma cidade que cresce 2% ao ano', 'Uma cidade tem 50.000 habitantes e cresce 2% ao ano. Quantos habitantes terá em 3 anos?', [
          askStep('Primeiro, o fator.', 'Qual é o fator anual?', [
            ok('1,02'),
            no('0,02', 'Isso é só o acréscimo. O fator é 1 + 0,02 = 1,02: a população de antes mais os 2%.'),
            no('1,2', 'Isso seria um crescimento de 20% ao ano. 2% = 0,02, então o fator é 1,02.'),
          ]),
          step('Três anos:', '1,02³ = 1,061208', '50.000 × 1,061208 ≈ 53.060 habitantes'),
        ], 'Em 3 anos, a cidade terá cerca de 53.060 habitantes.'),
        check(classify({
          ask: 'Classifique cada situação pelo tipo de crescimento.',
          bins: ['Afim (soma constante)', 'Exponencial (fator constante)'],
          items: [
            { text: '5, 10, 20, 40, …', bin: 1, why: 'Cada termo é o dobro do anterior.' },
            { text: '5, 10, 15, 20, …', bin: 0, why: 'Soma 5 a cada termo.' },
            { text: '1.000, 900, 810, 729, …', bin: 1, why: 'Cada termo é 0,9 do anterior: cai 10% por vez.' },
            { text: '300, 270, 240, 210, …', bin: 0, why: 'Tira 30 a cada termo: diferença constante.' },
            { text: 'Salário com aumento de R$ 100,00 por ano', bin: 0, why: 'O aumento é sempre o mesmo valor em reais.' },
            { text: 'Dívida que cresce 2% ao mês', bin: 1, why: 'A cada mês, multiplica por 1,02.' },
          ],
          solution: ['Diferença constante entre termos seguidos: afim. Razão constante: exponencial.'],
        })),
      ],
      practice: [gen(percentGrowthGen), gen(percentDecayGen), gen(ratioTableGen)],
      challenge: [gen(ratioTableGen), gen(percentDecayGen), gen(percentGrowthGen)],
      recap: [
        'V = V₀ · qⁿ.',
        '+i% por período: q = 1 + i; −i%: q = 1 − i.',
        'Razão constante numa tabela: exponencial.',
      ],
    })),

    stage('tempo', 'aplicacoes', 'Quanto tempo leva?', 'Descobrir quantos períodos são necessários para uma grandeza exponencial atingir uma meta — dobras, meias-vidas ou a primeira vez que passa de um valor.', () => ({
      learn: [
        text('Para saber **quando** V₀ · qⁿ chega a um valor, divida a meta pelo valor inicial e descubra a potência. Cair de 640 para 80 é dividir por 8 = 2³: três meias-vidas. Depois, multiplique pelo tamanho do período. Quando o fator não é exato (como 1,1), consulte uma tabela de potências — ou teste valores — e ache o primeiro período que passa da meta.'),
        lab({
          title: 'Rastreando a meia-vida',
          intro: 'Um laboratório guarda 960 g de um material radioativo. Escolha a meia-vida e o tempo decorrido.',
          params: [
            { key: 'h', label: 'Meia-vida', min: 2, max: 8, step: 1, value: 6, format: (v) => `${v} h` },
            { key: 't', label: 'Tempo decorrido', min: 0, max: 48, step: 1, value: 0, format: (v) => `${v} h` },
          ],
          readouts: ({ h, t }) => [
            { label: 'Meias-vidas passadas', value: num(t / h, 2) },
            { label: 'Restam', value: `${num(960 * 0.5 ** (t / h), 1)} g`, big: true, tone: 'verdigris' },
          ],
          viz: ({ h, t }) => ({
            kind: 'chart',
            xLabel: 'tempo (h)',
            yLabel: 'massa (g)',
            xMin: 0,
            xMax: 48,
            yMin: 0,
            yMax: 960,
            series: [{ label: 'massa restante', tone: 'verdigris', points: sample(0, 48, 48, (x) => 960 * 0.5 ** (x / h)) }],
            markers: [{ x: t, y: 960 * 0.5 ** (t / h), label: `${num(960 * 0.5 ** (t / h), 1)} g`, tone: 'brass' }],
            summary: `Com meia-vida de ${h} h, depois de ${t} h restam ${num(960 * 0.5 ** (t / h), 1)} g dos 960 g`,
          }),
          goal: {
            task: 'Com meia-vida de 5 h, ache em quanto tempo os 960 g caem para 120 g.',
            done: ({ h, t }) => h === 5 && t === 15,
            success: 'Isso: 960 ÷ 120 = 8 = 2³, ou seja, 3 meias-vidas de 5 h: 15 h. Sem tentativas: ache a potência de 2 e multiplique pela meia-vida.',
          },
          insight: 'Em cada meia-vida, a massa cai pela metade do que restava: 960, 480, 240, 120, 60…',
        }),
        example('Exame com material radioativo', 'Uma substância usada em exames tem meia-vida de 8 dias. Em quanto tempo uma amostra se reduz a 1/32 da quantidade inicial?', [
          askStep('Cada meia-vida divide por 2.', 'Quantas meias-vidas levam a 1/32?', [
            ok('5, porque 2⁵ = 32'),
            no('16, porque 32 ÷ 2 = 16', 'Cair pela metade 16 vezes daria 1/65.536. Conte as potências de 2 até 32: 2, 4, 8, 16, 32 — são cinco.'),
          ]),
          step('Tempo:', '5 × 8 = 40 dias'),
        ], 'A amostra se reduz a 1/32 em 40 dias.'),
        check(numeric({
          prompt: [p('Um perfil tem 1.500 seguidores, e o número de seguidores dobra a cada 2 meses.')],
          ask: 'Em quanto tempo o perfil terá 48.000 seguidores?',
          unit: 'meses',
          answer: 10,
          wrong: [
            { value: 5, feedback: 'Esse é o número de dobras (2⁵ = 32). Cada dobra leva 2 meses.' },
            { value: 32, feedback: '32 é quantas vezes o número cresce (48.000 ÷ 1.500), e não o tempo.' },
            { value: 8, feedback: 'Em 8 meses são 4 dobras: 1.500 × 16 = 24.000 seguidores. Falta mais uma.' },
          ],
          solution: ['$48.000 ÷ 1.500 = 32 = 2⁵ → 5 dobras', '$5 × 2 = 10 meses'],
        })),
      ],
      practice: [gen(halfLifeTimeGen), gen(growTimeGen), gen(percentTimeGen)],
      challenge: [gen(growTimeGen), gen(percentTimeGen), gen(halfLifeTimeGen)],
      recap: [
        'Meta ÷ valor inicial = fator total; ache a potência.',
        'Número de períodos × duração do período = tempo.',
        'Fator "quebrado": tabela de potências; a resposta é o primeiro período que passa da meta.',
      ],
    })),

    stage('maestria', 'maestria', 'Maestria: exponenciais no mundo real', 'Resolver problemas inéditos que misturam crescimento e queda exponenciais, comparam com o crescimento afim e pedem desfazer o crescimento para achar o valor inicial.', () => ({
      learn: [
        strategy('Exponencial em 4 passos', '1) Ache o valor inicial V₀ e o fator q por período (dobra: 2; metade: ½; +i%: 1 + i; −i%: 1 − i). 2) Conte os períodos: tempo total ÷ duração de cada um. 3) Calcule V = V₀ · qⁿ. 4) Para "quando", procure a potência; para "quanto havia", divida pelo fator total.'),
        example('Dois planos de salário', 'O plano A paga R$ 2.000,00 e dá R$ 200,00 de aumento por ano. O plano B paga R$ 2.000,00 e dá 8% de aumento ao ano. Qual paga mais em 5 anos? E em 10?', [
          step('Em 5 anos:', 'A: 2.000 + 5 × 200 = R$ 3.000,00', 'B: 2.000 × 1,08⁵ ≈ 2.000 × 1,4693 = R$ 2.938,66'),
          askStep('Compare.', 'Em 5 anos, qual plano paga mais?', [
            ok('O plano A'),
            no('O plano B, porque exponencial sempre cresce mais', 'No longo prazo, sim; mas em 5 anos o B ainda está abaixo: R$ 2.938,66 contra R$ 3.000,00.'),
          ]),
          step('Em 10 anos:', 'A: R$ 4.000,00', 'B: 2.000 × 1,08¹⁰ ≈ R$ 4.317,85'),
        ], 'O plano A paga mais até o 6º ano; o B passa à frente no 7º (R$ 3.427,65 contra R$ 3.400,00), e a diferença só aumenta.'),
        reveal('A lenda do tabuleiro de xadrez', 'Um grão de arroz na 1ª casa, 2 na 2ª, 4 na 3ª…: na casa n há 2ⁿ⁻¹ grãos. Na 64ª, são 2⁶³ ≈ 9,2 × 10¹⁸ grãos — mais arroz do que o mundo produz em séculos. É assim que o crescimento exponencial surpreende.'),
        check(numeric({
          prompt: [p('Uma cultura de leveduras tem 2.000 células e dobra a cada 20 minutos.')],
          ask: 'Quantas células haverá depois de 2 horas?',
          unit: 'células',
          answer: 128000,
          wrong: [
            { value: 24000, feedback: 'Isso multiplica por 2 × 6 = 12. Dobrar 6 vezes é multiplicar por 2⁶ = 64.' },
            { value: 8000, feedback: 'Isso usa 2 dobras, uma por hora. A cultura dobra a cada 20 minutos: em 2 horas, são 6 dobras.' },
            { value: 64000, feedback: 'Isso dobra só 5 vezes. Em 120 minutos cabem 6 períodos de 20 minutos.' },
          ],
          solution: ['$2 h = 120 min → 120 ÷ 20 = 6 dobras', '$2.000 × 2⁶ = 2.000 × 64 = 128.000 células'],
        })),
      ],
      practice: [gen(compareGrowthGen), gen(initialGen), gen(swingGen)],
      challenge: [gen(swingGen), gen(compareGrowthGen), gen(percentTimeGen), gen(initialGen)],
      recap: [
        'Variações sucessivas: os fatores se multiplicam.',
        'Desfazer o crescimento: divida pelo fator total.',
        'Multiplicar sempre acaba passando somar — mas pode demorar.',
      ],
    })),
  ],
});
