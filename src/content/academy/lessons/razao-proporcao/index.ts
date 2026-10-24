import { course } from '../../kit/build';
import { PROPORCAO } from './proporcao';
import { RAZAO } from './razao';
import { REGRA_DE_TRES } from './regra-de-tres';

export const COURSE_RAZAO = course({
  topic: 'razao-proporcao',
  title: 'Razão e proporção',
  tagline: 'Comparar, escalar e repartir na medida certa',
  tone: 'brass',
  lessons: [RAZAO, PROPORCAO, REGRA_DE_TRES],
});
