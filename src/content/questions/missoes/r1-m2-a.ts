import { AUTORAL, alts, batch } from '../_helpers';

/** Missão r1-m2 — questões extras para repetição (lote a, RZP-201 a RZP-211). Questões autorais. */
export const MISSAO_R1M2_A = batch([
  {
    id: 'RZP-201',
    topic: 'razao-proporcao',
    subtopic: 'regra-de-tres',
    difficulty: 1,
    skills: ['H16'],
    stem: [
      {
        kind: 'p',
        text: 'Na horta comunitária do bairro, Dona Cida usa 6 kg de composto orgânico para adubar um canteiro de 15 m². Ela vai montar um novo canteiro, de 40 m², e quer manter a mesma quantidade de composto por metro quadrado.',
      },
    ],
    ask: 'Quantos quilogramas de composto orgânico ela vai usar no novo canteiro?',
    alternatives: alts('2,25 kg', '16 kg', '31 kg', '100 kg', '1,6 kg'),
    answer: 'B',
    hints: [
      'Quanto maior a área do canteiro, mais composto é necessário, na mesma proporção: as grandezas são diretamente proporcionais.',
      'Descubra quantos quilogramas de composto vão em cada metro quadrado, dividindo 6 por 15.',
    ],
    solution: [
      'Composto por metro quadrado: 6 ÷ 15 = 0,4 kg/m².',
      'Novo canteiro: 0,4 × 40 = 16 kg.',
      'Conferência pela proporção: 6/15 = x/40, logo x = 6 × 40 ÷ 15 = 16 kg.',
      'Armadilha: somar a diferença de área (6 + 25 = 31) não mantém a proporção; a quantidade de composto cresce multiplicando, e não somando.',
    ],
    concept:
      'Regra de três simples direta: se a área for multiplicada por um número, a quantidade de adubo também é multiplicada por esse mesmo número. A razão kg/m² permanece constante.',
    estimatedSeconds: 45,
    source: AUTORAL,
    verify: () => (6 * 40) / 15,
  },
  {
    id: 'RZP-202',
    topic: 'razao-proporcao',
    subtopic: 'regra-de-tres-inversa',
    difficulty: 1,
    skills: ['H15', 'H16'],
    stem: [
      {
        kind: 'p',
        text: 'Uma loja anuncia uma máquina de lavar em 10 parcelas mensais iguais de R$ 312,00, sem juros. Kátia gostou da máquina, mas prefere pagar em 12 parcelas mensais iguais, também sem juros, de modo que o valor total pago seja o mesmo.',
      },
    ],
    ask: 'Qual será o valor de cada uma das 12 parcelas?',
    alternatives: alts('R$ 374,40', 'R$ 249,60', 'R$ 286,00', 'R$ 260,00', 'R$ 26,00'),
    answer: 'D',
    hints: [
      'Com mais parcelas e o mesmo total, cada parcela fica menor: número de parcelas e valor da parcela são inversamente proporcionais.',
      'Comece calculando o valor total da máquina, multiplicando o número de parcelas pelo valor de cada uma.',
    ],
    solution: [
      'Valor total: 10 × 312 = R$ 3.120,00.',
      'Em 12 parcelas: 3.120 ÷ 12 = R$ 260,00.',
      'Conferência: 12 × 260 = 3.120.',
      'Armadilha: montar a regra de três como se fosse direta (312 × 12 ÷ 10 = R$ 374,40) faria a parcela aumentar, embora o mesmo total seja dividido em mais partes.',
    ],
    concept:
      'Em grandezas inversamente proporcionais, o produto é constante: aqui, número de parcelas × valor da parcela = valor total. Se uma grandeza aumenta, a outra diminui na mesma razão.',
    estimatedSeconds: 40,
    source: AUTORAL,
    verify: () => (10 * 312) / 12,
  },
  {
    id: 'RZP-203',
    topic: 'razao-proporcao',
    subtopic: 'regra-de-tres',
    difficulty: 1,
    skills: ['H3', 'H16'],
    stem: [
      {
        kind: 'p',
        text: 'Antes de uma viagem, Marcos foi a uma casa de câmbio e pagou R$ 840,00 por 150 dólares. No mesmo dia, na mesma casa de câmbio, sua irmã Rita vai comprar 400 dólares, pela mesma cotação e sem nenhuma taxa adicional.',
      },
    ],
    ask: 'Quanto Rita vai pagar pelos 400 dólares?',
    alternatives: alts('R$ 2.240,00', 'R$ 1.090,00', 'R$ 315,00', 'R$ 1.400,00', 'R$ 2.100,00'),
    answer: 'A',
    hints: [
      'Com a cotação fixa, o valor pago em reais é diretamente proporcional à quantidade de dólares comprada.',
      'Descubra o preço de 1 dólar dividindo R$ 840,00 por 150.',
    ],
    solution: [
      'Preço de 1 dólar: 840 ÷ 150 = R$ 5,60.',
      'Valor de 400 dólares: 400 × 5,60 = R$ 2.240,00.',
      'Pela proporção: 840/150 = x/400, logo x = 840 × 400 ÷ 150 = 2.240.',
      'Armadilha: somar R$ 250,00 porque Rita compra 250 dólares a mais (840 + 250 = R$ 1.090,00) confunde dólares com reais e ignora a cotação.',
    ],
    concept:
      'Regra de três simples direta: o preço unitário (reais por dólar) é a constante de proporcionalidade; multiplicar a quantidade de dólares por esse preço dá o total em reais.',
    estimatedSeconds: 45,
    source: AUTORAL,
    verify: () => (840 * 400) / 150,
  },
  {
    id: 'RZP-204',
    topic: 'razao-proporcao',
    subtopic: 'regra-de-tres',
    difficulty: 2,
    skills: ['H15', 'H16'],
    stem: [
      {
        kind: 'p',
        text: 'O celular de Caio estava com 20% de bateria quando ele o colocou para carregar. Depois de 18 minutos na tomada, a bateria marcava 50%. Considere que, durante toda a recarga, a porcentagem de carga aumenta sempre no mesmo ritmo.',
      },
    ],
    ask: 'A partir do momento em que a bateria marcava 50%, quantos minutos ainda serão necessários para que ela chegue a 100%?',
    alternatives: alts('18 min', '48 min', '60 min', '36 min', '30 min'),
    answer: 'E',
    hints: [
      'Nos 18 minutos, a bateria não ganhou 50 pontos percentuais, e sim a diferença entre 50% e 20%.',
      'Calcule quantos pontos percentuais a bateria ganhou em 18 minutos e quantos ainda faltam para chegar a 100%.',
    ],
    solution: [
      'Em 18 minutos, a carga subiu de 20% para 50%: ganho de 30 pontos percentuais.',
      'Ritmo: 18 ÷ 30 = 0,6 minuto por ponto percentual.',
      'Faltam 100 − 50 = 50 pontos percentuais: 50 × 0,6 = 30 min.',
      'Armadilha: considerar que os 50% foram carregados em 18 minutos leva a um ritmo errado, pois a bateria já começou com 20%.',
    ],
    concept:
      'Na regra de três, a grandeza proporcional ao tempo é a variação da carga (quanto ela aumentou), e não o valor marcado no visor. Sempre identifique o ponto de partida.',
    estimatedSeconds: 75,
    source: AUTORAL,
    verify: () => ((100 - 50) * 18) / (50 - 20),
  },
  {
    id: 'RZP-205',
    topic: 'razao-proporcao',
    subtopic: 'regra-de-tres-inversa',
    difficulty: 2,
    skills: ['H10', 'H16'],
    stem: [
      {
        kind: 'p',
        text: 'Em um hospital, um frasco de soro administrado com gotejamento de 45 gotas por minuto termina em 2 h 40 min. Para o próximo frasco, idêntico ao primeiro, o médico prescreveu um gotejamento mais lento, de 36 gotas por minuto. Considere que todas as gotas têm o mesmo volume.',
      },
    ],
    ask: 'Com o novo gotejamento, quanto tempo levará para o frasco terminar?',
    alternatives: alts('3 h 12 min', '2 h 8 min', '3 h 20 min', '3 h', '3 h 33 min'),
    answer: 'C',
    hints: [
      'O número total de gotas do frasco é sempre o mesmo; com menos gotas por minuto, o frasco demora mais para acabar.',
      'Converta 2 h 40 min em minutos e calcule o total de gotas do frasco: gotas por minuto × minutos.',
    ],
    solution: [
      'Tempo inicial: 2 h 40 min = 2 × 60 + 40 = 160 min.',
      'Total de gotas do frasco: 45 × 160 = 7.200 gotas.',
      'Novo tempo: 7.200 ÷ 36 = 200 min.',
      '200 min = 3 × 60 + 20, ou seja, 3 h 20 min.',
      'Armadilha: o gotejamento caiu 20% (de 45 para 36), mas o tempo não aumenta 20%; ele é multiplicado por 45/36 = 1,25, isto é, aumenta 25%.',
      'Armadilha: tratar 2 h 40 min como 2,40 h está errado, pois 40 min = 40/60 h ≈ 0,67 h.',
    ],
    concept:
      'Para um mesmo volume, gotejamento (gotas por minuto) e tempo são inversamente proporcionais: o produto gotejamento × tempo é constante. Em contas com horas e minutos, converta tudo para minutos antes de calcular.',
    estimatedSeconds: 90,
    source: AUTORAL,
    verify: () => (45 * 160) / 36 / 60,
  },
  {
    id: 'RZP-206',
    topic: 'razao-proporcao',
    subtopic: 'regra-de-tres',
    difficulty: 2,
    skills: ['H10', 'H16'],
    stem: [
      {
        kind: 'p',
        text: 'Na casa de Renata, a torneira do tanque ficou mal fechada e passou a pingar sem parar. Ela colocou um copo medidor embaixo da torneira e verificou que, a cada 15 minutos, eram desperdiçados 40 mL de água.',
      },
    ],
    ask: 'Mantido esse ritmo, quantos litros de água seriam desperdiçados em 30 dias, se a torneira não fosse consertada?',
    alternatives: alts('4,8 L', '115,2 L', '3,84 L', '1.152 L', '11,52 L'),
    answer: 'B',
    hints: [
      'O volume desperdiçado é diretamente proporcional ao tempo, mas as unidades precisam ser convertidas: minutos em horas e dias, mililitros em litros.',
      'Comece calculando quantos mililitros são desperdiçados em 1 hora, lembrando que 1 hora tem quatro períodos de 15 minutos.',
    ],
    solution: [
      'Em 1 hora: 4 × 40 = 160 mL.',
      'Em 1 dia (24 h): 24 × 160 = 3.840 mL.',
      'Em 30 dias: 30 × 3.840 = 115.200 mL.',
      'Como 1 L = 1.000 mL: 115.200 ÷ 1.000 = 115,2 L.',
      'Armadilha: esquecer de multiplicar pelas 24 horas do dia daria apenas 4,8 L, como se a torneira pingasse só 1 hora por dia.',
    ],
    concept:
      'Em problemas de proporcionalidade com várias unidades, encadeie as conversões (15 min → hora → dia → mês e mL → L), mantendo a mesma taxa de desperdício durante todo o período.',
    estimatedSeconds: 90,
    source: AUTORAL,
    verify: () => (40 * (60 / 15) * 24 * 30) / 1000,
  },
  {
    id: 'RZP-207',
    topic: 'razao-proporcao',
    subtopic: 'regra-de-tres-inversa',
    difficulty: 2,
    skills: ['H15', 'H16'],
    stem: [
      {
        kind: 'p',
        text: 'Na bicicleta de Tiago, a coroa (engrenagem presa aos pedais) tem 42 dentes e está ligada pela corrente à catraca (engrenagem presa à roda traseira), que tem 14 dentes. Como a corrente faz passar o mesmo número de dentes pelas duas engrenagens, o número de voltas de cada engrenagem é inversamente proporcional ao seu número de dentes.',
      },
      {
        kind: 'p',
        text: 'Tiago pedala de modo que os pedais dão 75 voltas completas por minuto. A catraca e a roda traseira giram juntas, e a cada volta completa da roda traseira a bicicleta avança 2 metros.',
      },
    ],
    ask: 'Quantos metros a bicicleta percorre em 1 minuto nesse ritmo?',
    alternatives: alts('450 m', '50 m', '150 m', '225 m', '112,5 m'),
    answer: 'A',
    hints: [
      'A catraca tem menos dentes que a coroa; por isso, no mesmo tempo, ela dá mais voltas que os pedais.',
      'Calcule quantas voltas a catraca dá em 1 minuto: o produto "voltas × dentes" é o mesmo para as duas engrenagens.',
    ],
    solution: [
      'Coroa: 75 voltas × 42 dentes = 3.150 dentes passam pela corrente em 1 minuto.',
      'Catraca: 3.150 ÷ 14 = 225 voltas por minuto (cada volta dos pedais gera 42 ÷ 14 = 3 voltas da roda).',
      'Distância: 225 × 2 = 450 m em 1 minuto.',
      'Armadilha: montar a regra de três como direta (75 × 14 ÷ 42 = 25 voltas) faria a roda girar menos que os pedais, o que contraria o funcionamento da bicicleta.',
    ],
    concept:
      'Em engrenagens ligadas por corrente, número de voltas e número de dentes são inversamente proporcionais: voltas da coroa × dentes da coroa = voltas da catraca × dentes da catraca.',
    estimatedSeconds: 90,
    source: AUTORAL,
    verify: () => ((75 * 42) / 14) * 2,
  },
  {
    id: 'RZP-208',
    topic: 'razao-proporcao',
    subtopic: 'regra-de-tres',
    difficulty: 3,
    skills: ['H16', 'H25', 'H27'],
    stem: [
      {
        kind: 'p',
        text: 'Uma família de Teresina quer instalar placas solares em casa. Um vizinho tem 4 placas do mesmo modelo, que geram juntas, em média, 150 kWh de energia por mês. O gráfico mostra o consumo de energia da família nos últimos 6 meses.',
      },
      {
        kind: 'bars',
        title: 'Consumo mensal de energia da família',
        unit: 'kWh',
        data: [
          { label: 'Jan', value: 430 },
          { label: 'Fev', value: 410 },
          { label: 'Mar', value: 390 },
          { label: 'Abr', value: 370 },
          { label: 'Mai', value: 360 },
          { label: 'Jun', value: 440 },
        ],
      },
      {
        kind: 'p',
        text: 'A família quer comprar o menor número de placas desse modelo capaz de gerar, por mês, pelo menos o consumo médio mensal desses 6 meses. Considere que a energia gerada é diretamente proporcional ao número de placas.',
      },
    ],
    ask: 'Quantas placas a família deve comprar?',
    alternatives: alts('3 placas', '10 placas', '12 placas', '11 placas', '64 placas'),
    answer: 'D',
    hints: [
      'Há três etapas: achar o consumo médio mensal, achar quanto gera uma única placa e decidir quantas placas são suficientes.',
      'Some os seis consumos do gráfico e divida o total por 6 para obter o consumo médio mensal.',
    ],
    solution: [
      'Consumo total: 430 + 410 + 390 + 370 + 360 + 440 = 2.400 kWh.',
      'Consumo médio: 2.400 ÷ 6 = 400 kWh por mês.',
      'Geração de 1 placa: 150 ÷ 4 = 37,5 kWh por mês.',
      'Placas necessárias: 400 ÷ 37,5 ≈ 10,67.',
      'Com 10 placas, a geração seria 10 × 37,5 = 375 kWh, menor que 400 kWh; por isso, são necessárias 11 placas (11 × 37,5 = 412,5 kWh).',
      'Armadilha: usar 150 kWh como a geração de uma única placa daria apenas 3 placas, mas esse valor corresponde às 4 placas do vizinho juntas.',
    ],
    concept:
      'Quando a regra de três resulta em um número não inteiro de objetos (placas, ônibus, latas), interprete o contexto: para atingir pelo menos uma meta, arredonda-se para cima.',
    estimatedSeconds: 150,
    source: AUTORAL,
    verify: () => {
      const media = (430 + 410 + 390 + 370 + 360 + 440) / 6;
      return Math.ceil(media / (150 / 4));
    },
  },
  {
    id: 'RZP-209',
    topic: 'razao-proporcao',
    subtopic: 'regra-de-tres-inversa',
    difficulty: 3,
    skills: ['H12', 'H16'],
    stem: [
      {
        kind: 'p',
        text: 'Ao planejar o piso de uma varanda, um pedreiro calculou que seriam necessárias exatamente 180 peças quadradas de porcelanato, de 30 cm de lado, para cobri-la, sem contar perdas. A cliente, porém, escolheu peças quadradas de 45 cm de lado.',
      },
      {
        kind: 'p',
        text: 'Na hora da compra, o pedreiro sempre acrescenta 10% à quantidade calculada, para cobrir quebras e recortes.',
      },
    ],
    ask: 'Quantas peças de 45 cm de lado devem ser compradas?',
    alternatives: alts('80 peças', '132 peças', '99 peças', '297 peças', '88 peças'),
    answer: 'E',
    hints: [
      'A área da varanda não muda: quanto maior a área de cada peça, menos peças são necessárias. Atenção: o que importa é a área da peça, e não apenas a medida do lado.',
      'Calcule a área de uma peça de cada tamanho, em cm², e compare as duas.',
    ],
    solution: [
      'Área de uma peça de 30 cm: 30 × 30 = 900 cm². Área de uma peça de 45 cm: 45 × 45 = 2.025 cm².',
      'Número de peças × área da peça é constante (é a área da varanda): 180 × 900 = 162.000 cm², ou seja, 16,2 m².',
      'Peças de 45 cm, sem perdas: 162.000 ÷ 2.025 = 80 peças.',
      'Com 10% a mais: 80 × 1,1 = 88 peças.',
      'Armadilha: usar a razão entre os lados (180 × 30 ÷ 45 = 120 peças, ou 132 com os 10%) ignora que a área da peça cresce com o quadrado do lado: ela fica (45/30)² = 2,25 vezes maior.',
    ],
    concept:
      'O número de peças é inversamente proporcional à área de cada peça. Se o lado de uma peça quadrada é multiplicado por k, sua área é multiplicada por k², e a quantidade de peças é dividida por k².',
    estimatedSeconds: 150,
    source: AUTORAL,
    verify: () => ((180 * 30 * 30) / (45 * 45)) * 1.1,
  },
  {
    id: 'RZP-210',
    topic: 'razao-proporcao',
    subtopic: 'regra-de-tres-composta',
    difficulty: 3,
    skills: ['H16', 'H17'],
    stem: [
      {
        kind: 'p',
        text: 'Em uma cidade, uma equipe de 12 garis, trabalhando 8 horas por dia, varre 30 km de ruas em 6 dias. Para um mutirão de limpeza antes de um festival, a prefeitura precisa varrer 45 km de ruas em apenas 4 dias, com jornada de 6 horas por dia. Todos os garis trabalham no mesmo ritmo.',
      },
    ],
    ask: 'Quantos garis serão necessários para o mutirão?',
    alternatives: alts('9 garis', '18 garis', '36 garis', '24 garis', '27 garis'),
    answer: 'C',
    hints: [
      'Analise cada grandeza separadamente: mais quilômetros exigem mais garis, e menos dias ou menos horas por dia também exigem mais garis.',
      'Calcule quantas horas de trabalho de um gari ("gari-horas") são necessárias para varrer 1 km na situação inicial.',
    ],
    solution: [
      'Situação inicial: 12 × 8 × 6 = 576 gari-horas para 30 km.',
      'Por quilômetro: 576 ÷ 30 = 19,2 gari-horas.',
      'Mutirão: 45 × 19,2 = 864 gari-horas.',
      'Cada gari trabalha 4 × 6 = 24 horas no mutirão: 864 ÷ 24 = 36 garis.',
      'Pela regra de três composta: x = 12 × (45/30) × (6/4) × (8/6) = 36.',
      'Armadilha: tratar todas as grandezas como diretamente proporcionais (12 × 45/30 × 4/6 × 6/8 = 9) faria a equipe diminuir justamente quando há menos tempo disponível.',
    ],
    concept:
      'Na regra de três composta, compare a grandeza procurada com cada uma das outras, mantendo as demais fixas: o número de garis é diretamente proporcional à extensão varrida e inversamente proporcional ao número de dias e às horas por dia.',
    estimatedSeconds: 180,
    source: AUTORAL,
    verify: () => (((12 * 8 * 6) / 30) * 45) / (4 * 6),
  },
  {
    id: 'RZP-211',
    topic: 'razao-proporcao',
    subtopic: 'regra-de-tres-composta',
    difficulty: 3,
    skills: ['H16', 'H18'],
    stem: [
      {
        kind: 'p',
        text: 'Uma cozinha industrial de Belo Horizonte fornece marmitas para empresas. Com 5 cozinheiras trabalhando 6 horas por dia, ela prepara 900 marmitas em 3 dias. Agora, recebeu uma encomenda de 1.200 marmitas, que deve ficar pronta em 2 dias, e contará com 8 cozinheiras, todas no mesmo ritmo das anteriores.',
      },
    ],
    ask: 'Quantas horas por dia as 8 cozinheiras deverão trabalhar para entregar a encomenda no prazo?',
    alternatives: alts('12 h', '7 h 30 min', '5 h', '3 h 20 min', '7 h 50 min'),
    answer: 'B',
    hints: [
      'A jornada diária aumenta com o número de marmitas e diminui quando há mais cozinheiras ou mais dias de trabalho.',
      'Use a situação inicial para descobrir quantas marmitas uma cozinheira prepara em uma hora: são 900 marmitas em 5 × 6 × 3 horas de trabalho.',
    ],
    solution: [
      'Situação inicial: 5 × 6 × 3 = 90 horas de trabalho (cozinheira-horas) para 900 marmitas.',
      'Produtividade: 900 ÷ 90 = 10 marmitas por cozinheira por hora.',
      'Por dia, a encomenda exige 1.200 ÷ 2 = 600 marmitas; as 8 cozinheiras juntas fazem 8 × 10 = 80 marmitas por hora.',
      'Jornada: 600 ÷ 80 = 7,5 h = 7 h 30 min.',
      'Armadilha: 7,5 h não é 7 h 50 min, pois 0,5 h corresponde a 30 min.',
    ],
    concept:
      'Na regra de três composta, reduza a situação conhecida a uma taxa unitária (marmitas por cozinheira por hora) e use-a na nova situação. A jornada diária é diretamente proporcional à quantidade de marmitas e inversamente proporcional ao número de cozinheiras e de dias.',
    estimatedSeconds: 180,
    source: AUTORAL,
    verify: () => 1200 / (8 * 2 * (900 / (5 * 6 * 3))),
  },
]);
