import { AUTORAL, alts, batch } from '../_helpers';

/** Máximo divisor comum (apoio dos `verify`; não é exportado). */
function mdc(a: number, b: number): number {
  return b === 0 ? a : mdc(b, a % b);
}

/** Mínimo múltiplo comum (apoio dos `verify`; não é exportado). */
function mmc(a: number, b: number): number {
  return (a / mdc(a, b)) * b;
}

/** Missão r3-m2 "A Torre dos Múltiplos" — questões extras (lote a, BAS-201 a BAS-212). Questões autorais. */
export const MISSAO_R3M2_A = batch([
  {
    id: 'BAS-201',
    topic: 'basica',
    subtopic: 'mmc-mdc',
    difficulty: 1,
    skills: ['H2', 'H3'],
    stem: [
      {
        kind: 'p',
        text: 'No terminal rodoviário de Uberlândia (MG), duas linhas de ônibus urbano saem da mesma plataforma: a linha Centro sai a cada 12 minutos e a linha Industrial, a cada 20 minutos. Às 6 h, os ônibus das duas linhas saíram juntos.',
      },
    ],
    ask: 'Depois de quantos minutos, contados a partir das 6 h, os ônibus das duas linhas voltarão a sair juntos pela primeira vez?',
    alternatives: alts('240 min', '32 min', '60 min', '4 min', '120 min'),
    answer: 'C',
    hints: [
      'Os ônibus saem juntos de novo quando o tempo decorrido é, ao mesmo tempo, múltiplo de 12 e múltiplo de 20.',
      'Decomponha 12 e 20 em fatores primos e, para cada fator, escolha o maior expoente que aparece.',
    ],
    solution: [
      'Os ônibus saem juntos quando o tempo decorrido é múltiplo de 12 e de 20 ao mesmo tempo. A primeira vez depois das 6 h corresponde ao menor múltiplo comum positivo: MMC(12, 20).',
      { explanation: 'Fatore os períodos. No MMC, use o maior expoente de cada primo.', calculation: ['12 = 2² × 3', '20 = 2² × 5', 'MMC(12, 20) = 2² × 3 × 5', '= 4 × 3 × 5', '= 60 min'] },
      'Conferência: 60 ÷ 12 = 5 e 60 ÷ 20 = 3. Em 60 minutos, a linha Centro sai 5 vezes e a Industrial, 3 vezes, e as duas saídas finais coincidem (às 7 h).',
      'Armadilhas: 240 é o produto 12 × 20, um múltiplo comum, mas não o menor; 32 é a soma dos intervalos; 4 é o MDC(12, 20), que é o maior divisor comum, e não o menor múltiplo; 120 também é múltiplo de 12 e de 20, mas é o dobro do primeiro encontro (60).',
    ],
    concept:
      'O mínimo múltiplo comum (MMC) de dois números é o menor número positivo divisível por ambos. Em eventos que se repetem em intervalos regulares, ele indica quando voltam a coincidir.',
    estimatedSeconds: 45,
    source: AUTORAL,
    verify: () => mmc(12, 20),
  },
  {
    id: 'BAS-202',
    topic: 'basica',
    subtopic: 'mmc-mdc',
    difficulty: 2,
    skills: ['H3'],
    stem: [
      {
        kind: 'p',
        text: 'Depois de uma consulta, Dona Marta, de Fortaleza (CE), recebeu a seguinte prescrição: tomar o analgésico de 4 em 4 horas e o antibiótico de 6 em 6 horas. Hoje, às 6 h 30 min, ela tomou os dois medicamentos ao mesmo tempo.',
      },
    ],
    ask: 'Em que horário, ainda hoje, Dona Marta voltará a tomar os dois medicamentos ao mesmo tempo pela primeira vez?',
    alternatives: alts('18 h 30 min', '8 h 30 min', '16 h 30 min', '10 h 30 min', '12 h'),
    answer: 'A',
    hints: [
      'Os dois medicamentos coincidem quando o número de horas passadas desde as 6 h 30 min é múltiplo de 4 e de 6 ao mesmo tempo.',
      'Primeiro descubra o menor número de horas que é múltiplo de 4 e de 6; só depois pense no horário no relógio.',
    ],
    solution: [
      'Contadas a partir das 6 h 30 min, as doses do analgésico caem 4, 8, 12, 16... horas depois e as do antibiótico, 6, 12, 18... horas depois.',
      'O primeiro número que aparece nas duas listas é 12, ou seja, MMC(4, 6) = 12 (4 = 2² e 6 = 2 × 3, logo MMC = 2² × 3 = 12). Os dois medicamentos coincidem 12 horas depois.',
      { explanation: 'Horário.', calculation: ['6 h 30 min + 12 h = 18 h 30 min'] },
      'Armadilhas: 12 h é o valor do MMC, mas é uma duração, e não um horário (falta somar às 6 h 30 min); 8 h 30 min vem de usar o MDC (2 h) em vez do MMC; 16 h 30 min vem de somar os intervalos (4 + 6 = 10 h); 10 h 30 min é só a segunda dose do analgésico (6 h 30 min + 4 h), que não coincide com nenhuma dose do antibiótico.',
    ],
    concept:
      'Quando dois eventos periódicos começam juntos, voltam a coincidir após o MMC dos seus intervalos. Para obter o horário, soma-se esse tempo ao horário em que eles coincidiram pela última vez.',
    estimatedSeconds: 60,
    source: AUTORAL,
    verify: () => 6 + 30 / 60 + mmc(4, 6),
  },
  {
    id: 'BAS-203',
    topic: 'basica',
    subtopic: 'mmc-mdc',
    difficulty: 3,
    skills: ['H1', 'H3'],
    stem: [
      {
        kind: 'p',
        text: 'O Residencial Ipês, um condomínio de Campinas (SP), contrata três prestadores de serviço que fazem visitas periódicas, conforme a tabela.',
      },
      {
        kind: 'table',
        header: ['Prestador', 'Frequência da visita'],
        rows: [
          ['Técnico do elevador', 'a cada 15 dias'],
          ['Equipe de dedetização', 'a cada 18 dias'],
          ['Jardineiro', 'a cada 20 dias'],
        ],
      },
      {
        kind: 'p',
        text: 'Hoje, por coincidência, os três estiveram no condomínio no mesmo dia.',
      },
    ],
    ask: 'Daqui a quantos dias os três prestadores voltarão a visitar o condomínio no mesmo dia pela primeira vez?',
    alternatives: alts('270 dias', '60 dias', '360 dias', '90 dias', '180 dias'),
    answer: 'E',
    hints: [
      'Os três voltam a coincidir quando o número de dias é múltiplo de 15, de 18 e de 20 ao mesmo tempo. Procure o menor número positivo com essa propriedade.',
      'Decomponha 15, 18 e 20 em fatores primos e, para cada primo, escolha o maior expoente que aparece.',
    ],
    solution: [
      'Os três só coincidem quando o número de dias é múltiplo de 15, 18 e 20. O primeiro valor positivo é o MMC(15, 18, 20).',
      { explanation: 'Fatorando.', calculation: ['15 = 3 × 5', '18 = 2 × 3²', '20 = 2² × 5'] },
      'MMC = (maior expoente de 2) × (maior expoente de 3) × (maior expoente de 5) = 2² × 3² × 5 = 4 × 9 × 5 = 180.',
      'Conferência: 180 ÷ 15 = 12, 180 ÷ 18 = 10 e 180 ÷ 20 = 9, todas divisões exatas. Daqui a 180 dias.',
      'Armadilhas: 60 é o MMC(15, 20) e 90 é o MMC(15, 18), em que um dos prestadores foi esquecido (60 não é múltiplo de 18 e 90 não é múltiplo de 20); 270 = 15 × 18 não é múltiplo de 20; 360 = 18 × 20 é múltiplo comum dos três, mas é o dobro do menor (180).',
    ],
    concept:
      'O MMC de três ou mais números é obtido pela fatoração: multiplicam-se todos os fatores primos que aparecem, cada um com o maior expoente. Ele indica o primeiro momento em que todos os eventos coincidem.',
    estimatedSeconds: 90,
    source: AUTORAL,
    verify: () => mmc(mmc(15, 18), 20),
  },
  {
    id: 'BAS-204',
    topic: 'basica',
    subtopic: 'mmc-mdc',
    difficulty: 2,
    skills: ['H2', 'H3'],
    stem: [
      {
        kind: 'p',
        text: 'Em uma praia de Natal (RN), dois guarda-vidas trabalham em plantões regulares: Cláudio faz plantão de 6 em 6 dias e Denise, de 8 em 8 dias. Os dois estiveram de plantão juntos no dia 2 de março.',
      },
    ],
    ask: 'Em que dia de março os dois voltarão a estar de plantão juntos pela primeira vez?',
    alternatives: alts('dia 16 de março', 'dia 26 de março', 'dia 4 de março', 'dia 8 de março', 'dia 10 de março'),
    answer: 'B',
    hints: [
      'Contando a partir do dia 2, os plantões de cada guarda-vidas caem em dias que distam do dia 2 por múltiplos de 6 (Cláudio) ou de 8 (Denise).',
      'Encontre o menor número de dias, depois de 2 de março, que seja múltiplo de 6 e de 8 ao mesmo tempo; só depois transforme em data.',
    ],
    solution: [
      'Plantões de Cláudio: dias 2, 8, 14, 20, 26... Plantões de Denise: dias 2, 10, 18, 26...',
      { explanation: 'O intervalo entre encontros é o menor múltiplo comum dos dois períodos.', calculation: ['6 = 2 × 3', '8 = 2³', 'MMC(6, 8) = 2³ × 3', '= 8 × 3', '= 24 dias'] },
      { explanation: 'Some o intervalo à data inicial. O resultado ainda pertence a março, que tem 31 dias.', calculation: ['2 + 24 = 26 de março'] },
      'Armadilhas: o dia 4 vem de somar o MDC (2 dias) ao dia 2; o dia 16 vem de somar os intervalos (6 + 8 = 14 dias); os dias 8 e 10 são apenas o próximo plantão de Cláudio e o de Denise, respectivamente, e cada um deles não coincide com o do outro.',
    ],
    concept:
      'Eventos que se repetem a partir de uma mesma data voltam a coincidir após o MMC dos intervalos. Para saber a data, soma-se esse número de dias à data inicial.',
    estimatedSeconds: 60,
    source: AUTORAL,
    verify: () => 2 + mmc(6, 8),
  },
  {
    id: 'BAS-205',
    topic: 'basica',
    subtopic: 'mmc-mdc',
    difficulty: 1,
    skills: ['H3'],
    stem: [
      {
        kind: 'p',
        text: 'Na entrada do porto de Santos (SP), duas boias luminosas de sinalização piscam em intervalos regulares: uma pisca a cada 10 segundos e a outra, a cada 15 segundos. Em certo instante, as duas piscaram ao mesmo tempo.',
      },
    ],
    ask: 'Depois de quantos segundos as duas boias voltarão a piscar ao mesmo tempo pela primeira vez?',
    alternatives: alts('150 s', '25 s', '5 s', '30 s', '60 s'),
    answer: 'D',
    hints: [
      'As duas piscam juntas quando o tempo decorrido é múltiplo de 10 e de 15 ao mesmo tempo.',
      'Escreva os primeiros múltiplos de 15 (15, 30, 45...) e procure o primeiro que também seja múltiplo de 10.',
    ],
    solution: [
      'Múltiplos de 10: 10, 20, 30, 40... Múltiplos de 15: 15, 30, 45... O primeiro número comum às duas listas é 30.',
      { explanation: 'Fatore os períodos e reúna cada primo com seu maior expoente.', calculation: ['10 = 2 × 5', '15 = 3 × 5', 'MMC(10, 15) = 2 × 3 × 5', '= 30 s'] },
      'Conferência: em 30 segundos, a primeira boia pisca 3 vezes (30 ÷ 10) e a segunda, 2 vezes (30 ÷ 15), e as últimas piscadas coincidem.',
      'Armadilhas: 150 é o produto 10 × 15, que é um múltiplo comum, mas não o menor; 25 é a soma dos intervalos; 5 é o MDC(10, 15); 60 é múltiplo comum, mas é o dobro do primeiro encontro (30).',
    ],
    concept:
      'O MMC de dois números é o menor múltiplo positivo comum a eles. O produto dos números é um múltiplo comum, mas só é o menor quando os números não têm fator primo em comum.',
    estimatedSeconds: 40,
    source: AUTORAL,
    verify: () => mmc(10, 15),
  },
  {
    id: 'BAS-206',
    topic: 'basica',
    subtopic: 'mmc-mdc',
    difficulty: 3,
    skills: ['H2', 'H3'],
    stem: [
      {
        kind: 'p',
        text: 'Em uma fábrica de móveis de Bento Gonçalves (RS), duas sirenes marcam atividades do turno: uma toca a cada 15 minutos e a outra, a cada 9 minutos. No início do turno, às 8 h, as duas tocaram ao mesmo tempo. O turno dura exatamente 4 horas.',
      },
    ],
    ask: 'Contando o toque simultâneo das 8 h, quantas vezes as duas sirenes tocam ao mesmo tempo ao longo do turno?',
    alternatives: alts('16 vezes', '5 vezes', '80 vezes', '7 vezes', '6 vezes'),
    answer: 'E',
    hints: [
      'Primeiro descubra de quanto em quanto tempo as duas sirenes tocam juntas; depois veja quantos desses intervalos cabem nas 4 horas do turno.',
      'Converta as 4 horas para minutos e calcule o MMC(15, 9).',
    ],
    solution: [
      { explanation: 'As sirenes voltam a coincidir a cada MMC dos períodos.', calculation: ['15 = 3 × 5', '9 = 3²', 'MMC(15, 9) = 3² × 5 = 45 min'] },
      'O turno dura 4 h = 240 min. Os toques simultâneos ocorrem, em minutos após as 8 h, em 0, 45, 90, 135, 180 e 225. O próximo (270 min) já passa do fim do turno.',
      { explanation: 'Conte os intervalos completos e inclua o toque inicial das 8 h.', calculation: ['4 × 60 = 240 min', '240 = 5 × 45 + 15', '5 + 1 = 6 toques simultâneos'] },
      'Armadilhas: 5 esquece o toque simultâneo das 8 h; 7 arredonda 5,3 para 6 e ainda soma o toque inicial; 16 = 240 ÷ 15 conta apenas os toques da sirene de 15 minutos; 80 = 240 ÷ 3 vem de usar o MDC (3) no lugar do MMC.',
    ],
    concept:
      'Ao contar eventos periódicos em um intervalo de tempo, divide-se a duração pelo período e soma-se 1 se o evento também ocorre no instante inicial. Aqui o período entre toques simultâneos é o MMC dos intervalos.',
    estimatedSeconds: 100,
    source: AUTORAL,
    verify: () => Math.floor((4 * 60) / mmc(15, 9)) + 1,
  },
  {
    id: 'BAS-207',
    topic: 'basica',
    subtopic: 'mmc-mdc',
    difficulty: 2,
    skills: ['H1', 'H3'],
    stem: [
      {
        kind: 'p',
        text: 'No cais de Belém (PA), duas linhas de barcas partem para as ilhas vizinhas: a Linha Norte sai a cada 24 minutos e a Linha Sul, a cada 32 minutos. Hoje, às 6 h, as barcas das duas linhas partiram juntas.',
      },
    ],
    ask: 'Qual é o próximo horário em que as barcas das duas linhas voltarão a partir juntas?',
    alternatives: alts('6 h 8 min', '7 h 36 min', '1 h 36 min', '6 h 56 min', '6 h 48 min'),
    answer: 'B',
    hints: [
      'As barcas partem juntas quando o tempo decorrido desde as 6 h é múltiplo de 24 min e de 32 min ao mesmo tempo.',
      'Calcule o MMC(24, 32) em minutos e converta o resultado para horas e minutos antes de somar às 6 h.',
    ],
    solution: [
      'Fatorando: 24 = 2³ × 3 e 32 = 2⁵. O MMC usa o maior expoente de cada fator: 2⁵ × 3 = 96 minutos.',
      { explanation: 'Conversão.', calculation: ['96 min = 60 min + 36 min', '= 1 h 36 min'] },
      { explanation: 'Horário.', calculation: ['6 h + 1 h 36 min = 7 h 36 min'] },
      'Conferência: da Linha Norte saem barcas às 6 h 24, 6 h 48, 7 h 12 e 7 h 36; da Linha Sul, às 6 h 32, 7 h 04 e 7 h 36. O primeiro horário em comum é 7 h 36 min.',
      'Armadilhas: 1 h 36 min é a duração (96 min), e não o horário, pois esquece-se de somar às 6 h; 6 h 8 min vem de usar o MDC (8 min); 6 h 56 min vem de somar os intervalos (24 + 32 = 56 min); 6 h 48 min é uma saída da Linha Norte (2 × 24 min) que não coincide com nenhuma da Linha Sul.',
    ],
    concept:
      'O MMC dos intervalos dá o tempo entre encontros. Se ele passa de 60 minutos, convertem-se os minutos em horas e minutos antes de somar ao horário inicial.',
    estimatedSeconds: 75,
    source: AUTORAL,
    verify: () => 6 + mmc(24, 32) / 60,
  },
  {
    id: 'BAS-208',
    topic: 'basica',
    subtopic: 'mmc-mdc',
    difficulty: 4,
    skills: ['H2', 'H3'],
    stem: [
      {
        kind: 'p',
        text: 'Em uma estação de monitoramento ambiental no Pantanal (MS), três sensores registram automaticamente a umidade do ar. Cada sensor faz leituras em intervalos fixos, mas eles foram ligados em horários diferentes, como mostra a tabela.',
      },
      {
        kind: 'table',
        header: ['Sensor', 'Intervalo entre leituras', 'Primeira leitura'],
        rows: [
          ['A', '6 min', '8 h 00 min'],
          ['B', '8 min', '8 h 02 min'],
          ['C', '9 min', '8 h 03 min'],
        ],
      },
    ],
    ask: 'Contados a partir das 8 h 00 min, após quantos minutos os três sensores farão uma leitura no mesmo instante pela primeira vez?',
    alternatives: alts('66 min', '72 min', '18 min', '12 min', '74 min'),
    answer: 'A',
    hints: [
      'O MMC sozinho não resolve, porque os sensores não começam juntos: o que importa é o primeiro instante que aparece nas três sequências de leituras.',
      'Escreva os instantes de leitura em minutos após as 8 h 00 min (A: 0, 6, 12...; B: 2, 10, 18...; C: 3, 12, 21...) e procure o primeiro instante comum às três listas.',
    ],
    solution: [
      'Em minutos após as 8 h 00 min, as leituras ocorrem em: A, nos múltiplos de 6 (0, 6, 12, 18...); B, em 2, 10, 18, 26, 34... (2 mais múltiplos de 8); C, em 3, 12, 21, 30, 39... (3 mais múltiplos de 9).',
      'O MMC(6, 8, 9) = 72 só daria o instante correto se os sensores começassem juntos, o que não é o caso.',
      'Instantes de C que também são de A (múltiplos de 6): 12, 30, 48, 66... (de 18 em 18).',
      'Entre eles, procuramos o primeiro que B também lê. B lê em 2, 10, 18, 26, 34, 42, 50, 58, 66...: o 12, o 30 e o 48 não aparecem na lista de B, mas o 66 aparece.',
      { explanation: 'Confira o instante de 66 minutos descontando os atrasos de início de cada sensor. As divisões são exatas.', calculation: ['A: 66 ÷ 6 = 11', 'B: (66 − 2) ÷ 8 = 64 ÷ 8 = 8', 'C: (66 − 3) ÷ 9 = 63 ÷ 9 = 7', '8 h + 66 min = 9 h 06 min'] },
      'Armadilhas: 12 é o primeiro instante comum de A e C apenas, e 18 é o primeiro de A e B apenas; 72 é o MMC(6, 8, 9) sem considerar a defasagem do início, e nesse instante B e C não fazem leitura; 74 soma o atraso de B ao MMC, e nesse instante A não faz leitura.',
    ],
    concept:
      'Quando os eventos periódicos não começam juntos, o MMC dá apenas o espaçamento entre coincidências. O primeiro encontro deve ser achado listando as sequências ou resolvendo as condições de divisibilidade de cada uma.',
    estimatedSeconds: 200,
    source: AUTORAL,
    verify: () => {
      const inicio = [0, 2, 3];
      const intervalo = [6, 8, 9];
      for (let t = 0; t < 1000; t++) {
        if (inicio.every((s, i) => t >= s && (t - s) % intervalo[i] === 0)) return t;
      }
      return NaN;
    },
  },
  {
    id: 'BAS-209',
    topic: 'basica',
    subtopic: 'mmc-mdc',
    difficulty: 3,
    skills: ['H1', 'H3'],
    stem: [
      {
        kind: 'p',
        text: 'A cantina de uma escola de Manaus (AM) recebe mercadorias de dois fornecedores: o de frutas faz entregas a cada 36 horas e o de laticínios, a cada 4 dias. Hoje, às 8 h, as duas entregas chegaram juntas.',
      },
    ],
    ask: 'Depois de quantos dias, contados de hoje, as duas entregas voltarão a chegar juntas pela primeira vez?',
    alternatives: alts('36 dias', '288 dias', '6 dias', '12 dias', '144 dias'),
    answer: 'D',
    hints: [
      'Para comparar os dois intervalos, eles precisam estar na mesma unidade. Escolha horas ou dias antes de calcular o MMC.',
      'Converta 4 dias em horas, calcule o MMC dos dois intervalos nessa unidade e só no final converta o resultado para dias.',
    ],
    solution: [
      'Colocando tudo em horas: 4 dias = 4 × 24 = 96 horas. Os intervalos são 36 h e 96 h.',
      { explanation: 'Com ambos os intervalos em horas, calcule o MMC usando os maiores expoentes.', calculation: ['36 = 2² × 3²', '96 = 2⁵ × 3', 'MMC(36, 96) = 2⁵ × 3²', '= 32 × 9', '= 288 h'] },
      { explanation: 'Divida por 24 para transformar horas em dias.', calculation: ['288 ÷ 24 = 12 dias'] },
      'Conferência: 288 ÷ 36 = 8 entregas do fornecedor de frutas e 288 ÷ 96 = 3 entregas do de laticínios, ambas chegando às 8 h do 12º dia.',
      'Armadilhas: 36 e 144 vêm de misturar horas e dias (MMC(36, 4) = 36 e 36 × 4 = 144); 288 é o resultado em horas, sem converter para dias; 6 vem de multiplicar 1,5 dia por 4 dias, sem dividir pelo fator comum.',
    ],
    concept:
      'Antes de calcular o MMC, é preciso expressar todos os períodos na mesma unidade. O resultado sai nessa unidade e só então é convertido para a unidade pedida.',
    estimatedSeconds: 100,
    source: AUTORAL,
    verify: () => mmc(36, 4 * 24) / 24,
  },
  {
    id: 'BAS-210',
    topic: 'basica',
    subtopic: 'mmc-mdc',
    difficulty: 1,
    skills: ['H3'],
    stem: [
      {
        kind: 'p',
        text: 'Na feira livre de Caruaru (PE), Dona Lúcia vende frutas que vêm de dois sítios: as caixas do sítio Boa Vista chegam a cada 6 dias e as do sítio Água Branca, a cada 9 dias. Hoje, chegaram caixas dos dois sítios.',
      },
    ],
    ask: 'Daqui a quantos dias chegarão caixas dos dois sítios no mesmo dia pela primeira vez?',
    alternatives: alts('54 dias', '15 dias', '18 dias', '3 dias', '27 dias'),
    answer: 'C',
    hints: [
      'As caixas dos dois sítios chegam no mesmo dia quando o número de dias é múltiplo de 6 e de 9 ao mesmo tempo.',
      'Liste os múltiplos de 9 (9, 18, 27...) e confira qual é o primeiro que também é divisível por 6.',
    ],
    solution: [
      'Múltiplos de 6: 6, 12, 18, 24... Múltiplos de 9: 9, 18, 27... O primeiro comum às duas listas é 18.',
      { explanation: 'O primeiro encontro corresponde ao menor múltiplo comum positivo.', calculation: ['6 = 2 × 3', '9 = 3²', 'MMC(6, 9) = 2 × 3²', '= 18 dias'] },
      'Conferência: 18 ÷ 6 = 3 e 18 ÷ 9 = 2, ou seja, em 18 dias chegam 3 remessas do primeiro sítio e 2 do segundo.',
      'Armadilhas: 54 = 6 × 9 é múltiplo comum, mas não o menor (como 6 e 9 têm o fator 3 em comum, o produto é 3 vezes o MMC); 15 é a soma dos intervalos; 3 é o MDC(6, 9); 27 é múltiplo de 9, mas não de 6.',
    ],
    concept:
      'O produto de dois números é sempre um múltiplo comum deles, mas só é o menor quando eles não têm fatores primos em comum. Caso contrário, o MMC é o produto dividido pelo MDC.',
    estimatedSeconds: 40,
    source: AUTORAL,
    verify: () => mmc(6, 9),
  },
  {
    id: 'BAS-211',
    topic: 'basica',
    subtopic: 'mmc-mdc',
    difficulty: 3,
    skills: ['H2', 'H3'],
    stem: [
      {
        kind: 'p',
        text: 'Em uma horta comunitária de Cuiabá (MT), duas bombas de irrigação são programadas por temporizador. A bomba A liga de 15 em 15 horas. A bomba B liga de n em n horas, sendo n um número inteiro que não passa de 30.',
      },
      {
        kind: 'p',
        text: 'As duas bombas ligaram juntas às 6 h de uma segunda-feira e só voltaram a ligar juntas, pela primeira vez, 90 horas depois.',
      },
    ],
    ask: 'De quantas em quantas horas a bomba B liga?',
    alternatives: alts('6 h', '9 h', '30 h', '18 h', '10 h'),
    answer: 'D',
    hints: [
      'O instante em que as bombas voltam a ligar juntas corresponde ao MMC dos dois intervalos. Aqui você conhece o MMC (90) e um dos intervalos (15) e procura o outro.',
      'Decomponha 90 e 15 em fatores primos e veja quais fatores o intervalo de B precisa ter para que o MMC chegue a 90.',
    ],
    solution: [
      { explanation: 'Sabemos que MMC(15, n) = 90. Fatorando.', calculation: ['90 = 2 × 3² × 5', '15 = 3 × 5'] },
      'O MMC reúne o maior expoente de cada primo. O 15 só contribui com 3¹ e 5; logo o fator 2 e o fator 3² precisam vir de n. Assim, n é múltiplo de 2 × 3² = 18.',
      'Como n não passa de 30, o único valor possível é n = 18 (o múltiplo seguinte, 36, passa de 30).',
      'Conferência: 15 = 3 × 5 e 18 = 2 × 3², logo MMC(15, 18) = 2 × 3² × 5 = 90.',
      'Armadilhas: 6, 9, 10 e 30 são divisores de 90, mas isso não basta: MMC(15, 6) = 30, MMC(15, 9) = 45, MMC(15, 10) = 30 e MMC(15, 30) = 30. Nesses casos as bombas voltariam a ligar juntas antes das 90 horas.',
    ],
    concept:
      'No problema inverso do MMC, compara-se a fatoração do MMC conhecido com a do número dado: os fatores que faltam têm de vir do número desconhecido. Ser divisor do MMC não basta.',
    estimatedSeconds: 130,
    source: AUTORAL,
    verify: () => {
      for (let n = 1; n <= 30; n++) {
        if (mmc(15, n) === 90) return n;
      }
      return NaN;
    },
  },
  {
    id: 'BAS-212',
    topic: 'basica',
    subtopic: 'mmc-mdc',
    difficulty: 2,
    skills: ['H3'],
    stem: [
      {
        kind: 'p',
        text: 'Em uma trilha circular de caminhada de um parque de Florianópolis (SC), Rita e Bruno partem juntos do portão de entrada e caminham no mesmo sentido, cada um em ritmo constante. Rita completa uma volta em 24 minutos e Bruno, em 40 minutos.',
      },
    ],
    ask: 'Quando os dois se reencontrarem no portão de entrada pela primeira vez, quantas voltas Rita terá completado?',
    alternatives: alts('3 voltas', '5 voltas', '8 voltas', '15 voltas', '120 voltas'),
    answer: 'B',
    hints: [
      'Os dois estão no portão ao mesmo tempo quando o tempo decorrido é múltiplo da duração da volta de Rita e da volta de Bruno.',
      'Calcule o MMC(24, 40), em minutos, e depois divida esse tempo pela duração de uma volta de Rita.',
    ],
    solution: [
      { explanation: 'Calcule o primeiro intervalo em que os dois completam voltas inteiras.', calculation: ['24 = 2³ × 3', '40 = 2³ × 5', 'MMC(24, 40) = 2³ × 3 × 5', '= 120 min'] },
      { explanation: 'Divida o tempo comum pela duração da volta de cada pessoa. A pergunta pede as voltas de Rita.', calculation: ['Rita: 120 ÷ 24 = 5 voltas', 'Bruno: 120 ÷ 40 = 3 voltas'] },
      'Observação: Rita e Bruno também se cruzam na pista em outros instantes (por exemplo, aos 60 minutos), mas a pergunta se refere ao portão de entrada.',
      'Armadilhas: 3 é o número de voltas de Bruno, e não o de Rita; 8 vem de somar as voltas (5 + 3) ou do MDC(24, 40) = 8; 15 multiplica as voltas (5 × 3); 120 é o tempo em minutos, e não o número de voltas.',
    ],
    concept:
      'O MMC dos tempos de volta dá o instante em que as pessoas voltam juntas ao ponto de partida. Dividindo esse tempo pelo tempo de uma volta, obtém-se quantas voltas cada um completou.',
    estimatedSeconds: 70,
    source: AUTORAL,
    verify: () => mmc(24, 40) / 24,
  },
]);
