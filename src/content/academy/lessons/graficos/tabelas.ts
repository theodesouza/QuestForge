/**
 * Aula: Tabelas — dupla entrada (cruzar linha e coluna, totais, "porcentagem de quê?"),
 * tabelas de preços com regras ("até", "excedente", "cada hora adicional ou fração", faixas de
 * peso, preço por pessoa conforme o grupo), comparar planos com franquia e maestria com
 * quadros de horários.
 */
import {
  askStep,
  check,
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

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
/** Duração em horas e minutos: 200 → "3 h 20 min". */
const hm = (min: number) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h && m ? `${h} h ${m} min` : h ? `${h} h` : `${m} min`;
};
/** Horário do dia: 430 → "7h10". */
const clock = (min: number) => `${Math.floor(min / 60)}h${String(min % 60).padStart(2, '0')}`;

// ———————————————————————————————————————————————— geradores: dupla entrada

const CROSS = [
  {
    title: 'Atividade extra escolhida pelos estudantes, por turno',
    rows: ['Manhã', 'Tarde'],
    cols: ['Esporte', 'Música', 'Teatro'],
    byRow: (row: string, col: string) => `Que porcentagem dos estudantes da ${row.toLowerCase()} escolheu ${col.toLowerCase()}?`,
    byCol: (row: string, col: string) => `Dos estudantes que escolheram ${col.toLowerCase()}, que porcentagem é da ${row.toLowerCase()}?`,
    byAll: (row: string, col: string) => `Que porcentagem do total de estudantes é da ${row.toLowerCase()} e escolheu ${col.toLowerCase()}?`,
    rowName: (row: string) => `os estudantes da ${row.toLowerCase()}`,
    colName: (col: string) => `os que escolheram ${col.toLowerCase()}`,
    who: 'estudantes',
  },
  {
    title: 'Meio de transporte dos funcionários, por unidade da empresa',
    rows: ['Centro', 'Distrito'],
    cols: ['Ônibus', 'Carro', 'Bicicleta'],
    byRow: (row: string, col: string) => `Que porcentagem dos funcionários da unidade ${row} vai de ${col.toLowerCase()}?`,
    byCol: (row: string, col: string) => `Dos funcionários que vão de ${col.toLowerCase()}, que porcentagem é da unidade ${row}?`,
    byAll: (row: string, col: string) => `Que porcentagem do total de funcionários é da unidade ${row} e vai de ${col.toLowerCase()}?`,
    rowName: (row: string) => `os funcionários da unidade ${row}`,
    colName: (col: string) => `os que vão de ${col.toLowerCase()}`,
    who: 'funcionários',
  },
];

function crossTable(c: (typeof CROSS)[number], cells: number[][]) {
  const rowT = cells.map(sum);
  const colT = c.cols.map((_, j) => cells[0][j] + cells[1][j]);
  return {
    rowT,
    colT,
    grand: sum(rowT),
    block: table(['', ...c.cols, 'Total'], [
      ...c.rows.map((r, i) => [r, ...cells[i].map(String), String(rowT[i])]),
      ['Total', ...colT.map(String), String(sum(rowT))],
    ], c.title),
  };
}

/** Porcentagem de quê? A mesma célula dividida pelo total da linha, da coluna ou geral. */
function cellPctGen(r: Rand) {
  for (;;) {
    const c = r.pick(CROSS);
    const cells = c.rows.map(() => c.cols.map(() => 5 * r.int(2, 16)));
    if (cells[0].join() === '45,30,25' && cells[1].join() === '35,40,25') continue; // tabela da teoria
    const t = crossTable(c, cells);
    const i = r.int(0, 1);
    const j = r.int(0, 2);
    const kind = r.pick(['row', 'col', 'all'] as const);
    const base = kind === 'row' ? t.rowT[i] : kind === 'col' ? t.colT[j] : t.grand;
    const ans = round((100 * cells[i][j]) / base, 2);
    if (!Number.isInteger(ans * 2)) continue;
    const others = [
      { k: 'row', v: t.rowT[i], fb: `Isso divide pelo total da linha (${c.rowName(c.rows[i])}, ${t.rowT[i]}).` },
      { k: 'col', v: t.colT[j], fb: `Isso divide pelo total da coluna (${c.colName(c.cols[j])}, ${t.colT[j]}).` },
      { k: 'all', v: t.grand, fb: `Isso divide pelo total geral (${t.grand}).` },
    ].filter((o) => o.k !== kind);
    const whole = kind === 'row' ? c.rowName(c.rows[i]) : kind === 'col' ? c.colName(c.cols[j]) : `todos os ${c.who}`;
    return draftNumeric({
      prompt: [t.block],
      ask: (kind === 'row' ? c.byRow : kind === 'col' ? c.byCol : c.byAll)(c.rows[i], c.cols[j]),
      unit: '%',
      answer: ans,
      wrong: [
        ...others.map((o) => ({ value: round((100 * cells[i][j]) / o.v, 2), feedback: `${o.fb} Aqui, o todo é: ${whole} (${base}).` })),
        { value: cells[i][j], feedback: 'Esse é o número da célula, e não a porcentagem. Divida pelo todo da pergunta.' },
      ],
      hints: [`O todo da pergunta são ${whole}: ${base}.`, `A parte é a célula ${c.rows[i]} × ${c.cols[j]}: ${cells[i][j]}.`],
      solution: [`$${cells[i][j]} ÷ ${base} = ${num(ans / 100, 4)} = ${num(ans)}%`],
    });
  }
}

/** Célula que falta: total da linha menos as outras células. */
function missingCellGen(r: Rand) {
  const c = r.pick(CROSS);
  const cells = c.rows.map(() => c.cols.map(() => 5 * r.int(2, 16)));
  const t = crossTable(c, cells);
  const i = r.int(0, 1);
  const j = r.int(0, 2);
  const shown = cells.map((row, a) => row.map((v, b) => (a === i && b === j ? '?' : String(v))));
  const rest = cells[i].filter((_, b) => b !== j);
  return draftNumeric({
    prompt: [
      table(['', ...c.cols, 'Total'], [
        ...c.rows.map((row, a) => [row, ...shown[a], String(t.rowT[a])]),
        ['Total', ...t.colT.map(String), String(t.grand)],
      ], c.title),
    ],
    ask: `Que número falta na tabela (${c.rows[i]} × ${c.cols[j]})?`,
    answer: cells[i][j],
    wrong: [
      { value: t.rowT[i] - rest[0], feedback: `Isso tira só uma das outras células da linha. Tire as duas: ${rest.join(' e ')}.` },
      { value: sum(rest), feedback: 'Isso soma as outras células. A que falta é o total da linha menos essa soma.' },
      { value: t.rowT[i], feedback: 'Esse é o total da linha inteira, e não a célula que falta.' },
    ],
    hints: [`Total da linha ${c.rows[i]}: ${t.rowT[i]}.`, `Tire as outras células: ${rest.join(' + ')}.`],
    solution: [`$${t.rowT[i]} − (${rest.join(' + ')}) = ${cells[i][j]}`, `Confira pela coluna: ${t.colT[j]} − ${cells[1 - i][j]} = ${cells[i][j]}.`],
  });
}

/** Comparar proporções entre linhas de tamanhos diferentes. */
function compareRowsGen(r: Rand) {
  for (;;) {
    const c = CROSS[0];
    const cells = c.rows.map(() => c.cols.map(() => 5 * r.int(2, 16)));
    const t = crossTable(c, cells);
    const j = r.int(0, 2);
    const p0 = cells[0][j] / t.rowT[0];
    const p1 = cells[1][j] / t.rowT[1];
    // o turno com mais estudantes na coluna precisa ter a menor porcentagem (é a armadilha)
    if (cells[0][j] === cells[1][j] || Math.abs(p0 - p1) < 0.03) continue;
    if ((cells[0][j] > cells[1][j]) === (p0 > p1)) continue;
    const best = p0 > p1 ? 0 : 1;
    const pct = (k: number) => num((100 * cells[k][j]) / t.rowT[k], 1);
    const col = c.cols[j].toLowerCase();
    return draftChoice({
      prompt: [t.block],
      ask: `Em qual turno é maior a porcentagem de estudantes que escolheram ${col}?`,
      options: [
        ...c.rows.map((row, k) =>
          k === best
            ? ok(`${row}`)
            : no(`${row}`, `Na ${row.toLowerCase()} há mais estudantes em ${col} (${cells[k][j]}), mas são ${cells[k][j]} de ${t.rowT[k]}: ${pct(k)}%. Na ${c.rows[best].toLowerCase()}: ${cells[best][j]} de ${t.rowT[best]}, ${pct(best)}%.`),
        ),
        no('É igual nos dois turnos', `As porcentagens são diferentes: ${pct(0)}% na manhã e ${pct(1)}% na tarde.`),
      ],
      hints: ['Compare porcentagens, e não quantidades: os turnos têm totais diferentes.', `Em cada turno: estudantes em ${col} ÷ total do turno.`],
      solution: [`$Manhã: ${cells[0][j]} ÷ ${t.rowT[0]} = ${pct(0)}%`, `$Tarde: ${cells[1][j]} ÷ ${t.rowT[1]} = ${pct(1)}%`],
    });
  }
}

// ———————————————————————————————————————————————— geradores: tabelas com regras

const HOURLY = [
  { who: 'Uma sala de estudos', first: 'a primeira hora', firstH: 1, prices: [10, 12, 15], extra: [4, 5, 6] },
  { who: 'O guarda-volumes de uma rodoviária', first: 'as primeiras 2 horas', firstH: 2, prices: [12, 15, 18], extra: [3, 4, 5] },
  { who: 'Uma quadra de tênis', first: 'a primeira hora', firstH: 1, prices: [40, 50, 60], extra: [25, 30, 35] },
];

/** "Cada hora adicional ou fração": qualquer pedaço de hora conta como hora inteira. */
function fractionTimeGen(r: Rand) {
  for (;;) {
    const g = r.pick(HOURLY);
    const F = r.pick(g.prices);
    const a = r.pick(g.extra);
    const extra = 60 * r.int(0, 3) + r.pick([10, 15, 20, 30, 40, 45, 50]);
    const T = 60 * g.firstH + extra;
    const blocks = Math.ceil(extra / 60);
    const ans = F + a * blocks;
    return draftNumeric({
      prompt: [
        p(`${g.who} cobra conforme a tabela.`),
        table(['Tempo de uso', 'Valor'], [[`Até ${g.firstH === 1 ? '1 hora' : `${g.firstH} horas`}`, brl(F)], ['Cada hora adicional ou fração', brl(a)]]),
      ],
      ask: `Quanto paga quem usa por ${hm(T)}?`,
      prefix: 'R$',
      answer: ans,
      wrong: [
        { value: round(F + (a * extra) / 60, 2), feedback: 'Isso cobra a fração proporcionalmente. "Ou fração" significa que qualquer pedaço de hora é cobrado como hora inteira.' },
        { value: F + a * Math.floor(extra / 60), feedback: `Isso ignora os ${extra % 60} minutos que sobram. Fração de hora também é cobrada como hora inteira.` },
        { value: a * Math.ceil(T / 60), feedback: `Isso cobra todas as horas pelo preço da hora adicional. ${g.first === 'a primeira hora' ? 'A primeira hora tem' : 'As primeiras horas têm'} preço próprio: ${brl(F)}.` },
      ],
      hints: [`Tire ${g.first}: sobram ${hm(extra)}.`, `${hm(extra)} contam como ${blocks} ${blocks === 1 ? 'hora adicional' : 'horas adicionais'}.`],
      solution: [`$${hm(T)} = ${g.firstH === 1 ? '1 h' : `${g.firstH} h`} + ${hm(extra)} → ${blocks} ${blocks === 1 ? 'hora adicional' : 'horas adicionais'}`, `$${num(F)} + ${blocks} × ${num(a)} = ${brl(ans)}`],
    });
  }
}

/** Frete por faixas de peso, com quilo adicional ou fração. */
function shippingGen(r: Rand) {
  const P1 = r.pick([12, 15, 18]);
  const P2 = P1 + r.int(4, 8);
  const P3 = P2 + r.int(5, 10);
  const e = r.pick([4, 5, 6, 8]);
  const heavy = r.next() < 0.6;
  const rows = [
    ['Até 500 g', brl(P1)],
    ['De 501 g a 1 kg', brl(P2)],
    ['De 1,001 kg a 2 kg', brl(P3)],
    ['Cada kg adicional ou fração, acima de 2 kg', brl(e)],
  ];
  const prompt = [p('Uma transportadora cobra o frete de encomendas pela tabela abaixo.'), table(['Peso', 'Frete'], rows)];
  if (heavy) {
    const w = r.int(21, 69) / 10; // 2,1 kg a 6,9 kg
    if (Number.isInteger(w)) return shippingGen(r);
    const k = Math.ceil(w - 2 - 1e-9);
    const kg = `${k} kg ${k === 1 ? 'adicional' : 'adicionais'}`;
    const ans = P3 + e * k;
    return draftNumeric({
      prompt,
      ask: `Quanto custa o frete de uma encomenda de ${num(w)} kg?`,
      prefix: 'R$',
      answer: ans,
      wrong: [
        { value: round(P3 + e * (w - 2), 2), feedback: '"Ou fração" não é proporcional: cada pedaço de quilo acima de 2 kg é cobrado como quilo inteiro.' },
        { value: P3 + e * Math.floor(w - 2), feedback: `Isso ignora a fração de quilo. Acima de 2 kg há ${num(round(w - 2, 1))} kg, que contam como ${k} kg.` },
        { value: e * Math.ceil(w), feedback: `Isso cobra todos os quilos pelo preço do quilo adicional. Os 2 primeiros quilos estão na faixa de ${brl(P3)}.` },
      ],
      hints: [`Os 2 primeiros quilos custam ${brl(P3)}.`, `O que passa de 2 kg (${num(round(w - 2, 1))} kg) conta como ${kg}.`],
      solution: [`$${num(w)} kg = 2 kg + ${num(round(w - 2, 1))} kg → ${kg}`, `$${num(P3)} + ${k} × ${num(e)} = ${brl(ans)}`],
    });
  }
  const band = r.int(0, 2);
  const grams = band === 0 ? r.pick([250, 380, 500]) : band === 1 ? r.pick([501, 750, 900, 1000]) : r.pick([1200, 1500, 1800, 2000]);
  const price = [P1, P2, P3][band];
  const wtext = grams >= 1000 ? `${num(grams / 1000, 3)} kg` : `${grams} g`;
  return draftNumeric({
    prompt,
    ask: `Quanto custa o frete de uma encomenda de ${wtext}?`,
    prefix: 'R$',
    answer: price,
    wrong: [
      ...(band > 0 ? [{ value: [P1, P2, P3][band - 1], feedback: `Essa é a faixa anterior, mas ${wtext} passa de ${band === 1 ? '500 g' : '1 kg'}.` }] : []),
      ...(band < 2
        ? [{ value: [P1, P2, P3][band + 1], feedback: `Essa é a faixa seguinte, mas ${wtext} não passa de ${band === 0 ? '500 g' : '1 kg'}${grams === (band === 0 ? 500 : 1000) ? ': "até" inclui o próprio limite' : ''}.` }]
        : []),
      { value: e * Math.max(1, Math.ceil(grams / 1000)), feedback: 'O preço por quilo adicional só vale acima de 2 kg. Até lá, use a faixa da tabela.' },
    ],
    hints: ['Localize a faixa de peso da encomenda.', '"Até" e "a" incluem o próprio limite da faixa.'],
    solution: [`${wtext} está na faixa "${rows[band][0]}": frete de ${brl(price)}.`],
  });
}

const GROUP_TOURS = [
  { what: 'Um passeio de barco', who: 'pessoas' },
  { what: 'Uma aula de surfe em grupo', who: 'alunos' },
  { what: 'A entrada de um parque aquático para grupos', who: 'pessoas' },
];

/** Preço por pessoa conforme o tamanho do grupo: a faixa vale para o grupo inteiro. */
function groupBandGen(r: Rand) {
  for (;;) {
    const g = r.pick(GROUP_TOURS);
    const x = r.pick([60, 70, 80, 90]);
    const y = x - r.pick([10, 15, 20]);
    const z = y - r.pick([5, 10, 15]);
    const n = r.int(5, 15);
    const unit = n >= 10 ? z : y;
    const ans = n * unit;
    const progressive = n >= 10 ? 4 * x + 5 * y + (n - 9) * z : 4 * x + (n - 4) * y;
    if (progressive === ans) continue;
    return draftNumeric({
      prompt: [
        p(`${g.what} cobra por pessoa conforme o tamanho do grupo; o preço da faixa vale para todos do grupo.`),
        table(['Tamanho do grupo', 'Preço por pessoa'], [['De 1 a 4', brl(x)], ['De 5 a 9', brl(y)], ['10 ou mais', brl(z)]]),
      ],
      ask: `Quanto paga, no total, um grupo de ${n} ${g.who}?`,
      prefix: 'R$',
      answer: ans,
      wrong: [
        { value: progressive, feedback: 'Isso cobra as primeiras pessoas pelos preços das faixas menores, como numa tarifa progressiva. Aqui, o grupo inteiro paga o preço da sua faixa.' },
        { value: n * x, feedback: `Isso usa o preço da primeira faixa. Um grupo de ${n} está na faixa "${n >= 10 ? '10 ou mais' : 'de 5 a 9'}".` },
        ...(n >= 10 ? [{ value: n * y, feedback: `Isso usa a faixa de 5 a 9. Com ${n} ${g.who}, o grupo já está na faixa de 10 ou mais.` }] : [{ value: n * z, feedback: `Isso usa a faixa de 10 ou mais. Com ${n} ${g.who}, o grupo está na faixa de 5 a 9.` }]),
      ],
      hints: [`Um grupo de ${n} está na faixa "${n >= 10 ? '10 ou mais' : 'de 5 a 9'}".`, `Todos pagam ${brl(unit)}: ${n} × ${num(unit)}.`],
      solution: [`$${n} × ${num(unit)} = ${brl(ans)}`],
    });
  }
}

// ———————————————————————————————————————————————— geradores: comparar planos

const FRANCHISE = [
  { what: 'internet móvel', unit: 'GB', one: 'GB', ask: 'Com que consumo mensal, em GB, os dois planos têm o mesmo custo?', pa: [60, 70, 90, 100], pb: [30, 35, 40, 45, 50], f: [5, 8, 15, 20], e: [2, 3, 4, 5] },
  { what: 'telefonia', unit: 'minutos', one: 'minuto', ask: 'Com quantos minutos de ligação por mês os dois planos têm o mesmo custo?', pa: [50, 60, 80], pb: [20, 25, 30], f: [60, 100, 120], e: [0.5, 1] },
  { what: 'impressão de uma gráfica rápida', unit: 'páginas', one: 'página', fem: true, ask: 'Com quantas páginas por mês os dois planos têm o mesmo custo?', pa: [150, 200, 250], pb: [60, 80, 100], f: [200, 300, 400], e: [0.25, 0.5] },
];

/** Empate entre um plano ilimitado e um plano com franquia mais excedente. */
function franchiseTieGen(r: Rand) {
  for (;;) {
    const g = r.pick(FRANCHISE);
    const PA = r.pick(g.pa);
    const PB = r.pick(g.pb);
    const F = r.pick(g.f);
    const e = r.pick(g.e);
    if (PB >= PA) continue;
    const extra = (PA - PB) / e;
    if (!Number.isInteger(extra)) continue;
    if (g.unit === 'GB' && PA === 70 && PB === 30 && F === 5 && e === 5) continue; // exercício da teoria
    if (g.unit === 'GB' && PA === 90 && PB === 50 && F === 15 && e === 4) continue; // laboratório da teoria
    const x = F + extra;
    return draftNumeric({
      prompt: [
        p(`Uma família compara dois planos de ${g.what}.`),
        table(['Plano', 'Mensalidade', 'Condição'], [['A', brl(PA), 'Uso ilimitado'], ['B', brl(PB), `Inclui ${num(F)} ${g.unit}; cada ${g.one} extra custa ${brl(e)}`]]),
      ],
      ask: g.ask,
      unit: g.unit,
      answer: x,
      wrong: [
        { value: extra, feedback: `Isso esquece a franquia: ${g.fem ? 'as' : 'os'} ${num(F)} ${g.unit} já estão ${g.fem ? 'incluídas' : 'incluídos'} no plano B. O excedente começa depois ${g.fem ? 'delas' : 'deles'}.` },
        { value: round(PA / e, 2), feedback: `Isso divide a mensalidade de A pelo preço do extra, sem descontar os ${brl(PB)} do plano B.` },
        ...(extra - F > 0 ? [{ value: extra - F, feedback: 'Isso subtrai a franquia. Ela se soma ao excedente: o consumo total é franquia + excedente.' }] : []),
      ],
      hints: [`O plano B só fica mais caro depois da franquia: B = ${num(PB)} + ${num(e)} × (consumo − ${num(F)}).`, `Iguale a ${num(PA)}: o excedente é (${num(PA)} − ${num(PB)}) ÷ ${num(e)}.`],
      solution: [`$${num(PB)} + ${num(e)} × (x − ${num(F)}) = ${num(PA)}`, `$x − ${num(F)} = ${num(extra)} → x = ${num(x)} ${g.unit}`],
    });
  }
}

/** Três planos numa tabela: o mais barato para um consumo dado. */
function cheapestPlanGen(r: Rand) {
  for (;;) {
    const PA = r.pick([70, 80, 90, 100]);
    const PB = r.pick([30, 35, 40, 45]);
    const F = r.pick([5, 8, 10, 12]);
    const e = r.pick([3, 4, 5]);
    const c = r.pick([4, 5, 6]);
    const use = r.int(4, 30);
    const cost = [PA, PB + e * Math.max(0, use - F), c * use];
    const best = Math.min(...cost);
    if (cost.filter((x) => x === best).length > 1) continue;
    const sorted = [...cost].sort((a, b) => a - b);
    if (sorted[1] - sorted[0] < 3) continue;
    const bi = cost.indexOf(best);
    const names = ['Plano A', 'Plano B', 'Plano C'];
    const how = [
      `o plano A custa ${brl(PA)} em qualquer consumo`,
      use > F ? `o plano B custa ${num(PB)} + ${use - F} × ${num(e)} = ${brl(cost[1])}` : `o plano B custa ${brl(PB)}, porque ${use} GB cabem na franquia`,
      `o plano C custa ${use} × ${num(c)} = ${brl(cost[2])}`,
    ];
    return draftChoice({
      prompt: [
        p(`Uma estudante usa cerca de ${use} GB de internet por mês e compara três planos.`),
        table(['Plano', 'Mensalidade', 'Condição'], [['A', brl(PA), 'Uso ilimitado'], ['B', brl(PB), `Inclui ${F} GB; cada GB extra custa ${brl(e)}`], ['C', 'Sem mensalidade', `${brl(c)} por GB usado`]]),
      ],
      ask: 'Qual plano é o mais barato para ela?',
      options: names.map((n, k) => (k === bi ? ok(n) : no(n, `Com ${use} GB, ${how[k]}, mais que os ${brl(best)} do ${names[bi].replace('Plano', 'plano')}.`))),
      hints: ['Calcule o custo de cada plano para o consumo dela.', `No plano B, só os GB acima de ${F} são cobrados à parte.`],
      solution: how.map((h) => `$${h[0].toUpperCase()}${h.slice(1)}`),
    });
  }
}

// ———————————————————————————————————————————————— geradores: maestria

/** Quadro de horários: espera pelo próximo ônibus mais a duração da viagem. */
function timetableGen(r: Rand) {
  const first = 60 * r.int(5, 7) + r.pick([0, 10, 15, 20, 30, 40]);
  const every = r.pick([25, 30, 35, 40, 45]);
  const trip = r.pick([50, 65, 80, 95, 110]);
  const deps = Array.from({ length: 6 }, (_, k) => first + k * every);
  const k = r.int(1, 4);
  const wait = r.int(5, every - 5);
  const arrive = deps[k] - wait;
  return draftNumeric({
    prompt: [
      p(`O quadro mostra os horários de saída de um ônibus intermunicipal. A viagem dura ${hm(trip)}.`),
      table(['Saídas'], deps.map((d) => [clock(d)])),
    ],
    ask: `Uma pessoa chega à rodoviária às ${clock(arrive)} e pega o primeiro ônibus que sair. Quanto tempo, em minutos, ela leva desde que chega à rodoviária até chegar ao destino?`,
    unit: 'min',
    answer: wait + trip,
    wrong: [
      { value: trip, feedback: `Essa é só a duração da viagem. Antes, ela espera o ônibus das ${clock(deps[k])}: ${wait} minutos.` },
      { value: wait, feedback: 'Essa é só a espera na rodoviária. Some a duração da viagem.' },
      { value: wait + every + trip, feedback: `Isso supõe que ela pega o ônibus seguinte, das ${clock(deps[k + 1])}. O primeiro que sai depois das ${clock(arrive)} é o das ${clock(deps[k])}.` },
    ],
    hints: [`Depois das ${clock(arrive)}, o primeiro ônibus sai às ${clock(deps[k])}.`, `Espera de ${wait} min mais ${trip} min de viagem.`],
    solution: [`$espera: ${clock(arrive)} → ${clock(deps[k])} = ${wait} min`, `$${wait} + ${trip} = ${wait + trip} min`],
  });
}

// ———————————————————————————————————————————————— aula

export const TABELAS = lesson({
  id: 'tabelas',
  topic: 'graficos',
  subtopics: ['tabelas'],
  title: 'Tabelas',
  summary: 'Tabelas de dupla entrada e "porcentagem de quê?", tabelas de preços com regras ("até", "excedente", "ou fração", faixas de peso e de grupo), planos com franquia e quadros de horários.',
  requires: ['porcentagem', 'leitura-graficos'],
  stages: [
    stage('dupla-entrada', 'descoberta', 'Tabelas de dupla entrada', 'Localizar dados numa tabela de dupla entrada, usar os totais de linhas e colunas e calcular porcentagens escolhendo o todo certo.', () => ({
      learn: [
        text('Numa **tabela de dupla entrada**, cada valor está no cruzamento de uma **linha** e de uma **coluna**. Para achar um dado, identifique as duas categorias que a pergunta cita. O total de uma linha soma a linha; o de uma coluna soma a coluna; o total geral soma tudo. Em porcentagens, a pergunta decisiva é: **porcentagem de quê?** O todo pode ser o total geral, uma linha ou uma coluna.'),
        data(table(['', 'Esporte', 'Música', 'Teatro', 'Total'], [
          ['Manhã', '45', '30', '25', '100'],
          ['Tarde', '35', '40', '25', '100'],
          ['Total', '80', '70', '50', '200'],
        ], 'Atividade extra escolhida pelos estudantes de uma escola')),
        example('Porcentagem de quê?', 'Com a tabela acima: que porcentagem dos estudantes da tarde escolheu música? E que porcentagem dos que escolheram música estuda à tarde?', [
          step('Dos estudantes da tarde:', '40 ÷ 100 = 40%'),
          askStep('Na segunda pergunta, o todo muda.', 'Qual é o todo?', [
            ok('Os 70 estudantes que escolheram música'),
            no('Os 100 estudantes da tarde', 'Isso responde à primeira pergunta. "Dos que escolheram música" define o todo: a coluna Música, com 70.'),
          ]),
          step('Dos que escolheram música:', '40 ÷ 70 ≈ 57,1%'),
        ], 'A mesma célula (40) dá 40% de uma linha e cerca de 57% de uma coluna: o todo decide.'),
        key('Parte ÷ todo', 'O todo é o grupo que aparece depois de "dos", "das" ou "entre os": "dos estudantes da tarde" → a linha Tarde; "dos que escolheram música" → a coluna Música; "de todos" → o total geral.'),
        check(numeric({
          prompt: [table(['', 'Esporte', 'Música', 'Teatro', 'Total'], [
            ['Manhã', '45', '30', '25', '100'],
            ['Tarde', '35', '40', '25', '100'],
            ['Total', '80', '70', '50', '200'],
          ], 'Atividade extra escolhida pelos estudantes de uma escola')],
          ask: 'Quantos estudantes da manhã não escolheram esporte?',
          unit: 'estudantes',
          answer: 55,
          wrong: [
            { value: 45, feedback: 'Esses são os estudantes da manhã que escolheram esporte. A pergunta é sobre os que não escolheram.' },
            { value: 155, feedback: 'Isso tira os 45 do total geral (200). A pergunta é só sobre a manhã: 100 − 45.' },
            { value: 120, feedback: 'Isso soma todos os que não escolheram esporte, nos dois turnos (70 + 50). A pergunta é só sobre a manhã.' },
          ],
          solution: ['$Manhã: 100 estudantes, 45 em esporte', '$100 − 45 = 55 (ou 30 + 25 = 55)'],
        })),
      ],
      practice: [gen(cellPctGen), gen(missingCellGen), gen(compareRowsGen)],
      challenge: [gen(compareRowsGen), gen(cellPctGen), gen(missingCellGen)],
      recap: [
        'Valor = cruzamento de linha e coluna.',
        'Porcentagem = parte ÷ todo, e o todo vem depois de "dos", "das", "entre os".',
        'Para comparar grupos de tamanhos diferentes, compare porcentagens.',
      ],
    })),

    stage('regras', 'fundamentos', 'Tabelas de preços com regras', 'Aplicar as regras de uma tabela de preços: "até", "excedente", "cada hora adicional ou fração", faixas de peso e preço por pessoa conforme o grupo.', () => ({
      learn: [
        text('Tabelas de preços vêm com **palavras de regra**. "Até 1 kg" inclui o próprio 1 kg. "Excedente" é só o que passa do limite. "**Cada hora adicional ou fração**" quer dizer que qualquer pedaço de hora conta como hora inteira — a cobrança não é proporcional. E atenção ao tipo de faixa: às vezes a faixa vale para o total (o grupo inteiro paga o preço da sua faixa), às vezes cada parte paga o preço da sua faixa (tarifa progressiva).'),
        lab({
          title: 'Bicicleta compartilhada',
          intro: 'O aluguel custa R$ 5,00 pelos primeiros 15 minutos e R$ 2,00 a cada 10 minutos adicionais ou fração. Escolha o tempo de uso.',
          params: [{ key: 'm', label: 'Tempo de uso', min: 1, max: 90, step: 1, value: 10, format: (v) => `${v} min` }],
          readouts: ({ m }) => {
            const k = m <= 15 ? 0 : Math.ceil((m - 15) / 10);
            return [
              { label: 'Blocos adicionais de 10 min', value: String(k) },
              { label: 'Preço', value: brl(5 + 2 * k), big: true, tone: 'sky' },
            ];
          },
          viz: ({ m }) => {
            const price = (t: number) => (t <= 15 ? 5 : 5 + 2 * Math.ceil((t - 15) / 10));
            const pts: [number, number][] = [[0, 5], [15, 5]];
            for (let t = 15; t < 90; t += 10) {
              pts.push([t, price(t + 1)], [Math.min(90, t + 10), price(t + 1)]);
            }
            return {
              kind: 'chart',
              xLabel: 'tempo (min)',
              yLabel: 'preço (R$)',
              xMin: 0,
              xMax: 90,
              yMin: 0,
              yMax: 25,
              series: [{ label: 'preço do aluguel', tone: 'sky', points: pts }],
              markers: [{ x: m, y: price(m), label: brl(price(m)), tone: 'brass' }],
              summary: `Com ${m} minutos de uso, o aluguel custa ${brl(price(m))}`,
            };
          },
          goal: {
            task: 'Ache o maior tempo de uso que ainda custa R$ 11,00.',
            done: ({ m }) => m === 45,
            success: 'Isso: até 45 min são 15 + 3 blocos de 10 min, e 5 + 3 × 2 = R$ 11,00. Com 46 min já começa o 4º bloco: R$ 13,00.',
          },
          insight: 'O preço sobe em degraus: dentro de cada bloco ele fica parado, e um minuto a mais pode custar um bloco inteiro.',
        }),
        example('Sala de coworking', 'Uma sala de coworking cobra R$ 12,00 pela primeira hora e R$ 5,00 por hora adicional ou fração. Quanto paga quem fica 2 h 10 min?', [
          step('Tire a primeira hora:', '2 h 10 min − 1 h = 1 h 10 min adicionais'),
          askStep('Agora, as horas adicionais cobradas.', 'Quantas horas adicionais são cobradas por 1 h 10 min?', [
            ok('2: uma hora inteira e a fração de 10 min, que conta como hora'),
            no('1,17 (1 h 10 min em horas)', '"Ou fração" não é proporcional: qualquer pedaço de hora conta como uma hora inteira.'),
          ]),
          step('Total:', '12 + 2 × 5 = R$ 22,00'),
        ], 'Quem fica 2 h 10 min paga R$ 22,00.'),
        compare([
          { title: 'Faixa para o total', tone: 'sky', lines: ['Preço por pessoa conforme o grupo', 'Grupo de 6 → todos pagam o preço da faixa "5 a 9"'] },
          { title: 'Faixas progressivas', tone: 'brass', lines: ['Conta de água por faixas de consumo', 'Cada parte do consumo paga o preço da sua faixa'] },
        ], 'Dois jeitos de usar faixas'),
        check(numeric({
          prompt: [
            p('Uma companhia de saneamento cobra a água assim: até 10 m³, tarifa mínima de R$ 30,00; de 11 m³ a 20 m³, R$ 4,00 por m³ excedente; acima de 20 m³, R$ 6,00 por m³ excedente.'),
          ],
          ask: 'Quanto paga uma casa que consumiu 26 m³?',
          prefix: 'R$',
          answer: 106,
          wrong: [
            { value: 156, feedback: 'Isso cobra os 26 m³ pelo preço da última faixa. Cada faixa tem seu preço: os primeiros 10 m³ estão na tarifa mínima.' },
            { value: 94, feedback: 'Isso cobra todo o excedente (16 m³) a R$ 4,00. Os 6 m³ acima de 20 m³ custam R$ 6,00 cada.' },
            { value: 126, feedback: 'Isso cobra todo o excedente (16 m³) a R$ 6,00. De 11 a 20 m³, o preço é R$ 4,00.' },
          ],
          solution: ['$até 10 m³: R$ 30,00', '$de 11 a 20 m³: 10 × 4 = R$ 40,00', '$de 21 a 26 m³: 6 × 6 = R$ 36,00', '$total: 30 + 40 + 36 = R$ 106,00'],
        })),
      ],
      practice: [gen(fractionTimeGen), gen(shippingGen), gen(groupBandGen)],
      challenge: [gen(shippingGen), gen(groupBandGen), gen(fractionTimeGen)],
      recap: [
        '"Até" inclui o limite; "excedente" é só o que passa dele.',
        '"Ou fração": qualquer pedaço conta como unidade inteira.',
        'Faixa para o total × faixas progressivas: leia qual é o caso.',
      ],
    })),

    stage('planos', 'aplicacoes', 'Comparar planos', 'Comparar planos e ofertas descritos em tabelas — com mensalidade, franquia e excedente — e descobrir quando cada um compensa.', () => ({
      learn: [
        text('Num plano com **franquia**, a mensalidade cobre um consumo; só o que passa dele é cobrado à parte: custo = mensalidade + preço do extra × (consumo − franquia), quando o consumo passa da franquia. Para comparar com um plano ilimitado, calcule os dois custos para o consumo pedido — ou iguale-os para achar o **empate**: abaixo dele, compensa o plano com franquia; acima, o ilimitado.'),
        lab({
          title: 'Franquia × ilimitado',
          intro: 'O plano A custa R$ 90,00 com internet ilimitada. O plano B custa R$ 50,00, inclui 15 GB e cobra R$ 4,00 por GB extra. Escolha o consumo mensal.',
          params: [{ key: 'x', label: 'Consumo mensal', min: 0, max: 40, step: 1, value: 10, format: (v) => `${v} GB` }],
          readouts: ({ x }) => [
            { label: 'Plano A', value: brl(90) },
            { label: 'Plano B', value: brl(50 + 4 * Math.max(0, x - 15)), big: true, tone: 'sky' },
            { label: 'Mais barato', value: 50 + 4 * Math.max(0, x - 15) < 90 ? 'B' : 50 + 4 * Math.max(0, x - 15) === 90 ? 'empate' : 'A' },
          ],
          viz: ({ x }) => ({
            kind: 'chart',
            xLabel: 'consumo (GB)',
            yLabel: 'custo (R$)',
            xMin: 0,
            xMax: 40,
            yMin: 0,
            yMax: 160,
            series: [
              { label: 'Plano A', tone: 'brass', points: [[0, 90], [40, 90]] },
              { label: 'Plano B', tone: 'sky', points: [[0, 50], [15, 50], [40, 150]] },
            ],
            markers: [{ x, y: 50 + 4 * Math.max(0, x - 15), label: brl(50 + 4 * Math.max(0, x - 15)), tone: 'verdigris' }],
            summary: `Com ${x} GB, o plano A custa R$ 90,00 e o plano B, ${brl(50 + 4 * Math.max(0, x - 15))}`,
          }),
          goal: {
            task: 'Ache o consumo em que os dois planos custam o mesmo.',
            done: ({ x }) => x === 25,
            success: 'Isso: com 25 GB, o plano B custa 50 + 10 × 4 = R$ 90,00. A conta direta: o excedente é (90 − 50) ÷ 4 = 10 GB, somados aos 15 GB da franquia.',
          },
          insight: 'Até a franquia, a linha do plano B é plana; depois, sobe. O empate está onde ela cruza a do plano A.',
        }),
        example('Qual plano compensa?', [
          p('Uma pessoa usa 18 GB por mês.'),
          table(['Plano', 'Mensalidade', 'Condição'], [['A', 'R$ 45,00', 'Inclui 10 GB; cada GB extra custa R$ 3,00'], ['B', 'R$ 65,00', 'Uso ilimitado']]),
        ], [
          askStep('Comece pelo plano com franquia.', 'Quanto custa o plano A com 18 GB?', [
            ok('45 + 8 × 3 = R$ 69,00'),
            no('R$ 45,00', 'Os R$ 45,00 cobrem só 10 GB. Os 8 GB excedentes custam 8 × R$ 3,00.'),
          ]),
          step('Compare:', 'A: R$ 69,00; B: R$ 65,00'),
        ], 'Para 18 GB, o plano B é R$ 4,00 mais barato, apesar da mensalidade maior.'),
        warn('Franquia não é desconto', 'Os GB da franquia já estão pagos na mensalidade: o excedente só começa depois deles. Esquecer a franquia é o erro mais comum nessas comparações.'),
        check(numeric({
          prompt: [
            p('Uma família compara dois planos de internet móvel.'),
            table(['Plano', 'Mensalidade', 'Condição'], [['A', 'R$ 70,00', 'Uso ilimitado'], ['B', 'R$ 30,00', 'Inclui 5 GB; cada GB extra custa R$ 5,00']]),
          ],
          ask: 'Com que consumo mensal, em GB, os dois planos têm o mesmo custo?',
          unit: 'GB',
          answer: 13,
          wrong: [
            { value: 8, feedback: 'Isso esquece a franquia: os 5 GB já estão incluídos no plano B. O excedente de 8 GB começa depois deles.' },
            { value: 14, feedback: 'Isso divide a mensalidade de A pelo preço do extra, sem descontar os R$ 30,00 do plano B.' },
            { value: 3, feedback: 'Isso subtrai a franquia. Ela se soma ao excedente: 5 + 8 = 13 GB.' },
          ],
          solution: ['$30 + 5 × (x − 5) = 70', '$x − 5 = 8 → x = 13 GB'],
        })),
      ],
      practice: [gen(franchiseTieGen), gen(cheapestPlanGen), gen(franchiseTieGen)],
      challenge: [gen(cheapestPlanGen), gen(franchiseTieGen), gen(cheapestPlanGen)],
      recap: [
        'Plano com franquia: mensalidade + extra × (consumo − franquia).',
        'Empate: iguale os custos; o consumo é franquia + excedente.',
        'Compare sempre o custo total para o consumo pedido.',
      ],
    })),

    stage('maestria', 'maestria', 'Maestria: tabelas no ENEM', 'Resolver problemas inéditos que exigem localizar dados em tabelas, aplicar regras de cobrança e combinar informações de várias linhas.', () => ({
      learn: [
        strategy('Tabelas em 4 passos', '1) Leia o cabeçalho e a unidade de cada coluna. 2) Ache as linhas e colunas que a pergunta envolve. 3) Atenção às palavras de regra: "até", "a partir de", "excedente", "ou fração", "por pessoa". 4) Monte a conta e confira com um caso perto da fronteira da tabela.'),
        example('Frete de uma encomenda pesada', [
          p('Uma transportadora cobra R$ 25,00 por encomendas de até 2 kg e R$ 6,00 por kg adicional ou fração acima disso.'),
        ], [
          askStep('A encomenda pesa 3,4 kg.', 'Quantos quilos adicionais são cobrados?', [
            ok('2: 1 kg inteiro e a fração de 0,4 kg'),
            no('1,4', '"Ou fração": cada pedaço de quilo conta como um quilo inteiro. 1,4 kg viram 2 kg cobrados.'),
          ]),
          step('Frete:', '25 + 2 × 6 = R$ 37,00'),
        ], 'O frete da encomenda de 3,4 kg é R$ 37,00.'),
        reveal('Por que conferir na fronteira?', 'Porque é na fronteira que as regras se decidem. "Até 1 kg" inclui exatamente 1 kg; "acima de 1 kg" começa logo depois. Testar um valor no limite (1 kg, 60 min, 10 m³) mostra se você está lendo a tabela do jeito certo.'),
        check(numeric({
          prompt: [
            p('No cinema de um shopping, a inteira custa R$ 30,00 e a meia-entrada, R$ 15,00. Às terças-feiras, todos os ingressos têm 20% de desconto.'),
          ],
          ask: 'Quanto uma família paga por 2 inteiras e 3 meias numa terça-feira?',
          prefix: 'R$',
          answer: 84,
          wrong: [
            { value: 105, feedback: 'Esse é o preço sem a promoção de terça. Todos os ingressos têm 20% de desconto.' },
            { value: 93, feedback: 'Isso aplica o desconto só às inteiras. A promoção vale para todos os ingressos, inclusive as meias.' },
            { value: 60, feedback: 'Isso cobra meia de todos (5 × 15) e depois o desconto. Só 3 dos ingressos são meias.' },
          ],
          solution: ['$2 × 30 + 3 × 15 = 105', '$105 × 0,8 = R$ 84,00'],
        })),
      ],
      practice: [gen(timetableGen), gen(cellPctGen), gen(fractionTimeGen)],
      challenge: [gen(timetableGen), gen(franchiseTieGen), gen(shippingGen), gen(compareRowsGen)],
      recap: [
        'Cabeçalho e unidades primeiro.',
        'Palavras de regra mudam a conta: "até", "excedente", "ou fração".',
        'Na dúvida, teste um valor na fronteira da tabela.',
      ],
    })),
  ],
});
