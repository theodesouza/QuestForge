/**
 * Aula: Custo-benefício — preço por unidade (quilo, litro, unidade aproveitada), promoções
 * (leve x pague y, produto a mais × desconto, teto de devolução, frete condicionado, caução),
 * durabilidade e consumo (custo por uso, energia, combustível), ponto de equilíbrio entre planos
 * com parte fixa e variável, combinações de embalagens e problemas de maestria (tarifa por
 * faixas, retorno de investimento, preço para receber um valor líquido).
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
import { brl, fixed, num, pct, qty, round } from '../../kit/format';
import type { Rand } from '../../types';

const cents = (x: number) => Number.isInteger(round(x * 100, 6));
const isInt = (x: number) => Number.isInteger(round(x, 9));
/** Reais nas contas: inteiro sem casas (2.550) e, se houver centavos, sempre duas (787,50). */
const rs = (x: number) => (isInt(x) ? num(x) : fixed(x, 2));
const up = (x: number) => Math.ceil(round(x, 9));
const down = (x: number) => Math.floor(round(x, 9));
/** Tamanho de embalagem: 750 g, 1,5 kg, 500 mL, 2 L. */
const size = (q: number, u: 'kg' | 'L') => (q < 1000 ? `${q} ${u === 'kg' ? 'g' : 'mL'}` : `${num(q / 1000, 3)} ${u}`);

// ———————————————————————————————————————————————— geradores: preço por unidade

const BULK = [
  { what: 'feijão', u: 'kg' as const },
  { what: 'farinha de trigo', u: 'kg' as const },
  { what: 'ração para gatos', u: 'kg' as const },
  { what: 'detergente', u: 'L' as const },
  { what: 'água sanitária', u: 'L' as const },
];

/** Duas embalagens do mesmo produto: o preço por quilo (ou litro) decide. */
function unitPriceGen(r: Rand) {
  for (;;) {
    const g = r.pick(BULK);
    const qs = r.pick([400, 500, 750, 800, 1000]);
    const ql = r.pick([1500, 2000, 2500, 3000, 5000]);
    const ks = r.pick([800, 900, 1000, 1200, 1400, 1500, 1600, 1800, 2000, 2400]); // centavos por kg (ou L)
    const delta = r.pick([50, 100, 150, 200, 250, 300]);
    if (qs === 750 && ks === 2000) continue; // questão do banco
    const kl = r.next() < 0.7 ? ks - delta : ks + delta;
    const ps = (qs * ks) / 100000;
    const pl = (ql * kl) / 100000;
    if (!cents(ps) || !cents(pl)) continue;
    const word = g.u === 'kg' ? 'quilo' : 'litro';
    const best = Math.min(ks, kl) / 100;
    const worst = Math.max(ks, kl) / 100;
    const perUnit = r.next() < 0.5;
    return draftNumeric({
      prompt: [p(`Um mercado vende ${g.what} em embalagens de ${size(qs, g.u)} por ${brl(ps)} e de ${size(ql, g.u)} por ${brl(pl)}. Os produtos são iguais, e tudo o que for comprado será usado.`)],
      ask: perUnit ? `Qual é o preço por ${word} da embalagem mais econômica?` : `Quanto se economiza, em cada ${word}, escolhendo a embalagem mais econômica?`,
      prefix: 'R$',
      answer: perUnit ? best : delta / 100,
      wrong: perUnit
        ? [
            { value: worst, feedback: `Esse é o preço por ${word} da outra embalagem. A mais econômica é a de menor preço por ${word}.` },
            { value: Math.min(ps, pl), feedback: `Esse é o preço de uma embalagem, e não o preço por ${word}. Divida cada preço pela quantidade.` },
            { value: delta / 100, feedback: `Essa é a diferença de preço por ${word}. A pergunta é o preço por ${word} da mais econômica.` },
          ]
        : [
            { value: round(Math.abs(pl - ps), 2), feedback: `Isso subtrai os preços de embalagens de tamanhos diferentes. Compare os preços por ${word}.` },
            { value: best, feedback: `Esse é o preço por ${word} da mais econômica. A economia é a diferença para a outra.` },
            { value: round(((delta / 100) * ql) / 1000, 2), feedback: `Isso é a economia na embalagem grande inteira. A pergunta é por ${word}.` },
          ],
      hints: [`Divida o preço de cada embalagem pela quantidade, na mesma unidade (${g.u}).`, `${size(qs, g.u)} = ${num(qs / 1000, 3)} ${g.u}: ${rs(ps)} ÷ ${num(qs / 1000, 3)} = ${brl(ks / 100)} por ${word}.`],
      solution: [
        `$${size(qs, g.u)}: ${rs(ps)} ÷ ${num(qs / 1000, 3)} = ${rs(ks / 100)} por ${word}`,
        `$${size(ql, g.u)}: ${rs(pl)} ÷ ${num(ql / 1000, 3)} = ${rs(kl / 100)} por ${word}`,
        perUnit ? `$Mais econômica: ${rs(best)} por ${word}` : `$Economia: ${rs(worst)} − ${rs(best)} = ${rs(delta / 100)} por ${word}`,
      ],
    });
  }
}

const STOCK = [
  { who: 'Um hotel', what: 'sabonetes' },
  { who: 'Uma escola', what: 'copos de papel' },
  { who: 'Um escritório', what: 'cápsulas de café' },
];

/** A quantidade necessária na embalagem pequena ou na grande. */
function bulkSaveGen(r: Rand) {
  for (;;) {
    const s = r.pick([12, 20, 24, 30]);
    const L = r.pick([48, 60, 90, 120]);
    const d = r.pick([4, 5, 6, 8, 10, 12]);
    const D = 30;
    const N = d * D;
    if (N % s || N % L) continue;
    const cs = r.pick([120, 150, 180, 200, 240, 250]);
    const cl = cs - r.pick([10, 15, 20, 25, 30]);
    const ps = (s * cs) / 100;
    const pl = (L * cl) / 100;
    const costS = (N / s) * ps;
    const costL = (N / L) * pl;
    const save = costS - costL;
    const st = r.pick(STOCK);
    return draftNumeric({
      prompt: [
        p(`${st.who} usa, em média, ${d} ${st.what} por dia e vai comprar, de uma vez, exatamente o necessário para ${D} dias. Há duas embalagens do mesmo produto:`),
        table(['Embalagem', 'Quantidade', 'Preço'], [['Pequena', `${s} ${st.what}`, brl(ps)], ['Grande', `${L} ${st.what}`, brl(pl)]]),
      ],
      ask: 'Escolhendo a embalagem de menor preço por unidade, quanto se economiza na compra, em relação à outra?',
      prefix: 'R$',
      answer: round(save, 2),
      wrong: [
        { value: round((cs - cl) / 100, 2), feedback: `Essa é a economia por unidade. Multiplique pelo total necessário: ${d} × ${D} = ${N}.` },
        { value: round(Math.abs(pl - ps), 2), feedback: 'Isso compara o preço de uma embalagem de cada, com quantidades diferentes. Calcule o gasto de cada opção para o total necessário.' },
        { value: round(costL, 2), feedback: 'Esse é o gasto com a embalagem mais econômica. A pergunta é a economia: a diferença para a outra.' },
        { value: round(((cs - cl) / 100) * d, 2), feedback: `Essa é a economia de um dia só. São ${D} dias.` },
      ],
      hints: [`Total necessário: ${d} × ${D} = ${N} ${st.what}.`, `Preço por unidade: ${rs(ps)} ÷ ${s} = ${brl(cs / 100)}; ${rs(pl)} ÷ ${L} = ${brl(cl / 100)}.`],
      solution: [`$Pequena: ${N / s} × ${rs(ps)} = ${rs(costS)}`, `$Grande: ${N / L} × ${rs(pl)} = ${rs(costL)}`, `$Economia: ${rs(costS)} − ${rs(costL)} = ${rs(save)}`],
    });
  }
}

/** Caixa fechada com sobra sem uso × granel na quantidade exata; ou lote maior com desconto. */
function leftoverGen(r: Rand) {
  for (;;) {
    if (r.next() < 0.5) {
      const q = r.pick([3, 4, 5, 6, 7, 8, 12]);
      const Q = r.pick([10, 15, 20, 25]);
      const pk = r.pick([5, 6, 8, 9, 10, 12]);
      const pb = pk - r.pick([1, 2, 3]);
      const PB = Q * pb;
      if (q >= Q || PB <= q * pk) continue;
      const save = PB - q * pk;
      const what = r.pick(['tomates para um molho', 'laranjas para sucos', 'batatas para uma festa junina']);
      return draftNumeric({
        prompt: [p(`Uma cozinha comunitária precisa de exatamente ${q} kg de ${what}. Uma caixa fechada com ${Q} kg custa ${brl(PB)}, mas o que sobrar não terá uso nem valor de revenda. O mesmo produto, a granel, custa ${brl(pk)} o quilo, na quantidade exata.`)],
        ask: `Quanto se economiza comprando só os ${q} kg a granel?`,
        prefix: 'R$',
        answer: save,
        wrong: [
          { value: q * (pk - pb), feedback: `Isso compara só o preço por quilo, como se a caixa fosse usada inteira. Sobram ${Q - q} kg sem uso: compare os gastos totais.` },
          { value: (Q - q) * pb, feedback: 'Esse é o valor pago pela sobra da caixa. A economia compara o gasto total da caixa com o do granel.' },
          { value: q * pk, feedback: 'Esse é o gasto a granel. A economia é a diferença para o preço da caixa.' },
        ],
        hints: [`A granel: ${q} × ${num(pk)} = ${brl(q * pk)}.`, `A caixa custa ${brl(PB)}, mesmo com ${Q - q} kg sem uso.`],
        solution: [`$Economia: ${num(PB)} − ${num(q * pk)} = ${num(save)}`],
      });
    }
    const n = r.pick([50, 80, 100, 150, 200]);
    const m = n + r.pick([20, 30, 50]);
    const u = r.pick([80, 120, 150, 200, 250]); // centavos
    const d = r.pick([20, 25, 30, 40]);
    const A = (n * u) / 100;
    const B = (m * u * (100 - d)) / 10000;
    const save = A - B;
    if (save <= 0 || !cents(B)) continue;
    const what = r.pick(['sacolas de papel', 'envelopes', 'cartões de visita']);
    return draftNumeric({
      prompt: [p(`Uma feira de artesanato precisa de ${n} ${what} e pode comprar um lote de ${n} ou de ${m} unidades. O preço normal é ${brl(u / 100)} por unidade; no lote de ${m}, há desconto de ${pct(d)} sobre todas as unidades. As ${m - n} unidades excedentes podem ser guardadas sem custo.`)],
      ask: `Quanto se economiza no desembolso comprando o lote de ${m} em vez do de ${n}?`,
      prefix: 'R$',
      answer: round(save, 2),
      wrong: [
        { value: round((n * u * d) / 10000, 2), feedback: `Isso aplica o desconto às ${n} unidades necessárias. O lote tem ${m} unidades: calcule o preço do lote inteiro.` },
        { value: round(B, 2), feedback: 'Esse é o preço do lote maior. A economia é a diferença para o lote menor.' },
        { value: round(((m - n) * u) / 100, 2), feedback: 'Esse é o valor normal das unidades excedentes. Compare os desembolsos dos dois lotes.' },
      ],
      hints: [`Lote de ${n}: ${n} × ${rs(u / 100)} = ${brl(A)}.`, `Lote de ${m}: ${m} × ${rs(u / 100)} × ${num(1 - d / 100, 2)} = ${brl(B)}.`],
      solution: [`$${rs(A)} − ${rs(B)} = ${rs(save)}`],
    });
  }
}

/** Concentrado que rende mais, ou perda na limpeza: o custo do que é aproveitado. */
function yieldGen(r: Rand) {
  for (;;) {
    if (r.next() < 0.5) {
      const B = r.pick([0.5, 1, 2]);
      const k = r.pick([3, 4, 5, 6, 10]);
      const PB = r.pick([12, 15, 18, 20, 24, 30, 36]);
      const rp = r.pick([3, 3.5, 4, 4.5, 5, 6]);
      const mult = r.pick([1, 2, 3]);
      if (B === 1 && k === 4 && PB === 18 && rp === 5.5) continue; // exercício da teoria
      const Y = B * k;
      const N = Y * mult;
      const save = N * rp - mult * PB;
      if (save <= 0 || !cents(save)) continue;
      return draftNumeric({
        prompt: [p(`Um frasco de ${num(B)} L de limpador concentrado custa ${brl(PB)} e, diluído em água, rende ${num(Y)} L de produto pronto. O mesmo limpador, já pronto, custa ${brl(rp)} o litro. A água não entra na conta.`)],
        ask: `Quanto se economiza para obter ${num(N)} L usando o concentrado?`,
        prefix: 'R$',
        answer: round(save, 2),
        wrong: [
          ...(mult > 1 ? [{ value: round(N * rp - PB, 2), feedback: `Isso compra um frasco só, que rende ${num(Y)} L. Para ${num(N)} L, são ${mult} frascos.` }] : []),
          { value: round(rp - PB / Y, 2), feedback: `Essa é a economia por litro. Multiplique pelos ${num(N)} L.` },
          { value: round(N * rp, 2), feedback: 'Esse é o gasto com o produto pronto. A economia é a diferença para o concentrado.' },
          { value: round(mult * B * rp - mult * PB, 2), feedback: `Isso compara o frasco com só ${num(B)} L de produto pronto. Ele rende ${num(Y)} L.` },
        ].filter((w) => w.value > 0),
        hints: [`Frascos necessários: ${num(N)} ÷ ${num(Y)} = ${mult}.`, `Concentrado: ${mult} × ${rs(PB)}; pronto: ${num(N)} × ${rs(rp)}.`],
        solution: [`$Pronto: ${num(N)} × ${rs(rp)} = ${rs(N * rp)}`, `$Concentrado: ${mult} × ${rs(PB)} = ${rs(mult * PB)}`, `$Economia: ${rs(save)}`],
      });
    }
    const Q = r.pick([2, 3, 4, 5, 6, 8, 10]);
    const P = r.pick([24, 30, 36, 40, 48, 60, 72, 90, 120]);
    const keep = r.pick([50, 60, 75, 80]);
    if (Q === 4 && P === 120 && keep === 60) continue; // exemplo da teoria
    const cost = P / ((Q * keep) / 100);
    if (!cents(cost)) continue;
    const what = r.pick(['camarão com casca', 'abóbora com casca', 'frango com osso']);
    return draftNumeric({
      prompt: [p(`Um restaurante compra ${Q} kg de ${what} por ${brl(P)}. Depois da limpeza, aproveita só ${pct(keep)} da massa.`)],
      ask: 'Qual é o custo por quilo efetivamente aproveitado?',
      prefix: 'R$',
      answer: round(cost, 2),
      wrong: [
        { value: round(P / Q, 2), feedback: `Isso divide pelo peso comprado. Só ${pct(keep)} são aproveitados: divida pelo que sobra.` },
        { value: round(P / ((Q * (100 - keep)) / 100), 2), feedback: 'Isso divide pela parte perdida. Divida pela parte aproveitada.' },
        { value: round((P / Q) * (1 + (100 - keep) / 100), 2), feedback: `Somar ${pct(100 - keep)} ao preço por quilo só aproxima. O custo certo é o preço ÷ massa aproveitada.` },
      ],
      hints: [`Massa aproveitada: ${pct(keep)} de ${Q} kg = ${num((Q * keep) / 100, 2)} kg.`, `Divida ${brl(P)} por essa massa.`],
      solution: [`$${num(P)} ÷ ${num((Q * keep) / 100, 2)} = ${rs(cost)} por quilo`],
    });
  }
}

// ———————————————————————————————————————————————— geradores: promoções

/** "Leve x, pague y": unidades pagas; ou comparação com um desconto por unidade. */
function takePayGen(r: Rand) {
  for (;;) {
    const x = r.pick([3, 4, 5]);
    const y = x - 1;
    const pr = r.pick([8, 9, 12, 15, 18, 20, 24]);
    const item = r.pick([
      { what: 'garrafas de suco', bought: 'compradas' },
      { what: 'pacotes de biscoito', bought: 'comprados' },
      { what: 'potes de sorvete', bought: 'comprados' },
    ]);
    const what = item.what;
    if (r.next() < 0.5) {
      const n = r.pick([6, 8, 9, 10, 11, 13, 15, 16, 19, 20]);
      const groups = down(n / x);
      if (groups === 0) continue;
      const paid = groups * y + (n % x);
      const units = r.next() < 0.5;
      return draftNumeric({
        prompt: [p(`Um mercado vende ${what} a ${brl(pr)} a unidade, com a promoção "leve ${x}, pague ${y}", válida para cada grupo completo de ${x}. Para uma festa, serão compradas ${n} unidades.`)],
        ask: units ? 'Por quantas unidades se pagará?' : 'Quanto se pagará pela compra?',
        ...(units ? { unit: 'unidades' } : { prefix: 'R$' }),
        answer: units ? paid : paid * pr,
        wrong: [
          ...(n % x ? [{ value: round(((n * y) / x) * (units ? 1 : pr), 2), feedback: `Isso aplica a proporção ${y} de ${x} a todas as unidades. A promoção vale só para grupos completos: as ${n % x} que sobram são pagas normalmente.` }] : []),
          ...(n % x ? [{ value: groups * y * (units ? 1 : pr), feedback: `Isso esquece ${n % x === 1 ? 'a unidade que fica fora dos grupos completos: ela também é paga' : `as ${n % x} unidades fora dos grupos completos: elas também são pagas`}.` }] : []),
          { value: n * (units ? 1 : pr), feedback: 'Isso ignora a promoção.' },
          ...(groups > 1 ? [{ value: (n - 1) * (units ? 1 : pr), feedback: `Isso aplica a promoção uma vez só. Ela vale para cada grupo completo de ${x}: são ${groups} grupos.` }] : []),
        ],
        hints: [`Grupos completos de ${x}: ${n} = ${groups} × ${x} + ${n % x}.`, `Em cada grupo, pagam-se ${y}; as que sobram são pagas inteiras.`],
        solution: [`$Pagas: ${groups} × ${y} + ${n % x} = ${paid}`, ...(units ? [] : [`$${paid} × ${num(pr)} = ${num(paid * pr)}`])],
      });
    }
    const n = x * r.pick([2, 3, 4]);
    const d = r.pick([15, 20, 25, 30]);
    const pB = pr + r.pick([-2, -1, 1, 2]);
    const costA = (n / x) * y * pr;
    const costB = (n * pB * (100 - d)) / 100;
    if (!cents(costB) || costA === costB) continue;
    const best = Math.min(costA, costB);
    return draftNumeric({
      prompt: [
        p(`Para uma festa, serão ${item.bought} ${n} ${what}. Dois mercados vendem o mesmo produto:`),
        table(['Mercado', 'Preço da unidade', 'Promoção'], [['Ipiranga', brl(pr), `Leve ${x}, pague ${y}`], ['Itaúna', brl(pB), `${pct(d)} de desconto em cada unidade`]]),
        p(`No Ipiranga, a promoção vale para cada grupo completo de ${x}. Tudo será comprado no mercado de menor gasto total.`),
      ],
      ask: 'Quanto se gastará na compra?',
      prefix: 'R$',
      answer: round(best, 2),
      wrong: [
        { value: round(Math.max(costA, costB), 2), feedback: 'Esse é o gasto no outro mercado. Compare os dois totais e escolha o menor.' },
        { value: n * pr, feedback: 'Isso ignora as promoções. Calcule o gasto com cada uma.' },
        { value: round((n * Math.min(pr, pB) * (100 - d)) / 100, 2), feedback: `Isso aplica o desconto de ${pct(d)} ao menor preço, misturando os mercados. Cada promoção vale só no seu mercado.` },
      ],
      hints: [`Ipiranga: ${n} unidades = ${n / x} grupos de ${x}; pagam-se ${(n / x) * y}.`, `Itaúna: ${n} × ${rs(pB)} × ${num(1 - d / 100, 2)}.`],
      solution: [`$Ipiranga: ${(n / x) * y} × ${num(pr)} = ${rs(costA)}`, `$Itaúna: ${n} × ${rs(pB)} × ${num(1 - d / 100, 2)} = ${rs(costB)}`, `$Menor gasto: ${rs(best)}`],
    });
  }
}

const LIQUIDS = [
  { what: 'óleo de cozinha', who: 'Um restaurante', sold: 'vendido' },
  { what: 'água sanitária', who: 'Uma escola', sold: 'vendida' },
  { what: 'sabão líquido', who: 'Um hotel', sold: 'vendido' },
];

/** "b% a mais de produto pelo mesmo preço" × "d% de desconto": o preço por litro decide. */
function moreOrOffGen(r: Rand) {
  for (;;) {
    const o = r.pick([
      { V: 2, big: 3, Q: 6 },
      { V: 2, big: 2.5, Q: 10 },
      { V: 4, big: 5, Q: 20 },
      { V: 5, big: 6, Q: 30 },
    ]);
    const b = round((o.big / o.V - 1) * 100, 2);
    const P = r.pick([18, 20, 24, 30, 36, 40, 45, 60]);
    const d = r.pick([10, 15, 20, 25, 30]);
    const Q = o.Q * r.pick([1, 2]);
    if (o.V === 5 && P === 45 && d === 20) continue; // questão do banco
    const costA = (Q / o.big) * P;
    const costB = ((Q / o.V) * P * (100 - d)) / 100;
    if (costA === costB || !cents(costB)) continue;
    const save = round(Math.abs(costA - costB), 2);
    const l = r.pick(LIQUIDS);
    return draftNumeric({
      prompt: [
        p(`${l.who} usa ${l.what}, ${l.sold} normalmente em embalagens de ${num(o.V)} L por ${brl(P)}. Nesta semana, dois atacados fizeram promoções diferentes:`),
        table(['Atacado', 'Promoção'], [['Pinheiro', `Embalagem com ${pct(b)} a mais de produto (${num(o.big)} L), pelo preço normal de ${brl(P)}`], ['Cedro', `Embalagem comum de ${num(o.V)} L com ${pct(d)} de desconto no preço`]]),
        p(`São necessários exatamente ${num(Q)} L, e tudo será comprado no atacado de menor preço por litro.`),
      ],
      ask: 'Em relação ao que gastaria no outro atacado, quanto se economizará?',
      prefix: 'R$',
      answer: save,
      wrong: [
        { value: round(Math.abs(P / o.big - (P * (100 - d)) / 100 / o.V), 2), feedback: `Essa é a diferença por litro. Multiplique pelos ${num(Q)} L.` },
        { value: round(Math.min(costA, costB), 2), feedback: 'Esse é o gasto no atacado escolhido. A economia é a diferença para o outro.' },
        { value: round((P * d) / 100, 2), feedback: 'Esse é o desconto de uma embalagem só. Compare os gastos totais para a quantidade necessária.' },
        { value: 0, feedback: `Produto a mais e desconto não se equivalem: ${pct(b)} a mais deixa o litro por ${rs(P / o.big)}, e ${pct(d)} de desconto, por ${rs((P * (100 - d)) / 100 / o.V)}.` },
      ],
      hints: [`Pinheiro: ${rs(P)} ÷ ${num(o.big)} L = ${brl(P / o.big)} por litro.`, `Cedro: ${rs((P * (100 - d)) / 100)} ÷ ${num(o.V)} L = ${brl((P * (100 - d)) / 100 / o.V)} por litro.`],
      solution: [`$Pinheiro: ${num(Q / o.big)} × ${rs(P)} = ${rs(costA)}`, `$Cedro: ${num(Q / o.V)} × ${rs((P * (100 - d)) / 100)} = ${rs(costB)}`, `$Economia: ${rs(save)}`],
    });
  }
}

/** Desconto imediato × devolução em dinheiro com teto. */
function capRefundGen(r: Rand) {
  for (;;) {
    const V = r.pick([300, 400, 500, 600, 900, 1000, 1200]);
    const d = r.pick([4, 5, 6, 8, 10]);
    const rr = d + r.pick([2, 3, 4, 5, 10]);
    const C = r.pick([20, 25, 30, 40, 50, 60]);
    if (V === 600 && d === 5 && rr === 10 && C === 25) continue; // exercício da teoria
    const disc = (V * d) / 100;
    const full = (V * rr) / 100;
    if (full <= C) continue; // o teto precisa limitar a devolução
    const back = C;
    if (disc === back) continue;
    const diff = Math.abs(disc - back);
    return draftNumeric({
      prompt: [p(`Uma compra de ${brl(V)} pode ter ${pct(d)} de desconto imediato ou ${pct(rr)} de devolução em dinheiro, limitada a ${brl(C)}. A devolução é imediata e livre para uso, e as promoções não se combinam.`)],
      ask: 'Quanto a opção mais vantajosa economiza a mais que a outra?',
      prefix: 'R$',
      answer: round(diff, 2),
      wrong: [
        ...(full > disc ? [{ value: round(full - disc, 2), feedback: `Isso ignora o teto: ${pct(rr)} dariam ${brl(full)}, mas a devolução fica limitada a ${brl(C)}.` }] : []),
        { value: round(disc, 2), feedback: 'Esse é só o desconto imediato. Compare com a devolução, já limitada pelo teto.' },
        { value: back, feedback: 'Essa é só a devolução, já limitada pelo teto. Compare com o desconto imediato.' },
      ],
      hints: [`Desconto: ${pct(d)} de ${brl(V)} = ${brl(disc)}.`, `Devolução: ${pct(rr)} de ${brl(V)} = ${brl(full)}, mas o teto é ${brl(C)}.`],
      solution: [`$Desconto: ${rs(disc)}; devolução: ${rs(back)}`, `$Diferença: ${rs(Math.max(disc, back))} − ${rs(Math.min(disc, back))} = ${rs(diff)}`],
    });
  }
}

/** Cupom que pode derrubar o pedido para baixo do frete grátis. */
function freeShipGen(r: Rand) {
  for (;;) {
    const T = r.pick([150, 200, 250, 300, 400]);
    const V = T + r.pick([10, 20, 30, 50, 80]);
    const c = r.pick([5, 10, 15]);
    const S = r.pick([15, 20, 25, 30, 35]);
    const withC = (V * (100 - c)) / 100;
    const below = withC < T;
    const total = below ? withC + S : withC;
    const save = V - total;
    if (save <= 0 || !cents(withC)) continue;
    return draftNumeric({
      prompt: [p(`Uma loja virtual dá frete grátis quando o valor dos produtos, depois de qualquer desconto, é de pelo menos ${brl(T)}; abaixo disso, o frete custa ${brl(S)}. Um pedido tem ${brl(V)} em produtos, e há um cupom de ${pct(c)} de desconto sobre os produtos.`)],
      ask: 'Quanto se economiza no total usando o cupom, em relação ao mesmo pedido sem cupom?',
      prefix: 'R$',
      answer: round(save, 2),
      wrong: [
        ...(below
          ? [
              { value: round((V * c) / 100, 2), feedback: `Isso considera só o desconto. Com o cupom, os produtos ficam em ${brl(withC)}, abaixo de ${brl(T)}: o frete de ${brl(S)} passa a ser cobrado.` },
              { value: round((V * c) / 100 + S, 2), feedback: 'Isso soma o frete à economia. O frete é um custo novo: ele diminui a economia.' },
            ]
          : [{ value: round((V * c) / 100 - S, 2), feedback: `Com o cupom, os produtos ficam em ${brl(withC)}, ainda acima de ${brl(T)}: o frete continua grátis.` }]),
        { value: round(total, 2), feedback: 'Esse é o total pago com o cupom. A economia é a diferença para o pedido sem cupom.' },
      ].filter((w) => w.value > 0),
      hints: [`Com o cupom: ${num(V)} × ${num(1 - c / 100, 2)} = ${brl(withC)}.`, `Compare com ${brl(T)} para saber se há frete.`],
      solution: [`$Com cupom: ${rs(withC)}${below ? ` + ${num(S)} de frete = ${rs(total)}` : ', frete grátis'}`, `$Economia: ${num(V)} − ${rs(total)} = ${rs(save)}`],
    });
  }
}

/** Plano anual (ou trimestral) × mensalidades: o desconto percentual. */
function planDiscountGen(r: Rand) {
  for (;;) {
    const M = r.pick([20, 25, 30, 40, 50, 60]);
    const annual = r.next() < 0.6;
    const k = annual ? 12 : 3;
    const dd = r.pick([10, 15, 20, 25, 30]);
    const price = (k * M * (100 - dd)) / 100;
    if (!cents(price)) continue;
    return draftNumeric({
      prompt: [p(`Um aplicativo de música cobra ${brl(M)} por mês no plano mensal, ou ${brl(price)} ${annual ? 'por ano, pagos de uma vez' : 'a cada 3 meses'}.`)],
      ask: `Em relação a pagar ${k} mensalidades, qual é o desconto percentual do plano ${annual ? 'anual' : 'trimestral'}?`,
      unit: '%',
      answer: dd,
      wrong: [
        { value: round(((k * M - price) / price) * 100, 2), feedback: `Isso divide pela base errada. O desconto é medido sobre o que se pagaria nas mensalidades, ${brl(k * M)}.` },
        { value: round(k * M - price, 2), feedback: `${brl(k * M - price)} é o desconto em reais. Divida por ${brl(k * M)}.` },
        { value: round((price / (k * M)) * 100, 2), feedback: 'Isso é quanto o plano custa em relação às mensalidades. O desconto é o que falta para 100%.' },
      ],
      hints: [`${k} mensalidades: ${k} × ${num(M)} = ${brl(k * M)}.`, `Desconto: (${num(k * M)} − ${rs(price)}) ÷ ${num(k * M)}.`],
      solution: [`$${rs(k * M - price)} ÷ ${num(k * M)} = ${num(dd / 100, 2)} → ${pct(dd)}`],
    });
  }
}

/** Garrafões retornáveis com caução × descartáveis. */
function depositReturnGen(r: Rand) {
  for (;;) {
    const n = r.pick([6, 8, 10, 12, 20]);
    const pr = r.pick([12, 15, 18, 20, 24]);
    const k = r.pick([2, 3, 4, 5]);
    const lost = r.pick([1, 2, 3]);
    const q = pr - k + r.pick([1, 2, 3]);
    const ret = n * pr - (n - lost) * k;
    const alt = n * q;
    const save = alt - ret;
    if (save <= 0) continue;
    return draftNumeric({
      prompt: [p(`Um grupo de escoteiros compra ${n} garrafões retornáveis de água por ${brl(pr)} cada. O preço inclui uma caução de ${brl(k)} por garrafão, devolvida para cada unidade retornada. O grupo devolve ${n - lost} e perde ${lost === 1 ? 'um' : lost}. A mesma água em garrafão descartável custaria ${brl(q)} a unidade.`)],
      ask: 'Quanto a compra retornável economiza, já descontadas as cauções recuperadas?',
      prefix: 'R$',
      answer: save,
      wrong: [
        { value: alt - (n * pr - n * k), feedback: 'Isso recupera a caução de todos os garrafões. Os perdidos não devolvem a caução.' },
        { value: (n - lost) * k, feedback: 'Esse é o total de cauções recuperadas, e não a economia.' },
        { value: ret, feedback: 'Esse é o gasto líquido com os retornáveis. Compare com o gasto com os descartáveis.' },
      ],
      hints: [`Retornáveis: ${n} × ${num(pr)} − ${n - lost} × ${num(k)} = ${brl(ret)}.`, `Descartáveis: ${n} × ${num(q)} = ${brl(alt)}.`],
      solution: [`$Economia: ${num(alt)} − ${num(ret)} = ${num(save)}`],
    });
  }
}

// ———————————————————————————————————————————————— geradores: durabilidade e consumo

const WEAR = [
  { who: 'Um ciclista', need: (D: number) => `vai rodar ${num(D)} km`, model: 'pneu', unit: 'km', lives: [2000, 2500, 3000, 4000, 5000], D: [9000, 10000, 12000, 15000] },
  { who: 'Uma família', need: (D: number) => `vai usar o purificador por ${D} meses`, model: 'refil de filtro', unit: 'meses', lives: [3, 4, 5, 6, 8], D: [12, 18, 24] },
  { who: 'Uma marcenaria', need: (D: number) => `vai fazer ${num(D)} cortes`, model: 'lâmina de serra', unit: 'cortes', lives: [400, 500, 600, 800, 1000], D: [2400, 3000, 4000] },
];

/** Durabilidade: comprar de novo quando acaba, até completar o período. */
function durableGen(r: Rand) {
  for (;;) {
    const w = r.pick(WEAR);
    const D = r.pick(w.D);
    const [la, lb] = r.shuffle(w.lives).slice(0, 2).sort((a, b) => a - b);
    const pa = r.pick([40, 60, 80, 90, 120, 150]);
    const pb = round(pa * r.pick([1.2, 1.4, 1.5, 1.6, 1.8, 2]), 2);
    const na = up(D / la);
    const nb = up(D / lb);
    const A = na * pa;
    const B = nb * pb;
    if (A === B || !cents(pb)) continue;
    const save = round(Math.abs(A - B), 2);
    const frac = !isInt(D / la) || !isInt(D / lb);
    return draftNumeric({
      prompt: [
        p(`${w.who} ${w.need(D)} e vai escolher entre dois modelos de ${w.model}, comprando um novo só quando o anterior chegar ao fim da durabilidade indicada:`),
        table(['Modelo', 'Preço', 'Durabilidade'], [['Básico', brl(pa), `${num(la)} ${w.unit}`], ['Durável', brl(pb), `${num(lb)} ${w.unit}`]]),
        p('Será usado sempre o mesmo modelo, e nada será comprado depois de completar o período.'),
      ],
      ask: 'Escolhendo o modelo mais barato no período, quanto se economiza em relação ao outro?',
      prefix: 'R$',
      answer: save,
      wrong: [
        { value: round(Math.abs(pb - pa), 2), feedback: 'Isso compara o preço de uma unidade de cada. Conte quantas unidades de cada modelo serão compradas no período.' },
        ...(frac ? [{ value: round(Math.abs((D / la) * pa - (D / lb) * pb), 2), feedback: 'Isso usa frações de unidade. Cada compra é de uma unidade inteira: arredonde para cima o número de compras.' }] : []),
        { value: round(Math.min(A, B), 2), feedback: 'Esse é o gasto com o modelo mais barato. A pergunta é a economia: a diferença para o outro.' },
      ],
      hints: [`Básico: ${num(D)} ÷ ${num(la)} → ${na} unidades; Durável: ${num(D)} ÷ ${num(lb)} → ${nb} unidades.`, 'Multiplique cada número de unidades pelo preço e compare.'],
      solution: [`$Básico: ${na} × ${num(pa)} = ${num(A)}`, `$Durável: ${nb} × ${rs(pb)} = ${rs(B)}`, `$Economia: ${rs(save)}`],
    });
  }
}

/** Lâmpadas: compra (com reposições) + energia no período. */
function lampGen(r: Rand) {
  for (;;) {
    const H = r.pick([5000, 6000, 8000, 10000, 12000]);
    const wl = r.pick([7, 9, 10, 12]);
    const pl = r.pick([10, 12, 15, 18, 20]);
    const ll = r.pick([10000, 15000, 25000]);
    const wo = r.pick([20, 30, 40, 42, 60]);
    const po = r.pick([4, 5, 6, 8]);
    const lo = r.pick([1000, 2000, 3000, 4000]);
    const e = r.pick([60, 70, 75, 80, 90, 100]) / 100;
    const nl = up(H / ll);
    const no2 = up(H / lo);
    const El = ((wl * H) / 1000) * e;
    const Eo = ((wo * H) / 1000) * e;
    const A = nl * pl + El;
    const B = no2 * po + Eo;
    const save = B - A;
    if (save <= 0 || !cents(A) || !cents(B)) continue;
    return draftNumeric({
      prompt: [
        p(`Uma loja vai iluminar a vitrine por ${num(H)} horas e compara duas lâmpadas:`),
        table(['Lâmpada', 'Potência', 'Preço', 'Durabilidade'], [['LED', `${wl} W`, brl(pl), `${num(ll)} h`], ['Halógena', `${wo} W`, brl(po), `${num(lo)} h`]]),
        p(`A energia custa ${brl(e)} por kWh (1 kWh = 1.000 W durante 1 hora), e cada lâmpada é trocada quando atinge a durabilidade.`),
      ],
      ask: 'Somando compra e energia no período, quanto se economiza com a LED?',
      prefix: 'R$',
      answer: round(save, 2),
      wrong: [
        { value: round(Eo - El, 2), feedback: 'Isso compara só a energia. Some também as lâmpadas compradas no período.' },
        { value: round((wo - wl) * H * e, 2), feedback: 'Isso esquece de converter W·h em kWh: divida por 1.000.' },
        ...(no2 > 1 ? [{ value: round(po + Eo - pl - El, 2), feedback: `Isso conta uma lâmpada halógena só. Ela dura ${num(lo)} h: são ${no2} lâmpadas no período.` }] : []),
      ].filter((w) => w.value > 0),
      hints: [`Energia: potência × ${num(H)} h ÷ 1.000 = kWh; multiplique por ${brl(e)}.`, `Lâmpadas: LED ${nl}; halógena ${num(H)} ÷ ${num(lo)} = ${no2}.`],
      solution: [`$LED: ${nl} × ${num(pl)} + ${num((wl * H) / 1000, 2)} kWh × ${rs(e)} = ${rs(A)}`, `$Halógena: ${no2} × ${num(po)} + ${num((wo * H) / 1000, 2)} kWh × ${rs(e)} = ${rs(B)}`, `$Economia: ${rs(save)}`],
    });
  }
}

/** Etanol ou gasolina numa viagem. */
function fuelGen(r: Rand) {
  for (;;) {
    const g = r.pick([10, 11, 12, 13, 14, 15]);
    const D = r.pick([210, 280, 350, 420, 490, 560, 630, 700]);
    const pg = r.pick([550, 580, 600, 620, 650, 680]) / 100;
    const pe = r.pick([360, 380, 400, 420, 440, 460, 480]) / 100;
    if (g === 10 && D === 350 && pg === 6 && pe === 4.4) continue; // exercício da teoria
    const ke = (g * 7) / 10;
    const Lg = D / g;
    const Le = D / ke;
    const Cg = Lg * pg;
    const Ce = Le * pe;
    if (!cents(Cg) || !cents(Ce) || Cg === Ce) continue;
    const save = round(Math.abs(Cg - Ce), 2);
    return draftNumeric({
      prompt: [p(`Um carro flex faz ${g} km por litro com gasolina e, com etanol, exatamente 70% disso. Numa viagem de ${num(D)} km, a gasolina custa ${brl(pg)} o litro, e o etanol, ${brl(pe)}.`)],
      ask: 'Escolhendo o combustível mais vantajoso, quanto se economiza em relação ao outro?',
      prefix: 'R$',
      answer: save,
      wrong: [
        { value: round(Math.abs(pg - pe), 2), feedback: 'Essa é a diferença de preço por litro. Com etanol, o carro gasta mais litros: compare os gastos da viagem.' },
        { value: round(Lg * Math.abs(pg - pe), 2), feedback: `Isso usa os mesmos litros para os dois combustíveis. Com etanol, o carro faz só ${num(ke, 1)} km por litro.` },
        { value: round(Math.min(Cg, Ce), 2), feedback: 'Esse é o gasto com o combustível escolhido. A economia é a diferença para o outro.' },
      ],
      hints: [`Com etanol, o carro faz 70% de ${g} = ${num(ke, 1)} km por litro.`, `Litros: ${num(D)} ÷ ${g} de gasolina; ${num(D)} ÷ ${num(ke, 1)} de etanol.`],
      solution: [`$Gasolina: ${num(Lg, 2)} L × ${rs(pg)} = ${rs(Cg)}`, `$Etanol: ${num(Le, 2)} L × ${rs(pe)} = ${rs(Ce)}`, `$Economia: ${rs(save)}`],
    });
  }
}

/** Duas máquinas: diferença de preço de compra e consumo com tarifa por faixas. */
function tierMachineGen(r: Rand) {
  for (;;) {
    const T = r.pick([100, 150, 200]);
    const a = r.pick([40, 50, 60, 70]) / 100;
    const b = a + r.pick([20, 30, 40]) / 100;
    const ka = T - r.pick([10, 20, 30, 40]);
    const kb = T + r.pick([20, 40, 50, 60]);
    const m = r.pick([3, 4, 6, 12]);
    const X = r.pick([50, 80, 100, 150, 200]);
    const bill = (k: number) => (k <= T ? k * a : T * a + (k - T) * b);
    const energy = m * (bill(kb) - bill(ka));
    const save = energy - X;
    if (save <= 0 || !cents(save)) continue;
    return draftNumeric({
      prompt: [p(`Duas máquinas de lavar fariam o mesmo trabalho por ${m} meses. A Eficiente custa ${brl(X)} a mais e consome ${ka} kWh por mês; a Comum consome ${kb} kWh por mês. Em cada mês, a energia custa ${brl(a)} por kWh nos primeiros ${T} kWh e ${brl(b)} por kWh apenas no que passar disso. Não há outro consumo.`)],
      ask: `Somando compra e energia, quanto se economiza nos ${m} meses escolhendo a Eficiente?`,
      prefix: 'R$',
      answer: round(save, 2),
      wrong: [
        { value: round(m * (kb - ka) * a - X, 2), feedback: `Isso cobra todo o consumo pelo preço da 1ª faixa. O que passa de ${T} kWh custa ${brl(b)} por kWh.` },
        { value: round(energy, 2), feedback: `Essa é só a economia de energia. Desconte os ${brl(X)} a mais pagos na compra.` },
        { value: round(bill(kb) - bill(ka) - X, 2), feedback: `Isso considera um mês só de energia. São ${m} meses.` },
      ].filter((w) => w.value > 0),
      hints: [`Comum, por mês: ${T} × ${rs(a)} + ${kb - T} × ${rs(b)} = ${brl(bill(kb))}.`, `Eficiente, por mês: ${ka} × ${rs(a)} = ${brl(bill(ka))}.`],
      solution: [`$Energia: ${m} × (${rs(bill(kb))} − ${rs(bill(ka))}) = ${rs(energy)}`, `$Economia: ${rs(energy)} − ${num(X)} = ${rs(save)}`],
    });
  }
}

// ———————————————————————————————————————————————— geradores: ponto de equilíbrio

const TWO_PLANS = [
  { ctx: 'Uma operadora oferece dois planos de telefone', unit: 'minutos', short: 'minutos', fix: 'por mês', per: 'por minuto' },
  { ctx: 'Duas locadoras alugam o mesmo carro por um dia', unit: 'quilômetros', short: 'km', fix: 'de diária', per: 'por km rodado' },
  { ctx: 'Duas gráficas fazem o mesmo serviço de impressão', unit: 'páginas', short: 'páginas', fix: 'de taxa fixa', per: 'por página' },
];

/** Dois planos com parte fixa e parte variável: o ponto de empate. */
function breakEvenGen(r: Rand) {
  for (;;) {
    const c = r.pick(TWO_PLANS);
    const va = r.pick([30, 40, 50, 60, 80, 100]);
    const vb = va - r.pick([10, 15, 20, 25, 30]);
    const x = r.pick([50, 80, 100, 120, 150, 200, 250, 300]);
    const Fa = r.pick([10, 15, 20, 25, 30, 40]);
    if (vb <= 0) continue;
    if (Fa === 25 && va === 40 && vb === 20 && x === 100) continue; // questão do banco
    const Fb = Fa + (x * (va - vb)) / 100;
    if (!cents(Fb)) continue;
    return draftNumeric({
      prompt: [p(`${c.ctx}. Opção A: ${brl(Fa)} ${c.fix} mais ${brl(va / 100)} ${c.per}. Opção B: ${brl(Fb)} ${c.fix} mais ${brl(vb / 100)} ${c.per}. Não há outros custos.`)],
      ask: `Para quantos ${c.unit} as duas opções custam o mesmo?`,
      unit: c.short,
      answer: x,
      wrong: [
        { value: round((Fb - Fa) / (va / 100), 2), feedback: 'Isso divide a diferença fixa por uma tarifa só. O que compensa a diferença fixa é a diferença das tarifas por unidade.' },
        { value: round((Fb - Fa) / ((va + vb) / 100), 2), feedback: 'Isso soma as tarifas. A diferença fixa é compensada pela diferença entre elas.' },
        { value: x + 1, feedback: `Com ${x + 1} ${c.short}, a opção B já é mais barata. O empate é em ${x}.` },
        { value: round(Fb - Fa, 2), feedback: `${brl(Fb - Fa)} é a diferença das partes fixas. Divida pela diferença das tarifas por unidade.` },
      ],
      hints: [`Custo A = ${rs(Fa)} + ${rs(va / 100)}x; custo B = ${rs(Fb)} + ${rs(vb / 100)}x.`, `Iguale: ${rs(Fb - Fa)} = ${rs((va - vb) / 100)}x.`],
      solution: [`$${rs(Fa)} + ${rs(va / 100)}x = ${rs(Fb)} + ${rs(vb / 100)}x`, `$${rs((va - vb) / 100)}x = ${rs(Fb - Fa)} → x = ${x}`],
    });
  }
}

/** Menor quantidade inteira para uma opção custar estritamente menos. */
function strictlyLessGen(r: Rand) {
  for (;;) {
    const kind = r.pick(['passe', 'frete', 'aparelho'] as const);
    if (kind === 'passe') {
      const pr = r.pick([450, 500, 650, 700, 800, 900]) / 100;
      const P = r.pick([100, 120, 140, 160, 180, 200, 250]);
      const exact = P / pr;
      const n = down(exact) + 1;
      return draftNumeric({
        prompt: [p(`Uma entrada avulsa num parque aquático custa ${brl(pr)}. O passe da temporada, de ${brl(P)}, dá direito a entradas ilimitadas. A pessoa só compra o passe se ele custar estritamente menos que pagar todas as entradas.`)],
        ask: 'Qual é a menor quantidade inteira de entradas que torna o passe vantajoso?',
        unit: 'entradas',
        answer: n,
        wrong: [
          isInt(exact)
            ? { value: exact, feedback: `Com ${exact} entradas, os custos empatam (${exact} × ${rs(pr)} = ${num(P)}). Para o passe sair estritamente mais barato, é preciso uma a mais.` }
            : { value: down(exact), feedback: `Com ${down(exact)} entradas, os avulsos somam ${brl(down(exact) * pr)}, ainda menos que o passe.` },
          ...(isInt(exact) ? [] : [{ value: round(exact, 2), feedback: 'O número de entradas é inteiro: depois da divisão, passe para o inteiro seguinte.' }]),
        ],
        hints: [`O passe compensa quando n × ${rs(pr)} > ${num(P)}.`, `n > ${num(P)} ÷ ${rs(pr)} = ${num(exact, 2)}.`],
        solution: [`$n > ${num(exact, 2)} → menor inteiro: ${n}`],
      });
    }
    if (kind === 'frete') {
      const u = r.pick([8, 10, 12, 15, 20]);
      const w = u + r.pick([2, 3, 4, 5]);
      const S = r.pick([12, 15, 18, 20, 24, 25, 30]);
      if (u === 12 && w === 15 && S === 18) continue; // questão do banco
      const exact = S / (w - u);
      const n = down(exact) + 1;
      return draftNumeric({
        prompt: [p(`Uma loja virtual vende uma camiseta por ${brl(u)} e cobra frete único de ${brl(S)} por pedido. Uma loja do bairro vende a mesma camiseta por ${brl(w)}, sem frete. Todas as camisetas irão num único pedido.`)],
        ask: 'Qual é a menor quantidade inteira para a loja virtual custar estritamente menos?',
        unit: 'camisetas',
        answer: n,
        wrong: [
          isInt(exact)
            ? { value: exact, feedback: `Com ${exact} camisetas, os custos empatam. Para a loja virtual sair estritamente mais barata, é preciso uma a mais.` }
            : { value: down(exact), feedback: `Com ${down(exact)} camisetas, a economia na peça (${brl(down(exact) * (w - u))}) ainda não paga o frete de ${brl(S)}.` },
          { value: up(S / u), feedback: 'Isso compara o frete com o preço da camiseta. O que paga o frete é a diferença de preço por camiseta.' },
        ],
        hints: [`Loja virtual: ${num(u)}n + ${num(S)}; bairro: ${num(w)}n.`, `${num(u)}n + ${num(S)} < ${num(w)}n → ${w - u}n > ${num(S)}.`],
        solution: [`$n > ${num(S)} ÷ ${w - u} = ${num(exact, 2)} → menor inteiro: ${n}`],
      });
    }
    const ca = r.pick([200, 250, 300, 400]);
    const cb = ca + r.pick([100, 150, 200, 250]);
    const ua = r.pick([15, 20, 25, 30]);
    const ub = ua - r.pick([5, 10]);
    if (ca === 300 && cb === 450 && ua === 20 && ub === 10) continue; // questão do banco
    const exact = (cb - ca) / ((ua - ub) / 100);
    const n = down(exact) + 1;
    return draftNumeric({
      prompt: [p(`Para um escritório, a copiadora Alfa custa ${brl(ca)} e cada cópia sai por ${brl(ua / 100)}; a copiadora Beta custa ${brl(cb)} e cada cópia sai por ${brl(ub / 100)}. Só importam a compra e o custo das cópias.`)],
      ask: 'A partir de quantas cópias inteiras a Beta passa a ter custo total estritamente menor?',
      unit: 'cópias',
      answer: n,
      wrong: [
        isInt(exact)
          ? { value: exact, feedback: `Com ${num(exact)} cópias, os custos empatam. Para a Beta sair estritamente mais barata, é preciso uma cópia a mais.` }
          : { value: down(exact), feedback: `Com ${num(down(exact))} cópias, a Beta ainda não recuperou a diferença de preço.` },
        { value: round((cb - ca) / (ub / 100), 2), feedback: 'Isso divide a diferença de preço pelo custo da cópia da Beta. O que a recupera é a economia por cópia: a diferença entre os custos.' },
      ],
      hints: [`Diferença de preço: ${brl(cb - ca)}; economia por cópia: ${brl((ua - ub) / 100)}.`, `A Beta compensa quando ${rs((ua - ub) / 100)}n > ${num(cb - ca)}.`],
      solution: [`$n > ${num(cb - ca)} ÷ ${rs((ua - ub) / 100)} = ${num(exact, 2)} → menor inteiro: ${num(n)}`],
    });
  }
}

/** Plano com franquia × avulso; ou dois planos com franquias diferentes. */
function franchiseGen(r: Rand) {
  for (;;) {
    if (r.next() < 0.5) {
      const a = r.pick([5, 6, 7, 8, 9]);
      const k = r.pick([8, 10, 12, 15, 20]);
      const F = k * a - r.pick([10, 15, 20, 25, 30]);
      const e = a - r.pick([1, 2, 3]);
      const n = k + r.pick([2, 3, 4, 5, 6]);
      const plan = F + (n - k) * e;
      const save = n * a - plan;
      if (save <= 0) continue;
      return draftNumeric({
        prompt: [p(`Uma pessoa fará ${n} viagens de patinete compartilhado no mês. Cada viagem avulsa custa ${brl(a)}. Um plano custa ${brl(F)} e inclui ${k} viagens; cada viagem além dessas custa ${brl(e)}.`)],
        ask: 'Quanto o plano economiza em relação a pagar todas as viagens avulsas?',
        prefix: 'R$',
        answer: save,
        wrong: [
          { value: n * a - F, feedback: `Isso esquece as ${n - k} viagens além da franquia, que custam ${brl(e)} cada.` },
          { value: k * a - F, feedback: `Isso compara só as ${k} viagens da franquia. As ${n - k} extras também contam.` },
          { value: plan, feedback: 'Esse é o custo do plano. A economia é a diferença para as viagens avulsas.' },
        ].filter((w) => w.value > 0),
        hints: [`Avulsas: ${n} × ${num(a)} = ${brl(n * a)}.`, `Plano: ${num(F)} + ${n - k} × ${num(e)} = ${brl(plan)}.`],
        solution: [`$Economia: ${num(n * a)} − ${num(plan)} = ${num(save)}`],
      });
    }
    const F1 = r.pick([30, 35, 40, 45]);
    const k1 = r.pick([5, 6, 8]);
    const e1 = r.pick([5, 6, 7, 8]);
    const F2 = F1 + r.pick([15, 20, 25, 30]);
    const k2 = k1 + r.pick([5, 6, 7, 8]);
    const e2 = e1 - r.pick([1, 2, 3]);
    const c1 = (x: number) => F1 + e1 * Math.max(0, x - k1);
    const c2 = (x: number) => F2 + e2 * Math.max(0, x - k2);
    let x = 0;
    while (x < 80 && c2(x) >= c1(x)) x++;
    if (x >= 80 || x <= k1) continue;
    return draftNumeric({
      prompt: [
        p('Uma operadora tem dois planos de internet para celular. Em ambos, cada gigabyte (GB) além da franquia é cobrado à parte.'),
        table(['Plano', 'Mensalidade', 'Franquia', 'GB adicional'], [['Leve', brl(F1), `${k1} GB`, brl(e1)], ['Mais', brl(F2), `${k2} GB`, brl(e2)]]),
        p('O consumo mensal é sempre um número inteiro de GB.'),
      ],
      ask: 'Qual é o menor consumo mensal a partir do qual o plano Mais fica mais barato que o Leve?',
      unit: 'GB',
      answer: x,
      wrong: [
        { value: x - 1, feedback: `Com ${x - 1} GB, o Leve custa ${brl(c1(x - 1))} e o Mais, ${brl(c2(x - 1))}: o Mais ainda não é mais barato.` },
        { value: k2, feedback: `${k2} GB é a franquia do Mais. Compare os custos dos dois planos para cada consumo.` },
        ...(x > k2 ? [{ value: k1 + down((F2 - F1) / e1) + 1, feedback: `Isso trata o plano Mais como se ele nunca cobrasse extra. Acima de ${k2} GB, ele também cobra ${brl(e2)} por GB.` }] : []),
      ].filter((w) => w.value !== x),
      hints: [`Leve: ${num(F1)} + ${num(e1)} por GB acima de ${k1}. Mais: ${num(F2)} + ${num(e2)} por GB acima de ${k2}.`, `Teste consumos a partir de ${k1 + 1} GB e compare os dois custos.`],
      solution: [`$Com ${x - 1} GB: Leve ${rs(c1(x - 1))}; Mais ${rs(c2(x - 1))}`, `$Com ${x} GB: Leve ${rs(c1(x))}; Mais ${rs(c2(x))} → o Mais fica mais barato`],
    });
  }
}

/** Passe mensal × viagens avulsas (dias úteis e fim de semana). */
function monthPassGen(r: Rand) {
  for (;;) {
    const days = r.pick([20, 21, 22, 23]);
    const w = r.pick([0, 4, 6, 8]);
    const pr = r.pick([440, 480, 500, 520, 600]) / 100;
    const P = r.pick([180, 200, 220, 240]);
    const trips = 2 * days + w;
    const save = trips * pr - P;
    if (save <= 0 || !cents(save)) continue;
    return draftNumeric({
      prompt: [p(`Bianca vai de metrô ao trabalho de segunda a sexta, com 2 viagens por dia (ida e volta). ${w ? `Além disso, faz ${w} viagens por mês nos fins de semana. ` : ''}Cada viagem custa ${brl(pr)}, e um passe mensal de ${brl(P)} dá direito a viagens ilimitadas. Considere um mês com ${days} dias úteis.`)],
      ask: 'Nesse mês, quanto Bianca economiza comprando o passe, em vez de pagar cada viagem?',
      prefix: 'R$',
      answer: round(save, 2),
      wrong: [
        ...(w ? [{ value: round(2 * days * pr - P, 2), feedback: `Isso esquece as ${w} viagens do fim de semana.` }] : []),
        { value: round((days + w) * pr - P, 2), feedback: 'Isso conta uma viagem por dia útil. São 2: ida e volta.' },
        { value: round(trips * pr, 2), feedback: 'Esse é o gasto com as viagens avulsas. A economia é a diferença para o passe.' },
      ].filter((v) => v.value > 0),
      hints: [`Viagens: 2 × ${days}${w ? ` + ${w}` : ''} = ${trips}.`, `Avulsas: ${trips} × ${rs(pr)} = ${brl(trips * pr)}.`],
      solution: [`$${trips} × ${rs(pr)} = ${rs(trips * pr)}`, `$Economia: ${rs(trips * pr)} − ${num(P)} = ${rs(save)}`],
    });
  }
}

/** Matrícula + mensalidade × pagar por aula, num período. */
function enrollmentGen(r: Rand) {
  for (;;) {
    const k = r.pick([4, 6, 8, 10, 12]);
    const E = r.pick([50, 80, 100, 120, 150]);
    const M = r.pick([60, 70, 80, 90, 100, 120]);
    const c = r.pick([8, 10, 12, 14, 15, 18]);
    const m = r.pick([3, 4, 6, 10, 12]);
    const A = E + m * M;
    const B = m * k * c;
    if (A === B) continue;
    const diff = Math.abs(A - B);
    return draftNumeric({
      prompt: [p(`O estúdio de pilates Raiz cobra matrícula única de ${brl(E)} e mensalidade de ${brl(M)}, que cobre todas as aulas. O estúdio Folha não cobra matrícula, mas cada aula custa ${brl(c)}. A aluna fará ${k} aulas por mês durante ${m} meses completos.`)],
      ask: 'Quanto o estúdio mais barato custa a menos nesse período?',
      prefix: 'R$',
      answer: diff,
      wrong: [
        { value: Math.abs(m * M - B), feedback: 'Isso esquece a matrícula do Raiz.' },
        { value: Math.abs(M - k * c), feedback: 'Essa é a diferença de um mês só, sem a matrícula. Compare o período inteiro.' },
        { value: Math.min(A, B), feedback: 'Esse é o custo do estúdio mais barato. A pergunta é a diferença.' },
      ].filter((w) => w.value > 0),
      hints: [`Raiz: ${num(E)} + ${m} × ${num(M)} = ${brl(A)}.`, `Folha: ${m} × ${k} × ${num(c)} = ${brl(B)}.`],
      solution: [`$Raiz: ${num(A)}; Folha: ${num(B)}`, `$Diferença: ${num(Math.max(A, B))} − ${num(Math.min(A, B))} = ${num(diff)}`],
    });
  }
}

/** Diária escalonada × pacote semanal. */
function tierRentGen(r: Rand) {
  for (;;) {
    const t = r.pick([2, 3, 4]);
    const a = r.pick([20, 25, 30, 35, 40]);
    const b = a - r.pick([5, 10, 15]);
    const d = r.pick([4, 5, 6, 7]);
    const W = r.pick([120, 140, 150, 160, 180]);
    if (t === 3 && a === 25 && b === 15 && d === 6 && W === 140) continue; // questão do banco
    if (d <= t) continue;
    const A = t * a + (d - t) * b;
    if (A === W) continue;
    const diff = Math.abs(A - W);
    return draftNumeric({
      prompt: [p(`Um grupo vai alugar uma barraca de camping por ${d} dias. A loja Trilha cobra ${brl(a)} por dia nos ${t} primeiros dias e ${brl(b)} por dia adicional. A loja Mochila cobra ${brl(W)} pelo período de até 7 dias. Não há caução nem outras taxas.`)],
      ask: 'Quanto a loja mais barata custa a menos para esses dias?',
      prefix: 'R$',
      answer: diff,
      wrong: [
        { value: Math.abs(d * a - W), feedback: `Isso cobra ${brl(a)} em todos os dias. Depois dos ${t} primeiros, a diária cai para ${brl(b)}.` },
        { value: Math.abs(d * b - W), feedback: `Isso cobra ${brl(b)} em todos os dias. Nos ${t} primeiros, a diária é ${brl(a)}.` },
        { value: Math.min(A, W), feedback: 'Esse é o custo da loja mais barata. A pergunta é a diferença.' },
      ].filter((w) => w.value > 0),
      hints: [`Trilha: ${t} × ${num(a)} + ${d - t} × ${num(b)} = ${brl(A)}.`, `Compare com ${brl(W)}.`],
      solution: [`$Trilha: ${num(A)}; Mochila: ${num(W)}`, `$Diferença: ${num(diff)}`],
    });
  }
}

/** Plano com fidelidade e multa × plano livre. */
function commitmentGen(r: Rand) {
  for (;;) {
    const F = r.pick([70, 80, 90, 100]);
    const C = F - r.pick([15, 20, 25, 30]);
    const x = r.pick([20, 25, 30, 40]);
    const m = r.pick([5, 6, 7, 8, 9, 10]);
    if (F === 80 && C === 60 && x === 30 && m === 8) continue; // questão do banco
    const free = m * F;
    const commit = m * C + (12 - m) * x;
    const save = free - commit;
    if (save <= 0) continue;
    return draftNumeric({
      prompt: [p(`Uma academia oferece o plano livre, de ${brl(F)} por mês, ou o plano fidelidade, de ${brl(C)} por mês com compromisso de 12 meses. No fidelidade, cancelar antes do fim custa ${brl(x)} por mês que faltar para completar os 12. Uma pessoa vai frequentar exatamente ${m} meses e cancelar depois da ${m}ª mensalidade.`)],
      ask: 'Quanto ela economiza escolhendo o plano fidelidade, já incluída a multa?',
      prefix: 'R$',
      answer: save,
      wrong: [
        { value: m * (F - C), feedback: `Isso esquece a multa: faltam ${12 - m} meses, a ${brl(x)} cada.` },
        { value: (12 - m) * x, feedback: 'Essa é só a multa de cancelamento. Compare o custo total dos dois planos.' },
        { value: m * (F - C) - x, feedback: `Isso cobra a multa de um mês só. Ela vale para cada um dos ${12 - m} meses que faltam.` },
      ].filter((w) => w.value > 0),
      hints: [`Livre: ${m} × ${num(F)} = ${brl(free)}.`, `Fidelidade: ${m} × ${num(C)} + ${12 - m} × ${num(x)} = ${brl(commit)}.`],
      solution: [`$Economia: ${num(free)} − ${num(commit)} = ${num(save)}`],
    });
  }
}

// ———————————————————————————————————————————————— geradores: combinações

/** Embalagens fechadas de dois tamanhos: o menor gasto para ter pelo menos N. */
function packComboGen(r: Rand) {
  for (;;) {
    const B = r.pick([5, 6, 10]);
    const S = r.pick([2, 3, 4]);
    const cuS = r.pick([4, 5, 6, 7, 8]);
    const pS = S * cuS;
    const pB = B * cuS - r.pick([1, 2, 3, 4, 5]);
    const N = r.pick([7, 8, 9, 11, 13, 14, 17, 19, 23]);
    if (N === 11 && B === 5 && S === 3 && pB === 18 && pS === 12) continue; // questão do banco
    let best = Infinity;
    let bx = 0;
    let by = 0;
    for (let x = 0; x <= up(N / B); x++) {
      for (let y = 0; y <= up(N / S); y++) {
        if (x * B + y * S >= N && x * pB + y * pS < best) {
          best = x * pB + y * pS;
          bx = x;
          by = y;
        }
      }
    }
    const allBig = up(N / B) * pB;
    const allSmall = up(N / S) * pS;
    if (best === allBig && best === allSmall) continue;
    return draftNumeric({
      prompt: [p(`Para a manutenção da frota, uma cooperativa de mototaxistas precisa de no mínimo ${N} L de óleo. Só há embalagens fechadas: de ${B} L, por ${brl(pB)}, e de ${S} L, por ${brl(pS)}. Pode-se combinar os tamanhos, e o que sobrar fica guardado.`)],
      ask: 'Qual é o menor gasto que garante o óleo necessário?',
      prefix: 'R$',
      answer: best,
      wrong: [
        { value: allBig, feedback: `Só com embalagens de ${B} L, seriam ${up(N / B)} (${brl(allBig)}). Teste combinações com as de ${S} L.` },
        { value: allSmall, feedback: `Só com embalagens de ${S} L, seriam ${up(N / S)} (${brl(allSmall)}). Teste combinações com as de ${B} L.` },
        { value: round((N * pB) / B, 2), feedback: 'Isso paga só os litros necessários, no preço por litro da embalagem maior. Mas só se vendem embalagens fechadas.' },
      ],
      hints: ['Monte uma tabela: para 0, 1, 2… embalagens grandes, quantas pequenas completam o necessário?', 'Compare o custo de cada linha que atende ao mínimo.'],
      solution: [`$${bx} × ${B} L + ${by} × ${S} L = ${bx * B + by * S} L ≥ ${N} L`, `$Custo: ${bx} × ${num(pB)} + ${by} × ${num(pS)} = ${num(best)}`],
    });
  }
}

/** Exatamente N itens com caixas de dois tamanhos, sem sobra. */
function exactComboGen(r: Rand) {
  for (;;) {
    const a = r.pick([3, 4, 5]);
    const b = r.pick([6, 8, 10]);
    const ua = r.pick([200, 250, 300, 350]);
    const pa = (a * ua) / 100;
    const pb = (b * (ua + r.pick([-50, -25, 25]))) / 100;
    const N = r.pick([12, 15, 16, 18, 20, 24, 30]);
    if (!cents(pb)) continue;
    const sols: [number, number][] = [];
    for (let y = 0; y * b <= N; y++) if ((N - y * b) % a === 0) sols.push([(N - y * b) / a, y]);
    if (sols.length < 2) continue;
    const costs = sols.map(([x, y]) => round(x * pa + y * pb, 2));
    const best = Math.min(...costs);
    if (costs.filter((c) => c === best).length > 1) continue;
    const [bx, by] = sols[costs.indexOf(best)];
    return draftNumeric({
      prompt: [p(`Uma escola precisa de exatamente ${N} tubos de cola. A papelaria vende só embalagens fechadas de ${a} tubos, por ${brl(pa)}, e de ${b} tubos, por ${brl(pb)}. Pode-se combinar embalagens, mas não pode sobrar nenhum tubo.`)],
      ask: 'Qual é o menor gasto para obter os tubos?',
      prefix: 'R$',
      answer: best,
      wrong: [
        ...sols
          .filter((_, i) => costs[i] !== best)
          .map(([x, y]) => ({ value: round(x * pa + y * pb, 2), feedback: `${x} × ${a} + ${y} × ${b} também dá ${N} tubos, mas custa mais. Compare todas as combinações exatas.` })),
        { value: round(N * Math.min(pa / a, pb / b), 2), feedback: 'Isso paga cada tubo pelo menor preço unitário, como se desse para comprar tubos avulsos. Só há embalagens fechadas.' },
      ],
      hints: [`Liste as combinações exatas: ${a}x + ${b}y = ${N}.`, 'Calcule o custo de cada uma e escolha o menor.'],
      solution: [...sols.map(([x, y], i) => `$${x} × ${a} + ${y} × ${b} = ${N} → ${brl(costs[i])}`), `$Menor: ${bx} de ${a} e ${by} de ${b}, ${brl(best)}`],
    });
  }
}

/** Grupo de pessoas: veículo com capacidade × passagem individual. */
function groupGen(r: Rand) {
  for (;;) {
    const n = r.pick([5, 6, 7, 9, 10, 11, 13]);
    const c = r.pick([3, 4]);
    const P = r.pick([20, 24, 26, 30, 36]);
    const pr = r.pick([600, 700, 750, 800, 900, 1000]) / 100;
    if (n === 5 && c === 4 && P === 30 && pr === 8) continue; // questão do banco
    const opts: { k: number; cost: number }[] = [];
    for (let k = 0; k <= up(n / c); k++) opts.push({ k, cost: k * P + Math.max(0, n - k * c) * pr });
    if (Math.abs(P / c - pr) < 1e-9) continue;
    const best = opts.reduce((a, b) => (b.cost < a.cost ? b : a));
    if (opts.filter((o) => Math.abs(o.cost - best.cost) < 1e-9).length > 1) continue;
    const allCar = opts[opts.length - 1].cost;
    const allBus = opts[0].cost;
    if (best.cost === allCar && best.cost === allBus) continue;
    if (best.k === 0 && r.next() < 0.7) continue; // prefira casos em que misturar compensa
    return draftNumeric({
      prompt: [p(`${n} amigos vão juntos a um show. Um carro de aplicativo custa ${brl(P)} por viagem e leva até ${c} pessoas; o ônibus custa ${brl(pr)} por pessoa. Parte do grupo pode ir de carro e o restante de ônibus.`)],
      ask: 'Qual é o menor gasto total para levar todo o grupo?',
      prefix: 'R$',
      answer: round(best.cost, 2),
      wrong: [
        { value: round(allCar, 2), feedback: `Só de carro, seriam ${up(n / c)} viagens. Um carro com poucas pessoas pode sair mais caro que as passagens de ônibus delas.` },
        { value: round(allBus, 2), feedback: `Só de ônibus, cada pessoa paga ${brl(pr)}. Um carro lotado sai por ${brl(P / c)} por pessoa: compare.` },
        ...opts.filter((o) => o.cost !== best.cost && o.k > 0 && o.k < up(n / c)).map((o) => ({ value: round(o.cost, 2), feedback: `Com ${o.k} carro${o.k > 1 ? 's' : ''}, o gasto é ${brl(o.cost)}. Teste as outras quantidades de carros.` })),
      ],
      hints: [`Por pessoa: carro lotado ${brl(P / c)}; ônibus ${brl(pr)}.`, 'Teste 0, 1, 2… carros e complete com ônibus.'],
      solution: [...opts.map((o) => `$${o.k} carro${o.k === 1 ? '' : 's'} + ${Math.max(0, n - o.k * c)} de ônibus = ${rs(o.cost)}`), `$Menor gasto: ${rs(best.cost)}`],
    });
  }
}

/** Tinta para duas demãos: latas de dois tamanhos. */
function paintGen(r: Rand) {
  for (;;) {
    const A = r.pick([24, 30, 36, 42, 45, 54, 60]);
    const cov = r.pick([8, 10, 12]);
    const need = (2 * A) / cov;
    const V1 = r.pick([3, 4, 5]);
    const u2 = r.pick([24, 26, 28, 30]);
    const P1 = V1 * u2 - r.pick([6, 10, 12, 15]);
    if (isInt(need) && need % V1 === 0) continue;
    let best = Infinity;
    let bx = 0;
    let by = 0;
    for (let x = 0; x <= up(need / V1); x++) {
      for (let y = 0; y <= up(need); y++) {
        if (x * V1 + y >= need - 1e-9 && x * P1 + y * u2 < best) {
          best = x * P1 + y * u2;
          bx = x;
          by = y;
        }
      }
    }
    const allBig = up(need / V1) * P1;
    return draftNumeric({
      prompt: [p(`Uma parede de ${A} m² receberá duas demãos de tinta. Cada litro cobre ${cov} m² em uma demão. A loja vende latas de ${V1} L por ${brl(P1)} e de 1 L por ${brl(u2)}; as tintas são iguais, e pode sobrar tinta.`)],
      ask: 'Qual é o menor gasto para comprar tinta suficiente?',
      prefix: 'R$',
      answer: best,
      wrong: [
        { value: round(((A / cov) * u2), 2), feedback: `Isso calcula uma demão só, e em latas de 1 L. São duas demãos: ${num(need, 2)} L.` },
        ...(allBig !== best ? [{ value: allBig, feedback: `Só com latas de ${V1} L, seriam ${up(need / V1)} (${brl(allBig)}), com sobra cara. Teste completar com latas de 1 L.` }] : []),
        { value: up(need) * u2, feedback: `Só com latas de 1 L, seriam ${up(need)} (${brl(up(need) * u2)}). A lata grande tem o litro mais barato.` },
      ].filter((w) => w.value !== best),
      hints: [`Tinta: 2 × ${A} ÷ ${cov} = ${num(need, 2)} L.`, `Teste 0, 1, 2… latas de ${V1} L e complete com latas de 1 L.`],
      solution: [`$Necessário: ${num(need, 2)} L`, `$${bx} × ${V1} L + ${by} × 1 L = ${bx * V1 + by} L → ${bx} × ${num(P1)} + ${by} × ${num(u2)} = ${num(best)}`],
    });
  }
}

// ———————————————————————————————————————————————— geradores: maestria

/** Tarifa de água por faixas: o valor da conta ou a redução percentual. */
function tierBillGen(r: Rand) {
  for (;;) {
    const t = [r.pick([3, 3.5, 4, 5]), r.pick([6, 6.5, 7, 8]), r.pick([9, 10, 11, 12]), r.pick([13, 14, 15])];
    const bill = (c: number) => {
      let s = 0;
      const lims = [10, 20, 30, Infinity];
      let prev = 0;
      for (let k = 0; k < 4; k++) {
        const part = Math.max(0, Math.min(c, lims[k]) - prev);
        s += part * t[k];
        prev = lims[k];
      }
      return s;
    };
    const tier = (c: number) => (c <= 10 ? t[0] : c <= 20 ? t[1] : c <= 30 ? t[2] : t[3]);
    /** O consumo repartido pelas faixas: [m³ na faixa, preço da faixa]. */
    const split = (c: number) => {
      const lims = [10, 20, 30, Infinity];
      const out: [number, number][] = [];
      let prev = 0;
      for (let k = 0; k < 4; k++) {
        const part = Math.max(0, Math.min(c, lims[k]) - prev);
        if (part > 0) out.push([part, t[k]]);
        prev = lims[k];
      }
      return out;
    };
    const breakdown = (c: number) => split(c).map(([m, price]) => `${m} × ${num(price, 2)}`).join(' + ');
    const tbl = table(['Faixa de consumo mensal', 'Preço por m³'], [['Primeiros 10 m³', brl(t[0])], ['Do 11º ao 20º m³', brl(t[1])], ['Do 21º ao 30º m³', brl(t[2])], ['Acima de 30 m³', brl(t[3])]]);
    const intro = p('Uma companhia de saneamento cobra a água por faixas de consumo, e cada faixa é cobrada separadamente:');
    if (r.next() < 0.5) {
      const c = r.pick([14, 16, 18, 22, 25, 27, 32, 35]);
      const v = bill(c);
      return draftNumeric({
        prompt: [intro, tbl, p(`Uma casa consumiu ${c} m³ no mês.`)],
        ask: 'Qual é o valor da conta?',
        prefix: 'R$',
        answer: round(v, 2),
        wrong: [
          { value: round(c * tier(c), 2), feedback: 'Isso cobra todo o consumo pelo preço da última faixa alcançada. Cada faixa tem seu preço: some faixa por faixa.' },
          { value: round(c * t[0], 2), feedback: 'Isso cobra todo o consumo pelo preço da 1ª faixa. O que passa de 10 m³ é mais caro.' },
        ],
        hints: ['Separe o consumo pelas faixas: 10 m³ na 1ª, até 10 m³ na 2ª, e assim por diante.', 'Multiplique cada parte pelo preço da sua faixa e some.'],
        solution: [`$${c} m³ = ${split(c).map(([m]) => `${m} m³`).join(' + ')}`, `$Conta: ${breakdown(c)} = ${brl(v)}`],
      });
    }
    const c1 = r.pick([24, 25, 26, 27, 32, 35]);
    const c2 = c1 - r.pick([6, 8, 10, 12]);
    const b1 = bill(c1);
    const b2 = bill(c2);
    const red = round(((b1 - b2) / b1) * 100, 1);
    return draftNumeric({
      prompt: [intro, tbl, p(`Depois de consertar um vazamento, uma família reduziu o consumo mensal de ${c1} m³ para ${c2} m³.`)],
      ask: 'Qual foi a redução percentual no valor da conta? Arredonde a uma casa decimal.',
      unit: '%',
      answer: red,
      tolerance: 0.05,
      wrong: [
        { value: round(((c1 - c2) / c1) * 100, 1), feedback: 'Essa é a redução do consumo. A conta cai mais, porque os metros cúbicos economizados eram os das faixas mais caras.' },
        { value: round(((c1 * tier(c1) - c2 * tier(c2)) / (c1 * tier(c1))) * 100, 1), feedback: 'Isso cobra cada conta inteira pelo preço da última faixa. Cada faixa é cobrada separadamente.' },
        { value: round(((b1 - b2) / b2) * 100, 1), feedback: 'Isso divide pela conta nova. A redução é medida sobre a conta anterior.' },
      ],
      hints: [`Conta com ${c1} m³: some faixa por faixa.`, `Redução: (conta antiga − conta nova) ÷ conta antiga.`],
      solution: [`$${c1} m³: ${breakdown(c1)} = ${brl(b1)}`, `$${c2} m³: ${breakdown(c2)} = ${brl(b2)}`, `$(${rs(b1)} − ${rs(b2)}) ÷ ${rs(b1)} ≈ ${pct(red, 1)}`],
    });
  }
}

/** Retorno de um investimento com economia mensal e custo de manutenção anual. */
function paybackGen(r: Rand) {
  for (;;) {
    const K = r.pick([6000, 8000, 9000, 10000, 12000, 15000]);
    const s = r.pick([150, 200, 250, 300, 400, 500]);
    const m = r.pick([100, 150, 200, 250, 300]);
    let n = 1;
    while (s * n - m * down(n / 12) < K) n++;
    const naive = up(K / s);
    if (n === naive || n > 120) continue;
    return draftNumeric({
      prompt: [p(`Uma padaria pode instalar um forno eficiente que custa ${brl(K)} e reduz a conta de energia em ${brl(s)} por mês. O forno exige uma revisão anual de ${brl(m)}, paga ao fim do 12º mês, do 24º, e assim por diante. A conta de energia não muda ao longo do tempo.`)],
      ask: 'Ao fim de quantos meses, contados da instalação, a economia acumulada, já descontadas as revisões, passa a ser maior ou igual ao preço do forno?',
      unit: 'meses',
      answer: n,
      wrong: [
        { value: naive, feedback: `Isso ignora as revisões: em ${naive} meses, já houve ${qty(down(naive / 12), 'revisão', 'revisões')} de ${brl(m)}, e a economia líquida fica abaixo de ${brl(K)}.` },
        { value: n - 1, feedback: `Ao fim do ${n - 1}º mês, a economia líquida é ${brl(s * (n - 1) - m * down((n - 1) / 12))}, ainda menor que ${brl(K)}.` },
        { value: n + 1, feedback: `Ao fim do ${n}º mês, a economia líquida já chega a ${brl(s * n - m * down(n / 12))}: a pergunta é o primeiro mês em que ela alcança o preço do forno.` },
      ].filter((w) => w.value !== n),
      hints: [`Sem revisões, seriam ${num(K)} ÷ ${num(s)} ≈ ${num(K / s, 1)} meses.`, `Desconte ${brl(m)} a cada 12 meses e confira os meses seguintes.`],
      solution: [`$Ao fim do ${n - 1}º mês: ${num(s)} × ${n - 1} − ${num(m)} × ${down((n - 1) / 12)} = ${num(s * (n - 1) - m * down((n - 1) / 12))}`, `$Ao fim do ${n}º mês: ${num(s)} × ${n} − ${num(m)} × ${down(n / 12)} = ${num(s * n - m * down(n / 12))} ≥ ${num(K)}`],
    });
  }
}

/** Preço anunciado para receber um valor líquido, com taxa percentual e fixa. */
function netPriceGen(r: Rand) {
  for (;;) {
    const f = r.pick([5, 8, 10, 12, 15, 20]);
    const F = r.pick([1, 2, 3, 4, 5]);
    const P = r.pick([50, 60, 80, 100, 120, 150, 200, 250]);
    if (f === 10 && F === 3 && P === 100) continue; // exercício da teoria
    const N = (P * (100 - f)) / 100 - F;
    if (!cents(N)) continue;
    return draftNumeric({
      prompt: [p(`Um fotógrafo vende fotos digitais numa plataforma que retém ${pct(f)} do preço anunciado mais ${brl(F)} fixos por venda. Ele quer receber ${brl(N)} líquidos por foto.`)],
      ask: 'Qual preço ele deve anunciar?',
      prefix: 'R$',
      answer: P,
      wrong: [
        { value: round((N * (100 + f)) / 100 + F, 2), feedback: 'Isso aplica a taxa sobre o valor líquido. Ela incide sobre o preço anunciado: preço × (1 − taxa) − fixo = líquido.' },
        { value: round(N / (1 - f / 100) + F, 2), feedback: 'Isso divide só o líquido pelo fator e soma o fixo depois. O fixo também sai do preço: (líquido + fixo) ÷ (1 − taxa).' },
        { value: round(N + F, 2), feedback: `Isso esquece a taxa de ${pct(f)}.` },
      ],
      hints: [`Equação: preço × ${num(1 - f / 100, 2)} − ${num(F)} = ${rs(N)}.`, `Preço × ${num(1 - f / 100, 2)} = ${rs(N + F)}.`],
      solution: [`$Preço = (${rs(N)} + ${num(F)}) ÷ ${num(1 - f / 100, 2)} = ${num(P)}`],
    });
  }
}

// ———————————————————————————————————————————————— aula

export const CUSTO_BENEFICIO = lesson({
  id: 'custo-beneficio',
  topic: 'financeira',
  subtopics: ['custo-beneficio'],
  title: 'Custo-benefício',
  summary:
    'Escolher a opção que custa menos de verdade: preço por unidade aproveitada, promoções, durabilidade e consumo, ponto de equilíbrio entre planos, combinações de embalagens e tarifas por faixas.',
  requires: ['razao', 'porcentagem'],
  stages: [
    stage('preco-unitario', 'descoberta', 'Preço por unidade', 'Comparar embalagens pelo preço por unidade de medida — quilo, litro ou unidade —, calcular a economia de uma compra e considerar sobras, perdas e rendimento.', () => ({
      learn: [
        text('Para comparar embalagens de tamanhos diferentes, calcule o **preço por unidade de medida**: preço ÷ quantidade (por quilo, por litro, por unidade). A de menor preço por unidade é a mais econômica — desde que tudo seja usado. Se parte sobra sem uso ou se perde, divida o preço só pelo que é aproveitado.'),
        lab({
          title: 'Duas embalagens',
          intro: 'Ajuste o tamanho e o preço de duas embalagens do mesmo produto e compare o preço por quilo.',
          params: [
            { key: 'qa', label: 'Embalagem A', min: 250, max: 2000, step: 250, value: 1000, format: (v) => size(v, 'kg') },
            { key: 'pa', label: 'Preço de A', min: 2, max: 40, step: 1, value: 12, format: (v) => brl(v) },
            { key: 'qb', label: 'Embalagem B', min: 250, max: 2000, step: 250, value: 2000, format: (v) => size(v, 'kg') },
            { key: 'pb', label: 'Preço de B', min: 2, max: 40, step: 1, value: 20, format: (v) => brl(v) },
          ],
          readouts: ({ qa, pa, qb, pb }) => {
            const ka = pa / (qa / 1000);
            const kb = pb / (qb / 1000);
            return [
              { label: 'A: preço por quilo', value: brl(ka), ...(ka <= kb ? { tone: 'verdigris' as const } : {}) },
              { label: 'B: preço por quilo', value: brl(kb), ...(kb <= ka ? { tone: 'verdigris' as const } : {}) },
              { label: 'Mais econômica', value: Math.abs(ka - kb) < 0.005 ? 'empate' : ka < kb ? `A, ${brl(kb - ka)} a menos por quilo` : `B, ${brl(ka - kb)} a menos por quilo`, big: true, tone: 'brass' },
            ];
          },
          viz: ({ qa, pa, qb, pb }) => ({
            kind: 'bars',
            bars: [
              { label: `A (${size(qa, 'kg')})`, value: pa / (qa / 1000), text: brl(pa / (qa / 1000)), tone: 'ember' },
              { label: `B (${size(qb, 'kg')})`, value: pb / (qb / 1000), text: brl(pb / (qb / 1000)), tone: 'verdigris' },
            ],
            summary: `Preço por quilo: A ${brl(pa / (qa / 1000))}; B ${brl(pb / (qb / 1000))}`,
          }),
          goal: {
            task: 'Com a embalagem A de 500 g por R$ 9,00, ache o preço da embalagem B de 2 kg que deixa as duas com o mesmo preço por quilo.',
            done: ({ qa, pa, qb, pb }) => qa === 500 && pa === 9 && qb === 2000 && pb === 36,
            success: 'Isso: R$ 9,00 por 500 g é R$ 18,00 por quilo; 2 kg custariam 2 × 18 = R$ 36,00. Abaixo disso, a embalagem grande compensa.',
          },
          insight: 'Embalagem maior não é garantia de economia: só o preço por quilo mostra qual compensa.',
        }),
        key('Compare na mesma unidade', 'Preço por quilo = preço ÷ massa em kg (500 g = 0,5 kg). Converta as embalagens para a mesma unidade antes de comparar. Se uma parte se perde ou sobra sem uso, divida o preço só pelo que é aproveitado.'),
        example('Pacote pequeno ou grande?', 'Um feijão é vendido em pacotes de 500 g por R$ 4,60 e de 2 kg por R$ 17,20. Qual é mais econômico, e quanto se economiza por quilo?', [
          step('Pacote de 500 g:', '4,60 ÷ 0,5 = R$ 9,20 por quilo'),
          step('Pacote de 2 kg:', '17,20 ÷ 2 = R$ 8,60 por quilo'),
          askStep('Compare.', 'Qual é a economia por quilo?', [
            ok('9,20 − 8,60 = R$ 0,60 por quilo, no pacote de 2 kg'),
            no('17,20 − 4,60 = R$ 12,60', 'Isso subtrai os preços de pacotes de tamanhos diferentes. Compare os preços por quilo.'),
          ]),
        ], 'O pacote de 2 kg economiza R$ 0,60 por quilo.'),
        example('Perda na limpeza', 'Um restaurante compra 4 kg de camarão com casca por R$ 120,00. Depois de limpo, sobram 60% da massa. Qual é o custo por quilo de camarão limpo?', [
          step('Massa aproveitada:', '60% de 4 kg = 2,4 kg'),
          askStep('Divida o preço pelo que é aproveitado.', 'Qual é o custo por quilo?', [
            ok('120 ÷ 2,4 = R$ 50,00 por quilo'),
            no('120 ÷ 4 = R$ 30,00 por quilo', 'Isso divide pelo peso comprado. Só 2,4 kg são aproveitados: o quilo limpo custa mais.'),
          ]),
        ], 'O quilo de camarão limpo custa R$ 50,00.'),
        check(numeric({
          prompt: [p('Um frasco de 1 L de limpador concentrado custa R$ 18,00 e rende 4 L de produto pronto. O limpador já pronto custa R$ 5,50 o litro.')],
          ask: 'Quanto se economiza para obter 8 L usando o concentrado?',
          prefix: 'R$',
          answer: 8,
          wrong: [
            { value: 26, feedback: 'Um frasco só rende 4 L. Para 8 L, são 2 frascos: R$ 36,00, contra R$ 44,00 do pronto.' },
            { value: 1, feedback: 'R$ 1,00 é a economia por litro (5,50 − 4,50). Multiplique pelos 8 L.' },
            { value: 36, feedback: 'R$ 36,00 é o gasto com o concentrado. A economia é a diferença para os R$ 44,00 do pronto.' },
          ],
          solution: ['$Pronto: 8 × 5,50 = 44', '$Concentrado: 2 frascos × 18 = 36', '$Economia: 44 − 36 = 8'],
        })),
      ],
      practice: [gen(unitPriceGen), gen(bulkSaveGen), gen(leftoverGen), gen(yieldGen)],
      challenge: [gen(bulkSaveGen), gen(leftoverGen), gen(yieldGen), gen(unitPriceGen)],
      recap: [
        'Preço por unidade = preço ÷ quantidade, na mesma unidade.',
        'Sobra sem uso ou perda: divida só pelo que é aproveitado.',
        'Economia = diferença dos gastos totais para a mesma necessidade.',
      ],
    })),

    stage('promocoes', 'fundamentos', 'Promoções que enganam', 'Traduzir promoções — leve x pague y, produto a mais, desconto, devolução com teto, frete condicionado, caução e planos — em gasto total, para escolher a melhor.', () => ({
      learn: [
        text('Promoções diferentes mudam o preço de jeitos diferentes. "Leve 3, pague 2" dá uma unidade grátis a cada **grupo completo** de 3. "20% a mais de produto" não é o mesmo que "20% de desconto". Devoluções podem ter **teto**, e o frete grátis pode depender do valor **depois** do desconto. Para decidir, calcule o gasto total de cada opção.'),
        lab({
          title: 'Mais produto ou desconto?',
          intro: 'Uma embalagem custa R$ 10,00. Compare o preço por unidade de produto em duas promoções: produto a mais pelo mesmo preço, ou desconto no preço.',
          params: [
            { key: 'b', label: 'Produto a mais', min: 0, max: 50, step: 5, value: 20, format: (v) => pct(v) },
            { key: 'd', label: 'Desconto', min: 0, max: 50, step: 5, value: 10, format: (v) => pct(v) },
          ],
          readouts: ({ b, d }) => {
            const ub = 10 / (1 + b / 100);
            const ud = (10 * (100 - d)) / 100;
            return [
              { label: 'Com produto a mais', value: `${brl(ub)} por unidade` },
              { label: 'Com desconto', value: `${brl(ud)} por unidade` },
              { label: 'Melhor promoção', value: Math.abs(ub - ud) < 0.005 ? 'empate' : ub < ud ? 'produto a mais' : 'desconto', big: true, tone: 'brass' },
            ];
          },
          viz: ({ b, d }) => ({
            kind: 'bars',
            bars: [
              { label: 'Produto a mais', value: 10 / (1 + b / 100), text: brl(10 / (1 + b / 100)), tone: 'ember' },
              { label: 'Desconto', value: (10 * (100 - d)) / 100, text: brl((10 * (100 - d)) / 100), tone: 'verdigris' },
            ],
            max: 10,
            summary: `Por unidade: ${brl(10 / (1 + b / 100))} com produto a mais; ${brl((10 * (100 - d)) / 100)} com desconto`,
          }),
          goal: {
            task: 'Ache o desconto que equivale exatamente a ganhar 25% a mais de produto.',
            done: ({ b, d }) => b === 25 && d === 20,
            success: 'Isso: 25% a mais pelo mesmo preço dá 10 ÷ 1,25 = R$ 8,00 por unidade, o mesmo que 20% de desconto. Ganhar x% a mais vale menos que x% de desconto.',
          },
          insight: 'b% a mais de produto leva o preço por unidade a 1 ÷ (1 + b) do original; d% de desconto, a 1 − d. Para o mesmo número, o desconto ganha.',
        }),
        key('Promoções em contas', 'Leve x, pague y: em cada grupo completo de x, pagam-se y; o que sobra fora dos grupos é pago normalmente. Devolução com teto: vale o menor entre a porcentagem e o teto. Frete condicionado: confira se o valor, depois do desconto, ainda alcança o mínimo.'),
        example('Leve 4, pague 3', 'Um suco custa R$ 7,00 a garrafa, com a promoção "leve 4, pague 3" para cada grupo completo de 4. Quanto se paga por 10 garrafas?', [
          step('Grupos completos:', '10 = 2 grupos de 4 + 2 garrafas avulsas'),
          step('Garrafas pagas:', '2 × 3 + 2 = 8'),
          askStep('Agora, o valor.', 'Quanto se paga?', [
            ok('8 × 7 = R$ 56,00'),
            no('10 × 7 × 0,75 = R$ 52,50', 'A promoção vale só para grupos completos de 4: as 2 garrafas avulsas são pagas inteiras.'),
          ]),
        ], 'Pagam-se R$ 56,00 pelas 10 garrafas.'),
        example('O cupom e o frete', 'Um pedido de R$ 520,00 tem frete grátis se os produtos, depois dos descontos, somarem pelo menos R$ 500,00; abaixo disso, o frete custa R$ 25,00. Um cupom dá 5% de desconto nos produtos. Quanto se economiza usando o cupom?', [
          step('Com o cupom:', '520 × 0,95 = R$ 494,00, abaixo de R$ 500,00'),
          step('O frete volta:', '494 + 25 = R$ 519,00'),
          askStep('Compare com o pedido sem cupom, de R$ 520,00.', 'Qual é a economia?', [
            ok('520 − 519 = R$ 1,00'),
            no('5% de 520 = R$ 26,00', 'O cupom derruba o pedido para menos de R$ 500,00, e o frete de R$ 25,00 passa a ser cobrado.'),
          ]),
        ], 'A economia real é de só R$ 1,00.'),
        check(numeric({
          prompt: [p('Uma compra de R$ 600,00 pode ter 5% de desconto imediato ou 10% de devolução em dinheiro, limitada a R$ 25,00. As promoções não se combinam.')],
          ask: 'Quanto a opção mais vantajosa economiza a mais que a outra?',
          prefix: 'R$',
          answer: 5,
          wrong: [
            { value: 30, feedback: 'R$ 30,00 é só o desconto imediato (5% de 600). Compare com a devolução, limitada a R$ 25,00.' },
            { value: 25, feedback: 'R$ 25,00 é só a devolução, já limitada pelo teto. Compare com o desconto de R$ 30,00.' },
            { value: 35, feedback: 'R$ 35,00 compara a devolução sem teto (R$ 60,00) com o teto. O que importa é o desconto (R$ 30,00) contra a devolução limitada (R$ 25,00).' },
          ],
          solution: ['$Desconto: 0,05 × 600 = 30', '$Devolução: 10% de 600 = 60, limitada a 25', '$Diferença: 30 − 25 = 5'],
        })),
      ],
      practice: [gen(takePayGen), gen(moreOrOffGen), gen(capRefundGen), gen(freeShipGen)],
      challenge: [gen(planDiscountGen), gen(depositReturnGen), gen(takePayGen), gen(moreOrOffGen)],
      recap: [
        'Leve x, pague y: só grupos completos.',
        'Produto a mais: preço por unidade ÷ (1 + b); desconto: × (1 − d).',
        'Teto e frete condicionado mudam o resultado: confira.',
      ],
    })),

    stage('durabilidade', 'interpretacao', 'Durabilidade e consumo', 'Comparar produtos pelo custo no período de uso, somando o preço de compra, as reposições e o consumo de energia ou de combustível.', () => ({
      learn: [
        text('Um produto mais caro pode sair mais barato se **durar mais** ou **gastar menos**. Compare o custo total no período: compras (quantas unidades serão necessárias, arredondando para cima quando a última é comprada inteira) + consumo (energia ou combustível).'),
        lab({
          title: 'Etanol ou gasolina?',
          intro: 'Num carro flex, o etanol rende menos quilômetros por litro. Ajuste os preços e o rendimento do etanol em relação à gasolina.',
          params: [
            { key: 'g', label: 'Gasolina (litro)', min: 400, max: 800, step: 10, value: 600, format: (v) => brl(v / 100) },
            { key: 'e', label: 'Etanol (litro)', min: 300, max: 600, step: 10, value: 440, format: (v) => brl(v / 100) },
            { key: 'r', label: 'Rendimento do etanol', min: 60, max: 80, step: 1, value: 70, format: (v) => pct(v) },
          ],
          readouts: ({ g, e, r }) => {
            const per100g = (100 / 10) * (g / 100);
            const per100e = (100 / (10 * (r / 100))) * (e / 100);
            return [
              { label: 'Etanol ÷ gasolina', value: pct((e / g) * 100, 1) },
              { label: '100 km com gasolina (10 km/L)', value: brl(per100g) },
              { label: '100 km com etanol', value: brl(per100e) },
              { label: 'Compensa', value: Math.abs(per100g - per100e) < 0.005 ? 'empate' : per100e < per100g ? 'etanol' : 'gasolina', big: true, tone: 'brass' },
            ];
          },
          goal: {
            task: 'Com gasolina a R$ 6,00 e etanol rendendo 70% da gasolina, ache o preço do etanol que empata com a gasolina.',
            done: ({ g, e, r }) => g === 600 && r === 70 && e === 420,
            success: 'Isso: 70% de R$ 6,00 é R$ 4,20. Acima disso, cada quilômetro com etanol custa mais que com gasolina.',
          },
          insight: 'O etanol compensa quando a razão entre os preços é menor que a razão entre os rendimentos.',
        }),
        key('Custo no período', 'Custo total = compras + consumo. Compras: número de unidades × preço. Energia: potência em kW × horas × preço do kWh (1.000 W durante 1 hora = 1 kWh). Combustível: distância ÷ km por litro × preço do litro.'),
        example('Pneus que duram mais', 'Um entregador vai rodar 24.000 km. O pneu Padrão custa R$ 280,00 e dura 8.000 km; o pneu Longa custa R$ 450,00 e dura 12.000 km. Qual sai mais barato?', [
          step('Padrão:', '24.000 ÷ 8.000 = 3 pneus → 3 × 280 = R$ 840,00'),
          step('Longa:', '24.000 ÷ 12.000 = 2 pneus → 2 × 450 = R$ 900,00'),
          askStep('Compare.', 'Qual compensa?', [
            ok('O Padrão, R$ 60,00 mais barato'),
            no('O Longa, porque dura mais', 'Durar mais não basta: por quilômetro, o Longa custa 450 ÷ 12.000 = R$ 0,0375, mais que os R$ 0,035 do Padrão.'),
          ]),
        ], 'O Padrão economiza R$ 60,00 nos 24.000 km.'),
        example('A energia de uma lâmpada', 'Uma lâmpada de 12 W fica acesa 5 horas por dia durante 30 dias. Com o kWh a R$ 0,90, quanto custa a energia?', [
          step('Horas no mês:', '5 × 30 = 150 h'),
          step('Energia:', '12 W × 150 h = 1.800 Wh = 1,8 kWh'),
          askStep('Agora, o custo.', 'Quanto se paga?', [
            ok('1,8 × 0,90 = R$ 1,62'),
            no('1.800 × 0,90 = R$ 1.620,00', 'O preço é por kWh: converta 1.800 Wh em 1,8 kWh antes de multiplicar.'),
          ]),
        ], 'A energia custa R$ 1,62 no mês.'),
        check(numeric({
          prompt: [p('Um carro faz 10 km por litro com gasolina e 7 km por litro com etanol. Numa viagem de 350 km, a gasolina custa R$ 6,00 o litro, e o etanol, R$ 4,40.')],
          ask: 'Escolhendo o combustível mais vantajoso, quanto se economiza em relação ao outro?',
          prefix: 'R$',
          answer: 10,
          wrong: [
            { value: 1.6, feedback: 'R$ 1,60 é a diferença de preço por litro. Com etanol, o carro gasta mais litros: compare os gastos da viagem.' },
            { value: 56, feedback: 'Isso usa os mesmos 35 L para os dois combustíveis. Com etanol, são 350 ÷ 7 = 50 L.' },
            { value: 210, feedback: 'R$ 210,00 é o gasto com gasolina (35 L × 6). A economia é a diferença para o etanol, R$ 220,00.' },
          ],
          solution: ['$Gasolina: 350 ÷ 10 = 35 L → 35 × 6 = 210', '$Etanol: 350 ÷ 7 = 50 L → 50 × 4,40 = 220', '$A gasolina economiza 220 − 210 = 10'],
        })),
      ],
      practice: [gen(durableGen), gen(lampGen), gen(fuelGen)],
      challenge: [gen(durableGen), gen(lampGen), gen(tierMachineGen), gen(fuelGen)],
      recap: [
        'Some compras e consumo no período inteiro.',
        'Reposições: arredonde para cima o número de compras.',
        'Energia: W × h ÷ 1.000 = kWh.',
      ],
    })),

    stage('ponto-de-equilibrio', 'aplicacoes', 'Ponto de equilíbrio', 'Comparar planos com parte fixa e parte variável, escrevendo o custo de cada um em função do uso, e encontrar a quantidade a partir da qual um passa a compensar.', () => ({
      learn: [
        text('Muitos planos têm uma **parte fixa** (mensalidade, diária, preço do aparelho) e uma **parte variável** (por minuto, por km, por página). Escreva o custo de cada um como fixo + preço por unidade × quantidade e iguale os dois: o **ponto de equilíbrio** é a quantidade em que custam o mesmo. Se a pergunta pede "estritamente menos", passe para o inteiro seguinte.'),
        lab({
          title: 'Onde as retas se cruzam',
          intro: 'Dois planos de telefone: cada um tem uma parte fixa e um preço por minuto. O gráfico mostra o custo de cada um conforme o uso.',
          params: [
            { key: 'Fa', label: 'Fixo do plano A', min: 0, max: 100, step: 5, value: 30, format: (v) => brl(v) },
            { key: 'va', label: 'A: preço por minuto', min: 0.1, max: 2, step: 0.1, value: 0.6, format: (v) => brl(v) },
            { key: 'Fb', label: 'Fixo do plano B', min: 0, max: 100, step: 5, value: 60, format: (v) => brl(v) },
            { key: 'vb', label: 'B: preço por minuto', min: 0.1, max: 2, step: 0.1, value: 0.4, format: (v) => brl(v) },
          ],
          readouts: ({ Fa, va, Fb, vb }) => {
            const same = Math.abs(va - vb) < 1e-9;
            const x = (Fb - Fa) / (va - vb);
            return [
              { label: 'Custo A', value: `${brl(Fa)} + ${brl(va)} por minuto` },
              { label: 'Custo B', value: `${brl(Fb)} + ${brl(vb)} por minuto` },
              { label: 'Empate', value: same ? (Fa === Fb ? 'sempre: os planos são iguais' : 'nunca: as retas são paralelas') : x < 0 ? 'nunca, para um uso positivo' : `${num(x, 1)} minutos`, big: true, tone: 'brass' },
            ];
          },
          viz: ({ Fa, va, Fb, vb }) => {
            const x = Math.abs(va - vb) < 1e-9 ? -1 : (Fb - Fa) / (va - vb);
            return {
              kind: 'chart',
              xLabel: 'minutos',
              yLabel: 'custo (R$)',
              xMin: 0,
              xMax: 300,
              yMin: 0,
              series: [
                { label: 'Plano A', tone: 'ember', points: [[0, Fa], [300, Fa + 300 * va]] },
                { label: 'Plano B', tone: 'verdigris', points: [[0, Fb], [300, Fb + 300 * vb]] },
              ],
              markers: x >= 0 && x <= 300 ? [{ x, y: Fa + va * x, label: `${num(x, 0)} min`, tone: 'brass' }] : [],
              yFormat: (y) => num(y, 0),
              summary: x >= 0 && x <= 300 ? `As retas se cruzam em ${num(x, 1)} minutos, custo de ${brl(Fa + va * x)}` : 'As retas não se cruzam entre 0 e 300 minutos',
            };
          },
          goal: {
            task: 'Plano A: R$ 20,00 + R$ 0,50 por minuto; plano B: fixo de R$ 50,00. Ache o preço por minuto do plano B que faz os planos empatarem em 150 minutos.',
            done: ({ Fa, va, Fb, vb }) => Fa === 20 && Math.abs(va - 0.5) < 1e-9 && Fb === 50 && Math.abs(vb - 0.3) < 1e-9,
            success: 'Isso: 20 + 0,50 × 150 = 95 e 50 + 0,30 × 150 = 95. Abaixo de 150 minutos, o plano A é mais barato; acima, o B.',
          },
          insight: 'Antes do empate, compensa o plano de menor parte fixa; depois, o de menor preço por unidade.',
        }),
        key('Fixo + variável', 'Custo = parte fixa + preço por unidade × quantidade. Para o empate: fixo A + a·x = fixo B + b·x, ou x = (fixo B − fixo A) ÷ (a − b). "Estritamente menos": o primeiro inteiro depois do empate.'),
        example('Duas locadoras', 'A locadora Sol cobra R$ 120,00 por dia, com quilometragem livre; a Lua cobra R$ 70,00 por dia mais R$ 0,50 por km. Para 3 dias de aluguel, com quantos quilômetros os custos empatam?', [
          step('Sol, 3 dias:', '3 × 120 = R$ 360,00'),
          step('Lua, 3 dias:', '3 × 70 + 0,50x = 210 + 0,50x'),
          askStep('Iguale.', 'Qual é o empate?', [
            ok('210 + 0,50x = 360 → x = 300 km'),
            no('(120 − 70) ÷ 0,50 = 100 km', 'Isso compara uma diária só. São 3 diárias: a diferença fixa é 3 × 50 = R$ 150,00.'),
          ]),
        ], 'Os custos empatam com 300 km.'),
        example('Estritamente mais barato', 'Um ingresso avulso de museu custa R$ 18,00; o passe anual custa R$ 200,00. A partir de quantas visitas o passe sai estritamente mais barato?', [
          step('O passe compensa quando:', '18n > 200 → n > 11,1'),
          askStep('O número de visitas é inteiro.', 'Qual é o menor?', [
            ok('12 visitas: 12 × 18 = R$ 216,00 > R$ 200,00'),
            no('11 visitas', 'Com 11 visitas, os avulsos somam R$ 198,00, ainda menos que o passe.'),
          ]),
        ], 'O passe compensa a partir de 12 visitas.'),
        check(numeric({
          prompt: [p('Uma copiadora cobra R$ 0,25 por página. Uma impressora custa R$ 360,00, e cada página impressa nela sai por R$ 0,07. Só importam a compra e o custo das páginas.')],
          ask: 'A partir de quantas páginas a impressora fica estritamente mais barata que a copiadora?',
          unit: 'páginas',
          answer: 2001,
          wrong: [
            { value: 2000, feedback: 'Com 2.000 páginas, os custos empatam (R$ 500,00 nas duas opções). Para ser estritamente mais barata, é preciso uma página a mais.' },
            { value: 1440, feedback: 'Isso divide o preço da impressora pelo custo da copiadora, como se imprimir em casa fosse de graça. A economia por página é 0,25 − 0,07 = R$ 0,18.' },
            { value: 1441, feedback: 'Isso ignora o custo de R$ 0,07 por página da impressora. A economia por página é de R$ 0,18.' },
          ],
          solution: ['$0,25n > 360 + 0,07n → 0,18n > 360 → n > 2.000', '$Menor inteiro: 2.001 páginas'],
        })),
      ],
      practice: [gen(breakEvenGen), gen(strictlyLessGen), gen(franchiseGen), gen(monthPassGen)],
      challenge: [gen(enrollmentGen), gen(tierRentGen), gen(commitmentGen), gen(franchiseGen), gen(strictlyLessGen)],
      recap: [
        'Custo = fixo + variável × quantidade.',
        'Empate: iguale os custos.',
        '"Estritamente menos": o próximo inteiro depois do empate.',
      ],
    })),

    stage('combinacoes', 'aprofundamento', 'A combinação mais barata', 'Encontrar a combinação mais barata de embalagens, veículos ou latas que atende a uma necessidade, testando as possibilidades de forma organizada.', () => ({
      learn: [
        text('Quando só existem embalagens fechadas, a compra mais barata pode **misturar tamanhos**. Organize as tentativas numa tabela: para cada quantidade da embalagem maior (0, 1, 2…), quantas menores completam o necessário? Compare o custo das linhas que atendem. A embalagem de menor preço por unidade nem sempre vence, por causa das sobras.'),
        lab({
          title: 'Monte a compra',
          intro: 'São necessários pelo menos 23 L de um produto. Há galões de 5 L por R$ 40,00 e de 2 L por R$ 18,00.',
          params: [
            { key: 'g', label: 'Galões de 5 L', min: 0, max: 6, step: 1, value: 0, format: (v) => `${v}` },
            { key: 'm', label: 'Galões de 2 L', min: 0, max: 12, step: 1, value: 0, format: (v) => `${v}` },
          ],
          readouts: ({ g, m }) => {
            const L = 5 * g + 2 * m;
            return [
              { label: 'Volume', value: `${L} L`, ...(L >= 23 ? { tone: 'verdigris' as const } : { tone: 'ember' as const }) },
              { label: 'Custo', value: brl(40 * g + 18 * m), big: true, tone: 'brass' },
              { label: 'Atende?', value: L >= 23 ? `sim (sobram ${L - 23} L)` : `não: faltam ${23 - L} L` },
            ];
          },
          viz: ({ g, m }) => ({
            kind: 'parts',
            segments: [
              { label: 'Galões de 5 L', value: 5 * g, tone: 'brass' },
              { label: 'Galões de 2 L', value: 2 * m, tone: 'sky' },
            ],
            summary: `${g} galões de 5 L e ${m} de 2 L: ${5 * g + 2 * m} L por ${brl(40 * g + 18 * m)}`,
          }),
          goal: {
            task: 'Ache a combinação mais barata com pelo menos 23 L.',
            done: ({ g, m }) => g === 3 && m === 4,
            success: 'Isso: 3 galões de 5 L e 4 de 2 L dão exatamente 23 L por R$ 192,00. Cinco galões de 5 L custariam R$ 200,00, com 2 L de sobra.',
          },
          insight: 'O galão de 5 L tem o litro mais barato (R$ 8,00 contra R$ 9,00), mas a sobra pode custar mais que a diferença.',
        }),
        key('Organize as tentativas', 'Liste as opções numa tabela — quantas grandes, quantas pequenas, quantidade total, custo —, descarte as que não atendem e compare as que atendem. Comece pela embalagem de menor preço por unidade, mas teste as vizinhas.'),
        example('Viagem em grupo', 'Sete pessoas vão ao mesmo lugar. Um carro por aplicativo custa R$ 26,00 e leva até 4 pessoas; o trem custa R$ 7,50 por pessoa. Qual é o menor gasto?', [
          step('Só de trem:', '7 × 7,50 = R$ 52,50'),
          step('Dois carros:', '2 × 26 = R$ 52,00'),
          askStep('E misturando?', 'Qual é o menor gasto?', [
            ok('1 carro com 4 pessoas e 3 de trem: 26 + 22,50 = R$ 48,50'),
            no('Dois carros: R$ 52,00', 'O 2º carro levaria só 3 pessoas: por R$ 26,00, sai mais caro que 3 passagens de trem (R$ 22,50).'),
          ]),
        ], 'O menor gasto é R$ 48,50.'),
        example('Tinta para duas demãos', 'Uma parede de 45 m² receberá 2 demãos; cada litro cobre 12 m² por demão. Há latas de 4 L por R$ 90,00 e de 1 L por R$ 28,00. Qual é o menor gasto?', [
          step('Tinta necessária:', '2 × 45 ÷ 12 = 7,5 L'),
          step('Opções com pelo menos 7,5 L:', '2 latas de 4 L (8 L); 1 de 4 L + 4 de 1 L (8 L); 8 de 1 L'),
          askStep('Compare os custos.', 'Qual é o menor?', [
            ok('2 latas de 4 L: R$ 180,00, com 0,5 L de sobra'),
            no('1 lata de 4 L + 4 de 1 L: R$ 202,00', 'Também dá 8 L, mas custa mais: a lata de 1 L tem o litro mais caro.'),
          ]),
        ], 'O menor gasto é R$ 180,00.'),
        check(numeric({
          prompt: [p('Uma escola precisa de exatamente 18 marcadores. Há caixas fechadas de 4 marcadores por R$ 10,00 e de 6 por R$ 14,00, e não pode sobrar nenhum marcador.')],
          ask: 'Qual é o menor gasto?',
          prefix: 'R$',
          answer: 42,
          wrong: [
            { value: 44, feedback: '3 caixas de 4 e 1 de 6 também dão 18, mas custam R$ 44,00. Três caixas de 6 saem por R$ 42,00.' },
            { value: 28, feedback: 'R$ 28,00 compra só 2 caixas de 6, ou 12 marcadores. São necessários 18.' },
            { value: 45, feedback: 'R$ 45,00 seria 18 marcadores ao preço da caixa de 4 (R$ 2,50 cada), mas 18 não é múltiplo de 4. Liste as combinações exatas: 3 de 6 ou 3 de 4 + 1 de 6.' },
          ],
          solution: ['$4x + 6y = 18: (x, y) = (0, 3) ou (3, 1)', '$(0, 3): 3 × 14 = 42; (3, 1): 3 × 10 + 14 = 44', '$Menor: R$ 42,00'],
        })),
      ],
      practice: [gen(packComboGen), gen(exactComboGen), gen(groupGen)],
      challenge: [gen(paintGen), gen(packComboGen), gen(exactComboGen), gen(groupGen)],
      recap: [
        'Embalagens fechadas: teste as combinações numa tabela.',
        'O menor preço por unidade pode perder por causa das sobras.',
        'Descarte o que não atende; compare o que atende.',
      ],
    })),

    stage('maestria', 'maestria', 'Maestria: decidir com números', 'Resolver problemas inéditos de custo-benefício que combinam tarifas por faixas, retorno de investimentos, taxas de plataformas e comparações de planos.', () => ({
      learn: [
        strategy('Custo-benefício em 4 passos', '1) Defina a necessidade (quantidade, período, uso). 2) Escreva o custo total de cada opção para essa necessidade. 3) Cuidado com as regras: faixas, tetos, grupos completos, sobras. 4) Compare e responda exatamente o que foi pedido: gasto, economia ou porcentagem.'),
        example('Tarifa por faixas', 'Uma conta de energia cobra R$ 0,60 por kWh nos primeiros 100 kWh, R$ 0,80 do 101º ao 200º e R$ 1,10 acima de 200 kWh, cada faixa separadamente. Quanto custam 250 kWh?', [
          step('1ª faixa:', '100 × 0,60 = R$ 60,00'),
          step('2ª faixa:', '100 × 0,80 = R$ 80,00'),
          askStep('Falta o que passa de 200 kWh.', 'Qual é a conta?', [
            ok('60 + 80 + 50 × 1,10 = R$ 195,00'),
            no('250 × 1,10 = R$ 275,00', 'Cada faixa tem seu preço: só os 50 kWh acima de 200 pagam R$ 1,10.'),
          ]),
        ], 'A conta é de R$ 195,00.'),
        reveal('Por que o maior pacote nem sempre é o mais barato?', 'O preço por unidade compara embalagens, mas o que importa é o gasto total para a sua necessidade. Se o pacote grande sobra sem uso, estraga antes de acabar ou obriga a comprar mais do que o necessário, o preço por unidade aproveitada sobe — e o pacote "econômico" sai caro.'),
        check(numeric({
          prompt: [p('Uma artesã vende numa plataforma que retém 10% do preço anunciado mais R$ 3,00 fixos por venda. Ela quer receber R$ 87,00 líquidos por peça.')],
          ask: 'Qual preço ela deve anunciar?',
          prefix: 'R$',
          answer: 100,
          wrong: [
            { value: 98.7, feedback: 'Isso aplica os 10% sobre o valor líquido (87 × 1,1 + 3). A taxa incide sobre o preço anunciado: preço × 0,9 − 3 = 87.' },
            { value: 99.67, feedback: 'Isso divide só o líquido por 0,9 e soma os R$ 3,00 depois. O fixo também sai do preço: (87 + 3) ÷ 0,9.' },
            { value: 90, feedback: 'R$ 90,00 esquece a taxa de 10%: ela também é descontada do preço anunciado.' },
          ],
          solution: ['$Preço × 0,9 − 3 = 87', '$Preço × 0,9 = 90 → preço = 100'],
        })),
      ],
      practice: [gen(tierBillGen), gen(netPriceGen), gen(durableGen)],
      challenge: [gen(paybackGen), gen(tierBillGen), gen(breakEvenGen), gen(packComboGen)],
      recap: [
        'Defina a necessidade antes de comparar.',
        'Faixas, tetos e taxas: aplique cada regra à sua base.',
        'Responda o que foi pedido: gasto, economia ou porcentagem.',
      ],
    })),
  ],
});
