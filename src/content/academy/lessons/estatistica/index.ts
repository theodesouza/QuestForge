import { course } from '../../kit/build';
import { MEDIA } from './media';

export const COURSE_ESTATISTICA = course({
  topic: 'estatistica',
  title: 'Estatística',
  tagline: 'Média, mediana e moda: resumir dados com honestidade',
  tone: 'verdigris',
  lessons: [MEDIA],
});
