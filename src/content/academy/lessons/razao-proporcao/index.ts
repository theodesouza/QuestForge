import { course } from '../../kit/build';
import { PROPORCAO } from './proporcao';
import { RAZAO } from './razao';

export const COURSE_RAZAO = course({
  topic: 'razao-proporcao',
  title: 'Razão e proporção',
  tagline: 'Comparar, escalar e repartir na medida certa',
  tone: 'brass',
  lessons: [RAZAO, PROPORCAO],
});
