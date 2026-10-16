/**
 * Design tokens — "Cartografia Noturna".
 * Um caderno de cartógrafo aberto à noite: tinta escura, linhas de latão,
 * constelações. Ver PROJECT_PLAN.md §3.
 */
import { Platform, type TextStyle } from 'react-native';

export const colors = {
  ink900: '#0B1020',
  ink850: '#0E1428',
  ink800: '#121933',
  ink700: '#1A2346',
  ink600: '#27315C',
  ink500: '#3A4578',
  parchment: '#F4ECDC',
  parchmentDim: '#D9D0BE',
  mist: '#9AA3C7',
  mistDim: '#6C7499',
  brass: '#F2B54A',
  brassDeep: '#C98A2B',
  brassGlow: 'rgba(242, 181, 74, 0.16)',
  line: 'rgba(242, 181, 74, 0.22)',
  lineSoft: 'rgba(154, 163, 199, 0.16)',
  verdigris: '#38D6B0',
  verdigrisDeep: '#1E8C7A',
  verdigrisGlow: 'rgba(56, 214, 176, 0.14)',
  ember: '#FF6A55',
  emberDeep: '#C2412F',
  emberGlow: 'rgba(255, 106, 85, 0.14)',
  iris: '#9B87FF',
  irisGlow: 'rgba(155, 135, 255, 0.14)',
  scrim: 'rgba(6, 9, 20, 0.96)',
} as const;

export const rarityColor = {
  comum: colors.mist,
  incomum: colors.verdigris,
  raro: '#6FA8FF',
  epico: colors.iris,
  lendario: colors.brass,
} as const;
/** Forma Mítica (núcleo + aura lendários): não é um item, é a combinação. */
export const MYTHIC_COLOR = '#FF7AB8';

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32, huge: 44 } as const;
export const radius = { sm: 10, md: 14, lg: 20, xl: 28, pill: 999 } as const;

export const fonts = {
  display: 'BricolageGrotesque_700Bold',
  displayHeavy: 'BricolageGrotesque_800ExtraBold',
  displayMedium: 'BricolageGrotesque_600SemiBold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemi: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
} as const;

const tabular: TextStyle = Platform.select({ default: { fontVariant: ['tabular-nums'] }, web: {} }) ?? {};

export const type = {
  hero: { fontFamily: fonts.displayHeavy, fontSize: 40, lineHeight: 44, letterSpacing: -0.8 },
  title: { fontFamily: fonts.display, fontSize: 28, lineHeight: 32, letterSpacing: -0.4 },
  heading: { fontFamily: fonts.display, fontSize: 21, lineHeight: 26, letterSpacing: -0.2 },
  subheading: { fontFamily: fonts.displayMedium, fontSize: 17, lineHeight: 22 },
  label: { fontFamily: fonts.bodySemi, fontSize: 11.5, lineHeight: 14, letterSpacing: 1.3, textTransform: 'uppercase' },
  body: { fontFamily: fonts.body, fontSize: 15.5, lineHeight: 23 },
  bodyStrong: { fontFamily: fonts.bodySemi, fontSize: 15.5, lineHeight: 23 },
  question: { fontFamily: fonts.body, fontSize: 17, lineHeight: 27 },
  ask: { fontFamily: fonts.bodySemi, fontSize: 17, lineHeight: 26 },
  caption: { fontFamily: fonts.bodyMedium, fontSize: 13, lineHeight: 18 },
  number: { fontFamily: fonts.display, fontSize: 17, lineHeight: 20, ...tabular },
} satisfies Record<string, TextStyle>;

export type TypeVariant = keyof typeof type;

export const motion = {
  fast: 160,
  base: 260,
  slow: 420,
  spring: { damping: 16, stiffness: 180, mass: 0.9 },
  springSoft: { damping: 20, stiffness: 120, mass: 1 },
} as const;

export const hitSlop = { top: 10, bottom: 10, left: 10, right: 10 } as const;

/** Espaço reservado no fim das telas com barra de abas flutuante. */
export const TAB_BAR_SPACE = 96;
