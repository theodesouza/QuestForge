/**
 * Núcleos lendários das Regiões 4 e 5 — os corações dos chefões de geometria.
 *   Euclides → o teorema de Pitágoras desenhado com régua e compasso (triângulo 3-4-5 e seus quadrados).
 *   Poliedro → sólidos de Platão encaixados, cada um girando no seu ritmo.
 * Mesma escada dos outros lendários: runas, objetos flutuantes e um clarão periódico.
 */
import { Circle, G, Line, Polygon, Text as SvgText } from 'react-native-svg';
import { Breathe, C, Extra, Particles, Spin, Wave } from './engine';
import { ngon, polar } from './geometry';
import { Glow, useGid, type CoreProps } from './kit';

const GLYPHS = ['α', 'β', 'γ', 'π', 'Δ', 'θ', '√', 'φ'];

/** Anel de letras (por padrão as gregas dos ângulos), à maneira do anel de runas do Tesouro. */
export function GreekRing({ r, color, size = 7, opacity = 0.9, glyphs = GLYPHS }: { r: number; color: string; size?: number; opacity?: number; glyphs?: readonly string[] }) {
  return (
    <G>
      <Circle cx={C} cy={C} r={r + size * 0.85} stroke={color} strokeOpacity={opacity * 0.6} strokeWidth={0.7} fill="none" />
      <Circle cx={C} cy={C} r={r - size * 0.85} stroke={color} strokeOpacity={opacity * 0.6} strokeWidth={0.7} fill="none" />
      {glyphs.map((g, i) => {
        const deg = (360 / glyphs.length) * i;
        const p = polar(r, deg);
        return (
          <SvgText key={`${g}${i}`} x={p.x} y={p.y + size * 0.36} fontSize={size} fontWeight="700" fill={color} fillOpacity={opacity} textAnchor="middle" transform={`rotate(${deg} ${p.x} ${p.y})`}>
            {g}
          </SvgText>
        );
      })}
    </G>
  );
}

type Pt = { x: number; y: number };
const pts = (list: Pt[]) => list.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');

/** Os três quadrados do teorema: catetos 3 e 4, hipotenusa 5, centrados no palco. */
function pythagoras(u: number) {
  const p0 = { x: C - 2 * u, y: C + 1.5 * u };
  const a = { x: p0.x + 4 * u, y: p0.y };
  const b = { x: p0.x, y: p0.y - 3 * u };
  const n = { x: 3 * u, y: -4 * u }; // normal à hipotenusa, apontando para fora
  return {
    triangle: [p0, a, b],
    sq16: [p0, a, { x: a.x, y: a.y + 4 * u }, { x: p0.x, y: p0.y + 4 * u }],
    sq9: [p0, b, { x: b.x - 3 * u, y: b.y }, { x: p0.x - 3 * u, y: p0.y }],
    sq25: [a, b, { x: b.x + n.x, y: b.y + n.y }, { x: a.x + n.x, y: a.y + n.y }],
    label: {
      sq16: { x: p0.x + 2 * u, y: p0.y + 2 * u },
      sq9: { x: p0.x - 1.5 * u, y: p0.y - 1.5 * u },
      sq25: { x: (a.x + b.x + n.x) / 2 + 0, y: (a.y + b.y + n.y) / 2 },
    },
  };
}

/** Núcleo de Euclides: o 3-4-5 e seus quadrados (9 + 16 = 25), um compasso em órbita e letras gregas. */
export function Euclides({ v }: CoreProps) {
  const h = useGid('eh');
  const c2 = v.color2 ?? v.color;
  const u = 3.9;
  const g = pythagoras(u);
  const sq = (pts_: Pt[], fill: string, o: number) => <Polygon points={pts(pts_)} fill={fill} fillOpacity={o} stroke="#FFF3C4" strokeOpacity={0.75} strokeWidth={0.9} strokeLinejoin="round" />;
  return (
    <>
      <Breathe period={3600} scale={[0.93, 1.08]} opacity={[0.55, 1]}>
        <Glow id={h} color={v.color} r={50} opacity={0.5} />
      </Breathe>
      <Wave period={6400} from={14} to={56} drawnAt={42} peak={0.85} hold={0.55}>
        <Circle cx={C} cy={C} r={42} stroke="#FFF3C4" strokeWidth={2.2} fill="none" />
        <Circle cx={C} cy={C} r={38} stroke={c2} strokeWidth={1} fill="none" />
      </Wave>
      <Spin period={30000} reverse>
        <GreekRing r={36} color="#FFE7A3" size={7} />
      </Spin>
      <Spin period={21000}>
        {/* Traço do compasso: circunferência pontilhada com a ponta seca marcada. */}
        <Circle cx={C} cy={C} r={30} stroke={c2} strokeOpacity={0.75} strokeWidth={0.9} strokeDasharray="1.5 4.5" strokeLinecap="round" fill="none" />
        <Circle cx={C} cy={C - 30} r={2} fill="#FFFFFF" />
      </Spin>
      <Breathe period={4800} scale={[0.97, 1.04]}>
        {sq(g.sq9, c2, 0.5)}
        {sq(g.sq16, v.color, 0.55)}
        {sq(g.sq25, '#FFE7A3', 0.6)}
        <Polygon points={pts(g.triangle)} fill="#FFFFFF" fillOpacity={0.9} stroke="#7A4308" strokeWidth={1} strokeLinejoin="round" />
        {/* Ângulo reto, marcado como nos livros. */}
        <Polygon points={pts([g.triangle[0], { x: g.triangle[0].x + 3, y: g.triangle[0].y }, { x: g.triangle[0].x + 3, y: g.triangle[0].y - 3 }, { x: g.triangle[0].x, y: g.triangle[0].y - 3 }])} fill="none" stroke="#7A4308" strokeWidth={0.8} />
        {([['sq9', '9'], ['sq16', '16'], ['sq25', '25']] as const).map(([k, t]) => (
          <SvgText key={k} x={g.label[k].x} y={g.label[k].y + 2.2} fontSize={6.5} fontWeight="700" fill="#2A1A04" textAnchor="middle">
            {t}
          </SvgText>
        ))}
      </Breathe>
      <Particles mode="orbit" count={1} period={7000} colors={['#FFFFFF']} size={[4, 4.5]} radius={[30, 30]} tilt={1} glow seed={41} />
      <Extra>
        <Particles mode="orbit" count={2} period={11000} colors={[c2, '#FFE7A3']} size={[2.6, 3.4]} radius={[46, 46]} tilt={0.5} plane={25} reverse glow seed={42} />
      </Extra>
      <Particles mode="rise" count={6} period={3800} colors={['#FFE7A3', '#FFFFFF']} size={[2.2, 3.4]} radius={[10, 30]} arc={[-120, 120]} travel={34} sparkle seed={43} />
    </>
  );
}

/** Cubo isométrico: hexágono com as três faces à vista. */
function CubeFaces({ r, top, left, right, stroke }: { r: number; top: string; left: string; right: string; stroke: string }) {
  const v = Array.from({ length: 6 }, (_, i) => polar(r, i * 60));
  const c = { x: C, y: C };
  return (
    <G strokeLinejoin="round" stroke={stroke} strokeOpacity={0.85} strokeWidth={0.9}>
      <Polygon points={pts([c, v[5], v[0], v[1]])} fill={top} fillOpacity={0.75} />
      <Polygon points={pts([c, v[1], v[2], v[3]])} fill={right} fillOpacity={0.6} />
      <Polygon points={pts([c, v[3], v[4], v[5]])} fill={left} fillOpacity={0.7} />
    </G>
  );
}

/** Octaedro: hexágono com as três diagonais (o que se vê de um sólido de seis vértices). */
function OctaWire({ r, color }: { r: number; color: string }) {
  const v = Array.from({ length: 6 }, (_, i) => polar(r, i * 60 + 30));
  return (
    <G stroke={color} strokeWidth={0.9} strokeLinejoin="round" fill="none">
      <Polygon points={pts(v)} />
      {[0, 1, 2].map((i) => (
        <Line key={i} x1={v[i].x} y1={v[i].y} x2={v[i + 3].x} y2={v[i + 3].y} strokeOpacity={0.7} />
      ))}
    </G>
  );
}

/** Núcleo do Poliedro: cubo, octaedro e tetraedro encaixados, em três rotações diferentes. */
export function Poliedro({ v }: CoreProps) {
  const h = useGid('ph');
  const c2 = v.color2 ?? v.color;
  return (
    <>
      <Breathe period={3800} scale={[0.93, 1.08]} opacity={[0.55, 1]}>
        <Glow id={h} color={v.color} r={50} opacity={0.5} />
      </Breathe>
      <Wave period={6800} from={14} to={56} drawnAt={42} peak={0.85} hold={0.55}>
        <Circle cx={C} cy={C} r={42} stroke="#E8FFFF" strokeWidth={2.2} fill="none" />
        <Circle cx={C} cy={C} r={38} stroke={c2} strokeWidth={1} fill="none" />
      </Wave>
      <Spin period={34000} reverse>
        <Circle cx={C} cy={C} r={38} stroke={v.color} strokeOpacity={0.7} strokeWidth={0.9} strokeDasharray="2 5" strokeLinecap="round" fill="none" />
        <Polygon points={ngon(6, 38)} stroke={c2} strokeOpacity={0.55} strokeWidth={0.9} strokeLinejoin="round" fill="none" />
        {Array.from({ length: 6 }, (_, i) => {
          const p = polar(38, i * 60);
          return <Circle key={i} cx={p.x} cy={p.y} r={2.2} fill="#FFFFFF" />;
        })}
      </Spin>
      <Spin period={26000}>
        <CubeFaces r={29} top="#FFFFFF" left={v.color} right={c2} stroke="#E8FFFF" />
      </Spin>
      <Spin period={17000} reverse>
        <OctaWire r={19} color="#E8FFFF" />
      </Spin>
      <Breathe period={3200} scale={[0.86, 1.14]}>
        <Polygon points={ngon(3, 9)} fill="#FFFFFF" fillOpacity={0.35} stroke="#FFFFFF" strokeWidth={1.1} strokeLinejoin="round" />
        <Circle cx={C} cy={C} r={3.4} fill="#FFFFFF" />
      </Breathe>
      <Particles mode="orbit" count={2} period={8200} colors={['#FFFFFF', v.color]} size={[3, 4]} radius={[46, 46]} tilt={0.45} plane={-24} glow seed={51} />
      <Extra>
        <Particles mode="orbit" count={2} period={12000} colors={[c2]} size={[2.6, 3.4]} radius={[46, 46]} tilt={0.45} plane={36} reverse glow seed={52} />
      </Extra>
      <Particles mode="rise" count={5} period={3800} colors={['#E8FFFF', '#FFFFFF']} size={[2.2, 3.4]} radius={[8, 28]} arc={[-120, 120]} travel={30} sparkle seed={53} />
    </>
  );
}
