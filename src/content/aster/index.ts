/** Catálogo novo do Áster: tudo o que nasceu com o remake (ver docs/ASTER.md). */
import { ASTER_CORES } from './cores';
import { ASTER_FIELDS } from './fields';
import { ASTER_IGNITIONS } from './ignitions';
import { ASTER_LENSES } from './lenses';
import { ASTER_ORBITERS } from './orbiters';
import { ASTER_RINGS } from './rings';
import { ASTER_SKIES } from './skies';
import { ASTER_TITLES } from './titles';
import { ASTER_TRAILS } from './trails';
import type { AsterItem } from './source';

export const ASTER_ITEMS: AsterItem[] = [...ASTER_CORES, ...ASTER_RINGS, ...ASTER_FIELDS, ...ASTER_ORBITERS, ...ASTER_TRAILS, ...ASTER_LENSES, ...ASTER_IGNITIONS, ...ASTER_SKIES, ...ASTER_TITLES];

export { FEAT_TEXT, howToGet, type AsterItem, type FeatId, type Get } from './source';
