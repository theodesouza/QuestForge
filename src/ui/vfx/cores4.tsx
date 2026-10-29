/**
 * Núcleos lendários das Regiões 6 a 9 — os corações dos chefões da segunda metade do Atlas.
 *   Histograma → barras, linha e rosca de setores (Leviatã dos Gráficos).
 *   Dado       → um d20 e dados menores em órbita (Esfinge do Acaso).
 *   Curvas     → um plano cartesiano com reta, parábola e exponencial (Hidra das Funções).
 * Mesma escada dos outros lendários: runas, objetos flutuantes e um clarão periódico.
 */
import { Circle, Defs, G, Line, Path, Polygon, Polyline, Rect, Text as SvgText } from 'react-native-svg';
import { Breathe, C, Extra, Particles, Spin, Wave } from './engine';
import { arc, ngon, polar } from './geometry';
import { GreekRing } from './cores3';
import { GemGradient, Glow, useGid, type CoreProps } from './kit';

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

const ODDS = ['P', 'C', 'A', '!', '%', 'n', 'p', '?'] as const;

/** Dadinho de seis faces visto de frente, com três pontos. */
function MiniDie({ x, y }: { x: number; y: number }) {
  return (
    <G>
      <Rect x={x - 4.5} y={y - 4.5} width={9} height={9} rx={2} fill="#FFFFFF" stroke="#5A2A06" strokeWidth={0.9} />
      <G fill="#FF5FA8">
        <Circle cx={x - 2} cy={y - 2} r={1} />
        <Circle cx={x} cy={y} r={1} />
        <Circle cx={x + 2} cy={y + 2} r={1} />
      </G>
    </G>
  );
}

/** Núcleo do Dado Perfeito: um d20 dourado, dois dadinhos em órbita e as letras da contagem (P, C, A, !…). */
export function Dado({ v }: CoreProps) {
  const h = useGid('dh');
  const g = useGid('dg');
  const c2 = v.color2 ?? v.color;
  const hex = Array.from({ length: 6 }, (_, i) => polar(23, i * 60));
  const tri = Array.from({ length: 3 }, (_, i) => polar(12.5, i * 120));
  return (
    <>
      <Breathe period={3600} scale={[0.93, 1.08]} opacity={[0.55, 1]}>
        <Glow id={h} color={v.color} r={50} opacity={0.5} />
      </Breathe>
      <Wave period={6200} from={14} to={56} drawnAt={42} peak={0.85} hold={0.55}>
        <Circle cx={C} cy={C} r={42} stroke="#FFF3C4" strokeWidth={2.2} fill="none" />
        <Circle cx={C} cy={C} r={38} stroke={c2} strokeWidth={1} fill="none" />
      </Wave>
      <Spin period={30000} reverse>
        <GreekRing r={37} color="#FFE7A3" size={7} glyphs={ODDS} />
      </Spin>
      <Spin period={16000}>
        <MiniDie x={C} y={C - 31} />
        <MiniDie x={C} y={C + 31} />
      </Spin>
      <Breathe period={4400} scale={[0.97, 1.04]}>
        <Defs>
          <GemGradient id={g} c1={v.color} c2={c2} />
        </Defs>
        <Polygon points={ngon(6, 23)} fill={`url(#${g})`} stroke="#5A2A06" strokeWidth={1.4} strokeLinejoin="round" />
        <G stroke="#5A2A06" strokeOpacity={0.7} strokeWidth={0.9} strokeLinejoin="round">
          <Polygon points={tri.map((t) => `${t.x.toFixed(2)},${t.y.toFixed(2)}`).join(' ')} fill="#FFFFFF" fillOpacity={0.45} />
          {tri.map((t, i) => {
            const a = hex[(i * 2) % 6];
            const b = hex[(i * 2 + 1) % 6];
            const c = hex[(i * 2 + 5) % 6];
            return (
              <G key={i}>
                <Line x1={t.x} y1={t.y} x2={a.x} y2={a.y} />
                <Line x1={t.x} y1={t.y} x2={b.x} y2={b.y} />
                <Line x1={t.x} y1={t.y} x2={c.x} y2={c.y} />
              </G>
            );
          })}
        </G>
        <SvgText x={C} y={C + 3.2} fontSize={8.5} fontWeight="700" fill="#5A2A06" textAnchor="middle">
          20
        </SvgText>
      </Breathe>
      <Particles mode="orbit" count={2} period={8200} colors={['#FFFFFF', v.color]} size={[3, 4]} radius={[47, 47]} tilt={0.45} plane={-24} glow seed={81} />
      <Extra>
        <Particles mode="orbit" count={2} period={12400} colors={[c2]} size={[2.6, 3.4]} radius={[47, 47]} tilt={0.45} plane={34} reverse glow seed={82} />
      </Extra>
      <Particles mode="rise" count={5} period={3800} colors={['#FFF3C4', '#FFFFFF']} size={[2.2, 3.4]} radius={[8, 28]} arc={[-120, 120]} travel={30} sparkle seed={83} />
    </>
  );
}

const AXES = ['f', 'x', 'y', 'a', 'b', 'c', 'Δ', '√'] as const;
const PLANE_R = 29;

/** Trechos de uma curva y = fn(x) que cabem dentro do disco do plano, em coordenadas do palco. */
function curvePath(fn: (x: number) => number): string {
  let d = '';
  let open = false;
  for (let x = -PLANE_R; x <= PLANE_R; x += 1) {
    const y = fn(x);
    if (Math.hypot(x, y) <= PLANE_R - 0.5) {
      d += `${open ? 'L' : 'M'}${(C + x).toFixed(1)} ${(C - y).toFixed(1)} `;
      open = true;
    } else {
      open = false;
    }
  }
  return d;
}

const LINE_PATH = curvePath((x) => 0.55 * x + 2);
const PARABOLA_PATH = curvePath((x) => -0.034 * x * x + 15);
const EXPONENTIAL_PATH = curvePath((x) => 3 * 2 ** (x / 9) - 15);

/** Núcleo das Curvas: um plano cartesiano em brasa com uma reta, uma parábola e uma exponencial. */
export function Curvas({ v }: CoreProps) {
  const h = useGid('ch');
  const c2 = v.color2 ?? v.color;
  return (
    <>
      <Breathe period={3600} scale={[0.93, 1.08]} opacity={[0.55, 1]}>
        <Glow id={h} color={v.color} r={50} opacity={0.5} />
      </Breathe>
      <Wave period={6400} from={14} to={56} drawnAt={42} peak={0.85} hold={0.55}>
        <Circle cx={C} cy={C} r={42} stroke="#FFE7D6" strokeWidth={2.2} fill="none" />
        <Circle cx={C} cy={C} r={38} stroke={c2} strokeWidth={1} fill="none" />
      </Wave>
      <Spin period={34000} reverse>
        <GreekRing r={37} color="#FFD9B8" size={7} glyphs={AXES} />
      </Spin>
      <Breathe period={4800} scale={[0.98, 1.03]}>
        <Circle cx={C} cy={C} r={PLANE_R} fill="#2A0F05" fillOpacity={0.6} stroke={c2} strokeWidth={1.2} />
        <G stroke="#FFFFFF" strokeOpacity={0.14} strokeWidth={0.7}>
          {[-20, -10, 10, 20].map((k) => (
            <G key={k}>
              <Line x1={C + k} y1={C - Math.sqrt(PLANE_R ** 2 - k ** 2)} x2={C + k} y2={C + Math.sqrt(PLANE_R ** 2 - k ** 2)} />
              <Line x1={C - Math.sqrt(PLANE_R ** 2 - k ** 2)} y1={C + k} x2={C + Math.sqrt(PLANE_R ** 2 - k ** 2)} y2={C + k} />
            </G>
          ))}
        </G>
        <G stroke="#FFFFFF" strokeOpacity={0.6} strokeWidth={1}>
          <Line x1={C - PLANE_R} y1={C} x2={C + PLANE_R} y2={C} />
          <Line x1={C} y1={C - PLANE_R} x2={C} y2={C + PLANE_R} />
        </G>
        <G fill="none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <Path d={LINE_PATH} stroke="#FFFFFF" />
          <Path d={PARABOLA_PATH} stroke={c2} />
          <Path d={EXPONENTIAL_PATH} stroke="#FF6A55" />
        </G>
        <Circle cx={C} cy={C - 15} r={2.4} fill={c2} stroke="#FFFFFF" strokeWidth={0.8} />
      </Breathe>
      <Particles mode="orbit" count={2} period={7800} colors={['#FFFFFF', v.color]} size={[3, 4]} radius={[47, 47]} tilt={0.45} plane={-24} glow seed={91} />
      <Extra>
        <Particles mode="orbit" count={2} period={12000} colors={[c2]} size={[2.6, 3.4]} radius={[47, 47]} tilt={0.45} plane={34} reverse glow seed={92} />
      </Extra>
      <Particles mode="rise" count={6} period={3600} colors={['#FFE7D6', '#FFD36B']} size={[2.2, 3.4]} radius={[8, 28]} arc={[-120, 120]} travel={32} sparkle seed={93} />
    </>
  );
}
