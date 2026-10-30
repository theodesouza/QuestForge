/**
 * Aula: Potências e raízes — multiplicação repetida, propriedades, expoente zero e
 * negativo, bases negativas, raízes quadradas e cúbicas, crescimento e decaimento por
 * fator repetido, ampliações (áreas × k², volumes × k³) e os problemas difíceis do ENEM
 * (número de algarismos, bytes, resistências, últimos algarismos).
 */
import {
  askStep,
  check,
  choice,
  draftChoice,
  draftNumeric,
  example,
  fill,
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
  sample,
  spot,
  stage,
  step,
  strategy,
  text,
  tip,
  warn,
} from '../../kit/build';
import { brl, num, qty, round, sup } from '../../kit/format';
import type { Rand } from '../../types';

const pow = (b: number, e: number) => `${b}${sup(e)}`;

// ———————————————————————————————————————————————— geradores

function growthGen(r: Rand) {
  for (;;) {
    const start = r.pick([3, 5, 6, 7, 8, 10, 15, 20, 25]);
    const factor = r.pick([2, 2, 3]);
    const steps = r.int(3, 6);
    if ((start === 12 && factor === 2 && steps === 5) || (start === 5 && factor === 3 && steps === 4)) continue;
    const value = start * factor ** steps;
    if (value > 50000) continue;
    const verb = factor === 2 ? 'dobra' : 'triplica';
    return draftNumeric({
      prompt: [p(`Uma cultura começa com ${start} microrganismos e ${verb} de tamanho a cada hora, sem perdas.`)],
      ask: `Quantos microrganismos haverá depois de ${steps} horas?`,
      answer: value,
      wrong: [
        { value: start * factor * steps, feedback: `${start} × ${factor} × ${steps} multiplica pelo número de horas. A cada hora a quantidade é multiplicada por ${factor}: ${start} × ${pow(factor, steps)}.` },
        { value: factor ** steps, feedback: `${pow(factor, steps)} = ${num(factor ** steps)} é o fator de crescimento. Falta multiplicar pelos ${start} iniciais.` },
        { value: start * factor ** (steps - 1), feedback: `Esse valor corresponde a ${steps - 1} horas. Conte as multiplicações: são ${steps}.` },
        { value: start * factor ** (steps + 1), feedback: `Esse valor corresponde a ${steps + 1} horas. Conte as multiplicações: são ${steps}.` },
      ],
      hints: [`Cada hora multiplica a quantidade por ${factor}.`, `Depois de ${steps} horas: ${start} × ${factor} × ${factor} × … (${steps} fatores) = ${start} × ${pow(factor, steps)}.`],
      solution: [`$${start} × ${pow(factor, steps)} = ${start} × ${num(factor ** steps)} = ${num(value)}`],
    });
  }
}

function codesGen(r: Rand) {
  for (;;) {
    const s = r.pick([2, 3, 4, 5, 6, 10]);
    const n = r.int(2, 5);
    const value = s ** n;
    if ((s === 3 && n === 4) || value > 100000 || s === n) continue;
    return draftNumeric({
      prompt: [p(`Um código tem ${n} posições. Em cada posição pode ser usado qualquer um de ${s} símbolos, e os símbolos podem se repetir.`)],
      ask: 'Quantos códigos diferentes podem ser formados?',
      answer: value,
      wrong: [
        { value: s * n, feedback: `${s} × ${n} soma as escolhas. Cada posição MULTIPLICA as possibilidades: ${Array.from({ length: n }, () => s).join(' × ')} = ${pow(s, n)}.` },
        { value: n ** s, feedback: `${pow(n, s)} inverteu base e expoente. A base é o número de símbolos (${s}); o expoente, o de posições (${n}).` },
        { value: s ** (n - 1), feedback: `${pow(s, n - 1)} seria um código de ${qty(n - 1, 'posição', 'posições')}.` },
      ],
      hints: ['Quantas escolhas há para a 1ª posição? E para a 2ª?', 'As escolhas se multiplicam: símbolos elevados ao número de posições.'],
      solution: [`$${Array.from({ length: n }, () => s).join(' × ')} = ${pow(s, n)} = ${num(value)} códigos`],
    });
  }
}

function propGen(r: Rand) {
  for (;;) {
    const b = r.pick([2, 3, 5]);
    const a1 = r.int(2, 7);
    const a2 = r.int(2, 5);
    const c1 = r.int(2, 3);
    const c2 = r.int(2, 3);
    const e = a1 + a2 - c1 * c2;
    if (e < 1 || e > 4 || (b === 3 && a1 === 7 && a2 === 2 && c1 === 3 && c2 === 2)) continue;
    const wrongs = [
      { e: a1 + a2 - (c1 + c2), feedback: `(${pow(b, c1)})${sup(c2)} = ${pow(b, c1 * c2)}: em potência de potência, os expoentes se MULTIPLICAM (${c1} × ${c2}).` },
      { e: a1 * a2 - c1 * c2, feedback: `No produto ${pow(b, a1)} × ${pow(b, a2)}, os expoentes se SOMAM: ${a1} + ${a2} = ${a1 + a2}.` },
      { e: a1 + a2 + c1 * c2, feedback: 'Na divisão, os expoentes se SUBTRAEM — o do divisor sai, não entra.' },
    ].filter((w) => w.e >= 0 && w.e <= 20);
    return draftChoice({
      prompt: [{ kind: 'math', lines: [`(${pow(b, a1)} × ${pow(b, a2)}) ÷ (${pow(b, c1)})${sup(c2)}`] }],
      ask: `Escreva a expressão como uma única potência de base ${b}.`,
      options: numericOptions(
        { value: b ** e, text: pow(b, e) },
        wrongs.map((w) => ({ value: b ** w.e, text: pow(b, w.e), feedback: w.feedback })),
      ),
      hints: ['Produto de mesma base: some os expoentes. Divisão: subtraia.', `Potência de potência: multiplique os expoentes — (${pow(b, c1)})${sup(c2)} = ${pow(b, c1 * c2)}.`],
      solution: [`$${pow(b, a1)} × ${pow(b, a2)} = ${pow(b, a1 + a2)}`, `$(${pow(b, c1)})${sup(c2)} = ${pow(b, c1 * c2)}`, `$${pow(b, a1 + a2)} ÷ ${pow(b, c1 * c2)} = ${pow(b, e)}`],
      verify: () => b ** e,
    });
  }
}

function specialGen(r: Rand) {
  const t = r.int(0, 2);
  if (t === 0) {
    const a = r.int(2, 12);
    const b = r.pick([2, 4, 5, 10]);
    const value = 1 + 1 / b;
    return draftNumeric({
      prompt: [{ kind: 'math', lines: [`${pow(a, 0)} + ${pow(b, -1)}`] }],
      ask: 'Qual é o valor da expressão? (decimal ou fração)',
      answer: value,
      wrong: [
        { value: 1 / b, feedback: `${pow(a, 0)} = 1, não 0: todo número diferente de zero elevado a zero vale 1.` },
        { value: 1 - b, feedback: `${pow(b, -1)} é o inverso de ${b} (1/${b}), não −${b}.` },
        { value: a + 1 / b, feedback: `${pow(a, 0)} vale 1, não ${a}.` },
        { value: 1, feedback: `Não esqueça a segunda parcela: ${pow(b, -1)} = 1/${b}.` },
      ],
      hints: ['Qualquer número (diferente de zero) elevado a 0 vale 1.', `Expoente −1 indica o inverso: ${pow(b, -1)} = 1/${b}.`],
      solution: [`$${pow(a, 0)} = 1 e ${pow(b, -1)} = [[1|${b}]] = ${num(1 / b, 2)}`, `$1 + ${num(1 / b, 2)} = ${num(value, 2)}`],
    });
  }
  if (t === 1) {
    const a = r.int(2, 4);
    const n = r.int(2, 5);
    const even = n % 2 === 0;
    const value = even ? 0 : 2 * a ** n;
    return draftNumeric({
      prompt: [{ kind: 'math', lines: [`${pow(a, n)} − (−${a})${sup(n)}`] }],
      ask: 'Qual é o valor da expressão?',
      answer: value,
      placeholder: 'use − para negativo',
      wrong: [
        ...(even
          ? [{ value: 2 * a ** n, feedback: `Com expoente par, (−${a})${sup(n)} é POSITIVO (= ${a ** n}): ${a ** n} − ${a ** n} = 0.` }]
          : [{ value: 0, feedback: `Com expoente ímpar, (−${a})${sup(n)} é NEGATIVO (= −${a ** n}): ${a ** n} − (−${a ** n}) = ${2 * a ** n}.` }]),
        { value: -2 * a ** n, feedback: `Confira os dois sinais: ${pow(a, n)} = ${a ** n} e (−${a})${sup(n)} = ${even ? '' : '−'}${a ** n}.` },
        { value: a ** n, feedback: `Os dois termos importam: ${a ** n} − (${even ? '' : '−'}${a ** n}).` },
      ],
      hints: [`(−${a})${sup(n)} multiplica −${a} por ele mesmo ${n} vezes.`, 'Expoente par deixa o resultado positivo; ímpar mantém o sinal negativo.'],
      solution: [`$(−${a})${sup(n)} = ${even ? '' : '−'}${a ** n}`, `$${a ** n} − (${even ? '' : '−'}${a ** n}) = ${value}`],
    });
  }
  const a = r.int(2, 5);
  const b = r.pick([3, 4, 5, 7]);
  if (a === b) return specialGen(r);
  const value = (b / a) ** 2;
  return draftNumeric({
    prompt: [{ kind: 'math', lines: [`([[${a}|${b}]])${sup(-2)}`] }],
    ask: 'Qual é o valor da expressão? (fração ou decimal)',
    answer: value,
    tolerance: 0.002,
    wrong: [
      { value: (a / b) ** 2, feedback: `Expoente negativo INVERTE a base: ([[${a}|${b}]])⁻² = ([[${b}|${a}]])².` },
      { value: -((a / b) ** 2), feedback: 'Expoente negativo não deixa o número negativo: ele indica o inverso.' },
      { value: (2 * b) / a, feedback: `Elevar ao quadrado é multiplicar a fração por ela mesma: ([[${b}|${a}]])² = [[${b * b}|${a * a}]].` },
    ],
    hints: ['a⁻ⁿ = 1/aⁿ: com fração, basta inverter e trocar o sinal do expoente.', `([[${a}|${b}]])⁻² = ([[${b}|${a}]])².`],
    solution: [`$([[${a}|${b}]])⁻² = ([[${b}|${a}]])² = [[${b * b}|${a * a}]] ≈ ${num(value, 3)}`],
  });
}

function rootSideGen(r: Rand) {
  for (;;) {
    const area = r.int(50, 900);
    const root = Math.sqrt(area);
    if (Number.isInteger(root) || area === 200) continue;
    const side = Math.ceil(root);
    return draftNumeric({
      prompt: [p(`Um terreno quadrado deve ter, no mínimo, ${area} m² de área, e o lado precisa ser um número inteiro de metros.`)],
      ask: 'Qual é a menor medida possível do lado?',
      unit: 'm',
      answer: side,
      wrong: [
        { value: side - 1, feedback: `${side - 1}² = ${(side - 1) ** 2} m², menos que os ${area} m² exigidos. "No mínimo" pede arredondar a raiz para cima.` },
        { value: round(area / 4, 2), feedback: `${num(area / 4, 2)} m é ${area} ÷ 4 — conta de perímetro. Para a área, procure o lado com lado² ≥ ${area}.` },
        { value: round(area / 2, 2), feedback: 'Metade da área não é o lado. A área do quadrado é lado × lado.' },
        { value: side + 1, feedback: `${side + 1} m serve, mas não é o menor: ${side}² = ${side ** 2} m² já basta.` },
      ],
      hints: [`Procure os quadrados perfeitos em volta de ${area}.`, `${side - 1}² = ${(side - 1) ** 2} e ${side}² = ${side ** 2}.`],
      solution: [`$${side - 1}² = ${(side - 1) ** 2} < ${area} < ${side ** 2} = ${side}²`, `O lado inteiro mínimo é ${side} m.`],
    });
  }
}

function cubeGen(r: Rand) {
  for (;;) {
    const a = r.int(2, 6);
    const what = r.pick(['edge', 'open', 'closed'] as const);
    if (a === 4 && what === 'open') continue; // a questão do banco
    const liters = a ** 3 * 1000;
    const answer = what === 'edge' ? a : what === 'open' ? 5 * a * a : 6 * a * a;
    const ask =
      what === 'edge'
        ? 'Qual é a medida da aresta interna do reservatório?'
        : what === 'open'
          ? 'Quantos metros quadrados de manta revestem as quatro paredes internas e o fundo (o reservatório não tem tampa)?'
          : 'Qual é a área total das seis faces internas?';
    return draftNumeric({
      prompt: [p(`Um reservatório em forma de cubo comporta exatamente ${num(liters)} litros quando cheio. Considere 1 m³ = 1.000 L e despreze a espessura das paredes.`)],
      ask,
      unit: what === 'edge' ? 'm' : 'm²',
      answer,
      wrong: [
        ...(what !== 'edge' ? [{ value: a * a, feedback: `${a * a} m² é a área de UMA face (${a} × ${a}).` }] : []),
        ...(what === 'open' ? [{ value: 6 * a * a, feedback: 'Isso conta as seis faces. Sem tampa, são 4 paredes + o fundo = 5 faces.' }] : []),
        ...(what === 'closed' ? [{ value: 5 * a * a, feedback: 'Isso deixa uma face de fora. O cubo tem 6 faces.' }] : []),
        { value: a ** 3, feedback: `${a ** 3} é o volume em m³. ${what === 'edge' ? 'A aresta é a raiz cúbica do volume.' : 'Calcule a aresta (raiz cúbica) e depois a área das faces.'}` },
        ...(what === 'edge' ? [{ value: round((a ** 3) / 3, 2), feedback: 'Raiz cúbica não é dividir por 3: procure o número que, multiplicado três vezes por ele mesmo, dá o volume.' }] : []),
      ],
      hints: [`Converta: ${num(liters)} L = ${a ** 3} m³.`, `A aresta é ∛${a ** 3} = ${a} m${what === 'edge' ? '' : '; cada face tem ' + a * a + ' m²'}.`],
      solution: [`$${num(liters)} L = ${a ** 3} m³ → aresta ∛${a ** 3} = ${a} m`, what === 'edge' ? `A aresta mede ${a} m.` : `$${what === 'open' ? 5 : 6} × ${a}² = ${answer} m²`],
    });
  }
}

const FACTORS = [
  { f: 1.1, up: true, label: 'rende 10% ao ano (o saldo é multiplicado por 1,1 a cada ano)' },
  { f: 1.2, up: true, label: 'rende 20% ao ano (o saldo é multiplicado por 1,2 a cada ano)' },
  { f: 1.5, up: true, label: 'cresce 50% ao ano (é multiplicado por 1,5 a cada ano)' },
  { f: 0.9, up: false, label: 'perde 10% do valor a cada ano (é multiplicado por 0,9 a cada ano)' },
  { f: 0.8, up: false, label: 'perde 20% do valor a cada ano (é multiplicado por 0,8 a cada ano)' },
  { f: 0.5, up: false, label: 'perde metade do valor a cada ano' },
];

function compoundGen(r: Rand) {
  for (;;) {
    const c = r.pick([1000, 2000, 4000, 5000, 8000]);
    const ff = r.pick(FACTORS);
    const n = r.int(2, 4);
    const value = round(c * ff.f ** n, 2);
    const who = ff.up ? `Uma aplicação de ${brl(c)}` : `Um equipamento comprado por ${brl(c)}`;
    return draftNumeric({
      prompt: [p(`${who} ${ff.label}.`)],
      ask: `Qual será o valor depois de ${n} anos?`,
      prefix: 'R$',
      answer: value,
      tolerance: 0.01,
      wrong: [
        { value: round(c * (1 + (ff.f - 1) * n), 2), feedback: `Isso aplica a variação sempre sobre o valor INICIAL. A cada ano o fator ${num(ff.f, 2)} incide sobre o valor do ano anterior: ${brl(c)} × ${num(ff.f, 2)}${sup(n)}.` },
        { value: round(c * ff.f * n, 2), feedback: `Isso multiplica o fator pelo número de anos. O fator se repete: eleve-o a ${n}.` },
        { value: round(c * ff.f ** (n - 1), 2), feedback: `Esse é o valor depois de ${qty(n - 1, 'ano', 'anos')}.` },
      ].filter((w) => w.value > 0),
      hints: [`A cada ano, multiplique por ${num(ff.f, 2)}.`, `Depois de ${n} anos: ${brl(c)} × ${num(ff.f, 2)}${sup(n)}.`],
      solution: [`$${num(ff.f, 2)}${sup(n)} = ${num(ff.f ** n, 4)}`, `$${num(c)} × ${num(ff.f ** n, 4)} = ${brl(value)}`],
    });
  }
}

function spreadGen(r: Rand) {
  for (;;) {
    const k = r.int(2, 4);
    const n = r.int(3, 5);
    if (k === 3 && (n === 4 || n === 5)) continue; // as questões do banco
    const total = Array.from({ length: n + 1 }, (_, i) => k ** i).reduce((s, x) => s + x, 0);
    const askTotal = r.next() < 0.65;
    return draftNumeric({
      prompt: [p(`Uma pessoa (rodada 0) conta uma novidade a ${k} amigos (rodada 1). Em cada rodada seguinte, cada pessoa que soube na rodada anterior conta a ${k} pessoas que ainda não sabiam, e ninguém ouve duas vezes.`)],
      ask: askTotal ? `Ao final da rodada ${n}, quantas pessoas conhecem a novidade, contando a primeira?` : `Quantas pessoas ficam sabendo na rodada ${n}?`,
      answer: askTotal ? total : k ** n,
      wrong: askTotal
        ? [
            { value: k ** n, feedback: `${pow(k, n)} = ${k ** n} são só as pessoas da rodada ${n}. Some todas as rodadas, da 0 à ${n}.` },
            { value: total - 1, feedback: 'Faltou a pessoa que começou (rodada 0).' },
            { value: total - k ** n, feedback: `Isso para na rodada ${n - 1}. Inclua os ${k ** n} da rodada ${n}.` },
            { value: k * n + 1, feedback: `${k} × ${n} + 1 conta como se cada rodada acrescentasse sempre ${k} pessoas. Cada NOVA pessoa conta para ${k}: a rodada i tem ${k}ⁱ pessoas.` },
          ]
        : [
            { value: total, feedback: `${total} é o total de pessoas que já sabem (todas as rodadas). Na rodada ${n} entram ${pow(k, n)}.` },
            { value: k * n, feedback: `${k} × ${n} supõe sempre ${k} novas por rodada. Cada pessoa da rodada anterior conta a ${k}: a rodada ${n} tem ${pow(k, n)}.` },
            { value: k ** (n - 1), feedback: `${pow(k, n - 1)} são as pessoas da rodada ${n - 1}.` },
          ],
      hints: [`Rodada 1: ${k}; rodada 2: ${k} × ${k} = ${k * k}; rodada i: ${k}ⁱ.`, askTotal ? `Total: 1 + ${k} + ${k * k} + … + ${pow(k, n)}.` : `Rodada ${n}: ${pow(k, n)}.`],
      solution: askTotal
        ? [`$${Array.from({ length: n + 1 }, (_, i) => num(k ** i)).join(' + ')} = ${num(total)} pessoas`]
        : [`$${pow(k, n)} = ${num(k ** n)} pessoas na rodada ${n}`],
    });
  }
}

function stepsGen(r: Rand) {
  for (;;) {
    const s = r.int(2, 12);
    const k = r.pick([2, 3]);
    const n = r.int(3, 7);
    const final = s * k ** n;
    if (final > 50000 || (s === 8 && k === 2 && n === 5)) continue;
    return draftNumeric({
      prompt: [p(`Uma colônia começa com ${s} indivíduos e ${k === 2 ? 'dobra' : 'triplica'} a cada geração. Em certa geração, chegou a ${num(final)} indivíduos.`)],
      ask: 'Quantas gerações se passaram?',
      unit: 'gerações',
      answer: n,
      wrong: [
        { value: round(final / s / k, 2), feedback: `Isso divide como se o crescimento fosse por soma. A quantidade é ${s} × ${k}ⁿ: descubra n em ${k}ⁿ = ${num(final / s)}.` },
        { value: n - 1, feedback: `${s} × ${pow(k, n - 1)} = ${num(s * k ** (n - 1))}, ainda abaixo de ${num(final)}.` },
        { value: n + 1, feedback: `${s} × ${pow(k, n + 1)} = ${num(s * k ** (n + 1))}, acima de ${num(final)}.` },
      ],
      hints: [`Divida pelo valor inicial: ${num(final)} ÷ ${s} = ${num(final / s)}.`, `Qual potência de ${k} dá ${num(final / s)}?`],
      solution: [`$${num(final)} ÷ ${s} = ${num(final / s)} = ${pow(k, n)}`, `Passaram-se ${n} gerações.`],
    });
  }
}

function scaleGen(r: Rand) {
  for (;;) {
    const cube = r.next() < 0.5;
    const k = r.pick([2, 3, 4, 5]);
    if (!cube && k === 3) continue; // a questão do banco
    const a = r.pick([2, 3, 4, 5, 6]);
    const factor = cube ? k ** 3 : k ** 2;
    return draftNumeric({
      prompt: [p(cube ? `Um cubo de aresta ${a} cm foi ampliado: cada aresta passou a medir ${a * k} cm.` : `Um quadrado de lado ${a} m foi ampliado: o lado passou a medir ${a * k} m.`)],
      ask: cube ? 'O volume ficou multiplicado por quanto?' : 'A área ficou multiplicada por quanto?',
      answer: factor,
      wrong: [
        { value: k, feedback: `${k} é quantas vezes o comprimento aumentou. ${cube ? 'O volume depende de três medidas: k³' : 'A área depende de duas medidas: k²'}.` },
        { value: cube ? k ** 2 : k ** 3, feedback: cube ? `${k ** 2} = ${k}² seria o fator de uma ÁREA. Volume: ${k}³.` : `${k ** 3} = ${k}³ seria o fator de um VOLUME. Área: ${k}².` },
        { value: 2 * k, feedback: `${2 * k} = 2 × ${k} não tem significado aqui: ${cube ? `${k} × ${k} × ${k}` : `${k} × ${k}`}.` },
      ],
      hints: [`Cada medida ficou multiplicada por ${a * k} ÷ ${a} = ${k}.`, cube ? 'Volume = aresta × aresta × aresta.' : 'Área = lado × lado.'],
      solution: [`Fator linear: k = ${k}.`, cube ? `$Volume × k³ = × ${k}³ = × ${factor}` : `$Área × k² = × ${k}² = × ${factor}`],
    });
  }
}

// ———————————————————————————————————————————————— aula

export const POTENCIAS = lesson({
  id: 'potencias',
  topic: 'basica',
  subtopics: ['potencias'],
  title: 'Potências e raízes',
  summary:
    'Multiplicar repetidas vezes, desfazer com raízes e reconhecer o crescimento que dobra a cada etapa — das senhas e bactérias aos juros compostos, maquetes e bytes do celular.',
  requires: ['operacoes'],
  stages: [
    stage('multiplicacao-repetida', 'descoberta', 'Potência: multiplicação repetida', 'Escrever multiplicações repetidas como potência, calcular potências e reconhecer processos que dobram (ou triplicam) a cada etapa.', () => ({
      learn: [
        text('2 × 2 × 2 × 2 × 2 tem cinco fatores iguais a 2: escreve-se **2⁵** (lê-se "dois elevado a cinco") e vale 32. A **base** (2) é o fator que se repete; o **expoente** (5) conta quantas vezes ele aparece.'),
        lab({
          title: 'Dobrar, triplicar, repetir',
          intro: 'Escolha o valor inicial, o fator e o número de etapas. Cada barra é uma etapa.',
          params: [
            { key: 's', label: 'Valor inicial', min: 1, max: 20, step: 1, value: 1, format: (v) => `${v}` },
            { key: 'f', label: 'Fator por etapa', min: 2, max: 4, step: 1, value: 2, format: (v) => `× ${v}` },
            { key: 'n', label: 'Etapas', min: 0, max: 8, step: 1, value: 3, format: (v) => `${v}` },
          ],
          readouts: ({ s, f, n }) => [
            { label: 'Depois das etapas', value: `${s} × ${pow(f, n)} = ${num(s * f ** n)}`, big: true, tone: 'brass' },
            { label: 'O erro comum (fator × etapas)', value: `${s} × ${f} × ${n} = ${num(s * f * n)}` },
          ],
          viz: ({ s, f, n }) => ({
            kind: 'bars',
            bars: Array.from({ length: n + 1 }, (_, k) => ({ label: `${k}`, value: s * f ** k, text: num(s * f ** k), tone: k === n ? ('brass' as const) : ('mist' as const) })),
            summary: `Começa em ${s} e multiplica por ${f} a cada etapa: ${num(s * f ** n)} depois de ${n} etapas`,
          }),
          goal: {
            task: 'Começando em 3, encontre o fator e o número de etapas que levam a exatamente 243.',
            done: ({ s, f, n }) => s === 3 && s * f ** n === 243,
            success: 'Isso: 3 × 3⁴ = 3 × 81 = 243. Quatro etapas de triplicação.',
          },
          insight: 'As barras crescem cada vez mais depressa: multiplicar repetidamente é muito mais rápido que somar repetidamente.',
        }),
        warn('2⁵ não é 2 × 5', '2⁵ = 2 × 2 × 2 × 2 × 2 = 32, enquanto 2 × 5 = 10. Dobrar uma quantidade 5 vezes a multiplica por 32, não por 10.'),
        example('A colônia de bactérias', 'Uma colônia começa com 50 bactérias e dobra a cada 20 minutos. Quantas haverá depois de 2 horas?', [
          askStep('Primeiro, conte as duplicações.', 'Quantas duplicações acontecem em 2 horas?', [
            ok('6, uma a cada 20 minutos'),
            no('2, uma por hora', 'A colônia dobra a cada 20 minutos: em 1 hora são 3 duplicações; em 2 horas, 6.'),
            no('40, uma por minuto', 'Uma duplicação leva 20 minutos: 120 ÷ 20 = 6.'),
          ], '120 min ÷ 20 min = 6 duplicações'),
          step('Cada duplicação multiplica por 2:', '50 × 2⁶ = 50 × 64 = 3.200'),
        ], 'Depois de 2 horas haverá 3.200 bactérias.'),
        key('Contar possibilidades', 'Um código com 3 posições, cada uma com 5 símbolos possíveis (podendo repetir), tem 5 × 5 × 5 = 5³ = 125 possibilidades. A base é o número de opções por posição; o expoente, o número de posições.'),
        check(numeric({
          ask: 'Uma senha tem 3 posições, e cada uma pode ser qualquer um dos 10 algarismos (com repetição). Quantas senhas diferentes existem?',
          answer: 1000,
          wrong: [
            { value: 30, feedback: '10 × 3 soma as escolhas. Cada posição multiplica as possibilidades: 10 × 10 × 10.' },
            { value: 59049, feedback: '3¹⁰ inverteu base e expoente. A base são os 10 algarismos; o expoente, as 3 posições.' },
          ],
          solution: ['$10 × 10 × 10 = 10³ = 1.000 senhas (de 000 a 999)'],
        })),
        reveal('E quando a quantidade cai pela metade a cada etapa? O que acontece com 800 depois de 4 reduções?', 'Cada etapa multiplica por 1/2: 800 × (1/2)⁴ = 800 ÷ 16 = 50. Potências também descrevem reduções repetidas.'),
      ],
      practice: [
        gen(growthGen),
        gen(codesGen),
        numeric({
          prompt: [p('Um sinal de 960 unidades de intensidade perde metade da intensidade em cada filtro que atravessa. Ele passa por 5 filtros.')],
          ask: 'Qual é a intensidade no final?',
          unit: 'unidades',
          answer: 30,
          wrong: [
            { value: 192, feedback: '192 = 960 ÷ 5 divide pelo número de filtros. Cada filtro divide por 2: 960 ÷ 2⁵.' },
            { value: 60, feedback: '60 é a intensidade depois de 4 filtros. Falta mais uma metade.' },
            { value: 15, feedback: '15 corresponde a 6 filtros. São 5: 960 ÷ 32.' },
          ],
          hints: ['Cada filtro multiplica a intensidade por 1/2.', 'Depois de 5 filtros: 960 × (1/2)⁵ = 960 ÷ 32.'],
          solution: ['$960 ÷ 2⁵ = 960 ÷ 32 = 30 unidades'],
        }),
      ],
      challenge: [
        gen(growthGen),
        numeric({
          prompt: [p('Uma folha de papel tem 0,08 mm de espessura. Suponha que fosse possível dobrá-la ao meio 6 vezes seguidas; cada dobra dobra o número de camadas.')],
          ask: 'Qual seria a espessura da pilha?',
          unit: 'mm',
          answer: 5.12,
          wrong: [
            { value: 0.48, feedback: '0,48 mm = 6 × 0,08 conta 6 camadas. Cada dobra DOBRA as camadas: 2⁶ = 64 camadas.' },
            { value: 0.96, feedback: '0,96 mm = 12 camadas usa 2 × 6. O número de camadas é 2⁶ = 64.' },
            { value: 2.56, feedback: '2,56 mm = 32 camadas corresponde a 5 dobras. Com 6 dobras são 64 camadas.' },
          ],
          solution: ['Camadas: 2⁶ = 64.', '$64 × 0,08 = 5,12 mm'],
        }),
        numeric({
          prompt: [p('Um vírus de computador começa num computador. A cada hora, cada computador infectado na hora anterior (e só ele) infecta 2 computadores novos.')],
          ask: 'Quantos computadores novos são infectados durante a 6ª hora?',
          answer: 64,
          wrong: [
            { value: 12, feedback: '2 × 6 supõe 2 novos por hora. Cada novo infectado infecta 2: os novos dobram a cada hora.' },
            { value: 127, feedback: '127 é o total de infectados até a 6ª hora (1 + 2 + 4 + … + 64). A pergunta é só a 6ª hora.' },
            { value: 32, feedback: '32 = 2⁵ são os novos da 5ª hora.' },
          ],
          solution: ['Novos na hora 1: 2; hora 2: 4; hora 3: 8… hora n: 2ⁿ.', '$Hora 6: 2⁶ = 64'],
        }),
        gen(codesGen),
      ],
      recap: [
        'aⁿ = a × a × … × a (n fatores): a base se repete, o expoente conta.',
        '2⁵ = 32, não 2 × 5 = 10.',
        'Dobrar n vezes multiplica por 2ⁿ; reduzir à metade n vezes multiplica por (1/2)ⁿ.',
        'Códigos: (opções por posição)^(número de posições).',
      ],
    })),

    stage('propriedades', 'fundamentos', 'Propriedades das potências', 'Usar as propriedades do produto, do quociente e da potência de potência para simplificar e comparar potências.', () => ({
      learn: [
        text('Potências de mesma base se combinam contando fatores: 2³ × 2⁴ = (2 × 2 × 2) × (2 × 2 × 2 × 2) = 2⁷. Os expoentes se **somam**.'),
        math('aᵐ × aⁿ = aᵐ⁺ⁿ', 'aᵐ ÷ aⁿ = aᵐ⁻ⁿ  (a ≠ 0)', '(aᵐ)ⁿ = aᵐ×ⁿ', 'aⁿ × bⁿ = (a × b)ⁿ'),
        example('Uma única potência', [{ kind: 'math', lines: ['(2⁵ × 2⁴) ÷ (2²)³'] }], [
          step('Numerador: mesma base, some os expoentes.', '2⁵ × 2⁴ = 2⁹'),
          askStep('Agora o divisor.', 'Quanto vale (2²)³?', [
            ok('2⁶'),
            no('2⁵', 'Potência de potência MULTIPLICA os expoentes: (2²)³ = 2² × 2² × 2² = 2⁶.'),
            no('2⁸', '2⁸ seria 2 elevado a 2³. Em (2²)³, o 2² é repetido 3 vezes: 2⁶.'),
          ], '(2²)³ = 2⁶'),
          step('Divida subtraindo os expoentes:', '2⁹ ÷ 2⁶ = 2³ = 8'),
        ], 'A expressão vale 2³ = 8.'),
        warn('As propriedades não valem para somas', '2³ + 2⁴ = 8 + 16 = 24, que não é 2⁷ = 128. E 2³ × 3⁴ não se junta numa potência só: as bases são diferentes (a menos que os expoentes sejam iguais: 2⁴ × 3⁴ = 6⁴).'),
        key('Comparar potências de mesma base', '2¹³ é quantas vezes 2⁹? Divida: 2¹³ ÷ 2⁹ = 2⁴ = 16 vezes — e não 4 vezes. Uma diferença de expoentes vira um fator.'),
        check(spot({
          ask: 'Em qual linha está o primeiro erro?',
          lines: ['$(5²)³ × 5 ÷ 5⁴', '$= 5⁵ × 5 ÷ 5⁴', '$= 5⁶ ÷ 5⁴', '$= 5² = 25'],
          wrong: 1,
          why: '(5²)³ = 5⁶, não 5⁵: em potência de potência, os expoentes se multiplicam. O certo: 5⁶ × 5 ÷ 5⁴ = 5³ = 125.',
          solution: ['$(5²)³ × 5 ÷ 5⁴ = 5⁶ × 5¹ ÷ 5⁴ = 5⁷ ÷ 5⁴ = 5³ = 125'],
        })),
        check(fill({
          ask: 'Complete o cálculo de 2⁵ × 5⁵.',
          parts: ['2⁵ × 5⁵ = (2 × 5)', { options: ['⁵', '¹⁰', '²⁵'], answer: 0 }, ' = 10⁵ = ', { options: ['100.000', '1.000.000', '10.000'], answer: 0 }],
          solution: ['Expoentes iguais: multiplique as bases e conserve o expoente — (2 × 5)⁵ = 10⁵ = 100.000.'],
        })),
      ],
      practice: [
        gen(propGen),
        numeric({
          prompt: [p('Um servidor armazena 2¹³ arquivos; um servidor antigo armazenava 2⁹.')],
          ask: 'Quantas vezes a capacidade nova é a antiga?',
          answer: 16,
          wrong: [
            { value: 4, feedback: '4 é a diferença dos expoentes. A razão é 2¹³ ÷ 2⁹ = 2⁴ = 16.' },
            { value: 8, feedback: '8 = 2³ não confere: 13 − 9 = 4, e 2⁴ = 16.' },
          ],
          hints: ['Para saber "quantas vezes", divida.', 'Divisão de mesma base: subtraia os expoentes.'],
          solution: ['$2¹³ ÷ 2⁹ = 2⁴ = 16 vezes'],
        }),
        numeric({
          ask: 'Escrevendo 25³ × 5 como uma potência de base 5, 5ˣ, qual é o valor de x?',
          answer: 7,
          wrong: [
            { value: 4, feedback: '25 = 5², então 25³ = 5⁶ (e não 5³). Com o × 5: 5⁶ × 5¹ = 5⁷.' },
            { value: 6, feedback: '25³ = 5⁶, mas ainda falta o × 5: 5⁶ × 5¹ = 5⁷.' },
            { value: 15, feedback: 'Multiplicar 3 × 5 não faz sentido aqui: 25³ = (5²)³ = 5⁶, e 5⁶ × 5 = 5⁷.' },
          ],
          hints: ['Escreva 25 como potência de 5: 25 = 5².', '(5²)³ = 5⁶; depois some o expoente do último 5.'],
          solution: ['$25³ × 5 = (5²)³ × 5¹ = 5⁶ × 5¹ = 5⁷'],
        }),
      ],
      challenge: [
        gen(propGen),
        numeric({
          ask: 'Quanto vale 4³ × 25³?',
          answer: 1000000,
          wrong: [
            { value: 300, feedback: '(4 × 25) × 3 multiplicou pelo expoente. Expoentes iguais: (4 × 25)³ = 100³.' },
            { value: 24389, feedback: '29³ somou as bases. Com expoentes iguais, as bases se MULTIPLICAM: (4 × 25)³ = 100³.' },
            { value: 10000, feedback: '10.000 = 100². O expoente é 3: 100³ = 1.000.000.' },
          ],
          solution: ['$4³ × 25³ = (4 × 25)³ = 100³ = 1.000.000'],
        }),
        numeric({
          ask: 'Quanto vale (3²)⁴ ÷ 3⁵?',
          answer: 27,
          wrong: [
            { value: 3, feedback: '(3²)⁴ = 3⁸, não 3⁶: os expoentes se multiplicam. 3⁸ ÷ 3⁵ = 3³.' },
            { value: 9, feedback: '9 = 3² não confere: 8 − 5 = 3, e 3³ = 27.' },
          ],
          solution: ['$(3²)⁴ = 3⁸', '$3⁸ ÷ 3⁵ = 3³ = 27'],
        }),
      ],
      recap: [
        'Mesma base: produto soma expoentes; quociente subtrai; potência de potência multiplica.',
        'Mesmo expoente: aⁿ × bⁿ = (a × b)ⁿ — como 2⁵ × 5⁵ = 10⁵.',
        'Soma de potências não se junta: 2³ + 2⁴ = 24.',
        '"Quantas vezes" entre potências de mesma base: 2¹³ ÷ 2⁹ = 2⁴ = 16.',
      ],
    })),

    stage('expoentes-especiais', 'fundamentos', 'Expoente zero, expoente negativo e base negativa', 'Calcular potências com expoente zero ou negativo, distinguir (−a)ⁿ de −aⁿ e operar com inversos.', () => ({
      learn: [
        text('Desça a "escada" das potências de 2, dividindo por 2 a cada degrau: 2³ = 8, 2² = 4, 2¹ = 2, **2⁰ = 1**, **2⁻¹ = 1/2**, **2⁻² = 1/4**… O expoente zero e os negativos continuam o mesmo padrão.'),
        lab({
          title: 'Descendo a escada',
          intro: 'Escolha a base e o expoente (positivo, zero ou negativo) e veja o valor da potência.',
          params: [
            { key: 'b', label: 'Base', min: 2, max: 10, step: 1, value: 2, format: (v) => `${v}` },
            { key: 'e', label: 'Expoente', min: -4, max: 4, step: 1, value: 3, format: (v) => `${v}` },
          ],
          readouts: ({ b, e }) => [
            { label: 'Potência', value: `${pow(b, e)} = ${e >= 0 ? num(b ** e) : `1/${num(b ** -e)} = ${num(b ** e, 6)}`}`, big: true, tone: 'brass' },
            { label: 'Um degrau abaixo', value: `${pow(b, e - 1)} = ${pow(b, e)} ÷ ${b}` },
            { label: 'Regra', value: e > 0 ? `${e} fatores ${b}` : e === 0 ? 'expoente zero: vale 1' : `inverso de ${pow(b, -e)}` },
          ],
          goal: {
            task: 'Encontre a base e o expoente cuja potência vale 0,001.',
            done: ({ b, e }) => Math.abs(b ** e - 0.001) < 1e-12,
            success: 'Isso: 10⁻³ = 1/1.000 = 0,001. Em base 10, o expoente negativo diz quantas casas a vírgula anda.',
          },
          insight: 'Expoente negativo nunca deixa a potência negativa: ele indica o inverso.',
        }),
        key('As regras', 'a⁰ = 1 (a ≠ 0); a⁻ⁿ = 1/aⁿ; (a/b)⁻ⁿ = (b/a)ⁿ. Exemplos: 5⁰ = 1; 4⁻² = 1/16; (2/3)⁻¹ = 3/2.'),
        warn('Os parênteses decidem a base', '(−3)² = (−3) × (−3) = 9, mas −3² = −(3 × 3) = −9. Com expoente par, a base negativa dá resultado positivo; com ímpar, negativo: (−2)³ = −8.'),
        check(choice({
          ask: 'Quanto vale (−3)³ − (−3)²?',
          options: [
            ok('−36'),
            no('−18', '(−3)² = +9 (expoente par): −27 − 9 = −36.'),
            no('18', '(−3)³ = −27 (expoente ímpar mantém o sinal): −27 − 9 = −36.'),
            no('0', 'As duas potências têm valores diferentes: −27 e 9.'),
          ],
          solution: ['$(−3)³ = −27 e (−3)² = 9', '$−27 − 9 = −36'],
          verify: () => -36,
        })),
        example('Resistores em paralelo', 'A resistência equivalente de dois resistores em paralelo é R = (a⁻¹ + b⁻¹)⁻¹. Calcule R para a = 4 Ω e b = 12 Ω.', [
          askStep('O expoente −1 de fora vale para a soma inteira.', 'Qual é o primeiro passo?', [
            ok('Somar os inversos: 1/4 + 1/12'),
            no('Fazer a + b = 16 e inverter', 'O expoente de fora não se distribui: (a⁻¹ + b⁻¹)⁻¹ ≠ a + b, e também ≠ (a + b)⁻¹.'),
          ], '[[1|4]] + [[1|12]] = [[3|12]] + [[1|12]] = [[4|12]] = [[1|3]]'),
          step('Agora inverta o resultado:', '([[1|3]])⁻¹ = 3'),
        ], 'R = 3 Ω (menor que cada resistor, como deve ser numa associação em paralelo).'),
        warn('Soma de potências não junta expoentes', '3⁻¹ + 3⁻² não é 3⁻³: calcule cada parcela — 1/3 + 1/9 = 3/9 + 1/9 = 4/9.'),
      ],
      practice: [
        gen(specialGen),
        numeric({
          ask: 'Escreva 10⁻⁴ em forma decimal.',
          answer: 0.0001,
          tolerance: 0.000001,
          wrong: [
            { value: 0.001, feedback: '0,001 = 10⁻³. Com expoente −4, a vírgula anda quatro casas: 0,0001.' },
            { value: -10000, feedback: 'Expoente negativo indica inverso, não número negativo: 10⁻⁴ = 1/10.000.' },
            { value: 10000, feedback: '10.000 = 10⁴ ignora o sinal do expoente. 10⁻⁴ = 1/10.000.' },
          ],
          hints: ['10⁻⁴ = 1/10⁴.', '1/10.000 em decimal: quatro casas depois da vírgula.'],
          solution: ['$10⁻⁴ = [[1|10.000]] = 0,0001'],
        }),
        numeric({
          prompt: [p('A resistência equivalente de dois resistores em paralelo é R = (a⁻¹ + b⁻¹)⁻¹. Um técnico liga em paralelo resistores de 6 Ω e de 12 Ω.')],
          ask: 'Qual é a resistência equivalente?',
          unit: 'Ω',
          answer: 4,
          wrong: [
            { value: 18, feedback: '18 Ω = 6 + 12 seria a associação em série. Some os inversos e inverta o resultado.' },
            { value: 0.25, feedback: '1/4 é a soma dos inversos (1/6 + 1/12). Falta inverter: (1/4)⁻¹ = 4.' },
            { value: 1 / 18, feedback: '(6 + 12)⁻¹ trata o expoente como se distribuísse. Primeiro 1/6 + 1/12, depois inverta.' },
          ],
          hints: ['Calcule 6⁻¹ + 12⁻¹ = 1/6 + 1/12.', 'Inverta o resultado.'],
          solution: ['$[[1|6]] + [[1|12]] = [[2|12]] + [[1|12]] = [[3|12]] = [[1|4]]', '$R = ([[1|4]])⁻¹ = 4 Ω'],
        }),
      ],
      challenge: [
        numeric({
          ask: 'Quanto vale 5⁻² × 125?',
          answer: 5,
          wrong: [
            { value: -1250, feedback: 'Expoente negativo não deixa o número negativo: 5⁻² = 1/25.' },
            { value: 3125, feedback: '5⁻² não é 25: é 1/25. Então 125 ÷ 25 = 5.' },
          ],
          solution: ['$5⁻² × 125 = [[125|25]] = 5 (ou 5⁻² × 5³ = 5¹)'],
        }),
        gen(specialGen),
        numeric({
          ask: 'Quanto vale 4⁻¹ + 4⁰ + 4¹?',
          answer: 5.25,
          wrong: [
            { value: 4, feedback: '4⁰ = 1 e 4⁻¹ = 1/4 = 0,25 também entram: 0,25 + 1 + 4.' },
            { value: 5, feedback: '4⁻¹ = 0,25, não 0: 0,25 + 1 + 4 = 5,25.' },
            { value: 1, feedback: '4⁻¹ = 1/4 (não −4) e 4⁰ = 1 (não 0): 0,25 + 1 + 4 = 5,25.' },
          ],
          solution: ['$4⁻¹ = 0,25; 4⁰ = 1; 4¹ = 4', '$0,25 + 1 + 4 = 5,25'],
        }),
      ],
      recap: [
        'a⁰ = 1 (para a ≠ 0) e a⁻ⁿ = 1/aⁿ — expoente negativo indica inverso, não sinal.',
        '(−a)ⁿ: positivo se n é par, negativo se n é ímpar. −aⁿ é sempre o oposto de aⁿ.',
        'Somas de potências não juntam expoentes: calcule cada parcela.',
        '(a⁻¹ + b⁻¹)⁻¹: some os inversos e só depois inverta.',
      ],
    })),

    stage('raizes', 'interpretacao', 'Raízes: o caminho de volta', 'Calcular raízes quadradas e cúbicas exatas, estimar raízes não exatas e usá-las para achar lados e arestas a partir de áreas e volumes.', () => ({
      learn: [
        text('A raiz desfaz a potência. **√49 = 7** porque 7² = 49; **∛64 = 4** porque 4³ = 64. Em geometria: se a área de um quadrado é A, o lado é √A; se o volume de um cubo é V, a aresta é ∛V.'),
        lab({
          title: 'Entre dois quadrados perfeitos',
          intro: 'Escolha uma área. Veja a raiz quadrada e entre quais quadrados perfeitos ela fica.',
          params: [{ key: 'n', label: 'Área (m²)', min: 2, max: 400, step: 1, value: 200, format: (v) => `${v} m²` }],
          readouts: ({ n }) => {
            const k = Math.floor(Math.sqrt(n));
            const exact = k * k === n;
            return [
              { label: 'Raiz quadrada', value: exact ? `√${n} = ${k} (exata)` : `√${n} ≈ ${num(Math.sqrt(n), 2)}`, big: true, tone: 'brass' },
              { label: 'Entre', value: exact ? `${n} é quadrado perfeito` : `${k}² = ${k * k} < ${n} < ${(k + 1) ** 2} = ${k + 1}²` },
              { label: 'Menor lado inteiro com essa área ou mais', value: `${Math.ceil(Math.sqrt(n))} m` },
            ];
          },
          viz: ({ n }) => {
            const k = Math.floor(Math.sqrt(n));
            return {
              kind: 'numberline',
              min: Math.max(0, k - 1),
              max: k + 2,
              step: 1,
              points: [
                { value: Math.sqrt(n), label: `√${n}`, tone: 'iris' },
                { value: k, label: `√${k * k}`, tone: 'mist' },
              ],
              summary: `√${n} ≈ ${num(Math.sqrt(n), 2)}, entre ${k} e ${k + 1}`,
            };
          },
          goal: {
            task: 'Encontre o menor quadrado perfeito maior que 300.',
            done: ({ n }) => n === 324,
            success: 'Isso: 17² = 289 é menor que 300, e 18² = 324 é o primeiro acima.',
          },
          insight: 'Os quadrados perfeitos (1, 4, 9, 16, 25…) ficam cada vez mais espaçados: entre 17² e 18² há 35 números.',
        }),
        example('A praça quadrada', 'Uma praça quadrada deve ter, no mínimo, 300 m² de área, e o lado deve ser um número inteiro de metros. Qual é o menor lado possível?', [
          step('Localize √300 entre quadrados perfeitos:', '17² = 289 < 300 < 324 = 18²'),
          askStep('√300 ≈ 17,3.', 'Qual lado inteiro atende ao "no mínimo"?', [
            ok('18 m'),
            no('17 m', '17² = 289 m², menos que os 300 m² exigidos.'),
            no('17,3 m', 'O lado precisa ser inteiro.'),
            no('75 m', '75 = 300 ÷ 4 é conta de perímetro, não de área.'),
          ], 'Lado = 18 m (324 m²)'),
        ], 'O menor lado inteiro é 18 m.'),
        example('O reservatório cúbico', 'Um reservatório cúbico, sem tampa, comporta 27.000 L. Quanto de manta reveste as quatro paredes internas e o fundo? (1 m³ = 1.000 L)', [
          step('Volume em m³:', '27.000 L = 27 m³'),
          askStep('A aresta é a raiz cúbica do volume.', 'Quanto mede a aresta?', [
            ok('3 m'),
            no('9 m', '9 = 27 ÷ 3. Raiz cúbica é o número que, multiplicado três vezes por ele mesmo, dá 27: 3 × 3 × 3.'),
            no('√27 ≈ 5,2 m', 'A aresta de um cubo é a raiz CÚBICA do volume, não a quadrada.'),
          ], '∛27 = 3 m'),
          step('Cinco faces (4 paredes + fundo), cada uma de 3 × 3:', '5 × 9 = 45 m²'),
        ], 'São necessários 45 m² de manta.'),
        warn('A raiz não se distribui na soma', '√(9 + 16) = √25 = 5, e não √9 + √16 = 7. A raiz de um produto, sim, se separa: √(4 × 25) = 2 × 5.'),
        check(numeric({
          ask: 'Quanto vale ∛125 + √144?',
          answer: 17,
          wrong: [
            { value: 53.67, feedback: '∛125 não é 125 ÷ 3: é 5, porque 5³ = 125.' },
            { value: 113.67, feedback: 'Raízes não são divisões: ∛125 = 5 (e não 125 ÷ 3) e √144 = 12 (e não 144 ÷ 2).' },
          ],
          solution: ['$∛125 = 5 (5³ = 125) e √144 = 12 (12² = 144)', '$5 + 12 = 17'],
        })),
      ],
      practice: [
        gen(rootSideGen),
        gen(cubeGen),
        numeric({
          ask: 'Quanto vale √0,49?',
          answer: 0.7,
          wrong: [
            { value: 0.07, feedback: '0,07² = 0,0049. Confira: 0,7 × 0,7 = 0,49.' },
            { value: 7, feedback: '7² = 49, não 0,49. A vírgula: 0,7 × 0,7 = 0,49.' },
            { value: 0.245, feedback: 'Raiz não é a metade: procure o número que, ao quadrado, dá 0,49.' },
          ],
          hints: ['0,49 = 49/100.', '√(49/100) = 7/10.'],
          solution: ['$√0,49 = √[[49|100]] = [[7|10]] = 0,7'],
        }),
      ],
      challenge: [
        numeric({
          prompt: [p('Um terreno quadrado tem 1.600 m² de área. O dono vai cercá-lo com 3 voltas completas de arame.')],
          ask: 'Quantos metros de arame serão usados?',
          unit: 'm',
          answer: 480,
          wrong: [
            { value: 160, feedback: '160 m é uma volta só (4 × 40). São 3 voltas.' },
            { value: 120, feedback: '120 m = 3 × 40 cerca só um lado. Uma volta tem 4 lados: 160 m.' },
            { value: 4800, feedback: '4.800 = 3 × 1.600 multiplicou a área. Primeiro ache o lado: √1.600 = 40 m.' },
          ],
          solution: ['$Lado = √1.600 = 40 m', '$Uma volta = 4 × 40 = 160 m; três voltas = 480 m'],
        }),
        gen(cubeGen),
        choice({
          ask: 'Entre quais números inteiros consecutivos está √75?',
          options: [
            ok('8 e 9'),
            no('7 e 8', '8² = 64 ainda é menor que 75: √75 passa de 8.'),
            no('37 e 38', '37,5 é a metade de 75. A raiz é o número que, ao quadrado, dá 75.'),
            no('9 e 10', '9² = 81 já passa de 75: √75 é menor que 9.'),
          ],
          solution: ['$8² = 64 < 75 < 81 = 9²', '√75 ≈ 8,66: entre 8 e 9.'],
        }),
      ],
      recap: [
        '√A desfaz o quadrado (lado de um quadrado de área A); ∛V desfaz o cubo (aresta de um cubo de volume V).',
        'Raiz não exata: localize entre quadrados perfeitos (17² = 289 < 300 < 324 = 18²).',
        '"No mínimo" com medida inteira: arredonde a raiz para cima.',
        '√(a + b) ≠ √a + √b.',
      ],
    })),

    stage('crescimento', 'aplicacoes', 'Crescimento e decaimento repetidos', 'Modelar processos que multiplicam pelo mesmo fator a cada etapa (crescimento, decaimento, juros compostos), somar as etapas quando a pergunta é o total e descobrir o número de etapas.', () => ({
      learn: [
        text('Quando cada etapa multiplica pelo **mesmo fator** f, depois de n etapas o valor é: valor inicial × fⁿ. Se f > 1, cresce (2 dobra, 1,2 = +20%); se f está entre 0 e 1, diminui (0,5 = metade, 0,9 = −10%).'),
        lab({
          title: 'Fator repetido',
          intro: 'Escolha o valor inicial, o fator aplicado a cada etapa e o número de etapas.',
          params: [
            { key: 'c', label: 'Valor inicial', min: 100, max: 1000, step: 100, value: 500, format: (v) => num(v) },
            { key: 'f', label: 'Fator por etapa', min: 0.5, max: 2, step: 0.1, value: 1.5, format: (v) => `× ${num(v, 1)}` },
            { key: 'n', label: 'Etapas', min: 0, max: 10, step: 1, value: 2, format: (v) => `${v}` },
          ],
          readouts: ({ c, f, n }) => [
            { label: 'Depois das etapas', value: `${num(c)} × ${num(f, 1)}${sup(n)} = ${num(c * f ** n, 2)}`, big: true, tone: 'brass' },
            { label: 'Variação total', value: `${f ** n >= 1 ? '+' : '−'}${num(Math.abs(f ** n - 1) * 100, 1)}%` },
          ],
          viz: ({ c, f, n }) => ({
            kind: 'chart',
            xLabel: 'etapas',
            yLabel: 'valor',
            xMin: 0,
            xMax: 10,
            yMin: 0,
            series: [{ label: `× ${num(f, 1)} por etapa`, tone: 'brass', points: sample(0, 10, 10, (x) => c * f ** x), dots: true }],
            markers: [{ x: n, y: c * f ** n, label: num(c * f ** n, 0), tone: 'verdigris' }],
            yFormat: (y) => num(y, 0),
            summary: `${num(c)} multiplicado por ${num(f, 1)} a cada etapa: ${num(c * f ** n, 2)} na etapa ${n}`,
          }),
          goal: {
            task: 'Partindo de 1.000, com fator 0,8 por etapa, encontre a primeira etapa em que o valor fica abaixo da metade.',
            done: ({ c, f, n }) => c === 1000 && Math.abs(f - 0.8) < 1e-9 && n === 4,
            success: 'Isso: 0,8³ = 0,512 (ainda acima da metade) e 0,8⁴ ≈ 0,41. Perder 20% quatro vezes não é perder 80%: cada perda incide sobre um valor menor.',
          },
          insight: 'Com fator acima de 1, cada etapa acrescenta mais que a anterior; abaixo de 1, cada etapa tira menos.',
        }),
        warn('1,2² = 1,44 — não 1,4 nem 2,4', 'Dois anos a 20% multiplicam por 1,2 × 1,2 = 1,44, um aumento de 44% (e não de 40%). O segundo aumento incide sobre o valor já aumentado.'),
        example('O boato', 'Uma pessoa conta um boato a 2 pessoas na primeira hora. A cada hora seguinte, cada pessoa que ficou sabendo na hora anterior conta a 2 novas pessoas. Quantas pessoas conhecem o boato ao final da 4ª hora, contando a primeira?', [
          step('Novas pessoas em cada hora:', 'hora 1: 2; hora 2: 4; hora 3: 8; hora 4: 16 (= 2⁴)'),
          askStep('A pergunta é quantas pessoas conhecem o boato ao todo.', 'Qual é a conta?', [
            ok('1 + 2 + 4 + 8 + 16 = 31'),
            no('2⁴ = 16', '16 são só as pessoas da 4ª hora. Quem soube antes continua sabendo: some todas as horas.'),
            no('2 × 4 = 8', 'Cada nova pessoa conta a 2: as novas dobram a cada hora.'),
          ], '1 + 2 + 4 + 8 + 16 = 31'),
        ], 'Ao final da 4ª hora, 31 pessoas conhecem o boato.'),
        key('Quantas etapas?', 'Para descobrir o número de etapas, isole a potência e reconheça o expoente: 5 × 2ⁿ = 320 → 2ⁿ = 64 = 2⁶ → n = 6.'),
        check(numeric({
          prompt: [p('Uma cultura com 7 microrganismos dobra a cada hora.')],
          ask: 'Depois de quantas horas ela terá 448 microrganismos?',
          unit: 'horas',
          answer: 6,
          wrong: [
            { value: 32, feedback: '448 ÷ 7 ÷ 2 = 32 trata o crescimento como soma. 448 ÷ 7 = 64 = 2⁶: são 6 duplicações.' },
            { value: 64, feedback: '64 é o fator de crescimento (448 ÷ 7). O número de horas é o expoente: 64 = 2⁶.' },
          ],
          solution: ['$448 ÷ 7 = 64', '$64 = 2⁶ → 6 horas'],
        })),
      ],
      practice: [
        gen(compoundGen),
        gen(spreadGen),
        gen(stepsGen),
      ],
      challenge: [
        gen(compoundGen),
        numeric({
          prompt: [p('Um medicamento é eliminado pelo organismo de modo que, a cada 6 horas, resta metade da quantidade presente. Um paciente tomou 800 mg.')],
          ask: 'Quanto do medicamento resta no organismo 24 horas depois?',
          unit: 'mg',
          answer: 50,
          wrong: [
            { value: 200, feedback: '200 mg = 800 ÷ 4 divide pelo número de períodos. Cada período divide por 2: 800 ÷ 2⁴.' },
            { value: 100, feedback: '100 mg corresponde a 18 horas (3 meias-vidas). Em 24 horas são 4.' },
            { value: 0, feedback: 'Reduzir à metade nunca zera a quantidade: 800 → 400 → 200 → 100 → 50.' },
          ],
          solution: ['24 h ÷ 6 h = 4 reduções à metade.', '$800 × ([[1|2]])⁴ = 800 ÷ 16 = 50 mg'],
        }),
        gen(spreadGen),
        gen(stepsGen),
      ],
      recap: [
        'Mesmo fator f a cada etapa: valor final = inicial × fⁿ.',
        'Duas etapas de +20%: × 1,2² = × 1,44 (+44%).',
        'Total acumulado (como num boato): some as etapas — 1 + k + k² + … + kⁿ.',
        'Número de etapas: isole a potência e reconheça o expoente.',
      ],
    })),

    stage('escala', 'aprofundamento', 'Ampliações: comprimento, área e volume', 'Prever como áreas e volumes mudam quando todas as medidas são multiplicadas pelo mesmo fator, inclusive em maquetes e escalas.', () => ({
      learn: [
        text('Dobrando o lado de um quadrado, a área fica 4 vezes maior (2 × 2 = 2²). Dobrando a aresta de um cubo, o volume fica 8 vezes maior (2 × 2 × 2 = 2³). Em geral, se todas as medidas são multiplicadas por **k**: comprimentos × k, áreas × **k²**, volumes × **k³**.'),
        lab({
          title: 'Ampliar um cubo',
          intro: 'Escolha o fator de ampliação das arestas e compare o que acontece com a área de uma face e com o volume.',
          params: [{ key: 'k', label: 'Fator das arestas', min: 1, max: 5, step: 0.5, value: 2, format: (v) => `× ${num(v, 1)}` }],
          readouts: ({ k }) => [
            { label: 'Arestas', value: `× ${num(k, 1)}` },
            { label: 'Área de cada face', value: `× ${num(k, 1)}² = × ${num(k * k, 2)}` },
            { label: 'Volume', value: `× ${num(k, 1)}³ = × ${num(k ** 3, 3)}`, big: true, tone: 'brass' },
          ],
          viz: ({ k }) => ({
            kind: 'chart',
            xLabel: 'fator das arestas',
            yLabel: 'fica multiplicado por',
            xMin: 1,
            xMax: 5,
            yMin: 0,
            series: [
              { label: 'comprimento (k)', tone: 'mist', points: sample(1, 5, 16, (x) => x) },
              { label: 'área (k²)', tone: 'sky', points: sample(1, 5, 16, (x) => x * x) },
              { label: 'volume (k³)', tone: 'brass', points: sample(1, 5, 16, (x) => x ** 3) },
            ],
            markers: [{ x: k, y: k ** 3, label: `× ${num(k ** 3, 1)}`, tone: 'brass' }],
            yFormat: (y) => num(y, 0),
            summary: `Com arestas × ${num(k, 1)}, a área fica × ${num(k * k, 2)} e o volume × ${num(k ** 3, 2)}`,
          }),
          goal: {
            task: 'Encontre o fator das arestas que multiplica o volume por 27.',
            done: ({ k }) => Math.abs(k - 3) < 1e-9,
            success: 'Isso: 3³ = 27. E a área de cada face fica só 3² = 9 vezes maior.',
          },
          insight: 'O volume dispara: arestas 5 vezes maiores dão um volume 125 vezes maior.',
        }),
        key('Escalas', 'Numa maquete na escala 1 : n, cada comprimento real é n vezes o da maquete; cada área real, n² vezes; cada volume real, n³ vezes.'),
        example('A caixa-d’água da maquete', 'Uma maquete na escala 1 : 20 mostra uma caixa-d’água cúbica com aresta de 10 cm. Quantos litros comporta a caixa real? (1 m³ = 1.000 L)', [
          askStep('Comece pelo comprimento real.', 'Quanto mede a aresta real?', [
            ok('200 cm = 2 m'),
            no('2 cm', 'A maquete é menor que o real: a aresta real é 20 vezes MAIOR, 10 × 20 = 200 cm.'),
            no('4.000 cm', '4.000 = 10 × 20²: o quadrado da escala vale para áreas. Comprimento: × 20.'),
          ], '10 cm × 20 = 200 cm = 2 m'),
          step('Volume real:', '2³ = 8 m³ = 8.000 L'),
          step('Confira pela escala: volume da maquete 1.000 cm³ = 1 L; × 20³ = × 8.000.', '1 L × 8.000 = 8.000 L'),
        ], 'A caixa real comporta 8.000 L.'),
        warn('Dobrar as medidas não dobra a área', 'Uma pizza com o dobro do diâmetro tem 4 vezes mais área. Um balde com todas as medidas dobradas comporta 8 vezes mais.'),
        check(numeric({
          ask: 'Um quadrado de lado 6 m passa a ter lado 24 m. A área fica multiplicada por quanto?',
          answer: 16,
          wrong: [
            { value: 4, feedback: '4 é quantas vezes o lado aumentou. A área: 4² = 16.' },
            { value: 64, feedback: '64 = 4³ seria o fator de um volume. Área: 4².' },
          ],
          solution: ['Fator linear: 24 ÷ 6 = 4.', '$Área × 4² = × 16'],
        })),
        reveal('Um bloco cúbico de 12 cm de aresta é formado por cubinhos de 3 cm de aresta. Quantos cubinhos?', 'Em cada aresta cabem 12 ÷ 3 = 4 cubinhos: são 4 × 4 × 4 = 4³ = 64 cubinhos (não 4 nem 16).'),
      ],
      practice: [
        gen(scaleGen),
        numeric({
          prompt: [p('Uma pizza de 30 cm de diâmetro custa R$ 40,00. A pizzaria cobra o mesmo preço por centímetro quadrado em todos os tamanhos.')],
          ask: 'Quanto custa uma pizza de 45 cm de diâmetro?',
          prefix: 'R$',
          answer: 90,
          wrong: [
            { value: 60, feedback: 'R$ 60,00 cresce na proporção do diâmetro (× 1,5). O preço acompanha a ÁREA: × 1,5² = × 2,25.' },
            { value: 135, feedback: 'R$ 135,00 usa 1,5³: o cubo vale para volumes. A pizza é uma área: × 1,5².' },
          ],
          hints: ['O diâmetro ficou multiplicado por 45 ÷ 30 = 1,5.', 'A área fica multiplicada por 1,5².'],
          solution: ['$1,5² = 2,25', '$40 × 2,25 = R$ 90,00'],
        }),
        numeric({
          prompt: [p('Um bloco cúbico de 20 cm de aresta é montado com cubinhos de 4 cm de aresta, sem espaços vazios.')],
          ask: 'Quantos cubinhos formam o bloco?',
          answer: 125,
          wrong: [
            { value: 5, feedback: '5 é o número de cubinhos ao longo de UMA aresta. O bloco tem 5 × 5 × 5.' },
            { value: 25, feedback: '25 = 5² preenche só uma camada. São 5 camadas: 5³.' },
            { value: 400, feedback: '400 = 20² usa a aresta do bloco. Conte cubinhos por aresta: 20 ÷ 4 = 5.' },
          ],
          hints: ['Quantos cubinhos cabem ao longo de uma aresta?', 'Três direções: eleve ao cubo.'],
          solution: ['$20 ÷ 4 = 5 cubinhos por aresta', '$5³ = 125 cubinhos'],
        }),
      ],
      challenge: [
        numeric({
          prompt: [p('Uma maquete de um reservatório cúbico, na escala 1 : 50, tem faces de 16 cm² de área. Considere 1 m³ = 1.000 L.')],
          ask: 'Quantos litros comporta o reservatório real?',
          unit: 'L',
          answer: 8000,
          wrong: [
            { value: 2000, feedback: '2.000 L usaria o quadrado da escala. Para o volume: aresta real 4 × 50 = 200 cm = 2 m → 2³ = 8 m³.' },
            { value: 8000000, feedback: '8.000.000 é o volume em cm³ (200³). Como 1 L = 1.000 cm³, são 8.000 L.' },
            { value: 64, feedback: '64 cm³ é o volume da maquete. O real é 50³ = 125.000 vezes maior: 8.000.000 cm³ = 8.000 L.' },
          ],
          solution: ['Aresta da maquete: √16 = 4 cm; real: 4 × 50 = 200 cm = 2 m.', '$Volume real: 2³ = 8 m³ = 8.000 L'],
        }),
        numeric({
          prompt: [p('Uma estátua maciça de 3 m de altura pesa 540 kg. Uma réplica de 1 m de altura será feita do mesmo material, com as mesmas proporções.')],
          ask: 'Quanto pesará a réplica?',
          unit: 'kg',
          answer: 20,
          wrong: [
            { value: 180, feedback: '180 kg = 540 ÷ 3 reduz o peso na proporção da altura. O peso acompanha o VOLUME: ÷ 3³.' },
            { value: 60, feedback: '60 kg = 540 ÷ 9 usa a escala das áreas. Peso é proporcional ao volume: 540 ÷ 27.' },
          ],
          solution: ['As medidas ficam divididas por 3; o volume (e o peso), por 3³ = 27.', '$540 ÷ 27 = 20 kg'],
        }),
        gen(scaleGen),
      ],
      recap: [
        'Medidas × k: comprimentos × k, áreas × k², volumes × k³.',
        'Escala 1 : n — comprimentos reais × n, áreas × n², volumes × n³.',
        'Cubinhos num bloco: (aresta do bloco ÷ aresta do cubinho)³.',
        'Peso e capacidade acompanham o volume; tinta, piso e preço de pizza acompanham a área.',
      ],
    })),

    stage('maestria', 'maestria', 'Maestria: potências nos problemas difíceis', 'Resolver problemas inéditos reescrevendo potências em bases primas: número de algarismos, unidades de memória, comparação de potências e últimos algarismos.', () => ({
      learn: [
        strategy('Reescreva em bases primas', 'Quando as bases são diferentes, decomponha: 4 = 2², 8 = 2³, 9 = 3², 25 = 5², 27 = 3³. Depois junte os pares 2 × 5 = 10, que viram potências de 10.'),
        example('Quantos algarismos?', [{ kind: 'math', lines: ['N = 4⁷ × 25⁵'] }], [
          step('Bases primas:', '4⁷ = (2²)⁷ = 2¹⁴', '25⁵ = (5²)⁵ = 5¹⁰'),
          askStep('Há 14 fatores 2 e 10 fatores 5.', 'Como transformar isso numa potência de 10?', [
            ok('Juntar 10 pares 2 × 5: 2⁴ × (2 × 5)¹⁰'),
            no('Somar os expoentes: 10²⁴', 'Bases diferentes não somam expoentes. Junte pares 2 × 5 = 10.'),
            no('Multiplicar as bases: 10¹⁴', 'Só há 10 fatores 5 para formar pares com os 2. Sobram 2⁴.'),
          ], 'N = 2⁴ × 10¹⁰ = 16 × 10¹⁰'),
          step('16 seguido de 10 zeros:', '160.000.000.000'),
        ], 'N tem 12 algarismos (os 2 de "16" mais os 10 zeros).'),
        example('Memória do celular', 'Considere 1 KB = 2¹⁰ bytes, 1 MB = 2¹⁰ KB e 1 GB = 2¹⁰ MB. Um cartão de 8 GB tem 2 GB ocupados. Quantos vídeos de 512 MB cabem no espaço livre?', [
          step('Espaço livre:', '8 − 2 = 6 GB = 6 × 2¹⁰ MB'),
          askStep('Cada vídeo ocupa 512 MB = 2⁹ MB.', 'Quantos vídeos cabem em 1 GB?', [
            ok('2¹⁰ ÷ 2⁹ = 2'),
            no('1.024 ÷ 512 × 6 = 12 em cada GB', 'Em 1 GB = 1.024 MB cabem 1.024 ÷ 512 = 2 vídeos. O × 6 vem depois, para os 6 GB.'),
            no('2¹⁰ − 2⁹ = 512', 'Para saber quantos cabem, divida; não subtraia.'),
          ], 'Por GB: 2 vídeos'),
          step('Nos 6 GB livres:', '6 × 2 = 12 vídeos'),
        ], 'Cabem 12 vídeos.'),
        key('Comparar potências', 'Mesmo expoente: compare as bases (3²⁰ = 9¹⁰ > 8¹⁰ = 2³⁰). Mesma base: compare os expoentes. Nada em comum: reescreva até ficar com algo em comum.'),
        check(numeric({
          ask: 'Quantos algarismos tem o número 2¹² × 5¹⁰?',
          answer: 11,
          wrong: [
            { value: 22, feedback: '22 = 12 + 10 soma os expoentes. Junte 10 pares 2 × 5: 2² × 10¹⁰ = 4 × 10¹⁰.' },
            { value: 10, feedback: '10 conta só os zeros de 10¹⁰. Na frente há o 4 (= 2²): 11 algarismos.' },
            { value: 12, feedback: 'Sobram só dois fatores 2 (2² = 4, um algarismo): 4 seguido de 10 zeros.' },
          ],
          solution: ['$2¹² × 5¹⁰ = 2² × (2 × 5)¹⁰ = 4 × 10¹⁰', '4 seguido de 10 zeros: 11 algarismos.'],
        })),
        tip('Últimos algarismos se repetem', 'As potências de 2 terminam em 2, 4, 8, 6, 2, 4, 8, 6… (ciclo de 4). Para saber o último algarismo de 2¹⁰⁰, divida 100 por 4: resto 0 → mesmo final de 2⁴, ou seja, 6.'),
      ],
      practice: [
        numeric({
          ask: 'Quantos algarismos tem o número 5⁸ × 2¹⁰ × 3?',
          answer: 10,
          wrong: [
            { value: 9, feedback: '2² × 3 = 12 tem dois algarismos: 12 × 10⁸ tem 10 algarismos.' },
            { value: 8, feedback: '8 conta só os zeros de 10⁸. Na frente há 12 (= 2² × 3).' },
          ],
          hints: ['Forme pares 2 × 5: há 8 fatores 5.', '5⁸ × 2¹⁰ = 2² × 10⁸; multiplique o que sobrou pelo 3.'],
          solution: ['$5⁸ × 2¹⁰ × 3 = (2 × 5)⁸ × 2² × 3 = 12 × 10⁸', '12 seguido de 8 zeros: 10 algarismos.'],
        }),
        numeric({
          prompt: [p('Uma memória tem 2ⁿ blocos, com 16 posições em cada bloco. No total, há 1.024 posições.')],
          ask: 'Qual é o valor de n?',
          answer: 6,
          wrong: [
            { value: 4, feedback: '4 é o expoente de 16 = 2⁴. O que se pede é n em 2ⁿ × 2⁴ = 2¹⁰.' },
            { value: 10, feedback: '1.024 = 2¹⁰ é o total. Cada bloco tem 2⁴ posições: n = 10 − 4.' },
            { value: 64, feedback: '64 = 2⁶ é o número de blocos. A pergunta é o expoente n.' },
          ],
          hints: ['Escreva tudo como potência de 2: 16 = 2⁴ e 1.024 = 2¹⁰.', '2ⁿ × 2⁴ = 2¹⁰.'],
          solution: ['$2ⁿ × 2⁴ = 2¹⁰ → n + 4 = 10 → n = 6'],
        }),
        choice({
          ask: 'Qual número é maior: 2³⁰ ou 3²⁰?',
          options: [
            ok('3²⁰'),
            no('2³⁰', 'O expoente maior não basta: 2³⁰ = (2³)¹⁰ = 8¹⁰ e 3²⁰ = (3²)¹⁰ = 9¹⁰.'),
            no('São iguais', '8¹⁰ e 9¹⁰ têm o mesmo expoente e bases diferentes: não podem ser iguais.'),
          ],
          hints: ['Procure um expoente comum: 30 e 20 são múltiplos de 10.', '2³⁰ = (2³)¹⁰ e 3²⁰ = (3²)¹⁰.'],
          solution: ['$2³⁰ = 8¹⁰ e 3²⁰ = 9¹⁰', 'Mesmo expoente, base maior: 3²⁰ > 2³⁰.'],
        }),
      ],
      challenge: [
        numeric({
          ask: 'Quantos algarismos tem o número 8⁴ × 5⁹?',
          answer: 10,
          wrong: [
            { value: 13, feedback: '13 = 4 + 9 soma expoentes de bases diferentes. Use bases primas: 8⁴ = 2¹² e junte com 5⁹.' },
            { value: 9, feedback: '9 conta só os zeros de 10⁹. Na frente há o 8 (= 2³): 10 algarismos.' },
          ],
          solution: ['$8⁴ × 5⁹ = 2¹² × 5⁹ = 2³ × 10⁹ = 8 × 10⁹', '8 seguido de 9 zeros: 10 algarismos.'],
        }),
        numeric({
          prompt: [p('Três resistores de 6 Ω, 3 Ω e 2 Ω são ligados em paralelo. A resistência equivalente é R = (6⁻¹ + 3⁻¹ + 2⁻¹)⁻¹.')],
          ask: 'Qual é o valor de R?',
          unit: 'Ω',
          answer: 1,
          wrong: [
            { value: 11, feedback: '11 Ω = 6 + 3 + 2 seria a associação em série. Some os inversos e inverta.' },
            { value: 1 / 11, feedback: '(6 + 3 + 2)⁻¹ distribui o expoente de forma errada. Some 1/6 + 1/3 + 1/2 primeiro.' },
          ],
          solution: ['$[[1|6]] + [[1|3]] + [[1|2]] = [[1|6]] + [[2|6]] + [[3|6]] = 1', '$R = 1⁻¹ = 1 Ω'],
        }),
        numeric({
          ask: 'Qual é o algarismo das unidades de 2¹⁰⁰?',
          answer: 6,
          wrong: [
            { value: 2, feedback: '2 é o final de 2¹, 2⁵, 2⁹… (expoentes que deixam resto 1 na divisão por 4). 100 deixa resto 0.' },
            { value: 4, feedback: '4 é o final de 2², 2⁶… (resto 2 na divisão por 4). 100 deixa resto 0: final 6.' },
            { value: 8, feedback: '8 é o final de 2³, 2⁷… (resto 3). 100 deixa resto 0: final 6.' },
          ],
          solution: ['Finais das potências de 2: 2, 4, 8, 6 — e repete a cada 4.', '100 é múltiplo de 4: 2¹⁰⁰ termina como 2⁴ = 16, em 6.'],
        }),
        numeric({
          prompt: [p('Uma pessoa (rodada 0) avisa 4 vizinhos (rodada 1). Em cada rodada seguinte, cada pessoa avisada na rodada anterior avisa 4 vizinhos que ainda não sabiam.')],
          ask: 'Ao final da 4ª rodada, quantas pessoas conhecem o aviso, contando a primeira?',
          answer: 341,
          wrong: [
            { value: 256, feedback: '256 = 4⁴ são só os avisados da 4ª rodada. Some as rodadas de 0 a 4.' },
            { value: 340, feedback: '340 deixa de fora a pessoa que começou o aviso.' },
            { value: 85, feedback: '85 para na 3ª rodada (1 + 4 + 16 + 64). Inclua os 256 da 4ª.' },
          ],
          solution: ['$1 + 4 + 16 + 64 + 256 = 341'],
        }),
      ],
      recap: [
        'Bases diferentes: reescreva em primos (4 = 2², 25 = 5²…) e junte pares 2 × 5 = 10.',
        'k × 10ⁿ, com k de d algarismos, tem d + n algarismos.',
        'Unidades de memória em potências de 2: divida subtraindo expoentes.',
        'Comparar potências: deixe a base ou o expoente em comum.',
        'Últimos algarismos de potências se repetem em ciclos.',
      ],
    })),
  ],
});
