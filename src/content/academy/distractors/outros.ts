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
};
