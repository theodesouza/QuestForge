import { course } from '../../kit/build';
import { CONVERSAO } from './conversao';

export const COURSE_GRANDEZAS = course({
  topic: 'grandezas',
  title: 'Grandezas e medidas',
  tagline: 'Unidades, conversões, velocidade e tempo',
  tone: 'brass',
  lessons: [CONVERSAO],
});
