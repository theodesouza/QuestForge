/**
 * Gravidade (espaço `lens`): como o Áster dobra o espaço ao redor. Fica atrás de tudo (é o próprio
 * espaço, não um objeto): lentes de luz, malhas que afundam, ondas, órbitas e curvas notáveis.
 */
import type { ReactNode } from 'react';
import { Circle, Ellipse, G, Line, Path, Polygon } from 'react-native-svg';
import type { ItemVisual } from '../../content/items';
import { Breathe, C, Extra, FxExtent, Glimmer, Layer, Particles, Spin, Wave } from './engine';
import { arc, polar, spiral } from './geometry';
import { Plane } from './space';

export interface LensProps {
  v: ItemVisual;
  r: number;
  tier: number;
}
export type LensRender = (p: LensProps) => ReactNode;

const W = '#FFFFFF';
const TILT = -18;
const c2 = (p: LensProps) => p.v.color2 ?? W;

/** Malha vista de cima: círculos que se apertam perto do centro e raios — num plano inclinado, vira um funil. */
function Mesh({ r0, r1, rings, spokes, color, pinch = 1.7, o = 0.6 }: { r0: number; r1: number; rings: number; spokes: number; color: string; pinch?: number; o?: number }) {
  return (
    <G fill="none" stroke={color}>
      {Array.from({ length: rings }, (_, i) => {
        const k = Math.pow((i + 1) / rings, pinch);
        return <Circle key={i} cx={C} cy={C} r={r0 + (r1 - r0) * k} strokeOpacity={o * (0.45 + 0.55 * (1 - k))} strokeWidth={0.8} />;
      })}
      {Array.from({ length: spokes }, (_, i) => {
        const a = polar(r0, (360 / spokes) * i);
        const b = polar(r1, (360 / spokes) * i);
        return <Line key={`s${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} strokeOpacity={o * 0.6} strokeWidth={0.7} />;
      })}
    </G>
  );
}

// ————————————————————————————————————————————————————— comuns

/** Halo de Lente — a luz de trás, dobrada em dois arcos em volta do corpo. */
const HaloLente: LensRender = (p) => (
  <FxExtent r={p.r + 30}>
    <Breathe period={4800} opacity={[0.6, 1]} scale={[0.98, 1.03]}>
      <G fill="none" strokeLinecap="round">
        <Path d={arc(p.r + 20, 196, 344)} stroke={W} strokeOpacity={0.75} strokeWidth={1.6} />
        <Path d={arc(p.r + 20, 16, 164)} stroke={p.v.color} strokeOpacity={0.8} strokeWidth={1.6} />
        <Path d={arc(p.r + 25, 214, 326)} stroke={p.v.color} strokeOpacity={0.4} strokeWidth={0.8} />
        <Path d={arc(p.r + 25, 34, 146)} stroke={W} strokeOpacity={0.3} strokeWidth={0.8} />
      </G>
    </Breathe>
  </FxExtent>
);

/** Ondulações — anéis que saem do corpo e se desfazem, como numa água parada. */
const Ondas: LensRender = (p) => (
  <FxExtent r={104}>
    {[0, 0.33, 0.66].map((ph) => (
      <Wave key={ph} period={6000} phase={ph} from={p.r + 4} to={102} drawnAt={70} peak={0.5}>
        <Circle cx={C} cy={C} r={70} stroke={p.v.color} strokeWidth={1.3} fill="none" />
      </Wave>
    ))}
  </FxExtent>
);

/** Malha Plana — uma grade sob o corpo: o espaço, antes de ser dobrado. */
const Grade: LensRender = (p) => (
  <Plane tilt={TILT} squash={0.3}>
    <FxExtent r={106}>
      <Spin period={90000}>
        <Mesh r0={p.r + 8} r1={104} rings={6} spokes={16} color={p.v.color} pinch={1} o={0.5} />
      </Spin>
    </FxExtent>
  </Plane>
);

/** Penumbra — uma sombra larga em volta do corpo, com uma borda de luz. */
const Sombra: LensRender = (p) => (
  <FxExtent r={p.r + 34}>
    <Breathe period={5600} opacity={[0.7, 1]}>
      <Circle cx={C} cy={C} r={p.r + 24} fill="#02030A" fillOpacity={0.6} />
      <Circle cx={C} cy={C} r={p.r + 24} stroke={p.v.color} strokeOpacity={0.7} strokeWidth={1.1} fill="none" />
      <Circle cx={C} cy={C} r={p.r + 28} stroke={W} strokeOpacity={0.2} strokeWidth={0.6} fill="none" strokeDasharray="2 6" />
    </Breathe>
  </FxExtent>
);

// ————————————————————————————————————————————————————— incomuns

/** Poço Gravitacional — a malha afunda perto do corpo: quanto mais perto, mais apertada. */
const Poco: LensRender = (p) => (
  <Plane tilt={TILT} squash={0.34}>
    <FxExtent r={108}>
      <Breathe period={6200} opacity={[0.7, 1]} scale={[0.985, 1.02]}>
        <Mesh r0={p.r * 0.5} r1={106} rings={9} spokes={18} color={p.v.color} pinch={2.2} o={0.7} />
        <Circle cx={C} cy={C} r={106} stroke={c2(p)} strokeOpacity={0.5} strokeWidth={1.1} fill="none" />
      </Breathe>
    </FxExtent>
  </Plane>
);

/** Anel de Einstein — alinhamento perfeito: a luz de trás vira um anel inteiro, com quatro imagens. */
const AnelEinstein: LensRender = (p) => (
  <FxExtent r={p.r + 34}>
    <Breathe period={4400} opacity={[0.65, 1]}>
      <Circle cx={C} cy={C} r={p.r + 22} stroke={p.v.color} strokeOpacity={0.35} strokeWidth={5} fill="none" />
      <Circle cx={C} cy={C} r={p.r + 22} stroke={W} strokeOpacity={0.85} strokeWidth={1.2} fill="none" />
    </Breathe>
    <Spin period={60000}>
      {[0, 90, 180, 270].map((d) => {
        const a = polar(p.r + 22, d);
        return (
          <G key={d}>
            <Circle cx={a.x} cy={a.y} r={5} fill={c2(p)} fillOpacity={0.3} />
            <Polygon points={`${a.x},${a.y - 4} ${a.x + 1.4},${a.y - 1.4} ${a.x + 4},${a.y} ${a.x + 1.4},${a.y + 1.4} ${a.x},${a.y + 4} ${a.x - 1.4},${a.y + 1.4} ${a.x - 4},${a.y} ${a.x - 1.4},${a.y - 1.4}`} fill={W} />
          </G>
        );
      })}
    </Spin>
  </FxExtent>
);

/** Bojo de Maré — o espaço se estica num eixo e se aperta no outro, alternando. */
const MareLente: LensRender = (p) => (
  <FxExtent r={p.r + 44}>
    <Breathe period={4200} scale={[0.9, 1.08]} opacity={[0.5, 0.9]}>
      <Ellipse cx={C} cy={C} rx={p.r + 38} ry={p.r + 12} stroke={p.v.color} strokeWidth={1.4} fill="none" transform={`rotate(${TILT} ${C} ${C})`} />
      <Ellipse cx={C} cy={C} rx={p.r + 30} ry={p.r + 8} stroke={W} strokeOpacity={0.4} strokeWidth={0.7} fill="none" transform={`rotate(${TILT} ${C} ${C})`} />
    </Breathe>
    <Breathe period={4200} phase={0.5} scale={[0.9, 1.08]} opacity={[0.5, 0.9]}>
      <Ellipse cx={C} cy={C} rx={p.r + 12} ry={p.r + 38} stroke={c2(p)} strokeWidth={1.4} fill="none" transform={`rotate(${TILT} ${C} ${C})`} />
    </Breathe>
  </FxExtent>
);

/** Órbitas de Kepler — três elipses com o corpo num dos focos; em cada uma, um ponto que acelera ao chegar perto. */
const OrbitasKepler: LensRender = (p) => (
  <>
    <FxExtent r={110}>
      <Layer>
        <G fill="none" stroke={p.v.color} strokeOpacity={0.6} strokeWidth={0.9} strokeDasharray="3 4">
          <Ellipse cx={C + 22} cy={C} rx={62} ry={40} transform={`rotate(-20 ${C} ${C})`} />
          <Ellipse cx={C - 30} cy={C} rx={74} ry={38} transform={`rotate(38 ${C} ${C})`} />
          <Ellipse cx={C + 12} cy={C} rx={50} ry={46} transform={`rotate(80 ${C} ${C})`} />
        </G>
        <Polygon points={`${C},${C} ${C + 62},${C - 34} ${C + 80},${C - 8}`} fill={c2(p)} fillOpacity={0.14} transform={`rotate(-20 ${C} ${C})`} />
      </Layer>
    </FxExtent>
    <Particles mode="orbit" count={1} period={9000} colors={[W]} size={[3, 3]} radius={[58, 58]} tilt={0.68} plane={-20} trail={5} seed={3} />
    <Particles mode="orbit" count={1} period={13000} colors={[c2(p)]} size={[3, 3]} radius={[66, 66]} tilt={0.56} plane={38} trail={5} reverse seed={5} />
  </>
);

/** Cisalhamento — pequenos arcos tangentes, todos alinhados em volta do corpo: a marca de uma lente fraca. */
const Cisalhamento: LensRender = (p) => (
  <FxExtent r={108}>
    <Spin period={70000}>
      <G fill="none" stroke={p.v.color} strokeLinecap="round">
        {[0, 1, 2].map((row) =>
          Array.from({ length: 10 + row * 4 }, (_, i) => {
            const r = p.r + 14 + row * 20;
            const d = (360 / (10 + row * 4)) * i + row * 9;
            return <Path key={`${row}-${i}`} d={arc(r, d, d + 14 - row * 3)} strokeOpacity={0.75 - row * 0.2} strokeWidth={1.8 - row * 0.4} />;
          }),
        )}
      </G>
    </Spin>
  </FxExtent>
);

// ————————————————————————————————————————————————————— raros

/** Ondas Gravitacionais — braços em espiral que se abrem no plano: o espaço tremendo. */
const OndasG: LensRender = (p) => (
  <Plane tilt={TILT} squash={0.36}>
    <FxExtent r={110}>
      <Spin period={9000} reverse>
        <G fill="none" strokeLinecap="round">
          <Path d={spiral(p.r + 4, 106, 1.6, 0, 80)} stroke={p.v.color} strokeOpacity={0.75} strokeWidth={2} />
          <Path d={spiral(p.r + 4, 106, 1.6, 180, 80)} stroke={c2(p)} strokeOpacity={0.75} strokeWidth={2} />
        </G>
      </Spin>
      {[0, 0.5].map((ph) => (
        <Wave key={ph} period={4500} phase={ph} from={p.r} to={108} drawnAt={70} peak={0.4}>
          <Circle cx={C} cy={C} r={70} stroke={W} strokeWidth={1} fill="none" />
        </Wave>
      ))}
    </FxExtent>
  </Plane>
);

/** Pontos de Lagrange — cinco lugares onde as forças se equilibram, e as curvas de nível em volta deles. */
const Lagrange: LensRender = (p) => {
  const pts = [polar(64, 90), polar(104, 90), polar(84, 270), polar(84, 30), polar(84, 150)];
  return (
    <FxExtent r={112}>
      <Spin period={80000}>
        <G fill="none" stroke={p.v.color} strokeOpacity={0.55} strokeWidth={0.9}>
          <Circle cx={C} cy={C} r={84} strokeDasharray="2 5" />
          <Path d={`M${C + 40} ${C} C${C + 60} ${C - 34} ${C + 104} ${C - 22} ${C + 104} ${C} C${C + 104} ${C + 22} ${C + 60} ${C + 34} ${C + 40} ${C} Z`} />
          <Path d={`M${C - 20} ${C - 50} C${C - 80} ${C - 90} ${C - 108} ${C - 20} ${C - 96} ${C} C${C - 108} ${C + 20} ${C - 80} ${C + 90} ${C - 20} ${C + 50}`} />
        </G>
        {pts.map((q, i) => (
          <G key={i}>
            <Circle cx={q.x} cy={q.y} r={5.4} fill={c2(p)} fillOpacity={0.2} />
            <Path d={`M${q.x - 3.4} ${q.y} H${q.x + 3.4} M${q.x} ${q.y - 3.4} V${q.y + 3.4}`} stroke={i > 2 ? W : c2(p)} strokeWidth={1.2} strokeLinecap="round" />
          </G>
        ))}
        <Circle cx={polar(84, 90).x} cy={polar(84, 90).y} r={3} fill={p.v.color} />
      </Spin>
    </FxExtent>
  );
};

/** Arrasto de Referenciais — o corpo gira e arrasta a malha junto: os raios viram espirais. */
const Arrasto: LensRender = (p) => (
  <Plane tilt={TILT} squash={0.34}>
    <FxExtent r={108}>
      <Spin period={22000}>
        <G fill="none" stroke={p.v.color} strokeLinecap="round">
          {Array.from({ length: 12 }, (_, i) => (
            <Path key={i} d={spiral(p.r * 0.6, 104, 0.5, i * 30, 30)} strokeOpacity={0.6} strokeWidth={0.9} />
          ))}
        </G>
      </Spin>
      <Layer>
        <G fill="none" stroke={c2(p)}>
          {[0.3, 0.55, 0.8, 1].map((k) => (
            <Circle key={k} cx={C} cy={C} r={p.r * 0.6 + (104 - p.r * 0.6) * k * k} strokeOpacity={0.45} strokeWidth={0.7} />
          ))}
        </G>
      </Layer>
    </FxExtent>
  </Plane>
);

/** Cone de Luz — passado embaixo, futuro em cima: tudo o que pode tocar o corpo cabe nessa ampulheta. */
const ConeLuz: LensRender = (p) => (
  <FxExtent r={112}>
    <Breathe period={5200} opacity={[0.55, 0.95]}>
      <G fill="none" stroke={p.v.color} strokeWidth={1} transform={`rotate(${TILT} ${C} ${C})`}>
        <Ellipse cx={C} cy={C - 92} rx={62} ry={14} />
        <Ellipse cx={C} cy={C + 92} rx={62} ry={14} stroke={c2(p)} />
        <Ellipse cx={C} cy={C - 46} rx={31} ry={7} strokeOpacity={0.5} />
        <Ellipse cx={C} cy={C + 46} rx={31} ry={7} strokeOpacity={0.5} stroke={c2(p)} />
        <Path d={`M${C - 62} ${C - 92} L${C + 62} ${C + 92} M${C + 62} ${C - 92} L${C - 62} ${C + 92}`} strokeOpacity={0.8} />
        <Polygon points={`${C - 62},${C - 92} ${C + 62},${C - 92} ${C},${C}`} fill={p.v.color} fillOpacity={0.07} stroke="none" />
        <Polygon points={`${C - 62},${C + 92} ${C + 62},${C + 92} ${C},${C}`} fill={c2(p)} fillOpacity={0.07} stroke="none" />
      </G>
    </Breathe>
  </FxExtent>
);

// ————————————————————————————————————————————————————— épicos

/** Bolha de Dobra — o espaço se aperta na frente e se estica atrás: o corpo não se move, o espaço é que passa. */
const Dobra: LensRender = (p) => (
  <>
    <FxExtent r={112}>
      <Breathe period={3000} opacity={[0.6, 1]} scale={[0.98, 1.03]}>
        <G fill="none" strokeLinecap="round" transform={`rotate(${TILT} ${C} ${C})`}>
          {[0, 1, 2, 3].map((i) => (
            <Path key={`f${i}`} d={arc(p.r + 12 + i * 5, 52 - i * 4, 128 + i * 4)} stroke={W} strokeOpacity={0.9 - i * 0.18} strokeWidth={2 - i * 0.3} />
          ))}
          {[0, 1, 2, 3].map((i) => (
            <Path key={`b${i}`} d={arc(p.r + 16 + i * 16, 238 - i * 6, 302 + i * 6)} stroke={p.v.color} strokeOpacity={0.7 - i * 0.14} strokeWidth={1.4} />
          ))}
          <Ellipse cx={C} cy={C} rx={p.r + 30} ry={p.r + 14} stroke={c2(p)} strokeOpacity={0.5} strokeWidth={0.9} strokeDasharray="3 5" />
        </G>
      </Breathe>
    </FxExtent>
    <Particles mode="streak" count={12} period={1500} colors={[W, p.v.color]} size={[1.2, 2]} radius={[p.r + 14, 100]} travel={116} plane={TILT + 180} trail={6} seed={7} />
  </>
);

/** Cáusticas — onde a luz dobrada se junta: uma curva de quatro pontas que respira. */
const Caustica: LensRender = (p) => {
  const astroid = (a: number) => {
    let d = '';
    for (let i = 0; i <= 64; i++) {
      const t = (i / 64) * Math.PI * 2;
      d += `${i ? 'L' : 'M'}${(C + a * Math.pow(Math.cos(t), 3)).toFixed(1)} ${(C + a * Math.pow(Math.sin(t), 3)).toFixed(1)} `;
    }
    return `${d}Z`;
  };
  return (
    <>
      <FxExtent r={110}>
        <Layer>
          <Path d={astroid(104)} stroke={p.v.color} strokeWidth={1.4} fill={p.v.color} fillOpacity={0.06} strokeLinejoin="round" />
        </Layer>
        <Spin period={52000}>
          <G transform={`rotate(45 ${C} ${C})`}>
            <Path d={astroid(78)} stroke={c2(p)} strokeWidth={1.1} fill="none" strokeLinejoin="round" />
          </G>
        </Spin>
        <Breathe period={3600} scale={[0.8, 1.06]} opacity={[0.5, 1]}>
          <Path d={astroid(p.r + 26)} stroke={W} strokeWidth={1.2} fill="none" strokeLinejoin="round" />
        </Breathe>
        {[0, 90, 180, 270].map((d, i) => {
          const a = polar(104, d);
          return (
            <Glimmer key={d} period={3600} phase={i / 4} window={0.4} peak={1}>
              <Circle cx={a.x} cy={a.y} r={3} fill={W} />
              <Circle cx={a.x} cy={a.y} r={7} fill={p.v.color} fillOpacity={0.3} />
            </Glimmer>
          );
        })}
      </FxExtent>
    </>
  );
};

/** Dilatação do Tempo — três anéis de marcas: quanto mais perto do corpo, mais devagar o relógio anda. */
const Tempo: LensRender = (p) => (
  <FxExtent r={110}>
    {(
      [
        [104, 9000, 60, 1],
        [82, 21000, 44, 0.8],
        [p.r + 20, 54000, 30, 0.6],
      ] as const
    ).map(([r, period, n, o], i) => (
      <Spin key={i} period={period}>
        <G stroke={i === 1 ? c2(p) : p.v.color} strokeLinecap="round">
          {Array.from({ length: n }, (_, k) => {
            const major = k % 5 === 0;
            const a = polar(r - (major ? 6 : 3), (360 / n) * k);
            const b = polar(r, (360 / n) * k);
            return <Line key={k} x1={a.x} y1={a.y} x2={b.x} y2={b.y} strokeOpacity={major ? o : o * 0.5} strokeWidth={major ? 1.4 : 0.8} />;
          })}
        </G>
        <Polygon points={`${C},${C - r - 5} ${C - 3},${C - r + 1} ${C + 3},${C - r + 1}`} fill={W} />
      </Spin>
    ))}
  </FxExtent>
);

// ————————————————————————————————————————————————————— lendários

/** Tecido do Espaço-Tempo — a malha inteira, viva: afunda, gira, ondula e arrasta as estrelas com ela. */
const Tecido: LensRender = (p) => (
  <>
    <Plane tilt={TILT} squash={0.36}>
      <FxExtent r={114}>
        <Spin period={48000}>
          <Mesh r0={p.r * 0.4} r1={112} rings={11} spokes={24} color={p.v.color} pinch={2.4} o={0.75} />
          <G fill="none" strokeLinecap="round">
            {[0, 120, 240].map((d) => (
              <Path key={d} d={spiral(p.r * 0.5, 110, 0.7, d, 40)} stroke={c2(p)} strokeOpacity={0.6} strokeWidth={1.2} />
            ))}
          </G>
        </Spin>
        {[0, 0.33, 0.66].map((ph) => (
          <Wave key={ph} period={4800} phase={ph} from={p.r * 0.6} to={112} drawnAt={70} peak={0.55}>
            <Circle cx={C} cy={C} r={70} stroke={W} strokeWidth={1.3} fill="none" />
          </Wave>
        ))}
        <Layer>
          <Circle cx={C} cy={C} r={112} stroke={c2(p)} strokeOpacity={0.6} strokeWidth={1.2} fill="none" />
        </Layer>
      </FxExtent>
    </Plane>
    <Particles mode="spiral" count={12} period={7000} colors={[W, p.v.color, c2(p)]} size={[1.6, 3]} radius={[p.r * 0.6, 108]} tilt={0.36} plane={TILT} turns={1.5} seed={9} />
    <Extra min={0.8}>
      <Particles mode="twinkle" count={8} period={3400} colors={[W]} size={[1.8, 3]} radius={[60, 112]} sparkle seed={11} />
    </Extra>
  </>
);

/** Lente do Multiverso — cada anel é o mesmo céu visto de outro lugar: ecos que giram uns contra os outros. */
const Multiverso: LensRender = (p) => (
  <>
    <FxExtent r={114}>
      {(
        [
          [-9, -5, 96, 40000, false],
          [8, 4, 84, 31000, true],
          [-4, 9, 72, 24000, false],
          [5, -8, 60, 18000, true],
        ] as const
      ).map(([dx, dy, r, period, rev], i) => (
        <Spin key={i} period={period} reverse={rev}>
          <G transform={`translate(${dx} ${dy})`} fill="none" strokeLinecap="round">
            <Circle cx={C} cy={C} r={r} stroke={i % 2 ? c2(p) : p.v.color} strokeOpacity={0.3} strokeWidth={4} />
            <Path d={arc(r, 10, 120)} stroke={i % 2 ? c2(p) : p.v.color} strokeWidth={1.6} />
            <Path d={arc(r, 190, 250)} stroke={W} strokeOpacity={0.8} strokeWidth={1} />
            <Circle cx={polar(r, 10).x} cy={polar(r, 10).y} r={2.4} fill={W} />
          </G>
        </Spin>
      ))}
      {[0, 0.5].map((ph) => (
        <Wave key={ph} period={5200} phase={ph} from={112} to={p.r + 6} drawnAt={70} peak={0.5}>
          <Polygon points={`${C},${C - 70} ${C + 60.6},${C + 35} ${C - 60.6},${C + 35}`} stroke={W} strokeWidth={1.1} fill="none" />
        </Wave>
      ))}
    </FxExtent>
    <Particles mode="lemniscate" count={6} period={9000} colors={[W, p.v.color, c2(p)]} size={[1.8, 3]} radius={[104, 104]} tilt={0.7} plane={30} trail={4} glow seed={13} />
    <Extra min={0.8}>
      <Particles mode="twinkle" count={9} period={3000} colors={[W, p.v.color]} size={[1.8, 3]} radius={[52, 112]} sparkle seed={15} />
    </Extra>
  </>
);

export const LENSES: Record<string, LensRender> = {
  'halo-lente': HaloLente,
  ondas: Ondas,
  grade: Grade,
  sombra: Sombra,
  poco: Poco,
  'anel-einstein': AnelEinstein,
  'mare-lente': MareLente,
  'orbitas-kepler': OrbitasKepler,
  cisalhamento: Cisalhamento,
  'ondas-g': OndasG,
  lagrange: Lagrange,
  arrasto: Arrasto,
  'cone-luz': ConeLuz,
  dobra: Dobra,
  caustica: Caustica,
  tempo: Tempo,
  tecido: Tecido,
  multiverso: Multiverso,
};

export function LensFx(p: LensProps) {
  const Render = p.v.fx ? LENSES[p.v.fx] : undefined;
  return Render ? <Render {...p} /> : null;
}
