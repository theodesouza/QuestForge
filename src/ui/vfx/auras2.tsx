/**
 * Auras da segunda leva — cada uma com movimento e padrão próprios:
 *   Pétalas       (comum)    pétalas caindo diante do astrolábio + coroa de pétalas girando
 *   Cinzas        (comum)    brasa morna no chão e cinzas subindo
 *   Vagalumes     (incomum)  lanternas verdes à deriva e brilhos que acendem
 *   Neve          (incomum)  geada em anel, flocos girando e neve caindo
 *   Elétrica      (raro)     arcos que acendem em sequência, pulsos e esferas de plasma
 *   Constelações  (épico)    redes de estrelas girando em sentidos opostos e uma estrela cadente
 * `Back` fica atrás do disco do astrolábio; `Front`, na frente.
 */
import { Circle, Ellipse, G, Path, Polygon, Polyline } from 'react-native-svg';
import { Breathe, C, Extra, Glimmer, Layer, Particles, Spin, Wave } from './engine';
import { lightning, polar, star } from './geometry';
import { HaloRing, useGid, type AuraFx } from './kit';

// ——————————————————————————————————————————————— comum

export const Petalas: AuraFx = {
  Back: ({ v }) => {
    const h = useGid('ph');
    return (
      <>
        <Breathe period={4600} opacity={[0.6, 1]}>
          <HaloRing id={h} color={v.color} color2={v.color2} r0={82} r1={110} opacity={0.24} />
        </Breathe>
        <Spin period={64000}>
          <G fill={v.color} fillOpacity={0.8}>
            {Array.from({ length: 10 }, (_, i) => {
              const p = polar(94, i * 36);
              return <Ellipse key={i} cx={p.x} cy={p.y} rx={8.4} ry={3.8} transform={`rotate(${i * 36 + (i % 2 ? 24 : -24)} ${p.x} ${p.y})`} />;
            })}
          </G>
        </Spin>
      </>
    );
  },
  Front: ({ v }) => (
    <>
      <Particles mode="fall" count={7} period={7200} colors={[v.color, v.color2 ?? v.color, '#FFFFFF']} size={[4, 6]} radius={[40, 104]} arc={[-85, 85]} travel={150} seed={301} />
      <Extra>
        <Particles mode="fall" count={4} period={9000} colors={[v.color2 ?? v.color]} size={[2.4, 3.4]} radius={[60, 110]} arc={[-90, 90]} travel={170} phaseShift={0.4} seed={302} />
      </Extra>
    </>
  ),
};

export const Cinzas: AuraFx = {
  Back: ({ v }) => {
    const h = useGid('zh');
    return (
      <>
        <Layer>
          <HaloRing id={h} color={v.color} color2={v.color2} r0={80} r1={108} opacity={0.26} />
        </Layer>
        <Breathe period={3600} opacity={[0.3, 0.85]}>
          <Circle cx={C} cy={C} r={90} stroke={v.color2} strokeWidth={2} strokeDasharray="2 7" strokeLinecap="round" fill="none" />
        </Breathe>
        <Extra>
          <Breathe period={3600} phase={0.5} opacity={[0.25, 0.7]}>
            <Circle cx={C} cy={C} r={95} stroke={v.color} strokeWidth={1.4} strokeDasharray="1 9" strokeLinecap="round" fill="none" />
          </Breathe>
        </Extra>
      </>
    );
  },
  Front: ({ v }) => (
    <>
      <Particles mode="rise" count={6} period={5600} colors={['#C9CDE0', v.color, v.color2 ?? v.color]} size={[2, 3.4]} radius={[84, 100]} arc={[90, 270]} travel={95} seed={311} />
      <Extra>
        <Particles mode="rise" count={4} period={7000} colors={['#FFB38A', v.color2 ?? v.color]} size={[1.6, 2.4]} radius={[84, 100]} arc={[100, 260]} travel={110} glow phaseShift={0.5} seed={312} />
      </Extra>
    </>
  ),
};

// ——————————————————————————————————————————————— incomum

export const Vagalumes: AuraFx = {
  Back: ({ v }) => {
    const h = useGid('gh');
    return (
      <Breathe period={5200} opacity={[0.5, 1]}>
        <HaloRing id={h} color={v.color} color2={v.color2} r0={82} r1={112} opacity={0.34} />
      </Breathe>
    );
  },
  Front: ({ v }) => (
    <>
      <Particles mode="orbit" count={7} period={14000} colors={[v.color, v.color2 ?? v.color, '#F4FFD0']} size={[4, 5.6]} radius={[90, 112]} tilt={0.85} plane={15} glow seed={321} />
      <Particles mode="twinkle" count={7} period={3800} colors={[v.color, '#F4FFD0']} size={[3, 4.4]} radius={[88, 116]} sparkle seed={322} />
    </>
  ),
};

export const Neve: AuraFx = {
  Back: ({ v }) => {
    const h = useGid('vh');
    return (
      <>
        <Layer>
          <HaloRing id={h} color={v.color} color2={v.color2} r0={82} r1={112} opacity={0.3} />
        </Layer>
        <Spin period={58000} reverse>
          <Circle cx={C} cy={C} r={97} stroke={v.color} strokeOpacity={0.6} strokeWidth={1} strokeDasharray="0.5 6" strokeLinecap="round" fill="none" />
        </Spin>
        <Spin period={72000}>
          <G fill={v.color} fillOpacity={0.85}>
            {[0, 60, 120, 180, 240, 300].map((deg) => {
              const p = polar(104, deg);
              return <Polygon key={deg} points={star(6, 6.5, 2.2, deg).replace(/([\d.]+),([\d.]+)/g, (_, x, y) => `${(Number(x) - C + p.x).toFixed(2)},${(Number(y) - C + p.y).toFixed(2)}`)} />;
            })}
          </G>
        </Spin>
      </>
    );
  },
  Front: ({ v }) => (
    <>
      <Particles mode="fall" count={9} period={6400} colors={['#FFFFFF', v.color, v.color2 ?? v.color]} size={[2.2, 3.6]} radius={[30, 108]} arc={[-90, 90]} travel={150} seed={331} />
      <Extra>
        <Particles mode="twinkle" count={5} period={3200} colors={['#FFFFFF']} size={[3, 4.2]} radius={[90, 116]} sparkle seed={332} />
      </Extra>
    </>
  ),
};

// ——————————————————————————————————————————————— raro

export const Eletrica: AuraFx = {
  Back: ({ v }) => {
    const h = useGid('eh');
    return (
      <>
        <Breathe period={2600} opacity={[0.55, 1]}>
          <HaloRing id={h} color={v.color} color2={v.color2} r0={82} r1={114} opacity={0.3} />
        </Breathe>
        <Wave period={3000} from={84} to={118} drawnAt={100} peak={0.5}>
          <Circle cx={C} cy={C} r={100} stroke={v.color} strokeWidth={1.4} fill="none" />
        </Wave>
        <Spin period={22000}>
          <Circle cx={C} cy={C} r={97} stroke={v.color} strokeOpacity={0.7} strokeWidth={1.3} strokeDasharray="7 5" strokeLinecap="round" fill="none" />
        </Spin>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Extra key={i} min={i % 2 ? 0.5 : 0}>
            <Glimmer period={3600} phase={i / 6} window={0.2} peak={0.95}>
              <Polyline points={lightning(i * 60 + 18, 86, 114, 6, 7, 400 + i * 17)} stroke={v.color} strokeOpacity={0.55} strokeWidth={4} fill="none" strokeLinejoin="round" strokeLinecap="round" />
              <Polyline points={lightning(i * 60 + 18, 86, 114, 6, 7, 400 + i * 17)} stroke="#F4FEFF" strokeWidth={1.4} fill="none" strokeLinejoin="round" strokeLinecap="round" />
            </Glimmer>
          </Extra>
        ))}
      </>
    );
  },
  Front: ({ v }) => (
    <>
      <Particles mode="orbit" count={2} period={5200} colors={['#F4FEFF', v.color]} size={[5, 6]} radius={[104, 106]} tilt={0.9} plane={0} glow seed={341} />
      <Particles mode="radial" count={6} period={2800} colors={[v.color, v.color2 ?? v.color, '#FFFFFF']} size={[2, 3.2]} radius={[88, 100]} travel={26} sparkle seed={342} />
    </>
  ),
};

// ——————————————————————————————————————————————— épico

const NET_A = [
  [100, 10],
  [108, 42],
  [96, 76],
  [110, 112],
  [100, 150],
  [108, 188],
  [96, 226],
  [110, 262],
  [100, 300],
  [108, 332],
] as const;
const NET_B = [
  [104, 28],
  [94, 94],
  [108, 168],
  [98, 244],
  [108, 316],
] as const;

function Net({ nodes, color, node, links }: { nodes: readonly (readonly [number, number])[]; color: string; node: string; links: [number, number][] }) {
  const pts = nodes.map(([r, deg]) => polar(r, deg));
  return (
    <>
      <G stroke={color} strokeOpacity={0.55} strokeWidth={0.9} strokeLinecap="round">
        {links.map(([a, b], i) => (
          <Path key={i} d={`M${pts[a].x.toFixed(1)} ${pts[a].y.toFixed(1)} L${pts[b].x.toFixed(1)} ${pts[b].y.toFixed(1)}`} />
        ))}
      </G>
      <G fill={node}>
        {pts.map((p, i) => (
          <G key={i}>
            <Circle cx={p.x} cy={p.y} r={4.6} fillOpacity={0.2} />
            <Circle cx={p.x} cy={p.y} r={i % 3 === 0 ? 2.4 : 1.7} />
          </G>
        ))}
      </G>
    </>
  );
}

export const Constelacao: AuraFx = {
  Back: ({ v }) => {
    const h = useGid('kh');
    return (
      <>
        <Breathe period={5400} opacity={[0.55, 1]}>
          <HaloRing id={h} color={v.color} color2={v.color2} r0={82} r1={116} opacity={0.26} />
        </Breathe>
        <Spin period={90000}>
          <Net
            nodes={NET_A}
            color={v.color}
            node="#FFFFFF"
            links={[
              [0, 1],
              [1, 2],
              [2, 3],
              [3, 4],
              [4, 5],
              [5, 6],
              [6, 7],
              [7, 8],
              [8, 9],
              [9, 0],
              [1, 8],
              [3, 6],
            ]}
          />
        </Spin>
        <Extra>
          <Spin period={130000} reverse>
            <Net
              nodes={NET_B}
              color={v.color2 ?? v.color}
              node={v.color2 ?? '#FFD36B'}
              links={[
                [0, 1],
                [1, 2],
                [2, 3],
                [3, 4],
                [4, 0],
              ]}
            />
          </Spin>
        </Extra>
        <Wave period={5200} from={84} to={120} drawnAt={100} peak={0.4} hold={0.3}>
          <Circle cx={C} cy={C} r={100} stroke={v.color} strokeWidth={1.2} fill="none" />
        </Wave>
      </>
    );
  },
  Front: ({ v }) => (
    <>
      <Particles mode="twinkle" count={9} period={3400} colors={['#FFFFFF', v.color2 ?? v.color, v.color]} size={[3, 4.8]} radius={[86, 118]} sparkle seed={351} />
      <Particles mode="orbit" count={1} period={9000} colors={['#FFF6D6']} size={[5, 5]} radius={[112, 112]} tilt={0.35} plane={-30} glow seed={1} trail={5} />
    </>
  ),
};
