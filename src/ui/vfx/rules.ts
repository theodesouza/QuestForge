/**
 * Regras puras dos efeitos (sem React/Reanimated): quais efeitos existem e qual
 * sinergia um equipamento desperta. Testáveis isoladamente; os registros de
 * renderização (cores.tsx, auras.tsx) são tipados por estas listas, então o
 * compilador garante que todo efeito tem desenho.
 */
import { ELEMENT_LABEL, RARITY_TIER, getItem, type FxElement } from '../../content/items';
import type { Equipped } from '../../domain/game/types';
import { MYTHIC_COLOR } from '../theme';

export const CORE_FX = ['prisma', 'ambar', 'rubi', 'verdete', 'iris', 'safira', 'solar', 'pulsar', 'tesouro'] as const;
export const AURA_FX = ['brasa', 'nevoa', 'mare', 'lunar', 'boreal', 'nebulosa', 'aurea', 'zenite'] as const;
export type CoreFxId = (typeof CORE_FX)[number];
export type AuraFxId = (typeof AURA_FX)[number];

export type Synergy =
  | { kind: 'resonance'; element: FxElement; strength: number; color: string; color2: string; label: string }
  | { kind: 'refraction'; strength: number; color: string; color2: string; label: string }
  | { kind: 'mythic'; strength: number; color: string; color2: string; label: string };

/** Qual sinergia (se houver) o equipamento atual desperta. */
export function resolveSynergy(equipped: Pick<Equipped, 'core' | 'aura'>): Synergy | null {
  if (!equipped.aura) return null;
  const core = getItem(equipped.core);
  const aura = getItem(equipped.aura);
  const ce = core.visual.element;
  const ae = aura.visual.element;
  if (!ce || !ae) return null;
  const strength = (RARITY_TIER[core.rarity] + RARITY_TIER[aura.rarity]) / 8; // 0..1
  const color = aura.visual.color;
  const color2 = aura.visual.color2 ?? core.visual.color;
  if (core.rarity === 'lendario' && aura.rarity === 'lendario') {
    return { kind: 'mythic', strength: 1, color: core.visual.color, color2: MYTHIC_COLOR, label: 'Forma Mítica · Ascensão' };
  }
  if (ce === 'cristal') return { kind: 'refraction', strength: 0.4 + strength * 0.6, color, color2, label: `Refração · o Quartzo assume a ${aura.name}` };
  if (ce === ae) return { kind: 'resonance', element: ce, strength: 0.45 + strength * 0.55, color, color2, label: `Ressonância ${resonanceName(ce)}` };
  return null;
}

function resonanceName(e: FxElement): string {
  return e === 'fogo' ? 'de Fogo' : e === 'mare' ? 'das Marés' : e === 'lunar' ? 'Lunar' : e === 'tempestade' ? 'da Tempestade' : e === 'astral' ? 'Astral' : e === 'aureo' ? 'Áurea' : ELEMENT_LABEL[e];
}
