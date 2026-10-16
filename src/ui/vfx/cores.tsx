/**
 * Núcleos do astrolábio — cada um com estrutura, movimento e assinatura próprios.
 * A complexidade cresce com a raridade:
 *   comum    → forma lapidada + respiração/brilho sutil
 *   incomum  → + elemento girando e poucas partículas
 *   raro     → + coroa/silhueta marcante, pulsos e órbitas
 *   épico    → + feixes, ondas de energia, campo orbital
 *   lendário → + runas, objetos flutuantes, clarão de ativação periódico
 */
import { useId, type ReactNode } from 'react';
import { Circle, Defs, Ellipse, G, Line, Path, Polygon, Polyline, RadialGradient, Stop, Text as SvgText } from 'react-native-svg';
import type { ItemVisual } from '../../content/items';
import { Breathe, C, Extra, FxExtent, Glimmer, Layer, Particles, Spin, Wave } from './engine';
import { lightning, ngon, polar, ray, star } from './geometry';
import type { CoreFxId } from './rules';

export interface CoreProps {
  v: ItemVisual;
  /** Cor refletida (o Quartzo assume a cor da aura). */
  tint?: string | null;
}

function useGid(prefix: string) {
  return `${prefix}${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
}

/** Gradiente de gema: brilho branco no alto à esquerda, cor, cor profunda. */
function GemGradient({ id, c1, c2, hi = 0.95 }: { id: string; c1: string; c2: string; hi?: number }) {
  return (
    <RadialGradient id={id} cx="38%" cy="34%" r="70%">
      <Stop offset="0" stopColor="#FFFFFF" stopOpacity={hi} />
      <Stop offset="0.32" stopColor={c1} />
      <Stop offset="1" stopColor={c2} />
    </RadialGradient>
  );
}

function Glow({ id, color, r, opacity = 0.45 }: { id: string; color: string; r: number; opacity?: number }) {
  return (
    <>
      <Defs>
        <RadialGradient id={id} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={color} stopOpacity={opacity} />
          <Stop offset="0.55" stopColor={color} stopOpacity={opacity * 0.35} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={C} cy={C} r={r} fill={`url(#${id})`} />
    </>
  );
}

/** Facetas: linhas do centro aos vértices de um polígono. */
function Facets({ n, r, rotate = 0, color = '#FFFFFF', opacity = 0.35 }: { n: number; r: number; rotate?: number; color?: string; opacity?: number }) {
  return (
    <G stroke={color} strokeOpacity={opacity} strokeWidth={0.7}>
      {Array.from({ length: n }, (_, i) => {
        const p = polar(r, rotate + (360 / n) * i);
        return <Line key={i} x1={C} y1={C} x2={p.x} y2={p.y} />;
      })}
    </G>
  );
}

// ——————————————————————————————————————————————— comum

/** Quartzo: cristal hexagonal transparente; com aura, refrata a cor dela. */
function Prisma({ v, tint }: CoreProps) {
  const g = useGid('pq');
  const h = useGid('ph');
  const mid = tint ?? v.color;
  return (
    <>
      <Breathe period={4200} scale={[0.97, 1.03]} opacity={[0.55, 0.9]}>
        <Glow id={h} color={tint ?? v.color2 ?? v.color} r={26} opacity={tint ? 0.5 : 0.3} />
      </Breathe>
      <Layer>
        <Defs>
          <GemGradient id={g} c1={mid} c2={v.color2 ?? v.color} hi={0.9} />
        </Defs>
        <Polygon points={ngon(6, 16, 30)} fill={`url(#${g})`} stroke="#FFFFFF" strokeOpacity={0.55} strokeWidth={1.1} strokeLinejoin="round" />
        <Polygon points={ngon(6, 8, 30)} fill="#FFFFFF" fillOpacity={0.14} stroke="#FFFFFF" strokeOpacity={0.4} strokeWidth={0.6} />
        <Facets n={6} r={16} rotate={30} opacity={0.3} />
        <Polygon points={`${C - 9},${C - 9} ${C - 2},${C - 13} ${C - 4},${C - 5}`} fill="#FFFFFF" fillOpacity={0.55} />
      </Layer>
      <Particles mode="twinkle" count={1} period={5200} colors={['#FFFFFF']} size={[3, 3]} radius={[13, 13]} arc={[-50, -40]} sparkle />
    </>
  );
}

/** Âmbar: gota quente com uma brasa presa no centro. */
function Ambar({ v }: CoreProps) {
  const g = useGid('ag');
  const h = useGid('ah');
  const e = useGid('ae');
  return (
    <>
      <Breathe period={3600} scale={[0.95, 1.05]} opacity={[0.5, 0.85]}>
        <Glow id={h} color={v.color} r={27} />
      </Breathe>
      <Layer>
        <Defs>
          <GemGradient id={g} c1={v.color} c2={v.color2 ?? v.color} />
        </Defs>
        <Ellipse cx={C} cy={C + 1} rx={14} ry={16} fill={`url(#${g})`} stroke="#3B1A06" strokeOpacity={0.6} strokeWidth={1.2} />
        <Ellipse cx={C - 5} cy={C - 6} rx={4} ry={2.6} fill="#FFFFFF" fillOpacity={0.5} transform={`rotate(-30 ${C - 5} ${C - 6})`} />
      </Layer>
      <Breathe period={2400} scale={[0.8, 1.15]} opacity={[0.55, 1]}>
        <Defs>
          <RadialGradient id={e} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="#FFF4C2" />
            <Stop offset="0.5" stopColor="#FF8A3D" stopOpacity={0.9} />
            <Stop offset="1" stopColor="#FF6A55" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={C} cy={C + 3} r={6} fill={`url(#${e})`} />
      </Breathe>
    </>
  );
}

/** Rubi: lapidação almofada com mesa clara; pulsa como um coração. */
function Rubi({ v }: CoreProps) {
  const g = useGid('rg');
  const h = useGid('rh');
  return (
    <>
      <Breathe period={1700} scale={[0.96, 1.06]} opacity={[0.4, 0.8]}>
        <Glow id={h} color={v.color} r={26} />
      </Breathe>
      <Breathe period={1700} scale={[0.99, 1.03]}>
        <Defs>
          <GemGradient id={g} c1={v.color} c2={v.color2 ?? v.color} hi={0.8} />
        </Defs>
        <Polygon points={ngon(8, 16, 22.5)} fill={`url(#${g})`} stroke="#3A0612" strokeOpacity={0.6} strokeWidth={1.2} strokeLinejoin="round" />
        <Polygon points={ngon(8, 8.5, 22.5)} fill="#FFB3C1" fillOpacity={0.3} stroke="#FFFFFF" strokeOpacity={0.45} strokeWidth={0.7} />
        <G stroke="#FFFFFF" strokeOpacity={0.28} strokeWidth={0.6}>
          {Array.from({ length: 8 }, (_, i) => {
            const a = polar(8.5, 22.5 + i * 45);
            const b = polar(16, 22.5 + i * 45);
            return <Line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
          })}
        </G>
      </Breathe>
    </>
  );
}

// ——————————————————————————————————————————————— incomum

/** Verdete: disco de bronze com espiral gravada girando e gotas em órbita. */
function Verdete({ v }: CoreProps) {
  const g = useGid('vg');
  const h = useGid('vh');
  return (
    <>
      <Breathe period={3800} scale={[0.96, 1.05]} opacity={[0.45, 0.85]}>
        <Glow id={h} color={v.color} r={30} />
      </Breathe>
      <Layer>
        <Defs>
          <GemGradient id={g} c1={v.color} c2={v.color2 ?? v.color} hi={0.7} />
        </Defs>
        <Circle cx={C} cy={C} r={17} fill={`url(#${g})`} stroke="#0D3B33" strokeWidth={1.4} />
        <G stroke="#0D3B33" strokeOpacity={0.5} strokeWidth={0.8}>
          {Array.from({ length: 16 }, (_, i) => {
            const a = polar(15, i * 22.5);
            const b = polar(17, i * 22.5);
            return <Line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
          })}
        </G>
      </Layer>
      <Spin period={14000}>
        <Path
          d={`M${C} ${C} m0 -2 a2 2 0 1 1 -0.1 0 m0 -3 a5 5 0 1 1 -0.1 0 m0 -3.5 a8.5 8.5 0 1 1 -0.1 0 m0 -3.5 a12 12 0 1 1 -0.1 0`}
          stroke="#E6FFF8"
          strokeOpacity={0.55}
          strokeWidth={0.9}
          fill="none"
          strokeDasharray="5 3"
        />
      </Spin>
      <Particles mode="orbit" count={3} period={5200} colors={['#7FF3D8', '#B8FFF0']} size={[3, 4]} radius={[24, 25]} tilt={0.45} plane={-20} glow seed={3} />
    </>
  );
}

/** Íris: olho iridescente — anéis que trocam de tom, pupila estelar e motas orbitando. */
function Iris({ v }: CoreProps) {
  const h = useGid('ih');
  return (
    <>
      <Breathe period={4400} scale={[0.95, 1.06]} opacity={[0.45, 0.85]}>
        <Glow id={h} color={v.color} r={30} />
      </Breathe>
      <Layer>
        <Circle cx={C} cy={C} r={17} fill="#1B1240" stroke={v.color} strokeWidth={1.4} />
      </Layer>
      <Breathe period={5200} opacity={[0.15, 1]}>
        <Circle cx={C} cy={C} r={13} stroke={v.color2 ?? v.color} strokeWidth={3} fill="none" />
        <Circle cx={C} cy={C} r={8.5} stroke="#7FF3FF" strokeWidth={2} fill="none" />
      </Breathe>
      <Breathe period={5200} phase={0.5} opacity={[0.15, 1]}>
        <Circle cx={C} cy={C} r={13} stroke="#7FF3FF" strokeWidth={3} fill="none" />
        <Circle cx={C} cy={C} r={8.5} stroke={v.color2 ?? v.color} strokeWidth={2} fill="none" />
      </Breathe>
      <Spin period={9000} reverse>
        <Circle cx={C} cy={C} r={15.5} stroke="#FFFFFF" strokeOpacity={0.5} strokeWidth={0.8} strokeDasharray="1.5 3.5" fill="none" />
        <Polygon points={star(4, 5, 1.6)} fill="#FFFFFF" />
      </Spin>
      <Particles mode="orbit" count={4} period={7000} colors={[v.color2 ?? v.color, '#7FF3FF']} size={[2.5, 3.5]} radius={[24, 27]} tilt={0.55} plane={25} seed={11} />
    </>
  );
}

/** Safira: lapidação brilhante azul-profunda, cintilação fria e anel de geada. */
function Safira({ v }: CoreProps) {
  const g = useGid('sg');
  const h = useGid('sh');
  const pts = [polar(18, 0), polar(15, 90), polar(18, 180), polar(15, 270)];
  const kite = pts.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
  return (
    <>
      <Breathe period={4600} scale={[0.96, 1.05]} opacity={[0.4, 0.8]}>
        <Glow id={h} color={v.color} r={29} />
      </Breathe>
      <Spin period={26000}>
        <Circle cx={C} cy={C} r={25} stroke="#BFE3FF" strokeOpacity={0.55} strokeWidth={0.9} strokeDasharray="0.5 4.5" strokeLinecap="round" fill="none" />
        {Array.from({ length: 6 }, (_, i) => {
          const p = polar(25, i * 60);
          return <Polygon key={i} points={`${p.x},${p.y - 2.2} ${p.x + 1.2},${p.y} ${p.x},${p.y + 2.2} ${p.x - 1.2},${p.y}`} fill="#DDF1FF" fillOpacity={0.8} />;
        })}
      </Spin>
      <Layer>
        <Defs>
          <GemGradient id={g} c1={v.color} c2={v.color2 ?? v.color} hi={0.85} />
        </Defs>
        <Polygon points={kite} fill={`url(#${g})`} stroke="#DDF1FF" strokeOpacity={0.6} strokeWidth={1} strokeLinejoin="round" />
        <G stroke="#FFFFFF" strokeOpacity={0.35} strokeWidth={0.6}>
          <Line x1={pts[1].x} y1={pts[1].y} x2={pts[3].x} y2={pts[3].y} />
          <Line x1={pts[0].x} y1={pts[0].y} x2={C} y2={C + 4} />
          <Line x1={pts[2].x} y1={pts[2].y} x2={C} y2={C + 4} />
          <Line x1={pts[1].x} y1={pts[1].y} x2={C} y2={C + 4} />
          <Line x1={pts[3].x} y1={pts[3].y} x2={C} y2={C + 4} />
        </G>
      </Layer>
      <Particles mode="twinkle" count={2} period={3400} colors={['#FFFFFF']} size={[3.5, 4.5]} radius={[12, 16]} arc={[-70, 70]} sparkle seed={5} />
    </>
  );
}

// ——————————————————————————————————————————————— raro

/** Solar: um sol em miniatura — coroa de raios dupla, pulsos de calor e brasas em órbita. */
function Solar({ v }: CoreProps) {
  const g = useGid('og');
  const h = useGid('oh');
  return (
    <>
      <Breathe period={3200} scale={[0.92, 1.08]} opacity={[0.55, 1]}>
        <Glow id={h} color={v.color2 ?? v.color} r={44} opacity={0.5} />
      </Breathe>
      <Wave period={3000} from={16} to={44} drawnAt={30} peak={0.55}>
        <Circle cx={C} cy={C} r={30} stroke={v.color} strokeWidth={1.6} fill="none" />
      </Wave>
      <Extra>
        <Wave period={3000} phase={0.5} from={16} to={44} drawnAt={30} peak={0.4}>
          <Circle cx={C} cy={C} r={30} stroke={v.color2 ?? v.color} strokeWidth={1.2} fill="none" />
        </Wave>
      </Extra>
      <Spin period={20000}>
        <G fill={v.color} fillOpacity={0.9}>
          {Array.from({ length: 12 }, (_, i) => (
            <Polygon key={i} points={ray(i * 30, 17, 33, 7)} />
          ))}
        </G>
      </Spin>
      <Extra min={0.8}>
        <Spin period={30000} reverse opacity={0.7}>
          <G fill={v.color2 ?? v.color}>
            {Array.from({ length: 12 }, (_, i) => (
              <Polygon key={i} points={ray(i * 30 + 15, 16, 27, 4)} />
            ))}
          </G>
        </Spin>
      </Extra>
      <Breathe period={3200} scale={[0.97, 1.04]}>
        <Defs>
          <RadialGradient id={g} cx="45%" cy="42%" r="62%">
            <Stop offset="0" stopColor="#FFFFFF" />
            <Stop offset="0.35" stopColor="#FFF2B0" />
            <Stop offset="0.75" stopColor={v.color} />
            <Stop offset="1" stopColor={v.color2 ?? v.color} />
          </RadialGradient>
        </Defs>
        <Circle cx={C} cy={C} r={15} fill={`url(#${g})`} />
      </Breathe>
      <Particles mode="orbit" count={5} period={8000} colors={['#FFE08A', '#FF9F43', '#FFFFFF']} size={[2.5, 4]} radius={[34, 40]} tilt={0.5} plane={-15} glow seed={21} />
    </>
  );
}

// ——————————————————————————————————————————————— épico

/** Pulsar: estrela de nêutrons — feixes giratórios, ondas em sequência, campo e arcos elétricos. */
function Pulsar({ v }: CoreProps) {
  const h = useGid('uh');
  const b = useGid('ub');
  const c2 = v.color2 ?? v.color;
  return (
    <>
      <Breathe period={1600} scale={[0.9, 1.12]} opacity={[0.5, 1]}>
        <Glow id={h} color={v.color} r={40} opacity={0.55} />
      </Breathe>
      {[0, 0.33, 0.66].map((ph, i) => (
        <Extra key={i} min={i ? 0.5 : 0}>
          <Wave period={2400} phase={ph} from={9} to={48} drawnAt={30} peak={0.6}>
            <Circle cx={C} cy={C} r={30} stroke={i === 1 ? c2 : v.color} strokeWidth={1.4} fill="none" />
          </Wave>
        </Extra>
      ))}
      <Extra>
        <Spin period={16000} reverse opacity={0.75}>
          <G stroke={c2} strokeWidth={0.9} fill="none" strokeDasharray="3 3">
            <Ellipse cx={C} cy={C} rx={32} ry={12} transform={`rotate(-30 ${C} ${C})`} />
            <Ellipse cx={C} cy={C} rx={32} ry={12} transform={`rotate(30 ${C} ${C})`} />
          </G>
        </Spin>
      </Extra>
      <Spin period={3200}>
        <Defs>
          <RadialGradient id={b} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.95} />
            <Stop offset="0.45" stopColor={v.color} stopOpacity={0.7} />
            <Stop offset="1" stopColor={v.color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Polygon points={ray(0, 4, 52, 9)} fill={`url(#${b})`} />
        <Polygon points={ray(180, 4, 52, 9)} fill={`url(#${b})`} />
        <Polygon points={ray(0, 4, 40, 3)} fill="#FFFFFF" fillOpacity={0.8} />
        <Polygon points={ray(180, 4, 40, 3)} fill="#FFFFFF" fillOpacity={0.8} />
      </Spin>
      {[0, 0.33, 0.66].map((ph, i) => (
        <Extra key={i} min={i ? 0.5 : 0}>
          <Glimmer period={2700} phase={ph} window={0.3} peak={0.9}>
            <Polyline points={lightning(40 + i * 120, 11, 30, 5, 9, 17 + i * 7)} stroke="#E8FDFF" strokeWidth={1.1} fill="none" strokeLinejoin="round" strokeLinecap="round" />
          </Glimmer>
        </Extra>
      ))}
      <Layer>
        <Circle cx={C} cy={C} r={8} fill="#FFFFFF" />
        <Circle cx={C} cy={C} r={11} stroke={v.color} strokeWidth={1.6} fill="none" />
      </Layer>
      <Particles mode="orbit" count={2} period={3800} colors={['#FFFFFF']} size={[3.5, 4]} radius={[32, 32]} tilt={0.37} plane={-30} glow seed={2} />
      <Extra>
        <Particles mode="orbit" count={2} period={5200} colors={[c2]} size={[3, 3.5]} radius={[32, 32]} tilt={0.37} plane={30} reverse glow seed={9} />
      </Extra>
    </>
  );
}

// ——————————————————————————————————————————————— lendário

const RUNES = ['φ', 'π', 'Σ', '∞', '√', 'Δ', 'θ', '∫'];

/** Anel de runas matemáticas (usado pelo Tesouro e pela Forma Mítica). */
export function RuneRing({ r, color, size = 7, opacity = 0.9 }: { r: number; color: string; size?: number; opacity?: number }) {
  return (
    <G>
      <Circle cx={C} cy={C} r={r + size * 0.85} stroke={color} strokeOpacity={opacity * 0.6} strokeWidth={0.7} fill="none" />
      <Circle cx={C} cy={C} r={r - size * 0.85} stroke={color} strokeOpacity={opacity * 0.6} strokeWidth={0.7} fill="none" />
      {RUNES.map((g, i) => {
        const p = polar(r, i * 45);
        return (
          <SvgText
            key={g}
            x={p.x}
            y={p.y + size * 0.36}
            fontSize={size}
            fontWeight="700"
            fill={color}
            fillOpacity={opacity}
            textAnchor="middle"
            transform={`rotate(${i * 45} ${p.x} ${p.y})`}
          >
            {g}
          </SvgText>
        );
      })}
    </G>
  );
}

function Coin({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <G>
      <Circle cx={cx} cy={cy} r={r} fill="#FFD36B" stroke="#9A5B12" strokeWidth={0.8} />
      <Circle cx={cx} cy={cy} r={r * 0.62} stroke="#B87318" strokeWidth={0.6} fill="none" />
      <Polygon points={star(5, r * 0.5, r * 0.22).replace(/([\d.]+),([\d.]+)/g, (_, x, y) => `${(Number(x) - C + cx).toFixed(2)},${(Number(y) - C + cy).toFixed(2)}`)} fill="#FFF3C4" />
    </G>
  );
}

/** Tesouro: gema áurea de 12 pontas, anel de runas, moedas em órbita e clarão de ativação. */
function Tesouro({ v }: CoreProps) {
  const g = useGid('tg');
  const h = useGid('th');
  const c2 = v.color2 ?? v.color;
  return (
    <>
      <Breathe period={3400} scale={[0.93, 1.08]} opacity={[0.6, 1]}>
        <Glow id={h} color={v.color} r={50} opacity={0.55} />
        <G fill={v.color} fillOpacity={0.85}>
          {Array.from({ length: 8 }, (_, i) => (
            <Polygon key={i} points={ray(i * 45 + 22.5, 18, 27, 6)} />
          ))}
        </G>
      </Breathe>
      <Wave period={6000} from={14} to={56} drawnAt={40} peak={0.85} hold={0.55}>
        <Circle cx={C} cy={C} r={40} stroke="#FFF3C4" strokeWidth={2.2} fill="none" />
        <Circle cx={C} cy={C} r={36} stroke={v.color} strokeWidth={1} fill="none" />
      </Wave>
      <Spin period={26000} reverse>
        <RuneRing r={34} color="#FFE7A3" size={7} />
      </Spin>
      <Spin period={18000}>
        <Defs>
          <GemGradient id={g} c1={v.color} c2={c2} />
        </Defs>
        <Polygon points={star(12, 19, 14)} fill={`url(#${g})`} stroke="#7A4308" strokeWidth={1} strokeLinejoin="round" />
        <Polygon points={ngon(12, 10)} fill="#FFF3C4" fillOpacity={0.4} stroke="#FFFFFF" strokeOpacity={0.6} strokeWidth={0.7} />
        <Facets n={12} r={14} color="#FFFFFF" opacity={0.3} />
        {/* Ponto central: invariante ao giro, viaja na mesma camada. */}
        <Circle cx={C} cy={C} r={4.5} fill="#FFFFFF" />
      </Spin>
      <OrbitingCoins />
      <Particles mode="rise" count={6} period={3600} colors={['#FFE7A3', '#FFFFFF']} size={[2.2, 3.4]} radius={[10, 30]} arc={[-120, 120]} travel={34} sparkle seed={31} />
    </>
  );
}

/** Três moedas em órbita — uma camada só girando (mesmo período para as três). */
function OrbitingCoins() {
  return (
    <Spin period={9000}>
      {[0, 120, 240].map((a) => {
        const p = polar(44, a);
        return <Coin key={a} cx={p.x} cy={p.y} r={4.6} />;
      })}
    </Spin>
  );
}

// ——————————————————————————————————————————————— registro

export const CORES: Record<CoreFxId, (p: CoreProps) => ReactNode> = {
  prisma: Prisma,
  ambar: Ambar,
  rubi: Rubi,
  verdete: Verdete,
  iris: Iris,
  safira: Safira,
  solar: Solar,
  pulsar: Pulsar,
  tesouro: Tesouro,
};

/** Raio máximo desenhado por qualquer núcleo (brilho do Tesouro respirando, feixes do Pulsar). */
export const CORE_EXTENT = 60;

export function CoreFx({ v, tint }: CoreProps) {
  const Render = CORES[(v.fx ?? 'prisma') as CoreFxId] ?? Prisma;
  return (
    <FxExtent r={CORE_EXTENT}>
      <Render v={v} tint={tint} />
    </FxExtent>
  );
}
