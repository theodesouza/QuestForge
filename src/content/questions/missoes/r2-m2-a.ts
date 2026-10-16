import { AUTORAL, alts, batch } from '../_helpers';

/** Missão r2-m2 — questões extras para repetição (lote a, FIN-201 a FIN-211). Questões autorais. */
export const MISSAO_R2M2_A = batch([
  {
    id: 'FIN-201',
    topic: 'financeira',
    subtopic: 'juros-compostos',
    difficulty: 1,
    skills: ['H3', 'H21'],
    stem: [
      {
        kind: 'p',
        text: 'Seu Valdir é horticultor em uma pequena propriedade no interior de Minas Gerais. Para comprar mudas e adubo, ele pegou R$ 5.000,00 emprestados em uma cooperativa de crédito rural, a juros compostos de 2% ao mês. A dívida será quitada em um único pagamento, 3 meses depois, quando ele vender a colheita.',
      },
      { kind: 'math', lines: ['Use: 1,02³ = 1,061208'] },
    ],
    ask: 'Qual valor Seu Valdir pagará para quitar a dívida?',
    alternatives: alts('R$ 5.306,04', 'R$ 5.300,00', 'R$ 306,04', 'R$ 10.306,04', 'R$ 5.100,00'),
    answer: 'A',
    hints: [
      'Nos juros compostos, a dívida de cada mês é a do mês anterior multiplicada por 1,02, porque os juros também passam a render juros.',
      'Escreva o valor final na forma 5.000 × 1,02ⁿ e descubra qual é o expoente n neste caso.',
    ],
    solution: [
      'Em juros compostos, M = C × (1 + i)ⁿ, com C = 5.000, i = 0,02 e n = 3 meses.',
      'M = 5.000 × 1,02³ = 5.000 × 1,061208 = R$ 5.306,04.',
      'Conferência mês a mês: 5.000,00 → 5.100,00 → 5.202,00 → 5.306,04.',
      'Armadilhas: juros simples dariam 5.000 + 3 × 100 = R$ 5.300,00; R$ 306,04 são apenas os juros; somar outros R$ 5.000,00 ao montante conta o capital duas vezes; R$ 5.100,00 corresponde a só 1 mês de juros.',
    ],
    concept:
      'Em juros compostos, o saldo é multiplicado por (1 + i) a cada período; após n períodos, o montante é M = C × (1 + i)ⁿ.',
    estimatedSeconds: 50,
    source: AUTORAL,
    verify: () => 5000 * Math.pow(1 + 0.02, 3),
    tolerance: 0.005,
  },
  {
    id: 'FIN-202',
    topic: 'financeira',
    subtopic: 'juros-compostos',
    difficulty: 1,
    skills: ['H3', 'H21'],
    stem: [
      {
        kind: 'p',
        text: 'Carla é analista de sistemas e está comparando investimentos. O informe de um fundo diz que ele rende 3% ao trimestre, no regime de juros compostos. Já o outro investimento que ela avalia informa sua rentabilidade por semestre.',
      },
      {
        kind: 'p',
        text: 'Para comparar os dois, Carla precisa calcular a taxa semestral equivalente à taxa trimestral do fundo.',
      },
    ],
    ask: 'A taxa semestral equivalente a 3% ao trimestre, em juros compostos, é de',
    alternatives: alts('6%', '9,27%', '6,09%', '106,09%', '1,5%'),
    answer: 'C',
    hints: [
      'Um semestre tem dois trimestres. Em juros compostos, as taxas de períodos seguidos não se somam: os fatores de crescimento se multiplicam.',
      'Calcule o fator de crescimento em um semestre multiplicando o fator de um trimestre por ele mesmo.',
    ],
    solution: [
      'Um semestre corresponde a 2 trimestres.',
      'Fator de crescimento em um semestre: 1,03 × 1,03 = 1,03² = 1,0609.',
      'Taxa semestral equivalente: 1,0609 − 1 = 0,0609 = 6,09%.',
      'Armadilhas: 3% + 3% = 6% ignora o juro sobre juro; 9,27% corresponde a três trimestres (1,03³ ≈ 1,0927); 106,09% esquece de subtrair 1 do fator; 1,5% divide a taxa em vez de acumulá-la.',
    ],
    concept:
      'Taxas equivalentes em juros compostos: se i é a taxa de um período, a taxa correspondente a k desses períodos é (1 + i)ᵏ − 1, e não k × i.',
    estimatedSeconds: 45,
    source: AUTORAL,
    verify: () => (Math.pow(1 + 0.03, 2) - 1) * 100,
    tolerance: 0.005,
  },
  {
    id: 'FIN-203',
    topic: 'financeira',
    subtopic: 'juros-compostos',
    difficulty: 1,
    skills: ['H3', 'H21'],
    stem: [
      {
        kind: 'p',
        text: 'Luana é manicure autônoma e precisou de R$ 800,00 para comprar uma autoclave, aparelho usado para esterilizar alicates. Ela pegou o valor emprestado em uma financeira, a juros compostos de 5% ao mês, para pagar tudo de uma vez, 2 meses depois.',
      },
    ],
    ask: 'Quanto Luana pagará apenas de juros nesse empréstimo?',
    alternatives: alts('R$ 80,00', 'R$ 882,00', 'R$ 40,00', 'R$ 42,00', 'R$ 82,00'),
    answer: 'E',
    hints: [
      'Os juros do 2º mês são calculados sobre a dívida do fim do 1º mês, que já inclui os juros do 1º mês.',
      'Calcule a dívida ao final do 1º mês: 800 × 1,05.',
    ],
    solution: [
      'Fim do 1º mês: 800 × 1,05 = R$ 840,00 (juros de R$ 40,00).',
      'Fim do 2º mês: 840 × 1,05 = R$ 882,00 (juros de R$ 42,00 nesse mês).',
      'Juros totais: 882 − 800 = R$ 82,00.',
      'Armadilhas: R$ 80,00 seriam os juros simples (2 × 40); R$ 882,00 é o valor total pago, e não só os juros; R$ 40,00 e R$ 42,00 são os juros de apenas um dos meses.',
    ],
    concept:
      'Em juros compostos, os juros totais são J = M − C = C × [(1 + i)ⁿ − 1]. A partir do 2º período, eles superam os juros simples de mesma taxa, por causa do juro sobre juro.',
    estimatedSeconds: 50,
    source: AUTORAL,
    verify: () => 800 * Math.pow(1 + 0.05, 2) - 800,
    tolerance: 0.005,
  },
  {
    id: 'FIN-204',
    topic: 'financeira',
    subtopic: 'juros-compostos',
    difficulty: 2,
    skills: ['H21', 'H23'],
    stem: [
      {
        kind: 'p',
        text: 'Lucas, estudante de Engenharia, quer aplicar por 2 anos o dinheiro que juntou no estágio, sem fazer retiradas. O banco em que ele tem conta oferece um CDB que rende 12% ao ano, no regime de juros compostos.',
      },
      {
        kind: 'p',
        text: 'Uma cooperativa de crédito oferece outra aplicação, que rende juros simples a uma taxa anual fixa.',
      },
    ],
    ask: 'Para que as duas aplicações resultem no mesmo montante ao final dos 2 anos, a taxa anual de juros simples da cooperativa deve ser de',
    alternatives: alts('12%', '12,72%', '25,44%', '13,44%', '24%'),
    answer: 'B',
    hints: [
      'Para que os montantes sejam iguais, qualquer que seja o valor aplicado, as duas aplicações devem multiplicar o capital pelo mesmo fator em 2 anos.',
      'Calcule primeiro o rendimento total do CDB em 2 anos, em porcentagem do capital: 1,12² − 1.',
    ],
    solution: [
      'CDB (compostos): fator em 2 anos = 1,12² = 1,2544, ou seja, rendimento de 25,44% no período.',
      'Cooperativa (simples): em 2 anos, o rendimento é 2 × i.',
      '2 × i = 25,44%, logo i = 12,72% ao ano.',
      'Armadilhas: 12% ignora o juro sobre juro; 25,44% é a taxa dos 2 anos, e não a anual; 24% é o rendimento simples de 12% ao ano em 2 anos; 13,44% é o rendimento só do 2º ano em relação ao capital inicial (25,44% − 12%), e não a média anual.',
    ],
    concept:
      'Para comparar regimes, igualam-se os fatores de crescimento: 1 + i × t nos juros simples e (1 + i)ᵗ nos compostos. Para prazos maiores que um período, a taxa simples precisa ser maior para empatar com a composta.',
    estimatedSeconds: 100,
    source: AUTORAL,
    verify: () => ((Math.pow(1 + 0.12, 2) - 1) / 2) * 100,
    tolerance: 0.005,
  },
  {
    id: 'FIN-205',
    topic: 'financeira',
    subtopic: 'juros-compostos',
    difficulty: 2,
    skills: ['H2', 'H21'],
    stem: [
      {
        kind: 'p',
        text: 'Aos 30 anos, a enfermeira Simone aplicou R$ 6.000,00 em um fundo de previdência privada. Suponha que o fundo renda 9% ao ano, no regime de juros compostos, e que ela não faça novos depósitos nem retiradas.',
      },
      {
        kind: 'p',
        text: 'A essa taxa, um capital dobra, aproximadamente, a cada 8 anos.',
      },
      { kind: 'math', lines: ['Use: 1,09⁸ ≈ 2'] },
    ],
    ask: 'De acordo com essa aproximação, quando Simone completar 54 anos, o saldo da aplicação será de',
    alternatives: alts('R$ 24.000,00', 'R$ 36.000,00', 'R$ 18.960,00', 'R$ 48.000,00', 'R$ 96.000,00'),
    answer: 'D',
    hints: [
      'Dobrar a cada 8 anos não significa ganhar um valor fixo a cada 8 anos: o saldo é multiplicado por 2 a cada intervalo de 8 anos.',
      'Calcule quantos intervalos de 8 anos há entre os 30 e os 54 anos de Simone.',
    ],
    solution: [
      'De 30 a 54 anos passam-se 24 anos, ou seja, 24 ÷ 8 = 3 intervalos de 8 anos.',
      'A cada intervalo, o saldo dobra: 6.000 → 12.000 → 24.000 → 48.000.',
      'Em uma só conta: 6.000 × 1,09²⁴ = 6.000 × (1,09⁸)³ ≈ 6.000 × 2³ = R$ 48.000,00.',
      'Armadilhas: somar R$ 6.000,00 a cada 8 anos dá R$ 24.000,00 (crescimento linear); multiplicar por 2 × 3 = 6 dá R$ 36.000,00; contar 4 duplicações (aos 30, 38, 46 e 54 anos) dá R$ 96.000,00; juros simples de 9% ao ano por 24 anos dariam 6.000 × 3,16 = R$ 18.960,00.',
    ],
    concept:
      'Tempo de duplicação: se (1 + i)ᵏ ≈ 2, o capital dobra a cada k períodos; depois de m intervalos de k períodos, ele fica multiplicado por 2ᵐ.',
    estimatedSeconds: 90,
    source: AUTORAL,
    verify: () => 6000 * Math.pow(2, (54 - 30) / 8),
  },
  {
    id: 'FIN-206',
    topic: 'financeira',
    subtopic: 'juros-compostos',
    difficulty: 2,
    skills: ['H3', 'H21'],
    stem: [
      {
        kind: 'p',
        text: 'A associação de moradores de um bairro de Salvador quer reformar a quadra poliesportiva comunitária daqui a 2 anos. O orçamento da reforma, que não vai mudar nesse período, é de R$ 11.664,00.',
      },
      {
        kind: 'p',
        text: 'A tesoureira vai aplicar hoje uma única quantia em um investimento que rende 8% ao ano, no regime de juros compostos, de modo que o saldo, ao final dos 2 anos, seja exatamente o valor do orçamento.',
      },
    ],
    ask: 'A quantia que a tesoureira deve aplicar hoje é',
    alternatives: alts('R$ 10.000,00', 'R$ 10.055,17', 'R$ 9.797,76', 'R$ 10.800,00', 'R$ 9.723,11'),
    answer: 'A',
    hints: [
      'Os R$ 11.664,00 já incluem os juros dos 2 anos, e esses juros incidem sobre a quantia aplicada hoje, que é desconhecida.',
      'Escreva o saldo final como C × 1,08² e calcule o valor de 1,08².',
    ],
    solution: [
      'Em 2 anos, a quantia aplicada é multiplicada por 1,08² = 1,1664.',
      'C × 1,1664 = 11.664, logo C = 11.664 ÷ 1,1664 = R$ 10.000,00.',
      'Conferência: 10.000 → 10.800 → 11.664.',
      'Armadilhas: descontar 16,64% de R$ 11.664,00 dá R$ 9.723,11 e descontar 16% dá R$ 9.797,76, mas os juros incidem sobre o capital, e não sobre o valor final; dividir por 1,16 (juros simples) dá R$ 10.055,17; dividir só por 1,08 volta apenas 1 ano, dando R$ 10.800,00.',
    ],
    concept:
      'Valor presente em juros compostos: para ter o montante M daqui a n períodos, é preciso aplicar hoje C = M ÷ (1 + i)ⁿ.',
    estimatedSeconds: 100,
    source: AUTORAL,
    verify: () => 11664 / Math.pow(1 + 0.08, 2),
    tolerance: 0.005,
  },
  {
    id: 'FIN-207',
    topic: 'financeira',
    subtopic: 'juros-compostos',
    difficulty: 3,
    skills: ['H21', 'H23'],
    stem: [
      {
        kind: 'p',
        text: 'Rafaela tem uma padaria em Belém e precisa de R$ 20.000,00 para comprar um forno novo. Ela vai quitar o empréstimo em um único pagamento, 12 meses depois de recebê-lo, e recebeu duas propostas, ambas no regime de juros compostos:',
      },
      {
        kind: 'table',
        header: ['Proposta', 'Taxa de juros'],
        rows: [
          ['Banco X', '1,5% ao mês'],
          ['Banco Y', '19% ao ano'],
        ],
      },
      { kind: 'math', lines: ['Use: 1,015¹² ≈ 1,1956'] },
    ],
    ask: 'Escolhendo a proposta mais barata, quanto Rafaela pagará a menos do que pagaria na outra?',
    alternatives: alts('R$ 200,00', 'R$ 312,00', 'R$ 3.912,00', 'R$ 3.800,00', 'R$ 112,00'),
    answer: 'E',
    hints: [
      'Para comparar taxas de períodos diferentes, converta-as para o mesmo período; em juros compostos, isso não se faz multiplicando a taxa mensal por 12.',
      'Calcule quanto Rafaela pagaria no banco X ao final de 12 meses, usando o valor de 1,015¹² dado.',
    ],
    solution: [
      'Banco X: 20.000 × 1,015¹² ≈ 20.000 × 1,1956 = R$ 23.912,00 (taxa anual equivalente de cerca de 19,56%).',
      'Banco Y: 20.000 × 1,19 = R$ 23.800,00.',
      'A proposta mais barata é a do banco Y, e a diferença é 23.912 − 23.800 = R$ 112,00.',
      'Armadilha: converter 1,5% ao mês em 12 × 1,5% = 18% ao ano faz o banco X parecer mais barato (R$ 23.600,00, com diferença de R$ 200,00 a favor dele), mas em juros compostos a taxa anual equivalente a 1,5% ao mês passa de 19%.',
      'R$ 312,00 é a diferença entre juros compostos e simples no próprio banco X; R$ 3.912,00 e R$ 3.800,00 são os juros de cada proposta, e não a economia.',
    ],
    concept:
      'Para comparar taxas compostas de períodos diferentes, use taxas equivalentes: a taxa anual equivalente a uma taxa mensal i é (1 + i)¹² − 1, sempre maior que 12 × i.',
    estimatedSeconds: 180,
    source: AUTORAL,
    // Usa a aproximação 1,015¹² ≈ 1,1956 do enunciado (o valor exato daria R$ 112,36).
    verify: () => 20000 * 1.1956 - 20000 * (1 + 0.19),
    tolerance: 0.01,
  },
  {
    id: 'FIN-208',
    topic: 'financeira',
    subtopic: 'juros-compostos',
    difficulty: 3,
    skills: ['H3', 'H21'],
    stem: [
      {
        kind: 'p',
        text: 'Dona Teresa, aposentada, aplicou R$ 30.000,00 recebidos de uma indenização em um investimento que rende 7% ao ano, no regime de juros compostos.',
      },
      {
        kind: 'p',
        text: 'Ao final do 2º ano, ela retirou R$ 10.000,00 para pagar a cirurgia de catarata do marido e deixou o restante aplicado, nas mesmas condições. Ela não fez nenhum outro depósito nem retirada.',
      },
      { kind: 'math', lines: ['Use: 1,07² = 1,1449'] },
    ],
    ask: 'Ao final do 4º ano, contado a partir da aplicação inicial, o saldo de Dona Teresa, arredondado aos centavos, será de',
    alternatives: alts('R$ 29.323,88', 'R$ 27.588,00', 'R$ 27.874,88', 'R$ 26.215,92', 'R$ 27.755,58'),
    answer: 'C',
    hints: [
      'Divida o problema em duas fases, antes e depois da retirada: o dinheiro retirado deixa de render a partir do fim do 2º ano.',
      'Calcule o saldo ao final do 2º ano, antes da retirada: 30.000 × 1,07².',
    ],
    solution: [
      'Saldo ao final do 2º ano: 30.000 × 1,1449 = R$ 34.347,00.',
      'Após a retirada: 34.347 − 10.000 = R$ 24.347,00.',
      'Esse valor rende mais 2 anos: 24.347 × 1,1449 = 27.874,8803, ou seja, R$ 27.874,88.',
      'Armadilhas: descontar a retirada só no fim (30.000 × 1,07⁴ − 10.000) dá R$ 29.323,88, e descontá-la logo no início (20.000 × 1,07⁴) dá R$ 26.215,92, mas os R$ 10.000,00 renderam exatamente 2 anos; usar juros simples na 2ª fase (24.347 × 1,14) dá R$ 27.755,58, e usar juros simples nas duas fases dá R$ 27.588,00.',
    ],
    concept:
      'Com retiradas ou depósitos no meio do prazo, o montante é calculado por etapas: cada valor rende juros compostos apenas durante o tempo em que permanece aplicado.',
    estimatedSeconds: 210,
    source: AUTORAL,
    verify: () => (30000 * Math.pow(1 + 0.07, 2) - 10000) * Math.pow(1 + 0.07, 2),
    tolerance: 0.005,
  },
  {
    id: 'FIN-209',
    topic: 'financeira',
    subtopic: 'juros-compostos',
    difficulty: 3,
    skills: ['H21', 'H23'],
    stem: [
      {
        kind: 'p',
        text: 'Jorge pegou R$ 1.500,00 emprestados em uma financeira para pagar a matrícula de um curso técnico. O contrato não tem parcelas fixas: a dívida é corrigida ao final de cada mês, a juros compostos de 3% ao mês, e Jorge pode quitá-la, de uma só vez, ao final de qualquer mês.',
      },
      {
        kind: 'p',
        text: 'Ele quer quitar a dívida enquanto ela ainda for menor que o dobro do valor emprestado.',
      },
      { kind: 'math', lines: ['Use: log 2 ≈ 0,301 e log 1,03 ≈ 0,0128'] },
    ],
    ask: 'O maior número inteiro de meses que Jorge pode esperar para quitar a dívida, de modo que ela ainda seja menor que o dobro do valor emprestado, é',
    alternatives: alts('24 meses', '23 meses', '10 meses', '33 meses', '34 meses'),
    answer: 'B',
    hints: [
      'Após n meses, a dívida é 1.500 × 1,03ⁿ. Ela atinge o dobro quando 1,03ⁿ chega a 2, e os logaritmos permitem isolar o expoente n.',
      'Aplique o logaritmo aos dois lados de 1,03ⁿ = 2, obtendo n × log 1,03 = log 2.',
    ],
    solution: [
      'A dívida atinge o dobro quando 1.500 × 1,03ⁿ = 3.000, ou seja, quando 1,03ⁿ = 2.',
      'Aplicando logaritmo: n × log 1,03 = log 2, logo n ≈ 0,301 ÷ 0,0128 ≈ 23,5 meses.',
      'Assim, ao final do 23º mês a dívida ainda não dobrou (1,03²³ ≈ 1,97), mas ao final do 24º mês ela já passou do dobro (1,03²⁴ ≈ 2,03).',
      'Logo, Jorge pode esperar no máximo 23 meses. Responder 24 meses é tomar o primeiro mês em que a dívida já dobrou.',
      'Armadilhas: com juros simples, a dívida dobraria em 100 ÷ 3 ≈ 33,3 meses, o que leva a 33 ou 34 meses; dividir 0,301 por 0,03, usando a taxa no lugar de log 1,03, dá cerca de 10 meses.',
    ],
    concept:
      'Para achar o tempo em juros compostos, resolve-se (1 + i)ⁿ = M ÷ C com logaritmos: n = log(M ÷ C) ÷ log(1 + i). Como o prazo é contado em períodos inteiros, o resultado decimal precisa ser interpretado.',
    estimatedSeconds: 180,
    source: AUTORAL,
    verify: () => {
      let n = 0;
      while (Math.pow(1 + 0.03, n + 1) < 2) n += 1;
      return n;
    },
  },
  {
    id: 'FIN-210',
    topic: 'financeira',
    subtopic: 'juros-compostos',
    difficulty: 3,
    skills: ['H21', 'H24'],
    stem: [
      {
        kind: 'p',
        text: 'Uma cooperativa de catadores de materiais recicláveis de Curitiba aplicou R$ 32.000,00 do seu fundo de reserva. A aplicação rende juros a uma taxa anual fixa, e a cooperativa não fez depósitos nem retiradas. O extrato, porém, não informa se o regime é de juros simples ou de juros compostos.',
      },
      {
        kind: 'table',
        header: ['Momento', 'Saldo'],
        rows: [
          ['Aplicação inicial', 'R$ 32.000,00'],
          ['Fim do 1º ano', 'R$ 33.600,00'],
          ['Fim do 2º ano', 'R$ 35.280,00'],
        ],
        caption: 'Extrato da aplicação',
      },
    ],
    ask: 'Mantidas as mesmas condições, o saldo dessa aplicação ao final do 4º ano será de',
    alternatives: alts('R$ 38.400,00', 'R$ 38.880,00', 'R$ 37.044,00', 'R$ 38.896,20', 'R$ 38.640,00'),
    answer: 'D',
    hints: [
      'Compare os juros de cada ano: com taxa fixa em juros simples, eles seriam sempre iguais; se crescem, os juros de um ano também rendem nos anos seguintes.',
      'Calcule os juros do 1º e do 2º ano e verifique que porcentagem do saldo anterior cada um representa.',
    ],
    solution: [
      'Juros do 1º ano: 33.600 − 32.000 = R$ 1.600,00, que são 5% de R$ 32.000,00.',
      'Juros do 2º ano: 35.280 − 33.600 = R$ 1.680,00, que são 5% de R$ 33.600,00.',
      'Os juros cresceram e correspondem sempre a 5% do saldo anterior: o regime é de juros compostos, com taxa de 5% ao ano.',
      'Fim do 3º ano: 35.280 × 1,05 = R$ 37.044,00. Fim do 4º ano: 37.044 × 1,05 = R$ 38.896,20.',
      'Armadilhas: supor juros simples (R$ 1.600,00 por ano) dá R$ 38.400,00; repetir os juros do 2º ano dá 35.280 + 2 × 1.680 = R$ 38.640,00; supor que os juros aumentam R$ 80,00 por ano dá R$ 38.880,00; R$ 37.044,00 é o saldo do fim do 3º ano.',
    ],
    concept:
      'Em juros compostos, os saldos formam uma progressão geométrica: cada um é o anterior multiplicado por (1 + i). Em juros simples, formam uma progressão aritmética, com juros iguais em todos os períodos.',
    estimatedSeconds: 180,
    source: AUTORAL,
    verify: () => 32000 * Math.pow(33600 / 32000, 4),
    tolerance: 0.005,
  },
  {
    id: 'FIN-211',
    topic: 'financeira',
    subtopic: 'juros-compostos',
    difficulty: 3,
    skills: ['H21', 'H23'],
    stem: [
      {
        kind: 'p',
        text: 'Uma pequena empresa de tecnologia de Campinas precisa de R$ 80.000,00 por 6 meses para pagar fornecedores e vai quitar a dívida em um único pagamento ao final desse prazo.',
      },
      {
        kind: 'p',
        text: 'O banco anuncia uma taxa de 12,36% ao ano, no regime de juros compostos, e informa que, para prazos menores que um ano, aplica a taxa equivalente ao período, também em juros compostos.',
      },
      { kind: 'math', lines: ['Observe que: 1,06² = 1,1236'] },
    ],
    ask: 'O valor que a empresa pagará ao banco ao final dos 6 meses será de',
    alternatives: alts('R$ 84.800,00', 'R$ 84.944,00', 'R$ 89.888,00', 'R$ 4.800,00', 'R$ 4.944,00'),
    answer: 'A',
    hints: [
      'Seis meses correspondem a meio ano. Em juros compostos, a taxa semestral equivalente é aquela que, aplicada em dois semestres seguidos, produz a taxa anual.',
      'Escreva a relação entre os fatores: (fator semestral)² = fator anual = 1,1236.',
    ],
    solution: [
      'Em juros compostos, dois semestres seguidos equivalem a um ano: (1 + i_s)² = 1,1236.',
      'Como 1,06² = 1,1236, o fator semestral é 1,06, isto é, a taxa semestral equivalente é 6%.',
      'Valor a pagar: 80.000 × 1,06 = R$ 84.800,00.',
      'Armadilhas: usar a taxa proporcional (12,36% ÷ 2 = 6,18%), que é o cálculo de juros simples, dá R$ 84.944,00; aplicar a taxa anual inteira dá R$ 89.888,00; R$ 4.800,00 e R$ 4.944,00 são apenas os juros, sem o capital.',
      'Observe que, em prazos menores que o período da taxa, os juros compostos ficam abaixo dos juros simples de mesma taxa.',
    ],
    concept:
      'Taxa equivalente para uma fração do período: se a taxa anual é I, a taxa semestral equivalente i satisfaz (1 + i)² = 1 + I. Em prazos menores que um período, o fator composto é menor que o fator simples.',
    estimatedSeconds: 150,
    source: AUTORAL,
    verify: () => 80000 * Math.sqrt(1 + 0.1236),
    tolerance: 0.005,
  },
]);
