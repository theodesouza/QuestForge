import { course } from '../../kit/build';
import { JUROS_SIMPLES } from './juros-simples';

export const COURSE_FINANCEIRA = course({
  topic: 'financeira',
  title: 'Matemática financeira',
  tagline: 'Juros, prestações e escolhas que valem mais',
  tone: 'ember',
  lessons: [JUROS_SIMPLES],
});
