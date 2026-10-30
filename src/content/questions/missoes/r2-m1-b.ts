import { AUTORAL, alts, batch } from '../_helpers';

/** Missão r2-m1 — questões extras para repetição (lote b). Questões autorais. */
export const MISSAO_R2M1_B = batch([
  {
    id: 'FIN-112',
    topic: 'financeira',
    subtopic: 'juros-simples',
    difficulty: 1,
    skills: ['H3', 'H21'],
    stem: [
      {
        kind: 'p',
        text: 'Jéssica tem uma sorveteria em Teresina (PI). Para comprar um freezer expositor, ela pegou R$ 3.500,00 emprestados a juros simples, com pagamento único 6 meses depois. Ao quitar a dívida, ela pagou R$ 420,00 de juros, além do valor emprestado.',
      },
    ],
    ask: 'A taxa mensal de juros simples desse empréstimo foi de',
    alternatives: alts('12%', '1,79%', '2%', '0,2%', '10,71%'),
    answer: 'C',
    hints: [
      'A taxa mensal indica que fração do valor emprestado é cobrada de juros a cada mês.',
      'Descubra primeiro quanto Jéssica pagou de juros por mês, dividindo os R$ 420,00 pelos 6 meses.',
    ],
    solution: [
      { explanation: 'Juros de um mês.', calculation: ['420 ÷ 6 = R$ 70,00'] },
      'Taxa mensal: 70 ÷ 3.500 = 0,02 = 2% ao mês.',
      { explanation: 'Conferência.', calculation: ['3.500 × 0,02 × 6 = R$ 420,00'] },
      'Armadilha: 420 ÷ 3.500 = 12% é a taxa acumulada nos 6 meses, e não a taxa mensal.',
      'Armadilha: dividir os juros pelo total pago (3.500 + 420 = R$ 3.920,00) dá cerca de 1,79% ao mês, mas a taxa incide sobre o valor emprestado.',
    ],
    concept:
      'Em juros simples, J = C × i × t; por isso, a taxa é i = J ÷ (C × t): os juros de um período divididos pelo capital.',
    estimatedSeconds: 50,
    source: AUTORAL,
    verify: () => (420 / (3500 * 6)) * 100,
  },
  {
    id: 'FIN-113',
    topic: 'financeira',
    subtopic: 'juros-simples',
    difficulty: 2,
    skills: ['H3', 'H21'],
    stem: [
      {
        kind: 'p',
        text: 'Seu Raimundo emprestou R$ 9.600,00 ao filho, Diego, para que ele montasse uma barbearia em Feira de Santana (BA). Os dois combinaram juros simples de 7,5% ao ano, cobrados proporcionalmente ao tempo (inclusive em frações de ano), com a dívida quitada em um único pagamento.',
      },
      {
        kind: 'p',
        text: 'Diego quitou a dívida 2 anos e 8 meses depois do empréstimo.',
      },
    ],
    ask: 'Qual foi o valor pago por Diego para quitar a dívida?',
    alternatives: alts('R$ 11.616,00', 'R$ 11.040,00', 'R$ 1.920,00', 'R$ 11.760,00', 'R$ 11.520,00'),
    answer: 'E',
    hints: [
      'O prazo mistura anos e meses: antes de calcular, escreva todo o tempo em uma única unidade, compatível com a taxa.',
      'Converta 2 anos e 8 meses em meses e encontre a taxa mensal equivalente a 7,5% ao ano (em juros simples, basta dividir por 12).',
    ],
    solution: [
      'Tempo: 2 anos e 8 meses = 2 × 12 + 8 = 32 meses.',
      'Taxa mensal: 7,5% ÷ 12 = 0,625% ao mês.',
      { explanation: 'Taxa acumulada.', calculation: ['0,625% × 32 = 20%'] },
      { explanation: 'Juros.', calculation: ['0,20 × 9.600 = R$ 1.920,00'] },
      { explanation: 'Valor pago.', calculation: ['9.600 + 1.920 = R$ 11.520,00'] },
      'Armadilha: escrever 2 anos e 8 meses como 2,8 anos daria 7,5% × 2,8 = 21% e R$ 11.616,00; mas 8 meses são 8/12 ≈ 0,67 de ano, e não 0,8 de ano.',
    ],
    concept:
      'Em juros simples, a taxa acumulada é i × t, com taxa e tempo na mesma unidade. Um prazo como 2 anos e 8 meses deve ser convertido (32 meses ou 8/3 de ano), e não escrito como 2,8 anos.',
    estimatedSeconds: 90,
    source: AUTORAL,
    verify: () => 9600 * (1 + (0.075 / 12) * 32),
  },
  {
    id: 'FIN-114',
    topic: 'financeira',
    subtopic: 'juros-simples',
    difficulty: 2,
    skills: ['H3', 'H25'],
    stem: [
      {
        kind: 'p',
        text: 'Lúcia, motorista de ônibus em Fortaleza, aplicou R$ 12.500,00 em uma aplicação promocional de juros simples, sem fazer novos depósitos nem retiradas. A taxa muda ao longo do tempo, mas os juros de cada mês são sempre calculados sobre o valor aplicado, conforme a tabela.',
      },
      {
        kind: 'table',
        header: ['Período da aplicação', 'Taxa de juros simples'],
        rows: [
          ['Do 1º ao 6º mês', '0,8% ao mês'],
          ['A partir do 7º mês', '1% ao mês'],
        ],
        caption: 'Condições da aplicação',
      },
      {
        kind: 'p',
        text: 'Lúcia resgatou todo o dinheiro ao final do 10º mês.',
      },
    ],
    ask: 'Qual foi o valor resgatado por Lúcia?',
    alternatives: alts('R$ 13.600,00', 'R$ 13.625,00', 'R$ 13.750,00', 'R$ 13.500,00', 'R$ 1.100,00'),
    answer: 'A',
    hints: [
      'Os 10 meses se dividem em dois períodos com taxas diferentes; calcule os juros de cada período separadamente.',
      'Do 1º ao 6º mês são 6 meses a 0,8%; conte quantos meses vão do 7º ao 10º mês, todos a 1%.',
    ],
    solution: [
      'Primeiro período: 6 meses a 0,8% ao mês, ou seja, 12.500 × 0,008 × 6 = R$ 600,00.',
      'Segundo período: do 7º ao 10º mês são 4 meses a 1% ao mês, ou seja, 12.500 × 0,01 × 4 = R$ 500,00.',
      { explanation: 'Juros totais.', calculation: ['600 + 500 = R$ 1.100,00'] },
      { explanation: 'Valor resgatado.', calculation: ['12.500 + 1.100 = R$ 13.600,00'] },
      'Armadilha: usar a média das duas taxas (0,9% ao mês) nos 10 meses daria R$ 13.625,00; a média simples não vale porque os períodos têm durações diferentes (6 e 4 meses).',
      'Armadilha: aplicar uma única taxa aos 10 meses (só 0,8% ou só 1%) daria R$ 13.500,00 ou R$ 13.750,00, ignorando a mudança de taxa.',
    ],
    concept:
      'Quando a taxa de juros simples muda ao longo do tempo, os juros totais são a soma dos juros de cada período: J = C × (i₁ × t₁ + i₂ × t₂).',
    estimatedSeconds: 90,
    source: AUTORAL,
    verify: () => 12500 * (1 + 0.008 * 6 + 0.01 * 4),
  },
  {
    id: 'FIN-115',
    topic: 'financeira',
    subtopic: 'juros-simples',
    difficulty: 2,
    skills: ['H3', 'H21'],
    stem: [
      {
        kind: 'p',
        text: 'Uma loja de móveis de Uberlândia (MG) vende um sofá por R$ 1.800,00 à vista. No crediário da loja, o valor total a prazo é o preço à vista acrescido de juros simples de 2,5% ao mês durante 6 meses, e esse total é dividido em 6 parcelas mensais iguais.',
      },
    ],
    ask: 'Qual é o valor de cada parcela no crediário?',
    alternatives: alts('R$ 307,50', 'R$ 2.070,00', 'R$ 337,50', 'R$ 345,00', 'R$ 270,00'),
    answer: 'D',
    hints: [
      'Primeiro encontre o valor total a prazo; só depois divida esse total entre as parcelas.',
      'Calcule a taxa acumulada em 6 meses (6 × 2,5%) e aplique-a sobre o preço à vista.',
    ],
    solution: [
      { explanation: 'Taxa acumulada.', calculation: ['6 × 2,5% = 15%'] },
      { explanation: 'Juros.', calculation: ['0,15 × 1.800 = R$ 270,00'] },
      { explanation: 'Valor total a prazo.', calculation: ['1.800 + 270 = R$ 2.070,00'] },
      { explanation: 'Valor de cada parcela.', calculation: ['2.070 ÷ 6 = R$ 345,00'] },
      'Armadilha: acrescentar juros de apenas um mês (1.845 ÷ 6 = R$ 307,50) ou de 5 meses (2.025 ÷ 6 = R$ 337,50) não corresponde ao contrato, que cobra juros pelos 6 meses.',
      'Observação: R$ 270,00 são os juros totais e R$ 2.070,00 é o total a prazo; a pergunta pede o valor de cada parcela.',
    ],
    concept:
      'No crediário com juros simples sobre o preço à vista, o total a prazo é M = C × (1 + i × t), e cada parcela é esse total dividido pelo número de parcelas.',
    estimatedSeconds: 75,
    source: AUTORAL,
    verify: () => (1800 * (1 + 0.025 * 6)) / 6,
  },
  {
    id: 'FIN-116',
    topic: 'financeira',
    subtopic: 'juros-simples',
    difficulty: 3,
    skills: ['H2', 'H3'],
    stem: [
      {
        kind: 'p',
        text: 'A comissão de formatura de uma turma do 3º ano do ensino médio de Natal (RN) decidiu guardar dinheiro para a festa. No dia 1º de cada mês, de março a agosto, a comissão depositou R$ 500,00 em uma aplicação de juros simples de 1% ao mês, sem fazer retiradas.',
      },
      {
        kind: 'p',
        text: 'Nessa aplicação, cada depósito rende juros apenas sobre o próprio valor, a partir do dia em que foi feito: cada mês completo de aplicação rende 1% do valor depositado.',
      },
    ],
    ask: 'Qual será o saldo da aplicação no dia 1º de setembro, antes de qualquer novo depósito ou retirada?',
    alternatives: alts('R$ 3.180,00', 'R$ 3.105,00', 'R$ 3.075,00', 'R$ 3.030,00', 'R$ 3.090,00'),
    answer: 'B',
    hints: [
      'Os depósitos ficaram aplicados por tempos diferentes: o de março rendeu por mais meses que o de agosto.',
      'Conte quantos meses completos cada depósito ficou aplicado até 1º de setembro; cada mês rende 1% de R$ 500,00, ou seja, R$ 5,00.',
    ],
    solution: [
      'Foram 6 depósitos de R$ 500,00 (março, abril, maio, junho, julho e agosto), totalizando R$ 3.000,00.',
      'Até 1º de setembro, o depósito de março ficou aplicado 6 meses; o de abril, 5; o de maio, 4; o de junho, 3; o de julho, 2; e o de agosto, 1 mês.',
      'Cada mês de aplicação de um depósito rende 0,01 × 500 = R$ 5,00.',
      { explanation: 'Juros totais.', calculation: ['5 × (6 + 5 + 4 + 3 + 2 + 1) = 5 × 21', '= R$ 105,00'] },
      { explanation: 'Saldo.', calculation: ['3.000 + 105 = R$ 3.105,00'] },
      'Armadilha: aplicar 6 meses de juros sobre os R$ 3.000,00 daria R$ 3.180,00, como se todo o dinheiro tivesse sido depositado em março.',
      'Armadilha: considerar que o depósito de agosto não rendeu nada (5 + 4 + 3 + 2 + 1 + 0 = 15 meses de juros) daria R$ 3.075,00; ele ficou aplicado um mês inteiro.',
      'Armadilha: usar 3 meses (metade de 6) como tempo médio para os R$ 3.000,00 daria R$ 3.090,00; o tempo médio correto é 21 ÷ 6 = 3,5 meses, e 3.000 × 0,01 × 3,5 = R$ 105,00.',
    ],
    concept:
      'Em uma aplicação com vários depósitos a juros simples, cada depósito rende juros pelo seu próprio tempo de aplicação; os juros totais são a soma dos juros de cada depósito.',
    estimatedSeconds: 150,
    source: AUTORAL,
    verify: () => {
      let saldo = 0;
      for (let meses = 1; meses <= 6; meses++) saldo += 500 * (1 + 0.01 * meses);
      return saldo;
    },
  },
  {
    id: 'FIN-117',
    topic: 'financeira',
    subtopic: 'juros-simples',
    difficulty: 3,
    skills: ['H19', 'H21'],
    stem: [
      {
        kind: 'p',
        text: 'Carla recebeu uma indenização de R$ 26.000,00 e decidiu dividir todo esse valor entre os dois filhos: Lívia, de 10 anos, e Mateus, de 14 anos. Cada parte será aplicada hoje, a juros simples de 5% ao ano, e resgatada quando o filho completar 18 anos: a parte de Lívia ficará aplicada por 8 anos, e a de Mateus, por 4 anos.',
      },
      {
        kind: 'p',
        text: 'Carla quer que os dois filhos resgatem exatamente o mesmo valor.',
      },
    ],
    ask: 'A quantia que Carla deve aplicar hoje em nome de Lívia é',
    alternatives: alts('R$ 13.000,00', 'R$ 14.000,00', 'R$ 8.666,67', 'R$ 16.800,00', 'R$ 12.000,00'),
    answer: 'E',
    hints: [
      'A parte de Lívia ficará mais tempo aplicada; por isso, para que os resgates sejam iguais, ela deve receber uma parte menor hoje.',
      'Chame de x a parte de Lívia (a de Mateus é 26.000 − x) e calcule o fator de crescimento de cada uma: 1 + 0,05 × 8 e 1 + 0,05 × 4.',
    ],
    solution: [
      { explanation: 'Fator da parte de Lívia (8 anos).', calculation: ['1 + 0,05 × 8 = 1,4'] },
      { explanation: 'Fator da parte de Mateus (4 anos).', calculation: ['1 + 0,05 × 4 = 1,2'] },
      { explanation: 'Montantes iguais.', calculation: ['1,4x = 1,2 × (26.000 − x)'] },
      '1,4x = 31.200 − 1,2x, logo 2,6x = 31.200 e x = R$ 12.000,00.',
      'Conferência: Lívia resgata 12.000 × 1,4 = R$ 16.800,00 e Mateus resgata 14.000 × 1,2 = R$ 16.800,00.',
      'Armadilha: dividir os R$ 26.000,00 na razão inversa dos tempos (4 : 8) daria R$ 8.666,67 para Lívia; isso não funciona porque o resgate inclui o capital, e não só os juros, que são proporcionais ao tempo.',
      'Observação: R$ 14.000,00 é a parte de Mateus, e R$ 16.800,00 é o valor que cada filho resgatará.',
    ],
    concept:
      'Para que capitais aplicados por prazos diferentes resultem no mesmo montante, igualam-se os montantes: C₁ × (1 + i × t₁) = C₂ × (1 + i × t₂). A parte que fica mais tempo aplicada precisa ser menor.',
    estimatedSeconds: 180,
    source: AUTORAL,
    verify: () => {
      const total = 26000;
      const fatorLivia = 1 + 0.05 * 8;
      const fatorMateus = 1 + 0.05 * 4;
      return (total * fatorMateus) / (fatorLivia + fatorMateus);
    },
  },
  {
    id: 'FIN-118',
    topic: 'financeira',
    subtopic: 'juros-simples',
    difficulty: 3,
    skills: ['H23', 'H25'],
    stem: [
      {
        kind: 'p',
        text: 'Seu Jairo é caminhoneiro autônomo em Cascavel (PR) e precisa de R$ 24.000,00 para trocar os pneus e fazer a manutenção do motor do caminhão. Ele recebeu duas propostas de empréstimo, ambas a juros simples e com quitação em um único pagamento ao final do prazo.',
      },
      {
        kind: 'table',
        header: ['Proposta', 'Taxa de juros simples', 'Prazo', 'Tarifa'],
        rows: [
          ['Banco', '2,1% ao mês', '10 meses', 'Não cobra'],
          ['Cooperativa', '1,6% ao mês', '12 meses', 'Valor fixo, pago na quitação'],
        ],
        caption: 'Propostas recebidas por Seu Jairo',
      },
      {
        kind: 'p',
        text: 'Seu Jairo vai comparar apenas o valor total pago em cada proposta: valor emprestado, juros e tarifa, quando houver.',
      },
    ],
    ask: 'Qual é o maior valor da tarifa da cooperativa para que o total pago a ela não seja maior que o total pago ao banco?',
    alternatives: alts('R$ 432,00', 'R$ 1.200,00', 'R$ 120,00', 'R$ 2.208,00', 'R$ 1.440,00'),
    answer: 'A',
    hints: [
      'A tarifa máxima é a que faz os dois totais ficarem iguais; ela corresponde à diferença entre os juros das duas propostas.',
      'Calcule os juros de cada proposta usando o prazo de cada uma, que não é o mesmo nas duas.',
    ],
    solution: [
      { explanation: 'Juros do banco.', calculation: ['24.000 × 0,021 × 10 = R$ 5.040,00'] },
      { explanation: 'Juros da cooperativa.', calculation: ['24.000 × 0,016 × 12 = R$ 4.608,00'] },
      'Sem tarifa, a cooperativa custaria 5.040 − 4.608 = R$ 432,00 a menos que o banco.',
      'Logo, a tarifa pode ser de no máximo R$ 432,00; com esse valor, os dois totais empatam em R$ 29.040,00.',
      'Armadilha: aplicar a diferença entre as taxas (2,1% − 1,6% = 0,5% ao mês) com um mesmo prazo para as duas propostas daria R$ 1.200,00 (10 meses) ou R$ 1.440,00 (12 meses); como os prazos são diferentes, é preciso calcular os juros de cada proposta.',
      'Armadilha: trocar os prazos entre as propostas daria R$ 2.208,00.',
    ],
    concept:
      'Para comparar propostas com taxas, prazos e tarifas diferentes, calcula-se o custo total de cada uma. A tarifa de equilíbrio é a diferença entre os juros das duas propostas.',
    estimatedSeconds: 180,
    source: AUTORAL,
    verify: () => {
      const emprestimo = 24000;
      return emprestimo * 0.021 * 10 - emprestimo * 0.016 * 12;
    },
  },
  {
    id: 'FIN-119',
    topic: 'financeira',
    subtopic: 'juros-simples',
    difficulty: 3,
    skills: ['H3', 'H25'],
    stem: [
      {
        kind: 'p',
        text: 'A padaria de Dona Sônia, em Belo Horizonte, tem uma conta garantida: um limite de crédito que permite que a conta bancária da empresa fique com saldo negativo. O banco cobra juros simples de 6% ao mês sobre o saldo negativo, proporcionais aos dias de uso (mês comercial de 30 dias): a cada dia, os juros correspondem a 6% ÷ 30 do valor que estava negativo naquele dia.',
      },
      {
        kind: 'table',
        header: ['Dias de agosto', 'Número de dias', 'Saldo negativo da conta'],
        rows: [
          ['1 a 3', '3', 'R$ 2.000,00'],
          ['4 a 10', '7', 'R$ 4.500,00'],
          ['11 a 15', '5', 'R$ 1.500,00'],
        ],
        caption: 'Dias em que a conta da padaria ficou negativa em agosto',
      },
      {
        kind: 'p',
        text: 'Nos demais dias de agosto, o saldo da conta foi positivo. Desconsidere impostos e tarifas.',
      },
    ],
    ask: 'Quanto a padaria pagará de juros pelo uso da conta garantida em agosto?',
    alternatives: alts('R$ 135,00', 'R$ 480,00', 'R$ 80,00', 'R$ 90,00', 'R$ 240,00'),
    answer: 'D',
    hints: [
      'O saldo negativo mudou ao longo dos dias; cada valor deve ser cobrado apenas pelos dias em que ficou negativo.',
      'A taxa diária é 6% ÷ 30 = 0,2%; multiplique cada saldo negativo pelo seu número de dias antes de aplicar essa taxa.',
    ],
    solution: [
      'Taxa diária: 6% ÷ 30 = 0,2% = 0,002 ao dia.',
      'Dias 1 a 3: 2.000 × 3 = 6.000; dias 4 a 10: 4.500 × 7 = 31.500; dias 11 a 15: 1.500 × 5 = 7.500.',
      { explanation: 'Soma dos saldos diários.', calculation: ['6.000 + 31.500 + 7.500 = 45.000'] },
      { explanation: 'Juros.', calculation: ['0,002 × 45.000 = R$ 90,00'] },
      'Armadilha: usar a média simples dos três saldos (8.000 ÷ 3 ≈ R$ 2.666,67) durante os 15 dias daria R$ 80,00; essa média ignora que o saldo de R$ 4.500,00 durou mais dias que os outros.',
      'Armadilha: aplicar 6% sobre a soma dos três saldos (R$ 480,00) cobra um mês inteiro de juros sobre cada valor, mas cada saldo ficou negativo só alguns dias.',
    ],
    concept:
      'Em um limite de crédito com juros simples proporcionais aos dias, os juros são a taxa diária multiplicada pela soma dos saldos negativos de cada dia: cada saldo pesa conforme o número de dias em que ficou negativo.',
    estimatedSeconds: 180,
    source: AUTORAL,
    verify: () => (0.06 / 30) * (2000 * 3 + 4500 * 7 + 1500 * 5),
  },
  {
    id: 'FIN-120',
    topic: 'financeira',
    subtopic: 'juros-simples',
    difficulty: 3,
    skills: ['H3', 'H5'],
    stem: [
      {
        kind: 'p',
        text: 'Vanessa tem um estúdio de manicure em Campo Grande (MS) e paga R$ 1.350,00 de aluguel pela sala comercial, com vencimento no dia 5 de cada mês. O contrato de locação estabelece:',
      },
      {
        kind: 'p',
        text: '“O aluguel pago até a data do vencimento terá desconto de pontualidade de 4%. Após o vencimento, serão cobrados multa de 10% e juros de mora de 1% ao mês, ambos calculados sobre o valor do aluguel, com os juros de mora proporcionais aos dias de atraso (mês comercial de 30 dias).”',
      },
      {
        kind: 'p',
        text: 'Vanessa pagou o aluguel de maio com 18 dias de atraso.',
      },
    ],
    ask: 'Quanto Vanessa pagou a mais do que teria pago se tivesse quitado esse aluguel até a data do vencimento?',
    alternatives: alts('R$ 143,10', 'R$ 189,00', 'R$ 197,10', 'R$ 202,50', 'R$ 1.493,10'),
    answer: 'C',
    hints: [
      'Compare dois valores: o que Vanessa pagou com atraso (aluguel, multa e juros de mora) e o que ela teria pago com o desconto de pontualidade.',
      'Calcule a multa (10% de R$ 1.350,00) e os juros de mora de 18 dias, lembrando que 18 dias são 18/30 de um mês.',
    ],
    solution: [
      { explanation: 'Pagando até o vencimento.', calculation: ['1.350 − 0,04 × 1.350 = 1.350 − 54', '= R$ 1.296,00'] },
      { explanation: 'Multa.', calculation: ['0,10 × 1.350 = R$ 135,00'] },
      { explanation: 'Juros de mora.', calculation: ['0,01 × 1.350 × 18/30 = 13,50 × 0,6', '= R$ 8,10'] },
      { explanation: 'Valor pago com atraso.', calculation: ['1.350 + 135 + 8,10 = R$ 1.493,10'] },
      { explanation: 'Diferença.', calculation: ['1.493,10 − 1.296 = R$ 197,10'] },
      'Armadilha: comparar com o aluguel sem desconto (1.493,10 − 1.350 = R$ 143,10) mede só os encargos do atraso e esquece o desconto que Vanessa deixou de ganhar.',
      'Armadilha: cobrar um mês inteiro de juros de mora (R$ 13,50) daria R$ 202,50, mas os juros de mora são proporcionais aos 18 dias de atraso.',
    ],
    concept:
      'O custo de atrasar um pagamento inclui a multa, que é fixa, e os juros de mora, que são juros simples proporcionais ao tempo; quando há desconto de pontualidade, o desconto perdido também entra nessa conta.',
    estimatedSeconds: 150,
    source: AUTORAL,
    verify: () => {
      const aluguel = 1350;
      const comAtraso = aluguel + 0.1 * aluguel + 0.01 * aluguel * (18 / 30);
      const emDia = aluguel * (1 - 0.04);
      return comAtraso - emDia;
    },
  },
  {
    id: 'FIN-121',
    topic: 'financeira',
    subtopic: 'juros-simples',
    difficulty: 3,
    skills: ['H5', 'H24'],
    stem: [
      {
        kind: 'p',
        text: 'Patrícia, professora da rede estadual em Maceió, tem R$ 12.000,00 para aplicar por 10 meses (300 dias) e está em dúvida entre duas aplicações. O CDB paga 0,9% ao mês, mas sobre os juros incide imposto de renda, conforme a tabela. A outra aplicação paga 0,75% ao mês e é isenta de imposto de renda para pessoas físicas.',
      },
      {
        kind: 'table',
        header: ['Prazo da aplicação', 'Alíquota do imposto sobre os juros'],
        rows: [
          ['Até 180 dias', '22,5%'],
          ['De 181 a 360 dias', '20%'],
          ['De 361 a 720 dias', '17,5%'],
          ['Acima de 720 dias', '15%'],
        ],
        caption: 'Imposto de renda sobre os juros do CDB',
      },
      {
        kind: 'p',
        text: 'Para simplificar, considere que as duas aplicações rendem juros simples e que não há outros custos.',
      },
    ],
    ask: 'Patrícia escolherá a aplicação com maior rendimento líquido (juros menos o imposto). Esse rendimento líquido será de',
    alternatives: alts('R$ 1.080,00', 'R$ 900,00', 'R$ 918,00', 'R$ 864,00', 'R$ 837,00'),
    answer: 'B',
    hints: [
      'O imposto de renda reduz os juros do CDB; compare os rendimentos depois de descontar o imposto, e não as taxas brutas.',
      'Os 300 dias indicam a faixa da tabela que vale para o CDB; calcule os juros brutos do CDB e desconte a alíquota dessa faixa.',
    ],
    solution: [
      'CDB: juros brutos de 12.000 × 0,009 × 10 = R$ 1.080,00.',
      'Como 300 dias está entre 181 e 360 dias, a alíquota é de 20%: imposto de 0,20 × 1.080 = R$ 216,00.',
      { explanation: 'Rendimento líquido do CDB.', calculation: ['1.080 − 216 = R$ 864,00'] },
      'Aplicação isenta: juros de 12.000 × 0,0075 × 10 = R$ 900,00, sem imposto.',
      'A aplicação isenta rende mais: R$ 900,00 contra R$ 864,00.',
      'Armadilha: comparar os juros brutos (R$ 1.080,00) faz o CDB parecer melhor; usar a alíquota de 15%, da última faixa, daria R$ 918,00 para o CDB e também levaria à escolha errada.',
    ],
    concept:
      'Para comparar aplicações com tributação diferente, compara-se o rendimento líquido: juros menos o imposto, cuja alíquota depende do prazo. Uma taxa menor e isenta pode render mais que uma taxa maior tributada.',
    estimatedSeconds: 180,
    source: AUTORAL,
    verify: () => {
      const capital = 12000;
      const meses = 10;
      const dias = meses * 30;
      const aliquota = dias <= 180 ? 0.225 : dias <= 360 ? 0.2 : dias <= 720 ? 0.175 : 0.15;
      const cdb = capital * 0.009 * meses * (1 - aliquota);
      const isenta = capital * 0.0075 * meses;
      return Math.max(cdb, isenta);
    },
  },
  {
    id: 'FIN-122',
    topic: 'financeira',
    subtopic: 'juros-simples',
    difficulty: 4,
    skills: ['H21', 'H23'],
    stem: [
      {
        kind: 'p',
        text: 'Uma pequena confecção de Caruaru (PE) precisa de capital de giro e recebeu duas propostas, sem tarifas ou outros custos.',
      },
      {
        kind: 'p',
        text: 'Financeira: a confecção assina uma dívida de R$ 15.000,00, a ser paga em uma única parcela daqui a 5 meses. A financeira calcula juros simples de 4% ao mês sobre esses R$ 15.000,00, pelos 5 meses, e desconta esses juros no ato, entregando à confecção apenas o restante.',
      },
      {
        kind: 'p',
        text: 'Banco: empresta hoje exatamente a mesma quantia que a confecção receberia da financeira, a juros simples de 4,8% ao mês. O valor emprestado e os juros são pagos juntos, em uma única parcela, daqui a 5 meses.',
      },
    ],
    ask: 'Escolhendo a proposta de menor custo, quanto a confecção pagará a menos, daqui a 5 meses, em relação à outra proposta?',
    alternatives: alts('R$ 600,00', 'R$ 3.600,00', 'R$ 480,00', 'R$ 150,00', 'R$ 120,00'),
    answer: 'E',
    hints: [
      'Na financeira, os juros são descontados antes: a confecção recebe menos do que o valor da dívida, mas paga a dívida inteira no final.',
      'Calcule quanto a confecção recebe hoje da financeira; depois, calcule quanto ela pagaria ao banco por essa mesma quantia.',
    ],
    solution: [
      { explanation: 'Juros calculados pela financeira.', calculation: ['15.000 × 0,04 × 5 = R$ 3.000,00'] },
      'Valor recebido hoje: 15.000 − 3.000 = R$ 12.000,00; daqui a 5 meses, a confecção paga R$ 15.000,00.',
      'Banco: os mesmos R$ 12.000,00 a 4,8% ao mês por 5 meses geram 12.000 × 0,048 × 5 = R$ 2.880,00 de juros; o pagamento será de 12.000 + 2.880 = R$ 14.880,00.',
      'O banco é mais barato: 15.000 − 14.880 = R$ 120,00 a menos.',
      'Por trás disso: na financeira, a confecção paga R$ 3.000,00 de juros sobre os R$ 12.000,00 que realmente recebeu, ou seja, 25% em 5 meses, o que dá 5% ao mês. Essa taxa efetiva é maior que os 4,8% do banco, embora a taxa anunciada pela financeira seja de 4%.',
      'Armadilha: comparar as taxas anunciadas (4% contra 4,8% ao mês) sobre R$ 15.000,00 faria a financeira parecer R$ 600,00 mais barata; isso ignora que os juros dela são descontados antes e calculados sobre um valor maior do que o recebido.',
      'Armadilha: supor que o banco emprestaria R$ 15.000,00 (pagamento de R$ 18.600,00) daria uma diferença de R$ 3.600,00, mas o banco empresta apenas os R$ 12.000,00 que a confecção receberia da financeira.',
    ],
    concept:
      'Quando os juros são descontados no momento do empréstimo, a taxa efetiva é calculada sobre o valor realmente recebido: i = J ÷ (valor recebido × t). Ela é maior que a taxa anunciada, e é a taxa efetiva que deve ser comparada com a de outras propostas.',
    estimatedSeconds: 240,
    source: AUTORAL,
    verify: () => {
      const divida = 15000;
      const recebido = divida - divida * 0.04 * 5;
      const pagamentoBanco = recebido * (1 + 0.048 * 5);
      return Math.abs(divida - pagamentoBanco);
    },
  },
]);
