import { AUTORAL, alts, batch } from '../_helpers';

/** Missão r2-m2 — questões extras para repetição (lote b, FIN-212 a FIN-222). Questões autorais. */
export const MISSAO_R2M2_B = batch([
  {
    id: 'FIN-212',
    topic: 'financeira',
    subtopic: 'juros-compostos',
    difficulty: 1,
    skills: ['H3', 'H21'],
    stem: [
      {
        kind: 'p',
        text: 'Ana Clara ganhou medalha de ouro na olimpíada de matemática da sua escola, em Natal, e recebeu um prêmio de R$ 7.500,00. Os pais aplicaram todo o valor em um título de renda fixa que rende 8% ao ano, no regime de juros compostos, por 5 anos, sem depósitos nem retiradas.',
      },
      { kind: 'math', lines: ['Use: 1,08⁵ ≈ 1,47'] },
    ],
    ask: 'Ao final dos 5 anos, o montante dessa aplicação será de, aproximadamente,',
    alternatives: alts('R$ 11.025,00', 'R$ 10.500,00', 'R$ 3.525,00', 'R$ 18.525,00', 'R$ 8.100,00'),
    answer: 'A',
    hints: [
      'Nos juros compostos, o saldo é multiplicado por 1,08 a cada ano; depois de 5 anos, ele terá sido multiplicado por 1,08 cinco vezes seguidas.',
      'Escreva o montante como o valor aplicado multiplicado por 1,08⁵ e use a aproximação dada no enunciado.',
    ],
    solution: [
      'Em juros compostos, M = C × (1 + i)ⁿ, com C = 7.500, i = 0,08 e n = 5 anos.',
      { explanation: 'Desenvolva a conta na ordem indicada.', calculation: ['M = 7.500 × 1,08⁵', '≈ 7.500 × 1,47', '= R$ 11.025,00'] },
      'Armadilhas: juros simples dariam 7.500 × (1 + 5 × 0,08) = 7.500 × 1,40 = R$ 10.500,00; R$ 3.525,00 são apenas os juros; R$ 8.100,00 corresponde a só 1 ano de aplicação; R$ 18.525,00 soma o capital ao montante, contando-o duas vezes.',
    ],
    concept:
      'Montante em juros compostos: M = C × (1 + i)ⁿ. Quando a potência é difícil de calcular à mão, usa-se o valor aproximado fornecido.',
    estimatedSeconds: 45,
    source: AUTORAL,
    // Usa a aproximação 1,08⁵ ≈ 1,47 do enunciado (o valor exato daria R$ 11.019,96).
    verify: () => 7500 * 1.47,
    tolerance: 0.01,
  },
  {
    id: 'FIN-213',
    topic: 'financeira',
    subtopic: 'juros-compostos',
    difficulty: 1,
    skills: ['H3', 'H21'],
    stem: [
      {
        kind: 'p',
        text: 'Bruna é técnica em radiologia em Florianópolis e guarda a reserva de emergência em uma conta digital que rende 0,7% ao mês, no regime de juros compostos. Outro banco, que ela está avaliando, divulga a rentabilidade das suas aplicações ao ano. Para comparar as opções, Bruna quer saber a taxa anual equivalente à taxa mensal da conta digital.',
      },
      { kind: 'math', lines: ['Use: 1,007⁶ ≈ 1,0427 e 1,007¹² ≈ 1,0873'] },
    ],
    ask: 'A taxa anual equivalente a 0,7% ao mês, em juros compostos, é de, aproximadamente,',
    alternatives: alts('8,4%', '8,73%', '4,27%', '108,73%', '8,54%'),
    answer: 'B',
    hints: [
      'Taxas equivalentes produzem o mesmo crescimento no mesmo prazo. Um ano tem 12 meses, e, em juros compostos, os fatores mensais se multiplicam.',
      'Identifique, entre os valores dados no enunciado, o fator de crescimento correspondente a 12 meses.',
    ],
    solution: [
      'Em 12 meses, o saldo é multiplicado por 1,007¹² ≈ 1,0873.',
      { explanation: 'Taxa anual equivalente.', calculation: ['1,0873 − 1 = 0,0873', '= 8,73%'] },
      'Armadilhas: 12 × 0,7% = 8,4% ignora o juro sobre juro; 4,27% corresponde a apenas 6 meses; 2 × 4,27% = 8,54% soma as taxas dos dois semestres em vez de multiplicar os fatores; 108,73% esquece de subtrair 1 do fator.',
    ],
    concept:
      'Em juros compostos, a taxa anual equivalente a uma taxa mensal i é (1 + i)¹² − 1, sempre um pouco maior que 12 × i.',
    estimatedSeconds: 50,
    source: AUTORAL,
    verify: () => (1.0873 - 1) * 100,
    tolerance: 0.005,
  },
  {
    id: 'FIN-214',
    topic: 'financeira',
    subtopic: 'juros-compostos',
    difficulty: 3,
    skills: ['H21', 'H23', 'H25'],
    stem: [
      {
        kind: 'p',
        text: 'A comissão de formatura de uma turma do 3º ano do ensino médio de Goiânia arrecadou dinheiro com rifas e festas e vai aplicá-lo por exatamente 1 ano, sem depósitos nem retiradas. A comissão pesquisou quatro aplicações, todas no regime de juros compostos:',
      },
      {
        kind: 'table',
        header: ['Aplicação', 'Taxa de juros'],
        rows: [
          ['I', '1% ao mês'],
          ['II', '3% ao trimestre'],
          ['III', '6% ao semestre'],
          ['IV', '12,5% ao ano'],
        ],
        caption: 'Aplicações pesquisadas',
      },
      { kind: 'math', lines: ['Use: 1,01¹² ≈ 1,1268 e 1,03⁴ ≈ 1,1255'] },
    ],
    ask: 'A taxa anual equivalente da aplicação mais vantajosa para a comissão é de',
    alternatives: alts('12,5%', '12,55%', '12,68%', '12%', '12,36%'),
    answer: 'C',
    hints: [
      'Só dá para comparar taxas de períodos diferentes depois de convertê-las para o mesmo período; em juros compostos, isso se faz multiplicando fatores, e não multiplicando a taxa pelo número de períodos.',
      'Converta cada taxa para uma taxa anual, lembrando que um ano tem 12 meses, 4 trimestres ou 2 semestres.',
    ],
    solution: [
      { explanation: 'Aplicação I: acumule doze taxas mensais de 1% e retire o fator do capital.', calculation: ['1,01¹² ≈ 1,1268', '(1,1268 − 1) × 100 ≈ 12,68% ao ano'] },
      { explanation: 'Aplicação II: um ano tem quatro trimestres.', calculation: ['1,03⁴ ≈ 1,1255', '(1,1255 − 1) × 100 ≈ 12,55% ao ano'] },
      { explanation: 'Aplicação III: um ano tem dois semestres.', calculation: ['1,06² = 1,1236', '(1,1236 − 1) × 100 = 12,36% ao ano'] },
      'Aplicação IV: 12,5% ao ano.',
      'A mais vantajosa é a aplicação I, com taxa anual equivalente de cerca de 12,68%.',
      'Armadilha: converter as taxas proporcionalmente (12 × 1%, 4 × 3% e 2 × 6%) dá 12% ao ano para as três primeiras e leva a escolher a aplicação IV, de 12,5%. Em juros compostos, com a mesma taxa proporcional, quanto menor o período de capitalização, maior a taxa anual equivalente.',
    ],
    concept:
      'Para comparar taxas compostas de períodos diferentes, converta todas para o mesmo período usando taxas equivalentes: (1 + i)ᵏ − 1, em que k é o número de períodos da taxa contidos no período desejado.',
    estimatedSeconds: 180,
    source: AUTORAL,
    verify: () => Math.max(1.1268 - 1, 1.1255 - 1, Math.pow(1 + 0.06, 2) - 1, 0.125) * 100,
    tolerance: 0.005,
  },
  {
    id: 'FIN-215',
    topic: 'financeira',
    subtopic: 'juros-compostos',
    difficulty: 3,
    skills: ['H21', 'H24', 'H25'],
    stem: [
      {
        kind: 'p',
        text: 'Em uma oficina de educação financeira para jovens aprendizes em Belo Horizonte, a instrutora comparou o tempo necessário para que um capital dobre quando aplicado a 5% ao ano em dois regimes: juros simples e juros compostos. Não há depósitos nem retiradas.',
      },
      {
        kind: 'p',
        text: 'Em cada regime, o tempo de duplicação foi considerado como o menor número inteiro de anos ao final do qual o montante é maior ou igual ao dobro do capital aplicado.',
      },
      {
        kind: 'table',
        header: ['n', '1,05ⁿ (aproximado)'],
        rows: [
          ['13', '1,886'],
          ['14', '1,980'],
          ['15', '2,079'],
          ['16', '2,183'],
        ],
        caption: 'Potências aproximadas de 1,05',
      },
    ],
    ask: 'No regime de juros compostos, o capital dobra quantos anos antes do que no regime de juros simples?',
    alternatives: alts('4 anos', '15 anos', '20 anos', '5 anos', '6 anos'),
    answer: 'D',
    hints: [
      'Nos juros simples, os juros de cada ano são sempre 5% do capital; nos compostos, o montante é multiplicado por 1,05 a cada ano. Calcule o tempo de duplicação de cada regime separadamente.',
      'No regime simples, descubra quantos anos de juros de 5% são necessários para acumular juros iguais a 100% do capital.',
    ],
    solution: [
      { explanation: 'Em juros simples, dobrar o capital exige juros iguais a 100% dele.', calculation: ['t = 100% ÷ 5%', 't = 20 anos'] },
      { explanation: 'Em juros compostos, consulte a tabela para achar a primeira potência que alcança 2.', calculation: ['1,05¹⁴ ≈ 1,980 < 2', '1,05¹⁵ ≈ 2,079 ≥ 2', 't = 15 anos'] },
      'Diferença: 20 − 15 = 5 anos.',
      'Armadilhas: tomar 14 anos para os juros compostos (1,980 ainda não é o dobro) leva a 6 anos de diferença; tomar 16 anos conta um ano a mais e leva a 4 anos; 15 anos e 20 anos são os tempos de duplicação de cada regime, e não a diferença entre eles.',
    ],
    concept:
      'Tempo de duplicação: em juros simples, o capital dobra quando i × t = 100%; em juros compostos, quando (1 + i)ᵗ ≥ 2. Como os juros compostos rendem juros sobre juros, o capital dobra antes.',
    estimatedSeconds: 150,
    source: AUTORAL,
    verify: () => {
      const simples = Math.ceil(100 / 5);
      let compostos = 0;
      while (Math.pow(1 + 0.05, compostos) < 2) compostos += 1;
      return simples - compostos;
    },
  },
  {
    id: 'FIN-216',
    topic: 'financeira',
    subtopic: 'juros-compostos',
    difficulty: 3,
    skills: ['H3', 'H21', 'H25'],
    stem: [
      {
        kind: 'p',
        text: 'Há exatamente 3 anos, Eduarda, engenheira agrônoma em Sinop (MT), aplicou R$ 40.000,00 em um título prefixado que rende juros compostos a uma taxa anual fixa. Ela não fez depósitos nem retiradas, e o saldo hoje é de R$ 53.240,00.',
      },
      {
        kind: 'table',
        header: ['x', 'x³'],
        rows: [
          ['1,08', '1,259712'],
          ['1,09', '1,295029'],
          ['1,10', '1,331'],
          ['1,11', '1,367631'],
        ],
        caption: 'Cubos de alguns números',
      },
    ],
    ask: 'A taxa anual de juros dessa aplicação é de',
    alternatives: alts('11,03%', '33,1%', '1,1%', '8,29%', '10%'),
    answer: 'E',
    hints: [
      'Em juros compostos, o saldo final é o valor aplicado multiplicado por (1 + i)³. Descubra primeiro por quanto o dinheiro foi multiplicado nos 3 anos.',
      'Divida o saldo atual pelo valor aplicado e procure o resultado na coluna x³ da tabela.',
    ],
    solution: [
      { explanation: 'Fator de crescimento em 3 anos.', calculation: ['53.240 ÷ 40.000 = 1,331'] },
      'Em juros compostos, (1 + i)³ = 1,331. Pela tabela, 1,10³ = 1,331; logo, 1 + i = 1,10.',
      'Taxa anual: i = 0,10 = 10% ao ano.',
      'Armadilhas: dividir o rendimento total de 33,1% por 3 dá cerca de 11,03%, que seria a taxa em juros simples; 33,1% é a taxa dos 3 anos, e não a anual; 1,1% confunde o fator 1,10 com a taxa; calcular os juros sobre o saldo final (13.240 ÷ 53.240 ≈ 24,87%) e dividir por 3 dá cerca de 8,29%.',
    ],
    concept:
      'Para descobrir a taxa composta a partir do capital e do montante, calcula-se o fator M ÷ C e extrai-se a raiz de índice igual ao número de períodos: 1 + i = ⁿ√(M ÷ C).',
    estimatedSeconds: 150,
    source: AUTORAL,
    verify: () => (Math.cbrt(53240 / 40000) - 1) * 100,
    tolerance: 0.005,
  },
  {
    id: 'FIN-217',
    topic: 'financeira',
    subtopic: 'juros-compostos',
    difficulty: 3,
    skills: ['H3', 'H21'],
    stem: [
      {
        kind: 'p',
        text: 'A colônia de pescadores de uma cidade do litoral do Ceará criou um fundo de reserva para emergências com um único depósito, aplicado a juros compostos de 12% ao ano. Desde então, não houve novos depósitos nem retiradas. Ao final do 3º ano, o saldo do fundo era de R$ 35.123,20.',
      },
      { kind: 'math', lines: ['Use: 1,12³ = 1,404928'] },
    ],
    ask: 'Quanto o fundo rendeu de juros apenas durante o 2º ano?',
    alternatives: alts('R$ 3.000,00', 'R$ 3.360,00', 'R$ 3.374,40', 'R$ 6.360,00', 'R$ 3.763,20'),
    answer: 'B',
    hints: [
      'Os juros de cada ano são 12% do saldo do início daquele ano, e esse saldo muda de um ano para o outro. Comece descobrindo quanto foi depositado na criação do fundo.',
      'Para obter o depósito inicial, divida o saldo do fim do 3º ano por 1,12³.',
    ],
    solution: [
      { explanation: 'Depósito inicial.', calculation: ['35.123,20 ÷ 1,404928 = R$ 25.000,00'] },
      { explanation: 'Saldo ao final do 1º ano.', calculation: ['25.000 × 1,12 = R$ 28.000,00'] },
      'Juros do 2º ano: 12% de 28.000 = 0,12 × 28.000 = R$ 3.360,00 (o saldo passa a R$ 31.360,00).',
      'Armadilhas: R$ 3.000,00 são os juros do 1º ano e R$ 3.763,20, os do 3º ano; dividir os juros totais (R$ 10.123,20) por 3 dá R$ 3.374,40, como se os juros fossem iguais todo ano (juros simples); R$ 6.360,00 são os juros acumulados nos dois primeiros anos.',
    ],
    concept:
      'Em juros compostos, os juros de cada período são calculados sobre o saldo do início do período; por isso, crescem a cada período, formando uma progressão geométrica de razão (1 + i).',
    estimatedSeconds: 180,
    source: AUTORAL,
    verify: () => (35123.2 / Math.pow(1 + 0.12, 3)) * (1 + 0.12) * 0.12,
    tolerance: 0.005,
  },
  {
    id: 'FIN-218',
    topic: 'financeira',
    subtopic: 'juros-compostos',
    difficulty: 3,
    skills: ['H21', 'H24', 'H25'],
    stem: [
      {
        kind: 'p',
        text: 'A tesouraria de uma escola de samba do Rio de Janeiro aplicou, de uma só vez, uma reserva para a futura reforma do barracão. A aplicação rende juros compostos a uma taxa anual fixa, e não houve novos depósitos nem retiradas. O gráfico mostra os juros creditados ao final de cada um dos três primeiros anos.',
      },
      {
        kind: 'bars',
        title: 'Juros creditados em cada ano',
        unit: 'R$',
        data: [
          { label: '1º ano', value: 2500 },
          { label: '2º ano', value: 2600 },
          { label: '3º ano', value: 2704 },
        ],
      },
    ],
    ask: 'O valor aplicado inicialmente pela tesouraria foi de',
    alternatives: alts('R$ 62.500,00', 'R$ 65.000,00', 'R$ 7.804,00', 'R$ 70.304,00', 'R$ 67.600,00'),
    answer: 'A',
    hints: [
      'Em juros compostos, os juros de cada ano são calculados sobre um saldo que já inclui os juros anteriores; por isso, os juros de um ano para o outro crescem na mesma proporção que o saldo.',
      'Divida os juros do 2º ano pelos juros do 1º ano para descobrir o fator anual e, com ele, a taxa.',
    ],
    solution: [
      { explanation: 'Os juros de cada ano valem i vezes o saldo do início do ano, e o saldo cresce pelo fator (1 + i). Assim, 2.600 ÷ 2.500 = 1,04, e a taxa é de 4% ao ano (conferência.', calculation: ['2.704 ÷ 2.600 = 1,04)'] },
      'Os juros do 1º ano são 4% do valor aplicado: 0,04 × C = 2.500, logo C = 2.500 ÷ 0,04 = R$ 62.500,00.',
      'Conferência: 62.500 → 65.000 → 67.600 → 70.304, com juros de 2.500, 2.600 e 2.704.',
      'Armadilhas: R$ 65.000,00 e R$ 67.600,00 são os saldos no início do 2º e do 3º ano, obtidos ao dividir por 4% os juros desses anos; R$ 70.304,00 é o saldo ao final do 3º ano; R$ 7.804,00 é a soma dos juros dos três anos.',
    ],
    concept:
      'Em juros compostos, os juros de períodos consecutivos formam uma progressão geométrica de razão (1 + i), e os juros do 1º período valem C × i, o que permite descobrir o capital C.',
    estimatedSeconds: 180,
    source: AUTORAL,
    verify: () => {
      const taxa = 2600 / 2500 - 1;
      return 2500 / taxa;
    },
    tolerance: 0.005,
  },
  {
    id: 'FIN-219',
    topic: 'financeira',
    subtopic: 'juros-compostos',
    difficulty: 4,
    skills: ['H21', 'H23'],
    stem: [
      {
        kind: 'p',
        text: 'Rogério tem uma oficina mecânica em Manaus e mantém parte do capital de giro em uma aplicação que rende juros compostos a uma taxa anual fixa. Um valor que ele deixou aplicado por exatamente 2 anos, sem depósitos nem retiradas, rendeu 44% no total desse período.',
      },
      {
        kind: 'p',
        text: 'Agora, Rogério vai aplicar R$ 5.000,00 nessa mesma aplicação, nas mesmas condições, por exatamente 3 anos, também sem depósitos nem retiradas.',
      },
    ],
    ask: 'Ao final dos 3 anos, o montante dessa nova aplicação será de',
    alternatives: alts('R$ 8.300,00', 'R$ 9.079,24', 'R$ 8.640,00', 'R$ 8.784,00', 'R$ 3.640,00'),
    answer: 'C',
    hints: [
      'Em juros compostos, os fatores de cada ano se multiplicam: o fator dos 2 anos, 1,44, é o produto de dois fatores anuais iguais.',
      'Encontre o fator anual, isto é, o número que, multiplicado por ele mesmo, resulta em 1,44.',
    ],
    solution: [
      'Em 2 anos, o fator de crescimento é 1 + 0,44 = 1,44. Como a taxa anual é fixa, (1 + i)² = 1,44, logo 1 + i = √1,44 = 1,2: a taxa é de 20% ao ano.',
      'Em 3 anos, o fator é 1,2³ = 1,44 × 1,2 = 1,728.',
      { explanation: 'Montante.', calculation: ['5.000 × 1,728 = R$ 8.640,00'] },
      'Armadilhas: dividir 44% por 2 dá 22% ao ano; com juros compostos, isso leva a 5.000 × 1,22³ ≈ R$ 9.079,24, e com juros simples (66% em 3 anos), a R$ 8.300,00; aplicar 44% nos 2 primeiros anos e 22% no 3º dá 5.000 × 1,44 × 1,22 = R$ 8.784,00; R$ 3.640,00 são apenas os juros.',
    ],
    concept:
      'Taxa equivalente a partir de um período maior: se em k períodos o fator é F, a taxa por período é i = ᵏ√F − 1. Depois, o montante em n períodos é C × (1 + i)ⁿ.',
    estimatedSeconds: 210,
    source: AUTORAL,
    verify: () => 5000 * Math.pow(Math.sqrt(1 + 0.44), 3),
    tolerance: 0.005,
  },
  {
    id: 'FIN-220',
    topic: 'financeira',
    subtopic: 'juros-compostos',
    difficulty: 4,
    skills: ['H1', 'H3', 'H21'],
    stem: [
      {
        kind: 'p',
        text: 'Para estimar o tempo de duplicação de um capital aplicado a juros compostos, muitos educadores financeiros usam a chamada regra do 72:',
      },
      { kind: 'math', lines: ['tempo de duplicação (em anos) ≈ 72 ÷ (taxa anual, em porcentagem)'] },
      {
        kind: 'p',
        text: 'Daniel, professor de Educação Física em Teresina, vai aplicar suas economias em um fundo que rende 6% ao ano, no regime de juros compostos, sem fazer depósitos nem retiradas. Sua meta é que o saldo tenha um aumento de 300% em relação ao valor aplicado.',
      },
    ],
    ask: 'De acordo com a regra do 72, o tempo necessário para Daniel atingir essa meta é de, aproximadamente,',
    alternatives: alts('18 anos', '24 anos', '36 anos', '48 anos', '50 anos'),
    answer: 'B',
    hints: [
      'Um aumento de 300% significa que, ao saldo inicial (100%), somam-se mais 300%. Descubra por quanto o capital precisa ser multiplicado.',
      'Use a regra para calcular o tempo de uma duplicação a 6% ao ano e, depois, conte quantas duplicações levam ao fator desejado.',
    ],
    solution: [
      { explanation: 'Aumentar 300% significa manter o capital e acrescentar três vezes o seu valor.', calculation: ['100% + 300% = 400%', '400/100 = 4 vezes o capital'] },
      { explanation: 'Use a regra aproximada do 72 para o prazo de uma duplicação.', calculation: ['72 ÷ 6 = 12 anos'] },
      { explanation: 'Quadruplicar exige duas duplicações, não quatro.', calculation: ['4 = 2 × 2', '2 × 12 = 24 anos'] },
      'Conferência: 1,06²⁴ ≈ 4,05, ou seja, cerca de 4 vezes o capital.',
      'Armadilhas: supor que o saldo cresce 100% a cada 12 anos (crescimento linear) leva a 3 × 12 = 36 anos; contar 4 duplicações, em vez de multiplicar o capital por 4, leva a 48 anos; interpretar a meta como triplicar o capital e estimar esse tempo como 1,5 duplicação leva a 18 anos; usar juros simples (300% ÷ 6% ao ano) leva a 50 anos.',
    ],
    concept:
      'Se o tempo de duplicação é T, o capital é multiplicado por 2 a cada T períodos: após m duplicações, o fator é 2ᵐ. Um aumento de p% corresponde a multiplicar o capital por (1 + p/100).',
    estimatedSeconds: 150,
    source: AUTORAL,
    verify: () => (72 / 6) * Math.log2(1 + 300 / 100),
  },
  {
    id: 'FIN-221',
    topic: 'financeira',
    subtopic: 'juros-compostos',
    difficulty: 4,
    skills: ['H3', 'H21', 'H23'],
    stem: [
      {
        kind: 'p',
        text: 'Seu Raimundo e Dona Cida, vizinhos aposentados em Juiz de Fora, aplicaram, cada um, R$ 80.000,00 no mesmo investimento, que rende 0,9% ao mês, no regime de juros compostos, durante 12 meses.',
      },
      {
        kind: 'p',
        text: 'Ao final de cada mês, Seu Raimundo saca exatamente os juros creditados naquele mês, para complementar a aposentadoria; assim, o saldo dele permanece sempre em R$ 80.000,00. Dona Cida não faz nenhuma retirada.',
      },
      { kind: 'math', lines: ['Use: 1,009¹² ≈ 1,1135'] },
    ],
    ask: 'Ao final dos 12 meses, quanto os juros acumulados por Dona Cida superam o total de juros sacados por Seu Raimundo?',
    alternatives: alts('R$ 720,00', 'R$ 8.640,00', 'R$ 80.440,00', 'R$ 440,00', 'R$ 9.080,00'),
    answer: 'D',
    hints: [
      'Como Seu Raimundo retira os juros todo mês, o saldo dele nunca cresce e os juros que ele recebe são sempre os mesmos; já os juros de Dona Cida passam a render novos juros.',
      'Calcule quanto Seu Raimundo saca por mês (0,9% de R$ 80.000,00) e o total sacado em 12 meses.',
    ],
    solution: [
      'Seu Raimundo: juros mensais de 0,009 × 80.000 = R$ 720,00; em 12 meses, ele saca 12 × 720 = R$ 8.640,00.',
      'Dona Cida: saldo final de 80.000 × 1,009¹² ≈ 80.000 × 1,1135 = R$ 89.080,00; juros acumulados de 89.080 − 80.000 = R$ 9.080,00.',
      { explanation: 'Diferença.', calculation: ['9.080 − 8.640 = R$ 440,00'] },
      'Armadilhas: R$ 8.640,00 e R$ 9.080,00 são os juros de cada um, e não a diferença; R$ 720,00 são os juros de um só mês; comparar o saldo final de Dona Cida, sem subtrair o capital, com os juros de Seu Raimundo dá 89.080 − 8.640 = R$ 80.440,00.',
      'Observe que sacar os juros todo mês faz o dinheiro de Seu Raimundo render como em juros simples; os R$ 440,00 são o "juro sobre juro" que só Dona Cida recebeu.',
    ],
    concept:
      'Quando os juros são retirados a cada período, o capital não cresce e o rendimento total é igual ao de juros simples, C × i × n. Quando os juros são reinvestidos, o montante segue os juros compostos, C × (1 + i)ⁿ, e a diferença é o juro sobre juro.',
    estimatedSeconds: 210,
    source: AUTORAL,
    // Usa a aproximação 1,009¹² ≈ 1,1135 do enunciado (o valor exato daria cerca de R$ 440,77).
    verify: () => 80000 * (1.1135 - 1) - 12 * 80000 * 0.009,
    tolerance: 0.005,
  },
  {
    id: 'FIN-222',
    topic: 'financeira',
    subtopic: 'juros-compostos',
    difficulty: 4,
    skills: ['H21', 'H23'],
    stem: [
      {
        kind: 'p',
        text: 'Patrícia é dentista em Londrina e quer comprar, daqui a exatamente 2 anos, um aparelho de raio X odontológico que, segundo o fornecedor, custará R$ 28.090,00 nessa data.',
      },
      {
        kind: 'p',
        text: 'Hoje, ela vai depositar R$ 12.000,00 em uma aplicação que rende 6% ao ano, no regime de juros compostos. Daqui a exatamente 1 ano, fará um segundo depósito na mesma aplicação. Ela não fará retiradas antes da compra.',
      },
    ],
    ask: 'Para que o saldo, daqui a exatamente 2 anos, seja igual ao preço do aparelho, o valor do segundo depósito deve ser de',
    alternatives: alts('R$ 13.000,00', 'R$ 14.500,00', 'R$ 16.090,00', 'R$ 14.606,80', 'R$ 13.780,00'),
    answer: 'E',
    hints: [
      'Os dois depósitos ficam aplicados por tempos diferentes: o primeiro rende juros por 2 anos, e o segundo, apenas por 1 ano.',
      'Calcule primeiro quanto o depósito de hoje valerá daqui a 2 anos: 12.000 × 1,06².',
    ],
    solution: [
      { explanation: 'Primeiro depósito, daqui a 2 anos.', calculation: ['12.000 × 1,06² = 12.000 × 1,1236', '= R$ 13.483,20'] },
      'O segundo depósito precisa chegar, ao final, a 28.090 − 13.483,20 = R$ 14.606,80.',
      'Como ele rende só 1 ano: D × 1,06 = 14.606,80, logo D = 14.606,80 ÷ 1,06 = R$ 13.780,00.',
      { explanation: 'Conferência.', calculation: ['13.483,20 + 13.780 × 1,06 = 13.483,20 + 14.606,80', '= R$ 28.090,00'] },
      'Armadilhas: R$ 14.606,80 esquece que o segundo depósito também rende juros por 1 ano; R$ 16.090,00 (28.090 − 12.000) ignora todos os juros; levar o preço para hoje (28.090 ÷ 1,1236 = 25.000) e subtrair 12.000 dá R$ 13.000,00, que seria o valor de um segundo depósito feito hoje, e não daqui a 1 ano; levar o preço para daqui a 1 ano (28.090 ÷ 1,06 = 26.500) e subtrair os R$ 12.000,00 sem os juros do 1º ano dá R$ 14.500,00.',
    ],
    concept:
      'Para somar ou comparar quantias em datas diferentes, leve todas para a mesma data: em juros compostos, multiplica-se por (1 + i)ⁿ para avançar n períodos e divide-se por (1 + i)ⁿ para recuar n períodos.',
    estimatedSeconds: 240,
    source: AUTORAL,
    verify: () => (28090 - 12000 * Math.pow(1 + 0.06, 2)) / (1 + 0.06),
    tolerance: 0.005,
  },
]);
