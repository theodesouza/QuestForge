/**
 * Aula: Múltiplos, divisores, MMC e MDC — divisibilidade e primos, fatoração, ciclos que se
 * reencontram (MMC), partes iguais e máximas (MDC), leitura do que o problema pede, aplicações
 * no espaço e no tempo, e os problemas inversos e combinados das questões mais difíceis.
 */
import {
  askStep,
  check,
  choice,
  classify,
  compare,
  draftChoice,
  draftNumeric,
  example,
  gen,
  key,
  lab,
  lesson,
  mathNote,
  no,
  numeric,
  numericOptions,
  ok,
  order,
  p,
  reveal,
  stage,
  step,
  strategy,
  text,
  tip,
  warn,
} from '../../kit/build';
import { divisorCount, divisors, factorize, isPrime, lcmAll, powersText } from '../../kit/arith';
import { gcd, hm, lcm, num, qty } from '../../kit/format';
import type { Option, Rand, Tone } from '../../types';

// ———————————————————————————————————————————————— apoio

/** Pares (e trios) que já aparecem nas questões do banco: os geradores não os repetem. */
const BANK_SETS = new Set(
  [
    [12, 20], [10, 15], [6, 9], [12, 18], [4, 6], [6, 8], [24, 32], [24, 40], [8, 12], [9, 15], [24, 36], [8, 10],
    [18, 30], [6, 14], [9, 12], [45, 60], [5, 8], [16, 24], [14, 21], [16, 20], [18, 24], [30, 45], [150, 210],
    [84, 126], [36, 60], [84, 120], [54, 90], [87, 117], [48, 80], [91, 143], [96, 144], [360, 540], [5, 7], [7, 9],
    [15, 18, 20], [12, 15, 20], [14, 21, 28], [20, 30, 45], [4, 6, 9], [108, 180, 252], [72, 96, 120], [24, 40, 56],
  ].map((s) => [...s].sort((a, b) => a - b).join('-')),
);
const inBank = (...ns: number[]) => BANK_SETS.has([...ns].sort((a, b) => a - b).join('-'));

/** Divisões sucessivas pelo menor primo, como no "varal" da fatoração. */
function divisionSteps(n: number): string[] {
  const lines: string[] = [];
  let m = n;
  for (const [prime, e] of factorize(n)) {
    for (let k = 0; k < e; k++) {
      lines.push(`$${num(m)} ÷ ${prime} = ${num(m / prime)}`);
      m /= prime;
    }
  }
  return [...lines, `$${num(n)} = ${powersText(factorize(n))}`];
}

const clock = (minutes: number) => hm(minutes / 60);

// ———————————————————————————————————————————————— geradores

function missingDigitGen(r: Rand) {
  for (;;) {
    const digits = [r.int(1, 9), r.int(0, 9), r.int(0, 9), r.int(0, 9)];
    const pos = r.int(1, 3);
    const known = digits.reduce((s, d, i) => (i === pos ? s : s + d), 0);
    const x = (9 - (known % 9)) % 9;
    // Soma já múltipla de 9: 0 e 9 serviriam (duas respostas).
    if (x === 0) continue;
    digits[pos] = x;
    if (digits.join('') === `6${x}34`) continue; // a questão do banco
    const shown = digits.map((d, i) => (i === pos ? '?' : String(d))).join(' ');
    const n = Number(digits.join(''));
    const only3 = [x - 6, x - 3, x + 3, x + 6].filter((d) => d >= 0 && d <= 9);
    return draftNumeric({
      prompt: [p(`No número de quatro algarismos ${shown}, um algarismo foi apagado e trocado por ?. Sabe-se que o número é divisível por 9.`)],
      ask: 'Qual é o algarismo apagado?',
      answer: x,
      wrong: only3.map((d) => ({
        value: d,
        feedback: `Com ${d}, os algarismos somam ${known + d}: múltiplo de 3, mas não de 9. O número seria divisível por 3, não por 9.`,
      })),
      hints: ['Critério do 9: a soma de todos os algarismos precisa ser múltiplo de 9.', `Os algarismos conhecidos somam ${known}. Qual é o próximo múltiplo de 9?`],
      solution: [`Algarismos conhecidos: soma ${known}.`, `O próximo múltiplo de 9 é ${known + x}, então o algarismo é ${x}.`, `Confira: ${num(n)} = 9 × ${num(n / 9)}.`],
    });
  }
}

function factorGen(r: Rand) {
  for (;;) {
    const parts = ([
      [2, r.int(1, 4)],
      [3, r.int(0, 2)],
      [5, r.int(0, 1)],
      [7, r.int(0, 1)],
    ] as [number, number][]).filter(([, e]) => e > 0);
    const n = parts.reduce((t, [prime, e]) => t * prime ** e, 1);
    if (parts.length < 2 || n < 40 || n > 900) continue;
    const options: Option[] = [ok(powersText(parts))];
    const seen = new Set([options[0].text]);
    const add = (t: string, feedback: string) => {
      if (seen.has(t)) return;
      seen.add(t);
      options.push(no(t, feedback));
    };
    const [p0, e0] = parts[0];
    const composite = e0 >= 2 ? p0 ** e0 : p0 * parts[1][0];
    add(`${composite} × ${n / composite}`, `O produto dá ${n}, mas ${composite} não é primo. A fatoração usa só números primos.`);
    add(powersText([[p0, e0 + 1], ...parts.slice(1)]), `Esse produto vale ${num(2 * n)}, o dobro de ${n}: confira quantas vezes o 2 aparece nas divisões.`);
    const [pl, el] = parts[parts.length - 1];
    const missing: [number, number][] = el === 1 ? parts.slice(0, -1) : [...parts.slice(0, -1), [pl, el - 1]];
    add(powersText(missing), `Esse produto vale ${num(n / pl)}: faltou um fator ${pl}.`);
    return draftChoice({
      ask: `Qual é a fatoração em primos de ${n}?`,
      options,
      hints: ['Divida pelo menor primo possível (2, depois 3, 5, 7…) até chegar a 1.', 'Conte quantas vezes cada primo apareceu: esse é o expoente.'],
      solution: divisionSteps(n),
    });
  }
}

function divisorCountGen(r: Rand) {
  for (;;) {
    const primes = r.shuffle([2, 3, 5, 7]).slice(0, r.int(2, 3)).sort((a, b) => a - b);
    const parts = primes.map((prime) => [prime, r.int(1, 3)] as [number, number]);
    const n = parts.reduce((t, [prime, e]) => t * prime ** e, 1);
    if (n > 30000) continue;
    const exps = parts.map(([, e]) => e);
    const answer = exps.reduce((t, e) => t * (e + 1), 1);
    return draftNumeric({
      prompt: [p(`Um número N tem fatoração N = ${powersText(parts)} (ou seja, N = ${num(n)}).`)],
      ask: 'Quantos divisores positivos N tem?',
      answer,
      wrong: [
        { value: exps.reduce((t, e) => t * e, 1), feedback: 'Faltou somar 1 a cada expoente: um primo pode entrar no divisor de 0 até o expoente — são (expoente + 1) escolhas.' },
        { value: exps.reduce((t, e) => t + e + 1, 0), feedback: 'As escolhas de cada primo se combinam: multiplique (a + 1)(b + 1)…, em vez de somar.' },
        { value: exps.reduce((t, e) => t + e, 0), feedback: 'Somar os expoentes conta fatores primos, não divisores. Use (a + 1)(b + 1)….' },
      ],
      hints: ['Cada divisor escolhe o expoente de cada primo, de 0 até o expoente de N.', `Multiplique ${exps.map((e) => `(${e} + 1)`).join(' × ')}.`],
      solution: [`$${exps.map((e) => `(${e} + 1)`).join(' × ')} = ${answer}`, `${num(n)} tem ${answer} divisores.`],
    });
  }
}

const CYCLES = [
  { intro: (a: number, b: number) => `Num terminal, duas linhas de ônibus saem juntas às 7 h. Uma sai a cada ${a} minutos; a outra, a cada ${b} minutos.`, ask: 'Depois de quantos minutos elas voltam a sair juntas pela primeira vez?', unit: 'min' },
  { intro: (a: number, b: number) => `Dois faróis acabaram de piscar juntos. Um pisca a cada ${a} segundos; o outro, a cada ${b} segundos.`, ask: 'Depois de quantos segundos eles voltam a piscar juntos?', unit: 's' },
  { intro: (a: number, b: number) => `Uma loja recebe entregas de dois fornecedores: um a cada ${a} dias e o outro a cada ${b} dias. Hoje os dois entregaram.`, ask: 'Daqui a quantos dias os dois voltam a entregar no mesmo dia?', unit: 'dias' },
];
const PERIODS = [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 24, 28, 30];

function periodsGen(r: Rand) {
  for (;;) {
    const a = r.pick(PERIODS);
    const b = r.pick(PERIODS);
    if (a >= b || b % a === 0 || gcd(a, b) === 1 || inBank(a, b)) continue;
    const m = lcm(a, b);
    if (m > 180) continue;
    const ctx = r.pick(CYCLES);
    return draftNumeric({
      prompt: [p(ctx.intro(a, b))],
      ask: ctx.ask,
      unit: ctx.unit,
      answer: m,
      wrong: [
        { value: a * b, feedback: `${a} × ${b} = ${a * b} é um múltiplo comum, mas não o menor: ${a} e ${b} têm o fator ${gcd(a, b)} em comum.` },
        { value: gcd(a, b), feedback: `${gcd(a, b)} é o MDC (o maior divisor comum). Os eventos voltam a coincidir num múltiplo comum: o MMC.` },
        { value: a + b, feedback: `Somar os intervalos não dá um múltiplo dos dois: ${a + b} não é múltiplo de ${a}.` },
      ],
      hints: [`Liste os múltiplos de ${b}: ${b}, ${2 * b}, ${3 * b}… Qual é o primeiro que também é múltiplo de ${a}?`, `Ou fatore: ${powersText(factorize(a))} e ${powersText(factorize(b))}; use cada primo com o maior expoente.`],
      solution: [`$${a} = ${powersText(factorize(a))} e ${b} = ${powersText(factorize(b))}`, `$MMC = ${powersText(factorize(m))} = ${m}`],
    });
  }
}

function lcm3Gen(r: Rand) {
  for (;;) {
    const ns = [r.pick([4, 6, 8, 9, 10, 12]), r.pick([10, 12, 14, 15, 16, 18]), r.pick([15, 18, 20, 21, 24, 25, 28, 30])];
    if (new Set(ns).size < 3 || inBank(...ns)) continue;
    const m = lcmAll(ns);
    const product = ns[0] * ns[1] * ns[2];
    if (m > 720 || m === product || m === Math.max(...ns)) continue;
    const radical = factorize(m).reduce((t, [prime]) => t * prime, 1);
    const sorted = [...ns].sort((a, b) => a - b);
    return draftNumeric({
      prompt: [p(`Três prestadores de serviço visitam um condomínio a cada ${sorted[0]}, ${sorted[1]} e ${sorted[2]} dias. Hoje os três vieram no mesmo dia.`)],
      ask: 'Daqui a quantos dias os três voltam a vir no mesmo dia pela primeira vez?',
      unit: 'dias',
      answer: m,
      wrong: [
        { value: product, feedback: 'O produto dos três é um múltiplo comum, mas os números têm fatores em comum: o primeiro encontro vem bem antes.' },
        { value: radical, feedback: `Cada primo entrou com expoente 1. O MMC precisa ser múltiplo de cada número: use cada primo com o MAIOR expoente.` },
        { value: lcm(sorted[1], sorted[2]), feedback: `${lcm(sorted[1], sorted[2])} é o MMC só dos dois maiores. Ele precisa ser múltiplo de ${sorted[0]} também.` },
      ],
      hints: ['Fatore os três números.', 'MMC: todos os primos que aparecem, cada um com o maior expoente.'],
      solution: [...sorted.map((n) => `$${n} = ${powersText(factorize(n))}`), `$MMC = ${powersText(factorize(m))} = ${m} dias`],
    });
  }
}

const KIT_CTX = [
  { x: 'cadernos', y: 'lápis', who: 'Uma escola' },
  { x: 'garrafas de água', y: 'sanduíches', who: 'Uma ONG' },
  { x: 'bolas', y: 'cones', who: 'Um clube' },
  { x: 'sabonetes', y: 'toalhas', who: 'Um hotel' },
];

function kitsGen(r: Rand) {
  for (;;) {
    const g = r.pick([6, 8, 9, 12, 14, 15, 18]);
    const m = r.int(2, 8);
    const n = r.int(3, 9);
    if (m >= n || gcd(m, n) !== 1) continue;
    const a = g * m;
    const b = g * n;
    if (b > 200 || inBank(a, b)) continue;
    const ctx = r.pick(KIT_CTX);
    const what = r.pick(['kits', 'y', 'total'] as const);
    const ask = what === 'kits' ? 'Quantos kits serão montados?' : what === 'y' ? `Quantos ${ctx.y} haverá em cada kit?` : 'Quantos itens, somando os dois tipos, terá cada kit?';
    const answer = what === 'kits' ? g : what === 'y' ? n : m + n;
    const wrongs = {
      kits: [
        { value: lcm(a, b), feedback: `${lcm(a, b)} é o MMC. Repartir em grupos iguais e máximos, sem sobra, é MDC.` },
        { value: m + n, feedback: `${m + n} é o número de itens de cada kit (${m} + ${n}). A pergunta é quantos kits.` },
        { value: g % 2 === 0 ? g / 2 : g / 3, feedback: 'Esse número divide as duas quantidades, mas não é o maior: o MDC permite mais kits.' },
      ],
      y: [
        { value: g, feedback: `${g} é o número de kits (o MDC). Cada kit recebe ${b} ÷ ${g} ${ctx.y}.` },
        { value: m, feedback: `${m} é a quantidade de ${ctx.x} por kit. A pergunta é sobre os ${ctx.y}.` },
        { value: m + n, feedback: `${m + n} é o total de itens de cada kit. A pergunta é só sobre os ${ctx.y}.` },
      ],
      total: [
        { value: g, feedback: `${g} é o número de kits. Cada kit tem (${a} + ${b}) ÷ ${g} itens.` },
        { value: a + b, feedback: `${a + b} é o total de itens disponíveis, não o de cada kit.` },
        { value: n, feedback: `${n} são só os ${ctx.y} de cada kit. Some também os ${ctx.x}.` },
      ],
    }[what];
    return draftNumeric({
      prompt: [p(`${ctx.who} tem ${a} ${ctx.x} e ${b} ${ctx.y} e quer montar o maior número possível de kits idênticos, cada um com os dois itens, usando tudo, sem sobra.`)],
      ask,
      answer,
      wrong: wrongs,
      hints: ['O número de kits divide as duas quantidades: é um divisor comum — e o maior possível.', `MDC(${a}, ${b}) = ${g}. Depois, leia o que a pergunta quer.`],
      solution: [`$MDC(${a}, ${b}) = ${g} kits`, `Cada kit: ${a} ÷ ${g} = ${m} ${ctx.x} e ${b} ÷ ${g} = ${n} ${ctx.y} (${m + n} itens).`],
    });
  }
}

function cutsGen(r: Rand) {
  for (;;) {
    const g = r.pick([12, 15, 18, 20, 24, 30, 35, 40]);
    const m = r.int(2, 6);
    const n = r.int(3, 8);
    if (m >= n || gcd(m, n) !== 1) continue;
    const a = g * m;
    const b = g * n;
    if (inBank(a, b)) continue;
    const what = r.pick(['pieces', 'cuts', 'size'] as const);
    const answer = what === 'pieces' ? m + n : what === 'cuts' ? m - 1 + (n - 1) : g;
    const ask =
      what === 'pieces' ? 'Quantos pedaços ela obterá ao todo?' : what === 'cuts' ? 'Quantos cortes serão feitos ao todo (cada corte separa uma barra só)?' : 'Qual será o comprimento de cada pedaço?';
    const wrong = [
      ...(what !== 'size' ? [{ value: g, feedback: `${g} cm é o TAMANHO de cada pedaço (o MDC), não a quantidade.` }] : []),
      ...(what !== 'pieces'
        ? [{ value: m + n, feedback: `${m + n} é o número de pedaços. ${what === 'cuts' ? 'Para separar uma barra em k pedaços bastam k − 1 cortes.' : 'A pergunta é o comprimento de cada um.'}` }]
        : []),
      ...(what === 'pieces' ? [{ value: m - 1 + (n - 1), feedback: `${m - 1 + (n - 1)} é o número de cortes. Cada barra de k pedaços leva k − 1 cortes: os pedaços são um a mais por barra.` }] : []),
      { value: lcm(a, b), feedback: `${lcm(a, b)} é o MMC. Cortar em partes iguais e máximas, sem sobra, é MDC.` },
      ...(what === 'size' && g % 2 === 0 ? [{ value: g / 2, feedback: `${g / 2} cm divide as duas barras, mas não é o maior tamanho possível.` }] : []),
    ];
    return draftNumeric({
      prompt: [p(`Uma serralheira tem duas barras, de ${a} cm e de ${b} cm, e vai cortá-las em pedaços iguais, do maior comprimento possível, sem sobra.`)],
      ask,
      unit: what === 'size' ? 'cm' : what === 'cuts' ? 'cortes' : 'pedaços',
      answer,
      wrong,
      hints: ['O comprimento do pedaço divide as duas medidas: é o MDC.', `MDC(${a}, ${b}) = ${g} cm. Depois, conte o que foi pedido.`],
      solution: [
        `$MDC(${a}, ${b}) = ${g} cm`,
        `Pedaços: ${a} ÷ ${g} + ${b} ÷ ${g} = ${m} + ${n} = ${m + n}.`,
        `Cortes: cada barra de k pedaços precisa de k − 1 cortes → ${m - 1} + ${n - 1} = ${m - 1 + (n - 1)}.`,
      ],
    });
  }
}

const CLOCK_PERIODS = [12, 15, 18, 20, 24, 25, 30, 35, 40, 45];

function clockGen(r: Rand) {
  for (;;) {
    const a = r.pick(CLOCK_PERIODS);
    const b = r.pick(CLOCK_PERIODS);
    if (a >= b || inBank(a, b)) continue;
    const m = lcm(a, b);
    if (m <= 60 || m > 300 || m === a * b) continue;
    const t0 = r.int(6, 13) * 60 + r.pick([0, 10, 15, 20, 30, 40, 45]);
    const t = t0 + m;
    const misread = Math.floor(m / 100) * 60 + (m % 100);
    const wrongs = [
      ...(t0 + a * b < 24 * 60 ? [{ value: t0 + a * b, feedback: `Você usou o produto (${a * b} min). O primeiro encontro é no MMC: ${m} min.` }] : []),
      ...(m % 100 < 60 && misread !== m ? [{ value: t0 + misread, feedback: `${m} minutos não são ${clock(misread)}: uma hora tem 60 minutos (${m} min = ${clock(m)}).` }] : []),
      { value: t0 + b, feedback: `Em ${b} min só a linha mais espaçada volta a sair. Os horários coincidem no MMC (${m} min).` },
      { value: t0 + m - 60, feedback: `Confira a conversão: ${m} min = ${clock(m)}.` },
    ];
    return draftChoice({
      prompt: [p(`Duas linhas de barco partem juntas às ${clock(t0)}: uma a cada ${a} minutos e a outra a cada ${b} minutos.`)],
      ask: 'Em que horário elas voltam a partir juntas pela primeira vez?',
      options: numericOptions(
        { value: t / 60, text: clock(t) },
        wrongs.map((w) => ({ value: w.value / 60, text: clock(w.value), feedback: w.feedback })),
      ),
      hints: [`O tempo até o encontro é MMC(${a}, ${b}).`, `Converta os minutos em horas e minutos antes de somar a ${clock(t0)}.`],
      solution: [`$MMC(${a}, ${b}) = ${m} min = ${clock(m)}`, `$${clock(t0)} + ${clock(m)} = ${clock(t)}`],
      verify: () => t / 60,
    });
  }
}

function unitsGen(r: Rand) {
  for (;;) {
    const h = r.pick([18, 20, 30, 36, 40, 45, 60]);
    const d = r.pick([2, 3, 4, 5]);
    if (h === 36 && d === 4) continue; // a questão do banco
    const m = lcm(h, 24 * d);
    const days = m / 24;
    if (days > 45 || days === d) continue;
    return draftNumeric({
      prompt: [p(`Uma cantina recebe frutas a cada ${h} horas e laticínios a cada ${d} dias. Hoje, às 8 h, as duas entregas chegaram juntas.`)],
      ask: 'Depois de quantos dias as duas entregas voltam a chegar juntas pela primeira vez?',
      unit: 'dias',
      answer: days,
      wrong: [
        { value: lcm(h, d), feedback: `MMC(${h}, ${d}) mistura horas com dias. Converta antes: ${d} dias = ${24 * d} horas.` },
        { value: m, feedback: `${m} é o tempo em HORAS. A pergunta pede dias: ${m} ÷ 24.` },
        { value: (h * 24 * d) / 24, feedback: `Esse é o produto (${h} × ${24 * d} h) convertido em dias: múltiplo comum, mas não o primeiro.` },
      ],
      hints: [`Ponha tudo em horas: ${d} dias = ${24 * d} h.`, `Calcule MMC(${h}, ${24 * d}) e converta o resultado para dias.`],
      solution: [`$${d} dias = ${24 * d} h`, `$MMC(${h}, ${24 * d}) = ${m} h`, `$${m} ÷ 24 = ${days} dias`],
    });
  }
}

function waitGen(r: Rand) {
  for (;;) {
    const a = r.pick(PERIODS);
    const b = r.pick(PERIODS);
    if (a >= b || b % a === 0 || inBank(a, b)) continue;
    const m = lcm(a, b);
    if (m > 120) continue;
    const today = r.int(Math.ceil(m / 3), 2 * m - 1);
    if (today % m === 0) continue;
    const next = Math.ceil(today / m) * m;
    const wait = next - today;
    return draftNumeric({
      prompt: [p(`Dois drones saíram juntos no dia 0 e repetem as saídas a cada ${a} e a cada ${b} dias. Hoje é o dia ${today}.`)],
      ask: 'Quantos dias faltam para a próxima saída conjunta?',
      unit: 'dias',
      answer: wait,
      wrong: [
        { value: m, feedback: `${m} dias é o intervalo entre saídas conjuntas, contado do dia 0. Hoje já é o dia ${today}.` },
        { value: next, feedback: `${next} é o DIA da próxima saída conjunta. A pergunta é quantos dias faltam a partir do dia ${today}.` },
        ...(today < m ? [] : [{ value: m - (today % m) + m, feedback: 'Confira: a próxima coincidência é o primeiro múltiplo do MMC depois de hoje.' }]),
      ],
      hints: [`Saídas conjuntas: múltiplos de MMC(${a}, ${b}) = ${m}.`, `Qual é o primeiro múltiplo de ${m} depois do dia ${today}?`],
      solution: [`Saídas conjuntas nos dias ${m}, ${2 * m}, ${3 * m}…`, `A próxima depois do dia ${today} é no dia ${next}: ${wait === 1 ? 'falta' : 'faltam'} ${next} − ${today} = ${qty(wait, 'dia', 'dias')}.`],
    });
  }
}

function gearGen(r: Rand) {
  for (;;) {
    const a = r.pick([12, 15, 16, 18, 20, 21, 24, 28, 30]);
    const b = r.pick([20, 24, 28, 30, 35, 36, 40, 42, 45, 48]);
    if (a >= b || b % a === 0 || gcd(a, b) === 1 || inBank(a, b) || (a === 18 && b === 30)) continue;
    const m = lcm(a, b);
    const small = r.next() < 0.6;
    const answer = small ? m / a : m / b;
    return draftNumeric({
      prompt: [p(`Uma engrenagem de ${a} dentes está acoplada a outra de ${b} dentes. Um dente de cada uma foi pintado, e os dois dentes pintados estão se tocando agora.`)],
      ask: `Quantas voltas completas a engrenagem ${small ? 'menor' : 'maior'} terá dado quando os dentes pintados se tocarem de novo pela primeira vez?`,
      unit: 'voltas',
      answer,
      wrong: [
        { value: small ? m / b : m / a, feedback: `Essas são as voltas da engrenagem ${small ? 'maior' : 'menor'}. A ${small ? 'menor gira mais' : 'maior gira menos'}: ${m} ÷ ${small ? a : b}.` },
        { value: m, feedback: `${m} é o número de dentes que passam pelo ponto de contato (o MMC). Divida pelos dentes da engrenagem.` },
        { value: gcd(a, b), feedback: `${gcd(a, b)} é o MDC. Os dentes se reencontram depois de passarem MMC(${a}, ${b}) = ${m} dentes.` },
      ],
      hints: ['Cada dente que passa pelo contato conta para as duas engrenagens. Os pintados se reencontram num múltiplo comum dos dentes.', `MMC(${a}, ${b}) = ${m} dentes; divida pelos dentes da engrenagem pedida.`],
      solution: [`$MMC(${a}, ${b}) = ${m} dentes`, `Menor: ${m} ÷ ${a} = ${m / a} voltas; maior: ${m} ÷ ${b} = ${m / b} voltas.`],
    });
  }
}

function spacersGen(r: Rand) {
  for (;;) {
    const t = r.pick([20, 25, 30, 40, 50, 60]);
    const m = r.int(2, 9);
    const n = r.int(2, 8);
    if (gcd(m, n) !== 1 || m <= n) continue;
    const w = t * m;
    const h = t * n;
    if ((w === 420 && h === 300) || w > 600) continue; // a questão do banco
    const what = r.pick(['spacers', 'tiles'] as const);
    const spacers = (m + 1) * (n + 1);
    const tiles = m * n;
    const meters = (cm: number) => `${num(cm / 100, 2)} m`;
    return draftNumeric({
      prompt: [
        p(`Uma parede de ${meters(w)} por ${meters(h)} será revestida com azulejos quadrados iguais, de lado inteiro em centímetros, o maior possível, sem cortes.`),
        ...(what === 'spacers' ? [p('Em cada ponto onde se encontram cantos de azulejos — inclusive nas bordas e nos cantos da parede — vai um espaçador.')] : []),
      ],
      ask: what === 'spacers' ? 'Quantos espaçadores serão usados?' : 'Quantos azulejos serão usados?',
      answer: what === 'spacers' ? spacers : tiles,
      wrong: [
        ...(what === 'spacers' ? [{ value: tiles, feedback: `${tiles} é o número de azulejos (${m} × ${n}). Os pontos de encontro são um a mais em cada direção.` }] : []),
        ...(what === 'tiles' ? [{ value: spacers, feedback: `${spacers} conta os pontos de encontro dos cantos, não os azulejos.` }] : []),
        {
          value: (m - 1) * (n - 1),
          feedback: what === 'spacers' ? 'Isso conta só os pontos do meio da parede. As bordas e os cantos também têm espaçadores.' : `(${m} − 1) × (${n} − 1) descontou uma coluna e uma linha: os azulejos são ${m} × ${n}.`,
        },
        { value: 2 * (m + n), feedback: 'Isso conta só a borda — e de forma incompleta. Use a malha inteira.' },
      ],
      hints: [`Lado do azulejo: MDC(${w}, ${h}) cm.`, `São ${m} colunas e ${n} linhas de azulejos${what === 'spacers' ? '; os pontos são (colunas + 1) × (linhas + 1)' : ''}.`],
      solution: [
        `$MDC(${w}, ${h}) = ${t} cm`,
        `$${w} ÷ ${t} = ${m} colunas; ${h} ÷ ${t} = ${n} linhas`,
        what === 'spacers' ? `$(${m} + 1) × (${n} + 1) = ${spacers} espaçadores` : `$${m} × ${n} = ${tiles} azulejos`,
      ],
    });
  }
}

/** Coincidências num intervalo de observação, com regras explícitas para os extremos. */
function countGen(r: Rand) {
  for (;;) {
    const a = r.pick([4, 6, 8, 9, 10, 12, 15, 18, 20]);
    const b = r.pick([6, 9, 10, 12, 14, 15, 16, 20, 24, 25, 30]);
    if (a >= b || b % a === 0 || inBank(a, b)) continue;
    const m = lcm(a, b);
    if (m > 120) continue;
    const k = r.int(3, 7);
    const exact = r.next() < 0.5;
    const total = exact ? k * m : k * m + r.int(1, m - 1);
    const rule = r.pick(['all', 'after', 'between'] as const);
    const after = Math.floor(total / m); // k ≥ 1 com k·m ≤ total
    const counts = { all: after + 1, after, between: Math.ceil(total / m) - 1 };
    const answer = counts[rule];
    const phrase = {
      all: `contando o toque inicial e, se houver, o do instante ${total} min`,
      after: `sem contar o inicial (o do instante ${total} min conta, se houver)`,
      between: `depois do inicial e antes do instante ${total} min (que não conta)`,
    }[rule];
    const others = (['all', 'after', 'between'] as const).filter((x) => x !== rule && counts[x] !== answer);
    return draftNumeric({
      prompt: [p(`Duas sirenes tocaram juntas no instante 0 e tocam a cada ${a} e a cada ${b} minutos. A observação vai até o instante ${total} min.`)],
      ask: `Quantas vezes as duas tocam juntas, ${phrase}?`,
      answer,
      wrong: [
        ...others.map((x) => ({
          value: counts[x],
          feedback: x === 'all' ? 'Você incluiu o toque do instante 0, que a pergunta manda não contar.' : x === 'after' ? `Releia os extremos: ${rule === 'all' ? 'o toque do instante 0 também conta' : `o instante ${total} min não conta`}.` : 'Releia os extremos: a pergunta diz quais instantes contam.',
        })),
        { value: Math.floor(total / a) + Math.floor(total / b), feedback: 'Isso soma os toques de cada sirene separadamente. Os toques JUNTOS acontecem nos múltiplos do MMC.' },
        { value: Math.floor(total / (a * b)) + (rule === 'all' ? 1 : 0), feedback: `O intervalo entre toques juntos é o MMC (${m} min), não o produto (${a * b} min).` },
      ],
      hints: [`Toques juntos: nos múltiplos de MMC(${a}, ${b}) = ${m} min.`, `Liste: 0, ${m}, ${2 * m}, ${3 * m}… até ${total}, e aplique a regra dos extremos.`],
      solution: [
        `$MMC(${a}, ${b}) = ${m} min`,
        `Múltiplos de ${m} entre 1 e ${total}: ${after} (${Array.from({ length: Math.min(after, 6) }, (_, i) => (i + 1) * m).join(', ')}${after > 6 ? '…' : ''}).`,
        rule === 'all' ? `Com o inicial: ${after} + 1 = ${answer}.` : rule === 'after' ? `Sem o inicial: ${answer}.` : `Sem o inicial e sem o instante ${total}: ${answer}.`,
      ],
    });
  }
}

function remainderGen(r: Rand) {
  for (;;) {
    const d1 = r.pick([4, 5, 6, 8, 9]);
    const d2 = r.pick([6, 7, 9, 10, 12, 15]);
    if (d1 >= d2 || inBank(d1, d2)) continue;
    const rest = r.int(1, Math.min(d1, d2) - 1);
    const m = lcm(d1, d2);
    const answer = m + rest;
    return draftNumeric({
      prompt: [p(`Um estoque de peças pode ser repartido em grupos de ${d1} ou em grupos de ${d2}. Nos dois casos, forma-se pelo menos um grupo completo e ${rest > 1 ? `sobram exatamente ${rest} peças` : 'sobra exatamente 1 peça'}.`)],
      ask: 'Qual é a menor quantidade possível de peças?',
      unit: 'peças',
      answer,
      wrong: [
        { value: m, feedback: `${m} é divisível por ${d1} e por ${d2} — não sobra nada. Falta somar a sobra: ${m} + ${rest}.` },
        ...(d1 * d2 !== m ? [{ value: d1 * d2 + rest, feedback: `${d1} × ${d2} + ${rest} funciona, mas não é o menor: use o MMC (${m}), não o produto.` }] : []),
        { value: m - rest, feedback: `Quem sobra se SOMA ao múltiplo comum: ${m} + ${rest}.` },
      ],
      hints: [`Tire a sobra: N − ${rest} é divisível por ${d1} e por ${d2}.`, `Então N − ${rest} é múltiplo de MMC(${d1}, ${d2}) = ${m}.`],
      solution: [`N − ${rest} é múltiplo comum de ${d1} e ${d2}: o menor positivo é ${m}.`, `$N = ${m} + ${rest} = ${answer}`],
    });
  }
}

function offsetGen(r: Rand) {
  for (;;) {
    const a = r.pick([4, 5, 6, 8, 9, 10]);
    const b = r.pick([6, 7, 9, 10, 12, 14, 15]);
    const s = r.int(1, b - 1);
    if (a === b || inBank(a, b)) continue;
    const m = lcm(a, b);
    let t = -1;
    for (let x = s; x <= s + m; x += b) {
      if (x > 0 && x % a === 0) {
        t = x;
        break;
      }
    }
    if (t < 0 || t === m || t === s || t > 90) continue;
    return draftNumeric({
      prompt: [p(`A luz A pisca a cada ${a} s, a partir do instante 0. A luz B pisca a cada ${b} s, a partir do instante ${s} s.`)],
      ask: 'Em que instante as duas piscam juntas pela primeira vez?',
      unit: 's',
      answer: t,
      wrong: [
        { value: m, feedback: `${m} s é o MMC: seria a resposta se as duas começassem juntas. B começa no instante ${s}.` },
        { value: m + s, feedback: `Somar o atraso ao MMC não basta: teste ${m + s} — ele é múltiplo de ${a}?` },
        { value: s, feedback: `No instante ${s} só a luz B pisca (${s} não é múltiplo de ${a}).` },
      ],
      hints: [`Liste os instantes de B: ${s}, ${s + b}, ${s + 2 * b}, ${s + 3 * b}…`, `Procure na lista o primeiro múltiplo de ${a}.`],
      solution: [`Instantes de B: ${Array.from({ length: (t - s) / b + 1 }, (_, i) => s + i * b).join(', ')}.`, `O primeiro múltiplo de ${a} é ${t}: elas piscam juntas no instante ${t} s.`],
    });
  }
}

// ———————————————————————————————————————————————— visualizações dos laboratórios

function rowsViz(n: number, rows: number) {
  const q = Math.floor(n / rows);
  const s = n % rows;
  const cols = Math.max(1, q + (s > 0 ? 1 : 0));
  const cells: (Tone | null)[] = [];
  for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) cells.push(j < q ? 'brass' : i < s ? 'ember' : null);
  return {
    kind: 'grid' as const,
    rows,
    cols,
    cells,
    legend: [
      { tone: 'brass' as Tone, label: 'fichas nas fileiras' },
      ...(s ? [{ tone: 'ember' as Tone, label: `sobra (${s})` }] : []),
    ],
    summary: `${n} fichas em ${rows} fileiras: ${q} por fileira${s ? ` e sobra${s > 1 ? 'm' : ''} ${s}` : ', sem sobra'}`,
  };
}

function tilesViz(w: number, h: number, t: number) {
  const cols = Math.ceil(w / t);
  const rows = Math.ceil(h / t);
  const cutCol = w % t !== 0;
  const cutRow = h % t !== 0;
  const cells: (Tone | null)[] = [];
  for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) cells.push((cutCol && j === cols - 1) || (cutRow && i === rows - 1) ? 'ember' : 'verdigris');
  return {
    kind: 'grid' as const,
    rows,
    cols,
    cells,
    legend: [
      { tone: 'verdigris' as Tone, label: 'azulejo inteiro' },
      ...(cutCol || cutRow ? [{ tone: 'ember' as Tone, label: 'azulejo cortado' }] : []),
    ],
    summary: cutCol || cutRow ? `Azulejo de ${t} cm não cabe certo em ${w} × ${h} cm: há cortes` : `${cols} × ${rows} azulejos de ${t} cm, sem cortes`,
  };
}

function latticeViz(m: number, n: number) {
  const cols = 2 * m + 1;
  const rows = 2 * n + 1;
  const cells: (Tone | null)[] = [];
  for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) cells.push(i % 2 === 0 && j % 2 === 0 ? 'iris' : i % 2 === 1 && j % 2 === 1 ? 'brass' : null);
  return {
    kind: 'grid' as const,
    rows,
    cols,
    cells,
    legend: [
      { tone: 'brass' as Tone, label: `azulejos: ${m * n}` },
      { tone: 'iris' as Tone, label: `espaçadores: ${(m + 1) * (n + 1)}` },
    ],
    summary: `${m} × ${n} azulejos e ${(m + 1) * (n + 1)} pontos de encontro`,
  };
}

const countFormula = (n: number) => {
  const f = factorize(n);
  return f.length ? `${f.map(([, e]) => `(${e} + 1)`).join(' × ')} = ${divisorCount(n)}` : '1';
};

// ———————————————————————————————————————————————— aula

export const MMC_MDC = lesson({
  id: 'mmc-mdc',
  topic: 'basica',
  subtopics: ['mmc-mdc'],
  title: 'Múltiplos, divisores, MMC e MDC',
  summary:
    'De "quando os ônibus voltam a sair juntos?" a "qual o maior azulejo que cabe sem cortes?": divisibilidade, primos, fatoração, MMC e MDC — e como reconhecer qual deles cada problema pede.',
  requires: ['operacoes'],
  stages: [
    stage('divisibilidade', 'descoberta', 'Múltiplos, divisores e primos', 'Reconhecer múltiplos e divisores, usar os critérios de divisibilidade e identificar números primos.', () => ({
      learn: [
        text('Os **múltiplos** de 6 são os resultados da tabuada do 6: 6, 12, 18, 24… Os **divisores** de 12 são os números que dividem 12 sem deixar resto: 1, 2, 3, 4, 6 e 12. É a mesma relação vista dos dois lados: 3 é divisor de 12 porque 12 é múltiplo de 3.'),
        lab({
          title: 'Fichas em fileiras',
          intro: 'Arrume as fichas em fileiras iguais. Quando não sobra nenhuma, o número de fileiras é um divisor do número de fichas.',
          params: [
            { key: 'n', label: 'Fichas', min: 2, max: 60, step: 1, value: 12, format: (v) => `${v}` },
            { key: 'r', label: 'Fileiras', min: 1, max: 12, step: 1, value: 5, format: (v) => `${v}` },
          ],
          readouts: ({ n, r }) => {
            const q = Math.floor(n / r);
            const s = n % r;
            return [
              { label: 'Divisão', value: s === 0 ? `${n} = ${r} × ${q}` : `${n} = ${r} × ${q} + ${s}`, big: true, tone: s === 0 ? 'verdigris' : 'ember' },
              { label: 'Resultado', value: s === 0 ? `${r} é divisor de ${n}` : `${r} não é divisor de ${n} (sobra${s > 1 ? 'm' : ''} ${s})` },
              { label: `Divisores de ${n}`, value: divisors(n).join(', ') },
              { label: 'É primo?', value: isPrime(n) ? `sim: só 1 e ${n}` : `não: tem ${divisors(n).length} divisores` },
            ];
          },
          viz: ({ n, r }) => rowsViz(n, r),
          goal: {
            task: 'Encontre o número de fichas entre 30 e 40 que pode ser arrumado em 2, 3, 4 e 6 fileiras sem sobra — e mostre-o em 6 fileiras.',
            done: ({ n, r }) => n === 36 && r === 6,
            success: 'Isso: 36 é o único número entre 30 e 40 múltiplo de 2, 3, 4 e 6. E 36 = 6 × 6.',
          },
          insight: 'Um número primo só forma "retângulos" de uma fileira: seus únicos divisores são 1 e ele mesmo.',
        }),
        key('Critérios de divisibilidade', 'Por 2: termina em algarismo par. Por 3: a soma dos algarismos é múltiplo de 3. Por 4: os dois últimos algarismos formam múltiplo de 4. Por 5: termina em 0 ou 5. Por 6: é divisível por 2 e por 3. Por 9: a soma dos algarismos é múltiplo de 9. Por 10: termina em 0.'),
        example('O algarismo apagado', 'O número 2 ? 5 7 é divisível por 9. Qual é o algarismo apagado?', [
          step('Some os algarismos conhecidos:', '2 + 5 + 7 = 14'),
          askStep('A soma total precisa ser múltiplo de 9.', 'Que múltiplo de 9 a soma pode alcançar?', [
            ok('18, com o algarismo 4'),
            no('9, com um algarismo negativo', 'A soma já passa de 9 (é 14 sem o algarismo): o próximo múltiplo de 9 é 18.'),
            no('27, com o algarismo 13', 'Um algarismo vai só até 9: 14 + 13 não é possível.'),
          ], '14 + 4 = 18'),
        ], 'O algarismo é 4: 2.457 = 9 × 273.'),
        text('Um número é **primo** quando tem exatamente dois divisores: 1 e ele mesmo. Os primos até 30 são 2, 3, 5, 7, 11, 13, 17, 19, 23 e 29. Os outros números maiores que 1 são **compostos**: são produtos de números menores.'),
        reveal('Por que 1 não é primo? E por que 2 é o único primo par?', 'O 1 tem um só divisor, e primo exige exatamente dois. Todo par maior que 2 é divisível por 2 — então tem pelo menos três divisores (1, 2 e ele mesmo).'),
        warn('Parece primo, mas não é', '51 = 3 × 17, 57 = 3 × 19 e 91 = 7 × 13. Antes de afirmar que um número é primo, teste o critério do 3 e as divisões por 7, 11, 13…'),
        check(classify({
          ask: 'Classifique cada número.',
          bins: ['Primo', 'Composto', 'Nem primo nem composto'],
          items: [
            { text: '1', bin: 2, why: 'O 1 tem um só divisor.' },
            { text: '2', bin: 0, why: 'Divisores: 1 e 2. É o único primo par.' },
            { text: '29', bin: 0 },
            { text: '39', bin: 1, why: '39 = 3 × 13 (3 + 9 = 12, múltiplo de 3).' },
            { text: '51', bin: 1, why: '51 = 3 × 17 (5 + 1 = 6).' },
            { text: '53', bin: 0 },
            { text: '91', bin: 1, why: '91 = 7 × 13.' },
          ],
          solution: ['Primos: 2, 29 e 53. Compostos: 39, 51 e 91. O 1 não é primo nem composto.'],
        })),
      ],
      practice: [
        gen(missingDigitGen),
        choice({
          ask: 'Quantos números primos há entre 30 e 60?',
          options: [
            ok('7'),
            no('8', 'Algum composto entrou na conta: 51 = 3 × 17 e 57 = 3 × 19 parecem primos, mas não são.'),
            no('6', 'Faltou algum: os primos entre 30 e 60 são 31, 37, 41, 43, 47, 53 e 59.'),
            no('15', 'Você contou os ímpares. Muitos ímpares são compostos: 33, 35, 39, 45, 49…'),
          ],
          hints: ['Descarte os pares e os terminados em 5.', 'Teste os que sobram pelo critério do 3 e pela divisão por 7.'],
          solution: ['Ímpares de 31 a 59 que não terminam em 5: 31, 33, 37, 39, 41, 43, 47, 49, 51, 53, 57, 59.', 'Tirando os múltiplos de 3 (33, 39, 51, 57) e de 7 (49): sobram 31, 37, 41, 43, 47, 53 e 59.'],
          verify: () => 7,
        }),
        numeric({
          ask: 'Quantos divisores positivos tem o número 36?',
          answer: 9,
          wrong: [
            { value: 10, feedback: 'O par 6 × 6 tem o mesmo número duas vezes: o 6 conta uma vez só.' },
            { value: 8, feedback: 'Faltou um divisor. Liste em pares: 1 × 36, 2 × 18, 3 × 12, 4 × 9 e 6 × 6.' },
            { value: 7, feedback: 'Não esqueça o 1 e o próprio 36: eles também são divisores.' },
          ],
          hints: ['Liste os divisores em pares cujo produto é 36: 1 × 36, 2 × 18…', 'Pare quando os pares começarem a se repetir (depois de 6 × 6).'],
          solution: ['Pares: 1 × 36, 2 × 18, 3 × 12, 4 × 9, 6 × 6.', 'Divisores: 1, 2, 3, 4, 6, 9, 12, 18, 36 — são 9.'],
        }),
      ],
      challenge: [
        choice({
          prompt: [p('O número de quatro algarismos 3 5 ? 8 é divisível por 4 e por 3.')],
          ask: 'Qual é o maior algarismo possível no lugar de ?',
          options: [
            ok('8'),
            no('5', 'Com 5, o número 3.558 é divisível por 3, mas não por 4 (58 não é múltiplo de 4).'),
            no('2', 'O 2 também funciona (3.528), mas não é o maior possível.'),
            no('6', 'Com 6, o número 3.568 é divisível por 4, mas 3 + 5 + 6 + 8 = 22 não é múltiplo de 3.'),
          ],
          solution: ['Por 4: os dois últimos algarismos (?8) formam múltiplo de 4 → ? é par.', 'Por 3: 3 + 5 + ? + 8 = 16 + ? é múltiplo de 3 → ? = 2, 5 ou 8.', 'Par e da lista: 2 ou 8. O maior é 8 (3.588 = 12 × 299).'],
          verify: () => 8,
        }),
        gen(missingDigitGen),
        numeric({
          ask: 'Quantos múltiplos de 7 há entre 100 e 200?',
          answer: 14,
          wrong: [
            { value: 13, feedback: 'De 7 × 15 até 7 × 28 há 28 − 15 + 1 = 14 múltiplos: a contagem inclui os dois extremos.' },
            { value: 28, feedback: '28 é a quantidade de múltiplos de 7 de 1 até 200. Desconte os que ficam abaixo de 100.' },
            { value: 15, feedback: 'O primeiro múltiplo depois de 100 é 105 = 7 × 15 e o último antes de 200 é 196 = 7 × 28.' },
          ],
          solution: ['Primeiro: 105 = 7 × 15. Último: 196 = 7 × 28.', '$28 − 15 + 1 = 14 múltiplos'],
        }),
      ],
      recap: [
        'a é divisor de b quando b ÷ a é exata; então b é múltiplo de a.',
        'Critérios: 2 (par), 3 e 9 (soma dos algarismos), 4 (dois últimos), 5 (0 ou 5), 6 (2 e 3), 10 (termina em 0).',
        'Primo tem exatamente dois divisores; 1 não é primo; 2 é o único primo par.',
      ],
    })),

    stage('fatoracao', 'fundamentos', 'Fatoração em primos', 'Decompor números em fatores primos, contar divisores pela fatoração e testar se um número é primo.', () => ({
      learn: [
        text('Todo número natural maior que 1 ou é primo, ou é um produto de primos — e de um jeito só (a ordem não importa). Essa **fatoração** é a impressão digital do número: dela saem os divisores, o MMC e o MDC.'),
        mathNote('Divisões sucessivas pelo menor primo possível:', '360 ÷ 2 = 180', '180 ÷ 2 = 90', '90 ÷ 2 = 45', '45 ÷ 3 = 15', '15 ÷ 3 = 5', '5 ÷ 5 = 1', '360 = 2³ × 3² × 5'),
        lab({
          title: 'Fatorador',
          intro: 'Escolha um número e veja a fatoração e quantos divisores ele tem.',
          params: [{ key: 'n', label: 'Número', min: 2, max: 200, step: 1, value: 36, format: (v) => `${v}` }],
          readouts: ({ n }) => [
            { label: 'Fatoração', value: powersText(factorize(n)), big: true, tone: 'brass' },
            { label: 'Contagem pela fatoração', value: countFormula(n) },
            { label: `Divisores de ${n}`, value: divisors(n).join(', ') },
          ],
          viz: ({ n }) => ({
            kind: 'bars',
            bars: factorize(n).map(([prime, e]) => ({ label: `primo ${prime}`, value: e, text: `expoente ${e}` })),
            summary: `Fatoração de ${n}: ${powersText(factorize(n))}, com ${divisorCount(n)} divisores`,
          }),
          goal: {
            task: 'Encontre um número até 100 com exatamente 12 divisores.',
            done: ({ n }) => n <= 100 && divisorCount(n) === 12,
            success: 'Até 100, são 60, 72, 84, 90 e 96. Expoentes (2, 1, 1), (3, 2) ou (5, 1): em todos, o produto de (expoente + 1) dá 12.',
          },
          insight: 'O número de divisores depende só dos expoentes: some 1 a cada um e multiplique.',
        }),
        key('Quantos divisores?', `Se N = pᵃ × qᵇ × rᶜ (primos diferentes), cada divisor escolhe o expoente de p (de 0 até a), o de q (de 0 até b) e o de r (de 0 até c). Por isso N tem (a + 1) × (b + 1) × (c + 1) divisores.`),
        example('Os divisores de 72', '72 = 2³ × 3². Quantos divisores 72 tem?', [
          askStep('Um divisor de 72 tem a forma 2ˣ × 3ʸ.', 'Quais valores x pode assumir?', [
            ok('0, 1, 2 ou 3 — quatro opções'),
            no('1, 2 ou 3 — três opções', `x = 0 também vale: 2⁰ = 1, e divisores como 9 = 2⁰ × 3² não têm o fator 2.`),
            no('Só 3', 'Os divisores podem usar menos fatores 2 do que o 72 tem: 4 = 2² divide 72.'),
          ], 'x ∈ {0, 1, 2, 3}: 4 opções'),
          step('Da mesma forma, y ∈ {0, 1, 2}: 3 opções.', '4 × 3 = 12 divisores'),
        ], '72 tem 12 divisores: 1, 2, 3, 4, 6, 8, 9, 12, 18, 24, 36 e 72.'),
        strategy('É primo? Teste só até a raiz', 'Se N = a × b com a ≤ b, então a ≤ √N. Por isso, para saber se N é primo, basta dividir pelos primos até √N. Exemplo: √221 ≈ 14,9; testando 2, 3, 5, 7, 11 e 13, descobre-se 221 = 13 × 17.'),
        check(choice({
          ask: 'Qual é a fatoração em primos de 84?',
          options: [
            ok('2² × 3 × 7'),
            no('4 × 21', 'O produto dá 84, mas 4 e 21 não são primos.'),
            no('2 × 42', '42 ainda pode ser decomposto: 42 = 2 × 3 × 7.'),
            no('2 × 3² × 7', '2 × 9 × 7 = 126, não 84.'),
          ],
          solution: ['$84 ÷ 2 = 42; 42 ÷ 2 = 21; 21 ÷ 3 = 7; 7 ÷ 7 = 1', '$84 = 2² × 3 × 7'],
        })),
      ],
      practice: [
        gen(factorGen),
        gen(divisorCountGen),
        numeric({
          prompt: [p('Um terreno retangular tem 221 m² de área. As medidas dos lados, em metros, são números inteiros maiores que 1.')],
          ask: 'Qual é o perímetro do terreno?',
          unit: 'm',
          answer: 60,
          wrong: [
            { value: 30, feedback: '30 m é a soma de dois lados (13 + 17). O perímetro soma os quatro: 2 × (13 + 17).' },
            { value: 444, feedback: 'Lados de 1 m e 221 m estão excluídos: as medidas são maiores que 1.' },
          ],
          hints: ['Fatore 221: teste os primos até √221 ≈ 14,9.', '221 = 13 × 17, e os dois são primos.'],
          solution: ['221 não é divisível por 2, 3, 5, 7 nem 11; 221 ÷ 13 = 17.', 'Como 13 e 17 são primos, os lados só podem ser 13 m e 17 m.', '$2 × (13 + 17) = 60 m'],
        }),
        order({
          ask: 'Ponha em ordem a fatoração de 180.',
          steps: ['180 ÷ 2 = 90', '90 ÷ 2 = 45', '45 ÷ 3 = 15', '15 ÷ 3 = 5', '5 ÷ 5 = 1', '180 = 2² × 3² × 5'],
          hints: ['Comece pelo menor primo que divide 180.', 'Só passe para o próximo primo quando o atual não dividir mais.'],
          solution: ['Divisões pelo 2 até não dar mais, depois pelo 3, depois pelo 5.'],
        }),
      ],
      challenge: [
        numeric({
          ask: 'Quantos divisores positivos tem o número 2³ × 3² × 5?',
          answer: 24,
          wrong: [
            { value: 6, feedback: 'Faltou somar 1 a cada expoente: (3 + 1)(2 + 1)(1 + 1).' },
            { value: 9, feedback: 'As escolhas se multiplicam: (3 + 1) × (2 + 1) × (1 + 1), não se somam.' },
          ],
          solution: ['$(3 + 1) × (2 + 1) × (1 + 1) = 4 × 3 × 2 = 24'],
        }),
        numeric({
          prompt: [p('Um número N = 2ᵃ × 3² tem exatamente 15 divisores positivos.')],
          ask: 'Qual é o valor de a?',
          answer: 4,
          wrong: [
            { value: 5, feedback: 'a + 1 = 5, então a = 4. Com a = 5 seriam (5 + 1) × 3 = 18 divisores.' },
            { value: 3, feedback: 'Com a = 3, N teria (3 + 1) × (2 + 1) = 12 divisores.' },
          ],
          solution: ['$(a + 1) × (2 + 1) = 15', '$a + 1 = 5 → a = 4 (N = 2⁴ × 3² = 144)'],
        }),
        numeric({
          ask: 'Para garantir que 199 é primo, por quantos números primos é preciso dividi-lo (no mínimo)?',
          answer: 6,
          wrong: [
            { value: 7, feedback: '√199 ≈ 14,1: o 17 já passa da raiz e não precisa ser testado.' },
            { value: 14, feedback: 'Basta testar os PRIMOS até √199 ≈ 14,1: 2, 3, 5, 7, 11 e 13.' },
            { value: 5, feedback: 'O 13 também fica abaixo de √199 ≈ 14,1 e precisa ser testado.' },
          ],
          solution: ['$√199 ≈ 14,1', 'Primos até 14,1: 2, 3, 5, 7, 11, 13 — são 6 divisões (nenhuma exata, então 199 é primo).'],
        }),
        gen(divisorCountGen),
      ],
      recap: [
        'Todo número maior que 1 tem uma única fatoração em primos.',
        'N = pᵃ × qᵇ × rᶜ tem (a + 1)(b + 1)(c + 1) divisores.',
        'Para testar se N é primo, basta dividir pelos primos até √N.',
      ],
    })),

    stage('mmc', 'fundamentos', 'MMC: quando os ciclos se reencontram', 'Calcular o MMC de dois ou mais números (por múltiplos e por fatoração) e usá-lo em eventos periódicos.', () => ({
      learn: [
        text('Duas luzes acabaram de piscar juntas: uma pisca a cada 4 segundos e a outra a cada 6. A primeira pisca nos instantes 4, 8, **12**, 16, 20, **24**…; a segunda em 6, **12**, 18, **24**… Elas voltam a piscar juntas nos **múltiplos comuns** de 4 e 6 — e a primeira vez é no menor deles: o **mínimo múltiplo comum**, MMC(4, 6) = 12.'),
        lab({
          title: 'Ciclos que se reencontram',
          intro: 'Dois eventos começam juntos no instante 0 e se repetem em intervalos fixos. Mude os intervalos e veja quando eles coincidem.',
          params: [
            { key: 'a', label: 'Intervalo de A', min: 2, max: 16, step: 1, value: 4, format: (v) => `${v} min` },
            { key: 'b', label: 'Intervalo de B', min: 2, max: 16, step: 1, value: 6, format: (v) => `${v} min` },
          ],
          readouts: ({ a, b }) => [
            { label: 'Primeiro encontro (MMC)', value: `${lcm(a, b)} min`, big: true, tone: 'brass' },
            { label: 'Produto a × b', value: `${a * b} min${a * b === lcm(a, b) ? ' (= MMC: sem fator comum)' : ' (múltiplo comum, mas não o menor)'}` },
            { label: 'Encontros seguintes', value: `${2 * lcm(a, b)}, ${3 * lcm(a, b)}… min` },
          ],
          viz: ({ a, b }) => ({
            kind: 'timeline',
            length: Math.min(Math.max(2 * lcm(a, b), 30), 260),
            unit: 'minutos',
            tracks: [
              { label: `A (${a})`, period: a, tone: 'sky' },
              { label: `B (${b})`, period: b, tone: 'iris' },
            ],
            summary: `A a cada ${a}, B a cada ${b}: juntos a cada ${lcm(a, b)} minutos`,
          }),
          goal: {
            task: 'Escolha dois intervalos diferentes, ambos menores que 16 minutos, que só voltem a coincidir aos 60 minutos.',
            done: ({ a, b }) => a !== b && a < 16 && b < 16 && lcm(a, b) === 60,
            success: 'Pares como 12 e 15, 4 e 15, 5 e 12 ou 10 e 12 funcionam: 60 = 2² × 3 × 5, e juntos os dois intervalos precisam ter todos esses fatores.',
          },
          insight: 'Quando os intervalos têm fator comum (como 4 e 6), o encontro vem antes do produto: 12 em vez de 24.',
        }),
        key('MMC pela fatoração', 'Fatore os números e multiplique **todos** os primos que aparecem, cada um com o **maior** expoente. 12 = 2² × 3 e 18 = 2 × 3² → MMC = 2² × 3² = 36.'),
        warn('O produto nem sempre é o MMC', '12 × 18 = 216 é múltiplo comum, mas não o menor: os fatores comuns entram duas vezes. O produto só é o MMC quando os números não têm fator primo em comum (como 4 e 9).'),
        example('Três ciclos', 'Três faróis piscaram juntos agora: um pisca a cada 8 s, outro a cada 12 s e o terceiro a cada 15 s. Quando voltam a piscar juntos?', [
          step('Fatore:', '8 = 2³', '12 = 2² × 3', '15 = 3 × 5'),
          askStep('Cada primo entra uma vez no MMC.', 'Com que expoente o 2 entra?', [
            ok('3, o maior expoente'),
            no('2, o menor expoente', 'O menor expoente é a regra do MDC. O MMC precisa ser múltiplo de 8 = 2³, então leva 2³.'),
            no('5, a soma dos expoentes', 'Somar os expoentes equivale a multiplicar 8 × 12: dá um múltiplo comum, mas não o menor.'),
          ], 'MMC = 2³ × 3 × 5'),
          step('Multiplique:', '2³ × 3 × 5 = 120 s'),
        ], 'Voltam a piscar juntos 120 s (2 min) depois.'),
        check(choice({
          ask: 'Qual é o MMC de 10 e 25?',
          options: [
            ok('50'),
            no('250', '250 = 10 × 25 é múltiplo comum, mas 10 e 25 têm o fator 5 em comum: o menor é 50.'),
            no('5', '5 é o MDC (maior divisor comum), não o MMC.'),
            no('35', 'Somar os números não dá um múltiplo comum: 35 não é múltiplo de 10.'),
          ],
          solution: ['10 = 2 × 5 e 25 = 5²', 'MMC = 2 × 5² = 50'],
          verify: () => 50,
        })),
        mathNote('Para dois números, MMC e MDC se completam:', 'MMC(a, b) × MDC(a, b) = a × b', 'MMC(12, 18) = [[12 × 18|6]] = 36'),
        tip('Múltiplos acima de um limite', 'Todo múltiplo comum é múltiplo do MMC. "O menor número maior que 200 divisível por 6, 8 e 10" é o primeiro múltiplo de MMC(6, 8, 10) = 120 que passa de 200: 240.'),
      ],
      practice: [
        gen(periodsGen),
        gen(lcm3Gen),
        choice({
          ask: 'Em qual par o MMC é igual ao produto dos números?',
          options: [
            ok('8 e 9'),
            no('6 e 9', 'MMC(6, 9) = 18, mas 6 × 9 = 54: os dois têm o fator 3 em comum.'),
            no('4 e 10', 'MMC(4, 10) = 20, mas 4 × 10 = 40: os dois têm o fator 2 em comum.'),
            no('12 e 15', 'MMC(12, 15) = 60, mas 12 × 15 = 180: os dois têm o fator 3 em comum.'),
          ],
          hints: ['O produto é o MMC quando os números não têm nenhum fator primo em comum.', '8 = 2³ e 9 = 3²: algum primo em comum?'],
          solution: ['8 = 2³ e 9 = 3² não têm primos em comum: MMC = 8 × 9 = 72.'],
        }),
        numeric({
          ask: 'Qual é o menor número maior que 200 que é divisível por 6, por 8 e por 10?',
          answer: 240,
          wrong: [
            { value: 120, feedback: '120 é o MMC, mas a pergunta pede um número maior que 200: o próximo múltiplo de 120.' },
            { value: 480, feedback: '480 funciona, mas não é o menor: 240 = 2 × 120 já passa de 200.' },
            { value: 210, feedback: '210 não é divisível por 8 (nem por 4).' },
          ],
          hints: ['Todo múltiplo comum de 6, 8 e 10 é múltiplo do MMC deles.', 'MMC(6, 8, 10) = 120. Qual é o primeiro múltiplo de 120 acima de 200?'],
          solution: ['$MMC(6, 8, 10) = 2³ × 3 × 5 = 120', 'Múltiplos: 120, 240… O primeiro acima de 200 é 240.'],
        }),
      ],
      challenge: [
        numeric({
          prompt: [p('Três sinais luminosos piscaram juntos às 20 h. Eles piscam a cada 18 s, 24 s e 40 s.')],
          ask: 'Depois de quantos segundos voltam a piscar juntos pela primeira vez?',
          unit: 's',
          answer: 360,
          wrong: [
            { value: 17280, feedback: '18 × 24 × 40 é múltiplo comum, mas os números têm fatores em comum: o MMC é bem menor.' },
            { value: 120, feedback: '2³ × 3 × 5 = 120 não é múltiplo de 18 = 2 × 3²: o 3 precisa entrar ao quadrado.' },
            { value: 72, feedback: '72 é o MMC só de 18 e 24. Ele precisa ser múltiplo de 40 também.' },
          ],
          solution: ['18 = 2 × 3²; 24 = 2³ × 3; 40 = 2³ × 5.', '$MMC = 2³ × 3² × 5 = 360 s'],
        }),
        gen(periodsGen),
        numeric({
          ask: 'O MDC de 24 e de um número n é 8, e o MMC dos dois é 120. Qual é n?',
          answer: 40,
          wrong: [
            { value: 960, feedback: '960 = 8 × 120 é o produto 24 × n. Ainda falta dividir por 24.' },
            { value: 5, feedback: '120 ÷ 24 = 5, mas o MDC(24, 5) seria 1, não 8. Use MMC × MDC = 24 × n.' },
          ],
          solution: ['$MMC × MDC = 24 × n', '$120 × 8 = 24 × n → n = 960 ÷ 24 = 40', 'Confira: MDC(24, 40) = 8 e MMC(24, 40) = 120.'],
        }),
        gen(lcm3Gen),
      ],
      recap: [
        'Eventos que começam juntos voltam a coincidir a cada MMC dos intervalos.',
        'MMC pela fatoração: todos os primos, cada um com o maior expoente.',
        'O produto é múltiplo comum; só é o MMC quando os números não têm fator comum.',
        'MMC(a, b) × MDC(a, b) = a × b.',
      ],
    })),

    stage('mdc', 'fundamentos', 'MDC: partes iguais e máximas', 'Calcular o MDC (por fatoração e por divisões sucessivas) e usá-lo para repartir, cortar e simplificar sem sobra.', () => ({
      learn: [
        text('Uma professora tem 24 lápis e 36 borrachas e quer montar kits iguais, sem sobrar nada, com o maior número possível de kits. O número de kits precisa dividir 24 e 36: é um **divisor comum**. O maior deles é o **máximo divisor comum**, MDC(24, 36) = 12 — são 12 kits, cada um com 2 lápis e 3 borrachas.'),
        lab({
          title: 'Ladrilhos sem corte',
          intro: 'Escolha as medidas da parede e o lado do azulejo quadrado. Azulejos cortados aparecem em vermelho.',
          params: [
            { key: 'w', label: 'Largura', min: 60, max: 240, step: 20, value: 200, format: (v) => `${v} cm` },
            { key: 'h', label: 'Altura', min: 60, max: 240, step: 20, value: 120, format: (v) => `${v} cm` },
            { key: 't', label: 'Lado do azulejo', min: 20, max: 120, step: 10, value: 30, format: (v) => `${v} cm` },
          ],
          readouts: ({ w, h, t }) => {
            const fits = w % t === 0 && h % t === 0;
            return [
              { label: 'Cabe sem cortes?', value: fits ? `sim: ${w / t} × ${h / t} = ${(w / t) * (h / t)} azulejos` : `não: ${w % t ? `${w} ÷ ${t} não é exata` : `${h} ÷ ${t} não é exata`}`, big: true, tone: fits ? 'verdigris' : 'ember' },
              { label: 'Maior azulejo sem cortes', value: `MDC(${w}, ${h}) = ${gcd(w, h)} cm` },
            ];
          },
          viz: ({ w, h, t }) => tilesViz(w, h, t),
          goal: {
            task: 'Para uma parede de 180 cm × 120 cm, escolha o maior azulejo que cobre tudo sem cortes.',
            done: ({ w, h, t }) => w === 180 && h === 120 && t === 60,
            success: 'Isso: 60 cm = MDC(180, 120). São 3 × 2 = 6 azulejos. Qualquer lado maior deixaria cortes.',
          },
          insight: 'Os azulejos que servem são os divisores comuns das medidas; o maior deles é o MDC.',
        }),
        key('MDC pela fatoração', 'Use só os primos **comuns** a todos os números, cada um com o **menor** expoente. 60 = 2² × 3 × 5 e 90 = 2 × 3² × 5 → MDC = 2 × 3 × 5 = 30.'),
        mathNote('Ou pelas divisões sucessivas (algoritmo de Euclides): divida o maior pelo menor; depois, o divisor pelo resto, até o resto dar zero. O último divisor é o MDC.', '150 = 1 × 90 + 60', '90 = 1 × 60 + 30', '60 = 2 × 30 + 0', 'MDC(150, 90) = 30'),
        example('Cortar sem sobra', 'Um marceneiro tem duas ripas, de 90 cm e de 150 cm, e vai cortá-las em pedaços iguais, do maior tamanho possível, sem sobra.', [
          step('O tamanho do pedaço precisa dividir 90 e 150: é um divisor comum. O maior é o MDC.', 'MDC(90, 150) = 30 cm'),
          askStep('A pergunta é quantos pedaços ele obtém.', 'Como contar os pedaços?', [
            ok('90 ÷ 30 + 150 ÷ 30 = 3 + 5'),
            no('A resposta é 30', '30 cm é o TAMANHO de cada pedaço, não a quantidade.'),
            no('MMC(90, 150) ÷ 30 = 15', 'O MMC (450) não tem papel aqui: cada ripa é cortada separadamente.'),
          ], '3 + 5 = 8 pedaços'),
        ], 'São 8 pedaços de 30 cm.'),
        warn('Tamanho, quantidade ou conteúdo?', 'Nos kits, o MDC é o NÚMERO de kits, e o conteúdo de cada kit são os quocientes (24 ÷ 12 = 2 lápis). Nos cortes, o MDC é o TAMANHO do pedaço, e a quantidade de pedaços são os quocientes. Releia a pergunta antes de responder.'),
        check(choice({
          ask: 'Qual é o MDC de 48 e 72?',
          options: [
            ok('24'),
            no('144', '144 é o MMC, o menor múltiplo comum. O MDC é um divisor: nunca é maior que os números.'),
            no('12', '12 divide os dois, mas não é o maior divisor comum: 24 também divide.'),
            no('6', '6 é divisor comum, mas existem maiores (12 e 24).'),
          ],
          solution: ['48 = 2⁴ × 3 e 72 = 2³ × 3²', 'MDC = 2³ × 3 = 24'],
          verify: () => 24,
        })),
        text('O MDC também simplifica frações de uma vez: dividindo numerador e denominador pelo MDC, a fração já sai **irredutível**. Como MDC(84, 120) = 12, temos [[84|120]] = [[7|10]].'),
        reveal('Uma turma vai repartir igualmente 42 figurinhas e 70 adesivos, sem sobra, entre mais de 7 alunos. Quantos alunos podem participar?', 'O número de alunos divide 42 e 70: é um divisor de MDC(42, 70) = 14. Os divisores de 14 são 1, 2, 7 e 14; com mais de 7 alunos, só 14 serve.'),
        tip('Desconte antes de dividir', 'Se parte do estoque fica reservada ("primeiro separa 12 kg para a cozinha"), calcule o MDC das quantidades que realmente serão repartidas.'),
      ],
      practice: [
        gen(kitsGen),
        gen(cutsGen),
        numeric({
          ask: 'Use as divisões sucessivas para calcular o MDC de 323 e 221.',
          answer: 17,
          wrong: [
            { value: 1, feedback: 'Os dois números têm um fator em comum. Continue as divisões: 323 = 1 × 221 + 102; 221 = 2 × 102 + 17…' },
            { value: 102, feedback: '102 é só o primeiro resto. Continue: 221 ÷ 102 deixa resto 17, e 102 ÷ 17 é exata.' },
            { value: 13, feedback: '13 divide 221, mas não divide 323 (323 = 17 × 19).' },
          ],
          hints: ['Divida 323 por 221 e anote o resto.', 'Depois divida 221 pelo resto, e assim por diante, até a divisão ser exata.'],
          solution: ['$323 = 1 × 221 + 102', '$221 = 2 × 102 + 17', '$102 = 6 × 17 + 0', 'MDC(323, 221) = 17'],
        }),
        numeric({
          prompt: [p('A fração 84/120 indica a parte de um álbum que já foi completada.')],
          ask: 'Na forma irredutível, qual é o denominador da fração?',
          answer: 10,
          wrong: [
            { value: 60, feedback: 'Dividir só por 2 (84/120 = 42/60) ainda deixa a fração redutível. Divida pelo MDC: 12.' },
            { value: 120, feedback: 'Esse é o denominador original. Simplifique dividindo pelo MDC(84, 120) = 12.' },
            { value: 30, feedback: 'Dividir por 4 (21/30) ainda deixa o fator 3 em comum. Use o MDC: 12.' },
          ],
          hints: ['Calcule MDC(84, 120).', 'Divida numerador e denominador pelo MDC.'],
          solution: ['$MDC(84, 120) = 12', '$[[84|120]] = [[84 ÷ 12|120 ÷ 12]] = [[7|10]]'],
        }),
      ],
      challenge: [
        numeric({
          prompt: [p('Uma ONG recebeu 60 cadernos, 90 lápis e 150 borrachas e vai montar o maior número possível de kits idênticos, usando tudo.')],
          ask: 'Quantos itens, ao todo, terá cada kit?',
          answer: 10,
          wrong: [
            { value: 30, feedback: '30 é o número de kits (o MDC). Cada kit tem 60 ÷ 30 + 90 ÷ 30 + 150 ÷ 30 itens.' },
            { value: 300, feedback: '300 é o total de itens recebidos, não o de cada kit.' },
            { value: 20, feedback: 'Com 15 kits haveria 20 itens por kit, mas 15 não é o maior número de kits possível: MDC(60, 90, 150) = 30.' },
          ],
          solution: ['$MDC(60, 90, 150) = 30 kits', 'Cada kit: 2 cadernos + 3 lápis + 5 borrachas = 10 itens.'],
        }),
        gen(cutsGen),
        numeric({
          prompt: [p('Um terreno retangular de 120 m por 84 m será cercado com estacas igualmente espaçadas, com a maior distância possível entre estacas vizinhas e uma estaca em cada canto.')],
          ask: 'Quantas estacas serão usadas?',
          unit: 'estacas',
          answer: 34,
          wrong: [
            { value: 38, feedback: 'Você contou cada canto duas vezes (uma em cada lado). Num contorno fechado, há tantas estacas quanto intervalos.' },
            { value: 12, feedback: '12 m é a distância entre estacas (o MDC), não a quantidade.' },
            { value: 17, feedback: 'Essa é só a metade do contorno (10 + 7 intervalos). Some os quatro lados.' },
          ],
          solution: ['$MDC(120, 84) = 12 m', 'Intervalos: 120 ÷ 12 = 10 em cada lado maior e 84 ÷ 12 = 7 em cada lado menor.', '$2 × (10 + 7) = 34 intervalos = 34 estacas (contorno fechado)'],
        }),
        gen(kitsGen),
      ],
      recap: [
        'Repartir ou cortar em partes iguais e máximas, sem sobra: MDC.',
        'MDC pela fatoração: só os primos comuns, cada um com o menor expoente — ou pelas divisões sucessivas.',
        'Leia a pergunta: número de kits (MDC), conteúdo de cada kit (quocientes), tamanho do pedaço (MDC) ou número de pedaços (quocientes).',
        'Dividir numerador e denominador pelo MDC deixa a fração irredutível.',
      ],
    })),

    stage('mmc-ou-mdc', 'interpretacao', 'MMC ou MDC? Lendo o problema', 'Reconhecer qual conceito o enunciado pede, converter unidades e transformar o resultado na resposta pedida (horário, data, voltas, embalagens).', () => ({
      learn: [
        text('Os enunciados não dizem "calcule o MMC". Eles contam uma história, e é preciso reconhecer a estrutura: algo que **se repete até coincidir** ou que **se junta até formar um total igual** pede MMC; algo que **se reparte ou se corta em partes iguais** pede MDC.'),
        compare(
          [
            { title: 'MMC', tone: 'brass', lines: ['Eventos periódicos que voltam a coincidir', 'Embalagens de tamanhos diferentes com totais iguais', 'Montar um quadrado ou cubo com peças iguais', 'A resposta é MAIOR ou igual aos números'] },
            { title: 'MDC', tone: 'verdigris', lines: ['Cortar em pedaços iguais e máximos', 'Repartir em grupos iguais, sem sobra', 'Revestir um retângulo com o maior quadrado', 'A resposta é MENOR ou igual aos números'] },
          ],
          'Como reconhecer',
        ),
        check(classify({
          ask: 'Cada situação pede MMC ou MDC?',
          bins: ['MMC', 'MDC'],
          items: [
            { text: 'Dois remédios tomados juntos agora: quando coincidem de novo?', bin: 0 },
            { text: 'Cortar duas cordas em pedaços iguais, os maiores possíveis', bin: 1 },
            { text: 'Comprar pacotes de 6 e de 8 copos para ter o mesmo número de cada', bin: 0 },
            { text: 'Montar o maior número de cestas iguais com 30 maçãs e 45 peras', bin: 1 },
            { text: 'Empilhar tijolos iguais até formar um cubo', bin: 0, why: 'A aresta do cubo é múltipla de cada medida do tijolo.' },
            { text: 'Cobrir um piso retangular com o maior ladrilho quadrado inteiro', bin: 1, why: 'O lado do ladrilho divide as duas medidas do piso.' },
          ],
          solution: ['MMC: coincidências, totais iguais com embalagens diferentes, montar figuras maiores.', 'MDC: cortar, repartir, ladrilhar sem cortes.'],
        })),
        strategy('Mesma unidade antes de tudo', 'Se um fornecedor vem a cada 30 horas e outro a cada 2 dias, converta: 2 dias = 48 h. MMC(30, 48) = 240 h = 10 dias. Calcular o MMC de 30 e 2 misturando unidades dá um número sem sentido.'),
        example('Que horas serão?', 'Duas linhas de barco partem juntas às 6 h 40 min: uma a cada 25 minutos e a outra a cada 30 minutos.', [
          step('O tempo até o próximo encontro é o MMC:', 'MMC(25, 30) = 150 min'),
          askStep('Agora é preciso converter para horas.', 'Quanto é 150 minutos?', [
            ok('2 h 30 min'),
            no('1 h 50 min', 'Os minutos não são decimais da hora: 150 = 2 × 60 + 30, ou seja, 2 h 30 min.'),
            no('1 h 30 min', 'Uma hora tem 60 minutos: 150 minutos são 2 horas (120 min) e mais 30.'),
          ], '150 min = 2 h 30 min'),
          step('Some ao horário de partida:', '6 h 40 min + 2 h 30 min = 9 h 10 min'),
        ], 'As linhas voltam a partir juntas às 9 h 10 min.'),
        warn('O que a pergunta quer?', 'Depois do MMC ou do MDC, ainda falta responder: o horário (some ao início), a data (some à data inicial), quanto falta a partir de hoje (próximo múltiplo − hoje), o número de voltas (MMC ÷ tempo de uma volta) ou o número de embalagens (MMC ÷ tamanho de cada uma).'),
        example('Quantas voltas?', 'Ana e Caio partem juntos do mesmo ponto de uma pista. Ana completa uma volta em 20 minutos; Caio, em 36 minutos.', [
          step('Eles se reencontram no ponto de partida após o MMC dos tempos:', 'MMC(20, 36) = 180 min'),
          askStep('A pergunta é quantas voltas Ana terá dado nesse momento.', 'Qual é a conta?', [
            ok('180 ÷ 20 = 9 voltas'),
            no('180 ÷ 36 = 5 voltas', 'Essas são as voltas de Caio, que é mais lento.'),
            no('36 ÷ 20 = 1,8 volta', 'Eles só se reencontram no ponto de partida quando os dois completaram voltas inteiras.'),
          ], '180 ÷ 20 = 9'),
        ], 'Ana terá completado 9 voltas (e Caio, 5).'),
        check(numeric({
          prompt: [p('Copos descartáveis são vendidos em pacotes de 6 e pratos, em pacotes de 15. Joana quer comprar o mesmo número de copos e de pratos, o menor possível, com pelo menos um pacote de cada.')],
          ask: 'Quantos pacotes ela compra ao todo?',
          answer: 7,
          wrong: [
            { value: 30, feedback: '30 é o número de copos (e de pratos). A pergunta é o número de pacotes: 30 ÷ 6 + 30 ÷ 15.' },
            { value: 21, feedback: 'Você somou os tamanhos dos pacotes. O total comum é o MMC: 30.' },
            { value: 3, feedback: '3 é o MDC de 6 e 15. Aqui os totais precisam coincidir: use o MMC (30).' },
          ],
          solution: ['MMC(6, 15) = 30 copos e 30 pratos.', '$30 ÷ 6 + 30 ÷ 15 = 5 + 2 = 7 pacotes'],
        })),
      ],
      practice: [
        classify({
          ask: 'Cada situação pede MMC ou MDC?',
          bins: ['MMC', 'MDC'],
          items: [
            { text: 'Dois atletas correm numa pista circular: quando se reencontram na largada?', bin: 0 },
            { text: 'Distribuir 48 cartões e 80 fichas igualmente entre alunos, sem sobra', bin: 1 },
            { text: 'Gastar a mesma quantia comprando itens de R$ 15 e de R$ 25', bin: 0, why: 'A quantia gasta em cada item é múltiplo do seu preço.' },
            { text: 'Simplificar a fração 72/108 de uma vez', bin: 1 },
            { text: 'Achar o menor painel quadrado feito com placas de 15 cm × 25 cm', bin: 0 },
            { text: 'Plantar árvores igualmente espaçadas, o mais longe possível, nos lados de um terreno', bin: 1, why: 'O espaçamento divide as medidas dos lados.' },
          ],
          hints: ['Juntar até coincidir → MMC.', 'Repartir ou cortar em partes iguais e máximas → MDC.'],
          solution: ['MMC: reencontros, gastos iguais, painel montado com placas.', 'MDC: distribuir sem sobra, simplificar, espaçar o máximo possível.'],
        }),
        gen(clockGen),
        gen(unitsGen),
        numeric({
          prompt: [p('Uma artesã compra rolos de fita a R$ 15,00 cada e caixas de botões a R$ 25,00 cada. Ela quer gastar a mesma quantia com cada produto, comprando pelo menos um de cada e gastando o menos possível.')],
          ask: 'Quantos itens ela compra, somando rolos e caixas?',
          answer: 8,
          wrong: [
            { value: 75, feedback: 'R$ 75,00 é quanto ela gasta com CADA produto (o MMC). Os itens são 75 ÷ 15 + 75 ÷ 25.' },
            { value: 2, feedback: 'Um de cada daria gastos diferentes (R$ 15 e R$ 25). O gasto igual é um múltiplo comum dos preços.' },
            { value: 5, feedback: '5 é o número de rolos de fita. Some também as caixas de botões (75 ÷ 25 = 3).' },
          ],
          hints: ['O gasto com cada produto é múltiplo do preço dele: tem de ser múltiplo comum de 15 e 25.', 'O menor gasto é MMC(15, 25) = 75 reais com cada produto.'],
          solution: ['$MMC(15, 25) = 75', 'Rolos: 75 ÷ 15 = 5; caixas: 75 ÷ 25 = 3.', '$5 + 3 = 8 itens'],
        }),
        gen(waitGen),
      ],
      challenge: [
        gen(clockGen),
        choice({
          prompt: [p('Um paciente toma o remédio A de 8 em 8 horas e o remédio B de 12 em 12 horas. Ele tomou os dois juntos às 6 h de uma segunda-feira.')],
          ask: 'Quando ele volta a tomar os dois juntos pela primeira vez?',
          options: [
            ok('Às 6 h de terça-feira'),
            no('Às 18 h de segunda-feira', 'Em 12 h só o remédio B coincide com o horário; o A cai às 14 h e às 22 h. O encontro é no MMC (24 h).'),
            no('Às 2 h de terça-feira', 'Isso soma os intervalos (8 + 12 = 20 h). O encontro é no MMC: 24 h.'),
            no('Às 6 h de sexta-feira', 'Isso usa o produto (8 × 12 = 96 h = 4 dias). O primeiro encontro é antes: MMC(8, 12) = 24 h.'),
          ],
          solution: ['$MMC(8, 12) = 24 h', '6 h de segunda + 24 h = 6 h de terça-feira.'],
        }),
        numeric({
          prompt: [p('Três ciclistas partem juntos da largada de uma pista. As voltas deles duram 6, 8 e 10 minutos.')],
          ask: 'Quantas voltas o mais rápido terá completado quando os três estiverem juntos na largada pela primeira vez?',
          unit: 'voltas',
          answer: 20,
          wrong: [
            { value: 12, feedback: '12 voltas é o que o mais LENTO completa (120 ÷ 10). O mais rápido faz a volta em 6 minutos.' },
            { value: 120, feedback: '120 minutos é o tempo até o encontro (o MMC). Divida pelo tempo de uma volta do mais rápido.' },
            { value: 15, feedback: '15 voltas é o que faz o ciclista de 8 minutos. O mais rápido é o de 6 minutos.' },
          ],
          solution: ['$MMC(6, 8, 10) = 120 min', 'Mais rápido (6 min por volta): 120 ÷ 6 = 20 voltas.'],
        }),
        gen(unitsGen),
        gen(waitGen),
      ],
      recap: [
        'Repetir até coincidir, ou juntar até igualar totais: MMC. Repartir ou cortar em partes iguais e máximas: MDC.',
        'Converta tudo para a mesma unidade antes de calcular.',
        'Depois do MMC ou do MDC, responda a pergunta: horário, data, espera a partir de hoje, voltas, embalagens.',
        '150 minutos são 2 h 30 min, não 1 h 50 min.',
      ],
    })),

    stage('aplicacoes', 'aplicacoes', 'Ladrilhos, caixas, engrenagens e contagens', 'Resolver problemas espaciais e de contagem com MMC e MDC: espaçadores, cubos e quadrados montados com peças, engrenagens, postes e coincidências num intervalo.', () => ({
      learn: [
        text('Alguns dos problemas mais cobrados de MMC e MDC acontecem no espaço: revestir paredes, montar painéis e cubos, engrenar rodas dentadas, cercar terrenos. A conta principal é a mesma; o cuidado está em **contar certo** o que foi pedido.'),
        lab({
          title: 'Malha de azulejos',
          intro: 'Monte a malha com m colunas e n linhas de azulejos. Os pontos lilás são os encontros de cantos — onde vão os espaçadores.',
          params: [
            { key: 'm', label: 'Colunas', min: 1, max: 7, step: 1, value: 3, format: (v) => `${v}` },
            { key: 'n', label: 'Linhas', min: 1, max: 7, step: 1, value: 3, format: (v) => `${v}` },
          ],
          readouts: ({ m, n }) => [
            { label: 'Azulejos', value: `${m} × ${n} = ${m * n}` },
            { label: 'Espaçadores', value: `(${m} + 1) × (${n} + 1) = ${(m + 1) * (n + 1)}`, big: true, tone: 'iris' },
          ],
          viz: ({ m, n }) => latticeViz(m, n),
          goal: {
            task: 'Monte uma malha que use exatamente 30 espaçadores.',
            done: ({ m, n }) => (m + 1) * (n + 1) === 30,
            success: 'Isso: (m + 1) × (n + 1) = 30 com 4 × 5 azulejos (ou 5 × 4). A malha de pontos tem sempre uma linha e uma coluna a mais que a de azulejos.',
          },
          insight: 'É o raciocínio das cercas: 5 postes delimitam 4 vãos. Em cada direção, há um ponto a mais que peças.',
        }),
        key('Pontos de uma malha', 'Numa malha de m colunas por n linhas de azulejos há (m + 1) × (n + 1) pontos de encontro. Já num contorno FECHADO (estacas em volta de um terreno), estacas e intervalos são em número igual; numa linha ABERTA (uma corda cortada), k pedaços pedem k − 1 cortes.'),
        example('A parede de azulejos', 'Uma parede de 2,4 m por 1,8 m será revestida com azulejos quadrados iguais, de lado inteiro em centímetros, o maior possível, sem cortes. Em cada ponto onde se encontram cantos de azulejos (inclusive nas bordas) vai um espaçador.', [
          step('Converta para centímetros e ache o maior lado:', 'MDC(240, 180) = 60 cm'),
          step('Azulejos em cada direção:', '240 ÷ 60 = 4 colunas e 180 ÷ 60 = 3 linhas'),
          askStep('Agora os espaçadores.', 'Quantos são?', [
            ok('(4 + 1) × (3 + 1) = 20'),
            no('4 × 3 = 12', 'Esse é o número de azulejos. Os pontos de encontro são um a mais em cada direção.'),
            no('2 × (4 + 3) = 14', 'Isso conta só a borda (e de forma incompleta): há pontos também no meio da parede.'),
          ], '5 × 4 = 20 espaçadores'),
        ], 'São 12 azulejos e 20 espaçadores.'),
        text('**Montar um quadrado ou um cubo** com peças iguais, todas na mesma posição, exige que o lado seja múltiplo das medidas da peça: o menor lado é o MMC delas. O número de peças é o produto das quantidades em cada direção.'),
        example('O cubo de tijolos', 'Tijolos de 10 cm × 15 cm × 20 cm serão empilhados, todos na mesma posição, até formar um cubo maciço.', [
          askStep('A aresta do cubo precisa ser múltipla de 10, 15 e 20.', 'Qual é a menor aresta?', [
            ok('60 cm, o MMC'),
            no('5 cm, o MDC', 'Uma aresta de 5 cm é menor que o próprio tijolo: o cubo é montado juntando tijolos, então a aresta é múltipla das medidas.'),
            no('3.000 cm, o produto', '10 × 15 × 20 = 3.000 é o volume do tijolo em cm³, não uma aresta.'),
          ], 'MMC(10, 15, 20) = 60 cm'),
          step('Tijolos em cada direção:', '60 ÷ 10 = 6; 60 ÷ 15 = 4; 60 ÷ 20 = 3', '6 × 4 × 3 = 72 tijolos'),
        ], 'O menor cubo tem 60 cm de aresta e usa 72 tijolos.'),
        key('Engrenagens', 'Duas engrenagens acopladas trocam um dente por vez. Dois dentes marcados voltam a se tocar quando passou pelo contato um número de dentes múltiplo dos dois totais: o MMC. As voltas de cada engrenagem são o MMC dividido pelo seu número de dentes.'),
        check(numeric({
          prompt: [p('Uma engrenagem de 18 dentes está acoplada a outra de 30 dentes. Um dente de cada uma foi marcado, e os dois dentes marcados estão se tocando agora.')],
          ask: 'Quantas voltas a engrenagem menor dá até os dentes marcados se tocarem de novo?',
          unit: 'voltas',
          answer: 5,
          wrong: [
            { value: 3, feedback: '3 voltas é o que a engrenagem MAIOR dá (90 ÷ 30). A menor gira mais: 90 ÷ 18.' },
            { value: 90, feedback: '90 é o número de dentes que passam pelo contato (o MMC). Divida pelos 18 dentes da menor.' },
            { value: 6, feedback: '6 é o MDC de 18 e 30. Os dentes voltam a se encontrar no MMC (90 dentes): 90 ÷ 18.' },
          ],
          solution: ['MMC(18, 30) = 90 dentes.', 'Menor: 90 ÷ 18 = 5 voltas (a maior dá 90 ÷ 30 = 3).'],
        })),
        strategy('Contando coincidências num intervalo', 'Se dois sinais tocam juntos às 7 h e voltam a coincidir a cada 40 min, quantas vezes tocam juntos até as 10 h? 180 ÷ 40 = 4,5 → 4 coincidências depois do início, mais a das 7 h: 5. Sempre confira se o instante inicial e o final entram na conta.'),
      ],
      practice: [
        gen(gearGen),
        gen(spacersGen),
        gen(countGen),
        numeric({
          prompt: [p('Placas retangulares de 15 cm por 25 cm serão colocadas lado a lado, todas na mesma posição e sem cortes, formando o menor quadrado possível.')],
          ask: 'Quantas placas serão necessárias?',
          unit: 'placas',
          answer: 15,
          wrong: [
            { value: 75, feedback: '75 cm é o lado do quadrado (o MMC). As placas são (75 ÷ 15) × (75 ÷ 25).' },
            { value: 8, feedback: 'Somar 5 + 3 conta as placas de uma fileira e de uma coluna. A área é coberta por 5 × 3 placas.' },
            { value: 375, feedback: '375 cm² é a área de cada placa, não o número de placas.' },
          ],
          hints: ['O lado do quadrado é múltiplo de 15 e de 25: o menor é o MMC.', 'MMC(15, 25) = 75. Quantas placas cabem em cada direção?'],
          solution: ['$MMC(15, 25) = 75 cm', '$(75 ÷ 15) × (75 ÷ 25) = 5 × 3 = 15 placas'],
        }),
      ],
      challenge: [
        numeric({
          prompt: [p('Peças de um jogo têm a forma de caixinhas de 4 cm × 6 cm × 10 cm. Elas serão empilhadas, todas na mesma posição, até formar o menor cubo maciço possível.')],
          ask: 'Quantas peças serão usadas?',
          unit: 'peças',
          answer: 900,
          wrong: [
            { value: 60, feedback: '60 cm é a aresta do cubo (o MMC). As peças são (60 ÷ 4) × (60 ÷ 6) × (60 ÷ 10).' },
            { value: 240, feedback: '4 × 6 × 10 = 240 cm³ é o volume de uma peça, não o número de peças.' },
            { value: 31, feedback: 'Você somou 15 + 10 + 6. As peças preenchem o cubo: multiplique.' },
          ],
          solution: ['$MMC(4, 6, 10) = 60 cm', '$(60 ÷ 4) × (60 ÷ 6) × (60 ÷ 10) = 15 × 10 × 6 = 900 peças'],
        }),
        gen(spacersGen),
        numeric({
          prompt: [p('Duas máquinas começam um ciclo juntas às 8 h. Os ciclos duram 18 e 24 minutos e recomeçam imediatamente. O turno termina às 13 h.')],
          ask: 'Quantas vezes as duas começam um ciclo juntas no turno, contando a das 8 h?',
          answer: 5,
          wrong: [
            { value: 4, feedback: 'Essas são as coincidências depois das 8 h (300 ÷ 72 = 4,1…). A pergunta manda contar também a das 8 h.' },
            { value: 6, feedback: 'O 5º recomeço conjunto depois das 8 h seria às 14 h, depois do fim do turno.' },
            { value: 30, feedback: 'Isso soma os recomeços de cada máquina. Os recomeços JUNTOS acontecem a cada MMC = 72 min.' },
          ],
          solution: ['$MMC(18, 24) = 72 min; o turno dura 300 min.', '$300 ÷ 72 = 4,1… → 4 recomeços conjuntos depois das 8 h', 'Com o das 8 h: 5.'],
        }),
        gen(gearGen),
        gen(countGen),
      ],
      recap: [
        'Maior azulejo quadrado sem cortes: MDC das medidas (na mesma unidade).',
        'Malha de m × n peças: (m + 1) × (n + 1) pontos de encontro. Contorno fechado: estacas = intervalos. Linha aberta: k pedaços, k − 1 cortes.',
        'Menor quadrado ou cubo montado com peças iguais: lado = MMC das medidas; peças = produto dos quocientes.',
        'Engrenagens: dentes marcados se reencontram no MMC dos dentes; voltas = MMC ÷ dentes.',
        'Coincidências num intervalo: ⌊duração ÷ MMC⌋, mais 1 se o instante inicial conta — confira os extremos.',
      ],
    })),

    stage('maestria', 'maestria', 'Maestria: MMC e MDC ao contrário e combinados', 'Resolver os problemas mais difíceis: número escondido a partir do MMC, mesmo resto, ciclos defasados, quadrados perfeitos, pares com MDC e MMC dados e problemas mistos.', () => ({
      learn: [
        text('Nas questões mais difíceis, o MMC e o MDC aparecem **ao contrário** (descobrir um número a partir do MMC), **combinados** (montar e depois cortar) ou com eventos que **não começam juntos**. Em todos os casos, a fatoração é a ferramenta que destrava.'),
        example('O número escondido', 'Um farol pisca a cada 12 segundos e outro a cada n segundos, com n menor que 60. Eles piscaram juntos e só voltaram a piscar juntos 180 segundos depois.', [
          step('Fatore o que se sabe:', '12 = 2² × 3', '180 = 2² × 3² × 5'),
          askStep('O MMC tem os fatores 3² e 5, que o 12 não tem.', 'De onde vêm esses fatores?', [
            ok('Do n: ele precisa ter 3² × 5 = 45 como fator'),
            no('De 12 × n = 180, então n = 15', 'Com n = 15, o MMC seria 60, não 180: o produto só é o MMC quando não há fatores comuns.'),
            no('Basta n dividir 180', 'Ser divisor de 180 não basta: com n = 36, o MMC seria 36.'),
          ], 'n = 45 × (algo que só use 2s)'),
          step('Os candidatos são 45, 90 e 180. Menor que 60:', 'n = 45'),
        ], 'n = 45. Confira: MMC(12, 45) = 180.'),
        key('Divisores comuns = divisores do MDC', 'Todo divisor comum de dois números divide o MDC deles. Para contar os divisores comuns de 120 e 180, conte os divisores de MDC(120, 180) = 60 = 2² × 3 × 5: são 3 × 2 × 2 = 12.'),
        key('Mesmo resto', 'Se N deixa resto r tanto na divisão por a quanto na divisão por b, então N − r é múltiplo de a e de b — logo, de MMC(a, b). O menor N maior que r é MMC(a, b) + r.'),
        example('Montar e depois cortar', 'Placas de 20 cm × 30 cm formarão o menor painel quadrado possível, todas na mesma posição. Depois, cada placa será cortada em quadrados iguais, os maiores possíveis, sem sobra.', [
          step('O painel é montado juntando placas: MMC.', 'Lado do painel: MMC(20, 30) = 60 cm → 3 × 2 = 6 placas'),
          askStep('Agora cada placa é cortada.', 'Qual conceito vale no corte?', [
            ok('MDC(20, 30) = 10 cm'),
            no('MMC de novo', 'Cortar em partes iguais e máximas, sem sobra, é MDC.'),
            no('Dividir 60 por 6', 'O lado do quadradinho precisa dividir as medidas da PLACA (20 e 30), não o número de placas.'),
          ], 'Cada placa: (20 ÷ 10) × (30 ÷ 10) = 6 quadrados de 10 cm'),
          step('Total:', '6 placas × 6 quadrados = 36 quadrados'),
        ], 'O painel terá 36 quadrados de 10 cm. Confira pela área: 60 × 60 ÷ (10 × 10) = 36.'),
        example('Eventos que não começam juntos', 'Três lâmpadas piscam em ritmos fixos. A primeira, a cada 5 min desde as 8 h 00; a segunda, a cada 6 min desde as 8 h 01; a terceira, a cada 4 min desde as 8 h 03. Quando as três piscam juntas pela primeira vez?', [
          step('Conte os minutos desde as 8 h. Os instantes de cada lâmpada:', 'A: 0, 5, 10, 15, …', 'B: 1, 7, 13, 19, 25, 31, …', 'C: 3, 7, 11, 15, 19, 23, …'),
          askStep('B e C coincidem pela primeira vez no minuto 7.', 'De quanto em quanto tempo B e C voltam a coincidir?', [
            ok('A cada MMC(6, 4) = 12 min: 7, 19, 31, 43, 55…'),
            no('A cada 24 min (6 × 4)', '6 e 4 têm o fator 2 em comum: o espaçamento é o MMC, 12 min.'),
            no('Nunca mais', 'Depois da primeira coincidência, o padrão se repete a cada MMC dos intervalos.'),
          ], 'B e C juntas: 7, 19, 31, 43, 55, …'),
          step('Procure nessa lista um múltiplo de 5 (instantes de A):', '55 = 11 × 5'),
        ], 'As três piscam juntas às 8 h 55 min. O MMC (60) dá só o espaçamento entre coincidências, não a primeira delas.'),
        key('Múltiplo comum que é quadrado perfeito', 'Um quadrado perfeito tem todos os expoentes pares. O menor múltiplo comum de 20 e 24 que é quadrado: MMC = 2³ × 3 × 5; complete os expoentes ímpares → 2⁴ × 3² × 5² = 3.600.'),
        check(numeric({
          ask: 'Quantos números de 1 a 100 são múltiplos de 4 ou de 6 (ou dos dois)?',
          answer: 33,
          wrong: [
            { value: 41, feedback: 'Os múltiplos de 12 (de 4 E de 6) foram contados duas vezes. Desconte-os uma vez: 25 + 16 − 8.' },
            { value: 8, feedback: '8 são os múltiplos de 12 — os que são múltiplos dos dois ao mesmo tempo. A pergunta inclui os de só um deles.' },
            { value: 49, feedback: 'Os múltiplos de 12 já estão nas duas listas: devem ser descontados (25 + 16 − 8), não somados.' },
            { value: 37, feedback: 'Os múltiplos comuns de 4 e 6 são os de 12 (o MMC), não os de 24: ⌊100 ÷ 12⌋ = 8.' },
          ],
          solution: ['Múltiplos de 4: 100 ÷ 4 = 25. Múltiplos de 6: ⌊100 ÷ 6⌋ = 16.', 'Os dois ao mesmo tempo são os múltiplos de MMC(4, 6) = 12: ⌊100 ÷ 12⌋ = 8.', '$25 + 16 − 8 = 33'],
        })),
      ],
      practice: [
        numeric({
          prompt: [p('Uma máquina para para manutenção a cada 14 dias e outra a cada n dias, com n inteiro menor que 50. Elas pararam juntas hoje e só voltarão a parar juntas daqui a 84 dias.')],
          ask: 'Qual é o valor de n?',
          answer: 12,
          wrong: [
            { value: 6, feedback: 'Com n = 6 = 2 × 3, o MMC com 14 seria 42. O 84 tem 2²: o n precisa trazer o 2² e o 3.' },
            { value: 42, feedback: 'Com n = 42, o MMC seria 42 (42 já é múltiplo de 14), não 84.' },
            { value: 28, feedback: 'Com n = 28 = 2² × 7, o MMC seria 28: falta o fator 3.' },
            { value: 84, feedback: 'n precisa ser menor que 50.' },
          ],
          hints: ['Fatore: 14 = 2 × 7 e 84 = 2² × 3 × 7.', 'Os fatores que o 14 não tem (2² e 3) precisam vir do n.'],
          solution: ['14 = 2 × 7; 84 = 2² × 3 × 7.', 'n precisa conter 2² e 3: n = 12 ou 84 (podendo ter também o 7).', 'Menor que 50: n = 12. Confira: MMC(14, 12) = 84.'],
        }),
        numeric({
          ask: 'Quantos divisores positivos comuns têm os números 90 e 150?',
          answer: 8,
          wrong: [
            { value: 30, feedback: '30 é o MDC — o maior divisor comum. A pergunta é quantos divisores comuns existem: os divisores de 30.' },
            { value: 12, feedback: '12 é o número de divisores de 90. Os comuns são só os divisores do MDC(90, 150) = 30.' },
            { value: 3, feedback: '2, 3 e 5 são os primos comuns. Os divisores comuns incluem também 1, 6, 10, 15 e 30.' },
          ],
          hints: ['Todo divisor comum de 90 e 150 divide o MDC deles.', 'MDC(90, 150) = 30 = 2 × 3 × 5. Quantos divisores tem 30?'],
          solution: ['$MDC(90, 150) = 30 = 2 × 3 × 5', 'Divisores de 30: (1 + 1)(1 + 1)(1 + 1) = 8 → 1, 2, 3, 5, 6, 10, 15, 30.'],
        }),
        gen(remainderGen),
        gen(offsetGen),
        numeric({
          prompt: [p('Dois inteiros positivos têm MDC igual a 6 e MMC igual a 252. Entre todos os pares possíveis, considere aquele com a menor diferença entre os números.')],
          ask: 'Qual é o maior número desse par?',
          answer: 42,
          wrong: [
            { value: 252, feedback: 'O par (6, 252) tem MDC 6 e MMC 252, mas é o de MAIOR diferença.' },
            { value: 36, feedback: '36 é o menor número do par (36, 42). A pergunta pede o maior.' },
            { value: 84, feedback: 'Com 84 = 6 × 14, o par seria (18, 84), com diferença maior que a de (36, 42).' },
          ],
          hints: ['Escreva os números como 6m e 6n, com m e n sem fator comum.', 'Então 6 × m × n = 252 → m × n = 42 = 2 × 3 × 7. Que pares coprimos dão 42?'],
          solution: ['Os números são 6m e 6n, com m e n coprimos e m × n = 252 ÷ 6 = 42.', 'Pares coprimos: (1, 42), (2, 21), (3, 14), (6, 7). A menor diferença é (6, 7).', 'Números: 36 e 42 — o maior é 42.'],
        }),
      ],
      challenge: [
        numeric({
          prompt: [p('Placas de 18 cm × 24 cm formarão o menor painel quadrado possível, todas na mesma posição. Depois, cada placa será cortada em quadrados iguais, os maiores possíveis, sem sobra.')],
          ask: 'Quantos quadrados terá o painel ao todo?',
          answer: 144,
          wrong: [
            { value: 12, feedback: '12 é só o número de placas (4 × 3) — ou só o de quadrados por placa (3 × 4). Multiplique os dois.' },
            { value: 72, feedback: '72 cm é o lado do painel (o MMC), não o número de quadrados.' },
            { value: 6, feedback: '6 cm é o lado de cada quadrado (o MDC). Conte quantos cabem no painel: (72 ÷ 6)².' },
          ],
          solution: ['$MMC(18, 24) = 72 cm → (72 ÷ 18) × (72 ÷ 24) = 4 × 3 = 12 placas', '$MDC(18, 24) = 6 cm → cada placa vira (18 ÷ 6) × (24 ÷ 6) = 12 quadrados', '$12 × 12 = 144 quadrados (confira: (72 ÷ 6)² = 144)'],
        }),
        numeric({
          prompt: [p('Três sensores fazem leituras em intervalos fixos: A, a cada 4 min, desde as 9 h 00; B, a cada 6 min, desde as 9 h 02; C, a cada 10 min, desde as 9 h 06.')],
          ask: 'Quantos minutos depois das 9 h os três fazem uma leitura juntos pela primeira vez?',
          unit: 'min',
          answer: 56,
          wrong: [
            { value: 60, feedback: '60 é o MMC de 4, 6 e 10: seria a resposta se os três começassem juntos. Os sensores começam em instantes diferentes.' },
            { value: 26, feedback: 'No minuto 26 só B e C coincidem (26 não é múltiplo de 4).' },
            { value: 66, feedback: 'Somar o atraso de C ao MMC não funciona: confira se 66 é múltiplo de 4.' },
          ],
          solution: ['B: 2, 8, 14, 20, 26, …; C: 6, 16, 26, …', 'B e C coincidem em 26 e, depois, a cada MMC(6, 10) = 30 min: 26, 56, 86…', 'O primeiro múltiplo de 4 nessa lista é 56: as leituras coincidem às 9 h 56 min.'],
        }),
        numeric({
          prompt: [p('Ao dividir 147 e 199 por um mesmo número natural n, os restos são 3 e 7, respectivamente.')],
          ask: 'Qual é o maior valor possível de n?',
          answer: 48,
          wrong: [
            { value: 1, feedback: 'MDC(147, 199) = 1, mas é preciso descontar os restos: n divide 147 − 3 = 144 e 199 − 7 = 192.' },
            { value: 96, feedback: '96 divide 192, mas não divide 144. Use MDC(144, 192).' },
            { value: 24, feedback: '24 divide 144 e 192, mas não é o maior divisor comum: 48 também divide.' },
          ],
          solution: ['n divide 147 − 3 = 144 e 199 − 7 = 192.', '$MDC(144, 192) = 48', 'Como os restos (3 e 7) são menores que 48, n = 48 serve.'],
        }),
        numeric({
          ask: 'Qual é o menor número positivo que é múltiplo de 20 e de 24 e, ao mesmo tempo, um quadrado perfeito?',
          answer: 3600,
          wrong: [
            { value: 120, feedback: '120 é o MMC, mas não é quadrado perfeito (120 = 2³ × 3 × 5 tem expoentes ímpares).' },
            { value: 14400, feedback: '14.400 = 120² funciona, mas não é o menor: basta completar os expoentes ímpares do MMC.' },
            { value: 240, feedback: '240 = 2⁴ × 3 × 5 ainda tem expoentes ímpares (3 e 5).' },
          ],
          solution: ['$MMC(20, 24) = 2³ × 3 × 5', 'Quadrado perfeito: expoentes pares → 2⁴ × 3² × 5² = 3.600 (= 60²).'],
        }),
        gen(remainderGen),
      ],
      recap: [
        'MMC conhecido, número escondido: compare as fatorações; o que falta tem de vir do número desconhecido.',
        'Divisores comuns de a e b = divisores do MDC(a, b).',
        'Mesmo resto r nas divisões por a e b: N = múltiplo do MMC + r.',
        'Problemas mistos: montar (MMC) e cortar (MDC) em etapas separadas.',
        'Eventos defasados: o MMC dá o espaçamento; a primeira coincidência se acha listando ou testando as condições.',
        'Múltiplo comum quadrado perfeito: complete os expoentes ímpares da fatoração do MMC.',
      ],
    })),
  ],
});
