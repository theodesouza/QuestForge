import { AUTORAL, alts, batch } from '../_helpers';

/**
 * Missão r2-m3 — questões extras para repetição (lote a): compras à vista e a prazo e
 * custo-benefício (FIN-301 a FIN-310). Questões autorais.
 */
export const MISSAO_R2M3_A = batch([
  {
    id: 'FIN-301',
    topic: 'financeira',
    subtopic: 'compras-a-prazo',
    difficulty: 2,
    skills: ['H3', 'H16'],
    stem: [
      {
        kind: 'p',
        text: 'Seu Antônio é dono de uma pequena farmácia em Cuiabá (MT) e quer instalar um aparelho de ar-condicionado na loja. O aparelho escolhido custa R$ 2.400,00 à vista.',
      },
      {
        kind: 'p',
        text: 'No crediário da loja de eletrodomésticos, o cliente paga, no ato da compra, uma entrada de 25% do preço à vista. O restante (saldo) recebe um acréscimo de 12% e é dividido em 8 parcelas mensais iguais.',
      },
    ],
    ask: 'Qual será o valor de cada parcela mensal?',
    alternatives: alts('R$ 225,00', 'R$ 336,00', 'R$ 252,00', 'R$ 327,00', 'R$ 261,00'),
    answer: 'C',
    hints: [
      'O acréscimo de 12% não incide sobre o preço inteiro: a entrada é paga no ato e fica fora do parcelamento.',
      'Comece calculando a entrada (25% de R$ 2.400,00) e o saldo que sobra para ser parcelado.',
    ],
    solution: [
      'Entrada: 0,25 × 2.400 = R$ 600,00.',
      'Saldo a parcelar: 2.400 − 600 = R$ 1.800,00.',
      'Saldo com acréscimo de 12%: 1.800 × 1,12 = R$ 2.016,00.',
      'Valor de cada parcela: 2.016 ÷ 8 = R$ 252,00.',
      'Armadilhas: sem o acréscimo, a parcela seria 1.800 ÷ 8 = R$ 225,00; aplicar os 12% ao preço inteiro e esquecer a entrada dá 2.688 ÷ 8 = R$ 336,00; aplicar os 12% ao preço inteiro e depois descontar a entrada dá (2.688 − 600) ÷ 8 = R$ 261,00; e dividir por 8 o total pago, entrada incluída, dá (600 + 2.016) ÷ 8 = R$ 327,00.',
    ],
    concept:
      'No crediário com entrada, o acréscimo incide apenas sobre o saldo (preço à vista − entrada); cada parcela é esse saldo corrigido dividido pelo número de parcelas.',
    estimatedSeconds: 75,
    source: AUTORAL,
    verify: () => {
      const entrada = 0.25 * 2400;
      const saldo = 2400 - entrada;
      return (saldo * 1.12) / 8;
    },
  },
  {
    id: 'FIN-302',
    topic: 'financeira',
    subtopic: 'custo-beneficio',
    difficulty: 2,
    skills: ['H3', 'H25'],
    stem: [
      {
        kind: 'p',
        text: 'Priscila é mãe de um bebê de 10 meses que usa, em média, 6 fraldas por dia. Na farmácia do bairro, a mesma marca e o mesmo tamanho de fralda são vendidos em duas embalagens:',
      },
      {
        kind: 'table',
        header: ['Embalagem', 'Quantidade', 'Preço'],
        rows: [
          ['Pacote', '30 fraldas', 'R$ 39,00'],
          ['Pacotão', '90 fraldas', 'R$ 103,50'],
        ],
      },
      {
        kind: 'p',
        text: 'Priscila vai comprar, de uma só vez e sem sobras, as fraldas necessárias para 30 dias, usando apenas um dos dois tipos de embalagem.',
      },
    ],
    ask: 'Escolhendo a embalagem com o menor preço por fralda, quanto Priscila economizará nessa compra, em relação à outra embalagem?',
    alternatives: alts('R$ 27,00', 'R$ 13,50', 'R$ 64,50', 'R$ 4,50', 'R$ 0,90'),
    answer: 'A',
    hints: [
      'Para comparar embalagens de tamanhos diferentes, descubra quanto custa cada fralda em cada uma delas e quantas fraldas Priscila vai usar nos 30 dias.',
      'Primeiro passo: calcule o total de fraldas do mês (6 por dia durante 30 dias) e o preço de uma fralda em cada embalagem.',
    ],
    solution: [
      'Total de fraldas em 30 dias: 6 × 30 = 180 fraldas.',
      'Preço por fralda: no pacote, 39,00 ÷ 30 = R$ 1,30; no pacotão, 103,50 ÷ 90 = R$ 1,15. O pacotão é mais vantajoso.',
      'Só com pacotes: 180 ÷ 30 = 6 pacotes, que custam 6 × 39,00 = R$ 234,00.',
      'Só com pacotões: 180 ÷ 90 = 2 pacotões, que custam 2 × 103,50 = R$ 207,00.',
      'Economia: 234,00 − 207,00 = R$ 27,00 (o mesmo que 180 × 0,15).',
      'Armadilhas: R$ 64,50 é só a diferença entre os preços das embalagens, que têm quantidades diferentes; R$ 13,50 é a economia de um único pacotão em relação a 3 pacotes; R$ 4,50 multiplica a diferença por fralda (R$ 0,15) por 30 dias, esquecendo as 6 fraldas diárias; e R$ 0,90 é a economia de apenas um dia.',
    ],
    concept:
      'Preço unitário = preço da embalagem ÷ quantidade. A economia total é a diferença entre os preços unitários multiplicada pela quantidade consumida.',
    estimatedSeconds: 75,
    source: AUTORAL,
    verify: () => {
      const fraldas = 6 * 30;
      return (fraldas / 30) * 39 - (fraldas / 90) * 103.5;
    },
  },
  {
    id: 'FIN-303',
    topic: 'financeira',
    subtopic: 'compras-a-prazo',
    difficulty: 2,
    skills: ['H3', 'H25'],
    stem: [
      {
        kind: 'p',
        text: 'Maurício trabalha com entregas em Manaus (AM) e quer comprar uma bicicleta elétrica. Nas três lojas que ele pesquisou, o preço à vista é o mesmo, R$ 4.200,00, mas as condições a prazo são diferentes:',
      },
      {
        kind: 'table',
        header: ['Loja', 'Entrada', 'Parcelas mensais'],
        rows: [
          ['Norte Bikes', 'Sem entrada', '12 × R$ 389,00'],
          ['Rio Negro', 'R$ 900,00', '10 × R$ 375,00'],
          ['Ponta Negra', 'R$ 1.500,00', '6 × R$ 520,00'],
        ],
      },
      {
        kind: 'p',
        text: 'Maurício vai comprar a prazo e escolherá a loja em que o valor total pago, somando entrada e parcelas, for o menor.',
      },
    ],
    ask: 'Na loja escolhida, quanto Maurício pagará a mais do que o preço à vista?',
    alternatives: alts('R$ 468,00', 'R$ 48,00', 'R$ 450,00', 'R$ 4.620,00', 'R$ 420,00'),
    answer: 'E',
    hints: [
      'A menor parcela nem sempre corresponde ao menor custo: o que importa é o total desembolsado em cada loja, com a entrada incluída.',
      'Primeiro passo: em cada loja, multiplique o número de parcelas pelo valor da parcela e some a entrada.',
    ],
    solution: [
      'Norte Bikes: 12 × 389 = R$ 4.668,00.',
      'Rio Negro: 900 + 10 × 375 = 900 + 3.750 = R$ 4.650,00.',
      'Ponta Negra: 1.500 + 6 × 520 = 1.500 + 3.120 = R$ 4.620,00.',
      'O menor total é o da Ponta Negra, R$ 4.620,00, que supera o preço à vista em 4.620 − 4.200 = R$ 420,00.',
      'Armadilhas: escolher a loja de menor parcela (Rio Negro) leva a R$ 450,00 a mais, e a loja sem entrada, a R$ 468,00; R$ 48,00 é a diferença entre o maior e o menor total a prazo; e R$ 4.620,00 é o total pago, não o valor pago a mais.',
    ],
    concept:
      'Para comparar condições de pagamento, soma-se tudo o que será pago (entrada + número de parcelas × valor da parcela). O valor pago a mais é a diferença entre esse total e o preço à vista.',
    estimatedSeconds: 90,
    source: AUTORAL,
    verify: () => Math.min(12 * 389, 900 + 10 * 375, 1500 + 6 * 520) - 4200,
  },
  {
    id: 'FIN-304',
    topic: 'financeira',
    subtopic: 'custo-beneficio',
    difficulty: 2,
    skills: ['H3', 'H16'],
    stem: [
      {
        kind: 'p',
        text: 'Daniela treina corrida de rua em Florianópolis (SC) e planeja correr 1.800 km nos próximos 12 meses. Ela vai escolher entre dois modelos de tênis de corrida, considerando o preço e a durabilidade indicada pelo fabricante, isto é, quantos quilômetros cada par aguenta antes de precisar ser trocado:',
      },
      {
        kind: 'table',
        header: ['Modelo', 'Preço do par', 'Durabilidade'],
        rows: [
          ['Leve', 'R$ 360,00', '600 km'],
          ['Resistente', 'R$ 495,00', '900 km'],
        ],
      },
      {
        kind: 'p',
        text: 'Daniela usará sempre o mesmo modelo durante os 12 meses e trocará de par exatamente quando a durabilidade indicada for atingida.',
      },
    ],
    ask: 'Escolhendo o modelo de menor custo por quilômetro, quanto Daniela economizará nesses 12 meses, em relação ao outro modelo?',
    alternatives: alts('R$ 135,00', 'R$ 45,00', 'R$ 0,05', 'R$ 90,00', 'R$ 990,00'),
    answer: 'D',
    hints: [
      'O par mais barato não é necessariamente o mais econômico: compare quanto cada modelo custa por quilômetro corrido.',
      'Primeiro passo: divida o preço de cada par pela sua durabilidade e, depois, calcule quantos pares de cada modelo seriam necessários para 1.800 km.',
    ],
    solution: [
      'Custo por quilômetro: modelo Leve, 360 ÷ 600 = R$ 0,60/km; modelo Resistente, 495 ÷ 900 = R$ 0,55/km. O Resistente é mais vantajoso.',
      'Leve: 1.800 ÷ 600 = 3 pares, que custam 3 × 360 = R$ 1.080,00.',
      'Resistente: 1.800 ÷ 900 = 2 pares, que custam 2 × 495 = R$ 990,00.',
      'Economia: 1.080 − 990 = R$ 90,00 (o mesmo que 1.800 × 0,05).',
      'Armadilhas: R$ 135,00 é a diferença de preço de um único par, que faz o modelo Leve parecer mais barato; R$ 45,00 é a economia em apenas 900 km; R$ 0,05 é a economia por quilômetro; e R$ 990,00 é o gasto total com o modelo Resistente.',
    ],
    concept:
      'Custo por uso = preço ÷ número de usos (aqui, os quilômetros de durabilidade). Um produto mais caro pode sair mais barato se durar proporcionalmente mais.',
    estimatedSeconds: 75,
    source: AUTORAL,
    verify: () => (1800 / 600) * 360 - (1800 / 900) * 495,
  },
  {
    id: 'FIN-305',
    topic: 'financeira',
    subtopic: 'compras-a-prazo',
    difficulty: 3,
    skills: ['H3', 'H21'],
    stem: [
      {
        kind: 'p',
        text: 'Everton quer comprar uma televisão que custa R$ 3.000,00 à vista. No crediário da loja, o próprio cliente escolhe o valor da entrada, paga no ato da compra. O saldo restante (preço à vista menos a entrada) recebe um acréscimo de 15% e é dividido em 10 parcelas mensais iguais.',
      },
      {
        kind: 'p',
        text: 'Pelas contas do orçamento da família, Everton pode pagar, no máximo, R$ 230,00 por mês de parcela.',
      },
    ],
    ask: 'Qual é o menor valor de entrada que Everton precisa dar para que cada parcela não passe de R$ 230,00?',
    alternatives: alts('R$ 700,00', 'R$ 1.000,00', 'R$ 1.045,00', 'R$ 2.000,00', 'R$ 1.150,00'),
    answer: 'B',
    hints: [
      'Pense de trás para frente: o limite da parcela define o maior total que Everton pode pagar nas 10 parcelas, e esse total já inclui o acréscimo de 15% sobre o saldo.',
      'Primeiro passo: calcule o total máximo das 10 parcelas e descubra qual saldo, acrescido de 15%, resulta nesse valor.',
    ],
    solution: [
      'Total máximo das parcelas: 10 × 230 = R$ 2.300,00.',
      'Esse total é o saldo com acréscimo de 15%: 1,15 × saldo = 2.300, logo saldo = 2.300 ÷ 1,15 = R$ 2.000,00.',
      'Entrada mínima: 3.000 − 2.000 = R$ 1.000,00.',
      'Conferência: (3.000 − 1.000) × 1,15 = 2.300 e 2.300 ÷ 10 = R$ 230,00 por parcela.',
      'Armadilhas: ignorar o acréscimo leva a 3.000 − 2.300 = R$ 700,00; tirar 15% de 2.300 (2.300 × 0,85 = 1.955) leva a R$ 1.045,00, mas o acréscimo incide sobre o saldo, e não sobre o total das parcelas; aplicar os 15% ao preço inteiro dá 3.450 − 2.300 = R$ 1.150,00; e R$ 2.000,00 é o saldo financiado, não a entrada.',
    ],
    concept:
      'Se o saldo financiado recebe um acréscimo de p%, o total das parcelas é saldo × (1 + p/100). Para voltar do total ao saldo, divide-se por (1 + p/100); descontar p% do total não desfaz o acréscimo.',
    estimatedSeconds: 120,
    source: AUTORAL,
    verify: () => 3000 - (10 * 230) / 1.15,
    tolerance: 0.01,
  },
  {
    id: 'FIN-306',
    topic: 'financeira',
    subtopic: 'custo-beneficio',
    difficulty: 2,
    skills: ['H3', 'H18'],
    stem: [
      {
        kind: 'p',
        text: 'Vinícius estuda à noite em uma faculdade de Belo Horizonte (MG) e vai de ônibus às aulas, de segunda a sexta-feira. Em cada dia de aula, ele faz 2 viagens (ida e volta). Além disso, faz, ao todo, 6 viagens por mês nos fins de semana.',
      },
      {
        kind: 'p',
        text: 'Cada viagem custa R$ 5,50. A empresa de ônibus também vende um passe mensal de R$ 240,00, que dá direito a viagens ilimitadas durante o mês. Considere um mês com 22 dias de aula.',
      },
    ],
    ask: 'Nesse mês, quanto Vinícius economizará se comprar o passe mensal, em vez de pagar cada viagem separadamente?',
    alternatives: alts('R$ 2,00', 'R$ 90,00', 'R$ 275,00', 'R$ 0,70', 'R$ 35,00'),
    answer: 'E',
    hints: [
      'Conte todas as viagens do mês, inclusive as dos fins de semana, e compare o custo delas com o preço do passe.',
      'Primeiro passo: calcule o número de viagens nos dias de aula (22 dias × 2 viagens) e some as viagens dos fins de semana.',
    ],
    solution: [
      'Viagens nos dias de aula: 22 × 2 = 44.',
      'Total de viagens no mês: 44 + 6 = 50.',
      'Custo pagando cada viagem: 50 × 5,50 = R$ 275,00.',
      'Economia com o passe: 275,00 − 240,00 = R$ 35,00.',
      'Armadilhas: esquecer as viagens dos fins de semana dá 44 × 5,50 = R$ 242,00 e uma economia de só R$ 2,00; contar 2 viagens em todos os 30 dias do mês dá 60 × 5,50 = R$ 330,00 e R$ 90,00 de economia; R$ 275,00 é o custo sem o passe; e R$ 0,70 é a economia média por viagem.',
    ],
    concept:
      'Um passe de valor fixo compensa quando o número de usos multiplicado pela tarifa avulsa supera o preço do passe; a economia é a diferença entre esses dois valores.',
    estimatedSeconds: 60,
    source: AUTORAL,
    verify: () => (22 * 2 + 6) * 5.5 - 240,
  },
  {
    id: 'FIN-307',
    topic: 'financeira',
    subtopic: 'compras-a-prazo',
    difficulty: 3,
    skills: ['H21', 'H23'],
    stem: [
      {
        kind: 'p',
        text: 'Elaine é auxiliar de cozinha em São Luís (MA) e recebe salário de R$ 2.000,00. Ela quer comprar uma cama box com colchão que custa R$ 3.000,00 à vista e decidiu que cada parcela não pode passar de 25% do seu salário.',
      },
      {
        kind: 'p',
        text: 'O crediário da loja não exige entrada e permite parcelar em até 12 vezes. Para n parcelas mensais, o total a prazo é o preço à vista acrescido de juros simples de 3% ao mês, calculados sobre o preço à vista durante n meses; esse total é dividido em n parcelas iguais.',
      },
    ],
    ask: 'Qual é o menor número de parcelas que Elaine pode escolher, respeitando o limite que ela estabeleceu?',
    alternatives: alts('8 parcelas', '6 parcelas', '12 parcelas', '7 parcelas', '9 parcelas'),
    answer: 'A',
    hints: [
      'Mais parcelas deixam cada parcela menor, mas também aumentam os juros: cada mês a mais acrescenta 3% do preço à vista ao total.',
      'Primeiro passo: calcule o limite de cada parcela (25% de R$ 2.000,00). Depois, observe que cada parcela é igual ao preço à vista dividido pelo número de parcelas mais os juros de um mês (3% de R$ 3.000,00).',
    ],
    solution: [
      'Limite da parcela: 0,25 × 2.000 = R$ 500,00.',
      'Com n parcelas, o total é 3.000 × (1 + 0,03n) = 3.000 + 90n; cada parcela vale (3.000 + 90n) ÷ n = 3.000 ÷ n + 90.',
      'Condição: 3.000 ÷ n + 90 ≤ 500, ou seja, 3.000 ÷ n ≤ 410, o que dá n ≥ 3.000 ÷ 410 ≈ 7,3.',
      'Como o número de parcelas é inteiro, o menor valor possível é n = 8.',
      'Conferência: com 7 parcelas, o total é 3.000 + 90 × 7 = R$ 3.630,00 e cada parcela vale 3.630 ÷ 7 ≈ R$ 518,57, mais que o limite; com 8 parcelas, o total é R$ 3.720,00 e cada parcela vale 3.720 ÷ 8 = R$ 465,00, dentro do limite.',
      'Armadilhas: ignorar os juros dá 3.000 ÷ 500 = 6 parcelas; arredondar 7,3 para baixo dá 7 parcelas, que ultrapassam o limite; calcular os juros como se o prazo fosse sempre de 12 meses (3.000 × 1,36 = 4.080 e 4.080 ÷ 500 = 8,16) leva a 9 parcelas; e 12 é o máximo permitido pela loja, não o mínimo necessário.',
    ],
    concept:
      'Quando os juros simples crescem com o prazo, a parcela é P(n) = C ÷ n + C × i. Para respeitar um teto, resolve-se a desigualdade P(n) ≤ teto e, como o número de parcelas é inteiro, arredonda-se o resultado para cima.',
    estimatedSeconds: 180,
    source: AUTORAL,
    verify: () => {
      const preco = 3000;
      const teto = 0.25 * 2000;
      let n = 1;
      while ((preco * (1 + 0.03 * n)) / n > teto) n++;
      return n;
    },
  },
  {
    id: 'FIN-308',
    topic: 'financeira',
    subtopic: 'custo-beneficio',
    difficulty: 3,
    skills: ['H16', 'H18'],
    stem: [
      {
        kind: 'p',
        text: 'Joelma tem uma pequena lavanderia em Porto Alegre (RS) e usa sempre o mesmo amaciante, vendido normalmente em galões de 5 L por R$ 45,00. Nesta semana, dois atacados da cidade fizeram promoções diferentes para esse produto:',
      },
      {
        kind: 'table',
        header: ['Atacado', 'Promoção'],
        rows: [
          ['Sul', 'Galão promocional com 20% a mais de produto (6 L), pelo preço normal de R$ 45,00'],
          ['Centro', 'Galão comum de 5 L com 20% de desconto no preço'],
        ],
      },
      {
        kind: 'p',
        text: 'Joelma precisa de exatamente 30 L de amaciante para o mês e vai comprar tudo no atacado em que o preço por litro for menor.',
      },
    ],
    ask: 'Em relação ao que gastaria comprando os mesmos 30 L no outro atacado, Joelma economizará',
    alternatives: alts('R$ 45,00', 'R$ 0,30', 'R$ 9,00', 'R$ 54,00', 'R$ 1,50'),
    answer: 'C',
    hints: [
      '“20% a mais de produto” e “20% de desconto” parecem a mesma vantagem, mas não são: compare o preço de cada litro nas duas promoções.',
      'Primeiro passo: calcule o preço por litro no Atacado Sul (R$ 45,00 por 6 L) e o preço do galão com desconto no Atacado Centro.',
    ],
    solution: [
      'Atacado Sul: 45,00 ÷ 6 = R$ 7,50 por litro.',
      'Atacado Centro: o galão sai por 45,00 × 0,80 = R$ 36,00, ou seja, 36,00 ÷ 5 = R$ 7,20 por litro. O Centro é mais vantajoso.',
      'Para 30 L: no Sul, 30 ÷ 6 = 5 galões, que custam 5 × 45,00 = R$ 225,00; no Centro, 30 ÷ 5 = 6 galões, que custam 6 × 36,00 = R$ 216,00.',
      'Economia: 225,00 − 216,00 = R$ 9,00 (o mesmo que 30 × 0,30).',
      'Por que as promoções não são equivalentes: pagar o preço de 5 L e levar 6 L reduz o preço do litro em 1/6 ≈ 16,7%, menos que os 20% do desconto direto.',
      'Armadilhas: R$ 45,00 e R$ 54,00 são as economias de cada promoção em relação ao preço normal (R$ 270,00 por 30 L), e não a diferença entre elas; R$ 0,30 é a diferença por litro; e R$ 1,50 é a diferença em um único galão de 5 L.',
    ],
    concept:
      'Levar x% a mais de produto pelo mesmo preço não equivale a x% de desconto: o preço por unidade passa a ser 1 ÷ (1 + x/100) do original. Com 20% a mais, o desconto equivalente é de cerca de 16,7%.',
    estimatedSeconds: 150,
    source: AUTORAL,
    verify: () => {
      const litros = 30;
      const gastoSul = (litros / 6) * 45;
      const gastoCentro = (litros / 5) * (45 * 0.8);
      return Math.abs(gastoSul - gastoCentro);
    },
  },
  {
    id: 'FIN-309',
    topic: 'financeira',
    subtopic: 'compras-a-prazo',
    difficulty: 4,
    skills: ['H3', 'H23'],
    stem: [
      {
        kind: 'p',
        text: 'Beatriz é personal trainer em Vitória (ES) e quer comprar uma esteira ergométrica, que custa R$ 3.000,00 à vista, para atender alunos em casa. Ela pretende pagar a compra em 5 meses e recebeu duas propostas, ambas anunciadas com “juros de 3% ao mês”:',
      },
      {
        kind: 'table',
        header: ['Proposta', 'Como funciona'],
        rows: [
          [
            'Crediário da loja',
            'Os juros são de 3% do preço à vista para cada um dos 5 meses; esses juros são somados ao preço à vista, e o total é dividido em 5 parcelas mensais iguais.',
          ],
          [
            'Empréstimo no banco',
            'Beatriz pega R$ 3.000,00 emprestados e paga a esteira à vista. Ao final de cada mês, ela devolve R$ 600,00 da dívida mais juros de 3% sobre o saldo devedor do início daquele mês.',
          ],
        ],
      },
      {
        kind: 'p',
        text: 'Nas duas propostas, não há tarifas nem outros custos, e a dívida fica totalmente quitada ao final do 5º mês.',
      },
    ],
    ask: 'Ao escolher o empréstimo no banco, em vez do crediário da loja, quanto Beatriz economizará no total?',
    alternatives: alts('R$ 270,00', 'R$ 225,00', 'R$ 450,00', 'R$ 180,00', 'R$ 36,00'),
    answer: 'D',
    hints: [
      'A taxa anunciada é a mesma, mas a base sobre a qual ela incide não é: na loja, os juros são sempre calculados sobre o preço inteiro; no banco, sobre uma dívida que diminui a cada mês.',
      'Primeiro passo: calcule os juros totais da loja (3% de R$ 3.000,00 em cada um dos 5 meses). Depois, liste o saldo devedor do banco no início de cada mês: 3.000, 2.400, 1.800…',
    ],
    solution: [
      'Crediário: juros de 0,03 × 3.000 × 5 = R$ 450,00 (total a prazo de R$ 3.450,00, em 5 parcelas de R$ 690,00).',
      'Banco: o saldo devedor no início de cada mês é de R$ 3.000,00, R$ 2.400,00, R$ 1.800,00, R$ 1.200,00 e R$ 600,00.',
      'Juros do banco, 3% de cada saldo: 90 + 72 + 54 + 36 + 18 = R$ 270,00.',
      'Economia: 450 − 270 = R$ 180,00.',
      'Armadilhas: R$ 270,00 são os juros do banco, e não a economia; supor que a dívida média no banco é a metade do valor emprestado (3% de R$ 1.500,00 por 5 meses = R$ 225,00 de juros) leva a R$ 225,00; R$ 450,00 são os juros da loja; e R$ 36,00 é a economia média por mês. Achar que a mesma taxa gera o mesmo custo é o erro conceitual principal.',
    ],
    concept:
      'A mesma taxa mensal pode gerar custos bem diferentes conforme a base de cálculo: juros sobre o valor total durante todo o prazo custam mais que juros sobre o saldo devedor, que diminui a cada parcela paga.',
    estimatedSeconds: 210,
    source: AUTORAL,
    verify: () => {
      const preco = 3000;
      const taxa = 0.03;
      const meses = 5;
      const jurosLoja = preco * taxa * meses;
      const amortizacao = preco / meses;
      let jurosBanco = 0;
      for (let k = 0; k < meses; k++) jurosBanco += (preco - k * amortizacao) * taxa;
      return jurosLoja - jurosBanco;
    },
    tolerance: 0.01,
  },
  {
    id: 'FIN-310',
    topic: 'financeira',
    subtopic: 'custo-beneficio',
    difficulty: 4,
    skills: ['H3', 'H12', 'H18'],
    stem: [
      {
        kind: 'p',
        text: 'Gilberto vai pintar as paredes internas da casa onde mora, em Juazeiro do Norte (CE). A área total de parede é de 150 m², e toda ela receberá 2 demãos de tinta. Segundo o fabricante, 1 litro de tinta rende 10 m² por demão.',
      },
      {
        kind: 'p',
        text: 'A tinta escolhida é vendida em três embalagens:',
      },
      {
        kind: 'table',
        header: ['Embalagem', 'Volume', 'Preço'],
        rows: [
          ['Lata', '18 L', 'R$ 400,00'],
          ['Galão', '3,6 L', 'R$ 95,00'],
          ['Quarto', '0,9 L', 'R$ 30,00'],
        ],
      },
      {
        kind: 'p',
        text: 'Gilberto pode combinar embalagens de tamanhos diferentes, mas só compra embalagens fechadas, e a quantidade comprada precisa ser suficiente para toda a pintura.',
      },
    ],
    ask: 'Qual é o menor gasto possível com a compra da tinta?',
    alternatives: alts('R$ 800,00', 'R$ 745,00', 'R$ 400,00', 'R$ 666,67', 'R$ 780,00'),
    answer: 'B',
    hints: [
      'A embalagem com o menor preço por litro nem sempre leva ao menor gasto: comprar tinta além do necessário também custa dinheiro.',
      'Primeiro passo: calcule quantos litros são necessários (área × número de demãos ÷ rendimento). Depois, compare combinações de embalagens que cubram esse volume com pouca sobra.',
    ],
    solution: [
      'Área a pintar, contando as 2 demãos: 150 × 2 = 300 m²; tinta necessária: 300 ÷ 10 = 30 L.',
      'Preço por litro: lata, 400 ÷ 18 ≈ R$ 22,22; galão, 95 ÷ 3,6 ≈ R$ 26,39; quarto, 30 ÷ 0,9 ≈ R$ 33,33. Convém usar latas, mas sem desperdiçar muita tinta.',
      'Duas latas (36 L) custam R$ 800,00, mas sobram 6 L.',
      'Com uma lata (18 L), faltam 12 L. Com 4 galões (14,4 L): 400 + 380 = R$ 780,00. Com 3 galões (10,8 L), ainda falta 1,2 L, coberto por 2 quartos (1,8 L): 400 + 285 + 60 = R$ 745,00. Com 2 galões e 6 quartos: 400 + 190 + 180 = R$ 770,00.',
      'Sem nenhuma lata, o mínimo seria 8 galões e 2 quartos (30,6 L): 760 + 60 = R$ 820,00.',
      'O menor gasto é de R$ 745,00, com 1 lata, 3 galões e 2 quartos, totalizando 30,6 L.',
      'Armadilhas: 30 × 22,22 ≈ R$ 666,67 supõe comprar uma fração de lata, o que não é possível; R$ 400,00 corresponde a uma única demão (15 L, atendidos por uma lata); e R$ 800,00 vem de escolher só pelo menor preço por litro, ignorando a sobra.',
    ],
    concept:
      'Em compras com embalagens fechadas, o menor preço por unidade não garante o menor gasto: é preciso comparar o custo total das combinações que atendem à quantidade necessária, levando em conta a sobra.',
    estimatedSeconds: 300,
    source: AUTORAL,
    verify: () => {
      // Volumes em decilitros para evitar erros de arredondamento.
      const necessario = ((150 * 2) / 10) * 10;
      let menor = Infinity;
      for (let lata = 0; lata <= 2; lata++)
        for (let galao = 0; galao <= 9; galao++)
          for (let quarto = 0; quarto <= 34; quarto++)
            if (lata * 180 + galao * 36 + quarto * 9 >= necessario)
              menor = Math.min(menor, lata * 400 + galao * 95 + quarto * 30);
      return menor;
    },
  },
]);
