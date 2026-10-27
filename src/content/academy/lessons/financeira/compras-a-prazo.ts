/**
 * Aula: Compras a prazo — total a prazo × preço à vista (acréscimo sobre o preço à vista,
 * descontos, frete, tarifas e dinheiro de volta), entrada e parcelas (acréscimo sobre o saldo,
 * preço à vista a partir do total, parcelas desiguais, entrada mínima e número mínimo de
 * parcelas), juros embutidos (taxa sobre o valor financiado, o "sem juros" com desconto à
 * vista), contratos (cancelamento, quitação antecipada, reajustes, fatura do cartão, pacotes
 * com serviço) e valor presente das parcelas.
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
  no,
  numeric,
  numericOptions,
  ok,
  p,
  reveal,
  stage,
  step,
  strategy,
  table,
  text,
} from '../../kit/build';
import { brl, fixed, num, pct, round } from '../../kit/format';
import type { Rand } from '../../types';

const cents = (x: number) => Number.isInteger(round(x * 100, 6));
const isInt = (x: number) => Number.isInteger(round(x, 9));
/** Reais nas contas: inteiro sem casas (2.550) e, se houver centavos, sempre duas (787,50). */
const rs = (x: number) => (isInt(x) ? num(x) : fixed(x, 2));
const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
const fac = (i: number) => num(1 + i / 100, 4);
const SUP = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
const pow = (b: string, n: number) => `${b}${String(n).split('').map((d) => SUP[Number(d)]).join('')}`;
const meses = (k: number) => (k === 1 ? '1 mês' : `${k} meses`);

const ITEMS = [
  { a: 'um micro-ondas', o: 'o micro-ondas' },
  { a: 'uma cafeteira expresso', o: 'a cafeteira' },
  { a: 'um aspirador robô', o: 'o aspirador' },
  { a: 'uma lavadora de alta pressão', o: 'a lavadora' },
  { a: 'um purificador de água', o: 'o purificador' },
  { a: 'uma máquina de costura', o: 'a máquina de costura' },
  { a: 'um violão', o: 'o violão' },
  { a: 'um patinete elétrico', o: 'o patinete' },
];

// ———————————————————————————————————————————————— geradores: à vista ou a prazo

/** Total a prazo × preço à vista: diferença em reais ou acréscimo percentual. */
function extraGen(r: Rand) {
  for (;;) {
    const V = r.pick([600, 800, 900, 1000, 1200, 1500, 1600, 2000, 2500, 3000]);
    const m = r.pick([4, 5, 6, 8, 10, 12, 15, 20]);
    const E = r.next() < 0.5 ? 0 : r.pick([100, 200, 300, 400, 500]);
    const n = r.pick([3, 4, 5, 6, 8, 10, 12]);
    if (V === 600 && E === 0 && n === 3 && m === 10) continue; // questão do banco
    const T = (V * (100 + m)) / 100;
    const v = (T - E) / n;
    if (E >= V / 2 || !cents(v)) continue;
    const it = r.pick(ITEMS);
    const asPct = r.next() < 0.5;
    const plan = E ? `${brl(E)} de entrada e mais ${n} parcelas de ${brl(v)}` : `${n} parcelas de ${brl(v)}, sem entrada`;
    return draftNumeric({
      prompt: [p(`${cap(it.a)} custa ${brl(V)} à vista. A prazo, sai por ${plan}. Não há outras cobranças.`)],
      ask: asPct ? 'Em relação ao preço à vista, quantos por cento a mais se paga a prazo?' : 'Quanto se paga a mais, em reais, comprando a prazo?',
      ...(asPct ? { unit: '%' } : { prefix: 'R$' }),
      answer: asPct ? m : round(T - V, 2),
      wrong: asPct
        ? [
            { value: round(((T - V) / T) * 100, 2), feedback: 'Isso divide pelo total a prazo. O acréscimo é medido sobre o preço à vista, a base da comparação.' },
            { value: round(T - V, 2), feedback: `${brl(T - V)} é a diferença em reais. Para a porcentagem, divida pelo preço à vista.` },
            { value: round((T / V) * 100, 2), feedback: 'Isso é o total a prazo como porcentagem do preço à vista, incluindo os 100% do próprio preço. O acréscimo é o que passa de 100%.' },
            { value: round(m / n, 2), feedback: 'Isso divide o acréscimo pelo número de parcelas. A pergunta é o acréscimo total da compra.' },
          ]
        : [
            { value: round(T, 2), feedback: `${brl(T)} é o total pago a prazo. A pergunta é quanto ele passa do preço à vista.` },
            ...(E ? [{ value: round(n * v - V, 2), feedback: 'Isso esquece a entrada: ela também faz parte do total pago a prazo.' }] : []),
            { value: round((T - V) / n, 2), feedback: `Isso é o acréscimo dividido pelas ${n} parcelas. A pergunta é quanto a compra inteira custa a mais.` },
          ].filter((w) => w.value > 0),
      hints: [`Total a prazo: ${E ? `${num(E)} + ` : ''}${n} × ${rs(v)} = ${brl(T)}.`, asPct ? `Acréscimo: (${rs(T)} − ${num(V)}) ÷ ${num(V)}.` : `Diferença: ${rs(T)} − ${num(V)}.`],
      solution: [
        `$Total: ${E ? `${num(E)} + ` : ''}${n} × ${rs(v)} = ${rs(T)}`,
        asPct ? `$(${rs(T)} − ${num(V)}) ÷ ${num(V)} = ${rs(T - V)} ÷ ${num(V)} = ${num(m / 100, 2)} → ${pct(m)}` : `$${rs(T)} − ${num(V)} = ${rs(T - V)}`,
      ],
    });
  }
}

/** Etiqueta em parcelas "sem juros" × desconto à vista: a economia de pagar à vista. */
function discountGen(r: Rand) {
  for (;;) {
    const P = r.pick([300, 400, 500, 600, 800, 900, 1000, 1500, 2000, 2500]);
    const d = r.pick([5, 6, 8, 10, 12, 15, 20]);
    const n = r.pick([2, 3, 4, 5, 6, 10, 12]);
    const save = (P * d) / 100;
    if (!cents(P / n) || !cents(save)) continue;
    const it = r.pick(ITEMS);
    return draftNumeric({
      prompt: [p(`${cap(it.a)} tem preço de etiqueta de ${brl(P)}, que pode ser pago em ${n} vezes de ${brl(P / n)} no cartão. Quem paga à vista ganha ${pct(d)} de desconto sobre a etiqueta.`)],
      ask: 'Quanto se economiza pagando à vista em vez de parcelar?',
      prefix: 'R$',
      answer: round(save, 2),
      wrong: [
        { value: round(P - save, 2), feedback: `${brl(P - save)} é o preço à vista. A economia é a diferença entre a etiqueta e esse preço.` },
        { value: round(save / n, 2), feedback: `Isso calcula ${pct(d)} de uma parcela só. O desconto é sobre a etiqueta inteira, ${brl(P)}.` },
        { value: d, feedback: `${pct(d)} é a taxa do desconto. Em reais, a economia é ${pct(d)} de ${brl(P)}.` },
      ],
      hints: [`O parcelado soma ${n} × ${rs(P / n)} = ${brl(P)}.`, `À vista: ${pct(d)} a menos que ${brl(P)}.`],
      solution: [`$Economia: ${num(d / 100, 2)} × ${num(P)} = ${rs(save)}`],
    });
  }
}

/** Frete, tarifa por fatura ou dinheiro de volta: o custo total de cada forma de pagamento. */
function extrasGen(r: Rand) {
  for (;;) {
    const kind = r.pick(['frete', 'tarifa', 'cashback'] as const);
    const it = r.pick(ITEMS);
    if (kind === 'frete') {
      const P = r.pick([600, 800, 1000, 1200, 1500, 2000]);
      const d = r.pick([5, 8, 10, 12, 15]);
      const F = r.pick([20, 25, 30, 35, 45, 50, 60]);
      const n = r.pick([4, 5, 6, 8, 10]);
      const cash = (P * (100 - d)) / 100 + F;
      const save = P - cash;
      if (save <= 0 || !cents(P / n) || !cents(cash)) continue;
      return draftNumeric({
        prompt: [p(`${cap(it.a)} custa ${brl(P)} na etiqueta. À vista, há ${pct(d)} de desconto, mas o frete custa ${brl(F)}. No cartão, são ${n} parcelas de ${brl(P / n)}, com frete grátis.`)],
        ask: 'Quanto se economiza no custo total ao pagar à vista?',
        prefix: 'R$',
        answer: round(save, 2),
        wrong: [
          { value: round((P * d) / 100, 2), feedback: `Isso considera só o desconto. O frete de ${brl(F)} do pagamento à vista reduz a economia.` },
          { value: round((P * d) / 100 + F, 2), feedback: 'Isso soma o frete à economia. O frete é um custo de quem paga à vista: ele diminui a vantagem.' },
          { value: F, feedback: `${brl(F)} é só o frete. Compare os custos totais: ${brl(cash)} à vista contra ${brl(P)} no cartão.` },
          { value: round(cash, 2), feedback: 'Esse é o custo total à vista. A economia é a diferença para o custo no cartão.' },
        ],
        hints: [`À vista: ${num(P)} × ${num(1 - d / 100, 2)} + ${num(F)} = ${brl(cash)}.`, `No cartão: ${n} × ${rs(P / n)} = ${brl(P)}.`],
        solution: [`$À vista: ${rs((P * (100 - d)) / 100)} + ${num(F)} = ${rs(cash)}`, `$Economia: ${num(P)} − ${rs(cash)} = ${rs(save)}`],
      });
    }
    if (kind === 'tarifa') {
      const n = r.pick([6, 8, 10, 12]);
      const v = r.pick([80, 120, 150, 180, 250]);
      const t = r.pick([2, 3, 4, 6, 8]);
      const d = r.pick([0, 5, 10]);
      const V = n * v;
      const cash = (V * (100 - d)) / 100;
      const extra = n * (v + t) - cash;
      if (!cents(cash)) continue;
      return draftNumeric({
        prompt: [p(`${cap(it.a)} custa ${brl(V)}, que podem ser pagos em ${n} parcelas de ${brl(v)}. O contrato do parcelamento cobra ainda uma tarifa de ${brl(t)} em cada uma das ${n} faturas. ${d ? `À vista, há ${pct(d)} de desconto e nenhuma tarifa.` : 'À vista, não há tarifa nem desconto.'}`)],
        ask: 'Quanto o parcelamento custa a mais que o pagamento à vista?',
        prefix: 'R$',
        answer: round(extra, 2),
        wrong: [
          { value: t, feedback: `${brl(t)} é a tarifa de uma fatura só. São ${n} faturas.` },
          ...(d
            ? [
                { value: n * t, feedback: `Isso conta só as tarifas. O desconto de ${pct(d)} à vista também é uma vantagem de quem não parcela.` },
                { value: round((V * d) / 100, 2), feedback: `Isso conta só o desconto. As ${n} tarifas de ${brl(t)} também encarecem o parcelamento.` },
              ]
            : []),
          { value: n * (v + t), feedback: 'Esse é o total pago no parcelamento. Subtraia o custo à vista.' },
        ],
        hints: [`Parcelamento: ${n} × (${num(v)} + ${num(t)}) = ${brl(n * (v + t))}.`, d ? `À vista: ${num(V)} × ${num(1 - d / 100, 2)} = ${brl(cash)}.` : `À vista: ${brl(V)}.`],
        solution: [`$${num(n * (v + t))} − ${rs(cash)} = ${rs(extra)}`],
      });
    }
    const C = r.pick([200, 300, 400, 500, 600, 800, 1000]);
    const q = r.pick([3, 4, 5, 6, 8, 10]);
    const c = r.pick([2, 3, 4, 5]);
    if (q <= c) continue;
    if (C === 800 && q === 5 && c === 2) continue; // exercício da teoria
    const X = (C * (100 - q)) / 100;
    const net = (C * (100 - c)) / 100;
    if (!cents(X) || !cents(net)) continue;
    return draftNumeric({
      prompt: [p(`${cap(it.a)} custa ${brl(X)} no Pix ou ${brl(C)} no cartão. Na compra pelo cartão, um programa devolve na hora ${pct(c)} dos ${brl(C)}, em dinheiro, sem restrições.`)],
      ask: 'Quanto o Pix sai mais barato que o cartão, já descontado o dinheiro de volta?',
      prefix: 'R$',
      answer: round(net - X, 2),
      wrong: [
        { value: round(C - X, 2), feedback: `Isso ignora o dinheiro de volta: no cartão, o custo líquido é ${brl(C)} − ${brl((C * c) / 100)}.` },
        { value: round((C * c) / 100, 2), feedback: `${brl((C * c) / 100)} é o dinheiro devolvido. Compare o custo líquido no cartão com o preço no Pix.` },
        { value: round(C - X + (C * c) / 100, 2), feedback: 'Isso soma o dinheiro de volta como se fosse um custo. Ele reduz o custo do cartão.' },
      ],
      hints: [`Custo líquido no cartão: ${num(C)} − ${pct(c)} de ${num(C)} = ${brl(net)}.`, `Compare com ${brl(X)}.`],
      solution: [`$Cartão: ${num(C)} − ${rs((C * c) / 100)} = ${rs(net)}`, `$Diferença: ${rs(net)} − ${rs(X)} = ${rs(net - X)}`],
    });
  }
}

const STORES = ['Aurora', 'Estrela', 'Horizonte'];

/** Uma oferta a prazo com o acréscimo m sobre o preço à vista. */
function offer(r: Rand, V: number, m: number) {
  const T = (V * (100 + m)) / 100;
  for (let k = 0; k < 40; k++) {
    const E = r.pick([0, V / 10, V / 5, V / 4]);
    const n = r.pick([4, 5, 6, 8, 10, 12]);
    const v = (T - E) / n;
    if (cents(v)) return { E, n, v, T };
  }
  return null;
}

/** Três lojas, o mesmo preço à vista: a de menor total a prazo e quanto ela cobra a mais. */
function bestStoreGen(r: Rand) {
  for (;;) {
    const V = r.pick([1800, 2400, 3000, 3600, 4800, 6000]);
    const marks = r.shuffle([4, 5, 6, 8, 10, 12, 15]).slice(0, 3);
    const offers = marks.map((m) => offer(r, V, m));
    if (offers.some((o) => !o)) continue;
    const os = offers as NonNullable<ReturnType<typeof offer>>[];
    const best = os.reduce((a, b) => (b.T < a.T ? b : a));
    const smallest = os.reduce((a, b) => (b.v < a.v ? b : a));
    const it = r.pick(ITEMS);
    return draftNumeric({
      prompt: [
        p(`Em três lojas, ${it.a} custa o mesmo à vista, ${brl(V)}, mas as condições a prazo são diferentes:`),
        table(
          ['Loja', 'Entrada', 'Parcelas mensais'],
          os.map((o, i) => [STORES[i], o.E ? brl(o.E) : 'sem entrada', `${o.n} × ${brl(o.v)}`]),
        ),
        p('A compra será a prazo, na loja de menor total pago (entrada mais parcelas).'),
      ],
      ask: 'Na loja escolhida, quanto se paga a mais que o preço à vista?',
      prefix: 'R$',
      answer: round(best.T - V, 2),
      wrong: [
        ...os
          .filter((o) => o !== best)
          .map((o) => ({
            value: round(o.T - V, 2),
            feedback: o === smallest ? 'Essa loja tem a menor parcela, mas não o menor total. Some entrada e parcelas de cada loja.' : 'Esse é o acréscimo de outra loja. Some entrada e parcelas de cada uma e escolha o menor total.',
          })),
        { value: round(best.T, 2), feedback: 'Esse é o total pago na loja escolhida. A pergunta é quanto ele passa do preço à vista.' },
        ...(best.E ? [{ value: round(best.n * best.v - V, 2), feedback: 'Isso esquece a entrada: ela também faz parte do total pago.' }] : []),
      ].filter((w) => w.value > 0),
      hints: ['Total de cada loja: entrada + número de parcelas × parcela.', `Escolha o menor total e subtraia ${brl(V)}.`],
      solution: [...os.map((o, i) => `$${STORES[i]}: ${o.E ? `${rs(o.E)} + ` : ''}${o.n} × ${rs(o.v)} = ${rs(o.T)}`), `$Menor total: ${rs(best.T)} − ${num(V)} = ${rs(best.T - V)}`],
    });
  }
}

// ———————————————————————————————————————————————— geradores: entrada e parcelas

/** Entrada em % do preço, acréscimo sobre o saldo, parcelas iguais. */
function parcelGen(r: Rand) {
  for (;;) {
    const V = r.pick([1200, 1500, 1800, 2000, 3000, 3600, 4000, 5000]);
    const e = r.pick([10, 20, 25, 30, 40]);
    const a = r.pick([4, 5, 6, 8, 10, 12, 15, 20]);
    const n = r.pick([3, 4, 5, 6, 8, 10, 12]);
    if (V === 3600 && e === 30 && a === 10 && n === 6) continue; // exemplo da teoria
    if (V === 4000 && e === 20 && a === 6 && n === 8) continue; // exercício da teoria
    const E = (V * e) / 100;
    const S = (V - E) * (1 + a / 100);
    const v = S / n;
    if (!cents(v)) continue;
    const it = r.pick(ITEMS);
    return draftNumeric({
      prompt: [p(`${cap(it.a)} custa ${brl(V)} à vista. No crediário, paga-se ${pct(e)} do preço como entrada; o saldo recebe acréscimo de ${pct(a)} e é dividido em ${n} parcelas mensais iguais.`)],
      ask: 'Qual é o valor de cada parcela?',
      prefix: 'R$',
      answer: round(v, 2),
      wrong: [
        { value: round((V - E) / n, 2), feedback: `Isso esquece o acréscimo de ${pct(a)} sobre o saldo.` },
        { value: round((V * (1 + a / 100)) / n, 2), feedback: 'Isso esquece a entrada: ela é paga no ato e sai do saldo antes do acréscimo.' },
        { value: round((V * (1 + a / 100) - E) / n, 2), feedback: 'Isso aplica o acréscimo ao preço inteiro. Ele incide só sobre o saldo, depois de tirar a entrada.' },
        { value: round(S, 2), feedback: `${brl(S)} é o saldo com acréscimo. Divida entre as ${n} parcelas.` },
      ],
      hints: [`Entrada: ${pct(e)} de ${brl(V)} = ${brl(E)}; saldo de ${brl(V - E)}.`, `Saldo com acréscimo: ${rs(V - E)} × ${fac(a)} = ${brl(S)}; divida por ${n}.`],
      solution: [`$Saldo: ${num(V)} − ${rs(E)} = ${rs(V - E)}`, `$${rs(V - E)} × ${fac(a)} = ${rs(S)}`, `$Parcela: ${rs(S)} ÷ ${n} = ${rs(v)}`],
    });
  }
}

/** Preço à vista a partir do total do carnê e do acréscimo anunciado. */
function cashFromTotalGen(r: Rand) {
  for (;;) {
    const C = r.pick([500, 600, 750, 800, 1000, 1200, 1500, 2000]);
    const x = r.pick([5, 8, 10, 15, 20, 25]);
    const n = r.pick([4, 5, 6, 8, 10]);
    const T = (C * (100 + x)) / 100;
    const v = T / n;
    if (!cents(v)) continue;
    const it = r.pick(ITEMS);
    return draftNumeric({
      prompt: [p(`No carnê, ${it.o} sai por ${n} parcelas de ${brl(v)}, sem entrada. A vendedora explica que, somadas, as parcelas dão ${pct(x)} a mais que o preço à vista.`)],
      ask: 'Qual é o preço à vista?',
      prefix: 'R$',
      answer: C,
      wrong: [
        { value: round(T * (1 - x / 100), 2), feedback: `Tirar ${pct(x)} do total usa a base errada: o acréscimo foi calculado sobre o preço à vista. Divida pelo fator ${fac(x)}.` },
        { value: round(T, 2), feedback: `${brl(T)} é o total das parcelas. O preço à vista é menor: total ÷ ${fac(x)}.` },
        { value: round(v / (1 + x / 100), 2), feedback: 'Isso tira o acréscimo de uma parcela só. Faça o mesmo com o total: preço à vista = total ÷ fator.' },
      ],
      hints: [`Total: ${n} × ${rs(v)} = ${brl(T)}.`, `Total = preço à vista × ${fac(x)}.`],
      solution: [`$${n} × ${rs(v)} = ${rs(T)}`, `$${rs(T)} ÷ ${fac(x)} = ${num(C)}`],
    });
  }
}

/** Parcelas iguais e uma última maior: equação com a entrada. */
function unevenParcelsGen(r: Rand) {
  const x = r.pick([150, 180, 200, 240, 250, 300, 320, 400]);
  const k = r.pick([2, 3, 4, 5]);
  const m = r.pick([2, 3]);
  const E = r.pick([200, 300, 400, 500, 600]);
  const T = E + (k + m) * x;
  const it = r.pick(ITEMS);
  const last = r.next() < 0.5;
  const times = m === 2 ? 'dobro' : 'triplo';
  return draftNumeric({
    prompt: [p(`Na compra de ${it.a}, o total pago foi de ${brl(T)}: ${brl(E)} de entrada e mais ${k + 1} parcelas. As ${k} primeiras têm o mesmo valor; a última vale o ${times} de cada uma delas. Não há outras cobranças.`)],
    ask: last ? 'Qual é o valor da última parcela?' : 'Qual é o valor de cada uma das parcelas iguais?',
    prefix: 'R$',
    answer: last ? m * x : x,
    wrong: [
      { value: round((T - E) / (k + 1), 2), feedback: `Isso divide o saldo igualmente pelas ${k + 1} parcelas. A última vale ${m} parcelas comuns: divida por ${k} + ${m} = ${k + m}.` },
      { value: last ? x : m * x, feedback: last ? 'Esse é o valor de cada parcela comum. A última vale mais.' : `Esse é o valor da última parcela, que vale o ${times} das outras.` },
      { value: round(((last ? m : 1) * T) / (k + m), 2), feedback: 'Isso esquece de tirar a entrada antes de dividir o total.' },
    ],
    hints: [`Sem a entrada: ${num(T)} − ${num(E)} = ${brl(T - E)}.`, `Chame a parcela comum de x: ${k}x + ${m}x = ${k + m}x = ${num(T - E)}.`],
    solution: [`$${k + m}x = ${num(T - E)} → x = ${num(x)}`, ...(last ? [`$Última: ${m} × ${num(x)} = ${num(m * x)}`] : [])],
  });
}

/** Menor entrada para a parcela caber no orçamento. */
function minEntryGen(r: Rand) {
  for (;;) {
    const V = r.pick([1500, 2000, 2400, 3000, 4000, 5000]);
    const a = r.pick([5, 10, 15, 20, 25]);
    const n = r.pick([5, 6, 8, 10, 12]);
    const E = (V * r.pick([10, 20, 25, 30, 40, 50])) / 100;
    if (V === 3000 && a === 15 && n === 10 && E === 1000) continue; // questão do banco
    const L = ((V - E) * (1 + a / 100)) / n;
    if (!cents(L)) continue;
    const it = r.pick(ITEMS);
    const maxSaldo = V - E;
    return draftNumeric({
      prompt: [p(`Uma loja vende ${it.a} por ${brl(V)} à vista ou no crediário: a entrada é livre, e o que faltar recebe ${pct(a)} de acréscimo e vira ${n} parcelas mensais iguais. Quem compra quer parcelas de, no máximo, ${brl(L)}.`)],
      ask: `Qual é a menor entrada para que cada parcela não passe de ${brl(L)}?`,
      prefix: 'R$',
      answer: E,
      wrong: [
        { value: round(V - n * L, 2), feedback: `Isso esquece o acréscimo: as ${n} parcelas pagam o saldo já com ${pct(a)} a mais. O maior saldo é ${rs(n * L)} ÷ ${fac(a)}.` },
        { value: round(V * (1 + a / 100) - n * L, 2), feedback: 'Isso aplica o acréscimo ao preço inteiro, inclusive à entrada. O acréscimo incide só sobre o que fica faltando.' },
        { value: round(maxSaldo, 2), feedback: `${brl(maxSaldo)} é o maior saldo que cabe nas parcelas. A entrada é o preço à vista menos esse saldo.` },
      ].filter((w) => w.value > 0),
      hints: [`As ${n} parcelas pagam, no máximo, ${n} × ${rs(L)} = ${brl(n * L)}.`, `Esse valor é o saldo × ${fac(a)}: o maior saldo é ${rs(n * L)} ÷ ${fac(a)}.`],
      solution: [`$Maior saldo: ${rs(n * L)} ÷ ${fac(a)} = ${rs(maxSaldo)}`, `$Menor entrada: ${num(V)} − ${rs(maxSaldo)} = ${rs(E)}`],
    });
  }
}

/** Menor número de parcelas: limite da renda com outra parcela, ou juros simples sobre o preço. */
function minParcelsGen(r: Rand) {
  for (;;) {
    const it = r.pick(ITEMS);
    if (r.next() < 0.5) {
      const R = r.pick([1800, 2000, 2400, 3000, 3500, 4000]);
      const q = r.pick([10, 15, 20, 25, 30]);
      const X = r.pick([0, 100, 150, 200, 250]);
      const V = r.pick([900, 1200, 1500, 1800, 2000, 2400, 3000]);
      const free = (R * q) / 100 - X;
      if (free <= 0) continue;
      const exact = V / free;
      const n = Math.ceil(round(exact, 9));
      if (n < 2 || n > 15) continue;
      return draftNumeric({
        prompt: [p(`Uma família recebe ${brl(R)} por mês e decidiu que a soma de todas as parcelas mensais não pode passar de ${pct(q)} dessa renda. ${X ? `Ela já paga ${brl(X)} por mês de outra compra, que continuará durante todo o novo parcelamento. ` : ''}Agora quer comprar ${it.a} de ${brl(V)} em parcelas mensais iguais, sem entrada e sem juros.`)],
        ask: 'Qual é o menor número de parcelas que respeita o limite?',
        unit: 'parcelas',
        answer: n,
        wrong: [
          ...(isInt(exact) ? [] : [{ value: Math.floor(exact), feedback: `Com ${Math.floor(exact)} parcelas, cada uma seria ${brl(V / Math.floor(exact))}, acima dos ${brl(free)} disponíveis. Arredonde para cima.` }]),
          ...(X ? [{ value: Math.ceil(round((V * 100) / (R * q), 9)), feedback: `Isso esquece a parcela de ${brl(X)} que já existe: para a nova compra, sobram só ${brl(free)} por mês.` }] : []),
          ...(isInt(exact) ? [] : [{ value: round(exact, 2), feedback: 'O número de parcelas é inteiro: arredonde para cima, para a parcela caber no limite.' }]),
        ].filter((w) => w.value > 0),
        hints: [`Limite para todas as parcelas: ${pct(q)} de ${brl(R)} = ${brl((R * q) / 100)}${X ? `; sem a outra compra, sobram ${brl(free)}` : ''}.`, `${num(V)} ÷ n ≤ ${rs(free)}.`],
        solution: [`$n ≥ ${num(V)} ÷ ${rs(free)} = ${num(exact, 2)}`, `$Menor inteiro: ${n} parcelas`],
      });
    }
    const S = r.pick([1500, 1800, 2000, 2500, 3000]);
    const c = r.pick([20, 25, 30]);
    const V = r.pick([1500, 2000, 2400, 3000, 3600]);
    const j = r.pick([1, 2, 2.5, 3, 4]);
    if (S === 2000 && c === 25 && V === 3000 && j === 3) continue; // questão do banco
    const L = (S * c) / 100;
    const J = (V * j) / 100;
    if (L <= J) continue;
    const exact = V / (L - J);
    const n = Math.ceil(round(exact, 9));
    if (n < 2 || n > 12) continue;
    const plain = Math.ceil(round(V / L, 9));
    const name = r.pick(['Rosa', 'Denise', 'Marta']);
    return draftNumeric({
      prompt: [p(`${name} recebe salário de ${brl(S)} e quer que cada parcela fique em, no máximo, ${pct(c)} do salário. Ela vai comprar ${it.a} de ${brl(V)} à vista num crediário sem entrada, em até 12 vezes: para n parcelas, o total é o preço à vista mais juros simples de ${pct(j)} ao mês sobre esse preço, durante n meses, dividido em n parcelas iguais.`)],
      ask: 'Qual é o menor número de parcelas que respeita o limite?',
      unit: 'parcelas',
      answer: n,
      wrong: [
        ...(plain !== n ? [{ value: plain, feedback: 'Isso ignora os juros. Cada parcela tem uma parte do preço mais os juros de um mês sobre o preço inteiro.' }] : []),
        ...(isInt(exact) ? [] : [{ value: Math.floor(exact), feedback: `Com ${Math.floor(exact)} parcelas, cada uma passaria do limite de ${brl(L)}. Arredonde para cima.` }]),
        { value: 12, feedback: '12 parcelas cabem no limite, mas a pergunta é o menor número possível.' },
      ],
      hints: [`Cada parcela vale ${num(V)} ÷ n + ${pct(j)} de ${num(V)} = ${num(V)} ÷ n + ${rs(J)}.`, `Ela precisa ficar até ${brl(L)}: ${num(V)} ÷ n ≤ ${rs(L - J)}.`],
      solution: [`$${num(V)} ÷ n + ${rs(J)} ≤ ${rs(L)} → n ≥ ${num(V)} ÷ ${rs(L - J)} ≈ ${num(exact, 2)}`, `$Menor inteiro: ${n} parcelas`],
    });
  }
}

/** Acréscimo sobre o valor financiado (preço à vista menos a entrada). */
function financedPctGen(r: Rand) {
  for (;;) {
    const V = r.pick([1200, 1500, 2400, 3000, 4000, 5000]);
    const E = r.pick([200, 300, 400, 500, 600, 1000]);
    const k = r.pick([2, 3, 4, 5, 6]);
    const x = r.pick([4, 5, 6, 8, 10, 12, 15, 20]);
    if (E >= V / 2) continue;
    const F = V - E;
    const parc = (F * (1 + x / 100)) / k;
    if (!cents(parc)) continue;
    const tot = k * parc;
    const it = r.pick(ITEMS);
    return draftNumeric({
      prompt: [p(`Na compra de ${it.a} de ${brl(V)} à vista, paga-se ${brl(E)} de entrada e ${k} parcelas de ${brl(parc)}. O valor financiado é o preço à vista menos a entrada.`)],
      ask: 'Qual é o acréscimo total das parcelas, em porcentagem do valor financiado?',
      unit: '%',
      answer: x,
      wrong: [
        { value: round(((tot + E - V) / V) * 100, 2), feedback: 'Isso mede o acréscimo sobre o preço à vista. A pergunta pede sobre o valor financiado, que não inclui a entrada.' },
        { value: round((tot / F) * 100, 2), feedback: 'Isso é o total das parcelas como porcentagem do financiado, incluindo os 100% do próprio valor. O acréscimo é o que passa de 100%.' },
        { value: round(tot - F, 2), feedback: `${brl(tot - F)} é o acréscimo em reais. Divida pelo valor financiado, ${brl(F)}.` },
        { value: round(((tot - F) / tot) * 100, 2), feedback: 'Isso divide pelo total das parcelas. A base é o valor financiado.' },
      ],
      hints: [`Financiado: ${num(V)} − ${num(E)} = ${brl(F)}; parcelas: ${k} × ${rs(parc)} = ${brl(tot)}.`, `Acréscimo: (${rs(tot)} − ${num(F)}) ÷ ${num(F)}.`],
      solution: [`$(${rs(tot)} − ${num(F)}) ÷ ${num(F)} = ${num(x / 100, 2)} → ${pct(x)}`],
    });
  }
}

// ———————————————————————————————————————————————— geradores: juros embutidos

/** Taxa mensal sobre o valor financiado: entrada e um pagamento em 30 dias. */
function entryRateGen(r: Rand) {
  for (;;) {
    const V = r.pick([800, 1200, 1500, 1600, 2000, 2500, 3000]);
    const E = (V * r.pick([25, 30, 40, 50, 60])) / 100;
    const i = r.pick([2, 3, 4, 5, 6, 7, 8, 10, 12, 15]);
    const F = V - E;
    const P1 = F * (1 + i / 100);
    if (!cents(P1)) continue;
    const it = r.pick(ITEMS);
    return draftNumeric({
      prompt: [p(`${cap(it.a)} custa ${brl(V)} à vista. A prazo, paga-se ${brl(E)} de entrada e ${brl(P1)} um mês depois. Os juros incidem só sobre o valor que ficou devendo depois da entrada.`)],
      ask: 'Qual é a taxa mensal de juros?',
      unit: '%',
      answer: i,
      wrong: [
        { value: round(((P1 - F) / V) * 100, 2), feedback: 'Isso divide os juros pelo preço à vista inteiro. A entrada foi paga no ato: a base é só o que ficou devendo.' },
        { value: round(((P1 - F) / P1) * 100, 2), feedback: 'Isso divide os juros pelo pagamento. A base é o valor que ficou devendo: preço à vista menos entrada.' },
        { value: round(P1 - F, 2), feedback: `${brl(P1 - F)} são os juros em reais. Para a taxa, divida pelo valor financiado, ${brl(F)}.` },
        { value: round(((P1 - F) / E) * 100, 2), feedback: 'Isso divide os juros pela entrada. A base é o que ficou devendo depois dela.' },
      ],
      hints: [`Valor financiado: ${num(V)} − ${rs(E)} = ${brl(F)}.`, `Juros: ${rs(P1)} − ${rs(F)} = ${brl(P1 - F)}; divida pelo financiado.`],
      solution: [`$Juros: ${rs(P1)} − ${rs(F)} = ${rs(P1 - F)}`, `$Taxa: ${rs(P1 - F)} ÷ ${rs(F)} = ${num(i / 100, 2)} → ${pct(i)}`],
    });
  }
}

/** "Sem juros" em 2 vezes (a 1ª no ato) × desconto à vista: a taxa escondida. */
function hiddenRateGen(r: Rand) {
  for (;;) {
    const P = r.pick([300, 500, 600, 800, 1000, 1500]);
    const d = r.pick([2, 4, 5, 6, 8, 12, 15, 20]);
    if (P === 600 && d === 4) continue; // exemplo da teoria
    const cash = (P * (100 - d)) / 100;
    if (!cents(cash) || !cents(P / 2)) continue;
    const F = cash - P / 2;
    const rate = round((P / 2 / F - 1) * 100, 2);
    const it = r.pick(ITEMS);
    return draftNumeric({
      prompt: [p(`${cap(it.a)} tem preço de etiqueta de ${brl(P)}. À vista, há ${pct(d)} de desconto. No parcelado "sem juros", são 2 parcelas de ${brl(P / 2)}: a 1ª no ato da compra e a 2ª 30 dias depois.`)],
      ask: 'Qual é a taxa mensal de juros embutida no parcelado? Arredonde a duas casas decimais, se preciso.',
      unit: '%',
      answer: rate,
      tolerance: 0.01,
      wrong: [
        { value: d, feedback: `O desconto não é a taxa. Quem parcela paga ${brl(P / 2)} no ato e fica devendo ${brl(F)}: os juros são calculados sobre esse valor.` },
        { value: round((d / (100 - d)) * 100, 2), feedback: 'Isso é quanto o total parcelado supera o preço à vista. Mas só parte do preço foi financiada, por um mês: a base é o que ficou devendo depois da 1ª parcela.' },
        { value: 0, feedback: `"Sem juros" é só o nome: quem parcela perde o desconto de ${brl((P * d) / 100)}, que funciona como juros sobre ${brl(F)}.` },
        { value: round(((P / 2 - F) / (P / 2)) * 100, 2), feedback: 'Isso divide os juros pela parcela. A base é o que ficou devendo.' },
      ],
      hints: [`Preço à vista: ${brl(cash)}. A 1ª parcela, paga no ato, funciona como entrada: ficam devendo ${rs(cash)} − ${rs(P / 2)} = ${brl(F)}.`, `Em 30 dias, pagam-se ${brl(P / 2)}: juros de ${brl(P / 2 - F)}.`],
      solution: [`$Financiado: ${rs(cash)} − ${rs(P / 2)} = ${rs(F)}`, `$Taxa: ${rs(P / 2 - F)} ÷ ${rs(F)} ≈ ${pct(rate)}`],
    });
  }
}

/** Duas lojas, o mesmo preço à vista: a menor taxa sobre o valor financiado. */
function twoStoresRateGen(r: Rand) {
  for (;;) {
    const V = r.pick([1200, 1500, 1800, 2000, 3000, 3600]);
    const [ia, ib] = r.shuffle([2, 3, 4, 5, 6, 8]).slice(0, 2);
    const Ea = (V * r.pick([20, 25, 40, 50, 60])) / 100;
    const Eb = (V * r.pick([20, 25, 40, 50, 60])) / 100;
    if (Ea === Eb) continue;
    const Fa = V - Ea;
    const Fb = V - Eb;
    const Pa = Fa * (1 + ia / 100);
    const Pb = Fb * (1 + ib / 100);
    if (!cents(Pa) || !cents(Pb)) continue;
    const Ja = Pa - Fa;
    const Jb = Pb - Fb;
    // Armadilha: a loja de menor taxa cobra mais juros em reais.
    if (ia < ib === Ja < Jb) continue;
    const lo = Math.min(ia, ib);
    const hi = Math.max(ia, ib);
    const [Jlo, Flo] = ia < ib ? [Ja, Fa] : [Jb, Fb];
    const it = r.pick(ITEMS);
    return draftNumeric({
      prompt: [
        p(`Duas lojas vendem ${it.a} pelo mesmo preço à vista, ${brl(V)}, e aceitam uma entrada no ato mais um pagamento único 30 dias depois:`),
        table(['Loja', 'Entrada', 'Pagamento em 30 dias'], [['Brisa', brl(Ea), brl(Pa)], ['Cais', brl(Eb), brl(Pb)]]),
        p('A comparação deve ser feita pela taxa mensal de juros sobre o valor efetivamente financiado.'),
      ],
      ask: 'Qual é a menor taxa mensal entre as duas lojas?',
      unit: '%',
      answer: lo,
      wrong: [
        { value: hi, feedback: `${pct(hi)} é a taxa da loja que cobra menos juros em reais. Ela cobra menos porque financia menos: pela taxa, a outra loja é mais barata.` },
        { value: round((Jlo / V) * 100, 2), feedback: 'Isso divide os juros pelo preço à vista. A base é o valor financiado: preço à vista menos entrada.' },
        { value: round((Jlo / (Flo + Jlo)) * 100, 2), feedback: 'Isso divide os juros pelo pagamento. A base é o valor que ficou devendo.' },
      ],
      hints: ['Para cada loja: financiado = preço à vista − entrada; juros = pagamento − financiado.', 'Taxa = juros ÷ financiado. Compare as taxas, e não os juros em reais.'],
      solution: [
        `$Brisa: ${rs(Ja)} ÷ ${rs(Fa)} = ${num(ia / 100, 2)} → ${pct(ia)}`,
        `$Cais: ${rs(Jb)} ÷ ${rs(Fb)} = ${num(ib / 100, 2)} → ${pct(ib)}`,
        `$Menor taxa: ${pct(lo)}`,
      ],
    });
  }
}

/** "N vezes sem juros" ou desconto à vista: quanto o parcelado supera o preço à vista. */
function noInterestPctGen(r: Rand) {
  for (;;) {
    const P = r.pick([600, 800, 900, 1000, 1500, 2000, 3000]);
    const d = r.pick([4, 5, 8, 10, 12, 16, 20, 25]);
    const n = r.pick([5, 6, 8, 10, 12]);
    const cash = (P * (100 - d)) / 100;
    if (!cents(P / n) || !cents(cash)) continue;
    const ans = round((d / (100 - d)) * 100, 2);
    const it = r.pick(ITEMS);
    return draftNumeric({
      prompt: [p(`Uma loja anuncia ${it.a} por ${brl(P)} em ${n} vezes de ${brl(P / n)} "sem juros" no cartão, ou com ${pct(d)} de desconto para pagamento à vista.`)],
      ask: 'Quanto por cento o total parcelado supera o preço à vista? Arredonde a duas casas decimais, se preciso.',
      unit: '%',
      answer: ans,
      tolerance: 0.01,
      wrong: [
        { value: d, feedback: `${pct(d)} é o desconto, calculado sobre a etiqueta. O acréscimo é calculado sobre o preço à vista, que é menor: ${brl((P * d) / 100)} ÷ ${brl(cash)}.` },
        { value: round((P * d) / 100, 2), feedback: 'Esse é o valor do desconto em reais. Para a porcentagem, divida pelo preço à vista.' },
        { value: round(d / n, 2), feedback: `Isso divide o desconto pelas ${n} parcelas. A pergunta compara os totais.` },
        { value: 100 - d, feedback: `${pct(100 - d)} é o preço à vista como porcentagem da etiqueta. A pergunta é quanto o parcelado passa do preço à vista.` },
      ],
      hints: [`À vista: ${num(P)} × ${num(1 - d / 100, 2)} = ${brl(cash)}.`, `Acréscimo: ${rs((P * d) / 100)} ÷ ${rs(cash)}.`],
      solution: [`$${rs((P * d) / 100)} ÷ ${rs(cash)} ≈ ${num(ans / 100, 4)} → ${pct(ans)}`],
    });
  }
}

/** Entrada e o saldo num pagamento único, com juros compostos. */
function entryCompoundGen(r: Rand) {
  for (;;) {
    const V = r.pick([1000, 1200, 2000, 2500, 3000, 4000]);
    const e = r.pick([10, 20, 25, 30, 40, 50]);
    const k = r.pick([2, 3]);
    const i = r.pick([2, 3, 4, 5, 10]);
    const E = (V * e) / 100;
    const f = (1 + i / 100) ** k;
    const S = (V - E) * f;
    if (!cents(S)) continue;
    const it = r.pick(ITEMS);
    return draftNumeric({
      prompt: [p(`${cap(it.a)} custa ${brl(V)} à vista. No crediário, paga-se ${pct(e)} de entrada no ato; o restante é quitado num único pagamento ${k} meses depois, corrigido por juros compostos de ${pct(i)} ao mês.${k === 3 ? ` Use: ${pow(fac(i), 3)} = ${num(f, 6)}.` : ''}`)],
      ask: 'Qual é o valor total pago pela compra?',
      prefix: 'R$',
      answer: round(E + S, 2),
      wrong: [
        { value: round(S, 2), feedback: `${brl(S)} é só o pagamento final. O total inclui a entrada de ${brl(E)}.` },
        { value: round(E + (V - E) * (1 + (k * i) / 100), 2), feedback: `Isso usa juros simples (${k} × ${pct(i)}). Em compostos, o fator é ${pow(fac(i), k)} = ${num(f, 6)}.` },
        { value: round(V * f, 2), feedback: 'Isso aplica os juros ao preço inteiro. A entrada foi paga no ato: os juros incidem só sobre o restante.' },
        { value: round(E + (V - E) * (1 + i / 100), 2), feedback: `Isso aplica só um mês de juros. São ${k} meses: fator ${num(f, 6)}.` },
      ],
      hints: [`Entrada: ${brl(E)}; restante: ${brl(V - E)}.`, `Pagamento final: ${rs(V - E)} × ${pow(fac(i), k)} = ${rs(V - E)} × ${num(f, 6)}.`],
      solution: [`$Pagamento final: ${rs(V - E)} × ${num(f, 6)} = ${rs(S)}`, `$Total: ${rs(E)} + ${rs(S)} = ${rs(E + S)}`],
    });
  }
}

// ———————————————————————————————————————————————— geradores: contratos

const PLANS = [
  { a: 'Um pacote de aulas de dança', div: 'dividido' },
  { a: 'Um plano anual de academia', div: 'dividido' },
  { a: 'Uma oficina de fotografia', div: 'dividida' },
  { a: 'Uma mentoria de redação', div: 'dividida' },
];

/** Cancelamento: devolução de parte do que foi pago, ou multa sobre o que falta. */
function cancelGen(r: Rand) {
  for (;;) {
    const n = r.pick([6, 8, 10, 12]);
    const v = r.pick([80, 120, 150, 200, 250, 300]);
    const k = r.pick([2, 3, 4, 5]);
    const w = r.pick(PLANS);
    const paid = k * v;
    if (r.next() < 0.5) {
      const ref = r.pick([50, 60, 70, 75, 90]);
      const back = (paid * ref) / 100;
      const net = paid - back;
      if (!cents(back)) continue;
      return draftNumeric({
        prompt: [p(`${w.a} de ${brl(n * v)} foi ${w.div} em ${n} parcelas de ${brl(v)}. Depois de pagar ${k} parcelas, a pessoa cancela. Pelo contrato, as parcelas futuras são canceladas e ela recebe de volta ${pct(ref)} do que já pagou, sem outras cobranças.`)],
        ask: 'Qual é o custo líquido que fica com a pessoa, depois da devolução?',
        prefix: 'R$',
        answer: round(net, 2),
        wrong: [
          { value: round(back, 2), feedback: `${brl(back)} é o valor devolvido. O custo líquido é o que foi pago menos a devolução.` },
          { value: paid, feedback: `${brl(paid)} é o que foi pago antes da devolução. Desconte os ${pct(ref)} devolvidos.` },
          { value: round((n * v * (100 - ref)) / 100, 2), feedback: `Isso aplica a devolução ao contrato inteiro. Ela vale só para o que já foi pago: ${k} × ${brl(v)}.` },
        ],
        hints: [`Já pago: ${k} × ${num(v)} = ${brl(paid)}.`, `Devolução: ${pct(ref)} de ${brl(paid)}.`],
        solution: [`$Devolução: ${num(ref / 100, 2)} × ${num(paid)} = ${rs(back)}`, `$Custo líquido: ${num(paid)} − ${rs(back)} = ${rs(net)}`],
      });
    }
    const fine = r.pick([10, 20, 25, 30]);
    const rest = (n - k) * v;
    const cost = paid + (rest * fine) / 100;
    if (!cents(cost)) continue;
    return draftNumeric({
      prompt: [p(`${w.a} de ${brl(n * v)} foi ${w.div} em ${n} parcelas de ${brl(v)}. Depois de pagar ${k} parcelas, a pessoa cancela. Pelo contrato, não há devolução do que foi pago, e o cancelamento custa uma multa de ${pct(fine)} sobre o valor das parcelas que faltavam.`)],
      ask: 'Quanto a pessoa gasta no total, somando as parcelas pagas e a multa?',
      prefix: 'R$',
      answer: round(cost, 2),
      wrong: [
        { value: round((rest * fine) / 100, 2), feedback: `${brl((rest * fine) / 100)} é só a multa. O total inclui as ${k} parcelas já pagas.` },
        { value: round(paid + (n * v * fine) / 100, 2), feedback: 'Isso calcula a multa sobre o contrato inteiro. Ela incide só sobre as parcelas que faltavam.' },
        { value: round(paid + (paid * fine) / 100, 2), feedback: 'Isso calcula a multa sobre as parcelas pagas. Ela incide sobre as que faltavam.' },
      ],
      hints: [`${n - k === 1 ? 'Faltava 1 parcela' : `Faltavam ${n - k} parcelas`}: ${n - k} × ${num(v)} = ${brl(rest)}.`, `Multa: ${pct(fine)} de ${brl(rest)}; some às ${k} parcelas pagas.`],
      solution: [`$Multa: ${num(fine / 100, 2)} × ${num(rest)} = ${rs((rest * fine) / 100)}`, `$Total: ${num(paid)} + ${rs((rest * fine) / 100)} = ${rs(cost)}`],
    });
  }
}

/** Quitação antecipada com desconto sobre as parcelas restantes. */
function earlyPayoffGen(r: Rand) {
  for (;;) {
    const n = r.pick([5, 6, 8, 10, 12]);
    const v = r.pick([90, 120, 150, 180, 200, 250]);
    const k = r.pick([2, 3, 4, 5, 6]);
    const d = r.pick([5, 8, 10, 12, 15, 20]);
    if (k >= n) continue;
    if (n === 5 && v === 150 && k === 3 && d === 10) continue; // questão do banco
    if (n === 8 && v === 120 && k === 5 && d === 15) continue; // exemplo da teoria
    const rest = (n - k) * v;
    const payoff = (rest * (100 - d)) / 100;
    const tot = k * v + payoff;
    if (!cents(payoff)) continue;
    const w = r.pick(PLANS);
    return draftNumeric({
      prompt: [p(`${w.a} foi ${w.div} em ${n} parcelas de ${brl(v)}. Depois de pagar ${k}, a pessoa recebe a proposta de quitar as ${n - k} restantes de uma vez, com ${pct(d)} de desconto sobre a soma delas.`)],
      ask: 'Se ela aceitar, qual será o total desembolsado?',
      prefix: 'R$',
      answer: round(tot, 2),
      wrong: [
        { value: round((n * v * (100 - d)) / 100, 2), feedback: 'Isso dá o desconto sobre o contrato inteiro. Ele vale só para as parcelas restantes.' },
        { value: round(payoff, 2), feedback: `${brl(payoff)} é só a quitação. O total inclui as ${k} parcelas já pagas.` },
        { value: n * v, feedback: 'Esse é o valor do contrato sem desconto.' },
        { value: round(n * v - (v * d) / 100, 2), feedback: 'Isso desconta só uma parcela. O desconto vale sobre a soma de todas as restantes.' },
      ],
      hints: [`Já pago: ${k} × ${num(v)} = ${brl(k * v)}; restantes: ${brl(rest)}.`, `Quitação: ${brl(rest)} × ${num(1 - d / 100, 2)}.`],
      solution: [`$Quitação: ${num(rest)} × ${num(1 - d / 100, 2)} = ${rs(payoff)}`, `$Total: ${num(k * v)} + ${rs(payoff)} = ${rs(tot)}`],
    });
  }
}

/** Reajuste das últimas parcelas, sempre sobre o valor original. */
function readjustGen(r: Rand) {
  for (;;) {
    const n = r.pick([4, 5, 6, 8, 10, 12]);
    const m = r.pick([1, 2, 3, 4]);
    const rr = r.pick([5, 8, 10, 12, 15, 20]);
    const v = r.pick([100, 150, 200, 250, 300]);
    if (m >= n) continue;
    if (n === 4 && m === 2 && rr === 10) continue; // questão do banco
    const add = (m * v * rr) / 100;
    const total = n * v + add;
    const asPct = r.next() < 0.6;
    const ans = round((m * rr) / n, 2);
    const it = r.pick(ITEMS);
    const which = m === 1 ? `a última é reajustada em ${pct(rr)}` : `cada uma das ${m} últimas é reajustada em ${pct(rr)}`;
    return draftNumeric({
      prompt: [p(`O contrato de compra de ${it.a} tinha ${n} parcelas mensais de ${brl(v)}. Ele foi alterado: as ${n - m} primeiras ficam iguais, e ${which}, sempre sobre os ${brl(v)} originais.`)],
      ask: asPct ? `Qual é o acréscimo percentual do total pago sobre os ${brl(n * v)} previstos? Arredonde a duas casas decimais, se preciso.` : 'Qual é o total pago no contrato?',
      ...(asPct ? { unit: '%', tolerance: 0.01 } : { prefix: 'R$' }),
      answer: asPct ? ans : round(total, 2),
      wrong: asPct
        ? [
            { value: rr, feedback: `${pct(rr)} vale só para ${m === 1 ? 'uma' : m} das ${n} parcelas. Sobre o total, o acréscimo é menor.` },
            ...(m > 1 ? [{ value: m * rr, feedback: `Isso soma os reajustes das ${m} parcelas. Para a porcentagem do total, divida o acréscimo em reais pelo total previsto.` }] : []),
            ...(m > 1 ? [{ value: round(((1 + rr / 100) ** m - 1) * 100, 2), feedback: 'Isso acumula os reajustes como se cada um incidisse sobre o anterior. Pelo contrato, todos usam o valor original como base.' }] : []),
            { value: round(add, 2), feedback: `${brl(add)} é o acréscimo em reais. Divida pelo total previsto, ${brl(n * v)}.` },
          ]
        : [
            { value: round(n * v * (1 + rr / 100), 2), feedback: `Isso reajusta todas as parcelas. Só ${m === 1 ? 'a última muda' : `as ${m} últimas mudam`}.` },
            ...(m > 1 ? [{ value: round(n * v + (v * rr) / 100, 2), feedback: `Isso reajusta só uma parcela. São ${m} parcelas reajustadas.` }] : []),
            { value: n * v, feedback: 'Esse é o total previsto, sem os reajustes.' },
          ],
      hints: [`Cada parcela reajustada aumenta ${pct(rr)} de ${brl(v)} = ${brl((v * rr) / 100)}.`, `Acréscimo total: ${m} × ${rs((v * rr) / 100)} = ${brl(add)}.`],
      solution: asPct ? [`$Acréscimo: ${rs(add)} ÷ ${num(n * v)} ≈ ${num(ans / 100, 4)} → ${pct(ans)}`] : [`$Total: ${num(n * v)} + ${rs(add)} = ${rs(total)}`],
    });
  }
}

/** Fatura do cartão: juros sobre o saldo não pago e compras novas sem juros no mês. */
function cardBillGen(r: Rand) {
  for (;;) {
    const F = r.pick([600, 900, 1000, 1200, 1500, 2000, 2500]);
    const minimum = r.next() < 0.35;
    const pay = minimum ? (F * 15) / 100 : r.pick([200, 300, 400, 500, 600, 800, 1000]);
    const j = r.pick([5, 8, 9, 10, 12, 14, 15]);
    const N = r.pick([0, 80, 120, 150, 200, 250, 300]);
    if (pay >= F) continue;
    if (F === 1200 && pay === 500 && j === 10 && N === 150) continue; // exemplo da teoria
    if (F === 1500 && pay === 600 && j === 10 && N === 0) continue; // laboratório da teoria
    const S = F - pay;
    const next = S * (1 + j / 100) + N;
    if (!cents(next)) continue;
    return draftNumeric({
      prompt: [p(`Uma fatura de cartão de ${brl(F)} recebe ${minimum ? `apenas o pagamento mínimo de 15%, ou ${brl(pay)},` : `um pagamento de ${brl(pay)}`} no vencimento. O contrato cobra ${pct(j)} de juros no mês sobre o saldo não pago.${N ? ` Antes da próxima fatura, entra uma compra nova de ${brl(N)}, sobre a qual não incidem juros nesse mês.` : ' Não há compras novas.'} Não há tarifas.`)],
      ask: 'Qual será o valor da próxima fatura?',
      prefix: 'R$',
      answer: round(next, 2),
      wrong: [
        ...(N ? [{ value: round((S + N) * (1 + j / 100), 2), feedback: 'Isso cobra juros também sobre a compra nova. Neste mês, os juros incidem só sobre o saldo não pago.' }] : []),
        { value: round(S + N, 2), feedback: `Isso esquece os juros de ${pct(j)} sobre o saldo não pago.` },
        { value: round(F * (1 + j / 100) - pay + N, 2), feedback: 'Isso cobra juros sobre a fatura inteira. O que foi pago no vencimento não paga juros.' },
        ...(N ? [{ value: round(S * (1 + j / 100), 2), feedback: 'Isso esquece a compra nova, que entra na próxima fatura.' }] : []),
      ],
      hints: [`Saldo não pago: ${num(F)} − ${rs(pay)} = ${brl(S)}.`, `Com juros: ${rs(S)} × ${fac(j)}${N ? `; depois, some a compra nova` : ''}.`],
      solution: [`$${rs(S)} × ${fac(j)} = ${rs(S * (1 + j / 100))}`, ...(N ? [`$${rs(S * (1 + j / 100))} + ${num(N)} = ${rs(next)}`] : [])],
    });
  }
}

/** Desconto e, depois, taxa do crédito sobre o valor já descontado. */
function creditFeeGen(r: Rand) {
  for (;;) {
    const P = r.pick([400, 500, 800, 1000, 1200, 1500, 2000]);
    const d = r.pick([5, 10, 12, 20, 25]);
    const f = r.pick([1, 2, 2.5, 3, 4, 5]);
    if (d === f) continue;
    const D = (P * (100 - d)) / 100;
    const fin = (D * (100 + f)) / 100;
    if (!cents(fin)) continue;
    const it = r.pick(ITEMS);
    return draftNumeric({
      prompt: [p(`${cap(it.a)} de ${brl(P)} está com ${pct(d)} de desconto. Pagando no cartão de crédito, em parcela única, cobra-se uma taxa de ${pct(f)} sobre o valor já com desconto, sem outras despesas.`)],
      ask: 'Qual é o valor final cobrado no cartão?',
      prefix: 'R$',
      answer: round(fin, 2),
      wrong: [
        { value: round(D, 2), feedback: `${brl(D)} é o valor com desconto. Falta a taxa de ${pct(f)} do crédito.` },
        { value: round((P * (100 - d + f)) / 100, 2), feedback: 'Isso calcula a taxa sobre o preço original (ou soma e subtrai as porcentagens). Ela incide sobre o valor já com desconto: multiplique os fatores.' },
        { value: round((P * (100 + f)) / 100, 2), feedback: `Isso esquece o desconto de ${pct(d)}.` },
      ],
      hints: [`Com desconto: ${num(P)} × ${num(1 - d / 100, 2)} = ${brl(D)}.`, `Com a taxa: ${rs(D)} × ${num(1 + f / 100, 3)}.`],
      solution: [`$${num(P)} × ${num(1 - d / 100, 2)} × ${num(1 + f / 100, 3)} = ${rs(fin)}`],
    });
  }
}

const BUNDLES = [
  { dev: 'uma impressora', svc: 'assinatura de tinta' },
  { dev: 'um purificador de água', svc: 'troca de refil' },
  { dev: 'uma cafeteira de cápsulas', svc: 'caixa de cápsulas' },
];

/** Aparelho + serviço mensal: o custo do período inteiro. */
function bundleGen(r: Rand) {
  for (;;) {
    const m = r.pick([6, 12, 18, 24]);
    const a = r.pick([200, 300, 400, 500, 600]);
    const b = a + r.pick([100, 150, 200, 250, 300, 400]);
    const sa = r.pick([30, 40, 45, 50, 60, 70]);
    const sb = sa - r.pick([5, 10, 15, 20, 25]);
    if (sb <= 0) continue;
    const A = a + m * sa;
    const B = b + m * sb;
    if (A === B) continue;
    const save = Math.abs(A - B);
    const k = r.pick(BUNDLES);
    return draftNumeric({
      prompt: [p(`Para ${m} meses de uso, há dois planos com ${k.dev}. Plano 1: o aparelho por ${brl(a)} e ${k.svc} de ${brl(sa)} por mês. Plano 2: o aparelho por ${brl(b)} e ${k.svc} de ${brl(sb)} por mês. Não há outros custos.`)],
      ask: 'Quanto o plano mais barato economiza no período completo?',
      prefix: 'R$',
      answer: save,
      wrong: [
        { value: b - a, feedback: `${brl(b - a)} é só a diferença no preço do aparelho. O serviço mensal também conta, por ${m} meses.` },
        { value: sa - sb, feedback: `${brl(sa - sb)} é a diferença de um mês de serviço. Some os ${m} meses e compare com a diferença dos aparelhos.` },
        { value: m * (sa - sb), feedback: `${brl(m * (sa - sb))} é a diferença do serviço em ${m} meses. Falta descontar a diferença no preço dos aparelhos.` },
        { value: Math.min(A, B), feedback: 'Esse é o custo total do plano mais barato. A pergunta é a economia: a diferença entre os planos.' },
      ],
      hints: [`Plano 1: ${num(a)} + ${m} × ${num(sa)} = ${brl(A)}.`, `Plano 2: ${num(b)} + ${m} × ${num(sb)} = ${brl(B)}.`],
      solution: [`$Plano 1: ${num(A)}; plano 2: ${num(B)}`, `$Economia: ${num(Math.max(A, B))} − ${num(Math.min(A, B))} = ${num(save)}`],
    });
  }
}

// ———————————————————————————————————————————————— geradores: valor presente

/** Inversos dos fatores, com 4 casas, como o enunciado informa. */
const INV: Record<number, [number, number]> = {
  1: [0.9901, 0.9803],
  2: [0.9804, 0.9612],
  3: [0.9709, 0.9426],
  5: [0.9524, 0.907],
  6: [0.9434, 0.89],
};

/** Valor de hoje de duas parcelas × preço à vista. */
function pvCompareGen(r: Rand) {
  for (;;) {
    const V = r.pick([800, 1000, 1200, 1500, 2000, 2400, 3000]);
    const i = r.pick([1, 2, 3, 5, 6]);
    const up = r.pick([0, 2, 3, 4, 5, 6, 8, 10]);
    const P = (V * (100 + up)) / 200;
    if (!cents(P)) continue;
    const [f1, f2] = INV[i];
    const pv = round(P * f1 + P * f2, 2);
    const diff = round(pv - V, 2);
    if (Math.abs(diff) < 1) continue;
    const more = diff > 0;
    const it = r.pick(ITEMS);
    return draftNumeric({
      prompt: [p(`${cap(it.a)} custa ${brl(V)} à vista ou 2 parcelas de ${brl(P)}, a 1ª um mês depois da compra e a 2ª dois meses depois. O dinheiro de quem compra está numa aplicação que rende ${pct(i)} ao mês, juros compostos. Use: 1 ÷ ${fac(i)} ≈ ${num(f1, 4)} e 1 ÷ ${pow(fac(i), 2)} ≈ ${num(f2, 4)}.`)],
      ask: more ? 'Em valor de hoje, quanto a compra parcelada custa a mais que a compra à vista, aproximadamente?' : 'Em valor de hoje, quanto a compra parcelada custa a menos que a compra à vista, aproximadamente?',
      prefix: 'R$',
      answer: Math.abs(diff),
      tolerance: 0.05,
      wrong: [
        { value: round(Math.abs(2 * P - V), 2), feedback: 'Isso compara a soma das parcelas com o preço à vista sem trazê-las para hoje. Cada parcela vale menos hoje: multiplique pelos inversos dados.' },
        { value: pv, feedback: `${brl(pv)} é o valor de hoje das parcelas. A pergunta é a diferença para o preço à vista.` },
        { value: round(Math.abs(2 * P * f1 - V), 2), feedback: 'Isso desconta as duas parcelas por um mês só. A 2ª está a dois meses: use o segundo inverso.' },
      ].filter((w) => w.value > 0),
      hints: [`1ª parcela hoje: ${rs(P)} × ${num(f1, 4)}; 2ª: ${rs(P)} × ${num(f2, 4)}.`, `Some e compare com ${brl(V)}.`],
      solution: [
        `$Valor de hoje: ${rs(P)} × ${num(f1, 4)} + ${rs(P)} × ${num(f2, 4)} ≈ ${fixed(pv, 2)}`,
        `$Diferença: ${more ? `${fixed(pv, 2)} − ${num(V)}` : `${num(V)} − ${fixed(pv, 2)}`} ≈ ${fixed(Math.abs(diff), 2)}`,
      ],
    });
  }
}

/** Pagar depois e deixar o dinheiro rendendo, a juros simples, até o vencimento. */
function investLaterGen(r: Rand) {
  for (;;) {
    const V = r.pick([800, 1200, 1500, 2000, 2500, 3000, 4000]);
    const k = r.pick([2, 3, 4, 6]);
    const i = r.pick([0.5, 1, 1.5, 2, 2.5]);
    const up = r.pick([2, 3, 4, 5, 6, 8, 10]);
    const W = (V * (100 + up)) / 100;
    const inv = V * (1 + (i * k) / 100);
    const gap = round(W - inv, 2);
    if (Math.abs(gap) < 1 || !cents(inv)) continue;
    const lack = gap > 0;
    const it = r.pick(ITEMS);
    return draftNumeric({
      prompt: [p(`${cap(it.a)} custa ${brl(V)} à vista ou ${brl(W)} em pagamento único daqui a ${meses(k)}. Quem compra tem ${brl(V)} e pode aplicá-los a juros simples de ${pct(i)} ao mês até o vencimento, sem custos.`)],
      ask: lack ? 'Escolhendo pagar depois, quanto precisará complementar no vencimento?' : 'Escolhendo pagar depois, quanto sobrará da aplicação depois de pagar?',
      prefix: 'R$',
      answer: Math.abs(gap),
      wrong: [
        { value: round(W - V, 2), feedback: `Isso esquece que os ${brl(V)} rendem até o vencimento: ${brl(inv - V)} de juros.` },
        { value: round(inv, 2), feedback: `${brl(inv)} é o saldo da aplicação no vencimento. Compare com o pagamento de ${brl(W)}.` },
        { value: round(inv - V, 2), feedback: 'Esses são os juros da aplicação. A pergunta é a diferença entre o saldo e o pagamento.' },
        { value: round(Math.abs(W - V * (1 + i / 100) ** k), 2), feedback: 'Isso usa juros compostos. O enunciado diz que a aplicação rende juros simples.' },
      ],
      hints: [`Aplicação no vencimento: ${num(V)} × (1 + ${k} × ${num(i / 100, 3)}) = ${brl(inv)}.`, `Compare com ${brl(W)}.`],
      solution: [`$Saldo: ${num(V)} × ${num(1 + (i * k) / 100, 3)} = ${rs(inv)}`, `$${lack ? `${rs(W)} − ${rs(inv)}` : `${rs(inv)} − ${rs(W)}`} = ${rs(Math.abs(gap))}`],
    });
  }
}

/** Parte paga agora + pagamento futuro equivalente ao preço à vista. */
function partTodayGen(r: Rand) {
  for (;;) {
    const Q = r.pick([500, 800, 1000, 1200, 1500, 2000]);
    const i = r.pick([2, 4, 5, 8, 10]);
    const k = r.pick([1, 2]);
    const X = r.pick([500, 800, 1000, 1200, 1500]);
    if (Q === 1000 && i === 10 && k === 2 && X === 1200) continue; // questão do banco
    if (Q === 1000 && i === 8 && k === 2 && X === 1500) continue; // exemplo da teoria
    const f = (1 + i / 100) ** k;
    const Y = Q * f;
    if (!cents(Y)) continue;
    const V = Q + X;
    const it = r.pick(ITEMS);
    return draftNumeric({
      prompt: [p(`Para ${it.a} de ${brl(V)} à vista, a loja aceita uma parte agora e ${brl(Y)} daqui a ${meses(k)}, cobrando juros compostos de ${pct(i)} ao mês sobre o que fica para depois. As duas formas de pagamento se equivalem.`)],
      ask: 'Quanto deve ser pago agora?',
      prefix: 'R$',
      answer: X,
      wrong: [
        { value: round(V - Y, 2), feedback: `Isso subtrai o pagamento futuro sem trazê-lo para hoje. Em valor de hoje, ${brl(Y)} valem ${brl(Q)}.` },
        { value: Q, feedback: `${brl(Q)} é o valor de hoje do pagamento futuro. A parte de agora é o restante do preço.` },
        ...(k === 2 ? [{ value: round(V - Y / (1 + (2 * i) / 100), 2), feedback: 'Isso desconta com juros simples. A equivalência usa juros compostos: divida por (1 + i)².' }] : []),
      ],
      hints: [`Traga o pagamento futuro para hoje: ${rs(Y)} ÷ ${k === 1 ? fac(i) : `${pow(fac(i), 2)} = ${rs(Y)} ÷ ${num(f, 4)}`}.`, 'A parte de agora completa o preço à vista.'],
      solution: [`$Valor de hoje: ${rs(Y)} ÷ ${num(f, 4)} = ${num(Q)}`, `$Agora: ${num(V)} − ${num(Q)} = ${num(X)}`],
    });
  }
}

/** Taxa de um financiamento em 2 parcelas: testar as alternativas. */
function parcelRateGen(r: Rand) {
  for (;;) {
    const c = r.pick([400, 500, 600, 800, 1000, 1200, 1500]);
    const i = r.pick([2, 3, 4, 5, 6, 8, 10]);
    const E = r.pick([200, 300, 400, 500]);
    if (c === 1000 && i === 5) continue; // questão do banco
    const P = c * (1 + i / 100) ** 2;
    const F = c * (2 + i / 100);
    if (!cents(P) || !cents(F)) continue;
    const V = F + E;
    const total = round(((2 * P - F) / F) * 100, 2);
    const it = r.pick(ITEMS);
    return draftChoice({
      prompt: [p(`${cap(it.a)} custa ${brl(V)} à vista. A prazo, paga-se ${brl(E)} de entrada e 2 parcelas mensais de ${brl(P)}, a 1ª 30 dias e a 2ª 60 dias depois da compra. As parcelas foram calculadas com juros compostos, a uma taxa mensal fixa, sobre o saldo financiado.`)],
      ask: 'Qual é a taxa mensal de juros?',
      options: numericOptions({ value: i, text: pct(i) }, [
        { value: i - 1, text: pct(i - 1), feedback: `A ${pct(i - 1)}, as parcelas trazidas para hoje valeriam mais que os ${brl(F)} financiados: a taxa verdadeira é maior.` },
        { value: i + 1, text: pct(i + 1), feedback: `A ${pct(i + 1)}, as parcelas trazidas para hoje valeriam menos que os ${brl(F)} financiados: a taxa verdadeira é menor.` },
        { value: total, text: pct(total), feedback: `${pct(total)} são os juros totais (${brl(2 * P - F)}) sobre o financiado, nos 2 meses juntos. A taxa mensal é a que faz as parcelas, trazidas para hoje, somarem ${brl(F)}.` },
        { value: round(total / 2, 2), text: pct(round(total / 2, 2)), feedback: 'Isso divide os juros totais pelos 2 meses, como se a dívida inteira ficasse 2 meses. Depois da 1ª parcela, o saldo diminui: teste cada taxa trazendo as parcelas para hoje.' },
      ]),
      hints: [`Valor financiado: ${num(V)} − ${num(E)} = ${brl(F)}.`, `Teste cada taxa: ${rs(P)} ÷ (1 + i) + ${rs(P)} ÷ (1 + i)² deve dar ${rs(F)}.`],
      solution: [`$${rs(P)} ÷ ${fac(i)} + ${rs(P)} ÷ ${pow(fac(i), 2)} = ${rs(c * (1 + i / 100))} + ${num(c)} = ${rs(F)}`, `$Taxa: ${pct(i)} ao mês`],
      verify: () => i,
    });
  }
}

/** Juros sobre o preço inteiro × juros sobre o saldo que diminui. */
function bankVsStoreGen(r: Rand) {
  for (;;) {
    const V = r.pick([1200, 1500, 2000, 2400, 3600, 4000]);
    const j = r.pick([1, 2, 2.5, 4]);
    const n = r.pick([3, 4, 5, 6, 8]);
    if (V === 1500 && j === 2 && n === 5) continue; // exercício da teoria
    const am = V / n;
    if (!cents(am)) continue;
    const store = (V * j * n) / 100;
    const bank = (V * j * (n + 1)) / 200;
    const save = store - bank;
    if (!cents(bank) || !cents(store)) continue;
    const saldos = Array.from({ length: n }, (_, k) => rs(V - k * am));
    const it = r.pick(ITEMS);
    return draftNumeric({
      prompt: [p(`Para comprar ${it.a} de ${brl(V)} e pagar em ${n} meses, há duas propostas, ambas anunciadas "a ${pct(j)} ao mês". No crediário da loja, os juros são ${pct(j)} do preço à vista em cada um dos ${n} meses, somados ao preço e divididos em ${n} parcelas iguais. Na cooperativa de crédito, pegam-se ${brl(V)} emprestados e, ao fim de cada mês, devolvem-se ${brl(am)} da dívida mais ${pct(j)} sobre o saldo devedor do início daquele mês.`)],
      ask: 'Escolhendo a cooperativa, quanto se economiza em juros no total?',
      prefix: 'R$',
      answer: round(save, 2),
      wrong: [
        { value: 0, feedback: 'A taxa anunciada é a mesma, mas a base não: na cooperativa, os juros incidem sobre um saldo que diminui a cada mês.' },
        { value: round(store, 2), feedback: `${brl(store)} são os juros da loja. Subtraia os juros da cooperativa.` },
        { value: round(bank, 2), feedback: `${brl(bank)} são os juros da cooperativa. A economia é a diferença para os juros da loja.` },
        { value: round((V * j) / 100, 2), feedback: `${brl((V * j) / 100)} são os juros de um mês sobre o preço inteiro. Compare os juros totais das duas propostas.` },
      ],
      hints: [`Loja: ${n} × ${pct(j)} de ${brl(V)} = ${brl(store)}.`, `Cooperativa: ${pct(j)} de cada saldo do início do mês (${saldos.join('; ')}).`],
      solution: [`$Loja: ${rs(store)}`, `$Cooperativa: ${num(j / 100, 3)} × (${saldos.join(' + ')}) = ${rs(bank)}`, `$Economia: ${rs(store)} − ${rs(bank)} = ${rs(save)}`],
    });
  }
}

// ———————————————————————————————————————————————— aula

export const COMPRAS_A_PRAZO = lesson({
  id: 'compras-a-prazo',
  topic: 'financeira',
  subtopics: ['compras-a-prazo'],
  title: 'Compras a prazo',
  summary:
    'À vista ou a prazo: total pago e acréscimo sobre o preço à vista, entrada e parcelas, juros escondidos no "sem juros", regras de contratos e fatura do cartão, e o valor de hoje das parcelas.',
  requires: ['porcentagem', 'juros-simples', 'juros-compostos'],
  stages: [
    stage('a-vista-ou-a-prazo', 'descoberta', 'À vista ou a prazo?', 'Comparar o preço à vista com o total pago a prazo — entrada mais parcelas —, calcular a diferença em reais e o acréscimo percentual sobre o preço à vista, considerando descontos, frete, tarifas e dinheiro de volta.', () => ({
      learn: [
        text('Para comparar formas de pagamento, calcule o **total** de cada uma: total a prazo = entrada + número de parcelas × valor da parcela. A diferença para o preço à vista é o que o parcelamento custa a mais. Em porcentagem, o **acréscimo** é medido sobre o **preço à vista**: (total a prazo − à vista) ÷ à vista.'),
        lab({
          title: '"Sem juros" ou desconto?',
          intro: 'Uma loja vende pelo preço de etiqueta em parcelas "sem juros" ou dá um desconto para quem paga à vista.',
          params: [
            { key: 'P', label: 'Preço de etiqueta', min: 500, max: 3000, step: 100, value: 1500, format: (v) => brl(v) },
            { key: 'd', label: 'Desconto à vista', min: 0, max: 30, step: 1, value: 10, format: (v) => pct(v) },
          ],
          readouts: ({ P, d }) => [
            { label: 'À vista', value: brl((P * (100 - d)) / 100) },
            { label: 'A prazo ("sem juros")', value: brl(P) },
            { label: 'Diferença', value: brl((P * d) / 100) },
            { label: 'Acréscimo sobre o à vista', value: pct((d / (100 - d)) * 100), big: true, tone: 'brass' },
          ],
          viz: ({ P, d }) => ({
            kind: 'bars',
            bars: [
              { label: 'À vista', value: (P * (100 - d)) / 100, text: brl((P * (100 - d)) / 100), tone: 'verdigris' },
              { label: 'A prazo', value: P, text: brl(P), tone: 'ember' },
            ],
            summary: `À vista ${brl((P * (100 - d)) / 100)}; a prazo ${brl(P)}: ${pct((d / (100 - d)) * 100)} a mais`,
          }),
          goal: {
            task: 'Ache o menor desconto à vista que faz o parcelado "sem juros" custar mais de 15% acima do preço à vista.',
            done: ({ d }) => d === 14,
            success: 'Isso: com 14% de desconto, o preço à vista é 0,86 da etiqueta, e 1 ÷ 0,86 ≈ 1,163 — o parcelado custa 16,3% a mais. Com 13%, seriam só 14,9%.',
          },
          insight: 'O acréscimo é sempre maior que o desconto: o desconto é calculado sobre a etiqueta; o acréscimo, sobre o preço à vista, que é menor.',
        }),
        key('A base é o preço à vista', 'Acréscimo = (total a prazo − preço à vista) ÷ preço à vista. Desconto = (etiqueta − preço à vista) ÷ etiqueta. Como as bases são diferentes, um desconto de 30% corresponde a um acréscimo de cerca de 42,9% para quem parcela.'),
        example('Somando tudo', 'Um ventilador de teto custa R$ 450,00 à vista ou R$ 90,00 de entrada e mais 4 parcelas de R$ 99,00. Quanto se paga a mais a prazo, em reais e em porcentagem?', [
          step('Total a prazo:', '90 + 4 × 99 = 90 + 396 = R$ 486,00'),
          step('Diferença:', '486 − 450 = R$ 36,00'),
          askStep('Agora, a porcentagem.', 'Sobre qual base?', [
            ok('36 ÷ 450 = 0,08 → 8%'),
            no('36 ÷ 486 ≈ 7,4%', 'O acréscimo é medido sobre o preço à vista, R$ 450,00, e não sobre o total a prazo.'),
          ]),
        ], 'A prazo, paga-se R$ 36,00 a mais: 8% sobre o preço à vista.'),
        example('Desconto, frete e tarifa', 'Uma cadeira de escritório custa R$ 1.250,00 na etiqueta. À vista, tem 12% de desconto, mas o frete custa R$ 35,00. No cartão, sai em 5 × R$ 250,00, com frete grátis e tarifa de R$ 2,00 por fatura. Quanto se economiza pagando à vista?', [
          step('À vista:', '1.250 × 0,88 = R$ 1.100,00; com frete, R$ 1.135,00'),
          step('No cartão:', '5 × 250 + 5 × 2 = R$ 1.260,00'),
          askStep('Compare os totais.', 'Qual é a economia?', [
            ok('1.260 − 1.135 = R$ 125,00'),
            no('12% de 1.250 = R$ 150,00', 'O desconto não é a economia inteira: o frete encarece o pagamento à vista, e as tarifas encarecem o cartão. Compare os custos totais.'),
          ]),
        ], 'Pagando à vista, economizam-se R$ 125,00.'),
        check(numeric({
          prompt: [p('Uma impressora custa R$ 800,00 à vista ou 4 parcelas de R$ 218,00, sem entrada.')],
          ask: 'Quantos por cento a mais se paga a prazo, em relação ao preço à vista?',
          unit: '%',
          answer: 9,
          wrong: [
            { value: 72, feedback: 'R$ 72,00 é a diferença em reais (872 − 800). Para a porcentagem, divida por 800.' },
            { value: 8.26, feedback: 'Isso divide pelo total a prazo (72 ÷ 872). O acréscimo é medido sobre o preço à vista.' },
            { value: 109, feedback: '109% é o total a prazo em relação ao preço à vista. O acréscimo é o que passa de 100%: 9%.' },
          ],
          solution: ['$Total: 4 × 218 = 872', '$(872 − 800) ÷ 800 = 0,09 → 9%'],
        })),
      ],
      practice: [gen(extraGen), gen(discountGen), gen(extrasGen), gen(bestStoreGen)],
      challenge: [
        gen(extrasGen),
        gen(bestStoreGen),
        gen(extraGen),
        numeric({
          prompt: [p('Uma caixa de som custa R$ 760,00 no Pix ou R$ 800,00 no cartão. Na compra pelo cartão, um programa devolve na hora 2% dos R$ 800,00, em dinheiro.')],
          ask: 'Quanto o Pix sai mais barato que o cartão, já descontado o dinheiro de volta?',
          prefix: 'R$',
          answer: 24,
          wrong: [
            { value: 40, feedback: 'R$ 40,00 ignora o dinheiro de volta. No cartão, o custo líquido é 800 − 16 = R$ 784,00.' },
            { value: 16, feedback: 'R$ 16,00 é o dinheiro devolvido. Compare o custo líquido no cartão (R$ 784,00) com o Pix.' },
            { value: 56, feedback: 'Isso soma o dinheiro de volta como se fosse um custo. Ele reduz o custo do cartão.' },
          ],
          solution: ['$Cartão: 800 − 0,02 × 800 = 784', '$Diferença: 784 − 760 = 24'],
        }),
      ],
      recap: [
        'Total a prazo = entrada + parcelas.',
        'Acréscimo % = diferença ÷ preço à vista.',
        'Some fretes e tarifas; desconte o dinheiro de volta.',
      ],
    })),

    stage('entrada-parcelas', 'fundamentos', 'Entrada, saldo e parcelas', 'Calcular parcelas a partir da entrada e do acréscimo sobre o saldo, descobrir o preço à vista pelo total, lidar com parcelas desiguais e escolher a entrada ou o número de parcelas que cabem no orçamento.', () => ({
      learn: [
        text('No crediário, a **entrada** é paga no ato e abate o preço à vista; o que sobra é o **saldo**. Se o saldo recebe um acréscimo de a%, o total financiado é saldo × (1 + a), dividido igualmente entre as parcelas. Quando o orçamento impõe um limite à parcela, resolva a desigualdade e arredonde para o lado seguro.'),
        lab({
          title: 'Monte o crediário',
          intro: 'Escolha o preço à vista, a entrada, o acréscimo sobre o saldo e o número de parcelas.',
          params: [
            { key: 'V', label: 'Preço à vista', min: 1000, max: 5000, step: 100, value: 3000, format: (v) => brl(v) },
            { key: 'e', label: 'Entrada (% do preço)', min: 0, max: 50, step: 5, value: 20, format: (v) => pct(v) },
            { key: 'a', label: 'Acréscimo sobre o saldo', min: 0, max: 30, step: 1, value: 10, format: (v) => pct(v) },
            { key: 'n', label: 'Parcelas', min: 2, max: 12, step: 1, value: 6, format: (v) => `${v}` },
          ],
          readouts: ({ V, e, a, n }) => {
            const E = (V * e) / 100;
            const S = (V - E) * (1 + a / 100);
            return [
              { label: 'Entrada', value: brl(E) },
              { label: 'Saldo com acréscimo', value: brl(S) },
              { label: 'Parcela', value: brl(S / n), big: true, tone: 'brass' },
              { label: 'Total pago', value: brl(E + S) },
            ];
          },
          viz: ({ V, e, a, n }) => {
            const E = (V * e) / 100;
            const S = (V - E) * (1 + a / 100);
            return {
              kind: 'parts',
              segments: [
                { label: 'Entrada', value: E, tone: 'parchment' },
                { label: 'Saldo', value: V - E, tone: 'verdigris' },
                { label: 'Acréscimo', value: S - (V - E), tone: 'ember' },
              ],
              summary: `Entrada de ${brl(E)} e ${n} parcelas de ${brl(S / n)}: total de ${brl(E + S)}`,
            };
          },
          goal: {
            task: 'Com preço de R$ 2.000,00, acréscimo de 10% e 10 parcelas, ache a menor entrada (em %) que deixa a parcela em no máximo R$ 150,00.',
            done: ({ V, e, a, n }) => V === 2000 && a === 10 && n === 10 && e === 35,
            success: 'Isso: com 35% de entrada, o saldo é R$ 1.300,00; com 10% de acréscimo, R$ 1.430,00, ou 10 parcelas de R$ 143,00. Com 30%, a parcela seria R$ 154,00.',
          },
          insight: 'Uma entrada maior reduz o saldo e, junto com ele, o acréscimo: o acréscimo só incide sobre o que fica devendo.',
        }),
        key('Arredonde para o lado seguro', 'Se a conta diz que são necessárias 6,25 parcelas para caber no limite, 6 não bastam: são 7. Para a menor entrada, a parcela calculada precisa ficar igual ou abaixo do limite.'),
        example('Parcela com acréscimo', 'Uma câmera fotográfica custa R$ 3.600,00 à vista. No crediário, paga-se 30% de entrada; o saldo recebe acréscimo de 10% e é dividido em 6 parcelas iguais. Qual é a parcela?', [
          step('Entrada e saldo:', '30% de 3.600 = R$ 1.080,00; saldo de R$ 2.520,00'),
          step('Saldo com acréscimo:', '2.520 × 1,1 = R$ 2.772,00'),
          askStep('Divida entre as parcelas.', 'Qual é o valor de cada uma?', [
            ok('2.772 ÷ 6 = R$ 462,00'),
            no('3.600 × 1,1 ÷ 6 = R$ 660,00', 'O acréscimo incide só sobre o saldo, e a entrada já foi paga: ela não entra nas parcelas.'),
          ]),
        ], 'Cada parcela é de R$ 462,00.'),
        example('Do total ao preço à vista', 'Um carnê de 6 parcelas de R$ 315,00 soma 5% a mais que o preço à vista. Qual é o preço à vista?', [
          step('Total do carnê:', '6 × 315 = R$ 1.890,00'),
          askStep('O total é o preço à vista × 1,05.', 'Como desfazer?', [
            ok('1.890 ÷ 1,05 = R$ 1.800,00'),
            no('1.890 × 0,95 = R$ 1.795,50', 'Tirar 5% do total usa a base errada: os 5% foram calculados sobre o preço à vista. Divida pelo fator 1,05.'),
          ]),
        ], 'O preço à vista é R$ 1.800,00.'),
        check(numeric({
          prompt: [p('Uma pessoa pode comprometer no máximo R$ 250,00 por mês. Quer comprar uma estante de R$ 2.100,00 em parcelas iguais, sem entrada e sem juros.')],
          ask: 'Qual é o menor número de parcelas que cabe no limite?',
          unit: 'parcelas',
          answer: 9,
          wrong: [
            { value: 8, feedback: 'Com 8 parcelas, cada uma seria R$ 262,50, acima do limite. 2.100 ÷ 250 = 8,4: são necessárias 9.' },
            { value: 8.4, feedback: 'O número de parcelas é inteiro. 8,4 não existe: arredonde para cima, para a parcela caber no limite.' },
          ],
          solution: ['$2.100 ÷ n ≤ 250 → n ≥ 8,4', '$Menor inteiro: 9 parcelas (R$ 233,33 cada)'],
        })),
      ],
      practice: [gen(parcelGen), gen(cashFromTotalGen), gen(unevenParcelsGen), gen(financedPctGen)],
      challenge: [gen(minEntryGen), gen(minParcelsGen), gen(parcelGen), gen(unevenParcelsGen)],
      recap: [
        'Saldo = preço à vista − entrada.',
        'Parcela = saldo × (1 + acréscimo) ÷ número de parcelas.',
        'Do total ao preço à vista: divida pelo fator.',
        'Limite de parcela: arredonde para o lado seguro.',
      ],
    })),

    stage('juros-embutidos', 'interpretacao', 'Os juros escondidos', 'Descobrir a taxa de juros de uma compra com entrada e um pagamento, calculada sobre o valor efetivamente financiado, e revelar os juros embutidos no parcelado "sem juros" quando há desconto à vista.', () => ({
      learn: [
        text('Quando há entrada e um pagamento depois, os juros são cobrados sobre o **valor financiado**: preço à vista − entrada. A taxa do período é (pagamento − financiado) ÷ financiado. Num parcelado "sem juros" com desconto à vista, os juros estão escondidos no desconto que você deixa de ganhar.'),
        lab({
          title: 'Taxa escondida',
          intro: 'Uma compra tem preço à vista, uma entrada no ato e um único pagamento 30 dias depois.',
          params: [
            { key: 'V', label: 'Preço à vista', min: 500, max: 3000, step: 100, value: 2000, format: (v) => brl(v) },
            { key: 'E', label: 'Entrada', min: 0, max: 1500, step: 100, value: 600, format: (v) => brl(v) },
            { key: 'P', label: 'Pagamento em 30 dias', min: 100, max: 3000, step: 10, value: 1500, format: (v) => brl(v) },
          ],
          readouts: ({ V, E, P }) => {
            const F = V - E;
            if (F <= 0) return [{ label: 'Valor financiado', value: 'nenhum: a entrada cobre o preço', big: true, tone: 'ember' }];
            return [
              { label: 'Valor financiado', value: brl(F) },
              { label: 'Juros', value: brl(P - F) },
              { label: 'Taxa do mês', value: pct(((P - F) / F) * 100), big: true, tone: P >= F ? 'brass' : 'verdigris' },
            ];
          },
          goal: {
            task: 'Com preço à vista de R$ 1.200,00 e entrada de R$ 400,00, ache o pagamento em 30 dias que corresponde a juros de 5% ao mês.',
            done: ({ V, E, P }) => V === 1200 && E === 400 && P === 840,
            success: 'Isso: ficaram devendo R$ 800,00; com 5%, pagam-se 800 × 1,05 = R$ 840,00 depois de um mês.',
          },
          insight: 'A entrada não é financiada: quanto maior a entrada, menor a base sobre a qual os juros são calculados.',
        }),
        key('Juros sobre o que ficou devendo', 'Taxa = (pagamento futuro − valor financiado) ÷ valor financiado, com valor financiado = preço à vista − entrada. Se a 1ª parcela é paga no ato, ela funciona como entrada.'),
        example('Entrada e um pagamento', 'Um videogame custa R$ 1.400,00 à vista ou R$ 400,00 de entrada e R$ 1.070,00 em 30 dias. Qual é a taxa mensal de juros?', [
          step('Valor financiado:', '1.400 − 400 = R$ 1.000,00'),
          step('Juros:', '1.070 − 1.000 = R$ 70,00'),
          askStep('A taxa.', 'Sobre qual base?', [
            ok('70 ÷ 1.000 = 7% ao mês'),
            no('70 ÷ 1.400 = 5% ao mês', 'A entrada foi paga no ato: os juros são cobrados só sobre os R$ 1.000,00 que ficaram devendo.'),
          ]),
        ], 'A taxa é de 7% ao mês.'),
        example('O "sem juros" que tem juros', 'Um par de tênis custa R$ 600,00 na etiqueta: à vista, com 4% de desconto, ou em 2 × R$ 300,00, a 1ª no ato e a 2ª em 30 dias. Qual é a taxa embutida no parcelado?', [
          step('Preço à vista:', '600 × 0,96 = R$ 576,00'),
          step('A 1ª parcela, paga no ato, funciona como entrada:', '576 − 300 = R$ 276,00 financiados'),
          askStep('Depois de 30 dias, pagam-se R$ 300,00.', 'Qual é a taxa?', [
            ok('(300 − 276) ÷ 276 ≈ 8,7% ao mês'),
            no('0%, porque é "sem juros"', 'Quem parcela abre mão do desconto de R$ 24,00: esses R$ 24,00 são juros sobre os R$ 276,00 que ficaram devendo.'),
          ]),
        ], 'A taxa embutida é de cerca de 8,7% ao mês.'),
        check(numeric({
          prompt: [p('Um projetor custa R$ 2.000,00 à vista ou R$ 800,00 de entrada e R$ 1.290,00 em 30 dias.')],
          ask: 'Qual é a taxa mensal de juros cobrada sobre o valor financiado?',
          unit: '%',
          answer: 7.5,
          wrong: [
            { value: 4.5, feedback: 'Isso divide os juros (R$ 90,00) pelo preço à vista. A entrada não foi financiada: a base é 2.000 − 800 = R$ 1.200,00.' },
            { value: 90, feedback: 'R$ 90,00 são os juros em reais. Para a taxa, divida pelo valor financiado, R$ 1.200,00.' },
            { value: 6.98, feedback: 'Isso divide os juros pelo pagamento de R$ 1.290,00. A base é o que ficou devendo: R$ 1.200,00.' },
          ],
          solution: ['$Financiado: 2.000 − 800 = 1.200', '$Juros: 1.290 − 1.200 = 90', '$90 ÷ 1.200 = 0,075 → 7,5%'],
        })),
      ],
      practice: [gen(entryRateGen), gen(hiddenRateGen), gen(noInterestPctGen), gen(entryCompoundGen)],
      challenge: [gen(twoStoresRateGen), gen(hiddenRateGen), gen(entryCompoundGen), gen(entryRateGen)],
      recap: [
        'Valor financiado = preço à vista − entrada.',
        'Taxa = juros ÷ valor financiado.',
        '"Sem juros" com desconto à vista tem juros escondidos.',
      ],
    })),

    stage('contratos', 'aplicacoes', 'Contratos e fatura do cartão', 'Ler as regras de contratos — cancelamento, quitação antecipada, reajuste de parcelas, juros do cartão, taxa do crédito e serviços mensais — e calcular o custo total de cada escolha.', () => ({
      learn: [
        text('Contratos trazem regras próprias: devolução de parte do que foi pago, desconto para quitar antes, reajuste de parcelas, juros do cartão sobre o saldo não pago. Em cada regra, identifique **a base** da porcentagem — sobre o quê ela é calculada — e o **momento** em que ela vale.'),
        lab({
          title: 'Fatura do cartão',
          intro: 'Você recebe a fatura, paga uma parte, e o restante vira saldo com juros. Compras novas entram na próxima fatura sem juros neste mês.',
          params: [
            { key: 'F', label: 'Fatura', min: 500, max: 3000, step: 100, value: 1200, format: (v) => brl(v) },
            { key: 'pg', label: 'Pagamento', min: 0, max: 3000, step: 100, value: 400, format: (v) => brl(v) },
            { key: 'j', label: 'Juros sobre o saldo', min: 2, max: 15, step: 1, value: 8, format: (v) => pct(v) },
            { key: 'N', label: 'Compras novas', min: 0, max: 1000, step: 50, value: 100, format: (v) => brl(v) },
          ],
          readouts: ({ F, pg, j, N }) => {
            const S = Math.max(F - pg, 0);
            return [
              { label: 'Saldo não pago', value: pg >= F ? 'nenhum: fatura quitada' : brl(S) },
              { label: 'Juros', value: brl((S * j) / 100) },
              { label: 'Próxima fatura', value: brl(S * (1 + j / 100) + N), big: true, tone: 'brass' },
            ];
          },
          viz: ({ F, pg, j, N }) => {
            const S = Math.max(F - pg, 0);
            return {
              kind: 'parts',
              segments: [
                { label: 'Saldo', value: S, tone: 'verdigris' },
                { label: 'Juros', value: (S * j) / 100, tone: 'ember' },
                { label: 'Compras novas', value: N, tone: 'parchment' },
              ],
              summary: `Próxima fatura: ${brl(S * (1 + j / 100) + N)}, com ${brl((S * j) / 100)} de juros`,
            };
          },
          goal: {
            task: 'Com fatura de R$ 1.500,00, juros de 10% e nenhuma compra nova, ache o pagamento que deixa a próxima fatura em exatamente R$ 990,00.',
            done: ({ F, pg, j, N }) => F === 1500 && j === 10 && N === 0 && pg === 600,
            success: 'Isso: pagando R$ 600,00, ficam R$ 900,00; com 10% de juros, R$ 990,00.',
          },
          insight: 'Cada real não pago da fatura volta com juros; a compra nova só passa a pagar juros se também não for paga.',
        }),
        key('Qual é a base?', 'Devolução de 70% "do que já foi pago"; desconto de 15% "sobre as parcelas restantes"; reajuste de 8% "sobre a parcela original"; juros de 9% "sobre o saldo não pago". Uma porcentagem só faz sentido junto da sua base.'),
        example('Quitação antecipada', 'Um plano anual de academia foi dividido em 8 parcelas de R$ 120,00. Depois de pagar 5, a aluna quita as 3 restantes com 15% de desconto sobre a soma delas. Quanto ela desembolsa no total?', [
          step('Já pago:', '5 × 120 = R$ 600,00'),
          step('Restante com desconto:', '3 × 120 = R$ 360,00; com 15% de desconto, 360 × 0,85 = R$ 306,00'),
          askStep('Total.', 'Quanto ela desembolsa?', [
            ok('600 + 306 = R$ 906,00'),
            no('960 × 0,85 = R$ 816,00', 'O desconto vale só para as parcelas restantes; as 5 já pagas não mudam.'),
          ]),
        ], 'O total desembolsado é R$ 906,00.'),
        example('A próxima fatura', 'Uma fatura de R$ 1.200,00 recebe pagamento de R$ 500,00. O saldo paga 10% de juros no mês, e uma compra nova de R$ 150,00 entra na próxima fatura sem juros. Qual será a próxima fatura?', [
          step('Saldo não pago:', '1.200 − 500 = R$ 700,00'),
          step('Com juros:', '700 × 1,1 = R$ 770,00'),
          askStep('Falta a compra nova.', 'Qual é a próxima fatura?', [
            ok('770 + 150 = R$ 920,00'),
            no('(700 + 150) × 1,1 = R$ 935,00', 'A compra nova não paga juros neste mês: some-a depois de aplicar os juros ao saldo.'),
          ]),
        ], 'A próxima fatura será de R$ 920,00.'),
        check(numeric({
          prompt: [p('Plano A: impressora por R$ 300,00 e assinatura de tinta de R$ 45,00 por mês. Plano B: impressora por R$ 540,00 e assinatura de R$ 20,00 por mês. A tinta será usada por 12 meses em qualquer plano.')],
          ask: 'Quanto o plano mais barato economiza nos 12 meses?',
          prefix: 'R$',
          answer: 60,
          wrong: [
            { value: 240, feedback: 'R$ 240,00 é só a diferença no preço da impressora. As assinaturas também contam: 12 × 25 = R$ 300,00 a favor do plano B.' },
            { value: 25, feedback: 'R$ 25,00 é a diferença de um mês de assinatura. Some os 12 meses e compare com a diferença das impressoras.' },
            { value: 300, feedback: 'R$ 300,00 é a diferença das assinaturas em 12 meses. O plano B começa R$ 240,00 mais caro na impressora.' },
          ],
          solution: ['$A: 300 + 12 × 45 = 840', '$B: 540 + 12 × 20 = 780', '$Economia do B: 840 − 780 = 60'],
        })),
      ],
      practice: [gen(cancelGen), gen(earlyPayoffGen), gen(cardBillGen), gen(creditFeeGen)],
      challenge: [gen(readjustGen), gen(bundleGen), gen(cardBillGen), gen(cancelGen)],
      recap: [
        'Leia a base de cada porcentagem.',
        'Fatura: juros sobre o saldo não pago; compras novas à parte.',
        'Pacotes: some aparelho e serviço no período inteiro.',
      ],
    })),

    stage('valor-presente', 'aprofundamento', 'O valor de hoje das parcelas', 'Comparar pagamentos em datas diferentes trazendo-os para hoje (valor presente) ou levando o dinheiro aplicado até a data do pagamento, e descobrir a taxa de um financiamento com parcelas.', () => ({
      learn: [
        text('Pagar depois tem valor: o dinheiro que fica com você pode render. Para comparar pagamentos em **datas diferentes**, leve todos para a mesma data. O **valor presente** de um pagamento P feito daqui a k meses, à taxa i, é P ÷ (1 + i)ᵏ: é quanto seria preciso aplicar hoje para ter P na data.'),
        lab({
          title: 'O que as parcelas valem hoje',
          intro: 'Compare o preço à vista com o valor de hoje de parcelas mensais iguais, sabendo quanto o dinheiro rende ao mês.',
          params: [
            { key: 'V', label: 'Preço à vista', min: 500, max: 3000, step: 50, value: 1500, format: (v) => brl(v) },
            { key: 'P', label: 'Parcela', min: 100, max: 1500, step: 10, value: 800, format: (v) => brl(v) },
            { key: 'n', label: 'Parcelas (a 1ª em 30 dias)', min: 1, max: 4, step: 1, value: 2, format: (v) => `${v}` },
            { key: 'i', label: 'Rendimento ao mês', min: 0, max: 10, step: 1, value: 3, format: (v) => pct(v) },
          ],
          readouts: ({ V, P, n, i }) => {
            let pv = 0;
            for (let k = 1; k <= n; k++) pv += P / (1 + i / 100) ** k;
            const diff = pv - V;
            return [
              { label: 'Soma das parcelas', value: brl(n * P) },
              { label: 'Valor de hoje das parcelas', value: brl(pv), big: true, tone: 'brass' },
              { label: 'Melhor opção', value: Math.abs(diff) < 0.005 ? 'empate' : diff > 0 ? `à vista (${brl(diff)} a menos, em valor de hoje)` : `a prazo (${brl(-diff)} a menos, em valor de hoje)` },
            ];
          },
          viz: ({ V, P, n, i }) => {
            let pv = 0;
            for (let k = 1; k <= n; k++) pv += P / (1 + i / 100) ** k;
            return {
              kind: 'bars',
              bars: [
                { label: 'À vista', value: V, text: brl(V), tone: 'verdigris' },
                { label: 'Parcelas hoje', value: pv, text: brl(pv), tone: 'brass' },
                { label: 'Soma das parcelas', value: n * P, text: brl(n * P), tone: 'mist' },
              ],
              summary: `À vista ${brl(V)}; as parcelas valem ${brl(pv)} hoje e somam ${brl(n * P)}`,
            };
          },
          goal: {
            task: 'Com preço à vista de R$ 1.200,00 e 2 parcelas de R$ 650,00, ache o menor rendimento mensal que torna o parcelamento mais barato, em valor de hoje.',
            done: ({ V, P, n, i }) => V === 1200 && P === 650 && n === 2 && i === 6,
            success: 'Isso: a 6% ao mês, 650 ÷ 1,06 + 650 ÷ 1,06² ≈ R$ 1.191,71, menos que R$ 1.200,00. A 5%, seriam R$ 1.208,62.',
          },
          insight: 'Quanto mais o dinheiro rende, menos as parcelas futuras valem hoje — e mais o parcelamento pode compensar.',
        }),
        key('Valor de hoje', 'VP de um pagamento P daqui a k meses = P ÷ (1 + i)ᵏ. Some os VPs das parcelas e compare com o preço à vista: se a soma for menor, parcelar compensa para quem consegue render i ao mês.'),
        example('Pagar depois e aplicar', 'Um purificador de ar custa R$ 2.000,00 à vista ou R$ 2.150,00 em pagamento único daqui a 3 meses. A cliente pode aplicar os R$ 2.000,00 a 2% ao mês, juros simples. Quanto ela precisará complementar no vencimento?', [
          step('A aplicação em 3 meses:', '2.000 × (1 + 3 × 0,02) = R$ 2.120,00'),
          askStep('Compare com a dívida.', 'Quanto falta?', [
            ok('2.150 − 2.120 = R$ 30,00'),
            no('2.150 − 2.000 = R$ 150,00', 'Os R$ 2.000,00 não ficam parados: rendem R$ 120,00 até o vencimento.'),
          ]),
        ], 'Ela precisará complementar R$ 30,00.'),
        example('Parte hoje, parte depois', 'Um forno elétrico custa R$ 2.500,00 para pagamento hoje. Uma proposta equivalente, com juros compostos de 8% ao mês, permite pagar uma parte hoje e R$ 1.166,40 daqui a 2 meses. Qual é a parte de hoje?', [
          step('Valor de hoje do pagamento futuro:', '1.166,40 ÷ 1,08² = 1.166,40 ÷ 1,1664 = R$ 1.000,00'),
          askStep('O resto é pago hoje.', 'Qual é a parte de hoje?', [
            ok('2.500 − 1.000 = R$ 1.500,00'),
            no('2.500 − 1.166,40 = R$ 1.333,60', 'Subtrair o pagamento futuro sem trazê-lo para hoje ignora os juros: em valor de hoje, ele vale R$ 1.000,00.'),
          ]),
        ], 'A parte de hoje é R$ 1.500,00.'),
        example('A taxa de um financiamento', 'Uma adega climatizada custa R$ 1.775,00 à vista. A prazo, paga-se R$ 500,00 de entrada e 2 parcelas mensais de R$ 676,00, calculadas com juros compostos sobre o saldo. Qual é a taxa mensal?', [
          step('Valor financiado:', '1.775 − 500 = R$ 1.275,00'),
          askStep('Teste uma taxa: as parcelas, trazidas para hoje, devem somar R$ 1.275,00.', 'Qual taxa funciona?', [
            ok('4%: 676 ÷ 1,04 + 676 ÷ 1,04² = 650 + 625 = 1.275'),
            no('3%: 676 ÷ 1,03 + 676 ÷ 1,03² ≈ 1.293,51', 'A 3%, as parcelas valeriam mais que o financiado: a taxa verdadeira é maior. Teste 4%.'),
          ]),
        ], 'A taxa é de 4% ao mês.'),
        check(numeric({
          prompt: [p('Para pagar R$ 1.500,00 em 5 meses, há duas propostas, ambas "com juros de 2% ao mês". Na loja, os juros são 2% do preço por mês, somados ao preço. No banco, paga-se R$ 300,00 da dívida por mês, mais 2% sobre o saldo devedor do início de cada mês.')],
          ask: 'Quanto se economiza em juros escolhendo o banco?',
          prefix: 'R$',
          answer: 60,
          wrong: [
            { value: 0, feedback: 'A taxa é a mesma, mas a base não: no banco, os juros incidem sobre um saldo que diminui todo mês.' },
            { value: 150, feedback: 'R$ 150,00 são os juros da loja (5 × 2% de R$ 1.500,00). Subtraia os juros do banco.' },
            { value: 90, feedback: 'R$ 90,00 são os juros do banco (2% de 1.500 + 1.200 + 900 + 600 + 300). A economia é a diferença para a loja.' },
          ],
          solution: ['$Loja: 5 × 0,02 × 1.500 = 150', '$Banco: 0,02 × (1.500 + 1.200 + 900 + 600 + 300) = 0,02 × 4.500 = 90', '$Economia: 150 − 90 = 60'],
        })),
      ],
      practice: [gen(investLaterGen), gen(partTodayGen), gen(pvCompareGen)],
      challenge: [gen(pvCompareGen), gen(parcelRateGen), gen(bankVsStoreGen), gen(partTodayGen)],
      recap: [
        'Datas diferentes: leve tudo para a mesma data.',
        'VP = P ÷ (1 + i)ᵏ.',
        'Mesma taxa, bases diferentes: compare os juros em reais.',
      ],
    })),

    stage('maestria', 'maestria', 'Maestria: a melhor forma de pagar', 'Resolver problemas inéditos de compra a prazo que combinam totais, entradas, juros embutidos, regras de contrato e valor presente.', () => ({
      learn: [
        strategy('Compra a prazo em 4 passos', '1) Liste cada pagamento com a sua data. 2) Separe o que é entrada do que é financiado. 3) Ache a base de cada porcentagem. 4) Compare totais — ou, se as datas importam, valores de hoje.'),
        example('Mesmo total, custos diferentes', 'Uma bateria eletrônica custa R$ 2.000,00 à vista. Proposta 1: 10 parcelas de R$ 210,00, sem entrada. Proposta 2: R$ 500,00 de entrada e R$ 1.600,00 em 30 dias. Qual proposta é mais cara?', [
          step('Proposta 1:', '10 × 210 = R$ 2.100,00: R$ 100,00 de juros, diluídos em 10 meses'),
          step('Proposta 2:', '500 + 1.600 = R$ 2.100,00: os mesmos R$ 100,00 de juros, mas sobre R$ 1.500,00, num só mês'),
          askStep('Os juros em reais empatam.', 'Qual proposta é mais cara para quem pode render o dinheiro?', [
            ok('A proposta 2: 100 ÷ 1.500 ≈ 6,7% em um único mês'),
            no('Nenhuma: os totais são iguais', 'Totais iguais escondem prazos diferentes: na proposta 2, os R$ 100,00 de juros vêm em um mês, sobre R$ 1.500,00.'),
          ]),
        ], 'Com o mesmo total, a proposta 2 cobra uma taxa mensal bem maior.'),
        reveal('Por que o "sem juros" quase sempre tem juros?', 'Porque a loja recebe depois. Se ela dá desconto para quem paga à vista, o preço "cheio" do parcelado embute o rendimento que a loja deixa de ter. Quando não há desconto à vista, o parcelado sem juros é, de fato, vantajoso para quem consegue aplicar o dinheiro.'),
        check(numeric({
          prompt: [p('Um aquecedor solar custa R$ 4.000,00 à vista. No crediário, paga-se 20% de entrada; o saldo recebe acréscimo de 6% e é dividido em 8 parcelas iguais.')],
          ask: 'Qual é o acréscimo do total pago sobre o preço à vista?',
          unit: '%',
          answer: 4.8,
          wrong: [
            { value: 6, feedback: 'Os 6% incidem só sobre o saldo, que é 80% do preço. Sobre o preço à vista, o acréscimo é menor: R$ 192,00 de R$ 4.000,00.' },
            { value: 192, feedback: 'R$ 192,00 é o acréscimo em reais. Divida pelo preço à vista.' },
            { value: 4.58, feedback: 'Isso divide pelo total pago (192 ÷ 4.192). O acréscimo é medido sobre o preço à vista.' },
          ],
          solution: ['$Saldo: 4.000 − 800 = 3.200; com 6%, 3.392', '$Total: 800 + 3.392 = 4.192', '$192 ÷ 4.000 = 0,048 → 4,8%'],
        })),
      ],
      practice: [gen(extrasGen), gen(minEntryGen), gen(entryRateGen)],
      challenge: [gen(bestStoreGen), gen(hiddenRateGen), gen(pvCompareGen), gen(bankVsStoreGen)],
      recap: [
        'Liste os pagamentos com as datas.',
        'Juros: sobre o que ficou devendo.',
        'Datas diferentes: compare valores de hoje.',
      ],
    })),
  ],
});
