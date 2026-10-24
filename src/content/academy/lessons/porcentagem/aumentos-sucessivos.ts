/**
 * Aula: Aumentos sucessivos — fatores multiplicativos, mudanças em sequência, taxa única
 * equivalente, voltar ao valor anterior (dividir pelos fatores), grandezas que são produtos
 * (área, receita), ganho real, taxa repetida (potências e raízes) e cadeias de preço com
 * desconto, taxa de cartão, frete e lucro.
 */
import {
  askStep,
  check,
  choice,
  classify,
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
  spot,
  stage,
  step,
  strategy,
  text,
  warn,
} from '../../kit/build';
import { brl, num, pct, round } from '../../kit/format';
import type { Rand } from '../../types';

const isInt = (x: number) => Number.isInteger(round(x, 9));
/** "um aumento de 10%" / "uma redução de 10%". */
const change = (x: number) => (x > 0 ? `um aumento de ${pct(x)}` : `uma redução de ${pct(-x)}`);
/** Fator com até 3 casas: 1,125; 0,85. */
const fac = (x: number) => num(1 + x / 100, 3);

// ———————————————————————————————————————————————— geradores

/** O fator de um aumento ou de um desconto. */
function factorGen(r: Rand) {
  const x = r.pick([3, 5, 8, 12, 15, 18, 25, 30, 35, 40, 45, 60, 75]);
  const up = r.next() < 0.5;
  const f = up ? 1 + x / 100 : 1 - x / 100;
  const rest = up ? 100 + x : 100 - x;
  return draftNumeric({
    prompt: [p(`Para ${up ? 'aumentar' : 'reduzir'} um valor em ${pct(x)}, basta multiplicar esse valor por um único número.`)],
    ask: 'Que número é esse?',
    answer: round(f, 4),
    wrong: [
      { value: x / 100, feedback: `${num(x / 100, 2)} é só a parte que ${up ? 'se acrescenta' : 'sai'}. O fator inclui o valor inteiro: 1 ${up ? '+' : '−'} ${num(x / 100, 2)}.` },
      { value: round(up ? 1 - x / 100 : 1 + x / 100, 4), feedback: `Multiplicar por ${num(up ? 1 - x / 100 : 1 + x / 100, 2)} ${up ? 'reduziria' : 'aumentaria'} o valor em ${pct(x)}.` },
      { value: rest, feedback: `${rest}% é o fator escrito em porcentagem. Como número: ${rest} ÷ 100 = ${num(f, 2)}.` },
    ],
    hints: [`${up ? 'Aumentar' : 'Reduzir'} ${pct(x)} deixa ${rest}% do valor original.`, `Escreva ${rest}% como número decimal: ${rest} ÷ 100.`],
    solution: [`$1 ${up ? '+' : '−'} ${num(x / 100, 2)} = ${num(f, 2)}`],
  });
}

const CHAIN_CTX = [
  { lead: (v: string) => `Uma bicicleta custava ${v}.`, subj: 'o preço', ask: 'Qual é o preço final da bicicleta?', money: true, starts: [400, 500, 800, 1000, 1200, 1500, 2000] },
  { lead: (v: string) => `Um aplicativo tinha ${v} usuários ativos.`, subj: 'o número de usuários', ask: 'Quantos usuários ativos o aplicativo passou a ter?', money: false, starts: [2000, 4000, 5000, 8000, 10000, 20000] },
  { lead: (v: string) => `Uma cooperativa tinha ${v} sacas de feijão em estoque.`, subj: 'o estoque', ask: 'Com quantas sacas o estoque ficou?', money: false, starts: [400, 600, 800, 1000, 1200, 1600] },
];

/** Duas mudanças sucessivas: multiplique os fatores. */
function chainGen(r: Rand) {
  for (;;) {
    const c = r.pick(CHAIN_CTX);
    const P = r.pick(c.starts);
    const a = r.pick([-40, -30, -25, -20, -15, -10, -5, 5, 10, 15, 20, 25, 30, 40, 50]);
    const b = r.pick([-40, -30, -25, -20, -15, -10, -5, 5, 10, 15, 20, 25, 30, 40, 50]);
    const mid = round(P * (1 + a / 100), 6);
    const fin = round(mid * (1 + b / 100), 6);
    if (c.money ? !isInt(fin * 100) : !isInt(mid) || !isInt(fin)) continue;
    // questões do banco
    if ((P === 800 && a === -40 && b === 50) || (P === 1000 && a === -20 && b === -50)) continue;
    const fmt = (v: number) => (c.money ? brl(v) : num(v));
    const sum = a + b;
    return draftNumeric({
      prompt: [p(`${c.lead(fmt(P))} Primeiro, ${c.subj} teve ${change(a)}; depois, ${change(b)} sobre o valor já alterado.`)],
      ask: c.ask,
      unit: c.money ? undefined : c.subj === 'o estoque' ? 'sacas' : 'usuários',
      prefix: c.money ? 'R$' : undefined,
      answer: fin,
      wrong: [
        {
          value: round(P * (1 + sum / 100), 2),
          feedback:
            sum === 0
              ? `Mudanças de mesma taxa, uma para cima e outra para baixo, não se anulam: a 2ª incide sobre ${fmt(mid)}, e não sobre ${fmt(P)}.`
              : `Somar as taxas (${pct(sum)}) ignora que a 2ª mudança incide sobre o valor já alterado (${fmt(mid)}).`,
        },
        { value: mid, feedback: `${fmt(mid)} é o valor depois da 1ª mudança. Falta aplicar a 2ª: × ${fac(b)}.` },
        { value: round(P * (1 + b / 100), 2), feedback: `Isso aplica só a 2ª mudança, e sobre o valor inicial. As duas se encadeiam: × ${fac(a)} e depois × ${fac(b)}.` },
        { value: round(Math.abs(fin - P), 2), feedback: `Essa é a diferença em relação ao valor inicial, e não o valor final.` },
      ],
      hints: [`Fatores: ${fac(a)} e ${fac(b)}.`, `${fmt(P)} × ${fac(a)} = ${fmt(mid)}; agora, × ${fac(b)}.`],
      solution: [`$${num(P)} × ${fac(a)} × ${fac(b)} = ${num(fin, 2)}`],
    });
  }
}

/** Três mudanças semanais no valor de uma ação. */
function chain3Gen(r: Rand) {
  for (;;) {
    const P = r.pick([20, 40, 50, 80, 100, 120, 200]);
    const rates = [0, 1, 2].map(() => r.pick([-25, -20, -10, 10, 20, 25, 50]));
    const f = rates.reduce((acc, x) => acc * (1 + x / 100), 1);
    const fin = round(P * f, 6);
    if (!isInt(fin * 100) || fin === P) continue;
    const sum = rates.reduce((acc, x) => acc + x, 0);
    const after2 = round(P * (1 + rates[0] / 100) * (1 + rates[1] / 100), 6);
    const verb = (x: number) => (x > 0 ? `subiu ${pct(x)}` : `caiu ${pct(-x)}`);
    return draftNumeric({
      prompt: [p(`Uma ação valia ${brl(P)}. Na 1ª semana, ${verb(rates[0])}; na 2ª, ${verb(rates[1])}; na 3ª, ${verb(rates[2])} — sempre sobre o valor do fim da semana anterior.`)],
      ask: 'Quanto a ação valia ao final da 3ª semana?',
      prefix: 'R$',
      answer: fin,
      wrong: [
        { value: round(P * (1 + sum / 100), 2), feedback: `Somar as três taxas (${pct(sum)}) ignora que cada uma incide sobre o valor da semana anterior.` },
        { value: after2, feedback: `${brl(after2)} é o valor ao final da 2ª semana. Falta a 3ª: × ${fac(rates[2])}.` },
        { value: round(Math.abs(fin - P), 2), feedback: 'Essa é a variação em reais, e não o valor final da ação.' },
      ],
      hints: [`Fatores: ${rates.map(fac).join('; ')}.`, 'Multiplique o valor inicial pelos três fatores, na ordem.'],
      solution: [`$${num(P)} × ${rates.map(fac).join(' × ')} = ${num(fin, 2)}`],
    });
  }
}

const EQUIV_SUBJ = ['O preço de um material', 'O valor de um aluguel', 'A mensalidade de um curso', 'A produção diária de uma fábrica'];

/** Taxa única equivalente a duas mudanças sucessivas. */
function equivGen(r: Rand) {
  for (;;) {
    const a = r.pick([-40, -30, -25, -20, -15, -10, 10, 15, 20, 25, 30, 40, 50]);
    const b = r.pick([-30, -25, -20, -12.5, -10, -5, 5, 10, 12.5, 20, 25, 30]);
    // questões do banco
    if ((a === 20 && b === 30) || (a === 30 && b === 20) || (a === -20 && b === -12.5) || (a === 25 && b === -20)) continue;
    const f = (1 + a / 100) * (1 + b / 100);
    const eq = round((f - 1) * 100, 4);
    if (eq === 0 || !isInt(eq * 100)) continue;
    const up = eq > 0;
    return draftNumeric({
      prompt: [p(`${r.pick(EQUIV_SUBJ)} passou por duas mudanças sucessivas: ${change(a)} e, depois, ${change(b)} sobre o valor já alterado.`)],
      ask: `Essas duas mudanças equivalem a ${up ? 'um único aumento' : 'uma única redução'} de quanto?`,
      unit: '%',
      answer: Math.abs(eq),
      wrong: [
        { value: Math.abs(a + b), feedback: 'Somar as taxas ignora que a 2ª mudança incide sobre o valor já alterado. Multiplique os fatores.' },
        { value: round(f * 100, 2), feedback: `${pct(f * 100)} é o valor final em relação ao inicial. A taxa equivalente é a diferença para 100%.` },
        { value: Math.abs(round((a * b) / 100, 2)), feedback: 'Esse é só o termo extra (a taxa de uma sobre a outra). Falta somar as próprias taxas.' },
      ],
      hints: [`Fatores: ${fac(a)} e ${fac(b)}.`, 'Multiplique os fatores e compare o resultado com 1.'],
      solution: [`$${fac(a)} × ${fac(b)} = ${num(f, 4)} → ${up ? 'aumento' : 'redução'} de ${pct(Math.abs(eq))}`],
    });
  }
}

const NET_CTX = [
  { lead: (n: string) => `Uma academia tinha ${n} alunos matriculados.`, period: 'semestre', who: 'alunos', ask: (more: boolean) => `Quantos alunos a academia tem a ${more ? 'mais' : 'menos'} do que no início?` },
  { lead: (n: string) => `Um teatro recebia ${n} espectadores por mês.`, period: 'trimestre', who: 'espectadores', ask: (more: boolean) => `Quantos espectadores mensais o teatro tem a ${more ? 'mais' : 'menos'} do que no início?` },
];

/** Queda e recuperação (ou o contrário): a diferença em relação ao início. */
function netChangeGen(r: Rand) {
  for (;;) {
    const c = r.pick(NET_CTX);
    const N = r.pick([400, 500, 800, 1000, 1200, 1500, 2000, 2500]);
    const x = r.pick([10, 20, 25, 30, 40]);
    const y = r.pick([10, 20, 25, 30, 40, 50]);
    const downFirst = r.next() < 0.65;
    const a = downFirst ? -x : x;
    const b = downFirst ? y : -y;
    if (N === 2000 && a === -10 && b === 30) continue; // questão do banco
    const mid = (N * (100 + a)) / 100;
    const fin = (mid * (100 + b)) / 100;
    if (!isInt(mid) || !isInt(fin) || fin === N) continue;
    const more = fin > N;
    const diff = Math.abs(fin - N);
    const verb = (v: number) => (v > 0 ? `cresceu ${pct(v)}` : `caiu ${pct(-v)}`);
    return draftNumeric({
      prompt: [p(`${c.lead(num(N))} No 1º ${c.period}, esse número ${verb(a)}; no 2º, ${verb(b)} sobre o número do ${c.period} anterior.`)],
      ask: c.ask(more),
      unit: c.who,
      answer: diff,
      wrong: [
        { value: Math.abs((N * (a + b)) / 100), feedback: `Somar as taxas (${a > 0 ? '+' : '−'}${Math.abs(a)}% e ${b > 0 ? '+' : '−'}${Math.abs(b)}%) ignora que a 2ª mudança incide sobre ${num(mid)}, e não sobre ${num(N)}.` },
        { value: fin, feedback: `${num(fin)} é o total final. A pergunta é a diferença em relação ao início (${num(N)}).` },
        { value: Math.abs((mid * b) / 100), feedback: `${num(Math.abs((mid * b) / 100))} é a mudança do 2º ${c.period} apenas. Compare o total final com o inicial.` },
      ],
      hints: [`Depois do 1º ${c.period}: ${num(N)} × ${fac(a)} = ${num(mid)}.`, `Depois do 2º: ${num(mid)} × ${fac(b)}; compare com ${num(N)}.`],
      solution: [`$${num(N)} × ${fac(a)} × ${fac(b)} = ${num(fin)}`, `$${num(fin)} − ${num(N)} = ${fin > N ? '' : '−'}${num(diff)}`],
    });
  }
}

const BACK_SUBJ = ['A mensalidade de um clube', 'O preço de uma cadeira de escritório', 'A tarifa de um estacionamento', 'O valor de um seguro'];

/** O valor antes de duas mudanças: divida pelos fatores. */
function backGen(r: Rand) {
  for (;;) {
    const P = r.pick([20, 40, 50, 60, 80, 120, 150, 200, 250, 400, 500]);
    const a = r.pick([-30, -25, -20, -10, -5, 5, 10, 15, 20, 25, 30, 50]);
    const b = r.pick([-30, -25, -20, -10, -5, 5, 10, 15, 20, 25, 30, 50]);
    // questões do banco
    if ((a === 10 && b === 20) || (a === -10 && b === -10)) continue;
    const f = (1 + a / 100) * (1 + b / 100);
    const F = round(P * f, 6);
    if (!isInt(F * 100)) continue;
    return draftNumeric({
      prompt: [p(`${r.pick(BACK_SUBJ)} passou por ${change(a)} e, depois, por ${change(b)} sobre o valor já alterado, chegando a ${brl(F)}.`)],
      ask: 'Qual era o valor antes das duas mudanças?',
      prefix: 'R$',
      answer: P,
      wrong: [
        { value: round(F * (1 - a / 100) * (1 - b / 100), 2), feedback: 'Isso aplica as taxas ao contrário sobre o valor final. Cada taxa foi calculada sobre outra base: divida pelos fatores.' },
        { value: round(F / (1 + (a + b) / 100), 2), feedback: `Isso trata as mudanças como uma só, de ${pct(a + b)}. O fator certo é o produto: ${fac(a)} × ${fac(b)} = ${num(f, 4)}.` },
        { value: round(F / (1 + b / 100), 2), feedback: `Esse é o valor antes da 2ª mudança apenas. Falta desfazer a 1ª: ÷ ${fac(a)}.` },
        { value: round(F * f, 2), feedback: 'Isso aplica as mudanças de novo sobre o valor final. Para voltar no tempo, divida pelos fatores.' },
      ],
      hints: [`Valor final = valor inicial × ${fac(a)} × ${fac(b)}.`, `Valor inicial = ${num(F, 2)} ÷ ${num(f, 4)}.`],
      solution: [`$${fac(a)} × ${fac(b)} = ${num(f, 4)}`, `$${num(F, 2)} ÷ ${num(f, 4)} = ${num(P)}`],
    });
  }
}

/** Desconto, sobre o preço aumentado, que leva a um preço-alvo dado em relação ao original. */
function targetGen(r: Rand) {
  for (;;) {
    const a = r.pick([10, 20, 25, 30, 40, 50, 60]);
    const t = r.pick([0, 0, 4, 10, 12, 20]);
    if (a === 25 && t === 10) continue; // questão do banco
    if (a === 25 && t === 0) continue; // questão do banco (−20% e +25%)
    const f = (1 - t / 100) / (1 + a / 100);
    const d = round((1 - f) * 100, 2);
    if (d <= 0) continue;
    const exact = isInt((1 - f) * 10000);
    return draftNumeric({
      prompt: [
        p(
          t === 0
            ? `Uma loja aumentou todos os preços em ${pct(a)}. Semanas depois, decidiu voltar exatamente aos preços de antes do aumento.`
            : `Uma loja aumentou todos os preços em ${pct(a)}. Semanas depois, decidiu fazer uma promoção em que cada produto custe ${pct(t)} menos do que custava antes do aumento.`,
        ),
      ],
      ask: `Que desconto a loja deve aplicar sobre os preços aumentados?${exact ? '' : ' Arredonde a duas casas decimais.'}`,
      unit: '%',
      answer: d,
      wrong: [
        ...(t === 0
          ? [{ value: a, feedback: `Um desconto de ${pct(a)} sobre o preço aumentado não volta ao original: ${fac(a)} × ${num(1 - a / 100, 2)} = ${num((1 + a / 100) * (1 - a / 100), 4)}.` }]
          : [
              { value: a + t, feedback: `Somar as taxas (${a}% + ${t}%) ignora que o desconto incide sobre o preço já aumentado. O fator procurado é ${num(1 - t / 100, 2)} ÷ ${fac(a)}.` },
              { value: t, feedback: `${pct(t)} é a redução em relação ao preço ORIGINAL. Sobre o preço aumentado, o desconto precisa ser maior.` },
            ]),
        { value: round(f * 100, 2), feedback: `${pct(f * 100)} é o que deve sobrar do preço aumentado. O desconto é a diferença para 100%.` },
      ],
      hints:
        t === 0
          ? [`Os preços atuais estão em × ${fac(a)}; para voltar ao original, o fator total deve ser 1.`, `Fator do desconto: 1 ÷ ${fac(a)}.`]
          : [`Preço da promoção em relação ao original: × ${num(1 - t / 100, 2)}. Preço atual: × ${fac(a)}.`, `Fator do desconto: ${num(1 - t / 100, 2)} ÷ ${fac(a)}.`],
      solution: [`$${num(1 - t / 100, 2)} ÷ ${fac(a)} = ${num(f, 4)} → desconto de ${pct(d)}`],
    });
  }
}

const AREA_SUBJ = ['uma sala retangular', 'um painel solar retangular', 'um canteiro retangular', 'uma quadra retangular'];

/** Área de um retângulo: os fatores das medidas se multiplicam. */
function areaGen(r: Rand) {
  for (;;) {
    const a = r.pick([-20, -10, 10, 20, 25, 30, 40, 50]);
    const b = r.pick([-20, -10, 10, 20, 25, 30, 40, 50]);
    if ((a === 20 && b === 30) || (a === 30 && b === 20)) continue; // questão do banco
    const f = (1 + a / 100) * (1 + b / 100);
    const v = round((f - 1) * 100, 2);
    if (v === 0) continue;
    const verb = (x: number) => (x > 0 ? `aumentar ${pct(x)}` : `diminuir ${pct(-x)}`);
    return draftNumeric({
      prompt: [p(`Numa reforma, o comprimento de ${r.pick(AREA_SUBJ)} vai ${verb(a)}, e a largura vai ${verb(b)}. O formato continuará retangular.`)],
      ask: `Qual será ${v > 0 ? 'o aumento' : 'a redução'} percentual da área?`,
      unit: '%',
      answer: Math.abs(v),
      wrong: [
        { value: Math.abs(a + b), feedback: 'Somar as variações das medidas não serve: a área é comprimento × largura, e os fatores se MULTIPLICAM.' },
        { value: round(f * 100, 2), feedback: `${pct(f * 100)} é a área nova em relação à antiga. A variação é a diferença para 100%.` },
        { value: Math.abs(round((a * b) / 100, 2)), feedback: 'Esse é só o termo extra (uma variação sobre a outra). Falta somar as próprias variações.' },
      ],
      hints: [`Fatores: comprimento × ${fac(a)}, largura × ${fac(b)}.`, 'A área nova é a antiga vezes o produto dos fatores.'],
      solution: [`$${fac(a)} × ${fac(b)} = ${num(f, 4)} → ${v > 0 ? 'aumento' : 'redução'} de ${pct(Math.abs(v))}`],
    });
  }
}

const EVENT_CTX = ['Uma peça de teatro', 'Um campeonato de futsal', 'Um festival de cinema', 'Uma feira de quadrinhos'];

/** Receita = público × preço do ingresso. */
function revenueGen(r: Rand) {
  for (;;) {
    const n = r.pick([400, 500, 600, 800, 1000, 1200, 1500]);
    const price = r.pick([20, 25, 30, 40, 50, 60, 80]);
    const a = r.pick([-25, -20, -10, 10, 20, 25, 50]);
    const b = r.pick([-20, -10, 10, 20, 25, 50]);
    if (a === -20 && b === 25) continue; // questão do banco
    const n2 = (n * (100 + a)) / 100;
    const p2 = (price * (100 + b)) / 100;
    if (!isInt(n2) || !isInt(p2 * 100)) continue;
    const f = (1 + a / 100) * (1 + b / 100);
    const v = round((f - 1) * 100, 2);
    if (v === 0) continue;
    const r1 = n * price;
    const r2 = round(n2 * p2, 2);
    return draftNumeric({
      prompt: [
        p(
          `${r.pick(EVENT_CTX)} teve ${num(n)} pagantes, a ${brl(price)} cada. Na edição seguinte, o público ${a > 0 ? `cresceu ${pct(a)}` : `caiu ${pct(-a)}`}, e o ingresso ficou ${pct(Math.abs(b))} mais ${b > 0 ? 'caro' : 'barato'}. Não houve outras receitas.`,
        ),
      ],
      ask: `Qual foi ${v > 0 ? 'o aumento' : 'a redução'} percentual da receita com ingressos?`,
      unit: '%',
      answer: Math.abs(v),
      wrong: [
        { value: Math.abs(a + b), feedback: 'Somar as variações não serve: receita = público × preço, e os fatores se MULTIPLICAM.' },
        { value: round(f * 100, 2), feedback: `${pct(f * 100)} é a receita nova em relação à antiga. A variação é a diferença para 100%.` },
        { value: round(Math.abs(r2 - r1), 2), feedback: `${brl(Math.abs(r2 - r1))} é a variação da receita em REAIS. Em porcentagem, divida pela receita da 1ª edição (${brl(r1)}).` },
      ],
      hints: [`Receita da 1ª edição: ${num(n)} × ${brl(price)} = ${brl(r1)}.`, `Fator da receita: ${fac(a)} × ${fac(b)}.`],
      solution: [`$${fac(a)} × ${fac(b)} = ${num(f, 4)} → ${v > 0 ? 'aumento' : 'redução'} de ${pct(Math.abs(v))}`],
    });
  }
}

const NAMES = ['Paulo', 'Marta', 'Ivo', 'Luana', 'Caetano', 'Iara'];

/** Ganho (ou perda) real: divida o fator do salário pelo da inflação. */
function realGainGen(r: Rand) {
  for (;;) {
    const s = r.pick([0, 4, 5, 6, 8, 10, 12, 15, 20]);
    const inf = r.pick([2, 3, 4, 5, 6, 8, 10]);
    if (s === inf || (s === 12 && inf === 5)) continue; // questão do banco
    const ratio = (1 + s / 100) / (1 + inf / 100);
    const g = round((ratio - 1) * 100, 2);
    if (g === 0) continue;
    const gain = g > 0;
    return draftNumeric({
      prompt: [p(s === 0 ? `Num ano em que a inflação foi de ${pct(inf)}, o salário de ${r.pick(NAMES)} não teve reajuste.` : `O salário de ${r.pick(NAMES)} teve reajuste de ${pct(s)} num ano em que a inflação foi de ${pct(inf)}.`)],
      ask: `Qual foi ${gain ? 'o ganho' : 'a perda'} real de poder de compra? Arredonde a duas casas decimais.`,
      unit: '%',
      answer: Math.abs(g),
      wrong: [
        { value: Math.abs(s - inf), feedback: 'Subtrair as taxas é só uma aproximação. O poder de compra é o salário dividido pelo nível de preços: compare os fatores por divisão.' },
        { value: Math.abs(round(((1 + s / 100) * (1 - inf / 100) - 1) * 100, 2)), feedback: 'Isso aplica a inflação como um desconto no salário. Os preços SUBIRAM: divida pelo fator da inflação.' },
        { value: round(ratio * 100, 2), feedback: `${pct(ratio * 100)} é o poder de compra novo em relação ao antigo. ${gain ? 'O ganho' : 'A perda'} é a diferença para 100%.` },
      ],
      hints: [`Fatores: salário × ${fac(s)}; preços × ${fac(inf)}.`, `Poder de compra: ${fac(s)} ÷ ${fac(inf)}.`],
      solution: [`$${fac(s)} ÷ ${fac(inf)} = ${num(ratio, 4)} → ${gain ? 'ganho' : 'perda'} real de ${pct(Math.abs(g))}`],
    });
  }
}

const GROW_CTX = [
  { lead: (n: string, x: string, k: number) => `Um canal de vídeos tinha ${n} inscritos. O número de inscritos cresceu ${x} por mês durante ${k} meses, sempre sobre o número do início de cada mês.`, ask: 'Quantos inscritos o canal tinha ao final do período?', unit: 'inscritos', up: true },
  { lead: (n: string, x: string, k: number) => `Uma cidade tinha ${n} árvores plantadas em praças. Um programa ampliou esse número em ${x} ao ano durante ${k} anos, sempre sobre o total do ano anterior.`, ask: 'Quantas árvores a cidade passou a ter?', unit: 'árvores', up: true },
  { lead: (n: string, x: string, k: number) => `Um reservatório tinha ${n} mil litros de água. Na estiagem, perdeu ${x} do volume por semana durante ${k} semanas, sempre sobre o volume do início de cada semana.`, ask: 'Com quantos mil litros o reservatório ficou?', unit: 'mil litros', up: false },
];

/** A mesma taxa n vezes: fator (1 + i)ⁿ. */
function repeatGen(r: Rand) {
  for (;;) {
    const c = r.pick(GROW_CTX);
    const N = r.pick([1000, 2000, 4000, 5000, 8000, 10000, 16000, 25000]);
    const x = r.pick([5, 10, 20, 25, 50]);
    const k = r.pick([2, 3, 4]);
    if (!c.up && x === 50) continue;
    const f = c.up ? 1 + x / 100 : 1 - x / 100;
    const F = round(N * f ** k, 6);
    if (!isInt(F)) continue;
    if (N === 20000 && x === 10 && k === 3) continue; // questão do banco
    const simple = round(N * (1 + (c.up ? 1 : -1) * ((k * x) / 100)), 2);
    return draftNumeric({
      prompt: [p(c.lead(num(N), pct(x), k))],
      ask: c.ask,
      unit: c.unit,
      answer: F,
      wrong: [
        { value: simple, feedback: `Isso ${c.up ? 'soma' : 'subtrai'} ${k} × ${pct(x)} sobre o valor inicial. Cada período incide sobre o valor do período anterior: × ${num(f, 2)} a cada vez.` },
        { value: round(Math.abs(F - N), 2), feedback: `Essa é a ${c.up ? 'variação' : 'perda'} total, e não o valor final.` },
        { value: round(N * f ** (k - 1), 2), feedback: `Esse é o valor depois de ${k - 1} ${k - 1 === 1 ? 'período' : 'períodos'}. Falta o último: × ${num(f, 2)}.` },
      ],
      hints: [`Fator de cada período: ${num(f, 2)}.`, `Valor final = ${num(N)} × ${num(f, 2)}${'²³⁴'[k - 2]}.`],
      solution: [`$${num(N)} × ${num(f, 2)}${'²³⁴'[k - 2]} = ${num(N)} × ${num(f ** k, 6)} = ${num(F)}`],
    });
  }
}

/** Duas mudanças iguais: o fator de cada uma é a raiz quadrada do fator total. */
function sameRateGen(r: Rand) {
  for (;;) {
    const P = r.pick([100, 200, 250, 300, 400, 500, 800]);
    const down = r.next() < 0.6;
    const x = down ? r.pick([10, 20, 30, 40, 50]) : r.pick([10, 20, 25, 50]);
    if (down && P === 150 && x === 20) continue; // questão do banco
    const f = down ? 1 - x / 100 : 1 + x / 100;
    const F = round(P * f * f, 6);
    if (!isInt(F * 100)) continue;
    const total = round(Math.abs(f * f - 1) * 100, 2);
    return draftNumeric({
      prompt: [
        p(
          down
            ? `Para liquidar o estoque, uma loja fez duas remarcações, cada uma com o mesmo percentual de desconto sobre o preço do momento. Um casaco que custava ${brl(P)} passou a ser vendido por ${brl(F)}.`
            : `Um aluguel de ${brl(P)} teve dois reajustes anuais de mesmo percentual, cada um sobre o valor vigente, e passou a ${brl(F)}.`,
        ),
      ],
      ask: down ? 'Qual foi o percentual de desconto em cada remarcação?' : 'Qual foi o percentual de cada reajuste?',
      unit: '%',
      answer: x,
      wrong: [
        { value: round(total / 2, 2), feedback: `${pct(total / 2)} é metade da ${down ? 'queda' : 'alta'} total. Os fatores se multiplicam: cada um é a RAIZ QUADRADA do fator total.` },
        { value: total, feedback: `${pct(total)} é a ${down ? 'queda' : 'alta'} total, somando as duas etapas. Cada etapa tem fator √${num(f * f, 4)}.` },
        { value: round(f * 100, 2), feedback: `${pct(f * 100)} é o fator de cada etapa escrito em porcentagem. A taxa é a diferença para 100%.` },
      ],
      hints: [`Fator total: ${num(F, 2)} ÷ ${num(P)} = ${num(f * f, 4)}.`, `Os dois fatores são iguais: f × f = ${num(f * f, 4)}, então f = √${num(f * f, 4)}.`],
      solution: [`$f² = ${num(f * f, 4)} → f = ${num(f, 2)} → ${down ? 'desconto' : 'reajuste'} de ${pct(x)}`],
    });
  }
}

/** Sobe e desce a mesma taxa i: sobra 1 − i². */
function upDownGen(r: Rand) {
  const i = r.pick([10, 20, 25, 40, 50, 60]);
  const kept = round((1 - (i / 100) ** 2) * 100, 4);
  const upFirst = r.next() < 0.5;
  return draftNumeric({
    prompt: [
      p(
        upFirst
          ? `O preço de um produto subiu certa porcentagem e, depois, caiu a mesma porcentagem sobre o preço já aumentado. No fim, ficou valendo ${pct(kept)} do preço inicial.`
          : `Uma ação caiu certa porcentagem num dia e subiu a mesma porcentagem no dia seguinte, sobre o valor já reduzido. No fim, valia ${pct(kept)} do valor inicial.`,
      ),
    ],
    ask: 'Qual foi a porcentagem usada em cada etapa?',
    unit: '%',
    answer: i,
    wrong: [
      { value: round(100 - kept, 2), feedback: `${pct(100 - kept)} é a perda total, que vale i². A taxa de cada etapa é a raiz: √${num((100 - kept) / 100, 4)}.` },
      { value: round((100 - kept) / 2, 2), feedback: 'Dividir a perda total entre as duas etapas não funciona: (1 + i)(1 − i) = 1 − i².' },
      { value: kept, feedback: `${pct(kept)} é o que sobrou no fim, e não a taxa de cada etapa.` },
    ],
    hints: ['Subir e descer a mesma taxa i dá o fator (1 + i)(1 − i) = 1 − i².', `1 − i² = ${num(kept / 100, 4)}, então i² = ${num(1 - kept / 100, 4)}.`],
    solution: [`$i² = ${num(1 - kept / 100, 4)} → i = ${num(i / 100, 2)} = ${pct(i)}`],
  });
}

/** Preço de etiqueta para receber um valor líquido depois de desconto e taxa do cartão. */
function tagGen(r: Rand) {
  for (;;) {
    const R = r.pick([120, 150, 171, 180, 200, 240, 270, 300, 342, 360, 450]);
    const d = r.pick([5, 10, 15, 20, 25]);
    const fee = r.pick([2, 4, 5, 8, 10]);
    if (R === 150 && d === 20 && fee === 5) continue; // questão do banco
    const f = (1 - d / 100) * (1 - fee / 100);
    const E = round(R / f, 2);
    const exact = isInt((R / f) * 100);
    return draftNumeric({
      prompt: [p(`Uma loja quer receber ${brl(R)} por um produto depois de dar ${pct(d)} de desconto sobre a etiqueta e de a operadora do cartão reter ${pct(fee)} do valor pago pelo cliente.`)],
      ask: `Qual deve ser o preço de etiqueta?${exact ? '' : ' Arredonde para centavos.'}`,
      prefix: 'R$',
      answer: E,
      wrong: [
        { value: round(R * (1 + (d + fee) / 100), 2), feedback: 'Somar as taxas e aplicar como aumento não desfaz a corrente. Divida o valor desejado pelos fatores.' },
        { value: round(R / (1 - (d + fee) / 100), 2), feedback: `Isso combina as taxas por soma (fator ${num(1 - (d + fee) / 100, 2)}). Elas se multiplicam: ${num(1 - d / 100, 2)} × ${num(1 - fee / 100, 2)} = ${num(f, 4)}.` },
        { value: round(R * (1 + d / 100) * (1 + fee / 100), 2), feedback: 'Multiplicar por aumentos de mesma taxa não desfaz descontos: um desconto de d% se desfaz dividindo por (1 − d).' },
        { value: round(R / (1 - d / 100), 2), feedback: 'Isso desfaz só o desconto e esquece a retenção do cartão.' },
      ],
      hints: [`Corrente: etiqueta × ${num(1 - d / 100, 2)} × ${num(1 - fee / 100, 2)} = ${brl(R)}.`, `Etiqueta = ${num(R)} ÷ ${num(f, 4)}.`],
      solution: [`$${num(1 - d / 100, 2)} × ${num(1 - fee / 100, 2)} = ${num(f, 4)}`, `$${num(R)} ÷ ${num(f, 4)} ≈ ${num(E, 2)}`],
    });
  }
}

const MAKER = [
  { who: 'Um ateliê de cerâmica', item: 'um vaso', unit: 'cada vaso' },
  { who: 'Uma marcenaria', item: 'uma banqueta', unit: 'cada banqueta' },
  { who: 'Uma doceria', item: 'um bolo decorado', unit: 'cada bolo decorado' },
  { who: 'Uma oficina de costura', item: 'uma bolsa', unit: 'cada bolsa' },
];

/** Lucro sobre o custo depois de margem, desconto e taxa do cartão. */
function profitGen(r: Rand) {
  for (;;) {
    const C = r.pick([20, 25, 40, 50, 60, 80, 100, 120]);
    const m = r.pick([50, 60, 75, 80, 100]);
    const d = r.pick([10, 15, 20, 25, 30]);
    const fee = r.pick([0, 2, 3, 4, 5]);
    if (C === 40 && m === 80 && d === 25 && fee === 2) continue; // questão do banco
    const tag = (C * (100 + m)) / 100;
    const paid = (tag * (100 - d)) / 100;
    const got = (paid * (100 - fee)) / 100;
    if (!isInt(tag * 100) || !isInt(paid * 100)) continue;
    const L = round(((got - C) / C) * 100, 2);
    if (L < 5) continue;
    const mk = r.pick(MAKER);
    const before = round(((paid - C) / C) * 100, 2);
    return draftNumeric({
      prompt: [
        p(
          `${mk.who} gasta ${brl(C)} para produzir ${mk.unit} e define a etiqueta acrescentando ${pct(m)} ao custo. Numa feira, vendeu ${mk.item} com ${pct(d)} de desconto sobre a etiqueta; ${fee === 0 ? 'o cliente pagou em dinheiro' : `o cliente pagou com cartão, e a operadora reteve ${pct(fee)} do valor pago`}.`,
        ),
      ],
      ask: 'Considerando o valor efetivamente recebido, qual foi o lucro, em porcentagem do custo? Arredonde a duas casas decimais.',
      unit: '%',
      answer: L,
      wrong: [
        { value: m - d - fee, feedback: 'Subtrair as taxas da margem não funciona: cada uma incide sobre um valor diferente. Siga a corrente de fatores a partir do custo.' },
        ...(fee > 0 ? [{ value: before, feedback: `Esse é o lucro antes da retenção do cartão. A operadora fica com ${pct(fee)} do valor pago.` }] : []),
        { value: round(got - C, 2), feedback: `Esse é o lucro em REAIS. Em porcentagem do custo, divida por ${brl(C)}.` },
        { value: round(((got - C) / got) * 100, 2), feedback: 'Isso divide o lucro pelo valor recebido. A pergunta pede o lucro em relação ao custo.' },
      ],
      hints: [`Etiqueta: ${brl(C)} × ${fac(m)} = ${brl(tag)}; com desconto: ${brl(paid)}.`, fee > 0 ? `Recebido: ${brl(paid)} × ${num(1 - fee / 100, 2)}; compare com o custo.` : 'Compare o valor recebido com o custo.'],
      solution: [`$Recebido: ${num(C)} × ${fac(m)} × ${num(1 - d / 100, 2)}${fee > 0 ? ` × ${num(1 - fee / 100, 2)}` : ''} = ${num(got, 4)}`, `$(${num(got, 4)} − ${num(C)}) ÷ ${num(C)} ≈ ${pct(L)}`],
    });
  }
}

/** Etiqueta com desconto, taxa do cartão, frete e lucro desejado sobre o custo. */
function tagShipGen(r: Rand) {
  for (;;) {
    const C = r.pick([100, 120, 150, 200, 250, 300]);
    const L = r.pick([20, 25, 30, 40, 50]);
    const ship = r.pick([8, 10, 12, 15, 20]);
    const d = r.pick([5, 10, 15, 20]);
    const fee = r.pick([3, 4, 5, 8]);
    if (C === 200 && L === 30 && ship === 10 && d === 10 && fee === 8) continue; // questão do banco
    const keep = (C * (100 + L)) / 100;
    const need = keep + ship;
    const f = (1 - d / 100) * (1 - fee / 100);
    const E = round(need / f, 2);
    return draftNumeric({
      prompt: [
        p(
          `Uma loja virtual vende um produto que custa ${brl(C)} para produzir. A etiqueta terá ${pct(d)} de desconto; a operadora do cartão ficará com ${pct(fee)} do valor pago; e, do valor repassado, a loja ainda pagará ${brl(ship)} de envio. No fim, a loja quer lucro de ${pct(L)} sobre o custo de produção.`,
        ),
      ],
      ask: 'Qual deve ser o preço de etiqueta? Arredonde para centavos.',
      prefix: 'R$',
      answer: E,
      wrong: [
        { value: round(keep / f, 2), feedback: `Isso esquece o envio: o repasse precisa cobrir ${brl(keep)} + ${brl(ship)} = ${brl(need)}.` },
        { value: round(keep / f + ship, 2), feedback: 'Isso soma o envio DEPOIS de desfazer os fatores. O envio sai do valor repassado: some-o antes de dividir pelos fatores.' },
        { value: round(need / (1 - (d + fee) / 100), 2), feedback: `Isso combina as taxas por soma. Elas se multiplicam: ${num(1 - d / 100, 2)} × ${num(1 - fee / 100, 2)} = ${num(f, 4)}.` },
        { value: round(need * (1 + (d + fee) / 100), 2), feedback: 'Somar as taxas e aplicar como aumento não desfaz a corrente. Divida o valor necessário pelos fatores.' },
      ],
      hints: [`O repasse precisa cobrir o custo com lucro e o envio: ${brl(keep)} + ${brl(ship)} = ${brl(need)}.`, `Etiqueta × ${num(1 - d / 100, 2)} × ${num(1 - fee / 100, 2)} = ${brl(need)}.`],
      solution: [`$Repasse necessário: ${num(keep)} + ${num(ship)} = ${num(need)}`, `$${num(need)} ÷ (${num(1 - d / 100, 2)} × ${num(1 - fee / 100, 2)}) = ${num(need)} ÷ ${num(f, 4)} ≈ ${num(E, 2)}`],
    });
  }
}

// ———————————————————————————————————————————————— aula

export const AUMENTOS_SUCESSIVOS = lesson({
  id: 'aumentos-sucessivos',
  topic: 'porcentagem',
  subtopics: ['aumentos-sucessivos'],
  title: 'Aumentos sucessivos',
  summary:
    'Mudanças percentuais em sequência se combinam por multiplicação de fatores: taxa equivalente, voltar ao valor de antes, área e receita, ganho real, taxa repetida e cadeias de preço com desconto, cartão e lucro.',
  requires: ['variacao-percentual'],
  stages: [
    stage('fatores', 'descoberta', 'Fatores multiplicativos', 'Transformar aumentos e descontos em fatores multiplicativos e aplicar mudanças sucessivas, cada uma sobre o valor do momento.', () => ({
      learn: [
        text('Todo aumento ou desconto percentual vira uma **multiplicação**: aumentar 15% é multiplicar por 1,15; descontar 15% é multiplicar por 0,85. Quando as mudanças são **sucessivas** — cada uma sobre o valor do momento —, basta multiplicar os fatores em sequência.'),
        lab({
          title: 'Corrente de reajustes',
          intro: 'Um valor começa em 100 e passa por dois reajustes seguidos. Escolha cada um e acompanhe o valor.',
          params: [
            { key: 'a', label: '1º reajuste', min: -50, max: 50, step: 5, value: 10, format: (v) => `${v > 0 ? '+' : ''}${v}%` },
            { key: 'b', label: '2º reajuste', min: -50, max: 50, step: 5, value: -10, format: (v) => `${v > 0 ? '+' : ''}${v}%` },
          ],
          readouts: ({ a, b }) => {
            const mid = 100 * (1 + a / 100);
            const fin = mid * (1 + b / 100);
            return [
              { label: 'Depois do 1º', value: num(mid, 2) },
              { label: 'Depois do 2º', value: num(fin, 2), big: true, tone: 'brass' },
              { label: 'Variação total', value: `${fin >= 100 ? '+' : ''}${pct(fin - 100)}` },
              { label: 'Soma das taxas (engana)', value: `${a + b > 0 ? '+' : ''}${a + b}%` },
            ];
          },
          viz: ({ a, b }) => {
            const mid = 100 * (1 + a / 100);
            const fin = mid * (1 + b / 100);
            return {
              kind: 'bars',
              bars: [
                { label: 'Início', value: 100, text: '100', tone: 'parchment' },
                { label: 'Após o 1º', value: mid, text: num(mid, 1), tone: a >= 0 ? 'verdigris' : 'ember' },
                { label: 'Após o 2º', value: fin, text: num(fin, 1), tone: 'brass' },
              ],
              max: 225,
              refLine: { value: 100, label: 'valor inicial' },
              summary: `100 → ${num(mid, 1)} → ${num(fin, 1)}`,
            };
          },
          goal: {
            task: 'Escolha o MESMO percentual para um aumento e um desconto (em qualquer ordem) de modo que o valor final seja 96.',
            done: ({ a, b }) => a === -b && Math.abs(a) === 20,
            success: 'Isso: 1,2 × 0,8 = 0,96. Subir e descer 20% faz perder 4% — a perda é sempre a taxa ao quadrado: 0,2² = 0,04.',
          },
          insight: 'A ordem dos reajustes não muda o resultado (a multiplicação é comutativa), mas somar as taxas quase sempre erra.',
        }),
        key('Fatores', 'Aumento de x%: × (1 + x/100). Desconto de x%: × (1 − x/100). Mudanças sucessivas: multiplique os fatores, um após o outro.'),
        example('Dois reajustes na conta de água', 'Uma conta de água de R$ 80,00 teve um aumento de 15% e, meses depois, outro de 10% sobre o valor já reajustado. Qual é o novo valor?', [
          step('Fatores:', '1,15 e 1,10'),
          askStep('Aplique um depois do outro.', 'Qual é a conta?', [
            ok('80 × 1,15 × 1,10 = R$ 101,20'),
            no('80 × 1,25 = R$ 100,00', 'Somar 15% e 10% ignora que o 2º reajuste incide sobre o valor já aumentado (R$ 92,00).'),
          ]),
        ], 'O novo valor é R$ 101,20.'),
        warn('Aumento e desconto iguais não se anulam', 'Um aumento de 10% seguido de um desconto de 10% dá 1,1 × 0,9 = 0,99: o valor final fica 1% abaixo do inicial.'),
        check(numeric({
          prompt: [p('Uma loja vai aplicar um desconto de 35% sobre o preço de um produto.')],
          ask: 'Por qual número o preço deve ser multiplicado?',
          answer: 0.65,
          wrong: [
            { value: 0.35, feedback: '0,35 é o desconto, e não o que sobra do preço: 1 − 0,35 = 0,65.' },
            { value: 1.35, feedback: 'Multiplicar por 1,35 aplicaria um AUMENTO de 35%.' },
            { value: 65, feedback: '65% é o que sobra do preço; como número, 65% = 0,65.' },
          ],
          solution: ['$1 − 0,35 = 0,65'],
        })),
      ],
      practice: [
        gen(factorGen),
        gen(chainGen),
        choice({
          prompt: [p('Um produto de R$ 120,00 teve um aumento de 20% e, depois, um desconto de 20% sobre o novo preço.')],
          ask: 'Qual é o preço final?',
          options: [
            ok('R$ 115,20'),
            no('R$ 120,00', 'O desconto incide sobre R$ 144,00 (o preço já aumentado) e tira R$ 28,80, mais que os R$ 24,00 do aumento.'),
            no('R$ 96,00', 'R$ 96,00 aplica só o desconto (120 × 0,8) e esquece o aumento. O desconto vem depois do aumento: 144 × 0,8 = R$ 115,20.'),
            no('R$ 124,80', 'R$ 124,80 seria 4% a MAIS que o preço inicial. Subir e descer 20% faz perder 4%: 120 × 1,2 × 0,8 = R$ 115,20.'),
          ],
          hints: ['Primeiro o aumento: 120 × 1,2 = 144.', 'Depois o desconto sobre 144: × 0,8.'],
          solution: ['120 × 1,2 × 0,8 = 120 × 0,96 = R$ 115,20.'],
        }),
        classify({
          ask: 'Cada multiplicação representa um aumento ou um desconto? (Leve cada fator para o grupo certo.)',
          bins: ['Aumento', 'Desconto'],
          items: [
            { text: '× 1,08', bin: 0, why: '1,08 = 1 + 0,08: aumento de 8%.' },
            { text: '× 0,92', bin: 1, why: '0,92 = 1 − 0,08: desconto de 8%.' },
            { text: '× 1,5', bin: 0, why: '1,5 = 1 + 0,5: aumento de 50%.' },
            { text: '× 0,5', bin: 1, why: '0,5 = 1 − 0,5: desconto de 50%.' },
            { text: '× 2', bin: 0, why: '× 2 dobra o valor: aumento de 100%.' },
            { text: '× 0,99', bin: 1, why: '0,99 = 1 − 0,01: desconto de 1%.' },
          ],
          hints: ['Fator maior que 1: o valor cresce.', 'Fator entre 0 e 1: o valor diminui.'],
          solution: ['Aumentos: 1,08; 1,5; 2. Descontos: 0,92; 0,5; 0,99.'],
        }),
      ],
      challenge: [
        gen(chainGen),
        gen(chain3Gen),
        numeric({
          prompt: [p('Um armazém tinha 1.500 sacas de café. Numa semana, saíram 30% das sacas; na seguinte, chegou um reforço igual a 40% do que havia restado.')],
          ask: 'Quantas sacas passou a haver no armazém?',
          unit: 'sacas',
          answer: 1470,
          wrong: [
            { value: 1650, feedback: 'Somar as taxas (−30% + 40% = +10%) ignora que o reforço é calculado sobre o que restou (1.050), e não sobre 1.500.' },
            { value: 1050, feedback: '1.050 são as sacas que restaram depois da saída. Falta o reforço: 1.050 × 1,4.' },
            { value: 420, feedback: '420 é só o reforço (40% de 1.050). O total é 1.050 + 420.' },
          ],
          solution: ['$1.500 × 0,7 = 1.050', '$1.050 × 1,4 = 1.470'],
        }),
      ],
      recap: [
        'Aumento de x%: × (1 + x/100).',
        'Desconto de x%: × (1 − x/100).',
        'Mudanças sucessivas: multiplique os fatores em sequência.',
        'Aumento e desconto iguais não se anulam: sobra 1 − (taxa)².',
      ],
    })),

    stage('equivalente', 'fundamentos', 'A taxa única equivalente', 'Encontrar o aumento ou desconto único que equivale a uma sequência de mudanças e entender por que somar as taxas erra.', () => ({
      learn: [
        text('Duas mudanças sucessivas equivalem a uma só, cujo fator é o **produto** dos fatores. Por isso 20% e depois 10% não dão 30%, mas 1,2 × 1,1 = 1,32: **32%**. Os 2 pontos a mais vêm do aumento de 10% aplicado sobre os 20% que já tinham sido acrescentados.'),
        lab({
          title: 'De onde vem a sobra',
          intro: 'Um valor de 100 recebe dois aumentos seguidos. A barra mostra cada pedaço do resultado.',
          params: [
            { key: 'a', label: '1º aumento', min: 0, max: 60, step: 5, value: 20, format: (v) => `+${v}%` },
            { key: 'b', label: '2º aumento', min: 0, max: 60, step: 5, value: 10, format: (v) => `+${v}%` },
          ],
          readouts: ({ a, b }) => [
            { label: 'Soma das taxas', value: `${a + b}%` },
            { label: 'Aumento sobre o aumento', value: `${num((a * b) / 100, 2)} pontos` },
            { label: 'Taxa equivalente', value: pct(((1 + a / 100) * (1 + b / 100) - 1) * 100), big: true, tone: 'brass' },
          ],
          viz: ({ a, b }) => ({
            kind: 'parts',
            segments: [
              { label: 'Valor inicial', value: 100, tone: 'parchment' },
              { label: '1º aumento', value: a, tone: 'brass' },
              { label: '2º aumento sobre o inicial', value: b, tone: 'verdigris' },
              { label: '2º aumento sobre o 1º', value: (a * b) / 100, tone: 'ember' },
            ],
            summary: `100 + ${a} + ${b} + ${num((a * b) / 100, 2)} = ${num((1 + a / 100) * (1 + b / 100) * 100, 2)}`,
          }),
          goal: {
            task: 'Ache dois aumentos cujo "aumento sobre o aumento" seja de exatamente 9 pontos.',
            done: ({ a, b }) => a * b === 900,
            success: 'Isso: o termo extra é a × b ÷ 100. Com 30% e 30%, por exemplo: 1,3 × 1,3 = 1,69, e 69 = 30 + 30 + 9.',
          },
          insight: 'Quanto maiores as taxas, maior o erro de simplesmente somá-las.',
        }),
        key('Taxa equivalente', 'Fator único = produto dos fatores. Taxa equivalente = fator único − 1. Exemplo: descontos de 30% e de 10% → 0,7 × 0,9 = 0,63, um desconto único de 37%.'),
        example('Três anos de reajuste', 'Um aluguel teve reajuste de 5% ao ano por três anos seguidos, sempre sobre o valor vigente. Qual foi o aumento total?', [
          askStep('A mesma taxa se repete três vezes.', 'Qual é o fator total?', [
            ok('1,05 × 1,05 × 1,05 = 1,05³ ≈ 1,1576'),
            no('1 + 3 × 0,05 = 1,15', 'Somar 3 × 5% ignora que cada reajuste incide sobre o valor já reajustado.'),
          ]),
          step('Aumento total:', '1,1576 − 1 ≈ 0,1576 = 15,76%'),
        ], 'O aumento total foi de cerca de 15,76%, e não 15%.'),
        check(numeric({
          prompt: [p('Um produto teve dois descontos sucessivos: 25% e, depois, 20% sobre o preço já reduzido.')],
          ask: 'Qual é o desconto único equivalente?',
          unit: '%',
          answer: 40,
          wrong: [
            { value: 45, feedback: 'Somar os descontos (25% + 20%) ignora que o segundo incide sobre o preço já reduzido: 0,75 × 0,8 = 0,6.' },
            { value: 60, feedback: '60% é o que sobra do preço (0,75 × 0,8). O desconto é 100% − 60% = 40%.' },
          ],
          solution: ['$0,75 × 0,8 = 0,6 → desconto de 40%'],
        })),
      ],
      practice: [
        gen(equivGen),
        gen(netChangeGen),
        choice({
          ask: 'Qual destas sequências de aumentos equivale a um único aumento de 50%?',
          options: [
            ok('+25% e depois +20%'),
            no('+30% e depois +20%', '1,3 × 1,2 = 1,56: equivale a um aumento de 56%.'),
            no('+25% e depois +25%', '1,25 × 1,25 = 1,5625: equivale a 56,25%.'),
            no('+40% e depois +10%', '1,4 × 1,1 = 1,54: equivale a 54%.'),
          ],
          hints: ['Multiplique os fatores de cada sequência.', 'Procure o produto igual a 1,5.'],
          solution: ['1,25 × 1,2 = 1,5: aumento único de 50%.'],
        }),
      ],
      challenge: [
        gen(equivGen),
        gen(netChangeGen),
        numeric({
          prompt: [p('O preço de uma passagem teve um aumento de 40% e, depois, um desconto de 40% sobre o novo preço.')],
          ask: 'Em relação ao preço inicial, de quanto foi a redução?',
          unit: '%',
          answer: 16,
          wrong: [
            { value: 0, feedback: 'Aumento e desconto de 40% não se anulam: 1,4 × 0,6 = 0,84.' },
            { value: 84, feedback: '84% é o preço final em relação ao inicial. A redução é 100% − 84% = 16%.' },
          ],
          solution: ['$1,4 × 0,6 = 0,84 → redução de 16%'],
        }),
      ],
      recap: [
        'Taxa equivalente = produto dos fatores − 1.',
        'Somar taxas esquece o "aumento sobre o aumento".',
        'A mesma taxa n vezes: fator (1 + taxa)ⁿ.',
      ],
    })),

    stage('reverter', 'interpretacao', 'Voltar ao valor de antes', 'Descobrir o valor anterior a uma sequência de mudanças, dividindo pelos fatores, e calcular o desconto que leva a um preço-alvo definido em relação ao valor original.', () => ({
      learn: [
        text('Para voltar no tempo, **divida** pelos fatores: se um preço foi multiplicado por 1,1 e depois por 1,2, o preço original é o atual ÷ (1,1 × 1,2). Diminuir os mesmos percentuais (−10% e −20%) não desfaz os aumentos, porque cada percentual seria calculado sobre outra base.'),
        lab({
          title: 'Desfazer um aumento',
          intro: 'Um preço de 100 recebe um aumento. Veja o desconto que o traz de volta e o que acontece com um desconto de mesma taxa.',
          params: [{ key: 'a', label: 'Aumento', min: 5, max: 100, step: 5, value: 25, format: (v) => `+${v}%` }],
          readouts: ({ a }) => [
            { label: 'Preço aumentado', value: num(100 + a, 2) },
            { label: 'Desconto que volta ao original', value: pct((1 - 1 / (1 + a / 100)) * 100), big: true, tone: 'brass' },
            { label: `Com desconto de ${a}%`, value: `${num((1 + a / 100) * (1 - a / 100) * 100, 2)} (abaixo de 100)` },
          ],
          viz: ({ a }) => ({
            kind: 'bars',
            bars: [
              { label: 'Original', value: 100, text: '100', tone: 'parchment' },
              { label: 'Aumentado', value: 100 + a, text: num(100 + a, 1), tone: 'verdigris' },
              { label: `Desconto de ${a}%`, value: (1 + a / 100) * (1 - a / 100) * 100, text: num((1 + a / 100) * (1 - a / 100) * 100, 1), tone: 'ember' },
            ],
            max: 200,
            refLine: { value: 100, label: 'original' },
            summary: `Depois de +${a}%, volta-se ao original com ${num((1 - 1 / (1 + a / 100)) * 100, 2)}% de desconto`,
          }),
          goal: {
            task: 'Ache o aumento que exige um desconto de exatamente 50% para voltar ao preço original.',
            done: ({ a }) => a === 100,
            success: 'Isso: dobrar o preço (+100%) e depois cortá-lo pela metade (−50%) volta ao original. 1 ÷ 2 = 0,5.',
          },
          insight: 'O desconto que desfaz um aumento é sempre menor que o aumento: ele é calculado sobre um valor maior.',
        }),
        key('Dividir pelos fatores', 'Valor original = valor atual ÷ (produto dos fatores). Para desfazer um fator f, multiplique por 1 ÷ f.'),
        example('O preço antes das liquidações', 'Um casaco teve dois descontos sucessivos, de 20% e de 25%, e passou a custar R$ 210,00. Quanto custava antes?', [
          step('Fator total dos descontos:', '0,8 × 0,75 = 0,6'),
          askStep('O preço atual é 0,6 do original.', 'Como encontrar o original?', [
            ok('210 ÷ 0,6 = R$ 350,00'),
            no('210 × 1,45 = R$ 304,50', 'Somar 20% + 25% e aplicar de volta não funciona: cada desconto foi calculado sobre outra base. Divida pelo fator total.'),
          ]),
        ], 'O casaco custava R$ 350,00.'),
        example('Desconto sobre o preço reajustado', 'Uma papelaria reajustou os preços em 20%. Agora quer uma promoção em que cada item custe 4% menos do que custava antes do reajuste. Que desconto deve aplicar sobre os preços reajustados?', [
          step('Preço desejado, em relação ao original:', '× 0,96'),
          askStep('Os preços atuais estão em × 1,2.', 'Que fator leva de 1,2 a 0,96?', [
            ok('0,96 ÷ 1,2 = 0,8'),
            no('0,96 − 1,2 = −0,24', 'Fatores se combinam por multiplicação: o fator procurado f satisfaz 1,2 × f = 0,96, ou seja, f = 0,96 ÷ 1,2.'),
          ]),
          step('Desconto:', '1 − 0,8 = 0,2 = 20%'),
        ], 'O desconto sobre os preços reajustados deve ser de 20%, e não de 24%.'),
        check(numeric({
          prompt: [p('Depois de um aumento de 25%, o preço de um tênis passou a R$ 350,00.')],
          ask: 'Qual era o preço antes do aumento?',
          prefix: 'R$',
          answer: 280,
          wrong: [
            { value: 262.5, feedback: 'R$ 262,50 tira 25% de R$ 350,00. Os 25% eram sobre o preço antigo: 350 ÷ 1,25 = R$ 280,00.' },
            { value: 325, feedback: 'Subtrair 25 reais não é o mesmo que desfazer 25%: 350 ÷ 1,25 = R$ 280,00.' },
          ],
          solution: ['$350 ÷ 1,25 = 280'],
        })),
      ],
      practice: [
        gen(backGen),
        gen(targetGen),
        spot({
          prompt: [p('Um celular teve um aumento de 10% e depois outro de 10%, chegando a R$ 1.210,00. Veja a resolução de um estudante para achar o preço inicial.')],
          ask: 'Qual linha tem o erro?',
          lines: ['Os dois aumentos têm fator 1,1 cada.', 'O fator total é 1,1 + 1,1 = 2,2.', 'O preço inicial é 1.210 ÷ 2,2 = R$ 550,00.'],
          wrong: 1,
          why: 'Fatores de mudanças sucessivas se MULTIPLICAM: 1,1 × 1,1 = 1,21. O preço inicial é 1.210 ÷ 1,21 = R$ 1.000,00.',
          hints: ['Confira como os fatores foram combinados.', 'Um aumento de 10% seguido de outro equivale a 21%, e não a 120%.'],
          solution: ['O fator total é 1,1 × 1,1 = 1,21; preço inicial: 1.210 ÷ 1,21 = R$ 1.000,00.'],
        }),
      ],
      challenge: [
        gen(backGen),
        gen(targetGen),
        numeric({
          prompt: [p('Um investimento perdeu 20% num mês e ganhou 10% no mês seguinte, sobre o valor que tinha, terminando com R$ 4.400,00.')],
          ask: 'Qual era o valor inicial do investimento?',
          prefix: 'R$',
          answer: 5000,
          wrong: [
            { value: 4888.89, feedback: 'Isso trata as mudanças como uma queda única de 10% (−20% + 10%). O fator certo é 0,8 × 1,1 = 0,88: 4.400 ÷ 0,88.' },
            { value: 4752, feedback: 'Isso aplica as taxas ao contrário sobre o valor final (+20% e −10%). Para voltar, divida pelos fatores: 4.400 ÷ 0,88.' },
            { value: 3872, feedback: 'Isso aplica as mudanças de novo sobre o valor final (4.400 × 0,88). Para voltar no tempo, divida.' },
          ],
          solution: ['$0,8 × 1,1 = 0,88', '$4.400 ÷ 0,88 = 5.000'],
        }),
      ],
      recap: [
        'Valor original = valor atual ÷ produto dos fatores.',
        'Desfazer um aumento de fator f: multiplique por 1 ÷ f.',
        'Preço-alvo em relação ao original: fator procurado = fator-alvo ÷ fator atual.',
      ],
    })),

    stage('produtos', 'aplicacoes', 'Grandezas que se multiplicam', 'Aplicar fatores a grandezas que são produtos — área e receita — e calcular o ganho real de um salário descontando a inflação.', () => ({
      learn: [
        text('Se uma grandeza é o **produto** de outras, a variação dela segue o produto dos fatores. A área de um retângulo é comprimento × largura; a receita de um evento é público × preço do ingresso. Já o **ganho real** de um salário compara dois fatores por **divisão**: o do salário e o dos preços.'),
        lab({
          title: 'Retângulo que muda',
          intro: 'Um retângulo tem comprimento 40 e largura 25. Mude cada medida e veja a área.',
          params: [
            { key: 'a', label: 'Comprimento', min: -30, max: 60, step: 5, value: 20, format: (v) => `${v > 0 ? '+' : ''}${v}%` },
            { key: 'b', label: 'Largura', min: -30, max: 60, step: 5, value: 10, format: (v) => `${v > 0 ? '+' : ''}${v}%` },
          ],
          readouts: ({ a, b }) => {
            const f = (1 + a / 100) * (1 + b / 100);
            return [
              { label: 'Fator da área', value: `${num(1 + a / 100, 2)} × ${num(1 + b / 100, 2)} = ${num(f, 4)}` },
              { label: 'Variação da área', value: `${f >= 1 ? '+' : ''}${pct((f - 1) * 100)}`, big: true, tone: 'brass' },
              { label: 'Soma das variações (engana)', value: `${a + b > 0 ? '+' : ''}${a + b}%` },
            ];
          },
          viz: ({ a, b }) => ({
            kind: 'shape',
            shape: 'rect',
            dims: [40 * (1 + a / 100), 25 * (1 + b / 100)],
            labels: [num(40 * (1 + a / 100), 1), num(25 * (1 + b / 100), 1)],
            summary: `Retângulo de ${num(40 * (1 + a / 100), 1)} por ${num(25 * (1 + b / 100), 1)}: área ${num(1000 * (1 + a / 100) * (1 + b / 100), 1)} (era 1.000)`,
          }),
          goal: {
            task: 'Com o comprimento 50% maior, ache a variação da largura que deixa a área exatamente 20% maior.',
            done: ({ a, b }) => a === 50 && b === -20,
            success: 'Isso: 1,5 × 0,8 = 1,2. A largura diminuiu, mas a área ainda cresceu 20%.',
          },
          insight: 'Variações de medidas que se multiplicam combinam-se pelos fatores, nunca pela soma.',
        }),
        key('Ganho real', 'Ganho real = (1 + reajuste) ÷ (1 + inflação) − 1. Um salário reajustado em 10% num ano de inflação de 4% compra 1,10 ÷ 1,04 ≈ 1,0577 do que comprava: ganho real de cerca de 5,77%, e não de 6%.'),
        example('Receita do show', 'Um show teve 2.000 pagantes a R$ 50,00. No ano seguinte, o público cresceu 10%, mas o ingresso ficou 10% mais barato. O que aconteceu com a receita?', [
          step('Fatores:', 'público × 1,1; ingresso × 0,9'),
          askStep('Receita = público × preço.', 'Qual é o fator da receita?', [
            ok('1,1 × 0,9 = 0,99'),
            no('+10% − 10% = 0: sem mudança', 'Somar as variações esquece que a receita é um PRODUTO: os fatores se multiplicam.'),
          ]),
          step('Receita:', 'R$ 100.000,00 → R$ 99.000,00'),
        ], 'A receita caiu 1%.'),
        check(numeric({
          prompt: [p('O lado de um terreno quadrado aumentou 10%.')],
          ask: 'De quanto aumentou a área do terreno?',
          unit: '%',
          answer: 21,
          wrong: [
            { value: 10, feedback: 'A área depende dos DOIS lados: 1,1 × 1,1 = 1,21.' },
            { value: 20, feedback: 'Somar os aumentos dos dois lados não serve: os fatores se multiplicam, 1,1 × 1,1 = 1,21.' },
            { value: 121, feedback: '121% é a área nova em relação à antiga. O aumento é 121% − 100% = 21%.' },
          ],
          solution: ['$1,1 × 1,1 = 1,21 → aumento de 21%'],
        })),
      ],
      practice: [gen(areaGen), gen(revenueGen), gen(realGainGen)],
      challenge: [
        gen(areaGen),
        gen(revenueGen),
        gen(realGainGen),
        numeric({
          prompt: [p('Num ano, a inflação foi de 8%, e o salário de Joana não teve reajuste.')],
          ask: 'Quanto Joana perdeu de poder de compra? Arredonde a duas casas decimais.',
          unit: '%',
          answer: 7.41,
          wrong: [
            { value: 8, feedback: 'Os preços subiram 8%, mas o salário passa a comprar 1 ÷ 1,08 ≈ 0,9259 do que comprava: perda de 7,41%.' },
            { value: 92.59, feedback: '92,59% é o poder de compra que restou. A perda é 100% − 92,59% = 7,41%.' },
          ],
          solution: ['$1 ÷ 1,08 ≈ 0,9259 → perda de 7,41%'],
        }),
      ],
      recap: [
        'Área = comprimento × largura: multiplique os fatores.',
        'Receita = público × preço: multiplique os fatores.',
        'Ganho real = fator do salário ÷ fator da inflação − 1.',
      ],
    })),

    stage('taxa-repetida', 'aprofundamento', 'A mesma taxa, várias vezes', 'Calcular o efeito de uma taxa repetida com potências e descobrir a taxa a partir do resultado final com raízes, inclusive quando a mesma taxa sobe e depois desce.', () => ({
      learn: [
        text('Quando a **mesma taxa** se repete n vezes, o fator é uma **potência**: crescer 20% ao mês por 3 meses é multiplicar por 1,2³ = 1,728. No caminho inverso, a taxa sai de uma **raiz**: se dois descontos iguais levaram um preço a 0,49 do original, cada fator é √0,49 = 0,7, ou seja, 30% de desconto em cada.'),
        lab({
          title: 'Crescimento repetido',
          intro: 'Um valor começa em 100 e cresce a mesma taxa em cada período. Compare com a "soma simples" das taxas.',
          params: [
            { key: 'x', label: 'Taxa por período', min: 1, max: 30, step: 1, value: 10, format: (v) => `${v}%` },
            { key: 'n', label: 'Períodos', min: 1, max: 12, step: 1, value: 3, format: (v) => `${v}` },
          ],
          readouts: ({ x, n }) => [
            { label: 'Fator total', value: `${num(1 + x / 100, 2)}^${n} = ${num((1 + x / 100) ** n, 4)}` },
            { label: 'Crescimento total', value: `+${pct(((1 + x / 100) ** n - 1) * 100)}`, big: true, tone: 'brass' },
            { label: 'Soma simples (engana)', value: `+${num(n * x)}%` },
          ],
          viz: ({ x, n }) => ({
            kind: 'chart',
            xLabel: 'Período',
            yLabel: 'Valor (início = 100)',
            xMin: 0,
            xMax: 12,
            yMin: 0,
            series: [
              { label: 'Taxa sobre taxa', tone: 'brass', points: Array.from({ length: n + 1 }, (_, k) => [k, 100 * (1 + x / 100) ** k] as [number, number]), dots: true },
              { label: 'Soma simples', tone: 'mist', points: Array.from({ length: n + 1 }, (_, k) => [k, 100 * (1 + (k * x) / 100)] as [number, number]), dashed: true },
            ],
            summary: `Depois de ${n} períodos de ${x}%: ${num(100 * (1 + x / 100) ** n, 1)} (a soma simples daria ${num(100 + n * x, 1)})`,
          }),
          goal: {
            task: 'Com 10% por período, ache o MENOR número de períodos em que o valor passa do dobro.',
            done: ({ x, n }) => x === 10 && n === 8,
            success: 'Isso: 1,1⁷ ≈ 1,95 e 1,1⁸ ≈ 2,14. Somando taxas, você esperaria dobrar só no 10º período.',
          },
          insight: 'Com taxa sobre taxa, o crescimento acelera: a curva se afasta cada vez mais da reta da soma simples.',
        }),
        key('Potência e raiz', 'Mesma taxa i por n períodos: fator (1 + i)ⁿ. Fator total F em 2 etapas iguais: cada fator é √F. Subir e descer a mesma taxa i: fator (1 + i)(1 − i) = 1 − i².'),
        example('Dois descontos iguais', 'Um tênis de R$ 250,00 passou por duas remarcações com o mesmo percentual de desconto, sobre o preço do momento, e foi vendido por R$ 122,50. Qual foi o desconto de cada remarcação?', [
          step('Fator total:', '122,50 ÷ 250 = 0,49'),
          askStep('Os dois fatores são iguais: f × f = 0,49.', 'Quanto vale f?', [
            ok('√0,49 = 0,7'),
            no('0,49 ÷ 2 = 0,245', 'Os fatores se multiplicam, então o fator de cada etapa é a RAIZ QUADRADA do total, e não a metade.'),
          ]),
          step('Desconto em cada remarcação:', '1 − 0,7 = 0,3 = 30%'),
        ], 'Cada remarcação foi de 30%.'),
        warn('Metade da queda total não é a taxa', 'A queda total foi de 51% (1 − 0,49), mas 25,5% em cada etapa daria 0,745² ≈ 0,555. Só a raiz recupera a taxa de cada etapa.'),
        check(numeric({
          prompt: [p('O preço de um produto subiu certa porcentagem e, depois, caiu a mesma porcentagem sobre o preço já aumentado, ficando 16% abaixo do preço inicial.')],
          ask: 'Qual foi a porcentagem de cada etapa?',
          unit: '%',
          answer: 40,
          wrong: [
            { value: 16, feedback: '16% é a perda total, que vale i². A taxa de cada etapa é a raiz: √0,16 = 0,4.' },
            { value: 8, feedback: 'Dividir a perda total entre as duas etapas não funciona: 1 − i² = 0,84, então i = √0,16 = 0,4.' },
          ],
          solution: ['$(1 + i)(1 − i) = 1 − i² = 0,84', '$i² = 0,16 → i = 0,4 = 40%'],
        })),
      ],
      practice: [gen(repeatGen), gen(sameRateGen), gen(upDownGen)],
      challenge: [gen(repeatGen), gen(sameRateGen), gen(upDownGen)],
      recap: [
        'Mesma taxa i, n vezes: fator (1 + i)ⁿ.',
        'Duas etapas iguais com fator total F: cada fator é √F.',
        'Subir e descer a mesma taxa i: sobra 1 − i².',
      ],
    })),

    stage('maestria', 'maestria', 'Maestria: cadeias de preço', 'Resolver problemas inéditos de etiqueta, desconto, taxa do cartão, frete e lucro, encadeando e desfazendo fatores.', () => ({
      learn: [
        strategy('Monte a corrente', '1) Escreva cada etapa como um fator (ou uma soma fixa, como o frete). 2) Siga a ordem dos acontecimentos. 3) Se a incógnita está no começo da corrente, desfaça de trás para a frente: tire as somas fixas e divida pelos fatores.'),
        example('A etiqueta certa', 'Uma loja quer receber R$ 171,00 por uma luminária depois de dar 10% de desconto sobre a etiqueta e de a operadora do cartão reter 5% do valor pago. Qual deve ser a etiqueta?', [
          step('Corrente:', 'etiqueta × 0,9 × 0,95 = valor recebido'),
          askStep('O valor recebido é R$ 171,00.', 'Como achar a etiqueta?', [
            ok('171 ÷ (0,9 × 0,95) = 171 ÷ 0,855 = R$ 200,00'),
            no('171 × 1,15 = R$ 196,65', 'Somar 10% + 5% e aplicar como aumento não desfaz a corrente: é preciso dividir pelos fatores.'),
          ]),
        ], 'A etiqueta deve ser de R$ 200,00.'),
        example('Lucro depois de tudo', 'Um artesão gasta R$ 50,00 para fazer um vaso e põe na etiqueta 60% a mais que o custo. Numa feira, vende o vaso com 20% de desconto, e a maquininha retém 4% do valor pago. Qual foi o lucro sobre o custo?', [
          step('Etiqueta:', '50 × 1,6 = R$ 80,00'),
          step('Preço pago:', '80 × 0,8 = R$ 64,00'),
          askStep('A maquininha retém 4%.', 'Quanto o artesão recebe?', [
            ok('64 × 0,96 = R$ 61,44'),
            no('64 − 4 = R$ 60,00', 'A retenção é de 4 POR CENTO do valor pago: 4% de 64 = R$ 2,56.'),
          ]),
          step('Lucro sobre o custo:', '(61,44 − 50) ÷ 50 = 0,2288 = 22,88%'),
        ], 'O lucro foi de 22,88% sobre o custo — bem menos que os 60% − 20% − 4% = 36% que uma conta ingênua sugeriria.'),
        check(numeric({
          prompt: [p('Um produto custa R$ 80,00 para uma loja. A loja vai dar 20% de desconto sobre a etiqueta e quer, depois do desconto, lucro de 25% sobre o custo.')],
          ask: 'Qual deve ser o preço de etiqueta?',
          prefix: 'R$',
          answer: 125,
          wrong: [
            { value: 120, feedback: 'Isso compensa o desconto com um aumento de 20% (100 × 1,2). Mas 20% de desconto sobre R$ 120,00 dá R$ 96,00. Divida: 100 ÷ 0,8.' },
            { value: 116, feedback: 'Somar 25% + 20% sobre o custo não serve: o desconto incide sobre a etiqueta, que é maior que o custo.' },
            { value: 100, feedback: 'R$ 100,00 é o preço COM desconto que dá o lucro desejado. A etiqueta é maior: 100 ÷ 0,8.' },
          ],
          solution: ['$Preço com desconto: 80 × 1,25 = 100', '$Etiqueta: 100 ÷ 0,8 = 125'],
        })),
      ],
      practice: [gen(tagGen), gen(profitGen), gen(targetGen)],
      challenge: [
        gen(tagShipGen),
        gen(profitGen),
        gen(tagGen),
        numeric({
          prompt: [p('Uma loja aumentou os preços em 25% e, tempos depois, deu um desconto sobre os preços aumentados. Com isso, cada produto ficou 10% mais caro que antes do aumento.')],
          ask: 'Qual foi o desconto dado sobre os preços aumentados?',
          unit: '%',
          answer: 12,
          wrong: [
            { value: 15, feedback: 'Subtrair as taxas (25% − 10%) não serve: o desconto incide sobre o preço aumentado. Fator: 1,1 ÷ 1,25 = 0,88.' },
            { value: 88, feedback: '88% é o que sobra do preço aumentado. O desconto é 100% − 88% = 12%.' },
            { value: 10, feedback: '10% é quanto o preço final está acima do ORIGINAL. O desconto, sobre o preço aumentado, é 1 − 1,1 ÷ 1,25.' },
          ],
          solution: ['$1,25 × f = 1,1 → f = 1,1 ÷ 1,25 = 0,88', '$Desconto: 1 − 0,88 = 12%'],
        }),
      ],
      recap: [
        'Corrente: custo × margem × (1 − desconto) × (1 − taxa), menos os custos fixos.',
        'Para achar a etiqueta, desfaça: some de volta os custos fixos e divida pelos fatores.',
        'Lucro sobre o custo = (valor recebido − custos) ÷ custo.',
      ],
    })),
  ],
});
