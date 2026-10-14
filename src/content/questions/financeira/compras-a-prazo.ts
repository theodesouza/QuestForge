import { AUTORAL, alts, batch } from '../_helpers';

/** Matemática financeira — compras à vista e a prazo (FIN-019 a FIN-024). Questões autorais. */
export const FIN_COMPRAS_A_PRAZO = batch([
  {
    id: 'FIN-019',
    topic: 'financeira',
    subtopic: 'compras-a-prazo',
    difficulty: 1,
    skills: ['H3', 'H16'],
    stem: [
      {
        kind: 'p',
        text: 'Teresa quer trocar a geladeira de casa. Em uma loja de eletrodomésticos, ela encontrou o seguinte anúncio:',
      },
      {
        kind: 'p',
        text: '“Geladeira duplex: 10 × R$ 240,00 sem juros no cartão ou, à vista no Pix, com 8% de desconto sobre o valor total de R$ 2.400,00.”',
      },
    ],
    ask: 'Quanto Teresa economizará se pagar à vista em vez de parcelar?',
    alternatives: alts('R$ 2.208,00', 'R$ 19,20', 'R$ 240,00', 'R$ 1.920,00', 'R$ 192,00'),
    answer: 'E',
    hints: [
      'No parcelamento sem juros, Teresa paga o valor total anunciado; à vista, ela deixa de pagar exatamente o valor do desconto.',
      'Primeiro passo: confirme o total parcelado (10 × R$ 240,00) e escreva 8% na forma decimal.',
    ],
    solution: [
      'Total no parcelamento: 10 × 240 = R$ 2.400,00.',
      'Desconto à vista: 0,08 × 2.400 = R$ 192,00.',
      'Preço à vista: 2.400 − 192 = R$ 2.208,00; a economia é a diferença entre os dois valores, R$ 192,00.',
      'Armadilha: 0,8 × 2.400 = R$ 1.920,00 corresponde a 80%, e não a 8%.',
    ],
    concept:
      'Quando o parcelamento é “sem juros” e há desconto à vista, a economia de pagar à vista é o próprio desconto: percentual × valor total.',
    estimatedSeconds: 45,
    source: AUTORAL,
    verify: () => 10 * 240 * 0.08,
  },
  {
    id: 'FIN-020',
    topic: 'financeira',
    subtopic: 'compras-a-prazo',
    difficulty: 2,
    skills: ['H3', 'H16'],
    stem: [
      {
        kind: 'p',
        text: 'Camila é microempreendedora individual (MEI) e produz bolos sob encomenda. Para aumentar a produção, ela decidiu comprar uma batedeira planetária industrial, que custa R$ 3.000,00 à vista.',
      },
      {
        kind: 'p',
        text: 'No crediário da loja, a mesma batedeira pode ser paga com uma entrada de R$ 600,00 mais 8 parcelas mensais de R$ 345,00.',
      },
    ],
    ask: 'Em relação ao preço à vista, o valor total pago no crediário representa um acréscimo de',
    alternatives: alts('12%', '15%', '≈ 10,7%', '112%', '1,5%'),
    answer: 'A',
    hints: [
      'Some tudo o que Camila desembolsa no crediário (entrada e parcelas) e compare com o preço à vista, que é a referência.',
      'Primeiro passo: calcule o total das parcelas, 8 × R$ 345,00, e some a entrada de R$ 600,00.',
    ],
    solution: [
      'Total das parcelas: 8 × 345 = R$ 2.760,00.',
      'Total no crediário: 600 + 2.760 = R$ 3.360,00.',
      'Acréscimo em reais: 3.360 − 3.000 = R$ 360,00.',
      'Acréscimo percentual sobre o preço à vista: 360 ÷ 3.000 = 0,12 = 12%.',
      'Armadilha: 360 ÷ 3.360 ≈ 10,7% usa o valor final como referência, e não o preço à vista.',
    ],
    concept:
      'Acréscimo percentual = (valor final − valor de referência) ÷ valor de referência. Na comparação entre crediário e compra à vista, a referência é o preço à vista.',
    estimatedSeconds: 70,
    source: AUTORAL,
    verify: () => ((600 + 8 * 345 - 3000) / 3000) * 100,
  },
  {
    id: 'FIN-021',
    topic: 'financeira',
    subtopic: 'compras-a-prazo',
    difficulty: 2,
    skills: ['H16', 'H18'],
    stem: [
      {
        kind: 'p',
        text: 'Thiago joga futsal e foi a uma loja de artigos esportivos comprar uma chuteira com preço de etiqueta de R$ 400,00. O vendedor ofereceu duas formas de pagamento:',
      },
      {
        kind: 'table',
        header: ['Forma de pagamento', 'Condição'],
        rows: [
          ['À vista', '10% de desconto sobre o preço de etiqueta'],
          ['Parcelado “sem juros”', '2 parcelas de R$ 200,00: a 1ª no ato da compra e a 2ª 30 dias depois'],
        ],
      },
    ],
    ask: 'A taxa mensal de juros embutida no parcelamento “sem juros” é de',
    alternatives: alts('10%', '25%', '20%', '≈ 11,1%', '5%'),
    answer: 'B',
    hints: [
      'O preço real da chuteira é o preço à vista. Quem parcela paga a 1ª parcela no ato e fica devendo apenas o que falta desse preço.',
      'Primeiro passo: calcule o preço à vista e subtraia dele a parcela paga no ato; o resultado é o saldo financiado.',
    ],
    solution: [
      'Preço à vista: 400 − 0,10 × 400 = R$ 360,00.',
      'Após pagar a 1ª parcela no ato, o saldo devedor é 360 − 200 = R$ 160,00.',
      'Esse saldo é quitado com R$ 200,00 um mês depois: juros de 200 − 160 = R$ 40,00.',
      'Taxa mensal: 40 ÷ 160 = 0,25 = 25% ao mês.',
      'Armadilha: 40 ÷ 200 = 20% divide os juros pela parcela, e não pelo valor efetivamente financiado.',
    ],
    concept:
      'Um parcelamento “sem juros” que convive com desconto à vista esconde juros. A taxa é calculada sobre o saldo financiado: preço à vista menos o que foi pago no ato.',
    estimatedSeconds: 100,
    source: AUTORAL,
    verify: () => {
      const vista = 400 - 0.1 * 400;
      const parcela = 400 / 2;
      const saldo = vista - parcela;
      return ((parcela - saldo) / saldo) * 100;
    },
  },
  {
    id: 'FIN-022',
    topic: 'financeira',
    subtopic: 'compras-a-prazo',
    difficulty: 3,
    skills: ['H18', 'H25'],
    stem: [
      {
        kind: 'p',
        text: 'Jorge pesquisou o preço de uma máquina de lavar roupas em duas lojas. Ambas cobram o mesmo preço à vista, mas oferecem condições diferentes para a compra a prazo: uma entrada no ato da compra e o restante em um único pagamento 30 dias depois, conforme o quadro.',
      },
      {
        kind: 'table',
        header: ['Loja', 'Preço à vista', 'Entrada', 'Pagamento após 30 dias'],
        rows: [
          ['Alfa', 'R$ 2.500,00', 'R$ 1.500,00', 'R$ 1.060,00'],
          ['Beta', 'R$ 2.500,00', 'R$ 500,00', 'R$ 2.080,00'],
        ],
      },
      {
        kind: 'p',
        text: 'Como vai comprar a prazo, Jorge quer escolher a loja que cobra a menor taxa mensal de juros sobre o valor efetivamente financiado.',
      },
    ],
    ask: 'A menor taxa mensal de juros entre as duas lojas é de',
    alternatives: alts('2,4%', '3,2%', '4%', '6%', '≈ 3,8%'),
    answer: 'C',
    hints: [
      'Em cada loja, a entrada não é financiada: os juros incidem apenas sobre o que falta pagar do preço à vista depois da entrada.',
      'Primeiro passo: na loja Alfa, o saldo financiado é 2.500 − 1.500; compare esse saldo com o pagamento de R$ 1.060,00 feito 30 dias depois.',
    ],
    solution: [
      'Loja Alfa — saldo financiado: 2.500 − 1.500 = R$ 1.000,00; juros: 1.060 − 1.000 = R$ 60,00; taxa: 60 ÷ 1.000 = 6% ao mês.',
      'Loja Beta — saldo financiado: 2.500 − 500 = R$ 2.000,00; juros: 2.080 − 2.000 = R$ 80,00; taxa: 80 ÷ 2.000 = 4% ao mês.',
      'A menor taxa é a da loja Beta: 4% ao mês.',
      'Armadilha: a loja Alfa cobra menos juros em reais (R$ 60,00 contra R$ 80,00) apenas porque financia um valor menor; dividir os juros pelo preço à vista (2,4% e 3,2%) também leva ao erro.',
    ],
    concept:
      'Para comparar propostas de crediário, compare as taxas: juros ÷ saldo financiado (preço à vista − entrada). O valor dos juros em reais, sozinho, não indica qual financiamento é mais barato.',
    estimatedSeconds: 150,
    source: AUTORAL,
    verify: () => {
      const vista = 2500;
      const taxaAlfa = (1060 - (vista - 1500)) / (vista - 1500);
      const taxaBeta = (2080 - (vista - 500)) / (vista - 500);
      return Math.min(taxaAlfa, taxaBeta) * 100;
    },
  },
  {
    id: 'FIN-023',
    topic: 'financeira',
    subtopic: 'compras-a-prazo',
    difficulty: 3,
    skills: ['H3', 'H21'],
    stem: [
      {
        kind: 'p',
        text: 'Bruno quer comprar um sofá que custa R$ 1.500,00 à vista. Como não tem esse valor disponível, ele consultou o crediário da loja, que funciona assim:',
      },
      {
        kind: 'p',
        text: 'paga-se, no ato da compra, uma entrada de 20% do preço à vista; o restante (saldo devedor) é quitado em um único pagamento 2 meses depois, corrigido por juros compostos de 5% ao mês.',
      },
    ],
    ask: 'Qual é o valor total que Bruno pagará pelo sofá nessa opção a prazo?',
    alternatives: alts('R$ 1.323,00', 'R$ 1.620,00', 'R$ 1.650,00', 'R$ 1.623,00', 'R$ 1.653,75'),
    answer: 'D',
    hints: [
      'Os juros incidem apenas sobre o saldo devedor, e não sobre o preço inteiro. No regime composto, os juros do 2º mês incidem sobre o saldo já corrigido no 1º mês.',
      'Primeiro passo: calcule a entrada (20% de R$ 1.500,00) e o saldo devedor que sobra depois dela.',
    ],
    solution: [
      'Entrada: 0,20 × 1.500 = R$ 300,00.',
      'Saldo devedor: 1.500 − 300 = R$ 1.200,00.',
      'Após 1 mês: 1.200 × 1,05 = R$ 1.260,00; após 2 meses: 1.260 × 1,05 = R$ 1.323,00.',
      'Total pago: 300 + 1.323 = R$ 1.623,00.',
      'Armadilhas: com juros simples, o saldo viraria R$ 1.320,00 (total de R$ 1.620,00); aplicar os juros compostos ao preço inteiro, ignorando a entrada, leva a R$ 1.653,75.',
    ],
    concept:
      'No crediário, os juros compostos incidem sobre o saldo devedor: M = S × (1 + i)ⁿ, com S = preço à vista − entrada. O total pago é a entrada mais esse montante.',
    estimatedSeconds: 120,
    source: AUTORAL,
    verify: () => {
      const entrada = 0.2 * 1500;
      const saldo = 1500 - entrada;
      return entrada + saldo * Math.pow(1.05, 2);
    },
  },
  {
    id: 'FIN-024',
    topic: 'financeira',
    subtopic: 'compras-a-prazo',
    difficulty: 4,
    skills: ['H21', 'H23'],
    stem: [
      {
        kind: 'p',
        text: 'Kátia vai comprar um notebook para estudar para o vestibular. O preço à vista é R$ 2.550,00, mas ela optou pela seguinte proposta a prazo, oferecida pela mesma loja:',
      },
      {
        kind: 'table',
        header: ['Pagamento', 'Data', 'Valor'],
        rows: [
          ['Entrada', 'No ato da compra', 'R$ 500,00'],
          ['1ª parcela', '30 dias após a compra', 'R$ 1.102,50'],
          ['2ª parcela', '60 dias após a compra', 'R$ 1.102,50'],
        ],
      },
      {
        kind: 'p',
        text: 'A loja informa que as duas parcelas foram calculadas com juros compostos, a uma taxa mensal fixa, aplicados sobre o saldo financiado.',
      },
    ],
    ask: 'A taxa mensal de juros cobrada pela loja é, aproximadamente, de',
    alternatives: alts('3,0%', '3,8%', '6,1%', '7,6%', '5,0%'),
    answer: 'E',
    hints: [
      'Com juros compostos, cada parcela futura vale menos na data da compra: o saldo financiado é igual à soma das parcelas “trazidas” para hoje, dividindo cada uma por (1 + i) elevado ao número de meses.',
      'Primeiro passo: calcule o saldo financiado (2.550 − 500). Depois, teste as taxas das alternativas e veja qual faz 1.102,50 ÷ (1 + i) + 1.102,50 ÷ (1 + i)² resultar nesse saldo.',
    ],
    solution: [
      'Saldo financiado: 2.550 − 500 = R$ 2.050,00.',
      'A taxa i deve satisfazer 1.102,50 ÷ (1 + i) + 1.102,50 ÷ (1 + i)² = 2.050.',
      'Testando i = 5%: 1.102,50 ÷ 1,05 = R$ 1.050,00 e 1.102,50 ÷ 1,05² = 1.102,50 ÷ 1,1025 = R$ 1.000,00.',
      'Soma: 1.050 + 1.000 = R$ 2.050,00, exatamente o saldo financiado; logo, a taxa é de 5% ao mês.',
      'Armadilhas: o acréscimo total (500 + 2 × 1.102,50 − 2.550 = R$ 155,00) dividido pelo saldo dá ≈ 7,6% e, dividido pelo preço à vista, ≈ 6,1%. Nenhum deles é taxa mensal, e dividi-los por 2 meses (≈ 3,8% e ≈ 3,0%) ignora que os juros são compostos e que a 1ª parcela já reduz a dívida.',
    ],
    concept:
      'Num financiamento com juros compostos, o saldo financiado é o valor presente das parcelas: S = P ÷ (1 + i) + P ÷ (1 + i)² + … A taxa implícita é a que torna essa igualdade verdadeira.',
    estimatedSeconds: 240,
    source: AUTORAL,
    verify: () => {
      const saldo = 2550 - 500;
      const parcela = 1102.5;
      // saldo · x² − parcela · x − parcela = 0, com x = 1 + i
      const x = (parcela + Math.sqrt(parcela * parcela + 4 * saldo * parcela)) / (2 * saldo);
      return (x - 1) * 100;
    },
  },
]);
