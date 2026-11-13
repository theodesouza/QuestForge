/**
 * Primitivas de profundidade do Áster — o que faz o corpo parecer tridimensional sem 3D de verdade:
 *
 *  Orb      esfera sombreada (luz no alto à esquerda, borda escura, brilho de atmosfera) com uma
 *           textura de superfície que desliza por trás de um recorte circular: a esfera "gira".
 *  Plane    plano inclinado (achatado e girado). Tudo que é desenhado dentro dele vira elipse em
 *           perspectiva; `half` recorta a metade de trás ou a da frente, para o núcleo ficar no meio.
 *  Orbiter  um desenho pequeno que percorre uma órbita elíptica, crescendo quando vem para a frente
 *           e sumindo na passagem em que deveria estar do outro lado do núcleo.
 *
 * Custo: cada peça móvel é uma View com um bitmap do tamanho do desenho; só transform e opacity mudam
 * por quadro, no thread de UI. Worklets só usam números e funções marcadas com 'worklet'.
 *
 * Modo plano (`flat`: miniaturas e movimento reduzido): as mesmas peças viram grupos de um SVG único.
 */
import { useId, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import Svg, { Circle, ClipPath, Defs, Ellipse, G, RadialGradient, Rect, Stop } from 'react-native-svg';
import { C, STAGE, useFx, useLoop } from './engine';

const TAU = Math.PI * 2;
const fill = StyleSheet.absoluteFill;
const gid = (prefix: string, id: string) => `${prefix}${id.replace(/[^a-zA-Z0-9]/g, '')}`;

export type Half = 'back' | 'front' | 'both';

// ————————————————————————————————————————————————————— plano inclinado

interface PlaneProps {
  /** Giro do plano na tela, em graus (inclinação do eixo maior). */
  tilt?: number;
  /** Achatamento vertical: 1 = de frente (círculo), 0,3 = quase de perfil. */
  squash?: number;
  half?: Half;
  children: ReactNode;
}

/**
 * Tudo dentro do plano é desenhado "de cima" (um círculo de raio r em torno do centro do palco) e
 * aparece como elipse em perspectiva. A metade de trás é a de cima do desenho; a da frente, a de baixo.
 */
export function Plane({ tilt = -18, squash = 0.34, half = 'both', children }: PlaneProps) {
  const { px, flat } = useFx();
  const id = gid('pl', useId());
  if (flat) {
    const t = `rotate(${tilt} ${C} ${C}) translate(${C} ${C}) scale(1 ${squash}) translate(${-C} ${-C})`;
    if (half === 'both') return <G transform={t}>{children}</G>;
    return (
      <G transform={t}>
        <Defs>
          <ClipPath id={id}>
            <Rect x={0} y={half === 'back' ? 0 : C} width={STAGE} height={C} />
          </ClipPath>
        </Defs>
        <G clipPath={`url(#${id})`}>{children}</G>
      </G>
    );
  }
  const h = px / 2;
  return (
    <View pointerEvents="none" style={[fill, { transform: [{ rotate: `${tilt}deg` }, { scaleY: squash }] }]}>
      <View style={{ position: 'absolute', left: 0, top: half === 'front' ? h : 0, width: px, height: half === 'both' ? px : h, overflow: 'hidden' }}>
        <View style={{ position: 'absolute', left: 0, top: half === 'front' ? -h : 0, width: px, height: px }}>{children}</View>
      </View>
    </View>
  );
}

// ————————————————————————————————————————————————————— esfera

export interface OrbProps {
  /** Raio, em unidades do palco. */
  r: number;
  /** Cores do corpo: face iluminada, meio e sombra. */
  lit: string;
  mid: string;
  dark: string;
  /** Textura da superfície, desenhada num ladrilho de lado 2r (0..2r) que se repete na horizontal. */
  surface?: ReactNode;
  /** Tempo de uma volta da superfície (ms). 0 = parada. */
  spin?: number;
  spinReverse?: boolean;
  surfaceOpacity?: number;
  /** Segunda camada (nuvens), acima da superfície e em outra velocidade: dá paralaxe. */
  clouds?: ReactNode;
  cloudSpin?: number;
  cloudOpacity?: number;
  /** Escuro da borda (0 = sem sombra de esfera: corpos que emitem luz, como estrelas). */
  limb?: number;
  /** Brilho de atmosfera em volta (cor) e o quanto ele se espalha. */
  atmosphere?: string | null;
  atmosphereSize?: number;
  /** Reflexo especular (vidro, gelo, metal). */
  gloss?: number;
  /** Corpo translúcido (uma redoma): mostra o que for desenhado antes dela. */
  glass?: boolean;
  /** Respiração do corpo inteiro (estrelas variáveis). */
  pulse?: { period: number; scale: [number, number] };
  cx?: number;
  cy?: number;
  /** Conteúdo desenhado DENTRO da esfera (entre o corpo e os reflexos): o que a redoma guarda. */
  children?: ReactNode;
}

function breathe(t: number): number {
  'worklet';
  return 0.5 - 0.5 * Math.cos(t * TAU);
}

/** Corpo esférico. Não é filho de `Layer`: ele monta as próprias camadas. */
export function Orb(p: OrbProps) {
  const { px, flat } = useFx();
  const uid = useId();
  const { r, cx = C, cy = C } = p;
  const body = gid('ob', uid);
  const shade = gid('os', uid);
  const atmo = gid('oa', uid);
  const clip = gid('oc', uid);
  const limb = p.limb ?? 0.62;
  const pad = p.atmosphere ? r * (p.atmosphereSize ?? 0.45) : 2;
  const R = r + pad;

  const defs = (
    <Defs>
      <RadialGradient id={body} cx="36%" cy="32%" r="78%">
        <Stop offset="0" stopColor={p.lit} stopOpacity={p.glass ? 0.2 : 1} />
        <Stop offset="0.5" stopColor={p.mid} stopOpacity={p.glass ? 0.1 : 1} />
        <Stop offset="1" stopColor={p.dark} stopOpacity={p.glass ? 0.34 : 1} />
      </RadialGradient>
      <RadialGradient id={shade} cx="34%" cy="30%" r="80%">
        <Stop offset="0" stopColor="#FFFFFF" stopOpacity={p.glass ? 0.12 : 0.22} />
        <Stop offset="0.42" stopColor="#FFFFFF" stopOpacity={0} />
        <Stop offset="0.72" stopColor="#000000" stopOpacity={limb * 0.45} />
        <Stop offset="1" stopColor="#000000" stopOpacity={limb} />
      </RadialGradient>
      {p.atmosphere ? (
        <RadialGradient id={atmo} cx="50%" cy="50%" r="50%">
          <Stop offset={(r / R) * 0.86} stopColor={p.atmosphere} stopOpacity={0} />
          <Stop offset={r / R} stopColor={p.atmosphere} stopOpacity={0.55} />
          <Stop offset={(r / R) * 1.12 > 0.99 ? 0.99 : (r / R) * 1.12} stopColor={p.atmosphere} stopOpacity={0.2} />
          <Stop offset="1" stopColor={p.atmosphere} stopOpacity={0} />
        </RadialGradient>
      ) : null}
    </Defs>
  );
  const gloss = p.gloss ?? 0;
  const top = (
    <>
      {limb > 0 || p.glass ? <Circle cx={cx} cy={cy} r={r} fill={`url(#${shade})`} /> : null}
      {gloss > 0 ? (
        <>
          <Ellipse cx={cx - r * 0.4} cy={cy - r * 0.5} rx={r * 0.26} ry={r * 0.1} fill="#FFFFFF" fillOpacity={gloss * 0.9} transform={`rotate(-36 ${cx - r * 0.4} ${cy - r * 0.5})`} />
          <Ellipse cx={cx - r * 0.62} cy={cy - r * 0.2} rx={r * 0.05} ry={r * 0.13} fill="#FFFFFF" fillOpacity={gloss * 0.5} transform={`rotate(-18 ${cx - r * 0.62} ${cy - r * 0.2})`} />
          <Circle cx={cx + r * 0.46} cy={cy + r * 0.52} r={r * 0.05} fill="#FFFFFF" fillOpacity={gloss * 0.5} />
        </>
      ) : null}
      {p.glass ? <Circle cx={cx} cy={cy} r={r - 0.6} stroke="#FFFFFF" strokeOpacity={0.34} strokeWidth={1.1} fill="none" /> : null}
    </>
  );

  if (flat) {
    return (
      <G>
        {defs}
        <Defs>
          <ClipPath id={clip}>
            <Circle cx={cx} cy={cy} r={r} />
          </ClipPath>
        </Defs>
        {p.atmosphere ? <Circle cx={cx} cy={cy} r={R} fill={`url(#${atmo})`} /> : null}
        <Circle cx={cx} cy={cy} r={r} fill={`url(#${body})`} />
        {p.surface ? (
          <G clipPath={`url(#${clip})`} opacity={p.surfaceOpacity ?? 1}>
            <G transform={`translate(${cx - r - r * 0.6} ${cy - r})`}>{p.surface}</G>
            <G transform={`translate(${cx + r - r * 0.6} ${cy - r})`}>{p.surface}</G>
          </G>
        ) : null}
        {p.clouds ? (
          <G clipPath={`url(#${clip})`} opacity={p.cloudOpacity ?? 0.8}>
            <G transform={`translate(${cx - r - r * 1.1} ${cy - r})`}>{p.clouds}</G>
            <G transform={`translate(${cx + r - r * 1.1} ${cy - r})`}>{p.clouds}</G>
          </G>
        ) : null}
        {p.children}
        {top}
      </G>
    );
  }

  const unit = px / STAGE;
  const box = { position: 'absolute' as const, left: (cx - R) * unit, top: (cy - R) * unit, width: 2 * R * unit, height: 2 * R * unit };
  const vb = `${cx - R} ${cy - R} ${2 * R} ${2 * R}`;
  const inner = (
    <>
      <View pointerEvents="none" style={box}>
        <Svg width={2 * R * unit} height={2 * R * unit} viewBox={vb}>
          {defs}
          {p.atmosphere ? <Circle cx={cx} cy={cy} r={R} fill={`url(#${atmo})`} /> : null}
          <Circle cx={cx} cy={cy} r={r} fill={`url(#${body})`} />
        </Svg>
      </View>
      {p.surface ? <Surface r={r} cx={cx} cy={cy} unit={unit} period={p.spin ?? 0} reverse={!!p.spinReverse} opacity={p.surfaceOpacity ?? 1} art={p.surface} /> : null}
      {p.clouds ? <Surface r={r} cx={cx} cy={cy} unit={unit} period={p.cloudSpin ?? 0} reverse={!!p.spinReverse} opacity={p.cloudOpacity ?? 0.8} art={p.clouds} /> : null}
      {p.children}
      <View pointerEvents="none" style={box}>
        <Svg width={2 * R * unit} height={2 * R * unit} viewBox={vb}>
          {defs}
          {top}
        </Svg>
      </View>
    </>
  );
  return p.pulse ? <Pulse period={p.pulse.period} scale={p.pulse.scale}>{inner}</Pulse> : <>{inner}</>;
}

function Pulse({ period, scale, children }: { period: number; scale: [number, number]; children: ReactNode }) {
  const t = useLoop(period, 0.25);
  const [s0, s1] = scale;
  const s = useAnimatedStyle(() => ({ transform: [{ scale: s0 + (s1 - s0) * breathe(t.value) }] }));
  return (
    <Animated.View pointerEvents="none" style={[fill, s]}>
      {children}
    </Animated.View>
  );
}

/** A faixa de textura (duas cópias do ladrilho) deslizando atrás do recorte circular. */
function Surface({ r, cx, cy, unit, period, reverse, opacity, art }: { r: number; cx: number; cy: number; unit: number; period: number; reverse: boolean; opacity: number; art: ReactNode }) {
  const t = useLoop(Math.max(1, period), 0.3, period <= 0);
  const side = 2 * r * unit;
  const dir = reverse ? -1 : 1;
  const s = useAnimatedStyle(() => {
    // A janela mostra um ladrilho; a faixa anda um ladrilho por volta e recomeça sem emenda.
    const k = dir > 0 ? t.value : 1 - t.value;
    return { transform: [{ translateX: (k - 1) * side }] };
  });
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: (cx - r) * unit, top: (cy - r) * unit, width: side, height: side, borderRadius: side / 2, overflow: 'hidden', opacity }}>
      <Animated.View style={[{ position: 'absolute', left: 0, top: 0, width: side * 2, height: side }, s]}>
        <Svg width={side * 2} height={side} viewBox={`0 0 ${4 * r} ${2 * r}`}>
          <G>{art}</G>
          <G transform={`translate(${2 * r} 0)`}>{art}</G>
        </Svg>
      </Animated.View>
    </View>
  );
}

// ————————————————————————————————————————————————————— órbitas

export interface OrbiterProps {
  /** Raio da órbita e achatamento (1 = círculo de frente). */
  r: number;
  squash?: number;
  /** Giro do plano da órbita na tela, em graus. */
  plane?: number;
  period: number;
  /** Posição inicial na órbita, 0..1. */
  phase?: number;
  reverse?: boolean;
  /** Lado da caixa do desenho, em unidades do palco (o desenho usa 0..box, centro em box/2). */
  box: number;
  /** Qual passada está sendo desenhada. */
  half: 'back' | 'front';
  /** Escala [longe, perto]. */
  depth?: [number, number];
  /** O desenho acompanha a direção do movimento (cometas, peixes). */
  face?: boolean;
  /** Giro próprio: voltas por órbita. */
  roll?: number;
  /** Opacidade quando passa por trás (padrão 0,55: mais apagado ao longe). */
  farAlpha?: number;
  children: ReactNode;
}

function orbitPoint(t: number, phase: number, dir: number, r: number, squash: number, plane: number): { x: number; y: number; s: number; a: number } {
  'worklet';
  const a = (phase + dir * t) * TAU;
  const ex = Math.cos(a) * r;
  const ey = Math.sin(a) * r * squash;
  return { x: ex * Math.cos(plane) - ey * Math.sin(plane), y: ex * Math.sin(plane) + ey * Math.cos(plane), s: Math.sin(a), a };
}

/** Um corpo em órbita. Renderize duas vezes (half 'back' antes do núcleo, 'front' depois). */
export function Orbiter(p: OrbiterProps) {
  const { px, flat } = useFx();
  const { r, squash = 0.36, period, phase = 0, box, half, face = false, roll = 0 } = p;
  const plane = ((p.plane ?? -18) * Math.PI) / 180;
  const dir = p.reverse ? -1 : 1;
  const [d0, d1] = p.depth ?? [0.72, 1.12];
  const far = p.farAlpha ?? 0.55;
  const want = half === 'front' ? 1 : -1;
  const t = useLoop(period, 0, flat);

  const s = useAnimatedStyle(() => {
    const o = orbitPoint(t.value, phase, dir, r, squash, plane);
    const depth = 0.5 + 0.5 * o.s;
    const here = (o.s >= 0 ? 1 : -1) === want;
    const unit = px / STAGE;
    // Direção do movimento na tela (derivada da elipse), para quem "olha para a frente".
    const vx = -Math.sin(o.a) * r * dir;
    const vy = Math.cos(o.a) * r * squash * dir;
    const heading = face ? Math.atan2(vx * Math.sin(plane) + vy * Math.cos(plane), vx * Math.cos(plane) - vy * Math.sin(plane)) : 0;
    return {
      opacity: here ? (want > 0 ? 1 : far + (1 - far) * depth) : 0,
      transform: [{ translateX: o.x * unit }, { translateY: o.y * unit }, { scale: d0 + (d1 - d0) * depth }, { rotate: `${heading + roll * t.value * TAU}rad` }],
    };
  });

  if (flat) {
    const a = (phase + dir * 0.12) * TAU;
    const sn = Math.sin(a);
    if ((sn >= 0 ? 1 : -1) !== want) return null;
    const ex = Math.cos(a) * r;
    const ey = sn * r * squash;
    const x = ex * Math.cos(plane) - ey * Math.sin(plane);
    const y = ex * Math.sin(plane) + ey * Math.cos(plane);
    const k = d0 + (d1 - d0) * (0.5 + 0.5 * sn);
    return (
      <G opacity={want > 0 ? 1 : far} transform={`translate(${C + x - (box * k) / 2} ${C + y - (box * k) / 2}) scale(${k})`}>
        {p.children}
      </G>
    );
  }
  const unit = px / STAGE;
  const side = box * unit;
  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: C * unit - side / 2, top: C * unit - side / 2, width: side, height: side }, s]}>
      <Svg width={side} height={side} viewBox={`0 0 ${box} ${box}`}>
        {p.children}
      </Svg>
    </Animated.View>
  );
}

// ————————————————————————————————————————————————————— atos de uma passada (ignições, pulsos)

/** Um movimento de uma camada ao longo de um relógio 0→1 (uma passada). */
export interface Act {
  /** Janela do relógio em que a camada vive. */
  t0: number;
  t1: number;
  /** Raio (unidades do palco) no começo e no fim; o desenho é feito no raio `drawnAt`. */
  from: number;
  to: number;
  drawnAt: number;
  /** Giro total, em graus. */
  turn?: number;
  peak?: number;
  /** 0 = aparece e some em arco; 1 = nasce forte e apaga; -1 = cresce e some no fim. */
  shape?: number;
}

function actFrame(clock: number, a: Act): { o: number; s: number; r: number } {
  'worklet';
  const u = (clock - a.t0) / (a.t1 - a.t0);
  if (u <= 0 || u >= 1) return { o: 0, s: a.from / a.drawnAt, r: 0 };
  const e = 1 - (1 - u) * (1 - u) * (1 - u);
  const shape = a.shape ?? 0;
  const curve = shape > 0 ? 1 - u : shape < 0 ? u * (1 - u * u) * 2.6 : Math.sin(Math.PI * u);
  return { o: (a.peak ?? 1) * Math.max(0, Math.min(1, curve)), s: (a.from + (a.to - a.from) * e) / a.drawnAt, r: (a.turn ?? 0) * e };
}

/** Camada SVG do palco movida por um relógio externo de uma passada. */
export function ActLayer({ clock, act, children }: { clock: SharedValue<number>; act: Act; children: ReactNode }) {
  const { px, flat, poster } = useFx();
  const s = useAnimatedStyle(() => {
    const f = actFrame(clock.value, act);
    return { opacity: f.o, transform: [{ scale: f.s }, { rotate: `${f.r}deg` }] };
  });
  if (flat) {
    // Miniatura: uma fotografia do ato num instante fixo (o meio da sua janela, se o instante geral cair fora).
    if (poster === undefined) return null;
    const at = poster > act.t0 && poster < act.t1 ? poster : act.t0 + (act.t1 - act.t0) * 0.45;
    const f = actFrame(at, act);
    return (
      <G opacity={Math.max(0.35, f.o)} transform={`translate(${C} ${C}) scale(${f.s.toFixed(3)}) rotate(${f.r.toFixed(1)}) translate(${-C} ${-C})`}>
        {children}
      </G>
    );
  }
  return (
    <Animated.View pointerEvents="none" style={[fill, s]}>
      <Svg width={px} height={px} viewBox={`0 0 ${STAGE} ${STAGE}`}>
        {children}
      </Svg>
    </Animated.View>
  );
}
