import { AUTORAL, alts, batch } from '../_helpers';

/** Missão r3-m3 "A Forja das Potências" — questões extras para repetição (lote a, BAS-301 a BAS-312). Questões autorais. */
export const MISSAO_R3M3_A = batch([
  {
    id: 'BAS-301',
    topic: 'basica',
    subtopic: 'potencias',
    difficulty: 1,
    skills: ['H2', 'H3'],
    stem: [
      {
        kind: 'p',
        text: 'Na feira de ciências de uma escola de Campo Grande, o professor Wagner mostrou como o papel dobrado ao meio engrossa depressa. Ele usou uma folha comum, com 0,1 mm de espessura, e explicou que cada dobra ao meio sobrepõe as camadas, de modo que o número de camadas empilhadas dobra a cada dobra.',
      },
      {
        kind: 'p',
        text: 'Suponha que fosse possível dobrar a folha ao meio 5 vezes seguidas e que a espessura da pilha fosse a soma das espessuras de todas as camadas.',
      },
    ],
    ask: 'Depois das 5 dobras, a espessura da pilha de papel seria de',
    alternatives: alts('3,2 mm', '0,5 mm', '1 mm', '2,5 mm', '6,4 mm'),
    answer: 'A',
    hints: [
      'Cada dobra ao meio dobra o número de camadas. Pense em como o número de camadas cresce a cada dobra e em qual potência isso representa.',
      'Escreva o número de camadas depois de 5 dobras como uma potência de base 2 e multiplique pela espessura de uma folha.',
    ],
    solution: [
      'A cada dobra, o número de camadas dobra: 1 dobra → 2 camadas; 2 dobras → 4; 3 dobras → 8; 4 dobras → 16; 5 dobras → 32 camadas, ou seja, 2⁵.',
      'Espessura da pilha = 32 × 0,1 mm = 3,2 mm.',
      { explanation: 'Conferência dobra a dobra.', calculation: ['0,1', '0,2', '0,4', '0,8', '1,6', '3,2 mm'] },
      'Armadilhas: 0,5 mm soma 0,1 mm por dobra (5 × 0,1), um crescimento linear; 1 mm usa 2 × 5 = 10 camadas no lugar de 2⁵; 2,5 mm troca a base pelo expoente (5² = 25 camadas); 6,4 mm conta uma dobra a mais (2⁶ = 64 camadas).',
    ],
    concept:
      'Quando uma quantidade dobra a cada etapa, depois de n etapas ela fica multiplicada por 2ⁿ (crescimento exponencial), e não por 2 × n.',
    estimatedSeconds: 40,
    source: AUTORAL,
    verify: () => 0.1 * Math.pow(2, 5),
  },
  {
    id: 'BAS-302',
    topic: 'basica',
    subtopic: 'potencias',
    difficulty: 2,
    skills: ['H1', 'H3'],
    stem: [
      {
        kind: 'p',
        text: 'Em uma aula sobre propriedades das potências, em uma turma do 1º ano do Ensino Médio de Goiânia, o professor Rogério escreveu no quadro a expressão a seguir e pediu aos estudantes que a escrevessem como uma única potência de base 3.',
      },
      { kind: 'math', lines: ['(3⁷ × 3²) ÷ (3³)²'] },
    ],
    ask: 'Escrita como uma única potência de base 3, essa expressão é igual a',
    alternatives: alts('3⁴', '3⁶', '3⁸', '3¹⁵', '3³'),
    answer: 'E',
    hints: [
      'Cada operação tem a sua própria regra para os expoentes: multiplicação, divisão e potência de potência não se tratam do mesmo jeito.',
      'Comece pelos parênteses: escreva 3⁷ × 3² e (3³)² cada um como uma única potência de base 3.',
    ],
    solution: [
      'Produto de potências de mesma base: mantém-se a base e somam-se os expoentes. Então 3⁷ × 3² = 3⁹ (7 + 2 = 9).',
      'Potência de potência: multiplicam-se os expoentes. Então (3³)² = 3⁶ (3 × 2 = 6).',
      'Quociente de potências de mesma base: subtraem-se os expoentes. Então 3⁹ ÷ 3⁶ = 3³ (9 − 6 = 3).',
      { explanation: 'Conferência.', calculation: ['3⁷ × 3² = 2.187 × 9', '= 19.683', '(3³)² = 27²', '= 729', '19.683 ÷ 729 = 27', '= 3³'] },
      'Armadilhas: 3⁴ soma os expoentes em (3³)², obtendo 3⁵, e faz 9 − 5; 3⁶ ignora o expoente 2 de fora e divide por 3³; 3⁸ multiplica os expoentes do produto (7 × 2 = 14) e depois subtrai 6; 3¹⁵ soma os expoentes na divisão (9 + 6) em vez de subtraí-los.',
    ],
    concept:
      'Ao multiplicar potências de mesma base, somam-se os expoentes; ao dividir, subtraem-se; e, em uma potência de potência, multiplicam-se os expoentes.',
    estimatedSeconds: 60,
    source: AUTORAL,
    verify: () => (Math.pow(3, 7) * Math.pow(3, 2)) / Math.pow(Math.pow(3, 3), 2),
  },
  {
    id: 'BAS-303',
    topic: 'basica',
    subtopic: 'potencias',
    difficulty: 3,
    skills: ['H1', 'H3'],
    stem: [
      {
        kind: 'p',
        text: 'Em um circuito elétrico, quando dois resistores são ligados em paralelo, a resistência equivalente R do conjunto, medida em ohms (Ω), pode ser calculada pela expressão a seguir, em que a e b são as resistências dos dois resistores.',
      },
      { kind: 'math', lines: ['R = (a⁻¹ + b⁻¹)⁻¹'] },
      {
        kind: 'p',
        text: 'Em uma oficina de eletrônica de Uberlândia, o técnico Marcelo precisa consertar um aparelho e, para isso, liga em paralelo um resistor de 3 Ω e outro de 6 Ω.',
      },
    ],
    ask: 'A resistência equivalente dessa associação é',
    alternatives: alts('9 Ω', '1/2 Ω', '18 Ω', '2 Ω', '1/9 Ω'),
    answer: 'D',
    hints: [
      'Um expoente −1 indica o inverso do número. Aplique essa ideia com cuidado nos dois níveis da expressão: dentro e fora dos parênteses.',
      'Primeiro escreva 3⁻¹ e 6⁻¹ como frações e some-as; só depois use o expoente −1 que está fora dos parênteses.',
    ],
    solution: [
      'Um expoente −1 indica o inverso: a⁻¹ = 1/a. Então 3⁻¹ = 1/3 e 6⁻¹ = 1/6.',
      { explanation: 'Soma dentro dos parênteses.', calculation: ['1/3 + 1/6 = 2/6 + 1/6', '= 3/6', '= 1/2'] },
      'O expoente −1 de fora inverte esse resultado: (1/2)⁻¹ = 2. Logo, R = 2 Ω.',
      'Conferência: o produto dividido pela soma dá 3 × 6 ÷ (3 + 6) = 18 ÷ 9 = 2 Ω; e, como esperado em paralelo, o valor é menor que cada uma das resistências.',
      'Armadilhas: 9 Ω ignora os expoentes negativos e apenas soma 3 + 6; 1/2 Ω para na soma e esquece o expoente −1 de fora; 18 Ω multiplica as resistências; 1/9 Ω calcula (3 + 6)⁻¹, sem aplicar o expoente a cada parcela.',
    ],
    concept:
      'Um expoente negativo indica inverso: a⁻¹ = 1/a. Em (a⁻¹ + b⁻¹)⁻¹, o expoente de fora não pode ser distribuído sobre a soma: primeiro somam-se as frações e só depois se inverte o resultado.',
    estimatedSeconds: 80,
    source: AUTORAL,
    verify: () => Math.pow(Math.pow(3, -1) + Math.pow(6, -1), -1),
  },
  {
    id: 'BAS-304',
    topic: 'basica',
    subtopic: 'notacao-cientifica',
    difficulty: 1,
    skills: ['H1'],
    stem: [
      {
        kind: 'p',
        text: 'Uma usina de açúcar e etanol do interior de São Paulo informou, em seu relatório anual, que moeu 4.800.000 toneladas de cana-de-açúcar em uma safra. O setor de comunicação da empresa quer divulgar esse dado em notação científica.',
      },
    ],
    ask: 'Em notação científica, a quantidade de cana moída nessa safra é',
    alternatives: alts('4,8 × 10⁵ t', '4,8 × 10⁷ t', '4,8 × 10⁶ t', '4,8 × 10⁻⁶ t', '4,8 × 10³ t'),
    answer: 'C',
    hints: [
      'Na notação científica, o número que multiplica a potência de 10 deve ser maior ou igual a 1 e menor que 10.',
      'Conte quantas casas a vírgula precisa andar para a esquerda, a partir do final de 4.800.000, até ficar logo depois do 4.',
    ],
    solution: [
      'Para obter um número entre 1 e 10, a vírgula de 4.800.000 deve ficar logo depois do 4: 4,8.',
      'Ela anda 6 casas para a esquerda, então 4.800.000 = 4,8 × 1.000.000 = 4,8 × 10⁶.',
      { explanation: 'Conferência.', calculation: ['4,8 × 10⁶ = 4,8 × 1.000.000', '= 4.800.000'] },
      'Armadilhas: 10⁵ conta apenas os zeros do número (são 5), e não as casas que a vírgula anda; 10⁷ conta todos os algarismos; 10⁻⁶ erra o sinal, pois o número é maior que 1; 10³ confunde "milhões" com "milhares".',
    ],
    concept:
      'Notação científica: a × 10ⁿ, com 1 ≤ a < 10. Em números maiores que 10, o expoente n é positivo e indica quantas casas a vírgula andou para a esquerda.',
    estimatedSeconds: 30,
    source: AUTORAL,
    verify: () => 4800000,
    tolerance: 0.5,
  },
  {
    id: 'BAS-305',
    topic: 'basica',
    subtopic: 'potencias',
    difficulty: 3,
    skills: ['H10', 'H12'],
    stem: [
      {
        kind: 'p',
        text: 'Uma escola rural do interior de Mato Grosso vai instalar um reservatório de água em formato de cubo, sem tampa. Quando totalmente cheio, ele deve armazenar exatamente 64.000 litros. Para impermeabilizá-lo, uma empresa vai revestir as quatro paredes internas e o fundo com uma manta especial.',
      },
      {
        kind: 'p',
        text: 'Considere que 1 m³ equivale a 1.000 litros e despreze a espessura das paredes.',
      },
    ],
    ask: 'A área de manta necessária para revestir as paredes internas e o fundo é de',
    alternatives: alts('96 m²', '80 m²', '64 m²', '16 m²', '320 m²'),
    answer: 'B',
    hints: [
      'O volume de um cubo de aresta a é a × a × a. Antes de falar em área, descubra a medida da aresta, e para isso o volume precisa estar em metros cúbicos.',
      'Converta 64.000 litros em m³ e procure o número que, multiplicado por si mesmo três vezes, resulta nesse volume.',
    ],
    solution: [
      { explanation: 'Volume em m³.', calculation: ['64.000 L ÷ 1.000 = 64 m³'] },
      'Em um cubo, V = a³. Então a³ = 64, e a aresta é a raiz cúbica de 64: a = 4 m, pois 4 × 4 × 4 = 64.',
      'Cada face é um quadrado de lado 4 m, com área 4² = 16 m².',
      { explanation: 'A manta cobre as 4 paredes e o fundo, ou seja, 5 faces.', calculation: ['5 × 16 = 80 m²'] },
      'Armadilhas: 96 m² considera as 6 faces, esquecendo que o reservatório não tem tampa; 64 m² cobre só as 4 paredes e esquece o fundo; 16 m² é a área de uma única face; 320 m² multiplica 5 pelo volume (64), confundindo volume com área da face.',
    ],
    concept:
      'O volume de um cubo de aresta a é a³, logo a aresta é a raiz cúbica do volume; cada face é um quadrado de área a². Lembre-se de que 1 m³ = 1.000 L.',
    estimatedSeconds: 100,
    source: AUTORAL,
    verify: () => {
      const volumeM3 = 64000 / 1000;
      const aresta = Math.cbrt(volumeM3);
      return 5 * aresta * aresta;
    },
  },
  {
    id: 'BAS-306',
    topic: 'basica',
    subtopic: 'notacao-cientifica',
    difficulty: 2,
    skills: ['H1', 'H10'],
    stem: [
      {
        kind: 'p',
        text: 'O tamanho dos vírus costuma ser dado em nanômetros (nm), unidade que equivale a 10⁻⁹ m, ou seja, a um bilionésimo de metro. Em um instituto de pesquisa em saúde do Rio de Janeiro, uma pesquisadora mediu, ao microscópio eletrônico, um vírus de 90 nm de diâmetro.',
      },
    ],
    ask: 'Em metros, e escrito em notação científica, o diâmetro desse vírus é',
    alternatives: alts('9 × 10⁻⁹ m', '9 × 10⁻¹⁰ m', '9 × 10⁻⁷ m', '9 × 10⁻⁸ m', '9 × 10¹⁰ m'),
    answer: 'D',
    hints: [
      'Primeiro escreva a medida em metros, usando o fato de que 1 nm = 10⁻⁹ m. Depois ajuste o número para que o coeficiente fique entre 1 e 10.',
      'Escreva 90 nm como 90 × 10⁻⁹ m e transforme o 90 em 9 × 10 antes de juntar as potências de 10.',
    ],
    solution: [
      'Como 1 nm = 10⁻⁹ m, temos 90 nm = 90 × 10⁻⁹ m.',
      { explanation: 'Mas 90 não está entre 1 e 10.', calculation: ['90 = 9 × 10'] },
      'Então 90 × 10⁻⁹ = 9 × 10 × 10⁻⁹ = 9 × 10⁻⁸ m (1 + (−9) = −8).',
      'Conferência: 9 × 10⁻⁸ m = 0,00000009 m, que são 90 bilionésimos de metro.',
      'Armadilhas: 9 × 10⁻⁹ troca 90 por 9 sem compensar o expoente; 9 × 10⁻¹⁰ ajusta o expoente no sentido errado; 9 × 10⁻⁷ conta os zeros depois da vírgula (são 7) em vez das casas decimais até o 9 (são 8); 9 × 10¹⁰ multiplica por 10⁹ em vez de dividir.',
    ],
    concept:
      'Prefixos como nano (10⁻⁹) transformam a unidade em metros por meio de potências de 10 com expoente negativo. Na notação científica, o coeficiente deve estar entre 1 e 10, e ajustá-lo muda o expoente.',
    estimatedSeconds: 60,
    source: AUTORAL,
    verify: () => 90 * Math.pow(10, -9),
  },
  {
    id: 'BAS-307',
    topic: 'basica',
    subtopic: 'potencias',
    difficulty: 3,
    skills: ['H2', 'H3'],
    stem: [
      {
        kind: 'p',
        text: 'Um boato começou a circular em um bairro de Belo Horizonte. Às 8 h, apenas Joana conhecia a notícia falsa. A regra de propagação é a seguinte: a cada hora, cada pessoa que ficou sabendo do boato na hora anterior (e somente ela) o conta a 3 pessoas que ainda não o conheciam. Assim, entre 8 h e 9 h, Joana contou o boato a 3 pessoas.',
      },
      {
        kind: 'p',
        text: 'Suponha que a regra tenha sido seguida à risca, sem que ninguém ouvisse o boato mais de uma vez.',
      },
    ],
    ask: 'Às 12 h, quantas pessoas conhecem o boato, contando Joana?',
    alternatives: alts('121', '81', '120', '40', '364'),
    answer: 'A',
    hints: [
      'Conte separadamente as pessoas que ficam sabendo do boato em cada hora: a cada hora, o número de pessoas novas é multiplicado por 3 em relação à hora anterior.',
      'Monte uma lista: Joana; novas pessoas na 1ª hora; novas pessoas na 2ª hora; e assim até a 4ª hora (das 11 h às 12 h). Depois, some todos os grupos.',
    ],
    solution: [
      'Das 8 h às 12 h passam-se 4 horas. A cada hora, o número de pessoas novas é multiplicado por 3.',
      'Pessoas novas: 1ª hora, 3¹ = 3; 2ª hora, 3² = 9; 3ª hora, 3³ = 27; 4ª hora, 3⁴ = 81.',
      { explanation: 'Total que conhece o boato às 12 h = Joana + todas as pessoas novas.', calculation: ['1 + 3 + 9 + 27 + 81 = 121'] },
      { explanation: 'Conferência.', calculation: ['3⁰ + 3¹ + 3² + 3³ + 3⁴ = (3⁵ − 1) ÷ (3 − 1)', '= 242 ÷ 2', '= 121'] },
      'Armadilhas: 81 conta só as pessoas que souberam na última hora; 120 esquece a própria Joana; 40 para na 3ª hora (1 + 3 + 9 + 27); 364 inclui uma 5ª hora (1 + 3 + 9 + 27 + 81 + 243).',
    ],
    concept:
      'Quando cada elemento gera k novos a cada etapa, o número de novos na etapa n é kⁿ. Para saber quantos existem ao todo, é preciso somar os de todas as etapas, e não só os da última.',
    estimatedSeconds: 130,
    source: AUTORAL,
    verify: () => [0, 1, 2, 3, 4].reduce((soma, k) => soma + Math.pow(3, k), 0),
  },
  {
    id: 'BAS-308',
    topic: 'basica',
    subtopic: 'notacao-cientifica',
    difficulty: 3,
    skills: ['H3', 'H10'],
    stem: [
      {
        kind: 'p',
        text: 'As hemácias, ou glóbulos vermelhos, são as células do sangue responsáveis por transportar oxigênio. Em uma pessoa adulta e saudável, cada milímetro cúbico (mm³) de sangue contém, em média, 5 × 10⁶ hemácias.',
      },
      {
        kind: 'p',
        text: 'Em um posto de saúde de Fortaleza, uma enfermeira explica a um paciente que o corpo dele tem cerca de 5 litros de sangue. Lembre-se de que 1 litro equivale a 10⁶ mm³.',
      },
    ],
    ask: 'Com base nesses dados, o número aproximado de hemácias no sangue desse paciente, em notação científica, é',
    alternatives: alts('2,5 × 10¹²', '2,5 × 10⁷', '2,5 × 10¹³', '1 × 10¹³', '2,5 × 10¹¹'),
    answer: 'C',
    hints: [
      'O total de hemácias é o número de hemácias por mm³ multiplicado pelo número de mm³ de sangue. Para isso, o volume precisa estar na mesma unidade que a concentração.',
      'Converta 5 litros em mm³ e, depois, multiplique os coeficientes e some os expoentes das potências de 10.',
    ],
    solution: [
      { explanation: 'Volume de sangue em mm³.', calculation: ['5 L = 5 × 10⁶ mm³'] },
      'Total de hemácias = (5 × 10⁶) × (5 × 10⁶): multiplicam-se os coeficientes (5 × 5 = 25) e somam-se os expoentes (6 + 6 = 12), o que dá 25 × 10¹².',
      'Como 25 não está entre 1 e 10, escreve-se 25 = 2,5 × 10. Então 25 × 10¹² = 2,5 × 10 × 10¹² = 2,5 × 10¹³ hemácias.',
      'Armadilhas: 2,5 × 10¹² deixa o expoente sem ajuste depois de escrever 25 como 2,5; 2,5 × 10¹¹ ajusta o expoente no sentido errado; 2,5 × 10⁷ esquece de converter litros em mm³ (5 × 5 × 10⁶); 1 × 10¹³ soma os coeficientes (5 + 5 = 10) em vez de multiplicá-los.',
    ],
    concept:
      'Na multiplicação em notação científica, multiplicam-se os coeficientes e somam-se os expoentes. Se o coeficiente sair do intervalo de 1 a 10, ajusta-se o expoente para compensar.',
    estimatedSeconds: 90,
    source: AUTORAL,
    verify: () => 5 * Math.pow(10, 6) * (5 * Math.pow(10, 6)),
  },
  {
    id: 'BAS-309',
    topic: 'basica',
    subtopic: 'potencias',
    difficulty: 2,
    skills: ['H3', 'H4'],
    stem: [
      {
        kind: 'p',
        text: 'Uma associação de moradores de Londrina vai montar uma horta comunitária em um terreno de formato quadrado. Pelo projeto, o terreno todo será ocupado pela horta e deve ter, no mínimo, 200 m² de área; para facilitar a demarcação com estacas, a medida do lado deve ser um número inteiro de metros.',
      },
    ],
    ask: 'Qual é a menor medida inteira, em metros, que o lado do terreno pode ter para atender a essas exigências?',
    alternatives: alts('14 m', '16 m', '50 m', '100 m', '15 m'),
    answer: 'E',
    hints: [
      'Se o lado mede x metros, a área do quadrado é x². Procure o menor inteiro x tal que x² seja pelo menos 200; quadrados perfeitos próximos de 200 ajudam.',
      'Calcule o quadrado de alguns inteiros próximos de 14 e compare cada resultado com 200.',
    ],
    solution: [
      'Se o lado mede x metros, a área é x² m², e é preciso que x² ≥ 200, com x inteiro.',
      { explanation: 'Testando.', calculation: ['13² = 169', '14² = 196', '15² = 225', '16² = 256'] },
      '14² = 196 é menor que 200, então não atende; 15² = 225 é maior que 200, então atende. Logo, a raiz quadrada de 200 está entre 14 e 15 (vale cerca de 14,1).',
      'Como a área não pode ficar abaixo de 200 m² e o lado deve ser inteiro, é preciso arredondar para cima: o menor lado possível é 15 m.',
      'Armadilhas: 14 m arredonda a raiz para o inteiro mais próximo, mas gera apenas 196 m²; 16 m atende, porém não é o menor valor possível; 50 m confunde área com perímetro (200 ÷ 4); 100 m divide a área por 2 em vez de extrair a raiz.',
    ],
    concept:
      'Quando a raiz quadrada não é exata, localiza-se entre dois inteiros consecutivos usando quadrados perfeitos (14² = 196 < 200 < 225 = 15²). Em condições do tipo "no mínimo", o arredondamento é para cima.',
    estimatedSeconds: 75,
    source: AUTORAL,
    verify: () => Math.ceil(Math.sqrt(200)),
  },
  {
    id: 'BAS-310',
    topic: 'basica',
    subtopic: 'notacao-cientifica',
    difficulty: 2,
    skills: ['H1', 'H3'],
    stem: [
      {
        kind: 'p',
        text: 'Na aula de Astronomia de um colégio de Belém, a professora Beatriz apresentou à turma os valores aproximados das massas da Terra e da Lua, arredondados para facilitar as contas, reunidos na tabela a seguir.',
      },
      {
        kind: 'table',
        header: ['Corpo celeste', 'Massa (kg)'],
        rows: [
          ['Terra', '6 × 10²⁴'],
          ['Lua', '7,5 × 10²²'],
        ],
      },
    ],
    ask: 'A massa da Terra equivale a quantas vezes a massa da Lua? Em notação científica, a resposta é',
    alternatives: alts('8 × 10²', '8 × 10¹', '8 × 10⁻¹', '1,25 × 10²', '1,25 × 10⁻²'),
    answer: 'B',
    hints: [
      'Descobrir quantas vezes uma massa é maior que a outra é uma divisão: a massa maior dividida pela menor.',
      'Em notação científica, divida os coeficientes entre si e subtraia os expoentes das potências de 10; depois ajuste o coeficiente para ficar entre 1 e 10.',
    ],
    solution: [
      { explanation: 'Compare as massas na ordem pedida: Terra dividida pela Lua.', calculation: ['(6 × 10²⁴) ÷ (7,5 × 10²²)'] },
      { explanation: 'Divida os coeficientes e subtraia os expoentes das potências de 10.', calculation: ['6 ÷ 7,5 = 0,8', '24 − 22 = 2', 'Razão = 0,8 × 10²'] },
      { explanation: 'Normalize a mantissa. Ao multiplicá-la por 10, reduza o expoente em 1.', calculation: ['0,8 × 10² = 8 × 10⁻¹ × 10²', '= 8 × 10¹', '= 80'] },
      'Conferência: 80 × 7,5 × 10²² = 600 × 10²² = 6 × 10²⁴, a massa da Terra.',
      'Armadilhas: 8 × 10² transforma 0,8 em 8 sem compensar o expoente; 8 × 10⁻¹ (= 0,8) esquece a potência de 10 e divide só os coeficientes; 1,25 × 10² inverte a divisão dos coeficientes (7,5 ÷ 6); 1,25 × 10⁻² é a razão inversa, massa da Lua dividida pela da Terra.',
    ],
    concept:
      'Na divisão em notação científica, dividem-se os coeficientes e subtraem-se os expoentes. Para comparar "quantas vezes", divide-se a grandeza maior pela menor, e o resultado é ajustado para ter coeficiente entre 1 e 10.',
    estimatedSeconds: 70,
    source: AUTORAL,
    verify: () => (6 * Math.pow(10, 24)) / (7.5 * Math.pow(10, 22)),
  },
  {
    id: 'BAS-311',
    topic: 'basica',
    subtopic: 'potencias',
    difficulty: 3,
    skills: ['H3', 'H10'],
    stem: [
      {
        kind: 'p',
        text: 'Na computação, a capacidade de armazenamento costuma ser medida com múltiplos do byte que são potências de 2. Para este problema, considere:',
      },
      { kind: 'math', lines: ['1 KB = 2¹⁰ bytes', '1 MB = 2¹⁰ KB', '1 GB = 2¹⁰ MB'] },
      {
        kind: 'p',
        text: 'Rafael, estudante de Jornalismo em Recife, vai usar o celular para gravar vídeos de um documentário. O celular tem um cartão de memória de 16 GB, dos quais 2 GB já estão ocupados por aplicativos e arquivos do sistema. Cada vídeo gravado ocupa exatamente 256 MB.',
      },
    ],
    ask: 'No espaço que está livre, cabem quantos vídeos?',
    alternatives: alts('62', '28', '54', '64', '56'),
    answer: 'E',
    hints: [
      'Primeiro descubra quanto espaço está livre no cartão. Depois, expresse esse espaço e o tamanho de cada vídeo na mesma unidade, usando as potências de 2 do enunciado.',
      'Converta o espaço livre de GB para MB multiplicando por 2¹⁰ e, em seguida, divida pelo tamanho de um vídeo (256 MB = 2⁸ MB).',
    ],
    solution: [
      { explanation: 'Espaço livre.', calculation: ['16 − 2 = 14 GB'] },
      'Em MB: 14 GB = 14 × 2¹⁰ MB, pois 1 GB = 2¹⁰ MB.',
      'Cada vídeo ocupa 256 MB = 2⁸ MB.',
      { explanation: 'Número de vídeos.', calculation: ['(14 × 2¹⁰) ÷ 2⁸ = 14 × 2¹⁰⁻⁸', '= 14 × 2²', '= 14 × 4', '= 56'] },
      'Conferência: 1 GB = 1.024 MB e 1.024 ÷ 256 = 4, então cabem 4 vídeos em cada GB livre: 14 × 4 = 56.',
      'Armadilhas: 64 ignora os 2 GB já ocupados (16 × 4); 62 desconta 2 vídeos em vez de 2 GB; 54 usa 1 GB = 1.000 MB (14.000 ÷ 256 ≈ 54,7); 28 confunde o tamanho do vídeo com 512 MB.',
    ],
    concept:
      'Nos múltiplos do byte usados em computação, cada unidade vale 2¹⁰ = 1.024 vezes a anterior. Ao dividir potências de mesma base, subtraem-se os expoentes: 2¹⁰ ÷ 2⁸ = 2².',
    estimatedSeconds: 120,
    source: AUTORAL,
    verify: () => ((16 - 2) * Math.pow(2, 10)) / Math.pow(2, 8),
  },
  {
    id: 'BAS-312',
    topic: 'basica',
    subtopic: 'notacao-cientifica',
    difficulty: 3,
    skills: ['H3', 'H10'],
    stem: [
      {
        kind: 'p',
        text: 'Uma equipe de pesquisadores de uma universidade de Campinas usa um servidor capaz de executar 2 × 10⁹ operações por segundo para fazer simulações do clima. Uma simulação completa exige 3,6 × 10¹⁵ operações.',
      },
      {
        kind: 'p',
        text: 'Considere que o servidor trabalha sem interrupções, sempre na velocidade máxima, e lembre-se de que 1 hora tem 3.600 segundos.',
      },
    ],
    ask: 'O tempo necessário para concluir uma simulação, em horas, escrito em notação científica, é',
    alternatives: alts('1,8 × 10⁶ h', '5 × 10³ h', '5 × 10² h', '3 × 10⁴ h', '5 × 10¹ h'),
    answer: 'C',
    hints: [
      'O tempo é o número total de operações dividido pelo número de operações por segundo, e o resultado sai em segundos. Só depois é preciso mudar a unidade para horas.',
      'Comece calculando (3,6 × 10¹⁵) ÷ (2 × 10⁹): divida os coeficientes e subtraia os expoentes.',
    ],
    solution: [
      { explanation: 'Tempo é o total de operações dividido pelas operações realizadas a cada segundo.', calculation: ['t = (3,6 × 10¹⁵) ÷ (2 × 10⁹)'] },
      { explanation: 'Divida os coeficientes e subtraia os expoentes.', calculation: ['3,6 ÷ 2 = 1,8', '15 − 9 = 6', 't = 1,8 × 10⁶ s'] },
      { explanation: 'Uma hora tem 3.600 segundos. Divida para obter o tempo em horas.', calculation: ['1 h = 3,6 × 10³ s', 't = (1,8 × 10⁶) ÷ (3,6 × 10³)', 't = 0,5 × 10³ h', 't = 500 h'] },
      'Em notação científica: 500 = 5 × 10² h (cerca de 21 dias).',
      'Armadilhas: 1,8 × 10⁶ h esquece de converter segundos em horas; 3 × 10⁴ h divide só por 60, obtendo minutos; 5 × 10³ h e 5 × 10¹ h erram uma potência de 10 na divisão por 3.600 (como se 1 h tivesse 360 s ou 36.000 s).',
    ],
    concept:
      'Na divisão em notação científica, dividem-se os coeficientes e subtraem-se os expoentes. Em problemas de tempo, confira a unidade: segundos viram horas dividindo por 3.600.',
    estimatedSeconds: 130,
    source: AUTORAL,
    verify: () => (3.6 * Math.pow(10, 15)) / (2 * Math.pow(10, 9)) / 3600,
    tolerance: 1e-6,
  },
]);
