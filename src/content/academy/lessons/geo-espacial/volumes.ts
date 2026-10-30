/**
 * Aula: Volumes — volume como contagem de cubinhos (V = c × l × a), capacidade em litros
 * (1 m³ = 1.000 L, 1 dm³ = 1 L, 1 cm³ = 1 mL), nível da água e volume deslocado por objetos
 * submersos, e maestria (ampliações, empacotamento e custo de concreto).
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
  math,
  no,
  numeric,
  ok,
  p,
  stage,
  step,
  strategy,
  text,
  warn,
} from '../../kit/build';
import { brl, hm, num, round } from '../../kit/format';
import type { Rand } from '../../types';

// ———————————————————————————————————————————————— geradores: volume do bloco

/** Volume de um bloco retangular: comprimento × largura × altura. */
function boxVolumeGen(r: Rand) {
  for (;;) {
    const inM = r.next() < 0.4;
    const [c, l, a] = inM ? [r.pick([2, 2.5, 3, 4]), r.pick([1.2, 1.5, 2]), r.pick([0.8, 1, 1.2, 1.5])] : [r.int(10, 40), r.int(5, 25), r.int(4, 20)];
    const V = round(c * l * a, 3);
    if (!inM && c === 30 && l === 20 && a === 12) continue; // exemplo da teoria
    if (inM && V === 3) continue; // a capacidade da questão do banco (3 m³)
    const u = inM ? 'm' : 'cm';
    const what = inM ? 'caçamba' : 'caixa';
    return draftNumeric({
      prompt: [
        p(
          inM
            ? `Uma caçamba de entulho tem a forma de um bloco retangular de ${num(c)} m de comprimento, ${num(l)} m de largura e ${num(a)} m de altura.`
            : `Uma caixa de papelão mede ${c} cm de comprimento, ${l} cm de largura e ${a} cm de altura.`,
        ),
      ],
      ask: `Qual é o volume da ${what}?`,
      unit: `${u}³`,
      answer: V,
      wrong: [
        { value: round(c + l + a, 3), feedback: 'Isso soma as três medidas. O volume é o produto delas: comprimento × largura × altura.' },
        { value: round(c * l, 3), feedback: `Essa é só a área do fundo (${u}²). Multiplique pela altura para contar todas as camadas.` },
        { value: round(2 * (c * l + c * a + l * a), 3), feedback: 'Essa é a área das seis faces (o papel para forrar por fora). O volume mede o espaço de dentro: c × l × a.' },
      ],
      hints: ['O volume é comprimento × largura × altura.', `Fundo: ${num(c)} × ${num(l)} = ${num(c * l, 2)} ${u}²; depois, multiplique pela altura, ${num(a)} ${u}.`],
      solution: [`$V = ${num(c)} × ${num(l)} × ${num(a)} = ${num(V, 3)} ${u}³`],
    });
  }
}

/** Quantos cubos de aresta s preenchem uma caixa. */
function cubesCountGen(r: Rand) {
  const s = r.pick([2, 3, 4, 5]);
  const m = [r.int(2, 6), r.int(2, 5), r.int(2, 5)];
  const [C, L, A] = m.map((k) => k * s);
  const n = m[0] * m[1] * m[2];
  const V = C * L * A;
  return draftNumeric({
    prompt: [p(`Uma caixa com medidas internas de ${C} cm × ${L} cm × ${A} cm será completamente preenchida com blocos cúbicos de madeira de ${s} cm de aresta, sem sobrar espaço.`)],
    ask: 'Quantos blocos cabem na caixa?',
    unit: 'blocos',
    answer: n,
    wrong: [
      { value: V / s, feedback: `Isso divide o volume da caixa (${num(V)} cm³) pela aresta do bloco. Divida pelo volume do bloco: ${s}³ = ${s ** 3} cm³.` },
      { value: V / (s * s), feedback: `Isso divide pela área de uma face do bloco (${s * s} cm²). Cada bloco ocupa ${s}³ = ${s ** 3} cm³.` },
      { value: m[0] * m[1], feedback: `Isso conta só a camada do fundo (${m[0]} × ${m[1]}). Na altura cabem ${m[2]} camadas.` },
    ],
    hints: [`Conte ao longo de cada medida: ${C} ÷ ${s}, ${L} ÷ ${s} e ${A} ÷ ${s}.`, `Multiplique: ${m[0]} × ${m[1]} × ${m[2]}.`],
    solution: [`$${C} ÷ ${s} = ${m[0]};  ${L} ÷ ${s} = ${m[1]};  ${A} ÷ ${s} = ${m[2]}`, `$${m[0]} × ${m[1]} × ${m[2]} = ${n} blocos (o mesmo que ${num(V)} ÷ ${s ** 3})`],
  });
}

/** Medida que falta: altura = volume ÷ área do fundo. */
function missingDimGen(r: Rand) {
  const c = r.pick([20, 25, 30, 40]);
  const l = r.pick([10, 15, 20]);
  const a = r.pick([8, 10, 12, 15, 18]);
  const V = c * l * a;
  const ctx = r.pick([
    { t: `Uma caixa de ferramentas tem a forma de um bloco retangular, com volume interno de ${num(V)} cm³ e fundo de ${c} cm por ${l} cm.`, ask: 'Qual é a altura interna da caixa?' },
    { t: `Um cofre em forma de bloco retangular tem volume interno de ${num(V)} cm³, e seu fundo mede ${c} cm por ${l} cm.`, ask: 'Qual é a altura interna do cofre?' },
  ]);
  return draftNumeric({
    prompt: [p(ctx.t)],
    ask: ctx.ask,
    unit: 'cm',
    answer: a,
    wrong: [
      { value: V / c, feedback: `Isso divide só pelo comprimento. Divida pela área do fundo: ${c} × ${l} = ${c * l} cm².` },
      { value: V - c * l, feedback: 'Isso subtrai a área do fundo do volume. Como volume = fundo × altura, a altura é volume ÷ fundo.' },
    ],
    hints: ['Volume = área do fundo × altura; então, altura = volume ÷ área do fundo.', `Fundo: ${c} × ${l} = ${c * l} cm².`],
    solution: [`$fundo: ${c} × ${l} = ${c * l} cm²`, `$altura: ${num(V)} ÷ ${c * l} = ${a} cm`],
  });
}

// ———————————————————————————————————————————————— geradores: capacidade

/** Medidas em metros → capacidade em litros (a de 3 m³ fica de fora: questão do banco). */
function tankLitersGen(r: Rand) {
  for (;;) {
    const cd = r.pick([10, 15, 20, 25, 30]); // em decímetros
    const ld = r.pick([10, 12, 15, 20]);
    const ad = r.pick([8, 10, 12, 15]);
    const L = cd * ld * ad;
    if (L === 3000) continue; // a resposta da questão do banco
    const m3 = L / 1000;
    const [c, l, a] = [cd, ld, ad].map((v) => num(v / 10));
    const t = r.pick([
      `Uma cisterna para guardar água da chuva tem a forma de um bloco retangular, com ${c} m de comprimento, ${l} m de largura e ${a} m de profundidade (medidas internas).`,
      `Um tanque para criação de peixes tem a forma de um bloco retangular de ${c} m por ${l} m, com ${a} m de profundidade.`,
    ]);
    return draftNumeric({
      prompt: [p(t)],
      ask: 'Qual é a capacidade, em litros?',
      unit: 'L',
      answer: L,
      wrong: [
        { value: m3, feedback: `Esse é o volume em metros cúbicos (${num(m3, 3)} m³). Cada m³ corresponde a 1.000 L.` },
        { value: m3 * 100, feedback: 'Isso usa 1 m³ = 100 L. Como 1 m = 10 dm, 1 m³ = 10 × 10 × 10 = 1.000 dm³ = 1.000 L.' },
        { value: m3 * 1000000, feedback: 'Isso converte para centímetros cúbicos (mililitros): 1 m³ = 1.000.000 cm³. Em litros, 1 m³ = 1.000 L.' },
      ],
      hints: ['Calcule o volume em m³: comprimento × largura × profundidade.', 'Cada metro cúbico corresponde a 1.000 litros.'],
      solution: [`$V = ${c} × ${l} × ${a} = ${num(m3, 3)} m³`, `$${num(m3, 3)} × 1.000 = ${num(L)} L`],
    });
  }
}

/** Medidas em centímetros → capacidade em litros. */
function cm3LitersGen(r: Rand) {
  for (;;) {
    const c = r.pick([40, 50, 60, 80, 100]);
    const l = r.pick([20, 25, 30, 40]);
    const a = r.pick([25, 30, 40, 50]);
    if (c === 60 && l === 30 && a === 40) continue; // aquário da questão do banco
    if (c === 50 && l === 30 && a === 40) continue; // exemplo da teoria
    const V = c * l * a;
    const t = r.pick([
      `Uma caixa organizadora de plástico tem medidas internas de ${c} cm × ${l} cm × ${a} cm.`,
      `Uma caixa térmica tem medidas internas de ${c} cm de comprimento, ${l} cm de largura e ${a} cm de altura.`,
    ]);
    return draftNumeric({
      prompt: [p(t)],
      ask: 'Qual é a capacidade da caixa, em litros?',
      unit: 'L',
      answer: V / 1000,
      wrong: [
        { value: V, feedback: `Esse é o volume em cm³ (${num(V)} cm³). Como 1 L = 1.000 cm³, divida por 1.000.` },
        { value: V / 100, feedback: 'Isso divide por 100. Um litro é um cubo de 10 cm de aresta: 10 × 10 × 10 = 1.000 cm³.' },
        { value: V / 1000000, feedback: 'Isso converte para metros cúbicos (÷ 1.000.000). Em litros, divida por 1.000.' },
      ],
      hints: ['Calcule o volume em cm³ multiplicando as três medidas.', 'Um litro tem 1.000 cm³: divida por 1.000.'],
      solution: [`$V = ${c} × ${l} × ${a} = ${num(V)} cm³`, `$${num(V)} ÷ 1.000 = ${num(V / 1000, 3)} L`],
    });
  }
}

/** Tempo para encher: litros ÷ vazão. */
function fillTimeGen(r: Rand) {
  for (;;) {
    const cd = r.pick([20, 25, 30, 40, 50]); // em decímetros
    const ld = r.pick([15, 20, 25, 30]);
    const ad = r.pick([5, 6, 8, 10]);
    const q = r.pick([20, 25, 40, 50, 60, 80, 100]);
    const L = cd * ld * ad;
    if (L === 3000) continue; // as medidas da questão do banco (3 m³)
    if (L % q !== 0) continue;
    const t = L / q;
    if (t < 20 || t > 600) continue;
    const [c, l, a] = [cd, ld, ad].map((v) => num(v / 10));
    return draftNumeric({
      prompt: [p(`Uma piscina de ${c} m × ${l} m, com fundo plano, vai receber água até ${a} m de altura. A mangueira despeja ${q} litros por minuto.`)],
      ask: 'Em quantos minutos a água chega a essa altura?',
      unit: 'min',
      answer: t,
      wrong: [
        { value: round(L / 1000 / q, 4), feedback: `Isso divide o volume em m³ (${num(L / 1000, 3)}) pela vazão em litros. Converta antes: ${num(L / 1000, 3)} m³ = ${num(L)} L.` },
        { value: round(t / 60, 4), feedback: 'Esse é o tempo em horas. A pergunta pede minutos.' },
      ],
      hints: [`Volume de água: ${c} × ${l} × ${a} m³, que vezes 1.000 dá litros.`, `Tempo = litros ÷ ${q} litros por minuto.`],
      solution: [`$V = ${c} × ${l} × ${a} = ${num(L / 1000, 3)} m³ = ${num(L)} L`, `$${num(L)} ÷ ${q} = ${t} min${t >= 60 ? ` (${hm(t / 60)})` : ''}`],
    });
  }
}

// ———————————————————————————————————————————————— geradores: nível da água

/** Volume de um objeto submerso: área do fundo × subida do nível. */
function stoneGen(r: Rand) {
  const c = r.pick([20, 30, 40, 50]);
  const l = r.pick([15, 20, 25, 30]);
  const h0 = r.pick([10, 15, 20, 25]);
  const d = r.pick([0.5, 1, 1.5, 2.5, 3]);
  const base = c * l;
  const V = base * d;
  const finalLevel = r.next() < 0.5;
  return draftNumeric({
    prompt: [
      p(
        finalLevel
          ? `Um vaso de vidro de fundo retangular, de ${c} cm por ${l} cm, tem água até ${h0} cm de altura. Ao afundar nele um enfeite de cerâmica, a água passa a marcar ${num(h0 + d)} cm.`
          : `Um tanque de vidro de um laboratório tem fundo retangular de ${c} cm por ${l} cm e contém água até ${h0} cm de altura. Ao mergulhar totalmente uma peça de metal, o nível da água sobe ${num(d)} cm.`,
      ),
    ],
    ask: finalLevel ? 'Qual é o volume do enfeite?' : 'Qual é o volume da peça?',
    unit: 'cm³',
    answer: V,
    wrong: [
      { value: base, feedback: `Essa é só a área do fundo (${num(base)} cm²). Multiplique pela subida do nível, ${num(d)} cm.` },
      { value: base * h0, feedback: 'Esse é o volume da água que já estava no recipiente. O objeto corresponde só à subida do nível.' },
      { value: base * (h0 + d), feedback: `Esse é o volume de tudo abaixo do novo nível (água + objeto). O objeto ocupa só a faixa da subida: ${num(d)} cm.` },
    ],
    hints: [finalLevel ? `O nível subiu ${num(h0 + d)} − ${h0} = ${num(d)} cm.` : 'A água subiu porque o objeto ocupou o lugar dela.', `Volume = área do fundo × subida = ${c} × ${l} × ${num(d)}.`],
    solution: [...(finalLevel ? [`$subida: ${num(h0 + d)} − ${h0} = ${num(d)} cm`] : []), `$V = ${c} × ${l} × ${num(d)} = ${num(V)} cm³`],
  });
}

/** Altura da água: volume (em cm³) ÷ área do fundo. */
function levelGen(r: Rand) {
  for (;;) {
    const c = r.pick([40, 50, 60, 80]);
    const l = r.pick([25, 30, 40, 50]);
    const h = r.pick([10, 12, 15, 20, 25]);
    const L = (c * l * h) / 1000;
    if (!Number.isInteger(L * 2)) continue;
    if (c === 40 && l === 30 && h === 15) continue; // exercício da teoria
    const t = r.pick([
      `Um bebedouro para animais, com fundo retangular de ${c} cm por ${l} cm e paredes verticais, recebe ${num(L)} litros de água.`,
      `Um tanque de lavar roupas, com fundo retangular de ${c} cm por ${l} cm e paredes verticais, recebe ${num(L)} litros de água.`,
    ]);
    return draftNumeric({
      prompt: [p(t)],
      ask: 'Até que altura a água chega?',
      unit: 'cm',
      answer: h,
      wrong: [
        { value: round(L / (c * l), 4), feedback: `Isso divide os litros direto pela área em cm². Converta antes: ${num(L)} L = ${num(L * 1000)} cm³.` },
        { value: round((L * 100) / (c * l), 4), feedback: 'Isso usa 1 L = 100 cm³. Um litro tem 1.000 cm³.' },
      ],
      hints: [`${num(L)} L = ${num(L * 1000)} cm³ (1 L = 1.000 cm³).`, `Altura = volume ÷ área do fundo = ${num(L * 1000)} ÷ ${num(c * l)}.`],
      solution: [`$${num(L)} L = ${num(L * 1000)} cm³;  fundo: ${c} × ${l} = ${num(c * l)} cm²`, `$${num(L * 1000)} ÷ ${num(c * l)} = ${h} cm`],
    });
  }
}

/** Subida do nível: volume dos objetos ÷ área do fundo. */
function riseGen(r: Rand) {
  for (;;) {
    const ctx = r.pick([
      { vs: [3, 4, 5, 6], ns: [20, 30, 40, 50, 60], cs: [10, 12, 15], ls: [8, 10, 12], t: (n: number, v: number, c: number, l: number) => `Uma criança jogou ${n} bolinhas de gude, de ${v} cm³ cada uma, num pote de vidro com fundo retangular de ${c} cm por ${l} cm, com água até a metade. Todas afundaram.` },
      { vs: [8, 10, 12, 15], ns: [10, 20, 25, 30], cs: [20, 25, 30], ls: [10, 15, 20], t: (n: number, v: number, c: number, l: number) => `Um pescador colocou ${n} chumbadas de ${v} cm³ cada uma numa caixa plástica de fundo retangular, ${c} cm por ${l} cm, com água. Todas afundaram.` },
    ]);
    const [n, v, c, l] = [r.pick(ctx.ns), r.pick(ctx.vs), r.pick(ctx.cs), r.pick(ctx.ls)];
    if ((n * v * 100) % (c * l) !== 0) continue;
    const ans = (n * v) / (c * l);
    return draftNumeric({
      prompt: [p(ctx.t(n, v, c, l))],
      ask: 'Quantos centímetros o nível da água subiu?',
      unit: 'cm',
      answer: ans,
      wrong: [
        { value: round((n * v) / c, 2), feedback: `Isso divide só por um lado do fundo. Divida pela área do fundo: ${c} × ${l} = ${c * l} cm².` },
        { value: n * v, feedback: 'Esse é o volume total dos objetos, em cm³. Para achar a subida, divida pela área do fundo.' },
        { value: round(v / (c * l), 4), feedback: `Essa é a subida causada por um só objeto. Foram ${n}.` },
      ],
      hints: [`Volume dos objetos: ${n} × ${v} = ${n * v} cm³.`, `Subida = volume ÷ área do fundo = ${n * v} ÷ ${c * l}.`],
      solution: [`$${n} × ${v} = ${n * v} cm³;  fundo: ${c} × ${l} = ${c * l} cm²`, `$${n * v} ÷ ${c * l} = ${num(ans)} cm`],
    });
  }
}

// ———————————————————————————————————————————————— geradores: maestria

/** Ampliar as três medidas k vezes multiplica o volume por k³. */
function scaleVolumeGen(r: Rand) {
  const k = r.pick([2, 3, 1.5]);
  const V0 = r.pick([200, 250, 400, 500, 1000]);
  const ans = round(V0 * k ** 3, 2);
  const ctx = r.pick([
    { t: `Uma embalagem de suco em forma de bloco retangular tem ${num(V0)} mL de capacidade. A versão "família" tem o mesmo formato, com cada uma das três medidas (comprimento, largura e altura) multiplicada por ${num(k)}.`, ask: 'Qual é a capacidade da versão família?', unit: 'mL' },
    { t: `Uma caixa de presente tem ${num(V0)} cm³ de volume. Uma caixa maior, de mesmo formato, tem cada uma das três medidas multiplicada por ${num(k)}.`, ask: 'Qual é o volume da caixa maior?', unit: 'cm³' },
  ]);
  return draftNumeric({
    prompt: [p(ctx.t)],
    ask: ctx.ask,
    unit: ctx.unit,
    answer: ans,
    wrong: [
      { value: round(V0 * k, 2), feedback: `Isso multiplica o volume por ${num(k)}, como se só uma medida mudasse. As três mudam: ${num(k)} × ${num(k)} × ${num(k)}.` },
      { value: round(V0 * k * k, 2), feedback: `Isso usa ${num(k)}², o fator das áreas. O volume tem três dimensões: fator ${num(k)}³ = ${num(k ** 3, 3)}.` },
      { value: round(V0 * 3 * k, 2), feedback: `Isso multiplica por 3 × ${num(k)}, somando o efeito das três medidas. Os fatores se multiplicam: ${num(k)}³ = ${num(k ** 3, 3)}.` },
    ],
    hints: ['Cada medida multiplicada por k → volume multiplicado por k × k × k.', `Fator: ${num(k)}³ = ${num(k ** 3, 3)}.`],
    solution: [`$fator: ${num(k)}³ = ${num(k ** 3, 3)}`, `$${num(V0)} × ${num(k ** 3, 3)} = ${num(ans)} ${ctx.unit}`],
  });
}

/** Empacotamento: quantas caixas cabem, alinhadas, num baú. */
function packingGen(r: Rand) {
  const box = [r.pick([4, 5, 6]), r.pick([3, 4]), r.pick([4, 5])]; // em decímetros
  const m = [r.int(6, 10), box[1] === 3 ? r.int(6, 8) : r.int(5, 6), r.int(4, 5)]; // baú de 1,8 m a 2,4 m de largura
  const cont = box.map((b, i) => b * m[i]);
  const n = m[0] * m[1] * m[2];
  const [C, L, A] = cont.map((v) => num(v / 10));
  const [c, l, a] = box.map((v) => num(v / 10));
  return draftNumeric({
    prompt: [p(`O baú de um caminhão tem ${C} m de comprimento, ${L} m de largura e ${A} m de altura. Ele será carregado com caixas iguais de ${c} m × ${l} m × ${a} m, todas na mesma posição: o comprimento da caixa ao longo do comprimento do baú, a largura ao longo da largura e a altura ao longo da altura.`)],
    ask: 'Quantas caixas cabem, no máximo?',
    unit: 'caixas',
    answer: n,
    wrong: [
      { value: m[0] * m[1], feedback: `Isso conta só a camada do chão (${m[0]} × ${m[1]}). Empilhadas, cabem ${m[2]} camadas.` },
      { value: m[0] + m[1] + m[2], feedback: `Isso soma as quantidades em cada direção. Elas se multiplicam: ${m[0]} × ${m[1]} × ${m[2]}.` },
    ],
    hints: [`Em cada direção: ${C} ÷ ${c}, ${L} ÷ ${l} e ${A} ÷ ${a}.`, `Multiplique as três quantidades: ${m[0]} × ${m[1]} × ${m[2]}.`],
    solution: [`$${C} ÷ ${c} = ${m[0]};  ${L} ÷ ${l} = ${m[1]};  ${A} ÷ ${a} = ${m[2]}`, `$${m[0]} × ${m[1]} × ${m[2]} = ${n} caixas`],
  });
}

/** Custo do concreto: área × espessura (em metros) × preço do m³. */
function concreteGen(r: Rand) {
  const c = r.pick([4, 5, 6, 8]);
  const l = r.pick([3, 4, 5]);
  const e = r.pick([8, 10, 12, 15]);
  const price = r.pick([350, 400, 450, 500]);
  const V = (c * l * e) / 100;
  const cost = round(V * price, 2);
  return draftNumeric({
    prompt: [p(`Uma laje retangular de ${c} m por ${l} m terá ${e} cm de espessura. O concreto custa ${brl(price)} o metro cúbico.`)],
    ask: 'Quanto custará o concreto da laje?',
    prefix: 'R$',
    answer: cost,
    wrong: [
      { value: c * l * e * price, feedback: `Isso usa a espessura em centímetros. Em metros, ${e} cm = ${num(e / 100)} m.` },
      { value: round(c * l * (e / 10) * price, 2), feedback: `Isso divide a espessura por 10. Um metro tem 100 cm: ${e} cm = ${num(e / 100)} m.` },
      { value: c * l * price, feedback: 'Isso multiplica a área da laje pelo preço, sem a espessura. O preço é por metro cúbico: calcule o volume.' },
    ],
    hints: [`Espessura em metros: ${e} cm = ${num(e / 100)} m.`, `Volume = ${c} × ${l} × ${num(e / 100)} m³; depois, × ${brl(price)}.`],
    solution: [`$V = ${c} × ${l} × ${num(e / 100)} = ${num(V)} m³`, `$${num(V)} × ${num(price)} = ${brl(cost)}`],
  });
}

// ———————————————————————————————————————————————— aula

export const VOLUMES = lesson({
  id: 'volumes',
  topic: 'geo-espacial',
  subtopics: ['volumes'],
  title: 'Volume e capacidade',
  summary: 'Volume como contagem de cubinhos, o bloco retangular (c × l × a), litros e metros cúbicos, nível da água e objetos submersos, ampliações, empacotamento e custo de concreto.',
  requires: ['areas'],
  stages: [
    stage('cubinhos', 'descoberta', 'Quanto cabe dentro', 'Entender o volume como a quantidade de cubinhos que preenchem um sólido e calcular o volume de blocos retangulares.', () => ({
      learn: [
        text('Comprimento mede uma linha (m), área mede uma superfície (m²) e **volume** mede o espaço ocupado (m³). Para medir volume, contamos **cubinhos**: 1 cm³ é um cubo de 1 cm de aresta. Num bloco retangular, a camada do fundo tem comprimento × largura cubinhos, e há tantas camadas quanto a altura: V = c × l × a.'),
        math('V = c × l × a = (área do fundo) × altura', 'cubo de aresta a: V = a³'),
        lab({
          title: 'Empilhando cubinhos',
          intro: 'Escolha as medidas de uma caixa, em centímetros, e conte os cubinhos de 1 cm³ que cabem nela.',
          params: [
            { key: 'c', label: 'Comprimento', min: 1, max: 8, step: 1, value: 2, format: (v) => `${v} cm` },
            { key: 'l', label: 'Largura', min: 1, max: 6, step: 1, value: 2, format: (v) => `${v} cm` },
            { key: 'a', label: 'Altura', min: 1, max: 6, step: 1, value: 2, format: (v) => `${v} cm` },
          ],
          readouts: ({ c, l, a }) => [
            { label: 'Cubinhos por camada', value: `${c} × ${l} = ${c * l}` },
            { label: 'Camadas', value: String(a) },
            { label: 'Volume', value: `${c * l * a} cm³`, big: true, tone: 'sky' },
          ],
          viz: ({ c, l, a }) => ({
            kind: 'shape',
            shape: 'box',
            dims: [c, l, a],
            labels: [`${c} cm`, `${l} cm`, `${a} cm`, ''],
            summary: `Caixa de ${c} cm × ${l} cm × ${a} cm: ${c * l} cubinhos por camada, ${a} camadas, ${c * l * a} cm³`,
          }),
          goal: {
            task: 'Monte uma caixa de 3 cm de altura com volume de exatamente 60 cm³.',
            done: ({ c, l, a }) => a === 3 && c * l * a === 60,
            success: 'Isso: com 3 camadas, cada camada precisa de 60 ÷ 3 = 20 cubinhos — por exemplo, 4 × 5 ou 5 × 4.',
          },
          insight: 'O volume é a área do fundo vezes o número de camadas: dobrar qualquer uma das medidas dobra o volume.',
        }),
        example('A caixa de sapatos', 'Uma caixa de sapatos mede 30 cm de comprimento, 20 cm de largura e 12 cm de altura. Qual é o volume dela?', [
          askStep('Comece pelo fundo da caixa.', 'Qual é a área do fundo?', [
            ok('30 × 20 = 600 cm²'),
            no('30 + 20 = 50 cm²', 'Somar comprimento e largura não dá a área. A área do fundo é 30 × 20 = 600 cm².'),
          ]),
          step('São 12 camadas de 600 cubinhos:', '600 × 12 = 7.200 cm³'),
        ], 'A caixa tem 7.200 cm³.'),
        check(classify({
          ask: 'O que cada situação mede: comprimento, área ou volume?',
          bins: ['Comprimento', 'Área', 'Volume'],
          items: [
            { text: 'Rodapé para contornar uma sala', bin: 0, why: 'O rodapé segue o contorno da sala: é um comprimento (m).' },
            { text: 'Tinta para pintar uma parede', bin: 1, why: 'A tinta cobre uma superfície: é uma área (m²).' },
            { text: 'Água para encher uma piscina', bin: 2, why: 'A água ocupa o espaço de dentro: é um volume (m³ ou litros).' },
            { text: 'Grama para cobrir um jardim', bin: 1, why: 'A grama cobre o chão do jardim: é uma área.' },
            { text: 'Areia para encher uma caçamba', bin: 2, why: 'A areia ocupa o espaço da caçamba: é um volume.' },
            { text: 'Cerca em volta de um terreno', bin: 0, why: 'A cerca acompanha o contorno: é um comprimento (o perímetro).' },
          ],
          hints: ['Contorno → comprimento; cobrir uma superfície → área; encher → volume.', 'Pense na unidade: m, m² ou m³.'],
          solution: ['Comprimento: rodapé e cerca. Área: tinta e grama. Volume: água da piscina e areia da caçamba.'],
        })),
      ],
      practice: [gen(boxVolumeGen), gen(cubesCountGen), gen(missingDimGen)],
      challenge: [gen(cubesCountGen), gen(missingDimGen), gen(boxVolumeGen)],
      recap: [
        'Volume = espaço ocupado, em unidades cúbicas (cm³, m³).',
        'Bloco retangular: V = c × l × a = fundo × altura.',
        'Altura que falta = volume ÷ área do fundo.',
      ],
    })),

    stage('capacidade', 'fundamentos', 'Litros e metros cúbicos', 'Converter volumes em capacidades (1 m³ = 1.000 L, 1 dm³ = 1 L, 1 cm³ = 1 mL) e resolver problemas de encher reservatórios.', () => ({
      learn: [
        text('**Capacidade** é o volume de líquido que cabe num recipiente, em litros. A ponte entre as unidades: um cubo de 10 cm (1 dm) de aresta guarda exatamente **1 litro**. Como 1 m = 10 dm, 1 m³ = 10 × 10 × 10 = **1.000 litros**. E 1 L = 1.000 cm³, então 1 cm³ = 1 mL.'),
        math('1 m³ = 1.000 L', '1 dm³ = 1 L = 1.000 cm³', '1 cm³ = 1 mL'),
        lab({
          title: 'O tanque em litros',
          intro: 'Escolha as medidas de um tanque, em metros, e veja quantos litros cabem nele.',
          params: [
            { key: 'c', label: 'Comprimento', min: 0.5, max: 4, step: 0.5, value: 1, format: (v) => `${num(v)} m` },
            { key: 'l', label: 'Largura', min: 0.5, max: 3, step: 0.5, value: 1, format: (v) => `${num(v)} m` },
            { key: 'a', label: 'Altura', min: 0.5, max: 2, step: 0.5, value: 1, format: (v) => `${num(v)} m` },
          ],
          readouts: ({ c, l, a }) => [
            { label: 'Volume', value: `${num(c)} × ${num(l)} × ${num(a)} = ${num(c * l * a, 3)} m³` },
            { label: 'Capacidade', value: `${num(c * l * a * 1000)} L`, big: true, tone: 'sky' },
          ],
          viz: ({ c, l, a }) => ({
            kind: 'shape',
            shape: 'box',
            dims: [c, l, a],
            labels: [`${num(c)} m`, `${num(l)} m`, `${num(a)} m`, `${num(c * l * a * 1000)} L`],
            fill: 1,
            summary: `Tanque de ${num(c)} m × ${num(l)} m × ${num(a)} m: ${num(c * l * a, 3)} m³, ou ${num(c * l * a * 1000)} litros`,
          }),
          goal: {
            task: 'Monte um tanque de 1,5 m de altura que comporte exatamente 6.000 L.',
            done: ({ c, l, a }) => a === 1.5 && Math.abs(c * l * a - 6) < 1e-9,
            success: 'Isso: 6.000 L = 6 m³, e com 1,5 m de altura o fundo precisa ter 6 ÷ 1,5 = 4 m² — por exemplo, 2 m × 2 m.',
          },
          insight: 'Cada metro cúbico são mil litros: um tanque de 1 m × 1 m × 1 m já guarda 1.000 L.',
        }),
        example('O aquário', 'Um aquário mede 50 cm de comprimento, 30 cm de largura e 40 cm de altura. Quantos litros cabem nele?', [
          step('Volume em cm³:', '50 × 30 × 40 = 60.000 cm³'),
          askStep('Agora, a conversão.', 'Como passar 60.000 cm³ para litros?', [
            ok('Dividir por 1.000, pois 1 L = 1.000 cm³'),
            no('Dividir por 100', 'Um litro é um cubo de 10 cm de aresta: 10 × 10 × 10 = 1.000 cm³, e não 100.'),
          ]),
        ], '60.000 ÷ 1.000 = 60 L.'),
        key('Por que mil?', 'O metro tem 10 decímetros. Num cubo de 1 m de aresta cabem 10 × 10 × 10 = 1.000 cubinhos de 1 dm³, e cada um é 1 litro. Volumes crescem ao cubo: por isso as conversões vão de mil em mil.'),
        check(numeric({
          prompt: [p('Uma piscina infantil retangular tem 2,5 m de comprimento, 1,2 m de largura e 0,4 m de profundidade.')],
          ask: 'Quantos litros cabem nela?',
          unit: 'L',
          answer: 1200,
          wrong: [
            { value: 1.2, feedback: 'Esse é o volume em m³ (2,5 × 1,2 × 0,4 = 1,2 m³). Cada m³ são 1.000 L.' },
            { value: 120, feedback: 'Isso usa 1 m³ = 100 L. São 1.000 L em cada m³: 1,2 × 1.000 = 1.200 L.' },
            { value: 1200000, feedback: 'Isso converte para mililitros (cm³). Em litros: 1,2 m³ = 1.200 L.' },
          ],
          solution: ['$V = 2,5 × 1,2 × 0,4 = 1,2 m³', '$1,2 × 1.000 = 1.200 L'],
        })),
      ],
      practice: [gen(tankLitersGen), gen(cm3LitersGen), gen(fillTimeGen)],
      challenge: [gen(fillTimeGen), gen(tankLitersGen), gen(cm3LitersGen)],
      recap: [
        '1 m³ = 1.000 L; 1 dm³ = 1 L; 1 cm³ = 1 mL.',
        'm³ → L: × 1.000; cm³ → L: ÷ 1.000.',
        'Tempo para encher = litros ÷ vazão.',
      ],
    })),

    stage('deslocamento', 'aplicacoes', 'Nível da água', 'Relacionar volume de líquido, área do fundo e altura, e calcular o volume de objetos submersos pela subida do nível.', () => ({
      learn: [
        text('Num recipiente de paredes verticais, a água forma um bloco: **volume = área do fundo × altura da água**. Daí saem duas ideias: a altura que um volume atinge é volume ÷ área do fundo; e um objeto que afunda por completo empurra a água para cima — o **volume do objeto** é a área do fundo vezes **quanto o nível subiu**.'),
        math('altura da água = volume ÷ (área do fundo)', 'volume do objeto = (área do fundo) × (subida do nível)'),
        lab({
          title: 'A pedra no tanque',
          intro: 'Um tanque tem fundo de 50 cm × 40 cm e água até 25 cm. Escolha o volume de uma pedra que afunda nele.',
          params: [{ key: 'v', label: 'Volume da pedra', min: 500, max: 8000, step: 500, value: 1000, format: (v) => `${num(v)} cm³` }],
          readouts: ({ v }) => [
            { label: 'Subida do nível', value: `${num(v)} ÷ 2.000 = ${num(v / 2000, 2)} cm` },
            { label: 'Novo nível', value: `${num(25 + v / 2000, 2)} cm`, big: true, tone: 'sky' },
          ],
          viz: ({ v }) => ({
            kind: 'shape',
            shape: 'box',
            dims: [50, 40, 40],
            labels: ['50 cm', '40 cm', '40 cm', `${num(25 + v / 2000, 2)} cm`],
            fill: (25 + v / 2000) / 40,
            summary: `Tanque de fundo 50 cm × 40 cm: com a pedra de ${num(v)} cm³, a água vai de 25 cm para ${num(25 + v / 2000, 2)} cm`,
          }),
          goal: {
            task: 'Ache o volume da pedra que faz o nível subir exatamente 1,5 cm.',
            done: ({ v }) => v === 3000,
            success: 'Isso: 2.000 cm² × 1,5 cm = 3.000 cm³. A subida vezes a área do fundo é o volume da pedra.',
          },
          insight: 'Dobrar o volume da pedra dobra a subida; num tanque de fundo maior, a mesma pedra faz o nível subir menos.',
        }),
        example('A peça de metal', 'Um tanque de 80 cm × 50 cm tem água até 20 cm. Uma peça de metal é mergulhada por completo, e o nível passa a 23 cm. Qual é o volume da peça?', [
          askStep('Só a subida interessa.', 'Quanto o nível subiu?', [
            ok('23 − 20 = 3 cm'),
            no('23 cm', 'O nível já estava em 20 cm antes da peça. Ela responde só pela subida: 3 cm.'),
          ]),
          step('Volume da peça:', '80 × 50 × 3 = 12.000 cm³'),
        ], 'A peça tem 12.000 cm³, ou 12 litros.'),
        warn('Litros na conta de altura', 'Antes de dividir pela área do fundo em cm², passe os litros para cm³ (× 1.000). Dividir litros por cm² dá uma altura mil vezes menor.'),
        check(numeric({
          prompt: [p('Uma caixa de paredes verticais e fundo de 40 cm × 30 cm recebe 18 litros de água.')],
          ask: 'Até que altura a água chega?',
          unit: 'cm',
          answer: 15,
          wrong: [
            { value: 0.015, feedback: 'Isso divide 18 (litros) por 1.200 (cm²). Converta antes: 18 L = 18.000 cm³.' },
            { value: 1.5, feedback: 'Isso usa 1 L = 100 cm³. Um litro tem 1.000 cm³: 18.000 ÷ 1.200 = 15 cm.' },
          ],
          solution: ['$18 L = 18.000 cm³;  fundo: 40 × 30 = 1.200 cm²', '$18.000 ÷ 1.200 = 15 cm'],
        })),
      ],
      practice: [gen(stoneGen), gen(levelGen), gen(riseGen)],
      challenge: [gen(riseGen), gen(stoneGen), gen(levelGen)],
      recap: [
        'Altura da água = volume ÷ área do fundo (em cm³ e cm²).',
        'Objeto submerso: volume = área do fundo × subida do nível.',
        'Use só a subida, não o nível final.',
      ],
    })),

    stage('maestria', 'maestria', 'Maestria: volumes no ENEM', 'Resolver problemas inéditos de volume que combinam conversões, ampliações, empacotamento e custos.', () => ({
      learn: [
        strategy('Volumes em 4 passos', '1) Que sólido é e qual parte interessa (o recipiente todo, só a água, só a subida)? 2) Ponha todas as medidas na mesma unidade. 3) Volume = área do fundo × altura. 4) Converta no fim: m³ → L (× 1.000), cm³ → L (÷ 1.000), e confira se a resposta faz sentido.'),
        example('O cubo ampliado', 'Um cubo de 2 cm de aresta tem 8 cm³. Qual é o volume de um cubo com o triplo da aresta?', [
          askStep('A aresta passa a 6 cm.', 'O volume fica quantas vezes maior?', [
            ok('3 × 3 × 3 = 27 vezes'),
            no('3 vezes', 'Triplicam as três medidas ao mesmo tempo: o volume fica 3 × 3 × 3 = 27 vezes maior.'),
          ]),
          step('Conferindo:', '6³ = 216 cm³ = 27 × 8 cm³'),
        ], 'O cubo maior tem 216 cm³.'),
        key('Linhas, áreas e volumes', 'Ampliar todas as medidas k vezes multiplica os comprimentos por k, as áreas por k² e os volumes por k³. Dobrar as medidas de uma caixa multiplica o volume por 8.'),
        check(numeric({
          prompt: [p('Um reservatório cúbico tem 2 m de aresta. Outro, também cúbico, tem 4 m de aresta.')],
          ask: 'Quantas vezes o volume do maior é o volume do menor?',
          unit: 'vezes',
          answer: 8,
          wrong: [
            { value: 2, feedback: 'A aresta dobrou, mas o volume depende das três medidas: 2 × 2 × 2 = 8.' },
            { value: 4, feedback: '4 é o fator das áreas (2²). Para volumes, o fator é 2³ = 8: 64 m³ contra 8 m³.' },
          ],
          solution: ['$menor: 2³ = 8 m³;  maior: 4³ = 64 m³', '$64 ÷ 8 = 8 vezes'],
        })),
      ],
      practice: [gen(scaleVolumeGen), gen(concreteGen), gen(stoneGen)],
      challenge: [gen(packingGen), gen(scaleVolumeGen), gen(concreteGen), gen(levelGen)],
      recap: [
        'Medidas × k → volume × k³.',
        'Empacotar: conte ao longo de cada medida e multiplique.',
        'Preço por m³: calcule o volume em metros.',
      ],
    })),
  ],
});
