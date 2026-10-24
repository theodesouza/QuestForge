import { course } from '../../kit/build';
import { PORCENTAGEM } from './porcentagem';
import { VARIACAO_PERCENTUAL } from './variacao-percentual';

export const COURSE_PORCENTAGEM = course({
  topic: 'porcentagem',
  title: 'Porcentagem',
  tagline: 'Partes de cem, variações e mudanças sucessivas',
  tone: 'sky',
  lessons: [PORCENTAGEM, VARIACAO_PERCENTUAL],
});
