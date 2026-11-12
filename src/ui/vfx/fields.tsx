/**
 * Campos novos do Áster (espaço `aura`): a energia em volta do corpo. Cada um tem uma forma própria
 * — coroas, cascas, laços de campo magnético, pétalas, rosáceas, curvas fractais.
 * `Back` fica atrás do corpo; `Front`, quando existe, passa na frente.
 */
import { Circle, Defs, Ellipse, G, Line, Path, Polygon, Polyline, RadialGradient, Stop } from 'react-native-svg';
import { Breathe, C, Extra, FxExtent, Glimmer, Layer, Particles, Spin, Sway, Wave } from './engine';
import { arc, flame, lightning, ngon, polar, ray, wavyCircle } from './geometry';
import { useGid, type AuraFx, type AuraProps } from './kit';

const W = '#FFFFFF';
const R = (p: AuraProps) => p.r ?? 34;
const c2 = (p: AuraProps) => p.v.color2 ?? W;

/** Brilho em anel entre dois raios (sem borda). */
function Halo({ id, color, r0, r1, o = 0.4 }: { id: string; color: string; r0: number; r1: number; o?: number }) {
  const k = r0 / r1;
  return (
    <>
      <Defs>
        <RadialGradient id={id} cx="50%" cy="50%" r="50%">
          <Stop offset={k * 0.9} stopColor={color} stopOpacity={0} />
          <Stop offset={k + (1 - k) * 0.2} stopColor={color} stopOpacity={o} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={C} cy={C} r={r1} fill={`url(#${id})`} />
    </>
  );
}

// ————————————————————————————————————————————————————— comuns

/** Coroa Solar — uma franja de luz irregular, respirando. */
const CoroaSolar: AuraFx = {
  Back: (p) => {
    const id = useGid('fc');
    return (
      <FxExtent r={R(p) + 44}>
        <Breathe period={4600} scale={[0.96, 1.05]} opacity={[0.6, 1]}>
          <Halo id={id} color={p.v.color} r0={R(p)} r1={R(p) + 40} o={0.5} />
          <Path d={wavyCircle(R(p) + 16, 5, 9)} fill={p.v.color} fillOpacity={0.16} stroke={p.v.color} strokeOpacity={0.5} strokeWidth={0.9} />
        </Breathe>
      </FxExtent>
    );
  },
};

/** Halo Frio — o anel de 22° das noites geladas, com dois falsos sóis ao lado. */
const HaloFrio: AuraFx = {
  Back: (p) => (
    <FxExtent r={104}>
      <Breathe period={6200} opacity={[0.55, 0.95]}>
        <Circle cx={C} cy={C} r={92} stroke={p.v.color} strokeOpacity={0.6} strokeWidth={2.6} fill="none" />
        <Circle cx={C} cy={C} r={95} stroke={W} strokeOpacity={0.35} strokeWidth={0.8} fill="none" />
        {[-92, 92].map((dx) => (
          <G key={dx}>
            <Ellipse cx={C + dx} cy={C} rx={5} ry={9} fill={W} fillOpacity={0.6} />
            <Line x1={C + dx} y1={C} x2={C + dx + (dx > 0 ? 12 : -12)} y2={C} stroke={W} strokeOpacity={0.5} strokeWidth={1} strokeLinecap="round" />
          </G>
        ))}
      </Breathe>
    </FxExtent>
  ),
};

/** Vento Estelar — partículas soltas do corpo, saindo devagar em todas as direções. */
const VentoEstelar: AuraFx = {
  Back: (p) => <Particles mode="radial" count={16} period={5200} colors={[p.v.color, W]} size={[1.6, 2.8]} radius={[R(p), 112]} seed={3} />,
};

/** Véu de Fumaça — fiapos escuros girando lentamente: mais sombra que luz. */
const Fumaca: AuraFx = {
  Back: (p) => {
    const id = useGid('ff');
    return (
      <FxExtent r={104}>
        <Spin period={64000}>
          <Defs>
            <RadialGradient id={id} cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={p.v.color} stopOpacity={0.5} />
              <Stop offset="1" stopColor={p.v.color} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          {[0, 95, 170, 250, 310].map((d, i) => {
            const a = polar(R(p) + 30 + (i % 2) * 14, d);
            return <Ellipse key={d} cx={a.x} cy={a.y} rx={30 + (i % 3) * 8} ry={13 + (i % 2) * 5} fill={`url(#${id})`} transform={`rotate(${d + 90} ${a.x} ${a.y})`} />;
          })}
        </Spin>
      </FxExtent>
    );
  },
};

/** Estática — faíscas miúdas que estalam rente ao corpo. */
const Estatica: AuraFx = {
  Back: (p) => <Particles mode="twinkle" count={12} period={1900} colors={[W, p.v.color]} size={[1.6, 3]} radius={[R(p) + 2, R(p) + 18]} sparkle seed={5} />,
};

/** Bolha de Sabão — uma casca fina e furta-cor, com dois reflexos. */
const Bolha: AuraFx = {
  Back: (p) => (
    <FxExtent r={R(p) + 26}>
      <Breathe period={5400} scale={[0.975, 1.03]} opacity={[0.75, 1]}>
        <Circle cx={C} cy={C} r={R(p) + 18} fill={p.v.color} fillOpacity={0.06} stroke={p.v.color} strokeOpacity={0.6} strokeWidth={1.1} />
        <Path d={arc(R(p) + 18, 200, 290)} stroke={c2(p)} strokeWidth={2} fill="none" strokeLinecap="round" />
        <Path d={arc(R(p) + 18, 40, 100)} stroke="#FF8FD1" strokeOpacity={0.8} strokeWidth={1.6} fill="none" strokeLinecap="round" />
        <Path d={arc(R(p) + 14, 300, 336)} stroke={W} strokeOpacity={0.9} strokeWidth={2.2} fill="none" strokeLinecap="round" />
      </Breathe>
    </FxExtent>
  ),
};

/** Raios Suaves — poucos feixes largos, girando sem pressa. */
const RaiosSuaves: AuraFx = {
  Back: (p) => (
    <FxExtent r={112}>
      <Spin period={80000}>
        <G fill={p.v.color} fillOpacity={0.16}>
          {[0, 72, 144, 216, 288].map((d) => (
            <Polygon key={d} points={ray(d, R(p), 110, 11)} />
          ))}
        </G>
      </Spin>
    </FxExtent>
  ),
};

// ————————————————————————————————————————————————————— incomuns

/** Magnetosfera — laços de campo saindo de um polo e voltando pelo outro. */
const Magnetosfera: AuraFx = {
  Back: (p) => (
    <FxExtent r={112}>
      <Breathe period={5000} opacity={[0.55, 0.95]} scale={[0.98, 1.03]}>
        <G fill="none" stroke={p.v.color} transform={`rotate(-18 ${C} ${C})`}>
          {[0.7, 1.05, 1.45, 1.9].map((k, i) => (
            <G key={k} strokeOpacity={0.8 - i * 0.16} strokeWidth={1.3 - i * 0.2}>
              <Ellipse cx={C - R(p) * k * 0.62} cy={C} rx={R(p) * k * 0.62} ry={R(p) * k * 0.92} />
              <Ellipse cx={C + R(p) * k * 0.62} cy={C} rx={R(p) * k * 0.62} ry={R(p) * k * 0.92} />
            </G>
          ))}
        </G>
      </Breathe>
    </FxExtent>
  ),
  Front: (p) => <Particles mode="helix" count={8} period={3800} colors={[W, p.v.color]} size={[1.4, 2.4]} radius={[R(p), R(p)]} travel={40} plane={-18} turns={1.5} seed={7} />,
};

/** Escudo Hexagonal — uma casca de células; algumas acendem quando algo encosta. */
const EscudoHex: AuraFx = {
  Back: (p) => {
    const cells = [0, 60, 120, 180, 240, 300].flatMap((d) => [polar(R(p) + 26, d), polar(R(p) + 44, d + 30)]);
    const hex = (q: { x: number; y: number }, s: number) => [0, 60, 120, 180, 240, 300].map((a) => `${(q.x + s * Math.cos((a * Math.PI) / 180)).toFixed(1)},${(q.y + s * Math.sin((a * Math.PI) / 180)).toFixed(1)}`).join(' ');
    return (
      <FxExtent r={R(p) + 60}>
        <Spin period={90000}>
          <G fill={p.v.color} fillOpacity={0.05} stroke={p.v.color} strokeOpacity={0.6} strokeWidth={0.9}>
            {cells.map((q, i) => (
              <Polygon key={i} points={hex(q, 12)} />
            ))}
          </G>
        </Spin>
        {[0, 0.33, 0.66].map((ph, i) => (
          <Glimmer key={ph} period={3600} phase={ph} window={0.3} peak={0.9}>
            <Polygon points={hex(cells[i * 4], 12)} fill={c2(p)} fillOpacity={0.4} stroke={W} strokeWidth={1.1} />
          </Glimmer>
        ))}
      </FxExtent>
    );
  },
};

/** Cinturão de Radiação — dois lóbulos de partículas presas pelo campo, um de cada lado. */
const CinturaoRadiacao: AuraFx = {
  Back: (p) => (
    <>
      <FxExtent r={110}>
        <Breathe period={4200} opacity={[0.5, 0.9]}>
          <G fill={p.v.color} fillOpacity={0.1} stroke={p.v.color} strokeOpacity={0.5} strokeWidth={0.9} transform={`rotate(-18 ${C} ${C})`}>
            <Ellipse cx={C - R(p) - 30} cy={C} rx={34} ry={20} />
            <Ellipse cx={C + R(p) + 30} cy={C} rx={34} ry={20} />
            <Ellipse cx={C - R(p) - 24} cy={C} rx={20} ry={10} stroke={c2(p)} />
            <Ellipse cx={C + R(p) + 24} cy={C} rx={20} ry={10} stroke={c2(p)} />
          </G>
        </Breathe>
      </FxExtent>
      <Particles mode="orbit" half="back" count={10} period={7000} colors={[W, p.v.color]} size={[1.4, 2.4]} radius={[R(p) + 20, R(p) + 60]} tilt={0.3} plane={-18} seed={9} />
    </>
  ),
  Front: (p) => <Particles mode="orbit" half="front" count={10} period={7000} colors={[W, p.v.color]} size={[1.4, 2.4]} radius={[R(p) + 20, R(p) + 60]} tilt={0.3} plane={-18} seed={9} />,
};

/** Auroras Polares — um oval de luz em cada polo. */
const AuroraPolar: AuraFx = {
  Back: (p) => (
    <FxExtent r={R(p) + 30}>
      <Sway period={5200} degrees={3} glow={{ period: 3200, opacity: [0.5, 1] }}>
        <G fill="none" transform={`rotate(-18 ${C} ${C})`}>
          {[-1, 1].map((s) => (
            <G key={s}>
              <Ellipse cx={C} cy={C + s * R(p) * 0.82} rx={R(p) * 0.6} ry={R(p) * 0.2} stroke={s < 0 ? p.v.color : c2(p)} strokeWidth={3.4} strokeOpacity={0.7} />
              <Ellipse cx={C} cy={C + s * R(p) * 0.94} rx={R(p) * 0.42} ry={R(p) * 0.13} stroke={W} strokeWidth={1} strokeOpacity={0.7} />
            </G>
          ))}
        </G>
      </Sway>
    </FxExtent>
  ),
  Front: (p) => <Particles mode="rise" count={7} period={3400} colors={[p.v.color, W]} size={[1.4, 2.4]} radius={[R(p) * 0.6, R(p)]} arc={[-40, 40]} travel={24} seed={11} />,
};

/** Chamas Frias — línguas de fogo azul em volta do corpo: queimam sem esquentar. */
const ChamasFrias: AuraFx = {
  Back: (p) => (
    <FxExtent r={R(p) + 34}>
      <Breathe period={1700} scale={[0.96, 1.06]} opacity={[0.55, 0.95]}>
        <G fill={p.v.color} fillOpacity={0.6}>
          {Array.from({ length: 14 }, (_, i) => (
            <Path key={i} d={flame(i * 25.7, R(p) - 2, 14 + (i % 3) * 8, 13, i % 2 ? 5 : -5)} />
          ))}
        </G>
      </Breathe>
      <Breathe period={1300} scale={[0.97, 1.04]} opacity={[0.5, 0.9]}>
        <G fill={c2(p)} fillOpacity={0.7}>
          {Array.from({ length: 10 }, (_, i) => (
            <Path key={i} d={flame(i * 36 + 12, R(p) - 2, 8 + (i % 2) * 5, 9, i % 2 ? -3 : 3)} />
          ))}
        </G>
      </Breathe>
    </FxExtent>
  ),
};

/** Lótus de Luz — oito pétalas que se abrem e se fecham em volta do corpo. */
const Lotus: AuraFx = {
  Back: (p) => {
    const petal = (deg: number, len: number, w: number) => {
      const tip = polar(R(p) + len, deg);
      const a = polar(R(p) - 2, deg - w);
      const b = polar(R(p) - 2, deg + w);
      const ca = polar(R(p) + len * 0.6, deg - w * 1.5);
      const cb = polar(R(p) + len * 0.6, deg + w * 1.5);
      return `M${a.x.toFixed(1)} ${a.y.toFixed(1)} Q${ca.x.toFixed(1)} ${ca.y.toFixed(1)} ${tip.x.toFixed(1)} ${tip.y.toFixed(1)} Q${cb.x.toFixed(1)} ${cb.y.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)} Z`;
    };
    return (
      <FxExtent r={R(p) + 56}>
        <Breathe period={5600} scale={[0.86, 1.06]} opacity={[0.6, 1]}>
          <G fill={p.v.color} fillOpacity={0.26} stroke={p.v.color} strokeOpacity={0.8} strokeWidth={0.9} strokeLinejoin="round">
            {Array.from({ length: 8 }, (_, i) => (
              <Path key={i} d={petal(i * 45, 50, 16)} />
            ))}
          </G>
        </Breathe>
        <Breathe period={5600} phase={0.25} scale={[0.9, 1.05]} opacity={[0.6, 1]}>
          <G fill={c2(p)} fillOpacity={0.3} stroke={W} strokeOpacity={0.7} strokeWidth={0.8} strokeLinejoin="round">
            {Array.from({ length: 8 }, (_, i) => (
              <Path key={i} d={petal(i * 45 + 22.5, 30, 13)} />
            ))}
          </G>
        </Breathe>
      </FxExtent>
    );
  },
};

/** Coroa de Espinhos — pontas finas e longas, girando. */
const Espinhos: AuraFx = {
  Back: (p) => (
    <FxExtent r={R(p) + 60}>
      <Spin period={40000}>
        <G fill={p.v.color}>
          {Array.from({ length: 16 }, (_, i) => (
            <Polygon key={i} points={ray(i * 22.5, R(p) + 2, R(p) + (i % 2 ? 30 : 54), i % 2 ? 2.4 : 1.6)} fillOpacity={i % 2 ? 0.6 : 0.9} />
          ))}
        </G>
        <Circle cx={C} cy={C} r={R(p) + 6} stroke={c2(p)} strokeOpacity={0.7} strokeWidth={1} fill="none" />
      </Spin>
    </FxExtent>
  ),
};

// ————————————————————————————————————————————————————— raros

/** Arcos de Plasma — descargas que saltam do corpo para o vazio e voltam. */
const Plasma: AuraFx = {
  Back: (p) => {
    const id = useGid('fp');
    return (
      <FxExtent r={110}>
        <Breathe period={2400} opacity={[0.5, 0.9]}>
          <Halo id={id} color={p.v.color} r0={R(p)} r1={R(p) + 46} o={0.4} />
        </Breathe>
        {[0, 0.2, 0.4, 0.6, 0.8].map((ph, i) => (
          <Glimmer key={ph} period={3000} phase={ph} window={0.2} peak={1}>
            <Polyline points={lightning(i * 72 + 10, R(p), 104, 7, 10, 30 + i)} stroke={i % 2 ? W : p.v.color} strokeWidth={1.6} fill="none" strokeLinejoin="round" />
            <Polyline points={lightning(i * 72 + 26, R(p), 84, 5, 8, 40 + i)} stroke={c2(p)} strokeWidth={0.9} fill="none" strokeLinejoin="round" />
          </Glimmer>
        ))}
      </FxExtent>
    );
  },
};

/** Teia de Luz — nós ligados por cordas: todos com todos. */
const Teia: AuraFx = {
  Back: (p) => {
    const n = 9;
    const nodes = Array.from({ length: n }, (_, i) => polar(96, (360 / n) * i));
    return (
      <>
        <FxExtent r={104}>
          <Spin period={70000}>
            <G stroke={p.v.color} strokeOpacity={0.34} strokeWidth={0.7}>
              {nodes.flatMap((a, i) => nodes.slice(i + 2, i + n - 1).map((b, j) => <Line key={`${i}-${j}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />))}
            </G>
            {nodes.map((q, i) => (
              <Circle key={i} cx={q.x} cy={q.y} r={2.6} fill={i % 3 ? p.v.color : W} />
            ))}
          </Spin>
        </FxExtent>
        <Particles mode="twinkle" count={6} period={3200} colors={[W]} size={[2.4, 3.6]} radius={[96, 96]} sparkle seed={13} />
      </>
    );
  },
};

/** Música das Esferas — quatro órbitas em razões inteiras (1 : 2 : 3 : 4): quando se alinham, é um acorde. */
const Musica: AuraFx = {
  Back: (p) => (
    <>
      <FxExtent r={112}>
        <Layer>
          <G fill="none" stroke={p.v.color} strokeOpacity={0.4} strokeWidth={0.8}>
            {[0, 1, 2, 3].map((i) => (
              <Circle key={i} cx={C} cy={C} r={R(p) + 16 + i * 17} strokeDasharray={i % 2 ? '1 4' : undefined} />
            ))}
          </G>
        </Layer>
      </FxExtent>
      {[0, 1, 2, 3].map((i) => (
        <Particles key={i} mode="orbit" count={1} period={24000 / (i + 1)} colors={[i % 2 ? c2(p) : W]} size={[4, 4]} radius={[R(p) + 16 + (3 - i) * 17, R(p) + 16 + (3 - i) * 17]} trail={4} glow seed={15 + i} />
      ))}
    </>
  ),
};

/** Campo de Dobra — duas bolhas elípticas que se alternam: uma aperta enquanto a outra estica. */
const DobraCampo: AuraFx = {
  Back: (p) => (
    <FxExtent r={112}>
      <Breathe period={3400} scale={[0.86, 1.1]} opacity={[0.45, 0.95]}>
        <Ellipse cx={C} cy={C} rx={R(p) + 60} ry={R(p) + 20} fill={p.v.color} fillOpacity={0.07} stroke={p.v.color} strokeWidth={1.4} transform={`rotate(-18 ${C} ${C})`} />
        <Ellipse cx={C} cy={C} rx={R(p) + 48} ry={R(p) + 12} stroke={W} strokeOpacity={0.5} strokeWidth={0.7} fill="none" strokeDasharray="4 6" transform={`rotate(-18 ${C} ${C})`} />
      </Breathe>
      <Breathe period={3400} phase={0.5} scale={[0.86, 1.1]} opacity={[0.45, 0.95]}>
        <Ellipse cx={C} cy={C} rx={R(p) + 20} ry={R(p) + 56} fill={c2(p)} fillOpacity={0.06} stroke={c2(p)} strokeWidth={1.4} transform={`rotate(-18 ${C} ${C})`} />
      </Breathe>
    </FxExtent>
  ),
  Front: (p) => <Particles mode="streak" count={8} period={2000} colors={[W, p.v.color]} size={[1.2, 2]} radius={[R(p) + 10, 96]} travel={114} plane={162} trail={4} seed={19} />,
};

/** Campo de Geada — seis braços de cristal crescendo do corpo, cada um se ramificando. */
const GeloCampo: AuraFx = {
  Back: (p) => {
    const arm = (deg: number) => {
      const out: string[] = [];
      const tip = polar(R(p) + 58, deg);
      const base = polar(R(p), deg);
      out.push(`M${base.x.toFixed(1)} ${base.y.toFixed(1)} L${tip.x.toFixed(1)} ${tip.y.toFixed(1)}`);
      for (const k of [0.3, 0.52, 0.74]) {
        const m = polar(R(p) + 58 * k, deg);
        for (const s of [-1, 1]) {
          const b = polar(R(p) + 58 * k + 15 * (1 - k * 0.5), deg + s * (24 - k * 10));
          out.push(`M${m.x.toFixed(1)} ${m.y.toFixed(1)} L${b.x.toFixed(1)} ${b.y.toFixed(1)}`);
        }
      }
      return out.join(' ');
    };
    return (
      <>
        <FxExtent r={R(p) + 64}>
          <Breathe period={6200} scale={[0.9, 1.03]} opacity={[0.65, 1]}>
            <G stroke={p.v.color} strokeWidth={1.5} strokeLinecap="round" fill="none">
              {[0, 60, 120, 180, 240, 300].map((d) => (
                <Path key={d} d={arm(d)} />
              ))}
            </G>
            <G stroke={W} strokeOpacity={0.7} strokeWidth={0.6} strokeLinecap="round" fill="none">
              {[30, 90, 150, 210, 270, 330].map((d) => {
                const a = polar(R(p), d);
                const b = polar(R(p) + 26, d);
                return <Line key={d} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
              })}
            </G>
          </Breathe>
        </FxExtent>
        <Particles mode="twinkle" count={8} period={3400} colors={[W, p.v.color]} size={[2, 3.4]} radius={[R(p) + 20, R(p) + 60]} sparkle seed={21} />
      </>
    );
  },
};

/** Enxame de Fótons — dezenas de pontos velozes, em vários planos, rente ao corpo. */
const EnxameFotons: AuraFx = {
  Back: (p) => (
    <>
      {[-50, 10, 60].map((plane, i) => (
        <Particles key={plane} mode="orbit" half="back" count={7} period={2600 + i * 700} colors={[W, i === 1 ? c2(p) : p.v.color]} size={[1.4, 2.4]} radius={[R(p) + 10, R(p) + 22]} tilt={0.36} plane={plane} trail={3} seed={23 + i} />
      ))}
    </>
  ),
  Front: (p) => (
    <>
      {[-50, 10, 60].map((plane, i) => (
        <Particles key={plane} mode="orbit" half="front" count={7} period={2600 + i * 700} colors={[W, i === 1 ? c2(p) : p.v.color]} size={[1.4, 2.4]} radius={[R(p) + 10, R(p) + 22]} tilt={0.36} plane={plane} trail={3} seed={23 + i} />
      ))}
    </>
  ),
};

// ————————————————————————————————————————————————————— épicos

/** Coroa do Eclipse — serpentinas longas, proeminências rosadas e o anel de diamante. */
const CoroaEclipse: AuraFx = {
  Back: (p) => {
    const id = useGid('fe');
    return (
      <FxExtent r={116}>
        <Breathe period={5200} opacity={[0.6, 1]} scale={[0.98, 1.03]}>
          <Halo id={id} color={p.v.color} r0={R(p)} r1={R(p) + 70} o={0.45} />
        </Breathe>
        <Sway period={7400} degrees={4} glow={{ period: 4200, opacity: [0.6, 1] }}>
          <G fill={W} fillOpacity={0.5}>
            {[20, 70, 110, 160, 200, 250, 290, 340].map((d, i) => (
              <Polygon key={d} points={ray(d, R(p), R(p) + (i % 2 ? 46 : 76), i % 2 ? 7 : 4)} />
            ))}
          </G>
        </Sway>
        <Breathe period={2600} opacity={[0.6, 1]}>
          <G fill="none" stroke="#FF5C7A" strokeWidth={2.2} strokeLinecap="round">
            {[48, 190, 300].map((d) => {
              const a = polar(R(p), d - 8);
              const b = polar(R(p), d + 8);
              const t = polar(R(p) + 13, d);
              return <Path key={d} d={`M${a.x.toFixed(1)} ${a.y.toFixed(1)} Q${t.x.toFixed(1)} ${t.y.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`} />;
            })}
          </G>
        </Breathe>
      </FxExtent>
    );
  },
  Front: (p) => {
    const d = polar(R(p) + 1, 42);
    return (
      <FxExtent r={R(p) + 26}>
        <Glimmer period={5200} window={0.5} peak={1}>
          <Circle cx={d.x} cy={d.y} r={11} fill={c2(p)} fillOpacity={0.35} />
          <Circle cx={d.x} cy={d.y} r={4} fill={W} />
          <Path d={`M${d.x - 18} ${d.y} H${d.x + 18} M${d.x} ${d.y - 18} V${d.y + 18}`} stroke={W} strokeWidth={1} strokeLinecap="round" />
        </Glimmer>
      </FxExtent>
    );
  },
};

/** Tempestade Magnética — os laços de campo se torcem, estalam e acendem auroras. */
const TempestadeMag: AuraFx = {
  Back: (p) => (
    <FxExtent r={114}>
      <Spin period={18000}>
        <G fill="none" stroke={p.v.color} strokeLinecap="round">
          {[0.8, 1.2, 1.7].map((k, i) => (
            <G key={k} strokeOpacity={0.85 - i * 0.2} strokeWidth={1.4 - i * 0.2}>
              <Ellipse cx={C - R(p) * k * 0.6} cy={C} rx={R(p) * k * 0.6} ry={R(p) * k * 0.95} />
              <Ellipse cx={C + R(p) * k * 0.6} cy={C} rx={R(p) * k * 0.6} ry={R(p) * k * 0.95} />
            </G>
          ))}
        </G>
      </Spin>
      <Spin period={29000} reverse>
        <G fill="none" stroke={c2(p)} strokeOpacity={0.6} strokeWidth={0.9}>
          {[1, 1.5].map((k) => (
            <G key={k}>
              <Ellipse cx={C} cy={C - R(p) * k * 0.6} rx={R(p) * k * 0.95} ry={R(p) * k * 0.6} />
              <Ellipse cx={C} cy={C + R(p) * k * 0.6} rx={R(p) * k * 0.95} ry={R(p) * k * 0.6} />
            </G>
          ))}
        </G>
      </Spin>
      {[0, 0.25, 0.5, 0.75].map((ph, i) => (
        <Glimmer key={ph} period={2400} phase={ph} window={0.16} peak={1}>
          <Polyline points={lightning(i * 90 + 30, R(p), 106, 7, 11, 50 + i)} stroke={W} strokeWidth={1.5} fill="none" strokeLinejoin="round" />
        </Glimmer>
      ))}
      <Wave period={3600} from={R(p)} to={112} drawnAt={70} peak={0.5}>
        <Circle cx={C} cy={C} r={70} stroke={p.v.color} strokeWidth={1.2} fill="none" />
      </Wave>
    </FxExtent>
  ),
  Front: (p) => <Particles mode="helix" count={12} period={2400} colors={[W, p.v.color, c2(p)]} size={[1.6, 2.6]} radius={[R(p), R(p)]} travel={56} plane={-18} turns={2.5} seed={25} />,
};

/** Rosácea r = cos(kθ): pétalas geradas por uma fórmula. */
function rose(k: number, a: number, rot = 0): string {
  let d = '';
  const steps = 180;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const r = a * Math.cos(k * t);
    d += `${i ? 'L' : 'M'}${(C + r * Math.cos(t + rot)).toFixed(1)} ${(C + r * Math.sin(t + rot)).toFixed(1)} `;
  }
  return `${d}Z`;
}

/** Cimática — figuras de vibração: duas rosáceas (r = cos 4θ e r = cos 3θ) girando uma contra a outra. */
const Cimatica: AuraFx = {
  Back: (p) => (
    <>
      <FxExtent r={114}>
        <Spin period={46000}>
          <Path d={rose(4, 110)} stroke={p.v.color} strokeWidth={1.3} fill={p.v.color} fillOpacity={0.05} strokeLinejoin="round" />
        </Spin>
        <Spin period={31000} reverse>
          <Path d={rose(3, 92, 0.5)} stroke={c2(p)} strokeWidth={1.2} fill="none" strokeLinejoin="round" />
        </Spin>
        <Breathe period={4200} scale={[0.8, 1.05]} opacity={[0.5, 1]}>
          <Path d={rose(6, R(p) + 30)} stroke={W} strokeWidth={0.9} fill="none" strokeLinejoin="round" />
        </Breathe>
        {[0, 0.5].map((ph) => (
          <Wave key={ph} period={4200} phase={ph} from={R(p)} to={112} drawnAt={70} peak={0.4}>
            <Circle cx={C} cy={C} r={70} stroke={p.v.color} strokeWidth={1} fill="none" />
          </Wave>
        ))}
      </FxExtent>
      <Extra>
        <Particles mode="twinkle" count={8} period={4200} colors={[W, p.v.color]} size={[2, 3.2]} radius={[100, 110]} sparkle seed={27} />
      </Extra>
    </>
  ),
};

/** Escamas de Luz — fileiras de escamas em volta do corpo; uma onda de brilho as percorre. */
const Escamas: AuraFx = {
  Back: (p) => {
    const row = (r: number, n: number, off: number) =>
      Array.from({ length: n }, (_, i) => {
        const d = (360 / n) * i + off;
        return arc(r, d - 360 / n / 2 + 1, d + 360 / n / 2 - 1);
      });
    return (
      <FxExtent r={R(p) + 60}>
        <Spin period={60000}>
          <G fill="none" strokeLinecap="round">
            {[0, 1, 2, 3].map((k) =>
              row(R(p) + 10 + k * 12, 10 + k * 3, k % 2 ? 0 : 180 / (10 + k * 3)).map((d, i) => <Path key={`${k}-${i}`} d={d} stroke={k % 2 ? c2(p) : p.v.color} strokeOpacity={0.7 - k * 0.1} strokeWidth={6 - k * 0.8} />),
            )}
          </G>
        </Spin>
        {[0, 1, 2, 3].map((k) => (
          <Glimmer key={k} period={3200} phase={1 - k * 0.2} window={0.3} peak={0.8}>
            <Circle cx={C} cy={C} r={R(p) + 10 + k * 12} stroke={W} strokeWidth={5 - k * 0.6} strokeOpacity={0.5} fill="none" strokeDasharray="12 20" />
          </Glimmer>
        ))}
      </FxExtent>
    );
  },
};

// ————————————————————————————————————————————————————— lendários

/** Auréola Primordial — anéis de luz, uma faixa de sinais girando, raios e pulsos: a primeira luz. */
const Aureola: AuraFx = {
  Back: (p) => {
    const id = useGid('fa');
    return (
      <>
        <FxExtent r={118}>
          <Breathe period={4200} opacity={[0.6, 1]} scale={[0.98, 1.03]}>
            <Halo id={id} color={p.v.color} r0={R(p)} r1={116} o={0.4} />
          </Breathe>
          <Spin period={90000}>
            <G fill={p.v.color} fillOpacity={0.2}>
              {Array.from({ length: 24 }, (_, i) => (
                <Polygon key={i} points={ray(i * 15, R(p) + 4, i % 2 ? 116 : 96, i % 2 ? 2 : 3.4)} />
              ))}
            </G>
          </Spin>
          <Spin period={36000} reverse>
            <Circle cx={C} cy={C} r={98} stroke={c2(p)} strokeWidth={1.4} fill="none" />
            <Circle cx={C} cy={C} r={108} stroke={c2(p)} strokeWidth={1.4} fill="none" />
            {Array.from({ length: 12 }, (_, i) => {
              const a = polar(103, i * 30);
              return i % 2 ? (
                <Polygon key={i} points={ngon(3, 4, i * 30).replace(/([\d.]+),([\d.]+)/g, (_, x, y) => `${(Number(x) - C + a.x).toFixed(1)},${(Number(y) - C + a.y).toFixed(1)}`)} fill={W} />
              ) : (
                <Circle key={i} cx={a.x} cy={a.y} r={2.4} fill="none" stroke={W} strokeWidth={1} />
              );
            })}
          </Spin>
          {[0, 0.33, 0.66].map((ph) => (
            <Wave key={ph} period={4200} phase={ph} from={R(p)} to={96} drawnAt={70} peak={0.6}>
              <Circle cx={C} cy={C} r={70} stroke={W} strokeWidth={1.4} fill="none" />
            </Wave>
          ))}
        </FxExtent>
        <Particles mode="rise" count={10} period={4200} colors={[W, p.v.color, c2(p)]} size={[1.8, 3]} radius={[R(p), 100]} travel={30} sparkle glow seed={29} />
      </>
    );
  },
  Front: (p) => (
    <Extra min={0.8}>
      <Particles mode="twinkle" count={8} period={3000} colors={[W, c2(p)]} size={[2, 3.4]} radius={[96, 112]} sparkle seed={31} />
    </Extra>
  ),
};

/** Curva de Koch (floco de neve): cada lado vira quatro, e de novo, e de novo. */
function koch(radius: number, depth: number, rot = 0): string {
  let pts: [number, number][] = [0, 1, 2].map((i) => {
    const a = ((rot + i * 120 - 90) * Math.PI) / 180;
    return [C + radius * Math.cos(a), C + radius * Math.sin(a)];
  });
  for (let d = 0; d < depth; d++) {
    const next: [number, number][] = [];
    for (let i = 0; i < pts.length; i++) {
      const [x0, y0] = pts[i];
      const [x1, y1] = pts[(i + 1) % pts.length];
      const dx = (x1 - x0) / 3;
      const dy = (y1 - y0) / 3;
      const ax = x0 + dx;
      const ay = y0 + dy;
      const bx = x0 + 2 * dx;
      const by = y0 + 2 * dy;
      // O bico aponta para fora (triângulo percorrido no sentido horário).
      const px = ax + dx * 0.5 + dy * 0.866;
      const py = ay + dy * 0.5 - dx * 0.866;
      next.push([x0, y0], [ax, ay], [px, py], [bx, by]);
    }
    pts = next;
  }
  return pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
}

/** Coroa Fractal — flocos de Koch aninhados: perímetro infinito, área finita. */
const Fractal: AuraFx = {
  Back: (p) => {
    const id = useGid('fk');
    return (
      <>
        <FxExtent r={118}>
          <Breathe period={5200} opacity={[0.55, 0.95]}>
            <Halo id={id} color={p.v.color} r0={R(p)} r1={114} o={0.34} />
          </Breathe>
          <Spin period={70000}>
            <Polygon points={koch(112, 3)} stroke={p.v.color} strokeWidth={1.2} fill={p.v.color} fillOpacity={0.05} strokeLinejoin="round" />
          </Spin>
          <Spin period={48000} reverse>
            <Polygon points={koch(88, 3, 60)} stroke={c2(p)} strokeWidth={1.1} fill="none" strokeLinejoin="round" />
          </Spin>
          <Spin period={30000}>
            <Polygon points={koch(R(p) + 28, 2)} stroke={W} strokeWidth={1} fill={W} fillOpacity={0.05} strokeLinejoin="round" />
          </Spin>
          {[0, 0.5].map((ph) => (
            <Wave key={ph} period={5200} phase={ph} from={R(p)} to={114} drawnAt={80} peak={0.5} hold={0.2}>
              <Polygon points={koch(80, 2, 30)} stroke={W} strokeWidth={1.2} fill="none" strokeLinejoin="round" />
            </Wave>
          ))}
        </FxExtent>
        <Particles mode="twinkle" count={12} period={3400} colors={[W, p.v.color, c2(p)]} size={[2, 3.6]} radius={[84, 112]} sparkle glow seed={33} />
      </>
    );
  },
  Front: (p) => (
    <Extra min={0.8}>
      <Particles mode="radial" count={9} period={5200} colors={[W, p.v.color]} size={[1.6, 2.8]} radius={[R(p), 112]} sparkle seed={35} />
    </Extra>
  ),
};

export const FIELDS: Record<string, AuraFx> = {
  'coroa-solar': CoroaSolar,
  'halo-frio': HaloFrio,
  'vento-estelar': VentoEstelar,
  fumaca: Fumaca,
  estatica: Estatica,
  bolha: Bolha,
  'raios-suaves': RaiosSuaves,
  magnetosfera: Magnetosfera,
  'escudo-hex': EscudoHex,
  'cinturao-radiacao': CinturaoRadiacao,
  'aurora-polar': AuroraPolar,
  'chamas-frias': ChamasFrias,
  lotus: Lotus,
  espinhos: Espinhos,
  plasma: Plasma,
  teia: Teia,
  musica: Musica,
  'dobra-campo': DobraCampo,
  'gelo-campo': GeloCampo,
  'enxame-fotons': EnxameFotons,
  'coroa-eclipse': CoroaEclipse,
  'tempestade-mag': TempestadeMag,
  cimatica: Cimatica,
  escamas: Escamas,
  aureola: Aureola,
  fractal: Fractal,
};
