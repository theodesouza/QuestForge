/**
 * Núcleos lendários das Regiões 6 a 9 — os corações dos chefões da segunda metade do Atlas.
 *   Histograma → barras, linha e rosca de setores (Leviatã dos Gráficos).
 * Mesma escada dos outros lendários: runas, objetos flutuantes e um clarão periódico.
 */
import { Circle, G, Line, Path, Polyline, Rect } from 'react-native-svg';
import { Breathe, C, Extra, Particles, Spin, Wave } from './engine';
import { arc } from './geometry';
import { GreekRing } from './cores3';
import { Glow, useGid, type CoreProps } from './kit';

const STATS = ['Σ', 'μ', 'σ', '%', 'Δ', 'n', 'Q', 'f'] as const;

/** Núcleo do Histograma: barras de alturas diferentes, a linha que une os topos e uma rosca de setores girando. */
export function Histograma({ v }: CoreProps) {
  const h = useGid('hh');
  const c2 = v.color2 ?? v.color;
  const base = C + 17;
  const bars = [
    { x: C - 22, h: 14 },
    { x: C - 11, h: 27 },
    { x: C, h: 20 },
    { x: C + 11, h: 35 },
    { x: C + 22, h: 25 },
  ];
  const slices: [number, number, string][] = [
    [0, 140, v.color],
    [146, 220, c2],
    [226, 290, '#9B87FF'],
    [296, 354, '#FFFFFF'],
  ];
  return (
    <>
      <Breathe period={3600} scale={[0.93, 1.08]} opacity={[0.55, 1]}>
        <Glow id={h} color={v.color} r={50} opacity={0.5} />
      </Breathe>
      <Wave period={6600} from={14} to={56} drawnAt={42} peak={0.85} hold={0.55}>
        <Circle cx={C} cy={C} r={42} stroke="#E8FFFA" strokeWidth={2.2} fill="none" />
        <Circle cx={C} cy={C} r={38} stroke={c2} strokeWidth={1} fill="none" />
      </Wave>
      <Spin period={32000} reverse>
        <GreekRing r={37} color="#BFFBEF" size={7} glyphs={STATS} />
      </Spin>
      <Spin period={44000}>
        <G fill="none" strokeWidth={4.5} strokeLinecap="round">
          {slices.map(([a, b, color]) => (
            <Path key={a} d={arc(30, a, b)} stroke={color} strokeOpacity={0.85} />
          ))}
        </G>
      </Spin>
      <Breathe period={4800} scale={[0.97, 1.04]}>
        <Line x1={C - 30} y1={base} x2={C + 30} y2={base} stroke="#FFFFFF" strokeOpacity={0.55} strokeWidth={1} />
        {bars.map((b, i) => (
          <Rect key={b.x} x={b.x - 4} y={base - b.h} width={8} height={b.h} rx={1.5} fill={i % 2 ? c2 : v.color} fillOpacity={0.92} stroke="#0B3B34" strokeWidth={0.8} />
        ))}
        <Polyline points={bars.map((b) => `${b.x},${base - b.h - 4}`).join(' ')} fill="none" stroke="#FFFFFF" strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round" />
        {bars.map((b) => (
          <Circle key={`p${b.x}`} cx={b.x} cy={base - b.h - 4} r={2.2} fill="#FFFFFF" />
        ))}
      </Breathe>
      <Particles mode="orbit" count={2} period={8000} colors={['#FFFFFF', v.color]} size={[3, 4]} radius={[47, 47]} tilt={0.45} plane={-26} glow seed={71} />
      <Extra>
        <Particles mode="orbit" count={2} period={12500} colors={[c2]} size={[2.6, 3.4]} radius={[47, 47]} tilt={0.45} plane={34} reverse glow seed={72} />
      </Extra>
      <Particles mode="rise" count={5} period={3800} colors={['#E8FFFA', '#FFFFFF']} size={[2.2, 3.4]} radius={[8, 28]} arc={[-120, 120]} travel={30} sparkle seed={73} />
    </>
  );
}
