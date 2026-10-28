/**
 * Aula: Proporção — igualdade de razões e produto cruzado, grandezas diretamente
 * proporcionais, divisão em partes proporcionais (com pesos inteiros ou fracionários, reserva
 * e transferência), proporções dadas pela diferença, trocas encadeadas, captura e recaptura,
 * misturas corrigidas com um só componente, ingrediente limitante, partes inversamente
 * proporcionais e mistas, e misturas que perdem e ganham componentes.
 */
import {
  askStep,
  check,
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
  reveal,
  stage,
  step,
  strategy,
  table,
  text,
  tip,
  warn,
} from '../../kit/build';
import { brl, gcd, lcm, num, qty, round } from '../../kit/format';
import type { Rand } from '../../types';

const NAMES = ['Ana', 'Bruno', 'Carla'];
const ORD = ['primeira', 'segunda', 'terceira'];

const gcd3 = (v: number[]) => v.reduce((g, x) => gcd(g, x));
/** 1k → k; 3k → 3k. */
const kx = (n: number) => (n === 1 ? 'k' : `${n}k`);
const parts = (n: number) => (n === 1 ? '1 parte' : `${n} partes`);
const lcm3 = (v: number[]) => v.reduce((m, x) => lcm(m, x));

// ———————————————————————————————————————————————— geradores

interface DirectCtx {
  given: (x: number, y: number) => string;
  ask: (x: number) => string;
  prefix?: string;
  unit?: string;
  xs: number[];
  rates: number[];
}

const DIRECT: DirectCtx[] = [
  {
    given: (x, y) => `${x} cadernos iguais custam ${brl(y)}.`,
    ask: (x) => `Quanto custam ${x} desses cadernos?`,
    prefix: 'R$',
    xs: [3, 4, 5, 6, 8],
    rates: [3.5, 4.5, 6.5, 7.5, 12],
  },
  {
    given: (x, y) => `Uma máquina produz ${num(y)} peças em ${x} horas, sempre no mesmo ritmo.`,
    ask: (x) => `Quantas peças ela produz em ${x} horas?`,
    unit: 'peças',
    xs: [2, 3, 4, 5],
    rates: [45, 60, 75, 120],
  },
  {
    given: (x, y) => `Uma mola se alonga ${num(y, 2)} cm quando se pendura nela uma massa de ${x} kg. O alongamento é proporcional à massa.`,
    ask: (x) => `Qual será o alongamento com ${x} kg?`,
    unit: 'cm',
    xs: [3, 4, 5, 6],
    rates: [1.5, 2, 3.5, 4],
  },
  {
    given: (x, y) => `Para fazer ${x} litros de suco, uma lanchonete usa ${num(y)} laranjas.`,
    ask: (x) => `Quantas laranjas são necessárias para ${x} litros?`,
    unit: 'laranjas',
    xs: [2, 3, 4],
    rates: [6, 8, 9, 12],
  },
];

/** Quarta proporcional: grandezas diretamente proporcionais. */
function fourthGen(r: Rand) {
  for (;;) {
    const c = r.pick(DIRECT);
    const x = r.pick(c.xs);
    const rate = r.pick(c.rates);
    const x2 = r.int(2, 15);
    if (x2 === x) continue;
    const y = round(rate * x, 2);
    const y2 = round(rate * x2, 2);
    const fmt = (v: number) => (c.prefix ? brl(v) : num(v, 2));
    return draftNumeric({
      prompt: [p(c.given(x, y))],
      ask: c.ask(x2),
      prefix: c.prefix,
      unit: c.unit,
      answer: y2,
      wrong: [
        { value: round(y + (x2 - x), 2), feedback: `Somar a diferença das quantidades (${x2} − ${x}) não mantém a razão: numa proporção, as duas grandezas são multiplicadas pelo mesmo fator.` },
        { value: round((y * x) / x2, 2), feedback: 'Essa conta trata as grandezas como inversamente proporcionais. Aqui, mais quantidade dá mais resultado.' },
        { value: rate, feedback: `${fmt(rate)} é o valor para 1 unidade. Multiplique pela quantidade pedida (${x2}).` },
        { value: round(y * x2, 2), feedback: `Faltou dividir por ${x}: ${fmt(y)} corresponde a ${x}, não a 1.` },
      ],
      hints: [`Monte a proporção na mesma ordem: [[${num(y, 2)}|${x}]] = [[?|${x2}]].`, `Valor de 1 unidade: ${num(y, 2)} ÷ ${x} = ${num(rate, 2)}.`],
      solution: [`$[[${num(y, 2)}|${x}]] = [[d|${x2}]] → d = ${num(y, 2)} × ${x2} ÷ ${x} = ${num(y2, 2)}`],
    });
  }
}

const JOBS = [
  { did: (f: string) => `Uma torneira, com vazão constante, encheu ${f} de um tanque`, all: 'encher o tanque todo', rest: 'terminar de encher o tanque' },
  { did: (f: string) => `Um pintor, trabalhando sempre no mesmo ritmo, pintou ${f} de um muro`, all: 'pintar o muro todo', rest: 'terminar o muro' },
  { did: (f: string) => `Um download, com velocidade constante, chegou a ${f} do arquivo`, all: 'baixar o arquivo todo', rest: 'terminar o download' },
];

/** Fração do trabalho feita num tempo: quanto leva o todo (ou quanto falta). */
function fracTimeGen(r: Rand) {
  for (;;) {
    const c = r.pick(JOBS);
    const q = r.pick([3, 4, 5, 6, 8]);
    const a = r.int(1, q - 1);
    if (gcd(a, q) !== 1) continue;
    const t = a * r.int(2, 9);
    if (a === 3 && q === 8 && t === 18) continue; // números de uma questão do banco
    const part = t / a;
    const total = part * q;
    const rest = total - t;
    const askAll = r.next() < 0.5;
    const f = `${a}/${q}`;
    return draftNumeric({
      prompt: [p(`${c.did(f)} em ${t} minutos.`)],
      ask: askAll ? `Contando desde o início, quanto tempo leva para ${c.all}?` : `Quanto tempo ainda falta para ${c.rest}?`,
      unit: 'min',
      answer: askAll ? total : rest,
      wrong: askAll
        ? [
            { value: rest, feedback: `${rest} min é o tempo que AINDA falta. Desde o início, some os ${t} min que já passaram.` },
            { value: round((t * a) / q, 2), feedback: `Isso multiplica ${t} por ${f}, mas ${t} min correspondem a ${f} do trabalho: o todo leva MAIS tempo.` },
            { value: t * q, feedback: `${t} min correspondem a ${a === 1 ? '1 parte' : `${a} partes`} de ${q}, não a 1. Cada parte leva ${t} ÷ ${a} = ${part} min.` },
          ]
        : [
            { value: total, feedback: `${total} min é o tempo TOTAL, desde o início. Já se passaram ${t} min.` },
            { value: round((t * (q - a)) / q, 2), feedback: `Isso multiplica ${t} por ${q - a}/${q}. Primeiro ache o tempo de cada parte: ${t} ÷ ${a} = ${part} min.` },
            { value: t, feedback: `Só seria ${t} min se faltasse a mesma fração que já foi feita. Falta ${q - a}/${q}.` },
          ],
      hints: [`${f} do trabalho levou ${t} min: cada 1/${q} leva ${t} ÷ ${a}.`, askAll ? `O todo são ${q}/${q}.` : `Falta ${q - a}/${q} do trabalho.`],
      solution: [`$Cada 1/${q}: ${t} ÷ ${a} = ${part} min`, `$Todo: ${q} × ${part} = ${total} min${askAll ? '' : `; falta ${total} − ${t} = ${rest} min`}`],
    });
  }
}

/** Partes diretamente proporcionais a investimentos, horas ou moradores. */
function propSplitGen(r: Rand) {
  for (;;) {
    const w = [r.int(1, 9), r.int(1, 9), r.int(1, 9)];
    if (new Set(w).size < 3 || gcd3(w) !== 1) continue;
    const sum = w[0] + w[1] + w[2];
    const k = r.pick([20, 25, 40, 50, 60, 75, 80, 100, 120, 150, 200, 250]);
    const total = sum * k;
    const i = r.int(0, 2);
    const ctx = r.int(0, 2);
    let prompt: string;
    let ask: string;
    let shown: number[];
    if (ctx === 0) {
      const s = r.pick([1000, 2000, 5000]);
      shown = w.map((x) => x * s);
      prompt = `${NAMES[0]}, ${NAMES[1]} e ${NAMES[2]} investiram ${brl(shown[0])}, ${brl(shown[1])} e ${brl(shown[2])}, respectivamente, numa lanchonete. O lucro de ${brl(total)} será dividido em partes diretamente proporcionais ao que cada um investiu.`;
      ask = `Quanto ${NAMES[i]} vai receber?`;
    } else if (ctx === 1) {
      const s = r.int(1, 3);
      shown = w.map((x) => x * s);
      prompt = `Num mutirão, ${NAMES[0]} trabalhou ${qty(shown[0], 'hora', 'horas')}, ${NAMES[1]}, ${qty(shown[1], 'hora', 'horas')} e ${NAMES[2]}, ${qty(shown[2], 'hora', 'horas')}. A gorjeta de ${brl(total)} será dividida em partes diretamente proporcionais às horas trabalhadas.`;
      ask = `Quanto ${NAMES[i]} vai receber?`;
    } else {
      shown = w;
      prompt = `Três casas vão dividir a conta de ${brl(total)} de um poço artesiano em partes proporcionais ao número de moradores: a de ${NAMES[0]} tem ${qty(w[0], 'morador', 'moradores')}, a de ${NAMES[1]}, ${qty(w[1], 'morador', 'moradores')} e a de ${NAMES[2]}, ${qty(w[2], 'morador', 'moradores')}.`;
      ask = `Quanto paga a casa de ${NAMES[i]}?`;
    }
    const simplified = shown.some((v, j) => v !== w[j]);
    return draftNumeric({
      prompt: [p(prompt)],
      ask,
      prefix: 'R$',
      answer: w[i] * k,
      wrong: [
        { value: round(total / 3, 2), feedback: 'Isso divide em partes IGUAIS. Proporcional quer dizer: quem tem mais recebe (ou paga) mais.' },
        { value: k, feedback: `${brl(k)} é o valor de cada parte. ${NAMES[i]} tem ${w[i]} partes.` },
        ...[0, 1, 2].filter((j) => j !== i).map((j) => ({ value: w[j] * k, feedback: `Essa é a parte de ${NAMES[j]}.` })),
      ],
      hints: [simplified ? `Simplifique a proporção: ${shown.map((v) => num(v)).join(' : ')} = ${w.join(' : ')}.` : `Some as partes: ${w.join(' + ')} = ${sum}.`, `Cada parte vale ${num(total)} ÷ ${sum}.`],
      solution: [
        ...(simplified ? [`$${shown.map((v) => num(v)).join(' : ')} = ${w.join(' : ')}`] : []),
        `$${w.join(' + ')} = ${sum} partes; cada parte = ${num(total)} ÷ ${sum} = ${num(k)}`,
        `$${NAMES[i]}: ${w[i]} × ${num(k)} = ${brl(w[i] * k)}`,
      ],
    });
  }
}

/** Partes proporcionais a frações unitárias: multiplicar pelo MMC dos denominadores. */
function fracWeightsGen(r: Rand) {
  for (;;) {
    const ds = r.shuffle([2, 3, 4, 5, 6, 8, 10, 12]).slice(0, 3);
    const m = lcm3(ds);
    if (m > 60) continue;
    const w = ds.map((d) => m / d);
    const g = gcd3(w);
    const W = w.map((x) => x / g);
    const sum = W[0] + W[1] + W[2];
    if (sum * g === m) continue; // frações somam 1: o atalho "fração do total" daria certo
    const k = r.pick([10, 12, 15, 20, 25, 30, 40, 50]);
    const total = sum * k;
    const i = r.int(0, 2);
    const fr = ds.map((d) => `1/${d}`).join(' : ');
    const sumD = ds[0] + ds[1] + ds[2];
    return draftNumeric({
      prompt: [p(`Três turmas vão repartir ${total} ingressos de um festival na proporção ${fr}, nessa ordem.`)],
      ask: `Quantos ingressos recebe a ${ORD[i]} turma?`,
      unit: 'ingressos',
      answer: W[i] * k,
      wrong: [
        { value: round((total * ds[i]) / sumD, 2), feedback: `Isso reparte na proporção ${ds.join(' : ')} (os denominadores). Com frações, quanto MAIOR o denominador, MENOR a parte.` },
        { value: round(total / ds[i], 2), feedback: `Isso calcula 1/${ds[i]} do total, mas as três frações não somam 1: elas só indicam a proporção. Multiplique-as pelo MMC (${m}).` },
        { value: round(total / 3, 2), feedback: 'Isso divide em partes iguais. A proporção dá partes diferentes para cada turma.' },
      ],
      hints: [`Multiplique as frações pelo MMC dos denominadores (${m}).`, `${fr} = ${w.join(' : ')}${g > 1 ? ` = ${W.join(' : ')}` : ''}.`],
      solution: [`$${fr} = ${w.join(' : ')}${g > 1 ? ` = ${W.join(' : ')}` : ''} (× ${m})`, `$${W.join(' + ')} = ${sum} partes; cada parte = ${total} ÷ ${sum} = ${k}`, `$${ORD[i]} turma: ${W[i]} × ${k} = ${W[i] * k}`],
    });
  }
}

const DIFFS = [
  {
    prompt: (a: number, b: number, d: number) => `Numa cooperativa, a razão entre as massas de papel e de vidro recolhidas num mês foi ${a} : ${b}, e a massa de papel superou a de vidro em ${num(d)} kg.`,
    asks: ['Qual foi a massa de papel recolhida?', 'Qual foi a massa de vidro recolhida?', 'Qual foi a massa total de papel e vidro?'],
    names: ['papel', 'vidro'],
    unit: 'kg',
    scale: 10,
  },
  {
    prompt: (a: number, b: number, d: number) => `Num pomar, a razão entre o número de laranjeiras e o de limoeiros é ${a} : ${b}, e há ${d} laranjeiras a mais que limoeiros.`,
    asks: ['Quantas laranjeiras há?', 'Quantos limoeiros há?', 'Quantas árvores (laranjeiras e limoeiros) há ao todo?'],
    names: ['laranjeiras', 'limoeiros'],
    unit: 'árvores',
    scale: 1,
  },
  {
    prompt: (a: number, b: number, d: number) => `Num estádio, a razão entre torcedores do time da casa e visitantes é ${a} : ${b}, e há ${num(d)} torcedores da casa a mais que visitantes.`,
    asks: ['Quantos torcedores da casa há?', 'Quantos visitantes há?', 'Quantos torcedores há ao todo?'],
    names: ['torcedores da casa', 'visitantes'],
    unit: 'torcedores',
    scale: 50,
  },
];

/** A razão e a diferença: (a − b)k = d. */
function diffGen(r: Rand) {
  for (;;) {
    const c = r.pick(DIFFS);
    const a = r.int(3, 9);
    const b = r.int(1, a - 1);
    if (gcd(a, b) !== 1) continue;
    const k = r.int(2, 30) * c.scale;
    const d = (a - b) * k;
    const which = r.int(0, 2); // 0: maior, 1: menor, 2: total
    const values = [a * k, b * k, (a + b) * k];
    const [A, B] = c.names;
    const wrong =
      which === 0
        ? [
            { value: b * k, feedback: `Essa é a quantidade de ${B}, o grupo menor.` },
            { value: round((d * a) / (a + b), 2), feedback: `Isso divide a diferença pelo TOTAL de partes (${a + b}). A diferença corresponde a ${a} − ${b} = ${parts(a - b)}.` },
            { value: d * a, feedback: `Isso trata a diferença como uma parte só. Ela vale ${parts(a - b)}: cada parte = ${num(d)} ÷ ${a - b}.` },
          ]
        : which === 1
          ? [
              { value: a * k, feedback: `Essa é a quantidade de ${A}, o grupo maior.` },
              { value: round((d * b) / (a + b), 2), feedback: `Isso divide a diferença pelo TOTAL de partes (${a + b}). A diferença corresponde a ${a} − ${b} = ${parts(a - b)}.` },
              { value: d * b, feedback: `Isso trata a diferença como uma parte só. Ela vale ${parts(a - b)}: cada parte = ${num(d)} ÷ ${a - b}.` },
            ]
          : [
              { value: a * k, feedback: `Essa é só a quantidade de ${A}. Some a de ${B}.` },
              { value: d * (a + b), feedback: `Isso trata a diferença como uma parte só. Ela vale ${parts(a - b)}: cada parte = ${num(d)} ÷ ${a - b}.` },
              { value: b * k + d, feedback: `Confira: o total é ${a}k + ${b}k = ${a + b}k, com k = ${num(k)}.` },
            ];
    return draftNumeric({
      prompt: [p(c.prompt(a, b, d))],
      ask: c.asks[which],
      unit: c.unit,
      answer: values[which],
      wrong,
      hints: [`As quantidades são ${kx(a)} e ${kx(b)}; a diferença é ${kx(a)} − ${kx(b)} = ${kx(a - b)}.`, a - b === 1 ? `A diferença é uma parte: k = ${num(d)}.` : `${kx(a - b)} = ${num(d)} → k = ${num(k)}.`],
      solution: [
        a - b === 1 ? `$${kx(a)} − ${kx(b)} = k = ${num(d)}` : `$${kx(a)} − ${kx(b)} = ${kx(a - b)} = ${num(d)} → k = ${num(k)}`,
        `$${A}: ${kx(a)} = ${num(a * k)}; ${B}: ${kx(b)} = ${num(b * k)}; total: ${kx(a + b)} = ${num((a + b) * k)}`,
      ],
    });
  }
}

const TRADES = [
  { where: 'Num clube de troca de figurinhas', a: 'figurinhas comuns', b: 'figurinhas brilhantes', c: 'figurinhas raras', many: 'quantas' },
  { where: 'Num jogo de tabuleiro', a: 'moedas de cobre', b: 'moedas de prata', c: 'moedas de ouro', many: 'quantas' },
  { where: 'Numa feira de trocas', a: 'potes de mel', b: 'queijos', c: 'cestos de frutas', many: 'quantos' },
];

/** Trocas encadeadas: multiplicar os fatores de conversão. */
function chainGen(r: Rand) {
  for (;;) {
    const c = r.pick(TRADES);
    const p1 = r.int(2, 6);
    const q1 = r.int(2, 6);
    const p2 = r.int(2, 6);
    const q2 = r.int(2, 6);
    if (p1 === q1 || p2 === q2 || gcd(p1, q1) !== 1 || gcd(p2, q2) !== 1) continue;
    const n = p1 * r.int(2, 12);
    const mid = (n * q1) / p1;
    if (mid % p2 !== 0) continue;
    const answer = (mid * q2) / p2;
    if (p1 === 3 && q1 === 4 && p2 === 5 && q2 === 2 && n === 30) continue; // números de uma questão do banco
    return draftNumeric({
      prompt: [p(`${c.where}, ${p1} ${c.a} valem ${q1} ${c.b}, e ${p2} ${c.b} valem ${q2} ${c.c}.`)],
      ask: `${n} ${c.a} equivalem a ${c.many} ${c.c}?`,
      answer,
      wrong: [
        { value: mid, feedback: `${mid} é a quantidade de ${c.b} (o passo do meio). Falta converter em ${c.c}: × ${q2}/${p2}.` },
        { value: round((n * p1 * q2) / (q1 * p2), 2), feedback: `A primeira troca ficou invertida: ${p1} ${c.a} valem ${q1} ${c.b}, então ${n} ${c.a} valem ${n} × ${q1}/${p1}.` },
        { value: round((mid * p2) / q2, 2), feedback: `A segunda troca ficou invertida: ${p2} ${c.b} valem ${q2} ${c.c}, então multiplique por ${q2}/${p2}.` },
      ],
      hints: [`Primeiro converta em ${c.b}: ${n} × ${q1}/${p1}.`, `Depois converta em ${c.c}: × ${q2}/${p2}.`],
      solution: [`$${n} × [[${q1}|${p1}]] = ${mid} ${c.b}`, `$${mid} × [[${q2}|${p2}]] = ${answer} ${c.c}`],
    });
  }
}

const MIXES = [
  { what: 'um suco feito', x: 'concentrado', xArt: 'o', y: 'água', yArt: 'a', unit: 'L' },
  { what: 'uma tinta feita', x: 'pigmento', xArt: 'o', y: 'base', yArt: 'a', unit: 'L' },
  { what: 'uma argamassa feita', x: 'cimento', xArt: 'o', y: 'areia', yArt: 'a', unit: 'kg' },
  { what: 'uma solução de limpeza feita', x: 'detergente', xArt: 'o', y: 'água', yArt: 'a', unit: 'L' },
];

/** Corrigir uma mistura acrescentando só um componente (o outro fica fixo). */
function addOneGen(r: Rand) {
  for (;;) {
    const c = r.pick(MIXES);
    const a = r.int(1, 4);
    const b = r.int(2, 9);
    const p2 = r.int(1, 4);
    const q2 = r.int(2, 12);
    if (gcd(a, b) !== 1 || gcd(p2, q2) !== 1 || (a === p2 && b === q2)) continue;
    const addY = q2 * a > b * p2; // a nova razão pede mais do segundo componente
    const k = r.int(2, 30);
    const X = a * k;
    const Y = b * k;
    const M = X + Y;
    const target = addY ? (X * q2) / p2 : (Y * p2) / q2;
    if (!Number.isInteger(target * 2) || M > 300) continue;
    const have = addY ? Y : X;
    const add = target - have;
    if (add < 1) continue;
    if (a === 1 && b === 5 && p2 === 1 && q2 === 8 && M === 120) continue; // números de uma questão do banco
    const [fixedName, addName] = addY ? [c.x, c.y] : [c.y, c.x];
    const fixedArt = addY ? c.xArt : c.yArt;
    const Art = fixedArt.toUpperCase();
    const fixed = addY ? X : Y;
    const byRatio = r.next() < 0.5;
    const intro = byRatio
      ? `Há ${M} ${c.unit} de ${c.what} com ${c.x} e ${c.y} na razão ${a} : ${b}.`
      : `Há ${c.what} com ${X} ${c.unit} de ${c.x} e ${Y} ${c.unit} de ${c.y}.`;
    const naive = addY ? (M * q2) / (p2 + q2) - Y : (M * p2) / (p2 + q2) - X;
    const termDiff = addY ? (q2 - b) * k : (p2 - a) * k;
    return draftNumeric({
      prompt: [p(`${intro} A receita certa pede ${c.x} e ${c.y} na razão ${p2} : ${q2}, e a correção será feita acrescentando apenas ${addName}.`)],
      ask: `Quantos ${c.unit === 'kg' ? 'quilogramas' : 'litros'} de ${addName} devem ser acrescentados?`,
      unit: c.unit,
      answer: add,
      wrong: [
        { value: target, feedback: `${num(target, 2)} ${c.unit} é a quantidade TOTAL de ${addName} na mistura corrigida; já há ${have} ${c.unit}.` },
        ...(naive > 0 ? [{ value: round(naive, 2), feedback: `Isso mantém o total da mistura fixo em ${M} ${c.unit}, mas ele cresce. Quem fica fixo é ${fixedArt} ${fixedName}: ${fixed} ${c.unit}.` }] : []),
        ...(termDiff > 0 ? [{ value: termDiff, feedback: `Subtrair os termos das razões só funciona quando o termo d${fixedArt} ${fixedName} é o mesmo nas duas. Parta d${fixedArt} ${fixedName}, que não muda.` }] : []),
      ],
      hints: [`${Art} ${fixedName} não muda: ${fixed} ${c.unit}${byRatio ? ` (${c.x}: ${a}/${a + b} de ${M})` : ''}.`, `Na razão ${p2} : ${q2}, quanto de ${addName} combina com ${fixed} ${c.unit} de ${fixedName}?`],
      solution: [
        ...(byRatio ? [`$${c.x}: ${M} × [[${a}|${a + b}]] = ${X}; ${c.y}: ${M} × [[${b}|${a + b}]] = ${Y}`] : []),
        addY ? `$${c.y} necessária: ${X} × [[${q2}|${p2}]] = ${num(target, 2)}` : `$${c.x} necessário: ${Y} × [[${p2}|${q2}]] = ${num(target, 2)}`,
        `$Acrescentar: ${num(target, 2)} − ${have} = ${num(add, 2)} ${c.unit}`,
      ],
    });
  }
}

const RECIPES = [
  { what: 'concreto', items: ['cimento', 'areia', 'brita'], unit: 'kg' },
  { what: 'granola', items: ['aveia', 'castanhas', 'uvas-passas'], unit: 'g' },
  { what: 'adubo orgânico', items: ['folhas secas', 'esterco', 'cinzas'], unit: 'kg' },
];

/** Ingrediente limitante: o menor estoque por parte da receita decide. */
function limitGen(r: Rand) {
  for (;;) {
    const c = r.pick(RECIPES);
    const w = [r.int(1, 5), r.int(1, 5), r.int(1, 5)];
    if (gcd3(w) !== 1) continue;
    const ks = r.shuffle([10, 15, 20, 25, 30, 40, 45, 50, 60]).slice(0, 3);
    const scale = c.unit === 'g' ? 10 : 1;
    const stock = w.map((x, i) => x * ks[i] * scale);
    const S = w[0] + w[1] + w[2];
    const [lim, mid, top] = [0, 1, 2].sort((i, j) => ks[i] - ks[j]);
    const kmin = ks[lim] * scale;
    const porc = (i: number) => `${num(stock[i])} ÷ ${w[i]} = ${num(ks[i] * scale)}`;
    return draftNumeric({
      prompt: [
        p(`Uma receita de ${c.what} usa ${c.items.join(', ').replace(/, (?=[^,]*$)/, ' e ')} na razão ${w.join(' : ')}, em massa. O estoque disponível está na tabela.`),
        table(['Material', 'Estoque'], c.items.map((it, i) => [it, `${num(stock[i])} ${c.unit}`])),
      ],
      ask: `Respeitando a razão, qual é a maior quantidade de ${c.what} que se pode preparar, em ${c.unit === 'g' ? 'gramas' : 'quilogramas'}?`,
      unit: c.unit,
      answer: S * kmin,
      wrong: [
        { value: stock[0] + stock[1] + stock[2], feedback: `Usar todo o estoque quebraria a razão: o estoque de ${c.items[lim]} acaba antes dos outros.` },
        { value: S * ks[top] * scale, feedback: `Isso usa o estoque de ${c.items[top]} como referência (${porc(top)}), o que rende MAIS. O limite vem do que acaba primeiro: ${c.items[lim]}.` },
        { value: S * ks[mid] * scale, feedback: `Isso usa o estoque de ${c.items[mid]} como referência (${porc(mid)}), mas o de ${c.items[lim]} acaba antes: rende só ${porc(lim)}.` },
      ],
      hints: [`Divida cada estoque pela sua parte na receita: quantas "porções" cada um permite?`, `O menor resultado manda; a receita tem ${S} partes por porção.`],
      solution: [
        `$${c.items.map((_, i) => porc(i)).join('; ')}`,
        `$Limite: ${c.items[lim]} → ${num(kmin)}; total = ${S} × ${num(kmin)} = ${num(S * kmin)} ${c.unit}`,
      ],
    });
  }
}

const INVERSES = [
  {
    prompt: (v: number[], T: number) => `Um prêmio de ${brl(T)} será dividido entre três funcionários em partes inversamente proporcionais ao número de faltas no ano: ${NAMES[0]} faltou ${v[0]} vezes, ${NAMES[1]} ${v[1]} e ${NAMES[2]} ${v[2]}.`,
    ask: (i: number) => `Quanto ${NAMES[i]} vai receber?`,
    what: 'faltas',
    scale: 1,
  },
  {
    prompt: (v: number[], T: number) => `Uma avó vai dividir ${brl(T)} entre três netos, de ${v[0]}, ${v[1]} e ${v[2]} anos, em partes inversamente proporcionais às idades.`,
    ask: (i: number, v: number[]) => `Quanto receberá o neto de ${v[i]} anos?`,
    what: 'anos',
    scale: 1,
  },
  {
    prompt: (v: number[], T: number) => `Três entregadores vão repartir uma gorjeta de ${brl(T)} em partes inversamente proporcionais ao tempo médio de entrega: ${NAMES[0]} leva ${v[0]} min, ${NAMES[1]} ${v[1]} min e ${NAMES[2]} ${v[2]} min.`,
    ask: (i: number) => `Quanto ${NAMES[i]} vai receber?`,
    what: 'minutos',
    scale: 5,
  },
];

/** Partes inversamente proporcionais: pesos 1/v, levados a inteiros pelo MMC. */
function inverseSplitGen(r: Rand) {
  for (;;) {
    const c = r.pick(INVERSES);
    const base = r.shuffle([2, 3, 4, 5, 6, 8, 9, 10, 12]).slice(0, 3);
    const v = base.map((x) => x * c.scale);
    const m = lcm3(base);
    if (m > 120) continue;
    const w = base.map((x) => m / x);
    const g = gcd3(w);
    const W = w.map((x) => x / g);
    const S = W[0] + W[1] + W[2];
    const k = r.pick([50, 100, 150, 200, 250, 300, 500]);
    const T = S * k;
    if (c.what === 'anos' && [...base].sort((x, y) => x - y).join() === '2,3,6' && T === 36000) continue; // questão do banco
    const i = r.int(0, 2);
    const sumV = v[0] + v[1] + v[2];
    const sorted = [...v].sort((x, y) => x - y);
    const mirror = sorted[2 - sorted.indexOf(v[i])];
    return draftNumeric({
      prompt: [p(c.prompt(v, T))],
      ask: c.ask(i, v),
      prefix: 'R$',
      answer: W[i] * k,
      wrong: [
        { value: round((T * v[i]) / sumV, 2), feedback: `Isso reparte DIRETAMENTE proporcional: quem tem mais ${c.what} receberia mais. Na inversa, use os inversos 1/${v[0]}, 1/${v[1]} e 1/${v[2]}.` },
        { value: round((T * mirror) / sumV, 2), feedback: 'Trocar a ordem dos números (o menor fica com o peso do maior) não é inverter. Com três números, use os inversos e o MMC.' },
        { value: round(T / 3, 2), feedback: 'Isso divide em partes iguais. Na divisão inversa, quem tem o MENOR número recebe mais.' },
      ],
      hints: [`Inversamente proporcional a ${v.join(', ')} = diretamente proporcional a 1/${v[0]}, 1/${v[1]}, 1/${v[2]}.`, `Multiplique os inversos por ${m * c.scale}: ${W.join(' : ')}${g > 1 ? ' (simplificando)' : ''}.`],
      solution: [
        `$1/${v[0]} : 1/${v[1]} : 1/${v[2]} = ${W.join(' : ')}`,
        `$${W.join(' + ')} = ${S} partes; cada parte = ${num(T)} ÷ ${S} = ${num(k)}`,
        `$Parte pedida: ${W[i]} × ${num(k)} = ${brl(W[i] * k)}`,
      ],
    });
  }
}

/** Diretamente proporcional a uma grandeza e inversamente a outra: peso A ÷ B. */
function directInverseGen(r: Rand) {
  for (;;) {
    const A = [r.int(1, 10), r.int(1, 10), r.int(1, 10)];
    const B = [r.int(1, 5), r.int(1, 5), r.int(1, 5)];
    if (new Set(A.map((x, i) => x / B[i])).size < 3 || new Set(B).size < 2) continue;
    if (A.join() === '3,5,8' && B.join() === '1,2,4') continue; // questão do banco
    const D = lcm3(B.map((b, i) => b / gcd(A[i], b)));
    const w = A.map((x, i) => (x * D) / B[i]);
    const g = gcd3(w);
    const W = w.map((x) => x / g);
    const S = W[0] + W[1] + W[2];
    if (S > 40) continue;
    const k = r.pick([50, 60, 75, 100, 120, 150, 200]);
    const T = S * k;
    const i = r.int(0, 2);
    const sumA = A[0] + A[1] + A[2];
    const inv = B.map((b) => 1 / b);
    const sumInv = inv[0] + inv[1] + inv[2];
    const prod = A.map((x, j) => x * B[j]);
    const sumProd = prod[0] + prod[1] + prod[2];
    return draftNumeric({
      prompt: [
        p(`Um bônus de ${brl(T)} será dividido entre três funcionários em partes diretamente proporcionais ao tempo de empresa e inversamente proporcionais ao número de faltas no ano.`),
        table(['Funcionário', 'Tempo de empresa', 'Faltas no ano'], NAMES.map((n, j) => [n, `${A[j]} ${A[j] === 1 ? 'ano' : 'anos'}`, `${B[j]}`])),
      ],
      ask: `Quanto ${NAMES[i]} vai receber?`,
      prefix: 'R$',
      answer: W[i] * k,
      wrong: [
        { value: round((T * A[i]) / sumA, 2), feedback: 'Isso considera só o tempo de empresa. A parte também é inversamente proporcional às faltas: o peso é tempo ÷ faltas.' },
        { value: round((T * inv[i]) / sumInv, 2), feedback: 'Isso considera só as faltas. A parte também é diretamente proporcional ao tempo: o peso é tempo ÷ faltas.' },
        { value: round((T * prod[i]) / sumProd, 2), feedback: 'Multiplicar o tempo pelas faltas daria MAIS a quem falta mais. Inversamente proporcional às faltas = dividir por elas.' },
      ],
      hints: ['O peso de cada um é tempo de empresa ÷ faltas.', `Pesos: ${A.map((x, j) => `${x}/${B[j]}`).join(', ')}; leve-os a inteiros.`],
      solution: [
        `$Pesos: ${A.map((x, j) => `[[${x}|${B[j]}]]`).join(' : ')} = ${W.join(' : ')}`,
        `$${W.join(' + ')} = ${S} partes; cada parte = ${num(T)} ÷ ${S} = ${num(k)}`,
        `$${NAMES[i]}: ${W[i]} × ${num(k)} = ${brl(W[i] * k)}`,
      ],
    });
  }
}

// ———————————————————————————————————————————————— aula

export const PROPORCAO = lesson({
  id: 'proporcao',
  topic: 'razao-proporcao',
  subtopics: ['proporcao'],
  title: 'Proporção',
  summary:
    'Igualdade de razões e produto cruzado, partes proporcionais (diretas e inversas), proporções dadas pela diferença, trocas encadeadas e misturas que precisam ser corrigidas.',
  requires: ['razao'],
  stages: [
    stage('igualdade', 'descoberta', 'Proporção: a igualdade de razões', 'Reconhecer grandezas diretamente proporcionais, montar a proporção na ordem certa e encontrar o termo desconhecido pelo produto cruzado.', () => ({
      learn: [
        text('Uma **proporção** é uma igualdade entre duas razões: 2/5 = 6/15. Duas grandezas são **diretamente proporcionais** quando a razão entre elas é sempre a mesma: dobrou uma, dobra a outra. Nesse caso vale o **produto cruzado**: se a/b = c/d, então a · d = b · c.'),
        lab({
          title: 'Receita para muitos',
          intro: 'Uma receita de panquecas para 4 pessoas usa 300 g de farinha, 120 g de açúcar e 200 mL de leite. Mude o número de pessoas.',
          params: [{ key: 'n', label: 'Pessoas', min: 2, max: 20, step: 1, value: 4, format: (v) => `${v}` }],
          readouts: ({ n }) => [
            { label: 'Farinha', value: `${num(75 * n)} g`, big: true, tone: 'brass' },
            { label: 'Açúcar', value: `${num(30 * n)} g` },
            { label: 'Leite', value: `${num(50 * n)} mL` },
            { label: 'Farinha ÷ pessoas', value: `${num(75 * n)} ÷ ${n} = 75 g por pessoa (constante)` },
          ],
          viz: ({ n }) => ({
            kind: 'bars',
            bars: [
              { label: 'Farinha (g)', value: 75 * n, tone: 'brass' },
              { label: 'Açúcar (g)', value: 30 * n, tone: 'parchment' },
              { label: 'Leite (mL)', value: 50 * n, tone: 'sky' },
            ],
            max: 1500,
            summary: `Para ${n} pessoas: ${num(75 * n)} g de farinha, ${num(30 * n)} g de açúcar e ${num(50 * n)} mL de leite`,
          }),
          goal: {
            task: 'Descubra para quantas pessoas a receita usa exatamente 1.050 g de farinha.',
            done: ({ n }) => n === 14,
            success: 'Isso: 1.050 ÷ 75 = 14 pessoas. A razão farinha : pessoas ficou constante (75 g por pessoa) em todas as versões da receita.',
          },
          insight: 'Grandezas diretamente proporcionais têm razão constante: é essa constante que permite calcular qualquer versão da receita.',
        }),
        key('Produto cruzado', 'Se a/b = c/d, então a · d = b · c. Com isso se encontra o termo que falta: 3/8 = x/56 → 8x = 3 · 56 → x = 21.'),
        example('A vara e o prédio', 'No mesmo instante, uma vara vertical de 2 m faz uma sombra de 0,8 m, e um prédio faz uma sombra de 12 m. Qual é a altura do prédio?', [
          askStep('Altura e sombra são proporcionais (mesmo instante, mesmos raios de sol).', 'Qual proporção representa a situação?', [
            ok('[[2|0,8]] = [[h|12]] (altura/sombra dos dois lados)'),
            no('[[2|0,8]] = [[12|h]]', 'Essa proporção mistura a ordem: à esquerda é altura/sombra, à direita ficou sombra/altura.'),
          ]),
          step('Produto cruzado:', '0,8 · h = 2 · 12 → h = 24 ÷ 0,8 = 30 m'),
        ], 'O prédio tem 30 m.'),
        warn('Nem tudo é proporcional', 'Uma corrida de táxi com bandeirada (valor fixo) não é proporcional à distância: R$ 5,00 + R$ 3,00 por km dá R$ 11,00 por 2 km e R$ 17,00 por 4 km — a distância dobrou, o preço não. Antes de usar a proporção, confira se a razão é constante.'),
        check(classify({
          ask: 'As duas grandezas são diretamente proporcionais?',
          bins: ['Diretamente proporcionais', 'Não proporcionais'],
          items: [
            { text: 'Quilos de feijão comprados e preço pago (R$ 8,00 o kg)', bin: 0 },
            { text: 'Consumo de água e valor da conta com taxa mínima fixa', bin: 1, why: 'A parte fixa faz a razão mudar com o consumo.' },
            { text: 'Lado de um quadrado e seu perímetro', bin: 0 },
            { text: 'Lado de um quadrado e sua área', bin: 1, why: 'Dobrar o lado multiplica a área por 4.' },
            { text: 'Tempo de viagem e distância, a velocidade constante', bin: 0 },
            { text: 'Idade de uma criança e sua altura', bin: 1 },
          ],
          solution: ['Proporcional: a razão entre as grandezas é constante (sem valor fixo somado, sem quadrados).'],
        })),
        check(numeric({
          prompt: [p('Uma impressora imprime 45 páginas em 3 minutos, sempre no mesmo ritmo.')],
          ask: 'Quantas páginas ela imprime em 8 minutos?',
          unit: 'páginas',
          answer: 120,
          wrong: [
            { value: 50, feedback: 'Somar 5 ao 45 não respeita a razão: o tempo foi multiplicado por 8/3, e as páginas também precisam ser.' },
            { value: 16.875, feedback: 'Isso inverte a proporção (45 × 3 ÷ 8): mais tempo deve dar MAIS páginas.' },
            { value: 15, feedback: '15 páginas por minuto é a taxa. Multiplique pelos 8 minutos.' },
          ],
          solution: ['$[[45|3]] = [[x|8]] → x = 45 × 8 ÷ 3 = 120'],
        })),
      ],
      practice: [
        gen(fourthGen),
        numeric({
          prompt: [p('Às 9 h, uma estaca vertical de 1,2 m faz uma sombra de 1,8 m. No mesmo instante, a sombra de uma torre mede 27 m.')],
          ask: 'Qual é a altura da torre?',
          unit: 'm',
          answer: 18,
          wrong: [
            { value: 40.5, feedback: 'Isso inverte a proporção (27 × 1,8 ÷ 1,2). Nesse horário, a sombra é MAIOR que o objeto: a torre é menor que 27 m.' },
            { value: 26.4, feedback: 'Subtrair a diferença (1,8 − 1,2 = 0,6) não mantém a razão. Altura e sombra são multiplicadas pelo mesmo fator.' },
            { value: 1.5, feedback: '1,5 = 1,8 ÷ 1,2 é a razão sombra : altura. A altura da torre é 27 ÷ 1,5 = 18 m.' },
          ],
          hints: ['Monte altura/sombra = altura/sombra.', '[[1,2|1,8]] = [[h|27]].'],
          solution: ['$[[1,2|1,8]] = [[h|27]] → 1,8 · h = 1,2 · 27 → h = 18 m'],
        }),
        gen(fracTimeGen),
      ],
      challenge: [
        gen(fourthGen),
        gen(fracTimeGen),
        numeric({
          prompt: [p('Uma foto de 10 cm × 15 cm será ampliada, sem deformar, até que o lado maior meça 60 cm.')],
          ask: 'Quanto medirá o lado menor?',
          unit: 'cm',
          answer: 40,
          wrong: [
            { value: 55, feedback: 'Somar 45 cm aos dois lados deforma a foto. Na ampliação, os lados são MULTIPLICADOS pelo mesmo fator (60 ÷ 15 = 4).' },
            { value: 90, feedback: '90 = 60 × 15 ÷ 10 inverte a proporção: o lado menor deve continuar menor que o maior.' },
            { value: 4, feedback: '4 é o fator de ampliação (60 ÷ 15). O lado menor fica 10 × 4 = 40 cm.' },
          ],
          solution: ['$Fator: 60 ÷ 15 = 4', '$Lado menor: 10 × 4 = 40 cm'],
        }),
      ],
      recap: [
        'Proporção: igualdade de duas razões (a/b = c/d).',
        'Diretamente proporcionais: razão constante — dobrou uma, dobra a outra.',
        'Produto cruzado: a · d = b · c.',
        'Monte as duas razões na MESMA ordem (altura/sombra = altura/sombra).',
        'Valor fixo somado (taxa, bandeirada) quebra a proporcionalidade.',
      ],
    })),

    stage('partes', 'fundamentos', 'Partes diretamente proporcionais', 'Repartir um total em partes diretamente proporcionais a números dados — inteiros, valores grandes ou frações —, inclusive quando há reserva ou transferência.', () => ({
      learn: [
        text('Três sócios investiram R$ 12.000, R$ 8.000 e R$ 4.000 e vão dividir R$ 9.000 de lucro em partes **diretamente proporcionais** ao investimento. Simplificando, a proporção é 3 : 2 : 1: cada um recebe k vezes o seu número, com 3k + 2k + k = 9.000 → k = 1.500. As partes são R$ 4.500, R$ 3.000 e R$ 1.500.'),
        lab({
          title: 'A sociedade',
          intro: 'Escolha quanto cada sócio investe (em milhares de reais). O lucro de R$ 12.000,00 é repartido proporcionalmente.',
          params: [
            { key: 'a', label: 'Investimento de A (mil R$)', min: 1, max: 10, step: 1, value: 5, format: (v) => `${v} mil` },
            { key: 'b', label: 'Investimento de B (mil R$)', min: 1, max: 10, step: 1, value: 5, format: (v) => `${v} mil` },
            { key: 'c', label: 'Investimento de C (mil R$)', min: 1, max: 10, step: 1, value: 5, format: (v) => `${v} mil` },
          ],
          readouts: ({ a, b, c }) => {
            const k = 12000 / (a + b + c);
            return [
              { label: 'Proporção', value: `${a} : ${b} : ${c}` },
              { label: 'Lucro por mil investidos', value: brl(k) },
              { label: 'A recebe', value: brl(a * k), tone: 'sky' },
              { label: 'B recebe', value: brl(b * k), tone: 'brass' },
              { label: 'C recebe', value: brl(c * k), tone: 'verdigris' },
            ];
          },
          viz: ({ a, b, c }) => ({
            kind: 'parts',
            segments: [
              { label: 'A', value: a, tone: 'sky' },
              { label: 'B', value: b, tone: 'brass' },
              { label: 'C', value: c, tone: 'verdigris' },
            ],
            summary: `Lucro repartido na proporção ${a} : ${b} : ${c}`,
          }),
          goal: {
            task: 'Faça B receber o dobro de A, e C receber o triplo de A.',
            done: ({ a, b, c }) => b === 2 * a && c === 3 * a,
            success: 'Isso: a proporção 1 : 2 : 3 (ou 2 : 4 : 6, ou 3 : 6 : 9) dá a B o dobro e a C o triplo de A — o lucro segue a razão dos investimentos.',
          },
          insight: 'Proporções equivalentes (1 : 2 : 3 e 2 : 4 : 6) produzem exatamente a mesma partilha.',
        }),
        key('Pesos que são frações', 'Para repartir na proporção 1/3 : 1/4 : 1/6, multiplique todos os pesos pelo MMC dos denominadores (12): a proporção vira 4 : 3 : 2. Ela não muda, e as contas ficam inteiras.'),
        example('Reserva antes da partilha', 'Um clube arrecadou R$ 3.000,00, separou R$ 600,00 para um fundo de emergência e dividiu o restante entre duas equipes na razão 5 : 3. Quanto recebeu cada equipe?', [
          askStep('Primeiro, o valor que será repartido.', 'O que se divide na razão 5 : 3?', [
            ok('Os R$ 2.400,00 que sobram depois da reserva'),
            no('Os R$ 3.000,00 arrecadados', 'A reserva sai antes: só o restante é repartido.'),
          ], '3.000 − 600 = 2.400'),
          step('5 + 3 = 8 partes de R$ 300,00:', '5 × 300 = 1.500 e 3 × 300 = 900'),
        ], 'As equipes receberam R$ 1.500,00 e R$ 900,00.'),
        tip('Transferência depois da partilha', 'Se, depois de repartir, um grupo cede parte ao outro, faça a partilha primeiro e a transferência depois: quem cede perde esse valor, quem recebe ganha — e o total não muda.'),
        check(numeric({
          prompt: [p('R$ 2.700,00 serão divididos em partes diretamente proporcionais a 2, 3 e 4.')],
          ask: 'Qual é a maior parte?',
          prefix: 'R$',
          answer: 1200,
          wrong: [
            { value: 900, feedback: 'R$ 900,00 é a divisão em partes iguais (2.700 ÷ 3). Proporcional a 2, 3 e 4, a maior parte é 4/9 do total.' },
            { value: 300, feedback: 'R$ 300,00 é o valor de cada parte (2.700 ÷ 9). A maior parte tem 4 delas.' },
            { value: 600, feedback: 'R$ 600,00 é a MENOR parte (2 × 300).' },
          ],
          solution: ['$2 + 3 + 4 = 9 partes; 2.700 ÷ 9 = 300', '$Maior parte: 4 × 300 = R$ 1.200,00'],
        })),
      ],
      practice: [
        gen(propSplitGen),
        gen(fracWeightsGen),
        numeric({
          prompt: [p('Uma escola recebeu 500 livros. Separou 80 para a biblioteca e dividiu o restante entre duas turmas na razão 4 : 3.')],
          ask: 'Quantos livros recebeu a turma com a menor parte?',
          unit: 'livros',
          answer: 180,
          wrong: [
            { value: 214.29, feedback: 'Isso reparte os 500 livros, mas os 80 da biblioteca saem antes. Só 420 entram na partilha.' },
            { value: 210, feedback: '210 é a metade de 420: divisão em partes iguais. Na razão 4 : 3, a menor parte é 3/7 de 420.' },
            { value: 240, feedback: '240 livros (4 partes de 60) vão para a turma com a MAIOR parte.' },
          ],
          hints: ['Desconte a reserva: 500 − 80.', 'Divida 420 em 4 + 3 = 7 partes.'],
          solution: ['$500 − 80 = 420; 420 ÷ 7 = 60', '$Menor parte: 3 × 60 = 180 livros'],
        }),
      ],
      challenge: [
        gen(propSplitGen),
        gen(fracWeightsGen),
        numeric({
          prompt: [p('Três equipes repartiram R$ 2.400,00 em partes diretamente proporcionais às suas vitórias: 3, 4 e 5. Depois, a equipe de 5 vitórias cedeu R$ 100,00 da sua parte à equipe de 3 vitórias.')],
          ask: 'Com quanto ficou a equipe de 3 vitórias?',
          prefix: 'R$',
          answer: 700,
          wrong: [
            { value: 600, feedback: 'R$ 600,00 era a parte da equipe de 3 vitórias ANTES da transferência. Some os R$ 100,00 recebidos.' },
            { value: 900, feedback: 'R$ 900,00 é com quanto ficou a equipe que CEDEU (1.000 − 100).' },
            { value: 500, feedback: 'A transferência foi feita ao contrário: a equipe de 3 vitórias RECEBEU os R$ 100,00.' },
          ],
          solution: ['$3 + 4 + 5 = 12 partes; 2.400 ÷ 12 = 200', '$Equipe de 3 vitórias: 3 × 200 = 600; depois da transferência: 600 + 100 = R$ 700,00'],
        }),
      ],
      recap: [
        'Partes diretamente proporcionais a a, b, c: cada um recebe k vezes o seu número.',
        'k = total ÷ (a + b + c).',
        'Simplifique valores grandes (12.000 : 8.000 : 4.000 = 3 : 2 : 1).',
        'Pesos em fração: multiplique todos pelo MMC dos denominadores.',
        'Reserva sai antes da partilha; transferências vêm depois.',
      ],
    })),

    stage('interpretar', 'interpretacao', 'Diferenças, trocas e estimativas', 'Resolver proporções em que o dado é a diferença entre as quantidades, encadear equivalências e estimar populações por amostragem.', () => ({
      learn: [
        text('Nem sempre o problema dá o total. Com a razão 3 : 7, as quantidades são 3k e 7k — e a **diferença** também é um múltiplo de k: 7k − 3k = 4k. Se numa jarra de suco e água (3 : 7) a água supera o suco em 2 L, então 4k = 2 e k = 0,5 L: são 1,5 L de suco e 3,5 L de água.'),
        lab({
          title: 'Partes e diferença',
          intro: 'Dois grupos estão na razão A : B, e A tem um certo número de itens a mais que B. Veja como a diferença revela o valor de cada parte.',
          params: [
            { key: 'a', label: 'Partes de A', min: 1, max: 9, step: 1, value: 5, format: (v) => `${v}` },
            { key: 'b', label: 'Partes de B', min: 1, max: 9, step: 1, value: 3, format: (v) => `${v}` },
            { key: 'd', label: 'A tem a mais que B', min: 5, max: 100, step: 5, value: 20, format: (v) => `${v}` },
          ],
          readouts: ({ a, b, d }) => {
            if (a <= b) {
              return [
                { label: 'Diferença em partes', value: `${a} − ${b} = ${a - b}` },
                { label: 'Atenção', value: 'para A ter mais itens que B, A precisa ter mais partes', tone: 'ember' },
              ];
            }
            const k = d / (a - b);
            return [
              { label: 'Diferença em partes', value: `${a} − ${b} = ${a - b}` },
              { label: 'Cada parte (k)', value: `${d} ÷ ${a - b} = ${num(k, 2)}` },
              { label: 'A', value: `${a} × ${num(k, 2)} = ${num(a * k, 2)}`, big: true, tone: 'sky' },
              { label: 'B', value: `${b} × ${num(k, 2)} = ${num(b * k, 2)}`, big: true, tone: 'brass' },
              { label: 'Total', value: num((a + b) * k, 2) },
            ];
          },
          viz: ({ a, b, d }) => {
            const k = a > b ? d / (a - b) : 0;
            return {
              kind: 'bars',
              bars: [
                { label: 'A', value: a * k, text: num(a * k, 2), tone: 'sky' },
                { label: 'B', value: b * k, text: num(b * k, 2), tone: 'brass' },
              ],
              summary: a > b ? `A tem ${num(a * k, 2)} e B tem ${num(b * k, 2)}: diferença de ${d}` : 'Com A sem mais partes que B, não há diferença positiva',
            };
          },
          goal: {
            task: 'Ajuste a razão e a diferença para que A tenha 56 itens e B, 21.',
            done: ({ a, b, d }) => a > b && Math.abs((a * d) / (a - b) - 56) < 1e-9 && Math.abs((b * d) / (a - b) - 21) < 1e-9,
            success: 'Isso: 56 : 21 = 8 : 3, e a diferença de 35 corresponde a 8 − 3 = 5 partes de 7.',
          },
          insight: 'A diferença entre os grupos vale (a − b) partes; o total vale (a + b) partes. Confundir as duas é o erro mais comum.',
        }),
        example('Quantas árvores ao todo?', 'Num pomar, laranjeiras e limoeiros estão na razão 7 : 4, e há 18 laranjeiras a mais que limoeiros. Quantas árvores há ao todo?', [
          askStep('As quantidades são 7k e 4k.', 'A quantas partes correspondem as 18 árvores a mais?', [
            ok('7 − 4 = 3 partes'),
            no('7 + 4 = 11 partes', '11 partes formam o TOTAL. A diferença entre os grupos é 7 − 4 = 3 partes.'),
          ], '3k = 18 → k = 6'),
          step('Total: 7k + 4k = 11k.', '11 × 6 = 66'),
        ], 'Há 66 árvores (42 laranjeiras e 24 limoeiros).'),
        key('Trocas encadeadas', 'Equivalências encadeiam como razões: multiplique pelos fatores de conversão, cancelando a unidade do meio. Se 2 pães valem 3 bolos e 4 bolos valem 5 tortas, então 8 pães × 3/2 × 5/4 = 15 tortas.'),
        tip('Captura e recaptura', 'Para estimar uma população, marcam-se alguns animais e, depois, observa-se uma nova amostra. A proporção de marcados na amostra estima a proporção na população: com 80 tartarugas marcadas e 12 marcadas entre 60 recapturadas, 12/60 = 80/N → N = 400.'),
        check(numeric({
          prompt: [p('Numa loja, camisetas e bermudas estão na razão 5 : 2, e há 45 camisetas a mais que bermudas.')],
          ask: 'Quantas bermudas há na loja?',
          unit: 'bermudas',
          answer: 30,
          wrong: [
            { value: 75, feedback: '75 é o número de camisetas (5 × 15). A pergunta é sobre as bermudas.' },
            { value: 105, feedback: '105 é o total de peças (7 × 15).' },
            { value: 12.86, feedback: 'Isso divide a diferença pelo TOTAL de partes (7). A diferença corresponde a 5 − 2 = 3 partes.' },
          ],
          solution: ['$5k − 2k = 3k = 45 → k = 15', '$Bermudas: 2 × 15 = 30'],
        })),
      ],
      practice: [
        gen(diffGen),
        gen(chainGen),
        numeric({
          prompt: [p('Num lago, 120 peixes de uma espécie foram capturados, marcados e devolvidos. Semanas depois, numa nova captura de 75 peixes dessa espécie, 9 estavam marcados.')],
          ask: 'Qual é a estimativa para o número de peixes dessa espécie no lago?',
          unit: 'peixes',
          answer: 1000,
          wrong: [
            { value: 195, feedback: '195 = 120 + 75 soma as duas capturas. O método usa a proporção: 9/75 dos peixes do lago estão marcados.' },
            { value: 186, feedback: '186 = 120 + 75 − 9 conta só os peixes que foram vistos. A estimativa vale para o lago todo: 9/75 = 120/N.' },
            { value: 14.4, feedback: 'A proporção ficou invertida (120 × 9 ÷ 75). Marcados/amostra = marcados/população: 9/75 = 120/N.' },
          ],
          hints: ['A fração de marcados na amostra é 9/75.', 'Ela deve ser igual a 120/N.'],
          solution: ['$[[9|75]] = [[120|N]] → N = 120 × 75 ÷ 9 = 1.000 peixes'],
        }),
      ],
      challenge: [
        gen(diffGen),
        gen(chainGen),
        numeric({
          prompt: [p('Para estimar a população de capivaras de um parque, 60 foram marcadas e soltas. Depois, entre 45 capivaras avistadas, 12 tinham a marca.')],
          ask: 'Qual é a estimativa da população de capivaras do parque?',
          unit: 'capivaras',
          answer: 225,
          wrong: [
            { value: 16, feedback: 'A proporção ficou invertida (60 × 12 ÷ 45). Marcadas/avistadas = marcadas/população: 12/45 = 60/N.' },
            { value: 105, feedback: '105 = 60 + 45 soma os dois grupos. A estimativa vem da proporção 12/45 = 60/N.' },
            { value: 93, feedback: '93 = 60 + 45 − 12 conta só os animais vistos. A população é estimada pela proporção: 12/45 = 60/N.' },
          ],
          solution: ['$[[12|45]] = [[60|N]] → N = 60 × 45 ÷ 12 = 225 capivaras'],
        }),
      ],
      recap: [
        'Com razão a : b, as quantidades são ak e bk: diferença (a − b)k, total (a + b)k.',
        'Diferença dada → k = diferença ÷ (a − b).',
        'Trocas encadeadas: multiplique os fatores de conversão, cancelando a unidade do meio.',
        'Captura e recaptura: marcados na amostra ÷ amostra = marcados ÷ população.',
      ],
    })),

    stage('misturas', 'aplicacoes', 'Misturas: corrigir e aproveitar o estoque', 'Ajustar misturas acrescentando só um componente, calcular o máximo que um estoque permite (material limitante) e distinguir razão de concentração.', () => ({
      learn: [
        text('Quando se acrescenta **só um** componente a uma mistura, o outro fica fixo — e é por ele que se começa. Ex.: 60 L de suco com concentrado e água na razão 1 : 4 têm 12 L de concentrado e 48 L de água. Para chegar a 1 : 6 só com água, o concentrado (12 L) manda: a água precisa ser 6 × 12 = 72 L, e acrescentam-se 72 − 48 = 24 L.'),
        lab({
          title: 'Corrigir a mistura',
          intro: 'Um galão tem 90 L de suco na razão 1 : 4 (18 L de concentrado e 72 L de água). Acrescente água ou concentrado.',
          params: [
            { key: 'w', label: 'Água acrescentada (L)', min: 0, max: 80, step: 2, value: 0, format: (v) => `${v} L` },
            { key: 'c', label: 'Concentrado acrescentado (L)', min: 0, max: 20, step: 1, value: 0, format: (v) => `${v} L` },
          ],
          readouts: ({ w, c }) => {
            const conc = 18 + c;
            const water = 72 + w;
            return [
              { label: 'Concentrado', value: `${conc} L` },
              { label: 'Água', value: `${water} L` },
              { label: 'Razão concentrado : água', value: `1 : ${num(water / conc, 2)}`, big: true, tone: 'brass' },
              { label: 'Concentração', value: `${num((100 * conc) / (conc + water), 1)}% de concentrado` },
            ];
          },
          viz: ({ w, c }) => ({
            kind: 'parts',
            segments: [
              { label: 'concentrado', value: 18 + c, tone: 'ember' },
              { label: 'água', value: 72 + w, tone: 'sky' },
            ],
            summary: `${18 + c} L de concentrado e ${72 + w} L de água`,
          }),
          goal: {
            task: 'Deixe a mistura na razão 1 : 6 acrescentando só água.',
            done: ({ w, c }) => c === 0 && w === 36,
            success: 'Isso: o concentrado (18 L) não mudou, e a água precisa ser 6 × 18 = 108 L — foram acrescentados 36 L.',
          },
          insight: 'Quando só um componente muda, o outro fica fixo e serve de âncora para a conta.',
        }),
        example('Aproveitar o estoque', [p('Uma ração é feita com milho, soja e farelo na razão 4 : 3 : 1, em massa. Há 100 kg de milho, 90 kg de soja e 20 kg de farelo. Qual é a maior quantidade de ração que se pode fazer?')], [
          askStep('Divida cada estoque pela sua parte na receita: 100 ÷ 4 = 25, 90 ÷ 3 = 30, 20 ÷ 1 = 20.', 'Qual material limita a receita?', [
            ok('O farelo: só dá para 20 "porções"'),
            no('O milho, que tem o maior estoque', 'Ter mais quilos não basta: o milho permite 25 porções e o farelo, só 20.'),
            no('A soja', 'A soja permite 30 porções; o farelo acaba antes, com 20.'),
          ]),
          step('Cada porção tem 4 + 3 + 1 = 8 partes:', '8 × 20 = 160 kg'),
        ], 'Dá para fazer 160 kg de ração (80 kg de milho, 60 kg de soja e 20 kg de farelo).'),
        key('Razão não é porcentagem', 'Na razão 1 : 4 (concentrado : água), o concentrado é 1 parte de 5: 20% da mistura — e não 25%.'),
        warn('Não divida a mistura toda', 'Para mudar a razão acrescentando só água, NÃO aplique a nova razão ao total da mistura: o total muda, o concentrado não. Calcule o concentrado, depois a água necessária e, por fim, a diferença.'),
        check(numeric({
          prompt: [p('Uma calda tem 40 g de açúcar e 100 g de água, mas a receita pede açúcar e água na razão 1 : 2. A água não será alterada.')],
          ask: 'Quantos gramas de açúcar é preciso acrescentar?',
          unit: 'g',
          answer: 10,
          wrong: [
            { value: 50, feedback: '50 g é o açúcar TOTAL que a receita pede para 100 g de água. Já há 40 g.' },
            { value: 30, feedback: 'Isso parte de metade da mistura toda (140 ÷ 2 = 70). Fixa é a água: açúcar = 100 ÷ 2 = 50 g.' },
          ],
          solution: ['$Açúcar necessário: 100 × [[1|2]] = 50 g', '$Acrescentar: 50 − 40 = 10 g'],
        })),
      ],
      practice: [
        gen(addOneGen),
        gen(limitGen),
        numeric({
          prompt: [p('Um soro caseiro é preparado com 1 parte de sal para 49 partes de água, em massa.')],
          ask: 'Qual é a porcentagem de sal no soro?',
          unit: '%',
          answer: 2,
          wrong: [
            { value: 2.04, feedback: '1 ÷ 49 compara sal com ÁGUA. A porcentagem compara o sal com a mistura toda: 1 ÷ 50.' },
            { value: 98, feedback: '98% é a porcentagem de ÁGUA no soro.' },
          ],
          hints: ['A mistura tem 1 + 49 = 50 partes.', 'Sal: 1 de 50 partes.'],
          solution: ['$[[1|50]] = 0,02 = 2%'],
        }),
      ],
      challenge: [
        gen(addOneGen),
        gen(limitGen),
        numeric({
          prompt: [p('Uma tinta é feita com pigmento e base na razão 1 : 9. Um pintor tem 50 L dessa tinta e quer deixá-la na razão 1 : 4, acrescentando só pigmento.')],
          ask: 'Quantos litros de pigmento ele deve acrescentar?',
          unit: 'L',
          answer: 6.25,
          wrong: [
            { value: 11.25, feedback: '11,25 L é o pigmento TOTAL da tinta corrigida (45 ÷ 4). Já há 5 L.' },
            { value: 7.5, feedback: 'Isso aplica 1/4 à tinta inteira (50 ÷ 4 − 5). A base (45 L) é que fica fixa: pigmento = 45 ÷ 4 = 11,25 L.' },
            { value: 5, feedback: 'Isso mantém fixos os 50 L (50 × 1/5 − 5), mas o total cresce com o pigmento. Fixa é a base: 45 L.' },
          ],
          solution: ['$Pigmento: 50 × [[1|10]] = 5 L; base: 45 L', '$Pigmento necessário: 45 × [[1|4]] = 11,25 L', '$Acrescentar: 11,25 − 5 = 6,25 L'],
        }),
      ],
      recap: [
        'Acrescentando só um componente, o outro fica fixo: comece por ele.',
        'Material limitante: divida cada estoque pela sua parte na receita; o menor quociente manda.',
        'Razão 1 : 4 ⇒ concentração de 1/5 = 20%, não 25%.',
      ],
    })),

    stage('inversa', 'aprofundamento', 'Partes inversamente proporcionais', 'Repartir em partes inversamente proporcionais e em partes que dependem de duas grandezas ao mesmo tempo (uma direta, outra inversa).', () => ({
      learn: [
        text('Repartir **inversamente** proporcional a 3, 4 e 6 é repartir diretamente proporcional aos inversos 1/3, 1/4 e 1/6 — quem tem o número MENOR recebe MAIS. Multiplicando pelo MMC (12), os pesos ficam 4 : 3 : 2.'),
        lab({
          title: 'Partilha inversa',
          intro: 'Um prêmio de R$ 1.200,00 é dividido em partes inversamente proporcionais ao número de faltas de três pessoas.',
          params: [
            { key: 'x', label: 'Faltas da 1ª pessoa', min: 1, max: 10, step: 1, value: 2, format: (v) => `${v}` },
            { key: 'y', label: 'Faltas da 2ª pessoa', min: 1, max: 10, step: 1, value: 5, format: (v) => `${v}` },
            { key: 'z', label: 'Faltas da 3ª pessoa', min: 1, max: 10, step: 1, value: 10, format: (v) => `${v}` },
          ],
          readouts: ({ x, y, z }) => {
            const s = 1 / x + 1 / y + 1 / z;
            const m = lcm(lcm(x, y), z);
            return [
              { label: 'Pesos (inversos)', value: `1/${x} : 1/${y} : 1/${z} = ${m / x} : ${m / y} : ${m / z}` },
              { label: '1ª pessoa', value: brl(1200 / x / s), tone: 'sky', big: true },
              { label: '2ª pessoa', value: brl(1200 / y / s), tone: 'brass' },
              { label: '3ª pessoa', value: brl(1200 / z / s), tone: 'verdigris' },
            ];
          },
          viz: ({ x, y, z }) => ({
            kind: 'parts',
            segments: [
              { label: '1ª', value: 1 / x, tone: 'sky' },
              { label: '2ª', value: 1 / y, tone: 'brass' },
              { label: '3ª', value: 1 / z, tone: 'verdigris' },
            ],
            summary: `Prêmio inversamente proporcional a ${x}, ${y} e ${z} faltas`,
          }),
          goal: {
            task: 'Escolha as faltas para que a 1ª pessoa fique com exatamente metade do prêmio.',
            done: ({ x, y, z }) => Math.abs(1200 / x / (1 / x + 1 / y + 1 / z) - 600) < 1e-6,
            success: 'Isso: a 1ª pessoa fica com metade quando 1/x = 1/y + 1/z (por exemplo, 2, 4 e 4 faltas, ou 3, 6 e 6).',
          },
          insight: 'Menos faltas, peso maior: o peso de cada pessoa é o INVERSO do seu número.',
        }),
        example('Prêmio pela pontualidade', 'R$ 2.600,00 serão divididos entre três funcionários em partes inversamente proporcionais aos atrasos no mês: 2, 3 e 4 atrasos. Quanto recebe cada um?', [
          askStep('Os pesos são 1/2, 1/3 e 1/4.', 'Como transformá-los em números inteiros?', [
            ok('Multiplicar pelo MMC (12): 6 : 4 : 3'),
            no('Inverter a ordem dos números: 4 : 3 : 2', 'Inverter a ORDEM não é inverter os números: 4 : 3 : 2 daria ao primeiro 4/9 do total, mas o certo é 6/13. Use os inversos.'),
          ], '1/2 : 1/3 : 1/4 = 6 : 4 : 3'),
          step('6 + 4 + 3 = 13 partes de R$ 200,00:', '6 × 200 = 1.200; 4 × 200 = 800; 3 × 200 = 600'),
        ], 'Recebem R$ 1.200,00, R$ 800,00 e R$ 600,00.'),
        warn('Inverter a ordem só funciona com dois números', 'Inversamente proporcional a 2 e 3 é o mesmo que 3 : 2. Com três ou mais números, trocar a ordem dá resultado errado: use os inversos e o MMC.'),
        key('Direta e inversa ao mesmo tempo', 'Se a parte é diretamente proporcional a A e inversamente a B, o peso de cada um é A ÷ B. Ex.: tempo de casa 4, 6 e 9 anos com 2, 3 e 3 faltas → pesos 4/2 : 6/3 : 9/3 = 2 : 2 : 3.'),
        check(numeric({
          prompt: [p('Dois irmãos dividem R$ 900,00 em partes inversamente proporcionais às faltas na escola: um faltou 1 vez, o outro faltou 2 vezes.')],
          ask: 'Quanto recebe o irmão que faltou 1 vez?',
          prefix: 'R$',
          answer: 600,
          wrong: [
            { value: 300, feedback: 'R$ 300,00 é a parte de quem faltou 2 vezes. Quem faltou menos recebe mais.' },
            { value: 450, feedback: 'R$ 450,00 é a divisão em partes iguais. Os pesos são 1/1 : 1/2 = 2 : 1.' },
          ],
          solution: ['$1/1 : 1/2 = 2 : 1; 900 ÷ 3 = 300', '$Quem faltou 1 vez: 2 × 300 = R$ 600,00'],
        })),
      ],
      practice: [
        gen(inverseSplitGen),
        gen(directInverseGen),
        classify({
          ask: 'As grandezas são direta ou inversamente proporcionais?',
          bins: ['Diretamente', 'Inversamente'],
          items: [
            { text: 'Número de operários e tempo para terminar uma obra', bin: 1 },
            { text: 'Velocidade e tempo de viagem, para a mesma distância', bin: 1 },
            { text: 'Quantidade de pães e preço pago', bin: 0 },
            { text: 'Número de torneiras iguais abertas e tempo para encher um tanque', bin: 1 },
            { text: 'Distância percorrida e combustível gasto', bin: 0 },
          ],
          hints: ['Pergunte: se uma dobra, a outra dobra (direta) ou cai pela metade (inversa)?', 'Mais operários terminam a obra em MENOS tempo.'],
          solution: ['Diretas: as duas crescem juntas na mesma razão. Inversas: o produto das duas é constante.'],
        }),
      ],
      challenge: [
        gen(inverseSplitGen),
        gen(directInverseGen),
        numeric({
          prompt: [p('Uma herança de R$ 30.000,00 será dividida entre dois irmãos, de 10 e 15 anos, em partes inversamente proporcionais às idades.')],
          ask: 'Quanto receberá o irmão de 15 anos?',
          prefix: 'R$',
          answer: 12000,
          wrong: [
            { value: 18000, feedback: 'R$ 18.000,00 é a parte do irmão mais NOVO — e também o que o mais velho receberia numa divisão direta. Na inversa, o mais velho recebe menos.' },
            { value: 15000, feedback: 'R$ 15.000,00 é a divisão em partes iguais. Os pesos são 1/10 : 1/15 = 3 : 2.' },
          ],
          solution: ['$1/10 : 1/15 = 3 : 2 (× 30)', '$30.000 ÷ 5 = 6.000; irmão de 15 anos: 2 × 6.000 = R$ 12.000,00'],
        }),
      ],
      recap: [
        'Inversamente proporcional a a, b, c = diretamente proporcional a 1/a, 1/b, 1/c.',
        'Transforme os inversos em inteiros multiplicando pelo MMC.',
        'Com dois números, inverter a ordem funciona; com três ou mais, use os inversos.',
        'Direta em A e inversa em B: o peso é A ÷ B.',
      ],
    })),

    stage('maestria', 'maestria', 'Maestria: proporções nos problemas difíceis', 'Resolver problemas inéditos de proporção com várias etapas: misturas que perdem e ganham componentes, partilhas com condições e razões que mudam.', () => ({
      learn: [
        strategy('Escolha a âncora', '1) O que NÃO muda? (o componente que não foi acrescentado, o total, um dos grupos). 2) Escreva as quantidades em função de k ou da massa total. 3) Traduza a condição final numa equação e confira a resposta no enunciado.'),
        example('Retirar e repor', 'Um tanque tem 60 L de álcool e água na razão 3 : 1. Retiram-se 20 L da mistura (homogênea) e repõem-se 20 L de água. Qual é a nova razão álcool : água?', [
          step('Antes: 45 L de álcool e 15 L de água.'),
          askStep('Os 20 L retirados são da mistura.', 'Quanto álcool sai nessa retirada?', [
            ok('3/4 de 20 = 15 L, pois a mistura é homogênea'),
            no('20 L, só de álcool', 'A mistura é homogênea: os 20 L retirados têm álcool e água na mesma razão 3 : 1 (15 L e 5 L).'),
          ], 'Saem 15 L de álcool e 5 L de água'),
          step('Ficam 30 L de álcool e 10 L de água; com mais 20 L de água:', '30 : 30 = 1 : 1'),
        ], 'A nova razão é 1 : 1.'),
        reveal('Por que a porção retirada de uma mistura homogênea tem a mesma razão do todo?', 'Porque cada porção tem a mesma composição: retirar 1/3 da mistura retira 1/3 de cada componente, e a razão entre o que sobra não muda.'),
        check(numeric({
          prompt: [p('Uma jarra tem 2 L de suco e água na razão 1 : 3. Bebem-se 400 mL da mistura, e a jarra é completada com 400 mL de suco puro.')],
          ask: 'Quantos mililitros de suco há agora na jarra?',
          unit: 'mL',
          answer: 800,
          wrong: [
            { value: 900, feedback: '900 = 500 + 400 esquece que os 400 mL bebidos também levaram suco (1/4 deles = 100 mL).' },
            { value: 500, feedback: '500 mL era o suco ANTES. Saíram 100 mL e entraram 400 mL.' },
            { value: 400, feedback: '400 mL é o suco depois de beber, antes de completar. Some os 400 mL de suco puro.' },
          ],
          solution: ['$Antes: 500 mL de suco e 1.500 mL de água', '$Saem 400 mL: 100 de suco e 300 de água → 400 mL de suco', '$Entram 400 mL de suco: 800 mL'],
        })),
      ],
      practice: [
        numeric({
          prompt: [p('Numa orquestra, a razão entre músicos de cordas e de sopro é 3 : 2. Entram 6 músicos de sopro (e nenhum de cordas), e a razão passa a 6 : 5.')],
          ask: 'Quantos músicos de cordas há na orquestra?',
          unit: 'músicos',
          answer: 36,
          wrong: [
            { value: 24, feedback: '24 é o número de músicos de sopro ANTES da entrada.' },
            { value: 30, feedback: '30 é o número de músicos de sopro DEPOIS da entrada.' },
            { value: 66, feedback: '66 é o total da orquestra depois da entrada. A pergunta é só sobre as cordas.' },
          ],
          hints: ['Cordas = 3k (não muda); sopro = 2k + 6.', '[[3k|2k + 6]] = [[6|5]] → produto cruzado.'],
          solution: ['$5 × 3k = 6 × (2k + 6) → 15k = 12k + 36 → k = 12', '$Cordas: 3 × 12 = 36'],
        }),
        numeric({
          prompt: [p('Um recipiente tem 80 L de uma mistura de álcool e gasolina na razão 1 : 3. Retiram-se 16 L da mistura e acrescentam-se 16 L de álcool.')],
          ask: 'Quantos litros de álcool há no final?',
          unit: 'L',
          answer: 32,
          wrong: [
            { value: 36, feedback: '36 = 20 + 16 esquece que os 16 L retirados também levaram álcool (1/4 deles = 4 L).' },
            { value: 16, feedback: '16 L é o álcool depois da retirada. Some os 16 L acrescentados.' },
            { value: 20, feedback: '20 L era o álcool no início.' },
          ],
          hints: ['Início: 20 L de álcool e 60 L de gasolina.', 'Os 16 L retirados têm a mesma razão 1 : 3: 4 L de álcool.'],
          solution: ['$Início: 20 L de álcool; saem 4 L → 16 L', '$Entram 16 L de álcool: 32 L'],
        }),
        gen(addOneGen),
      ],
      challenge: [
        numeric({
          prompt: [p('Uma mistura de castanhas e amêndoas tem razão 3 : 2, em massa. Retiram-se 100 g da mistura (homogênea) e acrescentam-se 100 g de amêndoas. A mistura passa a ter massas iguais de castanhas e amêndoas.')],
          ask: 'Qual era a massa da mistura antes da retirada?',
          unit: 'g',
          answer: 600,
          wrong: [
            { value: 500, feedback: 'Isso ignora a retirada: os 100 g retirados levam 60 g de castanhas e 40 g de amêndoas.' },
            { value: 300, feedback: 'Os 100 g retirados não são só de amêndoas (nem só de castanhas): a mistura homogênea perde 60 g de castanhas e 40 g de amêndoas.' },
          ],
          solution: ['Seja M a massa inicial: castanhas 3M/5 e amêndoas 2M/5.', '$Depois: 3M/5 − 60 = 2M/5 − 40 + 100', '$M/5 = 120 → M = 600 g'],
        }),
        numeric({
          prompt: [p('Dois sócios dividiram um lucro na razão 5 : 3. Se a divisão tivesse sido em partes iguais, o segundo sócio teria recebido R$ 1.200,00 a mais.')],
          ask: 'Qual foi o lucro?',
          prefix: 'R$',
          answer: 9600,
          wrong: [
            { value: 4800, feedback: 'R$ 4.800,00 é o que cada um receberia em partes iguais (4 partes).' },
            { value: 3600, feedback: 'R$ 3.600,00 é a parte do segundo sócio na divisão 5 : 3.' },
            { value: 2400, feedback: 'Isso trata os R$ 1.200,00 como 2 partes. Em partes iguais cada um teria 4 das 8 partes; o segundo tinha 3: a diferença é 1 parte.' },
          ],
          solution: ['Lucro = 8k; em partes iguais, cada um teria 4k.', '$4k − 3k = k = 1.200 → lucro = 8 × 1.200 = R$ 9.600,00'],
        }),
        gen(inverseSplitGen),
        gen(chainGen),
      ],
      recap: [
        'Ache o que não muda e escreva o resto em função de k (ou da massa total).',
        'Mistura homogênea: a porção retirada tem a mesma razão do todo.',
        'Retirar e repor: subtraia de cada componente, depois some o que entrou.',
        'Confira a resposta voltando ao enunciado.',
      ],
    })),
  ],
});
