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
};
