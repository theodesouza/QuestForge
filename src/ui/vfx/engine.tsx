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
 * - Densidade (Ajustes → Intensidade dos efeitos) reduz partículas e camadas extras;
 *   com movimento reduzido, tudo fica parado num quadro bonito.
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
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg from 'react-native-svg';

export const STAGE = 240;
export const C = 120;

export interface FxConfig {
  /** false = movimento reduzido: tudo parado. */
  animate: boolean;
  /** 0,35 (baixo) · 0,65 (médio) · 1 (alto): multiplica partículas e camadas extras. */
  density: number;
  /** Lado do palco em pixels. */
  px: number;
}

export const FxContext = createContext<FxConfig>({ animate: true, density: 1, px: 200 });
export const useFx = () => useContext(FxContext);

export function FxProvider({ value, children }: { value: FxConfig; children: ReactNode }) {
  return <FxContext.Provider value={value}>{children}</FxContext.Provider>;
}

/** Quantas partículas desenhar, conforme a densidade (sempre ao menos `min`). */
export function useCount(base: number, min = 1): number {
  const { density } = useFx();
  return Math.max(min, Math.round(base * density));
}

// ————————————————————————————————————————————————————— relógios

/**
 * Relógio 0→1 em loop linear. Parado (movimento reduzido), fica em `rest`,
 * o que distribui fases e partículas num quadro estático equilibrado.
 */
export function useLoop(periodMs: number, rest = 0.3): SharedValue<number> {
  const { animate } = useFx();
  const v = useSharedValue(rest);
  useEffect(() => {
    if (!animate) {
      cancelAnimation(v);
      v.set(rest);
      return;
    }
    v.set(0);
    v.set(withRepeat(withTiming(1, { duration: periodMs, easing: Easing.linear }), -1, false));
    return () => cancelAnimation(v);
  }, [animate, periodMs, rest, v]);
  return v;
}

const TAU = Math.PI * 2;

// ————————————————————————————————————————————————————— camadas

const fill = StyleSheet.absoluteFill;

/** Camada estática: um SVG do palco inteiro. */
export function Layer({ children, opacity = 1, style }: { children: ReactNode; opacity?: number; style?: StyleProp<ViewStyle> }) {
  const { px } = useFx();
  return (
    <View pointerEvents="none" style={[fill, { opacity }, style]}>
      <Svg width={px} height={px} viewBox={`0 0 ${STAGE} ${STAGE}`}>
        {children}
      </Svg>
    </View>
  );
}

/** Gira o conteúdo em torno do centro do palco. */
export function Spin({ period, reverse = false, opacity = 1, children }: { period: number; reverse?: boolean; opacity?: number; children: ReactNode }) {
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
export function Sway({
  period,
  degrees,
  phase = 0,
  glow,
  children,
}: {
  period: number;
  degrees: number;
  phase?: number;
  glow?: { period: number; opacity: [number, number]; phase?: number };
  children: ReactNode;
}) {
  const t = useLoop(period, 0.25);
  const g = useLoop(glow?.period ?? period, 0.25);
  const [o0, o1] = glow?.opacity ?? [1, 1];
  const gp = glow?.phase ?? 0;
  const s = useAnimatedStyle(() => {
    const k = 0.5 - 0.5 * Math.cos((g.value + gp) * TAU);
    return { opacity: o0 + (o1 - o0) * k, transform: [{ rotate: `${Math.sin((t.value + phase) * TAU) * degrees}deg` }] };
  });
  return (
    <Animated.View pointerEvents="none" style={[fill, s]}>
      <Layer>{children}</Layer>
    </Animated.View>
  );
}

/** Respiração: escala e opacidade seguem uma senoide suave. */
export function Breathe({
  period,
  scale = [1, 1],
  opacity = [1, 1],
  phase = 0,
  children,
}: {
  period: number;
  scale?: [number, number];
  opacity?: [number, number];
  phase?: number;
  children: ReactNode;
}) {
  const t = useLoop(period, 0.25);
  const [s0, s1] = scale;
  const [o0, o1] = opacity;
  const s = useAnimatedStyle(() => {
    const k = 0.5 - 0.5 * Math.cos((t.value + phase) * TAU);
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
export function Wave({
  period,
  from,
  to,
  drawnAt,
  phase = 0,
  peak = 0.7,
  hold = 0,
  children,
}: {
  period: number;
  from: number;
  to: number;
  drawnAt: number;
  phase?: number;
  peak?: number;
  /** Fração do ciclo em que a onda descansa invisível (pulsos espaçados). */
  hold?: number;
  children: ReactNode;
}) {
  const t = useLoop(period, 0.35);
  const s = useAnimatedStyle(() => {
    const raw = (t.value + phase) % 1;
    const active = 1 - hold;
    if (raw > active) return { opacity: 0, transform: [{ scale: from / drawnAt }] };
    const u = raw / active;
    const r = from + (to - from) * u;
    const o = peak * Math.sin(Math.PI * Math.min(1, u * 1.15)) * (1 - u * 0.35);
    return { opacity: Math.max(0, o), transform: [{ scale: r / drawnAt }] };
  });
  return (
    <Animated.View pointerEvents="none" style={[fill, s]}>
      <Layer>{children}</Layer>
    </Animated.View>
  );
}

/** Acende e apaga numa janela do ciclo (arcos elétricos, runas). Suave: sem piscar rápido. */
export function Glimmer({ period, phase = 0, window = 0.35, peak = 1, children }: { period: number; phase?: number; window?: number; peak?: number; children: ReactNode }) {
  const t = useLoop(period, 0.5);
  const s = useAnimatedStyle(() => {
    const u = (t.value + phase) % 1;
    const o = u < window ? Math.sin((u / window) * Math.PI) : 0;
    return { opacity: o * peak };
  });
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
  /** Desloca a fase de todas as partículas (caudas de cometa). */
  phaseShift?: number;
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
}

export function Particles(spec: ParticleSpec) {
  const { px } = useFx();
  const n = useCount(spec.count);
  const clock = useLoop(spec.period, 0.3);
  const unit = px / STAGE;
  // Chaves primitivas: arrays literais mudam de identidade a cada render.
  const key = [n, spec.seed ?? 7, spec.mode, spec.size.join(), spec.radius.join(), (spec.arc ?? [0, 360]).join(), spec.colors.join(), spec.phaseShift ?? 0].join('|');
  const items = useMemo<P[]>(() => {
    const rnd = rand(spec.seed ?? 7);
    const [a0, a1] = spec.arc ?? [0, 360];
    return Array.from({ length: n }, (_, i) => {
      const d = spec.size[0] + (spec.size[1] - spec.size[0]) * rnd();
      return {
        phase: ((i + rnd() * 0.6) / n + (spec.phaseShift ?? 0) + 1) % 1,
        speed: spec.mode === 'orbit' ? 1 : 0.75 + rnd() * 0.5,
        angle: ((a0 + (a1 - a0) * ((i + rnd() * 0.8) / n) - 90) * Math.PI) / 180,
        r: spec.radius[0] + (spec.radius[1] - spec.radius[0]) * rnd(),
        r2: spec.radius[1],
        d,
        color: spec.colors[i % spec.colors.length],
        wobble: 2 + rnd() * 4,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return (
    <View pointerEvents="none" style={fill}>
      {items.map((p, i) => (
        <Particle key={i} p={p} clock={clock} spec={spec} unit={unit} />
      ))}
    </View>
  );
}

function Particle({ p, clock, spec, unit }: { p: P; clock: SharedValue<number>; spec: ParticleSpec; unit: number }) {
  const mode = spec.mode;
  const tilt = spec.tilt ?? 1;
  const plane = ((spec.plane ?? 0) * Math.PI) / 180;
  const travel = spec.travel ?? 30;
  const dir = spec.reverse ? -1 : 1;
  const alpha = spec.alpha ?? 1;
  const r0 = spec.radius[0];
  const s = useAnimatedStyle(() => {
    const u = (clock.value * p.speed + p.phase) % 1;
    let x = 0;
    let y = 0;
    let o = 1;
    let k = 1;
    if (mode === 'orbit') {
      const a = p.angle + dir * u * TAU;
      const ex = Math.cos(a) * p.r;
      const ey = Math.sin(a) * p.r * tilt;
      x = ex * Math.cos(plane) - ey * Math.sin(plane);
      y = ex * Math.sin(plane) + ey * Math.cos(plane);
      const depth = 0.5 + 0.5 * Math.sin(a);
      o = 0.35 + 0.65 * depth;
      k = 0.75 + 0.45 * depth;
    } else if (mode === 'radial') {
      const r = p.r + (p.r2 + 6 - p.r) * u;
      x = Math.cos(p.angle) * r;
      y = Math.sin(p.angle) * r;
      o = Math.sin(Math.PI * u);
      k = 1 - 0.4 * u;
    } else if (mode === 'converge') {
      const a = p.angle + dir * (1 - u) * 1.6;
      const r = p.r2 - (p.r2 - r0 * 0.4) * u;
      x = Math.cos(a) * r;
      y = Math.sin(a) * r;
      o = Math.sin(Math.PI * u);
      k = 1 - 0.5 * u;
    } else if (mode === 'rise' || mode === 'fall') {
      const sx = Math.cos(p.angle) * p.r;
      const sy = Math.sin(p.angle) * p.r;
      x = sx + Math.sin((u + p.phase) * TAU) * p.wobble;
      y = sy + (mode === 'rise' ? -1 : 1) * u * travel;
      o = Math.sin(Math.PI * u);
      k = 1 - 0.45 * u;
    } else {
      x = Math.cos(p.angle) * p.r;
      y = Math.sin(p.angle) * p.r;
      const w = Math.sin(u * TAU);
      o = w > 0 ? w * w : 0;
      k = 0.55 + 0.6 * o;
    }
    return {
      opacity: Math.max(0, o) * alpha,
      transform: [{ translateX: x * unit }, { translateY: y * unit }, { scale: k }, { rotate: '45deg' }],
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
  if (!spec.glow) return <Animated.View style={[base, s]} />;
  const g = d * 2.6;
  return (
    <Animated.View style={[{ position: 'absolute', left: C * unit - g / 2, top: C * unit - g / 2, width: g, height: g, alignItems: 'center', justifyContent: 'center' }, s]}>
      <View style={{ position: 'absolute', width: g, height: g, borderRadius: g / 2, backgroundColor: p.color, opacity: 0.22 }} />
      <View style={{ width: d, height: d, borderRadius: spec.sparkle ? d * 0.12 : d / 2, backgroundColor: p.color }} />
    </Animated.View>
  );
}
