import { course } from '../../kit/build';
import { PROBABILIDADE_COMPOSTA } from './probabilidade-composta';
import { PROBABILIDADE_SIMPLES } from './probabilidade-simples';

export const COURSE_PROBABILIDADE = course({
  topic: 'probabilidade',
  title: 'Probabilidade',
  tagline: 'Medir a chance, de um lance a eventos encadeados',
  tone: 'iris',
  lessons: [PROBABILIDADE_SIMPLES, PROBABILIDADE_COMPOSTA],
});
