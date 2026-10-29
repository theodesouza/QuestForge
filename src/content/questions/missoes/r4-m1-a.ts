import { AUTORAL, alts, batch } from '../_helpers';

/** Missão r4-m1 "O Pátio dos Polígonos" — questões extras para repetição (lote a, GEO-101 a GEO-112, perímetros e áreas). Questões autorais. */
export const MISSAO_R4M1_A = batch([
  {
    id: 'GEO-101',
    topic: 'geo-plana',
    subtopic: 'areas',
    difficulty: 1,
    skills: ['H8', 'H12'],
    stem: [
      {
        kind: 'p',
        text: 'Seu Raimundo vai cercar com arame um terreno retangular de 15 m de frente por 22 m de lado, dando uma única volta completa em todo o contorno do terreno.',
      },
    ],
    ask: 'Quantos metros de arame, no mínimo, ele precisa comprar?',
    alternatives: alts('37 m', '74 m', '59 m', '148 m', '330 m'),
    answer: 'B',
    hints: [
      'Contornar o terreno é medir o seu perímetro, isto é, a soma das medidas de todos os lados.',
      'Um retângulo tem dois lados de 15 m e dois lados de 22 m.',
    ],
    solution: [
      'Perímetro = 15 + 22 + 15 + 22 = 74 m.',
      'Armadilhas: 37 m é só meio perímetro (15 + 22); 59 m esquece um dos lados; 148 m dá duas voltas; 330 m (15 × 22) é a área, que se mede em m², e não o comprimento do arame.',
    ],
    concept:
      'Perímetro é a medida do contorno de uma figura (a soma dos seus lados); área mede a superfície que ela ocupa. Para cercar, usa-se o perímetro; para cobrir, a área.',
    estimatedSeconds: 40,
    source: AUTORAL,
    verify: () => 2 * (15 + 22),
  },
  {
    id: 'GEO-102',
    topic: 'geo-plana',
    subtopic: 'areas',
    difficulty: 1,
    skills: ['H8', 'H12'],
    stem: [
      {
        kind: 'p',
        text: 'Uma bandeirola de festa junina tem a forma de um triângulo com 80 cm de base e 60 cm de altura relativa a essa base. O pano de uma das faces da bandeirola será todo pintado.',
      },
    ],
    ask: 'Qual é a área, em cm², a ser pintada nessa face?',
    alternatives: alts('4.800 cm²', '140 cm²', '1.200 cm²', '2.400 cm²', '280 cm²'),
    answer: 'D',
    hints: [
      'A área de um triângulo é metade da área do retângulo de mesma base e mesma altura.',
      'Multiplique a base pela altura e divida o resultado por 2.',
    ],
    solution: [
      'Área = (base × altura) ÷ 2 = (80 × 60) ÷ 2 = 4.800 ÷ 2 = 2.400 cm².',
      'Armadilhas: 4.800 cm² é a área do retângulo (esqueceu de dividir por 2); 140 cm² soma base e altura; 1.200 cm² divide por 4; 280 cm² é o dobro dessa soma.',
    ],
    concept: 'Área do triângulo = (base × altura) ÷ 2, com a altura medida perpendicularmente à base escolhida.',
    estimatedSeconds: 40,
    source: AUTORAL,
    verify: () => (80 * 60) / 2,
  },
  {
    id: 'GEO-103',
    topic: 'geo-plana',
    subtopic: 'areas',
    difficulty: 1,
    skills: ['H8', 'H12'],
    stem: [
      {
        kind: 'p',
        text: 'Na oficina de pipas de Dona Marta, o papel é recortado em forma de paralelogramo, com base de 14 cm e altura de 9 cm, medida perpendicularmente à base. O lado inclinado da peça mede 10 cm.',
      },
    ],
    ask: 'Qual é a área do papel de uma peça?',
    alternatives: alts('126 cm²', '90 cm²', '63 cm²', '140 cm²', '48 cm²'),
    answer: 'A',
    hints: [
      'No paralelogramo, a área usa a altura (perpendicular à base), e não a medida do lado inclinado.',
      'Área do paralelogramo = base × altura.',
    ],
    solution: [
      'Área = base × altura = 14 × 9 = 126 cm².',
      'Armadilhas: 90 cm² (9 × 10) e 140 cm² (14 × 10) usam o lado inclinado no lugar de um dos dados corretos; 63 cm² divide por 2, como se fosse um triângulo; 48 cm² é o perímetro da peça (2 × (14 + 10)).',
    ],
    concept:
      'A área de um paralelogramo é base × altura. O lado inclinado só serve para o perímetro: a altura é sempre medida em ângulo reto com a base.',
    estimatedSeconds: 45,
    source: AUTORAL,
    verify: () => 14 * 9,
  },
  {
    id: 'GEO-104',
    topic: 'geo-plana',
    subtopic: 'areas',
    difficulty: 2,
    skills: ['H8', 'H12'],
    stem: [
      {
        kind: 'p',
        text: 'A lateral de uma pérgola de jardim tem a forma de um trapézio. As bases paralelas medem 10 m e 6 m, e a distância entre elas (a altura) é de 4 m. Essa lateral será toda revestida com ripas de madeira.',
      },
    ],
    ask: 'Qual é a área a ser revestida?',
    alternatives: alts('24 m²', '40 m²', '32 m²', '64 m²', '16 m²'),
    answer: 'C',
    hints: [
      'A área do trapézio é a média das bases multiplicada pela altura.',
      'Some as bases (10 + 6), divida por 2 e multiplique por 4.',
    ],
    solution: [
      'Área = (B + b) × h ÷ 2 = (10 + 6) × 4 ÷ 2 = 64 ÷ 2 = 32 m².',
      'Armadilhas: 24 m² (6 × 4) e 40 m² (10 × 4) usam só uma das bases; 64 m² esquece de dividir por 2; 16 m² é apenas a soma das bases.',
    ],
    concept: 'Área do trapézio = (base maior + base menor) × altura ÷ 2: é a altura multiplicada pela média das bases.',
    estimatedSeconds: 55,
    source: AUTORAL,
    verify: () => ((10 + 6) * 4) / 2,
  },
  {
    id: 'GEO-105',
    topic: 'geo-plana',
    subtopic: 'areas',
    difficulty: 2,
    skills: ['H8', 'H12'],
    stem: [
      {
        kind: 'p',
        text: 'Uma pipa tem o formato de um losango cuja armação é feita por duas varetas perpendiculares, uma de 24 cm e outra de 10 cm; cada vareta vai de um vértice ao vértice oposto. A pipa será coberta com papel de seda, sem sobreposição.',
      },
    ],
    ask: 'Qual é a área do papel de seda usado na cobertura?',
    alternatives: alts('240 cm²', '68 cm²', '34 cm²', '60 cm²', '120 cm²'),
    answer: 'E',
    hints: [
      'As varetas são as diagonais do losango. A área do losango se calcula a partir delas.',
      'Área do losango = (diagonal maior × diagonal menor) ÷ 2.',
    ],
    solution: [
      'Área = (D × d) ÷ 2 = (24 × 10) ÷ 2 = 240 ÷ 2 = 120 cm².',
      'Armadilhas: 240 cm² é o produto das diagonais sem dividir por 2 (área do retângulo que contém o losango); 68 cm² é o dobro da soma das varetas; 34 cm² é a soma delas; 60 cm² divide por 4.',
    ],
    concept: 'A área de um losango é metade do produto das suas diagonais: ele ocupa exatamente metade do retângulo formado pelas diagonais.',
    estimatedSeconds: 50,
    source: AUTORAL,
    verify: () => (24 * 10) / 2,
  },
  {
    id: 'GEO-106',
    topic: 'geo-plana',
    subtopic: 'areas',
    difficulty: 2,
    skills: ['H8', 'H12'],
    stem: [
      {
        kind: 'p',
        text: 'A sala de estar de uma casa em Londrina é retangular, com 6 m de comprimento por 4,5 m de largura. O piso será todo coberto com placas cerâmicas quadradas de 30 cm de lado. No cálculo, desconsidere sobras, cortes e perdas.',
      },
    ],
    ask: 'Quantas placas cerâmicas serão necessárias?',
    alternatives: alts('90 placas', '300 placas', '900 placas', '270 placas', '3.000 placas'),
    answer: 'B',
    hints: [
      'Compare a área da sala com a área de uma placa — e use a mesma unidade para as duas.',
      'Uma placa de 30 cm de lado tem 0,3 m de lado, logo 0,3 × 0,3 = 0,09 m² de área.',
    ],
    solution: [
      'Área da sala: 6 × 4,5 = 27 m².',
      'Área de uma placa: 0,3 × 0,3 = 0,09 m².',
      'Número de placas: 27 ÷ 0,09 = 300.',
      'Armadilhas: 90 placas surge ao dividir 27 m² por 0,3 (o lado da placa, em vez da área); 900 e 3.000 vêm de erros de casa decimal na conversão; 270 placas é 27 × 10, sem converter a unidade.',
    ],
    concept:
      'Para cobrir uma superfície com peças iguais, divide-se a área da superfície pela área de uma peça, sempre na mesma unidade. Lado em cm não pode ser dividido diretamente em área em m².',
    estimatedSeconds: 80,
    source: AUTORAL,
    verify: () => (6 * 4.5) / (0.3 * 0.3),
    tolerance: 0.0001,
  },
  {
    id: 'GEO-107',
    topic: 'geo-plana',
    subtopic: 'areas',
    difficulty: 2,
    skills: ['H8', 'H12'],
    stem: [
      {
        kind: 'p',
        text: 'Uma quadra de bocha é retangular e tem 64 m de perímetro. O comprimento da quadra é o triplo da sua largura.',
      },
    ],
    ask: 'Qual é a área dessa quadra?',
    alternatives: alts('256 m²', '96 m²', '384 m²', '192 m²', '144 m²'),
    answer: 'D',
    hints: [
      'Chame a largura de x: o comprimento será 3x. Escreva o perímetro em função de x.',
      'Perímetro = 2 × (x + 3x) = 8x. Descubra x e depois calcule a área.',
    ],
    solution: [
      'Perímetro: 2 × (x + 3x) = 8x = 64, logo x = 8 m (largura) e o comprimento é 3 × 8 = 24 m.',
      'Área = 8 × 24 = 192 m².',
      'Armadilhas: 256 m² seria a área de um quadrado de 16 m de lado (64 ÷ 4); 96 m² é 8 × 12 (comprimento "dobrado", e não triplicado); 384 m² usa 16 × 24; 144 m² é 6 × 24.',
    ],
    concept:
      'Quando o enunciado dá o perímetro e uma relação entre os lados, escreve-se o perímetro com uma única incógnita, descobre-se cada lado e só então se calcula a área.',
    estimatedSeconds: 85,
    source: AUTORAL,
    verify: () => {
      const x = 64 / 8;
      return x * 3 * x;
    },
  },
  {
    id: 'GEO-108',
    topic: 'geo-plana',
    subtopic: 'areas',
    difficulty: 2,
    skills: ['H8', 'H12'],
    stem: [
      {
        kind: 'p',
        text: 'Uma vidraçaria vende vidro temperado a R$ 120,00 o metro quadrado. Um cliente encomendou o tampo retangular de uma mesa, com 90 cm por 1,5 m. O preço é proporcional à área do vidro.',
      },
    ],
    ask: 'Quanto o cliente vai pagar pelo tampo?',
    alternatives: alts('R$ 162,00', 'R$ 288,00', 'R$ 108,00', 'R$ 16.200,00', 'R$ 135,00'),
    answer: 'A',
    hints: [
      'O preço é por metro quadrado: converta as duas medidas para metros antes de calcular a área.',
      '90 cm = 0,9 m. Multiplique 0,9 por 1,5 e depois pelo preço do metro quadrado.',
    ],
    solution: [
      'Área do tampo: 0,9 × 1,5 = 1,35 m².',
      'Preço: 1,35 × 120 = R$ 162,00.',
      'Armadilhas: R$ 288,00 usa o perímetro (2 × (0,9 + 1,5) × 120); R$ 108,00 usa só a largura (0,9 × 120); R$ 16.200,00 multiplica 90 × 1,5 × 120 sem converter cm em m; R$ 135,00 confunde a área em cm × m com o valor em reais.',
    ],
    concept:
      'Custo por unidade de área = área × preço do m². Antes de multiplicar, as medidas precisam estar na unidade do preço (aqui, o metro).',
    estimatedSeconds: 70,
    source: AUTORAL,
    verify: () => 0.9 * 1.5 * 120,
    tolerance: 0.001,
  },
  {
    id: 'GEO-109',
    topic: 'geo-plana',
    subtopic: 'areas',
    difficulty: 2,
    skills: ['H8', 'H12'],
    stem: [
      {
        kind: 'p',
        text: 'Um terreno tem a forma de um trapézio: a frente mede 30 m, o fundo mede 18 m, e a distância entre essas duas laterais paralelas é de 12 m. Na região, o metro quadrado de terreno custa R$ 150,00.',
      },
    ],
    ask: 'Qual é o valor desse terreno?',
    alternatives: alts('R$ 86.400,00', 'R$ 54.000,00', 'R$ 43.200,00', 'R$ 32.400,00', 'R$ 4.320,00'),
    answer: 'C',
    hints: [
      'Primeiro calcule a área do trapézio; depois multiplique pelo preço do metro quadrado.',
      'Área = (30 + 18) × 12 ÷ 2.',
    ],
    solution: [
      'Área = (30 + 18) × 12 ÷ 2 = 48 × 6 = 288 m².',
      'Valor = 288 × 150 = R$ 43.200,00.',
      'Armadilhas: R$ 86.400,00 esquece a divisão por 2 (576 m²); R$ 54.000,00 usa só a frente (30 × 12 = 360 m²); R$ 32.400,00 usa só o fundo (18 × 12 = 216 m²); R$ 4.320,00 erra uma casa decimal.',
    ],
    concept: 'A área do trapézio usa a média das bases. Problemas de custo pedem sempre dois passos: calcular a área e multiplicar pelo preço da unidade.',
    estimatedSeconds: 80,
    source: AUTORAL,
    verify: () => (((30 + 18) * 12) / 2) * 150,
  },
  {
    id: 'GEO-110',
    topic: 'geo-plana',
    subtopic: 'areas',
    difficulty: 3,
    skills: ['H8', 'H12', 'H14'],
    stem: [
      {
        kind: 'p',
        text: 'A prefeitura de uma cidade do interior vai reformar uma praça quadrada, ampliando em 20% a medida do lado, nos quatro lados, mantendo a forma de quadrado.',
      },
    ],
    ask: 'Em quantos por cento a área da praça vai aumentar?',
    alternatives: alts('20%', '40%', '24%', '4%', '44%'),
    answer: 'E',
    hints: [
      'Aumentar o lado em 20% é multiplicá-lo por 1,2. A área depende do quadrado do lado.',
      'Se o lado inicial é L, o novo lado é 1,2 L e a nova área é (1,2 L)².',
    ],
    solution: [
      'Área inicial: L². Novo lado: 1,2 L; nova área: (1,2 L)² = 1,44 L².',
      'A área passa a valer 144% da inicial: aumento de 44%.',
      'Armadilhas: 20% é o aumento do lado, e não o da área; 40% soma 20% + 20% sem considerar que a área é produto de dois lados; 24% e 4% vêm de contas parciais (20% × 20% = 4%).',
    ],
    concept:
      'Ao multiplicar o lado de um quadrado por k, a área fica multiplicada por k². Variações percentuais de comprimento e de área não coincidem.',
    estimatedSeconds: 90,
    source: AUTORAL,
    verify: () => (1.2 * 1.2 - 1) * 100,
    tolerance: 0.001,
  },
  {
    id: 'GEO-111',
    topic: 'geo-plana',
    subtopic: 'areas',
    difficulty: 3,
    skills: ['H8', 'H12'],
    stem: [
      {
        kind: 'p',
        text: 'Dona Lúcia tem 36 m de tela para cercar uma horta retangular. Ela vai usar toda a tela e quer que os dois lados da horta tenham medidas inteiras, em metros.',
      },
    ],
    ask: 'Qual é a maior área, em m², que a horta pode ter?',
    alternatives: alts('72 m²', '81 m²', '77 m²', '80 m²', '90 m²'),
    answer: 'B',
    hints: [
      'Com 36 m de tela, a soma de dois lados vizinhos (comprimento + largura) é sempre 18 m. Teste algumas combinações.',
      'Quanto mais parecidos forem os dois lados, maior fica a área: compare 8 × 10 com 9 × 9.',
    ],
    solution: [
      'Perímetro 36 m ⇒ comprimento + largura = 18 m.',
      'Possibilidades: 6 × 12 = 72; 7 × 11 = 77; 8 × 10 = 80; 9 × 9 = 81.',
      'A maior área é a do quadrado de 9 m de lado: 81 m².',
      'Armadilhas: 90 m² não é obtido com nenhum par de lados inteiros de soma 18; 80 m² é o retângulo 8 × 10, que ainda não é o mais "quadrado" possível.',
    ],
    concept: 'Entre todos os retângulos de mesmo perímetro, o de maior área é o quadrado: a área cresce à medida que os lados se aproximam.',
    estimatedSeconds: 100,
    source: AUTORAL,
    verify: () => Math.max(...Array.from({ length: 17 }, (_, i) => (i + 1) * (17 - i))),
  },
  {
    id: 'GEO-112',
    topic: 'geo-plana',
    subtopic: 'areas',
    difficulty: 3,
    skills: ['H8', 'H11', 'H12'],
    stem: [
      {
        kind: 'p',
        text: 'Na planta de uma casa, desenhada na escala de 1 : 200, a sala é um retângulo de 3 cm por 2,5 cm. A construtora precisa saber quanto de piso comprar para a sala real.',
      },
    ],
    ask: 'Qual é a área real da sala, em m²?',
    alternatives: alts('7,5 m²', '1.500 m²', '300 m²', '30 m²', '0,75 m²'),
    answer: 'D',
    hints: [
      'A escala 1 : 200 vale para comprimentos: 1 cm na planta corresponde a 200 cm no terreno. Converta os lados antes de calcular a área.',
      '3 cm na planta são 600 cm = 6 m. Faça o mesmo com 2,5 cm.',
    ],
    solution: [
      'Lados reais: 3 × 200 = 600 cm = 6 m e 2,5 × 200 = 500 cm = 5 m.',
      'Área real: 6 × 5 = 30 m².',
      'Armadilhas: 7,5 m² é a área desenhada (3 × 2,5 = 7,5 cm²) lida como se fosse real; 1.500 m² multiplica a área do desenho por 200 (a escala é de comprimento, e não de área); 300 m² erra uma casa decimal na conversão; 0,75 m² confunde cm² com m².',
    ],
    concept:
      'Uma escala 1 : k relaciona comprimentos. A área real é k² vezes a área do desenho — por isso o mais seguro é converter os lados e só depois calcular a área.',
    estimatedSeconds: 100,
    source: AUTORAL,
    verify: () => ((3 * 200) / 100) * ((2.5 * 200) / 100),
  },
]);
