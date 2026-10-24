import { course } from '../../kit/build';
import { FRACOES } from './fracoes';
import { MMC_MDC } from './mmc-mdc';
import { OPERACOES } from './operacoes';

export const COURSE_BASICA = course({
  topic: 'basica',
  title: 'Matemática básica',
  tagline: 'Números, frações, múltiplos e potências — a base de tudo',
  tone: 'verdigris',
  lessons: [OPERACOES, FRACOES, MMC_MDC],
});
