import { AUTORAL, alts, batch } from '../_helpers';

/**
 * Missão r2-m3 — questões extras para repetição (lote b): compras a prazo e
 * custo-benefício (FIN-311 a FIN-320). Questões autorais.
 */
export const MISSAO_R2M3_B = batch([
  {
    id: 'FIN-311',
    topic: 'financeira',
    subtopic: 'compras-a-prazo',
    difficulty: 2,
    skills: ['H3', 'H21'],
    stem: [
      {
        kind: 'p',
        text: 'Renata quer trocar de celular. Em uma loja de Natal (RN), o aparelho escolhido custa R$ 1.800,00 à vista. No crediário, sem entrada, ele sai por 6 parcelas mensais de R$ 330,00.',
      },
    ],
    ask: 'Em relação ao preço à vista, quanto por cento Renata pagará a mais se comprar no crediário?',
    alternatives: alts('10%', '9,1%', '18%', '1,7%', '110%'),
    answer: 'A',
    hints: [
      'Primeiro descubra o total pago a prazo; depois compare a diferença com o preço à vista.',
      'Total a prazo: 6 × 330. A diferença para 1.800 deve ser dividida pelo preço à vista.',
    ],
    solution: [
      { explanation: 'Total a prazo.', calculation: ['6 × R$ 330,00 = R$ 1.980,00'] },
      { explanation: 'Diferença.', calculation: ['1.980 − 1.800 = R$ 180,00'] },
      { explanation: 'Em relação ao preço à vista.', calculation: ['180 ÷ 1.800 = 0,10', '= 10%'] },
      'Armadilha: dividir 180 pelo total a prazo (1.980) dá cerca de 9,1%, mas a comparação pedida é com o preço à vista.',
    ],
    concept: 'O acréscimo percentual de uma compra a prazo é (total a prazo − preço à vista) ÷ preço à vista.',
    estimatedSeconds: 60,
    source: AUTORAL,
    verify: () => ((6 * 330 - 1800) / 1800) * 100,
  },
  {
    id: 'FIN-312',
    topic: 'financeira',
    subtopic: 'compras-a-prazo',
    difficulty: 2,
    skills: ['H3', 'H4'],
    stem: [
      {
        kind: 'p',
        text: 'Fábio é técnico em informática em Goiânia (GO) e precisa de um notebook novo, que custa R$ 3.200,00 à vista. A loja também oferece um plano com entrada de R$ 800,00 no ato da compra e mais 10 parcelas mensais de R$ 270,00.',
      },
    ],
    ask: 'Quanto Fábio pagará a mais, em reais, se escolher o plano com entrada e parcelas em vez de pagar à vista?',
    alternatives: alts('R$ 3.500,00', 'R$ 2.700,00', 'R$ 300,00', 'R$ 500,00', 'R$ 270,00'),
    answer: 'C',
    hints: [
      'O total do plano é a entrada somada a todas as parcelas.',
      'Calcule 800 + 10 × 270 e compare com o preço à vista.',
    ],
    solution: [
      { explanation: 'Parcelas.', calculation: ['10 × R$ 270,00 = R$ 2.700,00'] },
      { explanation: 'Total do plano.', calculation: ['800 + 2.700 = R$ 3.500,00'] },
      { explanation: 'Valor pago a mais.', calculation: ['3.500 − 3.200 = R$ 300,00'] },
    ],
    concept: 'Para comparar uma compra parcelada com o preço à vista, some a entrada a todas as parcelas e subtraia o preço à vista.',
    estimatedSeconds: 50,
    source: AUTORAL,
    verify: () => 800 + 10 * 270 - 3200,
  },
  {
    id: 'FIN-313',
    topic: 'financeira',
    subtopic: 'compras-a-prazo',
    difficulty: 3,
    skills: ['H3', 'H25'],
    stem: [
      {
        kind: 'p',
        text: 'Uma loja de móveis de Curitiba (PR) anuncia um guarda-roupa assim:',
      },
      {
        kind: 'p',
        text: '“R$ 1.200,00 em 12 vezes sem juros no cartão, ou 15% de desconto para pagamento à vista no Pix.”',
      },
      {
        kind: 'p',
        text: 'Como quem paga à vista consegue um preço menor, o parcelamento “sem juros” na verdade custa mais do que o preço à vista.',
      },
    ],
    ask: 'Quanto por cento o total pago em 12 vezes supera o preço à vista no Pix, aproximadamente?',
    alternatives: alts('15%', '≈ 17,6%', '≈ 1,5%', '≈ 1,25%', '85%'),
    answer: 'B',
    hints: [
      'O preço à vista é o valor do anúncio com 15% de desconto. A comparação deve ser feita sobre esse preço à vista, não sobre R$ 1.200,00.',
      'Preço à vista: 1.200 × 0,85. Depois calcule (1.200 − preço à vista) ÷ preço à vista.',
    ],
    solution: [
      { explanation: 'Preço à vista.', calculation: ['1.200 × 0,85 = R$ 1.020,00'] },
      { explanation: 'Diferença paga a prazo.', calculation: ['1.200 − 1.020 = R$ 180,00'] },
      'Em relação ao preço à vista: 180 ÷ 1.020 ≈ 0,1765, ou seja, cerca de 17,6%.',
      'Armadilha: dizer 15% é calcular a diferença sobre R$ 1.200,00; mas quem parcela paga 17,6% a mais do que pagaria à vista.',
    ],
    concept:
      'Quando há desconto à vista, o parcelamento "sem juros" embute um acréscimo. A taxa embutida é calculada sobre o preço à vista: (total a prazo − preço à vista) ÷ preço à vista.',
    estimatedSeconds: 90,
    source: AUTORAL,
    verify: () => ((1200 - 1200 * 0.85) / (1200 * 0.85)) * 100,
    tolerance: 0.05,
  },
  {
    id: 'FIN-314',
    topic: 'financeira',
    subtopic: 'compras-a-prazo',
    difficulty: 3,
    skills: ['H3', 'H21'],
    stem: [
      {
        kind: 'p',
        text: 'Uma bicicleta custa R$ 1.000,00 à vista em uma loja de Belém (PA). Para quem prefere pagar a prazo, a loja oferece: entrada de R$ 500,00 no ato da compra e um único pagamento de R$ 540,00 um mês depois.',
      },
      {
        kind: 'p',
        text: 'Os juros são cobrados apenas sobre o valor que ficou devendo após a entrada.',
      },
    ],
    ask: 'Qual é a taxa mensal de juros cobrada pela loja nessa proposta?',
    alternatives: alts('4%', '7,4%', '54%', '3,8%', '8%'),
    answer: 'E',
    hints: [
      'Depois da entrada, quanto do preço à vista ainda falta pagar? Esse é o valor financiado.',
      'Saldo financiado: 1.000 − 500. Compare o pagamento de R$ 540,00 com esse saldo.',
    ],
    solution: [
      { explanation: 'Saldo financiado (o que ficou devendo).', calculation: ['1.000 − 500 = R$ 500,00'] },
      { explanation: 'Juros pagos.', calculation: ['540 − 500 = R$ 40,00'] },
      'Taxa mensal: 40 ÷ 500 = 0,08 = 8% ao mês.',
      'Armadilha: dividir os R$ 40,00 pelo preço total (R$ 1.000,00) dá 4%, mas a entrada não foi financiada.',
    ],
    concept: 'Em compra com entrada, a taxa de juros é calculada sobre o saldo financiado: (valor pago depois − saldo) ÷ saldo.',
    estimatedSeconds: 75,
    source: AUTORAL,
    verify: () => ((540 - (1000 - 500)) / (1000 - 500)) * 100,
  },
  {
    id: 'FIN-315',
    topic: 'financeira',
    subtopic: 'compras-a-prazo',
    difficulty: 4,
    skills: ['H21', 'H25'],
    stem: [
      {
        kind: 'p',
        text: 'Lucas pode comprar um fogão por R$ 1.000,00 à vista ou em 2 parcelas de R$ 540,00, a primeira 1 mês depois da compra e a segunda 2 meses depois. Ele tem o dinheiro guardado numa aplicação que rende 4% ao mês, em juros compostos.',
      },
      {
        kind: 'p',
        text: 'Para comparar as opções, Lucas calcula o valor presente das parcelas: quanto ele precisaria deixar aplicado hoje para conseguir pagar cada parcela na data certa. Use 1 ÷ 1,04 ≈ 0,9615 e 1 ÷ 1,04² ≈ 0,9246.',
      },
    ],
    ask: 'Em valor de hoje, quanto a compra parcelada custa a mais do que a compra à vista, aproximadamente?',
    alternatives: alts('R$ 80,00', '≈ R$ 38,46', 'R$ 0,00', '≈ R$ 18,50', '≈ R$ 40,00'),
    answer: 'D',
    hints: [
      'Cada parcela vale menos hoje do que o seu valor nominal, porque o dinheiro aplicado rende até a data do pagamento.',
      'Valor presente: 540 × 0,9615 + 540 × 0,9246. Compare o resultado com R$ 1.000,00.',
    ],
    solution: [
      { explanation: 'Valor presente da 1ª parcela.', calculation: ['540 × 0,9615 ≈ R$ 519,21'] },
      { explanation: 'Valor presente da 2ª parcela.', calculation: ['540 × 0,9246 ≈ R$ 499,28'] },
      { explanation: 'Soma em valor de hoje.', calculation: ['519,21 + 499,28 ≈ R$ 1.018,49'] },
      'Diferença para o preço à vista: 1.018,49 − 1.000 ≈ R$ 18,50. Mesmo com o rendimento da aplicação, pagar à vista sai mais barato.',
      'Armadilha: a diferença nominal de R$ 80,00 (1.080 − 1.000) ignora que o dinheiro guardado rende enquanto as parcelas não vencem.',
    ],
    concept:
      'Para comparar pagamentos em datas diferentes, traga todos para a mesma data: valor presente = valor futuro ÷ (1 + i)ⁿ. O plano com menor valor presente é o mais vantajoso.',
    estimatedSeconds: 150,
    source: AUTORAL,
    verify: () => 540 * 0.9615 + 540 * 0.9246 - 1000,
    tolerance: 0.05,
  },
  {
    id: 'FIN-316',
    topic: 'financeira',
    subtopic: 'custo-beneficio',
    difficulty: 2,
    skills: ['H4', 'H25'],
    stem: [
      {
        kind: 'p',
        text: 'No supermercado, o mesmo sabão em pó é vendido em duas embalagens: a de 1,6 kg custa R$ 22,40 e a de 4 kg custa R$ 52,00.',
      },
    ],
    ask: 'Quanto se economiza, em cada quilograma, comprando a embalagem de 4 kg em vez da de 1,6 kg?',
    alternatives: alts('R$ 29,60', 'R$ 0,40', 'R$ 2,40', 'R$ 1,00', 'R$ 13,00'),
    answer: 'D',
    hints: ['Compare o preço de 1 kg em cada embalagem.', 'Divida 22,40 por 1,6 e 52,00 por 4.'],
    solution: [
      'Embalagem de 1,6 kg: 22,40 ÷ 1,6 = R$ 14,00 por kg.',
      'Embalagem de 4 kg: 52,00 ÷ 4 = R$ 13,00 por kg.',
      { explanation: 'Economia por quilograma.', calculation: ['14,00 − 13,00 = R$ 1,00'] },
    ],
    concept: 'Para comparar embalagens de tamanhos diferentes, calcule o preço por unidade de medida (por kg, por litro, por unidade).',
    estimatedSeconds: 50,
    source: AUTORAL,
    verify: () => 22.4 / 1.6 - 52 / 4,
  },
  {
    id: 'FIN-317',
    topic: 'financeira',
    subtopic: 'custo-beneficio',
    difficulty: 3,
    skills: ['H21', 'H25'],
    stem: [
      {
        kind: 'p',
        text: 'Uma família quer comparar dois tipos de lâmpada para usar em um cômodo da casa durante 15.000 horas:',
      },
      {
        kind: 'table',
        header: ['Lâmpada', 'Potência', 'Preço', 'Durabilidade'],
        rows: [
          ['LED', '9 W', 'R$ 12,00', '15.000 h'],
          ['Incandescente', '60 W', 'R$ 4,00', '1.000 h'],
        ],
      },
      {
        kind: 'p',
        text: 'A energia elétrica custa R$ 0,80 por kWh (1 kWh = 1.000 W durante 1 hora). Cada lâmpada é trocada exatamente quando atinge sua durabilidade.',
      },
    ],
    ask: 'Somando a compra das lâmpadas e a energia consumida nas 15.000 horas, quanto a família economiza usando LED?',
    alternatives: alts('R$ 660,00', 'R$ 612,00', 'R$ 708,00', 'R$ 48,00', 'R$ 780,00'),
    answer: 'A',
    hints: [
      'Calcule o custo total de cada opção: lâmpadas compradas mais energia gasta em 15.000 horas.',
      'Energia em kWh = potência (W) × horas ÷ 1.000. A incandescente precisará de 15 lâmpadas.',
    ],
    solution: [
      'LED: 1 lâmpada (R$ 12,00) e 9 × 15.000 ÷ 1.000 = 135 kWh → 135 × 0,80 = R$ 108,00. Total: R$ 120,00.',
      'Incandescente: 15.000 ÷ 1.000 = 15 lâmpadas → 15 × 4 = R$ 60,00; energia: 60 × 15.000 ÷ 1.000 = 900 kWh → 900 × 0,80 = R$ 720,00. Total: R$ 780,00.',
      { explanation: 'Economia.', calculation: ['780 − 120 = R$ 660,00'] },
    ],
    concept:
      'Custo-benefício considera o custo total ao longo do uso (compra + manutenção + consumo), e não só o preço da etiqueta.',
    estimatedSeconds: 150,
    source: AUTORAL,
    verify: () => 15 * 4 + ((60 * 15000) / 1000) * 0.8 - (12 + ((9 * 15000) / 1000) * 0.8),
  },
  {
    id: 'FIN-318',
    topic: 'financeira',
    subtopic: 'custo-beneficio',
    difficulty: 2,
    skills: ['H3', 'H4'],
    stem: [
      {
        kind: 'p',
        text: 'Uma academia de Aracaju (SE) oferece três planos: mensal, por R$ 120,00 ao mês; trimestral, por R$ 330,00 a cada 3 meses; e anual, por R$ 1.080,00 pagos de uma vez.',
      },
    ],
    ask: 'Em relação a pagar 12 mensalidades, qual é o desconto percentual do plano anual?',
    alternatives: alts('33,3%', '8,3%', '75%', '36%', '25%'),
    answer: 'E',
    hints: [
      'Calcule quanto custariam 12 mensalidades e compare com o plano anual.',
      'Desconto = (12 × 120 − 1.080) ÷ (12 × 120).',
    ],
    solution: [
      { explanation: '12 mensalidades.', calculation: ['12 × 120 = R$ 1.440,00'] },
      { explanation: 'Economia com o plano anual.', calculation: ['1.440 − 1.080 = R$ 360,00'] },
      { explanation: 'Desconto percentual.', calculation: ['360 ÷ 1.440 = 0,25', '= 25%'] },
      'Armadilha: dividir 360 por 1.080 dá 33,3%, mas o desconto é calculado sobre o preço original.',
    ],
    concept: 'Desconto percentual = (preço original − preço com desconto) ÷ preço original.',
    estimatedSeconds: 60,
    source: AUTORAL,
    verify: () => ((12 * 120 - 1080) / (12 * 120)) * 100,
  },
  {
    id: 'FIN-319',
    topic: 'financeira',
    subtopic: 'custo-beneficio',
    difficulty: 3,
    skills: ['H19', 'H21'],
    stem: [
      {
        kind: 'p',
        text: 'Para uma viagem de 2 dias, Sérgio pesquisou duas locadoras de carro em Recife (PE):',
      },
      {
        kind: 'table',
        header: ['Locadora', 'Diária', 'Quilometragem'],
        rows: [
          ['Rápida', 'R$ 90,00', 'livre (sem custo por km)'],
          ['Estrada', 'R$ 50,00', 'R$ 0,80 por km rodado'],
        ],
      },
      {
        kind: 'p',
        text: 'Ele vai alugar o carro pelos 2 dias, pagando 2 diárias em qualquer uma delas.',
      },
    ],
    ask: 'Com quantos quilômetros rodados no total os dois aluguéis custam exatamente o mesmo?',
    alternatives: alts('50 km', '100 km', '112,5 km', '225 km', '62,5 km'),
    answer: 'B',
    hints: [
      'Escreva o custo total de cada locadora para 2 dias em função dos quilômetros rodados, x.',
      'Rápida: 2 × 90. Estrada: 2 × 50 + 0,80x. Iguale as duas expressões.',
    ],
    solution: [
      'Rápida: 2 × 90 = R$ 180,00, qualquer que seja a quilometragem.',
      { explanation: 'Estrada.', calculation: ['2 × 50 + 0,80x = 100 + 0,80x'] },
      { explanation: 'Igualando.', calculation: ['100 + 0,80x = 180', '0,80x = 80', 'x = 100 km'] },
      'Abaixo de 100 km a Estrada é mais barata; acima disso, a Rápida compensa.',
    ],
    concept: 'Para comparar planos com custo fixo e custo variável, iguale as expressões de custo: o resultado é o ponto de equilíbrio.',
    estimatedSeconds: 90,
    source: AUTORAL,
    verify: () => (2 * 90 - 2 * 50) / 0.8,
  },
  {
    id: 'FIN-320',
    topic: 'financeira',
    subtopic: 'custo-beneficio',
    difficulty: 4,
    skills: ['H21', 'H25'],
    stem: [
      {
        kind: 'p',
        text: 'A família de Neide, em Teresina (PI), paga R$ 450,00 por mês de energia elétrica. Ela está avaliando um kit de energia solar que custa R$ 18.000,00 à vista e reduziria a conta para R$ 75,00 por mês.',
      },
      {
        kind: 'p',
        text: 'O kit exige uma limpeza a cada 12 meses, que custa R$ 300,00 e é paga ao fim do 12º mês, do 24º mês, do 36º mês, e assim por diante. Considere que a conta de luz não muda ao longo do tempo.',
      },
    ],
    ask: 'Ao fim de qual mês, contado a partir da instalação, a economia acumulada na conta de luz, já descontadas as limpezas, passa a ser maior ou igual ao valor pago pelo kit?',
    alternatives: alts('48º mês', '51º mês', '52º mês', '56º mês', '60º mês'),
    answer: 'C',
    hints: [
      'Primeiro calcule a economia mensal na conta de luz. Depois acompanhe o total ano a ano, descontando as limpezas.',
      'Economia: 450 − 75 = 375 por mês. Ao fim de 48 meses, quanto já foi economizado e quanto foi gasto com 4 limpezas?',
    ],
    solution: [
      { explanation: 'Economia mensal.', calculation: ['450 − 75 = R$ 375,00'] },
      'Ao fim do 48º mês: 48 × 375 = R$ 18.000,00 economizados, mas já foram pagas 4 limpezas (R$ 1.200,00). Saldo: R$ 16.800,00.',
      'Faltam R$ 1.200,00, e cada mês acrescenta R$ 375,00: 1.200 ÷ 375 = 3,2, então são necessários mais 4 meses (ao fim do 51º mês, o saldo é de R$ 17.925,00, ainda abaixo de R$ 18.000,00).',
      'Ao fim do 52º mês: 16.800 + 4 × 375 = R$ 18.300,00 ≥ R$ 18.000,00. A próxima limpeza só acontece ao fim do 60º mês.',
      'Armadilha: ignorar as limpezas leva ao 48º mês.',
    ],
    concept:
      'O tempo de retorno (payback) de um investimento é o momento em que a economia acumulada, descontados os custos de manutenção, iguala o valor investido.',
    estimatedSeconds: 180,
    source: AUTORAL,
    verify: () => {
      let total = 0;
      for (let m = 1; m <= 120; m++) {
        total += 375;
        if (m % 12 === 0) total -= 300;
        if (total >= 18000) return m;
      }
      return -1;
    },
  },
]);
