import { course } from '../../kit/build';
import { EQUACAO_1GRAU } from './equacao-1grau';
import { SISTEMAS } from './sistemas';

export const COURSE_EQUACOES = course({
  topic: 'equacoes',
  title: 'Equações e sistemas',
  tagline: 'Traduzir situações em equações e resolvê-las',
  tone: 'iris',
  lessons: [EQUACAO_1GRAU, SISTEMAS],
});
