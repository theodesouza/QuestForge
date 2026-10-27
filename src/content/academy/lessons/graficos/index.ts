import { course } from '../../kit/build';
import { LEITURA_GRAFICOS } from './leitura-graficos';
import { TABELAS } from './tabelas';

export const COURSE_GRAFICOS = course({
  topic: 'graficos',
  title: 'Gráficos e tabelas',
  tagline: 'Ler, comparar e desconfiar de dados',
  tone: 'sky',
  lessons: [LEITURA_GRAFICOS, TABELAS],
});
