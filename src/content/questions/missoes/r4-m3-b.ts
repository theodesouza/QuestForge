import { AUTORAL, alts, batch } from '../_helpers';

/** Missão r4-m3 "O Salão dos Círculos" — questões extras para repetição (lote b, GEO-161 a GEO-172, ângulos e polígonos regulares). Questões autorais. */
export const MISSAO_R4M3_B = batch([
  {
    id: 'GEO-161',
    topic: 'geo-plana',
    subtopic: 'angulos',
    difficulty: 1,
    skills: ['H8', 'H9'],
    stem: [
      {
        kind: 'p',
        text: 'Uma bandeirola de festa tem a forma de um triângulo. Dois de seus ângulos internos medem 52° e 71°.',
      },
    ],
    ask: 'Quanto mede o terceiro ângulo interno da bandeirola?',
    alternatives: alts('128°', '57°', '109°', '123°', '90°'),
    answer: 'B',
    hints: [
      'A soma dos ângulos internos de qualquer triângulo é sempre a mesma.',
      'Some os dois ângulos conhecidos e subtraia o resultado de 180°.',
    ],
    solution: [
      '52° + 71° = 123°, e o terceiro ângulo é 180° − 123° = 57°.',
      'Armadilhas: 128° (180° − 52°) e 109° (180° − 71°) descontam só um dos ângulos; 123° é a soma dos dois conhecidos; 90° supõe, sem base no enunciado, um ângulo reto.',
    ],
    concept: 'Em todo triângulo, a soma dos ângulos internos é 180°.',
    estimatedSeconds: 35,
    source: AUTORAL,
    verify: () => 180 - 52 - 71,
  },
  {
    id: 'GEO-162',
    topic: 'geo-plana',
    subtopic: 'angulos',
    difficulty: 1,
    skills: ['H8', 'H9'],
    stem: [
      {
        kind: 'p',
        text: 'Um pavimentador de calçadas desenha, para um canteiro, uma figura de 6 lados (um hexágono), cujos lados formam, por dentro, seis ângulos internos.',
      },
    ],
    ask: 'Quanto vale a soma dos ângulos internos desse hexágono?',
    alternatives: alts('540°', '1.080°', '360°', '720°', '900°'),
    answer: 'D',
    hints: [
      'Um polígono de n lados pode ser dividido em n − 2 triângulos, traçando diagonais a partir de um mesmo vértice.',
      'Multiplique o número de triângulos por 180°.',
    ],
    solution: [
      'Soma = (n − 2) × 180° = (6 − 2) × 180° = 720°.',
      'Armadilhas: 360°, 540°, 900° e 1.080° são as somas de polígonos de 4, 5, 7 e 8 lados, respectivamente.',
    ],
    concept: 'A soma dos ângulos internos de um polígono convexo de n lados é (n − 2) × 180°.',
    estimatedSeconds: 40,
    source: AUTORAL,
    verify: () => (6 - 2) * 180,
  },
  {
    id: 'GEO-163',
    topic: 'geo-plana',
    subtopic: 'angulos',
    difficulty: 2,
    skills: ['H8', 'H9'],
    stem: [
      {
        kind: 'p',
        text: 'Uma calçada decorativa é montada com peças em forma de octógono regular (8 lados iguais e 8 ângulos internos iguais).',
      },
    ],
    ask: 'Quanto mede cada ângulo interno de uma peça?',
    alternatives: alts('135°', '45°', '120°', '150°', '108°'),
    answer: 'A',
    hints: [
      'Primeiro calcule a soma de todos os ângulos internos do octógono; depois divida pelo número de ângulos (todos iguais).',
      'Soma = (8 − 2) × 180°.',
    ],
    solution: [
      'Soma dos ângulos internos: (8 − 2) × 180° = 1.080°.',
      'Cada ângulo: 1.080° ÷ 8 = 135°.',
      'Armadilhas: 45° é o ângulo externo (360° ÷ 8); 120° é o ângulo do hexágono; 150° é o do dodecágono; 108° é o do pentágono.',
    ],
    concept: 'Num polígono regular de n lados, cada ângulo interno mede (n − 2) × 180° ÷ n, e cada ângulo externo mede 360° ÷ n.',
    estimatedSeconds: 55,
    source: AUTORAL,
    verify: () => ((8 - 2) * 180) / 8,
  },
  {
    id: 'GEO-164',
    topic: 'geo-plana',
    subtopic: 'angulos',
    difficulty: 2,
    skills: ['H8', 'H9'],
    stem: [
      {
        kind: 'p',
        text: 'Um mosaico é formado por peças que são polígonos regulares. Em cada vértice de uma dessas peças, o ângulo externo mede 30°.',
      },
    ],
    ask: 'Quantos lados tem cada peça?',
    alternatives: alts('10 lados', '8 lados', '12 lados', '6 lados', '15 lados'),
    answer: 'C',
    hints: [
      'A soma dos ângulos externos de qualquer polígono convexo é sempre 360°.',
      'Num polígono regular, todos os ângulos externos são iguais: divida 360° pelo valor de um deles.',
    ],
    solution: [
      'Número de lados = 360° ÷ 30° = 12.',
      'Armadilhas: 6, 8, 10 e 15 lados correspondem a ângulos externos de 60°, 45°, 36° e 24°.',
    ],
    concept: 'Ângulo externo de um polígono regular = 360° ÷ n. Por isso n = 360° ÷ (ângulo externo).',
    estimatedSeconds: 50,
    source: AUTORAL,
    verify: () => 360 / 30,
  },
  {
    id: 'GEO-165',
    topic: 'geo-plana',
    subtopic: 'angulos',
    difficulty: 2,
    skills: ['H8', 'H9'],
    stem: [
      {
        kind: 'p',
        text: 'Em um relógio analógico, de mostrador circular com 12 marcas igualmente espaçadas, o ponteiro das horas e o dos minutos formam um ângulo. Considere o instante exato das 4 horas, com o ponteiro dos minutos apontando para o 12 e o das horas apontando para o 4.',
      },
    ],
    ask: 'Qual é a medida do menor ângulo formado pelos ponteiros às 4 horas?',
    alternatives: alts('90°', '100°', '150°', '60°', '120°'),
    answer: 'E',
    hints: [
      'O mostrador completo é uma volta de 360°, dividida em 12 partes iguais.',
      'Cada intervalo entre duas marcas vale 360° ÷ 12; às 4 horas, os ponteiros estão separados por 4 intervalos.',
    ],
    solution: [
      'Cada intervalo vale 360° ÷ 12 = 30°.',
      'Entre o 12 e o 4 há 4 intervalos: 4 × 30° = 120°.',
      'Armadilhas: 90° é o ângulo às 3 horas; 150° é o das 5 horas (e também o ângulo maior das 7 horas); 60° é o das 2 horas; 100° não corresponde a um número inteiro de intervalos.',
    ],
    concept: 'Num relógio, cada hora corresponde a 30° (360° ÷ 12) de abertura entre marcas.',
    estimatedSeconds: 50,
    source: AUTORAL,
    verify: () => (360 / 12) * 4,
  },
  {
    id: 'GEO-166',
    topic: 'geo-plana',
    subtopic: 'angulos',
    difficulty: 2,
    skills: ['H8', 'H9'],
    stem: [
      {
        kind: 'p',
        text: 'Duas ruas retas e paralelas são cortadas por uma avenida. No cruzamento da avenida com a primeira rua, um dos ângulos, situado entre as ruas e à esquerda da avenida, mede 65°. No cruzamento com a segunda rua, considere o ângulo também situado entre as ruas e do mesmo lado (à esquerda) da avenida — um par de ângulos colaterais internos.',
      },
    ],
    ask: 'Quanto mede esse ângulo do segundo cruzamento?',
    alternatives: alts('65°', '115°', '25°', '295°', '90°'),
    answer: 'B',
    hints: [
      'Quando duas paralelas são cortadas por uma transversal, os ângulos colaterais internos são suplementares: somam 180°.',
      'Subtraia 65° de 180°.',
    ],
    solution: [
      'Colaterais internos entre paralelas somam 180°: 180° − 65° = 115°.',
      'Armadilhas: 65° seria o ângulo alterno interno (do outro lado da avenida); 25° é o complemento de 65° (90° − 65°); 295° é 360° − 65°; 90° supõe cruzamento perpendicular.',
    ],
    concept: 'Entre paralelas cortadas por uma transversal: ângulos alternos internos são iguais, correspondentes são iguais, e colaterais internos somam 180°.',
    estimatedSeconds: 65,
    source: AUTORAL,
    verify: () => 180 - 65,
  },
  {
    id: 'GEO-167',
    topic: 'geo-plana',
    subtopic: 'angulos',
    difficulty: 3,
    skills: ['H8', 'H9'],
    stem: [
      {
        kind: 'p',
        text: 'Em um parque, o canteiro central tem a forma de um polígono convexo de 9 lados (um eneágono). Para decorá-lo, serão esticados cordões retos ligando cada par de vértices que não sejam vizinhos, isto é, todas as diagonais possíveis, uma única vez cada.',
      },
    ],
    ask: 'Quantos cordões serão esticados?',
    alternatives: alts('18', '36', '54', '27', '45'),
    answer: 'D',
    hints: [
      'De cada vértice partem diagonais para todos os outros vértices, menos ele mesmo e os dois vizinhos.',
      'Cada diagonal é contada duas vezes (uma de cada extremidade): divida por 2 no final.',
    ],
    solution: [
      'De cada vértice partem 9 − 3 = 6 diagonais.',
      'Total: 9 × 6 ÷ 2 = 27 diagonais.',
      'Armadilhas: 54 esquece de dividir por 2; 36 é o número de segmentos entre todos os pares de vértices (inclusive os lados): 9 × 8 ÷ 2; 18 e 45 não correspondem à fórmula.',
    ],
    concept: 'O número de diagonais de um polígono convexo de n lados é n(n − 3) ÷ 2.',
    estimatedSeconds: 75,
    source: AUTORAL,
    verify: () => (9 * (9 - 3)) / 2,
  },
  {
    id: 'GEO-168',
    topic: 'geo-plana',
    subtopic: 'angulos',
    difficulty: 3,
    skills: ['H8', 'H9'],
    stem: [
      {
        kind: 'p',
        text: 'Um piso é formado por peças de dois tipos, ambas polígonos regulares: octógonos e outro polígono menor. Em cada vértice do piso, encontram-se exatamente dois octógonos e uma peça do outro tipo, sem folgas e sem sobreposição, de modo que os três ângulos preenchem uma volta completa.',
      },
    ],
    ask: 'Quantos lados tem o outro polígono regular?',
    alternatives: alts('4 lados', '3 lados', '5 lados', '6 lados', '8 lados'),
    answer: 'A',
    hints: [
      'Em um ponto, os ângulos que se encaixam somam 360°. Calcule o ângulo interno do octógono regular.',
      'O ângulo interno do outro polígono é o que falta para completar 360° depois dos dois octógonos.',
    ],
    solution: [
      'Ângulo interno do octógono regular: (8 − 2) × 180° ÷ 8 = 135°.',
      'Ângulo restante: 360° − 2 × 135° = 90°.',
      'O polígono regular de ângulo interno 90° é o quadrado: 4 lados.',
      'Armadilhas: um triângulo tem ângulo interno de 60°; um pentágono, de 108°; um hexágono, de 120°; um octógono, de 135°: nenhum deles fecha os 360° com dois octógonos.',
    ],
    concept: 'Ladrilhar um plano com polígonos regulares exige que os ângulos que se encontram em cada vértice somem exatamente 360°.',
    estimatedSeconds: 90,
    source: AUTORAL,
    verify: () => {
      const rest = 360 - 2 * (((8 - 2) * 180) / 8);
      return 360 / (180 - rest);
    },
  },
  {
    id: 'GEO-169',
    topic: 'geo-plana',
    subtopic: 'angulos',
    difficulty: 3,
    skills: ['H8', 'H9'],
    stem: [
      {
        kind: 'p',
        text: 'Um terreno tem quatro lados, e seus ângulos internos medem x, 2x, 3x e 4x graus, nessa ordem de vértices.',
      },
    ],
    ask: 'Quanto mede o maior ângulo interno do terreno?',
    alternatives: alts('90°', '120°', '144°', '160°', '108°'),
    answer: 'C',
    hints: [
      'A soma dos ângulos internos de um quadrilátero é 360°. Escreva uma equação com x.',
      'x + 2x + 3x + 4x = 10x.',
    ],
    solution: [
      '10x = 360° ⇒ x = 36°.',
      'Ângulos: 36°, 72°, 108° e 144°. O maior é 144°.',
      'Armadilhas: 108° é o ângulo 3x; 90° supõe ângulos retos; 120° e 160° não satisfazem a proporção 1 : 2 : 3 : 4.',
    ],
    concept: 'Para ângulos dados em proporção, usa-se a soma total do polígono (360° no quadrilátero) para descobrir a "parte" x e depois cada ângulo.',
    estimatedSeconds: 70,
    source: AUTORAL,
    verify: () => (360 / 10) * 4,
  },
  {
    id: 'GEO-170',
    topic: 'geo-plana',
    subtopic: 'angulos',
    difficulty: 3,
    skills: ['H8', 'H9'],
    stem: [
      {
        kind: 'p',
        text: 'Em um painel circular, dois pontos A e B da borda são ligados ao centro O por raios, e o ângulo central AÔB mede 100°. Um observador sentado em um ponto P da borda, no arco maior (fora do arco AB menor), vê os pontos A e B, formando o ângulo APB.',
      },
    ],
    ask: 'Quanto mede o ângulo APB?',
    alternatives: alts('100°', '200°', '25°', '80°', '50°'),
    answer: 'E',
    hints: [
      'O ângulo APB tem o vértice na circunferência e enxerga o mesmo arco AB que o ângulo central AÔB (ângulo inscrito).',
      'Um ângulo inscrito mede metade do ângulo central que subtende o mesmo arco.',
    ],
    solution: [
      'Ângulo inscrito = ângulo central ÷ 2 = 100° ÷ 2 = 50°.',
      'Armadilhas: 100° é o próprio ângulo central; 200° o dobra; 25° divide por 4; 80° é 180° − 100°.',
    ],
    concept: 'Todo ângulo inscrito numa circunferência mede metade do ângulo central correspondente ao mesmo arco.',
    estimatedSeconds: 70,
    source: AUTORAL,
    verify: () => 100 / 2,
  },
  {
    id: 'GEO-171',
    topic: 'geo-plana',
    subtopic: 'angulos',
    difficulty: 3,
    skills: ['H8', 'H9', 'H12'],
    stem: [
      {
        kind: 'p',
        text: 'Em um relógio analógico, o ponteiro dos minutos gira 6° por minuto, e o das horas gira 0,5° por minuto, contados a partir da marca das 12 horas. Considere o instante exato das 3 horas e 20 minutos.',
      },
    ],
    ask: 'Qual é a medida do menor ângulo entre os dois ponteiros nesse instante?',
    alternatives: alts('0°', '20°', '30°', '10°', '40°'),
    answer: 'B',
    hints: [
      'Calcule a posição de cada ponteiro, em graus a partir do 12, e subtraia. Lembre que o ponteiro das horas também anda durante os 20 minutos.',
      'Ponteiro dos minutos: 20 × 6°. Ponteiro das horas: 3 × 30° + 20 × 0,5°.',
    ],
    solution: [
      'Minutos: 20 × 6° = 120°.',
      'Horas: 3 × 30° + 20 × 0,5° = 90° + 10° = 100°.',
      'Ângulo entre eles: 120° − 100° = 20°.',
      'Armadilhas: 30° supõe o ponteiro das horas parado no 3 (120° − 90°); 0° e 10° vêm de supor ponteiros alinhados ou de errar o avanço do ponteiro das horas; 40° dobra a diferença.',
    ],
    concept: 'O ponteiro das horas não fica parado: a cada minuto ele avança 0,5°. Para o ângulo entre ponteiros, calcula-se a posição de cada um e subtrai-se.',
    estimatedSeconds: 95,
    source: AUTORAL,
    verify: () => 20 * 6 - (3 * 30 + 20 * 0.5),
  },
  {
    id: 'GEO-172',
    topic: 'geo-plana',
    subtopic: 'angulos',
    difficulty: 4,
    skills: ['H8', 'H9', 'H12'],
    stem: [
      {
        kind: 'p',
        text: 'Um polígono regular tem ângulos internos de 150° cada. Um engenheiro vai traçar todas as diagonais desse polígono, com uma linha de tinta em cada uma, uma única vez.',
      },
    ],
    ask: 'Quantas linhas de tinta serão traçadas?',
    alternatives: alts('48', '66', '36', '54', '60'),
    answer: 'D',
    hints: [
      'Primeiro descubra o número de lados: o ângulo externo é o suplemento do interno, e a soma dos externos é 360°.',
      'Com n lados, o número de diagonais é n(n − 3) ÷ 2.',
    ],
    solution: [
      'Ângulo externo: 180° − 150° = 30°. Número de lados: 360° ÷ 30° = 12.',
      'Diagonais: 12 × (12 − 3) ÷ 2 = 12 × 9 ÷ 2 = 54.',
      'Armadilhas: 66 conta todos os segmentos entre vértices (12 × 11 ÷ 2), inclusive os lados; 48 é 12 × 4; 36 é 12 × 3; 60 não corresponde à fórmula.',
    ],
    concept: 'Problemas encadeados: o ângulo interno de um polígono regular dá o número de lados (via ângulo externo), e o número de lados dá as diagonais, n(n − 3) ÷ 2.',
    estimatedSeconds: 120,
    source: AUTORAL,
    verify: () => {
      const n = 360 / (180 - 150);
      return (n * (n - 3)) / 2;
    },
  },
]);
