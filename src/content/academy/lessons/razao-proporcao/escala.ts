/**
 * Aula: Escala — ler escalas numéricas e gráficas (cm, m, km), calcular desenho, real e a
 * própria escala, ampliações (k : 1, microscópios), mudar de escala (redesenhar, reduzir,
 * imprimir ampliado, caber na folha), aplicações (velocidade no mapa, material) e o efeito da
 * escala linear sobre áreas (n²) e volumes (n³).
 */
import {
  askStep,
  check,
  choice,
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
  text,
  warn,
} from '../../kit/build';
import { hm, num, round } from '../../kit/format';
import type { Rand } from '../../types';

const ceil = (x: number) => Math.ceil(x - 1e-9);
const floor = (x: number) => Math.floor(x + 1e-9);
const isInt = (x: number) => Number.isInteger(round(x, 9));
/** Comprimento em cm escrito na unidade mais natural. */
const len = (cm: number) => (cm >= 100000 ? `${num(cm / 100000, 3)} km` : cm >= 100 ? `${num(cm / 100, 2)} m` : `${num(cm, 2)} cm`);

// ———————————————————————————————————————————————— geradores

/** Do desenho ao real: mapas (km ou m), plantas (m) e miniaturas (m). */
function mapToRealGen(r: Rand) {
  for (;;) {
    const kind = r.int(0, 2);
    if (kind === 0) {
      const n = r.pick([10000, 20000, 25000, 50000, 100000, 200000, 250000, 500000, 1000000]);
      const d = r.int(3, 40) / 2;
      const cm = d * n;
      if ((n === 500000 && d === 6) || (n === 15000 && d === 4.8)) continue;
      const km = cm / 100000;
      const inKm = km >= 1;
      const answer = inKm ? km : cm / 100;
      if (!isInt(answer * 100)) continue;
      return draftNumeric({
        prompt: [p(`Num mapa na escala 1 : ${num(n)}, a distância em linha reta entre dois pontos é de ${num(d, 2)} cm.`)],
        ask: `Qual é a distância real entre esses pontos, em ${inKm ? 'quilômetros' : 'metros'}?`,
        unit: inKm ? 'km' : 'm',
        answer,
        wrong: [
          { value: answer * 10, feedback: 'Um zero a mais: confira a conversão (1 m = 100 cm; 1 km = 100.000 cm).' },
          { value: answer / 10, feedback: 'Um zero a menos: confira a conversão (1 m = 100 cm; 1 km = 100.000 cm).' },
          { value: cm, feedback: `${num(cm)} é a distância em CENTÍMETROS. Converta para ${inKm ? 'km (÷ 100.000)' : 'm (÷ 100)'}.` },
        ],
        hints: [`1 cm no mapa = ${num(n)} cm reais.`, `${num(d, 2)} × ${num(n)} = ${num(cm)} cm; agora converta.`],
        solution: [`$${num(d, 2)} × ${num(n)} = ${num(cm)} cm = ${len(cm)}`],
      });
    }
    const plan = kind === 1;
    const n = plan ? r.pick([20, 25, 50, 75, 100, 200]) : r.pick([10, 18, 24, 32, 43, 64, 87, 144]);
    const d = plan ? r.int(5, 120) / 10 : r.int(5, 40);
    if ((n === 80 && d === 1.1) || (n === 400 && d === 9.5)) continue;
    const cm = d * n;
    const m = cm / 100;
    if (!isInt(m * 100) || m < 0.5) continue;
    return draftNumeric({
      prompt: [p(plan ? `Numa planta na escala 1 : ${n}, uma parede está desenhada com ${num(d, 2)} cm de comprimento.` : `Uma miniatura de um veículo, na escala 1 : ${n}, tem ${num(d, 2)} cm de comprimento.`)],
      ask: `Qual é o comprimento real ${plan ? 'da parede' : 'do veículo'}, em metros?`,
      unit: 'm',
      answer: m,
      wrong: [
        { value: cm, feedback: `${num(cm, 2)} é o comprimento em CENTÍMETROS. Em metros: ÷ 100.` },
        { value: m * 10, feedback: 'Um zero a mais: 1 m = 100 cm.' },
        { value: round(d / n, 4), feedback: 'Dividir pelo denominador encolhe a medida. O real é MAIOR que o desenho: multiplique.' },
      ],
      hints: [`1 cm no desenho = ${n} cm reais.`, `${num(d, 2)} × ${n} = ${num(cm, 2)} cm; converta para metros.`],
      solution: [`$${num(d, 2)} × ${n} = ${num(cm, 2)} cm = ${num(m, 2)} m`],
    });
  }
}

/** Escala gráfica: um segmento do mapa corresponde a uma distância real. */
function graphicScaleGen(r: Rand) {
  for (;;) {
    const s = r.pick([1, 2, 3, 4, 5]);
    const L = r.pick([100, 200, 250, 300, 400, 500, 600, 750, 1000]);
    const M = r.int(3, 30) / 2;
    if (s === 2 && L === 500 && M === 7) continue; // questão do banco
    const perCm = L / s;
    const real = M * perCm;
    if (!isInt(real)) continue;
    const inKm = real >= 1000;
    const answer = inKm ? real / 1000 : real;
    return draftNumeric({
      prompt: [p(`No rodapé de um mapa, uma escala gráfica mostra que um segmento de ${s} cm corresponde a ${num(L)} m no terreno. Uma trilha mede ${num(M, 2)} cm no mapa.`)],
      ask: `Qual é o comprimento real da trilha, em ${inKm ? 'quilômetros' : 'metros'}?`,
      unit: inKm ? 'km' : 'm',
      answer,
      wrong: [
        ...(s > 1 ? [{ value: inKm ? (M * L) / 1000 : M * L, feedback: `Isso trata cada centímetro como ${num(L)} m, mas são ${s} cm para ${num(L)} m: 1 cm vale ${num(perCm, 2)} m.` }] : []),
        { value: inKm ? real : real / 1000, feedback: inKm ? `${num(real)} é o comprimento em METROS. Em km: ÷ 1.000.` : 'Confira a unidade: a resposta está em metros.' },
        { value: M, feedback: 'Isso confunde a medida do mapa com a real. Use a escala gráfica para converter.' },
      ],
      hints: [`1 cm no mapa = ${num(L)} ÷ ${s} = ${num(perCm, 2)} m.`, `A trilha: ${num(M, 2)} × ${num(perCm, 2)} m.`],
      solution: [`$1 cm = ${num(perCm, 2)} m → ${num(M, 2)} × ${num(perCm, 2)} = ${num(real)} m${inKm ? ` = ${num(real / 1000, 3)} km` : ''}`],
    });
  }
}

/** Do real ao desenho: maquetes e plantas. */
function realToDrawGen(r: Rand) {
  for (;;) {
    const kind = r.int(0, 1);
    const n = kind === 0 ? r.pick([40, 50, 75, 100, 120, 200, 250]) : r.pick([20, 25, 50, 100]);
    const R = kind === 0 ? r.int(6, 60) : r.int(20, 150) / 10;
    if (kind === 0 && R === 18 && n === 50) continue; // questão do banco
    const cm = (R * 100) / n;
    if (!isInt(cm * 100)) continue;
    return draftNumeric({
      prompt: [p(kind === 0 ? `Um escritório vai construir a maquete de um prédio de ${num(R)} m de altura, na escala 1 : ${n}.` : `Uma sala tem ${num(R, 2)} m de comprimento e será desenhada numa planta na escala 1 : ${n}.`)],
      ask: kind === 0 ? 'Qual será a altura da maquete, em centímetros?' : 'Quantos centímetros terá o comprimento da sala na planta?',
      unit: 'cm',
      answer: cm,
      wrong: [
        { value: round(R / n, 4), feedback: `${num(R / n, 4)} m é a medida certa, mas em METROS. A pergunta pede centímetros.` },
        { value: R * n, feedback: 'Multiplicar pelo denominador AMPLIA. O desenho é menor que o real: divida.' },
        { value: cm * 10, feedback: 'Um zero a mais: confira a conversão (1 m = 100 cm).' },
      ],
      hints: [`Converta: ${num(R, 2)} m = ${num(R * 100)} cm.`, `Divida pelo denominador: ${num(R * 100)} ÷ ${n}.`],
      solution: [`$${num(R * 100)} cm ÷ ${n} = ${num(cm, 2)} cm`],
    });
  }
}

/** Descobrir a escala: denominador = real ÷ desenho, na mesma unidade. */
function findScaleGen(r: Rand) {
  for (;;) {
    const n = r.pick([2000, 5000, 10000, 20000, 25000, 50000, 100000, 200000, 250000, 300000, 500000]);
    const d = r.int(2, 24) / 2;
    if (d === 7.5 && n === 400000) continue; // questão do banco
    const cm = d * n;
    const km = cm / 100000;
    const useKm = km >= 1;
    const shown = useKm ? km : cm / 100;
    if (!isInt(shown * 100)) continue;
    return draftNumeric({
      prompt: [p(`Num mapa, um segmento de ${num(d, 2)} cm representa uma distância real de ${num(shown, 2)} ${useKm ? 'km' : 'm'}.`)],
      ask: 'A escala do mapa é 1 : n. Qual é o valor de n?',
      prefix: '1 :',
      answer: n,
      wrong: [
        { value: n / 1000, feedback: 'Converta tudo para centímetros antes de dividir: 1 m = 100 cm; 1 km = 100.000 cm.' },
        { value: n / 10, feedback: 'Um zero a menos na conversão: 1 m = 100 cm; 1 km = 100.000 cm.' },
        { value: round((useKm ? km : cm / 100) * d, 2), feedback: 'Multiplicar a medida real pela do mapa não dá a escala. Escala = real ÷ desenho, na mesma unidade.' },
      ],
      hints: [`Mesma unidade: ${num(shown, 2)} ${useKm ? 'km' : 'm'} = ${num(cm)} cm.`, `n = ${num(cm)} ÷ ${num(d, 2)}.`],
      solution: [`$${num(shown, 2)} ${useKm ? 'km' : 'm'} = ${num(cm)} cm; n = ${num(cm)} ÷ ${num(d, 2)} = ${num(n)}`],
    });
  }
}

/** Ampliações: microscópios (vezes) e ilustrações na escala k : 1. */
function magnifyGen(r: Rand) {
  for (;;) {
    if (r.next() < 0.6) {
      const A = r.pick([50, 100, 200, 250, 400, 500, 1000]);
      const x = r.pick([2, 4, 5, 6, 8, 10, 12, 15]);
      if ((x === 8 && A === 400) || (x === 0.8 && A === 100)) continue;
      const um = (1000 * x) / A;
      if (!isInt(um * 100)) continue;
      return draftNumeric({
        prompt: [p(`Numa imagem de microscópio com ampliação linear de ${A} vezes, uma estrutura aparece com ${x} mm de largura. Considere 1 mm = 1.000 micrômetros (µm).`)],
        ask: 'Qual é a largura real da estrutura, em micrômetros?',
        unit: 'µm',
        answer: um,
        wrong: [
          { value: x / A, feedback: `${num(x / A, 4)} é a largura em MILÍMETROS. Em micrômetros: × 1.000.` },
          { value: 1000 * x * A, feedback: 'Multiplicar pela ampliação aumenta a medida. A imagem é MAIOR que o real: divida.' },
          { value: um * 10, feedback: 'Um zero a mais: confira a divisão pela ampliação.' },
        ],
        hints: [`Real = imagem ÷ ampliação = ${x} ÷ ${A} mm.`, 'Converta para µm: × 1.000.'],
        solution: [`$${x} ÷ ${A} = ${num(x / A, 4)} mm = ${num(um, 2)} µm`],
      });
    }
    const k = r.pick([2, 3, 4, 5, 8, 10]);
    const draw = r.int(4, 30) / 2;
    if (k === 5 && draw === 6) continue; // questão do banco
    const real = draw / k;
    if (!isInt(real * 100)) continue;
    return draftNumeric({
      prompt: [p(`Um livro mostra a ilustração de um inseto na escala ${k} : 1. Na ilustração, o corpo do inseto mede ${num(draw, 2)} cm.`)],
      ask: 'Qual é o comprimento real do corpo do inseto, em centímetros?',
      unit: 'cm',
      answer: real,
      wrong: [
        { value: draw * k, feedback: `Na escala ${k} : 1 o desenho é ${k} vezes MAIOR que o inseto: divida por ${k}.` },
        { value: draw - k, feedback: 'A escala não se subtrai: é uma razão. Divida a medida do desenho por ' + k + '.' },
        { value: round(real / 10, 4), feedback: 'Um zero a mais na divisão: confira a conta.' },
      ],
      hints: [`${k} : 1 significa: o desenho é ${k} vezes o tamanho real.`, `Real = ${num(draw, 2)} ÷ ${k}.`],
      solution: [`$${num(draw, 2)} ÷ ${k} = ${num(real, 2)} cm`],
    });
  }
}

const RESCALES: [number, number][] = [
  [200, 50],
  [300, 100],
  [500, 200],
  [100, 250],
  [250, 100],
  [400, 100],
  [150, 50],
  [50, 125],
];

/** Redesenhar na outra escala: desenho novo = desenho × (n₁ ÷ n₂). */
function rescaleGen(r: Rand) {
  for (;;) {
    const [n1, n2] = r.pick(RESCALES);
    const L1 = r.int(4, 40) / 4;
    if (n1 === 200 && n2 === 50 && L1 === 1.4) continue; // questão do banco
    const L2 = (L1 * n1) / n2;
    if (!isInt(L2 * 100)) continue;
    return draftNumeric({
      prompt: [p(`Uma planta na escala 1 : ${n1} mostra uma bancada com ${num(L1, 2)} cm. A bancada será redesenhada em outra folha, na escala 1 : ${n2}.`)],
      ask: 'Quanto medirá a bancada no novo desenho?',
      unit: 'cm',
      answer: L2,
      wrong: [
        { value: round((L1 * n2) / n1, 4), feedback: `A mudança ficou invertida: de 1 : ${n1} para 1 : ${n2}, o desenho fica ${n1 > n2 ? 'MAIOR' : 'MENOR'} (× ${num(n1 / n2, 2)}).` },
        { value: L1 * n1, feedback: `${num(L1 * n1)} cm é o comprimento REAL da bancada. Divida por ${n2} para o novo desenho.` },
        { value: round(n1 / n2, 4), feedback: `${num(n1 / n2, 2)} é o fator de mudança, não o comprimento. Multiplique ${num(L1, 2)} cm por ele.` },
      ],
      hints: [`Real: ${num(L1, 2)} × ${n1} = ${num(L1 * n1)} cm.`, `Novo desenho: ${num(L1 * n1)} ÷ ${n2}.`],
      solution: [`$Fator: ${n1} ÷ ${n2} = ${num(n1 / n2, 2)}`, `$${num(L1, 2)} × ${num(n1 / n2, 2)} = ${num(L2, 2)} cm`],
    });
  }
}

/** Redução ou ampliação proporcional de um cartaz: todas as medidas pelo mesmo fator. */
function resizeGen(r: Rand) {
  for (;;) {
    const W1 = r.pick([30, 40, 50, 60, 80, 100]);
    const W2 = r.pick([12, 15, 18, 20, 24, 25, 36, 45, 120, 150]);
    const h1 = r.int(4, 30);
    if (W1 === W2 || (W1 === 40 && W2 === 14 && h1 === 12)) continue;
    const f = W2 / W1;
    const h2 = h1 * f;
    if (!isInt(h2 * 100)) continue;
    const shrink = f < 1;
    return draftNumeric({
      prompt: [p(`Um cartaz de ${W1} cm de largura foi ${shrink ? 'reduzido' : 'ampliado'} proporcionalmente para uma versão de ${W2} cm de largura. Um símbolo do cartaz original tinha ${h1} cm de altura.`)],
      ask: `Qual é a altura desse símbolo na versão ${shrink ? 'reduzida' : 'ampliada'}?`,
      unit: 'cm',
      answer: h2,
      wrong: [
        { value: round((h1 * W1) / W2, 2), feedback: `O fator ficou invertido: na versão ${shrink ? 'reduzida' : 'ampliada'}, o símbolo fica ${shrink ? 'MENOR' : 'MAIOR'}. Fator = ${W2} ÷ ${W1}.` },
        { value: h1 + (W2 - W1), feedback: 'Somar a diferença das larguras deforma a figura. Em escala, todas as medidas são MULTIPLICADAS pelo mesmo fator.' },
        { value: round(h1 * f * f, 2), feedback: `Isso usa o fator ao quadrado (${num(f * f, 4)}), que serve para ÁREAS. Para comprimentos, o fator é ${num(f, 4)}.` },
      ].filter((w) => w.value > 0),
      hints: [`Fator da mudança: ${W2} ÷ ${W1} = ${num(f, 4)}.`, `Aplique o mesmo fator à altura: ${h1} × ${num(f, 4)}.`],
      solution: [`$Fator: ${W2} ÷ ${W1} = ${num(f, 4)}`, `$${h1} × ${num(f, 4)} = ${num(h2, 2)} cm`],
    });
  }
}

/** Mapa impresso ampliado ou reduzido: o denominador fica dividido pelo fator. */
function printScaleGen(r: Rand) {
  for (;;) {
    const n = r.pick([10000, 20000, 30000, 40000, 50000, 60000, 100000]);
    const pct = r.pick([50, 80, 125, 150, 200, 250]);
    if (n === 25000 && pct === 125) continue; // questão do banco
    const n2 = n / (pct / 100);
    if (!isInt(n2)) continue;
    return draftNumeric({
      prompt: [p(`Um mapa na escala 1 : ${num(n)} foi impresso de modo que todos os comprimentos do desenho ficaram iguais a ${pct}% dos originais.`)],
      ask: 'Qual é o novo denominador da escala do mapa impresso?',
      prefix: '1 :',
      answer: n2,
      wrong: [
        { value: n * (pct / 100), feedback: `Multiplicar o denominador pelo fator inverte o efeito: com o desenho ${pct > 100 ? 'MAIOR' : 'MENOR'}, cada cm vale ${pct > 100 ? 'MENOS' : 'MAIS'} terreno. Divida por ${num(pct / 100, 2)}.` },
        { value: n + pct, feedback: 'Somar o percentual ao denominador não faz sentido: a ampliação multiplica os comprimentos do desenho.' },
        { value: round(n / (pct / 100) ** 2, 2), feedback: `Isso divide pelo fator ao quadrado (de área). A escala é linear: divida por ${num(pct / 100, 2)}.` },
      ],
      hints: [`Cada comprimento do desenho ficou × ${num(pct / 100, 2)}.`, `1 cm do mapa novo corresponde a ${num(n)} ÷ ${num(pct / 100, 2)} cm reais.`],
      solution: [`$${num(n)} ÷ ${num(pct / 100, 2)} = ${num(n2)} → 1 : ${num(n2)}`],
    });
  }
}

/** Velocidade média a partir de um trajeto medido no mapa. */
function mapSpeedGen(r: Rand) {
  for (;;) {
    const n = r.pick([100000, 200000, 250000, 300000, 400000, 500000]);
    const d = r.int(4, 30);
    const km = (d * n) / 100000;
    const minutes = r.pick([30, 45, 60, 75, 90, 105, 120, 135, 150, 180]);
    const v = km / (minutes / 60);
    if (!isInt(v * 10) || (d === 20 && n === 300000 && minutes === 90)) continue;
    const H = Math.floor(minutes / 60);
    const decimalWrong = H + (minutes % 60) / 100;
    return draftNumeric({
      prompt: [p(`Num mapa na escala 1 : ${num(n)}, o trajeto de um barco ao longo de um rio mede ${d} cm. O barco faz o trajeto em ${hm(minutes / 60)}.`)],
      ask: 'Qual foi a velocidade média do barco, em km/h?',
      unit: 'km/h',
      answer: round(v, 1),
      wrong: [
        { value: km, feedback: `${num(km, 2)} km é a distância real, não a velocidade. Divida pelo tempo, em horas.` },
        { value: round(km * (minutes / 60), 2), feedback: 'Multiplicar a distância pelo tempo não dá velocidade: velocidade = distância ÷ tempo.' },
        ...(minutes % 60 !== 0 ? [{ value: round(km / decimalWrong, 2), feedback: `${hm(minutes / 60)} não é ${num(decimalWrong, 2)} h: são ${num(minutes / 60, 2)} h (os minutos se dividem por 60).` }] : []),
      ],
      hints: [`Distância real: ${d} × ${num(n)} cm = ${num(km, 2)} km.`, `Tempo: ${hm(minutes / 60)} = ${num(minutes / 60, 2)} h.`],
      solution: [`$${d} × ${num(n)} = ${num(d * n)} cm = ${num(km, 2)} km`, `$${num(km, 2)} ÷ ${num(minutes / 60, 2)} = ${num(v, 1)} km/h`],
    });
  }
}

/** Material vendido em unidades inteiras para um contorno medido numa maquete. */
function materialGen(r: Rand) {
  for (;;) {
    const n = r.pick([20, 25, 40, 50, 60, 80, 100]);
    const P = r.int(8, 40) * 5;
    const roll = r.pick([5, 6, 8, 10, 12, 15]);
    if (n === 40 && P === 75 && roll === 6) continue; // questão do banco
    const m = (P * n) / 100;
    const exact = m / roll;
    if (isInt(exact) || exact < 2) continue;
    return draftNumeric({
      prompt: [p(`Uma maquete de um jardim, na escala 1 : ${n}, tem um caminho de contorno de ${P} cm. No jardim real, esse contorno receberá uma fita de sinalização vendida em rolos de ${roll} m.`)],
      ask: 'Qual é o menor número de rolos necessários?',
      unit: 'rolos',
      answer: ceil(exact),
      wrong: [
        { value: floor(exact), feedback: `Com ${floor(exact)} rolos faltaria fita: o contorno real tem ${num(m, 2)} m. Arredonde para CIMA.` },
        { value: round(exact, 2), feedback: `${num(exact, 2)} é o resultado exato; rolos são inteiros: arredonde para cima.` },
        { value: ceil(P / 100 / roll), feedback: `Isso usa a medida da MAQUETE. Primeiro aplique a escala: ${P} × ${n} = ${num(P * n)} cm.` },
      ].filter((w) => w.value > 0),
      hints: [`Contorno real: ${P} × ${n} = ${num(P * n)} cm = ${num(m, 2)} m.`, `Rolos: ${num(m, 2)} ÷ ${roll}, arredondando para cima.`],
      solution: [`$${P} × ${n} = ${num(P * n)} cm = ${num(m, 2)} m`, `$${num(m, 2)} ÷ ${roll} = ${num(exact, 2)} → ${ceil(exact)} rolos`],
    });
  }
}

/** Áreas em escala: plantas, fotos aéreas e a escala a partir de áreas. */
function areaScaleGen(r: Rand) {
  for (;;) {
    const kind = r.int(0, 2);
    if (kind === 0) {
      const n = r.pick([20, 25, 50, 100, 200]);
      const a = r.int(2, 16) / 2;
      const b = r.int(2, 16) / 2;
      if (n === 100 && a * b === 20 && (a === 5 || a === 4)) continue; // questão do banco
      const A = ((a * n) / 100) * ((b * n) / 100);
      if (!isInt(A * 100)) continue;
      return draftNumeric({
        prompt: [p(`Na planta de uma casa, na escala 1 : ${n}, um cômodo retangular aparece com ${num(a, 2)} cm por ${num(b, 2)} cm.`)],
        ask: 'Qual é a área real desse cômodo, em m²?',
        unit: 'm²',
        answer: round(A, 2),
        wrong: [
          { value: round((a * b * n) / 10000, 4), feedback: `Isso multiplica a área do desenho por ${n}, mas a área fica multiplicada por ${n}² = ${num(n * n)}.` },
          { value: round(A * 100, 2), feedback: 'Confira a conversão: 1 m² = 10.000 cm².' },
          { value: a * b, feedback: `${num(a * b, 2)} cm² é a área no DESENHO. Converta cada lado pela escala antes.` },
        ],
        hints: [`Lados reais: ${num(a, 2)} × ${n} cm e ${num(b, 2)} × ${n} cm.`, `Em metros: ${num((a * n) / 100, 2)} m e ${num((b * n) / 100, 2)} m.`],
        solution: [`$${num((a * n) / 100, 2)} m × ${num((b * n) / 100, 2)} m = ${num(A, 2)} m²`],
      });
    }
    if (kind === 1) {
      const n = r.pick([1000, 2000, 2500, 5000, 10000]);
      const a = r.pick([4, 8, 12, 16, 20, 24, 30, 40, 48, 60]);
      if (a === 75 && n === 2000) continue;
      const m2 = (a * n * n) / 10000;
      const ha = m2 / 10000;
      if (!isInt(ha * 100)) continue;
      return draftNumeric({
        prompt: [p(`Num mapa na escala 1 : ${num(n)}, um parque ocupa uma região de ${a} cm². Considere 1 hectare (ha) = 10.000 m².`)],
        ask: 'Qual é a área real do parque, em hectares?',
        unit: 'ha',
        answer: ha,
        wrong: [
          { value: round((a * n) / 1e8, 6), feedback: `Isso multiplica a área por ${num(n)}, mas a área fica multiplicada por ${num(n)}².` },
          { value: m2, feedback: `${num(m2)} m² é a área certa, mas em METROS QUADRADOS. Em hectares: ÷ 10.000.` },
          { value: ha * 10, feedback: 'Um zero a mais: 1 m² = 10.000 cm² e 1 ha = 10.000 m².' },
        ],
        hints: [`Fator de área: ${num(n)}² = ${num(n * n)}.`, `${a} × ${num(n * n)} cm²; depois converta para m² e para ha.`],
        solution: [`$${a} × ${num(n * n)} = ${num(a * n * n)} cm² = ${num(m2)} m² = ${num(ha, 2)} ha`],
      });
    }
    const n = r.pick([200, 250, 400, 500, 1000, 2000]);
    const a = r.pick([4, 9, 12, 16, 25, 36, 48]);
    const m2 = (a * n * n) / 10000;
    if (!isInt(m2) || (m2 === 900 && a === 36)) continue;
    return draftNumeric({
      prompt: [p(`Uma fotografia aérea, sem distorção, mostra uma praça de ${num(m2)} m² como uma região de ${a} cm².`)],
      ask: 'A escala linear da foto é 1 : n. Qual é o valor de n?',
      prefix: '1 :',
      answer: n,
      wrong: [
        { value: n * n, feedback: `${num(n * n)} é a razão entre as ÁREAS. A escala linear é a raiz quadrada dela.` },
        { value: n / 10, feedback: 'Confira a conversão de área: 1 m² = 10.000 cm².' },
        { value: round(m2 / a, 2), feedback: 'Dividir m² por cm² mistura unidades. Converta a área real para cm² e tire a raiz da razão.' },
      ],
      hints: [`${num(m2)} m² = ${num(m2 * 10000)} cm²; razão das áreas: ÷ ${a}.`, 'A razão das áreas é n²: tire a raiz quadrada.'],
      solution: [`$${num(m2 * 10000)} ÷ ${a} = ${num(n * n)} = ${num(n)}² → 1 : ${num(n)}`],
    });
  }
}

/** Volumes em escala: maquetes (capacidade) e massas de miniaturas. */
function volumeScaleGen(r: Rand) {
  for (;;) {
    if (r.next() < 0.5) {
      const n = r.pick([10, 15, 20, 25, 30, 40, 50]);
      const V = r.pick([0.5, 1, 1.5, 2, 2.5, 3, 4]);
      if (n === 20 && V === 4.5) continue; // questão do banco
      const m3 = (V * n ** 3) / 1000;
      if (!isInt(m3 * 100)) continue;
      return draftNumeric({
        prompt: [p(`Uma maquete de um reservatório, na escala 1 : ${n} (todas as medidas internas reduzidas), fica cheia com ${num(V, 2)} L de água. Considere 1 m³ = 1.000 L.`)],
        ask: 'Qual é a capacidade do reservatório real, em m³?',
        unit: 'm³',
        answer: m3,
        wrong: [
          { value: (V * n) / 1000, feedback: `Isso multiplica a capacidade só por ${n} (fator linear). Volume usa ${n}³ = ${num(n ** 3)}.` },
          { value: (V * n * n) / 1000, feedback: `Isso usa ${n}² (fator de área). Volume usa ${n}³ = ${num(n ** 3)}.` },
          { value: V * n ** 3, feedback: `${num(V * n ** 3)} é a capacidade em LITROS. Em m³: ÷ 1.000.` },
        ],
        hints: [`Fator de volume: ${n}³ = ${num(n ** 3)}.`, `${num(V, 2)} L × ${num(n ** 3)}; depois converta para m³.`],
        solution: [`$${num(V, 2)} × ${num(n ** 3)} = ${num(V * n ** 3)} L = ${num(m3, 2)} m³`],
      });
    }
    const pairs: [number, number][] = [
      [5, 10],
      [10, 20],
      [6, 18],
      [8, 12],
      [4, 10],
      [10, 15],
      [5, 15],
    ];
    const [a, b] = r.pick(pairs);
    const M = r.pick([1000, 1350, 2000, 2700, 3375, 5400, 8000]);
    const small = M * (a / b) ** 3;
    if (!isInt(small)) continue;
    return draftNumeric({
      prompt: [p(`Duas miniaturas maciças de uma mesma estátua, feitas do mesmo material, estão nas escalas 1 : ${a} e 1 : ${b}. A miniatura maior (1 : ${a}) tem massa de ${num(M)} g. A massa é proporcional ao volume.`)],
      ask: 'Qual é a massa da miniatura menor?',
      unit: 'g',
      answer: small,
      wrong: [
        { value: round((M * a) / b, 2), feedback: `Isso usa a razão linear (${a}/${b}). A massa acompanha o VOLUME: (${a}/${b})³.` },
        { value: round(M * (a / b) ** 2, 2), feedback: `Isso usa a razão das áreas (${a}/${b})². A massa acompanha o VOLUME: (${a}/${b})³.` },
        { value: round(M * (b / a) ** 3, 2), feedback: 'A razão ficou invertida: a miniatura de escala 1 : ' + b + ' é a MENOR.' },
      ],
      hints: [`Razão linear entre as miniaturas: ${a} ÷ ${b} = ${num(a / b, 4)}.`, 'Volumes (e massas) seguem o cubo dessa razão.'],
      solution: [`$(${a}/${b})³ = ${num((a / b) ** 3, 4)}`, `$${num(M)} × ${num((a / b) ** 3, 4)} = ${num(small)} g`],
    });
  }
}

/** Reprodução com comprimentos a p%: a área fica × (p/100)². */
function linearPercentGen(r: Rand) {
  for (;;) {
    const pct = r.pick([40, 50, 60, 75, 80, 120, 150, 200]);
    const A = r.pick([16, 25, 36, 48, 64, 80, 100, 144, 200]);
    if (pct === 75 && A === 64) continue; // questão do banco
    const f = pct / 100;
    const A2 = A * f * f;
    if (!isInt(A2 * 100)) continue;
    return draftNumeric({
      prompt: [p(`Um logotipo ocupa ${A} cm² num desenho. Uma reprodução mantém a forma, mas cada comprimento passa a medir ${pct}% do original.`)],
      ask: 'Qual é a área do logotipo na reprodução?',
      unit: 'cm²',
      answer: round(A2, 4),
      wrong: [
        { value: A * f, feedback: `${pct}% vale para cada COMPRIMENTO. A área fica × ${num(f, 2)} × ${num(f, 2)} = ${num(f * f, 4)}.` },
        { value: round(A / f, 2), feedback: `Dividir pelo fator ${pct > 100 ? 'diminui' : 'aumenta'} a área, ao contrário do que acontece.` },
        { value: round(A * f * f * f, 2), feedback: 'O cubo do fator serve para VOLUMES. Para áreas, use o quadrado.' },
      ],
      hints: [`Fator linear: ${num(f, 2)}.`, `Fator de área: ${num(f, 2)}² = ${num(f * f, 4)}.`],
      solution: [`$${A} × ${num(f, 2)}² = ${A} × ${num(f * f, 4)} = ${num(A2, 2)} cm²`],
    });
  }
}

// ———————————————————————————————————————————————— aula

export const ESCALA = lesson({
  id: 'escala',
  topic: 'razao-proporcao',
  subtopics: ['escala'],
  title: 'Escala',
  summary:
    'Mapas, plantas, maquetes e microscópios: ler 1 : n e k : 1, converter cm, m e km, descobrir e mudar escalas, e lembrar que áreas mudam com n² e volumes com n³.',
  requires: ['razao'],
  stages: [
    stage('ler', 'descoberta', 'O que a escala diz', 'Ler uma escala 1 : n (numérica ou gráfica) e transformar medidas do desenho em medidas reais, convertendo centímetros, metros e quilômetros.', () => ({
      learn: [
        text('Uma **escala** é a razão entre uma medida no desenho e a medida real correspondente, **na mesma unidade**. Na escala 1 : 50.000, 1 cm no mapa corresponde a 50.000 cm = 500 m no terreno. Então 4 cm no mapa são 4 × 500 m = 2 km.'),
        lab({
          title: 'O mapa',
          intro: 'Escolha a escala do mapa (em milhares) e uma distância medida com a régua.',
          params: [
            { key: 'n', label: 'Escala 1 : n', min: 10, max: 500, step: 10, value: 50, format: (v) => `1 : ${num(v * 1000)}` },
            { key: 'd', label: 'Distância no mapa', min: 0.5, max: 20, step: 0.5, value: 4, format: (v) => `${num(v, 1)} cm` },
          ],
          readouts: ({ n, d }) => [
            { label: '1 cm no mapa vale', value: `${num(n * 1000)} cm = ${num(n * 10)} m` },
            { label: 'Distância real', value: `${num(d * n * 1000)} cm`, tone: 'parchment' },
            { label: 'Em quilômetros', value: `${num((d * n) / 100, 3)} km`, big: true, tone: 'brass' },
          ],
          goal: {
            task: 'Na escala 1 : 200.000, ache a distância no mapa que corresponde a 12 km reais.',
            done: ({ n, d }) => n === 200 && d === 6,
            success: 'Isso: 12 km = 1.200.000 cm, e 1.200.000 ÷ 200.000 = 6 cm.',
          },
          insight: 'Denominador maior, mapa mais "afastado": cada centímetro vale mais terreno.',
        }),
        key('Converter a unidade', '1 m = 100 cm e 1 km = 100.000 cm. De centímetros para quilômetros, divida por 100.000 (corte cinco zeros).'),
        example('Escala gráfica', 'No rodapé de um mapa, um segmento de 3 cm corresponde a 600 m. Uma trilha mede 8 cm no mapa. Qual é o comprimento real?', [
          askStep('A escala gráfica relaciona o segmento com o terreno.', 'Quanto vale 1 cm do mapa?', [
            ok('600 ÷ 3 = 200 m'),
            no('600 × 3 = 1.800 m', 'O segmento de 3 cm vale 600 m; 1 cm vale um terço disso.'),
          ]),
          step('A trilha:', '8 × 200 = 1.600 m = 1,6 km'),
        ], 'A trilha tem 1,6 km (a escala é 1 : 20.000).'),
        warn('A unidade é a mesma dos dois lados', 'Na escala 1 : 500, 1 cm no desenho vale 500 cm = 5 m reais — e não 500 m.'),
        check(numeric({
          prompt: [p('Num mapa na escala 1 : 250.000, duas cidades estão a 8 cm de distância.')],
          ask: 'Qual é a distância real entre elas, em quilômetros?',
          unit: 'km',
          answer: 20,
          wrong: [
            { value: 2, feedback: 'Um zero a mais foi cortado: 8 × 250.000 = 2.000.000 cm = 20 km.' },
            { value: 200, feedback: 'Um zero a menos foi cortado: 2.000.000 cm ÷ 100.000 = 20 km.' },
            { value: 2000000, feedback: '2.000.000 é a distância em CENTÍMETROS. Em km: ÷ 100.000.' },
          ],
          solution: ['$8 × 250.000 = 2.000.000 cm = 20 km'],
        })),
      ],
      practice: [
        gen(mapToRealGen),
        gen(graphicScaleGen),
        numeric({
          prompt: [p('Numa planta na escala 1 : 50, uma parede mede 9 cm.')],
          ask: 'Qual é o comprimento real da parede, em metros?',
          unit: 'm',
          answer: 4.5,
          wrong: [
            { value: 450, feedback: '450 é o comprimento em CENTÍMETROS. Em metros: ÷ 100.' },
            { value: 0.45, feedback: 'Um zero a mais: 450 cm = 4,5 m.' },
            { value: 0.18, feedback: 'Dividir 9 por 50 encolhe a medida. O real é 50 vezes MAIOR que o desenho.' },
          ],
          hints: ['1 cm na planta = 50 cm reais.', '9 × 50 = 450 cm; converta para metros.'],
          solution: ['$9 × 50 = 450 cm = 4,5 m'],
        }),
      ],
      challenge: [
        gen(mapToRealGen),
        gen(graphicScaleGen),
        numeric({
          prompt: [p('Uma miniatura de um carro, na escala 1 : 18, tem 25 cm de comprimento.')],
          ask: 'Qual é o comprimento real do carro, em metros?',
          unit: 'm',
          answer: 4.5,
          wrong: [
            { value: 45, feedback: 'Um zero a menos foi cortado: 25 × 18 = 450 cm = 4,5 m.' },
            { value: 450, feedback: '450 é o comprimento em CENTÍMETROS.' },
            { value: 1.39, feedback: 'Dividir 25 por 18 encolhe a medida: o carro é 18 vezes MAIOR que a miniatura.' },
          ],
          solution: ['$25 × 18 = 450 cm = 4,5 m'],
        }),
      ],
      recap: [
        'Escala 1 : n: 1 unidade no desenho = n unidades reais (mesma unidade).',
        'Real = desenho × n; depois converta (cm → m: ÷ 100; cm → km: ÷ 100.000).',
        'Escala gráfica: ache quanto vale 1 cm e multiplique.',
      ],
    })),

    stage('calcular', 'fundamentos', 'Desenho, real e a própria escala', 'Calcular a medida no desenho a partir da real (maquetes), descobrir a escala usada e trabalhar com escalas de ampliação (k : 1, microscópios).', () => ({
      learn: [
        text('Há três perguntas possíveis: **real** = desenho × n; **desenho** = real ÷ n; **escala**: n = real ÷ desenho (na mesma unidade). Uma maquete de um prédio de 24 m na escala 1 : 60 tem 2.400 cm ÷ 60 = 40 cm de altura.'),
        lab({
          title: 'O microscópio',
          intro: 'Escolha a ampliação linear do microscópio e a largura de uma célula na imagem.',
          params: [
            { key: 'a', label: 'Ampliação', min: 50, max: 1000, step: 50, value: 100, format: (v) => `${v} vezes` },
            { key: 'x', label: 'Largura na imagem', min: 1, max: 20, step: 1, value: 5, format: (v) => `${v} mm` },
          ],
          readouts: ({ a, x }) => [
            { label: 'Escala', value: `${a} : 1` },
            { label: 'Largura real', value: `${x} ÷ ${a} = ${num(x / a, 4)} mm` },
            { label: 'Em micrômetros', value: `${num((1000 * x) / a, 2)} µm`, big: true, tone: 'brass' },
          ],
          goal: {
            task: 'Uma célula de 25 µm aparece com 10 mm na imagem. Ache a ampliação.',
            done: ({ a, x }) => x === 10 && a === 400,
            success: 'Isso: 10 mm = 10.000 µm, e 10.000 ÷ 25 = 400 vezes.',
          },
          insight: 'Na ampliação, a imagem é MAIOR que o real: para voltar ao real, divida pela ampliação.',
        }),
        key('Escala de ampliação', 'Na escala 5 : 1, o desenho é 5 vezes MAIOR que o real: real = desenho ÷ 5. Microscópios informam a ampliação linear: "400 vezes" é a escala 400 : 1.'),
        example('Descobrir a escala', 'Num mapa, 6 cm representam 18 km. Qual é a escala?', [
          askStep('Primeiro, a mesma unidade.', 'Quanto é 18 km em centímetros?', [
            ok('1.800.000 cm'),
            no('18.000 cm', '1 km = 100.000 cm: 18 km = 1.800.000 cm.'),
          ]),
          step('Escala = real ÷ desenho:', '1.800.000 ÷ 6 = 300.000'),
        ], 'A escala é 1 : 300.000.'),
        warn('Ampliação não é "1 : n"', 'Uma foto ampliada 100 vezes tem escala 100 : 1: divida a medida da foto por 100 para achar a real.'),
        check(numeric({
          prompt: [p('A ilustração de uma formiga, na escala 8 : 1, mostra o corpo com 6,4 cm.')],
          ask: 'Qual é o comprimento real do corpo da formiga, em centímetros?',
          unit: 'cm',
          answer: 0.8,
          wrong: [
            { value: 51.2, feedback: '51,2 = 6,4 × 8 trata a ilustração como redução. Na escala 8 : 1 o desenho é 8 vezes MAIOR que a formiga.' },
            { value: 0.08, feedback: 'Um zero a mais: 6,4 ÷ 8 = 0,8 cm.' },
          ],
          solution: ['$6,4 ÷ 8 = 0,8 cm'],
        })),
      ],
      practice: [gen(realToDrawGen), gen(findScaleGen), gen(magnifyGen)],
      challenge: [
        gen(realToDrawGen),
        gen(findScaleGen),
        gen(magnifyGen),
        numeric({
          prompt: [p('Numa planta, uma parede de 6 m de comprimento aparece com 4 cm. Na mesma planta, uma janela aparece com 0,8 cm.')],
          ask: 'Qual é a largura real da janela, em metros?',
          unit: 'm',
          answer: 1.2,
          wrong: [
            { value: 12, feedback: 'Um zero a menos foi cortado: 0,8 × 150 = 120 cm = 1,2 m.' },
            { value: 4.8, feedback: '6 × 0,8 multiplica sem passar pela escala. A escala é 600 cm ÷ 4 cm = 1 : 150.' },
            { value: 120, feedback: '120 é a largura em CENTÍMETROS. Em metros: 1,2 m.' },
          ],
          solution: ['$Escala: 600 cm ÷ 4 cm = 150 → 1 : 150', '$Janela: 0,8 × 150 = 120 cm = 1,2 m'],
        }),
      ],
      recap: [
        'Real = desenho × n; desenho = real ÷ n; n = real ÷ desenho.',
        'Sempre na mesma unidade antes de dividir.',
        'Ampliação k : 1 (ou "k vezes"): real = imagem ÷ k.',
      ],
    })),

    stage('mudar', 'interpretacao', 'Mudar de escala', 'Redesenhar em outra escala, reduzir ou ampliar figuras por um fator, atualizar a escala de um mapa impresso ampliado e escolher a escala que faz o desenho caber na folha.', () => ({
      learn: [
        text('Para passar de uma escala a outra, compare os denominadores: de 1 : 300 para 1 : 100 o desenho fica 300 ÷ 100 = **3 vezes maior**. Já imprimir um mapa a 150% multiplica os comprimentos do desenho por 1,5: a escala 1 : 30.000 vira 1 : 20.000 (30.000 ÷ 1,5).'),
        lab({
          title: 'Redimensionar a figura',
          intro: 'Uma figura de 50 cm por 30 cm será reproduzida em outro tamanho, sem deformar.',
          params: [{ key: 'f', label: 'Tamanho da reprodução', min: 25, max: 200, step: 5, value: 100, format: (v) => `${v}%` }],
          readouts: ({ f }) => {
            const k = f / 100;
            return [
              { label: 'Largura', value: `${num(50 * k, 2)} cm`, big: true, tone: 'brass' },
              { label: 'Altura', value: `${num(30 * k, 2)} cm` },
              { label: 'Área', value: `${num(1500 * k * k, 2)} cm² (× ${num(k * k, 4)})` },
            ];
          },
          viz: ({ f }) => ({
            kind: 'shape',
            shape: 'rect',
            dims: [50 * (f / 100), 30 * (f / 100)],
            labels: [`${num(50 * (f / 100), 1)} cm`, `${num(30 * (f / 100), 1)} cm`],
            summary: `Reprodução a ${f}%: ${num(50 * (f / 100), 1)} cm por ${num(30 * (f / 100), 1)} cm`,
          }),
          goal: {
            task: 'Reduza a figura para que a largura fique com exatamente 20 cm.',
            done: ({ f }) => f === 40,
            success: 'Isso: 20 ÷ 50 = 0,4 (40%). A altura vai a 12 cm, e a área a 0,4² = 16% da original.',
          },
          insight: 'O fator vale para todos os comprimentos; a área muda com o quadrado dele.',
        }),
        example('Caber na folha', 'Um terreno de 48 m por 30 m deve ser desenhado numa área útil de 28 cm por 20 cm, com o lado maior no lado maior da folha. As escalas possíveis são 1 : 100, 1 : 150, 1 : 200 e 1 : 250. Qual dá o maior desenho que cabe?', [
          step('Na escala 1 : n, o desenho mede 4.800 ÷ n cm por 3.000 ÷ n cm.'),
          askStep('A 1 : 150, o desenho teria 32 cm × 20 cm.', 'Cabe na folha?', [
            ok('Não: 32 cm passa dos 28 cm'),
            no('Sim, porque 20 cm cabe na altura', 'As duas medidas precisam caber: 32 cm passa dos 28 cm da folha.'),
          ]),
          step('A 1 : 200: 24 cm × 15 cm — cabe, e é o maior entre os que cabem (1 : 250 daria 19,2 cm × 12 cm).'),
        ], 'A escala é 1 : 200.'),
        warn('Denominador maior, desenho menor', '1 : 250 é uma redução MAIOR que 1 : 100: o desenho fica menor. Para o maior desenho possível, escolha o menor denominador que ainda cabe.'),
        check(numeric({
          prompt: [p('Uma planta na escala 1 : 300 mostra uma sala com 2,2 cm de largura. Ela será redesenhada na escala 1 : 100.')],
          ask: 'Quanto medirá a largura da sala no novo desenho?',
          unit: 'cm',
          answer: 6.6,
          wrong: [
            { value: 0.73, feedback: 'A mudança ficou invertida: de 1 : 300 para 1 : 100 o desenho fica 3 vezes MAIOR.' },
            { value: 660, feedback: '660 cm é a largura REAL da sala. Divida por 100 para o novo desenho.' },
            { value: 3, feedback: '3 é o fator de ampliação (300 ÷ 100), não a medida.' },
          ],
          solution: ['$Fator: 300 ÷ 100 = 3', '$2,2 × 3 = 6,6 cm'],
        })),
      ],
      practice: [gen(rescaleGen), gen(resizeGen), gen(printScaleGen)],
      challenge: [
        gen(rescaleGen),
        gen(resizeGen),
        gen(printScaleGen),
        choice({
          prompt: [p('Uma quadra de 40 m por 20 m será desenhada numa folha com área útil de 25 cm por 15 cm, com o lado maior no lado maior da folha.')],
          ask: 'Entre as escalas 1 : 100, 1 : 125, 1 : 150 e 1 : 200, qual dá o maior desenho que cabe na folha?',
          options: [
            no('1 : 100', 'A 1 : 100 o desenho teria 40 cm × 20 cm: muito maior que a folha.'),
            no('1 : 125', 'A 1 : 125 o desenho teria 32 cm × 16 cm: os 32 cm passam dos 25 cm.'),
            no('1 : 150', 'A 1 : 150 o desenho teria 26,7 cm × 13,3 cm: os 26,7 cm ainda passam dos 25 cm.'),
            ok('1 : 200'),
          ],
          fixedOrder: true,
          solution: ['$1 : 200 → 4.000 ÷ 200 = 20 cm e 2.000 ÷ 200 = 10 cm: cabe', 'As escalas de denominador menor não cabem; 1 : 200 é a maior que cabe.'],
        }),
      ],
      recap: [
        'De 1 : n₁ para 1 : n₂: o desenho fica × (n₁ ÷ n₂).',
        'Reduzir ou ampliar: todas as medidas pelo mesmo fator.',
        'Imprimir a p%: o denominador fica ÷ (p/100).',
        'Caber na folha: teste as duas medidas; o menor denominador que cabe dá o maior desenho.',
      ],
    })),

    stage('aplicacoes', 'aplicacoes', 'Escala no mundo real', 'Usar a escala dentro de problemas maiores: velocidade a partir de um mapa, material para um contorno e peças ao longo de um comprimento.', () => ({
      learn: [
        text('Em muitos problemas a escala é só o primeiro passo: depois de achar a medida real, vem a pergunta de verdade — tempo, velocidade, quantidade de material.'),
        example('Velocidade no mapa', 'Um barco leva 2 h 15 min para percorrer um trajeto que mede 18 cm num mapa na escala 1 : 400.000. Qual é a velocidade média?', [
          step('Distância real:', '18 × 400.000 = 7.200.000 cm = 72 km'),
          askStep('Agora o tempo em horas.', 'Quanto é 2 h 15 min?', [
            ok('2,25 h'),
            no('2,15 h', '15 min são 1/4 de hora = 0,25 h.'),
          ]),
          step('Velocidade:', '72 ÷ 2,25 = 32 km/h'),
        ], 'A velocidade média é 32 km/h.'),
        lab({
          title: 'Fita no contorno',
          intro: 'O contorno de um jardim foi medido numa maquete. A fita de sinalização é vendida em rolos de 10 m.',
          params: [
            { key: 'c', label: 'Contorno na maquete', min: 20, max: 150, step: 5, value: 60, format: (v) => `${v} cm` },
            { key: 'n', label: 'Escala 1 : n', min: 20, max: 100, step: 10, value: 50, format: (v) => `1 : ${v}` },
          ],
          readouts: ({ c, n }) => {
            const m = (c * n) / 100;
            return [
              { label: 'Contorno real', value: `${c} × ${n} = ${num(c * n)} cm = ${num(m, 2)} m` },
              { label: 'Rolos exatos', value: num(m / 10, 2) },
              { label: 'Rolos a comprar', value: `${ceil(m / 10)}`, big: true, tone: 'brass' },
            ];
          },
          goal: {
            task: 'Na escala 1 : 50, ache o maior contorno da maquete que ainda se cobre com 4 rolos.',
            done: ({ c, n }) => n === 50 && c === 80,
            success: 'Isso: 4 rolos = 40 m = 4.000 cm, e 4.000 ÷ 50 = 80 cm na maquete. Com 85 cm, já seria preciso o 5º rolo.',
          },
          insight: 'Converta a medida da maquete para o real antes de dividir pelo tamanho do rolo.',
        }),
        key('Arredonde no fim, para o lado certo', 'Material comprado em unidades inteiras (rolos, tábuas, sacos): calcule a medida real, divida e arredonde para cima.'),
        check(numeric({
          prompt: [p('Numa planta na escala 1 : 50, um corredor mede 16 cm de comprimento. Ele será coberto com placas colocadas em fila, cada uma ocupando 40 cm do comprimento.')],
          ask: 'Quantas placas serão necessárias?',
          unit: 'placas',
          answer: 20,
          wrong: [
            { value: 0.4, feedback: '16 ÷ 40 usa a medida da PLANTA. Converta antes: 16 × 50 = 800 cm.' },
            { value: 800, feedback: '800 cm é o comprimento real do corredor. Divida pelos 40 cm de cada placa.' },
            { value: 2, feedback: '8 m ÷ 40 cm mistura unidades: 800 cm ÷ 40 cm = 20 placas.' },
          ],
          solution: ['$16 × 50 = 800 cm', '$800 ÷ 40 = 20 placas'],
        })),
      ],
      practice: [
        gen(mapSpeedGen),
        gen(materialGen),
        numeric({
          prompt: [p('Uma ciclovia mede 9 cm num mapa na escala 1 : 25.000. Um ciclista a percorre a 15 km/h.')],
          ask: 'Quantos minutos ele leva para percorrer a ciclovia inteira?',
          unit: 'min',
          answer: 9,
          wrong: [
            { value: 0.15, feedback: '0,15 é o tempo em HORAS. Em minutos: × 60.' },
            { value: 90, feedback: 'Confira a conversão: 2,25 km ÷ 15 km/h = 0,15 h = 9 min.' },
          ],
          hints: ['Real: 9 × 25.000 = 225.000 cm = 2,25 km.', 'Tempo = distância ÷ velocidade, em horas; depois × 60.'],
          solution: ['$9 × 25.000 = 225.000 cm = 2,25 km', '$2,25 ÷ 15 = 0,15 h = 9 min'],
        }),
      ],
      challenge: [
        gen(mapSpeedGen),
        gen(materialGen),
        numeric({
          prompt: [p('O desenho de um deck, na escala 1 : 40, tem 15 cm de comprimento e 4 cm de largura. As tábuas serão colocadas no sentido da largura, sem folgas, e cada uma ocupa 12 cm do comprimento do deck.')],
          ask: 'Quantas tábuas serão necessárias?',
          unit: 'tábuas',
          answer: 50,
          wrong: [
            { value: 13.33, feedback: 'Isso usa a largura (160 cm). As tábuas são colocadas ao longo do COMPRIMENTO: 600 cm ÷ 12.' },
            { value: 1.25, feedback: '15 ÷ 12 usa a medida do desenho. Converta antes: 15 × 40 = 600 cm.' },
            { value: 600, feedback: '600 cm é o comprimento real do deck. Divida pelos 12 cm de cada tábua.' },
          ],
          solution: ['$Comprimento real: 15 × 40 = 600 cm', '$600 ÷ 12 = 50 tábuas'],
        }),
      ],
      recap: [
        'Primeiro a medida real; depois a pergunta (tempo, velocidade, material).',
        'Tempo em horas: minutos ÷ 60 (15 min = 0,25 h).',
        'Material em unidades inteiras: arredonde para cima.',
      ],
    })),

    stage('area-volume', 'aprofundamento', 'Áreas e volumes em escala', 'Usar que, numa escala linear 1 : n, as áreas ficam multiplicadas por n² e os volumes por n³ — em plantas, fotos aéreas, maquetes e miniaturas.', () => ({
      learn: [
        text('A escala vale para **comprimentos**. Se a escala linear é 1 : 100, uma área real é 100 × 100 = 10.000 vezes a área do desenho, e um volume real é 100 × 100 × 100 = 1.000.000 de vezes o volume da maquete.'),
        lab({
          title: 'Comprimento, área e volume',
          intro: 'Multiplique todos os comprimentos de um cubo por um fator k e compare o que acontece com a área e o volume.',
          params: [{ key: 'k', label: 'Fator linear k', min: 1, max: 5, step: 0.5, value: 2, format: (v) => `× ${num(v, 1)}` }],
          readouts: ({ k }) => [
            { label: 'Comprimentos', value: `× ${num(k, 1)}` },
            { label: 'Áreas', value: `× ${num(k * k, 2)}`, tone: 'sky' },
            { label: 'Volumes (e massas)', value: `× ${num(k ** 3, 3)}`, big: true, tone: 'brass' },
          ],
          viz: ({ k }) => ({
            kind: 'bars',
            bars: [
              { label: 'comprimento', value: k, text: `× ${num(k, 1)}`, tone: 'parchment' },
              { label: 'área', value: k * k, text: `× ${num(k * k, 2)}`, tone: 'sky' },
              { label: 'volume', value: k ** 3, text: `× ${num(k ** 3, 3)}`, tone: 'brass' },
            ],
            max: 125,
            summary: `Fator ${num(k, 1)}: área × ${num(k * k, 2)} e volume × ${num(k ** 3, 3)}`,
          }),
          goal: {
            task: 'Ache o fator linear que multiplica o VOLUME por 27.',
            done: ({ k }) => k === 3,
            success: 'Isso: 3³ = 27. O mesmo fator multiplica as áreas por 9.',
          },
          insight: 'Dobrar os comprimentos quadruplica as áreas e multiplica os volumes por 8.',
        }),
        example('Planta do quarto', 'Na planta de uma casa, na escala 1 : 50, um quarto aparece como um retângulo de 6 cm por 7 cm. Qual é a área real?', [
          askStep('A escala vale para comprimentos.', 'O que fazer primeiro?', [
            ok('Converter cada lado: 6 × 50 = 300 cm = 3 m e 7 × 50 = 350 cm = 3,5 m'),
            no('Calcular 6 × 7 = 42 cm² e multiplicar por 50', 'A área fica multiplicada por 50² = 2.500, e não por 50.'),
          ]),
          step('Área real:', '3 × 3,5 = 10,5 m²'),
        ], 'O quarto tem 10,5 m².'),
        key('Área × n², volume × n³', 'Escala linear 1 : n → área real = área do desenho × n²; volume real = volume da maquete × n³. Se cada comprimento vira 80% do original, a área vira 0,8² = 64% e o volume, 0,8³ = 51,2%.'),
        warn('Converter área e volume', '1 m² = 10.000 cm²; 1 ha = 10.000 m²; 1 m³ = 1.000.000 cm³ = 1.000 L; 1 L = 1.000 cm³.'),
        check(numeric({
          prompt: [p('Num mapa na escala 1 : 5.000, um parque ocupa 24 cm². Considere 1 hectare = 10.000 m².')],
          ask: 'Qual é a área real do parque, em hectares?',
          unit: 'ha',
          answer: 6,
          wrong: [
            { value: 0.0012, feedback: 'Isso multiplica a área por 5.000, e não por 5.000² = 25.000.000.' },
            { value: 60000, feedback: '60.000 é a área em m². Em hectares: ÷ 10.000.' },
            { value: 0.6, feedback: 'Um zero a mais: 600.000.000 cm² = 60.000 m² = 6 ha.' },
          ],
          solution: ['$24 × 5.000² = 24 × 25.000.000 = 600.000.000 cm²', '$= 60.000 m² = 6 ha'],
        })),
      ],
      practice: [gen(areaScaleGen), gen(volumeScaleGen), gen(linearPercentGen)],
      challenge: [
        gen(areaScaleGen),
        gen(volumeScaleGen),
        gen(linearPercentGen),
        numeric({
          prompt: [p('Duas miniaturas maciças da mesma estátua, do mesmo material, estão nas escalas 1 : 6 e 1 : 18. A maior pesa 2.700 g, e a massa é proporcional ao volume.')],
          ask: 'Quanto pesa a menor?',
          unit: 'g',
          answer: 100,
          wrong: [
            { value: 900, feedback: 'Isso usa a razão linear (1/3). A massa acompanha o VOLUME: (1/3)³ = 1/27.' },
            { value: 300, feedback: 'Isso usa a razão das áreas (1/3)² = 1/9. A massa acompanha o VOLUME: 1/27.' },
          ],
          solution: ['$Razão linear: 6 ÷ 18 = 1/3; volumes: (1/3)³ = 1/27', '$2.700 ÷ 27 = 100 g'],
        }),
      ],
      recap: [
        'Comprimentos × n; áreas × n²; volumes (e massas) × n³.',
        'Converta cada lado antes de calcular áreas — ou use n².',
        'Unidades: 1 m² = 10.000 cm²; 1 ha = 10.000 m²; 1 m³ = 1.000 L.',
      ],
    })),

    stage('maestria', 'maestria', 'Maestria: escala nos problemas difíceis', 'Resolver problemas inéditos de escala com várias etapas: descobrir a escala a partir de áreas, combinar impressões, volumes e conversões.', () => ({
      learn: [
        strategy('Três verificações', '1) A escala é linear: comprimentos × n, áreas × n², volumes × n³. 2) Mesma unidade dos dois lados antes de dividir. 3) É redução (1 : n) ou ampliação (k : 1)?'),
        example('Escala a partir de áreas', 'Uma foto aérea, sem distorção, mostra um campo de 4.800 m² como uma região de 12 cm². Qual é a escala linear?', [
          step('Mesma unidade:', '4.800 m² = 48.000.000 cm²'),
          step('Razão das áreas:', '48.000.000 ÷ 12 = 4.000.000'),
          askStep('Essa razão vale n², porque é de áreas.', 'Qual é n?', [
            ok('√4.000.000 = 2.000'),
            no('4.000.000', 'Essa é a razão das ÁREAS; a escala linear é a raiz quadrada: 2.000.'),
          ]),
        ], 'A escala é 1 : 2.000.'),
        reveal('Por que a massa de uma miniatura cai tanto?', 'Porque massa é proporcional ao volume, e o volume cai com o cubo da escala: uma miniatura com metade da altura tem 1/8 da massa.'),
        check(numeric({
          prompt: [p('A maquete de uma piscina, na escala 1 : 25, comporta 2 L de água. Considere 1 m³ = 1.000 L.')],
          ask: 'Qual é a capacidade da piscina real, em m³?',
          unit: 'm³',
          answer: 31.25,
          wrong: [
            { value: 0.05, feedback: 'Isso multiplica por 25 (fator linear). Volume usa 25³ = 15.625.' },
            { value: 1.25, feedback: 'Isso multiplica por 25² (fator de área). Volume usa 25³ = 15.625.' },
            { value: 31250, feedback: '31.250 é a capacidade em LITROS. Em m³: ÷ 1.000.' },
          ],
          solution: ['$2 × 25³ = 2 × 15.625 = 31.250 L = 31,25 m³'],
        })),
      ],
      practice: [
        numeric({
          prompt: [p('Um mapa na escala 1 : 20.000 foi ampliado numa copiadora para 160%. Na cópia, uma rua mede 12 cm.')],
          ask: 'Qual é o comprimento real da rua, em metros?',
          unit: 'm',
          answer: 1500,
          wrong: [
            { value: 2400, feedback: 'Isso usa a escala original, mas a cópia foi ampliada: a nova escala é 1 : (20.000 ÷ 1,6) = 1 : 12.500.' },
            { value: 3840, feedback: 'Isso multiplica o denominador por 1,6. Ampliar o desenho DIVIDE o denominador: 1 : 12.500.' },
          ],
          hints: ['Nova escala: 20.000 ÷ 1,6.', '12 cm × 12.500 = ? cm; converta para metros.'],
          solution: ['$Nova escala: 20.000 ÷ 1,6 = 12.500', '$12 × 12.500 = 150.000 cm = 1.500 m'],
        }),
        gen(areaScaleGen),
        gen(printScaleGen),
      ],
      challenge: [
        numeric({
          prompt: [p('Num mapa na escala 1 : 50.000, um lago ocupa uma região de 6 cm². Considere 1 km² = 1.000.000 m².')],
          ask: 'Qual é a área real do lago, em km²?',
          unit: 'km²',
          answer: 1.5,
          wrong: [
            { value: 0.00003, feedback: 'Isso multiplica a área só por 50.000 (fator linear). Áreas usam 50.000².' },
            { value: 150, feedback: 'Confira a conversão: 1 km² = 10.000.000.000 cm².' },
            { value: 1500000, feedback: '1.500.000 é a área em m². Em km²: ÷ 1.000.000.' },
          ],
          solution: ['$6 × 50.000² = 6 × 2.500.000.000 = 15.000.000.000 cm²', '$= 1.500.000 m² = 1,5 km²'],
        }),
        gen(volumeScaleGen),
        gen(mapSpeedGen),
        gen(rescaleGen),
      ],
      recap: [
        'Áreas dão n²; tire a raiz para voltar à escala linear.',
        'Cópias ampliadas ou reduzidas mudam o denominador (÷ fator).',
        'Volume e massa: n³ — confira as unidades no fim.',
      ],
    })),
  ],
});
