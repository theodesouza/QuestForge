import { AUTORAL, alts, batch } from '../_helpers';

/** Máximo divisor comum (algoritmo de Euclides) — apoio às verificações; não exportado. */
const mdc = (a: number, b: number): number => (b === 0 ? a : mdc(b, a % b));
/** Mínimo múltiplo comum — apoio às verificações; não exportado. */
const mmc = (a: number, b: number): number => (a / mdc(a, b)) * b;
/** Teste de primalidade por divisão — apoio às verificações; não exportado. */
const ehPrimo = (n: number): boolean => n > 1 && Array.from({ length: n - 2 }, (_, i) => i + 2).every((d) => n % d !== 0);

/** Missão r3-m2 "A Torre dos Múltiplos" — questões extras (lote b, BAS-213 a BAS-224). Questões autorais. */
export const MISSAO_R3M2_B = batch([
  {
    id: 'BAS-213',
    topic: 'basica',
    subtopic: 'mmc-mdc',
    difficulty: 1,
    skills: ['H2', 'H3'],
    stem: [
      {
        kind: 'p',
        text: 'Na gincana de matemática de uma escola de Fortaleza, vão competir 30 alunos do 6º ano e 45 alunos do 7º ano. A organização quer montar equipes que obedeçam a três regras: cada equipe terá alunos de um único ano; todas as equipes terão o mesmo número de alunos; e esse número será o maior possível, sem que sobre nenhum aluno.',
      },
    ],
    ask: 'Quantos alunos terá cada equipe?',
    alternatives: alts('5', '90', '75', '15', '30'),
    answer: 'D',
    hints: [
      'O número de alunos de cada equipe precisa caber um número exato de vezes tanto em 30 quanto em 45, ou seja, tem de ser um divisor comum dos dois números.',
      'Liste os divisores de 30 e os de 45 e destaque os que aparecem nas duas listas; o enunciado pede o maior deles.',
    ],
    solution: [
      'Como cada equipe tem alunos de um único ano, o tamanho da equipe deve dividir 30 e também dividir 45: é um divisor comum de 30 e 45.',
      'Divisores de 30: 1, 2, 3, 5, 6, 10, 15, 30. Divisores de 45: 1, 3, 5, 9, 15, 45.',
      { explanation: 'Os divisores comuns listados são 1, 3, 5 e 15. Escolha o maior e confira a divisão das turmas.', calculation: ['MDC(30, 45) = 15 alunos por equipe', '30 ÷ 15 = 2 equipes', '45 ÷ 15 = 3 equipes'] },
      'Conferência: 30 ÷ 15 = 2 equipes do 6º ano e 45 ÷ 15 = 3 equipes do 7º ano, sem sobrar ninguém.',
      'Armadilhas: 5 também divide 30 e 45, mas não é o maior divisor comum; 90 é o MMC(30, 45), resultado de quem troca MDC por MMC; 75 é a soma 30 + 45, que não representa o tamanho de uma equipe; 30 divide o total do 6º ano, mas não divide 45 (sobrariam 15 alunos do 7º ano).',
    ],
    concept:
      'Dividir em grupos iguais, sem sobra e com o maior tamanho possível, é um problema de MDC: o tamanho do grupo é o maior divisor comum das quantidades.',
    estimatedSeconds: 50,
    source: AUTORAL,
    verify: () => mdc(30, 45),
  },
  {
    id: 'BAS-214',
    topic: 'basica',
    subtopic: 'mmc-mdc',
    difficulty: 2,
    skills: ['H2', 'H3'],
    stem: [
      {
        kind: 'p',
        text: 'Uma serralheria de Caxias do Sul (RS) tem duas barras de ferro: uma de 150 cm e outra de 210 cm. Para fazer as grades de uma janela, o serralheiro vai cortar as duas barras em pedaços de mesmo comprimento, o maior possível, de modo que não sobre nenhum resto de barra.',
      },
    ],
    ask: 'Quantos pedaços ele obterá ao todo?',
    alternatives: alts('30', '12', '35', '24', '1.050'),
    answer: 'B',
    hints: [
      'Antes de contar os pedaços, é preciso saber o comprimento de cada um: ele deve caber um número exato de vezes nas duas barras e ser o maior possível.',
      'Comece decompondo 150 e 210 em fatores primos para encontrar o maior comprimento que divide os dois.',
    ],
    solution: [
      'O comprimento de cada pedaço é o maior divisor comum de 150 e 210.',
      { explanation: 'Desenvolva a conta na ordem indicada.', calculation: ['150 = 2 × 3 × 5²', '210 = 2 × 3 × 5 × 7'] },
      'MDC(150, 210) = 2 × 3 × 5 = 30 cm.',
      'Pedaços da primeira barra: 150 ÷ 30 = 5. Pedaços da segunda: 210 ÷ 30 = 7. Total: 5 + 7 = 12 pedaços.',
      'Armadilhas: 30 é o comprimento de cada pedaço, e não a quantidade; 35 vem de multiplicar 5 × 7 em vez de somar; 24 seria a quantidade de pedaços de 15 cm (10 + 14), que é um divisor comum, mas não o maior; 1.050 é o MMC(150, 210), de quem troca MDC por MMC.',
    ],
    concept:
      'O maior comprimento que corta barras diferentes em pedaços iguais, sem sobra, é o MDC dos comprimentos. Depois de achá-lo, leia a pergunta: o número de pedaços é a soma dos quocientes de cada barra por esse valor.',
    estimatedSeconds: 80,
    source: AUTORAL,
    verify: () => 150 / mdc(150, 210) + 210 / mdc(150, 210),
  },
  {
    id: 'BAS-215',
    topic: 'basica',
    subtopic: 'mmc-mdc',
    difficulty: 2,
    skills: ['H2', 'H3'],
    stem: [
      {
        kind: 'p',
        text: 'A professora Marta, de Campo Grande (MS), vai comprar material para a turma e quer que o número de lápis seja exatamente igual ao número de borrachas. Na papelaria, os lápis são vendidos apenas em caixas com 12 unidades e as borrachas, apenas em pacotes com 8 unidades; não há venda de itens avulsos.',
      },
      {
        kind: 'p',
        text: 'Ela quer comprar a menor quantidade possível de cada item, com pelo menos uma embalagem de cada tipo.',
      },
    ],
    ask: 'Quantas embalagens (caixas de lápis mais pacotes de borracha) ela deve comprar ao todo?',
    alternatives: alts('24', '4', '5', '96', '3'),
    answer: 'C',
    hints: [
      'Os dois totais precisam ser iguais: 12 vezes o número de caixas tem de ser igual a 8 vezes o número de pacotes. Pense em que tipo de número é divisível por 12 e por 8 ao mesmo tempo.',
      'Liste os primeiros múltiplos de 12 e de 8 e procure o menor valor que aparece nas duas listas; depois descubra quantas embalagens formam esse total.',
    ],
    solution: [
      'O total de lápis é um múltiplo de 12 e o total de borrachas é um múltiplo de 8. Como os totais devem ser iguais, procuramos o menor múltiplo comum positivo: MMC(12, 8).',
      'Múltiplos de 12: 12, 24, 36… Múltiplos de 8: 8, 16, 24… Logo, MMC(12, 8) = 24.',
      'Com 24 itens de cada tipo: 24 ÷ 12 = 2 caixas de lápis e 24 ÷ 8 = 3 pacotes de borracha.',
      { explanation: 'Total de embalagens.', calculation: ['2 + 3 = 5'] },
      'Armadilhas: 24 é a quantidade de lápis (e também de borrachas), e não de embalagens; 4 é o MDC(12, 8), de quem pensa em dividir em partes iguais em vez de igualar totais; 96 = 12 × 8 é um múltiplo comum, mas muito maior que o menor; 3 conta apenas os pacotes de borracha.',
    ],
    concept:
      'Quando os totais de dois itens vendidos em embalagens fechadas precisam coincidir, o menor total possível é o MMC dos tamanhos das embalagens. Para saber quantas embalagens, divida o MMC pelo tamanho de cada uma.',
    estimatedSeconds: 80,
    source: AUTORAL,
    verify: () => mmc(12, 8) / 12 + mmc(12, 8) / 8,
  },
  {
    id: 'BAS-216',
    topic: 'basica',
    subtopic: 'mmc-mdc',
    difficulty: 3,
    skills: ['H2', 'H3'],
    stem: [
      {
        kind: 'p',
        text: 'Uma campanha de arrecadação de alimentos em Salvador recebeu 180 pacotes de arroz, 252 pacotes de feijão e 108 pacotes de macarrão. Os voluntários querem montar o maior número possível de caixas de doação idênticas, isto é, todas com a mesma quantidade de pacotes de cada alimento, sem que sobre nenhum pacote.',
      },
    ],
    ask: 'Quantos pacotes, ao todo, terá cada caixa de doação?',
    alternatives: alts('36', '12', '540', '45', '15'),
    answer: 'E',
    hints: [
      'O número de caixas precisa dividir 180, 252 e 108 ao mesmo tempo e, como se quer o maior número possível de caixas, trata-se de um MDC. Leia com atenção o que a pergunta pede.',
      'Decomponha os três números em fatores primos para achar o MDC; depois divida a quantidade de cada alimento por ele.',
    ],
    solution: [
      'O número de caixas é um divisor comum de 180, 252 e 108 e deve ser o maior possível: MDC(180, 252, 108).',
      { explanation: 'Desenvolva a conta na ordem indicada.', calculation: ['180 = 2² × 3² × 5', '252 = 2² × 3² × 7', '108 = 2² × 3³'] },
      'Fatores comuns, cada um com o menor expoente: 2² × 3² = 36. Logo, serão montadas 36 caixas.',
      'Em cada caixa: 180 ÷ 36 = 5 pacotes de arroz, 252 ÷ 36 = 7 de feijão e 108 ÷ 36 = 3 de macarrão.',
      { explanation: 'Pacotes por caixa.', calculation: ['5 + 7 + 3 = 15'] },
      'Armadilhas: 36 é o número de caixas, e não o conteúdo de cada uma; 540 = 180 + 252 + 108 é o total de pacotes recebidos; 45 é o conteúdo de cada caixa se fossem montadas apenas 12 caixas (um divisor comum, mas não o maior); 12 é o número dessas caixas.',
    ],
    concept:
      'Montar o maior número possível de grupos idênticos, sem sobra, é um problema de MDC das quantidades de cada item. A pergunta pode pedir o número de grupos ou o conteúdo de cada um: leia com atenção.',
    estimatedSeconds: 130,
    source: AUTORAL,
    verify: () => {
      const caixas = mdc(mdc(180, 252), 108);
      return 180 / caixas + 252 / caixas + 108 / caixas;
    },
  },
  {
    id: 'BAS-217',
    topic: 'basica',
    subtopic: 'mmc-mdc',
    difficulty: 1,
    skills: ['H1', 'H3'],
    stem: [
      {
        kind: 'p',
        text: 'Na rifa de uma festa beneficente em Manaus, os bilhetes têm 4 algarismos. O bilhete de Marcos aparece a seguir, mas o algarismo da centena ficou borrado e foi indicado por ?.',
      },
      { kind: 'math', lines: ['6 ? 3 4'] },
      {
        kind: 'p',
        text: 'O organizador garante que o número desse bilhete é divisível por 9.',
      },
    ],
    ask: 'Qual é o algarismo borrado?',
    alternatives: alts('5', '2', '8', '9', '4'),
    answer: 'A',
    hints: [
      'Existe um critério prático para saber se um número é divisível por 9 sem fazer a divisão; ele usa a soma dos algarismos.',
      'Some os algarismos conhecidos (6, 3 e 4) e veja quanto falta para chegar a um múltiplo de 9, lembrando que o algarismo borrado vai de 0 a 9.',
    ],
    solution: [
      'Um número é divisível por 9 quando a soma dos seus algarismos é divisível por 9.',
      { explanation: 'Soma dos algarismos conhecidos.', calculation: ['6 + 3 + 4 = 13'] },
      'Com o algarismo ?, a soma fica 13 + ?, um valor entre 13 e 22. O único múltiplo de 9 nesse intervalo é 18.',
      { explanation: '13 + ? = 18, logo ? = 5. Conferência.', calculation: ['6.534 ÷ 9 = 726'] },
      'Armadilhas: 2 e 8 deixam a soma divisível por 3 (15 e 21), mas não por 9, pois o critério do 3 é menos exigente; 9 confunde o divisor com o algarismo procurado; 4 resulta de errar a soma conhecida (6 + 3 + 4 = 14) e completar 18.',
    ],
    concept:
      'Critério de divisibilidade por 9: um número é divisível por 9 quando a soma de seus algarismos é divisível por 9. O critério do 3 é análogo, mas basta a soma ser divisível por 3.',
    estimatedSeconds: 45,
    source: AUTORAL,
    verify: () => {
      for (let d = 0; d <= 9; d++) {
        if ((6000 + d * 100 + 34) % 9 === 0) return d;
      }
      return -1;
    },
  },
  {
    id: 'BAS-218',
    topic: 'basica',
    subtopic: 'mmc-mdc',
    difficulty: 3,
    skills: ['H2', 'H3'],
    stem: [
      {
        kind: 'p',
        text: 'Uma cooperativa de fruticultores de Petrolina (PE) vai embalar 360 mangas e 540 goiabas em caixas. Frutas de tipos diferentes não serão misturadas, e todas as caixas, tanto as de manga quanto as de goiaba, terão a mesma quantidade de frutas, sem que sobre nenhuma fruta.',
      },
      {
        kind: 'p',
        text: 'Qualquer quantidade inteira de frutas por caixa é aceitável, inclusive 1 fruta por caixa, desde que satisfaça essas condições.',
      },
    ],
    ask: 'Quantas quantidades diferentes de frutas por caixa satisfazem essas condições?',
    alternatives: alts('9', '24', '18', '180', '16'),
    answer: 'C',
    hints: [
      'A quantidade por caixa precisa dividir 360 e 540 ao mesmo tempo. Todo divisor comum de dois números também é divisor do MDC deles.',
      'Comece calculando o MDC(360, 540) pela decomposição em fatores primos e depois use os expoentes para contar os divisores desse MDC.',
    ],
    solution: [
      'A quantidade por caixa deve ser um divisor comum de 360 e de 540. Os divisores comuns de dois números são exatamente os divisores do MDC deles.',
      { explanation: 'Desenvolva a conta na ordem indicada.', calculation: ['360 = 2³ × 3² × 5', '540 = 2² × 3³ × 5'] },
      'MDC(360, 540) = 2² × 3² × 5 = 180.',
      'Quantidade de divisores de 180 = 2² × 3² × 5¹: soma-se 1 a cada expoente e multiplicam-se os resultados: (2 + 1) × (2 + 1) × (1 + 1) = 3 × 3 × 2 = 18.',
      'Armadilhas: 9 ignora o fator 5; 24 é a quantidade de divisores de 360 (e também de 540), mas nem todo divisor de 360 divide 540; 180 é o MDC, isto é, a maior quantidade por caixa, e não o número de possibilidades; 16 resulta de excluir 1 e 180, o que o enunciado não pede (a caixa com 1 fruta foi expressamente aceita).',
    ],
    concept:
      'O número de divisores de N = pᵃ × qᵇ × rᶜ (primos distintos) é (a + 1)(b + 1)(c + 1). Os divisores comuns de dois números são os divisores do MDC deles.',
    estimatedSeconds: 130,
    source: AUTORAL,
    verify: () => Array.from({ length: 540 }, (_, i) => i + 1).filter((d) => 360 % d === 0 && 540 % d === 0).length,
  },
  {
    id: 'BAS-219',
    topic: 'basica',
    subtopic: 'mmc-mdc',
    difficulty: 2,
    skills: ['H3', 'H8'],
    stem: [
      {
        kind: 'p',
        text: 'Uma lojista de Belo Horizonte quer montar uma vitrine em forma de cubo, empilhando caixas de papelão que medem 12 cm × 18 cm × 30 cm. Todas as caixas devem ficar na mesma posição (lados de mesma medida voltados para a mesma direção), sem espaços vazios, e o cubo deve ser formado apenas por caixas inteiras.',
      },
    ],
    ask: 'Qual é o menor comprimento possível da aresta desse cubo?',
    alternatives: alts('36 cm', '60 cm', '90 cm', '360 cm', '180 cm'),
    answer: 'E',
    hints: [
      'Em cada direção, a aresta do cubo é formada por caixas lado a lado, e a aresta tem de ser a mesma nas três direções. Logo, ela precisa ser múltipla de 12, de 18 e de 30 ao mesmo tempo.',
      'Decomponha 12, 18 e 30 em fatores primos e monte o MMC com todos os fatores, tomando cada um com o maior expoente.',
    ],
    solution: [
      'A aresta é um múltiplo comum de 12, 18 e 30; a menor possível é o MMC(12, 18, 30).',
      { explanation: 'Desenvolva a conta na ordem indicada.', calculation: ['12 = 2² × 3', '18 = 2 × 3²', '30 = 2 × 3 × 5'] },
      'MMC: cada primo com o maior expoente que aparece: 2² × 3² × 5 = 4 × 9 × 5 = 180 cm.',
      'Conferência: 180 ÷ 12 = 15, 180 ÷ 18 = 10 e 180 ÷ 30 = 6, todos inteiros.',
      'Armadilhas: 36, 60 e 90 são os MMC de apenas dois dos números (12 e 18; 12 e 30; 18 e 30, respectivamente), e por isso uma das direções não fecha; 360 é múltiplo comum, mas não o menor.',
    ],
    concept:
      'O menor número que é múltiplo de vários números ao mesmo tempo é o MMC deles. Com três números, decomponha todos e use cada fator primo com o maior expoente.',
    estimatedSeconds: 80,
    source: AUTORAL,
    verify: () => mmc(mmc(12, 18), 30),
  },
  {
    id: 'BAS-220',
    topic: 'basica',
    subtopic: 'mmc-mdc',
    difficulty: 3,
    skills: ['H1', 'H3'],
    stem: [
      {
        kind: 'p',
        text: 'Um loteamento em Goiânia oferece um terreno retangular de área igual a 391 m². As medidas dos dois lados, em metros, são números inteiros maiores que 1. O proprietário quer cercar todo o contorno do terreno, dando uma volta completa com arame.',
      },
    ],
    ask: 'Quantos metros de arame, no mínimo, serão necessários para cercar o contorno do terreno?',
    alternatives: alts('784', '80', '40', '76', '782'),
    answer: 'B',
    hints: [
      'Os lados são dois números inteiros maiores que 1 cujo produto é 391; portanto, é preciso decompor 391 em fatores.',
      'Teste a divisão de 391 pelos números primos em ordem crescente (2, 3, 5, 7, 11, …). Não é preciso passar de 19, pois 20² = 400 é maior que 391.',
    ],
    solution: [
      'Os lados a e b são inteiros maiores que 1 e a × b = 391. Procuramos a decomposição de 391 em fatores primos.',
      { explanation: '391 não é divisível por 2, por 3 (3 + 9 + 1 = 13), por 5, por 7 (7 × 55 = 385, resto 6), por 11 (11 × 35 = 385, resto 6) nem por 13 (13 × 30 = 390, resto 1). Com 17.', calculation: ['17 × 23 = 391'] },
      { explanation: 'Como 17 e 23 são primos, os únicos divisores de 391 são 1, 17, 23 e 391. Pelo fato de os lados serem maiores que 1, medem 17 m e 23 m. (Conferência.', calculation: ['391 = 400 − 9', '= 20² − 3²', '= (20 − 3) × (20 + 3).)'] },
      { explanation: 'Contorno.', calculation: ['2 × (17 + 23) = 2 × 40', '= 80 m'] },
      'Armadilhas: 784 corresponde a lados de 1 m e 391 m, que o enunciado exclui; 40 é só a soma dos dois lados, sem dobrar; 76 supõe um terreno quase quadrado de lado 19 m (4 × 19); 782 vem de dobrar a própria área (2 × 391).',
    ],
    concept:
      'Decompor um número em fatores primos revela todos os seus divisores: se N = p × q, com p e q primos distintos, os divisores de N são 1, p, q e N. Para testar a primalidade de N, basta dividir pelos primos até a raiz quadrada de N.',
    estimatedSeconds: 140,
    source: AUTORAL,
    verify: () => {
      for (let a = 2; a * a <= 391; a++) {
        if (391 % a === 0) return 2 * (a + 391 / a);
      }
      return -1;
    },
  },
  {
    id: 'BAS-221',
    topic: 'basica',
    subtopic: 'mmc-mdc',
    difficulty: 3,
    skills: ['H3', 'H8'],
    stem: [
      {
        kind: 'p',
        text: 'Em um banheiro de Recife, o pedreiro vai revestir uma parede retangular de 4,2 m de largura por 3 m de altura com azulejos quadrados, todos iguais, de lado inteiro em centímetros. Ele escolhe o maior lado possível, de modo que não seja preciso cortar nenhum azulejo nem sobre espaço na parede.',
      },
      {
        kind: 'p',
        text: 'Para manter as juntas alinhadas, ele coloca um espaçador plástico em todo ponto onde se encontram cantos de azulejos, incluindo os pontos sobre as bordas e os quatro cantos da parede.',
      },
    ],
    ask: 'Quantos espaçadores serão usados?',
    alternatives: alts('48', '35', '42', '40', '60'),
    answer: 'A',
    hints: [
      'Primeiro descubra o lado do azulejo: ele precisa caber um número exato de vezes na largura e na altura e ser o maior possível (cuidado para usar a mesma unidade nas duas medidas). Depois, pense em quantas linhas de pontos existem em cada direção.',
      'Converta 4,2 m e 3 m para centímetros e calcule o MDC. Em seguida, represente a malha: com n azulejos em uma fila, há n + 1 pontos de encontro nessa fila.',
    ],
    solution: [
      { explanation: 'Medidas em centímetros.', calculation: ['4,2 m = 420 cm', '3 m = 300 cm'] },
      'O lado do azulejo é o MDC(420, 300). Como 420 = 2² × 3 × 5 × 7 e 300 = 2² × 3 × 5², o MDC é 2² × 3 × 5 = 60 cm.',
      'Azulejos em cada fila: 420 ÷ 60 = 7 na largura e 300 ÷ 60 = 5 na altura (ao todo, 35 azulejos).',
      'Os pontos de encontro formam uma malha: com 7 azulejos em uma fila há 7 + 1 = 8 pontos e, com 5 azulejos, há 5 + 1 = 6 pontos.',
      { explanation: 'Total de espaçadores.', calculation: ['8 × 6 = 48'] },
      'Armadilhas: 35 é a quantidade de azulejos, e não de pontos de encontro; 42 = 7 × 6 e 40 = 8 × 5 acrescentam 1 em apenas uma das direções; 60 é o lado do azulejo, em centímetros.',
    ],
    concept:
      'O maior azulejo quadrado que reveste um retângulo sem cortes tem lado igual ao MDC das medidas. Numa malha de m por n quadrados há (m + 1) × (n + 1) pontos de encontro, e não m × n.',
    estimatedSeconds: 170,
    source: AUTORAL,
    verify: () => {
      const lado = mdc(420, 300);
      return (420 / lado + 1) * (300 / lado + 1);
    },
  },
  {
    id: 'BAS-222',
    topic: 'basica',
    subtopic: 'mmc-mdc',
    difficulty: 2,
    skills: ['H1', 'H2'],
    stem: [
      {
        kind: 'p',
        text: 'Em um teatro de Porto Alegre, as poltronas de uma fileira são numeradas de 1 a 50. Para um evento de acessibilidade, a organização reservará apenas as poltronas cujo número é primo.',
      },
    ],
    ask: 'Quantas poltronas serão reservadas?',
    alternatives: alts('16', '14', '25', '15', '10'),
    answer: 'D',
    hints: [
      'Um número primo tem exatamente dois divisores: 1 e ele próprio. Lembre-se de que o número 1 tem um único divisor e de que existe um primo par.',
      'Para testar um número até 50, basta tentar dividi-lo pelos primos 2, 3, 5 e 7, pois todo número composto até 50 tem algum fator primo menor que 8.',
    ],
    solution: [
      'De 1 a 10, os primos são 2, 3, 5 e 7 (4 primos). O 1 não é primo, pois tem um único divisor, e o 2 é o único primo par.',
      'De 11 a 20: 11, 13, 17 e 19 (4 primos).',
      'De 21 a 30: 23 e 29 (2 primos), pois 21 = 3 × 7, 25 = 5² e 27 = 3³ são compostos.',
      'De 31 a 40: 31 e 37 (2 primos); 33, 35 e 39 são compostos.',
      'De 41 a 50: 41, 43 e 47 (3 primos); 45 e 49 (= 7²) são compostos.',
      { explanation: 'Some as quantidades de primos encontradas em cada grupo de dez números.', calculation: ['4 + 4 + 2 + 2 + 3', '= 8 + 4 + 3', '= 15 poltronas'] },
      'Armadilhas: 16 aparece ao contar o 1 como primo; 14 aparece ao esquecer o 2, achando que todo primo é ímpar; 25 é a quantidade de números ímpares de 1 a 50; 10 resulta de contar só os primos até 29, parando no meio da lista.',
    ],
    concept:
      'Número primo é o que tem exatamente dois divisores naturais: 1 e ele mesmo. Por isso o 1 não é primo, e o 2 é o único primo par.',
    estimatedSeconds: 80,
    source: AUTORAL,
    verify: () => Array.from({ length: 50 }, (_, i) => i + 1).filter(ehPrimo).length,
  },
  {
    id: 'BAS-223',
    topic: 'basica',
    subtopic: 'mmc-mdc',
    difficulty: 3,
    skills: ['H2', 'H3'],
    stem: [
      {
        kind: 'p',
        text: 'Em uma oficina de Natal (RN), um mecânico testa duas engrenagens acopladas de uma máquina de fiação: a engrenagem menor tem 24 dentes e a maior tem 36 dentes. Em certo instante, o dente de cada engrenagem que foi pintado de vermelho está exatamente no ponto de contato entre as duas. As engrenagens passam, então, a girar sem deslizar.',
      },
    ],
    ask: 'Quantas voltas completas terá dado a engrenagem menor quando os dois dentes pintados estiverem novamente no ponto de contato pela primeira vez?',
    alternatives: alts('2', '3', '12', '72', '5'),
    answer: 'B',
    hints: [
      'Cada vez que um dente de uma engrenagem passa pelo ponto de contato, um dente da outra também passa. Os dentes pintados só voltam a se encontrar quando o total de dentes que passaram corresponde, ao mesmo tempo, a um número exato de voltas de cada engrenagem.',
      'Procure o menor total de dentes que passa pelo ponto de contato e que seja múltiplo de 24 e de 36; depois converta esse total em voltas da engrenagem menor.',
    ],
    solution: [
      'Quando N dentes passam pelo ponto de contato, a engrenagem menor dá N ÷ 24 voltas e a maior dá N ÷ 36 voltas.',
      'Os dentes pintados estão de novo em contato quando N ÷ 24 e N ÷ 36 são inteiros, isto é, quando N é múltiplo comum de 24 e 36. O primeiro reencontro ocorre com o menor deles: N = MMC(24, 36).',
      { explanation: 'O primeiro reencontro dos dentes pintados ocorre após o MMC dos números de dentes.', calculation: ['24 = 2³ × 3', '36 = 2² × 3²', 'MMC(24, 36) = 2³ × 3²', '= 8 × 9', '= 72 dentes'] },
      { explanation: 'Divida pelos dentes da engrenagem menor para achar suas voltas. A maior completa duas voltas.', calculation: ['72 ÷ 24 = 3 voltas da menor', '72 ÷ 36 = 2 voltas da maior'] },
      'Armadilhas: 2 é o número de voltas da engrenagem maior, e a pergunta pede o da menor; 12 é o MDC(24, 36), de quem troca MMC por MDC; 72 é o número de dentes que passaram, e não de voltas; 5 soma as voltas das duas engrenagens (3 + 2).',
    ],
    concept:
      'Ciclos de tamanhos diferentes voltam a coincidir após o MMC dos ciclos; em engrenagens, o ciclo é o número de dentes. Depois de achar o MMC, converta-o na grandeza pedida, aqui o número de voltas.',
    estimatedSeconds: 120,
    source: AUTORAL,
    verify: () => mmc(24, 36) / 24,
  },
  {
    id: 'BAS-224',
    topic: 'basica',
    subtopic: 'mmc-mdc',
    difficulty: 3,
    skills: ['H3', 'H8'],
    stem: [
      {
        kind: 'p',
        text: 'Uma fábrica de revestimentos em Criciúma (SC) produz placas cerâmicas retangulares de 36 cm × 60 cm. Um cliente encomendou um painel quadrado, o menor possível, montado apenas com placas inteiras, todas na mesma posição e sem folgas.',
      },
      {
        kind: 'p',
        text: 'Para facilitar o transporte, cada placa será cortada em ladrilhos quadrados iguais, com o maior lado possível e sem nenhuma sobra de material, e o painel será entregue já em ladrilhos.',
      },
    ],
    ask: 'Quantos ladrilhos quadrados comporão o painel?',
    alternatives: alts('15', '75', '45', '900', '225'),
    answer: 'E',
    hints: [
      'Há duas decisões diferentes: o tamanho do painel quadrado, que depende de múltiplos comuns, e o tamanho do ladrilho, que depende de divisores comuns. Identifique qual conceito, MMC ou MDC, corresponde a cada uma.',
      'Comece pelo lado do painel: ele é múltiplo de 36 e de 60 e deve ser o menor possível. Depois ache o lado do ladrilho e conte quantos cabem.',
    ],
    solution: [
      'Lado do painel: deve conter um número inteiro de placas em cada direção, logo é um múltiplo comum de 36 e 60, e o menor possível. Como 36 = 2² × 3² e 60 = 2² × 3 × 5, MMC(36, 60) = 2² × 3² × 5 = 180 cm.',
      'Número de placas: (180 ÷ 36) × (180 ÷ 60) = 5 × 3 = 15 placas.',
      'Lado do ladrilho: deve caber um número exato de vezes em 36 e em 60 e ser o maior possível: MDC(36, 60) = 2² × 3 = 12 cm.',
      { explanation: 'Ladrilhos por placa.', calculation: ['(36 ÷ 12) × (60 ÷ 12) = 3 × 5', '= 15'] },
      'Total: 15 placas × 15 ladrilhos = 225 ladrilhos. Conferência pela área: 180² ÷ 12² = (180 ÷ 12)² = 15² = 225.',
      'Armadilhas: 15 é o número de placas (ou de ladrilhos por placa), de quem para no meio da conta; 45 e 75 contam ladrilhos considerando uma só dimensão da placa (15 × 3 e 15 × 5); 900 vem de um painel de 360 cm de lado, que é múltiplo comum, mas não o menor.',
    ],
    concept:
      'Montar uma figura maior com peças iguais pede múltiplos comuns (MMC); cortar uma peça em partes iguais, sem sobra, pede divisores comuns (MDC). Problemas mistos exigem decidir qual dos dois conceitos vale em cada etapa.',
    estimatedSeconds: 190,
    source: AUTORAL,
    verify: () => {
      const ladoPainel = mmc(36, 60);
      const ladoLadrilho = mdc(36, 60);
      return (ladoPainel / ladoLadrilho) * (ladoPainel / ladoLadrilho);
    },
  },
]);
