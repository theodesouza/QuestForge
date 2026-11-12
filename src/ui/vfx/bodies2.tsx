/**
 * Corpos novos do Áster (espaço `core`). Cinco famílias, cada peça com estrutura própria:
 *   estrelas       plasma com granulação girando, coroa, arcos, raios, pulsos
 *   mundos         superfície e nuvens em velocidades diferentes, atmosfera, clima
 *   singularidades sombra, anel de fótons e disco de acreção que passa por trás e pela frente
 *   nebulosas      nuvens em camadas girando em sentidos opostos, sem borda dura
 *   máquinas       cascas, reatores e formas impossíveis
 *
 * A raridade é estrutura: comum (corpo + um movimento), incomum (+ um traço), raro (+ silhueta e
 * partículas), épico (+ sistema secundário), lendário (+ comportamento que só ele tem).
 * Todo corpo cabe no raio do Áster (`r`, que cresce com o nível).
 */
import type { ReactNode } from 'react';
import { Circle, Defs, Ellipse, G, Line, LinearGradient, Path, Polygon, RadialGradient, Rect, Stop } from 'react-native-svg';
import type { BodyProps, BodyRender } from './bodies';
import { Breathe, C, Extra, FxExtent, Glimmer, Layer, Particles, Spin, Wave } from './engine';
import { arc, lightning, ngon, polar, ray, spiral } from './geometry';
import { Glow, useGid } from './kit';
import { Orb, Orbiter, Plane } from './space';
import { Bands, Blotches, Caps, Cracks, Craters, Halves, Lands, Lattice, Lights, Tile, Wash } from './textures';

const W = '#FFFFFF';
const INK = '#04060F';

// ————————————————————————————————————————————————————— peças comuns

/** Halo de luz que respira em volta do corpo. */
function Corona({ color, r, size = 1.75, opacity = 0.55, period = 4200 }: { color: string; r: number; size?: number; opacity?: number; period?: number }) {
  const id = useGid('co');
  return (
    <FxExtent r={r * size + 2}>
      <Breathe period={period} scale={[0.95, 1.05]} opacity={[0.6, 1]}>
        <Glow id={id} color={color} r={r * size} opacity={opacity} />
      </Breathe>
    </FxExtent>
  );
}

/** Raios de difração: cruz fina de luz (estrelas pequenas e muito quentes). */
function Spikes({ r, n = 4, length = 2.6, color = W, rotate = 0 }: { r: number; n?: number; length?: number; color?: string; rotate?: number }) {
  return (
    <FxExtent r={r * length + 2}>
      <Breathe period={3000} opacity={[0.55, 1]} scale={[0.94, 1.04]}>
        <G fill={color}>
          {Array.from({ length: n }, (_, i) => (
            <Polygon key={i} points={ray(rotate + (360 / n) * i, r * 0.5, r * length, 1.5)} fillOpacity={0.75} />
          ))}
        </G>
      </Breathe>
    </FxExtent>
  );
}

/** Arcos de plasma presos à borda (proeminências). */
function Loops({ r, color, at }: { r: number; color: string; at: number[] }) {
  return (
    <FxExtent r={r * 1.5}>
      <Breathe period={3600} opacity={[0.5, 0.95]} scale={[0.98, 1.03]}>
        <G fill="none" stroke={color} strokeLinecap="round">
          {at.map((deg, i) => {
            const a = polar(r * 0.98, deg - 9);
            const b = polar(r * 0.98, deg + 9);
            const top = polar(r * (1.24 + (i % 2) * 0.1), deg);
            return (
              <G key={deg}>
                <Path d={`M${a.x.toFixed(1)} ${a.y.toFixed(1)} Q${top.x.toFixed(1)} ${top.y.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`} strokeWidth={2.2} strokeOpacity={0.85} />
                <Path d={`M${a.x.toFixed(1)} ${a.y.toFixed(1)} Q${top.x.toFixed(1)} ${top.y.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`} stroke={W} strokeWidth={0.7} strokeOpacity={0.7} />
              </G>
            );
          })}
        </G>
      </Breathe>
    </FxExtent>
  );
}

/** Coroa de raios girando devagar. */
function Rays({ r, color, n, from = 1.05, to = 1.9, width = 3.2, period = 70000, opacity = 0.3, reverse = false }: { r: number; color: string; n: number; from?: number; to?: number; width?: number; period?: number; opacity?: number; reverse?: boolean }) {
  return (
    <FxExtent r={r * to + 2}>
      <Spin period={period} reverse={reverse}>
        <G fill={color} fillOpacity={opacity}>
          {Array.from({ length: n }, (_, i) => (
            <Polygon key={i} points={ray((360 / n) * i, r * from, r * (i % 2 ? to : to * 0.82), width)} />
          ))}
        </G>
      </Spin>
    </FxExtent>
  );
}

/** Granulação de estrela: manchas mais escuras e algumas mais claras. */
function grain(r: number, dark: string, n = 16, size: [number, number] = [5, 11], seed = 5): ReactNode {
  return (
    <Tile r={r}>
      <Blotches n={n} color={dark} seed={seed} size={size} opacity={0.42} />
      <Blotches n={Math.round(n / 2)} color={W} seed={seed + 3} size={[2, 5]} opacity={0.34} />
    </Tile>
  );
}

// ————————————————————————————————————————————————————— estrelas

interface StarOpts {
  /** Tamanho em relação ao raio do Áster. */
  size?: number;
  grainN?: number;
  grainSize?: [number, number];
  spin?: number;
  corona?: number;
  seed?: number;
}

function StarBody({ v, r, o, pulse }: { v: BodyProps['v']; r: number; o: StarOpts; pulse?: { period: number; scale: [number, number] } }) {
  return (
    <Orb
      r={r}
      lit={W}
      mid={v.color}
      dark={v.color2 ?? v.color}
      limb={0.2}
      atmosphere={v.color}
      atmosphereSize={0.34}
      surface={grain(r, v.color2 ?? v.color, o.grainN ?? 16, o.grainSize ?? [5, 11], o.seed ?? 5)}
      spin={o.spin ?? 26000}
      pulse={pulse}
    />
  );
}

/** Anã Vermelha — comum: pequena, fria, manchas grandes passando devagar. */
const AnaVermelha: BodyRender = ({ v, r }) => (
  <>
    <Corona color={v.color} r={r * 0.82} size={1.5} opacity={0.4} period={5200} />
    <StarBody v={v} r={r * 0.82} o={{ grainN: 9, grainSize: [8, 16], spin: 38000, seed: 11 }} />
  </>
);

/** Anã Marrom — comum: quase um mundo; faixas escuras, brilho fraco por dentro. */
const AnaMarrom: BodyRender = ({ v, r }) => (
  <>
    <Corona color={v.color} r={r * 0.9} size={1.35} opacity={0.28} period={6000} />
    <Orb
      r={r * 0.9}
      lit={v.color}
      mid={v.color2 ?? v.color}
      dark="#1A0C10"
      limb={0.5}
      atmosphere={v.color}
      atmosphereSize={0.2}
      surface={
        <Tile r={r * 0.9}>
          <Bands colors={[v.color2 ?? v.color, '#3A1620', v.color, '#2A1018', v.color2 ?? v.color, '#3A1620']} seed={4} wobble={3} />
          <Blotches n={4} color={W} seed={8} size={[3, 6]} opacity={0.18} />
        </Tile>
      }
      spin={30000}
    />
  </>
);

/** Brasa Estelar — comum: superfície quase apagada, com fissuras de luz. */
const BrasaEstelar: BodyRender = ({ v, r }) => (
  <>
    <Corona color={v.color} r={r * 0.9} size={1.45} opacity={0.34} period={3400} />
    <Orb
      r={r * 0.9}
      lit="#5A2A1C"
      mid="#2A1410"
      dark="#0D0706"
      limb={0.45}
      atmosphere={v.color}
      atmosphereSize={0.22}
      surface={
        <Tile r={r * 0.9}>
          <Cracks n={11} color={v.color} glow={v.color2 ?? v.color} seed={14} width={1.3} />
          <Blotches n={5} color={v.color} seed={17} size={[2, 4]} opacity={0.5} />
        </Tile>
      }
      spin={44000}
    />
  </>
);

/** Estrela Dourada — incomum: um sol calmo, com arcos de plasma na borda. */
const EstrelaDourada: BodyRender = ({ v, r }) => (
  <>
    <Corona color={v.color} r={r} size={1.8} />
    <StarBody v={v} r={r} o={{ grainN: 18, spin: 24000 }} />
    <Loops r={r} color={v.color} at={[38, 205, 300]} />
  </>
);

/** Anã Branca — incomum: minúscula e ofuscante; quatro raios de difração. */
const AnaBranca: BodyRender = ({ v, r }) => (
  <>
    <Corona color={v.color} r={r * 0.62} size={2.3} opacity={0.6} period={2600} />
    <Spikes r={r * 0.62} n={4} length={3.3} />
    <Orb r={r * 0.62} lit={W} mid={W} dark={v.color} limb={0.08} atmosphere={W} atmosphereSize={0.5} />
    <Particles mode="twinkle" count={3} period={3800} colors={[W, v.color]} size={[2, 3.4]} radius={[r * 0.9, r * 1.3]} sparkle seed={5} />
  </>
);

/** Gigante Azul — raro: enorme, coroa larga, seis raios e um vento de partículas. */
const GiganteAzul: BodyRender = ({ v, r }) => (
  <>
    <Corona color={v.color} r={r * 1.08} size={2} opacity={0.6} />
    <Rays r={r * 1.08} color={v.color} n={12} to={1.75} opacity={0.26} />
    <Spikes r={r * 1.08} n={6} length={2.05} color={W} rotate={15} />
    <StarBody v={v} r={r * 1.08} o={{ grainN: 22, grainSize: [3, 7], spin: 18000, seed: 23 }} />
    <Particles mode="radial" count={7} period={3200} colors={[W, v.color]} size={[1.8, 3]} radius={[r * 1.1, r * 2]} seed={31} />
  </>
);

/** Gigante Vermelha — rara: células de convecção imensas e um pulso lento, como uma respiração. */
const GiganteVermelha: BodyRender = ({ v, r }) => (
  <>
    <Corona color={v.color} r={r * 1.12} size={1.6} opacity={0.5} period={6400} />
    <StarBody v={v} r={r * 1.12} o={{ grainN: 7, grainSize: [12, 22], spin: 52000, seed: 41 }} pulse={{ period: 6400, scale: [0.96, 1.04] }} />
    <Loops r={r * 1.12} color={v.color} at={[120, 250]} />
    <Particles mode="rise" count={6} period={5200} colors={[v.color, '#FFD0A0']} size={[2, 3.6]} radius={[r * 0.9, r * 1.2]} travel={22} seed={43} />
  </>
);

/** Estrela Binária — rara: duas estrelas girando uma em torno da outra, trocando matéria. */
const Binaria: BodyRender = ({ v, r }) => {
  const mate = (half: 'back' | 'front') => (
    <Orbiter r={r * 1.02} squash={0.34} plane={-14} period={7200} box={r * 1.1} half={half} depth={[0.82, 1.1]} farAlpha={0.9}>
      <Circle cx={r * 0.55} cy={r * 0.55} r={r * 0.5} fill={v.color2 ?? v.color} fillOpacity={0.3} />
      <Circle cx={r * 0.55} cy={r * 0.55} r={r * 0.32} fill={v.color2 ?? v.color} />
      <Circle cx={r * 0.47} cy={r * 0.46} r={r * 0.17} fill={W} fillOpacity={0.85} />
    </Orbiter>
  );
  return (
    <>
      <Corona color={v.color} r={r * 0.8} size={1.7} />
      {mate('back')}
      <Particles mode="orbit" half="back" count={6} period={7200} colors={[v.color, W]} size={[1.6, 2.6]} radius={[r * 0.86, r * 1.02]} tilt={0.34} plane={-14} trail={2} seed={3} />
      <StarBody v={v} r={r * 0.72} o={{ grainN: 14, spin: 20000, seed: 7 }} />
      <Particles mode="orbit" half="front" count={6} period={7200} colors={[v.color, W]} size={[1.6, 2.6]} radius={[r * 0.86, r * 1.02]} tilt={0.34} plane={-14} trail={2} seed={3} />
      {mate('front')}
    </>
  );
};

/** Estrela de Nêutrons — rara: um ponto denso com laços de campo magnético e pulsos rápidos. */
const EstrelaNeutrons: BodyRender = ({ v, r }) => (
  <>
    <FxExtent r={r * 1.5}>
      <Breathe period={2400} opacity={[0.45, 0.9]}>
        <G fill="none" stroke={v.color} strokeWidth={1} strokeOpacity={0.7} transform={`rotate(-18 ${C} ${C})`}>
          {[0.5, 0.82, 1.14].map((k) => (
            <G key={k}>
              <Ellipse cx={C - r * k * 0.6} cy={C} rx={r * k * 0.6} ry={r * k * 0.95} />
              <Ellipse cx={C + r * k * 0.6} cy={C} rx={r * k * 0.6} ry={r * k * 0.95} />
            </G>
          ))}
        </G>
      </Breathe>
      <Wave period={1500} from={r * 0.5} to={r * 1.45} drawnAt={r} peak={0.55}>
        <Circle cx={C} cy={C} r={r} stroke={W} strokeWidth={1.2} fill="none" />
      </Wave>
    </FxExtent>
    <Corona color={v.color} r={r * 0.5} size={2} opacity={0.6} period={1500} />
    <Orb r={r * 0.5} lit={W} mid={v.color} dark={v.color2 ?? v.color} limb={0.15} atmosphere={W} atmosphereSize={0.4} surface={grain(r * 0.5, v.color2 ?? v.color, 10, [6, 10], 9)} spin={2600} />
  </>
);

/** Cefeida — épica: pulsa num período exato; a cada batida, um anel de luz mede a distância. */
const Cefeida: BodyRender = ({ v, r }) => (
  <>
    <FxExtent r={r * 2.3}>
      {[0, 0.5].map((ph) => (
        <Wave key={ph} period={3600} phase={ph} from={r} to={r * 2.2} drawnAt={r * 1.6} peak={0.6} hold={0.15}>
          <Circle cx={C} cy={C} r={r * 1.6} stroke={v.color} strokeWidth={1.6} fill="none" />
          <Circle cx={C} cy={C} r={r * 1.6 - 3} stroke={W} strokeOpacity={0.5} strokeWidth={0.6} fill="none" strokeDasharray="2 5" />
        </Wave>
      ))}
    </FxExtent>
    <Corona color={v.color} r={r} size={1.9} opacity={0.6} period={3600} />
    <Rays r={r} color={W} n={8} to={1.6} width={2} opacity={0.2} period={48000} />
    <StarBody v={v} r={r} o={{ grainN: 16, spin: 16000, seed: 51 }} pulse={{ period: 3600, scale: [0.88, 1.08] }} />
    <Loops r={r} color={v.color2 ?? v.color} at={[60, 180, 300]} />
    <Extra>
      <Particles mode="radial" count={8} period={3600} colors={[W, v.color]} size={[1.8, 2.8]} radius={[r, r * 2.1]} sparkle seed={53} />
    </Extra>
  </>
);

/** Magnetar — épico: linhas de campo cerradas e tremores que percorrem a crosta. */
const Magnetar: BodyRender = ({ v, r }) => (
  <>
    <FxExtent r={r * 2}>
      <Spin period={26000}>
        <G fill="none" stroke={v.color} strokeLinecap="round">
          {[0.7, 1.0, 1.3, 1.62].map((k, i) => (
            <G key={k} strokeOpacity={0.75 - i * 0.14} strokeWidth={1.3 - i * 0.2}>
              <Ellipse cx={C - r * k * 0.55} cy={C} rx={r * k * 0.55} ry={r * k} />
              <Ellipse cx={C + r * k * 0.55} cy={C} rx={r * k * 0.55} ry={r * k} />
            </G>
          ))}
        </G>
      </Spin>
      {[0, 0.33, 0.66].map((ph, i) => (
        <Glimmer key={ph} period={2700} phase={ph} window={0.22} peak={0.95}>
          <Path d={lightning(40 + i * 120, r * 0.62, r * 1.55, 6, 7, 60 + i)} stroke={W} strokeWidth={1.3} fill="none" strokeLinejoin="round" />
        </Glimmer>
      ))}
    </FxExtent>
    <Corona color={v.color} r={r * 0.6} size={2.1} opacity={0.6} period={1900} />
    <Orb
      r={r * 0.6}
      lit={W}
      mid={v.color}
      dark={v.color2 ?? v.color}
      limb={0.2}
      atmosphere={v.color}
      atmosphereSize={0.4}
      surface={
        <Tile r={r * 0.6}>
          <Cracks n={9} color={W} glow={v.color} seed={61} />
        </Tile>
      }
      spin={3400}
    />
    <Particles mode="helix" count={8} period={2600} colors={[W, v.color]} size={[1.6, 2.6]} radius={[r * 0.6, r * 0.6]} travel={r * 1.3} plane={-18} turns={2} seed={63} />
  </>
);

// ————————————————————————————————————————————————————— mundos

/** Lua de Basalto — comum: rocha nua e crateras; sem ar, a sombra é dura. */
const LuaRochosa: BodyRender = ({ v, r }) => (
  <Orb
    r={r * 0.92}
    lit="#E9E4DA"
    mid={v.color}
    dark={v.color2 ?? '#2A2C38'}
    limb={0.78}
    surface={
      <Tile r={r * 0.92}>
        <Blotches n={7} color="#000000" seed={3} size={[8, 16]} opacity={0.22} />
        <Craters n={13} seed={6} />
      </Tile>
    }
    spin={48000}
  />
);

/** Mundo Oceânico — comum: mar aberto e nuvens que correm mais rápido que a água. */
const MundoOceano: BodyRender = ({ v, r }) => (
  <Orb
    r={r}
    lit="#BFF2FF"
    mid={v.color}
    dark={v.color2 ?? '#0A2A5C'}
    limb={0.66}
    gloss={0.38}
    atmosphere="#8FD4FF"
    atmosphereSize={0.16}
    surface={
      <Tile r={r}>
        <Lands n={3} color="#2C8A66" seed={5} size={[5, 9]} />
        <Blotches n={6} color="#FFFFFF" seed={2} size={[4, 9]} opacity={0.1} />
      </Tile>
    }
    spin={40000}
    clouds={
      <Tile r={r}>
        <Blotches n={11} color="#FFFFFF" seed={9} size={[5, 13]} opacity={0.6} flat={0.3} />
      </Tile>
    }
    cloudSpin={26000}
  />
);

/** Mundo de Areia — comum: faixas de dunas e uma tempestade de poeira atravessando. */
const MundoDeserto: BodyRender = ({ v, r }) => (
  <Orb
    r={r}
    lit="#FFE9BE"
    mid={v.color}
    dark={v.color2 ?? '#5A2E14'}
    limb={0.64}
    atmosphere={v.color}
    atmosphereSize={0.14}
    surface={
      <Tile r={r}>
        <Bands colors={[v.color, '#E9B36A', v.color2 ?? v.color, '#F0C98A', v.color, '#C98A4A']} seed={7} wobble={4} />
        <Cracks n={5} color="#7A4520" seed={8} width={0.8} opacity={0.5} />
      </Tile>
    }
    spin={42000}
    clouds={
      <Tile r={r}>
        <Blotches n={4} color="#FFE2A8" seed={15} size={[10, 20]} opacity={0.34} flat={0.25} />
      </Tile>
    }
    cloudSpin={21000}
  />
);

/** Coração de Cometa — comum: gelo sujo e irregular, com uma cabeleira de gás. */
const Cometa: BodyRender = ({ v, r }) => {
  const id = useGid('cm');
  return (
    <>
      <FxExtent r={r * 1.7}>
        <Breathe period={3800} opacity={[0.55, 1]} scale={[0.96, 1.05]}>
          <Glow id={id} color={v.color} r={r * 1.6} opacity={0.5} />
        </Breathe>
        <Layer>
          <Polygon
            points={[0, 52, 98, 150, 205, 262, 318].map((d, i) => {
              const p = polar(r * (0.5 + ((i * 37) % 23) / 60), d);
              return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
            }).join(' ')}
            fill="#DDEBFF"
            stroke={W}
            strokeOpacity={0.7}
            strokeWidth={1}
            strokeLinejoin="round"
          />
          <Polygon points={`${C - r * 0.2},${C - r * 0.3} ${C + r * 0.1},${C - r * 0.1} ${C - r * 0.12},${C + r * 0.2}`} fill="#7FA6D8" fillOpacity={0.6} />
          <Polygon points={`${C + r * 0.12},${C + r * 0.05} ${C + r * 0.38},${C + r * 0.02} ${C + r * 0.2},${C + r * 0.32}`} fill="#4A6FA8" fillOpacity={0.5} />
          <Line x1={C - r * 0.28} y1={C - r * 0.26} x2={C - r * 0.02} y2={C - r * 0.42} stroke={W} strokeOpacity={0.85} strokeWidth={1.2} strokeLinecap="round" />
        </Layer>
      </FxExtent>
      <Particles mode="streak" count={7} period={2800} colors={[W, v.color]} size={[1.6, 2.8]} radius={[2, r * 0.5]} travel={r * 1.5} plane={-24} seed={5} />
    </>
  );
};

/** Gigante Gasoso — incomum: faixas turbulentas, uma grande mancha e um véu de nuvens altas. */
const GiganteGasoso: BodyRender = ({ v, r }) => (
  <Orb
    r={r * 1.05}
    lit="#FFF1D8"
    mid={v.color}
    dark={v.color2 ?? '#3A1E10'}
    limb={0.62}
    atmosphere={v.color}
    atmosphereSize={0.16}
    surface={
      <Tile r={r * 1.05}>
        <Bands colors={['#D9A066', v.color, '#F2D2A0', v.color2 ?? v.color, '#E8B878', v.color, '#C98A4A', '#F2D2A0']} seed={9} wobble={2.6} />
        <Ellipse cx={34} cy={62} rx={11} ry={6} fill="#C2412F" fillOpacity={0.85} />
        <Ellipse cx={34} cy={62} rx={7} ry={3.4} fill="#FF9A7A" fillOpacity={0.7} />
        <Ellipse cx={78} cy={30} rx={4} ry={2.2} fill="#FFFFFF" fillOpacity={0.6} />
      </Tile>
    }
    spin={22000}
    clouds={
      <Tile r={r * 1.05}>
        <Blotches n={6} color="#FFFFFF" seed={12} size={[8, 18]} opacity={0.2} flat={0.16} />
      </Tile>
    }
    cloudSpin={14000}
  />
);

/** Mundo de Gelo — incomum: crosta rachada que reflete como vidro, calotas e um brilho frio. */
const MundoGelado: BodyRender = ({ v, r }) => (
  <>
    <Orb
      r={r}
      lit={W}
      mid={v.color}
      dark={v.color2 ?? '#1E3A6A'}
      limb={0.6}
      gloss={0.6}
      atmosphere="#CFEFFF"
      atmosphereSize={0.2}
      surface={
        <Tile r={r}>
          <Cracks n={12} color="#3C6EA8" seed={18} width={0.9} opacity={0.7} />
          <Blotches n={5} color="#FFFFFF" seed={19} size={[6, 12]} opacity={0.3} />
          <Caps size={15} />
        </Tile>
      }
      spin={46000}
    />
    <Particles mode="twinkle" count={4} period={4200} colors={[W]} size={[2, 3.2]} radius={[r * 0.3, r * 0.9]} sparkle seed={21} />
  </>
);

/** Mundo de Lava — incomum: placas negras sobre um mar que brilha; brasas sobem da crosta. */
const MundoLava: BodyRender = ({ v, r }) => (
  <>
    <Corona color={v.color} r={r} size={1.4} opacity={0.3} period={3000} />
    <Orb
      r={r}
      lit={v.color}
      mid={v.color2 ?? '#B3243F'}
      dark="#1A0606"
      limb={0.6}
      atmosphere={v.color}
      atmosphereSize={0.16}
      surface={
        <Tile r={r}>
          <Lands n={9} color="#1C0C0A" seed={25} size={[9, 16]} edge={v.color} />
          <Cracks n={7} color="#FFE08A" glow={v.color} seed={26} width={1} />
        </Tile>
      }
      spin={36000}
    />
    <Particles mode="rise" count={5} period={3400} colors={[v.color, '#FFE08A']} size={[1.8, 3]} radius={[r * 0.5, r * 0.95]} travel={20} glow seed={27} />
  </>
);

/** Mundo Selvagem — incomum: continentes verdes, mares rasos e nuvens de chuva. */
const MundoSelva: BodyRender = ({ v, r }) => (
  <Orb
    r={r}
    lit="#D8FFE0"
    mid="#2C7FB8"
    dark="#0A2440"
    limb={0.66}
    gloss={0.25}
    atmosphere="#9CF0C8"
    atmosphereSize={0.17}
    surface={
      <Tile r={r}>
        <Lands n={6} color={v.color2 ?? '#1E7A4A'} seed={33} size={[10, 18]} edge="#0E4A2C" />
        <Lands n={5} color={v.color} seed={34} size={[4, 8]} />
        <Caps size={9} opacity={0.75} />
      </Tile>
    }
    spin={38000}
    clouds={
      <Tile r={r}>
        <Blotches n={9} color="#FFFFFF" seed={36} size={[6, 14]} opacity={0.62} flat={0.34} />
      </Tile>
    }
    cloudSpin={24000}
  />
);

/** Geodo Estelar — incomum: casca de rocha aberta numa fenda, com cristal aceso por dentro. */
const Geodo: BodyRender = ({ v, r }) => {
  const id = useGid('gd');
  return (
    <>
      <Orb
        r={r}
        lit="#8A8FA8"
        mid="#4A4F68"
        dark="#15182A"
        limb={0.72}
        surface={
          <Tile r={r}>
            <Craters n={8} seed={41} />
            <Blotches n={6} color="#000000" seed={42} size={[6, 12]} opacity={0.25} />
          </Tile>
        }
        spin={52000}
      />
      <FxExtent r={r}>
        <Breathe period={3200} opacity={[0.7, 1]}>
          <Defs>
            <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={W} />
              <Stop offset="0.5" stopColor={v.color} />
              <Stop offset="1" stopColor={v.color2 ?? v.color} />
            </LinearGradient>
          </Defs>
          <Polygon points={`${C - r * 0.1},${C - r * 0.82} ${C + r * 0.28},${C - r * 0.3} ${C + r * 0.06},${C + r * 0.12} ${C + r * 0.34},${C + r * 0.72} ${C - r * 0.04},${C + r * 0.84} ${C - r * 0.3},${C + r * 0.3} ${C - r * 0.1},${C - r * 0.14} ${C - r * 0.36},${C - r * 0.5}`} fill={`url(#${id})`} stroke={W} strokeOpacity={0.8} strokeWidth={0.8} strokeLinejoin="round" />
          {[-0.5, -0.1, 0.3, 0.62].map((k, i) => (
            <Polygon key={k} points={`${C + (i % 2 ? 0.1 : -0.12) * r},${C + k * r} ${C + (i % 2 ? 0.2 : -0.02) * r},${C + (k + 0.12) * r} ${C + (i % 2 ? 0.04 : -0.2) * r},${C + (k + 0.2) * r}`} fill={W} fillOpacity={0.55} />
          ))}
        </Breathe>
      </FxExtent>
    </>
  );
};

/** Ecumenópole — rara: um mundo inteiro urbanizado; a noite é uma malha de luzes e há tráfego em órbita. */
const MundoCidade: BodyRender = ({ v, r }) => (
  <>
    <Orb
      r={r}
      lit="#8FA6D8"
      mid="#232A4A"
      dark="#05070F"
      limb={0.5}
      atmosphere={v.color}
      atmosphereSize={0.2}
      surface={
        <Tile r={r}>
          <Lattice color={v.color} cols={7} rows={6} width={0.5} opacity={0.5} />
          <Lights n={90} color={v.color} seed={45} clusters={7} />
          <Lights n={40} color={W} seed={46} clusters={5} size={[0.4, 0.9]} />
          <Lights n={18} color={v.color2 ?? '#FF8FD1'} seed={47} clusters={3} size={[0.8, 1.6]} />
        </Tile>
      }
      spin={34000}
    />
    <Particles mode="orbit" half="back" count={5} period={9000} colors={[W, v.color]} size={[1.2, 2]} radius={[r * 1.16, r * 1.24]} tilt={0.3} plane={12} trail={3} seed={48} />
    <Particles mode="orbit" half="front" count={5} period={9000} colors={[W, v.color]} size={[1.2, 2]} radius={[r * 1.16, r * 1.24]} tilt={0.3} plane={12} trail={3} seed={48} />
  </>
);

/** Mundo-Tempestade — raro: céu fechado que nunca abre; relâmpagos correm por dentro das nuvens. */
const MundoTempestade: BodyRender = ({ v, r }) => (
  <>
    <Orb
      r={r}
      lit="#9AA8C8"
      mid={v.color2 ?? '#2A3458'}
      dark="#080A14"
      limb={0.66}
      atmosphere={v.color}
      atmosphereSize={0.2}
      surface={
        <Tile r={r}>
          <Bands colors={['#2A3458', '#3C4A78', '#1E2644', '#4A5A8C', '#232C50', '#34407A']} seed={52} wobble={4.5} />
          <Ellipse cx={62} cy={44} rx={13} ry={9} fill="#0A0E20" fillOpacity={0.7} />
          <Path d={spiral(1, 9, 1.6, 0, 40).replace(/(-?\d+\.?\d*),(-?\d+\.?\d*)/g, (_, x, y) => `${(Number(x) - 120 + 62).toFixed(1)},${(Number(y) - 120 + 44).toFixed(1)}`)} stroke="#C8D4FF" strokeOpacity={0.6} strokeWidth={0.9} fill="none" />
        </Tile>
      }
      spin={17000}
      clouds={
        <Tile r={r}>
          <Blotches n={8} color="#C8D4FF" seed={54} size={[8, 16]} opacity={0.3} flat={0.3} />
        </Tile>
      }
      cloudSpin={11000}
    />
    <FxExtent r={r}>
      {[0, 0.4, 0.72].map((ph, i) => (
        <Glimmer key={ph} period={3100} phase={ph} window={0.14} peak={1}>
          <Path d={lightning(60 + i * 110, r * 0.12, r * 0.86, 5, 8, 20 + i)} stroke={i === 1 ? W : v.color} strokeWidth={1.4} fill="none" strokeLinejoin="round" />
          <Circle cx={polar(r * 0.5, 60 + i * 110).x} cy={polar(r * 0.5, 60 + i * 110).y} r={r * 0.3} fill={v.color} fillOpacity={0.18} />
        </Glimmer>
      ))}
    </FxExtent>
  </>
);

// ————————————————————————————————————————————————————— singularidades

/** Disco de acreção visto de cima (dentro de um `Plane`): faixas quentes por dentro, frias por fora. */
function DiskArt({ r0, r1, hot, cool, bands = 6 }: { r0: number; r1: number; hot: string; cool: string; bands?: number }) {
  const step = (r1 - r0) / bands;
  const dashes = ['40 6 12 5', '22 4 60 8', '9 5 30 6', '70 10 14 6', '16 6 44 9', '90 12'];
  return (
    <G fill="none">
      {Array.from({ length: bands }, (_, i) => {
        const k = i / (bands - 1);
        return <Circle key={i} cx={C} cy={C} r={r0 + step * (i + 0.5)} stroke={k < 0.34 ? W : k < 0.7 ? hot : cool} strokeOpacity={0.95 - k * 0.55} strokeWidth={step * 0.86} strokeDasharray={dashes[i % dashes.length]} />;
      })}
      <Circle cx={C} cy={C} r={r0} stroke={W} strokeOpacity={0.9} strokeWidth={1} />
    </G>
  );
}

interface HoleOpts {
  /** Raio da sombra em relação ao corpo. */
  shadow?: number;
  disk?: [number, number];
  squash?: number;
  tilt?: number;
  period?: number;
  /** Arco de luz por cima (a face de trás do disco, dobrada pela gravidade). */
  over?: boolean;
  /** Um lado do disco mais claro (ele vem na direção de quem olha). */
  doppler?: boolean;
  bands?: number;
}

function Hole({ v, r, o, children }: { v: BodyProps['v']; r: number; o: HoleOpts; children?: ReactNode }) {
  const g = useGid('bh');
  const d = useGid('bd');
  const s = r * (o.shadow ?? 0.6);
  const [d0, d1] = o.disk ?? [0.86, 1.62];
  const squash = o.squash ?? 0.26;
  const tilt = o.tilt ?? -14;
  const disk = (half: 'back' | 'front') => (
    <Plane tilt={tilt} squash={squash} half={half}>
      <FxExtent r={r * d1 + 3}>
        <Spin period={o.period ?? 9000}>
          <DiskArt r0={r * d0} r1={r * d1} hot={v.color} cool={v.color2 ?? v.color} bands={o.bands ?? 6} />
        </Spin>
      </FxExtent>
    </Plane>
  );
  return (
    <>
      <FxExtent r={r * 1.9}>
        <Breathe period={5200} opacity={[0.55, 0.95]}>
          <Glow id={g} color={v.color} r={r * 1.85} opacity={0.34} />
        </Breathe>
      </FxExtent>
      {disk('back')}
      <FxExtent r={r * 1.2}>
        <Layer>
          <Defs>
            <RadialGradient id={d} cx="50%" cy="50%" r="50%">
              <Stop offset="0.78" stopColor={INK} stopOpacity={1} />
              <Stop offset="0.9" stopColor={v.color} stopOpacity={0.5} />
              <Stop offset="1" stopColor={v.color} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          {o.over ? (
            <>
              <Path d={arc(s * 1.3, -82, 82)} stroke={v.color} strokeOpacity={0.9} strokeWidth={s * 0.3} fill="none" strokeLinecap="round" />
              <Path d={arc(s * 1.34, -64, 64)} stroke={W} strokeOpacity={0.75} strokeWidth={s * 0.1} fill="none" strokeLinecap="round" />
              <Path d={arc(s * 1.16, 112, 248)} stroke={v.color2 ?? v.color} strokeOpacity={0.7} strokeWidth={s * 0.1} fill="none" strokeLinecap="round" />
            </>
          ) : null}
          <Circle cx={C} cy={C} r={s * 1.28} fill={`url(#${d})`} />
          <Circle cx={C} cy={C} r={s} fill="#000000" />
          <Circle cx={C} cy={C} r={s + 0.8} stroke={W} strokeOpacity={0.92} strokeWidth={1.1} fill="none" />
          <Circle cx={C} cy={C} r={s + 2.6} stroke={v.color} strokeOpacity={0.55} strokeWidth={1.2} fill="none" />
          {o.doppler ? <Path d={arc(s + 1.4, 196, 300)} stroke={W} strokeOpacity={0.95} strokeWidth={2.4} fill="none" strokeLinecap="round" /> : null}
        </Layer>
      </FxExtent>
      {children}
      {disk('front')}
    </>
  );
}

/** Singularidade — rara: a sombra, o anel de fótons e um disco fino que a contorna. */
const Singularidade: BodyRender = ({ v, r }) => (
  <>
    <Hole v={v} r={r} o={{ shadow: 0.58, disk: [0.84, 1.5], bands: 5, period: 11000 }} />
    <Particles mode="spiral" half="front" count={6} period={5200} colors={[W, v.color]} size={[1.4, 2.4]} radius={[r * 0.6, r * 1.6]} tilt={0.26} plane={-14} turns={1.4} seed={71} />
  </>
);

/** Buraco Negro de Kerr — épico: gira; o disco se dobra por cima da sombra e um lado brilha mais. */
const BuracoKerr: BodyRender = ({ v, r }) => (
  <>
    <Hole v={v} r={r} o={{ shadow: 0.62, disk: [0.84, 1.78], bands: 7, period: 6400, over: true, doppler: true, squash: 0.22 }} />
    <Particles mode="spiral" half="back" count={8} period={4200} colors={[W, v.color, v.color2 ?? v.color]} size={[1.4, 2.6]} radius={[r * 0.6, r * 1.8]} tilt={0.22} plane={-14} turns={1.8} trail={2} seed={73} />
    <Particles mode="spiral" half="front" count={8} period={4200} colors={[W, v.color, v.color2 ?? v.color]} size={[1.4, 2.6]} radius={[r * 0.6, r * 1.8]} tilt={0.22} plane={-14} turns={1.8} trail={2} seed={73} />
  </>
);

/** Buraco Branco — épico: o avesso: nada entra, tudo sai. Um núcleo que jorra luz em todas as direções. */
const BuracoBranco: BodyRender = ({ v, r }) => {
  const g = useGid('wb');
  return (
    <>
      <Rays r={r * 0.6} color={v.color} n={16} from={1.1} to={3} width={2.2} period={38000} opacity={0.3} />
      <Rays r={r * 0.6} color={W} n={8} from={1.1} to={2.4} width={1.2} period={52000} opacity={0.34} reverse />
      <FxExtent r={r * 1.9}>
        {[0, 0.33, 0.66].map((ph) => (
          <Wave key={ph} period={2700} phase={ph} from={r * 0.6} to={r * 1.85} drawnAt={r * 1.2} peak={0.6}>
            <Circle cx={C} cy={C} r={r * 1.2} stroke={W} strokeWidth={1.4} fill="none" />
          </Wave>
        ))}
        <Layer>
          <Defs>
            <RadialGradient id={g} cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={W} />
              <Stop offset="0.5" stopColor={W} />
              <Stop offset="0.72" stopColor={v.color} stopOpacity={0.9} />
              <Stop offset="1" stopColor={v.color2 ?? v.color} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={C} cy={C} r={r * 0.9} fill={`url(#${g})`} />
          <Circle cx={C} cy={C} r={r * 0.56} stroke={v.color} strokeOpacity={0.6} strokeWidth={0.8} fill="none" />
        </Layer>
      </FxExtent>
      <Particles mode="radial" count={14} period={2400} colors={[W, v.color]} size={[1.6, 3]} radius={[r * 0.6, r * 2.1]} trail={2} seed={75} />
    </>
  );
};

/** Quasar — lendário: um disco furioso e dois jatos em hélice que atravessam o palco. */
const Quasar: BodyRender = ({ v, r }) => {
  const j = useGid('qj');
  const jet = (
    <G>
      <Polygon points={`${C - 2.5},${C - r * 0.5} ${C + 2.5},${C - r * 0.5} ${C + 9},${C - 112} ${C - 9},${C - 112}`} fill={`url(#${j})`} />
      <Line x1={C} y1={C - r * 0.5} x2={C} y2={C - 108} stroke={W} strokeOpacity={0.85} strokeWidth={1} />
    </G>
  );
  return (
    <>
      <Breathe period={2100} opacity={[0.6, 1]} scale={[0.985, 1.02]}>
        <Defs>
          <LinearGradient id={j} x1="0" y1="1" x2="0" y2="0">
            <Stop offset="0" stopColor={W} stopOpacity={0.95} />
            <Stop offset="0.3" stopColor={v.color} stopOpacity={0.7} />
            <Stop offset="1" stopColor={v.color2 ?? v.color} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <G transform={`rotate(-14 ${C} ${C})`}>
          {jet}
          <G transform={`rotate(180 ${C} ${C})`}>{jet}</G>
        </G>
      </Breathe>
      <Particles mode="helix" count={14} period={2200} colors={[W, v.color]} size={[1.8, 3]} radius={[r * 0.5, r * 0.5]} travel={78} plane={-14} turns={3} glow seed={81} />
      <Hole v={v} r={r} o={{ shadow: 0.5, disk: [0.7, 1.9], bands: 8, period: 4200, over: true, doppler: true, squash: 0.2 }}>
        <FxExtent r={r * 1.1}>
          <Wave period={1600} from={r * 0.5} to={r * 1.05} drawnAt={r * 0.8} peak={0.7}>
            <Circle cx={C} cy={C} r={r * 0.8} stroke={W} strokeWidth={1.3} fill="none" />
          </Wave>
        </FxExtent>
      </Hole>
      <Particles mode="spiral" half="front" count={10} period={3000} colors={[W, v.color]} size={[1.4, 2.6]} radius={[r * 0.5, r * 1.9]} tilt={0.2} plane={-14} turns={2.2} trail={3} seed={83} />
      <Extra min={0.8}>
        <Particles mode="twinkle" count={6} period={3000} colors={[W]} size={[2, 3.4]} radius={[r * 1.2, 104]} arc={[-40, 12]} sparkle seed={85} />
      </Extra>
    </>
  );
};

/** Dança de Singularidades — lendária: dois buracos negros em espiral, a um passo de se fundir; o espaço ondula. */
const Colisao: BodyRender = ({ v, r }) => {
  const g = useGid('cl');
  const hole = (half: 'back' | 'front', phase: number) => (
    <Orbiter r={r * 0.62} squash={0.4} plane={-12} period={3400} phase={phase} box={r * 1.3} half={half} depth={[0.82, 1.16]} farAlpha={1}>
      <Circle cx={r * 0.65} cy={r * 0.65} r={r * 0.6} fill={v.color} fillOpacity={0.2} />
      <Circle cx={r * 0.65} cy={r * 0.65} r={r * 0.4} fill="#000000" />
      <Circle cx={r * 0.65} cy={r * 0.65} r={r * 0.42} stroke={W} strokeWidth={1.1} fill="none" />
      <Circle cx={r * 0.65} cy={r * 0.65} r={r * 0.5} stroke={phase ? v.color2 ?? v.color : v.color} strokeWidth={1.4} strokeOpacity={0.7} fill="none" />
    </Orbiter>
  );
  return (
    <>
      <FxExtent r={104}>
        <Breathe period={3400} opacity={[0.5, 0.9]}>
          <Glow id={g} color={v.color} r={r * 2} opacity={0.36} />
        </Breathe>
      </FxExtent>
      <Plane tilt={-12} squash={0.4}>
        {[0, 0.25, 0.5, 0.75].map((ph) => (
          <Wave key={ph} period={3400} phase={ph} from={r * 0.9} to={112} drawnAt={70} peak={0.6}>
            <Path d={spiral(52, 70, 0.5, ph * 360, 30)} stroke={v.color} strokeWidth={2} fill="none" strokeLinecap="round" />
            <Path d={spiral(52, 70, 0.5, ph * 360 + 180, 30)} stroke={v.color2 ?? W} strokeWidth={2} fill="none" strokeLinecap="round" />
          </Wave>
        ))}
      </Plane>
      {hole('back', 0)}
      {hole('back', 0.5)}
      <Particles mode="orbit" half="back" count={8} period={3400} colors={[W, v.color]} size={[1.4, 2.4]} radius={[r * 0.6, r * 0.66]} tilt={0.4} plane={-12} trail={4} seed={91} />
      <FxExtent r={r * 0.5}>
        <Breathe period={1700} opacity={[0.5, 1]} scale={[0.8, 1.2]}>
          <Circle cx={C} cy={C} r={r * 0.16} fill={W} />
          <Circle cx={C} cy={C} r={r * 0.34} fill={v.color} fillOpacity={0.3} />
        </Breathe>
      </FxExtent>
      <Particles mode="orbit" half="front" count={8} period={3400} colors={[W, v.color]} size={[1.4, 2.4]} radius={[r * 0.6, r * 0.66]} tilt={0.4} plane={-12} trail={4} seed={91} />
      {hole('front', 0)}
      {hole('front', 0.5)}
    </>
  );
};

// ————————————————————————————————————————————————————— nebulosas

interface Puff {
  x: number;
  y: number;
  rx: number;
  ry: number;
  c: 0 | 1 | 2;
  o?: number;
}

/** Nuvens: elipses com degradê radial (sem borda), em unidades do raio do corpo. */
function Puffs({ r, colors, puffs, id }: { r: number; colors: string[]; puffs: Puff[]; id: string }) {
  return (
    <G>
      <Defs>
        {colors.map((c, i) => (
          <RadialGradient key={i} id={`${id}${i}`} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={c} stopOpacity={0.85} />
            <Stop offset="0.55" stopColor={c} stopOpacity={0.36} />
            <Stop offset="1" stopColor={c} stopOpacity={0} />
          </RadialGradient>
        ))}
      </Defs>
      {puffs.map((p, i) => (
        <Ellipse key={i} cx={C + p.x * r} cy={C + p.y * r} rx={p.rx * r} ry={p.ry * r} fill={`url(#${id}${p.c})`} fillOpacity={p.o ?? 1} />
      ))}
    </G>
  );
}

/** Protoestrela — comum: um casulo de gás morno; no meio, algo começa a acender. */
const Protoestrela: BodyRender = ({ v, r }) => {
  const id = useGid('pn');
  return (
    <FxExtent r={r * 1.5}>
      <Spin period={52000}>
        <Puffs r={r} id={id} colors={[v.color, v.color2 ?? v.color, W]} puffs={[{ x: -0.3, y: -0.1, rx: 0.95, ry: 0.7, c: 1 }, { x: 0.35, y: 0.2, rx: 0.85, ry: 0.62, c: 0 }, { x: 0, y: 0.4, rx: 0.7, ry: 0.45, c: 1, o: 0.7 }]} />
      </Spin>
      <Breathe period={3000} scale={[0.86, 1.12]} opacity={[0.65, 1]}>
        <Circle cx={C} cy={C} r={r * 0.34} fill={v.color} fillOpacity={0.5} />
        <Circle cx={C} cy={C} r={r * 0.17} fill={W} />
      </Breathe>
    </FxExtent>
  );
};

/** Gota Nebular — comum: uma gota de gás frio, alongada, com um fio de poeira escura. */
const GotaNebular: BodyRender = ({ v, r }) => {
  const id = useGid('gn');
  return (
    <FxExtent r={r * 1.5}>
      <Breathe period={5200} scale={[0.96, 1.05]} opacity={[0.75, 1]}>
        <Puffs r={r} id={id} colors={[v.color, v.color2 ?? v.color, W]} puffs={[{ x: 0, y: 0.25, rx: 0.9, ry: 0.85, c: 0 }, { x: 0, y: -0.45, rx: 0.5, ry: 0.8, c: 1 }, { x: -0.1, y: 0.3, rx: 0.4, ry: 0.4, c: 2, o: 0.7 }]} />
        <Path d={`M${C - r * 0.5} ${C + r * 0.5} Q${C} ${C + r * 0.1} ${C + r * 0.45} ${C + r * 0.55}`} stroke={INK} strokeOpacity={0.55} strokeWidth={r * 0.1} fill="none" strokeLinecap="round" />
      </Breathe>
      <Layer>
        <Circle cx={C - r * 0.1} cy={C + r * 0.25} r={1.6} fill={W} />
        <Circle cx={C + r * 0.3} cy={C - r * 0.1} r={1} fill={W} fillOpacity={0.8} />
      </Layer>
    </FxExtent>
  );
};

/** Berçário Estelar — incomum: nuvens em duas camadas girando ao contrário; estrelas recém-nascidas acendem dentro. */
const Bercario: BodyRender = ({ v, r }) => {
  const a = useGid('ba');
  const b = useGid('bb');
  return (
    <>
      <FxExtent r={r * 1.6}>
        <Spin period={60000}>
          <Puffs r={r} id={a} colors={[v.color, v.color2 ?? v.color, W]} puffs={[{ x: -0.45, y: -0.25, rx: 0.9, ry: 0.6, c: 0 }, { x: 0.45, y: 0.3, rx: 0.95, ry: 0.65, c: 1 }, { x: 0.2, y: -0.5, rx: 0.6, ry: 0.45, c: 0, o: 0.8 }]} />
        </Spin>
        <Spin period={44000} reverse>
          <Puffs r={r} id={b} colors={[v.color2 ?? v.color, v.color, W]} puffs={[{ x: 0.3, y: -0.2, rx: 0.7, ry: 0.5, c: 0, o: 0.8 }, { x: -0.35, y: 0.35, rx: 0.75, ry: 0.5, c: 1, o: 0.8 }]} />
          <Path d={`M${C - r * 0.7} ${C - r * 0.1} Q${C - r * 0.1} ${C + r * 0.3} ${C + r * 0.6} ${C - r * 0.3}`} stroke={INK} strokeOpacity={0.5} strokeWidth={r * 0.12} fill="none" strokeLinecap="round" />
        </Spin>
      </FxExtent>
      <Particles mode="twinkle" count={7} period={3600} colors={[W, v.color, '#FFE7A3']} size={[2.2, 4]} radius={[r * 0.1, r * 0.95]} sparkle glow seed={7} />
    </>
  );
};

/** Nebulosa Olho de Gato — rara: cascas concêntricas sopradas por uma estrela que morre no centro. */
const OlhoDeGato: BodyRender = ({ v, r }) => {
  const id = useGid('og');
  return (
    <>
      <FxExtent r={r * 1.7}>
        <Spin period={90000}>
          <Puffs r={r} id={id} colors={[v.color, v.color2 ?? v.color, W]} puffs={[{ x: 0, y: 0, rx: 1.5, ry: 1.1, c: 1, o: 0.6 }]} />
          <G fill="none" strokeLinecap="round">
            {[0.5, 0.72, 0.94, 1.16, 1.38].map((k, i) => (
              <Ellipse key={k} cx={C} cy={C} rx={r * k} ry={r * k * 0.72} stroke={i % 2 ? v.color2 ?? v.color : v.color} strokeOpacity={0.8 - i * 0.13} strokeWidth={1.6 - i * 0.2} transform={`rotate(${i * 24} ${C} ${C})`} />
            ))}
          </G>
        </Spin>
        <Spin period={30000} reverse>
          <Ellipse cx={C} cy={C} rx={r * 0.62} ry={r * 0.26} fill={v.color} fillOpacity={0.34} stroke={W} strokeOpacity={0.6} strokeWidth={0.8} />
          <Ellipse cx={C} cy={C} rx={r * 0.26} ry={r * 0.62} fill={v.color2 ?? v.color} fillOpacity={0.28} stroke={W} strokeOpacity={0.5} strokeWidth={0.8} />
        </Spin>
        <Breathe period={2600} scale={[0.85, 1.15]}>
          <Circle cx={C} cy={C} r={r * 0.2} fill={W} fillOpacity={0.4} />
          <Circle cx={C} cy={C} r={r * 0.1} fill={W} />
        </Breathe>
      </FxExtent>
      <Particles mode="radial" count={6} period={5200} colors={[W, v.color]} size={[1.4, 2.4]} radius={[r * 0.3, r * 1.5]} seed={9} />
    </>
  );
};

/** Remanescente de Supernova — épico: filamentos em casca que se expandem; no centro, o que sobrou pulsa. */
const Supernova: BodyRender = ({ v, r }) => {
  const id = useGid('sn');
  const shell = (seed: number, k: number, color: string) => (
    <G fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
      {Array.from({ length: 9 }, (_, i) => (
        <Path key={i} d={lightning(i * 40 + seed * 7, r * k * 0.82, r * k * 1.08, 4, 5, seed + i)} strokeWidth={1.3} strokeOpacity={0.85} />
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <Path key={`a${i}`} d={arc(r * k, i * 60 + seed * 11, i * 60 + seed * 11 + 34)} strokeWidth={1.8} strokeOpacity={0.7} />
      ))}
    </G>
  );
  return (
    <>
      <FxExtent r={r * 2.1}>
        <Breathe period={6000} opacity={[0.6, 0.95]}>
          <Puffs r={r} id={id} colors={[v.color, v.color2 ?? v.color, W]} puffs={[{ x: 0, y: 0, rx: 1.9, ry: 1.9, c: 1, o: 0.4 }, { x: -0.4, y: 0.3, rx: 0.9, ry: 0.7, c: 0, o: 0.6 }, { x: 0.5, y: -0.3, rx: 0.8, ry: 0.7, c: 0, o: 0.5 }]} />
        </Breathe>
        <Spin period={80000}>{shell(1, 1.5, v.color)}</Spin>
        <Spin period={56000} reverse>
          {shell(2, 1.05, v.color2 ?? v.color)}
        </Spin>
        {[0, 0.5].map((ph) => (
          <Wave key={ph} period={5200} phase={ph} from={r * 0.4} to={r * 2} drawnAt={r * 1.4} peak={0.5}>
            <Circle cx={C} cy={C} r={r * 1.4} stroke={W} strokeWidth={1} fill="none" strokeDasharray="6 9" />
          </Wave>
        ))}
        <Breathe period={900} scale={[0.7, 1.3]} opacity={[0.6, 1]}>
          <Circle cx={C} cy={C} r={r * 0.22} fill={v.color} fillOpacity={0.4} />
          <Circle cx={C} cy={C} r={r * 0.09} fill={W} />
        </Breathe>
      </FxExtent>
      <Particles mode="radial" count={12} period={4400} colors={[W, v.color, v.color2 ?? v.color]} size={[1.6, 3]} radius={[r * 0.3, r * 2]} sparkle seed={11} />
    </>
  );
};

// ————————————————————————————————————————————————————— máquinas e formas impossíveis

/** Reator Orbital — incomum: três anéis de plasma em planos cruzados, girando em torno de um ponto de fusão. */
const Reator: BodyRender = ({ v, r }) => {
  const ring = (tilt: number, period: number, color: string, half: 'back' | 'front') => (
    <Plane tilt={tilt} squash={0.32} half={half}>
      <FxExtent r={r * 1.1}>
        <Spin period={period}>
          <Circle cx={C} cy={C} r={r * 0.98} stroke={color} strokeWidth={2.6} strokeOpacity={0.9} fill="none" strokeDasharray="48 10 6 10" strokeLinecap="round" />
          <Circle cx={C} cy={C} r={r * 0.98} stroke={W} strokeWidth={0.8} strokeOpacity={0.7} fill="none" strokeDasharray="6 58" />
        </Spin>
      </FxExtent>
    </Plane>
  );
  return (
    <>
      <Corona color={v.color} r={r * 0.5} size={1.9} opacity={0.5} period={2200} />
      {ring(-60, 5200, v.color, 'back')}
      {ring(0, 6800, v.color2 ?? v.color, 'back')}
      {ring(60, 4400, v.color, 'back')}
      <Orb r={r * 0.4} lit={W} mid={v.color} dark={v.color2 ?? v.color} limb={0.15} atmosphere={W} atmosphereSize={0.5} />
      {ring(-60, 5200, v.color, 'front')}
      {ring(0, 6800, v.color2 ?? v.color, 'front')}
      {ring(60, 4400, v.color, 'front')}
    </>
  );
};

/** Esfera de Dyson — épica: uma estrela cercada por uma casca de painéis; a luz escapa pelas frestas. */
const EsferaDyson: BodyRender = ({ v, r }) => (
  <>
    <Rays r={r} color={v.color} n={10} from={1.02} to={1.8} width={1.6} period={40000} opacity={0.34} />
    <Corona color={v.color} r={r} size={1.6} opacity={0.5} />
    <Orb
      r={r}
      lit={W}
      mid={v.color}
      dark={v.color2 ?? v.color}
      limb={0.5}
      atmosphere={v.color}
      atmosphereSize={0.16}
      surface={
        <Tile r={r}>
          <Wash color="#0C1124" opacity={0.78} />
          <Lattice color={v.color} cols={5} rows={4} hex width={1.6} opacity={0.95} />
          <Lights n={22} color={W} seed={3} size={[0.6, 1.2]} />
        </Tile>
      }
      spin={26000}
      clouds={
        <Tile r={r}>
          <Lattice color={W} cols={8} rows={5} width={0.5} opacity={0.35} />
        </Tile>
      }
      cloudSpin={15000}
      cloudOpacity={0.9}
    />
    <Particles mode="orbit" half="back" count={6} period={8000} colors={[W, v.color]} size={[1.4, 2.2]} radius={[r * 1.2, r * 1.3]} tilt={0.3} plane={20} seed={13} />
    <Particles mode="orbit" half="front" count={6} period={8000} colors={[W, v.color]} size={[1.4, 2.2]} radius={[r * 1.2, r * 1.3]} tilt={0.3} plane={20} seed={13} />
  </>
);

/** Projeção de um cubo dentro de um cubo (tesseracto): oito arestas ligando os dois. */
function Hypercube({ r, color, inner, turn = 0 }: { r: number; color: string; inner: number; turn?: number }) {
  const outer = [45, 135, 225, 315].map((d) => polar(r, d + turn));
  const inn = [45, 135, 225, 315].map((d) => polar(r * inner, d + turn + 18));
  const pts = (list: { x: number; y: number }[]) => list.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  return (
    <G stroke={color} strokeLinejoin="round" strokeLinecap="round" fill="none">
      <Polygon points={pts(outer)} strokeWidth={1.6} fill={color} fillOpacity={0.05} />
      <Polygon points={pts(inn)} strokeWidth={1.3} fill={color} fillOpacity={0.1} />
      {outer.map((p, i) => (
        <Line key={i} x1={p.x} y1={p.y} x2={inn[i].x} y2={inn[i].y} strokeWidth={1} strokeOpacity={0.8} />
      ))}
      {outer.map((p, i) => (
        <Circle key={`v${i}`} cx={p.x} cy={p.y} r={1.7} fill={W} stroke="none" />
      ))}
    </G>
  );
}

/** Tesseracto — lendário: um cubo de quatro dimensões virando do avesso em torno de uma estrela presa. */
const Tesseracto: BodyRender = ({ v, r }) => {
  const g = useGid('ts');
  return (
    <>
      <FxExtent r={r * 1.9}>
        <Breathe period={4200} opacity={[0.5, 0.9]}>
          <Glow id={g} color={v.color} r={r * 1.8} opacity={0.4} />
        </Breathe>
        <Spin period={26000}>
          <Hypercube r={r * 1.45} color={v.color} inner={0.52} />
        </Spin>
        <Spin period={17000} reverse>
          <Hypercube r={r * 1.02} color={v.color2 ?? W} inner={0.45} turn={45} />
        </Spin>
        <Breathe period={2600} scale={[0.7, 1.12]} opacity={[0.6, 1]}>
          <Polygon points={ngon(4, r * 0.4, 0)} fill={W} fillOpacity={0.22} stroke={W} strokeWidth={1} />
        </Breathe>
        {[0, 0.5].map((ph) => (
          <Wave key={ph} period={4200} phase={ph} from={r * 0.3} to={r * 1.8} drawnAt={r} peak={0.5} hold={0.3}>
            <Polygon points={ngon(4, r, 45)} stroke={W} strokeWidth={1.1} fill="none" />
          </Wave>
        ))}
      </FxExtent>
      <Orb r={r * 0.3} lit={W} mid={v.color} dark={v.color2 ?? v.color} limb={0.1} atmosphere={W} atmosphereSize={0.6} />
      <Particles mode="lemniscate" half="back" count={6} period={5200} colors={[W, v.color]} size={[1.6, 2.6]} radius={[r * 1.5, r * 1.5]} tilt={0.5} plane={0} trail={3} seed={17} />
      <Particles mode="lemniscate" half="front" count={6} period={5200} colors={[W, v.color]} size={[1.6, 2.6]} radius={[r * 1.5, r * 1.5]} tilt={0.5} plane={0} trail={3} seed={17} />
      <Extra min={0.8}>
        <Particles mode="twinkle" count={8} period={3200} colors={[W, v.color]} size={[2, 3.2]} radius={[r * 1.1, r * 1.9]} sparkle seed={19} />
      </Extra>
    </>
  );
};

/** Coração de Matéria Escura — lendário: não se vê; só se sabe que está lá pelo que ele faz com a luz em volta. */
const MateriaEscura: BodyRender = ({ v, r }) => (
  <>
    <FxExtent r={r * 2.2}>
      <Spin period={48000}>
        <G fill="none" strokeLinecap="round">
          {[0, 72, 144, 216, 288].map((d, i) => (
            <G key={d}>
              <Path d={arc(r * 1.52, d, d + 44)} stroke={i % 2 ? v.color : W} strokeOpacity={0.85} strokeWidth={2} />
              <Path d={arc(r * 1.36, d + 20, d + 52)} stroke={v.color2 ?? v.color} strokeOpacity={0.55} strokeWidth={1} />
            </G>
          ))}
        </G>
      </Spin>
      <Spin period={31000} reverse>
        <G fill="none" strokeLinecap="round">
          {[30, 150, 270].map((d) => (
            <Path key={d} d={arc(r * 1.9, d, d + 60)} stroke={v.color} strokeOpacity={0.5} strokeWidth={1.2} />
          ))}
          {[30, 150, 270].map((d) => {
            const p = polar(r * 1.9, d);
            return <Circle key={`s${d}`} cx={p.x} cy={p.y} r={2} fill={W} />;
          })}
        </G>
      </Spin>
      <Layer>
        <Circle cx={C} cy={C} r={r * 1.12} fill="#000000" fillOpacity={0.9} />
        <Circle cx={C} cy={C} r={r * 1.12} stroke={v.color} strokeOpacity={0.35} strokeWidth={0.8} fill="none" strokeDasharray="1.5 5" />
      </Layer>
      {[0, 0.5].map((ph) => (
        <Wave key={ph} period={4600} phase={ph} from={r * 1.9} to={r * 0.2} drawnAt={r} peak={0.45}>
          <Circle cx={C} cy={C} r={r} stroke={v.color} strokeWidth={1.2} fill="none" />
        </Wave>
      ))}
      <Glimmer period={5200} window={0.2} peak={0.9}>
        <Polygon points={ngon(6, r * 0.5, 0)} stroke={v.color2 ?? W} strokeWidth={1} fill={v.color} fillOpacity={0.14} />
        <Polygon points={ngon(3, r * 0.3, 60)} stroke={W} strokeWidth={0.8} fill="none" />
      </Glimmer>
    </FxExtent>
    <Particles mode="converge" count={12} period={4600} colors={[W, v.color]} size={[1.4, 2.6]} radius={[r * 1.1, r * 2.2]} seed={23} />
    <Particles mode="orbit" half="front" count={5} period={12000} colors={[W]} size={[1.2, 2]} radius={[r * 1.5, r * 1.6]} tilt={0.5} plane={30} seed={25} />
    <Particles mode="orbit" half="back" count={5} period={12000} colors={[W]} size={[1.2, 2]} radius={[r * 1.5, r * 1.6]} tilt={0.5} plane={30} seed={25} />
  </>
);

/** Ovo Cósmico — lendário: a semente de um universo; a casca racha e a luz de dentro escapa em pulsos. */
const OvoCosmico: BodyRender = ({ v, r }) => {
  const g = useGid('ov');
  return (
    <>
      <Rays r={r} color={v.color} n={14} from={1} to={2.2} width={1.8} period={50000} opacity={0.3} />
      <Corona color={v.color} r={r} size={2} opacity={0.6} period={2800} />
      <Orb
        r={r}
        lit="#F4ECDC"
        mid="#8A7F6C"
        dark="#1E1A14"
        limb={0.64}
        gloss={0.3}
        surface={
          <Tile r={r}>
            <Blotches n={8} color="#000000" seed={31} size={[5, 11]} opacity={0.2} />
            <Cracks n={14} color={W} glow={v.color} seed={32} width={1.5} />
            <Cracks n={8} color={v.color2 ?? v.color} seed={33} width={0.8} opacity={0.8} />
          </Tile>
        }
        spin={30000}
        pulse={{ period: 2800, scale: [0.985, 1.03] }}
      />
      <FxExtent r={r * 2}>
        {[0, 0.5].map((ph) => (
          <Wave key={ph} period={2800} phase={ph} from={r * 0.9} to={r * 1.9} drawnAt={r * 1.3} peak={0.55} hold={0.2}>
            <Circle cx={C} cy={C} r={r * 1.3} stroke={W} strokeWidth={1.4} fill="none" />
          </Wave>
        ))}
        <Glimmer period={2800} window={0.3} peak={0.8}>
          <Defs>
            <RadialGradient id={g} cx="50%" cy="50%" r="50%">
              <Stop offset="0.5" stopColor={v.color} stopOpacity={0} />
              <Stop offset="0.8" stopColor={v.color} stopOpacity={0.5} />
              <Stop offset="1" stopColor={v.color} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={C} cy={C} r={r * 1.5} fill={`url(#${g})`} />
        </Glimmer>
      </FxExtent>
      <Particles mode="radial" count={12} period={2800} colors={[W, v.color, v.color2 ?? v.color]} size={[1.6, 3]} radius={[r * 0.95, r * 2.2]} sparkle glow seed={35} />
      <Extra min={0.8}>
        <Particles mode="orbit" half="front" count={4} period={14000} colors={['#F4ECDC']} size={[2.4, 4]} radius={[r * 1.25, r * 1.4]} tilt={0.5} plane={-30} sparkle seed={37} />
      </Extra>
    </>
  );
};

/** Estrela Estranha — rara nos livros: metade luz, metade sombra, girando rápido. (usada pelo Hemisfério) */
const Hemisferio: BodyRender = ({ v, r }) => (
  <>
    <Corona color={v.color} r={r * 0.9} size={1.6} opacity={0.45} period={2400} />
    <Orb
      r={r * 0.9}
      lit={W}
      mid={v.color}
      dark={v.color2 ?? v.color}
      limb={0.3}
      atmosphere={v.color}
      atmosphereSize={0.26}
      surface={
        <Tile r={r * 0.9}>
          <Halves a={v.color} b={v.color2 ?? '#101426'} />
          <Rect x={48} y={-2} width={4} height={104} fill={W} fillOpacity={0.8} />
          <Blotches n={6} color={W} seed={3} size={[2, 5]} opacity={0.4} />
        </Tile>
      }
      spin={5200}
    />
  </>
);

export const BODIES: Record<string, BodyRender> = {
  'ana-vermelha': AnaVermelha,
  'ana-marrom': AnaMarrom,
  'brasa-estelar': BrasaEstelar,
  'lua-rochosa': LuaRochosa,
  'mundo-oceano': MundoOceano,
  'mundo-deserto': MundoDeserto,
  cometa: Cometa,
  protoestrela: Protoestrela,
  'gota-nebular': GotaNebular,
  'estrela-dourada': EstrelaDourada,
  'ana-branca': AnaBranca,
  'gigante-gasoso': GiganteGasoso,
  'mundo-gelado': MundoGelado,
  'mundo-lava': MundoLava,
  'mundo-selva': MundoSelva,
  geodo: Geodo,
  bercario: Bercario,
  reator: Reator,
  'gigante-azul': GiganteAzul,
  'gigante-vermelha': GiganteVermelha,
  binaria: Binaria,
  'estrela-neutrons': EstrelaNeutrons,
  'mundo-cidade': MundoCidade,
  'mundo-tempestade': MundoTempestade,
  singularidade: Singularidade,
  'olho-de-gato': OlhoDeGato,
  hemisferio: Hemisferio,
  cefeida: Cefeida,
  magnetar: Magnetar,
  'buraco-kerr': BuracoKerr,
  'buraco-branco': BuracoBranco,
  'esfera-dyson': EsferaDyson,
  supernova: Supernova,
  quasar: Quasar,
  colisao: Colisao,
  tesseracto: Tesseracto,
  'materia-escura': MateriaEscura,
  'ovo-cosmico': OvoCosmico,
};
