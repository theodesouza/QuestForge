/** Notas das alternativas erradas — Equações, funções, geometria, medidas, gráficos, estatística, probabilidade e combinatória. */
import type { DistractorNotes } from '../distractors';

export const NOTES_OUTROS: DistractorNotes = {
  // ——— Equações e sistemas
  'EQU-001': {
    B: 'Com 30 minutos, o plano A custa 30 + 15 = R$ 45,00 e o B, 40 + 7,50 = R$ 47,50: ainda não empatam.',
    C: 'Com 50 minutos, o plano A custa 30 + 25 = R$ 55,00 e o B, 40 + 12,50 = R$ 52,50: o empate já passou.',
    D: 'Com 80 minutos, o plano A custa 30 + 40 = R$ 70,00 e o B, 40 + 20 = R$ 60,00: não empatam.',
    E: '20 divide a diferença das partes fixas (R$ 10,00) pelo preço por minuto do plano A. Ela é compensada pela diferença dos preços: 10 ÷ (0,50 − 0,25) = 40.',
  },
  'EQU-002': {
    A: 'Com 120 meias, seriam 180 inteiras: 180 × 20 + 120 × 10 = R$ 4.800,00, mais que os R$ 4.600,00 arrecadados.',
    C: '160 é o número de inteiras. As meias são 300 − 160 = 140.',
    D: 'Com 180 meias e 120 inteiras, a arrecadação seria 2.400 + 1.800 = R$ 4.200,00, e não R$ 4.600,00.',
    E: '150 divide os ingressos igualmente, sem usar a arrecadação.',
  },
  'EQU-003': {
    B: '25 divide os veículos igualmente, sem usar o total de rodas.',
    C: 'Com 15 motos e 35 carros, seriam 140 + 30 = 170 rodas, e não 160.',
    D: '30 é o número de carros. Com 50 veículos e 160 rodas: (160 − 100) ÷ 2 = 30 carros, e 20 motos.',
    E: 'Com 35 motos e 15 carros, seriam 60 + 70 = 130 rodas, e não 160.',
  },

  // ——— Funções
  'FUN-001': {
    B: 'R$ 37,50 corresponde a 13 km (5 + 2,50 × 13): soma um quilômetro a mais. Para 12 km: 5 + 30 = R$ 35,00.',
    C: 'R$ 30,00 é só a parte variável (2,50 × 12). Falta a bandeirada de R$ 5,00, paga em toda corrida.',
    D: 'Com R$ 42,50, a corrida teria 15 km (5 + 2,50 × 15). Para 12 km: 5 + 2,50 × 12 = R$ 35,00.',
    E: 'R$ 60,00 multiplica os R$ 5,00 por 12, como se a bandeirada fosse cobrada a cada quilômetro. Ela é paga uma vez só.',
  },
  'FUN-002': {
    B: 'Com 14 km, a corrida custaria 5 + 2,50 × 14 = R$ 40,00, e não R$ 45,00.',
    C: '18 divide os R$ 45,00 por 2,50 sem tirar a bandeirada. Primeiro tire os R$ 5,00 fixos: (45 − 5) ÷ 2,50 = 16.',
    D: 'Com 12 km, a corrida custaria 5 + 2,50 × 12 = R$ 35,00, e não R$ 45,00.',
    E: '20 soma a bandeirada ao valor pago: (45 + 5) ÷ 2,50. Os R$ 5,00 já estão dentro dos R$ 45,00 e precisam sair.',
  },
  'FUN-003': {
    A: '20 é a quantidade, em centenas, que dá o lucro máximo: o x do vértice. O lucro é L(20) = −400 + 800 − 300 = 100.',
    C: '300 é o termo independente, ligado aos custos fixos (L(0) = −300). O máximo está no vértice: L(20) = 100.',
    D: '400 calcula −20² + 40 × 20 e esquece o termo −300. Com ele, L(20) = 400 − 300 = 100.',
    E: '500 esquece o termo −x²: 40 × 20 − 300. Com ele, L(20) = −400 + 800 − 300 = 100.',
  },
  'FUN-004': {
    B: 'Em t = 5 s, h = −125 + 100 = −25: a bola já estaria abaixo do chão. Ela volta quando t(20 − 5t) = 0, em t = 4 s.',
    C: 'Em t = 10 s, h = −500 + 200 = −300: muito depois da queda. De t(20 − 5t) = 0 vem t = 20 ÷ 5 = 4 s.',
    D: '2 s é o instante da altura máxima (o vértice, −20 ÷ (−10)). A bola volta ao chão no dobro desse tempo: 4 s.',
    E: '20 esquece o 5: de t(20 − 5t) = 0 vem 5t = 20, e então t = 4 s.',
  },
  'FUN-005': {
    A: '2.000 multiplica 500 por 4, o número de dobras. Dobrar 4 vezes é multiplicar por 2⁴ = 16: 500 × 16 = 8.000.',
    C: '4.000 multiplica 500 por 8 (2 × 4, ou só 3 dobras). Em 12 horas cabem 4 dobras: 500 × 2⁴ = 8.000.',
    D: '6.000 multiplica 500 por 12, o número de horas. A população dobra a cada 3 horas: são 4 dobras, × 16.',
    E: '16.000 corresponde a 5 dobras (500 × 32). Em 12 horas cabem só 12 ÷ 3 = 4 períodos de 3 horas.',
  },
  'FUN-006': {
    A: 'Em 12 h são só 2 meias-vidas: 800 → 400 → 200 mg, ainda acima dos 50 mg.',
    C: 'Em 30 h são 5 meias-vidas: restariam 25 mg. Os 50 mg já tinham sido atingidos em 24 h.',
    D: '48 h divide 16 por 2 e conta 8 meias-vidas. A razão 800 ÷ 50 = 16 = 2⁴ dá 4 meias-vidas: 4 × 6 = 24 h.',
    E: 'Em 18 h são 3 meias-vidas: 800 → 400 → 200 → 100 mg, ainda o dobro dos 50 mg.',
  },

  // ——— Gráficos e tabelas
  'GRF-001': {
    A: '270 soma só janeiro e fevereiro (120 + 150). O trimestre tem três meses: falta março, com 90.',
    B: '300 soma fevereiro, março e abril (150 + 90 + 60). O 1º trimestre é janeiro, fevereiro e março.',
    C: '420 inclui abril (60). O 1º trimestre tem só janeiro, fevereiro e março: 120 + 150 + 90.',
    E: '450 é o total dos cinco meses do gráfico. O 1º trimestre tem só os três primeiros.',
  },
  'GRF-002': {
    A: 'Com média 18, o semestre teria 6 × 18 = 108 m³; as barras somam 120 m³, e 120 ÷ 6 = 20.',
    B: 'Com média 19, o semestre teria 6 × 19 = 114 m³; as barras somam 120 m³, e 120 ÷ 6 = 20.',
    C: 'Com média 21, o semestre teria 6 × 21 = 126 m³; as barras somam 120 m³, e 120 ÷ 6 = 20.',
    E: 'Com média 22, o semestre teria 6 × 22 = 132 m³; as barras somam 120 m³, e 120 ÷ 6 = 20.',
  },
  'GRF-004': {
    A: '70 avança só um intervalo de 5 anos (64 + 6, que seria 2025). De 2020 a 2030 são dois: 64 + 12 = 76.',
    B: '72 supõe 8 mil a mais em 10 anos, mas o gráfico mostra 6 mil a cada 5 anos: 12 mil em 10 anos.',
    C: '80 supõe 16 mil a mais de 2020 a 2030, mas o ritmo é de 6 mil a cada 5 anos: 12 mil em 10 anos.',
    D: '88 soma quatro intervalos de 6 mil, o que levaria até 2040. De 2020 a 2030 são só dois.',
  },
  'GRF-003': {
    A: '16 cobra só 2 horas adicionais (8 + 2 × 4) e ignora os 20 minutos que sobram. A fração também é cobrada como hora inteira: são 3 horas adicionais.',
    B: 'R$ 18,00 corresponderia a 2,5 horas adicionais (8 + 4 × 2,5), o que a tabela não prevê. Depois da 1ª hora restam 2 h 20 min, cobradas como 3 horas: 8 + 12 = 20.',
    C: '21,33 cobra as 3 h 20 min inteiras como horas adicionais, de forma proporcional (8 + 4 × 3,33). A 1ª hora já está nos R$ 8,00, e a fração conta como hora inteira.',
    D: '24 cobra 4 horas adicionais. Depois da 1ª hora restam 2 h 20 min: 2 horas inteiras e uma fração, ou seja, 3 horas adicionais.',
  },
  'GRF-005': {
    A: '20 GB é só o excedente (40 ÷ 2), esquecendo os 10 GB da franquia. O consumo do empate é 10 + 20 = 30 GB.',
    B: 'Com 25 GB, o plano B custa 40 + 15 × 2 = R$ 70,00, ainda menos que os R$ 80,00 do plano A.',
    C: 'Com 35 GB, o plano B custa 40 + 25 × 2 = R$ 90,00, mais que os R$ 80,00 do plano A.',
    D: '40 divide a mensalidade de A pelo preço do GB extra (80 ÷ 2), sem descontar os R$ 40,00 do plano B.',
  },

  // ——— Estatística
  'EST-001': {
    B: '7,5 é a média só das quatro menores notas (6 + 7 + 8 + 9 = 30; 30 ÷ 4). A média usa as cinco: 40 ÷ 5 = 8.',
    C: '8,5 é a média só das quatro maiores notas (7 + 8 + 9 + 10 = 34; 34 ÷ 4). A média usa as cinco: 40 ÷ 5 = 8.',
    D: 'Com média 9, as cinco notas somariam 45; elas somam 6 + 7 + 8 + 9 + 10 = 40, e 40 ÷ 5 = 8.',
    E: 'Com média 7, as cinco notas somariam 35; elas somam 40, e 40 ÷ 5 = 8.',
  },
  'EST-003': {
    B: 'Com 7,5 na terceira, a média seria (12 + 24 + 37,5) ÷ 10 = 7,35: as notas anteriores puxam a média para baixo.',
    C: 'Com 8,0, a média seria (12 + 24 + 40) ÷ 10 = 7,6: passa da meta, mas não é a nota mínima. A mínima é 7,8.',
    D: '8,5 usa a média simples (3 × 7,5 − 6 − 8). Com pesos, a terceira nota (peso 5) pesa mais: basta 7,8.',
    E: 'Com 7,0 na terceira, a média seria (12 + 24 + 35) ÷ 10 = 7,1, abaixo de 7,5.',
  },
  'EST-004': {
    B: 'Tirar uma nota abaixo da média faz a média subir: ela não fica em 6,50. Sobram 130 − 2 = 128 pontos em 19 provas.',
    C: '6,84 divide o total original (130) por 19, sem tirar a nota 2,0. A nota sai do total e da contagem: 128 ÷ 19 ≈ 6,74.',
    D: '6,40 tira a nota do total, mas continua dividindo por 20. Agora são 19 provas: 128 ÷ 19 ≈ 6,74.',
    E: 'Com média 7,00 em 19 provas, o total seria 133 pontos, mas sobram 128 (130 − 2). A nova média é 128 ÷ 19 ≈ 6,74.',
  },
  'EST-006': {
    B: '32 compensa a diferença uma vez só (31 + 1). Pelos totais: 12 × 31 − 10 × 30 = 72 anos para os dois, média 36.',
    C: '31 é a nova média do grupo todo. Para puxar a média de 30 para 31, quem entrou precisa estar acima dela.',
    D: 'Com média 35, os dois somariam 70 anos, e o grupo, 370: média de 30,83 anos, e não 31.',
    E: '72 é a soma das idades dos dois que entraram (372 − 300). A média deles é 72 ÷ 2 = 36.',
  },
  'EST-002': {
    A: '1 é a moda (aparece três vezes). A mediana é a média dos dois valores centrais da lista ordenada (0, 1, 1, 1, 2, 3, 4, 5): (1 + 2) ÷ 2 = 1,5.',
    C: '2 é só um dos dois valores centrais. Com 8 rodadas, a mediana é a média do 4º e do 5º valores em ordem: (1 + 2) ÷ 2 = 1,5.',
    D: '2,125 é a média (17 gols ÷ 8 rodadas). A mediana é o valor do meio da lista ordenada: 1,5.',
    E: '2,5 pega os dois valores do meio da tabela sem ordenar (4 e 1). Em ordem — 0, 1, 1, 1, 2, 3, 4, 5 —, os centrais são 1 e 2: mediana 1,5.',
  },
  'EST-005': {
    A: 'R$ 1.500,00 é a moda, o salário mais frequente. Com 10 funcionários, a mediana é a média do 5º e do 6º salários em ordem: (1.500 + 2.000) ÷ 2.',
    C: 'R$ 2.000,00 é só o 6º salário. Com 10 funcionários, a mediana é a média do 5º (R$ 1.500,00) e do 6º (R$ 2.000,00).',
    D: 'R$ 2.650,00 é a média (26.500 ÷ 10), puxada pelo salário de R$ 10.000,00. A mediana é o valor do meio: R$ 1.750,00.',
    E: 'R$ 4.125,00 é a média dos quatro valores da tabela sem considerar quantos funcionários recebem cada um. A mediana conta os 10 funcionários: R$ 1.750,00.',
  },

  // ——— Análise combinatória
  'COM-001': {
    A: '9 soma as opções (3 + 4 + 2). Cada sanduíche junta um pão, um recheio e um molho: as escolhas se multiplicam.',
    B: '12 multiplica só pães e recheios (3 × 4) e esquece os 2 molhos: cada combinação ainda se desdobra em 2.',
    C: '36 seria 3 × 4 × 3, como se houvesse 3 molhos. Com 2 molhos, são 3 × 4 × 2 = 24 sanduíches.',
    D: '48 é o dobro da resposta: multiplica por 2 uma vez a mais. Os fatores são 3 pães, 4 recheios e 2 molhos: 3 × 4 × 2 = 24.',
  },
  'COM-002': {
    A: '40 multiplica 10 algarismos por 4 posições. Cada posição tem suas próprias opções: 10 × 9 × 8 × 7 = 5.040.',
    B: '210 conta grupos de 4 algarismos sem considerar a ordem. Numa senha, a ordem importa: 1234 e 4321 são senhas diferentes.',
    C: '6.561 = 9⁴ usa 9 opções em todas as posições. Sem repetição, as opções diminuem a cada posição: 10 × 9 × 8 × 7.',
    D: '10.000 = 10⁴ permite repetir algarismos. Sem repetição, cada posição tem uma opção a menos: 10 × 9 × 8 × 7 = 5.040.',
  },
  'COM-003': {
    A: '24 multiplica 8 por 3. Uma comissão de 3 entre 8 é C(8, 3) = (8 × 7 × 6) ÷ (3 × 2 × 1) = 56.',
    B: '28 = C(8, 2) conta grupos de 2, e não de 3. Para 3 representantes: (8 × 7 × 6) ÷ 6 = 56.',
    D: '336 = 8 × 7 × 6 conta como se a ordem importasse. Na comissão todos têm a mesma função: cada grupo aparece em 3! = 6 ordens, e 336 ÷ 6 = 56.',
    E: '512 = 8³ permite repetir a mesma pessoa e considera a ordem. Numa comissão são 3 pessoas diferentes, e a ordem não importa: 56.',
  },
  'COM-004': {
    A: '15 = C(6, 4) são as equipes só de homens, sem nenhuma mulher. A resposta é o total menos elas: 210 − 15 = 195.',
    B: '90 = C(4, 2) × C(6, 2) conta só as equipes com exatamente 2 mulheres. "Pelo menos uma" inclui equipes com 1, 2, 3 ou 4 mulheres.',
    C: '210 = C(10, 4) é o total de equipes, incluindo as 15 sem nenhuma mulher, que precisam ser descontadas.',
    D: '336 fixa uma das 4 mulheres e completa com 3 quaisquer dos 9 restantes (4 × 84), contando várias vezes as equipes com mais de uma mulher.',
  },

  // ——— Probabilidade
  'PRB-001': {
    A: '1/4 não corresponde aos dados da urna. Há 4 vermelhas entre 10 bolas: 4/10 = 2/5.',
    B: '2/3 divide as vermelhas pelas azuis (4/6). O denominador são todas as 10 bolas: 4/10 = 2/5.',
    C: '3/5 = 6/10 é a chance de sair azul. As vermelhas são 4 de 10: 2/5.',
    E: '1/6 não usa os casos da urna. As vermelhas são 4 favoráveis entre 10 possíveis: 4/10 = 2/5.',
  },
  'PRB-002': {
    A: '1/12 = 3/36 contaria só 3 pares. Os que somam 7 são 6: (1, 6), (2, 5), (3, 4), (4, 3), (5, 2) e (6, 1).',
    B: '1/9 = 4/36 contaria só 4 pares. Os que somam 7 são 6 dos 36: 6/36 = 1/6.',
    C: '7/36 usa a própria soma como número de casos favoráveis. Os pares que somam 7 são 6: 6/36 = 1/6.',
    D: '1/11 trata as 11 somas possíveis (de 2 a 12) como igualmente prováveis. Não são: a soma 7 aparece em 6 dos 36 pares.',
  },
  'PRB-005': {
    A: '3/8 conta só os maiores que 5 (6, 7 e 8). Os pares 2 e 4 também ganham: são 2, 4, 6, 7 e 8.',
    B: '1/2 conta só os pares (2, 4, 6 e 8). O 7, ímpar mas maior que 5, também ganha.',
    C: '7/8 soma 4 pares e 3 maiores que 5, contando duas vezes o 6 e o 8. Sem repetição, são 5 setores.',
    E: 'Com 3/4, seriam 6 setores vencedores. Os que ganham são 2, 4, 6, 7 e 8: 5 setores.',
  },
  'PRB-003': {
    A: '1/8 é a chance de uma sequência específica, como CCK. Há 3 sequências com exatamente duas caras: CCK, CKC e KCC.',
    B: '1/4 trata os 4 "placares" (0, 1, 2 ou 3 caras) como igualmente prováveis. Não são: das 8 sequências, 3 têm exatamente duas caras.',
    C: '1/2 = 4/8 contaria 4 sequências. Com exatamente duas caras são só 3 (CCK, CKC, KCC); CCC tem três caras.',
    E: '2/3 divide 2 caras por 3 lançamentos: é a fração de caras na sequência, e não uma probabilidade. São 3 sequências favoráveis em 8.',
  },
  'PRB-004': {
    A: '9/25 = 3/5 × 3/5 seria com reposição. Sem devolver, sobram 2 bombons de morango em 4: 3/5 × 2/4 = 3/10.',
    B: '3/5 é só a chance do primeiro bombom. O segundo também precisa ser de morango: 3/5 × 2/4 = 3/10.',
    D: '1/5 corresponderia a 2 dos 10 pares de bombons possíveis. Os pares com dois de morango são 3 (C(3, 2)): 3/10.',
    E: '2/5 corresponderia a 4 dos 10 pares de bombons possíveis. Os pares com dois de morango são só 3: 3/10.',
  },
  'PRB-006': {
    A: '1% é a chance antes do teste. O resultado positivo aumenta essa chance: em 10.000 pessoas, 90 doentes e 495 saudáveis testam positivo; 90 ÷ 585 ≈ 15%.',
    B: '9% não é a proporção de doentes entre os positivos. Em 10.000 pessoas: 90 doentes positivos e 495 saudáveis positivos; 90 ÷ 585 ≈ 15%.',
    D: '50% supõe que metade dos positivos está doente. Os falsos positivos (495 em 10.000) são bem mais numerosos que os verdadeiros (90): 90 ÷ 585 ≈ 15%.',
    E: '90% é a chance de dar positivo sabendo que a pessoa está doente. A pergunta é o contrário: entre os positivos, quantos estão doentes — 90 ÷ 585 ≈ 15%.',
  },

  // ——— Geometria plana
  'GEO-001': {
    A: '37 soma as medidas (12 + 25). A área é o produto: 12 × 25 = 300 m².',
    C: '150 divide o produto por 2, como na área do triângulo. O terreno é retangular: 12 × 25 = 300 m².',
    D: '74 m é o perímetro (2 × 12 + 2 × 25), o contorno do terreno. A grama cobre a área: 12 × 25 = 300 m².',
    E: '600 é o dobro da área. O retângulo de 12 m por 25 m tem 12 × 25 = 300 m².',
  },
  'GEO-002': {
    A: 'Com 202 m², o canto retirado teria 98 m². Ele mede 8 × 6 = 48 m², e 300 − 48 = 252 m².',
    B: '300 m² é a área do retângulo inteiro, sem retirar o canto de 8 m × 6 m = 48 m².',
    D: '348 soma o canto (300 + 48) em vez de tirá-lo.',
    E: '70 m é o perímetro do retângulo inteiro (2 × 20 + 2 × 15). A pergunta é a área: 300 − 48 = 252 m².',
  },
  'GEO-006': {
    A: '60 divide a área da sala (24 m²) pelo lado da lajota (0,4 m). Divida pela área da lajota: 0,4 × 0,4 = 0,16 m².',
    C: '15 divide a área pelo contorno da lajota (4 × 0,4 = 1,6 m). O piso é coberto pela área de cada lajota: 24 ÷ 0,16 = 150.',
    D: 'Com 50 lajotas, seriam cobertos só 50 × 0,16 = 8 m², um terço dos 24 m² da sala.',
    E: '1.500 erra a conversão: a área da lajota é 0,16 m² (40 cm = 0,4 m e 0,4 × 0,4 = 0,16), e não 0,016 m².',
  },
  'GEO-003': {
    B: 'Uma rampa de 4,2 m daria 4,2² = 17,64, mas 1,5² + 3,6² = 2,25 + 12,96 = 15,21 = 3,9².',
    C: 'Uma rampa de 4,5 m daria 4,5² = 20,25, mas 1,5² + 3,6² = 15,21 = 3,9².',
    D: '3,6 m é a medida horizontal. A rampa inclinada é a hipotenusa, maior que os catetos: √(1,5² + 3,6²) = 3,9 m.',
    E: '5,1 soma o desnível e a horizontal (1,5 + 3,6). A rampa é a hipotenusa: √(2,25 + 12,96) = 3,9 m.',
  },
  'GEO-007': {
    B: '30 polegadas é a altura (3 × 10). A largura é o lado 4 da proporção: 4 × 10 = 40.',
    C: 'Com largura 35, a altura seria 26,25 e a diagonal, 43,75 polegadas, e não 50. Com lados 4k e 3k, a diagonal é 5k = 50: k = 10 e largura 40.',
    D: '25 divide a diagonal por 2. Com lados 4k e 3k, a diagonal é 5k: k = 50 ÷ 5 = 10, e a largura é 40.',
    E: 'Com largura 45, a diagonal seria 45 × 5/4 = 56,25 polegadas, e não 50. A largura é 4k, com 5k = 50: 40.',
  },
  'GEO-004': {
    A: '125,6 m é o contorno da praça (2 × 3,14 × 20), um comprimento. A calçada é uma área: 3,14 × (22² − 20²) = 263,76 m².',
    C: '1.256 m² é a área da própria praça (3,14 × 20²). A calçada é só o anel em volta dela: 3,14 × (22² − 20²) = 263,76 m².',
    D: '251,2 multiplica o contorno da praça (125,6 m) pela largura (2 m), esquecendo que o anel é mais comprido por fora. A área exata é 3,14 × (22² − 20²) = 263,76 m².',
    E: '1.519,76 m² é o círculo externo inteiro (3,14 × 22²), com a praça dentro. Tire a praça: 1.519,76 − 1.256 = 263,76 m².',
  },
  'GEO-005': {
    B: 'Com 314 voltas, a roda avançaria só 314 × 2,198 ≈ 690 m, e não 2.198 m. Uma volta avança 3,14 × 0,7 = 2,198 m: 2.198 ÷ 2,198 = 1.000 voltas.',
    C: '3.140 divide a distância pelo diâmetro (2.198 ÷ 0,7), sem o π. Em cada volta a roda avança o contorno, 3,14 × 0,7 = 2,198 m: 2.198 ÷ 2,198 = 1.000.',
    D: '100 converte 70 cm em 7 m (o certo é 0,7 m): cada volta mediria 21,98 m. Com 3,14 × 0,7 = 2,198 m por volta, são 1.000 voltas.',
    E: '10.000 converte 70 cm em 0,07 m (o certo é 0,7 m). Uma volta mede 3,14 × 0,7 = 2,198 m, e 2.198 ÷ 2,198 = 1.000.',
  },

  // ——— Geometria espacial
  'ESP-001': {
    A: '30 L usa 1 m³ = 10 L. Como 1 m³ = 1.000 dm³ e cada dm³ é 1 litro, a caixa de 2 × 1,5 × 1 = 3 m³ guarda 3.000 L.',
    C: '4.500 soma as medidas (2 + 1,5 + 1 = 4,5) antes de converter. O volume é o produto: 2 × 1,5 × 1 = 3 m³ = 3.000 L.',
    D: '300 L usa 1 m³ = 100 L. Na verdade, 1 m³ = 10 dm × 10 dm × 10 dm = 1.000 L: 3 m³ = 3.000 L.',
    E: '30.000 L usa 1 m³ = 10.000 L. Como 1 m³ = 1.000 L, os 3 m³ da caixa são 3.000 L.',
  },
  'ESP-003': {
    A: 'Uma pedra de 1.200 cm³ faria o nível subir só 1.200 ÷ (60 × 30) ≈ 0,67 cm, e não 2 cm. O volume da pedra é 60 × 30 × 2 = 3.600 cm³.',
    B: '2.400 usa a face lateral (30 × 40) como fundo. A água sobe sobre o fundo do aquário, de 60 × 30 = 1.800 cm²: 1.800 × 2 = 3.600 cm³.',
    C: '4.800 usa a face da frente (60 × 40) como fundo. A água sobe sobre o fundo, de 60 × 30 = 1.800 cm²: 1.800 × 2 = 3.600 cm³.',
    D: 'Uma pedra de 7.200 cm³ faria o nível subir 7.200 ÷ 1.800 = 4 cm, o dobro do observado. Para subir 2 cm: 1.800 × 2 = 3.600 cm³.',
  },
  'ESP-002': {
    A: '180 esquece de elevar o raio ao quadrado (3 × 5 × 12). A base é π × r² = 3 × 25 = 75 cm², e 75 × 12 = 900 mL.',
    B: '300 esquece o π (5² × 12). A área da base é π × r² = 3 × 25 = 75 cm², e 75 × 12 = 900 mL.',
    D: 'Com 450 mL, a lata teria só 450 ÷ 75 = 6 cm de altura. Com base de 3 × 5² = 75 cm² e 12 cm de altura, são 900 mL.',
    E: '3.600 usa 10 cm, o diâmetro, como raio (3 × 10² × 12). O raio é 5 cm: 3 × 25 × 12 = 900 mL.',
  },
  'ESP-004': {
    A: '25% compara a diferença (40π) com a embalagem 1 (160π). A pergunta toma a embalagem 2 como referência: 40π ÷ 120π ≈ 33%.',
    B: 'Se fosse 50% maior, a embalagem 1 teria 1,5 × 120π = 180π, mas ela tem π × 4² × 10 = 160π: 40π a mais, cerca de 33%.',
    D: '75% é a razão 120π ÷ 160π, o volume da embalagem 2 em relação ao da 1. A pergunta é quanto a 1 tem a mais: 40π ÷ 120π ≈ 33%.',
    E: '100% considera só o raio, que dobra. Mas o raio entra ao quadrado (× 4) e a altura da embalagem 1 é 1/3 da outra: 4 × 1/3 = 4/3, cerca de 33% a mais.',
  },

  // ——— Grandezas e medidas
  'GRA-001': {
    A: '1 usa 1 L = 100 mL, transformando 2,5 L em 250 mL. Na verdade, 2,5 L = 2.500 mL, e 2.500 ÷ 250 = 10 copos.',
    B: '4 é o número de copos em 1 litro (1.000 ÷ 250). A garrafa tem 2,5 L: 2,5 × 4 = 10 copos.',
    C: 'Com 25 copos de 250 mL, seriam servidos 6.250 mL = 6,25 L, mais que os 2,5 L da garrafa. São 2.500 ÷ 250 = 10 copos.',
    E: '100 usa 1 L = 10.000 mL (2,5 L viraria 25.000 mL). Um litro tem 1.000 mL: 2.500 ÷ 250 = 10 copos.',
  },
  'GRA-003': {
    A: '240 usa 1 ha = 100 m², confundindo o lado do quadrado (100 m) com a área. 1 ha = 100 × 100 = 10.000 m², e 2,4 × 10.000 = 24.000 m².',
    B: '2.400 usa 1 ha = 1.000 m². Um hectare tem 100 × 100 = 10.000 m²: 2,4 ha = 24.000 m².',
    C: '240.000 multiplica por 100.000. Um hectare tem 10.000 m²: 2,4 × 10.000 = 24.000 m².',
    E: '2.400.000 usa o fator do km² (1.000.000 m²). O hectare é menor, 10.000 m²: 2,4 ha = 24.000 m².',
  },
  'GRA-005': {
    A: 'Em 10 dias seriam usadas só 45 × 10 = 450 gotas, e o frasco tem 30 × 20 = 600. Ele dura 600 ÷ 45 ≈ 13,3: 13 dias completos.',
    B: '14 arredonda 13,3 para cima, mas no 14º dia faltariam gotas: 14 × 45 = 630, mais que as 600 do frasco. São 13 dias completos.',
    C: '20 dias exigiriam 20 × 45 = 900 gotas, mas o frasco tem só 30 × 20 = 600. São 600 ÷ 45 ≈ 13,3: 13 dias completos.',
    E: '40 é o número de doses (600 ÷ 15), e não de dias: são 3 doses por dia. 600 ÷ 45 ≈ 13,3: 13 dias completos.',
  },
};
