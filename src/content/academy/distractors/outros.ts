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
};
