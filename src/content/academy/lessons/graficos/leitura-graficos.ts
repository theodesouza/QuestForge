/**
 * Aula: Leitura de gráficos — barras (somar períodos, parte do total, média), linhas
 * (variação absoluta e percentual, maior aumento, tendência constante), comparar com cuidado
 * (eixo cortado, absoluto × percentual, escalas de pictogramas) e maestria com duas séries.
 */
import {
  askStep,
  barChart,
  check,
  choice,
  compare,
  data,
  draftChoice,
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
import { brl, num, round } from '../../kit/format';
import type { Rand } from '../../types';

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
const MONTH_NAMES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho'];

const SERIES = [
  {
    title: 'Bicicletas alugadas por mês numa estação',
    unit: 'bicicletas',
    ask: (period: string) => `Quantas bicicletas foram alugadas ${period}?`,
    step: 10,
    range: [6, 20],
  },
  {
    title: 'Kits de lanche vendidos por mês na cantina',
    unit: 'kits',
    ask: (period: string) => `Quantos kits de lanche foram vendidos ${period}?`,
    step: 5,
    range: [10, 40],
  },
  {
    title: 'Mudas plantadas por mês num projeto de reflorestamento',
    unit: 'mudas',
    ask: (period: string) => `Quantas mudas foram plantadas ${period}?`,
    step: 25,
    range: [4, 16],
  },
];

const PERIODS = [
  { name: 'no 1º trimestre', months: [0, 1, 2] },
  { name: 'no 2º trimestre', months: [3, 4, 5] },
  { name: 'no 1º bimestre', months: [0, 1] },
  { name: 'no 2º bimestre', months: [2, 3] },
  { name: 'no 3º bimestre', months: [4, 5] },
  { name: 'de fevereiro a maio', months: [1, 2, 3, 4] },
];

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

// ———————————————————————————————————————————————— geradores: barras

/** Somar as barras de um período (trimestre, bimestre, intervalo de meses). */
function barSumGen(r: Rand) {
  for (;;) {
    const s = r.pick(SERIES);
    const values = MONTHS.map(() => s.step * r.int(s.range[0], s.range[1]));
    if (values[0] === 120 && values[1] === 150 && values[2] === 90) continue; // questão do banco
    const per = r.pick(PERIODS);
    const total = sum(per.months.map((m) => values[m]));
    const first = per.months[0];
    const last = per.months[per.months.length - 1];
    const extra = last < 5 ? last + 1 : first - 1;
    return draftNumeric({
      prompt: [barChart(MONTHS.map((label, i) => ({ label, value: values[i] })), s.title, s.unit)],
      ask: s.ask(per.name),
      unit: s.unit,
      answer: total,
      wrong: [
        { value: total - values[last], feedback: `Isso deixa de fora ${MONTH_NAMES[last]}. O período tem ${per.months.length} meses: ${per.months.map((m) => MONTH_NAMES[m]).join(', ')}.` },
        { value: total + values[extra], feedback: `Isso inclui ${MONTH_NAMES[extra]}, que não faz parte do período pedido.` },
        { value: sum(values), feedback: 'Esse é o total dos seis meses. A pergunta é só sobre o período indicado.' },
        { value: round(total / per.months.length, 2), feedback: 'Essa é a média mensal do período. A pergunta é o total.' },
      ],
      hints: [`O período abrange ${per.months.map((m) => MONTH_NAMES[m]).join(', ')}.`, `Some: ${per.months.map((m) => values[m]).join(' + ')}.`],
      solution: [`$${per.months.map((m) => values[m]).join(' + ')} = ${num(total)}`],
    });
  }
}

const SURVEYS = [
  { title: 'Como os estudantes vão para a escola', cats: ['Ônibus', 'A pé', 'Bicicleta', 'Carro'], who: 'estudantes', ask: (c: string) => `Que porcentagem dos estudantes vai ${c === 'A pé' ? 'a pé' : `de ${c.toLowerCase()}`} para a escola?` },
  { title: 'Fruta preferida dos clientes de uma feira', cats: ['Manga', 'Banana', 'Caju', 'Uva'], who: 'clientes', ask: (c: string) => `Que porcentagem dos clientes prefere ${c.toLowerCase()}?` },
  { title: 'Gênero de filme mais votado numa escola', cats: ['Comédia', 'Ação', 'Animação', 'Terror'], who: 'votos', ask: (c: string) => `Que porcentagem dos votos foi para ${c.toLowerCase()}?` },
];

/** A parte de uma barra no total: valor ÷ soma de todas as barras. */
function barPercentGen(r: Rand) {
  for (;;) {
    const s = r.pick(SURVEYS);
    const N = r.pick([200, 250, 400, 500]);
    const pcts = [r.int(2, 8) * 5, r.int(2, 8) * 5, r.int(2, 6) * 5];
    const last = 100 - sum(pcts);
    if (last < 5) continue;
    pcts.push(last);
    if (new Set(pcts).size < 4) continue;
    const counts = pcts.map((x) => (N * x) / 100);
    if (counts.some((c) => !Number.isInteger(c))) continue;
    const k = r.int(0, 3);
    const max = Math.max(...counts);
    return draftNumeric({
      prompt: [p(`Foram ouvidos ${N} ${s.who === 'votos' ? 'estudantes, cada um com um voto' : s.who}.`), barChart(s.cats.map((label, i) => ({ label, value: counts[i] })), s.title, s.who === 'votos' ? 'votos' : s.who)],
      ask: s.ask(s.cats[k]),
      unit: '%',
      answer: pcts[k],
      wrong: [
        { value: counts[k], feedback: 'Esse é o número lido na barra, e não a porcentagem. Divida pelo total.' },
        { value: round((100 * counts[k]) / max, 2), feedback: 'Isso compara com a maior barra, e não com o total de todas as barras.' },
        { value: 25, feedback: 'Isso supõe as quatro opções iguais. Cada uma tem a sua barra: divida o valor dela pelo total.' },
      ],
      hints: [`O total é a soma das barras: ${counts.join(' + ')} = ${N}.`, `Divida ${counts[k]} por ${N} e multiplique por 100.`],
      solution: [`$${counts[k]} ÷ ${N} = ${num(pcts[k] / 100)} = ${pcts[k]}%`],
    });
  }
}

const MEANS = [
  { title: 'Consumo de energia elétrica de uma casa (kWh)', unit: 'kWh', ask: 'Qual foi o consumo médio mensal no período?', base: [120, 220], spread: 30, labels: MONTHS },
  { title: 'Horas de estudo por semana de uma estudante', unit: 'h', ask: 'Quantas horas, em média, ela estudou por semana?', base: [8, 16], spread: 5, labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5'] },
  { title: 'Gás de cozinha usado por mês num restaurante (kg)', unit: 'kg', ask: 'Qual foi o consumo médio mensal de gás?', base: [40, 90], spread: 15, labels: MONTHS.slice(0, 5) },
];

/** Média das barras: soma ÷ quantidade de barras. */
function barMeanGen(r: Rand) {
  for (;;) {
    const s = r.pick(MEANS);
    const n = s.labels.length;
    const m = r.int(s.base[0], s.base[1]);
    const dev = Array.from({ length: n - 1 }, () => r.int(-s.spread, s.spread));
    dev.push(-sum(dev));
    if (Math.abs(dev[n - 1]) > s.spread) continue;
    const values = dev.map((d) => m + d);
    if (values.some((v) => v <= 0) || new Set(values).size < 3) continue;
    if (values.join() === '18,22,15,20,25,20') continue; // questão do banco
    const total = sum(values);
    const extremes = (Math.max(...values) + Math.min(...values)) / 2;
    return draftNumeric({
      prompt: [barChart(s.labels.map((label, i) => ({ label, value: values[i] })), s.title, s.unit)],
      ask: s.ask,
      unit: s.unit,
      answer: m,
      wrong: [
        { value: total, feedback: `Esse é o total do período. A média divide esse total pelas ${n} barras.` },
        { value: round(extremes, 2), feedback: 'Isso é a média só entre a maior e a menor barra. A média usa todas.' },
        { value: round(total / (n - 1), 2), feedback: `Isso divide por ${n - 1}. São ${n} barras.` },
      ],
      hints: [`Some as ${n} barras: ${values.join(' + ')} = ${total}.`, `Divida o total por ${n}.`],
      solution: [`$${values.join(' + ')} = ${total}`, `$${total} ÷ ${n} = ${m} ${s.unit}`],
    });
  }
}

// ———————————————————————————————————————————————— geradores: linhas e tendências

const TRENDS = [
  { title: 'Frota de táxis de uma cidade', unit: 'táxis', ask: (y: number) => `Mantido o mesmo ritmo, quantos táxis a cidade terá em ${y}?`, start: [60, 200], step: [5, 15], grows: true },
  { title: 'Estudantes matriculados numa escola técnica', unit: 'estudantes', ask: (y: number) => `Mantido o mesmo ritmo, quantos estudantes estarão matriculados em ${y}?`, start: [300, 600], step: [20, 45], grows: true },
  { title: 'Área de mata nativa de um município, em km²', unit: 'km²', ask: (y: number) => `Mantido o mesmo ritmo de perda, qual será a área de mata em ${y}?`, start: [400, 700], step: [10, 30], grows: false },
];

/** Tendência constante: o mesmo aumento a cada intervalo; contar intervalos até o ano pedido. */
function trendGen(r: Rand) {
  for (;;) {
    const s = r.pick(TRENDS);
    const y0 = r.pick([2000, 2002, 2004, 2006]);
    const h = r.pick([2, 4, 5]);
    const v0 = r.int(s.start[0], s.start[1]);
    const d = r.int(s.step[0], s.step[1]) * (s.grows ? 1 : -1);
    const years = [0, 1, 2, 3, 4].map((k) => y0 + k * h);
    const values = [0, 1, 2, 3, 4].map((k) => v0 + k * d);
    const j = r.int(2, 3);
    const yq = years[4] + j * h;
    const ans = values[4] + j * d;
    if (ans <= 0) continue;
    const ad = Math.abs(d);
    return draftNumeric({
      prompt: [barChart(years.map((y, i) => ({ label: String(y), value: values[i] })), s.title, s.unit)],
      ask: s.ask(yq),
      unit: s.unit,
      answer: ans,
      wrong: [
        { value: values[4] + d, feedback: `Isso avança um intervalo só. De ${years[4]} a ${yq} são ${j} intervalos de ${h} anos.` },
        ...(values[4] + d * (yq - years[4]) > 0
          ? [{ value: values[4] + d * (yq - years[4]), feedback: `Isso trata a variação de ${ad} como anual. Ela acontece a cada ${h} anos.` }]
          : []),
        { value: values[4] + (j + 1) * d, feedback: `Isso conta um intervalo a mais: de ${years[4]} a ${yq} são ${(yq - years[4]) / h} intervalos de ${h} anos.` },
      ],
      hints: [`A cada ${h} anos, o valor ${s.grows ? 'aumenta' : 'diminui'} ${ad}.`, `De ${years[4]} a ${yq}: (${yq} − ${years[4]}) ÷ ${h} = ${j} intervalos.`],
      solution: [`$variação por intervalo: ${values[1]} − ${values[0]} = ${num(d)}`, `$${values[4]} ${s.grows ? '+' : '−'} ${j} × ${ad} = ${ans}`],
    });
  }
}

const PRICES = [
  { title: 'Preço médio do quilo do tomate (R$)', unit: 'R$', money: true, what: 'o preço' },
  { title: 'Visitantes de um parque estadual, em milhares', unit: 'mil', money: false, what: 'o número de visitantes' },
  { title: 'Passagens vendidas por uma rodoviária, em centenas', unit: 'centenas', money: false, what: 'a venda de passagens' },
];

/** Variação percentual entre dois meses do gráfico. */
function pctChangeGen(r: Rand) {
  for (;;) {
    const s = r.pick(PRICES);
    const up = r.next() < 0.6;
    const v1 = r.pick(s.money ? [4, 5, 6, 8, 10] : [20, 25, 40, 50, 80]);
    const pct = r.pick(up ? [10, 20, 25, 30, 40, 50, 60] : [10, 20, 25, 40]);
    const v2 = round(v1 * (1 + ((up ? 1 : -1) * pct) / 100), 2);
    if (!s.money && !Number.isInteger(v2)) continue;
    if (s.money && pct === 50 && v1 === 4 && up) continue; // exercício da teoria
    const i1 = r.int(0, 3);
    const i2 = r.int(i1 + 1, 4);
    const others = MONTHS.slice(0, 5).map((_, i) => (i === i1 ? v1 : i === i2 ? v2 : round(v1 * (0.8 + 0.1 * r.int(0, 5)), 2)));
    const fmt = (v: number) => (s.money ? brl(v) : num(v));
    const dv = round(Math.abs(v2 - v1), 2);
    return draftNumeric({
      prompt: [barChart(MONTHS.slice(0, 5).map((label, i) => ({ label, value: others[i] })), s.title, s.unit)],
      ask: up ? `Qual foi o aumento percentual de ${MONTH_NAMES[i1]} para ${MONTH_NAMES[i2]}?` : `Qual foi a redução percentual de ${MONTH_NAMES[i1]} para ${MONTH_NAMES[i2]}?`,
      unit: '%',
      answer: pct,
      wrong: [
        { value: dv, feedback: `Essa é a variação ${s.money ? 'em reais' : 'na unidade do gráfico'} (de ${fmt(v1)} para ${fmt(v2)}), e não em porcentagem.` },
        { value: round((100 * dv) / v2, 2), feedback: `Isso divide a variação pelo valor de ${MONTH_NAMES[i2]}. A variação percentual compara com o valor inicial, o de ${MONTH_NAMES[i1]}.` },
        { value: round((100 * v2) / v1, 2), feedback: up ? `Isso é o valor de ${MONTH_NAMES[i2]} em porcentagem do de ${MONTH_NAMES[i1]}. O aumento é só o que passa de 100%.` : `Isso é quanto sobrou, em porcentagem. A redução é o que falta para 100%.` },
      ],
      hints: [`Variação: ${fmt(v2)} − ${fmt(v1)}${up ? '' : ' (uma queda)'}.`, `Divida a variação por ${fmt(v1)}, o valor de ${MONTH_NAMES[i1]}, e multiplique por 100.`],
      solution: [`$${num(dv)} ÷ ${num(v1)} = ${num(pct / 100)} = ${pct}%`],
    });
  }
}

/** O maior aumento entre meses seguidos: o trecho mais inclinado, não a barra mais alta. */
function maxRiseGen(r: Rand) {
  for (;;) {
    const s = r.pick(SERIES);
    const values = MONTHS.map(() => s.step * r.int(s.range[0], s.range[1]));
    const rises = values.slice(1).map((v, i) => v - values[i]);
    const best = Math.max(...rises);
    if (best <= 0 || rises.filter((x) => x === best).length > 1) continue;
    const bi = rises.indexOf(best);
    const topMonth = values.indexOf(Math.max(...values));
    if (topMonth === bi + 1) continue; // queremos que o maior aumento não termine na barra mais alta
    const pair = (i: number) => `De ${MONTH_NAMES[i]} para ${MONTH_NAMES[i + 1]}`;
    const why = (x: number, i: number) =>
      x > 0
        ? `${pair(i)}, o aumento foi de ${x}, menor que o de ${best} entre ${MONTH_NAMES[bi]} e ${MONTH_NAMES[bi + 1]}.`
        : x < 0
          ? `${pair(i)} houve queda de ${-x}: não foi aumento.`
          : `${pair(i)} não houve variação.`;
    return draftChoice({
      prompt: [barChart(MONTHS.map((label, i) => ({ label, value: values[i] })), s.title, s.unit)],
      ask: 'Entre quais meses seguidos houve o maior aumento?',
      options: rises.map((x, i) => (i === bi ? ok(pair(i)) : no(pair(i), why(x, i)))),
      hints: ['Calcule a diferença entre cada mês e o anterior.', 'O maior aumento é a maior diferença positiva — não o mês com a barra mais alta.'],
      solution: [`$variações: ${rises.map((x) => (x > 0 ? `+${x}` : num(x))).join(', ')}`, `O maior aumento, +${best}, foi de ${MONTH_NAMES[bi]} para ${MONTH_NAMES[bi + 1]}.`],
    });
  }
}

// ———————————————————————————————————————————————— geradores: comparar com cuidado

const PAIRS = [
  { a: 50, b: 40 },
  { a: 55, b: 50 },
  { a: 66, b: 60 },
  { a: 60, b: 50 },
  { a: 46, b: 40 },
  { a: 88, b: 80 },
  { a: 75, b: 60 },
];

/** Eixo cortado: a diferença visual não é a diferença real. */
function truncatedGen(r: Rand) {
  for (;;) {
    const { a, b } = r.pick(PAIRS);
    const k = r.pick([2, 3, 4]);
    const sAxis = (k * b - a) / (k - 1);
    if (!Number.isInteger(sAxis) || sAxis <= 0 || sAxis >= b) continue;
    if (a === 60 && b === 50 && k === 3) continue; // laboratório da teoria
    const pct = round((100 * (a - b)) / b, 2);
    const what = r.pick(['celulares vendidos por duas lojas', 'votos de dois candidatos a representante de turma', 'inscritos em dois cursos de verão']);
    return draftNumeric({
      prompt: [p(`Um gráfico de barras compara ${what}: A teve ${a} e B teve ${b}. O eixo vertical começa em ${sAxis}, e não em zero, e por isso a barra de A aparece com ${k === 2 ? 'o dobro' : k === 3 ? 'o triplo' : 'o quádruplo'} da altura da barra de B.`)],
      ask: 'Na realidade, A teve quantos por cento a mais que B?',
      unit: '%',
      answer: pct,
      wrong: [
        { value: (k - 1) * 100, feedback: `Isso compara as alturas das barras, distorcidas pelo eixo que começa em ${sAxis}. Compare os valores: ${a} e ${b}.` },
        { value: round((100 * (a - b)) / a, 2), feedback: `Isso divide a diferença pelo valor de A. "A mais que B" compara com B: ${a - b} ÷ ${b}.` },
        { value: a - b, feedback: 'Essa é a diferença em quantidade, e não em porcentagem.' },
      ],
      hints: [`Ignore as alturas: use os valores ${a} e ${b}.`, `Diferença ÷ valor de B: ${a - b} ÷ ${b}.`],
      solution: [`$${a} − ${b} = ${a - b}`, `$${a - b} ÷ ${b} = ${num(pct / 100, 4)} = ${num(pct)}%`],
    });
  }
}

const GROUPS = [
  { intro: 'A tabela mostra o número médio de clientes por dia de duas lojas de uma rede, em dois anos seguidos.', a: ['Loja Centro', 'a Loja Centro'], b: ['Loja Bairro', 'a Loja Bairro'] },
  { intro: 'A tabela mostra as matrículas de duas escolas em dois anos seguidos.', a: ['Escola Ipê', 'a Escola Ipê'], b: ['Escola Jatobá', 'a Escola Jatobá'] },
  { intro: 'A tabela mostra os casos de dengue registrados em duas cidades em dois anos seguidos.', a: ['Vila Nova', 'Vila Nova'], b: ['Serra Alta', 'Serra Alta'] },
];

const cap = (x: string) => x[0].toUpperCase() + x.slice(1);

/** Aumento absoluto × aumento percentual. */
function absPctGen(r: Rand) {
  for (;;) {
    const g = r.pick(GROUPS);
    const a1 = r.pick([200, 250, 400, 500]);
    const da = r.pick([20, 40, 50, 100]);
    const b1 = r.pick([20, 40, 50, 80]);
    const db = r.pick([10, 20, 30, 40]);
    const pa = (100 * da) / a1;
    const pb = (100 * db) / b1;
    if (db >= da || pb <= pa || !Number.isInteger(pa * 10) || !Number.isInteger(pb * 10)) continue;
    const [A, a] = g.a;
    const [B, b] = g.b;
    return draftChoice({
      prompt: [p(g.intro), table(['', 'Ano 1', 'Ano 2'], [[A, num(a1), num(a1 + da)], [B, num(b1), num(b1 + db)]])],
      ask: 'Qual afirmação os dados sustentam?',
      options: [
        ok(`${cap(b)} teve o maior aumento percentual, e ${a}, o maior aumento em quantidade.`),
        no(`${cap(a)} teve o maior aumento percentual.`, `${cap(a)} aumentou ${da} sobre ${a1}: ${num(pa, 1)}%. ${cap(b)} aumentou ${db} sobre ${b1}: ${num(pb, 1)}%.`),
        no(`${cap(b)} teve o maior aumento em quantidade.`, `${cap(b)} aumentou ${db}; ${a}, ${da}. Em quantidade, ${a} aumentou mais.`),
        no('As duas tiveram o mesmo aumento percentual.', `Os aumentos foram de ${num(pa, 1)}% e de ${num(pb, 1)}%: diferentes.`),
      ],
      hints: ['Calcule o aumento de cada uma em quantidade (diferença) e em porcentagem (diferença ÷ valor inicial).', 'Um aumento menor em quantidade pode ser maior em porcentagem quando a base é pequena.'],
      solution: [`$${A}: +${da} (${da} ÷ ${a1} = ${num(pa, 1)}%)`, `$${B}: +${db} (${db} ÷ ${b1} = ${num(pb, 1)}%)`],
    });
  }
}

/** Pictograma: cada símbolo vale uma quantidade; meio símbolo, metade. */
function pictogramGen(r: Rand) {
  const k = r.pick([20, 25, 40, 50, 100]);
  const whole = r.int(2, 9);
  const icons = whole + 0.5;
  const thing = r.pick([
    { icon: 'ônibus', what: 'a frota de ônibus de quatro cidades', city: 'Lagoa Azul', unit: 'ônibus', how: 'Quantos ônibus' },
    { icon: 'livro', what: 'os livros doados a quatro bibliotecas', city: 'a Biblioteca do Bairro Alto', unit: 'livros', how: 'Quantos livros' },
    { icon: 'árvore', what: 'as árvores plantadas em quatro parques', city: 'o Parque das Águas', unit: 'árvores', how: 'Quantas árvores' },
  ]);
  return draftNumeric({
    prompt: [p(`Num pictograma sobre ${thing.what}, cada ícone de ${thing.icon} representa ${k} ${thing.unit}. Para ${thing.city}, aparecem ${whole} ícones e meio.`)],
    ask: `${thing.how} o pictograma indica para ${thing.city}?`,
    unit: thing.unit,
    answer: icons * k,
    wrong: [
      { value: icons, feedback: `Esse é o número de ícones. Cada um vale ${k} ${thing.unit}.` },
      { value: whole * k, feedback: `Isso ignora o meio ícone, que vale ${k / 2} ${thing.unit}.` },
      { value: (whole + 1) * k, feedback: `Isso conta o meio ícone como inteiro. Ele vale só ${k / 2}.` },
    ],
    hints: [`Leia a legenda: 1 ícone = ${k} ${thing.unit}.`, `${whole} ícones e meio = ${num(icons)} ícones.`],
    solution: [`$${num(icons)} × ${k} = ${num(icons * k)} ${thing.unit}`],
  });
}

// ———————————————————————————————————————————————— geradores: maestria

const PRODUCTS = ['Arroz', 'Feijão', 'Café', 'Leite'];

/** Duas séries numa tabela: maior aumento percentual × maior aumento absoluto. */
function twoSeriesGen(r: Rand) {
  for (;;) {
    const bases = r.shuffle([40, 50, 80, 100, 200, 250, 400]).slice(0, 4);
    const pcts = bases.map(() => r.pick([5, 10, 15, 20, 25, 30, 40, 50]));
    const incs = bases.map((b, i) => (b * pcts[i]) / 100);
    if (incs.some((x) => !Number.isInteger(x))) continue;
    const maxPct = Math.max(...pcts);
    const maxInc = Math.max(...incs);
    if (pcts.filter((x) => x === maxPct).length > 1 || incs.filter((x) => x === maxInc).length > 1) continue;
    const ip = pcts.indexOf(maxPct);
    const ia = incs.indexOf(maxInc);
    if (ip === ia) continue;
    return draftChoice({
      prompt: [
        p('Uma cooperativa registrou as vendas de quatro produtos, em toneladas, em dois anos.'),
        table(['Produto', 'Ano 1', 'Ano 2'], PRODUCTS.map((name, i) => [name, num(bases[i]), num(bases[i] + incs[i])])),
      ],
      ask: 'Qual produto teve o maior aumento percentual?',
      options: PRODUCTS.map((name, i) =>
        i === ip
          ? ok(name)
          : no(name, `${name}: de ${num(bases[i])} para ${num(bases[i] + incs[i])}, aumento de ${incs[i]} t, ou ${pcts[i]}%${i === ia ? ' — o maior em toneladas, mas não em porcentagem' : ''}.`),
      ),
      hints: ['Para cada produto: aumento ÷ valor do ano 1.', 'O maior aumento em toneladas não é, necessariamente, o maior em porcentagem.'],
      solution: PRODUCTS.map((name, i) => `$${name}: ${incs[i]} ÷ ${num(bases[i])} = ${pcts[i]}%`),
    });
  }
}

/** Valor que falta no gráfico, a partir da média do período. */
function missingBarGen(r: Rand) {
  for (;;) {
    const s = r.pick(SERIES);
    const n = 5;
    const known = Array.from({ length: n - 1 }, () => s.step * r.int(s.range[0], s.range[1]));
    const missing = s.step * r.int(s.range[0], s.range[1]);
    const total = sum(known) + missing;
    if (total % n !== 0) continue;
    const m = total / n;
    const shown = sum(known);
    return draftNumeric({
      prompt: [
        p(`A média mensal de janeiro a maio foi de ${num(m)} ${s.unit}. O gráfico mostra só janeiro a abril.`),
        barChart(MONTHS.slice(0, 4).map((label, i) => ({ label, value: known[i] })), s.title, s.unit),
      ],
      ask: s.ask('em maio'),
      unit: s.unit,
      answer: missing,
      wrong: [
        { value: m, feedback: 'Essa é a média do período, e não o valor de maio.' },
        ...(4 * m - shown > 0 ? [{ value: 4 * m - shown, feedback: `Isso calcula o total com 4 meses (4 × ${num(m)}). A média é de 5 meses: o total é 5 × ${num(m)}.` }] : []),
        { value: round(shown / 4, 2), feedback: 'Essa é a média dos quatro meses mostrados, e não o valor que falta.' },
      ],
      hints: [`Total dos 5 meses: 5 × ${num(m)} = ${num(total)}.`, `Tire o que o gráfico mostra: ${known.join(' + ')} = ${shown}.`],
      solution: [`$5 × ${num(m)} = ${num(total)}`, `$${num(total)} − ${shown} = ${missing}`],
    });
  }
}

// ———————————————————————————————————————————————— aula

export const LEITURA_GRAFICOS = lesson({
  id: 'leitura-graficos',
  topic: 'graficos',
  subtopics: ['leitura-graficos'],
  title: 'Leitura de gráficos',
  summary: 'Gráficos de barras e de linha: somar períodos, achar a parte de cada barra no total e a média, medir variações absolutas e percentuais, prolongar tendências e desconfiar de eixos cortados e comparações enganosas.',
  requires: ['porcentagem'],
  stages: [
    stage('barras', 'descoberta', 'Gráficos de barras', 'Ler valores num gráfico de barras e combiná-los: somar períodos, comparar categorias, calcular a parte de cada uma no total e a média das barras.', () => ({
      learn: [
        text('Num **gráfico de barras**, cada barra representa uma categoria (um mês, um produto, uma resposta), e sua altura, um valor. Antes de qualquer conta, leia o **título**, a **unidade** (picolés, kWh, milhares de habitantes…) e o que cada eixo mostra. Depois, use só as barras que a pergunta pede: um **bimestre** são 2 meses; um **trimestre**, 3; um **semestre**, 6.'),
        data(barChart([
          { label: 'Jan', value: 80 },
          { label: 'Fev', value: 90 },
          { label: 'Mar', value: 110 },
          { label: 'Abr', value: 70 },
          { label: 'Mai', value: 100 },
          { label: 'Jun', value: 50 },
        ], 'Livros emprestados por uma biblioteca', 'livros')),
        example('Lendo o gráfico', 'Com o gráfico acima: quantos livros foram emprestados no 2º bimestre? E qual foi a média mensal do semestre?', [
          askStep('Primeiro, os meses certos.', 'Quais meses formam o 2º bimestre?', [
            ok('Março e abril'),
            no('Fevereiro e março', 'Os bimestres dividem o ano de dois em dois meses: o 1º é janeiro e fevereiro; o 2º, março e abril.'),
          ]),
          step('2º bimestre:', '110 + 70 = 180 livros'),
          step('Média do semestre:', '80 + 90 + 110 + 70 + 100 + 50 = 500', '500 ÷ 6 ≈ 83,3 livros por mês'),
        ], 'No 2º bimestre foram 180 livros; a média do semestre foi de cerca de 83 livros por mês.'),
        lab({
          title: 'A fatia de cada barra',
          intro: 'Numa votação para o nome da biblioteca da escola, três escritoras disputam. Ajuste os votos e veja a porcentagem de cada uma.',
          params: [
            { key: 'a', label: 'Votos em Cecília Meireles', min: 0, max: 60, step: 5, value: 10, format: (v) => String(v) },
            { key: 'b', label: 'Votos em Carolina de Jesus', min: 0, max: 60, step: 5, value: 10, format: (v) => String(v) },
            { key: 'c', label: 'Votos em Rachel de Queiroz', min: 0, max: 60, step: 5, value: 10, format: (v) => String(v) },
          ],
          readouts: ({ a, b, c }) => [
            { label: 'Total de votos', value: String(a + b + c) },
            { label: 'Carolina de Jesus', value: a + b + c ? `${num((100 * b) / (a + b + c), 1)}%` : '—', big: true, tone: 'sky' },
          ],
          viz: ({ a, b, c }) => {
            const t = a + b + c;
            const pct = (v: number) => (t ? `${num((100 * v) / t, 1)}%` : '0%');
            return {
              kind: 'bars',
              bars: [
                { label: 'Cecília', value: a, tone: 'brass', text: `${a} · ${pct(a)}` },
                { label: 'Carolina', value: b, tone: 'sky', text: `${b} · ${pct(b)}` },
                { label: 'Rachel', value: c, tone: 'verdigris', text: `${c} · ${pct(c)}` },
              ],
              max: 60,
              summary: `Total de ${t} votos: ${a} para Cecília, ${b} para Carolina e ${c} para Rachel`,
            };
          },
          goal: {
            task: 'Com 20 votos para Cecília e 30 para Rachel, quantos votos Carolina precisa para ter exatamente metade do total?',
            done: ({ a, b, c }) => a === 20 && c === 30 && b === 50,
            success: 'Isso: 50 de 100 votos, ou 50%. Ter metade do total é empatar com a soma de todas as outras barras: 20 + 30 = 50.',
          },
          insight: 'A porcentagem de uma barra depende de todas as outras: é o valor dela dividido pelo total.',
        }),
        key('Parte no total e média', 'Porcentagem de uma barra = valor dela ÷ soma de todas as barras × 100. Média das barras = soma de todas ÷ número de barras.'),
        check(numeric({
          prompt: [barChart([
            { label: 'Jan', value: 80 },
            { label: 'Fev', value: 90 },
            { label: 'Mar', value: 110 },
            { label: 'Abr', value: 70 },
            { label: 'Mai', value: 100 },
            { label: 'Jun', value: 50 },
          ], 'Livros emprestados por uma biblioteca', 'livros')],
          ask: 'Que porcentagem do total do semestre corresponde a março?',
          unit: '%',
          answer: 22,
          wrong: [
            { value: 110, feedback: 'Esse é o número de livros de março, e não a porcentagem. Divida pelo total do semestre.' },
            { value: 100, feedback: 'Isso compara março com a maior barra (ele mesmo). A porcentagem compara com o total: 110 ÷ 500.' },
            { value: 16.67, feedback: 'Isso divide 100% pelos 6 meses, como se todos fossem iguais. Use o valor de março: 110 ÷ 500.' },
          ],
          solution: ['$total: 80 + 90 + 110 + 70 + 100 + 50 = 500', '$110 ÷ 500 = 0,22 = 22%'],
        })),
      ],
      practice: [gen(barSumGen), gen(barPercentGen), gen(barMeanGen)],
      challenge: [gen(barPercentGen), gen(barSumGen), gen(barMeanGen)],
      recap: [
        'Leia título, unidade e eixos antes de calcular.',
        'Bimestre: 2 meses; trimestre: 3; semestre: 6.',
        'Parte no total: valor da barra ÷ soma de todas. Média: soma ÷ número de barras.',
      ],
    })),

    stage('linhas', 'fundamentos', 'Variação e tendência', 'Calcular a variação entre períodos, em quantidade e em porcentagem, achar o maior aumento e prolongar uma tendência constante.', () => ({
      learn: [
        text('Gráficos ao longo do tempo (de linha ou de barras) mostram como um valor muda. A **variação** entre dois instantes é a diferença dos valores; a **variação percentual** é essa diferença dividida pelo valor **inicial**. O maior aumento é o trecho mais inclinado — não o ponto mais alto. E, se o aumento é o mesmo a cada intervalo, a tendência é constante: dá para prolongá-la contando quantos intervalos faltam.'),
        lab({
          title: 'O trecho mais inclinado',
          intro: 'O gráfico mostra os assinantes de um jornal digital, em milhares. Escolha um ano e veja a variação até o ano seguinte.',
          params: [{ key: 'a', label: 'Ano inicial', min: 2016, max: 2020, step: 1, value: 2016, format: (v) => String(v) }],
          readouts: ({ a }) => {
            const v = [30, 34, 42, 45, 50, 52];
            const i = a - 2016;
            return [
              { label: `${a} → ${a + 1}`, value: `${v[i]} → ${v[i + 1]} mil` },
              { label: 'Variação', value: `+${v[i + 1] - v[i]} mil`, big: true, tone: 'sky' },
              { label: 'Em porcentagem', value: `+${num((100 * (v[i + 1] - v[i])) / v[i], 1)}%` },
            ];
          },
          viz: ({ a }) => {
            const v = [30, 34, 42, 45, 50, 52];
            const i = a - 2016;
            return {
              kind: 'chart',
              xLabel: 'ano',
              yLabel: 'assinantes (mil)',
              xMin: 2016,
              xMax: 2021,
              yMin: 0,
              yMax: 60,
              xFormat: (x) => String(Math.round(x)),
              series: [{ label: 'assinantes', tone: 'sky', points: v.map((y, k) => [2016 + k, y] as [number, number]), dots: true }],
              markers: [
                { x: a, y: v[i], label: `${v[i]}`, tone: 'brass' },
                { x: a + 1, y: v[i + 1], label: `${v[i + 1]}`, tone: 'brass' },
              ],
              summary: `De ${a} para ${a + 1}, os assinantes passaram de ${v[i]} mil para ${v[i + 1]} mil`,
            };
          },
          goal: {
            task: 'Ache o ano a partir do qual houve o maior aumento de um ano para o seguinte.',
            done: ({ a }) => a === 2017,
            success: 'Isso: de 2017 para 2018 foram +8 mil, o trecho mais inclinado. O ponto mais alto (2021) não é onde a linha mais subiu.',
          },
          insight: 'Inclinação é ritmo: quanto mais íngreme o trecho, maior a variação naquele intervalo.',
        }),
        example('Prolongando uma tendência', 'A frota de ônibus de uma cidade era de 120 em 2004, 135 em 2008, 150 em 2012 e 165 em 2016. Mantido o ritmo, quantos ônibus haverá em 2028?', [
          step('O ritmo:', '+15 ônibus a cada 4 anos'),
          askStep('Agora, os intervalos.', 'Quantos intervalos de 4 anos há de 2016 a 2028?', [
            ok('3'),
            no('12', '12 é o número de anos. O aumento de 15 acontece a cada 4 anos: 12 ÷ 4 = 3 intervalos.'),
          ]),
          step('Projeção:', '165 + 3 × 15 = 210 ônibus'),
        ], 'Mantido o ritmo, serão 210 ônibus em 2028.'),
        reveal('Variação absoluta ou percentual?', 'De 50 para 60, o aumento é de 10 unidades e de 20% (10 ÷ 50). De 200 para 210, também são 10 unidades, mas só 5% (10 ÷ 200). A mesma diferença pesa menos sobre uma base maior.'),
        check(numeric({
          prompt: [p('O preço médio do quilo do tomate passou de R$ 4,00 em março para R$ 6,00 em abril.')],
          ask: 'Qual foi o aumento percentual?',
          unit: '%',
          answer: 50,
          wrong: [
            { value: 2, feedback: 'R$ 2,00 é o aumento em reais. Em porcentagem, divida por R$ 4,00, o preço inicial.' },
            { value: 33.33, feedback: 'Isso divide o aumento por R$ 6,00, o preço final. A base é o preço inicial: 2 ÷ 4.' },
            { value: 150, feedback: '150% é o preço de abril em relação ao de março. O aumento é só o que passa de 100%.' },
          ],
          solution: ['$6 − 4 = 2', '$2 ÷ 4 = 0,5 = 50%'],
        })),
      ],
      practice: [gen(trendGen), gen(pctChangeGen), gen(maxRiseGen)],
      challenge: [gen(maxRiseGen), gen(trendGen), gen(pctChangeGen)],
      recap: [
        'Variação = valor final − valor inicial.',
        'Variação percentual = variação ÷ valor inicial.',
        'Tendência constante: valor + (número de intervalos) × (variação por intervalo).',
      ],
    })),

    stage('comparar', 'interpretacao', 'Comparar e desconfiar', 'Comparar séries e categorias com cuidado: perceber eixos cortados, distinguir aumento em quantidade de aumento percentual e ler escalas e legendas.', () => ({
      learn: [
        text('Gráficos podem enganar sem mentir nos números. Um **eixo vertical que não começa no zero** exagera diferenças; comparar **quantidades** quando o que importa são **proporções** (ou o contrário) leva a conclusões erradas; e um **pictograma** só faz sentido com a legenda, que diz quanto vale cada símbolo. Antes de concluir, confira o eixo, a unidade e a base de comparação.'),
        lab({
          title: 'O eixo que engana',
          intro: 'A loja A vendeu 60 celulares no mês, e a loja B, 50. Mude o valor em que o eixo vertical começa e veja o que acontece com as barras.',
          params: [{ key: 's', label: 'Início do eixo vertical', min: 0, max: 45, step: 5, value: 0, format: (v) => String(v) }],
          readouts: ({ s }) => [
            { label: 'Diferença real', value: 'A vendeu 20% a mais' },
            { label: 'Na imagem, A parece', value: `${num((60 - s) / (50 - s), 2)} vezes B`, big: true, tone: 'ember' },
          ],
          viz: ({ s }) => ({
            kind: 'bars',
            bars: [
              { label: 'Loja A', value: 60 - s, tone: 'sky', text: '60' },
              { label: 'Loja B', value: 50 - s, tone: 'mist', text: '50' },
            ],
            max: 60 - s,
            summary: `Com o eixo começando em ${s}, a barra de A fica ${num((60 - s) / (50 - s), 2)} vezes mais alta que a de B`,
          }),
          goal: {
            task: 'Ache o início de eixo que faz a barra de A parecer ter o triplo da altura da barra de B.',
            done: ({ s }) => s === 45,
            success: 'Isso: com o eixo começando em 45, as barras medem 15 e 5 — o triplo —, embora A tenha vendido só 20% a mais. Sempre confira onde o eixo começa.',
          },
          insight: 'Cortar o eixo não muda os números, mas muda a impressão: diferenças pequenas parecem enormes.',
        }),
        compare([
          { title: 'Loja Centro', tone: 'sky', lines: ['200 → 260 clientes', '+60 clientes', '+30%'] },
          { title: 'Loja Bairro', tone: 'brass', lines: ['40 → 60 clientes', '+20 clientes', '+50%'] },
        ], 'Quem cresceu mais? Depende da medida'),
        warn('Base pequena, porcentagem grande', 'Sair de 2 para 4 casos é um aumento de 100%, mas são só 2 casos a mais. Quando a base é pequena, olhe também a quantidade.'),
        check(choice({
          prompt: [p('A cidade X tinha 400 casos de dengue e passou a ter 500. A cidade Y tinha 50 e passou a ter 100.')],
          ask: 'Qual afirmação os dados sustentam?',
          options: [
            ok('Y teve o maior aumento percentual; X, o maior aumento em número de casos.'),
            no('X teve o maior aumento percentual.', 'X aumentou 100 casos sobre 400: 25%. Y aumentou 50 sobre 50: 100%.'),
            no('As duas tiveram o mesmo aumento.', 'Em número de casos, X aumentou 100 e Y, 50; em porcentagem, 25% e 100%. Nada é igual.'),
            no('Y teve o maior aumento em número de casos.', 'Y aumentou 50 casos; X, 100. Em quantidade, X aumentou mais.'),
          ],
          solution: ['$X: +100 casos (100 ÷ 400 = 25%)', '$Y: +50 casos (50 ÷ 50 = 100%)'],
        })),
      ],
      practice: [gen(truncatedGen), gen(absPctGen), gen(pictogramGen)],
      challenge: [gen(absPctGen), gen(pictogramGen), gen(truncatedGen)],
      recap: [
        'Eixo que não começa no zero exagera diferenças: compare os valores, não as alturas.',
        'Aumento em quantidade ≠ aumento percentual; a base decide.',
        'Pictogramas: leia a legenda (quanto vale cada símbolo e meio símbolo).',
      ],
    })),

    stage('maestria', 'maestria', 'Maestria: gráficos no ENEM', 'Resolver problemas inéditos que combinam leitura de barras e tabelas, médias, variações e comparações entre séries.', () => ({
      learn: [
        strategy('Gráficos em 4 passos', '1) Título, unidade e escala (o eixo começa no zero? cada símbolo vale quanto?). 2) Localize exatamente os dados pedidos (meses, categorias, anos). 3) Faça a conta certa: soma, diferença, média, porcentagem ou projeção. 4) Confira se a resposta tem a unidade e o tamanho que o gráfico sugere.'),
        example('Quem cresceu mais?', [
          p('As vendas de uma padaria, em unidades por dia, em dois anos:'),
          table(['Produto', 'Ano 1', 'Ano 2'], [['Pão francês', '800', '880'], ['Bolo', '40', '52'], ['Café', '150', '180']]),
        ], [
          step('Aumentos em quantidade:', 'pão: +80; bolo: +12; café: +30'),
          askStep('Agora, em porcentagem.', 'Qual produto teve o maior aumento percentual?', [
            ok('O bolo: 12 ÷ 40 = 30%'),
            no('O pão francês, que aumentou 80 unidades', 'Em quantidade, sim; mas 80 ÷ 800 = 10%. O bolo aumentou 12 ÷ 40 = 30%, e o café, 30 ÷ 150 = 20%.'),
          ]),
        ], 'O pão teve o maior aumento em unidades, e o bolo, o maior aumento percentual.'),
        reveal('Dá para somar porcentagens de grupos diferentes?', 'Não. Se 50% de 10 pessoas e 10% de 90 pessoas preferem chá, são 5 + 9 = 14 pessoas de 100: 14%, e não 50% + 10% = 60% nem a média 30%. Porcentagens só se somam quando se referem ao mesmo total.'),
        check(numeric({
          prompt: [
            p('Uma pesquisa com 400 estudantes perguntou como eles vão para a escola.'),
            table(['Meio', 'Porcentagem'], [['Ônibus', '45%'], ['A pé', '25%'], ['Bicicleta', '20%'], ['Carro', '10%']]),
          ],
          ask: 'Quantos estudantes vão a pé ou de bicicleta?',
          unit: 'estudantes',
          answer: 180,
          wrong: [
            { value: 45, feedback: '45% é a porcentagem dos dois grupos juntos. A pergunta é o número de estudantes: 45% de 400.' },
            { value: 100, feedback: '100 são só os que vão a pé (25% de 400). Some os de bicicleta: 20% de 400 = 80.' },
            { value: 80, feedback: '80 são só os que vão de bicicleta. Some os que vão a pé: 25% de 400 = 100.' },
          ],
          solution: ['$25% + 20% = 45%', '$45% de 400 = 0,45 × 400 = 180 estudantes'],
        })),
      ],
      practice: [gen(twoSeriesGen), gen(missingBarGen), gen(trendGen)],
      challenge: [gen(twoSeriesGen), gen(missingBarGen), gen(pctChangeGen), gen(truncatedGen)],
      recap: [
        'Unidade e escala primeiro; contas depois.',
        'Maior aumento em quantidade ≠ maior aumento percentual.',
        'Média conhecida: total = média × número de períodos.',
      ],
    })),
  ],
});
