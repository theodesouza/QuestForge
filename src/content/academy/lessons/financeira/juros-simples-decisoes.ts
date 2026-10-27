/**
 * Aula: Juros simples — comparar e decidir. Total pago com tarifas, rendimento líquido e
 * parcelas de crediário; pontos de empate (tarifa máxima, menor prazo, capital que iguala,
 * quando uma dívida passa outra); custo efetivo (tarifa retida, juros cobrados no ato) e
 * impostos sobre os juros; dividir um capital entre aplicações.
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
  no,
  numeric,
  ok,
  p,
  reveal,
  stage,
  step,
  strategy,
  table,
  text,
} from '../../kit/build';
import { brl, num, pct, round } from '../../kit/format';
import type { Rand } from '../../types';

const isInt = (x: number) => Number.isInteger(round(x, 9));
const dec = (i: number) => num(i / 100, 5);

const WHO = ['Uma cooperativa', 'Uma associação de bairro', 'Uma escola de dança', 'Um coletivo de artistas', 'Uma família'];

// ———————————————————————————————————————————————— geradores: comparar propostas

/** Três propostas de empréstimo com taxas, prazos e tarifas: a de menor total. */
function proposalsGen(r: Rand) {
  for (;;) {
    const C = r.pick([2000, 3000, 4000, 6000, 8000, 10000]);
    const offers = ['Banco', 'Financeira', 'Cooperativa'].map((name) => ({
      name,
      i: r.pick([1, 1.2, 1.4, 1.5, 1.6, 1.8, 2, 2.2, 2.4, 2.5, 3]),
      t: r.pick([3, 4, 5, 6, 8, 10, 12]),
      fee: r.pick([0, 0, 30, 50, 60, 80, 100, 120, 150]),
    }));
    const totals = offers.map((o) => round(C * (1 + (o.i * o.t) / 100) + o.fee, 6));
    if (!totals.every((x) => isInt(x * 100))) continue;
    const best = Math.min(...totals);
    if (totals.filter((x) => x - best < 10).length > 1) continue;
    const iBest = totals.indexOf(best);
    const minRate = offers.reduce((acc, o) => (o.i < acc.i ? o : acc), offers[0]);
    const noFee = offers.map((o) => C * (1 + (o.i * o.t) / 100));
    const iNoFee = noFee.indexOf(Math.min(...noFee));
    return draftNumeric({
      prompt: [
        p(`${r.pick(WHO)} precisa de ${brl(C)} e recebeu três propostas de empréstimo, todas a juros simples e com quitação num pagamento único ao fim do prazo. A tarifa é paga junto com a quitação.`),
        table(['Instituição', 'Taxa de juros simples', 'Prazo', 'Tarifa'], offers.map((o) => [o.name, `${pct(o.i)} ao mês`, `${o.t} meses`, brl(o.fee)])),
      ],
      ask: 'Escolhendo a proposta de menor valor total pago (valor emprestado, juros e tarifa), quanto será pago?',
      prefix: 'R$',
      answer: best,
      wrong: [
        ...(offers[iBest].fee > 0 ? [{ value: round(noFee[iBest], 2), feedback: `Isso esquece a tarifa de ${brl(offers[iBest].fee)}, paga junto com a quitação.` }] : []),
        ...(iNoFee !== iBest ? [{ value: totals[iNoFee], feedback: 'Sem a tarifa, essa proposta pareceria a mais barata; com a tarifa, o total dela é maior.' }] : []),
        ...(minRate.name !== offers[iBest].name ? [{ value: totals[offers.indexOf(minRate)], feedback: 'A menor taxa não garante o menor total: o prazo e a tarifa também contam.' }] : []),
        ...totals.filter((_, k) => k !== iBest).map((x) => ({ value: x, feedback: 'Esse é o total de outra proposta, que não é a menor.' })),
      ],
      hints: ['Para cada proposta: total = valor emprestado × (1 + i · t) + tarifa.', 'Compare os três totais.'],
      solution: offers.map((o, k) => `$${o.name}: ${num(C)} × (1 + ${dec(o.i)} × ${o.t}) + ${num(o.fee)} = ${num(totals[k], 2)}`),
    });
  }
}

/** Duas aplicações: uma com taxa maior e tarifa no resgate. Quanto a melhor rende a mais? */
function netYieldGen(r: Rand) {
  for (;;) {
    const C = r.pick([2000, 3000, 4000, 5000, 6000, 8000, 10000]);
    const t = r.pick([3, 4, 5, 6, 8, 10, 12]);
    const a = r.pick([0.6, 0.8, 0.9, 1]);
    const b = round(a + r.pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.5]), 2);
    const F = r.pick([20, 30, 40, 50, 60, 80, 100]);
    if (C === 5000 && t === 4 && a === 1 && b === 1.2 && F === 30) continue; // questão do banco
    const JA = (C * a * t) / 100;
    const JB = (C * b * t) / 100;
    if (!isInt(JA * 100) || !isInt(JB * 100)) continue;
    const netB = JB - F;
    const diff = round(Math.abs(netB - JA), 2);
    if (diff < 1) continue;
    return draftNumeric({
      prompt: [p(`Para aplicar ${brl(C)} por ${t} meses, há duas opções de juros simples: a primeira rende ${pct(a)} ao mês, sem custos; a segunda rende ${pct(b)} ao mês, mas desconta uma tarifa única de ${brl(F)} no resgate.`)],
      ask: 'Escolhendo a opção de maior rendimento líquido, quanto ela rende a mais que a outra?',
      prefix: 'R$',
      answer: diff,
      wrong: [
        { value: round(JB - JA, 2), feedback: 'Isso compara só os juros. A tarifa reduz o rendimento da segunda opção.' },
        { value: F, feedback: 'Esse é o valor da tarifa, e não a diferença entre os rendimentos líquidos.' },
        { value: round(Math.max(JA, netB), 2), feedback: 'Esse é o rendimento líquido da melhor opção. A pergunta é a diferença entre as duas.' },
      ],
      hints: [`1ª opção: ${num(C)} × ${dec(a)} × ${t} = ${brl(JA)}.`, `2ª opção: ${num(C)} × ${dec(b)} × ${t} − ${num(F)}.`],
      solution: [`$1ª: ${num(JA, 2)}; 2ª: ${num(JB, 2)} − ${num(F)} = ${num(netB, 2)}`, `$Diferença: ${num(diff, 2)}`],
    });
  }
}

/** Menor número inteiro de meses para o rendimento cobrir (ou superar) a tarifa. */
function feeCoverGen(r: Rand) {
  for (;;) {
    const C = r.pick([1200, 1500, 2000, 2400, 3000, 4000, 5000]);
    const i = r.pick([0.5, 0.6, 0.75, 0.8, 1, 1.2]);
    const F = r.pick([20, 25, 30, 36, 40, 45, 50, 60, 75, 90]);
    if (C === 2400 && i === 0.8 && F === 36) continue; // questão do banco
    const per = (C * i) / 100;
    const exact = F / per;
    const strict = r.next() < 0.5;
    const n = strict ? Math.floor(exact + 1e-9) + 1 : Math.ceil(exact - 1e-9);
    if (n < 2 || n > 24) continue;
    const whole = isInt(exact);
    return draftNumeric({
      prompt: [p(`Uma aplicação de ${brl(C)} rende juros simples de ${pct(i)} ao mês. No resgate, a instituição cobra uma tarifa única de ${brl(F)}, sem outros descontos.`)],
      ask: strict ? 'Qual é o menor número inteiro de meses para que o rendimento SUPERE a tarifa?' : 'Qual é o menor número inteiro de meses para que o rendimento cubra a tarifa (seja pelo menos igual a ela)?',
      unit: 'meses',
      answer: n,
      wrong: [
        ...(strict && whole ? [{ value: exact, feedback: `Com ${num(exact)} meses, o rendimento só IGUALA a tarifa. Para superá-la, é preciso mais um mês.` }] : []),
        ...(!whole ? [{ value: Math.floor(exact), feedback: `Com ${Math.floor(exact)} meses, o rendimento (${brl(per * Math.floor(exact))}) ainda não chega à tarifa.` }] : []),
        { value: n + 1, feedback: `Com ${n} meses já ${strict ? 'se supera' : 'se cobre'} a tarifa: ${n} × ${brl(per)} = ${brl(per * n)}.` },
      ],
      hints: [`Rendimento de cada mês: ${pct(i)} de ${brl(C)} = ${brl(per)}.`, `Quantos meses de ${brl(per)} ${strict ? 'passam de' : 'chegam a'} ${brl(F)}?`],
      solution: [`$${num(F)} ÷ ${num(per, 2)} = ${num(exact, 3)} → ${n} meses`],
    });
  }
}

const ITEMS = ['um sofá', 'uma geladeira', 'um notebook', 'uma bicicleta elétrica'];

/** Crediário: preço à vista + juros simples, dividido em parcelas iguais. */
function crediarioGen(r: Rand) {
  for (;;) {
    const P = r.pick([600, 900, 1200, 1500, 2000, 2400, 3000, 3600]);
    const i = r.pick([1, 1.5, 2, 2.5, 3, 4]);
    const n = r.pick([3, 4, 5, 6, 8, 10, 12]);
    if (P === 1800 && i === 2.5 && n === 6) continue; // questão do banco
    const total = P * (1 + (i * n) / 100);
    const parc = total / n;
    if (!isInt(parc * 100) || !isInt(total * 100)) continue;
    return draftNumeric({
      prompt: [p(`Uma loja vende ${r.pick(ITEMS)} por ${brl(P)} à vista. No crediário, o total a prazo é o preço à vista acrescido de juros simples de ${pct(i)} ao mês durante ${n} meses, e esse total é dividido em ${n} parcelas mensais iguais.`)],
      ask: 'Qual é o valor de cada parcela?',
      prefix: 'R$',
      answer: round(parc, 2),
      wrong: [
        { value: round(P / n, 2), feedback: `${brl(P / n)} divide só o preço à vista: falta incluir os juros no total.` },
        { value: round(total, 2), feedback: `${brl(total)} é o total a prazo. Ele é dividido em ${n} parcelas.` },
        { value: round(P / n + (P * i * n) / 100, 2), feedback: `Isso põe todos os juros (${brl((P * i * n) / 100)}) em cada parcela. Os juros entram no total, que é dividido por ${n}.` },
        { value: round((P / n) * (1 + i / 100), 2), feedback: `Isso cobra só um mês de juros. São juros de ${n} meses sobre o preço à vista, divididos pelas parcelas.` },
      ],
      hints: [`Juros: ${num(P)} × ${dec(i)} × ${n} = ${brl((P * i * n) / 100)}.`, `Total: ${brl(total)}; divida por ${n}.`],
      solution: [`$Total: ${num(P)} × (1 + ${dec(i)} × ${n}) = ${num(total, 2)}`, `$Parcela: ${num(total, 2)} ÷ ${n} = ${num(parc, 2)}`],
    });
  }
}

// ———————————————————————————————————————————————— geradores: pontos de empate

/** Maior tarifa para que uma proposta não fique mais cara que a outra. */
function maxFeeGen(r: Rand) {
  for (;;) {
    const C = r.pick([5000, 8000, 10000, 12000, 15000, 20000, 25000]);
    const i1 = r.pick([1.8, 2, 2.1, 2.2, 2.4, 2.5, 3]);
    const t1 = r.pick([6, 8, 10, 12]);
    const i2 = r.pick([1.2, 1.4, 1.5, 1.6, 1.8]);
    const t2 = r.pick([8, 10, 12, 15]);
    const J1 = (C * i1 * t1) / 100;
    const J2 = (C * i2 * t2) / 100;
    const F = round(J1 - J2, 6);
    if (F < 20 || !isInt(F * 100) || !isInt(J1 * 100) || !isInt(J2 * 100)) continue;
    return draftNumeric({
      prompt: [
        p(`Para pegar ${brl(C)} emprestados, há duas propostas de juros simples, com quitação num pagamento único ao fim do prazo:`),
        table(['Proposta', 'Taxa de juros simples', 'Prazo', 'Tarifa'], [['Banco', `${pct(i1)} ao mês`, `${t1} meses`, 'Não cobra'], ['Cooperativa', `${pct(i2)} ao mês`, `${t2} meses`, 'Valor fixo, pago na quitação']]),
      ],
      ask: 'Qual é o maior valor da tarifa da cooperativa para que o total pago a ela não seja maior que o total pago ao banco?',
      prefix: 'R$',
      answer: round(F, 2),
      wrong: [
        { value: round(J1, 2), feedback: `${brl(J1)} são os juros do banco. A tarifa pode ser, no máximo, a diferença entre os juros das duas propostas.` },
        { value: round(J2, 2), feedback: `${brl(J2)} são os juros da cooperativa. A tarifa máxima é o quanto eles ficam abaixo dos juros do banco.` },
        { value: round((C * (i1 - i2) * t1) / 100, 2), feedback: 'Isso compara as taxas usando um só prazo. As propostas têm prazos diferentes: calcule os juros de cada uma.' },
      ],
      hints: [`Juros do banco: ${num(C)} × ${dec(i1)} × ${t1} = ${brl(J1)}.`, `Juros da cooperativa: ${num(C)} × ${dec(i2)} × ${t2} = ${brl(J2)}.`],
      solution: [`$Tarifa máxima: ${num(J1, 2)} − ${num(J2, 2)} = ${num(F, 2)}`],
    });
  }
}

/** Menor prazo inteiro para a aplicação com tarifa render, líquido, mais que a sem tarifa. */
function breakEvenTimeGen(r: Rand) {
  for (;;) {
    const C = r.pick([2000, 3000, 4000, 5000, 8000, 10000]);
    const a = r.pick([0.6, 0.8, 0.9, 1]);
    const b = round(a + r.pick([0.2, 0.25, 0.3, 0.4, 0.5, 0.6]), 2);
    const F = r.pick([60, 80, 90, 100, 120, 150, 180, 200, 240, 270]);
    const gain = (C * (b - a)) / 100;
    const exact = F / gain;
    const n = Math.floor(exact + 1e-9) + 1;
    if (n < 2 || n > 36) continue;
    const whole = isInt(exact);
    return draftNumeric({
      prompt: [p(`Para aplicar ${brl(C)} a juros simples, há duas opções: a aplicação X rende ${pct(a)} ao mês, sem custos; a aplicação Y rende ${pct(b)} ao mês, mas cobra ${brl(F)} no resgate. O prazo será um número inteiro de meses.`)],
      ask: 'Qual é o menor prazo para o qual a aplicação Y rende, líquido, mais que a X?',
      unit: 'meses',
      answer: n,
      wrong: [
        ...(whole ? [{ value: exact, feedback: `Com ${num(exact)} meses, as duas EMPATAM. Para Y render mais, é preciso mais um mês.` }] : [{ value: Math.floor(exact), feedback: `Com ${Math.floor(exact)} meses, Y ainda rende menos que X: a vantagem mensal (${brl(gain)}) ainda não pagou a tarifa.` }]),
        { value: Math.floor(F / ((C * b) / 100) + 1e-9) + 1, feedback: 'Isso compara a tarifa com os juros inteiros de Y, esquecendo que X também rende no mesmo prazo.' },
      ],
      hints: [`A cada mês, Y rende ${brl(gain)} a mais que X.`, `Y passa X quando ${num(gain, 2)} × t > ${num(F)}.`],
      solution: [`$${num(gain, 2)} × t > ${num(F)} → t > ${num(exact, 3)} → ${n} meses`],
    });
  }
}

/** Capital que iguala os rendimentos líquidos de dois fundos. */
function capitalEqualGen(r: Rand) {
  for (;;) {
    const t = r.pick([2, 3, 4, 5, 6, 8, 10, 12]);
    const a = r.pick([1, 1.2, 1.25, 1.5]);
    const b = r.pick([0.5, 0.6, 0.75, 0.8, 0.9]);
    const F = r.pick([8, 10, 12, 15, 18, 20, 24, 30, 36, 40, 48, 60]);
    if (a <= b || (a === 1 && b === 0.8 && t === 3 && F === 12)) continue; // questão do banco
    const C = F / (((a - b) / 100) * t);
    if (!isInt(C) || C < 500 || C > 50000) continue;
    const Cr = round(C, 2);
    return draftNumeric({
      prompt: [p(`Para uma aplicação de ${t} meses, o fundo Alfa rende juros simples de ${pct(a)} ao mês e cobra tarifa de ${brl(F)} no resgate; o fundo Beta rende ${pct(b)} ao mês, sem tarifa. O capital aplicado será o mesmo nos dois.`)],
      ask: 'Qual capital faz os rendimentos líquidos dos dois fundos serem iguais?',
      prefix: 'R$',
      answer: Cr,
      wrong: [
        { value: round(F / ((a / 100) * t), 2), feedback: 'Isso compara a tarifa com o rendimento inteiro do Alfa, sem descontar o que o Beta rende.' },
        { value: round(F / ((a - b) / 100), 2), feedback: `Isso esquece o prazo: a vantagem do Alfa acumula por ${t} meses.` },
      ],
      hints: [`Rendimentos líquidos: Alfa = C × ${dec(a)} × ${t} − ${num(F)}; Beta = C × ${dec(b)} × ${t}.`, `Iguale: C × ${num(((a - b) / 100) * t, 5)} = ${num(F)}.`],
      solution: [`$C × (${dec(a)} − ${dec(b)}) × ${t} = ${num(F)}`, `$C = ${num(F)} ÷ ${num(((a - b) / 100) * t, 5)} = ${num(Cr)}`],
    });
  }
}

/** Quando a dívida menor, com taxa maior, passa a ser a maior. */
function overtakeGen(r: Rand) {
  for (;;) {
    const A0 = r.pick([1000, 1500, 2000, 2500, 3000]);
    const B0 = A0 + r.pick([60, 80, 100, 120, 150, 200, 300]);
    const a = r.pick([1, 1.2, 1.5, 2]);
    const b = r.pick([0.5, 0.6, 0.8, 1]);
    if (a <= b || (A0 === 2000 && B0 === 2080 && a === 1 && b === 0.5)) continue; // questão do banco
    const ga = (A0 * a) / 100;
    const gb = (B0 * b) / 100;
    if (ga <= gb) continue;
    const exact = (B0 - A0) / (ga - gb);
    const n = Math.floor(exact + 1e-9) + 1;
    if (n < 2 || n > 60) continue;
    const whole = isInt(exact);
    return draftNumeric({
      prompt: [p(`Duas dívidas crescem a juros simples mensais, sem pagamentos: a dívida A começa em ${brl(A0)} e cobra ${pct(a)} ao mês; a dívida B começa em ${brl(B0)} e cobra ${pct(b)} ao mês.`)],
      ask: 'Após quantos meses inteiros, no mínimo, a dívida A passa a ser maior que a B?',
      unit: 'meses',
      answer: n,
      wrong: [
        ...(whole ? [{ value: exact, feedback: `Em ${num(exact)} meses, as dívidas EMPATAM. Para A ser maior, é preciso mais um mês.` }] : [{ value: Math.floor(exact), feedback: `Em ${Math.floor(exact)} meses, A ainda é menor que B.` }]),
        { value: Math.floor((B0 - A0) / ((A0 * (a - b)) / 100) + 1e-9) + 1, feedback: `Isso calcula os juros das duas sobre ${brl(A0)}. A dívida B cresce ${pct(b)} de ${brl(B0)}.` },
      ],
      hints: [`A cresce ${brl(ga)} por mês; B cresce ${brl(gb)}.`, `A diferença inicial (${brl(B0 - A0)}) diminui ${brl(ga - gb)} por mês.`],
      solution: [`$${num(A0)} + ${num(ga, 2)}t > ${num(B0)} + ${num(gb, 2)}t → t > ${num(exact, 3)} → ${n} meses`],
    });
  }
}

/** Menor prazo inteiro para o ganho líquido de imposto atingir uma meta. */
function netTargetGen(r: Rand) {
  for (;;) {
    const C = r.pick([4000, 5000, 6000, 8000, 10000, 12000]);
    const i = r.pick([0.5, 0.6, 0.75, 0.8, 1]);
    const tax = r.pick([15, 20, 22.5]);
    const target = r.pick([200, 250, 300, 350, 400, 450, 500, 600]);
    if (C === 8000 && i === 0.75 && tax === 20 && target === 350) continue; // questão do banco
    const per = (C * i) / 100;
    const perNet = per * (1 - tax / 100);
    const exact = target / perNet;
    const n = Math.ceil(exact - 1e-9);
    if (n < 2 || n > 36 || isInt(exact)) continue;
    const gross = Math.ceil(target / per - 1e-9);
    return draftNumeric({
      prompt: [p(`${r.pick(WHO)} aplica ${brl(C)} a juros simples de ${pct(i)} ao mês. No resgate, retém-se imposto de ${pct(tax)} somente sobre os juros; não há outros encargos.`)],
      ask: `Qual é o menor prazo inteiro, em meses, para o ganho líquido atingir pelo menos ${brl(target)}?`,
      unit: 'meses',
      answer: n,
      wrong: [
        ...(gross !== n ? [{ value: gross, feedback: `Isso esquece o imposto: com ${gross} meses, os juros brutos passam de ${brl(target)}, mas o líquido não.` }] : []),
        { value: Math.floor(exact), feedback: `Com ${Math.floor(exact)} meses, o ganho líquido (${brl(perNet * Math.floor(exact))}) ainda não chega a ${brl(target)}.` },
      ],
      hints: [`Juros líquidos de cada mês: ${brl(per)} × ${num(1 - tax / 100, 3)} = ${brl(perNet)}.`, `Quantos meses de ${brl(perNet)} chegam a ${brl(target)}?`],
      solution: [`$${num(target)} ÷ ${num(perNet, 2)} = ${num(exact, 3)} → ${n} meses`],
    });
  }
}

// ———————————————————————————————————————————————— geradores: custo efetivo

/** Custo total de um crédito (juros + tarifa) em porcentagem do valor recebido. */
function costPctGen(r: Rand) {
  for (;;) {
    const C = r.pick([1000, 1200, 1500, 2000, 2500, 3000, 4000]);
    const i = r.pick([0.8, 1, 1.2, 1.5, 2]);
    const t = r.pick([3, 4, 5, 6]);
    const F = r.pick([15, 20, 25, 30, 40, 50]);
    if (C === 1500 && i === 1 && t === 4 && F === 20) continue; // questão do banco
    const J = (C * i * t) / 100;
    const cost = J + F;
    const ans = round((cost / C) * 100, 2);
    return draftNumeric({
      prompt: [p(`Um estudante pega ${brl(C)} a juros simples de ${pct(i)} ao mês por ${t} meses. No pagamento final, além do valor emprestado e dos juros, paga uma tarifa fixa de ${brl(F)}.`)],
      ask: 'Qual é o custo total do crédito, em porcentagem do valor recebido? Arredonde a duas casas decimais.',
      unit: '%',
      answer: ans,
      wrong: [
        { value: round(i * t, 2), feedback: `${pct(i * t)} conta só os juros. A tarifa de ${brl(F)} também é custo do crédito.` },
        { value: i, feedback: `${pct(i)} é a taxa de um mês. O custo total soma ${t} meses de juros e a tarifa.` },
        { value: round(100 + ans, 2), feedback: 'Esse é o total pago em relação ao valor recebido. O custo é só o que se paga a mais.' },
        { value: round((cost / (C + cost)) * 100, 2), feedback: 'Isso divide o custo pelo total pago. A base é o valor recebido.' },
      ],
      hints: [`Juros: ${num(C)} × ${dec(i)} × ${t} = ${brl(J)}; some a tarifa.`, `Custo ÷ ${num(C)}.`],
      solution: [`$Custo: ${num(J, 2)} + ${num(F)} = ${num(cost, 2)}`, `$${num(cost, 2)} ÷ ${num(C)} ≈ ${pct(ans)}`],
    });
  }
}

/** Tarifa retida na liberação: o custo efetivo é sobre o que se recebe de fato. */
function retainedFeeGen(r: Rand) {
  for (;;) {
    const N = r.pick([1000, 1500, 2000, 2500, 3000, 4000, 5000]);
    const R = r.pick([20, 30, 40, 50, 60, 80, 100]);
    const i = r.pick([0.8, 1, 1.2, 1.5, 2]);
    const t = r.pick([2, 3, 4, 5, 6]);
    if (N === 3000 && R === 60 && i === 1 && t === 4) continue; // questão do banco
    if (R >= N * 0.05) continue;
    const got = N - R;
    const J = (N * i * t) / 100;
    const cost = J + R;
    const ans = round((cost / got) * 100, 2);
    return draftNumeric({
      prompt: [p(`Uma financeira registra um empréstimo de ${brl(N)}, mas retém ${brl(R)} de tarifa na liberação. Após ${t} meses, cobra os ${brl(N)} e mais juros simples de ${pct(i)} ao mês sobre o valor registrado. Não há outras cobranças.`)],
      ask: 'Qual é o custo total do crédito, em porcentagem do dinheiro efetivamente recebido? Arredonde a duas casas decimais.',
      unit: '%',
      answer: ans,
      wrong: [
        { value: round((cost / N) * 100, 2), feedback: `Isso compara com o valor registrado. O dinheiro que chegou às mãos foi ${brl(got)}.` },
        { value: round(i * t, 2), feedback: `${pct(i * t)} conta só os juros anunciados. A tarifa retida também é custo, e o valor recebido é menor.` },
        { value: round((J / got) * 100, 2), feedback: `Isso esquece a tarifa retida (${brl(R)}), que também é custo do crédito.` },
        { value: round(100 + ans, 2), feedback: 'Esse é o total pago em relação ao valor recebido. O custo é só o que se paga a mais.' },
      ],
      hints: [`Recebido: ${brl(N)} − ${brl(R)} = ${brl(got)}.`, `Pago no fim: ${brl(N + J)}; custo = pago − recebido.`],
      solution: [`$Custo: ${num(N + J, 2)} − ${num(got)} = ${num(cost, 2)}`, `$${num(cost, 2)} ÷ ${num(got)} ≈ ${pct(ans)}`],
    });
  }
}

/** Juros descontados no ato × empréstimo comum da mesma quantia. */
function discountUpfrontGen(r: Rand) {
  for (;;) {
    const N = r.pick([5000, 8000, 10000, 12000, 20000]);
    const i = r.pick([2, 2.5, 3, 4]);
    const t = r.pick([3, 4, 5, 6]);
    const j = r.pick([2.5, 3, 3.5, 4, 4.5, 5]);
    if (N === 15000 && i === 4 && t === 5 && j === 4.8) continue; // questão do banco
    if (i * t >= 30) continue;
    const got = N * (1 - (i * t) / 100);
    const bank = got * (1 + (j * t) / 100);
    const diff = round(Math.abs(N - bank), 2);
    if (diff < 10 || !isInt(got) || !isInt(bank * 100)) continue;
    return draftNumeric({
      prompt: [
        p('Uma confecção precisa de capital de giro e recebeu duas propostas, sem tarifas:'),
        table(['Proposta', 'Como funciona'], [
          ['Financeira', `A confecção assina uma dívida de ${brl(N)}, a pagar daqui a ${t} meses. A financeira calcula juros simples de ${pct(i)} ao mês sobre esses ${brl(N)}, pelos ${t} meses, e os desconta no ato, entregando só o restante.`],
          ['Banco', `Empresta hoje exatamente a quantia que a financeira entregaria, a juros simples de ${pct(j)} ao mês; valor e juros são pagos juntos daqui a ${t} meses.`],
        ]),
      ],
      ask: `Escolhendo a proposta de menor custo, quanto a confecção pagará a menos, daqui a ${t} meses, em relação à outra?`,
      prefix: 'R$',
      answer: diff,
      wrong: [
        { value: round((N * i * t) / 100, 2), feedback: `${brl((N * i * t) / 100)} são os juros descontados pela financeira. Compare os pagamentos finais: ${brl(N)} e o do banco.` },
        { value: round((got * j * t) / 100, 2), feedback: 'Esses são os juros do banco. A pergunta é a diferença entre os dois pagamentos finais.' },
        { value: round((N * Math.abs(i - j) * t) / 100, 2), feedback: `Isso aplica as duas taxas sobre ${brl(N)}. O banco empresta só o valor entregue pela financeira (${brl(got)}).` },
      ],
      hints: [`A financeira entrega ${brl(N)} − ${brl((N * i * t) / 100)} = ${brl(got)} e cobra ${brl(N)} no fim.`, `O banco cobra ${brl(got)} × (1 + ${dec(j)} × ${t}).`],
      solution: [`$Banco: ${num(got)} × ${num(1 + (j * t) / 100, 4)} = ${num(bank, 2)}`, `$Diferença: |${num(N)} − ${num(bank, 2)}| = ${num(diff, 2)}`],
    });
  }
}

/** Valor contratado que deixa um líquido depois da tarifa retida; pagamento final com juros. */
function nominalGen(r: Rand) {
  for (;;) {
    const R = r.pick([2000, 2500, 3000, 4000, 5000, 6000]);
    const F = r.pick([40, 50, 60, 80, 100, 120, 150]);
    const i = r.pick([1, 1.5, 2, 2.5]);
    const t = r.pick([2, 3, 4, 5, 6]);
    if (R === 4000 && F === 100 && i === 1 && t === 5) continue; // questão do banco
    const pay = (R + F) * (1 + (i * t) / 100);
    if (!isInt(pay * 100)) continue;
    return draftNumeric({
      prompt: [p(`Uma produtora precisa receber ${brl(R)} líquidos hoje. O contrato retém uma tarifa fixa de ${brl(F)} na liberação e cobra juros simples de ${pct(i)} ao mês, por ${t} meses, sobre o valor contratado — que deve ser suficiente para sobrarem os ${brl(R)} depois da retenção.`)],
      ask: 'Qual será o pagamento único ao fim do prazo?',
      prefix: 'R$',
      answer: round(pay, 2),
      wrong: [
        { value: round(R * (1 + (i * t) / 100), 2), feedback: `Isso esquece a tarifa: o valor contratado precisa ser ${brl(R + F)}.` },
        { value: round(R * (1 + (i * t) / 100) + F, 2), feedback: `Isso soma a tarifa no fim. Ela entra no valor contratado, que rende juros: ${brl(R + F)} × (1 + ${dec(i)} × ${t}).` },
        { value: R + F, feedback: `${brl(R + F)} é o valor contratado. Faltam os juros de ${t} meses.` },
      ],
      hints: [`Valor contratado: ${brl(R)} + ${brl(F)} = ${brl(R + F)}.`, `Pagamento: ${brl(R + F)} × (1 + ${dec(i)} × ${t}).`],
      solution: [`$Contratado: ${num(R)} + ${num(F)} = ${num(R + F)}`, `$Pagamento: ${num(R + F)} × ${num(1 + (i * t) / 100, 4)} = ${num(pay, 2)}`],
    });
  }
}

const IR = [
  { upTo: 180, rate: 22.5 },
  { upTo: 360, rate: 20 },
  { upTo: 720, rate: 17.5 },
  { upTo: Infinity, rate: 15 },
];

/** CDB com imposto regressivo × aplicação isenta. */
function taxNetGen(r: Rand) {
  for (;;) {
    const C = r.pick([5000, 8000, 10000, 12000, 20000]);
    const months = r.pick([4, 5, 6, 8, 10, 12, 15, 18, 24, 30]);
    const days = months * 30;
    const i1 = r.pick([0.8, 0.9, 1, 1.1, 1.2]);
    const i2 = r.pick([0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9]);
    if (i2 >= i1 || (C === 12000 && months === 10 && i1 === 0.9 && i2 === 0.75)) continue; // questão do banco
    const k = IR.findIndex((b) => days <= b.upTo);
    const rate = IR[k].rate;
    const J1 = (C * i1 * months) / 100;
    const net1 = J1 * (1 - rate / 100);
    const J2 = (C * i2 * months) / 100;
    if (Math.abs(net1 - J2) < 5 || !isInt(net1 * 100) || !isInt(J2 * 100)) continue;
    const best = Math.max(net1, J2);
    const other = Math.min(net1, J2);
    const wrongRate = IR[k === 0 ? 1 : k - 1].rate;
    return draftNumeric({
      prompt: [
        p(`Uma pessoa tem ${brl(C)} para aplicar por ${months} meses (${days} dias). O CDB paga ${pct(i1)} ao mês, mas sobre os juros incide imposto de renda conforme a tabela; a LCI paga ${pct(i2)} ao mês e é isenta de imposto para pessoas físicas. Considere juros simples e nenhum outro custo.`),
        table(['Prazo da aplicação', 'Alíquota sobre os juros'], [['Até 180 dias', '22,5%'], ['De 181 a 360 dias', '20%'], ['De 361 a 720 dias', '17,5%'], ['Acima de 720 dias', '15%']]),
      ],
      ask: 'Escolhendo a aplicação de maior rendimento líquido (juros menos imposto), qual é esse rendimento?',
      prefix: 'R$',
      answer: round(best, 2),
      wrong: [
        { value: round(J1, 2), feedback: `${brl(J1)} é o rendimento BRUTO do CDB. Desconte o imposto de ${pct(rate)} sobre os juros.` },
        { value: round(other, 2), feedback: 'Esse é o rendimento líquido da outra aplicação, que é menor.' },
        { value: round(J1 * (1 - wrongRate / 100), 2), feedback: `Isso usa a alíquota de ${pct(wrongRate)}. ${days} dias caem na faixa de ${pct(rate)}.` },
        { value: round(J2 * (1 - rate / 100), 2), feedback: 'A LCI é isenta: não se desconta imposto dos juros dela.' },
      ],
      hints: [`${days} dias: alíquota de ${pct(rate)}. CDB líquido: ${brl(J1)} × ${num(1 - rate / 100, 3)}.`, `LCI: ${num(C)} × ${dec(i2)} × ${months}, sem imposto.`],
      solution: [`$CDB: ${num(J1, 2)} × ${num(1 - rate / 100, 3)} = ${num(net1, 2)}`, `$LCI: ${num(J2, 2)}`, `$Maior: ${num(best, 2)}`],
    });
  }
}

/** Juros mensais com desconto sobre cada pagamento, usados para uma despesa fixa. */
function interestDiscountGen(r: Rand) {
  for (;;) {
    const C = r.pick([5000, 8000, 10000, 12000, 15000, 20000]);
    const i = r.pick([0.5, 0.6, 0.75, 0.8, 1]);
    const d = r.pick([15, 20, 22.5, 25]);
    const E = r.pick([20, 30, 40, 50, 60, 80]);
    if (C === 10000 && i === 0.8 && d === 25 && E === 50) continue; // questão do banco
    const gross = (C * i) / 100;
    const net = gross * (1 - d / 100);
    const left = round(net - E, 2);
    if (left <= 0 || !isInt(net * 100)) continue;
    return draftNumeric({
      prompt: [p(`Uma associação mantém ${brl(C)} numa aplicação que paga, todo mês, juros simples de ${pct(i)}, sem reinvesti-los. Um desconto de ${pct(d)} incide somente sobre cada pagamento de juros. A associação usa esses pagamentos para uma despesa de ${brl(E)} por mês.`)],
      ask: 'Quanto dos juros líquidos sobra por mês, depois dessa despesa?',
      prefix: 'R$',
      answer: left,
      wrong: [
        { value: round(gross - E, 2), feedback: `Isso esquece o desconto de ${pct(d)} sobre os juros.` },
        { value: round(net, 2), feedback: `${brl(net)} são os juros líquidos do mês. Falta pagar a despesa de ${brl(E)}.` },
        { value: round(gross * (d / 100) - E, 2), feedback: `Isso fica com só ${pct(d)} dos juros. O desconto TIRA ${pct(d)}; sobram ${pct(100 - d)}.` },
      ].filter((w) => w.value > 0),
      hints: [`Juros do mês: ${pct(i)} de ${brl(C)} = ${brl(gross)}.`, `Líquidos: ${brl(gross)} × ${num(1 - d / 100, 3)}; depois, tire a despesa.`],
      solution: [`$Líquidos: ${num(gross, 2)} × ${num(1 - d / 100, 3)} = ${num(net, 2)}`, `$Sobra: ${num(net, 2)} − ${num(E)} = ${num(left, 2)}`],
    });
  }
}

// ———————————————————————————————————————————————— geradores: dividir o capital

/** Total aplicado em duas taxas e juros totais conhecidos: quanto foi para cada uma. */
function splitTwoGen(r: Rand) {
  for (;;) {
    const T = r.pick([10000, 12000, 15000, 20000, 25000, 30000]);
    const pr = r.pick([0.5, 0.6, 0.8, 1]);
    const q = r.pick([0.9, 1, 1.2, 1.5]);
    const t = r.pick([4, 5, 6, 8, 10, 12]);
    if (q <= pr || (T === 20000 && pr === 0.8 && q === 1.2 && t === 10)) continue; // questão do banco
    const x = r.pick([0.2, 0.25, 0.3, 0.4, 0.6, 0.75]) * T;
    const J = ((x * pr + (T - x) * q) * t) / 100;
    if (!isInt(J * 100) || !isInt(x)) continue;
    const Q = T - x;
    return draftNumeric({
      prompt: [p(`${r.pick(WHO)} dividiu ${brl(T)} entre duas aplicações de juros simples: uma parte foi para a aplicação P, com ${pct(pr)} ao mês, e o restante para a Q, com ${pct(q)} ao mês. Após ${t} meses, as duas renderam juntas ${brl(J)}.`)],
      ask: 'Quanto foi investido na aplicação Q?',
      prefix: 'R$',
      answer: Q,
      wrong: [
        { value: x, feedback: `${brl(x)} é a parte da aplicação P. A Q recebeu o restante: ${brl(T)} − ${brl(x)}.` },
        { value: T / 2, feedback: `Com metade em cada uma, os juros seriam ${brl(((T / 2) * (pr + q) * t) / 100)}, e não ${brl(J)}.` },
        { value: round(J / ((q / 100) * t), 2), feedback: `Isso supõe que todo o rendimento veio da Q. A parte em P também rendeu ${pct(pr)} ao mês.` },
      ],
      hints: [`Com Q = x: juros = (${num(T)} − x) × ${dec(pr)} × ${t} + x × ${dec(q)} × ${t}.`, `Iguale a ${num(J)} e isole x.`],
      solution: [`$(${num(T)} − x) × ${num((pr * t) / 100, 4)} + x × ${num((q * t) / 100, 4)} = ${num(J)}`, `$${num(((q - pr) * t) / 100, 4)} x = ${num(J - (T * pr * t) / 100, 2)} → x = ${num(Q)}`],
    });
  }
}

/** Dividir um valor para que duas partes, por prazos diferentes, resgatem o mesmo montante. */
function equalRedeemGen(r: Rand) {
  for (;;) {
    const rate = r.pick([4, 5, 6, 8, 10]);
    const ta = r.pick([6, 8, 10, 12]);
    const tb = r.pick([1, 2, 3, 4, 5]);
    if (tb >= ta || (rate === 5 && ta === 8 && tb === 4)) continue; // questão do banco
    const fa = 1 + (rate * ta) / 100;
    const fb = 1 + (rate * tb) / 100;
    const T = r.pick([10000, 12000, 15000, 18000, 20000, 24000, 30000]);
    const x = (T * fb) / (fa + fb);
    if (!isInt(x * 100)) continue;
    const M = x * fa;
    return draftNumeric({
      prompt: [p(`Uma família recebeu ${brl(T)} e vai dividir todo o valor entre duas crianças. Cada parte será aplicada hoje a juros simples de ${pct(rate)} ao ano e resgatada quando a criança completar 18 anos: a parte da mais nova ficará aplicada por ${ta} anos, e a da mais velha, por ${tb} ${tb === 1 ? 'ano' : 'anos'}. As duas devem resgatar exatamente o mesmo valor.`)],
      ask: 'Quanto deve ser aplicado hoje em nome da criança mais nova?',
      prefix: 'R$',
      answer: round(x, 2),
      wrong: [
        { value: T / 2, feedback: 'Dividir ao meio dá resgates diferentes: a parte que fica mais tempo rende mais e precisa ser menor.' },
        { value: round(T - x, 2), feedback: 'Essa é a parte da criança mais velha, que fica menos tempo aplicada e por isso precisa ser maior.' },
        { value: round((T * tb) / (ta + tb), 2), feedback: 'Dividir na proporção inversa dos prazos não iguala os montantes: o capital também conta. Iguale x × (1 + i · tₐ) = (T − x) × (1 + i · t_b).' },
      ],
      hints: [`Montantes: x × ${num(fa, 3)} e (${num(T)} − x) × ${num(fb, 3)}.`, 'Iguale os dois montantes e isole x.'],
      solution: [`$${num(fa, 3)} x = ${num(fb, 3)} × (${num(T)} − x)`, `$${num(fa + fb, 3)} x = ${num(T * fb, 2)} → x = ${num(x, 2)}`, `$Cada resgate: ${num(M, 2)}`],
    });
  }
}

/** Rendimento conjunto de duas partes com taxas diferentes. */
function jointYieldGen(r: Rand) {
  for (;;) {
    const T = r.pick([4000, 5000, 6000, 8000, 9000, 10000, 12000]);
    const A = r.pick([0.25, 0.4, 0.5, 0.6, 0.75]) * T;
    const a = r.pick([0.5, 0.6, 0.7, 0.8]);
    const b = r.pick([0.9, 1, 1.1, 1.2]);
    const t = r.pick([3, 4, 5, 6, 8]);
    if (!isInt(A) || (T === 6000 && A === 2000 && a === 0.6 && b === 0.9 && t === 5)) continue; // questão do banco
    const J = ((A * a + (T - A) * b) * t) / 100;
    if (!isInt(J * 100)) continue;
    return draftNumeric({
      prompt: [p(`${r.pick(WHO)} dividiu ${brl(T)} entre dois fundos de juros simples, por ${t} meses: ${brl(A)} rendem ${pct(a)} ao mês, e o restante rende ${pct(b)} ao mês. Não há tarifas.`)],
      ask: 'Qual é o rendimento conjunto dos dois fundos?',
      prefix: 'R$',
      answer: round(J, 2),
      wrong: [
        { value: round((T * ((a + b) / 2) * t) / 100, 2), feedback: 'Isso aplica a média das taxas ao total. As partes têm tamanhos diferentes: calcule os juros de cada uma.' },
        { value: round((T * b * t) / 100, 2), feedback: `Isso aplica ${pct(b)} ao total. Só ${brl(T - A)} rendem essa taxa.` },
        { value: round((A * a * t) / 100, 2), feedback: `Esses são só os juros dos ${brl(A)}. Falta somar os do restante.` },
      ],
      hints: [`1º fundo: ${num(A)} × ${dec(a)} × ${t}.`, `2º fundo: ${num(T - A)} × ${dec(b)} × ${t}.`],
      solution: [`$${num((A * a * t) / 100, 2)} + ${num(((T - A) * b * t) / 100, 2)} = ${num(J, 2)}`],
    });
  }
}

/** Quanto pôr em cada taxa para obter um total de juros. */
function targetSplitGen(r: Rand) {
  for (;;) {
    const T = r.pick([5000, 6000, 8000, 10000, 12000, 15000]);
    const a = r.pick([1, 1.2, 1.5]);
    const b = r.pick([0.5, 0.6, 0.8]);
    const t = r.pick([3, 4, 5, 6, 8]);
    const x = r.pick([0.2, 0.25, 0.4, 0.5, 0.6, 0.75, 0.8]) * T;
    if (T === 10000 && a === 1 && b === 0.5 && t === 6) continue; // questão do banco
    const J = ((x * a + (T - x) * b) * t) / 100;
    if (!isInt(J * 100) || !isInt(x)) continue;
    return draftNumeric({
      prompt: [p(`${r.pick(WHO)} dispõe de ${brl(T)} para aplicar por ${t} meses. Uma parte renderá juros simples de ${pct(a)} ao mês, e o restante, ${pct(b)} ao mês. Deseja receber exatamente ${brl(J)} de juros ao todo.`)],
      ask: `Quanto deve aplicar a ${pct(a)} ao mês?`,
      prefix: 'R$',
      answer: x,
      wrong: [
        { value: T - x, feedback: `${brl(T - x)} é o que vai para a taxa de ${pct(b)}. A pergunta é a parte a ${pct(a)}.` },
        { value: round(J / ((a / 100) * t), 2), feedback: `Isso supõe que todo o rendimento vem da parte a ${pct(a)}. A outra parte também rende.` },
        { value: T / 2, feedback: `Com metade em cada taxa, os juros seriam ${brl(((T / 2) * (a + b) * t) / 100)}.` },
      ],
      hints: [`Juros = x × ${dec(a)} × ${t} + (${num(T)} − x) × ${dec(b)} × ${t}.`, `Iguale a ${num(J)} e isole x.`],
      solution: [`$${num((a * t) / 100, 4)} x + ${num((b * t) / 100, 4)} × (${num(T)} − x) = ${num(J, 2)}`, `$${num(((a - b) * t) / 100, 4)} x = ${num(J - (T * b * t) / 100, 2)} → x = ${num(x)}`],
    });
  }
}

// ———————————————————————————————————————————————— aula

export const JUROS_SIMPLES_DECISOES = lesson({
  id: 'juros-simples-decisoes',
  topic: 'financeira',
  subtopics: ['juros-simples'],
  title: 'Juros simples: comparar e decidir',
  summary:
    'Decisões com juros simples: o total de cada proposta com tarifas, os pontos de empate, o custo efetivo de juros cobrados na frente e de tarifas retidas, impostos sobre os juros e a divisão de um capital entre aplicações.',
  requires: ['juros-simples'],
  stages: [
    stage('propostas', 'fundamentos', 'Comparar propostas', 'Comparar propostas de crédito e de aplicação somando juros, tarifas e prazos, e calcular parcelas de um crediário com juros simples.', () => ({
      learn: [
        text('Comparar propostas de crédito ou de investimento é somar **tudo** o que se paga ou se recebe: juros, tarifas, impostos. A menor taxa nem sempre vence: um prazo maior ou uma tarifa podem virar o jogo.'),
        lab({
          title: 'Duas propostas',
          intro: 'Para pegar R$ 5.000,00, a proposta A cobra 2% ao mês por 5 meses, sem tarifa. Ajuste a proposta B.',
          params: [
            { key: 'i', label: 'Taxa da B ao mês', min: 1, max: 3, step: 0.5, value: 1.5, format: (v) => pct(v) },
            { key: 't', label: 'Prazo da B', min: 3, max: 12, step: 1, value: 8, format: (v) => `${v} meses` },
            { key: 'f', label: 'Tarifa da B', min: 0, max: 300, step: 10, value: 50, format: (v) => brl(v) },
          ],
          readouts: ({ i, t, f }) => {
            const a = 5000 * 1.1;
            const b = 5000 * (1 + (i * t) / 100) + f;
            return [
              { label: 'Total da A', value: brl(a) },
              { label: 'Total da B', value: brl(b), big: true, tone: 'brass' },
              { label: 'Mais barata', value: Math.abs(a - b) < 0.005 ? 'empate' : a < b ? `A, por ${brl(b - a)}` : `B, por ${brl(a - b)}` },
            ];
          },
          viz: ({ i, t, f }) => ({
            kind: 'bars',
            bars: [
              { label: 'Proposta A', value: 5500, text: brl(5500), tone: 'sky' },
              { label: 'Proposta B', value: 5000 * (1 + (i * t) / 100) + f, text: brl(5000 * (1 + (i * t) / 100) + f), tone: 'brass' },
            ],
            refLine: { value: 5000, label: 'valor emprestado' },
            summary: `A: ${brl(5500)}; B: ${brl(5000 * (1 + (i * t) / 100) + f)}`,
          }),
          goal: {
            task: 'Com a B a 1,5% ao mês por 6 meses, ache a tarifa que deixa as duas propostas empatadas.',
            done: ({ i, t, f }) => i === 1.5 && t === 6 && f === 50,
            success: 'Isso: 5.000 × 0,015 × 6 = R$ 450,00 de juros; com R$ 50,00 de tarifa, a B custa R$ 500,00 a mais, igual à A.',
          },
          insight: 'A menor taxa pode perder se o prazo for longo ou a tarifa, alta: compare sempre os totais.',
        }),
        key('Custo total', 'Total pago = valor emprestado + juros + tarifas. Rendimento líquido = juros − tarifas − impostos. Compare os totais, e não só as taxas.'),
        example('Parcelas do crediário', 'Uma loja vende uma TV de R$ 2.000,00 à vista. No crediário, o total a prazo é o preço à vista mais juros simples de 3% ao mês durante 5 meses, dividido em 5 parcelas iguais. Qual é cada parcela?', [
          step('Juros:', '2.000 × 0,03 × 5 = R$ 300,00'),
          askStep('Total a prazo: R$ 2.300,00.', 'Qual é cada parcela?', [
            ok('2.300 ÷ 5 = R$ 460,00'),
            no('2.000 ÷ 5 + 300 = R$ 700,00', 'Os juros entram no total, que é dividido pelas 5 parcelas: cada uma leva só 300 ÷ 5 = R$ 60,00 de juros.'),
          ]),
        ], 'Cada parcela é de R$ 460,00.'),
        check(numeric({
          prompt: [p('Para R$ 4.000,00 por 6 meses, a aplicação A rende 0,8% ao mês, sem custos; a B rende 1% ao mês, mas cobra tarifa de R$ 30,00 no resgate. As duas a juros simples.')],
          ask: 'Quanto a melhor opção rende a mais que a outra?',
          prefix: 'R$',
          answer: 18,
          wrong: [
            { value: 48, feedback: 'Isso compara só os juros (240 − 192). A tarifa reduz o rendimento da B: 240 − 30 = R$ 210,00.' },
            { value: 30, feedback: 'R$ 30,00 é a tarifa. A diferença entre os rendimentos líquidos é 210 − 192.' },
            { value: 210, feedback: 'R$ 210,00 é o rendimento líquido da B. A pergunta é quanto ele supera o da A (R$ 192,00).' },
          ],
          solution: ['$A: 4.000 × 0,008 × 6 = 192', '$B: 4.000 × 0,01 × 6 − 30 = 210', '$Diferença: 210 − 192 = 18'],
        })),
      ],
      practice: [gen(proposalsGen), gen(netYieldGen), gen(feeCoverGen), gen(crediarioGen)],
      challenge: [gen(proposalsGen), gen(netYieldGen), gen(crediarioGen), gen(feeCoverGen)],
      recap: [
        'Total pago = emprestado + juros + tarifas.',
        'Rendimento líquido = juros − tarifas − impostos.',
        'Crediário: (preço + juros) ÷ número de parcelas.',
      ],
    })),

    stage('empate', 'interpretacao', 'A partir de quando vale a pena', 'Encontrar o ponto de empate entre duas opções — a tarifa máxima, o menor prazo, o capital que iguala, o mês em que uma dívida passa a outra — e arredondar para o lado certo.', () => ({
      learn: [
        text('Muitas decisões dependem de **quando** uma opção passa a valer mais que outra. Escreva o total (ou o rendimento líquido) de cada opção em função do tempo — ou do capital, ou da tarifa — e procure o **empate**. Antes dele, uma opção é melhor; depois, a outra. Se o prazo é um número **inteiro** de meses, arredonde para o lado certo.'),
        lab({
          title: 'Ponto de empate',
          intro: 'R$ 4.000,00 podem ir para X (1% ao mês, sem custo) ou Y (1,5% ao mês, com tarifa no resgate). Mude a tarifa e o prazo.',
          params: [
            { key: 'f', label: 'Tarifa da Y', min: 0, max: 300, step: 30, value: 90, format: (v) => brl(v) },
            { key: 't', label: 'Prazo', min: 1, max: 24, step: 1, value: 6, format: (v) => `${v} meses` },
          ],
          readouts: ({ f, t }) => [
            { label: 'Líquido de X', value: brl(40 * t) },
            { label: 'Líquido de Y', value: brl(60 * t - f) },
            { label: 'Empate em', value: f === 0 ? 'Y sempre rende mais' : `${num(f / 20, 1)} meses`, big: true, tone: 'brass' },
          ],
          viz: ({ f, t }) => ({
            kind: 'chart',
            xLabel: 'Meses',
            yLabel: 'Rendimento líquido (R$)',
            xMin: 0,
            xMax: 24,
            series: [
              { label: 'X', tone: 'sky', points: [[0, 0], [24, 960]] },
              { label: 'Y', tone: 'brass', points: [[0, -f], [24, 1440 - f]] },
            ],
            markers: [{ x: t, y: 60 * t - f, label: `${t} meses`, tone: 'verdigris' }],
            summary: `Com tarifa de ${brl(f)}, Y empata com X em ${num(f / 20, 1)} meses`,
          }),
          goal: {
            task: 'Ache a tarifa com a qual as duas aplicações empatam em exatamente 12 meses.',
            done: ({ f }) => f === 240,
            success: 'Isso: Y rende R$ 20,00 a mais por mês; em 12 meses, R$ 240,00, exatamente a tarifa.',
          },
          insight: 'A diferença de rendimento cresce todo mês; a tarifa é paga uma vez. Por isso, com prazo suficiente, a taxa maior compensa.',
        }),
        key('Empate e arredondamento', 'Ache o valor que iguala as duas opções. Se a pergunta pede o menor prazo inteiro em que uma opção é ESTRITAMENTE melhor e o empate cai num número inteiro, a resposta é o mês seguinte; se o empate não é inteiro, arredonde para cima.'),
        example('Quando a tarifa compensa?', 'Com R$ 5.000,00, a aplicação X rende 1% ao mês, sem custos; a Y rende 1,4% ao mês, mas cobra R$ 150,00 no resgate. As duas a juros simples. A partir de quantos meses inteiros a Y rende mais?', [
          step('Rendimentos líquidos:', 'X: 50 × t; Y: 70 × t − 150'),
          askStep('Y > X quando 20 × t > 150.', 'Qual é o menor t inteiro?', [
            ok('t > 7,5 → 8 meses'),
            no('7 meses', 'Em 7 meses, Y rende 70 × 7 − 150 = R$ 340,00, menos que os R$ 350,00 de X. É preciso t > 7,5: 8 meses.'),
          ]),
        ], 'A partir de 8 meses, Y rende mais.'),
        check(numeric({
          prompt: [p('Para pegar R$ 10.000,00, o banco cobra juros simples de 2% ao mês por 6 meses, sem tarifa; a cooperativa cobra 1,5% ao mês por 7 meses, mais uma tarifa fixa paga na quitação.')],
          ask: 'Qual é a maior tarifa da cooperativa para que o total pago a ela não passe do total pago ao banco?',
          prefix: 'R$',
          answer: 150,
          wrong: [
            { value: 50, feedback: 'Isso compara só as taxas mensais (2% − 1,5%). Os prazos são diferentes: juros de R$ 1.200,00 no banco e R$ 1.050,00 na cooperativa.' },
            { value: 1050, feedback: 'R$ 1.050,00 são os juros da cooperativa. A tarifa pode ser, no máximo, 1.200 − 1.050.' },
            { value: 1200, feedback: 'R$ 1.200,00 são os juros do banco. A tarifa máxima é a diferença para os juros da cooperativa.' },
          ],
          solution: ['$Banco: 10.000 × 0,02 × 6 = 1.200', '$Cooperativa: 10.000 × 0,015 × 7 = 1.050', '$Tarifa máxima: 1.200 − 1.050 = 150'],
        })),
      ],
      practice: [gen(maxFeeGen), gen(breakEvenTimeGen), gen(capitalEqualGen)],
      challenge: [gen(maxFeeGen), gen(breakEvenTimeGen), gen(overtakeGen), gen(netTargetGen)],
      recap: [
        'Escreva o total (ou o líquido) de cada opção e iguale.',
        'Empate inteiro e "estritamente melhor": o mês seguinte.',
        'Empate fracionário: arredonde para cima.',
      ],
    })),

    stage('custo-efetivo', 'aplicacoes', 'O custo de verdade', 'Calcular o custo efetivo de créditos com tarifas retidas ou juros cobrados no ato e o rendimento líquido de aplicações com imposto ou desconto sobre os juros.', () => ({
      learn: [
        text('O **custo efetivo** de um crédito é tudo o que se paga a mais, dividido pelo dinheiro que se **recebe de fato**. Tarifas retidas na liberação e juros cobrados antecipadamente diminuem o valor recebido e aumentam o custo efetivo, mesmo com a mesma taxa anunciada. Nas aplicações, impostos e descontos sobre os juros reduzem o rendimento líquido.'),
        lab({
          title: 'Juros cobrados na frente',
          intro: 'Uma financeira registra uma dívida de R$ 10.000,00, calcula os juros simples do prazo todo e os desconta no ato. Veja a taxa que realmente se paga.',
          params: [
            { key: 'i', label: 'Taxa anunciada ao mês', min: 1, max: 5, step: 0.5, value: 3, format: (v) => pct(v) },
            { key: 't', label: 'Prazo', min: 1, max: 12, step: 1, value: 4, format: (v) => `${v} meses` },
          ],
          readouts: ({ i, t }) => {
            const got = 10000 * (1 - (i * t) / 100);
            return [
              { label: 'Valor recebido', value: brl(got) },
              { label: 'Juros pagos', value: brl((10000 * i * t) / 100) },
              { label: 'Taxa efetiva ao mês (juros simples sobre o recebido)', value: got > 0 ? pct(((10000 - got) / got / t) * 100, 3) : '—', big: true, tone: 'brass' },
            ];
          },
          viz: ({ i, t }) => {
            const got = 10000 * (1 - (i * t) / 100);
            const eff = got > 0 ? ((10000 - got) / got / t) * 100 : 0;
            return {
              kind: 'bars',
              bars: [
                { label: 'Anunciada', value: i, text: pct(i), tone: 'sky' },
                { label: 'Efetiva', value: eff, text: pct(eff, 2), tone: 'ember' },
              ],
              summary: `Anunciada ${pct(i)} ao mês; efetiva ${pct(eff, 2)} ao mês`,
            };
          },
          goal: {
            task: 'Com taxa anunciada de 2% ao mês, ache o prazo em que a taxa efetiva é de exatamente 2,5% ao mês.',
            done: ({ i, t }) => i === 2 && t === 10,
            success: 'Isso: em 10 meses, descontam-se R$ 2.000,00 e chegam R$ 8.000,00; os R$ 2.000,00 de juros são 25% de 8.000 em 10 meses, ou 2,5% ao mês.',
          },
          insight: 'Quanto maior o prazo, mais se desconta na frente e maior fica a taxa efetiva.',
        }),
        key('Custo efetivo', 'Custo efetivo = (total pago − valor recebido) ÷ valor recebido. Juros descontados no ato e tarifas retidas encolhem o valor recebido.'),
        example('Tarifa retida', 'Um empréstimo de R$ 2.000,00 tem juros simples de 1,5% ao mês por 4 meses, sobre os R$ 2.000,00, e uma tarifa de R$ 40,00 retida na liberação. Qual é o custo efetivo, em porcentagem do valor recebido?', [
          step('Valor recebido:', '2.000 − 40 = R$ 1.960,00'),
          step('Total pago no fim:', '2.000 × (1 + 0,015 × 4) = R$ 2.120,00'),
          askStep('Custo: 2.120 − 1.960 = R$ 160,00.', 'Em porcentagem de quê?', [
            ok('160 ÷ 1.960 ≈ 8,16% do valor recebido'),
            no('160 ÷ 2.000 = 8%', 'O custo efetivo compara com o dinheiro que chegou às mãos (R$ 1.960,00), e não com o valor registrado no contrato.'),
          ]),
        ], 'O custo efetivo é de cerca de 8,16%, acima dos 6% de juros anunciados.'),
        example('Imposto sobre os juros', 'R$ 10.000,00 podem ficar 8 meses num CDB que paga 1% ao mês, com imposto de 20% sobre os juros, ou numa LCI que paga 0,85% ao mês, isenta. Considere juros simples. Qual rende mais, líquido?', [
          step('CDB:', 'juros de 10.000 × 0,01 × 8 = R$ 800,00; imposto de R$ 160,00; líquido de R$ 640,00'),
          askStep('LCI: 10.000 × 0,0085 × 8.', 'Quanto ela rende?', [
            ok('R$ 680,00, sem imposto'),
            no('R$ 544,00', 'A LCI é isenta: não se desconta imposto dos R$ 680,00.'),
          ]),
        ], 'A LCI rende mais: R$ 680,00 contra R$ 640,00.'),
        check(numeric({
          prompt: [p('Uma loja precisa receber R$ 3.000,00 líquidos hoje. O contrato retém uma tarifa de R$ 60,00 na liberação e cobra juros simples de 2% ao mês, por 3 meses, sobre o valor contratado, que precisa cobrir os R$ 3.000,00 e a tarifa.')],
          ask: 'Qual será o pagamento único ao fim dos 3 meses?',
          prefix: 'R$',
          answer: 3243.6,
          wrong: [
            { value: 3180, feedback: 'Isso esquece a tarifa: o valor contratado precisa ser R$ 3.060,00.' },
            { value: 3240, feedback: 'Isso soma a tarifa no fim. Ela entra no valor contratado, que rende juros: 3.060 × 1,06.' },
            { value: 3060, feedback: 'R$ 3.060,00 é o valor contratado. Faltam os juros de 3 meses.' },
          ],
          solution: ['$Contratado: 3.000 + 60 = 3.060', '$Pagamento: 3.060 × (1 + 0,02 × 3) = 3.243,60'],
        })),
      ],
      practice: [gen(costPctGen), gen(retainedFeeGen), gen(taxNetGen), gen(nominalGen)],
      challenge: [gen(retainedFeeGen), gen(discountUpfrontGen), gen(taxNetGen), gen(interestDiscountGen)],
      recap: [
        'Custo efetivo: (pago − recebido) ÷ recebido.',
        'Tarifa retida e juros na frente reduzem o recebido.',
        'Imposto e descontos incidem sobre os juros, e não sobre o capital.',
      ],
    })),

    stage('dividir', 'aprofundamento', 'Dividir o capital entre aplicações', 'Calcular os juros de um capital dividido entre taxas diferentes e descobrir a divisão que leva a um total de juros ou a resgates iguais.', () => ({
      learn: [
        text('Quando um capital é **dividido** entre aplicações com taxas diferentes, os juros totais são a soma dos juros de cada parte. Se o total de juros é conhecido e uma parte não, chame a parte desconhecida de x e monte uma equação do 1º grau.'),
        lab({
          title: 'Repartir o capital',
          intro: 'R$ 10.000,00 serão divididos: uma parte na aplicação A (1,5% ao mês) e o resto na B (0,9% ao mês), juros simples.',
          params: [
            { key: 'x', label: 'Parte em A', min: 0, max: 10000, step: 500, value: 5000, format: (v) => brl(v) },
            { key: 't', label: 'Prazo', min: 1, max: 12, step: 1, value: 6, format: (v) => `${v} meses` },
          ],
          readouts: ({ x, t }) => [
            { label: 'Juros da A', value: brl(x * 0.015 * t) },
            { label: 'Juros da B', value: brl((10000 - x) * 0.009 * t) },
            { label: 'Juros totais', value: brl((x * 0.015 + (10000 - x) * 0.009) * t), big: true, tone: 'brass' },
          ],
          viz: ({ x }) => ({
            kind: 'parts',
            segments: [
              { label: 'A (1,5%)', value: x, tone: 'brass' },
              { label: 'B (0,9%)', value: 10000 - x, tone: 'sky' },
            ],
            summary: `${brl(x)} em A e ${brl(10000 - x)} em B`,
          }),
          goal: {
            task: 'Em 10 meses, ache a divisão que dá exatamente R$ 1.080,00 de juros.',
            done: ({ x, t }) => t === 10 && x === 3000,
            success: 'Isso: 3.000 × 0,015 × 10 = R$ 450,00 e 7.000 × 0,009 × 10 = R$ 630,00; total de R$ 1.080,00.',
          },
          insight: 'Cada real que passa da B para a A rende 0,6% a mais por mês: os juros totais crescem em linha reta com a parte em A.',
        }),
        key('Equação da divisão', 'Com x na aplicação A (taxa a) e T − x na B (taxa b), por t períodos: J = x · a · t + (T − x) · b · t. Isole x.'),
        example('A divisão certa', 'Uma família tem R$ 8.000,00 para aplicar por 5 meses: parte a 1% ao mês e o resto a 0,6% ao mês, juros simples. Quer R$ 320,00 de juros no total. Quanto deve pôr a 1%?', [
          step('Equação:', 'x × 0,01 × 5 + (8.000 − x) × 0,006 × 5 = 320'),
          step('Simplificando:', '0,05x + 240 − 0,03x = 320 → 0,02x = 80'),
          askStep('Agora isole x.', 'Quanto vale x?', [
            ok('x = 80 ÷ 0,02 = R$ 4.000,00'),
            no('x = 320 ÷ 0,05 = R$ 6.400,00', 'Isso supõe que todo o rendimento vem da parte a 1%. A outra parte também rende: use a equação com as duas.'),
          ]),
        ], 'Ela deve pôr R$ 4.000,00 a 1% e R$ 4.000,00 a 0,6%.'),
        example('Resgates iguais', 'R$ 13.000,00 serão divididos entre duas pessoas e aplicados a juros simples de 10% ao ano: uma parte por 5 anos e a outra por 1 ano. Os resgates devem ser iguais. Quanto fica na aplicação de 5 anos?', [
          step('Montantes:', 'x × 1,5 e (13.000 − x) × 1,1'),
          askStep('Iguale: 1,5x = 1,1 × (13.000 − x).', 'Quanto vale x?', [
            ok('2,6x = 14.300 → x = R$ 5.500,00'),
            no('x = R$ 6.500,00, a metade', 'Dividir ao meio dá resgates diferentes: a parte de 5 anos rende mais e precisa ser menor.'),
          ]),
        ], 'R$ 5.500,00 ficam 5 anos, e R$ 7.500,00 ficam 1 ano; cada resgate é de R$ 8.250,00.'),
        check(numeric({
          prompt: [p('R$ 9.000,00 foram divididos: R$ 3.000,00 a 1% ao mês e o resto a 0,8% ao mês, por 4 meses, juros simples.')],
          ask: 'Qual é o rendimento total?',
          prefix: 'R$',
          answer: 312,
          wrong: [
            { value: 324, feedback: 'Isso aplica a média das taxas (0,9%) ao total. As partes têm tamanhos diferentes: 120 + 192.' },
            { value: 360, feedback: 'Isso aplica 1% a tudo. Só R$ 3.000,00 rendem 1%; R$ 6.000,00 rendem 0,8%.' },
            { value: 288, feedback: 'Isso aplica 0,8% a tudo. Os R$ 3.000,00 rendem 1%.' },
          ],
          solution: ['$3.000 × 0,01 × 4 = 120', '$6.000 × 0,008 × 4 = 192', '$Total: 312'],
        })),
      ],
      practice: [gen(splitTwoGen), gen(jointYieldGen), gen(targetSplitGen)],
      challenge: [gen(splitTwoGen), gen(equalRedeemGen), gen(targetSplitGen)],
      recap: [
        'Juros totais = soma dos juros de cada parte.',
        'Parte desconhecida: chame de x e monte a equação.',
        'Resgates iguais: iguale os montantes, e não os capitais.',
      ],
    })),

    stage('maestria', 'maestria', 'Maestria: decisões com juros simples', 'Resolver problemas inéditos de escolha entre propostas, pontos de empate, custo efetivo e divisão de capital.', () => ({
      learn: [
        strategy('Contas lado a lado', '1) Escreva o total (ou o líquido) de cada opção, com todos os custos. 2) Use a mesma unidade e o mesmo prazo. 3) Para "a partir de quando" ou "qual valor iguala", monte uma equação ou inequação. 4) Arredonde só no fim, para o lado que a pergunta pede.'),
        example('Três aplicações', [
          p('R$ 4.000,00 podem ir para três aplicações de juros simples:'),
          table(['Aplicação', 'Taxa', 'Custo no resgate'], [['A', '1% ao mês', 'R$ 0,00'], ['B', '1,25% ao mês', 'R$ 60,00'], ['C', '1,5% ao mês', 'R$ 180,00']]),
          p('Qual é o menor prazo inteiro em que C rende, líquido, mais que as outras duas?'),
        ], [
          step('Líquidos:', 'A: 40t; B: 50t − 60; C: 60t − 180'),
          step('C supera A quando 60t − 180 > 40t:', 't > 9'),
          askStep('C supera B quando 60t − 180 > 50t − 60.', 'O que isso exige?', [
            ok('t > 12, ou seja, a partir de 13 meses'),
            no('t > 9 basta', 'Superar A não basta: C também precisa superar B, o que só ocorre com t > 12.'),
          ]),
        ], 'O menor prazo é de 13 meses.'),
        reveal('Por que comparar o líquido?', 'Uma taxa maior pode vir com tarifa ou imposto. Para quem aplica, o que importa é quanto sobra: juros − custos. Para quem pega emprestado, é o total pago a mais, comparado com o que realmente recebeu.'),
        check(numeric({
          prompt: [p('A dívida A começa em R$ 3.000,00 e cresce a juros simples de 1,5% ao mês; a dívida B começa em R$ 3.300,00 e cresce a juros simples de 1% ao mês. Não há pagamentos.')],
          ask: 'Após quantos meses inteiros, no mínimo, a dívida A passa a ser maior que a B?',
          unit: 'meses',
          answer: 26,
          wrong: [
            { value: 25, feedback: 'Em 25 meses, as dívidas EMPATAM (R$ 4.125,00). Para A ser maior: 26 meses.' },
            { value: 21, feedback: 'Isso calcula os juros das duas sobre R$ 3.000,00. B cresce 1% de R$ 3.300,00 = R$ 33,00 por mês.' },
          ],
          solution: ['$A: 3.000 + 45t; B: 3.300 + 33t', '$12t > 300 → t > 25 → 26 meses'],
        })),
      ],
      practice: [gen(proposalsGen), gen(overtakeGen), gen(costPctGen)],
      challenge: [gen(breakEvenTimeGen), gen(splitTwoGen), gen(retainedFeeGen), gen(netTargetGen)],
      recap: [
        'Some todos os custos de cada opção.',
        'Empate: iguale; "a partir de quando": inequação.',
        'Custo efetivo sobre o que se recebe.',
        'Divisão de capital: equação com x.',
      ],
    })),
  ],
});
