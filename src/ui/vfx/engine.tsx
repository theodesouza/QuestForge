/**
 * Motor de efeitos do astrolábio.
 *
 * Princípios de desempenho (celulares Android intermediários):
 * - Cada efeito é uma CAMADA: um Animated.View com SVG estático dentro. A animação
 *   mexe só em transform/opacity no thread de UI (Reanimated) — o SVG nunca é
 *   redesenhado quadro a quadro.
 * - Partículas são Views simples (círculos e losangos), movidas por um único relógio
 *   compartilhado por sistema; a fase de cada uma é constante.
 * - Nada de blur, sombras ou filtros. Nada pisca rápido: o menor ciclo de brilho é ~1 s.
 * - Densidade (Ajustes → Intensidade dos efeitos) reduz partículas e remove as camadas
 *   secundárias (`Extra`); com movimento reduzido, tudo fica parado num quadro bonito.
 * - Modo plano (`flat`): miniaturas e movimento reduzido desenham TODAS as camadas como
 *   grupos de um único SVG (partículas viram círculos) — um bitmap só, em vez de dezenas.
 * - Pausa (`paused`): telas fora de foco congelam os relógios sem desmontar nada; ao
 *   voltar, cada relógio continua de onde parou.
 *
 * Coordenadas: palco 240 × 240, centro (120, 120). O disco do astrolábio tem raio 84;
 * auras vivem entre 84 e 120; núcleos até ~46.
 */
import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle, G, Polygon } from 'react-native-svg';

export const STAGE = 240;
export const C = 120;

export interface FxConfig {
  /** false = movimento reduzido: tudo parado. */
  animate: boolean;
  /** 0,35 (baixo) · 0,65 (médio) · 1 (alto): multiplica partículas e camadas extras. */
  density: number;
  /** Lado do palco em pixels. */
  px: number;
  /**
   * Desenho plano: as camadas viram grupos (`<G>`) de um SVG único, que quem usa o
   * motor precisa fornecer. Sempre estático.
   */
  flat?: boolean;
  /** Fora de foco: os relógios congelam onde estão (sem custo por quadro). */
  paused?: boolean;
  /**
   * Raio (unidades do palco) até onde as camadas desenham. Cada camada vira um bitmap no
   * Android: núcleos (raio ~60) não precisam de um bitmap do palco inteiro.
   */
  extent?: number;
}

export const FxContext = createContext<FxConfig>({ animate: true, density: 1, px: 200 });
export const useFx = () => useContext(FxContext);

export function FxProvider({ value, children }: { value: FxConfig; children: ReactNode }) {
  return <FxContext.Provider value={value}>{children}</FxContext.Provider>;
}

/** Limita o tamanho das camadas internas a um raio em torno do centro (economiza memória). */
export function FxExtent({ r, children }: { r: number; children: ReactNode }) {
  const fx = useFx();
  const value = useMemo(() => ({ ...fx, extent: r }), [fx, r]);
  return <FxContext.Provider value={value}>{children}</FxContext.Provider>;
}

/** Quantas partículas desenhar, conforme a densidade (sempre ao menos `min`). */
export function useCount(base: number, min = 1): number {
  const { density } = useFx();
  return Math.max(min, Math.round(base * density));
}

/**
 * Camada secundária: some quando a intensidade fica abaixo de `min`
 * (0,5 = some na Baixa; 0,8 = some também na Média). A identidade de cada efeito
 * fica nas camadas principais; `Extra` é só riqueza.
 */
export function Extra({ min = 0.5, children }: { min?: number; children: ReactNode }) {
  const { density } = useFx();
  return density >= min ? <>{children}</> : null;
}

// ————————————————————————————————————————————————————— relógios

/**
 * Relógio 0→1 em loop linear. Parado (movimento reduzido), fica em `rest`,
 * o que distribui fases e partículas num quadro estático equilibrado.
 */
export function useLoop(periodMs: number, rest = 0.3): SharedValue<number> {
  const { animate, paused } = useFx();
  const v = useSharedValue(rest);
  useEffect(() => {
    if (!animate) {
      cancelAnimation(v);
      v.set(rest);
      return;
    }
    if (paused) {
      cancelAnimation(v); // congela onde está
      return;
    }
    const loop = withRepeat(withTiming(1, { duration: periodMs, easing: Easing.linear }), -1, false);
    const from = v.get();
    if (from > 0 && from < 1) {
      // Continua do ponto atual (montagem ou volta de uma pausa) sem pular.
      v.set(withSequence(withTiming(1, { duration: (1 - from) * periodMs, easing: Easing.linear }), withTiming(0, { duration: 0 }), loop));
    } else {
      v.set(0);
      v.set(loop);
    }
    return () => cancelAnimation(v);
  }, [animate, paused, periodMs, rest, v]);
  return v;
}

const TAU = Math.PI * 2;

// Curvas compartilhadas pelo modo animado (worklets) e pelo plano (quadro em repouso).
function breatheK(t: number, phase: number): number {
  'worklet';
  return 0.5 - 0.5 * Math.cos((t + phase) * TAU);
}

function waveFrame(t: number, phase: number, hold: number, from: number, to: number, drawnAt: number, peak: number): { o: number; s: number } {
  'worklet';
  const raw = (t + phase) % 1;
  const active = 1 - hold;
  if (raw > active) return { o: 0, s: from / drawnAt };
  const u = raw / active;
  const r = from + (to - from) * u;
  const o = peak * Math.sin(Math.PI * Math.min(1, u * 1.15)) * (1 - u * 0.35);
  return { o: Math.max(0, o), s: r / drawnAt };
}

function glimmerO(t: number, phase: number, window: number): number {
  'worklet';
  const u = (t + phase) % 1;
  return u < window ? Math.sin((u / window) * Math.PI) : 0;
}

/** Grupo plano: opacidade, giro e escala em torno do centro do palco. */
function FlatG({ opacity = 1, rotate = 0, scale = 1, children }: { opacity?: number; rotate?: number; scale?: number; children: ReactNode }) {
  const parts: string[] = [];
  if (rotate) parts.push(`rotate(${rotate.toFixed(2)} ${C} ${C})`);
  if (scale !== 1) parts.push(`translate(${C} ${C}) scale(${scale.toFixed(4)}) translate(${-C} ${-C})`);
  return (
    <G opacity={opacity} transform={parts.length ? parts.join(' ') : undefined}>
      {children}
    </G>
  );
}

// ————————————————————————————————————————————————————— camadas

const fill = StyleSheet.absoluteFill;

/** Camada estática: um SVG do palco inteiro. */
export function Layer({ children, opacity = 1, style }: { children: ReactNode; opacity?: number; style?: StyleProp<ViewStyle> }) {
  const { px, flat, extent } = useFx();
  if (flat) return <FlatG opacity={opacity}>{children}</FlatG>;
  const e = Math.min(C, extent ?? C);
  const unit = px / STAGE;
  const box = e < C ? { position: 'absolute' as const, left: (C - e) * unit, top: (C - e) * unit, width: 2 * e * unit, height: 2 * e * unit } : fill;
  return (
    <View pointerEvents="none" style={[box, { opacity }, style]}>
      <Svg width={2 * e * unit} height={2 * e * unit} viewBox={`${C - e} ${C - e} ${2 * e} ${2 * e}`}>
        {children}
      </Svg>
    </View>
  );
}

/** Gira o conteúdo em torno do centro do palco. */
export function Spin(props: { period: number; reverse?: boolean; opacity?: number; children: ReactNode }) {
  const { flat } = useFx();
  return flat ? <FlatG opacity={props.opacity}>{props.children}</FlatG> : <LiveSpin {...props} />;
}

function LiveSpin({ period, reverse = false, opacity = 1, children }: { period: number; reverse?: boolean; opacity?: number; children: ReactNode }) {
  const t = useLoop(period, 0);
  const dir = reverse ? -1 : 1;
  const s = useAnimatedStyle(() => ({ transform: [{ rotate: `${dir * t.value * 360}deg` }] }));
  return (
    <Animated.View pointerEvents="none" style={[fill, { opacity }, s]}>
      <Layer>{children}</Layer>
    </Animated.View>
  );
}

/**
 * Balança o conteúdo para lá e para cá (cortinas, chamas). Opcionalmente a opacidade
 * também respira, num segundo ciclo (as camadas não podem ser aninhadas: o conteúdo é SVG).
 */
interface SwayProps {
  period: number;
  degrees: number;
  phase?: number;
  glow?: { period: number; opacity: [number, number]; phase?: number };
  children: ReactNode;
}

export function Sway(props: SwayProps) {
  const { flat } = useFx();
  if (!flat) return <LiveSway {...props} />;
  const { degrees, phase = 0, glow } = props;
  const [o0, o1] = glow?.opacity ?? [1, 1];
  const k = breatheK(0.25, glow?.phase ?? 0);
  return (
    <FlatG opacity={o0 + (o1 - o0) * k} rotate={Math.sin((0.25 + phase) * TAU) * degrees}>
      {props.children}
    </FlatG>
  );
}

function LiveSway({ period, degrees, phase = 0, glow, children }: SwayProps) {
  const t = useLoop(period, 0.25);
  const g = useLoop(glow?.period ?? period, 0.25);
  const [o0, o1] = glow?.opacity ?? [1, 1];
  const gp = glow?.phase ?? 0;
  const s = useAnimatedStyle(() => {
    const k = breatheK(g.value, gp);
    return { opacity: o0 + (o1 - o0) * k, transform: [{ rotate: `${Math.sin((t.value + phase) * TAU) * degrees}deg` }] };
  });
  return (
    <Animated.View pointerEvents="none" style={[fill, s]}>
      <Layer>{children}</Layer>
    </Animated.View>
  );
}

/** Respiração: escala e opacidade seguem uma senoide suave. */
interface BreatheProps {
  period: number;
  scale?: [number, number];
  opacity?: [number, number];
  phase?: number;
  children: ReactNode;
}

export function Breathe(props: BreatheProps) {
  const { flat } = useFx();
  if (!flat) return <LiveBreathe {...props} />;
  const [s0, s1] = props.scale ?? [1, 1];
  const [o0, o1] = props.opacity ?? [1, 1];
  const k = breatheK(0.25, props.phase ?? 0);
  return (
    <FlatG opacity={o0 + (o1 - o0) * k} scale={s0 + (s1 - s0) * k}>
      {props.children}
    </FlatG>
  );
}

function LiveBreathe({ period, scale = [1, 1], opacity = [1, 1], phase = 0, children }: BreatheProps) {
  const t = useLoop(period, 0.25);
  const [s0, s1] = scale;
  const [o0, o1] = opacity;
  const s = useAnimatedStyle(() => {
    const k = breatheK(t.value, phase);
    return { opacity: o0 + (o1 - o0) * k, transform: [{ scale: s0 + (s1 - s0) * k }] };
  });
  return (
    <Animated.View pointerEvents="none" style={[fill, s]}>
      <Layer>{children}</Layer>
    </Animated.View>
  );
}

/**
 * Onda: o conteúdo (desenhado no raio `drawnAt`) nasce no raio `from` e se expande
 * até `to`, sumindo. Use para pulsos de energia e ondulações.
 */
interface WaveProps {
  period: number;
  from: number;
  to: number;
  drawnAt: number;
  phase?: number;
  peak?: number;
  /** Fração do ciclo em que a onda descansa invisível (pulsos espaçados). */
  hold?: number;
  children: ReactNode;
}

export function Wave(props: WaveProps) {
  const { flat } = useFx();
  if (!flat) return <LiveWave {...props} />;
  const f = waveFrame(0.35, props.phase ?? 0, props.hold ?? 0, props.from, props.to, props.drawnAt, props.peak ?? 0.7);
  if (f.o <= 0.01) return null;
  return (
    <FlatG opacity={f.o} scale={f.s}>
      {props.children}
    </FlatG>
  );
}

function LiveWave({ period, from, to, drawnAt, phase = 0, peak = 0.7, hold = 0, children }: WaveProps) {
  const t = useLoop(period, 0.35);
  const s = useAnimatedStyle(() => {
    const f = waveFrame(t.value, phase, hold, from, to, drawnAt, peak);
    return { opacity: f.o, transform: [{ scale: f.s }] };
  });
  return (
    <Animated.View pointerEvents="none" style={[fill, s]}>
      <Layer>{children}</Layer>
    </Animated.View>
  );
}

/** Acende e apaga numa janela do ciclo (arcos elétricos, runas). Suave: sem piscar rápido. */
interface GlimmerProps {
  period: number;
  phase?: number;
  window?: number;
  peak?: number;
  children: ReactNode;
}

export function Glimmer(props: GlimmerProps) {
  const { flat } = useFx();
  if (!flat) return <LiveGlimmer {...props} />;
  const o = glimmerO(0.5, props.phase ?? 0, props.window ?? 0.35) * (props.peak ?? 1);
  return o > 0.01 ? <FlatG opacity={o}>{props.children}</FlatG> : null;
}

function LiveGlimmer({ period, phase = 0, window = 0.35, peak = 1, children }: GlimmerProps) {
  const t = useLoop(period, 0.5);
  const s = useAnimatedStyle(() => ({ opacity: glimmerO(t.value, phase, window) * peak }));
  return (
    <Animated.View pointerEvents="none" style={[fill, s]}>
      <Layer>{children}</Layer>
    </Animated.View>
  );
}

// ————————————————————————————————————————————————————— partículas

export type ParticleMode =
  /** Sobem a partir de uma faixa, ondulando (brasas, centelhas). */
  | 'rise'
  /** Caem do alto (chuva de luz). */
  | 'fall'
  /** Giram em órbita elíptica, com profundidade (mais claras na frente). */
  | 'orbit'
  /** Nascem num raio e saem em linha reta para fora (faíscas, irradiação). */
  | 'radial'
  /** Convergem em espiral para o centro (carga de energia). */
  | 'converge'
  /** Ficam paradas e cintilam devagar (estrelas). */
  | 'twinkle';

export interface ParticleSpec {
  mode: ParticleMode;
  count: number;
  /** Duração de um ciclo, em ms. */
  period: number;
  colors: string[];
  /** Diâmetro em unidades do palco [mín, máx]. */
  size: [number, number];
  /** Faixa de raios (unidades do palco) onde as partículas vivem. */
  radius: [number, number];
  /** Ângulos permitidos, em graus (0 = topo, sentido horário). Padrão: volta inteira. */
  arc?: [number, number];
  /** Achatamento da órbita (1 = círculo) e inclinação do plano, em graus. */
  tilt?: number;
  plane?: number;
  /** Losango (brilho) em vez de círculo. */
  sparkle?: boolean;
  /** Halo suave ao redor (dobra o custo: use pouco). */
  glow?: boolean;
  /** Distância percorrida em rise/fall (unidades do palco). */
  travel?: number;
  reverse?: boolean;
  seed?: number;
  /** Opacidade máxima. */
  alpha?: number;
  /** Desloca a fase de todas as partículas. */
  phaseShift?: number;
  /**
   * Cauda de cometa: cada partícula ganha `trail` seguidoras atrasadas, menores e mais
   * apagadas — no MESMO sistema (um relógio só), não em sistemas separados.
   */
  trail?: number;
}

function rand(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface P {
  phase: number;
  speed: number;
  angle: number;
  r: number;
  r2: number;
  d: number;
  color: string;
  wobble: number;
  /** Multiplicador de opacidade da partícula (caudas). */
  alpha: number;
  /** Elo de cauda: sem halo (o halo fica só na cabeça). */
  tail: boolean;
}

/** Atraso de fase entre os elos de uma cauda de cometa. */
const TRAIL_LAG = 0.012;

function useParticleItems(spec: ParticleSpec): P[] {
  const { density } = useFx();
  const n = useCount(spec.count);
  const trail = spec.trail ? Math.max(1, Math.round(spec.trail * density)) : 0;
  // Chaves primitivas: arrays literais mudam de identidade a cada render.
  const key = [n, trail, spec.seed ?? 7, spec.mode, spec.size.join(), spec.radius.join(), (spec.arc ?? [0, 360]).join(), spec.colors.join(), spec.phaseShift ?? 0, spec.reverse ? 1 : 0].join('|');
  return useMemo<P[]>(() => {
    const rnd = rand(spec.seed ?? 7);
    const [a0, a1] = spec.arc ?? [0, 360];
    const out: P[] = [];
    for (let i = 0; i < n; i++) {
      const d = spec.size[0] + (spec.size[1] - spec.size[0]) * rnd();
      const head: P = {
        phase: ((i + rnd() * 0.6) / n + (spec.phaseShift ?? 0) + 1) % 1,
        speed: spec.mode === 'orbit' ? 1 : 0.75 + rnd() * 0.5,
        angle: ((a0 + (a1 - a0) * ((i + rnd() * 0.8) / n) - 90) * Math.PI) / 180,
        r: spec.radius[0] + (spec.radius[1] - spec.radius[0]) * rnd(),
        r2: spec.radius[1],
        d,
        color: spec.colors[i % spec.colors.length],
        wobble: 2 + rnd() * 4,
        alpha: 1,
        tail: false,
      };
      out.push(head);
      for (let j = 0; j < trail; j++) {
        const lag = TRAIL_LAG * (j + 1) * (spec.reverse ? 1 : -1);
        out.push({ ...head, phase: (head.phase + lag + 1) % 1, d: d * (0.8 - 0.14 * j), alpha: 0.75 - 0.16 * j, tail: true });
      }
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}

interface ParticleOpts {
  mode: ParticleMode;
  tilt: number;
  plane: number;
  travel: number;
  dir: number;
  r0: number;
}

function optsOf(spec: ParticleSpec): ParticleOpts {
  return {
    mode: spec.mode,
    tilt: spec.tilt ?? 1,
    plane: ((spec.plane ?? 0) * Math.PI) / 180,
    travel: spec.travel ?? 30,
    dir: spec.reverse ? -1 : 1,
    r0: spec.radius[0],
  };
}

/** Posição (unidades do palco, relativa ao centro), opacidade e escala de uma partícula no instante `clock`. */
function particleFrame(p: P, o: ParticleOpts, clock: number): { x: number; y: number; o: number; k: number } {
  'worklet';
  const u = (clock * p.speed + p.phase) % 1;
  if (o.mode === 'orbit') {
    const a = p.angle + o.dir * u * TAU;
    const ex = Math.cos(a) * p.r;
    const ey = Math.sin(a) * p.r * o.tilt;
    const depth = 0.5 + 0.5 * Math.sin(a);
    return {
      x: ex * Math.cos(o.plane) - ey * Math.sin(o.plane),
      y: ex * Math.sin(o.plane) + ey * Math.cos(o.plane),
      o: 0.35 + 0.65 * depth,
      k: 0.75 + 0.45 * depth,
    };
  }
  if (o.mode === 'radial') {
    const r = p.r + (p.r2 + 6 - p.r) * u;
    return { x: Math.cos(p.angle) * r, y: Math.sin(p.angle) * r, o: Math.sin(Math.PI * u), k: 1 - 0.4 * u };
  }
  if (o.mode === 'converge') {
    const a = p.angle + o.dir * (1 - u) * 1.6;
    const r = p.r2 - (p.r2 - o.r0 * 0.4) * u;
    return { x: Math.cos(a) * r, y: Math.sin(a) * r, o: Math.sin(Math.PI * u), k: 1 - 0.5 * u };
  }
  if (o.mode === 'rise' || o.mode === 'fall') {
    const sx = Math.cos(p.angle) * p.r;
    const sy = Math.sin(p.angle) * p.r;
    return {
      x: sx + Math.sin((u + p.phase) * TAU) * p.wobble,
      y: sy + (o.mode === 'rise' ? -1 : 1) * u * o.travel,
      o: Math.sin(Math.PI * u),
      k: 1 - 0.45 * u,
    };
  }
  const w = Math.sin(u * TAU);
  const tw = w > 0 ? w * w : 0;
  return { x: Math.cos(p.angle) * p.r, y: Math.sin(p.angle) * p.r, o: tw, k: 0.55 + 0.6 * tw };
}

export function Particles(spec: ParticleSpec) {
  const { flat } = useFx();
  return flat ? <FlatParticles spec={spec} /> : <LiveParticles spec={spec} />;
}

/** Quadro parado das partículas, desenhado como SVG (modo plano). */
function FlatParticles({ spec }: { spec: ParticleSpec }) {
  const items = useParticleItems(spec);
  const o = optsOf(spec);
  const alpha = spec.alpha ?? 1;
  return (
    <G>
      {items.map((p, i) => {
        const f = particleFrame(p, o, 0.3);
        const op = Math.max(0, f.o) * alpha * p.alpha;
        if (op < 0.02) return null;
        const cx = C + f.x;
        const cy = C + f.y;
        const d = p.d * f.k;
        const body = spec.sparkle ? (
          <Polygon points={`${cx},${cy - d * 0.707} ${cx + d * 0.707},${cy} ${cx},${cy + d * 0.707} ${cx - d * 0.707},${cy}`} fill={p.color} />
        ) : (
          <Circle cx={cx} cy={cy} r={d / 2} fill={p.color} />
        );
        return (
          <G key={i} opacity={op}>
            {spec.glow && !p.tail ? <Circle cx={cx} cy={cy} r={d * 1.3} fill={p.color} fillOpacity={0.22} /> : null}
            {body}
          </G>
        );
      })}
    </G>
  );
}

function LiveParticles({ spec }: { spec: ParticleSpec }) {
  const { px } = useFx();
  const items = useParticleItems(spec);
  const clock = useLoop(spec.period, 0.3);
  const unit = px / STAGE;
  return (
    <View pointerEvents="none" style={fill}>
      {items.map((p, i) => (
        <Particle key={i} p={p} clock={clock} spec={spec} unit={unit} />
      ))}
    </View>
  );
}

function Particle({ p, clock, spec, unit }: { p: P; clock: SharedValue<number>; spec: ParticleSpec; unit: number }) {
  const o = optsOf(spec);
  const alpha = (spec.alpha ?? 1) * p.alpha;
  const s = useAnimatedStyle(() => {
    const f = particleFrame(p, o, clock.value);
    return {
      opacity: Math.max(0, f.o) * alpha,
      transform: [{ translateX: f.x * unit }, { translateY: f.y * unit }, { scale: f.k }, { rotate: '45deg' }],
    };
  });
  const d = p.d * unit;
  const base: ViewStyle = {
    position: 'absolute',
    left: C * unit - d / 2,
    top: C * unit - d / 2,
    width: d,
    height: d,
    borderRadius: spec.sparkle ? d * 0.12 : d / 2,
    backgroundColor: p.color,
  };
  if (!spec.glow || p.tail) return <Animated.View style={[base, s]} />;
  const g = d * 2.6;
  return (
    <Animated.View style={[{ position: 'absolute', left: C * unit - g / 2, top: C * unit - g / 2, width: g, height: g, alignItems: 'center', justifyContent: 'center' }, s]}>
      <View style={{ position: 'absolute', width: g, height: g, borderRadius: g / 2, backgroundColor: p.color, opacity: 0.22 }} />
      <View style={{ width: d, height: d, borderRadius: spec.sparkle ? d * 0.12 : d / 2, backgroundColor: p.color }} />
    </Animated.View>
  );
}
