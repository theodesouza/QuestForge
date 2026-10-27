import { course } from '../../kit/build';
import { PRINCIPIO_MULTIPLICATIVO } from './principio-multiplicativo';

export const COURSE_COMBINATORIA = course({
  topic: 'combinatoria',
  title: 'Análise combinatória',
  tagline: 'Contar sem listar: escolhas, ordem e grupos',
  tone: 'ember',
  lessons: [PRINCIPIO_MULTIPLICATIVO],
});
