/** Identidade visual da Academia: cores por tom, por tipo de etapa e por estado. */
import type { CalloutTone, StageKind, Tone } from '../../content/academy/types';
import type { EvidenceLevel } from '../../domain/academy/evidence';
import type { StageStatus } from '../../domain/academy/progress';
import type { IconName } from '../../ui/Icon';
import { colors, rarityColor } from '../../ui/theme';

export const SKY = rarityColor.raro;

export const TONE: Record<Tone, string> = {
  brass: colors.brass,
  verdigris: colors.verdigris,
  ember: colors.ember,
  iris: colors.iris,
  sky: SKY,
  mist: colors.mist,
  parchment: colors.parchment,
};

export const KIND_TONE: Record<StageKind, string> = {
  descoberta: colors.verdigris,
  fundamentos: colors.brass,
  interpretacao: colors.iris,
  aplicacoes: SKY,
  aprofundamento: colors.ember,
  maestria: '#FF7AB8',
};

export const KIND_ICON: Record<StageKind, IconName> = {
  descoberta: 'flask',
  fundamentos: 'book',
  interpretacao: 'eye',
  aplicacoes: 'route',
  aprofundamento: 'bolt',
  maestria: 'seal',
};

export const STATUS_LOOK: Record<StageStatus, { label: string; color: string; icon: IconName }> = {
  novo: { label: 'Não iniciada', color: colors.mistDim, icon: 'play' },
  visto: { label: 'Vista', color: colors.mist, icon: 'eye' },
  estudado: { label: 'Estudada', color: colors.brass, icon: 'book' },
  dominado: { label: 'Dominada', color: colors.verdigris, icon: 'seal' },
};

export const CALLOUT_LOOK: Record<CalloutTone, { color: string; icon: IconName; label: string }> = {
  key: { color: colors.brass, icon: 'bulb', label: 'Ideia-chave' },
  tip: { color: colors.verdigris, icon: 'sparkle', label: 'Dica' },
  warn: { color: colors.ember, icon: 'alert', label: 'Erro comum' },
  enem: { color: colors.iris, icon: 'target', label: 'Como o ENEM cobra' },
  strategy: { color: SKY, icon: 'route', label: 'Estratégia' },
};

export const EVIDENCE_COLOR: Record<EvidenceLevel, string> = {
  'sem-dados': colors.mistDim,
  'poucos-dados': colors.mist,
  dificuldade: colors.ember,
  atencao: colors.brass,
  'em-construcao': SKY,
  solido: colors.verdigris,
};
