/**
 * Aula: Teorema de Pitágoras — a soma dos quadrados (hipotenusa e catetos), escadas, rampas,
 * diagonais e atalhos, telas pela diagonal e distâncias em mapas e no plano, e maestria.
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
  ok,
  p,
  reveal,
  stage,
  step,
  strategy,
  text,
  warn,
} from '../../kit/build';
import { num, round } from '../../kit/format';
import type { Rand } from '../../types';

/** Ternos pitagóricos primitivos (catetos e hipotenusa). */
const TRIPLES: [number, number, number][] = [
  [3, 4, 5],
  [5, 12, 13],
  [8, 15, 17],
  [7, 24, 25],
  [20, 21, 29],
];

/** Um terno escalado: inteiros pequenos ou decimais (× 0,1, × 0,3, × 0,5). */
function triple(r: Rand, decimals = false): [number, number, number] {
  const [a, b, c] = r.pick(TRIPLES);
  const k = decimals ? r.pick([0.1, 0.2, 0.3, 0.5]) : r.pick([1, 2, 3, 4, 5]);
  return [round(a * k, 4), round(b * k, 4), round(c * k, 4)];
}
const sq = (x: number) => round(x * x, 4);

// ———————————————————————————————————————————————— geradores: o teorema

/** Hipotenusa a partir dos catetos: c = √(a² + b²). */
function hypGen(r: Rand) {
  for (;;) {
    const [a, b, c] = triple(r);
    if (c > 100) continue;
    if (a === 9 && b === 12) continue; // exercício da teoria
    const [x, y] = r.next() < 0.5 ? [a, b] : [b, a];
    return draftNumeric({
      prompt: [p(`Um triângulo retângulo tem catetos de ${num(x)} cm e ${num(y)} cm.`)],
      ask: 'Quanto mede a hipotenusa?',
      unit: 'cm',
      answer: c,
      wrong: [
        { value: x + y, feedback: 'Isso soma os catetos. O teorema soma os quadrados deles: a² + b² = c².' },
        { value: sq(x) + sq(y), feedback: `Esse é o quadrado da hipotenusa (${num(sq(x))} + ${num(sq(y))}). Falta tirar a raiz quadrada.` },
        { value: round(Math.sqrt(Math.abs(sq(y) - sq(x))), 2), feedback: 'Isso subtrai os quadrados. Para achar a hipotenusa, some os quadrados dos catetos.' },
      ],
      hints: [`c² = ${num(x)}² + ${num(y)}² = ${num(sq(x))} + ${num(sq(y))}.`, `Tire a raiz quadrada: c = √${num(sq(x) + sq(y))}.`],
      solution: [`$c² = ${num(sq(x))} + ${num(sq(y))} = ${num(sq(c))}`, `$c = √${num(sq(c))} = ${num(c)} cm`],
    });
  }
}

/** Um cateto a partir da hipotenusa e do outro cateto: b = √(c² − a²). */
function legGen(r: Rand) {
  for (;;) {
    const [a, b, c] = triple(r);
    if (c > 100) continue;
    return draftNumeric({
      prompt: [p(`A hipotenusa de um triângulo retângulo mede ${num(c)} m, e um dos catetos mede ${num(a)} m.`)],
      ask: 'Quanto mede o outro cateto?',
      unit: 'm',
      answer: b,
      wrong: [
        { value: round(Math.sqrt(sq(c) + sq(a)), 2), feedback: 'Isso soma os quadrados, como se procurasse a hipotenusa. Ela já é conhecida: o cateto é √(c² − a²).' },
        { value: c - a, feedback: 'Isso subtrai as medidas. A relação vale para os quadrados: b² = c² − a².' },
        { value: sq(c) - sq(a), feedback: `Esse é o quadrado do cateto (${num(sq(c))} − ${num(sq(a))}). Falta a raiz quadrada.` },
      ],
      hints: [`b² = ${num(c)}² − ${num(a)}² = ${num(sq(c))} − ${num(sq(a))}.`, `Tire a raiz quadrada: b = √${num(sq(c) - sq(a))}.`],
      solution: [`$b² = ${num(sq(c))} − ${num(sq(a))} = ${num(sq(b))}`, `$b = √${num(sq(b))} = ${num(b)} m`],
    });
  }
}

/** Quais medidas formam um triângulo retângulo? */
function isRightGen(r: Rand) {
  for (;;) {
    const [a, b, c] = triple(r);
    if (c > 60) continue;
    const fakes: { t: [number, number, number]; why: string }[] = [
      { t: [a, b, a + b - 1], why: `${a}² + ${b}² = ${num(a * a + b * b)}, mas ${a + b - 1}² = ${num((a + b - 1) ** 2)}.` },
      { t: [a + 1, b, c], why: `${a + 1}² + ${b}² = ${num((a + 1) ** 2 + b * b)}, mas ${c}² = ${num(c * c)}.` },
      { t: [a, b + 1, c + 1], why: `${a}² + ${b + 1}² = ${num(a * a + (b + 1) ** 2)}, mas ${c + 1}² = ${num((c + 1) ** 2)}.` },
    ];
    if (fakes.some((f) => f.t[0] ** 2 + f.t[1] ** 2 === f.t[2] ** 2)) continue;
    const show = (t: number[]) => `${t[0]}, ${t[1]} e ${t[2]}`;
    return draftChoice({
      prompt: [p('Um marceneiro quer montar um esquadro (um triângulo com ângulo reto) com três ripas.')],
      ask: 'Com quais medidas, em centímetros, as ripas formam um triângulo retângulo?',
      options: [ok(show([a, b, c])), ...fakes.map((f) => no(show(f.t), `Não formam: ${f.why}`))],
      hints: ['Num triângulo retângulo, o quadrado do maior lado é a soma dos quadrados dos outros dois.', 'Teste cada trio: os dois menores ao quadrado, somados, dão o maior ao quadrado?'],
      solution: [`$${a}² + ${b}² = ${num(a * a)} + ${num(b * b)} = ${num(c * c)} = ${c}²`],
    });
  }
}

// ———————————————————————————————————————————————— geradores: escadas, rampas, diagonais

/** Escada apoiada na parede: hipotenusa = escada; catetos = altura e distância ao pé. */
function ladderGen(r: Rand) {
  for (;;) {
    const [a, b, c] = triple(r, r.next() < 0.5);
    if (c > 15 || c < 2) continue;
    if (c === 5 && (a === 3 || b === 3)) continue; // laboratório da teoria
    const askH = r.next() < 0.5;
    const [d, h] = a < b ? [a, b] : [b, a];
    return draftNumeric({
      prompt: [p(askH
        ? `Uma escada de ${num(c)} m está apoiada numa parede vertical, com o pé a ${num(d)} m da parede, sobre um chão plano.`
        : `Uma escada de ${num(c)} m está apoiada numa parede vertical e alcança ${num(h)} m de altura, sobre um chão plano.`)],
      ask: askH ? 'A que altura o topo da escada toca a parede?' : 'A que distância da parede está o pé da escada?',
      unit: 'm',
      answer: askH ? h : d,
      wrong: [
        { value: round(Math.sqrt(sq(c) + sq(askH ? d : h)), 2), feedback: 'Isso soma os quadrados. A escada é a hipotenusa (o maior lado): o que falta é um cateto, √(c² − a²).' },
        { value: round(c - (askH ? d : h), 2), feedback: 'Isso subtrai as medidas. Pitágoras vale para os quadrados: subtraia os quadrados e tire a raiz.' },
        { value: round(sq(c) - sq(askH ? d : h), 2), feedback: 'Esse é o quadrado da medida. Falta a raiz quadrada.' },
      ],
      hints: ['A escada é a hipotenusa: ela fica em frente ao ângulo reto entre a parede e o chão.', `x² = ${num(c)}² − ${num(askH ? d : h)}².`],
      solution: [`$x² = ${num(sq(c))} − ${num(sq(askH ? d : h))} = ${num(sq(askH ? h : d))}`, `$x = ${num(askH ? h : d)} m`],
    });
  }
}

/** Rampa: desnível e afastamento horizontal são os catetos; a rampa é a hipotenusa. */
function rampGen(r: Rand) {
  for (;;) {
    const [a, b, c] = triple(r, true);
    const [h, w] = a < b ? [a, b] : [b, a];
    if (h === 1.5 && w === 3.6) continue; // questão do banco
    if (h === 0.9 && w === 1.2) continue; // exercício da teoria
    if (c > 6 || h < 0.3) continue;
    return draftNumeric({
      prompt: [p(`Uma rampa de acesso vence um desnível de ${num(h)} m e ocupa ${num(w)} m na horizontal.`)],
      ask: 'Qual é o comprimento da rampa (a superfície inclinada)?',
      unit: 'm',
      answer: c,
      wrong: [
        { value: round(h + w, 2), feedback: 'Isso soma o desnível e a horizontal. A rampa é a hipotenusa: c² = h² + w².' },
        { value: w, feedback: 'Essa é a medida horizontal. A rampa inclinada é mais longa: é a hipotenusa.' },
        { value: round(sq(h) + sq(w), 4), feedback: 'Esse é o quadrado do comprimento. Falta a raiz quadrada.' },
      ],
      hints: ['O desnível e a horizontal formam o ângulo reto: são os catetos.', `c² = ${num(h)}² + ${num(w)}² = ${num(sq(h))} + ${num(sq(w))}.`],
      solution: [`$c² = ${num(sq(h))} + ${num(sq(w))} = ${num(sq(c))}`, `$c = √${num(sq(c))} = ${num(c)} m`],
    });
  }
}

/** Diagonal de um retângulo e o atalho que ela proporciona. */
function diagonalGen(r: Rand) {
  for (;;) {
    const [a, b, c] = triple(r);
    if (c > 150) continue;
    const k = r.pick([5, 10]);
    const [w, h, d] = c < 30 ? [a * k, b * k, c * k] : [a, b, c];
    if (w === 60 && h === 80) continue; // exemplo da teoria
    if (d > 300) continue;
    const shortcut = r.next() < 0.5;
    return draftNumeric({
      prompt: [p(`Um parque retangular mede ${num(w)} m por ${num(h)} m. Uma trilha atravessa o parque em linha reta, de um canto ao canto oposto.`)],
      ask: shortcut ? 'Quantos metros a trilha economiza em relação a ir pelos dois lados do parque?' : 'Qual é o comprimento da trilha?',
      unit: 'm',
      answer: shortcut ? w + h - d : d,
      wrong: shortcut
        ? [
            { value: d, feedback: `Esse é o comprimento da trilha. A economia é a diferença entre os lados (${w + h} m) e a trilha.` },
            { value: w + h, feedback: 'Esse é o caminho pelos lados. A economia é ele menos a trilha.' },
            { value: Math.abs(h - w), feedback: 'Isso subtrai os lados. A economia é (soma dos lados) − (diagonal).' },
          ]
        : [
            { value: w + h, feedback: 'Isso soma os lados: é o caminho contornando o parque. A trilha em linha reta é a diagonal, menor.' },
            { value: sq(w) + sq(h), feedback: 'Esse é o quadrado da diagonal. Falta a raiz quadrada.' },
            { value: round((w + h) / 2, 2), feedback: 'Isso faz a média dos lados. A diagonal vem de Pitágoras: √(a² + b²).' },
          ],
      hints: ['A diagonal divide o retângulo em dois triângulos retângulos: os lados são os catetos.', `d = √(${num(w)}² + ${num(h)}²).`],
      solution: [`$d = √(${num(sq(w))} + ${num(sq(h))}) = √${num(sq(d))} = ${num(d)} m`, ...(shortcut ? [`$economia: ${w + h} − ${num(d)} = ${num(w + h - d)} m`] : [])],
    });
  }
}

// ———————————————————————————————————————————————— geradores: telas e planos

/** Tela 4 : 3 pela diagonal: os lados são 4k e 3k, e a diagonal, 5k. */
function screenGen(r: Rand) {
  for (;;) {
    const d = r.pick([10, 15, 20, 25, 30, 35, 40, 45, 55, 60, 65, 70]);
    if (d === 50) continue; // questão do banco
    if (d === 30) continue; // exemplo da teoria
    const k = d / 5;
    const askW = r.next() < 0.6;
    return draftNumeric({
      prompt: [p(`O tamanho de uma tela é informado pela diagonal, em polegadas. Uma tela retangular tem proporção 4 : 3 (largura : altura) e diagonal de ${d} polegadas.`)],
      ask: askW ? 'Qual é a largura da tela, em polegadas?' : 'Qual é a altura da tela, em polegadas?',
      unit: 'polegadas',
      answer: askW ? 4 * k : 3 * k,
      wrong: [
        { value: askW ? 3 * k : 4 * k, feedback: askW ? 'Essa é a altura (o lado 3 da proporção). A largura é o lado 4.' : 'Essa é a largura (o lado 4 da proporção). A altura é o lado 3.' },
        { value: round(askW ? (4 * d) / 7 : (3 * d) / 7, 2), feedback: 'Isso divide a diagonal na proporção 4 : 3 como se ela fosse a soma dos lados. A diagonal é a hipotenusa: 5 partes, porque 3² + 4² = 5².' },
        { value: round(d / 2, 2), feedback: 'Isso divide a diagonal por 2. Com lados 4k e 3k, a diagonal é 5k: ache k primeiro.' },
      ],
      hints: ['Lados 4k e 3k: a diagonal é √(16k² + 9k²) = 5k.', `5k = ${d} → k = ${num(k)}.`],
      solution: [`$5k = ${d} → k = ${num(k)}`, `$${askW ? `largura = 4 × ${num(k)}` : `altura = 3 × ${num(k)}`} = ${num(askW ? 4 * k : 3 * k)} polegadas`],
    });
  }
}

/** Distância entre dois pontos do plano (ou de um mapa quadriculado). */
function coordDistGen(r: Rand) {
  for (;;) {
    const [a, b, c] = triple(r);
    if (c > 30) continue;
    const x1 = r.int(-5, 8);
    const y1 = r.int(-5, 8);
    const [dx, dy] = r.next() < 0.5 ? [a, b] : [b, a];
    const sx = r.pick([1, -1]);
    const sy = r.pick([1, -1]);
    const x2 = x1 + sx * dx;
    const y2 = y1 + sy * dy;
    if (x1 === 1 && y1 === 2 && x2 === 7 && y2 === 10) continue; // exercício da teoria
    const pt = (x: number, y: number) => `(${num(x)}, ${num(y)})`;
    return draftNumeric({
      prompt: [p(`No plano cartesiano, os pontos A = ${pt(x1, y1)} e B = ${pt(x2, y2)} são ligados por um segmento.`)],
      ask: 'Qual é o comprimento do segmento AB?',
      answer: c,
      wrong: [
        { value: dx + dy, feedback: `Isso soma os deslocamentos (${dx} + ${dy}): é o caminho "em escada". O segmento é a hipotenusa: √(Δx² + Δy²).` },
        { value: dx * dx + dy * dy, feedback: 'Esse é o quadrado da distância. Falta a raiz quadrada.' },
        { value: round(Math.sqrt(Math.abs(x2 * x2 + y2 * y2 - x1 * x1 - y1 * y1)), 2), feedback: 'Isso eleva as coordenadas ao quadrado antes de subtrair. Subtraia primeiro (Δx e Δy) e depois eleve.' },
      ],
      hints: [`Δx = ${num(x2)} − ${num(x1)} = ${num(x2 - x1)}; Δy = ${num(y2)} − ${num(y1)} = ${num(y2 - y1)}.`, 'Distância = √(Δx² + Δy²).'],
      solution: [`$AB = √(${dx}² + ${dy}²) = √${dx * dx + dy * dy} = ${c}`],
    });
  }
}

/** Mapa de quarteirões: deslocamentos perpendiculares e distância em linha reta. */
function mapGen(r: Rand) {
  for (;;) {
    const [a, b, c] = triple(r);
    const blk = r.pick([50, 80, 100, 120]);
    if (c > 30) continue;
    const ans = c * blk;
    return draftNumeric({
      prompt: [p(`Numa cidade de quarteirões quadrados de ${blk} m de lado, uma pessoa caminha ${a} quarteirões para o leste e depois ${b} quarteirões para o norte.`)],
      ask: 'A que distância, em linha reta, ela está do ponto de partida?',
      unit: 'm',
      answer: ans,
      wrong: [
        { value: (a + b) * blk, feedback: 'Essa é a distância caminhada pelas ruas. Em linha reta, a distância é a hipotenusa do triângulo leste–norte.' },
        { value: c, feedback: `Essa é a distância em quarteirões. Cada quarteirão tem ${blk} m.` },
        { value: (a * a + b * b) * blk, feedback: 'Isso esquece a raiz quadrada: √(a² + b²) quarteirões, vezes o tamanho do quarteirão.' },
      ],
      hints: ['Leste e norte são perpendiculares: formam os catetos.', `√(${a}² + ${b}²) = ${c} quarteirões; multiplique por ${blk} m.`],
      solution: [`$√(${a}² + ${b}²) = √${a * a + b * b} = ${c} quarteirões`, `$${c} × ${blk} = ${num(ans)} m`],
    });
  }
}

// ———————————————————————————————————————————————— aula

export const PITAGORAS = lesson({
  id: 'pitagoras',
  topic: 'geo-plana',
  subtopics: ['pitagoras'],
  title: 'Teorema de Pitágoras',
  summary: 'A relação a² + b² = c² no triângulo retângulo, usada para escadas, rampas, diagonais e atalhos, telas medidas pela diagonal e distâncias em mapas e no plano cartesiano.',
  requires: ['potencias', 'areas'],
  stages: [
    stage('teorema', 'descoberta', 'A soma dos quadrados', 'Reconhecer hipotenusa e catetos num triângulo retângulo e usar a² + b² = c² para achar um lado desconhecido.', () => ({
      learn: [
        text('Num **triângulo retângulo**, o lado oposto ao ângulo reto é a **hipotenusa** (o maior lado), e os outros dois são os **catetos**. O teorema de Pitágoras diz que o quadrado da hipotenusa é a soma dos quadrados dos catetos: a² + b² = c². Em área, é como se o quadrado construído sobre a hipotenusa coubesse exatamente nos dois quadrados construídos sobre os catetos.'),
        math('c² = a² + b²', 'c = √(a² + b²)    b = √(c² − a²)'),
        lab({
          title: 'Catetos e hipotenusa',
          intro: 'Escolha os catetos de um triângulo retângulo e veja os quadrados e a hipotenusa.',
          params: [
            { key: 'a', label: 'Cateto a', min: 1, max: 15, step: 1, value: 2, format: (v) => String(v) },
            { key: 'b', label: 'Cateto b', min: 1, max: 15, step: 1, value: 2, format: (v) => String(v) },
          ],
          readouts: ({ a, b }) => [
            { label: 'a² + b²', value: `${a * a} + ${b * b} = ${a * a + b * b}` },
            { label: 'Hipotenusa', value: Number.isInteger(Math.sqrt(a * a + b * b)) ? String(Math.sqrt(a * a + b * b)) : `√${a * a + b * b} ≈ ${num(Math.sqrt(a * a + b * b), 2)}`, big: true, tone: 'verdigris' },
          ],
          viz: ({ a, b }) => ({
            kind: 'shape',
            shape: 'triangle',
            dims: [a, b],
            labels: [String(a), String(b), num(Math.sqrt(a * a + b * b), 2)],
            summary: `Catetos ${a} e ${b}: hipotenusa √${a * a + b * b} ≈ ${num(Math.sqrt(a * a + b * b), 2)}`,
          }),
          goal: {
            task: 'Com um cateto de 5, ache o outro cateto, de 1 a 15, que dá uma hipotenusa inteira.',
            done: ({ a, b }) => (a === 5 && b === 12) || (a === 12 && b === 5),
            success: 'Isso: 5² + 12² = 25 + 144 = 169 = 13². O trio 5, 12, 13 é um terno pitagórico, como 3, 4, 5.',
          },
          insight: 'A hipotenusa é sempre maior que cada cateto e menor que a soma deles.',
        }),
        example('O terceiro lado', 'Um terreno triangular tem um ângulo reto entre os lados de 6 m e 8 m. Quanto mede o terceiro lado?', [
          askStep('Os lados de 6 m e 8 m formam o ângulo reto: são os catetos.', 'O que se soma?', [
            ok('Os quadrados: 36 + 64 = 100'),
            no('Os lados: 6 + 8 = 14', 'O teorema soma os quadrados dos catetos, e não os catetos.'),
          ]),
          step('Raiz:', 'c = √100 = 10 m'),
        ], 'O terceiro lado, a hipotenusa, mede 10 m.'),
        check(numeric({
          prompt: [p('Um triângulo retângulo tem catetos de 9 cm e 12 cm.')],
          ask: 'Quanto mede a hipotenusa?',
          unit: 'cm',
          answer: 15,
          wrong: [
            { value: 21, feedback: 'Isso soma os catetos. O teorema soma os quadrados: 81 + 144 = 225.' },
            { value: 225, feedback: 'Esse é o quadrado da hipotenusa. Falta a raiz: √225 = 15.' },
            { value: 10.5, feedback: 'Isso faz a média dos catetos. A hipotenusa é √(9² + 12²).' },
          ],
          solution: ['$c² = 9² + 12² = 81 + 144 = 225', '$c = √225 = 15 cm'],
        })),
      ],
      practice: [gen(hypGen), gen(legGen), gen(isRightGen)],
      challenge: [gen(legGen), gen(isRightGen), gen(hypGen)],
      recap: [
        'Hipotenusa: o lado oposto ao ângulo reto, o maior.',
        'c² = a² + b²; um cateto: √(c² − a²).',
        'Ternos úteis: 3-4-5, 5-12-13, 8-15-17 (e seus múltiplos).',
      ],
    })),

    stage('situacoes', 'fundamentos', 'Escadas, rampas e diagonais', 'Encontrar o triângulo retângulo escondido em situações reais — escadas, rampas, diagonais de retângulos e atalhos — e aplicar o teorema.', () => ({
      learn: [
        text('Em problemas, o primeiro passo é **achar o ângulo reto**: entre a parede e o chão (escada), entre a altura e a horizontal (rampa), entre dois lados de um retângulo (diagonal), entre ruas perpendiculares (atalho). O lado em frente ao ângulo reto — a escada, a rampa, a diagonal, o atalho — é a hipotenusa.'),
        lab({
          title: 'A escada na parede',
          intro: 'Uma escada de 5 m está apoiada numa parede. Escolha a distância do pé da escada até a parede.',
          params: [{ key: 'd', label: 'Distância do pé à parede', min: 0.5, max: 4.5, step: 0.5, value: 1, format: (v) => `${num(v)} m` }],
          readouts: ({ d }) => [
            { label: 'Conta', value: `h = √(25 − ${num(d * d, 2)})` },
            { label: 'Altura alcançada', value: `${num(Math.sqrt(25 - d * d), 2)} m`, big: true, tone: 'verdigris' },
          ],
          viz: ({ d }) => ({
            kind: 'shape',
            shape: 'triangle',
            dims: [d, Math.sqrt(25 - d * d)],
            labels: [`${num(d)} m`, `${num(Math.sqrt(25 - d * d), 2)} m`, '5 m'],
            summary: `Com o pé a ${num(d)} m da parede, a escada de 5 m alcança ${num(Math.sqrt(25 - d * d), 2)} m de altura`,
          }),
          goal: {
            task: 'Ache a distância do pé à parede que faz o topo da escada alcançar exatamente 4 m de altura.',
            done: ({ d }) => Math.abs(d - 3) < 1e-9,
            success: 'Isso: 3² + 4² = 9 + 16 = 25 = 5². Afastar o pé da parede abaixa o topo da escada.',
          },
          insight: 'O comprimento da escada (a hipotenusa) não muda; os catetos trocam entre si: mais distância, menos altura.',
        }),
        example('A trilha diagonal', 'Um campo retangular mede 60 m por 80 m. Quanto mede uma trilha reta de um canto ao canto oposto?', [
          askStep('A trilha corta o retângulo em dois triângulos retângulos.', 'Quais são os catetos?', [
            ok('Os lados do campo: 60 m e 80 m'),
            no('A trilha e um dos lados', 'A trilha é a hipotenusa, em frente ao ângulo reto do canto. Os catetos são os lados do campo.'),
          ]),
          step('Pitágoras:', 'd² = 3.600 + 6.400 = 10.000', 'd = 100 m'),
        ], 'A trilha mede 100 m — 40 m a menos que contornar o campo pelos lados (140 m).'),
        warn('Quem é a hipotenusa?', 'Se a medida que falta é a hipotenusa, some os quadrados. Se a hipotenusa é dada (a escada, a rampa) e falta um cateto, subtraia. Trocar as duas contas é o erro mais comum.'),
        check(numeric({
          prompt: [p('Uma rampa vence um desnível de 0,9 m e ocupa 1,2 m na horizontal.')],
          ask: 'Qual é o comprimento da rampa?',
          unit: 'm',
          answer: 1.5,
          wrong: [
            { value: 2.1, feedback: 'Isso soma o desnível e a horizontal. A rampa é a hipotenusa: √(0,9² + 1,2²).' },
            { value: 2.25, feedback: 'Esse é o quadrado do comprimento (0,81 + 1,44). Falta a raiz: √2,25 = 1,5.' },
            { value: 0.79, feedback: 'Isso subtrai os quadrados. A rampa é a hipotenusa: some os quadrados dos catetos.' },
          ],
          solution: ['$c² = 0,9² + 1,2² = 0,81 + 1,44 = 2,25', '$c = √2,25 = 1,5 m'],
        })),
      ],
      practice: [gen(ladderGen), gen(rampGen), gen(diagonalGen)],
      challenge: [gen(rampGen), gen(diagonalGen), gen(ladderGen)],
      recap: [
        'Ache o ângulo reto; o lado em frente a ele é a hipotenusa.',
        'Falta a hipotenusa: some os quadrados. Falta um cateto: subtraia.',
        'A diagonal é sempre um atalho em relação a contornar os lados.',
      ],
    })),

    stage('planos', 'aplicacoes', 'Telas, mapas e o plano cartesiano', 'Usar Pitágoras com proporções (telas medidas pela diagonal) e com coordenadas (distâncias em mapas quadriculados e no plano).', () => ({
      learn: [
        text('Telas são vendidas pela **diagonal**. Numa tela de proporção 4 : 3, os lados são 4k e 3k, e a diagonal é 5k, porque 3² + 4² = 5²: basta achar k. No **plano cartesiano**, a distância entre dois pontos é a hipotenusa de um triângulo cujos catetos são as diferenças das coordenadas: d = √(Δx² + Δy²).'),
        math('tela 4 : 3 → lados 4k e 3k, diagonal 5k', 'd(A, B) = √((x₂ − x₁)² + (y₂ − y₁)²)'),
        lab({
          title: 'Distância no plano',
          intro: 'O ponto A está na origem, (0, 0). Escolha as coordenadas do ponto B e veja a distância AB.',
          params: [
            { key: 'x', label: 'x de B', min: 0, max: 12, step: 1, value: 2, format: (v) => String(v) },
            { key: 'y', label: 'y de B', min: 0, max: 12, step: 1, value: 2, format: (v) => String(v) },
          ],
          readouts: ({ x, y }) => [
            { label: 'Conta', value: `√(${x}² + ${y}²) = √${x * x + y * y}` },
            { label: 'Distância AB', value: Number.isInteger(Math.sqrt(x * x + y * y)) ? String(Math.sqrt(x * x + y * y)) : `≈ ${num(Math.sqrt(x * x + y * y), 2)}`, big: true, tone: 'verdigris' },
          ],
          viz: ({ x, y }) => ({
            kind: 'chart',
            xLabel: 'x',
            yLabel: 'y',
            xMin: 0,
            xMax: 12,
            yMin: 0,
            yMax: 12,
            series: [
              { label: 'AB', tone: 'verdigris', points: [[0, 0], [x, y]] },
              { label: 'catetos', tone: 'mist', points: [[0, 0], [x, 0], [x, y]], dashed: true },
            ],
            markers: [{ x, y, label: `B (${x}, ${y})`, tone: 'brass' }],
            summary: `A = (0, 0) e B = (${x}, ${y}): distância √${x * x + y * y} ≈ ${num(Math.sqrt(x * x + y * y), 2)}`,
          }),
          goal: {
            task: 'Com x = 6, ache o y de B que deixa B a exatamente 10 unidades de A.',
            done: ({ x, y }) => x === 6 && y === 8,
            success: 'Isso: √(6² + 8²) = √100 = 10. É o terno 3-4-5 dobrado.',
          },
          insight: 'Os catetos tracejados são os deslocamentos na horizontal e na vertical; o segmento AB é a hipotenusa.',
        }),
        key('Ternos pitagóricos', '3-4-5, 5-12-13, 8-15-17 e seus múltiplos (6-8-10, 9-12-15, 30-40-50, 0,3-0,4-0,5…) aparecem o tempo todo. Reconhecê-los poupa contas — mas confira sempre qual lado é a hipotenusa.'),
        example('Uma tela de 30 polegadas', 'Uma tela de proporção 4 : 3 tem 30 polegadas de diagonal. Quais são a largura e a altura?', [
          step('Com lados 4k e 3k:', 'diagonal = 5k = 30 → k = 6'),
          askStep('Agora, os lados.', 'Qual é a largura?', [
            ok('4 × 6 = 24 polegadas'),
            no('30 × 4/7 ≈ 17,1 polegadas', 'Isso dividiria a diagonal na proporção 4 : 3, como se ela fosse a soma dos lados. A diagonal corresponde a 5 partes, e não a 7.'),
          ]),
          step('Altura:', '3 × 6 = 18 polegadas'),
        ], 'A tela tem 24 polegadas de largura e 18 de altura.'),
        check(numeric({
          prompt: [p('Num mapa quadriculado, a escola fica no ponto (1, 2) e a biblioteca, no ponto (7, 10). Cada unidade do mapa vale 1 km.')],
          ask: 'Qual é a distância, em linha reta, entre a escola e a biblioteca?',
          unit: 'km',
          answer: 10,
          wrong: [
            { value: 14, feedback: 'Isso soma os deslocamentos (6 + 8): é o caminho "em escada". Em linha reta, é a hipotenusa.' },
            { value: 100, feedback: 'Esse é o quadrado da distância (36 + 64). Falta a raiz quadrada.' },
            { value: 12.65, feedback: 'Isso usa as coordenadas da biblioteca como se a escola estivesse na origem. Subtraia: Δx = 6 e Δy = 8.' },
          ],
          solution: ['$Δx = 7 − 1 = 6; Δy = 10 − 2 = 8', '$d = √(36 + 64) = √100 = 10 km'],
        })),
      ],
      practice: [gen(screenGen), gen(coordDistGen), gen(mapGen)],
      challenge: [gen(mapGen), gen(screenGen), gen(coordDistGen)],
      recap: [
        'Tela 4 : 3: lados 4k e 3k, diagonal 5k.',
        'Distância no plano: √(Δx² + Δy²).',
        'Deslocamentos perpendiculares: some os quadrados, tire a raiz.',
      ],
    })),

    stage('maestria', 'maestria', 'Maestria: Pitágoras no ENEM', 'Resolver problemas inéditos que exigem achar o triângulo retângulo, decidir qual lado é a hipotenusa e combinar Pitágoras com proporções e coordenadas.', () => ({
      learn: [
        strategy('Pitágoras em 4 passos', '1) Desenhe a situação e marque o ângulo reto. 2) Identifique a hipotenusa (em frente ao ângulo reto). 3) Falta a hipotenusa: some os quadrados; falta um cateto: subtraia. 4) Tire a raiz e confira: a hipotenusa precisa ser o maior lado.'),
        example('O cabo da antena', 'Uma antena vertical de 12 m é presa por um cabo esticado do topo até um ponto do chão a 5 m da base. Quanto mede o cabo?', [
          askStep('A antena é vertical e o chão é horizontal.', 'Qual é a hipotenusa?', [
            ok('O cabo, em frente ao ângulo reto da base da antena'),
            no('A antena, que é a maior medida dada', 'A antena é um cateto: ela forma o ângulo reto com o chão. O cabo liga as pontas dos catetos.'),
          ]),
          step('Pitágoras:', 'c² = 12² + 5² = 144 + 25 = 169', 'c = 13 m'),
        ], 'O cabo mede 13 m.'),
        reveal('Como saber se um triângulo é retângulo?', 'Pela recíproca do teorema: se o quadrado do maior lado for igual à soma dos quadrados dos outros dois, o triângulo é retângulo. Pedreiros usam isso para conferir esquadros: marcam 3 m, 4 m e 5 m.'),
        check(choice({
          prompt: [p('Um monitor de proporção 4 : 3 tem 20 polegadas de diagonal.')],
          ask: 'Quais são a largura e a altura do monitor?',
          options: [
            ok('16 e 12 polegadas'),
            no('12 e 9 polegadas', 'Essas medidas dão diagonal 15 (5 × 3). Com 20 polegadas, k = 20 ÷ 5 = 4: 16 e 12.'),
            no('11,4 e 8,6 polegadas', 'Isso divide a diagonal na proporção 4 : 3, como se ela fosse a soma dos lados. A diagonal é 5k.'),
            no('20 e 15 polegadas', 'Isso usa a diagonal como largura. A diagonal é 5k = 20, então a largura é 4k = 16.'),
          ],
          solution: ['$5k = 20 → k = 4', '$largura 4 × 4 = 16; altura 3 × 4 = 12'],
        })),
      ],
      practice: [gen(ladderGen), gen(screenGen), gen(isRightGen)],
      challenge: [gen(rampGen), gen(mapGen), gen(diagonalGen), gen(legGen)],
      recap: [
        'Marque o ângulo reto antes de tudo.',
        'A hipotenusa é o maior lado: confira o resultado.',
        'Proporções e coordenadas viram catetos.',
      ],
    })),
  ],
});
