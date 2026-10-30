/**
 * Aula: Média — aritmética (soma ÷ quantidade, divisão igualitária, valor que falta), ponderada
 * (pesos, frequências, preço médio), atualizar a média quando o grupo muda (sai, entra, corrige,
 * desloca) e maestria com a média de grupos de tamanhos diferentes.
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
  math,
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
import { brl, fixed, num, round } from '../../kit/format';
import type { Rand } from '../../types';

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const ORD = ['1ª', '2ª', '3ª', '4ª', '5ª', '6ª', '7ª', '8ª'];
/** Nota com uma casa: 8 → "8,0". */
const nota = (x: number) => fixed(x, 1);
/** "=" quando a divisão é exata em duas casas; "≈" quando foi arredondada. */
const eq = (exact: number) => (Math.abs(exact - round(exact, 2)) < 1e-9 ? '=' : '≈');

// ———————————————————————————————————————————————— geradores: média aritmética

const LISTS = [
  { intro: (n: number) => `Nas ${n} provas do semestre, um estudante tirou as notas da tabela.`, head: 'Prova', row: 'Nota', lo: 3, hi: 10, ask: 'Qual é a média aritmética das notas?', unit: '' },
  { intro: (n: number) => `A tabela mostra os gols de um time nas últimas ${n} partidas.`, head: 'Partida', row: 'Gols', lo: 0, hi: 6, ask: 'Qual é a média de gols por partida?', unit: 'gols' },
  { intro: (n: number) => `Uma corredora registrou o tempo, em minutos, de ${n} treinos de 5 km.`, head: 'Treino', row: 'Tempo (min)', lo: 24, hi: 34, ask: 'Qual foi o tempo médio por treino?', unit: 'min' },
];

/** Média aritmética: soma ÷ quantidade. */
function meanGen(r: Rand) {
  for (;;) {
    const g = r.pick(LISTS);
    const n = r.int(4, 6);
    const vals = Array.from({ length: n }, () => r.int(g.lo, g.hi));
    const total = sum(vals);
    if (!Number.isInteger((4 * total) / n) || new Set(vals).size < 3) continue;
    if (vals.join() === '6,7,8,9,10') continue; // questão do banco
    const m = total / n;
    return draftNumeric({
      prompt: [p(g.intro(n)), table([g.head, ...ORD.slice(0, n)], [[g.row, ...vals.map(String)]])],
      ask: g.ask,
      ...(g.unit ? { unit: g.unit } : {}),
      answer: m,
      wrong: [
        { value: total, feedback: `Essa é a soma. A média divide a soma pela quantidade de valores: ${n}.` },
        { value: round((Math.max(...vals) + Math.min(...vals)) / 2, 2), feedback: 'Isso é a média só entre o maior e o menor valor. A média usa todos os valores.' },
        { value: round(total / (n - 1), 2), feedback: `Isso divide por ${n - 1}. São ${n} valores.` },
      ],
      hints: [`Some os ${n} valores: ${vals.join(' + ')}.`, `Divida a soma por ${n}.`],
      solution: [`$${vals.join(' + ')} = ${total}`, `$${total} ÷ ${n} = ${num(m)}`],
    });
  }
}

const FRIENDS = ['Ana', 'Bruno', 'Caio', 'Duda'];

/** A média como divisão igualitária: quem pagou a mais recebe a diferença. */
function fairShareGen(r: Rand) {
  for (;;) {
    const n = r.int(3, 4);
    const paid = Array.from({ length: n }, () => 10 * r.int(4, 20));
    const total = sum(paid);
    if (total % n !== 0) continue;
    const share = total / n;
    const i = paid.indexOf(Math.max(...paid));
    if (paid.filter((v) => v === paid[i]).length > 1 || paid[i] === share) continue;
    const names = FRIENDS.slice(0, n);
    const list = names.map((nm, k) => `${nm} pagou ${brl(paid[k])}`);
    return draftNumeric({
      prompt: [p(`${n === 3 ? 'Três' : 'Quatro'} amigos dividiram as despesas de um passeio: ${list.slice(0, -1).join(', ')} e ${list[n - 1]}. Eles querem que todos tenham gastado o mesmo valor.`)],
      ask: `Quanto ${names[i]} deve receber, no total, dos outros?`,
      prefix: 'R$',
      answer: paid[i] - share,
      wrong: [
        { value: share, feedback: `${brl(share)} é o que cada um deve gastar, a média. ${names[i]} pagou ${brl(paid[i])}: deve receber a diferença.` },
        { value: paid[i] - Math.min(...paid), feedback: 'Isso compara com quem pagou menos. A referência é a média, o valor que cada um deve gastar.' },
        { value: round((paid[i] - share) / (n - 1), 2), feedback: `Esse é o valor que caberia a cada um dos outros ${n - 1}, se dividissem igualmente o reembolso. A pergunta é o total que ${names[i]} recebe.` },
      ],
      hints: [`Total gasto: ${paid.join(' + ')} = ${total}. Cada um deve gastar ${total} ÷ ${n}.`, `${names[i]} pagou ${num(paid[i])}; compare com a média.`],
      solution: [`$média: ${total} ÷ ${n} = ${num(share)}`, `$${num(paid[i])} − ${num(share)} = ${brl(paid[i] - share)}`],
    });
  }
}

const NEEDS = [
  { what: 'notas', intro: (n: number, vals: string) => `Um estudante fará ${n} provas. Nas ${n - 1} primeiras, tirou ${vals}.`, ask: (m: string, n: number) => `Quanto precisa tirar na ${ORD[n - 1]} prova para ficar com média ${m}?`, lo: 4, hi: 9, max: 10, unit: '' },
  { what: 'vendas', intro: (n: number, vals: string) => `Um vendedor tem a meta de vender, em média, um certo número de seguros por semana num mês de ${n} semanas. Nas ${n - 1} primeiras, vendeu ${vals}.`, ask: (m: string, n: number) => `Quantos seguros precisa vender na ${ORD[n - 1]} semana para a média ser ${m}?`, lo: 5, hi: 15, max: 30, unit: 'seguros' },
];

/** Valor que falta para atingir a média: total = média × quantidade. */
function neededGen(r: Rand) {
  for (;;) {
    const g = r.pick(NEEDS);
    const n = r.int(4, 5);
    const known = Array.from({ length: n - 1 }, () => r.int(g.lo, g.hi));
    const M = r.int(g.lo + 1, g.hi);
    const x = n * M - sum(known);
    if (x < 0 || x > g.max || x === M) continue;
    const vals = `${known.slice(0, -1).join(', ')} e ${known[n - 2]}`;
    const meanKnown = sum(known) / (n - 1);
    return draftNumeric({
      prompt: [p(g.intro(n, vals))],
      ask: g.ask(num(M), n),
      ...(g.unit ? { unit: g.unit } : {}),
      answer: x,
      wrong: [
        { value: M, feedback: `Tirar a média desejada na última só funciona se as outras já estiverem na média. Faça o total: ${n} × ${M} = ${n * M}.` },
        { value: round(2 * M - meanKnown, 2), feedback: `Isso trata a última como se pesasse tanto quanto as outras ${n - 1} juntas. Ela é só uma de ${n}: use o total.` },
        ...((n - 1) * M - sum(known) >= 0 ? [{ value: (n - 1) * M - sum(known), feedback: `Isso usa ${n - 1} no total. A média é de ${n} valores: o total precisa ser ${n} × ${M}.` }] : []),
      ],
      hints: [`Para média ${M} em ${n} valores, o total precisa ser ${n} × ${M} = ${n * M}.`, `Já há ${known.join(' + ')} = ${sum(known)}.`],
      solution: [`$total necessário: ${n} × ${M} = ${n * M}`, `$${n * M} − ${sum(known)} = ${x}`],
    });
  }
}

// ———————————————————————————————————————————————— geradores: média ponderada

/** Média ponderada de três avaliações. */
function weightedGen(r: Rand) {
  for (;;) {
    const w = [r.int(1, 3), r.int(1, 4), r.int(2, 5)];
    const g = [r.int(8, 20) / 2, r.int(8, 20) / 2, r.int(8, 20) / 2];
    const W = sum(w);
    const S = sum(g.map((x, i) => x * w[i]));
    const m = round(S / W, 2);
    if (new Set(w).size < 2 || Math.abs(m - round(sum(g) / 3, 2)) < 0.05) continue;
    if (w.join() === '2,3,5' && g[0] === 6 && g[1] === 8) continue; // questão do banco
    return draftNumeric({
      prompt: [
        p('A nota final de um curso é a média ponderada de três avaliações.'),
        table(['Avaliação', 'Nota', 'Peso'], g.map((x, i) => [ORD[i], nota(x), String(w[i])])),
      ],
      ask: 'Qual é a nota final, com duas casas decimais?',
      answer: m,
      tolerance: 0.01,
      wrong: [
        { value: round(sum(g) / 3, 2), feedback: 'Essa é a média simples, que dá o mesmo peso às três avaliações. Multiplique cada nota pelo seu peso.' },
        { value: round(S, 2), feedback: `Essa é a soma dos produtos nota × peso. Falta dividir pela soma dos pesos, ${W}.` },
        { value: round(S / 3, 2), feedback: `Isso divide pelo número de avaliações (3). Na média ponderada, divide-se pela soma dos pesos: ${W}.` },
      ],
      hints: [`Some nota × peso: ${g.map((x, i) => `${nota(x)} × ${w[i]}`).join(' + ')}.`, `Divida pela soma dos pesos: ${w.join(' + ')} = ${W}.`],
      solution: [`$${g.map((x, i) => `${nota(x)} × ${w[i]}`).join(' + ')} = ${num(S, 2)}`, `$${num(S, 2)} ÷ ${W} ${eq(S / W)} ${num(m, 2)}`],
    });
  }
}

/** Nota mínima na avaliação de maior peso para atingir uma média ponderada. */
function weightedNeededGen(r: Rand) {
  for (;;) {
    const w = [r.int(1, 3), r.int(1, 3), r.int(3, 6)];
    const g1 = r.int(8, 18) / 2;
    const g2 = r.int(8, 18) / 2;
    const M = r.pick([5, 6, 6.5, 7, 7.5, 8]);
    const W = sum(w);
    const x = round((M * W - g1 * w[0] - g2 * w[1]) / w[2], 2);
    if (x < 0 || x > 10 || !Number.isInteger(x * 10)) continue;
    if (w.join() === '2,3,5' && g1 === 6 && g2 === 8 && M === 7.5) continue; // questão do banco
    const simple = round(3 * M - g1 - g2, 2);
    return draftNumeric({
      prompt: [p(`Num curso, a nota final é a média ponderada de três avaliações, com pesos ${w[0]}, ${w[1]} e ${w[2]}. Uma estudante tirou ${nota(g1)} na primeira e ${nota(g2)} na segunda.`)],
      ask: `Qual nota mínima ela precisa tirar na terceira para ter média final ${nota(M)}?`,
      answer: x,
      tolerance: 0.01,
      wrong: [
        { value: M, feedback: 'Tirar a média desejada na última só funciona se as outras notas já estiverem na média. Monte a média ponderada e resolva.' },
        ...(simple >= 0 && simple <= 10 ? [{ value: simple, feedback: 'Isso usa a média simples (pesos iguais). Com pesos, a terceira nota pesa mais: multiplique cada nota pelo seu peso.' }] : []),
        { value: round(M * W - g1 * w[0] - g2 * w[1], 2), feedback: `Esse é quanto a terceira avaliação precisa somar já multiplicada pelo peso. Divida por ${w[2]}.` },
      ],
      hints: [`A soma ponderada precisa ser ${nota(M)} × (${w.join(' + ')}) = ${num(M * W, 2)}.`, `Já há ${nota(g1)} × ${w[0]} + ${nota(g2)} × ${w[1]} = ${num(g1 * w[0] + g2 * w[1], 2)}.`],
      solution: [`$${num(g1 * w[0] + g2 * w[1], 2)} + ${w[2]}x = ${num(M * W, 2)}`, `$${w[2]}x = ${num(M * W - g1 * w[0] - g2 * w[1], 2)} → x = ${num(x, 2)}`],
    });
  }
}

const FREQS = [
  { head: 'Livros lidos no mês', row: 'Estudantes', ask: 'Qual é o número médio de livros lidos por estudante?', values: [0, 1, 2, 3, 4] },
  { head: 'Filhos por família', row: 'Famílias', ask: 'Qual é o número médio de filhos por família?', values: [0, 1, 2, 3, 4] },
  { head: 'Pontos no dado', row: 'Vezes que saiu', ask: 'Qual é a média dos pontos obtidos?', values: [1, 2, 3, 4, 5, 6] },
];

/** Média a partir de uma tabela de frequências: cada valor pesa o número de vezes que aparece. */
function freqMeanGen(r: Rand) {
  for (;;) {
    const g = r.pick(FREQS);
    const f = g.values.map(() => r.int(1, 12));
    const N = sum(f);
    const S = sum(g.values.map((v, i) => v * f[i]));
    const m = round(S / N, 2);
    if (!Number.isInteger((100 * S) / N)) continue;
    const plain = sum(g.values) / g.values.length;
    if (Math.abs(m - plain) < 0.05) continue;
    return draftNumeric({
      prompt: [table([g.head, ...g.values.map(String)], [[g.row, ...f.map(String)]])],
      ask: g.ask,
      answer: m,
      tolerance: 0.01,
      wrong: [
        { value: round(plain, 2), feedback: 'Isso faz a média dos valores da primeira linha, sem contar quantas vezes cada um aparece.' },
        { value: round(S / g.values.length, 2), feedback: `Isso divide pelo número de colunas (${g.values.length}). Divida pelo total de dados: ${N}.` },
        { value: round(N / g.values.length, 2), feedback: 'Essa é a média das frequências. A pergunta é a média dos valores, ponderada pelas frequências.' },
      ],
      hints: [`Multiplique cada valor pela sua frequência e some: ${g.values.map((v, i) => `${v} × ${f[i]}`).join(' + ')}.`, `Divida pelo total de dados: ${f.join(' + ')} = ${N}.`],
      solution: [`$${g.values.map((v, i) => `${v} × ${f[i]}`).join(' + ')} = ${S}`, `$${S} ÷ ${N} = ${num(m, 2)}`],
    });
  }
}

const MIXES = [
  { what: 'Uma loja vendeu', item: 'camisetas', unit: 'camiseta', a: [20, 30, 40], pa: [30, 35, 40], b: [10, 20], pb: [50, 60, 70] },
  { what: 'Um posto vendeu, numa manhã,', item: 'litros de etanol', unit: 'litro', a: [200, 300, 400], pa: [4, 4.5], b: [100, 200], pb: [5, 5.5] },
];

/** Preço médio: a média dos preços ponderada pelas quantidades vendidas. */
function avgPriceGen(r: Rand) {
  for (;;) {
    const g = r.pick(MIXES);
    const qa = r.pick(g.a);
    const qb = r.pick(g.b);
    const pa = r.pick(g.pa);
    const pb = r.pick(g.pb);
    if (qa === qb) continue;
    const cents = qa * Math.round(pa * 100) + qb * Math.round(pb * 100);
    if (!Number.isInteger(cents / (qa + qb))) continue;
    const m = round((qa * pa + qb * pb) / (qa + qb), 2);
    if (qa === 30 && qb === 10 && pa === 40 && pb === 60) continue; // exercício da teoria
    return draftNumeric({
      prompt: [p(`${g.what} ${qa} ${g.item} a ${brl(pa)} e ${qb} a ${brl(pb)}.`)],
      ask: `Qual foi o preço médio por ${g.unit}?`,
      prefix: 'R$',
      answer: m,
      wrong: [
        { value: round((pa + pb) / 2, 2), feedback: 'Essa é a média simples dos dois preços. Como as quantidades são diferentes, cada preço pesa a quantidade vendida.' },
        { value: round((qb * pa + qa * pb) / (qa + qb), 2), feedback: 'Isso troca as quantidades: cada preço deve ser multiplicado pela quantidade vendida a esse preço.' },
        { value: round(qa * pa + qb * pb, 2), feedback: `Essa é a receita total. Divida pela quantidade total: ${qa + qb}.` },
      ],
      hints: [`Receita total: ${qa} × ${num(pa)} + ${qb} × ${num(pb)}.`, `Divida pela quantidade total: ${qa} + ${qb} = ${qa + qb}.`],
      solution: [`$${qa} × ${num(pa)} + ${qb} × ${num(pb)} = ${num(qa * pa + qb * pb)}`, `$${num(qa * pa + qb * pb)} ÷ ${qa + qb} = ${brl(m)}`],
    });
  }
}

// ———————————————————————————————————————————————— geradores: quando o grupo muda

/** Um valor sai do cálculo: total menos o valor, dividido pela nova quantidade. */
function removeGen(r: Rand) {
  for (;;) {
    const n = r.pick([15, 20, 24, 25, 30, 40]);
    const M = r.int(50, 80) / 10;
    const v = r.int(0, 30) / 10;
    if (n === 20 && M === 6.5 && v === 2) continue; // questão do banco
    if (n === 25 && M === 7.2 && v === 3) continue; // exemplo da teoria
    const T = round(n * M, 2);
    const ans = round((T - v) / (n - 1), 2);
    return draftNumeric({
      prompt: [p(`Um professor corrigiu ${n} provas, e a média foi ${nota(M)}. Depois, uma prova com nota ${nota(v)} foi anulada e retirada do cálculo.`)],
      ask: 'Qual é a nova média, com duas casas decimais?',
      answer: ans,
      tolerance: 0.01,
      wrong: [
        { value: M, feedback: 'Tirar uma nota abaixo da média muda a média: ela sobe. Recalcule com o total.' },
        { value: round((T - v) / n, 2), feedback: `Isso tira a nota do total, mas continua dividindo por ${n}. Agora são ${n - 1} provas.` },
        { value: round((T + v) / (n - 1), 2), feedback: 'Isso soma a nota anulada ao total, em vez de tirá-la.' },
      ],
      hints: [`Total de pontos: ${nota(M)} × ${n} = ${num(T, 2)}.`, `Tire ${nota(v)} e divida por ${n - 1}.`],
      solution: [`$${nota(M)} × ${n} = ${num(T, 2)}`, `$(${num(T, 2)} − ${nota(v)}) ÷ ${n - 1} = ${num(T - v, 2)} ÷ ${n - 1} ${eq((T - v) / (n - 1))} ${num(ans, 2)}`],
    });
  }
}

/** Entram pessoas no grupo: a média dos que entraram vem da diferença dos totais. */
function addGroupGen(r: Rand) {
  for (;;) {
    const ctx = r.pick([
      { who: 'pessoas', the: 'das', what: 'idade', unit: 'anos', lo: 20, hi: 40 },
      { who: 'atletas', the: 'dos', what: 'massa', unit: 'kg', lo: 60, hi: 80 },
    ]);
    const n = r.pick([8, 10, 12, 15, 18, 20]);
    const k = r.int(2, 4);
    const M = r.int(ctx.lo, ctx.hi);
    const d = r.int(1, 3);
    const M2 = M + d;
    if (n === 10 && k === 2 && M === 30 && M2 === 31) continue; // questão do banco
    const newSum = (n + k) * M2 - n * M;
    const ans = newSum / k;
    if (!Number.isInteger(ans * 10)) continue;
    return draftNumeric({
      prompt: [p(`A média de ${ctx.what} de um grupo de ${n} ${ctx.who} é ${M} ${ctx.unit}. Entram mais ${k} ${ctx.who}, e a média do grupo passa a ser ${M2} ${ctx.unit}.`)],
      ask: `Qual é a média de ${ctx.what} ${ctx.the} ${k} ${ctx.who} que entraram?`,
      unit: ctx.unit,
      answer: ans,
      wrong: [
        { value: M2, feedback: 'Essa é a nova média do grupo inteiro. Os que entraram precisam estar acima dela para puxá-la para cima.' },
        { value: newSum, feedback: `Essa é a soma dos ${k} que entraram. Divida por ${k}.` },
        { value: M2 + d, feedback: 'Isso compensa a diferença uma vez só. Os que entraram precisam elevar a média de todo o grupo: use os totais.' },
      ],
      hints: [`Total antes: ${n} × ${M} = ${n * M}. Total depois: ${n + k} × ${M2} = ${(n + k) * M2}.`, `A diferença é a soma dos ${k} que entraram.`],
      solution: [`$${(n + k) * M2} − ${n * M} = ${newSum}`, `$${newSum} ÷ ${k} = ${num(ans)} ${ctx.unit}`],
    });
  }
}

/** Valor anotado errado: corrige-se o total, e a quantidade não muda. */
function correctGen(r: Rand) {
  for (;;) {
    const n = r.pick([20, 25, 30, 40]);
    const M = r.int(50, 75) / 10;
    const right = r.int(60, 95) / 10;
    const wrongVal = round(Math.floor(right) / 10 + (right * 10 - Math.floor(right) * 10), 1); // dígitos trocados: 8,5 → 5,8
    if (wrongVal === right || wrongVal < 0) continue;
    const T = n * M;
    const ans = round((T - wrongVal + right) / n, 2);
    return draftNumeric({
      prompt: [p(`A média das notas de ${n} estudantes foi calculada como ${nota(M)}. Depois, descobriu-se que uma nota ${nota(right)} tinha sido lançada como ${nota(wrongVal)}.`)],
      ask: 'Qual é a média correta, com duas casas decimais?',
      answer: ans,
      tolerance: 0.01,
      wrong: [
        { value: round(M + right - wrongVal, 2), feedback: `Isso soma a correção inteira (${num(right - wrongVal, 1)}) à média. Ela se espalha pelos ${n} estudantes: some ao total, e não à média.` },
        { value: round((T + right) / (n + 1), 2), feedback: 'Isso acrescenta a nota certa como se fosse mais um estudante. A nota errada precisa sair e a certa, entrar no lugar dela.' },
        { value: M, feedback: 'A correção muda o total de pontos, e a média muda junto.' },
      ],
      hints: [`Total com o erro: ${nota(M)} × ${n} = ${num(T, 2)}.`, `Troque ${nota(wrongVal)} por ${nota(right)} no total e divida por ${n}.`],
      solution: [`$${num(T, 2)} − ${nota(wrongVal)} + ${nota(right)} = ${num(T - wrongVal + right, 2)}`, `$${num(T - wrongVal + right, 2)} ÷ ${n} ${eq((T - wrongVal + right) / n)} ${num(ans, 2)}`],
    });
  }
}

// ———————————————————————————————————————————————— geradores: maestria

/** Média de duas turmas de tamanhos diferentes: não é a média das médias. */
function combineGroupsGen(r: Rand) {
  for (;;) {
    const na = r.pick([20, 25, 30, 35, 40]);
    const nb = r.pick([10, 15, 20, 45, 50]);
    const ma = r.int(50, 85) / 10;
    const mb = r.int(50, 85) / 10;
    if (na === nb || Math.abs(ma - mb) < 0.8) continue;
    const tenths = na * Math.round(ma * 10) + nb * Math.round(mb * 10);
    if (!Number.isInteger((10 * tenths) / (na + nb))) continue;
    const ans = round((na * ma + nb * mb) / (na + nb), 2);
    return draftNumeric({
      prompt: [p(`Numa escola, a turma A tem ${na} estudantes e média ${nota(ma)} numa prova; a turma B tem ${nb} estudantes e média ${nota(mb)}.`)],
      ask: 'Qual é a média dos estudantes das duas turmas juntas, com duas casas decimais?',
      answer: ans,
      tolerance: 0.01,
      wrong: [
        { value: round((ma + mb) / 2, 2), feedback: 'Essa é a média das médias. As turmas têm tamanhos diferentes: a maior pesa mais.' },
        { value: round((nb * ma + na * mb) / (na + nb), 2), feedback: 'Isso troca os pesos: cada média deve ser multiplicada pelo tamanho da sua própria turma.' },
        { value: round(na * ma + nb * mb, 2), feedback: `Esse é o total de pontos. Divida pelo total de estudantes: ${na + nb}.` },
      ],
      hints: [`Total de pontos: ${na} × ${nota(ma)} + ${nb} × ${nota(mb)}.`, `Divida por ${na} + ${nb} = ${na + nb} estudantes.`],
      solution: [`$${na} × ${nota(ma)} + ${nb} × ${nota(mb)} = ${num(na * ma + nb * mb, 2)}`, `$${num(na * ma + nb * mb, 2)} ÷ ${na + nb} ${eq((na * ma + nb * mb) / (na + nb))} ${num(ans, 2)}`],
    });
  }
}

// ———————————————————————————————————————————————— aula

export const MEDIA = lesson({
  id: 'media',
  topic: 'estatistica',
  subtopics: ['media'],
  title: 'Média aritmética e ponderada',
  summary: 'A média como divisão igualitária, o valor que falta para atingir uma média, médias ponderadas por pesos e frequências, e como a média muda quando alguém entra, sai ou tem a nota corrigida.',
  requires: ['operacoes'],
  stages: [
    stage('equilibrio', 'descoberta', 'Média: dividir igualmente', 'Calcular a média aritmética como soma ÷ quantidade, entendê-la como divisão igualitária e descobrir o valor que falta para atingir uma média.', () => ({
      learn: [
        text('A **média aritmética** é a soma dos valores dividida pela quantidade deles: é quanto cada um teria se o total fosse dividido igualmente. Por isso, a média sempre fica entre o menor e o maior valor, e os valores acima dela compensam os de baixo — as diferenças em relação à média somam zero.'),
        lab({
          title: 'A nota que falta',
          intro: 'Um estudante tirou 6, 8 e 5 nas três primeiras provas. Escolha a nota da quarta e veja a média.',
          params: [{ key: 'x', label: 'Nota da 4ª prova', min: 0, max: 10, step: 0.5, value: 5, format: (v) => num(v, 1) }],
          readouts: ({ x }) => [
            { label: 'Soma', value: num(19 + x, 1) },
            { label: 'Média', value: num((19 + x) / 4, 3), big: true, tone: 'verdigris' },
          ],
          viz: ({ x }) => ({
            kind: 'bars',
            bars: [
              { label: '1ª', value: 6, tone: 'mist' },
              { label: '2ª', value: 8, tone: 'mist' },
              { label: '3ª', value: 5, tone: 'mist' },
              { label: '4ª', value: x, tone: 'verdigris' },
            ],
            max: 10,
            refLine: { value: (19 + x) / 4, label: `média ${num((19 + x) / 4, 2)}` },
            summary: `Com ${num(x, 1)} na quarta prova, a média fica ${num((19 + x) / 4, 3)}`,
          }),
          goal: {
            task: 'Ache a nota da 4ª prova que deixa a média exatamente 7.',
            done: ({ x }) => Math.abs(x - 9) < 1e-9,
            success: 'Isso: média 7 em 4 provas exige 28 pontos; já há 6 + 8 + 5 = 19, faltam 9. Repare como a barra de 9 compensa a de 5.',
          },
          insight: 'O que passa da média em uma barra preenche o que falta em outra: é isso que "dividir igualmente" quer dizer.',
        }),
        key('Total = média × quantidade', 'Conhecendo a média e a quantidade de valores, você conhece o total. É a chave para achar um valor que falta: total necessário menos o que já se tem.'),
        example('O gol que falta', 'Um time marcou 2, 0, 3 e 1 gols nas quatro primeiras partidas. Quantos gols precisa marcar na quinta para ter média de 2 gols por partida?', [
          askStep('Comece pelo total.', 'Qual deve ser o total de gols nas 5 partidas?', [
            ok('2 × 5 = 10'),
            no('2 + 5 = 7', 'Média × quantidade dá o total: 2 gols por partida em 5 partidas são 10 gols.'),
          ]),
          step('O que já tem e o que falta:', '2 + 0 + 3 + 1 = 6', '10 − 6 = 4 gols'),
        ], 'O time precisa marcar 4 gols na quinta partida.'),
        check(numeric({
          prompt: [p('As temperaturas máximas de uma semana foram 25, 31, 30, 27, 29, 32 e 36 °C.')],
          ask: 'Qual foi a temperatura máxima média da semana?',
          unit: '°C',
          answer: 30,
          wrong: [
            { value: 210, feedback: 'Essa é a soma das sete temperaturas. Divida por 7.' },
            { value: 30.5, feedback: 'Isso é a média só entre a menor (25) e a maior (36). A média usa os sete dias.' },
            { value: 35, feedback: 'Isso divide a soma por 6. A semana tem 7 dias.' },
          ],
          solution: ['$25 + 31 + 30 + 27 + 29 + 32 + 36 = 210', '$210 ÷ 7 = 30 °C'],
        })),
      ],
      practice: [gen(meanGen), gen(fairShareGen), gen(neededGen)],
      challenge: [gen(neededGen), gen(meanGen), gen(fairShareGen)],
      recap: [
        'Média = soma ÷ quantidade.',
        'A média fica entre o menor e o maior valor.',
        'Valor que falta: média desejada × quantidade − soma conhecida.',
      ],
    })),

    stage('ponderada', 'fundamentos', 'Média ponderada', 'Calcular médias ponderadas — com pesos de avaliações, frequências de uma tabela ou quantidades vendidas — e achar a nota necessária numa avaliação com peso.', () => ({
      learn: [
        text('Quando os valores não têm a mesma importância, usa-se a **média ponderada**: cada valor é multiplicado pelo seu **peso**, somam-se os produtos e divide-se pela **soma dos pesos**. Frequências funcionam como pesos: numa tabela "valor × número de vezes", cada valor pesa quantas vezes aparece. E o preço médio de uma venda pesa cada preço pela quantidade vendida.'),
        math('média ponderada = [[v₁ · p₁ + v₂ · p₂ + v₃ · p₃|p₁ + p₂ + p₃]]'),
        lab({
          title: 'O peso da prova',
          intro: 'Um estudante tirou 9 no trabalho (peso 1) e 5 na prova. Escolha o peso da prova e veja a média ponderada.',
          params: [{ key: 'w', label: 'Peso da prova', min: 1, max: 5, step: 1, value: 1, format: (v) => String(v) }],
          readouts: ({ w }) => [
            { label: 'Soma ponderada', value: `9 × 1 + 5 × ${w} = ${9 + 5 * w}` },
            { label: 'Média', value: num((9 + 5 * w) / (1 + w), 2), big: true, tone: 'verdigris' },
          ],
          viz: ({ w }) => ({
            kind: 'bars',
            bars: [
              { label: 'Trabalho', value: 9, tone: 'mist', text: '9 (peso 1)' },
              { label: 'Prova', value: 5, tone: 'verdigris', text: `5 (peso ${w})` },
            ],
            max: 10,
            refLine: { value: (9 + 5 * w) / (1 + w), label: `média ${num((9 + 5 * w) / (1 + w), 2)}` },
            summary: `Com peso ${w} na prova, a média ponderada fica ${num((9 + 5 * w) / (1 + w), 2)}`,
          }),
          goal: {
            task: 'Ache o peso da prova que deixa a média exatamente 6.',
            done: ({ w }) => w === 3,
            success: 'Isso: (9 × 1 + 5 × 3) ÷ (1 + 3) = 24 ÷ 4 = 6. Quanto maior o peso da prova, mais a média se aproxima da nota dela.',
          },
          insight: 'Com pesos iguais, a média fica no meio das notas; aumentar um peso puxa a média para aquela nota.',
        }),
        example('Média de uma tabela de frequências', [
          p('Numa pesquisa, 40 famílias informaram quantos filhos têm.'),
          table(['Filhos', '0', '1', '2', '3'], [['Famílias', '6', '14', '12', '8']]),
        ], [
          step('Some valor × frequência:', '0 × 6 + 1 × 14 + 2 × 12 + 3 × 8 = 62'),
          askStep('Agora, divida.', 'Por quanto se divide a soma?', [
            ok('Pelo número de famílias, 40'),
            no('Por 4, o número de colunas da tabela', 'Cada família é um dado: são 40 dados, e não 4.'),
          ]),
          step('Média:', '62 ÷ 40 = 1,55 filho por família'),
        ], 'A média é de 1,55 filho por família.'),
        check(numeric({
          prompt: [p('Uma loja vendeu 30 camisetas a R$ 40,00 e 10 a R$ 60,00.')],
          ask: 'Qual foi o preço médio por camiseta?',
          prefix: 'R$',
          answer: 45,
          wrong: [
            { value: 50, feedback: 'Essa é a média simples dos dois preços. Foram vendidas mais camisetas a R$ 40,00: esse preço pesa mais.' },
            { value: 55, feedback: 'Isso troca as quantidades: 30 camisetas saíram a R$ 40,00, e 10, a R$ 60,00.' },
            { value: 1800, feedback: 'Essa é a receita total. Divida pelas 40 camisetas.' },
          ],
          solution: ['$30 × 40 + 10 × 60 = 1.800', '$1.800 ÷ 40 = R$ 45,00'],
        })),
      ],
      practice: [gen(weightedGen), gen(weightedNeededGen), gen(freqMeanGen), gen(avgPriceGen)],
      challenge: [gen(weightedNeededGen), gen(freqMeanGen), gen(avgPriceGen), gen(weightedGen)],
      recap: [
        'Média ponderada: Σ(valor × peso) ÷ Σ(pesos).',
        'Frequências são pesos: divida pelo total de dados.',
        'Preço médio: receita total ÷ quantidade total.',
      ],
    })),

    stage('mudancas', 'aplicacoes', 'Quando o grupo muda', 'Recalcular médias quando um valor sai, quando entram novos valores ou quando um valor é corrigido, sempre passando pelo total.', () => ({
      learn: [
        text('Para atualizar uma média, trabalhe com o **total**: total = média × quantidade. Se sai um valor, tire-o do total e divida pela nova quantidade; se entram valores, some-os e divida pela nova quantidade; se um valor foi anotado errado, troque-o no total — a quantidade não muda. E se todos os valores aumentam o mesmo tanto, a média aumenta esse tanto.'),
        lab({
          title: 'Entrou alguém no grupo',
          intro: 'Um grupo de 8 amigos tem média de idade de 20 anos. Escolha a idade de quem vai entrar.',
          params: [{ key: 'a', label: 'Idade de quem entra', min: 10, max: 60, step: 1, value: 20, format: (v) => `${v} anos` }],
          readouts: ({ a }) => [
            { label: 'Total de idades', value: `160 + ${a} = ${160 + a}` },
            { label: 'Nova média', value: `${num((160 + a) / 9, 2)} anos`, big: true, tone: 'verdigris' },
          ],
          viz: ({ a }) => ({
            kind: 'dots',
            min: 10,
            max: 60,
            values: [15, 17, 18, 19, 20, 22, 24, 25, a],
            marks: [
              { value: 20, label: 'média antes', tone: 'mist' },
              { value: (160 + a) / 9, label: 'média nova', tone: 'verdigris' },
            ],
            summary: `Com a entrada de alguém de ${a} anos, a média passa de 20 para ${num((160 + a) / 9, 2)} anos`,
          }),
          goal: {
            task: 'Ache a idade que faz a média do grupo subir para 22 anos.',
            done: ({ a }) => a === 38,
            success: 'Isso: 9 pessoas com média 22 somam 198 anos; antes eram 160, então quem entrou tem 38. Para subir a média em 2 anos, a pessoa nova precisa "doar" 2 anos a cada um dos 9.',
          },
          insight: 'Quem entra acima da média a puxa para cima; abaixo, para baixo. O quanto depende do tamanho do grupo.',
        }),
        example('Uma prova anulada', 'A média de 25 provas foi 7,2. Uma prova com nota 3,0 foi anulada e retirada do cálculo. Qual é a nova média?', [
          askStep('Comece pelo total.', 'Qual é o total de pontos das 25 provas?', [
            ok('7,2 × 25 = 180'),
            no('7,2 + 25 = 32,2', 'Média × quantidade dá o total: as 25 provas valem, em média, 7,2 pontos cada.'),
          ]),
          step('Tire a nota e recalcule:', '180 − 3 = 177 pontos em 24 provas', '177 ÷ 24 = 7,375'),
        ], 'A nova média é 7,375 ≈ 7,38: tirar uma nota abaixo da média faz a média subir.'),
        warn('Entrou ou saiu: mude a quantidade', 'O erro mais comum é atualizar o total e esquecer de atualizar a quantidade. Se saiu uma prova, divida por uma a menos; se entraram três pessoas, por três a mais.'),
        check(numeric({
          prompt: [p('A média de altura de 12 jogadores de um time é 1,80 m. Entram 3 jogadores, e a média passa a 1,82 m.')],
          ask: 'Qual é a média de altura dos 3 jogadores que entraram?',
          unit: 'm',
          answer: 1.9,
          wrong: [
            { value: 1.82, feedback: 'Essa é a nova média do time inteiro. Os que entraram precisam estar acima dela para puxá-la para cima.' },
            { value: 5.7, feedback: 'Essa é a soma das alturas dos 3 que entraram. Divida por 3.' },
            { value: 1.84, feedback: 'Isso compensa a diferença uma vez só. Use os totais: 15 × 1,82 − 12 × 1,80.' },
          ],
          solution: ['$total antes: 12 × 1,80 = 21,60', '$total depois: 15 × 1,82 = 27,30', '$(27,30 − 21,60) ÷ 3 = 5,70 ÷ 3 = 1,90 m'],
        })),
      ],
      practice: [gen(removeGen), gen(addGroupGen), gen(correctGen)],
      challenge: [gen(addGroupGen), gen(correctGen), gen(removeGen)],
      recap: [
        'Atualize pelo total: total = média × quantidade.',
        'Saiu um valor: (total − valor) ÷ (quantidade − 1).',
        'Valor corrigido: troque no total; a quantidade não muda.',
      ],
    })),

    stage('maestria', 'maestria', 'Maestria: médias no ENEM', 'Resolver problemas inéditos que misturam médias simples e ponderadas, grupos de tamanhos diferentes e atualizações de médias.', () => ({
      learn: [
        strategy('Médias em 4 passos', '1) Pesos iguais ou diferentes? (provas com pesos, frequências, quantidades vendidas, turmas de tamanhos diferentes). 2) Transforme médias em totais: média × quantidade (ou × soma dos pesos). 3) Faça as mudanças nos totais e nas quantidades. 4) Divida no fim e confira se o resultado fica entre o menor e o maior valor.'),
        example('Duas turmas, uma média', 'A turma A tem 30 estudantes com média 6,0; a turma B tem 10 estudantes com média 8,0. Qual é a média das duas turmas juntas?', [
          askStep('As turmas têm tamanhos diferentes.', 'A média geral é 7,0?', [
            ok('Não: a turma A, maior, pesa mais'),
            no('Sim, é a média entre 6 e 8', 'A média das médias só vale para grupos do mesmo tamanho. Aqui, 30 estudantes têm média 6 e só 10 têm média 8.'),
          ]),
          step('Pelos totais:', '30 × 6 + 10 × 8 = 180 + 80 = 260 pontos', '260 ÷ 40 = 6,5'),
        ], 'A média geral é 6,5, mais perto da média da turma maior.'),
        reveal('A média sempre representa bem os dados?', 'Nem sempre. Em 1, 1, 1, 1 e 46, a média é 10 — um valor que ninguém tem. Valores muito afastados puxam a média; nesses casos, a mediana (próxima aula) costuma descrever melhor o "valor típico".'),
        check(numeric({
          prompt: [p('Numa competição, a nota de cada atleta é a média ponderada de três juízes: o juiz principal tem peso 2, e os outros dois, peso 1. Uma atleta recebeu 9,0 do juiz principal, 7,5 e 8,5 dos outros.')],
          ask: 'Qual foi a nota final da atleta?',
          answer: 8.5,
          wrong: [
            { value: 8.33, feedback: 'Essa é a média simples das três notas. O juiz principal tem peso 2: a nota dele conta duas vezes.' },
            { value: 34, feedback: 'Essa é a soma ponderada (9 × 2 + 7,5 + 8,5). Falta dividir pela soma dos pesos, 4.' },
            { value: 11.33, feedback: 'Isso divide a soma ponderada por 3, o número de juízes. Divida pela soma dos pesos: 2 + 1 + 1 = 4.' },
          ],
          solution: ['$9 × 2 + 7,5 × 1 + 8,5 × 1 = 34', '$34 ÷ 4 = 8,5'],
        })),
      ],
      practice: [gen(combineGroupsGen), gen(weightedNeededGen), gen(removeGen)],
      challenge: [gen(combineGroupsGen), gen(addGroupGen), gen(freqMeanGen), gen(neededGen)],
      recap: [
        'Grupos de tamanhos diferentes: média ponderada, nunca a média das médias.',
        'Médias viram totais; totais se somam e se subtraem.',
        'A média sempre fica entre o menor e o maior valor.',
      ],
    })),
  ],
});
