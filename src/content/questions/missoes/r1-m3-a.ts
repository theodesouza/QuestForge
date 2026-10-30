import { AUTORAL, alts, batch } from '../_helpers';

/** Missão r1-m3 — questões extras para repetição (lote a). Questões autorais. */
export const MISSAO_R1M3_A = batch([
  {
    id: 'PCT-101',
    topic: 'porcentagem',
    subtopic: 'porcentagem-basica',
    difficulty: 1,
    skills: ['H3'],
    stem: [
      {
        kind: 'p',
        text: 'Márcia é corretora de imóveis em Belo Horizonte e recebe 6% de comissão sobre o valor de cada imóvel que vende. Neste mês, ela intermediou a venda de um apartamento por R$ 285.000,00.',
      },
    ],
    ask: 'Qual foi o valor da comissão de Márcia nessa venda?',
    alternatives: alts('R$ 1.710,00', 'R$ 17.100,00', 'R$ 2.850,00', 'R$ 47.500,00', 'R$ 267.900,00'),
    answer: 'B',
    hints: [
      '6% significa 6 partes de cada 100 partes do valor da venda.',
      'Escreva 6% na forma decimal e multiplique pelo valor do apartamento.',
    ],
    solution: [
      { explanation: 'Desenvolva a conta na ordem indicada.', calculation: ['6% = 6/100', '= 0,06'] },
      { explanation: 'Comissão.', calculation: ['0,06 × 285.000 = R$ 17.100,00'] },
      { explanation: 'Conferência pelo atalho do 1%.', calculation: ['1% de 285.000 é 2.850', '6 × 2.850 = 17.100'] },
      'Armadilha: R$ 2.850,00 é só 1% do valor; R$ 267.900,00 é o que sobra da venda depois de descontada a comissão.',
    ],
    concept:
      'Calcular p% de um valor é multiplicar o valor por p/100. Um atalho útil: ache 1% do valor (dividindo por 100) e multiplique o resultado por p.',
    estimatedSeconds: 35,
    source: AUTORAL,
    verify: () => (285000 * 6) / 100,
  },
  {
    id: 'PCT-102',
    topic: 'porcentagem',
    subtopic: 'porcentagem-basica',
    difficulty: 1,
    skills: ['H3'],
    stem: [
      {
        kind: 'p',
        text: 'Em uma cidade do interior paulista, a tarifa de esgoto cobrada pela companhia de saneamento corresponde a 80% do valor da água consumida. Em março, a parte da conta referente à água de uma residência foi de R$ 85,00.',
      },
    ],
    ask: 'Qual foi o valor total da conta dessa residência em março, somando água e esgoto?',
    alternatives: alts('R$ 68,00', 'R$ 165,00', 'R$ 91,80', 'R$ 106,25', 'R$ 153,00'),
    answer: 'E',
    hints: [
      'O valor do esgoto é uma porcentagem do valor da água e deve ser somado a ele para formar o total da conta.',
      'Comece calculando 80% de R$ 85,00, que é o valor cobrado pelo esgoto.',
    ],
    solution: [
      { explanation: 'Esgoto.', calculation: ['0,80 × 85 = R$ 68,00'] },
      { explanation: 'Total da conta.', calculation: ['85 + 68 = R$ 153,00'] },
      'Atalho: a conta corresponde a 100% (água) + 80% (esgoto) = 180% do valor da água, e 1,80 × 85 = 153.',
      'Armadilha: somar 80 reais em vez de 80% (85 + 80 = R$ 165,00) confunde porcentagem com valor em reais.',
      'Armadilha: R$ 68,00 é só a parte do esgoto; a pergunta pede o total da conta.',
    ],
    concept:
      'Acrescentar p% a um valor equivale a multiplicá-lo por (1 + p/100). Aqui, água mais esgoto é 180% do valor da água, ou seja, o fator é 1,80.',
    estimatedSeconds: 40,
    source: AUTORAL,
    verify: () => 85 + (85 * 80) / 100,
  },
  {
    id: 'PCT-103',
    topic: 'porcentagem',
    subtopic: 'porcentagem-basica',
    difficulty: 2,
    skills: ['H3', 'H25'],
    stem: [
      {
        kind: 'p',
        text: 'A embalagem de um cereal matinal integral traz a tabela de informação nutricional a seguir.',
      },
      {
        kind: 'table',
        header: ['Componente', 'Porção de 30 g', '%VD*'],
        rows: [
          ['Valor energético', '114 kcal', '6%'],
          ['Carboidratos', '24 g', '8%'],
          ['Proteínas', '3 g', '6%'],
          ['Fibras alimentares', '6 g', '24%'],
          ['Sódio', '100 mg', '5%'],
        ],
        caption: '*%VD: percentual do valor diário de referência, com base em uma dieta de 2.000 kcal.',
      },
      {
        kind: 'p',
        text: 'Considere que o %VD de cada componente é diretamente proporcional à quantidade de cereal consumida.',
      },
    ],
    ask: 'Quantos gramas desse cereal uma pessoa precisaria consumir para obter, apenas com ele, 100% do valor diário de referência de fibras alimentares?',
    alternatives: alts('125 g', '25 g', '120 g', '7,2 g', '150 g'),
    answer: 'A',
    hints: [
      'Na tabela, 30 g de cereal fornecem 24% do valor diário de fibras. A quantidade de cereal e o %VD crescem na mesma proporção.',
      'Monte uma regra de três: 30 g de cereal estão para 24% assim como x gramas de cereal estão para 100%.',
    ],
    solution: [
      '30 g de cereal → 24% do VD de fibras.',
      'x g de cereal → 100% do VD de fibras.',
      { explanation: 'Desenvolva a conta na ordem indicada.', calculation: ['x = 30 × 100 ÷ 24', '= 3.000 ÷ 24', '= 125 g'] },
      'Conferência: o VD de fibras é 6 ÷ 0,24 = 25 g, e 125 g de cereal contêm 6 × 125 ÷ 30 = 25 g de fibras.',
      'Armadilha: 25 g é o valor diário de fibras, e não a quantidade de cereal; arredondar para 4 ou 5 porções inteiras (120 g ou 150 g) não dá exatamente 100%.',
    ],
    concept:
      'O percentual do valor diário (%VD) é proporcional à quantidade consumida. Com uma regra de três entre a porção e seu percentual, encontra-se a quantidade que corresponde a 100%.',
    estimatedSeconds: 90,
    source: AUTORAL,
    verify: () => (30 * 100) / 24,
  },
  {
    id: 'PCT-104',
    topic: 'porcentagem',
    subtopic: 'porcentagem-basica',
    difficulty: 4,
    skills: ['H3', 'H4'],
    stem: [
      {
        kind: 'p',
        text: 'Uma agroindústria familiar do sul de Minas Gerais produz tomate semisseco. Em um lote, foram usados 240 kg de tomates frescos, cuja massa é composta de 95% de água.',
      },
      {
        kind: 'p',
        text: 'Durante a secagem, os tomates perdem somente água. Ao final do processo, a água passou a representar 60% da massa do produto.',
      },
    ],
    ask: 'Qual é a massa de tomate semisseco obtida nesse lote?',
    alternatives: alts('156 kg', '18 kg', '30 kg', '144 kg', '12 kg'),
    answer: 'C',
    hints: [
      'Na secagem, a massa de água diminui, mas a massa da parte que não é água permanece a mesma.',
      'Comece calculando quantos quilogramas, dos 240 kg de tomates frescos, não são água.',
    ],
    solution: [
      { explanation: 'Parte que não é água, no início.', calculation: ['100% − 95% = 5% de 240 kg', '= 0,05 × 240', '= 12 kg'] },
      'Essa massa não muda na secagem. No produto final, ela corresponde a 100% − 60% = 40% da massa.',
      { explanation: 'Desenvolva a conta na ordem indicada.', calculation: ['0,40 × M = 12', 'M = 12 ÷ 0,40', '= 30 kg'] },
      'Conferência: 30 kg de produto têm 18 kg de água (60%) e 12 kg de parte sólida (40%).',
      'Armadilha: tirar 35 pontos percentuais da massa (240 × 0,65 = 156 kg) aplica as porcentagens como se tivessem a mesma base, mas 95% e 60% se referem a massas totais diferentes.',
    ],
    concept:
      'Quando o todo muda, a mesma porcentagem passa a se referir a uma nova base. Encontre a parte que não se altera (aqui, a massa que não é água) e use-a como ponte entre a situação inicial e a final.',
    estimatedSeconds: 150,
    source: AUTORAL,
    verify: () => (240 * (100 - 95)) / (100 - 60),
  },
  {
    id: 'PCT-105',
    topic: 'porcentagem',
    subtopic: 'variacao-percentual',
    difficulty: 2,
    skills: ['H3', 'H25'],
    stem: [
      {
        kind: 'p',
        text: 'Uma corrida de rua de 5 km é realizada todos os anos em Fortaleza. O gráfico mostra o número de inscritos nas quatro últimas edições.',
      },
      {
        kind: 'bars',
        title: 'Inscritos na corrida de rua',
        unit: 'inscritos',
        data: [
          { label: '2021', value: 1800 },
          { label: '2022', value: 2500 },
          { label: '2023', value: 2900 },
          { label: '2024', value: 3400 },
        ],
      },
    ],
    ask: 'O aumento percentual do número de inscritos de 2022 para 2024 foi de',
    alternatives: alts('16%', '26,5%', '33,2%', '136%', '36%'),
    answer: 'E',
    hints: [
      'A variação percentual compara o aumento com o valor do ano tomado como referência, que é o ano inicial do período pedido.',
      'Leia no gráfico os valores de 2022 e de 2024 e calcule a diferença entre eles.',
    ],
    solution: [
      '2022: 2.500 inscritos; 2024: 3.400 inscritos.',
      'Aumento absoluto: 3.400 − 2.500 = 900 inscritos.',
      { explanation: 'Aumento percentual.', calculation: ['900 ÷ 2.500 = 0,36', '= 36%'] },
      'Armadilha: somar as variações anuais (16% de 2022 para 2023 e cerca de 17,2% de 2023 para 2024) dá cerca de 33,2%, mas cada variação anual é calculada sobre uma base diferente.',
      'Armadilha: dividir 900 pelo valor final (3.400) dá cerca de 26,5%, comparando o aumento com a base errada.',
    ],
    concept:
      'Variação percentual = (valor final − valor inicial) ÷ valor inicial. Variações de períodos seguidos não se somam, porque cada uma tem como base o valor do início do seu próprio período.',
    estimatedSeconds: 75,
    source: AUTORAL,
    verify: () => ((3400 - 2500) * 100) / 2500,
  },
  {
    id: 'PCT-106',
    topic: 'porcentagem',
    subtopic: 'variacao-percentual',
    difficulty: 3,
    skills: ['H3', 'H17'],
    stem: [
      {
        kind: 'p',
        text: 'Um supermercado de Curitiba vendia certa marca de café em pacotes de 500 g, por R$ 18,00 cada. Algum tempo depois, o fabricante substituiu essa embalagem por pacotes de 400 g do mesmo café, que passaram a ser vendidos por R$ 16,20 cada.',
      },
      {
        kind: 'p',
        text: 'Um cliente notou que, embora o preço do pacote tivesse diminuído, o café havia ficado mais caro.',
      },
    ],
    ask: 'Considerando o preço por quilograma desse café, o aumento percentual foi de',
    alternatives: alts('10%', '25%', '11,1%', '12,5%', '112,5%'),
    answer: 'D',
    hints: [
      'Para comparar pacotes de tamanhos diferentes, calcule o preço de uma mesma quantidade de café em cada situação.',
      'Comece calculando o preço de 1 kg de café quando vendido no pacote de 500 g e quando vendido no pacote de 400 g.',
    ],
    solution: [
      'Antes: R$ 18,00 por 0,5 kg ⇒ 18 ÷ 0,5 = R$ 36,00 por quilograma.',
      'Depois: R$ 16,20 por 0,4 kg ⇒ 16,20 ÷ 0,4 = R$ 40,50 por quilograma.',
      'Aumento: 40,50 − 36,00 = R$ 4,50 por quilograma.',
      { explanation: 'Aumento percentual.', calculation: ['4,50 ÷ 36,00 = 0,125', '= 12,5%'] },
      'Em fatores: o preço do pacote foi multiplicado por 0,90 e a quantidade por 0,80; o preço por quilograma foi multiplicado por 0,90 ÷ 0,80 = 1,125.',
      'Armadilha: subtrair as variações (a quantidade caiu 20% e o preço caiu 10%, "logo subiu 10%") não funciona, pois porcentagens de grandezas diferentes não podem ser somadas nem subtraídas.',
      'Armadilha: dividir o aumento pelo preço novo (4,50 ÷ 40,50 ≈ 11,1%) compara a variação com a base errada; a referência é o preço por quilograma de antes.',
    ],
    concept:
      'Quando a embalagem muda de tamanho, compare o preço por unidade de medida (preço ÷ quantidade). A variação percentual desse preço unitário mostra se o produto ficou mais caro ou mais barato.',
    estimatedSeconds: 120,
    source: AUTORAL,
    verify: () => {
      const antes = (18 * 1000) / 500;
      const depois = (16.2 * 1000) / 400;
      return ((depois - antes) * 100) / antes;
    },
  },
  {
    id: 'PCT-107',
    topic: 'porcentagem',
    subtopic: 'variacao-percentual',
    difficulty: 2,
    skills: ['H3', 'H10'],
    stem: [
      {
        kind: 'p',
        text: 'Antes da inauguração de uma nova estação de metrô em Salvador, Juliana levava 1 h 15 min para ir de casa ao trabalho de ônibus. Com o metrô, o mesmo trajeto passou a levar 45 min.',
      },
    ],
    ask: 'Em relação ao tempo anterior, a redução percentual no tempo de viagem de Juliana foi de',
    alternatives: alts('60%', '40%', '66,7%', '34,8%', '30%'),
    answer: 'B',
    hints: [
      'Para comparar os dois tempos, escreva-os na mesma unidade; depois, compare a redução com o tempo de antes.',
      'Comece convertendo 1 h 15 min em minutos.',
    ],
    solution: [
      { explanation: 'Desenvolva a conta na ordem indicada.', calculation: ['1 h 15 min = 60 min + 15 min', '= 75 min'] },
      { explanation: 'Redução.', calculation: ['75 − 45 = 30 min'] },
      { explanation: 'Redução percentual.', calculation: ['30 ÷ 75 = 0,4', '= 40%'] },
      'Armadilha: escrever 1 h 15 min como 1,15 h está errado, pois 15 min = 15/60 h = 0,25 h; o correto é 1,25 h.',
      'Armadilha: 45 ÷ 75 = 0,6 = 60% é a fração do tempo que restou, e não a redução.',
    ],
    concept:
      'Para calcular uma variação percentual, as duas medidas precisam estar na mesma unidade, e a variação é comparada com o valor inicial. Lembre que 1 h = 60 min: horas e minutos não seguem o sistema decimal.',
    estimatedSeconds: 60,
    source: AUTORAL,
    verify: () => {
      const antes = 1 * 60 + 15;
      const depois = 45;
      return ((antes - depois) * 100) / antes;
    },
  },
  {
    id: 'PCT-108',
    topic: 'porcentagem',
    subtopic: 'aumentos-sucessivos',
    difficulty: 2,
    skills: ['H3', 'H4'],
    stem: [
      {
        kind: 'p',
        text: 'Na Black Friday, uma loja de eletrônicos anunciou 20% de desconto em uma smart TV que custava R$ 2.400,00. Para pagamento via Pix, a loja concedia ainda um desconto adicional de 5%, calculado sobre o preço já com o primeiro desconto.',
      },
    ],
    ask: 'Quanto pagou pela TV um cliente que aproveitou os dois descontos?',
    alternatives: alts('R$ 1.824,00', 'R$ 1.800,00', 'R$ 1.920,00', 'R$ 2.280,00', 'R$ 576,00'),
    answer: 'A',
    hints: [
      'O desconto do Pix não é calculado sobre o preço original, mas sobre o preço que já tem o primeiro desconto.',
      'Comece calculando o preço da TV com o desconto de 20%.',
    ],
    solution: [
      { explanation: 'Com 20% de desconto.', calculation: ['2.400 × 0,80 = R$ 1.920,00'] },
      { explanation: 'Com mais 5% no Pix.', calculation: ['1.920 × 0,95 = R$ 1.824,00'] },
      'Em fatores: 0,80 × 0,95 = 0,76; o cliente paga 76% do preço original, o que corresponde a um desconto total de 24%, e não de 25%.',
      'Armadilha: somar os descontos (20% + 5% = 25%) daria R$ 1.800,00, mas o desconto do Pix incide sobre um valor menor que o original.',
    ],
    concept:
      'Descontos sucessivos se multiplicam: o preço final é P × (1 − d₁) × (1 − d₂). Por isso, o desconto total é sempre menor que a soma dos descontos.',
    estimatedSeconds: 60,
    source: AUTORAL,
    verify: () => (2400 * (100 - 20) * (100 - 5)) / 10000,
  },
  {
    id: 'PCT-109',
    topic: 'porcentagem',
    subtopic: 'aumentos-sucessivos',
    difficulty: 4,
    skills: ['H3', 'H21'],
    stem: [
      {
        kind: 'p',
        text: 'Para liquidar o estoque da coleção de verão, uma loja de roupas de Florianópolis fez duas remarcações de preço. Em cada uma, aplicou o mesmo percentual de desconto sobre o preço vigente naquele momento.',
      },
      {
        kind: 'p',
        text: 'Com isso, uma bermuda que custava R$ 150,00 passou a ser vendida por R$ 96,00.',
      },
    ],
    ask: 'O percentual de desconto aplicado em cada remarcação foi de',
    alternatives: alts('18%', '36%', '20%', '80%', '64%'),
    answer: 'C',
    hints: [
      'Dois descontos sucessivos de mesma taxa d multiplicam o preço duas vezes pelo mesmo fator (1 − d).',
      'Comece calculando que fração do preço original representa o preço final, dividindo 96 por 150.',
    ],
    solution: [
      { explanation: 'Preço final ÷ preço inicial.', calculation: ['96 ÷ 150 = 0,64'] },
      { explanation: 'Com duas remarcações de taxa d.', calculation: ['(1 − d) × (1 − d) = (1 − d)²', '= 0,64'] },
      'Como 0,8 × 0,8 = 0,64, temos 1 − d = 0,8 e, portanto, d = 0,2 = 20%.',
      { explanation: 'Conferência.', calculation: ['150 × 0,8 = 120', '120 × 0,8 = 96'] },
      'Armadilha: o desconto total foi de 36% (54 ÷ 150), mas dividi-lo por 2 (18%) supõe que descontos sucessivos se somam; com 18% duas vezes, o preço final seria 150 × 0,82 × 0,82 = R$ 100,86.',
      'Armadilha: 0,8 é o fator pelo qual o preço é multiplicado (o cliente paga 80% do preço vigente), e não o desconto; da mesma forma, 0,64 é a fração do preço original que restou.',
    ],
    concept:
      'Em n descontos sucessivos de mesma taxa d, o preço é multiplicado por (1 − d)ⁿ. Para descobrir d, divide-se o preço final pelo inicial e procura-se o número que, multiplicado por si mesmo n vezes, dá esse resultado: ele é o fator (1 − d).',
    estimatedSeconds: 150,
    source: AUTORAL,
    verify: () => (1 - Math.sqrt(96 / 150)) * 100,
  },
]);
