import { course } from '../../kit/build';
import { FUNCAO_AFIM } from './funcao-afim';
import { FUNCAO_EXPONENCIAL } from './funcao-exponencial';
import { FUNCAO_QUADRATICA } from './funcao-quadratica';

export const COURSE_FUNCOES = course({
  topic: 'funcoes',
  title: 'Funções',
  tagline: 'Relações que variam: retas, parábolas e crescimento exponencial',
  tone: 'iris',
  lessons: [FUNCAO_AFIM, FUNCAO_QUADRATICA, FUNCAO_EXPONENCIAL],
});
