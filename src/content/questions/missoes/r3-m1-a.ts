import { AUTORAL, alts, batch } from '../_helpers';

/** Missão r3-m1 "O Campo das Frações" — questões extras para repetição (lote a, BAS-101 a BAS-112). Questões autorais. */
export const MISSAO_R3M1_A = batch([
  {
    id: 'BAS-101',
    topic: 'basica',
    subtopic: 'fracoes',
    difficulty: 1,
    skills: ['H1', 'H3'],
    stem: [
      {
        kind: 'p',
        text: 'A equipe de futsal de uma escola de Goiânia disputou 15 jogos no campeonato municipal. Ela venceu 7 jogos, empatou 3 e perdeu todos os demais.',
      },
    ],
    ask: 'Que fração do total de jogos disputados corresponde às derrotas da equipe?',
    alternatives: alts('2/3', '1/3', '7/15', '1/5', '1/2'),
    answer: 'B',
    hints: [
      'Uma fração compara a quantidade de que se fala (as derrotas) com o total de jogos disputados. Antes, descubra quantas derrotas houve.',
      'Some as vitórias e os empates e subtraia essa soma do total de 15 jogos para achar o número de derrotas.',
    ],
    solution: [
      { explanation: 'Jogos sem derrota.', calculation: ['7 + 3 = 10'] },
      'Derrotas: 15 − 10 = 5 jogos.',
      'Fração das derrotas: 5/15; dividindo numerador e denominador por 5, obtém-se 1/3.',
      'Armadilhas: 2/3 (10/15) é a fração dos jogos em que a equipe não perdeu; 7/15 considera só as vitórias; 1/5 (3/15) considera só os empates; 1/2 (5/10) compara as derrotas com os demais resultados, em vez de compará-las com o total de jogos.',
    ],
    concept:
      'Uma fração compara uma parte com o todo: o denominador é o total de partes iguais e o numerador é quantas dessas partes são consideradas. O que "sobra" de um todo é o total menos as partes já usadas.',
    estimatedSeconds: 40,
    source: AUTORAL,
    verify: () => (15 - 7 - 3) / 15,
  },
  {
    id: 'BAS-102',
    topic: 'basica',
    subtopic: 'fracoes',
    difficulty: 2,
    skills: ['H1', 'H3'],
    stem: [
      {
        kind: 'p',
        text: 'Em uma gincana ambiental em Curitiba, cinco equipes receberam a mesma meta: plantar o mesmo número de mudas de árvores nativas. Ao final do primeiro dia, a fração da meta que cada equipe havia cumprido era a seguinte.',
      },
      {
        kind: 'table',
        header: ['Equipe', 'Fração da meta cumprida'],
        rows: [
          ['Ipê', '3/4'],
          ['Imbuia', '1/2'],
          ['Pinhão', '7/12'],
          ['Araucária', '5/6'],
          ['Erva-mate', '2/3'],
        ],
      },
      {
        kind: 'p',
        text: 'Na classificação parcial, a equipe que havia cumprido a maior fração da meta ocupa o 1º lugar, a seguinte ocupa o 2º lugar, e assim por diante.',
      },
    ],
    ask: 'Que fração da meta havia sido cumprida pela equipe que ocupa o 3º lugar nessa classificação?',
    alternatives: alts('3/4', '1/2', '5/6', '2/3', '7/12'),
    answer: 'D',
    hints: [
      'Frações com denominadores diferentes só podem ser comparadas diretamente depois de escritas com o mesmo denominador. Compare os valores das frações, e não seus numeradores ou denominadores isolados.',
      'Todos os denominadores (4, 2, 12, 6 e 3) dividem 12. Reescreva cada fração com denominador 12 e ordene os numeradores obtidos.',
    ],
    solution: [
      'Denominador comum: 12 (todos os denominadores são divisores de 12).',
      { explanation: 'Desenvolva a conta na ordem indicada.', calculation: ['3/4 = 9/12', '1/2 = 6/12', '7/12 = 7/12', '5/6 = 10/12', '2/3 = 8/12'] },
      'Da maior para a menor: 10/12 (Araucária), 9/12 (Ipê), 8/12 (Erva-mate), 7/12 (Pinhão), 6/12 (Imbuia).',
      'O 3º lugar é da equipe com 8/12 = 2/3 da meta.',
      'Armadilhas: 3/4 aparece ao ordenar só pelos numeradores (ou pelos denominadores, achando que denominador maior significa fração maior); 7/12 é a fração da 3ª linha da tabela, e não a do 3º lugar; 5/6 e 1/2 são as frações do 1º e do último colocado.',
    ],
    concept:
      'Para comparar frações, escreva-as com o mesmo denominador (por exemplo, usando o MMC dos denominadores): então a maior fração é a de maior numerador. Comparar numeradores ou denominadores isoladamente leva a erros.',
    estimatedSeconds: 80,
    source: AUTORAL,
    verify: () => [3 / 4, 1 / 2, 7 / 12, 5 / 6, 2 / 3].sort((a, b) => b - a)[2],
  },
  {
    id: 'BAS-103',
    topic: 'basica',
    subtopic: 'fracoes',
    difficulty: 3,
    skills: ['H1', 'H3'],
    stem: [
      {
        kind: 'p',
        text: 'Seu Osvaldo é caminhoneiro e vai levar uma carga de uma cidade a outra, sempre pela mesma estrada. Na 1ª etapa da viagem, ele percorreu 1/4 de todo o trajeto. Na 2ª etapa, percorreu 3/5 da distância que ainda faltava depois da 1ª etapa. Ao final das duas etapas, ainda faltavam 90 km para chegar ao destino.',
      },
    ],
    ask: 'Qual é a distância total do trajeto entre as duas cidades?',
    alternatives: alts('300 km', '600 km', '225 km', '120 km', '135 km'),
    answer: 'A',
    hints: [
      'A fração 3/5 da 2ª etapa não é fração do trajeto todo, e sim da distância que faltava depois da 1ª etapa. Acompanhe o que resta após cada etapa.',
      'Depois da 1ª etapa, restam 3/4 do trajeto. Depois da 2ª, restam 2/5 desse restante. Calcule que fração do trajeto total isso representa.',
    ],
    solution: [
      'Depois da 1ª etapa, restam 1 − 1/4 = 3/4 do trajeto.',
      'Na 2ª etapa, ele percorre 3/5 desse restante; portanto, sobram 2/5 dele.',
      { explanation: 'Fração do trajeto que falta no final.', calculation: ['2/5 de 3/4 = 2/5 × 3/4', '= 6/20', '= 3/10'] },
      'Se 3/10 do trajeto valem 90 km, então 1/10 vale 30 km e o trajeto inteiro mede 10 × 30 = 300 km.',
      'Conferência: 1ª etapa = 75 km; faltam 225 km; 2ª etapa = 3/5 de 225 = 135 km; faltam 90 km, como no enunciado.',
      'Armadilhas: 600 km ocorre quando se toma 3/5 como fração do trajeto todo (restaria 1 − 1/4 − 3/5 = 3/20, e 90 ÷ 3/20 = 600); 225 km é a distância que faltava após a 1ª etapa (conta interrompida no meio); 120 km ignora a 2ª etapa (90 = 3/4 do trajeto); 135 km é apenas a distância percorrida na 2ª etapa.',
    ],
    concept:
      'Quando uma fração se refere ao "que faltava" ou ao "restante", ela é fração dessa quantidade, e não do todo: frações sucessivas se multiplicam. Em problemas inversos, descobre-se a fração do todo que corresponde ao valor conhecido e divide-se o valor por ela.',
    estimatedSeconds: 120,
    source: AUTORAL,
    verify: () => 90 / ((3 / 4) * (2 / 5)),
    tolerance: 0.001,
  },
  {
    id: 'BAS-104',
    topic: 'basica',
    subtopic: 'operacoes',
    difficulty: 1,
    skills: ['H3'],
    stem: [
      {
        kind: 'p',
        text: 'Na feira livre de um bairro de Teresina, Dona Neide comprou 3,5 kg de manga a R$ 4,20 o quilo e pagou com uma nota de R$ 20,00.',
      },
    ],
    ask: 'Quanto Dona Neide recebeu de troco?',
    alternatives: alts('R$ 14,70', 'R$ 12,30', 'R$ 7,40', 'R$ 18,53', 'R$ 5,30'),
    answer: 'E',
    hints: [
      'O troco é a diferença entre o valor pago e o valor da compra, então primeiro é preciso saber quanto custaram as mangas.',
      'Multiplique a quantidade (3,5 kg) pelo preço do quilo (R$ 4,20) para obter o valor da compra.',
    ],
    solution: [
      'Valor da compra: 3,5 × 4,20 = R$ 14,70 (35 × 42 = 1.470, com duas casas decimais no produto).',
      { explanation: 'Troco.', calculation: ['20,00 − 14,70 = R$ 5,30'] },
      'Armadilhas: R$ 14,70 é o valor da compra, e não o troco; R$ 12,30 vem de somar 3,5 + 4,2 em vez de multiplicar; R$ 7,40 ignora os 0,5 kg (3 × 4,20 = 12,60); R$ 18,53 vem de colocar a vírgula no lugar errado no produto (1,47).',
    ],
    concept:
      'Na multiplicação de decimais, o produto tem tantas casas decimais quanto a soma das casas dos fatores. O troco é o valor pago menos o valor da compra.',
    estimatedSeconds: 45,
    source: AUTORAL,
    verify: () => 20 - 3.5 * 4.2,
    tolerance: 0.005,
  },
  {
    id: 'BAS-105',
    topic: 'basica',
    subtopic: 'fracoes',
    difficulty: 2,
    skills: ['H1', 'H3'],
    stem: [
      {
        kind: 'p',
        text: 'Em uma obra de ampliação de uma escola em Maceió, uma equipe de pedreiros precisa levantar um muro. No primeiro dia de trabalho, a equipe construiu 2/5 do muro. No segundo dia, construiu mais 1/4 do muro.',
      },
    ],
    ask: 'Que fração do muro ainda falta construir?',
    alternatives: alts('13/20', '2/3', '7/20', '3/5', '3/4'),
    answer: 'C',
    hints: [
      'Primeiro descubra que fração do muro já foi construída nos dois dias; o que falta é o que sobra para completar o muro inteiro, que corresponde a 1.',
      'Para somar 2/5 e 1/4, escreva as duas frações com um denominador comum (um múltiplo de 5 e de 4).',
    ],
    solution: [
      'Denominador comum: MMC(5, 4) = 20.',
      { explanation: '2/5 = 8/20 e 1/4 = 5/20; já construído.', calculation: ['8/20 + 5/20 = 13/20'] },
      'O muro inteiro é 20/20; falta 20/20 − 13/20 = 7/20.',
      'Armadilhas: 13/20 é a fração já construída; 2/3 vem de somar numeradores e denominadores (2/5 + 1/4 = 3/9) e depois subtrair de 1; 3/5 e 3/4 descontam apenas um dos dois dias (1 − 2/5 e 1 − 1/4).',
    ],
    concept:
      'Frações com denominadores diferentes só se somam ou se subtraem depois de reduzidas a um denominador comum (por exemplo, o MMC). O que falta para completar um todo é 1 menos o que já foi feito.',
    estimatedSeconds: 75,
    source: AUTORAL,
    verify: () => 1 - (2 / 5 + 1 / 4),
  },
  {
    id: 'BAS-106',
    topic: 'basica',
    subtopic: 'fracoes',
    difficulty: 1,
    skills: ['H1', 'H3'],
    stem: [
      {
        kind: 'p',
        text: 'A receita de pão de queijo de Dona Lúcia, de Belo Horizonte, rende 20 pães e leva 3/4 de xícara de polvilho doce. Para a festa junina da escola, ela vai assar 60 pães, mantendo a mesma proporção entre os ingredientes.',
      },
    ],
    ask: 'Quantas xícaras de polvilho doce Dona Lúcia vai precisar?',
    alternatives: alts('2 1/4', '3 3/4', '1/4', '3/4', '1 1/2'),
    answer: 'A',
    hints: [
      'Compare a quantidade de pães desejada com a da receita: isso diz quantas vezes a receita precisa ser repetida, e o polvilho também é repetido essas vezes.',
      'Divida 60 por 20 para saber quantas receitas serão feitas e depois multiplique 3/4 de xícara por esse número.',
    ],
    solution: [
      { explanation: 'Número de receitas.', calculation: ['60 ÷ 20 = 3'] },
      'Polvilho: 3 × 3/4 = 9/4 de xícara, ou seja, 2 xícaras e 1/4 (pois 9/4 = 8/4 + 1/4).',
      { explanation: 'Conferência.', calculation: ['3/4 + 3/4 + 3/4 = 6/4 + 3/4', '= 9/4', '= 2 1/4'] },
      'Armadilhas: 3 3/4 resulta de somar 3 + 3/4 em vez de multiplicar; 1/4 vem de dividir 3/4 por 3; 3/4 é a quantidade de uma única receita; 1 1/2 considera só os 40 pães a mais (2 receitas) e esquece o polvilho da receita original.',
    ],
    concept:
      'Multiplicar um número inteiro por uma fração equivale a repetir a fração esse número de vezes: 3 × 3/4 = 9/4. Para ampliar uma receita, todos os ingredientes são multiplicados pelo mesmo fator.',
    estimatedSeconds: 40,
    source: AUTORAL,
    verify: () => (60 / 20) * (3 / 4),
  },
  {
    id: 'BAS-107',
    topic: 'basica',
    subtopic: 'operacoes',
    difficulty: 2,
    skills: ['H1', 'H3'],
    stem: [
      {
        kind: 'p',
        text: 'Em um jogo de tabuleiro criado por alunos de uma escola do Recife, a pontuação final de cada jogador é calculada pela expressão numérica a seguir, em que as operações devem ser resolvidas na ordem de prioridade usual da Matemática.',
      },
      { kind: 'math', lines: ['5 + 3 × (12 − 2²) ÷ 4 − 1'] },
    ],
    ask: 'A pontuação final desse jogo, obtida ao resolver a expressão, é igual a',
    alternatives: alts('15', '12', '10', '13', '11'),
    answer: 'C',
    hints: [
      'Há uma ordem de prioridade: primeiro o que está entre parênteses (e, dentro deles, a potência), depois multiplicações e divisões e, por último, adições e subtrações.',
      'Comece pelo parêntese: calcule a potência 2² e, em seguida, a subtração 12 − 2².',
    ],
    solution: [
      'Potência dentro do parêntese: 2² = 4; então 12 − 4 = 8.',
      { explanation: 'Multiplicação e divisão, da esquerda para a direita.', calculation: ['3 × 8 = 24', '24 ÷ 4 = 6'] },
      { explanation: 'Adição e subtração, da esquerda para a direita.', calculation: ['5 + 6 − 1 = 10'] },
      'Armadilhas: 15 sai de calcular tudo da esquerda para a direita, sem prioridade (5 + 3 = 8; 8 × 8 = 64; 64 ÷ 4 = 16; 16 − 1 = 15); 12 vem de ignorar o parêntese (3 × 12 − 4 = 32; 32 ÷ 4 = 8; 5 + 8 − 1 = 12); 13 vem de dividir por (4 − 1) = 3 (24 ÷ 3 = 8 e 5 + 8 = 13); 11 resulta de esquecer o último termo (5 + 6 = 11).',
    ],
    concept:
      'Ordem das operações: parênteses, potências, multiplicações e divisões (da esquerda para a direita) e, por fim, adições e subtrações (da esquerda para a direita).',
    estimatedSeconds: 70,
    source: AUTORAL,
    verify: () => 5 + (3 * (12 - Math.pow(2, 2))) / 4 - 1,
  },
  {
    id: 'BAS-108',
    topic: 'basica',
    subtopic: 'fracoes',
    difficulty: 3,
    skills: ['H1', 'H3'],
    stem: [
      {
        kind: 'p',
        text: 'Em uma fazenda de Rondônia, um tanque de piscicultura tem três tubulações independentes. A torneira A, sozinha, enche o tanque vazio em 4 horas. A torneira B, sozinha, enche o tanque vazio em 6 horas. Já o ralo de saída, sozinho, esvazia o tanque cheio em 12 horas. Considere que as vazões são constantes.',
      },
      {
        kind: 'p',
        text: 'Em certo momento, o tanque está com 1/4 de sua capacidade e as duas torneiras e o ralo são abertos ao mesmo tempo.',
      },
    ],
    ask: 'Quanto tempo será necessário, a partir desse momento, para que o tanque fique completamente cheio?',
    alternatives: alts('3 h', '1 h 48 min', '2 h 25 min', '1 h 30 min', '2 h 15 min'),
    answer: 'E',
    hints: [
      'Pense em quanto cada tubulação enche (ou esvazia) do tanque em 1 hora: as torneiras somam e o ralo subtrai. Depois, veja que parte do tanque ainda falta encher.',
      'Calcule a fração do tanque preenchida por hora com tudo aberto: 1/4 + 1/6 − 1/12, usando denominador 12.',
    ],
    solution: [
      'Em 1 hora: a torneira A enche 1/4 do tanque, a B enche 1/6 e o ralo esvazia 1/12.',
      { explanation: 'Use denominador 12. Some as entradas de água e subtraia a saída pelo ralo.', calculation: ['1/4 + 1/6 − 1/12', '= 3/12 + 2/12 − 1/12', '= 4/12', '= 1/3 do tanque por hora'] },
      { explanation: 'Desconte a água que o tanque já tinha.', calculation: ['1 − 1/4 = 4/4 − 1/4', '= 3/4 do tanque'] },
      { explanation: 'Divida o volume que falta pela vazão líquida e converta a parte decimal das horas.', calculation: ['t = (3/4) ÷ (1/3)', 't = 3/4 × 3/1', 't = 9/4 h = 2,25 h', '0,25 × 60 = 15 min', 't = 2 h 15 min'] },
      'Armadilhas: 2 h 25 min resulta de ler 2,25 h como 2 h 25 min (0,25 h são 15 min, e não 25); 3 h desconsidera o 1/4 que o tanque já tinha (1 ÷ 1/3); 1 h 48 min ignora o ralo (taxa de 5/12 por hora e (3/4) ÷ (5/12) = 1,8 h); 1 h 30 min soma a vazão do ralo em vez de subtraí-la (taxa de 1/2 por hora e (3/4) ÷ (1/2) = 1,5 h).',
    ],
    concept:
      'Em problemas de torneiras, trabalha-se com a fração do tanque preenchida em 1 hora: vazões de entrada somam e as de saída subtraem. O tempo é a fração que falta dividida pela fração preenchida por hora.',
    estimatedSeconds: 170,
    source: AUTORAL,
    verify: () => (1 - 1 / 4) / (1 / 4 + 1 / 6 - 1 / 12),
    tolerance: 0.001,
  },
  {
    id: 'BAS-109',
    topic: 'basica',
    subtopic: 'fracoes',
    difficulty: 3,
    skills: ['H1', 'H3'],
    stem: [
      {
        kind: 'p',
        text: 'Em uma marcenaria de Caruaru (PE), a marceneira Dona Marta vai usar uma ripa de madeira de 4 m de comprimento para montar uma estante. Dela serão cortados 2 pedaços de 3/4 m, para as prateleiras, e 3 pedaços de 2/5 m, para os suportes. Desconsidere a madeira perdida pela serra nos cortes.',
      },
    ],
    ask: 'Depois de todos os cortes, qual será o comprimento do pedaço de ripa que sobra?',
    alternatives: alts('2 17/20 m', '1 3/10 m', '2 7/10 m', '2 1/10 m', '2 1/20 m'),
    answer: 'B',
    hints: [
      'Atenção à quantidade de pedaços de cada medida: o comprimento usado é a soma de todos os pedaços cortados, e a sobra é o que resta da ripa inteira.',
      'Calcule separadamente o comprimento total das prateleiras (2 × 3/4) e o dos suportes (3 × 2/5).',
    ],
    solution: [
      { explanation: 'Prateleiras.', calculation: ['2 × 3/4 = 6/4', '= 3/2 m'] },
      { explanation: 'Suportes.', calculation: ['3 × 2/5 = 6/5 m'] },
      { explanation: 'Comprimento usado.', calculation: ['3/2 + 6/5 = 15/10 + 12/10', '= 27/10 m', '= 2 7/10 m'] },
      { explanation: 'Sobra.', calculation: ['4 − 27/10 = 40/10 − 27/10', '= 13/10 m', '= 1 3/10 m'] },
      'Armadilhas: 2 7/10 m é o comprimento que foi usado, e não o que sobra; 2 17/20 m ocorre ao descontar só um pedaço de cada medida (4 − 3/4 − 2/5); 2 1/10 m desconta as 2 prateleiras e apenas 1 suporte; 2 1/20 m desconta apenas 1 prateleira e os 3 suportes.',
    ],
    concept:
      'Para somar ou subtrair medidas dadas em frações e números mistos, use um denominador comum. Várias peças iguais correspondem a uma multiplicação: n pedaços de a/b medem n × a/b.',
    estimatedSeconds: 120,
    source: AUTORAL,
    verify: () => 4 - 2 * (3 / 4) - 3 * (2 / 5),
    tolerance: 0.001,
  },
  {
    id: 'BAS-110',
    topic: 'basica',
    subtopic: 'operacoes',
    difficulty: 2,
    skills: ['H1', 'H3'],
    stem: [
      {
        kind: 'p',
        text: 'Durante uma onda de frio, o termômetro de uma estação meteorológica em São Joaquim (SC) marcava 5 °C às 20 h. Nas 4 horas seguintes, a temperatura caiu 3 °C a cada hora. Depois, nas 3 horas seguintes, ela subiu 2 °C a cada hora.',
      },
    ],
    ask: 'Qual temperatura o termômetro marcava às 3 h da madrugada?',
    alternatives: alts('−7 °C', '1 °C', '−13 °C', '−1 °C', '11 °C'),
    answer: 'D',
    hints: [
      'Quedas de temperatura são números negativos e aumentos são positivos. Acompanhe a temperatura em cada período, um de cada vez.',
      'Calcule primeiro a queda total nas 4 primeiras horas (4 × 3 °C) e subtraia-a de 5 °C para obter a temperatura à meia-noite.',
    ],
    solution: [
      'Queda nas 4 primeiras horas: 4 × 3 = 12 °C; à meia-noite: 5 − 12 = −7 °C.',
      { explanation: 'Aumento nas 3 horas seguintes.', calculation: ['3 × 2 = 6 °C', 'às 3 h: −7 + 6 = −1 °C'] },
      { explanation: 'Em uma só expressão.', calculation: ['5 − 4 × 3 + 3 × 2 = 5 − 12 + 6', '= −1'] },
      'Armadilhas: −7 °C é a temperatura à meia-noite, antes da subida; −13 °C vem de subtrair também o aumento (−7 − 6); 1 °C vem de errar o sinal ao calcular −7 + 6; 11 °C vem de somar a queda e subtrair o aumento (5 + 12 − 6).',
    ],
    concept:
      'Números inteiros representam variações em sentidos opostos (queda e subida, perda e ganho). Ao somar números de sinais diferentes, subtrai-se o menor valor absoluto do maior e mantém-se o sinal do que tem maior valor absoluto.',
    estimatedSeconds: 60,
    source: AUTORAL,
    verify: () => 5 - 4 * 3 + 3 * 2,
  },
  {
    id: 'BAS-111',
    topic: 'basica',
    subtopic: 'fracoes',
    difficulty: 1,
    skills: ['H1', 'H3'],
    stem: [
      {
        kind: 'p',
        text: 'Um sitiante de Passo Fundo (RS) destinou 2/3 de seu terreno ao plantio de grãos. Da área de plantio, 3/8 foram reservados para o milho.',
      },
    ],
    ask: 'Que fração da área total do terreno é ocupada pelo milho?',
    alternatives: alts('7/24', '3/8', '1/4', '5/11', '1/8'),
    answer: 'C',
    hints: [
      'A expressão "3/8 da área de plantio" indica uma fração de outra fração: o "de" corresponde a uma multiplicação.',
      'Multiplique 2/3 por 3/8 (numerador com numerador e denominador com denominador) e simplifique o resultado.',
    ],
    solution: [
      { explanation: 'O milho ocupa 3/8 de 2/3 do terreno.', calculation: ['3/8 × 2/3 = 6/24'] },
      { explanation: 'Simplificando por 6.', calculation: ['6/24 = 1/4'] },
      'Outro caminho: se o terreno tem 24 partes iguais, o plantio ocupa 16 partes (2/3 de 24) e o milho ocupa 3/8 de 16 = 6 partes; 6/24 = 1/4.',
      'Armadilhas: 7/24 vem de subtrair as frações (2/3 − 3/8); 3/8 ignora que essa fração vale só para a área de plantio; 5/11 vem de somar numeradores e denominadores; 1/8 usa o 1/3 não plantado no lugar de 2/3 (1/3 × 3/8).',
    ],
    concept:
      'Uma fração "de" outra fração é uma multiplicação: a/b de c/d = (a × c)/(b × d). O resultado indica a parte em relação ao todo original.',
    estimatedSeconds: 45,
    source: AUTORAL,
    verify: () => (2 / 3) * (3 / 8),
  },
  {
    id: 'BAS-112',
    topic: 'basica',
    subtopic: 'operacoes',
    difficulty: 3,
    skills: ['H3'],
    stem: [
      {
        kind: 'p',
        text: 'Na aula de Matemática, o professor Rui pediu aos alunos que calculassem, sem usar calculadora, o valor da expressão numérica a seguir, respeitando a ordem de prioridade das operações.',
      },
      { kind: 'math', lines: ['8,4 ÷ 0,4 − 3 × (2,5 − 0,5)² + 1,5'] },
    ],
    ask: 'O valor dessa expressão é',
    alternatives: alts('10,5', '16,5', '4,5', '7,5', '−8,4'),
    answer: 'A',
    hints: [
      'Resolva nesta ordem: parênteses, potência, multiplicação e divisão e, por último, adição e subtração. Cuidado com a divisão por um número decimal.',
      'Calcule 8,4 ÷ 0,4 multiplicando dividendo e divisor por 10 (fica 84 ÷ 4) e, separadamente, o parêntese 2,5 − 0,5.',
    ],
    solution: [
      { explanation: 'Divisão.', calculation: ['8,4 ÷ 0,4 = 84 ÷ 4', '= 21'] },
      'Parêntese: 2,5 − 0,5 = 2,0; potência: 2² = 4.',
      { explanation: 'Multiplicação.', calculation: ['3 × 4 = 12'] },
      { explanation: 'Adição e subtração, da esquerda para a direita.', calculation: ['21 − 12 + 1,5 = 9 + 1,5', '= 10,5'] },
      'Armadilhas: 16,5 vem de esquecer o expoente (3 × 2 = 6; 21 − 6 + 1,5); 4,5 vem de "distribuir" o quadrado (2,5² − 0,5² = 6, e 21 − 18 + 1,5); 7,5 vem de subtrair o último termo (21 − 12 − 1,5); −8,4 vem de errar a vírgula na divisão (8,4 ÷ 0,4 = 2,1, e 2,1 − 12 + 1,5).',
    ],
    concept:
      'Ordem das operações: parênteses, potências, multiplicações e divisões, adições e subtrações. Para dividir por um decimal, multiplique dividendo e divisor pela mesma potência de 10 até o divisor ficar inteiro.',
    estimatedSeconds: 110,
    source: AUTORAL,
    verify: () => 8.4 / 0.4 - 3 * Math.pow(2.5 - 0.5, 2) + 1.5,
    tolerance: 0.001,
  },
]);
