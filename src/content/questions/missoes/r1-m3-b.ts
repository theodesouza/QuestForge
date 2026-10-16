import { AUTORAL, alts, batch } from '../_helpers';

/** Missão r1-m3 — questões extras para repetição (lote b). Questões autorais. */
export const MISSAO_R1M3_B = batch([
  {
    id: 'PCT-110',
    topic: 'porcentagem',
    subtopic: 'porcentagem-basica',
    difficulty: 1,
    skills: ['H3'],
    stem: [
      {
        kind: 'p',
        text: 'Lucas trabalha com carteira assinada em uma oficina mecânica de Goiânia e tem salário bruto de R$ 2.650,00. Todo mês, o empregador deposita na conta do FGTS (Fundo de Garantia do Tempo de Serviço) de Lucas um valor correspondente a 8% do seu salário bruto. Esse depósito é pago pelo empregador e não é descontado do salário.',
      },
    ],
    ask: 'Qual é o valor depositado mensalmente na conta do FGTS de Lucas?',
    alternatives: alts('R$ 21,20', 'R$ 2.438,00', 'R$ 212,00', 'R$ 331,25', 'R$ 2.120,00'),
    answer: 'C',
    hints: [
      '8% significa 8 partes de cada 100 partes do salário bruto.',
      'Comece calculando 1% do salário, dividindo R$ 2.650,00 por 100.',
    ],
    solution: [
      '1% de 2.650 = 2.650 ÷ 100 = R$ 26,50.',
      '8% de 2.650 = 8 × 26,50 = R$ 212,00.',
      'Conferência na forma decimal: 8% = 0,08 e 0,08 × 2.650 = 212.',
      'Armadilha: usar 0,8 no lugar de 0,08 dá R$ 2.120,00, que é 80% do salário; dividir o salário por 8 (R$ 331,25) não corresponde a 8%.',
      'Armadilha: R$ 2.438,00 é o salário menos 8%, mas a pergunta pede o valor do depósito, que nem sequer é descontado do salário.',
    ],
    concept:
      'p% de um valor é (p ÷ 100) × valor. Na forma decimal, 8% = 0,08; o número 0,8 corresponde a 80%.',
    estimatedSeconds: 35,
    source: AUTORAL,
    verify: () => (2650 * 8) / 100,
  },
  {
    id: 'PCT-111',
    topic: 'porcentagem',
    subtopic: 'porcentagem-basica',
    difficulty: 4,
    skills: ['H1', 'H3'],
    stem: [
      {
        kind: 'p',
        text: 'Na eleição para prefeito de um município paraense, havia 120.000 eleitores aptos a votar. A abstenção, isto é, o número de eleitores aptos que não compareceram para votar, correspondeu a 20% do total de eleitores aptos.',
      },
      {
        kind: 'p',
        text: 'Entre os eleitores que compareceram, 5% votaram em branco ou anularam o voto. Os demais votos são chamados de votos válidos. O candidato eleito recebeu 55% dos votos válidos.',
      },
    ],
    ask: 'Quantos votos recebeu o candidato eleito?',
    alternatives: alts('66.000 votos', '52.800 votos', '49.500 votos', '62.700 votos', '50.160 votos'),
    answer: 'E',
    hints: [
      'Cada porcentagem do enunciado tem uma base diferente: a abstenção se refere aos eleitores aptos, os brancos e nulos se referem a quem compareceu, e o percentual do candidato se refere aos votos válidos.',
      'Comece calculando quantos eleitores compareceram para votar.',
    ],
    solution: [
      'Compareceram 100% − 20% = 80% dos aptos: 0,80 × 120.000 = 96.000 eleitores.',
      'Brancos e nulos: 5% de 96.000 = 0,05 × 96.000 = 4.800 votos.',
      'Votos válidos: 96.000 − 4.800 = 91.200.',
      'Votos do candidato eleito: 0,55 × 91.200 = 50.160.',
      'Em fatores: 120.000 × 0,80 × 0,95 × 0,55 = 50.160, o que corresponde a cerca de 41,8% dos eleitores aptos.',
      'Armadilha: calcular os 5% de brancos e nulos sobre os 120.000 eleitores aptos (120.000 × 0,75 × 0,55 = 49.500) usa a base errada, pois esses votos são uma parte de quem compareceu.',
      'Armadilha: tomar 55% de 120.000 (66.000), de 96.000 (52.800) ou de 120.000 × 0,95 (62.700) ignora que o percentual do candidato se refere somente aos votos válidos de quem compareceu.',
    ],
    concept:
      'Uma porcentagem só tem sentido junto com a sua base. Quando cada percentual se refere a uma parte do anterior (porcentagem de porcentagem), os fatores são multiplicados em cadeia: 80% de 95% de 55% do total.',
    estimatedSeconds: 150,
    source: AUTORAL,
    verify: () => {
      const compareceram = (120000 * (100 - 20)) / 100;
      const validos = (compareceram * (100 - 5)) / 100;
      return (validos * 55) / 100;
    },
  },
  {
    id: 'PCT-112',
    topic: 'porcentagem',
    subtopic: 'variacao-percentual',
    difficulty: 2,
    skills: ['H3', 'H10'],
    stem: [
      {
        kind: 'p',
        text: 'Na Caderneta da Criança de Helena, o peso ao nascer foi registrado como 3.250 g. Na consulta de acompanhamento feita aos 6 meses, em uma Unidade Básica de Saúde de Teresina, a balança indicou que Helena estava com 7,8 kg.',
      },
    ],
    ask: 'Em relação ao peso ao nascer, o aumento percentual do peso de Helena até os 6 meses foi de',
    alternatives: alts('240%', '140%', '58,3%', '1,4%', '41,7%'),
    answer: 'B',
    hints: [
      'As duas medidas precisam estar na mesma unidade, e o aumento deve ser comparado com o peso ao nascer.',
      'Comece convertendo 7,8 kg em gramas.',
    ],
    solution: [
      '7,8 kg = 7,8 × 1.000 g = 7.800 g.',
      'Aumento: 7.800 − 3.250 = 4.550 g.',
      'Aumento percentual: 4.550 ÷ 3.250 = 1,4 = 140%.',
      'Conferência: 3.250 × 2,4 = 7.800. O peso passou a ser 240% do peso ao nascer, o que significa um aumento de 240% − 100% = 140%.',
      'Armadilha: 240% é quanto o peso atual representa do peso ao nascer, e não o aumento; 1,4% esquece que 1,4 = 140/100 = 140%.',
      'Armadilha: dividir o aumento pelo peso atual (4.550 ÷ 7.800 ≈ 58,3%) usa a base errada; 3.250 ÷ 7.800 ≈ 41,7% é apenas a fração que o peso ao nascer representa do peso atual.',
    ],
    concept:
      'Variação percentual = (valor final − valor inicial) ÷ valor inicial, com as duas medidas na mesma unidade. Se o valor final é k vezes o inicial, o aumento é de (k − 1) × 100%: dobrar é aumentar 100%, e ficar 2,4 vezes maior é aumentar 140%.',
    estimatedSeconds: 70,
    source: AUTORAL,
    verify: () => ((7.8 * 1000 - 3250) * 100) / 3250,
    tolerance: 1e-6,
  },
  {
    id: 'PCT-113',
    topic: 'porcentagem',
    subtopic: 'variacao-percentual',
    difficulty: 2,
    skills: ['H17', 'H25'],
    stem: [
      {
        kind: 'p',
        text: 'Considere que, em certo mês, o preço médio do litro da gasolina comum vendida nos postos de uma capital era formado pelas parcelas indicadas na tabela.',
      },
      {
        kind: 'table',
        header: ['Parcela do preço', 'Participação no preço do litro'],
        rows: [
          ['Preço de venda da refinaria', '35%'],
          ['Custo do etanol anidro misturado', '15%'],
          ['ICMS (tributo estadual)', '22%'],
          ['Tributos federais', '10%'],
          ['Distribuição e revenda', '18%'],
        ],
        caption: 'Composição do preço do litro da gasolina comum',
      },
      {
        kind: 'p',
        text: 'Suponha que a refinaria aumente em 12% o seu preço de venda e que todas as demais parcelas, em reais, permaneçam as mesmas.',
      },
    ],
    ask: 'Nessas condições, o preço do litro da gasolina nos postos aumentaria',
    alternatives: alts('12%', '39,2%', '47%', '4,2%', '7,8%'),
    answer: 'D',
    hints: [
      'Só a parcela da refinaria muda; as demais continuam iguais em reais. Por isso, o aumento de 12% não incide sobre o preço inteiro.',
      'Tome o preço inicial do litro como 100 e calcule de quanto a parcela da refinaria aumenta nessa escala.',
    ],
    solution: [
      'Com o preço inicial igual a 100, a parcela da refinaria vale 35 e as demais somam 65.',
      'Aumento da parcela da refinaria: 12% de 35 = 0,12 × 35 = 4,2; ela passa a valer 39,2.',
      'Novo preço: 39,2 + 65 = 104,2.',
      'Aumento do preço do litro: 4,2 ÷ 100 = 4,2%.',
      'Atalho: o aumento do preço final é 12% × 0,35 = 4,2%, isto é, o aumento da parcela multiplicado pela sua participação no preço.',
      'Armadilha: aplicar os 12% ao preço inteiro ignora que 65% do preço não mudou; 35% + 12% = 47% soma uma participação com uma variação; 39,2 é o novo valor da parcela da refinaria, e não o aumento do preço.',
    ],
    concept:
      'Quando apenas uma parcela de um total varia, a variação percentual do total é igual à variação percentual da parcela multiplicada pela participação dessa parcela no total.',
    estimatedSeconds: 90,
    source: AUTORAL,
    verify: () => {
      const refinaria = 35;
      const demais = 100 - refinaria;
      const novoPreco = (refinaria * (100 + 12)) / 100 + demais;
      return novoPreco - 100;
    },
    tolerance: 1e-6,
  },
  {
    id: 'PCT-114',
    topic: 'porcentagem',
    subtopic: 'variacao-percentual',
    difficulty: 3,
    skills: ['H3', 'H25'],
    stem: [
      {
        kind: 'p',
        text: 'Uma cooperativa de produtores de soja do oeste do Paraná comparou duas safras seguidas. Na segunda, a área plantada aumentou, mas um período de estiagem reduziu a produtividade, como mostra a tabela.',
      },
      {
        kind: 'table',
        header: ['Safra', 'Área plantada (hectares)', 'Produtividade (sacas por hectare)'],
        rows: [
          ['2022/2023', '250', '60'],
          ['2023/2024', '300', '57'],
        ],
      },
    ],
    ask: 'Da primeira para a segunda safra, a produção total de soja da cooperativa aumentou',
    alternatives: alts('14%', '15%', '12,3%', '25%', '114%'),
    answer: 'A',
    hints: [
      'A produção total é o produto da área plantada pela produtividade; calcule-a em cada safra antes de comparar.',
      'Comece multiplicando 250 por 60 para obter a produção da primeira safra, em sacas.',
    ],
    solution: [
      'Primeira safra: 250 ha × 60 sacas/ha = 15.000 sacas.',
      'Segunda safra: 300 ha × 57 sacas/ha = 17.100 sacas.',
      'Aumento: 17.100 − 15.000 = 2.100 sacas.',
      'Aumento percentual: 2.100 ÷ 15.000 = 0,14 = 14%.',
      'Em fatores: a área foi multiplicada por 300 ÷ 250 = 1,20 (aumento de 20%) e a produtividade por 57 ÷ 60 = 0,95 (queda de 5%); a produção foi multiplicada por 1,20 × 0,95 = 1,14.',
      'Armadilha: fazer 20% − 5% = 15% ignora que a queda de 5% incide sobre uma área já aumentada; 20% + 5% = 25% ainda trata a queda como aumento.',
      'Armadilha: 2.100 ÷ 17.100 ≈ 12,3% compara o aumento com a produção final; 114% é quanto a nova produção representa da anterior, e não o aumento.',
    ],
    concept:
      'Se uma grandeza é o produto de duas outras (produção = área × produtividade), o seu fator de variação é o produto dos fatores de variação: (1 + a) × (1 + b). As porcentagens não se somam.',
    estimatedSeconds: 110,
    source: AUTORAL,
    verify: () => {
      const antes = 250 * 60;
      const depois = 300 * 57;
      return ((depois - antes) * 100) / antes;
    },
  },
  {
    id: 'PCT-115',
    topic: 'porcentagem',
    subtopic: 'aumentos-sucessivos',
    difficulty: 2,
    skills: ['H2', 'H3'],
    stem: [
      {
        kind: 'p',
        text: 'No início de abril, o perfil de uma confeitaria de Manaus em uma rede social tinha 20.000 seguidores. Com uma campanha de divulgação, o número de seguidores cresceu 10% em abril, 10% em maio e 10% em junho, sempre em relação ao número de seguidores do início de cada mês.',
      },
    ],
    ask: 'Quantos seguidores o perfil tinha ao final de junho?',
    alternatives: alts(
      '26.000 seguidores',
      '24.200 seguidores',
      '6.620 seguidores',
      '22.000 seguidores',
      '26.620 seguidores',
    ),
    answer: 'E',
    hints: [
      'Cada aumento de 10% é calculado sobre o número de seguidores do início do mês, que já inclui os aumentos anteriores.',
      'Comece calculando o número de seguidores ao final de abril.',
    ],
    solution: [
      'Final de abril: 20.000 × 1,10 = 22.000 seguidores.',
      'Final de maio: 22.000 × 1,10 = 24.200 seguidores.',
      'Final de junho: 24.200 × 1,10 = 26.620 seguidores.',
      'Em fatores: 20.000 × 1,1³ = 20.000 × 1,331 = 26.620, ou seja, um crescimento total de 33,1% no trimestre.',
      'Armadilha: somar os percentuais (3 × 10% = 30%) daria 26.000 seguidores, como se os 10% de maio e de junho fossem calculados sobre os 20.000 iniciais; 6.620 é apenas o número de seguidores ganhos.',
    ],
    concept:
      'Em aumentos sucessivos, cada percentual incide sobre o valor já aumentado. Com n aumentos de mesma taxa i, o valor é multiplicado por (1 + i)ⁿ, e o aumento total é maior que n × i.',
    estimatedSeconds: 60,
    source: AUTORAL,
    verify: () => {
      let seguidores = 20000;
      for (let mes = 0; mes < 3; mes++) seguidores = (seguidores * (100 + 10)) / 100;
      return seguidores;
    },
  },
  {
    id: 'PCT-116',
    topic: 'porcentagem',
    subtopic: 'aumentos-sucessivos',
    difficulty: 2,
    skills: ['H3', 'H21'],
    stem: [
      {
        kind: 'p',
        text: 'Em uma cidade da região metropolitana de Porto Alegre, a tarifa do ônibus municipal teve dois reajustes seguidos: 10% em um ano e 20% no ano seguinte, cada um calculado sobre a tarifa vigente. Após os dois reajustes, a passagem passou a custar R$ 5,28.',
      },
    ],
    ask: 'Qual era o valor da passagem antes dos dois reajustes?',
    alternatives: alts('R$ 4,40', 'R$ 3,70', 'R$ 4,00', 'R$ 4,06', 'R$ 3,80'),
    answer: 'C',
    hints: [
      'Os reajustes multiplicaram a tarifa original por dois fatores; para voltar ao valor original, é preciso desfazer essa multiplicação.',
      'Comece calculando o fator total dos dois reajustes, multiplicando 1,10 por 1,20.',
    ],
    solution: [
      'Fator total dos reajustes: 1,10 × 1,20 = 1,32.',
      'Tarifa original × 1,32 = 5,28 ⇒ tarifa original = 5,28 ÷ 1,32 = R$ 4,00.',
      'Conferência: 4,00 × 1,10 = 4,40 e 4,40 × 1,20 = 5,28.',
      'Armadilha: tirar 20% e depois 10% de R$ 5,28 (5,28 × 0,80 × 0,90 ≈ R$ 3,80) não desfaz os reajustes, pois cada desconto incidiria sobre uma base maior que aquela em que o aumento foi calculado; tirar 30% (≈ R$ 3,70) comete o mesmo erro e ainda soma os percentuais.',
      'Armadilha: dividir por 1,30 (≈ R$ 4,06) supõe que os reajustes se somam; R$ 4,40 é a tarifa depois apenas do primeiro reajuste.',
    ],
    concept:
      'Para encontrar o valor anterior a aumentos sucessivos, divide-se o valor final pelo produto dos fatores: V₀ = V ÷ [(1 + i₁) × (1 + i₂)]. Retirar as mesmas porcentagens do valor final não leva de volta ao valor original.',
    estimatedSeconds: 75,
    source: AUTORAL,
    verify: () => 5.28 / ((1 + 10 / 100) * (1 + 20 / 100)),
    tolerance: 0.001,
  },
  {
    id: 'PCT-117',
    topic: 'porcentagem',
    subtopic: 'aumentos-sucessivos',
    difficulty: 4,
    skills: ['H3', 'H17'],
    stem: [
      {
        kind: 'p',
        text: 'Rosana é técnica de enfermagem em um hospital de Natal. Em determinado ano, ela teve um reajuste salarial de 12%. No mesmo período, a inflação foi de 5%, isto é, em média, os preços dos produtos e serviços que ela consome subiram 5%.',
      },
      {
        kind: 'p',
        text: 'O ganho real de um salário mede quanto aumentou o seu poder de compra, ou seja, a quantidade de produtos e serviços que o salário consegue comprar.',
      },
    ],
    ask: 'O ganho real do salário de Rosana nesse ano foi de, aproximadamente,',
    alternatives: alts('7%', '6,7%', '17,6%', '6,25%', '6,4%'),
    answer: 'B',
    hints: [
      'O salário foi multiplicado por um fator e os preços por outro. O poder de compra depende da razão entre esses fatores, e não da diferença entre os percentuais.',
      'Imagine um salário de 100 e um conjunto de produtos que custava 100: calcule quanto cada um passou a valer depois do ano.',
    ],
    solution: [
      'Salário: 100 → 112 (fator 1,12). Preço do conjunto de produtos: 100 → 105 (fator 1,05).',
      'Antes, o salário comprava 100 ÷ 100 = 1 conjunto. Depois, compra 112 ÷ 105 ≈ 1,0667 conjunto.',
      'Ganho real: 1,0667 − 1 = 0,0667 ≈ 6,7%.',
      'Armadilha: subtrair as taxas (12% − 5% = 7%) é só uma aproximação, que trata percentuais com bases diferentes como se tivessem a mesma base.',
      'Armadilha: multiplicar os fatores (1,12 × 1,05 = 1,176) trata a inflação como mais um aumento do salário; tirar 5% do salário reajustado (1,12 × 0,95 = 1,064) também não desconta a inflação corretamente, pois o certo é dividir pelo seu fator.',
      'Armadilha: dividir o ganho pelo fator do salário, (1,12 − 1,05) ÷ 1,12 = 6,25%, usa a base errada.',
    ],
    concept:
      'Ganho real = (1 + reajuste) ÷ (1 + inflação) − 1. Para descontar a inflação, divide-se pelo fator dela; a simples diferença entre as taxas é apenas uma aproximação.',
    estimatedSeconds: 150,
    source: AUTORAL,
    verify: () => ((1 + 12 / 100) / (1 + 5 / 100) - 1) * 100,
    tolerance: 0.05,
  },
  {
    id: 'PCT-118',
    topic: 'porcentagem',
    subtopic: 'aumentos-sucessivos',
    difficulty: 4,
    skills: ['H3', 'H4'],
    stem: [
      {
        kind: 'p',
        text: 'Uma artesã de Olinda produz bolsas de crochê. Cada bolsa tem custo de produção de R$ 40,00, e o preço de etiqueta é obtido acrescentando 80% ao custo.',
      },
      {
        kind: 'p',
        text: 'Em uma feira, ela vendeu uma bolsa com 25% de desconto sobre o preço de etiqueta. O cliente pagou com cartão, e a operadora da maquininha reteve 2% do valor pago, repassando o restante à artesã.',
      },
    ],
    ask: 'Considerando o valor que a artesã efetivamente recebeu, o lucro dessa venda, em relação ao custo de produção, foi de',
    alternatives: alts('53%', '35%', '33%', '32,3%', '23,9%'),
    answer: 'D',
    hints: [
      'Os percentuais do enunciado incidem sobre bases diferentes: o acréscimo sobre o custo, o desconto sobre o preço de etiqueta e a taxa da maquininha sobre o valor pago pelo cliente.',
      'Comece calculando o preço de etiqueta da bolsa.',
    ],
    solution: [
      'Preço de etiqueta: 40 × 1,80 = R$ 72,00.',
      'Preço pago com 25% de desconto: 72 × 0,75 = R$ 54,00.',
      'Taxa da maquininha: 0,02 × 54 = R$ 1,08. Valor recebido: 54 − 1,08 = R$ 52,92.',
      'Lucro: 52,92 − 40 = R$ 12,92. Em relação ao custo: 12,92 ÷ 40 = 0,323 = 32,3%.',
      'Em fatores: 1,80 × 0,75 × 0,98 = 1,323, ou seja, a artesã recebeu 132,3% do custo.',
      'Armadilha: fazer 80% − 25% − 2% = 53% trata percentuais de bases diferentes como se pudessem ser somados; 35% ignora a taxa da maquininha.',
      'Armadilha: 35% − 2% = 33% trata a taxa como se fosse 2% do custo, mas ela é 2% do valor pago; 12,92 ÷ 54 ≈ 23,9% compara o lucro com o preço pago, e não com o custo, como pede a pergunta.',
    ],
    concept:
      'Acréscimos e descontos sucessivos se combinam multiplicando os fatores (1 + a) e (1 − d). O lucro percentual sobre o custo é (valor recebido − custo) ÷ custo.',
    estimatedSeconds: 150,
    source: AUTORAL,
    verify: () => {
      const custo = 40;
      const etiqueta = (custo * (100 + 80)) / 100;
      const pago = (etiqueta * (100 - 25)) / 100;
      const recebido = (pago * (100 - 2)) / 100;
      return ((recebido - custo) * 100) / custo;
    },
    tolerance: 0.01,
  },
]);
