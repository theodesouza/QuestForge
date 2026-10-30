/**
 * Aula: Função quadrática — a parábola (concavidade, valores, simetria), raízes (fatoração,
 * fórmula de Bhaskara, discriminante), vértice (lucro, área, altura e custo máximos ou mínimos)
 * e maestria com receita, intervalos de lucro e trajetórias.
 */
import {
  askStep,
  check,
  classify,
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
  ok,
  p,
  reveal,
  sample,
  stage,
  step,
  strategy,
  text,
  warn,
} from '../../kit/build';
import { brl, num, round } from '../../kit/format';
import type { Rand } from '../../types';

const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

/** ax² + bx + c do jeito usual: sem "1x", sem "+ −" e sem termos nulos. */
function poly(a: number, b: number, c: number, v = 'x'): string {
  const head = `${a < 0 ? '−' : ''}${Math.abs(a) === 1 ? '' : num(Math.abs(a))}${v}²`;
  const term = (k: number, s: string) => (k === 0 ? '' : ` ${k < 0 ? '−' : '+'} ${Math.abs(k) === 1 && s ? '' : num(Math.abs(k))}${s}`);
  return head + term(b, v) + term(c, '');
}

/** Número entre parênteses quando negativo (para substituições). */
const par = (v: number) => (v < 0 ? `(${num(v)})` : num(v));

const FLIGHTS = [
  {
    intro: (f: string) => `Um foguete de garrafa PET é lançado do chão, e sua altura, em metros, t segundos depois, é h(t) = ${f}.`,
    speeds: [25, 30, 35, 40, 45, 50],
    it: 'o foguete',
    back: 'ao chão',
  },
  {
    intro: (f: string) => `Um golfinho salta da água, e sua altura acima da superfície, em metros, t segundos depois, é h(t) = ${f}.`,
    speeds: [6, 8, 10],
    it: 'o golfinho',
    back: 'à água',
  },
  {
    intro: (f: string) => `Uma gota do jato de um chafariz sai do nível do chão, e sua altura, em metros, t segundos depois, é h(t) = ${f}.`,
    speeds: [10, 15],
    it: 'a gota',
    back: 'ao chão',
  },
];

// ———————————————————————————————————————————————— geradores: a parábola

/** Calcular h(t) = −5t² + vt num instante: cuidado com o quadrado e com o sinal. */
function evalQuadGen(r: Rand) {
  for (;;) {
    const fl = r.pick(FLIGHTS);
    const v = r.pick(fl.speeds);
    const k = r.int(1, 2 * Math.floor(v / 5)) / 2; // instantes múltiplos de 0,5 s
    if (k >= v / 5) continue;
    const h = -5 * k * k + v * k;
    return draftNumeric({
      prompt: [p(fl.intro(poly(-5, v, 0, 't')))],
      ask: `Qual é a altura em t = ${num(k)} s?`,
      unit: 'm',
      answer: round(h, 2),
      wrong: [
        { value: round(-10 * k + v * k, 2), feedback: 'Isso calcula 5 × 2t em vez de 5 × t². O quadrado é t × t.' },
        { value: round(25 * k * k + v * k, 2), feedback: 'Isso eleva −5t inteiro ao quadrado. Em −5t², só o t está ao quadrado: −5 × t².' },
        { value: round(5 * k * k + v * k, 2), feedback: 'Isso ignora o sinal de menos: o termo −5t² puxa a altura para baixo.' },
      ],
      hints: [`Substitua t = ${num(k)}; primeiro, t² = ${num(k * k)}.`, `h = −5 × ${num(k * k)} + ${v} × ${num(k)}.`],
      solution: [`$h(${num(k)}) = −5 × ${num(k * k)} + ${v} × ${num(k)} = ${num(-5 * k * k)} + ${num(v * k)} = ${num(h)} m`],
    });
  }
}

/** Simetria: duas passagens pela mesma altura dão o instante do topo e o da volta ao chão. */
function symmetryGen(r: Rand) {
  for (;;) {
    const t1 = r.int(1, 4);
    const t2 = t1 + r.int(1, 6);
    const S = t1 + t2;
    if (S === 4 || S > 10) continue; // S = 4 é a função da questão do banco
    const H = 5 * t1 * t2;
    const askTop = r.next() < 0.5;
    return draftNumeric({
      prompt: [p(`Um foguete de garrafa PET, lançado do chão, descreve uma parábola. Ele passa pela altura de ${H} m em t = ${t1} s, subindo, e de novo em t = ${t2} s, descendo.`)],
      ask: askTop ? 'Em que instante o foguete atinge a altura máxima?' : 'Em que instante o foguete volta ao chão?',
      unit: 's',
      answer: askTop ? S / 2 : S,
      wrong: askTop
        ? [
            { value: t2 - t1, feedback: 'Isso é o tempo entre as duas passagens. O topo fica no meio delas: a média dos dois instantes.' },
            { value: S, feedback: 'Esse é o instante em que o foguete volta ao chão, e não o do ponto mais alto.' },
            { value: round((t2 - t1) / 2, 2), feedback: `Isso é metade do intervalo entre as passagens; falta somar a ${t1} s. O meio fica em (${t1} + ${t2}) ÷ 2.` },
          ]
        : [
            { value: round(S / 2, 2), feedback: 'Esse é o instante do ponto mais alto. A volta ao chão leva o dobro desse tempo.' },
            { value: 2 * t2 - t1, feedback: `Isso supõe que, depois da segunda passagem, a descida dura ${t2 - t1} s. Pela simetria, ela dura o mesmo que a subida do chão até a primeira passagem: ${t1} s.` },
            { value: 2 * t2, feedback: 'Isso dobra o instante da segunda passagem. A simetria é em torno do topo, e não do lançamento.' },
          ],
      hints: [
        'A parábola é simétrica: o topo fica exatamente no meio de duas passagens pela mesma altura.',
        askTop ? `Faça a média: (${t1} + ${t2}) ÷ 2.` : `O topo é em ${num(S / 2)} s; subir do chão até ele leva o mesmo tempo que descer dele até o chão.`,
      ],
      solution: askTop
        ? [`$topo: (${t1} + ${t2}) ÷ 2 = ${num(S / 2)} s`]
        : [`$topo: (${t1} + ${t2}) ÷ 2 = ${num(S / 2)} s`, `$volta ao chão: 2 × ${num(S / 2)} = ${S} s`],
    });
  }
}

// ———————————————————————————————————————————————— geradores: raízes

/** Quando volta ao chão: fatorar h(t) = t(v − 5t). */
function landingGen(r: Rand) {
  const fl = r.pick(FLIGHTS);
  const v = r.pick(fl.speeds.filter((s) => s !== 30)); // 30: exemplo da teoria
  const T = v / 5;
  return draftNumeric({
    prompt: [p(fl.intro(poly(-5, v, 0, 't')))],
    ask: `Quantos segundos depois ${fl.it} volta ${fl.back}?`,
    unit: 's',
    answer: round(T, 2),
    wrong: [
      { value: round(v / 10, 2), feedback: 'Esse é o instante do ponto mais alto, no meio do voo. A volta acontece no dobro desse tempo.' },
      { value: v, feedback: `Isso esquece o 5: de t(${v} − 5t) = 0 vem 5t = ${v}, e então t = ${v} ÷ 5.` },
      { value: round((v * v) / 20, 2), feedback: 'Esse número é a altura máxima, em metros, e não um tempo.' },
    ],
    hints: [`Coloque t em evidência: h(t) = t(${v} − 5t).`, `O produto é zero quando t = 0 (a saída) ou quando ${v} − 5t = 0.`],
    solution: [`$t(${v} − 5t) = 0 → t = 0 ou t = ${v} ÷ 5 = ${num(T)} s`],
  });
}

/** Fórmula de Bhaskara com raízes inteiras. */
function rootsGen(r: Rand) {
  for (;;) {
    const a = r.pick([1, 1, 2]);
    const r1 = r.int(-6, 5);
    const r2 = r1 + r.int(1, 9);
    if (r1 === 0 || r2 <= 0 || r1 + r2 === 0) continue;
    if (a === 1 && r1 === 2 && r2 === 5) continue; // exemplo da teoria
    const b = -a * (r1 + r2);
    const c = a * r1 * r2;
    const D = b * b - 4 * a * c;
    const sq = Math.sqrt(D);
    return draftNumeric({
      prompt: [p(`Resolva a equação ${poly(a, b, c)} = 0.`)],
      ask: 'Qual é a maior das raízes?',
      answer: r2,
      wrong: [
        { value: -r1, feedback: 'Isso usa +b no lugar de −b na fórmula: as raízes saem com o sinal trocado.' },
        { value: round((-b + D) / (2 * a), 2), feedback: 'Isso usa Δ no lugar de √Δ: a fórmula pede a raiz quadrada do discriminante.' },
        { value: 2 * r2, feedback: a === 1 ? 'Faltou dividir por 2a = 2.' : 'Isso divide só por 2; o denominador é 2a = 4.' },
      ],
      hints: [`a = ${a}, b = ${num(b)}, c = ${num(c)}: calcule Δ = b² − 4ac.`, `x = (−b ± √Δ) ÷ 2a, com −b = ${num(-b)}.`],
      solution: [`$Δ = ${par(b)}² − 4 × ${a} × ${par(c)} = ${D}`, `$x = (${num(-b)} ± ${sq}) ÷ ${2 * a}`, `$x = ${r2} ou x = ${num(r1)}`],
    });
  }
}

/** Quantas raízes reais? O sinal de Δ decide. */
function discriminantGen(r: Rand) {
  const p1 = r.int(-5, 5);
  const q1 = p1 + r.int(1, 6);
  const p2 = r.int(-4, 4);
  const q2 = p2 + r.int(1, 5);
  const m = r.pick([-4, -2, -1, 1, 2, 3, 4, 5]); // −3 daria x² + 6x + 9, a resposta do laboratório
  const nb = r.int(-4, 4);
  const eqs = [
    { a: 1, b: -(p1 + q1), c: p1 * q1, bin: 0 },
    { a: -1, b: p2 + q2, c: -p2 * q2, bin: 0 },
    { a: 1, b: -2 * m, c: m * m, bin: 1 },
    { a: 1, b: nb, c: Math.floor((nb * nb) / 4) + r.int(1, 6), bin: 2 },
  ];
  return {
    kind: 'classify' as const,
    ask: 'Classifique cada equação pelo número de raízes reais.',
    bins: ['Duas raízes reais', 'Uma raiz real (dupla)', 'Nenhuma raiz real'],
    items: r.shuffle(eqs).map((e) => {
      const D = e.b * e.b - 4 * e.a * e.c;
      return {
        text: `${poly(e.a, e.b, e.c)} = 0`,
        bin: e.bin,
        why: `Δ = ${par(e.b)}² − 4 × ${par(e.a)} × ${par(e.c)} = ${num(D)}${D > 0 ? ', positivo' : D === 0 ? '' : ', negativo'}.`,
      };
    }),
    hints: ['Calcule Δ = b² − 4ac em cada equação.', 'Δ > 0: duas raízes; Δ = 0: uma raiz (dupla); Δ < 0: nenhuma raiz real.'],
    solution: ['O sinal do discriminante decide: Δ > 0, duas raízes reais; Δ = 0, uma raiz dupla; Δ < 0, nenhuma raiz real.'],
  };
}

const RECTS = [
  { what: 'Um terreno retangular', unit: 'm', xs: [8, 30], ds: [2, 12] },
  { what: 'Um cartaz retangular', unit: 'cm', xs: [20, 60], ds: [5, 20] },
  { what: 'Uma horta retangular', unit: 'm', xs: [3, 12], ds: [1, 6] },
];

/** Área com lados x e x + d: equação do 2º grau com uma raiz que não serve. */
function areaRootGen(r: Rand) {
  for (;;) {
    const g = r.pick(RECTS);
    const x = r.int(g.xs[0], g.xs[1]);
    const d = r.int(g.ds[0], g.ds[1]);
    if (g.unit === 'm' && x === 5 && d === 3) continue; // exercício da teoria
    const A = x * (x + d);
    return draftNumeric({
      prompt: [p(`${g.what} tem um lado ${d} ${g.unit} maior que o outro e área de ${num(A)} ${g.unit}².`)],
      ask: 'Quanto mede o lado menor?',
      unit: g.unit,
      answer: x,
      wrong: [
        { value: round(Math.sqrt(A), 2), feedback: `Isso supõe um quadrado (√${num(A)}). Os lados são diferentes: x(x + ${d}) = ${num(A)}.` },
        { value: x + d, feedback: 'Esse é o lado maior. A pergunta é o menor.' },
        { value: -(x + d), feedback: 'Essa é a outra raiz da equação, mas um lado não pode ser negativo.' },
      ],
      hints: [`Chame o lado menor de x: x(x + ${d}) = ${num(A)}, ou seja, ${poly(1, d, -A)} = 0.`, `Δ = ${d * d} + ${num(4 * A)} = ${num((2 * x + d) ** 2)}, e √Δ = ${2 * x + d}.`],
      solution: [`$${poly(1, d, -A)} = 0`, `$x = (−${d} ± ${2 * x + d}) ÷ 2 → x = ${x} (a outra raiz, −${x + d}, não serve)`],
    });
  }
}

/** Em que instante passa por uma altura, já descendo: equação completa. */
function heightTimeGen(r: Rand) {
  for (;;) {
    const t1 = r.int(1, 4);
    const t2 = t1 + r.int(1, 6);
    const S = t1 + t2;
    if (S === 4 || S > 10) continue; // S = 4 é a função da questão do banco
    const v = 5 * S;
    const H = 5 * t1 * t2;
    return draftNumeric({
      prompt: [p(`Um foguete de garrafa PET é lançado do chão, e sua altura, em metros, t segundos depois, é h(t) = ${poly(-5, v, 0, 't')}.`)],
      ask: `Em que instante, já descendo, o foguete passa pela altura de ${H} m?`,
      unit: 's',
      answer: t2,
      wrong: [
        { value: t1, feedback: `Em t = ${t1} s o foguete passa por ${H} m subindo. Na descida, é a outra raiz.` },
        { value: round(S / 2, 2), feedback: 'Esse é o instante do ponto mais alto. A altura pedida é atingida duas vezes, uma antes e outra depois dele.' },
        { value: S, feedback: 'Esse é o instante em que o foguete volta ao chão (h = 0), e não o da altura pedida.' },
      ],
      hints: [`Iguale ${poly(-5, v, 0, 't')} = ${H} e divida tudo por −5: ${poly(1, -S, t1 * t2, 't')} = 0.`, 'As duas raízes são os instantes da subida e da descida.'],
      solution: [`$${poly(1, -S, t1 * t2, 't')} = 0`, `$Δ = ${S * S} − ${4 * t1 * t2} = ${(t2 - t1) ** 2} → t = (${S} ± ${t2 - t1}) ÷ 2`, `$t = ${t1} s (subindo) ou t = ${t2} s (descendo)`],
    });
  }
}

// ———————————————————————————————————————————————— geradores: vértice

const GOODS = [
  { who: 'uma confecção', item: 'camisetas' },
  { who: 'uma cooperativa', item: 'potes de geleia' },
  { who: 'uma cozinha industrial', item: 'marmitas' },
];

/** Lucro máximo (ou a quantidade que o dá) no vértice de L(x) = ax² + bx − c. */
function vertexProfitGen(r: Rand) {
  for (;;) {
    const g = r.pick(GOODS);
    const a = r.pick([-1, -1, -2]);
    const xv = r.int(5, 25);
    const Lmax = 5 * r.int(2, 30);
    const c = -a * xv * xv - Lmax;
    if (c <= 0) continue;
    const b = -2 * a * xv;
    if (a === -1 && b === 40 && c === 300) continue; // questão do banco
    const askMax = r.next() < 0.6;
    return draftNumeric({
      prompt: [p(`${cap(g.who)} estima que, vendendo x centenas de ${g.item} por mês, terá lucro de L(x) = ${poly(a, b, -c)} mil reais.`)],
      ask: askMax ? 'Qual é o lucro máximo, em milhares de reais?' : `Quantas centenas de ${g.item} dão o lucro máximo?`,
      answer: askMax ? Lmax : xv,
      wrong: askMax
        ? [
            { value: xv, feedback: `Esse é o x do vértice: a quantidade (${xv} centenas) que dá o lucro máximo. O lucro é L(${xv}).` },
            { value: -a * xv * xv, feedback: `Isso esquece o termo −${num(c)}: os custos fixos também entram em L(${xv}).` },
            { value: -3 * a * xv * xv - c, feedback: `Isso calcula ${a === -1 ? '−x²' : '−2x²'} como positivo. Com x = ${xv}, o primeiro termo vale ${num(a * xv * xv)}.` },
          ]
        : [
            { value: b, feedback: `Isso usa b sem dividir por 2a: x = −${b} ÷ (${num(2 * a)}).` },
            { value: round(b / 2, 2), feedback: `Isso divide só por 2; o denominador é 2a = ${num(2 * a)}.` },
            { value: Lmax, feedback: 'Esse é o lucro máximo, em milhares de reais. A pergunta é a quantidade.' },
          ],
      hints: [`O máximo está no vértice: x = −b ÷ 2a = −${b} ÷ (${num(2 * a)}).`, askMax ? `Calcule L(${xv}).` : 'O resultado já sai em centenas.'],
      solution: [`$x = −${b} ÷ (${num(2 * a)}) = ${xv}`, `$L(${xv}) = ${num(a * xv * xv)} + ${num(b * xv)} − ${num(c)} = ${Lmax}`],
    });
  }
}

/** Cercado de área máxima: com muro (três lados de tela) ou com os quatro lados. */
function fenceGen(r: Rand) {
  for (;;) {
    const wall = r.next() < 0.6;
    const P = r.pick([24, 32, 40, 48, 60, 80, 100, 120]);
    if (wall && P === 40) continue; // laboratório da teoria
    if (wall) {
      const askSide = r.next() < 0.4;
      return draftNumeric({
        prompt: [p(`Com ${P} m de tela, um sitiante vai cercar um galinheiro retangular encostado num muro: a tela fica só nos outros três lados.`)],
        ask: askSide ? 'Para a área ser a maior possível, quanto deve medir o lado paralelo ao muro?' : 'Qual é a maior área que o galinheiro pode ter?',
        unit: askSide ? 'm' : 'm²',
        answer: askSide ? P / 2 : (P * P) / 8,
        wrong: askSide
          ? [
              { value: P / 4, feedback: `Esse é o lado perpendicular ao muro (x = ${num(P / 4)} m). O paralelo mede ${P} − 2x.` },
              { value: round(P / 3, 2), feedback: 'Isso divide a tela em três lados iguais. Na área máxima, o lado paralelo ao muro é o dobro do outro.' },
            ]
          : [
              { value: (P * P) / 16, feedback: 'Essa é a área do quadrado com tela nos quatro lados. Com o muro, um lado sai de graça, e a área máxima é maior.' },
              { value: round((P * P) / 9, 2), feedback: 'Isso divide a tela em três lados iguais. Na área máxima, o lado paralelo ao muro é o dobro do outro.' },
              { value: P / 4, feedback: 'Esse é o lado perpendicular ao muro, em metros (o x do vértice), e não a área.' },
            ],
        hints: [`Com x nos lados perpendiculares ao muro, o lado paralelo mede ${P} − 2x, e A(x) = x(${P} − 2x).`, `A(x) = ${poly(-2, P, 0)}: o vértice está em x = ${P} ÷ 4.`],
        solution: [`$A(x) = ${poly(-2, P, 0)} → x = −${P} ÷ (−4) = ${num(P / 4)} m`, `$lado paralelo: ${P} − 2 × ${num(P / 4)} = ${num(P / 2)} m; área: ${num(P / 4)} × ${num(P / 2)} = ${num((P * P) / 8)} m²`],
      });
    }
    return draftNumeric({
      prompt: [p(`Com ${P} m de tela, uma escola vai cercar uma horta retangular, com tela nos quatro lados.`)],
      ask: 'Qual é a maior área que a horta pode ter?',
      unit: 'm²',
      answer: (P * P) / 16,
      wrong: [
        { value: (P * P) / 8, feedback: 'Isso seria com um muro aproveitado como um dos lados. Aqui a tela cerca os quatro.' },
        { value: P / 4, feedback: 'Esse é o lado do quadrado, em metros, e não a área.' },
        { value: (P * P) / 4, feedback: `Isso usa ${num(P / 2)} m como lado de um quadrado. Num retângulo de perímetro ${P} m, dois lados vizinhos somam ${num(P / 2)} m.` },
      ],
      hints: [`Com lados x e ${num(P / 2)} − x, a área é A(x) = x(${num(P / 2)} − x).`, `O vértice está em x = ${num(P / 4)}: o retângulo de maior área é um quadrado.`],
      solution: [`$A(x) = ${poly(-1, P / 2, 0)} → x = ${num(P / 4)} m`, `$área máxima: ${num(P / 4)} × ${num(P / 4)} = ${num((P * P) / 16)} m²`],
    });
  }
}

/** Altura máxima (ou o instante dela) de h(t) = −5t² + vt + h₀. */
function maxHeightGen(r: Rand) {
  for (;;) {
    const v = r.pick([10, 15, 20, 25, 30, 40]);
    const h0 = r.pick([0, 1, 2, 5, 10]);
    if (h0 === 0 && v === 20) continue; // questão do banco
    if (v === 30 && (h0 === 0 || h0 === 2)) continue; // laboratório e exercício da teoria
    const tv = v / 10;
    const top = h0 + (v * v) / 20;
    const askTop = r.next() < 0.6;
    return draftNumeric({
      prompt: [p(`Um foguete de garrafa PET é lançado ${h0 === 0 ? 'do chão' : `de uma plataforma a ${h0} m do chão`}, e sua altura, em metros, t segundos depois, é h(t) = ${poly(-5, v, h0, 't')}.`)],
      ask: askTop ? 'Qual é a altura máxima atingida?' : 'Em que instante o foguete atinge a altura máxima?',
      unit: askTop ? 'm' : 's',
      answer: askTop ? round(top, 2) : tv,
      wrong: askTop
        ? [
            { value: tv, feedback: `Esse é o instante do topo (t = ${num(tv)} s). A altura é h(${num(tv)}).` },
            { value: round(h0 + (3 * v * v) / 20, 2), feedback: `Isso troca o sinal de −5t²: com t = ${num(tv)}, o primeiro termo vale −5 × ${num(tv * tv)} = ${num(-5 * tv * tv)}.` },
            { value: round(h0 + (v * v) / 10, 2), feedback: 'Isso esquece o termo −5t²: só soma a parte que sobe.' },
            { value: round((v * v) / 20, 2), feedback: `Isso esquece os ${h0} m da plataforma, de onde o foguete partiu.` },
          ]
        : [
            { value: v / 5, feedback: 'Isso divide por 5, e não por 2a = −10. O vértice é t = −b ÷ 2a.' },
            { value: v, feedback: 'Faltou dividir por 2a = −10: t = −b ÷ 2a.' },
            { value: round(top, 2), feedback: 'Essa é a altura máxima, em metros. A pergunta é o instante.' },
          ],
      hints: [`O topo é o vértice: t = −b ÷ 2a = −${v} ÷ (−10).`, askTop ? `Calcule h(${num(tv)}).` : 'O resultado já está em segundos.'],
      solution: [`$t = −${v} ÷ (−10) = ${num(tv)} s`, `$h(${num(tv)}) = ${num(-5 * tv * tv)} + ${num(v * tv)}${h0 ? ` + ${h0}` : ''} = ${num(top)} m`],
    });
  }
}

const MINS = [
  {
    a: 1,
    xs: [3, 12],
    lows: [5, 40],
    intro: (f: string) => `O custo médio de produção de uma fábrica de bolsas, em reais por bolsa, é C(x) = ${f}, em que x é a produção diária, em dezenas de bolsas.`,
    askLow: 'Qual é o menor custo médio possível?',
    askWhere: 'Quantas dezenas de bolsas por dia dão o menor custo médio?',
    money: true,
    unitWhere: 'dezenas',
    fn: 'C',
    v: 'x',
  },
  {
    a: 0.5,
    xs: [2, 5],
    lows: [2, 10],
    intro: (f: string) => `Numa cidade serrana, a temperatura, em °C, t horas depois da meia-noite, seguiu T(t) = ${f} durante a madrugada.`,
    askLow: 'Qual foi a menor temperatura da madrugada?',
    askWhere: 'Quantas horas depois da meia-noite a temperatura foi a menor?',
    money: false,
    unitWhere: 'h',
    fn: 'T',
    v: 't',
  },
];

/** Mínimo de uma parábola que abre para cima: custo médio ou temperatura. */
function minGen(r: Rand) {
  const g = r.pick(MINS);
  const xv = r.int(g.xs[0], g.xs[1]);
  const low = r.int(g.lows[0], g.lows[1]);
  const b = -2 * g.a * xv;
  const c = low + g.a * xv * xv;
  const askLow = r.next() < 0.6;
  return draftNumeric({
    prompt: [p(g.intro(poly(g.a, b, c, g.v)))],
    ask: askLow ? g.askLow : g.askWhere,
    ...(askLow ? (g.money ? { prefix: 'R$' } : { unit: '°C' }) : { unit: g.unitWhere }),
    answer: askLow ? low : xv,
    wrong: askLow
      ? [
          { value: xv, feedback: `Esse é o ${g.v} do vértice, onde o mínimo acontece. O valor mínimo é ${g.fn}(${xv}).` },
          { value: round(c, 2), feedback: `Esse é o valor em ${g.v} = 0, o ponto de partida, e não o mínimo.` },
          { value: round(c + 3 * g.a * xv * xv, 2), feedback: `Isso soma todos os termos, ignorando o sinal de menos: ${g.fn}(${xv}) = ${num(g.a * xv * xv)} − ${num(-b * xv)} + ${num(c)}.` },
        ]
      : [
          { value: 2 * xv, feedback: g.a === 1 ? `Faltou dividir por 2a = 2: ${g.v} = ${num(-b)} ÷ 2 = ${xv}.` : `Isso divide por a = ${num(g.a)}, e não por 2a = ${num(2 * g.a)}: ${g.v} = ${num(-b)} ÷ ${num(2 * g.a)} = ${xv}.` },
          { value: low, feedback: 'Esse é o valor mínimo, e não onde ele acontece.' },
          ...(g.money ? [{ value: 10 * xv, feedback: `Isso converte para bolsas: ${xv} dezenas são ${10 * xv} bolsas, mas a pergunta pede dezenas.` }] : []),
        ],
    hints: [`a = ${num(g.a)} > 0: a parábola abre para cima, e o vértice é o ponto mais baixo.`, `${g.v} do vértice = −b ÷ 2a = ${num(-b)} ÷ ${num(2 * g.a)}.`],
    solution: [`$${g.v} = ${num(-b)} ÷ ${num(2 * g.a)} = ${xv}`, `$${g.fn}(${xv}) = ${num(g.a * xv * xv)} − ${num(-b * xv)} + ${num(c)} = ${low}`],
  });
}

// ———————————————————————————————————————————————— geradores: maestria

const SALES = [
  { who: 'Um teatro', items: 'ingressos', per: 'por sessão', of: 'do ingresso' },
  { who: 'Uma lanchonete', items: 'lanches', per: 'por dia', of: 'do lanche' },
];

/** Receita = preço × quantidade, com a quantidade crescendo a cada real de desconto. */
function revenueGen(r: Rand) {
  for (;;) {
    const s = r.pick(SALES);
    const p0 = r.pick([20, 25, 30, 40, 50, 60]);
    const m = r.int(2, 8);
    const k = r.pick([5, 10, 20, 25]);
    if (p0 - 2 * m < 4 || p0 === 3 * m) continue;
    const N = k * (p0 - 2 * m);
    if (p0 === 30 && N === 200 && k === 10) continue; // exemplo da teoria
    const best = p0 - m;
    const askPrice = r.next() < 0.5;
    return draftNumeric({
      prompt: [p(`${s.who} vende ${num(N)} ${s.items} ${s.per} a ${brl(p0)} cada. Uma pesquisa indica que, a cada R$ 1,00 de desconto no preço, vende ${k} ${s.items} a mais.`)],
      ask: askPrice ? `Qual preço ${s.of} dá a maior receita?` : 'Qual é a maior receita possível?',
      prefix: 'R$',
      answer: askPrice ? best : k * best * best,
      wrong: askPrice
        ? [
            { value: m, feedback: `Esse é o desconto ideal (d = ${m}). O preço é ${num(p0)} − ${m}.` },
            { value: p0, feedback: 'Manter o preço não maximiza a receita: um pequeno desconto aumenta as vendas o bastante para compensar.' },
            { value: p0 - 2 * m, feedback: 'Isso esquece o 2 de −b ÷ 2a: o desconto sai dobrado.' },
          ]
        : [
            { value: p0 * N, feedback: 'Essa é a receita sem desconto. Com o desconto ideal, as vendas crescem o bastante para a receita aumentar.' },
            { value: best * N, feedback: `Isso aplica o desconto sem contar os ${num(k * m)} ${s.items} a mais que ele faz vender.` },
            { value: best, feedback: 'Esse é o preço ideal, e não a receita. A receita é preço × quantidade vendida.' },
          ],
      hints: [`Com d reais de desconto: R(d) = (${num(p0)} − d)(${num(N)} + ${k}d).`, `Expandindo, R(d) = ${poly(-k, k * p0 - N, p0 * N, 'd')}; o máximo está em d = −b ÷ 2a.`],
      solution: [
        `$R(d) = ${poly(-k, k * p0 - N, p0 * N, 'd')}`,
        `$d = ${num(k * p0 - N)} ÷ ${2 * k} = ${m} → preço ${brl(best)}, vendas ${num(N + k * m)}`,
        `$receita máxima: ${num(best)} × ${num(N + k * m)} = ${brl(k * best * best)}`,
      ],
    });
  }
}

/** Lucro positivo: entre as raízes de uma parábola que abre para baixo. */
function profitRangeGen(r: Rand) {
  const g = r.pick(GOODS);
  const a = r.pick([-1, -1, -2]);
  const r1 = r.int(2, 8);
  const r2 = r1 + 2 * r.int(2, 6);
  const xv = (r1 + r2) / 2;
  const b = -a * (r1 + r2);
  const c = a * r1 * r2;
  return draftChoice({
    prompt: [p(`${cap(g.who)} estima que, vendendo x centenas de ${g.item} por mês, terá lucro de L(x) = ${poly(a, b, c)} mil reais.`)],
    ask: 'Para quais quantidades o lucro é positivo?',
    options: [
      ok(`Entre ${r1} e ${r2} centenas`),
      no(`Acima de ${r2} centenas`, 'Acima da maior raiz, a parábola (que abre para baixo) fica abaixo do eixo x: prejuízo.'),
      no(`Abaixo de ${r1} centenas`, 'Abaixo da menor raiz, as vendas não cobrem os custos fixos: o lucro é negativo.'),
      no(`Somente em ${xv} centenas`, `Em ${xv} centenas o lucro é máximo, mas não é o único valor com lucro: todo x entre as raízes dá L(x) > 0.`),
      no(`Entre 0 e ${xv} centenas`, `Até ${r1} centenas o lucro ainda é negativo; e depois de ${xv} ele diminui, mas continua positivo até ${r2}.`),
    ],
    hints: ['Ache as raízes de L(x) = 0: são as quantidades de lucro zero.', 'Como a < 0, a parábola fica acima do eixo x entre as raízes.'],
    solution: [`$L(x) = 0 → x = ${r1} ou x = ${r2}`, `Como a = ${num(a)} < 0, L(x) > 0 só entre as raízes: de ${r1} a ${r2} centenas.`],
  });
}

// ———————————————————————————————————————————————— aula

export const FUNCAO_QUADRATICA = lesson({
  id: 'funcao-quadratica',
  topic: 'funcoes',
  subtopics: ['funcao-quadratica'],
  title: 'Função quadrática',
  summary: 'A parábola de f(x) = ax² + bx + c: concavidade e simetria, raízes por fatoração e por Bhaskara, o discriminante, o vértice em problemas de máximo e mínimo e a receita que depende do preço.',
  requires: ['funcao-afim'],
  stages: [
    stage('parabola', 'descoberta', 'A parábola', 'Reconhecer uma função quadrática e sua parábola, ler a concavidade pelo sinal de a, calcular valores e usar a simetria da parábola.', () => ({
      learn: [
        text('Uma **função quadrática** tem a forma f(x) = ax² + bx + c, com a ≠ 0. Seu gráfico é uma **parábola**. Se a < 0, ela abre para baixo e tem um ponto mais alto (máximo); se a > 0, abre para cima e tem um ponto mais baixo (mínimo). O número c é o valor de f em x = 0: onde a parábola corta o eixo vertical.'),
        lab({
          title: 'Foguete de garrafa PET',
          intro: 'A altura do foguete, em metros, t segundos após o lançamento, é h(t) = −5t² + vt + h₀. Escolha a velocidade de lançamento v e a altura de partida h₀.',
          params: [
            { key: 'v', label: 'Velocidade de lançamento (v)', min: 10, max: 40, step: 5, value: 10, format: (v) => `${v} m/s` },
            { key: 'h0', label: 'Altura de partida (h₀)', min: 0, max: 15, step: 5, value: 0, format: (v) => `${v} m` },
          ],
          readouts: ({ v, h0 }) => [
            { label: 'Função', value: `h(t) = ${poly(-5, v, h0, 't')}` },
            { label: 'Altura máxima', value: `${num(h0 + (v * v) / 20)} m`, big: true, tone: 'brass' },
            { label: 'Instante do topo', value: `${num(v / 10)} s` },
            { label: 'Volta ao chão', value: `${num((v + Math.sqrt(v * v + 20 * h0)) / 10)} s` },
          ],
          viz: ({ v, h0 }) => {
            const T = (v + Math.sqrt(v * v + 20 * h0)) / 10;
            const top = h0 + (v * v) / 20;
            return {
              kind: 'chart',
              xLabel: 'tempo (s)',
              yLabel: 'altura (m)',
              xMin: 0,
              xMax: 9,
              yMin: 0,
              yMax: 100,
              series: [{ label: 'altura do foguete', tone: 'ember', points: sample(0, T, 30, (t) => Math.max(0, -5 * t * t + v * t + h0)) }],
              markers: [{ x: v / 10, y: top, label: `topo: ${num(top)} m`, tone: 'brass' }],
              summary: `Com v = ${v} m/s e saída a ${h0} m, o foguete sobe até ${num(top)} m em ${num(v / 10)} s e volta ao chão em ${num(T)} s`,
            };
          },
          goal: {
            task: 'Lançando do chão, faça o foguete atingir exatamente 45 m de altura máxima.',
            done: ({ v, h0 }) => h0 === 0 && v === 30,
            success: 'Isso: com v = 30, o topo é em t = 3 s, e h(3) = −45 + 90 = 45 m. Repare: dobrar a velocidade quadruplica a altura máxima.',
          },
          insight: 'Lançado do chão, o foguete leva o mesmo tempo para subir até o topo e para descer dele: a parábola é simétrica.',
        }),
        warn('Cuidado com −5t²', 'Em −5t², só o t está ao quadrado: para t = 3, o termo vale −5 × 9 = −45 (e não (−15)² = 225).'),
        example('Valores e simetria', 'Para f(x) = x² − 6x + 5, calcule f(0), f(2) e f(4). O que os resultados dizem sobre a parábola?', [
          step('Substituindo:', 'f(0) = 5 (o valor de c)', 'f(2) = 4 − 12 + 5 = −3', 'f(4) = 16 − 24 + 5 = −3'),
          askStep('f(2) e f(4) são iguais.', 'Onde fica o eixo de simetria da parábola?', [
            ok('Em x = 3, no meio entre 2 e 4'),
            no('Em x = 6, a soma 2 + 4', 'O eixo fica no meio dos dois pontos de mesma altura: (2 + 4) ÷ 2 = 3.'),
          ]),
          step('No eixo de simetria está o vértice:', 'f(3) = 9 − 18 + 5 = −4, o valor mínimo (a = 1 > 0: abre para cima)'),
        ], 'A parábola é simétrica em relação a x = 3, onde fica o mínimo, −4.'),
        check(classify({
          ask: 'Classifique cada função pela concavidade da parábola.',
          bins: ['Abre para cima (tem mínimo)', 'Abre para baixo (tem máximo)'],
          items: [
            { text: 'f(x) = 2x² − 3x + 1', bin: 0, why: 'a = 2, positivo.' },
            { text: 'h(t) = −5t² + 30t', bin: 1, why: 'a = −5: a altura sobe, para e desce.' },
            { text: 'L(x) = −x² + 14x − 40', bin: 1, why: 'a = −1: o lucro tem um máximo.' },
            { text: 'C(x) = 0,5x² − 8x + 50', bin: 0, why: 'a = 0,5, positivo: o custo tem um mínimo.' },
            { text: 'f(x) = 3 − x²', bin: 1, why: 'O termo com x² é −x²: a = −1, mesmo escrito depois do 3.' },
            { text: 'g(x) = x² − 9', bin: 0, why: 'a = 1; o −9 é o c e não muda a concavidade.' },
          ],
          solution: ['Só o sinal de a, o coeficiente de x², decide: a > 0, abre para cima; a < 0, abre para baixo.'],
        })),
      ],
      practice: [gen(evalQuadGen), gen(symmetryGen), gen(evalQuadGen)],
      challenge: [gen(symmetryGen), gen(evalQuadGen), gen(symmetryGen)],
      recap: [
        'f(x) = ax² + bx + c, com a ≠ 0: o gráfico é uma parábola.',
        'a > 0: abre para cima (mínimo); a < 0: abre para baixo (máximo).',
        'Pontos de mesma altura são simétricos em torno do vértice.',
      ],
    })),

    stage('raizes', 'fundamentos', 'Raízes', 'Encontrar as raízes de uma função quadrática por fatoração ou pela fórmula de Bhaskara e usar o discriminante para saber quantas raízes reais existem.', () => ({
      learn: [
        text('As **raízes** (ou zeros) são os valores de x em que f(x) = 0: onde a parábola corta o eixo x. Num lançamento, são os instantes em que o objeto está no chão. Sem o termo independente (c = 0), basta fatorar: −5t² + 30t = t(30 − 5t) = 0 dá t = 0 ou t = 6. No caso geral, use a **fórmula de Bhaskara**; o **discriminante** Δ diz quantas raízes reais existem: Δ > 0, duas; Δ = 0, uma (dupla); Δ < 0, nenhuma.'),
        math('Δ = b² − 4ac', 'x = [[−b ± √Δ|2a]]'),
        lab({
          title: 'Quantas raízes?',
          intro: 'Mexa em b e c na parábola f(x) = x² + bx + c e veja quantas vezes ela corta o eixo x.',
          params: [
            { key: 'b', label: 'Coeficiente b', min: -10, max: 10, step: 1, value: 2, format: (v) => num(v) },
            { key: 'c', label: 'Coeficiente c', min: -10, max: 12, step: 1, value: 5, format: (v) => num(v) },
          ],
          readouts: ({ b, c }) => {
            const D = b * b - 4 * c;
            return [
              { label: 'Função', value: `f(x) = ${poly(1, b, c)}` },
              { label: 'Δ = b² − 4c', value: num(D), big: true, tone: D > 0 ? 'verdigris' : D === 0 ? 'brass' : 'ember' },
              { label: 'Raízes reais', value: D > 0 ? `${num((-b - Math.sqrt(D)) / 2)} e ${num((-b + Math.sqrt(D)) / 2)}` : D === 0 ? `uma só: ${num(-b / 2)}` : 'nenhuma' },
            ];
          },
          viz: ({ b, c }) => {
            const D = b * b - 4 * c;
            const roots = D > 0 ? [(-b - Math.sqrt(D)) / 2, (-b + Math.sqrt(D)) / 2] : D === 0 ? [-b / 2] : [];
            return {
              kind: 'chart',
              xLabel: 'x',
              yLabel: 'f(x)',
              xMin: -10,
              xMax: 10,
              yMin: -40,
              yMax: 60,
              series: [{ label: 'f(x)', tone: 'iris', points: sample(-10, 10, 40, (x) => x * x + b * x + c).filter(([, y]) => y <= 60) }],
              markers: roots.map((x0) => ({ x: x0, y: 0, label: `x = ${num(x0)}`, tone: 'brass' as const })),
              summary: D > 0 ? `A parábola corta o eixo x em dois pontos (Δ = ${num(D)})` : D === 0 ? 'A parábola toca o eixo x em um só ponto (Δ = 0)' : `A parábola não toca o eixo x (Δ = ${num(D)})`,
            };
          },
          goal: {
            task: 'Com c = 9, ache o valor positivo de b que faz a parábola tocar o eixo x em um só ponto.',
            done: ({ b, c }) => c === 9 && b === 6,
            success: 'Isso: com b = 6 e c = 9, Δ = 36 − 36 = 0, e a única raiz é x = −3. Na verdade, x² + 6x + 9 = (x + 3)².',
          },
          insight: 'Subir ou descer a parábola (mudar c) muda o número de raízes; Δ antecipa isso sem precisar desenhar.',
        }),
        example('Bhaskara passo a passo', 'Resolva x² − 7x + 10 = 0.', [
          step('Coeficientes e discriminante:', 'a = 1, b = −7, c = 10', 'Δ = (−7)² − 4 × 1 × 10 = 49 − 40 = 9'),
          askStep('Na fórmula, o numerador começa com −b.', 'Quanto vale −b?', [
            ok('7'),
            no('−7', 'b já é −7; então −b = −(−7) = 7. Esse sinal duplo é a armadilha mais comum.'),
          ]),
          step('Fórmula:', 'x = (7 ± 3) ÷ 2', 'x = 5 ou x = 2'),
        ], 'As raízes são 2 e 5. Confira: 4 − 14 + 10 = 0 e 25 − 35 + 10 = 0.'),
        check(numeric({
          prompt: [p('Um terreno retangular tem um lado 3 m maior que o outro e área de 40 m².')],
          ask: 'Quanto mede o lado menor?',
          unit: 'm',
          answer: 5,
          wrong: [
            { value: 6.32, feedback: 'Isso supõe um quadrado (√40 ≈ 6,32). Os lados são diferentes: x(x + 3) = 40.' },
            { value: 8, feedback: 'Esse é o lado maior. A pergunta é o menor.' },
            { value: -8, feedback: 'Essa é a outra raiz da equação, mas um lado não pode ser negativo.' },
          ],
          solution: ['$x(x + 3) = 40 → x² + 3x − 40 = 0', '$Δ = 9 + 160 = 169 → x = (−3 ± 13) ÷ 2', '$x = 5 (a raiz −8 não serve)'],
        })),
      ],
      practice: [gen(landingGen), gen(rootsGen), gen(areaRootGen), gen(discriminantGen)],
      challenge: [gen(rootsGen), gen(areaRootGen), gen(heightTimeGen)],
      recap: [
        'Raízes: f(x) = 0, onde a parábola corta o eixo x.',
        'Sem termo independente, fatore: x(ax + b) = 0.',
        'Bhaskara: Δ = b² − 4ac e x = (−b ± √Δ) ÷ 2a; o sinal de Δ dá o número de raízes.',
      ],
    })),

    stage('vertice', 'aplicacoes', 'Vértice: máximos e mínimos', 'Calcular o vértice da parábola e usá-lo em problemas de máximo e mínimo: lucro, área, altura, custo e temperatura.', () => ({
      learn: [
        text('O **vértice** é o ponto de virada da parábola: o mais alto quando a < 0, o mais baixo quando a > 0. Ele fica no meio das raízes, em x = −b ÷ 2a, e o valor máximo (ou mínimo) é f nesse ponto. Em problemas, o x do vértice responde "quanto produzir", "que medida" ou "quando"; o valor de f responde "qual é o maior (ou o menor) resultado".'),
        math('x do vértice = [[−b|2a]]', 'valor máximo ou mínimo = f(x do vértice)'),
        lab({
          title: 'O galinheiro encostado no muro',
          intro: 'São 40 m de tela para três lados de um galinheiro retangular; o muro faz o quarto lado. Escolha a medida x dos lados perpendiculares ao muro.',
          params: [{ key: 'x', label: 'Lado perpendicular ao muro (x)', min: 1, max: 19, step: 1, value: 4, format: (v) => `${v} m` }],
          readouts: ({ x }) => [
            { label: 'Lado paralelo ao muro', value: `${40 - 2 * x} m` },
            { label: 'Área', value: `${num(x * (40 - 2 * x))} m²`, big: true, tone: 'brass' },
          ],
          viz: ({ x }) => ({
            kind: 'chart',
            xLabel: 'x (m)',
            yLabel: 'área (m²)',
            xMin: 0,
            xMax: 20,
            yMin: 0,
            yMax: 220,
            series: [{ label: 'A(x) = x(40 − 2x)', tone: 'verdigris', points: sample(0, 20, 40, (t) => t * (40 - 2 * t)) }],
            markers: [{ x, y: x * (40 - 2 * x), label: `${num(x * (40 - 2 * x))} m²`, tone: 'brass' }],
            summary: `Com x = ${x} m, o galinheiro mede ${x} m por ${40 - 2 * x} m e tem ${num(x * (40 - 2 * x))} m² de área`,
          }),
          goal: {
            task: 'Ache a medida x que dá a maior área possível.',
            done: ({ x }) => x === 10,
            success: 'Isso: x = 10 m dá 10 × 20 = 200 m², o vértice de A(x) = −2x² + 40x. Pela fórmula, x = −40 ÷ (2 × (−2)) = 10, sem tentativas.',
          },
          insight: 'A área cresce, atinge o máximo no vértice e depois diminui: medidas simétricas em torno de 10 m (como 6 m e 14 m) dão a mesma área.',
        }),
        key('Onde e quanto', 'O x do vértice diz onde está o máximo (ou o mínimo); para saber quanto ele vale, substitua esse x na função. Confundir os dois é o erro mais comum.'),
        example('Preço do lucro máximo', 'O lucro diário de uma doceria, em reais, quando ela cobra x reais por caixa de doces, é L(x) = −2x² + 48x − 160. Qual preço dá o lucro máximo, e de quanto é esse lucro?', [
          step('x do vértice:', 'x = −48 ÷ (2 × (−2)) = −48 ÷ (−4) = 12'),
          askStep('O preço ideal é R$ 12,00.', 'E o lucro máximo?', [
            ok('L(12) = −288 + 576 − 160 = R$ 128,00'),
            no('R$ 12,00', 'R$ 12,00 é o preço que dá o máximo (o x do vértice). O lucro é o valor de L nesse ponto: L(12).'),
          ]),
        ], 'Cobrando R$ 12,00 por caixa, o lucro diário máximo é R$ 128,00.'),
        check(numeric({
          prompt: [p('Um foguete de garrafa PET é lançado de uma plataforma, e sua altura, em metros, t segundos depois, é h(t) = −5t² + 30t + 2.')],
          ask: 'Qual é a altura máxima atingida?',
          unit: 'm',
          answer: 47,
          wrong: [
            { value: 3, feedback: 'Esse é o instante do topo (t = −30 ÷ (−10) = 3 s). A altura é h(3).' },
            { value: 137, feedback: 'Isso troca o sinal de −5t²: com t = 3, o primeiro termo vale −5 × 9 = −45.' },
            { value: 45, feedback: 'Isso esquece os 2 m da plataforma: h(3) = −45 + 90 + 2.' },
          ],
          solution: ['$t = −30 ÷ (2 × (−5)) = 3 s', '$h(3) = −45 + 90 + 2 = 47 m'],
        })),
      ],
      practice: [gen(vertexProfitGen), gen(maxHeightGen), gen(fenceGen), gen(minGen)],
      challenge: [gen(fenceGen), gen(minGen), gen(vertexProfitGen), gen(maxHeightGen)],
      recap: [
        'Vértice: x = −b ÷ 2a, no meio das raízes.',
        'a < 0: máximo; a > 0: mínimo.',
        'O x do vértice diz onde; f(x do vértice) diz quanto.',
      ],
    })),

    stage('maestria', 'maestria', 'Maestria: parábolas em problemas', 'Resolver problemas inéditos de receita, lucro e trajetórias que pedem montar a função quadrática, achar raízes e vértice e interpretar o resultado.', () => ({
      learn: [
        strategy('Parábolas em 4 passos', '1) Escreva a função (às vezes ela vem pronta; às vezes é preço × quantidade). 2) "Quando é zero", "volta ao chão", "lucro nulo": raízes. 3) "Máximo", "mínimo", "o maior possível": vértice — o x diz onde, f(x) diz quanto. 4) Confira o sentido: tempos e medidas não podem ser negativos.'),
        example('Desconto que maximiza a receita', 'Um teatro vende 200 ingressos por sessão a R$ 30,00. Para cada R$ 1,00 de desconto, vende 10 ingressos a mais. Que preço dá a maior receita?', [
          step('Com d reais de desconto:', 'R(d) = (30 − d)(200 + 10d) = −10d² + 100d + 6.000'),
          askStep('O máximo está no vértice.', 'Qual desconto d maximiza a receita?', [
            ok('d = −100 ÷ (2 × (−10)) = R$ 5,00'),
            no('d = −100 ÷ (−10) = R$ 10,00', 'Faltou o 2 de −b ÷ 2a. Com R$ 10,00 de desconto, a receita volta a R$ 6.000,00, a mesma de sem desconto.'),
          ]),
          step('Preço e receita:', 'preço: 30 − 5 = R$ 25,00; vendas: 200 + 50 = 250 ingressos', 'receita: 25 × 250 = R$ 6.250,00'),
        ], 'O ingresso a R$ 25,00 dá a receita máxima, R$ 6.250,00 (contra R$ 6.000,00 sem desconto).'),
        reveal('Quando o lucro é positivo?', 'Com a < 0, a parábola fica acima do eixo x só entre as raízes. Para L(x) = −x² + 14x − 40 = −(x − 4)(x − 10), há lucro para x entre 4 e 10; fora desse intervalo, prejuízo. O máximo, bem no meio, é L(7) = 9.'),
        check(numeric({
          prompt: [p('O jato de uma mangueira sai rente ao chão e descreve a parábola h(x) = −0,5x² + 3x, em que h é a altura e x é a distância horizontal até a saída, ambas em metros.')],
          ask: 'A que distância da saída o jato atinge o chão?',
          unit: 'm',
          answer: 6,
          wrong: [
            { value: 3, feedback: 'Em x = 3 o jato está no ponto mais alto. Ele chega ao chão no dobro dessa distância.' },
            { value: 1.5, feedback: 'Isso multiplica 3 por 0,5. De 3 − 0,5x = 0 vem x = 3 ÷ 0,5 = 6.' },
            { value: 4.5, feedback: 'Essa é a altura máxima do jato (h(3) = 4,5 m), e não a distância.' },
          ],
          solution: ['$x(3 − 0,5x) = 0 → x = 0 (a saída) ou x = 3 ÷ 0,5 = 6 m'],
        })),
      ],
      practice: [gen(revenueGen), gen(profitRangeGen), gen(heightTimeGen)],
      challenge: [gen(revenueGen), gen(profitRangeGen), gen(fenceGen), gen(maxHeightGen)],
      recap: [
        'Receita = preço × quantidade: com desconto, vira uma parábola.',
        'Lucro positivo: entre as raízes, quando a < 0.',
        'Raízes para "quando é zero"; vértice para "o maior" ou "o menor".',
      ],
    })),
  ],
});
