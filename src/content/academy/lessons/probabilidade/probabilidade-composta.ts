/**
 * Aula: Probabilidade composta — eventos independentes (multiplicar), sorteios sem reposição
 * (as chances mudam), "exatamente k sucessos" (sequências × probabilidade de cada uma),
 * probabilidade condicional em tabelas, árvores e testes diagnósticos, e maestria.
 */
import {
  askStep,
  check,
  choice,
  draftChoice,
  draftNumeric,
  example,
  gen,
  key,
  lab,
  lesson,
  math,
  no,
  numeric,
  numericOptions,
  ok,
  p,
  reveal,
  sim,
  stage,
  step,
  strategy,
  table,
  text,
  warn,
} from '../../kit/build';
import { frac, num, round } from '../../kit/format';
import type { Rand } from '../../types';

const fr = (a: number, b: number) => (a === 0 ? '0' : a === b ? '1' : frac(a, b));
const opt = (a: number, b: number) => ({ value: a / b, text: fr(a, b) });
const probOptions = (correct: { value: number; text: string }, wrongs: { value: number; text: string; feedback: string }[]) =>
  numericOptions(correct, wrongs.filter((w) => w.value > 0 && w.value < 1));
const fact = (n: number): number => (n <= 1 ? 1 : n * fact(n - 1));
const C = (n: number, k: number) => fact(n) / (fact(k) * fact(n - k));
const SUP = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
const pow = (b: string, n: number) => (n === 1 ? b : `${b}${String(n).split('').map((d) => SUP[Number(d)]).join('')}`);

// ———————————————————————————————————————————————— geradores: independentes

const SOURCES = [
  { name: 'sair 6 num dado', p: [1, 6] },
  { name: 'sair cara numa moeda', p: [1, 2] },
  { name: 'sair um número par num dado', p: [1, 2] },
  { name: 'sair um múltiplo de 3 num dado', p: [1, 3] },
  { name: 'a roleta de 5 setores iguais parar no azul (1 setor)', p: [1, 5] },
  { name: 'a roleta de 4 setores iguais parar no vermelho (1 setor)', p: [1, 4] },
  { name: 'sortear uma vogal entre as letras A, B, C, D, E', p: [2, 5] },
];

/** Independentes: P(A e B) = P(A) × P(B). */
function indepGen(r: Rand) {
  for (;;) {
    const [A, B] = r.shuffle(SOURCES).slice(0, 2);
    if (A.p[0] * B.p[1] === B.p[0] * A.p[1]) continue; // chances iguais deixariam distratores repetidos
    const num1 = A.p[0] * B.p[0];
    const den = A.p[1] * B.p[1];
    return draftChoice({
      prompt: [p(`Dois experimentos independentes são feitos: no primeiro, interessa ${A.name}; no segundo, ${B.name}.`)],
      ask: 'Qual é a probabilidade de as duas coisas acontecerem?',
      options: probOptions(opt(num1, den), [
        { value: A.p[0] / A.p[1] + B.p[0] / B.p[1], text: fr(A.p[0] * B.p[1] + B.p[0] * A.p[1], den), feedback: 'Isso soma as probabilidades. Para as duas coisas acontecerem juntas ("e"), multiplique.' },
        { ...opt(A.p[0], A.p[1]), feedback: 'Essa é só a chance do primeiro evento. O segundo também precisa acontecer.' },
        { ...opt(B.p[0], B.p[1]), feedback: 'Essa é só a chance do segundo evento. O primeiro também precisa acontecer.' },
        { ...opt(A.p[0] * B.p[1] + B.p[0] * A.p[1], 2 * den), feedback: 'Isso faz a média das duas chances. Eventos independentes que precisam acontecer juntos se multiplicam.' },
      ]),
      verify: () => num1 / den,
      hints: ['Um resultado não interfere no outro: são independentes.', `Multiplique: ${fr(A.p[0], A.p[1])} × ${fr(B.p[0], B.p[1])}.`],
      solution: [`$P = ${fr(A.p[0], A.p[1])} × ${fr(B.p[0], B.p[1])} = ${fr(num1, den)}`],
    });
  }
}

const REPEATS = [
  { intro: (q: number) => `Uma jogadora de basquete converte ${q}% dos lances livres, e cada arremesso não depende dos outros.`, ask: (n: number) => `Qual é a probabilidade, em porcentagem, de ela converter ${n} lances livres seguidos?` },
  { intro: (q: number) => `Num cruzamento, o semáforo está verde ${q}% do tempo quando um ônibus chega, e cada chegada é independente das outras.`, ask: (n: number) => `Qual é a probabilidade, em porcentagem, de o ônibus encontrar o sinal verde em ${n} viagens seguidas?` },
  { intro: (q: number) => `Uma semente de uma variedade germina com probabilidade de ${q}%, e cada semente germina ou não independentemente das outras.`, ask: (n: number) => `Plantando ${n} sementes, qual é a probabilidade, em porcentagem, de todas germinarem?` },
];

/** Repetições independentes: pⁿ. */
function repeatGen(r: Rand) {
  for (;;) {
    const g = r.pick(REPEATS);
    const q = r.pick([40, 50, 60, 70, 80, 90]);
    const n = r.int(2, 3);
    if (q === 70 && n === 2) continue; // exercício da teoria
    const pq = q / 100;
    const ans = round(100 * pq ** n, 2);
    return draftNumeric({
      prompt: [p(g.intro(q))],
      ask: g.ask(n),
      unit: '%',
      answer: ans,
      tolerance: 0.01,
      wrong: [
        ...(n * q <= 100 ? [{ value: n * q, feedback: `Isso soma as chances. Para tudo dar certo, as ${n} etapas precisam acontecer juntas: multiplique.` }] : []),
        { value: q, feedback: `Essa é a chance de uma vez só. Com ${n} vezes seguidas, multiplique ${num(pq)} por ele mesmo ${n} vezes.` },
        { value: round(q / n, 2), feedback: `Isso divide a chance por ${n}. A conta certa é ${num(pq)}${n === 2 ? '²' : '³'}.` },
      ],
      hints: ['As tentativas são independentes: as chances se multiplicam.', `${num(pq)}${n === 2 ? '²' : '³'} = ${num(pq ** n, 4)}.`],
      solution: [`$${Array(n).fill(num(pq)).join(' × ')} = ${num(pq ** n, 4)} = ${num(ans)}%`],
    });
  }
}

/** Com reposição: a urna volta ao estado inicial a cada sorteio. */
function withReplacementGen(r: Rand) {
  for (;;) {
    const a = r.int(2, 6);
    const b = r.int(2, 6);
    if (a === b) continue;
    const t = a + b;
    return draftChoice({
      prompt: [p(`Uma caixa tem ${a} fichas verdes e ${b} fichas pretas. Sorteia-se uma ficha, anota-se a cor, ela é devolvida à caixa, e sorteia-se de novo.`)],
      ask: 'Qual é a probabilidade de saírem duas fichas verdes?',
      options: probOptions(opt(a * a, t * t), [
        { ...opt(a * (a - 1), t * (t - 1)), feedback: 'Isso seria sem reposição. Aqui a ficha volta para a caixa: o segundo sorteio tem as mesmas chances do primeiro.' },
        { ...opt(a, t), feedback: 'Essa é a chance de um sorteio só. Os dois precisam dar verde: multiplique.' },
        { ...opt(2 * a, 2 * t), feedback: 'Isso soma as fichas dos dois sorteios. Para os dois darem verde, multiplique as chances.' },
        { ...opt(a, t * t), feedback: `Isso multiplica só os denominadores. São ${fr(a, t)} × ${fr(a, t)}.` },
      ]),
      verify: () => (a * a) / (t * t),
      hints: [`Cada sorteio: ${a} verdes em ${t} fichas.`, 'A ficha volta: os sorteios são independentes. Multiplique.'],
      solution: [`$${fr(a, t)} × ${fr(a, t)} = ${fr(a * a, t * t)}`],
    });
  }
}

// ———————————————————————————————————————————————— geradores: sem reposição

const BOXES = [
  { what: 'bombons', a: 'de chocolate branco', b: 'de chocolate amargo', intro: 'Uma caixa tem bombons iguais por fora' },
  { what: 'meias', a: 'pretas', b: 'brancas', intro: 'Uma gaveta tem meias soltas' },
  { what: 'lâmpadas', a: 'boas', b: 'queimadas', intro: 'Uma caixa tem lâmpadas misturadas' },
];

/** Sem reposição: o segundo sorteio depende do primeiro. */
function noReplaceGen(r: Rand) {
  for (;;) {
    const g = r.pick(BOXES);
    const a = r.int(2, 7);
    const b = r.int(2, 6);
    if (a === b) continue;
    if (a === 3 && b === 2) continue; // questão do banco
    if (a === 4 && b === 2 && g.what === 'meias') continue; // exemplo da teoria
    const t = a + b;
    const kind = r.pick(['aa', 'bb', 'ab'] as const);
    const [n1, d1] = kind === 'aa' ? [a * (a - 1), t * (t - 1)] : kind === 'bb' ? [b * (b - 1), t * (t - 1)] : [2 * a * b, t * (t - 1)];
    const ask = kind === 'aa' ? `os dois serem ${g.a}` : kind === 'bb' ? `os dois serem ${g.b}` : `sair um de cada tipo`;
    const x = kind === 'bb' ? b : a;
    return draftChoice({
      prompt: [p(`${g.intro}: ${a} ${g.a} e ${b} ${g.b}. Retiram-se dois, ao acaso, um depois do outro, sem devolver o primeiro.`)],
      ask: `Qual é a probabilidade de ${ask}?`,
      options: probOptions(opt(n1, d1), [
        ...(kind !== 'ab'
          ? [
              { ...opt(x * x, t * t), feedback: 'Isso seria com reposição. Sem devolver o primeiro, sobra um a menos daquele tipo e um a menos no total.' },
              { ...opt(x, t), feedback: 'Essa é a chance da primeira retirada só. A segunda também precisa dar certo.' },
              { ...opt(x * (x - 1), t * t), feedback: 'Isso diminui o numerador, mas esquece de diminuir o total na segunda retirada.' },
            ]
          : [
              { ...opt(a * b, t * (t - 1)), feedback: `Isso conta só uma ordem (${g.a} e depois ${g.b}). A ordem contrária também dá "um de cada": some as duas.` },
              { ...opt(2 * a * b, t * t), feedback: 'Isso usa o mesmo total nas duas retiradas, como se houvesse reposição.' },
              { ...opt(1, 2), feedback: 'Os resultados "dois iguais" e "um de cada" não têm a mesma chance: faça as contas.' },
            ]),
      ]),
      verify: () => n1 / d1,
      hints: [
        kind === 'ab' ? `Duas ordens: (${g.a}, ${g.b}) e (${g.b}, ${g.a}).` : `1ª retirada: ${x} em ${t}. Se der certo, sobram ${x - 1} em ${t - 1}.`,
        kind === 'ab' ? `Cada ordem: ${fr(a, t)} × ${fr(b, t - 1)}.` : `Multiplique: ${fr(x, t)} × ${fr(x - 1, t - 1)}.`,
      ],
      solution:
        kind === 'ab'
          ? [`$${fr(a, t)} × ${fr(b, t - 1)} + ${fr(b, t)} × ${fr(a, t - 1)} = ${fr(n1, d1)}`]
          : [`$${fr(x, t)} × ${fr(x - 1, t - 1)} = ${fr(n1, d1)}`],
    });
  }
}

/** Três retiradas sem reposição, todas do mesmo tipo. */
function threeDrawsGen(r: Rand) {
  for (;;) {
    const a = r.int(3, 8);
    const b = r.int(2, 6);
    const t = a + b;
    const n1 = a * (a - 1) * (a - 2);
    const d1 = t * (t - 1) * (t - 2);
    const ctx = r.pick([
      { intro: `Numa turma com ${a} meninas e ${b} meninos, três estudantes serão sorteados, um de cada vez, para uma apresentação.`, ask: 'Qual é a probabilidade de serem sorteadas três meninas?' },
      { intro: `Um lote tem ${a} peças perfeitas e ${b} com defeito. Um fiscal retira três peças, uma de cada vez, sem devolver.`, ask: 'Qual é a probabilidade de as três peças serem perfeitas?' },
    ]);
    return draftChoice({
      prompt: [p(ctx.intro)],
      ask: ctx.ask,
      options: probOptions(opt(n1, d1), [
        { ...opt(a ** 3, t ** 3), feedback: 'Isso seria com reposição. Sem devolver, cada retirada tem um a menos daquele tipo e um a menos no total.' },
        { ...opt(a * (a - 1), t * (t - 1)), feedback: 'Isso considera só duas retiradas. São três: multiplique mais um fator.' },
        { ...opt(3 * a, 3 * t), feedback: 'Isso soma as três retiradas. Para todas darem certo, multiplique as chances.' },
      ]),
      verify: () => n1 / d1,
      hints: [`1ª: ${a} em ${t}; 2ª: ${a - 1} em ${t - 1}; 3ª: ${a - 2} em ${t - 2}.`, 'Multiplique as três frações e simplifique.'],
      solution: [`$${fr(a, t)} × ${fr(a - 1, t - 1)} × ${fr(a - 2, t - 2)} = ${fr(n1, d1)}`],
    });
  }
}

/** Nenhum defeito em duas retiradas sem reposição, em porcentagem. */
function noDefectGen(r: Rand) {
  for (;;) {
    const t = r.pick([10, 12, 15, 20, 25, 30, 40]);
    const d = r.int(2, Math.floor(t / 4));
    const g = t - d;
    const ans = round((100 * g * (g - 1)) / (t * (t - 1)), 2);
    return draftNumeric({
      prompt: [p(`Um lote tem ${t} celulares, dos quais ${d} têm defeito. Um cliente compra 2 celulares escolhidos ao acaso do lote.`)],
      ask: 'Qual é a probabilidade, em porcentagem, de nenhum dos dois ter defeito?',
      unit: '%',
      answer: ans,
      tolerance: 0.01,
      wrong: [
        { value: round((100 * g * g) / (t * t), 2), feedback: 'Isso seria com reposição. O primeiro celular escolhido não volta ao lote: na segunda escolha, há um a menos.' },
        { value: round((100 * g) / t, 2), feedback: 'Essa é a chance de um celular só não ter defeito. Os dois precisam ser bons.' },
        { value: round(100 - (100 * d * (d - 1)) / (t * (t - 1)), 2), feedback: 'Isso tira só o caso "os dois com defeito". "Nenhum com defeito" exclui também o caso de um só com defeito.' },
      ],
      hints: [`1º celular bom: ${g} em ${t}. Depois, ${g - 1} bons em ${t - 1}.`, 'Multiplique e passe para porcentagem.'],
      solution: [`$${g}/${t} × ${g - 1}/${t - 1} = ${g * (g - 1)}/${t * (t - 1)} ≈ ${num(ans)}%`],
    });
  }
}

// ———————————————————————————————————————————————— geradores: exatamente k

/** Exatamente k caras em n lançamentos: C(n, k) ÷ 2ⁿ. */
function exactlyCoinsGen(r: Rand) {
  const n = r.int(4, 6);
  const k = r.int(1, n - 1);
  if (n === 4 && k === 3) return exactlyCoinsGen(r); // exemplo da teoria
  const total = 2 ** n;
  const ways = C(n, k);
  return draftChoice({
    prompt: [p(`Uma moeda honesta é lançada ${n} vezes.`)],
    ask: `Qual é a probabilidade de ${k === 1 ? 'sair exatamente 1 cara' : `saírem exatamente ${k} caras`}?`,
    options: probOptions(opt(ways, total), [
      { ...opt(1, total), feedback: `Essa é a chance de uma sequência específica. Há ${ways} sequências com exatamente ${k} ${k === 1 ? 'cara' : 'caras'}.` },
      { ...opt(1, n + 1), feedback: `Isso trata os ${n + 1} "placares" (de 0 a ${n} caras) como igualmente prováveis. Eles não são.` },
      { ...opt(k, total), feedback: `Isso usa ${k} como número de sequências. As posições das ${k} caras podem ser escolhidas de C(${n}, ${k}) = ${ways} formas.` },
      { ...opt(k, n), feedback: `${k}/${n} é a fração de caras na sequência, e não a probabilidade do evento.` },
    ]),
    verify: () => ways / total,
    hints: [`Cada sequência de ${n} lançamentos tem chance 1/${total}.`, `Sequências com exatamente ${k} ${k === 1 ? 'cara' : 'caras'}: C(${n}, ${k}) = ${ways}.`],
    solution: [`$C(${n}, ${k}) = ${ways} sequências`, `$P = ${ways}/${total} = ${fr(ways, total)}`],
  });
}

/** Exatamente k sucessos com chance p: C(n, k) · pᵏ · (1 − p)ⁿ⁻ᵏ. */
function exactlyBiasedGen(r: Rand) {
  for (;;) {
    const q = r.pick([20, 30, 40, 60, 70, 80, 90]);
    const n = r.int(2, 3);
    const k = r.int(1, n - 1);
    if (q === 80 && n === 2) continue; // exercício da teoria
    const pq = q / 100;
    const one = pq ** k * (1 - pq) ** (n - k);
    const ans = round(100 * C(n, k) * one, 2);
    const ctx = r.pick([
      { intro: `Um goleiro defende ${q}% dos pênaltis, e cada cobrança é independente das outras.`, ask: `Em ${n} pênaltis, qual é a probabilidade, em porcentagem, de ele defender exatamente ${k}?` },
      { intro: `Uma vacina produz anticorpos em ${q}% dos vacinados.`, ask: `Vacinando ${n} pessoas, qual é a probabilidade, em porcentagem, de exatamente ${k} ${k === 1 ? 'produzir' : 'produzirem'} anticorpos?` },
    ]);
    return draftNumeric({
      prompt: [p(ctx.intro)],
      ask: ctx.ask,
      unit: '%',
      answer: ans,
      tolerance: 0.01,
      wrong: [
        { value: round(100 * one, 2), feedback: `Essa é a chance de uma ordem só. Há C(${n}, ${k}) = ${C(n, k)} ordens possíveis para ${k === 1 ? 'o sucesso' : `os ${k} sucessos`}: multiplique.` },
        { value: round(100 * pq ** k, 2), feedback: `Isso esquece ${n - k === 1 ? 'a tentativa que falha: ela também tem' : `as ${n - k} tentativas que falham: elas também têm`} sua chance (${num(1 - pq)}).` },
        { value: round(100 * pq ** n, 2), feedback: `Essa é a chance de todas as ${n} darem certo. A pergunta é exatamente ${k}.` },
      ],
      hints: [`Uma ordem específica: ${pow(num(pq), k)} × ${pow(num(1 - pq), n - k)}.`, `Há C(${n}, ${k}) = ${C(n, k)} ordens.`],
      solution: [`$uma ordem: ${num(one, 4)}`, `$${C(n, k)} × ${num(one, 4)} = ${num(C(n, k) * one, 4)} = ${num(ans)}%`],
    });
  }
}

/** Pelo menos um sucesso: 1 − (chance de nenhum). */
function atLeastOneGen(r: Rand) {
  const q = r.pick([10, 20, 25, 30, 40, 50]);
  const n = r.int(2, 4);
  const pq = q / 100;
  const none = (1 - pq) ** n;
  const ans = round(100 * (1 - none), 2);
  const ctx = r.pick([
    { intro: `Cada raspadinha de uma promoção dá prêmio com probabilidade de ${q}%, independentemente das outras.`, ask: `Comprando ${n} raspadinhas, qual é a probabilidade, em porcentagem, de ganhar pelo menos um prêmio?` },
    { intro: `Num dia de chuva, cada um dos ônibus de uma linha atrasa com probabilidade de ${q}%, um independente do outro.`, ask: `Pegando ${n} ônibus da linha, qual é a probabilidade, em porcentagem, de pelo menos um atrasar?` },
  ]);
  return draftNumeric({
    prompt: [p(ctx.intro)],
    ask: ctx.ask,
    unit: '%',
    answer: ans,
    tolerance: 0.01,
    wrong: [
      ...(n * q < 100 ? [{ value: n * q, feedback: 'Isso soma as chances, contando várias vezes os casos com mais de um sucesso. Use o complemento: 1 − (nenhum).' }] : []),
      { value: round(100 * none, 2), feedback: 'Essa é a chance de nenhum. A pergunta é o contrário: 100% menos ela.' },
      { value: round(100 * pq ** n, 2), feedback: `Essa é a chance de todos os ${n}. "Pelo menos um" vale para um ou mais.` },
    ],
    hints: [`Chance de nenhum: ${num(1 - pq)}${n === 2 ? '²' : n === 3 ? '³' : '⁴'} = ${num(none, 4)}.`, 'Pelo menos um = 1 − nenhum.'],
    solution: [`$nenhum: ${num(1 - pq)}${n === 2 ? '²' : n === 3 ? '³' : '⁴'} = ${num(none, 4)}`, `$1 − ${num(none, 4)} = ${num(1 - none, 4)} = ${num(ans)}%`],
  });
}

// ———————————————————————————————————————————————— geradores: condicional

const TABLES2 = [
  { who: 'cliente', rows: ['Loja A', 'Loja B'], cols: ['Cartão', 'Pix'], title: 'Clientes por loja e forma de pagamento', rowWho: (x: string) => `da ${x}`, colWho: (x: string) => `que pagou com ${x.toLowerCase()}` },
  { who: 'estudante', rows: ['Manhã', 'Tarde'], cols: ['Usa óculos', 'Não usa'], title: 'Estudantes por turno e uso de óculos', rowWho: (x: string) => `do turno da ${x.toLowerCase()}`, colWho: (x: string) => (x === 'Usa óculos' ? 'que usa óculos' : 'que não usa óculos') },
];

/** P(A dado B): restrinja o universo à linha ou coluna da condição. */
function condTableGen(r: Rand) {
  for (;;) {
    const g = r.pick(TABLES2);
    const cells = [[r.int(2, 9) * 10, r.int(2, 9) * 10], [r.int(2, 9) * 10, r.int(2, 9) * 10]];
    const rowT = cells.map((x) => x[0] + x[1]);
    const colT = [cells[0][0] + cells[1][0], cells[0][1] + cells[1][1]];
    const N = rowT[0] + rowT[1];
    const i = r.int(0, 1);
    const j = r.int(0, 1);
    const byCol = r.next() < 0.5;
    const base = byCol ? colT[j] : rowT[i];
    if (cells[0].join() === '60,40' && cells[1].join() === '30,70') continue; // exercício da teoria
    if (rowT[i] === colT[j]) continue;
    return draftChoice({
      prompt: [table(['', ...g.cols, 'Total'], [...g.rows.map((rw, a) => [rw, String(cells[a][0]), String(cells[a][1]), String(rowT[a])]), ['Total', String(colT[0]), String(colT[1]), String(N)]], g.title)],
      ask: byCol
        ? `Sorteia-se um ${g.who} ${g.colWho(g.cols[j])}. Qual é a probabilidade de ele ser ${g.rowWho(g.rows[i])}?`
        : `Sorteia-se um ${g.who} ${g.rowWho(g.rows[i])}. Qual é a probabilidade de ele ser alguém ${g.colWho(g.cols[j])}?`,
      options: probOptions(opt(cells[i][j], base), [
        { ...opt(cells[i][j], N), feedback: `Isso divide pelo total geral (${N}). A condição já restringe o sorteio: o todo é ${base}.` },
        { ...opt(cells[i][j], byCol ? rowT[i] : colT[j]), feedback: `Isso divide pelo total ${byCol ? 'da linha' : 'da coluna'}. O sorteio é feito dentro do grupo da condição, com ${base} pessoas.` },
        { ...opt(base, N), feedback: 'Essa é a chance de pertencer ao grupo da condição, e não a pedida.' },
      ]),
      verify: () => cells[i][j] / base,
      hints: [`O sorteio acontece dentro do grupo citado primeiro: esse é o novo total.`, `Novo total: ${base}. Favoráveis: ${cells[i][j]}.`],
      solution: [`$P = ${cells[i][j]} ÷ ${base} = ${fr(cells[i][j], base)}`],
    });
  }
}

/** Probabilidade total por uma árvore de dois estágios. */
function treeGen(r: Rand) {
  for (;;) {
    const sa = r.pick([30, 40, 60, 70]); // com 50% a média simples coincidiria com a resposta
    const da = r.pick([1, 2, 3, 4]);
    const db = r.pick([2, 3, 5, 6, 8]);
    if (da === db) continue;
    const ans = round((sa * da + (100 - sa) * db) / 100, 2);
    return draftNumeric({
      prompt: [p(`Uma fábrica tem duas máquinas. A máquina A faz ${sa}% das peças, e ${da}% delas saem com defeito; a máquina B faz o restante, e ${db}% das peças dela saem com defeito.`)],
      ask: 'Qual é a probabilidade, em porcentagem, de uma peça qualquer da fábrica ter defeito?',
      unit: '%',
      answer: ans,
      tolerance: 0.01,
      wrong: [
        { value: round((da + db) / 2, 2), feedback: 'Isso faz a média simples das taxas de defeito. As máquinas fazem quantidades diferentes de peças: pese cada taxa pela produção.' },
        { value: da + db, feedback: 'Isso soma as taxas de defeito. Cada taxa vale só para a parte das peças feita por aquela máquina.' },
        { value: round((sa * db + (100 - sa) * da) / 100, 2), feedback: 'Isso troca as taxas: cada máquina tem a sua.' },
      ],
      hints: [`Defeito vindo de A: ${num(sa / 100)} × ${num(da / 100)}.`, `Defeito vindo de B: ${num(1 - sa / 100)} × ${num(db / 100)}. Some os dois caminhos.`],
      solution: [`$${num(sa / 100)} × ${num(da / 100)} + ${num(1 - sa / 100)} × ${num(db / 100)} = ${num(ans / 100, 4)} = ${num(ans)}%`],
    });
  }
}

/** Teste diagnóstico: entre os positivos, quantos estão de fato doentes? */
function testGen(r: Rand) {
  for (;;) {
    const prev = r.pick([2, 4, 5, 8, 10]);
    const sens = r.pick([80, 90, 95]);
    const fp = r.pick([2, 4, 5, 10]);
    if (prev === 1 && sens === 90 && fp === 5) continue; // questão do banco
    if (prev === 10 && sens === 90 && fp === 10) continue; // laboratório da teoria
    const N = 10000;
    const sick = (N * prev) / 100;
    const tp = (sick * sens) / 100;
    const fpos = ((N - sick) * fp) / 100;
    const ans = round((100 * tp) / (tp + fpos), 1);
    return draftNumeric({
      prompt: [p(`Uma doença atinge ${prev}% de uma população. Um teste dá positivo para ${sens}% dos doentes, mas também para ${fp}% das pessoas saudáveis. Uma pessoa escolhida ao acaso testou positivo.`)],
      ask: 'Qual é a probabilidade, em porcentagem e com uma casa decimal, de ela estar de fato doente?',
      unit: '%',
      answer: ans,
      tolerance: 0.1,
      wrong: [
        { value: sens, feedback: `${sens}% é a chance de dar positivo sabendo que a pessoa está doente. A pergunta é o contrário: entre os positivos, quantos estão doentes.` },
        { value: prev, feedback: `${prev}% é a chance antes do teste. O resultado positivo é uma informação nova: aumenta essa chance.` },
        { value: round((100 * tp) / N, 2), feedback: 'Isso divide os doentes que testam positivo por toda a população. O todo agora são só os que testaram positivo.' },
      ],
      hints: [`Em ${num(N)} pessoas: ${num(sick)} doentes, das quais ${num(tp)} testam positivo.`, `Das ${num(N - sick)} saudáveis, ${num(fpos)} também testam positivo.`],
      solution: [`$positivos: ${num(tp)} + ${num(fpos)} = ${num(tp + fpos)}`, `$P(doente | positivo) = ${num(tp)} ÷ ${num(tp + fpos)} ≈ ${num(ans, 1)}%`],
    });
  }
}

// ———————————————————————————————————————————————— aula

export const PROBABILIDADE_COMPOSTA = lesson({
  id: 'probabilidade-composta',
  topic: 'probabilidade',
  subtopics: ['probabilidade-composta'],
  title: 'Probabilidade composta',
  summary: 'Eventos que acontecem juntos ou em sequência: independentes (multiplicar), sorteios sem reposição, exatamente k sucessos, pelo menos um, probabilidade condicional em tabelas e árvores, e a lógica dos testes diagnósticos.',
  requires: ['probabilidade-simples', 'combinacao'],
  stages: [
    stage('independentes', 'descoberta', '"E" com eventos independentes', 'Calcular a probabilidade de dois ou mais eventos independentes acontecerem juntos multiplicando as probabilidades.', () => ({
      learn: [
        text('Dois eventos são **independentes** quando o resultado de um não muda as chances do outro: dois lançamentos de dado, uma moeda e um dado, sorteios **com reposição**. Nesse caso, a chance de acontecerem os dois é o **produto**: P(A e B) = P(A) × P(B). Multiplicar faz sentido porque A acontece numa fração das vezes, e B, numa fração dessas.'),
        math('P(A e B) = P(A) × P(B)'),
        sim({
          title: 'Duas moedas',
          intro: 'Lance duas moedas muitas vezes e acompanhe o evento "duas caras".',
          outcomes: [
            { label: 'CC', p: 0.25 },
            { label: 'CK', p: 0.25 },
            { label: 'KC', p: 0.25 },
            { label: 'KK', p: 0.25 },
          ],
          event: { label: 'duas caras', outcomes: [0] },
          insight: 'Metade das vezes a primeira dá cara; dessas, metade das vezes a segunda também dá: 1/2 × 1/2 = 1/4 = 25%.',
        }),
        lab({
          title: 'Duas urnas',
          intro: 'Cada urna tem 6 bolas. Escolha quantas são vermelhas em cada uma; uma bola é sorteada de cada urna. Cada casa do quadro é um par de bolas.',
          params: [
            { key: 'a', label: 'Vermelhas na urna 1', min: 0, max: 6, step: 1, value: 1, format: (x) => String(x) },
            { key: 'b', label: 'Vermelhas na urna 2', min: 0, max: 6, step: 1, value: 1, format: (x) => String(x) },
          ],
          readouts: ({ a, b }) => [
            { label: 'Conta', value: `${fr(a, 6)} × ${fr(b, 6)}` },
            { label: 'P(duas vermelhas)', value: `${a * b}/36 = ${fr(a * b, 36)}`, big: true, tone: 'iris' },
          ],
          viz: ({ a, b }) => ({
            kind: 'grid',
            rows: 6,
            cols: 6,
            cells: Array.from({ length: 36 }, (_, i) => (Math.floor(i / 6) < a && i % 6 < b ? ('iris' as const) : ('mist' as const))),
            legend: [
              { tone: 'iris', label: 'as duas vermelhas' },
              { tone: 'mist', label: 'outros pares' },
            ],
            summary: `${a} vermelhas na urna 1 e ${b} na urna 2: ${a * b} dos 36 pares têm duas vermelhas`,
          }),
          goal: {
            task: 'Faça a chance de saírem duas vermelhas ser exatamente 1/6.',
            done: ({ a, b }) => a * b === 6,
            success: 'Isso: 6 dos 36 pares, ou seja, 1/6. O retângulo colorido tem "vermelhas da urna 1" linhas e "vermelhas da urna 2" colunas: é a multiplicação.',
          },
          insight: 'A área colorida é sempre linhas × colunas: por isso as chances de eventos independentes se multiplicam.',
        }),
        example('Dado e moeda', 'Lançam-se um dado e uma moeda. Qual é a probabilidade de sair 6 no dado e cara na moeda?', [
          askStep('Os dois resultados não interferem um no outro.', 'Somar ou multiplicar as chances?', [
            ok('Multiplicar: 1/6 × 1/2'),
            no('Somar: 1/6 + 1/2', 'Somar daria 2/3, muito mais que a chance de cada evento sozinho. Para os dois acontecerem juntos, a chance diminui: multiplique.'),
          ]),
          step('Resultado:', '1/6 × 1/2 = 1/12'),
        ], 'A probabilidade é 1/12.'),
        check(numeric({
          prompt: [p('Um time vence 70% dos jogos em casa, e cada jogo é independente dos outros.')],
          ask: 'Qual é a probabilidade, em porcentagem, de o time vencer os próximos dois jogos em casa?',
          unit: '%',
          answer: 49,
          wrong: [
            { value: 140, feedback: 'Isso soma as chances, e uma probabilidade não passa de 100%. Para vencer os dois, multiplique: 0,7 × 0,7.' },
            { value: 70, feedback: 'Essa é a chance de vencer um jogo. Para vencer os dois, multiplique: 0,7 × 0,7.' },
            { value: 35, feedback: 'Isso divide a chance por 2. A conta certa é 0,7 × 0,7 = 0,49.' },
          ],
          solution: ['$0,7 × 0,7 = 0,49 = 49%'],
        })),
      ],
      practice: [gen(indepGen), gen(repeatGen), gen(withReplacementGen)],
      challenge: [gen(repeatGen), gen(withReplacementGen), gen(indepGen)],
      recap: [
        'Independentes: P(A e B) = P(A) × P(B).',
        'n repetições com chance p cada: pⁿ.',
        'Com reposição, as chances não mudam de um sorteio para o outro.',
      ],
    })),

    stage('sem-reposicao', 'fundamentos', 'Sem reposição', 'Calcular probabilidades de retiradas sucessivas sem reposição, atualizando as quantidades a cada retirada.', () => ({
      learn: [
        text('**Sem reposição**, o que sai não volta: a segunda retirada acontece numa caixa com um item a menos. As chances mudam, e cada fração usa as quantidades **depois** das retiradas anteriores: P(A e depois B) = P(A) × P(B, sabendo que A aconteceu). Para "um de cada", some as duas ordens possíveis.'),
        lab({
          title: 'Retirando sem devolver',
          intro: 'Uma caixa tem bolas vermelhas e azuis. Retiram-se duas, uma após a outra, sem devolver. Compare com o caso em que a primeira volta para a caixa.',
          params: [
            { key: 'v', label: 'Bolas vermelhas', min: 2, max: 8, step: 1, value: 2, format: (x) => String(x) },
            { key: 'a', label: 'Bolas azuis', min: 1, max: 8, step: 1, value: 2, format: (x) => String(x) },
          ],
          readouts: ({ v, a }) => {
            const t = v + a;
            return [
              { label: 'Sem reposição', value: `${fr(v, t)} × ${fr(v - 1, t - 1)} = ${fr(v * (v - 1), t * (t - 1))}`, big: true, tone: 'iris' },
              { label: 'Com reposição', value: `${fr(v, t)} × ${fr(v, t)} = ${fr(v * v, t * t)}` },
            ];
          },
          viz: ({ v, a }) => {
            const t = v + a;
            return {
              kind: 'bars',
              bars: [
                { label: 'sem reposição', value: (v * (v - 1)) / (t * (t - 1)), tone: 'iris', text: `${num((100 * v * (v - 1)) / (t * (t - 1)), 1)}%` },
                { label: 'com reposição', value: (v * v) / (t * t), tone: 'mist', text: `${num((100 * v * v) / (t * t), 1)}%` },
              ],
              max: 1,
              summary: `Duas vermelhas: ${num((100 * v * (v - 1)) / (t * (t - 1)), 1)}% sem reposição e ${num((100 * v * v) / (t * t), 1)}% com reposição`,
            };
          },
          goal: {
            task: 'Com 4 bolas vermelhas, quantas azuis deixam a chance de duas vermelhas, sem reposição, em exatamente 1/6?',
            done: ({ v, a }) => v === 4 && a === 5,
            success: 'Isso: 4/9 × 3/8 = 12/72 = 1/6. Repare que sem reposição a chance é sempre menor: a primeira vermelha que sai deixa menos vermelhas para a segunda.',
          },
          insight: 'A segunda fração perde um no numerador (a vermelha que saiu) e um no denominador (a bola a menos na caixa).',
        }),
        example('Duas meias pretas', 'Uma gaveta tem 4 meias pretas e 2 brancas, soltas. Pegam-se duas, sem olhar. Qual é a probabilidade de as duas serem pretas?', [
          step('1ª meia preta:', '4 de 6'),
          askStep('Agora, a segunda.', 'Depois de tirar uma preta, o que sobra na gaveta?', [
            ok('3 pretas em 5 meias'),
            no('4 pretas em 6 meias', 'Sem reposição, a meia tirada não volta: sobram 3 pretas e 5 meias no total.'),
          ]),
          step('Multiplique:', '4/6 × 3/5 = 12/30 = 2/5'),
        ], 'A probabilidade é 2/5.'),
        warn('Com ou sem reposição?', 'Leia com atenção: "devolve", "repõe", "sorteia de novo do mesmo jeito" → com reposição (frações iguais). "Sem devolver", "um após o outro", "retira dois" → sem reposição (as frações mudam).'),
        check(choice({
          prompt: [p('Dois vencedores serão sorteados, um de cada vez, entre 10 inscritos: 6 meninas e 4 meninos. Quem é sorteado não volta para o sorteio.')],
          ask: 'Qual é a probabilidade de serem sorteadas duas meninas?',
          options: [
            ok('1/3'),
            no('9/25', 'Isso seria com reposição (6/10 × 6/10). Quem é sorteado sai: na segunda vez, são 5 meninas em 9 pessoas.'),
            no('3/5', 'Essa é só a chance do primeiro sorteio. O segundo também precisa sair menina.'),
            no('2/15', 'Essa é a chance de dois meninos (4/10 × 3/9).'),
          ],
          solution: ['$6/10 × 5/9 = 30/90 = 1/3'],
        })),
      ],
      practice: [gen(noReplaceGen), gen(threeDrawsGen), gen(noDefectGen)],
      challenge: [gen(noDefectGen), gen(noReplaceGen), gen(threeDrawsGen)],
      recap: [
        'Sem reposição: atualize numerador e denominador a cada retirada.',
        '"Um de cada": some as duas ordens.',
        'Com reposição, as frações se repetem; sem, elas diminuem.',
      ],
    })),

    stage('exatamente', 'aplicacoes', 'Exatamente k e pelo menos um', 'Calcular a probabilidade de exatamente k sucessos em n tentativas independentes e a de pelo menos um sucesso, pelo complemento.', () => ({
      learn: [
        text('Para "**exatamente k sucessos** em n tentativas", conte as **ordens** possíveis dos k sucessos — C(n, k) — e multiplique pela chance de **uma** dessas ordens: pᵏ × (1 − p)ⁿ⁻ᵏ. Para "**pelo menos um**", o atalho é o complemento: 1 − (chance de nenhum sucesso) = 1 − (1 − p)ⁿ.'),
        math('P(exatamente k) = C(n, k) · pᵏ · (1 − p)ⁿ⁻ᵏ', 'P(pelo menos um) = 1 − (1 − p)ⁿ'),
        lab({
          title: 'Quantas caras?',
          intro: 'Uma moeda honesta é lançada n vezes. As barras mostram a chance de cada número de caras; escolha um valor de k.',
          params: [
            { key: 'n', label: 'Lançamentos (n)', min: 4, max: 6, step: 1, value: 4, format: (x) => String(x) },
            { key: 'k', label: 'Caras (k)', min: 0, max: 6, step: 1, value: 0, format: (x) => String(x) },
          ],
          readouts: ({ n, k }) => [
            { label: 'Sequências com k caras', value: k <= n ? `C(${n}, ${k}) = ${C(n, k)}` : '0' },
            { label: 'Probabilidade', value: k <= n ? `${C(n, k)}/${2 ** n} = ${fr(C(n, k), 2 ** n)}` : '0', big: true, tone: 'iris' },
          ],
          viz: ({ n, k }) => ({
            kind: 'bars',
            bars: Array.from({ length: n + 1 }, (_, j) => ({ label: String(j), value: C(n, j) / 2 ** n, tone: j === k ? ('iris' as const) : ('mist' as const), text: `${C(n, j)}/${2 ** n}` })),
            summary: `Com ${n} lançamentos, ${k <= n ? `${C(n, k)} das ${2 ** n} sequências têm ${k} caras` : `não há como sair ${k} caras`}`,
          }),
          goal: {
            task: 'Com 5 lançamentos, ache um número de caras mais provável.',
            done: ({ n, k }) => n === 5 && (k === 2 || k === 3),
            success: 'Isso: 2 ou 3 caras, com 10 das 32 sequências cada (10/32 = 5/16). Os extremos (0 ou 5 caras) só acontecem de um jeito.',
          },
          insight: 'Os números de caras do meio têm mais ordens possíveis — por isso são mais prováveis.',
        }),
        example('Exatamente três caras', 'Uma moeda honesta é lançada 4 vezes. Qual é a probabilidade de saírem exatamente 3 caras?', [
          step('Cada sequência:', '(1/2)⁴ = 1/16'),
          askStep('Agora, quantas sequências servem.', 'Quantas sequências têm exatamente 3 caras?', [
            ok('4: a coroa pode estar em qualquer uma das 4 posições'),
            no('1: CCCK', 'CCCK é uma delas, mas a coroa pode estar em qualquer posição: KCCC, CKCC, CCKC e CCCK.'),
          ]),
          step('Total:', '4 × 1/16 = 4/16 = 1/4'),
        ], 'A probabilidade é 1/4.'),
        check(numeric({
          prompt: [p('Uma jogadora acerta 80% dos pênaltis, e cada cobrança é independente das outras.')],
          ask: 'Em 2 cobranças, qual é a probabilidade, em porcentagem, de ela acertar exatamente uma?',
          unit: '%',
          answer: 32,
          wrong: [
            { value: 16, feedback: 'Essa é a chance de uma ordem só (acerta e depois erra). Há duas ordens: acertar a 1ª ou a 2ª.' },
            { value: 64, feedback: 'Essa é a chance de acertar as duas (0,8 × 0,8).' },
            { value: 80, feedback: 'Essa é a chance de um acerto numa cobrança só. Em duas, ela precisa acertar uma e errar a outra.' },
          ],
          solution: ['$uma ordem: 0,8 × 0,2 = 0,16', '$duas ordens: 2 × 0,16 = 0,32 = 32%'],
        })),
      ],
      practice: [gen(exactlyCoinsGen), gen(exactlyBiasedGen), gen(atLeastOneGen)],
      challenge: [gen(atLeastOneGen), gen(exactlyBiasedGen), gen(exactlyCoinsGen)],
      recap: [
        'Exatamente k: C(n, k) ordens × chance de uma ordem.',
        'Pelo menos um: 1 − nenhum.',
        'Os resultados do meio têm mais ordens e mais chance.',
      ],
    })),

    stage('condicional', 'aprofundamento', 'Probabilidade condicional', 'Calcular probabilidades condicionais restringindo o universo — em tabelas, árvores e testes diagnósticos — e não confundir P(A dado B) com P(B dado A).', () => ({
      learn: [
        text('Na **probabilidade condicional**, já se sabe que algo aconteceu, e o universo encolhe: P(A dado B) = casos de A e B ÷ casos de B. Numa tabela, isso significa dividir pelo total da linha ou coluna da condição. Em testes diagnósticos, P(positivo dado doente) não é P(doente dado positivo): quando a doença é rara, os falsos positivos das muitas pessoas saudáveis podem ser maioria entre os positivos.'),
        lab({
          title: 'Teste diagnóstico',
          intro: 'Imagine 10.000 pessoas. Escolha quantas por cento têm a doença, quantos por cento dos doentes o teste detecta e quantos por cento dos saudáveis ele acusa por engano.',
          params: [
            { key: 'prev', label: 'Doentes na população', min: 1, max: 20, step: 1, value: 2, format: (x) => `${x}%` },
            { key: 'sens', label: 'Doentes que testam positivo', min: 80, max: 99, step: 1, value: 95, format: (x) => `${x}%` },
            { key: 'fp', label: 'Saudáveis que testam positivo', min: 1, max: 20, step: 1, value: 3, format: (x) => `${x}%` },
          ],
          readouts: ({ prev, sens, fp }) => {
            const tp = (10000 * prev * sens) / 10000;
            const fpos = ((10000 - 100 * prev) * fp) / 100;
            return [
              { label: 'Positivos doentes', value: num(tp, 0) },
              { label: 'Positivos saudáveis', value: num(fpos, 0) },
              { label: 'P(doente | positivo)', value: `${num((100 * tp) / (tp + fpos), 1)}%`, big: true, tone: 'iris' },
            ];
          },
          viz: ({ prev, sens, fp }) => {
            const tp = (10000 * prev * sens) / 10000;
            const fpos = ((10000 - 100 * prev) * fp) / 100;
            return {
              kind: 'parts',
              segments: [
                { label: 'positivos doentes', value: tp, tone: 'iris' },
                { label: 'positivos saudáveis', value: fpos, tone: 'ember' },
              ],
              summary: `Dos ${num(tp + fpos, 0)} positivos, ${num(tp, 0)} estão doentes: ${num((100 * tp) / (tp + fpos), 1)}%`,
            };
          },
          goal: {
            task: 'Com 10% de doentes e um teste que detecta 90% deles, ache a taxa de falso positivo que faz exatamente metade dos positivos estarem doentes.',
            done: ({ prev, sens, fp }) => prev === 10 && sens === 90 && fp === 10,
            success: 'Isso: 900 doentes positivos e 10% de 9.000 saudáveis = 900 falsos positivos. Metade e metade: 50%.',
          },
          insight: 'Quanto mais rara a doença, mais os falsos positivos pesam: há muito mais saudáveis para errar.',
        }),
        example('Um teste de alergia', 'Numa população, 4% têm uma alergia. Um teste detecta 75% dos alérgicos e dá falso positivo em 10% dos não alérgicos. Se o teste deu positivo, qual é a chance de a pessoa ser alérgica?', [
          step('Em 1.000 pessoas:', '40 alérgicas → 75% = 30 positivos', '960 não alérgicas → 10% = 96 positivos'),
          askStep('Agora, o universo: quem testou positivo.', 'Quantas pessoas, ao todo, testam positivo?', [
            ok('30 + 96 = 126'),
            no('Só as 30 alérgicas', 'Os falsos positivos também testam positivo: 10% de 960 = 96.'),
          ]),
          step('Condicional:', 'P(alérgica | positivo) = 30 ÷ 126 ≈ 23,8%'),
        ], 'Mesmo com resultado positivo, a chance de alergia é de cerca de 24%.'),
        key('Frequências naturais', 'Em problemas de testes, imagine um grupo concreto (1.000 ou 10.000 pessoas) e transforme as porcentagens em quantidades. Fica fácil ver quem está no universo da condição.'),
        check(choice({
          prompt: [table(['', 'Cartão', 'Pix', 'Total'], [['Loja A', '60', '40', '100'], ['Loja B', '30', '70', '100'], ['Total', '90', '110', '200']], 'Clientes por loja e forma de pagamento')],
          ask: 'Sorteia-se um cliente que pagou com pix. Qual é a probabilidade de ele ser da loja B?',
          options: [
            ok('7/11'),
            no('7/20', 'Isso divide pelo total geral (200). O cliente sorteado pagou com pix: o universo são os 110 clientes do pix.'),
            no('7/10', 'Isso divide pelo total da loja B (100). A condição é ter pago com pix: divida pelos 110 do pix.'),
            no('11/20', 'Essa é a chance de um cliente qualquer ter pago com pix, e não a pedida.'),
          ],
          solution: ['$universo: clientes do pix = 110', '$favoráveis: loja B e pix = 70', '$P = 70/110 = 7/11'],
        })),
      ],
      practice: [gen(condTableGen), gen(treeGen), gen(testGen)],
      challenge: [gen(testGen), gen(condTableGen), gen(treeGen)],
      recap: [
        'Condicional: divida pelo total do grupo da condição.',
        'Árvore: some os caminhos que levam ao evento.',
        'P(positivo | doente) ≠ P(doente | positivo).',
      ],
    })),

    stage('maestria', 'maestria', 'Maestria: chances encadeadas', 'Resolver problemas inéditos que combinam eventos independentes e dependentes, contagem de ordens, complemento e condicional.', () => ({
      learn: [
        strategy('Probabilidade composta em 4 passos', '1) Os eventos são independentes (multiplique direto) ou dependentes (atualize as quantidades)? 2) "Exatamente k": conte as ordens. 3) "Pelo menos um": complemento. 4) "Sabendo que…": restrinja o universo antes de dividir.'),
        example('A peça defeituosa', 'Uma fábrica tem a máquina A, que faz 60% das peças com 2% de defeito, e a B, que faz 40% com 5% de defeito. Uma peça defeituosa foi encontrada. Qual é a chance de ela ter vindo da máquina B?', [
          step('Em 1.000 peças:', 'A: 600 peças → 12 defeituosas', 'B: 400 peças → 20 defeituosas'),
          askStep('O universo agora é: peças defeituosas.', 'Quantas são?', [
            ok('12 + 20 = 32'),
            no('20', '20 são só as defeituosas da máquina B. As 12 de A também são defeituosas.'),
          ]),
          step('Condicional:', 'P(B | defeituosa) = 20 ÷ 32 = 62,5%'),
        ], 'A peça defeituosa veio da máquina B com probabilidade de 62,5%.'),
        reveal('Por que o "e" diminui a chance?', 'Porque exigir duas coisas é mais difícil do que exigir uma: multiplicar por um número menor que 1 sempre diminui. Se uma conta de "e" deu maior que as chances individuais, algo foi somado no lugar de multiplicado.'),
        check(numeric({
          prompt: [p('Uma prova tem 3 questões de verdadeiro ou falso. Um estudante chuta todas, ao acaso.')],
          ask: 'Qual é a probabilidade, em porcentagem, de ele acertar pelo menos uma?',
          unit: '%',
          answer: 87.5,
          wrong: [
            { value: 12.5, feedback: 'Essa é a chance de errar todas ((1/2)³). A pergunta é o contrário: 100% menos ela.' },
            { value: 150, feedback: 'Isso soma 50% três vezes, e uma probabilidade não passa de 100%. Use o complemento.' },
            { value: 50, feedback: 'Essa é a chance de acertar uma questão específica. "Pelo menos uma" vale para qualquer das três.' },
          ],
          solution: ['$errar todas: (1/2)³ = 1/8 = 12,5%', '$pelo menos uma: 100% − 12,5% = 87,5%'],
        })),
      ],
      practice: [gen(noReplaceGen), gen(exactlyBiasedGen), gen(testGen)],
      challenge: [gen(testGen), gen(atLeastOneGen), gen(noReplaceGen), gen(exactlyCoinsGen)],
      recap: [
        'Independentes multiplicam direto; dependentes atualizam as quantidades.',
        '"Exatamente k" conta ordens; "pelo menos um" usa o complemento.',
        '"Sabendo que" muda o universo.',
      ],
    })),
  ],
});
