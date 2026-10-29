/**
 * Hidra das Funções — três pescoços de escamas laranja saindo de um rochedo, cada cabeça com
 * chifres, olho em brasa e dentes. Cada erro faz nascer uma cabeça nova (mais clara e menor);
 * na fase 2 os pescoços secam: tudo fica acinzentado e as cabeças novas somem.
 */
import { memo } from 'react';
import Svg, { Circle, Defs, Ellipse, G, Path, Polygon, RadialGradient, Stop } from 'react-native-svg';
import { colors } from '../../ui/theme';

interface Props {
  size?: number;
  /** Fase 2: os pescoços secam. */
  cracked?: boolean;
  defeated?: boolean;
  /** Cabeças novas (0–3), além das três originais. */
  heads?: number;
}

/** Pescoços e cabeças originais; cada um parte da base do rochedo. */
const BASE = [
  { neck: 'M104 206 C70 180 50 140 58 96', head: { x: 58, y: 82, s: 1, rot: -14 } },
  { neck: 'M120 206 C116 160 118 110 120 70', head: { x: 120, y: 54, s: 1.08, rot: 0 } },
  { neck: 'M136 206 C170 180 190 140 182 96', head: { x: 182, y: 82, s: 1, rot: 14 } },
] as const;

/** Cabeças novas: menores, em pescoços mais curtos, nascendo entre as originais. */
const EXTRA = [
  { neck: 'M96 206 C60 196 30 170 28 138', head: { x: 28, y: 126, s: 0.72, rot: -22 } },
  { neck: 'M144 206 C180 196 210 170 212 138', head: { x: 212, y: 126, s: 0.72, rot: 22 } },
  { neck: 'M112 206 C100 176 92 148 90 122', head: { x: 90, y: 110, s: 0.66, rot: -6 } },
] as const;

function Head({ x, y, s, rot, tone, dark, eye, dead }: { x: number; y: number; s: number; rot: number; tone: string; dark: string; eye: string; dead: boolean }) {
  return (
    <G transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <Polygon points="-12,-10 -18,-26 -6,-14" fill={dark} stroke={colors.ink900} strokeWidth={1.6} strokeLinejoin="round" />
      <Polygon points="12,-10 18,-26 6,-14" fill={dark} stroke={colors.ink900} strokeWidth={1.6} strokeLinejoin="round" />
      <Ellipse cx={0} cy={0} rx={17} ry={13} fill={tone} stroke={colors.ink900} strokeWidth={2} />
      <Ellipse cx={0} cy={8} rx={13} ry={6} fill={dark} stroke={colors.ink900} strokeWidth={1.6} />
      <Path d="M-9 6 L-6 11 L-3 6 L0 11 L3 6 L6 11 L9 6" fill="none" stroke={dead ? colors.ink500 : '#FFFFFF'} strokeWidth={1.4} strokeLinejoin="round" />
      {dead ? (
        <Path d="M-9 -5 L-3 1 M-3 -5 L-9 1 M3 -5 L9 1 M9 -5 L3 1" stroke={eye} strokeWidth={1.6} strokeLinecap="round" />
      ) : (
        <>
          <Circle cx={-7} cy={-3} r={3} fill={eye} stroke={colors.ink900} strokeWidth={1} />
          <Circle cx={7} cy={-3} r={3} fill={eye} stroke={colors.ink900} strokeWidth={1} />
        </>
      )}
    </G>
  );
}

export const HidraArt = memo(function HidraArt({ size = 220, cracked = false, defeated = false, heads = 0 }: Props) {
  const wither = cracked || defeated;
  const skin = defeated ? '#3A3F57' : wither ? '#7A6A62' : '#E0703A';
  const skinDark = defeated ? '#2A2E42' : wither ? '#54463F' : '#9A3F1C';
  const newSkin = defeated ? '#3A3F57' : '#FFA66B';
  const eye = defeated ? colors.ink500 : wither ? '#FFB68A' : '#FFE08A';
  const extra = wither ? 0 : Math.max(0, Math.min(3, heads));

  return (
    <Svg width={size} height={size} viewBox="0 0 240 240">
      <Defs>
        <RadialGradient id="hidGlow" cx="50%" cy="45%" r="50%">
          <Stop offset="0" stopColor={defeated ? colors.ink600 : '#FF8A55'} stopOpacity={0.26} />
          <Stop offset="1" stopColor={colors.ink900} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={120} cy={112} r={112} fill="url(#hidGlow)" />

      {/* pescoços e cabeças novas (atrás das originais) */}
      {EXTRA.slice(0, extra).map((e, i) => (
        <G key={`n${i}`}>
          <Path d={e.neck} stroke={colors.ink900} strokeWidth={15} strokeLinecap="round" fill="none" />
          <Path d={e.neck} stroke={newSkin} strokeWidth={10} strokeLinecap="round" fill="none" />
          <Head {...e.head} tone={newSkin} dark={skinDark} eye={eye} dead={false} />
        </G>
      ))}

      {/* pescoços e cabeças originais */}
      {BASE.map((b, i) => (
        <G key={`b${i}`}>
          <Path d={b.neck} stroke={colors.ink900} strokeWidth={22} strokeLinecap="round" fill="none" />
          <Path d={b.neck} stroke={skin} strokeWidth={17} strokeLinecap="round" fill="none" />
          <Path d={b.neck} stroke={skinDark} strokeOpacity={0.5} strokeWidth={17} strokeDasharray="2 7" strokeLinecap="round" fill="none" />
          <Head {...b.head} tone={skin} dark={skinDark} eye={eye} dead={defeated} />
        </G>
      ))}

      {/* rochedo */}
      <G stroke={colors.ink900} strokeWidth={2} strokeLinejoin="round">
        <Polygon points="52,214 76,188 112,200 140,184 176,198 200,214" fill={defeated ? '#2A2E42' : '#4A3A52'} />
        <Polygon points="76,188 90,196 80,214 52,214" fill={defeated ? '#363B52' : '#5C4868'} />
      </G>
      <Path d="M24 222 Q120 208 216 222" stroke={colors.line} strokeWidth={2} fill="none" />
    </Svg>
  );
});
