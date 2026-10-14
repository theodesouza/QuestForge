import { AUTORAL, alts, batch } from '../_helpers';

/** Matemática financeira — juros simples (FIN-005 a FIN-010). Questões autorais. */
export const FIN_JUROS_SIMPLES = batch([
  {
    id: 'FIN-005',
    topic: 'financeira',
    subtopic: 'juros-simples',
    difficulty: 1,
    skills: ['H3', 'H21'],
    stem: [
      {
        kind: 'p',
        text: 'Rafael é microempreendedor individual (MEI) e trabalha com entregas por aplicativo. Para consertar a moto, ele pegou R$ 3.000,00 emprestados em uma cooperativa de crédito, a juros simples de 0,8% ao mês, para quitar a dívida em um único pagamento após 6 meses.',
      },
    ],
    ask: 'Qual valor Rafael deverá pagar ao final dos 6 meses?',
    alternatives: alts('R$ 3.144,00', 'R$ 144,00', 'R$ 3.024,00', 'R$ 4.440,00', 'R$ 3.014,40'),
    answer: 'A',
    hints: [
      'Nos juros simples, os juros são os mesmos todo mês, sempre calculados sobre o valor emprestado.',
      'Comece calculando 0,8% de R$ 3.000,00, que são os juros de um mês.',
    ],
    solution: [
      'Juros de um mês: 0,008 × 3.000 = R$ 24,00.',
      'Juros de 6 meses: 24 × 6 = R$ 144,00.',
      'Valor a pagar (montante): 3.000 + 144 = R$ 3.144,00.',
    ],
    concept: 'Juros simples: J = C × i × t. O valor total devolvido é o montante M = C + J.',
    estimatedSeconds: 45,
    source: AUTORAL,
    verify: () => 3000 + 3000 * 0.008 * 6,
  },
  {
    id: 'FIN-006',
    topic: 'financeira',
    subtopic: 'juros-simples',
    difficulty: 2,
    skills: ['H1', 'H3'],
    stem: [
      {
        kind: 'p',
        text: 'O boleto da mensalidade do cursinho pré-vestibular de Joana, no valor de R$ 240,00, foi pago com 15 dias de atraso. No boleto consta a seguinte instrução:',
      },
      {
        kind: 'p',
        text: '“Após o vencimento, cobrar multa de 2% sobre o valor do boleto e juros de mora de 1% ao mês sobre o valor do boleto, proporcionais aos dias de atraso (mês comercial de 30 dias).”',
      },
    ],
    ask: 'Qual foi o valor total pago por Joana?',
    alternatives: alts('R$ 244,80', 'R$ 246,00', 'R$ 247,20', 'R$ 280,80', 'R$ 6,00'),
    answer: 'B',
    hints: [
      'Os encargos têm duas partes: a multa, cobrada uma única vez, e os juros de mora, que dependem de quantos dias se passaram.',
      'Comece pela multa, que é 2% de R$ 240,00. Depois, observe que 15 dias correspondem à metade de um mês comercial.',
    ],
    solution: [
      'Multa: 0,02 × 240 = R$ 4,80.',
      'Juros de mora por 15 dias: 0,01 × 240 × 15/30 = R$ 1,20.',
      'Total pago: 240 + 4,80 + 1,20 = R$ 246,00.',
      'Armadilha: aplicar 1% por dia daria 0,01 × 240 × 15 = R$ 36,00 de juros, mas a taxa é mensal e cobrada proporcionalmente aos dias.',
    ],
    concept:
      'No atraso de um pagamento, a multa é um percentual fixo cobrado uma única vez; os juros de mora são juros simples proporcionais ao tempo de atraso, calculados sobre o valor original.',
    estimatedSeconds: 90,
    source: AUTORAL,
    verify: () => 240 + 240 * 0.02 + 240 * 0.01 * (15 / 30),
  },
  {
    id: 'FIN-007',
    topic: 'financeira',
    subtopic: 'juros-simples',
    difficulty: 2,
    skills: ['H21', 'H25'],
    stem: [
      {
        kind: 'p',
        text: 'Uma loja de eletrodomésticos de Recife oferece duas formas de pagamento: à vista ou em um pagamento único, 3 meses após a compra. No pagamento a prazo, a loja cobra juros simples, com a mesma taxa mensal para todos os produtos. Veja alguns preços:',
      },
      {
        kind: 'table',
        header: ['Produto', 'À vista', 'Pagamento único após 3 meses'],
        rows: [
          ['Geladeira', 'R$ 2.400,00', 'R$ 2.616,00'],
          ['Micro-ondas', 'R$ 650,00', 'R$ 708,50'],
          ['Ventilador', 'R$ 180,00', 'R$ 196,20'],
        ],
        caption: 'Tabela de preços da loja',
      },
    ],
    ask: 'A taxa mensal de juros simples cobrada pela loja no pagamento a prazo é de',
    alternatives: alts('2,75%', '9%', '3%', '27%', '≈ 2,9%'),
    answer: 'C',
    hints: [
      'Os juros são a diferença entre o valor pago a prazo e o preço à vista, e correspondem a 3 meses de financiamento.',
      'Escolha um produto, calcule os juros e divida-os pelo preço à vista para obter a taxa do período inteiro.',
    ],
    solution: [
      'Geladeira: juros de 2.616 − 2.400 = R$ 216,00 em 3 meses.',
      'Taxa no período: 216 ÷ 2.400 = 0,09 = 9% em 3 meses.',
      'Taxa mensal em juros simples: 9% ÷ 3 = 3% ao mês.',
      'Conferência com o ventilador: 180 × 0,03 × 3 = 16,20 e 180 + 16,20 = R$ 196,20.',
      'Armadilha: dividir os juros pelo valor a prazo (216 ÷ 2.616) subestima a taxa, pois o valor financiado é o preço à vista.',
    ],
    concept:
      'Em juros simples, a taxa do período é a taxa mensal multiplicada pelo número de meses; por isso, i = J ÷ (C × t), em que C é o preço à vista.',
    estimatedSeconds: 90,
    source: AUTORAL,
    verify: () => ((2616 - 2400) / 2400 / 3) * 100,
  },
  {
    id: 'FIN-008',
    topic: 'financeira',
    subtopic: 'juros-simples',
    difficulty: 3,
    skills: ['H3', 'H21'],
    stem: [
      {
        kind: 'p',
        text: 'Bianca tem um pequeno salão de beleza e combinou com um fornecedor a compra de duas cadeiras de cabeleireiro por R$ 5.600,00, a serem pagas à vista daqui a 8 meses.',
      },
      {
        kind: 'p',
        text: 'Para isso, ela vai aplicar hoje uma quantia em um investimento que rende juros simples de 1,5% ao mês, de modo que o montante, ao final dos 8 meses, seja exatamente o valor combinado.',
      },
    ],
    ask: 'A quantia que Bianca deve aplicar hoje é',
    alternatives: alts('R$ 4.928,00', 'R$ 5.516,00', 'R$ 6.272,00', 'R$ 5.000,00', 'R$ 600,00'),
    answer: 'D',
    hints: [
      'Os juros incidem sobre a quantia aplicada hoje, que é desconhecida; os R$ 5.600,00 já incluem esses juros.',
      'Calcule a taxa acumulada em 8 meses e escreva o montante como capital × (1 + taxa acumulada).',
    ],
    solution: [
      'Taxa acumulada em 8 meses: 8 × 1,5% = 12%.',
      'Montante: M = C × (1 + 0,12) = 1,12 × C.',
      '1,12 × C = 5.600, logo C = 5.600 ÷ 1,12 = R$ 5.000,00.',
      'Conferência: 5.000 × 0,015 × 8 = R$ 600,00 de juros e 5.000 + 600 = R$ 5.600,00.',
      'Armadilha: tirar 12% de R$ 5.600,00 dá R$ 4.928,00, mas os juros incidem sobre o capital, e não sobre o montante.',
    ],
    concept: 'Para obter o capital a partir do montante em juros simples, divide-se o montante por (1 + i × t): C = M ÷ (1 + i × t).',
    estimatedSeconds: 120,
    source: AUTORAL,
    verify: () => 5600 / (1 + 0.015 * 8),
  },
  {
    id: 'FIN-009',
    topic: 'financeira',
    subtopic: 'juros-simples',
    difficulty: 3,
    skills: ['H19', 'H21'],
    stem: [
      {
        kind: 'p',
        text: 'Edson recebeu R$ 20.000,00 de verbas rescisórias e dividiu esse valor entre duas aplicações que pagam juros simples: uma parte foi para a aplicação A, com taxa de 0,8% ao mês, e o restante foi para a aplicação B, com taxa de 1,2% ao mês.',
      },
      {
        kind: 'p',
        text: 'Após 10 meses, ele verificou que as duas aplicações renderam, juntas, R$ 2.080,00 de juros.',
      },
    ],
    ask: 'A quantia que Edson aplicou na aplicação B foi',
    alternatives: alts('R$ 4.000,00', 'R$ 8.000,00', 'R$ 10.000,00', 'R$ 10.400,00', 'R$ 12.000,00'),
    answer: 'E',
    hints: [
      'Chame de x a quantia aplicada em B; a quantia aplicada em A é o que sobra dos R$ 20.000,00.',
      'Calcule a taxa acumulada em 10 meses de cada aplicação e escreva uma equação para a soma dos juros.',
    ],
    solution: [
      'Em 10 meses, A rende 0,8% × 10 = 8% e B rende 1,2% × 10 = 12% do valor aplicado.',
      'Se x foi aplicado em B, então 20.000 − x foi aplicado em A.',
      'Juros totais: 0,12x + 0,08 × (20.000 − x) = 2.080.',
      '0,12x + 1.600 − 0,08x = 2.080, logo 0,04x = 480 e x = R$ 12.000,00.',
      'Conferência: 12.000 × 0,12 + 8.000 × 0,08 = 1.440 + 640 = R$ 2.080,00.',
    ],
    concept:
      'Quando um capital é dividido entre aplicações, os juros totais são a soma dos juros de cada parte; isso gera uma equação do 1º grau cuja incógnita é uma das partes.',
    estimatedSeconds: 180,
    source: AUTORAL,
    verify: () => {
      const total = 20000;
      const taxaA = 0.008 * 10;
      const taxaB = 0.012 * 10;
      return (2080 - total * taxaA) / (taxaB - taxaA);
    },
  },
  {
    id: 'FIN-010',
    topic: 'financeira',
    subtopic: 'juros-simples',
    difficulty: 4,
    skills: ['H21', 'H23', 'H25'],
    stem: [
      {
        kind: 'p',
        text: 'Yuri tem R$ 6.000,00 para aplicar e pesquisou três opções que pagam juros simples. Duas delas cobram um custo fixo, descontado uma única vez no momento do resgate, conforme a tabela.',
      },
      {
        kind: 'table',
        header: ['Aplicação', 'Taxa de juros simples', 'Custo no resgate'],
        rows: [
          ['P', '0,9% ao mês', 'Isenta'],
          ['Q', '1,2% ao mês', 'R$ 90,00'],
          ['R', '1,5% ao mês', 'R$ 270,00'],
        ],
      },
      {
        kind: 'p',
        text: 'Considere como rendimento líquido os juros obtidos menos o custo no resgate, e que o prazo de aplicação é um número inteiro de meses.',
      },
    ],
    ask: 'O menor prazo para o qual a aplicação R proporciona rendimento líquido maior que o de cada uma das outras duas é de',
    alternatives: alts('11 meses', '10 meses', '8 meses', '3 meses', '6 meses'),
    answer: 'A',
    hints: [
      'Escreva o rendimento líquido de cada aplicação em função do número t de meses; a taxa maior só compensa quando o tempo é suficiente para cobrir o custo maior.',
      'Calcule os juros de um mês de cada aplicação sobre R$ 6.000,00 e compare R com P e R com Q separadamente.',
    ],
    solution: [
      'Juros mensais: P = 0,009 × 6.000 = R$ 54,00; Q = 0,012 × 6.000 = R$ 72,00; R = 0,015 × 6.000 = R$ 90,00.',
      'Rendimentos líquidos após t meses: P = 54t; Q = 72t − 90; R = 90t − 270.',
      'R supera P: 90t − 270 > 54t, logo 36t > 270 e t > 7,5.',
      'R supera Q: 90t − 270 > 72t − 90, logo 18t > 180 e t > 10.',
      'As duas condições valem juntas para t > 10; o menor prazo inteiro é 11 meses.',
      'Armadilha: em 10 meses, R e Q empatam (R$ 630,00 cada), então R ainda não é maior que Q.',
    ],
    concept:
      'Para comparar aplicações com custos fixos, comparam-se os rendimentos líquidos: em juros simples, cada um é uma função afim do tempo, e a vantagem muda no ponto em que as retas se cruzam.',
    estimatedSeconds: 240,
    source: AUTORAL,
    verify: () => {
      const capital = 6000;
      const liquido = (taxa: number, custo: number, t: number) => capital * taxa * t - custo;
      let t = 1;
      while (
        !(
          liquido(0.015, 270, t) - liquido(0.009, 0, t) > 0.005 &&
          liquido(0.015, 270, t) - liquido(0.012, 90, t) > 0.005
        )
      ) {
        t++;
      }
      return t;
    },
  },
]);
