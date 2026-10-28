/**
 * Aula: Variação percentual — a variação sobre o valor anterior (e a assimetria de aumentos e
 * reduções), pontos percentuais × variação relativa, conversões antes de comparar, "x%
 * maior/menor que" e a referência, recuperar uma perda, maiores variações em tabelas, e
 * variações de grandezas compostas (parcelas, preço por quilo, área × produtividade, tempo
 * por unidade).
 */
import {
  askStep,
  barChart,
  check,
  choice,
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
  tip,
  warn,
} from '../../kit/build';
import { brl, hm, num, pct, qty, round } from '../../kit/format';
import type { Rand } from '../../types';

const isInt = (x: number) => Number.isInteger(round(x, 9));

// ———————————————————————————————————————————————— geradores

const CHANGE_CTX = [
  { what: 'O preço de uma passagem de ônibus intermunicipal', olds: [40, 50, 60, 80, 120, 150, 200, 240], unit: 'reais', fmt: (v: number) => brl(v) },
  { what: 'O número de visitantes de um museu num fim de semana', olds: [120, 150, 200, 240, 250, 400, 500, 800, 1500], unit: 'visitantes', fmt: (v: number) => num(v) },
  { what: 'A velocidade contratada da internet de uma escola', olds: [40, 50, 60, 80, 120, 200, 250, 400, 500], unit: 'Mbps', fmt: (v: number) => `${num(v)} Mbps` },
  { what: 'O gás de cozinha usado por mês num restaurante', olds: [40, 50, 60, 80, 120, 150, 200, 240, 250], unit: 'quilos', fmt: (v: number) => `${num(v)} kg` },
];

/** Variação percentual: (novo − antigo) ÷ antigo. */
function changeGen(r: Rand) {
  for (;;) {
    const c = r.pick(CHANGE_CTX);
    const old = r.pick(c.olds);
    const v = r.pick([-40, -30, -25, -24, -20, -15, -12, -10, 10, 12, 15, 20, 25, 30, 35, 40, 60]);
    const nw = (old * (100 + v)) / 100;
    if (!isInt(nw)) continue;
    // questões do banco
    if ((old === 200 && nw === 260) || (old === 40 && nw === 50) || (old === 1250 && nw === 1000) || (old === 50 && nw === 38)) continue;
    const diff = Math.abs(nw - old);
    const up = v > 0;
    return draftNumeric({
      prompt: [p(`${c.what} passou de ${c.fmt(old)} para ${c.fmt(nw)}.`)],
      ask: `Qual foi ${up ? 'o aumento' : 'a redução'} percentual?`,
      unit: '%',
      answer: Math.abs(v),
      wrong: [
        { value: round((100 * diff) / nw, 2), feedback: `Isso usa o valor NOVO como base (${num(diff)} ÷ ${num(nw)}). A variação é calculada sobre o valor anterior.` },
        { value: diff, feedback: `${num(diff)} é a variação em ${c.unit}. Em porcentagem, divida pelo valor anterior: ${num(diff)} ÷ ${num(old)}.` },
        { value: round((100 * nw) / old, 2), feedback: `${pct((100 * nw) / old)} é a razão entre o valor novo e o antigo. A ${up ? 'alta' : 'queda'} é a diferença para 100%.` },
      ],
      hints: [`Variação: ${num(nw)} − ${num(old)} = ${up ? '' : '−'}${num(diff)}.`, `Divida pela base, que é o valor ANTERIOR: ${num(diff)} ÷ ${num(old)}.`],
      solution: [`$${num(diff)} ÷ ${num(old)} = ${num(diff / old, 4)} = ${pct(Math.abs(v))}`],
    });
  }
}

const TIME_CTX = [
  (a: string, b: string) => `Depois de uma mudança na rota, uma viagem de ônibus que levava ${a} passou a levar ${b}.`,
  (a: string, b: string) => `Um forno industrial assava um lote de pães em ${a}. Depois de uma troca de equipamento, passou a assar o lote em ${b}.`,
  (a: string, b: string) => `A reunião semanal de uma equipe durava ${a}. Com uma nova pauta, passou a durar ${b}.`,
];

const AMOUNT_CTX = [
  {
    text: (a: string, b: string) => `Uma horta comunitária colhia ${a} de tomate por dia. Com uma estufa nova, passou a colher ${b} por dia.`,
    small: 'g',
    big: 'kg',
    starts: [2000, 2500, 3000, 3200, 3500, 4000],
    of: 'da colheita diária',
  },
  {
    text: (a: string, b: string) => `Uma família bebia ${a} de água filtrada por dia. No verão, passou a beber ${b} por dia.`,
    small: 'mL',
    big: 'L',
    starts: [1500, 2000, 2500, 3000],
    of: 'do consumo diário',
  },
];

/** Variação com conversão de unidades antes da conta (h e min; g e kg; mL e L). */
function unitChangeGen(r: Rand) {
  for (;;) {
    if (r.next() < 0.5) {
      const before = r.pick([60, 75, 80, 90, 100, 105, 120, 135, 150]);
      const v = r.pick([-50, -40, -30, -25, -20, 20, 25, 40, 50]);
      const after = (before * (100 + v)) / 100;
      if (!isInt(after) || (before === 75 && after === 45)) continue; // questão do banco
      const up = v > 0;
      const d = Math.abs(after - before);
      return draftNumeric({
        prompt: [p(r.pick(TIME_CTX)(hm(before / 60), hm(after / 60)))],
        ask: `Em relação ao tempo anterior, qual foi ${up ? 'o aumento' : 'a redução'} percentual?`,
        unit: '%',
        answer: Math.abs(v),
        wrong: [
          { value: round((100 * d) / after, 2), feedback: 'Isso usa o tempo NOVO como base. A variação é calculada sobre o tempo anterior.' },
          { value: d, feedback: `${d} min é a variação em MINUTOS. Em porcentagem, divida pelo tempo anterior (${before} min).` },
          { value: round((100 * after) / before, 2), feedback: 'Essa é a razão entre os tempos (novo ÷ anterior). A variação é a diferença para 100%.' },
        ],
        hints: [
          `Converta para minutos: ${hm(before / 60)} = ${before} min${after >= 60 ? ` e ${hm(after / 60)} = ${after} min` : ''}.`,
          `Variação: ${d} min, que devem ser divididos pelo tempo anterior.`,
        ],
        solution: [`$${hm(before / 60)} = ${before} min; ${hm(after / 60)} = ${after} min`, `$${d} ÷ ${before} = ${pct(Math.abs(v))}`],
      });
    }
    const c = r.pick(AMOUNT_CTX);
    const small = r.pick(c.starts);
    const v = r.pick([40, 60, 80, 100, 120, 150, 160]);
    const big = (small * (100 + v)) / 100000;
    if (!isInt(big * 100)) continue;
    if (small === 3250 && big === 7.8) continue; // questão do banco
    const bigSmall = round(big * 1000, 6);
    return draftNumeric({
      prompt: [p(c.text(`${num(small)} ${c.small}`, `${num(big, 2)} ${c.big}`))],
      ask: `Qual foi o aumento percentual ${c.of}?`,
      unit: '%',
      answer: v,
      wrong: [
        { value: 100 + v, feedback: `${pct(100 + v)} é a razão entre o valor novo e o inicial. O AUMENTO é a diferença para 100%.` },
        { value: round((100 * (bigSmall - small)) / bigSmall, 2), feedback: 'Isso usa o valor NOVO como base. O aumento é calculado sobre o valor inicial.' },
        { value: round(v / 100, 2), feedback: `Você achou a razão do aumento (${num(v / 100, 2)}), mas a resposta é em porcentagem: ${num(v / 100, 2)} = ${pct(v)}.` },
      ],
      hints: [`Use a mesma unidade: ${num(big, 2)} ${c.big} = ${num(bigSmall)} ${c.small}.`, `Aumento: ${num(bigSmall)} − ${num(small)} = ${num(bigSmall - small)} ${c.small}; divida pelo valor inicial.`],
      solution: [`$${num(bigSmall - small)} ÷ ${num(small)} = ${num((bigSmall - small) / small, 2)} = ${pct(v)}`],
    });
  }
}

const RATE_CTX = [
  { what: 'A proporção de estudantes de uma escola que vão de bicicleta', short: 'essa proporção', max: 60 },
  { what: 'A participação dos carros elétricos nas vendas de uma concessionária', short: 'essa participação', max: 40 },
  { what: 'O percentual de moradores de uma cidade que usam transporte coletivo', short: 'esse percentual', max: 70 },
  { what: 'A taxa de inadimplência dos clientes de uma loja', short: 'essa taxa', max: 25 },
];

/** Pontos percentuais × variação relativa. */
function ppGen(r: Rand) {
  for (;;) {
    const c = r.pick(RATE_CTX);
    const a = r.pick([4, 5, 8, 10, 12, 15, 16, 20, 25, 30, 40]);
    const rel = r.pick([-50, -25, -20, -10, 10, 20, 25, 50, 75]);
    const b = (a * (100 + rel)) / 100;
    if (!isInt(b * 10) || b <= 0 || b > c.max || a > c.max) continue;
    if ((a === 25 && b === 40) || (a === 8 && b === 10)) continue; // questões do banco
    const askPP = r.next() < 0.45;
    const diff = round(b - a, 2);
    const up = diff > 0;
    const d = Math.abs(diff);
    return draftNumeric({
      prompt: [p(`${c.what} passou de ${pct(a, 1)} para ${pct(b, 1)} em um ano.`)],
      ask: askPP
        ? `Em quantos pontos percentuais ${c.short} ${up ? 'subiu' : 'caiu'}?`
        : `Em termos relativos, com ${pct(a, 1)} como base, de quanto foi ${up ? 'o aumento' : 'a redução'}?`,
      unit: askPP ? 'pontos percentuais' : '%',
      answer: askPP ? d : Math.abs(rel),
      wrong: askPP
        ? [
            { value: Math.abs(rel), feedback: `${pct(Math.abs(rel))} é a variação RELATIVA (${num(d, 1)} ÷ ${num(a, 1)}). Em pontos percentuais, basta subtrair as taxas.` },
            { value: round((100 * d) / b, 2), feedback: 'Isso é uma variação relativa (e com a taxa nova como base). Em pontos percentuais, basta subtrair as taxas.' },
            { value: b, feedback: `${num(b, 1)}% é a taxa nova, e não a diferença entre as taxas.` },
          ]
        : [
            { value: d, feedback: `${num(d, 1)} é a diferença em PONTOS percentuais. A variação relativa divide essa diferença pela taxa inicial.` },
            { value: round((100 * d) / b, 2), feedback: 'Isso usa a taxa nova como base. A base é a taxa inicial.' },
            { value: round((100 * b) / a, 2), feedback: 'Essa é a razão entre as taxas (nova ÷ inicial). A variação é a diferença para 100%.' },
          ],
      hints: askPP
        ? ['Em pontos percentuais, basta subtrair as taxas: a nova menos a inicial.', 'Não divida pela taxa inicial: isso daria a variação relativa.']
        : [`Diferença: ${num(b, 1)} − ${num(a, 1)} = ${qty(diff, 'ponto percentual', 'pontos percentuais', 1)}.`, `Variação relativa: ${num(d, 1)} ÷ ${num(a, 1)}.`],
      solution: [`$${num(b, 1)} − ${num(a, 1)} = ${num(diff, 1)} p.p.`, ...(askPP ? [] : [`$${num(d, 1)} ÷ ${num(a, 1)} = ${pct(Math.abs(rel))}`])],
    });
  }
}

const REF_CTX = [
  { lead: (v: string) => `Em março, uma loja vendeu ${v} camisetas`, cmp: 'que em fevereiro', refName: 'as vendas de fevereiro', ask: 'Quantas camisetas a loja vendeu em fevereiro?', unit: 'camisetas', refs: [60, 80, 100, 120, 150, 200, 240, 300, 400] },
  { lead: (v: string) => `Neste mês, Lia correu ${v} km`, cmp: 'que Davi', refName: 'a distância corrida por Davi', ask: 'Quantos quilômetros Davi correu?', unit: 'km', refs: [40, 60, 80, 100, 120, 150] },
  { lead: (v: string) => `Neste ano, uma cidade reciclou ${v} toneladas de lixo`, cmp: 'que no ano passado', refName: 'o ano passado', ask: 'Quantas toneladas a cidade reciclou no ano passado?', unit: 'toneladas', refs: [80, 100, 120, 150, 200, 240, 300, 400] },
];

/** "x% menor (ou maior) que": a referência é o outro valor. */
function referenceGen(r: Rand) {
  for (;;) {
    const c = r.pick(REF_CTX);
    const ref = r.pick(c.refs);
    const x = r.pick([10, 20, 25, 30, 40, 50]);
    const less = r.next() < 0.6;
    const f = less ? 1 - x / 100 : 1 + x / 100;
    const val = round(ref * f, 6);
    if (!isInt(val) || (less && x === 25 && val === 75)) continue; // questão do banco
    return draftNumeric({
      prompt: [p(`${c.lead(num(val))}, ${pct(x)} a ${less ? 'menos' : 'mais'} ${c.cmp}. A comparação usa ${c.refName} como referência.`)],
      ask: c.ask,
      unit: c.unit,
      answer: ref,
      wrong: [
        { value: round(val * (less ? 1 + x / 100 : 1 - x / 100), 2), feedback: `Isso aplica ${pct(x)} sobre ${num(val)}, o valor dado. A referência é a outra quantidade: ${num(val)} = ${num(f, 2)} × referência.` },
        { value: less ? val + x : val - x, feedback: `${less ? 'Somar' : 'Subtrair'} ${x} ${c.unit} não é o mesmo que ${pct(x)}: a porcentagem é calculada sobre a referência.` },
        { value: round(val / (less ? 1 + x / 100 : 1 - x / 100), 2), feedback: `Esse seria o valor se ${num(val)} fosse ${pct(x)} ${less ? 'MAIOR' : 'MENOR'} que a referência.` },
      ],
      hints: [`${num(val)} = ${num(f, 2)} × referência.`, `Referência = ${num(val)} ÷ ${num(f, 2)}.`],
      solution: [`$${num(val)} = ${num(f, 2)} × R → R = ${num(val)} ÷ ${num(f, 2)} = ${num(ref)}`],
    });
  }
}

const LOSS_CTX = [
  { lead: (x: string) => `Durante uma obra na calçada, o movimento de uma loja caiu ${x}.`, ask: 'Quanto o movimento precisa crescer, sobre o movimento atual, para voltar ao nível de antes da obra? Arredonde a duas casas decimais.' },
  { lead: (x: string) => `Uma ação perdeu ${x} do seu valor em um mês.`, ask: 'Quanto ela precisa se valorizar, sobre o valor atual, para voltar ao valor anterior? Arredonde a duas casas decimais.' },
  { lead: (x: string) => `Com a estiagem, o volume de água de um reservatório diminuiu ${x}.`, ask: 'Quanto o volume atual precisa aumentar para voltar ao volume anterior? Arredonde a duas casas decimais.' },
];

const GAIN_CTX = [
  { lead: (x: string) => `Uma promoção aumentou em ${x} o número de visitas de um site. Terminada a promoção, as visitas voltaram ao nível anterior.`, ask: 'De quanto foi a redução, sobre o número de visitas durante a promoção? Arredonde a duas casas decimais.' },
  { lead: (x: string) => `Na alta temporada, a diária de um hotel fica ${x} mais cara. Na baixa temporada, volta ao preço anterior.`, ask: 'De quanto é a redução, sobre a diária da alta temporada? Arredonde a duas casas decimais.' },
];

/** Recuperar uma perda (ou desfazer um ganho): o fator de volta é 1 ÷ fator. */
function recoverGen(r: Rand) {
  for (;;) {
    const x = r.pick([5, 10, 15, 20, 25, 30, 40, 50]);
    const lost = r.next() < 0.65;
    if (lost && x === 10) continue; // questão do banco
    const f = lost ? 1 - x / 100 : 1 + x / 100;
    const back = 1 / f;
    const need = round(Math.abs(back - 1) * 100, 2);
    const c = r.pick(lost ? LOSS_CTX : GAIN_CTX);
    const other = lost ? 1 + x / 100 : 1 - x / 100;
    return draftNumeric({
      prompt: [p(c.lead(pct(x)))],
      ask: c.ask,
      unit: '%',
      answer: need,
      wrong: [
        { value: x, feedback: `${pct(x)} sobre o valor ${lost ? 'reduzido' : 'aumentado'} não volta ao nível anterior: ${num(f, 2)} × ${num(other, 2)} = ${num(f * other, 4)}.` },
        { value: round(Math.abs(1 / other - 1) * 100, 2), feedback: `Esse percentual desfaria ${lost ? 'um AUMENTO' : 'uma QUEDA'} de ${pct(x)}, e não ${lost ? 'uma queda' : 'um aumento'}.` },
        lost
          ? { value: 100 - x, feedback: `${pct(100 - x)} é o que restou em relação ao nível anterior, e não o aumento necessário.` }
          : { value: round(100 * back, 2), feedback: `${pct(100 * back)} é a razão entre o nível anterior e o atual. A redução é a diferença para 100%.` },
      ],
      hints: [`Depois da ${lost ? 'queda' : 'alta'}, o valor ficou multiplicado por ${num(f, 2)}.`, `Para voltar, multiplique por 1 ÷ ${num(f, 2)} = ${num(back, 4)}.`],
      solution: [`$1 ÷ ${num(f, 2)} = ${num(back, 4)} → ${lost ? 'aumento' : 'redução'} de ${pct(need)}`],
    });
  }
}

const SERIES_CTX = [
  { intro: 'Uma livraria registrou os livros vendidos em quatro meses seguidos.', periods: ['Março', 'Abril', 'Maio', 'Junho'], row: 'Livros vendidos', items: 'livros', plural: 'meses' },
  { intro: 'Um parque estadual registrou o número de visitantes em quatro anos seguidos.', periods: ['2021', '2022', '2023', '2024'], row: 'Visitantes', items: 'visitantes', plural: 'anos' },
  { intro: 'Uma cooperativa de reciclagem registrou o material recolhido em cada trimestre de um ano.', periods: ['1º tri', '2º tri', '3º tri', '4º tri'], row: 'Toneladas', items: 'toneladas', plural: 'trimestres' },
];

/** Maior variação percentual entre períodos consecutivos de uma tabela. */
function tableMaxGen(r: Rand) {
  for (;;) {
    const c = r.pick(SERIES_CTX);
    const v0 = r.pick([400, 500, 600, 800, 1000, 1200]);
    const rates = r.shuffle([-20, -10, 10, 15, 20, 25, 30, 40, 50]).slice(0, 3);
    if (rates.filter((x) => x > 0).length < 2) continue;
    const vals = [v0];
    for (const x of rates) vals.push((vals[vals.length - 1] * (100 + x)) / 100);
    if (!vals.every(isInt)) continue;
    if (v0 === 800 && vals[1] === 1000 && vals[2] === 900 && vals[3] === 1170) continue; // questão do banco
    const diffs = rates.map((_, i) => vals[i + 1] - vals[i]);
    const best = Math.max(...rates);
    const iBest = rates.indexOf(best);
    const second = Math.max(...rates.filter((x) => x > 0 && x !== best));
    const byUnits = rates[diffs.indexOf(Math.max(...diffs))];
    const overall = round((100 * (vals[3] - vals[0])) / vals[0], 2);
    return draftNumeric({
      prompt: [p(c.intro), table(['Período', ...c.periods], [[c.row, ...vals.map((v) => num(v))]])],
      ask: `Qual foi o maior aumento percentual entre dois ${c.plural} consecutivos?`,
      unit: '%',
      answer: best,
      wrong: [
        ...(byUnits !== best ? [{ value: byUnits, feedback: `Essa passagem tem o maior aumento em ${c.items}, mas não o maior em porcentagem: a base muda a cada período.` }] : []),
        { value: second, feedback: `${pct(second)} é o aumento de outra passagem, e não o maior. Calcule cada variação sobre o período ANTERIOR.` },
        { value: round((100 * diffs[iBest]) / vals[iBest + 1], 2), feedback: 'Isso usa o período de chegada como base. A variação é calculada sobre o período anterior.' },
        ...(overall > 0 ? [{ value: overall, feedback: 'Isso compara o primeiro com o último período, que não são consecutivos.' }] : []),
      ],
      hints: ['Calcule cada passagem: (novo − anterior) ÷ anterior.', `Compare as porcentagens, e não as diferenças em ${c.items}.`],
      solution: rates.map((x, i) => `$${c.periods[i]} → ${c.periods[i + 1]}: ${num(diffs[i])} ÷ ${num(vals[i])} = ${pct(x)}`),
    });
  }
}

const SHARE_CTX = [
  { lead: (s: string, o: string) => `O custo de fabricação de um móvel é formado pela madeira (${s}) e pelos demais custos (${o}).`, part: 'O preço da madeira', short: 'a madeira', total: 'o custo de fabricação do móvel' },
  { lead: (s: string, o: string) => `Nos gastos mensais de uma família, o aluguel representa ${s}, e as demais despesas, ${o}.`, part: 'O aluguel', short: 'o aluguel', total: 'o gasto mensal da família' },
  { lead: (s: string, o: string) => `No custo de uma refeição de um restaurante, os ingredientes representam ${s}, e os demais custos, ${o}.`, part: 'O custo dos ingredientes', short: 'os ingredientes', total: 'o custo da refeição' },
];

/** Parcelas de um total: se só uma parcela muda p%, o total muda (participação × p). */
function partChangeGen(r: Rand) {
  for (;;) {
    const c = r.pick(SHARE_CTX);
    const share = r.pick([20, 25, 30, 35, 40, 45, 60]);
    const x = r.pick([10, 12, 15, 20, 25, 30, 40]);
    if (share === 35 && x === 12) continue; // questão do banco
    const ans = (share * x) / 100;
    if (!isInt(ans * 100)) continue;
    const plural = c.short.endsWith('s');
    return draftNumeric({
      prompt: [p(`${c.lead(pct(share), pct(100 - share))} ${c.part} subiu ${pct(x)}, e as demais parcelas, em reais, não mudaram.`)],
      ask: `De quanto, em porcentagem, aumenta ${c.total}?`,
      unit: '%',
      answer: ans,
      wrong: [
        { value: x, feedback: `${pct(x)} seria o aumento se o total INTEIRO subisse. Só a parcela de ${pct(share)} subiu.` },
        { value: share + x, feedback: 'Somar a participação e o aumento não faz sentido. O aumento do total é a participação × o aumento da parcela.' },
        { value: round(((100 - share) * x) / 100, 2), feedback: `Isso aplica o aumento às OUTRAS parcelas (${pct(100 - share)}). Quem subiu foi ${c.short}.` },
      ],
      hints: [`Imagine um total de 100: ${c.short} ${plural ? 'valem' : 'vale'} ${share} e ${plural ? 'passam' : 'passa'} a ${num(share * (1 + x / 100), 2)}.`, `O total vai de 100 para ${num(100 + ans, 2)}.`],
      solution: [`$Aumento: ${pct(x)} de ${share} = ${num(ans, 2)} → o total sobe ${pct(ans)}`],
    });
  }
}

const PACK_CTX = [
  { item: 'certo sabão em pó', pack: 'caixas', sold: 'vendidas', g1s: [500, 800, 1000], g2s: [400, 450, 600, 700, 900] },
  { item: 'certo arroz integral', pack: 'pacotes', sold: 'vendidos', g1s: [500, 1000], g2s: [400, 750, 800, 900] },
  { item: 'certa ração para gatos', pack: 'pacotes', sold: 'vendidos', g1s: [500, 600, 1000], g2s: [400, 450, 750, 800, 900] },
];

/** Preço por quilo quando a embalagem e o preço mudam juntos. */
function unitPriceChangeGen(r: Rand) {
  for (;;) {
    const c = r.pick(PACK_CTX);
    const g1 = r.pick(c.g1s);
    const g2 = r.pick(c.g2s);
    if (g1 === g2) continue;
    const p1 = r.pick([8, 10, 12, 15, 16, 18, 20, 24, 30]);
    const rel = r.pick([-20, -10, 10, 12.5, 20, 25]);
    const perKg1 = (p1 * 1000) / g1;
    const perKg2 = perKg1 * (1 + rel / 100);
    const p2 = (perKg2 * g2) / 1000;
    if (!isInt(p2 * 100) || !isInt(perKg1 * 100) || !isInt(perKg2 * 100)) continue;
    if (g1 === 500 && p1 === 18 && g2 === 400) continue; // questão do banco
    const packChange = round((Math.abs(p2 - p1) / p1) * 100, 2);
    const up = rel > 0;
    return draftNumeric({
      prompt: [p(`Um supermercado vendia ${c.item} em ${c.pack} de ${num(g1)} g, por ${brl(p1)}. Depois, o fabricante trocou a embalagem por ${c.pack} de ${num(g2)} g, ${c.sold} a ${brl(p2)}.`)],
      ask: `Considerando o preço por quilograma, qual foi ${up ? 'o aumento' : 'a redução'} percentual?`,
      unit: '%',
      answer: Math.abs(rel),
      wrong: [
        { value: packChange, feedback: 'Essa é a variação do preço da EMBALAGEM. A massa também mudou: compare o preço por quilo.' },
        { value: round((Math.abs(perKg2 - perKg1) / perKg2) * 100, 2), feedback: 'Isso usa o preço novo por quilo como base. A base é o preço antigo por quilo.' },
        { value: round((Math.abs(g1 - g2) / g1) * 100, 2), feedback: 'Isso compara só as massas das embalagens. O preço também mudou.' },
      ],
      hints: [`Preço por kg antes: ${brl(p1)} ÷ ${num(g1 / 1000, 2)} kg = ${brl(perKg1)}.`, `Depois: ${brl(p2)} ÷ ${num(g2 / 1000, 2)} kg = ${brl(perKg2)}.`],
      solution: [`$Antes: R$ ${num(perKg1, 2)} por kg; depois: R$ ${num(perKg2, 2)} por kg`, `$${num(Math.abs(perKg2 - perKg1), 2)} ÷ ${num(perKg1, 2)} = ${pct(Math.abs(rel))}`],
    });
  }
}

/** Grandeza que é produto de duas: as variações se multiplicam. */
function productChangeGen(r: Rand) {
  for (;;) {
    const a = r.pick([10, 20, 25, 50]);
    const b = r.pick([-20, -10, -5, 10, 20]);
    const total = (1 + a / 100) * (1 + b / 100);
    const ans = round((total - 1) * 100, 2);
    if (ans === 0) continue;
    const up = ans > 0;
    const sum = Math.abs(a + b);
    if (r.next() < 0.5) {
      const area = r.pick([200, 240, 250, 300, 400]);
      const prod = r.pick([40, 50, 60, 80]);
      const area2 = (area * (100 + a)) / 100;
      const prod2 = (prod * (100 + b)) / 100;
      if (!isInt(area2) || !isInt(prod2)) continue;
      if (area === 250 && prod === 60 && area2 === 300 && prod2 === 57) continue; // questão do banco
      return draftNumeric({
        prompt: [
          p('Um produtor de milho comparou duas safras seguidas.'),
          table(['Safra', 'Área plantada (ha)', 'Produtividade (sacas/ha)'], [['1ª', num(area), num(prod)], ['2ª', num(area2), num(prod2)]]),
        ],
        ask: `Da 1ª para a 2ª safra, qual foi ${up ? 'o aumento' : 'a redução'} percentual da produção total?`,
        unit: '%',
        answer: Math.abs(ans),
        wrong: [
          ...(sum > 0 ? [{ value: sum, feedback: `Somar as variações (${a > 0 ? '+' : ''}${num(a)}% e ${b > 0 ? '+' : ''}${num(b)}%) não serve: produção = área × produtividade, e os fatores se MULTIPLICAM.` }] : []),
          { value: round(total * 100, 2), feedback: 'Essa é a razão entre as produções (nova ÷ antiga). A variação é a diferença para 100%.' },
          { value: Math.abs(area2 * prod2 - area * prod), feedback: 'Essa é a variação em SACAS. Em porcentagem, divida pela produção da 1ª safra.' },
        ],
        hints: [`Produção da 1ª safra: ${num(area)} × ${num(prod)} = ${num(area * prod)} sacas.`, `2ª safra: ${num(area2)} × ${num(prod2)} = ${num(area2 * prod2)} sacas.`],
        solution: [`$${num(area2 * prod2)} ÷ ${num(area * prod)} = ${num(total, 4)} → ${up ? 'aumento' : 'redução'} de ${pct(Math.abs(ans))}`],
      });
    }
    const n = r.pick([300, 400, 500, 600, 800]);
    const t = r.pick([20, 25, 30, 40]);
    const n2 = (n * (100 + a)) / 100;
    const t2 = (t * (100 + b)) / 100;
    const part1 = (n * t) / 100;
    const part2 = (n2 * t2) / 100;
    // Com 100 frequentadores, a variação em pessoas coincidiria com a porcentual.
    if (!isInt(n2) || !isInt(t2 * 10) || !isInt(part1) || !isInt(part2) || part1 === 100) continue;
    if (n === 400 && t === 30 && n2 === 450) continue; // questão do banco
    return draftNumeric({
      prompt: [p(`Um clube tinha ${num(n)} sócios, e ${pct(t)} deles frequentavam a academia do clube. No ano seguinte, o clube passou a ter ${num(n2)} sócios, e ${pct(t2, 1)} deles frequentaram a academia.`)],
      ask: `Qual foi ${up ? 'o aumento' : 'a redução'} percentual do número de sócios que frequentam a academia?`,
      unit: '%',
      answer: Math.abs(ans),
      wrong: [
        { value: Math.abs(round(t2 - t, 2)), feedback: 'Essa é a diferença em PONTOS percentuais da taxa de frequência. A pergunta é sobre o número de sócios na academia.' },
        { value: Math.abs(b), feedback: 'Essa é a variação da TAXA de frequência. O total de sócios também mudou.' },
        { value: Math.abs(part2 - part1), feedback: `${num(Math.abs(part2 - part1))} é a variação em número de pessoas. Em porcentagem, divida por ${num(part1)}.` },
        ...(sum > 0 ? [{ value: sum, feedback: 'Somar as variações (do total de sócios e da taxa) não serve: frequentadores = sócios × taxa, e os fatores se MULTIPLICAM.' }] : []),
      ],
      hints: [`Frequentadores antes: ${pct(t)} de ${num(n)} = ${num(part1)}.`, `Depois: ${pct(t2, 1)} de ${num(n2)} = ${num(part2)}.`],
      solution: [`$${num(part1)} → ${num(part2)}: ${num(Math.abs(part2 - part1))} ÷ ${num(part1)} = ${pct(Math.abs(ans))}`],
    });
  }
}

const PACE_CTX = [
  { lead: (a: number, b: number) => `Uma máquina levava ${a} segundos para embalar um pacote. Depois de um ajuste, passou a levar ${b} segundos por pacote, sempre sem pausas.`, what: 'pacotes embalados por hora' },
  { lead: (a: number, b: number) => `Uma impressora levava ${a} segundos para imprimir cada cartaz. Com outra configuração de qualidade, passou a levar ${b} segundos por cartaz.`, what: 'cartazes impressos por hora' },
];

/** Tempo por unidade e quantidade por hora: a variação de uma é inversa à da outra. */
function rateTimeGen(r: Rand) {
  for (;;) {
    const t1 = r.pick([20, 24, 30, 36, 40, 45, 48, 50, 60]);
    const v = r.pick([-50, -40, -25, -20, -10, 20, 25, 50]);
    const t2 = (t1 * (100 + v)) / 100;
    if (!isInt(t2) || (t1 === 40 && t2 === 32)) continue; // questão do banco
    const ans = round((t1 / t2 - 1) * 100, 2);
    const up = ans > 0;
    const c = r.pick(PACE_CTX);
    return draftNumeric({
      prompt: [p(c.lead(t1, t2))],
      ask: `Qual foi ${up ? 'o aumento' : 'a redução'} percentual na quantidade de ${c.what}?`,
      unit: '%',
      answer: Math.abs(ans),
      wrong: [
        { value: Math.abs(v), feedback: `${pct(Math.abs(v))} é a variação do TEMPO por unidade. A quantidade por hora é inversa ao tempo: o fator é ${t1} ÷ ${t2}.` },
        { value: Math.abs(t1 - t2), feedback: 'Essa é a variação em segundos, e não em porcentagem.' },
        { value: round((t2 / t1) * 100, 2), feedback: 'Essa é a razão entre os tempos. A quantidade por hora segue o inverso dela.' },
        { value: round((t1 / t2) * 100, 2), feedback: 'Essa é a razão entre as quantidades por hora (nova ÷ antiga). A variação é a diferença para 100%.' },
      ],
      hints: [`Por hora: 3.600 ÷ ${t1} = ${num(3600 / t1, 2)} unidades antes; 3.600 ÷ ${t2} = ${num(3600 / t2, 2)} depois.`, 'Variação: (depois − antes) ÷ antes.'],
      solution: [`$Fator: ${t1} ÷ ${t2} = ${num(t1 / t2, 4)} → ${up ? 'aumento' : 'redução'} de ${pct(Math.abs(ans))}`],
    });
  }
}

// ———————————————————————————————————————————————— aula

export const VARIACAO_PERCENTUAL = lesson({
  id: 'variacao-percentual',
  topic: 'porcentagem',
  subtopics: ['variacao-percentual'],
  title: 'Variação percentual',
  summary:
    'Quanto algo mudou em porcentagem: a base é o valor anterior, pontos percentuais não são variação relativa, e grandezas compostas (preço por quilo, área × produtividade) mudam pelo produto das variações.',
  requires: ['porcentagem'],
  stages: [
    stage('variacao', 'descoberta', 'Quanto mudou, em porcentagem', 'Calcular aumentos e reduções percentuais sobre o valor anterior e perceber que subir e descer o mesmo valor não dá o mesmo percentual.', () => ({
      learn: [
        text('A **variação percentual** compara a mudança com o valor **anterior**: variação = (novo − antigo) ÷ antigo × 100. Um preço que vai de R$ 80,00 a R$ 100,00 sobe 20 ÷ 80 = 25%; voltar de R$ 100,00 a R$ 80,00 é cair 20 ÷ 100 = 20%.'),
        lab({
          title: 'Antes e depois',
          intro: 'Escolha um valor inicial e um valor final. Veja a variação calculada sobre o valor anterior.',
          params: [
            { key: 'a', label: 'Antes', min: 10, max: 200, step: 5, value: 80, format: (v) => num(v) },
            { key: 'b', label: 'Depois', min: 10, max: 200, step: 5, value: 100, format: (v) => num(v) },
          ],
          readouts: ({ a, b }) => [
            { label: 'Variação absoluta', value: `${b - a > 0 ? '+' : ''}${num(b - a)}` },
            { label: 'Variação percentual (base: antes)', value: `${b - a > 0 ? '+' : ''}${pct(((b - a) / a) * 100)}`, big: true, tone: 'brass' },
            { label: 'Se fosse de volta (base: depois)', value: `${a - b > 0 ? '+' : ''}${pct(((a - b) / b) * 100)}` },
          ],
          viz: ({ a, b }) => ({
            kind: 'bars',
            bars: [
              { label: 'Antes', value: a, text: num(a), tone: 'parchment' },
              { label: 'Depois', value: b, text: num(b), tone: b >= a ? 'verdigris' : 'ember' },
            ],
            max: 200,
            summary: `De ${num(a)} para ${num(b)}: ${pct(((b - a) / a) * 100)}`,
          }),
          goal: {
            task: 'Partindo de 80, escolha o valor final que representa uma REDUÇÃO de exatamente 25%.',
            done: ({ a, b }) => a === 80 && b === 60,
            success: 'Isso: de 80 para 60 é −25%. E de 60 de volta para 80 seria +33,33%: a base muda.',
          },
          insight: 'A mesma diferença em valor dá porcentagens diferentes conforme a base: subir e descer não se compensam em porcentagem.',
        }),
        key('A base é o valor anterior', 'Variação = (novo − antigo) ÷ antigo. Dividir pelo valor novo é o erro mais comum — e costuma estar entre as alternativas.'),
        example('Desperdício no refeitório', 'Depois de uma campanha, um refeitório passou a jogar fora 1.200 kg de comida por mês, contra 1.600 kg antes. Qual foi a redução percentual do desperdício?', [
          step('Variação absoluta:', '1.200 − 1.600 = −400 kg'),
          askStep('A base é o valor anterior.', 'Qual é a conta?', [
            ok('400 ÷ 1.600 = 25%'),
            no('400 ÷ 1.200 ≈ 33,3%', 'Isso usa o valor NOVO como base. A redução é sobre os 1.600 kg de antes.'),
          ]),
        ], 'O desperdício caiu 25%.'),
        warn('Razão não é variação', '1.200 ÷ 1.600 = 0,75 = 75% é a razão entre o novo e o antigo. A variação é 75% − 100% = −25%.'),
        check(numeric({
          prompt: [p('O preço de um livro passou de R$ 60,00 para R$ 72,00.')],
          ask: 'Qual foi o aumento percentual?',
          unit: '%',
          answer: 20,
          wrong: [
            { value: 16.67, feedback: 'Isso usa o preço NOVO como base (12 ÷ 72). O aumento é sobre o preço antigo: 12 ÷ 60.' },
            { value: 12, feedback: '12 é o aumento em REAIS. Em porcentagem: 12 ÷ 60.' },
            { value: 120, feedback: '120% é a razão 72 ÷ 60. O aumento é 120% − 100% = 20%.' },
          ],
          solution: ['$12 ÷ 60 = 0,2 = 20%'],
        })),
      ],
      practice: [
        gen(changeGen),
        numeric({
          prompt: [p('Uma padaria compra sempre 50 kg de farinha por semana. O preço do quilo caiu de R$ 4,00 para R$ 3,40.')],
          ask: 'Qual foi a redução percentual do gasto semanal com farinha?',
          unit: '%',
          answer: 15,
          wrong: [
            { value: 60, feedback: '60 são os CENTAVOS a menos por quilo. Em porcentagem do preço antigo: 0,60 ÷ 4,00.' },
            { value: 0.6, feedback: 'R$ 0,60 é a redução por quilo, em reais. Em porcentagem do preço antigo: 0,60 ÷ 4,00.' },
            { value: 17.65, feedback: 'Isso usa o preço NOVO como base (0,60 ÷ 3,40). A base é o preço anterior: 0,60 ÷ 4,00.' },
            { value: 30, feedback: '30 é a economia semanal em REAIS (50 × 0,60). Em porcentagem do gasto antigo (R$ 200,00): 30 ÷ 200.' },
          ],
          hints: ['Com a mesma quantidade comprada, o gasto varia na mesma proporção do preço.', 'Redução por quilo: R$ 0,60. Divida pelo preço antigo.'],
          solution: ['$0,60 ÷ 4,00 = 0,15 = 15%'],
        }),
        choice({
          prompt: [p('Um produto teve o preço aumentado de R$ 50,00 para R$ 75,00. Depois, voltou a R$ 50,00.')],
          ask: 'Que afirmação é correta?',
          options: [
            ok('Subiu 50% e depois caiu 33,33%'),
            no('Subiu 50% e depois caiu 50%', 'A queda é calculada sobre R$ 75,00: 25 ÷ 75 ≈ 33,33%, e não 50%.'),
            no('Subiu 25% e depois caiu 25%', '25 é a variação em REAIS. Em porcentagem: 25 ÷ 50 = 50% de alta e 25 ÷ 75 ≈ 33,33% de queda.'),
            no('Subiu 33,33% e depois caiu 50%', 'As bases estão trocadas: a alta é sobre 50 (25 ÷ 50 = 50%) e a queda, sobre 75 (25 ÷ 75 ≈ 33,33%).'),
          ],
          hints: ['Cada variação usa o valor ANTERIOR a ela como base.', 'A alta tem base 50; a queda tem base 75.'],
          solution: ['Alta: 25 ÷ 50 = 50%. Queda: 25 ÷ 75 ≈ 33,33%.'],
        }),
      ],
      challenge: [
        gen(changeGen),
        numeric({
          prompt: [p('Um restaurante trocou a máquina de lavar louça, e o consumo de água por dia caiu de 600 para 450 litros.')],
          ask: 'Qual foi a redução percentual no consumo diário de água?',
          unit: '%',
          answer: 25,
          wrong: [
            { value: 33.33, feedback: 'Isso usa o consumo NOVO como base (150 ÷ 450). A redução é sobre o consumo anterior: 150 ÷ 600.' },
            { value: 150, feedback: '150 é a redução em LITROS. Em porcentagem: 150 ÷ 600.' },
            { value: 75, feedback: '75% é a razão 450 ÷ 600. A redução é 100% − 75% = 25%.' },
          ],
          solution: ['$150 ÷ 600 = 25%'],
        }),
      ],
      recap: [
        'Variação = (novo − antigo) ÷ antigo × 100.',
        'A base é sempre o valor ANTERIOR.',
        'Razão novo ÷ antigo − 100% = variação.',
        'Subir e descer o mesmo valor dá porcentagens diferentes.',
      ],
    })),

    stage('pontos', 'fundamentos', 'Pontos percentuais e unidades', 'Distinguir a diferença em pontos percentuais da variação relativa e converter unidades (horas e minutos, gramas e quilos) antes de calcular a variação.', () => ({
      learn: [
        text('Quando a própria grandeza já é uma porcentagem, há duas maneiras de falar da mudança. Se uma taxa vai de 10% para 12%, ela subiu **2 pontos percentuais** (12 − 10) — e, em termos relativos, subiu **20%** (2 ÷ 10).'),
        lab({
          title: 'Pontos ou por cento?',
          intro: 'Escolha a taxa inicial e a taxa final de um indicador (em %).',
          params: [
            { key: 'a', label: 'Taxa inicial', min: 2, max: 50, step: 1, value: 10, format: (v) => `${v}%` },
            { key: 'b', label: 'Taxa final', min: 2, max: 50, step: 1, value: 12, format: (v) => `${v}%` },
          ],
          readouts: ({ a, b }) => [
            { label: 'Diferença', value: `${b - a > 0 ? '+' : ''}${num(b - a)} pontos percentuais`, big: true, tone: 'sky' },
            { label: 'Variação relativa', value: `${b - a > 0 ? '+' : ''}${pct(((b - a) / a) * 100)}`, big: true, tone: 'brass' },
          ],
          viz: ({ a, b }) => ({
            kind: 'bars',
            bars: [
              { label: 'Inicial', value: a, text: `${a}%`, tone: 'parchment' },
              { label: 'Final', value: b, text: `${b}%`, tone: b >= a ? 'verdigris' : 'ember' },
            ],
            max: 50,
            summary: `De ${a}% para ${b}%: ${num(b - a)} pontos percentuais, ou ${pct(((b - a) / a) * 100)} em termos relativos`,
          }),
          goal: {
            task: 'Encontre um par de taxas em que a diferença seja de 3 pontos percentuais e a variação relativa, de 50%.',
            done: ({ a, b }) => b - a === 3 && a === 6,
            success: 'Isso: de 6% para 9% são 3 pontos percentuais, e 3 ÷ 6 = 50% de aumento relativo.',
          },
          insight: 'A mesma diferença em pontos pode ser uma variação relativa enorme (de 2% para 5%: +150%) ou pequena (de 40% para 43%: +7,5%).',
        }),
        key('Duas medidas diferentes', 'Pontos percentuais = taxa nova − taxa antiga. Variação relativa = (taxa nova − taxa antiga) ÷ taxa antiga × 100.'),
        example('Horas e minutos', 'Com uma ciclovia nova, Rafa passou a ir para a escola em 52 min; antes, de ônibus, levava 1 h 20 min. Qual foi a redução percentual do tempo?', [
          askStep('Primeiro, a mesma unidade.', 'Quanto é 1 h 20 min?', [
            ok('80 min'),
            no('120 min', 'Uma hora tem 60 minutos, e não 100: 1 h 20 min = 60 + 20 = 80 min.'),
          ]),
          step('Redução:', '(80 − 52) ÷ 80 = 28 ÷ 80 = 35%'),
        ], 'O tempo caiu 35%.'),
        warn('Converta antes de dividir', '3.200 g e 7,2 kg não se comparam direto: 7,2 kg = 7.200 g. Só então: (7.200 − 3.200) ÷ 3.200 = 125%.'),
        check(numeric({
          prompt: [p('Numa escola, a proporção de estudantes que vão de bicicleta passou de 30% para 42%.')],
          ask: 'Em quantos pontos percentuais essa proporção aumentou?',
          unit: 'pontos percentuais',
          answer: 12,
          wrong: [
            { value: 40, feedback: '40% é a variação RELATIVA (12 ÷ 30). Em pontos percentuais: 42 − 30.' },
            { value: 42, feedback: '42% é a proporção nova, e não o aumento.' },
          ],
          solution: ['$42 − 30 = 12 pontos percentuais'],
        })),
      ],
      practice: [gen(ppGen), gen(unitChangeGen)],
      challenge: [
        gen(ppGen),
        gen(unitChangeGen),
        numeric({
          prompt: [p('A participação dos carros elétricos nas vendas de uma concessionária passou de 15% para 21%. O gerente quer a variação relativa, com 15% como base.')],
          ask: 'Qual foi o aumento percentual relativo?',
          unit: '%',
          answer: 40,
          wrong: [
            { value: 6, feedback: '6 é a diferença em PONTOS percentuais. A variação relativa é 6 ÷ 15.' },
            { value: 28.57, feedback: 'Isso usa 21% como base. A base é 15%: 6 ÷ 15.' },
            { value: 140, feedback: '140% é a razão 21 ÷ 15. O aumento é 140% − 100% = 40%.' },
          ],
          solution: ['$(21 − 15) ÷ 15 = 6 ÷ 15 = 40%'],
        }),
      ],
      recap: [
        'Pontos percentuais: diferença direta entre taxas.',
        'Variação relativa: diferença ÷ taxa antiga.',
        'Converta unidades (h → min; kg → g) antes de calcular.',
      ],
    })),

    stage('referencia', 'interpretacao', 'Referência, recuperação e tabelas', 'Interpretar "x% maior/menor que" a partir da referência, calcular o aumento que recupera uma perda e encontrar a maior variação em tabelas e gráficos.', () => ({
      learn: [
        text('Em "A é 20% menor que B", a referência é **B**: A = 0,8 × B. Se A = 60, então B = 60 ÷ 0,8 = 75 — e não 60 × 1,2 = 72. Pelo mesmo motivo, uma queda de 20% não se recupera com 20% de alta: 0,8 × 1,2 = 0,96. É preciso 1 ÷ 0,8 = 1,25, ou seja, **+25%**.'),
        lab({
          title: 'Perder e recuperar',
          intro: 'Uma produção cai uma certa porcentagem. Veja quanto ela precisa crescer, sobre o valor reduzido, para voltar ao nível anterior.',
          params: [{ key: 'x', label: 'Queda', min: 5, max: 75, step: 5, value: 20, format: (v) => `−${v}%` }],
          readouts: ({ x }) => [
            { label: 'Depois da queda', value: `× ${num(1 - x / 100, 2)}` },
            { label: 'Alta necessária para voltar', value: `+${pct((1 / (1 - x / 100) - 1) * 100)}`, big: true, tone: 'brass' },
            { label: 'Com uma alta igual à queda', value: `${pct((1 - x / 100) * (1 + x / 100) * 100)} do nível anterior` },
          ],
          viz: ({ x }) => ({
            kind: 'bars',
            bars: [
              { label: 'Queda', value: x, text: `−${x}%`, tone: 'ember' },
              { label: 'Recuperação', value: (1 / (1 - x / 100) - 1) * 100, text: `+${num((1 / (1 - x / 100) - 1) * 100, 1)}%`, tone: 'verdigris' },
            ],
            max: 300,
            summary: `Cair ${x}% exige subir ${num((1 / (1 - x / 100) - 1) * 100, 1)}% para recuperar`,
          }),
          goal: {
            task: 'Ache a queda que exige exatamente DOBRAR o valor reduzido para recuperar (+100%).',
            done: ({ x }) => x === 50,
            success: 'Isso: cair 50% deixa a metade; para voltar, é preciso dobrar (+100%).',
          },
          insight: 'Quanto maior a queda, mais desproporcional fica a recuperação.',
        }),
        key('O fator de volta', 'Depois de uma variação de fator f, volta-se ao valor original multiplicando por 1 ÷ f. Queda de 20% (f = 0,8) → alta de 1 ÷ 0,8 − 1 = 25%. Alta de 25% (f = 1,25) → queda de 1 − 1 ÷ 1,25 = 20%.'),
        example('A maior alta da tabela', [
          p('As vendas de uma loja em quatro meses foram:'),
          table(['Mês', 'Jan.', 'Fev.', 'Mar.', 'Abr.'], [['Unidades', '600', '750', '500', '650']]),
          p('Qual foi o maior aumento percentual entre meses consecutivos?'),
        ], [
          step('Jan. → Fev.:', '150 ÷ 600 = 25%'),
          step('Fev. → Mar.:', '−250 ÷ 750 ≈ −33,3% (queda)'),
          askStep('Mar. → Abr.: também 150 unidades a mais.', 'Qual é a variação?', [
            ok('150 ÷ 500 = 30%'),
            no('150 ÷ 600 = 25%, igual à 1ª passagem', 'Cada passagem usa o mês ANTERIOR como base: aqui, 500.'),
          ]),
        ], 'O maior aumento foi de 30%, de março para abril: o mesmo acréscimo de 150 unidades da 1ª passagem, mas sobre uma base menor.'),
        tip('Gráficos de barras', 'Ao comparar barras, leia os valores e calcule cada variação sobre a barra anterior: a maior diferença de altura nem sempre é o maior aumento percentual.'),
        check(numeric({
          prompt: [p('Ana leu 84 páginas numa semana, 30% a menos que Bruno, usando as páginas de Bruno como referência.')],
          ask: 'Quantas páginas Bruno leu?',
          unit: 'páginas',
          answer: 120,
          wrong: [
            { value: 109.2, feedback: 'Isso aumenta 30% sobre as páginas de ANA. A referência é Bruno: 84 = 0,7 × B.' },
            { value: 114, feedback: 'Somar 30 páginas não é o mesmo que 30%.' },
          ],
          solution: ['$84 = 0,7 × B → B = 84 ÷ 0,7 = 120 páginas'],
        })),
      ],
      practice: [gen(referenceGen), gen(recoverGen), gen(tableMaxGen)],
      challenge: [
        gen(referenceGen),
        gen(recoverGen),
        gen(tableMaxGen),
        numeric({
          prompt: [
            p('O gráfico mostra o público pagante das quatro edições de um festival de música.'),
            barChart(
              [
                { label: '1ª edição', value: 12000 },
                { label: '2ª edição', value: 15000 },
                { label: '3ª edição', value: 16500 },
                { label: '4ª edição', value: 19800 },
              ],
              'Público pagante',
              'pessoas',
            ),
          ],
          ask: 'Qual foi o aumento percentual do público da 1ª para a 3ª edição?',
          unit: '%',
          answer: 37.5,
          wrong: [
            { value: 25, feedback: '25% é o aumento da 1ª para a 2ª edição. Da 1ª para a 3ª: 4.500 ÷ 12.000.' },
            { value: 10, feedback: '10% é o aumento da 2ª para a 3ª edição. Da 1ª para a 3ª: 4.500 ÷ 12.000.' },
            { value: 27.27, feedback: 'Isso usa a 3ª edição como base. A base é a 1ª: 4.500 ÷ 12.000.' },
            { value: 137.5, feedback: '137,5% é a razão 16.500 ÷ 12.000. O aumento é 137,5% − 100% = 37,5%.' },
          ],
          solution: ['$(16.500 − 12.000) ÷ 12.000 = 4.500 ÷ 12.000 = 37,5%'],
        }),
      ],
      recap: [
        '"A é x% menor que B": A = (1 − x/100) × B; a referência é B.',
        'Recuperar uma queda de fator f: multiplique por 1 ÷ f.',
        'Em tabelas: cada variação sobre o período anterior.',
      ],
    })),

    stage('composta', 'aplicacoes', 'Variações de grandezas compostas', 'Calcular a variação de totais formados por parcelas, de preços por unidade, de produtos (área × produtividade, total × taxa) e de quantidades por hora quando o tempo por unidade muda.', () => ({
      learn: [
        text('Muitas grandezas são formadas por outras. Se só **uma parcela** de um custo sobe, o total sobe menos: uma parcela de 40% que aumenta 10% faz o total subir 0,4 × 10% = 4%. Se a grandeza é um **produto** (produção = área × produtividade), as variações se multiplicam: +20% e −5% dão 1,2 × 0,95 = 1,14, ou seja, +14%.'),
        lab({
          title: 'Área e produtividade',
          intro: 'A produção de uma lavoura é área × produtividade. Mude cada uma e veja a variação da produção.',
          params: [
            { key: 'a', label: 'Variação da área', min: -30, max: 50, step: 5, value: 20, format: (v) => `${v > 0 ? '+' : ''}${v}%` },
            { key: 'b', label: 'Variação da produtividade', min: -30, max: 50, step: 5, value: -10, format: (v) => `${v > 0 ? '+' : ''}${v}%` },
          ],
          readouts: ({ a, b }) => {
            const f = (1 + a / 100) * (1 + b / 100);
            return [
              { label: 'Fator da produção', value: `${num(1 + a / 100, 2)} × ${num(1 + b / 100, 2)} = ${num(f, 4)}` },
              { label: 'Variação da produção', value: `${f >= 1 ? '+' : ''}${pct((f - 1) * 100)}`, big: true, tone: 'brass' },
              { label: 'Soma das variações (engana)', value: `${a + b > 0 ? '+' : ''}${a + b}%` },
            ];
          },
          goal: {
            task: 'Com a área 25% maior, ache a variação de produtividade que mantém a produção igual.',
            done: ({ a, b }) => a === 25 && b === -20,
            success: 'Isso: 1,25 × 0,8 = 1. Perder 20% compensa exatamente um ganho de 25%.',
          },
          insight: 'Variações de grandezas multiplicadas se combinam por multiplicação dos fatores, nunca por soma.',
        }),
        example('O chocolate que encolheu', 'Uma barra de chocolate de 200 g custava R$ 10,00. A nova barra tem 170 g e custa R$ 9,35. O preço do quilo subiu ou caiu, e quanto?', [
          step('Preço por kg antes:', '10,00 ÷ 0,2 = R$ 50,00'),
          askStep('Depois: R$ 9,35 por 170 g.', 'Qual é o preço por quilo?', [
            ok('9,35 ÷ 0,17 = R$ 55,00'),
            no('R$ 9,35, o preço da barra', 'A barra encolheu: compare o preço por QUILO, 9,35 ÷ 0,17.'),
          ]),
          step('Variação:', '(55 − 50) ÷ 50 = 10%'),
        ], 'O preço do quilo subiu 10%, embora a barra tenha ficado mais barata.'),
        key('Tempo por unidade × quantidade por hora', 'Se o tempo por peça cai de 60 s para 45 s (−25%), a quantidade por hora é multiplicada por 60 ÷ 45 ≈ 1,333: sobe cerca de 33,33%, e não 25%.'),
        check(numeric({
          prompt: [p('Uma compra on-line tem R$ 90,00 em livros e R$ 30,00 de frete. Um cupom dá 20% de desconto só nos livros.')],
          ask: 'Qual é a redução percentual no valor total da compra?',
          unit: '%',
          answer: 15,
          wrong: [
            { value: 20, feedback: '20% vale só para os livros. O frete não muda: o total cai de R$ 120,00 para R$ 102,00.' },
            { value: 18, feedback: '18 é a economia em REAIS. Em porcentagem do total antigo (R$ 120,00): 18 ÷ 120.' },
            { value: 17.65, feedback: 'Isso usa o total NOVO (R$ 102,00) como base. A base é o total antigo: 18 ÷ 120.' },
          ],
          solution: ['$Desconto: 20% de 90 = R$ 18,00', '$18 ÷ 120 = 15%'],
        })),
      ],
      practice: [gen(partChangeGen), gen(unitPriceChangeGen), gen(productChangeGen), gen(rateTimeGen)],
      challenge: [gen(partChangeGen), gen(unitPriceChangeGen), gen(productChangeGen), gen(rateTimeGen)],
      recap: [
        'Só uma parcela muda: variação do total = participação × variação da parcela.',
        'Preço por unidade: compare preço ÷ quantidade antes e depois.',
        'Produto de grandezas: multiplique os fatores.',
        'Tempo por unidade e quantidade por hora variam de forma inversa.',
      ],
    })),

    stage('maestria', 'maestria', 'Maestria: variação nos problemas difíceis', 'Resolver problemas inéditos que combinam variação percentual, referência, pontos percentuais e grandezas compostas.', () => ({
      learn: [
        strategy('Três perguntas', '1) Qual é a base (o valor ANTERIOR ou a referência citada)? 2) A grandeza é uma soma de parcelas ou um produto? 3) A pergunta quer pontos percentuais, variação relativa ou um valor?'),
        example('A mensalidade antes do reajuste', 'Uma academia reajustou a mensalidade em 20%, e ela passou a R$ 96,00. Para quem pagar o ano inteiro, a academia cobra 15% menos que a mensalidade anterior ao reajuste. Quanto custa a mensalidade no plano anual?', [
          askStep('Primeiro, a mensalidade antes do reajuste.', 'Qual era?', [
            ok('96 ÷ 1,2 = R$ 80,00'),
            no('96 × 0,8 = R$ 76,80', 'Os 20% eram sobre o valor ANTIGO: 96 = 1,2 × M, então M = 96 ÷ 1,2.'),
          ]),
          step('15% menos que R$ 80,00:', '80 × 0,85 = R$ 68,00'),
        ], 'No plano anual, a mensalidade é R$ 68,00.'),
        reveal('Por que "leve 5, pague 4" não é um desconto de 25%?', 'Você deixa de pagar 1 de cada 5 itens levados: o desconto é 1 ÷ 5 = 20% do que pagaria pelos 5. Os 25% aparecem quando se compara o item grátis com os 4 pagos (1 ÷ 4), mas a base do desconto é o preço cheio do que você leva.'),
        check(numeric({
          prompt: [p('Na loja A, quem leva 4 camisetas paga só 3. Na loja B, todas as camisetas têm 20% de desconto. O preço unitário é o mesmo nas duas.')],
          ask: 'Para quem compra 4 camisetas, em quantos pontos percentuais o desconto da loja A supera o da B?',
          unit: 'pontos percentuais',
          answer: 5,
          wrong: [
            { value: 25, feedback: '25% é o desconto da loja A (1 em 4). A pergunta é a diferença para os 20% da loja B.' },
            { value: 13.33, feedback: 'Isso compara a camiseta grátis com as 3 pagas (33,33%). O desconto é sobre as 4 levadas: 25%.' },
          ],
          solution: ['$Loja A: 1 ÷ 4 = 25%; loja B: 20%', '$Diferença: 25 − 20 = 5 pontos percentuais'],
        })),
      ],
      practice: [gen(referenceGen), gen(productChangeGen), gen(ppGen)],
      challenge: [
        choice({
          prompt: [p('No preço de uma passagem aérea, o combustível representa 40%, as taxas 25% e os demais custos 35%. O combustível ficou 15% mais caro, e as taxas caíram 20%; os demais custos não mudaram.')],
          ask: 'O que acontece com o preço da passagem?',
          options: [
            ok('Aumenta 1%'),
            no('Diminui 5%', 'Somar as variações (+15% e −20%) ignora o peso de cada parcela no preço.'),
            no('Aumenta 6%', '6% é só o efeito do combustível (0,40 × 15%). As taxas caíram: 0,25 × (−20%) = −5%.'),
            no('Aumenta 11%', 'A queda das taxas REDUZ o preço: o efeito total é 6% − 5% = 1%, e não 6% + 5%.'),
            no('Diminui 1%', 'O efeito do combustível (+6%) é maior que o das taxas (−5%): o preço SOBE 1%.'),
          ],
          solution: ['Combustível: 0,40 × 15% = +6%; taxas: 0,25 × (−20%) = −5%.', 'Total: +6% − 5% = +1%.'],
        }),
        gen(recoverGen),
        gen(unitPriceChangeGen),
        gen(tableMaxGen),
      ],
      recap: [
        'Base: o valor anterior ou a referência dita no enunciado.',
        'Parcelas: some os efeitos ponderados (participação × variação).',
        'Produtos: multiplique os fatores.',
        'Pontos percentuais ≠ variação relativa.',
      ],
    })),
  ],
});
