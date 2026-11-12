/** Catálogo novo do Áster: tudo o que nasceu com o remake (ver docs/ASTER.md). */
import { ASTER_CORES } from './cores';
import { ASTER_RINGS } from './rings';
import type { AsterItem } from './source';

export const ASTER_ITEMS: AsterItem[] = [...ASTER_CORES, ...ASTER_RINGS];

export { FEAT_TEXT, howToGet, type AsterItem, type FeatId, type Get } from './source';
