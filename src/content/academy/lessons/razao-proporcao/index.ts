import { course } from '../../kit/build';
import { ESCALA } from './escala';
import { PROPORCAO } from './proporcao';
import { RAZAO } from './razao';
import { REGRA_DE_TRES } from './regra-de-tres';
import { REGRA_DE_TRES_COMPOSTA } from './regra-de-tres-composta';
import { REGRA_DE_TRES_INVERSA } from './regra-de-tres-inversa';

export const COURSE_RAZAO = course({
  topic: 'razao-proporcao',
  title: 'Razão e proporção',
  tagline: 'Comparar, escalar e repartir na medida certa',
  tone: 'brass',
  lessons: [RAZAO, PROPORCAO, REGRA_DE_TRES, REGRA_DE_TRES_INVERSA, REGRA_DE_TRES_COMPOSTA, ESCALA],
});
