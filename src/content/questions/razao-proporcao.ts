import { AUTORAL, alts, batch } from './_helpers';

export const RAZAO_PROPORCAO = batch([
  {
    id: 'RZP-001',
    topic: 'razao-proporcao',
    subtopic: 'razao',
    difficulty: 1,
    skills: ['H3', 'H16'],
    stem: [
      {
        kind: 'p',
        text: 'Uma turma de um cursinho comunitário tem 12 meninas e 18 meninos. A coordenação quer saber que fração da turma é formada por meninas para planejar a divisão dos grupos de estudo.',
      },
    ],
    ask: 'A razão entre o número de meninas e o total de estudantes da turma é',
    alternatives: alts('2/3', '3/5', '2/5', '3/2', '1/3'),
    answer: 'C',
    hints: [
      'A razão pedida compara as meninas com o TOTAL, não com os meninos.',
      'Calcule primeiro o total de estudantes: 12 + 18.',
    ],
    solution: [
      { explanation: 'Total de estudantes.', calculation: ['12 + 18 = 30'] },
      'Razão meninas/total = 12/30.',
      { explanation: 'Simplificando por 6.', calculation: ['12/30 = 2/5'] },
    ],
    concept:
      'Razão é a comparação entre duas grandezas por divisão. Leia com atenção o que está sendo comparado: "meninas para meninos" (12/18) é diferente de "meninas para o total" (12/30).',
    estimatedSeconds: 45,
    source: AUTORAL,
    verify: () => 12 / (12 + 18),
  },
  {
    id: 'RZP-002',
    topic: 'razao-proporcao',
    subtopic: 'escala',
    difficulty: 1,
    skills: ['H11'],
    stem: [
      {
        kind: 'p',
        text: 'Em um mapa rodoviário com escala 1 : 500.000, a distância em linha reta entre duas cidades é de 6 cm.',
      },
    ],
    ask: 'A distância real, em linha reta, entre as duas cidades é de',
    alternatives: alts('3 km', '30 km', '300 km', '0,3 km', '3.000 km'),
    answer: 'B',
    hints: [
      'A escala 1 : 500.000 significa que 1 cm no mapa corresponde a 500.000 cm na realidade.',
      'Multiplique 6 por 500.000 e depois converta centímetros em quilômetros (1 km = 100.000 cm).',
    ],
    solution: [
      { explanation: 'A escala multiplica a medida do mapa para obter a medida real em centímetros.', calculation: ['d = 6 × 500.000', 'd = 3.000.000 cm'] },
      { explanation: 'Converta centímetros para quilômetros: cada quilômetro tem 100.000 cm.', calculation: ['d = 3.000.000 ÷ 100.000', 'd = 30 km'] },
    ],
    concept:
      'Escala é a razão entre a medida no desenho e a medida real, na mesma unidade. Depois de aplicar a escala, converta a unidade com cuidado.',
    estimatedSeconds: 60,
    source: AUTORAL,
    verify: () => (6 * 500000) / 100000,
  },
  {
    id: 'RZP-003',
    topic: 'razao-proporcao',
    subtopic: 'proporcao',
    difficulty: 2,
    skills: ['H16', 'H18'],
    stem: [
      {
        kind: 'p',
        text: 'Três amigas abriram uma pequena confeitaria. Ana investiu R$ 20.000,00, Bia investiu R$ 30.000,00 e Carla investiu R$ 50.000,00. Elas combinaram dividir o lucro do primeiro ano, de R$ 18.000,00, em partes diretamente proporcionais ao valor investido por cada uma.',
      },
    ],
    ask: 'Quanto Bia deve receber?',
    alternatives: alts('R$ 3.600,00', 'R$ 5.000,00', 'R$ 6.000,00', 'R$ 5.400,00', 'R$ 9.000,00'),
    answer: 'D',
    hints: [
      'Descubra que fração do investimento total pertence a Bia.',
      'O investimento total é R$ 100.000,00; Bia tem 30.000/100.000 dele.',
    ],
    solution: [
      { explanation: 'Investimento total.', calculation: ['20.000 + 30.000 + 50.000 = 100.000'] },
      'Parte de Bia: 30.000/100.000 = 0,3 do total.',
      { explanation: 'Lucro de Bia.', calculation: ['0,3 × 18.000 = R$ 5.400,00'] },
    ],
    concept:
      'Na divisão diretamente proporcional, cada parte é o total multiplicado pela fração que o "peso" de cada pessoa representa da soma dos pesos.',
    estimatedSeconds: 90,
    source: AUTORAL,
    verify: () => (18000 * 30000) / (20000 + 30000 + 50000),
  },
  {
    id: 'RZP-004',
    topic: 'razao-proporcao',
    subtopic: 'regra-de-tres',
    difficulty: 1,
    skills: ['H16'],
    stem: [
      {
        kind: 'p',
        text: 'Uma receita de biscoitos usa 3 xícaras de farinha para render 24 biscoitos. Para a feira de ciências da escola, Lucas quer preparar 40 biscoitos mantendo a mesma proporção entre os ingredientes.',
      },
    ],
    ask: 'Quantas xícaras de farinha Lucas vai usar?',
    alternatives: alts('4 xícaras', '5 xícaras', '6 xícaras', '7,5 xícaras', '8 xícaras'),
    answer: 'B',
    hints: [
      'Mais biscoitos exigem mais farinha: as grandezas são diretamente proporcionais.',
      'Monte a proporção 3/24 = x/40.',
    ],
    solution: [
      { explanation: 'Farinha e biscoitos são diretamente proporcionais.', calculation: ['3/24 = x/40'] },
      'x = 3 × 40 ÷ 24 = 120 ÷ 24 = 5 xícaras.',
    ],
    concept:
      'Regra de três simples direta: quando uma grandeza dobra e a outra também dobra, montamos a proporção mantendo a mesma ordem nas duas razões.',
    estimatedSeconds: 45,
    source: AUTORAL,
    verify: () => (3 * 40) / 24,
  },
  {
    id: 'RZP-005',
    topic: 'razao-proporcao',
    subtopic: 'regra-de-tres-inversa',
    difficulty: 2,
    skills: ['H15', 'H16'],
    stem: [
      {
        kind: 'p',
        text: 'Uma equipe de 6 pedreiros, todos com a mesma produtividade, constrói um muro em 10 dias. Por um imprevisto, apenas 4 desses pedreiros poderão trabalhar na obra.',
      },
    ],
    ask: 'Mantido o ritmo de trabalho, em quantos dias os 4 pedreiros construirão o mesmo muro?',
    alternatives: alts('8 dias', '12 dias', '18 dias', '20 dias', '15 dias'),
    answer: 'E',
    hints: [
      'Menos pedreiros levam MAIS dias: as grandezas são inversamente proporcionais.',
      'O total de "pedreiro-dias" do muro é sempre o mesmo: 6 × 10.',
    ],
    solution: [
      { explanation: 'O mesmo muro exige o mesmo total de pedreiro-dias.', calculation: ['T = 6 × 10', 'T = 60 pedreiro-dias'] },
      { explanation: 'Divida o trabalho total entre os quatro pedreiros.', calculation: ['d = 60 ÷ 4', 'd = 15 dias'] },
    ],
    concept:
      'Em grandezas inversamente proporcionais, o produto entre elas é constante. Antes de montar a regra de três, pergunte: "se uma aumenta, a outra aumenta ou diminui?"',
    estimatedSeconds: 60,
    source: AUTORAL,
    verify: () => (6 * 10) / 4,
  },
  {
    id: 'RZP-006',
    topic: 'razao-proporcao',
    subtopic: 'regra-de-tres-composta',
    difficulty: 3,
    skills: ['H16', 'H17'],
    stem: [
      {
        kind: 'p',
        text: 'Em uma fábrica, 8 máquinas idênticas, funcionando 6 horas por dia, produzem 1.200 peças em 5 dias. Para atender a uma encomenda, a fábrica passará a usar 10 dessas máquinas, funcionando 8 horas por dia.',
      },
    ],
    ask: 'Quantas peças serão produzidas em 4 dias nessas novas condições?',
    alternatives: alts('1.200 peças', '1.280 peças', '1.600 peças', '1.800 peças', '2.000 peças'),
    answer: 'C',
    hints: [
      'Descubra quantas peças UMA máquina produz em UMA hora.',
      'Na situação inicial, foram 8 × 6 × 5 = 240 horas-máquina para 1.200 peças.',
    ],
    solution: [
      'Horas-máquina iniciais: 8 × 6 × 5 = 240, produzindo 1.200 peças.',
      'Produtividade: 1.200 ÷ 240 = 5 peças por hora-máquina.',
      { explanation: 'Novas horas-máquina.', calculation: ['10 × 8 × 4 = 320'] },
      'Produção: 320 × 5 = 1.600 peças.',
    ],
    concept:
      'Na regra de três composta, reduza tudo a uma taxa unitária (peças por máquina por hora). A quantidade produzida é diretamente proporcional a máquinas, horas por dia e dias.',
    estimatedSeconds: 120,
    source: AUTORAL,
    verify: () => (1200 / (8 * 6 * 5)) * 10 * 8 * 4,
  },
  {
    id: 'RZP-007',
    topic: 'razao-proporcao',
    subtopic: 'escala',
    difficulty: 2,
    skills: ['H11', 'H12'],
    stem: [
      {
        kind: 'p',
        text: 'Na planta de um apartamento, desenhada na escala 1 : 100, a sala é representada por um retângulo de 5 cm por 4 cm.',
      },
    ],
    ask: 'A área real da sala é de',
    alternatives: alts('0,2 m²', '2 m²', '20 m²', '200 m²', '2.000 m²'),
    answer: 'C',
    hints: [
      'Converta cada lado para a medida real antes de calcular a área.',
      'Na escala 1 : 100, 1 cm na planta equivale a 100 cm = 1 m na realidade.',
    ],
    solution: [
      { explanation: 'Lados reais.', calculation: ['5 cm × 100 = 500 cm', '= 5 m', '4 cm × 100 = 400 cm', '= 4 m'] },
      { explanation: 'Área real.', calculation: ['5 m × 4 m = 20 m²'] },
      'Atenção: a razão entre áreas é o quadrado da escala (1 : 10.000), e não 1 : 100.',
    ],
    concept:
      'A escala vale para comprimentos. Áreas são multiplicadas pelo quadrado do fator de escala — por isso é mais seguro converter os lados antes de calcular a área.',
    estimatedSeconds: 75,
    source: AUTORAL,
    verify: () => ((5 * 100) / 100) * ((4 * 100) / 100),
  },
  {
    id: 'RZP-008',
    topic: 'razao-proporcao',
    subtopic: 'razao',
    difficulty: 2,
    skills: ['H3', 'H17'],
    stem: [
      {
        kind: 'p',
        text: 'A densidade demográfica é a razão entre o número de habitantes e a área de uma região. A tabela apresenta dados de duas cidades.',
      },
      {
        kind: 'table',
        header: ['Cidade', 'Habitantes', 'Área (km²)'],
        rows: [
          ['X', '360.000', '120'],
          ['Y', '250.000', '50'],
        ],
      },
    ],
    ask: 'Em quantos habitantes por km² a densidade demográfica da cidade Y supera a da cidade X?',
    alternatives: alts('1.000', '2.500', '3.000', '5.000', '2.000'),
    answer: 'E',
    hints: [
      'Calcule a densidade de cada cidade separadamente: habitantes ÷ área.',
      'Depois, subtraia a densidade de X da densidade de Y.',
    ],
    solution: [
      { explanation: 'Densidade é a população dividida pela área. Calcule para X.', calculation: ['dX = 360.000 ÷ 120', 'dX = 3.000 hab/km²'] },
      { explanation: 'Repita para Y.', calculation: ['dY = 250.000 ÷ 50', 'dY = 5.000 hab/km²'] },
      'Diferença: 5.000 − 3.000 = 2.000 hab/km².',
    ],
    concept:
      'Razões entre grandezas de naturezas diferentes (habitantes por km², km por hora) são "taxas". Compare cidades pela taxa, não pelos totais.',
    estimatedSeconds: 75,
    source: AUTORAL,
    verify: () => 250000 / 50 - 360000 / 120,
  },
  {
    id: 'RZP-009',
    topic: 'razao-proporcao',
    subtopic: 'proporcao',
    difficulty: 2,
    skills: ['H16'],
    stem: [
      {
        kind: 'p',
        text: 'Para pintar a fachada da escola, um pintor mistura tinta azul e tinta branca na razão de 2 para 3, isto é, para cada 2 partes de azul, usa 3 partes de branca. Ele precisa preparar 15 litros dessa mistura.',
      },
    ],
    ask: 'Quantos litros de tinta azul ele vai usar?',
    alternatives: alts('5 L', '6 L', '7,5 L', '9 L', '10 L'),
    answer: 'B',
    hints: [
      'A mistura tem 2 + 3 = 5 partes iguais no total.',
      'Cada parte vale 15 ÷ 5 litros.',
    ],
    solution: [
      { explanation: 'Total de partes.', calculation: ['2 + 3 = 5'] },
      'Cada parte: 15 ÷ 5 = 3 litros.',
      'Tinta azul: 2 partes × 3 L = 6 L.',
    ],
    concept:
      'Uma razão a : b divide o todo em (a + b) partes iguais. Encontre o valor de uma parte e multiplique.',
    estimatedSeconds: 50,
    source: AUTORAL,
    verify: () => (15 / (2 + 3)) * 2,
  },
  {
    id: 'RZP-010',
    topic: 'razao-proporcao',
    subtopic: 'regra-de-tres',
    difficulty: 2,
    skills: ['H16', 'H18'],
    stem: [
      {
        kind: 'p',
        text: 'O carro de uma família percorre, em média, 12 km com 1 litro de gasolina. Eles planejam uma viagem de 420 km, e o litro da gasolina custa R$ 6,00.',
      },
    ],
    ask: 'Qual será o gasto com combustível nessa viagem?',
    alternatives: alts('R$ 72,00', 'R$ 180,00', 'R$ 210,00', 'R$ 252,00', 'R$ 350,00'),
    answer: 'C',
    hints: [
      'Primeiro descubra quantos litros serão consumidos.',
      'Litros = 420 ÷ 12. Depois multiplique pelo preço do litro.',
    ],
    solution: [
      { explanation: 'Consumo.', calculation: ['420 km ÷ 12 km/L = 35 L'] },
      { explanation: 'Custo.', calculation: ['35 × R$ 6,00 = R$ 210,00'] },
    ],
    concept:
      'Problemas com duas etapas de proporcionalidade: encadeie as razões (km → litros → reais), sempre conferindo as unidades.',
    estimatedSeconds: 60,
    source: AUTORAL,
    verify: () => (420 / 12) * 6,
  },
  {
    id: 'RZP-011',
    topic: 'razao-proporcao',
    subtopic: 'regra-de-tres-inversa',
    difficulty: 2,
    skills: ['H15', 'H16'],
    stem: [
      {
        kind: 'p',
        text: 'Um ônibus de turismo faz um percurso em 3 horas, mantendo velocidade média de 80 km/h. Em dias de chuva, por segurança, a empresa limita a velocidade média a 60 km/h.',
      },
    ],
    ask: 'Em dias de chuva, quanto tempo o ônibus leva para fazer o mesmo percurso?',
    alternatives: alts('2 h 15 min', '3 h 30 min', '4 h', '4 h 30 min', '5 h'),
    answer: 'C',
    hints: [
      'Velocidade menor ⇒ tempo maior: grandezas inversamente proporcionais.',
      'A distância do percurso é 80 × 3 km.',
    ],
    solution: [
      { explanation: 'Distância.', calculation: ['80 km/h × 3 h = 240 km'] },
      { explanation: 'Tempo a 60 km/h.', calculation: ['240 ÷ 60 = 4 h'] },
    ],
    concept:
      'Para a mesma distância, velocidade e tempo são inversamente proporcionais: o produto velocidade × tempo é constante.',
    estimatedSeconds: 50,
    source: AUTORAL,
    verify: () => (80 * 3) / 60,
  },
  {
    id: 'RZP-012',
    topic: 'razao-proporcao',
    subtopic: 'regra-de-tres-composta',
    difficulty: 3,
    skills: ['H16', 'H17'],
    stem: [
      {
        kind: 'p',
        text: 'Cinco torneiras idênticas, abertas ao mesmo tempo, enchem um reservatório de 30.000 litros em 6 horas. Um segundo reservatório, de 24.000 litros, será enchido usando apenas 3 dessas torneiras, com a mesma vazão.',
      },
    ],
    ask: 'Quanto tempo será necessário para encher o segundo reservatório?',
    alternatives: alts('4 h 48 min', '6 h', '10 h', '12 h', '8 h'),
    answer: 'E',
    hints: [
      'Descubra a vazão de UMA torneira, em litros por hora.',
      'Cinco torneiras em 6 h somam 30 "torneira-horas" para 30.000 L.',
    ],
    solution: [
      { explanation: 'Vazão de uma torneira.', calculation: ['30.000 ÷ (5 × 6) = 1.000 L/h'] },
      'Vazão de 3 torneiras: 3.000 L/h.',
      { explanation: 'Tempo.', calculation: ['24.000 ÷ 3.000 = 8 h'] },
    ],
    concept:
      'Na regra de três composta, identifique cada relação separadamente: o tempo é diretamente proporcional ao volume e inversamente proporcional ao número de torneiras.',
    estimatedSeconds: 110,
    source: AUTORAL,
    verify: () => 24000 / (3 * (30000 / (5 * 6))),
  },
  {
    id: 'RZP-013',
    topic: 'razao-proporcao',
    subtopic: 'proporcao',
    difficulty: 2,
    skills: ['H16', 'H7'],
    stem: [
      {
        kind: 'p',
        text: 'Um telão retangular tem formato na proporção 16 : 9 (largura : altura). Ele será instalado em uma parede e tem 112 cm de largura.',
      },
    ],
    ask: 'Qual é a altura desse telão?',
    alternatives: alts('56 cm', '59,5 cm', '63 cm', '70 cm', '199 cm'),
    answer: 'C',
    hints: [
      'Monte a proporção largura/altura = 16/9.',
      '112/h = 16/9 ⇒ h = 112 × 9 ÷ 16.',
    ],
    solution: [
      { explanation: 'Desenvolva a conta na ordem indicada.', calculation: ['112/h = 16/9'] },
      { explanation: 'Desenvolva a conta na ordem indicada.', calculation: ['h = 112 × 9 ÷ 16', '= 1.008 ÷ 16', '= 63 cm'] },
    ],
    concept:
      'Uma proporção é uma igualdade entre razões. Mantenha a ordem (largura com largura, altura com altura) dos dois lados da igualdade.',
    estimatedSeconds: 50,
    source: AUTORAL,
    verify: () => (112 * 9) / 16,
  },
  {
    id: 'RZP-014',
    topic: 'razao-proporcao',
    subtopic: 'escala',
    difficulty: 2,
    skills: ['H11'],
    stem: [
      {
        kind: 'p',
        text: 'Para um trabalho de geografia, um estudante mediu, em um mapa, a distância entre duas cidades e obteve 7,5 cm. Sabe-se que a distância real entre elas é de 30 km.',
      },
    ],
    ask: 'A escala desse mapa é',
    alternatives: alts('1 : 4.000', '1 : 40.000', '1 : 225.000', '1 : 4.000.000', '1 : 400.000'),
    answer: 'E',
    hints: [
      'Escala = medida no mapa ÷ medida real, nas MESMAS unidades.',
      'Converta 30 km para centímetros: 1 km = 100.000 cm.',
    ],
    solution: [
      { explanation: 'Desenvolva a conta na ordem indicada.', calculation: ['30 km = 30 × 100.000 cm', '= 3.000.000 cm'] },
      'Escala = 7,5 : 3.000.000.',
      'Dividindo ambos por 7,5: 1 : 400.000.',
    ],
    concept:
      'Escala é sempre uma razão entre medidas na mesma unidade, escrita na forma 1 : N.',
    estimatedSeconds: 90,
    source: AUTORAL,
    verify: () => (30 * 100000) / 7.5,
  },
  {
    id: 'RZP-015',
    topic: 'razao-proporcao',
    subtopic: 'regra-de-tres-inversa',
    difficulty: 3,
    skills: ['H16', 'H17'],
    stem: [
      {
        kind: 'p',
        text: 'Um haras tem ração suficiente para alimentar 20 cavalos durante 15 dias. Após 5 dias de consumo normal, o haras recebe mais 5 cavalos, que passam a comer a mesma quantidade diária que os demais.',
      },
    ],
    ask: 'A partir da chegada dos novos cavalos, a ração restante dura quantos dias?',
    alternatives: alts('6 dias', '7,5 dias', '8 dias', '10 dias', '12 dias'),
    answer: 'C',
    hints: [
      'Depois de 5 dias, sobra ração para 20 cavalos por mais 10 dias.',
      'Essa sobra equivale a 20 × 10 "porções-dia". Divida pelo novo número de cavalos.',
    ],
    solution: [
      { explanation: 'Desconte os cinco dias que já passaram.', calculation: ['15 − 5 = 10 dias'] },
      { explanation: 'Transforme a ração restante em porções de um cavalo por dia.', calculation: ['20 × 10 = 200 porções diárias'] },
      { explanation: 'Distribua as porções entre os 25 cavalos.', calculation: ['200 ÷ 25 = 8 dias'] },
    ],
    concept:
      'Em problemas com mudança no meio do caminho, separe em etapas: calcule o que sobrou e só então aplique a nova condição.',
    estimatedSeconds: 110,
    source: AUTORAL,
    verify: () => (20 * (15 - 5)) / (20 + 5),
  },
  {
    id: 'RZP-016',
    topic: 'razao-proporcao',
    subtopic: 'proporcao',
    difficulty: 3,
    skills: ['H16', 'H18'],
    stem: [
      {
        kind: 'p',
        text: 'Uma avó decidiu dividir R$ 36.000,00 entre seus três netos, de 2, 3 e 6 anos, em partes inversamente proporcionais às suas idades — assim, o mais novo, que ficará mais tempo sem renda própria, recebe a maior parte.',
      },
    ],
    ask: 'Quanto receberá o neto de 2 anos?',
    alternatives: alts('R$ 6.000,00', 'R$ 9.000,00', 'R$ 12.000,00', 'R$ 18.000,00', 'R$ 24.000,00'),
    answer: 'D',
    hints: [
      'Inversamente proporcional às idades = diretamente proporcional a 1/2, 1/3 e 1/6.',
      'Some os pesos: 1/2 + 1/3 + 1/6. O resultado é surpreendentemente simples.',
    ],
    solution: [
      'Pesos: 1/2, 1/3 e 1/6. Soma: 3/6 + 2/6 + 1/6 = 1.',
      { explanation: 'Neto de 2 anos.', calculation: ['(1/2) ÷ 1 × 36.000 = R$ 18.000,00'] },
      'Conferência: os outros recebem 12.000 e 6.000; total 36.000.',
    ],
    concept:
      'Dividir em partes inversamente proporcionais a a, b, c é o mesmo que dividir em partes diretamente proporcionais a 1/a, 1/b, 1/c.',
    estimatedSeconds: 120,
    source: AUTORAL,
    verify: () => (36000 * (1 / 2)) / (1 / 2 + 1 / 3 + 1 / 6),
  },
  {
    id: 'RZP-017',
    topic: 'razao-proporcao',
    subtopic: 'regra-de-tres-composta',
    difficulty: 4,
    skills: ['H16', 'H18'],
    stem: [
      {
        kind: 'p',
        text: 'Uma gráfica tem 4 impressoras idênticas que, trabalhando 5 horas por dia, imprimem 9.000 folhetos em 3 dias. Ela recebe um pedido de 12.000 folhetos. No primeiro dia, as 4 impressoras trabalham normalmente, 5 horas. No fim desse dia, uma impressora quebra, e as 3 restantes passam a trabalhar 6 horas por dia.',
      },
    ],
    ask: 'Quantos dias de trabalho, além do primeiro, serão necessários para concluir o pedido?',
    alternatives: alts('2', '3', '5', '6', '4'),
    answer: 'E',
    hints: [
      'Calcule a produção de uma impressora por hora: 9.000 ÷ (4 × 5 × 3).',
      'Veja quanto foi impresso no 1º dia, quanto falta, e quanto as 3 impressoras fazem por dia. Dias parciais contam como um dia de trabalho.',
    ],
    solution: [
      { explanation: 'Divida os folhetos pelo total de impressora-horas.', calculation: ['4 × 5 × 3 = 60 impressora-horas', '9.000 ÷ 60 = 150 folhetos por impressora-hora'] },
      { explanation: 'Calcule a produção do primeiro dia e o que ainda falta.', calculation: ['4 × 5 × 150 = 3.000 folhetos', '12.000 − 3.000 = 9.000 folhetos'] },
      'Novo ritmo: 3 × 6 × 150 = 2.700 folhetos por dia.',
      { explanation: 'São necessários dias inteiros: confira que três dias não bastam.', calculation: ['9.000 ÷ 2.700 ≈ 3,33 dias', '3 × 2.700 = 8.100 < 9.000', '4 × 2.700 = 10.800 ≥ 9.000'] },
    ],
    concept:
      'Quando o resultado de uma divisão representa dias de trabalho, uma fração de dia exige um dia a mais: arredonde para cima e interprete o contexto.',
    estimatedSeconds: 180,
    source: AUTORAL,
    verify: () => {
      const rate = 9000 / (4 * 5 * 3);
      const remaining = 12000 - 4 * 5 * rate;
      return Math.ceil(remaining / (3 * 6 * rate));
    },
  },
  {
    id: 'RZP-018',
    topic: 'razao-proporcao',
    subtopic: 'razao',
    difficulty: 1,
    skills: ['H3'],
    stem: [
      {
        kind: 'p',
        text: 'Um concurso público recebeu 4.800 inscrições para 120 vagas. Os jornais costumam divulgar a "relação candidato/vaga", isto é, quantos candidatos disputam cada vaga.',
      },
    ],
    ask: 'Qual é a relação candidato/vaga desse concurso?',
    alternatives: alts('4', '25', '48', '40', '400'),
    answer: 'D',
    hints: ['Relação candidato/vaga = candidatos ÷ vagas.', 'Calcule 4.800 ÷ 120.'],
    solution: [
      { explanation: 'Divida o total de candidatos pelo total de vagas.', calculation: ['4.800 ÷ 120 = 40 candidatos por vaga'] },
    ],
    concept: 'Uma razão "A por B" se calcula dividindo A por B — e responde "quantos A existem para cada B".',
    estimatedSeconds: 30,
    source: AUTORAL,
    verify: () => 4800 / 120,
  },
  {
    id: 'RZP-019',
    topic: 'razao-proporcao',
    subtopic: 'escala',
    difficulty: 2,
    skills: ['H11'],
    stem: [
      {
        kind: 'p',
        text: 'Um escritório de arquitetura vai construir a maquete de um prédio de 18 m de altura na escala 1 : 50.',
      },
    ],
    ask: 'Qual será a altura da maquete?',
    alternatives: alts('36 cm', '9 cm', '18 cm', '90 cm', '360 cm'),
    answer: 'A',
    hints: ['Na escala 1 : 50, cada comprimento da maquete é 1/50 do comprimento correspondente no prédio.', 'Converta 18 m para centímetros antes de dividir.'],
    solution: [
      { explanation: 'Desenvolva a conta na ordem indicada.', calculation: ['18 m = 1.800 cm'] },
      { explanation: 'Altura da maquete.', calculation: ['1.800 ÷ 50 = 36 cm'] },
    ],
    concept: 'Para obter a medida reduzida, divida a medida real pelo denominador da escala, na mesma unidade.',
    estimatedSeconds: 45,
    source: AUTORAL,
    verify: () => 1800 / 50,
  },
  {
    id: 'RZP-020',
    topic: 'razao-proporcao',
    subtopic: 'regra-de-tres',
    difficulty: 2,
    skills: ['H16'],
    stem: [
      {
        kind: 'p',
        text: 'A receita de um bolo para 8 pessoas leva 300 g de açúcar. Uma cozinheira vai preparar esse bolo para uma festa com 50 convidados, mantendo as proporções da receita.',
      },
    ],
    ask: 'Quantos gramas de açúcar serão necessários?',
    alternatives: alts('1.500 g', '1.600 g', '2.000 g', '2.400 g', '1.875 g'),
    answer: 'E',
    hints: ['Descubra quanto açúcar corresponde a 1 pessoa.', '300 ÷ 8 = 37,5 g por pessoa.'],
    solution: [
      { explanation: 'Por pessoa.', calculation: ['300 ÷ 8 = 37,5 g'] },
      { explanation: 'Para 50 pessoas.', calculation: ['37,5 × 50 = 1.875 g'] },
    ],
    concept: 'Reduzir à unidade ("quanto para 1?") é uma forma segura de resolver qualquer regra de três direta.',
    estimatedSeconds: 50,
    source: AUTORAL,
    verify: () => (300 * 50) / 8,
  },
]);
