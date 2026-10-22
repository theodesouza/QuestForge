import { AUTORAL, alts, batch } from '../_helpers';

/** Missão r1-m1 — questões extras para repetição (lote b). Questões autorais. */
export const MISSAO_R1M1_B = batch([
  {
    id: 'RZP-112',
    topic: 'razao-proporcao',
    subtopic: 'razao',
    difficulty: 1,
    skills: ['H3', 'H25'],
    stem: [
      {
        kind: 'p',
        text: 'A biblioteca pública municipal de uma cidade potiguar registrou o número de livros emprestados por mês durante uma campanha de incentivo à leitura. O gráfico apresenta os dados de março a junho.',
      },
      {
        kind: 'bars',
        title: 'Livros emprestados por mês',
        unit: 'livros',
        data: [
          { label: 'Março', value: 1500 },
          { label: 'Abril', value: 1200 },
          { label: 'Maio', value: 2700 },
          { label: 'Junho', value: 2100 },
        ],
      },
    ],
    ask: 'A razão entre o maior e o menor número mensal de livros emprestados nesse período, nessa ordem, é',
    alternatives: alts('1,8', '0,44', '2,25', '1,25', '1,75'),
    answer: 'C',
    hints: [
      'Localize no gráfico a barra mais alta e a barra mais baixa; a razão pedida compara esses dois valores, nessa ordem.',
      'Escreva a fração com o maior valor no numerador e o menor no denominador e efetue a divisão.',
    ],
    solution: [
      'Maior número de empréstimos: maio, com 2.700 livros.',
      'Menor número de empréstimos: abril, com 1.200 livros.',
      { explanation: 'Razão.', calculation: ['2.700 ÷ 1.200 = 27/12', '= 9/4', '= 2,25'] },
      'Ou seja, em maio foram emprestados 2,25 vezes os livros emprestados em abril.',
      'Armadilha: 1.200 ÷ 2.700 ≈ 0,44 inverte a ordem pedida (menor para maior).',
      'Armadilha: 2.700 ÷ 1.500 = 1,8 e 2.100 ÷ 1.200 = 1,75 usam meses errados; confira qual barra é a mais alta e qual é a mais baixa.',
      'Armadilha: (2.700 − 1.200) ÷ 1.200 = 1,25 compara a diferença entre os valores com o menor deles, e não o maior valor com o menor.',
    ],
    concept:
      'A razão entre a e b, nessa ordem, é a ÷ b e indica quantas vezes a contém b. A ordem importa: b ÷ a é a razão inversa.',
    estimatedSeconds: 45,
    source: AUTORAL,
    verify: () => Math.max(1500, 1200, 2700, 2100) / Math.min(1500, 1200, 2700, 2100),
  },
  {
    id: 'RZP-113',
    topic: 'razao-proporcao',
    subtopic: 'razao',
    difficulty: 2,
    skills: ['H3', 'H16'],
    stem: [
      {
        kind: 'p',
        text: 'Um atacadista de hortifrúti recebeu um caminhão com caixas de tomate, cebola e batata. Ao conferir a carga, o encarregado do depósito registrou as seguintes razões entre os números de caixas:',
      },
      {
        kind: 'math',
        lines: ['tomate : cebola = 3 : 2', 'cebola : batata = 4 : 5'],
      },
      {
        kind: 'p',
        text: 'O caminhão trouxe 36 caixas de tomate.',
      },
    ],
    ask: 'Quantas caixas de batata o caminhão trouxe?',
    alternatives: alts('30 caixas', '45 caixas', '24 caixas', '90 caixas', '60 caixas'),
    answer: 'A',
    hints: [
      'A cebola aparece nas duas razões: ela é a ponte entre o tomate e a batata.',
      'Use a primeira razão para descobrir quantas caixas de cebola vieram no caminhão.',
    ],
    solution: [
      { explanation: 'A primeira razão compara tomate e cebola. Use as 36 caixas de tomate para achar a quantidade de caixas de cebola.', calculation: ['cebola = 36 × 2/3', 'cebola = 72 ÷ 3', 'cebola = 24 caixas'] },
      { explanation: 'A segunda razão compara cebola e batata. Use a cebola calculada no passo anterior.', calculation: ['batata = 24 × 5/4', 'batata = 120 ÷ 4', 'batata = 30 caixas'] },
      'Outra forma: igualando o termo da cebola (3 : 2 = 6 : 4), obtém-se tomate : cebola : batata = 6 : 4 : 5. Com 36 caixas de tomate, cada parte vale 36 ÷ 6 = 6, e a batata tem 5 × 6 = 30 caixas.',
      'Armadilha: juntar as razões como tomate : batata = 3 : 5 (60 caixas) ignora que a cebola vale 2 partes na primeira razão e 4 partes na segunda.',
      'Armadilha: aplicar a razão 4 : 5 diretamente ao tomate (36 × 5 ÷ 4 = 45 caixas) usa uma razão que compara cebola e batata.',
      'Armadilha: 24 é o número de caixas de cebola, e 90 é o total de caixas do caminhão.',
    ],
    concept:
      'Para combinar razões com uma grandeza em comum (a : b e b : c), torne igual o termo comum nas duas, multiplicando cada razão por um fator conveniente; assim se obtém a razão a : b : c.',
    estimatedSeconds: 80,
    source: AUTORAL,
    verify: () => {
      const cebola = (36 * 2) / 3;
      return (cebola * 5) / 4;
    },
  },
  {
    id: 'RZP-114',
    topic: 'razao-proporcao',
    subtopic: 'razao',
    difficulty: 3,
    skills: ['H3', 'H10', 'H16'],
    stem: [
      {
        kind: 'p',
        text: 'Na bicicleta de Diego, a coroa (engrenagem presa aos pedais) tem 48 dentes, e a catraca (engrenagem presa à roda traseira) tem 16 dentes. As duas são ligadas pela corrente, que, ao se mover, passa pelo mesmo número de dentes nas duas engrenagens. A catraca e a roda traseira giram juntas, e essa roda tem 2 m de circunferência.',
      },
      {
        kind: 'p',
        text: 'Em um treino em uma ciclovia de Brasília, Diego manteve a cadência de 75 pedaladas por minuto (cada pedalada é uma volta completa dos pedais), sem trocar de marcha e sem que a roda derrapasse.',
      },
    ],
    ask: 'Qual foi a velocidade de Diego nesse treino, em quilômetros por hora?',
    alternatives: alts('9 km/h', '7,5 km/h', '3 km/h', '27 km/h', '2,7 km/h'),
    answer: 'D',
    hints: [
      'Descubra primeiro quantas voltas a roda traseira dá a cada volta dos pedais, lembrando que a corrente passa o mesmo número de dentes na coroa e na catraca.',
      'Divida o número de dentes da coroa pelo número de dentes da catraca; em seguida, calcule quantos metros a bicicleta avança a cada pedalada.',
    ],
    solution: [
      'Em uma volta dos pedais, a corrente passa 48 dentes. Na catraca de 16 dentes, isso corresponde a 48 ÷ 16 = 3 voltas da roda traseira.',
      { explanation: 'Distância por pedalada.', calculation: ['3 × 2 m = 6 m'] },
      { explanation: 'Distância por minuto.', calculation: ['75 × 6 = 450 m'] },
      'Distância por hora: 450 × 60 = 27.000 m = 27 km. A velocidade é de 27 km/h.',
      'Armadilha: ignorar as engrenagens (uma volta da roda por pedalada) dá 75 × 2 × 60 = 9.000 m por hora, ou seja, 9 km/h.',
      'Armadilha: usar a razão invertida, 16 ÷ 48 = 1/3 de volta por pedalada, dá 3 km/h.',
      'Armadilha: dividir 450 por 60 (7,5) em vez de multiplicar; em uma hora, a bicicleta anda 60 vezes o que anda em um minuto.',
      'Armadilha: 27.000 m correspondem a 27 km, pois 1 km = 1.000 m; usar 10.000 m levaria a 2,7 km/h.',
    ],
    concept:
      'Em engrenagens ligadas por corrente, a razão de transmissão (dentes da coroa ÷ dentes da catraca) indica quantas voltas a roda dá a cada volta do pedal. Problemas assim se resolvem encadeando razões (voltas por pedalada, metros por volta, pedaladas por minuto) e conferindo as unidades a cada passo.',
    estimatedSeconds: 180,
    source: AUTORAL,
    verify: () => {
      const voltasPorPedalada = 48 / 16;
      const metrosPorMinuto = 75 * voltasPorPedalada * 2;
      return (metrosPorMinuto * 60) / 1000;
    },
  },
  {
    id: 'RZP-115',
    topic: 'razao-proporcao',
    subtopic: 'escala',
    difficulty: 1,
    skills: ['H11'],
    stem: [
      {
        kind: 'p',
        text: 'Lucas coleciona miniaturas de aviões comerciais. A mais recente, feita na escala 1 : 400, tem 9,5 cm de comprimento, do nariz à cauda.',
      },
    ],
    ask: 'Qual é o comprimento real do avião representado por essa miniatura?',
    alternatives: alts('3,8 m', '38 m', '380 m', '0,38 m', '3.800 m'),
    answer: 'B',
    hints: [
      'Na escala 1 : 400, cada medida da miniatura corresponde a uma medida 400 vezes maior no avião real.',
      'Calcule o comprimento real em centímetros e só depois converta para metros, lembrando que 1 m = 100 cm.',
    ],
    solution: [
      'Escala 1 : 400: 1 cm na miniatura corresponde a 400 cm no avião real.',
      { explanation: 'Comprimento real.', calculation: ['9,5 × 400 = 3.800 cm'] },
      { explanation: 'Em metros.', calculation: ['3.800 ÷ 100 = 38 m'] },
      'Armadilha: 3.800 é a medida em centímetros; escrever 3.800 m esquece a conversão de unidade.',
      'Armadilha: 3,8 m (dividir por 1.000), 380 m (dividir por 10) e 0,38 m (dividir por 10.000) vêm de conversões erradas entre centímetros e metros; 1 m tem 100 cm.',
    ],
    concept:
      'Em uma escala 1 : n, as medidas reais são n vezes as medidas do modelo, na mesma unidade. Faça a multiplicação na unidade do modelo e converta para a unidade pedida apenas no final.',
    estimatedSeconds: 40,
    source: AUTORAL,
    verify: () => (9.5 * 400) / 100,
  },
  {
    id: 'RZP-116',
    topic: 'razao-proporcao',
    subtopic: 'escala',
    difficulty: 2,
    skills: ['H11', 'H12'],
    stem: [
      {
        kind: 'p',
        text: 'No arquipélago do Marajó, no Pará, muitos pacientes são levados ao hospital por ambulanchas, lanchas equipadas como ambulâncias. Em um atendimento, uma ambulancha levou um paciente de uma comunidade ribeirinha até o hospital do município, navegando pelo rio, em 1 h 30 min.',
      },
      {
        kind: 'p',
        text: 'Em um mapa na escala 1 : 300.000, o trajeto percorrido pela ambulancha ao longo do rio mede 20 cm.',
      },
    ],
    ask: 'Qual foi a velocidade média da ambulancha nesse trajeto, em quilômetros por hora?',
    alternatives: alts('90 km/h', '400 km/h', '60 km/h', '4 km/h', '40 km/h'),
    answer: 'E',
    hints: [
      'Descubra primeiro a distância real do trajeto; só depois use o tempo de viagem para calcular a velocidade média.',
      'Na escala 1 : 300.000, 1 cm no mapa corresponde a 300.000 cm reais; calcule a distância em centímetros e converta para quilômetros (1 km = 100.000 cm).',
    ],
    solution: [
      { explanation: 'Distância real.', calculation: ['20 × 300.000 = 6.000.000 cm'] },
      { explanation: 'Em quilômetros.', calculation: ['6.000.000 ÷ 100.000 = 60 km'] },
      { explanation: 'Tempo em horas.', calculation: ['1 h 30 min = 1 h + 30/60 h', '= 1,5 h'] },
      { explanation: 'Velocidade média.', calculation: ['60 km ÷ 1,5 h = 40 km/h'] },
      'Armadilha: dividir os 60 km por 1 h (60 km/h) desconsidera os 30 minutos de viagem.',
      'Armadilha: multiplicar a distância pelo tempo (60 × 1,5 = 90) não dá a velocidade; velocidade média = distância ÷ tempo.',
      'Armadilha: usar 1 km = 10.000 cm leva a 600 km e a 400 km/h; usar 1 km = 1.000.000 cm leva a 6 km e a 4 km/h.',
    ],
    concept:
      'A escala transforma a medida no mapa em distância real; em seguida, velocidade média = distância ÷ tempo, com o tempo em horas. Atenção às conversões: 1 km = 100.000 cm e 30 min = 0,5 h.',
    estimatedSeconds: 90,
    source: AUTORAL,
    verify: () => (20 * 300000) / 100000 / 1.5,
  },
  {
    id: 'RZP-117',
    topic: 'razao-proporcao',
    subtopic: 'escala',
    difficulty: 3,
    skills: ['H11', 'H12'],
    stem: [
      {
        kind: 'p',
        text: 'Para testar o sistema de drenagem de um reservatório de água que será construído em uma indústria de Joinville, uma equipe de engenharia montou uma maquete do reservatório na escala 1 : 20, com todas as dimensões internas reduzidas nessa mesma escala.',
      },
      {
        kind: 'p',
        text: 'Em um dos testes, a maquete ficou completamente cheia com 4,5 litros de água. Considere 1 m³ = 1.000 L.',
      },
    ],
    ask: 'Qual é a capacidade do reservatório real, em metros cúbicos?',
    alternatives: alts('36 m³', '1,8 m³', '8 m³', '0,09 m³', '0,27 m³'),
    answer: 'A',
    hints: [
      'A escala 1 : 20 vale para comprimentos. O volume depende de três dimensões (comprimento, largura e altura), e cada uma delas é 20 vezes maior no reservatório real.',
      'Calcule por quanto o volume fica multiplicado quando as três dimensões são multiplicadas por 20.',
    ],
    solution: [
      'Cada dimensão do reservatório real é 20 vezes a dimensão correspondente da maquete.',
      'O volume fica multiplicado por 20 × 20 × 20 = 20³ = 8.000.',
      { explanation: 'Capacidade real.', calculation: ['4,5 × 8.000 = 36.000 L'] },
      { explanation: 'Em metros cúbicos.', calculation: ['36.000 ÷ 1.000 = 36 m³'] },
      'Armadilha: multiplicar apenas por 20 (90 L = 0,09 m³) aplica ao volume a razão entre comprimentos.',
      'Armadilha: multiplicar por 20² = 400 (1.800 L = 1,8 m³) usa a razão entre áreas, e não entre volumes.',
      'Armadilha: calcular 20³ como 20 × 3 = 60 leva a 270 L = 0,27 m³.',
      'Armadilha: 8 m³ equivale a 8.000 L, que é só o fator 20³; ainda falta multiplicá-lo pelos 4,5 L da maquete.',
    ],
    concept:
      'Se a escala entre comprimentos é 1 : k, a razão entre áreas é 1 : k² e a razão entre volumes (e capacidades) é 1 : k³.',
    estimatedSeconds: 150,
    source: AUTORAL,
    verify: () => (4.5 * 20 ** 3) / 1000,
  },
  {
    id: 'RZP-118',
    topic: 'razao-proporcao',
    subtopic: 'proporcao',
    difficulty: 1,
    skills: ['H16'],
    stem: [
      {
        kind: 'p',
        text: 'Em um domingo de calor em Cuiabá, Seu Antônio começou a encher a piscina inflável dos netos com uma mangueira, que manteve a vazão constante. Depois de 18 minutos, a água ocupava 3/8 da capacidade da piscina.',
      },
    ],
    ask: 'Contando desde o início, quanto tempo a mangueira levará para encher a piscina completamente?',
    alternatives: alts('30 min', '54 min', '6,75 min', '48 min', '144 min'),
    answer: 'D',
    hints: [
      'Com vazão constante, o tempo é diretamente proporcional ao volume de água: encher 3/8 da piscina levou 18 minutos.',
      'Descubra quanto tempo a mangueira leva para encher 1/8 da piscina.',
    ],
    solution: [
      '3/8 da piscina em 18 min, logo 1/8 da piscina em 18 ÷ 3 = 6 min.',
      { explanation: 'Piscina inteira (8/8).', calculation: ['8 × 6 = 48 min'] },
      'Pela proporção: 18 ÷ t = (3/8) ÷ 1, logo t = 18 ÷ 3/8 = 18 × 8/3 = 48 min.',
      'Armadilha: 30 min é o tempo que ainda falta para encher os 5/8 restantes, mas a pergunta conta o tempo desde o início.',
      'Armadilha: multiplicar 18 por 3/8 (6,75 min) em vez de dividir dá um tempo menor que os 18 minutos já gastos.',
      'Armadilha: 18 × 8 = 144 e 18 × 3 = 54 usam só um dos termos da fração.',
    ],
    concept:
      'Quando duas grandezas são diretamente proporcionais (volume e tempo, com vazão constante), a razão entre elas é constante. Reduzir à unidade (quanto tempo para 1/8?) ajuda a resolver proporções que envolvem frações.',
    estimatedSeconds: 50,
    source: AUTORAL,
    verify: () => 18 / (3 / 8),
  },
  {
    id: 'RZP-119',
    topic: 'razao-proporcao',
    subtopic: 'proporcao',
    difficulty: 1,
    skills: ['H15', 'H16'],
    stem: [
      {
        kind: 'p',
        text: 'Em uma feira livre de Salvador, um vendedor de frutas usa uma balança de gancho, de mola, para pesar as jacas que vende. Nessa balança, o alongamento da mola é diretamente proporcional à massa pendurada no gancho: um objeto de 2 kg provoca um alongamento de 5 cm.',
      },
      {
        kind: 'p',
        text: 'Ao pendurar uma jaca no gancho, ele observou um alongamento de 8 cm.',
      },
    ],
    ask: 'Qual é a massa dessa jaca?',
    alternatives: alts('5 kg', '3,2 kg', '1,25 kg', '20 kg', '1,2 kg'),
    answer: 'B',
    hints: [
      'Como as grandezas são diretamente proporcionais, a razão entre massa e alongamento é a mesma para qualquer objeto pendurado.',
      'Calcule quantos quilogramas correspondem a 1 cm de alongamento da mola.',
    ],
    solution: [
      { explanation: 'Massa por centímetro de alongamento.', calculation: ['2 kg ÷ 5 cm = 0,4 kg/cm'] },
      { explanation: 'Massa da jaca.', calculation: ['8 × 0,4 = 3,2 kg'] },
      'Pela proporção: 2/5 = m/8, logo m = 2 × 8 ÷ 5 = 3,2 kg.',
      'Armadilha: 8 × 2,5 = 20 usa a razão invertida (2,5 cm por quilograma) como se fosse quilogramas por centímetro.',
      'Armadilha: somar à massa de referência a diferença entre os alongamentos (8 − 5 = 3, e 2 + 3 = 5 kg) não mantém a proporção; as grandezas variam pelo mesmo fator, e não pela mesma quantidade.',
      'Armadilha: 5 × 2 ÷ 8 = 1,25 kg troca a posição dos dados na proporção, e 1,2 kg corresponde apenas aos 3 cm de alongamento a mais.',
    ],
    concept:
      'Duas grandezas são diretamente proporcionais quando a razão entre elas é constante: se uma é multiplicada por um número, a outra também é. Em uma balança de mola, o alongamento é proporcional à massa, por isso uma única medida de referência basta para calibrá-la.',
    estimatedSeconds: 45,
    source: AUTORAL,
    verify: () => (8 * 2) / 5,
  },
  {
    id: 'RZP-120',
    topic: 'razao-proporcao',
    subtopic: 'proporcao',
    difficulty: 2,
    skills: ['H16', 'H17'],
    stem: [
      {
        kind: 'p',
        text: 'Para estimar quantos peixes de certa espécie vivem em uma lagoa do Pantanal, uma equipe de biólogos usou o método de captura e recaptura. Primeiro, capturou 150 peixes dessa espécie, marcou cada um com uma etiqueta e devolveu todos à lagoa.',
      },
      {
        kind: 'p',
        text: 'Semanas depois, a equipe capturou 240 peixes da mesma espécie e verificou que 18 deles tinham a etiqueta.',
      },
      {
        kind: 'p',
        text: 'O método supõe que a proporção de peixes marcados na segunda captura é igual à proporção de peixes marcados em toda a população dessa espécie na lagoa.',
      },
    ],
    ask: 'Qual é a estimativa para o número de peixes dessa espécie na lagoa?',
    alternatives: alts('1.850 peixes', '372 peixes', '2.150 peixes', '390 peixes', '2.000 peixes'),
    answer: 'E',
    hints: [
      'Na segunda captura, 18 dos 240 peixes estavam marcados. Na lagoa inteira, os 150 peixes marcados devem representar essa mesma fração da população.',
      'Chame de N o número de peixes da lagoa e iguale as razões “marcados ÷ total” da segunda captura e da população.',
    ],
    solution: [
      { explanation: 'Fração de marcados na segunda captura.', calculation: ['18/240 = 3/40', '= 7,5%'] },
      { explanation: 'Na população.', calculation: ['150/N = 18/240'] },
      'N = 150 × 240 ÷ 18 = 36.000 ÷ 18 = 2.000 peixes.',
      'Conferência: 7,5% de 2.000 = 150, que é o número de peixes marcados.',
      'Armadilha: 1.850 seria a estimativa apenas dos peixes sem etiqueta; os 150 marcados também fazem parte da população.',
      'Armadilha: 2.150 soma outra vez os 150 marcados, que já estão incluídos na estimativa de 2.000.',
      'Armadilha: 390 (150 + 240) e 372 (150 + 240 − 18) contam apenas os peixes capturados e não estimam a população da lagoa.',
    ],
    concept:
      'No método de captura e recaptura, supõe-se que a amostra tem a mesma proporção de indivíduos marcados que a população: marcados na amostra ÷ tamanho da amostra = total de marcados ÷ população. Essa proporção permite estimar quantidades que não podem ser contadas diretamente.',
    estimatedSeconds: 100,
    source: AUTORAL,
    verify: () => (150 * 240) / 18,
  },
  {
    id: 'RZP-121',
    topic: 'razao-proporcao',
    subtopic: 'proporcao',
    difficulty: 2,
    skills: ['H16', 'H18'],
    stem: [
      {
        kind: 'p',
        text: 'Na horta comunitária de um bairro de Goiânia, o substrato para a produção de mudas é preparado misturando terra, esterco curtido e areia na proporção 3 : 2 : 1, em volume. A tabela mostra o estoque desses materiais.',
      },
      {
        kind: 'table',
        header: ['Material', 'Volume disponível'],
        rows: [
          ['Terra', '120 L'],
          ['Esterco curtido', '90 L'],
          ['Areia', '50 L'],
        ],
        caption: 'Estoque de materiais da horta',
      },
      {
        kind: 'p',
        text: 'Os voluntários querem preparar a maior quantidade possível de substrato com esse estoque, respeitando a proporção. Considere que o volume do substrato é igual à soma dos volumes dos materiais usados.',
      },
    ],
    ask: 'Qual é o maior volume de substrato que pode ser preparado?',
    alternatives: alts('260 L', '300 L', '240 L', '200 L', '270 L'),
    answer: 'C',
    hints: [
      'Na proporção 3 : 2 : 1, cada material corresponde a um número de partes iguais. O material que acaba primeiro limita o tamanho de cada parte.',
      'Para cada material, divida o volume disponível pelo número de partes que ele ocupa na mistura.',
    ],
    solution: [
      { explanation: 'Calcule quanto pode valer uma parte, respeitando o estoque de cada material.', calculation: ['Terra: 120 ÷ 3 = 40 L', 'Esterco: 90 ÷ 2 = 45 L', 'Areia: 50 ÷ 1 = 50 L'] },
      'O menor valor, 40 L, é o maior tamanho possível de cada parte: a terra é o material que limita a mistura.',
      { explanation: 'A terra limita a mistura: use 40 L por parte, na proporção 3 : 2 : 1.', calculation: ['Terra: 3 × 40 = 120 L', 'Esterco: 2 × 40 = 80 L', 'Areia: 1 × 40 = 40 L'] },
      'Substrato: 120 + 80 + 40 = 240 L (sobram 10 L de esterco e 10 L de areia).',
      'Armadilha: 260 L é a soma de todo o estoque, mas misturar tudo não respeita a proporção 3 : 2 : 1.',
      'Armadilha: tomar como referência o esterco (6 × 45 = 270 L) ou a areia, que tem o menor estoque (6 × 50 = 300 L), exigiria mais terra do que os 120 L disponíveis.',
      'Armadilha: 200 L considera apenas 5 partes (terra e esterco) e esquece a parte de areia.',
    ],
    concept:
      'Em uma mistura com proporção fixa, o estoque de cada componente rende um certo número de partes. O componente que rende as menores partes é o limitante: ele define o tamanho de cada parte e, portanto, a quantidade máxima de mistura.',
    estimatedSeconds: 120,
    source: AUTORAL,
    verify: () => {
      const parte = Math.min(120 / 3, 90 / 2, 50 / 1);
      return parte * (3 + 2 + 1);
    },
  },
  {
    id: 'RZP-122',
    topic: 'razao-proporcao',
    subtopic: 'proporcao',
    difficulty: 3,
    skills: ['H16', 'H18'],
    stem: [
      {
        kind: 'p',
        text: 'Uma pequena empresa de software de Campinas vai distribuir um bônus de R$ 4.500,00 entre os três funcionários do suporte técnico. O valor será dividido em partes diretamente proporcionais ao tempo de empresa de cada um e inversamente proporcionais ao número de faltas que cada um teve no ano.',
      },
      {
        kind: 'table',
        header: ['Funcionário', 'Tempo de empresa', 'Faltas no ano'],
        rows: [
          ['Ana', '3 anos', '1'],
          ['Bruno', '5 anos', '2'],
          ['Célia', '8 anos', '4'],
        ],
        caption: 'Dados dos funcionários do suporte técnico',
      },
    ],
    ask: 'Quanto Célia receberá de bônus?',
    alternatives: alts('R$ 1.200,00', 'R$ 3.200,00', 'R$ 1.500,00', 'R$ 2.250,00', 'R$ 642,86'),
    answer: 'A',
    hints: [
      'Ser diretamente proporcional ao tempo de empresa e inversamente proporcional às faltas significa receber proporcionalmente ao quociente tempo de empresa ÷ faltas.',
      'Calcule esse quociente para os três funcionários; esses números são os pesos da divisão do bônus.',
    ],
    solution: [
      'Pesos (anos ÷ faltas): Ana 3 ÷ 1 = 3; Bruno 5 ÷ 2 = 2,5; Célia 8 ÷ 4 = 2.',
      'Multiplicando todos por 2 para eliminar a vírgula: 6 : 5 : 4, que somam 15 partes.',
      { explanation: 'Valor de cada parte.', calculation: ['4.500 ÷ 15 = R$ 300,00'] },
      'Célia: 4 × 300 = R$ 1.200,00 (Ana recebe R$ 1.800,00 e Bruno, R$ 1.500,00; total de R$ 4.500,00).',
      'Armadilha: dividir só pelo tempo de empresa (3 : 5 : 8) dá a Célia 8/16 de 4.500 = R$ 2.250,00, ignorando as faltas.',
      'Armadilha: multiplicar anos por faltas (3 : 10 : 32) trata as faltas como diretamente proporcionais e daria R$ 3.200,00 a Célia, premiando quem falta mais.',
      'Armadilha: considerar só as faltas (1 : 1/2 : 1/4, ou seja, 4 : 2 : 1) dá a Célia 1/7 de 4.500 ≈ R$ 642,86; já R$ 1.500,00 seria a divisão em partes iguais.',
    ],
    concept:
      'Dividir em partes diretamente proporcionais a a, b, c e inversamente proporcionais a x, y, z é o mesmo que dividir em partes diretamente proporcionais a a/x, b/y e c/z. Calcule esses pesos, some-os e reparta o total na mesma razão.',
    estimatedSeconds: 200,
    source: AUTORAL,
    verify: () => {
      const pesos = [3 / 1, 5 / 2, 8 / 4];
      const soma = pesos.reduce((acc, p) => acc + p, 0);
      return (4500 * pesos[2]) / soma;
    },
  },
]);
