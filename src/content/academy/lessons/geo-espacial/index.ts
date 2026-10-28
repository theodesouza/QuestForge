import { course } from '../../kit/build';
import { CILINDRO } from './cilindro';
import { VOLUMES } from './volumes';

export const COURSE_GEO_ESPACIAL = course({
  topic: 'geo-espacial',
  title: 'Geometria espacial',
  tagline: 'Volumes, capacidades e cilindros',
  tone: 'sky',
  lessons: [VOLUMES, CILINDRO],
});
