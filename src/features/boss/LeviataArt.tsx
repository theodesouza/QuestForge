/**
 * Leviatã dos Gráficos — uma serpente do mar de corpo em duas ondas, com um histograma no dorso,
 * dentes em zigue-zague de gráfico de linhas e escamas hexagonais de dados. As escamas que
 * ainda restam cobrem o corpo; onde uma foi arrancada, a carne exposta brilha em brasa.
 */
import { memo } from 'react';
import Svg, { Circle, Defs, Ellipse, G, Path, Polygon, Polyline, RadialGradient, Rect, Stop } from 'react-native-svg';
import { colors } from '../../ui/theme';

interface Props {
  size?: number;
  /** Aceito por compatibilidade com os outros chefões; o Leviatã usa `scales`. */
  cracked?: boolean;
  defeated?: boolean;
  /** Escamas que ainda cobrem o corpo (0 a `maxScales`). */
  scales?: number;
  maxScales?: number;
}

/** Centro de cada escama, de trás para a frente do corpo. */
const SPOTS = [
  { x: 46, y: 160 },
  { x: 72, y: 160 },
  { x: 118, y: 160 },
  { x: 146, y: 160 },
] as const;

const hex = (cx: number, cy: number, r: number) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = ((i * 60 - 30) * Math.PI) / 180;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(' ');

const FIN: [number, number, number][] = [
  [42, 135, 10],
  [50, 132, 18],
  [59, 130, 26],
  [68, 132, 16],
  [77, 135, 9],
  [115, 135, 9],
  [123, 132, 17],
  [132, 130, 24],
  [141, 132, 14],
  [149, 135, 8],
];

export const LeviataArt = memo(function LeviataArt({ size = 220, defeated = false, scales = 4, maxScales = 4 }: Props) {
  const body = defeated ? '#2E3A44' : '#1E8C7A';
  const bodyDark = defeated ? '#1F2830' : '#0F4A42';
  const belly = defeated ? '#3A4752' : '#5FE0C4';
  const accent = defeated ? colors.ink500 : '#7FF3FF';
  const left = defeated ? 0 : Math.max(0, Math.min(maxScales, scales));
  const exposed = !defeated && left === 0;
  const spine = 'M24 196 C34 130 84 130 96 190 C108 130 158 130 168 188 C176 150 182 122 198 102';

  return (
    <Svg width={size} height={size} viewBox="0 0 240 240">
      <Defs>
        <RadialGradient id="leviGlow" cx="50%" cy="45%" r="50%">
          <Stop offset="0" stopColor={defeated ? colors.ink600 : exposed ? colors.ember : '#38D6B0'} stopOpacity={0.26} />
          <Stop offset="1" stopColor={colors.ink900} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={120} cy={112} r={112} fill="url(#leviGlow)" />

      {/* ondas atrás do corpo */}
      <Path d="M8 206 Q30 196 52 206 T96 206 T140 206 T184 206 T232 206" stroke={defeated ? colors.ink600 : '#1B6B7A'} strokeWidth={3} fill="none" strokeLinecap="round" />

      {/* corpo: contorno, pele e brilho do ventre */}
      <Path d={spine} stroke={colors.ink900} strokeWidth={40} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d={spine} stroke={body} strokeWidth={34} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d={spine} stroke={belly} strokeOpacity={0.35} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" fill="none" transform="translate(0 9)" />

      {/* histograma no dorso */}
      <G stroke={colors.ink900} strokeWidth={1.4}>
        {FIN.map(([x, y, h], i) => (
          <Rect key={x} x={x - 4} y={y - h} width={8} height={h + 3} rx={1.5} fill={i % 2 ? accent : defeated ? colors.ink500 : '#38D6B0'} fillOpacity={defeated ? 0.55 : 0.95} />
        ))}
      </G>

      {/* cabeça */}
      <G transform="rotate(-18 206 92)">
        <Ellipse cx={208} cy={92} rx={26} ry={17} fill={body} stroke={colors.ink900} strokeWidth={2.4} />
        <Ellipse cx={212} cy={104} rx={22} ry={9} fill={bodyDark} stroke={colors.ink900} strokeWidth={2} />
        {/* dentes: linha de gráfico em zigue-zague */}
        <Polyline points="192,99 197,108 202,99 207,108 212,99 217,108 222,99 227,108" fill="none" stroke={defeated ? colors.ink500 : '#FFFFFF'} strokeWidth={1.8} strokeLinejoin="round" />
      </G>
      {defeated ? (
        <G stroke={colors.ink500} strokeWidth={2} strokeLinecap="round">
          <Path d="M206 80 L214 88 M214 80 L206 88" />
        </G>
      ) : (
        <>
          <Circle cx={211} cy={85} r={6.5} fill={accent} fillOpacity={0.25} />
          <Circle cx={211} cy={85} r={3.6} fill={accent} />
          <Circle cx={212} cy={84} r={1.4} fill="#FFFFFF" />
        </>
      )}

      {/* escamas (inteiras) ou carne exposta (arrancadas) */}
      {SPOTS.map((p, i) => {
        const present = i < left;
        if (defeated) return null;
        return present ? (
          <G key={i}>
            <Polygon points={hex(p.x, p.y, 11)} fill="#7FF3FF" fillOpacity={0.9} stroke={colors.ink900} strokeWidth={1.8} strokeLinejoin="round" />
            <Polygon points={hex(p.x, p.y, 6.5)} fill="#FFFFFF" fillOpacity={0.3} />
          </G>
        ) : (
          <G key={i}>
            <Polygon points={hex(p.x, p.y, 10)} fill={colors.ember} fillOpacity={0.28} stroke={colors.ember} strokeOpacity={0.7} strokeWidth={1.4} strokeLinejoin="round" strokeDasharray="3 3" />
          </G>
        );
      })}

      {/* ondas na frente */}
      <Path d="M0 214 Q22 204 44 214 T88 214 T132 214 T176 214 T240 214 L240 240 L0 240 Z" fill={defeated ? '#18212A' : '#0E3552'} stroke={colors.ink900} strokeWidth={2} />
      <Path d="M0 226 Q22 218 44 226 T88 226 T132 226 T176 226 T240 226" stroke={defeated ? colors.ink600 : '#38D6B0'} strokeOpacity={0.5} strokeWidth={2} fill="none" />
    </Svg>
  );
});
