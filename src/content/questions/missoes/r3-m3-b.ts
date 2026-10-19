import { AUTORAL, alts, batch } from '../_helpers';

/** Missão r3-m3 "A Forja das Potências" — questões extras para repetição (lote b, BAS-313 a BAS-324). Questões autorais. */
export const MISSAO_R3M3_B = batch([
  {
    id: 'BAS-313',
    topic: 'basica',
    subtopic: 'potencias',
    difficulty: 2,
    skills: ['H3', 'H4'],
    stem: [
      {
        kind: 'p',
        text: 'Rafaela é vendedora em uma loja de Curitiba e guardou R$ 2.500,00 em uma aplicação que rende 20% ao ano, no regime de juros compostos: ao final de cada ano, o saldo é multiplicado por 1,2. Ela não fará novos depósitos nem retiradas.',
      },
    ],
    ask: 'Ao final de 2 anos, o saldo dessa aplicação será de',
    alternatives: alts('R$ 3.000,00', 'R$ 3.600,00', 'R$ 3.100,00', 'R$ 3.500,00', 'R$ 6.000,00'),
    answer: 'B',
    hints: [
      'Em juros compostos, o saldo de cada ano é o do ano anterior multiplicado pelo mesmo fator; por isso aparece uma potência desse fator.',
      'Escreva o saldo final como 2.500 multiplicado pelo fator de crescimento elevado ao número de anos e calcule primeiro essa potência.',
    ],
    solution: [
      'O fator de crescimento anual é 1,2. Em 2 anos, o saldo fica multiplicado por 1,2² = 1,2 × 1,2 = 1,44.',
      'Saldo final: 2.500 × 1,44 = 3.600 (pois 2.500 × 1 = 2.500 e 2.500 × 0,44 = 1.100).',
      'Conferência ano a ano: 2.500 → 2.500 × 1,2 = 3.000 → 3.000 × 1,2 = 3.600.',
      'Armadilhas: R$ 3.000,00 é o saldo após apenas 1 ano; R$ 3.100,00 vem de achar que 1,2² = 1,24 (elevando só o 2 ao quadrado); R$ 3.500,00 corresponde a juros simples (2 × 20% sobre os R$ 2.500,00); R$ 6.000,00 vem de multiplicar por 1,2 × 2 = 2,4 em vez de 1,2².',
    ],
    concept:
      'Em juros compostos, o saldo após n períodos é C × (1 + i)ⁿ: o fator de crescimento é elevado ao número de períodos, e não multiplicado por ele. Lembre que 1,2² = 1,44, e não 1,24.',
    estimatedSeconds: 60,
    source: AUTORAL,
    verify: () => 2500 * Math.pow(1.2, 2),
    tolerance: 0.005,
  },
  {
    id: 'BAS-314',
    topic: 'basica',
    subtopic: 'notacao-cientifica',
    difficulty: 1,
    skills: ['H1', 'H12'],
    stem: [
      {
        kind: 'p',
        text: 'Em uma aula de Física em Recife, o professor explicou que cada cor da luz visível corresponde a um comprimento de onda. A luz verde tem comprimento de onda de aproximadamente 550 nm (nanômetros), sendo 1 nm = 10⁻⁹ m.',
      },
    ],
    ask: 'Esse comprimento de onda, em metros e em notação científica, é igual a',
    alternatives: alts('5,5 × 10⁻⁹ m', '5,5 × 10⁻¹¹ m', '5,5 × 10⁻⁷ m', '5,5 × 10⁻⁴ m', '5,5 × 10⁷ m'),
    answer: 'C',
    hints: [
      'Um nanômetro é a bilionésima parte do metro. Em notação científica, o número decimal que multiplica a potência de 10 (a mantissa) deve ficar entre 1 e 10.',
      'Escreva 550 como 5,5 × 10² e depois multiplique as potências de 10, conservando a base e somando os expoentes.',
    ],
    solution: [
      '550 nm = 550 × 10⁻⁹ m.',
      'Em notação científica, 550 = 5,5 × 10².',
      'Então 550 × 10⁻⁹ = 5,5 × 10² × 10⁻⁹. Somando os expoentes: 2 + (−9) = −7, ou seja, 5,5 × 10⁻⁷ m.',
      'Armadilhas: 5,5 × 10⁻⁹ esquece o 10² que vem de 550; 5,5 × 10⁻¹¹ subtrai 2 em vez de somar; 5,5 × 10⁻⁴ confunde nano (10⁻⁹) com micro (10⁻⁶), calculando 550 × 10⁻⁶; 5,5 × 10⁷ erra o sinal do expoente.',
    ],
    concept:
      'Os prefixos do SI são potências de 10: nano = 10⁻⁹, micro = 10⁻⁶, mili = 10⁻³, quilo = 10³, mega = 10⁶ e giga = 10⁹. Ao multiplicar potências de mesma base, somam-se os expoentes.',
    estimatedSeconds: 40,
    source: AUTORAL,
    verify: () => 550 * Math.pow(10, -9),
  },
  {
    id: 'BAS-315',
    topic: 'basica',
    subtopic: 'notacao-cientifica',
    difficulty: 3,
    skills: ['H1', 'H3', 'H4'],
    stem: [
      {
        kind: 'p',
        text: 'Um aplicativo de mensagens tem cerca de 2,5 × 10⁷ usuários ativos no Brasil, e cada usuário envia, em média, 3 × 10¹ mensagens por dia.',
      },
      {
        kind: 'p',
        text: 'Neste problema, considere que a ordem de grandeza de um número é a potência de 10 que mais se aproxima dele.',
      },
    ],
    ask: 'A ordem de grandeza do total de mensagens enviadas por dia nesse aplicativo, no Brasil, é',
    alternatives: alts('10⁹', '10⁸', '10¹⁰', '10⁷', '10⁶'),
    answer: 'A',
    hints: [
      'O total é o número de usuários vezes o número de mensagens por usuário. Obtenha primeiro esse total em notação científica e só depois decida de qual potência de 10 ele está mais perto.',
      'Multiplique os números decimais (2,5 e 3) entre si e as potências de 10 entre si, somando os expoentes.',
    ],
    solution: [
      'Total = 2,5 × 10⁷ × 3 × 10¹ = (2,5 × 3) × (10⁷ × 10¹) = 7,5 × 10⁸ mensagens por dia (750 milhões).',
      'O número 7,5 × 10⁸ está entre 10⁸ e 10⁹. A distância até 10⁸ é 7,5 × 10⁸ − 1 × 10⁸ = 6,5 × 10⁸; a distância até 10⁹ é 10 × 10⁸ − 7,5 × 10⁸ = 2,5 × 10⁸.',
      'Como 2,5 × 10⁸ é menor que 6,5 × 10⁸, a potência de 10 mais próxima é 10⁹.',
      'Armadilhas: 10⁸ apenas copia o expoente de 7,5 × 10⁸, sem perceber que 7,5 está mais perto de 10 do que de 1; 10¹⁰ arredonda cada fator para cima antes de multiplicar; 10⁷ esquece o fator 10¹ das mensagens por usuário; 10⁶ divide, em vez de multiplicar, usuários por mensagens.',
    ],
    concept:
      'A ordem de grandeza de um número é a potência de 10 mais próxima dele: em a × 10ⁿ, com a perto de 10 (como 7,5), ela é 10ⁿ⁺¹. Ao multiplicar em notação científica, multiplicam-se as mantissas e somam-se os expoentes.',
    estimatedSeconds: 100,
    source: AUTORAL,
    verify: () => {
      const total = 2.5e7 * 3e1;
      const lo = Math.pow(10, Math.floor(Math.log10(total)));
      const hi = lo * 10;
      return total - lo < hi - total ? lo : hi;
    },
    tolerance: 1,
  },
  {
    id: 'BAS-316',
    topic: 'basica',
    subtopic: 'potencias',
    difficulty: 3,
    skills: ['H1', 'H2', 'H3'],
    stem: [
      {
        kind: 'p',
        text: 'Na feira de ciências de uma escola de Manaus, a aluna Beatriz escreveu no quadro o número N indicado a seguir e desafiou os colegas a descobrir quantos algarismos ele possui, sem calcular o valor de N por inteiro.',
      },
      { kind: 'math', lines: ['N = 8⁵ × 25⁶'] },
    ],
    ask: 'Quantos algarismos tem o número N?',
    alternatives: alts('27', '15', '12', '13', '14'),
    answer: 'D',
    hints: [
      'Use propriedades das potências para reescrever os dois fatores com bases primas. Um produto do tipo 2ᵏ × 5ᵏ é fácil de interpretar, porque 2 × 5 = 10.',
      'Escreva 8 como potência de 2 e 25 como potência de 5, e aplique (aᵐ)ⁿ = aᵐⁿ para descobrir os expoentes.',
    ],
    solution: [
      'Reescrevemos as bases: 8 = 2³ e 25 = 5².',
      '8⁵ = (2³)⁵ = 2¹⁵ e 25⁶ = (5²)⁶ = 5¹². Logo, N = 2¹⁵ × 5¹².',
      'Separando 2¹⁵ = 2³ × 2¹²: N = 2³ × (2¹² × 5¹²) = 8 × (2 × 5)¹² = 8 × 10¹².',
      'Isso é o algarismo 8 seguido de 12 zeros (8.000.000.000.000), ou seja, 13 algarismos.',
      'Armadilhas: 12 conta só os zeros e esquece o algarismo 8; 14 conta os 13 algarismos de 10¹² e ainda soma 1 pelo fator 8; 15 confunde o número de algarismos com o expoente de 2; 27 soma os expoentes 15 + 12.',
    ],
    concept:
      'Com bases diferentes, reescreva as potências com bases primas, usando (aᵐ)ⁿ = aᵐⁿ e aⁿ × bⁿ = (a × b)ⁿ. Um número do tipo k × 10ⁿ, com k de um só algarismo, tem n + 1 algarismos.',
    estimatedSeconds: 150,
    source: AUTORAL,
    verify: () => String(Math.pow(8, 5) * Math.pow(25, 6)).length,
  },
  {
    id: 'BAS-317',
    topic: 'basica',
    subtopic: 'notacao-cientifica',
    difficulty: 2,
    skills: ['H3', 'H4'],
    stem: [
      {
        kind: 'p',
        text: 'A luz do Sol leva certo tempo para chegar até nós. Em uma aula de Astronomia em Natal, o professor informou que a distância média entre o Sol e a Terra é de 1,5 × 10⁸ km e que a luz se propaga no vácuo a 3 × 10⁵ km por segundo.',
      },
    ],
    ask: 'Com esses valores, o tempo que a luz do Sol leva para chegar à Terra é de',
    alternatives: alts('5 × 10³ s', '2 × 10³ s', '2 × 10⁻³ s', '4,5 × 10¹³ s', '5 × 10² s'),
    answer: 'E',
    hints: [
      'A luz se desloca com velocidade constante; relacione distância, velocidade e tempo.',
      'O tempo é a distância dividida pela velocidade. Divida as mantissas (1,5 e 3) entre si e as potências de 10 entre si, subtraindo os expoentes.',
    ],
    solution: [
      'Tempo = distância ÷ velocidade = (1,5 × 10⁸) ÷ (3 × 10⁵).',
      'Mantissas: 1,5 ÷ 3 = 0,5. Potências: 10⁸ ÷ 10⁵ = 10⁸⁻⁵ = 10³.',
      'Logo, t = 0,5 × 10³ s = 5 × 10² s, isto é, 500 s (cerca de 8 min 20 s).',
      'Armadilhas: 5 × 10³ não normaliza 0,5 × 10³ (a vírgula foi deslocada sem compensar o expoente); 2 × 10³ divide 3 por 1,5, invertendo as mantissas; 2 × 10⁻³ inverte a divisão inteira (velocidade ÷ distância); 4,5 × 10¹³ multiplica distância por velocidade.',
    ],
    concept:
      'Na divisão de números em notação científica, dividem-se as mantissas e subtraem-se os expoentes. Se a mantissa final não ficar entre 1 e 10, ajusta-se o expoente: 0,5 × 10³ = 5 × 10².',
    estimatedSeconds: 70,
    source: AUTORAL,
    verify: () => 1.5e8 / 3e5,
    tolerance: 1e-6,
  },
  {
    id: 'BAS-318',
    topic: 'basica',
    subtopic: 'potencias',
    difficulty: 1,
    skills: ['H1', 'H3'],
    stem: [
      {
        kind: 'p',
        text: 'Seu Raimundo cultiva uma horta de formato quadrado, com 4 m de lado, no quintal de sua casa em Teresina. Para plantar mais hortaliças, ele vai ampliá-la, mantendo o formato quadrado, mas com 12 m de lado.',
      },
    ],
    ask: 'A área da nova horta é quantas vezes a área da horta atual?',
    alternatives: alts('9', '3', '6', '27', '144'),
    answer: 'A',
    hints: [
      'A área de um quadrado depende do lado elevado a certo expoente. Compare as áreas das duas hortas, e não os lados.',
      'Calcule a área da horta atual (lado de 4 m) e a da nova (lado de 12 m); depois veja quantas vezes uma cabe na outra.',
    ],
    solution: [
      'Área atual: 4² = 16 m². Área nova: 12² = 144 m².',
      'Razão entre as áreas: 144 ÷ 16 = 9.',
      'Outro caminho: o lado ficou 12 ÷ 4 = 3 vezes maior, então a área ficou 3² = 9 vezes maior.',
      'Armadilhas: 3 é a razão entre os lados, e não entre as áreas; 6 vem de somar 3 + 3 em vez de elevar ao quadrado; 27 eleva ao cubo, o que valeria para um volume; 144 é a área nova em m², sem compará-la com a área atual.',
    ],
    concept:
      'Ao multiplicar por k todos os comprimentos de uma figura plana, sua área fica multiplicada por k²; no espaço, o volume fica multiplicado por k³.',
    estimatedSeconds: 45,
    source: AUTORAL,
    verify: () => Math.pow(12, 2) / Math.pow(4, 2),
  },
  {
    id: 'BAS-319',
    topic: 'basica',
    subtopic: 'notacao-cientifica',
    difficulty: 3,
    skills: ['H3', 'H4', 'H12'],
    stem: [
      {
        kind: 'p',
        text: 'Uma cooperativa de energia solar do sertão da Bahia tem três usinas. Em certo dia, elas geraram 1,2 GWh, 850 MWh e 45.000 kWh, respectivamente. No mesmo dia, as cidades atendidas pela cooperativa consumiram 2,3 × 10⁹ Wh. A diferença entre o consumo e a geração foi comprada da rede elétrica.',
      },
      { kind: 'math', lines: ['1 kWh = 10³ Wh  ·  1 MWh = 10⁶ Wh  ·  1 GWh = 10⁹ Wh'] },
    ],
    ask: 'A quantidade de energia comprada da rede nesse dia foi de',
    alternatives: alts('2,5 × 10⁸ Wh', '2,05 × 10⁹ Wh', '2,095 × 10⁹ Wh', '2,05 × 10⁸ Wh', '4,395 × 10⁹ Wh'),
    answer: 'D',
    hints: [
      'Para somar ou subtrair números em notação científica, todos precisam estar na mesma unidade e com o mesmo expoente de 10. Comece convertendo tudo para Wh.',
      'Escreva cada geração em Wh em notação científica (por exemplo, 1,2 GWh = 1,2 × 10⁹ Wh) e depois reescreva todas com 10⁹ para poder somá-las.',
    ],
    solution: [
      'Em Wh: 1,2 GWh = 1,2 × 10⁹; 850 MWh = 850 × 10⁶ = 8,5 × 10⁸; 45.000 kWh = 4,5 × 10⁴ × 10³ = 4,5 × 10⁷.',
      'Igualando os expoentes em 10⁹: 1,2 × 10⁹ + 0,85 × 10⁹ + 0,045 × 10⁹ = 2,095 × 10⁹ Wh de geração.',
      'Energia comprada = consumo − geração = 2,3 × 10⁹ − 2,095 × 10⁹ = 0,205 × 10⁹ Wh.',
      'Normalizando a mantissa: 0,205 × 10⁹ = 2,05 × 10⁸ Wh.',
      'Armadilhas: 2,5 × 10⁸ ignora a terceira usina (2,3 − 1,2 − 0,85 = 0,25); 2,05 × 10⁹ acerta os algarismos, mas não compensa o expoente depois de 0,205; 2,095 × 10⁹ para na soma e informa só a geração; 4,395 × 10⁹ soma consumo e geração em vez de subtrair.',
    ],
    concept:
      'Só se somam ou subtraem números em notação científica depois de igualar as unidades e os expoentes de 10. Se o resultado sair com mantissa fora do intervalo de 1 a 10 (como 0,205 × 10⁹), ele deve ser normalizado: 2,05 × 10⁸.',
    estimatedSeconds: 180,
    source: AUTORAL,
    verify: () => 2.3e9 - (1.2e9 + 850e6 + 45000e3),
    tolerance: 1000,
  },
  {
    id: 'BAS-320',
    topic: 'basica',
    subtopic: 'notacao-cientifica',
    difficulty: 2,
    skills: ['H1', 'H3', 'H12'],
    stem: [
      {
        kind: 'p',
        text: 'Em uma aula de Biologia em Porto Alegre, a professora comparou a massa de duas células. Uma célula do fígado humano tem massa de aproximadamente 4 ng (nanogramas), sendo 1 ng = 10⁻⁹ g. Já uma bactéria comum tem massa de aproximadamente 2 × 10⁻¹² g.',
      },
    ],
    ask: 'A massa da célula do fígado equivale a quantas vezes a massa da bactéria?',
    alternatives: alts('2 × 10⁻³', '2 × 10⁶', '8 × 10⁻²¹', '2 × 10¹²', '2 × 10³'),
    answer: 'E',
    hints: [
      'Para comparar as massas, as duas precisam estar na mesma unidade. Depois, “quantas vezes” pede a divisão da maior massa pela menor.',
      'Converta 4 ng para gramas (4 × 10⁻⁹ g). Em seguida, divida as mantissas e subtraia os expoentes de 10.',
    ],
    solution: [
      'Massa da célula em gramas: 4 ng = 4 × 10⁻⁹ g.',
      'Razão = (4 × 10⁻⁹) ÷ (2 × 10⁻¹²).',
      'Mantissas: 4 ÷ 2 = 2. Potências: 10⁻⁹ ÷ 10⁻¹² = 10³, pois o novo expoente é −9 − (−12) = 3.',
      'Logo, a célula do fígado tem 2 × 10³ = 2.000 vezes a massa da bactéria.',
      'Armadilhas: 2 × 10⁻³ inverte a razão (bactéria ÷ célula); 8 × 10⁻²¹ multiplica as massas em vez de dividir; 2 × 10¹² esquece de converter nanogramas em gramas (faz 4 ÷ 2 × 10⁻¹²); 2 × 10⁶ confunde nano (10⁻⁹) com micro (10⁻⁶).',
    ],
    concept:
      '“Quantas vezes A é maior que B” é a razão A ÷ B, com as duas grandezas na mesma unidade. Em notação científica, dividem-se as mantissas e subtraem-se os expoentes: 10ᵃ ÷ 10ᵇ = 10ᵃ⁻ᵇ, inclusive com expoentes negativos.',
    estimatedSeconds: 100,
    source: AUTORAL,
    verify: () => (4 * 1e-9) / 2e-12,
    tolerance: 1e-6,
  },
  {
    id: 'BAS-321',
    topic: 'basica',
    subtopic: 'potencias',
    difficulty: 3,
    skills: ['H2', 'H3'],
    stem: [
      {
        kind: 'p',
        text: 'A presidente da associação de moradores de um bairro de Salvador (rodada 0) avisou 3 vizinhos sobre o dia da campanha de vacinação (rodada 1). Em cada rodada seguinte, cada pessoa avisada na rodada anterior avisa 3 vizinhos que ainda não sabiam do aviso, e ninguém é avisado mais de uma vez.',
      },
    ],
    ask: 'Ao final da 5ª rodada, o número total de pessoas que conhecem o aviso, incluindo a presidente, é',
    alternatives: alts('243', '364', '363', '729', '1.093'),
    answer: 'B',
    hints: [
      'Veja quantas pessoas são avisadas em cada rodada: o número triplica a cada passo, o que forma potências de 3. O total é a soma de todas as rodadas, e não só da última.',
      'Liste: rodada 0 → 1 pessoa (3⁰); rodada 1 → 3 pessoas (3¹); rodada 2 → 9 pessoas (3²). Continue até a rodada 5 e some tudo.',
    ],
    solution: [
      'Pessoas avisadas em cada rodada: rodada 0: 1 = 3⁰; rodada 1: 3 = 3¹; rodada 2: 9 = 3²; rodada 3: 27 = 3³; rodada 4: 81 = 3⁴; rodada 5: 243 = 3⁵.',
      'Total ao final da rodada 5: 1 + 3 + 9 + 27 + 81 + 243 = 364 pessoas.',
      'Conferência acumulando: 1 + 3 = 4; 4 + 9 = 13; 13 + 27 = 40; 40 + 81 = 121; 121 + 243 = 364.',
      'Armadilhas: 243 é apenas quem foi avisado na 5ª rodada; 363 esquece a presidente; 729 = 3⁶ corresponde a uma rodada a mais, e não ao total; 1.093 soma também a rodada 6 (364 + 729).',
    ],
    concept:
      'Quando uma quantidade é multiplicada pelo mesmo fator a cada etapa, a etapa de número n corresponde à potência kⁿ. O total acumulado é a soma de todas as potências, da etapa 0 até a etapa pedida.',
    estimatedSeconds: 100,
    source: AUTORAL,
    verify: () => {
      let total = 0;
      for (let rodada = 0; rodada <= 5; rodada++) total += Math.pow(3, rodada);
      return total;
    },
  },
  {
    id: 'BAS-322',
    topic: 'basica',
    subtopic: 'notacao-cientifica',
    difficulty: 2,
    skills: ['H3', 'H12'],
    stem: [
      {
        kind: 'p',
        text: 'O abastecimento de água de uma cidade de Minas Gerais, com 3 × 10⁶ habitantes, é planejado a partir de um consumo médio de 1,5 × 10² litros de água por pessoa por dia. A companhia de saneamento registra o volume de seus reservatórios em metros cúbicos (m³), e 1 m³ equivale a 10³ litros.',
      },
    ],
    ask: 'O volume de água consumido pela população em um dia, em m³ e em notação científica, é',
    alternatives: alts('4,5 × 10⁸ m³', '4,5 × 10¹¹ m³', '4,5 × 10⁵ m³', '2 × 10⁴ m³', '4,5 × 10⁹ m³'),
    answer: 'C',
    hints: [
      'Primeiro encontre o consumo total em litros: número de habitantes vezes o consumo por pessoa. Depois converta litros em metros cúbicos.',
      'Como 1 m³ = 10³ L, cada litro corresponde a 10⁻³ m³: o volume em m³ é o volume em litros dividido por 10³.',
    ],
    solution: [
      'Consumo diário em litros: 3 × 10⁶ × 1,5 × 10² = (3 × 1,5) × (10⁶ × 10²) = 4,5 × 10⁸ L.',
      'Conversão: 1 m³ = 10³ L, então dividimos por 10³: 4,5 × 10⁸ ÷ 10³ = 4,5 × 10⁵ m³.',
      'Armadilhas: 4,5 × 10⁸ esquece de converter litros em m³; 4,5 × 10¹¹ multiplica por 10³ em vez de dividir; 4,5 × 10⁹ multiplica os expoentes (6 × 2 = 12) e depois divide por 10³; 2 × 10⁴ divide habitantes por consumo, em vez de multiplicar.',
    ],
    concept:
      'Para multiplicar números em notação científica, multiplicam-se as mantissas e somam-se os expoentes. Passar de litros para m³ é dividir por 10³, isto é, diminuir 3 do expoente.',
    estimatedSeconds: 80,
    source: AUTORAL,
    verify: () => (3e6 * 1.5e2) / 1e3,
    tolerance: 1e-3,
  },
  {
    id: 'BAS-323',
    topic: 'basica',
    subtopic: 'notacao-cientifica',
    difficulty: 3,
    skills: ['H1', 'H4'],
    stem: [
      {
        kind: 'p',
        text: 'Em um laboratório de monitoramento da qualidade do ar de uma cidade do interior paulista, cinco estagiários mediram o diâmetro de partículas de poeira e anotaram os resultados, cada um em um formato diferente.',
      },
      {
        kind: 'table',
        header: ['Amostra', 'Diâmetro medido (m)'],
        rows: [
          ['I', '0,9 × 10⁻⁵'],
          ['II', '7,8 × 10⁻⁶'],
          ['III', '85 × 10⁻⁷'],
          ['IV', '0,0006 × 10⁻²'],
          ['V', '640 × 10⁻⁸'],
        ],
      },
    ],
    ask: 'O maior diâmetro medido, escrito em notação científica padrão (mantissa maior ou igual a 1 e menor que 10), é',
    alternatives: alts('7,8 × 10⁻⁶ m', '8,5 × 10⁻⁶ m', '9 × 10⁻⁵ m', '9 × 10⁻⁶ m', '9 × 10⁻⁷ m'),
    answer: 'D',
    hints: [
      'Para comparar números em notação científica, todos precisam estar no mesmo formato, com mantissa entre 1 e 10. Só então se comparam os expoentes e, se empatarem, as mantissas.',
      'Reescreva cada medida na forma padrão deslocando a vírgula e compensando no expoente. Por exemplo: 85 × 10⁻⁷ = 8,5 × 10¹ × 10⁻⁷ = 8,5 × 10⁻⁶.',
    ],
    solution: [
      'Normalizando cada medida (mantissa entre 1 e 10) e compensando o expoente:',
      'Amostra I: 0,9 × 10⁻⁵ = 9 × 10⁻¹ × 10⁻⁵ = 9 × 10⁻⁶. Amostra II: 7,8 × 10⁻⁶ já está na forma padrão.',
      'Amostra III: 85 × 10⁻⁷ = 8,5 × 10⁻⁶. Amostra IV: 0,0006 × 10⁻² = 6 × 10⁻⁴ × 10⁻² = 6 × 10⁻⁶. Amostra V: 640 × 10⁻⁸ = 6,4 × 10² × 10⁻⁸ = 6,4 × 10⁻⁶.',
      'Todas ficam com 10⁻⁶; comparando as mantissas: 9 > 8,5 > 7,8 > 6,4 > 6. A maior medida é a da amostra I: 9 × 10⁻⁶ m.',
      'Armadilhas: 7,8 × 10⁻⁶ escolhe a maior mantissa entre os valores que já estavam na forma padrão; 8,5 × 10⁻⁶ vem de olhar o maior número que aparece antes do 10 (o 85); 9 × 10⁻⁵ normaliza 0,9 sem compensar o expoente; 9 × 10⁻⁷ compensa o expoente no sentido errado.',
    ],
    concept:
      'Uma medida está em notação científica padrão quando a mantissa fica entre 1 e 10. Deslocar a vírgula k casas para a direita na mantissa exige diminuir k do expoente (e, para a esquerda, aumentar), para que o valor não mude.',
    estimatedSeconds: 130,
    source: AUTORAL,
    verify: () => Math.max(0.9e-5, 7.8e-6, 85e-7, 0.0006e-2, 640e-8),
  },
  {
    id: 'BAS-324',
    topic: 'basica',
    subtopic: 'potencias',
    difficulty: 4,
    skills: ['H3', 'H8', 'H11'],
    stem: [
      {
        kind: 'p',
        text: 'Uma arquiteta de Fortaleza construiu a maquete de um reservatório de água com formato de cubo, na escala 1 : 50, isto é, cada 1 cm da maquete representa 50 cm do reservatório real. Na maquete, cada face tem 36 cm² de área. Lembre-se de que 1 m³ equivale a 1.000 litros.',
      },
    ],
    ask: 'Quando completamente cheio, o reservatório real comporta',
    alternatives: alts('27.000 L', '9.000 L', '54.000 L', '540 L', '27.000.000 L'),
    answer: 'A',
    hints: [
      'A escala relaciona comprimentos, e não áreas ou volumes. Descubra primeiro a medida da aresta da maquete e depois a da aresta real.',
      'Cada face é um quadrado de 36 cm²; a aresta é o número positivo que, elevado ao quadrado, dá 36.',
    ],
    solution: [
      'Aresta da maquete: ℓ² = 36, logo ℓ = 6 cm.',
      'Aresta real: 6 × 50 = 300 cm = 3 m.',
      'Volume real: 3³ = 27 m³. Em litros: 27 × 1.000 = 27.000 L.',
      'Conferência: o volume da maquete é 6³ = 216 cm³ e a escala 1 : 50 multiplica o volume por 50³ = 125.000; então 216 × 125.000 = 27.000.000 cm³ = 27 m³ = 27.000 L.',
      'Armadilhas: 9.000 L usa 3² em vez de 3³; 54.000 L toma a área total das 6 faces (6 × 9 = 54) como se fosse o volume; 540 L eleva a escala só ao quadrado (216 × 50² = 540.000 cm³); 27.000.000 L confunde 27.000.000 cm³ com litros, esquecendo a conversão.',
    ],
    concept:
      'Se as medidas lineares de um sólido são multiplicadas por k, as áreas ficam multiplicadas por k² e os volumes por k³. Numa escala 1 : 50, o volume real é 50³ = 125.000 vezes o da maquete.',
    estimatedSeconds: 170,
    source: AUTORAL,
    verify: () => {
      const arestaMaquete = Math.sqrt(36);
      const arestaRealEmMetros = (arestaMaquete * 50) / 100;
      return Math.pow(arestaRealEmMetros, 3) * 1000;
    },
    tolerance: 1e-3,
  },
]);
