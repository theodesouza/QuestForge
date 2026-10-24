/**
 * Aula: Regra de três composta — a unidade de trabalho (máquina-hora, pessoa-hora-dia),
 * descobrir a grandeza que falta (direta ou inversa em relação a ela), ajustes de
 * produtividade, aprovação e conversões, equipes somando taxas, estoques com consumo por
 * pessoa, preparo fixo e mudanças no meio do caminho.
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
  select,
  stage,
  step,
  strategy,
  table,
  text,
  tip,
  warn,
} from '../../kit/build';
import { num, round } from '../../kit/format';
import type { Rand } from '../../types';

const ceil = (x: number) => Math.ceil(x - 1e-9);
const floor = (x: number) => Math.floor(x + 1e-9);

// ———————————————————————————————————————————————— geradores

interface ProdCtx {
  given: (a: number, b: number, c: number, P: number) => string;
  ask: (a: number, b: number, c: number) => string;
  unit: string;
  work: string;
  rates: number[];
}

const PROD: ProdCtx[] = [
  {
    given: (a, b, c, P) => `${a} máquinas iguais, funcionando ${b} horas por dia, produzem ${num(P)} peças em ${c} dias.`,
    ask: (a, b, c) => `Quantas peças ${a} dessas máquinas produzem em ${c} dias, funcionando ${b} horas por dia?`,
    unit: 'peças',
    work: 'máquinas-hora',
    rates: [4, 6, 8, 10, 12, 15],
  },
  {
    given: (a, b, c, P) => `${a} costureiras, trabalhando ${b} horas por dia no mesmo ritmo, fazem ${num(P)} camisas em ${c} dias.`,
    ask: (a, b, c) => `Quantas camisas ${a} costureiras fazem em ${c} dias, trabalhando ${b} horas por dia?`,
    unit: 'camisas',
    work: 'costureiras-hora',
    rates: [1.5, 2, 2.5, 3],
  },
  {
    given: (a, b, c, P) => `${a} aparelhos de ar-condicionado iguais, ligados ${b} horas por dia, consomem ${num(P, 2)} kWh em ${c} dias.`,
    ask: (a, b, c) => `Quantos kWh consomem ${a} desses aparelhos, ligados ${b} horas por dia durante ${c} dias?`,
    unit: 'kWh',
    work: 'aparelhos-hora',
    rates: [0.5, 0.8, 1, 1.2, 1.5],
  },
];

/** Produção nova a partir da unidade de trabalho (tudo direto). */
function compoundProdGen(r: Rand) {
  for (;;) {
    const c = r.pick(PROD);
    const rate = r.pick(c.rates);
    const [a1, b1, d1] = [r.int(2, 10), r.int(4, 10), r.int(2, 10)];
    const [a2, b2, d2] = [r.int(2, 12), r.int(4, 12), r.int(2, 12)];
    const changed = [a1 !== a2, b1 !== b2, d1 !== d2].filter(Boolean).length;
    if (changed < 2) continue;
    if (a1 === 8 && b1 === 6 && d1 === 5 && a2 === 10 && b2 === 8 && d2 === 4) continue; // questão do banco
    const W1 = a1 * b1 * d1;
    const W2 = a2 * b2 * d2;
    const P1 = round(rate * W1, 2);
    const P2 = round(rate * W2, 2);
    return draftNumeric({
      prompt: [p(c.given(a1, b1, d1, P1))],
      ask: c.ask(a2, b2, d2),
      unit: c.unit,
      answer: P2,
      wrong: [
        ...(b1 !== b2 ? [{ value: round((P1 * a2 * d2) / (a1 * d1), 2), feedback: `Isso ignora a mudança nas horas por dia (${b1} → ${b2}).` }] : []),
        ...(d1 !== d2 ? [{ value: round((P1 * a2 * b2) / (a1 * b1), 2), feedback: `Isso ignora a mudança no número de dias (${d1} → ${d2}).` }] : []),
        ...(a1 !== a2 ? [{ value: round((P1 * b2 * d2) / (b1 * d1), 2), feedback: `Isso ignora a mudança na quantidade (${a1} → ${a2}).` }] : []),
        { value: W2, feedback: `${W2} é o número de ${c.work} da nova situação. Multiplique pela produtividade (${num(rate, 2)} por ${c.work.replace(/s-/, '-')}).` },
      ],
      hints: [`Unidades de trabalho antes: ${a1} × ${b1} × ${d1} = ${W1} ${c.work}.`, `Produtividade: ${num(P1, 2)} ÷ ${W1} = ${num(rate, 2)}; agora calcule ${a2} × ${b2} × ${d2}.`],
      solution: [`$Antes: ${a1} × ${b1} × ${d1} = ${W1} ${c.work} → ${num(P1, 2)} ÷ ${W1} = ${num(rate, 2)}`, `$Agora: ${a2} × ${b2} × ${d2} = ${W2} → ${W2} × ${num(rate, 2)} = ${num(P2, 2)} ${c.unit}`],
    });
  }
}

interface SolveCtx {
  who: string;
  what: string;
  unit: string;
  rates: number[];
  given: (w: number, h: number, d: number, P: number) => string;
}

const SOLVE: SolveCtx[] = [
  { who: 'pedreiros', what: 'metros de muro', unit: 'm', rates: [0.25, 0.5, 1], given: (w, h, d, P) => `${w} pedreiros, trabalhando ${h} horas por dia, levantam ${num(P, 2)} m de muro em ${d} dias, todos no mesmo ritmo.` },
  { who: 'padeiros', what: 'pães', unit: 'pães', rates: [10, 12, 15, 20], given: (w, h, d, P) => `${w} padeiros, trabalhando ${h} horas por dia no mesmo ritmo, fazem ${num(P)} pães em ${d} dias.` },
  { who: 'digitadores', what: 'páginas', unit: 'páginas', rates: [5, 6, 8, 10], given: (w, h, d, P) => `${w} digitadores, trabalhando ${h} horas por dia no mesmo ritmo, digitam ${num(P)} páginas em ${d} dias.` },
];

/** A grandeza desconhecida é uma das de trabalho: quantos trabalhadores, horas por dia ou dias. */
function compoundSolveGen(r: Rand) {
  for (;;) {
    const c = r.pick(SOLVE);
    const rate = r.pick(c.rates);
    const [w1, h1, d1] = [r.int(3, 12), r.int(4, 10), r.int(2, 10)];
    const [w2, h2, d2] = [r.int(3, 15), r.int(4, 10), r.int(2, 12)];
    if ([w1 !== w2, h1 !== h2, d1 !== d2].filter(Boolean).length < 2) continue;
    if (w1 === 12 && h1 === 8 && d1 === 6) continue; // questão do banco (garis)
    const P1 = round(rate * w1 * h1 * d1, 2);
    const P2 = round(rate * w2 * h2 * d2, 2);
    if (P2 === P1) continue;
    const need = w2 * h2 * d2;
    const unknown = r.pick(['w', 'h', 'd'] as const);
    const fP = (v: number) => `${num(v, 2)} ${c.unit === 'm' ? 'm de muro' : c.what}`;
    let ask: string;
    let answer: number;
    let unit: string;
    let wrong: { value: number; feedback: string }[];
    if (unknown === 'w') {
      ask = `Quantos ${c.who} são necessários para fazer ${fP(P2)} em ${d2} dias, trabalhando ${h2} horas por dia?`;
      answer = w2;
      unit = c.who;
      wrong = [
        { value: round((w1 * (P2 / P1) * (d1 / d2) * h2) / h1, 2), feedback: `Isso trata as horas por dia como diretas: com MAIS horas por dia, bastam MENOS ${c.who}.` },
        { value: round((w1 * (P2 / P1) * (d2 / d1) * h1) / h2, 2), feedback: `Isso trata os dias como diretos: com MAIS dias de prazo, bastam MENOS ${c.who}.` },
        { value: need, feedback: `${need} é o trabalho necessário em ${c.who}-hora. Divida por dias × horas por dia (${d2} × ${h2}).` },
      ];
    } else if (unknown === 'h') {
      ask = `Quantas horas por dia ${w2} ${c.who} devem trabalhar para fazer ${fP(P2)} em ${d2} dias?`;
      answer = h2;
      unit = 'h por dia';
      wrong = [
        { value: round((h1 * (P2 / P1) * (w2 / w1) * d1) / d2, 2), feedback: `Isso trata o número de ${c.who} como direto: com MAIS ${c.who}, cada um trabalha MENOS horas.` },
        { value: round((h1 * (P2 / P1) * (w1 / w2) * d2) / d1, 2), feedback: 'Isso trata os dias como diretos: com MAIS dias de prazo, são MENOS horas por dia.' },
        { value: need, feedback: `${need} é o total de ${c.who}-hora necessário. Divida por ${w2} × ${d2}.` },
      ];
    } else {
      ask = `Em quantos dias ${w2} ${c.who}, trabalhando ${h2} horas por dia, fazem ${fP(P2)}?`;
      answer = d2;
      unit = 'dias';
      wrong = [
        { value: round((d1 * (P2 / P1) * (w2 / w1) * h1) / h2, 2), feedback: `Isso trata o número de ${c.who} como direto: com MAIS ${c.who}, o trabalho leva MENOS dias.` },
        { value: round((d1 * (P2 / P1) * (w1 / w2) * h2) / h1, 2), feedback: 'Isso trata as horas por dia como diretas: com MAIS horas por dia, são MENOS dias.' },
        { value: need, feedback: `${need} é o total de ${c.who}-hora necessário. Divida por ${w2} × ${h2}.` },
      ];
    }
    const others = unknown === 'w' ? `${d2} × ${h2}` : unknown === 'h' ? `${w2} × ${d2}` : `${w2} × ${h2}`;
    return draftNumeric({
      prompt: [p(c.given(w1, h1, d1, P1))],
      ask,
      unit,
      answer,
      wrong,
      hints: [`Produtividade: ${num(P1, 2)} ÷ (${w1} × ${h1} × ${d1}) = ${num(rate, 2)} por ${c.who.replace(/s$/, '')}-hora.`, `Trabalho necessário: ${num(P2, 2)} ÷ ${num(rate, 2)} = ${need}; divida por ${others}.`],
      solution: [`$Produtividade: ${num(P1, 2)} ÷ ${w1 * h1 * d1} = ${num(rate, 2)}`, `$Trabalho: ${num(P2, 2)} ÷ ${num(rate, 2)} = ${need} → ${need} ÷ (${others}) = ${answer}`],
    });
  }
}

/** Produtividade que muda (+p% ou −p%) junto com a equipe e a jornada. */
function productivityGen(r: Rand) {
  for (;;) {
    const change = r.pick([-25, -20, 20, 25, 50]);
    const f = 1 + change / 100;
    const rate = r.pick([4, 5, 6, 8, 10, 12]);
    const [w1, h1, d1] = [r.int(2, 8), r.int(4, 8), r.int(3, 8)];
    const [w2, h2] = [r.int(2, 10), r.int(4, 10)];
    const P1 = rate * w1 * h1 * d1;
    const askDays = r.next() < 0.5;
    if (askDays) {
      const d2 = r.int(2, 12);
      const P2 = rate * f * w2 * h2 * d2;
      if (!Number.isInteger(round(P2, 6))) continue;
      return draftNumeric({
        prompt: [p(`${w1} operários, ${h1} horas por dia, embalam ${num(P1)} caixas em ${d1} dias. Com uma nova máquina, a produtividade de cada operário (caixas por hora) ${change > 0 ? 'aumenta' : 'diminui'} ${Math.abs(change)}%.`)],
        ask: `Nessas condições, em quantos dias ${w2} operários, ${h2} horas por dia, embalam ${num(P2)} caixas?`,
        unit: 'dias',
        answer: d2,
        wrong: [
          { value: round(P2 / (rate * w2 * h2), 2), feedback: `Isso ignora a mudança de ${Math.abs(change)}% na produtividade.` },
          { value: round((P2 * f) / (rate * w2 * h2), 2), feedback: `A produtividade ${change > 0 ? 'maior' : 'menor'} foi aplicada ao contrário: ela ${change > 0 ? 'ENCURTA' : 'AUMENTA'} o prazo.` },
        ],
        hints: [`Produtividade antiga: ${num(P1)} ÷ (${w1} × ${h1} × ${d1}) = ${rate} caixas por operário-hora.`, `Nova: ${rate} × ${num(f, 2)} = ${num(rate * f, 2)}.`],
        solution: [`$Produtividade nova: ${rate} × ${num(f, 2)} = ${num(rate * f, 2)} por operário-hora`, `$Por dia: ${w2} × ${h2} × ${num(rate * f, 2)} = ${num(w2 * h2 * rate * f, 2)} → ${num(P2)} ÷ ${num(w2 * h2 * rate * f, 2)} = ${d2} dias`],
      });
    }
    const d2 = r.int(2, 10);
    const P2 = round(rate * f * w2 * h2 * d2, 2);
    return draftNumeric({
      prompt: [p(`${w1} equipes iguais instalam ${num(P1)} m de cabos em ${d1} dias, trabalhando ${h1} horas por dia. No próximo serviço, cada equipe terá produtividade por hora ${Math.abs(change)}% ${change > 0 ? 'maior' : 'menor'}.`)],
      ask: `Quantos metros de cabos ${w2} equipes instalam em ${d2} dias, trabalhando ${h2} horas por dia?`,
      unit: 'm',
      answer: P2,
      wrong: [
        { value: rate * w2 * h2 * d2, feedback: `Isso ignora a mudança de ${Math.abs(change)}% na produtividade.` },
        { value: round(rate * f * f * w2 * h2 * d2, 2), feedback: 'A mudança de produtividade foi aplicada duas vezes. Ela entra uma vez só, na produtividade por equipe-hora.' },
        { value: round(P1 * f, 2), feedback: 'Isso só aplica a mudança de produtividade à produção antiga; a equipe, os dias e as horas também mudaram.' },
      ],
      hints: [`Produtividade antiga: ${num(P1)} ÷ (${w1} × ${d1} × ${h1}) = ${rate} m por equipe-hora.`, `Nova: ${rate} × ${num(f, 2)}; multiplique por ${w2} × ${d2} × ${h2}.`],
      solution: [`$Produtividade nova: ${rate} × ${num(f, 2)} = ${num(rate * f, 2)} m por equipe-hora`, `$${w2} × ${d2} × ${h2} × ${num(rate * f, 2)} = ${num(P2, 2)} m`],
    });
  }
}

/** Caminhões, viagens por dia e dias — com a carga dada em sacas. */
function truckGen(r: Rand) {
  for (;;) {
    const [t1, v1, d1] = [r.int(3, 8), r.int(1, 3), r.int(3, 6)];
    const cap = r.pick([20, 25, 30, 40]); // toneladas por viagem
    const P1 = t1 * v1 * d1 * cap;
    const [v2, d2] = [r.int(2, 4), r.int(3, 8)];
    const sacks = r.pick([20000, 25000, 30000, 40000, 50000, 60000]);
    const tons = (sacks * 60) / 1000;
    const trips = tons / cap;
    const trucks = trips / (v2 * d2);
    if (Number.isInteger(round(trucks, 9)) || trucks < 2 || trucks > 30) continue;
    if (t1 === 5 && v1 === 2 && d1 === 4) continue; // questão do banco
    const answer = ceil(trucks);
    return draftNumeric({
      prompt: [p(`${t1} caminhões iguais, cada um fazendo ${v1} ${v1 === 1 ? 'viagem' : 'viagens'} por dia com carga completa, transportaram ${num(P1)} toneladas de grãos em ${d1} dias. Agora é preciso transportar ${num(sacks)} sacas de 60 kg em ${d2} dias, e cada caminhão fará ${v2} viagens por dia, também com carga completa (1 t = 1.000 kg).`)],
      ask: 'Quantos caminhões iguais a esses são necessários, no mínimo?',
      unit: 'caminhões',
      answer,
      wrong: [
        { value: floor(trucks), feedback: `Com ${floor(trucks)} caminhões não dá: a conta exata é ${num(trucks, 2)}. Para levar tudo, arredonde para CIMA.` },
        { value: round(trucks, 2), feedback: `${num(trucks, 2)} é o resultado exato, mas caminhões só existem inteiros: arredonde para cima.` },
        { value: ceil((tons / cap) / (v1 * d2)), feedback: `Isso usa ${v1} ${v1 === 1 ? 'viagem' : 'viagens'} por dia, como antes. Agora são ${v2} por caminhão.` },
      ],
      hints: [`Carga por viagem: ${num(P1)} ÷ (${t1} × ${v1} × ${d1}) = ${cap} t. Converta as sacas: ${num(sacks)} × 60 kg.`, `Viagens necessárias: ${num(tons)} ÷ ${cap}; divida por ${v2} × ${d2}.`],
      solution: [`$Por viagem: ${num(P1)} ÷ ${t1 * v1 * d1} = ${cap} t`, `$Carga: ${num(sacks)} × 60 = ${num(sacks * 60)} kg = ${num(tons)} t → ${num(trips, 2)} viagens`, `$${num(trips, 2)} ÷ (${v2} × ${d2}) = ${num(trucks, 2)} → ${answer} caminhões`],
    });
  }
}

/** Duas equipes com produtividades diferentes trabalhando juntas: somam-se as taxas. */
function teamsGen(r: Rand) {
  for (;;) {
    const rA = r.int(6, 20);
    const rB = r.int(4, 16);
    if (rA === rB) continue;
    const tA = r.int(3, 9);
    const tB = r.int(3, 9);
    if (tA === tB) continue;
    const A = rA * tA;
    const B = rB * tB;
    if (A === 96 && tA === 6 && B === 72 && tB === 8) continue; // questão do banco
    const together = rA + rB;
    const askTime = r.next() < 0.4;
    if (askTime) {
      const T = r.int(2, 10);
      const N = together * T;
      return draftNumeric({
        prompt: [p(`A equipe A monta ${A} cadeiras em ${tA} horas, e a equipe B monta ${B} cadeiras em ${tB} horas, cada uma no seu ritmo.`)],
        ask: `Trabalhando juntas, em quantas horas as duas montam ${N} cadeiras?`,
        unit: 'h',
        answer: T,
        wrong: [
          { value: round((N * (tA + tB)) / (A + B), 2), feedback: 'Somar as cadeiras e os tempos das duas equipes não dá a taxa conjunta. Some as TAXAS por hora.' },
          { value: round(N / rA, 2), feedback: `Isso usa só a equipe A (${rA} por hora). Juntas, são ${rA} + ${rB} = ${together} por hora.` },
        ],
        hints: [`Taxas: A faz ${A} ÷ ${tA} = ${rA} por hora; B faz ${B} ÷ ${tB} = ${rB} por hora.`, `Juntas: ${together} por hora.`],
        solution: [`$${rA} + ${rB} = ${together} cadeiras por hora`, `$${N} ÷ ${together} = ${T} h`],
      });
    }
    const T = r.int(2, 8);
    return draftNumeric({
      prompt: [p(`A equipe A restaura ${A} placas em ${tA} horas, e a equipe B restaura ${B} placas em ${tB} horas, cada uma no seu ritmo.`)],
      ask: `Trabalhando juntas durante ${T} horas, quantas placas as duas restauram?`,
      unit: 'placas',
      answer: together * T,
      wrong: [
        { value: round(((A + B) * T) / (tA + tB), 2), feedback: 'Somar as placas e os tempos das duas equipes não dá a taxa conjunta. Some as TAXAS por hora.' },
        { value: A + B, feedback: `${A + B} soma as produções em ${tA} h e ${tB} h. A pergunta é sobre ${T} h de trabalho conjunto.` },
        { value: rA * T, feedback: `Isso usa só a equipe A. Juntas, fazem ${rA} + ${rB} = ${together} por hora.` },
      ],
      hints: [`Taxas: A faz ${A} ÷ ${tA} = ${rA} por hora; B faz ${B} ÷ ${tB} = ${rB} por hora.`, `Juntas: ${together} por hora, durante ${T} h.`],
      solution: [`$${rA} + ${rB} = ${together} placas por hora`, `$${together} × ${T} = ${together * T} placas`],
    });
  }
}

/** Estoque com consumo por pessoa: estoque = pessoas × dias × consumo. */
function stockPersonGen(r: Rand) {
  for (;;) {
    const n1 = r.pick([40, 50, 60, 80, 90, 120]);
    const d1 = r.int(8, 20);
    const c1 = r.pick([400, 450, 500, 600, 750]);
    const n2 = r.pick([30, 45, 60, 75, 100, 150]);
    const c2 = r.pick([300, 400, 500, 600]);
    if (n1 === n2 && c1 === c2) continue;
    if (n1 === 80 && d1 === 15 && c1 === 600 && n2 === 100 && c2 === 500) continue; // questão do banco
    const S = n1 * d1 * c1; // gramas
    const d2 = S / (n2 * c2);
    if (!Number.isInteger(round(d2 * 10, 6))) continue;
    return draftNumeric({
      prompt: [p(`Um depósito guarda alimento para ${n1} pessoas durante ${d1} dias, com consumo de ${c1} g por pessoa por dia. Numa nova atividade, serão ${n2} pessoas, e o consumo passará a ${c2} g por pessoa por dia.`)],
      ask: 'Por quantos dias o mesmo estoque será suficiente?',
      unit: 'dias',
      answer: round(d2, 1),
      wrong: [
        { value: round((d1 * n1) / n2, 2), feedback: `Isso considera só a mudança no número de pessoas. O consumo por pessoa também mudou (${c1} g → ${c2} g).` },
        { value: round((d1 * c1) / c2, 2), feedback: `Isso considera só a mudança no consumo por pessoa. O número de pessoas também mudou (${n1} → ${n2}).` },
        { value: round((d1 * n2 * c1) / (n1 * c2), 2), feedback: 'Isso trata o número de pessoas como direto: com MAIS pessoas, o estoque dura MENOS.' },
      ],
      hints: [`Estoque: ${n1} × ${d1} × ${c1} g = ${num(S / 1000, 2)} kg.`, `Consumo diário novo: ${n2} × ${c2} g = ${num((n2 * c2) / 1000, 2)} kg.`],
      solution: [`$Estoque: ${n1} × ${d1} × ${c1} = ${num(S)} g`, `$Por dia: ${n2} × ${c2} = ${num(n2 * c2)} g → ${num(S)} ÷ ${num(n2 * c2)} = ${num(d2, 1)} dias`],
    });
  }
}

/** Tempo fixo de preparo no turno: dimensionar a equipe pelas horas que sobram. */
function prepCrewGen(r: Rand) {
  for (;;) {
    const H = r.int(6, 10);
    const prep = r.int(1, 3);
    const rate = r.pick([12, 15, 18, 20, 24, 25, 30]);
    const N = r.pick([500, 600, 720, 800, 900, 1000, 1200]);
    const exact = N / ((H - prep) * rate);
    if (Number.isInteger(round(exact, 9)) || ceil(exact) === ceil(N / (H * rate))) continue;
    if (N === 720 && H === 8 && prep === 2 && rate === 18) continue; // questão do banco
    const answer = ceil(exact);
    return draftNumeric({
      prompt: [p(`Um mutirão precisa embalar ${num(N)} cestas num turno de ${H} horas. ${prep === 1 ? 'A primeira hora será usada' : `As ${prep} primeiras horas serão usadas`} só para a organização de toda a equipe. Nas horas restantes, cada voluntário embala ${rate} cestas por hora.`)],
      ask: 'Qual é o menor número de voluntários para cumprir a meta no turno?',
      unit: 'voluntários',
      answer,
      wrong: [
        { value: ceil(N / (H * rate)), feedback: `Isso conta ${prep === 1 ? 'a hora' : `as ${prep} horas`} de organização como horas de trabalho. Sobram só ${H - prep} h produtivas.` },
        { value: floor(exact), feedback: `${floor(exact)} voluntários embalam só ${floor(exact) * (H - prep) * rate} cestas. Arredonde ${num(exact, 2)} para CIMA.` },
        { value: round(exact, 2), feedback: `${num(exact, 2)} é o resultado exato; voluntários são inteiros: arredonde para cima.` },
      ],
      hints: [`Horas produtivas: ${H} − ${prep} = ${H - prep}.`, `Cada voluntário embala ${H - prep} × ${rate} = ${(H - prep) * rate} cestas no turno.`],
      solution: [`$Por voluntário: ${H - prep} × ${rate} = ${(H - prep) * rate} cestas`, `$${num(N)} ÷ ${(H - prep) * rate} = ${num(exact, 2)} → ${answer} voluntários`],
    });
  }
}

/** Uma máquina quebra depois do primeiro dia e a jornada muda: quantos dias a mais? */
function midChangeGen(r: Rand) {
  for (;;) {
    const m1 = r.int(3, 6);
    const h1 = r.int(5, 8);
    const d1 = r.int(2, 4);
    const rate = r.pick([50, 60, 75, 100, 120, 150]);
    const P1 = m1 * h1 * d1 * rate;
    const Q = r.pick([10000, 12000, 15000, 18000, 20000, 24000]);
    const m2 = m1 - 1;
    const h2 = r.int(h1, 10);
    const first = m1 * h1 * rate;
    const rest = Q - first;
    const perDay = m2 * h2 * rate;
    const days = rest / perDay;
    if (rest <= perDay || Number.isInteger(round(days, 9)) || days > 12) continue;
    if (m1 === 4 && h1 === 5 && d1 === 3 && Q === 12000) continue; // questão do banco
    const answer = ceil(days);
    return draftNumeric({
      prompt: [p(`Uma gráfica tem ${m1} impressoras iguais que, funcionando ${h1} horas por dia, imprimem ${num(P1)} folhetos em ${d1} dias. Ela recebe um pedido de ${num(Q)} folhetos. No primeiro dia, as ${m1} impressoras trabalham normalmente (${h1} horas). No fim desse dia, uma impressora quebra, e as ${m2} restantes passam a trabalhar ${h2} horas por dia.`)],
      ask: 'Quantos dias de trabalho, além do primeiro, serão necessários para concluir o pedido?',
      unit: 'dias',
      answer,
      wrong: [
        { value: floor(days), feedback: `Em ${floor(days)} dias ainda faltariam folhetos (o exato é ${num(days, 2)}). Arredonde para CIMA.` },
        { value: ceil(Q / perDay), feedback: `Isso ignora os ${num(first)} folhetos do primeiro dia: depois dele, faltam só ${num(rest)}.` },
        { value: round(days, 2), feedback: `${num(days, 2)} é o resultado exato; a pergunta conta dias de trabalho inteiros.` },
      ],
      hints: [`Produtividade: ${num(P1)} ÷ (${m1} × ${h1} × ${d1}) = ${rate} folhetos por impressora-hora.`, `Primeiro dia: ${m1} × ${h1} × ${rate} = ${num(first)}; depois, ${m2} × ${h2} × ${rate} = ${num(perDay)} por dia.`],
      solution: [`$Produtividade: ${rate} por impressora-hora; 1º dia: ${num(first)} folhetos`, `$Faltam ${num(rest)}; por dia: ${num(perDay)} → ${num(days, 2)} → ${answer} dias`],
    });
  }
}

// ———————————————————————————————————————————————— aula

export const REGRA_DE_TRES_COMPOSTA = lesson({
  id: 'regra-de-tres-composta',
  topic: 'razao-proporcao',
  subtopics: ['regra-de-tres-composta'],
  title: 'Regra de três composta',
  summary:
    'Várias grandezas mudando ao mesmo tempo: a unidade de trabalho (máquina-hora, pessoa-hora-dia), o que é direto e o que é inverso, produtividade que muda, equipes que se somam e estoques que se dividem.',
  requires: ['regra-de-tres-inversa'],
  stages: [
    stage('unidade', 'descoberta', 'A unidade de trabalho', 'Juntar várias grandezas numa unidade de trabalho (máquina-hora, pessoa-hora) e calcular a produção quando várias delas mudam ao mesmo tempo.', () => ({
      learn: [
        text('Na **regra de três composta** há mais de duas grandezas. Um jeito seguro de resolver é usar uma **unidade de trabalho**: se 4 máquinas, 6 horas por dia, durante 5 dias, fazem 1.800 peças, elas trabalharam 4 × 6 × 5 = 120 máquinas-hora, e cada máquina-hora rende 1.800 ÷ 120 = 15 peças. Com 6 máquinas, 8 horas por dia, em 3 dias, são 144 máquinas-hora → 144 × 15 = 2.160 peças.'),
        lab({
          title: 'A fábrica',
          intro: 'Cada máquina produz 15 peças por hora. Escolha quantas máquinas, quantas horas por dia e quantos dias.',
          params: [
            { key: 'm', label: 'Máquinas', min: 1, max: 10, step: 1, value: 4, format: (v) => `${v}` },
            { key: 'h', label: 'Horas por dia', min: 2, max: 12, step: 1, value: 6, format: (v) => `${v} h` },
            { key: 'd', label: 'Dias', min: 1, max: 10, step: 1, value: 5, format: (v) => `${v}` },
          ],
          readouts: ({ m, h, d }) => [
            { label: 'Máquinas-hora', value: `${m} × ${h} × ${d} = ${m * h * d}` },
            { label: 'Produção', value: `${num(15 * m * h * d)} peças`, big: true, tone: 'brass' },
            { label: 'Peças por dia', value: num(15 * m * h) },
          ],
          viz: ({ m, h, d }) => ({
            kind: 'bars',
            bars: [{ label: 'Produção', value: 15 * m * h * d, text: `${num(15 * m * h * d)} peças`, tone: 'brass' }],
            max: 7200,
            refLine: { value: 3600, label: 'meta: 3.600' },
            summary: `${m} máquinas, ${h} h por dia, ${d} dias: ${num(15 * m * h * d)} peças`,
          }),
          goal: {
            task: 'Produza exatamente 3.600 peças em 4 dias.',
            done: ({ m, h, d }) => d === 4 && 15 * m * h * d === 3600,
            success: 'Isso: 3.600 ÷ 15 = 240 máquinas-hora, e em 4 dias são 60 por dia — 6 máquinas por 10 h, 10 máquinas por 6 h ou 5 máquinas por 12 h.',
          },
          insight: 'Máquinas e horas por dia se compensam: o que importa é o produto, as máquinas-hora.',
        }),
        key('Mais de duas grandezas', 'Produção = máquinas × horas por dia × dias × produtividade (peças por máquina-hora). Se a produtividade não muda, a produção é diretamente proporcional a cada uma das outras grandezas.'),
        example('Lâmpadas acesas', 'Duas lâmpadas iguais, acesas 6 horas por dia, gastam 7,2 kWh em 30 dias. Quanto gastam 5 dessas lâmpadas acesas 4 horas por dia durante 30 dias?', [
          step('Unidade de trabalho antes:', '2 × 6 × 30 = 360 lâmpadas-hora → 7,2 ÷ 360 = 0,02 kWh por lâmpada-hora'),
          askStep('Agora a nova situação.', 'Quantas lâmpadas-hora?', [
            ok('5 × 4 × 30 = 600'),
            no('5 + 4 + 30 = 39', 'As grandezas se MULTIPLICAM: cada lâmpada acesa por uma hora é uma lâmpada-hora.'),
          ]),
          step('Consumo:', '600 × 0,02 = 12 kWh'),
        ], 'As 5 lâmpadas gastam 12 kWh.'),
        warn('Não some as grandezas', 'Dobrar as máquinas E dobrar as horas por dia multiplica a produção por 4 (2 × 2), e não por "2 + 2".'),
        check(numeric({
          prompt: [p('Três costureiras, trabalhando 8 horas por dia, fazem 144 camisas em 4 dias, todas no mesmo ritmo.')],
          ask: 'Quantas camisas 5 costureiras fazem em 6 dias, trabalhando 6 horas por dia?',
          unit: 'camisas',
          answer: 270,
          wrong: [
            { value: 360, feedback: 'Isso ignora que as horas por dia caíram de 8 para 6.' },
            { value: 180, feedback: '180 é o número de costureiras-hora da nova situação. Cada uma produz 1,5 camisa.' },
            { value: 1.5, feedback: '1,5 camisa por costureira-hora é a produtividade. Multiplique por 5 × 6 × 6.' },
          ],
          solution: ['$Antes: 3 × 8 × 4 = 96 costureiras-hora → 144 ÷ 96 = 1,5', '$Agora: 5 × 6 × 6 = 180 → 180 × 1,5 = 270 camisas'],
        })),
      ],
      practice: [
        gen(compoundProdGen),
        numeric({
          prompt: [p('Dois fornos iguais assam 180 pães em 3 horas.')],
          ask: 'Quantos pães 5 desses fornos assam em 2 horas?',
          unit: 'pães',
          answer: 300,
          wrong: [
            { value: 450, feedback: 'Isso ignora que o tempo caiu de 3 para 2 horas.' },
            { value: 120, feedback: 'Isso ignora que agora são 5 fornos, e não 2.' },
            { value: 30, feedback: '30 pães por forno-hora é a produtividade. Multiplique por 5 × 2.' },
          ],
          hints: ['Fornos-hora antes: 2 × 3 = 6.', 'Produtividade: 180 ÷ 6 = 30 pães por forno-hora.'],
          solution: ['$180 ÷ (2 × 3) = 30 por forno-hora', '$5 × 2 × 30 = 300 pães'],
        }),
        select({
          prompt: [p('Uma fábrica quer saber quantas peças uma nova equipe de máquinas iguais produzirá.')],
          ask: 'Marque só os dados necessários para esse cálculo.',
          chips: [
            { text: 'Número de máquinas', needed: true },
            { text: 'Horas de funcionamento por dia', needed: true },
            { text: 'Número de dias', needed: true },
            { text: 'Peças por máquina-hora (ou um caso conhecido)', needed: true },
            { text: 'Cor das máquinas', needed: false, why: 'Não afeta a produção.' },
            { text: 'Nome do gerente do turno', needed: false, why: 'Não entra na unidade de trabalho.' },
          ],
          hints: ['Pense na unidade de trabalho: máquinas × horas × dias.', 'Falta saber quanto cada máquina-hora produz.'],
          solution: ['Produção = máquinas × horas por dia × dias × produtividade.'],
        }),
      ],
      challenge: [
        gen(compoundProdGen),
        numeric({
          prompt: [p('Seis máquinas iguais, funcionando 5 horas por dia, produzem 2.700 garrafas em 3 dias.')],
          ask: 'Quantas garrafas 4 dessas máquinas produzem em 5 dias, funcionando 9 horas por dia?',
          unit: 'garrafas',
          answer: 5400,
          wrong: [
            { value: 3000, feedback: 'Isso ignora que as horas por dia subiram de 5 para 9.' },
            { value: 180, feedback: '180 é o número de máquinas-hora da nova situação. Cada uma produz 30 garrafas.' },
            { value: 30, feedback: '30 garrafas por máquina-hora é a produtividade. Multiplique por 4 × 9 × 5.' },
          ],
          solution: ['$Antes: 6 × 5 × 3 = 90 máquinas-hora → 2.700 ÷ 90 = 30', '$Agora: 4 × 9 × 5 = 180 → 180 × 30 = 5.400 garrafas'],
        }),
      ],
      recap: [
        'Unidade de trabalho: máquinas × horas por dia × dias (ou pessoas × horas × dias).',
        'Produtividade = produção ÷ unidades de trabalho.',
        'Nova produção = novas unidades de trabalho × produtividade.',
        'As grandezas se multiplicam: não some.',
      ],
    })),

    stage('incognita', 'fundamentos', 'Descobrir o que falta: direta ou inversa?', 'Encontrar o número de trabalhadores, as horas por dia ou os dias necessários, decidindo para cada grandeza se ela é direta ou inversa em relação à incógnita.', () => ({
      learn: [
        text('Quando a incógnita é uma das grandezas de trabalho (quantos operários? quantos dias?), compare cada outra grandeza com ela: **mais produção exige mais operários** (direta); **mais dias de prazo exigem menos operários** (inversa); **mais horas por dia exigem menos operários** (inversa).'),
        data(table(['Grandeza', 'Em relação ao número de operários'], [['Produção a fazer', 'direta: mais produção, mais operários'], ['Dias de prazo', 'inversa: mais dias, menos operários'], ['Horas por dia', 'inversa: mais horas, menos operários'], ['Produtividade de cada um', 'inversa: mais produtivos, menos operários']])),
        lab({
          title: 'Mutirão de limpeza',
          intro: 'Cada gari varre 100 m de rua por hora. Escolha quantos km varrer, o prazo e a jornada: veja quantos garis são necessários.',
          params: [
            { key: 'km', label: 'Ruas a varrer', min: 6, max: 60, step: 3, value: 30, format: (v) => `${v} km` },
            { key: 'd', label: 'Prazo', min: 1, max: 10, step: 1, value: 5, format: (v) => `${v} dias` },
            { key: 'h', label: 'Jornada', min: 4, max: 10, step: 1, value: 6, format: (v) => `${v} h/dia` },
          ],
          readouts: ({ km, d, h }) => {
            const exact = (10 * km) / (d * h);
            return [
              { label: 'Garis-hora necessárias', value: `${km} ÷ 0,1 = ${num(10 * km)}` },
              { label: 'Garis (exato)', value: `${num(10 * km)} ÷ (${d} × ${h}) = ${num(exact, 2)}` },
              { label: 'Garis a convocar', value: `${ceil(exact)}`, big: true, tone: 'brass' },
            ];
          },
          goal: {
            task: 'Para varrer 48 km em 4 dias, ache a jornada diária que exige exatamente 15 garis.',
            done: ({ km, d, h }) => km === 48 && d === 4 && h === 8,
            success: 'Isso: 48 km exigem 480 garis-hora; em 4 dias de 8 h, cada gari faz 32 horas, e 480 ÷ 32 = 15 garis.',
          },
          insight: 'Aumentar o prazo ou a jornada reduz a equipe necessária: em relação aos garis, essas grandezas são inversas.',
        }),
        example('Quantas horas por dia?', 'Quatro padeiros, trabalhando 5 horas por dia, fazem 1.200 pães em 3 dias. Quantas horas por dia 6 padeiros devem trabalhar para fazer 1.920 pães em 2 dias?', [
          step('Produtividade:', '4 × 5 × 3 = 60 padeiros-hora → 1.200 ÷ 60 = 20 pães por padeiro-hora'),
          step('Trabalho da nova encomenda:', '1.920 ÷ 20 = 96 padeiros-hora'),
          askStep('Com 6 padeiros em 2 dias…', 'Quantas horas por dia?', [
            ok('96 ÷ (6 × 2) = 8 h'),
            no('96 × 6 × 2 = 1.152 h', 'Multiplicar dá mais horas do que cabem num dia: as horas por dia são o trabalho DIVIDIDO por padeiros e dias.'),
          ]),
        ], 'Eles devem trabalhar 8 horas por dia.'),
        key('Método da unidade', '1) produtividade = produção ÷ (pessoas × horas × dias); 2) trabalho necessário = nova produção ÷ produtividade; 3) grandeza desconhecida = trabalho necessário ÷ (produto das outras grandezas).'),
        tip('Método das setas', 'Também dá para montar a composta com setas: a incógnita com uma seta e cada grandeza com seta no mesmo sentido (direta) ou no oposto (inversa); inverta as razões das inversas e multiplique tudo. O método da unidade evita trocar os sentidos.'),
        check(numeric({
          prompt: [p('Cinco torneiras iguais enchem 2 tanques iguais em 6 horas.')],
          ask: 'Em quantas horas 3 dessas torneiras enchem 1 tanque?',
          unit: 'h',
          answer: 5,
          wrong: [
            { value: 10, feedback: 'Isso ignora que agora é 1 tanque, e não 2.' },
            { value: 1.8, feedback: 'Isso trata as torneiras como diretas: com MENOS torneiras, o tanque leva MAIS tempo.' },
            { value: 15, feedback: '15 torneiras-hora é o trabalho para 1 tanque. Divida pelas 3 torneiras.' },
          ],
          solution: ['$2 tanques: 5 × 6 = 30 torneiras-hora → 1 tanque: 15 torneiras-hora', '$Com 3 torneiras: 15 ÷ 3 = 5 h'],
        })),
      ],
      practice: [
        gen(compoundSolveGen),
        numeric({
          prompt: [p('Seis pintores, trabalhando 8 horas por dia, pintam 4 salas iguais em 5 dias.')],
          ask: 'Em quantos dias 8 pintores pintam 12 dessas salas, trabalhando 6 horas por dia?',
          unit: 'dias',
          answer: 15,
          wrong: [
            { value: 26.67, feedback: 'Isso trata os pintores e as horas como diretos: com MAIS pintores, o serviço leva MENOS dias.' },
            { value: 5, feedback: 'Isso ignora que agora são 12 salas, o triplo.' },
            { value: 720, feedback: '720 é o trabalho em pintores-hora. Divida por 8 × 6.' },
          ],
          hints: ['Trabalho por sala: 6 × 8 × 5 ÷ 4 = 60 pintores-hora.', 'Para 12 salas: 720 pintores-hora; divida por 8 pintores × 6 h.'],
          solution: ['$6 × 8 × 5 = 240 pintores-hora para 4 salas → 60 por sala', '$12 salas: 720 → 720 ÷ (8 × 6) = 15 dias'],
        }),
        classify({
          ask: 'A incógnita é o NÚMERO DE DIAS. Cada grandeza é direta ou inversa em relação a ela?',
          bins: ['Direta', 'Inversa'],
          items: [
            { text: 'Quantidade de peças a produzir', bin: 0 },
            { text: 'Número de máquinas', bin: 1 },
            { text: 'Horas de trabalho por dia', bin: 1 },
            { text: 'Peças por máquina-hora', bin: 1 },
          ],
          hints: ['Pergunte: se essa grandeza aumentar, o número de dias aumenta ou diminui?', 'Mais máquinas terminam em MENOS dias.'],
          solution: ['Só a produção é direta: mais peças, mais dias. Mais máquinas, horas ou produtividade encurtam o prazo.'],
        }),
      ],
      challenge: [
        gen(compoundSolveGen),
        gen(compoundSolveGen),
        numeric({
          prompt: [p('Oito pedreiros, trabalhando 6 horas por dia, levantaram 120 m de muro em 15 dias.')],
          ask: 'Quantos pedreiros levantam 200 m de muro em 10 dias, trabalhando 8 horas por dia?',
          unit: 'pedreiros',
          answer: 15,
          wrong: [
            { value: 20, feedback: 'Isso ignora que as horas por dia subiram de 6 para 8.' },
            { value: 26.67, feedback: 'Isso trata as horas por dia como diretas: com MAIS horas por dia, bastam MENOS pedreiros.' },
            { value: 1200, feedback: '1.200 é o trabalho em pedreiros-hora. Divida por 10 × 8.' },
          ],
          solution: ['$8 × 6 × 15 = 720 pedreiros-hora para 120 m → 6 por metro', '$200 m: 1.200 → 1.200 ÷ (10 × 8) = 15 pedreiros'],
        }),
      ],
      recap: [
        'Incógnita = trabalho necessário ÷ (produto das outras grandezas).',
        'Mais produção pede mais recursos (direta); mais prazo ou jornada pede menos recursos (inversa).',
        'Método da unidade: produtividade primeiro, depois a nova situação.',
      ],
    })),

    stage('ajustes', 'interpretacao', 'Produtividade, conversões e fatores', 'Ajustar a produtividade (+20%, −25%), aplicar taxas de aprovação, converter unidades no caminho (sacas, toneladas, área de faixas) e responder com fatores multiplicativos.', () => ({
      learn: [
        text('Se cada máquina passa a produzir 20% a mais por hora, a produtividade fica **× 1,2**; se os aparelhos novos gastam 25% menos energia, o consumo por aparelho-hora fica **× 0,75**. Esse fator entra na conta como mais uma grandeza.'),
        lab({
          title: 'Esteira nova',
          intro: 'Antes, 4 operários, 6 horas por dia, separavam 3 t de recicláveis em 5 dias (0,025 t por operário-hora). Uma esteira aumenta a produtividade. A meta é separar 6 t.',
          params: [
            { key: 'g', label: 'Aumento de produtividade', min: 0, max: 50, step: 5, value: 0, format: (v) => `+${v}%` },
            { key: 'w', label: 'Operários', min: 2, max: 10, step: 1, value: 4, format: (v) => `${v}` },
            { key: 'h', label: 'Horas por dia', min: 4, max: 10, step: 1, value: 6, format: (v) => `${v} h` },
          ],
          readouts: ({ g, w, h }) => {
            const rate = 0.025 * (1 + g / 100);
            const perDay = rate * w * h;
            return [
              { label: 'Produtividade', value: `${num(rate, 4)} t por operário-hora` },
              { label: 'Por dia', value: `${num(perDay, 3)} t` },
              { label: 'Dias para 6 t', value: num(6 / perDay, 2), big: true, tone: 'brass' },
            ];
          },
          goal: {
            task: 'Com 4 operários e 6 horas por dia, ache o aumento de produtividade que faz a meta sair em exatamente 8 dias.',
            done: ({ g, w, h }) => g === 25 && w === 4 && h === 6,
            success: 'Isso: sem a esteira seriam 10 dias (6 ÷ 0,6 t por dia); com +25%, 0,75 t por dia, e 6 ÷ 0,75 = 8 dias.',
          },
          insight: 'Aumentar a produtividade em 25% não corta o prazo em 25%: divide-o por 1,25 (de 10 para 8 dias, −20%).',
        }),
        key('Fator percentual', '+20% → × 1,2; −25% → × 0,75; aprovação de 80% → × 0,8. Multiplique a produtividade (ou a produção bruta) por esse fator.'),
        example('Peças aprovadas', 'Duas máquinas, em 4 horas, fizeram 288 peças aprovadas, e 90% da produção foi aprovada. Quantas peças aprovadas 3 máquinas iguais fazem em 5 horas se a aprovação cair para 80%?', [
          step('Produção bruta antes:', '288 ÷ 0,9 = 320 peças em 2 × 4 = 8 máquinas-hora → 40 por máquina-hora'),
          askStep('Nova produção bruta: 3 × 5 = 15 máquinas-hora → 600 peças.', 'Quantas são aprovadas?', [
            ok('600 × 0,8 = 480'),
            no('600 × 0,9 = 540', 'A aprovação caiu para 80%: use a taxa NOVA.'),
            no('288 × 15 ÷ 8 = 540', 'Isso escala as aprovadas antigas, que tinham 90% de aprovação; a nova taxa é 80%.'),
          ]),
        ], 'São esperadas 480 peças aprovadas.'),
        warn('Converta antes de comparar', 'Toneladas, sacas, metros quadrados de faixa: deixe tudo na mesma unidade. 35.000 sacas de 60 kg são 2.100.000 kg = 2.100 t. Uma faixa de 800 m por 2 m tem 1.600 m² de área.'),
        check(numeric({
          prompt: [p('Um projeto usou 5 câmeras durante 4 dias para gravar 200 vídeos de 6 minutos, com o mesmo tempo diário de uso por câmera. Agora serão 240 vídeos de 6 minutos, gravados por 6 câmeras durante 5 dias.')],
          ask: 'Por qual fator o tempo diário de uso de cada câmera deve ser multiplicado?',
          answer: 0.8,
          wrong: [
            { value: 1.2, feedback: '1,2 considera só o aumento dos vídeos (1.440 contra 1.200 minutos). Também há mais câmeras e mais dias.' },
            { value: 1.5, feedback: '1,5 é o aumento de câmeras-dia (30 contra 20). O fator compara o trabalho com os recursos: 1,2 ÷ 1,5.' },
            { value: 1.8, feedback: 'Multiplicar 1,2 por 1,5 trata as câmeras e os dias como diretos. Mais câmeras e dias REDUZEM o tempo de cada uma.' },
          ],
          solution: ['$Minutos de vídeo: 1.200 → 1.440 (× 1,2); câmeras-dia: 20 → 30 (× 1,5)', '$Fator: 1,2 ÷ 1,5 = 0,8'],
        })),
      ],
      practice: [
        gen(productivityGen),
        gen(truckGen),
        numeric({
          prompt: [p('Uma equipe de 6 operários, trabalhando 8 horas por dia, pinta em 5 dias uma faixa de 400 m de comprimento por 3 m de largura.')],
          ask: 'Que comprimento de faixa, com 2 m de largura, 8 operários pintam em 6 dias de 5 horas, no mesmo ritmo?',
          unit: 'm',
          answer: 600,
          wrong: [
            { value: 400, feedback: 'A área pintada é a mesma (1.200 m²), mas a faixa nova é mais estreita: 1.200 ÷ 2 = 600 m.' },
            { value: 1200, feedback: '1.200 é a ÁREA em m², não o comprimento. Divida pela largura de 2 m.' },
          ],
          hints: ['Área antes: 400 × 3 = 1.200 m² em 6 × 8 × 5 = 240 operários-hora.', 'Agora: 8 × 5 × 6 = 240 operários-hora — a mesma área.'],
          solution: ['$5 m² por operário-hora; nova equipe: 240 operários-hora → 1.200 m²', '$Comprimento: 1.200 ÷ 2 = 600 m'],
        }),
      ],
      challenge: [
        gen(productivityGen),
        gen(truckGen),
        numeric({
          prompt: [p('Duas equipes instalam 180 m de cerca em 3 dias, trabalhando 6 horas por dia. No próximo serviço, cada equipe terá produtividade por hora 25% maior, e serão 3 equipes, 4 dias, 5 horas por dia.')],
          ask: 'Quantos metros de cerca serão instalados?',
          unit: 'm',
          answer: 375,
          wrong: [
            { value: 300, feedback: 'Isso ignora o aumento de 25% na produtividade.' },
            { value: 225, feedback: 'Isso só aplica os 25% à produção antiga; as equipes, os dias e as horas também mudaram.' },
          ],
          solution: ['$Antes: 2 × 3 × 6 = 36 equipes-hora → 180 ÷ 36 = 5 m por equipe-hora', '$Agora: 5 × 1,25 = 6,25 m; 3 × 4 × 5 = 60 → 60 × 6,25 = 375 m'],
        }),
      ],
      recap: [
        'Mudança de produtividade = mais um fator (× 1,2; × 0,75).',
        'Aprovação e perdas: aplique a taxa NOVA à produção bruta.',
        'Converta unidades (sacas → kg → t; comprimento × largura → área) antes de comparar.',
        'Para achar um fator: aumento do trabalho ÷ aumento dos recursos.',
      ],
    })),

    stage('equipes', 'aplicacoes', 'Equipes, estoques e preparo', 'Juntar equipes de produtividades diferentes, calcular a duração de estoques com consumo por pessoa e descontar tempos fixos de preparo antes de dimensionar uma equipe.', () => ({
      learn: [
        text('Equipes diferentes trabalhando juntas **somam suas taxas**: se a equipe A faz 18 placas por hora e a B, 12, juntas fazem 30 por hora. Somar as produções ou os tempos, sem passar para "por hora", dá errado.'),
        lab({
          title: 'Duas equipes',
          intro: 'A equipe A restaura 90 placas em 5 horas; a equipe B, 84 placas em 7 horas. Escolha por quanto tempo elas trabalham juntas.',
          params: [{ key: 't', label: 'Tempo juntas', min: 1, max: 10, step: 1, value: 3, format: (v) => `${v} h` }],
          readouts: ({ t }) => [
            { label: 'Taxa de A', value: '90 ÷ 5 = 18 placas/h' },
            { label: 'Taxa de B', value: '84 ÷ 7 = 12 placas/h' },
            { label: 'Juntas', value: `30 × ${t} = ${30 * t} placas`, big: true, tone: 'brass' },
          ],
          viz: ({ t }) => ({
            kind: 'parts',
            segments: [
              { label: 'A', value: 18 * t, tone: 'sky' },
              { label: 'B', value: 12 * t, tone: 'verdigris' },
            ],
            summary: `Em ${t} h, A restaura ${18 * t} e B restaura ${12 * t} placas`,
          }),
          goal: {
            task: 'Ache o tempo de trabalho conjunto para restaurar exatamente 210 placas.',
            done: ({ t }) => t === 7,
            success: 'Isso: 210 ÷ 30 = 7 h. A faz 126 e B faz 84.',
          },
          insight: 'Juntas, as equipes somam as taxas por hora — cada uma no seu ritmo.',
        }),
        example('Estoque com consumo por pessoa', 'Um depósito tem alimento para 60 pessoas durante 20 dias, com 500 g por pessoa por dia. Se o grupo passar a 100 pessoas e o consumo a 400 g por pessoa por dia, quantos dias dura o estoque?', [
          step('Estoque:', '60 × 20 × 0,5 kg = 600 kg'),
          askStep('Consumo diário novo: 100 × 0,4 = 40 kg.', 'Quantos dias dura?', [
            ok('600 ÷ 40 = 15 dias'),
            no('20 × 60 ÷ 100 = 12 dias', 'Isso só considera o número de pessoas; o consumo por pessoa também caiu (de 500 g para 400 g).'),
          ]),
        ], 'O estoque dura 15 dias.'),
        key('Tempo fixo antes da produção', 'Se as 3 primeiras horas de um turno de 9 h são de preparo, só sobram 6 h produtivas. Dimensione a equipe por essas horas — e arredonde para cima: 5,4 pessoas viram 6.'),
        check(numeric({
          prompt: [p('A equipe A monta 40 cadeiras em 5 horas, e a equipe B monta 45 cadeiras em 9 horas, cada uma no seu ritmo.')],
          ask: 'Trabalhando juntas por 6 horas, quantas cadeiras montam?',
          unit: 'cadeiras',
          answer: 78,
          wrong: [
            { value: 36.43, feedback: 'Somar as cadeiras e os tempos (85 em 14 h) não dá a taxa conjunta. Some as TAXAS: 8 + 5 = 13 por hora.' },
            { value: 85, feedback: '85 soma as produções em 5 h e 9 h. A pergunta é sobre 6 h juntas.' },
            { value: 48, feedback: '48 é só a equipe A (8 por hora × 6). Some a equipe B.' },
          ],
          solution: ['$A: 40 ÷ 5 = 8 por hora; B: 45 ÷ 9 = 5 por hora', '$Juntas: 13 × 6 = 78 cadeiras'],
        })),
      ],
      practice: [gen(teamsGen), gen(stockPersonGen), gen(prepCrewGen)],
      challenge: [
        gen(teamsGen),
        gen(stockPersonGen),
        gen(prepCrewGen),
        numeric({
          prompt: [p('Um mutirão precisa embalar 1.000 cestas num turno de 6 horas. A primeira hora é só de organização. Nas horas restantes, cada voluntário embala 24 cestas por hora.')],
          ask: 'Qual é o menor número de voluntários para cumprir a meta?',
          unit: 'voluntários',
          answer: 9,
          wrong: [
            { value: 8, feedback: '8 voluntários embalam 960 cestas. Arredonde 8,33 para CIMA.' },
            { value: 7, feedback: 'Isso conta a hora de organização como hora de trabalho. Sobram só 5 h produtivas.' },
            { value: 8.33, feedback: '8,33 é o resultado exato; voluntários são inteiros: arredonde para cima.' },
          ],
          solution: ['$Por voluntário: 5 × 24 = 120 cestas', '$1.000 ÷ 120 ≈ 8,33 → 9 voluntários'],
        }),
      ],
      recap: [
        'Equipes juntas: some as TAXAS por hora, não os tempos.',
        'Estoque = pessoas × dias × consumo por pessoa; duração nova = estoque ÷ novo consumo diário.',
        'Desconte o preparo antes de dividir o trabalho; arredonde equipes para cima.',
      ],
    })),

    stage('maestria', 'maestria', 'Maestria: compostas com mudanças no caminho', 'Resolver problemas compostos de várias etapas: máquinas que quebram, jornadas que mudam e reforços com outra produtividade.', () => ({
      learn: [
        strategy('Quebre em etapas', '1) Calcule a produtividade (por máquina-hora ou pessoa-hora). 2) Desconte o que já foi feito. 3) Para o restante, monte a nova situação. 4) Arredonde só no fim, para o lado que a pergunta exige.'),
        example('A máquina que quebrou', 'Três máquinas, 8 horas por dia, fazem 7.200 peças em 2 dias. Um pedido de 15.000 peças começa com as 3 máquinas por um dia de 8 h; depois, uma quebra, e as 2 restantes trabalham 10 horas por dia. Quantos dias, além do primeiro, são necessários?', [
          step('Produtividade:', '7.200 ÷ (3 × 8 × 2) = 150 peças por máquina-hora'),
          step('Primeiro dia:', '3 × 8 × 150 = 3.600 peças → faltam 11.400'),
          askStep('Depois: 2 × 10 × 150 = 3.000 peças por dia, e 11.400 ÷ 3.000 = 3,8.', 'Quantos dias além do primeiro?', [
            ok('4 dias (arredondar para cima)'),
            no('3 dias', 'Em 3 dias saem 9.000 peças, e faltam 11.400: é preciso um 4º dia.'),
            no('5 dias (15.000 ÷ 3.000)', 'Isso ignora as 3.600 peças já feitas no primeiro dia.'),
          ]),
        ], 'São 4 dias além do primeiro.'),
        reveal('Por que arredondar só no fim?', 'Porque os arredondamentos intermediários se acumulam: arredondar a produtividade de 37,5 para 38 peças por hora numa conta de 300 horas muda a produção em 150 peças.'),
        check(numeric({
          prompt: [p('Uma encomenda exige 600 horas-máquina das máquinas originais. Três máquinas originais trabalham 8 h no primeiro dia; depois, duas delas trabalham 8 h por dia durante mais 10 dias. Para cumprir esse prazo, serão alugadas máquinas com produtividade por hora 25% maior, todas trabalhando 8 h em cada um desses 10 dias.')],
          ask: 'Qual é o menor número de máquinas a alugar?',
          unit: 'máquinas',
          answer: 5,
          wrong: [
            { value: 4, feedback: '4 máquinas alugadas rendem 400 das 416 horas-máquina que faltam. Arredonde 4,16 para CIMA.' },
            { value: 6, feedback: 'Isso ignora os 25% a mais: cada alugada rende 8 × 10 × 1,25 = 100 horas-máquina, e não 80.' },
            { value: 4.16, feedback: '4,16 é o resultado exato; máquinas são inteiras: arredonde para cima.' },
          ],
          solution: ['$Feito: 3 × 8 = 24 no 1º dia; 2 × 8 × 10 = 160 depois → 184', '$Faltam 600 − 184 = 416; cada alugada: 8 × 10 × 1,25 = 100 → 4,16 → 5 máquinas'],
        })),
      ],
      practice: [
        gen(midChangeGen),
        numeric({
          prompt: [p('Cinco aparelhos de iluminação antigos gastam 60 kWh em 12 horas de uso. Os aparelhos novos gastam 20% menos por aparelho por hora.')],
          ask: 'Quanto gastam 8 aparelhos novos durante 10 horas?',
          unit: 'kWh',
          answer: 64,
          wrong: [
            { value: 80, feedback: '80 kWh é o consumo com aparelhos ANTIGOS. Os novos gastam 20% menos: × 0,8.' },
            { value: 96, feedback: 'Isso aplica 20% a MAIS. Os novos gastam 20% MENOS: × 0,8.' },
            { value: 51.2, feedback: 'A economia de 20% foi aplicada duas vezes. Ela entra uma vez, no consumo por aparelho-hora.' },
          ],
          hints: ['Antes: 60 ÷ (5 × 12) = 1 kWh por aparelho-hora.', 'Novos: 1 × 0,8 = 0,8 kWh por aparelho-hora.'],
          solution: ['$Antigos: 60 ÷ 60 = 1 kWh por aparelho-hora; novos: 0,8', '$8 × 10 × 0,8 = 64 kWh'],
        }),
        gen(productivityGen),
      ],
      challenge: [
        numeric({
          prompt: [p('Oito operários, 6 horas por dia, embalam 2.880 caixas em 5 dias. Com uma máquina nova, a produtividade de cada operário aumenta 50%.')],
          ask: 'Em quantos dias 6 operários, 8 horas por dia, embalam 4.320 caixas?',
          unit: 'dias',
          answer: 5,
          wrong: [
            { value: 7.5, feedback: 'Isso ignora o aumento de 50% na produtividade.' },
            { value: 3.33, feedback: 'O aumento de 50% foi aplicado duas vezes. Ele entra uma vez, na produtividade por operário-hora.' },
          ],
          solution: ['$Antes: 2.880 ÷ (8 × 6 × 5) = 12 caixas por operário-hora; agora 12 × 1,5 = 18', '$4.320 ÷ 18 = 240 operários-hora → 240 ÷ (6 × 8) = 5 dias'],
        }),
        numeric({
          prompt: [p('Uma obra exige 900 horas-homem no ritmo normal. Cinco pedreiros trabalham 6 h no primeiro dia; depois, quatro deles seguem 8 h por dia durante mais 12 dias. Para terminar nesse prazo, serão chamados ajudantes com produtividade 20% MENOR, trabalhando 8 h por dia nesses 12 dias.')],
          ask: 'Qual é o menor número de ajudantes necessário?',
          unit: 'ajudantes',
          answer: 7,
          wrong: [
            { value: 6, feedback: '6 ajudantes rendem 460,8 das 486 horas-homem que faltam. Arredonde 6,33 para CIMA.' },
            { value: 5.06, feedback: 'Isso ignora que os ajudantes rendem 20% menos (8 × 12 × 0,8 = 76,8 cada).' },
          ],
          solution: ['$Feito: 5 × 6 = 30; 4 × 8 × 12 = 384 → 414; faltam 486', '$Cada ajudante: 8 × 12 × 0,8 = 76,8 → 486 ÷ 76,8 ≈ 6,33 → 7 ajudantes'],
        }),
        gen(midChangeGen),
        gen(teamsGen),
      ],
      recap: [
        'Calcule a produtividade, desconte o feito e monte a situação restante.',
        'Reforços com outra produtividade: multiplique as horas deles pelo fator (1,25; 0,8).',
        'Arredonde só no fim: equipes e dias para cima.',
      ],
    })),
  ],
});
