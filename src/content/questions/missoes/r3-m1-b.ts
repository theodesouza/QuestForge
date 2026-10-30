import { AUTORAL, alts, batch } from '../_helpers';

/** Missão r3-m1 "O Campo das Frações" — questões extras para repetição (lote b, BAS-113 a BAS-124). Questões autorais. */
export const MISSAO_R3M1_B = batch([
  {
    id: 'BAS-113',
    topic: 'basica',
    subtopic: 'fracoes',
    difficulty: 1,
    skills: ['H1', 'H3'],
    stem: [
      {
        kind: 'p',
        text: 'Para a festa de aniversário da filha, em Fortaleza, Marcela preparou 3 litros de suco de caju. Ela vai servir o suco em copinhos com capacidade de 1/4 de litro cada um, sempre enchendo o copo até a borda.',
      },
    ],
    ask: 'Quantos copinhos cheios Marcela consegue servir com todo o suco preparado?',
    alternatives: alts('3/4', '3 1/4', '7', '1/12', '12'),
    answer: 'E',
    hints: [
      'Saber quantas vezes uma quantidade cabe em outra é um problema de divisão. Aqui, trata-se de descobrir quantas vezes 1/4 cabe em 3.',
      'Comece por 1 litro: quantos copinhos de 1/4 de litro ele enche? Depois estenda o raciocínio para os 3 litros.',
    ],
    solution: [
      'Em 1 litro cabem 4 copinhos de 1/4 de litro, pois 4 × 1/4 = 1.',
      'Em 3 litros cabem 3 × 4 = 12 copinhos.',
      { explanation: 'Na forma de conta.', calculation: ['3 ÷ 1/4 = 3 × 4/1', '= 12'] },
      'Armadilhas: 3/4 vem de multiplicar 3 × 1/4 em vez de dividir; 3 1/4 vem de somar 3 + 1/4; 7 vem de somar 3 com o denominador 4; 1/12 vem de dividir 1/4 por 3, isto é, de inverter a divisão.',
    ],
    concept:
      'Dividir por uma fração equivale a multiplicar pelo seu inverso. Também dá para contar quantas vezes ela cabe no todo: se 1/4 cabe 4 vezes em 1, cabe 3 × 4 vezes em 3.',
    estimatedSeconds: 30,
    source: AUTORAL,
    verify: () => 3 / (1 / 4),
  },
  {
    id: 'BAS-114',
    topic: 'basica',
    subtopic: 'fracoes',
    difficulty: 2,
    skills: ['H1'],
    stem: [
      {
        kind: 'p',
        text: 'O relatório mensal de uma obra de pavimentação em Goiás informa que 62,5% do trecho previsto já foi asfaltado. O engenheiro responsável precisa apresentar esse avanço, em um quadro de acompanhamento, como fração irredutível do trecho total.',
      },
    ],
    ask: 'A fração irredutível que representa a parte do trecho já asfaltada é',
    alternatives: alts('3/5', '25/4', '5/8', '8/5', '1/16'),
    answer: 'C',
    hints: [
      'Porcentagem é uma razão com denominador 100. Escreva 62,5% dessa forma e, depois, simplifique a fração até que não seja mais possível.',
      'Para eliminar a vírgula em 62,5/100, multiplique o numerador e o denominador por 10. Em seguida, procure um divisor comum grande.',
    ],
    solution: [
      { explanation: 'Desenvolva a conta na ordem indicada.', calculation: ['62,5% = 62,5/100'] },
      'Multiplicando numerador e denominador por 10: 625/1.000.',
      'Dividindo ambos por 125 (625 = 5 × 125 e 1.000 = 8 × 125): 5/8. Como 5 e 8 não têm divisor comum além de 1, a fração é irredutível.',
      { explanation: 'Conferência.', calculation: ['5 ÷ 8 = 0,625', '= 62,5%'] },
      'Armadilhas: 3/5 corresponde a 60%, o que acontece ao arredondar 62,5% para 60%; 25/4 vem de escrever 625/100 (falta um zero) e vale 6,25; 8/5 é a fração invertida (160%); 1/16 vem de ler 62,5% como 0,0625, o que dá 625/10.000.',
    ],
    concept:
      'Porcentagem, número decimal e fração são formas de escrever a mesma razão: p% = p/100 e 0,625 = 625/1.000. Uma fração é irredutível quando numerador e denominador não têm divisor comum além de 1.',
    estimatedSeconds: 60,
    source: AUTORAL,
    verify: () => 62.5 / 100,
  },
  {
    id: 'BAS-115',
    topic: 'basica',
    subtopic: 'operacoes',
    difficulty: 2,
    skills: ['H3'],
    stem: [
      {
        kind: 'p',
        text: 'Em uma gincana escolar em Campo Grande, cada equipe começa com 100 pontos. Durante as provas, a equipe Falcões cometeu 8 infrações leves e, em 3 rodadas, cometeu 4 infrações graves em cada uma. Cada infração, leve ou grave, desconta 2 pontos da equipe. Ao final, a organização dividiu igualmente 36 pontos de bônus entre as 6 equipes participantes.',
      },
      {
        kind: 'p',
        text: 'A comissão calculou a pontuação final dos Falcões com a expressão:',
      },
      { kind: 'math', lines: ['100 − 2 × (8 + 3 × 4) + 36 ÷ 6'] },
    ],
    ask: 'Qual foi a pontuação final da equipe Falcões?',
    alternatives: alts('18', '66', '54', '102', '16'),
    answer: 'B',
    hints: [
      'Em uma expressão numérica, resolvem-se primeiro os parênteses. Dentro deles e fora deles, multiplicações e divisões são feitas antes de somas e subtrações.',
      'Comece pelo parêntese: dentro dele, faça primeiro a multiplicação 3 × 4 e só depois some o resultado com 8.',
    ],
    solution: [
      'Parênteses: 3 × 4 = 12 e, em seguida, 8 + 12 = 20.',
      { explanation: 'Fora do parêntese.', calculation: ['2 × 20 = 40', '36 ÷ 6 = 6'] },
      'Então 100 − 40 + 6 = 66 pontos.',
      'Conferência pelo texto: 8 + 3 × 4 = 20 infrações, que descontam 20 × 2 = 40 pontos; o bônus de cada equipe é 36 ÷ 6 = 6; logo 100 − 40 + 6 = 66.',
      'Armadilhas: 18 vem de somar 8 + 3 antes de multiplicar por 4 (a multiplicação tem prioridade sobre a soma); 54 vem de subtrair o bônus em vez de somá-lo; 102 vem de ignorar os parênteses (100 − 16 + 12 + 6); 16 vem de dividir por 6 todo o resultado anterior (96 ÷ 6), e não apenas o 36.',
    ],
    concept:
      'Ordem das operações: primeiro parênteses, depois potências e raízes, depois multiplicações e divisões (da esquerda para a direita) e, por fim, somas e subtrações.',
    estimatedSeconds: 60,
    source: AUTORAL,
    verify: () => 100 - 2 * (8 + 3 * 4) + 36 / 6,
  },
  {
    id: 'BAS-116',
    topic: 'basica',
    subtopic: 'operacoes',
    difficulty: 1,
    skills: ['H1', 'H3'],
    stem: [
      {
        kind: 'p',
        text: 'Na madrugada de um dia de inverno, a estação meteorológica de São Joaquim (SC) registrou temperatura de −3 °C. Ao longo da manhã, o termômetro subiu 7 °C.',
      },
    ],
    ask: 'Qual era a temperatura registrada ao final da subida?',
    alternatives: alts('4 °C', '−4 °C', '10 °C', '−10 °C', '7 °C'),
    answer: 'A',
    hints: [
      'Imagine a escala do termômetro como uma reta numérica: subir a temperatura é andar para o lado dos números maiores, partindo do valor inicial, que é negativo.',
      'Parta de −3 e avance 7 graus. Quantos graus são necessários para chegar ao zero? E quantos restam depois disso?',
    ],
    solution: [
      { explanation: 'Subir sete graus é somar 7 à temperatura inicial de −3 °C.', calculation: ['T = −3 + 7', 'T = 7 − 3', 'T = 4 °C'] },
      'De −3 °C até 0 °C são 3 graus; dos 7 graus da subida, restam 7 − 3 = 4 graus acima de zero.',
      'Temperatura final: 4 °C.',
      'Armadilhas: −10 °C vem de tratar a subida como descida (−3 − 7); 10 °C vem de ignorar o sinal negativo e somar 3 + 7; −4 °C vem de calcular 3 − 7; 7 °C vem de esquecer a temperatura inicial.',
    ],
    concept:
      'Somar um número positivo a um negativo é andar para a direita na reta numérica; o resultado é a diferença entre os módulos, com o sinal do número de maior módulo.',
    estimatedSeconds: 25,
    source: AUTORAL,
    verify: () => -3 + 7,
  },
  {
    id: 'BAS-117',
    topic: 'basica',
    subtopic: 'fracoes',
    difficulty: 3,
    skills: ['H1', 'H3'],
    stem: [
      {
        kind: 'p',
        text: 'Uma apicultora de Pirenópolis (GO) tem dois galões de mel: um com 2 1/2 litros e outro com 3 litros. Antes de envasar, ela separa 1/4 de litro para degustação na feira. Todo o restante do mel será envasado em potes com capacidade de 3/8 de litro cada um.',
      },
    ],
    ask: 'Quantos potes a apicultora consegue encher completamente?',
    alternatives: alts('14 2/3', '15 1/3', '1 3/4', '14', '42'),
    answer: 'D',
    hints: [
      'O que importa é o volume de mel que realmente vai para os potes. Descubra primeiro o total de mel e quanto sobra depois da reserva para degustação.',
      'Some os dois galões (2 1/2 + 3) e subtraia 1/4. Só depois pense em quantas vezes 3/8 cabe nesse volume.',
    ],
    solution: [
      { explanation: 'Total de mel.', calculation: ['2 1/2 + 3 = 5 1/2 L', '= 22/4 L'] },
      { explanation: 'Após a degustação.', calculation: ['22/4 − 1/4 = 21/4 L (5 1/4 L)'] },
      { explanation: 'Número de potes.', calculation: ['21/4 ÷ 3/8 = 21/4 × 8/3', '= 168/12', '= 14'] },
      'Conferência: 14 × 3/8 = 42/8 = 5 1/4 L, exatamente o volume disponível.',
      'Armadilhas: 14 2/3 vem de esquecer a reserva (22/4 ÷ 3/8); 15 1/3 vem de somar a reserva em vez de subtraí-la; 42 vem de multiplicar por 8 e esquecer de dividir por 3, o que conta quantos oitavos de litro há, e não quantos potes; 1 3/4 vem de dividir por 3 e esquecer de multiplicar por 8.',
    ],
    concept:
      'Para dividir por uma fração, multiplica-se pelo inverso dela: a ÷ (b/c) = a × c/b. Em problemas de envase, calcula-se antes o volume realmente disponível.',
    estimatedSeconds: 120,
    source: AUTORAL,
    verify: () => (2.5 + 3 - 0.25) / (3 / 8),
  },
  {
    id: 'BAS-118',
    topic: 'basica',
    subtopic: 'operacoes',
    difficulty: 3,
    skills: ['H1', 'H3'],
    stem: [
      {
        kind: 'p',
        text: 'Marta é artesã em Vitória e usa uma conta bancária que aceita saldo negativo (cheque especial). A tabela mostra o saldo de sua conta no início do mês e as movimentações feitas até o dia 14. Considere que não há cobrança de juros nem de tarifas nesse período.',
      },
      {
        kind: 'table',
        header: ['Dia', 'Movimentação', 'Valor'],
        rows: [
          ['01', 'Saldo no início do mês', 'R$ 260,00'],
          ['03', 'Pagamento do aluguel do ateliê', '− R$ 480,00'],
          ['08', 'Depósito de vendas de artesanato', '+ R$ 150,00'],
          ['14', 'Compra de material no débito', '− R$ 95,00'],
        ],
      },
    ],
    ask: 'Depois da movimentação do dia 14, Marta quer fazer um depósito para que o saldo da conta passe a ser de exatamente R$ 100,00 positivos. Qual deve ser o valor desse depósito?',
    alternatives: alts('R$ 165,00', 'R$ 265,00', 'R$ 65,00', 'R$ 525,00', 'R$ 565,00'),
    answer: 'B',
    hints: [
      'Acompanhe o saldo movimentação por movimentação: depósitos somam, retiradas subtraem, e o saldo pode ficar negativo. Só depois pense em quanto falta para chegar ao saldo desejado.',
      'Comece pelo saldo de R$ 260,00 e aplique o pagamento do dia 3 (−R$ 480,00): o resultado será um número negativo.',
    ],
    solution: [
      { explanation: 'Dia 3.', calculation: ['260 − 480 = −220'] },
      { explanation: 'Dia 8.', calculation: ['−220 + 150 = −70'] },
      'Dia 14: −70 − 95 = −165. Portanto, o saldo é de −R$ 165,00 (Marta está devendo ao banco).',
      'Depósito x para chegar a +100: −165 + x = 100, logo x = 265. Em outras palavras: R$ 165,00 para zerar a dívida mais R$ 100,00 para ficar com saldo positivo.',
      'Armadilhas: R$ 165,00 apenas zera a conta, sem deixar os R$ 100,00 positivos; R$ 65,00 vem de calcular 165 − 100, como se o saldo fosse positivo; R$ 525,00 esquece o saldo inicial de R$ 260,00 (−480 + 150 − 95 = −425); R$ 565,00 trata o depósito de R$ 150,00 como se fosse uma retirada (260 − 480 − 150 − 95 = −465).',
    ],
    concept:
      'Com números inteiros, somar um valor negativo equivale a subtrair; um saldo negativo representa dívida. Para chegar a um saldo desejado, soma-se o que falta, contando do saldo atual (mesmo negativo) até o alvo.',
    estimatedSeconds: 120,
    source: AUTORAL,
    verify: () => 100 - (260 - 480 + 150 - 95),
  },
  {
    id: 'BAS-119',
    topic: 'basica',
    subtopic: 'fracoes',
    difficulty: 1,
    skills: ['H1'],
    stem: [
      {
        kind: 'p',
        text: 'Em uma farmácia de manipulação de Curitiba, a farmacêutica Beatriz precisa pesar 3/8 de grama de um princípio ativo para preparar uma fórmula. A balança digital do laboratório, porém, só exibe a massa em número decimal, em gramas.',
      },
    ],
    ask: 'Para pesar a quantidade pedida, a leitura da balança deve ser de',
    alternatives: alts('0,375 g', '3,8 g', '2,67 g', '0,24 g', '0,0375 g'),
    answer: 'A',
    hints: [
      'Toda fração indica uma divisão: o numerador é dividido pelo denominador.',
      'Divida 3 por 8, acrescentando casas decimais. Outro caminho é multiplicar numerador e denominador por 125, para obter denominador 1.000.',
    ],
    solution: [
      { explanation: 'Desenvolva a conta na ordem indicada.', calculation: ['3/8 = 3 ÷ 8'] },
      'Como 3 < 8, escreve-se 0, e dividem-se 30 por 8: 3, resto 6; depois 60 por 8: 7, resto 4; depois 40 por 8: 5, resto 0. Logo, 3 ÷ 8 = 0,375.',
      'Outro caminho: 3/8 = (3 × 125)/(8 × 125) = 375/1.000 = 0,375.',
      'Armadilhas: 3,8 g vem de escrever o numerador e o denominador separados por vírgula; 2,67 g vem de dividir 8 por 3, isto é, de inverter a divisão; 0,24 g vem de multiplicar 3 × 8; 0,0375 g vem de errar a posição da vírgula na divisão.',
    ],
    concept:
      'Uma fração é um quociente: a/b = a ÷ b. Para obter a forma decimal, divide-se o numerador pelo denominador ou busca-se uma fração equivalente com denominador 10, 100, 1.000…',
    estimatedSeconds: 30,
    source: AUTORAL,
    verify: () => 3 / 8,
  },
  {
    id: 'BAS-120',
    topic: 'basica',
    subtopic: 'operacoes',
    difficulty: 2,
    skills: ['H3'],
    stem: [
      {
        kind: 'p',
        text: 'Rodrigo é representante comercial e vai viajar de carro, percorrendo 350 km entre duas cidades do interior do Paraná. Em estrada, o carro dele faz, em média, 12,5 km com cada litro de gasolina, e o litro custa R$ 5,60. Suponha que o consumo se mantenha constante durante todo o percurso.',
      },
    ],
    ask: 'Qual será o gasto de Rodrigo com combustível nessa viagem?',
    alternatives: alts('R$ 28,00', 'R$ 33,60', 'R$ 15,68', 'R$ 156,80', 'R$ 1.568,00'),
    answer: 'D',
    hints: [
      'Primeiro descubra quantos litros serão consumidos no percurso; só depois calcule quanto custam esses litros.',
      'Para dividir 350 por 12,5 sem calculadora, multiplique o dividendo e o divisor por 2, de modo que o divisor se torne um número inteiro.',
    ],
    solution: [
      'Litros consumidos: 350 ÷ 12,5 = 700 ÷ 25 = 28 litros.',
      { explanation: 'Custo.', calculation: ['28 × 5,60 = 28 × 5 + 28 × 0,60', '= 140 + 16,80', '= R$ 156,80'] },
      'Armadilhas: R$ 28,00 é a quantidade de litros, pois falta multiplicar pelo preço; R$ 33,60 vem de somar 28 + 5,60 em vez de multiplicar; R$ 15,68 vem de dividir 35 (e não 350) por 12,5; R$ 1.568,00 vem de ler 12,5 como 1,25, o que daria 280 litros.',
    ],
    concept:
      'Em operações com decimais, o número de casas decimais ajuda a controlar a ordem de grandeza. Consumo (km/L) e preço (R$/L) combinam-se em duas etapas: distância ÷ rendimento dá litros, e litros × preço dá o custo.',
    estimatedSeconds: 90,
    source: AUTORAL,
    verify: () => (350 / 12.5) * 5.6,
    tolerance: 0.005,
  },
  {
    id: 'BAS-121',
    topic: 'basica',
    subtopic: 'operacoes',
    difficulty: 2,
    skills: ['H3', 'H4'],
    stem: [
      {
        kind: 'p',
        text: 'Na barraca de Dona Lúcia, em uma feira de Belém (PA), a tela da calculadora está com defeito e não exibe a vírgula decimal. Ela vendeu 4,98 kg de farinha de tapioca a R$ 9,02 o quilo e multiplicou 4,98 por 9,02. A tela mostrou apenas os algarismos do resultado, sem vírgula:',
      },
      { kind: 'math', lines: ['449196'] },
    ],
    ask: 'Qual é o valor dessa venda, arredondado ao centavo?',
    alternatives: alts('R$ 4,49', 'R$ 449,20', 'R$ 44,92', 'R$ 4.491,96', 'R$ 0,45'),
    answer: 'C',
    hints: [
      'Os algarismos exibidos estão certos; falta apenas saber onde fica a vírgula. Uma estimativa com valores arredondados mostra a ordem de grandeza do resultado.',
      'Arredonde 4,98 para 5 e 9,02 para 9 e multiplique. O valor exato precisa ficar bem próximo desse resultado.',
    ],
    solution: [
      { explanation: 'Faça uma estimativa para saber onde a vírgula deve ficar.', calculation: ['4,98 ≈ 5', '9,02 ≈ 9', '5 × 9 = 45'] },
      'Com os algarismos 449196, o único posicionamento da vírgula que dá um valor próximo de 45 é 44,9196.',
      { explanation: 'Confira o produto inteiro e depois recoloque as quatro casas decimais.', calculation: ['498 × 902', '= 498 × 900 + 498 × 2', '= 448.200 + 996', '= 449.196', '4,98 × 9,02 = 44,9196'] },
      'Arredondando ao centavo: R$ 44,92.',
      'Armadilhas: os demais valores são os mesmos algarismos com a vírgula em outra posição, e todos destoam da estimativa. R$ 4,49 e R$ 0,45 são pequenos demais (menos que o preço de 1 kg), enquanto R$ 449,20 e R$ 4.491,96 são grandes demais (cada quilo custa pouco mais de R$ 9, e ela vendeu menos de 5 kg).',
    ],
    concept:
      'Estimar antes de calcular (arredondando os fatores) permite avaliar se um resultado é razoável e localizar a vírgula em um produto de decimais. O número de casas decimais do produto é a soma das casas dos fatores.',
    estimatedSeconds: 75,
    source: AUTORAL,
    verify: () => Math.round(4.98 * 9.02 * 100) / 100,
    tolerance: 0.005,
  },
  {
    id: 'BAS-122',
    topic: 'basica',
    subtopic: 'operacoes',
    difficulty: 2,
    skills: ['H1', 'H3'],
    stem: [
      {
        kind: 'p',
        text: 'Em um edifício comercial de Belo Horizonte, os andares são numerados assim: −3, −2 e −1 para os subsolos, 0 para o térreo e 1, 2, 3, … para os andares acima. Entre o piso de um andar e o do andar seguinte, inclusive nos subsolos, há sempre 3 metros.',
      },
      {
        kind: 'p',
        text: 'Um elevador parte do 11º andar, desce direto até o 3º subsolo (andar −3) e, em seguida, sobe direto até o 5º andar.',
      },
    ],
    ask: 'Qual é a distância total percorrida pelo elevador nesse trajeto?',
    alternatives: alts('18 m', '30 m', '22 m', '72 m', '66 m'),
    answer: 'E',
    hints: [
      'Distância percorrida não é o mesmo que deslocamento: é preciso somar o caminho da descida com o da subida, cada um contado em quantidade de andares (intervalos entre pisos).',
      'Na descida, o elevador vai do andar 11 ao andar −3. Calcule 11 − (−3) para saber quantos andares ele desce.',
    ],
    solution: [
      { explanation: 'Subtrair um andar negativo equivale a somar sua distância até o térreo.', calculation: ['11 − (−3) = 11 + 3', '= 14 andares'] },
      { explanation: 'Calcule também a subida do subsolo até o quinto andar.', calculation: ['5 − (−3) = 5 + 3', '= 8 andares'] },
      { explanation: 'Some as duas distâncias e converta andares em metros.', calculation: ['14 + 8 = 22 andares', '22 × 3 = 66 m'] },
      'Armadilhas: 18 m é apenas o deslocamento líquido (do 11º ao 5º andar, 6 andares); 30 m vem de ignorar o sinal do subsolo (8 + 2 = 10 andares); 22 m esquece de converter andares em metros; 72 m conta pisos em vez de intervalos (15 + 9 = 24 andares).',
    ],
    concept:
      'A distância entre as posições a e b na reta numérica é |b − a|, e subtrair um número negativo equivale a somar o seu oposto. A distância percorrida soma todos os trechos, e não apenas a diferença entre início e fim.',
    estimatedSeconds: 90,
    source: AUTORAL,
    verify: () => (Math.abs(-3 - 11) + Math.abs(5 - -3)) * 3,
  },
  {
    id: 'BAS-123',
    topic: 'basica',
    subtopic: 'fracoes',
    difficulty: 3,
    skills: ['H1', 'H3'],
    stem: [
      {
        kind: 'p',
        text: 'Uma pesquisa feita com moradores de um bairro de Recife perguntou como cada um vai ao trabalho. Os resultados foram divulgados de formas diferentes: 2/5 dos entrevistados vão de ônibus, 0,25 vão a pé, 15% vão de bicicleta e o restante vai de carro. Sabe-se que 12 entrevistados vão de carro.',
      },
    ],
    ask: 'Quantos moradores foram entrevistados?',
    alternatives: alts('60', '15', '30', '48', '120'),
    answer: 'A',
    hints: [
      'Para somar partes dadas como fração, decimal e porcentagem, escreva todas na mesma forma, por exemplo, em porcentagem.',
      'Converta 2/5 e 0,25 para porcentagem, some com os 15% e descubra que porcentagem do total corresponde ao grupo que vai de carro.',
    ],
    solution: [
      'Em porcentagem: 2/5 = 0,4 = 40%; 0,25 = 25%; e 15% já está nessa forma.',
      { explanation: 'Ônibus, a pé e bicicleta juntos.', calculation: ['40% + 25% + 15% = 80%'] },
      'Restante, que vai de carro: 100% − 80% = 20%, e esse grupo tem 12 pessoas.',
      'Se 20% do total são 12, então 10% são 6 e o total (100%) é 60 pessoas.',
      { explanation: 'Conferência.', calculation: ['40% de 60 = 24', '25% de 60 = 15', '15% de 60 = 9', '24 + 15 + 9 + 12 = 60'] },
      'Armadilhas: 15 vem de tratar as 12 pessoas como os 80% dos demais grupos (12 ÷ 0,8); 30 e 48 vêm de associar as 12 pessoas a um dos grupos dados (2/5 ou 0,25) em vez de ao restante; 120 vem de errar a soma dos percentuais, obtendo 90% em vez de 80%, e dividir 12 por 10%.',
    ],
    concept:
      'Fração, número decimal e porcentagem são representações do mesmo número: 2/5 = 0,4 = 40%. Para combinar partes de um todo, convertem-se todas para a mesma forma; o que falta para 100% é o restante.',
    estimatedSeconds: 110,
    source: AUTORAL,
    verify: () => 12 / (1 - (2 / 5 + 0.25 + 0.15)),
    tolerance: 0.005,
  },
  {
    id: 'BAS-124',
    topic: 'basica',
    subtopic: 'fracoes',
    difficulty: 3,
    skills: ['H1', 'H3'],
    stem: [
      {
        kind: 'p',
        text: 'Em um ateliê de chocolates artesanais de Ilhéus (BA), a chocolatier Helena separou 7,5 kg de chocolate para uma encomenda. Ela usou 40% dessa massa para cobrir bolos e, do que restou, usou 1/3 para fazer decorações. Todo o chocolate que sobrou foi usado para fazer bombons, e cada bombom leva 3/80 de quilograma de chocolate.',
      },
    ],
    ask: 'Quantos bombons Helena consegue fazer com todo o chocolate que sobrou?',
    alternatives: alts('240', '120', '40', '80', '128'),
    answer: 'D',
    hints: [
      'Acompanhe a história etapa por etapa e descubra, a cada uma, quanto chocolate sobra para a seguinte. Atenção: 40% refere-se à massa inicial, e 1/3 refere-se ao que restou depois da cobertura.',
      'Comece calculando 40% de 7,5 kg e quanto chocolate restou depois da cobertura dos bolos.',
    ],
    solution: [
      'Cobertura: 40% de 7,5 = 0,4 × 7,5 = 3 kg; restam 7,5 − 3 = 4,5 kg.',
      'Decorações: 1/3 de 4,5 = 1,5 kg; restam 4,5 − 1,5 = 3 kg (ou seja, 2/3 de 4,5).',
      { explanation: 'Bombons.', calculation: ['3 ÷ 3/80 = 3 × 80/3', '= 80'] },
      'Conferência: 80 × 3/80 = 3 kg, exatamente o que sobrou.',
      'Armadilhas: 120 vem de esquecer de descontar as decorações (4,5 ÷ 3/80); 40 vem de entender "usou 1/3" como "sobrou 1/3" (1,5 ÷ 3/80); 240 vem de multiplicar 3 por 80 e esquecer de dividir por 3; 128 vem de ler 40% como 0,04, o que deixaria 4,8 kg para os bombons.',
    ],
    concept:
      'Em problemas de etapas sucessivas, cada fração ou porcentagem incide sobre uma base diferente, que é o que restou da etapa anterior. Ao final, dividir por uma fração equivale a multiplicar pelo seu inverso.',
    estimatedSeconds: 180,
    source: AUTORAL,
    verify: () => {
      const aposCobertura = 7.5 - 0.4 * 7.5;
      const aposDecoracao = aposCobertura - aposCobertura / 3;
      return aposDecoracao / (3 / 80);
    },
    tolerance: 0.005,
  },
]);
