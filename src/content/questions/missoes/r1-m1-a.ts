import { AUTORAL, alts, batch } from '../_helpers';

/** Missão r1-m1 — questões extras para repetição (lote a). Questões autorais. */
export const MISSAO_R1M1_A = batch([
  {
    id: 'RZP-101',
    topic: 'razao-proporcao',
    subtopic: 'razao',
    difficulty: 1,
    skills: ['H3'],
    stem: [
      {
        kind: 'p',
        text: 'A Secretaria Municipal de Saúde de uma cidade do interior paulista registrou, no ano passado, 3.360 nascidos vivos. A população estimada do município nesse ano era de 240.000 habitantes.',
      },
      {
        kind: 'p',
        text: 'A taxa de natalidade é a razão entre o número de nascidos vivos em um ano e a população, expressa em nascidos vivos para cada 1.000 habitantes.',
      },
    ],
    ask: 'A taxa de natalidade desse município no ano passado foi de',
    alternatives: alts('14 por mil', '140 por mil', '1,4 por mil', '71,4 por mil', '0,014 por mil'),
    answer: 'A',
    hints: [
      'A taxa compara os nascimentos com a população, mas é expressa para cada 1.000 habitantes, e não para cada habitante.',
      'Descubra quantos grupos de 1.000 habitantes existem na população: divida 240.000 por 1.000.',
    ],
    solution: [
      'Grupos de 1.000 habitantes: 240.000 ÷ 1.000 = 240.',
      'Nascidos vivos por grupo: 3.360 ÷ 240 = 14.',
      'Taxa de natalidade: 14 nascidos vivos por 1.000 habitantes (14 por mil).',
      'Armadilha: a razão direta 3.360 ÷ 240.000 = 0,014 é a taxa por habitante; multiplicá-la por 100 (1,4) ou por 10.000 (140) muda a base da comparação.',
      'Armadilha: 240.000 ÷ 3.360 ≈ 71,4 inverte a razão: seriam habitantes para cada nascimento.',
    ],
    concept:
      'Taxas demográficas são razões com uma base fixa (por 1.000 ou por 100.000 habitantes): taxa = (ocorrências ÷ população) × base. A base fixa permite comparar cidades de tamanhos diferentes.',
    estimatedSeconds: 50,
    source: AUTORAL,
    verify: () => 3360 / (240000 / 1000),
  },
  {
    id: 'RZP-102',
    topic: 'razao-proporcao',
    subtopic: 'razao',
    difficulty: 1,
    skills: ['H3', 'H10'],
    stem: [
      {
        kind: 'p',
        text: 'Durante uma atualização de sistema, o celular de Marina baixou um arquivo de 900 MB (megabytes) em 5 minutos. O aparelho informou que a taxa de download se manteve constante durante todo o processo.',
      },
    ],
    ask: 'Qual foi a taxa de download, em megabytes por segundo (MB/s)?',
    alternatives: alts('180 MB/s', '15 MB/s', '1,8 MB/s', '0,33 MB/s', '3 MB/s'),
    answer: 'E',
    hints: [
      'A taxa de download é a razão entre a quantidade de dados e o tempo gasto, e o tempo precisa estar na unidade pedida.',
      'Converta 5 minutos em segundos, lembrando que 1 minuto tem 60 segundos.',
    ],
    solution: [
      'Tempo em segundos: 5 × 60 = 300 s.',
      'Taxa: 900 MB ÷ 300 s = 3 MB/s.',
      'Armadilha: 900 ÷ 5 = 180 é a taxa em megabytes por minuto, e não por segundo.',
      'Armadilha: dividir 900 por 60 (15 MB/s) considera que o download durou apenas 1 minuto.',
      'Armadilha: tratar 5 minutos como 500 segundos daria 1,8 MB/s, mas cada minuto tem 60 segundos, e não 100.',
      'Armadilha: 300 ÷ 900 ≈ 0,33 inverte a razão: seriam segundos por megabyte.',
    ],
    concept:
      'Uma taxa é uma razão entre grandezas de naturezas diferentes (dados por tempo, quilômetros por hora). Antes de dividir, deixe cada grandeza na unidade pedida na resposta.',
    estimatedSeconds: 45,
    source: AUTORAL,
    verify: () => 900 / (5 * 60),
  },
  {
    id: 'RZP-103',
    topic: 'razao-proporcao',
    subtopic: 'razao',
    difficulty: 2,
    skills: ['H3', 'H25'],
    stem: [
      {
        kind: 'p',
        text: 'Em um supermercado de Belo Horizonte, o mesmo café torrado e moído, da mesma marca, é vendido em quatro embalagens diferentes, conforme a tabela.',
      },
      {
        kind: 'table',
        header: ['Embalagem', 'Massa de café', 'Preço'],
        rows: [
          ['Pacote pequeno', '250 g', 'R$ 9,50'],
          ['Pacote médio', '500 g', 'R$ 17,90'],
          ['Pacote grande', '1 kg', 'R$ 36,80'],
          ['Lata econômica', '2 kg', 'R$ 74,00'],
        ],
        caption: 'Preços do café por embalagem',
      },
    ],
    ask: 'Entre essas embalagens, o menor preço por quilograma de café é de',
    alternatives: alts('R$ 36,80', 'R$ 37,00', 'R$ 35,80', 'R$ 38,00', 'R$ 17,90'),
    answer: 'C',
    hints: [
      'Para comparar embalagens de tamanhos diferentes, calcule quanto custaria 1 kg de café em cada uma delas.',
      'Divida o preço de cada embalagem pela massa em quilogramas (250 g = 0,25 kg e 500 g = 0,5 kg).',
    ],
    solution: [
      'Pacote pequeno: 9,50 ÷ 0,25 = R$ 38,00 por kg (4 pacotes formam 1 kg).',
      'Pacote médio: 17,90 ÷ 0,5 = R$ 35,80 por kg (2 pacotes formam 1 kg).',
      'Pacote grande: 36,80 ÷ 1 = R$ 36,80 por kg.',
      'Lata econômica: 74,00 ÷ 2 = R$ 37,00 por kg.',
      'O menor preço por quilograma é R$ 35,80, o do pacote médio.',
      'Armadilha: a embalagem maior nem sempre é a mais vantajosa; só a razão preço/massa permite comparar.',
      'Armadilha: R$ 17,90 é o preço de meio quilograma, e não de um quilograma.',
    ],
    concept:
      'O preço unitário (preço ÷ quantidade) é uma razão que permite comparar produtos vendidos em quantidades diferentes: o mais vantajoso é o de menor preço por unidade de medida.',
    estimatedSeconds: 90,
    source: AUTORAL,
    verify: () => Math.min(9.5 / 0.25, 17.9 / 0.5, 36.8 / 1, 74 / 2),
  },
  {
    id: 'RZP-104',
    topic: 'razao-proporcao',
    subtopic: 'razao',
    difficulty: 3,
    skills: ['H16', 'H21'],
    stem: [
      {
        kind: 'p',
        text: 'Em uma academia de ginástica de Fortaleza, a razão entre o número de homens e o número de mulheres matriculados no turno da noite era de 3 para 5.',
      },
      {
        kind: 'p',
        text: 'Depois de uma campanha de divulgação, 24 mulheres se matricularam nesse turno; nenhum aluno saiu e nenhum outro homem se matriculou. Com isso, a razão entre o número de homens e o número de mulheres no turno da noite passou a ser de 1 para 2.',
      },
    ],
    ask: 'Quantos alunos passaram a estar matriculados no turno da noite após a campanha?',
    alternatives: alts('192 alunos', '144 alunos', '120 alunos', '216 alunos', '72 alunos'),
    answer: 'D',
    hints: [
      'O número de homens não mudou: a variação da razão se deve apenas às 24 novas alunas.',
      'Represente as quantidades iniciais como 3k homens e 5k mulheres e escreva a nova razão em função de k.',
    ],
    solution: [
      'Antes da campanha: 3k homens e 5k mulheres, para algum número natural k.',
      'Depois: 3k homens e 5k + 24 mulheres, com 3k ÷ (5k + 24) = 1/2.',
      'Multiplicando em cruz: 6k = 5k + 24, logo k = 24.',
      'Homens: 3 × 24 = 72; mulheres antes: 5 × 24 = 120; mulheres depois: 120 + 24 = 144.',
      'Total após a campanha: 72 + 144 = 216 alunos.',
      'Conferência: 72/144 = 1/2.',
      'Armadilha: 192 alunos (72 + 120) é o total antes da campanha; a pergunta pede o total depois dela.',
    ],
    concept:
      'Quando uma das grandezas de uma razão permanece fixa, a mudança na razão revela quanto a outra variou. Representar as quantidades por 3k e 5k transforma a situação em uma equação do 1º grau.',
    estimatedSeconds: 150,
    source: AUTORAL,
    verify: () => {
      // 3k / (5k + 24) = 1/2  →  2 · 3k = 5k + 24
      const k = 24 / (2 * 3 - 5);
      return 3 * k + (5 * k + 24);
    },
  },
  {
    id: 'RZP-105',
    topic: 'razao-proporcao',
    subtopic: 'escala',
    difficulty: 1,
    skills: ['H11'],
    stem: [
      {
        kind: 'p',
        text: 'O mapa de um parque estadual em Minas Gerais traz uma escala gráfica: um segmento de 2 cm, desenhado no rodapé do mapa, corresponde a 500 m no terreno.',
      },
      {
        kind: 'p',
        text: 'Com um barbante, um guia mediu no mapa o percurso de uma trilha até uma cachoeira e obteve 7 cm.',
      },
    ],
    ask: 'Qual é o comprimento real dessa trilha?',
    alternatives: alts('3,5 km', '1,75 km', '17,5 km', '7 km', '0,175 km'),
    answer: 'B',
    hints: [
      'A escala gráfica informa quanto vale no terreno um segmento de 2 cm, e não de 1 cm.',
      'Descubra quantos metros reais correspondem a 1 cm do mapa e depois use os 7 cm medidos.',
    ],
    solution: [
      '2 cm no mapa correspondem a 500 m; logo, 1 cm corresponde a 500 ÷ 2 = 250 m.',
      'Trilha: 7 × 250 = 1.750 m.',
      'Em quilômetros: 1.750 ÷ 1.000 = 1,75 km.',
      'Armadilha: multiplicar 7 por 500 m (3,5 km) supõe que cada 1 cm do mapa vale 500 m.',
      'Armadilha: multiplicar por 2 em vez de dividir (7 × 1.000 m = 7 km) inverte a leitura da escala gráfica.',
    ],
    concept:
      'A escala gráfica é um segmento que mostra a correspondência entre o mapa e a realidade. Reduza-a a 1 cm (ou conte quantos segmentos cabem na medida) e só então aplique-a, convertendo a unidade no final.',
    estimatedSeconds: 50,
    source: AUTORAL,
    verify: () => ((7 / 2) * 500) / 1000,
  },
  {
    id: 'RZP-106',
    topic: 'razao-proporcao',
    subtopic: 'escala',
    difficulty: 1,
    skills: ['H11'],
    stem: [
      {
        kind: 'p',
        text: 'Um livro didático de Ciências apresenta a ilustração de uma abelha desenhada na escala 5 : 1. Na ilustração, o corpo da abelha mede 6 cm de comprimento.',
      },
    ],
    ask: 'Qual é o comprimento real do corpo dessa abelha?',
    alternatives: alts('30 cm', '0,12 cm', '11 cm', '1 cm', '1,2 cm'),
    answer: 'E',
    hints: [
      'Na escala 5 : 1, o primeiro número se refere ao desenho e o segundo à realidade: o desenho é maior do que o inseto.',
      'Monte a razão desenho/real = 5/1 e substitua a medida do desenho, 6 cm.',
    ],
    solution: [
      'Escala 5 : 1: cada 5 cm no desenho correspondem a 1 cm na realidade.',
      'Medida real: 6 ÷ 5 = 1,2 cm (ou seja, 12 mm).',
      'Armadilha: multiplicar 6 por 5 (30 cm) trataria a ilustração como uma redução, mas ela é uma ampliação.',
      'Armadilha: somar ou subtrair os números (6 + 5 ou 6 − 5) não preserva a razão entre as medidas.',
    ],
    concept:
      'Escala é a razão desenho : realidade. Quando o primeiro número é maior que o segundo, como em 5 : 1, trata-se de uma ampliação, comum em ilustrações de objetos muito pequenos; a medida real é a do desenho dividida pelo fator de ampliação.',
    estimatedSeconds: 40,
    source: AUTORAL,
    verify: () => 6 / 5,
  },
  {
    id: 'RZP-107',
    topic: 'razao-proporcao',
    subtopic: 'escala',
    difficulty: 2,
    skills: ['H11', 'H12'],
    stem: [
      {
        kind: 'p',
        text: 'A planta baixa de um apartamento foi desenhada na escala 1 : 200. Para detalhar a cozinha, um arquiteto vai redesenhá-la em outra folha, na escala 1 : 50.',
      },
      {
        kind: 'p',
        text: 'Na planta original, a bancada da pia é representada por um segmento de 1,4 cm.',
      },
    ],
    ask: 'Qual será o comprimento da bancada no novo desenho?',
    alternatives: alts('5,6 cm', '0,35 cm', '2,8 cm', '4 cm', '56 cm'),
    answer: 'A',
    hints: [
      'Os dois desenhos representam a mesma bancada real. Descubra primeiro a medida real e depois represente-a na nova escala.',
      'Na escala 1 : 200, cada 1 cm da planta corresponde a 200 cm reais; calcule 1,4 × 200.',
    ],
    solution: [
      'Medida real: 1,4 × 200 = 280 cm (2,8 m).',
      'Na escala 1 : 50: 280 ÷ 50 = 5,6 cm.',
      'Atalho: a nova escala é 200 ÷ 50 = 4 vezes maior que a original, então o desenho fica 4 vezes maior: 1,4 × 4 = 5,6 cm.',
      'Armadilha: dividir 1,4 por 4 (0,35 cm) inverte o efeito; a escala 1 : 50 é maior que 1 : 200 e gera um desenho maior.',
      'Armadilha: 2,8 é a medida real em metros, e não a medida no novo desenho.',
    ],
    concept:
      'Quanto menor o denominador, maior a escala e mais detalhado o desenho. Para trocar de escala, passe pela medida real ou multiplique pela razão entre os denominadores (denominador antigo ÷ denominador novo).',
    estimatedSeconds: 75,
    source: AUTORAL,
    verify: () => (1.4 * 200) / 50,
  },
  {
    id: 'RZP-108',
    topic: 'razao-proporcao',
    subtopic: 'escala',
    difficulty: 3,
    skills: ['H11', 'H14'],
    stem: [
      {
        kind: 'p',
        text: 'Uma estudante de Arquitetura vai desenhar a planta de um galpão retangular de 36 m por 30 m. A área útil da folha, onde o desenho deve caber inteiro, é um retângulo de 26 cm por 18 cm.',
      },
      {
        kind: 'p',
        text: 'O lado maior do galpão ficará paralelo ao lado maior da folha. As escalas disponíveis são 1 : 100, 1 : 125, 1 : 150, 1 : 200 e 1 : 250, e ela quer obter o maior desenho possível dentro da área útil.',
      },
    ],
    ask: 'Qual escala ela deve escolher?',
    alternatives: alts('1 : 150', '1 : 250', '1 : 200', '1 : 125', '1 : 100'),
    answer: 'C',
    hints: [
      'Para cada escala, calcule as duas dimensões do desenho; a escala só serve se as duas couberem na área útil.',
      'Converta as medidas do galpão para centímetros (36 m = 3.600 cm e 30 m = 3.000 cm) e divida-as pelo denominador de cada escala.',
    ],
    solution: [
      'Medidas reais: 3.600 cm por 3.000 cm.',
      '1 : 100 → 36 cm × 30 cm e 1 : 125 → 28,8 cm × 24 cm: o comprimento já passa de 26 cm.',
      '1 : 150 → 24 cm × 20 cm: o comprimento cabe, mas a largura passa de 18 cm.',
      '1 : 200 → 18 cm × 15 cm: cabe, pois 18 ≤ 26 e 15 ≤ 18.',
      '1 : 250 → 14,4 cm × 12 cm: também cabe, mas gera um desenho menor.',
      'Logo, a escala que gera o maior desenho dentro da área útil é 1 : 200.',
      'Armadilha: conferir só o lado maior levaria a 1 : 150, mas aí a largura de 20 cm não cabe nos 18 cm da folha.',
      'Armadilha: 1 : 250 tem o maior denominador, mas gera o menor desenho entre as escalas que cabem.',
    ],
    concept:
      'Quanto menor o denominador da escala, maior o desenho. Para escolher a escala, teste todas as dimensões: o desenho precisa caber inteiro, e a melhor escala é a de menor denominador que ainda respeita todos os limites.',
    estimatedSeconds: 180,
    source: AUTORAL,
    verify: () => {
      const escalas = [100, 125, 150, 200, 250];
      const cabe = (n: number) => 3600 / n <= 26 && 3000 / n <= 18;
      return Math.min(...escalas.filter(cabe));
    },
  },
  {
    id: 'RZP-109',
    topic: 'razao-proporcao',
    subtopic: 'proporcao',
    difficulty: 1,
    skills: ['H16'],
    stem: [
      {
        kind: 'p',
        text: 'Em uma manhã ensolarada em uma praia de Maceió, Júlia, que tem 1,60 m de altura, percebeu que sua sombra na areia media 0,40 m. No mesmo instante, a sombra de um coqueiro vertical, em terreno plano, media 3,5 m.',
      },
      {
        kind: 'p',
        text: 'Considere que, no mesmo instante, a altura de cada objeto vertical e o comprimento de sua sombra são proporcionais.',
      },
    ],
    ask: 'Qual é a altura desse coqueiro?',
    alternatives: alts('5,6 m', '0,875 m', '4,7 m', '14 m', '1,4 m'),
    answer: 'D',
    hints: [
      'A razão entre altura e sombra é a mesma para Júlia e para o coqueiro, pois as medidas foram feitas no mesmo instante.',
      'Calcule quantas vezes a altura de Júlia é maior que a sombra dela: 1,60 ÷ 0,40.',
    ],
    solution: [
      'Razão altura/sombra de Júlia: 1,60 ÷ 0,40 = 4, isto é, a altura é 4 vezes a sombra.',
      'Proporção para o coqueiro: h ÷ 3,5 = 1,60 ÷ 0,40 = 4.',
      'Altura do coqueiro: h = 4 × 3,5 = 14 m.',
      'Armadilha: somar a diferença (3,5 + 1,2 = 4,7 m) não mantém a proporção; as medidas se multiplicam pelo mesmo fator.',
      'Armadilha: 3,5 × 0,40 ÷ 1,60 = 0,875 m inverte a razão e daria um coqueiro menor que a própria sombra.',
    ],
    concept:
      'Em uma proporção a/b = c/d, as duas razões são iguais. Objetos verticais iluminados pelo Sol no mesmo instante formam sombras proporcionais às suas alturas, o que permite medir alturas difíceis de alcançar.',
    estimatedSeconds: 45,
    source: AUTORAL,
    verify: () => (3.5 * 1.6) / 0.4,
  },
  {
    id: 'RZP-110',
    topic: 'razao-proporcao',
    subtopic: 'proporcao',
    difficulty: 2,
    skills: ['H16', 'H21'],
    stem: [
      {
        kind: 'p',
        text: 'Uma cooperativa de reciclagem de Curitiba registrou que, em determinado mês, a razão entre a massa de papelão e a massa de plástico recolhidas foi de 7 para 4. Nesse mês, a massa de papelão superou a de plástico em 1.350 kg.',
      },
    ],
    ask: 'Qual foi a massa de plástico recolhida pela cooperativa nesse mês?',
    alternatives: alts('3.150 kg', '1.800 kg', '450 kg', '5.400 kg', '4.950 kg'),
    answer: 'B',
    hints: [
      'Pense na massa de papelão como 7 partes iguais e na de plástico como 4 dessas partes. A diferença de 1.350 kg corresponde a quantas partes?',
      'A diferença entre as massas equivale a 7 − 4 = 3 partes; comece descobrindo o valor de uma parte.',
    ],
    solution: [
      'Papelão: 7 partes; plástico: 4 partes; diferença: 7 − 4 = 3 partes.',
      '3 partes = 1.350 kg, logo 1 parte = 1.350 ÷ 3 = 450 kg.',
      'Plástico: 4 × 450 = 1.800 kg (e papelão: 7 × 450 = 3.150 kg).',
      'Conferência: 3.150 − 1.800 = 1.350 kg e 3.150/1.800 = 7/4.',
      'Armadilha: tomar os 1.350 kg como uma única parte leva a 4 × 1.350 = 5.400 kg.',
      'Armadilha: 3.150 kg é a massa de papelão, e 4.950 kg é a soma das duas massas.',
    ],
    concept:
      'Em uma razão a : b, as quantidades valem a e b partes iguais. Se for dada a diferença entre elas, ela corresponde a (a − b) partes; se for dada a soma, a (a + b) partes.',
    estimatedSeconds: 75,
    source: AUTORAL,
    verify: () => (1350 / (7 - 4)) * 4,
  },
  {
    id: 'RZP-111',
    topic: 'razao-proporcao',
    subtopic: 'proporcao',
    difficulty: 2,
    skills: ['H16', 'H18'],
    stem: [
      {
        kind: 'p',
        text: 'Um agricultor do Paraná preparou 100 litros de uma solução para fertirrigação, misturando fertilizante líquido concentrado e água na razão de 1 para 24 (1 parte de fertilizante para cada 24 partes de água, em volume).',
      },
      {
        kind: 'p',
        text: 'Em seguida, leu na embalagem que, para a sua plantação, a razão recomendada é de 1 para 16. Ele decidiu corrigir a solução acrescentando apenas fertilizante, sem retirar nem acrescentar água.',
      },
    ],
    ask: 'Quantos litros de fertilizante ele deve acrescentar à solução?',
    alternatives: alts('6 L', '2,25 L', '8 L', '1,9 L', '2 L'),
    answer: 'E',
    hints: [
      'Descubra primeiro quanto há de fertilizante e de água nos 100 litros; a quantidade de água não vai mudar.',
      'Na razão 1 : 24, a mistura tem 1 + 24 = 25 partes iguais; calcule o valor de uma parte.',
    ],
    solution: [
      'Partes da mistura inicial: 1 + 24 = 25; cada parte vale 100 ÷ 25 = 4 L.',
      'Fertilizante: 4 L; água: 24 × 4 = 96 L.',
      'Na razão 1 : 16, com os mesmos 96 L de água: fertilizante = 96 ÷ 16 = 6 L.',
      'É preciso acrescentar 6 − 4 = 2 L de fertilizante.',
      'Conferência: 6 L de fertilizante para 96 L de água dá 6/96 = 1/16.',
      'Armadilha: 6 L é a quantidade total de fertilizante na solução corrigida, mas 4 L já estavam nela.',
      'Armadilha: calcular 1/16 de 100 L (6,25 L) trata a razão 1 : 16 como fração do total e ignora que a água continua com 96 L.',
    ],
    concept:
      'Uma razão 1 : 24 entre os componentes de uma mistura não é o mesmo que 1/24 do total: a mistura tem 25 partes. Para corrigir uma mistura, mantenha fixo o componente que não muda e recalcule o outro pela nova razão.',
    estimatedSeconds: 120,
    source: AUTORAL,
    verify: () => {
      const fertilizanteInicial = 100 / (1 + 24);
      const agua = 24 * fertilizanteInicial;
      return agua / 16 - fertilizanteInicial;
    },
  },
]);
