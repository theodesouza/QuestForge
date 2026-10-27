import { course } from '../../kit/build';
import { JUROS_COMPOSTOS } from './juros-compostos';
import { JUROS_COMPOSTOS_FLUXOS } from './juros-compostos-fluxos';
import { JUROS_SIMPLES } from './juros-simples';
import { JUROS_SIMPLES_DECISOES } from './juros-simples-decisoes';

export const COURSE_FINANCEIRA = course({
  topic: 'financeira',
  title: 'Matemática financeira',
  tagline: 'Juros, prestações e escolhas que valem mais',
  tone: 'ember',
  lessons: [JUROS_SIMPLES, JUROS_SIMPLES_DECISOES, JUROS_COMPOSTOS, JUROS_COMPOSTOS_FLUXOS],
});
