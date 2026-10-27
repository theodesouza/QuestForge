/**
 * Aula: Juros compostos — juros sobre juros e M = C·(1 + i)ⁿ; simples × compostos (reconhecer
 * o regime, taxa simples que empata, regimes em sequência); taxas equivalentes por potência e
 * raiz; valor presente, taxa e número de períodos a partir do montante; juros de um período
 * específico; tempo para atingir uma meta (tabelas, logaritmos e regra do 72).
 */
import {
  askStep,
  barChart,
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
  warn,
} from '../../kit/build';
import { brl, num, pct, round } from '../../kit/format';
import type { Rand } from '../../types';

const isInt = (x: number) => Number.isInteger(round(x, 9));
/** Fator de uma taxa: 5 → "1,05"; 2,5 → "1,025". */
const fac = (i: number) => num(1 + i / 100, 4);
const SUP = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
/** Potência com expoente sobrescrito: pow('1,05', 12) → "1,05¹²" (expoente 1 omitido). */
const pow = (b: string, n: number) => (n === 1 ? b : `${b}${String(n).split('').map((d) => SUP[Number(d)]).join('')}`);

const WHO = ['Uma cooperativa', 'Uma associação de moradores', 'Uma escola de música', 'Um grupo de teatro', 'Uma família'];

// ———————————————————————————————————————————————— geradores: montante

const COMP_BANK = new Set(['8000|6|2|ano', '5000|2|3|mês', '800|5|2|mês', '1000|10|2|ano', '500|20|3|ano']);

/** M = C · (1 + i)ⁿ e J = M − C. */
function compoundGen(r: Rand) {
  for (;;) {
    const C = r.pick([500, 800, 1000, 1500, 2000, 2500, 3000, 4000, 5000, 6000, 8000, 10000]);
    const monthly = r.next() < 0.5;
    const i = monthly ? r.pick([1, 2, 3, 4, 5]) : r.pick([5, 6, 8, 10, 12, 15, 20]);
    const n = r.pick([2, 3]);
    const per = monthly ? 'mês' : 'ano';
    if (COMP_BANK.has(`${C}|${i}|${n}|${per}`)) continue; // questões do banco
    const f = (1 + i / 100) ** n;
    const M = round(C * f, 6);
    if (!isInt(M * 100)) continue;
    const J = round(M - C, 2);
    const loan = r.next() < 0.5;
    const askJ = r.next() < 0.4;
    const units = monthly ? 'meses' : 'anos';
    const simpleJ = (C * i * n) / 100;
    return draftNumeric({
      prompt: [
        p(
          loan
            ? `Um pequeno comerciante pegou ${brl(C)} emprestados a juros compostos de ${pct(i)} ao ${per}, para pagar tudo de uma vez depois de ${n} ${units}.`
            : `${r.pick(WHO)} aplicou ${brl(C)} a juros compostos de ${pct(i)} ao ${per}, por ${n} ${units}, sem depósitos nem retiradas.`,
        ),
        ...(n === 3 ? [p(`Use: ${pow(fac(i), 3)} = ${num(f, 6)}.`)] : []),
      ],
      ask: loan ? (askJ ? 'Quanto vai pagar só de juros?' : 'Quanto vai pagar no total?') : askJ ? 'Quanto a aplicação vai render de juros?' : 'Qual será o montante?',
      prefix: 'R$',
      answer: askJ ? J : round(M, 2),
      wrong: [
        { value: round(askJ ? simpleJ : C + simpleJ, 2), feedback: `Isso usa juros simples (${n} × ${pct(i)}). Em juros compostos, os juros de cada período também rendem: ${num(C)} × ${pow(fac(i), n)}.` },
        askJ ? { value: round(M, 2), feedback: `${brl(M)} é o ${loan ? 'total a pagar' : 'montante'}. A pergunta pede só os juros.` } : { value: J, feedback: `${brl(J)} são só os juros. O ${loan ? 'total' : 'montante'} soma o capital.` },
        { value: round(askJ ? (C * i) / 100 : C * (1 + i / 100), 2), feedback: `Isso conta só um ${per}. São ${n} ${units}: o fator ${fac(i)} se aplica ${n} vezes.` },
      ],
      hints: [`A cada ${per}, o saldo é multiplicado por ${fac(i)}.`, `${loan ? 'Total' : 'Montante'}: ${num(C)} × ${pow(fac(i), n)}${askJ ? '; depois, tire o capital' : ''}.`],
      solution: [`$M = ${num(C)} × ${pow(fac(i), n)} = ${num(C)} × ${num(f, 6)} = ${num(M, 2)}`, ...(askJ ? [`$J = ${num(M, 2)} − ${num(C)} = ${num(J, 2)}`] : [])],
    });
  }
}

/** Taxas diferentes em cada ano, com capitalização anual. */
function varRatesGen(r: Rand) {
  for (;;) {
    const C = r.pick([1000, 2000, 2500, 4000, 5000, 8000, 10000]);
    const a = r.pick([4, 5, 6, 8, 10, 12, 15, 20]);
    const b = r.pick([4, 5, 6, 8, 10, 12, 15, 20]);
    if (a === b || (C === 1000 && a === 10 && b === 20)) continue; // questão do banco
    const M = C * (1 + a / 100) * (1 + b / 100);
    if (!isInt(M * 100)) continue;
    const avg = (a + b) / 2;
    return draftNumeric({
      prompt: [p(`Uma reserva de ${brl(C)} rendeu ${pct(a)} no primeiro ano e ${pct(b)} no segundo, com os juros de cada ano incorporados ao saldo, sem movimentações.`)],
      ask: 'Qual é o saldo depois dos dois anos?',
      prefix: 'R$',
      answer: round(M, 2),
      wrong: [
        { value: round(C * (1 + (a + b) / 100), 2), feedback: `Somar as taxas (${pct(a + b)}) ignora que no 2º ano os ${pct(b)} incidem sobre o saldo já aumentado.` },
        { value: round(C * (1 + avg / 100) ** 2, 2), feedback: 'Usar a média das taxas nos dois anos não dá o mesmo resultado. Multiplique os fatores de cada ano.' },
        { value: round(C * (1 + b / 100), 2), feedback: 'Isso esquece o rendimento do 1º ano.' },
      ],
      hints: [`1º ano: ${num(C)} × ${fac(a)} = ${brl(C * (1 + a / 100))}.`, `2º ano: esse saldo × ${fac(b)}.`],
      solution: [`$${num(C)} × ${fac(a)} × ${fac(b)} = ${num(M, 2)}`],
    });
  }
}

/** Saldo não pago da fatura corrigido a juros compostos. */
function cardDebtGen(r: Rand) {
  for (;;) {
    const F = r.pick([800, 1000, 1200, 1500, 2000, 2500]);
    const P = r.pick([200, 300, 400, 500, 600, 700, 1000]);
    const j = r.pick([5, 8, 10, 12, 15]);
    if (P >= F || (F === 1500 && P === 700 && j === 12)) continue; // questão do banco
    const R = F - P;
    const D = R * (1 + j / 100) ** 2;
    if (!isInt(D * 100)) continue;
    return draftNumeric({
      prompt: [p(`A fatura do cartão de Ivo veio no valor de ${brl(F)}. No vencimento, ele pagou ${brl(P)}, e o restante passou a ser cobrado com juros compostos de ${pct(j)} ao mês. Ivo não fez novas compras nem outros pagamentos nos dois meses seguintes; suponha que o saldo seja corrigido só por esses juros.`)],
      ask: 'Dois meses depois do vencimento, qual será a dívida?',
      prefix: 'R$',
      answer: round(D, 2),
      wrong: [
        { value: round(R * (1 + (2 * j) / 100), 2), feedback: `Isso usa juros simples (2 × ${pct(j)}). No 2º mês, os juros incidem também sobre os juros do 1º.` },
        { value: round(F * (1 + j / 100) ** 2, 2), feedback: `Isso aplica os juros à fatura inteira. Só o que não foi pago (${brl(R)}) é cobrado com juros.` },
        { value: round(D - R, 2), feedback: 'Esses são só os juros. A dívida inclui o saldo não pago.' },
        { value: round(R * (1 + j / 100), 2), feedback: 'Isso conta só um mês de juros. São dois.' },
      ],
      hints: [`Saldo não pago: ${brl(F)} − ${brl(P)} = ${brl(R)}.`, `Dois meses: ${num(R)} × ${pow(fac(j), 2)}.`],
      solution: [`$${num(R)} × ${pow(fac(j), 2)} = ${num(R)} × ${num((1 + j / 100) ** 2, 4)} = ${num(D, 2)}`],
    });
  }
}

// ———————————————————————————————————————————————— geradores: simples × compostos

/** Quanto os juros compostos rendem a mais que os simples, à mesma taxa. */
function regimeDiffGen(r: Rand) {
  for (;;) {
    const C = r.pick([1000, 2000, 4000, 5000, 8000, 10000, 20000]);
    const i = r.pick([4, 5, 6, 8, 10, 12, 20]);
    const n = r.pick([2, 3]);
    if ((C === 10000 && i === 5 && n === 3) || (C === 1000 && i === 10 && n === 3)) continue; // questões do banco
    const f = (1 + i / 100) ** n;
    const comp = C * f;
    const simp = C * (1 + (i * n) / 100);
    const diff = round(comp - simp, 6);
    if (!isInt(diff * 100) || !isInt(comp * 100)) continue;
    return draftNumeric({
      prompt: [
        p(`${r.pick(WHO)} vai aplicar ${brl(C)} por ${n} anos, sem retiradas. Há duas opções à mesma taxa de ${pct(i)} ao ano: uma em juros simples e outra em juros compostos.`),
        ...(n === 3 ? [p(`Use: ${pow(fac(i), 3)} = ${num(f, 6)}.`)] : []),
      ],
      ask: 'Escolhendo os juros compostos, quanto terá a mais ao final?',
      prefix: 'R$',
      answer: round(diff, 2),
      wrong: [
        { value: round(comp - C, 2), feedback: `${brl(comp - C)} são os juros compostos. A pergunta é quanto eles superam os simples (${brl(simp - C)}).` },
        { value: round(simp - C, 2), feedback: `${brl(simp - C)} são os juros simples. Compare com os compostos.` },
        { value: round(comp, 2), feedback: `${brl(comp)} é o montante composto. A pergunta é a diferença para o simples (${brl(simp)}).` },
        ...(n === 3 ? [{ value: round((C * i * i) / 10000, 2), feedback: 'Isso conta só um ano de "juros sobre juros". Em 3 anos, eles se acumulam mais de uma vez.' }] : []),
      ],
      hints: [`Simples: ${num(C)} × (1 + ${n} × ${num(i / 100, 2)}) = ${brl(simp)}.`, `Compostos: ${num(C)} × ${pow(fac(i), n)}.`],
      solution: [`$Compostos: ${num(comp, 2)}; simples: ${num(simp, 2)}`, `$Diferença: ${num(diff, 2)}`],
    });
  }
}

/** Taxa de juros simples que empata com uma taxa composta no mesmo prazo. */
function equalSimpleRateGen(r: Rand) {
  for (;;) {
    const i = r.pick([5, 6, 8, 10, 15, 20]);
    const n = r.pick([2, 3]);
    if (i === 12 && n === 2) continue; // questão do banco
    const f = (1 + i / 100) ** n;
    const s = round(((f - 1) / n) * 100, 4);
    const exact = isInt(s * 100);
    return draftNumeric({
      prompt: [
        p(`Um banco oferece uma aplicação de ${pct(i)} ao ano, juros compostos, por ${n} anos. Uma cooperativa oferece outra aplicação, de juros simples, com taxa anual fixa.`),
        ...(n === 3 ? [p(`Use: ${pow(fac(i), 3)} = ${num(f, 6)}.`)] : []),
      ],
      ask: `Qual deve ser a taxa anual de juros simples para que as duas aplicações resultem no mesmo montante ao fim de ${n} anos?${exact ? '' : ' Arredonde a duas casas decimais.'}`,
      unit: '%',
      answer: round(s, 2),
      wrong: [
        { value: i, feedback: `Com ${pct(i)} simples, os juros seriam menores: em ${n} anos, ${pct(i * n)}, contra ${pct((f - 1) * 100, 2)} nos compostos.` },
        { value: round((f - 1) * 100, 2), feedback: `${pct((f - 1) * 100, 2)} é o rendimento composto do período inteiro. Em juros simples, ele se divide igualmente pelos ${n} anos.` },
        { value: i * n, feedback: `${pct(i * n)} é o rendimento SIMPLES de ${n} anos a ${pct(i)}. A pergunta pede uma taxa anual.` },
      ],
      hints: [`Fator composto em ${n} anos: ${pow(fac(i), n)} = ${num(f, 4)}, ou ${pct((f - 1) * 100, 2)} no período.`, `Em juros simples, esse rendimento vem de ${n} anos iguais: divida por ${n}.`],
      solution: [`$${num(f, 6)} − 1 = ${num(f - 1, 6)}`, `$${num(f - 1, 6)} ÷ ${n} = ${num(s / 100, 6)} → ${pct(s, 2)} ao ano`],
    });
  }
}

/** Extrato sem regime declarado: reconheça o regime e preveja o saldo. */
function regimeTableGen(r: Rand) {
  for (;;) {
    const C = r.pick([10000, 20000, 25000, 40000, 50000, 80000]);
    const i = r.pick([2, 4, 5, 8, 10]);
    const compound = r.next() < 0.6;
    const k = r.pick([3, 4]);
    const bal = (y: number) => (compound ? C * (1 + i / 100) ** y : C * (1 + (i * y) / 100));
    const target = bal(k);
    if (!isInt(target * 100) || !isInt(bal(2) * 100)) continue;
    const other = compound ? C * (1 + (i * k) / 100) : C * (1 + i / 100) ** k;
    const lastStep = bal(2) + (k - 2) * (bal(2) - bal(1));
    return draftNumeric({
      prompt: [
        p('Uma aplicação rende juros a uma taxa anual fixa, sem depósitos nem retiradas. O extrato não informa se o regime é de juros simples ou de juros compostos.'),
        table(['Momento', 'Saldo'], [['Aplicação inicial', brl(C)], ['Fim do 1º ano', brl(bal(1))], ['Fim do 2º ano', brl(bal(2))]]),
      ],
      ask: `Mantidas as mesmas condições, qual será o saldo no fim do ${k}º ano?`,
      prefix: 'R$',
      answer: round(target, 2),
      wrong: [
        { value: round(other, 2), feedback: compound ? `Isso supõe juros simples. Os juros cresceram (${brl(bal(1) - C)} e depois ${brl(bal(2) - bal(1))}), na mesma razão: o regime é composto.` : `Isso supõe juros compostos. Os juros foram iguais nos dois anos (${brl(bal(1) - C)}): o regime é simples.` },
        ...(compound ? [{ value: round(lastStep, 2), feedback: `Isso repete o último acréscimo (${brl(bal(2) - bal(1))}) a cada ano. Em juros compostos, cada acréscimo é ${fac(i)} vezes o anterior.` }] : []),
      ],
      hints: ['Compare os juros de cada ano: iguais (simples) ou crescendo na mesma razão (compostos)?', compound ? `A razão entre saldos seguidos é ${fac(i)}.` : `Cada ano soma ${brl(bal(1) - C)}.`],
      solution: [compound ? `$Razão: ${num(bal(1))} ÷ ${num(C)} = ${fac(i)} → ${num(C)} × ${pow(fac(i), k)} = ${num(target, 2)}` : `$Acréscimo anual: ${num(bal(1) - C)} → ${num(C)} + ${k} × ${num(bal(1) - C)} = ${num(target, 2)}`],
    });
  }
}

/** Primeiro em juros simples, depois em juros compostos. */
function mixedRegimeGen(r: Rand) {
  for (;;) {
    const C = r.pick([1000, 2000, 2500, 4000, 5000]);
    const a = r.pick([5, 8, 10, 12]);
    const k = r.pick([1, 2]);
    const b = r.pick([5, 10, 20]);
    if (C === 1000 && a === 10 && k === 1 && b === 20) continue; // questão do banco
    const mid = C * (1 + (a * k) / 100);
    const fin = mid * (1 + b / 100) ** 2;
    if (!isInt(fin * 100)) continue;
    return draftNumeric({
      prompt: [p(`Uma comerciante deixou ${brl(C)} por ${k} ${k === 1 ? 'ano' : 'anos'} numa conta de juros simples de ${pct(a)} ao ano. Depois, transferiu todo o saldo para outra conta, que rende ${pct(b)} ao ano em juros compostos, por mais 2 anos. Não há custos.`)],
      ask: `Qual será o saldo ao fim dos ${k + 2} anos?`,
      prefix: 'R$',
      answer: round(fin, 2),
      wrong: [
        { value: round(mid * (1 + (2 * b) / 100), 2), feedback: `Isso usa juros simples também na 2ª conta. Ela rende em compostos: ${num(mid)} × ${pow(fac(b), 2)}.` },
        { value: round(C * (1 + (a * k + 2 * b) / 100), 2), feedback: 'Isso soma todas as taxas sobre o valor inicial. A 2ª conta rende sobre o saldo transferido, em compostos.' },
        { value: round(C * (1 + b / 100) ** 2, 2), feedback: 'Isso esquece o rendimento da 1ª conta.' },
        ...(k === 2 ? [{ value: round(C * (1 + a / 100) ** 2 * (1 + b / 100) ** 2, 2), feedback: 'Isso usa juros compostos na 1ª conta, que é de juros simples.' }] : []),
      ],
      hints: [`1ª conta (simples): ${num(C)} × (1 + ${k} × ${num(a / 100, 2)}) = ${brl(mid)}.`, `2ª conta (compostos): ${brl(mid)} × ${pow(fac(b), 2)}.`],
      solution: [`$${num(C)} × ${num(1 + (a * k) / 100, 2)} = ${num(mid, 2)}`, `$${num(mid, 2)} × ${num((1 + b / 100) ** 2, 4)} = ${num(fin, 2)}`],
    });
  }
}

/** Dívida em compostos × proposta em juros simples com tarifa. */
function altProposalGen(r: Rand) {
  for (;;) {
    const D = r.pick([2000, 4000, 5000, 6000, 8000, 10000]);
    const c = r.pick([5, 8, 10, 12]);
    const s = r.pick([10, 15, 16, 20, 24]);
    const F = r.pick([10, 20, 30, 50]);
    if (D === 5000 && c === 10 && s === 20 && F === 30) continue; // questão do banco
    const comp = D * (1 + c / 100) ** 2;
    const alt = D * (1 + s / 100) + F;
    const diff = round(comp - alt, 6);
    if (diff < 5 || !isInt(diff * 100)) continue;
    return draftNumeric({
      prompt: [p(`Uma dívida de ${brl(D)} cresce ${pct(c)} por semestre, juros compostos, por 2 semestres, sem pagamentos. Uma proposta alternativa cobra ${pct(s)} de juros simples sobre os ${brl(D)} pelo ano inteiro, mais uma tarifa única de ${brl(F)} na quitação.`)],
      ask: 'Quanto a proposta alternativa reduz o pagamento final?',
      prefix: 'R$',
      answer: round(diff, 2),
      wrong: [
        { value: round(comp - D * (1 + s / 100), 2), feedback: `Isso esquece a tarifa de ${brl(F)} da proposta alternativa.` },
        { value: round(D * (1 + (2 * c) / 100) - alt, 2), feedback: `Isso calcula a dívida original em juros simples (2 × ${pct(c)}). Ela é composta: ${num(D)} × ${pow(fac(c), 2)}.` },
        { value: round(comp - D, 2), feedback: 'Esses são os juros da dívida original. A pergunta é a diferença entre os dois pagamentos.' },
      ].filter((w) => w.value > 0),
      hints: [`Dívida original: ${num(D)} × ${pow(fac(c), 2)} = ${brl(comp)}.`, `Alternativa: ${num(D)} × ${fac(s)} + ${num(F)} = ${brl(alt)}.`],
      solution: [`$${num(comp, 2)} − ${num(alt, 2)} = ${num(diff, 2)}`],
    });
  }
}

// ———————————————————————————————————————————————— geradores: taxas equivalentes

const CONV = [
  { from: 'mês', to: 'bimestre', toRate: 'bimestral', k: 2 },
  { from: 'mês', to: 'trimestre', toRate: 'trimestral', k: 3 },
  { from: 'mês', to: 'semestre', toRate: 'semestral', k: 6 },
  { from: 'mês', to: 'ano', toRate: 'anual', k: 12 },
  { from: 'trimestre', to: 'semestre', toRate: 'semestral', k: 2 },
  { from: 'trimestre', to: 'ano', toRate: 'anual', k: 4 },
  { from: 'semestre', to: 'ano', toRate: 'anual', k: 2 },
];
const CONV_BANK = new Set(['trimestre|semestre|3', 'mês|ano|0.7', 'mês|bimestre|1', 'mês|ano|8', 'trimestre|semestre|5']);

/** Taxa equivalente de um período maior: (1 + i)ᵏ − 1. */
function equivRateGen(r: Rand) {
  for (;;) {
    const c = r.pick(CONV);
    const i = r.pick([0.5, 0.8, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]);
    if (CONV_BANK.has(`${c.from}|${c.to}|${i}`) || i * c.k > 60) continue; // questões do banco
    if (((1 + i / 100) ** c.k - 1) * 100 - i * c.k < 0.05) continue; // o efeito composto precisa aparecer
    const exactF = (1 + i / 100) ** c.k;
    const given = c.k >= 4;
    const f = given ? round(exactF, 4) : exactF;
    const ans = round((f - 1) * 100, 2);
    return draftNumeric({
      prompt: [
        p(`Uma aplicação rende ${pct(i)} ao ${c.from}, no regime de juros compostos. Para comparar com outras opções, é preciso saber a taxa ${c.toRate} equivalente.`),
        ...(given ? [p(`Use: ${pow(fac(i), c.k)} ≈ ${num(f, 4)}.`)] : []),
      ],
      ask: `Qual é a taxa ${c.toRate} equivalente? Arredonde a duas casas decimais.`,
      unit: '%',
      answer: ans,
      wrong: [
        { value: round(i * c.k, 2), feedback: `Multiplicar a taxa por ${c.k} é conversão de juros simples. Em compostos, o fator se eleva: ${pow(fac(i), c.k)}.` },
        { value: round(f * 100, 2), feedback: `${pct(f * 100)} é o fator escrito em porcentagem. A taxa é a diferença para 100%.` },
      ],
      hints: [`Um ${c.to} tem ${c.k} períodos de um ${c.from}.`, `Fator do ${c.to}: ${pow(fac(i), c.k)}.`],
      solution: [`$${pow(fac(i), c.k)} ${given ? '≈' : '='} ${num(f, 6)} → taxa de ${pct(ans)} ao ${c.to}`],
    });
  }
}

const ROOT_CTX = [
  { lead: (L: string, k: number) => `Um fundo rendeu ${L} em ${k} anos, a juros compostos com taxa anual fixa, sem depósitos nem retiradas.`, unit: 'anual', per: 'ano' },
  { lead: (L: string, k: number) => `Uma dívida cresceu ${L} em ${k} trimestres, a juros compostos com taxa trimestral fixa, sem pagamentos.`, unit: 'trimestral', per: 'trimestre' },
  { lead: (L: string, k: number) => `Um banco anuncia que um investimento rende ${L} a cada ${k} semestres, a juros compostos com taxa semestral fixa.`, unit: 'semestral', per: 'semestre' },
];

/** Taxa de um período menor a partir da taxa acumulada: raiz. */
function rootRateGen(r: Rand) {
  for (;;) {
    const s = r.pick([2, 3, 4, 5, 6, 8, 10, 15, 20, 25, 30]);
    const k = r.pick([2, 2, 3]);
    if ((k === 2 && (s === 6 || s === 10 || s === 20)) || (k === 3 && s === 10)) continue; // questões do banco
    const f = (1 + s / 100) ** k;
    const L = round((f - 1) * 100, 4);
    if (!isInt(L * 100)) continue;
    const c = r.pick(ROOT_CTX);
    const cands = [s - 2, s - 1, s, s + 1].filter((x) => x > 0);
    return draftNumeric({
      prompt: [
        p(c.lead(pct(L, 4), k)),
        table(['x', pow('x', k)], cands.map((x) => [fac(x), num((1 + x / 100) ** k, 6)])),
      ],
      ask: `Qual é a taxa ${c.unit}?`,
      unit: '%',
      answer: s,
      wrong: [
        { value: round(L / k, 2), feedback: `Dividir o crescimento total por ${k} é conta de juros simples. Em compostos, o fator de cada ${c.per} é a raiz: ${k === 2 ? '√' : '∛'}${num(f, 6)}.` },
        { value: L, feedback: `${pct(L)} é o crescimento acumulado nos ${k} períodos, e não a taxa de cada um.` },
      ],
      hints: [`Fator acumulado: 1 + ${num(L / 100, 6)} = ${num(f, 6)}.`, `Procure na tabela o x com ${pow('x', k)} = ${num(f, 6)}.`],
      solution: [`$${pow('(1 + i)', k)} = ${num(f, 6)} → 1 + i = ${fac(s)} → i = ${pct(s)}`],
    });
  }
}

const MONTHLY = [
  { m: 0.8, f: 1.1003 },
  { m: 1, f: 1.1268 },
  { m: 1.2, f: 1.1539 },
  { m: 1.5, f: 1.1956 },
  { m: 2, f: 1.2682 },
];

/** Taxa mensal × taxa anual num empréstimo de 12 meses. */
function compareRatesGen(r: Rand) {
  for (;;) {
    const C = r.pick([5000, 8000, 10000, 15000, 20000, 30000]);
    const o = r.pick(MONTHLY);
    const Y = round((o.f - 1) * 100 + r.pick([-1.5, -1, -0.5, 0.5, 1, 1.5]), 2);
    if (C === 20000 && o.m === 1.5 && Y === 19) continue; // questão do banco
    const X = round(C * o.f, 2);
    const YY = round(C * (1 + Y / 100), 2);
    const diff = round(Math.abs(X - YY), 2);
    if (diff < 1) continue;
    return draftNumeric({
      prompt: [
        p(`${r.pick(WHO)} precisa de ${brl(C)} e vai quitar o empréstimo num único pagamento, 12 meses depois. Há duas propostas, ambas em juros compostos:`),
        table(['Proposta', 'Taxa de juros'], [['Banco X', `${pct(o.m)} ao mês`], ['Banco Y', `${pct(Y)} ao ano`]]),
        p(`Use: ${pow(fac(o.m), 12)} ≈ ${num(o.f, 4)}.`),
      ],
      ask: 'Escolhendo a proposta mais barata, quanto se pagará a menos do que na outra?',
      prefix: 'R$',
      answer: diff,
      wrong: [
        { value: round(Math.abs((C * (12 * o.m - Y)) / 100), 2), feedback: `Isso compara 12 × ${pct(o.m)} com a taxa anual: conversão de juros simples. Em compostos, 12 meses a ${pct(o.m)} dão ${pct((o.f - 1) * 100, 2)}.` },
        { value: round(X - C, 2), feedback: 'Esses são os juros do Banco X. A pergunta é a diferença entre os dois pagamentos.' },
        { value: round(YY - C, 2), feedback: 'Esses são os juros do Banco Y. A pergunta é a diferença entre os dois pagamentos.' },
      ],
      hints: [`Banco X: ${num(C)} × ${num(o.f, 4)} = ${brl(X)}.`, `Banco Y: ${num(C)} × ${fac(Y)} = ${brl(YY)}.`],
      solution: [`$X: ${num(X, 2)}; Y: ${num(YY, 2)}`, `$Diferença: ${num(diff, 2)}`],
    });
  }
}

const OPT_M = [
  { m: 0.9, f: 1.1135 },
  { m: 1, f: 1.1268 },
  { m: 1.1, f: 1.1403 },
];
const OPT_Q = [
  { q: 2.8, f: 1.1168 },
  { q: 3, f: 1.1255 },
  { q: 3.2, f: 1.1343 },
];
const OPT_S = [5.5, 6, 6.5];
const OPT_A = [11.5, 12, 12.5, 13];

/** Quatro aplicações com taxas em períodos diferentes: a mais vantajosa. */
function bestOfFourGen(r: Rand) {
  for (;;) {
    const m = r.pick(OPT_M);
    const q = r.pick(OPT_Q);
    const s = r.pick(OPT_S);
    const a = r.pick(OPT_A);
    if (m.m === 1 && q.q === 3 && s === 6) continue; // questão do banco
    const eq = [(m.f - 1) * 100, (q.f - 1) * 100, ((1 + s / 100) ** 2 - 1) * 100, a].map((x) => round(x, 2));
    const best = Math.max(...eq);
    const sorted = [...eq].sort((x, y) => y - x);
    if (sorted[0] - sorted[1] < 0.05) continue;
    const nominal = [12 * m.m, 4 * q.q, 2 * s, a];
    const iNom = nominal.indexOf(Math.max(...nominal));
    return draftNumeric({
      prompt: [
        p('Uma comissão de formatura vai aplicar o dinheiro arrecadado por exatamente 1 ano, sem depósitos nem retiradas. Pesquisou quatro aplicações, todas em juros compostos:'),
        table(['Aplicação', 'Taxa de juros'], [['I', `${pct(m.m)} ao mês`], ['II', `${pct(q.q)} ao trimestre`], ['III', `${pct(s)} ao semestre`], ['IV', `${pct(a)} ao ano`]]),
        p(`Use: ${pow(fac(m.m), 12)} ≈ ${num(m.f, 4)} e ${pow(fac(q.q), 4)} ≈ ${num(q.f, 4)}.`),
      ],
      ask: 'Qual é a taxa anual equivalente da aplicação mais vantajosa? Arredonde a duas casas decimais.',
      unit: '%',
      answer: best,
      wrong: [
        { value: round(Math.max(...nominal), 2), feedback: 'Isso converte as taxas por proporção (12 × mensal, 4 × trimestral, 2 × semestral), como em juros simples. Em compostos, eleve os fatores.' },
        ...(iNom !== eq.indexOf(best) ? [{ value: eq[iNom], feedback: 'Essa aplicação tem a maior taxa "proporcional", mas não a maior taxa equivalente composta.' }] : []),
        { value: sorted[1], feedback: 'Essa é a taxa equivalente de outra aplicação, que não é a maior.' },
      ],
      hints: ['Converta todas para taxa anual: mensal → ¹², trimestral → ⁴, semestral → ².', `III: ${pow(fac(s), 2)} = ${num((1 + s / 100) ** 2, 6)}.`],
      solution: [`$I: ${pct(eq[0])}; II: ${pct(eq[1])}; III: ${pct(eq[2])}; IV: ${pct(eq[3])}`, `$Maior: ${pct(best)}`],
    });
  }
}

// ———————————————————————————————————————————————— geradores: valor presente, taxa e período

const PV_BANK = new Set(['10000|8|2', '1200|10|2', '1000|10|2']);

/** Valor presente (ou desconto racional composto). */
function pvGen(r: Rand) {
  for (;;) {
    const C = r.pick([1000, 1200, 2000, 2500, 4000, 5000, 8000, 10000, 20000]);
    const i = r.pick([5, 8, 10, 12, 20]);
    const n = r.pick([2, 3]);
    if (PV_BANK.has(`${C}|${i}|${n}`)) continue; // questões do banco
    const f = (1 + i / 100) ** n;
    const M = round(C * f, 6);
    if (!isInt(M * 100)) continue;
    const discount = r.next() < 0.3;
    return draftNumeric({
      prompt: [
        p(
          discount
            ? `Uma dívida de ${brl(M)} vence daqui a ${n} anos. O credor aceita trocá-la por um pagamento único hoje, com desconto racional à taxa composta de ${pct(i)} ao ano, sem tarifa.`
            : `${r.pick(WHO)} quer ter ${brl(M)} daqui a ${n} anos e vai fazer hoje uma única aplicação a juros compostos de ${pct(i)} ao ano, sem custos.`,
        ),
        ...(n === 3 ? [p(`Use: ${pow(fac(i), 3)} = ${num(f, 6)}.`)] : []),
      ],
      ask: discount ? 'Qual é o valor do desconto, em reais, sobre a dívida futura?' : 'Quanto deve aplicar hoje?',
      prefix: 'R$',
      answer: discount ? round(M - C, 2) : C,
      wrong: discount
        ? [
            { value: round((M * i * n) / 100, 2), feedback: `Isso aplica ${n} × ${pct(i)} sobre a dívida futura (desconto simples). O desconto racional composto é M − M ÷ ${pow(fac(i), n)}.` },
            { value: C, feedback: `${brl(C)} é o valor a pagar hoje. O desconto é a diferença para os ${brl(M)}.` },
            { value: round(M - M / (1 + (i * n) / 100), 2), feedback: `Isso desconta em juros simples (÷ ${num(1 + (i * n) / 100, 2)}). Em compostos: ÷ ${num(f, 6)}.` },
          ]
        : [
            { value: round(M * (1 - (i * n) / 100), 2), feedback: `Tirar ${pct(i * n)} do valor futuro não desfaz juros compostos. Divida pelo fator: ${num(M, 2)} ÷ ${num(f, 6)}.` },
            { value: round(M / (1 + (i * n) / 100), 2), feedback: `Isso desconta em juros simples. Em compostos: ${num(M, 2)} ÷ ${pow(fac(i), n)}.` },
            { value: round(M / (1 + i / 100), 2), feedback: `Isso desconta só um ano. São ${n}: divida por ${pow(fac(i), n)}.` },
          ],
      hints: [`Fator de ${n} anos: ${pow(fac(i), n)} = ${num(f, 6)}.`, `Valor de hoje = ${num(M, 2)} ÷ ${num(f, 6)}.`],
      solution: [`$C = ${num(M, 2)} ÷ ${num(f, 6)} = ${num(C)}`, ...(discount ? [`$Desconto: ${num(M, 2)} − ${num(C)} = ${num(M - C, 2)}`] : [])],
    });
  }
}

/** Taxa anual a partir do capital e do montante, com tabela de potências. */
function rateFromGen(r: Rand) {
  for (;;) {
    const C = r.pick([1000, 2000, 4000, 5000, 8000, 20000, 25000]);
    const s = r.pick([4, 5, 8, 12, 15, 20, 25]);
    const n = r.pick([2, 3]);
    if (n === 2 && s === 20) continue; // questão do banco
    const f = (1 + s / 100) ** n;
    const M = round(C * f, 6);
    if (!isInt(M * 100)) continue;
    const cands = [s - 2, s - 1, s, s + 1];
    return draftNumeric({
      prompt: [
        p(`Há exatamente ${n} anos, ${r.pick(WHO).toLowerCase()} aplicou ${brl(C)} num título que rende juros compostos a uma taxa anual fixa, sem depósitos nem retiradas. Hoje o saldo é de ${brl(M)}.`),
        table(['x', pow('x', n)], cands.map((x) => [fac(x), num((1 + x / 100) ** n, 6)])),
      ],
      ask: 'Qual é a taxa anual dessa aplicação?',
      unit: '%',
      answer: s,
      wrong: [
        { value: round(((f - 1) / n) * 100, 2), feedback: `Dividir o crescimento total por ${n} é conta de juros simples. Em compostos: ${pow('(1 + i)', n)} = ${num(M, 2)} ÷ ${num(C)}.` },
        { value: round((f - 1) * 100, 2), feedback: `${pct((f - 1) * 100, 2)} é o crescimento acumulado nos ${n} anos, e não a taxa anual.` },
      ],
      hints: [`Fator acumulado: ${num(M, 2)} ÷ ${num(C)} = ${num(f, 6)}.`, `Procure na tabela o x com ${pow('x', n)} = ${num(f, 6)}.`],
      solution: [`$${pow('(1 + i)', n)} = ${num(f, 6)} → 1 + i = ${fac(s)} → i = ${pct(s)}`],
    });
  }
}

const PERIOD = [
  { one: 'trimestre', many: 'trimestres' },
  { one: 'ano', many: 'anos' },
  { one: 'semestre', many: 'semestres' },
];

/** Número de períodos a partir do capital, do montante e da taxa. */
function periodsFromGen(r: Rand) {
  for (;;) {
    const C = r.pick([500, 800, 1000, 1500, 2000, 2500, 4000]);
    const i = r.pick([10, 20, 25, 50]);
    const n = r.pick([2, 3, 4]);
    if (C === 800 && i === 20 && n === 2) continue; // questão do banco
    const M = C * (1 + i / 100) ** n;
    if (!isInt(M * 100)) continue;
    const per = r.pick(PERIOD);
    return draftNumeric({
      prompt: [p(`Uma dívida de ${brl(C)} passou a ${brl(M)} com juros compostos de ${pct(i)} por ${per.one}, sem taxas adicionais. O prazo é um número inteiro de ${per.many}.`)],
      ask: `Quantos ${per.many} se passaram?`,
      unit: per.many,
      answer: n,
      wrong: [
        { value: round((M / C - 1) / (i / 100), 2), feedback: `Isso calcula o prazo em juros simples. Em compostos, procure n com ${pow(fac(i), 1)}ⁿ = ${num(M / C, 4)}.` },
        { value: n + 1, feedback: `Com ${n + 1} ${per.many}, a dívida seria ${brl(M * (1 + i / 100))}.` },
        { value: n - 1, feedback: `Com ${n - 1} ${n - 1 === 1 ? per.one : per.many}, a dívida seria ${brl(M / (1 + i / 100))}.` },
      ],
      hints: [`Fator acumulado: ${num(M, 2)} ÷ ${num(C)} = ${num(M / C, 4)}.`, `Multiplique ${fac(i)} por ele mesmo até chegar a ${num(M / C, 4)}.`],
      solution: [`$${pow(fac(i), n)} = ${num(M / C, 4)} → ${n} ${per.many}`],
    });
  }
}

/** Juros creditados só num período específico. */
function yearInterestGen(r: Rand) {
  for (;;) {
    const C = r.pick([1000, 2000, 2500, 4000, 5000, 10000, 20000]);
    const i = r.pick([5, 10, 12, 20, 25]);
    const k = r.pick([2, 3]);
    if (i === 12 && k === 2) continue; // questão do banco
    const start = C * (1 + i / 100) ** (k - 1);
    const J = (start * i) / 100;
    if (!isInt(J * 100) || !isInt(start * 100)) continue;
    return draftNumeric({
      prompt: [p(`Uma aplicação de ${brl(C)} rende ${pct(i)} ao ano, juros compostos, sem depósitos nem retiradas.`)],
      ask: `Quanto ela rende de juros só no ${k}º ano?`,
      prefix: 'R$',
      answer: round(J, 2),
      wrong: [
        { value: round((C * i) / 100, 2), feedback: `${brl((C * i) / 100)} são os juros do 1º ano. No ${k}º, a taxa incide sobre o saldo do início dele (${brl(start)}).` },
        { value: round(C * ((1 + i / 100) ** k - 1), 2), feedback: `Esses são os juros acumulados nos ${k} anos. A pergunta pede só os do ${k}º ano.` },
        { value: round(start * (1 + i / 100) * (i / 100), 2), feedback: `Esses são os juros do ${k + 1}º ano. O ${k}º começa com ${brl(start)}.` },
      ],
      hints: [`Saldo no início do ${k}º ano: ${num(C)} × ${pow(fac(i), k - 1)} = ${brl(start)}.`, `Juros do ${k}º ano: ${pct(i)} desse saldo.`],
      solution: [`$${num(start, 2)} × ${num(i / 100, 2)} = ${num(J, 2)}`],
    });
  }
}

/** Capital inicial a partir dos juros creditados em anos seguidos. */
function initialFromInterestGen(r: Rand) {
  for (;;) {
    const i = r.pick([2, 4, 5, 8, 10, 20, 25]);
    const C = r.pick([10000, 20000, 25000, 40000, 50000, 62500, 80000]);
    if (C === 62500 && i === 4) continue; // questão do banco
    const J1 = (C * i) / 100;
    const J2 = J1 * (1 + i / 100);
    const J3 = J2 * (1 + i / 100);
    if (!isInt(J3 * 100) || !isInt(J2 * 100)) continue;
    const sum = J1 + J2 + J3;
    return draftNumeric({
      prompt: [
        p('A tesouraria de um clube aplicou uma reserva de uma só vez, a juros compostos com taxa anual fixa, sem depósitos nem retiradas. O gráfico mostra os juros creditados no fim de cada um dos três primeiros anos.'),
        barChart([{ label: '1º ano', value: J1 }, { label: '2º ano', value: J2 }, { label: '3º ano', value: J3 }], 'Juros creditados', 'R$'),
      ],
      ask: 'Qual foi o valor aplicado inicialmente?',
      prefix: 'R$',
      answer: C,
      wrong: [
        { value: round(sum, 2), feedback: 'Essa é a soma dos juros dos três anos, e não o capital. Descubra a taxa (razão entre juros seguidos) e divida os juros do 1º ano por ela.' },
        { value: round(C + sum, 2), feedback: 'Esse é o saldo no fim do 3º ano. A pergunta pede o valor aplicado no início.' },
        { value: round(J2 / (i / 100), 2), feedback: 'Isso divide os juros do 2º ano pela taxa: dá o saldo no início do 2º ano, que já inclui os juros do 1º.' },
      ],
      hints: [`Taxa: ${num(J2, 2)} ÷ ${num(J1, 2)} = ${fac(i)}, ou ${pct(i)} ao ano.`, `Os juros do 1º ano são ${pct(i)} do capital: C = ${num(J1, 2)} ÷ ${num(i / 100, 2)}.`],
      solution: [`$i = ${num(J2, 2)} ÷ ${num(J1, 2)} − 1 = ${num(i / 100, 2)}`, `$C = ${num(J1, 2)} ÷ ${num(i / 100, 2)} = ${num(C)}`],
    });
  }
}

/** Aplicar o dinheiro e pagar a prazo: quanto sobra? */
function payLaterGen(r: Rand) {
  for (;;) {
    const P = r.pick([2000, 3000, 4000, 5000, 6000, 8000]);
    const i = r.pick([6, 8, 10, 12]);
    const q = r.pick([5, 8, 10, 12, 15, 18]);
    const Q = (P * (100 + q)) / 100;
    const have = P * (1 + i / 100) ** 2;
    const left = round(have - Q, 6);
    if (left <= 0 || !isInt(left * 100)) continue;
    return draftNumeric({
      prompt: [p(`Uma máquina custa ${brl(P)} à vista ou ${brl(Q)} num pagamento único daqui a 2 anos. A compradora tem exatamente ${brl(P)}, que podem render ${pct(i)} ao ano, juros compostos, sem taxas.`)],
      ask: 'Se aplicar o dinheiro e pagar no prazo, quanto sobrará depois de quitar a máquina?',
      prefix: 'R$',
      answer: round(left, 2),
      wrong: [
        { value: round(P * (1 + (2 * i) / 100) - Q, 2), feedback: `Isso calcula o rendimento em juros simples (2 × ${pct(i)}). Em compostos: ${num(P)} × ${pow(fac(i), 2)}.` },
        { value: round(have - P, 2), feedback: 'Esses são os juros da aplicação. Falta descontar o que a compra a prazo custa a mais.' },
        { value: round(Q - P, 2), feedback: 'Essa é a diferença entre o preço a prazo e o à vista. A pergunta é quanto sobra depois de pagar com o dinheiro aplicado.' },
      ].filter((w) => w.value > 0),
      hints: [`Em 2 anos: ${num(P)} × ${pow(fac(i), 2)} = ${brl(have)}.`, `Pague ${brl(Q)} e veja o que sobra.`],
      solution: [`$${num(have, 2)} − ${num(Q)} = ${num(left, 2)}`],
    });
  }
}

// ———————————————————————————————————————————————— geradores: tempo

/** Menor número de anos para atingir uma meta, com tabela de potências. */
function tableTimeGen(r: Rand) {
  for (;;) {
    const C = r.pick([2000, 3000, 4000, 5000, 6000, 8000]);
    const i = r.pick([4, 5, 6, 7, 8, 10, 12]);
    const mult = r.pick([1.5, 2, 2.5, 3]);
    if (C === 4500 && i === 7 && mult === 2) continue; // questão do banco
    const b = 1 + i / 100;
    const n0 = Math.ceil(Math.log(mult) / Math.log(b) - 1e-12);
    if (n0 < 3 || n0 > 20) continue;
    if (Math.abs(b ** n0 - mult) < 0.003 || Math.abs(b ** (n0 - 1) - mult) < 0.003) continue;
    const rows = [n0 - 2, n0 - 1, n0, n0 + 1].map((n) => [`${n}`, num(b ** n, 3)]);
    const simpleN = Math.ceil(((mult - 1) * 100) / i - 1e-9);
    return draftNumeric({
      prompt: [
        p(`${r.pick(WHO)} aplicou ${brl(C)} a juros compostos de ${pct(i)} ao ano, sem depósitos nem retiradas, e só vai resgatar quando o saldo atingir, no mínimo, ${brl(C * mult)}.`),
        table(['n', `${pow(fac(i), 1)}ⁿ (aproximado)`], rows),
      ],
      ask: 'Qual é o menor número inteiro de anos necessário?',
      unit: 'anos',
      answer: n0,
      wrong: [
        { value: n0 - 1, feedback: `Com ${n0 - 1} anos, o fator ${num(b ** (n0 - 1), 3)} ainda não chega a ${num(mult, 1)} (= ${num(C * mult)} ÷ ${num(C)}).` },
        ...(simpleN !== n0 ? [{ value: simpleN, feedback: 'Esse seria o prazo em juros simples. Em compostos, o capital cresce mais depressa.' }] : []),
        { value: n0 + 1, feedback: `Com ${n0} anos, o fator ${num(b ** n0, 3)} já passa de ${num(mult, 1)}.` },
      ],
      hints: [`Meta em fator: ${num(C * mult)} ÷ ${num(C)} = ${num(mult, 1)}.`, `Procure o primeiro n da tabela com fator ≥ ${num(mult, 1)}.`],
      solution: [`$${pow(fac(i), n0 - 1)} ≈ ${num(b ** (n0 - 1), 3)} < ${num(mult, 1)} ≤ ${num(b ** n0, 3)} ≈ ${pow(fac(i), n0)} → ${n0} anos`],
    });
  }
}

const LOGS: Record<string, number> = { '1.02': 0.0086, '1.03': 0.0128, '1.04': 0.017, '1.05': 0.0212, '1.06': 0.0253, '1.08': 0.0334 };

/** Tempo para dobrar (ou triplicar) com logaritmos. */
function logTimeGen(r: Rand) {
  for (;;) {
    const i = r.pick([2, 3, 4, 5, 6, 8]);
    const m = r.pick([2, 3]);
    const below = r.next() < 0.5;
    if (i === 3 && m === 2 && below) continue; // questão do banco
    const lb = LOGS[(1 + i / 100).toFixed(2)];
    const lm = m === 2 ? 0.301 : 0.477;
    const x = lm / lb;
    const xTrue = Math.log(m) / Math.log(1 + i / 100);
    if (Math.floor(x) !== Math.floor(xTrue) || isInt(x)) continue;
    const C = r.pick([800, 1000, 1500, 2000, 2500]);
    const ans = below ? Math.floor(x) : Math.ceil(x);
    const what = m === 2 ? 'o dobro' : 'o triplo';
    const fromWhat = m === 2 ? 'do dobro' : 'do triplo';
    const toWhat = m === 2 ? 'ao dobro' : 'ao triplo';
    return draftNumeric({
      prompt: [p(`Uma dívida de ${brl(C)} é corrigida no fim de cada mês a juros compostos de ${pct(i)} ao mês, sem pagamentos. Use: log ${m} ≈ ${num(lm, 3)} e log ${fac(i)} ≈ ${num(lb, 4)}.`)],
      ask: below ? `Qual é o maior número inteiro de meses que se pode esperar para quitá-la enquanto ela ainda for menor que ${what} do valor inicial?` : `A partir de quantos meses inteiros a dívida passa a ser maior que ${what} do valor inicial?`,
      unit: 'meses',
      answer: ans,
      wrong: [
        { value: below ? Math.ceil(x) : Math.floor(x), feedback: below ? `Com ${Math.ceil(x)} meses, a dívida já passou ${fromWhat}: arredonde ${num(x, 2)} para baixo.` : `Com ${Math.floor(x)} meses, a dívida ainda não chegou ${toWhat}: arredonde ${num(x, 2)} para cima.` },
        { value: Math.round(((m - 1) * 100) / i), feedback: 'Esse seria o prazo em juros simples. Em compostos, use logaritmos: n = log m ÷ log(1 + i).' },
      ],
      hints: [`${pow(fac(i), 1)}ⁿ = ${m} → n = log ${m} ÷ log ${fac(i)}.`, `n ≈ ${num(lm, 3)} ÷ ${num(lb, 4)}.`],
      solution: [`$n = ${num(lm, 3)} ÷ ${num(lb, 4)} ≈ ${num(x, 2)} → ${ans} meses`],
    });
  }
}

/** Regra do 72 para dobrar, quadruplicar ou octuplicar. */
function rule72Gen(r: Rand) {
  for (;;) {
    const i = r.pick([3, 4, 6, 8, 9, 12, 18, 24]);
    const k = r.pick([1, 2, 3]);
    if ((i === 6 && k === 2) || (i === 9 && k === 3)) continue; // questões do banco
    const t = (72 / i) * k;
    if (!isInt(t * 10)) continue;
    const inc = (2 ** k - 1) * 100;
    return draftNumeric({
      prompt: [p(`Pela regra do 72, o tempo para um capital dobrar, a juros compostos, é de aproximadamente 72 ÷ (taxa anual em %) anos. Um fundo rende ${pct(i)} ao ano, sem depósitos nem retiradas.`)],
      ask: k === 1 ? 'Em quantos anos, aproximadamente, o capital dobra?' : `Em quantos anos, aproximadamente, o saldo terá um aumento de ${num(inc)}% em relação ao valor aplicado?`,
      unit: 'anos',
      answer: t,
      wrong: [
        ...(k > 1 ? [{ value: round((72 / i) * (2 ** k - 1), 2), feedback: `Um aumento de ${num(inc)}% é multiplicar por ${2 ** k}, ou seja, dobrar ${k} vezes: ${k} × ${num(72 / i, 2)} anos.` }] : []),
        ...(k > 1 ? [{ value: round((72 / i) * 2 ** k, 2), feedback: `Multiplicar por ${2 ** k} não exige ${2 ** k} duplicações: bastam ${k}.` }] : []),
        { value: round((100 / i) * k, 2), feedback: 'Isso usa 100 ÷ taxa, que é o tempo para dobrar em juros SIMPLES. A regra do 72 vale para compostos.' },
      ],
      hints: [`Tempo de duplicação: 72 ÷ ${i} = ${num(72 / i, 2)} anos.`, k > 1 ? `Multiplicar por ${2 ** k} é dobrar ${k} vezes.` : 'Basta uma duplicação.'],
      solution: [k === 1 ? `$72 ÷ ${i} = ${num(t, 1)} anos` : `$${k} × 72 ÷ ${i} = ${num(t, 1)} anos`],
    });
  }
}

// ———————————————————————————————————————————————— aula

export const JUROS_COMPOSTOS = lesson({
  id: 'juros-compostos',
  topic: 'financeira',
  subtopics: ['juros-compostos'],
  title: 'Juros compostos',
  summary:
    'Juros sobre juros: M = C · (1 + i)ⁿ, a comparação com juros simples, taxas equivalentes por potência e raiz, valor presente, taxa e prazo a partir do montante e o tempo para atingir uma meta.',
  requires: ['juros-simples', 'aumentos-sucessivos'],
  stages: [
    stage('montante', 'descoberta', 'Juros sobre juros', 'Entender a capitalização composta — os juros de cada período entram no saldo e passam a render — e calcular o montante com M = C · (1 + i)ⁿ.', () => ({
      learn: [
        text('No regime de **juros compostos**, os juros de cada período são somados ao saldo e passam a render juros no período seguinte: são **juros sobre juros**. Com taxa i por período, o saldo é multiplicado por (1 + i) a cada período; depois de n períodos, **M = C · (1 + i)ⁿ**. Os juros são J = M − C.'),
        lab({
          title: 'Simples × compostos',
          intro: 'Escolha o capital, a taxa por período e o número de períodos. Compare os dois regimes.',
          params: [
            { key: 'C', label: 'Capital', min: 1000, max: 10000, step: 1000, value: 1000, format: (v) => brl(v) },
            { key: 'i', label: 'Taxa por período', min: 1, max: 20, step: 1, value: 10, format: (v) => pct(v) },
            { key: 'n', label: 'Períodos', min: 1, max: 20, step: 1, value: 5, format: (v) => `${v}` },
          ],
          readouts: ({ C, i, n }) => {
            const comp = C * (1 + i / 100) ** n;
            const simp = C * (1 + (i * n) / 100);
            return [
              { label: 'Montante composto', value: brl(comp), big: true, tone: 'brass' },
              { label: 'Montante simples', value: brl(simp) },
              { label: 'Diferença', value: brl(comp - simp) },
            ];
          },
          viz: ({ C, i, n }) => ({
            kind: 'chart',
            xLabel: 'Períodos',
            yLabel: 'Montante (R$)',
            xMin: 0,
            xMax: 20,
            yMin: 0,
            series: [
              { label: 'Compostos', tone: 'brass', points: Array.from({ length: n + 1 }, (_, k) => [k, C * (1 + i / 100) ** k] as [number, number]), dots: true },
              { label: 'Simples', tone: 'mist', points: Array.from({ length: n + 1 }, (_, k) => [k, C * (1 + (i * k) / 100)] as [number, number]), dashed: true },
            ],
            summary: `Em ${n} períodos a ${pct(i)}: ${brl(C * (1 + i / 100) ** n)} em compostos e ${brl(C * (1 + (i * n) / 100))} em simples`,
          }),
          goal: {
            task: 'Com R$ 5.000,00 a 20% por período, ache o primeiro período em que os compostos superam os simples em mais de R$ 1.000,00.',
            done: ({ C, i, n }) => C === 5000 && i === 20 && n === 4,
            success: 'Isso: no 3º período a diferença é R$ 640,00; no 4º, 5.000 × (2,0736 − 1,8) = R$ 1.368,00.',
          },
          insight: 'No 1º período os regimes empatam; depois, os juros sobre juros fazem a curva composta se afastar da reta.',
        }),
        key('Fórmula', 'M = C · (1 + i)ⁿ, com i na forma decimal e n no número de períodos da taxa. Juros: J = M − C. Ano a ano: saldo × (1 + i).'),
        example('Ano a ano', 'R$ 2.000,00 são aplicados a 5% ao ano, juros compostos, por 3 anos. Qual é o montante?', [
          step('1º ano:', '2.000 × 1,05 = R$ 2.100,00'),
          step('2º ano:', '2.100 × 1,05 = R$ 2.205,00'),
          askStep('3º ano.', 'Qual é o saldo?', [
            ok('2.205 × 1,05 = R$ 2.315,25'),
            no('2.205 + 100 = R$ 2.305,00', 'Em juros compostos, os juros do 3º ano são 5% do saldo do início dele (R$ 2.205,00), ou seja, R$ 110,25, e não os R$ 100,00 do 1º ano.'),
          ]),
        ], 'O montante é R$ 2.315,25 = 2.000 × 1,05³.'),
        warn('Expoente, e não multiplicação', '(1 + i)ⁿ não é 1 + n · i. A 5% ao ano, 3 anos dão 1,05³ ≈ 1,1576 (15,76%), e não 1,15 (15%).'),
        check(numeric({
          prompt: [p('R$ 4.000,00 foram aplicados a juros compostos de 6% ao ano, por 2 anos.')],
          ask: 'Qual é o montante?',
          prefix: 'R$',
          answer: 4494.4,
          wrong: [
            { value: 4480, feedback: 'Isso usa juros simples (2 × 6%). Em juros compostos: 4.000 × 1,06² = 4.000 × 1,1236.' },
            { value: 494.4, feedback: 'R$ 494,40 são os juros. O montante é 4.000 + 494,40.' },
            { value: 4240, feedback: 'R$ 4.240,00 é o saldo depois de 1 ano. Falta o 2º: 4.240 × 1,06.' },
          ],
          solution: ['$4.000 × 1,06² = 4.000 × 1,1236 = 4.494,40'],
        })),
      ],
      practice: [gen(compoundGen), gen(varRatesGen), gen(cardDebtGen)],
      challenge: [
        gen(compoundGen),
        gen(varRatesGen),
        gen(cardDebtGen),
        numeric({
          prompt: [p('Um grupo deposita R$ 5.000,00 por 3 meses com juros compostos de 1% ao mês. No final, a instituição desconta uma única tarifa de R$ 25,00 do saldo. Use: 1,01³ = 1,030301.')],
          ask: 'Qual é o valor disponível para resgate?',
          prefix: 'R$',
          answer: 5126.51,
          wrong: [
            { value: 5151.51, feedback: 'R$ 5.151,51 é o saldo antes da tarifa. Desconte os R$ 25,00.' },
            { value: 5125, feedback: 'Isso usa juros simples (3 × 1%) antes da tarifa. Em compostos: 5.000 × 1,030301 = R$ 5.151,51.' },
            { value: 126.51, feedback: 'Esse é o rendimento líquido. A pergunta é o valor total disponível.' },
          ],
          solution: ['$5.000 × 1,030301 = 5.151,505 ≈ 5.151,51', '$5.151,51 − 25 = 5.126,51'],
        }),
      ],
      recap: [
        'M = C · (1 + i)ⁿ; J = M − C.',
        'Cada período rende sobre o saldo do período anterior.',
        'Taxas diferentes por período: multiplique os fatores.',
      ],
    })),

    stage('regimes', 'fundamentos', 'Simples × compostos', 'Comparar os regimes de juros simples e compostos, reconhecer o regime pelos dados de um extrato e encontrar a taxa simples que empata com uma taxa composta.', () => ({
      learn: [
        text('Com a mesma taxa, juros simples e compostos dão o **mesmo** resultado no 1º período; depois, os compostos crescem mais, porque os juros do período anterior também rendem. Num extrato, o regime se revela pelas diferenças: juros **iguais** a cada período → simples; juros que **crescem** na mesma razão → compostos.'),
        lab({
          title: 'Qual é o regime?',
          intro: 'R$ 10.000,00 aplicados por 5 anos. Escolha o regime e a taxa e veja os juros creditados em cada ano.',
          params: [
            { key: 'g', label: 'Regime', min: 0, max: 1, step: 1, value: 0, format: (v) => (v === 1 ? 'compostos' : 'simples') },
            { key: 'i', label: 'Taxa ao ano', min: 5, max: 20, step: 5, value: 5, format: (v) => pct(v) },
          ],
          readouts: ({ g, i }) => {
            const J = (y: number) => (g === 1 ? 10000 * (1 + i / 100) ** (y - 1) * (i / 100) : (10000 * i) / 100);
            return [
              { label: 'Juros do 1º ano', value: brl(J(1)) },
              { label: 'Juros do 2º ano', value: brl(J(2)) },
              { label: 'Juros do 3º ano', value: brl(J(3)), big: true, tone: 'brass' },
            ];
          },
          viz: ({ g, i }) => ({
            kind: 'bars',
            bars: [1, 2, 3, 4, 5].map((y) => {
              const v = g === 1 ? 10000 * (1 + i / 100) ** (y - 1) * (i / 100) : (10000 * i) / 100;
              return { label: `${y}º ano`, value: v, text: brl(v), tone: g === 1 ? ('brass' as const) : ('sky' as const) };
            }),
            summary: g === 1 ? `Juros compostos: cada ano rende ${pct(i)} a mais que o anterior` : 'Juros simples: todo ano rende o mesmo valor',
          }),
          goal: {
            task: 'Escolha o regime e a taxa em que os juros do 3º ano são de exatamente R$ 1.210,00.',
            done: ({ g, i }) => g === 1 && i === 10,
            success: 'Isso: a 10% compostos, o 3º ano começa com 10.000 × 1,1² = R$ 12.100,00, e 10% disso são R$ 1.210,00.',
          },
          insight: 'Juros iguais todo ano: simples. Juros crescendo na mesma razão: compostos.',
        }),
        key('Reconhecer o regime', 'Simples: saldos em progressão aritmética (mesma diferença a cada período). Compostos: saldos em progressão geométrica (mesma razão a cada período).'),
        example('Taxa simples que empata', 'Uma aplicação rende 10% ao ano, juros compostos, por 2 anos. Que taxa anual de juros simples daria o mesmo montante em 2 anos?', [
          step('Fator composto em 2 anos:', '1,1² = 1,21 → 21% no período'),
          askStep('Em juros simples, os 21% se dividem igualmente pelos 2 anos.', 'Qual é a taxa simples anual?', [
            ok('21% ÷ 2 = 10,5% ao ano'),
            no('10% ao ano', 'Com 10% simples, 2 anos dão só 20%. Para chegar a 21%, a taxa simples precisa ser 10,5%.'),
          ]),
        ], 'A taxa simples equivalente é 10,5% ao ano.'),
        check(numeric({
          prompt: [
            p('O extrato de uma aplicação sem depósitos nem retiradas mostra:'),
            table(['Momento', 'Saldo'], [['Início', 'R$ 25.000,00'], ['Fim do 1º ano', 'R$ 26.000,00'], ['Fim do 2º ano', 'R$ 27.040,00']]),
          ],
          ask: 'Mantidas as condições, qual será o saldo no fim do 3º ano?',
          prefix: 'R$',
          answer: 28121.6,
          wrong: [
            { value: 28080, feedback: 'Isso repete o último acréscimo (R$ 1.040,00). Os acréscimos crescem 4% a cada ano: o regime é composto, 27.040 × 1,04.' },
            { value: 28040, feedback: 'Isso supõe juros simples (R$ 1.000,00 por ano). Os juros do 2º ano já foram maiores: o regime é composto.' },
          ],
          solution: ['$Razão: 26.000 ÷ 25.000 = 1,04 e 27.040 ÷ 26.000 = 1,04', '$27.040 × 1,04 = 28.121,60'],
        })),
      ],
      practice: [gen(regimeDiffGen), gen(equalSimpleRateGen), gen(regimeTableGen)],
      challenge: [gen(regimeDiffGen), gen(equalSimpleRateGen), gen(mixedRegimeGen), gen(altProposalGen)],
      recap: [
        'Mesma taxa: empate no 1º período; depois, compostos rendem mais.',
        'Saldos com a mesma diferença: simples; com a mesma razão: compostos.',
        'Taxa simples que empata: (fator composto − 1) ÷ n.',
      ],
    })),

    stage('taxas', 'interpretacao', 'Taxas equivalentes', 'Converter taxas compostas entre períodos (mês, trimestre, semestre, ano) com potências e raízes e comparar propostas com taxas em períodos diferentes.', () => ({
      learn: [
        text('Em juros compostos, taxas de períodos diferentes **não** se convertem por proporção. 2% ao mês não é 24% ao ano: em 12 meses, o fator é 1,02¹² ≈ 1,2682, ou seja, **26,82% ao ano**. A regra: (1 + i_longo) = (1 + i_curto)ᵏ, em que k é quantos períodos curtos cabem no longo. No sentido inverso, use a raiz.'),
        lab({
          title: 'Conversor de taxas compostas',
          intro: 'Escolha uma taxa mensal e um número de meses. Compare a taxa composta equivalente com a "proporcional".',
          params: [
            { key: 'i', label: 'Taxa ao mês', min: 0.5, max: 5, step: 0.5, value: 1, format: (v) => pct(v) },
            { key: 'k', label: 'Meses', min: 1, max: 12, step: 1, value: 12, format: (v) => `${v}` },
          ],
          readouts: ({ i, k }) => [
            { label: 'Proporcional (k × i)', value: pct(i * k) },
            { label: 'Equivalente composta', value: pct(((1 + i / 100) ** k - 1) * 100, 4), big: true, tone: 'brass' },
            { label: 'Diferença', value: `${num(((1 + i / 100) ** k - 1) * 100 - i * k, 4)} pontos` },
          ],
          viz: ({ i, k }) => ({
            kind: 'bars',
            bars: [
              { label: 'Proporcional', value: i * k, text: pct(i * k), tone: 'mist' },
              { label: 'Composta', value: ((1 + i / 100) ** k - 1) * 100, text: pct(((1 + i / 100) ** k - 1) * 100, 2), tone: 'brass' },
            ],
            summary: `${pct(i)} ao mês por ${k} meses: ${pct(((1 + i / 100) ** k - 1) * 100, 2)} compostos, contra ${pct(i * k)} proporcionais`,
          }),
          goal: {
            task: 'Ache a taxa mensal cujo equivalente trimestral (3 meses) é de exatamente 12,4864%.',
            done: ({ i, k }) => i === 4 && k === 3,
            success: 'Isso: 1,04³ = 1,124864. A taxa proporcional seria 12%; os 0,4864 ponto a mais são juros sobre juros.',
          },
          insight: 'Quanto maiores a taxa e o número de períodos, maior a distância entre a taxa composta e a proporcional.',
        }),
        key('Taxa equivalente', '(1 + i_período maior) = (1 + i_período menor)ᵏ. Mês → ano: k = 12; trimestre → ano: k = 4; semestre → ano: k = 2; mês → bimestre: k = 2. Para o período menor: raiz de índice k.'),
        example('Do trimestre para o semestre', 'Um fundo rende 4% ao trimestre, juros compostos. Qual é a taxa semestral equivalente?', [
          step('Um semestre tem 2 trimestres:', 'k = 2'),
          askStep('Fator do semestre.', 'Qual é?', [
            ok('1,04² = 1,0816 → 8,16% ao semestre'),
            no('2 × 4% = 8%', 'Somar as taxas ignora os juros do 2º trimestre sobre os juros do 1º: 1,04² = 1,0816.'),
          ]),
        ], 'A taxa semestral equivalente é 8,16%.'),
        example('Do ano para o semestre', 'Um banco anuncia 21% ao ano, juros compostos, e aplica a taxa equivalente para prazos menores. Qual é a taxa semestral?', [
          step('Um ano tem 2 semestres:', '(1 + i_s)² = 1,21'),
          askStep('Isole a taxa.', 'Quanto vale i_s?', [
            ok('√1,21 = 1,1 → 10% ao semestre'),
            no('21% ÷ 2 = 10,5%', 'Dividir por 2 é conversão de juros simples. Em compostos, use a raiz: √1,21 = 1,1.'),
          ]),
        ], 'A taxa semestral equivalente é 10%, e não 10,5%.'),
        check(numeric({
          prompt: [p('Um cartão cobra juros compostos de 2,5% ao mês.')],
          ask: 'Qual é a taxa bimestral equivalente? Arredonde a duas casas decimais.',
          unit: '%',
          answer: 5.06,
          wrong: [
            { value: 5, feedback: 'Isso soma as taxas dos 2 meses. Em compostos: 1,025² = 1,050625.' },
            { value: 105.06, feedback: '105,06% é o fator em porcentagem. A taxa é 5,06%.' },
          ],
          solution: ['$1,025² = 1,050625 → 5,06% ao bimestre'],
        })),
      ],
      practice: [gen(equivRateGen), gen(rootRateGen), gen(compareRatesGen)],
      challenge: [gen(equivRateGen), gen(rootRateGen), gen(compareRatesGen), gen(bestOfFourGen)],
      recap: [
        'Taxas compostas não se convertem por proporção.',
        'Período maior: eleve o fator; período menor: tire a raiz.',
        'Para comparar propostas, converta todas para o mesmo período.',
      ],
    })),

    stage('presente', 'aplicacoes', 'Valor presente, taxa e período', 'Descobrir o capital (valor presente), a taxa ou o número de períodos a partir do montante e calcular os juros de um período específico.', () => ({
      learn: [
        text('Para trazer um valor do futuro para hoje, **divida** pelo fator: C = M ÷ (1 + i)ⁿ — é o **valor presente**. Para descobrir a taxa, isole o fator, (1 + i)ⁿ = M ÷ C, e tire a raiz. Os juros de um ano específico são o saldo do início daquele ano vezes a taxa.'),
        lab({
          title: 'Valor presente',
          intro: 'Escolha um valor futuro, a taxa anual e o prazo. Veja quanto ele vale hoje.',
          params: [
            { key: 'M', label: 'Valor futuro', min: 1000, max: 20000, step: 1000, value: 10000, format: (v) => brl(v) },
            { key: 'i', label: 'Taxa ao ano', min: 2, max: 20, step: 2, value: 10, format: (v) => pct(v) },
            { key: 'n', label: 'Anos', min: 1, max: 10, step: 1, value: 3, format: (v) => `${v}` },
          ],
          readouts: ({ M, i, n }) => [
            { label: 'Fator (1 + i)ⁿ', value: num((1 + i / 100) ** n, 4) },
            { label: 'Valor presente', value: brl(M / (1 + i / 100) ** n), big: true, tone: 'brass' },
            { label: 'Juros embutidos', value: brl(M - M / (1 + i / 100) ** n) },
          ],
          viz: ({ M, i, n }) => ({
            kind: 'bars',
            bars: [
              { label: 'Hoje', value: M / (1 + i / 100) ** n, text: brl(M / (1 + i / 100) ** n), tone: 'verdigris' },
              { label: `Daqui a ${n} anos`, value: M, text: brl(M), tone: 'brass' },
            ],
            summary: `${brl(M)} daqui a ${n} anos valem ${brl(M / (1 + i / 100) ** n)} hoje, a ${pct(i)} ao ano`,
          }),
          goal: {
            task: 'Ache a taxa com a qual R$ 10.000,00 daqui a 2 anos valem R$ 6.944,44 hoje.',
            done: ({ M, i, n }) => M === 10000 && n === 2 && i === 20,
            success: 'Isso: 1,2² = 1,44, e 10.000 ÷ 1,44 ≈ R$ 6.944,44.',
          },
          insight: 'Quanto maior a taxa ou o prazo, menos vale hoje um valor futuro.',
        }),
        key('Valor presente e taxa', 'C = M ÷ (1 + i)ⁿ. Taxa: 1 + i = raiz de índice n de (M ÷ C). Juros só do k-ésimo período: C · (1 + i)^(k−1) · i.'),
        example('Quanto aplicar hoje?', 'Uma escola quer ter R$ 13.310,00 daqui a 3 anos, numa aplicação de 10% ao ano, juros compostos. Quanto deve aplicar hoje?', [
          step('Fator:', '1,1³ = 1,331'),
          askStep('C × 1,331 = 13.310.', 'Quanto é C?', [
            ok('13.310 ÷ 1,331 = R$ 10.000,00'),
            no('13.310 × 0,7 = R$ 9.317,00', 'Tirar 30% não desfaz juros compostos. Divida pelo fator: 13.310 ÷ 1,331.'),
          ]),
        ], 'A escola deve aplicar R$ 10.000,00.'),
        example('Os juros do 3º ano', 'Uma aplicação de R$ 5.000,00 rende 20% ao ano, juros compostos. Quanto ela rende só no 3º ano?', [
          step('Saldo no início do 3º ano:', '5.000 × 1,2² = R$ 7.200,00'),
          askStep('Juros do 3º ano.', 'Quanto são?', [
            ok('20% de 7.200 = R$ 1.440,00'),
            no('20% de 5.000 = R$ 1.000,00', 'Esses são os juros do 1º ano. No 3º, a taxa incide sobre o saldo acumulado: R$ 7.200,00.'),
          ]),
        ], 'No 3º ano, a aplicação rende R$ 1.440,00.'),
        check(numeric({
          prompt: [p('Uma conta começou com R$ 5.000,00 e chegou a R$ 5.512,50 depois de 2 anos, sem movimentações, com taxa anual composta constante.')],
          ask: 'Qual foi a taxa anual?',
          unit: '%',
          answer: 5,
          wrong: [
            { value: 5.13, feedback: 'Isso divide o crescimento total (10,25%) por 2, como em juros simples. Em compostos: √1,1025 = 1,05.' },
            { value: 10.25, feedback: '10,25% é o crescimento nos 2 anos. A taxa anual é √1,1025 − 1 = 5%.' },
          ],
          solution: ['$5.512,50 ÷ 5.000 = 1,1025', '$√1,1025 = 1,05 → 5% ao ano'],
        })),
      ],
      practice: [gen(pvGen), gen(rateFromGen), gen(periodsFromGen), gen(yearInterestGen)],
      challenge: [gen(pvGen), gen(rateFromGen), gen(initialFromInterestGen), gen(payLaterGen)],
      recap: [
        'Valor presente: C = M ÷ (1 + i)ⁿ.',
        'Taxa: raiz de M ÷ C.',
        'Juros do k-ésimo período: saldo no início dele × i.',
      ],
    })),

    stage('tempo', 'aprofundamento', 'Quanto tempo leva?', 'Encontrar o número de períodos para um capital atingir uma meta usando tabelas de potências, logaritmos ou a regra do 72.', () => ({
      learn: [
        text('Para saber **quando** um capital chega a uma meta, procure o menor n com (1 + i)ⁿ ≥ M ÷ C. Use uma **tabela** de potências, **logaritmos** — n = log(M ÷ C) ÷ log(1 + i) — ou, para estimar o tempo de **duplicação**, a **regra do 72**: n ≈ 72 ÷ (taxa em %).'),
        lab({
          title: 'Regra do 72',
          intro: 'Escolha uma taxa anual. Compare o tempo exato de duplicação com a estimativa da regra do 72.',
          params: [{ key: 'i', label: 'Taxa ao ano', min: 2, max: 24, step: 1, value: 6, format: (v) => pct(v) }],
          readouts: ({ i }) => [
            { label: 'Tempo exato para dobrar', value: `${num(Math.log(2) / Math.log(1 + i / 100), 2)} anos` },
            { label: 'Regra do 72', value: `${num(72 / i, 2)} anos`, big: true, tone: 'brass' },
            { label: 'Juros simples (100 ÷ taxa)', value: `${num(100 / i, 2)} anos` },
          ],
          viz: ({ i }) => ({
            kind: 'bars',
            bars: [
              { label: 'Exato', value: Math.log(2) / Math.log(1 + i / 100), text: num(Math.log(2) / Math.log(1 + i / 100), 1), tone: 'verdigris' },
              { label: 'Regra do 72', value: 72 / i, text: num(72 / i, 1), tone: 'brass' },
              { label: 'Simples', value: 100 / i, text: num(100 / i, 1), tone: 'mist' },
            ],
            summary: `A ${pct(i)} ao ano, o capital dobra em cerca de ${num(Math.log(2) / Math.log(1 + i / 100), 1)} anos; a regra do 72 estima ${num(72 / i, 1)}`,
          }),
          goal: {
            task: 'Ache a taxa para a qual a regra do 72 indica exatamente 9 anos.',
            done: ({ i }) => i === 8,
            success: 'Isso: 72 ÷ 8 = 9. O valor exato é log 2 ÷ log 1,08 ≈ 9,01 anos: a regra é ótima nessa faixa de taxas.',
          },
          insight: 'A regra do 72 funciona bem para taxas entre 4% e 15%; fora disso, o erro cresce.',
        }),
        key('Tempo com logaritmos', 'n = log(M ÷ C) ÷ log(1 + i). Se n não for inteiro, a meta só é atingida no período seguinte: arredonde para cima. Para "ainda menor que", arredonde para baixo.'),
        example('Com tabela', [
          p('Um capital de R$ 3.000,00 rende 6% ao ano, juros compostos. Quando o saldo passa a valer, no mínimo, R$ 4.500,00?'),
          table(['n', '1,06ⁿ (aprox.)'], [['5', '1,338'], ['6', '1,419'], ['7', '1,504'], ['8', '1,594']]),
        ], [
          step('Meta em fator:', '4.500 ÷ 3.000 = 1,5'),
          askStep('Procure o primeiro 1,06ⁿ ≥ 1,5.', 'Qual é n?', [
            ok('n = 7 (1,504)'),
            no('n = 6 (1,419)', 'Com 6 anos, o fator 1,419 ainda não chega a 1,5.'),
          ]),
        ], 'O saldo atinge R$ 4.500,00 no 7º ano.'),
        example('Com logaritmos', 'Uma dívida cresce 5% ao mês, juros compostos. A partir de quantos meses inteiros ela passa do dobro? Use log 2 ≈ 0,301 e log 1,05 ≈ 0,0212.', [
          step('A meta em fator:', '1,05ⁿ = 2 → n · log 1,05 = log 2'),
          askStep('Isole n: n = log 2 ÷ log 1,05.', 'Quanto dá?', [
            ok('0,301 ÷ 0,0212 ≈ 14,2 → 15 meses'),
            no('2 ÷ 0,05 = 40 meses', 'Isso nem é a conta de juros simples (seria 1 ÷ 0,05 = 20). Em compostos, use logaritmos: n = log 2 ÷ log 1,05.'),
          ]),
        ], 'A dívida passa do dobro no 15º mês (1,05¹⁴ ≈ 1,98 e 1,05¹⁵ ≈ 2,08).'),
        check(numeric({
          prompt: [p('Pela regra do 72, um capital aplicado a juros compostos dobra em cerca de 72 ÷ (taxa anual em %) anos.')],
          ask: 'Em quantos anos, aproximadamente, dobra um capital aplicado a 12% ao ano?',
          unit: 'anos',
          answer: 6,
          wrong: [
            { value: 8.33, feedback: 'Isso é 100 ÷ 12, o tempo para dobrar em juros SIMPLES. Pela regra do 72: 72 ÷ 12.' },
            { value: 864, feedback: 'Isso multiplica 72 por 12. A regra divide: 72 ÷ 12.' },
          ],
          solution: ['$72 ÷ 12 = 6 anos'],
        })),
      ],
      practice: [gen(tableTimeGen), gen(logTimeGen), gen(rule72Gen)],
      challenge: [
        gen(tableTimeGen),
        gen(logTimeGen),
        gen(rule72Gen),
        numeric({
          prompt: [p('Um capital é aplicado a 8% ao ano, sem depósitos nem retiradas. Em cada regime, o tempo de duplicação é o menor número inteiro de anos ao fim do qual o montante é maior ou igual ao dobro. Use 1,08⁹ ≈ 1,999 e 1,08¹⁰ ≈ 2,159.')],
          ask: 'Em juros compostos, quantos anos antes o capital dobra, em comparação com juros simples?',
          unit: 'anos',
          answer: 3,
          wrong: [
            { value: 4, feedback: 'Isso usa 9 anos para os compostos, mas 1,08⁹ ≈ 1,999 ainda não chega ao dobro: são 10 anos. Em simples, 13 anos (8% × 13 = 104%).' },
            { value: 2.5, feedback: 'Isso usa 12,5 anos para os juros simples. O prazo é um número inteiro: 13 anos (8% × 12 = 96% ainda não basta).' },
            { value: 10, feedback: '10 anos é o tempo nos juros compostos. A pergunta é a diferença para os 13 anos dos juros simples.' },
          ],
          solution: ['$Simples: 0,08 × n ≥ 1 → n ≥ 12,5 → 13 anos', '$Compostos: 1,08¹⁰ ≈ 2,159 ≥ 2 → 10 anos', '$Diferença: 3 anos'],
        }),
      ],
      recap: [
        'Meta: menor n com (1 + i)ⁿ ≥ M ÷ C.',
        'Logaritmos: n = log(M ÷ C) ÷ log(1 + i).',
        'Regra do 72: dobrar leva cerca de 72 ÷ taxa.',
      ],
    })),

    stage('maestria', 'maestria', 'Maestria: juros compostos nos problemas difíceis', 'Resolver problemas inéditos que combinam montante, valor presente, taxas equivalentes, comparação de regimes e tempo.', () => ({
      learn: [
        strategy('Escolha a ferramenta', '1) Montante ou valor presente: M = C · (1 + i)ⁿ, ou C = M ÷ (1 + i)ⁿ. 2) Taxas de períodos diferentes: converta pela potência ou pela raiz. 3) Tempo: tabela, logaritmo ou regra do 72. 4) Compare regimes e propostas pelo montante final.'),
        example('Da taxa de 2 anos para 3 anos', 'Uma aplicação rendeu 69% em 2 anos, juros compostos com taxa anual fixa. Quanto renderão R$ 8.000,00 por 3 anos, nas mesmas condições?', [
          step('Fator de 2 anos:', '1,69 → fator anual √1,69 = 1,3 (30% ao ano)'),
          askStep('Agora, 3 anos.', 'Qual é o montante?', [
            ok('8.000 × 1,3³ = 8.000 × 2,197 = R$ 17.576,00'),
            no('8.000 × (1 + 1,5 × 0,69) = R$ 16.280,00', 'Proporção vale para juros simples. Em compostos, descubra a taxa anual (30%) e eleve ao cubo.'),
          ]),
        ], 'O montante será R$ 17.576,00, um rendimento de R$ 9.576,00.'),
        reveal('Por que os juros compostos "aceleram"?', 'Porque cada período rende sobre um saldo maior que o anterior. Os juros de cada período formam uma progressão geométrica de razão (1 + i): por isso o gráfico do montante é uma curva exponencial, e não uma reta.'),
        check(numeric({
          prompt: [p('Uma pessoa precisa ter R$ 6.050,00 daqui a 2 anos, numa aplicação de 10% ao ano, juros compostos, sem depósitos nem retiradas.')],
          ask: 'Quanto deve aplicar hoje?',
          prefix: 'R$',
          answer: 5000,
          wrong: [
            { value: 4840, feedback: 'Isso tira 20% de R$ 6.050,00. Em compostos, divida pelo fator: 6.050 ÷ 1,21.' },
            { value: 5041.67, feedback: 'Isso divide por 1,2 (juros simples). Em compostos: 6.050 ÷ 1,1² = 6.050 ÷ 1,21.' },
            { value: 5500, feedback: 'Isso desconta só um ano (6.050 ÷ 1,1). São 2 anos.' },
          ],
          solution: ['$6.050 ÷ 1,21 = 5.000'],
        })),
      ],
      practice: [gen(compoundGen), gen(equivRateGen), gen(pvGen)],
      challenge: [gen(rateFromGen), gen(compareRatesGen), gen(logTimeGen), gen(mixedRegimeGen)],
      recap: [
        'Montante: × (1 + i)ⁿ; valor presente: ÷ (1 + i)ⁿ.',
        'Converta as taxas antes de comparar.',
        'Tempo: tabela, logaritmo ou regra do 72.',
      ],
    })),
  ],
});
