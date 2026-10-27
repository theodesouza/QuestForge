import { course } from '../../kit/build';
import { FUNCAO_AFIM } from './funcao-afim';

export const COURSE_FUNCOES = course({
  topic: 'funcoes',
  title: 'Funções',
  tagline: 'Relações que variam: retas, parábolas e crescimento exponencial',
  tone: 'iris',
  lessons: [FUNCAO_AFIM],
});
