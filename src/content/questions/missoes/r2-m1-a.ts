import { AUTORAL, alts, batch } from '../_helpers';

/** Missão r2-m1 — questões extras para repetição (lote a). Questões autorais. */
export const MISSAO_R2M1_A = batch([
  {
    id: 'FIN-101',
    topic: 'financeira',
    subtopic: 'juros-simples',
    difficulty: 1,
    skills: ['H3', 'H21'],
    stem: [
      {
        kind: 'p',
        text: 'Seu Ademir é agricultor familiar no oeste de Santa Catarina. Para custear o plantio de milho, ele contratou um financiamento rural de R$ 18.000,00, a juros simples de 0,5% ao mês, que será quitado em um único pagamento 10 meses depois, após a colheita.',
      },
    ],
    ask: 'Quanto Seu Ademir pagará de juros nesse financiamento?',
    alternatives: alts('R$ 90,00', 'R$ 900,00', 'R$ 9.000,00', 'R$ 18.900,00', 'R$ 90.000,00'),
    answer: 'B',
    hints: [
      'Em juros simples, os juros de cada mês são iguais e calculados sempre sobre o valor financiado.',
      'Escreva 0,5% na forma decimal (0,005) e calcule os juros de um mês sobre R$ 18.000,00.',
    ],
    solution: [
      'Taxa na forma decimal: 0,5% = 0,5 ÷ 100 = 0,005.',
      'Juros de um mês: 0,005 × 18.000 = R$ 90,00.',
      'Juros de 10 meses: 90 × 10 = R$ 900,00.',
      'Armadilha: usar 0,05 ou 0,5 no lugar de 0,005 multiplica o resultado por 10 ou por 100.',
      'Observação: R$ 18.900,00 é o montante (capital mais juros), mas a pergunta pede apenas os juros.',
    ],
    concept:
      'Juros simples: J = C × i × t, com a taxa i escrita na forma decimal (0,5% = 0,005) e na mesma unidade de tempo que t.',
    estimatedSeconds: 45,
    source: AUTORAL,
    verify: () => 18000 * 0.005 * 10,
  },
  {
    id: 'FIN-102',
    topic: 'financeira',
    subtopic: 'juros-simples',
    difficulty: 1,
    skills: ['H3', 'H21'],
    stem: [
      {
        kind: 'p',
        text: 'Quando o neto nasceu, dona Cida aplicou R$ 4.500,00 em um título que paga juros simples de 7% ao ano. Ela pretende resgatar todo o dinheiro (capital mais juros) depois de 4 anos, quando o menino começar a pré-escola.',
      },
    ],
    ask: 'Qual valor dona Cida resgatará ao final dos 4 anos?',
    alternatives: alts('R$ 1.260,00', 'R$ 4.815,00', 'R$ 4.626,00', 'R$ 5.760,00', 'R$ 5.898,58'),
    answer: 'D',
    hints: [
      'O valor resgatado é o montante: o capital aplicado somado aos juros de todo o período.',
      'Calcule os juros de um ano (7% de R$ 4.500,00) e multiplique pelo número de anos.',
    ],
    solution: [
      'Juros de um ano: 0,07 × 4.500 = R$ 315,00.',
      'Juros de 4 anos: 315 × 4 = R$ 1.260,00.',
      'Montante: 4.500 + 1.260 = R$ 5.760,00.',
      'Armadilha: R$ 5.898,58 seria o montante em juros compostos (4.500 × 1,07⁴); no regime simples, os juros de cada ano são sempre R$ 315,00.',
    ],
    concept:
      'Em juros simples, o montante é M = C × (1 + i × t): os juros de cada período são iguais e incidem só sobre o capital inicial.',
    estimatedSeconds: 45,
    source: AUTORAL,
    verify: () => 4500 * (1 + 0.07 * 4),
  },
  {
    id: 'FIN-103',
    topic: 'financeira',
    subtopic: 'juros-simples',
    difficulty: 1,
    skills: ['H3', 'H21'],
    stem: [
      {
        kind: 'p',
        text: 'Seu Valdemar, aposentado em Juiz de Fora (MG), quer complementar a renda com R$ 450,00 por mês. Ele encontrou uma aplicação que paga juros simples de 0,6% ao mês sobre o valor aplicado. Todo mês, ele retiraria apenas os juros, mantendo o valor aplicado intacto.',
      },
    ],
    ask: 'Para obter exatamente R$ 450,00 de juros por mês, quanto Seu Valdemar precisa aplicar?',
    alternatives: alts('R$ 75.000,00', 'R$ 7.500,00', 'R$ 750.000,00', 'R$ 2.700,00', 'R$ 5.400,00'),
    answer: 'A',
    hints: [
      'Os R$ 450,00 mensais devem corresponder a 0,6% do valor aplicado.',
      'Chame o valor aplicado de C e resolva a equação 0,006 × C = 450.',
    ],
    solution: [
      '0,6% ao mês significa que os juros mensais são 0,006 × C.',
      '0,006 × C = 450, logo C = 450 ÷ 0,006 = R$ 75.000,00.',
      'Conferência: 0,006 × 75.000 = R$ 450,00 por mês.',
      'Armadilha: dividir por 0,06 (R$ 7.500,00) ou por 0,0006 (R$ 750.000,00) é erro na conversão da porcentagem para a forma decimal.',
    ],
    concept:
      'Se os juros de um período são J = C × i, o capital necessário para obter certo valor de juros é C = J ÷ i, com a taxa na forma decimal.',
    estimatedSeconds: 50,
    source: AUTORAL,
    verify: () => 450 / 0.006,
  },
  {
    id: 'FIN-104',
    topic: 'financeira',
    subtopic: 'juros-simples',
    difficulty: 2,
    skills: ['H3', 'H21'],
    stem: [
      {
        kind: 'p',
        text: 'Uma pequena empresa de desenvolvimento de aplicativos de Campina Grande (PB) aplicou R$ 7.200,00 do seu caixa em uma aplicação que paga juros simples de 18% ao ano. O dinheiro foi resgatado 5 meses depois, para a compra de novos computadores.',
      },
    ],
    ask: 'Quanto essa aplicação rendeu de juros nos 5 meses?',
    alternatives: alts('R$ 108,00', 'R$ 6.480,00', 'R$ 540,00', 'R$ 1.296,00', 'R$ 7.740,00'),
    answer: 'C',
    hints: [
      'A taxa está ao ano, mas o tempo está em meses: antes de calcular, as duas devem estar na mesma unidade.',
      'Em juros simples, a taxa mensal equivalente a 18% ao ano é 18% ÷ 12.',
    ],
    solution: [
      'Taxa mensal: 18% ÷ 12 = 1,5% ao mês.',
      'Juros de um mês: 0,015 × 7.200 = R$ 108,00.',
      'Juros de 5 meses: 108 × 5 = R$ 540,00.',
      'Armadilha: usar 18% por mês daria 0,18 × 7.200 × 5 = R$ 6.480,00, valor muito maior que os juros de um ano inteiro (0,18 × 7.200 = R$ 1.296,00).',
    ],
    concept:
      'Em juros simples, taxas proporcionais são equivalentes: 18% ao ano corresponde a 18% ÷ 12 = 1,5% ao mês. Taxa e tempo devem estar sempre na mesma unidade.',
    estimatedSeconds: 75,
    source: AUTORAL,
    verify: () => 7200 * (0.18 / 12) * 5,
  },
  {
    id: 'FIN-105',
    topic: 'financeira',
    subtopic: 'juros-simples',
    difficulty: 2,
    skills: ['H5', 'H25'],
    stem: [
      {
        kind: 'p',
        text: 'Gabriel precisa de R$ 5.000,00 para reformar a cozinha de casa e recebeu três propostas de empréstimo, todas a juros simples e com quitação em um único pagamento ao final do prazo. Além dos juros, algumas instituições cobram uma tarifa de cadastro, paga junto com a quitação.',
      },
      {
        kind: 'table',
        header: ['Instituição', 'Taxa de juros simples', 'Prazo', 'Tarifa de cadastro'],
        rows: [
          ['Banco', '2,4% ao mês', '5 meses', 'R$ 0,00'],
          ['Financeira', '1,9% ao mês', '6 meses', 'R$ 80,00'],
          ['Cooperativa', '1,4% ao mês', '8 meses', 'R$ 50,00'],
        ],
        caption: 'Propostas recebidas por Gabriel',
      },
    ],
    ask: 'Gabriel escolherá a proposta em que o valor total pago (valor emprestado, juros e tarifa) é o menor. Esse valor total será de',
    alternatives: alts('R$ 5.610,00', 'R$ 5.650,00', 'R$ 5.560,00', 'R$ 5.570,00', 'R$ 5.600,00'),
    answer: 'E',
    hints: [
      'A menor taxa mensal não garante o menor custo: o prazo e a tarifa também pesam no total.',
      'Para cada proposta, calcule os juros (5.000 × taxa × prazo) e some o valor emprestado e a tarifa.',
    ],
    solution: [
      'Banco: 5.000 × 0,024 × 5 = R$ 600,00 de juros; total 5.000 + 600 + 0 = R$ 5.600,00.',
      'Financeira: 5.000 × 0,019 × 6 = R$ 570,00 de juros; total 5.000 + 570 + 80 = R$ 5.650,00.',
      'Cooperativa: 5.000 × 0,014 × 8 = R$ 560,00 de juros; total 5.000 + 560 + 50 = R$ 5.610,00.',
      'O menor total é o do banco: R$ 5.600,00.',
      'Armadilha: sem a tarifa, a cooperativa pareceria a melhor (R$ 5.560,00), mas a tarifa de R$ 50,00 a deixa R$ 10,00 mais cara que o banco.',
    ],
    concept:
      'Para comparar propostas de crédito, compara-se o custo total de cada uma (juros de todo o prazo mais tarifas), e não apenas a taxa mensal.',
    estimatedSeconds: 120,
    source: AUTORAL,
    verify: () => {
      const capital = 5000;
      const total = (taxa: number, meses: number, tarifa: number) => capital + capital * taxa * meses + tarifa;
      return Math.min(total(0.024, 5, 0), total(0.019, 6, 80), total(0.014, 8, 50));
    },
  },
  {
    id: 'FIN-106',
    topic: 'financeira',
    subtopic: 'juros-simples',
    difficulty: 2,
    skills: ['H3', 'H21'],
    stem: [
      {
        kind: 'p',
        text: 'O dono de uma oficina mecânica em Goiânia comprou peças de reposição no valor de R$ 2.700,00 com crédito do próprio fornecedor. O acordo prevê juros simples de 4,5% ao mês, cobrados proporcionalmente aos dias (mês comercial de 30 dias), com pagamento único 40 dias após a compra.',
      },
    ],
    ask: 'Qual é o valor que a oficina pagará ao fornecedor?',
    alternatives: alts('R$ 2.821,50', 'R$ 2.943,00', 'R$ 162,00', 'R$ 2.862,00', 'R$ 7.560,00'),
    answer: 'D',
    hints: [
      'Como a taxa é mensal e o prazo está em dias, expresse os 40 dias como fração do mês comercial.',
      '40 dias correspondem a 40/30 = 4/3 de mês; calcule primeiro os juros de um mês inteiro.',
    ],
    solution: [
      'Juros de um mês: 0,045 × 2.700 = R$ 121,50.',
      'Tempo em meses: 40 ÷ 30 = 4/3 de mês.',
      'Juros de 40 dias: 121,50 × 4/3 = R$ 162,00.',
      'Valor a pagar: 2.700 + 162 = R$ 2.862,00.',
      'Armadilha: arredondar 40 dias para 2 meses daria R$ 2.943,00; aplicar 4,5% por dia daria R$ 7.560,00.',
    ],
    concept:
      'Em juros simples com taxa mensal e prazo em dias, usa-se t = dias ÷ 30 (mês comercial): J = C × i × (dias ÷ 30).',
    estimatedSeconds: 90,
    source: AUTORAL,
    verify: () => 2700 * (1 + 0.045 * (40 / 30)),
  },
  {
    id: 'FIN-107',
    topic: 'financeira',
    subtopic: 'juros-simples',
    difficulty: 2,
    skills: ['H21', 'H24'],
    stem: [
      {
        kind: 'p',
        text: 'Larissa, técnica de enfermagem em Porto Alegre, aplicou o dinheiro que recebeu por plantões extras em uma aplicação de juros simples, com taxa mensal fixa. Ela não fez novos depósitos nem retiradas. O gráfico mostra o saldo da aplicação em alguns meses após o depósito inicial.',
      },
      {
        kind: 'bars',
        title: 'Saldo da aplicação ao final do mês',
        unit: 'R$',
        data: [
          { label: '3º mês', value: 7770 },
          { label: '6º mês', value: 8040 },
          { label: '9º mês', value: 8310 },
          { label: '12º mês', value: 8580 },
        ],
      },
    ],
    ask: 'A taxa mensal de juros simples dessa aplicação é de',
    alternatives: alts('1,2%', '3,6%', '1,16%', '14,4%', '1,05%'),
    answer: 'A',
    hints: [
      'Em juros simples, o saldo cresce sempre o mesmo valor por mês; o valor aplicado no início não aparece no gráfico.',
      'Use a diferença entre duas barras consecutivas para achar os juros de um mês e, com eles, volte ao saldo do mês zero.',
    ],
    solution: [
      'De uma barra para a seguinte passam 3 meses, e o saldo aumenta 8.040 − 7.770 = R$ 270,00; logo, os juros mensais são 270 ÷ 3 = R$ 90,00.',
      'Capital aplicado (mês zero): 7.770 − 3 × 90 = R$ 7.500,00.',
      'Taxa mensal: 90 ÷ 7.500 = 0,012 = 1,2% ao mês.',
      'Armadilha: dividir os juros mensais pelo saldo do 3º mês (90 ÷ 7.770 ≈ 1,16%) usa um valor que já inclui juros; em juros simples, a taxa incide sempre sobre o capital inicial.',
      'Armadilha: 270 ÷ 7.500 = 3,6% é a taxa acumulada em 3 meses, e não a taxa mensal.',
    ],
    concept:
      'Em juros simples, o saldo é uma função afim do tempo: M(t) = C + C × i × t. O acréscimo mensal constante é C × i, e o capital C é o saldo no instante zero.',
    estimatedSeconds: 120,
    source: AUTORAL,
    verify: () => {
      const jurosMensais = (8040 - 7770) / 3;
      const capital = 7770 - 3 * jurosMensais;
      return (jurosMensais / capital) * 100;
    },
  },
  {
    id: 'FIN-108',
    topic: 'financeira',
    subtopic: 'juros-simples',
    difficulty: 2,
    skills: ['H3', 'H21'],
    stem: [
      {
        kind: 'p',
        text: 'Tiago, estudante de música em Belém, quer comprar um piano digital que custa R$ 4.000,00. Ele tem R$ 3.200,00 e vai aplicá-los em um investimento que paga juros simples de 1,25% ao mês, sem fazer novos depósitos nem retiradas.',
      },
    ],
    ask: 'Supondo que o preço do piano não mude, em quantos meses o montante da aplicação será exatamente o valor necessário para a compra?',
    alternatives: alts('16 meses', '20 meses', '25 meses', '80 meses', '100 meses'),
    answer: 'B',
    hints: [
      'Descubra quanto falta, em juros, para chegar ao preço do piano e quanto a aplicação rende por mês.',
      'Os juros mensais são 1,25% de R$ 3.200,00, sempre o mesmo valor em juros simples.',
    ],
    solution: [
      'Juros necessários: 4.000 − 3.200 = R$ 800,00.',
      'Juros de um mês: 0,0125 × 3.200 = R$ 40,00.',
      'Tempo: 800 ÷ 40 = 20 meses.',
      'Armadilha: calcular 1,25% sobre R$ 4.000,00 (R$ 50,00 por mês) daria 16 meses, mas os juros incidem sobre o valor aplicado, R$ 3.200,00.',
      'Armadilha: 800 ÷ 3.200 = 25% é a taxa acumulada necessária, e não o número de meses.',
    ],
    concept:
      'Em juros simples, o tempo para atingir um montante M é t = (M − C) ÷ (C × i): os juros necessários divididos pelos juros de um período.',
    estimatedSeconds: 90,
    source: AUTORAL,
    verify: () => (4000 - 3200) / (3200 * 0.0125),
  },
  {
    id: 'FIN-109',
    topic: 'financeira',
    subtopic: 'juros-simples',
    difficulty: 3,
    skills: ['H3', 'H21'],
    stem: [
      {
        kind: 'p',
        text: 'Fátima comprou móveis planejados no crediário de uma loja e pagou uma das parcelas, de R$ 850,00, com atraso. O contrato estabelece:',
      },
      {
        kind: 'p',
        text: '“Em caso de atraso, serão cobrados multa de 2% sobre o valor da parcela e juros de mora de 1% ao mês sobre o valor da parcela, proporcionais aos dias de atraso (mês comercial de 30 dias).”',
      },
      {
        kind: 'p',
        text: 'Pela parcela atrasada, Fátima pagou, ao todo, R$ 870,40.',
      },
    ],
    ask: 'Com quantos dias de atraso essa parcela foi paga?',
    alternatives: alts('24 dias', '72 dias', '12 dias', '60 dias', '4 dias'),
    answer: 'C',
    hints: [
      'Os encargos têm duas partes: a multa, que é fixa e não depende do tempo, e os juros de mora, que crescem com os dias de atraso.',
      'Desconte do total pago o valor da parcela e a multa de 2%; o que sobra são os juros de mora.',
    ],
    solution: [
      'Encargos totais: 870,40 − 850 = R$ 20,40.',
      'Multa: 0,02 × 850 = R$ 17,00.',
      'Juros de mora: 20,40 − 17,00 = R$ 3,40.',
      'Juros de mora de um mês inteiro: 0,01 × 850 = R$ 8,50.',
      'Fração do mês: 3,40 ÷ 8,50 = 0,4 mês, e 0,4 × 30 = 12 dias.',
      'Armadilha: atribuir todos os R$ 20,40 aos juros de mora daria 20,40 ÷ 8,50 = 2,4 meses = 72 dias; a multa é cobrada uma única vez e precisa ser descontada antes.',
    ],
    concept:
      'Nos encargos por atraso, a multa é fixa e os juros de mora são juros simples proporcionais ao tempo. Para descobrir o tempo, isola-se a parte dos juros de mora e divide-se pelos juros de um período.',
    estimatedSeconds: 150,
    source: AUTORAL,
    verify: () => {
      const parcela = 850;
      const mora = 870.4 - parcela - 0.02 * parcela;
      return (mora / (0.01 * parcela)) * 30;
    },
  },
  {
    id: 'FIN-110',
    topic: 'financeira',
    subtopic: 'juros-simples',
    difficulty: 3,
    skills: ['H3', 'H21'],
    stem: [
      {
        kind: 'p',
        text: 'Neide é costureira e pegou R$ 7.000,00 emprestados em uma instituição de microcrédito para comprar uma máquina de costura industrial, a juros simples de 2,5% ao mês.',
      },
      {
        kind: 'p',
        text: 'Após 4 meses, ela fez um pagamento de R$ 4.200,00. Pelo contrato, um pagamento parcial quita primeiro todos os juros acumulados até aquela data, e o restante abate a dívida; a partir daí, os juros simples de 2,5% ao mês passam a incidir apenas sobre o novo saldo devedor.',
      },
      {
        kind: 'p',
        text: 'Neide quitou o saldo restante em um único pagamento, 6 meses depois do pagamento parcial.',
      },
    ],
    ask: 'O valor desse último pagamento foi de',
    alternatives: alts('R$ 4.550,00', 'R$ 3.220,00', 'R$ 4.375,00', 'R$ 3.500,00', 'R$ 4.025,00'),
    answer: 'E',
    hints: [
      'Divida o problema em dois períodos, antes e depois do pagamento parcial: no segundo período, os juros incidem sobre uma dívida menor.',
      'Calcule os juros acumulados nos 4 primeiros meses e veja quanto dos R$ 4.200,00 sobra para abater a dívida.',
    ],
    solution: [
      'Juros dos 4 primeiros meses: 7.000 × 0,025 × 4 = R$ 700,00.',
      'Do pagamento de R$ 4.200,00, R$ 700,00 quitam os juros e R$ 3.500,00 abatem a dívida.',
      'Novo saldo devedor: 7.000 − 3.500 = R$ 3.500,00.',
      'Juros dos 6 meses seguintes: 3.500 × 0,025 × 6 = R$ 525,00.',
      'Último pagamento: 3.500 + 525 = R$ 4.025,00.',
      'Armadilha: calcular juros de 10 meses sobre os R$ 7.000,00 e descontar o pagamento parcial (8.750 − 4.200 = R$ 4.550,00) ignora que, após o pagamento, a dívida diminuiu.',
      'Armadilha: abater os R$ 4.200,00 inteiros da dívida, sem antes quitar os juros, levaria a um saldo de R$ 2.800,00 e a um último pagamento de R$ 3.220,00.',
    ],
    concept:
      'Em juros simples, os juros incidem sobre o saldo devedor de cada período. Quando um pagamento parcial reduz a dívida, os juros seguintes são calculados sobre o novo saldo.',
    estimatedSeconds: 180,
    source: AUTORAL,
    verify: () => {
      const emprestimo = 7000;
      const taxa = 0.025;
      const jurosIniciais = emprestimo * taxa * 4;
      const saldo = emprestimo - (4200 - jurosIniciais);
      return saldo * (1 + taxa * 6);
    },
  },
  {
    id: 'FIN-111',
    topic: 'financeira',
    subtopic: 'juros-simples',
    difficulty: 3,
    skills: ['H5', 'H21'],
    stem: [
      {
        kind: 'p',
        text: 'A taxa de condomínio de Jorge, de R$ 1.500,00, vence hoje, mas ele só receberá o salário daqui a 10 dias e está sem saldo na conta. Ele compara duas possibilidades:',
      },
      {
        kind: 'p',
        text: 'Pagar com atraso: pagar o boleto daqui a 10 dias, com multa de 2% sobre o valor do boleto e juros de mora de 1% ao mês, também sobre o valor do boleto, proporcionais aos dias de atraso.',
      },
      {
        kind: 'p',
        text: 'Usar o cheque especial: pagar o boleto hoje com o limite do cheque especial, que cobra juros simples de 5,4% ao mês, proporcionais aos dias de uso, e cobrir o valor usado quando o salário cair, daqui a 10 dias.',
      },
      {
        kind: 'p',
        text: 'Nos dois casos, considere o mês comercial de 30 dias e desconsidere outras tarifas ou impostos.',
      },
    ],
    ask: 'Escolhendo a possibilidade de menor custo, Jorge economizará, em relação à outra,',
    alternatives: alts('R$ 22,00', 'R$ 3,00', 'R$ 46,00', 'R$ 8,00', 'R$ 18,00'),
    answer: 'D',
    hints: [
      'Calcule o custo extra de cada possibilidade: no atraso há uma multa fixa somada aos juros de mora; no cheque especial há apenas juros pelos dias de uso.',
      'Os 10 dias equivalem a 10/30 = 1/3 do mês comercial; comece pelos juros de mora de um mês inteiro, que são 1% de R$ 1.500,00.',
    ],
    solution: [
      'Pagar com atraso: multa de 0,02 × 1.500 = R$ 30,00 e juros de mora de 0,01 × 1.500 × 10/30 = R$ 5,00; custo de R$ 35,00.',
      'Cheque especial: 0,054 × 1.500 × 10/30 = R$ 27,00 de juros.',
      'O cheque especial custa menos, e a economia é de 35 − 27 = R$ 8,00.',
      'Armadilha: esquecer a multa faria o atraso parecer mais barato (R$ 5,00 contra R$ 27,00), mas a multa de 2% é cobrada mesmo em atrasos curtos.',
      'Observação: como a taxa do cheque especial é bem maior, a partir de 14 dias o atraso passaria a ser a possibilidade mais barata (30 + 0,5 × 14 = R$ 37,00 contra 2,7 × 14 = R$ 37,80).',
    ],
    concept:
      'Para comparar custos de curto prazo, somam-se todos os encargos de cada alternativa: a multa é fixa, enquanto os juros simples crescem proporcionalmente aos dias. Por isso, uma taxa maior pode sair mais barata em prazos curtos.',
    estimatedSeconds: 180,
    source: AUTORAL,
    verify: () => {
      const boleto = 1500;
      const fracaoMes = 10 / 30;
      const atraso = 0.02 * boleto + 0.01 * boleto * fracaoMes;
      const chequeEspecial = 0.054 * boleto * fracaoMes;
      return Math.abs(atraso - chequeEspecial);
    },
  },
]);
