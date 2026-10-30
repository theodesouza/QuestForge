/**
 * Aula: Porcentagem — partes de cem e cálculo de p% de um valor, parte e todo (a base da
 * porcentagem, descobrir o todo), descontos, acréscimos, complementos e limites mínimos,
 * porcentagens encadeadas (e o caminho inverso), misturas, médias ponderadas, totais que
 * mudam e secagens.
 */
import {
  askStep,
  check,
  classify,
  draftNumeric,
  example,
  gen,
  gridCells,
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
  tip,
  warn,
} from '../../kit/build';
import { brl, frac, num, round } from '../../kit/format';
import type { Rand } from '../../types';

const ceil = (x: number) => Math.ceil(x - 1e-9);
const floor = (x: number) => Math.floor(x + 1e-9);
const isInt = (x: number) => Number.isInteger(round(x, 9));
const pct = (x: number, d = 2) => `${num(x, d)}%`;

// ———————————————————————————————————————————————— geradores

interface PctCtx {
  prompt: (pc: number, v: number) => string;
  ask: string;
  prefix?: string;
  unit?: string;
  values: number[];
  pcts: number[];
}

const PCT_OF: PctCtx[] = [
  { prompt: (pc, v) => `Um vendedor recebe ${pct(pc)} de comissão sobre cada venda. Ele vendeu um carro por ${brl(v)}.`, ask: 'Qual foi o valor da comissão?', prefix: 'R$', values: [42000, 56000, 64000, 78000, 95000], pcts: [2, 3, 4, 5, 7] },
  { prompt: (pc, v) => `Uma escola tem ${num(v)} estudantes, e ${pct(pc)} deles praticam algum esporte na própria escola.`, ask: 'Quantos estudantes praticam esporte na escola?', unit: 'estudantes', values: [300, 420, 480, 640, 850, 1200], pcts: [15, 20, 35, 45, 55, 65] },
  { prompt: (pc, v) => `Um empregador deposita mensalmente ${pct(pc)} do salário de uma funcionária numa conta de previdência. O salário é de ${brl(v)}.`, ask: 'Qual é o valor depositado por mês?', prefix: 'R$', values: [1800, 2400, 3200, 3600, 4500], pcts: [5, 6, 9, 10, 12] },
  { prompt: (pc, v) => `Uma garrafa de ${num(v / 1000, 2)} L de suco tem ${pct(pc)} de polpa de fruta, em volume.`, ask: 'Quantos mililitros de polpa há na garrafa?', unit: 'mL', values: [500, 1000, 2000, 2500], pcts: [8, 15, 20, 25, 35] },
];

/** p% de um valor. */
function pctOfGen(r: Rand) {
  for (;;) {
    const c = r.pick(PCT_OF);
    const v = r.pick(c.values);
    const pc = r.pick(c.pcts);
    const ans = (v * pc) / 100;
    if (!isInt(ans * 100)) continue;
    return draftNumeric({
      prompt: [p(c.prompt(pc, v))],
      ask: c.ask,
      prefix: c.prefix,
      unit: c.unit,
      answer: ans,
      wrong: [
        { value: v * pc, feedback: `${pct(pc)} são ${pc} CENTÉSIMOS: multiplique por ${num(pc / 100, 2)}, e não por ${pc}.` },
        { value: ans / 10, feedback: 'Um zero a menos: confira a conta (p% = p ÷ 100).' },
        { value: v - ans, feedback: `Esse é o complemento (${100 - pc}%). A pergunta é sobre os ${pct(pc)}.` },
        { value: round(v / pc, 2), feedback: `Dividir por ${pc} não calcula ${pct(pc)}: multiplique por ${num(pc / 100, 2)}.` },
      ],
      hints: [`${pct(pc)} = ${pc}/100 = ${num(pc / 100, 2)}.`, `Multiplique: ${num(v)} × ${num(pc / 100, 2)}.`],
      solution: [`$${num(v)} × ${num(pc / 100, 2)} = ${num(ans, 2)}`],
    });
  }
}

/** Que porcentagem a parte representa do todo. */
function ratioPctGen(r: Rand) {
  for (;;) {
    const total = r.pick([20, 25, 40, 50, 60, 80, 120, 150, 200, 250, 400, 500, 640, 800]);
    const pc = r.pick([5, 7.5, 12.5, 15, 20, 24, 30, 35, 40, 45, 60, 65, 72, 75, 85]);
    const part = (total * pc) / 100;
    if (!isInt(part) || part < 4 || (total === 24 && part === 18) || (total === 800 && part === 280)) continue;
    const ctx = r.int(0, 2);
    if (ctx === 2 && total < 80) continue;
    const prompt =
      ctx === 0
        ? `Num simulado com ${total} questões, uma estudante acertou ${part}.`
        : ctx === 1
          ? `Uma fábrica produziu ${total} peças, das quais ${part} apresentaram defeito.`
          : `Um livro tem ${total} páginas, e Rui já leu ${part} delas.`;
    const ask = ctx === 0 ? 'Qual foi o percentual de acertos?' : ctx === 1 ? 'Que percentual das peças apresentou defeito?' : 'Que percentual do livro Rui já leu?';
    return draftNumeric({
      prompt: [p(prompt)],
      ask,
      unit: '%',
      answer: pc,
      wrong: [
        { value: part, feedback: `${part} é a quantidade, não o percentual. Divida pelo total: ${part} ÷ ${total}.` },
        { value: 100 - pc, feedback: `Esse é o percentual do complemento (o que sobra). A pergunta é sobre a parte de ${part}.` },
        { value: round((total / part) * 100, 2), feedback: 'A razão ficou invertida: percentual = parte ÷ todo × 100.' },
      ],
      hints: ['Percentual = parte ÷ todo × 100.', `${part} ÷ ${total} = ${num(part / total, 4)}.`],
      solution: [`$${part} ÷ ${total} = ${num(part / total, 4)} = ${pct(pc)}`],
    });
  }
}

/** A base da porcentagem: lucro sobre o custo ou sobre o preço; taxa sobre o total. */
function baseGen(r: Rand) {
  for (;;) {
    if (r.next() < 0.5) {
      const cost = r.pick([40, 60, 80, 120, 150, 160, 200, 240]);
      const markup = r.pick([20, 25, 30, 40, 50, 60, 75]);
      const price = (cost * (100 + markup)) / 100;
      if (!isInt(price) || (cost === 140 && price === 200)) continue;
      const onPrice = r.next() < 0.4;
      const profit = price - cost;
      const answer = onPrice ? round((profit / price) * 100, 2) : markup;
      return draftNumeric({
        prompt: [p(`Um artesão gasta ${brl(cost)} para produzir uma peça e a vende por ${brl(price)}, sem outras despesas.`)],
        ask: onPrice ? 'O lucro representa que percentual do PREÇO de venda? Arredonde a duas casas decimais.' : 'Qual é o lucro, em porcentagem do CUSTO?',
        unit: '%',
        answer,
        wrong: [
          { value: onPrice ? markup : round((profit / price) * 100, 2), feedback: onPrice ? `Essa é a porcentagem sobre o CUSTO (${num(profit)} ÷ ${num(cost)}). A pergunta usa o preço como base.` : `Essa é a porcentagem sobre o PREÇO (${num(profit)} ÷ ${num(price)}). A pergunta usa o custo como base.` },
          { value: profit, feedback: `${num(profit)} é o lucro em REAIS. Divida pela base para ter a porcentagem.` },
          { value: round((cost / price) * 100, 2), feedback: 'Essa é a parte do preço que cobre o custo, não o lucro.' },
        ],
        hints: [`Lucro: ${num(price)} − ${num(cost)} = ${num(profit)}.`, `Base: o ${onPrice ? 'preço' : 'custo'}. Divida o lucro por ela.`],
        solution: [`$Lucro: ${num(profit)}; ${num(profit)} ÷ ${num(onPrice ? price : cost)} = ${pct(answer)}`],
      });
    }
    const base = r.pick([80, 100, 120, 150, 200, 250, 300, 400]);
    const fee = r.pick([10, 12, 15, 20, 25, 30]);
    if (base === 150 && fee === 20) continue; // questão do banco
    const charge = (base * fee) / 100;
    const total = base + charge;
    const answer = round((charge / total) * 100, 2);
    return draftNumeric({
      prompt: [p(`Uma taxa de entrega de ${pct(fee)} é acrescentada ao valor de ${brl(base)} de uma compra. O cliente paga ${brl(total)} no total.`)],
      ask: 'A taxa representa que percentual do TOTAL pago? Arredonde a duas casas decimais.',
      unit: '%',
      answer,
      wrong: [
        { value: fee, feedback: `${pct(fee)} é a taxa sobre o valor da COMPRA. Sobre o total pago: ${num(charge, 2)} ÷ ${num(total, 2)}.` },
        { value: charge, feedback: `${num(charge, 2)} é a taxa em REAIS. Divida pelo total pago.` },
      ],
      hints: [`Taxa em reais: ${pct(fee)} de ${num(base)} = ${num(charge, 2)}.`, `Base agora: o total pago, ${num(total, 2)}.`],
      solution: [`$${num(charge, 2)} ÷ ${num(total, 2)} = ${pct(answer)}`],
    });
  }
}

/** Do pedaço ao todo: se a parte é p%, o todo é parte ÷ (p/100). */
function wholeFromPartGen(r: Rand) {
  for (;;) {
    const pc = r.pick([12, 15, 16, 20, 24, 25, 30, 35, 40, 45, 60, 75, 80]);
    const total = r.pick([400, 500, 600, 800, 1000, 1200, 1500, 2000, 2400, 3000, 5000, 6000, 8000]);
    const part = (total * pc) / 100;
    if (!isInt(part) || (part === 240 && pc === 16) || (part === 7200 && pc === 60)) continue;
    const askRest = r.next() < 0.45;
    return draftNumeric({
      prompt: [p(askRest ? `Uma campanha já arrecadou ${brl(part)}, valor que corresponde a ${pct(pc)} da meta.` : `Um depósito liberou ${num(part)} caixas, o que corresponde a ${pct(pc)} do estoque que havia antes da liberação.`)],
      ask: askRest ? 'Quanto falta arrecadar para atingir a meta?' : 'Quantas caixas havia no estoque antes da liberação?',
      prefix: askRest ? 'R$' : undefined,
      unit: askRest ? undefined : 'caixas',
      answer: askRest ? total - part : total,
      wrong: [
        { value: round((part * pc) / 100, 2), feedback: `Isso calcula ${pct(pc)} DE ${num(part)}. Aqui ${num(part)} já são os ${pct(pc)}: divida por ${num(pc / 100, 2)}.` },
        ...(askRest
          ? [
              { value: total, feedback: `${brl(total)} é a meta inteira. Já foram arrecadados ${brl(part)}.` },
              { value: round((part * (100 - pc)) / 100, 2), feedback: `Isso calcula ${100 - pc}% do arrecadado. Os ${100 - pc}% que faltam são da META.` },
            ]
          : [
              { value: total - part, feedback: `${num(total - part)} é o que SOBROU depois da liberação. Antes havia ${num(total)}.` },
              { value: part * pc, feedback: 'Multiplicar pela porcentagem não leva ao todo. Divida a parte pela porcentagem (em decimal).' },
            ]),
      ],
      hints: [`Se ${pct(pc)} valem ${num(part)}, 1% vale ${num(part)} ÷ ${pc}.`, `O todo (100%): ${num(part / pc, 2)} × 100.`],
      solution: [`$Todo: ${num(part)} ÷ ${num(pc / 100, 2)} = ${num(total)}`, ...(askRest ? [`$Falta: ${num(total)} − ${num(part)} = ${num(total - part)}`] : [])],
    });
  }
}

/** Desconto ou acréscimo; ou o preço original a partir do final. */
function discountGen(r: Rand) {
  for (;;) {
    const price = r.pick([60, 80, 120, 150, 160, 200, 240, 250, 300, 400, 480]);
    const pc = r.pick([5, 10, 12, 15, 20, 25, 30, 35, 40]);
    const up = r.next() < 0.3;
    const f = up ? 1 + pc / 100 : 1 - pc / 100;
    const final = price * f;
    if (!isInt(final * 100)) continue;
    if ((price === 80 && pc === 25 && !up) || (price === 200 && pc === 15 && !up)) continue; // questões do banco
    if (r.next() < 0.5) {
      return draftNumeric({
        prompt: [p(up ? `Um serviço de ${brl(price)} recebe um acréscimo de ${pct(pc)} por ser feito no fim de semana.` : `Uma loja dá ${pct(pc)} de desconto numa mochila de ${brl(price)}.`)],
        ask: up ? 'Qual é o valor final do serviço?' : 'Quanto o cliente paga, com o desconto?',
        prefix: 'R$',
        answer: final,
        wrong: [
          { value: (price * pc) / 100, feedback: `${brl((price * pc) / 100)} é o valor do ${up ? 'acréscimo' : 'desconto'}, não o preço final.` },
          { value: up ? price - pc : price - pc, feedback: `Isso ${up ? 'mexe em' : 'tira'} ${pc} REAIS. São ${pc} POR CENTO: ${pct(pc)} de ${num(price)} = ${num((price * pc) / 100, 2)}.` },
          { value: price * (up ? 1 - pc / 100 : 1 + pc / 100), feedback: `Isso aplica um ${up ? 'desconto' : 'acréscimo'}, ao contrário do enunciado.` },
        ],
        hints: [`${up ? 'Acréscimo' : 'Desconto'} de ${pct(pc)}: pague ${100 + (up ? pc : -pc)}% do preço.`, `Multiplique pelo fator: ${num(price)} × ${num(f, 2)}.`],
        solution: [`$${num(price)} × ${num(f, 2)} = ${num(final, 2)}`],
      });
    }
    return draftNumeric({
      prompt: [p(`Numa liquidação, uma jaqueta foi vendida por ${brl(final)} depois de um desconto de ${pct(pc)} sobre o preço original.`)],
      ask: 'Qual era o preço original da jaqueta?',
      prefix: 'R$',
      answer: price,
      wrong: [
        { value: round(final * (1 + pc / 100), 2), feedback: `Somar ${pct(pc)} ao preço com desconto não desfaz o desconto: os ${pct(pc)} eram sobre o preço ORIGINAL. Divida por ${num(f, 2)}.` },
        { value: round(final * f, 2), feedback: 'Isso aplica o desconto de novo. Para voltar ao original, divida pelo fator.' },
        { value: final + pc, feedback: `Somar ${pc} reais não desfaz um desconto de ${pc} POR CENTO.` },
      ],
      hints: [`Com desconto de ${pct(pc)}, o preço final é ${100 - pc}% do original.`, `Original = ${num(final, 2)} ÷ ${num(f, 2)}.`],
      solution: [`$${num(final, 2)} ÷ ${num(f, 2)} = ${num(price, 2)}`],
    });
  }
}

/** O que sobra: depois de usar p%, ou o complemento de várias porcentagens. */
function complementGen(r: Rand) {
  for (;;) {
    if (r.next() < 0.5) {
      const N = r.pick([200, 400, 500, 600, 800, 1000, 1200, 1500]);
      const a = r.pick([25, 30, 35, 40, 45, 50]);
      const b = r.pick([15, 20, 25, 30, 35]);
      const c = 100 - a - b;
      if (c <= 0 || (N === 500 && a === 42 && b === 38)) continue;
      const ans = (N * c) / 100;
      if (!isInt(ans)) continue;
      return draftNumeric({
        prompt: [p(`Numa enquete com ${num(N)} pessoas, ${pct(a)} preferiram o horário da manhã e ${pct(b)} preferiram a tarde. As demais preferiram a noite, e cada pessoa escolheu um só horário.`)],
        ask: 'Quantas pessoas preferiram a noite?',
        unit: 'pessoas',
        answer: ans,
        wrong: [
          { value: (N * a) / 100, feedback: 'Esse é o número de pessoas que preferiram a MANHÃ.' },
          { value: (N * b) / 100, feedback: 'Esse é o número de pessoas que preferiram a TARDE.' },
          { value: c, feedback: `${c}% é a porcentagem da noite. Aplique-a às ${num(N)} pessoas.` },
        ],
        hints: [`Noite: 100% − ${a}% − ${b}% = ${c}%.`, `Agora calcule ${c}% de ${num(N)}.`],
        solution: [`$100 − ${a} − ${b} = ${c}%`, `$${c}% de ${num(N)} = ${num(ans)}`],
      });
    }
    const N = r.pick([400, 640, 800, 960, 1200, 1600, 2000]);
    const pc = r.pick([12.5, 15, 20, 25, 35, 40, 45]);
    const used = (N * pc) / 100;
    if (!isInt(used) || (N === 1200 && pc === 35) || (N === 640 && pc === 12.5)) continue;
    return draftNumeric({
      prompt: [p(`Uma central de triagem recebeu ${num(N)} kg de resíduos. Desse total, ${pct(pc, 1)} não pode ser reciclado; o restante será reaproveitado.`)],
      ask: 'Quantos quilogramas podem ser reaproveitados?',
      unit: 'kg',
      answer: N - used,
      wrong: [
        { value: used, feedback: `${num(used)} kg é a parte que NÃO pode ser reciclada. O reaproveitável é o restante.` },
        { value: N - pc, feedback: `Isso tira ${num(pc, 1)} QUILOS. São ${pct(pc, 1)} do total: ${num(used)} kg.` },
      ],
      hints: [`Sobra ${num(100 - pc, 1)}% do total.`, `Multiplique: ${num(N)} × ${num(1 - pc / 100, 3)}.`],
      solution: [`$${num(N)} × ${num(1 - pc / 100, 3)} = ${num(N - used)} kg`],
    });
  }
}

/** "Pelo menos p% de N": o resultado sobe para o próximo inteiro. */
function thresholdGen(r: Rand) {
  for (;;) {
    const N = r.int(30, 220);
    const pc = r.pick([55, 60, 62, 65, 66, 70, 75, 80]);
    const need = (N * pc) / 100;
    if (isInt(need) || (N === 145 && pc === 62)) continue;
    return draftNumeric({
      prompt: [p(`Um conselho tem ${N} integrantes. Para aprovar uma proposta, são necessários votos favoráveis de pelo menos ${pct(pc)} de todos os integrantes.`)],
      ask: 'Qual é o menor número de votos favoráveis que aprova a proposta?',
      unit: 'votos',
      answer: ceil(need),
      wrong: [
        { value: floor(need), feedback: `${floor(need)} votos ficam abaixo de ${pct(pc)} (${pct((floor(need) / N) * 100)}). "Pelo menos" pede arredondar ${num(need, 2)} para CIMA.` },
        { value: round(need, 2), feedback: `${num(need, 2)} é o valor exato; votos são inteiros: arredonde para cima.` },
      ],
      hints: [`${pct(pc)} de ${N} = ${num(need, 2)}.`, '"Pelo menos": o número de votos precisa alcançar esse valor.'],
      solution: [`$${num(pc / 100, 2)} × ${N} = ${num(need, 2)} → ${ceil(need)} votos`],
    });
  }
}

/** Porcentagens encadeadas: cada uma vale sobre o que sobrou da anterior. */
function chainGen(r: Rand) {
  for (;;) {
    const N = r.pick([200, 250, 300, 400, 500, 600, 800, 1000, 2000, 5000]);
    const a = r.pick([20, 25, 30, 40, 50, 60, 75, 80]);
    const b = r.pick([10, 15, 20, 25, 30, 40, 50, 60]);
    if (N === 250 && a === 40 && b === 30) continue; // questão do banco
    const first = (N * a) / 100;
    const ans = (first * b) / 100;
    if (!isInt(first) || !isInt(ans)) continue;
    return draftNumeric({
      prompt: [p(`Um centro cultural tem ${num(N)} participantes, dos quais ${pct(a)} fazem teatro. Entre os participantes do teatro, ${pct(b)} também fazem música.`)],
      ask: 'Quantas pessoas fazem teatro e música?',
      unit: 'pessoas',
      answer: ans,
      wrong: [
        { value: (N * b) / 100, feedback: `Isso aplica os ${pct(b)} a todos os participantes. Eles valem só para os ${num(first)} do teatro.` },
        { value: first, feedback: `${num(first)} é o número de pessoas do TEATRO. Dessas, ${pct(b)} fazem música.` },
        { value: (N * (a + b)) / 100, feedback: 'Somar as porcentagens não serve: a segunda vale sobre o grupo do teatro. Multiplique.' },
      ],
      hints: [`Teatro: ${pct(a)} de ${num(N)} = ${num(first)}.`, `Música entre eles: ${pct(b)} de ${num(first)}.`],
      solution: [`$${num(N)} × ${num(a / 100, 2)} × ${num(b / 100, 2)} = ${num(ans)}`],
    });
  }
}

/** O caminho inverso: do resultado da cadeia ao total. */
function chainBackGen(r: Rand) {
  for (;;) {
    const N = r.pick([200, 250, 300, 400, 500, 600, 800, 1000, 1200]);
    const a = r.pick([20, 30, 40, 50, 60]);
    const b = r.pick([10, 20, 25, 50]);
    const c = r.pick([20, 40, 50, 60, 75]);
    if (a === 40 && b === 25 && c === 60) continue; // questão do banco
    const k = (a * b * c) / 1e6;
    const res = N * k;
    if (!isInt(res) || res < 2) continue;
    return draftNumeric({
      prompt: [p(`Numa seleção, ${pct(a)} das inscrições foram rejeitadas na primeira fase. Das rejeitadas, ${pct(b)} entraram com recurso e, dos recursos, ${pct(c)} foram aceitos. No fim, ${num(res)} inscrições foram aprovadas por recurso.`)],
      ask: 'Quantas inscrições havia ao todo?',
      unit: 'inscrições',
      answer: N,
      wrong: [
        { value: (N * a) / 100, feedback: `${num((N * a) / 100)} é o número de inscrições REJEITADAS. O total é ${num(res)} ÷ ${num(k, 4)}.` },
        { value: round(res / ((a + b + c) / 100), 2), feedback: 'Somar as porcentagens não serve: cada uma vale sobre o grupo anterior. Multiplique-as.' },
        { value: round(res * k, 6), feedback: 'Multiplicar pelas porcentagens anda no sentido da cadeia. Para voltar ao total, divida.' },
      ],
      hints: [`Fração aprovada por recurso: ${num(a / 100, 2)} × ${num(b / 100, 2)} × ${num(c / 100, 2)} = ${num(k, 4)} do total.`, `Total = ${num(res)} ÷ ${num(k, 4)}.`],
      solution: [`$${num(k, 4)} × N = ${num(res)} → N = ${num(N)}`],
    });
  }
}

/** Misturas e taxas conjuntas: média ponderada. */
function mixGen(r: Rand) {
  for (;;) {
    if (r.next() < 0.5) {
      const v1 = r.pick([100, 150, 200, 250, 300, 400]);
      const v2 = r.pick([100, 150, 200, 250, 300, 400]);
      const c1 = r.pick([10, 20, 25, 30, 40, 50]);
      const c2 = r.pick([5, 10, 15, 20, 60]);
      if (c1 === c2 || (v1 === 200 && c1 === 30 && v2 === 300 && c2 === 10)) continue;
      const s = (v1 * c1 + v2 * c2) / 100;
      const ans = (100 * s) / (v1 + v2);
      if (!isInt(ans * 100)) continue;
      return draftNumeric({
        prompt: [p(`Misturam-se ${v1} mL de uma solução com ${pct(c1)} de álcool e ${v2} mL de outra com ${pct(c2)} de álcool.`)],
        ask: 'Qual é a porcentagem de álcool na mistura?',
        unit: '%',
        answer: round(ans, 2),
        wrong: [
          { value: (c1 + c2) / 2, feedback: 'A média simples só vale para volumes iguais. Some o álcool de cada parte e divida pelo volume total.' },
          { value: c1 + c2, feedback: 'Porcentagens não se somam assim. Calcule os mL de álcool de cada parte.' },
          { value: round(s, 2), feedback: `${num(s, 2)} mL é o álcool da mistura. Divida pelo volume total (${v1 + v2} mL).` },
        ],
        hints: [`Álcool: ${pct(c1)} de ${v1} + ${pct(c2)} de ${v2} = ${num(s, 2)} mL.`, `Volume total: ${v1 + v2} mL.`],
        solution: [`$${num((v1 * c1) / 100, 2)} + ${num((v2 * c2) / 100, 2)} = ${num(s, 2)} mL`, `$${num(s, 2)} ÷ ${v1 + v2} = ${pct(ans)}`],
      });
    }
    const n1 = r.pick([100, 150, 200, 250, 300]);
    const n2 = r.pick([50, 100, 150, 200]);
    const t1 = r.pick([20, 30, 40, 50]);
    const t2 = r.pick([60, 70, 80, 90]);
    if (n1 === n2 || (n1 === 200 && n2 === 100 && t1 === 30 && t2 === 80)) continue;
    const ok1 = (n1 * t1) / 100;
    const ok2 = (n2 * t2) / 100;
    const ans = (100 * (ok1 + ok2)) / (n1 + n2);
    return draftNumeric({
      prompt: [p(`Numa prova, ${n1} estudantes da turma A tiveram ${pct(t1)} de aprovação, e ${n2} estudantes da turma B tiveram ${pct(t2)}. Ninguém pertence às duas turmas.`)],
      ask: 'Qual foi a taxa de aprovação conjunta? Arredonde a duas casas decimais.',
      unit: '%',
      answer: round(ans, 2),
      wrong: [
        { value: (t1 + t2) / 2, feedback: 'A média simples ignora que as turmas têm tamanhos diferentes. Some os aprovados e divida pelo total.' },
        { value: ok1 + ok2, feedback: `${num(ok1 + ok2)} é o número de aprovados. Divida por ${n1 + n2} estudantes.` },
      ],
      hints: [`Aprovados: ${pct(t1)} de ${n1} + ${pct(t2)} de ${n2} = ${num(ok1 + ok2)}.`, `Total de estudantes: ${n1 + n2}.`],
      solution: [`$${num(ok1)} + ${num(ok2)} = ${num(ok1 + ok2)} aprovados`, `$${num(ok1 + ok2)} ÷ ${n1 + n2} = ${pct(ans)}`],
    });
  }
}

/** O total muda: entram ou saem itens e a porcentagem se recalcula. */
function changeTotalGen(r: Rand) {
  for (;;) {
    const kind = r.int(0, 2);
    if (kind === 0) {
      const N = r.pick([40, 50, 60, 80, 100, 120]);
      const pc = r.pick([10, 20, 25, 30, 40]);
      const add = r.pick([5, 10, 15, 20, 30]);
      if (N === 40 && pc === 25 && add === 10) continue; // questão do banco
      const had = (N * pc) / 100;
      const ans = (100 * (had + add)) / (N + add);
      if (!isInt(had) || !isInt(ans * 100)) continue;
      return draftNumeric({
        prompt: [p(`Dos ${N} integrantes de um coral, ${pct(pc)} são tenores. Entram mais ${add} integrantes, todos tenores, e ninguém sai.`)],
        ask: 'Qual passa a ser o percentual de tenores no coral? Arredonde a duas casas decimais.',
        unit: '%',
        answer: round(ans, 2),
        wrong: [
          { value: round((100 * (had + add)) / N, 2), feedback: `Isso divide pelo total ANTIGO. Agora o coral tem ${N + add} integrantes.` },
          { value: pc + add, feedback: `Somar ${add} pontos ao percentual não faz sentido: são ${add} PESSOAS a mais.` },
        ],
        hints: [`Tenores: ${num(had)} + ${add} = ${num(had + add)}.`, `Novo total: ${N} + ${add} = ${N + add}.`],
        solution: [`$${num(had + add)} ÷ ${N + add} = ${pct(ans)}`],
      });
    }
    if (kind === 1) {
      const N = r.pick([100, 120, 160, 200, 240, 300]);
      const pc = r.pick([15, 20, 25, 30]);
      const out = r.pick([5, 10, 15, 20]);
      const bad = (N * pc) / 100;
      if (!isInt(bad) || out >= bad || (N === 200 && pc === 20 && out === 10)) continue;
      const ans = (100 * (bad - out)) / (N - out);
      return draftNumeric({
        prompt: [p(`Um lote tem ${N} peças, das quais ${pct(pc)} estão com defeito. A equipe remove ${out} peças defeituosas e nenhuma peça boa.`)],
        ask: 'Qual é o novo percentual de peças com defeito? Arredonde a duas casas decimais.',
        unit: '%',
        answer: round(ans, 2),
        wrong: [
          { value: round((100 * (bad - out)) / N, 2), feedback: `Isso divide pelo total ANTIGO. O lote ficou com ${N - out} peças.` },
          { value: round((100 * bad) / (N - out), 2), feedback: `Isso esquece de tirar as ${out} defeituosas do numerador.` },
          { value: pc - out, feedback: `Subtrair ${out} pontos do percentual não faz sentido: saíram ${out} PEÇAS.` },
        ],
        hints: [`Defeituosas: ${num(bad)} − ${out} = ${num(bad - out)}.`, `Novo total: ${N} − ${out} = ${N - out}.`],
        solution: [`$${num(bad - out)} ÷ ${N - out} = ${pct(ans)}`],
      });
    }
    const good = r.pick([60, 80, 90, 100, 120, 150]);
    const bad = r.pick([10, 15, 20, 30]);
    const target = r.pick([4, 5, 8, 10, 12, 15]);
    const total = (bad * 100) / target;
    const add = total - good - bad;
    if (!isInt(total) || add <= 0 || (good === 120 && bad === 30 && target === 15)) continue;
    return draftNumeric({
      prompt: [p(`Uma fábrica tem ${good} peças aprovadas e ${bad} reprovadas. Serão acrescentadas apenas peças aprovadas até que as reprovadas representem exatamente ${pct(target)} do novo total.`)],
      ask: 'Quantas peças aprovadas devem ser acrescentadas?',
      unit: 'peças',
      answer: add,
      wrong: [
        { value: total, feedback: `${num(total)} é o NOVO TOTAL de peças. Já há ${good + bad}: acrescentam-se ${num(add)}.` },
        { value: round(((good + bad) * target) / 100, 2), feedback: `Isso calcula ${pct(target)} do total atual. As ${bad} reprovadas é que devem ser ${pct(target)} do novo total.` },
      ],
      hints: [`As ${bad} reprovadas serão ${pct(target)} do total: total = ${bad} ÷ ${num(target / 100, 2)}.`, `Desconte as ${good + bad} peças que já existem.`],
      solution: [`$Novo total: ${bad} ÷ ${num(target / 100, 2)} = ${num(total)}`, `$Acrescentar: ${num(total)} − ${good + bad} = ${num(add)}`],
    });
  }
}

/** Secagem: só a água sai; a massa seca fica fixa. */
function dryGen(r: Rand) {
  for (;;) {
    const M = r.pick([50, 60, 80, 100, 120, 150, 200, 240, 300]);
    const w1 = r.pick([20, 25, 40, 50, 60, 75, 80, 90]);
    const w2 = r.pick([5, 10, 20, 25, 40, 50]);
    if (w2 >= w1 || (M === 240 && w1 === 95) || (M === 80 && w1 === 20 && w2 === 8)) continue;
    const dry = (M * (100 - w1)) / 100;
    const final = (dry * 100) / (100 - w2);
    if (!isInt(final * 100)) continue;
    const askWater = r.next() < 0.4;
    const answer = askWater ? round(M - final, 2) : round(final, 2);
    return draftNumeric({
      prompt: [p(`Um lote de ${M} kg de frutas tem ${pct(w1)} de água, em massa. Na secagem, as frutas perdem somente água, até que a água represente ${pct(w2)} da massa.`)],
      ask: askWater ? 'Quantos quilogramas de água são retirados? Arredonde a duas casas decimais.' : 'Qual é a massa final do lote? Arredonde a duas casas decimais.',
      unit: 'kg',
      answer,
      wrong: [
        { value: round((M * (100 - (w1 - w2))) / 100, 2), feedback: `Isso tira ${w1 - w2} pontos percentuais da massa inicial. A parte seca (${num(dry, 2)} kg) é que fica fixa.` },
        ...(askWater ? [{ value: round(final, 2), feedback: `${num(final, 2)} kg é a massa FINAL. A água retirada é ${M} − ${num(final, 2)}.` }] : [{ value: dry, feedback: `${num(dry, 2)} kg é só a parte seca. No final, ela é ${100 - w2}% da massa.` }]),
        { value: round((M * w2) / 100, 2), feedback: `Isso aplica ${pct(w2)} à massa inicial. Use a parte seca, que não muda.` },
      ],
      hints: [`Parte seca (não muda): ${100 - w1}% de ${M} = ${num(dry, 2)} kg.`, `No final, a parte seca é ${100 - w2}% da massa: massa = ${num(dry, 2)} ÷ ${num((100 - w2) / 100, 2)}.`],
      solution: [`$Seca: ${num(dry, 2)} kg; final: ${num(dry, 2)} ÷ ${num((100 - w2) / 100, 2)} = ${num(final, 2)} kg`, ...(askWater ? [`$Água retirada: ${M} − ${num(final, 2)} = ${num(M - final, 2)} kg`] : [])],
    });
  }
}

// ———————————————————————————————————————————————— aula

export const PORCENTAGEM = lesson({
  id: 'porcentagem',
  topic: 'porcentagem',
  subtopics: ['porcentagem-basica'],
  title: 'Porcentagem',
  summary:
    'Partes de cem: calcular p% de um valor, descobrir que porcentagem uma parte representa e qual é o todo, aplicar descontos e acréscimos, encadear porcentagens e acompanhar misturas e totais que mudam.',
  requires: ['fracoes', 'razao'],
  stages: [
    stage('sentido', 'descoberta', 'Porcentagem: partes de cem', 'Entender p% como p partes de cada 100, passar entre porcentagem, fração e decimal e calcular p% de um valor, inclusive de cabeça.', () => ({
      learn: [
        text('**Porcentagem** é uma razão com denominador 100: 35% = 35/100 = 0,35. Calcular 35% de 240 é multiplicar 240 por 0,35 = 84. Algumas são frações conhecidas: 50% = 1/2, 25% = 1/4, 20% = 1/5, 10% = 1/10.'),
        lab({
          title: 'Quadro de 100',
          intro: 'Cada quadradinho é 1% do total. Escolha a porcentagem e o valor de referência.',
          params: [
            { key: 'pc', label: 'Porcentagem', min: 0, max: 100, step: 1, value: 35, format: (v) => `${v}%` },
            { key: 'v', label: 'Valor de referência', min: 40, max: 400, step: 20, value: 240, format: (v) => num(v) },
          ],
          readouts: ({ pc, v }) => [
            { label: 'Fração', value: `${pc}/100 = ${frac(pc, 100)}` },
            { label: 'Decimal', value: num(pc / 100, 2) },
            { label: `${pc}% de ${num(v)}`, value: num((pc * v) / 100, 2), big: true, tone: 'brass' },
          ],
          viz: ({ pc }) => ({
            kind: 'grid',
            rows: 10,
            cols: 10,
            cells: gridCells(10, 10, [{ count: pc, tone: 'brass' }]),
            legend: [{ tone: 'brass', label: `${pc}%` }],
            summary: `${pc} de 100 quadradinhos destacados`,
          }),
          goal: {
            task: 'Com o valor 240, ache a porcentagem que corresponde a 60.',
            done: ({ pc, v }) => v === 240 && pc === 25,
            success: 'Isso: 60 ÷ 240 = 0,25 = 25% — um quarto do quadro.',
          },
          insight: 'O mesmo percentual vale quantidades diferentes conforme o valor de referência: 25% de 240 é 60, e 25% de 80 é 20.',
        }),
        key('Cálculo mental', '10% = dividir por 10; 5% = metade de 10%; 1% = dividir por 100. Ex.: 15% de 360 = 36 + 18 = 54.'),
        example('Proteína no iogurte', 'Um iogurte de 170 g tem 6% de proteína, em massa. Quantos gramas de proteína há nele?', [
          askStep('6% = 6/100.', 'Como calcular 6% de 170?', [
            ok('170 × 0,06'),
            no('170 × 6', '6% são 6 CENTÉSIMOS: multiplique por 0,06, e não por 6.'),
          ]),
          step('A conta:', '170 × 0,06 = 10,2 g'),
        ], 'Há 10,2 g de proteína.'),
        warn('Mesma unidade na resposta', 'Se o volume está em litros e a pergunta é em mililitros, converta: 12% de 2 L = 0,24 L = 240 mL.'),
        check(numeric({
          prompt: [p('Numa escola com 420 alunos, 15% vão de bicicleta para a aula.')],
          ask: 'Quantos alunos vão de bicicleta?',
          unit: 'alunos',
          answer: 63,
          wrong: [
            { value: 6.3, feedback: 'Um zero a menos: 15% de 420 = 0,15 × 420 = 63.' },
            { value: 357, feedback: '357 é o número de alunos que NÃO vão de bicicleta (85%).' },
            { value: 28, feedback: 'Dividir 420 por 15 não calcula 15%: multiplique por 0,15.' },
          ],
          solution: ['$420 × 0,15 = 63 alunos'],
        })),
      ],
      practice: [
        gen(pctOfGen),
        classify({
          ask: 'Leve cada valor à fração equivalente.',
          bins: ['1/2', '1/4', '1/5', '3/4'],
          items: [
            { text: '50%', bin: 0 },
            { text: '25%', bin: 1 },
            { text: '20%', bin: 2 },
            { text: '75%', bin: 3 },
            { text: '0,5', bin: 0 },
            { text: '0,2', bin: 2 },
          ],
          hints: ['p% = p/100; simplifique a fração.', '20% = 20/100 = 1/5.'],
          solution: ['50% = 0,5 = 1/2; 25% = 1/4; 20% = 0,2 = 1/5; 75% = 3/4.'],
        }),
        numeric({
          prompt: [p('Calcule de cabeça, usando 10% e 5%.')],
          ask: 'Quanto é 15% de R$ 360,00?',
          prefix: 'R$',
          answer: 54,
          wrong: [
            { value: 36, feedback: 'R$ 36,00 é só 10%. Some os 5% (metade disso): 36 + 18 = 54.' },
            { value: 18, feedback: 'R$ 18,00 é só 5%. Some os 10%: 36 + 18 = 54.' },
            { value: 24, feedback: 'Dividir 360 por 15 não calcula 15%. Use 10% (36) + 5% (18).' },
          ],
          hints: ['10% de 360 = 36.', '5% é a metade de 10%.'],
          solution: ['$10% = 36; 5% = 18; 15% = 36 + 18 = 54'],
        }),
      ],
      challenge: [
        gen(pctOfGen),
        numeric({
          prompt: [p('Um carro de R$ 64.000,00 é financiado com entrada de 35%.')],
          ask: 'Qual é o valor da entrada?',
          prefix: 'R$',
          answer: 22400,
          wrong: [
            { value: 41600, feedback: 'R$ 41.600,00 é o valor financiado (65%). A entrada é 35%.' },
            { value: 2240, feedback: 'Um zero a menos: 0,35 × 64.000 = 22.400.' },
            { value: 1828.57, feedback: 'Dividir por 35 não calcula 35%: multiplique por 0,35.' },
          ],
          solution: ['$64.000 × 0,35 = R$ 22.400,00'],
        }),
      ],
      recap: [
        'p% = p/100 (35% = 0,35).',
        'p% de um valor = valor × p/100.',
        'Atalhos: 50% = 1/2, 25% = 1/4, 20% = 1/5, 10% = 1/10.',
        'Converta unidades para responder no que foi pedido.',
      ],
    })),

    stage('parte-todo', 'fundamentos', 'Parte, todo e a base da porcentagem', 'Calcular que porcentagem uma parte representa de um todo, escolher a base certa (custo, preço, total) e descobrir o todo a partir de uma parte.', () => ({
      learn: [
        text('Para saber que porcentagem uma parte representa, divida pela **base** (o todo de referência) e multiplique por 100: 13 acertos em 20 questões = 13/20 = 0,65 = 65%. E, ao contrário, se uma parte vale p%, o todo é a parte dividida por p/100.'),
        lab({
          title: 'Qual é a base?',
          intro: 'Escolha o custo e o preço de venda de um produto. Compare o lucro como porcentagem do custo e do preço.',
          params: [
            { key: 'c', label: 'Custo', min: 50, max: 200, step: 10, value: 100, format: (v) => brl(v) },
            { key: 'pv', label: 'Preço de venda', min: 60, max: 300, step: 10, value: 150, format: (v) => brl(v) },
          ],
          readouts: ({ c, pv }) => [
            { label: 'Lucro', value: brl(pv - c) },
            { label: 'Lucro sobre o custo', value: pct(((pv - c) / c) * 100), big: true, tone: 'brass' },
            { label: 'Lucro sobre o preço', value: pct(((pv - c) / pv) * 100), tone: 'sky' },
          ],
          goal: {
            task: 'Com custo de R$ 120,00, ache o preço que dá 50% de lucro sobre o custo.',
            done: ({ c, pv }) => c === 120 && pv === 180,
            success: 'Isso: R$ 60,00 de lucro são 50% do custo — mas só 33,33% do preço de venda.',
          },
          insight: 'O mesmo lucro em reais vira porcentagens diferentes conforme a base.',
        }),
        key('A base é o todo de referência', '"Lucro sobre o custo" divide pelo custo; "a taxa representa que % do total pago" divide pelo total pago. Mesmo número, bases diferentes, porcentagens diferentes.'),
        example('Descobrir o todo', 'Uma vaquinha já arrecadou R$ 4.500,00, que são 75% da meta. Quanto falta?', [
          askStep('R$ 4.500,00 já são os 75%.', 'Como achar a meta (100%)?', [
            ok('4.500 ÷ 0,75 = 6.000'),
            no('4.500 × 0,75 = 3.375', 'Multiplicar calcula 75% DE 4.500; aqui 4.500 já é 75% da meta. Divida.'),
          ]),
          step('Falta:', '6.000 − 4.500 = R$ 1.500,00'),
        ], 'Faltam R$ 1.500,00.'),
        warn('"De quanto" é a base', 'Em "15% do acervo", o acervo é a base. Se 180 livros são 15% do acervo, o acervo é 180 ÷ 0,15 = 1.200 livros — e não 180 × 0,15.'),
        check(numeric({
          prompt: [p('Uma fábrica produziu 640 peças, e 48 tinham defeito.')],
          ask: 'Qual foi o percentual de peças com defeito?',
          unit: '%',
          answer: 7.5,
          wrong: [
            { value: 48, feedback: '48 é a quantidade de peças, não o percentual. Divida pelo total: 48 ÷ 640.' },
            { value: 13.33, feedback: 'A razão ficou invertida: percentual = parte ÷ todo × 100.' },
            { value: 92.5, feedback: '92,5% é o percentual de peças SEM defeito.' },
          ],
          solution: ['$48 ÷ 640 = 0,075 = 7,5%'],
        })),
      ],
      practice: [gen(ratioPctGen), gen(wholeFromPartGen), gen(baseGen)],
      challenge: [
        gen(ratioPctGen),
        gen(wholeFromPartGen),
        gen(baseGen),
        numeric({
          prompt: [p('A embalagem de uma granola informa que uma porção de 40 g fornece 20% do valor diário recomendado de fibras. O valor diário é proporcional à quantidade consumida.')],
          ask: 'Quantos gramas dessa granola fornecem 100% do valor diário de fibras?',
          unit: 'g',
          answer: 200,
          wrong: [
            { value: 8, feedback: '8 = 40 × 0,2 calcula 20% DA porção. Aqui, os 40 g é que correspondem a 20%.' },
            { value: 80, feedback: '80 g dariam só 40% do valor diário.' },
          ],
          solution: ['$40 g ↔ 20% → 100%: 40 ÷ 0,2 = 200 g'],
        }),
      ],
      recap: [
        'Percentual = parte ÷ todo × 100.',
        'A base é o todo de referência: custo, preço ou total pago dão porcentagens diferentes.',
        'Se a parte é p%, o todo = parte ÷ (p/100).',
      ],
    })),

    stage('descontos', 'interpretacao', 'Descontos, acréscimos e o que sobra', 'Aplicar descontos e acréscimos com o fator (1 − p) ou (1 + p), achar o que sobra, voltar ao preço original e calcular descontos em combos e limites mínimos.', () => ({
      learn: [
        text('Dar 25% de desconto é pagar 75%: preço final = preço × 0,75. Acrescentar 20% é pagar 120%: preço × 1,2. E para voltar ao preço original a partir do preço com desconto, **divida** pelo mesmo fator: R$ 102,00 depois de 15% de desconto vêm de 102 ÷ 0,85 = R$ 120,00.'),
        lab({
          title: 'Etiqueta',
          intro: 'Escolha o preço e a variação (negativa para desconto, positiva para acréscimo).',
          params: [
            { key: 'v', label: 'Preço', min: 20, max: 400, step: 10, value: 120, format: (v) => brl(v) },
            { key: 'd', label: 'Variação', min: -50, max: 50, step: 5, value: -20, format: (v) => `${v > 0 ? '+' : ''}${v}%` },
          ],
          readouts: ({ v, d }) => {
            const f = 1 + d / 100;
            return [
              { label: 'Fator', value: `× ${num(f, 2)}` },
              { label: 'Novo preço', value: brl(v * f), big: true, tone: 'brass' },
              { label: 'Para voltar ao preço inicial', value: d === 0 ? 'nada a fazer' : `× ${num(1 / f, 4)} (${d < 0 ? '+' : ''}${num((1 / f - 1) * 100, 2)}%)` },
            ];
          },
          goal: {
            task: 'Ache a variação que transforma R$ 160,00 em R$ 120,00.',
            done: ({ v, d }) => v === 160 && d === -25,
            success: 'Isso: 120 ÷ 160 = 0,75, um desconto de 25%. Para voltar a R$ 160,00, seria preciso um acréscimo de 33,33%.',
          },
          insight: 'Desconto e acréscimo de mesmo percentual não se anulam: o fator de volta é 1 ÷ fator.',
        }),
        key('Fatores', 'Desconto de p% → × (1 − p/100). Acréscimo de p% → × (1 + p/100). Para desfazer, divida pelo fator.'),
        example('Três camisetas', 'Na compra de 3 camisetas de R$ 50,00, a terceira sai com 75% de desconto. Qual é o desconto sobre o preço das três juntas?', [
          step('Preço cheio:', '3 × 50 = R$ 150,00'),
          step('Desconto em reais:', '75% de 50 = R$ 37,50'),
          askStep('Agora, sobre o total.', 'Que percentual do total é o desconto?', [
            ok('37,50 ÷ 150 = 25%'),
            no('75%', '75% vale só para UMA das três camisetas. Sobre o total: 37,50 ÷ 150.'),
          ]),
        ], 'O desconto sobre o conjunto é de 25%.'),
        warn('Mínimo é para cima', 'Se a regra pede "pelo menos 60% de 52", a conta dá 31,2 — e 31 não bastam: são precisos 32.'),
        check(numeric({
          prompt: [p('Um tênis de R$ 240,00 tem 15% de desconto.')],
          ask: 'Quanto se paga pelo tênis?',
          prefix: 'R$',
          answer: 204,
          wrong: [
            { value: 36, feedback: 'R$ 36,00 é o valor do DESCONTO. Pague 240 − 36.' },
            { value: 225, feedback: 'Tirar 15 reais não é tirar 15%: 15% de 240 = R$ 36,00.' },
            { value: 276, feedback: 'Isso aplica um ACRÉSCIMO de 15%.' },
          ],
          solution: ['$240 × 0,85 = R$ 204,00'],
        })),
      ],
      practice: [gen(discountGen), gen(complementGen), gen(thresholdGen)],
      challenge: [
        gen(discountGen),
        gen(complementGen),
        gen(thresholdGen),
        numeric({
          prompt: [p('Uma loja faz a promoção "leve 4, pague 3" em sabonetes de R$ 3,00.')],
          ask: 'Qual é o desconto efetivo sobre o preço dos 4 sabonetes?',
          unit: '%',
          answer: 25,
          wrong: [
            { value: 33.33, feedback: 'Isso compara o sabonete grátis com os 3 pagos. O desconto é sobre os 4 levados: 3 ÷ 12.' },
            { value: 75, feedback: '75% é o que se PAGA (9 de 12 reais). O desconto é de 25%.' },
          ],
          solution: ['$Preço cheio: 4 × 3 = R$ 12,00; paga-se R$ 9,00', '$Desconto: 3 ÷ 12 = 25%'],
        }),
      ],
      recap: [
        'Desconto de p%: × (1 − p/100); acréscimo de p%: × (1 + p/100).',
        'Voltar ao original: divida pelo fator.',
        'O que sobra depois de usar p%: (100 − p)%.',
        'Desconto em combos: desconto em reais ÷ preço cheio do conjunto.',
        '"Pelo menos p%": arredonde para cima.',
      ],
    })),

    stage('encadeadas', 'aplicacoes', 'Porcentagem de porcentagem', 'Encadear porcentagens (p% de q%), seguir filtros sucessivos (abstenção, votos válidos) e fazer o caminho inverso a partir do resultado final.', () => ({
      learn: [
        text('Se 60% dos sócios de um clube fazem natação e 25% desses também jogam tênis, os dois juntos são 25% de 60% = 0,25 × 0,6 = 0,15 = **15%** do total — e não 85%.'),
        lab({
          title: 'Funil',
          intro: 'Uma cidade tem 80.000 eleitores. Ajuste a porcentagem que passa em cada etapa: comparecimento, votos válidos e votos do vencedor.',
          params: [
            { key: 'a', label: 'Comparecimento', min: 50, max: 100, step: 5, value: 80, format: (v) => `${v}%` },
            { key: 'b', label: 'Votos válidos (dos que votaram)', min: 50, max: 100, step: 5, value: 95, format: (v) => `${v}%` },
            { key: 'c', label: 'Votos do vencedor (dos válidos)', min: 30, max: 90, step: 5, value: 55, format: (v) => `${v}%` },
          ],
          readouts: ({ a, b, c }) => {
            const s1 = 80000 * (a / 100);
            const s2 = s1 * (b / 100);
            const s3 = s2 * (c / 100);
            return [
              { label: 'Compareceram', value: num(s1) },
              { label: 'Votos válidos', value: num(s2) },
              { label: 'Votos do vencedor', value: num(s3), big: true, tone: 'brass' },
              { label: 'Do total de eleitores', value: pct((s3 / 80000) * 100) },
            ];
          },
          viz: ({ a, b, c }) => ({
            kind: 'bars',
            bars: [
              { label: 'Eleitores', value: 80000, text: '80.000', tone: 'parchment' },
              { label: 'Votaram', value: 800 * a, text: num(800 * a), tone: 'sky' },
              { label: 'Válidos', value: 8 * a * b, text: num(8 * a * b), tone: 'verdigris' },
              { label: 'Vencedor', value: 0.08 * a * b * c, text: num(0.08 * a * b * c), tone: 'brass' },
            ],
            summary: `O vencedor teve ${num(0.08 * a * b * c)} votos: ${pct(a * b * c / 10000)} dos eleitores`,
          }),
          goal: {
            task: 'Ajuste as etapas para que o vencedor tenha exatamente 36% de todos os eleitores.',
            done: ({ a, b, c }) => Math.abs((a * b * c) / 1e6 - 0.36) < 1e-9,
            success: 'Isso: as porcentagens se multiplicam (por exemplo, 0,8 × 0,9 × 0,5 = 0,36).',
          },
          insight: 'Cada etapa vale sobre o que sobrou da anterior: as porcentagens se multiplicam, não se somam.',
        }),
        example('A eleição', 'Uma cidade tem 50.000 eleitores. A abstenção foi de 10%; dos que votaram, 4% anularam ou votaram em branco; o vencedor teve 60% dos votos válidos. Quantos votos ele recebeu?', [
          step('Compareceram:', '90% de 50.000 = 45.000'),
          step('Válidos:', '96% de 45.000 = 43.200'),
          askStep('O vencedor teve 60%…', 'De quê?', [
            ok('Dos votos válidos: 0,6 × 43.200 = 25.920'),
            no('Dos eleitores: 0,6 × 50.000 = 30.000', 'Os 60% são dos votos VÁLIDOS, não do total de eleitores.'),
          ]),
        ], 'O vencedor recebeu 25.920 votos.'),
        key('Encadear é multiplicar', 'p% de q% de N = (p/100) × (q/100) × N. Cada porcentagem se aplica ao que sobrou da etapa anterior.'),
        tip('Caminho inverso', 'Se 24 pessoas ganharam brinde, e elas são 50% dos 20% dos 60% que responderam a uma pesquisa, então 24 = 0,5 × 0,2 × 0,6 × N = 0,06 N, e N = 400.'),
        check(numeric({
          prompt: [p('Num clube de 300 sócios, 60% fazem natação e, desses, 25% também jogam tênis.')],
          ask: 'Quantos sócios fazem natação e tênis?',
          unit: 'sócios',
          answer: 45,
          wrong: [
            { value: 75, feedback: 'Isso aplica os 25% a todos os sócios. Eles valem só para os 180 da natação.' },
            { value: 180, feedback: '180 é o número de sócios da NATAÇÃO. Desses, 25% jogam tênis.' },
            { value: 255, feedback: 'Somar as porcentagens (85%) não serve: a segunda vale sobre a natação.' },
          ],
          solution: ['$300 × 0,6 × 0,25 = 45 sócios'],
        })),
      ],
      practice: [
        gen(chainGen),
        gen(chainBackGen),
        numeric({
          prompt: [p('Uma pesquisa ouviu 2.000 pessoas: 45% disseram usar transporte público, e 40% dessas usam o metrô.')],
          ask: 'Que percentual do total de entrevistados usa o metrô?',
          unit: '%',
          answer: 18,
          wrong: [
            { value: 40, feedback: '40% é a parte do grupo de transporte público. Sobre o total: 0,45 × 0,4.' },
            { value: 85, feedback: 'Somar as porcentagens não serve: os 40% valem sobre os 45%.' },
            { value: 360, feedback: '360 é o número de pessoas, não o percentual.' },
          ],
          hints: ['O metrô é 40% DE 45%.', '0,45 × 0,4 = ?'],
          solution: ['$0,45 × 0,4 = 0,18 = 18%'],
        }),
      ],
      challenge: [
        gen(chainGen),
        gen(chainBackGen),
        numeric({
          prompt: [p('Um município tem 80.000 eleitores. A abstenção foi de 15%, e 5% dos que compareceram votaram em branco ou anularam. O candidato eleito recebeu 55% dos votos válidos.')],
          ask: 'Quantos votos recebeu o eleito?',
          unit: 'votos',
          answer: 35530,
          wrong: [
            { value: 44000, feedback: 'Isso aplica os 55% a todos os eleitores. Eles valem só sobre os votos válidos.' },
            { value: 37400, feedback: 'Isso aplica os 55% a quem compareceu, sem tirar brancos e nulos.' },
            { value: 35200, feedback: 'Isso tira 20% de uma vez (15% + 5%), mas os 5% valem sobre quem compareceu, não sobre todos os eleitores.' },
          ],
          solution: ['$80.000 × 0,85 = 68.000 compareceram; × 0,95 = 64.600 válidos', '$64.600 × 0,55 = 35.530 votos'],
        }),
      ],
      recap: [
        'p% de q% = (p/100) × (q/100): multiplique.',
        'Cada porcentagem vale sobre o que sobrou da etapa anterior.',
        'Caminho inverso: divida o resultado pelo produto das porcentagens.',
      ],
    })),

    stage('misturas', 'aprofundamento', 'Misturas, médias e totais que mudam', 'Calcular a porcentagem de uma mistura (média ponderada), acompanhar a porcentagem quando o total muda e resolver secagens em que só a água sai.', () => ({
      learn: [
        text('Misturar 300 mL com 40% de suco e 200 mL com 15% NÃO dá a média 27,5%: há 120 + 30 = 150 mL de suco em 500 mL, ou seja, **30%**. Porcentagens de partes diferentes se combinam pela quantidade, não pela média simples.'),
        lab({
          title: 'Duas soluções',
          intro: 'Uma jarra recebe a solução A (40% de suco) e a solução B (15% de suco). Escolha os volumes.',
          params: [
            { key: 'a', label: 'Volume de A (40%)', min: 50, max: 500, step: 50, value: 300, format: (v) => `${v} mL` },
            { key: 'b', label: 'Volume de B (15%)', min: 50, max: 500, step: 50, value: 200, format: (v) => `${v} mL` },
          ],
          readouts: ({ a, b }) => {
            const s = 0.4 * a + 0.15 * b;
            return [
              { label: 'Suco puro', value: `${num(s, 1)} mL` },
              { label: 'Volume total', value: `${a + b} mL` },
              { label: 'Concentração', value: pct((100 * s) / (a + b)), big: true, tone: 'brass' },
              { label: 'Média simples (engana)', value: '27,5%' },
            ];
          },
          viz: ({ a, b }) => ({
            kind: 'parts',
            segments: [
              { label: 'suco', value: 0.4 * a + 0.15 * b, tone: 'ember' },
              { label: 'água', value: 0.6 * a + 0.85 * b, tone: 'sky' },
            ],
            summary: `${num(0.4 * a + 0.15 * b, 1)} mL de suco em ${a + b} mL`,
          }),
          goal: {
            task: 'Ajuste os volumes para que a mistura tenha exatamente 25% de suco.',
            done: ({ a, b }) => Math.abs((0.4 * a + 0.15 * b) / (a + b) - 0.25) < 1e-9,
            success: 'Isso: com B igual a 1,5 vez A (por exemplo, 200 mL e 300 mL), a concentração fica em 25%.',
          },
          insight: 'A concentração final fica entre as duas, mais perto da que entra em maior volume.',
        }),
        key('Média ponderada', 'Taxa conjunta = total de "sucessos" ÷ total de pessoas. 25% de 300 alunos e 70% de 100 dão (75 + 70) ÷ 400 = 36,25% — e não a média 47,5%.'),
        example('Secagem', 'Há 90 kg de uvas com 80% de água. Depois de secas, viram passas com 25% de água. Qual é a massa das passas?', [
          askStep('Na secagem, sai só água.', 'O que não muda?', [
            ok('A massa seca: 20% de 90 = 18 kg'),
            no('A massa de água', 'A secagem tira ÁGUA; a parte seca (18 kg) é que fica igual.'),
          ]),
          step('Nas passas, os 18 kg secos são 75% da massa:', '18 ÷ 0,75 = 24 kg'),
        ], 'São 24 kg de passas (saíram 66 kg de água).'),
        warn('Total que muda', 'Se entram ou saem itens, recalcule com o NOVO total. Numa turma de 60 alunos com 20% canhotos (12), chegam 15 alunos canhotos: são 27 em 75, ou seja, 36%.'),
        check(numeric({
          prompt: [p('Uma caixa tem 160 peças, das quais 25% têm defeito. Retiram-se 20 peças com defeito, e nenhuma peça boa.')],
          ask: 'Qual é o novo percentual de peças com defeito? Arredonde a duas casas decimais.',
          unit: '%',
          answer: 14.29,
          wrong: [
            { value: 12.5, feedback: 'Isso divide pelo total ANTIGO (160). A caixa ficou com 140 peças.' },
            { value: 25, feedback: 'O percentual muda quando saem só peças defeituosas.' },
            { value: 5, feedback: 'Subtrair 20 do percentual não faz sentido: saíram 20 PEÇAS.' },
          ],
          solution: ['$Defeituosas: 40 − 20 = 20; total: 140', '$20 ÷ 140 ≈ 14,29%'],
        })),
      ],
      practice: [gen(mixGen), gen(changeTotalGen), gen(dryGen)],
      challenge: [
        gen(mixGen),
        gen(changeTotalGen),
        gen(dryGen),
        numeric({
          prompt: [p('Um frasco tem 500 mL de suco com 30% de polpa. Retiram-se 100 mL da mistura (homogênea) e acrescentam-se 100 mL de água.')],
          ask: 'Qual é o novo percentual de polpa?',
          unit: '%',
          answer: 24,
          wrong: [
            { value: 30, feedback: 'A retirada mantém os 30%, mas a água acrescentada dilui a mistura.' },
            { value: 25, feedback: 'Isso esquece de somar os 100 mL de água ao volume: o frasco volta a ter 500 mL.' },
            { value: 20, feedback: 'Subtrair pontos percentuais não acompanha a polpa: são 150 − 30 = 120 mL em 500 mL.' },
          ],
          solution: ['$Polpa: 150 mL; saem 30 mL → 120 mL', '$120 ÷ 500 = 24%'],
        }),
      ],
      recap: [
        'Mistura: some as quantidades puras e divida pelo total (média ponderada).',
        'Total que muda: recalcule com o novo total.',
        'Secagem: a massa seca fica fixa; massa final = seca ÷ (1 − água final).',
      ],
    })),

    stage('maestria', 'maestria', 'Maestria: porcentagem nos problemas difíceis', 'Resolver problemas inéditos de porcentagem com várias etapas: metas de composição, acréscimos de componentes puros, secagens e cadeias com arredondamento.', () => ({
      learn: [
        strategy('Encontre a âncora', '1) Qual quantidade NÃO muda? (as peças reprovadas, a massa seca, o corante). 2) Ela é que porcentagem do total final? 3) Total final = âncora ÷ porcentagem; depois responda o que foi pedido.'),
        example('Diluir o defeito', 'Um lote tem 90 peças boas e 10 com defeito. Quantas peças boas é preciso acrescentar para que as defeituosas sejam 4% do total?', [
          step('As 10 defeituosas não mudam.'),
          askStep('Elas devem ser 4% do novo total.', 'Qual é o novo total?', [
            ok('10 ÷ 0,04 = 250 peças'),
            no('100 × 1,04 = 104 peças', 'Os 4% são da proporção de defeituosas no total, não um acréscimo de 4%.'),
          ]),
          step('Acrescentar:', '250 − 100 = 150 peças boas'),
        ], 'É preciso acrescentar 150 peças boas.'),
        reveal('Por que "tirar 10 pontos percentuais de água" não dá a massa final?', 'Porque a porcentagem é sobre um total que também encolhe. Só a parte seca fica fixa — ela é que deve ser usada como âncora.'),
        check(numeric({
          prompt: [p('Há 300 mL de tinta com 20% de pigmento. Será acrescentado pigmento puro até que ele represente 40% do volume final.')],
          ask: 'Quantos mililitros de pigmento puro devem ser acrescentados?',
          unit: 'mL',
          answer: 100,
          wrong: [
            { value: 60, feedback: '60 mL = 20% de 300 aplica a diferença de percentuais ao volume antigo, mas o volume cresce junto.' },
            { value: 120, feedback: '120 mL = 40% de 300 ignora que já há 60 mL de pigmento e que o volume aumenta.' },
          ],
          solution: ['$60 + x = 0,4 × (300 + x) → 60 + x = 120 + 0,4x → 0,6x = 60 → x = 100 mL'],
        })),
      ],
      practice: [
        numeric({
          prompt: [p('Um lote de 50 kg de grãos tem 24% de umidade (água), em massa. Na secagem, só água é retirada, até a umidade chegar a 5%.')],
          ask: 'Quantos quilogramas de água são retirados?',
          unit: 'kg',
          answer: 10,
          wrong: [
            { value: 9.5, feedback: '9,5 kg = 19% de 50 tira os pontos percentuais (24 − 5) da massa inicial. A massa seca (38 kg) é que fica fixa.' },
            { value: 12, feedback: '12 kg é TODA a água inicial. No final ainda sobra 5% de água.' },
            { value: 40, feedback: '40 kg é a massa FINAL. A água retirada é 50 − 40.' },
          ],
          hints: ['Massa seca: 76% de 50 = 38 kg.', 'No final, 38 kg são 95% da massa.'],
          solution: ['$Seca: 38 kg; final: 38 ÷ 0,95 = 40 kg', '$Água retirada: 50 − 40 = 10 kg'],
        }),
        gen(mixGen),
        gen(chainBackGen),
      ],
      challenge: [
        numeric({
          prompt: [p('Um tanque tem 400 L de uma mistura com 15% de álcool. Retiram-se 80 L da mistura (homogênea) e acrescentam-se 80 L de álcool puro.')],
          ask: 'Qual passa a ser a porcentagem de álcool no tanque?',
          unit: '%',
          answer: 32,
          wrong: [
            { value: 35, feedback: 'Isso soma os 80 L de álcool sem tirar o álcool que saiu na retirada (15% de 80 = 12 L).' },
            { value: 20, feedback: 'Somar 80 L de álcool puro aumenta muito mais: são 48 + 80 = 128 L em 400 L.' },
          ],
          solution: ['$Álcool: 60 L; saem 12 L → 48 L; entram 80 L → 128 L', '$128 ÷ 400 = 32%'],
        }),
        gen(changeTotalGen),
        gen(dryGen),
        gen(chainGen),
      ],
      recap: [
        'Âncora: a quantidade que não muda (seca, defeituosa, corante).',
        'Total final = âncora ÷ porcentagem que ela deve ter.',
        'Retirar mistura homogênea leva todos os componentes na mesma proporção.',
      ],
    })),
  ],
});
