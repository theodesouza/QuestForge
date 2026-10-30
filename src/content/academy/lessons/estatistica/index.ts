import { course } from '../../kit/build';
import { MEDIA } from './media';
import { MEDIANA_MODA } from './mediana-moda';

export const COURSE_ESTATISTICA = course({
  topic: 'estatistica',
  title: 'Estatística',
  tagline: 'Média, mediana e moda: resumir dados com honestidade',
  tone: 'verdigris',
  lessons: [MEDIA, MEDIANA_MODA],
});
