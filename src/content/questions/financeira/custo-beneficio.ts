import { AUTORAL, alts, batch } from '../_helpers';

/** Matemática financeira — preço unitário e custo-benefício (FIN-025 a FIN-029). Questões autorais. */
export const FIN_CUSTO_BENEFICIO = batch([
  {
    id: 'FIN-025',
    topic: 'financeira',
    subtopic: 'custo-beneficio',
    difficulty: 1,
    skills: ['H3', 'H16'],
    stem: [
      {
        kind: 'p',
        text: 'Em um supermercado, o mesmo arroz é vendido em pacotes de 1 kg, por R$ 6,20 cada, e em pacotes de 5 kg, por R$ 27,50 cada. Juliana precisa comprar 5 kg de arroz para o mês.',
      },
    ],
    ask: 'Se Juliana comprar um pacote de 5 kg, em vez de cinco pacotes de 1 kg, ela economizará',
    alternatives: alts('R$ 0,70', 'R$ 2,80', 'R$ 3,50', 'R$ 5,50', 'R$ 31,00'),
    answer: 'C',
    hints: [
      'Para comparar as duas opções, calcule quanto Juliana pagaria pela mesma quantidade de arroz (5 kg) em cada uma delas.',
      'Comece calculando o custo de cinco pacotes de 1 kg: 5 × R$ 6,20.',
    ],
    solution: [
      'Cinco pacotes de 1 kg custam 5 × 6,20 = R$ 31,00.',
      'Um pacote de 5 kg custa R$ 27,50.',
      'Economia: 31,00 − 27,50 = R$ 3,50.',
      'Conferindo pelo preço por quilo: 27,50 ÷ 5 = R$ 5,50 o quilo, isto é, R$ 0,70 a menos por quilo; em 5 kg, 5 × 0,70 = R$ 3,50.',
    ],
    concept:
      'Para comparar embalagens de tamanhos diferentes, calcula-se o preço unitário (preço ÷ quantidade) ou o custo da mesma quantidade total em cada opção.',
    estimatedSeconds: 40,
    source: AUTORAL,
    verify: () => 5 * 6.2 - 27.5,
  },
  {
    id: 'FIN-026',
    topic: 'financeira',
    subtopic: 'custo-beneficio',
    difficulty: 2,
    skills: ['H3', 'H18'],
    stem: [
      {
        kind: 'p',
        text: 'Kenji precisa comprar 6 pacotes de café de 500 g para o escritório onde trabalha e pesquisou o mesmo produto em dois mercados do bairro:',
      },
      {
        kind: 'table',
        header: ['Mercado', 'Preço do pacote', 'Promoção'],
        rows: [
          ['A', 'R$ 21,00', 'Leve 3, pague 2'],
          ['B', 'R$ 19,00', '25% de desconto em cada pacote'],
        ],
      },
      {
        kind: 'p',
        text: 'Ele vai comprar todos os pacotes em um único mercado: aquele em que o gasto total for menor.',
      },
    ],
    ask: 'Quanto Kenji gastará na compra dos 6 pacotes?',
    alternatives: alts('R$ 85,50', 'R$ 105,00', 'R$ 114,00', 'R$ 84,00', 'R$ 126,00'),
    answer: 'D',
    hints: [
      'Na promoção "leve 3, pague 2", a cada grupo de 3 pacotes levados, um deles sai de graça.',
      'Descubra quantos pacotes Kenji realmente paga no Mercado A ao levar 6 e calcule o preço de um pacote com 25% de desconto no Mercado B.',
    ],
    solution: [
      'Mercado A: 6 pacotes formam 2 grupos de 3; em cada grupo pagam-se 2 pacotes, logo Kenji paga 2 × 2 = 4 pacotes.',
      'Gasto no Mercado A: 4 × 21,00 = R$ 84,00.',
      'Mercado B: cada pacote sai por 19,00 × 0,75 = R$ 14,25.',
      'Gasto no Mercado B: 6 × 14,25 = R$ 85,50.',
      'O menor gasto é o do Mercado A: R$ 84,00.',
      'Observação: "leve 3, pague 2" equivale a um desconto de 1/3 ≈ 33,3%, mas só quando a quantidade comprada é múltipla de 3.',
    ],
    concept:
      'A promoção "leve 3, pague 2" equivale a um desconto de 1/3 em cada grupo de 3 unidades; para compará-la com um desconto percentual, calcula-se o gasto total (ou o preço efetivo por unidade) em cada opção.',
    estimatedSeconds: 90,
    source: AUTORAL,
    verify: () => Math.min((6 - 6 / 3) * 21, 6 * 19 * (1 - 0.25)),
  },
  {
    id: 'FIN-027',
    topic: 'financeira',
    subtopic: 'custo-beneficio',
    difficulty: 3,
    skills: ['H16', 'H18'],
    stem: [
      {
        kind: 'p',
        text: 'Para carros flex, uma regra prática afirma que o etanol só compensa quando o preço do litro de etanol é de, no máximo, 70% do preço do litro de gasolina. Isso porque, com etanol, o carro percorre cerca de 70% da distância que percorreria com a mesma quantidade de gasolina.',
      },
      {
        kind: 'p',
        text: 'Adriana tem um carro flex que faz 12 km por litro de gasolina e vai fazer uma viagem de 420 km. No posto onde ela vai abastecer, os preços são:',
      },
      {
        kind: 'table',
        header: ['Combustível', 'Preço do litro'],
        rows: [
          ['Gasolina', 'R$ 6,20'],
          ['Etanol', 'R$ 4,50'],
        ],
      },
      {
        kind: 'p',
        text: 'Considere que, com etanol, o rendimento do carro de Adriana é exatamente 70% do rendimento com gasolina.',
      },
    ],
    ask: 'Ao escolher o combustível mais vantajoso para essa viagem, Adriana economizará, em relação ao outro combustível,',
    alternatives: alts('R$ 1,70', 'R$ 59,50', 'R$ 5,60', 'R$ 225,00', 'R$ 8,00'),
    answer: 'E',
    hints: [
      'O etanol é mais barato por litro, mas rende menos quilômetros por litro; compare o gasto total para percorrer os 420 km com cada combustível.',
      'Calcule o rendimento com etanol (70% de 12 km/L) e quantos litros de cada combustível a viagem exige.',
    ],
    solution: [
      'Rendimento com etanol: 0,7 × 12 = 8,4 km/L.',
      'Gasolina: 420 ÷ 12 = 35 L, que custam 35 × 6,20 = R$ 217,00.',
      'Etanol: 420 ÷ 8,4 = 50 L, que custam 50 × 4,50 = R$ 225,00.',
      'A gasolina é mais vantajosa, com economia de 225,00 − 217,00 = R$ 8,00.',
      'Pela regra dos 70%: 0,7 × 6,20 = R$ 4,34; como o etanol custa R$ 4,50, acima desse limite, ele não compensa.',
      'Armadilha: supor o mesmo consumo (35 L) para os dois combustíveis leva a 35 × 1,70 = R$ 59,50 a favor do etanol, o que está errado.',
    ],
    concept:
      'O custo-benefício de um combustível depende do custo por quilômetro (preço do litro ÷ km por litro), e não só do preço do litro; como o etanol rende cerca de 70% da gasolina, ele só compensa se custar no máximo 70% do preço dela.',
    estimatedSeconds: 150,
    source: AUTORAL,
    verify: () => {
      const kmPorLitroGasolina = 12;
      const kmPorLitroEtanol = 0.7 * kmPorLitroGasolina;
      const distancia = 420;
      const gastoGasolina = (distancia / kmPorLitroGasolina) * 6.2;
      const gastoEtanol = (distancia / kmPorLitroEtanol) * 4.5;
      return Math.abs(gastoEtanol - gastoGasolina);
    },
  },
  {
    id: 'FIN-028',
    topic: 'financeira',
    subtopic: 'custo-beneficio',
    difficulty: 3,
    skills: ['H23', 'H25'],
    stem: [
      {
        kind: 'p',
        text: 'Luana vai contratar um plano de internet para o celular e está em dúvida entre duas opções de uma mesma operadora:',
      },
      {
        kind: 'table',
        header: ['Plano', 'Mensalidade', 'Franquia de internet', 'Cada GB adicional'],
        rows: [
          ['Básico', 'R$ 39,90', '8 GB', 'R$ 6,00'],
          ['Plus', 'R$ 59,90', '15 GB', 'R$ 4,00'],
        ],
      },
      {
        kind: 'p',
        text: 'Em ambos os planos, cada gigabyte (GB) consumido além da franquia é cobrado à parte, pelo valor indicado na tabela. Considere que o consumo mensal é sempre um número inteiro de gigabytes.',
      },
    ],
    ask: 'O menor consumo mensal a partir do qual o plano Plus passa a ser mais barato que o Básico é de',
    alternatives: alts('12 GB', '11 GB', '4 GB', '13 GB', '15 GB'),
    answer: 'A',
    hints: [
      'Até 15 GB, a mensalidade do Plus não muda; já no Básico, cada GB acima de 8 GB encarece a conta.',
      'Calcule quanto o Básico pode cobrar em GB adicionais antes de alcançar a mensalidade do Plus: 59,90 − 39,90.',
    ],
    solution: [
      'Diferença entre as mensalidades: 59,90 − 39,90 = R$ 20,00.',
      'No Básico, cada GB acima de 8 GB custa R$ 6,00; os custos se igualariam com 20 ÷ 6 ≈ 3,33 GB adicionais.',
      'Com 11 GB (3 adicionais), o Básico custa 39,90 + 3 × 6,00 = R$ 57,90, ainda mais barato que o Plus.',
      'Com 12 GB (4 adicionais), o Básico custa 39,90 + 4 × 6,00 = R$ 63,90, mais caro que o Plus (R$ 59,90).',
      'Acima de 15 GB, o Básico continua mais caro, pois cada GB extra custa R$ 6,00 nele e apenas R$ 4,00 no Plus. Logo, a resposta é 12 GB.',
    ],
    concept:
      'Para comparar planos com mensalidade fixa e cobrança por excedente, escreve-se o custo de cada um em função do consumo e procura-se o ponto em que um passa a superar o outro; com consumo inteiro, toma-se o primeiro inteiro que satisfaz a desigualdade.',
    estimatedSeconds: 150,
    source: AUTORAL,
    verify: () => {
      const basico = (gb: number) => 39.9 + 6 * Math.max(0, gb - 8);
      const plus = (gb: number) => 59.9 + 4 * Math.max(0, gb - 15);
      let gb = 0;
      while (plus(gb) >= basico(gb)) gb++;
      return gb;
    },
  },
  {
    id: 'FIN-029',
    topic: 'financeira',
    subtopic: 'custo-beneficio',
    difficulty: 4,
    skills: ['H3', 'H24', 'H25'],
    stem: [
      {
        kind: 'p',
        text: 'A companhia de saneamento de uma cidade cobra a água consumida nas residências por faixas de consumo, conforme a tabela.',
      },
      {
        kind: 'table',
        header: ['Faixa de consumo mensal', 'Preço por m³'],
        rows: [
          ['Primeiros 10 m³', 'R$ 4,50'],
          ['Do 11º ao 20º m³', 'R$ 7,20'],
          ['Do 21º ao 30º m³', 'R$ 11,40'],
          ['Acima de 30 m³', 'R$ 13,80'],
        ],
      },
      {
        kind: 'p',
        text: 'Cada faixa é cobrada separadamente: quem consome 15 m³, por exemplo, paga 10 m³ pelo preço da primeira faixa e 5 m³ pelo preço da segunda.',
      },
      {
        kind: 'p',
        text: 'Depois de consertar um vazamento e adotar hábitos de economia, a família de Marta reduziu o consumo mensal de água de 28 m³ para 18 m³.',
      },
    ],
    ask: 'Em relação à conta anterior, a redução percentual no valor da conta de água dessa família foi de',
    alternatives: alts('≈ 49%', '≈ 51%', '≈ 36%', '≈ 55%', '≈ 59%'),
    answer: 'B',
    hints: [
      'Na cobrança por faixas, cada parte do consumo paga o preço da sua própria faixa; por isso, o valor da conta não é proporcional ao consumo.',
      'Comece calculando a conta para 28 m³: 10 m³ na 1ª faixa, 10 m³ na 2ª e 8 m³ na 3ª.',
    ],
    solution: [
      'Conta com 28 m³: 10 × 4,50 + 10 × 7,20 + 8 × 11,40 = 45,00 + 72,00 + 91,20 = R$ 208,20.',
      'Conta com 18 m³: 10 × 4,50 + 8 × 7,20 = 45,00 + 57,60 = R$ 102,60.',
      'Redução no valor: 208,20 − 102,60 = R$ 105,60.',
      'Redução percentual em relação à conta original: 105,60 ÷ 208,20 ≈ 0,507 ≈ 51%.',
      'Armadilhas: o consumo caiu só 10 ÷ 28 ≈ 36%, mas a conta caiu mais porque os metros cúbicos economizados eram os mais caros; e 102,60 ÷ 208,20 ≈ 49% é a fração da conta que ainda se paga, não a redução.',
    ],
    concept:
      'Na tarifa progressiva por faixas, cada parcela do consumo é cobrada pelo preço da sua faixa; por isso, cortar o consumo que está nas faixas mais caras reduz a conta, em porcentagem, mais do que o próprio consumo.',
    estimatedSeconds: 240,
    source: AUTORAL,
    verify: () => {
      const faixa = (m3: number, de: number, ate: number) => Math.min(Math.max(m3 - de, 0), ate - de);
      const conta = (m3: number) =>
        faixa(m3, 0, 10) * 4.5 + faixa(m3, 10, 20) * 7.2 + faixa(m3, 20, 30) * 11.4 + Math.max(m3 - 30, 0) * 13.8;
      return ((conta(28) - conta(18)) / conta(28)) * 100;
    },
    tolerance: 0.5,
  },
]);
