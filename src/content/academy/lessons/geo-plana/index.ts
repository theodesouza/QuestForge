import { course } from '../../kit/build';
import { AREAS } from './areas';
import { PITAGORAS } from './pitagoras';

export const COURSE_GEO_PLANA = course({
  topic: 'geo-plana',
  title: 'Geometria plana',
  tagline: 'Áreas, perímetros, Pitágoras e círculos',
  tone: 'verdigris',
  lessons: [AREAS, PITAGORAS],
});
