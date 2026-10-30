/**
 * Aula: Regra de três simples — montar a tabela e resolver (redução à unidade e produto
 * cruzado), conversões de unidade no caminho (min/h, s/min, mL/L, MB/GB, dias), arredondar
 * para cima ou para baixo conforme a pergunta (com médias), e separar partes fixas, o que
 * ainda falta e taxas líquidas.
 */
import {
  askStep,
  check,
  choice,
  compare,
  data,
  draftNumeric,
  example,
  gen,
  key,
  lab,
  lesson,
  no,
  numeric,
  ok,
  order,
  p,
  reveal,
  spot,
  stage,
  step,
  strategy,
  table,
  text,
  tip,
  warn,
} from '../../kit/build';
import { brl, hm, num, round } from '../../kit/format';
import type { Rand } from '../../types';

// ———————————————————————————————————————————————— geradores

interface RuleCtx {
  given: (x: number, y: number) => string;
  askY: (x: number) => string;
  askX: (y: number) => string;
  fx: (v: number) => string;
  fy: (v: number) => string;
  xUnit?: string;
  yUnit?: string;
  yPrefix?: string;
  xs: number[];
  rates: number[];
  x2s: number[];
}

const RULES: RuleCtx[] = [
  {
    given: (x, y) => `${num(x, 2)} m de um tecido ${x < 2 ? 'custa' : 'custam'} ${brl(y)}, sem taxa de corte.`,
    askY: (x) => `Quanto custam ${num(x, 2)} m desse tecido?`,
    askX: (y) => `Quantos metros desse tecido dá para comprar com ${brl(y)}?`,
    fx: (v) => `${num(v, 2)} m`,
    fy: brl,
    xUnit: 'm',
    yPrefix: 'R$',
    xs: [1.5, 2, 3, 3.5],
    rates: [12, 14, 16, 18, 22],
    x2s: [2.5, 4, 4.5, 5, 6, 7.5],
  },
  {
    given: (x, y) => `Um ciclista, em ritmo constante, percorre ${num(x)} km em ${num(y, 2)} minutos.`,
    askY: (x) => `Quanto tempo ele leva para percorrer ${num(x)} km?`,
    askX: (y) => `Quantos quilômetros ele percorre em ${num(y, 2)} minutos?`,
    fx: (v) => `${num(v, 2)} km`,
    fy: (v) => `${num(v, 2)} min`,
    xUnit: 'km',
    yUnit: 'min',
    xs: [4, 6, 8, 10],
    rates: [2.5, 3, 4, 5],
    x2s: [12, 14, 15, 18, 20, 24],
  },
  {
    given: (x, y) => `Uma receita para ${x} pessoas leva ${num(y)} g de arroz.`,
    askY: (x) => `Quantos gramas de arroz são necessários para ${x} pessoas?`,
    askX: (y) => `Para quantas pessoas dá a receita feita com ${num(y)} g de arroz?`,
    fx: (v) => `${num(v, 2)} pessoas`,
    fy: (v) => `${num(v, 2)} g`,
    xUnit: 'pessoas',
    yUnit: 'g',
    xs: [4, 5, 6],
    rates: [60, 75, 80, 90],
    x2s: [9, 10, 12, 14, 15, 18],
  },
  {
    given: (x, y) => `Um carro percorre, em média, ${num(y)} km com ${x} L de gasolina.`,
    askY: (x) => `Quantos quilômetros ele percorre com ${x} L?`,
    askX: (y) => `Quantos litros ele gasta para percorrer ${num(y)} km?`,
    fx: (v) => `${num(v, 2)} L`,
    fy: (v) => `${num(v, 2)} km`,
    xUnit: 'L',
    yUnit: 'km',
    xs: [4, 5, 6, 8],
    rates: [9, 10, 11, 12, 14],
    x2s: [15, 20, 25, 30, 35],
  },
  {
    given: (x, y) => `Numa casa de câmbio, ${num(x)} euros custam ${brl(y)}.`,
    askY: (x) => `Quanto custam ${num(x)} euros, na mesma cotação?`,
    askX: (y) => `Quantos euros dá para comprar com ${brl(y)}, na mesma cotação?`,
    fx: (v) => `${num(v, 2)} euros`,
    fy: brl,
    xUnit: 'euros',
    yPrefix: 'R$',
    xs: [50, 80, 120, 200],
    rates: [6.1, 6.25, 6.4, 6.5],
    x2s: [300, 350, 450, 500, 750],
  },
];

/** Regra de três direta: pedir o valor da segunda grandeza ou da primeira. */
function ruleGen(r: Rand) {
  for (;;) {
    const c = r.pick(RULES);
    const x = r.pick(c.xs);
    const rate = r.pick(c.rates);
    const x2 = r.pick(c.x2s);
    if (x2 === x) continue;
    const y = round(rate * x, 2);
    const y2 = round(rate * x2, 2);
    const askY = r.next() < 0.6;
    const wrong = askY
      ? [
          { value: round(y + (x2 - x), 2), feedback: `Somar a diferença (${num(x2, 2)} − ${num(x, 2)}) não mantém a proporção: as duas grandezas são multiplicadas pelo mesmo fator.` },
          { value: round((y * x) / x2, 2), feedback: 'A proporção ficou invertida: aqui, mais de uma grandeza significa MAIS da outra.' },
          { value: rate, feedback: `${c.fy(rate)} corresponde a 1 unidade. Multiplique por ${num(x2, 2)}.` },
          { value: round(y * x2, 2), feedback: `Faltou dividir por ${num(x, 2)}: ${c.fy(y)} corresponde a ${c.fx(x)}, e não a 1.` },
        ]
      : [
          { value: round(x + (y2 - y), 2), feedback: 'Somar a diferença não mantém a proporção: as duas grandezas são multiplicadas pelo mesmo fator.' },
          { value: round((x * y) / y2, 2), feedback: 'A proporção ficou invertida: aqui, mais de uma grandeza significa MAIS da outra.' },
          { value: round(y2 / x, 2), feedback: `Dividiu pela quantidade errada: ${c.fy(y)} correspondem a ${c.fx(x)}, e cada unidade vale ${c.fy(rate)}.` },
          { value: round(x * y2, 2), feedback: `Faltou dividir por ${num(y, 2)}: a conta é ${num(x, 2)} × ${num(y2, 2)} ÷ ${num(y, 2)}.` },
        ];
    return draftNumeric({
      prompt: [p(c.given(x, y))],
      ask: askY ? c.askY(x2) : c.askX(y2),
      prefix: askY ? c.yPrefix : undefined,
      unit: askY ? c.yUnit : c.xUnit,
      answer: askY ? y2 : x2,
      wrong,
      hints: [
        'Monte a tabela: uma coluna para cada grandeza, uma linha para cada situação.',
        askY ? `Uma unidade corresponde a ${num(y, 2)} ÷ ${num(x, 2)} = ${num(rate, 2)}.` : `Cada unidade corresponde a ${num(rate, 2)}: quantas cabem em ${num(y2, 2)}?`,
      ],
      solution: [
        askY
          ? `$[[${num(x, 2)}|${num(x2, 2)}]] = [[${num(y, 2)}|y]] → y = ${num(y, 2)} × ${num(x2, 2)} ÷ ${num(x, 2)} = ${num(y2, 2)}`
          : `$[[${num(x, 2)}|x]] = [[${num(y, 2)}|${num(y2, 2)}]] → x = ${num(x, 2)} × ${num(y2, 2)} ÷ ${num(y, 2)} = ${num(x2, 2)}`,
      ],
    });
  }
}

/** Regra de três com conversão de unidades no caminho. */
function unitRuleGen(r: Rand) {
  for (;;) {
    const kind = r.int(0, 3);
    if (kind === 0) {
      const t = r.pick([5, 10, 12, 15, 20, 30]);
      const v = r.pick([10, 15, 20, 25, 30, 50]);
      const d = r.pick([7, 10, 15, 30]);
      const n = 1440 / t;
      const perDay = n * v;
      const liters = (perDay * d) / 1000;
      return draftNumeric({
        prompt: [p(`Uma torneira mal fechada desperdiça ${v} mL de água a cada ${t} minutos.`)],
        ask: `Mantido o ritmo, quantos litros ela desperdiça em ${d} dias?`,
        unit: 'L',
        answer: liters,
        wrong: [
          { value: perDay * d, feedback: `${num(perDay * d)} é o desperdício em MILILITROS. Em litros, divida por 1.000.` },
          { value: perDay / 1000, feedback: `${num(perDay / 1000, 3)} L é o desperdício de UM dia. Multiplique pelos ${d} dias.` },
          { value: round(((60 / t) * v * d) / 1000, 3), feedback: 'Isso conta só 1 hora por dia. A torneira pinga as 24 horas: 1 dia = 1.440 minutos.' },
        ],
        hints: [`1 dia = 24 h = 1.440 min: são ${n} intervalos de ${t} min por dia.`, `Por dia: ${n} × ${v} mL = ${num(perDay)} mL.`],
        solution: [`$Por dia: ${n} × ${v} = ${num(perDay)} mL`, `$Em ${d} dias: ${num(perDay)} × ${d} = ${num(perDay * d)} mL = ${num(liters, 3)} L`],
      });
    }
    if (kind === 1) {
      const t = r.pick([5, 10, 15, 20]);
      const v = r.pick([100, 150, 200, 250, 300, 400]);
      const g = r.pick([2, 3, 4, 5, 8]);
      const blocks = (g * 1000) / v;
      const minutes = blocks * t;
      if (!Number.isInteger(minutes)) continue;
      return draftNumeric({
        prompt: [p(`Restam ${g} GB no plano de dados de um celular (considere 1 GB = 1.000 MB). Assistindo a vídeos, o aparelho consome ${v} MB a cada ${t} minutos.`)],
        ask: 'Por quantos minutos, no máximo, é possível assistir a vídeos com esse saldo?',
        unit: 'min',
        answer: minutes,
        wrong: [
          { value: round(minutes / 60, 2), feedback: `${num(minutes / 60, 2)} é o tempo em HORAS (${hm(minutes / 60)}). A pergunta pede minutos.` },
          { value: round(blocks, 2), feedback: `${num(blocks, 2)} é o número de blocos de ${t} minutos (${num(g * 1000)} ÷ ${v}). Multiplique por ${t}.` },
          { value: round((g * t) / v, 4), feedback: `Misturou GB com MB: converta antes, ${g} GB = ${num(g * 1000)} MB.` },
        ],
        hints: [`${g} GB = ${num(g * 1000)} MB.`, `Quantos blocos de ${v} MB cabem em ${num(g * 1000)} MB?`],
        solution: [`$${g} GB = ${num(g * 1000)} MB; ${num(g * 1000)} ÷ ${v} = ${num(blocks, 2)} blocos`, `$${num(blocks, 2)} × ${t} min = ${num(minutes)} min (${hm(minutes / 60)})`],
      });
    }
    if (kind === 2) {
      const s = r.pick([20, 30, 40, 45, 50]);
      const v = r.pick([6, 8, 10, 12, 15, 20, 25]);
      const n = r.int(3, 16);
      const V = v * n;
      const sec = n * s;
      if (sec % 30 !== 0) continue;
      const min = sec / 60;
      return draftNumeric({
        prompt: [p(`Uma bomba transfere ${v} L de água a cada ${s} segundos, com vazão constante.`)],
        ask: `Quantos minutos ela leva para transferir ${num(V)} L?`,
        unit: 'min',
        answer: min,
        wrong: [
          { value: sec, feedback: `${num(sec)} é o tempo em SEGUNDOS. Em minutos, divida por 60.` },
          { value: n, feedback: `${n} é o número de intervalos de ${s} s (${num(V)} ÷ ${v}). Multiplique por ${s} s e converta para minutos.` },
          { value: round(sec / 100, 2), feedback: 'Segundos não viram minutos dividindo por 100: 1 min = 60 s.' },
        ],
        hints: [`Quantos intervalos de ${s} s? ${num(V)} ÷ ${v} = ${n}.`, `${n} × ${s} s = ${num(sec)} s; 1 min = 60 s.`],
        solution: [`$${num(V)} ÷ ${v} = ${n} intervalos de ${s} s`, `$${n} × ${s} = ${num(sec)} s = ${num(min, 2)} min`],
      });
    }
    const h = r.pick([120, 180, 240, 300, 360, 450, 600, 720]);
    const m = r.pick([10, 15, 20, 25, 35, 40, 45, 50]);
    const ans = (h * m) / 60;
    if (!Number.isInteger(ans)) continue;
    return draftNumeric({
      prompt: [p(`Uma máquina embala ${num(h)} pacotes por hora, em ritmo constante.`)],
      ask: `Quantos pacotes ela embala em ${m} minutos?`,
      unit: 'pacotes',
      answer: ans,
      wrong: [
        { value: h * m, feedback: `Misturou horas com minutos: ${num(h)} pacotes são por HORA (60 min), não por minuto.` },
        { value: round(h / m, 2), feedback: 'A conta ficou invertida: em menos de uma hora, a máquina embala MENOS que os pacotes de 1 hora.' },
        { value: h / 60, feedback: `${num(h / 60, 2)} pacotes por minuto é a taxa. Multiplique pelos ${m} minutos.` },
      ],
      hints: ['1 hora = 60 minutos.', `Por minuto: ${num(h)} ÷ 60 = ${num(h / 60, 2)} pacotes.`],
      solution: [`$[[${num(h)}|60]] = [[x|${m}]] → x = ${num(h)} × ${m} ÷ 60 = ${num(ans)} pacotes`],
    });
  }
}

interface RoundCase {
  prompt: string;
  ask: string;
  unit: string;
  q: number;
  up: boolean;
  explain: string;
}

/** Resultado não inteiro: para cima (comprar o suficiente) ou para baixo (unidades completas). */
function roundGen(r: Rand) {
  for (;;) {
    const kind = r.int(0, 4);
    let c: RoundCase;
    if (kind === 0) {
      const each = r.pick([6, 9, 12, 15]);
      const need = r.pick([40, 50, 65, 70, 85, 100]);
      c = { prompt: `Cada lata de tinta cobre ${each} m² de parede. É preciso pintar ${need} m², e a tinta só é vendida em latas inteiras.`, ask: 'Quantas latas, no mínimo, devem ser compradas?', unit: 'latas', q: need / each, up: true, explain: `${need} ÷ ${each}` };
    } else if (kind === 1) {
      const each = r.pick([12, 14, 15, 16]);
      const need = r.pick([50, 75, 100, 130, 145]);
      c = { prompt: `Cada van leva ${each} passageiros. Uma escola vai levar ${need} pessoas a uma excursão.`, ask: 'Quantas vans, no mínimo, são necessárias?', unit: 'vans', q: need / each, up: true, explain: `${need} ÷ ${each}` };
    } else if (kind === 2) {
      const each = r.pick([18, 24, 30, 35]);
      const need = r.pick([200, 250, 310, 400, 475]);
      c = { prompt: `Cada caixa comporta ${each} livros. Uma biblioteca vai encaixotar ${need} livros.`, ask: 'Quantas caixas, no mínimo, serão usadas?', unit: 'caixas', q: need / each, up: true, explain: `${need} ÷ ${each}` };
    } else if (kind === 3) {
      const each = r.pick([350, 400, 450, 600]);
      const stock = r.pick([2000, 2500, 3000, 5000]);
      c = { prompt: `Cada bolo de uma receita usa ${each} g de farinha. Há ${num(stock / 1000, 2)} kg de farinha disponíveis.`, ask: 'Quantos bolos completos é possível fazer?', unit: 'bolos', q: stock / each, up: false, explain: `${num(stock)} g ÷ ${each} g` };
    } else {
      const each = r.pick([1.8, 2.4, 2.5, 3.2]);
      const stock = r.pick([40, 50, 75, 100]);
      c = { prompt: `Cada vestido de um modelo usa ${num(each, 2)} m de tecido. Uma confecção tem ${stock} m desse tecido.`, ask: 'Quantos vestidos completos é possível fazer?', unit: 'vestidos', q: stock / each, up: false, explain: `${stock} ÷ ${num(each, 2)}` };
    }
    if (Number.isInteger(round(c.q, 9))) continue;
    const answer = c.up ? Math.ceil(c.q) : Math.floor(c.q);
    const other = c.up ? Math.floor(c.q) : Math.ceil(c.q);
    return draftNumeric({
      prompt: [p(c.prompt)],
      ask: c.ask,
      unit: c.unit,
      answer,
      wrong: [
        {
          value: other,
          feedback: c.up
            ? `Com ${other} ${c.unit} falta: o resultado exato é ${num(c.q, 2)}. Para atender tudo, arredonde para CIMA.`
            : `Para ${other} ${c.unit} completos não há material suficiente (o exato é ${num(c.q, 2)}). Unidades completas: arredonde para BAIXO.`,
        },
        { value: round(c.q, 2), feedback: `${num(c.q, 2)} é o resultado exato, mas a resposta precisa ser um número inteiro de ${c.unit}.` },
      ],
      hints: [`A conta é ${c.explain} = ${num(c.q, 2)}.`, c.up ? 'Precisa atender tudo: falta algo se arredondar para baixo?' : 'Só valem unidades completas: dá para fazer a última?'],
      solution: [`$${c.explain} = ${num(c.q, 2)}`, `${c.up ? 'Para atender tudo, arredonde para cima' : 'Só unidades completas: arredonde para baixo'}: ${answer} ${c.unit}.`],
    });
  }
}

/** Parte fixa (preparo, taxa, visita) + parte proporcional. */
function fixedPartGen(r: Rand) {
  for (;;) {
    const kind = r.int(0, 2);
    const n1 = r.pick([4, 5, 6, 8, 10, 12]);
    const n2 = r.pick([15, 18, 20, 24, 25, 30]);
    let prep: number;
    let rate: number;
    let money: boolean;
    let prompt: (T1: number) => string;
    let ask: string;
    if (kind === 0) {
      prep = r.int(3, 12);
      rate = r.pick([1.5, 2, 2.5, 3, 4]);
      money = false;
      prompt = (T1) => `Um artesão gasta ${prep} min de preparação (uma única vez por encomenda) e depois produz em ritmo constante. Uma encomenda de ${n1} peças levou ${num(T1, 2)} min no total.`;
      ask = `Quanto tempo levará, no total, uma encomenda de ${n2} peças?`;
    } else if (kind === 1) {
      prep = r.pick([20, 25, 30, 40, 50]);
      rate = r.pick([2.5, 3, 4, 5]);
      money = true;
      prompt = (T1) => `Uma gráfica cobra uma taxa fixa de ${brl(prep)} pela arte, mais um valor por cartaz impresso. Um pedido de ${n1} cartazes custou ${brl(T1)}.`;
      ask = `Quanto custará um pedido de ${n2} cartazes?`;
    } else {
      prep = r.pick([50, 60, 80, 100, 120]);
      rate = r.pick([40, 45, 60, 75]);
      money = true;
      prompt = (T1) => `Um eletricista cobra uma visita de ${brl(prep)}, mais um valor por hora de trabalho. Um serviço de ${n1} horas custou ${brl(T1)}.`;
      ask = `Quanto custará um serviço de ${n2} horas?`;
    }
    const T1 = prep + rate * n1;
    const T2 = prep + rate * n2;
    const f = (v: number) => (money ? brl(v) : `${num(v, 2)} min`);
    return draftNumeric({
      prompt: [p(prompt(T1))],
      ask,
      prefix: money ? 'R$' : undefined,
      unit: money ? undefined : 'min',
      answer: T2,
      wrong: [
        { value: round((T1 * n2) / n1, 2), feedback: `Isso aplica a proporção também à parte fixa (${f(prep)}), que não depende da quantidade. Só a parte variável é proporcional.` },
        { value: rate * n2, feedback: `${f(rate * n2)} é só a parte variável. Some a parte fixa de ${f(prep)}.` },
        { value: T2 + prep, feedback: `A parte fixa (${f(prep)}) entra uma vez só.` },
      ],
      hints: [`Tire a parte fixa: ${f(T1)} − ${f(prep)} = ${f(rate * n1)} para ${n1}.`, `Cada unidade: ${f(rate * n1)} ÷ ${n1} = ${f(rate)}.`],
      solution: [`$Parte variável: ${num(T1, 2)} − ${num(prep, 2)} = ${num(rate * n1, 2)} → ${num(rate, 2)} por unidade`, `$Total: ${num(prep, 2)} + ${num(rate, 2)} × ${n2} = ${num(T2, 2)}`],
    });
  }
}

/** Entrada e saída ao mesmo tempo: taxa líquida. */
function netFlowGen(r: Rand) {
  for (;;) {
    const inn = r.pick([20, 25, 30, 35, 45, 50, 60]);
    const out = r.pick([5, 8, 12, 15]);
    const net = inn - out;
    const t = r.int(8, 40);
    const V = net * t;
    const askTime = r.next() < 0.6;
    return draftNumeric({
      prompt: [p(`Uma torneira despeja ${inn} L por minuto num tanque vazio, mas um vazamento no fundo deixa sair ${out} L por minuto ao mesmo tempo.`)],
      ask: askTime ? `Quanto tempo leva para o tanque chegar a ${num(V)} L?` : `Quantos litros haverá no tanque depois de ${t} minutos?`,
      unit: askTime ? 'min' : 'L',
      answer: askTime ? t : V,
      wrong: askTime
        ? [
            { value: round(V / inn, 2), feedback: `Isso ignora o vazamento. O tanque ganha ${inn} − ${out} = ${net} L por minuto.` },
            { value: round(V / (inn + out), 2), feedback: `O vazamento TIRA água: o saldo é ${inn} − ${out} = ${net} L por minuto, não ${inn + out}.` },
            { value: round(V / out, 2), feedback: `Isso usa só a vazão do vazamento. O saldo é ${net} L por minuto.` },
          ]
        : [
            { value: inn * t, feedback: `Isso ignora o vazamento: saem ${out} L por minuto ao mesmo tempo.` },
            { value: (inn + out) * t, feedback: `O vazamento TIRA água: o saldo é ${inn} − ${out} = ${net} L por minuto.` },
            { value: out * t, feedback: `${num(out * t)} L é o que vazou. No tanque fica o saldo: ${net} L por minuto.` },
          ],
      hints: [`Saldo por minuto: ${inn} − ${out}.`, askTime ? `Quantos minutos para juntar ${num(V)} L a ${net} L por minuto?` : `Em ${t} minutos, a ${net} L por minuto.`],
      solution: [`$Saldo: ${inn} − ${out} = ${net} L/min`, askTime ? `$${num(V)} ÷ ${net} = ${t} min` : `$${net} × ${t} = ${num(V)} L`],
    });
  }
}

const PROGRESS = [
  {
    prompt: (p0: number, p1: number, t: number) => `A bateria de um patinete elétrico estava com ${p0}% quando foi ligada na tomada. Depois de ${t} minutos, marcava ${p1}%. A carga sobe sempre no mesmo ritmo.`,
    goal: (p2: number) => `chegar a ${p2}%`,
  },
  {
    prompt: (p0: number, p1: number, t: number) => `Uma caixa-d'água estava com ${p0}% da capacidade quando a bomba foi ligada. Depois de ${t} minutos, estava com ${p1}%. A bomba enche sempre no mesmo ritmo.`,
    goal: (p2: number) => `chegar a ${p2}% da capacidade`,
  },
  {
    prompt: (p0: number, p1: number, t: number) => `Um download estava em ${p0}% quando a conexão estabilizou. Depois de ${t} minutos, chegou a ${p1}%, sempre no mesmo ritmo.`,
    goal: (p2: number) => `chegar a ${p2}%`,
  },
];

/** Progresso que não começa do zero: proporcional é o aumento. */
function remainingGen(r: Rand) {
  for (;;) {
    const c = r.pick(PROGRESS);
    const p0 = r.pick([5, 10, 15, 20, 25, 30]);
    const gain = r.pick([10, 15, 20, 25, 30]);
    const p1 = p0 + gain;
    const p2 = r.pick([80, 90, 100]);
    const t = r.pick([6, 8, 10, 12, 15, 20, 24]);
    if (p2 <= p1 + 5) continue;
    const rest = ((p2 - p1) * t) / gain;
    if (!Number.isInteger(rest * 2)) continue;
    return draftNumeric({
      prompt: [p(c.prompt(p0, p1, t))],
      ask: `A partir desse momento, quantos minutos faltam para ${c.goal(p2)}?`,
      unit: 'min',
      answer: rest,
      wrong: [
        { value: round((t * (p2 - p1)) / p1, 2), feedback: `Isso supõe que tudo começou em 0%. Nos ${t} min, o aumento foi de só ${p1} − ${p0} = ${gain} pontos.` },
        { value: round(t + rest, 2), feedback: `Esse é o tempo desde que começou (${t} min + o que falta). A pergunta começa nos ${p1}%.` },
        { value: t, feedback: `Os ${t} min renderam ${gain} pontos; faltam ${p2 - p1} pontos, que levam outro tempo.` },
      ],
      hints: [`O que é proporcional ao tempo é o AUMENTO: ${gain} pontos em ${t} min.`, `Faltam ${p2} − ${p1} = ${p2 - p1} pontos.`],
      solution: [`$${gain} pontos em ${t} min; faltam ${p2 - p1} pontos`, `$[[${gain}|${p2 - p1}]] = [[${t}|x]] → x = ${t} × ${p2 - p1} ÷ ${gain} = ${num(rest, 2)} min`],
    });
  }
}

// ———————————————————————————————————————————————— aula

export const REGRA_DE_TRES = lesson({
  id: 'regra-de-tres',
  topic: 'razao-proporcao',
  subtopics: ['regra-de-tres'],
  title: 'Regra de três simples',
  summary:
    'Montar a tabela das duas grandezas, resolver pela unidade ou pelo produto cruzado, converter unidades no caminho, arredondar do jeito certo e separar o que é fixo do que é proporcional.',
  requires: ['proporcao'],
  stages: [
    stage('montar', 'descoberta', 'Montar a regra de três', 'Organizar duas grandezas diretamente proporcionais numa tabela, encontrar o valor desconhecido pela redução à unidade ou pelo produto cruzado e conferir se a resposta faz sentido.', () => ({
      learn: [
        text('A **regra de três simples** resolve problemas com duas grandezas diretamente proporcionais quando se conhecem três valores e falta o quarto. Organize uma tabela: cada **coluna** é uma grandeza (sempre na mesma unidade) e cada **linha** é uma situação.'),
        data(table(['Metros de tecido', 'Preço (R$)'], [['1,5', '18,00'], ['4', 'x']], 'Se 1,5 m custam R$ 18,00, quanto custam 4 m?')),
        text('Como as grandezas são diretamente proporcionais, 1,5/4 = 18/x → 1,5x = 72 → x = 48. Ou, pela **redução à unidade**: 1 m custa 18 ÷ 1,5 = R$ 12,00, então 4 m custam R$ 48,00.'),
        lab({
          title: 'Casa de câmbio',
          intro: 'Nesta casa de câmbio, 1 dólar custa R$ 5,40, sem taxas. Escolha quantos dólares comprar.',
          params: [{ key: 'd', label: 'Dólares', min: 10, max: 500, step: 10, value: 100, format: (v) => `US$ ${num(v)}` }],
          readouts: ({ d }) => [
            { label: 'Você paga', value: brl(5.4 * d), big: true, tone: 'brass' },
            { label: 'Tabela', value: `US$ 1 → R$ 5,40; US$ ${num(d)} → ${brl(5.4 * d)}` },
            { label: 'Reais ÷ dólares', value: 'R$ 5,40 por dólar (constante)' },
          ],
          viz: ({ d }) => ({
            kind: 'bars',
            bars: [
              { label: 'Dólares', value: d, text: `US$ ${num(d)}`, tone: 'verdigris' },
              { label: 'Reais', value: 5.4 * d, text: brl(5.4 * d), tone: 'brass' },
            ],
            max: 2700,
            summary: `US$ ${num(d)} custam ${brl(5.4 * d)}`,
          }),
          goal: {
            task: 'Descubra quantos dólares é possível comprar com exatamente R$ 1.350,00.',
            done: ({ d }) => d === 250,
            success: 'Isso: 1.350 ÷ 5,40 = 250 dólares. Dividir pelo valor de 1 unidade é a regra de três "ao contrário".',
          },
          insight: 'Dobrar os dólares dobra os reais: a razão entre as duas grandezas (a cotação) não muda.',
        }),
        key('Redução à unidade', 'Descubra quanto vale 1 unidade e multiplique: se 6 cadernos custam R$ 39,00, 1 caderno custa R$ 6,50, e 10 cadernos, R$ 65,00. É a mesma conta da regra de três, feita em duas etapas.'),
        example('Adubo no regador', 'Um adubo líquido indica 3 mL para cada 2 L de água. Quantos mililitros de adubo vão num regador de 7 L?', [
          askStep('As grandezas: mL de adubo e litros de água.', 'Como montar a tabela?', [
            ok('Linha 1: 3 mL e 2 L; linha 2: x mL e 7 L'),
            no('Linha 1: 3 mL e 7 L; linha 2: x mL e 2 L', 'Assim cada linha mistura o adubo de uma situação com a água da outra. Cada LINHA é uma situação; cada COLUNA, uma grandeza.'),
          ]),
          step('Diretamente proporcionais: mais água, mais adubo.', '[[3|x]] = [[2|7]] → 2x = 21 → x = 10,5 mL'),
        ], 'Vão 10,5 mL de adubo.'),
        warn('Confira o sentido', 'Antes de calcular, pergunte: se uma grandeza aumenta, a outra aumenta? Se 2 xícaras de farinha rendem 18 biscoitos, 45 biscoitos exigem MAIS de 2 xícaras (5, na verdade). Uma resposta menor que 2 denunciaria a proporção invertida.'),
        check(numeric({
          prompt: [p('Uma padaria usa 750 g de farinha para fazer 6 pães iguais.')],
          ask: 'Quantos gramas de farinha são necessários para 14 desses pães?',
          unit: 'g',
          answer: 1750,
          wrong: [
            { value: 758, feedback: 'Somar a diferença de pães (14 − 6 = 8) aos gramas não mantém a proporção. Cada pão leva 750 ÷ 6 = 125 g.' },
            { value: 321.43, feedback: 'A proporção ficou invertida (750 × 6 ÷ 14): mais pães precisam de MAIS farinha.' },
            { value: 125, feedback: '125 g é a farinha de UM pão. Multiplique pelos 14 pães.' },
          ],
          solution: ['$[[750|6]] = [[x|14]] → x = 750 × 14 ÷ 6 = 1.750 g'],
        })),
      ],
      practice: [
        gen(ruleGen),
        numeric({
          prompt: [p('Um ciclista percorre 18 km em 45 minutos, em ritmo constante.')],
          ask: 'Quanto tempo ele leva para percorrer 30 km?',
          unit: 'min',
          answer: 75,
          wrong: [
            { value: 57, feedback: 'Somar os 12 km a mais aos minutos não mantém a proporção. O ritmo é de 45 ÷ 18 = 2,5 min por km.' },
            { value: 27, feedback: 'A proporção ficou invertida (45 × 18 ÷ 30): distância maior leva MAIS tempo.' },
            { value: 2.5, feedback: '2,5 min por km é o ritmo. Multiplique pelos 30 km.' },
          ],
          hints: ['Tabela: 18 km → 45 min; 30 km → x.', 'Ritmo: 45 ÷ 18 = 2,5 min por km.'],
          solution: ['$[[18|30]] = [[45|x]] → x = 45 × 30 ÷ 18 = 75 min (1 h 15 min)'],
        }),
        order({
          ask: 'Ponha em ordem os passos para resolver uma regra de três simples.',
          steps: [
            'Identificar as duas grandezas e montar a tabela (uma coluna para cada)',
            'Verificar se as grandezas são diretamente proporcionais',
            'Escrever a proporção na mesma ordem das colunas',
            'Fazer o produto cruzado e isolar o valor desconhecido',
            'Conferir se a resposta faz sentido (cresceu junto?)',
          ],
          hints: ['Antes de qualquer conta, organize os dados.', 'A conferência vem no fim.'],
          solution: ['Organizar, checar o tipo de proporção, montar, calcular e conferir.'],
        }),
      ],
      challenge: [
        gen(ruleGen),
        numeric({
          prompt: [p('Um carro consome 7 L de gasolina a cada 84 km rodados.')],
          ask: 'Quantos quilômetros ele percorre com 25 L?',
          unit: 'km',
          answer: 300,
          wrong: [
            { value: 102, feedback: 'Somar os 18 L a mais aos quilômetros não mantém a proporção. O carro faz 84 ÷ 7 = 12 km por litro.' },
            { value: 23.52, feedback: 'A proporção ficou invertida (84 × 7 ÷ 25): mais combustível leva MAIS longe.' },
            { value: 12, feedback: '12 km/L é o rendimento. Multiplique pelos 25 L.' },
            { value: 2100, feedback: 'Faltou dividir por 7: os 84 km correspondem a 7 L, não a 1 L.' },
          ],
          solution: ['$84 ÷ 7 = 12 km/L', '$12 × 25 = 300 km'],
        }),
        spot({
          ask: 'Uma resolução tem exatamente um passo errado. Qual?',
          prompt: [p('Problema: 3 m de tecido custam R$ 48,00. Quanto custam 5 m?')],
          lines: ['Tabela: 3 m → R$ 48,00 e 5 m → x', 'Diretamente proporcionais: mais metros, mais caro', '[[3|5]] = [[48|x]]', '3x = 240', 'x = 240 − 3 = 237'],
          wrong: 4,
          why: 'De 3x = 240 se isola x DIVIDINDO por 3: x = 80. Subtrair 3 não desfaz uma multiplicação. Resposta: R$ 80,00.',
          solution: ['$3x = 240 → x = 240 ÷ 3 = R$ 80,00'],
        }),
      ],
      recap: [
        'Regra de três simples: duas grandezas, três valores conhecidos, um desconhecido.',
        'Tabela: cada coluna é uma grandeza (mesma unidade); cada linha, uma situação.',
        'Diretas: a/b = c/d na mesma ordem das colunas, e produto cruzado.',
        'Redução à unidade: valor de 1 unidade × quantidade pedida.',
        'Confira o sentido: se uma cresce, a outra cresce.',
      ],
    })),

    stage('unidades', 'fundamentos', 'Unidades no caminho', 'Converter unidades antes ou durante a regra de três (minutos e horas, segundos, mililitros e litros, MB e GB, dias) e responder na unidade pedida.', () => ({
      learn: [
        text('As duas situações precisam usar as **mesmas unidades** em cada coluna. Se uma torneira goteja 30 mL a cada 10 minutos, em 1 dia (1.440 minutos, isto é, 144 intervalos de 10 min) ela desperdiça 30 × 144 = 4.320 mL = 4,32 L.'),
        lab({
          title: 'O gotejamento',
          intro: 'Uma torneira mal fechada pinga sem parar. Ajuste quantos mililitros ela perde por hora e veja o desperdício crescer.',
          params: [{ key: 'v', label: 'Desperdício por hora', min: 10, max: 300, step: 10, value: 50, format: (v) => `${v} mL/h` }],
          readouts: ({ v }) => [
            { label: 'Por dia (× 24)', value: `${num(v * 24)} mL = ${num((v * 24) / 1000, 2)} L` },
            { label: 'Por mês de 30 dias', value: `${num((v * 720) / 1000, 1)} L`, big: true, tone: 'sky' },
            { label: 'Por ano (365 dias)', value: `${num((v * 24 * 365) / 1000, 1)} L` },
          ],
          viz: ({ v }) => ({
            kind: 'bars',
            bars: [
              { label: 'Dia', value: (v * 24) / 1000, text: `${num((v * 24) / 1000, 2)} L`, tone: 'sky' },
              { label: 'Semana', value: (v * 168) / 1000, text: `${num((v * 168) / 1000, 1)} L`, tone: 'verdigris' },
              { label: 'Mês', value: (v * 720) / 1000, text: `${num((v * 720) / 1000, 1)} L`, tone: 'brass' },
            ],
            max: 216,
            summary: `${v} mL por hora viram ${num((v * 720) / 1000, 1)} L em 30 dias`,
          }),
          goal: {
            task: 'Encontre o gotejamento que desperdiça exatamente 72 L em 30 dias.',
            done: ({ v }) => v === 100,
            success: 'Isso: 30 dias = 720 horas, e 72.000 mL ÷ 720 = 100 mL por hora.',
          },
          insight: 'Um vazamento que parece pequeno por hora vira dezenas de litros por mês: a regra de três multiplica pelo tempo inteiro, na mesma unidade.',
        }),
        key('Conversões que mais aparecem', '1 h = 60 min; 1 min = 60 s; 1 dia = 24 h = 1.440 min; 1 L = 1.000 mL; 1 kg = 1.000 g; 1 GB = 1.000 MB (quando o enunciado define assim).'),
        example('Videochamadas com o saldo do plano', 'Restam 4 GB num plano de dados (1 GB = 1.000 MB). Uma videochamada consome 250 MB a cada 10 minutos. Por quanto tempo dá para fazer videochamadas?', [
          step('Converta primeiro:', '4 GB = 4.000 MB'),
          askStep('Agora a regra de três em blocos de 10 minutos.', 'Quantos blocos cabem no saldo?', [
            ok('4.000 ÷ 250 = 16 blocos'),
            no('4 ÷ 250 = 0,016 bloco', 'Misturar GB com MB dá um número sem sentido. Converta antes: 4 GB = 4.000 MB.'),
          ]),
          step('16 blocos de 10 minutos:', '16 × 10 = 160 min = 2 h 40 min'),
        ], 'Dá para fazer 2 h 40 min de videochamadas.'),
        warn('Minutos não são decimais de hora', 'Minutos viram horas dividindo por 60: 160 min = 2 h 40 min = 2,67 h — e não "2,6 h" nem "1,6 h". E 3,25 h são 3 h 15 min, não 3 h 25 min.'),
        check(numeric({
          prompt: [p('Uma bomba transfere 24 L de água a cada 40 segundos, com vazão constante.')],
          ask: 'Quantos minutos ela leva para transferir 180 L?',
          unit: 'min',
          answer: 5,
          wrong: [
            { value: 300, feedback: '300 é o tempo em SEGUNDOS (7,5 × 40). Em minutos: 300 ÷ 60 = 5.' },
            { value: 7.5, feedback: '7,5 é o número de intervalos de 40 s (180 ÷ 24). Multiplique por 40 s e converta.' },
            { value: 3, feedback: 'Segundos não viram minutos dividindo por 100: são 300 s = 5 min.' },
          ],
          solution: ['$180 ÷ 24 = 7,5 intervalos de 40 s', '$7,5 × 40 = 300 s = 5 min'],
        })),
      ],
      practice: [
        gen(unitRuleGen),
        numeric({
          prompt: [p('Um site recebe 1.800 acessos por hora, em ritmo constante.')],
          ask: 'Quantos acessos ele recebe em 25 minutos?',
          unit: 'acessos',
          answer: 750,
          wrong: [
            { value: 45000, feedback: 'Misturou horas com minutos: 1.800 acessos são por HORA, e 25 minutos são menos de uma hora.' },
            { value: 72, feedback: 'A conta ficou invertida (1.800 ÷ 25). Em 25 minutos o site recebe parte dos acessos de uma hora.' },
            { value: 30, feedback: '30 acessos por minuto é a taxa. Multiplique pelos 25 minutos.' },
          ],
          hints: ['1 hora = 60 minutos.', 'Por minuto: 1.800 ÷ 60 = 30 acessos.'],
          solution: ['$[[1.800|60]] = [[x|25]] → x = 1.800 × 25 ÷ 60 = 750 acessos'],
        }),
        choice({
          prompt: [p('Uma tarefa leva 3,75 horas.')],
          ask: 'Em horas e minutos, quanto tempo é isso?',
          options: [
            ok('3 h 45 min'),
            no('3 h 75 min', '0,75 h é 3/4 de hora = 45 min. "75 min" passaria de uma hora.'),
            no('3 h 7,5 min', '0,75 h × 60 = 45 min, e não 7,5 min.'),
            no('4 h 15 min', '4 h 15 min = 4,25 h. Aqui são 3 h e mais 0,75 h.'),
          ],
          hints: ['Separe: 3 h + 0,75 h.', 'Converta a parte decimal: 0,75 × 60.'],
          solution: ['$0,75 × 60 = 45 min → 3 h 45 min'],
        }),
      ],
      challenge: [
        gen(unitRuleGen),
        numeric({
          prompt: [p('Uma torneira mal fechada perde 25 mL de água a cada 6 minutos.')],
          ask: 'Quantos litros ela perde em 1 semana?',
          unit: 'L',
          answer: 42,
          wrong: [
            { value: 42000, feedback: '42.000 é a perda em MILILITROS. Em litros: ÷ 1.000.' },
            { value: 6, feedback: '6 L é a perda de UM dia. A semana tem 7 dias.' },
            { value: 4.2, feedback: 'A conversão está errada: 42.000 mL ÷ 1.000 = 42 L.' },
          ],
          solution: ['$1 dia = 1.440 min = 240 intervalos de 6 min → 240 × 25 = 6.000 mL = 6 L', '$Semana: 6 × 7 = 42 L'],
        }),
        numeric({
          prompt: [p('Uma corredora mantém o ritmo de 5 minutos por quilômetro.')],
          ask: 'Quantos quilômetros ela corre em 1 h 40 min?',
          unit: 'km',
          answer: 20,
          wrong: [
            { value: 28, feedback: '1 h 40 min são 60 + 40 = 100 min, e não 140 min.' },
            { value: 16.8, feedback: '1 h 40 min não é 1,4 h (84 min): são 100 min.' },
            { value: 500, feedback: 'Multiplicar inverte a relação: a cada 5 min, 1 km; em 100 min, 100 ÷ 5 km.' },
          ],
          solution: ['$1 h 40 min = 100 min', '$100 ÷ 5 = 20 km'],
        }),
      ],
      recap: [
        'Cada coluna da tabela com uma única unidade.',
        'Converta antes de montar a proporção — nunca misture unidades na mesma coluna.',
        'Minutos ÷ 60 = horas; a parte decimal das horas × 60 = minutos.',
        'Responda na unidade que a pergunta pede.',
      ],
    })),

    stage('arredondar', 'interpretacao', 'Quando o resultado não é inteiro', 'Decidir entre arredondar para cima (comprar o suficiente) ou para baixo (unidades completas) e combinar a regra de três com médias e tabelas.', () => ({
      learn: [
        text('A regra de três pode dar um número quebrado, mas nem toda resposta pode ser quebrada. Se cada lata pinta 12 m² e a parede tem 50 m², a conta dá 50 ÷ 12 ≈ 4,17 latas — e é preciso **comprar 5** (para cima). Se 1 bolo usa 350 g de farinha e há 2 kg, a conta dá 2.000 ÷ 350 ≈ 5,7 — e só saem **5 bolos completos** (para baixo).'),
        compare(
          [
            { title: 'Para cima', tone: 'ember', lines: ['Comprar ou levar o suficiente', 'Mínimo de latas, sacos, vans, viagens', '4,17 → 5'] },
            { title: 'Para baixo', tone: 'verdigris', lines: ['Fazer só o que fica completo', 'Máximo de bolos, kits, peças', '5,7 → 5'] },
          ],
          'Qual arredondamento?',
        ),
        lab({
          title: 'Sacos inteiros',
          intro: 'Cada saco de argamassa cobre 6 m² e só é vendido inteiro. Escolha a área da parede.',
          params: [{ key: 'a', label: 'Área da parede', min: 5, max: 80, step: 1, value: 20, format: (v) => `${v} m²` }],
          readouts: ({ a }) => {
            const exact = a / 6;
            const buy = Math.ceil(exact - 1e-9);
            return [
              { label: 'Sacos exatos', value: num(exact, 2) },
              { label: 'Sacos a comprar', value: `${buy}`, big: true, tone: 'ember' },
              { label: 'Cobertura que sobra', value: `${num(buy * 6 - a)} m²` },
            ];
          },
          viz: ({ a }) => ({
            kind: 'bars',
            bars: [
              { label: 'Exatos', value: a / 6, text: num(a / 6, 2), tone: 'parchment' },
              { label: 'Comprados', value: Math.ceil(a / 6 - 1e-9), text: `${Math.ceil(a / 6 - 1e-9)}`, tone: 'ember' },
            ],
            max: 14,
            summary: `${a} m² pedem ${num(a / 6, 2)} sacos; compram-se ${Math.ceil(a / 6 - 1e-9)}`,
          }),
          goal: {
            task: 'Encontre a menor parede que já exige 8 sacos.',
            done: ({ a }) => a === 43,
            success: 'Isso: 7 sacos cobrem 42 m²; com 43 m², a conta dá 7,17, e é preciso comprar o 8º saco.',
          },
          insight: 'Basta passar 1 m² do que os sacos inteiros cobrem para precisar de mais um: por isso se arredonda para cima.',
        }),
        example('A demanda média', [p('Uma padaria quer comprar fornos iguais. 3 desses fornos assam juntos 270 pães por hora. Nas últimas 4 semanas, a demanda no horário de pico foi de 620, 680, 700 e 600 pães por hora. Quantos fornos, no mínimo, atendem a demanda média?')], [
          step('Média da demanda:', '(620 + 680 + 700 + 600) ÷ 4 = 650 pães por hora'),
          askStep('Cada forno assa 270 ÷ 3 = 90 pães por hora, e 650 ÷ 90 ≈ 7,2.', 'Quantos fornos?', [
            ok('8 fornos (arredondar para cima)'),
            no('7 fornos', '7 fornos assam 630 pães por hora, menos que os 650 da demanda. "No mínimo, para atender" pede arredondar para cima.'),
          ]),
        ], 'São necessários 8 fornos.'),
        warn('Arredonde só no fim', 'Arredondar no meio da conta (por exemplo, 37,5 kWh por placa → 38) pode mudar a resposta. Faça as contas com os valores exatos e arredonde apenas o resultado final.'),
        check(choice({
          prompt: [p('Cada kit de primeiros socorros leva 4 rolos de gaze. Há 45 rolos no estoque.')],
          ask: 'Quantos kits completos podem ser montados?',
          options: [
            ok('11'),
            no('12', '12 kits precisariam de 48 rolos, e só há 45. Kits completos: arredonde para baixo.'),
            no('11,25', 'Não existe 1/4 de kit completo: a pergunta pede kits inteiros.'),
            no('180', '180 = 45 × 4 multiplica em vez de dividir.'),
          ],
          solution: ['$45 ÷ 4 = 11,25 → 11 kits completos'],
          verify: () => 11,
        })),
      ],
      practice: [
        gen(roundGen),
        numeric({
          prompt: [p('As contas de água de uma casa nos últimos 4 meses marcaram 18, 22, 20 e 24 m³. Cada módulo de uma cisterna de captação de chuva fornece 4,5 m³ por mês.')],
          ask: 'Quantos módulos, no mínimo, cobrem o consumo médio mensal?',
          unit: 'módulos',
          answer: 5,
          wrong: [
            { value: 4, feedback: '4 módulos fornecem 18 m³, menos que a média de 21 m³. Para cobrir o consumo, arredonde para cima.' },
            { value: 4.67, feedback: '4,67 é o resultado exato; módulos só existem inteiros, e 4 não bastam.' },
            { value: 6, feedback: 'Isso usa o maior mês (24 m³). A pergunta é o consumo MÉDIO: (18 + 22 + 20 + 24) ÷ 4 = 21 m³.' },
          ],
          hints: ['Primeiro a média: (18 + 22 + 20 + 24) ÷ 4.', 'Depois: 21 ÷ 4,5 = 4,67 — para cima ou para baixo?'],
          solution: ['$Média: 84 ÷ 4 = 21 m³', '$21 ÷ 4,5 ≈ 4,67 → 5 módulos'],
        }),
        numeric({
          prompt: [p('Um cartucho de tinta imprime 350 páginas. Uma escola precisa imprimir 2.000 provas de uma página.')],
          ask: 'Quantos cartuchos, no mínimo, são necessários?',
          unit: 'cartuchos',
          answer: 6,
          wrong: [
            { value: 5, feedback: '5 cartuchos imprimem 1.750 páginas, e faltam 250. Arredonde para cima.' },
            { value: 5.71, feedback: '5,71 é o resultado exato; cartuchos são comprados inteiros.' },
          ],
          hints: ['2.000 ÷ 350 = ?', 'Precisa imprimir tudo: falta algo se arredondar para baixo?'],
          solution: ['$2.000 ÷ 350 ≈ 5,71 → 6 cartuchos'],
        }),
      ],
      challenge: [
        gen(roundGen),
        numeric({
          prompt: [p('Uma empresa vai comprar carregadores portáteis iguais. Dois desses carregadores recarregam, juntos, 9 celulares por dia. Nos últimos 5 dias, a equipe precisou recarregar 40, 46, 38, 44 e 42 celulares.')],
          ask: 'Quantos carregadores, no mínimo, atendem a média diária?',
          unit: 'carregadores',
          answer: 10,
          wrong: [
            { value: 9, feedback: '9 carregadores recarregam 40,5 celulares por dia, menos que a média de 42. Arredonde para cima.' },
            { value: 11, feedback: 'Isso atende o dia de MAIOR demanda (46). A pergunta é a média diária: 42 celulares.' },
            { value: 5, feedback: 'Cada carregador recarrega 9 ÷ 2 = 4,5 celulares por dia, não 9.' },
          ],
          solution: ['$Média: (40 + 46 + 38 + 44 + 42) ÷ 5 = 42', '$Cada carregador: 9 ÷ 2 = 4,5 por dia', '$42 ÷ 4,5 ≈ 9,33 → 10 carregadores'],
        }),
        numeric({
          prompt: [p('Uma confecção tem 125 m de um tecido, e cada vestido de um modelo usa 2,4 m.')],
          ask: 'Quantos vestidos completos podem ser feitos?',
          unit: 'vestidos',
          answer: 52,
          wrong: [
            { value: 53, feedback: '53 vestidos precisariam de 127,2 m, e só há 125 m. Vestidos completos: arredonde para baixo.' },
            { value: 52.08, feedback: '52,08 é o resultado exato; a pergunta pede vestidos completos.' },
            { value: 300, feedback: '300 = 125 × 2,4 multiplica em vez de dividir.' },
          ],
          solution: ['$125 ÷ 2,4 ≈ 52,08 → 52 vestidos'],
        }),
      ],
      recap: [
        'Comprar ou atender o suficiente: arredonde para CIMA (4,17 latas → 5).',
        'Produzir unidades completas: arredonde para BAIXO (5,7 bolos → 5).',
        'Arredonde só no fim.',
        'Quando os dados variam, a pergunta pode pedir a média antes da regra de três.',
      ],
    })),

    stage('parte-fixa', 'aplicacoes', 'Partes fixas, o que falta e saldos', 'Separar a parte fixa da parte proporcional, calcular só o que ainda falta e trabalhar com taxas líquidas (entra menos sai).', () => ({
      learn: [
        text('Nem todo problema é proporcional do começo ao fim. Se um conserto custa R$ 80,00 de visita mais R$ 50,00 por hora, só a parte por hora é proporcional ao tempo: 3 horas custam 80 + 3 × 50 = R$ 230,00 — e não o triplo de uma hora de serviço (3 × 130 = R$ 390,00).'),
        lab({
          title: 'Preparo + produção',
          intro: 'Uma oficina gasta um tempo fixo de preparo por encomenda e depois 2 minutos por peça.',
          params: [
            { key: 'n', label: 'Peças', min: 1, max: 40, step: 1, value: 10, format: (v) => `${v}` },
            { key: 'f', label: 'Preparo (fixo)', min: 0, max: 15, step: 1, value: 6, format: (v) => `${v} min` },
          ],
          readouts: ({ n, f }) => [
            { label: 'Produção (2 min por peça)', value: `${2 * n} min` },
            { label: 'Tempo total', value: `${f + 2 * n} min`, big: true, tone: 'brass' },
            { label: `Com o dobro de peças (${2 * n})`, value: `${f + 4 * n} min — ${f === 0 ? 'o dobro do tempo' : `e não ${2 * (f + 2 * n)} min`}` },
          ],
          viz: ({ n, f }) => ({
            kind: 'parts',
            segments: [
              { label: 'preparo', value: Math.max(f, 0.001), tone: 'ember' },
              { label: 'produção', value: 2 * n, tone: 'verdigris' },
            ],
            summary: `${f} min de preparo e ${2 * n} min de produção`,
          }),
          goal: {
            task: 'Com 6 min de preparo, descubra quantas peças cabem em exatamente 50 min.',
            done: ({ n, f }) => f === 6 && n === 22,
            success: 'Isso: 50 − 6 = 44 min de produção, e 44 ÷ 2 = 22 peças. Primeiro se tira a parte fixa; só o resto é proporcional.',
          },
          insight: 'Com preparo fixo, dobrar as peças não dobra o tempo total: só a produção é proporcional à quantidade.',
        }),
        example('A carga do patinete', 'A bateria de um patinete estava com 15% quando foi ligada na tomada; depois de 24 minutos, marcava 45%. Mantido o ritmo, quanto tempo ainda falta para chegar a 90%?', [
          askStep('O que é proporcional ao tempo de carga?', 'Qual relação usar?', [
            ok('O AUMENTO: 45 − 15 = 30 pontos em 24 min'),
            no('A carga mostrada: 45% em 24 min', 'A bateria já começou em 15%: nos 24 min, só o aumento de 30 pontos aconteceu.'),
          ]),
          step('Faltam 90 − 45 = 45 pontos:', '[[30|45]] = [[24|x]] → x = 24 × 45 ÷ 30 = 36 min'),
        ], 'Faltam 36 minutos.'),
        key('Taxa líquida', 'Se entram 25 L por minuto e saem 7 L por minuto ao mesmo tempo, o tanque ganha 25 − 7 = 18 L por minuto: 720 L levam 720 ÷ 18 = 40 minutos.'),
        tip('O que já foi feito', 'Se 3/8 de um trabalho levaram 12 minutos e a pergunta é quanto falta, a regra de três é sobre os 5/8 restantes: cada 1/8 leva 4 min, e o restante, 20 min.'),
        check(numeric({
          prompt: [p('Um encanador cobra R$ 60,00 pela visita e R$ 45,00 por hora de trabalho. Um serviço custou R$ 285,00.')],
          ask: 'Quantas horas ele trabalhou?',
          unit: 'h',
          answer: 5,
          wrong: [
            { value: 6.33, feedback: 'Isso divide os R$ 285,00 inteiros pelas horas, mas R$ 60,00 são da visita. Desconte-os antes: 225 ÷ 45.' },
            { value: 4.75, feedback: 'Dividir por R$ 60,00 usa o valor da visita como se fosse o valor da hora.' },
          ],
          solution: ['$Parte por hora: 285 − 60 = 225', '$225 ÷ 45 = 5 h'],
        })),
      ],
      practice: [gen(fixedPartGen), gen(netFlowGen), gen(remainingGen)],
      challenge: [
        gen(fixedPartGen),
        gen(netFlowGen),
        gen(remainingGen),
        numeric({
          prompt: [p('Uma impressora de etiquetas imprime 250 etiquetas em 10 minutos. Um pedido de 600 etiquetas exige ainda 3 minutos de aquecimento antes da impressão e 2 minutos de corte depois.')],
          ask: 'Quanto tempo passa do início do aquecimento ao fim do corte?',
          unit: 'min',
          answer: 29,
          wrong: [
            { value: 24, feedback: '24 min é só a impressão das 600 etiquetas. Some o aquecimento e o corte.' },
            { value: 36, feedback: 'Isso aplica a proporção também ao aquecimento e ao corte (15 × 600 ÷ 250), mas eles não dependem do tamanho do pedido.' },
            { value: 27, feedback: '27 = 3 + 24 esquece os 2 minutos de corte no fim.' },
          ],
          solution: ['$Impressão: 10 × 600 ÷ 250 = 24 min', '$Total: 3 + 24 + 2 = 29 min'],
        }),
      ],
      recap: [
        'Separe a parte fixa (taxa, visita, preparo, ajuste) da parte proporcional.',
        'Só a parte proporcional entra na regra de três; a fixa é somada no fim, uma vez.',
        'Progresso que não começa do zero: use o AUMENTO, não o valor mostrado.',
        'Entrada e saída simultâneas: taxa líquida = entra − sai.',
      ],
    })),

    stage('maestria', 'maestria', 'Maestria: regra de três nos problemas difíceis', 'Resolver problemas inéditos que combinam regra de três com conversões, médias, arredondamentos e partes fixas, verificando cada passo.', () => ({
      learn: [
        strategy('Antes de montar a tabela', '1) Quais grandezas variam juntas? 2) Há parte fixa a separar? 3) As unidades de cada coluna batem? 4) A resposta precisa ser inteira — para cima ou para baixo?'),
        example('Energia do vento', [p('Uma fazenda quer instalar aerogeradores iguais. Três aerogeradores de um vizinho geram, juntos, 450 kWh por mês. O consumo da fazenda nos últimos 4 meses foi de 1.420, 1.380, 1.510 e 1.450 kWh. Quantos aerogeradores, no mínimo, geram o consumo médio mensal?')], [
          step('Média mensal:', '(1.420 + 1.380 + 1.510 + 1.450) ÷ 4 = 5.760 ÷ 4 = 1.440 kWh'),
          step('Cada aerogerador:', '450 ÷ 3 = 150 kWh por mês'),
          askStep('1.440 ÷ 150 = 9,6.', 'Quantos aerogeradores?', [
            ok('10 (para cima: precisa gerar pelo menos a média)'),
            no('9', '9 aerogeradores geram 1.350 kWh, menos que os 1.440 kWh da média.'),
            no('3', '3 viria de 1.440 ÷ 450, como se cada aerogerador gerasse 450 kWh. São 450 kWh para 3 aparelhos.'),
          ]),
        ], 'São necessários 10 aerogeradores.'),
        reveal('Por que "1 h 30 min" não é "1,3 h"?', 'Porque a hora tem 60 minutos, e não 100: 30 min = 30/60 h = 0,5 h. Então 1 h 30 min = 1,5 h, e 1,3 h = 1 h 18 min.'),
        check(numeric({
          prompt: [p('Para imprimir 800 folhetos, uma gráfica cobrou R$ 345,00, já incluídos R$ 25,00 fixos de arte.')],
          ask: 'Quanto ela cobrará por 2.000 folhetos com a mesma arte?',
          prefix: 'R$',
          answer: 825,
          wrong: [
            { value: 862.5, feedback: 'Isso aplica a proporção também à taxa fixa de arte (345 × 2.000 ÷ 800). Só a parte por folheto é proporcional.' },
            { value: 800, feedback: 'R$ 800,00 é só a parte por folheto (2.000 × 0,40). Some os R$ 25,00 da arte.' },
            { value: 850, feedback: 'A arte é cobrada uma vez só: 25 + 800 = R$ 825,00.' },
          ],
          solution: ['$Por folheto: (345 − 25) ÷ 800 = R$ 0,40', '$2.000 folhetos: 25 + 2.000 × 0,40 = R$ 825,00'],
        })),
      ],
      practice: [
        numeric({
          prompt: [p('Um aplicativo de música consome 120 MB por hora de streaming. Restam 1,5 GB no plano (considere 1 GB = 1.000 MB).')],
          ask: 'Por quantos minutos é possível ouvir música com esse saldo?',
          unit: 'min',
          answer: 750,
          wrong: [
            { value: 12.5, feedback: '12,5 é o tempo em HORAS (1.500 ÷ 120). Em minutos: × 60.' },
            { value: 75, feedback: 'Isso usa 1,5 GB = 150 MB. Pelo enunciado, 1 GB = 1.000 MB: são 1.500 MB.' },
          ],
          hints: ['1,5 GB = 1.500 MB.', '1.500 ÷ 120 = 12,5 horas; converta para minutos.'],
          solution: ['$1,5 GB = 1.500 MB; 1.500 ÷ 120 = 12,5 h', '$12,5 × 60 = 750 min (12 h 30 min)'],
        }),
        gen(fixedPartGen),
        gen(roundGen),
      ],
      challenge: [
        numeric({
          prompt: [p('Uma ONG vai distribuir 1.000 litros de água em galões de 20 L. Cada veículo da ONG leva 18 galões.')],
          ask: 'Quantos veículos, no mínimo, são necessários para levar toda a água?',
          unit: 'veículos',
          answer: 3,
          wrong: [
            { value: 2, feedback: '2 veículos levam 36 galões, e são 50. Para levar tudo, arredonde para cima.' },
            { value: 55.56, feedback: '1.000 ÷ 18 mistura litros com galões. Primeiro: 1.000 ÷ 20 = 50 galões.' },
            { value: 2.78, feedback: '2,78 é o resultado exato; veículos só existem inteiros, e 2 não bastam.' },
          ],
          solution: ['$1.000 ÷ 20 = 50 galões', '$50 ÷ 18 ≈ 2,78 → 3 veículos'],
        }),
        numeric({
          prompt: [p('Um robô aspirador limpa 30 m² a cada 12 minutos e precisa de 8 minutos fixos para mapear o ambiente antes de começar.')],
          ask: 'Quanto tempo ele leva, no total, para limpar um apartamento de 75 m²?',
          unit: 'min',
          answer: 38,
          wrong: [
            { value: 30, feedback: '30 min é só a limpeza. Some os 8 minutos de mapeamento.' },
            { value: 50, feedback: 'Isso aplica a proporção também ao mapeamento ((12 + 8) × 75 ÷ 30), que não depende da área.' },
          ],
          solution: ['$Limpeza: 12 × 75 ÷ 30 = 30 min', '$Total: 8 + 30 = 38 min'],
        }),
        gen(remainingGen),
        gen(netFlowGen),
      ],
      recap: [
        'Pergunte o que varia junto, o que é fixo, que unidades usar e como arredondar.',
        'Médias e totais vêm antes da regra de três; o arredondamento, no fim.',
        'Separe a parte fixa e some-a uma única vez.',
        'Confira: a resposta atende ao que foi pedido?',
      ],
    })),
  ],
});
