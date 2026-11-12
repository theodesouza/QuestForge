/**
 * Ignições (espaço `ignition`): como o Áster se acende ao trocar de peça, ao toque e ao ganhar XP.
 * Cada uma é uma sequência de atos sobre um relógio de uma passada (0→1, ~1,5 s): camadas que
 * crescem, giram e somem (`ActLayer`) e partículas que andam juntas (`clock`).
 */
import type { ReactNode } from 'react';
import type { SharedValue } from 'react-native-reanimated';
import { Circle, G, Line, Path, Polygon } from 'react-native-svg';
import type { ItemVisual } from '../../content/items';
import { C, Particles } from './engine';
import { arc, ngon, polar, ray, spiral, star } from './geometry';
import { ActLayer, type Act } from './space';

export interface IgnitionProps {
  v: ItemVisual | null;
  clock: SharedValue<number>;
  /** Cor do Áster (núcleo ou campo). */
  tone: string;
  r: number;
}
type P = IgnitionProps & { v: ItemVisual };
export type IgnitionRender = (p: P) => ReactNode;

const W = '#FFFFFF';
const c2 = (p: P) => p.v.color2 ?? W;
const A = (t0: number, t1: number, from: number, to: number, o: Partial<Act> = {}): Act => ({ t0, t1, from, to, drawnAt: 100, ...o });

const Ring = ({ color, w = 2.4, dash }: { color: string; w?: number; dash?: string }) => <Circle cx={C} cy={C} r={100} stroke={color} strokeWidth={w} fill="none" strokeDasharray={dash} />;
const Disc = ({ color, o = 0.5 }: { color: string; o?: number }) => <Circle cx={C} cy={C} r={100} fill={color} fillOpacity={o} />;
const Rays = ({ color, n, w = 3 }: { color: string; n: number; w?: number }) => (
  <G fill={color}>
    {Array.from({ length: n }, (_, i) => (
      <Polygon key={i} points={ray((360 / n) * i, 30, 100, w)} />
    ))}
  </G>
);
const burst = (p: P, o: { mode: 'radial' | 'converge' | 'spiral' | 'fountain'; count: number; r: [number, number]; colors: string[]; size?: [number, number]; sparkle?: boolean; trail?: number; seed?: number }) => (
  <Particles mode={o.mode} clock={p.clock} count={o.count} period={1500} colors={o.colors} size={o.size ?? [2, 3.6]} radius={o.r} sparkle={o.sparkle} trail={o.trail} seed={o.seed ?? 3} />
);

// ————————————————————————————————————————————————————— comuns

/** Faísca — um clarão e um anel: o gesto mais simples de acender. */
const Faisca: IgnitionRender = (p) => (
  <>
    <ActLayer clock={p.clock} act={A(0, 0.4, 30, 70, { shape: 1, peak: 0.7 })}>
      <Disc color={W} />
    </ActLayer>
    <ActLayer clock={p.clock} act={A(0.05, 0.8, 50, 112, { peak: 0.8 })}>
      <Ring color={p.v.color} w={3} />
    </ActLayer>
  </>
);

/** Onda Tripla — três anéis, um atrás do outro. */
const OndasIgn: IgnitionRender = (p) => (
  <>
    {[0, 0.16, 0.32].map((d, i) => (
      <ActLayer key={d} clock={p.clock} act={A(d, d + 0.62, 40, 114, { peak: 0.8 - i * 0.15 })}>
        <Ring color={i === 1 ? W : p.v.color} w={2.6 - i * 0.5} />
      </ActLayer>
    ))}
  </>
);

/** Piscar — a luz cresce por dentro e volta, sem estardalhaço. */
const Piscar: IgnitionRender = (p) => (
  <>
    <ActLayer clock={p.clock} act={A(0, 0.9, 30, 86, { peak: 0.55 })}>
      <Disc color={p.v.color} o={0.6} />
    </ActLayer>
    <ActLayer clock={p.clock} act={A(0.15, 0.7, 20, 50, { peak: 0.7 })}>
      <Disc color={W} o={0.7} />
    </ActLayer>
  </>
);

// ————————————————————————————————————————————————————— incomuns

/** Colapso — um anel largo se fecha sobre o corpo; no instante em que toca, o clarão. */
const Colapso: IgnitionRender = (p) => (
  <>
    <ActLayer clock={p.clock} act={A(0, 0.5, 116, 30, { shape: -1, peak: 0.9 })}>
      <Ring color={p.v.color} w={4} />
    </ActLayer>
    <ActLayer clock={p.clock} act={A(0.1, 0.5, 104, 30, { shape: -1, peak: 0.6 })}>
      <Ring color={W} w={1.4} dash="6 8" />
    </ActLayer>
    <ActLayer clock={p.clock} act={A(0.45, 0.95, 20, 100, { shape: 1, peak: 0.85 })}>
      <Disc color={W} o={0.6} />
    </ActLayer>
    {burst(p, { mode: 'converge', count: 10, r: [p.r, 110], colors: [W, p.v.color] })}
  </>
);

/** Raiar — raios saem do corpo girando, como o sol atrás de uma nuvem. */
const RaiosIgn: IgnitionRender = (p) => (
  <>
    <ActLayer clock={p.clock} act={A(0, 0.9, 40, 116, { turn: 40, peak: 0.6 })}>
      <Rays color={p.v.color} n={12} />
    </ActLayer>
    <ActLayer clock={p.clock} act={A(0.1, 0.8, 30, 90, { turn: -30, peak: 0.6 })}>
      <Rays color={W} n={8} w={1.6} />
    </ActLayer>
    <ActLayer clock={p.clock} act={A(0, 0.5, 30, 60, { shape: 1, peak: 0.7 })}>
      <Disc color={W} />
    </ActLayer>
  </>
);

/** Estilhaços — o brilho se parte em lascas que voam para todos os lados. */
const Estilhacos: IgnitionRender = (p) => (
  <>
    <ActLayer clock={p.clock} act={A(0, 0.35, 40, 76, { shape: 1, peak: 0.8 })}>
      <Polygon points={star(8, 100, 46)} fill={W} fillOpacity={0.7} />
    </ActLayer>
    <ActLayer clock={p.clock} act={A(0.05, 0.9, 40, 118, { turn: 24, peak: 0.85 })}>
      <G fill={p.v.color}>
        {Array.from({ length: 10 }, (_, i) => {
          const a = polar(86, i * 36);
          return <Polygon key={i} points={`${a.x},${a.y - 9} ${a.x + 4},${a.y + 2} ${a.x - 4},${a.y + 5}`} transform={`rotate(${i * 36} ${a.x} ${a.y})`} />;
        })}
      </G>
    </ActLayer>
    {burst(p, { mode: 'radial', count: 14, r: [p.r, 112], colors: [W, p.v.color, c2(p)], sparkle: true })}
  </>
);

/** Redemoinho — dois braços em espiral se enrolam para dentro e se soltam. */
const EspiralIgn: IgnitionRender = (p) => (
  <>
    <ActLayer clock={p.clock} act={A(0, 0.95, 116, 50, { turn: 300, peak: 0.85 })}>
      <G fill="none" strokeLinecap="round">
        <Path d={spiral(24, 100, 1.2, 0, 60)} stroke={p.v.color} strokeWidth={3.4} />
        <Path d={spiral(24, 100, 1.2, 180, 60)} stroke={c2(p)} strokeWidth={3.4} />
      </G>
    </ActLayer>
    <ActLayer clock={p.clock} act={A(0.55, 1, 30, 100, { shape: 1, peak: 0.6 })}>
      <Ring color={W} w={2} />
    </ActLayer>
    {burst(p, { mode: 'spiral', count: 12, r: [p.r * 0.6, 108], colors: [W, p.v.color], trail: 3 })}
  </>
);

// ————————————————————————————————————————————————————— raros

/** Abertura de Portal — um aro de travas gira, as travas se soltam e o vão se abre num clarão. */
const PortalIgn: IgnitionRender = (p) => (
  <>
    <ActLayer clock={p.clock} act={A(0, 0.85, 70, 106, { turn: 120, peak: 0.95 })}>
      <Ring color={p.v.color} w={3} />
      <G fill={c2(p)}>
        {Array.from({ length: 9 }, (_, i) => {
          const a = polar(100, i * 40);
          return <Polygon key={i} points={`${a.x},${a.y + 8} ${a.x - 6},${a.y - 5} ${a.x + 6},${a.y - 5}`} transform={`rotate(${i * 40} ${a.x} ${a.y})`} />;
        })}
      </G>
    </ActLayer>
    <ActLayer clock={p.clock} act={A(0.1, 0.7, 60, 90, { turn: -160, peak: 0.7 })}>
      <Ring color={W} w={1.4} dash="3 11" />
    </ActLayer>
    <ActLayer clock={p.clock} act={A(0.4, 1, 10, 96, { shape: 1, peak: 0.75 })}>
      <Disc color={p.v.color} o={0.5} />
    </ActLayer>
    <ActLayer clock={p.clock} act={A(0.45, 0.9, 10, 70, { shape: 1, peak: 0.8 })}>
      <Disc color={W} o={0.5} />
    </ActLayer>
  </>
);

/** Cristalização — hexágonos se fecham em volta do corpo, um dentro do outro, até encaixar. */
const Cristalizar: IgnitionRender = (p) => (
  <>
    {[0, 0.12, 0.24].map((d, i) => (
      <ActLayer key={d} clock={p.clock} act={A(d, d + 0.6, 118 - i * 10, 50 + i * 12, { turn: i % 2 ? -60 : 60, peak: 0.9 })}>
        <Polygon points={ngon(6, 100, 0)} stroke={i === 1 ? W : p.v.color} strokeWidth={2.6 - i * 0.5} fill={p.v.color} fillOpacity={0.05} strokeLinejoin="round" />
        {[0, 60, 120, 180, 240, 300].map((deg) => {
          const a = polar(100, deg);
          return <Circle key={deg} cx={a.x} cy={a.y} r={3} fill={W} />;
        })}
      </ActLayer>
    ))}
    <ActLayer clock={p.clock} act={A(0.6, 1, 40, 104, { shape: 1, peak: 0.7 })}>
      <Polygon points={ngon(6, 100, 30)} stroke={W} strokeWidth={2} fill={c2(p)} fillOpacity={0.14} strokeLinejoin="round" />
    </ActLayer>
    {burst(p, { mode: 'converge', count: 12, r: [p.r, 112], colors: [W, p.v.color], sparkle: true })}
  </>
);

/** Constelar — sete estrelas acendem em volta e um fio de luz as liga, uma a uma. */
const Constelar: IgnitionRender = (p) => {
  const pts = [20, 75, 130, 170, 215, 270, 330].map((d, i) => polar(i % 2 ? 78 : 100, d));
  return (
    <>
      <ActLayer clock={p.clock} act={A(0, 1, 90, 104, { peak: 1, turn: 14 })}>
        {pts.map((q, i) => (
          <G key={i}>
            <Circle cx={q.x} cy={q.y} r={7} fill={p.v.color} fillOpacity={0.3} />
            <Polygon points={`${q.x},${q.y - 5} ${q.x + 1.6},${q.y - 1.6} ${q.x + 5},${q.y} ${q.x + 1.6},${q.y + 1.6} ${q.x},${q.y + 5} ${q.x - 1.6},${q.y + 1.6} ${q.x - 5},${q.y} ${q.x - 1.6},${q.y - 1.6}`} fill={W} />
          </G>
        ))}
      </ActLayer>
      <ActLayer clock={p.clock} act={A(0.2, 1, 90, 104, { peak: 0.9, turn: 14 })}>
        <Path d={pts.map((q, i) => `${i ? 'L' : 'M'}${q.x.toFixed(1)} ${q.y.toFixed(1)}`).join(' ')} stroke={c2(p)} strokeWidth={1.4} fill="none" strokeLinejoin="round" />
      </ActLayer>
      <ActLayer clock={p.clock} act={A(0.5, 1, 30, 80, { shape: 1, peak: 0.5 })}>
        <Disc color={p.v.color} o={0.4} />
      </ActLayer>
    </>
  );
};

// ————————————————————————————————————————————————————— épicos

/** Supernova — o clarão, duas cascas que se afastam e os destroços. */
const SupernovaIgn: IgnitionRender = (p) => (
  <>
    <ActLayer clock={p.clock} act={A(0, 0.4, 20, 118, { shape: 1, peak: 0.95 })}>
      <Disc color={W} o={0.75} />
    </ActLayer>
    <ActLayer clock={p.clock} act={A(0.1, 0.95, 30, 118, { peak: 0.9, turn: 30 })}>
      <Ring color={p.v.color} w={5} />
      <G stroke={W} strokeLinecap="round">
        {Array.from({ length: 16 }, (_, i) => {
          const a = polar(86, i * 22.5);
          const b = polar(104, i * 22.5 + 4);
          return <Line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} strokeWidth={1.6} />;
        })}
      </G>
    </ActLayer>
    <ActLayer clock={p.clock} act={A(0.25, 1, 20, 96, { peak: 0.8, turn: -40 })}>
      <Ring color={c2(p)} w={3} dash="14 9" />
    </ActLayer>
    <ActLayer clock={p.clock} act={A(0.05, 0.8, 30, 118, { turn: 20, peak: 0.5 })}>
      <Rays color={p.v.color} n={18} w={1.6} />
    </ActLayer>
    {burst(p, { mode: 'radial', count: 22, r: [p.r, 116], colors: [W, p.v.color, c2(p)], sparkle: true, trail: 2 })}
  </>
);

/** Salto de Dobra — as estrelas viram riscos, tudo converge e o corpo "chega" num estalo. */
const DobraIgn: IgnitionRender = (p) => (
  <>
    <ActLayer clock={p.clock} act={A(0, 0.55, 118, 34, { shape: -1, peak: 0.9 })}>
      <G stroke={W} strokeLinecap="round">
        {Array.from({ length: 24 }, (_, i) => {
          const a = polar(54 + (i % 3) * 10, i * 15);
          const b = polar(100, i * 15);
          return <Line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} strokeWidth={i % 2 ? 1 : 1.8} stroke={i % 3 ? W : p.v.color} />;
        })}
      </G>
    </ActLayer>
    <ActLayer clock={p.clock} act={A(0.5, 0.75, 8, 118, { shape: 1, peak: 1 })}>
      <Disc color={W} o={0.8} />
    </ActLayer>
    <ActLayer clock={p.clock} act={A(0.52, 1, 20, 118, { peak: 0.85 })}>
      <Ring color={p.v.color} w={4} />
    </ActLayer>
    <ActLayer clock={p.clock} act={A(0.58, 1, 14, 100, { peak: 0.6 })}>
      <Ring color={c2(p)} w={1.6} dash="4 7" />
    </ActLayer>
    {burst(p, { mode: 'converge', count: 16, r: [p.r, 116], colors: [W, p.v.color], trail: 4 })}
  </>
);

// ————————————————————————————————————————————————————— lendários

/** Big Bang — tudo cai num ponto; silêncio; e então o ponto vira tudo. */
const BigBangIgn: IgnitionRender = (p) => (
  <>
    <ActLayer clock={p.clock} act={A(0, 0.36, 118, 6, { shape: -1, peak: 0.9 })}>
      <Ring color={p.v.color} w={5} />
      <Ring color={W} w={1.4} dash="5 9" />
    </ActLayer>
    <ActLayer clock={p.clock} act={A(0, 0.36, 100, 6, { shape: -1, peak: 0.6, turn: 180 })}>
      <Polygon points={star(6, 100, 60)} stroke={c2(p)} strokeWidth={2} fill="none" strokeLinejoin="round" />
    </ActLayer>
    <ActLayer clock={p.clock} act={A(0.4, 0.62, 4, 118, { shape: 1, peak: 1 })}>
      <Disc color={W} o={0.9} />
    </ActLayer>
    {[0.42, 0.5, 0.58].map((t, i) => (
      <ActLayer key={t} clock={p.clock} act={A(t, 1, 10, 118, { peak: 0.9 - i * 0.2, turn: i % 2 ? -50 : 50 })}>
        <Ring color={i === 1 ? c2(p) : p.v.color} w={5 - i * 1.4} dash={i ? '18 8' : undefined} />
      </ActLayer>
    ))}
    <ActLayer clock={p.clock} act={A(0.42, 1, 10, 118, { turn: 60, peak: 0.6 })}>
      <Rays color={W} n={24} w={1.2} />
    </ActLayer>
    <ActLayer clock={p.clock} act={A(0.44, 1, 6, 104, { turn: -90, peak: 0.7 })}>
      <G fill="none" strokeLinecap="round">
        {[0, 90, 180, 270].map((d) => (
          <Path key={d} d={spiral(20, 100, 0.8, d, 40)} stroke={p.v.color} strokeWidth={2.6} />
        ))}
      </G>
    </ActLayer>
    <Particles mode="converge" clock={p.clock} count={14} period={1500} colors={[W, p.v.color]} size={[2, 3.4]} radius={[p.r, 114]} trail={3} seed={5} />
    {burst(p, { mode: 'radial', count: 26, r: [8, 118], colors: [W, p.v.color, c2(p), '#FFE7A3'], sparkle: true, trail: 2, seed: 9 })}
  </>
);

/** Eclipse Total — uma sombra passa na frente; por um instante só a coroa aparece — e então o anel de diamante. */
const EclipseIgn: IgnitionRender = (p) => (
  <>
    <ActLayer clock={p.clock} act={A(0, 1, 100, 100, { peak: 1, shape: 0 })}>
      <Circle cx={C} cy={C} r={(p.r + 8) * 1} fill="#02030A" />
    </ActLayer>
    <ActLayer clock={p.clock} act={A(0.1, 0.9, 92, 108, { peak: 0.9, turn: 30 })}>
      <G fill={W}>
        {Array.from({ length: 20 }, (_, i) => (
          <Polygon key={i} points={ray(i * 18, p.r + 8, p.r + 22 + (i % 3) * 12, 3.4)} fillOpacity={0.6} />
        ))}
      </G>
    </ActLayer>
    <ActLayer clock={p.clock} act={A(0.15, 0.95, 96, 104, { peak: 0.95 })}>
      <Circle cx={C} cy={C} r={p.r + 9} stroke={p.v.color} strokeWidth={3} fill="none" />
      <Circle cx={C} cy={C} r={p.r + 12} stroke={W} strokeOpacity={0.6} strokeWidth={1} fill="none" />
    </ActLayer>
    <ActLayer clock={p.clock} act={A(0.55, 1, 100, 100, { peak: 1, shape: -1 })}>
      <Circle cx={polar(p.r + 9, 40).x} cy={polar(p.r + 9, 40).y} r={7} fill={W} />
      <Circle cx={polar(p.r + 9, 40).x} cy={polar(p.r + 9, 40).y} r={16} fill={c2(p)} fillOpacity={0.4} />
      <G stroke={W} strokeWidth={1.4} strokeLinecap="round">
        <Path d={`M${polar(p.r + 9, 40).x - 24} ${polar(p.r + 9, 40).y} H${polar(p.r + 9, 40).x + 24} M${polar(p.r + 9, 40).x} ${polar(p.r + 9, 40).y - 24} V${polar(p.r + 9, 40).y + 24}`} />
      </G>
      <Path d={arc(p.r + 9, 0, 80)} stroke={W} strokeWidth={2.4} fill="none" strokeLinecap="round" />
    </ActLayer>
    <ActLayer clock={p.clock} act={A(0.8, 1, 40, 118, { shape: 1, peak: 0.7 })}>
      <Ring color={c2(p)} w={3} />
    </ActLayer>
    {burst(p, { mode: 'radial', count: 12, r: [p.r + 8, 112], colors: [W, p.v.color], sparkle: true, seed: 13 })}
  </>
);

export const IGNITIONS: Record<string, IgnitionRender> = {
  faisca: Faisca,
  'ondas-ign': OndasIgn,
  piscar: Piscar,
  colapso: Colapso,
  'raios-ign': RaiosIgn,
  estilhacos: Estilhacos,
  'espiral-ign': EspiralIgn,
  'portal-ign': PortalIgn,
  cristalizar: Cristalizar,
  constelar: Constelar,
  'supernova-ign': SupernovaIgn,
  'dobra-ign': DobraIgn,
  'big-bang-ign': BigBangIgn,
  'eclipse-ign': EclipseIgn,
};

export function IgnitionFx(p: IgnitionProps) {
  const Render = p.v?.fx ? IGNITIONS[p.v.fx] : undefined;
  return Render && p.v ? <Render {...p} v={p.v} /> : <Spark {...p} />;
}

/** Sem peça de ignição: um clarão em anel (o gesto de sempre ao trocar de equipamento). */
function Spark({ clock, tone }: IgnitionProps) {
  return (
    <>
      <ActLayer clock={clock} act={A(0, 0.75, 60, 112, { peak: 0.6 })}>
        <Ring color={W} />
      </ActLayer>
      <ActLayer clock={clock} act={A(0.05, 0.85, 52, 104, { peak: 0.5, drawnAt: 100 })}>
        <Ring color={tone} w={5} />
      </ActLayer>
    </>
  );
}
