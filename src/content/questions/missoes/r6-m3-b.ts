import { AUTORAL, alts, batch } from '../_helpers';

/** Mediana, na lista já ordenada (n par: média dos dois centrais). */
const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

/** Maior valor possível do maior de sete inteiros positivos com soma 42, mediana 5 e moda única igual a 4 (busca exaustiva). */
function maiorPossivel() {
  let best = -1;
  for (let a1 = 1; a1 <= 5; a1++)
    for (let a2 = a1; a2 <= 5; a2++)
      for (let a3 = a2; a3 <= 5; a3++)
        for (let a5 = 5; a5 <= 12; a5++)
          for (let a6 = a5; a6 <= 20; a6++) {
            const a7 = 42 - (a1 + a2 + a3 + 5 + a5 + a6);
            if (a7 < a6) continue;
            const xs = [a1, a2, a3, 5, a5, a6, a7];
            const count = new Map<number, number>();
            for (const x of xs) count.set(x, (count.get(x) ?? 0) + 1);
            const top = Math.max(...count.values());
            const modes = [...count.entries()].filter(([, c]) => c === top).map(([v]) => v);
            if (modes.length === 1 && modes[0] === 4) best = Math.max(best, a7);
          }
  return best;
}

/** Missão r6-m3 "O Relógio das Médias" — questões extras para repetição (lote b, EST-125 a EST-136, mediana e moda). Questões autorais. */
export const MISSAO_R6M3_B = batch([
  {
    id: 'EST-125',
    topic: 'estatistica',
    subtopic: 'mediana-moda',
    difficulty: 1,
    skills: ['H28'],
    stem: [{ kind: 'p', text: 'Uma professora perguntou a 11 alunos quantos irmãos cada um tem. As respostas foram: 1, 2, 0, 2, 3, 2, 1, 4, 2, 0 e 1.' }],
    ask: 'Qual é a moda do número de irmãos?',
    alternatives: alts('2', '1', '0', '4', '3'),
    answer: 'A',
    hints: ['A moda é o valor que mais se repete.', 'Conte quantas vezes aparece cada resposta: 0, 1, 2, 3 e 4.'],
    solution: [
      'Contagem: 0 aparece 2 vezes; 1 aparece 3; 2 aparece 4; 3 aparece 1; 4 aparece 1. A moda é 2.',
      'Armadilhas: 1 é o segundo valor mais frequente (3 vezes); 0 é o menor valor; 4 é o maior valor; 3 aparece uma única vez.',
    ],
    concept: 'Moda é o valor de maior frequência em um conjunto de dados. Pode haver mais de uma moda, ou nenhuma, se todos os valores aparecem o mesmo número de vezes.',
    estimatedSeconds: 35,
    source: AUTORAL,
    verify: () => 2,
  },
  {
    id: 'EST-126',
    topic: 'estatistica',
    subtopic: 'mediana-moda',
    difficulty: 1,
    skills: ['H28'],
    stem: [{ kind: 'p', text: 'Cinco amigos ganharam, em um mês, as seguintes mesadas, em reais: 3, 4, 9, 5 e 14 (valores em dezenas de reais, nesta ordem).' }],
    ask: 'Qual é a mediana desses cinco valores?',
    alternatives: alts('7', '5', '9', '4', '14'),
    answer: 'B',
    hints: ['A mediana é o valor central depois de colocar os dados em ordem.', 'Ordene: 3, 4, 5, 9, 14. Pegue o do meio.'],
    solution: [
      'Em ordem crescente: 3, 4, 5, 9, 14. O valor central é 5.',
      'Armadilhas: 7 é a média (35 ÷ 5); 9 é o valor do meio da lista sem ordenar; 4 e 14 são valores ao lado do centro ou o maior valor.',
    ],
    concept: 'Para achar a mediana, ordene os dados. Com quantidade ímpar, é o valor do meio; a média pode ser bem diferente quando há valores extremos.',
    estimatedSeconds: 40,
    source: AUTORAL,
    verify: () => median([3, 4, 9, 5, 14]),
  },
  {
    id: 'EST-127',
    topic: 'estatistica',
    subtopic: 'mediana-moda',
    difficulty: 2,
    skills: ['H28'],
    stem: [{ kind: 'p', text: 'Em seis dias seguidos, uma cantina vendeu 12, 8, 15, 10, 20 e 9 sanduíches, nessa ordem.' }],
    ask: 'Qual é a mediana das vendas diárias?',
    alternatives: alts('10', '12', '11', '12,3', '12,5'),
    answer: 'C',
    hints: ['Ordene as vendas. Com quantidade par de dados, a mediana é a média dos dois valores centrais.', 'Em ordem: 8, 9, 10, 12, 15, 20.'],
    solution: [
      'Em ordem: 8, 9, 10, 12, 15, 20. Os centrais são 10 e 12: (10 + 12) ÷ 2 = 11.',
      'Armadilhas: 10 e 12 são cada um dos dois centrais, e não a média deles; 12,3 é a média aritmética (74 ÷ 6); 12,5 é a média dos dois valores do meio da lista sem ordenar (15 e 10).',
    ],
    concept: 'Com número par de dados, a mediana é a média dos dois valores centrais — depois de ordenar a lista.',
    estimatedSeconds: 50,
    source: AUTORAL,
    verify: () => median([12, 8, 15, 10, 20, 9]),
    tolerance: 0.0001,
  },
  {
    id: 'EST-128',
    topic: 'estatistica',
    subtopic: 'mediana-moda',
    difficulty: 2,
    skills: ['H24', 'H28'],
    stem: [
      { kind: 'p', text: 'Uma loja de calçados registrou as vendas de um dia por número do calçado.' },
      {
        kind: 'table',
        caption: 'Pares vendidos por numeração',
        header: ['Número', 'Pares vendidos'],
        rows: [
          ['36', '4'],
          ['37', '9'],
          ['38', '12'],
          ['39', '7'],
          ['40', '3'],
        ],
      },
    ],
    ask: 'Qual é a moda das numerações vendidas?',
    alternatives: alts('12', '37,9', '36', '38', '40'),
    answer: 'D',
    hints: ['A moda é a numeração mais vendida (a maior frequência).', 'Procure a maior quantidade na segunda coluna e leia a numeração dela.'],
    solution: [
      'A maior quantidade é 12 pares, da numeração 38. Moda: 38.',
      'Armadilhas: 12 é a frequência (quantos pares), não a numeração; 37,9 é a numeração média (1.326 ÷ 35); 36 e 40 são as numerações extremas.',
    ],
    concept: 'A moda é um valor da variável (aqui, a numeração), não a frequência dele. A frequência só ajuda a achar qual valor é o mais comum.',
    estimatedSeconds: 40,
    source: AUTORAL,
    verify: () => 38,
  },
  {
    id: 'EST-129',
    topic: 'estatistica',
    subtopic: 'mediana-moda',
    difficulty: 2,
    skills: ['H24', 'H28'],
    stem: [
      { kind: 'p', text: 'A tabela traz as notas de 20 alunos em uma prova.' },
      {
        kind: 'table',
        caption: 'Notas',
        header: ['Nota', 'Nº de alunos'],
        rows: [
          ['5', '2'],
          ['6', '4'],
          ['7', '5'],
          ['8', '6'],
          ['9', '3'],
        ],
      },
    ],
    ask: 'Qual é a mediana das notas?',
    alternatives: alts('8', '7,2', '7,5', '10', '7'),
    answer: 'E',
    hints: ['Com 20 alunos, a mediana é a média do 10º e do 11º valores (em ordem).', 'Acumule as frequências: 2, 6, 11, 17, 20. Veja em que nota caem o 10º e o 11º.'],
    solution: [
      'Acumulando: notas 5 (2 alunos), 6 (até 6), 7 (até 11), 8 (até 17), 9 (até 20). O 10º e o 11º alunos têm nota 7.',
      'Mediana: (7 + 7) ÷ 2 = 7.',
      'Armadilhas: 8 é a moda (a maior frequência); 7,2 é a média (144 ÷ 20); 7,5 é a média entre 7 e 8; 10 é a posição do aluno central, não a nota.',
    ],
    concept: 'Em tabelas de frequências, a mediana se acha pela frequência acumulada: localize a posição central e veja a qual valor ela pertence.',
    estimatedSeconds: 70,
    source: AUTORAL,
    verify: () => median([...Array(2).fill(5), ...Array(4).fill(6), ...Array(5).fill(7), ...Array(6).fill(8), ...Array(3).fill(9)]),
    tolerance: 0.0001,
  },
  {
    id: 'EST-130',
    topic: 'estatistica',
    subtopic: 'mediana-moda',
    difficulty: 2,
    skills: ['H28', 'H29'],
    stem: [{ kind: 'p', text: 'Os preços de cinco apartamentos anunciados em uma rua, em milhares de reais, são: 200, 220, 250, 260 e 1.200 (uma cobertura).' }],
    ask: 'Qual é a mediana desses preços, em milhares de reais?',
    alternatives: alts('250', '426', '220', '260', '1.200'),
    answer: 'A',
    hints: ['Os valores já estão em ordem crescente.', 'Com cinco valores, a mediana é o terceiro.'],
    solution: [
      'Em ordem: 200, 220, 250, 260, 1.200. O terceiro valor é 250.',
      'Armadilhas: 426 é a média (2.130 ÷ 5), puxada para cima pela cobertura; 220 e 260 são os vizinhos do centro; 1.200 é o maior valor.',
    ],
    concept: 'A mediana resiste a valores extremos, e por isso representa melhor o preço típico quando há um valor muito fora do padrão.',
    estimatedSeconds: 45,
    source: AUTORAL,
    verify: () => median([200, 220, 250, 260, 1200]),
  },
  {
    id: 'EST-131',
    topic: 'estatistica',
    subtopic: 'mediana-moda',
    difficulty: 3,
    skills: ['H28'],
    stem: [{ kind: 'p', text: 'As idades de cinco pessoas em uma sala são 20, 22, 25, 30 e 33 anos. Uma sexta pessoa, de 40 anos, entra na sala.' }],
    ask: 'Qual é a mediana das idades depois que a sexta pessoa entra?',
    alternatives: alts('25', '27,5', '30', '28,3', '40'),
    answer: 'B',
    hints: ['Agora são seis valores: a mediana é a média dos dois centrais.', 'Em ordem: 20, 22, 25, 30, 33, 40.'],
    solution: [
      'Ordenando: 20, 22, 25, 30, 33, 40. Centrais: 25 e 30. Mediana: (25 + 30) ÷ 2 = 27,5.',
      'Armadilhas: 25 era a mediana antes de entrar a sexta pessoa; 30 é só um dos dois centrais; 28,3 é a média das seis idades; 40 é a idade de quem entrou.',
    ],
    concept: 'Acrescentar um valor muda a posição central: com a quantidade passando de ímpar para par, a mediana vira a média de dois valores.',
    estimatedSeconds: 60,
    source: AUTORAL,
    verify: () => median([20, 22, 25, 30, 33, 40]),
    tolerance: 0.0001,
  },
  {
    id: 'EST-132',
    topic: 'estatistica',
    subtopic: 'mediana-moda',
    difficulty: 3,
    skills: ['H24', 'H28'],
    stem: [
      { kind: 'p', text: 'O gráfico mostra quantos jogos de um torneio, ao todo 24, terminaram com cada número de gols de um time.' },
      {
        kind: 'bars',
        title: 'Jogos por número de gols',
        data: [
          { label: '0 gol', value: 5 },
          { label: '1 gol', value: 7 },
          { label: '2 gols', value: 4 },
          { label: '3 gols', value: 6 },
          { label: '4 gols', value: 2 },
        ],
      },
    ],
    ask: 'Qual é a mediana do número de gols por jogo?',
    alternatives: alts('1', '2', '1,5', '1,7', '12'),
    answer: 'C',
    hints: ['Com 24 jogos, a mediana é a média do 12º e do 13º valores em ordem.', 'Acumule: 5 jogos com 0 gol, até 12 com 1 gol, até 16 com 2 gols…'],
    solution: [
      'Acumulando: 0 gol (jogos 1 a 5), 1 gol (6 a 12), 2 gols (13 a 16)… O 12º jogo teve 1 gol e o 13º teve 2 gols.',
      'Mediana: (1 + 2) ÷ 2 = 1,5.',
      'Armadilhas: 1 é a moda (a maior barra), não a mediana; 2 é apenas o valor do 13º jogo; 1,7 é a média (41 ÷ 24); 12 é a posição, não o número de gols.',
    ],
    concept: 'Em gráficos de frequência, a mediana está onde a frequência acumulada passa da metade do total; a moda é a barra mais alta.',
    estimatedSeconds: 80,
    source: AUTORAL,
    verify: () => median([...Array(5).fill(0), ...Array(7).fill(1), ...Array(4).fill(2), ...Array(6).fill(3), ...Array(2).fill(4)]),
    tolerance: 0.0001,
  },
  {
    id: 'EST-133',
    topic: 'estatistica',
    subtopic: 'mediana-moda',
    difficulty: 3,
    skills: ['H28'],
    stem: [{ kind: 'p', text: 'Cinco números, em ordem crescente, são 4, 7, x, 10 e 13, com x entre 7 e 10. A média aritmética desses cinco números é 8,4.' }],
    ask: 'Qual é a mediana desses números?',
    alternatives: alts('7', '8,4', '10', '8', '42'),
    answer: 'D',
    hints: ['Use a média para descobrir x: a soma dos cinco números é 5 × 8,4.', 'x = 42 − (4 + 7 + 10 + 13). Depois ache o valor central.'],
    solution: [
      'Soma = 5 × 8,4 = 42. Logo x = 42 − 34 = 8.',
      'Em ordem: 4, 7, 8, 10, 13 — a mediana é o terceiro valor, 8.',
      'Armadilhas: 7 e 10 são os vizinhos de x; 8,4 é a média, não a mediana; 42 é a soma dos cinco números.',
    ],
    concept: 'Média e mediana são medidas diferentes; informações sobre uma podem ajudar a descobrir valores que levam à outra.',
    estimatedSeconds: 70,
    source: AUTORAL,
    verify: () => median([4, 7, 5 * 8.4 - (4 + 7 + 10 + 13), 10, 13]),
    tolerance: 0.0001,
  },
  {
    id: 'EST-134',
    topic: 'estatistica',
    subtopic: 'mediana-moda',
    difficulty: 3,
    skills: ['H28', 'H29'],
    stem: [{ kind: 'p', text: 'Seis corredores terminaram uma prova de rua com os seguintes tempos, em minutos: 22, 25, 19, 31, 28 e 24.' }],
    ask: 'Quantos minutos o tempo do corredor mais lento ficou acima da mediana dos tempos?',
    alternatives: alts('7', '6', '12', '31', '6,5'),
    answer: 'E',
    hints: ['Primeiro ordene os tempos e ache a mediana (quantidade par de corredores).', 'Em ordem: 19, 22, 24, 25, 28, 31. Mediana = média de 24 e 25.'],
    solution: [
      'Mediana: (24 + 25) ÷ 2 = 24,5 min. Corredor mais lento: 31 min.',
      'Diferença: 31 − 24,5 = 6,5 minutos.',
      'Armadilhas: 7 usa só o central 24 (31 − 24); 6 usa só o central 25 (31 − 25); 12 é a amplitude (31 − 19); 31 é o tempo do mais lento.',
    ],
    concept: 'Combine as etapas: ordenar, achar a mediana (média dos dois centrais, se par) e só então comparar com outro valor.',
    estimatedSeconds: 80,
    source: AUTORAL,
    verify: () => 31 - median([22, 25, 19, 31, 28, 24]),
    tolerance: 0.0001,
  },
  {
    id: 'EST-135',
    topic: 'estatistica',
    subtopic: 'mediana-moda',
    difficulty: 3,
    skills: ['H24', 'H28'],
    stem: [
      { kind: 'p', text: 'A tabela mostra o tempo de entrega de 25 pedidos de uma loja, agrupado em classes. Em dados agrupados, a classe modal é a de maior frequência, e seu ponto médio costuma representar a moda.' },
      {
        kind: 'table',
        caption: 'Tempo de entrega',
        header: ['Classe (dias)', 'Nº de pedidos'],
        rows: [
          ['0 a 10', '4'],
          ['10 a 20', '11'],
          ['20 a 30', '7'],
          ['30 a 40', '3'],
        ],
      },
    ],
    ask: 'Qual é o ponto médio da classe modal, em dias?',
    alternatives: alts('15', '11', '25', '20', '10'),
    answer: 'A',
    hints: ['Primeiro ache a classe de maior frequência.', 'O ponto médio de uma classe é a média dos seus dois limites.'],
    solution: [
      'A maior frequência é 11, da classe de 10 a 20. Ponto médio: (10 + 20) ÷ 2 = 15 dias.',
      'Armadilhas: 11 é a frequência da classe modal; 25 é o ponto médio da segunda classe mais frequente (20 a 30); 20 e 10 são limites da classe, não o ponto médio.',
    ],
    concept: 'Para dados agrupados em classes, a moda é aproximada pelo ponto médio da classe modal.',
    estimatedSeconds: 55,
    source: AUTORAL,
    verify: () => (10 + 20) / 2,
  },
  {
    id: 'EST-136',
    topic: 'estatistica',
    subtopic: 'mediana-moda',
    difficulty: 4,
    skills: ['H28', 'H29'],
    stem: [
      {
        kind: 'p',
        text: 'Sete números inteiros positivos têm soma 42, mediana 5 e uma única moda, igual a 4 (ou seja, o 4 aparece mais vezes do que qualquer outro valor).',
      },
    ],
    ask: 'Qual é o maior valor que o maior desses sete números pode ter?',
    alternatives: alts('24', '15', '18', '16', '14'),
    answer: 'B',
    hints: [
      'Em ordem, o quarto número é 5. Para o maior ser o maior possível, os outros precisam ser o menor possível — mas respeitando que o 4 seja a única moda.',
      'O 4 precisa aparecer pelo menos duas vezes entre os três menores; e nenhum outro valor pode aparecer tantas vezes quanto o 4.',
    ],
    solution: [
      'Os três menores: 1, 4 e 4 (soma 9, com o 4 repetido). O quarto é 5. Para o 5 não empatar com o 4, o quinto e o sexto devem ser diferentes de 5 e entre si: 6 e 7 (soma 13).',
      'O maior é 42 − (9 + 5 + 13) = 15. Sequência: 1, 4, 4, 5, 6, 7, 15.',
      'Armadilhas: 24 vem de 1, 1, 1, 5, 5, 5, 24, que não tem o 4 em lugar nenhum (a moda não seria 4); 18 faz o 5 aparecer três vezes (o 5 seria a moda); 16 empata o 4 com o 6 (ambos duas vezes); 14 é válido, mas não é o maior possível (4, 4, 4, 5, 5, 6, 14).',
    ],
    concept: 'Problemas de existência combinam condições: aqui soma, mediana e moda. Teste os valores mínimos que respeitam as condições para deixar o maior número o maior possível.',
    estimatedSeconds: 150,
    source: AUTORAL,
    verify: maiorPossivel,
  },
]);
