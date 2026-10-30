/**
 * Aula: Juros simples — capital, taxa, tempo, juros e montante; descobrir capital, taxa ou
 * tempo (inclusive em tabelas e gráficos); taxa e prazo na mesma unidade (ano, mês, dia, mês e
 * ano comerciais); multa e juros de mora; juros sobre saldos diários; taxas que mudam,
 * carência, depósitos em datas diferentes e pagamentos parciais.
 */
import {
  askStep,
  barChart,
  check,
  draftNumeric,
  example,
  fill,
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
  warn,
} from '../../kit/build';
import { brl, fixed, num, pct, qty, round } from '../../kit/format';
import type { Rand } from '../../types';

const isInt = (x: number) => Number.isInteger(round(x, 9));
/** Taxa percentual na forma decimal: 1,5% → "0,015". */
const dec = (i: number) => num(i / 100, 5);
const meses = (t: number) => `${num(t, 2)} ${t === 1 ? 'mês' : 'meses'}`;

const WHO = ['Uma cooperativa', 'Uma associação de bairro', 'Uma escola de música', 'Um clube de ciclismo', 'Uma família'];

// ———————————————————————————————————————————————— geradores: o conceito

const SIMPLE_CTX = [
  { loan: true, lead: (c: string) => `Uma costureira pegou ${c} emprestados para comprar uma máquina de bordar` },
  { loan: true, lead: (c: string) => `Um pequeno agricultor pegou ${c} emprestados para comprar sementes` },
  { loan: false, lead: (c: string) => `Uma estudante aplicou ${c} que recebeu como prêmio` },
  { loan: false, lead: (c: string) => `Um clube de leitura aplicou ${c} do caixa` },
];
const SIMPLE_BANK = new Set(['2000|3|5', '3000|0.8|6', '18000|0.5|10', '800|1.5|4', '1200|0.5|5', '1000|2|6', '1000|2|3']);

/** J = C · i · t e M = C + J. */
function simpleGen(r: Rand) {
  for (;;) {
    const c = r.pick(SIMPLE_CTX);
    const C = r.pick([600, 800, 1000, 1200, 1500, 2000, 2400, 2500, 3000, 4000, 5000, 6000, 8000, 10000]);
    const i = r.pick([0.5, 0.8, 1, 1.2, 1.5, 2, 2.5, 3, 4]);
    const t = r.pick([2, 3, 4, 5, 6, 8, 10, 12]);
    if (SIMPLE_BANK.has(`${C}|${i}|${t}`)) continue; // questões do banco
    const perMonth = round((C * i) / 100, 6);
    const J = round(perMonth * t, 6);
    if (!isInt(perMonth * 100)) continue;
    const M = C + J;
    const askM = r.next() < 0.5;
    const comp = C * (1 + i / 100) ** t;
    const total = c.loan ? 'total' : 'montante';
    return draftNumeric({
      prompt: [
        p(
          c.loan
            ? `${c.lead(brl(C))}, a juros simples de ${pct(i)} ao mês, para pagar tudo de uma vez depois de ${t} meses.`
            : `${c.lead(brl(C))}, a juros simples de ${pct(i)} ao mês, por ${t} meses, sem novos depósitos nem retiradas.`,
        ),
      ],
      ask: c.loan ? (askM ? 'Quanto será pago no total?' : 'Quanto será pago só de juros?') : askM ? 'Qual será o montante ao final?' : 'Quanto a aplicação vai render de juros?',
      prefix: 'R$',
      answer: askM ? M : J,
      wrong: [
        askM
          ? { value: J, feedback: `${brl(J)} são só os juros. O ${total} soma o capital: ${brl(C)} + ${brl(J)}.` }
          : { value: M, feedback: `${brl(M)} é o ${total} (capital + juros). A pergunta pede só os juros.` },
        { value: askM ? C + perMonth : perMonth, feedback: `Isso conta só um mês de juros (${brl(perMonth)}). Em ${t} meses: ${t} × ${brl(perMonth)}.` },
        { value: round(askM ? comp : comp - C, 2), feedback: 'Esse valor usa juros compostos (juros sobre juros). Em juros simples, todo mês rende o mesmo valor, calculado sobre o capital.' },
        { value: round((askM ? C : 0) + C * i * t, 2), feedback: `Isso usa a taxa como número inteiro (${num(i)}) em vez de ${pct(i)} = ${dec(i)}.` },
      ],
      hints: [`Juros de um mês: ${pct(i)} de ${brl(C)} = ${brl(perMonth)}.`, `Em ${t} meses: ${t} × ${brl(perMonth)}${askM ? '; depois, some o capital' : ''}.`],
      solution: [`$J = ${num(C)} × ${dec(i)} × ${t} = ${num(J, 2)}`, ...(askM ? [`$M = ${num(C)} + ${num(J, 2)} = ${num(M, 2)}`] : [])],
    });
  }
}

// ———————————————————————————————————————————————— geradores: as incógnitas

const CAPITAL_BANK = new Set(['90|1|6']);

/** O capital a partir dos juros. */
function capitalGen(r: Rand) {
  for (;;) {
    const C = r.pick([1200, 1500, 2000, 2400, 3000, 4000, 5000, 6000, 8000, 10000, 20000, 25000, 40000, 50000]);
    const i = r.pick([0.5, 0.6, 0.75, 0.8, 1, 1.2, 1.5, 2]);
    const income = r.next() < 0.35;
    const t = income ? 1 : r.pick([3, 4, 5, 6, 8, 10, 12]);
    const J = round((C * i * t) / 100, 6);
    if (!isInt(J * 100)) continue;
    if (income && J === 450 && i === 0.6) continue; // questão do banco
    if (!income && CAPITAL_BANK.has(`${J}|${i}|${t}`)) continue; // questão do banco
    if (income) {
      return draftNumeric({
        prompt: [p(`${r.pick(WHO)} quer obter ${brl(J)} de juros por mês, sacando só os juros e mantendo o valor aplicado, numa aplicação que paga juros simples de ${pct(i)} ao mês.`)],
        ask: 'Quanto precisa aplicar?',
        prefix: 'R$',
        answer: C,
        wrong: [
          { value: round(J / i, 2), feedback: `Isso usa a taxa como número inteiro (${num(i)}). Com ${pct(i)} = ${dec(i)}: C = ${num(J)} ÷ ${dec(i)}.` },
          { value: round(C / 10, 2), feedback: `Confira as casas decimais: ${pct(i)} de ${brl(C / 10)} dá só ${brl(J / 10)}.` },
          { value: round(J * 12, 2), feedback: `${brl(J * 12)} são os juros de um ano, e não o capital. Os juros de um mês são ${pct(i)} do capital: C = ${num(J)} ÷ ${dec(i)}.` },
        ],
        hints: [`Os juros de cada mês são ${pct(i)} do capital: C × ${dec(i)} = ${num(J)}.`, `C = ${num(J)} ÷ ${dec(i)}.`],
        solution: [`$C = ${num(J, 2)} ÷ ${dec(i)} = ${num(C)}`],
      });
    }
    return draftNumeric({
      prompt: [p(`${r.pick(WHO)} aplicou um valor a juros simples de ${pct(i)} ao mês. Depois de ${t} meses, sem depósitos nem retiradas, a aplicação tinha rendido ${brl(J)}.`)],
      ask: 'Qual foi o valor aplicado?',
      prefix: 'R$',
      answer: C,
      wrong: [
        { value: round(J / (i / 100), 2), feedback: `Isso esquece o prazo: ${brl(J)} são os juros de ${t} meses, e não de um. C = ${num(J)} ÷ (${dec(i)} × ${t}).` },
        { value: round(J / (i * t), 2), feedback: `Isso usa a taxa como número inteiro (${num(i)}) em vez de ${pct(i)} = ${dec(i)}.` },
        { value: round(J * (1 + (i / 100) * t), 2), feedback: 'Isso aplica juros sobre os próprios juros. O capital sai de C = J ÷ (i · t).' },
      ],
      hints: [`J = C × ${dec(i)} × ${t}.`, `C = ${num(J, 2)} ÷ (${dec(i)} × ${t}) = ${num(J, 2)} ÷ ${num((i / 100) * t, 4)}.`],
      solution: [`$C = ${num(J, 2)} ÷ (${dec(i)} × ${t}) = ${num(C)}`],
    });
  }
}

const RATE_BANK = new Set(['3500|420|6', '2500|200|8', '2400|216|3']);

/** A taxa a partir dos juros ou do montante. */
function rateGen(r: Rand) {
  for (;;) {
    const C = r.pick([1000, 1200, 1500, 2000, 2400, 2500, 3000, 4000, 5000, 6000, 8000]);
    const i = r.pick([0.5, 0.8, 1, 1.2, 1.25, 1.5, 2, 2.5, 3, 4]);
    const t = r.pick([2, 3, 4, 5, 6, 8, 10, 12]);
    const J = round((C * i * t) / 100, 6);
    if (!isInt(J * 100) || RATE_BANK.has(`${C}|${J}|${t}`)) continue; // questões do banco
    const M = C + J;
    const kind = r.pick(['juros', 'montante', 'loja']);
    const prompt =
      kind === 'juros'
        ? `${r.pick(WHO)} pegou ${brl(C)} emprestados a juros simples, com pagamento único depois de ${t} meses. Além do valor emprestado, pagou ${brl(J)} de juros.`
        : kind === 'montante'
          ? `Um empréstimo de ${brl(C)}, a juros simples, foi quitado ${t} meses depois com um pagamento único de ${brl(M)}.`
          : `Uma loja vende uma geladeira por ${brl(C)} à vista ou por ${brl(M)} num pagamento único ${t} meses depois da compra, com juros simples.`;
    return draftNumeric({
      prompt: [p(prompt)],
      ask: 'Qual é a taxa mensal de juros simples?',
      unit: '%',
      answer: i,
      wrong: [
        { value: round((100 * J) / C, 2), feedback: `${pct((100 * J) / C)} é a taxa do período inteiro (${num(J, 2)} ÷ ${num(C)}). Por mês: divida por ${t}.` },
        { value: round((100 * J) / (M * t), 2), feedback: 'Isso divide os juros pelo montante. A taxa é calculada sobre o capital.' },
        { value: round(i / 100, 5), feedback: `${dec(i)} é a taxa na forma decimal. Em porcentagem: ${pct(i)}.` },
        ...(kind !== 'juros' ? [{ value: round((100 * M) / (C * t), 2), feedback: `Isso divide o montante, e não os juros, pelo capital. Primeiro: J = ${num(M, 2)} − ${num(C)} = ${num(J, 2)}.` }] : []),
      ],
      hints: [kind === 'juros' ? `Juros: ${brl(J)} em ${t} meses.` : `Juros: ${brl(M)} − ${brl(C)} = ${brl(J)}.`, `i = ${num(J, 2)} ÷ (${num(C)} × ${t}).`],
      solution: [`$i = ${num(J, 2)} ÷ (${num(C)} × ${t}) = ${num(i / 100, 5)} = ${pct(i)} ao mês`],
    });
  }
}

/** O tempo a partir dos juros, do montante ou de uma fração do capital. */
function timeGen(r: Rand) {
  for (;;) {
    const kind = r.pick(['juros', 'montante', 'fracao']);
    const i = r.pick([0.5, 0.8, 1, 1.25, 1.5, 2, 2.5, 3, 4]);
    if (kind === 'fracao') {
      const f = r.pick([20, 25, 30, 40, 50, 60, 75, 100]);
      const t = f / i;
      if (!isInt(t) || t > 120 || (i === 2 && f === 50)) continue; // questão do banco
      return draftNumeric({
        prompt: [p(`Um capital foi aplicado a juros simples de ${pct(i)} ao mês, sem depósitos nem retiradas.`)],
        ask: `Em quantos meses os juros acumulados chegam a ${pct(f)} do capital?`,
        unit: 'meses',
        answer: t,
        wrong: [
          { value: round(f * i, 2), feedback: 'Multiplicar o percentual pela taxa não dá o tempo. Cada mês rende i do capital: t = (percentual) ÷ i.' },
          { value: f, feedback: `${f} é o percentual pedido, e não o número de meses.` },
          ...(f !== 100 ? [{ value: round(100 / i, 2), feedback: `Esse é o tempo para os juros igualarem o capital inteiro (100%). A meta é ${pct(f)}.` }] : []),
        ],
        hints: [`Cada mês rende ${pct(i)} do capital.`, `t = ${f} ÷ ${num(i)}.`],
        solution: [`$t = ${f}% ÷ ${pct(i)} = ${num(t)} meses`],
      });
    }
    const C = r.pick([800, 1000, 1200, 1500, 1600, 2000, 2400, 3000, 3200, 4000, 5000]);
    const t = r.pick([3, 4, 5, 6, 8, 10, 12, 15, 16, 20, 24]);
    const J = round((C * i * t) / 100, 6);
    if (!isInt(J * 100)) continue;
    if ((C === 1600 && i === 1.25 && t === 6) || (C === 3200 && i === 1.25 && t === 20)) continue; // questões do banco
    const M = C + J;
    if (kind === 'juros') {
      return draftNumeric({
        prompt: [p(`${r.pick(WHO)} pegou ${brl(C)} emprestados a juros simples de ${pct(i)} ao mês. O limite que pode pagar só de juros é ${brl(J)}.`)],
        ask: 'Depois de quantos meses os juros atingem esse limite?',
        unit: 'meses',
        answer: t,
        wrong: [
          { value: round((100 * J) / C, 2), feedback: `${pct((100 * J) / C)} é quanto os juros representam do capital, e não o número de meses. Divida pela taxa mensal.` },
          { value: round(J / (C * i), 2), feedback: `Isso usa a taxa como número inteiro (${num(i)}) em vez de ${pct(i)} = ${dec(i)}.` },
        ],
        hints: [`Juros de um mês: ${pct(i)} de ${brl(C)} = ${brl((C * i) / 100)}.`, `Quantos meses de ${brl((C * i) / 100)} somam ${brl(J)}?`],
        solution: [`$t = ${num(J, 2)} ÷ ${num((C * i) / 100, 2)} = ${t} meses`],
      });
    }
    return draftNumeric({
      prompt: [p(`Uma estudante tem ${brl(C)} e quer juntar ${brl(M)} para comprar um instrumento. Ela vai aplicar o dinheiro a juros simples de ${pct(i)} ao mês, sem novos depósitos nem retiradas.`)],
      ask: 'Em quantos meses o montante chega ao valor desejado?',
      unit: 'meses',
      answer: t,
      wrong: [
        { value: round(M / ((C * i) / 100), 2), feedback: `Isso usa o montante no lugar dos juros. Primeiro: J = ${num(M)} − ${num(C)} = ${num(J, 2)}.` },
        { value: round((100 * J) / C, 2), feedback: `${pct((100 * J) / C)} é quanto os juros representam do capital, e não o número de meses.` },
      ],
      hints: [`Juros necessários: ${brl(M)} − ${brl(C)} = ${brl(J)}.`, `Por mês, rendem ${brl((C * i) / 100)}.`],
      solution: [`$J = ${num(M, 2)} − ${num(C)} = ${num(J, 2)}`, `$t = ${num(J, 2)} ÷ ${num((C * i) / 100, 2)} = ${t} meses`],
    });
  }
}

/** Quanto aplicar hoje para ter um montante no futuro: C = M ÷ (1 + i · t). */
function presentValueGen(r: Rand) {
  for (;;) {
    const C = r.pick([1000, 1500, 2000, 2500, 3000, 4000, 5000, 6000, 8000, 10000]);
    const i = r.pick([0.5, 0.8, 1, 1.25, 1.5, 2]);
    const t = r.pick([3, 4, 6, 8, 10, 12]);
    if (C === 5000 && i === 1.5 && t === 8) continue; // questão do banco
    const f = 1 + (i / 100) * t;
    const M = round(C * f, 6);
    if (!isInt(M * 100)) continue;
    return draftNumeric({
      prompt: [p(`${r.pick(WHO)} precisa ter ${brl(M)} daqui a ${t} meses para trocar o piso da sede. Vai aplicar hoje uma única quantia a juros simples de ${pct(i)} ao mês, sem taxas.`)],
      ask: 'Quanto deve aplicar hoje?',
      prefix: 'R$',
      answer: C,
      wrong: [
        { value: round(M * (1 - (i / 100) * t), 2), feedback: `Tirar ${pct(i * t)} do montante não desfaz os juros: eles foram calculados sobre o capital, que é menor. Divida: ${num(M)} ÷ ${num(f, 4)}.` },
        { value: round(M / (1 + i / 100) ** t, 2), feedback: `Isso desconta juros compostos. Em juros simples: C = M ÷ (1 + i · t) = ${num(M)} ÷ ${num(f, 4)}.` },
        { value: round(M - (C * i) / 100, 2), feedback: 'Isso desconta só um mês de juros. São ' + `${t} meses: C = M ÷ (1 + i · t).` },
      ],
      hints: [`Fator do montante: 1 + ${dec(i)} × ${t} = ${num(f, 4)}.`, `C = ${num(M, 2)} ÷ ${num(f, 4)}.`],
      solution: [`$1 + ${dec(i)} × ${t} = ${num(f, 4)}`, `$C = ${num(M, 2)} ÷ ${num(f, 4)} = ${num(C)}`],
    });
  }
}

// ———————————————————————————————————————————————— geradores: taxa e prazo

const ANNUAL_WHO = ['Uma empresa júnior', 'Uma ONG ambiental', 'Uma família', 'Uma banda'];

/** Taxa anual com prazo em meses. */
function annualGen(r: Rand) {
  for (;;) {
    const C = r.pick([1200, 2400, 3000, 3600, 4800, 6000, 7200, 9000, 12000]);
    const a = r.pick([6, 8, 9, 10, 12, 15, 18, 24]);
    const m = r.pick([2, 3, 4, 5, 6, 8, 9, 10]);
    if ((C === 7200 && a === 18 && m === 5) || (C === 4000 && a === 8 && m === 9)) continue; // questões do banco
    const J = round((C * a * m) / 1200, 6);
    if (!isInt(J * 100)) continue;
    return draftNumeric({
      prompt: [p(`${r.pick(ANNUAL_WHO)} aplicou ${brl(C)} a juros simples de ${pct(a)} ao ano e resgatou o dinheiro ${m} meses depois.`)],
      ask: 'Quanto a aplicação rendeu de juros?',
      prefix: 'R$',
      answer: J,
      wrong: [
        { value: round((C * a * m) / 100, 2), feedback: `Isso trata a taxa anual como mensal. ${pct(a)} ao ano = ${pct(a / 12, 3)} ao mês; ou use o prazo em anos: ${m}/12.` },
        { value: round((C * a) / 100, 2), feedback: `${brl((C * a) / 100)} é o rendimento de um ano inteiro. Em ${m} meses: ${m}/12 disso.` },
        { value: round(C + J, 2), feedback: `${brl(C + J)} é o montante. A pergunta pede o rendimento (os juros).` },
        { value: round((C * a) / 1200, 2), feedback: `${brl((C * a) / 1200)} é o rendimento de um mês só. São ${m} meses.` },
      ],
      hints: [`${pct(a)} ao ano = ${pct(a / 12, 3)} ao mês (em juros simples, divida por 12).`, `J = ${num(C)} × ${num(a / 100, 4)} × ${m}/12.`],
      solution: [`$J = ${num(C)} × ${num(a / 100, 4)} × ${m}/12 = ${num(J, 2)}`],
    });
  }
}

const DAYS_CTX = [
  (c: string, d: number) => `Uma oficina comprou peças de ${c} com crédito do fornecedor, para pagar ${d} dias depois`,
  (c: string, d: number) => `Um restaurante adiou por ${d} dias o pagamento de uma conta de ${c}`,
  (c: string, d: number) => `Uma papelaria pegou ${c} emprestados por ${d} dias`,
];

/** Prazos em dias: taxa mensal (mês comercial), diária ou anual (ano comercial). */
function daysGen(r: Rand) {
  for (;;) {
    const kind = r.pick(['mensal', 'mensal', 'diaria', 'anual']);
    const C = r.pick([600, 900, 1200, 1500, 1800, 2400, 3000, 3600, 4500]);
    const askM = r.next() < 0.5;
    const lead = r.pick(DAYS_CTX);
    let J: number;
    let rate: string;
    let d: number;
    let wrongs: { value: number; feedback: string }[];
    let how: string;
    if (kind === 'mensal') {
      const i = r.pick([0.9, 1, 1.5, 2, 2.5, 3, 4.5]);
      d = r.pick([10, 12, 15, 18, 20, 24, 36, 40, 45]);
      if ((C === 2700 && i === 4.5 && d === 40) || (C === 900 && i === 0.9 && d === 20)) continue; // questões do banco
      J = (C * i * d) / 3000;
      rate = `${pct(i)} ao mês, proporcionais aos dias (mês comercial de 30 dias)`;
      how = `J = ${num(C)} × ${dec(i)} × ${d}/30`;
      wrongs = [
        { value: (C * i * d) / 100, feedback: `Isso usa ${pct(i)} por DIA. A taxa é mensal: ${d} dias = ${d}/30 de mês.` },
        { value: (C * i) / 100, feedback: `Isso cobra um mês inteiro. Foram ${d} dias: ${num(d / 30, 2)} mês.` },
      ];
    } else if (kind === 'diaria') {
      const k = r.pick([0.03, 0.04, 0.05, 0.1]);
      d = r.pick([10, 15, 20, 30, 45, 60, 90]);
      if (C === 1400 && k === 0.05 && d === 60) continue; // questão do banco
      J = (C * k * d) / 100;
      rate = `${pct(k)} ao dia, sem capitalização`;
      how = `J = ${num(C)} × ${num(k / 100, 5)} × ${d}`;
      wrongs = [
        { value: (C * k * d) / 3000, feedback: `Isso trata a taxa como mensal. Ela já é diária: multiplique pelos ${d} dias.` },
        { value: (C * k) / 100, feedback: `Isso cobra um dia só. São ${d} dias.` },
      ];
    } else {
      const a = r.pick([9, 12, 15, 18, 24, 36]);
      d = r.pick([30, 45, 60, 75, 90, 120, 150, 180]);
      if (C === 1800 && a === 12 && d === 75) continue; // questão do banco
      J = (C * a * d) / 36000;
      rate = `${pct(a)} ao ano (ano comercial de 360 dias)`;
      how = `J = ${num(C)} × ${num(a / 100, 4)} × ${d}/360`;
      wrongs = [
        { value: (C * a * d) / 36500, feedback: 'Isso usa o ano de 365 dias. O contrato usa o ano comercial de 360 dias.' },
        { value: (C * a * d) / 3000, feedback: `Isso trata a taxa anual como mensal. Em dias: ${pct(a)} ÷ 360 por dia.` },
        { value: (C * a) / 100, feedback: `Esse é o rendimento de um ano inteiro. São ${d} dias: ${d}/360 de ano.` },
      ];
    }
    if (!isInt(J * 100)) continue;
    const ans = askM ? C + J : J;
    return draftNumeric({
      prompt: [p(`${lead(brl(C), d)}, com juros simples de ${rate}.`)],
      ask: askM ? 'Qual é o valor total a pagar?' : 'Qual é o valor dos juros?',
      prefix: 'R$',
      answer: round(ans, 2),
      wrong: [
        ...wrongs.map((w) => ({ value: round(askM ? C + w.value : w.value, 2), feedback: w.feedback })),
        askM ? { value: round(J, 2), feedback: `${brl(J)} são só os juros. O total inclui o valor de ${brl(C)}.` } : { value: round(C + J, 2), feedback: `${brl(C + J)} é o total a pagar. A pergunta pede só os juros.` },
      ],
      hints: ['Ponha a taxa e o prazo na mesma unidade antes de multiplicar.', `${how}.`],
      solution: [`$${how} = ${num(J, 2)}`, ...(askM ? [`$Total: ${num(C)} + ${num(J, 2)} = ${num(C + J, 2)}`] : [])],
    });
  }
}

/** Prazo em anos e meses com taxa anual. */
function yearMonthGen(r: Rand) {
  for (;;) {
    const C = r.pick([2400, 3600, 4800, 6000, 7200, 9600, 12000]);
    const a = r.pick([5, 6, 7.5, 8, 9, 10, 12]);
    const y = r.pick([1, 2, 3]);
    const m = r.pick([2, 3, 4, 6, 8, 9]);
    if (C === 9600 && a === 7.5 && y === 2 && m === 8) continue; // questão do banco
    const T = y + m / 12;
    const J = round((C * a * T) / 100, 6);
    if (!isInt(J * 100)) continue;
    const askM = r.next() < 0.5;
    const off = (x: number) => round((askM ? C : 0) + x, 2);
    return draftNumeric({
      prompt: [p(`Uma pessoa emprestou ${brl(C)} a um parente, a juros simples de ${pct(a)} ao ano, cobrados proporcionalmente ao tempo (inclusive frações de ano). A dívida foi quitada num único pagamento, ${y} ${y === 1 ? 'ano' : 'anos'} e ${m} meses depois.`)],
      ask: askM ? 'Qual foi o valor pago na quitação?' : 'Quanto foi pago de juros?',
      prefix: 'R$',
      answer: round(askM ? C + J : J, 2),
      wrong: [
        { value: off((C * a * (y + m / 10)) / 100), feedback: `Isso lê "${y} ${y === 1 ? 'ano' : 'anos'} e ${m} meses" como ${y},${m} ${y === 1 ? 'ano' : 'anos'}. ${m} meses são ${m}/12 de ano.` },
        { value: off((C * a * y) / 100), feedback: `Isso conta só os anos completos. Faltam os ${m} meses: ${m}/12 de ano.` },
        { value: off((C * a * (12 * y + m)) / 100), feedback: 'Isso usa o prazo em MESES com a taxa ANUAL. Ponha tudo na mesma unidade.' },
        askM ? { value: J, feedback: `${brl(J)} são só os juros. A quitação inclui o valor emprestado.` } : { value: round(C + J, 2), feedback: `${brl(C + J)} é o valor da quitação. A pergunta pede só os juros.` },
      ],
      hints: [`${y} ${y === 1 ? 'ano' : 'anos'} e ${m} meses = ${y} + ${m}/12 = ${num(T, 4)} anos (ou ${12 * y + m} meses).`, `J = ${num(C)} × ${num(a / 100, 4)} × ${num(T, 4)}.`],
      solution: [`$J = ${num(C)} × ${num(a / 100, 4)} × (${y} + ${m}/12) = ${num(J, 2)}`, ...(askM ? [`$Quitação: ${num(C)} + ${num(J, 2)} = ${num(C + J, 2)}`] : [])],
    });
  }
}

// ———————————————————————————————————————————————— geradores: atraso

const BILL = [
  { what: 'Um boleto de mensalidade', paid: 'foi pago' },
  { what: 'Uma conta de energia', paid: 'foi paga' },
  { what: 'Uma parcela de curso', paid: 'foi paga' },
  { what: 'O aluguel de uma sala', paid: 'foi pago' },
];
/** Reais com centavos, para as contas de multa e mora: 3,60. */
const cents = (x: number) => fixed(x, 2);

/** Multa e juros de mora sobre o valor original. */
function lateGen(r: Rand) {
  for (;;) {
    const V = r.pick([180, 240, 300, 360, 450, 600, 750, 900, 1200, 1500]);
    const multa = r.pick([2, 2, 5, 10]);
    const mora = r.pick([1, 1, 2]);
    const d = r.pick([6, 9, 10, 12, 15, 18, 20, 24, 30, 36, 45]);
    if ((V === 240 && d === 15 && multa === 2 && mora === 1) || (V === 600 && d === 45 && multa === 2 && mora === 1)) continue; // questões do banco
    const fM = (V * multa) / 100;
    const fJ = (V * mora * d) / 3000;
    if (!isInt(fJ * 100)) continue;
    const T = V + fM + fJ;
    const bill = r.pick(BILL);
    return draftNumeric({
      prompt: [p(`${bill.what}, de ${brl(V)}, ${bill.paid} com ${d} dias de atraso. Há multa de ${pct(multa)} e juros de mora de ${pct(mora)} ao mês, proporcionais aos dias (mês comercial de 30 dias), ambos sobre o valor original.`)],
      ask: 'Qual foi o valor total pago?',
      prefix: 'R$',
      answer: round(T, 2),
      wrong: [
        { value: round(V + fM, 2), feedback: `Faltaram os juros de mora: ${num(V)} × ${dec(mora)} × ${d}/30 = ${brl(fJ)}.` },
        { value: round(V + fM + (V * mora * d) / 100, 2), feedback: `Isso cobra ${pct(mora)} por DIA. A mora é mensal: ${d} dias = ${num(d / 30, 2)} mês.` },
        { value: round(V + fM + ((V + fM) * mora * d) / 3000, 2), feedback: 'Isso calcula a mora sobre o valor já com multa. As duas incidem sobre o valor original.' },
        { value: round(V + fJ, 2), feedback: `Faltou a multa: ${pct(multa)} de ${brl(V)} = ${brl(fM)}, cobrada uma vez.` },
      ],
      hints: [`Multa (uma vez): ${pct(multa)} de ${brl(V)} = ${brl(fM)}.`, `Mora: ${num(V)} × ${dec(mora)} × ${d}/30.`],
      solution: [`$Multa: ${cents(fM)}; mora: ${num(V)} × ${dec(mora)} × ${d}/30 = ${cents(fJ)}`, `$Total: ${num(V)} + ${cents(fM)} + ${cents(fJ)} = ${cents(T)}`],
    });
  }
}

/** Quantos dias de atraso, a partir do total pago. */
function lateDaysGen(r: Rand) {
  for (;;) {
    const V = r.pick([300, 450, 600, 750, 900, 1200, 1500, 1800]);
    const multa = r.pick([2, 2, 10]);
    const mora = r.pick([1, 1, 1.5, 2]);
    const d = r.pick([6, 8, 9, 10, 12, 15, 18, 20, 24, 27]);
    const fM = (V * multa) / 100;
    const fJ = (V * mora * d) / 3000;
    if (!isInt(fJ * 100)) continue;
    const T = round(V + fM + fJ, 2);
    if (V === 850 && T === 870.4) continue; // questão do banco
    return draftNumeric({
      prompt: [p(`Uma parcela de ${brl(V)} foi paga com atraso. O contrato cobra multa de ${pct(multa)} e juros de mora de ${pct(mora)} ao mês, ambos sobre o valor da parcela, com a mora proporcional aos dias (mês comercial de 30 dias). Ao todo, foram pagos ${brl(T)}.`)],
      ask: 'Com quantos dias de atraso a parcela foi paga?',
      unit: 'dias',
      answer: d,
      wrong: [
        { value: round((T - V) / ((V * mora) / 3000), 2), feedback: `Isso esquece a multa: tire primeiro os ${brl(fM)} da multa, que é fixa.` },
        { value: round(fJ / ((V * mora) / 100), 2), feedback: 'Esse é o atraso em MESES. Em dias, multiplique por 30.' },
      ],
      hints: [`Acréscimo: ${brl(T)} − ${brl(V)} = ${brl(T - V)}; a multa é ${brl(fM)}.`, `Mora de um dia: ${num(V)} × ${dec(mora)} ÷ 30 = R$ ${num((V * mora) / 3000, 4)}.`],
      solution: [`$Mora: ${cents(T - V)} − ${cents(fM)} = ${cents(fJ)}`, `$Dias: ${cents(fJ)} ÷ ${num((V * mora) / 3000, 4)} = ${d}`],
    });
  }
}

/** Pagar com atraso ou usar o cheque especial? */
function compareLateGen(r: Rand) {
  for (;;) {
    const V = r.pick([600, 900, 1200, 1500, 1800, 2400, 3000]);
    const d = r.pick([5, 6, 10, 12, 15, 20]);
    const k = r.pick([4.5, 6, 7.5, 8, 9, 12]);
    if (V === 1500 && d === 10 && k === 5.4) continue; // questão do banco
    const late = (V * 2) / 100 + (V * d) / 3000;
    const over = (V * k * d) / 3000;
    if (!isInt(late * 100) || !isInt(over * 100) || Math.abs(late - over) < 0.5) continue;
    const save = round(Math.abs(late - over), 2);
    return draftNumeric({
      prompt: [
        p(`Uma conta de ${brl(V)} vence hoje, mas o dinheiro para pagá-la só estará disponível daqui a ${d} dias. Há duas possibilidades:`),
        table(['Opção', 'Como funciona'], [
          ['Pagar com atraso', `Pagar daqui a ${d} dias, com multa de 2% e juros de mora de 1% ao mês, ambos sobre o valor da conta, a mora proporcional aos dias.`],
          ['Cheque especial', `Pagar hoje com o cheque especial, que cobra juros simples de ${pct(k)} ao mês, proporcionais aos dias, e cobrir o valor daqui a ${d} dias.`],
        ]),
        p('Considere o mês comercial de 30 dias e nenhuma outra tarifa.'),
      ],
      ask: 'Escolhendo a opção de menor custo, quanto se economiza em relação à outra?',
      prefix: 'R$',
      answer: save,
      wrong: [
        { value: round(late, 2), feedback: `${brl(late)} é o custo de pagar com atraso. A pergunta é a diferença entre os custos.` },
        { value: round(over, 2), feedback: `${brl(over)} é o custo do cheque especial. A pergunta é a diferença entre os custos.` },
        { value: round(Math.abs((V * 2) / 100 - over), 2), feedback: 'Isso esquece os juros de mora no pagamento com atraso.' },
      ],
      hints: [`Atraso: multa de ${brl((V * 2) / 100)} + mora de ${num(V)} × 0,01 × ${d}/30.`, `Cheque especial: ${num(V)} × ${dec(k)} × ${d}/30.`],
      solution: [`$Atraso: ${cents(late)}; cheque especial: ${cents(over)}`, `$Economia: ${cents(save)}`],
    });
  }
}

/** Juros sobre saldos negativos diferentes em cada período: some saldo × dias. */
function dailyBalanceGen(r: Rand) {
  for (;;) {
    const k = r.pick([3, 4.5, 6, 7.5, 9]);
    const n = r.pick([2, 3]);
    const rows = Array.from({ length: n }, () => ({ d: r.int(2, 10), b: r.pick([1000, 1500, 2000, 2500, 3000, 4000, 5000]) }));
    const sum = rows.reduce((s, x) => s + x.b * x.d, 0);
    const J = (sum * k) / 3000;
    if (!isInt(J * 100)) continue;
    let day = 1;
    const tableRows = rows.map((x) => {
      const from = day;
      day += x.d;
      return [`${from} a ${day - 1}`, `${x.d}`, brl(x.b)];
    });
    const totalDays = rows.reduce((s, x) => s + x.d, 0);
    const maxB = Math.max(...rows.map((x) => x.b));
    return draftNumeric({
      prompt: [
        p(`Uma loja tem uma conta garantida, que permite saldo negativo. O banco cobra juros simples de ${pct(k)} ao mês sobre o saldo negativo, proporcionais aos dias (mês comercial de 30 dias). Em um mês, o saldo ficou negativo assim:`),
        table(['Dias do mês', 'Número de dias', 'Saldo negativo'], tableRows),
        p('Nos demais dias, o saldo foi positivo.'),
      ],
      ask: 'Quanto a loja pagará de juros nesse mês?',
      prefix: 'R$',
      answer: round(J, 2),
      wrong: [
        { value: round((rows.reduce((s, x) => s + x.b, 0) * k) / 100, 2), feedback: 'Isso cobra um mês inteiro sobre cada saldo. Cada saldo pesa só pelos dias em que ficou negativo.' },
        { value: round((maxB * k * totalDays) / 3000, 2), feedback: 'Isso usa o maior saldo em todos os dias. Cada período tem o seu saldo.' },
        { value: round((rows.reduce((s, x) => s + x.b, 0) * k * totalDays) / 3000, 2), feedback: 'Isso multiplica a soma dos saldos pela soma dos dias. Multiplique cada saldo pelos SEUS dias antes de somar.' },
      ],
      hints: [`Taxa diária: ${pct(k)} ÷ 30 = ${pct(k / 30, 4)}.`, 'Some saldo × dias de cada período e aplique a taxa diária.'],
      solution: [`$Saldo × dias: ${rows.map((x) => `${num(x.b)} × ${x.d}`).join(' + ')} = ${num(sum)}`, `$Juros: ${num(sum)} × ${num(k / 100, 4)} ÷ 30 = ${num(J, 2)}`],
    });
  }
}

// ———————————————————————————————————————————————— geradores: por trechos

/** Taxas diferentes em trechos do prazo. */
function stepRateGen(r: Rand) {
  for (;;) {
    const C = r.pick([2000, 3000, 4000, 5000, 6000, 8000, 10000, 12000]);
    const i1 = r.pick([0.5, 0.6, 0.8, 1, 1.2, 1.5]);
    const i2 = r.pick([0.5, 0.6, 0.8, 1, 1.2, 1.5]);
    const t1 = r.pick([2, 3, 4, 6]);
    const t2 = r.pick([2, 3, 4, 5, 6]);
    if (i1 === i2 || (C === 3000 && i1 === 1 && t1 === 2 && i2 === 1.5 && t2 === 4)) continue; // questão do banco
    const J = (C * (i1 * t1 + i2 * t2)) / 100;
    if (!isInt(J * 100)) continue;
    const askM = r.next() < 0.5;
    const off = (x: number) => round((askM ? C : 0) + x, 2);
    return draftNumeric({
      prompt: [p(`${r.pick(WHO)} aplicou ${brl(C)} a juros simples. Nos ${t1} primeiros meses, a taxa foi de ${pct(i1)} ao mês; nos ${t2} meses seguintes, de ${pct(i2)} ao mês — sempre sobre o valor aplicado.`)],
      ask: askM ? `Qual foi o montante ao final dos ${t1 + t2} meses?` : 'Quanto a aplicação rendeu de juros no total?',
      prefix: 'R$',
      answer: off(J),
      wrong: [
        { value: off((C * (i1 + i2) * (t1 + t2)) / 100), feedback: 'Isso soma as duas taxas e aplica ao prazo todo. Cada taxa vale só no seu trecho.' },
        { value: off((C * i1 * (t1 + t2)) / 100), feedback: `Isso usa ${pct(i1)} no prazo todo. A partir do ${t1 + 1}º mês, a taxa é ${pct(i2)}.` },
        { value: off((C * i1 * t1) / 100), feedback: 'Isso conta só o primeiro trecho. Some os juros do segundo.' },
        askM ? { value: round(J, 2), feedback: `${brl(J)} são só os juros. O montante inclui o valor aplicado.` } : { value: round(C + J, 2), feedback: `${brl(C + J)} é o montante. A pergunta pede só os juros.` },
      ],
      hints: [`1º trecho: ${num(C)} × ${dec(i1)} × ${t1} = ${brl((C * i1 * t1) / 100)}.`, `2º trecho: ${num(C)} × ${dec(i2)} × ${t2}.`],
      solution: [`$J = ${num((C * i1 * t1) / 100, 2)} + ${num((C * i2 * t2) / 100, 2)} = ${num(J, 2)}`, ...(askM ? [`$M = ${num(C)} + ${num(J, 2)} = ${num(C + J, 2)}`] : [])],
    });
  }
}

const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

/** Depósitos em datas diferentes: cada um rende só a partir da sua data. */
function depositsGen(r: Rand) {
  for (;;) {
    const i = r.pick([0.5, 0.8, 1, 1.5, 2]);
    if (r.next() < 0.55) {
      const D = r.pick([200, 300, 400, 500, 600, 800, 1000]);
      const n = r.pick([3, 4, 5, 6, 7, 8]);
      const s = r.int(0, 11 - n);
      if (D === 500 && n === 6 && i === 1) continue; // questão do banco
      const months = (n * (n + 1)) / 2;
      const J = (D * i * months) / 100;
      if (!isInt(J * 100)) continue;
      const total = n * D + J;
      return draftNumeric({
        prompt: [p(`No dia 1º de cada mês, de ${MONTHS[s]} a ${MONTHS[s + n - 1]}, uma turma depositou ${brl(D)} numa aplicação de juros simples de ${pct(i)} ao mês, sem retiradas. Cada depósito rende juros só sobre o próprio valor, a partir do dia em que foi feito.`)],
        ask: `Qual será o saldo no dia 1º de ${MONTHS[s + n]}, antes de qualquer novo depósito?`,
        prefix: 'R$',
        answer: round(total, 2),
        wrong: [
          { value: n * D, feedback: `${brl(n * D)} é só o total depositado. Cada depósito também rendeu juros.` },
          { value: round(n * D * (1 + (i / 100) * n), 2), feedback: `Isso faz todos os depósitos renderem ${n} meses. Só o primeiro fica ${n} meses; o último, só 1.` },
          { value: round(n * D + (D * i * ((n * (n - 1)) / 2)) / 100, 2), feedback: `Isso tira um mês de cada depósito: o de ${MONTHS[s + n - 1]} também rende um mês até 1º de ${MONTHS[s + n]}.` },
        ],
        hints: [`O 1º depósito rende ${n} meses; o 2º, ${n - 1}; …; o último, 1 mês.`, `Ao todo: ${Array.from({ length: n }, (_, k) => n - k).join(' + ')} = ${months} "meses de depósito".`],
        solution: [`$Juros: ${num(D)} × ${dec(i)} × ${months} = ${num(J, 2)}`, `$Saldo: ${num(n * D)} + ${num(J, 2)} = ${num(total, 2)}`],
      });
    }
    const A = r.pick([1000, 1500, 2000, 3000, 4000]);
    const B = r.pick([500, 800, 1000, 1500, 2000]);
    const T = r.pick([4, 5, 6, 8, 10]);
    const k = r.int(1, T - 1);
    if (A === 1000 && B === 500 && k === 2 && T === 5 && i === 1) continue; // questão do banco
    const J = ((A * T + B * (T - k)) * i) / 100;
    if (!isInt(J * 100)) continue;
    return draftNumeric({
      prompt: [p(`${r.pick(WHO)} aplicou ${brl(A)} a juros simples de ${pct(i)} ao mês. Ao fim do ${k}º mês, depositou mais ${brl(B)} na mesma aplicação. Cada depósito rende desde a sua data até o fim do ${T}º mês.`)],
      ask: 'Quanto os dois depósitos renderam de juros no total?',
      prefix: 'R$',
      answer: round(J, 2),
      wrong: [
        { value: round(((A + B) * i * T) / 100, 2), feedback: `Isso faz o 2º depósito render ${T} meses. Ele só rende do fim do ${k}º mês em diante: ${qty(T - k, 'mês', 'meses')}.` },
        { value: round((A * i * T) / 100, 2), feedback: 'Isso esquece os juros do segundo depósito.' },
        { value: round(((A + B) * i * (T - k)) / 100, 2), feedback: `Isso faz o 1º depósito render só ${qty(T - k, 'mês', 'meses')}. Ele rende os ${T} meses.` },
      ],
      hints: [`1º depósito: ${T} meses; 2º depósito: ${T - k} meses.`, `J = ${num(A)} × ${dec(i)} × ${T} + ${num(B)} × ${dec(i)} × ${T - k}.`],
      solution: [`$J = ${num((A * i * T) / 100, 2)} + ${num((B * i * (T - k)) / 100, 2)} = ${num(J, 2)}`],
    });
  }
}

/** Pagamento parcial: quita os juros acumulados e abate o resto; depois, juros só sobre o novo saldo. */
function partialPayGen(r: Rand) {
  for (;;) {
    const D = r.pick([2000, 3000, 4000, 5000, 6000, 8000, 10000]);
    const i = r.pick([1, 1.5, 2, 2.5, 3]);
    const t1 = r.pick([2, 3, 4, 5]);
    const t2 = r.pick([2, 3, 4, 5, 6]);
    const S = D * r.pick([0.25, 0.4, 0.5, 0.6, 0.75]);
    const J1 = (D * i * t1) / 100;
    const P = J1 + (D - S);
    const F = S * (1 + (i * t2) / 100);
    if (!isInt(J1 * 100) || !isInt(F * 100) || !isInt(S)) continue;
    return draftNumeric({
      prompt: [p(`Uma costureira pegou ${brl(D)} emprestados a juros simples de ${pct(i)} ao mês. Após ${t1} meses, pagou ${brl(P)}. Pelo contrato, um pagamento parcial quita primeiro os juros acumulados, e o restante abate a dívida; daí em diante, os juros incidem só sobre o novo saldo. A dívida foi quitada ${t2} meses depois desse pagamento.`)],
      ask: 'Qual foi o valor do último pagamento?',
      prefix: 'R$',
      answer: round(F, 2),
      wrong: [
        { value: round(D * (1 + (i * (t1 + t2)) / 100) - P, 2), feedback: 'Isso cobra juros sobre a dívida original o tempo todo. Depois do pagamento parcial, os juros incidem só sobre o novo saldo.' },
        { value: round((D - P) * (1 + (i * t2) / 100), 2), feedback: `Isso abate o pagamento inteiro da dívida. Primeiro ele quita os juros acumulados (${brl(J1)}).` },
        { value: round(S, 2), feedback: `${brl(S)} é o saldo logo após o pagamento parcial. Ele ainda rende juros por ${t2} meses.` },
      ],
      hints: [`Juros dos ${t1} primeiros meses: ${num(D)} × ${dec(i)} × ${t1} = ${brl(J1)}.`, `Novo saldo: ${brl(D)} − (${brl(P)} − ${brl(J1)}) = ${brl(S)}.`],
      solution: [`$Saldo após o pagamento: ${num(D)} − (${num(P, 2)} − ${num(J1, 2)}) = ${num(S)}`, `$Quitação: ${num(S)} × (1 + ${dec(i)} × ${t2}) = ${num(F, 2)}`],
    });
  }
}

/** Devolver partes iguais do valor emprestado, com juros sobre o saldo do início de cada mês. */
function amortGen(r: Rand) {
  for (;;) {
    const D = r.pick([600, 900, 1200, 1500, 2400, 3000, 3600, 6000]);
    const n = r.pick([2, 3, 4, 5, 6]);
    const i = r.pick([1, 1.5, 2, 3]);
    if (!isInt(D / n) || (D === 900 && n === 3 && i === 1)) continue; // questão do banco
    const J = (i * D * (n + 1)) / 200;
    if (!isInt(J * 100)) continue;
    return draftNumeric({
      prompt: [p(`Um artesão pegou ${brl(D)} emprestados e vai devolver ${brl(D / n)} do valor emprestado ao fim de cada um dos próximos ${n} meses. Em cada vencimento, paga também juros de ${pct(i)} sobre o saldo devedor do início daquele mês, sem juros sobre juros.`)],
      ask: `Qual será o total de juros pago nos ${n} meses?`,
      prefix: 'R$',
      answer: round(J, 2),
      wrong: [
        { value: round((i * D * n) / 100, 2), feedback: 'Isso cobra juros sobre a dívida inteira em todos os meses. O saldo diminui a cada devolução.' },
        { value: round((i * D) / 100, 2), feedback: 'Isso são só os juros do 1º mês. Some os juros de cada mês, sobre o saldo daquele mês.' },
        { value: round((i * D * (n - 1)) / 200, 2), feedback: 'Isso esquece os juros do 1º mês, quando a dívida ainda estava inteira.' },
      ],
      hints: [`Saldos no início de cada mês: ${Array.from({ length: n }, (_, k) => brl(D - (k * D) / n)).join('; ')}.`, `Some ${pct(i)} de cada saldo.`],
      solution: [`$Soma dos saldos: ${num((D * (n + 1)) / 2)}`, `$Juros: ${dec(i)} × ${num((D * (n + 1)) / 2)} = ${num(J, 2)}`],
    });
  }
}

// ———————————————————————————————————————————————— aula

export const JUROS_SIMPLES = lesson({
  id: 'juros-simples',
  topic: 'financeira',
  subtopics: ['juros-simples'],
  title: 'Juros simples',
  summary:
    'O "aluguel" do dinheiro calculado sempre sobre o capital: J = C · i · t, o montante, as incógnitas, taxa e prazo na mesma unidade, multas e juros de mora e cálculos por trechos.',
  requires: ['porcentagem'],
  stages: [
    stage('conceito', 'descoberta', 'O aluguel do dinheiro', 'Entender capital, taxa, tempo, juros e montante e calcular juros simples com J = C · i · t.', () => ({
      learn: [
        text('Quem pega dinheiro emprestado paga um "aluguel" por ele: os **juros**. No regime de **juros simples**, os juros de cada período são sempre calculados sobre o **capital** inicial C. Com taxa i por período e t períodos: **J = C · i · t**. O **montante** é o que se paga (ou se resgata) no fim: **M = C + J**.'),
        lab({
          title: 'Capital, taxa e tempo',
          intro: 'Escolha o capital, a taxa mensal e o prazo. Em juros simples, cada mês rende o mesmo valor.',
          params: [
            { key: 'C', label: 'Capital', min: 500, max: 5000, step: 100, value: 2000, format: (v) => brl(v) },
            { key: 'i', label: 'Taxa ao mês', min: 0.5, max: 5, step: 0.5, value: 2, format: (v) => pct(v) },
            { key: 't', label: 'Prazo', min: 1, max: 24, step: 1, value: 6, format: (v) => meses(v) },
          ],
          readouts: ({ C, i, t }) => [
            { label: 'Juros de cada mês', value: brl((C * i) / 100) },
            { label: 'Juros totais (J = C · i · t)', value: brl((C * i * t) / 100), big: true, tone: 'brass' },
            { label: 'Montante (M = C + J)', value: brl(C + (C * i * t) / 100) },
          ],
          viz: ({ C, i, t }) => ({
            kind: 'chart',
            xLabel: 'Meses',
            yLabel: 'Montante (R$)',
            xMin: 0,
            xMax: 24,
            yMin: 0,
            series: [{ label: 'Montante', tone: 'brass', points: [[0, C], [24, C * (1 + (i * 24) / 100)]] }],
            markers: [{ x: t, y: C * (1 + (i * t) / 100), label: meses(t), tone: 'verdigris' }],
            summary: `Com ${brl(C)} a ${pct(i)} ao mês, o montante em ${meses(t)} é ${brl(C * (1 + (i * t) / 100))}`,
          }),
          goal: {
            task: 'Com capital de R$ 2.000,00, escolha uma taxa e um prazo que façam os juros totais chegarem a exatamente R$ 600,00.',
            done: ({ C, i, t }) => C === 2000 && Math.abs((C * i * t) / 100 - 600) < 1e-9,
            success: 'Isso: com C = 2.000, os juros dão R$ 600,00 sempre que i × t = 30% — por exemplo, 2% por 15 meses, 3% por 10 meses ou 5% por 6 meses.',
          },
          insight: 'O montante cresce em linha reta: a cada mês, soma-se a mesma quantia C · i.',
        }),
        key('Fórmulas', 'J = C · i · t, com a taxa na forma decimal e o tempo na mesma unidade da taxa. M = C + J = C · (1 + i · t).'),
        example('Empréstimo para a feira', 'Uma feirante pegou R$ 1.500,00 emprestados a juros simples de 2% ao mês, para pagar tudo de uma vez depois de 4 meses. Quanto pagará de juros? E no total?', [
          step('Juros de um mês:', '2% de 1.500 = R$ 30,00'),
          askStep('São 4 meses, sempre sobre o capital.', 'Quanto são os juros totais?', [
            ok('30 × 4 = R$ 120,00'),
            no('R$ 30,00', 'R$ 30,00 são os juros de UM mês. Em 4 meses: 4 × 30 = R$ 120,00.'),
          ]),
          step('Montante:', '1.500 + 120 = R$ 1.620,00'),
        ], 'Ela pagará R$ 120,00 de juros e R$ 1.620,00 no total.'),
        warn('Juros × montante', 'A pergunta pode pedir só os juros (J) ou o total a pagar (M = C + J). Leia com atenção: as duas respostas costumam estar entre as alternativas.'),
        check(numeric({
          prompt: [p('Uma pessoa aplicou R$ 3.000,00 a juros simples de 1,5% ao mês por 8 meses.')],
          ask: 'Quanto ela terá ao final (montante)?',
          prefix: 'R$',
          answer: 3360,
          wrong: [
            { value: 360, feedback: 'R$ 360,00 são só os juros. O montante é 3.000 + 360 = R$ 3.360,00.' },
            { value: 3045, feedback: 'R$ 3.045,00 conta só um mês de juros (R$ 45,00). Em 8 meses: 8 × 45 = R$ 360,00.' },
            { value: 3379.48, feedback: 'Esse valor usa juros compostos. Em juros simples, cada mês rende os mesmos R$ 45,00: 3.000 + 8 × 45 = R$ 3.360,00.' },
          ],
          solution: ['$J = 3.000 × 0,015 × 8 = 360', '$M = 3.000 + 360 = 3.360'],
        })),
      ],
      practice: [
        gen(simpleGen),
        fill({
          ask: 'Complete as fórmulas dos juros simples (C: capital; i: taxa; t: tempo).',
          parts: ['Juros: J = ', { options: ['C · i · t', 'C · (1 + i)ᵗ', 'C + i · t'], answer: 0 }, '. Montante: M = ', { options: ['C + J', 'C · J', 'J − C'], answer: 0 }, '.'],
          hints: ['Os juros de cada período são i vezes o capital.', 'O montante é o capital mais os juros.'],
          solution: ['J = C · i · t e M = C + J = C · (1 + i · t).'],
          why: 'Em juros simples, os juros são proporcionais ao capital, à taxa e ao tempo.',
        }),
        numeric({
          prompt: [p('Duas amigas pegaram R$ 1.500,00 cada uma, a juros simples de 3% ao mês. Uma quitou a dívida depois de 2 meses; a outra, depois de 5 meses.')],
          ask: 'Qual é a diferença entre os juros pagos pelas duas?',
          prefix: 'R$',
          answer: 135,
          wrong: [
            { value: 45, feedback: 'R$ 45,00 são os juros de um mês. A diferença é de 3 meses: 3 × 45.' },
            { value: 90, feedback: 'R$ 90,00 são os juros de quem pagou em 2 meses. Compare com os de 5 meses.' },
            { value: 225, feedback: 'R$ 225,00 são os juros de quem pagou em 5 meses. Falta subtrair os R$ 90,00 da outra.' },
          ],
          hints: ['Juros de um mês: 3% de 1.500 = R$ 45,00.', 'A diferença de prazo é de 3 meses.'],
          solution: ['$5 × 45 − 2 × 45 = 225 − 90 = 135'],
        }),
      ],
      challenge: [
        gen(simpleGen),
        numeric({
          prompt: [p('Uma loja deixou R$ 4.800,00 aplicados a juros simples de 1,25% ao mês por 10 meses, sem novos depósitos nem retiradas.')],
          ask: 'Qual foi o montante resgatado?',
          prefix: 'R$',
          answer: 5400,
          wrong: [
            { value: 600, feedback: 'R$ 600,00 são só os juros. O montante soma o capital: 4.800 + 600.' },
            { value: 4860, feedback: 'R$ 4.860,00 conta só um mês de juros (R$ 60,00). Em 10 meses: R$ 600,00.' },
          ],
          solution: ['$J = 4.800 × 0,0125 × 10 = 600', '$M = 4.800 + 600 = 5.400'],
        }),
      ],
      recap: [
        'J = C · i · t (taxa decimal, tempo na unidade da taxa).',
        'M = C + J = C · (1 + i · t).',
        'Em juros simples, todo período rende o mesmo valor.',
      ],
    })),

    stage('incognitas', 'fundamentos', 'Descobrir capital, taxa ou tempo', 'Isolar o capital, a taxa ou o tempo na fórmula dos juros simples, a partir dos juros ou do montante, inclusive lendo tabelas e gráficos.', () => ({
      learn: [
        text('A fórmula J = C · i · t tem quatro grandezas: conhecendo três, descobre-se a quarta. **Capital**: C = J ÷ (i · t). **Taxa**: i = J ÷ (C · t). **Tempo**: t = J ÷ (C · i). Se o dado é o **montante**, tire primeiro os juros: J = M − C — ou, para achar o capital, divida: C = M ÷ (1 + i · t).'),
        lab({
          title: 'Quando o capital dobra',
          intro: 'Escolha a taxa mensal e veja em quanto tempo os juros chegam à metade do capital e ao capital inteiro.',
          params: [{ key: 'i', label: 'Taxa ao mês', min: 0.5, max: 4, step: 0.25, value: 1, format: (v) => pct(v) }],
          readouts: ({ i }) => [
            { label: 'Juros = 50% do capital', value: meses(50 / i) },
            { label: 'Juros = capital (o montante dobra)', value: meses(100 / i), big: true, tone: 'brass' },
          ],
          viz: ({ i }) => ({
            kind: 'chart',
            xLabel: 'Meses',
            yLabel: 'Montante (% do capital)',
            xMin: 0,
            xMax: 100,
            yMin: 0,
            series: [{ label: 'Montante', tone: 'brass', points: [[0, 100], [100, 100 + 100 * i]] }],
            markers: [{ x: 100 / i, y: 200, label: 'dobrou', tone: 'verdigris' }],
            summary: `A ${pct(i)} ao mês, o capital dobra em ${meses(100 / i)}`,
          }),
          goal: {
            task: 'Ache a taxa mensal com a qual o montante dobra em exatamente 40 meses.',
            done: ({ i }) => i === 2.5,
            success: 'Isso: dobrar é ter juros iguais ao capital, i × 40 = 100%, então i = 2,5% ao mês.',
          },
          insight: 'Em juros simples, o tempo para atingir uma fração do capital é essa fração dividida pela taxa.',
        }),
        key('Isolar a incógnita', 'C = J ÷ (i · t); i = J ÷ (C · t); t = J ÷ (C · i). Para achar o capital a partir do montante: C = M ÷ (1 + i · t).'),
        example('Quanto aplicar hoje?', 'Uma escola quer ter R$ 6.540,00 daqui a 6 meses para comprar computadores. Quanto deve aplicar hoje, a juros simples de 1,5% ao mês?', [
          step('Fator do montante:', '1 + 0,015 × 6 = 1,09'),
          askStep('M = C × 1,09.', 'Qual é o capital?', [
            ok('6.540 ÷ 1,09 = R$ 6.000,00'),
            no('6.540 × 0,91 = R$ 5.951,40', 'Tirar 9% do montante não desfaz os juros: eles foram calculados sobre o capital, que é menor. Divida: 6.540 ÷ 1,09.'),
          ]),
        ], 'A escola deve aplicar R$ 6.000,00.'),
        check(numeric({
          prompt: [p('Um empréstimo de R$ 2.000,00 a juros simples foi quitado com R$ 2.240,00 depois de 4 meses.')],
          ask: 'Qual foi a taxa mensal?',
          unit: '%',
          answer: 3,
          wrong: [
            { value: 12, feedback: '12% é a taxa do período inteiro (240 ÷ 2.000). Por mês: 12% ÷ 4 = 3%.' },
            { value: 2.68, feedback: 'Isso divide os juros pelo montante. A taxa é sobre o capital: 240 ÷ 2.000 ÷ 4.' },
            { value: 0.03, feedback: '0,03 é a taxa na forma decimal. Em porcentagem: 3%.' },
          ],
          solution: ['$J = 2.240 − 2.000 = 240', '$i = 240 ÷ (2.000 × 4) = 0,03 = 3% ao mês'],
        })),
      ],
      practice: [gen(capitalGen), gen(rateGen), gen(timeGen), gen(presentValueGen)],
      challenge: [
        gen(capitalGen),
        gen(rateGen),
        gen(timeGen),
        gen(presentValueGen),
        numeric({
          prompt: [
            p('Uma aplicação de juros simples, com taxa mensal fixa, não teve depósitos nem retiradas depois do depósito inicial. O gráfico mostra o saldo em alguns meses.'),
            barChart(
              [
                { label: '2º mês', value: 5150 },
                { label: '4º mês', value: 5300 },
                { label: '6º mês', value: 5450 },
                { label: '8º mês', value: 5600 },
              ],
              'Saldo da aplicação',
              'R$',
            ),
          ],
          ask: 'Qual é a taxa mensal de juros simples dessa aplicação?',
          unit: '%',
          answer: 1.5,
          wrong: [
            { value: 3, feedback: '3% corresponde ao aumento entre duas barras, que estão a 2 meses uma da outra. Por mês: R$ 75,00 sobre o capital.' },
            { value: 1.46, feedback: 'Isso divide o rendimento mensal pelo saldo do 2º mês. A taxa é sobre o capital inicial: 5.150 − 2 × 75 = R$ 5.000,00.' },
          ],
          solution: ['$Rendimento por mês: (5.300 − 5.150) ÷ 2 = 75', '$Capital: 5.150 − 2 × 75 = 5.000', '$i = 75 ÷ 5.000 = 1,5% ao mês'],
        }),
      ],
      recap: [
        'C = J ÷ (i · t); i = J ÷ (C · t); t = J ÷ (C · i).',
        'Com o montante: J = M − C ou C = M ÷ (1 + i · t).',
        'Em gráficos e tabelas de juros simples, o saldo cresce sempre o mesmo valor por período.',
      ],
    })),

    stage('prazos', 'interpretacao', 'Taxa e prazo na mesma unidade', 'Converter taxas e prazos (ano, mês, dia; mês comercial de 30 dias e ano comercial de 360 dias) antes de aplicar a fórmula.', () => ({
      learn: [
        text('A taxa e o tempo precisam estar na **mesma unidade**. Em juros simples, a conversão é proporcional: 12% ao ano = 1% ao mês; 3% ao mês = 0,1% ao dia (no **mês comercial** de 30 dias). Um prazo de 45 dias é 1,5 mês; 2 anos e 3 meses são 27 meses, ou 2,25 anos.'),
        lab({
          title: 'Conversor de prazos',
          intro: 'Escolha uma taxa anual e um prazo em dias (ano comercial de 360 dias).',
          params: [
            { key: 'a', label: 'Taxa ao ano', min: 6, max: 36, step: 3, value: 12, format: (v) => pct(v) },
            { key: 'd', label: 'Prazo', min: 15, max: 360, step: 15, value: 90, format: (v) => `${v} dias` },
          ],
          readouts: ({ a, d }) => [
            { label: 'Taxa ao mês', value: pct(a / 12, 3) },
            { label: 'Taxa ao dia', value: pct(a / 360, 4) },
            { label: 'Prazo em meses', value: num(d / 30, 2) },
            { label: 'Juros sobre R$ 1.000,00', value: brl((1000 * a * d) / 36000), big: true, tone: 'brass' },
          ],
          viz: ({ d }) => ({
            kind: 'numberline',
            min: 0,
            max: 360,
            step: 30,
            points: [{ value: d, label: `${d} dias`, tone: 'brass' }],
            arrows: [{ from: 0, to: d, label: `${num(d / 30, 2)} meses`, tone: 'verdigris' }],
            summary: `${d} dias = ${num(d / 30, 2)} meses = ${num(d / 360, 4)} ano`,
          }),
          goal: {
            task: 'Com taxa de 24% ao ano, ache o prazo em que os juros sobre R$ 1.000,00 somam exatamente R$ 50,00.',
            done: ({ a, d }) => a === 24 && d === 75,
            success: 'Isso: 24% ao ano = 2% ao mês; 75 dias = 2,5 meses; 1.000 × 0,02 × 2,5 = R$ 50,00.',
          },
          insight: 'Em juros simples, converter é só dividir ou multiplicar: 1 ano = 12 meses = 360 dias comerciais.',
        }),
        key('Conversão em juros simples', 'Taxa: ano → mês, divida por 12; mês → dia, divida por 30. Prazo: dias → meses, divida por 30; dias → anos (ano comercial), divida por 360; meses → anos, divida por 12.'),
        example('Juros por dias', 'Uma conta de R$ 1.200,00 foi paga com 18 dias de atraso, com juros simples de 2% ao mês, proporcionais aos dias (mês comercial). Qual o valor dos juros?', [
          step('Prazo em meses:', '18 ÷ 30 = 0,6 mês'),
          askStep('Agora, a fórmula.', 'Quanto são os juros?', [
            ok('1.200 × 0,02 × 0,6 = R$ 14,40'),
            no('1.200 × 0,02 × 18 = R$ 432,00', 'A taxa é mensal e o prazo está em dias: converta antes. 18 dias = 0,6 mês.'),
          ]),
        ], 'Os juros são de R$ 14,40.'),
        example('Anos e meses', 'R$ 5.000,00 foram emprestados a 9% ao ano, a juros simples, por 1 ano e 4 meses. Quanto são os juros?', [
          askStep('1 ano e 4 meses, em anos:', 'Qual é o prazo?', [
            ok('1 + 4/12 = 4/3 de ano'),
            no('1,4 ano', '4 meses são 4/12 de ano, e não 0,4: 1 ano e 4 meses = 1 + 1/3 ≈ 1,333 ano.'),
          ]),
          step('Juros:', '5.000 × 0,09 × 4/3 = R$ 600,00'),
        ], 'Os juros são de R$ 600,00.'),
        check(numeric({
          prompt: [p('Uma aplicação de R$ 6.000,00 rende juros simples de 15% ao ano.')],
          ask: 'Quanto ela rende em 4 meses?',
          prefix: 'R$',
          answer: 300,
          wrong: [
            { value: 3600, feedback: 'Isso usa a taxa anual com o prazo em meses (6.000 × 0,15 × 4). Em anos, 4 meses são 4/12.' },
            { value: 900, feedback: 'R$ 900,00 é o rendimento de um ano inteiro. Em 4 meses: 900 × 4/12 = R$ 300,00.' },
            { value: 6300, feedback: 'R$ 6.300,00 é o montante. A pergunta é o rendimento (os juros).' },
          ],
          solution: ['$J = 6.000 × 0,15 × 4/12 = 300'],
        })),
      ],
      practice: [gen(annualGen), gen(daysGen), gen(yearMonthGen)],
      challenge: [
        gen(annualGen),
        gen(daysGen),
        gen(yearMonthGen),
        numeric({
          prompt: [p('Uma empresa pegou R$ 2.400,00 por 100 dias a juros simples de 15% ao ano, com ano comercial de 360 dias.')],
          ask: 'Quanto a empresa pagará de juros?',
          prefix: 'R$',
          answer: 100,
          wrong: [
            { value: 360, feedback: 'R$ 360,00 são os juros de um ano inteiro. Em 100 dias: 100/360 disso.' },
            { value: 98.63, feedback: 'Isso usa o ano de 365 dias. O contrato usa o ano comercial de 360 dias.' },
            { value: 1200, feedback: 'Isso trata a taxa anual como mensal (100 dias = 3,33 meses × 15%). Use 100/360 de ano.' },
          ],
          solution: ['$J = 2.400 × 0,15 × 100/360 = 100'],
        }),
      ],
      recap: [
        'Taxa e prazo sempre na mesma unidade.',
        'Mês comercial: 30 dias; ano comercial: 360 dias.',
        '"2 anos e 8 meses" = 2 + 8/12 anos, e não 2,8 anos.',
      ],
    })),

    stage('atraso', 'aplicacoes', 'Multa, mora e saldos diários', 'Calcular multas e juros de mora em pagamentos atrasados, compará-los com outras formas de crédito e somar juros diários sobre saldos que mudam.', () => ({
      learn: [
        text('Boletos e contratos costumam prever, em caso de atraso, uma **multa** fixa (por exemplo, 2% do valor, cobrada uma vez) e **juros de mora** (por exemplo, 1% ao mês, proporcionais aos dias). Os dois incidem sobre o **valor original**, e não um sobre o outro.'),
        lab({
          title: 'Boleto em atraso',
          intro: 'Escolha o valor do boleto, os dias de atraso, a multa e a mora mensal.',
          params: [
            { key: 'v', label: 'Valor do boleto', min: 100, max: 2000, step: 50, value: 500, format: (v) => brl(v) },
            { key: 'd', label: 'Dias de atraso', min: 0, max: 60, step: 1, value: 10, format: (v) => `${v} dias` },
            { key: 'm', label: 'Multa', min: 0, max: 10, step: 1, value: 2, format: (v) => pct(v) },
            { key: 'j', label: 'Mora ao mês', min: 0.5, max: 3, step: 0.5, value: 1, format: (v) => pct(v) },
          ],
          readouts: ({ v, d, m, j }) => {
            const multa = d > 0 ? (v * m) / 100 : 0;
            const mora = (v * j * d) / 3000;
            return [
              { label: 'Multa (uma vez)', value: brl(multa) },
              { label: 'Juros de mora', value: brl(mora) },
              { label: 'Total a pagar', value: brl(v + multa + mora), big: true, tone: 'brass' },
            ];
          },
          viz: ({ v, d, m, j }) => ({
            kind: 'parts',
            segments: [
              { label: 'Boleto', value: v, tone: 'parchment' },
              { label: 'Multa', value: d > 0 ? (v * m) / 100 : 0, tone: 'ember' },
              { label: 'Mora', value: (v * j * d) / 3000, tone: 'brass' },
            ],
            summary: `Boleto de ${brl(v)} com ${d} dias de atraso: total ${brl(v + (d > 0 ? (v * m) / 100 : 0) + (v * j * d) / 3000)}`,
          }),
          goal: {
            task: 'Com um boleto de R$ 800,00, multa de 2% e mora de 1,5% ao mês, ache o atraso em que o total chega a R$ 828,00.',
            done: ({ v, d, m, j }) => v === 800 && m === 2 && j === 1.5 && d === 30,
            success: 'Isso: multa de R$ 16,00 e mora de 800 × 0,015 × 30/30 = R$ 12,00. Total: R$ 828,00.',
          },
          insight: 'A multa pesa mais em atrasos curtos; a mora cresce dia a dia.',
        }),
        key('Multa e mora', 'Multa: percentual fixo, cobrado uma vez. Mora: taxa mensal × (dias ÷ 30). Ambas sobre o valor original: total = V × (1 + multa + mora × dias/30).'),
        example('Boleto com 20 dias de atraso', 'Um boleto de R$ 450,00 foi pago com 20 dias de atraso. Há multa de 2% e juros de mora de 1% ao mês, proporcionais aos dias, ambos sobre o valor do boleto. Qual o total pago?', [
          step('Multa:', '2% de 450 = R$ 9,00'),
          askStep('Mora: 1% ao mês por 20 dias.', 'Quanto é?', [
            ok('450 × 0,01 × 20/30 = R$ 3,00'),
            no('459 × 0,01 × 20/30 = R$ 3,06', 'A mora é calculada sobre o valor do boleto (R$ 450,00), e não sobre o valor com multa.'),
          ]),
          step('Total:', '450 + 9 + 3 = R$ 462,00'),
        ], 'O total pago é R$ 462,00.'),
        example('Juros dia a dia', 'Uma conta garantida cobra 3% ao mês sobre o saldo negativo, proporcionais aos dias. Em um mês, a conta ficou 10 dias com R$ 1.500,00 negativos e 5 dias com R$ 3.000,00 negativos. Quanto se paga de juros?', [
          step('Taxa diária:', '3% ÷ 30 = 0,1% ao dia'),
          askStep('Cada saldo pesa pelos seus dias.', 'Quanto dá a soma de saldo × dias?', [
            ok('1.500 × 10 + 3.000 × 5 = 30.000'),
            no('1.500 + 3.000 = 4.500', 'Cada saldo pesa pelo número de dias em que ficou negativo: multiplique saldo × dias antes de somar.'),
          ]),
          step('Juros:', '30.000 × 0,001 = R$ 30,00'),
        ], 'Os juros do mês são R$ 30,00.'),
        check(numeric({
          prompt: [p('Uma mensalidade de R$ 300,00 foi paga com 12 dias de atraso, com multa de 2% e juros de mora de 1% ao mês (proporcionais aos dias), ambos sobre a mensalidade.')],
          ask: 'Qual foi o total pago?',
          prefix: 'R$',
          answer: 307.2,
          wrong: [
            { value: 306, feedback: 'Faltaram os juros de mora: 300 × 0,01 × 12/30 = R$ 1,20.' },
            { value: 342, feedback: 'Isso cobra 1% por DIA. A taxa é mensal: 12 dias = 0,4 mês.' },
            { value: 309, feedback: 'Isso cobra um mês inteiro de mora. Foram só 12 dias: 0,4 mês.' },
          ],
          solution: ['$Multa: 6,00; mora: 300 × 0,01 × 0,4 = 1,20', '$Total: 300 + 6 + 1,20 = 307,20'],
        })),
      ],
      practice: [gen(lateGen), gen(lateDaysGen), gen(dailyBalanceGen)],
      challenge: [gen(lateGen), gen(lateDaysGen), gen(compareLateGen), gen(dailyBalanceGen)],
      recap: [
        'Multa: uma vez, sobre o valor original.',
        'Mora: taxa mensal × dias/30, sobre o valor original.',
        'Saldos que mudam: some saldo × dias e aplique a taxa diária.',
      ],
    })),

    stage('trechos', 'aprofundamento', 'Taxas que mudam, depósitos e pagamentos parciais', 'Calcular juros simples por trechos: taxas diferentes em cada período, carência, depósitos em datas diferentes, resgates e pagamentos parciais.', () => ({
      learn: [
        text('Quando algo muda no meio do caminho — a taxa, o capital aplicado, a data de um depósito —, divida o prazo em **trechos** e calcule os juros de cada um com o capital e a taxa daquele trecho. Em juros simples, os juros de cada trecho se **somam**.'),
        lab({
          title: 'Depósitos mensais',
          intro: 'Uma turma deposita o mesmo valor no dia 1º de cada mês, a juros simples. Cada depósito rende só a partir da sua data.',
          params: [
            { key: 'D', label: 'Depósito mensal', min: 100, max: 1000, step: 100, value: 200, format: (v) => brl(v) },
            { key: 'n', label: 'Número de depósitos', min: 1, max: 12, step: 1, value: 4, format: (v) => `${v}` },
            { key: 'i', label: 'Taxa ao mês', min: 0.5, max: 2, step: 0.5, value: 1, format: (v) => pct(v) },
          ],
          readouts: ({ D, n, i }) => [
            { label: 'Total depositado', value: brl(n * D) },
            { label: 'Juros (um mês após o último depósito)', value: brl((D * i * n * (n + 1)) / 200), big: true, tone: 'brass' },
            { label: 'Saldo', value: brl(n * D + (D * i * n * (n + 1)) / 200) },
          ],
          viz: ({ D, n, i }) => ({
            kind: 'bars',
            bars: Array.from({ length: n }, (_, k) => ({ label: `${k + 1}º`, value: (D * i * (n - k)) / 100, text: brl((D * i * (n - k)) / 100), tone: 'brass' as const })),
            summary: `${n} depósitos de ${brl(D)}: o 1º rende ${meses(n)}, o último rende 1 mês`,
          }),
          goal: {
            task: 'Com depósitos de R$ 400,00 a 1,5% ao mês, ache quantos depósitos fazem os juros somarem R$ 90,00 um mês após o último depósito.',
            done: ({ D, n, i }) => D === 400 && i === 1.5 && n === 5,
            success: 'Isso: os depósitos rendem 5 + 4 + 3 + 2 + 1 = 15 meses ao todo; 400 × 0,015 × 15 = R$ 90,00.',
          },
          insight: 'Cada depósito rende um mês a menos que o anterior: os juros formam uma escada.',
        }),
        key('Por trechos', 'Juros totais = soma, trecho a trecho, de (capital do trecho) × (taxa do trecho) × (duração do trecho). Num pagamento parcial, primeiro se quitam os juros acumulados; o restante abate a dívida.'),
        example('Taxa que muda', 'R$ 8.000,00 foram aplicados a juros simples: 0,5% ao mês nos 4 primeiros meses e 0,8% ao mês nos 6 seguintes, sempre sobre o valor aplicado. Qual o montante no fim dos 10 meses?', [
          step('1º trecho:', '8.000 × 0,005 × 4 = R$ 160,00'),
          step('2º trecho:', '8.000 × 0,008 × 6 = R$ 384,00'),
          askStep('Agora, junte os trechos.', 'Qual é o montante?', [
            ok('8.000 + 160 + 384 = R$ 8.544,00'),
            no('8.000 × (1 + 0,013 × 10) = R$ 9.040,00', 'Somar as duas taxas e aplicar ao prazo todo conta juros em dobro. Cada taxa vale só no seu trecho.'),
          ]),
        ], 'O montante é R$ 8.544,00.'),
        example('Pagamento parcial', 'Uma dívida de R$ 4.000,00 tem juros simples de 2% ao mês. Após 3 meses, paga-se R$ 2.240,00: esse pagamento quita primeiro os juros acumulados, e o resto abate a dívida. Depois, os juros incidem só sobre o novo saldo. Quanto se paga 5 meses depois para quitar tudo?', [
          step('Juros dos 3 meses:', '4.000 × 0,02 × 3 = R$ 240,00'),
          step('O pagamento quita os juros e abate o resto:', '2.240 − 240 = R$ 2.000,00 abatidos → saldo de R$ 2.000,00'),
          askStep('Mais 5 meses sobre o novo saldo.', 'Qual é o pagamento final?', [
            ok('2.000 × (1 + 0,02 × 5) = R$ 2.200,00'),
            no('4.000 × (1 + 0,02 × 8) − 2.240 = R$ 2.400,00', 'Depois do pagamento parcial, os juros incidem só sobre o novo saldo (R$ 2.000,00), e não sobre a dívida original.'),
          ]),
        ], 'O pagamento final é de R$ 2.200,00.'),
        check(numeric({
          prompt: [p('Num empréstimo de R$ 6.000,00, os 3 primeiros meses são de carência, sem juros. Depois, há 5 meses de juros simples de 1% ao mês sobre os R$ 6.000,00, e a dívida é quitada num pagamento único.')],
          ask: 'Qual é o valor da quitação, ao fim dos 8 meses?',
          prefix: 'R$',
          answer: 6300,
          wrong: [
            { value: 6480, feedback: 'Isso cobra juros nos 8 meses. Na carência não há juros: só 5 meses contam.' },
            { value: 300, feedback: 'R$ 300,00 são só os juros. A quitação inclui o valor emprestado: R$ 6.300,00.' },
            { value: 6180, feedback: 'Isso cobra juros só por 3 meses. A carência não tem juros; os 5 meses seguintes, sim.' },
          ],
          solution: ['$J = 6.000 × 0,01 × 5 = 300', '$Quitação: 6.000 + 300 = 6.300'],
        })),
      ],
      practice: [gen(stepRateGen), gen(depositsGen), gen(partialPayGen)],
      challenge: [gen(stepRateGen), gen(depositsGen), gen(partialPayGen), gen(amortGen)],
      recap: [
        'Algo mudou? Divida o prazo em trechos e some os juros de cada um.',
        'Cada depósito rende só a partir da sua data.',
        'Pagamento parcial: quita os juros acumulados e abate o resto; depois, juros sobre o novo saldo.',
      ],
    })),

    stage('maestria', 'maestria', 'Maestria: juros simples nos problemas difíceis', 'Resolver problemas inéditos que combinam a fórmula dos juros simples, conversões de prazo, multas e cálculos por trechos.', () => ({
      learn: [
        strategy('Quatro passos', '1) Identifique C, i e t e o que se pede (J, M, C, i ou t). 2) Ponha taxa e tempo na mesma unidade. 3) Se algo muda no caminho, divida em trechos. 4) Confira: os juros fazem sentido para o prazo?'),
        example('A taxa de uma tabela', [
          p('Uma loja vende a prazo, num pagamento único 4 meses depois da compra, com juros simples à mesma taxa para todos os produtos.'),
          table(['Produto', 'À vista', 'A prazo'], [['TV', 'R$ 2.500,00', 'R$ 2.700,00'], ['Cadeira', 'R$ 400,00', '?']]),
          p('Quanto sai a cadeira a prazo?'),
        ], [
          step('Juros da TV:', 'R$ 200,00 sobre R$ 2.500,00 = 8% em 4 meses (2% ao mês)'),
          askStep('A mesma taxa vale para a cadeira.', 'Qual é o preço a prazo?', [
            ok('400 × 1,08 = R$ 432,00'),
            no('400 + 200 = R$ 600,00', 'Os juros são proporcionais ao preço: 8% de R$ 400,00 = R$ 32,00, e não os R$ 200,00 da TV.'),
          ]),
        ], 'A cadeira sai por R$ 432,00 a prazo.'),
        reveal('Por que o gráfico é uma reta?', 'Em juros simples, o montante cresce sempre a mesma quantia por período (C · i). Por isso o gráfico do montante em função do tempo é uma reta, e saldos em datas igualmente espaçadas formam uma progressão aritmética.'),
        check(numeric({
          prompt: [p('Um capital foi aplicado a juros simples de 1,25% ao mês, sem depósitos nem retiradas.')],
          ask: 'Em quantos meses os juros acumulados igualam 30% do capital?',
          unit: 'meses',
          answer: 24,
          wrong: [
            { value: 37.5, feedback: 'Isso multiplica 30 por 1,25. Cada mês rende 1,25% do capital: t = 30 ÷ 1,25.' },
            { value: 80, feedback: 'Esse é o tempo para os juros igualarem o capital inteiro (100 ÷ 1,25). A meta é 30%.' },
          ],
          solution: ['$t = 30% ÷ 1,25% = 24 meses'],
        })),
      ],
      practice: [gen(capitalGen), gen(daysGen), gen(stepRateGen)],
      challenge: [
        gen(lateDaysGen),
        gen(partialPayGen),
        gen(presentValueGen),
        numeric({
          prompt: [p('Uma dívida de R$ 2.500,00 acumulou 4 meses de juros simples de 2% ao mês. Na negociação, o credor perdoou 40% dos juros acumulados e manteve todo o valor emprestado, sem multa.')],
          ask: 'Qual valor quita a dívida?',
          prefix: 'R$',
          answer: 2620,
          wrong: [
            { value: 2700, feedback: 'R$ 2.700,00 é a dívida sem o perdão. Foram perdoados 40% dos R$ 200,00 de juros.' },
            { value: 2580, feedback: 'Isso perdoa 60% dos juros. O perdão foi de 40%: restam 60% de R$ 200,00 = R$ 120,00.' },
            { value: 1620, feedback: 'Isso perdoa 40% da dívida inteira. O perdão vale só para os juros.' },
          ],
          solution: ['$Juros: 2.500 × 0,02 × 4 = 200', '$Com o perdão: 200 × 0,6 = 120', '$Quitação: 2.500 + 120 = 2.620'],
        }),
      ],
      recap: [
        'Identifique as grandezas e a incógnita.',
        'Taxa e tempo na mesma unidade.',
        'Mudou algo? Trechos.',
        'Confira se o resultado faz sentido.',
      ],
    })),
  ],
});
