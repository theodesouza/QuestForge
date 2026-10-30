/**
 * Aula: Juros compostos com movimentações — depósitos, retiradas e tarifas no meio do prazo
 * (período a período), sacar os juros × reinvestir, dívidas com pagamentos parciais, depósito
 * que falta para uma meta (valores na mesma data), tarifas e tributos sobre os juros, inflação
 * acumulada, ganho real, perdas e recuperações.
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
  text,
} from '../../kit/build';
import { brl, fixed, num, pct, round } from '../../kit/format';
import type { Rand } from '../../types';

const fac = (i: number) => num(1 + i / 100, 4);
const cents = (x: number) => Number.isInteger(round(x * 100, 6));
/** Reais nas contas: inteiro sem casas (2.550) e, se houver centavos, sempre duas (787,50). */
const rs = (x: number) => (Number.isInteger(round(x, 6)) ? num(x) : fixed(x, 2));
const SUP = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
const pow = (b: string, n: number) => `${b}${String(n).split('').map((d) => SUP[Number(d)]).join('')}`;

/** Saldo ao fim de cada período com o mesmo movimento logo após os juros (para em zero). */
function timeline(start: number, i: number, move: number, n: number): number[] {
  const out: number[] = [];
  let s = start;
  for (let k = 0; k < n; k++) {
    s = Math.max(s * (1 + i / 100) + move, 0);
    out.push(s);
  }
  return out;
}

// ———————————————————————————————————————————————— geradores: depósitos e retiradas

const KEEPERS = ['Uma ONG de proteção animal', 'Um clube de xadrez', 'Uma biblioteca comunitária', 'Uma banda de forró'];

/** Retirada no fim do 1º ano (ou em cada ano), logo após o rendimento. */
function withdrawGen(r: Rand) {
  for (;;) {
    const C = r.pick([1000, 1500, 2000, 2500, 3000, 4000, 5000]);
    const i = r.pick([5, 8, 10, 12, 20]);
    const each = r.next() < 0.45;
    const W = r.pick([100, 150, 200, 250, 300, 400, 500]);
    if ((!each && C === 2000 && i === 10 && W === 500) || (each && C === 1000 && i === 10 && W === 100)) continue; // questões do banco
    if (each && C === 2000 && i === 5 && W === 300) continue; // exercício da teoria
    const f = 1 + i / 100;
    const y1 = C * f - W;
    const fin = each ? y1 * f - W : y1 * f;
    if (!cents(fin) || fin <= 0) continue;
    return draftNumeric({
      prompt: [p(`${r.pick(KEEPERS)} mantém ${brl(C)} numa aplicação que rende ${pct(i)} ao ano, juros compostos. ${each ? `Ao fim de cada um dos 2 anos, logo após o rendimento, retira ${brl(W)} para despesas de manutenção.` : `Ao fim do 1º ano, logo após o rendimento, retira ${brl(W)} para uma despesa; o restante continua aplicado por mais um ano, à mesma taxa.`}`)],
      ask: each ? 'Qual é o saldo logo após a retirada do 2º ano?' : 'Qual é o saldo ao fim do 2º ano?',
      prefix: 'R$',
      answer: round(fin, 2),
      wrong: [
        { value: round(C * f * f - (each ? 2 * W : W), 2), feedback: `Isso tira ${each ? 'as retiradas' : 'a retirada'} só no fim, como se ${each ? 'a 1ª' : 'ela'} tivesse rendido junto. O que sai no fim do 1º ano deixa de render no 2º.` },
        { value: round((C - W) * f * f - (each ? W : 0), 2), feedback: 'Isso tira a 1ª retirada antes do 1º rendimento. Ela sai no fim do 1º ano, depois dos juros.' },
        { value: round(C * (1 + (2 * i) / 100) - (each ? 2 * W : W), 2), feedback: 'Isso usa juros simples. Em compostos, avance ano a ano: saldo × fator, depois a retirada.' },
        ...(each ? [{ value: round(y1 * f, 2), feedback: 'Esse é o saldo antes da 2ª retirada. Falta tirá-la.' }] : []),
      ],
      hints: [`Fim do 1º ano: ${num(C)} × ${fac(i)} − ${num(W)} = ${brl(y1)}.`, `Fim do 2º ano: ${brl(y1)} × ${fac(i)}${each ? ` − ${num(W)}` : ''}.`],
      solution: [`$1º ano: ${num(C)} × ${fac(i)} − ${num(W)} = ${rs(y1)}`, `$2º ano: ${rs(y1)} × ${fac(i)}${each ? ` − ${num(W)}` : ''} = ${rs(fin)}`],
    });
  }
}

const SAVERS = [
  { who: 'Um agricultor', from: 'vindos da venda da safra' },
  { who: 'Uma costureira', from: 'recebidos por uma encomenda grande' },
  { who: 'Um estudante', from: 'guardados do estágio' },
];

/** Aporte no fim do 1º ano, que rende no 2º. */
function depositGen(r: Rand) {
  for (;;) {
    const C = r.pick([1000, 2000, 2500, 3000, 4000, 5000]);
    const A = r.pick([300, 500, 800, 1000, 1500, 2000]);
    const i = r.pick([5, 8, 10, 12, 20]);
    if (C === 1000 && A === 500 && i === 10) continue; // questão do banco
    if (C === 3000 && A === 500 && i === 10) continue; // exemplo da teoria
    const f = 1 + i / 100;
    const fin = (C * f + A) * f;
    if (!cents(fin)) continue;
    const s = r.pick(SAVERS);
    return draftNumeric({
      prompt: [p(`${s.who} aplica ${brl(C)} numa conta que rende ${pct(i)} ao ano, juros compostos. Logo após o rendimento do 1º ano, aplica mais ${brl(A)}, ${s.from}. Todo o saldo rende por mais um ano, sem encargos.`)],
      ask: 'Quanto haverá na conta ao fim do 2º ano?',
      prefix: 'R$',
      answer: round(fin, 2),
      wrong: [
        { value: round(C * f * f + A, 2), feedback: `Isso não faz o aporte render. Ele entra no fim do 1º ano e rende ${pct(i)} no 2º.` },
        { value: round((C + A) * f * f, 2), feedback: 'Isso faz o aporte render os 2 anos. Ele só entra no fim do 1º ano.' },
        { value: round(C * f + A, 2), feedback: 'Esse é o saldo logo depois do aporte. Falta o rendimento do 2º ano.' },
      ],
      hints: [`Fim do 1º ano: ${num(C)} × ${fac(i)} + ${num(A)} = ${brl(C * f + A)}.`, `Fim do 2º ano: × ${fac(i)}.`],
      solution: [`$(${num(C)} × ${fac(i)} + ${num(A)}) × ${fac(i)} = ${rs(C * f + A)} × ${fac(i)} = ${rs(fin)}`],
    });
  }
}

/** Tarifa fixa cobrada logo depois de cada rendimento anual. */
function feeEachYearGen(r: Rand) {
  for (;;) {
    const C = r.pick([1000, 2000, 2500, 4000, 5000]);
    const i = r.pick([5, 8, 10, 12]);
    const F = r.pick([10, 15, 20, 25, 30, 40]);
    if (C === 1000 && i === 10 && F === 10) continue; // questão do banco
    const f = 1 + i / 100;
    const y1 = C * f - F;
    const fin = y1 * f - F;
    if (!cents(fin)) continue;
    return draftNumeric({
      prompt: [p(`A conta de investimentos de um grêmio estudantil recebe ${brl(C)} e rende ${pct(i)} ao ano, juros compostos. Ao fim de cada um dos 2 anos, logo após os juros, o banco cobra uma tarifa de manutenção de ${brl(F)}. Não há outras movimentações.`)],
      ask: 'Qual é o saldo logo após a segunda tarifa?',
      prefix: 'R$',
      answer: round(fin, 2),
      wrong: [
        { value: round(C * f * f - 2 * F, 2), feedback: `Isso tira as duas tarifas no fim. A 1ª sai no fim do 1º ano, e esses ${brl(F)} deixam de render ${pct(i)} no 2º.` },
        { value: round(C * f * f - F, 2), feedback: 'Isso cobra só uma tarifa. São duas, uma por ano.' },
        { value: round(y1 * f, 2), feedback: 'Esse é o saldo antes da 2ª tarifa. Falta descontá-la.' },
      ],
      hints: [`Fim do 1º ano: ${num(C)} × ${fac(i)} − ${num(F)} = ${brl(y1)}.`, `Fim do 2º ano: ${brl(y1)} × ${fac(i)} − ${num(F)}.`],
      solution: [`$${rs(y1)} × ${fac(i)} − ${num(F)} = ${rs(fin)}`],
    });
  }
}

/** Depósitos anuais iguais: hoje e no fim de cada ano, ou no início de cada um de 3 anos. */
function annualDepositsGen(r: Rand) {
  for (;;) {
    const D = r.pick([500, 1000, 1500, 2000, 2500, 3000]);
    const i = r.pick([5, 8, 10, 12, 20]);
    const f = 1 + i / 100;
    if (r.next() < 0.5) {
      if (D === 1000 && i === 10) continue; // questão do banco
      const bal = D * f * f + D * f + D;
      if (!cents(bal)) continue;
      return draftNumeric({
        prompt: [p(`Um casal abre uma poupança para a faculdade da filha: deposita ${brl(D)} hoje e mais ${brl(D)} ao fim de cada um dos próximos 2 anos. A aplicação rende ${pct(i)} ao ano, juros compostos, e cada depósito anual é feito logo após o rendimento daquele ano.`)],
        ask: 'Qual será o saldo logo após o depósito do fim do 2º ano?',
        prefix: 'R$',
        answer: round(bal, 2),
        wrong: [
          { value: 3 * D, feedback: `${brl(3 * D)} é só o total depositado. Os depósitos anteriores renderam juros.` },
          { value: round(3 * D * f * f, 2), feedback: 'Isso faz os três depósitos renderem 2 anos. O 2º rende 1 ano, e o 3º, nenhum.' },
          { value: round(D * f * f + D * f, 2), feedback: 'Isso esquece o depósito do fim do 2º ano.' },
        ],
        hints: [`O 1º depósito rende 2 anos (× ${num(f * f, 4)}); o 2º, 1 ano (× ${fac(i)}); o 3º, nenhum.`, 'Some os três valores.'],
        solution: [`$${num(D)} × ${num(f * f, 4)} + ${num(D)} × ${fac(i)} + ${num(D)} = ${rs(bal)}`],
      });
    }
    const P = r.pick([4000, 5000, 6000, 8000, 10000, 12000]);
    if (D === 2000 && i === 10 && P === 8000) continue; // questão do banco
    if (D === 1000 && i === 20) continue; // exercício da teoria
    const bal = D * (f ** 3 + f ** 2 + f);
    if (!cents(bal) || bal >= P || P - bal > P * 0.6) continue;
    const lack = round(P - bal, 2);
    return draftNumeric({
      prompt: [p(`Rafael, designer, quer comprar um computador de ${brl(P)}. Ele fará três depósitos de ${brl(D)} numa aplicação de ${pct(i)} ao ano, juros compostos: um no início do 1º ano, outro no início do 2º e o último no início do 3º. Não fará retiradas antes do fim do 3º ano, e o preço do computador não mudará.`)],
      ask: 'Ao fim do 3º ano, usando todo o saldo, quanto ainda faltará para a compra?',
      prefix: 'R$',
      answer: lack,
      wrong: [
        { value: round(P - 3 * D, 2), feedback: 'Isso ignora os juros. Cada depósito rende do início do seu ano até o fim do 3º.' },
        { value: round(P - D * (f * f + f + 1), 2), feedback: 'Isso trata os depósitos como feitos no FIM de cada ano. Feitos no início, cada um rende um ano a mais.' },
        { value: round(P - 3 * D * f ** 3, 2), feedback: 'Isso faz os três depósitos renderem 3 anos. O 2º rende 2, e o 3º, só 1.' },
      ].filter((w) => w.value > 0),
      hints: ['O 1º depósito rende 3 anos; o 2º, 2; o 3º, 1.', `Saldo: ${num(D)} × (${num(f ** 3, 4)} + ${num(f * f, 4)} + ${fac(i)}).`],
      solution: [`$Saldo: ${num(D)} × ${num(f ** 3 + f * f + f, 4)} = ${rs(bal)}`, `$Falta: ${num(P)} − ${rs(bal)} = ${rs(lack)}`],
    });
  }
}

/** Sacar os juros todo mês × deixar render: a diferença dos juros. */
function skimGen(r: Rand) {
  const C = r.pick([10000, 20000, 40000, 50000, 80000, 100000]);
  // O banco usa 0,9% ao mês; aqui as taxas são outras.
  const o = r.pick([
    { i: 1, n: 6, f: 1.0615 },
    { i: 2, n: 6, f: 1.1262 },
    { i: 0.8, n: 12, f: 1.1003 },
    { i: 1, n: 12, f: 1.1268 },
    { i: 0.5, n: 12, f: 1.0617 },
  ]);
  const comp = round(C * (o.f - 1), 2);
  const simple = round((C * o.i * o.n) / 100, 2);
  const diff = round(comp - simple, 2);
  return draftNumeric({
    prompt: [p(`Duas irmãs herdaram ${brl(C)} cada e aplicaram no mesmo investimento, que rende ${pct(o.i)} ao mês, juros compostos, por ${o.n} meses. Ao fim de cada mês, a mais velha saca exatamente os juros creditados, e o saldo dela fica sempre em ${brl(C)}. A mais nova não faz retiradas. Use: ${pow(fac(o.i), o.n)} ≈ ${num(o.f, 4)}.`)],
    ask: 'Ao fim do prazo, quanto os juros acumulados pela irmã mais nova superam o total sacado pela mais velha?',
    prefix: 'R$',
    answer: diff,
    wrong: [
      { value: 0, feedback: 'Não empatam: quem não saca ganha juros também sobre os juros dos meses anteriores.' },
      { value: simple, feedback: `${brl(simple)} é o total sacado pela mais velha (${o.n} × ${brl((C * o.i) / 100)}). A pergunta é a diferença.` },
      { value: comp, feedback: `${brl(comp)} são os juros acumulados pela mais nova. Subtraia o que a mais velha sacou.` },
      { value: round((C * o.i) / 100, 2), feedback: `${brl((C * o.i) / 100)} são os juros de um mês só. Compare os totais dos ${o.n} meses.` },
    ],
    hints: [`Mais velha: ${o.n} × ${pct(o.i)} de ${brl(C)} = ${brl(simple)}.`, `Mais nova: ${num(C)} × (${num(o.f, 4)} − 1) = ${brl(comp)}.`],
    solution: [`$${rs(comp)} − ${rs(simple)} = ${rs(diff)}`],
  });
}

// ———————————————————————————————————————————————— geradores: dívidas e metas

const BUYERS = [
  { who: 'Uma padaria', what: 'um forno industrial' },
  { who: 'Uma oficina', what: 'um elevador automotivo' },
  { who: 'Uma gráfica', what: 'uma impressora' },
];

/** Dívida a juros compostos com um ou dois pagamentos parciais antes da quitação. */
function partialDebtGen(r: Rand) {
  for (;;) {
    const D = r.pick([2000, 2500, 3000, 4000, 5000, 6000]);
    const i = r.pick([5, 8, 10, 12]);
    const two = r.next() < 0.5;
    const P = r.pick([500, 800, 1000, 1200, 1250, 1500, 2000]);
    if ((!two && D === 2500 && i === 10 && P === 1250) || (two && D === 3000 && i === 10 && P === 1000)) continue; // questões do banco
    if (!two && D === 4000 && i === 5 && P === 2000) continue; // exercício da teoria
    const f = 1 + i / 100;
    const s1 = D * f - P;
    const s2 = two ? s1 * f - P : s1;
    if (s1 <= 0 || s2 <= 0) continue;
    const last = s2 * f;
    if (!cents(last)) continue;
    const n = two ? 3 : 2;
    const unit = r.pick(['mês', 'trimestre', 'semestre']);
    const b = r.pick(BUYERS);
    return draftNumeric({
      prompt: [p(`${b.who} financiou ${b.what} de ${brl(D)}; o saldo devedor cresce ${pct(i)} por ${unit}, juros compostos. ${two ? `No fim do 1º e do 2º ${unit}, logo após os juros, paga ${brl(P)} em cada um; o restante é quitado no fim do 3º ${unit}.` : `No fim do 1º ${unit}, logo após os juros, paga ${brl(P)}; o restante cresce por mais um ${unit} e é quitado.`}`)],
      ask: 'Qual é o valor do último pagamento?',
      prefix: 'R$',
      answer: round(last, 2),
      wrong: [
        { value: round(D * f ** n - (two ? 2 : 1) * P, 2), feedback: `Isso desconta os pagamentos só no fim. Cada pagamento deixa de ser corrigido a partir da data em que é feito: avance ${unit} a ${unit}.` },
        { value: round(s2, 2), feedback: `${brl(s2)} é o saldo logo depois do último pagamento parcial. Ele ainda cresce ${pct(i)} até a quitação.` },
        { value: round((D - P) * f ** n - (two ? P * f : 0), 2), feedback: 'Isso abate o 1º pagamento antes dos juros do 1º período. Ele é pago depois dos juros.' },
      ].filter((w) => w.value > 0),
      hints: [`Fim do 1º ${unit}: ${num(D)} × ${fac(i)} − ${num(P)} = ${brl(s1)}.`, two ? `Fim do 2º: ${brl(s1)} × ${fac(i)} − ${num(P)} = ${brl(s2)}; depois, mais um ${unit} de juros.` : `Depois, mais um ${unit} de juros sobre ${brl(s1)}.`],
      solution: [`$${num(D)} × ${fac(i)} − ${num(P)} = ${rs(s1)}`, ...(two ? [`$${rs(s1)} × ${fac(i)} − ${num(P)} = ${rs(s2)}`] : []), `$Quitação: ${rs(s2)} × ${fac(i)} = ${rs(last)}`],
    });
  }
}

/** Segundo depósito, daqui a 1 ano, para chegar a uma meta em 2 anos. */
function missingDepositGen(r: Rand) {
  for (;;) {
    const A = r.pick([5000, 8000, 10000, 12000, 15000, 20000]);
    const X = r.pick([4000, 6000, 8000, 10000, 12000, 15000]);
    const i = r.pick([5, 6, 8, 10]);
    if (A === 12000 && i === 6) continue; // questão do banco
    const f = 1 + i / 100;
    const T = A * f * f + X * f;
    if (!cents(T)) continue;
    return draftNumeric({
      prompt: [p(`Um fotógrafo quer comprar, daqui a exatamente 2 anos, uma câmera que custará ${brl(T)} nessa data. Hoje, aplica ${brl(A)} num investimento que rende ${pct(i)} ao ano, juros compostos; daqui a exatamente 1 ano, fará um segundo depósito no mesmo investimento, sem retiradas antes da compra.`)],
      ask: 'Qual deve ser o segundo depósito para que o saldo, na data da compra, seja exatamente o preço da câmera?',
      prefix: 'R$',
      answer: X,
      wrong: [
        { value: round(T - A * f * f, 2), feedback: `Isso é o que falta na data da compra, mas o 2º depósito ainda rende ${pct(i)} por 1 ano: divida por ${fac(i)}.` },
        { value: round((T - A) / f, 2), feedback: `Isso esquece que o 1º depósito rende 2 anos: ele vale ${brl(A * f * f)} na data da compra.` },
        { value: round(T / (f * f) - A, 2), feedback: 'Isso traz a meta para hoje e subtrai o 1º depósito, como se o 2º também fosse feito hoje. Ele é feito daqui a 1 ano.' },
      ],
      hints: [`O 1º depósito, daqui a 2 anos: ${num(A)} × ${num(f * f, 4)} = ${brl(A * f * f)}.`, `O 2º depósito rende 1 ano: X × ${fac(i)} = ${rs(T)} − ${rs(A * f * f)}.`],
      solution: [`$X × ${fac(i)} = ${rs(T)} − ${rs(A * f * f)} = ${rs(X * f)}`, `$X = ${rs(X * f)} ÷ ${fac(i)} = ${num(X)}`],
    });
  }
}

/** Depósito de hoje que, com um aporte no fim do 1º ano, atinge a meta. */
function initialDepositGen(r: Rand) {
  for (;;) {
    const Y = r.pick([2000, 3000, 4000, 5000, 6000, 8000]);
    const B = r.pick([500, 1000, 1500, 2000]);
    const i = r.pick([5, 8, 10, 20]);
    const f = 1 + i / 100;
    const T = Y * f * f + B * f;
    if (!cents(T)) continue;
    return draftNumeric({
      prompt: [p(`Um time de futsal quer ter ${brl(T)} daqui a 2 anos para a viagem de um campeonato. Ao fim do 1º ano, logo após o rendimento, depositará na mesma aplicação um patrocínio de ${brl(B)}. A aplicação rende ${pct(i)} ao ano, juros compostos, sem tarifas.`)],
      ask: 'Quanto o time deve depositar hoje?',
      prefix: 'R$',
      answer: Y,
      wrong: [
        { value: round((T - B) / (f * f), 2), feedback: `Isso trata o patrocínio como se não rendesse. Ele rende ${pct(i)} no 2º ano: vale ${brl(B * f)} na data da meta.` },
        { value: round(T / (f * f) - B, 2), feedback: 'Isso subtrai o patrocínio do valor de hoje, como se ele fosse depositado hoje. Ele entra no fim do 1º ano.' },
        { value: round((T - B * f) / f, 2), feedback: 'Isso traz a meta só 1 ano para trás. O depósito de hoje rende 2 anos.' },
      ],
      hints: [`O patrocínio vale ${num(B)} × ${fac(i)} = ${brl(B * f)} na data da meta.`, `O depósito de hoje precisa chegar a ${rs(T)} − ${rs(B * f)} em 2 anos: divida por ${num(f * f, 4)}.`],
      solution: [`$Y × ${num(f * f, 4)} = ${rs(T)} − ${rs(B * f)} = ${rs(Y * f * f)}`, `$Y = ${num(Y)}`],
    });
  }
}

// ———————————————————————————————————————————————— geradores: tarifas e tributos

/** Tributo sobre o rendimento no resgate. */
function taxYieldGen(r: Rand) {
  for (;;) {
    const C = r.pick([1000, 2000, 2500, 4000, 5000, 8000]);
    const i = r.pick([5, 8, 10, 12, 20]);
    const t = r.pick([10, 15, 20, 22.5]);
    const J = C * ((1 + i / 100) ** 2 - 1);
    const net = J * (1 - t / 100);
    if (!cents(net) || !cents(J)) continue;
    return draftNumeric({
      prompt: [p(`Um professor aplicou ${brl(C)} num título que rende ${pct(i)} ao ano, juros compostos, por 2 anos. No resgate, paga imposto de ${pct(t)} somente sobre o rendimento, sem outras cobranças.`)],
      ask: 'Qual é o rendimento líquido que ele recebe?',
      prefix: 'R$',
      answer: round(net, 2),
      wrong: [
        { value: round(J, 2), feedback: `${brl(J)} é o rendimento bruto. Desconte o imposto de ${pct(t)} sobre ele.` },
        { value: round(J * (t / 100), 2), feedback: 'Esse é o valor do imposto, e não o rendimento líquido.' },
        { value: round(C * (1 + i / 100) ** 2 * (1 - t / 100) - C, 2), feedback: 'Isso cobra o imposto sobre o saldo inteiro. Ele incide só sobre o rendimento.' },
        { value: round(((C * 2 * i) / 100) * (1 - t / 100), 2), feedback: 'Isso usa juros simples. Em compostos, o rendimento é C × [(1 + i)² − 1].' },
      ].filter((w) => w.value > 0),
      hints: [`Rendimento bruto: ${num(C)} × (${num((1 + i / 100) ** 2, 4)} − 1) = ${brl(J)}.`, `Líquido: ${brl(J)} × ${num(1 - t / 100, 3)}.`],
      solution: [`$${rs(J)} × ${num(1 - t / 100, 3)} = ${rs(net)}`],
    });
  }
}

/** Multa sobre os juros acumulados no resgate antecipado. */
function penaltyGen(r: Rand) {
  for (;;) {
    const C = r.pick([1000, 2000, 2500, 4000, 5000]);
    const i = r.pick([5, 8, 10, 12]);
    const n = r.pick([2, 3]);
    const pen = r.pick([5, 10, 20, 25]);
    if (C === 1000 && i === 10 && n === 2 && pen === 5) continue; // questão do banco
    const M = C * (1 + i / 100) ** n;
    const J = M - C;
    const net = M - J * (pen / 100);
    if (!cents(net) || !cents(M)) continue;
    return draftNumeric({
      prompt: [p(`Uma enfermeira aplicou ${brl(C)} num título com vencimento em 5 anos, que rende ${pct(i)} ao ano, juros compostos. Ela precisou resgatar tudo ao fim de ${n} anos e, por isso, perdeu ${pct(pen)} somente dos juros acumulados até ali.`)],
      ask: 'Qual é o valor líquido total que ela resgatou?',
      prefix: 'R$',
      answer: round(net, 2),
      wrong: [
        { value: round(M, 2), feedback: 'Isso esquece a multa sobre os juros.' },
        { value: round(M * (1 - pen / 100), 2), feedback: 'Isso aplica a multa ao saldo inteiro. Ela incide só sobre os juros.' },
        { value: round(J * (1 - pen / 100), 2), feedback: 'Esses são só os juros líquidos. O resgate inclui o capital.' },
      ],
      hints: [`Saldo bruto: ${num(C)} × ${num((1 + i / 100) ** n, 4)} = ${brl(M)}; juros de ${brl(J)}.`, `Multa: ${pct(pen)} de ${brl(J)}.`],
      solution: [`$${rs(M)} − ${num(pen / 100, 2)} × ${rs(J)} = ${rs(net)}`],
    });
  }
}

/** Taxa percentual cobrada no meio do prazo. */
function midFeeGen(r: Rand) {
  for (;;) {
    const C = r.pick([1000, 2000, 2500, 4000, 5000]);
    const a = r.pick([5, 8, 10, 12, 20]);
    const fee = r.pick([2, 4, 5, 10]);
    if (C === 2000 && a === 10 && fee === 5) continue; // questão do banco
    const f = 1 + a / 100;
    const fin = C * f * (1 - fee / 100) * f;
    if (!cents(fin)) continue;
    return draftNumeric({
      prompt: [p(`O caixa de uma cooperativa de catadores começa o ano com ${brl(C)}. No 1º semestre, rende ${pct(a)}; logo depois, a administradora desconta ${pct(fee)} do saldo como taxa de administração. No 2º semestre, o saldo restante rende novamente ${pct(a)}, sem novas cobranças.`)],
      ask: 'Qual é o saldo ao fim do ano?',
      prefix: 'R$',
      answer: round(fin, 2),
      wrong: [
        { value: round(C * f * f, 2), feedback: `Isso esquece a taxa de ${pct(fee)}.` },
        { value: round(C * f * (1 - fee / 100), 2), feedback: 'Esse é o saldo depois da taxa. Falta o rendimento do 2º semestre.' },
        { value: round(C * (1 + (2 * a - fee) / 100), 2), feedback: 'Isso soma e subtrai as taxas. Cada uma incide sobre o saldo do momento: multiplique os fatores.' },
      ],
      hints: [`Fatores: × ${fac(a)}, × ${num(1 - fee / 100, 2)} e × ${fac(a)}.`, `${num(C)} × ${fac(a)} × ${num(1 - fee / 100, 2)} × ${fac(a)}.`],
      solution: [`$${num(C)} × ${fac(a)} × ${num(1 - fee / 100, 2)} × ${fac(a)} = ${rs(fin)}`],
    });
  }
}

/** Taxa fixa e imposto sobre os juros brutos no resgate. */
function feeAndTaxGen(r: Rand) {
  for (;;) {
    const C = r.pick([2000, 2500, 4000, 5000, 8000]);
    const i = r.pick([5, 8, 10, 12, 20]);
    const F = r.pick([30, 50, 80, 100, 120]);
    const t = r.pick([10, 15, 20]);
    if (C === 2500 && i === 20 && F === 100 && t === 10) continue; // questão do banco
    if (C === 4000 && i === 10 && F === 50 && t === 15) continue; // exemplo da teoria
    const M = C * (1 + i / 100) ** 2;
    const J = M - C;
    const net = M - F - J * (t / 100);
    if (!cents(net) || !cents(J)) continue;
    return draftNumeric({
      prompt: [p(`Uma artesã investe ${brl(C)} por 2 anos, a juros compostos de ${pct(i)} ao ano. No resgate, paga uma taxa fixa de custódia de ${brl(F)} e imposto de ${pct(t)} apenas sobre os juros brutos, calculados antes da taxa.`)],
      ask: 'Qual valor líquido ela recebe no resgate?',
      prefix: 'R$',
      answer: round(net, 2),
      wrong: [
        { value: round(M - F - (J - F) * (t / 100), 2), feedback: 'Isso calcula o imposto sobre os juros já sem a taxa. Ele incide sobre os juros brutos.' },
        { value: round(M * (1 - t / 100) - F, 2), feedback: 'Isso cobra o imposto sobre o saldo inteiro. Ele incide só sobre os juros.' },
        { value: round(M - J * (t / 100), 2), feedback: `Isso esquece a taxa de ${brl(F)}.` },
        { value: round(J - F - J * (t / 100), 2), feedback: 'Esse é o rendimento líquido. O resgate inclui o capital.' },
      ],
      hints: [`Saldo bruto: ${num(C)} × ${num((1 + i / 100) ** 2, 4)} = ${brl(M)}; juros de ${brl(J)}.`, `Desconte a taxa e ${pct(t)} de ${brl(J)}.`],
      solution: [`$${rs(M)} − ${num(F)} − ${num(t / 100, 2)} × ${rs(J)} = ${rs(net)}`],
    });
  }
}

/** Maior tarifa para o plano de taxa maior ainda empatar. */
function maxFundFeeGen(r: Rand) {
  for (;;) {
    const C = r.pick([2000, 4000, 5000, 8000, 10000]);
    const a = r.pick([6, 8, 10]);
    const b = a + r.pick([1, 2, 4]);
    const n = r.pick([2, 3]);
    if (C === 4000 && a === 10 && b === 12 && n === 2) continue; // questão do banco
    if (C === 5000 && a === 8 && b === 10 && n === 2) continue; // exercício da teoria
    const Fmax = C * ((1 + b / 100) ** n - (1 + a / 100) ** n);
    if (!cents(Fmax)) continue;
    return draftNumeric({
      prompt: [p(`Um banco oferece dois planos para aplicar ${brl(C)} por ${n} anos, ambos em juros compostos. O plano Básico rende ${pct(a)} ao ano, sem tarifa. O plano Plus rende ${pct(b)} ao ano, mas cobra uma tarifa única no resgate.`)],
      ask: 'Qual é a maior tarifa, em reais, para que o plano Plus ainda empate com o Básico?',
      prefix: 'R$',
      answer: round(Fmax, 2),
      wrong: [
        { value: round((C * (b - a) * n) / 100, 2), feedback: 'Isso compara as taxas em juros simples. Em compostos, a diferença dos montantes é maior: calcule os dois.' },
        { value: round((C * (b - a)) / 100, 2), feedback: `Essa é a diferença de um ano só, sobre o capital. São ${n} anos de juros compostos.` },
        { value: round(C * ((1 + b / 100) ** n - 1), 2), feedback: 'Esses são os juros do Plus. A tarifa máxima é o quanto o Plus rende a mais que o Básico.' },
      ],
      hints: [`Básico: ${num(C)} × ${num((1 + a / 100) ** n, 6)}.`, `Plus: ${num(C)} × ${num((1 + b / 100) ** n, 6)}.`],
      solution: [`$${rs(C * (1 + b / 100) ** n)} − ${rs(C * (1 + a / 100) ** n)} = ${rs(Fmax)}`],
    });
  }
}

/** Mesmo rendimento "somado", distribuições diferentes: tudo num ano × um pouco em cada ano. */
function unevenYieldGen(r: Rand) {
  for (;;) {
    const C = r.pick([2000, 4000, 5000, 10000, 20000]);
    const y = r.pick([3, 4, 6, 8, 10]);
    const H = C * (1 + (2 * y) / 100);
    const K = C * (1 + y / 100) ** 2;
    const diff = K - H;
    if (!cents(diff)) continue;
    return draftNumeric({
      prompt: [p(`Dois títulos recebem ${brl(C)} cada. O título Safra rende ${pct(2 * y)} no 1º ano e nada no 2º. O título Regular rende ${pct(y)} em cada um dos 2 anos, juros compostos, sem encargos.`)],
      ask: 'Quanto o saldo final do título Regular supera o do Safra?',
      prefix: 'R$',
      answer: round(diff, 2),
      wrong: [
        { value: 0, feedback: `Os dois não empatam: o Regular rende ${pct(y)} também sobre os juros do 1º ano.` },
        { value: round((C * y) / 100, 2), feedback: `Esses são os juros de um ano do Regular. A diferença é só o "juro sobre juro": ${pct(y)} de ${brl((C * y) / 100)}.` },
        { value: round(K - C, 2), feedback: 'Esses são os juros do Regular. Subtraia o saldo final do Safra, e não o capital.' },
      ],
      hints: [`Safra: ${num(C)} × ${fac(2 * y)} = ${brl(H)}.`, `Regular: ${num(C)} × ${pow(fac(y), 2)} = ${brl(K)}.`],
      solution: [`$${rs(K)} − ${rs(H)} = ${rs(diff)}`],
    });
  }
}

// ———————————————————————————————————————————————— geradores: inflação e ganho real

const list = (xs: string[]) => (xs.length === 1 ? xs[0] : `${xs.slice(0, -1).join(', ')} e ${xs[xs.length - 1]}`);

/** Valor corrigido por inflações de vários anos. */
function inflationAccGen(r: Rand) {
  for (;;) {
    const S = r.pick([1500, 2000, 2400, 2500, 3000, 4000]);
    const k = r.pick([2, 3]);
    const rates = Array.from({ length: k }, () => r.pick([3, 4, 5, 6, 8, 10]));
    if (S === 2000 && rates.join() === '10,6,5') continue; // questão do banco
    if (S === 1500 && rates.join() === '8,5') continue; // exemplo da teoria
    const f = rates.reduce((acc, x) => acc * (1 + x / 100), 1);
    const V = S * f;
    if (!cents(V)) continue;
    const sum = rates.reduce((acc, x) => acc + x, 0);
    return draftNumeric({
      prompt: [p(`Uma bolsa de pesquisa de ${brl(S)} é corrigida pela inflação ao fim de cada ano, para manter o poder de compra. Nos próximos ${k} anos, a inflação será de ${list(rates.map((x) => pct(x)))}, nessa ordem.`)],
      ask: `Qual será o valor da bolsa ao fim dos ${k} anos?`,
      prefix: 'R$',
      answer: round(V, 2),
      wrong: [
        { value: round(S * (1 + sum / 100), 2), feedback: `Somar as inflações (${pct(sum)}) esquece que cada uma incide sobre preços já reajustados. Multiplique os fatores.` },
        { value: round(V - S, 2), feedback: 'Esse é só o reajuste. A pergunta pede o novo valor da bolsa.' },
        { value: round(S / f, 2), feedback: 'Isso divide pelo fator da inflação. Para manter o poder de compra, o valor precisa crescer junto com os preços: multiplique.' },
      ],
      hints: [`Fatores: ${rates.map(fac).join('; ')}.`, `Novo valor: ${num(S)} × ${num(f, 6)}.`],
      solution: [`$${num(S)} × ${rates.map(fac).join(' × ')} = ${num(S)} × ${num(f, 6)} = ${rs(V)}`],
    });
  }
}

/** Ganho real: fator da aplicação ÷ fator da inflação. */
function realGainCompGen(r: Rand) {
  for (;;) {
    if (r.next() < 0.5) {
      const C = r.pick([5000, 10000, 20000, 25000]);
      const a = r.pick([3, 4, 5, 6, 8]);
      const b = r.pick([3, 4, 5, 6, 8]);
      const g = r.pick([5, 8, 10, 12, 15]);
      if (C === 10000 && a === 6 && b === 4 && g === 10) continue; // questão do banco
      const inf = (1 + a / 100) * (1 + b / 100);
      const M = C * inf * (1 + g / 100);
      if (!cents(M)) continue;
      const nominal = (M / C - 1) * 100;
      return draftNumeric({
        prompt: [p(`Uma associação aplicou ${brl(C)} do seu fundo de reserva e, 2 anos depois, resgatou ${brl(M)}, já descontados impostos e taxas. A inflação foi de ${pct(a)} no 1º ano e de ${pct(b)} no 2º. O ganho real mede quanto o poder de compra do dinheiro aumentou, descontada a inflação.`)],
        ask: 'Qual foi o ganho real da associação nesses 2 anos?',
        unit: '%',
        answer: g,
        wrong: [
          { value: round(nominal - (a + b), 2), feedback: 'Isso subtrai as taxas, o que só aproxima o ganho real. Divida os fatores: aplicação ÷ inflação.' },
          { value: round(nominal, 2), feedback: `${pct(nominal)} é o ganho nominal. Desconte a inflação acumulada (fator ${num(inf, 4)}).` },
          { value: round(nominal - (inf - 1) * 100, 2), feedback: 'Isso subtrai a inflação acumulada do ganho nominal. O ganho real vem da divisão dos fatores.' },
          { value: round((inf - 1) * 100, 2), feedback: 'Essa é a inflação acumulada, e não o ganho real.' },
        ],
        hints: [`Fator da aplicação: ${rs(M)} ÷ ${num(C)} = ${num(M / C, 6)}.`, `Fator da inflação: ${fac(a)} × ${fac(b)} = ${num(inf, 4)}.`],
        solution: [`$${num(M / C, 6)} ÷ ${num(inf, 6)} = ${fac(g)} → ganho real de ${pct(g)}`],
      });
    }
    const g = r.pick([10, 12, 21, 32, 44]);
    const pc = r.pick([5, 10, 20]);
    if (g === 21 && pc === 10) continue; // questão do banco
    const real = round(((1 + g / 100) / (1 + pc / 100) - 1) * 100, 2);
    if (real <= 0) continue;
    return draftNumeric({
      prompt: [p(`Em 2 anos, a poupança de uma escola para comprar tablets cresceu ${pct(g)} com juros compostos. No mesmo intervalo, o preço de cada tablet subiu ${pct(pc)}. O poder de compra é medido pelo número de tablets que a poupança consegue comprar.`)],
      ask: 'Qual foi o aumento percentual real do poder de compra? Arredonde a duas casas decimais, se preciso.',
      unit: '%',
      answer: real,
      tolerance: 0.01,
      wrong: [
        { value: g - pc, feedback: 'Subtrair as taxas só aproxima. O número de tablets cresce na razão dos fatores: (1 + poupança) ÷ (1 + preço).' },
        { value: round(((1 + g / 100) * (1 - pc / 100) - 1) * 100, 2), feedback: 'Isso aplica a alta do preço como um desconto na poupança. Divida pelo fator do preço.' },
        { value: g + pc, feedback: 'Somar as taxas inverte o efeito: a alta do preço diminui o poder de compra. Divida os fatores.' },
      ],
      hints: [`Fator da poupança: ${fac(g)}; fator do preço: ${fac(pc)}.`, `${fac(g)} ÷ ${fac(pc)}.`],
      solution: [`$${fac(g)} ÷ ${fac(pc)} ≈ ${num((1 + g / 100) / (1 + pc / 100), 4)} → ${pct(real)}`],
    });
  }
}

/** Subir e descer a mesma taxa, ou cair e recuperar. */
function lossRecoverGen(r: Rand) {
  if (r.next() < 0.5) {
    // O banco usa 20%; aqui as taxas são outras.
    const C = r.pick([2000, 4000, 5000, 8000, 10000]);
    const x = r.pick([10, 15, 25, 30, 40]);
    const loss = round((C * x * x) / 10000, 2);
    return draftNumeric({
      prompt: [p(`As ações de uma empresa subiram ${pct(x)} num ano e caíram ${pct(x)} no ano seguinte. Uma investidora tinha ${brl(C)} nessas ações no início e não comprou nem vendeu nada no período.`)],
      ask: 'Qual foi a perda, em reais, em relação ao valor inicial?',
      prefix: 'R$',
      answer: loss,
      wrong: [
        { value: 0, feedback: `A queda do 2º ano incide sobre um valor maior: ${fac(x)} × ${num(1 - x / 100, 2)} = ${num(1 - (x / 100) ** 2, 4)}.` },
        { value: round((C * x) / 100, 2), feedback: `${brl((C * x) / 100)} é o ganho do 1º ano. A perda final é a taxa ao quadrado: ${pct((x * x) / 100)} do valor inicial.` },
        { value: round(C * (1 + x / 100) * (x / 100), 2), feedback: 'Esse é o valor perdido no 2º ano, e não a perda em relação ao valor inicial.' },
      ],
      hints: [`Fator total: ${fac(x)} × ${num(1 - x / 100, 2)}.`, `Perda: ${num(C)} × (1 − ${num(1 - (x / 100) ** 2, 4)}).`],
      solution: [`$${num(C)} × ${num((x / 100) ** 2, 4)} = ${rs(loss)}`],
    });
  }
  // 20% é a questão do banco; 25%, o exercício da teoria.
  const x = r.pick([10, 15, 30, 40, 50]);
  const need = round((1 / (1 - x / 100) - 1) * 100, 2);
  return draftNumeric({
    prompt: [p(`O preço de uma ação caiu ${pct(x)} num ano. No ano seguinte, subiu exatamente o necessário para voltar ao preço anterior à queda.`)],
    ask: 'Qual foi a alta do 2º ano? Arredonde a duas casas decimais, se preciso.',
    unit: '%',
    answer: need,
    tolerance: 0.01,
    wrong: [
      { value: x, feedback: `Subir ${pct(x)} sobre o preço reduzido não basta: ${num(1 - x / 100, 2)} × ${fac(x)} = ${num(1 - (x / 100) ** 2, 4)}.` },
      { value: round((1 - 1 / (1 + x / 100)) * 100, 2), feedback: `Esse percentual desfaria uma ALTA de ${pct(x)}, e não uma queda.` },
      { value: 2 * x, feedback: `Não é preciso dobrar a taxa: basta multiplicar ${num(1 - x / 100, 2)} por 1 ÷ ${num(1 - x / 100, 2)}.` },
    ],
    hints: [`Depois da queda, o preço é ${num(1 - x / 100, 2)} do anterior.`, `Para voltar: × 1 ÷ ${num(1 - x / 100, 2)}.`],
    solution: [`$1 ÷ ${num(1 - x / 100, 2)} ≈ ${num(1 / (1 - x / 100), 4)} → ${pct(need)}`],
  });
}

/** Taxa do 2º semestre para fechar o ano numa meta. */
function secondRateGen(r: Rand) {
  for (;;) {
    const a = r.pick([2, 4, 5, 8, 10]);
    const b = r.pick([4, 5, 6, 8, 10, 12]);
    if (a === 5 && b === 10) continue; // questão do banco
    const T = round(((1 + a / 100) * (1 + b / 100) - 1) * 100, 4);
    return draftNumeric({
      prompt: [p(`Uma carteira de investimentos rendeu ${pct(a)} no 1º semestre. A gestora quer fechar o ano com rendimento total de exatamente ${pct(T, 4)}, sem aportes nem resgates. O rendimento do 2º semestre incide sobre o saldo já aumentado.`)],
      ask: 'Qual deve ser o rendimento do 2º semestre?',
      unit: '%',
      answer: b,
      wrong: [
        { value: round(T - a, 2), feedback: `Subtrair as taxas (${pct(T, 4)} − ${pct(a)}) esquece que o 2º semestre rende sobre o saldo já aumentado. Divida os fatores.` },
        { value: round(T / 2, 2), feedback: 'Dividir a meta ao meio não considera o que já foi ganho no 1º semestre.' },
        { value: a, feedback: `Repetir ${pct(a)} daria ${pct(((1 + a / 100) ** 2 - 1) * 100, 4)} no ano, diferente da meta.` },
      ],
      hints: [`Fator do ano: ${num(1 + T / 100, 6)}; fator do 1º semestre: ${fac(a)}.`, `Fator do 2º semestre: ${num(1 + T / 100, 6)} ÷ ${fac(a)}.`],
      solution: [`$${num(1 + T / 100, 6)} ÷ ${fac(a)} = ${fac(b)} → ${pct(b)}`],
    });
  }
}

// ———————————————————————————————————————————————— aula

export const JUROS_COMPOSTOS_FLUXOS = lesson({
  id: 'juros-compostos-fluxos',
  topic: 'financeira',
  subtopics: ['juros-compostos'],
  title: 'Juros compostos: depósitos, encargos e inflação',
  summary:
    'Juros compostos com movimentações: saldo período a período com depósitos, retiradas e tarifas, dívidas com pagamentos parciais, metas com valores na mesma data, tributos sobre os juros, inflação acumulada e ganho real.',
  requires: ['juros-compostos'],
  stages: [
    stage('movimentos', 'fundamentos', 'Depósitos e retiradas no caminho', 'Calcular o saldo de aplicações com depósitos, retiradas e tarifas no meio do prazo, período a período, e comparar sacar os juros com reinvesti-los.', () => ({
      learn: [
        text('Quando há **depósitos** ou **retiradas** no meio do caminho, não existe uma fórmula única: avance **período a período**. Em cada um, aplique o fator (1 + i) ao saldo e, em seguida, some o depósito ou subtraia a retirada. Cada valor rende só a partir da sua data.'),
        lab({
          title: 'Linha do tempo do saldo',
          intro: 'Um saldo inicial rende juros compostos todo ano; logo depois de cada rendimento, há um depósito (+) ou uma retirada (−) fixa.',
          params: [
            { key: 'C', label: 'Saldo inicial', min: 1000, max: 5000, step: 500, value: 2000, format: (v) => brl(v) },
            { key: 'i', label: 'Taxa ao ano', min: 5, max: 20, step: 5, value: 10, format: (v) => pct(v) },
            { key: 'm', label: 'Movimento anual', min: -1000, max: 1000, step: 100, value: 500, format: (v) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${brl(Math.abs(v))}` },
            { key: 'n', label: 'Anos', min: 1, max: 5, step: 1, value: 3, format: (v) => `${v}` },
          ],
          readouts: ({ C, i, m, n }) => {
            const t = timeline(C, i, m, n);
            const gone = t.indexOf(0);
            if (gone >= 0) {
              return [
                { label: 'Saldo final', value: `esgotado no ${gone + 1}º ano`, big: true, tone: 'ember' },
                { label: 'Retirada que não coube', value: `a do ${gone + 1}º ano` },
              ];
            }
            const s = t[n - 1];
            return [
              { label: 'Saldo final', value: brl(s), big: true, tone: 'brass' },
              { label: m >= 0 ? 'Total depositado' : 'Total retirado', value: brl(Math.abs(m) * n) },
              { label: 'Juros ganhos', value: brl(s - C - m * n) },
            ];
          },
          viz: ({ C, i, m, n }) => {
            const t = timeline(C, i, m, n);
            return {
              kind: 'bars',
              bars: t.map((v, k) => ({ label: `${k + 1}º ano`, value: v, text: brl(v), tone: 'brass' as const })),
              refLine: { value: C, label: 'saldo inicial' },
              summary: `Começa com ${brl(C)} e termina o ${n}º ano com ${brl(t[n - 1])}`,
            };
          },
          goal: {
            task: 'Com R$ 2.000,00 a 10% ao ano, ache a retirada anual que mantém o saldo sempre em R$ 2.000,00.',
            done: ({ C, i, m }) => C === 2000 && i === 10 && m === -200,
            success: 'Isso: retirar exatamente os juros (10% de 2.000 = R$ 200,00) deixa o capital intacto — mas também impede os juros sobre juros.',
          },
          insight: 'Cada depósito passa a render no ano seguinte; cada retirada deixa de render. Por isso a ordem e a data dos movimentos importam.',
        }),
        key('Período a período', 'Saldo novo = saldo anterior × (1 + i) ± movimento. Um depósito feito no início de um período rende nele; um feito no fim só rende a partir do período seguinte.'),
        example('Aporte no meio', 'Um ateliê deposita R$ 3.000,00 numa conta que rende 10% ao ano, juros compostos. Logo após o rendimento do 1º ano, deposita mais R$ 500,00. Quanto haverá ao fim do 2º ano?', [
          step('Fim do 1º ano:', '3.000 × 1,1 = R$ 3.300,00; com o aporte, R$ 3.800,00'),
          askStep('Agora, o 2º ano.', 'Qual é o saldo final?', [
            ok('3.800 × 1,1 = R$ 4.180,00'),
            no('3.000 × 1,21 + 500 = R$ 4.130,00', 'O aporte foi feito no fim do 1º ano: ele também rende 10% no 2º. 3.800 × 1,1 = R$ 4.180,00.'),
          ]),
        ], 'Ao fim do 2º ano, haverá R$ 4.180,00.'),
        example('Sacar os juros ou reinvestir?', 'Dois amigos aplicam R$ 10.000,00 cada a 2% ao mês, juros compostos, por 3 meses. Um saca os juros no fim de cada mês; o outro não saca nada. Quanto os juros acumulados pelo segundo superam os sacados pelo primeiro? Use 1,02³ = 1,061208.', [
          step('Quem saca:', '3 × R$ 200,00 = R$ 600,00'),
          askStep('Quem reinveste: 10.000 × 1,061208 = R$ 10.612,08.', 'Qual é a diferença?', [
            ok('612,08 − 600 = R$ 12,08'),
            no('R$ 0,00, porque a taxa é a mesma', 'Quem reinveste ganha juros sobre os juros: 1,02³ = 1,061208, e não 1,06.'),
          ]),
        ], 'A diferença é de R$ 12,08.'),
        check(numeric({
          prompt: [p('Uma república de estudantes guarda R$ 2.000,00 numa conta que rende 5% ao ano, juros compostos. Ao fim de cada um dos 2 anos, logo após o rendimento, retira R$ 300,00 para consertos na casa.')],
          ask: 'Qual é o saldo logo após a retirada do 2º ano?',
          prefix: 'R$',
          answer: 1590,
          wrong: [
            { value: 1605, feedback: 'Isso tira as duas retiradas só no fim. A 1ª sai no fim do 1º ano e deixa de render: 1.800 × 1,05 − 300.' },
            { value: 1600, feedback: 'Isso usa juros simples (2 × 5%). Em compostos, avance ano a ano: 2.100 − 300 = 1.800; 1.890 − 300.' },
            { value: 1890, feedback: 'R$ 1.890,00 é o saldo antes da 2ª retirada. Falta tirá-la.' },
          ],
          solution: ['$1º ano: 2.000 × 1,05 − 300 = 1.800', '$2º ano: 1.800 × 1,05 − 300 = 1.590'],
        })),
      ],
      practice: [gen(withdrawGen), gen(depositGen), gen(feeEachYearGen), gen(annualDepositsGen)],
      challenge: [
        gen(withdrawGen),
        gen(annualDepositsGen),
        gen(skimGen),
        numeric({
          prompt: [p('Um taxista aplicou R$ 20.000,00 a 10% ao ano, juros compostos. Ao fim do 2º ano, retirou R$ 5.000,00 para trocar o motor do carro e deixou o restante aplicado, nas mesmas condições, sem outros movimentos. Use: 1,1² = 1,21.')],
          ask: 'Qual será o saldo ao fim do 4º ano, contado a partir da aplicação?',
          prefix: 'R$',
          answer: 23232,
          wrong: [
            { value: 24282, feedback: 'Isso tira os R$ 5.000,00 só no fim do 4º ano. Eles saíram no fim do 2º e deixaram de render: (24.200 − 5.000) × 1,21.' },
            { value: 22800, feedback: 'Isso usa juros simples em cada trecho (20% em 2 anos). Em compostos, 2 anos rendem 21%: 20.000 × 1,21 = 24.200; (24.200 − 5.000) × 1,21.' },
            { value: 19200, feedback: 'R$ 19.200,00 é o saldo logo depois da retirada. Ele ainda rende 2 anos: × 1,21.' },
          ],
          solution: ['$Fim do 2º ano: 20.000 × 1,21 = 24.200', '$Depois da retirada: 19.200', '$Fim do 4º ano: 19.200 × 1,21 = 23.232'],
        }),
      ],
      recap: [
        'Avance período a período: × (1 + i), depois o movimento.',
        'Depósito no fim do período: começa a render no seguinte.',
        'Sacar os juros mantém o capital, mas perde os juros sobre juros.',
      ],
    })),

    stage('dividas', 'interpretacao', 'Pagamentos parciais e metas', 'Acompanhar dívidas com pagamentos parciais a juros compostos e descobrir o depósito necessário para atingir uma meta, levando os valores para a mesma data.', () => ({
      learn: [
        text('Numa dívida com pagamentos parciais, faça o mesmo: a cada período, o saldo devedor cresce pelo fator (1 + i) e, depois, diminui pelo pagamento. Para descobrir quanto depositar para chegar a uma meta, leve todos os valores para a **mesma data** — por exemplo, a data da meta — e iguale.'),
        lab({
          title: 'Saldo devedor',
          intro: 'Uma dívida cresce a juros compostos; no fim de cada período, depois dos juros, faz-se o mesmo pagamento.',
          params: [
            { key: 'D', label: 'Dívida', min: 2000, max: 6000, step: 500, value: 3000, format: (v) => brl(v) },
            { key: 'i', label: 'Taxa por período', min: 5, max: 15, step: 5, value: 10, format: (v) => pct(v) },
            { key: 'P', label: 'Pagamento por período', min: 0, max: 2000, step: 100, value: 1000, format: (v) => brl(v) },
          ],
          readouts: ({ D, i, P }) =>
            timeline(D, i, -P, 3).map((v, k) => ({
              label: `Saldo após o ${k + 1}º pagamento`,
              value: v === 0 ? 'quitada' : brl(v),
              ...(k === 1 ? { big: true, tone: 'brass' as const } : {}),
            })),
          viz: ({ D, i, P }) => {
            const s = timeline(D, i, -P, 3);
            return {
              kind: 'bars',
              bars: s.map((v, k) => ({ label: `${k + 1}º`, value: v, text: v === 0 ? 'quitada' : brl(v), tone: v > D ? ('ember' as const) : ('verdigris' as const) })),
              refLine: { value: D, label: 'dívida inicial' },
              summary: s[2] === 0 ? `Com pagamentos de ${brl(P)}, a dívida é quitada em até 3 períodos` : `Com pagamentos de ${brl(P)}, o saldo após o 3º período é ${brl(s[2])}`,
            };
          },
          goal: {
            task: 'Com uma dívida de R$ 5.000,00 a 10% por período, ache o pagamento que deixa saldo de exatamente R$ 2.900,00 depois do 2º pagamento.',
            done: ({ D, i, P }) => D === 5000 && i === 10 && P === 1500,
            success: 'Isso: 5.000 × 1,1 − 1.500 = 4.000; 4.000 × 1,1 − 1.500 = R$ 2.900,00.',
          },
          insight: 'Se o pagamento for menor que os juros do período, a dívida cresce mesmo pagando.',
        }),
        key('Mesma data', 'Para comparar ou igualar valores em datas diferentes, leve todos para uma mesma data: multiplique por (1 + i)ᵏ para avançar k períodos e divida para recuar.'),
        example('Quitação em três etapas', 'Um empréstimo de R$ 2.000,00 para reformar uma loja cresce 10% ao mês, juros compostos. No fim do 1º e do 2º mês, logo após os juros, a dona paga R$ 700,00. Quanto paga no fim do 3º mês para quitar?', [
          step('Fim do 1º mês:', '2.000 × 1,1 − 700 = R$ 1.500,00'),
          step('Fim do 2º:', '1.500 × 1,1 − 700 = R$ 950,00'),
          askStep('Fim do 3º.', 'Qual é o último pagamento?', [
            ok('950 × 1,1 = R$ 1.045,00'),
            no('2.000 × 1,1³ − 1.400 = R$ 1.262,00', 'Os pagamentos deixam de ser corrigidos a partir da data em que são feitos: avance mês a mês ou leve cada pagamento até o fim com o seu fator.'),
          ]),
        ], 'O último pagamento é de R$ 1.045,00.'),
        example('O depósito que falta', 'Uma família quer ter R$ 5.000,00 daqui a 2 anos. Hoje deposita R$ 2.000,00 e, daqui a 1 ano, fará outro depósito, numa aplicação de 10% ao ano, juros compostos. Qual deve ser o segundo depósito?', [
          step('O 1º depósito, na data da meta:', '2.000 × 1,21 = R$ 2.420,00'),
          step('Falta, na data da meta:', '5.000 − 2.420 = R$ 2.580,00'),
          askStep('O 2º depósito rende só 1 ano.', 'Quanto deve ser?', [
            ok('2.580 ÷ 1,1 ≈ R$ 2.345,45'),
            no('R$ 2.580,00', 'O 2º depósito ainda rende 10% por 1 ano: basta 2.580 ÷ 1,1.'),
          ]),
        ], 'O segundo depósito deve ser de cerca de R$ 2.345,45.'),
        check(numeric({
          prompt: [p('Uma loja de bicicletas comprou estoque a prazo: a dívida de R$ 4.000,00 cresce 5% ao mês, juros compostos. No fim do 1º mês, logo após os juros, a loja paga R$ 2.000,00; o restante cresce por mais um mês e é quitado.')],
          ask: 'Qual é o valor do último pagamento?',
          prefix: 'R$',
          answer: 2310,
          wrong: [
            { value: 2200, feedback: 'R$ 2.200,00 é o saldo logo depois do 1º pagamento. Ele ainda cresce 5% por mais um mês.' },
            { value: 2410, feedback: 'Isso desconta o pagamento só no fim (4.000 × 1,05² − 2.000). Ele deixa de ser corrigido a partir do 1º mês.' },
            { value: 2205, feedback: 'Isso abate o pagamento antes dos juros do 1º mês: (4.000 − 2.000) × 1,05². Ele é pago depois dos juros.' },
          ],
          solution: ['$4.000 × 1,05 − 2.000 = 2.200', '$2.200 × 1,05 = 2.310'],
        })),
      ],
      practice: [gen(partialDebtGen), gen(missingDepositGen), gen(initialDepositGen)],
      challenge: [gen(partialDebtGen), gen(missingDepositGen), gen(initialDepositGen)],
      recap: [
        'Dívida: × (1 + i), depois o pagamento, período a período.',
        'Valores em datas diferentes: leve todos para a mesma data.',
        'Avançar k períodos: × (1 + i)ᵏ; recuar: ÷ (1 + i)ᵏ.',
      ],
    })),

    stage('encargos', 'aplicacoes', 'Tarifas e tributos', 'Calcular o resgate líquido de aplicações com tarifas fixas, tributos ou multas sobre os juros e comparar aplicações com taxas e custos diferentes.', () => ({
      learn: [
        text('Tributos e multas costumam incidir **só sobre os juros** (o rendimento), e não sobre o capital. Tarifas fixas saem do saldo. A ordem importa: uma tarifa cobrada no meio do prazo deixa de render nos períodos seguintes.'),
        lab({
          title: 'Rendimento líquido',
          intro: 'Escolha o capital, a taxa anual, o prazo e a alíquota do tributo sobre os juros.',
          params: [
            { key: 'C', label: 'Capital', min: 1000, max: 10000, step: 1000, value: 5000, format: (v) => brl(v) },
            { key: 'i', label: 'Taxa ao ano', min: 5, max: 20, step: 5, value: 10, format: (v) => pct(v) },
            { key: 'n', label: 'Anos', min: 1, max: 5, step: 1, value: 2, format: (v) => `${v}` },
            { key: 't', label: 'Tributo sobre os juros', min: 0, max: 30, step: 5, value: 20, format: (v) => pct(v) },
          ],
          readouts: ({ C, i, n, t }) => {
            const J = C * ((1 + i / 100) ** n - 1);
            return [
              { label: 'Juros brutos', value: brl(J) },
              { label: 'Tributo', value: brl((J * t) / 100) },
              { label: 'Rendimento líquido', value: brl(J * (1 - t / 100)), big: true, tone: 'brass' },
              { label: 'Resgate', value: brl(C + J * (1 - t / 100)) },
            ];
          },
          viz: ({ C, i, n, t }) => {
            const J = C * ((1 + i / 100) ** n - 1);
            return {
              kind: 'parts',
              segments: [
                { label: 'Capital', value: C, tone: 'parchment' },
                { label: 'Juros líquidos', value: J * (1 - t / 100), tone: 'verdigris' },
                { label: 'Tributo', value: (J * t) / 100, tone: 'ember' },
              ],
              summary: `Juros de ${brl(J)}, tributo de ${brl((J * t) / 100)}`,
            };
          },
          goal: {
            task: 'Com R$ 8.000,00 a 10% ao ano por 3 anos, ache a alíquota que deixa rendimento líquido de exatamente R$ 2.118,40.',
            done: ({ C, i, n, t }) => C === 8000 && i === 10 && n === 3 && t === 20,
            success: 'Isso: os juros brutos são 8.000 × 0,331 = R$ 2.648,00; com 20% de tributo, sobram R$ 2.118,40.',
          },
          insight: 'O tributo nunca toca o capital: quem resgata recebe o capital mais os juros líquidos.',
        }),
        key('Sobre o quê?', 'Tributo ou multa "sobre os juros": líquido = juros × (1 − alíquota). Tarifa fixa: sai do saldo, uma vez. Taxa percentual no meio do prazo: multiplique pelo fator (1 − taxa) naquele momento.'),
        example('Tributo e tarifa no resgate', 'Uma veterinária aplica R$ 4.000,00 a 10% ao ano por 2 anos, juros compostos. No resgate, paga uma tarifa fixa de R$ 50,00 e um tributo de 15% sobre os juros brutos. Qual é o valor líquido resgatado?', [
          step('Montante:', '4.000 × 1,21 = R$ 4.840,00; juros brutos de R$ 840,00'),
          step('Tributo:', '15% de 840 = R$ 126,00'),
          askStep('Agora, o resgate.', 'Qual é o valor líquido?', [
            ok('4.840 − 126 − 50 = R$ 4.664,00'),
            no('4.840 × 0,85 − 50 = R$ 4.064,00', 'O tributo incide só sobre os juros (R$ 840,00), e não sobre o saldo inteiro.'),
          ]),
        ], 'O valor líquido resgatado é R$ 4.664,00.'),
        check(numeric({
          prompt: [p('Uma corretora oferece dois fundos para R$ 5.000,00 por 2 anos, ambos em juros compostos: o fundo A rende 8% ao ano, sem tarifa; o fundo B rende 10% ao ano e cobra uma tarifa única no resgate.')],
          ask: 'Qual é a maior tarifa do fundo B para que ele ainda empate com o A?',
          prefix: 'R$',
          answer: 218,
          wrong: [
            { value: 200, feedback: 'Isso compara as taxas em juros simples (2% × 2 anos de R$ 5.000,00). Em compostos: 6.050 − 5.832.' },
            { value: 100, feedback: 'R$ 100,00 é a diferença de um ano só. Compare os montantes dos 2 anos.' },
            { value: 1050, feedback: 'R$ 1.050,00 são os juros do fundo B. A tarifa máxima é quanto o B rende a mais que o A.' },
          ],
          solution: ['$A: 5.000 × 1,1664 = 5.832', '$B: 5.000 × 1,21 = 6.050', '$Tarifa máxima: 6.050 − 5.832 = 218'],
        })),
      ],
      practice: [gen(taxYieldGen), gen(penaltyGen), gen(midFeeGen), gen(feeAndTaxGen)],
      challenge: [gen(feeAndTaxGen), gen(maxFundFeeGen), gen(unevenYieldGen), gen(penaltyGen)],
      recap: [
        'Tributo e multa: só sobre os juros.',
        'Tarifa fixa: subtrai do saldo; taxa percentual: multiplica o fator.',
        'Para comparar aplicações, calcule o líquido de cada uma.',
      ],
    })),

    stage('inflacao', 'aprofundamento', 'Inflação, ganho real e recuperação', 'Acumular inflações de vários períodos, calcular o ganho real de uma aplicação e entender perdas e recuperações em juros compostos.', () => ({
      learn: [
        text('A **inflação** também se acumula como juros compostos: 10% e depois 5% de inflação dão 1,1 × 1,05 = 1,155, ou 15,5% no período. O **ganho real** compara o fator da aplicação com o da inflação por **divisão**: (1 + aplicação) ÷ (1 + inflação) − 1.'),
        lab({
          title: 'Ganho real',
          intro: 'Escolha o rendimento anual de uma aplicação, a inflação anual e o número de anos.',
          params: [
            { key: 'r', label: 'Rendimento ao ano', min: 0, max: 30, step: 1, value: 10, format: (v) => pct(v) },
            { key: 'f', label: 'Inflação ao ano', min: 0, max: 15, step: 1, value: 6, format: (v) => pct(v) },
            { key: 'n', label: 'Anos', min: 1, max: 5, step: 1, value: 2, format: (v) => `${v}` },
          ],
          readouts: ({ r, f, n }) => {
            const a = (1 + r / 100) ** n;
            const b = (1 + f / 100) ** n;
            return [
              { label: 'Rendimento acumulado', value: pct((a - 1) * 100) },
              { label: 'Inflação acumulada', value: pct((b - 1) * 100) },
              { label: 'Ganho real acumulado', value: pct((a / b - 1) * 100), big: true, tone: 'brass' },
            ];
          },
          viz: ({ r, f, n }) => {
            const a = (1 + r / 100) ** n;
            const b = (1 + f / 100) ** n;
            return {
              kind: 'bars',
              bars: [
                { label: 'Aplicação', value: (a - 1) * 100, text: pct((a - 1) * 100, 1), tone: 'brass' },
                { label: 'Inflação', value: (b - 1) * 100, text: pct((b - 1) * 100, 1), tone: 'ember' },
                { label: 'Ganho real', value: Math.max((a / b - 1) * 100, 0), text: pct((a / b - 1) * 100, 1), tone: 'verdigris' },
              ],
              summary: `Em ${n} anos: aplicação ${pct((a - 1) * 100, 1)}, inflação ${pct((b - 1) * 100, 1)}, ganho real ${pct((a / b - 1) * 100, 1)}`,
            };
          },
          goal: {
            task: 'Com inflação de 5% ao ano, ache o rendimento anual que dá ganho real de exatamente 20% ao ano.',
            done: ({ r, f }) => r === 26 && f === 5,
            success: 'Isso: 1,26 ÷ 1,05 = 1,2. Para ganhar 20% acima de uma inflação de 5%, é preciso render 26%, e não 25%.',
          },
          insight: 'Ganho real não é a diferença das taxas: é a razão entre os fatores.',
        }),
        key('Ganho real', 'Fator real = fator da aplicação ÷ fator da inflação; ganho real = fator real − 1. Com vários períodos, multiplique os fatores de cada um antes de dividir.'),
        example('Aluguel corrigido', 'Um aluguel de R$ 1.500,00 é corrigido pela inflação de cada ano: 8% e depois 5%. Qual deve ser o valor ao fim dos 2 anos?', [
          askStep('Inflação acumulada.', 'Qual é o fator?', [
            ok('1,08 × 1,05 = 1,134'),
            no('1 + 0,08 + 0,05 = 1,13', 'Somar as inflações esquece que a de 5% incide sobre preços já 8% maiores.'),
          ]),
          step('Aluguel corrigido:', '1.500 × 1,134 = R$ 1.701,00'),
        ], 'O aluguel passa a R$ 1.701,00.'),
        example('Ganho real de uma aplicação', 'Uma aplicação transformou R$ 10.000,00 em R$ 12.320,00 em 2 anos. A inflação foi de 4% no 1º ano e de 5% no 2º. Qual foi o ganho real?', [
          step('Fator da aplicação:', '12.320 ÷ 10.000 = 1,232'),
          step('Fator da inflação:', '1,04 × 1,05 = 1,092'),
          askStep('Agora, o ganho real.', 'Qual é?', [
            ok('1,232 ÷ 1,092 ≈ 1,1282 → cerca de 12,82%'),
            no('23,2% − 9,2% = 14%', 'Subtrair as taxas é só uma aproximação. O poder de compra cresce na razão 1,232 ÷ 1,092.'),
          ]),
        ], 'O ganho real foi de cerca de 12,82%.'),
        check(numeric({
          prompt: [p('O preço de uma ação caiu 25% num ano. No ano seguinte, subiu exatamente o necessário para voltar ao preço anterior à queda.')],
          ask: 'Qual foi a alta do 2º ano? Arredonde a duas casas decimais.',
          unit: '%',
          answer: 33.33,
          tolerance: 0.01,
          wrong: [
            { value: 25, feedback: 'Subir 25% sobre o preço reduzido não basta: 0,75 × 1,25 = 0,9375.' },
            { value: 20, feedback: 'Esse percentual desfaria uma ALTA de 25%, e não uma queda.' },
          ],
          solution: ['$1 ÷ 0,75 ≈ 1,3333 → 33,33%'],
        })),
      ],
      practice: [gen(inflationAccGen), gen(realGainCompGen), gen(lossRecoverGen)],
      challenge: [gen(inflationAccGen), gen(realGainCompGen), gen(lossRecoverGen), gen(secondRateGen)],
      recap: [
        'Inflação acumulada: multiplique os fatores.',
        'Ganho real: fator da aplicação ÷ fator da inflação − 1.',
        'Perder x% exige ganhar mais que x% para voltar.',
      ],
    })),

    stage('maestria', 'maestria', 'Maestria: o dinheiro em movimento', 'Resolver problemas inéditos que combinam depósitos, retiradas, pagamentos, tributos e inflação em juros compostos.', () => ({
      learn: [
        strategy('Linha do tempo', '1) Desenhe a linha do tempo com cada depósito, retirada, tarifa e pagamento. 2) Avance período a período, ou leve tudo para uma mesma data. 3) Tributos e multas: só sobre os juros. 4) Inflação: compare os fatores por divisão.'),
        example('A reserva da formatura', 'Uma turma deposita R$ 3.000,00 hoje e mais R$ 3.000,00 daqui a 1 ano numa aplicação de 10% ao ano, juros compostos. No resgate, ao fim do 2º ano, paga 20% de imposto sobre os juros. Quanto resgata?', [
          step('Fim do 1º ano:', '3.000 × 1,1 + 3.000 = R$ 6.300,00'),
          step('Fim do 2º ano:', '6.300 × 1,1 = R$ 6.930,00; juros de 6.930 − 6.000 = R$ 930,00'),
          askStep('Imposto de 20% sobre os juros.', 'Quanto se resgata?', [
            ok('6.930 − 0,2 × 930 = R$ 6.744,00'),
            no('6.930 × 0,8 = R$ 5.544,00', 'O imposto incide só sobre os juros (R$ 930,00), e não sobre os depósitos.'),
          ]),
        ], 'A turma resgata R$ 6.744,00.'),
        reveal('Por que "subir 30% e cair 30%" dá prejuízo?', 'Porque a queda incide sobre um valor maior: 1,3 × 0,7 = 0,91. A perda é sempre o quadrado da taxa: 0,3² = 9%. Oscilações iguais para cima e para baixo corroem o saldo.'),
        check(numeric({
          prompt: [p('Uma estudante de enfermagem faz três depósitos de R$ 1.000,00 numa aplicação de 20% ao ano, juros compostos: no início do 1º, do 2º e do 3º ano.')],
          ask: 'Quanto terá ao fim do 3º ano?',
          prefix: 'R$',
          answer: 4368,
          wrong: [
            { value: 3640, feedback: 'Isso trata os depósitos como feitos no FIM de cada ano. Feitos no início, cada um rende um ano a mais: 1.728 + 1.440 + 1.200.' },
            { value: 5184, feedback: 'Isso faz os três depósitos renderem 3 anos. O 2º rende 2, e o 3º, só 1.' },
            { value: 4200, feedback: 'Isso usa juros simples. Em compostos: 1.000 × (1,2³ + 1,2² + 1,2).' },
          ],
          solution: ['$1.000 × 1,728 + 1.000 × 1,44 + 1.000 × 1,2 = 4.368'],
        })),
      ],
      practice: [gen(depositGen), gen(taxYieldGen), gen(realGainCompGen)],
      challenge: [gen(annualDepositsGen), gen(partialDebtGen), gen(maxFundFeeGen), gen(secondRateGen)],
      recap: [
        'Movimentos: período a período, na ordem dos acontecimentos.',
        'Metas: todos os valores na mesma data.',
        'Tributos: sobre os juros; ganho real: divisão de fatores.',
      ],
    })),
  ],
});
